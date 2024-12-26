import { Heading, HStack, Separator, Spacer, Text } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { rowCountAtom } from '../../state/atom';
import { presetOptions, viewOptions } from '../../utils/table.util';
import { Dropdown } from './dropdown';
import { Settings } from './settings';
import { useMediaQuery } from 'usehooks-ts';
import { useMemo } from 'react';

export const Topbar = () => {
  const rowCount = useAtomValue(rowCountAtom);

  const isSmallScreen = useMediaQuery('(max-width: 600px)');
  const rowCountFormat = useMemo(() => {
    return {
      prefix: isSmallScreen ? '' : 'Total - ',
      value: isSmallScreen ? (
        <Text as="span" color="teal.500">
          ({rowCount})
        </Text>
      ) : (
        <Text as="span" color="teal.500">
          {rowCount}
        </Text>
      )
    };
  }, [isSmallScreen, rowCount]);

  return (
    <HStack gap={1} paddingY={2} paddingLeft={1} paddingRight={2}>
      <Heading paddingX={1} title="US Stock Screener" lineHeight="10px" paddingTop="12px" className="borel-regular">
        {rowCount < 0 && 'Loading...'}
        {rowCount >= 0 && (
          <>
            {rowCountFormat.prefix} {rowCountFormat.value}
          </>
        )}
      </Heading>
      <Separator orientation="vertical" height={5} />
      <Dropdown type="Preset" optionList={presetOptions} />
      <Separator orientation="vertical" height={5} />
      <Dropdown type="View" optionList={viewOptions} />
      <Separator orientation="vertical" height={5} />
      <Spacer />
      <Settings />
    </HStack>
  );
};
