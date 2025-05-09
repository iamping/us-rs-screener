import { Button, CloseButton, Flex, Group, Heading, Link, Spacer, Text } from '@chakra-ui/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { FC, useEffect, useMemo, useState } from 'react';
import { computeDataSeries } from '@/helpers/chart.helper';
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
  const [nextTicker, setNewTicker] = useState('');
  const [status, setStatus] = useState<'loading' | 'normal' | 'error'>('normal');
  const [interval, setInterval] = useState<'D' | 'W'>('D');
  const [retry, setRetry] = useState(0);
  const stockList = useAtomValue(stockListAtom);
  const setTicker = useSetAtom(tickerAtom);

  const isLoading = status === 'loading';
  const isNormal = status === 'normal';
  const isError = status === 'error';

  const stockInfo = useMemo(() => {
    return stockList.find((e) => e.ticker === nextTicker)!;
  }, [nextTicker, stockList]);

  useEffect(() => {
    setStatus('loading');
    Promise.all([fetchHistoricalData(ticker), fetchHistoricalData('SPY')])
      .then((data) => {
        setSeries(computeDataSeries(data[0], data[1]));
        setNewTicker(ticker);
        setStatus('normal');
      })
      .catch(() => {
        setSeries([]);
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
        <Flex margin={2} marginBottom={1} gap={2}>
          {isLoading ? <Text flexGrow={1}>Loading {ticker}...</Text> : <HeadLine stockInfo={stockInfo} />}
          <CloseButton size="2xs" variant="subtle" zIndex={1} loading={isLoading} onClick={() => setTicker('')} />
        </Flex>
        <MyStockChart
          id="stock-chart"
          className="stock-chart"
          data-loading={isLoading}
          ticker={nextTicker}
          series={series}
        />
        {nextTicker.length > 0 && (
          <Group padding={2} borderTopWidth={1}>
            <Button
              size="2xs"
              width="24px"
              // borderRadius="none"
              variant={interval === 'D' ? 'solid' : 'subtle'}
              disabled={isLoading}
              onClick={() => setInterval('D')}>
              D
            </Button>
            <Button
              size="2xs"
              width="24px"
              // borderRadius="none"
              variant={interval === 'W' ? 'solid' : 'subtle'}
              disabled={isLoading}
              onClick={() => setInterval('W')}>
              W
            </Button>
          </Group>
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
