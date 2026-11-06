// THE LAZY RIVER's fire: the burning river itself, the jets up out of it, the patches burning on the decks, and what
// the level's cast and its boss throw (fireballs, lit joints that leave a patch where they land, smoke). Everything
// that burns is the same baked flame, stamped (painted the once per size and frame: stamp.ts), never per-frame pixel
// work: a flame is put down with one drawImage.
//
// The river: touched, he's burned to death (a set-piece death; what burned him away under him names it: the log, the
// tower, the vine: its own source, its own death screen). With god mode on (testing), he's put back on the last deck
// he stood on instead. Anybody else in it burns to death too (hazards hurt the cast: hazardHit.ts).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { stamp } from '../../../m1/game/render/stamp';
import { checker } from '../../intro/art/kit';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../../../m1/constants';
import { hazardVictims, hazardKill, hazardHit, boxHits, setHazardZones } from '../../hazardHit';
import { helmetStopsAt } from '../../upgrades/gear';
import { heard } from '../../bossQuiet';
import { isNude, isShat } from '../../../m1/game/player/gut';
import { GY, GAPS, RIVER_Y, RIVER_BED, JETS, JET_H, JET_UP, JET_TELL, PATCHES, inRiver, deckY, waterY } from './geo';

type Ctx = CanvasRenderingContext2D;
const INK = '#0A0604';
/** Fire's ramp, darkest first: the soot-red edge, red, orange, the yellow, the white-hot core. */
export const FIRE = ['#5A0E06', '#B91C1C', '#EA580C', '#F59E0B', '#FDE047', '#FFF7D6'];
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

// ---------------------------------------------------------------------------------------------------------------
// The flame: one tongue of it in SNES steps (the ramp in bands, inside out, each band's edge dithered), four frames
// of its flicker. Painted at its size the once (stamped), put down with its foot at (x, foot).

const paintFlame = (g: Ctx, w: number, h: number, fr: number, seed: number) => {
  // (the tongue's outline at each band: narrower and shorter inward; its tip leaning and licking, frame to frame)
  const lean = [0.0, 0.12, -0.06, 0.08][fr] + (hash(seed) - 0.5) * 0.1;
  const band = (k: number, col: string) => {
    const s = 1 - k * 0.2, bw = (w / 2) * s, top = -h * (1 - k * 0.16) * (0.92 + 0.08 * Math.sin(fr * 1.7 + seed));
    g.fillStyle = col; g.beginPath();
    g.moveTo(-bw, 0);
    g.quadraticCurveTo(-bw * 1.05, top * 0.45, lean * h + (-bw * 0.25), top * 0.8);
    g.quadraticCurveTo(lean * h, top * 1.02, lean * h * 1.2, top);
    g.quadraticCurveTo(lean * h + bw * 0.3, top * 0.7, bw * 0.9, top * 0.35);
    g.quadraticCurveTo(bw * 1.08, top * 0.12, bw, 0);
    g.closePath(); g.fill();
    // (a lick off the side, every other frame)
    if (k < 2 && (fr + k) % 2 === 0) { g.beginPath(); g.moveTo(bw * 0.4, top * 0.4); g.quadraticCurveTo(bw * 1.4, top * 0.62, bw * 0.9, top * 0.85); g.quadraticCurveTo(bw * 0.9, top * 0.6, bw * 0.2, top * 0.5); g.closePath(); g.fill(); }
  };
  band(0, FIRE[0]); band(1, FIRE[1]); band(2, FIRE[2]); band(3, FIRE[3]); band(4, FIRE[4]);
  // (the dither at each band's edge: a checker of the band under it, a pixel in)
  for (let y = -Math.round(h * 0.6); y < 0; y += 2) for (let x = -Math.round(w * 0.3); x < w * 0.3; x += 4) if (hash(x * 0.3 + y * 0.7 + fr + seed) < 0.18) R(g, x + ((y >> 1) & 1) * 2, y, 1, 1, FIRE[2]);
  // (the white core at its foot, and a spark or two over it)
  g.fillStyle = FIRE[5]; g.beginPath(); g.ellipse(0, -h * 0.12, w * 0.16, h * 0.12, 0, 0, Math.PI * 2); g.fill();
  for (let k = 0; k < 2; k++) R(g, (hash(seed + k + fr * 3) - 0.5) * w * 0.8, -h * (1.05 + hash(seed * 3 + k + fr) * 0.25), 2, 2, k ? FIRE[4] : FIRE[3]);
};
/** A flame, its foot at (x, foot): `w` wide, `h` tall; `seed` its own flicker (a few of them side by side don't move
 *  together). Stamped: one drawImage. */
