import Highcharts from 'highcharts';
import { ChartSeries, CustomPoint, CustomSeries, HistoricalData, SeriePoint } from '../models/historical-data';
import { Stock } from '../models/stock';
import { findMax } from './common.util';

const chartHeight = window.innerHeight - 48 * 2;

export const prepareSeries = (
  historicalData: HistoricalData | null,
  spyData: HistoricalData | null,
  stock: Stock | undefined
) => {
  const tmpSeries: ChartSeries = { ohlc: [], volume: [], rs: [] };
  if (historicalData && Object.keys(historicalData).length > 0 && spyData && stock) {
    const len = historicalData.date.length;
    const spyLen = spyData.date.length;
    const start = len < spyLen ? spyLen - len : 0;
    const showRsNewhighPeriod = 20;
    const newHighPeriod = 250;
    const pocketPivotPeriod = 10;
    const avgVolumePeriod = 50;
    let maxRs = 0,
      newHigh = 0,
      maxVolumeOnLossDay = 0,
      avgVolume = stock.avgVolume,
      enoughPriceData = false,
      enoughVolumeData = false;
    const priceSlice: number[] = [],
      rsSlice: number[] = [],
      volumeSlice: { volume: number; isGainer: boolean }[] = [];
    for (let i = 0; i < len; i++) {
      // OHLC Series
      const date = historicalData.date[i] * 1000;
      const close = historicalData.close[i];
      const previousClose = i > 0 ? historicalData.close[i - 1] : 0;
      const change = close - previousClose;
      tmpSeries.ohlc.push({
        x: date,
        open: historicalData.open[i],
        high: historicalData.high[i],
        low: historicalData.low[i],
        close: historicalData.close[i]
      });

      // Volume Series
      const volume = historicalData.volume[i];
      const isGreatVolume = volume > avgVolume;
      const isGainer = change > 0;
      const isVolumeGreaterThanLossDay = volume > maxVolumeOnLossDay;
      const isPocketPivot = enoughVolumeData && isGreatVolume && isGainer && isVolumeGreaterThanLossDay;
      tmpSeries.volume.push({
        x: date,
        y: volume,
        color: isPocketPivot
          ? 'var(--chakra-colors-blue-500)'
          : isGainer && isGreatVolume
            ? 'var(--chakra-colors-green-500)'
            : 'var(--chakra-colors-gray-200)'
      });
      volumeSlice.push({ volume, isGainer });
      if (i >= avgVolumePeriod - 1) {
        const sumVolume = volumeSlice.reduce((acc, e) => acc + e.volume, 0);
        avgVolume = sumVolume / avgVolumePeriod;
        const volumeSliceLosersOnly = volumeSlice
          .slice(avgVolumePeriod - pocketPivotPeriod, 50)
          .filter((e) => !e.isGainer)
          .map((e) => e.volume);
        maxVolumeOnLossDay = volumeSliceLosersOnly.length > 0 ? findMax(volumeSliceLosersOnly) : 0;
        if (volume === 875198000) {
          console.log(i, volume, avgVolume, maxVolumeOnLossDay);
        }
        enoughVolumeData = true;
        volumeSlice.shift();
      }

      // Relative Strength Series
      const rs = (close / spyData.close[i + start]) * 100;
      const rsNewhigh = i >= len - showRsNewhighPeriod ? rs > maxRs && enoughPriceData : false;
      const rsNewhighBeforePrice = rs > maxRs && newHigh > close && enoughPriceData;
      tmpSeries.rs.push({
        x: date,
        y: rs,
        marker: {
          enabled: rsNewhigh || rsNewhighBeforePrice,
          fillColor: rsNewhighBeforePrice ? 'rgb(0,204,0,0.4)' : 'rgb(0,0,0,0.2)',
          radius: 8,
          symbol: 'circle'
        }
      });
      if (len > newHighPeriod) {
        priceSlice.push(close);
        rsSlice.push(rs);
        if (i > newHighPeriod - 1) {
          maxRs = findMax(rsSlice);
          newHigh = findMax(priceSlice);
          enoughPriceData = true;
          priceSlice.shift();
          rsSlice.shift();
        }
      } else {
        maxRs = rs > maxRs ? rs : maxRs;
        newHigh = close > newHigh ? close : newHigh;
        enoughPriceData = true;
      }
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

export const chartOptions = (series: ChartSeries, stock: Stock | undefined) => {
  return {
    accessibility: { enabled: false },
    credits: {
      enabled: false
    },
    chart: {
      animation: false,
      height: `${chartHeight}`,
      // panning: { enabled: false },
      zooming: {
        mouseWheel: { enabled: false }
      },
      plotBorderWidth: 1,
      plotBorderColor: 'var(--chakra-colors-gray-300)',
      events: {
        render: function () {
          // add rs rating text
          const _this = this as Highcharts.Chart & { rsRatingText: Highcharts.SVGElement };
          const rsSeries = this.series.find((e) => e.name === 'Relative Strength');
          if (_this.rsRatingText) {
            _this.rsRatingText.destroy();
          }
          if (stock) {
            const pos = {
              x: (rsSeries?.chart.plotLeft ?? 0) + this.plotWidth - 100,
              y: this.plotHeight + 30
            };
            _this.rsRatingText = this.renderer
              .text(`RS Rating: ${stock?.rsRating ?? 0}`, pos.x, pos.y)
              .addClass('chart-rs-rating')
              .add();
          }

          // correct color of candlestick based on previous close
          const priceSeries = this.series.find((e) => e.name === 'Price') as CustomSeries;
          priceSeries.points.forEach((point: SeriePoint, index) => {
            const currentClose = point.close ?? 0;
            const currentOpen = point.open ?? 0;
            if (index === 0) {
              point.graphic?.css({
                fill: currentClose >= currentOpen ? 'var(--chakra-colors-white)' : 'var(--chakra-colors-black)'
              });
            } else {
              const previousClose = priceSeries.points[index - 1].y ?? 0;
              point.graphic?.css({
                fill: currentClose >= previousClose ? 'var(--chakra-colors-white)' : 'var(--chakra-colors-black)'
              });
            }
          });

          // check if chart is grouped, and reset color of volume column
          const volumeSeries = this.series.find((e) => e.name === 'Volume') as CustomSeries;
          if (volumeSeries?.currentDataGrouping?.unitName === 'week') {
            const avgVolumeWeek = (stock?.avgVolume ?? 0) * 5;
            volumeSeries.points.forEach((point) => {
              const weekVolume = point.y ?? 0;
              if (weekVolume > avgVolumeWeek) {
                point.graphic?.css({ fill: 'var(--chakra-colors-black)' });
              } else {
                point.graphic?.css({ fill: 'var(--chakra-colors-gray-200)' });
              }
            });
          }
        }
      }
    },
    navigator: {
      enabled: false
    },
    tooltip: {
      backgroundColor: 'transparent',
      shadow: false,
      useHTML: true,
      borderRadius: 0,
      borderWidth: 0,
      headerShape: 'rect',
      formatter: function () {
        const _this = this as CustomPoint;
        const index = _this.points[0].index;
        const pricePoint = _this.points.find((e) => e.series.name === 'Price');
        const volumePoint = _this.points.find((e) => e.series.name === 'Volume');
        const rsPoint = _this.points.find((e) => e.series.name === 'Relative Strength');
        const change = [];
        if (index === 0) {
          change.push(0, 0);
        } else {
          const previousPoint = pricePoint?.series.points[index - 1] as SeriePoint;
          const close = pricePoint?.close ?? 0; // should not be undefined
          const previousClose = previousPoint?.close ?? 0; // should not be undefined
          change.push(close - previousClose, (close / previousClose - 1) * 100);
        }
        const date = `<p class="chart-date-tooltip">${Highcharts.dateFormat('%A, %e %b %Y', this.x)}</p>`;
        const price = `<div class="chart-series-tooltip">
          <b>O</b>${Highcharts.numberFormat(pricePoint?.open ?? 0, 2)} 
          <b>H</b>${Highcharts.numberFormat(pricePoint?.high ?? 0, 2)}
          <b>L</b>${Highcharts.numberFormat(pricePoint?.low ?? 0, 2)}
          <b>C</b><span class="change${change[0]}">${Highcharts.numberFormat(pricePoint?.close ?? 0, 2)}
           ${Highcharts.numberFormat(change[0], 2)} (${Highcharts.numberFormat(change[1], 2)}%)</span>
          </div>`;
        const volume = `<div class="chart-series-tooltip"><b>Volume</b> 
          <span class="change${change[0]}">${Highcharts.numberFormat(volumePoint?.y ?? 0, 0)}</span></div>`;
        const relativeStrength = `<div class="chart-series-tooltip"><b>Relative Strength</b> 
          <span>${Highcharts.numberFormat(rsPoint?.y ?? 0, 2)}</span></div>`;

        return [date, price, volume, relativeStrength];
      },
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
        height: '60%',
        crosshair: {
          label: {
            enabled: true,
            backgroundColor: 'var(--chakra-colors-black)',
            padding: 2,
            shape: 'rect',
            borderRadius: 0,
            format: '{value:.2f}'
          }
        }
      },
      {
        gridLineWidth: 1,
        gridLineColor: 'var(--chakra-colors-gray-300)',
        gridLineDashStyle: 'Dash',
        labels: {
          enabled: false
        },
        top: '60%',
        height: '20%'
      },
      {
        gridLineWidth: 1,
        gridLineColor: 'var(--chakra-colors-gray-300)',
        gridLineDashStyle: 'Dash',
        labels: {
          enabled: false
        },
        top: '80%',
        height: '20%'
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
        name: 'Price',
        color: 'var(--chakra-colors-black)',
        data: series.ohlc
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
      },
      {
        type: 'column',
        id: 'stock-volume',
        name: 'Volume',
        data: series.volume,
        yAxis: 1
      },
      {
        type: 'line',
        id: 'rs-line',
        name: 'Relative Strength',
        color: 'var(--chakra-colors-black)',
        data: series.rs,
        lineWidth: 1,
        yAxis: 2
      },
      {
        type: 'ema',
        linkedTo: 'rs-line',
        color: 'var(--chakra-colors-gray-300)',
        lineWidth: 1,
        yAxis: 2,
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
      }
    ]
  } as Highcharts.Options;
};
