const decimalFormatter = new Intl.NumberFormat('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const numberFormatter = new Intl.NumberFormat('en-us', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export const formatDecimal = (val: string | number) => {
  return decimalFormatter.format(Number(val));
};

export const formatNumber = (val: string | number) => {
  return numberFormatter.format(Number(val));
};

export const mobileMediaQuery = '(max-width: 680px)';

export const findMax = (arr: number[]) => {
  return Math.max(...arr);
};
