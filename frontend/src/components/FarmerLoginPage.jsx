import React, { useState } from 'react';
import {
  Leaf, Phone, ShieldCheck, ArrowRight, Users,
  ChevronLeft, Eye, EyeOff, UserPlus, LogIn, MapPin,
  ArrowLeft
} from 'lucide-react';
import RegisterOnBehalfModal from './modals/RegisterOnBehalfModal';

const PUNJAB_VILLAGES = [
  'Talwandi Sabo', 'Rampura Phul', 'Bathinda City', 'Mansa', 'Goniana',
  'Bhucho Mandi', 'Maur', 'Sangrur', 'Barnala', 'Fazilka',
  'Muktsar', 'Faridkot', 'Ferozpur', 'Tarn Taran', 'Patiala',
];

const T = {
  en: {
    welcome: 'Welcome to StubbleConnect',
    tagline: 'Turning stubble into earnings. Stop burning, start earning.',
    loginTab: 'Login', signupTab: 'New Registration',
    phoneLabel: 'Mobile Number', phonePlaceholder: '10-digit mobile number',
    sendOtp: 'Send OTP', otpLabel: 'Enter OTP',
    otpSent: 'OTP sent to', verify: 'Verify & Continue',
    resend: 'Resend OTP', loginAs: 'Farmer Portal',
    helper: 'Enter your registered mobile number to continue.',
    nameLabel: "Your Full Name", namePlaceholder: 'e.g. Balwinder Singh',
    villageLabel: 'Your Village / Area',
    signupBtn: 'Register & Continue',
    signupHelper: 'Create your StubbleConnect farmer account.',
    assistedTitle: 'Registering another farmer?',
    assistedDesc: "Help a farmer who doesn't have a smartphone",
    assistedBtn: 'Register on Their Behalf',
    back: 'Back',
    demoHint: '(Use any 6-digit code for demo)',
  },
  hi: {
    welcome: 'स्टबलकनेक्ट में आपका स्वागत है',
    tagline: 'पराली को कमाई में बदलें।',
    loginTab: 'लॉगिन', signupTab: 'नया पंजीकरण',
    phoneLabel: 'मोबाइल नंबर', phonePlaceholder: '10 अंकों का मोबाइल नंबर',
    sendOtp: 'OTP भेजें', otpLabel: 'OTP दर्ज करें',
    otpSent: 'OTP भेजा गया', verify: 'सत्यापित करें',
    resend: 'OTP फिर भेजें', loginAs: 'किसान पोर्टल',
    helper: 'जारी रखने के लिए अपना मोबाइल नंबर दर्ज करें।',
    nameLabel: 'आपका पूरा नाम', namePlaceholder: 'जैसे बलविंदर सिंह',
    villageLabel: 'आपका गाँव / क्षेत्र',
    signupBtn: 'पंजीकरण करें',
    signupHelper: 'अपना StubbleConnect किसान खाता बनाएं।',
    assistedTitle: 'किसी और किसान को पंजीकृत करें?',
    assistedDesc: 'उस किसान की मदद करें जिसके पास स्मार्टफोन नहीं है',
    assistedBtn: 'उनकी ओर से पंजीकरण करें',
    back: 'वापस',
    demoHint: '(डेमो के लिए कोई भी 6 अंक)',
  },
  pa: {
    welcome: 'StubbleConnect ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ',
    tagline: 'ਪਰਾਲੀ ਨੂੰ ਕਮਾਈ ਵਿੱਚ ਬਦਲੋ।',
    loginTab: 'ਲੌਗਿਨ', signupTab: 'ਨਵਾਂ ਰਜਿਸਟ੍ਰੇਸ਼ਨ',
    phoneLabel: 'ਮੋਬਾਈਲ ਨੰਬਰ', phonePlaceholder: '10-ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ',
    sendOtp: 'OTP ਭੇਜੋ', otpLabel: 'OTP ਦਰਜ ਕਰੋ',
    otpSent: 'OTP ਭੇਜਿਆ ਗਿਆ', verify: 'ਪੁਸ਼ਟੀ ਕਰੋ',
    resend: 'OTP ਦੁਬਾਰਾ ਭੇਜੋ', loginAs: 'ਕਿਸਾਨ ਪੋਰਟਲ',
    helper: 'ਜਾਰੀ ਰੱਖਣ ਲਈ ਆਪਣਾ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ।',
    nameLabel: 'ਤੁਹਾਡਾ ਪੂਰਾ ਨਾਮ', namePlaceholder: 'ਜਿਵੇਂ ਬਲਵਿੰਦਰ ਸਿੰਘ',
    villageLabel: 'ਤੁਹਾਡਾ ਪਿੰਡ / ਖੇਤਰ',
    signupBtn: 'ਰਜਿਸਟਰ ਕਰੋ',
    signupHelper: 'ਆਪਣਾ StubbleConnect ਕਿਸਾਨ ਖਾਤਾ ਬਣਾਓ।',
    assistedTitle: 'ਕਿਸੇ ਹੋਰ ਕਿਸਾਨ ਨੂੰ ਰਜਿਸਟਰ ਕਰੋ?',
    assistedDesc: 'ਉਸ ਕਿਸਾਨ ਦੀ ਮਦਦ ਕਰੋ ਜਿਸ ਕੋਲ ਸਮਾਰਟਫੋਨ ਨਹੀਂ',
    assistedBtn: 'ਉਨ੍ਹਾਂ ਵੱਲੋਂ ਰਜਿਸਟਰ ਕਰੋ',
    back: 'ਵਾਪਸ',
    demoHint: '(ਡੈਮੋ ਲਈ ਕੋਈ ਵੀ 6 ਅੰਕ)',
  },
};

