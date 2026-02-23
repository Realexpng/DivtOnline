
import React, { useState, useEffect, useRef } from 'react';
import { User, Language, ChatMessage, ChatSession } from '../types';
import { COLORS, LOCALE } from '../constants';
import { mockDb } from '../services/mockDb';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  lang: Language;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, user, lang }) => {
  const t = LOCALE[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isEnding, setIsEnding] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchSession = async () => {
    const chats = await mockDb.getChats();
    const session = chats.find(c => c.userId === user.id && c.isActive);
    
    if (!session && isOpen && !isEnding) {
      // Якщо адмін видалив чат
      setIsEnding(true);
      setTimeout(() => {
        setIsEnding(false);
        onClose();
      }, 2000);
      return;
    }

    if (session && JSON.stringify(session.messages) !== JSON.stringify(messages)) {
      setMessages([...session.messages]);
      
      // Відмічаємо як прочитане користувачем
      if (session.hasUnreadUser) {
        session.hasUnreadUser = false;
        await mockDb.saveChats(chats);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      const initChat = async () => {
        const chats = await mockDb.getChats();
        let session = chats.find(c => c.userId === user.id && c.isActive);
        
        if (!session) {
          session = {
            userId: user.id,
            userPib: user.pib,
            isActive: true,
            messages: [{
              id: 'welcome',
              senderId: 'admin',
              text: t.chat.welcome,
              timestamp: Date.now(),
              isSystem: true
            }]
          };
          await mockDb.saveChats([...chats, session]);
        }
        setMessages(session.messages);
      };
      initChat();

      const interval = setInterval(fetchSession, 5000);
      return () => clearInterval(interval);
    } else {
        setIsEnding(false);
    }
  }, [isOpen, user.id, t.chat.welcome]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isEnding]);

  const handleSend = async () => {
    if (!input.trim() || isEnding) return;

    const newMessage: ChatMessage = {
      id: Math.random().toString(36),
      senderId: user.id,
      text: input,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput('');

    const chats = await mockDb.getChats();
    const idx = chats.findIndex(c => c.userId === user.id && c.isActive);
    if (idx !== -1) {
      chats[idx].messages = updatedMessages;
      chats[idx].hasUnreadAdmin = true;
      chats[idx].hasUnreadUser = false;
      await mockDb.saveChats(chats);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-blue-900/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md h-[80vh] flex flex-col rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden border border-blue-50 relative">
        
        {isEnding && (
            <div className="absolute inset-0 bg-blue-900/90 z-50 flex flex-col items-center justify-center text-white text-center p-6 animate-fade-in">
                <svg className="w-16 h-16 mb-4 text-blue-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <h3 className="text-xl font-bold">{t.chat.chatEnded}</h3>
                <p className="text-sm text-blue-200 mt-2">Сесія завершена адміністрацією. Вся переписка видалена.</p>
            </div>
        )}

        <div className="p-6 border-b flex justify-between items-center bg-blue-900 text-white shadow-md">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </div>
              {!isEnding && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-blue-900"></div>}
            </div>
            <div>
              <h3 className="font-bold tracking-tight">{t.chat.title}</h3>
              <p className="text-[10px] uppercase font-bold text-blue-300 tracking-widest">Support Online</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-5 bg-slate-50/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'} animate-slide-up`}>
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${
                msg.senderId === user.id 
                  ? 'bg-blue-900 text-white rounded-br-none shadow-blue-100' 
                  : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'
              }`}>
                {msg.text}
                <div className={`text-[9px] mt-1 opacity-50 ${msg.senderId === user.id ? 'text-right' : 'text-left'}`}>
                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-white border-t border-slate-100">
          <div className="flex space-x-3">
            <input 
              type="text" 
              value={input}
              disabled={isEnding}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.chat.placeholder}
              className="flex-grow p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all outline-none font-medium shadow-inner disabled:opacity-50"
            />
            <button 
              onClick={handleSend}
              disabled={isEnding}
              className="bg-blue-900 text-white p-4 rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50"
            >
              <svg className="w-6 h-6 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
