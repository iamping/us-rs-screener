import { Button, CloseButton, Flex, Group, Link, Spacer, Text } from '@chakra-ui/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { FC, useEffect, useState } from 'react';
import { computeDataSeries, convertDailyToWeekly } from '@/helpers/data.helper';
import { fetchHistoricalData } from '@/services/data.service';
import { stockListAtom, tickerAtom } from '@/states/atom';
import { StockChartData, StockDataPoint } from '@/types/chart.type';
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

  useEffect(() => {
    let active = true;
    setStatus('loading');
    Promise.all([fetchHistoricalData(ticker), fetchHistoricalData('SPY')])
      .then((data) => {
        const dataLength = data[0].close.length;
        const spyLength = data[1].close.length;
        if (active) {
          setDailySeries(computeDataSeries(data[0], data[1], true, spyLength));
          if (dataLength > 50) {
            setWeeklySeries(
              computeDataSeries(convertDailyToWeekly(data[0]), convertDailyToWeekly(data[1]), false, spyLength)
            );
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
        <CloseButton size="2xs" variant="plain" zIndex={1} loading={isLoading} onClick={() => setTicker('')} />
      </Flex>
    );
  }

  return (
    <>
      <Flex height="full" direction="column" position="relative">
        <Flex
          padding={2}
          gap={2}
          position="absolute"
          zIndex={2}
          right={0}
          background={{ base: 'whiteAlpha.600', _dark: 'blackAlpha.600' }}>
          {isLoading && <Text>Loading {ticker}...</Text>}
          {!isLoading && (
            <Group>
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
          )}
          <CloseButton size="2xs" variant="plain" loading={isLoading} onClick={() => setTicker('')} />
        </Flex>
        <StockChart
          id="stock-chart"
          className="stock-chart"
          data-loading={isLoading}
          ticker={nextTicker}
          stockData={stockChartData}
        />
      </Flex>
    </>
  );
};
