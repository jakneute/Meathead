import React from 'react';
import { createTitleScene, TITLE_W, TITLE_H, INTRO_END } from './art';
import { songBeat } from '../music/engine';
import { audioRunning } from '../../m1/game/platform/audio';
import { getSettings } from '../../m1/game/settings';

/** Frames of the picture's clock a second (it's drawn at half that: everything in it moves in steps anyway). */
const FRAME_MS = 1000 / 60;
/** The theme's beat (150 a minute): the intro's clock when the theme isn't there to keep it. */
const BEAT_MS = 400;
/** How long the intro waits on the theme starting up (its instruments being made) before keeping its own time; less
 *  when no sound's coming out yet (a browser holds it back till the first key, and a key skips the intro anyway). */
const WAIT_MS = 1500, WAIT_SILENT_MS = 300;
/** On its own clock: a moment of the empty dusk before the first thud. */
const LEAD_MS = 250;

/** Meathead 2's title picture, behind the menu: the whole screen, pixel art at 2x (Meathead 1's TitleArt.tsx's way).
 *  Comes up with its intro (art.ts: the park dropping in, him, the logo stamped on), its hits on the theme's: it keeps
 *  the theme's time while the theme's playing from its top, or its own. `skip` jumps it to the finished picture;
 *  `onDone` when it's played out. */
const TitleArt: React.FC<{ skip?: boolean; onDone?: () => void }> = ({ skip = false, onDone }) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const skipRef = React.useRef(skip); skipRef.current = skip;
  const doneRef = React.useRef(onDone); doneRef.current = onDone;
  React.useEffect(() => {
    const scene = createTitleScene();
    let raf = 0, last = 0, t = 0;
    // The intro's clock: waiting on the theme, on the theme's beats, or its own
    const t0 = performance.now();
    let mode: 'wait' | 'music' | 'own' = 'wait', ownAt = 0, beat = -1, done = false;
    const introBeat = (now: number): number => {
      if (done) return Infinity;
      if (skipRef.current) { done = true; return Infinity; }
      const sb = songBeat('title');
      if (mode === 'wait') {
        const el = now - t0, s = getSettings();
        if (sb !== null && sb < 2) mode = 'music';
        else if (sb !== null || s.music <= 0 || s.master <= 0 || el > WAIT_MS || (el > WAIT_SILENT_MS && !audioRunning())) { mode = 'own'; ownAt = now + LEAD_MS; }
      }
      if (mode === 'music') {
        // (the theme gone, or the sound shut off: carrying on from where it was)
        if (sb === null) { mode = 'own'; ownAt = now - beat * BEAT_MS; } else return sb;
      }
      return mode === 'own' ? (now - ownAt) / BEAT_MS : -1;
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (last && now - last < FRAME_MS * 2 - 2) return;
      const steps = last ? Math.min(4, Math.round((now - last) / FRAME_MS)) : 0;
      last = now; t += steps;
      const b = introBeat(now);
      if (Number.isFinite(b)) beat = b;
      if (!done && b >= INTRO_END) done = true;
      if (done && beat !== Infinity) { beat = Infinity; doneRef.current?.(); }
      const g = ref.current?.getContext('2d');
      if (g) scene.draw(g, t, Math.max(1, steps), done ? Infinity : beat);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} width={TITLE_W} height={TITLE_H} aria-hidden className="absolute inset-0 w-full h-full pointer-events-none" style={{ imageRendering: 'pixelated' }} />;
};

export default TitleArt;
