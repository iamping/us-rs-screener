import { Button, IconButton, Text, VStack } from '@chakra-ui/react';
import { FC, useEffect, useState } from 'react';
import { PiCaretDownBold } from 'react-icons/pi';
import { PopoverBody, PopoverContent, PopoverRoot, PopoverTrigger } from '../ui/popover';
import { RadioFilter } from './filter';
import { DropdownProps, SelectOption } from '../../models/common';

export const Dropdown: FC<DropdownProps> = ({
  optionList,
  type,
  manualCount,
  setColumnFilters,
  setColumnVisibility
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState({ title: '', value: '' });

  const onChange = (val: string) => {
    const option = optionList.find((e) => e.value === val) ?? ({} as SelectOption);
    if (type === 'Preset') {
      setValue(option);
      setColumnFilters?.(option?.presetStates ?? []);
    } else if (type === 'View') {
      setValue(option);
      setColumnVisibility?.(option?.columnVisibility ?? {});
    }
    setOpen(false);
  };

  useEffect(() => {
    setValue(optionList[0]);
  }, [optionList]);

  useEffect(() => {
    console.log(manualCount);
    if (manualCount && manualCount > 0) {
      setValue({ title: 'Manual', value: '-' });
    }
  }, [manualCount]);

  return (
    <PopoverRoot open={open} onOpenChange={(e) => setOpen(e.open)} positioning={{ placement: 'bottom-start' }}>
      <PopoverTrigger asChild>
        <Button as={'div'} size="xs" variant="outline" border={0} paddingRight={1}>
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
            <RadioFilter id={type} initialValue={value.value} optionList={optionList} onChange={onChange} />
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};
