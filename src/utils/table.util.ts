import { ColumnFiltersState, Row } from '@tanstack/react-table';
import { Stock } from '../models/stock';
import { ColumnVisibility, Operator, SelectOption, Settings, TRecord } from '../models/common';

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
    value: 'large',
    title: '5B and above',
    description: 'Large caps+',
    operator: '>=',
    compareNumber1: 5000000000
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
    operator: 'between',
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

export const priceOptions: SelectOption[] = [
  {
    value: 'gtEMA21',
    title: 'Above EMA21',
    operator: '>=',
    compareFields: ['ema21']
  },
  {
    value: 'gtEMA50',
    title: 'Above EMA50',
    operator: '>=',
    compareFields: ['ema50']
  },
  {
    value: 'gtEMA200',
    title: 'Above EMA200',
    operator: '>=',
    compareFields: ['ema200']
  },
  {
    value: 'markPriceTemplateMAs',
    title: 'Mark MAs',
    description: 'Above Key EMAs',
    operator: 'chain-gt',
    compareFields: ['ema21', 'ema50', 'ema150', 'ema200', 'ema2001M']
  },
  {
    value: 'markMAsLoose',
    title: 'Mark MAs 150/200',
    description: 'Above 150/200 EMAs',
    operator: 'chain-gt',
    compareFields: ['ema150', 'ema200', 'ema2001M']
  },
  {
    value: 'above52WLow',
    title: 'Above 52W Low',
    description: 'More than 30%',
    operator: '>',
    compareFields: ['wk52Low'],
    comparePercent: 0.3
  },
  {
    value: 'near52WHigh',
    title: 'Near 52W High',
    description: 'Not lower than 25%',
    operator: '>=',
    compareFields: ['wk52High'],
    comparePercent: -0.25
  }
];

export const amountFilterFn =
  (optionList: SelectOption[]) =>
  <T>(row: Row<T>, columnId: string, filterValue: string) => {
    const option = optionList.find((e) => e.value === filterValue);
    const operator = option?.operator ?? '';
    const record = row as TRecord<T>;
    const compareFields = option?.compareFields ?? [];
    if (compareFields.length > 0) {
      if (compareFields.length === 1) {
        const compareNumber1 = record.original[compareFields[0]];
        const compareNumber2 = 0;
        if (compareNumber1 > 0) {
          return compareFn(operator, Number(row.getValue(columnId)), compareNumber1, compareNumber2);
        }
      } else {
        const values = [Number(row.getValue(columnId)), ...compareFields.map((field) => record.original[field])];
        return compareChainFn(operator, values);
      }

      return false;
    } else {
      const compareNumber1 = option?.compareNumber1 ?? 0;
      const compareNumber2 = option?.compareNumber2 ?? 0;
      return compareFn(operator, Number(row.getValue(columnId)), compareNumber1, compareNumber2);
    }
  };

export const multiSelectFilterFn = (optionList: SelectOption[]) => {
  const fn = <T>(row: Row<T>, columnId: string, filterValues: string[]) => {
    return filterValues.every((filterValue) => {
      const option = optionList.find((e) => e.value === filterValue);
      const operator = option?.operator ?? '';
      const record = row as TRecord<T>;
      const compareFields = option?.compareFields ?? [];
      if (compareFields.length > 0) {
        if (compareFields.length === 1) {
          const compareNumber1 = option?.comparePercent
            ? (1 + option.comparePercent) * record.original[compareFields[0]]
            : record.original[compareFields[0]];
          const compareNumber2 = 0;
          if (compareNumber1 > 0) {
            return compareFn(operator, Number(row.getValue(columnId)), compareNumber1, compareNumber2);
          }
        } else {
          const values = [Number(row.getValue(columnId)), ...compareFields.map((field) => record.original[field])];
          return compareChainFn(operator, values);
        }

        return false;
      } else {
        const compareNumber1 = option?.compareNumber1 ?? 0;
        const compareNumber2 = option?.compareNumber2 ?? 0;
        return compareFn(operator, Number(row.getValue(columnId)), compareNumber1, compareNumber2);
      }
    });
  };
  fn.autoRemove = (val: string[]) => !val?.length;
  return fn;
};

