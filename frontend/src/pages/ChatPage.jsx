import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';
import { Send, User, MessageSquare, Search, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

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
  const scrollRef = useRef();

  useEffect(() => {
    if (user?._id) {
      socket.emit('join', { userId: user._id });
    }

    socket.on('message', (msg) => {
       if (recipient && (msg.sender === recipient._id || msg.sender === user._id)) {
          setMessages((prev) => [...prev, msg]);
       }
    });

    return () => socket.off('message');
  }, [user, recipient]);

  useEffect(() => {
    const fetchConversation = async () => {
      if (recipient?._id) {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.get(`http://localhost:5000/api/messages/${recipient._id}`, config);
          setMessages(data);
        } catch (err) {
          console.error("Error fetching chat:", err);
        }
      }
    };
    fetchConversation();
  }, [recipient, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !recipient) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('http://localhost:5000/api/messages', {
        receiverId: recipient._id,
        content: newMessage
      }, config);

      socket.emit('sendMessage', {
        senderId: user._id,
        receiverId: recipient._id,
        content: newMessage
      });

      setMessages((prev) => [...prev, data]);
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex gap-6 animate-fade-in relative pb-10">
      {/* Sidebar - Contacts List */}
      <div className="hidden lg:flex w-80 glass flex-col rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
           <h2 className="text-xl font-black text-slate-800 mb-4">Messages</h2>
           <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input 
                type="text" placeholder="Search contacts..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-agriGreen/10"
              />
           </div>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-2">
           {/* Mock history logic */}
           <div className="p-4 bg-agriGreen hover:bg-agriGreen/90 text-white rounded-2xl cursor-pointer transition-all flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                 <User size={20} />
              </div>
              <div>
                 <p className="text-sm font-black tracking-tight">{recipient?.name || "Active Chat"}</p>
                 <p className="text-[10px] font-bold opacity-70 truncate max-w-[120px]">Online</p>
              </div>
           </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-grow glass flex flex-col rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 overflow-hidden relative">
         {!recipient ? (
           <div className="flex-grow flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 bg-agriGreen/10 rounded-3xl flex items-center justify-center text-agriGreen mb-6 shadow-inner">
                 <MessageSquare size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-800">Your Secure Messenger</h2>
              <p className="text-slate-500 mt-2 max-w-sm">Connect directly with farmers or buyers across East Hararghe to negotiate and grow your business.</p>
           </div>
         ) : (
           <>
             {/* Chat Header */}
             <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-agriGreen/10 rounded-2xl flex items-center justify-center text-agriGreen">
                      <User size={24} />
                   </div>
                   <div>
                      <h3 className="font-black text-slate-800 tracking-tight">{recipient.name}</h3>
                      <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                      </p>
                   </div>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                   <MoreHorizontal size={20} />
                </button>
             </div>

             {/* Message Feed */}
             <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-slate-50/30">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === user._id ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm tracking-tight ${
                       msg.sender === user._id 
                         ? 'bg-agriGreen text-white rounded-br-none' 
                         : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                     }`}>
                        <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                        <p className={`text-[9px] mt-2 font-bold uppercase opacity-50 ${msg.sender === user._id ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                     </div>
                  </div>
                ))}
                <div ref={scrollRef}></div>
             </div>

             {/* Input Bar */}
             <form onSubmit={handleSend} className="p-6 bg-white/80 border-t border-slate-100 backdrop-blur">
                <div className="flex gap-4 items-center">
                   <input 
                     type="text" 
                     placeholder="Type your message to negotiation harvest..." 
                     className="flex-grow input-field py-4"
                     value={newMessage}
                     onChange={(e) => setNewMessage(e.target.value)}
                   />
                   <button type="submit" className="btn-primary p-4 rounded-2xl shadow-green-200/50">
                      <Send size={20} />
                   </button>
                </div>
             </form>
           </>
         )}
      </div>
    </div>
  );
};

export default ChatPage;
