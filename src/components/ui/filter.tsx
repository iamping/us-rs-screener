import { Button, Code, HStack, IconButton, Separator, Spacer, Text, VStack } from '@chakra-ui/react';
import { ChangeEvent, FC, useEffect, useState } from 'react';
import { PopoverBody, PopoverContent, PopoverRoot, PopoverTrigger } from './popover';
import { Slider } from './slider';
import { Column } from '@tanstack/react-table';
import { PiFunnelBold } from 'react-icons/pi';
import { If } from './if';

export type FilterVariant = 'range' | 'select' | undefined;
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
  const [values, setValues] = useState<number[] | string[]>([]);
  const [resetCount, setResetCount] = useState(0);

  // variant range - handle filter current value
  const [min, max] = column.getFacetedMinMaxValues() ?? [0, 100];
  const rangeCurrentValue = (column.getFilterValue() ?? [min, max]) as number[];

  // variant select
  const valueList = filterVariant === 'select' ? [...column.getFacetedUniqueValues().keys()].sort() : [];
  const selectCurrentValue = (column.getFilterValue() ?? []) as string[];

  const onChange = (values: number[] | string[]) => {
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
      default:
        setValues([]);
        break;
    }
  };

  useEffect(() => {
    setResetCount((val) => val + 1);
  }, [globalReset]);

  return (
    <PopoverRoot open={open} onOpenChange={(e) => setOpen(e.open)} positioning={{ placement: 'bottom-end' }}>
      <PopoverTrigger asChild>
        <IconButton
          className="filter-icon"
          title={`filter ${id}`}
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
        colorPalette="pink"
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

const SelectFilter: FC<SelectFilterProps> = ({ id, valueList, initialValue, resetCount, onChange }) => {
  // console.log('SelectFilter');
  const selectAll = 'Select All';
  const [values, setValues] = useState(initialValue ?? []);
  const selectList = [selectAll, ...valueList];

  const onCheck = (event: ChangeEvent<HTMLInputElement>, value: string) => {
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
                padding: '8px 0px',
                borderBottom: idx === 0 ? '1px solid #ddd' : ''
              }}>
              <input
                id={`${id}-${value}`}
                type="checkbox"
                name={value}
                checked={values.includes(value)}
                onChange={(event) => onCheck(event, value)}
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
