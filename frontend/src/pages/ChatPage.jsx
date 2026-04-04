import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';
import { 
  Send, 
  User, 
  MessageSquare, 
  Search, 
  ArrowLeft, 
  MoreHorizontal,
  Loader2,
  Circle,
  Phone,
  Video,
  Info
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const socket = io('http://localhost:5000');

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

  useEffect(() => {
    if (user?._id) {
      socket.emit('join', user._id);
    }

    socket.on('message', (msg) => {
      // If message is for current open chat
      if (recipient && (msg.sender._id === recipient._id || msg.sender === recipient._id)) {
        setMessages((prev) => [...prev, msg]);
      }
      // Update history/sidebar even if chat not open
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
      const { data } = await axios.get('http://localhost:5000/api/messages/conversations/list', config);
      setHistory(data);
    } catch (err) {
      console.error("Error fetching history:", err);
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
          const { data } = await axios.get(`http://localhost:5000/api/messages/${recipient._id}`, config);
          setMessages(data);
        } catch (err) {
          console.error("Error fetching chat:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchConversation();
  }, [recipient, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !recipient) return;

    socket.emit('sendMessage', {
      senderId: user._id,
      receiverId: recipient._id,
      content: newMessage
    });

    setNewMessage('');
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (recipient) {
      socket.emit('typing', { senderId: user._id, receiverId: recipient._id });
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 overflow-hidden">
      {/* Sidebar - Contacts List */}
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
                  recipient?._id === contact._id ? "bg-white/20" : "bg-gray-100 text-gray-400 group-hover:bg-agriGreen/10 group-hover:text-agriGreen"
                )}>
                  <User className="w-6 h-6" />
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <p className={cn(
                    "font-black text-lg tracking-tight leading-none mb-1",
                    recipient?._id === contact._id ? "text-white" : "text-gray-900"
                  )}>{contact.name}</p>
                </div>
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
            <div className="px-10 py-6 border-b border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
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
              <div className="flex items-center gap-3">
                <button className="p-3 hover:bg-gray-50 rounded-2xl transition-colors text-gray-400 hover:text-agriGreen">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-3 hover:bg-gray-50 rounded-2xl transition-colors text-gray-400 hover:text-agriGreen">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-3 hover:bg-gray-50 rounded-2xl transition-colors text-gray-400">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Message Feed */}
            <div className="flex-grow overflow-y-auto p-10 space-y-8 bg-gray-50/30 custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-10 h-10 animate-spin text-agriGreen" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <span className="bg-white/80 px-4 py-1.5 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 shadow-sm">
                      Messaging Securely
                    </span>
                  </div>
                  {messages.map((msg, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${msg.sender === user._id || msg.sender?._id === user._id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] p-5 rounded-[2.5rem] shadow-sm relative group ${
                        msg.sender === user._id || msg.sender?._id === user._id
                          ? 'bg-agriGreen text-white rounded-br-none shadow-green-100' 
                          : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                      }`}>
                        <p className="text-[15px] font-medium leading-relaxed">{msg.content}</p>
                        <p className={`text-[10px] mt-2 font-black uppercase tracking-wider opacity-40 ${msg.sender === user._id || msg.sender?._id === user._id ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
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
                    placeholder="Type your message to negotiate..." 
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
