// THE SWAYING STACK-TOWERS: Cartoon Land's new traversal mechanic (the spec's fill-in; the user will judge it). A
// storybook pile: a tall wobbly stack of lumpy tiers (striped drums, a teetering cake of them) with a flat lid on top,
// rooted at its foot. It leans under his weight toward the side he's standing on: stood on the lid's left half it
// tips left (the further out he stands, the further it goes), its right half right, dead center it holds (a nervous
// wobble). Off it, it springs back upright, wobbling. It's a moving platform: the lid carries him as it swings (out
// over a gap, across to the next tower, up and over a ride's path); the lid stays level enough to stand on (it tilts a
// little with the lean: drawn, never in the footing).
//
// THE TELL: every tier creaks and the stack visibly bends (the tiers slide over each other in a curve, the lid's lit
// lip tilts) before it's gone far; a groan when it hits its limit (it bounces off it); a swish as it swings back up.
// Its lid's lit along the top (standable reads standable); the stack under it is scenery (no standing on the tiers).
//
// How it's stood on: a one-way ledge the lid's width kept at the lid each frame, before he moves; on it, he's carried
// the lid's way. From under it, a jump-through. The cast don't use them.
//
// Every section can place them: makeTowers(state, defs) in build, updateTowers(ctx, list) first thing in update,
// drawTowers(c, state, list) in drawBack. towerTop(def, lean) is where the lid's middle is at a lean (put the landing
// it reaches at towerTop(def, ±def.lean)).

import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import type { Block } from '../../m1/types';
import { envSound } from '../bossQuiet';
import { INK, onScreen, hour, box, checker, ramp6, LIP, type Ctx } from './kit';

export interface TowerDef {
  /** Its foot's middle (world x) and the ground it's rooted in (y). */
  x: number; y: number;
  /** How tall, foot to the lid's top (px), and how wide the lid is. */
  h: number; w?: number;
  /** How far it can lean either way (radians; default 0.5). */
  lean?: number;
  /** Its colors (tiers in turn) and the lid's. */
  tiers?: string[]; lid?: string;
  /** Leans only one way (+1 right, -1 left): it won't go past upright the other way (a tower against a wall). */
  only?: 1 | -1;
  /** It stands in a pit (balls, slime): no grassy hummock at its foot (the section heaps its own stuff round it). */
  pit?: boolean;
}

export interface Tower {
  d: TowerDef;
  /** Its lean now (radians, + to the right) and how fast it's going. */
  ang: number; vel: number;
  /** He's on it (this frame); frames he's been on / off it. */
  on: boolean; onT: number; offT: number;
  b: Block;
  /** For its sounds: last frame's creak bucket, banged its limit. */
  creak: number; banged: boolean;
}

const AWAY = -99999;
const LID_H = 12;
export const DEFAULT_LEAN = 0.5;
/** How hard his weight pulls it toward where he stands; how much it's slowed (on it / springing back). */
const PULL = 0.0024, DAMP_ON = 0.07, DAMP_OFF = 0.045, BACK = 0.0021;

/** Where the lid's middle (its top, the walking surface) is at a lean. */
export const towerTop = (d: TowerDef, a: number) => ({ x: d.x + Math.sin(a) * d.h, y: d.y - Math.cos(a) * d.h });
export const lidW = (d: TowerDef) => d.w ?? 96;

export const makeTowers = (state: GameState, defs: TowerDef[]): Tower[] => defs.map((d, i) => {
  const t0 = towerTop(d, 0);
  const b: Block = { x: t0.x - lidW(d) / 2, y: t0.y, w: lidW(d), h: LID_H, type: 'platform', oneWay: true, hidden: true, tag: `ct-tower-${i}` } as Block;
  state.blocks.push(b);
  return { d, ang: 0, vel: 0, on: false, onT: 0, offT: 999, b, creak: 0, banged: false };
});

/** Is he stood on its lid (now)? */
export const onTower = (state: GameState, t: Tower) => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  return t.b.y !== AWAY && p.health > 0 && p.vel.y >= 0 && Math.abs(feet - t.b.y) <= 3 && cx >= t.b.x - 4 && cx <= t.b.x + t.b.w + 4;
};

/** Each frame, first thing in the section's update (before he moves): lean them, carry him on one, keep each lid's
 *  ledge where its lid is. */
