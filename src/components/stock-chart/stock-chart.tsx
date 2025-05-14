import * as d3 from 'd3';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import {
  dateFormat,
  dateOverlayFormat,
  dateTicks,
  getBitmapPixel as bitmap,
  getChartColors,
  getInvertXScale,
  logTicks,
  priceFormat,
  priceOverlayFormat
} from '@/helpers/chart.helper';
import { useChartDimensions } from '@/hooks/useChartDimensions';
import { Stock } from '@/types/stock';
import { CanvasDimensions, ChartScales, DataPoint, StockDataPoint, XScale, YScale } from '@/types/stock-chart';
import { Canvas } from './canvas';
import { StockQuote } from './stock-quote';

interface StockChartProps extends React.HTMLProps<HTMLDivElement> {
  ticker: string;
  stock: Stock;
  series: StockDataPoint[];
}

// constant
const domainMultiplier = 0.04;
const lowerDomainMultiplier = 0.1;
const barArea = 0.8;
const volumeArea = 0.2;
const rsArea = 0.3;

export const StockChart: FC<StockChartProps> = ({ ticker, series, ...props }) => {
  const [chartRef, chartDms] = useChartDimensions<HTMLDivElement>({
    marginRight: 55,
    marginBottom: 30,
    marginTop: 10,
    marginLeft: 0
  });

  // ref
  const eventHandlerRef = useRef<HTMLDivElement>(null);
  const currentPointer = useRef<[number, number]>(null);

  // state
  const [currentTransform, setCurrentTransform] = useState<d3.ZoomTransform | null>(null);
  const [currentDataPoint, setCurrentDataPoint] = useState<DataPoint | null>(null);
  const [, setRedrawCount] = useState(0);

  const dms: CanvasDimensions = useMemo(() => {
    return {
      bitmapWidth: bitmap(chartDms.plotWidth),
      bitmapHeight: bitmap(chartDms.plotHeight),
      cssWidth: chartDms.plotWidth,
      cssHeight: chartDms.plotHeight
    };
  }, [chartDms.plotHeight, chartDms.plotWidth]);

  useEffect(() => {
    const eventHandlerElement = eventHandlerRef.current as HTMLDivElement;
    const eventHandler = d3.select(eventHandlerElement);
    const extent = [
      [0, 0],
      [dms.cssWidth, 0] // use canvas css width
    ] as [[number, number], [number, number]];
    if (series.length > 0) {
      const zoom = d3
        .zoom<HTMLDivElement, unknown>()
        .scaleExtent([1, 10])
        .translateExtent(extent)
        .extent(extent)
        .on('start', () => {
          eventHandlerElement.style.cursor = 'grabbing';
        })
        .on('zoom', ({ transform, sourceEvent }: { transform: d3.ZoomTransform; sourceEvent: Event }) => {
          if (currentPointer.current) {
            if (sourceEvent instanceof MouseEvent) {
              currentPointer.current = d3.pointer(sourceEvent, eventHandlerRef.current);
            }
          }
          setCurrentTransform(transform);
        })
        .on('end', () => {
          eventHandlerElement.style.cursor = 'unset';
        });
      eventHandler.call(zoom);

      if (currentTransform) {
        eventHandler.call(zoom.transform, currentTransform);
      } else {
        eventHandler.call(zoom.transform, d3.zoomIdentity);
      }
    }
    return () => {
      eventHandler.on('.zoom', null);
    };
  }, [series, dms, currentTransform]);

  const chartScales = useMemo(() => {
    const transform = currentTransform ?? d3.zoomIdentity;
    const xScale = getXScale(
      [0, dms.bitmapWidth * transform.k],
      series.map((d) => d.date)
    );
    const { visibleDomain, visibleIndex } = getVisibleDomain(xScale, series, transform, dms.bitmapWidth);
    const yScale = getYScale([dms.bitmapHeight * barArea, 0], visibleDomain);
    const firstVisibleIdx = Math.max(visibleIndex[0] - 2, 0);
    const lastVisibleIdx = visibleIndex[1] + 2;
    const volumeScale = getLinearScale(
      [0, dms.bitmapHeight * volumeArea],
      [0, d3.max(series.slice(firstVisibleIdx, lastVisibleIdx).map((d) => d.volume)) ?? 0]
    );
    const rsScale = getLinearScale(
      [dms.bitmapHeight * rsArea, 0],
      d3.extent(series.slice(firstVisibleIdx, lastVisibleIdx).map((d) => d.rs)) as [number, number]
    );
    return { xScale, yScale, volumeScale, rsScale };
  }, [series, dms, currentTransform]);

  const draw = (
    context: CanvasRenderingContext2D,
    type: 'chart' | 'yAxis' | 'xAxis' | 'crosshair' | 'xAxisOverlay' | 'yAxisOverlay'
  ) => {
    if (series.length === 0) return;
    const transform = currentTransform ?? d3.zoomIdentity;
    switch (type) {
      case 'chart':
        plotChart(context, series, chartScales, dms, transform, ticker !== 'SPY');
        break;
      case 'xAxis':
        drawXAxis(context, chartScales.xScale, transform);
        break;
      case 'yAxis':
        drawYAxis(context, chartScales.yScale);
        break;
      case 'crosshair':
        drawCrosshair(
          context,
          currentPointer.current,
          chartScales.xScale,
          chartScales.yScale,
          dms,
          transform,
          setCurrentDataPoint
        );
        break;
      case 'xAxisOverlay':
        drawXOverlay(context, transform, currentDataPoint);
        break;
      case 'yAxisOverlay':
        drawYOverlay(context, currentDataPoint);
        break;
      default:
        return;
    }
  };

  return (
    <div ref={chartRef} {...props}>
      <StockQuote
        series={series}
        index={currentDataPoint?.index ?? -1}
        gapX={1}
        paddingX={2}
        flexWrap="wrap"
        maxWidth={chartDms.width}
        marginTop={-1}
      />
      <Canvas
        id="plotarea"
        style={{
          position: 'absolute',
          top: chartDms.marginTop,
          left: chartDms.marginLeft,
          width: chartDms.plotWidth,
          height: chartDms.plotHeight
        }}
        draw={(ctx) => draw(ctx, 'chart')}
      />
      <Canvas
        id="crosshair"
        style={{
          position: 'absolute',
          top: chartDms.marginTop,
          left: chartDms.marginLeft,
          width: chartDms.plotWidth,
          height: chartDms.plotHeight
        }}
        draw={(ctx) => draw(ctx, 'crosshair')}
      />
      <Canvas
        id="xAxisOverlay"
        style={{
          position: 'absolute',
          top: chartDms.marginTop + chartDms.plotHeight,
          left: chartDms.marginLeft,
          width: chartDms.plotWidth,
          height: chartDms.height - chartDms.plotHeight - chartDms.marginTop,
          zIndex: 1
        }}
        draw={(ctx) => draw(ctx, 'xAxisOverlay')}
      />
      <Canvas
        id="xAxis"
        style={{
          position: 'absolute',
          top: chartDms.marginTop + chartDms.plotHeight,
          left: chartDms.marginLeft,
          width: chartDms.plotWidth,
          height: chartDms.height - chartDms.plotHeight - chartDms.marginTop
        }}
        draw={(ctx) => draw(ctx, 'xAxis')}
      />
      <Canvas
        id="yAxisOverlay"
        style={{
          position: 'absolute',
          top: chartDms.marginTop,
          right: 0,
          width: chartDms.width - chartDms.plotWidth,
          height: chartDms.plotHeight,
          zIndex: 1
        }}
        draw={(ctx) => draw(ctx, 'yAxisOverlay')}
      />
      <Canvas
        id="yAxis"
        style={{
          position: 'absolute',
          top: chartDms.marginTop,
          right: 0,
          width: chartDms.width - chartDms.plotWidth,
          height: chartDms.plotHeight
        }}
        draw={(ctx) => draw(ctx, 'yAxis')}
      />
      <div
        ref={eventHandlerRef}
        id="event-handler"
        style={{
          position: 'absolute',
          top: chartDms.marginTop,
          left: chartDms.marginLeft,
          width: chartDms.plotWidth,
          height: chartDms.plotHeight
        }}
        onMouseMove={(e) => {
          currentPointer.current = d3.pointer(e);
          setRedrawCount((val) => val + 1);
        }}
        onMouseOut={() => {
          currentPointer.current = null;
          setCurrentDataPoint(null);
        }}
      />
    </div>
  );
};

