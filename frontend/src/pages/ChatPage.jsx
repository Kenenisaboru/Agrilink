import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';
import { translateMessage } from '../services/aiApi';
import {
  Send, User, MessageSquare, Search, ArrowLeft, MoreHorizontal,
  Loader2, Circle, Phone, Video, Info, Languages, ChevronDown, Check
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import voiceCommunication from '../services/voiceCommunication';

const defaultHost = window.location.hostname || 'localhost';
const socket = io(import.meta.env.VITE_API_URL || `http://${defaultHost}:5557`);

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'am', label: 'አማርኛ', flag: '🇪🇹' },
  { code: 'om', label: 'Afaan Oromo', flag: '🌿' },
];

const ChatPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialRecipientId = queryParams.get('userId');
  const initialRecipientName = queryParams.get('userName');

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState(
    initialRecipientId ? { _id: initialRecipientId, name: initialRecipientName || 'User' } : null
  );
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);

  // Translation state
  const [myLanguage, setMyLanguage] = useState('en');
  const [autoTranslate, setAutoTranslate] = useState(true); // Auto-translate toggle
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [translating, setTranslating] = useState({}); // { msgId: true/false }
  const [translations, setTranslations] = useState({}); // { msgId: "translated text" }

  useEffect(() => {
    if (user?._id) socket.emit('join', user._id);

    socket.on('message', (msg) => {
      if (recipient && (msg.sender._id === recipient._id || msg.sender === recipient._id)) {
        setMessages((prev) => [...prev, msg]);
        // Auto-translate incoming messages if enabled
        if (autoTranslate && msg.content) {
          const msgId = msg._id || Date.now();
          const senderLang = detectMsgLanguage(msg.content);
          if (senderLang !== myLanguage) {
            setTranslating(prev => ({ ...prev, [msgId]: true }));
            translateMessage(msg.content, senderLang, myLanguage)
              .then(result => {
                setTranslations(prev => ({ ...prev, [msgId]: result.translated_text }));
              })
              .catch(() => { })
              .finally(() => {
                setTranslating(prev => ({ ...prev, [msgId]: false }));
              });
          }
        }
      }
      fetchHistory();
    });

    socket.on('userTyping', ({ senderId }) => {
      if (recipient && senderId === recipient._id) {
        setTypingUser(senderId);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
      }
    });

    return () => {
      socket.off('message');
      socket.off('userTyping');
    };
  }, [user, recipient]);

  const fetchHistory = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/messages/conversations/list', config);
      setHistory(data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  useEffect(() => {
    if (user?.token) fetchHistory();
  }, [user]);

  useEffect(() => {
    const fetchConversation = async () => {
      if (recipient?._id) {
        setLoading(true);
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.get(`/api/messages/${recipient._id}`, config);
          setMessages(data);
        } catch (err) {
          console.error('Error fetching chat:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchConversation();
  }, [recipient, user]);

  useEffect(() => {
    if (user?._id) {
      voiceCommunication.initialize(user._id);
      
      // Setup voice communication event handlers
      voiceCommunication.onIncomingCall = (data) => {
        if (window.confirm(`Incoming ${data.callType} call from ${data.callerId}. Accept?`)) {
          voiceCommunication.acceptCall(data.callId);
        } else {
          voiceCommunication.rejectCall(data.callId);
        }
      };

      voiceCommunication.onCallAccepted = () => {
        console.log('Call accepted and connected');
      };

      voiceCommunication.onRemoteStreamAdded = () => {
        // In a real app, we would attach this to an <audio> or <video> element
        const remoteAudio = new Audio();
        remoteAudio.srcObject = voiceCommunication.remoteStream;
        remoteAudio.play().catch(e => console.error('Error playing remote stream:', e));
      };
    }

    return () => {
      voiceCommunication.disconnect();
    };
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !recipient) return;
    socket.emit('sendMessage', {
      senderId: user._id,
      receiverId: recipient._id,
      content: newMessage,
    });
    setNewMessage('');
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (recipient) socket.emit('typing', { senderId: user._id, receiverId: recipient._id });
  };

  const handleVoiceCall = async () => {
    if (!recipient) return;
    const result = await voiceCommunication.initiateCall(recipient._id, 'voice');
    if (!result.success) {
      alert(`Failed to start call: ${result.error}`);
    }
  };

  const handleVideoCall = async () => {
    if (!recipient) return;
    const result = await voiceCommunication.initiateCall(recipient._id, 'video');
    if (!result.success) {
      alert(`Failed to start call: ${result.error}`);
    }
  };

  // Detect language of a message (basic heuristic)
  const detectMsgLanguage = (text) => {
    if (/[\u1200-\u137F]/.test(text)) return 'am';
    const oromoWords = ['akkam', 'gabaa', 'oti', 'lafa', 'qonnaan', 'yeroo', 'garuu'];
    if (oromoWords.some(w => text.toLowerCase().includes(w))) return 'om';
    return 'en';
  };

  // Translate a single message
  const handleTranslate = async (msg) => {
    const msgId = msg._id || msg.createdAt;
    if (translations[msgId] || translating[msgId]) return;

    const senderLang = detectMsgLanguage(msg.content);
    if (senderLang === myLanguage) {
      setTranslations(prev => ({ ...prev, [msgId]: '(Same language — no translation needed)' }));
      return;
    }

    setTranslating(prev => ({ ...prev, [msgId]: true }));
    try {
      const result = await translateMessage(msg.content, senderLang, myLanguage);
      setTranslations(prev => ({ ...prev, [msgId]: result.translated_text }));
    } catch {
      setTranslations(prev => ({ ...prev, [msgId]: '⚠️ Translation failed. Please try again.' }));
    } finally {
      setTranslating(prev => ({ ...prev, [msgId]: false }));
    }
  };

  const isOwnMessage = (msg) =>
    msg.sender === user._id || msg.sender?._id === user._id;

  const currentLang = LANGUAGES.find(l => l.code === myLanguage);

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 overflow-hidden">
      {/* Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex w-96 flex-col bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-8 border-b border-gray-50">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Messages</h2>
            <div className="bg-agriGreen/10 p-2 rounded-2xl text-agriGreen">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-agriGreen transition-colors" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-agriGreen/10 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {history.length > 0 ? history.map((contact) => (
            <div
              key={contact._id}
              onClick={() => setRecipient(contact)}
              className={cn(
                "p-4 rounded-[2rem] cursor-pointer transition-all flex items-center gap-4 group border",
                recipient?._id === contact._id
                  ? "bg-agriGreen text-white shadow-xl shadow-green-100 border-transparent"
                  : "hover:bg-gray-50 border-transparent hover:border-gray-100"
              )}
            >
              <div className="relative">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                  recipient?._id === contact._id
                    ? "bg-white/20"
                    : "bg-gray-100 text-gray-400 group-hover:bg-agriGreen/10 group-hover:text-agriGreen"
                )}>
                  <User className="w-6 h-6" />
                </div>
              </div>
              <div className="flex-grow">
                <p className={cn(
                  "font-black text-lg tracking-tight leading-none mb-1",
                  recipient?._id === contact._id ? "text-white" : "text-gray-900"
                )}>{contact.name}</p>
                <p className={cn(
                  "text-xs font-medium truncate max-w-[150px]",
                  recipient?._id === contact._id ? "text-white/80" : "text-gray-500"
                )}>{contact.role}</p>
              </div>
            </div>
          )) : (
            <div className="text-center py-10">
              <p className="text-gray-400 font-bold text-sm">No conversations yet</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-grow flex flex-col bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden relative"
      >
        {!recipient ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-32 h-32 bg-agriGreen/5 rounded-[3rem] flex items-center justify-center text-agriGreen mb-8 shadow-inner border border-agriGreen/10"
            >
              <MessageSquare className="w-16 h-16" />
            </motion.div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Your Secure <br /> Messenger</h2>
            <p className="text-gray-500 text-lg font-medium max-w-sm leading-relaxed">
              Connect directly with the East Hararghe community to negotiate, learn, and grow.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-10 py-5 border-b border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-5">
                <Link to="/dashboard" className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="relative">
                  <div className="w-14 h-14 bg-agriGreen/10 rounded-2xl flex items-center justify-center text-agriGreen shadow-sm">
                    <User className="w-7 h-7" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-4 border-white rounded-full" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none">{recipient.name}</h3>
                  <div className="mt-1.5 flex items-center gap-2">
                    {typingUser === recipient._id ? (
                      <p className="text-xs font-black text-agriGreen animate-pulse uppercase tracking-widest">Typing...</p>
                    ) : (
                      <p className="text-xs font-black text-green-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Circle className="w-2 h-2 fill-current" /> Online
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right controls: Language Picker + Actions */}
              <div className="flex items-center gap-2">
                {/* Language Picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowLangPicker(!showLangPicker)}
                    className="flex items-center gap-2 px-4 py-2 bg-agriGreen/5 hover:bg-agriGreen/10 border border-agriGreen/20 rounded-2xl text-sm font-bold text-gray-700 transition-all"
                    title="Set your language for auto-translation"
                  >
                    <Languages className="w-4 h-4 text-agriGreen" />
                    <span>{currentLang?.flag} {currentLang?.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  <AnimatePresence>
                    {showLangPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        className="absolute right-0 top-12 z-50 bg-white rounded-2xl border border-gray-100 shadow-2xl min-w-[180px] overflow-hidden"
                      >
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-4 pt-3 pb-1">Translate messages to:</p>
                        {LANGUAGES.map(lang => (
                          <button
                            key={lang.code}
                            onClick={() => { setMyLanguage(lang.code); setShowLangPicker(false); setTranslations({}); }}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors text-left",
                              myLanguage === lang.code
                                ? "bg-agriGreen/10 text-agriGreen"
                                : "hover:bg-gray-50 text-gray-700"
                            )}
                          >
                            <span className="text-base">{lang.flag}</span>
                            {lang.label}
                            {myLanguage === lang.code && <Check className="w-3.5 h-3.5 ml-auto" />}
                          </button>
                        ))}
                        {/* Auto-Translate Toggle */}
                        <div className="px-4 py-3 border-t border-gray-100">
                          <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-xs font-bold text-gray-600">Auto-Translate</span>
                            <div className={cn(
                              "w-10 h-5 rounded-full transition-colors relative",
                              autoTranslate ? "bg-agriGreen" : "bg-gray-300"
                            )} onClick={() => setAutoTranslate(!autoTranslate)}>
                              <div className={cn(
                                "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow",
                                autoTranslate ? "left-5" : "left-0.5"
                              )} />
                            </div>
                          </label>
                          <p className="text-[10px] text-gray-400 mt-1">Automatically translate incoming messages</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={handleVoiceCall}
                  className="p-3 hover:bg-gray-50 rounded-2xl transition-colors text-gray-400 hover:text-agriGreen"
                >
                  <Phone className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleVideoCall}
                  className="p-3 hover:bg-gray-50 rounded-2xl transition-colors text-gray-400 hover:text-agriGreen"
                >
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-3 hover:bg-gray-50 rounded-2xl transition-colors text-gray-400">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Message Feed */}
            <div className="flex-grow overflow-y-auto p-10 space-y-4 bg-gray-50/30 custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-10 h-10 animate-spin text-agriGreen" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <span className="bg-white/80 px-4 py-1.5 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 shadow-sm">
                      Messaging Securely · Auto-Translation Powered by Gemini AI
                    </span>
                  </div>

                  {messages.map((msg, idx) => {
                    const own = isOwnMessage(msg);
                    const msgId = msg._id || idx;
                    const translated = translations[msgId];
                    const isTranslating = translating[msgId];

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${own ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="flex flex-col gap-1 max-w-[75%]">
                          {/* Message bubble */}
                          <div className={`p-5 rounded-[2.5rem] shadow-sm relative group ${own
                              ? 'bg-agriGreen text-white rounded-br-none shadow-green-100'
                              : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                            }`}>
                            <p className="text-[15px] font-medium leading-relaxed">{msg.content}</p>
                            <p className={`text-[10px] mt-2 font-black uppercase tracking-wider opacity-40 ${own ? 'text-right' : 'text-left'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          {/* Translate button — only for received messages */}
                          {!own && (
                            <div className="pl-2">
                              {!translated ? (
                                <button
                                  onClick={() => handleTranslate(msg)}
                                  disabled={isTranslating}
                                  className="flex items-center gap-1.5 text-[11px] font-semibold text-agriGreen hover:text-green-700 transition-colors disabled:opacity-50"
                                >
                                  {isTranslating ? (
                                    <><Loader2 className="w-3 h-3 animate-spin" /> Translating...</>
                                  ) : (
                                    <><Languages className="w-3 h-3" /> Translate to {currentLang?.label}</>
                                  )}
                                </button>
                              ) : (
                                <AnimatePresence>
                                  <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-agriGreen/5 border border-agriGreen/15 rounded-2xl px-4 py-3 mt-1"
                                  >
                                    <p className="text-[10px] font-black uppercase tracking-widest text-agriGreen mb-1 flex items-center gap-1">
                                      <Languages className="w-3 h-3" /> Gemini Translation · {currentLang?.flag} {currentLang?.label}
                                    </p>
                                    <p className="text-[14px] text-gray-700 font-medium leading-relaxed">{translated}</p>
                                    <button
                                      onClick={() => setTranslations(prev => { const n = { ...prev }; delete n[msgId]; return n; })}
                                      className="text-[10px] text-gray-400 hover:text-red-400 mt-1 font-semibold transition-colors"
                                    >
                                      ✕ Hide translation
                                    </button>
                                  </motion.div>
                                </AnimatePresence>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={scrollRef}></div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-8 bg-white border-t border-gray-50 relative">
              <div className="flex gap-4 items-center">
                <div className="flex-grow relative group">
                  <input
                    type="text"
                    placeholder={`Type in ${currentLang?.label}...`}
                    className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] py-5 px-8 pr-16 outline-none focus:ring-4 focus:ring-agriGreen/10 focus:border-agriGreen focus:bg-white transition-all font-medium"
                    value={newMessage}
                    onChange={handleTyping}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                    <Info className="w-5 h-5" />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-agriGreen hover:bg-agriDark text-white p-5 rounded-[2rem] shadow-xl shadow-green-200 hover:shadow-green-300 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default ChatPage;
