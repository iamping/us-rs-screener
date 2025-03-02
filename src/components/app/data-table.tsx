import { CSSProperties, FC, useCallback, useEffect, useRef, useState } from 'react';
import { Stock } from '../../models/stock';
import { HStack, IconButton, Show, Text } from '@chakra-ui/react';
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
  multiSelectFilterFn,
  percentChangeOptions,
  priceOptions,
  relativeVolOptions,
  rsRatingOptions,
  tableGlobal
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
import { useEventListener } from 'usehooks-ts';
import { PiExportDuotone } from 'react-icons/pi';

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
      width: 100,
      filterVariant: 'multi-select',
      selectOptions: priceOptions
    },
    filterFn: multiSelectFilterFn(priceOptions)
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
      width: 150,
      filterVariant: 'radio-select',
      selectOptions: avgDollarVolOptions
    },
    filterFn: amountFilterFn(avgDollarVolOptions)
  }),
  columnHelper.accessor('marketCap', {
    header: () => <Text textAlign="right">Market Cap (B)</Text>,
    cell: (cell) => <Text textAlign="right">{formatDecimal(cell.getValue() / 1000000000)}</Text>,
    meta: {
      width: 160,
      filterVariant: 'radio-select',
      selectOptions: marketCapOptions
    },
    filterFn: amountFilterFn(marketCapOptions)
  }),
  columnHelper.accessor((original) => original.close, {
    id: '52wkRange',
    header: () => '52 Week Range',
    cell: (cell) => {
      const position =
        (100 * (cell.getValue() - cell.row.original.wk52Low)) /
        (cell.row.original.wk52High - cell.row.original.wk52Low);
      return (
        <>
          <div className="week-range-wrapper">
            <div
              className="week-range"
              style={{
                marginLeft: `${position}%`,
                backgroundColor:
                  position >= 75
                    ? 'var(--chakra-colors-blue-500)'
                    : position < 30
                      ? 'var(--chakra-colors-red-500)'
                      : 'var(--chakra-colors-black)'
              }}></div>
          </div>
          <HStack justifyContent="space-between">
            <Text fontSize="2xs">{formatDecimal(cell.row.original.wk52Low)}</Text>
            <Text fontSize="2xs">{formatDecimal(cell.row.original.wk52High)}</Text>
          </HStack>
        </>
      );
    },
    meta: {
      width: 120
    },
    enableSorting: false,
    enableColumnFilter: false
  }),
  columnHelper.accessor('rsSts', {
    header: () => <Text textAlign="right">RS STS %</Text>,
    cell: (cell) => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: {
      width: 100
    },
    enableColumnFilter: false
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
  columnHelper.accessor('asRating1M', {
    header: () => <Text textAlign="right">AS 1M</Text>,
    cell: (cell) => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: {
      width: 110,
      filterVariant: 'radio-select',
      selectOptions: rsRatingOptions
    },
    filterFn: amountFilterFn(rsRatingOptions)
  }),
  columnHelper.accessor('asRating3M', {
    header: () => <Text textAlign="right">AS 3M</Text>,
    cell: (cell) => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: {
      width: 110,
      filterVariant: 'radio-select',
      selectOptions: rsRatingOptions
    },
    filterFn: amountFilterFn(rsRatingOptions)
  }),
  columnHelper.accessor('asRating6M', {
    header: () => <Text textAlign="right">AS 6M</Text>,
    cell: (cell) => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: {
      width: 110,
      filterVariant: 'radio-select',
      selectOptions: rsRatingOptions
    },
    filterFn: amountFilterFn(rsRatingOptions)
  }),
  columnHelper.accessor('asRating1Y', {
    header: () => <Text textAlign="right">AS 1Y</Text>,
    cell: (cell) => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: {
      width: 110,
      filterVariant: 'radio-select',
      selectOptions: rsRatingOptions
    },
    filterFn: amountFilterFn(rsRatingOptions)
  }),
  columnHelper.accessor('sector', {
    header: () => 'Sector',
    cell: (cell) => cell.getValue(),
    meta: { width: 200, filterVariant: 'combo-box' },
    filterFn: 'arrIncludesSome'
  }),
  columnHelper.accessor('sectorRank', {
    header: () => <Text textAlign="right">Sector Rank</Text>,
    cell: (cell) => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: { width: 150, filterVariant: 'range' },
    filterFn: 'inNumberRange'
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
  columnHelper.accessor('industryRank', {
    header: () => <Text textAlign="right">Industry Rank by RS</Text>,
    cell: (cell) => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: { width: 200, filterVariant: 'range' },
    filterFn: 'inNumberRange'
  }),
  columnHelper.accessor('industryRankByAs', {
    header: () => <Text textAlign="right">Industry Rank by AS</Text>,
    cell: (cell) => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: { width: 200, filterVariant: 'range' },
    filterFn: 'inNumberRange'
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
  }),
  columnHelper.accessor('tightRange', {
    header: () => 'Tight Range',
    cell: (cell) => cell.getValue(),
    meta: { width: 150, filterVariant: 'combo-box' },
    filterFn: 'arrIncludesSome'
  }),
  columnHelper.accessor('insideDay', {
    header: () => 'Inside Day',
    cell: (cell) => cell.getValue(),
    meta: { width: 150, filterVariant: 'combo-box' },
    filterFn: 'arrIncludesSome'
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

  // set table instance in global state
  tableGlobal.table = table;

  const resetPageIndex = useCallback(() => {
    listRef.current?.scrollToIndex({
      index: 0,
      offset: -100
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

  useEventListener('keydown', (event) => {
    const availableRowsLength = table.getRowModel().rows.length;
    if (ticker.length > 0) {
      switch (event.key) {
        case 'ArrowUp': {
          const activeRowIndex = table.getRowModel().rows.findIndex((item) => item.original.ticker === ticker);
          if (activeRowIndex > 0) {
            const previousTicker = table.getRowModel().rows[activeRowIndex - 1].original.ticker;
            setTicker(previousTicker);
          }
          event.preventDefault();
          const { y } = document.querySelector('.grid-row.active')?.getBoundingClientRect() ?? { y: 0 };
          if (Math.round(y) <= 0) {
            listRef.current?.scrollToIndex({
              index: activeRowIndex - 1,
              offset: -40
            });
          } else if (Math.round(y) < 120) {
            parentRef.current?.scrollBy(0, -30);
          }
          break;
        }
        case 'ArrowDown': {
          const activeRowIndex = table.getRowModel().rows.findIndex((item) => item.original.ticker === ticker);
          if (activeRowIndex < availableRowsLength - 1) {
            const nextTicker = table.getRowModel().rows[activeRowIndex + 1].original.ticker;
            setTicker(nextTicker);
          }
          event.preventDefault();
          const { y } = document.querySelector('.grid-row.active')?.getBoundingClientRect() ?? { y: 0 };
          const { height } = parentRef.current?.getBoundingClientRect() ?? { height: 0 };
          if (Math.round(y) - Math.round(height) > -10) {
            parentRef.current?.scrollBy(0, 30 + (y - height));
          }
          if (Math.round(y) <= 0) {
            listRef.current?.scrollToIndex({
              index: activeRowIndex + 1,
              offset: -height + 50
            });
          }
          break;
        }
      }
    }
  });

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
                  itemSize={30}
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

const GridHeaderCell = <T,>({ header, exportData, resetPageIndex }: ColumnHeaderProps<T>) => {
  const canSort = header.column.getCanSort();
  const isFilterNotReady = header.column.getCanFilter() && header.column.getFacetedRowModel().rows.length === 0;
  const isFilterReady = header.column.getCanFilter() && header.column.getFacetedRowModel().rows.length > 0;
  const width = header.column.columnDef.meta?.width ?? 'auto';
  const filterVariant = header.column.columnDef.meta?.filterVariant;
  const isPinned = header.column.getIsPinned();
  const showExportIcon = header.column.columnDef.meta?.showExportIcon;

  const exportTickerList = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (exportData) {
      exportData();
    }
  };

  return (
    <div
      key={header.id}
      className={`grid-header-cell ${canSort ? 'sort' : ''} ${isPinned ? 'pinned' : ''}`}
      style={{
        minWidth: `${width}px`
      }}
      onClick={header.column.getToggleSortingHandler()}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flexGrow: 1 }}>{flexRender(header.column.columnDef.header, header.getContext())}</div>
        {canSort && <SortIcon sortDirection={header.column.getIsSorted()} />}
        {showExportIcon && (
          <IconButton size="2xs" variant="plain" className="export-icon" color="gray.300" onClick={exportTickerList}>
            <PiExportDuotone title="Export ticker list" />
          </IconButton>
        )}
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
