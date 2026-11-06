// THE LAZY RIVER's logs: Wilderness Land's ROLLING LOGS (frontier/wilds/logs.ts: stand on one, walk, it rolls under
// his feet and goes; stop and it drifts with the current), as burning palm trunks floating on the burning river. Tied
// up at the near bank (a stake, a rope) till he's on it. And they burn: stood on, it catches under him, and the
// longer he's on it the further it goes, in clear stages:
//
//   CATCH     smoke curling up off its top, an ember or two (a fifth of its fuse)
//   SMOLDER   charring over, cracks glowing orange along it, more smoke (to half)
//   FLAMES    fire all along its top (to most of the way)
//   CRUMBLE   shaking, chunks of it falling off, sinking, the fire big: then it's gone, and so's whatever's on it
//
// Off it, a lit one keeps smoldering on slower (a third of the pace). Gone, a fresh one's floated back to its stake a
// while after (so the crossing always works). Also here: the burning footbridges sagged low across the river (duck
// under, on the log: stood up, it hits him).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { makeMover, moveMover, riding, type Mover } from '../../foreign/movers';
import { drawLog } from '../../frontier/wilds/logs';
import { heard } from '../../bossQuiet';
import { stamp } from '../../intro/art/kit';
import { CANVAS_WIDTH as W } from '../../../m1/constants';
import { LOGS2, CURRENT, BEAMS, BEAM_GAP, RIVER_Y, GY, waterDy, waterY } from './geo';
import { fireRow, flame, FIRE } from './fire';

type Ctx = CanvasRenderingContext2D;
const R = 14, SINK = 2, PUSH = 3.2, ANSWER = 0.08, EASE = 0.03;
const TOP0 = RIVER_Y - (2 * R - SINK);
/** A log's top floating at x (its gap's water: the river steps down through the log jam). */
const topAt = (x: number) => TOP0 + waterDy(x);
const BACK = 300;

export interface Log2Run { i: number; x: number; vx: number; spin: number; lean: number; lastVx: number; bumpCd: number; moored: boolean; burn: number; lit: boolean; gone: number; m: Mover; sink: number }
export const buildLogs2 = (state: GameState): Log2Run[] => LOGS2.map((L, i) => {
  const r: Log2Run = { i, x: L.home, vx: 0, spin: 0, lean: 0, lastVx: 0, bumpCd: 0, moored: true, burn: 0, lit: false, gone: 0, m: makeMover(state, L.home, topAt(L.home), L.len, `wp2-log-${i}`), sink: 0 };
  moveMover(state, r.m, r.x, topAt(L.home));
  return r;
});
/** How far it's burned (0..1) and the stage it's at. */
export const logStage = (r: Log2Run) => { const k = r.burn / LOGS2[r.i].fuse; return { k, stage: !r.lit ? 'whole' : k < 0.2 ? 'catch' : k < 0.5 ? 'smolder' : k < 0.85 ? 'flames' : 'crumble' }; };
export const logUnder2 = (state: GameState, logs: Log2Run[]) => logs.find(r => !r.gone && riding(state, r.m)) ?? null;

const splash = (state: GameState, x: number, n = 8) => { for (let i = 0; i < n; i++) state.particles.push({ pos: { x, y: waterY(x) - 4 }, vel: { x: (Math.random() - 0.5) * 5, y: -1.5 - Math.random() * 4 }, life: 22, color: FIRE[1 + (i % 4)], size: 2 + Math.random() * 3 }); };

/** A frame of the logs (before he moves): pushed by him, the current, bumping; burning; him carried. `onGone`: one
 *  burned away with him on it. Returns the controls he walks with (his left and right go into the log). */
