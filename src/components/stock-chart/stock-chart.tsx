import * as d3 from 'd3';
import { FC, TouchEvent, useEffect, useRef, useState } from 'react';
import {
  dateFormat,
  dateOverlayFormat,
  dateTicks,
  getBitmapPixel as bitmap,
  getChartColors,
  logTicks,
  priceFormat,
  priceOverlayFormat,
  volumeFormat
} from '@/helpers/chart.helper';
import { useChartDimensions } from '@/hooks/useChartDimensions';
import { useColorMode } from '@/hooks/useColorMode';
import {
  CanvasDimensions,
  ChartScales,
  DataPoint,
  LinearScale,
  StockChartData,
  StockDataPoint
} from '@/types/chart.type';
import { isTouchDeviceMatchMedia } from '@/utils/common.utils';
import { ColorMode } from '../ui/color-mode';
import { Canvas, CanvasHandle } from './canvas';
import { StockQuote } from './stock-quote';
import { StockVolume } from './stock-volume';

interface StockChartProps extends React.HTMLProps<HTMLDivElement> {
  ticker: string;
  stockData: StockChartData;
}

// constant
const domainMultiplier = 0.04;
const lowerDomainMultiplier = 0.1;
const barArea = 0.8;
const volumeArea = 0.2;
const rsArea = 0.3;
const isTouchDevice = isTouchDeviceMatchMedia();
const rsRadius = 6;

