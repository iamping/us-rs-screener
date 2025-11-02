import {
  bisectCenter,
  extent,
  format,
  line,
  max,
  max as maxNumber,
  range,
  scaleLinear,
  scaleLog,
  utcDay,
  utcFormat
} from 'd3';
import { TouchEvent } from 'react';
import { ColorMode } from '@/components/ui/color-mode';
import {
  BandScale,
  CanvasDimensions,
  ChartScales,
  CustomLinearScale,
  DataPoint,
  DateTick,
  LinearScale,
  StockDataPoint,
  XScale,
  YScale,
  ZoomState
} from '@/types/chart.type';
import { getCssVar, isTouchDeviceMatchMedia, isWeekDay } from '@/utils/common.utils';

const isTouchDevice = isTouchDeviceMatchMedia();

export const constant = {
  barArea: 0.8,
  volumeArea: 0.2,
  rsArea: 0.3,
  rsRadius: 6,
  minBandwidth: 5,
  maxBandwidth: 150,
  maxZoom: 30.0,
  minZoom: 1.0,
  defaultZoomLevel: 2.0,
  multiplierStep: 0.02,
  maxMultipler: 0.9,
  minMultipler: 0.1,
  excessDates: 500
};

export const bitmap = (pixel: number) => {
  return Math.ceil(pixel * (devicePixelRatio || 1));
};

export const toCssWidth = (bitmap: number) => {
  return bitmap / (devicePixelRatio || 1);
};

export const priceFormat = (max: number) => (value: d3.NumberValue) => {
  const price = value as number;
  return max > 1000 ? format('.2f')(price / 1000) + 'k' : format(',.2f')(price);
};

export const volumeFormat = (val: number, precision?: number) => {
  return precision ? format(`.${precision}s`)(val).replace('G', 'B') : format('~s')(val).replace('G', 'B');
};

export const priceOverlayFormat = (value: d3.NumberValue) => {
  const price = value as number;
  return price > 1000 ? format(',.0f')(price) : format('.2f')(price);
};

export const dateFormat = (dateTick: DateTick) => {
  const fnc = dateTick.displayYear ? utcFormat('%Y') : dateTick.displayMonth ? utcFormat('%b') : utcFormat('%e');
  return fnc(dateTick.date);
};

export const dateOverlayFormat = utcFormat("%a %d %b '%y");

