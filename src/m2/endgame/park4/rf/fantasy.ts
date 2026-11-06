// PIPER THE PIXIE's refight (LUST): hell's knockoff of her bedroom, Fairy Land's own boss fight run whole
// (fantasy/bedroom/fight.ts) at 999. The owner's: "piper seems to find her having to interact with meathead once more
// truly a sign she must be in hell. don't have anything really interesting with her, but i do generally want new lines
// spoken". The same fight (the slams, the wreck, the mains, the throws, the flintlock's holes); her lines swapped
// (park4/lines/fantasy.ts; fantasy/piperLines.ts asks for the swap, it picks her lines itself). Started at
// checkpoint 61 (the land's own retry: outside her kicked-in door, walk in and she's waiting).
//
// Stitched up the way she died: corked (the cork that went through her head plugged with a nicer one, a seam round her
// middle where the floor had her wedged) or popped (the flintlock's holes under black tire patches off a bike kit, the
// orange edge round each).
//
// No hell props along the back (arena() null): it's a bedroom, and the framework draws them after the land's back pass,
// where she's drawn (they'd go over her). The hell's light and haze are the framework's.

import type { RefightDef } from '../defs';
import type { GameState } from '../../../../m1/game/core/state';
import { fantasyLayout } from '../../../fantasy/index';
import * as A from '../../../fantasy/bedroom/lines';
import { bossDeath } from '../../../store';
import { refightOn } from '../hook';
import { bossBox } from '../hell';
import { refightId, refightStage } from '../where';
import * as L from '../lines/fantasy';

type Ctx = CanvasRenderingContext2D;

/** The tire patches (fractions of her box): where the flintlock's balls went in. */
const PATCHES: [number, number, number][] = [[0.3, 0.42, 1], [0.66, 0.5, 0.8], [0.45, 0.7, 1.1], [0.2, 0.62, 0.7], [0.72, 0.3, 0.75]];

/** Her look's own bits over her (drawStitches does the seams): the cork in her head, or the tire patches. */
const drawLook = (c: Ctx, state: GameState) => {
  const at = bossBox(state);
  if (!at) return;
  const look = refightOn()?.look ?? 'normal';
  const L0 = at.x - at.w / 2, T = at.feet - at.h, fx = (u: number) => (at.face < 0 ? L0 + at.w * (1 - u) : L0 + at.w * u);
  c.save();
  if (look === 'weakness') {
    // (black rubber, an orange feathered edge, a sheen; glued, not sewn)
    for (const [u, v, k] of PATCHES) {
      const x = fx(u), y = T + at.h * v, rx = 9 * k, ry = 7 * k;
      c.fillStyle = '#EA580C'; c.beginPath(); c.ellipse(x, y, rx + 2, ry + 2, 0.3, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#18181B'; c.beginPath(); c.ellipse(x, y, rx, ry, 0.3, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#52525B'; c.fillRect(Math.round(x - rx * 0.5), Math.round(y - ry * 0.5), Math.round(rx * 0.6), 1);
    }
  } else {
    // (the cork, jammed in the top of her head where the first one went through; the seam round it)
    const x = fx(0.5), y = T + 6;
    c.fillStyle = '#7C5A2E'; c.fillRect(Math.round(x - 9), Math.round(y - 14), 18, 18);
    c.fillStyle = '#B08850'; c.fillRect(Math.round(x - 9), Math.round(y - 14), 18, 4);
    c.fillStyle = '#C9A36A'; c.fillRect(Math.round(x - 7), Math.round(y - 14), 6, 2);
    c.fillStyle = '#5A3E1E'; for (let k = 0; k < 5; k++) c.fillRect(Math.round(x - 7 + k * 3.4), Math.round(y - 8 + (k % 2) * 4), 1, 1);
    c.strokeStyle = '#F5F5F4'; c.lineWidth = 1;
    for (let k = 0; k < 6; k++) { const a = Math.PI + (k / 5) * Math.PI, sx = x + Math.cos(a) * 14, sy = y + 4 + Math.sin(a) * 6; c.beginPath(); c.moveTo(sx - 2, sy - 2); c.lineTo(sx + 2, sy + 2); c.stroke(); }
  }
  c.restore();
};

export const fantasyRefight: RefightDef = {
  land: 'fantasy', id: refightId('fantasy'), stage: refightStage('fantasy'),
  boss: 'PIPER THE PIXIE', sin: 'LUST',
  inner: fantasyLayout, cp: 61,
  sign: { pic: 'castle', word: 'CASTLE', color: '#1D4ED8' },
  looks: ['normal', 'weakness'],
  lookNow: () => bossDeath('fantasy') ?? 'normal',
  lookName: l => (l === 'weakness' ? 'POPPED (WEAKNESS)' : 'CORKED'),
  swaps: () => [
    [A.PIPER_AGAIN, L.RF_PIPER_AGAIN], [A.PIPER_TAUNT, L.RF_PIPER_TAUNT], [A.PIPER_LEAP, L.RF_PIPER_LEAP], [A.PIPER_HURT, L.RF_PIPER_HURT],
    [A.PIPER_HOLE, L.RF_PIPER_HOLE], [A.PIPER_LOW, L.RF_PIPER_LOW], [A.PIPER_LAST, L.RF_PIPER_LAST], [A.PIPER_STUCK, L.RF_PIPER_STUCK],
    [A.PIPER_SUPERMODEL, L.RF_PIPER_SUPERMODEL], [A.PIPER_TOO_THIN, L.RF_PIPER_TOO_THIN],
    [A.ELEMENT_SHOUT.fire, L.RF_ELEMENT_FIRE], [A.ELEMENT_SHOUT.ice, L.RF_ELEMENT_ICE], [A.ELEMENT_SHOUT.shock, L.RF_ELEMENT_SHOCK],
    [A.PIPER_POP, L.RF_PIPER_POP], [A.PIPER_CRUMBLE, L.RF_PIPER_CRUMBLE],
  ],
  arena: () => null,
  stitches: look => look === 'weakness'
    // (popped: the holes the patches don't cover, crossed shut; a seam down her where she split)
    ? { thread: '#1A1A1A', patch: '#18181B', seams: [[0.5, 0.25, 0.48, 0.9]], holes: [[0.58, 0.36], [0.36, 0.56]] }
    // (corked: the floor had her to the waist: a seam right round her middle, staples where it pinched)
    : { thread: '#F5F5F4', patch: '#7C5A2E', seams: [[0.02, 0.6, 0.98, 0.62]], staples: [[0.25, 0.61], [0.75, 0.62]] },
  drawFront: drawLook,
};
