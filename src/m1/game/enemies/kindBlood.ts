// Blood that isn't red (a game's own kinds that say what they bleed: see registerKind's `blood`; Meathead 2's aliens,
// Zorblax's green slime). The engine's gore is red all over (particles, pools, splats, stumps, wall pictures, a
// weapon's own stains), so rather than each of those knowing about aliens, the reds are turned to that kind's blood:
//   - the particles: any new red within reach of one of them (alive, dying, a body, or somewhere a system's marked
//     with markKindGore) gets a `tint`, the color it's drawn in; it's still blood to the engine (it arcs, splats,
//     sticks, the cartoon kills still sweep it up), just not red;
//   - what's drawn: bloodCtx hands back the canvas with every red set on it turned (a death of one drawn through it,
//     a weapon's corpse of one), so drawing code needn't change;
//   - anything painted pixel by pixel takes tintRed itself.
// (A machine's are scrap, not blood: machineGore. Meathead 1's drones still bleed red: that's kept on purpose.)

import type { GameState } from '../core/state';
import type { Enemy, Particle } from '../../types';
import { PARTICLE_PALETTES } from '../../constants';
import { kindDef, kindsBleedOther } from './kinds';

type Ctx = CanvasRenderingContext2D;

/** What a kind bleeds (its blood's base color), if it isn't red. */
export const bloodOf = (kind?: string | null): string | undefined => (kind ? kindDef(kind as never)?.blood : undefined);

// ---------------------------------------------------------------------------------------------------------------
// Turning a red

const parse = (c: string): [number, number, number, number] | null => {
  if (c[0] === '#') {
    if (c.length === 4) return [parseInt(c[1] + c[1], 16), parseInt(c[2] + c[2], 16), parseInt(c[3] + c[3], 16), 1];
    if (c.length >= 7) return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16), c.length === 9 ? parseInt(c.slice(7, 9), 16) / 255 : 1];
    return null;
  }
  if (c.startsWith('rgb')) { const m = c.match(/[\d.]+/g); if (m && m.length >= 3) return [+m[0], +m[1], +m[2], m.length > 3 ? +m[3] : 1]; }
  return null;
};
/** Blood-red (a deep red to a crimson, a rose, a pale pink of it): not an orange (flame), not a skin tone. */
const isRed = (r: number, g: number, b: number) => r >= 24
  && ((g <= r * 0.5 && b <= r * 0.6 && b >= g * 0.5 - 10) || (g <= r * 0.85 && g >= r * 0.3 && Math.abs(g - b) <= r * 0.12));

const turned = new Map<string, string>();
const hex2 = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
/**
 * `color` as `blood` would have it if it's a blood red (as dark, as pale, as see-through as it was); anything else as
 * it was.
 */
