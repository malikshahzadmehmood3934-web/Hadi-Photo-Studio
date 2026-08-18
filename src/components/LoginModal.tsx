import React, { useState } from 'react';
import { Camera, Eye, EyeOff, ShieldCheck, UserCheck, UserPlus, LogIn, Lock } from 'lucide-react';
import { StorageService } from '../lib/storage';
import { StaffMember, StudioSettings, UserRole } from '../types';

interface LoginModalProps {
  settings: StudioSettings;
  onAdminLoginSuccess: () => void;
  onStaffLoginSuccess: (staff: StaffMember) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  settings,
  onAdminLoginSuccess,
  onStaffLoginSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'staff_login' | 'staff_signup'>('admin');

  // Admin state
  const [adminUser, setAdminUser] = useState(settings.adminEmail || 'shahzad123');
  const [adminPass, setAdminPass] = useState(settings.adminPass || 'admin@123');
  const [showAdminPass, setShowAdminPass] = useState(false);

  // Staff state
  const [stName, setStName] = useState('');
  const [stPhone, setStPhone] = useState('');
  const [stPass, setStPass] = useState('');
  const [stSpecialty, setStSpecialty] = useState('Lead Photographer');
  const [showStaffPass, setShowStaffPass] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const currentSettings = StorageService.getSettings();
    if (
      adminUser.trim() === currentSettings.adminEmail &&
      adminPass.trim() === currentSettings.adminPass
    ) {
      onAdminLoginSuccess();
    } else {
      setErrorMsg('Invalid Admin Login Credentials! Default is shahzad123 / admin@123');
    }
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const allStaff = StorageService.getStaff();
    const found = allStaff.find(
      s => s.phone.trim() === stPhone.trim() && s.password.trim() === stPass.trim()
    );

    if (found) {
      onStaffLoginSuccess(found);
    } else {
      setErrorMsg('Staff Login Failed! Check Phone and Password.');
    }
  };

  const handleStaffSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!stName.trim() || !stPhone.trim() || !stPass.trim()) {
      setErrorMsg('Please fill in all required fields (Name, Phone, Password).');
      return;
    }

    const allStaff = StorageService.getStaff();
    if (allStaff.some(s => s.phone.trim() === stPhone.trim())) {
      setErrorMsg('A staff member with this phone number already exists!');
      return;
    }

    const newStaff = StorageService.addStaffMember({
      name: stName.trim(),
      phone: stPhone.trim(),
      password: stPass.trim(),
      role: 'staff',
      specialty: stSpecialty
    });

    setSuccessMsg('Account created successfully! You can now log in.');
    setActiveTab('staff_login');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f1f5f9] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xl relative z-10 text-slate-900">
        
        {/* Header Icon */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm mb-3">
            <Camera className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {settings.name || 'HADI PHOTO STUDIO'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-wider text-[10px]">
            Staff Operations & Duty Control Panel
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 bg-[#0f172a] p-1 rounded-lg border border-slate-800 mb-6 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('admin'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-1.5 rounded flex items-center justify-center gap-1 transition-all text-xs ${
              activeTab === 'admin'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
          <button
            onClick={() => { setActiveTab('staff_login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-1.5 rounded flex items-center justify-center gap-1 transition-all text-xs ${
              activeTab === 'staff_login'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Staff Login</span>
          </button>
          <button
            onClick={() => { setActiveTab('staff_signup'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-1.5 rounded flex items-center justify-center gap-1 transition-all text-xs ${
              activeTab === 'staff_signup'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Signup</span>
          </button>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-xs font-semibold text-green-700">
            {successMsg}
          </div>
        )}

        {/* Admin Login Form */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                Admin Email / Username
              </label>
              <input
                type="text"
                value={adminUser}
                onChange={e => setAdminUser(e.target.value)}
                placeholder="shahzad123"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showAdminPass ? 'text' : 'password'}
                  value={adminPass}
                  onChange={e => setAdminPass(e.target.value)}
                  placeholder="admin@123"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 pr-9 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPass(!showAdminPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider"
            >
              <LogIn className="w-4 h-4" />
              <span>Login to Admin Dashboard</span>
            </button>

            <div className="text-center mt-3 text-[11px] text-slate-500">
              Default Admin Login: <code className="text-blue-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">shahzad123</code> / <code className="text-blue-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">admin@123</code>
            </div>
          </form>
        )}

        {/* Staff Login Form */}
        {activeTab === 'staff_login' && (
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={stPhone}
                onChange={e => setStPhone(e.target.value)}
                placeholder="e.g. 03001234567"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showStaffPass ? 'text' : 'password'}
                  value={stPass}
                  onChange={e => setStPass(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 pr-9 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowStaffPass(!showStaffPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showStaffPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider"
            >
              <LogIn className="w-4 h-4" />
              <span>Login as Staff Member</span>
            </button>

            <div className="text-center mt-3 text-[11px] text-slate-500">
              Demo Staff Login: <code className="text-blue-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">03001234567</code> / <code className="text-blue-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">staff123</code>
            </div>
          </form>
        )}

        {/* Staff Signup Form */}
        {activeTab === 'staff_signup' && (
          <form onSubmit={handleStaffSignup} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                Full Staff Name
              </label>
              <input
                type="text"
                value={stName}
                onChange={e => setStName(e.target.value)}
                placeholder="e.g. Shahzad Mehmood"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={stPhone}
                onChange={e => setStPhone(e.target.value)}
                placeholder="e.g. 03058304908"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                Role / Primary Specialty
              </label>
              <select
                value={stSpecialty}
                onChange={e => setStSpecialty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              >
                <option value="Lead Photographer">Lead Photographer</option>
                <option value="Candid Videographer">Candid Videographer</option>
                <option value="Drone Specialist">Drone Specialist</option>
                <option value="Lighting Assistant">Lighting Assistant</option>
                <option value="Photo & Video Hybrid">Photo & Video Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showStaffPass ? 'text' : 'password'}
                  value={stPass}
                  onChange={e => setStPass(e.target.value)}
                  placeholder="Create Password"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 pr-9 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowStaffPass(!showStaffPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showStaffPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Staff Account</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
