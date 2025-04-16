import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { Play, Loader, StopCircle, Terminal, Maximize2, Minimize2, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { codeExecutionService } from '../services/execution';
import { collaborationService } from '../services/collaboration';

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
console.log(greet('Coder'));`,
    runnerTemplate: (code: string) => code,
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

console.log(greet(user.name));`,
    runnerTemplate: (code: string) => code,
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
# import os`,
    runnerTemplate: (code: string) => code,
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
    runnerTemplate: (code: string) => code,
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
    runnerTemplate: (code: string) => code
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
    runnerTemplate: (code: string) => code
  },
  json: {
    defaultCode: `{
  "name": "Sample",
  "version": "1.0.0",
  "description": "This is a sample JSON file",
  "author": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "dependencies": {
    "react": "^18.2.0",
    "typescript": "^5.0.0"
  }
}`,
    runnerTemplate: (code: string) => code
  }
};


export const CodeEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isOutputVisible, setIsOutputVisible] = useState(false);
  
  const { 
    currentUser, 
    project, 
    assets, 
    selectedAsset,
    updateAssetContent 
  } = useStore();

  // Initialize Monaco Editor
  useEffect(() => {
    if (editorRef.current && !editor) {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({ strict: true });
      const newEditor = monaco.editor.create(editorRef.current, {
        value: '',
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        fontSize: 16,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible'
        },
        cursorStyle: 'line',
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        cursorWidth: 2,
        renderWhitespace: 'selection',
        renderLineHighlight: 'all',
        contextmenu: true,
        quickSuggestions: true,
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'on',
        tabCompletion: 'on',
        wordBasedSuggestions: true,
        parameterHints: {
          enabled: true,
          cycle: true,
        },
      });

      // Set up collaboration
      if (currentUser && project) {
        collaborationService.connect(project.id, currentUser);
        collaborationService.bindEditor(newEditor);
      }

      // Handle cursor position updates
      newEditor.onDidChangeCursorPosition(e => {
        if (currentUser) {
          collaborationService.updateCursor({
            line: e.position.lineNumber,
            column: e.position.column
          });
        }
      });

      setEditor(newEditor);

      return () => {
        newEditor.dispose();
        setEditor(null);
      };
    }
  }, [editorRef, editor, currentUser, project, selectedAsset]);

  // Update editor content when selected asset changes
  useEffect(() => {
    if (editor && selectedAsset) {
      const asset = assets.find(a => a.id === selectedAsset);
      if (asset && asset.content) {
        editor.setValue(asset.content);
        editor.updateOptions({ language: asset.metadata?.language ?? 'javascript' });
        updateLanguage(asset.metadata?.language ?? 'javascript');
      }
    }
  }, [editor, selectedAsset, assets, updateLanguage]);

  const updateLanguage = (language: string) => {
    switch (language) {
      case 'javascript':
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        });
        break;
      case 'typescript':
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        });
        break;
      case 'html':
        break;
      case 'css':
        break;
      case 'json':
        break;
      case 'python':
        break;
      case 'java':
        break;
      default:
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        });
    }
  };
  // Handle editor content changes
  useEffect(() => {
    if (editor && selectedAsset) {
      const disposable = editor.onDidChangeModelContent(() => {
        const content = editor.getValue();
        updateAssetContent(selectedAsset, content);
      });
      return () => disposable.dispose();
    }
  }, [editor, selectedAsset, updateAssetContent]);
  
  // Handle code execution
  const handleExecute = async () => {
    if (!editor || !selectedAsset) return;

    setIsExecuting(true);
    setError('');
    setOutput('');
    setIsOutputVisible(true);

    try {
      const result = await codeExecutionService.executeCode({
        ...assets.find(a => a.id === selectedAsset)!,
        content: editor.getValue()
      });

      if (result.error) {
        setError(result.error);
      } else {
        setOutput(result.output);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  // Handle stop execution
  const handleStop = () => {
    codeExecutionService.stopExecution();
    setIsExecuting(false);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!editorRef.current) return;

    if (!isFullscreen) {
      editorRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 bg-gray-800 text-white">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded flex items-center space-x-1"
          >
            {isExecuting ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>Run</span>
          </button>
          <button
            onClick={handleStop}
            disabled={!isExecuting}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded flex items-center space-x-1"
          >
            <StopCircle className="w-4 h-4" />
            <span>Stop</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsOutputVisible(!isOutputVisible)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded flex items-center space-x-1"
          >
            <Terminal className="w-4 h-4" />
            <span>Output</span>
          </button>
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex">
        <div
          ref={editorRef}
          className="flex-1"
        />
        {isOutputVisible && (
          <div className="w-1/3 bg-gray-900 text-white p-4 overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Output</h3>
              <button
                onClick={() => setIsOutputVisible(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {error && error !== '' ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <pre className="whitespace-pre-wrap">{output}</pre>
            )}
           </div>
        )}
      </div>
    </div>
  );
};