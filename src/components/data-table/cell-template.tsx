import { Box, HStack, Text } from '@chakra-ui/react';
import { CellContext } from '@tanstack/react-table';
import { FC } from 'react';
import { FaCheck, FaXmark } from 'react-icons/fa6';
import { Stock } from '@/types/stock';
import { formatDecimal } from '@/utils/common.utils';

interface CellTemplateProps<T> {
  cell: CellContext<Stock, T>;
}

const FiftyTwoWeek: FC<CellTemplateProps<number>> = ({ cell }) => {
  const diffFromLow = cell.getValue() - cell.row.original.wk52Low;
  const rangeDiff = cell.row.original.wk52High - cell.row.original.wk52Low;
  const position = 100 * (diffFromLow / rangeDiff);
  return (
    <>
      <div className="week-range-wrapper">
        <div
          className="week-range"
          style={{
            marginLeft: `${position}%`,
            backgroundColor:
              position >= 75
                ? 'var(--chakra-colors-blue-500)'
                : position < 30
                  ? 'var(--chakra-colors-red-500)'
                  : 'var(--chakra-colors-black)'
          }}></div>
      </div>
      <HStack justifyContent="space-between">
        <Text fontSize="2xs">{formatDecimal(cell.row.original.wk52Low)}</Text>
        <Text fontSize="2xs">{formatDecimal(cell.row.original.wk52High)}</Text>
      </HStack>
    </>
  );
};

const Status: FC<CellTemplateProps<string | number>> = ({ cell }) => {
  switch (cell.getValue()) {
    case 'Yes':
      return (
        <Box height="100%" display="flex" alignItems="center">
          <FaCheck color="var(--chakra-colors-blue-500)" />
        </Box>
      );
    case 'No':
      return (
        <Box height="100%" display="flex" alignItems="center">
          <FaXmark color="var(--chakra-colors-gray-300)" />
        </Box>
      );
    case 'Before Price':
      return <Text color="blue.500">{cell.getValue()}</Text>;
    case 'New High':
      return <Text color="pink.500">{cell.getValue()}</Text>;
    default:
      return cell.getValue();
  }
};

export const CellTemplate = () => <></>;
CellTemplate.FiftyTwoWeek = FiftyTwoWeek;
CellTemplate.Status = Status;
