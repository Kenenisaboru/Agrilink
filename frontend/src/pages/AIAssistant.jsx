import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, Languages } from 'lucide-react';
import { chatWithAI } from '../services/aiApi';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I am your Smart AgriLink Assistant. I can help you with crop demands, best selling times, and market strategies in English, Amharic, or Afaan Oromo. How can I assist you today?",
      detectedLanguage: 'en'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), sender: 'user', text: input, detectedLanguage: '' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAI(userMessage.text);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: response.response,
          detectedLanguage: response.detected_language
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "I'm having trouble connecting to the network right now. Please check your connection and try again.",
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getLanguageLabel = (code) => {
    switch (code) {
      case 'am': return 'Amharic';
      case 'om': return 'Afaan Oromo';
      case 'en': return 'English';
      default: return 'English';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl h-[85vh] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#1e1b4b] rounded-full"></span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                AgriLink AI <Sparkles className="w-5 h-5 text-yellow-400" />
              </h1>
              <p className="text-sm text-blue-200">Multilingual Ecosystem Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/20 shadow-inner">
            <Languages className="w-4 h-4" /> Auto-Detect
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[75%] gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={`flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-5 py-3.5 rounded-2xl shadow-lg relative group ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : msg.isError 
                        ? 'bg-red-500/80 text-white rounded-tl-sm'
                        : 'bg-white/10 backdrop-blur-md text-slate-100 border border-white/10 rounded-tl-sm'
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  
                  {msg.sender === 'bot' && msg.detectedLanguage && (
                    <span className="text-[10px] text-slate-400 ml-1 opacity-70">
                      Detected Language: {getLanguageLabel(msg.detectedLanguage)}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex max-w-[75%] gap-3 text-white">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-white/10 backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  <span className="text-sm text-slate-300">Processing input...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-5 border-t border-white/10 bg-black/20">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full bg-white/5 border border-white/20 rounded-full py-4 pl-6 pr-14 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 rounded-full text-white transition-colors duration-200 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
          <p className="text-center text-[11px] text-slate-400 mt-3 font-medium">
            AI can make mistakes. Consider verifying critical agricultural information.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AIAssistant;
