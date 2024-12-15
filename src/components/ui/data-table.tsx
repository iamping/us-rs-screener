import { FC, useEffect } from "react";
import { Stock } from "../../models/Stock";
import { Box, HStack, Table, Text } from "@chakra-ui/react";
import { PaginationNextTrigger, PaginationPageText, PaginationPrevTrigger, PaginationRoot } from "./pagination";
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { SortIcon } from "./sort-icon";
import { formatDecimal } from "../../utils/common.util";

const fallBackData: Stock[] = [];
const exchangeNoOtc = ['NMS', 'NYQ', 'NGM', 'PCX', 'ASE', 'BTS', 'NCM'];

// table columns
const columnHelper = createColumnHelper<Stock>();
const columns = [
  columnHelper.accessor('ticker', {
    header: () => 'Ticker',
    cell: cell => cell.getValue(),
    meta: { width: 90 }
  }),
  columnHelper.accessor('companyName', {
    header: () => '',
    cell: cell => cell.getValue(),
    meta: { width: 200 },
    enableSorting: false,
  }),
  columnHelper.accessor('marketCap', {
    header: () => <Text textAlign="right">Market Cap (B)</Text>,
    cell: cell => <Text textAlign="right">{formatDecimal(cell.getValue() / 1000000000)}</Text>,
    meta: { width: 150 }
  }),
  columnHelper.accessor('avgDollarVolume', {
    header: () => <Text textAlign="right">Avg $ Vol (M)</Text>,
    cell: cell => <Text textAlign="right">{formatDecimal(cell.getValue() / 1000000)}</Text>,
    meta: { width: 150 }
  }),
  columnHelper.accessor('rsRating', {
    header: () => <Text textAlign="right">RS Rating</Text>,
    cell: cell => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: { width: 120 }
  }),
  columnHelper.accessor('rsRating3M', {
    header: () => <Text textAlign="right">RS 3M</Text>,
    cell: cell => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: { width: 100 }
  }),
  columnHelper.accessor('rsRating6M', {
    header: () => <Text textAlign="right">RS 6M</Text>,
    cell: cell => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: { width: 100 }
  }),
  columnHelper.accessor('rsRating1Y', {
    header: () => <Text textAlign="right">RS 1Y</Text>,
    cell: cell => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: { width: 100 }
  }),
  columnHelper.accessor('exchange', {
    header: () => 'Exchange',
    cell: cell => cell.getValue(),
    filterFn: 'arrIncludesSome',
  }),
  columnHelper.accessor('sector', {
    header: () => 'Sector',
    cell: cell => cell.getValue(),
    meta: { width: 200 }
  }),
  columnHelper.accessor('sectorRank', {
    header: () => <Text textAlign="right">Sector Rank</Text>,
    cell: cell => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: { width: 120 }
  }),
  columnHelper.accessor('industry', {
    header: () => 'Industry',
    cell: cell => cell.getValue(),
    meta: { width: 300 }
  }),
  columnHelper.accessor('industryRank', {
    header: () => <Text textAlign="right">Industry Rank</Text>,
    cell: cell => <Text textAlign="right">{cell.getValue()}</Text>,
    meta: { width: 150 }
  }),
];

export const DataTable: FC<{ data: Stock[] }> = ({ data }) => {
  const table = useReactTable({
    data: data ?? fallBackData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      columnFilters: [
        // {
        //   id: 'industry',
        //   value: 'Biotechnology'
        // },
        {
          id: 'exchange',
          value: exchangeNoOtc
        }
      ],
    },
    getSortedRowModel: getSortedRowModel(),
    autoResetPageIndex: false, // cut down re-render twice
  });

  useEffect(() => {
    table.setPageSize(20);
  }, [table]);

  return <>
    <Table.ScrollArea>
      <Table.Root size="sm">
        <Table.Header>
          {table.getHeaderGroups().map(headerGroup => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                const canSort = header.column.getCanSort();
                return (
                  <Table.ColumnHeader key={header.id}
                    width={header.column.columnDef.meta?.width ?? 'auto'}
                    verticalAlign="top"
                    _hover={{ background: canSort ? 'gray.100' : 'inherit' }}
                    cursor={canSort ? 'pointer' : 'inherit'}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <HStack>
                      <Box flexGrow={1}>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                      {canSort && <SortIcon sortDirection={header.column.getIsSorted()} />}
                    </HStack>
                  </Table.ColumnHeader>
                )
              })}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.map(row => (
            <Table.Row key={row.id}>
              {row.getVisibleCells().map(cell => (
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
} 