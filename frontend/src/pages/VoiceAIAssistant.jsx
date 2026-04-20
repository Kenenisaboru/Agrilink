import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, Zap, Globe, Mic, MicOff, Camera, CloudRain,
  AlertTriangle, X, TrendingUp, ShoppingBag, Sprout,
  BarChart3, Lightbulb, ChevronRight, User, ThumbsUp, ThumbsDown, Bell, 
  Trash2, Check, Users, Handshake, Volume2, VolumeX
} from 'lucide-react';
import { chatWithAI, analyzeCropImage, getWeatherAlert, submitFeedback, clearChatHistory } from '../services/aiApi';
import voiceService from '../services/voiceService';
import PriceAlertPanel from '../components/PriceAlertPanel';

// Enhanced Quick Prompts with voice support
const FARMER_QUICK_PROMPTS = [
  { icon: '🌾', label: 'Best crop now?', text: 'Which crop is most profitable to plant right now?' },
  { icon: '📈', label: 'When to sell teff?', text: 'When is best time to sell teff for maximum price?' },
  { icon: '🐛', label: 'Pest prevention', text: 'How can I prevent pests on my maize crop?' },
  { icon: '🌧️', label: 'Rainy season tips', text: 'What should I do to protect my crops during Kiremt rainy season?' },
  { icon: '☕', label: 'Coffee harvest', text: 'When should I harvest coffee and what is current price?' },
  { icon: '💰', label: 'Maize price tip', text: 'Should I sell my maize now or wait for a better price?' },
  { icon: '🤝', label: 'Find buyers', text: 'Can you help me find buyers for my crops?' },
];

const BUYER_QUICK_PROMPTS = [
  { icon: '📦', label: 'Buy teff in bulk?', text: 'Is now a good time to buy teff in bulk?' },
  { icon: '📉', label: 'Lowest price month', text: 'Which month has the lowest grain prices in Ethiopia?' },
  { icon: '🔄', label: 'Cheaper crop alt.', text: 'What is a cheaper alternative to teff right now?' },
  { icon: '🤝', label: 'Find suppliers', text: 'How do I find verified grain suppliers in East Hararghe?' },
  { icon: '🌽', label: 'Maize supply', text: 'What is the current maize supply situation and price forecast?' },
  { icon: '☕', label: 'Buy coffee now?', text: 'Is this a good time to buy coffee in bulk for export?' },
  { icon: '👥', label: 'Find farmers', text: 'Can you connect me with reliable farmers for coffee?' },
];

