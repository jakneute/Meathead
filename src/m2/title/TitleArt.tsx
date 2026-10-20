import React from 'react';
import { createTitleScene, TITLE_W, TITLE_H } from './art';

/** Frames of the picture's clock a second (it's drawn at half that: everything in it moves in steps anyway). */
const FRAME_MS = 1000 / 60;

/** Meathead 2's title picture, behind the menu: the whole screen, pixel art at 2x (Meathead 1's TitleArt.tsx's way). */
const TitleArt: React.FC = () => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    const scene = createTitleScene();
    let raf = 0, last = 0, t = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (last && now - last < FRAME_MS * 2 - 2) return;
      const steps = last ? Math.min(4, Math.round((now - last) / FRAME_MS)) : 0;
      last = now; t += steps;
      const g = ref.current?.getContext('2d');
      if (g) scene.draw(g, t, Math.max(1, steps));
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} width={TITLE_W} height={TITLE_H} aria-hidden className="absolute inset-0 w-full h-full pointer-events-none" style={{ imageRendering: 'pixelated' }} />;
};

export default TitleArt;
