import React, { useState } from 'react';
import { Lock, Delete, Fingerprint, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface LockScreenProps {
  correctPin: string;
  onUnlocked: () => void;
  onResetRequested?: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ 
  correctPin, 
  onUnlocked,
  onResetRequested 
}) => {
  const [entered, setEntered] = useState<string>('');
  const [errorAnim, setErrorAnim] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const handleDigit = (d: string) => {
    if (entered.length >= 4 || success) return;
    const next = entered + d;
    setEntered(next);

    if (next.length === 4) {
      if (next === correctPin) {
        setSuccess(true);
        setTimeout(() => {
          onUnlocked();
        }, 400);
      } else {
        setErrorAnim(true);
        setTimeout(() => {
          setEntered('');
          setErrorAnim(false);
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    if (entered.length > 0 && !success) {
      setEntered(entered.slice(0, -1));
    }
  };

  const simulateBiometrics = () => {
    setSuccess(true);
    setTimeout(() => {
      onUnlocked();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-[#0B0F19] z-50 flex flex-col items-center justify-between p-6 text-white select-none">
      {/* Background glow overlay */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Banner */}
      <div className="w-full pt-8 flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
          {success ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-scale-up" />
          ) : (
            <Lock className="w-5 h-5 text-amber-500" />
          )}
        </div>
        
        <h2 className="text-lg font-bold tracking-wide text-slate-200">
          Wprowadź kod PIN
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Aplikacja zabezpieczona szyfrowaniem AES-256
        </p>

        {/* Pin input visual circles */}
        <div className={`flex items-center gap-4 mt-8 ${errorAnim ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = entered.length > idx;
            return (
              <div 
                key={idx}
                className={`w-4 h-4 rounded-full border transition-all duration-150 ${
                  success 
                    ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/50' 
                    : errorAnim 
                    ? 'bg-rose-500 border-rose-400' 
                    : isFilled 
                    ? 'bg-amber-400 border-amber-300 scale-110 shadow-sm' 
                    : 'bg-slate-900 border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {errorAnim && (
          <span className="text-xs text-rose-400 font-medium mt-3 flex items-center gap-1 animate-fade-in">
            <ShieldAlert className="w-3.5 h-3.5" /> Nieprawidłowy kod PIN
          </span>
        )}
      </div>

      {/* Keypad Grid */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-x-6 gap-y-4 mb-6 relative z-10">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            className="w-16 h-16 rounded-full mx-auto bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800 hover:border-slate-700 active:scale-95 transition-all text-xl font-bold tracking-tight text-slate-200 flex items-center justify-center backdrop-blur-sm shadow-md"
          >
            {digit}
          </button>
        ))}

        {/* Biometrics simulator button */}
        <button
          onClick={simulateBiometrics}
          title="Zaloguj biometrycznie (FaceID/Odcisk)"
          className="w-16 h-16 rounded-full mx-auto bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/80 active:scale-95 transition-all text-slate-400 hover:text-emerald-400 flex items-center justify-center"
        >
          <Fingerprint className="w-6 h-6 animate-pulse" />
        </button>

        {/* 0 Button */}
        <button
          onClick={() => handleDigit('0')}
          className="w-16 h-16 rounded-full mx-auto bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800 hover:border-slate-700 active:scale-95 transition-all text-xl font-bold tracking-tight text-slate-200 flex items-center justify-center backdrop-blur-sm shadow-md"
        >
          0
        </button>

        {/* Delete / Back button */}
        <button
          onClick={handleDelete}
          className="w-16 h-16 rounded-full mx-auto bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/80 active:scale-95 transition-all text-slate-400 hover:text-rose-400 flex items-center justify-center"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      {/* Footer support triggers */}
      <div className="pb-4 text-center">
        {onResetRequested ? (
          <button
            onClick={onResetRequested}
            className="text-xs text-slate-500 hover:text-slate-400 underline underline-offset-4"
          >
            Zapomniałeś kodu PIN? Zresetuj pamięć
          </button>
        ) : (
          <span className="text-[10px] text-slate-600">
            Chronione lokalnym szyfrowaniem urządzenia
          </span>
        )}
      </div>
    </div>
  );
};
