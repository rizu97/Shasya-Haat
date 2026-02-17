import React from 'react';
import { TRANSLATIONS } from '../constants';
import { Store, Key, UserPlus, ArrowRight, Headphones, ArrowLeft } from 'lucide-react';

interface AuthSelectionProps {
  onLogin: () => void;
  onSignUp: () => void;
  onBack: () => void;
  language: 'en' | 'bn';
}

export const AuthSelection: React.FC<AuthSelectionProps> = ({ onLogin, onSignUp, onBack, _language }) => {
  return (
    <div className="flex flex-col h-full bg-[#121212] overflow-y-auto">

      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 z-10 p-2 bg-black/20 rounded-full text-gray-400 hover:text-white transition-colors active:scale-95"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[400px]">
        {/* Header Logo */}
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="w-20 h-20 rounded-[22px] bg-gradient-to-br from-[#FF9800] to-[#F57C00] flex items-center justify-center shadow-lg mb-6 shadow-orange-500/20">
            <Store className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Kirana<span className="text-[#FF9800]">Klick</span></h1>

          <div className="mt-6 text-center space-y-1">
            <h2 className="text-xl text-gray-200">{TRANSLATIONS.welcomeOwner.en}</h2>
            <p className="text-gray-500 font-['Hind_Siliguri']">{TRANSLATIONS.welcomeOwner.bn}</p>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="w-full max-w-sm mx-auto space-y-4">

          {/* Log In Button */}
          <button
            onClick={onLogin}
            className="w-full bg-[#1A1F26] p-5 rounded-[24px] border border-[#2A3441] flex items-center justify-between active:scale-[0.98] transition-all group hover:bg-[#20262e]"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#1E2837] flex items-center justify-center border border-[#2A3441] shrink-0">
                <Key className="text-[#4285F4]" size={24} />
              </div>
              <div className="text-left min-w-0">
                <h3 className="text-lg font-bold text-white mb-0.5">{TRANSLATIONS.logInAction.en}</h3>
                <p className="text-[#4285F4] font-['Hind_Siliguri'] font-bold text-sm mb-1">{TRANSLATIONS.logInAction.bn}</p>
                <div className="text-xs text-gray-500 truncate">
                  {TRANSLATIONS.accessDashboard.en}
                </div>
              </div>
            </div>
            <ArrowRight className="text-gray-600 group-hover:text-white transition-colors" size={20} />
          </button>

          {/* Sign Up Button */}
          <button
            onClick={onSignUp}
            className="w-full bg-[#1F1C18] p-5 rounded-[24px] border border-[#332A1E] flex items-center justify-between active:scale-[0.98] transition-all group hover:bg-[#29241d]"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#332514] flex items-center justify-center border border-[#45321A] shrink-0">
                <UserPlus className="text-[#FF9800]" size={24} />
              </div>
              <div className="text-left min-w-0">
                <h3 className="text-lg font-bold text-white mb-0.5">{TRANSLATIONS.signUp.en}</h3>
                <p className="text-[#FF9800] font-['Hind_Siliguri'] font-bold text-sm mb-1">{TRANSLATIONS.signUp.bn}</p>
                <div className="text-xs text-gray-500 truncate">
                  {TRANSLATIONS.registerNewShop.en}
                </div>
              </div>
            </div>
            <ArrowRight className="text-gray-600 group-hover:text-white transition-colors" size={20} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-4 py-6 shrink-0">
        <button className="flex items-center gap-2 px-6 py-2 rounded-full bg-[#1A1A1A] border border-[#333] text-gray-400 text-sm hover:text-white transition-colors">
          <Headphones size={14} />
          {TRANSLATIONS.support.en} / <span className="font-['Hind_Siliguri']">{TRANSLATIONS.support.bn}</span>
        </button>

        <div className="flex gap-2 my-2">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
        </div>
      </div>
    </div>
  );
};