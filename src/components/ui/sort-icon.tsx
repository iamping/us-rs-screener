import { IconButton } from '@chakra-ui/react';
import { SortDirection } from '@tanstack/react-table';
import { FC } from 'react';
import { PiListBold, PiSortAscendingBold, PiSortDescendingBold } from 'react-icons/pi';
import { useColorModeValue } from './color-mode';

export const SortIcon: FC<{ sortDirection: false | SortDirection }> = (props) => {
  const { icon, direction } = getSortDirectionIcon(props.sortDirection);
  const normal = useColorModeValue('gray.300', 'gray.700');
  const sorted = useColorModeValue('black', 'white');
  return (
    <IconButton
      className={`sort-icon${direction}`}
      size="2xs"
      variant="plain"
      color={direction.length > 0 ? sorted : normal}
      minWidth={'fit-content'}>
      {icon}
    </IconButton>
  );
};

const getSortDirectionIcon = (sortDirection: false | SortDirection) => {
  let icon = null;
  let direction = null;
  switch (sortDirection) {
    case 'asc':
      icon = <PiSortDescendingBold title="Sort asc" />;
      direction = 'asc';
      break;
    case 'desc':
      icon = <PiSortAscendingBold title="Sort desc" />;
      direction = 'desc';
      break;
    default:
      icon = <PiListBold title="Original order" />;
      direction = '';
      break;
  }
  return { icon, direction };
};
