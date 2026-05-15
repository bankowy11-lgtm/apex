import React from 'react';

interface HeatmapItem {
  ticker: string;
  name: string;
  changePercent: number;
  value: number;
}

interface HeatmapProps {
  items: HeatmapItem[];
}

export const Heatmap: React.FC<HeatmapProps> = ({ items = [] }) => {
  // Sort items by absolute value or just present directly
  const sortedItems = [...items].sort((a, b) => b.value - a.value);

  const getBgColor = (change: number) => {
    if (change >= 5) return 'bg-emerald-600 text-white border-emerald-500';
    if (change >= 2) return 'bg-emerald-700/90 text-emerald-100 border-emerald-600/80';
    if (change > 0) return 'bg-emerald-900/60 text-emerald-200 border-emerald-800/50';
    if (change <= -5) return 'bg-rose-700 text-white border-rose-600';
    if (change <= -2) return 'bg-rose-800/90 text-rose-100 border-rose-700/80';
    if (change < 0) return 'bg-rose-950/60 text-rose-200 border-rose-900/50';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="bg-[#131B2C]/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-xl">
      <h3 className="text-sm font-bold text-slate-300 tracking-wide uppercase mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          Heatmapa Wyników (24h)
        </span>
        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Finviz Style</span>
      </h3>

      {sortedItems.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-slate-500 text-xs italic">
          Brak danych do wygenerowania mapy
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {sortedItems.map((item, idx) => {
            const isPositive = item.changePercent >= 0;
            const colorClass = getBgColor(item.changePercent);

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all duration-300 hover:scale-[1.03] hover:shadow-lg cursor-pointer flex flex-col justify-between h-24 relative overflow-hidden group ${colorClass}`}
              >
                {/* Overlay shine effect */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex items-start justify-between">
                  <span className="font-extrabold text-sm tracking-tight drop-shadow-sm">
                    {item.ticker}
                  </span>
                  <span className="text-[10px] opacity-75 truncate max-w-[60px]" title={item.name}>
                    {item.name.split(' ')[0]}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-black tracking-wider flex items-center gap-0.5">
                    {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </div>
                  <div className="text-[9px] opacity-60 mt-0.5">
                    Poz: {(item.value).toLocaleString('pl-PL', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
