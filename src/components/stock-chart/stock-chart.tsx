import { CloseButton, Spinner, Text } from '@chakra-ui/react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact, { HighchartsReactRefObject } from 'highcharts-react-official';
import { useAtomValue, useSetAtom } from 'jotai';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import 'highcharts/indicators/indicators';
import { chartGlobalOptions, chartOptions, prepareSeries } from '@/helpers/chart.helper';
import { fetchHistoricalData } from '@/services/data.service';
import { stockInfoAtom, stockListAtom, tickerAtom } from '@/states/atom';
import { HistoricalData } from '@/types/stock-chart';
import { StockInfoTicker } from './stock-info-ticker';

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
  const chartRef = useRef<HighchartsReactRefObject>(null);

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

  const series = useMemo(() => {
    return prepareSeries(historicalData, spyData, stock);
  }, [historicalData, spyData, stock]);

  const options: Highcharts.Options | null = useMemo(() => {
    if (series.ohlc.length > 0 && stock) {
      return chartOptions(series, stock, setStockInfo);
    }
    return null;
  }, [series, stock, setStockInfo]);

  return (
    <>
      <div style={{ position: 'relative' }}>
        {options && stock && !isLoading && !isError && (
          <>
            <StockInfoTicker stock={stock} />
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
        {isLoading && <Spinner position="absolute" top={2} right={12} zIndex={1} />}
        {isError && (
          <Text margin={2} float="left">
            Something went wrong. Please try again.
          </Text>
        )}
      </div>
    </>
  );
};
