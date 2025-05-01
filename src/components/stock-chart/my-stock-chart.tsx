import * as d3 from 'd3';
import { FC, useEffect, useRef } from 'react';
import { useChartDimensions } from '@/hooks/useChartDimensions';
import { StockDataPoint } from '@/types/stock-chart';

interface StockChartProps {
  ticker: string;
  series: StockDataPoint[];
}

const dateFormat = (date: Date) => {
  const fnc = date.getMonth() === 0 ? d3.utcFormat('%Y') : d3.utcFormat('%b');
  return fnc(date);
};

const priceFormat = (value: d3.NumberValue) => {
  const price = value as number;
  return price > 1000 ? d3.format('.2f')(price / 1000) + 'k' : d3.format(',.2f')(price);
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
  const xScale = d3.scaleBand<Date>().range([0, dms.plotWidth]);
  useEffect(() => {
    if (series.length > 0 && xRef.current) {
      const dateSeries = series.map((d) => d.date);
      xScale.domain(dateSeries);
      const gX = d3.select(xRef.current as SVGGElement);
      gX.call(d3.axisBottom(xScale).tickValues(dateTicks(dateSeries)).tickFormat(dateFormat));
      gX.selectAll('text').attr('class', 'tick-value');
    }
  }, [series, xScale]);

  // Y Axis
  const yScale = d3.scaleLog().range([dms.plotHeight, 0]);
  useEffect(() => {
    if (series.length > 0 && yRef.current) {
      const min = (d3.min(series.map((d) => d.low)) ?? 0) * 0.95;
      const max = (d3.max(series.map((d) => d.high)) ?? 0) * 1.05;
      yScale.domain([min, max]);
      const gY = d3.select(yRef.current as SVGGElement);
      gY.call(d3.axisRight(yScale).tickValues(logTicks(min, max)).tickFormat(priceFormat));
      gY.selectAll('text').attr('class', 'tick-value');
    }
  }, [series, yScale]);

  // Plot Area
  useEffect(() => {
    if (series.length > 0 && plotAreaRef.current) {
      d3.select(plotAreaRef.current as SVGGElement)
        .selectAll('.lineY')
        .data(series)
        .join('line')
        .attr('class', 'lineY')
        .attr('x1', (d) => xScale(d.date) ?? 0)
        .attr('x2', (d) => xScale(d.date) ?? 0)
        .attr('y1', (d) => yScale(d.low))
        .attr('y2', (d) => yScale(d.high))
        .attr('stroke-width', 2)
        .attr('stroke', (d) => (d.close > d.open ? 'royalblue' : 'deeppink'));

      if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d') as CanvasRenderingContext2D;
        context.clearRect(0, 0, dms.plotWidth, dms.plotWidth);
        context.save();

        context.rect(200, 0, 5, 100);
        context.fill();

        context.restore();
      }
    }
  }, [series, xScale, yScale, dms]);

  return (
    <div ref={wrapperRef} id="chart-wrapper" className="chart-wrapper">
      <canvas
        ref={canvasRef}
        id="canvas"
        width={dms.plotWidth}
        height={dms.plotHeight}
        style={{
          position: 'absolute',
          top: dms.marginTop,
          left: dms.marginLeft,
          imageRendering: 'pixelated'
        }}
      />
      <svg ref={svgRef} id="stock-chart" height={dms.height} width={dms.width}>
        <g transform={`translate(${dms.marginLeft}, ${dms.marginTop})`}>
          <g ref={xRef} id="xAxis" transform={`translate(0, ${dms.plotHeight})`} />
          <g ref={yRef} id="yAxis" transform={`translate(${dms.plotWidth}, 0)`} />
          <g ref={plotAreaRef} id="plotArea" transform={`translate(0, 0)`} />
        </g>
      </svg>
    </div>
  );
};
