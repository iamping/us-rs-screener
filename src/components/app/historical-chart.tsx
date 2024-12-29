import { useAtomValue } from 'jotai';
import { FC, useEffect, useMemo, useState } from 'react';
import { stockListAtom } from '../../state/atom';
import { fetchHistoricalData } from '../../services/data.service';
import { Heading, Spinner, Text } from '@chakra-ui/react';
import { ChartSeries, HistoricalData } from '../../models/historical-data';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts/highstock';

export const HistoricalChart: FC<{ ticker: string }> = ({ ticker }) => {
  const [isLoading, setIsLoading] = useState(false);
  const stockList = useAtomValue(stockListAtom);
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);

  const stock = useMemo(() => {
    return stockList.find((e) => e.ticker === ticker);
  }, [ticker, stockList]);

  useEffect(() => {
    setIsLoading(true);
    fetchHistoricalData(ticker)
      .then((response) => response.clone().json())
      .then((data: HistoricalData) => setHistoricalData(data))
      .catch((e) => {
        console.log(e);
        setHistoricalData({} as HistoricalData);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [ticker]);

  const series = useMemo(() => {
    const tmpSeries: ChartSeries = { ohlc: [], volume: [] };
    if (historicalData && Object.keys(historicalData).length > 0) {
      for (let i = 0; i < historicalData.date.length; i += 1) {
        const date = historicalData.date[i] * 1000;
        tmpSeries.ohlc.push([
          date,
          historicalData.open[i],
          historicalData.high[i],
          historicalData.low[i],
          historicalData.close[i]
        ]);
        tmpSeries.volume.push([date, historicalData.volume[i]]);
      }
    }
    return tmpSeries;
  }, [historicalData]);

  const options: Highcharts.Options = useMemo(() => {
    return {
      accessibility: { enabled: false },
      yAxis: [
        {
          type: 'logarithmic',
          labels: {
            align: 'left'
          },
          height: '80%',
          resize: {
            enabled: true
          }
        },
        {
          type: 'logarithmic',
          labels: {
            align: 'left'
          },
          top: '80%',
          height: '20%',
          offset: 0
        }
      ],
      // rangeSelector: {
      //   selected: 4
      // },
      series: [
        {
          type: 'candlestick',
          id: 'nvidia-candlestick',
          name: 'NVIDIA Corp Stock Price',
          data: series.ohlc,
          dataGrouping: {
            groupPixelWidth: 10
          }
        },
        {
          type: 'column',
          id: 'nvidia-volume',
          name: 'NVIDIA Volume',
          data: series.volume,
          yAxis: 1
        }
      ],
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 800
            },
            chartOptions: {
              rangeSelector: {
                inputEnabled: false
              }
            }
          }
        ]
      }
    } as Highcharts.Options;
  }, [series]);

  return (
    <>
      <Heading size="md" padding={3}>
        {ticker} -{' '}
        <Text as={'span'} fontWeight={400} color="gray">
          {stock?.companyName}
        </Text>
      </Heading>
      {isLoading && <Spinner position="absolute" top={2} right={12} />}
      {historicalData && Object.keys(historicalData).length === 0 && 'Something wrong.'}
      <HighchartsReact highcharts={Highcharts} constructorType={'stockChart'} options={options} />
    </>
  );
};
