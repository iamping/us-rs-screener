import { Text } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { FC } from 'react';
import { stockInfoAtom } from '@/states/atom';
import { Stock } from '@/types/stock';
import { formatDecimal } from '@/utils/common.utils';

export const StockInfoTicker: FC<{ stock: Stock }> = ({ stock }) => {
  const stockInfo = useAtomValue(stockInfoAtom);
  const marqueeContent = (
    <>
      <p>
        Market Cap: <span>{formatDecimal(stock.marketCap / 1000000000)}B</span>
      </p>
      <p>
        Avg $ Vol: <span>{formatDecimal(stock.avgDollarVolume / 1000000)}M</span>
      </p>
      <p>
        R.Vol: <span>{formatDecimal(stock.relativeVolume)}</span>
      </p>
      <p>
        Industry: <span>{stock.industry}</span>
      </p>
      <p>
        Industry Rank: <span>{stock.industryRank}</span>
      </p>
    </>
  );
  return (
    <>
      <div className="marquee-wrapper">
        <div className="marquee">
          {marqueeContent}
          {marqueeContent}
        </div>
      </div>
      <Text
        className="chart-stock-info"
        fontSize="sm"
        position="absolute"
        whiteSpace="nowrap"
        backgroundColor="white/50"
        zIndex={1}
        top={12}
        left="18px">
        <Text as={'span'} fontWeight={500}>
          {stock.ticker}
        </Text>
        <Text as={'span'} color="gray.500">
          {` - ${stock.companyName}`}
        </Text>
        <Text as={'span'} display="block" fontSize="xs">
          <b>C</b>
          <span className={`change${stockInfo.change}`}>
            {stock.close} {formatDecimal(stockInfo.change, true)} ({formatDecimal(stockInfo.percentChange, true)}%){' '}
          </span>
          <b>Vol</b>
          <span className={`change${stockInfo.change}`}>{formatDecimal(stockInfo.volume / 1000000)}M</span>
        </Text>
      </Text>
    </>
  );
};
