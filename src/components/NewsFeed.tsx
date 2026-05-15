import React from 'react';
import { NewsItem } from '../types';
import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface NewsFeedProps {
  items: NewsItem[];
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ items = [] }) => {
  const renderSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />;
      case 'bearish':
        return <TrendingDown className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />;
      default:
        return <Minus className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />;
    }
  };

  return (
    <div className="bg-[#131B2C]/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-xl">
      <h3 className="text-sm font-bold text-slate-300 tracking-wide uppercase mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Wiadomości Rynkowe
        </span>
        <span className="text-[10px] text-slate-500 font-normal">Live Stream</span>
      </h3>

      <div className="space-y-3 divide-y divide-slate-800/60 max-h-[340px] overflow-y-auto pr-1">
        {items.map((news) => (
          <div key={news.id} className="pt-3 first:pt-0 group hover:bg-slate-900/30 p-1.5 rounded transition-colors">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold text-slate-200 group-hover:text-white leading-snug line-clamp-2">
                {news.title}
              </span>
              <a
                href={news.url}
                onClick={(e) => e.preventDefault()}
                className="text-slate-500 hover:text-slate-300 mt-0.5"
                title="Czytaj pełny artykuł"
              >
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
              </a>
            </div>

            <div className="flex items-center justify-between mt-2 text-[10px]">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="font-bold text-indigo-400">{news.source}</span>
                <span>•</span>
                <span>{news.time}</span>
              </div>
              
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-800">
                {renderSentimentIcon(news.sentiment)}
                <span className="capitalize text-slate-400 font-medium text-[9px]">
                  {news.sentiment}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
