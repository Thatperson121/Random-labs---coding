import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Loader, X, Code } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Asset } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

// Function to fetch code content from assets
const getCodeFromAssets = (assets: Asset[]): string => {
  let allCode = '';
  
  const extractCodeFromAsset = (asset: Asset) => {
    if (asset.type === 'file' && isCodeFile(asset.fileType)) {
      allCode += `\n\n// File: ${asset.name}\n${asset.content || '// Content not available'}`;
    }
    
    if (asset.children && asset.children.length > 0) {
      asset.children.forEach(extractCodeFromAsset);
    }
  };
  
  assets.forEach(extractCodeFromAsset);
  return allCode;
};

// Helper function to identify code files
const isCodeFile = (fileType?: string): boolean => {
  return !!fileType && (
    fileType.startsWith('text/') || 
    fileType.includes('javascript') || 
    fileType.includes('typescript') || 
    fileType.includes('python') || 
    fileType.includes('java') ||
    fileType.includes('json')
  );
};

// Format file content for display
const formatCodeForDisplay = (assets: Asset[]): string => {
  let result = '### Files being analyzed:\n\n';
  
  const addAssetInfo = (asset: Asset, depth = 0): void => {
    const indent = '  '.repeat(depth);
    
    if (asset.type === 'file' && isCodeFile(asset.fileType)) {
      result += `${indent}📄 **${asset.name}**\n`;
      if (asset.content) {
        result += "```" + (asset.metadata?.language || 'text') + "\n";
        result += asset.content + "\n";
        result += "```\n\n";
      } else {
        result += "_No content available_\n\n";
      }
    } else if (asset.type === 'folder' && asset.children) {
      result += `${indent}📁 **${asset.name}/**\n`;
      asset.children.forEach(child => addAssetInfo(child, depth + 1));
    }
  };
  
  assets.forEach(asset => addAssetInfo(asset));
  return result;
};

export const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOpen = useStore((state) => state.isAIPanelOpen);
  const togglePanel = useStore((state) => state.toggleAIPanel);
  
  const assets = useStore((state) => state.assets);
  const selectedAsset = useStore((state) => state.assets.find(a => a.selected));

  // Check if AI features are enabled
  const aiEnabled = import.meta.env.VITE_AI_FEATURES_ENABLED === 'true';
  
  // Use this to track if OpenAI is available (key is set on the server)
  const openAIAvailable = import.meta.env.VITE_OPENAI_AVAILABLE === 'true';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with a welcome message
    if (messages.length === 0) {
      setMessages([
        {
          role: 'system',
          content: 'I am an AI coding assistant. How can I help you with your project today?'
        }
      ]);
    }
  }, [messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Add user message to the chat
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // If AI is not enabled, show a message explaining this
    if (!aiEnabled || !openAIAvailable) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Hello! AI features are currently disabled. Please enable them in your environment settings.'
        }
      ]);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Use the serverless function instead of direct API call
      const response = await fetch('/.netlify/functions/openai-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [...messages, userMessage],
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add AI response to messages
      if (data.choices && data.choices[0]) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.choices[0].message.content
          }
        ]);
      }
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your request. Please try again later.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeCode = async () => {
    setIsLoading(true);
    setError(null);

    // First, collect code from assets
    let codeToAnalyze = '';
    if (selectedAsset && selectedAsset.type === 'file' && selectedAsset.content) {
      codeToAnalyze = `### Analyzing file: ${selectedAsset.name}\n\n` + 
        "```" + (selectedAsset.metadata?.language || 'text') + "\n" +
        selectedAsset.content + "\n" +
        "```\n";
    } else {
      codeToAnalyze = formatCodeForDisplay(assets);
    }

    // Add the user request message
    const userMessage: Message = {
      role: 'user',
      content: 'Analyze my current code and give me suggestions for improvement.',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Add a system message showing what code is being analyzed
    const systemMessage: Message = {
      role: 'assistant',
      content: `I'm analyzing the following code:\n\n${codeToAnalyze}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, systemMessage]);

    try {
      // Use the serverless function instead of direct API call
      const response = await fetch('/.netlify/functions/openai-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [...messages, userMessage, systemMessage],
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add AI response to messages
      if (data.choices && data.choices[0]) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.choices[0].message.content
          }
        ]);
      }
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={togglePanel}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-xl flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold">AI Assistant</h3>
          <span className="text-xs text-gray-500">Powered by {import.meta.env.VITE_AI_MODEL || 'gpt-4o'}</span>
        </div>
        <button onClick={togglePanel} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <style>
          {`
          .markdown-content pre {
            background-color: #1e1e1e;
            border-radius: 6px;
            padding: 12px;
            overflow-x: auto;
            margin: 10px 0;
          }
          
          .markdown-content code {
            font-family: 'Fira Code', Menlo, Monaco, 'Courier New', monospace;
            font-size: 0.85em;
          }
          
          .markdown-content p {
            margin: 8px 0;
          }
          
          .markdown-content h3 {
            font-weight: 600;
            margin-top: 16px;
            margin-bottom: 8px;
          }
          
          .markdown-content ul {
            list-style-type: disc;
            padding-left: 20px;
            margin: 8px 0;
          }
          
          .markdown-content ol {
            list-style-type: decimal;
            padding-left: 20px;
            margin: 8px 0;
          }
          
          .dark-theme-message pre {
            background-color: #2d2d2d !important;
          }
          
          .dark-theme-message code {
            color: #e6e6e6 !important;
          }
          `}
        </style>
        <div className="overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.role}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.content.includes('```') ? (
                  <div className="text-sm markdown-content">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
                <span className="text-xs opacity-75 mt-1 block">
                  {message.timestamp?.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm">
              Error: {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-2 border-t border-gray-200">
        <button
          onClick={handleAnalyzeCode}
          disabled={isLoading || !aiEnabled || !openAIAvailable}
          className="w-full mb-2 btn-secondary text-sm flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 mr-1 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Code className="w-4 h-4 mr-1" />
              Analyze Current Code
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={aiEnabled ? "Ask me anything about your code..." : "Please enable AI features to enable chat"}
            className="flex-1 input text-sm"
            disabled={isLoading || !aiEnabled || !openAIAvailable}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !aiEnabled || !openAIAvailable}
            className="btn-primary px-6 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};