export const flame = (c: Ctx, x: number, foot: number, w: number, h: number, f: number, seed = 0) => {
  // (sizes in steps of 8: a few dozen stamps for every fire in the level, not hundreds (past the stamp cache's count of
  // asked-for keys none would ever be painted, and every flame was painted afresh every frame))
  const wq = Math.max(8, Math.round(w / 8) * 8), hq = Math.max(8, Math.round(h / 8) * 8), sq = ((seed % 3) + 3) % 3;
  const fr = (Math.floor((f + seed * 5) / 6) + sq) & 3;
  // (moved there and back, not saved and restored: a save is most of what a flame cost, and there are a lot of them)
  const tx = Math.round(x), ty = Math.round(foot);
  c.translate(tx, ty);
  stamp(c, `wp2-fl-${wq}x${hq}-${sq}-${fr}`, -wq, -hq * 1.4, wq * 2, hq * 1.5, g => paintFlame(g, wq, hq, fr, sq));
  c.translate(-tx, -ty);
};
/** A cluster of flames along [x0, x1] (their feet at `foot`), `h` tall: a fire. */
export const fireRow = (c: Ctx, x0: number, x1: number, foot: number, h: number, f: number, gap = 18, seed = 0) => {
  for (let x = x0 + gap / 2, i = 0; x < x1; x += gap, i++) { const k = hash(i + seed * 13); flame(c, x, foot, gap * (1 + k * 0.5), h * (0.7 + k * 0.6), f, i + seed); }
};

// ---------------------------------------------------------------------------------------------------------------
// The river (world space): its oily dark water under, banded down out of sight; burning all along its surface (a
// strip of flame tiles, stamped). `front`: how far along it's caught (the meeting's cutscene: from the dock on; after,
// all of it); short of the front it's just oily water, a rainbow sheen on it.

const TILE = 96;
/** Lava's ramp below the surface: the white-hot skin of it, then down through orange and red to the black-red depths. */
const LAVA = ['#FFF3B0', '#FDE047', '#F59E0B', '#EA580C', '#B91C1C', '#7F1D1D', '#4A0A06', '#2A0503'];
const CRUST = ['#140504', '#2A0A06', '#3E120A', '#5A1E10'];
/** One tile of the burning river's surface (the owner: "more hellish and obviously dangerous. This isn't your 'bounce
 *  out' lava"): plates of black-red crust drifting on it, cracked, glowing white-hot down the cracks; bright churning
 *  channels of it between, rolling; a blob swelling and bursting; flames licking up off it; `v` a skull bobbing in it
 *  (1) or a ribcage (2). Four frames (`fr`), stamped. */
