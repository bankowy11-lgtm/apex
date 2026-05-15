import React, { useState } from 'react';
import { MarketAlert } from '../types';
import { ApiService } from '../services/apiService';
import { 
  BellRing, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone,
  TrendingUp,
  Percent
} from 'lucide-react';

interface AlertsPageProps {
  alerts: MarketAlert[];
  onUpdateAlerts: (newAlerts: MarketAlert[]) => void;
  baseCurrency: string;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  onUpdateAlerts,
  baseCurrency
}) => {
  const [ticker, setTicker] = useState('');
  const [type, setType] = useState<'price_above' | 'price_below' | 'percent_change' | 'dividend'>('price_above');
  const [targetValue, setTargetValue] = useState('');
  const [pushEnabled, setPushEnabled] = useState(true);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim() || !targetValue) return;

    const val = parseFloat(targetValue) || 0;
    const newAlert: MarketAlert = {
      id: `alert-${Date.now()}`,
      ticker: ticker.toUpperCase().trim(),
      name: ticker.toUpperCase().trim(),
      type,
      targetValue: val,
      currentValue: type === 'percent_change' ? 0 : val * 0.95,
      triggered: false,
      active: true
    };

    const nextAlerts = [newAlert, ...alerts];
    ApiService.saveAlerts(nextAlerts);
    onUpdateAlerts(nextAlerts);

    // Clear form
    setTicker('');
    setTargetValue('');
  };

  const handleToggleActive = (id: string) => {
    const nextAlerts = alerts.map(a => 
      a.id === id ? { ...a, active: !a.active } : a
    );
    ApiService.saveAlerts(nextAlerts);
    onUpdateAlerts(nextAlerts);
  };

  const handleDelete = (id: string) => {
    const nextAlerts = alerts.filter(a => a.id !== id);
    ApiService.saveAlerts(nextAlerts);
    onUpdateAlerts(nextAlerts);
  };

  const handleTriggerTest = (id: string) => {
    const nextAlerts = alerts.map(a => 
      a.id === id ? { ...a, triggered: true, currentValue: a.targetValue } : a
    );
    ApiService.saveAlerts(nextAlerts);
    onUpdateAlerts(nextAlerts);
  };

  const getTypeLabel = (t: string) => {
    switch (t) {
      case 'price_above': return 'Cena wzrośnie powyżej';
      case 'price_below': return 'Cena spadnie poniżej';
      case 'percent_change': return 'Zmień o (%) w 24h';
      case 'dividend': return 'Przypomnienie o dywidendzie';
      default: return t;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in select-none">
      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#131B2C] to-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <BellRing className="w-3.5 h-3.5" />
            <span>Powiadomienia Push & Alerty</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            System Alertów Cenowych
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Otrzymuj natychmiastowe sygnały przekroczenia targetu w tle (jako PWA Push Notifications na Android/iOS) bez konieczności stałego wpatrywania się w wykresy.
          </p>
        </div>

        {/* Global push toggle control */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center gap-3 self-start sm:self-auto flex-shrink-0">
          <Smartphone className={`w-8 h-8 ${pushEnabled ? 'text-emerald-400' : 'text-slate-600'}`} />
          <div>
            <span className="text-xs font-extrabold text-white block">Powiadomienia Push</span>
            <span className="text-[10px] text-slate-400 block">Wymaga uprawnień PWA</span>
            <button
              onClick={() => setPushEnabled(!pushEnabled)}
              className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                pushEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {pushEnabled ? 'Włączone (Aktywne)' : 'Wyłączone'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Left Form / Right Alerts Feed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Creation Form */}
        <div className="md:col-span-1 bg-[#131B2C]/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-xl h-max">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-400" />
            Stwórz Nowy Alert
          </h3>

          <form onSubmit={handleCreate} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Symbol / Ticker *
              </label>
              <input
                type="text"
                required
                placeholder="np. NVDA, BTC, CDR.WA"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Warunek Sygnału
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="price_above">Cena przekroczy kwotę (w górę)</option>
                <option value="price_below">Cena spadnie poniżej (w dół)</option>
                <option value="percent_change">Skok o dany procent w 24h</option>
                <option value="dividend">Przypomnienie przed dniem dywidendy</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Wartość Docelowa *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  required
                  placeholder={type === 'percent_change' ? '5.0' : '150.00'}
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 pr-12"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-500 uppercase">
                  {type === 'percent_change' ? '%' : baseCurrency}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Dodaj do kolejki PWA
            </button>
          </form>
        </div>

        {/* Existing Alerts Queue */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 flex items-center justify-between">
            <span>Zdefiniowane Reguły i Statusy ({alerts.length})</span>
            <span className="text-[9px] text-slate-500 font-normal">Offline Cache</span>
          </h3>

          {alerts.length === 0 ? (
            <div className="py-12 bg-[#131B2C]/40 border border-slate-800/40 rounded-2xl text-center text-slate-500 text-xs italic">
              Brak zdefiniowanych alertów. Wypełnij formularz obok, aby skonfigurować pierwsze wyzwalacze.
            </div>
          ) : (
            <div className="space-y-2.5">
              {alerts.map((al) => {
                const isTriggered = al.triggered;

                return (
                  <div
                    key={al.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isTriggered
                        ? 'bg-rose-950/20 border-rose-900/60 shadow-sm'
                        : al.active
                        ? 'bg-[#131B2C]/80 border-slate-800/80 hover:border-slate-700'
                        : 'bg-slate-950/40 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon indicator */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isTriggered
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                          : al.active
                          ? 'bg-slate-900 text-amber-400 border border-slate-800'
                          : 'bg-slate-900 text-slate-600 border border-slate-800'
                      }`}>
                        {isTriggered ? (
                          <AlertCircle className="w-5 h-5" />
                        ) : al.type === 'percent_change' ? (
                          <Percent className="w-4 h-4" />
                        ) : (
                          <TrendingUp className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-white font-extrabold text-sm tracking-tight">
                            {al.ticker}
                          </strong>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            isTriggered 
                              ? 'bg-rose-500 text-white' 
                              : al.active 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-slate-800 text-slate-500'
                          }`}>
                            {isTriggered ? 'SYGNAŁ PRZEKROCZONY' : al.active ? 'Aktywny' : 'Zatrzymany'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-400 mt-0.5 font-medium">
                          {getTypeLabel(al.type)}:{' '}
                          <span className="text-slate-200 font-bold">
                            {al.targetValue} {al.type === 'percent_change' ? '%' : baseCurrency}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-500 mt-1">
                          Aktualny stan API: ~ {al.currentValue} {al.type === 'percent_change' ? '%' : baseCurrency}
                        </div>
                      </div>
                    </div>

                    {/* Button row */}
                    <div className="flex items-center gap-2.5 self-end sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60 w-full sm:w-auto justify-end">
                      {!isTriggered && al.active && (
                        <button
                          onClick={() => handleTriggerTest(al.id)}
                          title="Symuluj przekroczenie na potrzeby wdrożenia PWA"
                          className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 text-[10px] transition-colors"
                        >
                          Test Sygnału
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleActive(al.id)}
                        title={al.active ? 'Wycisz alert' : 'Wznów śledzenie'}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          al.active
                            ? 'bg-slate-900 text-amber-500 border-slate-800 hover:bg-slate-800'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(al.id)}
                        title="Usuń trwale wyzwalacz"
                        className="p-1.5 rounded-lg bg-slate-900 text-slate-500 hover:text-rose-400 border border-slate-800 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Fallback instruction banner */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed mt-4">
            <strong className="text-slate-300 font-bold block mb-0.5">Wskazówka odnośnie PWA:</strong>
            Zezwól przeglądarce na powiadomienia na ekranie blokady, aby wyzwalacze mogły przesyłać komunikaty o przekroczeniu pułapu nawet gdy karta przeglądarki jest zminimalizowana.
          </div>
        </div>
      </div>
    </div>
  );
};
