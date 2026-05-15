import React from 'react';
import { TabType } from './BottomNav';
import { Portfolio } from '../types';
import { 
  LayoutDashboard, 
  Briefcase, 
  BrainCircuit, 
  BellRing, 
  Settings,
  PlusCircle,
  FolderOpen
} from 'lucide-react';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  portfolios: Portfolio[];
  activePortfolioId: string | null;
  onSelectPortfolio: (id: string | null) => void;
  onAddPortfolioClick: () => void;
  unreadAlertsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  portfolios,
  activePortfolioId,
  onSelectPortfolio,
  onAddPortfolioClick,
  unreadAlertsCount = 0
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Podsumowanie', icon: LayoutDashboard },
    { id: 'assets', label: 'Zarządzanie Pozycjami', icon: Briefcase },
    { id: 'analytics', label: 'Analiza & AI Insights', icon: BrainCircuit },
    { id: 'alerts', label: 'Centrum Alertów', icon: BellRing, badge: unreadAlertsCount },
    { id: 'settings', label: 'Ustawienia & Backup', icon: Settings },
  ];

  return (
    <aside className="hidden sm:flex flex-col w-64 bg-[#0B0F19]/90 border-r border-slate-800/80 p-4 h-[calc(100vh-61px)] sticky top-[61px] select-none justify-between overflow-y-auto">
      {/* Upper Navigation Sections */}
      <div className="space-y-6">
        {/* Main views link */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2">
            Nawigacja Główna
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id as TabType)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-slate-800 to-slate-800/40 text-white shadow-sm border-l-2 border-emerald-400' 
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  {!!item.badge && item.badge > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Multi-portfolio breakdown listing */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Twoje Portfele
            </span>
            <button
              onClick={onAddPortfolioClick}
              title="Stwórz nowy subportfel"
              className="text-slate-500 hover:text-emerald-400 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {/* "All" button */}
            <button
              onClick={() => onSelectPortfolio(null)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activePortfolioId === null
                  ? 'bg-slate-900 text-emerald-400 font-bold border border-slate-800'
                  : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-300'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span className="truncate">Wszystkie aktywa (Razem)</span>
            </button>

            {portfolios.map((p) => {
              const isActive = activePortfolioId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPortfolio(p.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white font-bold border border-slate-800'
                      : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-300'
                  }`}
                >
                  <span 
                    className="w-2 h-2 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="truncate text-left flex-1">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Embedded footer widget / promotion */}
      <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-center">
        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black uppercase tracking-wider block w-max mx-auto mb-2">
          Fintech Pro
        </span>
        <p className="text-[11px] text-slate-400 leading-tight">
          Szyfrowany transfer online do chmury aktywny.
        </p>
      </div>
    </aside>
  );
};
