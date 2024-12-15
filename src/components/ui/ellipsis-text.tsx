import { TextProps } from '@chakra-ui/react';
import { Text } from '@chakra-ui/react';
import { FC } from 'react';

export const EllipsisText: FC<TextProps> = (props) => {
  return (
    <Text
      {...props}
      maxWidth={props.width}
      width={props.width}
      display="block"
      textOverflow="ellipsis"
      overflow="hidden">
      {props.children}
    </Text>
  );
};
