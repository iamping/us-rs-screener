import { FC } from 'react';
import { SortDirection } from '@tanstack/react-table';
import { LuArrowUpAZ, LuArrowDownZA, LuArrowUpDown } from 'react-icons/lu';

export const SortIcon: FC<{ sortDirection: false | SortDirection }> = ({ sortDirection }) => {
  switch (sortDirection) {
    case 'asc':
      return <LuArrowUpAZ color="#f97316" />;
    case 'desc':
      return <LuArrowDownZA color="#f97316" />;
    default:
      return <LuArrowUpDown color="grey" />;
  }
};
