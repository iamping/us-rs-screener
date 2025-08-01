import { ColumnFiltersState, Row, Table } from '@tanstack/react-table';
import { ColumnVisibility, Operator, SelectOption, Settings } from '@/types/shared.type';
import { Stock } from '@/types/stock.type';

type TRecord<T> = Row<T & Record<string, number>>;

export const defaultPagination = {
  pageIndex: 0, //initial page index
  pageSize: 20 //default page size
};

export const defaultFilterState: ColumnFiltersState = [];

export const defaultColumnVisibility: ColumnVisibility = {};

export const defaultSettings: Settings = {
  includeOtc: false,
  includeBiotechnology: true
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
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '>=',
          compareNumber: 200000000000
        }
      ]
    }
  },
  {
    value: 'large',
    title: '5B and above',
    description: 'Large caps+',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '>=',
          compareNumber: 5000000000
        }
      ]
    }
  },
  {
    value: 'middle',
    title: '2B and above',
    description: 'Middlers+',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '>=',
          compareNumber: 2000000000
        }
      ]
    }
  },
  {
    value: 'small',
    title: 'Under 2B',
    description: 'Small caps',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '<',
          compareNumber: 2000000000
        }
      ]
    }
  }
];

export const avgDollarVolOptions: SelectOption[] = [
  {
    value: '20up',
    title: '20M and above',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '>=',
          compareNumber: 20000000
        }
      ]
    }
  },
  {
    value: '10up',
    title: '10M and above',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '>=',
          compareNumber: 10000000
        }
      ]
    }
  },
  {
    value: 'under10',
    title: 'Under 10M',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '<',
          compareNumber: 10000000
        }
      ]
    }
  }
];

export const rsRatingOptions: SelectOption[] = [
  {
    value: '90up',
    title: '90 and above',
    description: 'Pack your spacesuit',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '>=',
          compareNumber: 90
        }
      ]
    }
  },
  {
    value: '80up',
    title: '80 and above',
    description: 'Heading somewhere',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '>=',
          compareNumber: 80
        }
      ]
    }
  },
  {
    value: '70up',
    title: '70 and above',
    description: "It's something",
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '>=',
          compareNumber: 70
        }
      ]
    }
  },
  {
    value: 'under70',
    title: 'Under 70',
    description: 'No expectation',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '<',
          compareNumber: 70
        }
      ]
    }
  }
];

export const percentChangeOptions: SelectOption[] = [
  {
    value: '30up',
    title: '30% and above',
    description: 'To the moon',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '>=',
          compareNumber: 30
        }
      ]
    }
  },
  {
    value: '20up',
    title: '20% and above',
    description: 'A fistful of dollars',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '>=',
          compareNumber: 20
        }
      ]
    }
  },
  {
    value: '10up',
    title: '10% and above',
    description: 'Heading somewhere',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '>=',
          compareNumber: 10
        }
      ]
    }
  },
  {
    value: '0to10',
    title: '0% to 10%',
    description: 'Modest momentum',
    compareOption: {
      type: 'bound-fixed',
      params: [
        {
          operator: 'bound-inclusive',
          lowerBound: 0,
          upperBound: 10
        }
      ]
    }
  },
  {
    value: '0up',
    title: '0% and above',
    description: 'In the green',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '>=',
          compareNumber: 0
        }
      ]
    }
  },
  {
    value: 'under0',
    title: 'Under 0%',
    description: 'In the red',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '<',
          compareNumber: 0
        }
      ]
    }
  }
];

export const relativeVolOptions: SelectOption[] = [
  {
    value: '2up',
    title: '2.0 and above',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '>=',
          compareNumber: 2
        }
      ]
    }
  },
  {
    value: '1up',
    title: '1.0 and above',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '>=',
          compareNumber: 1
        }
      ]
    }
  },
  {
    value: 'under1',
    title: 'Under 1.0',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '<',
          compareNumber: 1
        }
      ]
    }
  }
];

