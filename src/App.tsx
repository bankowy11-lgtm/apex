import { useState, useEffect } from 'react';
import { ApiService, UserSettings } from './services/apiService';
import { AssetPosition, Portfolio, MarketAlert } from './types';
import { NEWS_ITEMS, DIVIDEND_CALENDAR, EARNINGS_CALENDAR } from './storage/defaultData';

// Subcomponents
import { SplashScreen } from './components/SplashScreen';
import { LockScreen } from './components/LockScreen';
import { Onboarding } from './components/Onboarding';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { AddAssetModal } from './components/AddAssetModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { AssetDetails } from './pages/AssetDetails';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AlertsPage } from './pages/AlertsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  // Screens loading states
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [onboarded, setOnboarded] = useState<boolean>(ApiService.isOnboarded());
  const [isLocked, setIsLocked] = useState<boolean>(() => ApiService.getPin() !== null);

  // Core Data models
  const [portfolios, setPortfolios] = useState<Portfolio[]>(() => ApiService.getPortfolios());
  const [positions, setPositions] = useState<AssetPosition[]>(() => ApiService.getPositions());
  const [alerts, setAlerts] = useState<MarketAlert[]>(() => ApiService.getAlerts());
  const [settings, setSettings] = useState<UserSettings>(() => ApiService.getSettings());

  // Navigation states
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetPosition | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingAsset, setEditingAsset] = useState<AssetPosition | null>(null);

  // Auxiliary runtime statuses
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>(() => {
    const ts = localStorage.getItem('apex_cache_time');
    if (ts) return new Date(Number(ts)).toLocaleTimeString('pl-PL');
    return new Date().toLocaleTimeString('pl-PL');
  });
  const [pwaInstalled, setPwaInstalled] = useState<boolean>(false);

  // Periodic automatic mock refresh simulation
  useEffect(() => {
    if (settings.autoRefresh) {
      const interval = setInterval(() => {
        handleRefreshApi();
      }, 45000); // sync mock data every 45s
      return () => clearInterval(interval);
    }
  }, [settings.autoRefresh]);

  // App handlers
  const handleOnboardingComplete = (setupPin: string | null, currency: 'PLN' | 'USD' | 'EUR') => {
    ApiService.setOnboarded();
    setOnboarded(true);

    const nextSet = { ...settings, currency };
    ApiService.saveSettings(nextSet);
    setSettings(nextSet);

    if (setupPin) {
      ApiService.setPin(setupPin);
      setIsLocked(false); // unlocked directly after setup
    }
  };

  const handleRefreshApi = async () => {
    setIsRefreshing(true);
    await ApiService.refreshLivePrices();
    // Reload memory references
    setPositions(ApiService.getPositions());
    setLastRefreshTime(new Date().toLocaleTimeString('pl-PL'));
    setIsRefreshing(false);
  };

  const handleCreateSubPortfolio = () => {
    const name = window.prompt('Wpisz nazwę nowego subportfela (np. Dzieci, Waluty, Surowce):');
    if (!name?.trim()) return;

    // Pick random beautiful color
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const newPort: Portfolio = {
      id: `p-${Date.now()}`,
      name: name.trim(),
      icon: 'Folder',
      color
    };

    const nextPorts = [...portfolios, newPort];
    ApiService.savePortfolios(nextPorts);
    setPortfolios(nextPorts);
    setSelectedPortfolioId(newPort.id);
  };

  const handleSavePosition = (posData: Partial<AssetPosition>) => {
    let nextPositions: AssetPosition[];
    const isEditing = positions.some(p => p.id === posData.id);

    if (isEditing) {
      nextPositions = positions.map(p => p.id === posData.id ? { ...p, ...posData } as AssetPosition : p);
    } else {
      nextPositions = [posData as AssetPosition, ...positions];
    }

    ApiService.savePositions(nextPositions);
    setPositions(nextPositions);

    // If viewing this specific asset, update local detailed copy
    if (selectedAsset && selectedAsset.id === posData.id) {
      setSelectedAsset(nextPositions.find(p => p.id === posData.id) || null);
    }
  };

  const handleDeletePosition = (id: string) => {
    const nextPositions = positions.filter(p => p.id !== id);
    ApiService.savePositions(nextPositions);
    setPositions(nextPositions);
    setSelectedAsset(null); // return to lists
  };

  const handleSimulateInstall = () => {
    setPwaInstalled(true);
    alert('Aplikacja PWA została "zainstalowana" na ekranie głównym urządzenia. Ikonka jest od teraz dostępna ze statusem działania offline.');
  };

  const handleDataImportReload = () => {
    setPortfolios(ApiService.getPortfolios());
    setPositions(ApiService.getPositions());
    setAlerts(ApiService.getAlerts());
    setSettings(ApiService.getSettings());
    setSelectedAsset(null);
  };

  // Evaluate unread triggered alerts count
  const unreadAlertsCount = alerts.filter(a => a.triggered).length;

  // Filter positions by selected portfolio destination
  const filteredPositions = selectedPortfolioId === null
    ? positions
    : positions.filter(p => p.portfolioId === selectedPortfolioId);

  // Total absolute calculation for details slice estimation
  const overallPortfolioValue = positions.reduce((acc, p) => {
    return acc + ApiService.convertTo(p.shares * p.currentPrice, p.currency, settings.currency);
  }, 0);

  // Priority UI overlays
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (isLocked) {
    const correctPin = ApiService.getPin() || '';
    return (
      <LockScreen
        correctPin={correctPin}
        onUnlocked={() => setIsLocked(false)}
        onResetRequested={() => {
          if (window.confirm('Wyczyścić urządzenie z kluczy sesyjnych i załadować demo od nowa?')) {
            localStorage.clear();
            window.location.reload();
          }
        }}
      />
    );
  }

  // Active view dispatch logic
  const renderContent = () => {
    // If selected asset is present, show Asset details overlay directly
    if (selectedAsset) {
      return (
        <AssetDetails
          position={selectedAsset}
          baseCurrency={settings.currency}
          totalPortfolioValue={overallPortfolioValue}
          onBack={() => setSelectedAsset(null)}
          onEdit={(pos) => {
            setEditingAsset(pos);
            setIsAddModalOpen(true);
          }}
          onDelete={handleDeletePosition}
        />
      );
    }

    switch (currentTab) {
      case 'dashboard':
      case 'assets': // fallback listing logic integrated nicely inside Dashboard
        return (
          <Dashboard
            positions={filteredPositions}
            baseCurrency={settings.currency}
            onAddAssetClick={() => {
              setEditingAsset(null);
              setIsAddModalOpen(true);
            }}
            onSelectAsset={(pos) => setSelectedAsset(pos)}
            newsItems={NEWS_ITEMS}
            dividendEvents={DIVIDEND_CALENDAR}
            earningEvents={EARNINGS_CALENDAR}
          />
        );
      case 'analytics':
        return (
          <AnalyticsPage
            positions={filteredPositions}
            baseCurrency={settings.currency}
          />
        );
      case 'alerts':
        return (
          <AlertsPage
            alerts={alerts}
            onUpdateAlerts={(newAl) => setAlerts(newAl)}
            baseCurrency={settings.currency}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            settings={settings}
            onUpdateSettings={(newSet) => setSettings(newSet)}
            onDataImported={handleDataImportReload}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-[#0B0F19] text-slate-100 font-sans transition-colors ${settings.darkMode ? 'dark' : ''}`}>
      {/* Universal PWA Header Toolbar */}
      <Navbar
        baseCurrency={settings.currency}
        darkMode={settings.darkMode}
        onToggleTheme={() => {
          const next = { ...settings, darkMode: !settings.darkMode };
          ApiService.saveSettings(next);
          setSettings(next);
        }}
        onRefreshApi={handleRefreshApi}
        isRefreshing={isRefreshing}
        unreadAlertsCount={unreadAlertsCount}
        onOpenAlerts={() => {
          setSelectedAsset(null);
          setCurrentTab('alerts');
        }}
        onSimulateInstall={handleSimulateInstall}
        isInstalled={pwaInstalled}
        lastRefreshTime={lastRefreshTime}
      />

      {/* Main Core Container Grid */}
      <div className="flex max-w-[1700px] mx-auto">
        {/* Desktop Sidebar Navigator */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setSelectedAsset(null); // return to main level
            setCurrentTab(tab);
          }}
          portfolios={portfolios}
          activePortfolioId={selectedPortfolioId}
          onSelectPortfolio={(id) => {
            setSelectedAsset(null);
            setSelectedPortfolioId(id);
          }}
          onAddPortfolioClick={handleCreateSubPortfolio}
          unreadAlertsCount={unreadAlertsCount}
        />

        {/* Scrollable Center Content area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Active Subportfolio Header badge indicator */}
          {selectedPortfolioId !== null && !selectedAsset && (
            <div className="mb-4 flex items-center justify-between bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold uppercase">Podgląd subportfela:</span>
                <span className="text-white font-extrabold">
                  {portfolios.find(p => p.id === selectedPortfolioId)?.name || 'Nieznany'}
                </span>
              </div>
              <button
                onClick={() => setSelectedPortfolioId(null)}
                className="text-[10px] text-emerald-400 font-bold hover:underline"
              >
                Pokaż wszystkie aktywa (Reset)
              </button>
            </div>
          )}

          {renderContent()}
        </main>
      </div>

      {/* Smartphone Bottom Navigator */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedAsset(null);
          setCurrentTab(tab);
        }}
        unreadAlertsCount={unreadAlertsCount}
      />

      {/* Global Add / Edit Position Form Modal */}
      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAsset(null);
        }}
        onSave={handleSavePosition}
        portfolios={portfolios}
        initialPortfolioId={selectedPortfolioId}
        editPosition={editingAsset}
      />
    </div>
  );
}
