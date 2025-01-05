const decimalFormatter = new Intl.NumberFormat('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const decimalFormatterWithSign = new Intl.NumberFormat('en-us', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'exceptZero'
});
const numberFormatter = new Intl.NumberFormat('en-us', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export const formatDecimal = (val: string | number, signDisplay: boolean = false) => {
  return signDisplay ? decimalFormatterWithSign.format(Number(val)) : decimalFormatter.format(Number(val));
};

export const formatNumber = (val: string | number) => {
  return numberFormatter.format(Number(val));
};

export const mobileMediaQuery = '(max-width: 680px)';

export const findMax = (arr: number[]) => {
  return Math.max(...arr);
};
