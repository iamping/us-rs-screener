import { Code, HStack, Spacer, VStack } from '@chakra-ui/react';
import { FC, useEffect, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';
import { Slider } from '@/components/ui/slider';

interface RangeFilterProps {
  id?: string;
  initialValue: number[];
  min: number;
  max: number;
  onChange: (val: number[]) => void;
}

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
