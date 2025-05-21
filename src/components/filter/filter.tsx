import { Button, HStack, IconButton, Separator, Show, Text, VStack } from '@chakra-ui/react';
import { Column } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { useCallback, useRef, useState } from 'react';
import { PiFunnelBold } from 'react-icons/pi';
import { PopoverBody, PopoverContent, PopoverRoot, PopoverTrigger } from '@/components/ui/popover';
import { manualFilterAtom } from '@/states/atom';
import { FilterVariant } from '@/types/shared.type';
import { ComboBoxFilter } from './combobox-filter';
import { EmptyFilter } from './empty-filter';
import { MultiSelectFilter } from './multi-select-filter';
import { RadioFilter } from './radio-filter';
import { RangeFilter } from './range-filter';

interface FilterProps<T> {
  id?: string;
  popupWidth: number | string;
  filterVariant: FilterVariant;
  column: Column<T, unknown>;
  resetPageIndex?: () => void;
}

export const Filter = <T,>({ id, popupWidth, filterVariant, column, resetPageIndex }: FilterProps<T>) => {
  // console.log(`render filter [${id}]`);
  const setFilterChanged = useSetAtom(manualFilterAtom);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  // variant range
  const [min, max] = column.getFacetedMinMaxValues() ?? [0, 100];
  const rangeCurrentValue = (column.getFilterValue() ?? [min, max]) as number[];

  // variant combo box
  const valueList =
    filterVariant === 'combo-box'
      ? [...column.getFacetedUniqueValues().keys()].sort()
      : filterVariant === 'multi-select'
        ? (column.columnDef.meta?.selectOptions ?? [])
        : [];
  const selectCurrentValue = (column.getFilterValue() ?? []) as string[];

  // radio select
  const optionList = filterVariant === 'radio-select' ? (column.columnDef.meta?.selectOptions ?? []) : [];
  const radioCurrentValue = (column.getFilterValue() ?? '') as string;

  const onChange = useCallback(
    (values: number[] | string[] | string) => {
      column.setFilterValue(values);
      resetPageIndex?.();
      setFilterChanged((val) => val + 1);
      if (filterVariant === 'radio-select') {
        setOpen(false);
      }
    },
    [column, filterVariant, resetPageIndex, setFilterChanged]
  );

  const onReset = () => {
    column.setFilterValue(undefined);
    resetPageIndex?.();
  };

  if (!filterVariant) {
    return null;
  }

  return (
    <PopoverRoot
      modal={true}
      lazyMount={true}
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      positioning={{ placement: 'bottom-end' }}>
      <PopoverTrigger asChild>
        <IconButton
          className="filter-icon"
          title={`Filter ${id}`}
          size="2xs"
          color={{
            base: column.getIsFiltered() ? 'black' : 'gray.300',
            _dark: column.getIsFiltered() ? 'white' : 'gray.700'
          }}
          _hover={{
            color: {
              base: 'black',
              _dark: 'white'
            }
          }}
          variant="plain"
          minWidth={'fit-content'}
          onClick={(e) => e.stopPropagation()}>
          <PiFunnelBold />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent minWidth={200} width={popupWidth} onClick={(e) => e.stopPropagation()}>
        <PopoverBody padding={3}>
          <VStack>
            <Show when={!!column.columnDef.meta?.filterNote}>
              <Text textAlign="left" width="100%">
                {column.columnDef.meta?.filterNote}
              </Text>
            </Show>
            <Show when={filterVariant === 'range'}>
              <RangeFilter id={id} initialValue={rangeCurrentValue} min={min!} max={max!} onChange={onChange} />
            </Show>
            <Show when={filterVariant === 'combo-box'}>
              <ComboBoxFilter
                id={id}
                initialValue={selectCurrentValue}
                valueList={valueList}
                enableSearch={valueList.length > 15}
                hideSelectAll={valueList.length < 10}
                onChange={onChange}
              />
            </Show>
            <Show when={filterVariant === 'radio-select'}>
              <RadioFilter id={id} initialValue={radioCurrentValue} optionList={optionList} onChange={onChange} />
            </Show>
            <Show when={filterVariant === 'multi-select'}>
              <MultiSelectFilter id={id} initialValue={selectCurrentValue} optionList={valueList} onChange={onChange} />
            </Show>
            <Separator width="100%" margin={1} />
            <HStack justifyContent="space-between" width="100%">
              <Button size="2xs" variant="ghost" onClick={onReset} ref={ref}>
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

Filter.Empty = EmptyFilter;
Filter.Range = RangeFilter;
Filter.ComboBox = ComboBoxFilter;
Filter.Radio = RadioFilter;
Filter.MultiSelect = MultiSelectFilter;
