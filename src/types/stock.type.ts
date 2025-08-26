import { ReactNode } from 'react';

export interface Stock {
  key: number;
  ticker: string;
  companyName: string;
  highlightedTicker?: ReactNode | string;
  highlightedCompanyName?: ReactNode | string;
  fuzzySearchEmpty?: boolean;
  sector: string;
  industry: string;
  exchange: string;
  marketCap: number;
  close: number;
  change: number;
  percentChange: number;
  volume: number;
  avgVolume: number;
  relativeVolume: number;
  avgDollarVolume: number;
  fiftyDayAvg: number;
  twoHundredDayAvg: number;
  rsScore: number;
  rsScore3M: number;
  rsScore6M: number;
  rsScore1Y: number;
  rsSts: number;
  rsRating: number;
  rsRating3M: number;
  rsRating6M: number;
  rsRating1Y: number;
  asRating1M: number;
  asRating3M: number;
  asRating6M: number;
  asRating1Y: number;
  sectorRank: number;
  industryRank: number;
  industryRankByAs: number;
  pocketPivot: number | string;
  rsNewHigh: number | string;
  tightRange: number | string;
  insideDay: number | string;
  think40: number | string;
  episodicPivot: number | string;
  ema21: number;
  ema50: number;
  ema89: number;
  ema150: number;
  ema200: number;
  ema2001M: number;
  wk52Low: number;
  wk52High: number;
  adrPercent: number;
  rmv: number;
  atr: number;
}

export interface StockInfo {
  change: number;
  percentChange: number;
  volume: number;
}
