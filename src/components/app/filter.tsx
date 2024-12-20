import { Box, Button, Code, HStack, IconButton, Separator, Spacer, Text, VStack } from '@chakra-ui/react';
import { ChangeEvent, FC, useCallback, useEffect, useState } from 'react';
import { PopoverBody, PopoverContent, PopoverRoot, PopoverTrigger } from '../ui/popover';
import { Slider } from '../ui/slider';
import { Column, ColumnFiltersState } from '@tanstack/react-table';
import { PiFunnelBold } from 'react-icons/pi';
import { If } from '../ui/if';
import { useDebounceCallback } from 'usehooks-ts';
import { ColumnVisibility } from '../../utils/table.util';

export type FilterVariant = 'range' | 'select' | 'radio-select' | undefined;
interface FilterProps<T> {
  id?: string;
  popupWidth: number | string;
  filterVariant: FilterVariant;
  column: Column<T, unknown>;
  globalReset: number;
  resetPageIndex?: () => void;
}

interface RangeFilterProps {
  id?: string;
  resetCount: number;
  initialValue: number[] | undefined;
  min: number;
  max: number;
  onChange: (val: number[]) => void;
}

interface SelectFilterProps {
  id?: string;
  resetCount: number;
  initialValue: string[] | undefined;
  valueList: string[];
  onChange: (val: string[]) => void;
}

interface RadioSelectFilterProps {
  id?: string;
  initialValue: string;
  optionList: SelectOption[];
  onChange: (val: string) => void;
}

export interface SelectOption {
  value: string;
  title: string;
  description?: string;
  operator?: '>=' | '<' | '<>' | '!==' | '<=' | '=';
  compareNumber1?: number;
  compareNumber2?: number;
  presetStates?: ColumnFiltersState;
  columnVisibility?: ColumnVisibility;
}

export const FilterEmpty = () => {
  return (
    <IconButton size="2xs" color="gray.300" variant="ghost" onClick={(e) => e.stopPropagation()}>
      <PiFunnelBold />
    </IconButton>
  );
};

