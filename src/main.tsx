/* eslint-disable @typescript-eslint/no-unused-vars */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import './main.css';
import App from './App';

import '@tanstack/react-table'; //or vue, svelte, solid, qwik, etc.
import { RowData } from '@tanstack/react-table';
import { FilterVariant, SelectOption } from './components/ui/filter';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    width?: number;
    ellipsis?: boolean;
    filterVariant?: FilterVariant;
    filterNote?: string;
    sticky?: boolean;
    selectOptions?: SelectOption[];
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={defaultSystem}>
      <App />
    </ChakraProvider>
  </StrictMode>
);
