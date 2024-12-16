import { Button, Code, HStack, IconButton, Separator, Spacer, VStack } from '@chakra-ui/react';
import { FC, useEffect, useState } from 'react';
import { PopoverBody, PopoverContent, PopoverRoot, PopoverTrigger } from './popover';
import { Slider } from './slider';
import { Column } from '@tanstack/react-table';
import { PiFunnelBold } from 'react-icons/pi';

export type FilterVariant = 'range' | 'select' | undefined;
interface FilterProps<T> {
  id?: string;
  popupWidth: number | string;
  filterVariant: FilterVariant;
  column: Column<T, unknown>;
}

interface RangeFilterProps {
  resetCount: number;
  initialValues: number[] | undefined;
  min: number;
  max: number;
  onChange: (val: number[]) => void;
}

export const FilterIconButton = <T,>({ popupWidth, filterVariant, column }: FilterProps<T>) => {
  const [isReset, setIsReset] = useState(false);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<number[] | string[]>([]);
  const [resetCount, setResetCount] = useState(0);

  // variant range - handle filter current value
  const [min, max] = column.getFacetedMinMaxValues() ?? [0, 100];
  const rangeCurrentValue = (column.getFilterValue() ?? [min, max]) as number[];

  const onChange = (values: number[] | string[]) => {
    setIsReset(false);
    setValues(values);
  };

  const onApply = () => {
    // console.log(`[${id}] onApply => `, values);
    setOpen(false);
    column.setFilterValue(values);
    if (isReset) {
      column.setFilterValue(undefined);
    }
  };

  const onReset = () => {
    setIsReset(true);
    setResetCount((val) => val + 1);
    switch (filterVariant) {
      case 'range':
        setValues([min, max]);
        break;
      default:
        break;
    }
  };

  return (
    <PopoverRoot open={open} onOpenChange={(e) => setOpen(e.open)} positioning={{ placement: 'bottom-end' }}>
      <PopoverTrigger asChild>
        <IconButton
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
            {filterVariant === 'range' && (
              <RangeFilter
                initialValues={rangeCurrentValue}
                min={min!}
                max={max!}
                resetCount={resetCount}
                onChange={onChange}
              />
            )}
            <Separator margin={1} />
            <HStack justifyContent="space-between" width="100%">
              <Button size="sm" variant="ghost" onClick={onReset}>
                Reset
              </Button>
              <Button size="sm" onClick={onApply}>
                Apply
              </Button>
            </HStack>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};

const RangeFilter: FC<RangeFilterProps> = ({ initialValues: initialValue, resetCount, min, max, onChange }) => {
  // console.log(initialValue, min, max);
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

export const FilterEmpty = () => {
  return (
    <IconButton size="2xs" color="gray" variant="ghost" onClick={(e) => e.stopPropagation()}>
      <PiFunnelBold />
    </IconButton>
  );
};
