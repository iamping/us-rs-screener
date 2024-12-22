// TradingView.jsx
import { useEffect, useRef, FC } from 'react';

export const TradingViewWidget: FC<{ ticker: string }> = ({ ticker }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = {
      autosize: true,
      symbol: `${ticker.replace('-', '.')}`,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '0',
      range: '12M',
      locale: 'en',
      save_image: false,
      allow_symbol_change: false,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      studies: ['MAExp@tv-basicstudies', 'MASimple@tv-basicstudies'],
      studies_overrides: JSON.stringify({
        'moving average exponential.length': 50,
        'moving average.length': 200
      })
    };
    const script = document.createElement('script');
    script.id = 'trading-view-script';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `${JSON.stringify(params)}`;
    if (container.current) {
      const existingNode = container.current.querySelector('#trading-view-script');
      if (existingNode) {
        container.current.replaceChild(script, existingNode);
      } else {
        container.current.appendChild(script);
      }
    }
  }, [ticker]);

  if (ticker === '') {
    return <></>;
  }

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: '100%', width: '100%' }}>
      <div className="tradingview-widget-container__widget" style={{ height: '100%', width: '100%' }}></div>
    </div>
  );
};

// Notes
// - https://www.tradingview.com/charting-library-docs/latest/api/interfaces/Charting_Library.StudyOverrides/
// - Color can be set via UI and then click save as default :)
/*
const indiatorList = {
  'ACCD@tv-basicstudies': 'STD;Accumulation_Distribution',
  'studyADR@tv-basicstudies': 'STD;Advance_Decline_Ratio_Bars',
  'AROON@tv-basicstudies': 'STD;Aroon',
  'ATR@tv-basicstudies': 'STD;Average_True_Range',
  'AwesomeOscillator@tv-basicstudies': 'STD;Awesome_Oscillator',
  'BB@tv-basicstudies': 'STD;Bollinger_Bands',
  'BollingerBandsR@tv-basicstudies': 'STD;Bollinger_Bands_B',
  'BollingerBandsWidth@tv-basicstudies': 'STD;Bollinger_Bands_Width',
  'CMF@tv-basicstudies': 'STD;Chaikin_Money_Flow',
  'ChaikinOscillator@tv-basicstudies': 'STD;Chaikin_Oscillator',
  'ChoppinessIndex@tv-basicstudies': 'STD;Choppiness_Index',
  'DoubleEMA@tv-basicstudies': 'STD;DEMA',
  'WilliamR@tv-basicstudies': 'STD;Willams_R',
  'CCI@tv-basicstudies': 'STD;CCI',
  'CRSI@tv-basicstudies': 'STD;Connors_RSI',
  'DetrendedPriceOscillator@tv-basicstudies': 'STD;DPO',
  'DM@tv-basicstudies': 'STD;DMI',
  'DONCH@tv-basicstudies': 'STD;Donchian_Channels',
  'EaseOfMovement@tv-basicstudies': 'STD;EOM',
  'EFI@tv-basicstudies': 'STD;EFI',
  'ENV@tv-basicstudies': 'STD;ENV',
  'FisherTransform@tv-basicstudies': 'STD;Fisher_Transform',
  'HV@tv-basicstudies': 'STD;Historical_Volatility',
  'KLTNR@tv-basicstudies': 'STD;Keltner_Channels',
  'MOM@tv-basicstudies': 'STD;Momentum',
  'MF@tv-basicstudies': 'STD;Money_Flow',
  'UltimateOsc@tv-basicstudies': 'STD;Ultimate_Oscillator',
  'Trix@tv-basicstudies': 'STD;TRIX',
  'Stochastic@tv-basicstudies': 'STD;Stochastic',
  'StochasticRSI@tv-basicstudies': 'STD;Stochastic_RSI',
  'RSI@tv-basicstudies': 'STD;RSI',
  'ROC@tv-basicstudies': 'STD;ROC',
  'PriceOsc@tv-basicstudies': 'STD;Price_Oscillator',
  'MASimple@tv-basicstudies': 'STD;SMA',
  'OBV@tv-basicstudies': 'STD;On_Balance_Volume',
  'PSAR@tv-basicstudies': 'STD;PSAR',
  'VigorIndex@tv-basicstudies': 'STD;Relative_Vigor_Index',
  'VolatilityIndex@tv-basicstudies': 'STD;Relative_Volatility_Index',
  'SMIErgodicIndicator@tv-basicstudies': 'STD;SMI_Ergodic_Indicator_Oscillator',
  'SMIErgodicOscillator@tv-basicstudies': 'STD;SMI_Ergodic_Oscillator',
  'MACD@tv-basicstudies': 'STD;MACD',
  'MAWeighted@tv-basicstudies': 'STD;WMA',
  'MAExp@tv-basicstudies': 'STD;EMA',
  'hullMA@tv-basicstudies': 'STD;Hull%1MA',
  'chandeMO@tv-basicstudies': 'STD;Chande_Momentum_Oscillator',
  'TripleEMA@tv-basicstudies': 'STD;TEMA',
  'MAVolumeWeighted@tv-basicstudies': 'STD;VWMA',
  'WilliamsAlligator@tv-basicstudies': 'STD;Williams_Alligator',
  'WilliamsFractal@tv-basicstudies': 'STD;Whilliams_Fractals'
};
*/