export const updateLogs2 = (ctx: FrameContext, logs: Log2Run[], controls: Controls, onGone: () => void): Controls => {
  const { state } = ctx, p = state.player;
  const on = logUnder2(state, logs);
  let out = controls;
  for (const r of logs) {
    const L = LOGS2[r.i];
    // (gone: a fresh one floated back to its stake a while after (not under his nose: off screen, or a good while))
    if (r.gone) {
      r.gone++;
      const off = Math.abs(p.pos.x + p.width / 2 - L.home) > W * 0.7;
      if (r.gone > BACK && (off || r.gone > BACK * 2)) {
        r.gone = 0; r.x = L.home; r.vx = 0; r.burn = 0; r.lit = false; r.moored = true; r.sink = 0; r.lean = 0;
        moveMover(state, r.m, r.x, topAt(L.home));
        if (!off) splash(state, r.x + L.len / 2, 6);
      }
      continue;
    }
    const rider = r === on && p.health > 0 && !p.inCutscene;
    const input = rider ? (controls.right ? 1 : 0) - (controls.left ? 1 : 0) : 0;
    const lo = L.a + 2, hi = L.b - 2 - L.len;
    const jammed = input !== 0 && ((input > 0 && r.x >= hi - 0.5) || (input < 0 && r.x <= lo + 0.5));
    if (r.moored && rider) { r.moored = false; playSound('crack', 0.5, 8); }
    // (the burn: stood on, a frame a frame; off it, lit, a third)
    if (rider && !r.lit) { r.lit = true; playSound('ignite', 0.6, 8); }
    if (r.lit) r.burn += rider ? 1 : 0.35;
    const { k, stage } = logStage(r);
    if (r.lit && Math.floor(state.frame) % 30 === 0 && heard(state, r.x)) playSound('sizzle', 0.25 + k * 0.4, 6);
    if (k >= 1) {
      // (gone: the last of it falls apart into the river, and whoever's on it goes in)
      r.gone = 1;
      const TOP = topAt(L.home);
      moveMover(state, r.m, r.x, TOP, true);
      for (let n = 0; n < 22; n++) state.particles.push({ pos: { x: r.x + Math.random() * L.len, y: TOP + Math.random() * 20 }, vel: { x: (Math.random() - 0.5) * 4, y: -2 - Math.random() * 4 }, life: 34, color: n % 3 ? FIRE[1 + (n % 4)] : '#1A0E08', size: 3 + Math.random() * 4 });
      playSound('crumble', 0.9, -4); playSound('ignite', 0.7, -8); shakeScreen(state, rider ? 8 : 3, 3);
      if (rider) { p.isGrounded = false; p.vel.y = 1; onGone(); }
      continue;
    }
    const current = r.moored ? 0 : CURRENT;
    if (input && !jammed) r.vx += (input * PUSH + current - r.vx) * ANSWER;
    else r.vx += (current - r.vx) * EASE;
    let nx = r.x + r.vx;
    r.bumpCd = Math.max(0, r.bumpCd - 1);
    const bump = (at: number) => {
      if (Math.abs(r.vx) > 1.1 && r.bumpCd === 0) { playSound('thud', Math.min(1, Math.abs(r.vx) / 3), -6); splash(state, at, 6); if (rider) { shakeScreen(state, 4, 2); r.lean = Math.sign(r.vx); } r.bumpCd = 20; }
      r.vx = 0;
    };
    if (nx < lo) { nx = lo; bump(lo); } else if (nx > hi) { nx = hi; bump(hi + L.len); }
    // (another log in the same water: they knock together, and pass on what they had)
    for (const o of logs) {
      if (o === r || o.gone || LOGS2[o.i].a !== L.a) continue;
      const OL = LOGS2[o.i].len;
      if (nx < o.x + OL && nx + L.len > o.x) {
        const fromLeft = r.x < o.x;
        nx = fromLeft ? o.x - L.len : o.x + OL;
        if (Math.abs(r.vx - o.vx) > 1.1 && r.bumpCd === 0) { playSound('thud', 0.7, -4); splash(state, fromLeft ? nx + L.len : nx, 5); r.bumpCd = 20; }
        const t = r.vx; r.vx = o.vx * 0.6; o.vx = t * 0.6;
        if (o.moored && Math.abs(t) > 0.3) o.moored = false;
      }
    }
    r.spin += (nx - r.x) / R;
    const dv = r.vx - r.lastVx; r.lastVx = r.vx;
    r.lean = Math.max(-1, Math.min(1, r.lean * 0.9 + dv * 3 + (rider && Math.abs(r.vx) > 0.4 ? Math.sin(state.frame * 0.13) * 0.04 : 0)));
    r.x = nx;
    // (crumbling: it shudders and settles lower in the fire)
    r.sink = stage === 'crumble' ? Math.min(8, r.sink + 0.08) : 0;
    const bob = Math.sin(state.frame * 0.05 + r.i * 1.7) * 1.2 + (stage === 'crumble' ? Math.sin(state.frame * 0.9) * 1.2 : 0);
    moveMover(state, r.m, r.x, topAt(L.home) + bob + r.sink);
    if (rider) {
      p.logRoll = { spin: r.spin, lean: r.lean + (stage === 'crumble' ? Math.sin(state.frame * 0.7) * 0.25 : 0) };
      if (input) p.facing = input > 0 ? 1 : -1;
      if (!jammed) out = { ...out, left: false, right: false };
    }
  }
  if (!on && p.logRoll) p.logRoll = undefined;
  return out;
};

