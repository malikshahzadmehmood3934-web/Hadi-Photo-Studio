import React, { useState } from 'react';
import { Briefcase, Eye, EyeOff, AlertCircle, Plus, LogIn, Lock, Mail, Phone, User, Camera } from 'lucide-react';

export default function StaffAuth({
  onLogin,
  onRegister,
  onForgotPassword,
  loginError,
  setLoginError,
  onBackToPortals
}) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Registration inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState('Lead Photographer');
  const [regPass, setRegPass] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPass) {
      setLoginError?.('Please enter your staff email and password.');
      return;
    }
    onLogin(loginEmail, loginPass);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPass) {
      setLoginError?.('Please fill in Staff Name, Email, and Password.');
      return;
    }
    onRegister({
      name: regName,
      email: regEmail,
      phone: regPhone,
      role: regRole,
      password: regPass
    });
    // Switch to login tab and notify
    setActiveTab('login');
  };

  return (
    <div className="max-w-md mx-auto my-6 bg-[#0f172a] rounded-2xl border border-blue-500/40 shadow-2xl overflow-hidden text-white">
      {/* Header */}
      <div className="p-6 text-center border-b border-slate-800 bg-gradient-to-b from-slate-900 to-[#0f172a]">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg">
          <Briefcase className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black tracking-tight text-white">STAFF PORTAL ACCESS</h2>
        <p className="text-xs text-blue-400 font-medium mt-1">Crew Assignments, Schedules & Duty Management</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/80 text-xs font-bold">
        <button
          type="button"
          onClick={() => { setActiveTab('login'); setLoginError?.(''); }}
          className={`flex-1 py-3.5 text-center transition-colors flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'login'
              ? 'border-blue-400 text-blue-400 bg-[#0f172a]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>STAFF LOGIN</span>
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('register'); setLoginError?.(''); }}
          className={`flex-1 py-3.5 text-center transition-colors flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'register'
              ? 'border-blue-400 text-blue-400 bg-[#0f172a]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>CREATE STAFF ACCOUNT</span>
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
              <label className="block text-slate-300 font-bold mb-1">Staff Email or Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="Enter staff email address"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:border-blue-400 outline-none"
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
                    className="text-[11px] text-blue-400 hover:underline font-semibold cursor-pointer"
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-white placeholder-slate-500 focus:border-blue-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass(!showLoginPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl transition-all uppercase tracking-wider text-xs cursor-pointer shadow-lg mt-2"
            >
              Sign In to Staff Portal
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Staff Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="e.g. Ali Raza"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:border-blue-400 outline-none"
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
                  placeholder="e.g. staff.member@hadistudio.com"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:border-blue-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Mobile / WhatsApp Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="tel"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="e.g. 03001234567"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:border-blue-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Primary Role / Skill *</label>
              <div className="relative">
                <Camera className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <select
                  value={regRole}
                  onChange={e => setRegRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-white focus:border-blue-400 outline-none"
                >
                  <option value="Lead Photographer">Lead Photographer</option>
                  <option value="Cinematographer / Video">Cinematographer / Video</option>
                  <option value="Drone Pilot">Drone Pilot</option>
                  <option value="Female Photographer">Female Photographer</option>
                  <option value="Video Editor">Video Editor</option>
                  <option value="Assistant / Lighting">Assistant / Lighting</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Account Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showRegPass ? 'text' : 'password'}
                  value={regPass}
                  onChange={e => setRegPass(e.target.value)}
                  placeholder="Choose a staff password"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-white placeholder-slate-500 focus:border-blue-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPass(!showRegPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300">
              ℹ️ Staff account registrations require approval by Admin before login access is activated.
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl transition-all uppercase tracking-wider text-xs cursor-pointer shadow-lg mt-2"
            >
              Submit Staff Registration
            </button>
          </form>
        )}

        {onBackToPortals && (
          <div className="pt-4 text-center border-t border-slate-800 mt-5">
            <button
              type="button"
              onClick={onBackToPortals}
              className="text-xs text-slate-400 hover:text-blue-400 font-semibold underline cursor-pointer"
            >
              ← Back to Portal Selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
