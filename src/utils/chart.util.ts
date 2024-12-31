import { ChartSeries, HistoricalData } from '../models/historical-data';

const chartHeight = window.innerHeight - 48 * 2;

export const prepareSeries = (historicalData: HistoricalData | null) => {
  const tmpSeries: ChartSeries = { ohlc: [], volume: [] };
  if (historicalData && Object.keys(historicalData).length > 0) {
    for (let i = 0; i < historicalData.date.length; i += 1) {
      const date = historicalData.date[i] * 1000;
      tmpSeries.ohlc.push({
        x: date,
        open: historicalData.open[i],
        high: historicalData.high[i],
        low: historicalData.low[i],
        close: historicalData.close[i],
        custom: {
          change: i === 0 ? 0 : historicalData.close[i] - historicalData.close[i - 1],
          changePercent: i === 0 ? 0 : (historicalData.close[i] / historicalData.close[i - 1] - 1) * 100
        }
      });
      tmpSeries.volume.push({
        x: date,
        y: historicalData.volume[i],
        custom: {
          change: i === 0 ? 0 : historicalData.close[i] - historicalData.close[i - 1]
        }
      });
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
      },
      plotBorderWidth: 1,
      plotBorderColor: 'var(--chakra-colors-gray-300)'
    },
    navigator: {
      enabled: false
    },
    tooltip: {
      valueDecimals: 2,
      backgroundColor: 'transparent',
      shadow: false,
      useHTML: true,
      borderRadius: 0,
      borderWidth: 0,
      headerShape: 'rect',
      headerFormat: '<p class="chart-date-tooltip">{point.key}</p>',
      positioner: function (width, _height, point) {
        const chart = this.chart;
        if (point.isHeader) {
          const tmpX = Math.max(
            // Left side limit
            0,
            Math.min(
              point.plotX + chart.plotLeft - width / 2,
              // Right side limit
              chart.chartWidth - width
            )
          );
          return { x: tmpX, y: point.plotY - 8 };
        }
        return {
          x: point.series.chart.plotLeft,
          y: point.series.yAxis.pos - chart.plotTop
        };
      }
    },
    scrollbar: {
      height: 1,
      trackBorderColor: 'transparent'
    },
    yAxis: [
      {
        gridLineWidth: 1,
        gridLineColor: 'var(--chakra-colors-gray-300)',
        gridLineDashStyle: 'Dash',
        type: 'logarithmic',
        endOnTick: true,
        labels: {
          align: 'left'
        },
        height: '75%',
        crosshair: {
          label: {
            enabled: true,
            backgroundColor: '#000000',
            padding: 2,
            shape: 'rect',
            borderRadius: 0,
            format: '{value:.2f}'
          }
        },
        showLastLabel: true
      },
      {
        gridLineWidth: 1,
        gridLineColor: 'var(--chakra-colors-gray-300)',
        gridLineDashStyle: 'Dash',
        labels: {
          align: 'left',
          enabled: false
        },
        top: '75%',
        height: '25%'
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
        data: series.ohlc,
        tooltip: {
          valueDecimals: 2,
          pointFormat:
            '<div class="chart-series-tooltip">' +
            '<b>O</b>{point.open:.2f} ' +
            '<b>H</b>{point.high:.2f} ' +
            '<b>L</b>{point.low:.2f} ' +
            '<b>C</b><span class="change{point.custom.change:.2f}">{point.close:.2f}' +
            ' {point.custom.change:.2f} ({point.custom.changePercent:.2f}%)</span>' +
            '</div>'
        }
      },
      {
        type: 'column',
        id: 'stock-volume',
        name: 'Volume',
        color: 'var(--chakra-colors-black)',
        data: series.volume,
        yAxis: 1,
        tooltip: {
          valueDecimals: 0,
          pointFormat:
            '<div class="chart-series-tooltip"><b>{series.name}</b> ' +
            '<span class="change{point.custom.change:.2f}">{point.y}</span></div>'
        }
      },
      {
        type: 'ema',
        linkedTo: 'stock-candlestick',
        color: 'var(--chakra-colors-gray-300)',
        lineWidth: 1,
        params: {
          period: 21
        },
        tooltip: {
          pointFormat: ''
        },
        enableMouseTracking: false,
        marker: {
          enabled: false
        }
      },
      {
        type: 'ema',
        linkedTo: 'stock-candlestick',
        color: 'var(--chakra-colors-gray-400)',
        lineWidth: 1,
        params: {
          period: 50
        },
        tooltip: {
          pointFormat: ''
        },
        enableMouseTracking: false,
        marker: {
          enabled: false
        }
      },
      {
        type: 'ema',
        linkedTo: 'stock-candlestick',
        color: 'var(--chakra-colors-red-400)',
        lineWidth: 1,
        params: {
          period: 200
        },
        tooltip: {
          pointFormat: ''
        },
        enableMouseTracking: false,
        marker: {
          enabled: false
        }
      }
    ]
  } as Highcharts.Options;
};
