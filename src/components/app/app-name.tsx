import { Heading } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { rowCount } from '../../state/atom';

export const AppName = () => {
  const readRowCount = useAtomValue(rowCount);

  return (
    <>
      <Heading
        paddingX={1}
        title="US Stock Screener"
        hideBelow="md"
        className="borel-regular"
        lineHeight="10px"
        paddingTop="12px">
        {`${readRowCount > 0 ? `Total - ${readRowCount}` : 'Loading...'}`}
      </Heading>
      <Heading
        paddingX={1}
        title="US Stock Screener"
        hideFrom="md"
        lineHeight="10px"
        paddingTop="12px"
        className="borel-regular">
        {`${readRowCount > 0 ? `(${readRowCount})` : 'Loading...'}`}
      </Heading>
    </>
  );
};
