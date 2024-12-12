import { Stock } from "../models/Stock";
import { TableColumnsType, Typography } from "antd";
import { formatDecimal } from "./common.util";

const { Text } = Typography;

interface Filter {
  industry: { text: string, value: string }[]
  // exchange: { text: string, value: string }[]
}

export const populateColumn = (filters: Filter): TableColumnsType<Stock> => {
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
      render: (val) => <Text type="secondary">{val}</Text>,
      ellipsis: true
    },
    {
      title: 'Sector',
      dataIndex: 'sector',
      key: 'sector',
      sorter: (a, b) => a.sector > b.sector ? 1 : -1
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
      filters: filters.industry,
      onFilter: (value, record) => record.industry.indexOf(value as string) === 0,
      ellipsis: true,
      sorter: (a, b) => a.industry > b.industry ? 1 : -1
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
      width: 100,
      sorter: (a, b) => a.rsRating - b.rsRating,
    },
    {
      title: 'RS 3M',
      dataIndex: 'rsRating3M',
      key: 'rsRating3M',
      align: 'right',
      width: 80,
      sorter: (a, b) => a.rsRating3M - b.rsRating3M,
    },
    {
      title: 'RS 6M',
      dataIndex: 'rsRating6M',
      key: 'rsRating6M',
      align: 'right',
      width: 80,
      sorter: (a, b) => a.rsRating6M - b.rsRating6M,
    },
    {
      title: 'RS 1Y',
      dataIndex: 'rsRating1Y',
      key: 'rsRating1Y',
      align: 'right',
      width: 80,
      sorter: (a, b) => a.rsRating1Y - b.rsRating1Y
    }
  ];
}