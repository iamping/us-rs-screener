import { Row } from '@tanstack/react-table';
import { SelectOption } from '../components/ui/filter';
import { Stock } from '../models/Stock';

export const fallBackData: Stock[] = [];

export const noOtc = ['NMS', 'NYQ', 'NGM', 'PCX', 'ASE', 'BTS', 'NCM'];

export const defaultFilterState = [];
// export const defaultFilterState = [
//   {
//     id: 'exchange',
//     value: noOtc
//   }
// ];

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
    title: 'Under 2B',
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
    value: '10down',
    title: 'Under 10M',
    operator: '<',
    compareNumber1: 10000000
  }
];

export const rsRatingOptions: SelectOption[] = [
  {
    value: '90up',
    title: '90 and above',
    description: 'Pack your spacesuit',
    operator: '>=',
    compareNumber1: 90
  },
  {
    value: '80up',
    title: '80 and above',
    description: 'Heading somewhere',
    operator: '>=',
    compareNumber1: 80
  },
  {
    value: '70up',
    title: '70 and above',
    description: "It's something",
    operator: '>=',
    compareNumber1: 70
  },
  {
    value: '70down',
    title: 'Under 70',
    description: 'No expectation',
    operator: '<',
    compareNumber1: 70
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
      case '<=':
        return Number(row.getValue(columnId)) <= compareNumber1;
      case '<':
        return Number(row.getValue(columnId)) < compareNumber1;
    }
    return true;
  };
