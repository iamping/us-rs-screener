import { Box, BoxProps, Flex, Heading, Text } from '@chakra-ui/react';
import { FC } from 'react';
import { volumeFormat } from '@/helpers/chart.helper';
import { StockChartData } from '@/types/chart.type';
import { formatDecimal } from '@/utils/common.utils';

interface StockQuoteProps extends BoxProps {
  index: number;
  stockData: StockChartData;
}

interface ValueItemProps {
  title: string;
  value: string;
  isDown?: boolean;
}

export const StockQuote: FC<StockQuoteProps> = ({ index, stockData, ...rest }) => {
  if (stockData.series.length === 0) {
    return null;
  }
  const { series, stock } = stockData;
  const d = index < 0 || index > series.length - 1 ? series[series.length - 1] : series[index];
  const isDown = d.change < 0;
  const open = `${formatDecimal(d.open)}`;
  const high = `${formatDecimal(d.high)}`;
  const low = `${formatDecimal(d.low)}`;
  const close = `${formatDecimal(d.close)} ${formatDecimal(d.change, true)} (${formatDecimal(d.changePercent, true)}%)`;
  const volume = `${volumeFormat(d.volume, 3)}`;

  return (
    <Box {...rest}>
      <Heading
        flexGrow={1}
        size="sm"
        fontWeight="500"
        truncate={true}
        title={stock.ticker}
        background={{ base: 'whiteAlpha.600', _dark: 'blackAlpha.600' }}>
        {stock.ticker} {' - '}
        <Text as="span" fontSize="sm" fontWeight="500" color="subtle">
          {stock.companyName}
        </Text>
        <Text as="span" fontSize="xs" fontWeight="500">
          {' #'}
          {stock.industry}
        </Text>
      </Heading>
      <Flex gap={1} flexWrap="wrap">
        <ValueItem title="O" value={open} isDown={isDown} />
        <ValueItem title="H" value={high} isDown={isDown} />
        <ValueItem title="L" value={low} isDown={isDown} />
        <ValueItem title="C" value={close} isDown={isDown} />
        <ValueItem title="Vol" value={volume} isDown={isDown} />
      </Flex>
      <Flex>
        <ValueItem title="M.Cap " value={`${formatDecimal(stock.marketCap / 1000000000)}B`} />
      </Flex>
      <Flex>
        <ValueItem title="RS " value={`${formatDecimal(stock.rsRating)}`} />
      </Flex>
    </Box>
  );
};

const ValueItem: FC<ValueItemProps> = ({ title, value, isDown = false }) => {
  return (
    <Text display="inline-block" fontSize="xs" background={{ base: 'whiteAlpha.700', _dark: 'blackAlpha.700' }}>
      <Text as="span" fontWeight="600">
        {title}
      </Text>
      <Text as="span" color={isDown ? 'red.600' : undefined}>
        {value}
      </Text>
    </Text>
  );
};
