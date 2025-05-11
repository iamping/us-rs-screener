import { Point, PointOptionsObject, Series } from 'highcharts';

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

export interface ChartSeries {
  ohlc: Array<(number | Date)[] | PointOptionsObject>;
  volume: Array<(number | Date)[] | PointOptionsObject>;
  rs: Array<(number | Date)[] | PointOptionsObject>;
}

export type SeriePoint = Point & PointOptionsObject;

export interface CustomPoint extends Point {
  points: SeriePoint[];
}

export interface CustomSeries extends Series {
  currentDataGrouping: { unitName: string };
  groupedData: CustomPoint[];
}
