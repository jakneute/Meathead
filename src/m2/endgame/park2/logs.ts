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
import { CANVAS_WIDTH as W } from '../../../m1/constants';
import { LOGS2, CURRENT, BEAMS, BEAM_GAP, RIVER_Y, GY } from './geo';
import { fireRow, flame, FIRE } from './fire';

type Ctx = CanvasRenderingContext2D;
const R = 14, SINK = 2, PUSH = 3.2, ANSWER = 0.08, EASE = 0.03;
const TOP = RIVER_Y - (2 * R - SINK);
const BACK = 300;

export interface Log2Run { i: number; x: number; vx: number; spin: number; lean: number; lastVx: number; bumpCd: number; moored: boolean; burn: number; lit: boolean; gone: number; m: Mover; sink: number }
export const buildLogs2 = (state: GameState): Log2Run[] => LOGS2.map((L, i) => {
  const r: Log2Run = { i, x: L.home, vx: 0, spin: 0, lean: 0, lastVx: 0, bumpCd: 0, moored: true, burn: 0, lit: false, gone: 0, m: makeMover(state, L.home, TOP, L.len, `wp2-log-${i}`), sink: 0 };
  moveMover(state, r.m, r.x, TOP);
  return r;
});
/** How far it's burned (0..1) and the stage it's at. */
export const logStage = (r: Log2Run) => { const k = r.burn / LOGS2[r.i].fuse; return { k, stage: !r.lit ? 'whole' : k < 0.2 ? 'catch' : k < 0.5 ? 'smolder' : k < 0.85 ? 'flames' : 'crumble' }; };
export const logUnder2 = (state: GameState, logs: Log2Run[]) => logs.find(r => !r.gone && riding(state, r.m)) ?? null;

