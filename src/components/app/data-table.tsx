import { FC, ReactNode, useState } from 'react';
import { Stock } from '../../models/stock';
import { Box, Button, Group, HStack, IconButton, Table, Text } from '@chakra-ui/react';
import {
  PageSizeSelection,
  PaginationItems,
  PaginationNextTrigger,
  PaginationPageText,
  PaginationPrevTrigger,
  PaginationRoot
} from '../ui/pagination';
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
import { SortIcon } from '../ui/sort-icon';
import { formatDecimal, formatNumber } from '../../utils/common.util';
import { EllipsisText } from '../ui/ellipsis-text';
import { FilterEmpty, Filter } from './filter';
import { PiArrowCounterClockwiseBold, PiMagnifyingGlassBold } from 'react-icons/pi';
import {
  amountFilterFn,
  avgDollarVolOptions,
  defaultFilterState,
  fallBackData,
  marketCapOptions,
  percentChangeOptions,
  rsRatingOptions
} from '../../utils/table.util';
import { If } from '../ui/if';
import { EmptyState } from '../ui/empty-state';
import { AiOutlineStock } from 'react-icons/ai';

// table columns
const columnHelper = createColumnHelper<Stock>();
const columns = [
  columnHelper.accessor('ticker', {
    header: () => 'Ticker',
    cell: (cell) => cell.getValue(),
    meta: { width: 85, sticky: true },
    enableColumnFilter: false
  }),
  // columnHelper.accessor('ticker', {
  //   header: () => 'Ticker',
  //   cell: (cell) => (
  //     <HStack>
  //       <Text width={55}>{cell.getValue()}</Text>
  //       <EllipsisText width={200} color="gray.500" title={cell.row.original.companyName}>
  //         {cell.row.original.companyName}
  //       </EllipsisText>
  //     </HStack>
  //   ),
  //   meta: { width: 300, sticky: true },
  //   enableColumnFilter: false
  // }),
  columnHelper.accessor('companyName', {
    header: () => 'Company Name',
    cell: (cell) => (
      <EllipsisText width={200} color="gray.500" title={cell.getValue()}>
        {cell.getValue()}
      </EllipsisText>
    ),
    meta: { width: 200 },
    enableSorting: false,
    enableColumnFilter: false
  }),
  columnHelper.accessor('close', {
    header: () => <Text textAlign="right">Close</Text>,
    cell: (cell) => <Text textAlign="right">{formatDecimal(cell.getValue())}</Text>,
    meta: {
      width: 85
    },
    enableColumnFilter: false
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
      filterVariant: 'range'
    },
    filterFn: 'inNumberRange'
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
  columnHelper.accessor('exchange', {
    header: () => 'Exchange',
    cell: (cell) => cell.getValue(),
    meta: { width: 100 },
    enableHiding: true,
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
  }),
  columnHelper.accessor('sector', {
    header: () => 'Sector',
    cell: (cell) => cell.getValue(),
    meta: { width: 200, filterVariant: 'select' },
    filterFn: 'arrIncludesSome'
  }),
  columnHelper.accessor('industry', {
    header: () => 'Industry',
    cell: (cell) => (
      <EllipsisText width={250} title={cell.getValue()}>
        {cell.getValue()}
      </EllipsisText>
    ),
    meta: { width: 250, filterVariant: 'select' },
    filterFn: 'arrIncludesSome'
  })
];

export const DataTable: FC<{ data: Stock[]; settings?: ReactNode[] }> = ({ data, settings }) => {
  // console.log('render table');
  const [globalReset, setGlobalReset] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 20 //default page size
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(defaultFilterState);
  const table = useReactTable({
    data: data ?? fallBackData,
    columns,
    state: {
      columnFilters,
      columnVisibility: {
        exchange: false
      },
      pagination
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
    autoResetPageIndex: false,
    autoResetExpanded: false
  });

  const resetAllFilters = () => {
    table.resetColumnFilters(undefined);
    // table.setColumnFilters(defaultFilterState);
    table.setPageIndex(0);
    setGlobalReset((val) => val + 1);
  };

  return (
    <>
      <HStack marginY={3} justifyContent="space-between">
        <HStack>
          <Button size="xs" variant="outline">
            <Text color="gray.500">
              Preset:{' '}
              <Text as="span" color="black">
                Default
              </Text>
            </Text>
          </Button>
          <IconButton title="Search ticker" size="xs" variant="outline">
            <PiMagnifyingGlassBold />
          </IconButton>
          <IconButton
            title="Clear filters"
            size="xs"
            variant="outline"
            onClick={resetAllFilters}
            disabled={table.getState().columnFilters.length === 0}>
            <PiArrowCounterClockwiseBold />
          </IconButton>
        </HStack>
        <HStack>{settings && settings}</HStack>
      </HStack>
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
                      paddingRight={1}
                      onClick={header.column.getToggleSortingHandler()}>
                      <HStack gap={0}>
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
                            resetPageIndex={() => setPagination({ ...pagination, pageIndex: 0 })}
                          />
                        )}
                      </HStack>
                    </Table.ColumnHeader>
                  );
                })}
              </Table.Row>
            ))}
          </Table.Header>
          <If exp={table.getRowModel().rows.length > 0}>
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
          </If>
        </Table.Root>
      </Table.ScrollArea>
      <If exp={table.getRowModel().rows.length === 0}>
        <EmptyState
          width="100%"
          marginTop={10}
          icon={<AiOutlineStock />}
          title="No results found"
          description="Try adjusting filters"
        />
      </If>
      <If exp={table.getRowModel().rows.length > 0}>
        <PaginationRoot
          size="xs"
          marginY={3}
          count={table.getFilteredRowModel().rows.length}
          pageSize={pagination.pageSize}
          page={pagination.pageIndex + 1}
          onPageChange={(detail) => setPagination({ ...pagination, pageIndex: detail.page - 1 })}>
          <HStack justifyContent="end">
            <PageSizeSelection
              pageSize={pagination.pageSize}
              onPageSizeChange={(pageSize) => setPagination({ ...pagination, pageSize })}
            />
            <PaginationPageText marginLeft={2} fontSize="smaller" format="long" />

            <Group attached>
              <PaginationPrevTrigger />
              <PaginationItems hideBelow="md" />
              <PaginationPageText fontSize="smaller" format="short" hideFrom="md" />
              <PaginationNextTrigger />
            </Group>
          </HStack>
        </PaginationRoot>
      </If>
    </>
  );
};