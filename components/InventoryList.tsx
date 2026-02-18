import React, { useState, useMemo } from 'react';
import { Product, InventoryFilter } from '../types';
import { Search, SlidersHorizontal, Package, ShoppingBag, Droplet, Plus, Trash2, Egg, Coffee, Cookie, ChevronDown } from 'lucide-react';
import { formatNumber, formatUnit } from '@/src/utils';

interface InventoryListProps {
  products: Product[];
  lowStockThreshold: number;
  onDelete: (id: string) => void;
  onEdit: (product: Product) => void;
  onSell: (product: Product, quantity: number, salePrice: number) => void;
  onAdd: () => void;
  filter: InventoryFilter;
  onFilterChange: (filter: InventoryFilter) => void;
  onClearFilter: () => void;
  language: 'en' | 'bn';
}

export const InventoryList: React.FC<InventoryListProps> = ({
  products,
  lowStockThreshold,
  onDelete,
  onEdit,
  _onSell,
  onAdd,
  filter,
  onFilterChange,
  _onClearFilter,
  language
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Debounced Search (Simple implementation)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter(p => {
      if (!p) return false;

      // 1. Search Filter
      const searchLower = (debouncedSearchTerm || '').toLowerCase();
      const nameLower = (p.name || '').toLowerCase();
      const nameBnLower = (p.nameBn || '').toLowerCase();

      const matchesSearch = nameLower.includes(searchLower) || nameBnLower.includes(searchLower);

      if (!matchesSearch) return false;

      // 2. Category/Status Filter
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (filter) {
        case 'ALL': return true;
        case 'OUT_OF_STOCK': return p.quantity === 0;
        case 'EXPIRED':
          if (!p.expiryDate) return false;
          return new Date(p.expiryDate) < today;
        case 'EXPIRING_SOON': {
          if (!p.expiryDate) return false;
          const expTime = new Date(p.expiryDate).getTime();
          const todayTime = today.getTime();
          const nearExpiryTime = todayTime + (30 * 24 * 60 * 60 * 1000); // 30 days
          return expTime >= todayTime && expTime <= nearExpiryTime;
        }
        case 'LOW_STOCK':
          if (p.category === 'packet') return p.quantity < lowStockThreshold;
          return (p.fillLevel || 0) < 20;
        default:
          return true;
      }
    });
  }, [products, filter, debouncedSearchTerm, lowStockThreshold]);

  // Helper for icons (Restored Rich Version with Safety)
  const getProductIcon = (name: string, category: string) => {
    const n = (name || '').toLowerCase();
    if (n.includes('oil') || category === 'liquid') return <Droplet size={22} className="text-[var(--text-tertiary)]" />;
    if (n.includes('egg')) return <Egg size={22} className="text-[var(--text-tertiary)]" />;
    if (n.includes('tea') || n.includes('coffee')) return <Coffee size={22} className="text-[var(--text-tertiary)]" />;
    if (n.includes('biscuit') || n.includes('cookie')) return <Cookie size={22} className="text-[var(--text-tertiary)]" />;
    if (n.includes('rice') || category === 'loose') return <ShoppingBag size={22} className="text-[var(--text-tertiary)]" />;
    return <Package size={22} className="text-[var(--text-tertiary)]" />;
  };

  // Helper for Traffic Light Status
  const getTrafficLightStatus = (product: Product) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Default GREEN
    let status = { color: 'border-l-4 border-l-[#4CAF50]', text: 'text-[#4CAF50]', label: 'Safe', badge: 'bg-[#4CAF50]/10' };

    if (product?.expiryDate) {
      const exp = new Date(product.expiryDate);
      const diffTime = exp.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        // RED: Expired
        status = { color: 'border-l-4 border-l-[#CF6679]', text: 'text-[#CF6679]', label: 'Expired', badge: 'bg-[#CF6679]/10' };
      } else if (diffDays <= 30) {
        // YELLOW: Near Expiry
        status = { color: 'border-l-4 border-l-[#FFC107]', text: 'text-[#FFC107]', label: '< 30 Days', badge: 'bg-[#FFC107]/10' };
      }
    }

    // Override for Low Stock (Orange)
    if (product?.category === 'packet' && product.quantity > 0 && product.quantity < lowStockThreshold) {
      status = { color: 'border-l-4 border-l-[#FF9800]', text: 'text-[#FF9800]', label: 'Low Stock', badge: 'bg-[#FF9800]/10' };
    }

    // Override for Out of Stock (Grey)
    if (product?.quantity === 0 && product.category === 'packet') {
      status = { color: 'border-l-4 border-l-gray-500', text: 'text-gray-500', label: 'Out of Stock', badge: 'bg-gray-500/10' };
    }

    return status;
  };

  // Helper to resolve names based on language - SAFE
  const getPrimaryName = (item: Product) => {
    if (!item) return 'Unknown Item';
    if (language === 'bn' && item.nameBn) return item.nameBn;
    return item.name || 'Unknown Item';
  };

  const getSecondaryName = (item: Product) => {
    if (!item) return '';
    if (language === 'bn' && item.nameBn) return item.name || '';
    return item.nameBn || '';
  };

  return (
    <div className="p-4 space-y-5 pb-28 bg-background min-h-screen font-sans relative">

      {/* Header */}
      <div className="flex justify-between items-start pt-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Inventory<span className="text-[var(--accent)]">List</span></h1>
          <p className="text-[var(--text-secondary)] text-sm font-medium mt-0.5">
            Manage Stock / <span className="font-bn">স্টক ম্যানেজ করুন</span>
          </p>
        </div>
      </div>

      {/* Search Bar Row */}
      <div className="flex gap-2.5">
        <div className="search-input relative flex-1 flex items-center">
          <Search className="absolute left-3.5 text-[var(--text-tertiary)]" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items..."
            className="w-full h-11 pl-10 pr-4 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none text-sm"
          />
        </div>
        <button
          onClick={() => onFilterChange(filter === 'ALL' ? 'LOW_STOCK' : 'ALL')}
          className={`w-11 h-11 rounded-xl border flex items-center justify-center active:scale-95 transition-all ${filter === 'LOW_STOCK' ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-[var(--shadow-glow)]' : 'bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)]'}`}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mask-linear-fade">
        {(['ALL', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRING_SOON', 'EXPIRED'] as const).map(f => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={`chip ${filter === f ? 'chip-active' : ''}`}
          >
            {f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {(!filteredProducts || filteredProducts.length === 0) ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Package size={22} /></div>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">No items found</p>
            <p className="text-xs text-[var(--text-tertiary)]">Try adjusting your search or filters</p>
          </div>
        ) : (
          Object.entries(
            filteredProducts.reduce((acc: Record<string, Product[]>, item: Product) => {
              const key = (item.name || 'Unknown').trim().toLowerCase();
              if (!acc[key]) acc[key] = [];
              acc[key].push(item);
              return acc;
            }, {} as Record<string, Product[]>)
          ).map(([key, group]: [string, Product[]]) => {
            const isGroup = group.length > 1;
            const primaryItem = group[0];
            const totalQty = group.reduce((sum, i) => sum + i.quantity, 0);
            const isExpanded = expandedGroups[key];

            // Render Single Item
            if (!isGroup) {
              const item = group[0];
              const status = getTrafficLightStatus(item);
              return (
                <div key={item.id} className="mb-1">
                  <div
                    onClick={() => onEdit(item)}
                    className="list-item p-4 relative overflow-hidden cursor-pointer"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="shrink-0 w-14 h-14 rounded-xl bg-[var(--input-bg)] flex items-center justify-center overflow-hidden border border-[var(--border-subtle)]">
                        {item.image ? (
                          <img src={item.image} className="w-full h-full object-cover" alt="" />
                        ) : getProductIcon(item.name, item.category)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 pr-2">
                            <h3 className="text-base font-bold text-[var(--text-primary)] truncate leading-tight">
                              {getPrimaryName(item)}
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)] truncate opacity-80 mt-0.5 font-bn">
                              {getSecondaryName(item)}
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${status.badge} ${status.text}`}>
                                {status.label}
                              </span>
                              <span className="text-xs font-medium text-[var(--text-secondary)]">
                                {formatNumber(item.quantity, language)} {formatUnit(item.unit, language)}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="block text-lg font-bold font-mono text-[var(--text-primary)]">₹{item.mrp}</span>
                            {item.costPrice > 0 && (
                              <span className="block text-[10px] text-[var(--text-secondary)] font-mono opacity-60">CP: ₹{item.costPrice}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-subtle)] relative z-20">
                      <div className="text-[10px] text-[var(--text-tertiary)]">
                        {item.expiryDate ? (
                          <span className={status.text === 'text-[#CF6679]' ? 'text-[var(--danger)] font-bold' : ''}>
                            Exp: {new Date(item.expiryDate).toLocaleDateString(language === 'en' ? 'en-IN' : 'bn-IN')}
                          </span>
                        ) : (
                          <span>No Expiry</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                        className="relative z-50 w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            // Render Group
            return (
              <div key={key} className="mb-1 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)] shadow-[var(--shadow-sm)] overflow-hidden transition-all">
                {/* Group Header */}
                <div
                  onClick={() => toggleGroup(key)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-[var(--card-hover)] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="relative w-12 h-12 rounded-xl bg-[var(--input-bg)] flex items-center justify-center overflow-hidden border border-[var(--border-subtle)] z-10">
                        {primaryItem.image ? (
                          <img src={primaryItem.image} className="w-full h-full object-cover" alt="" />
                        ) : getProductIcon(primaryItem.name, primaryItem.category)}
                      </div>
                      <div className="absolute -bottom-1.5 -right-1.5 bg-[var(--accent)] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full z-20 shadow-sm">
                        {formatNumber(group.length, language)}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight">{getPrimaryName(primaryItem)}</h3>
                      <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
                        Total Stock: <span className="text-[var(--text-primary)]">{formatNumber(totalQty, language)} {formatUnit(primaryItem.unit, language)}</span>
                      </p>
                    </div>
                  </div>

                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${isExpanded ? 'rotate-180 bg-[var(--accent-light)] text-[var(--accent)]' : 'bg-[var(--input-bg)] text-[var(--text-tertiary)]'}`}>
                    <ChevronDown size={18} />
                  </div>
                </div>

                {/* Expanded Variants */}
                <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100 pb-2' : 'max-h-0 opacity-0'}`}>
                  <div className="px-2 space-y-1">
                    {group.map(item => {
                      const status = getTrafficLightStatus(item);
                      return (
                        <div
                          key={item.id}
                          onClick={() => onEdit(item)}
                          className="ml-4 mr-0 p-3 bg-[var(--input-bg)] border-l-2 border-[var(--border-color)] rounded-r-xl flex items-start justify-between cursor-pointer hover:bg-[var(--card-hover)] transition-colors"
                        >
                          <div className="flex gap-3 min-w-0">
                            <div className="shrink-0 w-10 h-10 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center overflow-hidden">
                              {item.image ? <img src={item.image} className="w-full h-full object-cover" alt="" /> : getProductIcon(item.name, item.category)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">{getPrimaryName(item)}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[9px] font-bold uppercase ${status.text}`}>{status.label}</span>
                                <span className="text-xs text-[var(--text-secondary)]">{formatNumber(item.quantity, language)} {formatUnit(item.unit, language)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span className="text-sm font-bold font-mono text-[var(--text-primary)]">₹{item.mrp}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                alert('Debug: Delete Clicked for Variant ID: ' + item.id);
                                onDelete(item.id);
                              }}
                              className="relative z-50 p-1.5 rounded-lg transition-colors" style={{ color: 'var(--danger)' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Add Button — bottom-right, above nav */}
      <button
        onClick={onAdd}
        className="fixed bottom-24 right-5 z-40 btn-primary w-14 h-14 rounded-2xl !p-0 shadow-[var(--shadow-glow)] animate-scale-in"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
};