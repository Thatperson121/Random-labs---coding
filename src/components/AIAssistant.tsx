import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Loader, X, Code } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Asset } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOpen = useStore((state) => state.isAIPanelOpen);
  const togglePanel = useStore((state) => state.toggleAIPanel);
  const project = useStore((state) => state.project);
  const assets = useStore((state) => state.assets);
  const selectedAsset = useStore((state) => state.assets.find(a => a.selected));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add initial message when panel is opened
    if (isOpen && messages.length === 0) {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY') {
        setMessages([
          {
            id: 'welcome',
            type: 'assistant',
            content: 'Hello! Please add your OpenAI API key in the .env file to enable AI chat functionality. The key should be set as VITE_OPENAI_API_KEY.',
            timestamp: new Date()
          }
        ]);
        setError('API key is not configured or is invalid');
      } else {
        setMessages([
          {
            id: 'welcome',
            type: 'assistant',
            content: 'Hello! I can help you with your code. Ask me anything or try "Analyze my code" to get suggestions on your current project.',
            timestamp: new Date()
          }
        ]);
      }
    }
  }, [isOpen, messages.length]);

  const apiKeyConfigured = !!import.meta.env.VITE_OPENAI_API_KEY && 
                          import.meta.env.VITE_OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY';

  const callOpenAI = async (prompt: string, includeCode: boolean = false): Promise<string> => {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const model = import.meta.env.VITE_AI_MODEL || 'gpt-4o';
      
      if (!apiKey) {
        throw new Error('API key is not configured. Please add your OpenAI API key to the .env file with the VITE_ prefix.');
      }

      let systemPrompt = `You are a helpful coding assistant powered by ${model}. You provide clear, concise answers to programming questions.`;
      
      // Include code context if requested
      let codeContext = '';
      if (includeCode) {
        if (selectedAsset && selectedAsset.type === 'file' && selectedAsset.content) {
          codeContext = `Here's the current file I'm working on:\n\n${selectedAsset.name}:\n${selectedAsset.content}`;
        } else {
          codeContext = getCodeFromAssets(assets);
        }
        
        if (codeContext) {
          systemPrompt += " Here's the code I want you to analyze:\n\n" + codeContext;
        }
      }

      console.log(`Making API request to OpenAI with model: ${model}`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        
        if (errorData.error?.message) {
          throw new Error(`OpenAI API error: ${errorData.error.message}`);
        } else if (response.status === 401) {
          throw new Error('API key is invalid. Please check your OpenAI API key.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'I could not generate a response.';
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      // Check if it's a request to analyze code
      const includeCode = input.toLowerCase().includes('analyze') && 
                         input.toLowerCase().includes('code');
      
      const assistantResponse = await callOpenAI(input, includeCode);
      
      const assistantMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'assistant',
        content: assistantResponse,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAnalyzeCode = async () => {
    setIsTyping(true);
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
      id: Math.random().toString(36).substr(2, 9),
      type: 'user',
      content: 'Analyze my current code and give me suggestions for improvement.',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Add a system message showing what code is being analyzed
    const systemMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'assistant',
      content: `I'm analyzing the following code:\n\n${codeToAnalyze}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, systemMessage]);

    try {
      const assistantResponse = await callOpenAI(
        'Analyze this code and provide suggestions for improvement, best practices, potential bugs, and optimization.', 
        true
      );
      
      const assistantMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'assistant',
        content: assistantResponse,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsTyping(false);
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
              key={message.id}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.type === 'user'
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
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
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
          disabled={isTyping || !apiKeyConfigured}
          className="w-full mb-2 btn-secondary text-sm flex items-center justify-center"
        >
          {isTyping ? (
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
            placeholder={apiKeyConfigured ? "Ask me anything about your code..." : "Please add your OpenAI API key to enable chat"}
            className="flex-1 input text-sm"
            disabled={isTyping || !apiKeyConfigured}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping || !apiKeyConfigured}
            className="btn-primary px-6 disabled:opacity-50"
          >
            {isTyping ? (
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