export const Filter = <T,>({ id, popupWidth, filterVariant, column, globalReset, resetPageIndex }: FilterProps<T>) => {
  // console.log(`render filter [${id}]`);
  const [open, setOpen] = useState(false);
  const [resetCount, setResetCount] = useState(0);

  // variant range - handle filter current value
  const [min, max] = column.getFacetedMinMaxValues() ?? [0, 100];
  const rangeCurrentValue = (column.getFilterValue() ?? [min, max]) as number[];

  // variant select
  const valueList = filterVariant === 'select' ? [...column.getFacetedUniqueValues().keys()].sort() : [];
  const selectCurrentValue = (column.getFilterValue() ?? []) as string[];

  // radio select
  const optionList = filterVariant === 'radio-select' ? (column.columnDef.meta?.selectOptions ?? []) : [];
  const radioCurrentValue = (column.getFilterValue() ?? '') as string;

  // const temp = (column.getFilterValue() ?? '') as string;
  // const radioCurrentValue = useMemo(() => {
  //   return temp;
  // }, [temp]);

  const onChange = useCallback(
    (values: number[] | string[] | string) => {
      column.setFilterValue(values);
      resetPageIndex?.();
      if (filterVariant === 'radio-select') {
        setOpen(false);
      }
    },
    [column, filterVariant, resetPageIndex]
  );

  // const onChange = (values: number[] | string[] | string) => {
  //   column.setFilterValue(values);
  //   if (filterVariant === 'radio-select') {
  //     setOpen(false);
  //   }
  // };

  const onReset = () => {
    setResetCount((val) => val + 1);
    column.setFilterValue(undefined);
    resetPageIndex?.();
  };

  useEffect(() => {
    setResetCount((val) => val + 1);
  }, [globalReset]);

  if (!filterVariant) {
    return null;
  }

  return (
    <PopoverRoot open={open} onOpenChange={(e) => setOpen(e.open)} positioning={{ placement: 'bottom-end' }}>
      <PopoverTrigger asChild>
        <IconButton
          className="filter-icon"
          title={`Filter ${id}`}
          size="2xs"
          color={column.getIsFiltered() ? 'black' : 'gray.300'}
          variant="plain"
          onClick={(e) => e.stopPropagation()}>
          <PiFunnelBold />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent minWidth={200} width={popupWidth} onClick={(e) => e.stopPropagation()}>
        <PopoverBody padding={3}>
          <VStack>
            <If exp={!!column.columnDef.meta?.filterNote}>
              <Text textAlign="left" width="100%">
                {column.columnDef.meta?.filterNote}
              </Text>
            </If>
            <If exp={filterVariant === 'range'}>
              <RangeFilter
                id={id}
                initialValue={rangeCurrentValue}
                min={min!}
                max={max!}
                resetCount={resetCount}
                onChange={onChange}
              />
            </If>
            <If exp={filterVariant === 'select'}>
              <SelectFilter
                id={id}
                initialValue={selectCurrentValue}
                valueList={valueList}
                resetCount={resetCount}
                onChange={onChange}
              />
            </If>
            <If exp={filterVariant === 'radio-select'}>
              <RadioSelectFilter id={id} initialValue={radioCurrentValue} optionList={optionList} onChange={onChange} />
            </If>
            <Separator margin={1} />
            <HStack justifyContent="space-between" width="100%">
              <Button size="2xs" variant="ghost" onClick={onReset}>
                Reset
              </Button>
              <Button size="2xs" variant="subtle" onClick={() => setOpen(false)}>
                Close
              </Button>
            </HStack>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};

export const RangeFilter: FC<RangeFilterProps> = ({ initialValue: initialValue, resetCount, min, max, onChange }) => {
  const [value, setValue] = useState(initialValue);
  const debouncedChange = useDebounceCallback(onChange, 500);
  const onValueChange = (values: number[]) => {
    debouncedChange(values);
    setValue(values);
  };

  useEffect(() => {
    setValue([min, max]);
  }, [resetCount, min, max]);

  return (
    <>
      <Slider
        size="md"
        width="90%"
        value={value}
        min={min}
        max={max}
        onValueChange={(details) => onValueChange(details.value)}
      />
      <HStack width="100%">
        <Code>from: {value?.[0]}</Code>
        <Spacer />
        <Code>to: {value?.[1]}</Code>
      </HStack>
    </>
  );
};

// Chakra UI is too slow for this, just use HTML
export const SelectFilter: FC<SelectFilterProps> = ({ id, valueList, initialValue, resetCount, onChange }) => {
  // console.log('SelectFilter');
  const selectAll = 'Select All';
  const [values, setValues] = useState(initialValue ?? []);
  const selectList = [selectAll, ...valueList];

  const onSelect = (event: ChangeEvent<HTMLInputElement>, value: string) => {
    let currentValues = [];
    if (event.target.checked) {
      currentValues = value === selectAll ? [...valueList, value] : [...values, value];
    } else {
      currentValues = value === selectAll ? [] : values.filter((e) => e !== value);
    }
    setValues(currentValues);
    onChange(currentValues);
  };

  useEffect(() => {
    setValues([]);
  }, [resetCount]);

  return (
    <>
      <div style={{ height: '200px', overflowY: 'auto', width: '100%', paddingRight: '8px' }}>
        {selectList.map((value, idx) => {
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '8px',
                position: 'relative',
                padding: '4px',
                borderBottom: idx === 0 ? '1px solid #ddd' : '',
                alignItems: 'center'
              }}>
              <input
                id={`${id}-${value}`}
                type="checkbox"
                name={value}
                checked={values.includes(value)}
                onChange={(event) => onSelect(event, value)}
              />
              <label
                title={value}
                htmlFor={`${id}-${value}`}
                style={{
                  width: '85%',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  fontWeight: idx === 0 ? 500 : ''
                }}>
                {value}
              </label>
            </div>
          );
        })}
      </div>
    </>
  );
};

export const RadioSelectFilter: FC<RadioSelectFilterProps> = ({ id, initialValue, optionList, onChange }) => {
  // console.log('radio select => ', id, initialValue);
  const [value, setValue] = useState('');
  const onSelect = (value: string) => {
    setValue(value);
    onChange(value);
  };
  const debouncedOnSelect = useDebounceCallback(onSelect, 0);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <VStack width="100%" gap={2}>
      {optionList.map((e, idx) => {
        return (
          <VStack
            as="label"
            className="radio-wrapper"
            key={idx}
            width="100%"
            alignItems="start"
            gap={0}
            padding="4px 4px 4px 8px"
            borderRadius={5}
            onClick={() => debouncedOnSelect(e.value)}>
            <HStack justifyContent="space-between" width="100%">
              <Text fontWeight={500}>{e.title}</Text>
              <Box paddingTop={1} paddingRight={1}>
                <input
                  style={{ opacity: 0 }}
                  className="radio"
                  type="radio"
                  value={e.value}
                  name={`${id}`}
                  id={`${id}-${e.value}-${idx}`}
                  checked={value === e.value}
                  onChange={() => debouncedOnSelect(e.value)}
                />
              </Box>
            </HStack>
            <If exp={!!e.description}>
              <Text fontSize="sm" color="gray">
                {e.description}
              </Text>
            </If>
          </VStack>
        );
      })}
    </VStack>
  );
};
