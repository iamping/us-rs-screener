import { Input, Show } from '@chakra-ui/react';
import fuzzysort from 'fuzzysort';
import { ChangeEvent, FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PiMagnifyingGlass, PiXDuotone } from 'react-icons/pi';
import { EmptyState } from '@/components/ui/empty-state';
import { InputGroup } from '@/components/ui/input-group';
import { ComboBoxFilterProps } from '@/types/common';

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
