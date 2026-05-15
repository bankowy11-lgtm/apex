import React from 'react';
import { Bell, Download, RefreshCw, Sun, Moon, Check } from 'lucide-react';

interface NavbarProps {
  baseCurrency: string;
  darkMode: boolean;
  onToggleTheme: () => void;
  onRefreshApi: () => void;
  isRefreshing: boolean;
  unreadAlertsCount: number;
  onOpenAlerts: () => void;
  onSimulateInstall: () => void;
  isInstalled: boolean;
  lastRefreshTime?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  baseCurrency,
  darkMode,
  onToggleTheme,
  onRefreshApi,
  isRefreshing,
  unreadAlertsCount,
  onOpenAlerts,
  onSimulateInstall,
  isInstalled,
  lastRefreshTime
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3 flex items-center justify-between transition-colors">
      {/* Brand logo & status preview */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-black text-slate-950 tracking-tighter shadow-md">
          A<span className="text-white text-xs align-super">•</span>
        </div>
        
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm text-white tracking-tight">Apex Wealth</span>
            <span className="text-[9px] bg-slate-800 text-emerald-400 font-bold px-1.5 py-0.2 rounded border border-slate-700">
              PWA
            </span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API Online • {baseCurrency}</span>
          </div>
        </div>
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-2">
        {/* Manual Refresh API trigger */}
        <button
          onClick={onRefreshApi}
          disabled={isRefreshing}
          title={lastRefreshTime ? `Ostatnia aktualizacja: ${lastRefreshTime}` : 'Odśwież dane API'}
          className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all disabled:opacity-50 relative group"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
        </button>

        {/* Alerts Center Access */}
        <button
          onClick={onOpenAlerts}
          title="Powiadomienia i Alerty rynkowe"
          className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all relative"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center animate-bounce">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* Light/Dark Mode toggle */}
        <button
          onClick={onToggleTheme}
          title="Zmień motyw"
          className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-all hidden sm:flex"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* PWA simulated installation button */}
        <button
          onClick={onSimulateInstall}
          disabled={isInstalled}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            isInstalled 
              ? 'bg-slate-900 text-slate-500 border border-slate-800/40 cursor-default'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
          }`}
        >
          {isInstalled ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Zainstalowana</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-slate-950" />
              <span>Zainstaluj PWA</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
