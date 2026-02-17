import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import { AppSettings } from './types';
import { StorageService } from './services/storageService';
import { TRANSLATIONS } from './constants';
import { Scanner } from './components/Scanner';
import { ManualEntry } from './components/ManualEntry';
import { Dashboard } from './components/Dashboard';
import { InventoryList } from './components/InventoryList';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { LandingPage } from './components/LandingPage';
import { AuthSelection } from './components/AuthSelection';
import { RegisterShop } from './components/RegisterShop';
import { VerifyPhone } from './components/VerifyPhone';
import { Trade } from './components/Trade';
import { BottomNav } from './components/BottomNav';
import { ChevronRight, Settings as SettingsIcon, LogOut, HelpCircle } from 'lucide-react';
import { useAuth } from './src/hooks/useAuth';
import { useInventory } from './src/hooks/useInventory';
import { useCart } from './src/hooks/useCart';

// More page extracted into its own component for cleanliness
const MorePage: React.FC<{
  language: 'en' | 'bn';
  onLogout: () => void;
}> = ({ language, onLogout }) => {
  const navigate = useNavigate();
  const tMore = (key: keyof typeof TRANSLATIONS) =>
    language === 'en' ? TRANSLATIONS[key].en : TRANSLATIONS[key].bn;

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in">
      <div className="px-6 pt-12 pb-6 bg-background border-b border-border">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">{tMore('morePage')}</h1>
        <p className="text-[var(--text-secondary)] text-sm">{tMore('manageProfile')}</p>
      </div>

      <div className="p-4 space-y-6 flex-1 overflow-y-auto pb-32 max-w-lg mx-auto w-full">
        <div className="space-y-2">
          <p className="px-2 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">{tMore('general')}</p>
          <button
            onClick={() => navigate('/settings')}
            className="w-full bg-surface p-4 rounded-2xl border border-border flex items-center justify-between group active:scale-[0.98] transition-all hover:bg-gray-100 dark:hover:bg-[#161616]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                <SettingsIcon size={18} />
              </div>
              <span className="font-bold text-[var(--text-primary)] text-sm">{tMore('settings')}</span>
            </div>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-[#FF9800]" />
          </button>

          <button
            onClick={() => window.open('mailto:support@kiranaklick.app?subject=Help%20Request', '_blank')}
            className="w-full bg-surface p-4 rounded-2xl border border-border flex items-center justify-between group active:scale-[0.98] transition-all hover:bg-gray-100 dark:hover:bg-[#161616]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                <HelpCircle size={18} />
              </div>
              <span className="font-bold text-[var(--text-primary)] text-sm">{tMore('helpSupport')}</span>
            </div>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-[#FF9800]" />
          </button>
        </div>

        <div className="space-y-2 pt-2">
          <p className="px-2 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">{tMore('account')}</p>
          <button
            onClick={onLogout}
            className="w-full bg-red-50 dark:bg-[#2A1010] p-4 rounded-2xl border border-red-200 dark:border-red-900/30 flex items-center justify-between group active:scale-[0.98] transition-all hover:bg-red-100 dark:hover:bg-[#3A1515]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                <LogOut size={18} />
              </div>
              <span className="font-bold text-red-600 dark:text-red-400 text-sm">{tMore('logOut')}</span>
            </div>
          </button>
        </div>

        <p className="text-center text-[10px] text-[var(--text-secondary)] font-mono pt-4">v1.0.0 • KiranaKlick</p>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = StorageService.getSettings();
    return saved || {
      shopName: '',
      gstNumber: '',
      mobile: '',
      ownerName: '',
      lowStockThreshold: 5,
      nearExpiryDays: 30,
      language: 'en',
      theme: 'dark', // Default fallback
    };
  });

  // 1. Auth Hook (no longer takes setView)
  const auth = useAuth(appSettings, setAppSettings);

  // 2. Inventory Hook (no longer takes setView/setReturnView)
  const inventory = useInventory(appSettings);

  // 3. Cart Hook (no longer takes setView)
  const cart = useCart(inventory.products, inventory.handleSellProduct, appSettings);

  // Apply Theme
  useEffect(() => {
    const applyTheme = () => {
      const isDark = appSettings.theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : appSettings.theme === 'dark';

      if (isDark) {
        document.documentElement.classList.add('dark');
        document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', 'light');
      }
    };

    applyTheme();

    if (appSettings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [appSettings.theme]);

  // Online Connectivity & Sync
  useEffect(() => {
    const handleOnline = () => {
      const msg = appSettings.language === 'en' ? TRANSLATIONS.syncRestored.en : TRANSLATIONS.syncRestored.bn;

      StorageService.syncPendingData().then((result) => {
        if (result.syncedProducts > 0 || result.syncedSales > 0) {
          alert(`${msg}\nSynced ${result.syncedProducts} items & ${result.syncedSales} sales.`);
          inventory.refreshData();
        }
      });
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [appSettings.language, inventory]);

  // Auth-gating: if not authenticated, show auth routes
  if (auth.authState === 'LANDING') {
    return <LandingPage onSelectRole={auth.handleRoleSelect} />;
  }

  if (auth.authState === 'AUTH_FLOW') {
    return (
      <div className="w-full h-[100dvh] bg-[#050505] flex items-center justify-center relative transition-colors duration-300 p-0">
        <div className="w-full h-full bg-background relative flex flex-col overflow-hidden">
          <Routes>
            <Route path="/auth" element={
              <AuthSelection
                onLogin={() => auth.handleAuthSelection('LOGIN')}
                onSignUp={() => auth.handleAuthSelection('SIGNUP')}
                onBack={() => auth.setAuthState('LANDING')}
                language={appSettings.language}
              />
            } />
            <Route path="/auth/register" element={
              <RegisterShop
                onContinue={auth.handleRegisterContinue}
                onBack={() => navigate('/auth')}
                language={appSettings.language}
              />
            } />
            <Route path="/auth/verify" element={
              <VerifyPhone
                mobileNumber={auth.regData.mobile || 'XXXXXXXXXX'}
                onVerify={auth.handleLoginSuccess}
                onBack={() => navigate('/auth/register')}
                language={appSettings.language}
                mode="REGISTER"
              />
            } />
            <Route path="/auth/login" element={
              <Login onSendOtp={auth.handleSendOtp} />
            } />
            <Route path="/auth/login/otp" element={
              <VerifyPhone
                mobileNumber={auth.loginPhone}
                onVerify={auth.handleLoginSuccess}
                onBack={() => navigate('/auth/login')}
                language={appSettings.language}
                mode="LOGIN"
              />
            } />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </div>
      </div>
    );
  }

  // Main authenticated app with routing
  const isFullHeightView = location.pathname === '/trade';

  return (
    <div className="min-h-screen flex flex-col w-full bg-background text-[var(--text-primary)] transition-colors duration-300">
      <main className={`flex-1 relative w-full ${isFullHeightView ? 'h-[100dvh] overflow-hidden bg-background' : 'overflow-y-auto pb-[100px]'} no-scrollbar`}>
        <div className="w-full h-full max-w-md md:max-w-3xl lg:max-w-7xl mx-auto relative px-0 md:px-4 lg:px-8">
          <div className="w-full h-full animate-fade-in">
            <Routes>
              {/* Dashboard */}
              <Route path="/" element={
                <Dashboard
                  products={inventory.products}
                  sales={inventory.sales}
                  onFilterSelect={inventory.handleDashboardFilter}
                  onScanClick={() => navigate('/scanner')}
                  onAddStock={() => navigate('/add')}
                  lowStockThreshold={appSettings.lowStockThreshold}
                  language={appSettings.language}
                />
              } />

              {/* Inventory */}
              <Route path="/inventory" element={
                <InventoryList
                  products={inventory.products}
                  lowStockThreshold={appSettings.lowStockThreshold}
                  onDelete={inventory.handleDeleteProduct}
                  onEdit={inventory.handleEditItem}
                  onSell={inventory.handleSellProduct}
                  onAdd={() => navigate('/add')}
                  filter={inventory.inventoryFilter}
                  onFilterChange={inventory.setInventoryFilter}
                  onClearFilter={() => inventory.setInventoryFilter('ALL')}
                  language={appSettings.language}
                />
              } />

              {/* Trade */}
              <Route path="/trade" element={
                <Trade
                  products={inventory.products}
                  cart={cart.cart}
                  onUpdateCart={cart.setCart}
                  onScanClick={() => navigate('/scanner')}
                  onConfirmSale={cart.handleConfirmTradeSale}
                  onAddManual={() => navigate('/add')}
                  language={appSettings.language}
                />
              } />

              {/* Reports */}
              <Route path="/reports" element={
                <Reports
                  sales={inventory.sales}
                  products={inventory.products}
                  language={appSettings.language}
                />
              } />

              {/* More */}
              <Route path="/more" element={
                <MorePage
                  language={appSettings.language}
                  onLogout={auth.logout}
                />
              } />

              {/* Settings */}
              <Route path="/settings" element={
                <Settings
                  products={inventory.products}
                  sales={inventory.sales}
                  currentSettings={appSettings}
                  onUpdateSettings={setAppSettings}
                  onBack={() => navigate('/more')}
                />
              } />

              {/* Scanner (full-screen) */}
              <Route path="/scanner" element={
                <Scanner
                  onScanComplete={(data, mode) => {
                    if (cart.cart.length > 0) {
                      cart.handleScanToSell(data);
                    } else {
                      inventory.handleScanComplete(data, mode, cart.cart.length, cart.handleScanToSell);
                    }
                  }}
                  onClose={() => navigate(-1)}
                  language={appSettings.language}
                />
              } />

              {/* Manual Entry (full-screen) */}
              <Route path="/add" element={
                <ManualEntry
                  initialData={inventory.scannedData}
                  editingProduct={inventory.editingItem}
                  onSave={inventory.handleSaveProduct}
                  onCancel={() => {
                    inventory.setScannedData(undefined);
                    inventory.setEditingItem(undefined);
                    navigate(-1);
                  }}
                  onRequestCamera={() => navigate('/scanner')}
                  language={appSettings.language}
                />
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </main>

      {/* Floating Glass Navbar */}
      <BottomNav />
    </div>
  );
};