import * as d3 from 'd3';
import { FC, MouseEvent, useEffect, useRef, useState } from 'react';
import { useChartDimensions } from '@/hooks/useChartDimensions';
import { Dimensions, useDimensions } from '@/hooks/useDimensions';
import { StockDataPoint } from '@/types/stock-chart';
import { getCssVar } from '@/utils/common.utils';

interface StockChartProps extends React.HTMLProps<HTMLDivElement> {
  ticker: string;
  series: StockDataPoint[];
}

type XScale = d3.ScaleBand<Date>;
type YScale = d3.ScaleLogarithmic<number, number>;

interface ChartScales {
  xScale: XScale;
  yScale: YScale;
  volumeScale: d3.ScaleLinear<number, number>;
  rsScale: d3.ScaleLinear<number, number>;
}

// interface ElementRefs {
//   canvasRef: HTMLCanvasElement;
//   xRef: SVGGElement;
//   yRef: SVGGElement;
// }

// constant
const domainMultiplier = 0.01;
const barArea = 0.8;
const volumeArea = 0.2;
const rsArea = 0.4;

const dateFormat = (date: Date) => {
  const fnc = date.getMonth() === 0 ? d3.utcFormat('%Y') : d3.utcFormat('%b');
  return fnc(date);
};

const dateTooltipFormat = d3.utcFormat("%a %d %b '%y");
const priceTooltipFormat = d3.format(',.2f');

const priceFormat = (max: number) => (value: d3.NumberValue) => {
  const price = value as number;
  return max > 1000 ? d3.format('.2f')(price / 1000) + 'k' : d3.format(',.2f')(price);
};

// const dateTicks = (dates: Date[]) => {
//   const dateSet: string[] = [];
//   return dates
//     .filter((date) => {
//       const key = `${date.getMonth()},${date.getFullYear()}`;
//       if (dateSet.includes(key)) {
//         return false;
//       } else {
//         dateSet.push(key);
//         return true;
//       }
//     })
//     .slice(1);
// };

// TODO: implement new logic to find proper steps
const logTicks = (start: number, stop: number) => {
  const noOfTicks = 10;
  const diff = stop - start;
  const distance = diff / noOfTicks;
  return [
    ...new Set(
      Array(noOfTicks)
        .fill(0)
        .map((_, i) => (stop < 10 ? start + distance * i : Math.round(start + distance * i)))
        .slice(1)
        .sort(d3.ascending)
    )
  ];
};

// Custom Band Scale for canvas
// const bandScale = (range: number[], domain: Date[]) => {
//   const min = range[0];
//   const max = range[1];
//   const length = domain.length;
//   const step = Math.max(Math.ceil((max - min) / length), 3);
//   const offset = Math.max(step * (length - 1) - max, 0);
//   const fnc = (d: Date) => {
//     const index = domain.findIndex((date) => date.getTime() === d.getTime());
//     return index >= 0 ? min + step * index - offset - step : 0; // return x
//   };
//   fnc.invert = (x: number) => {
//     const index = (x + offset + step - min) / step;
//     return index >= 0 && index < length ? domain[index] : new Date(0); // return Date
//   };
//   return fnc;
// };

const getXScale = (range: number[], dates: Date[]) => {
  return d3.scaleBand<Date>().range(range).domain(dates).padding(0.8);
};

const getInvertXScale = (xScale: XScale) => {
  const domain = xScale.domain();
  const xList = domain.map((d) => xScale(d) ?? 0);
  // console.log('head =>', xList.slice(0, 10));
  // console.log('tail =>', xList.slice(-10), domain.slice(-10));
  return (x: number) => {
    const idx = d3.bisectCenter(xList, x);
    return [xList[idx], domain[idx]] as const;
  };
};

const getYScale = (range: number[], domain: number[]) => {
  return d3.scaleLog().range(range).domain(domain);
};

const getLinearScale = (range: number[], domain: number[]) => {
  return d3.scaleLinear().range(range).domain(domain);
};

const initCanvas = (canvas: HTMLCanvasElement, dms: Dimensions) => {
  canvas.width = dms.bitmapWidth;
  canvas.height = dms.bitmapHeight;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  return context;
};

