import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { Smartphone, Store, HelpCircle } from 'lucide-react';

interface LoginProps {
  onSendOtp: (phone: string) => void;
  language?: 'en' | 'bn';
}

export const Login: React.FC<LoginProps> = ({ onSendOtp, language: _language = 'en' }) => {
  const [phone, setPhone] = useState('');

  const handleSendOtp = () => {
    if (phone.length === 10) {
      onSendOtp(phone);
    } else {
      alert("Please enter a valid 10-digit mobile number");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow only numbers, max 10
    if (/^\d*$/.test(val) && val.length <= 10) {
      setPhone(val);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[400px]">

        {/* Logo Section */}
        <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 rounded-full"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-[#FF9800] to-[#F57C00] rounded-[24px] flex items-center justify-center shadow-lg border border-[#FFFFFF10]">
              <Store size={36} className="text-white" strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-center">
            Kirana<span className="text-[#FF9800]">Klick</span>
          </h1>
        </div>

        {/* Login Form Section */}
        <div className="w-full max-w-sm mx-auto mt-12 space-y-8">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-2xl font-bold">{TRANSLATIONS.loginTitle.en}</h2>
              <div className="h-6 w-px bg-gray-600"></div>
              <h2 className="text-2xl font-['Hind_Siliguri'] font-bold">{TRANSLATIONS.loginTitle.bn}</h2>
            </div>
            <p className="text-gray-400 text-sm">{TRANSLATIONS.enterMobileSub.en}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300 flex items-center gap-2">
              {TRANSLATIONS.phoneNumberLabel.en} <span className="text-gray-500">/ {TRANSLATIONS.phoneNumberLabel.bn}</span>
            </label>
            <div className="relative h-16 w-full bg-[#1A1F26] rounded-xl border border-[#2A3441] flex items-center overflow-hidden focus-within:border-[#FF9800] transition-colors group">
              <div className="h-full px-5 flex items-center justify-center border-r border-[#2A3441] bg-[#15191E]">
                <Smartphone size={20} className="text-gray-400 mr-3" />
                <span className="text-lg font-bold text-white">+91</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                className="flex-1 bg-transparent text-white text-xl font-bold tracking-widest px-4 outline-none placeholder-gray-700 h-full w-full min-w-0"
                placeholder="00000 00000"
              />
            </div>
          </div>

          <button
            onClick={handleSendOtp}
            className="w-full bg-[#FF6D00] hover:bg-[#F56000] text-white h-16 rounded-[16px] font-bold text-xl uppercase tracking-wider shadow-[0_4px_14px_rgba(255,109,0,0.4)] active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-0.5"
          >
            <span>{TRANSLATIONS.sendOtp.en}</span>
            <span className="text-xs font-['Hind_Siliguri'] opacity-90">{TRANSLATIONS.sendOtp.bn}</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-4 py-6 mt-auto shrink-0">
        <p className="text-[10px] text-center text-gray-500 leading-relaxed max-w-xs px-4">
          By continuing, you agree to our <span className="text-gray-400 underline cursor-pointer">Terms</span> & <span className="text-gray-400 underline cursor-pointer">Privacy Policy</span>.
        </p>

        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1A1A1A] border border-[#333] text-gray-400 text-xs hover:text-white transition-colors">
          <HelpCircle size={14} />
          {TRANSLATIONS.needHelp.en} / <span className="font-['Hind_Siliguri']">{TRANSLATIONS.needHelp.bn}</span>
        </button>
      </div>

      {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
      <div id="recaptcha-container"></div>
    </div>
  );
};