export const updateTowers = (ctx: FrameContext, list: Tower[]) => {
  const { state } = ctx, p = state.player;
  for (const t of list) {
    const d = t.d, L = d.lean ?? DEFAULT_LEAN, half = lidW(d) / 2;
    const on = onTower(state, t);
    t.on = on;
    if (on) { t.onT++; t.offT = 0; } else { t.offT++; t.onT = 0; }
    const before = towerTop(d, t.ang);
    // (where he stands on it says which way it goes and how far: a little dead zone at the middle)
    let target = 0;
    if (on) {
      const u = Math.max(-1, Math.min(1, (p.pos.x + p.width / 2 - before.x) / half));
      const k = Math.abs(u) < 0.12 ? 0 : (u - Math.sign(u) * 0.12) / 0.88;
      target = k * L;
      t.vel += (target - t.ang) * PULL - t.vel * DAMP_ON;
      // (dead center: it can't settle; a nervous little wobble)
      if (k === 0) t.vel += Math.sin(state.frame * 0.21 + d.x) * 0.0004;
    } else t.vel += -t.ang * BACK - t.vel * DAMP_OFF;
    t.ang += t.vel;
    const lo = d.only === 1 ? 0 : -L, hi = d.only === -1 ? 0 : L;
    if (t.ang < lo || t.ang > hi) {
      t.ang = Math.max(lo, Math.min(hi, t.ang));
      // (it hits its limit: a bounce off it, a groan)
      if (!t.banged && Math.abs(t.vel) > 0.006) envSound(state, before.x, 'thud', 0.35, -14);
      t.vel = -t.vel * 0.3; t.banged = true;
    } else if (Math.abs(t.ang) < L * 0.8) t.banged = false;
    // (its creaks: one as it goes through each fifth of its lean)
    const bucket = Math.round((t.ang / L) * 5);
    if (bucket !== t.creak) { if (Math.abs(t.vel) > 0.004) envSound(state, before.x, bucket === 0 ? 'whoosh' : 'rumble', 0.22, 14 - Math.abs(bucket) * 3); t.creak = bucket; }
    const top = towerTop(d, t.ang);
    // (on it: carried with the lid)
    if (on) { p.pos.x += top.x - before.x; p.pos.y += top.y - before.y; }
    t.b.x = top.x - half; t.b.y = top.y; t.b.w = half * 2;
  }
};

/** Him on any of them (for a section that wants to know: a first-time line, say). */
export const ridingTower = (state: GameState, list: Tower[]) => list.find(t => t.on && onTower(state, t)) ?? null;

// ---------------------------------------------------------------------------------------------------------------
// Drawing (world space, behind him): the stack as lumpy tiers along a bending spine (the lean's mostly up top: it
// bends like a noodle), the lid on top, level-ish, lit along its top; a grassy hummock at its foot. Peak SNES: each tier
// stepped across (lit, highlight, shade, the dark rim, dithered where they meet), its stripes and sprinkles shaded with
// it, frosting drooping over the seams; the lid a frosted slab in steps, its lip lit.

