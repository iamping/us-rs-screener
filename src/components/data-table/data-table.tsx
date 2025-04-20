import { Show } from '@chakra-ui/react';
import {
  ColumnPinningState,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useAtom, useSetAtom } from 'jotai';
import { CSSProperties, FC, useCallback, useEffect, useRef, useState } from 'react';
import { AiOutlineStock } from 'react-icons/ai';
import { ViewportList, ViewportListRef } from 'react-viewport-list';
import { useEventListener } from 'usehooks-ts';
import { EmptyState } from '@/components/ui/empty-state';
import { defaultPinnedColumns, tableGlobal } from '@/helpers/table.helper';
import { columnStateAtom, dropdownFnAtom, filterStateAtom, rowCountAtom, tickerAtom } from '@/states/atom';
import { Stock } from '@/types/stock';
import { columns } from './column-defs';
import { DataCell } from './data-cell';
import { HeaderCell } from './header-cell';

export interface DataTableProps {
  data: Stock[];
}

export const DataTable: FC<DataTableProps> = ({ data = [] }) => {
  console.log('render table');
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
    data: data,
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
      <div ref={parentRef} className="grid-area scrollbar" style={gridAreaStyle}>
        <div className="grid" style={gridTemplateColumnsStyle}>
          {table.getHeaderGroups().map((headerGroup) => (
            <div key={headerGroup.id} className="grid-row-header" style={gridColumnStyle}>
              {headerGroup.headers.map((header) => {
                return <HeaderCell key={header.id} header={header} resetPageIndex={resetPageIndex} />;
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
                      <DataCell key={cell.id} cell={cell} />
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
    </>
  );
};
