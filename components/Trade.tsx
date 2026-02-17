import React, { useState, useMemo, useEffect } from 'react';
import { Product, StockBatch } from '../types';
import { TRANSLATIONS } from '../constants';
import { Search, ScanQrCode, Plus, Minus, Trash2, ShoppingBag, ChevronRight, CheckCircle } from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
  batchId?: string;
  salePrice?: number;
}

interface TradeProps {
  products: Product[];
  cart: CartItem[];
  onUpdateCart: (cartOrUpdater: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void;
  onScanClick: () => void;
  onConfirmSale: () => void;
  onAddManual: () => void;
  language: 'en' | 'bn';
}

export const Trade: React.FC<TradeProps> = ({
  products,
  cart,
  onUpdateCart,
  onScanClick,
  onConfirmSale,
  onAddManual,
  language
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedProductForBatch, setSelectedProductForBatch] = useState<Product | null>(null);

  const t = (key: keyof typeof TRANSLATIONS) => language === 'en' ? TRANSLATIONS[key].en : TRANSLATIONS[key].bn;
  const tSub = (key: keyof typeof TRANSLATIONS) => language === 'en' ? TRANSLATIONS[key].bn : TRANSLATIONS[key].en;

  // Helper to resolve names based on language
  const getPrimaryName = (item: Product) => {
    if (language === 'bn' && item.nameBn) return item.nameBn;
    return item.name;
  };

  const getSecondaryName = (item: Product) => {
    if (language === 'bn' && item.nameBn) return item.name;
    return item.nameBn;
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat(language === 'bn' ? 'bn-IN' : 'en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const query = searchTerm.toLowerCase();
    const results = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      (p.nameBn && p.nameBn.toLowerCase().includes(query))
    );
    setSearchResults(results.slice(0, 5));
  }, [searchTerm, products]);

  const initiateAddToCart = (product: Product) => {
    // If product has multiple batches, or user wants to specify price/qty, show modal.
    // For now, ALWAYS show modal to restore the requested feature of "choosing price/qty/batch".
    setSelectedProductForBatch(product);
    setSearchTerm('');
    setSearchResults([]);
  };

