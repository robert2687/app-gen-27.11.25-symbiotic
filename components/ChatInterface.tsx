import React, { useEffect, useRef, useState } from 'react';
import { 
  User, 
  Bot, 
  Loader2, 
  MessageSquare, 
  Send, 
  CheckCircle,
  Users,
  Hexagon,
  Terminal,
  Shield,
  Copy,
  Check
} from 'lucide-react';
import { ChatMessage, AgentTask, AgentRole, Theme } from '../types';

// --- Text Formatting Utilities ---

const FormattedText: React.FC<{ text: string; theme: Theme }> = ({ text, theme }) => {
  // Regex to match code blocks: ```lang\ncode```
  // Capturing groups: 1=lang, 2=code
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  
  // Split text by code blocks
  const parts = text.split(codeBlockRegex);

  return (
    <div className="space-y-3">
      {parts.map((part, i) => {
        // The split result pattern with capturing groups is:
        // [0]: text before
        // [1]: lang (group 1)
        // [2]: code (group 2)
        // [3]: text after (which becomes text before for next match)
        // ... and so on.
        
        // Render Text Segments (index 0, 3, 6...)
        if (i % 3 === 0) {
          if (!part.trim()) return null;
          return <div key={i} className="whitespace-pre-wrap leading-relaxed">{renderInline(part, theme)}</div>;
        }

        // Skip Language Segments (index 1, 4, 7...) - they are used in the next block
        if (i % 3 === 1) return null;

        // Render Code Blocks (index 2, 5, 8...)
        const lang = parts[i - 1];
        const code = part;
        
        return (
          <div key={i} className={`rounded-lg overflow-hidden border my-2 ${theme === 'dark' ? 'border-white/10 bg-[#1e1e2e]' : 'border-gray-200 bg-gray-50'}`}>
            <div className={`px-3 py-1.5 text-[10px] font-mono border-b flex items-center justify-between ${theme === 'dark' ? 'border-white/5 text-gray-400 bg-white/5' : 'border-gray-200 text-gray-500 bg-gray-100'}`}>
               <span className="uppercase">{lang || 'code'}</span>
            </div>
            <pre className="p-3 overflow-x-auto text-xs font-mono custom-scrollbar">
              <code className={theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'}>{code.trim()}</code>
            </pre>
          </div>
        );
      })}
    </div>
  );
};

// Helper to render inline markdown: **bold**, `code`
const renderInline = (text: string, theme: Theme) => {
  // Split by bold: **text**
  const boldRegex = /\*\*(.*?)\*\*/g;
  const parts = text.split(boldRegex);
  
  return parts.map((part, i) => {
    // Odd indices are bold text
    if (i % 2 === 1) {
      return <strong key={i} className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{part}</strong>;
    }
    
    // Split by inline code: `text`
    const codeRegex = /`([^`]+)`/g;
    const subParts = part.split(codeRegex);
    
    return subParts.map((sub, j) => {
      // Odd indices are inline code
      if (j % 2 === 1) {
        return (
          <code 
            key={`${i}-${j}`} 
            className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-medium border mx-0.5 ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}
          >
            {sub}
          </code>
        );
      }
      return <span key={`${i}-${j}`}>{sub}</span>;
    });
  });
};

// --- Chat Bubble Component ---
const ChatBubble: React.FC<{ message: ChatMessage, theme: Theme }> = ({ message, theme }) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-6">
        <span className="text-[10px] uppercase tracking-wider font-semibold bg-white/5 text-gray-500 px-3 py-1 rounded-full border border-white/5">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 mb-6 animate-in slide-in-from-bottom-2 duration-300 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-sm
        ${isUser ? 'bg-indigo-500/20 border-indigo-500/30' : 
          message.agentRole === 'architect' ? 'bg-purple-500/20 border-purple-500/30' :
          message.agentRole === 'developer' ? 'bg-blue-500/20 border-blue-500/30' :
          'bg-orange-500/20 border-orange-500/30'}
      `}>
        {isUser ? <User className="w-4 h-4 text-indigo-400" /> : <Bot className={`w-4 h-4 ${
          message.agentRole === 'architect' ? 'text-purple-400' :
          message.agentRole === 'developer' ? 'text-blue-400' : 'text-orange-400'
        }`} />}
      </div>
      
      <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-bold text-gray-400">
            {isUser ? 'You' : `${message.agentRole?.charAt(0).toUpperCase()}${message.agentRole?.slice(1)}`}
          </span>
          <span className="text-[10px] text-gray-600">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className={`
          px-4 py-3 rounded-2xl text-sm shadow-sm min-w-[200px]
          ${isUser 
            ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/10' 
            : `${theme === 'dark' ? 'bg-[#27272a] text-gray-200 border-white/5' : 'bg-white text-gray-800 border-gray-200'} border rounded-tl-none`}
        `}>
          {isUser ? (
             <div className="whitespace-pre-wrap">{message.text}</div>
          ) : (
             <FormattedText text={message.text} theme={theme} />
          )}
        </div>
      </div>
    </div>
  );
};

// --- Agent Selector Types & Data ---
type TargetAgent = 'team' | AgentRole;

