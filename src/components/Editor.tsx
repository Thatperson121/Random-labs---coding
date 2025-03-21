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
    defaultCode: `// JavaScript code
console.log('Hello, world!');

// Write your JavaScript code here
function greet(name) {
  return 'Hello, ' + name + '!';
}

// Test the function
console.log(greet('Coder'));
`,
    runnerTemplate: (code: string) => `
      ${code}
    `,
    preloadedLibraries: [
      'react', 'react-dom', 'lodash', 'axios', 'moment', 'jquery', 'd3'
    ]
  },
  typescript: {
    defaultCode: `// TypeScript code
console.log('Hello, TypeScript!');

// Define a typed function
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

// Define an interface
interface User {
  name: string;
  age: number;
}

// Create a user object
const user: User = {
  name: 'TypeScript User',
  age: 25
};

console.log(greet(user.name));
`,
    runnerTemplate: (code: string) => `
      ${code}
    `,
    preloadedLibraries: [
      'react', 'react-dom', 'lodash', 'axios', 'moment'
    ]
  },
  python: {
    defaultCode: `# Python code
print("Hello, Python!")

# Define a function
def greet(name):
    return f"Hello, {name}!"

# Test the function
print(greet("Pythonista"))

# You can use many libraries:
# import numpy as np
# import pandas as pd
# import matplotlib.pyplot as plt
# import math
# import os
`,
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
      'pygame', 'random', 'math', 'os'
    ]
  },
  java: {
    defaultCode: `// Java code example
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
        
        // Call a method
        String greeting = greet("Java Developer");
        System.out.println(greeting);
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
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
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #2563eb;
        }
        .container {
            border: 1px solid #e5e7eb;
            padding: 20px;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <h1>Hello, HTML!</h1>
    <div class="container">
        <p>This is a sample HTML page. You can edit it to create your own web page.</p>
        <button onclick="alert('Button clicked!')">Click me</button>
    </div>
</body>
</html>`,
    runnerTemplate: (code: string) => `
      document.write(\`${code.replace(/`/g, '\\`')}\`);
    `
  },
  css: {
    defaultCode: `/* CSS Styles */
body {
    font-family: Arial, sans-serif;
    background-color: #f9fafb;
    color: #111827;
    line-height: 1.5;
}

h1 {
    color: #2563eb;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 10px;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

button {
    background-color: #2563eb;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #1d4ed8;
}

.sample-box {
    border: 1px solid #e5e7eb;
    padding: 15px;
    margin-top: 20px;
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
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": [
    "sample",
    "json",
    "config"
  ],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "react": "^18.2.0"
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

const DEFAULT_CODE = ``;

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
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const project = useStore((state) => state.project);
  const assets = useStore((state) => state.assets);
  const updateAssetContent = useStore((state) => state.updateAssetContent);
  const saveProject = useStore((state) => state.saveProject);
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
                  'import tensorflow as tf', 'import sklearn', 'import random', 'import pygame',
                  'import math', 'import os'].map(imp => ({
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
              // Math module functions
              ...['math.sqrt(x)', 'math.sin(x)', 'math.cos(x)', 'math.pi', 'math.floor(x)', 'math.ceil(x)'].map(func => ({
                label: func,
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: func,
                documentation: `Math module function`,
                range
              })),
              // OS module functions
              ...['os.path.join(path1, path2)', 'os.listdir(path)', 'os.getcwd()', 'os.makedirs(path)', 'os.remove(path)'].map(func => ({
                label: func,
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: func,
                documentation: `OS module function`,
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
          handleSaveContent(content);
        }
      });

      return () => {
        editor.dispose();
      };
    }
  }, [initialValue, theme, currentLanguage, onChange, selectedAsset, updateAssetContent]);

  // Update editor when selected asset changes
  useEffect(() => {
    if (editorRef.current && selectedAsset) {
      // Update editor content and language when selected asset changes
      const model = editorRef.current.getModel();
      if (model) {
        // Only set value if content exists and is different
        if (selectedAsset.content !== undefined) {
          const currentValue = editorRef.current.getValue();
          if (currentValue !== selectedAsset.content) {
            editorRef.current.setValue(selectedAsset.content);
          }
        }
        
        // Update language if needed
        const assetLanguage = selectedAsset.metadata?.language as SupportedLanguage;
        if (assetLanguage && assetLanguage !== currentLanguage) {
          setCurrentLanguage(assetLanguage);
          monaco.editor.setModelLanguage(model, assetLanguage);
        }
      }
    }
  }, [selectedAsset, currentLanguage]);

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

  // Handle language change from dropdown
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value as SupportedLanguage;
    
    // Don't do anything if same language selected
    if (newLanguage === currentLanguage) return;
    
    // Update editor language
    setCurrentLanguage(newLanguage);
    
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, newLanguage);
      }
      
      // Update asset metadata if we have a selected asset
      if (selectedAsset) {
        // Get current content from editor
        const content = editorRef.current.getValue();
        
        // Create updated asset with new language metadata
        const updatedAsset = {
          ...selectedAsset,
          fileType: getFileTypeFromLanguage(newLanguage),
          metadata: {
            ...(selectedAsset.metadata || {}),
            language: newLanguage
          }
        };
        
        // Manually save content and update asset metadata
        handleSaveContent(content, updatedAsset);
      }
    }
  };

  // Function to get file type from language
  const getFileTypeFromLanguage = (lang: SupportedLanguage): string => {
    switch(lang) {
      case 'javascript': return 'text/javascript';
      case 'typescript': return 'text/typescript';
      case 'python': return 'text/x-python';
      case 'java': return 'text/x-java';
      case 'html': return 'text/html';
      case 'css': return 'text/css';
      case 'json': return 'application/json';
      default: return 'text/plain';
    }
  };

  // Handle saving content with debounce
  const saveContentTimeoutRef = useRef<number | null>(null);
  const handleSaveContent = (content: string, asset = selectedAsset) => {
    if (!asset) return;

    // Clear previous timeout if it exists
    if (saveContentTimeoutRef.current) {
      window.clearTimeout(saveContentTimeoutRef.current);
    }

    // Set save status to saving
    setSaveStatus('saving');
    
    // Wait a short time before saving to avoid too frequent saves
    saveContentTimeoutRef.current = window.setTimeout(() => {
      updateAssetContent(asset.id, content);
      setSaveStatus('saved');
      
      // Clear timeout reference
      saveContentTimeoutRef.current = null;
    }, 500);
  };

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
            onChange={handleLanguageChange}
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
          
          <div className="ml-4 text-sm text-gray-500 flex items-center">
            {saveStatus === 'saving' && (
              <>
                <Loader className="w-3 h-3 mr-1 animate-spin text-gray-400" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <span className="text-green-600">Saved</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-600">Save failed</span>
            )}
          </div>
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