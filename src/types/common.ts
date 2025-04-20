import { Column, ColumnFiltersState, Row } from '@tanstack/react-table';
import { Stock } from './stock';

export type ColumnVisibility = { [P in keyof Stock]?: boolean };

export type FilterVariant = 'range' | 'combo-box' | 'radio-select' | 'multi-select' | undefined;

export type TRecord<T> = Row<T & Record<string, number>>;

export interface FilterProps<T> {
  id?: string;
  popupWidth: number | string;
  filterVariant: FilterVariant;
  column: Column<T, unknown>;
  resetPageIndex?: () => void;
}

export interface RangeFilterProps {
  id?: string;
  initialValue: number[];
  min: number;
  max: number;
  onChange: (val: number[]) => void;
}

export interface ComboBoxFilterProps {
  id?: string;
  initialValue: string[];
  valueList: string[];
  onChange: (val: string[]) => void;
  enableSearch?: boolean;
  hideSelectAll?: boolean;
}

export interface RadioFilterProps {
  id?: string;
  initialValue: string;
  optionList: SelectOption[];
  onChange: (val: string) => void;
}

export interface MultiSelectFilterProps {
  id?: string;
  initialValue: string[];
  optionList: SelectOption[];
  onChange: (val: string[]) => void;
}

export type CompareOperator = '>=' | '>' | '<>' | '<=' | '<' | '=';
export type BoundOperator = 'bound-inclusive' | 'bound-exclusive';
export type ChainOperator = 'chain-gt-exclusive' | 'chain-gt-inclusive';
export type Operator = CompareOperator | BoundOperator | ChainOperator;
export type CompareOption =
  | {
      type: 'fixed';
      params: Array<{
        operator: CompareOperator;
        compareNumber: number;
      }>;
    }
  | {
      type: 'compare-field';
      params: Array<{
        operator: CompareOperator;
        compareField: string;
      }>;
    }
  | {
      type: 'compare-field-percent';
      params: Array<{
        operator: CompareOperator;
        compareField: string;
        comparePercent: number;
      }>;
    }
  | {
      type: 'bound-fixed';
      params: Array<{
        operator: BoundOperator;
        lowerBound: number;
        upperBound: number;
      }>;
    }
  | {
      type: 'bound-percent';
      params: Array<{
        operator: BoundOperator;
        compareField: string;
        comparePercent: number;
      }>;
    }
  | {
      type: 'chain';
      params: Array<{
        operator: ChainOperator;
        compareFields: string[];
      }>;
    };

export interface SelectOption {
  value: string;
  title: string;
  description?: string;
  compareOption?: CompareOption;
  presetStates?: ColumnFiltersState;
  columnVisibility?: ColumnVisibility;
  isSeparator?: boolean;
}

export interface DropdownOption extends SelectOption {
  presetStates?: ColumnFiltersState;
  columnVisibility?: ColumnVisibility;
}

// Dropdown
export interface DropdownProps {
  optionList: DropdownOption[];
  type: 'Preset' | 'View';
}

// App Settings
export interface Settings {
  includeOtc: boolean;
  includeBiotechnology: boolean;
}
