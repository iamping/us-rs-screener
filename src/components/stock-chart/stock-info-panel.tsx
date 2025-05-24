import { Button, CloseButton, Flex, Group, Heading, Link, Spacer, Text } from '@chakra-ui/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { FC, useEffect, useState } from 'react';
import { computeDataSeries, convertDailyToWeekly } from '@/helpers/data.helper';
import { fetchHistoricalData } from '@/services/data.service';
import { stockListAtom, tickerAtom } from '@/states/atom';
import { StockChartData, StockDataPoint } from '@/types/chart.type';
import { Stock } from '@/types/stock.type';
import { formatDecimal } from '@/utils/common.utils';
import { StockChart } from './stock-chart';

interface StockInfoPanelProps {
  ticker: string;
}

export const StockInfoPanel: FC<StockInfoPanelProps> = ({ ticker }) => {
  const [dailySeries, setDailySeries] = useState<StockDataPoint[]>([]);
  const [weeklySeries, setWeeklySeries] = useState<StockDataPoint[]>([]);
  const [nextTicker, setNextTicker] = useState('');
  const [status, setStatus] = useState<'loading' | 'normal' | 'error'>('normal');
  const [interval, setInterval] = useState<'D' | 'W' | 'NW'>('D');
  const [retry, setRetry] = useState(0);
  const stockList = useAtomValue(stockListAtom);
  const setTicker = useSetAtom(tickerAtom);

  const isLoading = status === 'loading';
  const isNormal = status === 'normal';
  const isError = status === 'error';
  const isDaily = interval === 'D' || interval === 'NW';
  const intervalDisabled = interval === 'NW';
  const stockChartData: StockChartData = {
    stock: stockList.find((e) => e.ticker === nextTicker)!,
    series: interval === 'W' ? weeklySeries : dailySeries,
    isDaily
  };
  const stock = stockChartData.stock;

  useEffect(() => {
    let active = true;
    setStatus('loading');
    Promise.all([fetchHistoricalData(ticker), fetchHistoricalData('SPY')])
      .then((data) => {
        const dataLength = data[0].close.length;
        if (active) {
          setDailySeries(computeDataSeries(data[0], data[1], true));
          if (dataLength > 50) {
            setWeeklySeries(computeDataSeries(convertDailyToWeekly(data[0]), convertDailyToWeekly(data[1]), false));
            setInterval((val) => (val === 'NW' ? 'D' : val));
          } else {
            setWeeklySeries([]);
            setInterval('NW');
          }
          setNextTicker(ticker);
          setStatus('normal');
        }
      })
      .catch(() => {
        if (active) {
          setDailySeries([]);
          setWeeklySeries([]);
          setStatus('error');
        }
      });

    return () => {
      active = false;
    };
  }, [ticker, retry]);

  if (isError || (isNormal && dailySeries.length === 0)) {
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
          {isLoading ? <Text flexGrow={1}>Loading {ticker}...</Text> : <HeadLine stock={stock} />}
          <CloseButton size="2xs" variant="subtle" zIndex={1} loading={isLoading} onClick={() => setTicker('')} />
        </Flex>
        <StockChart
          id="stock-chart"
          className="stock-chart"
          data-loading={isLoading}
          ticker={nextTicker}
          stockData={stockChartData}
        />
        <Flex borderTopWidth={nextTicker.length > 0 ? 1 : 0} height="40px">
          {nextTicker.length > 0 && (
            <>
              <Group padding={2}>
                <Button
                  size="2xs"
                  width="24px"
                  variant={isDaily ? 'solid' : 'subtle'}
                  disabled={isLoading || intervalDisabled}
                  onClick={() => setInterval('D')}>
                  D
                </Button>
                <Button
                  size="2xs"
                  width="24px"
                  variant={interval === 'W' ? 'solid' : 'subtle'}
                  disabled={isLoading || intervalDisabled}
                  onClick={() => setInterval('W')}>
                  W
                </Button>
              </Group>
              <Text
                lineHeight="40px"
                paddingX={2}
                borderLeftWidth={1}
                fontSize="xs"
                opacity={isLoading ? 0.2 : undefined}>
                <Text as="span" fontWeight="500">
                  M.Cap
                </Text>
                <Text as="span" color="subtle">
                  {formatDecimal(stock.marketCap / 1000000000)}B
                </Text>
              </Text>
              <Text
                lineHeight="40px"
                paddingX={2}
                borderLeftWidth={1}
                fontSize="xs"
                opacity={isLoading ? 0.2 : undefined}>
                <Text as="span" fontWeight="500">
                  RS
                </Text>
                <Text as="span" color="subtle">
                  {stock.rsRating}
                </Text>
              </Text>
              <Text
                lineHeight="40px"
                paddingX={2}
                borderLeftWidth={1}
                fontSize="xs"
                opacity={isLoading ? 0.2 : undefined}
                truncate
                flexGrow={1}>
                <Text as="span" fontWeight="500">
                  In{' '}
                </Text>
                <Text as="span" color="subtle">
                  {stock.industry}
                </Text>
              </Text>
            </>
          )}
        </Flex>
      </Flex>
    </>
  );
};

const HeadLine = ({ stock }: { stock: Stock }) => {
  if (!stock) return null;
  return (
    <Heading flexGrow={1} size="sm" fontWeight="500" truncate={true} title={stock.ticker}>
      {stock.ticker} {' - '}
      <Text as="span" fontSize="sm" fontWeight="500" color="subtle">
        {stock.companyName}
      </Text>
    </Heading>
  );
};
