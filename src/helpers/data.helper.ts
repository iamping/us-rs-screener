import { HistoricalData, StockDataPoint } from '@/types/chart.type';
import { findMax, getISOWeekAndYear } from '@/utils/common.utils';

export const calculateEMA = (values: number[], period: number) => {
  const k = 2 / (period + 1);
  const emaArray: Array<number | null> = [];
  let previousEma = 0;
  values.forEach((value, index) => {
    if (index < period - 1) {
      emaArray.push(null);
    } else if (index === period - 1) {
      // first ema value = simple ma
      const sum = values.slice(0, period).reduce((pre, current) => pre + current, 0);
      previousEma = sum / period;
      emaArray.push(previousEma);
    } else {
      const ema = value * k + previousEma * (1 - k);
      emaArray.push(ema);
      previousEma = ema;
    }
  });
  return emaArray;
};

export const calculateSMA = (values: number[], period: number, fillNull = false) => {
  const smaArray: Array<number | null> = [];
  values.forEach((_, index) => {
    if (index < period - 1) {
      smaArray.push(null);
    } else {
      const sum = values.slice(index + 1 - period, index + 1).reduce((pre, current) => pre + current, 0);
      smaArray.push(sum / period);
    }
  });
  if (fillNull) {
    const firstNotNull = smaArray.find((e) => e) ?? 0;
    return smaArray.map((e) => e ?? firstNotNull);
  }
  return smaArray;
};

export const computeDataSeries = (stockData: HistoricalData, spyData: HistoricalData, isDaily: boolean) => {
  const series: StockDataPoint[] = [];
  const spyPriceData = spyData.close.slice(-stockData.close.length);
  const len = stockData.date.length;
  const ema10 = calculateEMA(stockData.close, 10);
  const ema21 = calculateEMA(stockData.close, 21);
  const ema40 = calculateEMA(stockData.close, 40);
  const ema50 = calculateEMA(stockData.close, 50);
  const ema200 = calculateEMA(stockData.close, 200);
  const volSma10 = calculateSMA(stockData.volume, 10, true);
  const volSma50 = calculateSMA(stockData.volume, 50, true);
  const rsLine = stockData.close.map((d, i) => d / spyPriceData[i]);
  const pocketPivotPeriod = 10;
  const showRsNewhighPeriod = 20;
  const newHighPeriod = 252;
  const volumeSlice: { volume: number; isLoser: boolean }[] = [];
  // const volumeData = stockData.volume.map(d => ({volume: d, isLoser: false}))
  for (let i = 0; i < len; i++) {
    const change = i === 0 ? 0 : stockData.close[i] - stockData.close[i - 1];
    // find pocket pivot volume
    // volumeData[i].isLoser = change >= 0;
    const volumeStatus = { isPocketPivot: false, isGainer: false, isLoser: false };
    const [vol, avgVol] = [stockData.volume[i], isDaily ? volSma50[i]! : volSma10[i]!];
    const isVolumeDataEnough = i >= pocketPivotPeriod;
    if (isVolumeDataEnough) {
      const volumeLosingDay = volumeSlice.filter((e) => e.isLoser).sort((a, b) => Number(b.volume) - Number(a.volume));
      const maxVolumeOnLosingDay = volumeLosingDay[0]?.volume ?? 0;
      const isGainer = change >= 0;
      const isGreatVolume = vol > avgVol;
      const isVolumeGreaterThanLosingDay = vol > maxVolumeOnLosingDay;
      volumeStatus.isPocketPivot = isDaily && isGreatVolume && isGainer && isVolumeGreaterThanLosingDay;
      volumeStatus.isGainer = isGainer && isGreatVolume;
      volumeStatus.isLoser = !isGainer && isGreatVolume;
      volumeSlice.shift();
    }
    volumeSlice.push({ volume: vol, isLoser: change < 0 });

    // find rs new high
    const rsStatus = { isNewHigh: false, isNewHighBeforePrice: false };
    const isRsDataEnough = i >= newHighPeriod;
    if (isRsDataEnough && isDaily) {
      const rsSlide = rsLine.slice(i - newHighPeriod, i);
      const priceSlide = stockData.high.slice(i - newHighPeriod, i);
      const preMaxRs = findMax(rsSlide);
      const preMaxHigh = findMax(priceSlide);
      rsStatus.isNewHigh = i >= len - showRsNewhighPeriod ? rsLine[i] > preMaxRs : false;
      rsStatus.isNewHighBeforePrice = rsLine[i] > preMaxRs && stockData.high[i] <= preMaxHigh;
    }

    series.push({
      isDaily,
      close: stockData.close[i],
      high: stockData.high[i],
      low: stockData.low[i],
      open: stockData.open[i],
      volume: stockData.volume[i],
      date: new Date(stockData.date[i] * 1000),
      ema10: ema10[i],
      ema21: ema21[i],
      ema40: ema40[i],
      ema50: ema50[i],
      ema200: ema200[i],
      rs: rsLine[i],
      change: change,
      changePercent: i === 0 ? 0 : (change / stockData.close[i - 1]) * 100,
      volumeStatus,
      rsStatus
    });
  }
  return series;
};

export const convertDailyToWeekly = (data: HistoricalData) => {
  const weekMap: Record<
    string,
    { date: number; high: number; low: number; open: number; close: number; noOfDays: number; volume: number }
  > = {};
  data.date.forEach((d, i) => {
    const currentDate = new Date(d * 1000);
    const { week, year } = getISOWeekAndYear(currentDate);
    const key = `${year}-${week}`;
    if (weekMap[key]) {
      const weekData = weekMap[key];
      weekData.high = Math.max(weekData.high, data.high[i]);
      weekData.low = Math.min(weekData.low, data.low[i]);
      weekData.close = data.close[i];
      weekData.volume += data.volume[i];
      weekData.noOfDays += 1;
    } else {
      weekMap[key] = {
        date: data.date[i],
        high: data.high[i],
        low: data.low[i],
        open: data.open[i],
        close: data.close[i],
        volume: data.volume[i],
        noOfDays: 1
      };
    }
  });
  // skip first week data if less than 5 days of data
  const values = Object.values(weekMap).filter((d, i) => (i === 0 && d.noOfDays === 5) || i > 0);
  return {
    date: values.flatMap((d) => d.date),
    high: values.flatMap((d) => d.high),
    low: values.flatMap((d) => d.low),
    open: values.flatMap((d) => d.open),
    close: values.flatMap((d) => d.close),
    volume: values.flatMap((d) => d.volume)
  } as HistoricalData;
};
