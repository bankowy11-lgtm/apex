import React from 'react';
import { AssetPosition, NewsItem, DividendEvent, EarningEvent } from '../types';
import { ApiService } from '../services/apiService';
import { AssetChart } from '../components/AssetChart';
import { AllocationChart } from '../components/AllocationChart';
import { Heatmap } from '../components/Heatmap';
import { FearAndGreed } from '../components/FearAndGreed';
import { NewsFeed } from '../components/NewsFeed';
import { 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  Layers, 
  Calendar, 
  Award, 
  AlertTriangle 
} from 'lucide-react';

interface DashboardProps {
  positions: AssetPosition[];
  baseCurrency: string;
  onAddAssetClick: () => void;
  onSelectAsset: (pos: AssetPosition) => void;
  newsItems: NewsItem[];
  dividendEvents: DividendEvent[];
  earningEvents: EarningEvent[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  positions,
  baseCurrency,
  onAddAssetClick,
  onSelectAsset,
  newsItems,
  dividendEvents,
  earningEvents
}) => {
  // Financial computations converted to Base Currency
  let totalCurrentValue = 0;
  let totalInvestedValue = 0;
  
  // Find highest / lowest performance stats
  let bestAsset: any = null;
  let worstAsset: any = null;

  // Track allocation totals by category
  const categoryAllocations: Record<string, number> = {};
  
  // Ticker performance mapping for Heatmap
  const heatmapData = positions.map(pos => {
    const costInBase = ApiService.convertTo(pos.shares * pos.buyPrice, pos.currency, baseCurrency);
    const valueInBase = ApiService.convertTo(pos.shares * pos.currentPrice, pos.currency, baseCurrency);
    
    totalInvestedValue += costInBase;
    totalCurrentValue += valueInBase;

    const gainPct = costInBase > 0 ? ((valueInBase - costInBase) / costInBase) * 100 : 0;

    // Track allocation
    categoryAllocations[pos.category] = (categoryAllocations[pos.category] || 0) + valueInBase;

    // Evaluate best / worst
    if (!bestAsset || gainPct > bestAsset.pct) {
      bestAsset = { name: pos.name, ticker: pos.ticker, pct: gainPct };
    }
    if (!worstAsset || gainPct < worstAsset.pct) {
      worstAsset = { name: pos.name, ticker: pos.ticker, pct: gainPct };
    }

    // Daily simulated change based on last history vs current
    const start24h = pos.history24h[0] || pos.currentPrice;
    const change24hPct = start24h > 0 ? ((pos.currentPrice - start24h) / start24h) * 100 : 0;

    return {
      ticker: pos.ticker,
      name: pos.name,
      changePercent: change24hPct,
      value: valueInBase
    };
  });

  const absoluteProfit = totalCurrentValue - totalInvestedValue;
  const totalRoiPercent = totalInvestedValue > 0 ? (absoluteProfit / totalInvestedValue) * 100 : 0;
  
  // Simulated daily values for premium metrics requirement
  const dailyPercentChange = heatmapData.length > 0 
    ? heatmapData.reduce((acc, h) => acc + h.changePercent, 0) / heatmapData.length 
    : 1.25;
  const dailyAbsoluteChange = (totalCurrentValue * dailyPercentChange) / 100;

  // Process mapping for Donut Allocation Chart
  const categoryLabels: Record<string, { label: string; color: string }> = {
    stocks_us: { label: 'Akcje USA', color: '#3B82F6' },
    stocks_pl: { label: 'Akcje GPW', color: '#EF4444' },
    etf: { label: 'Fundusze ETF', color: '#10B981' },
    crypto: { label: 'Kryptowaluty', color: '#F59E0B' },
    gold: { label: 'Złoto', color: '#EAB308' },
    silver: { label: 'Srebro', color: '#94A3B8' },
    forex: { label: 'Waluty', color: '#06B6D4' },
    bonds: { label: 'Obligacje', color: '#8B5CF6' }
  };

  const allocationItems = Object.keys(categoryAllocations).map(cat => ({
    label: categoryLabels[cat]?.label || cat,
    value: categoryAllocations[cat],
    color: categoryLabels[cat]?.color || '#cbd5e1'
  })).sort((a, b) => b.value - a.value);

  // Generate continuous value chart data based on overall values
  const simulatedPortfolioBasePoints = [
    totalInvestedValue * 0.96 || 10000,
    totalInvestedValue * 0.99 || 10200,
    totalInvestedValue * 1.02 || 10500,
    totalInvestedValue * 1.01 || 10400,
    totalCurrentValue * 0.98 || 11000,
    totalCurrentValue || 12000
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in select-none">
      {/* Ticker Scroll Banner */}
      <div className="w-full overflow-hidden whitespace-nowrap bg-slate-900/40 py-2 border-y border-slate-800/60 -mx-4 px-4 sm:mx-0 sm:rounded-xl flex items-center gap-6 text-[11px] font-bold">
        <span className="text-amber-500 uppercase tracking-widest text-[9px] border border-amber-500/20 px-1.5 py-0.5 rounded bg-amber-500/10">
          Top Gainers 24h
        </span>
        <div className="inline-flex gap-6 animate-marquee">
          <span>🇺🇸 NVDA <strong className="text-emerald-400">+4.85%</strong></span>
          <span>🇵🇱 CDR.WA <strong className="text-emerald-400">+5.40%</strong></span>
          <span>🪙 BTC <strong className="text-emerald-400">+3.80%</strong></span>
          <span>🪙 SOL <strong className="text-emerald-400">+8.10%</strong></span>
          <span>🇺🇸 AAPL <strong className="text-slate-400">+1.12%</strong></span>
          <span>🪙 XAU <strong className="text-emerald-400">+0.90%</strong></span>
        </div>
      </div>

      {/* Main KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total portfolio worth */}
        <div className="bg-gradient-to-br from-slate-900 via-[#131B2C] to-slate-900 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden group shadow-md">
          <div className="absolute top-0 right-0 p-3 text-slate-700 group-hover:scale-110 transition-transform">
            <Layers className="w-8 h-8 opacity-20" />
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Wartość Portfela
          </span>
          <span className="text-xl sm:text-2xl font-black text-white mt-1 block tracking-tight">
            {totalCurrentValue.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} {baseCurrency}
          </span>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
            Zainwestowano: {totalInvestedValue.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} {baseCurrency}
          </div>
        </div>

        {/* Daily Profit/Loss % & Value */}
        <div className="bg-gradient-to-br from-slate-900 via-[#131B2C] to-slate-900 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden shadow-md">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Wynik Dzienny (24h)
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-lg sm:text-xl font-black ${dailyPercentChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {dailyPercentChange >= 0 ? '+' : ''}{dailyPercentChange.toFixed(2)}%
            </span>
            <span className="text-xs text-slate-500">
              ({dailyAbsoluteChange >= 0 ? '+' : ''}{dailyAbsoluteChange.toFixed(0)} {baseCurrency})
            </span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
            {dailyPercentChange >= 0 ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-rose-400" />}
            <span>W oparciu o wyceny API</span>
          </div>
        </div>

        {/* Historical ROI Profit */}
        <div className="bg-gradient-to-br from-slate-900 via-[#131B2C] to-slate-900 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden shadow-md">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Historyczny Zysk / Strata
          </span>
          <span className={`text-xl sm:text-2xl font-black mt-1 block tracking-tight ${absoluteProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {absoluteProfit >= 0 ? '+' : ''}{absoluteProfit.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} {baseCurrency}
          </span>
          <div className="mt-2 text-[10px] font-extrabold flex items-center gap-1">
            <span className={`px-1.5 py-0.2 rounded ${totalRoiPercent >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              ROI: {totalRoiPercent >= 0 ? '+' : ''}{totalRoiPercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Best / Worst overview tracker */}
        <div className="bg-gradient-to-br from-slate-900 via-[#131B2C] to-slate-900 border border-slate-800/80 p-3 rounded-2xl flex flex-col justify-between shadow-md text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-400" /> Najlepsze
            </span>
            <span className="font-extrabold text-emerald-400 truncate max-w-[80px]">
              {bestAsset ? `${bestAsset.ticker} (+${bestAsset.pct.toFixed(0)}%)` : 'Brak'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" /> Najgorsze
            </span>
            <span className="font-extrabold text-rose-400 truncate max-w-[80px]">
              {worstAsset ? `${worstAsset.ticker} (${worstAsset.pct.toFixed(0)}%)` : 'Brak'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Animated Chart Component */}
      <div>
        <AssetChart 
          dataPoints={simulatedPortfolioBasePoints} 
          color={totalRoiPercent >= 0 ? '#10B981' : '#EF4444'} 
          baseCurrency={baseCurrency}
          isCandlestickAvailable={false}
        />
      </div>

      {/* Middle Row: Allocation Donut & Heatmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 h-full">
          <AllocationChart items={allocationItems} title="Alokacja Klas Aktywów" />
        </div>
        <div className="md:col-span-2">
          <Heatmap items={heatmapData} />
        </div>
      </div>

      {/* Asset Management Listing View */}
      <div className="bg-[#131B2C]/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 tracking-wide uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Zestawienie Pozycji w Portfelu
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kliknij aktywo, aby edytować, wyświetlić wykres i historię transakcji
            </p>
          </div>

          <button
            onClick={onAddAssetClick}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Dodaj Pozycję</span>
          </button>
        </div>

        {/* Positions Table Desktop / Grid cards Mobile */}
        {positions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Brak dodanych aktywów w tym podglądzie. Kliknij przycisk powyżej, aby dodać pierwsze akcje lub krypto.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                  <th className="py-2 px-3 font-bold">Aktywo</th>
                  <th className="py-2 px-2 font-bold text-right">Cena (API)</th>
                  <th className="py-2 px-2 font-bold text-right">Ilość</th>
                  <th className="py-2 px-2 font-bold text-right">Śr. Zakup</th>
                  <th className="py-2 px-3 font-bold text-right">Wartość ({baseCurrency})</th>
                  <th className="py-2 px-3 font-bold text-right">Zysk / Strata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {positions.map((pos) => {
                  const currentTotalInPosCurr = pos.shares * pos.currentPrice;
                  const currentTotalInBase = ApiService.convertTo(currentTotalInPosCurr, pos.currency, baseCurrency);
                  const costInBase = ApiService.convertTo(pos.shares * pos.buyPrice, pos.currency, baseCurrency);
                  const gain = currentTotalInBase - costInBase;
                  const gainPct = costInBase > 0 ? (gain / costInBase) * 100 : 0;
                  const isGain = gain >= 0;

                  // Evaluate 24h trend
                  const lastAnchor = pos.history24h[0] || pos.currentPrice;
                  const change24hPct = lastAnchor > 0 ? ((pos.currentPrice - lastAnchor) / lastAnchor) * 100 : 0;

                  return (
                    <tr
                      key={pos.id}
                      onClick={() => onSelectAsset(pos)}
                      className="hover:bg-slate-900/40 cursor-pointer transition-colors group"
                    >
                      {/* Ticker & Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-[11px] tracking-tighter text-slate-300 group-hover:border-slate-700 flex-shrink-0">
                            {pos.ticker.slice(0, 4)}
                          </div>
                          <div>
                            <div className="font-extrabold text-white text-xs group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                              {pos.ticker}
                              <span className="text-[8px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded font-normal uppercase">
                                {pos.category.split('_')[0]}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[120px]" title={pos.name}>
                              {pos.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Live current price */}
                      <td className="py-3 px-2 text-right font-bold text-slate-200">
                        <div>{pos.currentPrice.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} {pos.currency}</div>
                        <div className={`text-[9px] ${change24hPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {change24hPct >= 0 ? '+' : ''}{change24hPct.toFixed(2)}%
                        </div>
                      </td>

                      {/* Shares count */}
                      <td className="py-3 px-2 text-right text-slate-400 font-semibold">
                        {pos.shares.toLocaleString('pl-PL', { maximumFractionDigits: 4 })}
                      </td>

                      {/* Avg Buy price */}
                      <td className="py-3 px-2 text-right text-slate-400 font-medium text-[11px]">
                        {pos.buyPrice.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} {pos.currency}
                      </td>

                      {/* Total base valuation */}
                      <td className="py-3 px-3 text-right font-black text-white">
                        {currentTotalInBase.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Total Profit ROI */}
                      <td className="py-3 px-3 text-right">
                        <div className={`font-black ${isGain ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isGain ? '+' : ''}{gain.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
                        </div>
                        <div className={`text-[9px] font-bold ${isGain ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isGain ? '+' : ''}{gainPct.toFixed(2)}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Auxiliary Features Grid: Fear & Greed + News Feed + Corporate events */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fear & Greed Widget */}
        <div className="md:col-span-1">
          <FearAndGreed score={72} />
        </div>

        {/* Live news stream */}
        <div className="md:col-span-1">
          <NewsFeed items={newsItems} />
        </div>

        {/* Corporate earnings & dividends overview */}
        <div className="md:col-span-1 bg-[#131B2C]/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-300 tracking-wide uppercase mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Kalendarium Inwestora
            </h3>

            {/* Dividend Reminders */}
            <div className="mb-4">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Najbliższe Dywidendy
              </span>
              <div className="space-y-1.5">
                {dividendEvents.map(div => (
                  <div key={div.id} className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-white font-bold">{div.ticker}</strong>
                      <span className="text-[10px] text-slate-500 block">Ex-Date: {div.exDate}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-extrabold">{div.amount} {div.currency}</span>
                      <span className="text-[9px] text-slate-500 block">na akcję</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Corporate earnings */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Wyniki Kwartalne (Spółki)
              </span>
              <div className="space-y-1.5">
                {earningEvents.map(ern => (
                  <div key={ern.id} className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <div>
                        <strong className="text-white font-bold">{ern.ticker}</strong>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[100px]">{ern.company}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-300 font-semibold">{ern.date}</span>
                      <span className="text-[9px] text-indigo-400 block font-bold">Est. EPS: {ern.estimatedEps}$</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 text-center">
            Powiadomienia push o kalendarzu włączone
          </div>
        </div>
      </div>
    </div>
  );
};
