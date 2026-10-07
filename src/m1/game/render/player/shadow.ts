// Meathead's shadow: his own silhouette, whatever pose he's in (the outline pass's
// dark silhouette of him, the frame he's drawn in: nothing of him drawn twice),
// laid down flat on the ground from his feet, thrown away from the light that's on
// him (the nearest lamp that's lighting him, else the stage's sun, or straight down
// indoors), broken over stair treads and along slopes the way his feet are, and,
// where there's a real wall behind him that a light's throwing it onto, up the wall.
//
// It goes down under him (before he's stamped into the world), over the ground and
// the walls, under whatever's drawn in front of him.

import type { GameState } from '../../core/state';
import type { Block, Player } from '../../../types';
import { lightOn, type Light, type SceneLight } from '../lighting';
import { runAt, runYAt, treadYAt, type GroundRun } from '../../core/terrain';

export interface Rect { x: number; y: number; w: number; h: number; hole?: boolean }

/** Where his silhouette is: the image, and the rect it's drawn in about his feet (sprite units). */
export interface Silhouette { img: CanvasImageSource; x: number; y: number; w: number; h: number }

// What the world pass said about the stage last frame: its lights, the walls a shadow can go up, where its water is
// (noted after the lighting's worked out; a frame behind is nothing you'd see)
let noted: { stageId: string | null; scene: SceneLight | null; walls: Rect[]; water?: (x: number, y: number) => boolean } = { stageId: null, scene: null, walls: [] };
export const noteShadowStage = (stageId: string | null, scene: SceneLight | null | undefined, walls: Rect[] | undefined, water?: (x: number, y: number) => boolean) => {
  noted = { stageId, scene: scene && !scene.flat ? scene : null, walls: walls ?? [], water };
};

interface Sun { skew: number; squash: number; a: number }
/**
 * Out in the open, with no lamp on him: where each stage's sun (or moon) throws his shadow. `skew`: how far along the
 * ground it falls for his height (+ to the right); `squash`: how far down the ground it reaches; `a`: how dark.
 */
const SUN: Record<string, Sun> = {
  // (golden hour the whole way, the sun low behind him)
  'Drug Trade Dale': { skew: 1.1, squash: 0.24, a: 0.46 },
  // (the sun off to the right and low)
  'Toxic Tommy': { skew: -0.9, squash: 0.24, a: 0.4 },
  'Ernie Earthquake': { skew: 0.7, squash: 0.22, a: 0.38 },
  'Oily Oscar': { skew: 0.6, squash: 0.22, a: 0.4 },
  'Victor Volcano': { skew: 0.4, squash: 0.22, a: 0.36 },
  // (the moon off the snow)
  'Artie Avalanche': { skew: 0.45, squash: 0.22, a: 0.32 },
  // (overcast: soft, short, not much way to it)
  'Hector Hurricane': { skew: 0.2, squash: 0.2, a: 0.26 },
  'Blackout Barry': { skew: 0.3, squash: 0.2, a: 0.3 },
};
const OUTDOORS: Sun = { skew: 0.5, squash: 0.22, a: 0.36 };
/** Under a roof: the lights overhead, so it's pooled under him. */
const OVERHEAD: Sun = { skew: 0, squash: 0.14, a: 0.34 };

/** How long his shadow reaches up the ground for his height, flat out, and how dark a lamp's makes it. */
const LAMP_SQUASH = 0.22;
const MAX_SKEW = 1.6;
/** How high he can be off the ground and still throw a shadow on it. */
const AIR = 320;
/** His silhouette's reach about his feet (sprite units), for working out where its shadow lands. */
const REACH_X = 56, REACH_UP = 112;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// (eased from frame to frame, so it swings round as he walks past a lamp rather than jumping)
const eased = { skew: 0, squash: 0.15, a: 0.3, frame: -99, stageId: null as string | null };

/** Is there a roof over him (anything solid not far over his head)? */
const underRoof = (blocks: Block[], x: number, top: number) => {
  for (const b of blocks) {
    if (b.type === 'pit' || b.oneWay || x < b.x || x > b.x + b.w) continue;
    const bottom = b.y + b.h;
    if (bottom <= top && bottom > top - 420) return true;
  }
  return false;
};

