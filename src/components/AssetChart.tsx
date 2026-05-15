import React, { useState } from 'react';

interface AssetChartProps {
  dataPoints: number[];
  labels?: string[];
  color?: string; // primary line color e.g. #10B981
  isCandlestickAvailable?: boolean;
  baseCurrency?: string;
}

const TIMEFRAMES = ['1D', '1W', '1M', '3M', '1Y', 'MAX'];

export const AssetChart: React.FC<AssetChartProps> = ({
  dataPoints = [100, 105, 102, 110, 108, 115, 120],
  color = '#10B981', // Neon green default
  isCandlestickAvailable = true,
  baseCurrency = 'PLN'
}) => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'MAX'>('1M');
  const [chartType, setChartType] = useState<'area' | 'candlestick'>('area');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Generate extended realistic curve base depending on timeframe
  const getExtendedPoints = () => {
    let count = dataPoints.length;
    if (timeframe === '1D') count = Math.min(6, dataPoints.length);
    else if (timeframe === '1W') count = Math.min(12, dataPoints.length * 2);
    else if (timeframe === '1M') count = 20;
    else if (timeframe === '3M') count = 30;
    else if (timeframe === '1Y') count = 45;
    else count = 60;

    // Build synthesized premium preview line based on provided core anchor values
    const result: number[] = [];
    const base = dataPoints[0] || 100;
    const final = dataPoints[dataPoints.length - 1] || 120;
    const diff = final - base;

    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1 || 1);
      // add natural curve wave + noise
      const wave = Math.sin(progress * Math.PI * 2.5) * (diff * 0.15);
      const noise = (Math.random() - 0.5) * (base * 0.02);
      const val = base + diff * progress + wave + noise;
      result.push(Math.max(0.1, Number(val.toFixed(2))));
    }
    // Ensure final point matches exactly current asset worth
    result[result.length - 1] = final;
    return result;
  };

  const points = getExtendedPoints();
  const minVal = Math.min(...points) * 0.98;
  const maxVal = Math.max(...points) * 1.02;
  const range = maxVal - minVal || 1;

  // SVG Drawing layout constraints
  const width = 600;
  const height = 240;
  const padding = 20;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  // Map array into SVG coordinate points
  const mappedPoints = points.map((val, idx) => {
    const x = padding + (idx / (points.length - 1 || 1)) * chartW;
    const y = height - padding - ((val - minVal) / range) * chartH;
    return { x, y, val };
  });

  const pathD = mappedPoints.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Fill path for area gradient ending at bottom
  const areaD = `${pathD} L ${mappedPoints[mappedPoints.length - 1].x} ${height - padding} L ${mappedPoints[0].x} ${height - padding} Z`;

  // Candlestick helpers
  const renderCandlesticks = () => {
    return mappedPoints.map((p, idx) => {
      if (idx === 0) return null;
      const prev = mappedPoints[idx - 1];
      const isUp = p.val >= prev.val;
      const rectColor = isUp ? '#10B981' : '#EF4444';
      
      // Calculate open, close, high, low simulation
      const openY = prev.y;
      const closeY = p.y;
      const topY = Math.min(openY, closeY) - Math.random() * 8;
      const bottomY = Math.max(openY, closeY) + Math.random() * 8;
      const candleW = Math.max(3, chartW / points.length * 0.6);

      return (
        <g key={idx} className="transition-all duration-300">
          {/* Wick */}
          <line x1={p.x} y1={topY} x2={p.x} y2={bottomY} stroke={rectColor} strokeWidth="1.5" />
          {/* Body */}
          <rect
            x={p.x - candleW / 2}
            y={Math.min(openY, closeY)}
            width={candleW}
            height={Math.max(2, Math.abs(closeY - openY))}
            fill={rectColor}
            rx="1"
          />
          {/* Transparent interactive target */}
          <rect
            x={p.x - candleW}
            y={0}
            width={candleW * 2}
            height={height}
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => setHoverIndex(idx)}
            onMouseLeave={() => setHoverIndex(null)}
          />
        </g>
      );
    });
  };

  const activePoint = hoverIndex !== null ? mappedPoints[hoverIndex] : mappedPoints[mappedPoints.length - 1];
  const percentChangeFromStart = ((activePoint.val - points[0]) / points[0]) * 100;
  const isPositive = percentChangeFromStart >= 0;

  return (
    <div className="bg-[#131B2C]/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-2xl">
      {/* Background glow decoration */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Wartość / Wykres ({timeframe})
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activePoint.val.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} {baseCurrency}
            </span>
            <span className={`text-xs sm:text-sm font-bold px-2 py-0.5 rounded-full ${
              isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {isPositive ? '+' : ''}{percentChangeFromStart.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              chartType === 'area' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Linia / Area
          </button>
          {isCandlestickAvailable && (
            <button
              onClick={() => setChartType('candlestick')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                chartType === 'candlestick' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Świece
            </button>
          )}
        </div>
      </div>

      {/* Actual interactive SVG graph canvas */}
      <div className="relative w-full mt-2">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto drop-shadow-md overflow-visible"
        >
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="80%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines background */}
          {[0.25, 0.5, 0.75].map((ratio, i) => (
            <line
              key={i}
              x1={padding}
              y1={padding + ratio * chartH}
              x2={width - padding}
              y2={padding + ratio * chartH}
              stroke="#1E293B"
              strokeDasharray="4 4"
              strokeWidth="1"
              opacity="0.6"
            />
          ))}

          {chartType === 'area' ? (
            <>
              {/* Shaded bottom area */}
              <path d={areaD} fill={`url(#gradient-${color})`} />
              
              {/* Premium curved line stroke */}
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />

              {/* Hover active highlight target dot */}
              {hoverIndex !== null && (
                <g>
                  <line 
                    x1={activePoint.x} 
                    y1={padding} 
                    x2={activePoint.x} 
                    y2={height - padding} 
                    stroke="#475569" 
                    strokeDasharray="2 2"
                  />
                  <circle 
                    cx={activePoint.x} 
                    y={activePoint.y} 
                    r="6" 
                    fill={color} 
                    className="animate-pulse" 
                  />
                  <circle 
                    cx={activePoint.x} 
                    cy={activePoint.y} 
                    r="3" 
                    fill="#ffffff" 
                  />
                </g>
              )}

              {/* Invisible interactive overlay triggers for pure Area Line Tooltips */}
              {mappedPoints.map((p, idx) => (
                <rect
                  key={idx}
                  x={p.x - (chartW / points.length) / 2}
                  y={0}
                  width={chartW / points.length}
                  height={height}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoverIndex(idx)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
              ))}
            </>
          ) : (
            renderCandlesticks()
          )}
        </svg>

        {/* Floating tooltip guide info */}
        {hoverIndex !== null && (
          <div className="absolute top-2 right-2 bg-slate-900/95 border border-slate-700/80 px-2.5 py-1 rounded text-[11px] text-slate-300 pointer-events-none shadow-lg animate-fade-in backdrop-blur-md">
            Wartość: <span className="font-bold text-white">{activePoint.val} {baseCurrency}</span>
          </div>
        )}
      </div>

      {/* Timeframe Navigation bar */}
      <div className="flex items-center justify-between gap-1 mt-4 pt-3 border-t border-slate-800/80">
        {TIMEFRAMES.map(tf => (
          <button
            key={tf}
            onClick={() => {
              setTimeframe(tf as any);
              setHoverIndex(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeframe === tf
                ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-inner border border-slate-600/30'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>
    </div>
  );
};
