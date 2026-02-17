import React, { useState, useMemo } from 'react';
import { SaleRecord, Product } from '../types';
import { TRANSLATIONS } from '../constants';
import { ArrowUp, ArrowDown, Plus, ShoppingBag, ChevronDown, Calendar, X, TrendingUp } from 'lucide-react';

interface ReportsProps {
   sales: SaleRecord[];
   products: Product[];
   language: 'en' | 'bn';
}

type Transaction = {
   id: string;
   type: 'SALE' | 'ADD';
   name: string;
   nameBn: string;
   time: Date;
   quantity: number;
   unit: string;
   amount: number;
   profit?: number;
};

type ViewMode = 'DAY' | 'WEEK' | 'MONTH';
type TransactionTypeFilter = 'ALL' | 'SALE' | 'ADD';

export const Reports: React.FC<ReportsProps> = ({ sales, products, language }) => {
   const [selectedDate, setSelectedDate] = useState(new Date());
   const [viewMode, setViewMode] = useState<ViewMode>('DAY');
   const [transactionFilter, setTransactionFilter] = useState<TransactionTypeFilter>('ALL');
   const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

   const t = (key: keyof typeof TRANSLATIONS) => language === 'en' ? TRANSLATIONS[key].en : TRANSLATIONS[key].bn;
   const tSub = (key: keyof typeof TRANSLATIONS) => language === 'en' ? TRANSLATIONS[key].bn : TRANSLATIONS[key].en;

   // Helpers
   const getPrimaryName = (name: string, nameBn?: string) => {
      if (language === 'bn' && nameBn) return nameBn;
      return name;
   };

   const getSecondaryName = (name: string, nameBn?: string) => {
      if (language === 'bn' && nameBn) return name;
      return nameBn;
   };

   const formatCurrency = (val: number) =>
      new Intl.NumberFormat(language === 'bn' ? 'bn-IN' : 'en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

   const formatTime = (date: Date) =>
      date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

   const formatDate = (date: Date) =>
      date.toLocaleDateString(language === 'en' ? 'en-US' : 'bn-IN', { day: 'numeric', month: 'short', year: 'numeric' });

   // Date Logic
   const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
   const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
   const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
   const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

   const handleDateChange = (field: 'date' | 'month' | 'year', value: number) => {
      const newDate = new Date(selectedDate);
      if (field === 'date') newDate.setDate(value);
      if (field === 'month') newDate.setMonth(value);
      if (field === 'year') newDate.setFullYear(value);
      setSelectedDate(newDate);
   };

   // Generate 7 days centered around selected date for the strip
   const calendarStrip = useMemo(() => {
      const dates = [];
      for (let i = -3; i <= 3; i++) {
         const d = new Date(selectedDate);
         d.setDate(selectedDate.getDate() + i);
         dates.push(d);
      }
      return dates;
   }, [selectedDate]);

   const weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

   // Data Logic with Filters
   const { transactions, stats } = useMemo(() => {
      let startDate: Date;
      let endDate: Date;

      // Define Time Range
      const d = new Date(selectedDate);
      if (viewMode === 'DAY') {
         startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
         endDate = new Date(startDate);
         endDate.setDate(startDate.getDate() + 1);
      } else if (viewMode === 'WEEK') {
         // Start of week (Sunday)
         const day = d.getDay();
         startDate = new Date(d);
         startDate.setDate(d.getDate() - day);
         startDate.setHours(0, 0, 0, 0);

         endDate = new Date(startDate);
         endDate.setDate(startDate.getDate() + 7);
      } else {
         // Month
         startDate = new Date(d.getFullYear(), d.getMonth(), 1);
         endDate = new Date(d.getFullYear(), d.getMonth() + 1, 0);
         endDate.setDate(endDate.getDate() + 1); // To include last day fully
      }

      const relevantSales = sales.filter(s => {
         if (transactionFilter === 'ADD') return false;
         const t = new Date(s.timestamp);
         return t >= startDate && t < endDate;
      });

      const relevantAdds = products.filter(p => {
         if (transactionFilter === 'SALE') return false;
         const t = new Date(p.addedAt);
         return t >= startDate && t < endDate;
      });

      const soldTotal = relevantSales.reduce((sum, s) => sum + s.salePrice, 0);
      const profitTotal = relevantSales.reduce((sum, s) => sum + (s.profit || 0), 0);
      const addedTotal = relevantAdds.reduce((sum, p) => sum + (p.costPrice * p.quantity), 0); // Using cost price for added value

      const mappedSales: Transaction[] = relevantSales.map(s => ({
         id: s.id,
         type: 'SALE',
         name: s.productName,
         nameBn: s.productNameBn,
         time: new Date(s.timestamp),
         quantity: s.quantity,
         unit: s.unit,
         amount: s.salePrice,
         profit: s.profit
      }));

      const mappedAdds: Transaction[] = relevantAdds.map(p => ({
         id: p.id,
         type: 'ADD',
         name: p.name,
         nameBn: p.nameBn,
         time: new Date(p.addedAt),
         quantity: p.quantity,
         unit: p.unit,
         amount: p.costPrice * p.quantity // Cost value
      }));

      const combined = [...mappedSales, ...mappedAdds].sort((a, b) => b.time.getTime() - a.time.getTime());
      return { transactions: combined, stats: { soldTotal, addedTotal, profitTotal } };
   }, [selectedDate, sales, products, viewMode, transactionFilter]);

   return (
      <div className="p-4 space-y-5 pb-28 bg-background min-h-screen text-[var(--text-primary)]">

         {/* Header */}
         <div className="flex justify-between items-end pt-3">
            <div>
               <h1 className="text-2xl font-bold tracking-tight">Reports <span className="text-[var(--accent)]">Zone</span></h1>
               <p className="text-[var(--text-secondary)] text-sm mt-0.5 flex items-center gap-1.5 font-medium">
                  Daily Analysis
                  <span className="w-1 h-1 rounded-full bg-[var(--accent)]"></span>
                  <span className="font-bn font-semibold text-[var(--text-tertiary)]">দৈনিক বিশ্লেষণ</span>
               </p>
            </div>
         </div>

         {/* Filter Chips Row 1: Time Range */}
         <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {(['DAY', 'WEEK', 'MONTH'] as const).map((m) => (
               <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={`chip ${viewMode === m ? 'chip-active' : ''}`}
               >
                  {m === 'DAY' ? t('viewDay') : m === 'WEEK' ? t('viewWeek') : t('viewMonth')}
               </button>
            ))}
         </div>

         {/* Filter Chips Row 2: Type */}
         <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mt-2">
            {(['ALL', 'SALE', 'ADD'] as const).map((f) => (
               <button
                  key={f}
                  onClick={() => setTransactionFilter(f)}
                  className={`chip ${transactionFilter === f ? 'chip-active' : ''}`}
               >
                  {f === 'ALL' ? t('allTransactions') : f === 'SALE' ? t('salesOnly') : t('stockAdds')}
               </button>
            ))}
         </div>

         {/* Date Selectors */}
         <div className="card p-4">
            <div className="flex items-center gap-2 mb-4 text-[var(--accent)] font-bold text-sm">
               <Calendar size={16} />
               <span>{viewMode === 'MONTH' ? 'Select Month' : 'Select Date Anchor'}</span>
            </div>
            <div className="flex gap-2.5">
               {viewMode !== 'MONTH' && (
                  <div className="relative flex-1">
                     <select
                        value={selectedDate.getDate()}
                        onChange={(e) => handleDateChange('date', parseInt(e.target.value))}
                        className="w-full appearance-none bg-[var(--input-bg)] text-[var(--text-primary)] py-2.5 px-3 rounded-xl font-bold outline-none border border-[var(--border-color)] text-sm focus:border-[var(--accent)]"
                     >
                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                     </select>
                     <ChevronDown size={14} className="absolute right-2.5 top-3 text-[var(--text-tertiary)] pointer-events-none" />
                  </div>
               )}
               <div className="relative flex-1">
                  <select
                     value={selectedDate.getMonth()}
                     onChange={(e) => handleDateChange('month', parseInt(e.target.value))}
                     className="w-full appearance-none bg-[var(--input-bg)] text-[var(--text-primary)] py-2.5 px-3 rounded-xl font-bold outline-none border border-[var(--border-color)] text-sm focus:border-[var(--accent)]"
                  >
                     {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-3 text-[var(--text-tertiary)] pointer-events-none" />
               </div>
               <div className="relative flex-1">
                  <select
                     value={selectedDate.getFullYear()}
                     onChange={(e) => handleDateChange('year', parseInt(e.target.value))}
                     className="w-full appearance-none bg-[var(--input-bg)] text-[var(--text-primary)] py-2.5 px-3 rounded-xl font-bold outline-none border border-[var(--border-color)] text-sm focus:border-[var(--accent)]"
                  >
                     {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-3 text-[var(--text-tertiary)] pointer-events-none" />
               </div>
            </div>

            {/* Calendar Strip - Only in Day/Week View */}
            {viewMode !== 'MONTH' && (
               <div className="flex justify-between items-center mt-6">
                  {calendarStrip.map((d, idx) => {
                     const isSelected = d.getDate() === selectedDate.getDate();
                     return (
                        <div
                           key={idx}
                           onClick={() => setSelectedDate(d)}
                           className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${isSelected ? '' : 'opacity-40 hover:opacity-70'}`}
                        >
                           <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)]">{weekDayNames[d.getDay()]}</span>
                           <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${isSelected ? 'bg-[var(--accent)] text-white shadow-[var(--shadow-glow)] scale-110' : 'text-[var(--text-primary)] bg-[var(--input-bg)]'}`}>
                              {d.getDate()}
                           </div>
                        </div>
                     );
                  })}
               </div>
            )}
         </div>

         {/* Stats Cards Grid - 2 cols on mobile is fine */}
         <div className="grid grid-cols-2 gap-3">
            {/* Profit (Full Width) */}
            <div className="col-span-2 stat-card stat-card-sales">
               <div className="flex justify-between items-start">
                  <div>
                     <p className="text-xs font-bold text-blue-200 uppercase mb-0.5 tracking-wide">Daily Profit</p>
                     <p className="text-[11px] font-bn font-semibold text-blue-300 mb-2">দৈনিক লাভ</p>
                     <h3 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight truncate">{formatCurrency(stats.profitTotal)}</h3>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                     <TrendingUp className="text-blue-200" size={22} />
                  </div>
               </div>
            </div>

            {/* Added */}
            <div className={`card p-4 relative overflow-hidden transition-opacity ${transactionFilter === 'SALE' ? 'opacity-40' : 'opacity-100'}`}>
               <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4" style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)' }}>
                  <Plus className="text-[var(--success)]" size={18} />
               </div>
               <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase mb-0.5 tracking-wide">Stock Added</p>
               <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] font-mono tracking-tight truncate">{formatCurrency(stats.addedTotal)}</h3>
            </div>

            {/* Sold */}
            <div className={`card p-4 relative overflow-hidden transition-opacity ${transactionFilter === 'ADD' ? 'opacity-40' : 'opacity-100'}`}>
               <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4" style={{ background: 'var(--accent-light)' }}>
                  <ShoppingBag className="text-[var(--accent)]" size={18} />
               </div>
               <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase mb-0.5 tracking-wide">Total Sales</p>
               <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] font-mono tracking-tight truncate">{formatCurrency(stats.soldTotal)}</h3>
            </div>
         </div>

         {/* Transactions List */}
         <div>
            <div className="flex items-center justify-between mb-3">
               <h3 className="text-base font-bold text-[var(--text-primary)] flex items-baseline gap-2">
                  History
                  <span className="text-[var(--text-tertiary)] text-sm font-bn font-medium">/ ইতিহাস</span>
               </h3>
               <span className="text-xs font-bold text-[var(--text-tertiary)] bg-[var(--input-bg)] px-3 py-1 rounded-full border border-[var(--border-subtle)]">
                  {transactions.length} items
               </span>
            </div>

            <div className="space-y-3">
               {transactions.length === 0 ? (
                  <div className="empty-state">
                     <div className="empty-state-icon"><ShoppingBag size={20} /></div>
                     <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">No transactions found</p>
                     <p className="text-xs text-[var(--text-tertiary)]">Try adjusting date or filters</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 gap-3">
                     {transactions.map((t) => (
                        <div
                           key={t.id}
                           onClick={() => setSelectedTransaction(t)}
                           className="list-item p-3.5 flex items-center justify-between cursor-pointer"
                        >
                           <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'SALE' ? '' : ''}`} style={{ background: t.type === 'SALE' ? 'var(--accent-light)' : 'var(--success-bg)' }}>
                                 {t.type === 'SALE' ? <ArrowUp className="text-[#FF9800]" size={20} /> : <ArrowDown className="text-[#4CAF50]" size={20} />}
                              </div>
                              <div>
                                 <div translate="no" className="notranslate">
                                    <h4 className="font-bold text-[var(--text-primary)] text-sm leading-tight">{getPrimaryName(t.name, t.nameBn)}</h4>
                                    <div className="flex flex-col mt-0.5">
                                       <span className="text-[10px] text-[var(--text-secondary)] font-bn font-medium">
                                          {getSecondaryName(t.name, t.nameBn)}
                                       </span>
                                    </div>
                                 </div>
                                 <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 font-medium flex gap-1">
                                    <span>{formatDate(t.time)}</span> • <span>{formatTime(t.time)}</span>
                                 </span>
                              </div>
                           </div>
                           <div className="text-right">
                              <span className={`block font-bold text-sm ${t.type === 'SALE' ? 'text-[var(--accent)]' : 'text-[var(--success)]'}`}>
                                 {t.type === 'SALE' ? '-' : '+'} {t.quantity} {t.unit === 'pcs' ? 'Pcs' : t.unit}
                              </span>
                              <span className="text-xs font-bold text-[var(--text-secondary)] font-mono">{formatCurrency(t.amount)}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>

         {/* Transaction Details Modal */}
         {selectedTransaction && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
               <div className="bg-[var(--bg-surface)] w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up relative border-t border-[var(--border-color)]">
                  <button
                     onClick={() => setSelectedTransaction(null)}
                     className="absolute top-4 right-4 p-2 bg-[var(--input-bg)] rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                     <X size={20} />
                  </button>

                  <div className="flex flex-col items-center mb-6">
                     <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3`} style={{ background: selectedTransaction.type === 'SALE' ? 'var(--accent-light)' : 'var(--success-bg)' }}>
                        {selectedTransaction.type === 'SALE' ? <ArrowUp className="text-[var(--accent)]" size={28} /> : <ArrowDown className="text-[var(--success)]" size={28} />}
                     </div>
                     <h3 className="text-xl font-bold text-[var(--text-primary)]">{t('transDetails')}</h3>
                     <p className="text-sm text-[var(--text-secondary)] font-bn">{tSub('transDetails')}</p>
                  </div>

                  <div className="space-y-3 bg-[var(--input-bg)] rounded-xl p-4 border border-[var(--border-subtle)]">
                     <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
                        <span className="text-sm text-[var(--text-tertiary)]">{t('name')}</span>
                        <div className="text-right notranslate" translate="no">
                           <span className="block font-bold text-sm text-[var(--text-primary)]">{getPrimaryName(selectedTransaction.name, selectedTransaction.nameBn)}</span>
                           <span className="text-xs text-[var(--text-tertiary)] font-bn">{getSecondaryName(selectedTransaction.name, selectedTransaction.nameBn)}</span>
                        </div>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
                        <span className="text-sm text-[var(--text-tertiary)]">{selectedTransaction.type === 'SALE' ? t('soldAt') : t('added')}</span>
                        <span className="font-bold text-sm text-[var(--text-primary)]">
                           {formatDate(selectedTransaction.time)} at {formatTime(selectedTransaction.time)}
                        </span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
                        <span className="text-sm text-[var(--text-tertiary)]">{t('quantity')}</span>
                        <span className="font-bold text-sm text-[var(--text-primary)]">
                           {selectedTransaction.quantity} {selectedTransaction.unit}
                        </span>
                     </div>
                     {selectedTransaction.quantity > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
                           <span className="text-sm text-[var(--text-tertiary)]">{selectedTransaction.type === 'SALE' ? t('unitPrice') : 'Unit Cost'}</span>
                           <span className="font-bold text-sm text-[var(--text-primary)] font-mono">
                              {formatCurrency(selectedTransaction.amount / selectedTransaction.quantity)}
                           </span>
                        </div>
                     )}
                     <div className="flex justify-between items-center pt-2">
                        <span className="text-sm font-bold text-[var(--text-primary)]">{selectedTransaction.type === 'SALE' ? t('totalValue') : t('totalCost')}</span>
                        <span className={`text-xl font-bold font-mono ${selectedTransaction.type === 'SALE' ? 'text-[var(--accent)]' : 'text-[var(--success)]'}`}>
                           {formatCurrency(selectedTransaction.amount)}
                        </span>
                     </div>
                     {/* Profit Display for Sales */}
                     {selectedTransaction.type === 'SALE' && (selectedTransaction.profit !== undefined) && (
                        <div className="flex justify-between items-center pt-2 border-t border-[var(--border-color)] mt-2">
                           <span className="text-sm font-bold text-[var(--info)]">Profit Generated</span>
                           <span className="text-xl font-bold font-mono text-[var(--info)]">
                              {formatCurrency(selectedTransaction.profit)}
                           </span>
                        </div>
                     )}
                  </div>

                  <button
                     onClick={() => setSelectedTransaction(null)}
                     className="w-full mt-6 py-3.5 bg-[var(--input-bg)] rounded-xl font-bold text-[var(--text-primary)] hover:bg-[var(--card-hover)] transition-colors border border-[var(--border-subtle)]"
                  >
                     {t('done')}
                  </button>
               </div>
            </div>
         )}
      </div>
   );
};