const AGENT_OPTIONS: { id: TargetAgent; label: string; icon: React.ReactNode; color: string; placeholder: string }[] = [
  { 
    id: 'team', 
    label: 'Team', 
    icon: <Users className="w-3.5 h-3.5" />, 
    color: 'bg-indigo-500', 
    placeholder: "Describe what you want to build..." 
  },
  { 
    id: 'architect', 
    label: 'Architect', 
    icon: <Hexagon className="w-3.5 h-3.5" />, 
    color: 'bg-purple-500', 
    placeholder: "Ask about structure, design patterns, or requirements..." 
  },
  { 
    id: 'developer', 
    label: 'Developer', 
    icon: <Terminal className="w-3.5 h-3.5" />, 
    color: 'bg-blue-500', 
    placeholder: "Ask for code, specific components, or implementation details..." 
  },
  { 
    id: 'qa', 
    label: 'QA', 
    icon: <Shield className="w-3.5 h-3.5" />, 
    color: 'bg-orange-500', 
    placeholder: "Ask to run tests, check for bugs, or verify accessibility..." 
  },
];

// --- Main Chat Interface Props ---
interface ChatInterfaceProps {
  messages: ChatMessage[];
  inputValue: string;
  setInputValue: (val: string) => void;
  onSendMessage: (target: TargetAgent) => void;
  isProcessing: boolean;
  tasks: AgentTask[];
  theme: Theme;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  inputValue,
  setInputValue,
  onSendMessage,
  isProcessing,
  tasks,
  theme
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [selectedAgent, setSelectedAgent] = useState<TargetAgent>('team');

  // Auto-scroll logic
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, tasks]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage(selectedAgent);
    }
  };

  const currentAgent = AGENT_OPTIONS.find(a => a.id === selectedAgent) || AGENT_OPTIONS[0];

  return (
    <div className={`flex flex-col h-full ${theme === 'dark' ? 'bg-[#111116]' : 'bg-[#f8fafc]'}`}>
      {/* Header */}
      <div className={`h-14 border-b flex items-center justify-between px-5 shrink-0 ${theme === 'dark' ? 'bg-[#111116] border-white/5' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2.5">
          <div className="relative">
             <div className={`w-2.5 h-2.5 rounded-full ${isProcessing ? 'bg-indigo-500 animate-ping absolute opacity-75' : ''}`} />
             <div className={`w-2.5 h-2.5 rounded-full relative ${isProcessing ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
          </div>
          <div>
            <span className={`font-semibold text-sm block leading-tight ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>AI Team</span>
            <span className="text-[10px] text-gray-500 block leading-tight">Gemini 2.0 Flash</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className={`flex-1 overflow-y-auto p-5 space-y-2 custom-scrollbar ${theme === 'dark' ? 'bg-[#111116]' : 'bg-[#f8fafc]'}`}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-200/50'}`}>
               <MessageSquare className="w-8 h-8 stroke-1 text-gray-400" />
            </div>
            <p className="text-sm font-medium">Chat with the AI to start building</p>
            <p className="text-xs mt-1">Try "Build a login form"</p>
          </div>
        ) : (
          messages.map(m => <ChatBubble key={m.id} message={m} theme={theme} />)
        )}
        
        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 ml-4 mt-2 animate-pulse bg-indigo-500/10 w-fit px-3 py-1.5 rounded-full">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>AI agents are thinking...</span>
          </div>
        )}
      </div>

      {/* Active Tasks/Plan (Sticky at bottom of chat) */}
      {tasks.length > 0 && (
        <div className={`border-t shrink-0 ${theme === 'dark' ? 'border-white/10 bg-[#0e0e11]' : 'border-gray-200 bg-white'}`}>
           <div className={`px-4 py-2 flex items-center justify-between cursor-help border-b ${theme === 'dark' ? 'bg-[#18181b] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Plan & Progress</span>
             <span className="text-[10px] text-indigo-400 font-mono">
                {Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)}%
             </span>
           </div>
           <div className="max-h-32 overflow-y-auto p-2 space-y-1 custom-scrollbar">
             {tasks.map(task => (
               <div key={task.id} className={`flex items-center gap-3 text-xs p-2 rounded transition-colors group ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                 {task.status === 'completed' ? (
                   <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                 ) : task.status === 'active' ? (
                   <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin shrink-0" />
                 ) : (
                   <div className="w-3.5 h-3.5 rounded-full border border-gray-600 shrink-0 group-hover:border-gray-400" />
                 )}
                 <div className="flex-1 min-w-0">
                   <p className={`truncate ${task.status === 'completed' ? 'text-gray-500 line-through' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                     {task.title}
                   </p>
                 </div>
                 <span className={`
                    text-[9px] px-1.5 py-0.5 rounded capitalize font-medium border
                    ${task.assignedTo === 'architect' ? 'text-purple-400 border-purple-500/20 bg-purple-500/10' :
                      task.assignedTo === 'developer' ? 'text-blue-400 border-blue-500/20 bg-blue-500/10' : 
                      'text-orange-400 border-orange-500/20 bg-orange-500/10'}
                 `}>
                   {task.assignedTo.slice(0,3)}
                 </span>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Input Area */}
      <div className={`p-4 border-t shrink-0 ${theme === 'dark' ? 'border-white/10 bg-[#111116]' : 'border-gray-200 bg-white'}`}>
        
        {/* Agent Selector */}
        <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
          {AGENT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSelectedAgent(opt.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                ${selectedAgent === opt.id 
                  ? `${opt.color} text-white border-transparent shadow-lg shadow-${opt.color.replace('bg-', '')}/20` 
                  : `${theme === 'dark' ? 'bg-[#1e1e24] text-gray-400 border-white/5 hover:bg-white/5 hover:border-white/10' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
              `}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>

        <div className="relative group">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={currentAgent.placeholder}
            className={`w-full border rounded-xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none h-[60px] transition-all placeholder:text-gray-500 ${theme === 'dark' ? 'bg-[#1e1e24] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white'}`}
          />
          <button 
            onClick={() => onSendMessage(selectedAgent)}
            disabled={!inputValue.trim() || isProcessing}
            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};