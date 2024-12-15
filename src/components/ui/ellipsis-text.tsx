import { TextProps } from '@chakra-ui/react';
import { Text } from '@chakra-ui/react';
import { FC } from 'react';

export const EllipsisText: FC<TextProps> = ({ width, children }) => {
  return (
    <Text maxWidth={width} width={width} display="block" textOverflow="ellipsis" overflow="hidden">
      {children}
    </Text>
  );
};
