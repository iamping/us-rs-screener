import { HistoricalData, StockDataPoint } from '@/types/chart.type';
import { Stock } from '@/types/stock.type';
import { findMax, getISOWeekAndYear, getNextDates, getPreviousDates } from '@/utils/common.utils';

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
  if (values.length < period) {
    const sum = values.reduce((pre, current) => pre + current, 0);
    values.forEach(() => {
      smaArray.push(sum / values.length);
    });
  } else {
    values.forEach((_, index) => {
      if (index < period - 1) {
        smaArray.push(null);
      } else {
        const sum = values.slice(index + 1 - period, index + 1).reduce((pre, current) => pre + current, 0);
        smaArray.push(sum / period);
      }
    });
  }
  if (fillNull) {
    const firstNotNull = smaArray.find((e) => e) ?? 0;
    return smaArray.map((e) => e ?? firstNotNull);
  }
  return smaArray;
};

export const computeDataSeries = (
  stockData: HistoricalData,
  spyData: HistoricalData,
  isDaily: boolean,
  dailySpyLength: number
) => {
  const series: StockDataPoint[] = [];
  const spyPriceData = spyData.close.slice(-stockData.close.length);
  const spyLength = spyData.close.length;
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
  const think40Period = 40;
  const volumeSlice: { volume: number; isLoser: boolean }[] = [];
  for (let i = 0; i < len; i++) {
    const change = i === 0 ? 0 : stockData.close[i] - stockData.close[i - 1];
    // find pocket pivot volume
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

    // find 40 day new high
    let isThink40 = false;
    const isPriceDataEnough = i >= think40Period;
    if (isPriceDataEnough) {
      const priceSlide = stockData.high.slice(i - think40Period, i);
      const preMaxHigh = findMax(priceSlide);
      isThink40 = stockData.high[i] > preMaxHigh;
    }

    series.push({
      isDaily,
      isThink40: isDaily && isThink40,
      close: stockData.close[i],
      high: stockData.high[i],
      low: stockData.low[i],
      open: stockData.open[i],
      volume: stockData.volume[i],
      relativeVolume: stockData.volume[i] / avgVol,
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

  // add dummy data point
  const dummyBeforeSeries = [];
  const dummyAfterSeries = [];
  if (isDaily) {
    const previousDates = getPreviousDates(new Date(spyData.date[0] * 1000), 1);
    const nextDates = getNextDates(new Date(spyData.date[spyLength - 1] * 1000), 1);
    dummyBeforeSeries.push(...buildDummyDataPoint(previousDates, isDaily));
    if (spyLength !== len) {
      const diffLength = spyLength - len;
      const spyDates = spyData.date.filter((_, i) => i < diffLength).map((it) => new Date(it * 1000));
      dummyBeforeSeries.push(...buildDummyDataPoint(spyDates, isDaily));
      dummyAfterSeries.push(...buildDummyDataPoint(nextDates, isDaily));
    } else {
      dummyBeforeSeries.push(...buildDummyDataPoint(previousDates, isDaily));
    }
  } else {
    const diffLength = dailySpyLength - len;
    const previousWeeks = getPreviousDates(new Date(stockData.date[0] * 1000), 1 + diffLength, true);
    const nextWeeks = getNextDates(new Date(stockData.date[spyLength - 1] * 1000), 1, true);
    dummyBeforeSeries.push(...buildDummyDataPoint(previousWeeks, isDaily));
    dummyAfterSeries.push(...buildDummyDataPoint(nextWeeks, isDaily));
  }

  return dummyBeforeSeries.concat(series).concat(dummyAfterSeries);
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

export const dataMapping = (stocks: Stock[]) => {
  return stocks.map((e, i) => ({
    ...e,
    pocketPivot: e.pocketPivot === 0 ? 'No' : 'Yes',
    rsNewHigh: e.rsNewHigh === 0 ? 'No' : e.rsNewHigh === 1 ? 'New High' : 'Before Price',
    tightRange: e.tightRange === 0 ? 'No' : 'Yes',
    insideDay: e.insideDay === 0 ? 'No' : 'Yes',
    think40: e.think40 === 0 ? 'No' : 'Yes',
    episodicPivot: e.episodicPivot === 0 ? 'No' : 'Yes',
    key: i + 1
  }));
};

const buildDummyDataPoint = (dates: Date[], isDaily: boolean) => {
  return dates.map((date) => {
    return {
      isDaily,
      isThink40: false,
      close: 0,
      high: 0,
      low: 0,
      open: 0,
      volume: 0,
      relativeVolume: 0,
      date: date,
      ema10: 0,
      ema21: 0,
      ema40: 0,
      ema50: 0,
      ema200: 0,
      rs: 0,
      change: 0,
      changePercent: 0,
      volumeStatus: { isPocketPivot: false, isGainer: false, isLoser: false },
      rsStatus: { isNewHigh: false, isNewHighBeforePrice: false }
    } as StockDataPoint;
  });
};
