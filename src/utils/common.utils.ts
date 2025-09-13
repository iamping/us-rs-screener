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

export const getAbbreviation = (text: string, limit = 8) => {
  return text.length <= limit
    ? text
    : text
        .split(' ')
        .map((e) => e[0])
        .join('');
};

export const toKebabCase = (text: string) => {
  return text.toLowerCase().split(' ').join('-');
};

export const setCssVar = (name: string, value: string) => {
  document.documentElement.style.setProperty(name, value);
};

export const getCssVar = (name: string) => {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
};

export const getISOWeekAndYear = (date: Date) => {
  const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  // ISO week starts on Monday, so Sunday (0) becomes 7
  const dayNum = tempDate.getUTCDay() || 7;

  // Set date to Thursday in current ISO week
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);

  const isoYear = tempDate.getUTCFullYear();

  // Get first day of ISO year
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const dayOfYear = Math.floor((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1;
  const weekNo = Math.ceil(dayOfYear / 7);

  return { week: weekNo, year: isoYear };
};

export const getNextDates = (date: Date, no = 5, isWeekly = false) => {
  const dates = [];
  for (let i = 0; i < no; i++) {
    const nextDate = new Date(date);
    nextDate.setDate(isWeekly ? date.getDate() + (i + 1) * 7 : date.getDate() + i + 1);
    dates.push(nextDate);
  }
  return dates;
};

export const getPreviousDates = (date: Date, no = 5, isWeekly = false) => {
  const dates = [];
  for (let i = no; i > 0; i--) {
    const previousDate = new Date(date);
    previousDate.setDate(isWeekly ? date.getDate() - i * 7 : date.getDate() - i);
    dates.push(previousDate);
  }
  return dates;
};

export const isTouchDeviceMatchMedia = () => {
  return (
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(any-pointer: coarse)').matches ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0
  );
};
