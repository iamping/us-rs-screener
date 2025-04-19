import { Box, Button, Code, HStack, IconButton, Input, Separator, Show, Spacer, Text, VStack } from '@chakra-ui/react';
import fuzzysort from 'fuzzysort';
import { useSetAtom } from 'jotai';
import { ChangeEvent, CSSProperties, FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PiCheckBold, PiFunnelBold, PiMagnifyingGlass, PiXDuotone } from 'react-icons/pi';
import { useDebounceCallback } from 'usehooks-ts';
import { EmptyState } from '@/components/ui/empty-state';
import { InputGroup } from '@/components/ui/input-group';
import { PopoverBody, PopoverContent, PopoverRoot, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { manualFilterAtom } from '@/state/atom';
import {
  ComboBoxFilterProps,
  FilterProps,
  MultiSelectFilterProps,
  RadioFilterProps,
  RangeFilterProps
} from '@/types/common';

export const FilterEmpty = () => {
  return (
    <IconButton
      minWidth={'fit-content'}
      size="2xs"
      color="gray.300"
      variant="ghost"
      onClick={(e) => e.stopPropagation()}>
      <PiFunnelBold />
    </IconButton>
  );
};

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
          color={column.getIsFiltered() ? 'black' : 'gray.300'}
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
            <Separator margin={1} />
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

export const RangeFilter: FC<RangeFilterProps> = ({ id, initialValue, min, max, onChange }) => {
  const [value, setValue] = useState([min, max]);
  const debouncedChange = useDebounceCallback(onChange, 500);
  const onValueChange = (values: number[]) => {
    debouncedChange(values);
    setValue(values);
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <VStack id={`range-filter-${id}`} width="100%" gap={3}>
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
    </VStack>
  );
};

// Chakra UI is too slow for this, just use HTML
export const ComboBoxFilter: FC<ComboBoxFilterProps> = ({
  id,
  valueList,
  initialValue,
  enableSearch,
  hideSelectAll,
  onChange
}) => {
  const selectAll = 'Select All';
  const [values, setValues] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const [highlight, setHighlight] = useState<Record<string, ReactNode>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const selectList = useMemo(() => {
    if (Object.keys(highlight).length === 0 && keyword.length > 0) {
      return [];
    } else if (Object.keys(highlight).length === 0) {
      return hideSelectAll ? valueList : [selectAll, ...valueList];
    } else {
      return hideSelectAll
        ? valueList.filter((e) => highlight[e])
        : [selectAll, ...valueList.filter((e) => highlight[e])];
    }
  }, [valueList, highlight, keyword, hideSelectAll]);

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

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
    onSearch(event.target.value);
  };

  const onClear = () => {
    setKeyword('');
    onSearch('');
    inputRef.current?.focus();
  };

  const onSearch = useCallback(
    (keyword: string) => {
      const results = fuzzysort.go(keyword, valueList);
      setHighlight(
        results.reduce(
          (acc, current) => ({
            ...acc,
            [current.target]: current.highlight((m, i) => (
              <span className="highlight" key={i}>
                {m}
              </span>
            ))
          }),
          {}
        )
      );
    },
    [valueList]
  );

  useEffect(() => {
    setValues(initialValue);
  }, [initialValue]);

  return (
    <>
      <div id={`combo-box-filter-${id}`} style={{ width: '100%' }}>
        <Show when={enableSearch}>
          <InputGroup
            flex="1"
            marginBottom={2}
            endElement={keyword.length === 0 ? <PiMagnifyingGlass /> : <PiXDuotone color="black" onClick={onClear} />}
            endElementProps={{ paddingRight: 2 }}
            width="100%">
            <Input
              ref={inputRef}
              id={`${id}-checkbox-search`}
              placeholder="Search items"
              value={keyword}
              size="xs"
              focusRing="none"
              _focus={{ borderColor: 'gray.300' }}
              onChange={onInputChange}
            />
          </InputGroup>
        </Show>
        <div style={{ maxHeight: '200px', overflowY: 'auto', width: '100%' }} className="scrollbar">
          <Show when={selectList.length > 0}>
            {selectList.map((value, idx) => {
              return (
                <div
                  key={idx}
                  className="filter-selection-item"
                  style={{
                    display: 'flex',
                    gap: '8px',
                    position: 'relative',
                    padding: '4px',
                    paddingLeft: '6px',
                    background: idx === 0 ? 'var(--chakra-colors-gray-100)' : '',
                    borderRadius: 4,
                    alignItems: 'center',
                    marginBottom: 4
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
                    {highlight[value] ?? value}
                  </label>
                </div>
              );
            })}
          </Show>
          <Show when={selectList.length === 0}>
            <EmptyState width="100%" marginTop={4} title="No results found" description="Try adjusting keyword" />
          </Show>
        </div>
      </div>
    </>
  );
};

export const RadioFilter: FC<RadioFilterProps> = ({ id, initialValue, optionList, onChange }) => {
  // console.log('radio select => ', id, initialValue);
  const [value, setValue] = useState('');
  const onSelect = (value: string) => {
    setValue(value);
    onChange(value);
  };
  const debouncedOnSelect = useDebounceCallback(onSelect, 0);
  const style: CSSProperties = { maxHeight: 'var(--select-filter-max-height)', overflowY: 'auto' };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <VStack id={`radio-filter-${id}`} width="100%" gap={2} style={style} className="scrollbar">
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
            <Show when={!!e.description}>
              <Text fontSize="sm" color="gray">
                {e.description}
              </Text>
            </Show>
          </VStack>
        );
      })}
    </VStack>
  );
};

