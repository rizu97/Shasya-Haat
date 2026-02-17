import React from 'react';
import { Store, ArrowRight, BarChart3, ScanLine } from 'lucide-react';

interface LandingPageProps {
  onSelectRole: (role: 'SELLER' | 'BUYER') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole }) => {
  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white font-sans relative overflow-hidden items-center justify-center">

      {/* Aesthetic Background Gradients */}
      <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[50%] bg-orange-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Content Container */}
      <div className="w-full max-w-lg px-6 relative z-10 flex flex-col items-center justify-center gap-12">

        {/* Left Side: Hero Text */}
        <div className="flex flex-col items-center text-center space-y-8 flex-1">

          <div className="flex items-center gap-4">
            {/* Animated/Glowing Logo Container */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-amber-500 blur-2xl opacity-20 rounded-full group-hover:opacity-30 transition-opacity duration-700"></div>
              <div className="w-20 h-20 bg-[#111] rounded-[24px] border border-[#222] flex items-center justify-center relative shadow-2xl backdrop-blur-sm ring-1 ring-white/5">
                <Store size={40} className="text-[#FF9800]" strokeWidth={1.5} />
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">
                Kirana<span className="text-[#FF9800]">Klick</span>
              </h1>
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">Store Manager OS</p>
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <p className="text-lg text-gray-300 leading-relaxed font-light">
                Manage your inventory,<br />
                <span className="text-white font-medium">Maximize your profits.</span>
              </p>
              <p className="text-sm text-gray-600 font-bn pt-1">
                আপনার ব্যবসার ডিজিটাল ম্যানেজার
              </p>
            </div>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
              <ScanLine size={14} className="text-orange-400" />
              <span className="text-xs font-medium text-gray-300">AI Scanning</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
              <BarChart3 size={14} className="text-blue-400" />
              <span className="text-xs font-medium text-gray-300">Smart Reports</span>
            </div>
          </div>

          {/* Primary Action */}
          <div className="w-full max-w-xs pt-4">
            <button
              onClick={() => onSelectRole('SELLER')}
              className="group w-full h-[72px] bg-gradient-to-r from-[#FF9800] to-[#F57C00] hover:to-[#FF9800] text-black rounded-[24px] font-bold text-xl shadow-[0_8px_30px_rgba(255,152,0,0.25)] transition-all active:scale-[0.98] flex items-center justify-between px-2 pl-8 hover:shadow-orange-500/40"
            >
              <span>Get Started</span>
              <div className="w-14 h-14 bg-white/20 rounded-[18px] flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <ArrowRight className="group-hover:translate-x-0.5 transition-transform" size={24} />
              </div>
            </button>
          </div>

        </div>

      </div>

      {/* Footer Decoration */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <div className="w-12 h-1 rounded-full bg-[#222]"></div>
      </div>

    </div>
  );
};