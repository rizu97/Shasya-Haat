import React, { useState, useEffect } from 'react';
import { Product, SaleRecord, AppSettings } from '../types';
import { StorageService } from '../services/storageService';
import { TRANSLATIONS } from '../constants';
import { Store, Smartphone, User, Globe, Moon, Sun, Download, Save, Loader2, ArrowLeft } from 'lucide-react';

interface SettingsProps {
   products: Product[];
   sales: SaleRecord[];
   currentSettings: AppSettings;
   onUpdateSettings: (settings: AppSettings) => void;
   onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ _products, currentSettings, onUpdateSettings, onBack }) => {
   const [settings, setSettings] = useState<AppSettings>(currentSettings);
   const [originalSettings, setOriginalSettings] = useState<AppSettings>(currentSettings);
   const [isSaving, setIsSaving] = useState(false);

   useEffect(() => {
      setSettings(currentSettings);
      setOriginalSettings(currentSettings);
   }, [currentSettings]);

   const handleChange = (field: keyof AppSettings, value: string | number | 'dark' | 'light' | 'system') => {
      const newSettings = { ...settings, [field]: value };
      setSettings(newSettings);

      // Immediate auto-save for Theme (Dark/Light mode)
      if (field === 'theme') {
         // 1. Update Storage immediately (preserving other stored values, ignoring pending local changes)
         const currentStored = StorageService.getSettings();
         const settingsToSave = { ...currentStored, theme: value as 'dark' | 'light' | 'system' };
         StorageService.saveSettings(settingsToSave);

         // 2. Notify Parent App to update Theme context/DOM
         onUpdateSettings(settingsToSave);

         // 3. Update originalSettings to match so 'isDirty' doesn't trigger for theme
         setOriginalSettings(prev => ({ ...prev, theme: value as 'dark' | 'light' | 'system' }));

         // Note: We don't manually toggle classList here because onUpdateSettings triggers App.tsx's useEffect
      }
   };

   const isDirty = JSON.stringify(settings) !== JSON.stringify(originalSettings);

   const handleSave = () => {
      setIsSaving(true);
      // Simulate network/storage delay
      setTimeout(() => {
         StorageService.saveSettings(settings);
         onUpdateSettings(settings);
         setOriginalSettings(settings);
         setIsSaving(false);
      }, 1500);
   };

   const t = (key: keyof typeof TRANSLATIONS) => settings.language === 'en' ? TRANSLATIONS[key].en : TRANSLATIONS[key].bn;

   return (
      <div className="p-4 pb-32 bg-background min-h-screen text-[var(--text-primary)] font-sans relative">

         {/* Header */}
         <div className="flex items-center gap-4 mb-6 mt-2">
            <button
               onClick={onBack}
               className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center active:scale-95 transition-transform hover:bg-[var(--card-hover)]"
            >
               <ArrowLeft size={20} className="text-[var(--text-primary)]" />
            </button>
            <div>
               <h1 className="text-2xl font-bold tracking-tight">Settings <span className="text-[var(--accent)]">Zone</span></h1>
               <p className="text-[var(--text-tertiary)] text-xs font-medium">
                  {t('managePrefs')}
               </p>
            </div>
         </div>

         <div className="grid grid-cols-1 gap-6">

            {/* STORE PROFILE */}
            <section className="space-y-3">
               <h2 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider ml-1">{t('storeProfile')}</h2>
               <div className="card p-4 space-y-3">

                  {/* Shop Name */}
                  <div>
                     <label className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase mb-1 block">Shop Name / দোকানের নাম</label>
                     <div className="flex items-center bg-[var(--input-bg)] rounded-xl px-4 h-12 border border-[var(--border-subtle)] focus-within:border-[var(--accent)] transition-colors">
                        <Store size={18} className="text-[var(--text-tertiary)] mr-3" />
                        <input
                           type="text"
                           value={settings.shopName}
                           onChange={(e) => {
                              const val = e.target.value;
                              // Allow only alphabets and spaces
                              if (/^[a-zA-Z\s]*$/.test(val)) {
                                 handleChange('shopName', val);
                              }
                           }}
                           placeholder="Maa Durga Bhandar"
                           className="flex-1 bg-transparent outline-none text-sm font-bold text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
                        />
                     </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                     <label className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase mb-1 block">Phone Number / ফোন নম্বর</label>
                     <div className="flex items-center bg-[var(--input-bg)] rounded-xl px-4 h-12 border border-[var(--border-subtle)] focus-within:border-[var(--accent)] transition-colors">
                        <Smartphone size={18} className="text-[var(--text-tertiary)] mr-3" />
                        <input
                           type="tel"
                           value={settings.mobile}
                           onChange={(e) => {
                              const val = e.target.value;
                              // Allow only numbers, max 10
                              if (/^\d*$/.test(val) && val.length <= 10) {
                                 handleChange('mobile', val);
                              }
                           }}
                           placeholder="9876543210"
                           className="flex-1 bg-transparent outline-none text-sm font-bold text-[var(--text-primary)] placeholder-[var(--text-tertiary)] font-mono"
                        />
                     </div>
                  </div>

                  {/* Owner Name */}
                  <div>
                     <label className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase mb-1 block">{t('ownerName')}</label>
                     <div className="flex items-center bg-[var(--input-bg)] rounded-xl px-4 h-12 border border-[var(--border-subtle)] focus-within:border-[var(--accent)] transition-colors">
                        <User size={18} className="text-[var(--text-tertiary)] mr-3" />
                        <input
                           type="text"
                           value={settings.ownerName || ''}
                           onChange={(e) => {
                              const val = e.target.value;
                              // Allow only alphabets and spaces
                              if (/^[a-zA-Z\s]*$/.test(val)) {
                                 handleChange('ownerName', val);
                              }
                           }}
                           placeholder="Rajesh Kumar"
                           className="flex-1 bg-transparent outline-none text-sm font-bold text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
                        />
                     </div>
                  </div>

               </div>
            </section>

            {/* ALERT THRESHOLDS */}
            <section className="space-y-3">
               <h2 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider ml-1">{t('alertThresholds')}</h2>
               <div className="card p-5 space-y-6">

                  {/* Low Stock Alert */}
                  <div>
                     <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm text-[var(--text-primary)]">{t('lowStockAlert')}</span>
                        <span className="bg-[var(--accent-light)] text-[var(--accent)] px-2 py-1 rounded-lg text-xs font-bold">
                           {settings.lowStockThreshold} units
                        </span>
                     </div>
                     <p className="text-[10px] text-[var(--text-tertiary)] font-bn mb-3">কম স্টক অ্যালার্ট</p>
                     <input
                        type="range"
                        min="1" max="50"
                        value={settings.lowStockThreshold}
                        onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-[var(--input-bg)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                     />
                     <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] mt-1 font-medium">
                        <span>1</span>
                        <span>50</span>
                     </div>
                  </div>

                  {/* Near Expiry Alert */}
                  <div>
                     <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm text-[var(--text-primary)]">{t('nearExpiryAlert')}</span>
                        <span className="bg-[var(--accent-light)] text-[var(--accent)] px-2 py-1 rounded-lg text-xs font-bold">
                           {settings.nearExpiryDays} days
                        </span>
                     </div>
                     <p className="text-[10px] text-[var(--text-tertiary)] font-bn mb-3">মেয়াদোত্তীর্ণ অ্যালার্ট</p>
                     <input
                        type="range"
                        min="7" max="90"
                        value={settings.nearExpiryDays}
                        onChange={(e) => handleChange('nearExpiryDays', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-[var(--input-bg)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                     />
                     <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] mt-1 font-medium">
                        <span>7d</span>
                        <span>90d</span>
                     </div>
                  </div>

               </div>
            </section>

            {/* PREFERENCES */}
            <section className="space-y-3">
               <h2 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider ml-1">{t('preferences')}</h2>
               <div className="card overflow-hidden">

                  {/* Language */}
                  <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--info-bg)' }}>
                           <Globe size={18} className="text-[var(--info)]" />
                        </div>
                        <div>
                           <span className="block font-bold text-sm text-[var(--text-primary)]">{t('appLanguage')}</span>
                           <span className="text-[10px] text-[var(--text-tertiary)] font-bn">ভাষা পরিবর্তন</span>
                        </div>
                     </div>
                     <div className="flex bg-[var(--input-bg)] rounded-xl p-1">
                        <button
                           onClick={() => handleChange('language', 'en')}
                           className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${settings.language === 'en' ? 'bg-[var(--bg-surface)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}
                        >
                           EN
                        </button>
                        <button
                           onClick={() => handleChange('language', 'bn')}
                           className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all font-bn ${settings.language === 'bn' ? 'bg-[var(--bg-surface)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}
                        >
                           বাংলা
                        </button>
                     </div>
                  </div>

                  {/* Dark Mode */}
                  <div className="p-4 flex flex-col gap-3">
                     <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
                           {settings.theme === 'dark' ? <Moon size={18} className="text-[var(--accent)]" /> : settings.theme === 'light' ? <Sun size={18} className="text-[var(--accent)]" /> : <Smartphone size={18} className="text-[var(--accent)]" />}
                        </div>
                        <div>
                           <span className="block font-bold text-sm text-[var(--text-primary)]">{t('darkMode')} / Theme</span>
                           <span className="text-[10px] text-[var(--text-tertiary)] font-bn">থিম পরিবর্তন</span>
                        </div>
                     </div>

                     {/* 3-Way Segmented Control */}
                     <div className="flex bg-[var(--input-bg)] rounded-xl p-1 border border-[var(--border-subtle)] mt-1">
                        {(['light', 'dark', 'system'] as const).map((mode) => (
                           <button
                              key={mode}
                              onClick={() => handleChange('theme', mode)}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all capitalize flex items-center justify-center gap-1.5 ${settings.theme === mode
                                 ? 'bg-[var(--bg-surface)] shadow-sm text-[var(--accent)] scale-[1.02]'
                                 : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                                 }`}
                           >
                              {mode === 'light' && <Sun size={14} />}
                              {mode === 'dark' && <Moon size={14} />}
                              {mode === 'system' && <Smartphone size={14} />}
                              {mode === 'system' ? 'System' : mode}
                           </button>
                        ))}
                     </div>
                  </div>

               </div>
            </section>

            {/* DATA MANAGEMENT */}
            <section className="space-y-3">
               <h2 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider ml-1">{t('dataManagement')}</h2>
               <div className="card p-4">
                  <button
                     onClick={() => {
                        try {
                           const storedProducts = StorageService.getInventory();
                           const storedSales = StorageService.getSales();

                           if (storedProducts.length === 0 && storedSales.length === 0) {
                              alert(t('noDataExport'));
                              return;
                           }

                           // Helper to escape CSV fields
                           const escapeCsv = (field: string | number) => {
                              const stringValue = String(field || '');
                              if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                                 return `"${stringValue.replace(/"/g, '""')}"`;
                              }
                              return stringValue;
                           };

                           // Build CSV Content
                           const headers = ['Date', 'Type', 'Product', 'Qty', 'Unit Price', 'Total'].map(escapeCsv);
                           const rows = [headers];

                           // eslint-disable-next-line @typescript-eslint/no-explicit-any
                           storedSales.forEach((s: any) => {
                              rows.push([
                                 new Date(s.timestamp).toLocaleDateString(),
                                 s.type || 'SALE',
                                 s.productName || 'Unknown Product',
                                 s.quantity || 0,
                                 s.unitPrice || 0,
                                 s.totalPrice || 0
                              ].map(escapeCsv));
                           });

                           const csvContent = rows.map(r => r.join(',')).join('\n');
                           const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                           const url = URL.createObjectURL(blob);

                           // Create and trigger download link properly
                           const link = document.createElement('a');
                           link.href = url;
                           link.setAttribute('download', 'kiranaklick_report_' + new Date().toISOString().split('T')[0] + '.csv');
                           link.style.display = 'none';
                           document.body.appendChild(link);

                           link.click();

                           // Cleanup
                           document.body.removeChild(link);
                           URL.revokeObjectURL(url);

                           alert(t('exportSuccess'));
                        } catch (err) {
                           console.error("Export failed", err);
                           alert("Export failed. Please try again.");
                        }
                     }}
                     className="w-full flex items-center justify-between group"
                  >
                     <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--success-bg)' }}>
                           <Download size={18} className="text-[var(--success)]" />
                        </div>
                        <div className="text-left">
                           <span className="block font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{t('exportCsv')}</span>
                           <span className="text-[10px] text-[var(--text-tertiary)] font-bn">{t('downloadReport')}</span>
                        </div>
                     </div>
                     <Download size={18} className="text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
                  </button>
               </div>
            </section>

         </div>

         {/* Floating Save Button */}
         {isDirty && (
            <div className="fixed bottom-24 left-0 right-0 px-4 z-50">
               <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary w-full h-14 !rounded-xl text-lg"
               >
                  {isSaving ? (
                     <Loader2 className="animate-spin" size={24} />
                  ) : (
                     <>
                        <Save size={20} />
                        <span>{t('save')}</span>
                     </>
                  )}
               </button>
            </div>
         )}

      </div>
   );
};