/** The footbridges sagged low over the river: stood up under one (or jumping into it), it hits him. */
let beamCd = 0;
export const updateBeams = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player;
  beamCd = Math.max(0, beamCd - 1);
  if (beamCd > 0 || p.health <= 0 || p.inCutscene) return;
  for (const x of BEAMS) {
    const bottom = topAt(x) - BEAM_GAP;
    if (p.pos.x + p.width - 8 > x - 34 && p.pos.x + 8 < x + 34 && p.pos.y < bottom && p.pos.y + p.height > bottom - 300 && !(p.isDucking && p.isGrounded)) {
      beamCd = 50;
      hurtPlayer(ctx, 12, 'm2:wp2_beam', { x: 0, y: 2 }, 12);
      playSound('crack', 0.8, -4); playSound('ignite', 0.5, 2);
      for (let i = 0; i < 10; i++) state.particles.push({ pos: { x, y: bottom - 6 }, vel: { x: (Math.random() - 0.5) * 5, y: -Math.random() * 3 }, life: 26, color: FIRE[1 + (i % 4)], size: 3 });
    }
  }
};


// ---------------------------------------------------------------------------------------------------------------
// Drawing (the SNES pass: the mooring posts in their wood's ramp, inked, ringed with rope; the footbridges' hung walls of
// planks in steps, grain and nail heads, charred and glowing at their broken ends, the DUCK board bevelled and hung)

