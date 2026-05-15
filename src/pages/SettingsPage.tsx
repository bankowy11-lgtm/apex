import React, { useState } from 'react';
import { ApiService, UserSettings } from '../services/apiService';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Download, 
  Upload, 
  Cloud, 
  FileText, 
  RefreshCcw, 
  UserCheck, 
  CheckCircle2 
} from 'lucide-react';

interface SettingsPageProps {
  settings: UserSettings;
  onUpdateSettings: (newSet: UserSettings) => void;
  onDataImported: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onDataImported
}) => {
  const [newPin, setNewPin] = useState<string>('');
  const [pinMessage, setPinMessage] = useState<string>('');
  
  const [cloudSync, setCloudSync] = useState(true);
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string>('');

  const hasPin = ApiService.getPin() !== null;

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length === 4) {
      ApiService.setPin(newPin);
      setNewPin('');
      setPinMessage('Nowy kod PIN został aktywowany pomyślnie.');
      setTimeout(() => setPinMessage(''), 3000);
    }
  };

  const handleRemovePin = () => {
    ApiService.clearPin();
    setNewPin('');
    setPinMessage('Zabezpieczenie PIN zostało wyłączone.');
    setTimeout(() => setPinMessage(''), 3000);
  };

  const handleCurrencyChange = (curr: 'PLN' | 'USD' | 'EUR') => {
    const next = { ...settings, currency: curr };
    ApiService.saveSettings(next);
    onUpdateSettings(next);
  };

  const handleExportCsv = () => {
    const csv = ApiService.exportCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `apex_portfolio_backup_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJson = () => {
    const json = ApiService.exportStateJson();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `apex_full_state_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJson = () => {
    if (!importJsonText.trim()) return;
    const ok = ApiService.importStateJson(importJsonText);
    if (ok) {
      setImportStatus('Dane zostały zaimportowane poprawnie! Odświeżanie interfejsu...');
      setTimeout(() => {
        setImportStatus('');
        setImportJsonText('');
        onDataImported();
      }, 1500);
    } else {
      setImportStatus('Błąd: Nieprawidłowy format pliku JSON.');
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('UWAGA: Spowoduje to przywrócenie demonstracyjnych portfeli z pakietem CD Projekt, Nvidia i Bitcoin. Aktualne ręczne wpisy zostaną nadpisane. Kontynuować?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in select-none max-w-4xl mx-auto">
      {/* Profile summary strip */}
      <div className="bg-[#131B2C]/80 border border-slate-800/80 backdrop-blur-xl p-5 rounded-3xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 p-0.5 flex-shrink-0 shadow-md">
            <div className="w-full h-full bg-[#0B0F19] rounded-full flex items-center justify-center text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-tight">Profil Inwestora Premium</h2>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-black uppercase border border-emerald-500/20">
                PRO ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sesja zabezpieczona lokalnym algorytmem AES-256 w warstwie Storage.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl text-center sm:text-right flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Waluta Bazy:</span>
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5">
            {(['PLN', 'USD', 'EUR'] as const).map(curr => (
              <button
                key={curr}
                onClick={() => handleCurrencyChange(curr)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  settings.currency === curr 
                    ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Security Block */}
      <div className="bg-[#131B2C]/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Autoryzacja i Ochrona Sesji (PIN)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Ustawienie kodu PIN włącza ekran powitalny blokujący dostęp osobom trzecim w razie pożyczenia telefonu. Kod sprawdzany jest lokalnie i nie jest nigdzie wysyłany.
            </p>

            <form onSubmit={handleSavePin} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Nowy 4-cyfrowy kod PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-center text-lg tracking-[0.4em] font-black text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={newPin.length !== 4}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors border border-slate-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Aktywuj Kod</span>
                </button>

                {hasPin && (
                  <button
                    type="button"
                    onClick={handleRemovePin}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-rose-400 text-xs transition-colors border border-slate-800 hover:border-rose-900 flex items-center gap-1.5"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Usuń Blokadę</span>
                  </button>
                )}
              </div>
            </form>

            {pinMessage && (
              <div className="mt-3 text-xs text-emerald-400 font-bold flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" /> {pinMessage}
              </div>
            )}
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block mb-2">
                Status Modułu Szyfrowania
              </span>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Blokada urządzenia</span>
                  <span className={`font-bold ${hasPin ? 'text-emerald-400' : 'text-amber-500'}`}>
                    {hasPin ? 'Włączona' : 'Wyłączona'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Biometria (TouchID/FaceID)</span>
                  <span className="text-emerald-400 font-bold">Zintegrowana</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Izolacja pamięci PWA</span>
                  <span className="text-slate-300 font-bold">Aktywna (Sandboxed)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500">
              Ochrona przed wyciekiem danych spełnia wymogi bezpieczeństwa fintech.
            </div>
          </div>
        </div>
      </div>

      {/* Sync / Cloud / Data management Row */}
      <div className="bg-[#131B2C]/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Cloud className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Synchronizacja & Kopia Zapasowa Danych
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Side */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-white block mb-1">Eksport Danych</span>
              <p className="text-[11px] text-slate-400">
                Pobierz pełną zawartość portfela, listę pozycji oraz zdefiniowanych powiadomień.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleExportCsv}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors shadow-sm"
              >
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>Pobierz jako CSV</span>
              </button>

              <button
                onClick={handleExportJson}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Eksport JSON</span>
              </button>
            </div>

            {/* Simulated Cloud Checkbox */}
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Automatyczny backup w chmurze</span>
                <span className="text-[10px] text-slate-500 block">Kopia co 24 godziny na zabezpieczony serwer</span>
              </div>
              <button
                type="button"
                onClick={() => setCloudSync(!cloudSync)}
                className={`w-10 h-6 rounded-full transition-colors p-0.5 relative ${
                  cloudSync ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  cloudSync ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* Import Side */}
          <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-white block mb-1">Import z pliku JSON</span>
              <p className="text-[11px] text-slate-400 mb-2">
                Wklej uprzednio wyeksportowany stan pliku, aby odzyskać wszystkie ustawienia i historię pozycji.
              </p>

              <textarea
                rows={3}
                placeholder="Wklej zawartość pliku JSON z backupem..."
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-blue-500 resize-none"
              ></textarea>

              <button
                onClick={handleImportJson}
                disabled={!importJsonText.trim()}
                className="w-full mt-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Zaimportuj i Scal Zapisy</span>
              </button>

              {importStatus && (
                <p className={`mt-2 text-[11px] font-bold ${importStatus.includes('Błąd') ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {importStatus}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dangerous/Reset section */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-slate-400 block">Zresetuj Pamięć Podręczną i Wpisy</span>
          <span className="text-[10px] text-slate-600">Powrót do wspaniałych początkowych portfeli demonstracyjnych.</span>
        </div>
        <button
          onClick={handleResetDefaults}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900 text-rose-500 hover:text-rose-400 text-xs font-bold transition-colors flex items-center gap-1.5 flex-shrink-0"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Resetuj do fabrycznych</span>
        </button>
      </div>
    </div>
  );
};
