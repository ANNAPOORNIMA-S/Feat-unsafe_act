import React, { useState, useEffect, useRef } from 'react';
import { SafetyObservation, ChatMessage } from '../types';
import { ChatService } from '../services/chatbotService';

interface Props {
  data: SafetyObservation[];
  isOpen: boolean;
  onClose: () => void;
}

export const ChatWindow: React.FC<Props> = ({ data, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello! I am your AI HSE Assistant. I can perform exact analysis on your uploaded data.\n\nAsk me questions like:\n* "How many high risk issues are on MAG Victory?"\n* "What are the top 3 issues fleet-wide?"\n* "Summarize the unsafe acts regarding PPE."',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Ref to hold the service instance (persists across renders)
  const chatServiceRef = useRef<ChatService | null>(null);

  // Initialize Chat Service when data changes
  useEffect(() => {
    if (data.length > 0) {
      chatServiceRef.current = new ChatService(data);
    }
  }, [data]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      let responseText = "Data not loaded yet.";
      
      if (chatServiceRef.current) {
        // Use the persistent service session
        responseText = await chatServiceRef.current.sendMessage(userMsg.text);
      }
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "I encountered an error processing your request.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-8 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50 animate-fade-in-up flex flex-col font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-maire-blue to-blue-800 text-white p-4 rounded-t-xl flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <div>
             <h3 className="font-semibold text-base">HSE AI Assistant</h3>
             <p className="text-[10px] text-blue-200 opacity-90">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>
        <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 bg-gray-50 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[90%] p-3 rounded-lg text-sm shadow-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-maire-blue text-white rounded-br-none' 
                  : 'bg-white text-slate-700 border border-gray-100 rounded-bl-none'
              }`}
            >
              {msg.text.split('\n').map((line, i) => (
                <p key={i} className={`min-h-[1em] ${i > 0 ? "mt-1" : ""}`}>
                  {/* Basic Markdown-like bolding support for display */}
                  {line.split(/(\*\*.*?\*\*)/).map((part, idx) => 
                    part.startsWith('**') && part.endsWith('**') 
                      ? <strong key={idx}>{part.slice(2, -2)}</strong> 
                      : part
                  )}
                </p>
              ))}
              <span className={`text-[10px] block mt-2 opacity-70 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
             <div className="bg-white text-slate-500 border border-gray-100 rounded-lg rounded-bl-none p-3 shadow-sm flex items-center gap-2">
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
               <span className="text-xs text-gray-400 ml-1">Analyzing...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-200 bg-white rounded-b-xl flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about trends, risks, or specific vessels..." 
          disabled={isTyping}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-maire-light focus:border-transparent bg-gray-50 disabled:opacity-70"
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isTyping}
          className="bg-maire-light hover:bg-blue-500 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </form>
    </div>
  );
};