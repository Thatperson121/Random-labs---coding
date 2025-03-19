import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Loader } from 'lucide-react';
import { useStore } from '../store/useStore';

export function CodeEditor() {
  const collaborators = useStore((state) => state.collaborators);
  const project = useStore((state) => state.project);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');

  const runCode = async () => {
    setIsRunning(true);
    try {
      // Create a sandbox environment for code execution
      const sandbox = document.createElement('iframe');
      sandbox.style.display = 'none';
      document.body.appendChild(sandbox);
      
      const sandboxContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              canvas { border: 1px solid black; }
            </style>
          </head>
          <body>
            <div id="output"></div>
            <canvas id="game" width="400" height="400"></canvas>
            <script>
              const originalConsoleLog = console.log;
              console.log = (...args) => {
                originalConsoleLog.apply(console, args);
                window.parent.postMessage({
                  type: 'console',
                  content: args.map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                  ).join(' ')
                }, '*');
              };
              ${project?.code || ''}
            </script>
          </body>
        </html>
      `;

      sandbox.srcdoc = sandboxContent;

      const handleMessage = (event) => {
        if (event.data.type === 'console') {
          setOutput(prev => prev + event.data.content + '\n');
        }
      };

      window.addEventListener('message', handleMessage);

      // Cleanup after 10 seconds
      setTimeout(() => {
        window.removeEventListener('message', handleMessage);
        document.body.removeChild(sandbox);
      }, 10000);
    } catch (error) {
      setOutput(prev => prev + `Error: ${error.message}\n`);
    }
    setIsRunning(false);
  };

  return (
    <div className="h-full relative flex flex-col">
      <div className="bg-gray-800 p-2 flex justify-between items-center">
        <div className="text-white font-medium">
          {project?.name || 'Untitled Project'}
        </div>
        <button
          onClick={runCode}
          disabled={isRunning}
          className="bg-green-600 text-white px-4 py-1.5 rounded flex items-center space-x-2 hover:bg-green-700 disabled:opacity-50"
        >
          {isRunning ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>Run</span>
        </button>
      </div>

      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage={project?.language.toLowerCase() || 'javascript'}
          defaultValue={project?.code || '// Start coding here'}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
        
        {collaborators.map((user) => 
          user.cursor && (
            <div
              key={user.id}
              className="absolute pointer-events-none"
              style={{
                top: `${user.cursor.line * 20}px`,
                left: `${user.cursor.column * 8}px`,
                backgroundColor: user.color,
                width: '2px',
                height: '18px',
              }}
            >
              <div
                className="absolute top-0 left-0 text-xs px-2 py-1 rounded whitespace-nowrap"
                style={{ backgroundColor: user.color }}
              >
                {user.name}
              </div>
            </div>
          )
        )}
      </div>

      {output && (
        <div className="bg-gray-900 text-white p-4 h-32 overflow-auto font-mono text-sm">
          <div className="font-bold mb-2">Output:</div>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
}