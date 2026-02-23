
import React, { useState, useEffect } from 'react';
import { User, Language, CertificateType, CertificateStatus, CertificateRequest } from './types';
import { authService } from './services/authService';
import { mockDb } from './services/mockDb';
import Layout from './components/Layout';
import AuthForm from './features/auth/AuthForm';
import AdminPanel from './features/admin/AdminPanel';
import ChatModal from './components/ChatModal';
import { COLORS, AVATARS, LOCALE } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Language>('uk');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
  
  // Модальне вікно підтвердження
  const [confirmOrder, setConfirmOrder] = useState<{ type: CertificateType, file?: File } | null>(null);

  const t = LOCALE[lang];

  useEffect(() => {
    const initAuth = async () => {
      const u = await authService.getCurrentUser();
      setUser(u);
      setLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsChatOpen(false);
    setShowProfile(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const phone = formData.get('phone') as string;

    if (!/^\+380\d{9}$/.test(phone)) {
      setMessage({ text: 'Телефон має бути у форматі +380XXXXXXXXX', type: 'error' });
      return;
    }
    
    const updatedUser: User = {
      ...user,
      pib: formData.get('pib') as string,
      login: formData.get('login') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      gender: formData.get('gender') as 'male' | 'female',
    };

    const newPass = formData.get('password') as string;
    if (newPass) updatedUser.password = newPass;

    const allUsers = await mockDb.getUsers();
    const idx = allUsers.findIndex(u => u.id === user.id);
    
    if (allUsers[idx].login !== updatedUser.login || (newPass && allUsers[idx].password !== newPass)) {
      updatedUser.sessionToken = Math.random().toString(36).substring(7);
      localStorage.setItem('diwt_session', JSON.stringify({ login: updatedUser.login, token: updatedUser.sessionToken }));
    }

    allUsers[idx] = updatedUser;
    await mockDb.saveUsers(allUsers);
    setUser(updatedUser);
    setMessage({ text: t.dashboard.save, type: 'success' });
    setShowProfile(false);
  };

  const processOrder = async () => {
    if (!user || !confirmOrder) return;
    const { type, file } = confirmOrder;

    const newCert: CertificateRequest = {
      id: Math.random().toString(36),
      userId: user.id,
      userPib: user.pib,
      userPhone: user.phone, // Store phone number
      type,
      status: CertificateStatus.NEW,
      createdAt: Date.now(),
      fileName: file?.name,
      fileUrl: file ? URL.createObjectURL(file) : undefined
    };

    const currentCerts = await mockDb.getCertificates();
    await mockDb.saveCertificates([...currentCerts, newCert]);
    setMessage({ text: t.dashboard.certSuccess, type: 'success' });
    setConfirmOrder(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div></div>;
  }

  if (!user) {
    return (
      <Layout user={null} lang={lang} setLang={setLang} onLogout={handleLogout}>
        <div className="flex items-center justify-center py-12 px-4 min-h-[80vh]">
          <AuthForm lang={lang} onLogin={setUser} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} lang={lang} setLang={setLang} onLogout={handleLogout}>
      {/* Notifications */}
      {message && (
        <div className={`fixed top-24 right-4 z-[100] max-w-sm w-full p-5 rounded-2xl shadow-2xl border-l-8 transform transition-all animate-bounce ${
          message.type === 'success' ? 'bg-white border-green-500 text-slate-800' : 'bg-white border-red-500 text-slate-800'
        }`}>
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-full ${message.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p className="text-sm font-bold leading-tight">{message.text}</p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-blue-900/40 backdrop-blur-md p-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center space-y-6 border border-blue-100">
            <div className="w-20 h-20 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mx-auto">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">Підтвердження</h3>
              <p className="text-sm text-slate-500">{t.dashboard.confirmOrder}</p>
              <p className="text-xs font-bold text-blue-900 uppercase tracking-widest">{confirmOrder.type === CertificateType.EDBO ? t.dashboard.certEdbo : t.dashboard.certStudy}</p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button onClick={() => setConfirmOrder(null)} className="flex-grow py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors uppercase text-xs tracking-widest">{t.dashboard.btnCancel}</button>
              <button onClick={processOrder} className="flex-grow py-3 bg-blue-900 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-800 transition-colors uppercase text-xs tracking-widest">{t.dashboard.btnOrder}</button>
            </div>
          </div>
        </div>
      )}

      {user.role === 'admin' ? (
        <AdminPanel lang={lang} />
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Header Card */}
          <section className="bg-blue-900 rounded-[2.5rem] shadow-2xl p-10 flex flex-col md:flex-row items-center gap-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
            
            <div className={`w-36 h-36 rounded-full flex-shrink-0 flex items-center justify-center p-2 border-4 z-10 overflow-hidden ${user.gender === 'female' ? 'bg-pink-400/20 border-pink-400' : 'bg-white/10 border-blue-400'}`}>
              <div className="w-full h-full">
                {user.gender === 'female' ? AVATARS.female : AVATARS.male}
              </div>
            </div>
            <div className="flex-grow text-center md:text-left z-10">
              <h2 className="text-4xl font-bold tracking-tight">{t.dashboard.welcome} {user.pib.split(' ')[0]}!</h2>
              <p className="text-blue-200 font-medium text-lg mt-1">Здобувач освіти • ДІВТ НТУ</p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="px-4 py-1 bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">#{user.login}</span>
                <span className="px-4 py-1 bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">{user.phone}</span>
                <button 
                  onClick={() => setShowProfile(!showProfile)}
                  className="px-4 py-1 bg-blue-400 text-blue-900 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
                >
                  {t.nav.settings}
                </button>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Settings (HIDDEN BY DEFAULT) */}
            {showProfile && (
              <section className="bg-white rounded-[2.5rem] shadow-xl border border-blue-50 p-8 space-y-6 animate-fade-in">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="text-xl font-bold flex items-center text-slate-800">
                    <svg className="w-6 h-6 mr-2 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    {t.dashboard.editProfile}
                  </h3>
                  <button onClick={() => setShowProfile(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.auth.pib}</label>
                      <input name="pib" defaultValue={user.pib} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-900 transition-all outline-none text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Логін</label>
                      <input name="login" defaultValue={user.login} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-900 transition-all outline-none text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.auth.email}</label>
                      <input name="email" type="email" defaultValue={user.email} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-900 transition-all outline-none text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.auth.phone}</label>
                      <input name="phone" pattern="^\+380\d{9}$" title="Формат: +380XXXXXXXXX" defaultValue={user.phone} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-900 transition-all outline-none text-sm" placeholder="+380000000000" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.auth.password}</label>
                      <input name="password" type="password" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-900 transition-all outline-none text-sm" placeholder="••••••••" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.dashboard.gender}</label>
                      <select name="gender" defaultValue={user.gender} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-900 transition-all outline-none text-sm font-bold text-slate-700">
                        <option value="male">{t.dashboard.male}</option>
                        <option value="female">{t.dashboard.female}</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all transform hover:scale-[1.01]">
                    {t.dashboard.save}
                  </button>
                </form>
              </section>
            )}

            {/* Certificate System */}
            <section className={`space-y-6 ${!showProfile ? 'lg:col-span-2' : ''}`}>
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-blue-50 p-10 space-y-8">
                <h3 className="text-2xl font-bold flex items-center text-slate-800 tracking-tight">
                  <svg className="w-8 h-8 mr-3 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  {t.nav.certificates}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <button 
                    onClick={() => setConfirmOrder({ type: CertificateType.STUDY })}
                    className="flex flex-col items-center p-8 border-2 border-slate-50 rounded-3xl hover:border-blue-900 hover:bg-blue-50 transition-all group shadow-sm"
                  >
                    <div className="w-16 h-16 bg-blue-100 rounded-[1.5rem] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform group-hover:rotate-3">
                      <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                    </div>
                    <span className="font-bold text-slate-700 text-center tracking-tight leading-snug">{t.dashboard.certStudy}</span>
                  </button>

                  <div className="flex flex-col items-center p-8 border-2 border-slate-50 rounded-3xl hover:border-blue-900 hover:bg-blue-50 transition-all group relative overflow-hidden shadow-sm">
                    <input 
                      type="file" 
                      accept=".pdf"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setConfirmOrder({ type: CertificateType.EDBO, file });
                      }}
                    />
                    <div className="w-16 h-16 bg-blue-100 rounded-[1.5rem] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform group-hover:-rotate-3">
                      <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                    </div>
                    <span className="font-bold text-slate-700 text-center tracking-tight leading-snug">{t.dashboard.certEdbo}</span>
                  </div>
                </div>
                <div className="p-5 bg-red-50 rounded-[1.5rem] border border-red-100 flex items-start space-x-3">
                   <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                  <p className="text-[11px] text-red-600 font-bold leading-relaxed">
                    <span className="uppercase mr-1 tracking-widest">Увага (ЄДЕБО):</span> {t.dashboard.edboWarning}
                  </p>
                </div>
              </div>

              {/* Chat CTA */}
              <button 
                onClick={() => setIsChatOpen(true)}
                className="w-full bg-blue-900 text-white p-8 rounded-[2.5rem] flex items-center justify-between group hover:bg-slate-900 transition-all shadow-2xl shadow-blue-200"
              >
                <div className="text-left">
                  <h4 className="font-bold text-xl tracking-tight">{t.nav.chat}</h4>
                  <p className="text-blue-200/60 text-xs font-medium uppercase tracking-widest mt-1">Зв'язок з модератором</p>
                </div>
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all group-hover:rotate-12 border border-white/10">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                </div>
              </button>
            </section>
          </div>
        </div>
      )}

      {/* Chat Component */}
      <ChatModal 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        user={user} 
        lang={lang} 
      />
    </Layout>
  );
};

export default App;
