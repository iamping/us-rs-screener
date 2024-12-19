import { Button, IconButton, Text, VStack } from '@chakra-ui/react';
import { FC, useState } from 'react';
import { PiCaretDownBold } from 'react-icons/pi';
import { PopoverBody, PopoverContent, PopoverRoot, PopoverTrigger } from './popover';
import { RadioSelectFilter, SelectOption } from '../app/filter';
import { ColumnFiltersState } from '@tanstack/react-table';

interface DropdownProps {
  optionList: SelectOption[];
  type: 'Preset' | 'View';
  setColumnFilters?: (filters: ColumnFiltersState) => void;
}

export const Dropdown: FC<DropdownProps> = ({ optionList, type, setColumnFilters }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(optionList[0]);

  const onChange = (val: string) => {
    if (type === 'Preset') {
      const option = optionList.find((e) => e.value === val) ?? ({} as SelectOption);
      setValue(option);
      setColumnFilters?.(option?.presetStates ?? []);
    }
    setOpen(false);
  };

  return (
    <PopoverRoot open={open} onOpenChange={(e) => setOpen(e.open)}>
      <PopoverTrigger asChild>
        <Button as={'div'} size="xs" variant="subtle" paddingRight={1}>
          <Text color="gray.500">
            {type}:{' '}
            <Text as="span" color="black">
              {value.title}
            </Text>
          </Text>
          <IconButton size="2xs" variant="plain">
            <PiCaretDownBold />
          </IconButton>
        </Button>
      </PopoverTrigger>
      <PopoverContent width={200}>
        <PopoverBody padding={2}>
          <VStack>
            <RadioSelectFilter resetCount={0} initialValue={value.value} optionList={optionList} onChange={onChange} />
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};
