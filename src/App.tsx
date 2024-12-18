import { FC, useEffect, useState } from 'react';
import { fetchStockRsList } from './services/us-rs-screener.service';
import { Stock } from './models/stock';
import { Box, Heading } from '@chakra-ui/react';
import { DataTable } from './components/app/data-table';
import { Settings } from './components/app/settings';
import { defaultSettings } from './utils/constants';
import { initialFilter } from './utils/table.util';

const App: FC = () => {
  const [stockList, setStockList] = useState<Stock[]>([]);
  const [filteredStockList, setFilteredStockList] = useState<Stock[]>([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [error, setError] = useState<null | string>(null);

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
      <DataTable
        data={filteredStockList}
        settings={[
          <Settings key={'app-settings'} currentSettings={settings} saveSettings={setSettings} />
        ]}></DataTable>
    </Box>
  );
};

export default App;
