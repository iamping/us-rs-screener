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

export type XScale = d3.ScaleBand<Date>;
export type YScale = d3.ScaleLogarithmic<number, number>;
export type VolScale = d3.ScaleLinear<number, number>;
export type RsScale = d3.ScaleLinear<number, number>;

export interface ChartScales {
  xScale: XScale;
  yScale: YScale;
  volumeScale: VolScale;
  rsScale: RsScale;
}

export type CanvasDimensions = {
  bitmapWidth: number;
  bitmapHeight: number;
  cssWidth: number;
  cssHeight: number;
};
