// THE TIKI TOWERS: Cartoon Land's SWAYING STACK-TOWERS (cartoon/sway.ts: stood on, it leans toward the side he's on,
// carrying him on its lid; off, it springs back up, wobbling), as the lazy river's ride: a bamboo pole stood up on a
// rock in the river, a stack of pool floats threaded on it (inner tubes, a pool noodle bundle, a swim ring), a foam
// lounger on top to stand on (its lit top edge). And they burn: he lands, it catches, the longer he's on it the
// further it goes (off it, lit, a third of the pace):
//
//   'base'  from the foot up (the tubes at the bottom melting, then the flames climbing), and when it's through, the
//           stack gives way at the foot and the whole thing goes over into the river
//   'top'   from the lid down (shorter: the lounger's alight under his feet, the tubes under it melting): through, the
//           top half folds over and drops
//
// Each stage reads (the same steps as the logs: CATCH smoke, SMOLDER charring and glowing, FLAMES, CRUMBLE shaking and
// sagging), and a fair window from the flames to the fall. Gone, a fresh one's run up out of the river on its pole a
// while after (the ride resetting: up out of the water, never out of thin air).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { makeTowers, updateTowers, towerTop, lidW, onTower, type Tower } from '../../cartoon/sway';
import { heard } from '../../bossQuiet';
import { stamp } from '../../../m1/game/render/stamp';
import { checker } from '../../intro/art/kit';
import { CANVAS_WIDTH as W } from '../../../m1/constants';
import { mix as mixRaw } from '../../intro/art/kit';
import { TOWERS2, waterY } from './geo';
import { fireRow, flame, FIRE, bootsOn } from './fire';

type Ctx = CanvasRenderingContext2D;
const AWAY = -99999;
/** (the mixes asked for every frame, a few hundred of them: each worked out the once, kept; the char's steps rounded) */
const MIXES = new Map<string, string>();
const mix = (a: string, b: string, k: number) => { const q = Math.round(k * 16) / 16, key = `${a}${b}${q}`; let v = MIXES.get(key); if (!v) { v = mixRaw(a, b, q); MIXES.set(key, v); } return v; };
const BACK = 360, RISE = 70, FALL = 46;

export interface Tower2Run { i: number; t: Tower; burn: number; lit: boolean; fall: number; dir: number; gone: number; rise: number }
export const buildTowers2 = (state: GameState): Tower2Run[] => {
  const list = makeTowers(state, TOWERS2.map(d => ({ x: d.x, y: waterY(d.x), h: d.h, w: 92, lean: d.lean ?? 0.42 })));
  return list.map((t, i) => ({ i, t, burn: 0, lit: false, fall: 0, dir: 1, gone: 0, rise: 0 }));
};
export const towerStage = (r: Tower2Run) => { const k = r.burn / TOWERS2[r.i].fuse; return { k, stage: !r.lit ? 'whole' : k < 0.2 ? 'catch' : k < 0.5 ? 'smolder' : k < 0.85 ? 'flames' : 'crumble' }; };

