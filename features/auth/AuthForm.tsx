
import React, { useState } from 'react';
import { User, Language } from '../../types';
import { LOCALE, LOGO_PLACEHOLDER } from '../../constants';
import { authService } from '../../services/authService';

interface AuthFormProps {
  lang: Language;
  onLogin: (user: User) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ lang, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const t = LOCALE[lang];

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    const loginVal = formData.get('login') as string;
    const passVal = formData.get('password') as string;

    if (isLogin) {
      const remember = formData.get('remember') === 'on';
      const user = await authService.login(loginVal, passVal, remember);
      if (user) {
        onLogin(user);
      } else {
        setError(t.auth.errorLogin);
      }
    } else {
      const pib = formData.get('pib') as string;
      const email = formData.get('email') as string;
      const phone = formData.get('phone') as string;
      const confirmPass = formData.get('confirmPassword') as string;

      if (passVal !== confirmPass) {
        setError(t.auth.errorPassMismatch);
        return;
      }

      if (!/^\+380\d{9}$/.test(phone)) {
        setError(t.auth.errorPhoneFormat);
        return;
      }

      const res = await authService.register({ pib, login: loginVal, email, phone, password: passVal });
      if (res.success) {
        setSuccess(t.auth.successRegister);
        setIsLogin(true);
      } else {
        setError(res.message || t.auth.errorRegister);
      }
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
      <div className="bg-slate-900 p-8 text-center space-y-4">
        <img src={LOGO_PLACEHOLDER} alt="Logo" className="w-20 h-20 mx-auto rounded-full border-4 border-slate-800" />
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{isLogin ? t.auth.login : t.auth.register}</h2>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">{t.auth.portalName}</p>
        </div>
      </div>

      <div className="p-8">
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-bold rounded-2xl border border-red-100">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm font-bold rounded-2xl border border-green-100">{success}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{t.auth.pib}</label>
              <input required name="pib" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all outline-none" placeholder="Іванов Іван Іванович" />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{t.auth.username}</label>
            <input required name="login" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all outline-none" placeholder="m_ivanov" />
          </div>

          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{t.auth.email}</label>
                <input required name="email" type="email" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all outline-none" placeholder="ivanov@example.com" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{t.auth.phone}</label>
                <input required name="phone" pattern="^\+380\d{9}$" title="Формат: +380XXXXXXXXX" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all outline-none" placeholder="+380000000000" />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{t.auth.password}</label>
            <input required name="password" type="password" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all outline-none" placeholder="••••••••" />
          </div>

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{t.auth.confirmPassword}</label>
              <input required name="confirmPassword" type="password" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-600 transition-all outline-none" placeholder="••••••••" />
            </div>
          )}

          {isLogin && (
            <div className="flex items-center space-x-2 py-2">
              <input type="checkbox" name="remember" id="remember" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
              <label htmlFor="remember" className="text-xs text-slate-500 font-medium">{t.auth.rememberMe}</label>
            </div>
          )}

          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all transform hover:scale-[1.02] shadow-xl shadow-slate-200">
            {isLogin ? t.auth.submit : t.auth.signup}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest"
          >
            {isLogin ? t.auth.noAccount : t.auth.alreadyHasAccount}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
