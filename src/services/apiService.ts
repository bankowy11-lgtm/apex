import { AssetPosition, Portfolio, MarketAlert, TickerSuggestion } from '../types';
import { DEFAULT_PORTFOLIOS, INITIAL_POSITIONS, INITIAL_ALERTS, GLOBAL_TICKERS } from '../storage/defaultData';

const STORAGE_KEYS = {
  PORTFOLIOS: 'apex_portfolios',
  POSITIONS: 'apex_positions',
  ALERTS: 'apex_alerts',
  PIN: 'apex_app_pin',
  SETTINGS: 'apex_settings',
  ONBOARDED: 'apex_onboarded',
  CACHE_TIMESTAMP: 'apex_cache_time'
};

export interface UserSettings {
  currency: 'PLN' | 'USD' | 'EUR';
  darkMode: boolean;
  biometricEnabled: boolean;
  pushNotifications: boolean;
  autoRefresh: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  currency: 'PLN',
  darkMode: true,
  biometricEnabled: true,
  pushNotifications: true,
  autoRefresh: true
};

// Fixed conversion rates for premium preview
export const CONVERSION_RATES: Record<string, number> = {
  USD: 3.98,
  EUR: 4.32,
  PLN: 1.00
};

export class ApiService {
  static getPortfolios(): Portfolio[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PORTFOLIOS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Storage warning", e);
    }
    this.savePortfolios(DEFAULT_PORTFOLIOS);
    return DEFAULT_PORTFOLIOS;
  }

  static savePortfolios(portfolios: Portfolio[]) {
    localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(portfolios));
  }

  static getPositions(): AssetPosition[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.POSITIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Storage warning", e);
    }
    this.savePositions(INITIAL_POSITIONS);
    return INITIAL_POSITIONS;
  }

  static savePositions(positions: AssetPosition[]) {
    localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions));
  }

  static getAlerts(): MarketAlert[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    this.saveAlerts(INITIAL_ALERTS);
    return INITIAL_ALERTS;
  }

  static saveAlerts(alerts: MarketAlert[]) {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }

  static getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return DEFAULT_SETTINGS;
  }

  static saveSettings(settings: UserSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  static getPin(): string | null {
    return localStorage.getItem(STORAGE_KEYS.PIN);
  }

  static setPin(pin: string) {
    localStorage.setItem(STORAGE_KEYS.PIN, pin);
  }

  static clearPin() {
    localStorage.removeItem(STORAGE_KEYS.PIN);
  }

  static isOnboarded(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === 'true';
  }

  static setOnboarded() {
    localStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
  }

  // Ticker Auto-complete search API simulation
  static searchTickers(query: string): TickerSuggestion[] {
    if (!query) return [];
    const q = query.toLowerCase().trim();
    return GLOBAL_TICKERS.filter(t => 
      t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
    );
  }

  // Refresh prices online / cached fallback simulation
  static async refreshLivePrices(): Promise<boolean> {
    // Simulate Yahoo Finance / CoinGecko network request delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const positions = this.getPositions();
    let updated = false;

    const newPositions = positions.map(pos => {
      // Simulate micro market volatility (-1.5% to +2.5%)
      const changePercent = (Math.random() * 4 - 1.5) / 100;
      const newPrice = Number((pos.currentPrice * (1 + changePercent)).toFixed(2));
      
      // Update historical stream
      const newHist = [...pos.history24h.slice(1), newPrice];

      updated = true;
      return {
        ...pos,
        currentPrice: newPrice,
        history24h: newHist
      };
    });

    if (updated) {
      this.savePositions(newPositions);
      localStorage.setItem(STORAGE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
    }
    return true;
  }

  // Convert custom value to requested base currency
  static convertTo(amount: number, fromCurr: string, toCurr: string): number {
    if (fromCurr === toCurr) return amount;
    // Base is PLN
    let inPln = amount;
    if (fromCurr !== 'PLN') {
      const rate = CONVERSION_RATES[fromCurr] || 1;
      inPln = amount * rate;
    }
    if (toCurr === 'PLN') return inPln;
    const targetRate = CONVERSION_RATES[toCurr] || 1;
    return inPln / targetRate;
  }

  // Data import/export helper
  static exportStateJson(): string {
    const state = {
      portfolios: this.getPortfolios(),
      positions: this.getPositions(),
      alerts: this.getAlerts(),
      settings: this.getSettings()
    };
    return JSON.stringify(state, null, 2);
  }

  static importStateJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.portfolios) this.savePortfolios(data.portfolios);
      if (data.positions) this.savePositions(data.positions);
      if (data.alerts) this.saveAlerts(data.alerts);
      if (data.settings) this.saveSettings(data.settings);
      return true;
    } catch (e) {
      return false;
    }
  }

  static exportCsv(): string {
    const positions = this.getPositions();
    let csv = 'ID,Portfolio,Ticker,Nazwa,Kategoria,Ilosc,CenaZakupu,ObecnaCena,Waluta,DataZakupu,Prowizja,Notatki\n';
    positions.forEach(p => {
      csv += `"${p.id}","${p.portfolioId}","${p.ticker}","${p.name}","${p.category}",${p.shares},${p.buyPrice},${p.currentPrice},"${p.currency}","${p.purchaseDate}",${p.commission},"${(p.notes || '').replace(/"/g, '""')}"\n`;
    });
    return csv;
  }
}
