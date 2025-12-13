# GitHub Copilot Instructions for Symbiotic IDE

## Project Overview
Symbiotic IDE is a next-generation AI-powered Integrated Development Environment where users collaborate with specialized AI agents (Architect, Developer, QA) to build software. The application is built as a web-based IDE with real-time code editing, preview capabilities, and AI-assisted development.

## Technology Stack
- **Frontend Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS (utility-first CSS framework)
- **Icons**: lucide-react
- **AI Integration**: Google Generative AI (@google/genai) with Gemini models
- **Language**: TypeScript 5.8.2

## Architecture
### AI Agent System
The application uses three specialized AI agents:
1. **Architect Agent**: Plans component structure and state management
2. **Developer Agent**: Implements React components based on plans
3. **QA Agent**: Reviews code for errors, accessibility, and best practices

### Key Components
- `App.tsx`: Main application orchestration, AI agent coordination
- `components/Editor.tsx`: Code editor interface
- `components/Preview.tsx`: Live preview of generated components
- `components/ChatInterface.tsx`: AI chat interface for user interaction
- `components/FileTreeItem.tsx`: File explorer tree view
- `types.ts`: TypeScript type definitions
- `constants.ts`: Initial file structures and constants
- `templates.ts`: Pre-built component templates

## Coding Conventions

### TypeScript
- Use strict TypeScript with explicit types
- Prefer interfaces for object types (e.g., `FileNode`, `ChatMessage`, `AgentTask`)
- Use type aliases for union types (e.g., `AgentRole`, `Theme`)
- Enable `jsx: "react-jsx"` for JSX transformation

### React
- Use functional components with hooks
- Use `useState` for local state management
- Use `useEffect` for side effects (localStorage, keyboard shortcuts)
- Use `useCallback` for memoized functions
- Props should be typed with TypeScript interfaces

### Styling
- Use Tailwind CSS utility classes for all styling
- Apply theme-aware classes using conditional logic: `${theme === 'dark' ? 'bg-[#1e1e2e]' : 'bg-gray-50'}`
- Use custom color palette defined in Tailwind config for brand colors
- Prefer Tailwind animations: `animate-in`, `fade-in`, `slide-in-from-bottom`

### State Management
- Use React's built-in state management (useState, useEffect)
- Persist state to localStorage for:
  - Theme preference (`symbiotic_theme`)
  - File tree state (`symbiotic_files`)
- Use controlled components for forms and inputs

### AI Integration
- Use Google Generative AI SDK with Gemini models
- Model selection based on task:
  - `gemini-2.5-flash`: Fast responses for Architect and QA
  - `gemini-3-pro-preview`: Complex tasks with thinking mode or image analysis
- Clean JSON responses from AI using `cleanJson` utility
- Handle AI errors gracefully with try-catch blocks

### File Organization
- Keep components in `/components` directory
- Export types from `types.ts`
- Store constants in `constants.ts`
- Store templates in `templates.ts`

### Best Practices
- Always handle loading and error states for AI operations
- Provide visual feedback for async operations (task status indicators)
- Use debouncing for autosave (1 second delay)
- Support keyboard shortcuts (Cmd/Ctrl+K+Z for zen mode, Cmd/Ctrl+S for save)
- Implement undo/redo with history tracking
- Make UI responsive and accessible
- Use semantic HTML elements
- Provide meaningful aria-labels for accessibility

### Code Style
- Use 2-space indentation
- Use single quotes for strings (except JSX attributes)
- Add blank lines between logical sections
- Group imports: React, third-party, local
- Use descriptive variable and function names
- Add comments for complex logic only

### Testing & Building
- Run `npm run dev` for development server
- Run `npm run build` for production build
- Run `npm run preview` to preview production build
- Set `GEMINI_API_KEY` in `.env.local` for AI features

## Common Patterns

### Theme Toggle
```typescript
const [theme, setTheme] = useState<Theme>('dark');
const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
```

### AI Agent Tasks
```typescript
const taskId = generateId();
setTasks(prev => [...prev, {
  id: taskId,
  title: "Task Title",
  status: 'active',
  assignedTo: 'architect'
}]);
```

### File Updates
```typescript
const updateFileContent = useCallback((newContent: string) => {
  const updatedFile = { ...activeFile, content: newContent };
  setActiveFile(updatedFile);
  setFiles(prev => prev.map(f => /* update logic */));
}, [activeFile]);
```

## Security Considerations
- Never commit API keys to version control
- Use environment variables for sensitive data (`.env.local`)
- Validate and sanitize AI-generated code before execution
- Use proper error boundaries for React components

## Performance Guidelines
- Use React.memo for expensive renders
- Implement virtual scrolling for large file trees
- Debounce autosave operations
- Lazy load preview iframes
- Minimize re-renders with proper dependency arrays

## Accessibility
- Provide keyboard navigation for all features
- Use semantic HTML elements
- Include ARIA labels for icon-only buttons
- Ensure sufficient color contrast in both themes
- Support screen readers with proper markup