  const confirmAddToCart = (product: Product, quantity: number, price: number, batchId?: string) => {
    onUpdateCart((prevCart: CartItem[]) => {
      // If batchId is present, treat as unique item key combined with product ID
      if (batchId) {
        const existingIndex = prevCart.findIndex(item => item.product.id === product.id && item.batchId === batchId);
        if (existingIndex > -1) {
          const newCart = [...prevCart];
          newCart[existingIndex] = {
            ...newCart[existingIndex],
            quantity: newCart[existingIndex].quantity + quantity,
            salePrice: price // Update price if they re-add same batch? Or keep old? Let's update.
          };
          return newCart;
        }
        return [...prevCart, { product, quantity, salePrice: price, batchId }];
      }

      // Fallback for no batch (shouldn't happen with new modal, but safe to keep)
      const existingIndex = prevCart.findIndex(item => item.product.id === product.id && !item.batchId);
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + quantity,
          salePrice: price
        };
        return newCart;
      } else {
        return [...prevCart, { product, quantity, salePrice: price }];
      }
    });
    setSelectedProductForBatch(null);
  };

  const updateQuantity = (productId: string, delta: number) => {
    // onUpdateCart is setCart from App.tsx, so we can use functional updates
    onUpdateCart((prevCart: CartItem[]) => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          return { ...item, quantity: Math.max(0, item.quantity + delta) };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const clearCart = () => {
    if (window.confirm(language === 'en' ? 'Clear cart?' : 'কার্ট খালি করবেন?')) {
      onUpdateCart([]);
    }
  };

  const handleCheckoutClick = () => {
    if (cart.length > 0) {
      setShowConfirmModal(true);
    }
  };

  const handleFinalConfirm = () => {
    setShowConfirmModal(false);
    onConfirmSale();
  };

  const totalPayable = useMemo(() => {
    return cart.reduce((sum, item) => sum + ((item.salePrice || item.product.mrp) * item.quantity), 0);
  }, [cart]);

  return (
    <div className="flex flex-col h-full bg-background text-[var(--text-primary)] relative overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-2 flex justify-between items-center bg-background z-10 shrink-0">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            {t('trade')} <span className="text-[var(--accent)]">/ {tSub('trade')}</span>
          </h1>
          <p className="text-[var(--text-tertiary)] text-[10px] font-medium tracking-widest uppercase mt-0.5">{t('posSubtitle')}</p>
        </div>
      </div>

      {/* List Container - Padding adjusted to clear Bottom Nav (~90px) + Floating elements */}
      <div className={`p-4 space-y-4 flex-1 overflow-y-auto no-scrollbar ${cart.length > 0 ? 'pb-[220px]' : 'pb-[160px]'}`}>

        {/* Quick Scan Button */}
        <button
          onClick={onScanClick}
          className="w-full h-16 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center gap-3 active:scale-[0.98] transition-all relative overflow-hidden group animate-pulse-glow"
        >
          <ScanQrCode size={20} className="text-white drop-shadow-md" strokeWidth={2.5} />
          <div className="flex flex-col items-start leading-none">
            <span className="text-base font-bold text-white drop-shadow-md">{t('quickScanSell')}</span>
            <span className="text-[10px] font-bn font-bold text-white/80">{tSub('quickScanSell')}</span>
          </div>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity"></div>
        </button>

        {/* Search Bar */}
        <div className="relative z-20">
          <div className="search-input flex items-center">
            <Search className="absolute left-3.5 text-[var(--text-tertiary)]" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`${t('itemSearch')} / ${tSub('itemSearch')}...`}
              className="w-full h-12 pl-10 pr-4 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none"
            />
          </div>
          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-color)] shadow-[var(--shadow-xl)] overflow-hidden z-50">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => initiateAddToCart(product)}
                  className="w-full text-left p-3 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--card-hover)] flex items-center justify-between group transition-colors"
                >
                  <div translate="no" className="notranslate">
                    <div className="font-bold text-sm text-[var(--text-primary)]">{getPrimaryName(product)}</div>
                    <div className="text-[10px] text-[var(--text-secondary)] font-bn">{getSecondaryName(product)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[var(--accent)]">₹{product.mrp}</span>
                    <Plus size={14} className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Current Cart Header */}
        <div className="flex items-center justify-between px-1 pt-1">
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            {t('currentCart')} <span className="text-[var(--text-secondary)] text-xs font-normal">({cart.length})</span>
          </h3>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[10px] text-[var(--accent)] font-bold hover:text-[var(--accent-hover)] transition-colors uppercase tracking-wider"
            >
              {t('clearAll')}
            </button>
          )}
        </div>

        {/* Cart List */}
        <div className="space-y-3 min-h-[100px]">
          {cart.length === 0 ? (
            <div className="empty-state min-h-[100px]">
              <div className="empty-state-icon"><ShoppingBag size={20} /></div>
              <p className="text-xs text-[var(--text-secondary)]">{t('cartEmpty')}</p>
              <p className="text-[10px] font-bn text-[var(--text-tertiary)]">{tSub('cartEmpty')}</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              // SHRUNK CARD
              <div key={idx} className="list-item p-3 flex items-center justify-between relative group">
                {/* Product Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--input-bg)] flex items-center justify-center shrink-0 overflow-hidden border border-[var(--border-subtle)]">
                    {item.product.image ? (
                      <img src={item.product.image} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <ShoppingBag size={18} className="text-[var(--text-tertiary)]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div translate="no" className="notranslate">
                      <h4 className="font-semibold text-sm text-[var(--text-primary)] leading-tight truncate">{getPrimaryName(item.product)}</h4>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[10px] text-[var(--text-tertiary)] font-bn truncate max-w-[80px]">{getSecondaryName(item.product)}</p>
                        {item.batchId && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-mono">
                            B: {item.batchId.slice(0, 4)}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-bold text-[var(--accent)] font-mono leading-none mt-0.5">
                      ₹{((item.salePrice || item.product.mrp) * item.quantity).toFixed(2)}
                      {item.quantity > 1 && <span className="text-[9px] text-[var(--text-tertiary)] ml-1 font-normal">(₹{item.salePrice || item.product.mrp}/u)</span>}
                    </p>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 bg-[var(--input-bg)] rounded-xl p-1 border border-[var(--border-subtle)]">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="w-7 h-7 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] active:scale-90 transition-all"
                  >
                    {item.quantity === 1 ? <Trash2 size={12} className="text-[var(--danger)]" /> : <Minus size={14} />}
                  </button>
                  <span className="font-bold text-sm min-w-[16px] text-center text-[var(--text-primary)]">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white active:scale-90 transition-all shadow-sm"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Checkout Bar - Positioned above Nav Bar (approx 90px from bottom) */}
      {cart.length > 0 && (
        <div className="absolute bottom-[110px] left-4 right-4 z-40">
          <div className="bg-[var(--bg-surface)] rounded-2xl p-2 pl-5 border border-[var(--border-color)] shadow-[var(--shadow-xl)] flex items-center justify-between gap-4 h-16 relative overflow-hidden">
            <div className="relative z-10">
              <span className="block text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">{t('totalPayable')}</span>
              <span className="text-lg font-bold text-[var(--accent)] font-mono tracking-tight leading-none">{formatCurrency(totalPayable)}</span>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="btn-primary h-10 px-5 !rounded-xl text-xs uppercase tracking-wide"
            >
              <span>{t('confirmSale')}</span>
              <ChevronRight size={14} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Add Manual Button - Dynamically positioned above Nav/Checkout */}
      <button
        onClick={onAddManual}
        className={`absolute right-4 w-12 h-12 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl flex items-center justify-center text-[var(--accent)] shadow-[var(--shadow-lg)] z-30 active:scale-90 transition-all hover:bg-[var(--card-hover)] duration-300 ${cart.length > 0 ? 'bottom-[200px]' : 'bottom-[120px]'}`}
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
          <div className="bg-[var(--bg-surface)] w-full max-w-xs rounded-3xl p-5 border border-[var(--border-color)] shadow-[var(--shadow-xl)] animate-scale-in">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)' }}>
                <CheckCircle size={28} className="text-[var(--success)]" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-[var(--text-primary)] text-center mb-1">{t('confirmSale')}?</h3>
            <p className="text-center text-[var(--text-secondary)] text-xs mb-5 font-bn">
              {language === 'en' ? 'Complete this transaction?' : 'এই লেনদেন সম্পন্ন করবেন?'}
            </p>

            <div className="bg-[var(--input-bg)] rounded-xl p-3 mb-5 border border-[var(--border-subtle)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-[var(--text-secondary)]">Items</span>
                <span className="text-xs font-bold text-[var(--text-primary)]">{cart.reduce((a, b) => a + b.quantity, 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-secondary)]">Total Amount</span>
                <span className="text-lg font-bold text-[var(--accent)] font-mono">{formatCurrency(totalPayable)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 h-12 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] transition-colors text-xs"
              >
                {TRANSLATIONS.cancel.en}
              </button>
              <button
                onClick={handleFinalConfirm}
                className="btn-primary flex-1 h-12 !rounded-xl text-xs"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Selection Modal */}
      {selectedProductForBatch && (
        <BatchDetailsModal
          product={selectedProductForBatch}
          onConfirm={confirmAddToCart}
          onCancel={() => setSelectedProductForBatch(null)}
          language={language}
          formatCurrency={formatCurrency}
        />
      )}

    </div>
  );
};

