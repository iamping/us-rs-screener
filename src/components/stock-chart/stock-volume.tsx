import { Flex, FlexProps, Text } from '@chakra-ui/react';
import { FC } from 'react';
import { getChartColors, volumeFormat } from '@/helpers/chart.helper';
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
  const { series } = stockData;
  const idx = index < 0 || index > series.length - 1 ? series.length - 1 : index;
  const d = series[idx];
  const preD = idx > 0 ? series[idx - 1] : d;
  const relVol = formatDecimal(d.relativeVolume);
  const volBuzzVal = preD.volume > 0 ? (100 * (d.volume - preD.volume)) / preD.volume : 0;
  const volBuzz = `${formatDecimal(volBuzzVal, true)}%`;
  const volume = volumeFormat(d.volume, 3);
  const colors = getChartColors(colorMode.colorMode);
  const { isPocketPivot, isGainer, isLoser } = d.volumeStatus;
  const color = isPocketPivot
    ? colors.pocketPivotVolume
    : isGainer
      ? colors.gainerVolume
      : isLoser
        ? colors.loserVolume
        : undefined;
  const volChgColor = d.volume > preD.volume ? colors.gainerVolume : colors.loserVolume;

  return (
    <Flex {...rest} background={{ base: 'whiteAlpha.700', _dark: 'blackAlpha.700' }}>
      <Text fontSize="xs" paddingX={0.5}>
        <Text as="span" fontWeight={500}>
          Vol{' '}
        </Text>
        <Text as="span" color={color}>
          {volume}
        </Text>
      </Text>
      <Text fontSize="xs" paddingX={0.5}>
        <Text as="span" fontWeight={500}>
          R.Vol{' '}
        </Text>
        <Text as="span" color={color}>
          {relVol}
        </Text>
      </Text>
      <Text fontSize="xs" paddingX={0.5}>
        <Text as="span" fontWeight={500}>
          Vol%Chg{' '}
        </Text>
        <Text as="span" color={volChgColor}>
          {volBuzz}
        </Text>
      </Text>
    </Flex>
  );
};
