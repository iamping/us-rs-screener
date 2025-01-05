import { useAtomValue, useSetAtom } from 'jotai';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { stockInfoAtom, stockListAtom } from '../../state/atom';
import { fetchHistoricalData } from '../../services/data.service';
import { Spinner, Text } from '@chakra-ui/react';
import { HistoricalData } from '../../models/historical-data';
import { chartGlobalOptions, chartOptions, prepareSeries } from '../../utils/chart.util';
import Highcharts from 'highcharts/highstock';
import HighchartsReact, { HighchartsReactRefObject } from 'highcharts-react-official';
import 'highcharts/indicators/indicators';
import { useDebounceCallback, useResizeObserver } from 'usehooks-ts';
import { formatDecimal } from '../../utils/common.util';
import { Stock } from '../../models/stock';

// Set global options before creating the chart
Highcharts.setOptions(chartGlobalOptions);

export const HistoricalChart: FC<{ ticker: string }> = ({ ticker }) => {
  const stockList = useAtomValue(stockListAtom);
  const setStockInfo = useSetAtom(stockInfoAtom);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [spyData, setSpyData] = useState<HistoricalData | null>(null);
  const [dynamicHeight, setDynamicHeight] = useState(window.innerHeight);
  const chartRef = useRef<HighchartsReactRefObject>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const stock = useMemo(() => {
    return stockList.find((e) => e.ticker === ticker);
  }, [ticker, stockList]);

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);
    Promise.all([fetchHistoricalData(ticker), fetchHistoricalData('SPY')])
      .then((data: HistoricalData[]) => {
        setHistoricalData(data[0]);
        setSpyData(data[1]);
      })
      .catch((e) => {
        console.log(e);
        setIsError(true);
        setHistoricalData({} as HistoricalData);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [ticker]);

  const onResize = useDebounceCallback((size) => {
    setDynamicHeight(size.height);
  }, 200);

  useResizeObserver({
    ref: wrapperRef,
    box: 'border-box',
    onResize
  });

  const series = useMemo(() => {
    return prepareSeries(historicalData, spyData, stock);
  }, [historicalData, spyData, stock]);

  const options: Highcharts.Options | null = useMemo(() => {
    if (series.ohlc.length > 0 && stock) {
      return chartOptions(series, stock, dynamicHeight, setStockInfo);
    }
    return null;
  }, [series, stock, dynamicHeight, setStockInfo]);

  return (
    <>
      <div ref={wrapperRef} style={{ height: '100%', position: 'relative' }}>
        {isLoading && <Spinner position="absolute" top={2} right={12} zIndex={1} />}
        {isError && <Text margin={2}>Something went wrong. Please try again.</Text>}
        {options && stock && !isLoading && !isError && (
          <>
            <ChartHeader stock={stock} />
            <HighchartsReact ref={chartRef} highcharts={Highcharts} constructorType={'stockChart'} options={options} />
          </>
        )}
      </div>
    </>
  );
};

const ChartHeader: FC<{ stock: Stock }> = ({ stock }) => {
  const stockInfo = useAtomValue(stockInfoAtom);
  return (
    <Text
      className="chart-stock-info"
      fontSize="sm"
      position="absolute"
      whiteSpace="nowrap"
      backgroundColor="white/50"
      zIndex={1}
      top={12}
      left="18px">
      <Text as={'span'} fontWeight={500}>
        {stock.ticker}
      </Text>
      <Text as={'span'} color="gray.500">
        {` - ${stock.companyName}`}
      </Text>
      <Text as={'span'} display="block" fontSize="xs">
        <b>C</b>
        <span className={`change${stockInfo.change}`}>
          {stock.close} {formatDecimal(stockInfo.change, true)} ({formatDecimal(stockInfo.percentChange, true)}%){' '}
        </span>
        <b>Vol</b>
        <span className={`change${stockInfo.change}`}>{formatDecimal(stockInfo.volume / 1000000)}M</span>
      </Text>
    </Text>
  );
};
