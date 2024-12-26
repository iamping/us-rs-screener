import { Heading, IconButton, Separator, Text, VStack } from '@chakra-ui/react';
import { FC, useState } from 'react';
import { PiGearBold } from 'react-icons/pi';
import { PopoverBody, PopoverContent, PopoverRoot, PopoverTrigger } from '../ui/popover';
import { Switch } from '../ui/switch';
import { SettingsKey, SettingsProps } from '../../models/common';
import { useAtom } from 'jotai';
import { appSettingsAtom } from '../../state/atom';

export const Settings: FC<SettingsProps> = () => {
  const [currentSettings, saveSettings] = useAtom(appSettingsAtom);
  const [open, setOpen] = useState(false);

  const onSave = (key: SettingsKey, value: boolean) => {
    saveSettings({ ...currentSettings, [key]: value });
  };

  return (
    <PopoverRoot
      modal={true}
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      positioning={{ placement: 'bottom-end' }}>
      <PopoverTrigger asChild>
        <IconButton title="Settings" size="xs" variant="outline" border={0}>
          <PiGearBold />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent width={220} onClick={(e) => e.stopPropagation()}>
        <PopoverBody padding={4} width="100%">
          <VStack alignItems="start">
            <Heading size="sm">Settings</Heading>
            <Separator marginY={1} />
            <Switch
              size="sm"
              checked={currentSettings.includeOtc}
              onCheckedChange={(e) => onSave('includeOtc', e.checked)}>
              <Text fontWeight={400}>Include OTC</Text>
            </Switch>
            <Switch
              size="sm"
              checked={currentSettings.includeBiotechnology}
              onCheckedChange={(e) => onSave('includeBiotechnology', e.checked)}>
              <Text fontWeight={400}>Include Biotechnology</Text>
            </Switch>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};
