import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import { Play, Loader, StopCircle, Terminal, Maximize2, Minimize2, X } from 'lucide-react';
import { useStore } from '../store/useStore';

type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'html' | 'css' | 'json';

interface LanguageConfig {
  defaultCode: string;
  runnerTemplate: (code: string) => string;
  preloadedLibraries?: string[];
}

const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  javascript: {
    defaultCode: `// Welcome to Random Labs JavaScript!
console.log("Hello from JavaScript!");
document.write("Hello on the page!");`,
    runnerTemplate: (code: string) => `
      ${code}
    `,
    preloadedLibraries: [
      'react', 'react-dom', 'lodash', 'axios', 'moment', 'jquery', 'd3'
    ]
  },
  typescript: {
    defaultCode: `// Welcome to Random Labs TypeScript!
const greeting: string = "Hello from TypeScript!";
console.log(greeting);
document.write(greeting);`,
    runnerTemplate: (code: string) => `
      ${code}
    `,
    preloadedLibraries: [
      'react', 'react-dom', 'lodash', 'axios', 'moment'
    ]
  },
  python: {
    defaultCode: `# Welcome to Random Labs Python!
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import random
import pygame

# Create some data
data = np.random.randn(100)
df = pd.DataFrame({'values': data})

# Print summary statistics
print(df.describe())

# Random module example
random_numbers = [random.randint(1, 100) for _ in range(10)]
print("Random numbers:", random_numbers)

# Example Pygame code (uncomment to try)
'''
# Initialize pygame
pygame.init()

# Set up the display
screen = pygame.display.set_mode((800, 600))
pygame.display.set_caption("My Pygame Window")

# Game loop
running = True
clock = pygame.time.Clock()

# Player position
x, y = 400, 300
speed = 5

while running:
    # Handle events
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    
    # Move with arrow keys
    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT]:
        x -= speed
    if keys[pygame.K_RIGHT]:
        x += speed
    if keys[pygame.K_UP]:
        y -= speed
    if keys[pygame.K_DOWN]:
        y += speed
    
    # Draw everything
    screen.fill((0, 0, 0))
    pygame.draw.circle(screen, (255, 0, 0), (x, y), 30)
    
    # Update the display
    pygame.display.flip()
    clock.tick(60)
'''

# You can also import many other libraries:
# - scipy, sklearn, tensorflow, pytorch
# - pygame, random, requests, django
# - and many more!`,
    runnerTemplate: (code: string) => `
      // Load Pyodide
      async function initPython() {
        document.write("<div>Loading Python environment...</div>");
        let pyodide = await loadPyodide();
        
        // Preload common packages
        document.write("<div>Loading libraries (numpy, pandas, matplotlib)...</div>");
        try {
          await pyodide.loadPackagesFromImports(\`${code}\`);
          document.write("<div>Running your code...</div>");
          
          // Set up proxy for matplotlib
          await pyodide.runPythonAsync(\`
            import sys
            import io
            sys.stdout = io.StringIO()
            import micropip
            
            try:
              import matplotlib
              matplotlib.use('Agg')
              import matplotlib.pyplot as plt
              import base64
              from io import BytesIO

              # Redirect matplotlib output to web
              def show_plot():
                buf = BytesIO()
                plt.savefig(buf, format='png')
                buf.seek(0)
                img_str = base64.b64encode(buf.read()).decode('utf-8')
                sys.stdout.write(f"<img src='data:image/png;base64,{img_str}' />")
                plt.close()
              
              # Override plt.show to capture output
              plt.show = show_plot
            except Exception as e:
              pass
          \`);
          
          // Run the user code
          let output = await pyodide.runPythonAsync(\`
            try:
              ${code}
              sys.stdout.getvalue()
            except Exception as e:
              sys.stdout.write(str(e))
              sys.stdout.getvalue()
          \`);
          
          document.write("<pre>" + output + "</pre>");
        } catch (error) {
          console.error(error);
          document.write("<div class='error'>Error: " + error.message + "</div>");
        }
      }
      
      // Start Python execution
      initPython();
    `,
    preloadedLibraries: [
      'numpy', 'pandas', 'matplotlib', 'scipy', 'scikit-learn', 
      'tensorflow', 'pytorch', 'requests', 'beautifulsoup4', 'flask', 'django',
      'pygame', 'random'
    ]
  },
  java: {
    defaultCode: `// Welcome to Random Labs Java!
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}`,
    runnerTemplate: (code: string) => `
      // Using Java compiler API when available
      document.write("Java support coming soon!");
      console.log("Sample Java code:\\n${code.replace(/"/g, '\\"')}");
    `,
    preloadedLibraries: [
      'java.util.*', 'java.io.*', 'java.math.*', 'java.text.*'
    ]
  },
  html: {
    defaultCode: `<!DOCTYPE html>
<html>
<head>
  <title>My HTML Page</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      line-height: 1.6;
    }
    h1 {
      color: #0066cc;
    }
  </style>
</head>
<body>
  <h1>Welcome to Random Labs HTML!</h1>
  <p>Edit this HTML and run to see your changes.</p>
</body>
</html>`,
    runnerTemplate: (code: string) => `
      document.write(\`${code.replace(/`/g, '\\`')}\`);
    `
  },
  css: {
    defaultCode: `/* Welcome to Random Labs CSS */
body {
  font-family: Arial, sans-serif;
  margin: 40px;
  line-height: 1.6;
  background-color: #f5f5f5;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h1 {
  color: #0066cc;
}`,
    runnerTemplate: (code: string) => `
      document.write(\`
        <style>${code}</style>
        <div class="container">
          <h1>CSS Preview</h1>
          <p>This is a preview of your CSS styles.</p>
          <button>Sample Button</button>
          <div class="sample-box" style="width: 100px; height: 100px; background: #ddd; margin: 20px 0;">Box</div>
        </div>
      \`);
    `
  },
  json: {
    defaultCode: `{
  "name": "Sample Project",
  "version": "1.0.0",
  "description": "A sample JSON configuration",
  "dependencies": {
    "react": "^18.2.0",
    "lodash": "^4.17.21"
  },
  "scripts": {
    "start": "node index.js",
    "test": "jest"
  }
}`,
    runnerTemplate: (code: string) => `
      try {
        const jsonData = JSON.parse(\`${code.replace(/`/g, '\\`')}\`);
        document.write("<div style='font-family: monospace; padding: 20px;'>");
        document.write("<h3>JSON Validated Successfully</h3>");
        document.write("<pre style='background: #f5f5f5; padding: 15px; border-radius: 4px;'>");
        document.write(JSON.stringify(jsonData, null, 2));
        document.write("</pre></div>");
      } catch (e) {
        document.write("<div style='color: red; font-family: monospace; padding: 20px;'>");
        document.write("<h3>JSON Parse Error</h3>");
        document.write("<pre>" + e.message + "</pre></div>");
      }
    `
  }
};

