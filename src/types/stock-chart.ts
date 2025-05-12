export interface HistoricalData {
  date: number[];
  close: number[];
  high: number[];
  low: number[];
  open: number[];
  volume: number[];
}

export interface StockDataPoint {
  isDaily: boolean;
  date: Date;
  close: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  ema10: number | null;
  ema21: number | null;
  ema40: number | null;
  ema50: number | null;
  ema200: number | null;
  rs: number;
  change: number;
  changePercent: number;
  volumeStatus: { isPocketPivot: boolean; isGainer: boolean; isLoser: boolean };
  rsStatus: { isNewHigh: boolean; isNewHighBeforePrice: boolean };
}
