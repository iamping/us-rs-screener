import { Box, CloseButton, Flex, Heading, HStack, Link, SegmentGroup, Spacer, Text } from '@chakra-ui/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { FC, useEffect, useMemo, useState } from 'react';
import { LuChartCandlestick, LuInfo } from 'react-icons/lu';
import { fetchHistoricalData } from '@/services/data.service';
import { stockListAtom, tickerAtom } from '@/states/atom';
import { Stock } from '@/types/stock';
import { StockDataPoint } from '@/types/stock-chart';
import { MyStockChart } from './my-stock-chart';

interface StockInfoPanelProps {
  ticker: string;
}

export const StockInfoPanel: FC<StockInfoPanelProps> = ({ ticker }) => {
  const [series, setSeries] = useState<StockDataPoint[]>([]);
  const [status, setStatus] = useState<'loading' | 'normal' | 'error'>('normal');
  const [retry, setRetry] = useState(0);
  const [segment, setSegment] = useState('chart');
  const stockList = useAtomValue(stockListAtom);
  const setTicker = useSetAtom(tickerAtom);

  const isLoading = status === 'loading';
  const isError = status === 'error';
  const showChart = segment === 'chart';

  const stockInfo = useMemo(() => {
    return stockList.find((e) => e.ticker === ticker)!;
  }, [ticker, stockList]);

  const items = [
    { value: 'chart', label: <LuChartCandlestick /> },
    { value: 'info', label: <LuInfo /> }
  ];

  useEffect(() => {
    setStatus('loading');
    fetchHistoricalData(ticker)
      .then((data) => {
        const temp: StockDataPoint[] = [];
        for (let i = 0; i < data.date.length; i++) {
          temp.push({
            close: data.close[i],
            high: data.high[i],
            low: data.low[i],
            open: data.open[i],
            volume: data.volume[i],
            date: new Date(data.date[i] * 1000)
          });
        }
        setSeries(temp);
        setStatus('normal');
      })
      .catch(() => {
        setStatus('error');
      });
  }, [ticker, retry]);

  console.log('render stockInfoPanel');

  if (isError) {
    return (
      <Flex margin={2} gap={2}>
        <Text>
          Something went wrong. Please{' '}
          <Link colorPalette="red" onClick={() => setRetry((val) => val + 1)}>
            try again.
          </Link>
        </Text>
        <Spacer />
        <CloseButton size="2xs" variant="subtle" zIndex={1} loading={isLoading} onClick={() => setTicker('')} />
      </Flex>
    );
  }

  return (
    <>
      <Flex height="full" direction="column">
        <Flex margin={2} gap={2}>
          <Box>{isLoading ? <Text>Loading...</Text> : <HeadLine stockInfo={stockInfo} />}</Box>
          <Spacer />
          <SegmentGroup.Root
            disabled={isLoading}
            size="xs"
            value={segment}
            onValueChange={(e) => setSegment(e.value ?? '')}>
            <SegmentGroup.Indicator backgroundColor="white" />
            <SegmentGroup.Items items={items} />
          </SegmentGroup.Root>
          <CloseButton size="2xs" variant="subtle" zIndex={1} loading={isLoading} onClick={() => setTicker('')} />
        </Flex>
        {showChart && (
          <MyStockChart
            id="stock-chart"
            className="stock-chart"
            data-loading={isLoading}
            ticker={ticker}
            series={series}
          />
        )}
      </Flex>
    </>
  );
};

const HeadLine = ({ stockInfo }: { stockInfo: Stock }) => {
  return (
    <>
      <HStack>
        <Heading size="md" fontWeight="500">
          {stockInfo.companyName}
        </Heading>
        <Text fontWeight="500" color="gray.500">
          ({stockInfo.ticker})
        </Text>
        {/* <Text>{stockInfo.close}</Text>
        <Text>{stockInfo.change}</Text>
        <Text>{stockInfo.percentChange}</Text> */}
      </HStack>
    </>
  );
};
