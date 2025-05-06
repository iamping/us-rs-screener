import * as d3 from 'd3';
import { FC, useEffect } from 'react';
import { useChartDimensions } from '@/hooks/useChartDimensions';
import { Dimensions, useDimensions } from '@/hooks/useDimensions';
import { StockDataPoint } from '@/types/stock-chart';
import { getCssVar } from '@/utils/common.utils';

interface StockChartProps extends React.HTMLProps<HTMLDivElement> {
  ticker: string;
  series: StockDataPoint[];
}

interface ChartScales {
  xScale: d3.ScaleBand<Date>;
  yScale: d3.ScaleLogarithmic<number, number>;
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

const updateXScale = (xScale: d3.ScaleBand<Date>, transform: d3.ZoomTransform, plotWidth: number) => {
  return xScale.range([0, plotWidth].map((d) => transform.applyX(d)));
};

const updateYScale = (
  xScale: d3.ScaleBand<Date>,
  yScale: d3.ScaleLogarithmic<number, number>,
  transform: d3.ZoomTransform,
  series: StockDataPoint[],
  plotWidth: number
) => {
  const visibleDomain: number[] = [];
  const bandWidth = xScale.bandwidth();

  // find min & max visible price
  series.forEach((d) => {
    const x = (xScale(d.date) ?? 0) + bandWidth / 2;
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
  series.forEach((d) => {
    const x = Math.floor(xScale(d.date) ?? 0) + correction;
    const low = yScale(d.low);
    const high = yScale(d.high);
    const close = Math.round(yScale(d.close));
    const open = Math.round(yScale(d.open));

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
  }
  context.restore();
};

const drawYAxis = (context: CanvasRenderingContext2D, yScale: d3.ScaleLogarithmic<number, number>) => {
  const [min, max] = yScale.domain();
  const priceFormatFnc = priceFormat(max);
  const tickValues = logTicks(min * 0.9, max);
  const canvasHeight = context.canvas.height;
  tickValues.forEach((d) => {
    const y = Math.round(yScale(d));
    if (y > 10 && y < canvasHeight) {
      context.font = '16px Outfit';
      context.textBaseline = 'middle';
      context.fillText(priceFormatFnc(d), 10, y);
    }
  });
  context.restore();
};

// TODO: implement new logic to find proper steps
const drawXAxis = (context: CanvasRenderingContext2D, xScale: d3.ScaleBand<Date>, transform: d3.ZoomTransform) => {
  const tickValues = xScale.domain();
  const step = Math.abs((xScale(tickValues[0]) ?? 0) - (xScale(tickValues[1]) ?? 0));
  const canvasWidth = context.canvas.width;
  let willDraw = true;
  tickValues.forEach((d, i) => {
    const x = Math.round((xScale(d) ?? 0) + transform.x);
    if (i % 21 === 0 && x > 10 && x < canvasWidth - 10 && willDraw) {
      context.font = '16px Outfit';
      context.textBaseline = 'middle';
      context.textAlign = 'center';
      context.fillText(dateFormat(d), x, 20);
    }
    if (step < 2) {
      willDraw = !willDraw;
    }
  });
  context.restore();
};

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
  const [yAxisRef, yAxisDms] = useDimensions<HTMLCanvasElement>();
  const [xAxisRef, XAxisDms] = useDimensions<HTMLCanvasElement>();

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
        [0, chartDms.plotHeight * volumeArea],
        [0, d3.max(series.map((d) => d.volume)) ?? 0]
      );
      const rsScale = getLinearScale(
        [chartDms.plotHeight * rsArea, 0],
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
          plotChart(plotContext, series, scales, plotDms, transform, ticker !== 'SPY');

          // draw x axis
          const xAxisElement = xAxisRef.current as HTMLCanvasElement;
          const xAxisContext = initCanvas(xAxisElement, XAxisDms);
          drawXAxis(xAxisContext, xScale, transform);

          // draw y axis
          const yAxisElement = yAxisRef.current as HTMLCanvasElement;
          const yAxisContext = initCanvas(yAxisElement, yAxisDms);
          drawYAxis(yAxisContext, yScale);
        });

      // bind zoom event
      plotCanvas.call(zoom);

      // draw canvas with initial zoom
      plotCanvas.call(zoom.transform, d3.zoomIdentity.translate(initialTranX, 0).scale(initialScale));

      return () => {
        plotCanvas.on('zoom', null);
      };
    }
  }, [series, ticker, chartDms, plotAreaRef, plotDms, yAxisRef, yAxisDms, xAxisRef, XAxisDms]);

  return (
    <div ref={wrapperRef} id="chart-wrapper" className="chart-wrapper" {...props}>
      <canvas
        ref={plotAreaRef}
        id="canvas"
        style={{
          position: 'absolute',
          top: chartDms.marginTop,
          left: chartDms.marginLeft,
          width: chartDms.plotWidth,
          height: chartDms.plotHeight
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
