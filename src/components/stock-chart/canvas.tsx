import { FC, useEffect, useRef } from 'react';

interface CanvasProps extends React.HTMLAttributes<HTMLCanvasElement> {
  draw: (context: CanvasRenderingContext2D) => void;
}

export const Canvas: FC<CanvasProps> = ({ draw, ...rest }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries = []) => {
      entries.forEach((entry) => {
        const { width, height } = entry.contentRect;
        const pixelRatio = devicePixelRatio || 1;
        const canvas = ref.current as HTMLCanvasElement;
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        if (entry.devicePixelContentBoxSize) {
          const { inlineSize, blockSize } = entry.devicePixelContentBoxSize[0];
          canvas.width = inlineSize;
          canvas.height = blockSize;
        } else {
          canvas.width = width * pixelRatio;
          canvas.height = height * pixelRatio;
        }
        render(context, draw);
      });
    });
    if (ref.current) {
      observer.observe(ref.current);
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
