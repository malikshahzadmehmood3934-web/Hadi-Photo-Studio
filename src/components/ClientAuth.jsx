import React, { useState } from 'react';
import { UserCheck, Eye, EyeOff, AlertCircle, Plus, LogIn, Lock, Mail, Phone, User, MapPin } from 'lucide-react';

export default function ClientAuth({
  onLogin,
  onCreateAccount,
  onForgotPassword,
  loginError,
  setLoginError,
  onBackToPortals
}) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'create'

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Registration inputs
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPass, setRegPass] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPass) {
      setLoginError?.('Please enter your email and password');
      return;
    }
    onLogin(loginEmail, loginPass);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPass) {
      setLoginError?.('Please fill in Name, Email and Password.');
      return;
    }
    onCreateAccount({
      name: regName,
      phone: regPhone,
      email: regEmail,
      address: regAddress,
      password: regPass
    });
  };

  return (
    <div className="max-w-md mx-auto my-6 bg-[#0f172a] rounded-2xl border border-amber-500/30 shadow-2xl overflow-hidden text-white">
      {/* Header */}
      <div className="p-6 text-center border-b border-slate-800 bg-gradient-to-b from-slate-900 to-[#0f172a]">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
          <UserCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black tracking-tight text-white">CLIENT PORTAL ACCESS</h2>
        <p className="text-xs text-amber-400 font-medium mt-1">Book Events, Calculate Rates & Manage Invoices</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/80 text-xs font-bold">
        <button
          type="button"
          onClick={() => { setActiveTab('login'); setLoginError?.(''); }}
          className={`flex-1 py-3.5 text-center transition-colors flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'login'
              ? 'border-amber-400 text-amber-400 bg-[#0f172a]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>LOGIN</span>
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('create'); setLoginError?.(''); }}
          className={`flex-1 py-3.5 text-center transition-colors flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'create'
              ? 'border-amber-400 text-amber-400 bg-[#0f172a]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>CREATE ACCOUNT</span>
        </button>
      </div>

      <div className="p-6">
        {loginError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{loginError}</span>
          </div>
        )}

        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="e.g. client@example.com"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-bold">Password</label>
                {onForgotPassword && (
                  <button
                    type="button"
                    onClick={() => onForgotPassword(loginEmail)}
                    className="text-[11px] text-amber-400 hover:underline font-semibold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass(!showLoginPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl transition-all uppercase tracking-wider text-xs cursor-pointer shadow-lg mt-2"
            >
              Sign In with Email
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="e.g. Ahmed Khan"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="e.g. ahmed@gmail.com"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Mobile / Phone (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="tel"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="e.g. 03001234567"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">City / Address (Optional)</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={regAddress}
                  onChange={e => setRegAddress(e.target.value)}
                  placeholder="e.g. Lahore, Pakistan"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showRegPass ? 'text' : 'password'}
                  value={regPass}
                  onChange={e => setRegPass(e.target.value)}
                  placeholder="Choose a strong password"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPass(!showRegPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl transition-all uppercase tracking-wider text-xs cursor-pointer shadow-lg mt-2"
            >
              Create Client Account
            </button>
          </form>
        )}

        {onBackToPortals && (
          <div className="pt-4 text-center border-t border-slate-800 mt-5">
            <button
              type="button"
              onClick={onBackToPortals}
              className="text-xs text-slate-400 hover:text-amber-400 font-semibold underline cursor-pointer"
            >
              ← Back to Portal Selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
