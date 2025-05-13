import { CSSProperties, FC, useEffect, useRef } from 'react';

interface CanvasProps extends React.HTMLAttributes<HTMLCanvasElement> {
  draw?: (context: CanvasRenderingContext2D) => void;
}

export const Canvas: FC<CanvasProps> = ({ draw, style, ...rest }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const render = () => {
      const { width, height } = style as CSSProperties;
      predraw(context, width as number, height as number);
      if (draw) {
        draw(context);
      }
      postdraw(context);
    };
    render();
  }, [ref, draw, style]);

  return <canvas ref={ref} style={style} {...rest}></canvas>;
};

const predraw = (context: CanvasRenderingContext2D, width: number, height: number) => {
  const canvas = context.canvas;
  canvas.width = Math.round(width * devicePixelRatio);
  canvas.height = Math.round(height * devicePixelRatio);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
};

const postdraw = (context: CanvasRenderingContext2D) => {
  context.restore();
};
