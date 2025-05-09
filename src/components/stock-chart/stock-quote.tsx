import { Flex, FlexProps, Text } from '@chakra-ui/react';
import { FC } from 'react';
import { StockDataPoint } from '@/types/stock-chart';
import { formatDecimal } from '@/utils/common.utils';

interface StockQuoteProps extends FlexProps {
  index: number;
  series: StockDataPoint[];
}

interface ValueItemProps {
  title: string;
  value: string;
  isDown?: boolean;
}

export const StockQuote: FC<StockQuoteProps> = ({ index, series, ...rest }) => {
  if (series.length === 0) {
    return null;
  }
  const d = index < 0 ? series.slice(-1)[0] : series[index];
  const open = `${formatDecimal(d.open)}`;
  const high = `${formatDecimal(d.high)}`;
  const low = `${formatDecimal(d.low)}`;

  const preCloseIndex = series.length > 1 ? (index < 0 ? series.length - 2 : Math.max(index - 1, 0)) : 0;
  const preClose = series[preCloseIndex].close;
  const isDown = preClose > d.close;
  const change = d.close - preClose;
  const changePercent = (change / preClose) * 100;
  const close = `${formatDecimal(d.close)} ${formatDecimal(change, true)} (${formatDecimal(changePercent, true)}%)`;

  const volUnit = d.volume < 1000000 ? 'k' : 'm';
  const adjustVolume = d.volume < 1000000 ? d.volume / 1000 : d.volume / 1000000;
  const volume = `${formatDecimal(adjustVolume)}${volUnit}`;

  return (
    <Flex {...rest}>
      <ValueItem title="O" value={open} isDown={isDown} />
      <ValueItem title="H" value={high} isDown={isDown} />
      <ValueItem title="L" value={low} isDown={isDown} />
      <ValueItem title="C" value={close} isDown={isDown} />
      <ValueItem title="Vol" value={volume} isDown={isDown} />
    </Flex>
  );
};

const ValueItem: FC<ValueItemProps> = ({ title, value, isDown = false }) => {
  return (
    <Text fontSize="xs">
      <Text as="span" fontWeight="600">
        {title}
      </Text>
      <Text as="span" color={isDown ? 'red.600' : undefined}>
        {value}
      </Text>
    </Text>
  );
};
