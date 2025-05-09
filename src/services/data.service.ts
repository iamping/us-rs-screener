import { Stock } from '@/types/stock';
import { HistoricalData } from '@/types/stock-chart';

const cacheKey = 'historical-' + new Date().toISOString().substring(0, 13);
const timeout = 10000;

export const fetchStockRsList = async (): Promise<Stock[]> => {
  const url = './api/us_rs_list.json';
  return await fetchOrRetrieve(url, cacheKey);
};

export const fetchHistoricalData = async (ticker: string): Promise<HistoricalData> => {
  const params = new URLSearchParams({ ticker: ticker }).toString();
  const path = import.meta.env.DEV ? './historical-api' : 'https://yf-proxy.koyeb.app/';
  const url = `${path}?${params}`;
  return await fetchOrRetrieve(url, cacheKey);
};

const fetchOrRetrieve = async (url: string, cacheKey: string) => {
  if (window.caches) {
    const cache = await window.caches.open(cacheKey);
    const cacheResponse = await cache.match(url);
    if (cacheResponse) {
      return cacheResponse.json();
    }
    await clearCache([cacheKey]);
    const response = await fetch(url, { signal: AbortSignal.timeout(timeout) });
    cache.put(url, response.clone());
    return response.clone().json();
  } else {
    return fetch(url, { signal: AbortSignal.timeout(timeout) }).then((response) => response.clone().json());
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