const VoiceAIAssistant = () => {
  const [userMode, setUserMode] = useState('farmer');
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 10));
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "👋 Hello! I'm **AgriLink Smart Advisor** with voice capabilities!\n\n- 🌾 **Farmers:** Ask about crops, prices, pests, or find buyers\n- 📦 **Buyers:** Ask about suppliers, bulk deals, or connect with farmers\n- 🎤 **Voice:** Click the microphone to speak in English, Amharic, or Afaan Oromo\n- 🤝 **Matching:** I can connect farmers with buyers based on crops and location\n\nTry speaking to me or tap a quick prompt below!",
      detectedLanguage: 'en',
      turn: 0
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [detectedLanguage, setDetectedLanguage] = useState('en');
  const [weatherAlert, setWeatherAlert] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  const [showAlertPanel, setShowAlertPanel] = useState(false);
  const [showMatching, setShowMatching] = useState(false);
  const [matches, setMatches] = useState([]);
  const [feedbackStatus, setFeedbackStatus] = useState({});
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Voice cleanup on unmount
  useEffect(() => {
    return () => {
      voiceService.stopRecognition();
      voiceService.stopSpeaking();
    };
  }, []);

  const sendMessage = async (text, isVoiceInput = false) => {
    if (!text?.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      mode: userMode,
      isVoice: isVoiceInput
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const contextualMessage = `[User is a ${userMode.toUpperCase()}] ${text.trim()}`;
      const response = await chatWithAI(contextualMessage, sessionId, isVoiceInput, {
        user_type: userMode,
        location: 'East Hararghe'
      });
      
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.response,
        detectedLanguage: response.detected_language,
        turn: response.conversation_turn,
        metadata: response.metadata
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Auto-speak response if voice is enabled
      if (voiceEnabled && response.response) {
        await speakResponse(response.response, response.detected_language);
      }
      
      // Check for matching recommendations
      if (response.metadata?.has_recommendations && text.toLowerCase().includes('match')) {
        await loadMatches();
      }
      
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: '⚠️ Connection issue. Please check that Flask AI service is running and try again.',
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakResponse = async (text, language) => {
    try {
      setIsSpeaking(true);
      await voiceService.speak(text, {
        language: language,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false)
      });
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    }
  };

  const startVoiceInput = async () => {
    if (!voiceService.isSupported.recognition) {
      alert('Voice input is not supported in your browser.');
      return;
    }

    try {
      setIsRecording(true);
      const result = await voiceService.startRecognition({
        language: detectedLanguage,
        onStart: () => setIsRecording(true),
        onEnd: () => setIsRecording(false)
      });
      
      setInput(result.transcript);
      setDetectedLanguage(result.detectedLanguage);
      setIsRecording(false);
      
      // Auto-send voice input
      if (result.transcript.trim()) {
        await sendMessage(result.transcript, true);
      }
    } catch (error) {
      console.error('Voice recognition error:', error);
      setIsRecording(false);
    }
  };

  const stopVoiceInput = () => {
    voiceService.stopRecognition();
    setIsRecording(false);
  };

  const toggleVoiceOutput = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setVoiceEnabled(!voiceEnabled);
    }
  };

  const loadMatches = async () => {
    try {
      // Mock API call - replace with actual API
      const mockMatches = [
        {
          user_type: userMode,
          matches: [
            {
              name: userMode === 'farmer' ? 'Ethiopian Grain Corp' : 'Abebe Kebede',
              location: 'Addis Ababa',
              match_score: 85,
              specialty: userMode === 'farmer' ? 'bulk buyer' : 'organic teff',
              contact: '+251911234567',
              reason: 'High compatibility in crops and location'
            }
          ]
        }
      ];
      setMatches(mockMatches);
      setShowMatching(true);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Clear conversation history?')) {
      await clearChatHistory(sessionId);
      setMessages([
        { id: Date.now(), sender: 'bot', text: '🧹 Conversation history cleared. How can I help you?', detectedLanguage: 'en', turn: 0 }
      ]);
    }
  };

  const handleFeedback = async (msgId, text, rating) => {
    if (feedbackStatus[msgId]) return;
    setFeedbackStatus(prev => ({ ...prev, [msgId]: rating }));
    await submitFeedback({
      sessionId,
      rating,
      message: 'User message not linked yet',
      responseSnippet: text
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickPrompt = (promptText) => {
    sendMessage(promptText);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const tempUrl = URL.createObjectURL(file);
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      text: '📸 Uploaded crop image for AI diagnosis...',
      imageUrl: tempUrl
    }]);
    setIsLoading(true);

    try {
      const result = await analyzeCropImage(file);
      const { analysis, message } = result;
      const botText = `${message}\n\n- 🦠 **Disease:** ${analysis.disease}\n- 🐛 **Cause:** ${analysis.pest}\n- 📊 **Confidence:** ${Math.round((analysis.confidence || 0.5) * 100)}%\n\n- 🌿 **Organic Treatment:**\n${analysis.treatment_organic}\n\n- 🧪 **Chemical Treatment:**\n${analysis.treatment_chemical}`;
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botText, isDiagnosis: true }]);
      
      if (voiceEnabled) {
        await speakResponse(botText, 'en');
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, sender: 'bot',
        text: '❌ Vision analysis failed. Please ensure your image is clear and try again.',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const quickPrompts = userMode === 'farmer' ? FARMER_QUICK_PROMPTS : BUYER_QUICK_PROMPTS;
  const accentColor = userMode === 'farmer' ? 'green' : 'blue';

  const getLanguageLabel = (code) => {
    switch (code) {
      case 'am': return '🇪🇹 Amharic';
      case 'om': return '🌿 Afaan Oromo';
      default: return '🌐 English';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1a2e] to-[#0f172a] flex flex-col items-center justify-start p-3 sm:p-6 pt-6">
      <div className="w-full max-w-4xl flex flex-col gap-4">

        {/* Enhanced Header with Voice Controls */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            <Zap className={`w-7 h-7 text-${accentColor}-400`} />
            AgriLink Voice AI
          </h1>
          <p className="text-slate-400 text-sm mt-1">Multi-language Voice Assistant · Smart Matching · Ethiopia</p>
        </div>

        {/* Enhanced Mode Toggle with Voice Status */}
        <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-2">
          <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-2/3">
            <button
              onClick={() => setUserMode('farmer')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                userMode === 'farmer'
                  ? 'bg-green-600 text-white shadow-lg shadow-green-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sprout className="w-4 h-4 hidden sm:block" /> Farmer
            </button>
            <button
              onClick={() => setUserMode('buyer')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                userMode === 'buyer'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4 hidden sm:block" /> Buyer
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Voice Status Indicator */}
            <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/20">
              {isRecording ? (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Recording...
                </>
              ) : isSpeaking ? (
                <>
                  <Volume2 className="w-3 h-3" />
                  Speaking...
                </>
              ) : (
                <>
                  <Mic className="w-3 h-3" />
                  Voice Ready
                </>
              )}
            </div>
            
            {/* Voice Toggle */}
            <button
              onClick={toggleVoiceOutput}
              className={`p-2.5 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold ${
                voiceEnabled 
                  ? 'bg-green-500/20 border-green-400/40 text-green-400 hover:bg-green-500/30' 
                  : 'bg-gray-500/20 border-gray-400/40 text-gray-400 hover:bg-gray-500/30'
              }`}
              title={voiceEnabled ? 'Disable voice output' : 'Enable voice output'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:block">{voiceEnabled ? 'Voice ON' : 'Voice OFF'}</span>
            </button>

            {/* Matching Button */}
            <button 
              onClick={loadMatches}
              className="p-2.5 bg-purple-500/20 border border-purple-400/40 hover:bg-purple-500/30 rounded-xl text-purple-400 transition flex items-center gap-1.5"
              title="Find matches"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:block text-xs font-semibold">Matches</span>
            </button>
            
            {/* Tools */}
            <button 
              onClick={() => setShowAlertPanel(true)}
              className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-amber-400 transition flex items-center gap-1.5"
              title="Price Alerts"
            >
              <Bell className="w-4 h-4" /> 
              <span className="hidden sm:block text-xs font-semibold">Alerts</span>
            </button>
            <button 
              onClick={handleClearHistory}
              className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-slate-400 transition"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Matching Panel */}
        <AnimatePresence>
          {showMatching && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="bg-purple-500/10 border border-purple-400/30 rounded-2xl p-6 mb-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
                  <Handshake className="w-5 h-5" />
                  Smart Matches for {userMode === 'farmer' ? 'Buyers' : 'Farmers'}
                </h3>
                <button
                  onClick={() => setShowMatching(false)}
                  className="p-1 hover:bg-purple-500/20 rounded-full transition"
                >
                  <X className="w-4 h-4 text-purple-400" />
                </button>
              </div>
              
              {matches.map((matchGroup, idx) => (
                <div key={idx} className="space-y-3">
                  {matchGroup.matches.map((match, matchIdx) => (
                    <div key={matchIdx} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-white mb-1">{match.name}</h4>
                          <p className="text-sm text-slate-400 mb-2">{match.location}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-purple-400">Match: {match.match_score}%</span>
                            <span className="text-green-400">{match.specialty}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">{match.reason}</p>
                        </div>
                        <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition">
                          Contact
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <PriceAlertPanel 
          userId={sessionId} 
          isOpen={showAlertPanel} 
          onClose={() => setShowAlertPanel(false)} 
        />

        {/* Enhanced Chat Window */}
        <div className="flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
             style={{ height: '55vh', minHeight: '380px' }}>

          {/* Header with Language Detection */}
          <div className={`px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r ${
            userMode === 'farmer' ? 'from-green-900/40 to-teal-900/20' : 'from-blue-900/40 to-indigo-900/20'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg ${
                userMode === 'farmer' ? 'bg-green-500' : 'bg-blue-500'
              }`}>
                {userMode === 'farmer' ? <Sprout className="w-5 h-5 text-white" /> : <ShoppingBag className="w-5 h-5 text-white" />}
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">
                  {userMode === 'farmer' ? 'Farmer Mode — Voice & Matching' : 'Buyer Mode — Voice & Matching'}
                </p>
                <p className="text-xs text-slate-400">
                  {detectedLanguage !== 'en' ? `${getLanguageLabel(detectedLanguage)} detected` : 'English · አማርኛ · Afaan Oromo'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/20">
              <Globe className="w-3.5 h-3.5" /> Voice AI
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2.5 max-w-[88%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1 shadow">
                      <Zap className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  {msg.sender === 'user' && (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow ${
                      msg.mode === 'buyer' ? 'bg-blue-600' : 'bg-green-600'
                    }`}>
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  <div className={`flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl shadow-md ${
                      msg.sender === 'user'
                        ? msg.mode === 'buyer'
                          ? 'bg-blue-600 text-white rounded-tr-sm'
                          : 'bg-green-600 text-white rounded-tr-sm'
                        : msg.isError
                        ? 'bg-red-600/60 text-white rounded-tl-sm border border-red-500/30'
                        : msg.isDiagnosis
                        ? 'bg-teal-600/30 text-white rounded-tl-sm border border-teal-400/20'
                        : 'bg-white/10 backdrop-blur text-slate-100 rounded-tl-sm border border-white/10'
                    }`}>
                      {/* Voice Input Indicator */}
                      {msg.isVoice && (
                        <div className="flex items-center gap-1 mb-2 text-xs text-slate-400">
                          <Mic className="w-3 h-3" />
                          Voice input
                        </div>
                      )}
                      
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="Crop"
                          className="max-w-[180px] rounded-lg mb-2 border border-white/20"
                        />
                      )}
                      {msg.sender === 'user' ? (
                        <p className="text-[14px] leading-relaxed">{msg.text}</p>
                      ) : (
                        <div className="space-y-1.5">
                          {msg.text.split('\n').filter(line => line.trim()).map((line, idx) => (
                            <p key={idx} className="text-[14px] leading-relaxed text-slate-200">{line}</p>
                          ))}
                        </div>
                      )}
                    </div>

                    {msg.sender === 'bot' && (
                      <div className="flex items-center justify-between w-full mt-1.5 px-1">
                        <div className="flex gap-2">
                           <span className="text-[10px] text-slate-500 font-medium bg-black/20 px-1.5 rounded">
                             {getLanguageLabel(msg.detectedLanguage)}
                           </span>
                           {msg.turn > 0 && (
                             <span className="text-[10px] text-slate-500 font-medium bg-black/20 px-1.5 rounded flex items-center gap-1">
                               Memory: {msg.turn} turns
                             </span>
                           )}
                        </div>
                        
                        {!msg.isError && msg.id !== 1 && (
                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => handleFeedback(msg.id, msg.text, 'positive')}
                              disabled={!!feedbackStatus[msg.id]}
                              className={`p-1 rounded-md transition ${feedbackStatus[msg.id] === 'positive' ? 'text-green-400 bg-green-400/10' : 'text-slate-500 hover:text-green-400 hover:bg-white/5 disabled:opacity-30'}`}
                            >
                              {feedbackStatus[msg.id] === 'positive' ? <Check className="w-3.5 h-3.5" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                            </button>
                            <button 
                              onClick={() => handleFeedback(msg.id, msg.text, 'negative')}
                              disabled={!!feedbackStatus[msg.id]}
                              className={`p-1 rounded-md transition ${feedbackStatus[msg.id] === 'negative' ? 'text-red-400 bg-red-400/10' : 'text-slate-500 hover:text-red-400 hover:bg-white/5 disabled:opacity-30'}`}
                            >
                              {feedbackStatus[msg.id] === 'negative' ? <Check className="w-3.5 h-3.5" /> : <ThumbsDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex gap-2.5 max-w-[88%]">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/10 border border-white/10 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-green-400" />
                    <span className="text-sm text-slate-400 italic">Analyzing with AI...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Voice Input Area */}
          <div className="px-4 py-3 border-t border-white/10 bg-black/20">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload crop photo for diagnosis"
                className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full text-teal-400 transition"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Enhanced Voice Input Button */}
              <button
                type="button"
                onMouseDown={startVoiceInput}
                onMouseUp={stopVoiceInput}
                onTouchStart={startVoiceInput}
                onTouchEnd={stopVoiceInput}
                title={`Voice input (${getLanguageLabel(detectedLanguage)})`}
                className={`p-2.5 border rounded-full transition flex items-center gap-2 ${
                  isRecording
                    ? 'bg-red-500 border-red-400 text-white animate-pulse'
                    : 'bg-white/10 hover:bg-white/20 border-white/15 text-orange-400'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span className="text-xs font-medium">
                  {isRecording ? 'Release to send' : 'Hold to speak'}
                </span>
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isRecording 
                      ? 'Listening...' 
                      : userMode === 'farmer' 
                        ? 'Ask about crops, prices, or find buyers...' 
                        : 'Ask about suppliers, deals, or find farmers...'
                  }
                  className="w-full bg-white/5 border border-white/15 rounded-full py-3 pl-5 pr-12 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/30 transition"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-2.5 rounded-full text-white transition disabled:opacity-40 ${
                    userMode === 'farmer' ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Enhanced Quick Prompts */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Lightbulb className={`w-4 h-4 text-${accentColor}-400`} />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Voice Questions for {userMode === 'farmer' ? 'Farmers' : 'Buyers'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {quickPrompts.map((prompt, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleQuickPrompt(prompt.text)}
                disabled={isLoading}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-${accentColor}-500/30 text-left transition group disabled:opacity-50`}
              >
                <span className="text-lg flex-shrink-0">{prompt.icon}</span>
                <span className="text-xs font-medium text-slate-300 group-hover:text-white transition leading-snug">
                  {prompt.label}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400 ml-auto flex-shrink-0 transition" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Enhanced Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2 pb-4">
          {[
            { icon: <Mic className="w-3 h-3" />, label: 'Voice Control' },
            { icon: <Users className="w-3 h-3" />, label: 'Smart Matching' },
            { icon: <TrendingUp className="w-3 h-3" />, label: 'Price Prediction' },
            { icon: <BarChart3 className="w-3 h-3" />, label: 'Market Insights' },
            { icon: <Globe className="w-3 h-3" />, label: '3 Languages' },
            { icon: <Handshake className="w-3 h-3" />, label: 'Buyer-Farmer Connect' },
          ].map((pill, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full"
            >
              {pill.icon} {pill.label}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
};

export default VoiceAIAssistant;
