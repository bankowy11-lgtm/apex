import React from 'react';
import { LayoutDashboard, Briefcase, BrainCircuit, BellRing, Settings } from 'lucide-react';

export type TabType = 'dashboard' | 'assets' | 'analytics' | 'alerts' | 'settings';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  unreadAlertsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  unreadAlertsCount = 0
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Pulpit', icon: LayoutDashboard },
    { id: 'assets', label: 'Zarządzanie', icon: Briefcase },
    { id: 'analytics', label: 'AI & Wykresy', icon: BrainCircuit },
    { id: 'alerts', label: 'Alerty', icon: BellRing, badge: unreadAlertsCount },
    { id: 'settings', label: 'Opcje', icon: Settings },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F19]/95 border-t border-slate-800/80 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id as TabType)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
              isActive 
                ? 'text-emerald-400 font-bold scale-105' 
                : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {!!tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 font-black text-[8px] flex items-center justify-center animate-pulse">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[9px] mt-0.5 tracking-tight">
              {tab.label}
            </span>
            
            {/* Active glowing indicator indicator dot */}
            {isActive && (
              <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-emerald-400" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
