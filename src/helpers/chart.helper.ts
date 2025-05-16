import { bisectCenter, format, utcFormat } from 'd3';
import { XScale } from '@/types/stock-chart';
import { getCssVar } from '@/utils/common.utils';

export const getBitmapPixel = (pixel: number) => {
  return Math.ceil(pixel * (devicePixelRatio || 1));
};

export const priceFormat = (max: number) => (value: d3.NumberValue) => {
  const price = value as number;
  return max > 1000 ? format('.2f')(price / 1000) + 'k' : format(',.2f')(price);
};

export const priceOverlayFormat = (value: d3.NumberValue) => {
  const price = value as number;
  return price > 1000 ? format(',.0f')(price) : format('.2f')(price);
};

export const dateFormat = (date: Date) => {
  const fnc = date.getMonth() === 0 ? utcFormat('%Y') : utcFormat('%b');
  return fnc(date);
};

export const dateOverlayFormat = utcFormat("%a %d %b '%y");

export const dateTicks = (dates: Date[]) => {
  const dateSet: string[] = [];
  return dates.filter((date) => {
    const key = `${date.getMonth()},${date.getFullYear()}`;
    if (dateSet.includes(key)) {
      return false;
    } else {
      dateSet.push(key);
      return true;
    }
  });
};

export const logTicks = (min: number, max: number) => {
  const noOfTicks = 9;
  const multiplier = (max / min) ** (1 / noOfTicks);
  const ticks = [];
  let start = min;
  for (let i = 1; i <= noOfTicks; i++) {
    ticks.push(max < 10 ? start : Math.round(start));
    start *= multiplier;
  }
  return [...new Set(ticks)].slice(1);
};

export const getInvertXScale = (xScale: XScale) => {
  const domain = xScale.domain();
  const xList = domain.map((d) => xScale(d) ?? 0);
  return (x: number) => {
    const idx = bisectCenter(xList, x);
    return [xList[idx], domain[idx], idx] as const;
  };
};

export const getChartColors = () => {
  return {
    up: getCssVar('--chakra-colors-black'),
    down: getCssVar('--chakra-colors-red-400'),
    ema21: getCssVar('--chakra-colors-gray-300'),
    ema50: getCssVar('--chakra-colors-gray-400'),
    ema200: getCssVar('--chakra-colors-gray-600'),
    rs: getCssVar('--chakra-colors-blue-500'),
    label: getCssVar('--chakra-colors-black'),
    crosshair: getCssVar('--chakra-colors-gray-400'),
    overlayText: getCssVar('--chakra-colors-white'),
    overlayBg: getCssVar('--chakra-colors-gray-700'),
    pocketPivotVolume: getCssVar('--chakra-colors-blue-500'),
    gainerVolume: getCssVar('--chakra-colors-teal-500'),
    loserVolume: getCssVar('--chakra-colors-red-400'),
    normalVolume: getCssVar('--chakra-colors-gray-200'),
    rsNewHigh: getCssVar('--colors-rs-new-high'),
    rsNewHighBeforePrice: getCssVar('--colors-rs-new-high-before-price')
  };
};
