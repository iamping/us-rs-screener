import { atom } from 'jotai';
import { ColumnFiltersState } from '@tanstack/react-table';
import { ColumnVisibility } from '../models/common';
import { atomWithStorage } from 'jotai/utils';
import {
  defaultColumnVisibility,
  defaultFilterState,
  defaultPreset,
  defaultSettings,
  defaultView
} from '../utils/table.util';

export const rowCountAtom = atom(-1);

export const manualFilterAtom = atom(0);

export const dropdownFnAtom = atom<{
  setColumnFilters?: (filters: ColumnFiltersState) => void;
  setColumnVisibility?: (visibility: ColumnVisibility) => void;
  resetPageIndex?: () => void;
}>({ setColumnFilters: undefined, setColumnVisibility: undefined, resetPageIndex: undefined });

// atom with localstorage
export const appSettingsAtom = atomWithStorage('appSettings', defaultSettings);

export const appDropdownAtom = atomWithStorage('appDropdown', { preset: defaultPreset, view: defaultView });

export const filterStateAtom = atomWithStorage('appFilterState', defaultFilterState);

export const columnStateAtom = atomWithStorage('appColumnState', defaultColumnVisibility);
