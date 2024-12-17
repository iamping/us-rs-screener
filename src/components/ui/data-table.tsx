import { FC, useEffect, useState } from 'react';
import { Stock } from '../../models/Stock';
import { Box, HStack, IconButton, Separator, Table, Text } from '@chakra-ui/react';
import { PaginationNextTrigger, PaginationPageText, PaginationPrevTrigger, PaginationRoot } from './pagination';
import {
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { SortIcon } from './sort-icon';
import { formatDecimal } from '../../utils/common.util';
import { EllipsisText } from './ellipsis-text';
import { FilterEmpty, Filter } from './filter';
import { PiFunnelXBold } from 'react-icons/pi';

const fallBackData: Stock[] = [];
const noOtc = ['NMS', 'NYQ', 'NGM', 'PCX', 'ASE', 'BTS', 'NCM'];

// table columns
const columnHelper = createColumnHelper<Stock>();
const columns = [
  columnHelper.accessor('ticker', {
    header: () => 'Ticker',
    cell: (cell) => cell.getValue(),
    meta: { width: 100 },
    enableColumnFilter: false
  }),
  columnHelper.accessor('companyName', {
    header: () => '',
    cell: (cell) => (
      <EllipsisText width={200} color="gray.500">
        {cell.getValue()}
      </EllipsisText>
    ),
    meta: { width: 200 },
    enableSorting: false,
    enableColumnFilter: false
  }),
  columnHelper.accessor('marketCap', {
    header: () => <Text textAlign="right">Market Cap (B)</Text>,
    cell: (cell) => <Text textAlign="right">{formatDecimal(cell.getValue() / 1000000000)}</Text>,
    meta: { width: 150 },
    enableColumnFilter: false
  }),
  columnHelper.accessor('avgDollarVolume', {
    header: () => <Text textAlign="right">Avg $ Vol (M)</Text>,
    cell: (cell) => <Text textAlign="right">{formatDecimal(cell.getValue() / 1000000)}</Text>,
    meta: { width: 150 },
    enableColumnFilter: false
  }),
  columnHelper.accessor('rsRating', {
    header: () => <Text textAlign="right">RS Rating</Text>,
    cell: (cell) => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: { width: 130, filterVariant: 'range' },
    filterFn: 'inNumberRange'
  }),
  columnHelper.accessor('rsRating3M', {
    header: () => <Text textAlign="right">RS 3M</Text>,
    cell: (cell) => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: { width: 110, filterVariant: 'range' },
    filterFn: 'inNumberRange'
  }),
  columnHelper.accessor('rsRating6M', {
    header: () => <Text textAlign="right">RS 6M</Text>,
    cell: (cell) => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: { width: 110, filterVariant: 'range' },
    filterFn: 'inNumberRange'
  }),
  columnHelper.accessor('rsRating1Y', {
    header: () => <Text textAlign="right">RS 1Y</Text>,
    cell: (cell) => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: { width: 110, filterVariant: 'range' },
    filterFn: 'inNumberRange'
  }),
  columnHelper.accessor('exchange', {
    header: () => 'Exchange',
    cell: (cell) => cell.getValue(),
    meta: { width: 100 },
    enableHiding: true,
    filterFn: 'arrIncludesSome'
  }),
  columnHelper.accessor('sector', {
    header: () => 'Sector',
    cell: (cell) => cell.getValue(),
    meta: { width: 200, filterVariant: 'select' },
    filterFn: 'arrIncludesSome'
  }),
  columnHelper.accessor('industry', {
    header: () => 'Industry',
    cell: (cell) => cell.getValue(),
    meta: { width: 300, filterVariant: 'select' },
    filterFn: 'arrIncludesSome'
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
  })
];

export const DataTable: FC<{ data: Stock[] }> = ({ data }) => {
  // console.log('render table');
  const [globalReset, setGlobalReset] = useState(0);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    {
      id: 'exchange',
      value: noOtc
    }
  ]);
  const table = useReactTable({
    data: data ?? fallBackData,
    columns,
    state: {
      columnFilters,
      columnVisibility: {
        exchange: false
      }
    },
    // Core - the followings are like add-on features
    getCoreRowModel: getCoreRowModel(),
    // pagination
    getPaginationRowModel: getPaginationRowModel(),
    // filtering
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    // sorting
    getSortedRowModel: getSortedRowModel(),
    // generate lists of values for a given column
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // if set to true it'll make table render twice
    autoResetPageIndex: false
  });

  // console.log(table.getState().columnFilters);

  const resetAllFilters = () => {
    table.resetColumnFilters(undefined);
    setGlobalReset((val) => val + 1);
  };

  useEffect(() => {
    table.setPageSize(20);
  }, [table]);

  return (
    <>
      <HStack marginY={3}>
        <Text>TODO: Global filtering</Text>
        <IconButton size="xs" variant="ghost" onClick={resetAllFilters}>
          <PiFunnelXBold />
        </IconButton>
      </HStack>
      <Separator />
      <Table.ScrollArea>
        <Table.Root size="sm" tableLayout={'fixed'}>
          <Table.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isFilterNotReady =
                    header.column.getCanFilter() && header.column.getFacetedRowModel().rows.length === 0;
                  const isFilterReady =
                    header.column.getCanFilter() && header.column.getFacetedRowModel().rows.length > 0;
                  const width = header.column.columnDef.meta?.width ?? 'auto';
                  const filterVariant = header.column.columnDef.meta?.filterVariant;
                  return (
                    <Table.ColumnHeader
                      className="table-header"
                      key={header.id}
                      width={width}
                      verticalAlign="top"
                      _hover={{ background: canSort ? 'gray.50' : 'inherit' }}
                      cursor={canSort ? 'pointer' : 'inherit'}
                      onClick={header.column.getToggleSortingHandler()}>
                      <HStack gap={1}>
                        <Box flexGrow={1} marginRight={1}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </Box>
                        {canSort && <SortIcon sortDirection={header.column.getIsSorted()} />}
                        {isFilterNotReady && <FilterEmpty />}
                        {isFilterReady && (
                          <Filter
                            id={header.id}
                            popupWidth={width}
                            filterVariant={filterVariant}
                            column={header.column}
                            globalReset={globalReset}
                          />
                        )}
                      </HStack>
                    </Table.ColumnHeader>
                  );
                })}
              </Table.Row>
            ))}
          </Table.Header>
          <Table.Body>
            {table.getRowModel().rows.map((row) => (
              <Table.Row key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell key={cell.id} verticalAlign="top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      <PaginationRoot
        marginTop={2}
        count={table.getFilteredRowModel().rows.length}
        pageSize={table.getState().pagination.pageSize}
        defaultPage={1}
        onPageChange={(detail) => table.setPageIndex(detail.page - 1)}>
        <HStack justifyContent="center">
          <PaginationPrevTrigger />
          <PaginationPageText fontSize="smaller" />
          <PaginationNextTrigger />
        </HStack>
      </PaginationRoot>
    </>
  );
};
