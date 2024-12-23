import { FC, useEffect, useState } from 'react';
import { fetchStockRsList } from './services/data.service';
import { Stock } from './models/stock';
import { Box, HStack, Separator, Show, Skeleton, Spacer } from '@chakra-ui/react';
import { DataTable } from './components/app/data-table';
import { Settings } from './components/app/settings';
import { initialFilter, presetOptions, viewOptions } from './utils/table.util';
import { Dropdown } from './components/app/dropdown';
import { AppName } from './components/app/app-name';
import { useAtom } from 'jotai';
import { appSettingsAtom } from './state/atom';
// import { useEventListener } from 'usehooks-ts';

const App: FC = () => {
  const [settings, setSettings] = useAtom(appSettingsAtom);
  const [stockList, setStockList] = useState<Stock[]>([]);
  const [filteredStockList, setFilteredStockList] = useState<Stock[]>([]);
  const [error, setError] = useState<null | string>(null);

  // useEventListener('keydown', (event) => {
  //   if (/[A-Za-z- ]/.test(event.key)) {
  //     console.log('gonna open dialog => ', event.key);
  //   }
  // });

  // console.log('render app');

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

  if (error) {
    return error;
  }

  return (
    <Box>
      <HStack gap={1} paddingY={2}>
        <AppName />
        <Separator orientation="vertical" height={5} />
        <Dropdown type="Preset" optionList={presetOptions} />
        <Separator orientation="vertical" height={5} />
        <Dropdown type="View" optionList={viewOptions} />
        <Separator orientation="vertical" height={5} />
        <Spacer />
        <Settings key={'app-settings'} currentSettings={settings} saveSettings={setSettings} />
      </HStack>
      <Show when={filteredStockList.length > 0}>
        <DataTable data={filteredStockList}></DataTable>
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