/** A frame of them, first thing (before he moves). `onFall`: one went over with him on it. */
export const updateTowers2 = (ctx: FrameContext, list: Tower2Run[], onFall: () => void) => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2;
  const live: Tower[] = [];
  for (const r of list) {
    const d = TOWERS2[r.i], t = r.t;
    if (r.gone) {
      r.gone++;
      // (a fresh one run up out of the river (not while he's right by it: he'd be stood on air))
      if (r.gone > BACK && (Math.abs(cx - d.x) > 260 || r.gone > BACK * 2)) { r.gone = 0; r.rise = 1; r.burn = 0; r.lit = false; r.fall = 0; t.ang = 0; t.vel = 0; if (heard(state, d.x)) playSound('rumble', 0.5, -6); }
      continue;
    }
    if (r.rise) { r.rise++; if (r.rise > RISE) r.rise = 0; else { t.b.y = AWAY; continue; } }
    if (r.fall) {
      // (going over: the lean running away with it, faster and faster, then down into the river)
      r.fall++;
      t.ang += r.dir * (0.01 + r.fall * 0.0022);
      t.b.y = AWAY;
      if (r.fall === 30 && heard(state, d.x)) { playSound('ignite', 0.8, -10); for (let n = 0; n < 20; n++) state.particles.push({ pos: { x: d.x + r.dir * d.h * 0.7 + (Math.random() - 0.5) * 60, y: waterY(d.x) - 6 }, vel: { x: (Math.random() - 0.5) * 5, y: -2 - Math.random() * 5 }, life: 30, color: FIRE[1 + (n % 4)], size: 3 + Math.random() * 3 }); }
      if (r.fall > FALL) { r.gone = 1; r.fall = 0; }
      continue;
    }
    live.push(t);
  }
  updateTowers(ctx, live);
  for (const r of list) {
    if (r.gone || r.fall || r.rise) continue;
    const d = TOWERS2[r.i], on = r.t.on && onTower(state, r.t) && p.health > 0;
    if (on && !r.lit) { r.lit = true; playSound('ignite', 0.6, 4); }
    if (r.lit) r.burn += on ? 1 : 0.35;
    const { k } = towerStage(r);
    if (r.lit && state.frame % 26 === 0 && heard(state, d.x)) playSound('sizzle', 0.25 + k * 0.4, 2);
    if (k >= 1) {
      // (through: it goes, the way it's leaning (or away from him))
      r.fall = 1; r.dir = Math.abs(r.t.ang) > 0.05 ? Math.sign(r.t.ang) : (cx < d.x ? 1 : -1);
      playSound('crack', 1, -6); playSound('crumble', 0.8, -4);
      shakeScreen(state, on ? 8 : 3, 3);
      r.t.b.y = AWAY;
      if (on) { p.isGrounded = false; p.vel.y = 0.5; onFall(); }
    }
  }
};
/** He's on one. */
export const onTower2 = (state: GameState, list: Tower2Run[]) => list.some(r => !r.gone && !r.fall && !r.rise && onTower(state, r.t));

// ---------------------------------------------------------------------------------------------------------------
// Drawing (world space, behind him): the rock it's stood on, the pole, the floats up it along the bending spine
// (Cartoon Land's noodle bend), the lounger on top; charred and burning in its stage

/** The rock a tower's stood on: a lump in its steps, lit up its left by the moon, warm along its foot off the lava,
 *  cracked, dithered at its seams (`v` one of three shapes). */
const paintRock = (g: Ctx, v: number) => {
  const w = [34, 30, 38][v], h = [14, 16, 12][v];
  const E = (x: number, y: number, rx: number, ry: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, Math.PI, 0); g.fill(); };
  E(0, 2, w, h, INK); E(0, 2, w - 3, h - 2, ROCK[1]); E(-3, 2, w - 8, h - 4, ROCK[2]); E(-9, 1, w * 0.5, h * 0.55, ROCK[3]);
  checker(g, -w + 4, -h * 0.5, w * 1.6, 3, ROCK[1]);
  g.fillStyle = INK; g.fillRect(4 + v * 3, -h + 4, 1, 6); g.fillRect(5 + v * 3, -h + 9, 4, 1);
  g.fillStyle = '#C2410C'; g.fillRect(-w + 4, 0, w * 2 - 8, 2); g.fillStyle = '#7C2D12'; checker(g, -w + 6, -3, w * 2 - 12, 3, '#7C2D12');
};
/** An inner tube, baked (its own canvas, not a stamp: it's drawn turned with the tower's lean): `ci` its plastic, `cs`
 *  how charred (0..4), `rw` its half width; painted at a nominal half height TUBE_RH (squashed to fit when drawn).
 *  The plastic in five steps (the shade under, the body, the lit band, the shine up top-left), each step's edge
 *  dithered; the dark of the hole where the pole goes through; the valve stem; charred, the color sunk toward black
 *  in a dithered char, a melted drip, embers. */
