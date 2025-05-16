import { Box, HStack, Separator, Show, Text, VStack } from '@chakra-ui/react';
import { ChangeEvent, CSSProperties, FC, Fragment, useEffect, useState } from 'react';
import { PiCheckBold } from 'react-icons/pi';
import { SelectOption } from '@/types/shared.type';

interface MultiSelectFilterProps {
  id?: string;
  initialValue: string[];
  optionList: SelectOption[];
  onChange: (val: string[]) => void;
}

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

  const style: CSSProperties = { maxHeight: 'var(--filter-content-max-height)', overflowY: 'auto' };

  return (
    <VStack id={`multi-select-filter-${id}`} width="100%" gap={2} style={style} className="scrollbar">
      {optionList.map((e, idx) => {
        return (
          <Fragment key={idx}>
            <Show when={!e.isSeparator}>
              <VStack
                as="label"
                className="checkbox-wrapper"
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
              <Separator />
            </Show>
          </Fragment>
        );
      })}
    </VStack>
  );
};
