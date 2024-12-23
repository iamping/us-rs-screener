import { atom } from 'jotai';
import { ColumnFiltersState } from '@tanstack/react-table';
import { ColumnVisibility } from '../models/common';

export const rowCountAtom = atom(-1);

export const manualFilterAtom = atom(0);

export const dropdownFnAtom = atom<{
  setColumnFilters?: (filters: ColumnFiltersState) => void;
  setColumnVisibility?: (visibility: ColumnVisibility) => void;
  resetPageIndex?: () => void;
}>({ setColumnFilters: undefined, setColumnVisibility: undefined, resetPageIndex: undefined });
