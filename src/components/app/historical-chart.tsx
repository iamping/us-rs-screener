import { useAtomValue } from 'jotai';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { stockListAtom } from '../../state/atom';
import { fetchHistoricalData } from '../../services/data.service';
import { Heading, Spinner, Text } from '@chakra-ui/react';
import { HistoricalData } from '../../models/historical-data';
import { chartGlobalOptions, chartOptions, prepareSeries } from '../../utils/chart.util';
import Highcharts from 'highcharts/highstock';
import HighchartsReact, { HighchartsReactRefObject } from 'highcharts-react-official';
import 'highcharts/indicators/indicators';
import { useDebounceCallback, useResizeObserver } from 'usehooks-ts';

export const HistoricalChart: FC<{ ticker: string }> = ({ ticker }) => {
  const stockList = useAtomValue(stockListAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [spyData, setSpyData] = useState<HistoricalData | null>(null);
  const chartRef = useRef<HighchartsReactRefObject>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dynamicHeight, setDynamicHeight] = useState(0);

  const stock = useMemo(() => {
    return stockList.find((e) => e.ticker === ticker);
  }, [ticker, stockList]);

  useEffect(() => {
    setIsLoading(true);
    chartRef.current?.chart.showLoading();
    Promise.all([fetchHistoricalData(ticker), fetchHistoricalData('SPY')])
      .then((data: HistoricalData[]) => {
        setHistoricalData(data[0]);
        setSpyData(data[1]);
      })
      .catch((e) => {
        console.log(e);
        setHistoricalData({} as HistoricalData);
      })
      .finally(() => {
        setIsLoading(false);
        chartRef.current?.chart.hideLoading();
      });
  }, [ticker]);

  const onResize = useDebounceCallback((size) => {
    setDynamicHeight(size.height - 48);
  }, 200);

  useResizeObserver({
    ref: wrapperRef,
    box: 'border-box',
    onResize
  });

  useEffect(() => {
    Highcharts.setOptions(chartGlobalOptions);
  }, []);

  const series = useMemo(() => {
    return prepareSeries(historicalData, spyData, stock);
  }, [historicalData, spyData, stock]);

  const options: Highcharts.Options = useMemo(() => {
    return chartOptions(series, stock, dynamicHeight);
  }, [series, stock, dynamicHeight]);

  console.log('re-render');

  return (
    <>
      <div ref={wrapperRef} style={{ height: 'var(--content-max-height)' }}>
        <Heading size="md" padding={3}>
          {ticker} -{' '}
          <Text as={'span'} fontWeight={400} color="gray">
            {stock?.companyName}
          </Text>
        </Heading>
        {isLoading && <Spinner position="absolute" top={2} right={12} />}
        {historicalData && Object.keys(historicalData).length === 0 && 'Something wrong.'}
        <HighchartsReact ref={chartRef} highcharts={Highcharts} constructorType={'stockChart'} options={options} />
      </div>
    </>
  );
};