export const MultiSelectFilter: FC<MultiSelectFilterProps> = ({ id, initialValue, optionList, onChange }) => {
  const [values, setValues] = useState<string[]>([]);
  const onSelect = (event: ChangeEvent<HTMLInputElement>, value: string) => {
    let currentValues = [];
    if (event.target.checked) {
      currentValues = [...values, value];
    } else {
      currentValues = values.filter((e) => e !== value);
    }
    setValues(currentValues);
    onChange(currentValues);
  };

  useEffect(() => {
    setValues(initialValue);
  }, [initialValue]);

  const style: CSSProperties = { maxHeight: 'var(--select-filter-max-height)', overflowY: 'auto' };

  return (
    <VStack id={`multi-select-filter-${id}`} width="100%" gap={2} style={style} className="scrollbar">
      {optionList.map((e, idx) => {
        return (
          <>
            <Show when={!e.isSeparator}>
              <VStack
                as="label"
                className="checkbox-wrapper"
                key={idx}
                width="100%"
                alignItems="start"
                gap={0}
                padding="4px 4px 4px 8px"
                borderRadius={5}>
                <HStack justifyContent="space-between" width="100%">
                  <Text fontWeight={500}>{e.title}</Text>
                  <Box paddingTop={1} paddingRight={1} position="relative">
                    <input
                      style={{ opacity: 0 }}
                      className="checkbox"
                      type="checkbox"
                      value={e.value}
                      name={`${id}`}
                      id={`${id}-${e.value}-${idx}`}
                      checked={values.includes(e.value)}
                      onChange={(event) => onSelect(event, e.value)}
                    />
                    <PiCheckBold
                      className="check-icon"
                      size={16}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        display: values.includes(e.value) ? 'inherit' : 'none'
                      }}
                    />
                  </Box>
                </HStack>
                <Show when={!!e.description}>
                  <Text fontSize="sm" color="gray">
                    {e.description}
                  </Text>
                </Show>
              </VStack>
            </Show>
            <Show when={e.isSeparator}>
              <Separator key={idx} />
            </Show>
          </>
        );
      })}
    </VStack>
  );
};
