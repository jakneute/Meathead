// The alpha's end, played over the page (the cheats build's title, the dev ?alphaend): the end walk out through
// America USA (endWalk.ts, on the walk-away screen: walkAway.ts) in its own canvas, at a steady 60 a second, then the
// title. In the game itself it's the hub that plays it (hub/index.ts, out through America USA).
//
// (Until 2026-11-03 this was a gross-up of the park's PA horn reading out the ending. The owner: "the game won't auto
// end on killing all 8 bosses. you trigger the 'alpha end' by exiting through america usa. show a 'victory walk'
// through america usa ... with a 'the end?' line. pressing A will go to the title screen". The PA's announcements are
// the hub's now (hub/announce.ts); his take on the finds is said on the walk.)

import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../m1/constants';
import { closeFile } from './save';
import { M2_PUBLIC, ALPHA_ENDINGS } from './build';
import { canvas } from './walkAway/screen';
import { playWalkAway, tickWalkAway, drawWalkAway, prewarmWalkAway, type WalkAway } from './walkAway';

/** Off to the title (as the pause menu's quit does: the file's time put on it, the page fresh). */
export const toTitle = () => { closeFile(); location.reload(); };

/** The end walk's painted-once art, ahead, in idle slices (the hub, all eight cleared). */
export const warmAlphaEnd = () => prewarmWalkAway('america-exit', false);

/** Dev (and the cheats build): ?alphaend plays it alone over the page (round again after). */
export const devAlphaEnd = () => {
  if (typeof document === 'undefined' || M2_PUBLIC || !ALPHA_ENDINGS) return;
  if (new URLSearchParams(location.search).has('alphaend')) alphaEndOver(true);
};

/** It on its own, over the page (the cheats build's title; the dev ?alphaend, looping). */
export const alphaEndOver = (loop = false) => {
  const cv = canvas(W * 2, H * 2);
  Object.assign(cv.style, { position: 'fixed', inset: '0', margin: 'auto', zIndex: '9999', background: '#000', imageRendering: 'pixelated', maxWidth: '100vw', maxHeight: '100vh', aspectRatio: '4 / 3', width: 'min(100vw, 133.33vh)' });
  document.body.appendChild(cv);
  const c = cv.getContext('2d')!;
  let space = false;
  window.addEventListener('keydown', e => { if (e.key === ' ') space = true; });
  window.addEventListener('keyup', e => { if (e.key === ' ') space = false; });
  const start = (): WalkAway => playWalkAway(null, { boss: 'america-exit', onDone: loop ? () => setTimeout(() => { cur = start(); }, 600) : toTitle });
  let cur = start();
  let last = 0, acc = 0;
  const frame = (now: number) => {
    acc += last ? Math.min(100, now - last) : 1000 / 60; last = now;
    let n = 0;
    while (acc >= 1000 / 60 - 1 && n < 4) {
      acc -= 1000 / 60; n++;
      const pad = navigator.getGamepads?.().find(p => p);
      tickWalkAway(cur, { left: false, right: false, up: false, down: false, jump: space, special: false, shoot: false }, !!pad?.buttons[0]?.pressed);
    }
    c.setTransform(2, 0, 0, 2, 0, 0);
    drawWalkAway(c, cur);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};
