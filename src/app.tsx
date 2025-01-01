import { FC, useEffect, useState } from 'react';
import { fetchStockRsList } from './services/data.service';
import { Stock } from './models/stock';
import { Box, Show, Skeleton } from '@chakra-ui/react';
import { DataTable } from './components/app/data-table';
import { Topbar } from './components/app/topbar';
import { useAtomValue, useSetAtom } from 'jotai';
import { filteredStockListAtom, stockListAtom } from './state/atom';

const App: FC = () => {
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const setStockList = useSetAtom(stockListAtom);
  const filteredStockList = useAtomValue(filteredStockListAtom);

  // console.log('render app');

  useEffect(() => {
    setError(null);
    fetchStockRsList()
      .then((stocks: Stock[]) => {
        setStockList(stocks.map((e, i) => ({ ...e, key: i + 1 })));
      })
      .catch((e) => {
        console.error(e);
        setError('Something went wrong. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, [setStockList]);

  if (error) {
    return error;
  }

  return (
    <Box>
      <Topbar />
      <Show when={!loading}>
        <DataTable data={filteredStockList}></DataTable>
      </Show>
      <Show when={loading}>
        <Skeleton flex="1" height="4" variant="pulse" marginY={4} />
        <Skeleton flex="1" height="4" variant="pulse" marginY={4} />
        <Skeleton flex="1" height="4" variant="pulse" marginY={4} />
        <Skeleton flex="1" height="4" variant="pulse" marginY={4} />
      </Show>
    </Box>
  );
};

export default App;
