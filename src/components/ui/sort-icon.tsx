import { FC } from 'react';
import { SortDirection } from '@tanstack/react-table';
import { PiListBold, PiSortAscendingBold, PiSortDescendingBold } from 'react-icons/pi';

export const SortIcon: FC<{ sortDirection: false | SortDirection }> = ({ sortDirection }) => {
  switch (sortDirection) {
    case 'asc':
      return <PiSortDescendingBold color="#0d9488" title="sort asc" />;
    case 'desc':
      return <PiSortAscendingBold color="#0d9488" title="sort desc" />;
    default:
      return <PiListBold className="icon-hover" title="sort" />;
  }
};