export const StockChart: FC<StockChartProps> = ({ ticker, stockData, ...props }) => {
  const [chartRef, chartDms] = useChartDimensions<HTMLDivElement>({
    marginRight: 55,
    marginBottom: 30,
    marginTop: 30,
    marginLeft: 0
  });

  // canvasRef
  const plotAreaRef = useRef<CanvasHandle>(null);
  const volumeAreaRef = useRef<CanvasHandle>(null);
  const xAxisRef = useRef<CanvasHandle>(null);
  const yAxisRef = useRef<CanvasHandle>(null);
  const volumeAxisRef = useRef<CanvasHandle>(null);
  const crosshairRef = useRef<CanvasHandle>(null);
  const xOverlayRef = useRef<CanvasHandle>(null);
  const yOverlayRef = useRef<CanvasHandle>(null);
  const volumeOverlayRef = useRef<CanvasHandle>(null);

  // ref
  const eventHandlerRef = useRef<HTMLDivElement>(null);
  const chartScalesRef = useRef<ChartScales>(null);
  const transformRef = useRef<d3.ZoomTransform>(null);
  const zoomRef = useRef<d3.ZoomBehavior<HTMLDivElement, unknown>>(null);
  const dmsRef = useRef<CanvasDimensions>(null);

  // ref for touch event & momentom scroll
  const timerRef = useRef<NodeJS.Timeout>(null);
  const isTapRef = useRef(false);
  const momentumRef = useRef({ isDragging: true, lastX: 0, velocity: 0, animationFrame: -1, time: 0 });
  const zoomEnabledRef = useRef(true);

  // ref for resizing
  const firstRenderRef = useRef(true);
  const resizingRef = useRef(false);
  const visibleIndexRef = useRef<number[]>([]);

  // state
  const [activePoint, setActivePoint] = useState<DataPoint | null>(null);
  const [redrawCount, setRedrawCount] = useState(0);
  const { colorMode } = useColorMode();

  // other reactive vars
  const showRS = ticker !== 'SPY';

  // call this to force redraw chart & axis
  const toggleZoomAndRedraw = (enable: boolean) => {
    zoomEnabledRef.current = enable;
    setRedrawCount((val) => val + 1);
  };

  const updateChartScales = (series: StockDataPoint[], transform: d3.ZoomTransform, dms: CanvasDimensions) => {
    const { xScale, visibleDomain, visibleIndex } = updateXScale(series, transform, dms);
    const { yScale, volumeScale, rsScale } = updateRemainingScales(series, visibleDomain, visibleIndex, dms);
    transformRef.current = transform;
    visibleIndexRef.current = visibleIndex;
    chartScalesRef.current = {
      xScale,
      yScale,
      volumeScale,
      rsScale
    };
    return { transform: transformRef.current, chartScales: chartScalesRef.current };
  };

  const plotChartAndAxis = (series: StockDataPoint[], drawRS: boolean, colorMode: ColorMode) => {
    const transform = transformRef.current as d3.ZoomTransform;
    const chartScales = chartScalesRef.current as ChartScales;
    plotAreaRef.current?.draw((context) => plotChart(context, series, chartScales, transform, drawRS, colorMode));
    volumeAreaRef.current?.draw((context) => plotVolume(context, series, chartScales, transform, colorMode));
    xAxisRef.current?.draw((context) => drawXAxis(context, series, chartScales.xScale, transform, colorMode));
    yAxisRef.current?.draw((context) => drawYAxis(context, chartScales.yScale, colorMode));
    volumeAxisRef.current?.draw((context) => drawVolumeAxis(context, chartScales.volumeScale, colorMode));
  };

  const drawCrosshairAndOverlay = (pointer: [number, number], stockData: StockChartData) => {
    if (!transformRef.current || !chartScalesRef.current) return;
    const transform = transformRef.current ?? d3.zoomIdentity;
    const series = stockData.series;
    const dataPoint = findDataPoint(pointer, series, transform, chartScalesRef.current);
    crosshairRef.current?.draw((context) => drawCrosshair(context, transform, dataPoint));
    xOverlayRef.current?.draw((context) => drawXOverlay(context, transform, dataPoint));
    yOverlayRef.current?.draw((context) => drawYOverlay(context, dataPoint));
    volumeOverlayRef.current?.draw((context) => drawVolumeOverlay(context, dataPoint));
    setActivePoint(dataPoint);
  };

  const clearCrosshair = () => {
    crosshairRef.current?.clear();
    xOverlayRef.current?.clear();
    yOverlayRef.current?.clear();
    volumeOverlayRef.current?.clear();
    setActivePoint(null);
  };

  const onTouchStart = (e: TouchEvent) => {
    // momentum scroll
    momentumRef.current.isDragging = true;
    momentumRef.current.lastX = e.touches[0].clientX;
    momentumRef.current.velocity = 0;
    momentumRef.current.time = performance.now();
    cancelAnimationFrame(momentumRef.current.animationFrame);

    // zoom/panning only if multi touch
    if (e.touches.length > 1) {
      momentumRef.current.isDragging = false;
      clearTimeout(timerRef.current ?? undefined);
      clearCrosshair();
      toggleZoomAndRedraw(true);
      return;
    }

    // crosshair
    const dms = dmsRef.current as CanvasDimensions;
    isTapRef.current = true;
    timerRef.current = setTimeout(() => {
      const pointer = d3.pointer(e.touches[0], eventHandlerRef.current);
      if (pointer[0] <= dms.cssWidth) {
        isTapRef.current = false;
        toggleZoomAndRedraw(false);
        drawCrosshairAndOverlay(pointer, stockData);
      }
    }, 200);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (zoomEnabledRef.current) {
      // momentum scroll
      const currentX = e.touches[0].clientX;
      const delta = currentX - momentumRef.current.lastX;
      momentumRef.current.lastX = currentX;
      momentumRef.current.velocity = delta;
    } else {
      // crosshair
      const dms = dmsRef.current as CanvasDimensions;
      isTapRef.current = false;
      const [x, y] = d3.pointer(e.touches[0], eventHandlerRef.current);
      if (x > 0 && x < dms.cssWidth && y > 0 && y < dms.cssHeight - 5) {
        drawCrosshairAndOverlay([x, y], stockData);
      }
    }
    clearTimeout(timerRef.current ?? undefined);
  };

  const onTouchEnd = () => {
    if (isTapRef.current) {
      toggleZoomAndRedraw(true);
      clearCrosshair();
      momentumScroll();
    }
    clearTimeout(timerRef.current ?? undefined);
  };

  const momentumScroll = () => {
    const duration = 500; // ms
    const startTime = performance.now();
    const dragging = momentumRef.current.isDragging;
    if (zoomRef.current && eventHandlerRef.current && dragging) {
      const zoom = zoomRef.current!;
      const transform = d3.zoomTransform(eventHandlerRef.current);
      const eventHandlerSelection = d3.select(eventHandlerRef.current);
      const initialDelta = momentumRef.current.velocity;
      const animateScroll: FrameRequestCallback = (now) => {
        const t = Math.min((now - startTime) / duration, 1); // normalized time [0,1]
        const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
        const delta = (initialDelta * (1 - ease) * devicePixelRatio) / transform.k; // decelerate
        eventHandlerSelection.call(zoom.translateBy, delta, 0);
        if (t < 1 && Math.abs(delta) > 0.2) {
          momentumRef.current.animationFrame = requestAnimationFrame(animateScroll);
        }
      };
      momentumRef.current.animationFrame = requestAnimationFrame(animateScroll);
    }
  };

  // 1st - will start 2nd effect after dimensions are set properly
  useEffect(() => {
    if (chartDms.width > 0) {
      dmsRef.current = {
        bitmapWidth: bitmap(chartDms.plotWidth),
        bitmapHeight: bitmap(chartDms.plotHeight),
        cssWidth: chartDms.plotWidth,
        cssHeight: chartDms.plotHeight
      };
      if (!firstRenderRef.current) {
        resizingRef.current = true;
        clearCrosshair();
      }
      toggleZoomAndRedraw(true);
    }
  }, [chartDms]);

  // 2nd - zoom binding
  useEffect(() => {
    if (!dmsRef.current || stockData.series.length === 0) return;
    const series = stockData.series;
    const isFew = series.length <= 80;
    const initialScale = isFew ? 1 : 3;
    const dms = dmsRef.current as CanvasDimensions;
    const eventHandlerElement = eventHandlerRef.current as HTMLDivElement;
    const eventHandlerSelection = d3.select(eventHandlerElement);
    const extent = [
      [0, 0],
      [dms.cssWidth, 0] // use canvas css width
    ] as [[number, number], [number, number]];

    // zoom behavior
    zoomRef.current = d3
      .zoom<HTMLDivElement, unknown>()
      .scaleExtent([1, 30])
      .translateExtent(extent)
      .extent(extent)
      .on('start', () => {
        eventHandlerElement.style.cursor = 'grabbing';
      })
      .on('zoom', ({ transform, sourceEvent }: { transform: d3.ZoomTransform; sourceEvent: Event }) => {
        // update crosshair when panning/zooming (Desktop only)
        if (!isTouchDevice && sourceEvent) {
          drawCrosshairAndOverlay(d3.pointer(sourceEvent, eventHandlerRef.current), stockData);
        }
        updateChartScales(series, transform, dms);
        plotChartAndAxis(series, showRS, colorMode);
      })
      .on('end', () => {
        eventHandlerElement.style.cursor = 'unset';
      });

    // apply zoom behavior & set default zoom transform when first rendering
    if (zoomEnabledRef.current) {
      eventHandlerSelection.call(zoomRef.current);
      if (firstRenderRef.current) {
        eventHandlerSelection.call(zoomRef.current.transform, d3.zoomIdentity.scale(initialScale));
        eventHandlerSelection.call(zoomRef.current.translateBy, -dms.cssWidth * 2, 0);
        firstRenderRef.current = false;
      }
    }

    if (resizingRef.current) {
      const lastIndex = Math.min(visibleIndexRef.current[1] + 1, series.length);
      const transform = d3.zoomTransform(eventHandlerElement);
      const { chartScales } = updateChartScales(series, transform, dms); // need transform.k only :)
      const xScale = chartScales.xScale;
      const lastX = xScale(lastIndex);
      const newTransformX = -(lastX - dms.bitmapWidth) / devicePixelRatio;
      eventHandlerSelection.call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(newTransformX, 0).scale(transform.k)
      );
      resizingRef.current = false;
    } else {
      const transform = d3.zoomTransform(eventHandlerElement);
      updateChartScales(series, transform, dms);
      plotChartAndAxis(series, showRS, colorMode);
    }

    return () => {
      // when zoomEnabled = false => clean only touchmove because of resizing issues on touch device
      // if clean every .zoom event, react somehow get stale zoomBehavior instead of updated one when re-attach event
      eventHandlerSelection.on('touchmove.zoom', null);
    };
  }, [stockData, showRS, redrawCount, colorMode]);

  return (
    <div
      ref={chartRef}
      {...props}
      onTouchStartCapture={onTouchStart}
      onTouchMoveCapture={onTouchMove}
      onTouchEndCapture={onTouchEnd}
      onTouchCancelCapture={onTouchEnd}>
      <StockQuote
        index={activePoint?.index ?? -1}
        stockData={stockData}
        position="absolute"
        margin={2}
        marginTop={1}
        zIndex={2}
        left={0}
        right="40px"
      />
      <StockVolume
        index={activePoint?.index ?? -1}
        stockData={stockData}
        position="absolute"
        gap={1}
        margin={2}
        marginTop={1}
        zIndex={2}
        top={chartDms.marginTop + chartDms.plotHeight * (1 - volumeArea)}
      />
      <Canvas
        id="plotArea"
        ref={plotAreaRef}
        style={{
          position: 'absolute',
          top: chartDms.marginTop,
          left: chartDms.marginLeft,
          width: chartDms.plotWidth,
          height: chartDms.plotHeight * (1 - volumeArea)
        }}
      />
      <Canvas
        id="volumeArea"
        ref={volumeAreaRef}
        style={{
          position: 'absolute',
          top: chartDms.marginTop + chartDms.plotHeight * (1 - volumeArea),
          left: chartDms.marginLeft,
          width: chartDms.plotWidth,
          height: chartDms.plotHeight * volumeArea
        }}
      />
      <hr
        style={{
          position: 'absolute',
          top: chartDms.marginTop + chartDms.plotHeight * (1 - volumeArea),
          left: chartDms.marginLeft,
          width: chartDms.width,
          height: 1,
          borderTopWidth: 1
        }}
      />
      <Canvas
        id="crosshair"
        ref={crosshairRef}
        style={{
          position: 'absolute',
          top: chartDms.marginTop,
          left: chartDms.marginLeft,
          width: chartDms.plotWidth,
          height: chartDms.plotHeight
        }}
      />
      <Canvas
        id="xAxisOverlay"
        ref={xOverlayRef}
        style={{
          position: 'absolute',
          top: chartDms.marginTop + chartDms.plotHeight,
          left: chartDms.marginLeft,
          width: chartDms.plotWidth,
          height: chartDms.height - chartDms.plotHeight - chartDms.marginTop,
          zIndex: 1
        }}
      />
      <Canvas
        id="xAxis"
        ref={xAxisRef}
        style={{
          position: 'absolute',
          top: chartDms.marginTop + chartDms.plotHeight,
          left: chartDms.marginLeft,
          width: chartDms.plotWidth,
          height: chartDms.height - chartDms.plotHeight - chartDms.marginTop
        }}
      />
      <Canvas
        id="yAxisOverlay"
        ref={yOverlayRef}
        style={{
          position: 'absolute',
          top: chartDms.marginTop,
          right: 0,
          width: chartDms.width - chartDms.plotWidth,
          height: chartDms.plotHeight * (1 - volumeArea),
          zIndex: 1
        }}
      />
      <Canvas
        id="yAxis"
        ref={yAxisRef}
        style={{
          position: 'absolute',
          top: chartDms.marginTop,
          right: 0,
          width: chartDms.width - chartDms.plotWidth,
          height: chartDms.plotHeight * (1 - volumeArea)
        }}
      />
      <Canvas
        id="volumeAxisOverlay"
        ref={volumeOverlayRef}
        style={{
          position: 'absolute',
          top: chartDms.marginTop + chartDms.plotHeight * (1 - volumeArea),
          right: 0,
          width: chartDms.width - chartDms.plotWidth,
          height: chartDms.plotHeight * volumeArea,
          zIndex: 1
        }}
      />
      <Canvas
        id="volumeAxis"
        ref={volumeAxisRef}
        style={{
          position: 'absolute',
          top: chartDms.marginTop + chartDms.plotHeight * (1 - volumeArea),
          right: 0,
          width: chartDms.width - chartDms.plotWidth,
          height: chartDms.plotHeight * volumeArea
        }}
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
          if (isTouchDevice) return;
          drawCrosshairAndOverlay(d3.pointer(e), stockData);
        }}
        onMouseOut={() => {
          if (isTouchDevice) toggleZoomAndRedraw(true);
          clearCrosshair();
        }}
      />
    </div>
  );
};

