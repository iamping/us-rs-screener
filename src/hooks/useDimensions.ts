import { RefObject, useEffect, useRef, useState } from 'react';

export interface Dimensions {
  height: number;
  width: number;
  bitmapHeight: number;
  bitmapWidth: number;
  pixelRatio: number;
}

export const useDimensions = <T extends HTMLElement>(): [RefObject<T | null>, Dimensions] => {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
    bitmapWidth: 0,
    bitmapHeight: 0,
    pixelRatio: 1
  });
  const ref = useRef<T>(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries = []) => {
      const element = ref.current as HTMLElement;
      entries.forEach((entry) => {
        const { width, height } = entry.contentRect || element.getBoundingClientRect();
        const pixelRatio = devicePixelRatio || 1;
        if (entry.devicePixelContentBoxSize) {
          const { inlineSize, blockSize } = entry.devicePixelContentBoxSize[0];
          setDimensions({ width, height, bitmapWidth: inlineSize, bitmapHeight: blockSize, pixelRatio });
        } else {
          const bitmapWidth = Math.floor(width * pixelRatio);
          const bitmapHeight = Math.floor(height * pixelRatio);
          setDimensions({
            width: bitmapWidth / pixelRatio,
            height: bitmapHeight / pixelRatio,
            bitmapWidth: bitmapWidth,
            bitmapHeight: bitmapHeight,
            pixelRatio
          });
        }
      });
    });
    if (ref.current) {
      try {
        observer.observe(ref.current, { box: 'device-pixel-content-box' });
      } catch {
        observer.observe(ref.current);
      }
    }
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return [ref, dimensions] as const;
};
