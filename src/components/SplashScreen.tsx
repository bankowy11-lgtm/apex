import React, { useEffect, useState } from 'react';
import { TrendingUp, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 400); // Trigger app unlock after animation completes
          return 100;
        }
        return prev + 4;
      });
    }, 40);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-[#0B0F19] z-50 flex flex-col items-center justify-between p-8 text-white overflow-hidden">
      {/* Dynamic ambient radial gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top placeholder spacing */}
      <div className="w-full flex justify-center pt-12">
        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-amber-400 font-bold tracking-widest uppercase backdrop-blur-md">
          Fintech Premium UI
        </span>
      </div>

      {/* Central Branding Logo & Tagline */}
      <div className="flex flex-col items-center text-center relative z-10 my-auto">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-indigo-600 p-0.5 shadow-2xl shadow-emerald-500/20 mb-6 flex items-center justify-center animate-bounce duration-1000">
          <div className="w-full h-full bg-[#0B0F19] rounded-[22px] flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-emerald-400" />
          </div>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
          APEX <span className="text-emerald-500 text-base align-super">•</span>
        </h1>
        <p className="text-xs uppercase font-bold text-slate-400 tracking-[0.3em] mt-2 bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
          Wealth & Portfolio
        </p>

        <p className="text-xs text-slate-500 max-w-xs mt-6 leading-relaxed">
          Zarządzaj akcjami, krypto, ETF oraz surowcami z poziomu jednej inteligentnej aplikacji.
        </p>
      </div>

      {/* Bottom Loading Bar and Status */}
      <div className="w-full max-w-xs relative z-10 pb-8 flex flex-col items-center">
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500 rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full mt-3 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Szyfrowanie kluczy
          </span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
};
