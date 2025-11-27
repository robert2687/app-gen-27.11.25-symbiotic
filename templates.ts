export const TEMPLATES = {
  login: {
    filename: 'Login.tsx',
    content: `import React, { useState } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-indigo-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-indigo-200 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="you@company.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
              <span className="text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-semibold hover:bg-black transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="animate-pulse">Signing in...</span>
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Don't have an account? <a href="#" className="text-indigo-600 font-semibold hover:underline">Create one</a>
          </p>
        </div>
      </div>
    </div>
  );
}`
  },
  calculator: {
    filename: 'Calculator.tsx',
    content: `import React, { useState } from 'react';
import { Delete, Equal } from 'lucide-react';

export default function Calculator() {
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
    
    if (prevValue === null) {
      setPrevValue(current);
    } else if (operator) {
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
      className={\`
        h-16 rounded-2xl text-xl font-bold transition-all active:scale-95 flex items-center justify-center shadow-sm
        \${variant === 'primary' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 
          variant === 'secondary' ? 'bg-gray-200 text-gray-900 hover:bg-gray-300' :
          variant === 'accent' ? 'bg-orange-500 text-white hover:bg-orange-600' :
          'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'}
        \${className}
      \`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-[2rem] shadow-2xl border border-white/50">
        <div className="mb-6 px-4 py-8 bg-gray-900 rounded-3xl text-right shadow-inner">
          <span className="text-gray-400 text-sm h-6 block mb-1">
            {prevValue} {operator}
          </span>
          <span className="text-4xl text-white font-mono tracking-wider overflow-x-auto block">
            {display}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <Button onClick={clear} variant="secondary" className="col-span-2 text-red-500">AC</Button>
          <Button onClick={() => handleNumber(display.substring(0, display.length -1))} variant="secondary"><Delete className="w-5 h-5" /></Button>
          <Button onClick={() => handleOperator('÷')} variant="accent">÷</Button>

          <Button onClick={() => handleNumber('7')}>7</Button>
          <Button onClick={() => handleNumber('8')}>8</Button>
          <Button onClick={() => handleNumber('9')}>9</Button>
          <Button onClick={() => handleOperator('×')} variant="accent">×</Button>

          <Button onClick={() => handleNumber('4')}>4</Button>
          <Button onClick={() => handleNumber('5')}>5</Button>
          <Button onClick={() => handleNumber('6')}>6</Button>
          <Button onClick={() => handleOperator('-')} variant="accent">-</Button>

          <Button onClick={() => handleNumber('1')}>1</Button>
          <Button onClick={() => handleNumber('2')}>2</Button>
          <Button onClick={() => handleNumber('3')}>3</Button>
          <Button onClick={() => handleOperator('+')} variant="accent">+</Button>

          <Button onClick={() => handleNumber('0')} className="col-span-2">0</Button>
          <Button onClick={() => handleNumber('.')}>.</Button>
          <Button onClick={handleEqual} variant="primary"><Equal className="w-6 h-6" /></Button>
        </div>
      </div>
    </div>
  );
}`
  },
  todo: {
    filename: 'TodoList.tsx',
    content: `import React, { useState } from 'react';
import { Plus, Check, Trash2, Calendar, Layout } from 'lucide-react';

export default function TodoApp() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Review PRs from AI Team', completed: true, category: 'Work' },
    { id: 2, text: 'Update system documentation', completed: false, category: 'Docs' },
    { id: 3, text: 'Plan next sprint', completed: false, category: 'Planning' },
  ]);
  const [input, setInput] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTasks([...tasks, { 
      id: Date.now(), 
      text: input, 
      completed: false, 
      category: 'General' 
    }]);
    setInput('');
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const activeCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Layout className="w-32 h-32" />
          </div>
          <h1 className="text-3xl font-bold relative z-10">My Tasks</h1>
          <p className="text-indigo-100 mt-2 relative z-10 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm font-medium bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {activeCount} tasks remaining
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {tasks.length === 0 ? (
             <div className="text-center py-10 text-gray-400">
               <p>All caught up! 🎉</p>
             </div>
          ) : tasks.map(task => (
            <div 
              key={task.id}
              className={\`group flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 hover:shadow-md \${task.completed ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-100'}\`}
            >
              <button 
                onClick={() => toggleTask(task.id)}
                className={\`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors \${task.completed ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 hover:border-indigo-500'}\`}
              >
                {task.completed && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={\`text-sm font-medium truncate transition-all \${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}\`}>
                  {task.text}
                </p>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">{task.category}</span>
              </div>

              <button 
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={addTask} className="p-4 bg-gray-50 border-t border-gray-100">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a new task..."
              className="w-full pl-5 pr-12 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-lg flex items-center justify-center transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}`
  },
  generic: {
    filename: 'Component.tsx',
    content: `import React from 'react';

export default function Component() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Generated Component</h1>
      <p className="text-gray-600">Start editing to see changes.</p>
    </div>
  );
}`
  }
};