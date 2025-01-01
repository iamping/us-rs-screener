import { HistoricalData } from '../models/historical-data';
import { Stock } from '../models/stock';

const cacheKey = 'historical-' + new Date().toISOString().substring(0, 10);

export const fetchStockRsList = async (): Promise<Stock[]> => {
  const url = './api/us_rs_list.json';
  const cache = await caches.open(cacheKey);
  const cacheResponse = await cache.match(url);
  if (cacheResponse) {
    return cacheResponse.json();
  }

  await clearCache([cacheKey]);

  const response = await fetch(url);
  cache.put(url, response.clone());
  return response.clone().json();
};

export const fetchHistoricalData = async (ticker: string): Promise<HistoricalData> => {
  const params = new URLSearchParams({ ticker: ticker }).toString();
  const path = import.meta.env.DEV ? './historical-api' : 'https://yf-proxy.koyeb.app/';
  const url = `${path}?${params}`;
  const cache = await caches.open(cacheKey);
  const cacheResponse = await cache.match(url);
  if (cacheResponse) {
    return cacheResponse.json();
  }

  await clearCache([cacheKey]);

  const response = await fetch(url);
  cache.put(url, response.clone());
  return response.clone().json();
};

const clearCache = async (excludeKeys?: string[]) => {
  for (const key of await caches.keys()) {
    if (!excludeKeys?.includes(key)) {
      await caches.delete(key);
    }
  }
};
