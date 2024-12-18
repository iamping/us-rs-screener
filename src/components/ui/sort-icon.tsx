import { FC } from 'react';
import { SortDirection } from '@tanstack/react-table';
import { PiListBold, PiSortAscendingBold, PiSortDescendingBold } from 'react-icons/pi';
import { IconButton } from '@chakra-ui/react';

interface SortIconProps {
  sortDirection: false | SortDirection;
}

export const SortIcon: FC<SortIconProps> = (props) => {
  let icon = null;
  let color = null;
  const sortDirection = props.sortDirection || '';
  switch (props.sortDirection) {
    case 'asc':
      icon = <PiSortDescendingBold title="Sort asc" />;
      color = 'black';
      break;
    case 'desc':
      icon = <PiSortAscendingBold title="Sort desc" />;
      color = 'black';
      break;
    default:
      icon = <PiListBold title="Original order" />;
      color = 'gray.300';
      break;
  }

  return (
    <IconButton className={`sort-icon${sortDirection}`} size="2xs" variant="plain" color={color}>
      {icon}
    </IconButton>
  );
};
