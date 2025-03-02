import { FC } from 'react';
import { SortDirection } from '@tanstack/react-table';
import { PiListBold, PiSortAscendingBold, PiSortDescendingBold } from 'react-icons/pi';
import { IconButton } from '@chakra-ui/react';

export const SortIcon: FC<{ sortDirection: false | SortDirection }> = (props) => {
  const { icon, color, direction } = getSortDirectionIcon(props.sortDirection);
  return (
    <IconButton className={`sort-icon${direction}`} size="2xs" variant="plain" color={color} minWidth={'fit-content'}>
      {icon}
    </IconButton>
  );
};

const getSortDirectionIcon = (sortDirection: false | SortDirection) => {
  let icon = null;
  let color = null;
  let direction = null;
  switch (sortDirection) {
    case 'asc':
      icon = <PiSortDescendingBold title="Sort asc" />;
      color = 'black';
      direction = 'asc';
      break;
    case 'desc':
      icon = <PiSortAscendingBold title="Sort desc" />;
      color = 'black';
      direction = 'desc';
      break;
    default:
      icon = <PiListBold title="Original order" />;
      color = 'gray.300';
      direction = '';
      break;
  }
  return { icon, color, direction };
};