export const priceOptions: SelectOption[] = [
  {
    value: 'above100',
    title: '100 and above',
    description: 'Fractional shares time',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '>=',
          compareNumber: 100
        }
      ]
    }
  },
  {
    value: 'above20',
    title: '20 and above',
    description: 'Mid-priced up',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '>=',
          compareNumber: 20
        }
      ]
    }
  },
  {
    value: '0to20',
    title: '0 to 20',
    description: 'Penny to mid-priced',
    compareOption: {
      type: 'bound-fixed',
      params: [
        {
          operator: 'bound-inclusive',
          lowerBound: 0,
          upperBound: 10
        }
      ]
    }
  },
  {
    value: '',
    title: '',
    isSeparator: true
  },
  {
    value: 'gtEMA21',
    title: 'Above EMA21',
    description: 'Price above EMA21',
    compareOption: {
      type: 'compare-field',
      params: [{ operator: '>=', compareField: 'ema21' }]
    }
  },
  {
    value: 'gtEMA50',
    title: 'Above EMA50',
    description: 'Price above EMA50',
    compareOption: {
      type: 'compare-field',
      params: [{ operator: '>=', compareField: 'ema50' }]
    }
  },
  {
    value: 'gtEMA200',
    title: 'Above EMA200',
    description: 'Price above EMA200',
    compareOption: {
      type: 'compare-field',
      params: [{ operator: '>=', compareField: 'ema200' }]
    }
  },
  {
    value: 'gtEMA150/200',
    title: 'Above EMA150/200',
    description: 'Long-term uptrend',
    compareOption: {
      type: 'chain',
      params: [{ operator: 'chain-gt-exclusive', compareFields: ['ema150', 'ema200', 'ema2001M'] }]
    }
  },
  {
    value: 'markPriceTemplateMAs',
    title: 'Mark MAs',
    description: 'Above Key EMAs',
    compareOption: {
      type: 'chain',
      params: [{ operator: 'chain-gt-exclusive', compareFields: ['ema50', 'ema150', 'ema200', 'ema2001M'] }]
    }
  },
  {
    value: 'above52WLow',
    title: 'Above 52W Low',
    description: 'More than 30%',
    compareOption: {
      type: 'compare-field-percent',
      params: [{ operator: '>', compareField: 'wk52Low', comparePercent: 30 }]
    }
  },
  {
    value: 'near52WHigh',
    title: 'Near 52W High',
    description: 'Not lower than 25%',
    compareOption: {
      type: 'compare-field-percent',
      params: [{ operator: '>', compareField: 'wk52High', comparePercent: -25 }]
    }
  },
  {
    value: 'near21/50EMA',
    title: 'Near 21/50 EMA',
    description: '-5% to 5%',
    compareOption: {
      type: 'bound-percent',
      params: [
        {
          operator: 'bound-exclusive',
          compareField: 'ema21',
          comparePercent: 5
        },
        {
          operator: 'bound-exclusive',
          compareField: 'ema50',
          comparePercent: 5
        }
      ]
    }
  }
];

export const adrPercentOptions: SelectOption[] = [
  ...[5, 4, 3, 2, 1].map((val) => {
    return {
      value: `${val}up`,
      title: `${val}.0 and above`,
      compareOption: {
        type: 'fixed',
        params: [
          {
            operator: '>=',
            compareNumber: val
          }
        ]
      }
    } as SelectOption;
  }),
  {
    value: 'under1',
    title: 'Under 1.0',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '<',
          compareNumber: 1
        }
      ]
    }
  }
];

export const rmvOptions: SelectOption[] = [
  ...[20, 15, 10, 5].map((val) => {
    return {
      value: `under${val}`,
      title: `Under ${val}.0`,
      compareOption: {
        type: 'fixed',
        params: [
          {
            operator: '<',
            compareNumber: val
          }
        ]
      }
    } as SelectOption;
  })
];

export const amountFilterFn =
  (optionList: SelectOption[]) =>
  <T>(row: Row<T>, columnId: string, filterValue: string) => {
    const option = optionList.find((e) => e.value === filterValue)!;
    if (!option) return false;
    const compareOption = option.compareOption!;
    const compareType = compareOption.type;
    const record = row as TRecord<T>;
    switch (compareType) {
      case 'fixed':
        return compareOption.params.every((param) => {
          return compareFn(param.operator, Number(row.getValue(columnId)), param.compareNumber);
        });
      case 'compare-field':
        return compareOption.params.every((param) => {
          return compareFn(param.operator, Number(row.getValue(columnId)), record.original[param.compareField]);
        });
      case 'compare-field-percent':
        return compareOption.params.every((param) => {
          const compareNumber = (1 + param.comparePercent / 100) * record.original[param.compareField];
          return compareFn(param.operator, Number(row.getValue(columnId)), compareNumber);
        });
      case 'bound-fixed':
        return compareOption.params.every((param) => {
          return boundFn(param.operator, Number(row.getValue(columnId)), param.lowerBound, param.upperBound);
        });
      case 'bound-percent':
        return compareOption.params.every((param) => {
          const upperBound = (1 + param.comparePercent / 100) * record.original[param.compareField];
          const lowerBound = (1 - param.comparePercent / 100) * record.original[param.compareField];
          return boundFn(param.operator, Number(row.getValue(columnId)), lowerBound, upperBound);
        });
      case 'chain': {
        return compareOption.params.every((param) => {
          const compareValues = param.compareFields.map((field) => record.original[field]);
          const values = [Number(row.getValue(columnId)), ...compareValues];
          return compareChainFn(param.operator, values);
        });
      }
      default:
        return false;
    }
  };

