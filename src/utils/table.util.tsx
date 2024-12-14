import { Stock } from "../models/Stock";
import { TableColumnsType, Typography } from "antd";
import { formatDecimal } from "./common.util";

const { Text } = Typography;

interface Filter {
  industry: { text: string, value: string }[]
  sector: { text: string, value: string }[]
  // exchange: { text: string, value: string }[]
}

const getRsFilters = (col: 'rsRating' | 'rsRating3M' | 'rsRating6M' | 'rsRating1Y') => {
  return {
    filters: [
      { text: '70 and above', value: 70 },
      { text: '80 and above', value: 80 },
      { text: '90 and above', value: 90 },
    ],
    onFilter: (value: boolean | React.Key, record: Stock) => record[col] >= Number(value)
  }
}

export const populateColumn = (filters: Filter): TableColumnsType<Stock> => {

  const rsRatingFilter = getRsFilters('rsRating');
  const rsRating3MFilter = getRsFilters('rsRating3M');
  const rsRating6MFilter = getRsFilters('rsRating6M');
  const rsRating1YFilter = getRsFilters('rsRating1Y');

  return [
    {
      title: 'Ticker',
      dataIndex: 'ticker',
      key: 'ticker',
      width: 70,
      fixed: true,
      sorter: (a, b) => a.ticker > b.ticker ? 1 : -1
    },
    {
      title: '',
      dataIndex: 'companyName',
      key: 'companyName',
      ellipsis: true,
      width: 200,
      render: (val) => <Text type="secondary">{val}</Text>,
    },
    // {
    //   title: 'Exchange',
    //   dataIndex: 'exchange',
    //   key: 'exchange',
    //   filters: filters.exchange,
    //   defaultFilteredValue: ['NMS', 'NYQ', 'NGM', 'PCX', 'ASE', 'BTS', 'NCM'],
    //   onFilter: (value, record) => record.exchange.indexOf(value as string) === 0,
    // },
    {
      title: 'Market Cap (B)',
      dataIndex: 'marketCap',
      key: 'marketCap',
      align: 'right',
      width: 160,
      filters: [
        { text: '2B and above', value: 'gt' },
        { text: '2B and below', value: 'lt' },
      ],
      onFilter: (value, record) => value === 'gt'
        ? record.marketCap >= 2000000000
        : record.marketCap < 2000000000,
      render: (val) => formatDecimal(val / 1000000000),
      sorter: (a, b) => a.marketCap - b.marketCap
    },
    {
      title: 'Avg $ Vol (M)',
      dataIndex: 'avgDollarVolume',
      key: 'avgDollarVolume',
      align: 'right',
      width: 150,
      filters: [
        { text: '20M and above', value: 'gt' },
        { text: '20M and below', value: 'lt' },
      ],
      onFilter: (value, record) => value === 'gt'
        ? record.avgDollarVolume >= 20000000
        : record.avgDollarVolume < 20000000,
      render: (val) => formatDecimal(val / 1000000),
      sorter: (a, b) => a.avgDollarVolume - b.avgDollarVolume
    },
    {
      title: 'RS Rating',
      dataIndex: 'rsRating',
      key: 'rsRating',
      align: 'right',
      width: 120,
      filters: rsRatingFilter.filters,
      onFilter: rsRatingFilter.onFilter,
      sorter: (a, b) => a.rsRating - b.rsRating,
    },
    {
      title: 'RS 3M',
      dataIndex: 'rsRating3M',
      key: 'rsRating3M',
      align: 'right',
      width: 100,
      filters: rsRating3MFilter.filters,
      onFilter: rsRating3MFilter.onFilter,
      sorter: (a, b) => a.rsRating3M - b.rsRating3M,
    },
    {
      title: 'RS 6M',
      dataIndex: 'rsRating6M',
      key: 'rsRating6M',
      align: 'right',
      width: 100,
      filters: rsRating6MFilter.filters,
      onFilter: rsRating6MFilter.onFilter,
      sorter: (a, b) => a.rsRating6M - b.rsRating6M,
    },
    {
      title: 'RS 1Y',
      dataIndex: 'rsRating1Y',
      key: 'rsRating1Y',
      align: 'right',
      width: 100,
      filters: rsRating1YFilter.filters,
      onFilter: rsRating1YFilter.onFilter,
      sorter: (a, b) => a.rsRating1Y - b.rsRating1Y,
    },
    {
      title: 'Sector Rank',
      dataIndex: 'sectorRank',
      key: 'sectorRank',
      align: 'right',
      width: 120,
      sorter: (a, b) => a.sectorRank - b.sectorRank
    },
    {
      title: 'Industry Rank',
      dataIndex: 'industryRank',
      key: 'industryRank',
      align: 'right',
      width: 150,
      filters: [
        { text: '40 and below', value: 40 },
        { text: '80 and below', value: 80 },
        { text: '120 and below', value: 120 }
      ],
      onFilter: (value, record: Stock) => record.industryRank <= Number(value),
      sorter: (a, b) => a.industryRank - b.industryRank
    },
    {
      title: 'Sector',
      dataIndex: 'sector',
      key: 'sector',
      width: 200,
      filters: filters.sector,
      onFilter: (value, record) => record.sector.indexOf(value as string) === 0,
      sorter: (a, b) => a.sector > b.sector ? 1 : -1
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
      width: 300,
      filters: filters.industry,
      onFilter: (value, record) => record.industry.indexOf(value as string) === 0,
      sorter: (a, b) => a.industry > b.industry ? 1 : -1
    },
    
  ];
}