const getXScale = (range: number[], dates: Date[]) => {
  return d3.scaleBand<Date>().range(range).domain(dates).padding(0.8);
};

const getYScale = (range: number[], domain: number[]) => {
  return d3.scaleLog().range(range).domain(domain);
};

const getLinearScale = (range: number[], domain: number[]) => {
  return d3.scaleLinear().range(range).domain(domain);
};

const getVisibleDomain = (
  xScale: XScale,
  series: StockDataPoint[],
  transform: d3.ZoomTransform,
  bitmapWidth: number
) => {
  const visibleDomain: number[] = [];
  const visibleIndex: number[] = [];
  // find min & max visible price
  series.forEach((d, i) => {
    const x = xScale(d.date) ?? 0;
    const { rangeStart, rangeEnd } = getVisibleRange(bitmapWidth, transform);
    if (x > rangeStart && x <= rangeEnd) {
      if (visibleIndex.length === 0) visibleIndex[0] = i;
      if (visibleIndex.length > 0) visibleIndex[1] = i;
      if (visibleDomain.length) {
        visibleDomain[0] = Math.min(d.low, visibleDomain[0]);
        visibleDomain[1] = Math.max(d.high, visibleDomain[1]);
      } else {
        visibleDomain.push(d.low);
        visibleDomain.push(d.low);
      }
    }
  });

  // expand domain a little bit
  visibleDomain[0] *= 1 - lowerDomainMultiplier;
  visibleDomain[1] *= 1 + domainMultiplier;
  return { visibleDomain, visibleIndex };
};