const TIERS = ['#F472B6', '#FDE047', '#60A5FA', '#34D399', '#FB923C', '#C084FC'];
export const drawTowers = (c: Ctx, state: GameState, list: Tower[]) => {
  for (const t of list) {
    const d = t.d, top = towerTop(d, t.ang), half = lidW(d) / 2;
    if (!onScreen(state, Math.min(d.x, top.x) - half - 40, Math.max(d.x, top.x) + half + 40)) continue;
    const cols = (d.tiers ?? TIERS).map(col => hour(col));
    // (the spine: from the foot up, bending more the higher it goes, to the lid)
    const n = Math.max(4, Math.round(d.h / 44));
    const at = (u: number) => {
      const a = t.ang * Math.pow(u, 1.6);
      return { x: d.x + Math.sin(t.ang) * d.h * Math.pow(u, 1.6), y: d.y - d.h * u * (1 - (1 - Math.cos(t.ang)) * u), a };
    };
    // (the hummock at its foot: grass in steps, a clover or two)
    const G = ramp6(hour('#7FD45A'));
    if (!d.pit) {
    c.fillStyle = INK; c.beginPath(); c.ellipse(d.x, d.y + 2, 31, 11, 0, Math.PI, 0); c.fill();
    c.fillStyle = G[2]; c.beginPath(); c.ellipse(d.x, d.y + 2, 28, 9, 0, Math.PI, 0); c.fill();
    c.fillStyle = G[3]; c.beginPath(); c.ellipse(d.x - 3, d.y + 1, 21, 6.5, 0, Math.PI, 0); c.fill();
    c.fillStyle = G[4]; c.beginPath(); c.ellipse(d.x - 8, d.y, 10, 3.5, 0, Math.PI, 0); c.fill();
    checker(c, d.x - 24, d.y - 3, 48, 2, G[2], 0, 1);
    for (const [fx, fc] of [[-18, '#FFFFFF'], [15, '#F9A8D4']] as const) { box(c, d.x + fx, d.y - 4, 2, 2, fc); box(c, d.x + fx, d.y - 2, 1, 2, G[1]); }
    }
    // (the tiers: lumpy drums, each a little narrower or fatter than the last, alternating colors, each stepped across
    // (lit down its left, shaded down its right, dithered where the steps meet), candy stripes on some (shaded with it),
    // sprinkles on others, the frosting drooping over the seam onto the tier under it)
    for (let i = 0; i < n; i++) {
      const u0 = i / n, u1 = (i + 1) / n, p0 = at(u0), p1 = at(u1);
      const cx = (p0.x + p1.x) / 2, cy = (p0.y + p1.y) / 2, hh = Math.hypot(p1.x - p0.x, p1.y - p0.y) + 2;
      const ww = 34 + ((i * 37 + Math.round(d.x)) % 5) * 5 - i * 1.5;
      const col = cols[((Math.floor(i + Math.round(d.x / 97)) % cols.length) + cols.length) % cols.length], R = ramp6(col);
      c.save(); c.translate(cx, cy); c.rotate((p0.a + p1.a) / 2);
      const drum = () => { c.moveTo(-ww / 2, hh / 2); c.quadraticCurveTo(-ww / 2 - 6, 0, -ww / 2, -hh / 2); c.quadraticCurveTo(0, -hh / 2 - 5, ww / 2, -hh / 2); c.quadraticCurveTo(ww / 2 + 6, 0, ww / 2, hh / 2); c.quadraticCurveTo(0, hh / 2 + 5, -ww / 2, hh / 2); c.closePath(); };
      c.beginPath(); drum(); c.fillStyle = R[3]; c.fill();
      c.save(); c.beginPath(); drum(); c.clip();
      const X0 = -ww / 2 - 7, Y0 = -hh / 2 - 7, H0 = hh + 14;
      const kind = (i + Math.round(d.x / 53)) % 3;
      if (kind === 1) { c.fillStyle = 'rgba(255,250,252,0.78)'; for (let k = -ww; k < ww; k += 12) { c.beginPath(); c.moveTo(k, hh / 2 + 7); c.lineTo(k + 5, hh / 2 + 7); c.lineTo(k + 13, -hh / 2 - 7); c.lineTo(k + 8, -hh / 2 - 7); c.closePath(); c.fill(); } }
      else if (kind === 2) { const S = ['#FFFFFF', '#F472B6', '#60A5FA', '#FDE047', '#34D399']; for (let k = 0; k < 9; k++) { const sx = -ww / 2 + 4 + ((k * 11 + i * 7) % Math.max(6, ww - 8)), sy = -hh / 2 + 5 + ((k * 7 + i * 3) % Math.max(4, hh - 10)); c.fillStyle = S[(k + i) % 5]; c.fillRect(Math.round(sx), Math.round(sy), k % 2 ? 3 : 1, k % 2 ? 1 : 3); } }
      // (the shading over it all: lit band, highlight, the shade, the dark rim, each dithered off)
      c.fillStyle = 'rgba(255,255,255,0.26)'; c.fillRect(X0, Y0, ww * 0.3, H0); checker(c, X0 + ww * 0.3, Y0, 2, H0, 'rgba(255,255,255,0.26)', 0, 1);
      c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(X0 + 4, Y0, 3, H0);
      c.fillStyle = 'rgba(26,16,40,0.2)'; c.fillRect(ww * 0.14, Y0, ww, H0); checker(c, ww * 0.14 - 2, Y0, 2, H0, 'rgba(26,16,40,0.2)', 1, 1);
      c.fillStyle = 'rgba(26,16,40,0.24)'; c.fillRect(ww * 0.36, Y0, ww, H0); checker(c, ww * 0.36 - 2, Y0, 2, H0, 'rgba(26,16,40,0.24)', 0, 1);
      // (the tier's own top rim lit, its foot in shade)
      c.fillStyle = R[4]; c.fillRect(X0, -hh / 2 - 1, ww * 0.6 + 7, 2);
      c.fillStyle = R[1]; c.fillRect(X0, hh / 2 - 2, ww + 14, 3);
      c.restore();
      c.beginPath(); drum(); c.strokeStyle = INK; c.lineWidth = 3; c.lineJoin = 'round'; c.stroke();
      // (frosting drooped over its top edge, every other tier)
      if (i % 2 === 0 && i < n - 1) {
        const F = ramp6(hour('#FFF4FA'));
        c.fillStyle = INK; c.beginPath(); c.moveTo(-ww / 2 - 1, -hh / 2 - 1);
        for (let k = 0; k <= 6; k++) { const xx = -ww / 2 + (k / 6) * ww; c.quadraticCurveTo(xx - ww / 24, -hh / 2 + 6 + (k % 2) * 4, xx, -hh / 2 + 1); }
        c.lineTo(ww / 2 + 1, -hh / 2 - 4); c.lineTo(-ww / 2 - 1, -hh / 2 - 4); c.closePath(); c.fill();
        c.fillStyle = F[3]; c.beginPath(); c.moveTo(-ww / 2 + 1, -hh / 2 - 2);
        for (let k = 0; k <= 6; k++) { const xx = -ww / 2 + 1 + (k / 6) * (ww - 2); c.quadraticCurveTo(xx - ww / 24, -hh / 2 + 4 + (k % 2) * 4, xx, -hh / 2); }
        c.lineTo(ww / 2 - 1, -hh / 2 - 3); c.lineTo(-ww / 2 + 1, -hh / 2 - 3); c.closePath(); c.fill();
        c.fillStyle = F[5]; c.fillRect(-ww / 2 + 2, -hh / 2 - 2, ww * 0.4, 1);
        c.fillStyle = F[1]; c.fillRect(ww * 0.2, -hh / 2, ww * 0.26, 1);
      }
      c.restore();
    }
    // (the lid: a fat rounded slab of frosted cake, tilting a little with the lean: its top lit along the lip (where he
    // stands), its front face stepped, the shade under it, sprinkles along its edge)
    const tilt = t.ang * 0.3, L = ramp6(hour(d.lid ?? '#FFF7E8'));
    c.save(); c.translate(top.x, top.y); c.rotate(tilt);
    c.fillStyle = INK; c.beginPath(); c.roundRect(-half - 3, -3, half * 2 + 6, LID_H + 8, 7); c.fill();
    c.fillStyle = L[3]; c.beginPath(); c.roundRect(-half, 0, half * 2, LID_H + 2, 5); c.fill();
    c.fillStyle = L[4]; c.fillRect(-half + 3, 2, half * 2 - 6, 3);
    c.fillStyle = L[2]; c.fillRect(-half + 2, LID_H - 4, half * 2 - 4, 3);
    c.fillStyle = L[1]; c.fillRect(-half + 4, LID_H - 1, half * 2 - 8, 2);
    checker(c, -half + 2, LID_H - 6, half * 2 - 4, 2, L[2], 0, 1);
    c.fillStyle = L[5]; c.fillRect(-half + 1, 1, 3, LID_H - 3);
    c.fillStyle = L[1]; c.fillRect(half - 3, 2, 2, LID_H - 3);
    for (let k = -half + 8; k < half - 6; k += 11) { c.fillStyle = cols[(Math.floor(k / 11) + 9 + cols.length * 9) % cols.length] ?? cols[0]; c.fillRect(Math.round(k), 7 + (Math.floor(k) & 1) * 2, (k | 0) % 2 ? 3 : 1, (k | 0) % 2 ? 1 : 3); }
    // (the lit lip along the top)
    c.fillStyle = LIP[2]; c.fillRect(-half + 2, 0, half * 2 - 4, 2);
    c.fillStyle = LIP[3]; c.fillRect(-half + 6, 0, half - 4, 1);
    c.restore();
    // (the tell: bending, wobble lines off the sides; little puffs of dust off the tiers when it bangs its limit)
    if (Math.abs(t.vel) > 0.004) {
      c.strokeStyle = INK; c.lineWidth = 2; c.lineCap = 'round';
      const m = at(0.6), side = t.vel > 0 ? -1 : 1;
      for (let k = 0; k < 2; k++) { c.beginPath(); c.arc(m.x + side * (28 + k * 8), m.y, 8 + k * 6, side > 0 ? -0.6 : Math.PI - 0.6, side > 0 ? 0.6 : Math.PI + 0.6); c.stroke(); }
    }
  }
};
