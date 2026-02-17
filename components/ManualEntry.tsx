import React, { useState, useEffect, useRef } from 'react';
import { Product, ScannedData, ProductUnit, StockBatch } from '../types';
import { TRANSLATIONS, MOCK_DB } from '../constants';
import { StorageService } from '../services/storageService';
import { generateId } from '../src/utils';
import { ChevronDown, Camera, Image as ImageIcon, ChevronLeft, Package, ShoppingBag, Calendar, Database, Store, Plus, Trash2 } from 'lucide-react';

interface ManualEntryProps {
  initialData?: Partial<ScannedData>;
  editingProduct?: Product;
  onSave: (product: Product) => Promise<void> | void;
  onCancel: () => void;
  onRequestCamera: () => void;
  language: 'en' | 'bn';
}

interface ProductSuggestion extends Partial<Product> {
  source: 'INVENTORY' | 'CATALOG';
}

export const ManualEntry: React.FC<ManualEntryProps> = ({ initialData, editingProduct, onSave, onCancel, onRequestCamera, language }) => {
  const [name, setName] = useState(editingProduct?.name || initialData?.name || '');
  const [nameBn, setNameBn] = useState(editingProduct?.nameBn || '');

  // MRP and Cost Price
  const [mrp, setMrp] = useState(editingProduct?.mrp?.toString() || initialData?.mrp?.toString() || '');
  const [costPrice, setCostPrice] = useState(editingProduct?.costPrice?.toString() || '');

  // Batches State
  const [batches, setBatches] = useState<StockBatch[]>(editingProduct?.batches || []);
  const [currentBatchQty, setCurrentBatchQty] = useState('');
  const [currentBatchExpiry, setCurrentBatchExpiry] = useState('');

  // Legacy/Fallback State (will be derived/ignored)
  const [unit, setUnit] = useState<ProductUnit>(editingProduct?.unit || 'pcs');
  const [category, setCategory] = useState<'packet' | 'loose'>(editingProduct?.category || 'packet');
  const [fillLevel] = useState(editingProduct?.fillLevel || 100);
  const [productImage, setProductImage] = useState<string | undefined>(editingProduct?.image || initialData?.image);

  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSelectionRef = useRef(false);

  const t = (key: keyof typeof TRANSLATIONS) => language === 'en' ? TRANSLATIONS[key].en : TRANSLATIONS[key].bn;
  const tSub = (key: keyof typeof TRANSLATIONS) => language === 'en' ? TRANSLATIONS[key].bn : TRANSLATIONS[key].en;

  // Initialize Batches if editing legacy product
  useEffect(() => {
    if (editingProduct && (!editingProduct.batches || editingProduct.batches.length === 0) && editingProduct.quantity > 0) {
      setBatches([{
        id: generateId(),
        quantity: editingProduct.quantity,
        expiryDate: editingProduct.expiryDate,
        addedAt: editingProduct.addedAt
      }]);
    }
  }, [editingProduct]);

  // Load inventory for search context
  useEffect(() => {
    setInventory(StorageService.getInventory());
  }, []);

  // Safe Math Eval
  const evaluateMath = (val: string): string => {
    try {
      // Allow only numbers and basic operators
      if (/^[0-9+\-*/. ]+$/.test(val)) {
        const result = new Function('return ' + val)();
        return isFinite(result) ? Math.round(result * 100) / 100 + "" : val;
      }
    } catch { return val; }
    return val;
  };

  const handlePriceBlur = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    const result = evaluateMath(value);
    setter(result);
  };

  // Fuzzy Match Helper
  const fuzzyMatch = (query: string, target?: string) => {
    if (!target) return false;
    const qParts = query.toLowerCase().trim().split(/\s+/);
    const t = target.toLowerCase();
    return qParts.every(part => t.includes(part));
  };

  useEffect(() => {
    if (isSelectionRef.current) {
      isSelectionRef.current = false;
      return;
    }

    if (name.length > 1 && !editingProduct) {
      // 1. Search Inventory (High Priority)
      const inventoryMatches = inventory
        .filter(p => fuzzyMatch(name, p.name) || fuzzyMatch(name, p.nameBn))
        .map(p => ({ ...p, source: 'INVENTORY' as const }));

      // 2. Search Catalog/Mock DB (Low Priority)
      const catalogMatches = MOCK_DB
        .filter(p =>
          (fuzzyMatch(name, p.name) || fuzzyMatch(name, p.nameBn)) &&
          !inventoryMatches.some(inv => inv.name === p.name) // Avoid duplicates
        )
        .map(p => ({ ...p, source: 'CATALOG' as const }));

      setSuggestions([...inventoryMatches, ...catalogMatches]);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [name, editingProduct, inventory]);

  useEffect(() => {
    if (initialData?.image) {
      setProductImage(initialData.image);
    }
  }, [initialData]);

  const selectSuggestion = (item: ProductSuggestion) => {
    isSelectionRef.current = true;
    setName(item.name || '');
    setNameBn(item.nameBn || '');
    if (item.mrp) setMrp(item.mrp.toString());
    if (item.costPrice) setCostPrice(item.costPrice.toString());
    if (item.category) setCategory(item.category);
    if (item.unit) setUnit(item.unit);
    setShowSuggestions(false);
  };

  const addBatch = () => {
    const qty = parseFloat(currentBatchQty);
    if (!qty || qty <= 0) return;

    const newBatch: StockBatch = {
      id: generateId(),
      quantity: qty,
      expiryDate: currentBatchExpiry || undefined,
      addedAt: new Date().toISOString()
    };

    setBatches([...batches, newBatch]);
    setCurrentBatchQty('');
    setCurrentBatchExpiry('');
  };

  const removeBatch = (id: string) => {
    setBatches(batches.filter(b => b.id !== id));
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name) {
      alert(language === 'en' ? "Please enter a product name." : "দয়া করে পণ্যের নাম লিখুন।");
      return;
    }

    // Validation
    const pMrp = parseFloat(mrp) || 0;
    const pCost = parseFloat(costPrice) || 0;

    // Total Qty Calculation
    const totalQty = batches.reduce((sum, b) => sum + b.quantity, 0);
    // If no batches but legacy qty exists? Enforce at least one batch if qty > 0?
    // If user didn't add any batch, treat totalQty as 0. 

    // However, if it's 'packet', we should probably force adding a batch if they want stock?
    // Let's assume if batches is empty, quantity is 0.

    if (pMrp < 0 || pCost < 0 || totalQty < 0) {
      alert(language === 'en' ? "Values cannot be negative." : "মান নেতিবাচক হতে পারে না।");
      return;
    }

    setIsSaving(true);
    try {
      // Find nearest expiry
      let nearestExpiry = undefined;
      const validExpiryBatches = batches.filter(b => b.expiryDate).sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());
      if (validExpiryBatches.length > 0) nearestExpiry = validExpiryBatches[0].expiryDate;

      const newProduct: Product = {
        id: editingProduct?.id || generateId(),
        name,
        nameBn: nameBn || name,
        mrp: pMrp,
        costPrice: pCost,
        expiryDate: nearestExpiry,
        quantity: totalQty,
        batches: batches,
        unit,
        category,
        fillLevel: category === 'loose' ? fillLevel : undefined,
        addedAt: editingProduct?.addedAt || new Date().toISOString(),
        image: productImage
      };
      await onSave(newProduct);
    } catch (error) {
      console.error("Save failed", error);
      alert(language === 'en' ? `Failed to save item: ${(error as Error).message}` : `আইটেম সংরক্ষণ করতে ব্যর্থ হয়েছে: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Image Compression Utility
  const compressImage = (base64Str: string, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(base64Str); // Fallback
        }
      };
      img.onerror = () => resolve(base64Str); // Fallback
    });
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];

    if (file) {
      // Validation: File Type
      if (!file.type.startsWith('image/')) {
        setImageError(language === 'en' ? 'Invalid format. Use JPG/PNG.' : 'অবৈধ ফরম্যাট। JPG/PNG ব্যবহার করুন।');
        return;
      }

      // Validation: File Size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setImageError(language === 'en' ? 'Image too large (Max 5MB).' : 'ছবির আকার খুব বড় (সর্বোচ্চ ৫ এমবি)।');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === 'string') {
          try {
            const compressed = await compressImage(reader.result);
            setProductImage(compressed);
            setShowImagePicker(false);
          } catch {
            setProductImage(reader.result); // Fallback
            setShowImagePicker(false);
          }
        } else {
          setImageError(language === 'en' ? 'Processing failed.' : 'প্রক্রিয়া ব্যর্থ হয়েছে।');
        }
      };
      reader.onerror = () => {
        setImageError(language === 'en' ? 'Read error.' : 'পড়তে ত্রুটি।');
      };
      reader.readAsDataURL(file);
    }
  };



  const units: ProductUnit[] = ['pcs', 'kg', 'g', 'l', 'ml'];

  // Semantic styles for inputs
  const inputStyle = "w-full bg-surface text-[var(--text-primary)] p-4 rounded-xl border border-border focus:border-[#FF9800] outline-none placeholder-gray-400 dark:placeholder-gray-600";

  return (
    <div className="flex flex-col min-h-screen bg-background text-[var(--text-primary)] animate-in fade-in">
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3 border-b border-border bg-background sticky top-0 z-20">
        <button onClick={onCancel} className="p-2 -ml-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold leading-none">{t('addItem')}</h1>
          <p className="text-xs text-[var(--text-secondary)] font-bn mt-0.5">{tSub('addItem')}</p>
        </div>
      </div>

      <div className="p-4 md:p-8 space-y-6 flex-1 pb-32 md:pb-8">

        {/* Top Row: Image & Name */}
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {/* Image Uploader - Compact */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <div
              onClick={() => setShowImagePicker(true)}
              className={`w-24 h-24 lg:w-32 lg:h-32 rounded-2xl border border-dashed flex flex-col items-center justify-center bg-surface active:brightness-95 transition-colors cursor-pointer relative overflow-hidden ${imageError ? 'border-red-500' : 'border-border'}`}
            >
              {productImage ? (
                <img src={productImage} alt="Product" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Camera size={20} className={imageError ? 'text-red-500' : 'text-[#FF9800]'} />
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold text-center leading-tight">
                    {t('tapToUpload')}
                  </span>
                </div>
              )}
            </div>
            {imageError && <span className="text-[10px] text-red-500 max-w-[96px] text-center leading-tight">{imageError}</span>}
            {productImage && (
              <button
                onClick={(e) => { e.stopPropagation(); setProductImage(undefined); }}
                className="text-[10px] text-red-400 flex items-center gap-1 bg-red-100 dark:bg-[#2A1010] px-2 py-1 rounded-full border border-red-200 dark:border-red-900/30"
              >
                <Trash2 size={10} /> Clear
              </button>
            )}
          </div>

          {/* Product Name Input */}
          <div className="flex-1 relative z-10">
            <label className="text-sm text-[var(--text-secondary)] flex items-baseline gap-2 mb-2">
              {t('productName')} <span className="text-gray-400 text-xs font-bn">{tSub('productName')}</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => name.length > 1 && setShowSuggestions(true)}
                className={`${inputStyle} h-[60px] font-bold`}
                placeholder={t('productNamePlaceholder')}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute w-full bg-surface mt-2 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-border overflow-hidden max-h-64 overflow-y-auto z-50 animate-in zoom-in-95">
                  {suggestions.map((s, idx) => (
                    <div
                      key={idx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectSuggestion(s);
                      }}
                      className="p-3 border-b border-border last:border-0 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] flex items-start gap-3 cursor-pointer group transition-colors"
                    >
                      <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${s.source === 'INVENTORY' ? 'bg-[#FF9800]/10 border-[#FF9800]/30 text-[#FF9800]' : 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400'}`}>
                        {s.source === 'INVENTORY' ? <Store size={14} /> : <Database size={14} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-sm text-[var(--text-primary)] truncate">{s.name}</span>
                          {s.source === 'INVENTORY' && (
                            <span className="text-[10px] bg-[#4CAF50]/20 text-[#4CAF50] px-1.5 py-0.5 rounded font-bold whitespace-nowrap border border-[#4CAF50]/20">
                              Stock: {s.quantity}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-0.5">
                          <span className="font-bn text-[var(--text-secondary)] text-xs truncate">{s.nameBn}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Bengali Name Input */}
        <div>
          <label className="text-sm text-[var(--text-secondary)] flex items-baseline gap-2 mb-2">
            <span className="font-bn">বাংলা নাম</span> <span className="text-gray-400 text-xs">Bengali Name (optional)</span>
          </label>
          <input
            type="text"
            value={nameBn}
            onChange={(e) => setNameBn(e.target.value)}
            className={inputStyle}
            placeholder="যেমন: বাসমতি চাল"
          />
        </div>

        {/* Category Selector */}
        <div>
          <label className="text-sm text-[var(--text-secondary)] flex items-baseline gap-2 mb-2">
            {t('category')} <span className="text-gray-400 text-xs font-bn">{tSub('category')}</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setCategory('packet')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all active:scale-95 ${category === 'packet' ? 'bg-[#FF9800] border-[#FF9800] text-black shadow-lg shadow-orange-500/20' : 'bg-surface border-border text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-[#252a33]'}`}
            >
              <Package size={18} />
              <div className="flex flex-col items-start leading-none">
                <span className="font-bold text-sm">{t('packet')}</span>
                <span className="text-[10px] opacity-80 font-bn mt-0.5">{tSub('packet')}</span>
              </div>
            </button>
            <button
              onClick={() => setCategory('loose')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all active:scale-95 ${category === 'loose' ? 'bg-[#FF9800] border-[#FF9800] text-black shadow-lg shadow-orange-500/20' : 'bg-surface border-border text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-[#252a33]'}`}
            >
              <ShoppingBag size={18} />
              <div className="flex flex-col items-start leading-none">
                <span className="font-bold text-sm">{t('loose')}</span>
                <span className="text-[10px] opacity-80 font-bn mt-0.5">{tSub('loose')}</span>
              </div>
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          {/* MRP */}
          <div className="flex-1">
            <label className="text-sm text-[var(--text-secondary)] flex items-baseline gap-2 mb-2">
              MRP <span className="text-gray-400 text-xs font-bn">সর্বোচ্চ মূল্য</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-4 text-gray-500 font-bold">₹</span>
              <input
                type="text"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                onBlur={(e) => handlePriceBlur(setMrp, e.target.value)}
                placeholder="0.00"
                inputMode="decimal"
                className={`${inputStyle} pl-8 font-mono`}
              />
            </div>
          </div>

          {/* Cost Price */}
          <div className="flex-1">
            <label className="text-sm text-[var(--text-secondary)] flex items-baseline gap-2 mb-2">
              {t('costPrice')} <span className="text-gray-400 text-xs font-bn">{tSub('costPrice')}</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-4 text-gray-500 font-bold">₹</span>
              <input
                type="text"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                onBlur={(e) => handlePriceBlur(setCostPrice, e.target.value)}
                placeholder="0.00"
                inputMode="decimal"
                className={`${inputStyle} pl-8 font-mono`}
              />
            </div>
          </div>
        </div>

        {/* Batch Management Section */}
        <div className="bg-surface p-4 rounded-xl border border-border space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm text-[var(--text-secondary)] flex items-baseline gap-2">
              {t('currentStock')} <span className="text-gray-400 text-xs font-bn">{tSub('currentStock')}</span>
            </label>
            <span className="text-sm font-bold text-[var(--text-primary)]">
              Total: {batches.reduce((sum, b) => sum + b.quantity, 0)} {unit}
            </span>
          </div>

          {/* Batch List */}
          {batches.length > 0 && (
            <div className="space-y-2">
              {batches.map((batch) => (
                <div key={batch.id} className="flex items-center justify-between bg-background p-3 rounded-lg border border-border text-sm">
                  <div>
                    <div className="font-bold text-[var(--text-primary)]">{batch.quantity} {unit}</div>
                    {batch.expiryDate ? (
                      <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(batch.expiryDate).toLocaleDateString()}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 italic">No Expiry</div>
                    )}
                  </div>
                  <button
                    onClick={() => removeBatch(batch.id)}
                    className="text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Batch Form */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-[var(--text-secondary)] font-bold mb-2 uppercase tracking-wider">Add New Batch</p>
            <div className="flex flex-col gap-3">

              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={currentBatchQty}
                    onChange={(e) => setCurrentBatchQty(e.target.value)}
                    placeholder="Qty"
                    className={`${inputStyle} h-12`}
                  />
                </div>

                <div className="relative w-1/3">
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as ProductUnit)}
                    className="w-full h-12 bg-surface text-[#FF9800] font-bold px-3 rounded-xl border border-border focus:border-[#FF9800] outline-none appearance-none text-sm"
                  >
                    {units.map(u => <option key={u} value={u}>{u === 'pcs' ? 'Pcs' : u}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FF9800] pointer-events-none" size={14} />
                </div>
              </div>

              {category === 'packet' && (
                <div className="relative group">
                  <input
                    type="date"
                    value={currentBatchExpiry}
                    onChange={(e) => setCurrentBatchExpiry(e.target.value)}
                    className={`${inputStyle} pl-10 h-12 appearance-none text-sm`}
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                </div>
              )}

              <button
                onClick={addBatch}
                disabled={!currentBatchQty || parseFloat(currentBatchQty) <= 0}
                className="w-full py-3 bg-secondary text-secondary-foreground rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-border hover:bg-gray-100 dark:hover:bg-[#333]"
              >
                <Plus size={16} /> Add Batch
              </button>
            </div>
          </div>
        </div>
        {/* Footer Button (Desktop - inline) */}
        <div className="hidden lg:block pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full bg-gradient-to-r from-[#FF9800] to-[#F57C00] text-black h-14 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex flex-col items-center justify-center leading-none gap-1 ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isSaving ? (
              <span className="uppercase tracking-wide">{language === 'en' ? 'Saving...' : 'সংরক্ষণ করা হচ্ছে...'}</span>
            ) : (
              <>
                <span className="uppercase tracking-wide">{t('saveItem')}</span>
                <span className="text-[10px] font-bn opacity-80">{tSub('saveItem')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer Button (Mobile - sticky) */}
      <div className="lg:hidden p-4 bg-background border-t border-border sticky bottom-0 z-20">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full bg-gradient-to-r from-[#FF9800] to-[#F57C00] text-black h-14 rounded-full font-bold text-lg shadow-lg active:scale-[0.98] transition-transform flex flex-col items-center justify-center leading-none gap-1 ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
        >
          {isSaving ? (
            <span className="uppercase tracking-wide">{language === 'en' ? 'Saving...' : 'সংরক্ষণ করা হচ্ছে...'}</span>
          ) : (
            <>
              <span className="uppercase tracking-wide">{t('saveItem')}</span>
              <span className="text-[10px] font-bn opacity-80">{tSub('saveItem')}</span>
            </>
          )}
        </button>
      </div>

      {/* Image Picker Modal */}
      {showImagePicker && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowImagePicker(false)}
        >
          <div
            className="bg-surface w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 space-y-4 animate-in slide-in-from-bottom duration-300"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-center text-[var(--text-primary)] mb-2">{t('choosePhoto')}</h3>

            <button
              onClick={() => {
                setShowImagePicker(false);
                onRequestCamera();
              }}
              className="w-full bg-background border border-border p-4 rounded-2xl flex items-center gap-4 hover:brightness-95 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <Camera size={24} />
              </div>
              <div className="text-left">
                <span className="block font-bold text-[var(--text-primary)]">{t('camera')}</span>
                <span className="text-xs text-[var(--text-secondary)] font-bn">{tSub('camera')}</span>
              </div>
            </button>

            <label className="w-full bg-background border border-border p-4 rounded-2xl flex items-center gap-4 hover:brightness-95 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <ImageIcon size={24} />
              </div>
              <div className="text-left">
                <span className="block font-bold text-[var(--text-primary)]">{t('gallery')}</span>
                <span className="text-xs text-[var(--text-secondary)] font-bn">{tSub('gallery')}</span>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleGallerySelect}
              />
            </label>

            <button
              onClick={() => setShowImagePicker(false)}
              className="w-full py-4 text-center text-red-400 font-bold border-t border-border mt-2 active:bg-gray-100 dark:active:bg-[#333]/50 rounded-b-2xl"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};