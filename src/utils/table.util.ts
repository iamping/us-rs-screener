import { ColumnFiltersState, Row } from '@tanstack/react-table';
import { Stock } from '../models/stock';
import { ColumnVisibility, SelectOption, Settings } from '../models/common';

export const fallBackData: Stock[] = [];

export const defaultPagination = {
  pageIndex: 0, //initial page index
  pageSize: 20 //default page size
};

export const defaultFilterState: ColumnFiltersState = [];

export const defaultColumnVisibility: ColumnVisibility = {};

export const defaultSettings: Settings = {
  includeOtc: false,
  includeBiotechnology: false
};

export const defaultPinnedColumns = ['ticker'];

export const defaultPreset = { value: 'default', title: 'Default' };

export const defaultView = { value: 'default', title: 'Default' };

export const includeExchanges = ['NMS', 'NYQ', 'NGM', 'PCX', 'ASE', 'BTS', 'NCM'];

export const excludeIndustry = ['Biotechnology'];

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
    value: 'under10',
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
    value: 'under70',
    title: 'Under 70',
    description: 'No expectation',
    operator: '<',
    compareNumber1: 70
  }
];

export const percentChangeOptions: SelectOption[] = [
  {
    value: '30up',
    title: '30% and above',
    description: 'To the moon',
    operator: '>=',
    compareNumber1: 30
  },
  {
    value: '20up',
    title: '20% and above',
    description: 'A fistful of dollars',
    operator: '>=',
    compareNumber1: 20
  },
  {
    value: '10up',
    title: '10% and above',
    description: 'Heading somewhere',
    operator: '>=',
    compareNumber1: 10
  },
  {
    value: '0to10',
    title: '0% to 10%',
    description: 'Modest momentum',
    operator: '<>',
    compareNumber1: 0,
    compareNumber2: 10
  },
  {
    value: '0up',
    title: '0% and above',
    description: 'In the green',
    operator: '>=',
    compareNumber1: 0
  },
  {
    value: 'under0',
    title: 'Under 0%',
    description: 'In the red',
    operator: '<',
    compareNumber1: 0
  }
];

export const relativeVolOptions: SelectOption[] = [
  {
    value: '2up',
    title: '2.0 and above',
    operator: '>=',
    compareNumber1: 2
  },
  {
    value: '1up',
    title: '1.0 and above',
    operator: '>=',
    compareNumber1: 1
  },
  {
    value: 'under1',
    title: 'Under 1.0',
    operator: '<',
    compareNumber1: 1
  }
];

export const amountFilterFn =
  (optionList: SelectOption[]) =>
  <T>(row: Row<T>, columnId: string, filterValue: string) => {
    const option = optionList.find((e) => e.value === filterValue);
    const compareNumber1 = option?.compareNumber1 ?? 0;
    const compareNumber2 = option?.compareNumber2 ?? 0;
    switch (option?.operator) {
      case '>=':
        return Number(row.getValue(columnId)) >= compareNumber1;
      case '<=':
        return Number(row.getValue(columnId)) <= compareNumber1;
      case '<':
        return Number(row.getValue(columnId)) < compareNumber1;
      case '<>':
        return Number(row.getValue(columnId)) >= compareNumber1 && Number(row.getValue(columnId)) <= compareNumber2;
    }
    return true;
  };

export const customArrIncludesSome = <T>(row: Row<T>, columnId: string, filterValues: string[]) => {
  return filterValues.includes(row.getValue(columnId));
};
customArrIncludesSome.autoRemove = (val: string[]) => !val?.length;

export const initialFilter = (stockList: Stock[], settings: Settings) => {
  return stockList
    .filter((e) => {
      return settings.includeOtc ? true : includeExchanges.includes(e.exchange);
    })
    .filter((e) => {
      return settings.includeBiotechnology ? true : !excludeIndustry.includes(e.industry);
    })
    .map((e, i) => ({ ...e, key: i + 1 }));
};

export const presetOptions: SelectOption[] = [
  {
    value: 'default',
    title: 'Default',
    description: 'No filters',
    presetStates: defaultFilterState
  },
  {
    value: 'strength',
    title: 'Market Leader',
    description: 'Strength + Volume',
    presetStates: [
      {
        id: 'rsRating',
        value: '90up'
      },
      {
        id: 'rsRating3M',
        value: '80up'
      },
      {
        id: 'avgDollarVolume',
        value: '20up'
      }
    ]
  }
];

export const viewOptions: SelectOption[] = [
  {
    value: 'default',
    title: 'Default',
    description: 'All columns',
    columnVisibility: {}
  },
  {
    value: 'compact',
    title: 'Compact',
    description: 'Hide unimportant columns',
    columnVisibility: {
      sector: false,
      sectorRank: false
    }
  }
];

export const dataMapping = (stocks: Stock[]) => {
  return stocks.map((e, i) => ({
    ...e,
    pocketPivot: e.pocketPivot ? 'Yes' : 'No',
    rsNewHigh: e.rsNewHigh === 0 ? 'No' : e.rsNewHigh === 1 ? 'New High' : 'Before Price',
    key: i + 1
  }));
};
