import React, { useState } from 'react';
import { TrendingUp, Globe2, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: (setupPin: string | null, currency: 'PLN' | 'USD' | 'EUR') => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [pin, setPin] = useState('');
  const [currency, setCurrency] = useState<'PLN' | 'USD' | 'EUR'>('PLN');

  const slides = [
    {
      title: 'Witaj w Apex Wealth',
      subtitle: 'Twój premium asystent inwestycyjny na każdym urządzeniu.',
      icon: <TrendingUp className="w-12 h-12 text-emerald-400" />,
      desc: 'Śledź akcje GPW, Wall Street, fundusze ETF, kryptowaluty oraz surowce z poziomu ujednoliconego, pięknego interfejsu w stylu TradingView.',
      actionLabel: 'Rozpocznij konfigurację'
    },
    {
      title: 'Integracja & Caching API',
      subtitle: 'Pobieraj wyceny w czasie rzeczywistym z gwarancją działania.',
      icon: <Globe2 className="w-12 h-12 text-blue-400" />,
      desc: 'Aplikacja automatycznie synchronizuje ceny i przechowuje bezpieczną kopię zapasową w pamięci offline. Masz stały dostęp do wykresów nawet w samolocie.',
      actionLabel: 'Dalej'
    },
    {
      title: 'Zabezpiecz Swój Portfel',
      subtitle: 'Ustaw opcjonalny kod PIN zabezpieczający dostęp.',
      icon: <ShieldCheck className="w-12 h-12 text-amber-400" />,
      desc: 'Dane o Twoim majątku nigdy nie opuszczają urządzenia bez Twojej wiedzy. Ustaw 4-cyfrowy kod chroniący sesję.',
      isPinStep: true,
      actionLabel: 'Przejdź do wyboru waluty'
    },
    {
      title: 'Waluta Główna',
      subtitle: 'Wybierz domyślną walutę podsumowań portfeli.',
      icon: <Sparkles className="w-12 h-12 text-indigo-400" />,
      desc: 'System będzie na bieżąco przeliczał zyski ze wszystkich pozycji (USD, PLN, EUR, krypto) na wybraną bazę.',
      isCurrencyStep: true,
      actionLabel: 'Zakończ i uruchom aplikację'
    }
  ];

  const current = slides[step];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(pin.length === 4 ? pin : null, currency);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0B0F19] z-50 flex flex-col justify-between p-6 sm:p-10 text-white overflow-hidden select-none">
      {/* Decorative gradient radial lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Slide Navigation Progress markers */}
      <div className="w-full max-w-md mx-auto pt-4 flex items-center justify-between gap-2">
        {slides.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              idx <= step ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-800'
            }`}
          />
        ))}
      </div>

      {/* Main Container Slide Info */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center text-center my-auto relative z-10 animate-fade-in">
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800/80 mb-6 shadow-xl">
          {current.icon}
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          {current.title}
        </h2>
        <p className="text-xs font-bold text-amber-400 mt-1 uppercase tracking-wider">
          {current.subtitle}
        </p>

        <p className="text-sm text-slate-400 mt-4 leading-relaxed px-2">
          {current.desc}
        </p>

        {/* Dynamic Inner Configuration fields */}
        {current.isPinStep && (
          <div className="mt-6 w-full max-w-xs">
            <label className="block text-xs text-slate-400 mb-2 font-medium">
              Czterocyfrowy kod PIN (opcjonalny)
            </label>
            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center bg-slate-900 border border-slate-800 rounded-xl py-3 text-2xl tracking-[0.5em] font-black text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
            />
            <p className="text-[11px] text-slate-500 mt-2">
              Pozostaw puste, jeśli nie chcesz blokady ekranu.
            </p>
          </div>
        )}

        {current.isCurrencyStep && (
          <div className="mt-6 w-full grid grid-cols-3 gap-3">
            {(['PLN', 'USD', 'EUR'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`p-4 rounded-xl border font-black text-lg transition-all ${
                  currency === curr
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 scale-105 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer trigger buttons */}
      <div className="w-full max-w-md mx-auto pb-4">
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm tracking-wide uppercase transition-all shadow-lg flex items-center justify-center gap-2"
        >
          {current.actionLabel}
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>

        {step < slides.length - 1 && (
          <button
            onClick={() => setStep(slides.length - 1)}
            className="w-full text-center text-xs text-slate-600 hover:text-slate-400 mt-3 tracking-wide"
          >
            Pomiń wprowadzenie
          </button>
        )}
      </div>
    </div>
  );
};