const getVisibleDomain = (
  xScale: LinearScale,
  series: StockDataPoint[],
  transform: d3.ZoomTransform,
  bitmapWidth: number
) => {
  const visibleDomain: number[] = [];
  const visibleIndex: number[] = [];
  const { rangeStart, rangeEnd } = getVisibleRange(bitmapWidth, transform);
  // find min & max visible price
  series.forEach((d, i) => {
    const x = xScale(i);
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
  transform: d3.ZoomTransform,
  showRs = true,
  colorMode: ColorMode
) => {
  // translate canvas on zoom event
  context.translate(bitmap(transform.x), 0);
  const canvasHeight = context.canvas.height;
  const { xScale, yScale, rsScale } = scales;
  const bandWidth = Math.max(Math.ceil(Math.abs(xScale(1) - xScale(0)) / 5), Math.floor(devicePixelRatio));
  const correction = bandWidth % 2 === 0 ? 0 : 0.5;
  const tickLength = Math.ceil(Math.abs(xScale(1) - xScale(0)) / 3);
  const lineWidth = Math.min(devicePixelRatio, 2);
  const colors = getChartColors(colorMode);
  const isDaily = series.some((d) => d.isDaily);

  // draw ema 21
  if (isDaily) {
    const ema21Line = d3
      .line<StockDataPoint>(
        (_, i) => xScale(i),
        (d) => yScale(d.ema21 ?? 0)
      )
      .context(context);
    context.beginPath();
    ema21Line(series);
    context.lineWidth = lineWidth;
    context.strokeStyle = colors.ema21;
    context.stroke();

    // draw ema 50
    const ema50Line = d3
      .line<StockDataPoint>(
        (_, i) => xScale(i),
        (d) => yScale(d.ema50 ?? 0)
      )
      .context(context);
    context.beginPath();
    ema50Line(series);
    context.lineWidth = lineWidth;
    context.strokeStyle = colors.ema50;
    context.stroke();

    // draw ema 200
    const ema200Line = d3
      .line<StockDataPoint>(
        (_, i) => xScale(i),
        (d) => yScale(d.ema200 ?? 0)
      )
      .context(context);
    context.beginPath();
    ema200Line(series);
    context.lineWidth = lineWidth;
    context.strokeStyle = colors.ema200;
    context.stroke();
  } else {
    // 10 week
    const ema10Line = d3
      .line<StockDataPoint>(
        (_, i) => xScale(i),
        (d) => yScale(d.ema10 ?? 0)
      )
      .context(context);
    context.beginPath();
    ema10Line(series);
    context.lineWidth = lineWidth;
    context.strokeStyle = colors.ema50;
    context.stroke();

    // 40 week
    const ema40Line = d3
      .line<StockDataPoint>(
        (_, i) => xScale(i),
        (d) => yScale(d.ema40 ?? 0)
      )
      .context(context);
    context.beginPath();
    ema40Line(series);
    context.lineWidth = lineWidth;
    context.strokeStyle = colors.ema200;
    context.stroke();
  }

  // draw rs line + rs rating
  const rsOffsetY = canvasHeight * 0.6;
  if (showRs) {
    const rsLine = d3
      .line<StockDataPoint>(
        (_, i) => xScale(i),
        (d) => rsScale(d.rs) + rsOffsetY
      )
      .context(context);
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

    // draw small circle for rs new high
    const { isNewHigh, isNewHighBeforePrice } = d.rsStatus;
    if ((isNewHigh || isNewHighBeforePrice) && isDaily) {
      const cx = xScale(i);
      const cy = rsScale(d.rs) + rsOffsetY;
      const radius = devicePixelRatio * rsRadius;
      context.beginPath();
      context.fillStyle = isNewHighBeforePrice ? colors.rsNewHighBeforePrice : colors.rsNewHigh;
      context.arc(cx, cy, radius, 0, 2 * Math.PI);
      context.fill();
    }
  });
};

const plotVolume = (
  context: CanvasRenderingContext2D,
  series: StockDataPoint[],
  scales: ChartScales,
  transform: d3.ZoomTransform,
  colorMode: ColorMode
) => {
  // translate canvas on zoom event
  context.translate(bitmap(transform.x), 0);
  const canvasHeight = context.canvas.height;
  const { xScale, volumeScale } = scales;
  const barWidth = Math.max(2, Math.ceil(Math.abs(xScale(1) - xScale(0)) - 5));
  const barCorrection = barWidth % 2 === 0 ? 0 : 0.5;
  const colors = getChartColors(colorMode);
  const isDaily = series.some((d) => d.isDaily);

  series.forEach((d, i) => {
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

const drawXAxis = (
  context: CanvasRenderingContext2D,
  series: StockDataPoint[],
  xScale: LinearScale,
  transform: d3.ZoomTransform,
  colorMode: ColorMode
) => {
  context.translate(bitmap(transform.x), 0);
  const tickValues = dateTicks(series.map((d) => d.date));
  const canvasWidth = context.canvas.width;
  const font = getLabelFont(12);
  const y = bitmap(15);
  const minDistance = bitmap(30);
  const diffX = Math.abs(xScale(tickValues[0].index) - xScale(tickValues[1].index));
  const step = Math.min(Math.ceil(minDistance / diffX), 4); // step should be 1,2,3,4 to always correctly get January
  const firstJanIndex = tickValues.map((d) => d.date).findIndex((d) => d.getMonth() === 0);
  const startIndex = Math.min(...d3.range(firstJanIndex === -1 ? 0 : firstJanIndex, -1, -step));
  const displayIndex = d3.range(startIndex, tickValues.length, step);

  // hide label if out of visible range
  const { rangeStart, rangeEnd } = getVisibleRange(canvasWidth, transform);
  const offset = bitmap(10);

  context.fillStyle = getChartColors(colorMode).text;
  context.font = font;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  tickValues.forEach((d, i) => {
    const x = Math.round(xScale(d.index));
    if (displayIndex.includes(i) && x > rangeStart + offset && x < rangeEnd - offset) {
      context.fillText(dateFormat(d.date), x, y);
    }
  });
};

const drawYAxis = (context: CanvasRenderingContext2D, yScale: LinearScale, colorMode: ColorMode) => {
  const [min, max] = yScale.domain();
  const priceFormatFnc = priceFormat(max);
  const tickValues = logTicks(min * 0.95, max);
  const canvasHeight = context.canvas.height;
  const font = getLabelFont(12);
  const x = bitmap(10);
  context.fillStyle = getChartColors(colorMode).text;
  context.font = font;
  context.textBaseline = 'middle';
  tickValues.forEach((d) => {
    const y = Math.round(yScale(d));
    if (y > bitmap(10) && y < canvasHeight - bitmap(10)) {
      context.fillText(priceFormatFnc(d), x, y);
    }
  });
};

const drawVolumeAxis = (context: CanvasRenderingContext2D, volumeScale: LinearScale, colorMode: ColorMode) => {
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

const drawCrosshair = (context: CanvasRenderingContext2D, transform: d3.ZoomTransform, dataPoint: DataPoint) => {
  context.translate(bitmap(transform.x), 0);
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
  const { rangeStart, rangeEnd } = getVisibleRange(canvasWidth, transform);

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

const drawVolumeOverlay = (context: CanvasRenderingContext2D, dataPoint: DataPoint | null) => {
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

const updateXScale = (series: StockDataPoint[], transform: d3.ZoomTransform, dms: CanvasDimensions) => {
  const { bitmapWidth } = dms;
  const xScale = d3
    .scaleLinear()
    .range([0, bitmapWidth * transform.k])
    .domain([-1, series.length + Math.floor(series.length / (transform.k * 100))]) // add a little bit margin for first & last point
    .clamp(true);
  const { visibleDomain, visibleIndex } = getVisibleDomain(xScale, series, transform, bitmapWidth);
  return { xScale, visibleDomain, visibleIndex };
};

const updateRemainingScales = (
  series: StockDataPoint[],
  visibleDomain: number[],
  visibleIndex: number[],
  dms: CanvasDimensions
) => {
  const { bitmapHeight } = dms;
  const yScale = d3
    .scaleLog()
    .range([bitmapHeight * barArea, 0])
    .domain(visibleDomain);
  const firstVisibleIdx = Math.max(visibleIndex[0] - 10, 0);
  const lastVisibleIdx = visibleIndex[1] + 10;
  const volumeScale = d3
    .scaleLinear()
    .range([0, bitmapHeight * volumeArea])
    .domain([(d3.max(series.slice(firstVisibleIdx, lastVisibleIdx).map((d) => d.volume)) ?? 0) * 1.1, 0]);
  const rsScale = d3
    .scaleLinear()
    .range([bitmapHeight * rsArea, 0])
    .domain(d3.extent(series.slice(firstVisibleIdx, lastVisibleIdx).map((d) => d.rs)) as [number, number]);
  return { yScale, volumeScale, rsScale };
};

const findDataPoint = (
  pointer: [number, number],
  series: StockDataPoint[],
  transform: d3.ZoomTransform,
  scales: ChartScales
): DataPoint => {
  const [px, py] = pointer;
  const { xScale, yScale, volumeScale } = scales;
  const canvasX = bitmap(px - transform.x);
  const canvasY = bitmap(py);
  const domain = xScale.invert(canvasX);
  const index = domain < 0 ? 0 : Math.min(Math.round(domain), series.length - 1);
  const x = xScale(index);
  const date = series[index].date;
  const price = yScale.invert(canvasY);
  const volumeY = canvasY - (d3.max(yScale.range()) ?? 0);
  const volume = volumeY < 0 ? -1 : volumeScale.invert(volumeY);
  return { index, x, priceY: canvasY, volumeY, price, date, volume, px, py };
};
