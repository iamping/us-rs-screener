import { IconButton } from '@chakra-ui/react';
import { PiFunnelBold } from 'react-icons/pi';

export const EmptyFilter = () => {
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
