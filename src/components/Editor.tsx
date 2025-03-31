import React, { useEffect, useRef, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { executionService } from '../services/execution';
import { collaborationService } from '../services/collaboration';
import { useParams } from 'react-router-dom';
import { API_URL } from '../config';
import { User } from '../types';

interface EditorProps {
  initialCode?: string;
  language?: string;
}

const CodeEditor: React.FC<EditorProps> = ({ initialCode = '', language = 'python' }) => {
  const editorRef = useRef<any>(null);
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { roomId } = useParams<{ roomId: string }>();

  useEffect(() => {
    if (roomId) {
      // For testing, we'll use a mock user
      const mockUser: User = {
        id: 'test-user-1',
        name: 'Test User',
        email: 'test@example.com',
        color: '#ff0000',
        friends: []
      };
      
      collaborationService.connect(roomId, mockUser);
      
      // Set up event listeners
      const handleConnect = () => {
        setIsConnected(true);
        console.log('Connected to collaboration server');
      };

      const handleDisconnect = () => {
        setIsConnected(false);
        console.log('Disconnected from collaboration server');
      };

      const handleCodeChange = (newCode: string) => {
        setCode(newCode);
      };

      collaborationService.on('connect', handleConnect);
      collaborationService.on('disconnect', handleDisconnect);
      collaborationService.on('code-change', handleCodeChange);

      return () => {
        collaborationService.removeListener('connect', handleConnect);
        collaborationService.removeListener('disconnect', handleDisconnect);
        collaborationService.removeListener('code-change', handleCodeChange);
        collaborationService.disconnect();
      };
    }
  }, [roomId]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    if (roomId) {
      collaborationService.bindEditor(editor);
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
      if (roomId) {
        collaborationService.sendCodeChange(value);
      }
    }
  };

  const runCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to run');
      return;
    }

    setIsRunning(true);
    setError('');
    setOutput('');

    try {
      const result = await executionService.executeCode(code, language);
      if (result?.output) {
        setOutput(result.output);
      }
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while running the code');
    } finally {
      setIsRunning(false);
    }
  };

  const testEnvironment = async () => {
    const testCode = `import sys
import platform
print(f"Python Version: {sys.version}")
print(f"Platform: {platform.platform()}")
print("Environment test successful!")`;

    setIsRunning(true);
    setError('');
    setOutput('');

    try {
      const result = await executionService.executeCode(testCode, 'python');
      if (result?.output) {
        setOutput(result.output);
      }
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while testing the environment');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 bg-gray-800">
        <div className="flex items-center space-x-4">
          <button
            onClick={runCode}
            disabled={isRunning}
            className={`px-4 py-2 rounded ${
              isRunning
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
          <button
            onClick={testEnvironment}
            disabled={isRunning}
            className={`px-4 py-2 rounded ${
              isRunning
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            Test Environment
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-300">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 p-4">
        <div className="h-full">
          <Editor
            height="100%"
            defaultLanguage={language}
            defaultValue={code}
            theme="vs-dark"
            onChange={handleCodeChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
        <div className="h-full flex flex-col">
          <div className="flex-1 bg-gray-900 p-4 rounded overflow-auto">
            <pre className="text-white font-mono text-sm">
              {output || 'Output will appear here...'}
            </pre>
          </div>
          {error && (
            <div className="mt-2 p-4 bg-red-900 text-red-100 rounded">
              <pre className="font-mono text-sm">{error}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;