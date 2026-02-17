import React, { useState, useRef, useEffect } from 'react';
import { TRANSLATIONS } from '../constants';
import { ArrowLeft, Store, HelpCircle, Timer } from 'lucide-react';

interface VerifyPhoneProps {
  mobileNumber: string;
  onVerify: (otpCode: string) => void;
  onBack: () => void;
  language: 'en' | 'bn';
  mode?: 'REGISTER' | 'LOGIN';
}

export const VerifyPhone: React.FC<VerifyPhoneProps> = ({ mobileNumber, onVerify, onBack, _language, mode = 'REGISTER' }) => {
  const otpLength = 6;
  const [otp, setOtp] = useState(Array(otpLength).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleResend = () => {
    setTimeLeft(60);
    setCanResend(false);
    console.log("Resending OTP...");
  };

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').slice(0, otpLength);
    if (!isNaN(Number(data))) {
      const newOtp = data.split('').concat(Array(otpLength - data.length).fill(''));
      setOtp(newOtp.slice(0, otpLength));
      inputRefs.current[Math.min(data.length, otpLength - 1)]?.focus();
    }
  };

  const handleSubmit = () => {
    const code = otp.join('');
    if (code.length === otpLength) {
      onVerify(code);
    } else {
      alert(`Please enter a valid ${otpLength}-digit OTP`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] overflow-y-auto">
      <div className="flex-1 p-6 flex flex-col w-full max-w-sm mx-auto min-h-min">
        {/* Header varies by Mode */}
        {mode === 'REGISTER' ? (
          <div className="flex justify-between items-center mb-8 pt-2">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-[#1E1E1E] flex items-center justify-center border border-[#333] active:scale-95 transition-transform hover:bg-[#2C2C2C]"
            >
              <ArrowLeft size={20} className="text-gray-300" />
            </button>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-[#FF9800] tracking-widest uppercase">Step 2 of 2</span>
              <div className="w-24 h-1 bg-[#2C2C2C] rounded-full mt-1">
                <div className="w-full h-full bg-[#FF9800] rounded-full"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-end pb-8 min-h-[160px]">
            <div className="relative group mb-4">
              <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 rounded-full"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-[#FF9800] to-[#F57C00] rounded-[20px] flex items-center justify-center shadow-lg border border-[#FFFFFF10]">
                <Store size={28} className="text-white" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Kirana<span className="text-[#FF9800]">Klick</span>
            </h1>
          </div>
        )}

        {/* Title */}
        <div className={`mb-10 ${mode === 'LOGIN' ? 'text-center' : ''}`}>
          {mode === 'LOGIN' ? (
            <div className="flex items-center justify-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">{TRANSLATIONS.enterOtpTitle.en}</h2>
              <div className="h-6 w-px bg-gray-600"></div>
              <h2 className="text-2xl font-['Hind_Siliguri'] font-bold">{TRANSLATIONS.enterOtpTitle.bn}</h2>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-1">{TRANSLATIONS.verifyPhone.en}</h1>
              <h2 className="text-xl font-['Hind_Siliguri'] text-gray-400 mb-3">{TRANSLATIONS.verifyPhone.bn}</h2>
            </>
          )}

          <p className="text-sm text-gray-400">
            {TRANSLATIONS.enterCodeHint.en} <span className="text-white font-bold">{mobileNumber}</span>
          </p>
        </div>

        {/* OTP Inputs - Responsive Grid */}
        <div className="grid grid-cols-6 gap-2 mb-8 w-full">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-full aspect-[3/4] rounded-xl bg-[#1A1F26] border border-[#2A3441] text-center text-xl sm:text-2xl font-bold text-white focus:border-[#FF9800] focus:bg-[#FF9800]/5 outline-none transition-all caret-[#FF9800] shadow-inner p-0"
              inputMode="numeric"
            />
          ))}
        </div>

        {/* Submit Button */}
        <div className="pt-4 space-y-6 mt-auto">
          <button
            onClick={handleSubmit}
            className="w-full bg-[#FF6D00] hover:bg-[#F56000] text-white h-16 rounded-[16px] font-bold text-xl uppercase tracking-wider shadow-[0_4px_14px_rgba(255,109,0,0.4)] active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-0.5"
          >
            <span>{TRANSLATIONS.submit.en}</span>
            <span className="text-xs font-['Hind_Siliguri'] opacity-90">{TRANSLATIONS.submit.bn}</span>
          </button>

          {/* Resend Timer */}
          <div className="text-center pb-6">
            <button
              disabled={!canResend}
              onClick={handleResend}
              className={`flex items-center justify-center gap-2 mx-auto text-sm ${canResend ? 'text-[#FF9800] font-bold hover:underline' : 'text-gray-500 cursor-not-allowed'}`}
            >
              {canResend ? (
                <>
                  {TRANSLATIONS.resendOtp.en} <span className="text-gray-600">/</span> <span className="font-bn">{TRANSLATIONS.resendOtp.bn}</span>
                </>
              ) : (
                <span className="flex items-center gap-2">
                  <Timer size={14} />
                  Resend in 0:{timeLeft.toString().padStart(2, '0')}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer (Only for Register flow usually, but added check) */}
      <div className="flex justify-center pb-6 shrink-0">
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1A1A1A] border border-[#333] text-gray-400 text-xs hover:text-white transition-colors">
          <HelpCircle size={14} />
          {TRANSLATIONS.needHelp.en} / <span className="font-['Hind_Siliguri']">{TRANSLATIONS.needHelp.bn}</span>
        </button>
      </div>

    </div>
  );
};