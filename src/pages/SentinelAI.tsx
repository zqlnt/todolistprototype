import React, { useState } from 'react';
import { Bot, Send, Sparkles, Clock, User, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';

const SentinelAI: React.FC = () => {
  const [messages, setMessages] = useState<Array<{
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: string;
  }>>([
    {
      id: 'welcome',
      type: 'ai',
      content: "Hello! I'm Sentinel AI, your intelligent productivity assistant. I can help you manage tasks, analyze your schedule, provide insights about your productivity patterns, and answer questions about your data. How can I assist you today?",
      timestamp: new Date().toISOString()
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      type: 'user' as const,
      content: inputText.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response (replace with actual LLM integration later)
    setTimeout(() => {
      const aiMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai' as const,
        content: `I understand you're asking about "${userMessage.content}". This is a placeholder response. The actual Gemini LLM integration will be added later to provide intelligent responses about your tasks, schedule, and productivity insights.`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const suggestedPrompts = [
    "What are my most important tasks today?",
    "When do I have free time this week?",
    "Summarize my recent emails",
    "Help me prioritize my tasks",
    "What meetings do I have coming up?",
    "Create a task from my latest email",
    "Show me overdue tasks",
    "Analyze my productivity patterns"
  ];

  return (
    <div className="h-full p-1 sm:p-2 lg:p-6 max-w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mx-0.5 sm:mx-0 flex flex-col h-full">
          {/* Header */}
          <div className="p-2 sm:p-3 lg:p-6 border-b border-neutral-200 flex-shrink-0">
            <div className="flex items-center space-x-2 mb-2">
              <Bot size={20} className="text-indigo-600" />
              <h2 className="text-base sm:text-xl font-semibold text-neutral-900">Sentinel AI</h2>
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-700">Online</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600">
              Your intelligent productivity assistant powered by Google Gemini
            </p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-6 space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] sm:max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {message.type === 'ai' ? (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Bot size={14} className="text-indigo-600" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                          <User size={14} className="text-neutral-600" />
                        </div>
                      )}
                    </div>
                    
                    {/* Message bubble */}
                    <div className={`rounded-lg px-3 py-2 ${
                      message.type === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-neutral-100 text-neutral-900'
                    }`}>
                      <p className="text-xs sm:text-sm leading-relaxed">{message.content}</p>
                      
                      {/* Message actions for AI responses */}
                      {message.type === 'ai' && (
                        <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-neutral-200">
                          <button className="p-1 hover:bg-neutral-200 rounded transition-colors" title="Copy">
                            <Copy size={12} className="text-neutral-500" />
                          </button>
                          <button className="p-1 hover:bg-neutral-200 rounded transition-colors" title="Good response">
                            <ThumbsUp size={12} className="text-neutral-500" />
                          </button>
                          <button className="p-1 hover:bg-neutral-200 rounded transition-colors" title="Poor response">
                            <ThumbsDown size={12} className="text-neutral-500" />
                          </button>
                          <span className="text-[10px] text-neutral-500 ml-auto">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Timestamp for user messages */}
                  {message.type === 'user' && (
                    <div className="text-[10px] text-neutral-500 mt-1 text-right">
                      {formatTime(message.timestamp)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Bot size={14} className="text-indigo-600" />
                  </div>
                  <div className="bg-neutral-100 rounded-lg px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Prompts (shown when no messages or few messages) */}
          {messages.length <= 1 && (
            <div className="p-2 sm:p-3 lg:p-6 border-t border-neutral-100 flex-shrink-0">
              <h3 className="text-xs sm:text-sm font-medium text-neutral-700 mb-2">Try asking:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInputText(prompt)}
                    className="text-left px-2 py-1.5 text-xs sm:text-sm bg-neutral-50 hover:bg-neutral-100 text-neutral-700 rounded-lg transition-colors border border-neutral-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-2 sm:p-3 lg:p-6 border-t border-neutral-200 flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex space-x-1.5">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask Sentinel AI anything..."
                  className="w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
                  disabled={isTyping}
                />
                <Sparkles size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              </div>
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="px-2 py-2 sm:px-3 lg:px-4 sm:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 flex-shrink-0"
              >
                <Send size={14} />
                <span className="hidden sm:inline text-xs sm:text-sm">Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentinelAI;