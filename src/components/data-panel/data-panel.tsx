import { Show } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { useMemo, useRef } from 'react';
import { ImperativePanelGroupHandle, Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useDebounceCallback, useWindowSize } from 'usehooks-ts';
import { DataTable, DataTableProps } from '@/components/data-table/data-table';
import { StockChart } from '@/components/stock-chart/stock-chart';
import { tickerAtom } from '@/states/atom';
import { setCssVar } from '@/utils/common.utils';

type DataPanelGroupProps = DataTableProps;

export const DataPanelGroup = ({ data = [] }: DataPanelGroupProps) => {
  const ticker = useAtomValue(tickerAtom);
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
  const windowSize = useWindowSize({ debounceDelay: 100 });

  const isLandscape = useMemo(() => {
    const isLandscape = windowSize.width > windowSize.height;
    if (isLandscape) {
      setCssVar('--table-height', 'var(--content-max-height)');
    } else {
      if (panelGroupRef.current) {
        const layout = panelGroupRef.current.getLayout();
        const tablePanelSize = layout.slice(-1).at(0) ?? 100;
        setCssVar('--table-height', `${(windowSize.height - 48) * (tablePanelSize / 100)}px`);
      }
    }
    return isLandscape;
  }, [windowSize]);

  const onPanelResize = (panelSize: number) => {
    if (isLandscape) {
      setCssVar('--table-height', 'var(--content-max-height)');
    } else {
      setCssVar('--table-height', `${(windowSize.height - 48) * (panelSize / 100)}px`);
    }
  };
  const onDebounceResize = useDebounceCallback(onPanelResize, 100);

  return (
    <PanelGroup
      ref={panelGroupRef}
      autoSaveId="panel-group"
      direction={isLandscape ? 'horizontal' : 'vertical'}
      className="data-panel-group">
      <Show when={ticker.length > 0}>
        <Panel id="panel-chart" minSize={40} order={1}>
          <StockChart ticker={ticker} />
        </Panel>
        <PanelResizeHandle className={isLandscape ? 'resize-handle' : 'resize-handle portrait'}></PanelResizeHandle>
      </Show>
      <Panel id="panel-stock" minSize={30} order={2} onResize={onDebounceResize}>
        <DataTable data={data} />
      </Panel>
    </PanelGroup>
  );
};
