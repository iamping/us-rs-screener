import { useEffect, useState } from "react"
import { fetchStockRsList } from "./services/us-rs-screener.service";
import { Stock } from "./models/Stock";
import { Table, TableColumnsType, Typography } from "antd";
import { formatDecimal, formatNumber } from "./utils/common.util";

const { Text, Title } = Typography;

function App() {

  const [stockList, setStockList] = useState<Stock[]>([]);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    setError(null);
    fetchStockRsList
      .then(response => response.clone().json())
      .then((stocks: Stock[]) => setStockList(stocks.map((e, i) => ({ ...e, key: i + 1 }))))
      .catch(e => {
        console.error(e);
        setError('Something went wrong');
      });
  }, []);

  const filters = {
    exchange: [...new Set(stockList.map(e => e.exchange))].map(e => ({text: e, value: e}))
  }

  const columns: TableColumnsType<Stock> = [
    { title: '#', dataIndex: 'key', key: 'key' },
    { title: 'Ticker', dataIndex: 'ticker', key: 'ticker', },
    {
      title: '',
      dataIndex: 'companyName',
      key: 'companyName',
      render: (val) => <Text type="secondary">{val}</Text>
    },
    { title: 'Sector', dataIndex: 'sector', key: 'sector' },
    { title: 'Industry', dataIndex: 'industry', key: 'industry' },
    { 
      title: 'Exchange', 
      dataIndex: 'exchange', 
      key: 'exchange',
      filters: filters.exchange,
      defaultFilteredValue: ['NMS', 'NYQ', 'NGM', 'PCX', 'ASE', 'BTS', 'NCM'],
      onFilter: (value, record) => record.exchange.indexOf(value as string) === 0, 
    },
    {
      title: 'Market Cap (B)',
      dataIndex: 'marketCap',
      key: 'marketCap',
      align: 'right',
      render: (val) => formatDecimal(val / 1000000000)
    },
    {
      title: 'Avg $ Vol (M)',
      dataIndex: 'avgDollarVolume',
      key: 'avgDollarVolume',
      align: 'right',
      filters: [
        { text: '>= 20,000,000', value: 'gt' },
        { text: '< 20,000,000', value: 'lt' },
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
      sorter: {
        compare: (a, b) => a.rsRating - b.rsRating,
        multiple: 2
      }
    },
    {
      title: 'RS 3M',
      dataIndex: 'rsRating3M',
      key: 'rsRating3M',
      align: 'right',
      defaultSortOrder: 'descend',
      sorter: {
        compare: (a, b) => a.rsRating3M - b.rsRating3M,
        multiple: 1
      }
    },
    {
      title: 'RS 6M',
      dataIndex: 'rsRating6M',
      key: 'rsRating6M',
      align: 'right',
      sorter: {
        compare: (a, b) => a.rsRating6M - b.rsRating6M,
        multiple: 3
      }
    },
    {
      title: 'RS 1Y',
      dataIndex: 'rsRating1Y',
      key: 'rsRating1Y',
      align: 'right',
      sorter: {
        compare: (a, b) => a.rsRating1Y - b.rsRating1Y,
        multiple: 4
      }
    }
  ]

  return (
    <>
      <Title level={2}>US Stock Screener</Title>
      {error}
      {!error &&
        <Table
          dataSource={stockList}
          columns={columns}
          size="small"
          pagination={{ pageSize: 20, showTotal: (total) => `Total ${formatNumber(total)} items` }}
        />
      }
    </>
  )
}

export default App