/** Which way the light throws his shadow, how far, and how dark; and the lamp that's doing it, if one is. */
const lightOnHim = (state: GameState, x: number, feet: number, indoors: boolean) => {
  const sc = noted.scene;
  const dark = sc?.dark ?? 0;
  const sun = indoors ? OVERHEAD : SUN[noted.stageId ?? ''] ?? OUTDOORS;
  // (at night there's no sun to speak of: what light there is is all round, and his shadow's a faint pool under him)
  const night = clamp(1 - dark * 1.5, 0, 1);
  let skew = sun.skew * night, squash = sun.squash, a = sun.a * clamp(1 - dark * 1.1, 0.55, 1);
  let lamp: Light | null = null, on = 0, w = 0;
  if (sc) {
    for (const l of sc.lights) {
      // (taken low on him: a lamp's cone is narrow up by its head, and it's on the ground round him his shadow's thrown)
      const k = lightOn(l, x, feet - 12);
      if (k > on) { on = k; lamp = l; }
    }
  }
  if (lamp && on > 0.05) {
    // (how much this lamp's what he's lit by: in broad daylight one hardly matters)
    w = clamp((on - 0.05) / 0.35, 0, 1) * Math.min(1, 0.35 + dark * 1.6);
    const over = feet - lamp.y;
    // (one down at his feet or below, lava say, throws nothing on the ground: only up a wall)
    const ground = over > 20 ? w : 0;
    const ls = clamp((x - lamp.x) / Math.max(over, 60), -MAX_SKEW, MAX_SKEW);
    skew += (ls - skew) * ground;
    squash += (LAMP_SQUASH - squash) * ground;
    a += (0.4 + 0.3 * Math.min(1, on) - a) * ground;
  }
  // (how much it's what's lighting him indoors, for a wall: as much as there's light on him from it)
  const wall = lamp ? clamp((on - 0.05) / 0.3, 0, 1) : 0;
  return { skew, squash, a, lamp: wall > 0.05 ? lamp : null, w, wall };
};

/** What he's stood on at one spot: a run (one tread of it, if it's stairs) or a block's top; the line through it. */
interface Surf { run?: GroundRun; tread: number; y: number; slope: number; ys: number; thin?: boolean }
const same = (a: Surf, b: Surf) => a.run === b.run && a.tread === b.tread && (!!a.run || a.y === b.y);

/**
 * The ground along from x0 to x1 near the level gy (stairs and slopes as they're drawn, a crate or a ledge on it as
 * it is), null where there's none (a pit, the ground well below, or a wall in the way). `ax`: where the line through a
 * slope is taken from.
 */
const groundSampler = (state: GameState, ax: number, gy: number, x0: number, x1: number) => {
  const near: Block[] = [];
  for (const b of state.blocks) {
    if (b.type === 'pit' || b.type === 'door' || b.x > x1 || b.x + b.w < x0 || b.y > gy + 48 || b.y + b.h < gy - 30) continue;
    // (an invisible barrier isn't anything to throw a shadow on)
    if (b.hidden && b.type !== 'ground' && b.h >= 800) continue;
    near.push(b);
  }
  let nr: GroundRun | undefined;
  return (x: number): Surf | null => {
    let best: Surf | null = null;
    const r = runAt(state.groundRuns, x, nr);
    if (r) {
      const y = treadYAt(r, x);
      if (y >= gy - 30 && y <= gy + 48) {
        nr = r;
        if (r.steps) {
          const n = r.steps.n, k = clamp(Math.floor(((x - r.x1) / (r.x2 - r.x1)) * n), 0, n - 1);
          best = { run: r, tread: k, y, slope: 0, ys: y };
        } else {
          const slope = r.x2 === r.x1 ? 0 : (r.y2 - r.y1) / (r.x2 - r.x1);
          best = { run: r, tread: -1, y, slope, ys: runYAt(r, ax) };
        }
      }
    }
    for (const b of near) {
      if (x < b.x || x > b.x + b.w) continue;
      // (the run's own collision steps: the run's already said where its ground is)
      if (r && b.hidden && b.type === 'ground') continue;
      if (b.y < gy - 30) { if (b.oneWay) continue; return null; }
      // (`thin`: a desk, a cubicle, a ledge: only its top's for standing on, its front's not the floor)
      if (!best || b.y < best.y) best = { tread: -1, y: b.y, slope: 0, ys: b.y, thin: !!b.oneWay || b.type === 'platform' };
    }
    return best;
  };
};

/** The ground right under his middle, from his feet down (Infinity if there's none within reach). */
const groundUnder = (state: GameState, x: number, feetY: number) => {
  let gy = Infinity, top = Infinity;
  for (const b of state.blocks) {
    if (b.type === 'pit' || b.type === 'door' || x < b.x || x > b.x + b.w || b.y < feetY - 4) continue;
    gy = Math.min(gy, b.y);
    // (a block of its own, not one of a run's collision steps)
    if (!(b.hidden && b.type === 'ground')) top = Math.min(top, b.y);
  }
  const r = runAt(state.groundRuns, x);
  let ry = Infinity;
  if (r) { const y = treadYAt(r, x); if (y >= feetY - 4 && y < gy + 30) { ry = y; gy = Math.min(gy, y); } }
  // (stood on a block (a desk, a cubicle, a crate, a ledge) rather than the ground or stairs: its top, else Infinity)
  const block = top <= gy + 0.5 && top < ry - 2 ? top : Infinity;
  return { gy, block };
};