const updateXScale = (xScale: XScale, transform: d3.ZoomTransform, plotWidth: number) => {
  return xScale.range([0, plotWidth].map((d) => transform.applyX(d)));
};

const updateYScale = (
  xScale: XScale,
  yScale: YScale,
  transform: d3.ZoomTransform,
  series: StockDataPoint[],
  plotWidth: number
) => {
  const visibleDomain: number[] = [];

  // find min & max visible price
  series.forEach((d) => {
    const x = xScale(d.date) ?? 0;
    const boundStart = x + transform.x + 10;
    const boundEnd = x + transform.x - 10;
    if (boundStart > 0 && boundEnd <= plotWidth) {
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
  visibleDomain[0] *= 1 - domainMultiplier;
  visibleDomain[1] *= 1 + domainMultiplier;
  return yScale.domain(visibleDomain);
};

const plotChart = (
  context: CanvasRenderingContext2D,
  series: StockDataPoint[],
  scales: ChartScales,
  plotDms: Dimensions,
  transform: d3.ZoomTransform,
  showRs = true
) => {
  // translate canvas on zoom event
  context.translate(Math.floor(transform.x), 0);

  const { xScale, yScale, volumeScale, rsScale } = scales;
  const bandWidth = Math.ceil(xScale.bandwidth());
  const correction = bandWidth % 2 === 0 ? 0 : 0.5;
  const tickLength = Math.ceil(Math.abs((xScale(series[1].date) ?? 0) - (xScale(series[0].date) ?? 0)) / 3);

  // colors
  const colorUp = getCssVar('--colors-up');
  const colorDown = getCssVar('--colors-down');
  const colorEma21 = getCssVar('--chakra-colors-gray-300');
  const colorEma50 = getCssVar('--chakra-colors-gray-400');
  const colorEma200 = getCssVar('--chakra-colors-black');
  const colorRs = getCssVar('--chakra-colors-blue-300');

  // loop data & draw on canvas
  series.forEach((d, i) => {
    const x = Math.floor(xScale(d.date) ?? 0) + correction;
    const low = yScale(d.low);
    const high = yScale(d.high);
    const close = Math.round(yScale(d.close));
    const open = Math.round(yScale(d.open));

    // if (i > 490) {
    //   console.log(x, d.date);
    // }

    // draw price bar
    context.strokeStyle = d.close > d.open ? colorUp : colorDown;
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
    const volumeBarHeight = Math.floor(volumeScale(d.volume) + plotDms.bitmapHeight * domainMultiplier);
    context.lineWidth = bandWidth * 2;
    context.beginPath();
    context.moveTo(x - correction, plotDms.bitmapHeight);
    context.lineTo(x - correction, plotDms.bitmapHeight - volumeBarHeight);
    context.stroke();
  });

  const lineWidth = Math.max(plotDms.pixelRatio, 1);

  // draw ema 21
  const ema21Line = d3
    .line<StockDataPoint>(
      (d) => (xScale(d.date) ?? 0) + bandWidth / 2,
      (d) => yScale(d.ema21 ?? 0)
    )
    .context(context);
  context.beginPath();
  ema21Line(series.filter((d) => !!d.ema21));
  context.lineWidth = lineWidth;
  context.strokeStyle = colorEma21;
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
  context.strokeStyle = colorEma50;
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
  context.strokeStyle = colorEma200;
  context.stroke();

  // draw rs line + rs rating
  if (showRs) {
    const rsLine = d3
      .line<StockDataPoint>(
        (d) => (xScale(d.date) ?? 0) + bandWidth / 2,
        (d) => rsScale(d.rs) + plotDms.bitmapHeight * 0.5
      )
      .context(context);
    context.beginPath();
    rsLine(series);
    context.lineWidth = lineWidth;
    context.strokeStyle = colorRs;
    context.stroke();

    // const xCorrection = 30 * window.devicePixelRatio;
    // const lastPoint = series.slice(-1)[0];
    // const lastX = (xScale(lastPoint.date) ?? 0) - xCorrection;
    // const lastY = rsScale(lastPoint.rs) + plotDms.bitmapHeight * 0.5;
    // // console.log('lastPoint', lastPoint);
    // const pixelRatio = window.devicePixelRatio || 1;
    // const fontSize = 12 * pixelRatio;
    // context.font = `${fontSize}px Outfit`;
    // context.textBaseline = 'middle';
    // context.fillText('RS 99', lastX, lastY);
  }
  context.restore();
};

const drawYAxis = (context: CanvasRenderingContext2D, yScale: YScale) => {
  const [min, max] = yScale.domain();
  const priceFormatFnc = priceFormat(max);
  const tickValues = logTicks(min * 0.9, max);
  const canvasHeight = context.canvas.height;
  const pixelRatio = window.devicePixelRatio || 1;
  const fontSize = 12 * pixelRatio;
  const x = 10 * pixelRatio;
  tickValues.forEach((d) => {
    const y = Math.round(yScale(d));
    if (y > 10 && y < canvasHeight) {
      context.font = `${fontSize}px Outfit`;
      context.textBaseline = 'middle';
      context.fillText(priceFormatFnc(d), x, y);
    }
  });
  context.restore();
};

// TODO: implement new logic to find proper steps
const drawXAxis = (context: CanvasRenderingContext2D, xScale: XScale, transform: d3.ZoomTransform) => {
  const tickValues = xScale.domain();
  const step = Math.abs((xScale(tickValues[0]) ?? 0) - (xScale(tickValues[1]) ?? 0));
  const canvasWidth = context.canvas.width;
  const pixelRatio = window.devicePixelRatio || 1;
  const fontSize = 12 * pixelRatio;
  const y = 15 * pixelRatio;
  let willDraw = true;
  tickValues.forEach((d, i) => {
    const x = Math.round((xScale(d) ?? 0) + transform.x);
    if (i % 21 === 0 && x > 10 && x < canvasWidth - 10 && willDraw) {
      context.font = `${fontSize}px Outfit`;
      context.textBaseline = 'middle';
      context.textAlign = 'center';
      context.fillText(dateFormat(d), x, y);
    }
    if (step < 2) {
      willDraw = !willDraw;
    }
  });
  context.restore();
};

// const drawCrosshair = (context: CanvasRenderingContext2D) => {};

export const MyStockChart: FC<StockChartProps> = ({ ticker, series, ...props }) => {
  // console.log('MyStockChart', ticker);

  const [wrapperRef, chartDms] = useChartDimensions({
    marginRight: 55,
    marginBottom: 30,
    marginTop: 0,
    marginLeft: 0
  });

  // Element Refs
  const [plotAreaRef, plotDms] = useDimensions<HTMLCanvasElement>();
  const [crosshairRef, crosshairDms] = useDimensions<HTMLCanvasElement>();
  const [xAxisRef, XAxisDms] = useDimensions<HTMLCanvasElement>();
  const [xAxisTooltipRef, xAxisTooltipDms] = useDimensions<HTMLCanvasElement>();
  const [yAxisRef, yAxisDms] = useDimensions<HTMLCanvasElement>();
  const [yAxisTooltipRef, yAxisTooltipDms] = useDimensions<HTMLCanvasElement>();
  const xScaleRef = useRef<XScale | null>(null);
  const yScaleRef = useRef<YScale | null>(null);

  const [currentTransform, setCurrentTransform] = useState<d3.ZoomTransform | null>(null);

  useEffect(() => {
    const isFew = series.length <= 80;
    const initialScale = isFew ? 1 : 3;
    const initialTranX = (-plotDms.bitmapWidth * (initialScale - 1)) / 2;
    const plotElement = plotAreaRef.current as HTMLCanvasElement;
    const plotCanvas = d3.select(plotElement);
    if (series.length > 0) {
      // prepare X & Y Scale
      const minLow = (d3.min(series.map((d) => d.low)) ?? 0) * (1 - domainMultiplier);
      const maxHigh = (d3.max(series.map((d) => d.high)) ?? 0) * (1 + domainMultiplier);
      const xScale = getXScale(
        [0, plotDms.bitmapWidth],
        series.map((d) => d.date)
      );
      const yScale = getYScale([plotDms.bitmapHeight * barArea, 0], [minLow, maxHigh]);
      const volumeScale = getLinearScale(
        [0, plotDms.bitmapHeight * volumeArea],
        [0, d3.max(series.map((d) => d.volume)) ?? 0]
      );
      const rsScale = getLinearScale(
        [plotDms.bitmapHeight * rsArea, 0],
        d3.extent(series.map((d) => d.rs)) as [number, number]
      );

      // prepare zoom
      const extent = [
        [0, 0],
        [plotDms.bitmapWidth / 2, 0]
      ] as [[number, number], [number, number]];
      const zoom = d3
        .zoom<HTMLCanvasElement, unknown>()
        .scaleExtent([1, 10])
        .translateExtent(extent)
        .extent(extent)
        .on('zoom', ({ transform }: { transform: d3.ZoomTransform }) => {
          const plotContext = initCanvas(plotElement, plotDms);
          const scales: ChartScales = {
            xScale: updateXScale(xScale, transform, plotDms.bitmapWidth), // update inplace
            yScale: updateYScale(xScale, yScale, transform, series, plotDms.bitmapWidth), // update inplace
            volumeScale,
            rsScale
          };
          xScaleRef.current = xScale;
          yScaleRef.current = yScale;
          plotChart(plotContext, series, scales, plotDms, transform, ticker !== 'SPY');

          // draw x axis
          const xAxisElement = xAxisRef.current as HTMLCanvasElement;
          const xAxisContext = initCanvas(xAxisElement, XAxisDms);
          drawXAxis(xAxisContext, xScale, transform);

          // draw y axis
          const yAxisElement = yAxisRef.current as HTMLCanvasElement;
          const yAxisContext = initCanvas(yAxisElement, yAxisDms);
          drawYAxis(yAxisContext, yScale);

          // save transform for next ticker
          setCurrentTransform(transform);
        });

      // bind zoom event
      plotCanvas.call(zoom);

      // draw canvas with initial zoom
      if (currentTransform) {
        plotCanvas.call(zoom.transform, currentTransform);
      } else {
        plotCanvas.call(zoom.transform, d3.zoomIdentity.translate(initialTranX, 0).scale(initialScale));
      }

      return () => {
        plotCanvas.on('zoom', null);
      };
    }
  }, [
    series,
    ticker,
    currentTransform,
    chartDms,
    plotAreaRef,
    plotDms,
    yAxisRef,
    yAxisDms,
    xAxisRef,
    XAxisDms,
    crosshairRef,
    crosshairDms
  ]);

  const drawCrosshair = (
    event: MouseEvent,
    xScale: XScale | null,
    yScale: YScale | null,
    currentTransform: d3.ZoomTransform | null
  ) => {
    if (!xScale || !yScale) return;
    const transform = currentTransform ? currentTransform : d3.zoomIdentity;
    const pixelRatio = crosshairDms.pixelRatio;
    const crosshairElement = crosshairRef.current as HTMLCanvasElement;
    const context = initCanvas(crosshairElement, crosshairDms);
    context.translate(Math.floor(transform.x), 0);

    const [px, py] = d3.pointer(event);
    // x
    const canvasX = px * pixelRatio - transform.x;
    const [x, date] = getInvertXScale(xScale)(canvasX);
    const adjustX = Math.floor(x) + 0.5;
    // y
    const canvasY = py * pixelRatio;
    const price = yScale.invert(canvasY);
    const adjustY = Math.ceil(canvasY) + 0.5;

    // draw vertical line
    context.beginPath();
    context.strokeStyle = getCssVar('--chakra-colors-gray-400');
    context.lineWidth = 1;
    context.setLineDash([8, 4]);
    context.moveTo(adjustX, 0);
    context.lineTo(adjustX, crosshairDms.bitmapHeight);
    context.stroke();

    // draw horizontal line
    context.beginPath();
    context.moveTo(-transform.x, adjustY);
    context.lineTo(-transform.x + crosshairDms.bitmapWidth, adjustY);
    context.stroke();

    // draw x axis tooltip
    const xTooltip = xAxisTooltipRef.current as HTMLCanvasElement;
    const xTooltipContext = initCanvas(xTooltip, xAxisTooltipDms);
    xTooltipContext.translate(Math.floor(transform.x), 0);
    drawXToolTip(xTooltipContext, adjustX, date);

    // draw y axis tooltip
    const yTooltip = yAxisTooltipRef.current as HTMLCanvasElement;
    const yTooltipContext = initCanvas(yTooltip, yAxisTooltipDms);
    drawYToolTip(yTooltipContext, adjustY, price);
  };

  const drawXToolTip = (context: CanvasRenderingContext2D, x: number, date: Date) => {
    const pixelRatio = window.devicePixelRatio || 1;
    const fontSize = 12 * pixelRatio;
    const y = 15 * pixelRatio;
    context.font = `${fontSize}px Outfit`;
    const text = `${dateTooltipFormat(date)}`;
    const textWidth = Math.floor(context.measureText(text).width + 10);

    const transformX = context.getTransform().e;
    const boundLeft = -transformX;
    const boundRight = -transformX + context.canvas.width;

    // draw wrapper rect
    const xRect =
      x - textWidth / 2 < boundLeft
        ? boundLeft
        : x + textWidth / 2 > boundRight
          ? boundRight - textWidth
          : x - textWidth / 2;
    context.fillStyle = 'black';
    context.fillRect(Math.floor(xRect), 0, textWidth, context.canvas.height);

    // fill date text
    context.fillStyle = 'white';
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.fillText(text, xRect + textWidth / 2, y);
    context.restore();
  };

  const drawYToolTip = (context: CanvasRenderingContext2D, y: number, price: number) => {
    const pixelRatio = window.devicePixelRatio || 1;
    const fontSize = 12 * pixelRatio;
    const x = 10 * pixelRatio;
    const text = `${priceTooltipFormat(price)}`;
    const rectHeight = pixelRatio * 20;

    // draw wrapper rect
    context.fillStyle = 'black';
    context.fillRect(0, y - rectHeight / 2, context.canvas.width, rectHeight);
    context.font = `${fontSize}px Outfit`;
    context.fillStyle = 'white';
    context.textBaseline = 'middle';
    context.fillText(text, x, y);
    context.restore();
  };

  return (
    <div
      ref={wrapperRef}
      {...props}
      onMouseMove={(e) => drawCrosshair(e, xScaleRef.current, yScaleRef.current, currentTransform)}>
      <canvas
        ref={crosshairRef}
        id="crosshair"
        style={{
          position: 'absolute',
          top: chartDms.marginTop,
          left: chartDms.marginLeft,
          width: chartDms.plotWidth,
          height: chartDms.plotHeight
        }}
      />
      <canvas
        ref={plotAreaRef}
        id="plotarea"
        style={{
          position: 'absolute',
          top: chartDms.marginTop,
          left: chartDms.marginLeft,
          width: chartDms.plotWidth,
          height: chartDms.plotHeight
        }}
      />
      <canvas
        ref={yAxisTooltipRef}
        id="yAxisTooltip"
        style={{
          position: 'absolute',
          top: chartDms.marginTop,
          right: 0,
          width: chartDms.width - chartDms.plotWidth,
          height: chartDms.plotHeight,
          zIndex: 1
        }}
      />
      <canvas
        ref={yAxisRef}
        id="yAxis"
        style={{
          position: 'absolute',
          top: chartDms.marginTop,
          right: 0,
          width: chartDms.width - chartDms.plotWidth,
          height: chartDms.plotHeight
        }}
      />
      <canvas
        ref={xAxisTooltipRef}
        id="xAxisTooltip"
        style={{
          position: 'absolute',
          top: chartDms.marginTop + chartDms.plotHeight,
          left: chartDms.marginLeft,
          width: chartDms.plotWidth,
          height: chartDms.height - chartDms.plotHeight,
          zIndex: 1
        }}
      />
      <canvas
        ref={xAxisRef}
        id="xAxis"
        style={{
          position: 'absolute',
          top: chartDms.marginTop + chartDms.plotHeight,
          left: chartDms.marginLeft,
          width: chartDms.plotWidth,
          height: chartDms.height - chartDms.plotHeight
        }}
      />
    </div>
  );
};