const getVisibleRange = (bitmapWidth: number, transform: d3.ZoomTransform) => {
  return {
    rangeStart: -bitmap(transform.x),
    rangeEnd: bitmapWidth - bitmap(transform.x)
  };
};

const getLabelFont = (fontSize: number) => {
  return `${bitmap(fontSize)}px Outfit`;
};

const plotChart = (
  context: CanvasRenderingContext2D,
  series: StockDataPoint[],
  scales: ChartScales,
  dms: CanvasDimensions,
  transform: d3.ZoomTransform,
  showRs = true
) => {
  // translate canvas on zoom event
  context.translate(bitmap(transform.x), 0);
  const { xScale, yScale, volumeScale, rsScale } = scales;
  const bandWidth = Math.max(Math.ceil(xScale.bandwidth()), 2);
  const correction = bandWidth % 2 === 0 ? 0 : 0.5;
  const tickLength = Math.ceil(Math.abs((xScale(series[1].date) ?? 0) - (xScale(series[0].date) ?? 0)) / 3);
  const barWidth = Math.max(2, Math.ceil(Math.abs((xScale(series[1].date) ?? 0) - (xScale(series[0].date) ?? 0)) - 5));
  const barCorrection = barWidth % 2 === 0 ? 0 : 0.5;
  const lineWidth = Math.min(devicePixelRatio, 2);
  const colors = getChartColors();
  const isDaily = series.some((d) => d.isDaily);

  // draw ema 21
  if (isDaily) {
    const ema21Line = d3
      .line<StockDataPoint>(
        (d) => (xScale(d.date) ?? 0) + bandWidth / 2,
        (d) => yScale(d.ema21 ?? 0)
      )
      .context(context);
    context.beginPath();
    ema21Line(series.filter((d) => !!d.ema21));
    context.lineWidth = lineWidth;
    context.strokeStyle = colors.ema21;
    context.stroke();

    // draw ema 50
    const ema50Line = d3
      .line<StockDataPoint>(
        (d) => (xScale(d.date) ?? 0) + bandWidth / 2,
        (d) => yScale(d.ema50 ?? 0)
      )
      .context(context);
    context.beginPath();
    ema50Line(series.filter((d) => !!d.ema50));
    context.lineWidth = lineWidth;
    context.strokeStyle = colors.ema50;
    context.stroke();

    // draw ema 200
    const ema200Line = d3
      .line<StockDataPoint>(
        (d) => (xScale(d.date) ?? 0) + bandWidth / 2,
        (d) => yScale(d.ema200 ?? 0)
      )
      .context(context);
    context.beginPath();
    ema200Line(series.filter((d) => !!d.ema200));
    context.lineWidth = lineWidth;
    context.strokeStyle = colors.ema200;
    context.stroke();
  } else {
    // 10 week
    const ema10Line = d3
      .line<StockDataPoint>(
        (d) => (xScale(d.date) ?? 0) + bandWidth / 2,
        (d) => yScale(d.ema10 ?? 0)
      )
      .context(context);
    context.beginPath();
    ema10Line(series.filter((d) => !!d.ema10));
    context.lineWidth = lineWidth;
    context.strokeStyle = colors.ema50;
    context.stroke();

    // 40 week
    const ema40Line = d3
      .line<StockDataPoint>(
        (d) => (xScale(d.date) ?? 0) + bandWidth / 2,
        (d) => yScale(d.ema40 ?? 0)
      )
      .context(context);
    context.beginPath();
    ema40Line(series.filter((d) => !!d.ema40));
    context.lineWidth = lineWidth;
    context.strokeStyle = colors.ema200;
    context.stroke();
  }

  // draw rs line + rs rating
  const rsOffsetY = dms.bitmapHeight * 0.6;
  if (showRs) {
    const rsLine = d3
      .line<StockDataPoint>(
        (d) => (xScale(d.date) ?? 0) + bandWidth / 2,
        (d) => rsScale(d.rs) + rsOffsetY
      )
      .context(context);
    context.beginPath();
    rsLine(series);
    context.lineWidth = lineWidth;
    context.strokeStyle = colors.rs;
    context.stroke();
  }

  series.forEach((d) => {
    const x = Math.floor(xScale(d.date) ?? 0) + correction;
    const barX = Math.floor(xScale(d.date) ?? 0);
    const low = yScale(d.low);
    const high = yScale(d.high);
    const close = Math.round(yScale(d.close));
    const open = Math.round(yScale(d.open));

    // console.log(x, bandWidth);
    // draw price bar
    context.strokeStyle = d.change > 0 ? colors.up : colors.down;
    context.lineWidth = bandWidth;
    context.beginPath();
    context.moveTo(x, Math.round(low + bandWidth / 2));
    context.lineTo(x, Math.round(high - bandWidth / 2));

    context.moveTo(x, open + correction);
    context.lineTo(Math.floor(x - tickLength), open + correction);
    context.moveTo(x, close + correction);
    context.lineTo(Math.floor(x + tickLength), close + correction);
    context.stroke();

    // draw volume bar
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
    context.lineWidth = barWidth; // bandWidth * 2;
    context.beginPath();
    context.moveTo(barX - barCorrection, dms.bitmapHeight);
    context.lineTo(barX - barCorrection, dms.bitmapHeight - volumeBarHeight);
    context.stroke();

    // draw small circle for rs new high
    const { isNewHigh, isNewHighBeforePrice } = d.rsStatus;
    if ((isNewHigh || isNewHighBeforePrice) && isDaily) {
      const cx = (xScale(d.date) ?? 0) + bandWidth / 2;
      const cy = rsScale(d.rs) + rsOffsetY;
      const radius = devicePixelRatio * transform.k * 1.2;
      context.beginPath();
      context.fillStyle = isNewHighBeforePrice ? colors.rsNewHighBeforePrice : colors.rsNewHigh;
      context.arc(cx, cy, radius, 0, 2 * Math.PI);
      context.fill();
    }
  });
};

