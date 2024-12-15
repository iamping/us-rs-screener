import { FC } from "react";
import { SortDirection } from "@tanstack/react-table";
import { LuArrowDownAZ, LuArrowDownZA, LuArrowUpDown } from "react-icons/lu";

export const SortIcon: FC<{ sortDirection: false | SortDirection}> = ({ sortDirection }) => {
  switch (sortDirection) {
    case 'asc':
      return <LuArrowDownAZ color="green" />;
    case 'desc':
      return <LuArrowDownZA color="green" />;
    default:
      return <LuArrowUpDown color="grey" />;
  } 
}