const TUBE_RH = 9;
const TUBES = new Map<string, HTMLCanvasElement>();
const tubeImg = (ci: number, cs: number, rw: number) => {
  const key = `${ci}-${cs}-${rw}`;
  let cv = TUBES.get(key);
  if (cv) return cv;
  cv = document.createElement('canvas'); cv.width = rw * 2 + 6; cv.height = TUBE_RH * 2 + 6;
  const g = cv.getContext('2d')!, ox = rw + 3, oy = TUBE_RH + 3, k = cs / 4;
  const base = FLOATS[ci], ramp = [mix(base, INK, 0.62), mix(base, INK, 0.35), base, mix(base, '#FFFFFF', 0.3), mix(base, '#FFFFFF', 0.7)].map(q => mix(q, '#120806', k * 0.85));
  const E = (x: number, y: number, rx: number, ry: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(ox + x, oy + y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2); g.fill(); };
  E(0, 0, rw + 2, TUBE_RH + 2, INK);
  E(0, 0, rw, TUBE_RH, ramp[0]);
  E(-1, -1, rw - 2, TUBE_RH - 2, ramp[1]);
  E(-2, -2, rw - 5, TUBE_RH - 4, ramp[2]);
  E(-rw * 0.3, -4, rw * 0.45, 2.5, ramp[3]);
  // (the steps' edges dithered: every other pixel of the step under it, along each band's foot)
  const id = g.getImageData(0, 0, cv.width, cv.height), px = id.data;
  for (let y = 1; y < cv.height - 1; y++) for (let x = 1; x < cv.width - 1; x++) {
    if ((x + y) % 2) continue;
    const i = (y * cv.width + x) * 4, j = ((y + 1) * cv.width + x) * 4;
    if (px[i + 3] && px[j + 3] && (px[i] !== px[j] || px[i + 1] !== px[j + 1] || px[i + 2] !== px[j + 2])) { px[i] = px[j]; px[i + 1] = px[j + 1]; px[i + 2] = px[j + 2]; }
  }
  g.putImageData(id, 0, 0);
  // (the shine: a short bright streak and a fleck, up top-left)
  g.fillStyle = ramp[4]; g.fillRect(ox - rw * 0.55, oy - TUBE_RH + 2, rw * 0.35, 1); g.fillRect(ox - rw * 0.15, oy - TUBE_RH + 2, 2, 1);
  // (the hole the pole's through: dark, its far rim lit)
  E(0, -2, 6, 2.5, INK); g.fillStyle = ramp[1]; g.fillRect(ox - 4, oy - 5, 8, 1);
  // (a seam round it)
  g.fillStyle = ramp[1]; for (let x = -rw + 4; x < rw - 4; x += 3) g.fillRect(ox + x, oy + 3, 2, 1);
  if (cs < 2) { g.fillStyle = INK; g.fillRect(ox + rw * 0.5, oy - 3, 4, 4); g.fillStyle = '#52525B'; g.fillRect(ox + rw * 0.5 + 1, oy - 2, 2, 2); }
  if (cs >= 1) {
    // (char: black blotches dithered in, the worse the more of them; a melted drip; embers in the char)
    for (let n = 0; n < cs * 9; n++) { const x = ox - rw + 3 + ((n * 37) % (rw * 2 - 6)), y = oy - TUBE_RH + 3 + ((n * 13) % (TUBE_RH * 2 - 6)); if (Math.hypot((x - ox) / rw, (y - oy) / TUBE_RH) < 0.9) { g.fillStyle = n % 3 ? '#120806' : '#2A120A'; g.fillRect(x, y, 2, 1); } }
    g.fillStyle = '#1A0A06'; g.fillRect(ox - rw * 0.3, oy + TUBE_RH - 2, 3, 3 + cs);
    if (cs >= 2) { g.fillStyle = FIRE[2]; for (let n = 0; n < cs * 2; n++) g.fillRect(ox - rw * 0.6 + ((n * 23) % (rw * 1.2)), oy - 2 + (n % 3) * 2, 1, 1); }
  }
  TUBES.set(key, cv);
  return cv;
};
/** The lounger on top, baked: foam in its ramp, banded, slats, the lit lip along its top (stood on); charred in steps. */
const LOUNGERS = new Map<string, HTMLCanvasElement>();
const loungerImg = (cs: number, half: number) => {
  const key = `${cs}-${half}`;
  let cv = LOUNGERS.get(key);
  if (cv) return cv;
  cv = document.createElement('canvas'); cv.width = Math.round(half * 2 + 6); cv.height = 18;
  const g = cv.getContext('2d')!, k = cs / 4, w = half * 2;
  const Lr = ['#075985', '#0284C7', '#0EA5E9', '#38BDF8', '#BAE6FD', '#F0F9FF'].map(q => mix(q, '#120806', k * 0.82));
  g.fillStyle = INK; g.beginPath(); g.roundRect(0, 0, w + 6, 18, 6); g.fill();
  g.fillStyle = Lr[1]; g.beginPath(); g.roundRect(3, 3, w, 13, 5); g.fill();
  g.fillStyle = Lr[2]; g.fillRect(5, 4, w - 4, 7);
  g.fillStyle = Lr[3]; g.fillRect(6, 4, w - 6, 3);
  checker(g, 5, 10, w - 4, 2, Lr[1]); checker(g, 6, 6, w - 6, 1, Lr[2]);
  g.fillStyle = Lr[0]; g.fillRect(5, 13, w - 4, 2);
  for (let x = 13; x < w - 3; x += 16) { g.fillStyle = Lr[0]; g.fillRect(x, 4, 2, 11); g.fillStyle = Lr[3]; g.fillRect(x + 2, 4, 1, 9); }
  // (the lit lip along its top)
  g.fillStyle = Lr[4]; g.fillRect(5, 3, w - 4, 2); g.fillStyle = Lr[5]; g.fillRect(10, 3, w * 0.4, 1);
  if (cs >= 1) for (let n = 0; n < cs * 8; n++) { g.fillStyle = n % 3 ? '#120806' : '#2A120A'; g.fillRect(6 + ((n * 29) % (w - 8)), 5 + ((n * 7) % 9), 2, 1); }
  LOUNGERS.set(key, cv);
  return cv;
};
const FLOATS = ['#EC4899', '#22D3EE', '#FACC15', '#A3E635', '#F97316', '#A78BFA'];
const ROCK = ['#1A1410', '#2E2620', '#463A30', '#5E5044'];
const INK = '#0A0604';
export const drawTowers2 = (c: Ctx, state: GameState, list: Tower2Run[]) => {
  const f = state.frame;
  for (const r of list) {
    const d = TOWERS2[r.i], t = r.t, half = lidW(t.d) / 2, RIVER_Y = waterY(d.x);
    const top0 = towerTop(t.d, t.ang);
    if (Math.max(d.x, top0.x) + 140 < state.camera.x || Math.min(d.x, top0.x) - 140 > state.camera.x + W) continue;
    // (the rock it's stood on, in the river: always there)
    c.save(); c.translate(Math.round(d.x), Math.round(RIVER_Y)); stamp(c, `wp2-trock-${r.i % 3}`, -40, -18, 80, 24, g => paintRock(g, r.i % 3)); c.restore();
    if (r.gone) continue;
    // (rising: up out of the river, clipped at its surface)
    const lift = r.rise ? (1 - r.rise / RISE) * (d.h + 30) : 0;
    c.save();
    if (r.rise) { c.beginPath(); c.rect(d.x - 200, RIVER_Y - 600, 400, 600); c.clip(); c.translate(0, lift); }
    const { k, stage } = towerStage(r);
    const n = Math.max(4, Math.round(d.h / 30));
    const at = (u: number) => ({ x: d.x + Math.sin(t.ang) * d.h * Math.pow(u, 1.6), y: RIVER_Y - d.h * u * (1 - (1 - Math.cos(t.ang)) * u), a: t.ang * Math.pow(u, 1.6) });
    // (how far up (from the foot: 'base') or down (from the lid: 'top') it's charred and burning)
    const burnt = (u: number) => !r.lit ? 0 : d.burn === 'base' ? Math.max(0, Math.min(1, (k * 1.25 - u) * 3)) : Math.max(0, Math.min(1, (k * 1.25 - (1 - u)) * 3));
    // (the pole: bamboo, up the spine)
    c.lineCap = 'round';
    c.strokeStyle = INK; c.lineWidth = 9; c.beginPath(); for (let s = 0; s <= 8; s++) { const q = at(s / 8); if (s) c.lineTo(q.x, q.y); else c.moveTo(q.x, q.y); } c.stroke();
    c.strokeStyle = '#8A7A3A'; c.lineWidth = 5; c.stroke();
    c.strokeStyle = '#B8A860'; c.lineWidth = 1.5; c.beginPath(); for (let s2 = 0; s2 <= 8; s2++) { const q = at(s2 / 8); if (s2) c.lineTo(q.x - 1.5, q.y); else c.moveTo(q.x - 1.5, q.y); } c.stroke();
    c.lineCap = 'butt';
    // (the bamboo's nodes up it, dark rings)
    c.fillStyle = '#4A3E18'; for (let s2 = 1; s2 < 8; s2++) { const q = at(s2 / 8); c.fillRect(Math.round(q.x - 3), Math.round(q.y), 6, 2); }
    // (the floats: inner tubes threaded on it, each its plastic's ramp, stepped across, the hole dark; charred toward the
    // burning end, the char dithered in)
    for (let i = 0; i < n; i++) {
      const u0 = i / n, u1 = (i + 1) / n, p0 = at(u0), p1 = at(u1), cx = (p0.x + p1.x) / 2, cy = (p0.y + p1.y) / 2;
      const ch = burnt((u0 + u1) / 2);
      // (crumbling from the foot: the bottom tubes sagging, squashed)
      const sq = stage === 'crumble' && d.burn === 'base' && i < 2 ? 0.7 : 1;
      const rw = 24 + ((i * 7 + r.i * 3) % 3) * 3, rh = Math.max(7, (Math.hypot(p1.x - p0.x, p1.y - p0.y) / 2 + 2) * sq);
      c.save(); c.translate(cx, cy); c.rotate((p0.a + p1.a) / 2);
      // (baked: the tube in its plastic's ramp, charred in steps; put down turned and squashed to fit)
      const tc = tubeImg((i + r.i) % FLOATS.length, Math.round(ch * 4), rw);
      c.drawImage(tc, -rw - 3, -rh - 3, rw * 2 + 6, rh * 2 + 6);
      if (ch > 0.2 && ch < 1) { c.fillStyle = (f + i * 7) % 24 < 12 ? FIRE[3] : FIRE[2]; c.fillRect(-rw * 0.5 + (i % 3) * 6, -1, 6, 1); }
      c.restore();
      if (ch > 0.55) flame(c, cx + Math.cos(t.ang) * (rw * 0.4), cy - rh + 4, 9, 18 + ch * 14, f, r.i * 7 + i);
    }
    // (the lounger on top: foam, banded, its lit top edge (stood on); charred, burning when it's 'top' and going)
    const top = at(1), tilt = t.ang * 0.3, lch = burnt(1);
    c.save(); c.translate(top.x, top.y); c.rotate(tilt);
    // (baked: the foam in its ramp, its slats, the lit lip along its top; charred in steps)
    c.drawImage(loungerImg(Math.round(lch * 4), half), -half - 3, -3, half * 2 + 6, 18);
    c.restore();
    if (lch > 0.3) fireRow(c, top.x - half + 8, top.x + half - 8, top.y + 2, 18 + lch * 20, f, 18, r.i * 3, bootsOn(state, top.x - half, top.x + half, top.y));
    // (the smoke off it once it's caught)
    if (r.lit && f % 4 === 0) { const q = at(d.burn === 'base' ? Math.min(0.9, k) : Math.max(0.1, 1 - k)); state.particles.push({ pos: { x: q.x + (Math.random() - 0.5) * 30, y: q.y }, vel: { x: (Math.random() - 0.5) * 0.6, y: -0.9 - Math.random() * 0.6 }, life: 36, color: stage === 'catch' ? '#8A8494' : '#3F3A46', size: 3 + Math.random() * 3 }); }
    // (the tell it's leaning: wobble lines off its side, as Cartoon Land's)
    if (Math.abs(t.vel) > 0.004 && !r.fall) {
      c.strokeStyle = INK; c.lineWidth = 2; c.lineCap = 'round';
      const m = at(0.6), side = t.vel > 0 ? -1 : 1;
      for (let q = 0; q < 2; q++) { c.beginPath(); c.arc(m.x + side * (30 + q * 8), m.y, 8 + q * 6, side > 0 ? -0.6 : Math.PI - 0.6, side > 0 ? 0.6 : Math.PI + 0.6); c.stroke(); }
      c.lineCap = 'butt';
    }
    c.restore();
  }
};
