import { Row } from '@tanstack/react-table';
import { SelectOption } from '../components/ui/filter';
import { Stock } from '../models/Stock';

export const fallBackData: Stock[] = [];

export const noOtc = ['NMS', 'NYQ', 'NGM', 'PCX', 'ASE', 'BTS', 'NCM'];

export const marketCapOptions: SelectOption[] = [
  {
    value: 'titan',
    title: '200B and above',
    description: 'Titans',
    operator: '>=',
    compareNumber1: 200000000000
  },
  {
    value: 'middle',
    title: '2B and above',
    description: 'Middlers+',
    operator: '>=',
    compareNumber1: 2000000000
  },
  {
    value: 'small',
    title: '2B and below',
    description: 'Small caps',
    operator: '<',
    compareNumber1: 2000000000
  }
];

export const avgDollarVolOptions: SelectOption[] = [
  {
    value: '20up',
    title: '20M and above',
    operator: '>=',
    compareNumber1: 20000000
  },
  {
    value: '10up',
    title: '10M and above',
    operator: '>=',
    compareNumber1: 10000000
  },
  {
    value: 'below10',
    title: '10M and below',
    operator: '<',
    compareNumber1: 10000000
  }
];

export const amountFilterFn =
  (optionList: SelectOption[]) =>
  <T,>(row: Row<T>, columnId: string, filterValue: string) => {
    const option = optionList.find((e) => e.value === filterValue);
    const compareNumber1 = option?.compareNumber1 ?? 0;
    switch (option?.operator) {
      case '>=':
        return Number(row.getValue(columnId)) >= compareNumber1;
      case '<':
        return Number(row.getValue(columnId)) < compareNumber1;
    }
    return true;
  };