interface EditorProps {
  language?: SupportedLanguage;
  initialValue?: string;
  theme?: 'vs-dark' | 'light';
  onChange?: (value: string) => void;
}

const DEFAULT_CODE = `// Welcome to Random Labs!
// Write your code here...

// Example:
console.log("Hello, Random Labs!");
document.write("Hello, Random Labs!"); // This will show in the preview`;

export const CodeEditor: React.FC<EditorProps> = ({
  language = 'javascript',
  initialValue = LANGUAGE_CONFIGS[language]?.defaultCode || '',
  theme = 'vs-dark',
  onChange,
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(language);
  const [isConsoleVisible, setIsConsoleVisible] = useState(true);
  const project = useStore((state) => state.project);
  const assets = useStore((state) => state.assets);
  const updateAssetContent = useStore((state) => state.updateAssetContent);
  const selectedAsset = assets.find(asset => asset.selected);

  // Initialize editor
  useEffect(() => {
    if (containerRef.current) {
      const editor = monaco.editor.create(containerRef.current, {
        value: selectedAsset?.content || initialValue,
        language: selectedAsset?.metadata?.language as SupportedLanguage || currentLanguage,
        theme: theme,
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineHeight: 22,
        fontFamily: '"Fira Code", Menlo, Monaco, "Courier New", monospace',
        fontLigatures: true,
        padding: { top: 16 },
      });

      editorRef.current = editor;

      // Add language suggestions and completions
      if (currentLanguage === 'python') {
        // Add Python-specific suggestions
        monaco.languages.registerCompletionItemProvider('python', {
          provideCompletionItems: (model, position) => {
            const wordInfo = model.getWordUntilPosition(position);
            const range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: wordInfo.startColumn,
              endColumn: wordInfo.endColumn
            };
            
            const suggestions = [
              // Built-in functions
              ...['print', 'len', 'range', 'enumerate', 'map', 'filter', 'sorted', 'sum', 'min', 'max'].map(func => ({
                label: func,
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: func + '($0)',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: `Python built-in function: ${func}`,
                range
              })),
              // Common modules
              ...['import numpy as np', 'import pandas as pd', 'import matplotlib.pyplot as plt', 
                  'import tensorflow as tf', 'import sklearn', 'import random', 'import pygame'].map(imp => ({
                label: imp,
                kind: monaco.languages.CompletionItemKind.Module,
                insertText: imp,
                documentation: `Import statement for ${imp.split(' ')[1]}`,
                range
              })),
              // Random module functions
              ...['random.randint(1, 10)', 'random.choice([1, 2, 3])', 'random.random()', 'random.shuffle(list)'].map(func => ({
                label: func,
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: func,
                documentation: `Random module function`,
                range
              })),
              // Pygame snippets
              ...['pygame.init()', 'pygame.display.set_mode((800, 600))', 'pygame.event.get()', 
                  'pygame.draw.rect(screen, (255, 0, 0), (x, y, width, height))', 
                  'pygame.time.Clock().tick(60)'].map(func => ({
                label: func,
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: func,
                documentation: `Pygame function`,
                range
              }))
            ];
            return { suggestions };
          }
        });
      }

      editor.onDidChangeModelContent(() => {
        const content = editor.getValue();
        if (onChange) {
          onChange(content);
        }
        
        // Save content to the asset
        if (selectedAsset) {
          updateAssetContent(selectedAsset.id, content);
        }
      });

      return () => {
        editor.dispose();
      };
    }
  }, [initialValue, theme, currentLanguage, onChange, selectedAsset, updateAssetContent]);

  // Update editor language if prop changes
  useEffect(() => {
    if (language !== currentLanguage) {
      setCurrentLanguage(language);
      if (editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          monaco.editor.setModelLanguage(model, language);
        }
      }
    }
  }, [language, currentLanguage]);

  const handleRun = async () => {
    if (!editorRef.current || !iframeRef.current) return;
    
    setIsRunning(true);
    setConsoleOutput([]);
    
    const code = editorRef.current.getValue();
    const iframe = iframeRef.current;
    
    // Reset iframe
    iframe.srcdoc = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px;
            line-height: 1.5;
          }
          .error {
            color: red;
            background: #ffeeee;
            padding: 5px;
            border-radius: 4px;
          }
          pre {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            overflow: auto;
          }
        </style>
        <script>
          // Capture console output
          const originalConsole = console;
          console = {
            log: function(...args) {
              originalConsole.log(...args);
              window.parent.postMessage({
                type: 'console',
                method: 'log',
                args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg))
              }, '*');
            },
            error: function(...args) {
              originalConsole.error(...args);
              window.parent.postMessage({
                type: 'console',
                method: 'error',
                args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg))
              }, '*');
            },
            warn: function(...args) {
              originalConsole.warn(...args);
              window.parent.postMessage({
                type: 'console',
                method: 'warn',
                args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg))
              }, '*');
            }
          };
          
          // Handle errors
          window.onerror = function(message, source, lineno, colno, error) {
            window.parent.postMessage({
              type: 'error',
              message: message,
              source: source,
              lineno: lineno,
              colno: colno
            }, '*');
            return true;
          };
        </script>
        ${currentLanguage === 'python' ? '<script src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"></script>' : ''}
      </head>
      <body>
        <div id="output"></div>
        <script>
          ${LANGUAGE_CONFIGS[currentLanguage].runnerTemplate(code)}
        </script>
      </body>
      </html>
    `;

    const handleMessage = (event: MessageEvent) => {
      const { data } = event;
      if (data.type === 'console') {
        setConsoleOutput(prev => [...prev, `${data.method}: ${data.args.join(' ')}`]);
      } else if (data.type === 'error') {
        setConsoleOutput(prev => [...prev, `Error: ${data.message} (line ${data.lineno})`]);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Set timeout to prevent infinite loops
    const timeout = setTimeout(() => {
      if (isRunning) {
        setIsRunning(false);
        setConsoleOutput(prev => [...prev, 'Execution timed out. Check for infinite loops or long-running operations.']);
      }
    }, 30000);

    // Monitor iframe load completion
    iframe.onload = () => {
      // For languages like Python that take time to load, 
      // the actual execution time is handled inside the iframe
      
      // For simple languages, mark execution as complete
      if (currentLanguage !== 'python') {
        setTimeout(() => {
          setIsRunning(false);
          clearTimeout(timeout);
        }, 1000);
      }
    };

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
    };
  };

  const handleStop = () => {
    setIsRunning(false);
    if (iframeRef.current) {
      // Reset iframe to stop execution
      iframeRef.current.srcdoc = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
          </style>
        </head>
        <body>
          <div>Execution stopped.</div>
        </body>
        </html>
      `;
    }
    setConsoleOutput(prev => [...prev, 'Execution stopped by user.']);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Show language info for available libraries
  const renderLanguageInfo = () => {
    const libraries = LANGUAGE_CONFIGS[currentLanguage]?.preloadedLibraries || [];
    
    if (libraries.length === 0) return null;
    
    return (
      <div className="px-4 py-2 text-sm text-gray-600 bg-gray-50 border-t border-gray-200">
        <span className="font-medium">Pre-installed libraries:</span>{' '}
        {libraries.join(', ')}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <select 
            className="text-sm border border-gray-300 rounded-md px-2 py-1 mr-2 bg-white"
            value={currentLanguage}
            onChange={(e) => setCurrentLanguage(e.target.value as SupportedLanguage)}
          >
            {Object.keys(LANGUAGE_CONFIGS).map(lang => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
          
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${
              isRunning ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}
            onClick={isRunning ? handleStop : handleRun}
            disabled={!editorRef.current}
          >
            {isRunning ? (
              <>
                <StopCircle className="w-4 h-4 mr-1" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Run
              </>
            )}
          </button>
        </div>

        <div>
          <button
            className="p-1 text-gray-500 hover:text-gray-700"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {renderLanguageInfo()}

      <div className="flex-1 flex">
        <div className={`${isConsoleVisible ? 'w-1/2' : 'w-3/4'} h-full transition-all duration-300`} ref={containerRef}></div>
        <div className={`${isConsoleVisible ? 'w-1/2' : 'w-1/4'} flex flex-col border-l border-gray-200 transition-all duration-300`}>
          <div className={`${isConsoleVisible ? 'flex-1' : 'h-full'} bg-white`}>
            <iframe
              ref={iframeRef}
              className="w-full h-full border-none"
              title="Code Output"
              sandbox="allow-scripts"
            ></iframe>
          </div>
          {isConsoleVisible && (
            <div className="h-1/3 border-t border-gray-200 flex flex-col">
              <div className="flex items-center justify-between p-2 bg-gray-100 border-b border-gray-200">
                <div className="flex items-center text-xs font-medium text-gray-700">
                  <Terminal className="w-3 h-3 mr-1" />
                  Console
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => setConsoleOutput([])}
                  >
                    Clear
                  </button>
                  <button
                    className="text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => setIsConsoleVisible(false)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex-1 p-2 overflow-auto bg-gray-900 text-gray-100 font-mono text-xs">
                {consoleOutput.length === 0 ? (
                  <div className="text-gray-500">Run your code to see output here</div>
                ) : (
                  consoleOutput.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap mb-1">
                      {line.startsWith('error:') || line.startsWith('Error:') ? (
                        <span className="text-red-400">{line}</span>
                      ) : line.startsWith('warn:') ? (
                        <span className="text-yellow-400">{line}</span>
                      ) : (
                        line
                      )}
                    </div>
                  ))
                )}
                {isRunning && (
                  <div className="flex items-center text-gray-400">
                    <Loader className="w-3 h-3 mr-1 animate-spin" />
                    Running...
                  </div>
                )}
              </div>
            </div>
          )}
          {!isConsoleVisible && (
            <div className="fixed bottom-2 right-2">
              <button
                className="p-2 bg-gray-800 text-white rounded-full shadow-lg"
                onClick={() => setIsConsoleVisible(true)}
                title="Show Console"
              >
                <Terminal className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};