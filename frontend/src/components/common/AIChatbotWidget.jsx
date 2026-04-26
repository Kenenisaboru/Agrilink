import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  Send, 
  Loader2, 
  Zap, 
  Maximize2, 
  Minimize2,
  Trash2,
  Globe
} from 'lucide-react';
import { chatWithAI, clearChatHistory } from '../../services/aiApi';
import { useAuth } from '../../context/AuthContext';

// ── Multilingual UI Strings ──────────────────────────────────────────────────
const UI_STRINGS = {
  en: {
    greeting: "👋 I'm your AgriLink AI Assistant! How can I help you today?",
    placeholder: "Ask anything...",
    thinking: "Thinking...",
    clearConfirm: "Clear chat history?",
    cleared: "🧹 History cleared. How can I help you?",
    errorMsg: "⚠️ Sorry, I'm having trouble connecting right now. Please try again later.",
    online: "Online",
    clearTitle: "Clear History",
    langLabel: "EN",
    flag: "🌐"
  },
  am: {
    greeting: "👋 የAgriLink AI ረዳት ነኝ! ዛሬ እንዴት ልርዳዎ?",
    placeholder: "ማንኛውንም ጥያቄ ይጠይቁ...",
    thinking: "እያሰብኩ ነው...",
    clearConfirm: "የውይይት ታሪክ ይጠፋ?",
    cleared: "🧹 ታሪክ ተጠርጓል። እንዴት ልርዳዎ?",
    errorMsg: "⚠️ ይቅርታ፣ አሁን ችግር አለብኝ። እባክዎ ቆይተው ይሞክሩ።",
    online: "በመስመር ላይ",
    clearTitle: "ታሪክ አጥፋ",
    langLabel: "አማ",
    flag: "🇪🇹"
  },
  om: {
    greeting: "👋 Gargaaraa AI AgriLink ti! Har'a maaliin si gargaaruu?",
    placeholder: "Waan barbaaddu gaafadhu...",
    thinking: "Yaadaa jira...",
    clearConfirm: "Seenaa dubbii haquu?",
    cleared: "🧹 Seenaan haqameera. Maaliin si gargaaruu?",
    errorMsg: "⚠️ Dhiifama, rakkoon jira. Irra deebi'ii yaali.",
    online: "Toora irra",
    clearTitle: "Seenaa haqi",
    langLabel: "Afaan",
    flag: "🌿"
  }
};

// ── Quick Prompts per Language & Role ────────────────────────────────────────
const QUICK_PROMPTS = {
  en: {
    farmer: [
      "Best crop to plant now?",
      "When to sell teff?",
      "Pest control tips"
    ],
    buyer: [
      "Cheaper teff alternatives?",
      "Bulk buying tips",
      "Price forecast"
    ],
    default: [
      "Best crop this season?",
      "Market price trends",
      "How to use AgriLink?"
    ]
  },
  am: {
    farmer: [
      "አሁን ምን ሰብል ልትክል ይሻላል?",
      "ጤፍ መቼ ልሽጥ?",
      "የተባይ መከላከያ ምክር"
    ],
    buyer: [
      "ከጤፍ ርካሽ ምርጫ?",
      "በጅምላ ለመግዛት ምክር",
      "የዋጋ ትንበያ"
    ],
    default: [
      "በዚህ ወቅት ምርጥ ሰብል?",
      "የገበያ ዋጋ ሁኔታ",
      "AgriLink እንዴት ልጠቀም?"
    ]
  },
  om: {
    farmer: [
      "Amma midhaani kamtu gaarii?",
      "Xaafii yoom gurguruun gaarii?",
      "Gorsaa dhukkuba midhaanii"
    ],
    buyer: [
      "Filannoo xaafii gatii xiqqaa?",
      "Gorsaa guddaatti bitachuu",
      "Tilmaama gatii"
    ],
    default: [
      "Midhaani yeroo kanaa gaarii?",
      "Haala gatii gabaa",
      "AgriLink akkamiin fayyadamu?"
    ]
  }
};

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🌐', short: 'EN' },
  { code: 'am', label: 'አማርኛ', flag: '🇪🇹', short: 'አማ' },
  { code: 'om', label: 'Afaan Oromo', flag: '🌿', short: 'AO' }
];

const AIChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en');
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: UI_STRINGS.en.greeting,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 10));
  const { user } = useAuth();
  
  const messagesEndRef = useRef(null);
  const langPickerRef = useRef(null);
  const t = UI_STRINGS[language] || UI_STRINGS.en;
  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener('open-chatbot', handleOpen);
    return () => window.removeEventListener('open-chatbot', handleOpen);
  }, []);

  // Close language picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langPickerRef.current && !langPickerRef.current.contains(e.target)) {
        setShowLangPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update greeting when language changes
  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setShowLangPicker(false);
    
    // Add a system message about language change
    const langName = LANGUAGES.find(l => l.code === langCode)?.label || 'English';
    const switchMsg = {
      en: `🌐 Switched to **English**. How can I help you?`,
      am: `🇪🇹 ወደ **አማርኛ** ተቀይሯል። እንዴት ልርዳዎ?`,
      om: `🌿 Gara **Afaan Oromoo** tti jijjiirame. Maaliin si gargaaruu?`
    };

    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'bot',
      text: switchMsg[langCode] || switchMsg.en,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    }]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Add language + role context to help AI respond in the correct language
      const langHint = language === 'am' 
        ? '[Respond in Amharic (አማርኛ)]' 
        : language === 'om' 
          ? '[Respond in Afaan Oromo]' 
          : '[Respond in English]';
      const roleHint = user ? `[User Role: ${user.role}]` : '';
      const contextMessage = `${langHint} ${roleHint} ${userMessage.text}`;
      
      const response = await chatWithAI(contextMessage, sessionId);
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.response,
        detectedLang: response.detected_language,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: t.errorMsg,
        isError: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm(t.clearConfirm)) {
      await clearChatHistory(sessionId);
      setMessages([{
        id: Date.now(),
        sender: 'bot',
        text: t.cleared,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const handleQuickPrompt = (promptText) => {
    setInput(promptText);
    setTimeout(() => {
      document.getElementById('chatbot-form')?.dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }, 10);
  };

  // Get role-appropriate quick prompts for current language
  const roleKey = user?.role === 'Farmer' ? 'farmer' : user?.role === 'Buyer' ? 'buyer' : 'default';
  const quickPrompts = (QUICK_PROMPTS[language] || QUICK_PROMPTS.en)[roleKey];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : '520px',
              width: isMinimized ? '300px' : '380px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-4 flex flex-col transition-all duration-300"
          >
            {/* Header */}
            <div className={`p-4 flex items-center justify-between text-white ${user?.role === 'Farmer' ? 'bg-green-600' : 'bg-agriDark'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">AgriLink AI</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-[10px] opacity-80 font-medium uppercase tracking-wider">{t.online}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Language Picker */}
                <div className="relative" ref={langPickerRef}>
                  <button 
                    onClick={() => setShowLangPicker(!showLangPicker)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition flex items-center gap-1"
                    title="Change Language"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-[10px] font-bold">{currentLang.short}</span>
                  </button>
                  
                  <AnimatePresence>
                    {showLangPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-48 z-50"
                      >
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                              language === lang.code 
                                ? 'bg-agriGreen/10 text-agriGreen font-bold' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-lg">{lang.flag}</span>
                            <span className="text-sm font-medium">{lang.label}</span>
                            {language === lang.code && (
                              <span className="ml-auto w-2 h-2 bg-agriGreen rounded-full"></span>
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={toggleChat}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scrollbar-thin scrollbar-thumb-gray-200">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] ${msg.sender === 'user' ? 'order-2' : ''}`}>
                        <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                          msg.sender === 'user' 
                            ? `${user?.role === 'Farmer' ? 'bg-green-600' : 'bg-agriDark'} text-white rounded-tr-none` 
                            : msg.isError 
                              ? 'bg-red-50 text-red-600 border border-red-100 rounded-tl-none' 
                              : msg.isSystem
                                ? 'bg-blue-50 text-blue-700 border border-blue-100 rounded-tl-none'
                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                        }`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        <div className={`flex items-center gap-2 mt-1 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[10px] text-gray-400">{msg.time}</span>
                          {msg.detectedLang && (
                            <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-medium">
                              {msg.detectedLang === 'am' ? '🇪🇹 አማ' : msg.detectedLang === 'om' ? '🌿 AO' : '🌐 EN'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-agriGreen" />
                        <span className="text-xs text-gray-400 font-medium">{t.thinking}</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts — shown only at start */}
                {messages.length <= 2 && (
                  <div className="px-4 py-2 flex flex-wrap gap-2 bg-gray-50/50 border-t border-gray-100">
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickPrompt(prompt)}
                        className="text-[10px] font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:border-agriGreen hover:text-agriGreen transition-all"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Area */}
                <form id="chatbot-form" onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-3 py-1 focus-within:ring-2 focus-within:ring-agriGreen/20 transition-all">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t.placeholder}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 placeholder-gray-400"
                    />
                    <div className="flex items-center gap-1">
                      <button 
                        type="button" 
                        onClick={handleClearHistory}
                        title={t.clearTitle}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className={`p-2 rounded-xl transition shadow-md ${
                          !input.trim() || isLoading 
                            ? 'bg-gray-300 text-white cursor-not-allowed' 
                            : `${user?.role === 'Farmer' ? 'bg-green-600 hover:bg-green-700' : 'bg-agriDark hover:bg-black'} text-white`
                        }`}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen 
            ? 'bg-white text-gray-800' 
            : `${user?.role === 'Farmer' ? 'bg-green-600 shadow-green-600/30' : 'bg-agriDark shadow-black/30'} text-white`
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
        )}
      </motion.button>
    </div>
  );
};

export default AIChatbotWidget;