// Internal Component for Batch Selection
const BatchDetailsModal: React.FC<{
  product: Product;
  onConfirm: (product: Product, quantity: number, price: number, batchId?: string) => void;
  onCancel: () => void;
  language: 'en' | 'bn';
  formatCurrency: (val: number) => string;
}> = ({ product, onConfirm, onCancel, language, formatCurrency }) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string | undefined>(
    (product.batches && product.batches.length > 0) ? product.batches[0].id : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(product.mrp);

  // Update price default when batch changes (optional, if batches had specific MRPs, but usually MRP is product level. 
  // However, cost price might differ. For selling, we usually default to Product MRP)

  const handleConfirm = () => {
    onConfirm(product, quantity, price, selectedBatchId);
  };

  const batches = product.batches || [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[var(--bg-surface)] w-full max-w-sm rounded-3xl p-5 border border-[var(--border-color)] shadow-[var(--shadow-xl)] animate-scale-in flex flex-col max-h-[90vh]">

        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight">{language === 'en' ? product.name : (product.nameBn || product.name)}</h3>
            <p className="text-xs text-[var(--text-secondary)]">Stock: <span className="font-bold">{product.quantity} {product.unit}</span></p>
          </div>
          <button onClick={onCancel} className="p-2 -mr-2 -mt-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
            <span className="sr-only">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
          {/* Batch Selection */}
          {batches.length > 0 && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Select Batch</label>
              <div className="space-y-2">
                {batches.map(batch => (
                  <label key={batch.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedBatchId === batch.id ? 'border-[var(--accent)] bg-[var(--accent-light)]' : 'border-[var(--border-subtle)] bg-[var(--input-bg)]'}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="batch"
                        value={batch.id}
                        checked={selectedBatchId === batch.id}
                        onChange={() => setSelectedBatchId(batch.id)}
                        className="accent-[var(--accent)] w-4 h-4"
                      />
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)]">
                          Exp: {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-[10px] text-[var(--text-secondary)]">
                          Qty: {batch.quantity} | Cost: {formatCurrency(batch.costPrice || 0)}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Quantity</label>
              <div className="flex items-center bg-[var(--input-bg)] rounded-xl border border-[var(--border-subtle)] h-12 px-1">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center text-[var(--text-secondary)] active:scale-90 transition-transform">
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="flex-1 w-full bg-transparent text-center font-bold text-[var(--text-primary)] outline-none"
                />
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center text-[var(--text-secondary)] active:scale-90 transition-transform">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Sale Price (Unit)</label>
              <div className="flex items-center bg-[var(--input-bg)] rounded-xl border border-[var(--border-subtle)] h-12 px-3 focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent-glow)] transition-all">
                <span className="text-[var(--text-tertiary)] mr-1">₹</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-transparent font-bold text-[var(--text-primary)] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
          <button
            onClick={handleConfirm}
            className="btn-primary w-full h-12 !rounded-xl text-sm"
          >
            Add to Cart — {formatCurrency(price * quantity)}
          </button>
        </div>
      </div>
    </div>
  );