/** A soft dark pool right under his feet (laid along the ground the way it goes under him, over each tread). */
const drawContact = (ctx: CanvasRenderingContext2D, cx: number, w: number, hh: number, alpha: number, at: (x: number) => Surf | null) => {
  ctx.save();
  if (ctx.filter && ctx.filter !== 'none') ctx.filter = 'none';
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  for (let x = Math.floor((cx - w) / 2) * 2; x < cx + w; x += 2) {
    const d = (x + 1 - cx) / w;
    if (Math.abs(d) >= 1) continue;
    const s = at(x + 1);
    if (!s) continue;
    const half = hh * Math.sqrt(1 - d * d);
    ctx.rect(x, s.y - half, 2, half * 2);
  }
  ctx.fill();
  ctx.restore();
};

/**
 * His shadow, drawn under him: the soft pool under his feet, and, given his silhouette (`sil`, the frame he's in,
 * feet at (ax, ay)), its shadow thrown on the ground and up any wall behind him. Without `sil` (no sprite pass, a
 * vehicle drawn by the stage), just the pool.
 */
export const drawPlayerShadow = (ctx: CanvasRenderingContext2D, p: Player, state: GameState, ax: number, ay: number, sil: Silhouette | null) => {
  const feetY = p.pos.y + p.height;
  if (p.swimming) return;
  const { gy, block: standTop } = groundUnder(state, ax, feetY);
  const h = p.isGrounded ? 0 : Math.max(0, gy - feetY);
  if (!isFinite(gy) || h > AIR) return;
  // (nothing on water: it's not something you'd see one on)
  if (noted.water?.(ax, gy - 2)) return;
  const k = 1 - h / AIR;

  // (the ground anywhere his shadow could reach, looked along once)
  const far = REACH_X + MAX_SKEW * REACH_UP + 124;
  const at = groundSampler(state, ax, gy, ax - far, ax + far);
  drawContact(ctx, ax, p.width * 0.6 * (0.5 + 0.5 * k), 4.5 * (0.5 + 0.5 * k), (sil ? 0.24 : 0.35) * k, at);
  if (!sil) return;

  // How the light's falling on him (eased frame to frame)
  const L = lightOnHim(state, ax, ay, underRoof(state.blocks, ax, p.pos.y));
  if (eased.stageId !== state.stageId || Math.abs(state.frame - eased.frame) > 3) Object.assign(eased, { skew: L.skew, squash: L.squash, a: L.a });
  else if (eased.frame !== state.frame) {
    eased.skew += (L.skew - eased.skew) * 0.2;
    eased.squash += (L.squash - eased.squash) * 0.2;
    eased.a += (L.a - eased.a) * 0.2;
  }
  eased.frame = state.frame; eased.stageId = state.stageId;
  const { skew, squash } = eased;

  // Where it lands: up in the air it comes away from under him along the light, smaller and fainter
  const dx = clamp(h * skew, -120, 120), sk = 0.55 + 0.45 * k;
  const ends = [ax + dx - REACH_X * sk, ax + dx + REACH_X * sk, ax + dx + (skew * REACH_UP - REACH_X) * sk, ax + dx + (skew * REACH_UP + REACH_X) * sk];
  const x0 = Math.min(...ends) - 2, x1 = Math.max(...ends) + 2;

  const hurtFilter = ctx.filter && ctx.filter !== 'none';

  // On the ground: his silhouette laid down flat from his feet, run along the ground in stretches (one per tread on
  // stairs, one along a slope), each put down on the ground it's on
  const segs: { s: Surf; x0: number; x1: number }[] = [];
  const STEP = 3;
  for (let x = x0; x < x1; x += STEP) {
    const s = at(x + STEP / 2);
    const last = segs[segs.length - 1];
    if (!s) continue;
    if (last && last.x1 >= x - 0.01 && same(last.s, s)) { last.x1 = x + STEP; continue; }
    let from = x;
    // (where one tread gives way to the next: right on its edge, not wherever the look along happened to land)
    if (last && last.x1 >= x - 0.01 && s.run && s.run === last.s.run && s.run.steps) {
      const r = s.run;
      from = r.x1 + Math.max(s.tread, last.s.tread) * ((r.x2 - r.x1) / r.steps!.n);
      last.x1 = from;
    }
    segs.push({ s, x0: from, x1: x + STEP });
  }
  const alpha = eased.a * k * k;
  if (segs.length && alpha > 0.01) {
    const whole = segs.length === 1 && !segs[0].s.thin && segs[0].x0 <= x0 + 0.01 && segs[0].x1 >= x1 - 0.01;
    for (const g of segs) {
      const { s } = g;
      ctx.save();
      if (hurtFilter) ctx.filter = 'none';
      if (!whole) {
        const top = Math.min(s.y, s.ys + s.slope * (g.x0 - ax), s.ys + s.slope * (g.x1 - ax));
        // (a stair's tread: just along its top, the shadow lying on it; it's only the floor under him it reaches down)
        const deep = s.run?.steps || s.thin ? 7 : 90 + Math.abs(s.slope) * (g.x1 - g.x0);
        ctx.beginPath(); ctx.rect(g.x0, top - 3, g.x1 - g.x0, deep + 3); ctx.clip();
      }
      // (a stair tread's only a thin strip of it: darker, so it still reads)
      ctx.globalAlpha *= s.run?.steps || s.thin ? Math.min(0.75, alpha * 1.5) : alpha;
      // (sprite to world: x along the ground plus the throw for its height; down the ground for its height; along the slope)
      ctx.transform(sk, s.slope * sk, -sk * skew, -sk * (s.slope * skew + squash), ax + dx, s.ys + s.slope * dx);
      ctx.drawImage(sil.img, sil.x, sil.y, sil.w, sil.h);
      ctx.restore();
    }
  }

  // Up a wall behind him, where there's a real one and a lamp in front of him throwing it there: bigger the nearer
  // the lamp, thrown away from it, only on the wall
  const lamp = L.lamp;
  if (lamp && noted.walls.length) {
    const dist = Math.hypot(ax - lamp.x, ay - 40 - lamp.y);
    const m = 1.15 + 0.45 * clamp(1 - dist / Math.max(lamp.r, 1), 0, 1);
    // (thrown from about the height of him, whatever height the lamp's at: a lamp up in the ceiling in front of him
    // would put it all down the floor, where it's lost; this way it's up the wall behind him, where it reads)
    const cy = clamp(lamp.y, ay - 90, ay - 30);
    const e = lamp.x + (ax - lamp.x) * m, f = cy + (ay - cy) * m;
    const bx0 = e - REACH_X * m, bx1 = e + REACH_X * m, by0 = f - REACH_UP * m;
    // (stood on a block in front of the wall: none of it below that block's top, which hides the wall there; on the
    // ground or stairs, down to the foot of the wall)
    const by1 = Math.min(f + 4, standTop);
    let any = false;
    for (const r of noted.walls) {
      if (r.hole || r.x > bx1 || r.x + r.w < bx0 || r.y > by1 || r.y + r.h < by0) continue;
      if (!any) { ctx.save(); if (hurtFilter) ctx.filter = 'none'; ctx.beginPath(); any = true; }
      ctx.rect(r.x, r.y, r.w, Math.min(r.y + r.h, by1) - r.y);
    }
    if (any) {
      ctx.clip();
      // Not on the windows in it, nor on anything stood in front of it (a desk, a cubicle, a shelf, a crate, somebody):
      // each cut out on its own, so two that overlap don't cancel out. A platform's only its top for standing on: what
      // it is (a desk, a cubicle) goes on down under it, in front of the wall
      // (the cut kept inside the frame it's cut from: any of it sticking out past the frame would count as inside it)
      const fx0 = bx0 - 4, fy0 = by0 - 4, fx1 = bx1 + 4, fy1 = by1 + 4;
      const cut = (x: number, y: number, w: number, h: number) => {
        const x0 = Math.max(x, fx0), y0 = Math.max(y, fy0), x1 = Math.min(x + w, fx1), y1 = Math.min(y + h, fy1);
        if (x1 <= x0 || y1 <= y0) return;
        ctx.beginPath(); ctx.rect(fx0, fy0, fx1 - fx0, fy1 - fy0); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip('evenodd');
      };
      for (const r of noted.walls) if (r.hole) cut(r.x, r.y, r.w, r.h);
      for (const b of state.blocks) {
        if (b.type === 'pit' || b.type === 'door' || (b.hidden && b.h >= 800)) continue;
        if (b.x > bx1 || b.x + b.w < bx0 || b.y > by1 || b.y + b.h < by0) continue;
        let h = b.h;
        // (a desk or a cubicle stood on the floor, not a shelf or a gantry hung up high: down to the floor under it)
        if (b.oneWay || b.type === 'platform' || b.h < 80) {
          const mid = b.x + b.w / 2, floor = groundUnder(state, mid, b.y + b.h + 1).gy;
          if (floor - b.y < 140) h = Math.max(h, floor - b.y);
        }
        cut(b.x, b.y, b.w, h);
      }
      for (const en of state.enemies) cut(en.pos.x, en.pos.y, en.width, en.height);
      ctx.globalAlpha *= 0.42 * L.wall * k;
      ctx.transform(m, 0, 0, m, e, f);
      ctx.drawImage(sil.img, sil.x, sil.y, sil.w, sil.h);
      ctx.restore();
    }
  }
};