export const tintRed = (color: string, blood: string): string => {
  const key = blood + color;
  let out = turned.get(key);
  if (out !== undefined) return out;
  out = color;
  const c = parse(color), base = parse(blood);
  if (c && base && isRed(c[0], c[1], c[2])) {
    // (how bright a red it was, and how much white's in it: the same of the blood's own hue)
    const top = Math.max(1, base[0], base[1], base[2]);
    const v = c[0] / 255, w = Math.min(c[1], c[2]) / 255;
    const ch = (k: number) => (base[k] * 255 / top) * (v - w) + 255 * w;
    out = c[3] < 1 ? `rgba(${Math.round(ch(0))}, ${Math.round(ch(1))}, ${Math.round(ch(2))}, ${c[3]})` : `#${hex2(ch(0))}${hex2(ch(1))}${hex2(ch(2))}`;
  }
  if (turned.size > 4000) turned.clear();
  turned.set(key, out);
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawn

const proxies = new WeakMap<Ctx, Map<string, Ctx>>();
/**
 * The canvas to draw one of `kind`'s gore through: itself, for a kind that bleeds red; otherwise a stand-in for it that
 * turns every red set on it (fill, stroke, shadow) to the kind's blood. Made once per canvas and blood.
 */
export const bloodCtx = (ctx: Ctx, kind?: string | null): Ctx => {
  const blood = bloodOf(kind);
  return blood ? bloodCtxOf(ctx, blood) : ctx;
};
/** The same, by the blood itself (one carried along: a weapon's stains). */
export const bloodCtxOf = (ctx: Ctx, blood: string): Ctx => {
  let m = proxies.get(ctx);
  if (!m) { m = new Map(); proxies.set(ctx, m); }
  let p = m.get(blood);
  if (!p) {
    const fns = new Map<PropertyKey, unknown>();
    p = new Proxy(ctx, {
      get(t, k) {
        const v = Reflect.get(t, k, t);
        if (typeof v !== 'function') return v;
        let f = fns.get(k);
        if (!f) { f = (v as (...a: unknown[]) => unknown).bind(t); fns.set(k, f); }
        return f;
      },
      set(t, k, v) {
        if ((k === 'fillStyle' || k === 'strokeStyle' || k === 'shadowColor') && typeof v === 'string') v = tintRed(v, blood);
        return Reflect.set(t, k, v, t);
      },
    });
    m.set(blood, p);
  }
  return p;
};

// ---------------------------------------------------------------------------------------------------------------
// The particles

/** Tag one particle (made by a system that knows whose it is): drawn in `kind`'s blood if it's red. */
export const kindGore = <P extends Particle>(p: P, kind?: string | null): P => bloodGore(p, bloodOf(kind));
/** The same, by the blood itself (one carried along: a weapon's gore bag). */
export const bloodGore = <P extends Particle>(p: P, blood?: string | null): P => {
  if (blood && !p.tint) { const t = tintRed(p.color, blood); if (t !== p.color) p.tint = t; }
  return p;
};

const FIRE = new Set([...PARTICLE_PALETTES.FIRE, ...PARTICLE_PALETTES.MOLTEN]);
const checked = new WeakSet<Particle>();
/** Where one's out of the enemy list (held, being eaten, ground up) or its gore's thrown off from: a few frames. */
let recent: { x: number; y: number; w: number; h: number; blood: string; until: number }[] = [];
const dyingSeen = new WeakSet<Enemy>();
/** One of `kind`'s, out of the enemy list or flung somewhere: whatever red's thrown off round (x, y, w, h) over the
 *  next few frames is its blood. */
export const markKindGore = (state: GameState, kind: string | null | undefined, x: number, y: number, w: number, h: number, frames = 4) => {
  const blood = bloodOf(kind);
  if (blood) recent.push({ x, y, w, h, blood, until: state.frame + frames });
};

/** Every frame, before the particles move: any new red about one of them, in its own blood. */
export const tintKindGore = (state: GameState) => {
  // (no kind that bleeds anything but red (Meathead 1): nothing to do)
  if (!kindsBleedOther) return;
  const zones: { x0: number; y0: number; x1: number; y1: number; blood: string }[] = [];
  const zone = (x: number, y: number, w: number, h: number, pad: number, blood: string) => zones.push({ x0: x - pad, y0: y - pad, x1: x + w + pad, y1: y + h + pad, blood });
  for (const e of state.enemies) {
    const blood = bloodOf(e.kind);
    if (!blood) continue;
    const dead = e.health <= 0 || !!e.isBlownAway;
    zone(e.pos.x, e.pos.y, e.width, e.height, dead ? 70 : 30, blood);
    // (just killed: the gore of it still coming a while after it's gone from here)
    if (dead && !dyingSeen.has(e)) { dyingSeen.add(e); recent.push({ x: e.pos.x - 40, y: e.pos.y - 40, w: e.width + 80, h: e.height + 80, blood, until: state.frame + 30 }); }
  }
  for (const d of state.enemyDeaths) {
    const blood = bloodOf(d.sprite?.kind);
    if (!blood) continue;
    zone(d.x, d.y, d.w, d.h, 90, blood);
    // (its head, shot off and bouncing away, bleeding as it goes)
    if (d.head) zone(d.head.x, d.head.y, 0, 0, 30, blood);
  }
  if (recent.length) { recent = recent.filter(r => r.until >= state.frame); for (const r of recent) zone(r.x, r.y, r.w, r.h, 30, r.blood); }
  for (const p of state.particles) {
    if (checked.has(p)) continue;
    checked.add(p);
    if (!zones.length || p.tint || p.ownBlood || p.molten || p.isGlass || p.isWater || FIRE.has(p.color)) continue;
    const z = zones.find(q => p.pos.x > q.x0 && p.pos.x < q.x1 && p.pos.y > q.y0 && p.pos.y < q.y1);
    if (!z) continue;
    const t = tintRed(p.color, z.blood);
    if (t !== p.color) p.tint = t;
  }
};
