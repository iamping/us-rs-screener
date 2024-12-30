import { ChartSeries, HistoricalData } from '../models/historical-data';

const chartHeight = window.innerHeight - 48 * 2;

export const prepareSeries = (historicalData: HistoricalData | null) => {
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
};

export const chartOptions = (series: ChartSeries) => {
  return {
    accessibility: { enabled: false },
    credits: {
      enabled: false
    },
    chart: {
      height: `${chartHeight}`
    },
    tooltip: {
      valueDecimals: 2
    },
    yAxis: [
      {
        type: 'logarithmic',
        labels: {
          align: 'left'
        },
        height: '70%',
        lineWidth: 1,
        resize: {
          enabled: true
        }
      },
      {
        labels: {
          align: 'left'
        },
        top: '75%',
        height: '25%',
        offset: 0,
        lineWidth: 1
      }
    ],
    rangeSelector: {
      inputEnabled: false,
      selected: 1,
      buttons: [
        {
          type: 'month',
          count: 3,
          text: '3m',
          title: 'View 3 months',
          dataGrouping: {
            enabled: false
          }
        },
        {
          type: 'month',
          count: 6,
          text: '6m',
          title: 'View 6 months',
          preserveDataGrouping: true
        },
        {
          type: 'ytd',
          text: 'YTD',
          title: 'View year to date'
        },
        {
          type: 'year',
          count: 1,
          text: '1y',
          title: 'View 1 year'
        },
        {
          type: 'year',
          count: 2,
          text: '2y',
          title: 'View 2 year'
        }
      ]
    },
    series: [
      {
        type: 'candlestick',
        id: 'stock-candlestick',
        name: 'Stock Price',
        data: series.ohlc
      },
      {
        type: 'column',
        id: 'stock-volume',
        name: 'Volume',
        data: series.volume,
        yAxis: 1,
        tooltip: {
          valueDecimals: 0
        }
      },
      {
        type: 'ema',
        linkedTo: 'stock-candlestick',
        zIndex: 1,
        color: 'var(--chakra-colors-gray-300)',
        lineWidth: 1,
        marker: {
          enabled: false
        },
        params: {
          period: 21
        }
      },
      {
        type: 'ema',
        linkedTo: 'stock-candlestick',
        zIndex: 1,
        color: 'var(--chakra-colors-gray-400)',
        lineWidth: 1,
        marker: {
          enabled: false
        },
        params: {
          period: 50
        }
      },
      {
        type: 'ema',
        linkedTo: 'stock-candlestick',
        zIndex: 1,
        color: 'var(--chakra-colors-red-400)',
        lineWidth: 1,
        marker: {
          enabled: false
        },
        params: {
          period: 200
        }
      }
    ]
  } as Highcharts.Options;
};
