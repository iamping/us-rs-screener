import { CSSProperties, FC, useCallback, useEffect, useRef, useState } from 'react';
import { Stock } from '../../models/stock';
import { Show, Text } from '@chakra-ui/react';
import {
  ColumnPinningState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { SortIcon } from '../ui/sort-icon';
import { formatDecimal, formatNumber } from '../../utils/common.util';
import { EllipsisText } from '../ui/ellipsis-text';
import { FilterEmpty, Filter } from './filter';
import {
  amountFilterFn,
  avgDollarVolOptions,
  customArrIncludesSome,
  defaultPinnedColumns,
  fallBackData,
  marketCapOptions,
  percentChangeOptions,
  priceOptions,
  relativeVolOptions,
  rsRatingOptions
} from '../../utils/table.util';
import { EmptyState } from '../ui/empty-state';
import { AiOutlineStock } from 'react-icons/ai';
import { CellProps, ColumnHeaderProps, DataTableProps } from '../../models/common';
import { CloseButton } from '../ui/close-button';
import { ViewportList, ViewportListRef } from 'react-viewport-list';
import { useAtom, useSetAtom } from 'jotai';
import { columnStateAtom, dropdownFnAtom, filterStateAtom, rowCountAtom, tickerAtom } from '../../state/atom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { HistoricalChart } from './historical-chart';

// table columns
const columnHelper = createColumnHelper<Stock>();
const columns = [
  columnHelper.accessor('ticker', {
    header: () => 'Ticker',
    cell: (cell) => cell.row.original.highlightedTicker ?? cell.getValue(),
    meta: { width: 85, sticky: true },
    enableColumnFilter: false
  }),
  columnHelper.accessor('companyName', {
    header: () => 'Company Name',
    cell: (cell) => (
      <EllipsisText width={200} color="gray.500" title={cell.getValue()}>
        {cell.row.original.highlightedCompanyName ?? cell.getValue()}
      </EllipsisText>
    ),
    meta: { width: 200 },
    enableSorting: false,
    enableColumnFilter: false
  }),
  columnHelper.accessor('close', {
    header: () => <Text textAlign="right">Price</Text>,
    cell: (cell) => <Text textAlign="right">{formatDecimal(cell.getValue())}</Text>,
    meta: {
      width: 85,
      filterVariant: 'radio-select',
      selectOptions: priceOptions
    },
    filterFn: amountFilterFn(priceOptions)
  }),
  columnHelper.accessor('percentChange', {
    header: () => <Text textAlign="right">Change %</Text>,
    cell: (cell) => (
      <Text textAlign="right" color={cell.getValue() > 0 ? 'teal.500' : 'red.500'}>
        {formatDecimal(cell.getValue())} %
      </Text>
    ),
    meta: {
      width: 130,
      filterVariant: 'radio-select',
      selectOptions: percentChangeOptions
    },
    filterFn: amountFilterFn(percentChangeOptions)
  }),
  columnHelper.accessor('volume', {
    header: () => <Text textAlign="right">Volume</Text>,
    cell: (cell) => <Text textAlign="right">{formatNumber(cell.getValue())}</Text>,
    meta: {
      width: 100
    },
    enableColumnFilter: false
  }),
  columnHelper.accessor('relativeVolume', {
    header: () => <Text textAlign="right">Rel. Volume</Text>,
    cell: (cell) => <Text textAlign="right">{formatDecimal(cell.getValue())}</Text>,
    meta: {
      width: 150,
      filterVariant: 'radio-select',
      selectOptions: relativeVolOptions
    },
    filterFn: amountFilterFn(relativeVolOptions)
  }),
  columnHelper.accessor('avgDollarVolume', {
    header: () => <Text textAlign="right">Avg $ Vol (M)</Text>,
    cell: (cell) => <Text textAlign="right">{formatDecimal(cell.getValue() / 1000000)}</Text>,
    meta: {
      width: 170,
      filterVariant: 'radio-select',
      selectOptions: avgDollarVolOptions
    },
    filterFn: amountFilterFn(avgDollarVolOptions)
  }),
  columnHelper.accessor('marketCap', {
    header: () => <Text textAlign="right">Market Cap (B)</Text>,
    cell: (cell) => <Text textAlign="right">{formatDecimal(cell.getValue() / 1000000000)}</Text>,
    meta: {
      width: 170,
      filterVariant: 'radio-select',
      selectOptions: marketCapOptions
    },
    filterFn: amountFilterFn(marketCapOptions)
  }),
  columnHelper.accessor('rsRating', {
    header: () => <Text textAlign="right">RS Rating</Text>,
    cell: (cell) => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: {
      width: 130,
      filterVariant: 'radio-select',
      selectOptions: rsRatingOptions
    },
    filterFn: amountFilterFn(rsRatingOptions)
  }),
  columnHelper.accessor('rsRating3M', {
    header: () => <Text textAlign="right">RS 3M</Text>,
    cell: (cell) => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: {
      width: 110,
      filterVariant: 'radio-select',
      selectOptions: rsRatingOptions
    },
    filterFn: amountFilterFn(rsRatingOptions)
  }),
  columnHelper.accessor('rsRating6M', {
    header: () => <Text textAlign="right">RS 6M</Text>,
    cell: (cell) => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: {
      width: 110,
      filterVariant: 'radio-select',
      selectOptions: rsRatingOptions
    },
    filterFn: amountFilterFn(rsRatingOptions)
  }),
  columnHelper.accessor('rsRating1Y', {
    header: () => <Text textAlign="right">RS 1Y</Text>,
    cell: (cell) => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: {
      width: 110,
      filterVariant: 'radio-select',
      selectOptions: rsRatingOptions
    },
    filterFn: amountFilterFn(rsRatingOptions)
  }),
  columnHelper.accessor('sectorRank', {
    header: () => <Text textAlign="right">Sector Rank</Text>,
    cell: (cell) => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: { width: 150, filterVariant: 'range' },
    filterFn: 'inNumberRange'
  }),
  columnHelper.accessor('industryRank', {
    header: () => <Text textAlign="right">Industry Rank</Text>,
    cell: (cell) => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: { width: 160, filterVariant: 'range' },
    filterFn: 'inNumberRange'
  }),
  columnHelper.accessor('sector', {
    header: () => 'Sector',
    cell: (cell) => cell.getValue(),
    meta: { width: 200, filterVariant: 'combo-box' },
    filterFn: 'arrIncludesSome'
  }),
  columnHelper.accessor('industry', {
    header: () => 'Industry',
    cell: (cell) => (
      <EllipsisText width={250} title={cell.getValue()}>
        {cell.getValue()}
      </EllipsisText>
    ),
    meta: { width: 250, filterVariant: 'combo-box' },
    filterFn: 'arrIncludesSome'
  }),
  columnHelper.accessor('pocketPivot', {
    header: () => 'Pocket Pivot',
    cell: (cell) => cell.getValue(),
    meta: { width: 150, filterVariant: 'combo-box' },
    filterFn: 'arrIncludesSome'
  }),
  columnHelper.accessor('rsNewHigh', {
    header: () => 'RS New High',
    cell: (cell) => cell.getValue(),
    meta: { width: 150, filterVariant: 'combo-box' },
    filterFn: customArrIncludesSome
  })
];

export const DataTable: FC<DataTableProps> = ({ data }) => {
  // console.log('render table');

  // app state
  const setRowCount = useSetAtom(rowCountAtom);
  const setDropdownFn = useSetAtom(dropdownFnAtom);
  const [ticker, setTicker] = useAtom(tickerAtom);

  // table state
  const [columnFilters, setColumnFilters] = useAtom(filterStateAtom);
  const [columnVisibility, setColumnVisibility] = useAtom(columnStateAtom);
  const [columnPinning] = useState<ColumnPinningState>({
    left: defaultPinnedColumns,
    right: []
  });
  const table = useReactTable({
    data: data ?? fallBackData,
    columns,
    state: {
      columnFilters,
      columnVisibility,
      columnPinning
    },
    // Core - the followings are like add-on features
    getCoreRowModel: getCoreRowModel(),
    // filtering
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    // sorting
    getSortedRowModel: getSortedRowModel(),
    // generate lists of values for a given column
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // if set to true it'll make table render twice
    autoResetPageIndex: false,
    autoResetExpanded: false
  });

  const resetPageIndex = useCallback(() => {
    listRef.current?.scrollToIndex({
      index: 0
    });
  }, []);

  useEffect(() => {
    setDropdownFn({ setColumnFilters, setColumnVisibility, resetPageIndex });
  }, [setDropdownFn, resetPageIndex, setColumnFilters, setColumnVisibility]);

  useEffect(() => {
    setRowCount(table.getRowModel().rows.length);
  }, [columnFilters, table, setRowCount, data]);

  // viewport list
  const parentRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<ViewportListRef>(null);

  // grid style based on result & columns
  const numColumns = table.getVisibleFlatColumns().length;
  const numRows = table.getRowModel().rows.length;
  const gridAreaStyle: CSSProperties = {
    overflow: numRows === 0 ? 'hidden' : 'auto',
    minHeight: numRows === 0 ? 'auto' : 'var(--content-max-height)'
  };
  const gridTemplateColumnsStyle: CSSProperties = { gridTemplateColumns: `repeat(${numColumns}, auto)` };
  const gridColumnStyle: CSSProperties = { gridColumn: `1 / ${numColumns + 1}` };

  return (
    <>
      <PanelGroup autoSaveId="panel-group" direction="horizontal">
        <Show when={ticker.length > 0}>
          <Panel id="panel-chart" minSize={40} order={1} className="chart-max-height">
            <CloseButton
              size="2xs"
              variant="subtle"
              position="absolute"
              borderRadius={0}
              top={2}
              right={2}
              zIndex={1}
              onClick={() => setTicker('')}
            />
            <HistoricalChart ticker={ticker} />
          </Panel>
          <PanelResizeHandle className="resize-handle"></PanelResizeHandle>
        </Show>
        <Panel id="panel-stock" minSize={30} order={2}>
          <div ref={parentRef} className="grid-area scrollbar" style={gridAreaStyle}>
            <div className="grid" style={gridTemplateColumnsStyle}>
              {table.getHeaderGroups().map((headerGroup) => (
                <div key={headerGroup.id} className="grid-row-header" style={gridColumnStyle}>
                  {headerGroup.headers.map((header) => {
                    return <GridHeaderCell key={header.id} header={header} resetPageIndex={resetPageIndex} />;
                  })}
                </div>
              ))}
              <Show when={numRows > 0}>
                <ViewportList
                  initialPrerender={50}
                  ref={listRef}
                  viewportRef={parentRef}
                  items={table.getRowModel().rows}>
                  {(row) => {
                    return (
                      <div
                        key={row.id}
                        className={`grid-row ${row.original.ticker === ticker ? 'active' : ''}`}
                        style={gridColumnStyle}
                        onClick={() => setTicker(row.original.ticker)}>
                        {row.getVisibleCells().map((cell) => (
                          <GridCell key={cell.id} cell={cell} />
                        ))}
                      </div>
                    );
                  }}
                </ViewportList>
              </Show>
            </div>
          </div>
          <Show when={numRows === 0}>
            <EmptyState
              width="100%"
              marginTop={10}
              icon={<AiOutlineStock />}
              title="No results found"
              description="Try adjusting filters"
            />
          </Show>
        </Panel>
      </PanelGroup>
    </>
  );
};

const GridHeaderCell = <T,>({ header, resetPageIndex }: ColumnHeaderProps<T>) => {
  const canSort = header.column.getCanSort();
  const isFilterNotReady = header.column.getCanFilter() && header.column.getFacetedRowModel().rows.length === 0;
  const isFilterReady = header.column.getCanFilter() && header.column.getFacetedRowModel().rows.length > 0;
  const width = header.column.columnDef.meta?.width ?? 'auto';
  const filterVariant = header.column.columnDef.meta?.filterVariant;
  const isPinned = header.column.getIsPinned();

  return (
    <div
      key={header.id}
      className={`grid-header-cell ${canSort ? 'sort' : ''} ${isPinned ? 'pinned' : ''}`}
      style={{
        minWidth: `${width}px`
      }}
      onClick={header.column.getToggleSortingHandler()}>
      <div style={{ display: 'flex', gap: 0 }}>
        <div style={{ flexGrow: 1, marginRight: '4px' }}>
          {flexRender(header.column.columnDef.header, header.getContext())}
        </div>
        {canSort && <SortIcon sortDirection={header.column.getIsSorted()} />}
        {isFilterNotReady && <FilterEmpty />}
        {isFilterReady && (
          <Filter
            id={header.id}
            popupWidth={width}
            filterVariant={filterVariant}
            column={header.column}
            resetPageIndex={resetPageIndex}
          />
        )}
      </div>
    </div>
  );
};

const GridCell = <T,>({ cell }: CellProps<T>) => {
  const isPinned = cell.column.getIsPinned();
  return (
    <div
      key={cell.id}
      className={`grid-cell ${isPinned ? 'pinned' : ''}`}
      style={{ width: `${cell.column.columnDef.meta?.width}px` }}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </div>
  );
};
