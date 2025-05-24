import { Flex, FlexProps, Text } from '@chakra-ui/react';
import { FC } from 'react';
import { getChartColors } from '@/helpers/chart.helper';
import { useColorMode } from '@/hooks/useColorMode';
import { StockChartData } from '@/types/chart.type';
import { formatDecimal } from '@/utils/common.utils';

interface StockVolumeProps extends FlexProps {
  index: number;
  stockData: StockChartData;
}

export const StockVolume: FC<StockVolumeProps> = ({ index, stockData, ...rest }) => {
  const colorMode = useColorMode();
  if (stockData.series.length === 0) {
    return null;
  }
  const { series, stock } = stockData;
  const d = index < 0 || index > series.length - 1 ? series[series.length - 1] : series[index];
  const avgDollarVol = formatDecimal(stock.avgDollarVolume / 1000000) + 'M';
  const relVol = formatDecimal(d.relativeVolume);
  const colors = getChartColors(colorMode.colorMode);
  const { isPocketPivot, isGainer, isLoser } = d.volumeStatus;
  const color = isPocketPivot
    ? colors.pocketPivotVolume
    : isGainer
      ? colors.gainerVolume
      : isLoser
        ? colors.loserVolume
        : undefined;

  return (
    <Flex {...rest}>
      <Text fontSize="xs" paddingX={1}>
        <Text as="span" fontWeight={500}>
          Avg$Vol{' '}
        </Text>
        <Text as="span">{avgDollarVol}</Text>
      </Text>
      <Text fontSize="xs" paddingX={1}>
        <Text as="span" fontWeight={500}>
          R.Vol{' '}
        </Text>
        <Text as="span" color={color}>
          {relVol}
        </Text>
      </Text>
    </Flex>
  );
};