const drawXAxis = (context: CanvasRenderingContext2D, xScale: XScale, transform: d3.ZoomTransform) => {
  context.translate(bitmap(transform.x), 0);
  const tickValues = dateTicks(xScale.domain());
  const canvasWidth = context.canvas.width;
  const font = getLabelFont(12);
  const y = bitmap(15);
  const minDistance = bitmap(30);
  const diffX = Math.abs((xScale(tickValues[0]) ?? 0) - (xScale(tickValues[1]) ?? 0));
  const step = Math.min(Math.ceil(minDistance / diffX), 4); // step should be 1,2,3,4 to always correctly get January
  const firstJanIndex = tickValues.findIndex((d) => d.getMonth() === 0);
  const startIndex = Math.min(...d3.range(firstJanIndex, -1, -step));
  const displayIndex = d3.range(startIndex, tickValues.length, step);

  // hide label if out of visible range
  const { rangeStart, rangeEnd } = getVisibleRange(canvasWidth, transform);
  const offset = bitmap(10);

  tickValues.forEach((d, i) => {
    const x = Math.round(xScale(d) ?? 0);
    if (displayIndex.includes(i) && x > rangeStart + offset && x < rangeEnd - offset) {
      context.font = font;
      context.textBaseline = 'middle';
      context.textAlign = 'center';
      context.fillText(dateFormat(d), x, y);
    }
  });
};

