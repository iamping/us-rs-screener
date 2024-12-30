import { useAtomValue } from 'jotai';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { stockListAtom } from '../../state/atom';
import { fetchHistoricalData } from '../../services/data.service';
import { Heading, Spinner, Text } from '@chakra-ui/react';
import { HistoricalData } from '../../models/historical-data';
import { chartOptions, prepareSeries } from '../../utils/chart.util';
import Highcharts from 'highcharts/highstock';
import HighchartsReact, { HighchartsReactRefObject } from 'highcharts-react-official';
import 'highcharts/indicators/indicators';

export const HistoricalChart: FC<{ ticker: string }> = ({ ticker }) => {
  const [isLoading, setIsLoading] = useState(false);
  const stockList = useAtomValue(stockListAtom);
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const chartRef = useRef<HighchartsReactRefObject>(null);

  const stock = useMemo(() => {
    return stockList.find((e) => e.ticker === ticker);
  }, [ticker, stockList]);

  useEffect(() => {
    setIsLoading(true);
    fetchHistoricalData(ticker)
      .then((response) => response.clone().json())
      .then((data: HistoricalData) => setHistoricalData(data))
      .catch((e) => {
        console.log(e);
        setHistoricalData({} as HistoricalData);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [ticker]);

  const series = useMemo(() => {
    return prepareSeries(historicalData);
  }, [historicalData]);

  const options: Highcharts.Options = useMemo(() => {
    return chartOptions(series);
  }, [series]);

  return (
    <>
      <Heading size="md" padding={3}>
        {ticker} -{' '}
        <Text as={'span'} fontWeight={400} color="gray">
          {stock?.companyName}
        </Text>
      </Heading>
      {isLoading && <Spinner position="absolute" top={2} right={12} />}
      {historicalData && Object.keys(historicalData).length === 0 && 'Something wrong.'}
      <HighchartsReact ref={chartRef} highcharts={Highcharts} constructorType={'stockChart'} options={options} />
    </>
  );
};
