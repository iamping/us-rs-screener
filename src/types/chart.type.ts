import { Stock } from './stock.type';

export interface HistoricalData {
  date: number[];
  close: number[];
  high: number[];
  low: number[];
  open: number[];
  volume: number[];
}

export interface StockChartData {
  stock: Stock;
  series: StockDataPoint[];
  isDaily: boolean;
}

export interface StockDataPoint {
  isDaily: boolean;
  isThink40: boolean;
  date: Date;
  close: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  relativeVolume: number;
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

export type BandScale = d3.ScaleBand<Date>;
export type LogScale = d3.ScaleLogarithmic<number, number>;
export type LinearScale = d3.ScaleLinear<number, number>;

export interface ChartScales {
  xScale: LinearScale;
  yScale: LogScale;
  volumeScale: LinearScale;
  rsScale: LinearScale;
}

export type CanvasDimensions = {
  bitmapWidth: number;
  bitmapHeight: number;
  cssWidth: number;
  cssHeight: number;
};

export type DataPoint = {
  index: number;
  x: number;
  priceY: number;
  volumeY: number;
  price: number;
  volume: number;
  date: Date;
  px: number;
  py: number;
};
