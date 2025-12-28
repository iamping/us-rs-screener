import { ColumnFiltersState, Row, Table } from '@tanstack/react-table';
import { ColumnVisibility, GeneralOption, Operator, SelectOption, Settings } from '@/types/shared.type';
import { Stock } from '@/types/stock.type';
import { commonDateFormat } from '@/utils/common.utils';

type TRecord<T> = Row<T & Record<string, number>>;

const oneYearMilliSeconds = 365.25 * 24 * 60 * 60 * 1000;

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
  ...[1000, 500, 400, 300, 200, 100, 80, 50, 20, 10].map((n) => {
    return {
      value: `${n}up`,
      title: `${n}M and above`,
      compareOption: {
        type: 'fixed',
        params: [
          {
            operator: '>=',
            compareNumber: n * 1000000
          }
        ]
      }
    } as SelectOption;
  }),
  {
    value: '10to50',
    title: '10M to 50M',
    compareOption: {
      type: 'bound-fixed',
      params: [
        {
          operator: 'bound-exclusive',
          lowerBound: 10 * 1000000,
          upperBound: 50 * 1000000
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
          operator: '<=',
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
    value: 'above50',
    title: '50 and above',
    description: 'Mid-priced+ up',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '>=',
          compareNumber: 50
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
    value: 'gtEMA89',
    title: 'Above EMA89',
    description: 'Price above EMA89',
    compareOption: {
      type: 'compare-field',
      params: [{ operator: '>=', compareField: 'ema89' }]
    }
  },
  {
    value: 'gtEMA150',
    title: 'Above EMA150',
    description: 'Price above EMA150',
    compareOption: {
      type: 'compare-field',
      params: [{ operator: '>=', compareField: 'ema150' }]
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
    value: '',
    title: '',
    isSeparator: true
  },
  {
    value: 'nearAllTimeHigh',
    title: 'Near All Time High',
    description: 'Not lower than 25%',
    compareOption: {
      type: 'compare-field-percent',
      params: [{ operator: '>', compareField: 'allTimeHigh', comparePercent: -25 }]
    }
  },
  {
    value: 'near52WHigh',
    title: 'Near 52W High',
    description: '0 to 25%',
    compareOption: {
      type: 'compare-field-percent',
      params: [{ operator: '>', compareField: 'wk52High', comparePercent: -25 }]
    }
  },
  {
    value: 'near52WHigh_V2',
    title: 'Near 52W High v.2',
    description: '10% to 40%',
    compareOption: {
      type: 'bound-fixed-callback',
      params: [
        {
          operator: 'bound-inclusive',
          lowerBoundFn: (val) => {
            const stock = val as Stock;
            return stock.wk52High * 0.6;
          },
          upperBoundFn: (val) => {
            const stock = val as Stock;
            return stock.wk52High * 0.9;
          }
        }
      ]
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
  // {
  //   value: 'near21/50EMA',
  //   title: 'Near 21/50 EMA',
  //   description: '-5% to 5%',
  //   compareOption: {
  //     type: 'bound-percent',
  //     params: [
  //       {
  //         operator: 'bound-exclusive',
  //         compareField: 'ema21',
  //         comparePercent: 5
  //       },
  //       {
  //         operator: 'bound-exclusive',
  //         compareField: 'ema50',
  //         comparePercent: 5
  //       }
  //     ]
  //   }
  // },
  {
    value: '',
    title: '',
    isSeparator: true
  },
  {
    value: 'near10/21/50EMA_atr',
    title: 'Near 10/21/50 EMA',
    description: '-1ATR to 1ATR',
    compareOption: {
      type: 'bound-fixed-callback',
      params: [
        {
          operator: 'bound-inclusive',
          lowerBoundFn: (val) => {
            const stock = val as Stock;
            return stock.ema10 - stock.atr;
          },
          upperBoundFn: (val) => {
            const stock = val as Stock;
            return stock.ema10 + stock.atr;
          }
        },
        {
          operator: 'bound-inclusive',
          lowerBoundFn: (val) => {
            const stock = val as Stock;
            return stock.ema21 - stock.atr;
          },
          upperBoundFn: (val) => {
            const stock = val as Stock;
            return stock.ema21 + stock.atr;
          }
        },
        {
          operator: 'bound-inclusive',
          lowerBoundFn: (val) => {
            const stock = val as Stock;
            return stock.ema50 - stock.atr;
          },
          upperBoundFn: (val) => {
            const stock = val as Stock;
            return stock.ema50 + stock.atr;
          }
        }
      ]
    }
  },
  {
    value: 'near21/50EMA_atr',
    title: 'Near 21/50 EMA',
    description: '-1ATR to 1ATR',
    compareOption: {
      type: 'bound-fixed-callback',
      params: [
        {
          operator: 'bound-inclusive',
          lowerBoundFn: (val) => {
            const stock = val as Stock;
            return stock.ema21 - stock.atr;
          },
          upperBoundFn: (val) => {
            const stock = val as Stock;
            return stock.ema21 + stock.atr;
          }
        },
        {
          operator: 'bound-inclusive',
          lowerBoundFn: (val) => {
            const stock = val as Stock;
            return stock.ema50 - stock.atr;
          },
          upperBoundFn: (val) => {
            const stock = val as Stock;
            return stock.ema50 + stock.atr;
          }
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
  },
  {
    value: '',
    title: '',
    isSeparator: true
  },
  {
    value: '3to9',
    title: '3.0 to 9.0',
    compareOption: {
      type: 'bound-fixed',
      params: [
        {
          operator: 'bound-inclusive',
          lowerBound: 3,
          upperBound: 9
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

// Note: each value = bitwise OR of previous one
// e.g., 8D = 1<<0|1<<1, 10D = 1<<0|1<<1|1<<2
export const think40Options: GeneralOption[] = [
  { value: 'No', altValue: 0, description: 'No', shortDescription: '-' },
  { value: '5D', altValue: 1, description: '5 Days High', shortDescription: '5D' },
  { value: '8D', altValue: 3, description: '8 Days High', shortDescription: '8D' },
  { value: '10D', altValue: 7, description: '10 Days High', shortDescription: '10D' },
  { value: '20D', altValue: 15, description: '20 Days High', shortDescription: '20D' },
  { value: '40D', altValue: 31, description: '40 Days High', shortDescription: '40D' }
];

export const ipoDateOptions: SelectOption[] = [
  {
    value: 'under5',
    title: 'Under 5 Years',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '>=',
          compareNumber: Date.now() - 5 * oneYearMilliSeconds
        }
      ]
    }
  },
  {
    value: 'under10',
    title: 'Under 10 Years',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '>=',
          compareNumber: Date.now() - 10 * oneYearMilliSeconds
        }
      ]
    }
  },
  {
    value: 'under15',
    title: 'Under 15 Years',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '>=',
          compareNumber: Date.now() - 15 * oneYearMilliSeconds
        }
      ]
    }
  },
  {
    value: 'gt15',
    title: 'More than 15 Years',
    compareOption: {
      type: 'fixed',
      params: [
        {
          operator: '<',
          compareNumber: Date.now() - 15 * oneYearMilliSeconds
        }
      ]
    }
  }
];

export const wk52Options: SelectOption[] = [
  {
    value: 'double',
    title: 'More than double',
    compareOption: {
      type: 'compare-field-percent',
      params: [{ operator: '>=', compareField: 'wk52Low', comparePercent: 100 }]
    }
  },
  {
    value: 'triple',
    title: 'More than triple',
    compareOption: {
      type: 'compare-field-percent',
      params: [{ operator: '>=', compareField: 'wk52Low', comparePercent: 200 }]
    }
  }
];

export const amountFilterFn =
  (optionList: SelectOption[], specificColumnId?: string) =>
  <T>(row: Row<T>, columnId: string, filterValue: string) => {
    const option = optionList.find((e) => e.value === filterValue)!;
    if (!option) return false;
    const compareOption = option.compareOption!;
    const compareType = compareOption.type;
    const record = row as TRecord<T>;
    // note: columnId = column accessor
    const cellValue = specificColumnId ? record.original[specificColumnId] : row.getValue(columnId);
    switch (compareType) {
      case 'fixed':
        return compareOption.params.every((param) => {
          return compareFn(param.operator, Number(cellValue), param.compareNumber);
        });
      case 'compare-field':
        return compareOption.params.every((param) => {
          return compareFn(param.operator, Number(cellValue), record.original[param.compareField]);
        });
      case 'compare-field-percent':
        return compareOption.params.every((param) => {
          const compareNumber = (1 + param.comparePercent / 100) * record.original[param.compareField];
          return compareFn(param.operator, Number(cellValue), compareNumber);
        });
      case 'bound-fixed':
        return compareOption.params.some((param) => {
          return boundFn(param.operator, Number(cellValue), param.lowerBound, param.upperBound);
        });
      case 'bound-fixed-callback':
        return compareOption.params.some((param) => {
          const lowerBound = param.lowerBoundFn(row.original);
          const upperBound = param.upperBoundFn(row.original);
          return boundFn(param.operator, Number(cellValue), lowerBound, upperBound);
        });
      case 'bound-percent':
        return compareOption.params.some((param) => {
          const upperBound = (1 + param.comparePercent / 100) * record.original[param.compareField];
          const lowerBound = (1 - param.comparePercent / 100) * record.original[param.compareField];
          return boundFn(param.operator, Number(cellValue), lowerBound, upperBound);
        });
      case 'chain': {
        return compareOption.params.every((param) => {
          const compareValues = param.compareFields.map((field) => record.original[field]);
          const values = [Number(cellValue), ...compareValues];
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

export const customArrIncludesSome = () => {
  const fn = <T>(row: Row<T>, columnId: string, filterValues: string[]) => {
    return filterValues.includes(row.getValue(columnId));
  };
  fn.autoRemove = (val: string[]) => !val?.length;
  return fn;
};

export const bitwiseIncludesSome = (optionList: GeneralOption[]) => {
  const fn = <T>(row: Row<T>, columnId: string, filterValues: string[]) => {
    const value = Number(row.getValue(columnId));
    return filterValues.some((key) => {
      const optionValue = Number(optionList.find((e) => e.value === key)?.altValue ?? -1);
      return value === 0 ? value === optionValue : value === optionValue || value <= optionValue;
    });
  };
  fn.autoRemove = (val: number[]) => !val?.length;
  return fn;
};

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
    value: 'liquidLeader',
    title: 'Liquid Leader',
    description: 'Instutional Liquidity',
    presetStates: [
      {
        id: 'close',
        value: ['above52WLow', 'near52WHigh']
      },
      {
        id: 'avgDollarVolume',
        value: '300up'
      },
      {
        id: 'adrPercent',
        value: '3up'
      },
      {
        id: 'rsRating',
        value: '70up'
      }
    ]
  },
  {
    value: 'newLeaders',
    title: 'New Leaders',
    description: 'Potential New Leaders',
    presetStates: [
      {
        id: 'close',
        value: ['gtEMA89', 'gtEMA150/200', 'nearAllTimeHigh']
      },
      {
        id: 'adrPercent',
        value: '2up'
      },
      {
        id: 'avgDollarVolume',
        value: '80up'
      },
      {
        id: '52wkRange',
        value: 'double'
      },
      {
        id: 'ipoDate',
        value: 'under15'
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
    description: 'Mark Screener',
    presetStates: [
      {
        id: 'rsRating',
        value: '70up'
      },
      {
        id: 'close',
        value: ['markPriceTemplateMAs', 'above52WLow', 'near52WHigh', 'above20']
      },
      {
        id: 'adrPercent',
        value: '2up'
      },
      {
        id: 'avgDollarVolume',
        value: '20up'
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
    title: 'Uptrend + 21/50',
    description: 'Near EMA21/50',
    presetStates: [
      {
        id: 'rsRating',
        value: '70up'
      },
      {
        id: 'close',
        value: ['gtEMA150/200', 'above52WLow', 'near52WHigh', 'near21/50EMA_atr']
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
        value: '50up'
      },
      {
        id: 'close',
        value: ['gtEMA89']
      },
      {
        id: 'adrPercent',
        value: '3up'
      },
      {
        id: 'think40',
        value: ['40D']
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
        value: ['gtEMA89']
      },
      {
        id: 'avgDollarVolume',
        value: '50up'
      },
      {
        id: 'episodicPivot',
        value: ['Yes']
      }
    ]
  },
  {
    value: 'myUniverse',
    title: 'My Universe',
    description: 'Liquidity + EMA89',
    presetStates: [
      {
        id: 'close',
        value: ['gtEMA89', 'above52WLow', 'near52WHigh', 'above50']
      },
      {
        id: 'adrPercent',
        value: '3to9'
      },
      {
        id: 'avgDollarVolume',
        value: '80up'
      },
      {
        id: 'marketCap',
        value: 'middle'
      }
    ]
  },
  {
    value: 'myDailyScan',
    title: 'My Daily Scan',
    description: 'Liquidity + Pullback',
    presetStates: [
      {
        id: 'close',
        value: ['gtEMA89', 'gtEMA150/200', 'above52WLow', 'near10/21/50EMA_atr', 'above50']
      },
      {
        id: 'adrPercent',
        value: '3to9'
      },
      {
        id: 'avgDollarVolume',
        value: '80up'
      },
      {
        id: 'think40',
        value: ['20D']
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
      sectorRank: false,
      rmv: false,
      rsRating3M: false,
      rsRating6M: false,
      rsRating1Y: false,
      asRating3M: false,
      asRating6M: false,
      asRating1Y: false,
      industryRank: false,
      rsNewHigh: false,
      tightRange: false,
      ipoDate: false
    }
  }
];

export const tableGlobal: { table: Table<Stock> | null } = {
  table: null
};

// Display description functions
export const think40DescriptionFn = (value: string | number) => {
  const temp: string[] = [];
  if (typeof value === 'number') {
    think40Options.forEach((e) => {
      if (Number(e.altValue) === value || Number(e.altValue) <= value) {
        temp.push(e.shortDescription ?? '');
      }
    });
    return temp.slice(-1).join(', ');
  }
  return '';
};

export const ipoDateDescriptionFn = (value: string | number) => {
  if (typeof value === 'string') return 'N/A';
  if (value <= 0) return 'N/A';
  return commonDateFormat(new Date(value));
};
