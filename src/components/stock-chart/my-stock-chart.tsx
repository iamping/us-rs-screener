import * as d3 from 'd3';
import { FC, useEffect, useRef } from 'react';
import { ChartDimensions, useChartDimensions } from '@/hooks/useChartDimensions';
import { StockDataPoint } from '@/types/stock-chart';

interface StockChartProps {
  ticker: string;
  series: StockDataPoint[];
}

const dateFormat = (date: Date) => {
  const fnc = date.getMonth() === 0 ? d3.utcFormat('%Y') : d3.utcFormat('%b');
  return fnc(date);
};

const priceFormat = (max: number) => (value: d3.NumberValue) => {
  const price = value as number;
  return max > 1000 ? d3.format('.2f')(price / 1000) + 'k' : d3.format(',.2f')(price);
};

const dateTicks = (dates: Date[]) => {
  const dateSet: string[] = [];
  return dates
    .filter((date) => {
      const key = `${date.getMonth()},${date.getFullYear()}`;
      if (dateSet.includes(key)) {
        return false;
      } else {
        dateSet.push(key);
        return true;
      }
    })
    .slice(1);
};

const logTicks = (start: number, stop: number) => {
  const noOfTicks = 9;
  const diff = stop - start;
  const distance = diff / noOfTicks;
  return Array(noOfTicks)
    .fill(0)
    .map((_, i) => start + distance * i)
    .slice(1);
};

const dpr = 2;

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

export const MyStockChart: FC<StockChartProps> = ({ ticker, series }) => {
  console.log('MyStockChart', ticker);

  const [wrapperRef, dms] = useChartDimensions({
    marginRight: 55,
    marginBottom: 30,
    marginTop: 20,
    marginLeft: 10
  });

  // Element Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const xRef = useRef<SVGGElement>(null);
  const yRef = useRef<SVGGElement>(null);
  const plotAreaRef = useRef<SVGGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // X Axis
  const xScale = d3.scaleBand<Date>().range([0, dms.plotWidth]).padding(0.8);
  useEffect(() => {
    if (series.length > 0 && xRef.current) {
      const dateSeries = series.map((d) => d.date);
      xScale.domain(dateSeries);
      const gX = d3.select(xRef.current as SVGGElement);
      gX.call(d3.axisBottom(xScale).tickValues(dateTicks(dateSeries)).tickFormat(dateFormat));
      gX.selectAll('text').attr('class', 'tick-value');
    }
  }, [series, xScale]);

  // Custom X Scale
  // const xScale = useMemo(() => {
  //   return bandScale(
  //     [0, dms.plotWidth],
  //     series.map((d) => d.date)
  //   );
  // }, [dms, series]);

  // Y Axis
  const yScale = d3.scaleLog().range([dms.plotHeight, 0]);
  useEffect(() => {
    if (series.length > 0 && yRef.current) {
      const min = (d3.min(series.map((d) => d.low)) ?? 0) * 0.95;
      const max = (d3.max(series.map((d) => d.high)) ?? 0) * 1.05;
      yScale.domain([min, max]);
      const gY = d3.select(yRef.current as SVGGElement);
      gY.call(d3.axisRight(yScale).tickValues(logTicks(min, max)).tickFormat(priceFormat(max)));
      gY.selectAll('text').attr('class', 'tick-value');
    }
  }, [series, yScale]);

  const initCanvas = (canvas: HTMLCanvasElement, dms: ChartDimensions, dpr: number) => {
    canvas.width = dms.plotWidth * dpr;
    canvas.height = dms.plotHeight * dpr;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.scale(dpr, dpr);
    return context;
  };

  // Plot Area
  useEffect(() => {
    if (series.length > 0 && plotAreaRef.current) {
      // d3.select(plotAreaRef.current as SVGGElement)
      //   .selectAll('.lineY')
      //   .data(series)
      //   .join('line')
      //   .attr('class', 'lineY')
      //   .attr('x1', (d) => xScale(d.date) ?? 0)
      //   .attr('x2', (d) => xScale(d.date) ?? 0)
      //   .attr('y1', (d) => yScale(d.low))
      //   .attr('y2', (d) => yScale(d.high))
      //   .attr('stroke-width', 2)
      //   .attr('stroke', (d) => (d.close > d.open ? 'royalblue' : 'deeppink'));

      if (canvasRef.current) {
        const context = initCanvas(canvasRef.current, dms, dpr);
        const bandWidth = xScale.bandwidth();
        const padding = xScale.padding() * 2;
        series.forEach((d) => {
          const x = (xScale(d.date) ?? 0) + bandWidth / 2;
          const low = yScale(d.low);
          const high = yScale(d.high);
          const close = yScale(d.close);
          const open = yScale(d.open);

          context.strokeStyle = d.close > d.open ? 'royalblue' : 'deeppink';
          context.lineWidth = bandWidth;
          context.beginPath();
          context.moveTo(x, low + bandWidth / 2);
          context.lineTo(x, high - bandWidth / 2);
          context.moveTo(x, open);
          context.lineTo(x - bandWidth - padding, open);
          context.moveTo(x, close);
          context.lineTo(x + bandWidth + padding, close);
          context.stroke();

          // context.fillStyle = d.close > d.open ? 'royalblue' : 'deeppink';
          // context.fillRect(x, high - bandWidth / 2, bandWidth, low - high + bandWidth);
          // console.log('open', d.open, ', high', d.high, ', low', d.low);
          // context.fillRect(x - bandWidth, yOpen, bandWidth + 1, bandWidth);
          // context.fillRect(x + bandWidth - 1, yClose, bandWidth + 1, bandWidth);
        });
      }
    }
  }, [series, xScale, yScale, dms]);

  return (
    <div ref={wrapperRef} id="chart-wrapper" className="chart-wrapper">
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
      <svg ref={svgRef} id="stock-chart" height={dms.height} width={dms.width}>
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
          <g ref={plotAreaRef} id="plotArea" transform={`translate(0, 0)`} />
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
