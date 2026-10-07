import React from 'react';
import { createTitleScene, TITLE_W, TITLE_H } from '../game/scenes/titleArt';

/** Frames of the picture's clock a second (it's drawn at half that: everything in it moves in steps anyway). */
const FRAME_MS = 1000 / 60;

/**
 * The title screen's picture, behind the menu: the whole screen, pixel art at 2x. `paused`: something's covering it
 * (the intro), so it stops drawing.
 */
const TitleArt: React.FC<{ shitty?: boolean; paused?: boolean }> = ({ shitty = false, paused = false }) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const shat = React.useRef(shitty);
  shat.current = shitty;
  React.useEffect(() => {
    if (paused) return;
    const scene = createTitleScene();
    let raf = 0, last = 0, t = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (last && now - last < FRAME_MS * 2 - 2) return;
      const steps = last ? Math.min(4, Math.round((now - last) / FRAME_MS)) : 0;
      last = now; t += steps;
      const g = ref.current?.getContext('2d');
      if (g) scene.draw(g, t, shat.current, Math.max(1, steps));
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [paused]);
  return <canvas ref={ref} width={TITLE_W} height={TITLE_H} aria-hidden className="absolute inset-0 w-full h-full pointer-events-none" style={{ imageRendering: 'pixelated' }} />;
};

export default TitleArt;
