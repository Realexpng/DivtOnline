
import React, { useState, useEffect, useRef } from 'react';
import { User, Language, CertificateRequest, CertificateType, CertificateStatus, ChatSession } from '../../types';
import { mockDb } from '../../services/mockDb';
import { COLORS } from '../../constants';

interface AdminPanelProps {
  lang: Language;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ lang }) => {
  const [tab, setTab] = useState<'users' | 'certs' | 'chats'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [certs, setCerts] = useState<CertificateRequest[]>([]);
  const [certPage, setCertPage] = useState(1);
  const CERTS_PER_PAGE = 15;
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [chatReply, setChatReply] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat?.messages.length, selectedChat?.userId]);

  const refreshData = async () => {
    const allUsers = await mockDb.getUsers();
    setUsers(allUsers);
    const allCerts = await mockDb.getCertificates();
    setCerts([...allCerts].sort((a, b) => b.createdAt - a.createdAt));
    
    const allChats = await mockDb.getChats();
    setChats(allChats);
    
    if (selectedChat) {
      const current = allChats.find(c => c.userId === selectedChat.userId && c.isActive);
      if (current) {
        setSelectedChat(current);
      } else {
        setSelectedChat(null);
      }
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [selectedChat?.userId]);

  const handleDeleteUser = async (id: string) => {
    if (confirm('Ви впевнені, що хочете видалити цього користувача?')) {
      await mockDb.deleteUser(id);
      refreshData();
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const allUsers = await mockDb.getUsers();
    const idx = allUsers.findIndex(u => u.id === editingUser.id);
    
    if (allUsers[idx].login !== editingUser.login || allUsers[idx].password !== editingUser.password) {
      editingUser.sessionToken = undefined;
    }
    
    allUsers[idx] = editingUser;
    await mockDb.saveUsers(allUsers);
    setEditingUser(null);
    refreshData();
  };

  const handleCertStatus = async (id: string, status: CertificateStatus) => {
    const allCerts = await mockDb.getCertificates();
    const idx = allCerts.findIndex(c => c.id === id);
    if (idx !== -1) {
      allCerts[idx].status = status;
      await mockDb.saveCertificates(allCerts);
      refreshData();
    }
  };

  const handleCertDelete = async (id: string) => {
    if (confirm('Видалити цей запис? Це дія незворотна.')) {
      await mockDb.deleteCertificate(id);
      refreshData();
    }
  };

  const handleClearAllCerts = async () => {
    if (confirm('Видалити абсолютно всі довідки з бази даних? Вся історія замовлень зникне.')) {
      await mockDb.deleteAllCertificates();
      refreshData();
    }
  };

  const handleSendReply = async () => {
    if (!selectedChat || !chatReply.trim()) return;
    const updatedChats = await mockDb.getChats();
    const idx = updatedChats.findIndex(c => c.userId === selectedChat.userId && c.isActive);
    if (idx !== -1) {
      updatedChats[idx].messages.push({
        id: Math.random().toString(36),
        senderId: 'admin',
        text: chatReply,
        timestamp: Date.now()
      });
      updatedChats[idx].hasUnreadAdmin = false;
      updatedChats[idx].hasUnreadUser = true;
      await mockDb.saveChats(updatedChats);
      setChatReply('');
      refreshData();
    }
  };

  const handleEndChat = async (userId: string) => {
    if (confirm('Ви впевнені, що хочете ЗАВЕРШИТИ ТА ВИДАЛИТИ чат? Це видалить всю історію переписки в обох сторін.')) {
      await mockDb.deleteChat(userId);
      setSelectedChat(null);
      refreshData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 space-y-2">
          <button 
            onClick={() => setTab('users')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${tab === 'users' ? 'bg-blue-900 text-white shadow-lg' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            Користувачі
          </button>
          <button 
            onClick={() => setTab('certs')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-between ${tab === 'certs' ? 'bg-blue-900 text-white shadow-lg' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            Довідки
            {certs.filter(c => c.status === CertificateStatus.NEW).length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full">{certs.filter(c => c.status === CertificateStatus.NEW).length}</span>
            )}
          </button>
          <button 
            onClick={() => setTab('chats')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-between ${tab === 'chats' ? 'bg-blue-900 text-white shadow-lg' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            Чати
            {chats.filter(c => c.hasUnreadAdmin).length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full animate-pulse">{chats.filter(c => c.hasUnreadAdmin).length}</span>
            )}
          </button>
        </aside>

        <div className="flex-grow bg-white rounded-3xl shadow-sm border border-slate-100 p-6 min-h-[600px]">
          {tab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">Управління користувачами</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                    <tr>
                      <th className="px-4 py-3">ПІБ / Логін</th>
                      <th className="px-4 py-3">Email / Тел</th>
                      <th className="px-4 py-3">Роль</th>
                      <th className="px-4 py-3">Дії</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map(u => (
                      <tr key={u.id}>
                        <td className="px-4 py-4">
                          <div className="font-bold text-slate-900">{u.pib}</div>
                          <div className="text-slate-500 text-xs">@{u.login}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div>{u.email}</div>
                          <div className="text-slate-500">{u.phone}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-4 space-x-2">
                          <button onClick={() => setEditingUser(u)} className="text-blue-600 hover:underline">Edit</button>
                          {u.login !== 'admin' && (
                            <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:underline">Delete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'certs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Замовлені довідки</h2>
                <button 
                  onClick={handleClearAllCerts}
                  className="text-xs text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors border border-red-100 font-bold uppercase tracking-widest shadow-sm"
                >
                  Видалити все
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                    <tr>
                      <th className="px-4 py-3">Студент / Тел.</th>
                      <th className="px-4 py-3">Тип</th>
                      <th className="px-4 py-3">Файл</th>
                      <th className="px-4 py-3">Статус</th>
                      <th className="px-4 py-3">Дії</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {certs.slice((certPage - 1) * CERTS_PER_PAGE, certPage * CERTS_PER_PAGE).map(c => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="font-bold text-slate-800">{c.userPib}</div>
                          <div className="text-blue-600 text-xs font-semibold">{c.userPhone}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(c.createdAt).toLocaleString()}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs font-bold text-blue-900">{c.type === CertificateType.EDBO ? 'ЄДЕБО' : 'Навчання'}</span>
                        </td>
                        <td className="px-4 py-4">
                          {c.fileUrl ? (
                            <a 
                              href={c.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/></svg>
                              ПЕРЕГЛЯНУТИ PDF
                            </a>
                          ) : <span className="text-slate-300 text-[10px]">Немає файлу</span>}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${c.status === CertificateStatus.NEW ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 space-x-4">
                          {c.status === CertificateStatus.NEW && (
                            <button onClick={() => handleCertStatus(c.id, CertificateStatus.DONE)} className="text-green-600 font-bold hover:underline">Виконати</button>
                          )}
                          <button onClick={() => handleCertDelete(c.id)} className="text-red-500 hover:underline font-medium">Видалити</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {certs.length === 0 && <div className="text-center py-20 text-slate-400 flex flex-col items-center"><svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg><p className="font-bold uppercase tracking-widest text-[10px]">Список порожній</p></div>}
              </div>
              {Math.ceil(certs.length / CERTS_PER_PAGE) > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-6">
                  <button 
                    onClick={() => setCertPage(p => Math.max(1, p - 1))}
                    disabled={certPage === 1}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 disabled:opacity-50 font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
                  >
                    Попередня
                  </button>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Сторінка {certPage} з {Math.ceil(certs.length / CERTS_PER_PAGE)}
                  </span>
                  <button 
                    onClick={() => setCertPage(p => Math.min(Math.ceil(certs.length / CERTS_PER_PAGE), p + 1))}
                    disabled={certPage === Math.ceil(certs.length / CERTS_PER_PAGE)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 disabled:opacity-50 font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
                  >
                    Наступна
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'chats' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px] border rounded-2xl overflow-hidden shadow-inner bg-slate-100">
              <div className="border-r overflow-y-auto bg-slate-50">
                <h3 className="p-4 font-bold border-b sticky top-0 bg-slate-50 z-10 text-blue-900 uppercase tracking-widest text-xs">Активні чати</h3>
                {chats.length === 0 && <p className="p-4 text-sm text-slate-400 text-center mt-20">Немає активних чатів</p>}
                {chats.map(chat => (
                  <button 
                    key={chat.userId}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full text-left p-4 hover:bg-white transition-all border-b relative ${selectedChat?.userId === chat.userId ? 'bg-white border-l-4 border-l-blue-900 shadow-sm' : ''}`}
                  >
                    <div className="font-bold text-sm text-slate-800">{chat.userPib}</div>
                    <div className="text-xs text-slate-500 truncate mt-1">{chat.messages[chat.messages.length - 1]?.text}</div>
                    {chat.hasUnreadAdmin && (
                      <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-200"></span>
                    )}
                  </button>
                ))}
              </div>
              <div className="lg:col-span-2 flex flex-col bg-white h-full overflow-hidden">
                {selectedChat ? (
                  <>
                    <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm z-10 flex-shrink-0">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 leading-none">{selectedChat.userPib}</span>
                        <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest mt-1">З'єднання активне</span>
                      </div>
                      <button 
                        onClick={() => handleEndChat(selectedChat.userId)}
                        className="text-[10px] text-red-600 font-black hover:bg-red-50 px-4 py-2 rounded-xl border border-red-100 transition-all uppercase tracking-widest"
                      >
                        Завершити чат
                      </button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50/50 min-h-0">
                      {selectedChat.messages.map(m => (
                        <div key={m.id} className={`flex ${m.senderId === 'admin' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-4 rounded-2xl max-w-[80%] text-sm shadow-sm ${m.senderId === 'admin' ? 'bg-blue-900 text-white rounded-br-none' : 'bg-white border border-slate-200 rounded-bl-none text-slate-800 font-medium'}`}>
                            {m.text}
                            <div className={`text-[9px] mt-1 opacity-50 ${m.senderId === 'admin' ? 'text-right' : 'text-left'}`}>
                                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 bg-white border-t flex space-x-3 flex-shrink-0">
                      <input 
                        type="text" 
                        value={chatReply}
                        onChange={(e) => setChatReply(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                        className="flex-grow border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-900 outline-none bg-white text-slate-900 shadow-inner font-medium"
                        placeholder="Напишіть відповідь..."
                      />
                      <button 
                        onClick={handleSendReply} 
                        className="bg-blue-900 text-white px-8 rounded-2xl text-sm font-black shadow-lg shadow-blue-100 hover:bg-blue-800 transition-all uppercase tracking-widest active:scale-95"
                      >
                        OK
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center text-slate-400 space-y-6">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
                        <svg className="w-12 h-12 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                    </div>
                    <p className="font-black uppercase tracking-[0.2em] text-[10px]">Оберіть чат для переписки</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-900/40 p-4 backdrop-blur-sm">
          <form onSubmit={handleUpdateUser} className="bg-white w-full max-w-md p-10 rounded-[2rem] shadow-2xl space-y-6 border border-slate-100">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">Редагувати дані</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">ПІБ</label>
                <input required className="w-full border border-slate-100 p-4 rounded-2xl focus:ring-2 focus:ring-blue-900 outline-none bg-slate-50 font-medium" value={editingUser.pib} onChange={e => setEditingUser({...editingUser, pib: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Логін</label>
                <input required className="w-full border border-slate-100 p-4 rounded-2xl focus:ring-2 focus:ring-blue-900 outline-none bg-slate-50 font-medium" value={editingUser.login} onChange={e => setEditingUser({...editingUser, login: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Пароль</label>
                <input required className="w-full border border-slate-100 p-4 rounded-2xl focus:ring-2 focus:ring-blue-900 outline-none bg-slate-50 font-medium" type="password" value={editingUser.password} onChange={e => setEditingUser({...editingUser, password: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Телефон</label>
                <input required className="w-full border border-slate-100 p-4 rounded-2xl focus:ring-2 focus:ring-blue-900 outline-none bg-slate-50 font-medium" value={editingUser.phone} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} />
              </div>
            </div>
            <div className="flex space-x-4 pt-4">
              <button type="button" onClick={() => setEditingUser(null)} className="flex-grow bg-slate-100 py-4 rounded-2xl font-black text-slate-500 uppercase tracking-widest text-xs">Скасувати</button>
              <button type="submit" className="flex-grow bg-blue-900 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 uppercase tracking-widest text-xs">Зберегти</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
