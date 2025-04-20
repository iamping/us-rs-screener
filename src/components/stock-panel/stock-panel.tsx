import { Show } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { DataTable, DataTableProps } from '@/components/data-table/data-table';
import { StockChart } from '@/components/stock-chart/stock-chart';
import { tickerAtom } from '@/states/atom';

type StockPanelGroupProps = DataTableProps;

export const StockPanelGroup = ({ data = [] }: StockPanelGroupProps) => {
  const ticker = useAtomValue(tickerAtom);
  return (
    <PanelGroup autoSaveId="panel-group" direction="horizontal">
      <Show when={ticker.length > 0}>
        <Panel id="panel-chart" minSize={40} order={1} className="chart-max-height">
          <StockChart ticker={ticker} />
        </Panel>
        <PanelResizeHandle className="resize-handle"></PanelResizeHandle>
      </Show>
      <Panel id="panel-stock" minSize={30} order={2}>
        <DataTable data={data} />
      </Panel>
    </PanelGroup>
  );
};