const drawYAxis = (context: CanvasRenderingContext2D, yScale: YScale) => {
  const [min, max] = yScale.domain();
  const priceFormatFnc = priceFormat(max);
  const tickValues = logTicks(min * 0.95, max);
  const canvasHeight = context.canvas.height;
  const font = getLabelFont(12);
  const x = bitmap(10);
  tickValues.forEach((d) => {
    const y = Math.round(yScale(d));
    if (y > 10 && y < canvasHeight) {
      context.font = font;
      context.textBaseline = 'middle';
      context.fillText(priceFormatFnc(d), x, y);
    }
  });
};

const drawCrosshair = (
  context: CanvasRenderingContext2D,
  pointer: [number, number] | null,
  xScale: XScale | null,
  yScale: YScale | null,
  dms: CanvasDimensions,
  transform: d3.ZoomTransform,
  setCurrentDataPoint: (dataPoint: DataPoint) => void
) => {
  if (!xScale || !yScale || !pointer) return;
  context.translate(bitmap(transform.x), 0);
  const [px, py] = pointer;
  const pixelRatio = devicePixelRatio || 1;

  // x
  const canvasX = bitmap(px - transform.x);
  const [x, date, index] = getInvertXScale(xScale)(canvasX);
  const lineWidth = Math.floor(pixelRatio);
  const correction = lineWidth % 2 === 0 ? 0 : 0.5;
  const adjustX = Math.floor(x) + correction;
  // y
  const canvasY = bitmap(py);
  const price = yScale.invert(canvasY);
  const adjustY = Math.ceil(canvasY) - correction;
  const { rangeStart, rangeEnd } = getVisibleRange(dms.bitmapWidth, transform);

  // draw vertical line
  context.beginPath();
  context.strokeStyle = getChartColors().crosshair;
  context.lineWidth = lineWidth;
  context.setLineDash([8, 4]);
  context.moveTo(adjustX, 0);
  context.lineTo(adjustX, dms.bitmapHeight);
  context.stroke();

  // draw horizontal line
  context.beginPath();
  context.moveTo(rangeStart, adjustY);
  context.lineTo(rangeEnd, adjustY);
  context.stroke();

  // set current point
  setCurrentDataPoint({ index: index, x: adjustX, y: adjustY, price, date });
};

const drawXOverlay = (context: CanvasRenderingContext2D, transform: d3.ZoomTransform, dataPoint: DataPoint | null) => {
  if (!dataPoint) return;
  context.translate(bitmap(transform.x), 0);
  const { x, date } = dataPoint;
  const { width, height } = context.canvas;
  const y = bitmap(15);
  const text = `${dateOverlayFormat(date)}`;
  const textWidth = bitmap(context.measureText(text).width + 30);
  const colors = getChartColors();
  const { rangeStart, rangeEnd } = getVisibleRange(width, transform);

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

const drawYOverlay = (context: CanvasRenderingContext2D, dataPoint: DataPoint | null) => {
  if (!dataPoint) return;
  const { y, price } = dataPoint;
  const x = bitmap(10);
  const text = `${priceOverlayFormat(price)}`;
  const rectHeight = bitmap(28);
  const colors = getChartColors();
  const width = context.canvas.width;

  // draw wrapper rect
  context.fillStyle = colors.overlayBg;
  context.fillRect(0, Math.floor(y - rectHeight / 2), width, rectHeight);
  context.font = getLabelFont(12);
  context.fillStyle = colors.overlayText;
  context.textBaseline = 'middle';
  context.fillText(text, x, y);
  context.restore();
};