const paintRiverTile = (g: Ctx, fr: number, v: number) => {
  // (the bright churn: the molten top, banded, its highlights rolling along frame to frame)
  R(g, 0, -4, TILE, 4, LAVA[2]); R(g, 0, 0, TILE, 4, LAVA[3]); R(g, 0, 4, TILE, 4, LAVA[4]); R(g, 0, 8, TILE, 4, LAVA[5]);
  for (let x = 0; x < TILE; x += 2) if (((x >> 1) + fr) % 2 === 0) { g.fillStyle = LAVA[3]; g.fillRect(x, -1, 1, 1); g.fillStyle = LAVA[4]; g.fillRect(x, 3, 1, 1); g.fillStyle = LAVA[5]; g.fillRect(x, 7, 1, 1); }
  for (let k = 0; k < 5; k++) { const x = ((k * 23 + fr * 6) % TILE); R(g, x, -3, 10, 1, LAVA[1]); R(g, x + 3, -2, 5, 1, LAVA[0]); }
  // (the crust: plates of it, black-red, their edges lit from under, cracked through with white-hot)
  for (let k = 0; k < 3; k++) {
    const x0 = ((k * 34 + fr * 3 + 4) % (TILE + 20)) - 14, w = 22 + (k % 2) * 8, y0 = -3 + (k % 2);
    g.fillStyle = CRUST[0]; g.beginPath(); g.moveTo(x0, y0 + 3); g.lineTo(x0 + 4, y0 - 1); g.lineTo(x0 + w - 3, y0); g.lineTo(x0 + w, y0 + 4); g.lineTo(x0 + w - 4, y0 + 7); g.lineTo(x0 + 3, y0 + 6); g.closePath(); g.fill();
    R(g, x0 + 4, y0, w - 8, 2, CRUST[2]); R(g, x0 + 6, y0, w - 14, 1, CRUST[3]);
    R(g, x0 + 2, y0 + 5, w - 4, 1, LAVA[3]);
    // (the crack across it)
    g.fillStyle = LAVA[1]; g.fillRect(x0 + w / 2 - 1, y0, 1, 3); g.fillRect(x0 + w / 2, y0 + 2, 4, 1); g.fillStyle = LAVA[0]; g.fillRect(x0 + w / 2, y0 + 1, 1, 1);
  }
  // (what's floating in it: a skull, bobbing, eye holes lit from inside; or a ribcage)
  if (v === 1) { const x = 60, y = -4 + [0, 1, 1, 0][fr]; g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, 7, 6, 0, Math.PI, 0); g.fill(); g.fillStyle = '#5A4A40'; g.beginPath(); g.ellipse(x, y, 6, 5, 0, Math.PI, 0); g.fill(); g.fillStyle = '#8A7A6A'; g.fillRect(x - 4, y - 4, 3, 2); g.fillStyle = LAVA[1]; g.fillRect(x - 4, y - 3, 2, 2); g.fillRect(x + 1, y - 3, 2, 2); }
  if (v === 2) { const x = 30, y = -2 + [1, 0, 0, 1][fr]; for (let k = 0; k < 4; k++) { g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(x + k * 5, y + 2, 5, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.strokeStyle = '#6A5A4C'; g.lineWidth = 1.4; g.stroke(); } }
  // (a blob of it swelling up and bursting: frame by frame)
  { const x = 18 + v * 22, r = [3, 6, 8, 0][fr]; if (r) { g.fillStyle = INK; g.beginPath(); g.ellipse(x, -2, r + 1, r * 0.8 + 1, 0, Math.PI, 0); g.fill(); g.fillStyle = LAVA[3]; g.beginPath(); g.ellipse(x, -2, r, r * 0.8, 0, Math.PI, 0); g.fill(); g.fillStyle = LAVA[1]; g.fillRect(x - r / 2, -2 - r * 0.6, 2, 1); } else for (const [dx, dy] of [[-6, -10], [-2, -16], [3, -13], [7, -8]]) R(g, x + dx, dy, 2, 2, dy < -12 ? LAVA[1] : LAVA[2]); }
  // (the flames licking up off it, in their steps)
  for (let i = 0; i < 5; i++) {
    const x = 10 + i * 19 + (hash(i + fr * 7) - 0.5) * 6, h = 16 + hash(i * 3 + fr) * 28, w = 7 + hash(i + 40) * 5, lean = (hash(i + fr * 11) - 0.5) * 6;
    for (const [k, col] of [[1, FIRE[0]], [0.75, FIRE[1]], [0.5, FIRE[2]], [0.26, FIRE[4]]] as const) { g.fillStyle = col; g.beginPath(); g.moveTo(x - w * k, -3); g.quadraticCurveTo(x - w * k * 0.6, -h * k * 0.6 - h * (1 - k) * 0.3, x + lean * k, -h * (0.4 + k * 0.6)); g.quadraticCurveTo(x + w * k * 0.6, -h * k * 0.55, x + w * k, -3); g.closePath(); g.fill(); }
  }
};
/** The lava under the surface: banded down, dithered at each step, into the black-red depths. */
const RIVER_BANDS = [LAVA[4], LAVA[5], LAVA[6], '#3A0804', LAVA[7], '#1A0302'];
export const drawRiver = (c: Ctx, state: GameState, front = Infinity, lit = true) => {
  const cx0 = state.camera.x - 40, cx1 = state.camera.x + W + 40, bot = state.camera.y + H + 20, f = state.frame;
  for (const g of GAPS) {
    const { a, b } = g, RIVER_Y = waterY((a + b) / 2);
    if (b < cx0 || a > cx1 || bot < RIVER_Y - 60) continue;
    const x0 = Math.max(a, cx0), x1 = Math.min(b, cx1);
    // (the channel's walls under the decks' edges: dark concrete going down; the water between)
    RIVER_BANDS.forEach((col, k) => { const y0 = RIVER_Y + k * 18, h = k === RIVER_BANDS.length - 1 ? bot - y0 : 18; if (h > 0) R(c, x0, y0, x1 - x0, h, col); if (k) checker(c, x0, y0 - 2, x1 - x0, 2, col); });
    // (short of the fire's front (the meeting): the oil slick's sheen, no fire)
    const fx = Math.max(x0, Math.min(x1, front));
    if (fx > x0 && lit) {
      // (the fire's glow down into the water, stepped)
      // (the heat shimmer over it: thin bright bands wavering up off the surface)
      for (let k = 0; k < 3; k++) { c.fillStyle = `rgba(253, 186, 116, ${(0.1 - k * 0.03).toFixed(2)})`; c.fillRect(x0, Math.round(RIVER_Y - 30 - k * 14 + Math.sin(f * 0.11 + k * 2) * 3), fx - x0, 2); }
      const t0 = Math.floor(x0 / TILE) * TILE, fr = (f >> 3) & 3;
      c.save(); c.beginPath(); c.rect(x0, RIVER_Y - 60, fx - x0, 74); c.clip();
      for (let tx = t0; tx < fx; tx += TILE) {
        const fr2 = (fr + ((tx / TILE) | 0)) & 3, v = Math.floor(hash(tx / TILE) * 5) % 3;
        c.save(); c.translate(tx, RIVER_Y);
        stamp(c, `wp2-lava-${fr2}-${v}`, 0, -60, TILE, 74, g => paintRiverTile(g, fr2, v));
        c.restore();
      }
      c.restore();
      // (the edge at the front: a wall of it going, taller)
      if (front < x1 && front > x0) fireRow(c, front - 30, front + 4, RIVER_Y + 2, 54, f, 12, 7);
    }
    if (fx < x1) {
      // (the slick: rainbow sheen bands drifting on black water)
      R(c, fx, RIVER_Y, x1 - fx, bot - RIVER_Y, '#0C0A0C');
      R(c, fx, RIVER_Y - 2, x1 - fx, 3, '#1E2A2A');
      for (let x = Math.floor(fx / 24) * 24; x < x1; x += 24) { const k = ((x / 24 + (f >> 4)) | 0) % 4, col = ['#5B3A8A', '#2A6A6A', '#8A7A2A', '#7A2A5A'][k]; if (x >= fx) R(c, x, RIVER_Y + 1, 14, 1, col); }
    }
    // (the decks' edges down into it: the channel's lip, dark concrete; lit top's the deck's own)
    for (const e of [a, b]) if (e >= cx0 - 10 && e <= cx1 + 10) { const top = GY + (e === a ? g.dyL : g.dyR); R(c, e - 4, top, 8, RIVER_Y - top + 40, '#2A2420'); R(c, e - 4, top, 8, 2, '#6A5E52'); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The jets: [x, period, phase]. The tell (the surface boils and glows, bubbles) JET_TELL frames, then up: a column
// of fire JET_H tall, JET_UP frames.

export const jetPhase = (state: GameState, i: number) => {
  const [, per, ph] = JETS[i], t = (state.frame + ph) % per;
  const up0 = per - JET_UP, tell0 = up0 - JET_TELL;
  if (t >= up0) { const k = (t - up0) / JET_UP; return { mode: 'up' as const, k, h: JET_H * Math.min(1, k * 5, (1 - k) * 4 + 0.3) }; }
  if (t >= tell0) return { mode: 'tell' as const, k: (t - tell0) / JET_TELL, h: 0 };
  return { mode: 'off' as const, k: 0, h: 0 };
};
const JET_W = 30;
export const drawJets = (c: Ctx, state: GameState) => {
  const f = state.frame;
  JETS.forEach(([x], i) => {
    if (x < state.camera.x - 80 || x > state.camera.x + W + 80) return;
    const j = jetPhase(state, i), RIVER_Y = waterY(x);
    if (j.mode === 'tell') {
      // (the boil: the surface swelling, bright, bubbles popping, quicker toward the end)
      const k = j.k;
      c.fillStyle = `rgba(253, 224, 71, ${(0.25 + k * 0.5).toFixed(2)})`; c.beginPath(); c.ellipse(x, RIVER_Y - 2, JET_W * (0.6 + k * 0.6), 5 + k * 4, 0, 0, Math.PI * 2); c.fill();
      for (let b = 0; b < 4; b++) { const ph = ((f * (1 + k * 2) + b * 9) % 20) / 20; R(c, x - 18 + b * 12, RIVER_Y - 4 - ph * 14 * k, 3, 3, b % 2 ? FIRE[4] : FIRE[3]); }
      if (k > 0.6) flame(c, x, RIVER_Y, 12, 20 + k * 20, f, 30 + i);
    } else if (j.mode === 'up') {
      // (the column: flames stacked up it, their feet climbing, the top licking)
      const h = j.h;
      for (let y = 0; y < h; y += 26) flame(c, x + Math.sin((y + f * 3) * 0.05) * 4, RIVER_Y - y, JET_W * (1 - (y / Math.max(1, h)) * 0.4), 44, f, 40 + i * 7 + y / 26);
      if (j.k < 0.08 && heard(state, x)) { playSound('whoosh', 0.6, -10); playSound('ignite', 0.5, -6); }
    }
  });
};
/** The jets' column as a box (or null, down). */
const jetBox = (state: GameState, i: number) => { const j = jetPhase(state, i); return j.mode === 'up' && j.h > 30 ? { x: JETS[i][0] - JET_W / 2, y: waterY(JETS[i][0]) - j.h, w: JET_W, h: j.h } : null; };

// ---------------------------------------------------------------------------------------------------------------
// The patches on the decks: always burning (debris: a broken tiki torch, a burning lounge chair cushion)

export const drawPatches = (c: Ctx, state: GameState, extra: { x: number; w: number; t: number }[]) => {
  const f = state.frame;
  for (const [x, w] of PATCHES) {
    if (x + w < state.camera.x - 60 || x - w > state.camera.x + W + 60) continue;
    const GY = deckY(x);
    // (the debris under it: a charred heap, a burnt lounger's frame)
    R(c, x - w / 2 - 4, GY - 6, w + 8, 6, INK); R(c, x - w / 2 - 2, GY - 5, w + 4, 4, '#2A1A12'); R(c, x - w / 2, GY - 6, w, 1, '#5A3A22');
    for (let k = 0; k < 3; k++) R(c, x - w / 2 + 4 + k * (w / 3), GY - 10 - (k % 2) * 3, w / 4, 4, '#1A100C');
    fireRow(c, x - w / 2, x + w / 2, GY - 2, 38, f, 14, Math.round(x / 7));
  }
  // (the ones the cast's joints and the son's flicks leave: dying down as they go)
  for (const p of extra) {
    if (p.x + p.w < state.camera.x - 60 || p.x - p.w > state.camera.x + W + 60) continue;
    const k = Math.min(1, p.t / 30), GY = deckY(p.x);
    R(c, p.x - p.w / 2, GY - 3, p.w, 3, '#2A1208');
    fireRow(c, p.x - p.w / 2, p.x + p.w / 2, GY - 1, 30 * k + 6, f, 12, Math.round(p.x / 5));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// What's thrown: fireballs (the imps', the son's), lit joints lobbed (a patch where they land), smoke (a burnout's
// puff, the son's rings), flame along the floor (the son's burp), the son's pillars. Their own list; drawn after the
// enemies.

export type ShotKind = 'fireball' | 'joint' | 'puff' | 'ring' | 'burp' | 'pillar';
export interface Shot2 { kind: ShotKind; x: number; y: number; vx: number; vy: number; t: number; src: string; dmg: number; life: number; r: number;
  /** A pillar's tell before it's up (frames), a lob's floor. */
  tell?: number; floor?: number }
export interface Patch { x: number; w: number; t: number; life: number; src: string }
export interface FireState { shots: Shot2[]; patches: Patch[]; patchCd: number; jetCd: number; safe: { x: number; y: number } | null }
const FS = new WeakMap<GameState, FireState>();
export const fireOf = (state: GameState) => { let s = FS.get(state); if (!s) { s = { shots: [], patches: [], patchCd: 0, jetCd: 0, safe: null }; FS.set(state, s); } return s; };
export const clearFire = (state: GameState) => { const s = fireOf(state); s.shots.length = 0; s.patches.length = 0; };
export const shoot2 = (state: GameState, s: Omit<Shot2, 't'>) => { fireOf(state).shots.push({ ...s, t: 0 }); };
/** A fireball from (x, y) at (tx, ty). */
export const fireball = (state: GameState, x: number, y: number, tx: number, ty: number, speed: number, src: string, dmg: number) => {
  const d = Math.hypot(tx - x, ty - y) || 1;
  shoot2(state, { kind: 'fireball', x, y, vx: ((tx - x) / d) * speed, vy: ((ty - y) / d) * speed, src, dmg, life: 220, r: 8 });
  if (heard(state, x)) playSound('ignite', 0.5, 2);
};
/** A lob (a joint, flicked): from (x, y) to come down at tx on the floor `floor` in T frames. */
export const lob = (state: GameState, x: number, y: number, tx: number, floor: number, T: number, src: string, dmg: number) => {
  const g = 0.32;
  shoot2(state, { kind: 'joint', x, y, vx: (tx - x) / T, vy: (floor - y - 0.5 * g * T * T) / T, src, dmg, life: T + 60, r: 5, floor });
};
const pop = (state: GameState, x: number, y: number, smoke = false) => {
  for (let i = 0; i < 8; i++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 4, y: -Math.random() * 3 }, life: 18, color: smoke ? (i % 2 ? '#6B6474' : '#3F3A46') : FIRE[2 + (i % 3)], size: 2 + Math.random() * 3 });
};

/** A frame of the shots, the patches; the jets', patches' and the river's hurt (him and the cast). `box`: his. */
export const updateFire = (ctx: FrameContext, opts: { riverOn: boolean; cause: () => string | null; jetsOn?: boolean }) => {
  const { state } = ctx, p = state.player, fs = fireOf(state);
  const pb = { x: p.pos.x, y: p.pos.y + (p.isDucking ? 24 : 0), w: p.width, h: p.height - (p.isDucking ? 24 : 0) };
  const meHit = (x: number, y: number, w: number, h: number) => p.health > 0 && !p.inCutscene && pb.x + 6 < x + w && pb.x + pb.w - 6 > x && pb.y < y + h && pb.y + pb.h > y;
  const ouch = (dmg: number, src: string, dir: number, up = -5) => { if (p.invincibilityTimer <= 0 && !p.untouchable) { hurtPlayer(ctx, dmg, src, { x: dir * 5, y: up }, 18); shakeScreen(state, 5, 3); } };
  // ---- the shots
  for (let i = fs.shots.length - 1; i >= 0; i--) {
    const s = fs.shots[i];
    s.t++;
    if (s.kind === 'joint') s.vy += 0.32;
    if (s.kind === 'pillar') {
      if (s.t > (s.tell ?? 40) && meHit(s.x - s.r, (s.floor ?? GY) - 170, s.r * 2, 170)) ouch(s.dmg, s.src, Math.sign(pb.x + pb.w / 2 - s.x) || 1, -8);
      if (s.t > s.life) fs.shots.splice(i, 1);
      continue;
    }
    s.x += s.vx; s.y += s.vy;
    if (s.kind === 'puff' || s.kind === 'ring') { s.vx *= s.kind === 'puff' ? 0.95 : 1; s.vy *= 0.95; }
    const r = s.r;
    const hit = s.kind === 'burp' ? meHit(s.x - 16, (s.floor ?? GY) - 34, 32, 34) : meHit(s.x - r, s.y - r, r * 2, r * 2);
    if (hit && !helmetStopsAt(state, s.x, s.y, 6)) {
      ouch(s.dmg, s.src, Math.sign(s.vx || 1));
      if (s.kind === 'fireball' || s.kind === 'joint') { pop(state, s.x, s.y); fs.shots.splice(i, 1); continue; }
    }
    // (a lob comes down: a patch where it lands; a fireball into the floor or a wall: a pop)
    if (s.kind === 'joint' && s.y >= (s.floor ?? GY) - 2 && s.vy > 0) {
      fs.shots.splice(i, 1);
      if (!inRiver(s.x)) fs.patches.push({ x: s.x, w: 34, t: 0, life: 150, src: s.src });
      pop(state, s.x, s.floor ?? GY);
      if (heard(state, s.x)) playSound('ignite', 0.35, 8);
      continue;
    }
    if (s.kind === 'fireball' && state.blocks.some(k => k.type !== 'pit' && !k.oneWay && s.x > k.x && s.x < k.x + k.w && s.y > k.y && s.y < k.y + k.h)) { pop(state, s.x, s.y); fs.shots.splice(i, 1); continue; }
    if (s.t > s.life) { if (s.kind !== 'burp') pop(state, s.x, s.y, s.kind === 'puff' || s.kind === 'ring'); fs.shots.splice(i, 1); }
  }
  // ---- the patches (theirs, for a while; the level's, always)
  for (let i = fs.patches.length - 1; i >= 0; i--) { const q = fs.patches[i]; q.t++; if (q.t > q.life) fs.patches.splice(i, 1); }
  const feetOn = Math.abs(p.pos.y + p.height - deckY(p.pos.x + p.width / 2)) < 6;
  const allPatches = [...PATCHES.map(([x, w]) => ({ x, w, src: 'm2:wp2_patch' })), ...fs.patches.filter(q => q.t > 10 && q.t < q.life - 10)];
  for (const q of allPatches) if (feetOn && meHit(q.x - q.w / 2, deckY(q.x) - 30, q.w, 30)) ouch(12, q.src, (pb.x + pb.w / 2 < q.x ? -1 : 1), -7);
  // ---- the jets
  if (opts.jetsOn !== false) JETS.forEach((_j, i) => { const b = jetBox(state, i); if (b && meHit(b.x, b.y, b.w, b.h)) ouch(16, 'm2:wp2_jet', Math.sign(pb.x + pb.w / 2 - JETS[i][0]) || 1, -10); });
  // ---- the river: dead (or, god mode, back on the last deck he stood on)
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  if (p.isGrounded && Math.abs(feet - deckY(cx)) < 3 && !inRiver(cx)) fs.safe = { x: cx, y: deckY(cx) };
  if (opts.riverOn && p.health > 0 && !p.inCutscene && inRiver(cx) && feet > waterY(cx) - 4) {
    // (the river's own death (lavaDeath.ts: the sink, the char, the bones), its death line by his pants)
    const src = opts.cause() ?? `m2:wp2_river${isNude(state) ? '.nude' : isShat(state) ? '.shat' : ''}`;
    p.invincibilityTimer = 0; p.untouchable = false;
    playSound('ignite', 1, -10); playSound('screams', 0.6, 2); shakeScreen(state, 10, 5);
    for (let i = 0; i < 24; i++) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * 30, y: waterY(cx) }, vel: { x: (Math.random() - 0.5) * 5, y: -3 - Math.random() * 6 }, life: 30, color: FIRE[1 + (i % 4)], size: 3 + Math.random() * 3 });
    hurtPlayer(ctx, 9999, src);
    if (p.health > 0 && fs.safe) { p.pos.x = fs.safe.x - p.width / 2; p.pos.y = fs.safe.y - p.height - 2; p.vel.x = 0; p.vel.y = 0; p.carried = false; }
    else p.vel.y = Math.min(p.vel.y, 1.5);
  }
  // ---- the cast: into the river, a jet, a patch: burned (hazards hurt them too)
  fs.jetCd = Math.max(0, fs.jetCd - 1);
  for (const e of hazardVictims(state)) {
    const ex = e.pos.x + e.width / 2, ef = e.pos.y + e.height;
    if (e.enemyType !== 'flyer' && inRiver(ex) && ef > waterY(ex) - 4) { hazardKill(ctx, e, ex - 1, 'DEEP FRIED!', { color: '#FDBA74', fling: { x: 0, y: -6 }, sound: 'ignite' }); continue; }
    if (opts.jetsOn !== false) for (let i = 0; i < JETS.length; i++) { const b = jetBox(state, i); if (b && boxHits(e, b.x, b.y, b.w, b.h) && !(e.hitFlash && e.hitFlash > 0)) hazardHit(ctx, e, 40, JETS[i][0], 'TORCHED!', { color: '#FDBA74' }); }
    if (Math.abs(ef - deckY(ex)) < 6 && e.enemyType !== 'flyer') for (const q of allPatches) if (boxHits(e, q.x - q.w / 2, deckY(q.x) - 30, q.w, 30) && !(e.hitFlash && e.hitFlash > 0)) hazardHit(ctx, e, 20, q.x, 'TOASTED!', { color: '#FDBA74' });
  }
  // (nobody walks into one on their own: the danger zones, for the cast's AI)
  setHazardZones(state, 'wp2-fire', [
    ...GAPS.map(g => ({ x0: g.a, x1: g.b, y0: RIVER_Y + g.water - 10, y1: RIVER_BED + g.water + 40, ground: true })),
    ...allPatches.map(q => ({ x0: q.x - q.w / 2 - 6, x1: q.x + q.w / 2 + 6, y0: deckY(q.x) - 40, y1: deckY(q.x) + 4, ground: true })),
    ...JETS.map(([x]) => ({ x0: x - JET_W, x1: x + JET_W, y0: waterY(x) - JET_H, y1: waterY(x) })),
  ]);
};

