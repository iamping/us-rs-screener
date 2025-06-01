import * as d3 from 'd3';
import { FC, TouchEvent, useEffect, useRef, useState } from 'react';
import {
  bitmap,
  constant,
  drawCrosshair,
  drawVolumeAxis,
  drawVolumeOverlay,
  drawXAxis,
  drawXOverlay,
  drawYAxis,
  drawYOverlay,
  findDataPoint,
  plotChart,
  plotVolume,
  updateRemainingScales,
  updateXScale
} from '@/helpers/chart.helper';
import { useChartDimensions } from '@/hooks/useChartDimensions';
import { useColorMode } from '@/hooks/useColorMode';
import { CanvasDimensions, ChartScales, DataPoint, StockChartData, StockDataPoint } from '@/types/chart.type';
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
const { volumeArea } = constant;
const isTouchDevice = isTouchDeviceMatchMedia();

export const StockChart: FC<StockChartProps> = ({ ticker, stockData, ...props }) => {
  const [chartRef, chartDms] = useChartDimensions<HTMLDivElement>({
    marginRight: 55,
    marginBottom: 30,
    marginTop: 40,
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
  const timerRef = useRef<number>(null);
  const isTapRef = useRef(false);
  const momentumRef = useRef({ isDragging: true, lastX: 0, velocity: 0, animationFrame: -1, time: 0 });
  const zoomEnabledRef = useRef(true);
  const lastXYRef = useRef<[number, number]>(null);

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
    chartScalesRef.current = { xScale, yScale, volumeScale, rsScale };
    return { transform: transformRef.current, chartScales: chartScalesRef.current };
  };

  const plotChartAndAxis = (series: StockDataPoint[], drawRS: boolean, colorMode: ColorMode) => {
    const transform = transformRef.current as d3.ZoomTransform;
    const chartScales = chartScalesRef.current as ChartScales;
    plotAreaRef.current?.draw((context) => plotChart(context, series, chartScales, transform, drawRS, colorMode));
    volumeAreaRef.current?.draw((context) => plotVolume(context, series, chartScales, transform, colorMode));
    xAxisRef.current?.draw((context) => drawXAxis(context, chartScales.xScale, transform, colorMode));
    yAxisRef.current?.draw((context) => drawYAxis(context, chartScales.yScale, colorMode, series[series.length - 1]));
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
    lastXYRef.current = pointer;
    setActivePoint(dataPoint);
  };

  const clearCrosshair = () => {
    crosshairRef.current?.clear();
    xOverlayRef.current?.clear();
    yOverlayRef.current?.clear();
    volumeOverlayRef.current?.clear();
    lastXYRef.current = null;
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

  useEffect(() => {
    if (lastXYRef.current) {
      setTimeout(() => {
        drawCrosshairAndOverlay(lastXYRef.current!, stockData);
      }, 0); // delay a bit
    }
  }, [ticker, stockData]);

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
        zIndex={2}
        left={0}
        maxW={'calc(100% - 120px)'}
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
