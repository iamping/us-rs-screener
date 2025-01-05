import Highcharts from 'highcharts';
import { ChartSeries, CustomPoint, CustomSeries, HistoricalData, SeriePoint } from '../models/historical-data';
import { Stock, StockInfo } from '../models/stock';
import { findMax } from './common.util';

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
    let rsNewHigh = 0,
      priceNewHigh = 0,
      maxVolumeOnLosingDay = 0,
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
      const isGainer = change >= 0;
      const isVolumeGreaterThanLosingDay = volume > maxVolumeOnLosingDay;
      const isPocketPivot = enoughVolumeData && isGreatVolume && isGainer && isVolumeGreaterThanLosingDay;
      tmpSeries.volume.push({
        x: date,
        y: volume,
        color: isPocketPivot
          ? 'var(--chakra-colors-blue-500)'
          : isGainer && isGreatVolume
            ? 'var(--chakra-colors-green-500)'
            : !isGainer && isGreatVolume
              ? 'var(--chakra-colors-red-500)'
              : 'var(--chakra-colors-gray-200)'
      });
      volumeSlice.push({ volume, isGainer });
      if (i >= avgVolumePeriod - 1) {
        const sumVolume = volumeSlice.reduce((acc, e) => acc + e.volume, 0);
        avgVolume = sumVolume / avgVolumePeriod;
        const volumeLosingDay = volumeSlice
          .slice(avgVolumePeriod - pocketPivotPeriod, 50)
          .filter((e) => !e.isGainer)
          .map((e) => e.volume);
        maxVolumeOnLosingDay = volumeLosingDay.length > 0 ? findMax(volumeLosingDay) : 0;
        enoughVolumeData = true;
        volumeSlice.shift();
      }

      // Relative Strength Series
      const rs = (close / spyData.close[i + start]) * 100;
      const isRsNewHigh = i >= len - showRsNewhighPeriod ? rs > rsNewHigh && enoughPriceData : false;
      const isRsNewHighBeforePrice = rs > rsNewHigh && priceNewHigh > close && enoughPriceData;
      tmpSeries.rs.push({
        x: date,
        y: rs,
        marker: {
          enabled: isRsNewHigh || isRsNewHighBeforePrice,
          fillColor: isRsNewHighBeforePrice ? 'rgb(0,204,0,0.4)' : 'rgb(0,0,0,0.2)',
          radius: 8,
          symbol: 'circle'
        }
      });
      if (len > newHighPeriod) {
        priceSlice.push(close);
        rsSlice.push(rs);
        if (i > newHighPeriod - 1) {
          rsNewHigh = findMax(rsSlice);
          priceNewHigh = findMax(priceSlice);
          enoughPriceData = true;
          priceSlice.shift();
          rsSlice.shift();
        }
      } else {
        rsNewHigh = rs > rsNewHigh ? rs : rsNewHigh;
        priceNewHigh = close > priceNewHigh ? close : priceNewHigh;
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

export const chartOptions = (
  series: ChartSeries,
  stock: Stock | undefined,
  chartHeight: number,
  setStockInfo: (stockInfo: StockInfo) => void
) => {
  return {
    accessibility: { enabled: false },
    credits: {
      enabled: false
    },
    chart: {
      marginBottom: 0,
      marginTop: 10,
      animation: false,
      height: chartHeight,
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
              x: (rsSeries?.chart.plotLeft ?? 0) + this.plotWidth - 80,
              y: (rsSeries?.chart.plotHeight ?? 0) + (rsSeries?.chart.plotTop ?? 0) - 10
            };
            _this.rsRatingText = this.renderer
              .text(`RS Rating: ${stock?.rsRating ?? 0}`, pos.x, pos.y, true)
              .addClass('chart-rs-rating')
              .add();
          }

          // correct color of candlestick based on previous close
          const stockInfo = { change: 0, percentChange: 0, volume: 0 };
          const priceSeries = this.series.find((e) => e.name === 'Price') as CustomSeries;
          const volumeSeries = this.series.find((e) => e.name === 'Volume') as CustomSeries;
          const avgVolumePeriod = 10; // 10 weeks
          priceSeries.points.forEach((point: SeriePoint, index) => {
            const currentClose = point.close ?? 0;
            const previousClose = index === 0 ? (point.open ?? 0) : (priceSeries.points[index - 1].y ?? 0);
            point.graphic?.css({
              fill: currentClose >= previousClose ? 'var(--chakra-colors-white)' : 'var(--chakra-colors-red-500)',
              stroke: currentClose >= previousClose ? 'var(--chakra-colors-gray-500)' : 'var(--chakra-colors-red-500)'
            });
            if (volumeSeries?.currentDataGrouping?.unitName === 'week') {
              const volumePoint = volumeSeries.points[index];
              const volumes = volumeSeries.points.map((e) => e.y ?? 0);
              let avgVolume = 0;
              if (index >= avgVolumePeriod) {
                const volumeSlice = volumes.slice(index - avgVolumePeriod, index);
                const sumVolume = volumeSlice.reduce((acc, e) => acc + e, 0);
                avgVolume = sumVolume / avgVolumePeriod;
              }
              volumePoint.graphic?.css({
                fill:
                  currentClose < previousClose && volumes[index] > avgVolume && avgVolume > 0
                    ? 'var(--chakra-colors-red-500)'
                    : currentClose >= previousClose && volumes[index] > avgVolume && avgVolume > 0
                      ? 'var(--chakra-colors-green-500)'
                      : 'var(--chakra-colors-gray-200)'
              });
            }

            stockInfo.change = currentClose - previousClose;
            stockInfo.percentChange = (currentClose / previousClose - 1) * 100;
            stockInfo.volume = volumeSeries.points[index].y ?? 0;
          });

          setStockInfo(stockInfo);
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
        const price = `<div class="chart-price-tooltip chart-series-tooltip">
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
          return { x: tmpX, y: chart.plotHeight + chart.plotTop };
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
    xAxis: {
      tickLength: 0,
      labels: {
        distance: 5
      }
    },
    yAxis: [
      {
        gridLineWidth: 1,
        gridLineColor: 'var(--chakra-colors-gray-300)',
        gridLineDashStyle: 'Dash',
        type: 'logarithmic',
        endOnTick: false,
        startOnTick: false,
        labels: {
          align: 'left'
        },
        height: '70%',
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
        top: '70%',
        height: '15%'
      },
      {
        gridLineWidth: 1,
        gridLineColor: 'var(--chakra-colors-gray-300)',
        gridLineDashStyle: 'Dash',
        labels: {
          enabled: false
        },
        top: '85%',
        height: '15%'
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
          },
          preserveDataGrouping: true
        },
        {
          type: 'all',
          text: 'W',
          title: 'Week',
          dataGrouping: {
            forced: true,
            units: [['week', [1]]]
          },
          preserveDataGrouping: true
        }
      ]
    },
    plotOptions: {
      ohlc: { lineWidth: 2 }
    },
    series: [
      {
        type: 'ohlc',
        id: 'stock-ohlc',
        name: 'Price',
        color: 'var(--chakra-colors-gray-500)',
        data: series.ohlc
      },

      {
        type: 'ema',
        linkedTo: 'stock-ohlc',
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
        linkedTo: 'stock-ohlc',
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
        linkedTo: 'stock-ohlc',
        color: 'var(--chakra-colors-black)',
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
        color: 'var(--chakra-colors-gray-500)',
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
    ],
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500
          },
          chartOptions: {
            plotOptions: { ohlc: { lineWidth: 1 } }
          }
        },
        {
          condition: {
            maxHeight: 500
          },
          chartOptions: {
            plotOptions: { ohlc: { lineWidth: 1 } }
          }
        }
      ]
    }
  } as Highcharts.Options;
};
