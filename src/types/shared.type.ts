import { ColumnFiltersState } from '@tanstack/react-table';
import { Stock } from './stock.type';

export type ColumnVisibility = { [P in keyof Stock]?: boolean };
export type FilterVariant = 'range' | 'combo-box' | 'radio-select' | 'multi-select' | undefined;
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

export interface PresetOption extends SelectOption {
  presetStates?: ColumnFiltersState;
  columnVisibility?: ColumnVisibility;
}

// App Settings
export interface Settings {
  includeOtc: boolean;
  includeBiotechnology: boolean;
}
