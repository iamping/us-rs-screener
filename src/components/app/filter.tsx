import { Box, Button, Code, HStack, IconButton, Separator, Spacer, Text, VStack } from '@chakra-ui/react';
import { ChangeEvent, FC, useEffect, useState } from 'react';
import { PopoverBody, PopoverContent, PopoverRoot, PopoverTrigger } from '../ui/popover';
import { Slider } from '../ui/slider';
import { Column } from '@tanstack/react-table';
import { PiFunnelBold } from 'react-icons/pi';
import { If } from '../ui/if';

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
  resetCount: number;
  initialValue: string;
  optionList: SelectOption[];
  onChange: (val: string) => void;
}

export interface SelectOption {
  value: string;
  title: string;
  description?: string;
  operator?: '>=' | '<' | '<>' | '!==' | '<=';
  compareNumber1?: number;
  compareNumber2?: number;
}

export const FilterEmpty = () => {
  return (
    <IconButton size="2xs" color="gray" variant="ghost" onClick={(e) => e.stopPropagation()}>
      <PiFunnelBold />
    </IconButton>
  );
};

export const Filter = <T,>({ id, popupWidth, filterVariant, column, globalReset, resetPageIndex }: FilterProps<T>) => {
  // console.log(`render filter [${id}]`);
  const [isReset, setIsReset] = useState(false);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<number[] | string[] | string>([]);
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

  const onChange = (values: number[] | string[] | string) => {
    setIsReset(false);
    setValues(values);
    // console.log(`[${id}] onChange => `, values);
  };

  const onApply = () => {
    // console.log(`[${id}] onApply => `, values);
    setOpen(false);
    column.setFilterValue(values);
    if (isReset) {
      column.setFilterValue(undefined);
    }
    resetPageIndex?.();
  };

  const onReset = () => {
    setIsReset(true);
    setResetCount((val) => val + 1);
    switch (filterVariant) {
      case 'range':
        setValues([min, max]);
        break;
      case 'radio-select':
        setValues('');
        break;
      default:
        setValues([]);
        break;
    }
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
          color={column.getIsFiltered() ? 'teal.500' : 'gray'}
          variant="ghost"
          onClick={(e) => e.stopPropagation()}>
          <PiFunnelBold />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent minWidth={200} width={popupWidth} onClick={(e) => e.stopPropagation()}>
        <PopoverBody padding={4}>
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
              <RadioSelectFilter
                id={id}
                initialValue={radioCurrentValue}
                optionList={optionList}
                onChange={onChange}
                resetCount={resetCount}
              />
            </If>
            <Separator margin={1} />
            <HStack justifyContent="space-between" width="100%">
              <Button size="xs" variant="ghost" onClick={onReset}>
                Reset
              </Button>
              <Button size="xs" onClick={onApply}>
                Apply
              </Button>
            </HStack>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};

const RangeFilter: FC<RangeFilterProps> = ({ initialValue: initialValue, resetCount, min, max, onChange }) => {
  const [value, setValue] = useState(initialValue);
  const onValueChange = (values: number[]) => {
    onChange(values);
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
const SelectFilter: FC<SelectFilterProps> = ({ id, valueList, initialValue, resetCount, onChange }) => {
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
                padding: '4px 0px',
                borderBottom: idx === 0 ? '1px solid #ddd' : ''
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

const RadioSelectFilter: FC<RadioSelectFilterProps> = ({ id, initialValue, optionList, resetCount, onChange }) => {
  // console.log('radio select => ', id);
  const [value, setValue] = useState(initialValue);
  const onSelect = (value: string) => {
    setValue(value);
    onChange(value);
  };

  useEffect(() => {
    setValue('');
  }, [resetCount]);

  return (
    <VStack width="100%" gap={1}>
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
            borderRadius={5}>
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
                  onChange={() => onSelect(e.value)}
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
