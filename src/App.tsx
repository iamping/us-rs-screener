import { FC, useEffect, useState } from 'react';
import { fetchStockRsList } from './services/us-rs-screener.service';
import { Stock } from './models/Stock';
import { Box, Heading } from '@chakra-ui/react';
import { DataTable } from './components/ui/data-table';
import { noOtc } from './utils/table.util';

const App: FC = () => {
  const [stockList, setStockList] = useState<Stock[]>([]);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    setError(null);
    fetchStockRsList
      .then((response) => response.clone().json())
      .then((stocks: Stock[]) => {
        setStockList(stocks.filter((e) => noOtc.includes(e.exchange)).map((e, i) => ({ ...e, key: i + 1 })));
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
      <Heading size="3xl" paddingY={2} paddingX={1}>
        US Stock Screener
      </Heading>
      <DataTable data={stockList}></DataTable>
    </Box>
  );
};

export default App;
