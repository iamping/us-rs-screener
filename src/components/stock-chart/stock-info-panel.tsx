import { Button, CloseButton, Flex, Group, Heading, Link, SegmentGroup, Spacer, Text } from '@chakra-ui/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { FC, useEffect, useMemo, useState } from 'react';
import { LuChartCandlestick, LuInfo } from 'react-icons/lu';
import { calculateEMA, calculateSMA } from '@/helpers/chart.helper';
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
  const [newTicker, setNewTicker] = useState('');
  const [status, setStatus] = useState<'loading' | 'normal' | 'error'>('normal');
  const [interval, setInterval] = useState<'D' | 'W'>('D');
  const [retry, setRetry] = useState(0);
  const [segment, setSegment] = useState('chart');
  const stockList = useAtomValue(stockListAtom);
  const setTicker = useSetAtom(tickerAtom);

  const isLoading = status === 'loading';
  const isNormal = status === 'normal';
  const isError = status === 'error';
  const showChart = segment === 'chart';

  const stockInfo = useMemo(() => {
    return stockList.find((e) => e.ticker === newTicker)!;
  }, [newTicker, stockList]);

  const items = [
    { value: 'chart', label: <LuChartCandlestick /> },
    { value: 'info', label: <LuInfo /> }
  ];

  useEffect(() => {
    setStatus('loading');
    Promise.all([fetchHistoricalData(ticker), fetchHistoricalData('SPY')])
      .then((data) => {
        const stockData = data[0];
        const spyPriceData = data[1].close.slice(-stockData.close.length);
        const temp: StockDataPoint[] = [];
        const ema21 = calculateEMA(stockData.close, 21);
        const ema50 = calculateEMA(stockData.close, 50);
        const ema200 = calculateEMA(stockData.close, 200);
        const volSma50 = calculateSMA(stockData.volume, 50);
        for (let i = 0; i < stockData.date.length; i++) {
          temp.push({
            close: stockData.close[i],
            high: stockData.high[i],
            low: stockData.low[i],
            open: stockData.open[i],
            volume: stockData.volume[i],
            date: new Date(stockData.date[i] * 1000),
            ema21: ema21[i],
            ema50: ema50[i],
            ema200: ema200[i],
            avgVol: volSma50[i],
            rs: stockData.close[i] / spyPriceData[i]
          });
        }
        setSeries(temp);
        setNewTicker(ticker);
        setStatus('normal');
      })
      .catch(() => {
        setStatus('error');
      });
  }, [ticker, retry]);

  // console.log('render stockInfoPanel');

  if (isError || (isNormal && series.length === 0)) {
    const msg = isError ? 'Something went wrong.' : 'No data.';
    return (
      <Flex margin={2} gap={2}>
        <Text>
          {msg} Please{' '}
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
          {isLoading ? <Text flexGrow={1}>Loading...</Text> : <HeadLine stockInfo={stockInfo} />}
          <Group attached>
            <Button
              size="2xs"
              width="30px"
              variant={interval === 'D' ? 'solid' : 'subtle'}
              disabled={isLoading}
              onClick={() => setInterval('D')}>
              D
            </Button>
            <Button
              size="2xs"
              width="30px"
              variant={interval === 'W' ? 'solid' : 'subtle'}
              disabled={isLoading}
              onClick={() => setInterval('W')}>
              W
            </Button>
          </Group>
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
            ticker={newTicker}
            series={series}
          />
        )}
      </Flex>
    </>
  );
};

const HeadLine = ({ stockInfo }: { stockInfo: Stock }) => {
  if (!stockInfo) return null;
  return (
    <Heading flexGrow={1} size="sm" fontWeight="500" truncate={true} title={stockInfo?.ticker}>
      {stockInfo?.ticker} {' - '}
      <Text as="span" fontSize="sm" fontWeight="500" color="gray.500">
        {stockInfo?.companyName}
      </Text>
    </Heading>
  );
};
