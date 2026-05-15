import React, { useState } from 'react';
import { AssetPosition, AssetCategory, Portfolio } from '../types';
import { ApiService } from '../services/apiService';
import { X, Search, Sparkles } from 'lucide-react';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (position: Partial<AssetPosition>) => void;
  portfolios: Portfolio[];
  initialPortfolioId?: string | null;
  editPosition?: AssetPosition | null;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  portfolios,
  initialPortfolioId,
  editPosition
}) => {
  const isEditing = !!editPosition;

  const [portfolioId, setPortfolioId] = useState<string>(
    editPosition?.portfolioId || initialPortfolioId || portfolios[0]?.id || 'p1'
  );
  const [ticker, setTicker] = useState<string>(editPosition?.ticker || '');
  const [name, setName] = useState<string>(editPosition?.name || '');
  const [category, setCategory] = useState<AssetCategory>(editPosition?.category || 'stocks_us');
  const [shares, setShares] = useState<string>(editPosition ? editPosition.shares.toString() : '');
  const [buyPrice, setBuyPrice] = useState<string>(editPosition ? editPosition.buyPrice.toString() : '');
  const [commission, setCommission] = useState<string>(editPosition ? editPosition.commission.toString() : '0');
  const [currency, setCurrency] = useState<string>(editPosition?.currency || 'USD');
  const [purchaseDate, setPurchaseDate] = useState<string>(
    editPosition?.purchaseDate || new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>(editPosition?.notes || '');

  // Search input matching
  const [searchQuery, setSearchQuery] = useState('');
  const suggestions = ApiService.searchTickers(searchQuery);

  if (!isOpen) return null;

  const handleSelectSuggestion = (sug: any) => {
    setTicker(sug.symbol);
    setName(sug.name);
    setCategory(sug.category);
    setBuyPrice(sug.price.toString());
    setCurrency(sug.currency);
    setSearchQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim() || !shares || !buyPrice) return;

    const numShares = parseFloat(shares) || 0;
    const numBuyPrice = parseFloat(buyPrice) || 0;
    const numCommission = parseFloat(commission) || 0;

    // Build historical array base
    const history = editPosition?.history24h || [
      numBuyPrice * 0.95,
      numBuyPrice * 0.98,
      numBuyPrice * 1.01,
      numBuyPrice * 1.0,
      numBuyPrice * 1.02,
      numBuyPrice
    ];

    onSave({
      id: editPosition?.id || `pos-${Date.now()}`,
      portfolioId,
      ticker: ticker.toUpperCase().trim(),
      name: name.trim() || ticker.toUpperCase().trim(),
      category,
      shares: numShares,
      buyPrice: numBuyPrice,
      currentPrice: editPosition ? editPosition.currentPrice : numBuyPrice,
      currency,
      purchaseDate,
      commission: numCommission,
      notes: notes.trim(),
      history24h: history
    });

    onClose();
  };

  const categories: { id: AssetCategory; label: string }[] = [
    { id: 'stocks_us', label: 'Akcje USA' },
    { id: 'stocks_pl', label: 'Akcje GPW' },
    { id: 'etf', label: 'Fundusz ETF' },
    { id: 'crypto', label: 'Kryptowaluta' },
    { id: 'gold', label: 'Złoto' },
    { id: 'silver', label: 'Srebro' },
    { id: 'forex', label: 'Waluta' },
    { id: 'bonds', label: 'Obligacje' }
  ];

  const totalCost = (parseFloat(shares) || 0) * (parseFloat(buyPrice) || 0) + (parseFloat(commission) || 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#131B2C] border border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl animate-scale-up my-8 relative">
        {/* Header Close */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            {isEditing ? 'Edycja Pozycji' : 'Dodaj Nowe Aktywo'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-900/80 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Autocomplete Ticker Search Bar */}
        {!isEditing && (
          <div className="mt-4 relative">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Szybkie wyszukiwanie / Ticker</span>
              <span className="text-[9px] bg-slate-900 text-amber-400 px-1.5 py-0.2 rounded border border-slate-800">
                Autocomplete
              </span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Wpisz np. NVDA, AAPL, BTC, CDR.WA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Live Autocomplete suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700/80 rounded-xl max-h-40 overflow-y-auto z-20 shadow-xl divide-y divide-slate-800">
                {suggestions.map((sug) => (
                  <div
                    key={sug.symbol}
                    onClick={() => handleSelectSuggestion(sug)}
                    className="p-2.5 hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-extrabold text-xs text-white">{sug.symbol}</div>
                      <div className="text-[10px] text-slate-400">{sug.name}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400">
                        {sug.price} {sug.currency}
                      </span>
                      <span className="text-[9px] block text-slate-500 uppercase">{sug.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Portfolio destination */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Docelowy Portfel
            </label>
            <select
              value={portfolioId}
              onChange={(e) => setPortfolioId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {portfolios.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ticker & Name Fields Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Symbol / Ticker *
              </label>
              <input
                type="text"
                required
                placeholder="np. TSLA"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Nazwa Spółki / Aktywa
              </label>
              <input
                type="text"
                placeholder="np. Tesla Inc."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Kategoria
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`p-1.5 rounded-lg text-[10px] font-bold transition-all truncate text-center border ${
                    category === c.id
                      ? 'bg-slate-800 text-emerald-400 border-emerald-500 shadow-sm'
                      : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-slate-300'
                  }`}
                >
                  {c.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Shares, Price, Currency */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Ilość *
              </label>
              <input
                type="number"
                step="any"
                min="0.000001"
                required
                placeholder="10"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Cena Zakupu *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="150.00"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Waluta
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="USD">USD</option>
                <option value="PLN">PLN</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          {/* Commission & Purchase Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Prowizja Maklera
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="2.50"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Data Transakcji
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Notatki / Założenia Inwestycyjne
            </label>
            <textarea
              rows={2}
              placeholder="np. Docelowy zysk +30%, stop loss przy spadku poniżej 120 USD."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
            ></textarea>
          </div>

          {/* Total Cost live estimation view */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Łączny koszt transakcji:
            </span>
            <span className="text-sm font-black text-white">
              {totalCost.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} {currency}
            </span>
          </div>

          {/* Submit Trigger */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md"
            >
              {isEditing ? 'Zapisz Zmiany' : 'Dodaj Do Portfela'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
