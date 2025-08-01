import { Text } from '@chakra-ui/react';
import { createColumnHelper } from '@tanstack/react-table';
import {
  adrPercentOptions,
  amountFilterFn,
  avgDollarVolOptions,
  customArrIncludesSome,
  marketCapOptions,
  multiSelectFilterFn,
  percentChangeOptions,
  priceOptions,
  relativeVolOptions,
  rmvOptions,
  rsRatingOptions
} from '@/helpers/table.helper';
import { Stock } from '@/types/stock.type';
import { formatDecimal, formatNumber } from '@/utils/common.utils';
import { CellTemplate } from './cell-template';

const columnHelper = createColumnHelper<Stock>();

export const columns = [
  columnHelper.accessor('ticker', {
    header: () => 'Ticker',
    cell: (cell) => cell.row.original.highlightedTicker ?? cell.getValue(),
    meta: { width: 85, sticky: true },
    enableColumnFilter: false
  }),
  columnHelper.accessor('companyName', {
    header: () => 'Company Name',
    cell: (cell) => (
      <Text
        truncate
        color={{
          base: 'gray.500',
          _dark: 'gray.300'
        }}
        title={cell.getValue()}>
        {cell.row.original.highlightedCompanyName ?? cell.getValue()}
      </Text>
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
  columnHelper.accessor('adrPercent', {
    header: () => <Text textAlign="right">ADR %</Text>,
    cell: (cell) => <Text textAlign="right">{formatDecimal(cell.getValue())}</Text>,
    meta: {
      width: 110,
      filterVariant: 'radio-select',
      selectOptions: adrPercentOptions
    },
    filterFn: amountFilterFn(adrPercentOptions)
  }),
  columnHelper.accessor('rmv', {
    header: () => (
      <Text textAlign="right" title="Relative Measured Volatility">
        RMV
      </Text>
    ),
    cell: (cell) => <Text textAlign="right">{formatDecimal(cell.getValue())}</Text>,
    meta: {
      width: 100,
      filterVariant: 'radio-select',
      selectOptions: rmvOptions
    },
    filterFn: amountFilterFn(rmvOptions)
  }),
  columnHelper.accessor((original) => original.close, {
    id: '52wkRange',
    header: () => '52 Week Range',
    cell: (cell) => <CellTemplate.FiftyTwoWeek cell={cell} />,
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
      <Text width={250} title={cell.getValue()}>
        {cell.getValue()}
      </Text>
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
    cell: (cell) => <CellTemplate.Status cell={cell} />,
    meta: { width: 150, filterVariant: 'combo-box' },
    filterFn: 'arrIncludesSome'
  }),
  columnHelper.accessor('rsNewHigh', {
    header: () => 'RS New High',
    cell: (cell) => <CellTemplate.Status cell={cell} />,
    meta: { width: 150, filterVariant: 'combo-box' },
    filterFn: customArrIncludesSome
  }),
  columnHelper.accessor('tightRange', {
    header: () => 'Tight Range',
    cell: (cell) => <CellTemplate.Status cell={cell} />,
    meta: { width: 150, filterVariant: 'combo-box' },
    filterFn: 'arrIncludesSome'
  }),
  columnHelper.accessor('insideDay', {
    header: () => 'Inside Day',
    cell: (cell) => <CellTemplate.Status cell={cell} />,
    meta: { width: 130, filterVariant: 'combo-box' },
    filterFn: 'arrIncludesSome'
  }),
  columnHelper.accessor('episodicPivot', {
    header: () => 'Episodic Pivot',
    cell: (cell) => <CellTemplate.Status cell={cell} />,
    meta: { width: 150, filterVariant: 'combo-box' },
    filterFn: 'arrIncludesSome'
  })
];
