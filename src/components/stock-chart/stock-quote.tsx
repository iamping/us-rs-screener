import { Box, BoxProps, Flex, Heading, Text } from '@chakra-ui/react';
import { FC } from 'react';
import { getChartColors } from '@/helpers/chart.helper';
import { useColorMode } from '@/hooks/useColorMode';
import { StockChartData } from '@/types/chart.type';
import { formatDecimal } from '@/utils/common.utils';

interface StockQuoteProps extends BoxProps {
  index: number;
  stockData: StockChartData;
}

interface ValueItemProps {
  title: string;
  value: string;
  color?: string;
}

export const StockQuote: FC<StockQuoteProps> = ({ index, stockData, ...rest }) => {
  const colorMode = useColorMode();
  if (stockData.series.length === 0) {
    return null;
  }
  const { series, stock } = stockData;
  const d = index < 0 || index > series.length - 1 ? series[series.length - 1] : series[index];
  const isUp = d.change > 0;
  const open = formatDecimal(d.open);
  const high = formatDecimal(d.high);
  const low = formatDecimal(d.low);
  const close = `${formatDecimal(d.close)} ${formatDecimal(d.change, true)} (${formatDecimal(d.changePercent, true)}%)`;
  const colors = getChartColors(colorMode.colorMode);
  const color = d.isThink40 ? (isUp ? colors.think40 : colors.think40down) : isUp ? colors.up : colors.down;
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
        <ValueItem title="O" value={open} color={color} />
        <ValueItem title="H" value={high} color={color} />
        <ValueItem title="L" value={low} color={color} />
        <ValueItem title="C" value={close} color={color} />
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

const ValueItem: FC<ValueItemProps> = ({ title, value, color }) => {
  return (
    <Text display="inline-block" fontSize="xs" background={{ base: 'whiteAlpha.700', _dark: 'blackAlpha.700' }}>
      <Text as="span" fontWeight="600">
        {title}
      </Text>
      <Text as="span" color={color}>
        {value}
      </Text>
    </Text>
  );
};
