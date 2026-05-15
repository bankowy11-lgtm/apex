import React from 'react';

interface FearAndGreedProps {
  score?: number; // 0 to 100
}

export const FearAndGreed: React.FC<FearAndGreedProps> = ({ score = 72 }) => {
  const getStatus = (s: number) => {
    if (s >= 75) return { label: 'Ekstremalna Chciwość', color: '#10B981', desc: 'Rynki są przegrzane. Możliwa korekta.' };
    if (s >= 55) return { label: 'Chciwość', color: '#34D399', desc: 'Inwestorzy chętnie kupują ryzykowne aktywa.' };
    if (s >= 45) return { label: 'Neutralny', color: '#FBBF24', desc: 'Stan równowagi sił popytu i podaży.' };
    if (s >= 25) return { label: 'Strach', color: '#F87171', desc: 'Wzrost awersji do ryzyka. Spadki wycen.' };
    return { label: 'Ekstremalny Strach', color: '#EF4444', desc: 'Panika rynkowa. Dobre okazje zakupowe.' };
  };

  const status = getStatus(score);

  // Gauge calculation
  const radius = 50;
  const circumference = Math.PI * radius; // half circle gauge
  const fillPercentage = (score / 100) * circumference;

  return (
    <div className="bg-[#131B2C]/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-xl text-center flex flex-col justify-between">
      <h3 className="text-sm font-bold text-slate-300 tracking-wide uppercase mb-2 text-left flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
        Fear & Greed Index
      </h3>

      <div className="relative flex flex-col items-center my-3">
        {/* SVG Semi-circle progress gauge */}
        <svg width="140" height="75" viewBox="0 0 120 65" className="overflow-visible">
          {/* Background track */}
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="#1E293B"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Score active track */}
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke={status.color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - fillPercentage}
            className="transition-all duration-700"
          />
        </svg>

        {/* Absolute center indicator score */}
        <div className="absolute bottom-1 flex flex-col items-center">
          <span className="text-3xl font-black tracking-tight" style={{ color: status.color }}>
            {score}
          </span>
          <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded mt-0.5 bg-slate-900/80 text-slate-200 border border-slate-800">
            {status.label}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-2 px-1 leading-relaxed bg-slate-900/40 p-2 rounded-lg border border-slate-800/40">
        {status.desc}
      </p>
    </div>
  );
};
