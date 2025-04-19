import { ColumnFiltersState } from '@tanstack/react-table';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import {
  defaultColumnVisibility,
  defaultFilterState,
  defaultPreset,
  defaultSettings,
  defaultView,
  initialFilter
} from '@/helpers/table.helper';
import { ColumnVisibility } from '@/types/common';
import { Stock, StockInfo } from '@/types/stock';

export const rowCountAtom = atom(-1);

export const manualFilterAtom = atom(0);

export const dropdownFnAtom = atom<{
  setColumnFilters?: (filters: ColumnFiltersState) => void;
  setColumnVisibility?: (visibility: ColumnVisibility) => void;
  resetPageIndex?: () => void;
}>({ setColumnFilters: undefined, setColumnVisibility: undefined, resetPageIndex: undefined });

export const stockListAtom = atom<Stock[]>([]);
export const fuzzyListAtom = atom<Stock[]>([]);
export const searchBoxOpenAtom = atom(false);

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

// atom for chart
export const stockInfoAtom = atom<StockInfo>({ change: 0, percentChange: 0, volume: 0 });

export const tickerAtom = atom('');
