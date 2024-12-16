import { FC } from 'react';
import { SortDirection } from '@tanstack/react-table';
import { PiListBold, PiSortAscendingBold, PiSortDescendingBold } from 'react-icons/pi';

export const SortIcon: FC<{ sortDirection: false | SortDirection }> = ({ sortDirection }) => {
  switch (sortDirection) {
    case 'asc':
      return <PiSortDescendingBold color="#0d9488" />;
    case 'desc':
      return <PiSortAscendingBold color="#0d9488" />;
    default:
      // return <LuArrowUpDown color="grey" />;
      return <PiListBold color="grey" />;
  }
};
