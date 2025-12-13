import React, { useState, useEffect, useCallback } from 'react';
import
{
  Sparkles,
  Maximize2,
  Minimize2,
  FileCode,
  Search,
  X,
  Code,
  Eye,
  Zap,
  ArrowRight,
  Sun,
  Moon,
  Save,
  RotateCcw,
  RotateCw
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { INITIAL_FILES } from './constants';
import { TEMPLATES } from './templates';
import { FileNode, ChatMessage, AgentTask, AgentRole, Theme, SaveStatus, AgentOptions, TargetAgent } from './types';
import { FileTreeItem } from './components/FileTreeItem';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { ChatInterface } from './components/ChatInterface';

// --- Utilities ---
const generateId = () => Math.random().toString( 36 ).substr( 2, 9 );

// Helper to clean JSON string from Markdown code blocks
const cleanJson = ( text: string ) =>
{
  const jsonMatch = text.match( /```json\n([\s\S]*?)\n```/ ) || text.match( /```([\s\S]*?)```/ );
  let cleanText = jsonMatch ? jsonMatch[ 1 ] : text;
  cleanText = cleanText.trim();
  const firstBrace = cleanText.indexOf( '{' );
  const lastBrace = cleanText.lastIndexOf( '}' );
  if ( firstBrace !== -1 && lastBrace !== -1 )
  {
    cleanText = cleanText.substring( firstBrace, lastBrace + 1 );
  }
  return cleanText;
};

// --- AI Initialization ---
const ai = new GoogleGenAI( { apiKey: process.env.API_KEY } );

const EXAMPLE_PROMPTS = [
  "Build a modern calculator with history",
  "Create a kanban board with drag and drop",
  "Design a dashboard for analytics",
  "Make a responsive landing page for a SaaS"
];

// --- Empty State Component ---
const EmptyState = ( { onStart, onExampleClick, theme }: { onStart: () => void, onExampleClick: ( text: string ) => void, theme: Theme } ) => (
  <div className={ `h-full flex flex-col items-center justify-center text-center p-8 relative overflow-hidden ${ theme === 'dark' ? 'bg-[#1e1e2e]' : 'bg-gray-50' }` }>
    <div className={ `absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${ theme === 'dark' ? 'from-indigo-900/20 via-[#1e1e2e] to-[#1e1e2e]' : 'from-indigo-200/40 via-gray-50 to-gray-50' }` } />
    <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/20 animate-in zoom-in duration-700 relative z-10">
      <Zap className="w-12 h-12 text-white fill-white" />
    </div>
    <h1 className={ `text-4xl font-bold mb-4 relative z-10 tracking-tight ${ theme === 'dark' ? 'text-white' : 'text-gray-900' }` }>What shall we build?</h1>
    <p className={ `max-w-lg mb-10 leading-relaxed relative z-10 text-lg ${ theme === 'dark' ? 'text-gray-400' : 'text-gray-600' }` }>
      Your AI team is ready. I have an Architect, Developer, and QA specialist standing by to turn your idea into production-ready code.
    </p>

    <button
      onClick={ onStart }
      className={ `group relative z-10 inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold hover:scale-105 transition-all duration-200 shadow-xl mb-12 ${ theme === 'dark' ? 'bg-white text-black hover:shadow-[0_0_60px_rgba(255,255,255,0.3)]' : 'bg-gray-900 text-white hover:shadow-gray-400/50' }` }
    >
      <span>Start a New Task</span>
      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </button>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full relative z-10 animate-in slide-in-from-bottom-8 duration-700 delay-200">
      { EXAMPLE_PROMPTS.map( ( prompt, i ) => (
        <button
          key={ i }
          onClick={ () => onExampleClick( prompt ) }
          className={ `p-4 rounded-xl text-sm font-medium transition-all text-left border group ${ theme === 'dark' ? 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/20' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:shadow-md' }` }
        >
          <span className={ `block mb-1 text-xs opacity-50 ${ theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600' }` }>Example { i + 1 }</span>
          <span className="group-hover:text-indigo-500 transition-colors">"{ prompt }"</span>
        </button>
      ) ) }
    </div>
  </div>
);

export default function App ()
{
  // --- STATE ---
  const [ theme, setTheme ] = useState<Theme>( () =>
  {
    if ( typeof window !== 'undefined' )
    {
      return ( localStorage.getItem( 'symbiotic_theme' ) as Theme ) || 'dark';
    }
    return 'dark';
  } );

  const [ activeTab, setActiveTab ] = useState<'editor' | 'preview'>( 'editor' );

  const [ files, setFiles ] = useState<FileNode[]>( () =>
  {
    if ( typeof window !== 'undefined' )
    {
      const saved = localStorage.getItem( 'symbiotic_files' );
      if ( saved )
      {
        try
        {
          return JSON.parse( saved );
        } catch ( e )
        {
          console.error( "Failed to parse saved files", e );
        }
      }
    }
    return INITIAL_FILES;
  } );

  const [ activeFile, setActiveFile ] = useState<FileNode | null>( null );
  const [ zenMode, setZenMode ] = useState( false );
  const [ saveStatus, setSaveStatus ] = useState<SaveStatus>( 'saved' );

  const [ history, setHistory ] = useState<{ content: string, timestamp: number }[]>( [] );
  const [ historyIndex, setHistoryIndex ] = useState( -1 );

  const [ lastChordTime, setLastChordTime ] = useState( 0 );

  const [ messages, setMessages ] = useState<ChatMessage[]>( [] );
  const [ inputValue, setInputValue ] = useState( '' );
  const [ selectedAgent, setSelectedAgent ] = useState<TargetAgent>( 'team' );
  const [ tasks, setTasks ] = useState<AgentTask[]>( [] );
  const [ isProcessing, setIsProcessing ] = useState( false );

  const [ sidebarOpen, setSidebarOpen ] = useState( true );

  // --- RESIZE STATE ---
  const [ leftSidebarWidth, setLeftSidebarWidth ] = useState( 288 );
  const [ rightSidebarWidth, setRightSidebarWidth ] = useState( 400 );
  const [ isResizingLeft, setIsResizingLeft ] = useState( false );
  const [ isResizingRight, setIsResizingRight ] = useState( false );


  // --- EFFECTS ---

  useEffect( () =>
  {
    localStorage.setItem( 'symbiotic_theme', theme );
    document.body.className = theme === 'dark' ? 'bg-[#09090b]' : 'bg-gray-100';
  }, [ theme ] );

  useEffect( () =>
  {
    if ( saveStatus === 'saving' )
    {
      const timer = setTimeout( () =>
      {
        localStorage.setItem( 'symbiotic_files', JSON.stringify( files ) );
        setSaveStatus( 'saved' );
      }, 1000 );
      return () => clearTimeout( timer );
    }
  }, [ files, saveStatus ] );

  useEffect( () =>
  {
    const handleKeyDown = ( e: KeyboardEvent ) =>
    {
      if ( ( e.metaKey || e.ctrlKey ) && e.key.toLowerCase() === 'k' )
      {
        setLastChordTime( Date.now() );
      }
      if ( e.key.toLowerCase() === 'z' )
      {
        if ( Date.now() - lastChordTime < 1000 )
        {
          e.preventDefault();
          toggleZenMode();
        }
      }
      if ( e.key === 'Escape' && zenMode )
      {
        e.preventDefault();
        toggleZenMode();
      }
      if ( ( e.metaKey || e.ctrlKey ) && e.key.toLowerCase() === 's' )
      {
        e.preventDefault();
        setSaveStatus( 'saving' );
      }
    };

    window.addEventListener( 'keydown', handleKeyDown );
    return () => window.removeEventListener( 'keydown', handleKeyDown );
  }, [ lastChordTime, zenMode ] );

  useEffect( () =>
  {
    const handleMouseMove = ( e: MouseEvent ) =>
    {
      if ( isResizingLeft )
      {
        const newWidth = e.clientX;
        if ( newWidth > 160 && newWidth < 600 )
        {
          setLeftSidebarWidth( newWidth );
        }
      }
      if ( isResizingRight )
      {
        const newWidth = window.innerWidth - e.clientX;
        if ( newWidth > 250 && newWidth < 800 )
        {
          setRightSidebarWidth( newWidth );
        }
      }
    };

    const handleMouseUp = () =>
    {
      setIsResizingLeft( false );
      setIsResizingRight( false );
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if ( isResizingLeft || isResizingRight )
    {
      window.addEventListener( 'mousemove', handleMouseMove );
      window.addEventListener( 'mouseup', handleMouseUp );
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () =>
    {
      window.removeEventListener( 'mousemove', handleMouseMove );
      window.removeEventListener( 'mouseup', handleMouseUp );
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [ isResizingLeft, isResizingRight ] );

  // --- ACTIONS ---

  const toggleTheme = () =>
  {
    setTheme( prev => prev === 'dark' ? 'light' : 'dark' );
  };

  const toggleZenMode = () =>
  {
    setZenMode( prev =>
    {
      const next = !prev;
      if ( next ) setActiveTab( 'preview' );
      return next;
    } );
  };

  const updateFileContent = useCallback( ( newContent: string ) =>
  {
    if ( !activeFile ) return;

    const now = Date.now();
    setHistory( prev =>
    {
      const newHistory = prev.slice( 0, historyIndex + 1 );
      return [ ...newHistory, { content: newContent, timestamp: now } ];
    } );
    setHistoryIndex( prev => prev + 1 );

    const updatedFile = { ...activeFile, content: newContent };
    setActiveFile( updatedFile );
    setSaveStatus( 'saving' );

    setFiles( prev => prev.map( f =>
    {
      if ( f.children )
      {
        return {
          ...f,
          children: f.children.map( c => c.name === activeFile.name ? updatedFile : c )
        };
      }
      return f.name === activeFile.name ? updatedFile : f;
    } ) );
  }, [ activeFile, historyIndex ] );

  const handleSendMessage = async ( target: TargetAgent, options: AgentOptions ) =>
  {
    // Basic validation
    if ( !inputValue.trim() && !options.image ) return;

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: generateId(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
      attachment: options.image ? { type: 'image', content: options.image } : undefined
    };
    setMessages( prev => [ ...prev, userMsg ] );
    setInputValue( '' );
    setIsProcessing( true );

    const currentCode = activeFile ? activeFile.content : null;
    const userRequest = userMsg.text;
    const lowerRequest = userRequest.toLowerCase();

    // Check for specific app templates
    let templateKey: keyof typeof TEMPLATES | null = null;
    if ( lowerRequest.includes( 'calculator' ) || lowerRequest.includes( 'calc' ) ) templateKey = 'calculator';
    else if ( lowerRequest.includes( 'todo' ) || lowerRequest.includes( 'task list' ) ) templateKey = 'todo';
    else if ( lowerRequest.includes( 'login' ) || lowerRequest.includes( 'sign in' ) ) templateKey = 'login';

    try
    {
      // --- ARCHITECT STEP ---
      let architectPlan = "";
      if ( target === 'team' || target === 'architect' )
      {
        const taskId = generateId();
        setTasks( prev => [ ...prev, {
          id: taskId,
          title: options.useSearch ? "Research & Planning" : "Architecture Planning",
          status: 'active',
          assignedTo: 'architect'
        } ] );

        try
        {
          // CONFIGURE ARCHITECT MODEL
          let modelName = 'gemini-2.5-flash';
          let tools: any[] | undefined = undefined;
          let thinkingConfig: any = undefined;

          // 1. Thinking Mode (Overrides basic settings)
          if ( options.useThinking )
          {
            modelName = 'gemini-3-pro-preview';
            thinkingConfig = { thinkingBudget: 32768 };
          }
          // 2. Search Mode (Only if not Thinking, as per prompt instruction logic - though technically can coexist in some models, prompt says use Flash for Search)
          else if ( options.useSearch )
          {
            modelName = 'gemini-2.5-flash';
            tools = [ { googleSearch: {} } ];
          }
          // 3. Image Analysis (Must use Pro 3)
          else if ( options.image )
          {
            modelName = 'gemini-3-pro-preview';
          }

          // CONSTRUCT CONTENT
          const contents: any = options.image
            ? {
              parts: [
                { text: `User Request: ${ userRequest }.\nAnalyze this image and plan the implementation.` },
                { inlineData: { mimeType: 'image/png', data: options.image.split( ',' )[ 1 ] } }
              ]
            }
            : `User Request: ${ userRequest }. \n\nAct as a Senior Software Architect. Provide a concise technical plan.`;

          const response = await ai.models.generateContent( {
            model: modelName,
            contents: contents,
            config: {
              systemInstruction: "You are a pragmatic software architect. Analyze the request and propose a concise component structure and state management plan. Use Markdown formatting (bold key terms, bulleted lists).",
              tools: tools,
              thinkingConfig: thinkingConfig,
              // Do not set maxOutputTokens if thinking is enabled
            }
          } );

          architectPlan = response.text;

          const groundingUrls = response.candidates?.[ 0 ]?.groundingMetadata?.groundingChunks
            ?.map( ( c: any ) => c.web ? { title: c.web.title, uri: c.web.uri } : null )
            .filter( Boolean ) || [];

          setMessages( prev => [ ...prev, {
            id: generateId(),
            sender: 'agent',
            agentRole: 'architect',
            text: architectPlan,
            timestamp: new Date(),
            groundingUrls: groundingUrls.length > 0 ? groundingUrls : undefined
          } ] );

          setTasks( prev => prev.map( t => t.id === taskId ? { ...t, status: 'completed' } : t ) );
        } catch ( e )
        {
          console.error( "Architect failed", e );
          setTasks( prev => prev.map( t => t.id === taskId ? { ...t, status: 'failed' } : t ) );
        }
      }

      // --- DEVELOPER STEP ---
      let generatedCode = "";
      if ( target === 'team' || target === 'developer' )
      {
        const taskId = generateId();
        const isEdit = !!currentCode && ( lowerRequest.includes( 'change' ) || lowerRequest.includes( 'update' ) || lowerRequest.includes( 'fix' ) || lowerRequest.includes( 'edit' ) || lowerRequest.includes( 'add' ) );

        setTasks( prev => [ ...prev, {
          id: taskId,
          title: isEdit ? "Code Refactoring" : "Component Implementation",
          status: 'active',
          assignedTo: 'developer'
        } ] );

        try
        {
          let explanation = "I've written the code.";
          let filename = "Component.tsx";

          if ( templateKey && !isEdit && !options.useThinking )
          {
            const template = TEMPLATES[ templateKey ];
            generatedCode = template.content;
            filename = template.filename;
            explanation = `I've implemented the **${ templateKey }** using our best-practice template. It includes styles and basic functionality.`;
          } else
          {
            const systemPrompt = isEdit
              ? "You are a Senior React Developer. Modify the provided code based on the user request. Return JSON: { \"filename\": string, \"content\": string, \"explanation\": string }. The explanation should be brief and use Markdown."
              : "You are a Senior React Developer. Create a new React component based on the request. Return JSON: { \"filename\": string, \"content\": string, \"explanation\": string }. File name should end in .tsx. The explanation should be brief and use Markdown.";

            const prompt = isEdit
              ? `Current Code:\n\`\`\`tsx\n${ currentCode }\n\`\`\`\n\nRequest: ${ userRequest }`
              : `Architect Plan: ${ architectPlan }\nRequest: ${ userRequest }\n\nGenerate the React component. Use Tailwind CSS and lucide-react icons.`;

            // Developer uses Flash by default, or Pro if Thinking was used/requested for complex tasks
            const devModel = options.useThinking ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
            const devThinkingConfig = options.useThinking ? { thinkingBudget: 32768 } : undefined;

            const response = await ai.models.generateContent( {
              model: devModel,
              contents: prompt,
              config: {
                responseMimeType: "application/json",
                systemInstruction: systemPrompt,
                thinkingConfig: devThinkingConfig
              }
            } );

            try
            {
              const cleanResponse = cleanJson( response.text );
              const json = JSON.parse( cleanResponse );
              generatedCode = json.content;
              explanation = json.explanation || "Code generated successfully.";
              filename = json.filename || "Component.tsx";
            } catch ( jsonError )
            {
              console.error( "JSON Parse Error:", jsonError, response.text );
              throw new Error( "Failed to parse AI response" );
            }
          }

          setMessages( prev => [ ...prev, {
            id: generateId(),
            sender: 'agent',
            agentRole: 'developer',
            text: explanation,
            timestamp: new Date()
          } ] );

          const newFile: FileNode = {
            name: filename,
            type: 'file',
            language: 'typescript',
            isNew: true,
            content: generatedCode
          };

          if ( activeFile && isEdit )
          {
            updateFileContent( generatedCode );
          } else
          {
            setFiles( prev =>
            {
              const newFiles = [ ...prev ];
              if ( newFiles[ 0 ].children )
              {
                const idx = newFiles[ 0 ].children.findIndex( f => f.name === filename );
                if ( idx >= 0 ) newFiles[ 0 ].children.splice( idx, 1 );
                newFiles[ 0 ].children.push( newFile );
              }
              return newFiles;
            } );
            setActiveFile( newFile );
            setActiveTab( 'preview' );
            setHistory( [ { content: generatedCode, timestamp: Date.now() } ] );
            setHistoryIndex( 0 );
          }

          setTasks( prev => prev.map( t => t.id === taskId ? { ...t, status: 'completed' } : t ) );
        } catch ( e )
        {
          console.error( "Developer failed", e );
          setTasks( prev => prev.map( t => t.id === taskId ? { ...t, status: 'failed' } : t ) );
        }
      }

      // --- QA STEP ---
      if ( target === 'team' || target === 'qa' )
      {
        const codeToReview = generatedCode || currentCode || "";
        if ( codeToReview )
        {
          const taskId = generateId();
          setTasks( prev => [ ...prev, {
            id: taskId,
            title: "Quality Assurance",
            status: 'active',
            assignedTo: 'qa'
          } ] );

          try
          {
            const response = await ai.models.generateContent( {
              model: 'gemini-2.5-flash',
              contents: `Review this React code for errors, accessibility, and best practices. Keep it concise (max 2 sentences). Use Markdown to bold key findings. Code: ${ codeToReview.substring( 0, 2000 ) }...`,
            } );

            setMessages( prev => [ ...prev, {
              id: generateId(),
              sender: 'agent',
              agentRole: 'qa',
              text: response.text,
              timestamp: new Date()
            } ] );

            setTasks( prev => prev.map( t => t.id === taskId ? { ...t, status: 'completed' } : t ) );
          } catch ( e )
          {
            console.error( "QA failed", e );
            setTasks( prev => prev.map( t => t.id === taskId ? { ...t, status: 'failed' } : t ) );
          }
        }
      }

    } catch ( e )
    {
      console.error( e );
      setMessages( prev => [ ...prev, {
        id: generateId(),
        sender: 'system',
        text: "An error occurred while communicating with the AI agents.",
        timestamp: new Date()
      } ] );
    } finally
    {
      setIsProcessing( false );
    }
  };

  const handleUndo = () =>
  {
    if ( historyIndex > 0 )
    {
      const prevIndex = historyIndex - 1;
      const prevContent = history[ prevIndex ].content;
      setHistoryIndex( prevIndex );
      const updatedFile = { ...activeFile!, content: prevContent };
      setActiveFile( updatedFile );
      setFiles( prev => prev.map( f =>
      {
        if ( f.children )
        {
          return {
            ...f,
            children: f.children.map( c => c.name === activeFile!.name ? updatedFile : c )
          };
        }
        return f.name === activeFile!.name ? updatedFile : f;
      } ) );
    }
  };

  const handleRedo = () =>
  {
    if ( historyIndex < history.length - 1 )
    {
      const nextIndex = historyIndex + 1;
      const nextContent = history[ nextIndex ].content;
      setHistoryIndex( nextIndex );
      const updatedFile = { ...activeFile!, content: nextContent };
      setActiveFile( updatedFile );
      setFiles( prev => prev.map( f =>
      {
        if ( f.children )
        {
          return {
            ...f,
            children: f.children.map( c => c.name === activeFile!.name ? updatedFile : c )
          };
        }
        return f.name === activeFile!.name ? updatedFile : f;
      } ) );
    }
  };

  const focusInput = () =>
  {
    const el = document.querySelector( 'textarea' ) as HTMLTextAreaElement;
    if ( el ) el.focus();
  };

  const handleExampleClick = ( text: string ) =>
  {
    setInputValue( text );
    focusInput();
  };

  return (
    <div className={ `flex h-screen w-full font-sans overflow-hidden transition-colors duration-300 ${ theme === 'dark' ? 'bg-[#09090b] text-gray-100' : 'bg-gray-100 text-gray-900' }` }>

      {/* LEFT SIDEBAR (Navigation) */ }
      <div
        style={ { width: sidebarOpen ? leftSidebarWidth : 64 } }
        className={ `${ isResizingLeft ? '' : 'transition-all duration-300' } ${ theme === 'dark' ? 'bg-[#0e0e11] border-white/10' : 'bg-white border-gray-200' } border-r flex flex-col shrink-0 relative` }
      >
        {/* Resize Handle */ }
        <div
          className={ `absolute -right-1 top-0 bottom-0 w-2 cursor-col-resize z-50 hover:bg-indigo-500/50 transition-colors ${ isResizingLeft ? 'bg-indigo-500/50' : '' }` }
          onMouseDown={ ( e ) => { e.preventDefault(); setIsResizingLeft( true ); } }
        />
        <div className={ `h-14 flex items-center px-4 border-b ${ theme === 'dark' ? 'border-white/5' : 'border-gray-100' } gap-3` }>
          <div className="p-1.5 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/20 cursor-pointer" onClick={ () => setActiveFile( null ) }>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          { sidebarOpen && (
            <span className={ `text-lg font-bold tracking-tight animate-in fade-in ${ theme === 'dark' ? 'text-gray-200' : 'text-gray-800' }` }>
              Symbiotic
            </span>
          ) }
        </div>

        { sidebarOpen ? (
          <div className="flex-1 overflow-auto py-6">
            <div className="px-5 mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Explorer</span>
              <div className="flex gap-2">
                <button className={ `p-1 rounded hover:bg-gray-500/10 ${ theme === 'dark' ? 'text-gray-400' : 'text-gray-500' }` }><FileCode className="w-3.5 h-3.5" /></button>
                <button className={ `p-1 rounded hover:bg-gray-500/10 ${ theme === 'dark' ? 'text-gray-400' : 'text-gray-500' }` }><Search className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            { files.map( node => (
              <FileTreeItem
                key={ node.name }
                node={ node }
                onSelect={ ( file ) =>
                {
                  setActiveFile( file );
                  setHistory( [ { content: file.content || '', timestamp: Date.now() } ] );
                  setHistoryIndex( 0 );
                } }
                activeFileName={ activeFile?.name }
                theme={ theme }
              />
            ) ) }
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center py-6 gap-6">
            <div className="w-8 h-8 rounded-md hover:bg-indigo-500/10 flex items-center justify-center cursor-pointer transition-colors">
              <FileCode className="w-4 h-4 text-gray-500" />
            </div>
            <div className="w-8 h-8 rounded-md hover:bg-indigo-500/10 flex items-center justify-center cursor-pointer transition-colors">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        ) }

        <div className={ `p-3 border-t ${ theme === 'dark' ? 'border-white/5' : 'border-gray-100' } space-y-2` }>
          <button
            onClick={ toggleTheme }
            className={ `w-full flex items-center justify-center p-2 rounded-md transition-colors ${ theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100' }` }
          >
            { theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" /> }
            { sidebarOpen && <span className="ml-2 text-xs font-medium">{ theme === 'dark' ? 'Light Mode' : 'Dark Mode' }</span> }
          </button>

          <button
            onClick={ () => setSidebarOpen( !sidebarOpen ) }
            className={ `w-full flex items-center justify-center p-2 rounded-md transition-colors ${ theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100' }` }
          >
            { sidebarOpen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" /> }
          </button>
        </div>
      </div>

      {/* CENTER (Editor/Preview) */ }
      <div className={ `flex-1 flex flex-col min-w-0 ${ theme === 'dark' ? 'bg-[#1e1e2e]' : 'bg-[#f8fafc]' }` }>
        {/* Tab Bar */ }
        <div className={ `h-14 border-b flex items-center justify-between px-4 shrink-0 ${ theme === 'dark' ? 'bg-[#09090b] border-white/10' : 'bg-white border-gray-200' }` }>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            { activeFile ? (
              <div className={ `flex items-center gap-2 px-4 py-2 rounded-t-lg text-xs font-medium border-t-2 border-indigo-500 animate-in fade-in duration-200 select-none min-w-[120px] max-w-[200px] ${ theme === 'dark' ? 'bg-[#1e1e2e] text-gray-200' : 'bg-[#f8fafc] text-gray-800 border-gray-200' }` }>
                <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{ activeFile.name }</span>
                <div
                  className={ `ml-auto p-0.5 rounded-md cursor-pointer group ${ theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-200' }` }
                  onClick={ ( e ) => { e.stopPropagation(); setActiveFile( null ); } }
                >
                  <X className="w-3 h-3 text-gray-500 group-hover:text-red-500" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 text-gray-500 text-xs italic select-none">
                <span className="w-2 h-2 rounded-full bg-gray-500" />
                No active file
              </div>
            ) }
          </div>

          <div className="flex items-center gap-3">
            { activeFile && (
              <div className={ `flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium transition-all ${ saveStatus === 'saving' ? 'bg-yellow-500/10 text-yellow-500' :
                saveStatus === 'saved' ? 'bg-green-500/10 text-green-500' :
                  'bg-gray-500/10 text-gray-500'
                }` }>
                { saveStatus === 'saving' ? <Zap className="w-3 h-3 animate-pulse" /> : <Save className="w-3 h-3" /> }
                <span>{ saveStatus === 'saving' ? 'Saving...' : 'Saved' }</span>
              </div>
            ) }

            { activeFile && (
              <div className={ `flex p-1 rounded-lg border shrink-0 ${ theme === 'dark' ? 'bg-[#18181b] border-white/10' : 'bg-gray-100 border-gray-200' }` }>
                <button
                  onClick={ () => setActiveTab( 'editor' ) }
                  className={ `flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${ activeTab === 'editor' ? ( theme === 'dark' ? 'bg-[#27272a] text-white shadow-sm' : 'bg-white text-black shadow-sm' ) : 'text-gray-500 hover:text-gray-300' }` }
                >
                  <Code className="w-3.5 h-3.5" />
                  Editor
                </button>
                <button
                  onClick={ () => setActiveTab( 'preview' ) }
                  className={ `flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${ activeTab === 'preview' ? ( theme === 'dark' ? 'bg-[#27272a] text-white shadow-sm' : 'bg-white text-black shadow-sm' ) : 'text-gray-500 hover:text-gray-300' }` }
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
              </div>
            ) }
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          { !activeFile ? (
            <EmptyState onStart={ focusInput } onExampleClick={ handleExampleClick } theme={ theme } />
          ) : (
            activeTab === 'editor' ? (
              <Editor
                file={ activeFile }
                onChange={ updateFileContent }
                theme={ theme }
                onUndo={ handleUndo }
                onRedo={ handleRedo }
                canUndo={ historyIndex > 0 }
                canRedo={ historyIndex < history.length - 1 }
              />
            ) : (
              <Preview
                file={ activeFile }
                zenMode={ zenMode }
                onToggleZen={ toggleZenMode }
                theme={ theme }
              />
            )
          ) }
        </div>
      </div>

      {/* RIGHT SIDEBAR (AI Chat) */ }
      <div
        style={ { width: rightSidebarWidth } }
        className={ `border-l flex flex-col shadow-2xl z-20 shrink-0 relative ${ theme === 'dark' ? 'bg-[#111116] border-white/10' : 'bg-white border-gray-200' }` }
      >
        {/* Resize Handle */ }
        <div
          className={ `absolute -left-1 top-0 bottom-0 w-2 cursor-col-resize z-50 hover:bg-indigo-500/50 transition-colors ${ isResizingRight ? 'bg-indigo-500/50' : '' }` }
          onMouseDown={ ( e ) => { e.preventDefault(); setIsResizingRight( true ); } }
        />
        <ChatInterface
          messages={ messages }
          inputValue={ inputValue }
          setInputValue={ setInputValue }
          onSendMessage={ handleSendMessage }
          isProcessing={ isProcessing }
          tasks={ tasks }
          theme={ theme }
          selectedAgent={ selectedAgent }
          setSelectedAgent={ setSelectedAgent }
        />
      </div>
    </div>
  );
}