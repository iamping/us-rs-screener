import { Heading, HStack, Separator, Show, Spacer, Text } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { presetOptions, viewOptions } from '@/helpers/table.helper';
import { rowCountAtom, searchBoxOpenAtom } from '@/states/atom';
import { mobileMediaQuery } from '@/utils/common.utils';
import { AppSettings } from './app-settings';
import { ExportDataButton } from './export-data-button';
import { PresetSelection } from './preset-selection';
import { SearchBox } from './search-box';

export const TopBar = () => {
  const rowCount = useAtomValue(rowCountAtom);
  const isSearchBoxOpen = useAtomValue(searchBoxOpenAtom);

  const isSmallScreen = useMediaQuery(mobileMediaQuery);
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
    <HStack
      gap={1}
      paddingY={2}
      paddingLeft={1}
      paddingRight={2}
      height="48px"
      position="relative"
      borderBottom="1px solid var(--chakra-colors-gray-200)">
      <Heading paddingX={1} title="US Stock Screener" lineHeight="10px" paddingTop="12px" className="borel-regular">
        {rowCount < 0 && 'Loading...'}
        {rowCount >= 0 && (
          <>
            {rowCountFormat.prefix} {rowCountFormat.value}
          </>
        )}
      </Heading>
      <Show when={(!isSearchBoxOpen && isSmallScreen) || !isSmallScreen}>
        <Separator orientation="vertical" height={5} />
        <PresetSelection type="Preset" optionList={presetOptions} />
        <Separator orientation="vertical" height={5} />
        <PresetSelection type="View" optionList={viewOptions} />
        <Separator orientation="vertical" height={5} />
        <Spacer />
      </Show>
      <SearchBox />
      <ExportDataButton />
      <AppSettings />
    </HStack>
  );
};
