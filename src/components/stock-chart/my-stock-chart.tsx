import * as d3 from 'd3';
import { FC, useEffect, useRef, useState } from 'react';
import { useChartDimensions } from '@/hooks/useChartDimensions';
import { fetchHistoricalData } from '@/services/data.service';
import { StockDataPoint } from '@/types/stock-chart';

type StockChartProps = {
  ticker: string;
};

const dateFormat = (date: Date) => {
  const fnc = date.getMonth() === 0 ? d3.utcFormat('%Y') : d3.utcFormat('%b');
  return fnc(date);
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

const priceFormat = d3.format(',.2s');

export const MyStockChart: FC<StockChartProps> = ({ ticker }) => {
  const [series, setSeries] = useState<StockDataPoint[]>([]);
  const [wrapperRef, dms] = useChartDimensions({ marginRight: 40, marginBottom: 30, marginTop: 20, marginLeft: 20 });

  // Element Refs
  const xRef = useRef<SVGGElement>(null);
  const yRef = useRef<SVGGElement>(null);
  const plotAreaRef = useRef<SVGGElement>(null);

  useEffect(() => {
    fetchHistoricalData(ticker).then((data) => {
      const series = [];
      for (let i = 0; i < data.date.length; i++) {
        series.push({
          close: data.close[i],
          high: data.high[i],
          low: data.low[i],
          open: data.open[i],
          volume: data.volume[i],
          date: new Date(data.date[i] * 1000)
        });
      }
      setSeries(series.slice(-200));
    });
  }, [ticker]);

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
    }
  }, [series, xScale, yScale]);

  return (
    <div id="chart-wrapper" ref={wrapperRef} style={{ height: '100%' }}>
      <svg id="stock-chart" height={dms.height} width={dms.width}>
        <g transform={`translate(${dms.marginLeft}, ${dms.marginTop})`}>
          <g id="xAxis" ref={xRef} transform={`translate(0, ${dms.plotHeight})`} />
          <g id="yAxis" ref={yRef} transform={`translate(${dms.plotWidth}, 0)`} />
          <g id="plotArea" ref={plotAreaRef} transform={`translate(0, 0)`} />
        </g>
      </svg>
    </div>
  );
};
