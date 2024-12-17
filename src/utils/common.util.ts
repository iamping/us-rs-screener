import { Stock } from '../models/Stock';

const decimalFormatter = new Intl.NumberFormat('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const numberFormatter = new Intl.NumberFormat('en-us', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export const formatDecimal = (val: string | number) => {
  return decimalFormatter.format(Number(val));
};

export const formatNumber = (val: string | number) => {
  return numberFormatter.format(Number(val));
};

export const getAutoCompleteOptions = (stocks: Stock[], key?: string) => {
  return stocks
    .filter((e) => (key ? e.ticker.toLowerCase().indexOf(key) >= 0 : true))
    .map((e) => ({ value: e.ticker }))
    .sort((a, b) => (a.value > b.value ? 1 : -1));
};
