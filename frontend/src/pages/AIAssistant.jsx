import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, Loader2, Zap, Globe, Mic, Image as ImageIcon, CloudRain, AlertTriangle, X, Camera } from 'lucide-react';
import { chatWithAI, analyzeCropImage, getWeatherAlert } from '../services/aiApi';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I am your Smart AgriLink Advisor. I can help you with crop demands, market strategies, vision-based plant diagnostics, and weather alerts in English, Amharic, or Afaan Oromo. How can I assist you today?",
      detectedLanguage: 'en'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [weatherAlert, setWeatherAlert] = useState(null);
  const [showAlertMessage, setShowAlertMessage] = useState(true);
  const [isPageReady, setIsPageReady] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsPageReady(true);
  }, []);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await getWeatherAlert('East Hararghe');
        if (data && data.alert) {
          setWeatherAlert(data.alert);
        }
      } catch (e) {
        console.error("Failed to load weather alert");
      }
    };
    fetchWeather();
  }, []);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    const userMessage = { id: Date.now(), sender: 'user', text: userText, detectedLanguage: '' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAI(userText);
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const tempImageUrl = URL.createObjectURL(file);
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: "Uploaded an image for diagnosis.",
      imageUrl: tempImageUrl
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await analyzeCropImage(file);
      const botResponse = `${result.message}\n\n**🌿 Organic Treatment:**\n${result.analysis.treatment_organic}\n\n**🧪 Chemical Treatment:**\n${result.analysis.treatment_chemical}`;
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botResponse,
          isDiagnosis: true
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "Vision Analysis failed. Please check your network connection.",
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'am-ET'; // Using Amharic as default for local farmers
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    
    recognition.onresult = (event) => {
      const transcript = (event.results && event.results[0] && event.results[0][0]) ? event.results[0][0].transcript : null;
      if (transcript) setInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.start();
  };

  const getLanguageLabel = (code) => {
    switch (code) {
      case 'am': return 'Amharic';
      case 'om': return 'Afaan Oromo';
      case 'en': return 'English';
      default: return 'English';
    }
  };

  if (!isPageReady) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white text-xl">Loading AgriLink...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl h-[85vh] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col relative"
      >
        {/* Weather Alert Push Notification */}
        <AnimatePresence>
          {weatherAlert && showAlertMessage && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-lg rounded-2xl shadow-2xl p-4 flex items-start gap-4 backdrop-blur-md border ${
                weatherAlert.urgency === 'High' 
                  ? 'bg-red-500/80 border-red-400 text-white' 
                  : weatherAlert.urgency === 'Medium'
                  ? 'bg-orange-500/80 border-orange-400 text-white'
                  : 'bg-green-500/80 border-green-400 text-white'
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                {(weatherAlert && weatherAlert.icon === 'rain') ? <CloudRain className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg flex items-center gap-2">
                  Smart Alert: {(weatherAlert && weatherAlert.type) ? weatherAlert.type : 'Weather Update'}
                </h4>
                <p className="text-sm opacity-90 mt-1">{(weatherAlert && weatherAlert.message) ? weatherAlert.message : 'Checking local conditions...'}</p>
              </div>
              <button 
                onClick={() => setShowAlertMessage(false)}
                className="p-1 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-green-600/20 to-blue-600/20 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-[#1e1b4b] rounded-full"></span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                AgriLink Smart Advisor
              </h1>
              <p className="text-sm text-green-200">Vision Diagnostics & Voice Enabled (Amharic)</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/20 shadow-inner">
            <Globe className="w-4 h-4" /> Multilingual
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
              <div className={`flex max-w-[85%] gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Zap className="w-4 h-4 text-white" />
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
                    {msg.imageUrl && (
                      <div className="mb-2">
                        <img src={msg.imageUrl} alt="Crop Upload" className="max-w-[200px] rounded-lg border border-white/20" />
                      </div>
                    )}
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                   <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-white/10 backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-green-400" />
                  <span className="text-sm text-slate-300">Evaluating data...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-5 border-t border-white/10 bg-black/20">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            
            {/* Vision / Image Upload */}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-green-400 transition-colors border border-white/20 shadow-inner group relative"
              title="Upload Crop Photo for Diagnosis"
            >
              <Camera className="w-5 h-5" />
            </button>

            {/* Voice Recording */}
            <button
              type="button"
              onClick={startVoiceRecording}
              className={`p-3 rounded-full transition-colors border shadow-inner ${
                isRecording 
                  ? 'bg-red-500/80 border-red-400 text-white animate-pulse' 
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-orange-400'
              }`}
              title="Hold to Speak (Amharic)"
            >
              <Mic className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? "Listening..." : "Ask or describe your issue..."}
                className="w-full bg-white/5 border border-white/20 rounded-full py-4 pl-6 pr-14 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-green-600 hover:bg-green-500 disabled:bg-green-600/50 rounded-full text-white transition-colors duration-200 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </form>
          <div className="flex justify-between items-center mt-3 px-2">
             <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              AgriLink Pro • Integrated with Meteorologic Data & Vision AI
            </p>
            <div className="flex gap-2">
              <span className="text-[10px] uppercase font-bold text-green-400/80 bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20">Amharic Voice Enabled</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIAssistant;
