import { FC, useEffect, useState } from 'react';
import { fetchStockRsList } from './services/data.service';
import { Stock } from './models/stock';
import { Box, Heading, HStack, Separator, Show, Skeleton, Spacer } from '@chakra-ui/react';
import { DataTable } from './components/app/data-table';
import { Settings } from './components/app/settings';
import { defaultSettings, initialFilter, presetOptions, viewOptions } from './utils/table.util';
import { Dropdown } from './components/app/dropdown';
import { Table } from '@tanstack/react-table';
import { DataTableState } from './models/common';
// import { useEventListener } from 'usehooks-ts';

const App: FC = () => {
  const [stockList, setStockList] = useState<Stock[]>([]);
  const [filteredStockList, setFilteredStockList] = useState<Stock[]>([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [error, setError] = useState<null | string>(null);
  const [tableState, setTableState] = useState<DataTableState | null>(null);

  // useEventListener('keydown', (event) => {
  //   if (/[A-Za-z- ]/.test(event.key)) {
  //     console.log('gonna open dialog => ', event.key);
  //   }
  // });

  console.log('render app');

  useEffect(() => {
    setError(null);
    fetchStockRsList
      .then((response) => response.clone().json())
      .then((stocks: Stock[]) => {
        setStockList(stocks.map((e, i) => ({ ...e, key: i + 1 })));
      })
      .catch((e) => {
        console.error(e);
        setError('Something went wrong. Please try again later.');
      });
  }, []);

  useEffect(() => {
    if (stockList.length > 0) {
      const tmpList = initialFilter(stockList, settings);
      setFilteredStockList(tmpList);
    }
  }, [settings, stockList]);

  const onDataTableInit = (tableInstance: Table<Stock>) => {
    if (!tableState) {
      setTableState({
        table: tableInstance
      });
    }
  };

  if (error) {
    return error;
  }

  return (
    <Box>
      <HStack gap={1} paddingY={2}>
        <Heading paddingX={1} title="US Stock Screener" hideBelow="md">
          US Stock Screener
        </Heading>
        <Heading paddingX={1} title="US Stock Screener" hideFrom="md">
          PING
        </Heading>
        <Separator orientation="vertical" height={5} />
        <Dropdown
          type="Preset"
          manualCount={0}
          optionList={presetOptions}
          setColumnFilters={tableState?.table.setColumnFilters}
        />
        <Separator orientation="vertical" height={5} />
        <Dropdown type="View" optionList={viewOptions} setColumnVisibility={tableState?.table.setColumnVisibility} />
        <Separator orientation="vertical" height={5} />
        <Spacer />
        <Settings key={'app-settings'} currentSettings={settings} saveSettings={setSettings} />
      </HStack>
      <Show when={filteredStockList.length > 0}>
        <DataTable data={filteredStockList} onInit={onDataTableInit}></DataTable>
      </Show>
      <Show when={filteredStockList.length === 0}>
        <Skeleton flex="1" height="4" variant="pulse" marginY={4} />
        <Skeleton flex="1" height="4" variant="pulse" marginY={4} />
        <Skeleton flex="1" height="4" variant="pulse" marginY={4} />
        <Skeleton flex="1" height="4" variant="pulse" marginY={4} />
      </Show>
    </Box>
  );
};

export default App;