/** The shots (world space, after the enemies). */
export const drawShots2 = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const s of fireOf(state).shots) {
    if (s.x < state.camera.x - 100 || s.x > state.camera.x + W + 100) continue;
    switch (s.kind) {
      case 'fireball': {
        // (a ball of it, its tail streaming behind)
        const a = Math.atan2(s.vy, s.vx);
        for (let k = 3; k >= 1; k--) { c.fillStyle = FIRE[4 - k]; c.beginPath(); c.arc(s.x - Math.cos(a) * k * 5, s.y - Math.sin(a) * k * 5, s.r * (1 - k * 0.18), 0, Math.PI * 2); c.fill(); }
        c.fillStyle = INK; c.beginPath(); c.arc(s.x, s.y, s.r + 1.5, 0, Math.PI * 2); c.fill();
        c.fillStyle = FIRE[2]; c.beginPath(); c.arc(s.x, s.y, s.r, 0, Math.PI * 2); c.fill();
        c.fillStyle = FIRE[4]; c.beginPath(); c.arc(s.x - 1, s.y - 1, s.r * 0.55, 0, Math.PI * 2); c.fill();
        R(c, s.x - 2, s.y - 3, 2, 2, FIRE[5]);
        break;
      }
      case 'joint': {
        // (a lit joint end over end, its cherry glowing, a thread of smoke)
        const a = s.t * 0.4, dx = Math.cos(a) * 6, dy = Math.sin(a) * 6;
        c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(s.x - dx, s.y - dy); c.lineTo(s.x + dx, s.y + dy); c.stroke();
        c.strokeStyle = '#F5F0E6'; c.lineWidth = 2.4; c.stroke();
        R(c, s.x + dx - 2, s.y + dy - 2, 4, 4, f % 4 < 2 ? FIRE[3] : FIRE[2]);
        if (s.t % 3 === 0) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: 0, y: -0.6 }, life: 22, color: '#9A94A4', size: 2 });
        break;
      }
      case 'puff': case 'ring': {
        // (smoke: a gray-violet cloud (a ring: a donut, glowing at its heart: it's hot), rolling)
        const k = Math.min(1, s.t / 12), rr = s.r * (0.6 + 0.4 * k);
        c.globalAlpha = 0.85;
        if (s.kind === 'ring') {
          c.strokeStyle = '#2A2432'; c.lineWidth = rr * 0.55 + 3; c.beginPath(); c.ellipse(s.x, s.y, rr * 0.55, rr, 0, 0, Math.PI * 2); c.stroke();
          c.strokeStyle = '#7A7088'; c.lineWidth = rr * 0.45; c.stroke();
          c.strokeStyle = '#B8AEC8'; c.lineWidth = 2; c.beginPath(); c.ellipse(s.x - 2, s.y - 2, rr * 0.5, rr * 0.9, 0, -2.4, -0.6); c.stroke();
          c.strokeStyle = FIRE[2]; c.lineWidth = 2; c.setLineDash([3, 5]); c.beginPath(); c.ellipse(s.x, s.y, rr * 0.55, rr, 0, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
        } else {
          for (let b = 0; b < 4; b++) { const bx = s.x + Math.cos(b * 1.6 + s.t * 0.05) * rr * 0.5, by = s.y + Math.sin(b * 1.6 + s.t * 0.05) * rr * 0.4; c.fillStyle = b % 2 ? '#5A5266' : '#7E7690'; c.beginPath(); c.arc(bx, by, rr * 0.55, 0, Math.PI * 2); c.fill(); }
          c.fillStyle = '#A8A0B8'; c.beginPath(); c.arc(s.x - rr * 0.2, s.y - rr * 0.25, rr * 0.3, 0, Math.PI * 2); c.fill();
        }
        c.globalAlpha = 1;
        break;
      }
      case 'burp': fireRow(c, s.x - 18, s.x + 18, s.floor ?? GY, 40, f, 12, 3); break;
      case 'pillar': {
        const floor = s.floor ?? GY, tell = s.tell ?? 40;
        if (s.t <= tell) {
          // (the tell: the floor cracking and glowing where it'll come up, brighter toward the end)
          const k = s.t / tell;
          c.fillStyle = `rgba(253, 186, 116, ${(0.3 + 0.5 * k).toFixed(2)})`; c.beginPath(); c.ellipse(s.x, floor - 1, s.r * (0.8 + k * 0.4), 4 + k * 3, 0, 0, Math.PI * 2); c.fill();
          R(c, s.x - s.r, floor - 1, s.r * 2, 1, FIRE[3]);
          if (k > 0.5) flame(c, s.x, floor, 10, 14 + k * 10, f, 11);
        } else {
          const k = Math.min(1, (s.t - tell) / 8), up = Math.min(1, (s.life - s.t) / 10);
          for (let y = 0; y < 170 * k * up; y += 28) flame(c, s.x, floor - y, s.r, 48, f, 50 + y / 28);
        }
        break;
      }
    }
  }
};
/** The patches the shots leave (for drawPatches). */
export const extraPatches = (state: GameState) => fireOf(state).patches;
