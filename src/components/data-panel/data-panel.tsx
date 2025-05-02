import { Show } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { useMemo, useRef } from 'react';
import { ImperativePanelGroupHandle, Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useDebounceCallback, useWindowSize } from 'usehooks-ts';
import { DataTable, DataTableProps } from '@/components/data-table/data-table';
// import { StockChart } from '@/components/stock-chart/stock-chart';
import { tickerAtom } from '@/states/atom';
import { setCssVar } from '@/utils/common.utils';
import { StockInfoPanel } from '../stock-chart/stock-info-panel';

type DataPanelGroupProps = DataTableProps;

const computeHeight = (windowHeight: number, topMargin: number, panelSize = 100) => {
  const computedHeight = (windowHeight - topMargin) * (panelSize / 100);
  return computedHeight > 0 ? `${computedHeight}px` : '0px';
};

export const DataPanelGroup = ({ data = [] }: DataPanelGroupProps) => {
  const ticker = useAtomValue(tickerAtom);
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
  const windowSize = useWindowSize({ debounceDelay: 100 });
  const topMargin = 48;

  const isLandscape = useMemo(() => {
    const isLandscape = false; //windowSize.width > windowSize.height;
    if (isLandscape) {
      setCssVar('--table-height', computeHeight(windowSize.height, topMargin));
      setCssVar('--chart-height', computeHeight(windowSize.height, topMargin));
    } else {
      if (panelGroupRef.current) {
        const layout = panelGroupRef.current.getLayout();
        const panelSize = layout.slice(-1).at(0) ?? 100; // only table panel size
        setCssVar('--table-height', computeHeight(windowSize.height, topMargin, panelSize));
        setCssVar('--chart-height', computeHeight(windowSize.height, topMargin, 100 - panelSize));
      }
    }
    return isLandscape;
  }, [windowSize]);

  const onPanelResize = (panelSize: number) => {
    if (isLandscape) {
      setCssVar('--table-height', computeHeight(windowSize.height, topMargin));
      setCssVar('--chart-height', computeHeight(windowSize.height, topMargin));
    } else {
      setCssVar('--table-height', computeHeight(windowSize.height, topMargin, panelSize));
      setCssVar('--chart-height', computeHeight(windowSize.height, topMargin, 100 - panelSize));
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
          {/* <StockChart ticker={ticker} /> */}
          <StockInfoPanel ticker={ticker} />
        </Panel>
        <PanelResizeHandle className={isLandscape ? 'resize-handle' : 'resize-handle portrait'}></PanelResizeHandle>
      </Show>
      <Panel id="panel-stock" minSize={30} order={2} onResize={onDebounceResize}>
        <DataTable data={data} />
      </Panel>
    </PanelGroup>
  );
};
