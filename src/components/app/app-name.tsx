import { Heading } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { rowCountAtom } from '../../state/atom';

export const AppName = () => {
  const rowCount = useAtomValue(rowCountAtom);

  return (
    <>
      <Heading
        paddingX={1}
        title="US Stock Screener"
        hideBelow="md"
        className="borel-regular"
        lineHeight="10px"
        paddingTop="12px">
        {`${rowCount >= 0 ? `Total - ${rowCount}` : 'Loading...'}`}
      </Heading>
      <Heading
        paddingX={1}
        title="US Stock Screener"
        hideFrom="md"
        lineHeight="10px"
        paddingTop="12px"
        className="borel-regular">
        {`${rowCount >= 0 ? `(${rowCount})` : 'Loading...'}`}
      </Heading>
    </>
  );
};
