import React, { useState } from 'react';
import { MessageSquare, Loader, X } from 'lucide-react';
import { useStore } from '../store/useStore';

export function AIAssistant() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isOpen = useStore((state) => state.isAIPanelOpen);
  const togglePanel = useStore((state) => state.toggleAIPanel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setPrompt('');
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
        <h3 className="font-semibold">AI Assistant</h3>
        <button onClick={togglePanel} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* Chat messages would go here */}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask anything..."
            className="w-full p-2 pr-10 border rounded-lg"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-2 text-blue-600 hover:text-blue-700"
          >
            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
}