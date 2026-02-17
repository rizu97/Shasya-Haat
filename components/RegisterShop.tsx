import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { ArrowLeft, Store, MapPin, Smartphone, ArrowRight } from 'lucide-react';
import { AppSettings } from '../types';

interface RegisterShopProps {
  onContinue: (data: Partial<AppSettings>) => void;
  onBack: () => void;
  language: 'en' | 'bn';
}

export const RegisterShop: React.FC<RegisterShopProps> = ({ onContinue, onBack, _language }) => {
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');

  const handleContinue = () => {
    if (shopName && address && mobile.length === 10) {
      onContinue({ shopName, mobile });
    } else {
      if (mobile.length !== 10) {
        alert('Phone number must be exactly 10 digits');
      } else {
        alert('Please fill in all fields correctly');
      }
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(val)) setShopName(val);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^[a-zA-Z\s,]*$/.test(val)) setAddress(val);
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val) && val.length <= 10) setMobile(val);
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] overflow-y-auto">
      <div className="flex-1 p-6 flex flex-col w-full max-w-sm mx-auto min-h-min">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pt-2">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#1E1E1E] flex items-center justify-center border border-[#333] active:scale-95 transition-transform hover:bg-[#2C2C2C]"
          >
            <ArrowLeft size={20} className="text-gray-300" />
          </button>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-[#FF9800] tracking-widest uppercase">Step 1 of 2</span>
            <div className="w-24 h-1 bg-[#2C2C2C] rounded-full mt-1">
              <div className="w-1/2 h-full bg-[#FF9800] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">{TRANSLATIONS.registerShop.en}</h1>
          <h2 className="text-xl font-['Hind_Siliguri'] text-gray-400 mb-3">{TRANSLATIONS.registerShop.bn}</h2>
          <p className="text-sm text-gray-500">{TRANSLATIONS.shopDetailsHint.en}</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">

          {/* Shop Name */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300 flex gap-2">
              {TRANSLATIONS.shopName.en} <span className="text-gray-500 font-['Hind_Siliguri']">/ {TRANSLATIONS.shopName.bn}</span>
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#FF9800] transition-colors">
                <Store size={20} />
              </div>
              <input
                type="text"
                value={shopName}
                onChange={handleNameChange}
                className="w-full bg-[#1A1F26] text-white py-4 pl-12 pr-4 rounded-xl border border-[#2A3441] focus:border-[#FF9800] outline-none transition-all placeholder-gray-600"
                placeholder={TRANSLATIONS.shopNamePlaceholder.en}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300 flex gap-2">
              {TRANSLATIONS.shopAddress.en} <span className="text-gray-500 font-['Hind_Siliguri']">/ {TRANSLATIONS.shopAddress.bn}</span>
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#FF9800] transition-colors">
                <MapPin size={20} />
              </div>
              <input
                type="text"
                value={address}
                onChange={handleAddressChange}
                className="w-full bg-[#1A1F26] text-white py-4 pl-12 pr-4 rounded-xl border border-[#2A3441] focus:border-[#FF9800] outline-none transition-all placeholder-gray-600"
                placeholder={TRANSLATIONS.shopAddressPlaceholder.en}
              />
            </div>
          </div>

          {/* Mobile */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300 flex gap-2">
              {TRANSLATIONS.phoneNumberLabel.en} <span className="text-gray-500 font-['Hind_Siliguri']">/ {TRANSLATIONS.phoneNumberLabel.bn}</span>
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#FF9800] transition-colors">
                <Smartphone size={20} />
              </div>
              <input
                type="tel"
                value={mobile}
                onChange={handleMobileChange}
                className="w-full bg-[#1A1F26] text-white py-4 pl-12 pr-4 rounded-xl border border-[#2A3441] focus:border-[#FF9800] outline-none transition-all placeholder-gray-600 font-mono tracking-wide"
                placeholder="9876543210"
              />
            </div>
          </div>
        </div>

        {/* Spacer to push button down on tall screens, but allow scroll on short screens */}
        <div className="mt-8 flex-1"></div>

        {/* Footer Button */}
        <div className="pt-6 pb-4 space-y-4">
          <button
            onClick={handleContinue}
            className="w-full bg-[#FF9800] hover:bg-[#F57C00] text-black h-16 rounded-[18px] font-bold text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(255,152,0,0.25)]"
          >
            <span>{TRANSLATIONS.continue.en}</span>
            <span className="w-px h-4 bg-black/20"></span>
            <span className="font-['Hind_Siliguri']">{TRANSLATIONS.continue.bn}</span>
            <ArrowRight size={20} className="ml-1" />
          </button>

          <p className="text-center text-[10px] text-gray-600 px-4 leading-relaxed">
            {TRANSLATIONS.agreeTerms.en}
          </p>
        </div>
      </div>

      {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
      <div id="recaptcha-container"></div>
    </div>
  );
};