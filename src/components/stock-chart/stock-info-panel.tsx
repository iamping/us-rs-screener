import { Box, Flex, Spinner } from '@chakra-ui/react';
import { FC, useEffect, useState } from 'react';
import { fetchHistoricalData } from '@/services/data.service';
import { StockDataPoint } from '@/types/stock-chart';
import { MyStockChart } from './my-stock-chart';

interface StockInfoPanelProps {
  ticker: string;
}

export const StockInfoPanel: FC<StockInfoPanelProps> = ({ ticker }) => {
  const [series, setSeries] = useState<StockDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
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
      setIsLoading(false);
      setSeries(series.slice(-200));
    });
  }, [ticker]);

  console.log('render stockInfoPanel');

  return (
    <>
      {isLoading && <Spinner position="absolute" top={2} left={2} zIndex={1} />}
      <Flex height="full" direction="column">
        <div>test</div>
        <Box flexGrow={1} overflow="hidden">
          <MyStockChart ticker={ticker} series={series} />
        </Box>
      </Flex>
    </>
  );
};
