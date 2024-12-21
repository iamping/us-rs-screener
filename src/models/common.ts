import { Column, ColumnFiltersState, Header } from '@tanstack/react-table';
import { Dispatch } from 'react';
import { Stock } from './stock';

// Table Header
export interface ColumnHeaderProps<T> {
  header: Header<T, unknown>;
  resetPageIndex: () => void;
  setManualCount?: Dispatch<React.SetStateAction<number>>;
}

export type ColumnVisibility = { [P in keyof Stock]?: boolean };

// Filter
export type FilterVariant = 'range' | 'select' | 'radio-select' | undefined;

export interface FilterProps<T> {
  id?: string;
  popupWidth: number | string;
  filterVariant: FilterVariant;
  column: Column<T, unknown>;
  resetPageIndex?: () => void;
  setManualCount?: Dispatch<React.SetStateAction<number>>;
}

export interface RangeFilterProps {
  id?: string;
  initialValue: number[];
  min: number;
  max: number;
  onChange: (val: number[]) => void;
}

export interface CheckboxFilterProps {
  id?: string;
  initialValue: string[];
  valueList: string[];
  onChange: (val: string[]) => void;
}

export interface RadioFilterProps {
  id?: string;
  initialValue: string;
  optionList: SelectOption[];
  onChange: (val: string) => void;
}

export interface SelectOption {
  value: string;
  title: string;
  description?: string;
  operator?: '>=' | '<' | '<>' | '!==' | '<=' | '=';
  compareNumber1?: number;
  compareNumber2?: number;
  presetStates?: ColumnFiltersState;
  columnVisibility?: ColumnVisibility;
}

export interface DropdownOption extends SelectOption {
  presetStates?: ColumnFiltersState;
  columnVisibility?: ColumnVisibility;
}

// Dropdown
export interface DropdownProps {
  optionList: DropdownOption[];
  type: 'Preset' | 'View';
  setColumnFilters?: (filters: ColumnFiltersState) => void;
  setColumnVisibility?: (visibility: ColumnVisibility) => void;
  manualCount?: number;
}

// App Settings
export interface Settings {
  includeOtc: boolean;
  includeBiotechnology: boolean;
}

export type SettingsKey = keyof Settings;

export interface SettingsProps {
  currentSettings: Settings;
  saveSettings: (settings: Settings) => void;
}
