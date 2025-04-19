import { Box, Show, Skeleton } from '@chakra-ui/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { FC, useEffect, useState } from 'react';
import { DataTable } from '@/features/screener/components/data-table';
import { TopBar } from '@/features/screener/components/top-bar';
import { fetchStockRsList } from '@/services/data.service';
import { filteredStockListAtom, stockListAtom } from '@/state/atom';
import { Stock } from '@/types/stock';
import { dataMapping } from '@/utils/table.util';

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
        setStockList(dataMapping(stocks));
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
      <TopBar />
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
