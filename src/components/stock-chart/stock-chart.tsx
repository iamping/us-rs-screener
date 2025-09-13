import * as d3 from 'd3';
import { FC, useEffect, useRef, useState } from 'react';
import {
  bitmap,
  computeTranslation,
  constant,
  drawCrosshair,
  drawVolumeAxis,
  drawVolumeOverlay,
  drawXAxis,
  drawXOverlay,
  drawYAxis,
  drawYOverlay,
  findDataPoint,
  getTouchDistance,
  getVisibleDomain,
  lastPointWithData,
  plotChart,
  plotVolume,
  updateRemainingScales,
  updateXScale,
  updateZoomLevel
} from '@/helpers/chart.helper';
import { useChartDimensions } from '@/hooks/useChartDimensions';
import { useColorMode } from '@/hooks/useColorMode';
import {
  CanvasDimensions,
  ChartScales,
  DataPoint,
  StockChartData,
  StockDataPoint,
  ZoomState
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
  const dmsRef = useRef<CanvasDimensions>(null);

  // ref for touch event & momentum scroll
  const timerRef = useRef<number>(null);
  const lastXYRef = useRef<[number, number]>(null);

  // ref for resizing
  const firstRenderRef = useRef(true);
  const resizingRef = useRef(false);
  const visibleIndexRef = useRef<number[]>([]);

  // ref for custom zoom
  const zoomStateRef = useRef<ZoomState>({
    isRendered: false,
    isDragging: false,
    isZooming: false,
    isLongTap: false,
    bandwidth: constant.defaultZoomLevel * constant.minBandwidth,
    tk: constant.defaultZoomLevel,
    tx: 0,
    ty: 0,
    originalX: 0,
    originalY: 0,
    lastX: 0,
    lastY: 0,
    mouseX: 0,
    mouseY: 0,
    zoomFactor: 1.0,
    viewportWidth: 0,
    velocity: 0,
    animationFrame: -1,
    lastPinchDistance: -1,
    time: 0
  });

  // state
  const [activePoint, setActivePoint] = useState<DataPoint | null>(null);
  const [redrawCount, setRedrawCount] = useState(0);
  const { colorMode } = useColorMode();

  // other reactive vars
  const showRS = ticker !== 'SPY';

  const redraw = () => {
    const zoomState = zoomStateRef.current as ZoomState;
    const dms = dmsRef.current as CanvasDimensions;
    updateZoomState(stockData.series, zoomState, dms);
    updateChartScales(stockData.series, zoomState, dms);
    plotChartAndAxis(stockData.series, showRS, colorMode);
  };

  const updateZoomState = (
    series: StockDataPoint[],
    zoomState: ZoomState,
    dms: CanvasDimensions,
    beforeRender = false
  ) => {
    const { translateX } = computeTranslation(series, zoomState, dms);
    zoomState.tx = translateX;
    zoomState.originalX = translateX;
    zoomState.viewportWidth = dms.cssWidth;
    if (beforeRender) {
      zoomState.isRendered = true;
    }
  };

  const updateChartScales = (series: StockDataPoint[], zoomState: ZoomState, dms: CanvasDimensions) => {
    const { xScale } = updateXScale(series, zoomState);
    const { visibleDomain, visibleIndex } = getVisibleDomain(xScale, series, zoomState.tx, dms.bitmapWidth);
    const { yScale, volumeScale, rsScale } = updateRemainingScales(series, visibleDomain, visibleIndex, dms);
    visibleIndexRef.current = visibleIndex;
    chartScalesRef.current = { xScale, yScale, volumeScale, rsScale };
    return { chartScales: chartScalesRef.current };
  };

  const plotChartAndAxis = (series: StockDataPoint[], drawRS: boolean, colorMode: ColorMode) => {
    const zoomState = zoomStateRef.current as ZoomState;
    const chartScales = chartScalesRef.current as ChartScales;
    plotAreaRef.current?.draw((context) => plotChart(context, series, chartScales, zoomState, drawRS, colorMode));
    volumeAreaRef.current?.draw((context) => plotVolume(context, series, chartScales, zoomState, colorMode));
    xAxisRef.current?.draw((context) => drawXAxis(context, chartScales.xScale, zoomState, colorMode));
    yAxisRef.current?.draw((context) => drawYAxis(context, chartScales.yScale, colorMode, lastPointWithData(series)));
    volumeAxisRef.current?.draw((context) => drawVolumeAxis(context, chartScales.volumeScale, colorMode));
  };

  const drawCrosshairAndOverlay = (pointer: [number, number], stockData: StockChartData) => {
    if (!zoomStateRef.current.isRendered || !chartScalesRef.current) return;
    const zoomState = zoomStateRef.current as ZoomState;
    const series = stockData.series;
    const dataPoint = findDataPoint(pointer, series, zoomState, chartScalesRef.current);
    crosshairRef.current?.draw((context) => drawCrosshair(context, zoomState, dataPoint));
    xOverlayRef.current?.draw((context) => drawXOverlay(context, zoomState, dataPoint));
    yOverlayRef.current?.draw((context) => drawYOverlay(context, dataPoint));
    volumeOverlayRef.current?.draw((context) => drawVolumeOverlay(context, dataPoint));
    lastXYRef.current = pointer;
    if (series[dataPoint.index].close > 0) {
      setActivePoint(dataPoint);
    }
  };

  const clearCrosshair = () => {
    crosshairRef.current?.clear();
    xOverlayRef.current?.clear();
    yOverlayRef.current?.clear();
    volumeOverlayRef.current?.clear();
    lastXYRef.current = null;
    setActivePoint(null);
  };

  const onTouchEnd = () => {
    const zoomState = zoomStateRef.current;
    if (zoomState.isDragging) {
      zoomState.isLongTap = false;
      clearCrosshair();
      if (performance.now() - zoomState.time < 200) momentumScroll();
    }
    zoomState.lastPinchDistance = -1;
    zoomState.isZooming = false;
    clearTimeout(timerRef.current ?? undefined);
  };

  const momentumScroll = () => {
    const duration = 1500; // ms
    const startTime = performance.now();
    const zoomState = zoomStateRef.current;
    if (zoomState && zoomState.isDragging) {
      const initialDelta = zoomState.velocity;
      const animateScroll: FrameRequestCallback = (now) => {
        const t = Math.min((now - startTime) / duration, 1); // normalized time [0,1]
        const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
        const delta = initialDelta * (1 - ease); // decelerate
        zoomState.originalX += delta;
        redraw();
        if (t < 1 && Math.abs(delta) > 0.1) {
          zoomState.animationFrame = requestAnimationFrame(animateScroll);
        }
      };
      zoomState.animationFrame = requestAnimationFrame(animateScroll);
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
        cssHeight: chartDms.plotHeight,
        diffWidth: chartDms.diffWidth
      };
      if (!firstRenderRef.current) {
        resizingRef.current = true;
        clearCrosshair();
      }
      setRedrawCount((val) => val + 1);
    }
  }, [chartDms]);

  // 2nd - zoom binding
  useEffect(() => {
    if (!dmsRef.current || stockData.series.length === 0) return;
    const series = stockData.series;
    const dms = dmsRef.current as CanvasDimensions;
    const zoomState = zoomStateRef.current;

    if (firstRenderRef.current) {
      updateZoomState(series, zoomState, dms, true);
      firstRenderRef.current = false;
    } else {
      if (resizingRef.current) {
        zoomState.originalX -= zoomState.viewportWidth - dms.cssWidth;
        resizingRef.current = false;
      }
      updateZoomState(series, zoomState, dms);
    }

    updateChartScales(series, zoomState, dms);
    plotChartAndAxis(series, showRS, colorMode);
  }, [stockData, showRS, redrawCount, colorMode]);

  return (
    <div ref={chartRef} {...props}>
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
          height: chartDms.plotHeight,
          zIndex: 2
        }}
        onMouseDown={(e) => {
          const zoomState = zoomStateRef.current;
          const eventHandlerElement = eventHandlerRef.current as HTMLDivElement;
          zoomState.isDragging = true;
          zoomState.lastX = e.clientX;
          zoomState.lastY = e.clientY;
          eventHandlerElement.style.cursor = 'grabbing';
        }}
        onMouseUp={() => {
          const zoomState = zoomStateRef.current;
          const eventHandlerElement = eventHandlerRef.current as HTMLDivElement;
          zoomState.isDragging = false;
          eventHandlerElement.style.cursor = 'unset';
        }}
        onMouseLeave={() => {
          const zoomState = zoomStateRef.current;
          const eventHandlerElement = eventHandlerRef.current as HTMLDivElement;
          zoomState.isDragging = false;
          eventHandlerElement.style.cursor = 'unset';
        }}
        onMouseMove={(e) => {
          const zoomState = zoomStateRef.current;
          if (zoomState.isDragging) {
            const dx = e.clientX - zoomState.lastX;
            const dy = e.clientY - zoomState.lastY;
            zoomState.originalX += dx;
            zoomState.originalY += dy;
            zoomState.lastX = e.clientX;
            zoomState.lastY = e.clientY;
            redraw();
          }
          if (isTouchDevice) return;
          drawCrosshairAndOverlay(d3.pointer(e), stockData);
        }}
        onMouseOut={() => {
          if (isTouchDevice) redraw();
          clearCrosshair();
        }}
        onWheel={(e) => {
          const zoomState = zoomStateRef.current as ZoomState;
          const eventHandlerElement = eventHandlerRef.current as HTMLDivElement;
          eventHandlerElement.style.cursor = 'grabbing';
          const rect = eventHandlerElement.getBoundingClientRect();

          // find zoom level & bandwidth
          const delta = e.deltaY < 0 ? 1 : -1;
          const updatedZoom = updateZoomLevel(zoomState, delta);
          zoomState.tk = updatedZoom.tk;
          zoomState.zoomFactor = updatedZoom.zoomFactor;
          zoomState.bandwidth = updatedZoom.bandwidth;
          zoomState.mouseX = e.clientX - rect.left;
          zoomState.mouseY = e.clientY - rect.top;
          zoomState.isZooming = true;
          redraw();

          // update crosshair position while zooming
          drawCrosshairAndOverlay(d3.pointer(e), stockData);

          // reset cursor & zooming status
          clearTimeout(timerRef.current ?? undefined);
          timerRef.current = setTimeout(() => {
            eventHandlerElement.style.cursor = 'unset';
            zoomState.isZooming = false;
          }, 200);
        }}
        onTouchStart={(e) => {
          const zoomState = zoomStateRef.current;
          if (e.touches.length > 1) {
            // pinch zoom
            zoomState.isZooming = true;
            zoomState.isDragging = false;
            zoomState.isLongTap = false;
            zoomState.lastPinchDistance = getTouchDistance(e);
            clearTimeout(timerRef.current ?? undefined);
            clearCrosshair();
          } else {
            // normal scroll
            zoomState.isDragging = true;
            zoomState.lastX = e.touches[0].clientX;
            zoomState.lastY = e.touches[0].clientY;

            // momentum scroll
            zoomState.velocity = 0;
            zoomState.time = performance.now();
            cancelAnimationFrame(zoomState.animationFrame);

            // longtap to display crosshair
            timerRef.current = setTimeout(() => {
              const pointer = d3.pointer(e.touches[0], eventHandlerRef.current);
              zoomState.isDragging = false;
              zoomState.isLongTap = true;
              drawCrosshairAndOverlay(pointer, stockData);
            }, 200);
          }
        }}
        onTouchMove={(e) => {
          const zoomState = zoomStateRef.current;
          if (e.touches.length > 1) {
            const eventHandlerElement = eventHandlerRef.current as HTMLDivElement;
            const rect = eventHandlerElement.getBoundingClientRect();
            const currentPinchDistance = getTouchDistance(e);
            if (zoomState.lastPinchDistance !== -1) {
              // midpoint between fingers
              const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
              const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
              const delta = zoomState.lastPinchDistance < currentPinchDistance ? 1 : -1;
              const updatedZoom = updateZoomLevel(zoomState, delta);
              zoomState.tk = updatedZoom.tk;
              zoomState.zoomFactor = updatedZoom.zoomFactor;
              zoomState.bandwidth = updatedZoom.bandwidth;
              zoomState.mouseX = midX;
              zoomState.mouseY = midY;
              redraw();
            }
            zoomState.lastPinchDistance = currentPinchDistance;
          } else {
            if (zoomState.isLongTap) {
              zoomState.isDragging = false;
              const pointer = d3.pointer(e.touches[0], eventHandlerRef.current);
              drawCrosshairAndOverlay(pointer, stockData);
            } else if (zoomState.isDragging) {
              const dx = e.touches[0].clientX - zoomState.lastX;
              const dy = e.touches[0].clientY - zoomState.lastY;
              zoomState.velocity = dx; // for momentum scroll
              zoomState.originalX += dx;
              zoomState.originalY += dy;
              zoomState.lastX = e.touches[0].clientX;
              zoomState.lastY = e.touches[0].clientY;
              redraw();
            }
          }
          clearTimeout(timerRef.current ?? undefined);
        }}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      />
    </div>
  );
};
