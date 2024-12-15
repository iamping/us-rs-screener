import { Button, Code, HStack, IconButton, Separator, Spacer, VStack } from '@chakra-ui/react';
import { FC, useEffect, useState } from 'react';
import { LuFilter } from 'react-icons/lu';
import { PopoverBody, PopoverContent, PopoverRoot, PopoverTrigger } from './popover';
import { Slider } from './slider';

export type FilterVariant = 'range' | 'select' | undefined;
interface FilterProps {
  isFiltered: boolean;
  width: number | string;
  filterVariant: FilterVariant;
}

// interface FilterBodyProps {
//   filterVariant: FilterVariant;
//   resetCount: number;
//   initialValues: number[] | undefined;
//   onChange: (val: number[] | string[]) => void;
// }

interface RangeFilterProps {
  resetCount: number;
  initialValues: number[];
  min: number;
  max: number;
  onChange: (val: number[]) => void;
}

const RangeFilter: FC<RangeFilterProps> = ({ initialValues, resetCount, onChange, min, max }) => {
  const [values, setValues] = useState(initialValues);
  const onValueChange = (values: number[]) => {
    onChange(values);
    setValues(values);
  };
  useEffect(() => {
    setValues([min, max]);
  }, [resetCount, min, max]);

  return (
    <>
      <Slider
        size="md"
        width="90%"
        colorPalette="pink"
        value={values}
        min={min}
        max={max}
        onValueChange={(details) => onValueChange(details.value)}
      />
      <HStack width="100%">
        <Code>from: {values[0]}</Code>
        <Spacer />
        <Code>to: {values[1]}</Code>
      </HStack>
    </>
  );
};

// const FilterBody: FC<FilterBodyProps> = ({ filterVariant, initialValues, resetCount, onChange }) => {
//   const [values, setValues] = useState(initialValues);
//   const onValueChangeEnd = (values: number[]) => {
//     onChange(values);
//   };
//   useEffect(() => {
//     setValues([0, 100]);
//   }, [resetCount]);

//   switch (filterVariant) {
//     case 'range':
//       return (
//         <Slider
//           size="md"
//           width="90%"
//           colorPalette="pink"
//           value={values}
//           marks={[
//             { value: 0, label: '0' },
//             { value: 50, label: '50' },
//             { value: 75, label: '75' },
//             { value: 100, label: '100' }
//           ]}
//           onValueChangeEnd={(details) => onValueChangeEnd(details.value)}
//         />
//       );
//     case 'select':
//       return 'select';
//     default:
//       return 'default';
//   }
// };

export const FilterIconButton: FC<FilterProps> = ({ isFiltered, width, filterVariant }) => {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<number[] | string[]>([]);
  const [resetCount, setResetCount] = useState(0);

  const onChange = (values: number[] | string[]) => {
    setValues(values);
  };

  const onApply = () => {
    console.log(values);
    setOpen(false);
  };

  const onReset = () => {
    setValues([0, 100]);
    setResetCount((val) => val + 1);
  };

  return (
    <PopoverRoot open={open} onOpenChange={(e) => setOpen(e.open)} positioning={{ placement: 'bottom-end' }}>
      <PopoverTrigger asChild>
        <IconButton
          size="2xs"
          color={isFiltered ? 'orange.500' : 'gray'}
          variant="ghost"
          onClick={(e) => e.stopPropagation()}>
          <LuFilter />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent minWidth={200} width={width} onClick={(e) => e.stopPropagation()}>
        <PopoverBody padding={4}>
          <VStack>
            {filterVariant === 'range' && (
              <RangeFilter initialValues={[0, 100]} min={0} max={100} resetCount={resetCount} onChange={onChange} />
            )}
            {/* <FilterBody
              filterVariant={filterVariant}
              initialValues={[0, 100]}
              resetCount={resetCount}
              onChange={onChange}
            /> */}
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
