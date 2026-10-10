// The control room's and the ballroom's cutscene bits: the SNES framing (letterbox bars, banded dark, a gold rule along
// the picture's edge, a dithered row off it), and a token-guarded way to say things (so a skipped scene's lines can't
// call back into the next one).

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';

type Ctx = CanvasRenderingContext2D;

/** How tall the bars get (screen px). */
const BAR = 46;
/** The bars, `k` of the way in (0..1). Screen space. */
export const drawBars = (c: Ctx, k: number) => {
  const h = Math.round(BAR * Math.max(0, Math.min(1, k)));
  if (h <= 0) return;
  for (const top of [true, false]) {
    const y0 = top ? 0 : CANVAS_HEIGHT - h;
    c.fillStyle = '#05030A'; c.fillRect(0, y0, CANVAS_WIDTH, h);
    // (banded: a step lighter toward the picture)
    c.fillStyle = '#0D0816'; c.fillRect(0, top ? h - 8 : y0 + 2, CANVAS_WIDTH, 6);
    // (the gold rule, and a dithered row off it)
    c.fillStyle = '#A16207'; c.fillRect(0, top ? h - 2 : y0, CANVAS_WIDTH, 2);
    c.fillStyle = '#05030A';
    const dy = top ? h : y0 - 1;
    for (let x = (top ? 0 : 1); x < CANVAS_WIDTH; x += 2) c.fillRect(x, dy, 1, 1);
  }
};

/** A scene's lines: each one's callbacks only count while the scene's still the same go at it (its token). */
export class Lines {
  token = 0;
  /** Wrap a callback so it's dropped once the token's moved on (skipped, ended, restarted). */
  guard<A extends unknown[]>(f: (...a: A) => void): (...a: A) => void {
    const tok = this.token;
    return (...a: A) => { if (this.token === tok) f(...a); };
  }
  bump() { this.token++; }
}
