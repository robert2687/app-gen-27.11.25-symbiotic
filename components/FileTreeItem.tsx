import React, { useState } from 'react';
import { ChevronRight, FileCode, Box } from 'lucide-react';
import { FileNode, Theme } from '../types';

interface FileTreeItemProps {
  node: FileNode;
  depth?: number;
  onSelect: (node: FileNode) => void;
  activeFileName?: string;
  theme: Theme;
}

export const FileTreeItem: React.FC<FileTreeItemProps> = ({ 
  node, 
  depth = 0, 
  onSelect, 
  activeFileName,
  theme
}) => {
  const [isOpen, setIsOpen] = useState(node.isOpen || false);
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    } else {
      onSelect(node);
    }
  };

  const isSelected = activeFileName === node.name;

  return (
    <div className="select-none">
      <div 
        onClick={handleClick}
        className={`
          flex items-center gap-2 py-1.5 px-3 cursor-pointer transition-all border-l-2
          ${isSelected 
            ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500 font-medium' 
            : `border-transparent ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
        `}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
      >
        <span className="flex items-center justify-center w-4 h-4 shrink-0">
          {node.type === 'folder' && (
             <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
          )}
        </span>
        
        {node.type === 'folder' ? (
          <Box className="w-4 h-4 text-blue-400 shrink-0" />
        ) : (
          <FileCode className={`w-4 h-4 shrink-0 ${node.name.endsWith('css') ? 'text-blue-400' : node.name.endsWith('json') ? 'text-emerald-500' : 'text-yellow-500'}`} />
        )}
        
        <span className="text-sm truncate">{node.name}</span>
        
        {node.isNew && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
        )}
      </div>
      
      {node.type === 'folder' && isOpen && node.children && (
        <div className="animate-in slide-in-from-top-1 duration-200">
          {node.children.map((child) => (
            <FileTreeItem 
              key={child.name} 
              node={child} 
              depth={depth + 1} 
              onSelect={onSelect} 
              activeFileName={activeFileName} 
              theme={theme}
            />
          ))}
        </div>
      )}
    </div>
  );
};