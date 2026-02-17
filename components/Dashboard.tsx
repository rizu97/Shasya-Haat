import React, { useMemo } from 'react';
import { Product, SaleRecord } from '../types';
import { TRANSLATIONS } from '../constants';
import { ShoppingBag, TrendingUp, AlertTriangle, Package, ScanQrCode, Bell, CheckCircle, Plus, ArrowUpRight } from 'lucide-react';

interface DashboardProps {
   products: Product[];
   sales: SaleRecord[];
   onScanClick: () => void;
   onAddStock: (product?: Product) => void;
   onFilterSelect: (filter: 'LOW_STOCK') => void;
   lowStockThreshold: number;
   language: 'en' | 'bn';
}

export const Dashboard: React.FC<DashboardProps> = ({
   products,
   sales,
   onScanClick,
   onAddStock,
   onFilterSelect,
   language
}) => {
   const t = (key: keyof typeof TRANSLATIONS) => language === 'en' ? TRANSLATIONS[key].en : TRANSLATIONS[key].bn;

   const stats = useMemo(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todaySales = sales.filter(s => new Date(s.timestamp) >= today);
      const totalSales = todaySales.reduce((sum, s) => sum + s.salePrice, 0);
      const itemCount = todaySales.reduce((sum, s) => sum + s.quantity, 0);

      return { totalSales, itemCount, transactionCount: todaySales.length };
   }, [sales]);

   const lowStockItems = useMemo(() => {
      return products.filter(p => {
         if (p.category === 'packet') return p.quantity < 5;
         return (p.fillLevel || 0) < 20;
      });
   }, [products]);

   const topSellingWithDetails = useMemo(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaySales = sales.filter(s => new Date(s.timestamp) >= today);

      const productSales: Record<string, number> = {};
      const productRevenue: Record<string, number> = {};

      todaySales.forEach(s => {
         productSales[s.productId] = (productSales[s.productId] || 0) + s.quantity;
         productRevenue[s.productId] = (productRevenue[s.productId] || 0) + s.salePrice;
      });

      return Object.entries(productSales)
         .sort(([, a], [, b]) => b - a)
         .slice(0, 5)
         .map(([id, quantity]) => {
            const product = products.find(p => p.id === id);
            if (!product) return null;
            return {
               ...product,
               totalSold: quantity,
               totalRevenue: productRevenue[id]
            };
         })
         .filter(Boolean) as (Product & { totalSold: number, totalRevenue: number })[];
   }, [sales, products]);

   const formatCurrency = (val: number) =>
      new Intl.NumberFormat(language === 'bn' ? 'bn-IN' : 'en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

   const getPrimaryName = (item: Product) => {
      if (language === 'bn' && item.nameBn) return item.nameBn;
      return item.name;
   };

   const getSecondaryName = (item: Product) => {
      if (language === 'bn' && item.nameBn) return item.name;
      return item.nameBn;
   };

   return (
      <div className="p-4 space-y-6 pb-28 bg-background min-h-screen font-sans">

         {/* Header */}
         <div className="flex justify-between items-start pt-3">
            <div>
               <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{t('ownerDashboard')}</h1>
               <p className="text-[var(--text-secondary)] text-sm font-medium mt-0.5">
                  {new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'bn-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
               </p>
            </div>
            <button className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center shadow-[var(--shadow-xs)] hover:bg-[var(--card-hover)] transition-colors">
               <Bell size={18} className="text-[var(--text-secondary)]" />
            </button>
         </div>

         {/* Stats Cards Row */}
         <div className="grid grid-cols-2 gap-3">
            {/* Sales Card */}
            <div className="stat-card stat-card-sales">
               <div className="relative z-10">
                  <div className="flex items-center gap-1.5 mb-2 opacity-80">
                     <TrendingUp size={14} />
                     <span className="text-[10px] font-bold uppercase tracking-wider">{t('todaySales')}</span>
                  </div>
                  <h3 className="text-2xl font-bold font-mono tracking-tight">{formatCurrency(stats.totalSales)}</h3>
                  <div className="flex items-center gap-1 mt-2 opacity-70">
                     <ArrowUpRight size={12} />
                     <span className="text-[10px] font-medium">{stats.transactionCount} orders</span>
                  </div>
               </div>
            </div>

            {/* Items Sold Card */}
            <div className="stat-card stat-card-items">
               <div className="relative z-10">
                  <div className="flex items-center gap-1.5 mb-2 opacity-80">
                     <ShoppingBag size={14} />
                     <span className="text-[10px] font-bold uppercase tracking-wider">{t('itemsSold')}</span>
                  </div>
                  <h3 className="text-2xl font-bold font-mono tracking-tight">{stats.itemCount}</h3>
                  <div className="flex items-center gap-1 mt-2 opacity-70">
                     <Package size={12} />
                     <span className="text-[10px] font-medium">{products.length} in stock</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Top Selling Section */}
         <div>
            <div className="flex items-center justify-between mb-3">
               <h3 className="text-base font-bold text-[var(--text-primary)]">{t('topSelling')}</h3>
            </div>

            <div className="space-y-2">
               {topSellingWithDetails.length === 0 ? (
                  <div className="empty-state">
                     <div className="empty-state-icon">
                        <TrendingUp size={22} />
                     </div>
                     <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">{t('noSalesToday')}</p>
                     <p className="text-xs text-[var(--text-tertiary)]">Sales will appear here as they happen</p>
                  </div>
               ) : (
                  topSellingWithDetails.map((item, idx) => (
                     <div key={idx} className="list-item p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                           <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] flex items-center justify-center font-bold text-sm text-[var(--accent)] shrink-0">
                              #{idx + 1}
                           </div>
                           <div className="min-w-0">
                              <div translate="no" className="notranslate">
                                 <h4 className="font-semibold text-sm text-[var(--text-primary)] truncate leading-tight">{getPrimaryName(item)}</h4>
                                 <p className="text-[10px] text-[var(--text-tertiary)] font-bn truncate">{getSecondaryName(item)}</p>
                              </div>
                              <p className="text-xs font-bold text-[var(--accent)] mt-0.5">{item.totalSold} sold</p>
                           </div>
                        </div>
                        <span className="text-sm font-bold font-mono text-[var(--text-primary)] shrink-0 pl-2">{formatCurrency(item.totalRevenue)}</span>
                     </div>
                  ))
               )}
            </div>
         </div>

         {/* Low Stock Alerts */}
         <div>
            <div className="flex items-center gap-2 mb-3">
               <div className="w-6 h-6 rounded-lg bg-[var(--danger-bg)] flex items-center justify-center">
                  <AlertTriangle size={14} className="text-[var(--danger)]" />
               </div>
               <h3 className="text-base font-bold text-[var(--text-primary)]">{t('lowStock')}</h3>
               {lowStockItems.length > 0 && (
                  <span className="bg-[var(--danger)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{lowStockItems.length}</span>
               )}
            </div>

            <div className="space-y-2">
               {lowStockItems.length === 0 ? (
                  <div className="flex items-center gap-2.5 p-3.5 rounded-xl" style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)' }}>
                     <CheckCircle size={16} className="text-[var(--success)] shrink-0" />
                     <span className="text-sm font-semibold text-[var(--success)]">Stock levels are healthy</span>
                  </div>
               ) : (
                  lowStockItems.slice(0, 3).map((item) => (
                     <div key={item.id} className="list-item p-3 flex items-center justify-between" style={{ borderLeft: '3px solid var(--danger)' }}>
                        <div className="min-w-0 pr-2">
                           <div translate="no" className="notranslate">
                              <h4 className="font-semibold text-sm text-[var(--text-primary)] truncate leading-tight">{getPrimaryName(item)}</h4>
                              <p className="text-[10px] text-[var(--text-tertiary)] font-bn truncate">{getSecondaryName(item)}</p>
                           </div>
                           <p className="text-[10px] font-bold text-[var(--danger)] mt-1 uppercase tracking-wide">Only {item.quantity} {item.unit} left</p>
                        </div>
                        <button
                           onClick={() => onAddStock(item)}
                           className="p-2 rounded-xl transition-colors"
                           style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}
                        >
                           <Plus size={18} />
                        </button>
                     </div>
                  ))
               )}
               {lowStockItems.length > 3 && (
                  <button
                     onClick={() => onFilterSelect('LOW_STOCK')}
                     className="w-full py-2.5 text-center text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent)] bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl transition-colors"
                  >
                     View all {lowStockItems.length} low stock items
                  </button>
               )}
            </div>
         </div>

         {/* Quick Actions Grid */}
         <div>
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-3">{t('quickActions')}</h3>
            <div className="grid grid-cols-2 gap-3">
               <button
                  onClick={onScanClick}
                  className="card p-4 flex flex-col items-center gap-3 text-center"
               >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                     <ScanQrCode size={22} />
                  </div>
                  <div>
                     <p className="font-bold text-sm text-[var(--text-primary)]">{t('scanToSell')}</p>
                     <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{t('scanToSellSub')}</p>
                  </div>
               </button>

               <button
                  onClick={() => onAddStock()}
                  className="card p-4 flex flex-col items-center gap-3 text-center"
               >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                     <Package size={22} />
                  </div>
                  <div>
                     <p className="font-bold text-sm text-[var(--text-primary)]">{t('addStockAction')}</p>
                     <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{t('addStockSub')}</p>
                  </div>
               </button>
            </div>
         </div>
      </div>
   );
};