import { FC, useEffect, useState } from 'react';
import { fetchStockRsList } from './services/us-rs-screener.service';
import { Stock } from './models/Stock';
import { Box, Heading } from '@chakra-ui/react';
import { DataTable } from './components/ui/data-table';

const App: FC = () => {
  const [stockList, setStockList] = useState<Stock[]>([]);
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

  if (error) {
    return error;
  }

  return (
    <Box>
      <Heading size="3xl">US Stock Screener</Heading>
      <DataTable data={stockList}></DataTable>
    </Box>
  );
};

export default App;
