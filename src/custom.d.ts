/* eslint-disable @typescript-eslint/no-unused-vars */
import '@tanstack/react-table';
import { RowData } from '@tanstack/react-table';
import { FilterVariant, SelectOption } from './models/common';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    width?: number;
    ellipsis?: boolean;
    filterVariant?: FilterVariant;
    filterNote?: string;
    sticky?: boolean;
    selectOptions?: SelectOption[];
    showExportIcon?: boolean;
  }
}
