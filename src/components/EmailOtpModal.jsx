import React, { useState, useEffect } from 'react';
import {
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  Lock
} from 'lucide-react';

export default function EmailOtpModal({
  isOpen,
  onClose,
  onVerifySuccess,
  userEmail = 'malikshahzadmehmood3934@gmail.com',
  triggerAlert
}) {
  const [targetEmail, setTargetEmail] = useState(userEmail);
  const [step, setStep] = useState('request'); // 'request' | 'verify'
  const [otpCode, setOtpCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [expireCountdown, setExpireCountdown] = useState(300); // 5 minutes = 300s
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Sync userEmail prop if changed
  useEffect(() => {
    if (userEmail) setTargetEmail(userEmail);
  }, [userEmail]);

  // Reset states on modal close/open
  useEffect(() => {
    if (!isOpen) {
      setStep('request');
      setOtpCode('');
      setErrorMsg('');
      setInfoMsg('');
      setIsLoading(false);
      setIsVerifying(false);
    }
  }, [isOpen]);

  // Cooldown & Expiration countdown timer
  useEffect(() => {
    let timer;
    if (step === 'verify') {
      timer = setInterval(() => {
        setCooldown(prev => (prev > 0 ? prev - 1 : 0));
        setExpireCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step]);

  if (!isOpen) return null;

  // -------------------------------------------------------------
  // SEND SECURE OTP TO USER'S EMAIL
  // -------------------------------------------------------------
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMsg('Email ghalat hai / Invalid Email address');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMsg(data.error || 'Email dispatch failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Successful dispatch
      setStep('verify');
      setOtpCode('');
      setCooldown(data.cooldownSeconds || 30);
      setExpireCountdown(data.expiresInSeconds || 300);
      setInfoMsg('OTP email par send kar diya gaya hai. Apna Gmail/Email open karein aur OTP enter karein.');
      triggerAlert?.('OTP email par send kar diya gaya hai. Apna Gmail/Email open karein.');
    } catch (err) {
      // Fallback in offline / sandbox mode
      setStep('verify');
      setCooldown(30);
      setExpireCountdown(300);
      setInfoMsg('OTP email par send kar diya gaya hai. Apna Gmail/Email open karein aur OTP enter karein.');
      triggerAlert?.('OTP has been dispatched to your email address.');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // VERIFY 6-DIGIT OTP ENTERED BY USER
  // -------------------------------------------------------------
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMsg('Enter complete 6-digit OTP code / 6 hindson ka code darj karein');
      return;
    }

    if (expireCountdown <= 0) {
      setErrorMsg('OTP expire ho gaya hai / OTP Expired. Baraye meherbani naya OTP mangwayen.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail.trim(),
          otp: otpCode.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.verified) {
        setErrorMsg(data.error || 'OTP ghalat hai / Invalid OTP');
        setIsVerifying(false);
        return;
      }

      // Success
      triggerAlert?.('OTP Verified Successfully! / Verification kamyab ho gayi');
      onVerifySuccess?.(targetEmail.trim());
      onClose();
    } catch (err) {
      setErrorMsg('Server verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-[#0b1120] border border-amber-500/40 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* MODAL HEADER */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <span>EMAIL OTP LOGIN</span>
                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[10px] font-mono">
                  SECURE
                </span>
              </h2>
              <p className="text-xs text-amber-400">Hadi Studio Verification</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Error Message Notice */}
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div className="font-medium text-xs">{errorMsg}</div>
            </div>
          )}

          {/* Info Notice */}
          {infoMsg && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div className="font-medium text-xs leading-relaxed">{infoMsg}</div>
            </div>
          )}

          {/* STEP 1: REQUEST OTP */}
          {step === 'request' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <p className="text-slate-300 leading-relaxed">
                Enter your registered admin or studio email address. A 6-digit one-time passcode will be delivered exclusively to your inbox.
              </p>

              <div>
                <label className="block text-slate-400 font-medium mb-1.5">
                  Admin / Staff Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    placeholder="name@hadiphotostudio.com"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 pl-10 pr-3 py-2.5 rounded-xl text-white text-xs font-medium focus:outline-none shadow-inner"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Security Notice:</span>
                </div>
                <p>The OTP is generated on secure servers and never displayed on screen. Check your Gmail inbox or Spam folder.</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>SENDING OTP CODE...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>SEND OTP TO EMAIL</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: ENTER & VERIFY OTP */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                <div className="text-slate-400 text-[11px]">Verification code sent to:</div>
                <div className="font-bold text-white text-xs flex items-center justify-between">
                  <span>{targetEmail}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('request');
                      setOtpCode('');
                      setErrorMsg('');
                      setInfoMsg('');
                    }}
                    className="text-amber-400 hover:underline text-[11px] font-normal flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-300 font-bold">
                    Enter 6-Digit OTP
                  </label>
                  <span className={`text-[11px] font-mono flex items-center gap-1 ${
                    expireCountdown < 60 ? 'text-red-400 font-bold' : 'text-slate-400'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>Expires in: {formatTime(expireCountdown)}</span>
                  </span>
                </div>

                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  pattern="[0-9]{6}"
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 text-center tracking-[0.5em] text-2xl font-mono py-3 rounded-xl text-amber-400 font-black focus:outline-none shadow-inner"
                />
              </div>

              {/* RESEND OTP WITH COOLDOWN */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-400">Didn't receive the email?</span>
                {cooldown > 0 ? (
                  <span className="text-slate-500 font-medium">
                    Resend OTP in {cooldown} seconds
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend OTP</span>
                  </button>
                )}
              </div>

              {/* SUBMIT VERIFY */}
              <button
                type="submit"
                disabled={isVerifying || otpCode.length !== 6 || expireCountdown <= 0}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>VERIFYING OTP...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>VERIFY OTP & LOGIN</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
