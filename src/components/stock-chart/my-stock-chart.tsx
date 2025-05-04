import * as d3 from 'd3';
import { FC, useEffect, useRef } from 'react';
import { ChartDimensions, useChartDimensions } from '@/hooks/useChartDimensions';
import { StockDataPoint } from '@/types/stock-chart';
import { getCssVar } from '@/utils/common.utils';

interface StockChartProps extends React.HTMLProps<HTMLDivElement> {
  ticker: string;
  series: StockDataPoint[];
}

interface ChartScales {
  xScale: d3.ScaleBand<Date>;
  yScale: d3.ScaleLogarithmic<number, number>;
  volumeYScale: d3.ScaleLinear<number, number>;
  rsYScale: d3.ScaleLinear<number, number>;
}

interface ElementRefs {
  canvasRef: HTMLCanvasElement;
  xRef: SVGGElement;
  yRef: SVGGElement;
}

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

const logTicks = (start: number, stop: number) => {
  const noOfTicks = 10;
  const diff = stop - start;
  const distance = diff / noOfTicks;
  return Array(noOfTicks)
    .fill(0)
    .map((_, i) => Math.round(start + distance * i))
    .slice(1);
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

// constant
const dpr = 3;
const domainMultiplier = 0.01;
const barArea = 0.8;
const volumeArea = 0.2;
const rsArea = 0.4;

const initCanvas = (canvas: HTMLCanvasElement, dms: ChartDimensions, dpr: number) => {
  canvas.width = dms.plotWidth * dpr;
  canvas.height = dms.plotHeight * dpr;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.scale(dpr, dpr);
  return context;
};

const getVisibleDomain = (
  series: StockDataPoint[],
  transform: d3.ZoomTransform,
  scales: ChartScales,
  plotWidth: number
) => {
  const { xScale } = scales;
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
  return visibleDomain;
};

const drawYAxis = (
  series: StockDataPoint[],
  transform: d3.ZoomTransform,
  elementRefs: ElementRefs,
  scales: ChartScales,
  plotWidth: number
) => {
  const { yRef } = elementRefs;
  const { yScale } = scales;

  // update domain
  const [min, max] = getVisibleDomain(series, transform, scales, plotWidth);
  yScale.domain([min, max]);

  // draw Y axis
  const gy = d3.select(yRef);
  gy.call(d3.axisRight(yScale).tickValues(logTicks(min, max)).tickFormat(priceFormat(max)))
    .selectAll('text')
    .attr('class', 'tick-value');
  gy.select('path').remove();
  gy.selectAll('line').remove();
};

const drawChart = (
  series: StockDataPoint[],
  transform: d3.ZoomTransform,
  elementRefs: ElementRefs,
  scales: ChartScales,
  dms: ChartDimensions,
  showRs = true
) => {
  // clear canvas & translate on zoom event
  const { canvasRef, xRef } = elementRefs;
  const context = initCanvas(canvasRef, dms, dpr);
  context.translate(transform.x, 0);

  // update domain & draw Y axis
  drawYAxis(series, transform, elementRefs, scales, dms.plotWidth);

  // clear x axis
  const gx = d3.select(xRef);
  gx.select('path').remove();
  gx.selectAll('.tick').remove();

  const { xScale, yScale, volumeYScale, rsYScale } = scales;
  // const visibleDomain: number[] = [];
  const bandWidth = xScale.bandwidth();
  const padding = xScale.padding() + (transform.k > 8 ? 2 : 0);

  // colors
  const colorUp = getCssVar('--colors-up');
  const colorDown = getCssVar('--colors-down');
  const colorEma21 = getCssVar('--chakra-colors-gray-300');
  const colorEma50 = getCssVar('--chakra-colors-gray-400');
  const colorEma200 = getCssVar('--chakra-colors-black');
  const colorRs = getCssVar('--chakra-colors-blue-300');

  // loop data & draw on canvas
  series.forEach((d, i) => {
    const x = (xScale(d.date) ?? 0) + bandWidth / 2;
    const low = yScale(d.low);
    const high = yScale(d.high);
    const close = yScale(d.close);
    const open = yScale(d.open);

    // draw price bar
    context.strokeStyle = d.close > d.open ? colorUp : colorDown;
    context.lineWidth = bandWidth;
    context.beginPath();
    context.moveTo(x, low + bandWidth / 2);
    context.lineTo(x, high - bandWidth / 2);
    context.moveTo(x, open);
    context.lineTo(x - bandWidth - padding, open);
    context.moveTo(x, close);
    context.lineTo(x + bandWidth + padding, close);
    context.stroke();

    // draw volume bar
    context.lineWidth = bandWidth * 2;
    context.beginPath();
    context.moveTo(x, dms.plotHeight);
    context.lineTo(x, dms.plotHeight - volumeYScale(d.volume) + dms.plotHeight * domainMultiplier);
    context.stroke();

    // find min & max visible price
    const boundStart = x + transform.x + 10;
    const boundEnd = x + transform.x - 10;

    // manually add x ticks
    if (i % 21 === 0 && boundEnd <= dms.plotWidth - 20 && boundStart - 20 > 0) {
      const tick = gx
        .append('g')
        .attr('class', 'tick')
        .attr('transform', `translate(${x + transform.x},0)`);
      tick
        .insert('text')
        .attr('class', 'tick-value')
        .attr('y', 9)
        .attr('dy', '0.7em')
        .attr('fill', 'currentColor')
        .text(dateFormat(d.date));
    }
  });

  // draw ema 21
  const ema21Line = d3
    .line<StockDataPoint>(
      (d) => (xScale(d.date) ?? 0) + bandWidth / 2,
      (d) => yScale(d.ema21 ?? 0)
    )
    .context(context);
  context.beginPath();
  ema21Line(series.filter((d) => !!d.ema21));
  context.lineWidth = 1;
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
  context.lineWidth = 1;
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
  context.lineWidth = 1;
  context.strokeStyle = colorEma200;
  context.stroke();

  // draw rs line + rs rating
  if (showRs) {
    const rsLine = d3
      .line<StockDataPoint>(
        (d) => (xScale(d.date) ?? 0) + bandWidth / 2,
        (d) => rsYScale(d.rs) + dms.plotHeight * 0.5
      )
      .context(context);
    context.beginPath();
    rsLine(series);
    context.lineWidth = 1;
    context.strokeStyle = colorRs;
    context.stroke();

    // context.font = '30px Outfit';
    // context.fillStyle = 'blue';
    // console.log(dms.plotWidth * transform.k + transform.x - 100);
    // context.fillText('99', dms.plotWidth * transform.k + transform.x - 100, dms.plotHeight - 100);
    // context.fillText('99', dms.plotWidth * (transform.k - 1) + transform.x, 50);
    // context.fillText('99', dms.plotWidth * (transform.k - 2) + transform.x, 50);
  }
};

export const MyStockChart: FC<StockChartProps> = ({ ticker, series, ...props }) => {
  // console.log('MyStockChart', ticker);

  const [wrapperRef, dms] = useChartDimensions({
    marginRight: 55,
    marginBottom: 30,
    marginTop: 0,
    marginLeft: 0
  });

  // Element Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const xRef = useRef<SVGGElement>(null);
  const yRef = useRef<SVGGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // X Axis
  // const xScale = d3.scaleBand<Date>().range([0, dms.plotWidth]).padding(0.8);
  // useEffect(() => {
  //   if (series.length > 0) {
  //     const dateSeries = series.map((d) => d.date);
  //     xScale.domain(dateSeries);
  //     // const gX = d3.select(xRef.current as SVGGElement);
  //     // gX.call(d3.axisBottom(xScale).tickValues(dateTicks(dateSeries)).tickFormat(dateFormat));
  //     // gX.selectAll('text').attr('class', 'tick-value');
  //   }
  // }, [series, xScale]);

  // Custom X Scale
  // const xScale = useMemo(() => {
  //   return bandScale(
  //     [0, dms.plotWidth],
  //     series.map((d) => d.date)
  //   );
  // }, [dms, series]);

  // Y Axis
  // const yScale = d3.scaleLog().range([dms.plotHeight, 0]);
  // useEffect(() => {
  //   if (series.length > 0) {
  //     const min = (d3.min(series.map((d) => d.low)) ?? 0) * 0.95;
  //     const max = (d3.max(series.map((d) => d.high)) ?? 0) * 1.05;
  //     yScale.domain([min, max]);
  //     const gY = d3.select(yRef.current as SVGGElement);
  //     gY.call(d3.axisRight(yScale).tickValues(logTicks(min, max)).tickFormat(priceFormat(max)));
  //     gY.selectAll('text').attr('class', 'tick-value');
  //     gY.select('path').remove();
  //     gY.selectAll('line').remove();
  //   }
  // }, [series, yScale]);

  useEffect(() => {
    const initialScale = 3;
    const initialTranX = (-dms.plotWidth * (initialScale - 1)) / 2;
    const canvasElement = canvasRef.current as HTMLCanvasElement;
    const canvas = d3.select(canvasElement);
    if (series.length > 0) {
      // draw elements
      const elements: ElementRefs = {
        canvasRef: canvasElement,
        xRef: xRef.current as SVGGElement,
        yRef: yRef.current as SVGGElement
      };

      // prepare X & Y Scale
      const minLow = (d3.min(series.map((d) => d.low)) ?? 0) * (1 - domainMultiplier);
      const maxHigh = (d3.max(series.map((d) => d.high)) ?? 0) * (1 + domainMultiplier);
      const xScale = getXScale(
        [0, dms.plotWidth],
        series.map((d) => d.date)
      );
      const yScale = getYScale([dms.plotHeight * barArea, 0], [minLow, maxHigh]);
      const volumeYScale = getLinearScale(
        [0, dms.plotHeight * volumeArea],
        [0, d3.max(series.map((d) => d.volume)) ?? 0]
      );
      const rsYScale = getLinearScale(
        [dms.plotHeight * rsArea, 0],
        d3.extent(series.map((d) => d.rs)) as [number, number]
      );
      const scales: ChartScales = {
        xScale,
        yScale,
        volumeYScale,
        rsYScale
      };

      // prepare zoom
      const extent = [
        [0, 0],
        [dms.plotWidth / 2, 0]
      ] as [[number, number], [number, number]];
      const zoom = d3
        .zoom<HTMLCanvasElement, unknown>()
        .scaleExtent([2, 10])
        .translateExtent(extent)
        .extent(extent)
        .on('zoom', ({ transform }: { transform: d3.ZoomTransform }) => {
          xScale.range([0, dms.plotWidth].map((d) => transform.applyX(d)));
          drawChart(series, transform, elements, scales, dms, ticker !== 'SPY');
        });

      // bind zoom event
      canvas.call(zoom);

      // draw canvas with initial zoom
      canvas.call(zoom.transform, d3.zoomIdentity.translate(initialTranX, 0).scale(initialScale));

      return () => {
        canvas.on('zoom', null);
      };
    }
  }, [series, ticker, dms]);

  return (
    <div ref={wrapperRef} id="chart-wrapper" className="chart-wrapper" {...props}>
      <canvas
        ref={canvasRef}
        id="canvas"
        style={{
          position: 'absolute',
          top: dms.marginTop,
          left: dms.marginLeft,
          width: dms.plotWidth,
          height: dms.plotHeight
        }}
      />
      <svg ref={svgRef} id="stock-chart-svg" height={dms.height} width={dms.width}>
        <g transform={`translate(${dms.marginLeft}, ${dms.marginTop})`}>
          {/* <XAxis
            id="customXAxis"
            series={series}
            xScale={xScale}
            width={dms.plotWidth}
            transform={`translate(0, ${dms.plotHeight})`}
            fill="none"
            /> */}
          <g ref={xRef} id="xAxis" transform={`translate(0, ${dms.plotHeight})`} />
          <g ref={yRef} id="yAxis" transform={`translate(${dms.plotWidth}, 0)`} />
        </g>
      </svg>
    </div>
  );
};

// interface XAxisProps extends React.SVGProps<SVGGElement> {
//   series: StockDataPoint[];
//   width: number;
//   xScale: (d: Date) => number;
// }

// const XAxis: FC<XAxisProps> = ({ width, series, xScale, ...props }) => {
//   if (series.length === 0) return null;
//   return (
//     <g {...props}>
//       <path className="domain" stroke="currentColor" d={`M0,6V0H${width}V6`} />
//       {dateTicks(series.map((d) => d.date)).map((date, i) => {
//         const x = xScale(date) ?? 0;
//         const no = 30;
//         const step = width / no;
//         if (x < step || x > step * (no - 1)) return null;
//         return (
//           <g key={i} className="tick" transform={`translate(${x}, 0)`}>
//             <line stroke="currentColor" y2="6" />
//             <text className="tick-value" fill="currentColor" y="9" dy="0.71em" textAnchor="middle">
//               {dateFormat(date)}
//             </text>
//           </g>
//         );
//       })}
//     </g>
//   );
// };
