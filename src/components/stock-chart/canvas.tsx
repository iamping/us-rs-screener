import { FC, RefObject, useEffect, useImperativeHandle, useRef } from 'react';

type DrawFunc = (context: CanvasRenderingContext2D) => void;
interface CanvasProps extends React.HTMLAttributes<HTMLCanvasElement> {
  ref?: RefObject<CanvasHandle | null>;
}
export interface CanvasHandle {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  draw: (drawFunc: DrawFunc) => void;
  clear: () => void;
}

export const Canvas: FC<CanvasProps> = ({ ref, ...rest }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef<DrawFunc>(null);
  const animationFrameRef = useRef(-1);

  useImperativeHandle(ref, () => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    return {
      draw: (drawFunc) => {
        drawRef.current = drawFunc;
        const animateRender = () => {
          predraw(context);
          drawFunc(context);
          postdraw(context);
          animationFrameRef.current = -1;
        };
        if (animationFrameRef.current !== -1) return;
        animationFrameRef.current = requestAnimationFrame(animateRender);
      },
      clear: () => {
        drawRef.current = null;
        predraw(context);
        postdraw(context);
      },
      canvasRef
    };
  });

  useEffect(() => {
    const observer = new ResizeObserver((entries = []) => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current as HTMLCanvasElement;
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
        // render here to prevent blank canvas when resize
        if (drawRef.current) {
          render(context, drawRef.current);
        }
      });
    });
    if (canvasRef.current) {
      try {
        observer.observe(canvasRef.current, { box: 'device-pixel-content-box' });
      } catch {
        observer.observe(canvasRef.current);
      }
    }
    return () => {
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} {...rest}></canvas>;
};

const render = (context: CanvasRenderingContext2D, draw: DrawFunc) => {
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