const STAKE = ['#1C0E06', '#462614', '#7A4A2A', '#B27C4E', '#D8A878'];
const INK2 = '#0A0604';
const rr = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/** A mooring post stood up out of the water, its waterline at (0, 0). */
const paintStake = (c: Ctx) => {
  rr(c, -5, -46, 11, 52, INK2); rr(c, -4, -45, 9, 50, STAKE[2]); rr(c, -4, -45, 2, 50, STAKE[3]); rr(c, 3, -45, 2, 50, STAKE[1]);
  for (let y = -38; y < 0; y += 9) rr(c, -2, y, 1, 4, STAKE[1]);
  c.fillStyle = INK2; c.beginPath(); c.moveTo(-5, -46); c.lineTo(0, -53); c.lineTo(6, -46); c.closePath(); c.fill();
  c.fillStyle = STAKE[3]; c.beginPath(); c.moveTo(-3, -46); c.lineTo(0, -51); c.lineTo(1, -46); c.closePath(); c.fill();
  for (let k = 0; k < 3; k++) { rr(c, -5, -36 + k * 3, 11, 2, '#8A7448'); rr(c, -5, -36 + k * 3, 11, 1, '#B8A06A'); }
  rr(c, -4, -46, 9, 3, STAKE[0]);
};
/** World space, behind him: each log (tied up: its stake and rope), burning in its stage. */
export const drawLogs2 = (c: Ctx, state: GameState, logs: Log2Run[]) => {
  const f = state.frame, x0 = state.camera.x - 200, x1 = state.camera.x + W + 200;
  for (const r of logs) {
    const L = LOGS2[r.i];
    if (r.x + L.len < x0 || r.x > x1) continue;
    const sx = L.home - 8, wl = waterY(L.home);
    c.save(); c.translate(sx, wl); stamp(c, 'wp2-stake', -8, -56, 18, 64, paintStake); c.restore();
    if (r.gone) continue;
    if (r.moored) {
      const rope = (w: number, col: string, dy = 0) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(sx, wl - 34 + dy); c.quadraticCurveTo((sx + r.x + 8) / 2, r.m.b.y + 16 + dy, r.x + 8, r.m.b.y + 10 + dy); c.stroke(); };
      rope(4, INK2); rope(2, '#B8A06A'); rope(1, '#E2CC94', -1);
    }
    const { k, stage } = logStage(r), top = r.m.b.y;
    drawLog(c, r.x, top, L.len, r.spin);
    if (r.lit) {
      // (charring over it, in steps: darker and darker; the glowing cracks along it from the smolder on)
      const char = Math.min(3, Math.floor(k * 5));
      if (char > 0) { c.globalAlpha = 0.25 * char; c.fillStyle = '#120806'; c.fillRect(Math.round(r.x + 4), Math.round(top), L.len - 8, 2 * R); c.globalAlpha = 1; }
      if (stage !== 'catch') {
        for (let n = 0; n < 5; n++) {
          const cx = Math.round(r.x + 14 + n * ((L.len - 28) / 4)), cy = Math.round(top + 8 + (n % 2) * 6), glow = (f + n * 9) % 30 < 15, w = 8 + (n % 3) * 4;
          c.fillStyle = glow ? FIRE[4] : FIRE[3]; c.fillRect(cx, cy, w, 1);
          c.fillStyle = FIRE[2]; c.fillRect(cx, cy + 1, w, 1); c.fillRect(cx + 4, cy + 1, 1, 4);
        }
      }
      if (stage === 'flames' || stage === 'crumble') fireRow(c, r.x + 6, r.x + L.len - 6, top + 4, stage === 'crumble' ? 50 : 30 + (k - 0.5) * 40, f, 16, r.i * 5);
      else if (stage === 'smolder') for (let n = 0; n < 3; n++) flame(c, r.x + 30 + n * (L.len - 60) / 2, top + 3, 6, 10, f, r.i * 3 + n);
      if (f % (stage === 'catch' ? 6 : 3) === 0) state.particles.push({ pos: { x: r.x + 10 + Math.random() * (L.len - 20), y: top }, vel: { x: (Math.random() - 0.5) * 0.5, y: -0.8 - Math.random() * 0.6 }, life: 34, color: stage === 'catch' ? '#8A8494' : '#3F3A46', size: 3 + Math.random() * 3 });
      if (stage === 'crumble' && f % 5 === 0) state.particles.push({ pos: { x: r.x + (Math.random() < 0.5 ? 6 : L.len - 6), y: top + 10 }, vel: { x: (Math.random() - 0.5) * 2, y: 1 }, life: 26, color: '#1A0E08', size: 4, grav: 0.3 });
    }
  }
};

/** The footbridges sagged low across the river (a burnt boardwalk from up out of sight, its planks hung down in a wall
 *  to just over a log: no going over it, duck under): back half (its far posts, darker) behind him. */