const splash = (state: GameState, x: number, n = 8) => { for (let i = 0; i < n; i++) state.particles.push({ pos: { x, y: RIVER_Y - 4 }, vel: { x: (Math.random() - 0.5) * 5, y: -1.5 - Math.random() * 4 }, life: 22, color: FIRE[1 + (i % 4)], size: 2 + Math.random() * 3 }); };

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
        moveMover(state, r.m, r.x, TOP);
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
    moveMover(state, r.m, r.x, TOP + bob + r.sink);
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
  const bottom = TOP - BEAM_GAP;
  for (const x of BEAMS) {
    if (p.pos.x + p.width - 8 > x - 34 && p.pos.x + 8 < x + 34 && p.pos.y < bottom && p.pos.y + p.height > bottom - 300 && !(p.isDucking && p.isGrounded)) {
      beamCd = 50;
      hurtPlayer(ctx, 12, 'm2:wp2_beam', { x: 0, y: 2 }, 12);
      playSound('crack', 0.8, -4); playSound('ignite', 0.5, 2);
      for (let i = 0; i < 10; i++) state.particles.push({ pos: { x, y: bottom - 6 }, vel: { x: (Math.random() - 0.5) * 5, y: -Math.random() * 3 }, life: 26, color: FIRE[1 + (i % 4)], size: 3 });
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const STAKE = ['#1C0E06', '#462614', '#7A4A2A', '#B27C4E'];
/** World space, behind him: each log (tied up: its stake and rope), burning in its stage; the footbridges' far posts. */
export const drawLogs2 = (c: Ctx, state: GameState, logs: Log2Run[]) => {
  const f = state.frame, x0 = state.camera.x - 200, x1 = state.camera.x + W + 200;
  for (const r of logs) {
    const L = LOGS2[r.i];
    if (r.x + L.len < x0 || r.x > x1) continue;
    // (the stake at the near bank, its rope to the log while it's tied up; a burnt stub of rope once it's not)
    // (each tied up to its own post: the near bank's, or a mooring post stood up out of the river)
    const sx = L.home - 8;
    c.fillStyle = STAKE[0]; c.fillRect(sx - 4, RIVER_Y - 44, 9, 50); c.fillStyle = STAKE[2]; c.fillRect(sx - 3, RIVER_Y - 43, 7, 48); c.fillStyle = STAKE[3]; c.fillRect(sx - 3, RIVER_Y - 43, 2, 48);
    c.fillStyle = STAKE[0]; c.beginPath(); c.moveTo(sx - 4, RIVER_Y - 44); c.lineTo(sx, RIVER_Y - 50); c.lineTo(sx + 5, RIVER_Y - 44); c.closePath(); c.fill();
    if (r.gone) continue;
    if (r.moored) { c.strokeStyle = '#0A0604'; c.lineWidth = 4; c.beginPath(); c.moveTo(sx, RIVER_Y - 34); c.quadraticCurveTo((sx + r.x + 8) / 2, r.m.b.y + 16, r.x + 8, r.m.b.y + 10); c.stroke(); c.strokeStyle = '#B8A06A'; c.lineWidth = 2; c.stroke(); }
    const { k, stage } = logStage(r), top = r.m.b.y;
    drawLog(c, r.x, top, L.len, r.spin);
    if (r.lit) {
      // (charring over it: darker and darker; the glowing cracks along it from the smolder on)
      const char = Math.min(0.75, k * 1.3);
      c.globalAlpha = char; c.fillStyle = '#120806'; c.fillRect(Math.round(r.x + 4), Math.round(top), L.len - 8, 2 * R); c.globalAlpha = 1;
      if (stage !== 'catch') {
        for (let n = 0; n < 5; n++) {
          const cx = r.x + 14 + n * ((L.len - 28) / 4), glow = (f + n * 9) % 30 < 15;
          c.fillStyle = glow ? FIRE[3] : FIRE[2];
          c.fillRect(Math.round(cx), Math.round(top + 8 + (n % 2) * 6), 8 + (n % 3) * 4, 1);
          c.fillRect(Math.round(cx + 4), Math.round(top + 9 + (n % 2) * 6), 1, 4);
        }
      }
      // (the flames: along its top from the flames stage, big when it crumbles; the smoke from the start)
      if (stage === 'flames' || stage === 'crumble') fireRow(c, r.x + 6, r.x + L.len - 6, top + 4, stage === 'crumble' ? 50 : 30 + (k - 0.5) * 40, f, 16, r.i * 5);
      else if (stage === 'smolder') for (let n = 0; n < 3; n++) flame(c, r.x + 30 + n * (L.len - 60) / 2, top + 3, 6, 10, f, r.i * 3 + n);
      if (f % (stage === 'catch' ? 6 : 3) === 0) state.particles.push({ pos: { x: r.x + 10 + Math.random() * (L.len - 20), y: top }, vel: { x: (Math.random() - 0.5) * 0.5, y: -0.8 - Math.random() * 0.6 }, life: 34, color: stage === 'catch' ? '#8A8494' : '#3F3A46', size: 3 + Math.random() * 3 });
      // (crumbling: chunks off its ends)
      if (stage === 'crumble' && f % 5 === 0) state.particles.push({ pos: { x: r.x + (Math.random() < 0.5 ? 6 : L.len - 6), y: top + 10 }, vel: { x: (Math.random() - 0.5) * 2, y: 1 }, life: 26, color: '#1A0E08', size: 4, grav: 0.3 });
    }
  }
};

/** The footbridges sagged low across the river (a burnt wooden bridge from up out of sight, its planks and rails hung
 *  down in a wall to just over a log: no going over it, duck under): back half (its far rail, posts) behind him. */
const BRIDGE_TOP = GY - 620;
export const drawBeamsBack = (c: Ctx, state: GameState) => {
  for (const x of BEAMS) {
    if (x < state.camera.x - 100 || x > state.camera.x + W + 100) continue;
    // (the far posts, darker, down into the river)
    c.fillStyle = '#140A06'; c.fillRect(x - 40, BRIDGE_TOP, 8, RIVER_Y - BRIDGE_TOP); c.fillRect(x + 32, BRIDGE_TOP, 8, RIVER_Y - BRIDGE_TOP);
  }
};
/** ...and the wall of it (at the play plane: he goes under it) and its near posts, in front of him and the log. */
export const drawBeamsFront = (c: Ctx, state: GameState) => {
  const bottom = TOP - BEAM_GAP, f = state.frame;
  for (const x of BEAMS) {
    if (x < state.camera.x - 100 || x > state.camera.x + W + 100) continue;
    // (the wall of it: hung planks, charred, gappy only at the very bottom edge)
    c.fillStyle = '#0A0604'; c.fillRect(x - 36, BRIDGE_TOP, 72, bottom - BRIDGE_TOP);
    for (let y = BRIDGE_TOP + 4, n = 0; y < bottom - 4; y += 16, n++) {
      c.fillStyle = n % 2 ? '#2A1A10' : '#3A2414'; c.fillRect(x - 34, y, 68, 12);
      c.fillStyle = '#4E321C'; c.fillRect(x - 34, y, 68, 2);
    }
    // (its bottom edge: the planks' broken ends, glowing; flames along it)
    for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? FIRE[2] : FIRE[3]; c.fillRect(x - 34 + k * 12, bottom - 4 - (k % 3), 8, 3); }
    fireRow(c, x - 34, x + 34, bottom - 2, 22, f, 14, Math.round(x / 9));
    fireRow(c, x - 34, x + 34, bottom - 70, 26, f, 18, Math.round(x / 7));
    // (a sign hung off it: DUCK)
    c.fillStyle = '#0A0604'; c.fillRect(x - 24, bottom - 46, 48, 20); c.fillStyle = '#FDE047'; c.fillRect(x - 22, bottom - 44, 44, 16);
    c.font = '8px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = '#0A0604'; c.fillText('DUCK', x, bottom - 32); c.textAlign = 'left';
    c.fillStyle = '#0A0604'; c.fillRect(x - 46, BRIDGE_TOP, 10, RIVER_Y + 30 - BRIDGE_TOP); c.fillRect(x + 36, BRIDGE_TOP, 10, RIVER_Y + 30 - BRIDGE_TOP);
    c.fillStyle = '#3A2414'; c.fillRect(x - 45, BRIDGE_TOP, 8, RIVER_Y + 30 - BRIDGE_TOP); c.fillRect(x + 37, BRIDGE_TOP, 8, RIVER_Y + 30 - BRIDGE_TOP);
    c.fillStyle = '#5E3E22'; c.fillRect(x - 45, BRIDGE_TOP, 2, RIVER_Y + 30 - BRIDGE_TOP); c.fillRect(x + 37, BRIDGE_TOP, 2, RIVER_Y + 30 - BRIDGE_TOP);
  }
};
export { TOP as LOG_TOP };
