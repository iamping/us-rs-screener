import { FC, useEffect, useRef } from 'react';

interface CanvasProps extends React.HTMLAttributes<HTMLCanvasElement> {
  draw: (context: CanvasRenderingContext2D) => void;
}

export const Canvas: FC<CanvasProps> = ({ draw, ...rest }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries = []) => {
      const canvas = ref.current as HTMLCanvasElement;
      const context = canvas.getContext('2d') as CanvasRenderingContext2D;
      entries.forEach((entry) => {
        const { width, height } = entry.contentRect || canvas.getBoundingClientRect();
        const pixelRatio = devicePixelRatio || 1;
        if (entry.devicePixelContentBoxSize) {
          const { inlineSize, blockSize } = entry.devicePixelContentBoxSize[0];
          canvas.width = inlineSize;
          canvas.height = blockSize;
        } else {
          canvas.width = Math.floor(width * pixelRatio);
          canvas.height = Math.floor(height * pixelRatio);
          canvas.style.width = `${canvas.width / pixelRatio}px`;
          canvas.style.height = `${canvas.height / pixelRatio}px`;
        }
        render(context, draw);
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
  }, [draw]);

  useEffect(() => {
    const canvas = ref.current as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    render(context, draw);
  }, [draw]);

  return <canvas ref={ref} {...rest}></canvas>;
};

const render = (context: CanvasRenderingContext2D, draw: (context: CanvasRenderingContext2D) => void) => {
  predraw(context);
  draw(context);
  postdraw(context);
};

const predraw = (context: CanvasRenderingContext2D) => {
  const canvas = context.canvas;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
};

const postdraw = (context: CanvasRenderingContext2D) => {
  context.restore();
};
