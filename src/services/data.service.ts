export const fetchStockRsList = fetch('./api/us_rs_list.json');

export const fetchHistoricalData = (ticker: string) => {
  const params = new URLSearchParams({ ticker: ticker }).toString();
  const path = import.meta.env.DEV ? './historical-api' : 'https://yf-proxy.koyeb.app/';
  return fetch(`${path}?${params}`);
};
