import React, { useState } from 'react';

interface AllocationItem {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

interface AllocationChartProps {
  items: AllocationItem[];
  title?: string;
}

export const AllocationChart: React.FC<AllocationChartProps> = ({
  items = [],
  title = 'Alokacja Portfela'
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = items.reduce((acc, item) => acc + item.value, 0) || 1;

  // Process item slices
  let cumulativeAngle = 0;
  const slices = items.map((item, idx) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle: cumulativeAngle,
      index: idx
    };
  });

  // SVG helper to calculate path coordinate
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  const describeArc = (x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) => {
    // Check if full circle
    const isFullCircle = endAngle - startAngle >= 359.9;
    if (isFullCircle) {
      // Draw two arcs to make full donut
      const p1 = polarToCartesian(x, y, outerRadius, 0);
      const p2 = polarToCartesian(x, y, outerRadius, 180);
      const p3 = polarToCartesian(x, y, innerRadius, 180);
      const p4 = polarToCartesian(x, y, innerRadius, 0);

      return [
        `M ${p1.x} ${p1.y}`,
        `A ${outerRadius} ${outerRadius} 0 1 1 ${p2.x} ${p2.y}`,
        `A ${outerRadius} ${outerRadius} 0 1 1 ${p1.x} ${p1.y}`,
        `M ${p4.x} ${p4.y}`,
        `A ${innerRadius} ${innerRadius} 0 1 0 ${p3.x} ${p3.y}`,
        `A ${innerRadius} ${innerRadius} 0 1 0 ${p4.x} ${p4.y}`,
        'Z'
      ].join(' ');
    }

    const startOuter = polarToCartesian(x, y, outerRadius, endAngle);
    const endOuter = polarToCartesian(x, y, outerRadius, startAngle);
    const startInner = polarToCartesian(x, y, innerRadius, endAngle);
    const endInner = polarToCartesian(x, y, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y}`,
      `L ${endInner.x} ${endInner.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${startInner.x} ${startInner.y}`,
      'Z'
    ].join(' ');
  };

  const size = 200;
  const center = size / 2;
  const baseOuterRadius = 90;
  const baseInnerRadius = 65;

  return (
    <div className="bg-[#131B2C]/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-bold text-slate-300 tracking-wide uppercase mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          {title}
        </h3>

        {items.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-500 text-xs italic">
            Brak aktywów do alokacji
          </div>
        ) : (
          <div className="relative flex items-center justify-center my-2">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
              {slices.map(slice => {
                const isHovered = hoveredIndex === slice.index;
                const outerR = isHovered ? baseOuterRadius + 6 : baseOuterRadius;
                const innerR = isHovered ? baseInnerRadius - 3 : baseInnerRadius;

                return (
                  <path
                    key={slice.index}
                    d={describeArc(center, center, innerR, outerR, slice.startAngle, slice.endAngle)}
                    fill={slice.color}
                    className="transition-all duration-300 cursor-pointer stroke-[#131B2C] stroke-2"
                    onMouseEnter={() => setHoveredIndex(slice.index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </svg>

            {/* Inner Center Content preview */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                {hoveredIndex !== null ? slices[hoveredIndex].label : 'Całość'}
              </span>
              <span className="text-base font-extrabold text-white mt-0.5">
                {hoveredIndex !== null 
                  ? `${slices[hoveredIndex].percentage.toFixed(1)}%` 
                  : '100%'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend Grid below */}
      {items.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-x-3 gap-y-2">
          {slices.map((slice) => (
            <div
              key={slice.index}
              onMouseEnter={() => setHoveredIndex(slice.index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center justify-between p-1 rounded transition-colors cursor-pointer text-xs ${
                hoveredIndex === slice.index ? 'bg-slate-800/80 font-bold' : 'hover:bg-slate-900/40'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-slate-300 truncate">{slice.label}</span>
              </div>
              <span className="text-slate-400 font-semibold pl-1">
                {slice.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