export const multiSelectFilterFn = (optionList: SelectOption[]) => {
  const fn = <T>(row: Row<T>, columnId: string, filterValues: string[]) => {
    return filterValues.every((filterValue) => {
      return amountFilterFn(optionList)(row, columnId, filterValue);
    });
  };
  fn.autoRemove = (val: string[]) => !val?.length;
  return fn;
};

const compareFn = (operator: Operator, source: number, compareNumber: number) => {
  switch (operator) {
    case '>=':
      return source >= compareNumber;
    case '<=':
      return source <= compareNumber;
    case '<':
      return source < compareNumber;
    case '>':
      return source > compareNumber;
    case '=':
      return source === compareNumber;
    case '<>':
      return source !== compareNumber;
  }
  return false;
};

const boundFn = (operator: Operator, source: number, lowerBound: number, upperBound: number) => {
  switch (operator) {
    case 'bound-inclusive':
      return source >= lowerBound && source <= upperBound;
    case 'bound-exclusive':
      return source > lowerBound && source < upperBound;
  }
  return false;
};

const compareChainFn = (operator: Operator, values: number[]) => {
  switch (operator) {
    case 'chain-gt-exclusive':
      return values.every((val, idx, arr) => {
        if (val === 0) return false;
        if (idx === arr.length - 1) return true;
        return val > arr[idx + 1];
      });
    case 'chain-gt-inclusive':
      return values.every((val, idx, arr) => {
        if (val === 0) return false;
        if (idx === arr.length - 1) return true;
        return val >= arr[idx + 1];
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
    value: 'gainingAttraction',
    title: 'Gaining Attraction',
    description: 'Absolute Strength',
    presetStates: [
      {
        id: 'asRating1M',
        value: '80up'
      },
      {
        id: 'avgDollarVolume',
        value: '20up'
      },
      {
        id: 'close',
        value: ['gtEMA150/200']
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
        id: 'close',
        value: ['markPriceTemplateMAs', 'above52WLow', 'near52WHigh', 'above20']
      }
    ]
  },
  {
    value: 'uptrend',
    title: 'Uptrend',
    description: 'Probably uptrend',
    presetStates: [
      {
        id: 'rsRating',
        value: '70up'
      },
      {
        id: 'close',
        value: ['gtEMA150/200', 'above52WLow', 'near52WHigh']
      }
    ]
  },
  {
    value: 'uptrend+',
    title: 'Uptrend + Near 21/50',
    description: 'Near EMA21/50',
    presetStates: [
      {
        id: 'rsRating',
        value: '70up'
      },
      {
        id: 'close',
        value: ['gtEMA150/200', 'above52WLow', 'near52WHigh', 'near21/50EMA']
      }
    ]
  },
  {
    value: 'think40+',
    title: 'Think 40+',
    description: '40 Days New High',
    presetStates: [
      {
        id: 'avgDollarVolume',
        value: '20up'
      },
      {
        id: 'close',
        value: ['gtEMA150/200']
      },
      {
        id: 'marketCap',
        value: 'middle'
      },
      {
        id: 'think40',
        value: ['Yes']
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
    value: 'superFocus',
    title: 'Super Focus',
    description: 'Tight + Liquidity',
    presetStates: [
      {
        id: 'close',
        value: ['gtEMA150/200', 'near52WHigh']
      },
      {
        id: 'marketCap',
        value: 'large'
      },
      {
        id: 'avgDollarVolume',
        value: '20up'
      },
      {
        id: 'adrPercent',
        value: '3up'
      },
      {
        id: 'rmv',
        value: 'under20'
      }
    ]
  },
  {
    value: 'episodicPivot',
    title: 'Episodic Pivot',
    description: 'Price + Volume Surge',
    presetStates: [
      {
        id: 'close',
        value: ['gtEMA150/200']
      },
      {
        id: 'avgDollarVolume',
        value: '10up'
      },
      {
        id: 'episodicPivot',
        value: ['Yes']
      },
      {
        id: 'marketCap',
        value: 'middle'
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
    think40: e.think40 === 0 ? 'No' : 'Yes',
    episodicPivot: e.episodicPivot === 0 ? 'No' : 'Yes',
    key: i + 1
  }));
};

export const tableGlobal: { table: Table<Stock> | null } = {
  table: null
};
