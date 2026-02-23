
import React from 'react';
import { User, Language } from '../types';
import { COLORS, LOCALE, LOGO_PLACEHOLDER } from '../constants';

interface LayoutProps {
  user: User | null;
  lang: Language;
  setLang: (l: Language) => void;
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, lang, setLang, children, onLogout }) => {
  const t = LOCALE[lang];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center p-2 border border-blue-100 shadow-sm">
                <img 
                  src={LOGO_PLACEHOLDER} 
                  alt="DIWT Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-black tracking-tighter uppercase italic" style={{ color: COLORS.primary }}>
                  ВСП «ДІВТ НТУ»
                </h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Academic Portal</p>
              </div>
            </div>

            <div className="flex items-center space-x-8">
              <div className="flex bg-slate-100 rounded-xl p-1 shadow-inner">
                <button 
                  onClick={() => setLang('uk')}
                  className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${lang === 'uk' ? 'bg-white text-blue-900 shadow-md transform scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                >UA</button>
                <button 
                  onClick={() => setLang('en')}
                  className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${lang === 'en' ? 'bg-white text-blue-900 shadow-md transform scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                >EN</button>
              </div>

              {user && (
                <div className="flex items-center space-x-6">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-black text-slate-800 tracking-tight">
                      {user.pib}
                    </span>
                    <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">{user.role}</span>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="text-xs font-black px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-red-600 transition-all shadow-lg hover:shadow-red-200 uppercase tracking-widest"
                  >
                    {t.nav.logout}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="text-center md:text-left space-y-4">
               <div className="flex items-center space-x-3 justify-center md:justify-start">
                  <img src={LOGO_PLACEHOLDER} className="w-8 h-8 brightness-0 invert" alt="Footer Logo" />
                  <span className="font-black text-xl tracking-tighter uppercase italic">ВСП «ДІВТ НТУ»</span>
               </div>
               <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-sm">
                Відокремлений структурний підрозділ «Дунайський інститут водного транспорту Національного транспортного університету»
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">
                © {new Date().getFullYear()} DIWT Portal • All Rights Reserved
              </p>
              <div className="mt-6 flex justify-center md:justify-end space-x-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <a href="https://dfmrt.duit.edu.ua/" className="hover:text-blue-400 transition-colors" target="_blank" rel="noopener noreferrer">Website</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Support</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
