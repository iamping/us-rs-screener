/* eslint-disable import/no-duplicates */
/* eslint-disable @typescript-eslint/no-unused-vars */
import '@tanstack/react-table';
import { RowData } from '@tanstack/react-table';
import { FilterVariant, SelectOption } from '@/types/shared.type';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    width?: number;
    filterVariant?: FilterVariant;
    filterNote?: string;
    sticky?: boolean;
    selectOptions?: SelectOption[];
  }
}
