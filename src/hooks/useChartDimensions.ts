import { RefObject, useRef, useState } from 'react';
import { useDebounceCallback, useResizeObserver } from 'usehooks-ts';

interface ChartMargins {
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
}

export interface ChartDimensions {
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  height: number;
  width: number;
  plotHeight: number;
  plotWidth: number;
  diffWidth: number;
}

export const useChartDimensions = <T extends HTMLElement>(
  margins?: ChartMargins
): [RefObject<T | null>, ChartDimensions] => {
  const plotMargins = {
    marginTop: margins?.marginTop || 0,
    marginRight: margins?.marginRight || 0,
    marginBottom: margins?.marginBottom || 0,
    marginLeft: margins?.marginLeft || 0
  };
  const ref = useRef<T>(null);
  const [dms, setDimensions] = useState<ChartDimensions>({
    marginTop: plotMargins.marginTop,
    marginRight: plotMargins.marginRight,
    marginBottom: plotMargins.marginBottom,
    marginLeft: plotMargins.marginLeft,
    height: 0,
    width: 0,
    diffWidth: 0,
    plotHeight: 0,
    plotWidth: 0
  });

  const onResize = useDebounceCallback((size) => {
    if (Math.round(size.width) !== Math.round(dms.width) || Math.round(size.height) !== Math.round(dms.height)) {
      const width = Math.round(size.width);
      const height = Math.round(size.height);
      setDimensions({
        marginTop: margins?.marginTop || 0,
        marginRight: margins?.marginRight || 0,
        marginBottom: margins?.marginBottom || 0,
        marginLeft: margins?.marginLeft || 0,
        width: width,
        height: height,
        diffWidth: width - Math.round(dms.width),
        plotHeight: Math.max(height - plotMargins.marginTop - plotMargins.marginBottom, 0),
        plotWidth: Math.max(width - plotMargins.marginLeft - plotMargins.marginRight, 0)
      });
    }
  }, 0);

  const resizeRef = ref as RefObject<HTMLElement>;
  useResizeObserver({ ref: resizeRef, box: 'border-box', onResize });

  return [ref, dms] as const;
};
