export type AssetCategory = 
  | 'stocks_us' 
  | 'stocks_pl' 
  | 'etf' 
  | 'crypto' 
  | 'gold' 
  | 'silver' 
  | 'forex' 
  | 'bonds';

export interface AssetPosition {
  id: string;
  portfolioId: string;
  ticker: string;
  name: string;
  category: AssetCategory;
  shares: number;
  buyPrice: number;
  currentPrice: number;
  currency: string;
  purchaseDate: string;
  commission: number;
  notes?: string;
  customIcon?: string;
  // Historical prices for sparkline / mini chart
  history24h: number[];
}

export interface Portfolio {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface MarketAlert {
  id: string;
  ticker: string;
  name: string;
  type: 'price_above' | 'price_below' | 'percent_change' | 'dividend';
  targetValue: number;
  currentValue: number;
  triggered: boolean;
  active: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  url: string;
}

export interface DividendEvent {
  id: string;
  ticker: string;
  company: string;
  exDate: string;
  payDate: string;
  amount: number;
  currency: string;
}

export interface EarningEvent {
  id: string;
  ticker: string;
  company: string;
  date: string;
  estimatedEps: number;
}

export interface AIInsight {
  id: string;
  type: 'diversification' | 'risk' | 'trend' | 'sentiment' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionSuggested?: string;
}

export interface TickerSuggestion {
  symbol: string;
  name: string;
  category: AssetCategory;
  price: number;
  currency: string;
  change24h: number;
}
