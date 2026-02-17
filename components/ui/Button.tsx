import React from 'react';

interface ButtonProps {
  labelEn: string;
  labelBn: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  language?: 'en' | 'bn';
}

export const Button: React.FC<ButtonProps> = ({ 
  labelEn, 
  labelBn, 
  onClick, 
  variant = 'primary', 
  icon,
  disabled = false,
  className = '',
  language = 'en'
}) => {
  const baseStyles = "w-full h-[72px] rounded-2xl flex flex-col justify-center items-center transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-lg";
  
  const variants = {
    primary: "bg-[#FF9800] text-black hover:bg-[#F57C00]",
    secondary: "bg-[#2C2C2C] text-white border border-[#3E3E3E] hover:bg-[#3E3E3E]",
    danger: "bg-[#CF6679] text-black hover:bg-[#B00020]"
  };

  const mainLabel = language === 'en' ? labelEn : labelBn;
  const subLabel = language === 'en' ? labelBn : labelEn;

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-xl">{icon}</span>}
        <span className="text-lg font-bold uppercase tracking-wide leading-none">{mainLabel}</span>
      </div>
      <span className="text-sm font-normal opacity-80 leading-none mt-1 font-['Hind_Siliguri']">{subLabel}</span>
    </button>
  );
};