import { HistoricalData } from '@/types/chart.type';
import { Stock } from '@/types/stock.type';

const cacheKey = 'historical-' + new Date().toISOString().substring(0, 13);
const timeout = 10000;

export const fetchStockRsList = async (): Promise<Stock[]> => {
  const url = 'https://raw.githubusercontent.com/iamping/us-stock-data/refs/heads/main/data/us_rs_list.json';
  return await fetchOrRetrieve(url, cacheKey, 'stockList');
};

export const fetchHistoricalData = async (ticker: string): Promise<HistoricalData> => {
  const params = new URLSearchParams({ ticker: ticker }).toString();
  const path = import.meta.env.DEV ? './historical-api' : 'https://yf-proxy.koyeb.app/';
  const url = `${path}?${params}`;
  return await fetchOrRetrieve(url, cacheKey, 'historical');
};

const fetchOrRetrieve = async (url: string, cacheKey: string, type: 'stockList' | 'historical') => {
  if (window.caches) {
    const cache = await window.caches.open(cacheKey);
    const cacheResponse = await cache.match(url);
    if (cacheResponse) {
      return cacheResponse.json();
    }
    await clearCache([cacheKey]);
    const response = await fetch(url, { signal: AbortSignal.timeout(timeout) });
    await validateData(response, type);
    cache.put(url, response.clone());
    return response.clone().json();
  } else {
    return fetch(url, { signal: AbortSignal.timeout(timeout) }).then((response) => response.clone().json());
  }
};

const validateData = async (response: Response, type: 'stockList' | 'historical') => {
  if (type === 'stockList') {
    const tmp = (await response.clone().json()) as Stock[];
    if (!(tmp?.length > 0)) {
      throw Error('Failed to fetch data.');
    }
  }
  if (type === 'historical') {
    const tmp = (await response.clone().json()) as HistoricalData;
    if (!(tmp?.close?.length > 0)) {
      throw Error('Failed to fetch data.');
    }
  }
};

const clearCache = async (excludeKeys?: string[]) => {
  const keys = await caches.keys();
  if (keys.length === 1) {
    return;
  }
  for (const key of keys) {
    if (!excludeKeys?.includes(key)) {
      await caches.delete(key);
    }
  }
};
