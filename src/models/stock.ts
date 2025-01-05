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
  rsRating: number;
  rsRating3M: number;
  rsRating6M: number;
  rsRating1Y: number;
  sectorRank: number;
  industryRank: number;
}
