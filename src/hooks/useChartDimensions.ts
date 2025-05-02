import { useRef, useState } from 'react';
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
}

export const useChartDimensions = (margins?: ChartMargins) => {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const plotMargins = {
    marginTop: margins?.marginTop || 0,
    marginRight: margins?.marginRight || 0,
    marginBottom: margins?.marginBottom || 0,
    marginLeft: margins?.marginLeft || 0
  };

  const onResize = useDebounceCallback((size) => {
    setWidth(Math.round(size.width));
    setHeight(Math.round(size.height));
  }, 200);

  useResizeObserver({ ref, box: 'border-box', onResize });

  const updatedDimensions: ChartDimensions = {
    ...plotMargins,
    height: height,
    width: width,
    plotHeight: Math.max(height - plotMargins.marginTop - plotMargins.marginBottom, 0),
    plotWidth: Math.max(width - plotMargins.marginLeft - plotMargins.marginRight, 0)
  };

  return [ref, updatedDimensions] as const;
};
