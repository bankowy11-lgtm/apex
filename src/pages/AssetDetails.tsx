import React from 'react';
import { AssetPosition } from '../types';
import { ApiService } from '../services/apiService';
import { AssetChart } from '../components/AssetChart';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Coins 
} from 'lucide-react';

interface AssetDetailsProps {
  position: AssetPosition;
  baseCurrency: string;
  totalPortfolioValue: number;
  onBack: () => void;
  onEdit: (pos: AssetPosition) => void;
  onDelete: (id: string) => void;
}

export const AssetDetails: React.FC<AssetDetailsProps> = ({
  position,
  baseCurrency,
  totalPortfolioValue,
  onBack,
  onEdit,
  onDelete
}) => {
  // Conversions & calculation triggers
  const costInPosCurr = position.shares * position.buyPrice;
  const currentValInPosCurr = position.shares * position.currentPrice;
  
  const costInBase = ApiService.convertTo(costInPosCurr, position.currency, baseCurrency);
  const currentValInBase = ApiService.convertTo(currentValInPosCurr, position.currency, baseCurrency);
  
  const absoluteGain = currentValInBase - costInBase;
  const roiPercent = costInBase > 0 ? (absoluteGain / costInBase) * 100 : 0;
  const isPositive = absoluteGain >= 0;

  // Share of portfolio %
  const slicePercent = totalPortfolioValue > 0 ? (currentValInBase / totalPortfolioValue) * 100 : 0;

  // CAGR calculation simulation based on holding days
  const purchaseDateObj = new Date(position.purchaseDate || Date.now());
  const nowObj = new Date();
  const diffTime = Math.abs(nowObj.getTime() - purchaseDateObj.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const yearsHeld = Math.max(0.08, diffDays / 365.25);
  
  // CAGR formula: (Ending Value / Beginning Value) ^ (1 / years) - 1
  const cagrPercent = costInBase > 0 
    ? (Math.pow(currentValInBase / costInBase, 1 / yearsHeld) - 1) * 100 
    : 0;

  // Synthesize chart trace points based on anchor values
  const chartPoints = position.history24h && position.history24h.length > 1
    ? position.history24h
    : [
        position.buyPrice * 0.95,
        position.buyPrice * 0.98,
        position.buyPrice * 1.02,
        position.buyPrice * 1.01,
        position.currentPrice * 0.99,
        position.currentPrice
      ];

  const handleDelete = () => {
    if (window.confirm(`Czy na pewno chcesz trwale usunąć pozycję ${position.ticker}?`)) {
      onDelete(position.id);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in select-none">
      {/* Header controls row */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Powrót do pulpitu</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(position)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors bg-slate-900/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-800"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
            <span>Edytuj</span>
          </button>
          
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-white transition-colors bg-slate-900/80 hover:bg-rose-950/40 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-rose-900"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Usuń</span>
          </button>
        </div>
      </div>

      {/* Main Branding Card with Ticker Info */}
      <div className="bg-[#131B2C]/80 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Absolute ambient light tint */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center font-black text-xl text-white tracking-tighter shadow-lg">
              {position.ticker.slice(0, 4)}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {position.ticker}
                </h1>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-slate-700">
                  {position.category.split('_')[0]}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5 font-medium">
                {position.name}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">
              Aktualna Cena (API)
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {position.currentPrice.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} {position.currency}
            </span>
          </div>
        </div>

        {/* Inner Metrics Rows */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80 relative z-10">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Zainwestowano
            </span>
            <span className="text-sm sm:text-base font-extrabold text-white mt-0.5 block">
              {costInPosCurr.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} {position.currency}
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">
              ~ {costInBase.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} {baseCurrency}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Wartość Pozycji
            </span>
            <span className="text-sm sm:text-base font-extrabold text-white mt-0.5 block">
              {currentValInPosCurr.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} {position.currency}
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">
              ~ {currentValInBase.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} {baseCurrency}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Udział w Portfelu
            </span>
            <span className="text-sm sm:text-base font-extrabold text-white mt-0.5 block flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400 inline" />
              {slicePercent.toFixed(2)}%
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">
              Alokacji całkowitej
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Skumulowany CAGR
            </span>
            <span className={`text-sm sm:text-base font-extrabold mt-0.5 block ${cagrPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {cagrPercent >= 0 ? '+' : ''}{cagrPercent.toFixed(2)}%
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">
              Średnioroczna stopa zwrotu
            </span>
          </div>
        </div>
      </div>

      {/* Embedded Deep Interactive Chart trace */}
      <div>
        <AssetChart 
          dataPoints={chartPoints} 
          color={isPositive ? '#10B981' : '#EF4444'} 
          baseCurrency={position.currency}
          isCandlestickAvailable={true}
        />
      </div>

      {/* Lower Metrics Grid: Analytics & Details breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Calculation Table stats view */}
        <div className="bg-[#131B2C]/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              Szczegółowa Analityka
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Średnia cena zakupu</span>
                <span className="font-extrabold text-white">{position.buyPrice} {position.currency}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Posiadane jednostki</span>
                <span className="font-extrabold text-white">{position.shares}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Prowizje zapłacone</span>
                <span className="font-extrabold text-slate-300">{position.commission} {position.currency}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Całkowity Profit/Loss</span>
                <span className={`font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? '+' : ''}{absoluteGain.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} {baseCurrency}
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Zwrot z inwestycji (ROI)</span>
                <span className={`font-black flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {isPositive ? '+' : ''}{roiPercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-[10px] text-slate-500">
            Data zakupu: <strong className="text-slate-400">{position.purchaseDate}</strong>
          </div>
        </div>

        {/* Investment Notes overview */}
        <div className="bg-[#131B2C]/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Notatki Inwestora
            </h3>

            {position.notes ? (
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 italic">
                "{position.notes}"
              </p>
            ) : (
              <p className="text-xs text-slate-500 italic py-6 text-center">
                Brak zapisanych notatek dla tej pozycji. Kliknij przycisk Edytuj na górze, aby uzupełnić założenia strategiczne.
              </p>
            )}

            {/* Dividend preview summary trigger */}
            <div className="mt-6 pt-4 border-t border-slate-800/60">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-2">
                Status Dywidend / Odsetek
              </span>
              <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[11px] text-emerald-400/90 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
                <span>Śledzenie dywidend zoptymalizowane pod tę klasę aktywów. Przypomnienia włączone.</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-[10px] text-slate-500 text-right">
            ID: {position.id}
          </div>
        </div>
      </div>
    </div>
  );
};
