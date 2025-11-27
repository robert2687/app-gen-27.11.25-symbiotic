import React, { useState } from 'react';
import { CheckCircle, Eye, RefreshCw, Maximize2, Minimize2, Check, Trash2, Plus, Delete, Equal, User, Lock, ArrowRight, Calendar, Layout } from 'lucide-react';
import { FileNode, Theme } from '../types';

interface PreviewProps {
  file: FileNode | null;
  zenMode?: boolean;
  onToggleZen?: () => void;
  theme: Theme;
}

// --- MOCK APPS ---

const MockCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperator = (op: string) => {
    const current = parseFloat(display);
    if (prevValue === null) setPrevValue(current);
    else if (operator) {
      const result = calculate(prevValue, current, operator);
      setPrevValue(result);
      setDisplay(String(result));
    }
    setOperator(op);
    setNewNumber(true);
  };

  const calculate = (a: number, b: number, op: string) => {
    switch(op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return a / b;
      default: return b;
    }
  };

  const handleEqual = () => {
    if (operator && prevValue !== null) {
      const current = parseFloat(display);
      const result = calculate(prevValue, current, operator);
      setDisplay(String(result));
      setPrevValue(null);
      setOperator(null);
      setNewNumber(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setNewNumber(true);
  };

  const Button = ({ children, onClick, variant = 'default', className = '' }: any) => (
    <button
      onClick={onClick}
      className={`
        h-14 rounded-xl text-lg font-bold transition-all active:scale-95 flex items-center justify-center shadow-sm
        ${variant === 'primary' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 
          variant === 'secondary' ? 'bg-gray-200 text-gray-900 hover:bg-gray-300' :
          variant === 'accent' ? 'bg-orange-500 text-white hover:bg-orange-600' :
          'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'}
        ${className}
      `}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full max-w-[320px] bg-white p-5 rounded-[2rem] shadow-2xl border border-gray-200">
        <div className="mb-5 px-4 py-6 bg-gray-900 rounded-2xl text-right shadow-inner">
          <span className="text-gray-400 text-xs h-4 block mb-1">{prevValue} {operator}</span>
          <span className="text-3xl text-white font-mono tracking-wider overflow-x-auto block">{display}</span>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          <Button onClick={clear} variant="secondary" className="col-span-2 text-red-500">AC</Button>
          <Button onClick={() => handleNumber(display.slice(0,-1))} variant="secondary"><Delete className="w-5 h-5" /></Button>
          <Button onClick={() => handleOperator('÷')} variant="accent">÷</Button>
          {['7','8','9'].map(n => <Button key={n} onClick={() => handleNumber(n)}>{n}</Button>)}
          <Button onClick={() => handleOperator('×')} variant="accent">×</Button>
          {['4','5','6'].map(n => <Button key={n} onClick={() => handleNumber(n)}>{n}</Button>)}
          <Button onClick={() => handleOperator('-')} variant="accent">-</Button>
          {['1','2','3'].map(n => <Button key={n} onClick={() => handleNumber(n)}>{n}</Button>)}
          <Button onClick={() => handleOperator('+')} variant="accent">+</Button>
          <Button onClick={() => handleNumber('0')} className="col-span-2">0</Button>
          <Button onClick={() => handleNumber('.')}>.</Button>
          <Button onClick={handleEqual} variant="primary"><Equal className="w-6 h-6" /></Button>
        </div>
    </div>
  );
};

const MockTodoList = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Review PRs', completed: true },
    { id: 2, text: 'Deploy to Prod', completed: false },
    { id: 3, text: 'Team Sync', completed: false },
  ]);
  const [input, setInput] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: input, completed: false }]);
    setInput('');
  };

  return (
    <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-[500px] border border-gray-100">
      <div className="bg-indigo-600 p-6 text-white relative">
        <Layout className="absolute top-2 right-2 opacity-20 w-16 h-16" />
        <h2 className="text-2xl font-bold">Tasks</h2>
        <p className="text-indigo-100 text-sm mt-1">{tasks.filter(t => !t.completed).length} remaining</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {tasks.map(t => (
          <div key={t.id} className="group flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all">
            <button 
              onClick={() => setTasks(tasks.map(x => x.id === t.id ? { ...x, completed: !x.completed } : x))}
              className={`w-5 h-5 rounded-full border flex items-center justify-center ${t.completed ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'}`}
            >
              {t.completed && <Check className="w-3 h-3 text-white" />}
            </button>
            <span className={`flex-1 text-sm ${t.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{t.text}</span>
            <button onClick={() => setTasks(tasks.filter(x => x.id !== t.id))} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <form onSubmit={addTask} className="p-4 bg-gray-50 border-t">
        <div className="relative">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            className="w-full pl-4 pr-10 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
            placeholder="Add task..." 
          />
          <button type="submit" className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
        </div>
      </form>
    </div>
  );
};

const MockLogin = () => (
  <div className="w-full max-w-[340px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
    <div className="bg-indigo-600 p-6 text-center">
       <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
         <User className="w-6 h-6 text-white" />
       </div>
       <h3 className="font-bold text-white text-lg">Welcome Back</h3>
    </div>
    <div className="p-6 space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500">Email</label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="user@example.com" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input type="password" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••" />
        </div>
      </div>
      <button className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-black transition-colors">
        Sign In <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const Preview: React.FC<PreviewProps> = ({ file, zenMode = false, onToggleZen, theme }) => {
  
  const renderPreviewContent = () => {
    if (!file) return null;
    const name = file.name.toLowerCase();
    
    if (name.includes('calc')) return <MockCalculator />;
    if (name.includes('todo')) return <MockTodoList />;
    if (name.includes('login') || name.includes('auth')) return <MockLogin />;
    
    // Default Generic Preview
    return (
       <div className={`
         bg-white p-8 rounded-2xl shadow-2xl border max-w-sm w-full text-center transition-all duration-700
         ${zenMode ? 'scale-110 shadow-[0_0_100px_rgba(0,0,0,0.1)]' : 'scale-100'}
         ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200/60'}
         animate-in zoom-in-95 slide-in-from-bottom-4
       `}>
         <div className="w-20 h-20 bg-gradient-to-tr from-green-50 to-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-white">
           <CheckCircle className="w-10 h-10" />
         </div>
         <h3 className="font-bold text-2xl mb-2 text-gray-900 tracking-tight">Component Rendered</h3>
         <p className="text-sm text-gray-500 mb-8 leading-relaxed">
           Successfully compiled <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 font-semibold">{file.name}</span>
         </p>
         
         <div className="p-5 bg-slate-50/80 backdrop-blur-sm rounded-xl text-xs text-left font-mono text-slate-600 overflow-hidden border border-slate-200/60 mb-8 shadow-sm">
           <div className="flex justify-between mb-3 border-b border-slate-200/60 pb-2 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
             <span>Prop Name</span>
             <span>Value</span>
           </div>
           <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="font-medium">display</span>
                <span className="text-blue-600 bg-blue-50 px-1.5 rounded">"flex"</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">theme</span>
                <span className="text-purple-600 bg-purple-50 px-1.5 rounded">"system"</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">interactive</span>
                <span className="text-emerald-600 bg-emerald-50 px-1.5 rounded">true</span>
              </div>
           </div>
         </div>
         
         <button className="w-full py-3.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all text-sm font-bold shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 group">
           <span>Interact with Component</span>
           <Eye className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
         </button>
       </div>
    );
  };

  return (
    <div className={`
      h-full flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
      ${zenMode ? 'fixed inset-0 z-50' : 'relative'}
      ${theme === 'dark' ? 'bg-[#1e1e2e]' : 'bg-white'}
    `}>
      {/* Floating Exit Button for Zen Mode */}
      {zenMode && (
        <div className="absolute top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-700">
          <button 
            onClick={onToggleZen}
            className="group flex items-center gap-2 px-5 py-2.5 bg-gray-900/90 hover:bg-black text-white rounded-full shadow-2xl backdrop-blur-md transition-all hover:scale-105 border border-white/10"
            aria-label="Exit Zen Mode"
          >
            <Minimize2 className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors" />
            <span className="text-sm font-semibold tracking-wide">Exit Zen Mode</span>
            <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-mono text-gray-300">ESC</span>
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className={`
        border-b flex items-center px-4 gap-4 transition-all duration-500 overflow-hidden
        ${zenMode ? 'h-0 opacity-0 border-0' : 'h-10 opacity-100'}
        ${theme === 'dark' ? 'bg-[#18181b] border-white/5' : 'bg-gray-50 border-gray-200'}
      `}>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500/20"/>
          <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500/20"/>
          <div className="w-3 h-3 rounded-full bg-green-400 border border-green-500/20"/>
        </div>
        <div className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md border shadow-sm mx-2 ${theme === 'dark' ? 'bg-[#111116] border-white/5' : 'bg-white border-gray-200'}`}>
            <span className="text-gray-400">
                <RefreshCw className="w-3.5 h-3.5" />
            </span>
            <span className={`text-xs font-sans flex-1 truncate select-all ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                localhost:3000/{file?.name.replace(/\.[^/.]+$/, "").toLowerCase() || ''}
            </span>
        </div>
        
        {/* Zen Mode Toggle (Toolbar) */}
        {onToggleZen && (
          <div className={`pl-2 border-l ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
             <button 
               onClick={onToggleZen}
               className={`p-1.5 rounded transition-colors group relative ${theme === 'dark' ? 'text-gray-400 hover:text-indigo-400 hover:bg-white/5' : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
               aria-label="Enter Zen Mode"
             >
               <Maximize2 className="w-4 h-4" />
             </button>
          </div>
        )}
      </div>

      {/* Preview Canvas */}
      <div className={`flex-1 flex items-center justify-center p-8 overflow-hidden relative pattern-grid-lg ${theme === 'dark' ? 'bg-[#09090b]' : 'bg-slate-50'}`}>
         {file ? renderPreviewContent() : (
           <div className="text-gray-400 flex flex-col items-center animate-in fade-in duration-500">
             <div className={`w-20 h-20 rounded-3xl shadow-xl border flex items-center justify-center mb-6 ${theme === 'dark' ? 'bg-[#18181b] border-white/5' : 'bg-white border-gray-100'}`}>
                <Eye className="w-8 h-8 opacity-30 text-gray-500" />
             </div>
             <p className="font-semibold text-gray-500 text-lg">No preview available</p>
             <p className="text-sm text-gray-400 mt-2">Select a file to view render</p>
           </div>
         )}
      </div>
    </div>
  );
};