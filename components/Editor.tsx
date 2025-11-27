import React from 'react';
import { FileNode, Theme } from '../types';
import { RotateCcw, RotateCw, AlignLeft, Search } from 'lucide-react';

interface EditorProps {
  file: FileNode | null;
  onChange: (val: string) => void;
  theme: Theme;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const Editor: React.FC<EditorProps> = ({ file, onChange, theme, onUndo, onRedo, canUndo, canRedo }) => {
  if (!file) return null;
  
  const lineCount = (file.content || '').split('\n').length;
  
  const handleFormat = () => {
    // Simple mock formatting: remove trailing whitespace and ensure newline at end
    if (file.content) {
      const formatted = file.content
        .split('\n')
        .map(line => line.trimEnd())
        .join('\n')
        .trim() + '\n';
      onChange(formatted);
    }
  };

  return (
    <div className={`h-full flex flex-col font-mono text-sm ${theme === 'dark' ? 'bg-[#1e1e2e]' : 'bg-white'}`}>
      
      {/* Editor Toolbar */}
      <div className={`h-9 border-b flex items-center px-4 justify-between shrink-0 ${theme === 'dark' ? 'bg-[#1e1e2e] border-white/5' : 'bg-white border-gray-100'}`}>
         <div className="flex items-center gap-1">
            <button 
              onClick={onUndo} 
              disabled={!canUndo}
              className={`p-1 rounded transition-colors ${!canUndo ? 'opacity-30 cursor-not-allowed' : 'hover:bg-indigo-500/10 hover:text-indigo-500'}`}
              title="Undo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={onRedo} 
              disabled={!canRedo}
              className={`p-1 rounded transition-colors ${!canRedo ? 'opacity-30 cursor-not-allowed' : 'hover:bg-indigo-500/10 hover:text-indigo-500'}`}
              title="Redo"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
         </div>
         <div className="flex items-center gap-2">
            <button 
              onClick={handleFormat}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              <AlignLeft className="w-3 h-3" />
              Format
            </button>
         </div>
      </div>

      <div className="flex-1 overflow-auto relative custom-scrollbar group">
        {/* Line Numbers */}
        <div 
          className={`absolute left-0 top-4 bottom-0 w-12 text-right pr-4 select-none text-[13px] font-medium opacity-50 z-10 ${theme === 'dark' ? 'text-gray-600 bg-[#1e1e2e]' : 'text-gray-300 bg-white'}`}
        >
          {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
            <div key={i} className="leading-6 h-6">{i + 1}</div>
          ))}
        </div>

        {/* Text Area */}
        <textarea 
          className={`w-full min-h-full bg-transparent resize-none focus:outline-none pl-16 pt-4 pr-4 leading-6 font-ligatures text-[13px] tab-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}
          value={file.content || ''}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
      
      <div className={`h-6 border-t flex items-center px-4 text-xs justify-end gap-4 select-none ${theme === 'dark' ? 'bg-[#18181b] border-white/5 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
        <span>Ln {lineCount}, Col 1</span>
        <span>UTF-8</span>
        <span>{file.language?.toUpperCase() || 'TXT'}</span>
      </div>
    </div>
  );
};