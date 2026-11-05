// THE LAZY RIVER's vines: Jungle Land's (adventure/jungle/vines.ts: the swing, the climb, the pump, letting go), hung
// off the burnt beams of the river's old jungle pergola over the burning water. Harder: longer swings, further apart,
// in chains, fire jets up under them, and vines with a fuse: one catches fire at its tip the moment he takes hold of
// it, and the flame climbs it (the burnt part below it gone) up to his hands: then it snaps (he drops, into the fire
// if he's still over it). The fuse is how long he's got from taking hold; climbing up it doesn't buy any. A snapped
// one grows back a while after (a fresh one let down off the beam), so the way's never shut.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { updateVines, drawVines, newVineStore, onVine, type VineDef, type VineStore, type VineOpts } from '../../adventure/jungle/vines';
import { heard } from '../../bossQuiet';
import { CANVAS_WIDTH as W } from '../../../m1/constants';
import { VINES2 } from './geo';
import { flame, FIRE } from './fire';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const AWAY = -99999;
const REGROW = 420;

export interface VineBurn { t: number; s: number; gone: number }
export interface Vines2 { store: VineStore; defs: VineDef[]; burn: (VineBurn | null)[] }
export const newVines2 = (): Vines2 => ({
  store: newVineStore(),
  defs: VINES2.map(v => ({ x: v.x, y: v.y, len: v.len, kind: 'swing' })),
  burn: VINES2.map(() => null),
});
const optsOf = (v: Vines2): VineOpts => ({ store: () => v.store, style: 'liana', firstLines: L.MH_FIRST_VINE });

/** A frame of them (before he moves). `onSnap`: one gave way with him on it. */
export const updateVines2 = (ctx: FrameContext, v: Vines2, c: Controls, onSnap: () => void): Controls => {
  const { state } = ctx, p = state.player, h = v.store.hold, cx = p.pos.x + p.width / 2;
  VINES2.forEach((def, i) => {
    const d = v.defs[i], b = v.burn[i];
    // (gone: grown back a while after, when he's not hanging about right by it)
    if (b && b.gone > 0) {
      b.gone++;
      if (b.gone > REGROW && (Math.abs(cx - def.x) > 500 || b.gone > REGROW * 2)) { v.burn[i] = null; d.y = def.y; d.len = def.len; v.store.vines[i] = { th: 0, om: 0 }; }
      return;
    }
    if (!def.fuse) return;
    // (taken hold of: it catches, at the tip)
    if (h.on === i && !b) { v.burn[i] = { t: 0, s: h.s, gone: 0 }; playSound('ignite', 0.7, 6); playSound('sizzle', 0.5, 4); return; }
    if (!b) return;
    b.t++;
    if (h.on === i) b.s = h.s;
    const k = Math.min(1, b.t / def.fuse);
    // (the burnt part below the flame: gone; the vine's as long as the flame's got to)
    const front = def.len - (def.len - b.s) * k;
    d.len = Math.max(b.s + 4, front);
    if (b.t % 20 === 0 && heard(state, def.x)) playSound('sizzle', 0.3, 8 + k * 6);
    if (b.t >= def.fuse) {
      // (snapped: he drops; the rest of it goes up)
      const tip = { x: d.x + Math.sin(v.store.vines[i]?.th ?? 0) * b.s, y: d.y + Math.cos(v.store.vines[i]?.th ?? 0) * b.s };
      for (let n = 0; n < 16; n++) state.particles.push({ pos: { x: tip.x + (Math.random() - 0.5) * 10, y: tip.y - Math.random() * b.s }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 30, color: FIRE[1 + (n % 4)], size: 2 + Math.random() * 3 });
      playSound('crack', 0.9, 4); playSound('ignite', 0.6, -4);
      if (h.on === i) { p.dropVine = true; onSnap(); }
      b.gone = 1; d.y = AWAY;
    }
  });
  return updateVines(ctx, v.defs, c, optsOf(v));
};
/** He's on one. */
export const onVine2 = (state: GameState, v: Vines2) => onVine(state, optsOf(v));

/** World space, behind him: the beams they hang off, the vines, the flame climbing the burning ones (and a thin
 *  wisp off the tips of the ones with a fuse that haven't caught: they're soaked in tanning oil, it says so). */
export const drawVines2 = (c: Ctx, state: GameState, v: Vines2) => {
  const f = state.frame, x0 = state.camera.x - 120, x1 = state.camera.x + W + 120;
  // (the beams: a burnt crossbeam stub each, dark (not a ledge), smoldering along its top)
  VINES2.forEach(def => {
    if (def.x < x0 || def.x > x1) return;
    const y = def.y;
    c.fillStyle = '#0A0604'; c.fillRect(Math.round(def.x - 46), Math.round(y - 14), 92, 14);
    c.fillStyle = '#2A1A12'; c.fillRect(Math.round(def.x - 44), Math.round(y - 12), 88, 10);
    c.fillStyle = '#1A100A'; c.fillRect(Math.round(def.x - 44), Math.round(y - 5), 88, 3);
    for (let k = 0; k < 5; k++) if (((k + (f >> 4)) % 3) === 0) { c.fillStyle = FIRE[2]; c.fillRect(Math.round(def.x - 40 + k * 18), Math.round(y - 13), 4, 1); }
    // (a rope lashing round it where the vine's tied on)
    c.fillStyle = '#5A4A30'; c.fillRect(Math.round(def.x - 5), Math.round(y - 14), 10, 14); c.fillStyle = '#8A7448'; c.fillRect(Math.round(def.x - 5), Math.round(y - 14), 10, 2);
  });
  drawVines(c, state, v.defs, optsOf(v));
  // (the flames: the burning ones' tips, climbing)
  VINES2.forEach((def, i) => {
    if (def.x < x0 || def.x > x1) return;
    const b = v.burn[i], d = v.defs[i], run = v.store.vines[i] ?? { th: 0, om: 0 };
    if (b && b.gone > 0) return;
    if (b) {
      const tipX = d.x + Math.sin(run.th) * d.len, tipY = d.y + Math.cos(run.th) * d.len;
      // (the flame at the burning end, and a few licks up the vine above it, more as it nears his hands)
      const k = Math.min(1, b.t / (def.fuse ?? 1));
      flame(c, tipX, tipY + 10, 10, 24 + k * 14, f, i * 3);
      for (let n = 1; n <= 2 + Math.round(k * 3); n++) { const s = d.len - n * 14; if (s < 10) break; flame(c, d.x + Math.sin(run.th) * s, d.y + Math.cos(run.th) * s + 8, 7, 14 + k * 8, f, i * 3 + n); }
    } else if (def.fuse && f % 3 === 0 && Math.abs(state.camera.x + W / 2 - def.x) < 700) {
      // (oil-soaked: a wisp off its tip)
      const tipX = d.x + Math.sin(run.th) * d.len, tipY = d.y + Math.cos(run.th) * d.len;
      state.particles.push({ pos: { x: tipX, y: tipY }, vel: { x: 0, y: -0.5 }, life: 24, color: '#4A4252', size: 2 });
    }
  });
};