const compareFn = (operator: Operator, source: number, number1: number, number2: number) => {
  switch (operator) {
    case '>=':
      return source >= number1;
    case '<=':
      return source <= number1;
    case '<':
      return source < number1;
    case '>':
      return source > number1;
    case 'between':
      return source >= number1 && source <= number2;
  }
  return false;
};

const compareChainFn = (operator: Operator, values: number[]) => {
  switch (operator) {
    case 'chain-gt':
      return values.every((val, idx, arr) => {
        if (val === 0) return false;
        if (idx === arr.length - 1) return true;
        return val > arr[idx + 1];
      });
  }
  return false;
};

export const customArrIncludesSome = <T>(row: Row<T>, columnId: string, filterValues: string[]) => {
  return filterValues.includes(row.getValue(columnId));
};
customArrIncludesSome.autoRemove = (val: string[]) => !val?.length;

export const initialFilter = (stockList: Stock[], settings: Settings) => {
  return (
    stockList
      // .filter((e) => {
      //   return settings.includeOtc ? true : includeExchanges.includes(e.exchange);
      // })
      .filter((e) => {
        return settings.includeBiotechnology ? true : !excludeIndustry.includes(e.industry);
      })
      .map((e, i) => ({ ...e, key: i + 1 }))
  );
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
  },
  {
    value: 'mark',
    title: 'Mark Trend Template',
    description: 'Legendary screener',
    presetStates: [
      {
        id: 'rsRating',
        value: '70up'
      },
      {
        id: 'avgDollarVolume',
        value: '20up'
      },
      {
        id: 'close',
        value: ['markPriceTemplateMAs', 'above52WLow', 'near52WHigh']
      },
      {
        id: 'marketCap',
        value: 'large'
      }
    ]
  },
  {
    value: 'markLoose',
    title: 'Mark Loose Template',
    description: 'Loose screener',
    presetStates: [
      {
        id: 'rsRating',
        value: '70up'
      },
      {
        id: 'avgDollarVolume',
        value: '20up'
      },
      {
        id: 'close',
        value: ['markMAsLoose', 'above52WLow', 'near52WHigh']
      },
      {
        id: 'marketCap',
        value: 'large'
      }
    ]
  },
  {
    value: 'pocketPivot',
    title: 'Pocket Pivot',
    description: 'Pocket Pivot + EMA50',
    presetStates: [
      {
        id: 'pocketPivot',
        value: ['Yes']
      },
      {
        id: 'close',
        value: ['markPriceTemplateMAs']
      },
      {
        id: 'marketCap',
        value: 'middle'
      }
    ]
  },
  {
    value: 'rsNewHighBeforePrice',
    title: 'RS NH Before Price',
    description: 'Look for green dot',
    presetStates: [
      {
        id: 'rsNewHigh',
        value: ['Before Price']
      },
      {
        id: 'marketCap',
        value: 'middle'
      }
    ]
  },
  {
    value: 'tightRangePlus',
    title: 'Tight Range Plus',
    description: 'Tight + Inside Day',
    presetStates: [
      {
        id: 'tightRange',
        value: ['Yes']
      },
      {
        id: 'insideDay',
        value: ['Yes']
      },
      {
        id: 'avgDollarVolume',
        value: '10up'
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
    pocketPivot: e.pocketPivot === 0 ? 'No' : 'Yes',
    rsNewHigh: e.rsNewHigh === 0 ? 'No' : e.rsNewHigh === 1 ? 'New High' : 'Before Price',
    tightRange: e.tightRange === 0 ? 'No' : 'Yes',
    insideDay: e.insideDay === 0 ? 'No' : 'Yes',
    key: i + 1
  }));
};
