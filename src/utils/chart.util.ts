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

export const chartGlobalOptions: Highcharts.Options = {
  lang: {
    rangeSelectorZoom: ''
  },
  global: {
    buttonTheme: {
      states: {
        select: {
          fill: 'var(--chakra-colors-gray-700)',
          style: {
            color: 'var(--chakra-colors-white)'
          }
        },
        hover: {
          fill: 'var(--chakra-colors-gray-300)'
        }
      }
    }
  }
};

export const chartOptions = (series: ChartSeries) => {
  return {
    accessibility: { enabled: false },
    credits: {
      enabled: false
    },
    chart: {
      animation: false,
      height: `${chartHeight}`,
      panning: { enabled: false },
      zooming: {
        mouseWheel: { enabled: false }
      }
    },
    navigator: {
      enabled: false
    },
    tooltip: {
      valueDecimals: 2
    },
    scrollbar: {
      height: 1,
      trackBorderColor: 'transparent'
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
      selected: 0,
      buttons: [
        {
          type: 'month',
          count: 6,
          text: 'D',
          title: 'Day',
          dataGrouping: {
            forced: true,
            units: [['day', [1]]]
          }
        },
        {
          type: 'all',
          text: 'W',
          title: 'Week',
          dataGrouping: {
            forced: true,
            units: [['week', [1]]]
          }
        }
      ]
    },
    series: [
      {
        type: 'candlestick',
        id: 'stock-candlestick',
        name: 'Stock Price',
        color: 'var(--chakra-colors-black)',
        data: series.ohlc
      },
      {
        type: 'column',
        id: 'stock-volume',
        name: 'Volume',
        color: 'var(--chakra-colors-black)',
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
        params: {
          period: 21
        },
        tooltip: {
          pointFormat: ''
        },
        enableMouseTracking: false
      },
      {
        type: 'ema',
        linkedTo: 'stock-candlestick',
        zIndex: 1,
        color: 'var(--chakra-colors-gray-400)',
        lineWidth: 1,
        params: {
          period: 50
        },
        tooltip: {
          pointFormat: ''
        },
        enableMouseTracking: false
      },
      {
        type: 'ema',
        linkedTo: 'stock-candlestick',
        zIndex: 1,
        color: 'var(--chakra-colors-red-400)',
        lineWidth: 1,
        params: {
          period: 200
        },
        tooltip: {
          pointFormat: ''
        },
        enableMouseTracking: false
      }
    ]
  } as Highcharts.Options;
};
