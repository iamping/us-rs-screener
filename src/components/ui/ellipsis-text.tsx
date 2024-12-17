import { TextProps } from '@chakra-ui/react';
import { Text } from '@chakra-ui/react';
import { FC } from 'react';
import { Tooltip } from './tooltip';

interface EllipsisTextProps extends TextProps {
  showToolTip?: boolean;
}

export const EllipsisText: FC<EllipsisTextProps> = (props) => {
  if (props.showToolTip) {
    return (
      <Tooltip content={props.children}>
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
      </Tooltip>
    );
  }

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
