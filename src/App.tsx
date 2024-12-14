import { useEffect, useMemo, useState } from "react"
import { fetchStockRsList } from "./services/us-rs-screener.service";
import { Stock } from "./models/Stock";
import { AutoComplete, AutoCompleteProps, Checkbox, Flex, Input, Table, TableColumnsType, Typography } from "antd";
import { formatNumber, getAutoCompleteOptions } from "./utils/common.util";
import { populateColumn } from "./utils/table.util";

const { Search } = Input;
const { Title } = Typography;
const EXC_NO_OTC = ['NMS', 'NYQ', 'NGM', 'PCX', 'ASE', 'BTS', 'NCM'];

function App() {

  const [stockList, setStockList] = useState<Stock[]>([]);
  const [error, setError] = useState<null | string>(null);
  const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
  const [keyword, setKeyword] = useState('');
  const [includeOTC, setIncludeOTC] = useState(false);
  const [includeBitotech, setIncludeBitotech] = useState(false);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    setError(null);
    fetchStockRsList
      .then(response => response.clone().json())
      .then((stocks: Stock[]) => {
        setStockList(stocks.map((e, i) => ({ ...e, key: i + 1 })));
      })
      .catch(e => {
        console.error(e);
        setError('Something went wrong');
      });
  }, []);

  const filteredStockList = useMemo(() => {
    setOptions(getAutoCompleteOptions(stockList));
    let tempList = [];
    tempList = keyword.length > 0 ? stockList.filter(e => e.ticker.indexOf(keyword) >= 0) : stockList;
    tempList = includeOTC ? tempList : tempList.filter(e => EXC_NO_OTC.includes(e.exchange));
    tempList = includeBitotech ? tempList : tempList.filter(e => e.industry !== 'Biotechnology');
    return tempList;
  }, [stockList, keyword, includeOTC, includeBitotech]);

  const filtersMemo = useMemo(() => {
    return {
      sector: [...new Set(stockList.map(e => e.sector).sort())].map(e => ({ text: e, value: e })),
      industry: [...new Set(stockList.map(e => e.industry).sort())].map(e => ({ text: e, value: e }))
    }
  }, [stockList])

  const columns: TableColumnsType<Stock> = useMemo(() => {
    return populateColumn(filtersMemo);
  }, [filtersMemo])
  

  const onSelect = (data: string) => {
    setKeyword(data.toUpperCase());
  };

  const onSearch = (keyword: string) => {
    setOptions(getAutoCompleteOptions(stockList, keyword));
  };

  const onClear = () => {
    onSelect('');
  }

  return (
    <>
      <Title level={2}>US Stock Screener</Title>
      {error}
      {!error &&
        <>
          <Flex style={{ marginBottom: 8 }} gap={8} align="center" wrap={true}>
            <AutoComplete
              options={options}
              style={{ width: 200 }}
              onSelect={onSelect}
              onSearch={onSearch}
            >
              <Search placeholder="Search ticker" allowClear onClear={onClear} onSearch={onSelect} />
            </AutoComplete>
            <Flex gap={8}>
              <Checkbox onChange={(event) => setIncludeOTC(event.target.checked)}>Include OTC</Checkbox>
              <Checkbox onChange={(event) => setIncludeBitotech(event.target.checked)}>Include Biotechnology</Checkbox>
            </Flex>
          </Flex>

          <Table
            dataSource={filteredStockList}
            columns={columns}
            size="small"
            scroll={{x: 1500}}
            pagination={{ 
              pageSize: pageSize, 
              showTotal: (total) => `Total ${formatNumber(total)} items`,
              onShowSizeChange: (_, size) => setPageSize(size)
            }}
          />
        </>
      }
    </>
  )
}

export default App
