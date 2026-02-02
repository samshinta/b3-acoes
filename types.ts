
export interface StockDataPoint {
  date: string;
  price: number;
  type: 'historical' | 'predicted';
}

export interface AnalysisResult {
  ticker: string;
  companyName: string;
  currentPrice: number;
  currency: string;
  forecast: StockDataPoint[];
  summary: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  percentageChange: number;
  confidenceScore: number; // Probability of accuracy in %
  pythonLogic: string;
  sources: { title: string; uri: string }[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
