import { Text, TextProps } from '@chakra-ui/react';
import { FC } from 'react';

export const EllipsisText: FC<TextProps> = (props) => {
  return (
    <Text
      {...props}
      maxWidth={props.width}
      width={props.width}
      display="block"
      textOverflow="ellipsis"
      whiteSpace="nowrap"
      overflow="hidden">
      {props.children}
    </Text>
  );
};
