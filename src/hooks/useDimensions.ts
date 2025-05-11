import { RefObject, useEffect, useRef, useState } from 'react';

export interface Dimensions {
  height: number;
  width: number;
  bitmapHeight: number;
  bitmapWidth: number;
  pixelRatio: number;
}

export const useDimensions = <T>(): [RefObject<T | null>, Dimensions] => {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
    bitmapWidth: 0,
    bitmapHeight: 0,
    pixelRatio: 1
  });
  const ref = useRef(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries = []) => {
      entries.forEach((entry) => {
        const { width, height } = entry.contentRect;
        const pixelRatio = devicePixelRatio || 1;
        if (entry.devicePixelContentBoxSize) {
          const { inlineSize, blockSize } = entry.devicePixelContentBoxSize[0];
          setDimensions({ width, height, bitmapWidth: inlineSize, bitmapHeight: blockSize, pixelRatio });
        } else {
          setDimensions({
            width,
            height,
            bitmapWidth: width * pixelRatio,
            bitmapHeight: height * pixelRatio,
            pixelRatio
          });
        }
      });
    });
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return [ref, dimensions] as const;
};