const BRIDGE_TOP = GY - 720;
const PL = ['#1E120A', '#3A2414', '#4E321C', '#6A4628', '#8A6038'];
export const drawBeamsBack = (c: Ctx, state: GameState) => {
  for (const x of BEAMS) {
    if (x < state.camera.x - 100 || x > state.camera.x + W + 100) continue;
    const wl = waterY(x);
    for (const px of [x - 40, x + 32]) { rr(c, px, BRIDGE_TOP, 8, wl - BRIDGE_TOP, '#140A06'); rr(c, px, BRIDGE_TOP, 2, wl - BRIDGE_TOP, '#24140A'); }
  }
};
/** The hung wall, its middle at x = 0 (painted the once per height). */
const paintBridge = (g: Ctx, bottom: number, wl: number) => {
  rr(g, -37, BRIDGE_TOP, 74, bottom - BRIDGE_TOP, INK2);
  for (let y = BRIDGE_TOP + 4, n = 0; y < bottom - 4; y += 16, n++) {
    const off = (n % 3) - 1;
    rr(g, -34 + off, y, 68, 13, PL[n % 2 ? 1 : 2]);
    rr(g, -34 + off, y, 68, 2, PL[3]); rr(g, -34 + off, y, 68, 1, PL[4]); rr(g, -34 + off, y + 11, 68, 2, PL[0]);
    for (let gx = -30; gx < 30; gx += 13) rr(g, gx + (n * 5) % 9, y + 5, 7, 1, PL[0]);
    rr(g, -30, y + 6, 2, 2, '#9CA3AF'); rr(g, 27, y + 6, 2, 2, '#9CA3AF');
  }
  // (scorched lower down: dithered black climbing up from the broken end)
  g.fillStyle = '#120806';
  for (let y = Math.round(bottom - 60); y < bottom; y += 2) for (let xx = -34; xx < 34; xx += 2) if (((xx + y) >> 1) % 2 === 0 && (bottom - y) / 60 > (((xx + 40) * 7 + y * 3) % 10) / 10) g.fillRect(xx, y, 2, 2);
  // (the posts down into the river, either side, in front)
  for (const px of [-46, 36]) { const h = wl + 30 - BRIDGE_TOP; rr(g, px, BRIDGE_TOP, 10, h, INK2); rr(g, px + 1, BRIDGE_TOP, 8, h, PL[2]); rr(g, px + 1, BRIDGE_TOP, 2, h, PL[4]); rr(g, px + 7, BRIDGE_TOP, 2, h, PL[0]); for (let y = BRIDGE_TOP + 40; y < wl; y += 60) rr(g, px, y, 10, 3, '#3F3F46'); }
  // (the DUCK board: hung off it on two chains, bevelled, its letters dropped)
  const by = Math.round(bottom - 64);
  rr(g, -16, by - 10, 1, 10, '#71717A'); rr(g, 15, by - 10, 1, 10, '#71717A');
  rr(g, -26, by, 52, 22, INK2); rr(g, -25, by + 1, 50, 20, '#CA8A04'); rr(g, -25, by + 1, 50, 2, '#FDE68A'); rr(g, -25, by + 3, 2, 18, '#FACC15'); rr(g, 22, by + 1, 3, 20, '#854D0E'); rr(g, -25, by + 19, 50, 2, '#713F12');
  g.font = '8px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = '#FDE68A'; g.fillText('DUCK', 1, by + 16); g.fillStyle = INK2; g.fillText('DUCK', 0, by + 15); g.textAlign = 'left';
};
/** ...and the wall of it (at the play plane: he goes under it) and its near posts, in front of him and the log. */
export const drawBeamsFront = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const x of BEAMS) {
    if (x < state.camera.x - 100 || x > state.camera.x + W + 100) continue;
    const bottom = topAt(x) - BEAM_GAP, wl = waterY(x);
    c.save(); c.translate(x, 0); stamp(c, `wp2-bridge-${Math.round(bottom)}-${Math.round(wl)}`, -50, BRIDGE_TOP, 100, wl + 32 - BRIDGE_TOP, g => paintBridge(g, bottom, wl)); c.restore();
    // (its bottom edge: the planks' broken ends, glowing; flames along it)
    for (let k = 0; k < 6; k++) { c.fillStyle = (k + (f >> 3)) % 2 ? FIRE[2] : FIRE[3]; c.fillRect(Math.round(x - 34 + k * 12), Math.round(bottom - 4 - (k % 3)), 8, 3); }
    fireRow(c, x - 34, x + 34, bottom - 2, 22, f, 14, Math.round(x / 9));
    fireRow(c, x - 34, x + 34, bottom - 80, 26, f, 18, Math.round(x / 7));
  }
};
