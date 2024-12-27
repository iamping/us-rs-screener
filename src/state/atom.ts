import { atom } from 'jotai';
import { ColumnFiltersState } from '@tanstack/react-table';
import { ColumnVisibility } from '../models/common';
import { atomWithStorage } from 'jotai/utils';
import {
  defaultColumnVisibility,
  defaultFilterState,
  defaultPreset,
  defaultSettings,
  defaultView,
  initialFilter
} from '../utils/table.util';
import { Stock } from '../models/stock';

export const rowCountAtom = atom(-1);

export const manualFilterAtom = atom(0);

export const dropdownFnAtom = atom<{
  setColumnFilters?: (filters: ColumnFiltersState) => void;
  setColumnVisibility?: (visibility: ColumnVisibility) => void;
  resetPageIndex?: () => void;
}>({ setColumnFilters: undefined, setColumnVisibility: undefined, resetPageIndex: undefined });

export const stockListAtom = atom<Stock[]>([]);
export const fuzzyListAtom = atom<Stock[]>([]);

// stock list after exclude (OTC & Biotechnology)
export const preFilteredListAtom = atom((get) => {
  const settings = get(appSettingsAtom);
  const stockList = get(stockListAtom);
  return initialFilter(stockList, settings);
});

// stock list after exclude (OTC & Biotechnology) + fuzzy search
export const filteredStockListAtom = atom((get) => {
  const fuzzyList = get(fuzzyListAtom);
  if (fuzzyList.length > 0) {
    return fuzzyList.some((e) => e.fuzzySearchEmpty) ? [] : fuzzyList;
  }
  return get(preFilteredListAtom);
});

// atom with localstorage
export const appSettingsAtom = atomWithStorage('appSettings', defaultSettings);

export const appDropdownAtom = atomWithStorage('appDropdown', { preset: defaultPreset, view: defaultView });

export const filterStateAtom = atomWithStorage('appFilterState', defaultFilterState);

export const columnStateAtom = atomWithStorage('appColumnState', defaultColumnVisibility);
