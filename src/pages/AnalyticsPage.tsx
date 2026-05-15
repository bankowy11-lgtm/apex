import React, { useState } from 'react';
import { AssetPosition, AIInsight } from '../types';
import { ApiService } from '../services/apiService';
import { 
  BrainCircuit, 
  Sparkles, 
  ShieldAlert, 
  HelpCircle, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface AnalyticsPageProps {
  positions: AssetPosition[];
  baseCurrency: string;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  positions,
  baseCurrency
}) => {
  const [analyzing, setAnalyzing] = useState(false);

  // Derive simple facts to synthesize intelligent insights
  let hasCrypto = false;
  let hasGoldOrSilver = false;
  let hasPlnStocks = false;
  let hasUsStocks = false;
  let totalValue = 0;

  positions.forEach(p => {
    const v = ApiService.convertTo(p.shares * p.currentPrice, p.currency, baseCurrency);
    totalValue += v;
    if (p.category === 'crypto') hasCrypto = true;
    if (p.category === 'gold' || p.category === 'silver') hasGoldOrSilver = true;
    if (p.category === 'stocks_pl') hasPlnStocks = true;
    if (p.category === 'stocks_us') hasUsStocks = true;
  });

  // Calculate synthetic score based on asset mix coverage
  let score = 50;
  if (hasCrypto) score += 10;
  if (hasGoldOrSilver) score += 15;
  if (hasUsStocks) score += 15;
  if (hasPlnStocks) score += 10;
  if (positions.length > 4) score += 10;

  const insights: AIInsight[] = [
    {
      id: 'ai-1',
      type: 'diversification',
      title: 'Sugestia Dywersyfikacji Kapitału',
      description: hasGoldOrSilver 
        ? 'Twój portfel posiada odpowiednią ekspozycję na metale szlachetne stanowiące bufor antyinflacyjny.'
        : 'Wykryto brak aktywów z grupy surowcowej (Złoto/Srebro). Rozważ alokację 5-10% kapitału w celu zabezpieczenia portfela przed gwałtownymi spadkami na giełdach.',
      impact: hasGoldOrSilver ? 'low' : 'high',
      actionSuggested: hasGoldOrSilver ? 'Utrzymaj alokację' : 'Kup ETF na Złoto (np. SGLN)'
    },
    {
      id: 'ai-2',
      type: 'risk',
      title: 'Ocena Ryzyka Zmienności (Crypto exposure)',
      description: hasCrypto
        ? 'Ekspozycja na kryptowaluty zwiększa wskaźnik beta portfela. Zmienność dobowa przekracza standardowe odchylenie indeksu S&P 500.'
        : 'Portfel wykazuje niski współczynnik ryzyka systemowego. Zmienność w granicach konserwatywnych funduszy inwestycyjnych.',
      impact: hasCrypto ? 'high' : 'low',
      actionSuggested: hasCrypto ? 'Skalibruj zlecenia Stop Loss' : 'Stabilny wzrost'
    },
    {
      id: 'ai-3',
      type: 'trend',
      title: 'Analiza Trendów Makroekonomicznych',
      description: 'Zarówno sektor AI w USA (Nvidia, Microsoft) jak i wybrane polskie blue chipy znajdują się w długoterminowym kanale wzrostowym. Sygnały wskaźnika MACD pozostają bycze.',
      impact: 'medium',
      actionSuggested: 'Akumulacja przy korektach'
    },
    {
      id: 'ai-4',
      type: 'sentiment',
      title: 'Analiza Emocji Rynku (Sentiment AI)',
      description: 'Sentyment globalnych inwestorów oscyluje wokół strefy chciwości. Historycznie oznacza to podwyższone ryzyko realizacji zysków w horyzoncie 1W-1M.',
      impact: 'medium'
    }
  ];

  const handleSimulateAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
    }, 800);
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-black uppercase text-[9px]">Wysoki Priorytet</span>;
      case 'medium':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-black uppercase text-[9px]">Średni Wpływ</span>;
      default:
        return <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold uppercase text-[9px]">Optymalnie</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in select-none">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-slate-900 via-[#131B2C] to-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <BrainCircuit className="w-32 h-32 text-emerald-400" />
        </div>

        <div className="max-w-xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Investment Insights Module</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Analityka Portfela & Algorytmy AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            System non-stop monitoruje relacje korelacji między Twoimi aktywami, wyszukuje optymalne strategie alokacji i wykrywa potencjalne ryzyka płynnościowe.
          </p>

          <button
            onClick={handleSimulateAnalysis}
            disabled={analyzing}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all border border-slate-700 disabled:opacity-50"
          >
            <BrainCircuit className={`w-4 h-4 ${analyzing ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
            <span>{analyzing ? 'Przeliczanie wskaźników ryzyka...' : 'Wykonaj pełny audyt AI na nowo'}</span>
          </button>
        </div>
      </div>

      {/* AI Score Overview meter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric gauge 1 */}
        <div className="bg-[#131B2C]/80 border border-slate-800/80 p-4 rounded-2xl shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-black text-emerald-400 text-lg">
            {score}/100
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Ocena Dywersyfikacji</span>
            <span className="text-xs font-black text-white mt-0.5 block">
              {score >= 80 ? 'Wzorowa' : score >= 60 ? 'Dobra stabilność' : 'Wymaga kalibracji'}
            </span>
          </div>
        </div>

        {/* Metric gauge 2 */}
        <div className="bg-[#131B2C]/80 border border-slate-800/80 p-4 rounded-2xl shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Korelacja Wewnętrzna</span>
            <span className="text-xs font-black text-white mt-0.5 block">
              Niska (0.34) • Optymalnie
            </span>
          </div>
        </div>

        {/* Metric gauge 3 */}
        <div className="bg-[#131B2C]/80 border border-slate-800/80 p-4 rounded-2xl shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Ekspozycja Walutowa</span>
            <span className="text-xs font-black text-white mt-0.5 block">
              {hasUsStocks ? 'Dominacja USD' : 'Zrównoważona'}
            </span>
          </div>
        </div>
      </div>

      {/* Actual AI Insights Stream Blocks */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Szczegółowe Raporty i Sugestie Algorytmiczne
        </h3>

        {/* Skeleton loaders feedback when analyzing */}
        {analyzing ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between">
                <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-800 rounded w-full"></div>
                  <div className="h-3 bg-slate-800 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((ins) => (
              <div 
                key={ins.id}
                className="bg-[#131B2C]/80 border border-slate-800/80 hover:border-slate-700/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 transition-all shadow-md group relative overflow-hidden"
              >
                {/* Subtle highlight left marker */}
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-600 opacity-75 group-hover:opacity-100 transition-opacity" />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                        {ins.title}
                      </h4>
                      {getImpactBadge(ins.impact)}
                    </div>

                    <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-3xl">
                      {ins.description}
                    </p>
                  </div>

                  {ins.actionSuggested && (
                    <div className="mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60 flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 self-start sm:self-auto flex-shrink-0">
                      <span>Rekomendacja:</span>
                      <strong className="text-white ml-0.5">{ins.actionSuggested}</strong>
                    </div>
                  )}
                </div>

                {/* Footer Microinteraction trigger */}
                <div className="mt-3 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-slate-600" />
                    Wygenerowane na podstawie bilansu aktywów
                  </span>
                  
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500 font-bold flex items-center gap-0.5 cursor-pointer">
                    Wdrażam automatycznie <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auxiliary Premium Insight Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/40 border border-indigo-900/30 text-xs text-center flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-left">
          <span className="font-extrabold text-slate-200 block">Potrzebujesz głębszej analizy spółek z GPW?</span>
          <span className="text-[11px] text-slate-400">System integruje dane z rachunków maklerskich i wskaźników P/E w tle.</span>
        </div>
        <button className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase tracking-wider transition-colors flex-shrink-0">
          Aktywuj Premium AI+
        </button>
      </div>
    </div>
  );
};
