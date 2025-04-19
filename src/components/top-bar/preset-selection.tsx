import { Button, IconButton, Text, VStack } from '@chakra-ui/react';
import { useAtom, useAtomValue } from 'jotai';
import { FC, useEffect, useState } from 'react';
import { PiCaretDownBold } from 'react-icons/pi';
import { useMediaQuery } from 'usehooks-ts';
import { Filter } from '@/components/filter/filter';
import { PopoverBody, PopoverContent, PopoverRoot, PopoverTrigger } from '@/components/ui/popover';
import { appDropdownAtom, dropdownFnAtom, manualFilterAtom } from '@/states/atom';
import { DropdownProps, SelectOption } from '@/types/common';
import { getAbbreviation, mobileMediaQuery } from '@/utils/common.utils';

export const PresetSelection: FC<DropdownProps> = ({ optionList, type }) => {
  const filterChanged = useAtomValue(manualFilterAtom);
  const dropdownFn = useAtomValue(dropdownFnAtom);
  const [dropdownState, setDropdownState] = useAtom(appDropdownAtom);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState({ value: '', title: '' });

  const onChange = (val: string) => {
    const option = optionList.find((e) => e.value === val) ?? ({} as SelectOption);
    if (type === 'Preset') {
      setValue(option);
      setDropdownState((val) => ({ ...val, preset: option }));
      dropdownFn.setColumnFilters?.(option?.presetStates ?? []);
      dropdownFn.resetPageIndex?.();
    } else if (type === 'View') {
      setValue(option);
      setDropdownState((val) => ({ ...val, view: option }));
      dropdownFn.setColumnVisibility?.(option?.columnVisibility ?? {});
    }
    setOpen(false);
  };

  const isMobile = useMediaQuery(mobileMediaQuery);

  useEffect(() => {
    if (type === 'Preset') {
      setValue(dropdownState.preset);
    } else if (type === 'View') {
      setValue(dropdownState.view);
    }
  }, [dropdownState, type]);

  useEffect(() => {
    if (filterChanged > 0 && type === 'Preset') {
      setValue({ title: 'Manual', value: '-' });
      setDropdownState((val) => ({ ...val, preset: { title: 'Manual', value: '-' } }));
    }
  }, [filterChanged, type, setDropdownState]);

  return (
    <PopoverRoot
      modal={true}
      lazyMount={true}
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      positioning={{ placement: 'bottom-start' }}>
      <PopoverTrigger asChild>
        <Button as={'div'} size="xs" variant="outline" border={0} paddingRight={1}>
          <Text color="gray.500">
            {isMobile ? `` : `${type}: `}
            <Text as="span" color="black">
              {isMobile && type === 'Preset' ? getAbbreviation(value.title) : value.title}
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
            <Filter.RadioSelect id={type} initialValue={value.value} optionList={optionList} onChange={onChange} />
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};