export default function FarmerLoginPage({ onLogin, onReturnToAdmin }) {
  const [lang, setLang] = useState('en');
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAssistedModal, setShowAssistedModal] = useState(false);
  const [error, setError] = useState('');

  const t = T[lang];

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (phone.length !== 10) return;
    if (mode === 'signup' && !name.trim()) { setError('Please enter your name'); return; }
    if (mode === 'signup' && !village) { setError('Please select your village'); return; }
    
    setLoading(true);
    try {
      if (mode === 'signup') {
        // Register first
        const res = await fetch(`http://${window.location.hostname}:8000/api/v1/farmers/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), phone, village, district: 'Bathinda', state: 'Punjab' })
        });
        const data = await res.json();
        if (res.ok && data.status !== 'error') {
          // Now send OTP
          await fetch(`http://${window.location.hostname}:8000/api/v1/farmers/send-otp?phone=${phone}`, { method: 'POST' });
          setStep('otp');
        } else {
          setError(data.detail || 'Registration failed');
        }
      } else {
        // Login flow
        const res = await fetch(`http://${window.location.hostname}:8000/api/v1/farmers/send-otp?phone=${phone}`, { method: 'POST' });
        if (res.ok) {
          setStep('otp');
        } else {
          const data = await res.json();
          setError(data.detail || 'Failed to send OTP. Please sign up if you do not have an account.');
        }
      }
    } catch {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/v1/farmers/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.data);
      } else {
        setError(data.detail || 'Invalid OTP');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m); setStep('form'); setPhone(''); setName(''); setVillage(''); setOtp(''); setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a251c] via-[#0d3022] to-[#14401f] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-700/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      {/* Return to Command Center */}
      <div className="absolute top-5 left-5 z-20">
        <button
          onClick={onReturnToAdmin || (() => window.location.reload())}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all cursor-pointer border border-emerald-500/20"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Command Center
        </button>
      </div>

      {/* Language Switcher */}
      <div className="absolute top-5 right-5 flex gap-1 bg-white/10 rounded-lg p-1 backdrop-blur-sm">
        {['en', 'hi', 'pa'].map((l) => (
          <button key={l} onClick={() => setLang(l)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${lang === l ? 'bg-emerald-500 text-white' : 'text-white/60 hover:text-white'}`}>
            {l === 'en' ? 'EN' : l === 'hi' ? 'हि' : 'ਪੰ'}
          </button>
        ))}
      </div>

      {/* Logo */}
      <div className="flex items-center gap-3 mb-7">
        <img src="/logo.jpg?v=2" alt="StubbleConnect Logo" className="w-12 h-12 rounded-2xl object-cover shadow-lg shadow-emerald-900/50 bg-emerald-500" />
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">StubbleConnect</h1>
          <p className="text-emerald-400 text-xs font-medium">AI-Powered Biomass Platform</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-black/40 overflow-hidden">
        {/* Card Header */}
        <div className="bg-[#0a251c] px-6 pt-5 pb-4">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <Users className="w-3 h-3" />{t.loginAs}
          </div>
          <h2 className="text-xl font-bold text-white">{t.welcome}</h2>
          <p className="text-emerald-300/70 text-xs mt-1">{t.tagline}</p>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-gray-200">
          <button onClick={() => switchMode('login')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${mode === 'login' ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/60' : 'text-gray-500 hover:text-gray-700'}`}>
            <LogIn className="w-3.5 h-3.5" />{t.loginTab}
          </button>
          <button onClick={() => switchMode('signup')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${mode === 'signup' ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/60' : 'text-gray-500 hover:text-gray-700'}`}>
            <UserPlus className="w-3.5 h-3.5" />{t.signupTab}
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4">
          {step === 'form' ? (
            <form onSubmit={handleSendOtp} className="space-y-3.5">
              <p className="text-xs text-gray-500">{mode === 'signup' ? t.signupHelper : t.helper}</p>

              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t.nameLabel}</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{t.villageLabel}</span>
                    </label>
                    <select required value={village} onChange={e => setVillage(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600">
                      <option value="">Select your village...</option>
                      {PUNJAB_VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t.phoneLabel}</label>
                <div className="flex">
                  <span className="flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-sm font-semibold text-gray-600">🇮🇳 +91</span>
                  <input type="tel" maxLength={10} required value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder={t.phonePlaceholder}
                    className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600" />
                </div>
              </div>

              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

              <button type="submit" disabled={phone.length !== 10 || loading}
                className="w-full py-3 bg-[#0a251c] hover:bg-[#12382b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer">
                {loading ? <span className="animate-pulse">Sending OTP...</span> : (
                  <><Phone className="w-4 h-4" />{t.sendOtp}<ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <button type="button" onClick={() => setStep('form')}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer">
                <ChevronLeft className="w-3.5 h-3.5" />{t.back}
              </button>
              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 font-medium border border-emerald-200">
                ✅ {t.otpSent} <strong>+91 {phone}</strong>
                <span className="text-gray-400 font-normal ml-1">{t.demoHint}</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t.otpLabel}</label>
                <div className="relative">
                  <input type={showOtp ? 'text' : 'password'} maxLength={6} required value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full px-3 py-2.5 pr-10 text-lg font-bold text-center tracking-[0.5em] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600" />
                  <button type="button" onClick={() => setShowOtp(!showOtp)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                    {showOtp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={otp.length !== 6 || loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer">
                {loading ? <span className="animate-pulse">Verifying...</span> : (
                  <><ShieldCheck className="w-4 h-4" />{t.verify}</>
                )}
              </button>
              <p className="text-center text-xs text-gray-400">
                Didn't receive it?{' '}
                <button type="button" onClick={() => setStep('form')}
                  className="text-emerald-600 font-semibold hover:underline cursor-pointer">{t.resend}</button>
              </p>
            </form>
          )}

          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Register on Behalf Banner */}
          <button type="button" onClick={() => setShowAssistedModal(true)}
            className="w-full flex items-start gap-3 p-3.5 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 hover:bg-amber-100 transition-colors text-left cursor-pointer group">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">{t.assistedTitle}</p>
              <p className="text-[11px] text-amber-700 mt-0.5">{t.assistedDesc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-500 ml-auto self-center shrink-0" />
          </button>
        </div>
      </div>

      <p className="mt-6 text-emerald-700/50 text-[10px] text-center">
        StubbleConnect © 2026 · SIH Submission · Punjab Agri-Tech Initiative
      </p>

      {showAssistedModal && (
        <RegisterOnBehalfModal onClose={() => setShowAssistedModal(false)} onSuccess={() => setShowAssistedModal(false)} />
      )}
    </div>
  );
}
