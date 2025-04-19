import { Box, HStack, Show, Text, VStack } from '@chakra-ui/react';
import { CSSProperties, FC, useEffect, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';
import { RadioFilterProps } from '@/types/common';

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
