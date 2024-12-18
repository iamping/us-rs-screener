import { FC } from 'react';
import { SortDirection } from '@tanstack/react-table';
import { PiListBold, PiSortAscendingBold, PiSortDescendingBold } from 'react-icons/pi';
import { IconButton } from '@chakra-ui/react';

interface SortIconProps {
  sortDirection: false | SortDirection;
}

export const SortIcon: FC<SortIconProps> = (props) => {
  let icon = null;
  switch (props.sortDirection) {
    case 'asc':
      icon = <PiSortDescendingBold color="#0d9488" title="Sort asc" />;
      break;
    case 'desc':
      icon = <PiSortAscendingBold color="#0d9488" title="Sort desc" />;
      break;
    default:
      icon = <PiListBold title="Original order" />;
      break;
  }

  return (
    <IconButton className="sort-icon" size="2xs" variant="plain">
      {icon}
    </IconButton>
  );
};
