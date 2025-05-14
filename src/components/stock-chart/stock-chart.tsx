import * as d3 from 'd3';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import {
  dateFormat,
  dateTicks,
  getBitmapPixel as bitmap,
  getChartColors,
  logTicks,
  priceFormat
} from '@/helpers/chart.helper';
import { useChartDimensions } from '@/hooks/useChartDimensions';
import { Stock } from '@/types/stock';
import { CanvasDimensions, ChartScales, StockDataPoint, XScale, YScale } from '@/types/stock-chart';
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
const rsArea = 0.4;

export const StockChart: FC<StockChartProps> = ({ ticker, series, ...props }) => {
  const [chartRef, chartDms] = useChartDimensions<HTMLDivElement>({
    marginRight: 55,
    marginBottom: 30,
    marginTop: 10,
    marginLeft: 0
  });

  // ref
  const eventHandlerRef = useRef<HTMLDivElement>(null);
  // const visibleIndexRef = useRef<number[]>(null);
  // const chartScalesRef = useRef<ChartScales>(null);
  const transformRef = useRef<d3.ZoomTransform>(null);

  // state
  // const [transform, setTransform] = useState<d3.ZoomTransform | null>(null);
  const [redrawCount, setRedrawCount] = useState(0);

  const dms: CanvasDimensions = useMemo(() => {
    return {
      bitmapWidth: bitmap(chartDms.plotWidth),
      bitmapHeight: bitmap(chartDms.plotHeight),
      cssWidth: chartDms.plotWidth,
      cssHeight: chartDms.plotHeight
    };
  }, [chartDms.plotHeight, chartDms.plotWidth]);

  useEffect(() => {
    // setTransform((oldTransform) => {
    //   const newTransform = oldTransform ? oldTransform.translate(100, 0) : oldTransform;
    //   console.log('old =>', oldTransform);
    //   console.log('new =>', chartDms.plotWidth, chartDms.diffWidth, newTransform);
    //   return newTransform;
    // });con
    if (transformRef.current) {
      // const oldTrs = transformRef.current;
      // console.log('width =>', chartDms.plotWidth, chartDms.diffWidth);
      // transformRef.current = d3.zoomIdentity.translate(-bitmap(chartDms.plotWidth * oldTrs.k), 0).scale(oldTrs.k);
      // console.log('new =>', bitmap(chartDms.plotWidth * oldTrs.k) - bitmap(chartDms.plotWidth), oldTrs.x);
      //   console.log('old =>', oldTransform);
      //   return newTransform;
    }
  }, [chartDms.plotWidth, chartDms.diffWidth]);

  // useEffect(() => {
  //   // update transform so that last bar won't move when resize
  //   setTransform((oldTransform) => {
  //     const plotWidth = bitmap(chartDms.plotWidth);
  //     const xScale = getXScale(
  //       [0, plotWidth].map((d) => oldTransform.applyX(d)),
  //       series.map((d) => d.date)
  //     );
  //     const lastVisibleIndex = visibleIndexRef.current?.[1] ?? 0;
  //     const x = xScale(series[lastVisibleIndex].date) ?? 0;
  //     const transformX = -(x - plotWidth);

  //     console.log('work ma => ', d3.zoomIdentity.translate(transformX, 0).scale(oldTransform.k));
  //     // console.log(value, chartDms.plotWidth);
  //     // console.log('size changed = > ', visibleIndexRef.current);
  //     // const firstVisibleIndex = visibleIndexRef.current?.[0] ?? 0;
  //     return d3.zoomIdentity.translate(transformX, 0).scale(oldTransform.k);
  //   });
  // }, [chartDms.plotWidth, series]);

  useEffect(() => {
    const eventHandler = d3.select(eventHandlerRef.current as HTMLDivElement);
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
          const eventHandler = eventHandlerRef.current as HTMLDivElement;
          eventHandler.style.cursor = 'grabbing';
        })
        .on('zoom', ({ transform }: { transform: d3.ZoomTransform; sourceEvent: Event }) => {
          // console.log(transform);
          // set transform for next redraw
          // setTransform(transform);
          transformRef.current = transform;
          setRedrawCount((val) => val + 1);
        })
        .on('end', () => {
          const eventHandler = eventHandlerRef.current as HTMLDivElement;
          eventHandler.style.cursor = 'unset';
        });
      eventHandler.call(zoom);

      if (transformRef.current) {
        eventHandler.call(zoom.transform, transformRef.current);
      } else {
        eventHandler.call(zoom.transform, d3.zoomIdentity);
      }
    }
    return () => {
      eventHandler.on('.zoom', null);
    };
  }, [series, dms]);

  const chartScales = useMemo(() => {
    const transform = transformRef.current ? transformRef.current : d3.zoomIdentity;
    const xScale = getXScale(
      [0, dms.bitmapWidth * transform.k],
      series.map((d) => d.date)
    );
    const { visibleDomain } = getVisibleDomain(xScale, series, transform, dms.bitmapWidth);
    const [minLow, maxHigh] = visibleDomain;
    // visibleIndexRef.current = visibleIndex;
    const yScale = getYScale([dms.bitmapHeight * barArea, 0], [minLow, maxHigh]);
    const volumeScale = getLinearScale(
      [0, dms.bitmapHeight * volumeArea],
      [0, d3.max(series.map((d) => d.volume)) ?? 0]
    );
    const rsScale = getLinearScale(
      [dms.bitmapHeight * rsArea, 0],
      d3.extent(series.map((d) => d.rs)) as [number, number]
    );
    return { xScale, yScale, volumeScale, rsScale };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, dms, redrawCount]);

  const draw = (context: CanvasRenderingContext2D, type: 'chart' | 'yAxis' | 'xAxis') => {
    if (series.length === 0) return;
    const transform = transformRef.current ? transformRef.current : d3.zoomIdentity;
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
      default:
        return;
    }
  };

  return (
    <div ref={chartRef} {...props}>
      <StockQuote
        series={series}
        index={-1} // TODO: update index later
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
  if (showRs) {
    const rsLine = d3
      .line<StockDataPoint>(
        (d) => (xScale(d.date) ?? 0) + bandWidth / 2,
        (d) => rsScale(d.rs) + dms.bitmapHeight * 0.5
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
      const cy = rsScale(d.rs) + dms.bitmapHeight * 0.5;
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
  const fontSize = getLabelFont(12);
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
      context.font = fontSize;
      context.textBaseline = 'middle';
      context.textAlign = 'center';
      context.fillText(dateFormat(d), x, y);
    }
  });
  context.restore();
};

const drawYAxis = (context: CanvasRenderingContext2D, yScale: YScale) => {
  const [min, max] = yScale.domain();
  const priceFormatFnc = priceFormat(max);
  const tickValues = logTicks(min * 0.95, max);
  const canvasHeight = context.canvas.height;
  const fontSize = getLabelFont(12);
  const x = bitmap(10);
  tickValues.forEach((d) => {
    const y = Math.round(yScale(d));
    if (y > 10 && y < canvasHeight) {
      context.font = fontSize;
      context.textBaseline = 'middle';
      context.fillText(priceFormatFnc(d), x, y);
    }
  });
};
