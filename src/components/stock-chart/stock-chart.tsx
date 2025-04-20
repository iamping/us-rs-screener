import { CloseButton, Spinner, Text } from '@chakra-ui/react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact, { HighchartsReactRefObject } from 'highcharts-react-official';
import { useAtomValue, useSetAtom } from 'jotai';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounceCallback, useResizeObserver } from 'usehooks-ts';
import 'highcharts/indicators/indicators';
import { chartGlobalOptions, chartOptions, prepareSeries } from '@/helpers/chart.helper';
import { fetchHistoricalData } from '@/services/data.service';
import { stockInfoAtom, stockListAtom, tickerAtom } from '@/states/atom';
import { HistoricalData } from '@/types/historical-data';
import { Stock } from '@/types/stock';
import { formatDecimal } from '@/utils/common.utils';

// Set global options before creating the chart
Highcharts.setOptions(chartGlobalOptions);

export const StockChart: FC<{ ticker: string }> = ({ ticker }) => {
  const stockList = useAtomValue(stockListAtom);
  const setStockInfo = useSetAtom(stockInfoAtom);
  const setTicker = useSetAtom(tickerAtom);
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
        <CloseButton
          size="2xs"
          variant="subtle"
          position="absolute"
          borderRadius={0}
          top={2}
          right={2}
          zIndex={1}
          onClick={() => setTicker('')}
        />
      </div>
    </>
  );
};

const ChartHeader: FC<{ stock: Stock }> = ({ stock }) => {
  const stockInfo = useAtomValue(stockInfoAtom);
  const marqueeContent = (
    <>
      <p>
        Market Cap: <span>{formatDecimal(stock.marketCap / 1000000000)}B</span>
      </p>
      <p>
        Avg $ Vol: <span>{formatDecimal(stock.avgDollarVolume / 1000000)}M</span>
      </p>
      <p>
        R.Vol: <span>{formatDecimal(stock.relativeVolume)}</span>
      </p>
      <p>
        Industry: <span>{stock.industry}</span>
      </p>
      <p>
        Industry Rank: <span>{stock.industryRank}</span>
      </p>
    </>
  );
  return (
    <>
      <div className="marquee-wrapper">
        <div className="marquee">
          {marqueeContent}
          {marqueeContent}
        </div>
      </div>
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
    </>
  );
};
