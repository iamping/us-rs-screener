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
  date: Date;
  close: number;
  high: number;
  low: number;
  open: number;
  volume: number;
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
