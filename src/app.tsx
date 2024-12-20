import { FC, useEffect, useState } from 'react';
import { fetchStockRsList } from './services/data.service';
import { Stock } from './models/stock';
import { Box, Heading, Show, Skeleton } from '@chakra-ui/react';
import { DataTable } from './components/app/data-table';
import { Settings } from './components/app/settings';
import { defaultSettings, initialFilter } from './utils/table.util';
import { useEventListener } from 'usehooks-ts';

const App: FC = () => {
  const [stockList, setStockList] = useState<Stock[]>([]);
  const [filteredStockList, setFilteredStockList] = useState<Stock[]>([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [error, setError] = useState<null | string>(null);

  useEventListener('keydown', (event) => {
    if (/[A-Za-z- ]/.test(event.key)) {
      console.log('gonna open dialog => ', event.key);
    }
  });

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
      setFilteredStockList(initialFilter(stockList, settings));
    }
  }, [settings, stockList]);

  if (error) {
    return error;
  }

  return (
    <Box>
      <Heading size="3xl" paddingY={2} paddingX={1}>
        US Stock Screener
      </Heading>
      <Show when={filteredStockList.length > 0}>
        <DataTable
          data={filteredStockList}
          settings={[
            <Settings key={'app-settings'} currentSettings={settings} saveSettings={setSettings} />
          ]}></DataTable>
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
