import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';
import stockList from '../../output/us_rs_list.json';

export const worker = setupWorker(http.get('/api/us_rs_list.json', () => HttpResponse.json(stockList)));