export const dateTicks = (series: StockDataPoint[], bandwidth: number) => {
  const dates = series.map((e) => e.date);
  const dateSet: string[] = [];
  const dateGroup: Record<string, DateTick[]> = {};
  const isDaily = series.some((e) => e.isDaily);
  const firstDateWithData = series.filter((e) => e.close > 0)[0].date;

  // determine ticks to display based on bandwidth to avoid text overlapping
  const canDisplayAll = bandwidth > 100;
  const canDisplayMidmonthDaily = bandwidth > 10 && bandwidth <= 30;
  const canDisplayEvery4Days = bandwidth > 30 && bandwidth <= 100;
  const canDisplayMidmonthWeekly = bandwidth > 70;
  const canDisplayMonthWeekly = (month: number) => {
    if (bandwidth <= 10) {
      return month % 6 === 0;
    } else if (bandwidth > 10 && bandwidth <= 20) {
      return month % 3 === 0;
    } else if (bandwidth > 20 && bandwidth <= 30) {
      return month % 2 === 0;
    } else {
      return true;
    }
  };

  dates.forEach((date, index) => {
    const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const displayAfter1stDateWithData = date >= firstDateWithData;
    if (!dateSet.includes(key)) {
      // display ticks at the start of month
      const displayMonth = isWeekDay(date) && (isDaily ? date.getDate() <= 3 : date.getDate() <= 10);
      const displayYear = displayMonth && date.getMonth() === 0;
      const displayTickDaily = isDaily && (displayMonth || displayYear);
      const displayTickWeekly = !isDaily && (canDisplayMonthWeekly(date.getMonth()) || displayYear);
      const displayTick = (displayTickDaily || displayTickWeekly) && displayAfter1stDateWithData;
      dateGroup[key] = [{ date, index, displayMonth, displayYear, displayTick }];
      dateSet.push(key);
    } else {
      // display ticks between months
      const newIndex = dateGroup[key].length;
      const isMidmonthDaily = isDaily && newIndex === 10 && canDisplayMidmonthDaily;
      const isEvery4Day = isDaily && newIndex % 4 === 0 && newIndex <= 16 && canDisplayEvery4Days;
      const displayTickDaily = isMidmonthDaily || isEvery4Day;
      const displayTickWeekly = !isDaily && newIndex === 2 && canDisplayMidmonthWeekly;
      const displayTick = (displayTickDaily || displayTickWeekly || canDisplayAll) && displayAfter1stDateWithData;
      dateGroup[key].push({ date, index, displayMonth: false, displayYear: false, displayTick });
    }
  });

  return Object.values(dateGroup).flatMap((it) => it);
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

// For band scale, not used anymore
export const getInvertXScale = (xScale: BandScale) => {
  const domain = xScale.domain();
  const xList = domain.map((d) => xScale(d) ?? 0);
  return (x: number) => {
    const idx = bisectCenter(xList, x);
    return [xList[idx], domain[idx], idx] as const;
  };
};

export const getChartColors = (colorMode: ColorMode = 'light') => {
  const colors = {
    up: getCssVar('--chakra-colors-black'),
    down: getCssVar('--chakra-colors-red-400'),
    ema10: getCssVar('--chakra-colors-gray-200'),
    ema21: getCssVar('--chakra-colors-gray-300'),
    ema50: getCssVar('--chakra-colors-gray-400'),
    ema200: getCssVar('--chakra-colors-gray-600'),
    rs: getCssVar('--chakra-colors-blue-500'),
    label: getCssVar('--chakra-colors-black'),
    crosshair: getCssVar('--chakra-colors-gray-400'),
    text: getCssVar('--chakra-colors-black'),
    textSecondary: getCssVar('--chakra-colors-gray-500'),
    overlayText: getCssVar('--chakra-colors-white'),
    overlayBg: getCssVar('--chakra-colors-gray-700'),
    pocketPivotVolume: getCssVar('--chakra-colors-blue-500'),
    gainerVolume: getCssVar('--chakra-colors-teal-500'),
    loserVolume: getCssVar('--chakra-colors-red-400'),
    normalVolume: getCssVar('--chakra-colors-gray-200'),
    rsNewHigh: getCssVar('--colors-rs-new-high'),
    rsNewHighBeforePrice: getCssVar('--colors-rs-new-high-before-price'),
    border: getCssVar('--chakra-colors-border'),
    think40: getCssVar('--colors-think-40'),
    think40down: getCssVar('--colors-think-40-down'),
    gridLine: getCssVar('--chakra-colors-gray-100'),
    currentPriceBg: getCssVar('--chakra-colors-black'),
    currentPriceLabel: getCssVar('--chakra-colors-white'),
    earningsLabel: getCssVar('--chakra-colors-white'),
    earningsBg: getCssVar('--chakra-colors-red-600'),
    earningsBgReported: getCssVar('--chakra-colors-gray-700')
  };
  return colorMode === 'light'
    ? colors
    : {
        ...colors,
        up: getCssVar('--chakra-colors-white'),
        down: getCssVar('--colors-down'),
        text: getCssVar('--chakra-colors-white'),
        textSecondary: getCssVar('--chakra-colors-gray-400'),
        normalVolume: getCssVar('--chakra-colors-gray-700'),
        loserVolume: getCssVar('--colors-volume-down'),
        ema10: getCssVar('--chakra-colors-gray-700'),
        ema21: getCssVar('--chakra-colors-gray-600'),
        ema50: getCssVar('--chakra-colors-gray-400'),
        ema200: getCssVar('--chakra-colors-gray-300'),
        gridLine: getCssVar('--chakra-colors-gray-900'),
        currentPriceBg: getCssVar('--chakra-colors-white'),
        currentPriceLabel: getCssVar('--chakra-colors-black')
      };
};

export const getVisibleDomain = (
  xScale: LinearScale,
  series: StockDataPoint[],
  zoomState: ZoomState,
  bitmapWidth: number
) => {
  const visibleDomain: number[] = [];
  const visibleIndex: number[] = [];
  const { rangeStart, rangeEnd } = getVisibleRange(bitmapWidth, zoomState.tx);
  // find min & max visible price
  const min: number[] = [];
  const max: number[] = [];
  series.forEach((d, i) => {
    const x = xScale(i);
    if (x > rangeStart && x <= rangeEnd) {
      if (visibleIndex.length === 0) visibleIndex[0] = i;
      if (visibleIndex.length > 0) visibleIndex[1] = i;
      if (d.low > 0) {
        min.push(d.low);
      }
      if (d.high > 0) {
        max.push(d.high);
      }
    }
  });

  visibleDomain.push(Math.min(...min));
  visibleDomain.push(Math.max(...max));

  // expand domain a little bit
  visibleDomain[0] *= 1 - zoomState.domainMultiplier;
  visibleDomain[1] *= 1 + zoomState.domainMultiplier - 0.05; // reduce upper bound a bit
  return { visibleDomain, visibleIndex };
};

export const getVisibleRange = (bitmapWidth: number, translateX: number) => {
  return { rangeStart: -bitmap(translateX), rangeEnd: bitmapWidth - bitmap(translateX) };
};

export const getLabelFont = (fontSize: number) => {
  return `${bitmap(fontSize)}px Outfit`;
};

export const plotChart = (
  context: CanvasRenderingContext2D,
  series: StockDataPoint[],
  scales: ChartScales,
  zoomState: ZoomState,
  showRs = true,
  colorMode: ColorMode,
  earningsDate: Date
) => {
  // translate canvas on zoom event
  context.translate(bitmap(zoomState.tx), 0);
  const canvasHeight = context.canvas.height;
  const { xScale, yScale, rsScale } = scales;
  const barWidth = Math.max(Math.ceil(xScale.bandWidth / 5), Math.floor(devicePixelRatio));
  const correction = barWidth % 2 === 0 ? 0 : 0.5;
  const tickLength = Math.ceil(Math.abs(xScale(1) - xScale(0)) / 3);
  const lineWidth = Math.min(devicePixelRatio, 2);
  const colors = getChartColors(colorMode);
  const isDaily = series.some((d) => d.isDaily);

  // draw vertical line
  const xTickValues = xScale.customTicks;
  xTickValues.forEach((d) => {
    const x = Math.round(xScale(d.index));
    if (d.displayTick) {
      context.beginPath();
      context.lineWidth = Math.floor(devicePixelRatio);
      context.strokeStyle = colors.gridLine;
      context.moveTo(x, 0);
      context.lineTo(x, canvasHeight);
      context.stroke();
    }
  });

  // draw horizontal line
  const yTickValues = yScale.customTicks;
  yTickValues.forEach((d) => {
    const y = Math.round(yScale(d));
    context.beginPath();
    context.lineWidth = Math.floor(devicePixelRatio);
    context.strokeStyle = colors.gridLine;
    context.moveTo(-100000, y);
    context.lineTo(100000, y);
    context.stroke();
  });

  // line for current price
  const lastPoint = lastPointWithData(series);
  const y = Math.floor(yScale(lastPoint.close)) + 0.5;
  const currentPriceLineWidth = Math.floor(devicePixelRatio);
  const gap = Math.floor(devicePixelRatio);
  context.save();
  context.beginPath();
  context.setLineDash([gap, gap * 2]);
  context.lineWidth = currentPriceLineWidth;
  context.strokeStyle = colors.currentPriceBg;
  context.moveTo(-100000, y);
  context.lineTo(100000, y);
  context.stroke();
  context.restore();

  if (isDaily) {
    // draw ema 10
    const ema10Line = line<StockDataPoint>(
      (_, i) => xScale(i),
      (d) => yScale(d.ema10 ?? 0)
    ).context(context);
    context.beginPath();
    ema10Line(series);
    context.lineWidth = lineWidth;
    context.strokeStyle = colors.ema10;
    context.stroke();

    // draw ema 21
    const ema21Line = line<StockDataPoint>(
      (_, i) => xScale(i),
      (d) => yScale(d.ema21 ?? 0)
    ).context(context);
    context.beginPath();
    ema21Line(series);
    context.lineWidth = lineWidth;
    context.strokeStyle = colors.ema21;
    context.stroke();

    // draw ema 50
    const ema50Line = line<StockDataPoint>(
      (_, i) => xScale(i),
      (d) => yScale(d.ema50 ?? 0)
    ).context(context);
    context.beginPath();
    ema50Line(series);
    context.lineWidth = lineWidth;
    context.strokeStyle = colors.ema50;
    context.stroke();

    // draw ema 200
    const ema200Line = line<StockDataPoint>(
      (_, i) => xScale(i),
      (d) => yScale(d.ema200 ?? 0)
    ).context(context);
    context.beginPath();
    ema200Line(series);
    context.lineWidth = lineWidth;
    context.strokeStyle = colors.ema200;
    context.stroke();
  } else {
    // 10 week
    const ema10Line = line<StockDataPoint>(
      (_, i) => xScale(i),
      (d) => yScale(d.ema10 ?? 0)
    ).context(context);
    context.beginPath();
    ema10Line(series);
    context.lineWidth = lineWidth;
    context.strokeStyle = colors.ema50;
    context.stroke();

    // 40 week
    const ema40Line = line<StockDataPoint>(
      (_, i) => xScale(i),
      (d) => yScale(d.ema40 ?? 0)
    ).context(context);
    context.beginPath();
    ema40Line(series);
    context.lineWidth = lineWidth;
    context.strokeStyle = colors.ema200;
    context.stroke();
  }

  // draw rs line + rs rating
  const rsOffsetY = canvasHeight * 0.6;
  if (showRs) {
    const rsLine = line<StockDataPoint>(
      (_, i) => xScale(i),
      (d) => rsScale(d.rs) + rsOffsetY
    ).context(context);
    context.beginPath();
    rsLine(series);
    context.lineWidth = lineWidth;
    context.strokeStyle = colors.rs;
    context.stroke();
  }

  series.forEach((d, i) => {
    const x = Math.floor(xScale(i)) + correction;
    const low = yScale(d.low);
    const high = yScale(d.high);
    const close = Math.round(yScale(d.close));
    const open = Math.round(yScale(d.open));

    // draw price bar
    const isUp = d.change >= 0;
    context.strokeStyle = d.isThink40 ? (isUp ? colors.think40 : colors.think40down) : isUp ? colors.up : colors.down;
    context.lineWidth = barWidth;
    context.beginPath();
    context.moveTo(x, Math.round(low + barWidth / 2));
    context.lineTo(x, Math.round(high - barWidth / 2));

    context.moveTo(x, open + correction);
    context.lineTo(Math.floor(x - tickLength), open + correction);
    context.moveTo(x, close + correction);
    context.lineTo(Math.floor(x + tickLength), close + correction);
    context.stroke();

    // draw small circle for rs new high
    const { isNewHigh, isNewHighBeforePrice } = d.rsStatus;
    if ((isNewHigh || isNewHighBeforePrice) && isDaily) {
      const cx = xScale(i);
      const cy = rsScale(d.rs) + rsOffsetY;
      const radius = bitmap(constant.rsRadius);
      context.beginPath();
      context.fillStyle = isNewHighBeforePrice ? colors.rsNewHighBeforePrice : colors.rsNewHigh;
      context.arc(cx, cy, radius, 0, 2 * Math.PI);
      context.fill();
    }

    // draw earnings date
    if (utcDay.count(d.date, earningsDate) === 0) {
      const diffFromToday = utcDay.count(new Date(), earningsDate);
      const isReported = diffFromToday <= 0;
      const cx = x;
      const cy = canvasHeight - bitmap(20);
      const radius = bitmap(10);

      // bg circle
      context.beginPath();
      context.fillStyle = isReported ? colors.earningsBgReported : colors.earningsBg;
      context.arc(cx, cy, radius, 0, 2 * Math.PI);
      context.fill();

      // label
      context.font = 'bold ' + getLabelFont(12);
      context.fillStyle = colors.earningsLabel;
      context.textBaseline = 'middle';
      context.textAlign = 'center';
      context.fillText('E', cx, cy);

      // report in n days
      if (!isReported) {
        const labelReport = `Report in ${diffFromToday} days`;
        context.font = getLabelFont(12);
        context.fillStyle = colors.up;
        context.textAlign = 'left';
        context.fillText(labelReport, cx + bitmap(20), cy);
      }
    }
  });
};

export const plotVolume = (
  context: CanvasRenderingContext2D,
  series: StockDataPoint[],
  scales: ChartScales,
  zoomState: ZoomState,
  colorMode: ColorMode
) => {
  // translate canvas on zoom event
  context.translate(bitmap(zoomState.tx), 0);
  const canvasHeight = context.canvas.height;
  const canvasWidth = context.canvas.width;
  const { xScale, volumeScale } = scales;
  const barWidth = xScale.bandWidth - 1;
  const barCorrection = barWidth % 2 === 0 ? 0 : 0.5;
  const colors = getChartColors(colorMode);
  const isDaily = series.some((d) => d.isDaily);
  const xTickValues = xScale.customTicks;

  // draw vertical line
  xTickValues.forEach((d) => {
    const x = Math.round(xScale(d.index));
    if (d.displayTick) {
      context.beginPath();
      context.lineWidth = Math.floor(devicePixelRatio);
      context.strokeStyle = colors.gridLine;
      context.moveTo(x, 0);
      context.lineTo(x, canvasHeight);
      context.stroke();
    }
  });

  // draw horizontal line
  const hLineWidth = canvasWidth * zoomState.tk;
  volumeScale.ticks(isTouchDevice ? 2 : 3).forEach((d) => {
    const y = Math.round(volumeScale(d));
    context.beginPath();
    context.lineWidth = Math.floor(devicePixelRatio);
    context.strokeStyle = colors.gridLine;
    context.moveTo(0, y);
    context.lineTo(hLineWidth, y);
    context.stroke();
  });

  series.forEach((d, i) => {
    if (d.volume < 0) return;
    const barX = Math.floor(xScale(i));
    const volumeBarHeight = Math.floor(volumeScale(d.volume));
    const { isPocketPivot, isGainer, isLoser } = d.volumeStatus;
    if (isDaily) {
      context.strokeStyle = isPocketPivot
        ? colors.pocketPivotVolume
        : isGainer
          ? colors.gainerVolume
          : isLoser
            ? colors.loserVolume
            : colors.normalVolume;
    } else {
      context.strokeStyle = isGainer ? colors.gainerVolume : isLoser ? colors.loserVolume : colors.normalVolume;
    }
    context.lineWidth = barWidth;
    context.beginPath();
    context.moveTo(barX - barCorrection, canvasHeight);
    context.lineTo(barX - barCorrection, volumeBarHeight);
    context.stroke();
  });
};

export const drawXAxis = (
  context: CanvasRenderingContext2D,
  xScale: XScale,
  zoomState: ZoomState,
  colorMode: ColorMode
) => {
  context.translate(bitmap(zoomState.tx), 0);
  const font = getLabelFont(12);
  const fontBold = `bold ${font}`;
  const y = bitmap(15);
  const tickValues = xScale.customTicks;
  const colors = getChartColors(colorMode);

  context.textBaseline = 'middle';
  context.textAlign = 'center';
  tickValues.forEach((d) => {
    const x = Math.round(xScale(d.index));
    if (d.displayTick) {
      context.fillStyle = d.displayMonth ? colors.text : colors.textSecondary;
      context.font = d.displayYear ? fontBold : font;
      context.fillText(dateFormat(d), x, y);
    }
  });
};

export const drawYAxis = (
  context: CanvasRenderingContext2D,
  yScale: YScale,
  colorMode: ColorMode,
  lastPoint: StockDataPoint
) => {
  const [, max] = yScale.domain();
  const priceFormatFnc = priceFormat(max);
  const tickValues = yScale.customTicks;
  const canvasHeight = context.canvas.height;
  const font = getLabelFont(12);
  const x = bitmap(10);
  const colors = getChartColors(colorMode);
  context.fillStyle = colors.text;
  context.font = font;
  context.textBaseline = 'middle';
  tickValues.forEach((d) => {
    const y = Math.round(yScale(d));
    if (y > bitmap(10) && y < canvasHeight - bitmap(10)) {
      context.fillText(priceFormatFnc(d), x, y);
    }
  });

  // current price label
  const y = Math.round(yScale(lastPoint.close));
  const rectHeight = bitmap(28);
  const width = context.canvas.width;
  context.fillStyle = colors.currentPriceBg;
  context.fillRect(0, Math.floor(y - rectHeight / 2), width, rectHeight);
  context.fillStyle = colors.currentPriceLabel;
  context.fillText(priceFormatFnc(lastPoint.close), x, y);
};

export const drawVolumeAxis = (context: CanvasRenderingContext2D, volumeScale: LinearScale, colorMode: ColorMode) => {
  const tickValues = volumeScale.ticks(isTouchDevice ? 2 : 3);
  const canvasHeight = context.canvas.height;
  const font = getLabelFont(12);
  const x = bitmap(10);
  context.fillStyle = getChartColors(colorMode).text;
  context.font = font;
  context.textBaseline = 'middle';
  tickValues.forEach((d) => {
    const y = Math.round(volumeScale(d));
    if (y > bitmap(5) && y < canvasHeight) {
      context.fillText(volumeFormat(d), x, y);
    }
  });
};

export const drawCrosshair = (context: CanvasRenderingContext2D, zoomState: ZoomState, dataPoint: DataPoint) => {
  context.translate(bitmap(zoomState.tx), 0);
  const canvasWidth = context.canvas.width;
  const canvasHeight = context.canvas.height;
  const pixelRatio = devicePixelRatio || 1;
  const { x, priceY: y } = dataPoint;

  // x
  const lineWidth = Math.floor(pixelRatio);
  const correction = lineWidth % 2 === 0 ? 0 : 0.5;
  const adjustX = Math.floor(x) + correction;
  // y
  const adjustY = Math.ceil(y) - correction;
  const { rangeStart, rangeEnd } = getVisibleRange(canvasWidth, zoomState.tx);

  // draw vertical line
  context.beginPath();
  context.strokeStyle = getChartColors().crosshair;
  context.lineWidth = lineWidth;
  context.setLineDash([8, 4]);
  context.moveTo(adjustX, 0);
  context.lineTo(adjustX, canvasHeight);
  context.stroke();

  // draw horizontal line
  context.beginPath();
  context.moveTo(rangeStart, adjustY);
  context.lineTo(rangeEnd, adjustY);
  context.stroke();
};

export const drawXOverlay = (context: CanvasRenderingContext2D, zoomState: ZoomState, dataPoint: DataPoint | null) => {
  if (!dataPoint) return;
  context.translate(bitmap(zoomState.tx), 0);
  const { x, date } = dataPoint;
  const { width, height } = context.canvas;
  const y = bitmap(15);
  const text = `${dateOverlayFormat(date)}`;
  const textWidth = bitmap(context.measureText(text).width + 30);
  const colors = getChartColors();
  const { rangeStart, rangeEnd } = getVisibleRange(width, zoomState.tx);

  // draw wrapper rect
  const xRect =
    x - textWidth / 2 < rangeStart
      ? rangeStart
      : x + textWidth / 2 > rangeEnd
        ? rangeEnd - textWidth
        : x - textWidth / 2;
  context.fillStyle = colors.overlayBg;
  context.fillRect(Math.floor(xRect), 0, textWidth, height);

  // fill date text
  context.font = getLabelFont(12);
  context.fillStyle = colors.overlayText;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.fillText(text, xRect + textWidth / 2, y);
};

export const drawYOverlay = (context: CanvasRenderingContext2D, dataPoint: DataPoint | null) => {
  if (!dataPoint) return;
  const { priceY: y, price } = dataPoint;
  const x = bitmap(10);
  const text = `${priceOverlayFormat(price)}`;
  const rectHeight = bitmap(28);
  const colors = getChartColors();
  const { width, height } = context.canvas;

  // draw wrapper rect
  if (y <= height) {
    context.fillStyle = colors.overlayBg;
    context.fillRect(0, Math.floor(y - rectHeight / 2), width, rectHeight);
    context.font = getLabelFont(12);
    context.fillStyle = colors.overlayText;
    context.textBaseline = 'middle';
    context.fillText(text, x, y);
    context.restore();
  }
};

export const drawVolumeOverlay = (context: CanvasRenderingContext2D, dataPoint: DataPoint | null) => {
  if (!dataPoint) return;
  const { volumeY: y, volume } = dataPoint;
  const x = bitmap(10);
  const text = `${volumeFormat(volume, 3)}`;
  const rectHeight = bitmap(28);
  const colors = getChartColors();
  const { width } = context.canvas;

  // draw wrapper rect
  if (y >= 0) {
    context.fillStyle = colors.overlayBg;
    context.fillRect(0, Math.floor(y - rectHeight / 2), width, rectHeight);
    context.font = getLabelFont(12);
    context.fillStyle = colors.overlayText;
    context.textBaseline = 'middle';
    context.fillText(text, x, y);
    context.restore();
  }
};

export const updateXScale = (series: StockDataPoint[], zoomState: ZoomState) => {
  const xScale = customLinearScale([0, series.length], zoomState.bandwidth) as XScale;
  xScale.customTicks = dateTicks(series, xScale.bandWidth);
  return { xScale };
};

export const updateRemainingScales = (
  series: StockDataPoint[],
  visibleDomain: number[],
  visibleIndex: number[],
  dms: CanvasDimensions
) => {
  const { bitmapHeight } = dms;
  const [min, max] = visibleDomain;
  const yScale = scaleLog()
    .range([bitmapHeight * constant.barArea, 0])
    .domain(visibleDomain) as YScale;
  yScale.customTicks = logTicks(min * 0.95, max);
  const firstVisibleIdx = Math.max(visibleIndex[0] - 10, 0);
  const lastVisibleIdx = visibleIndex[1] + 10;
  const volumeScale = scaleLinear()
    .range([0, bitmapHeight * constant.volumeArea])
    .domain([(maxNumber(series.slice(firstVisibleIdx, lastVisibleIdx).map((d) => d.volume)) ?? 0) * 1.1, 0]);
  const rsScale = scaleLog()
    .range([bitmapHeight * constant.rsArea, 0])
    .domain(
      extent(
        series
          .slice(firstVisibleIdx, lastVisibleIdx)
          .filter((d) => d.rs > 0)
          .map((d) => d.rs)
      ) as [number, number]
    );
  return { yScale, volumeScale, rsScale };
};

export const findDataPoint = (
  pointer: [number, number],
  series: StockDataPoint[],
  zoomState: ZoomState,
  scales: ChartScales
): DataPoint => {
  const [px, py] = pointer;
  const { xScale, yScale, volumeScale } = scales;
  const canvasX = bitmap(px - zoomState.tx);
  const canvasY = bitmap(py);
  const domain = xScale.invert(canvasX);
  const tmpIndex = domain < 0 ? 0 : Math.min(Math.round(domain), series.length - 1);
  // const [minIndex, maxIndex] = indexRangeWithData(series);
  // const index = Math.max(Math.min(tmpIndex, maxIndex), minIndex);
  const [minIndex] = indexRangeWithData(series);
  const index = Math.max(tmpIndex, minIndex);
  const x = xScale(index);
  const date = series[index].date;
  const price = yScale.invert(canvasY);
  const volumeY = canvasY - (max(yScale.range()) ?? 0);
  const volume = volumeY < 0 ? -1 : volumeScale.invert(volumeY);
  return { index, x, priceY: canvasY, volumeY, price, date, volume, px, py };
};

export const customLinearScale = (inputDomain: [number, number], bandwidth: number): CustomLinearScale => {
  const [domainStart, domainEnd] = inputDomain;
  const domains = range(domainStart, domainEnd);
  const { ranges } = computeRange(domains.length, bandwidth);
  const scale = ((domain: number) => {
    if (domain < domainStart) return ranges[0];
    if (domain >= domainEnd) return ranges[ranges.length - 1];
    return ranges[domain - domainStart];
  }) as CustomLinearScale;
  scale.range = () => [ranges[0], ...ranges.slice(-1)];
  scale.domain = () => [domains[0], ...domains.slice(-1)];
  scale.invert = (x: number) => {
    if (x < ranges[0]) return domains[0];
    if (x >= ranges[ranges.length - 1]) return domains[domains.length - 1];
    return domains[bisectCenter(ranges, x)];
  };
  scale.bandWidth = bandwidth;
  return scale;
};

export const computeTranslation = (series: StockDataPoint[], zoomState: ZoomState, dms: CanvasDimensions) => {
  const { bandwidth, ranges } = computeRange(series.length, zoomState.bandwidth);
  const [firstIndexWithData, lastIndexWithData] = indexRangeWithData(series);

  // default translateX
  const lastRangeWithData = ranges[lastIndexWithData];
  const remainingWidth = lastRangeWithData % dms.bitmapWidth; // remaining that exceed multiply of viewport width
  const multiplier = Math.floor(lastRangeWithData / dms.bitmapWidth) - 1;
  const offset = bandwidth * 2;
  const defaultTranslateX = -toCssWidth(remainingWidth + dms.bitmapWidth * multiplier) - offset;

  // to be translateX
  const originalX = zoomState.isZooming
    ? zoomState.zoomFactor * (zoomState.originalX - zoomState.mouseX) + zoomState.mouseX
    : zoomState.originalX;
  const translateX = zoomState.isRendered ? originalX : defaultTranslateX;

  // find max & min translateX
  const firstXWithData = firstIndexWithData > 0 ? firstIndexWithData * bandwidth : -1;
  const adjustment = bandwidth * 1.2;
  const minTranslateX = -toCssWidth(lastIndexWithData * bandwidth) + adjustment;
  const maxTranslateX = firstXWithData > -1 ? -toCssWidth(firstXWithData - dms.bitmapWidth) - adjustment : 0;

  // final translateX - if value is out of min/max, use min/max instead
  const finalTranslateX = Math.max(Math.min(translateX, maxTranslateX), minTranslateX);
  return { translateX: finalTranslateX };
};

export const computeRange = (dataLength: number, bandwidth = constant.minBandwidth) => {
  const ranges = Array(dataLength)
    .fill(0)
    .map((_, i) => i * bandwidth);
  return { bandwidth, ranges, upperRange: ranges.slice(-1)[0] };
};

export const indexRangeWithData = (series: StockDataPoint[]) => {
  const firstIndexWithData = series.findIndex((d) => d.close > 0);
  const lastIndexWithData = series.lastIndexOf(series.filter((d) => d.close > 0).slice(-1)[0]);
  return [firstIndexWithData, lastIndexWithData];
};

export const lastPointWithData = (series: StockDataPoint[]) => {
  return series.filter((d) => d.close > 0).slice(-1)[0];
};

export const getTouchDistance = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  return 0;
};

export const updateZoomLevel = (zoomState: ZoomState, delta: number) => {
  const bandwidthStep = zoomState.bandwidth < 40 ? 1 : 3;
  const newBandwidth = zoomState.bandwidth + delta * bandwidthStep;
  const bandwidth = Math.max(constant.minBandwidth, Math.min(newBandwidth, constant.maxBandwidth));
  const newZoomLevel = bandwidth / constant.minBandwidth;
  const oldZoomLevel = zoomState.tk;
  const zoomFactor = newZoomLevel / oldZoomLevel;
  return {
    tk: newZoomLevel,
    zoomFactor: zoomFactor,
    bandwidth: bandwidth
  };
};
