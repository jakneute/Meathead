// THE FLOODED PIPES' JUNCTIONS (the owner's: "the 'stairs' ... will open/close forked paths in the swimmin section in
// the second half. one path will be the way forward, the other will be hazards like blowing fans, pushback currents,
// etc. it's not stairs really but the alternations function similarly to stairs as its diagonal alignment switches
// between two configuration, making one pipe junction open/closed and alternates").
//
// Each junction (geo.ts JUNCTIONS) is a chamber with two mouths in its far wall and a steel flap hinged between them:
// up, it shuts the forward mouth (the pipe on up the diagonal to the next chamber); down, the hazard mouth. The flaps
// run on a clock like Fairy Land's staircases (fantasy/stairs.ts: held, the TELL, swung), every other chamber out of
// step: the whole diagonal's in one of two configurations, then the other. So he goes up it a chamber a switch.
//
//   READ IT   over each mouth a lamp: green, open; red, shut. The tell (the staircases' TELL, 54 frames): the lamps
//             blink, a klaxon, the flap shudders on its hinge. The swing (30 frames): the flap's turned through the
//             chamber (the block over the mouths changes over half way).
//   HAZARDS   a hazard mouth open lets its hazard out across the chamber's bottom three rows (out through the inlet,
//             the way he came in): 'push' a pushback current (white streaks: it shoves him back down the inlet pipe),
//             'fan' the same blown by the fan in its pipe (its blades hurt), 'bleach' cheap chlorine leaking in (a
//             yellow-green murk that burns). Stay up out of it (the air pocket's at the top, where there is one).
//   CLOCKS    the first junction's on its own, slow (taught); the chain of five on one clock, quicker.
//   SAFE      started at a checkpoint in a chamber: the clock's set so that chamber's hazard is shut for the whole of
//             its first hold (safe-checkpoints).
//
// The flap closing on him: he's put back into the chamber (or on through, if he's mostly through).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Block } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { hazardVictims, hazardHit, boxHits, setHazardZones } from '../../hazardHit';
import { envSound } from '../../bossQuiet';
import { CELL, JW, JUNCTIONS, cellX, cellY, isRock, cellAt, CP3, type JunctionDef } from './geo';
import { vis, INK } from './art';

type Ctx = CanvasRenderingContext2D;
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

/** The staircases' tell (fantasy/stairs.ts TELL), the swing, each clock's hold. */
export const TELL = 54, SWING = 30;
export const HOLD = { teach: 220, chain: 140 };
const AWAY = -99999;

export interface Junction { d: JunctionDef; f: Block; z: Block; ang: number; fOpen: boolean; tell: number; moving: boolean; lastPh: string }
export interface Junctions { t: { teach: number; chain: number }; list: Junction[]; pushedAt: number }

/** The clock: which configuration (0, 1), and where in it ('hold' / 'tell' / 'swing', its k). */
const clock = (t: number, hold: number) => {
  const per = hold + SWING, k = Math.floor(t / per) % 2, r = t % per;
  if (r < hold - TELL) return { k, ph: 'hold' as const, u: 0 };
  if (r < hold) return { k, ph: 'tell' as const, u: (r - (hold - TELL)) / TELL };
  return { k, ph: 'swing' as const, u: (r - hold) / SWING };
};
/** Forward open in configuration k? */
const fOpenIn = (j: JunctionDef, k: number) => (k + j.parity) % 2 === 0;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
/** The flap's angle: up (-PI/2) shuts the forward mouth; down (PI/2) the hazard one; through PI (into the chamber) between. */
const UPA = -Math.PI / 2, DNA = Math.PI / 2;

const mouthF = (d: JunctionDef) => ({ x: cellX(d.c0 + JW), y: cellY(d.r0 + 1), w: CELL, h: CELL * 3 });
const mouthZ = (d: JunctionDef) => ({ x: cellX(d.c0 + JW), y: cellY(d.r0 + 5), w: CELL, h: CELL * 3 });
/** The chamber's bottom three rows (and the inlet), where an open hazard comes out. */
export const streamBox = (d: JunctionDef) => ({ x: cellX(d.c0 - 3), y: cellY(d.r0 + 5), w: CELL * (JW + 4), h: CELL * 3 });
/** The hazard pipe beyond the mouth (the fan's in its end). */
const pipeBox = (d: JunctionDef) => ({ x: cellX(d.c0 + JW + 1), y: cellY(d.r0 + 5), w: CELL * 6, h: CELL * 3 });
const fanX = (d: JunctionDef) => cellX(d.c0 + JW + 6) + 20;

export const newJunctions = (state: GameState, cp: number): Junctions => {
  // (started in a chamber: its hazard shut for the whole first hold)
  const chainPer = HOLD.chain + SWING;
  const atChain = cp === CP3.chain ? JUNCTIONS.find(j => j.clock === 'chain' && j.r0 <= 18 && j.r0 + 8 > 18) : null;
  const t = { teach: 0, chain: atChain && !fOpenIn(atChain, 0) ? chainPer : 0 };
  const list = JUNCTIONS.map(d => {
    const f: Block = { ...mouthF(d), type: 'wall', hidden: true, tag: 'wp3-valve' } as Block;
    const z: Block = { ...mouthZ(d), type: 'wall', hidden: true, tag: 'wp3-valve' } as Block;
    return { d, f, z, ang: UPA, fOpen: false, tell: 0, moving: false, lastPh: 'hold' };
  });
  const jn: Junctions = { t, list, pushedAt: -1e9 };
  set(state, jn, true);
  return jn;
};
export const junctionBlocks = (jn: Junctions) => jn.list.flatMap(j => [j.f, j.z]);

/** Each junction's flap and blocks from its clock. `first`: no sounds, no shoving. */
const set = (state: GameState, jn: Junctions, first = false) => {
  const p = state.player;
  for (const j of jn.list) {
    const ck = clock(jn.t[j.d.clock], HOLD[j.d.clock]);
    const openNow = fOpenIn(j.d, ck.k), openNext = fOpenIn(j.d, ck.k + 1);
    const from = openNow ? DNA : UPA, to = openNext ? DNA : UPA;
    // (swinging: through the chamber (PI), not the rock)
    if (ck.ph === 'swing' && from !== to) j.ang = from === UPA ? UPA - Math.PI * ease(ck.u) : DNA + Math.PI * ease(ck.u);
    else j.ang = from;
    j.moving = ck.ph === 'swing' && from !== to; j.tell = ck.ph === 'tell' && from !== to ? ck.u : 0;
    // (the blocks change over half way through the swing)
    const fOpen = ck.ph === 'swing' && ck.u >= 0.5 ? openNext : openNow;
    if (fOpen !== j.fOpen || first) {
      j.fOpen = fOpen;
      const shut = fOpen ? j.z : j.f, open = fOpen ? j.f : j.z, m = fOpen ? mouthZ(j.d) : mouthF(j.d), om = fOpen ? mouthF(j.d) : mouthZ(j.d);
      open.y = AWAY; shut.y = m.y; shut.x = m.x; open.x = om.x;
      // (shut on him: back into the chamber, or on through if he's mostly through)
      if (!first && p.pos.x + p.width > m.x && p.pos.x < m.x + m.w && p.pos.y + p.height > m.y && p.pos.y < m.y + m.h) {
        const cx = p.pos.x + p.width / 2;
        p.pos.x = cx > m.x + m.w * 0.75 ? m.x + m.w + 1 : m.x - p.width - 1;
        p.vel.x = 0;
      }
    }
    const ph = j.tell > 0 ? 'tell' : j.moving ? 'swing' : 'hold';
    if (!first && ph !== j.lastPh) {
      const x = m0x(j), y = cellY(j.d.r0 + 4);
      if (ph === 'tell') { envSound(state, x, 'alarm', 0.3, 4, y); }
      else if (ph === 'swing') envSound(state, x, 'grind', 0.5, -6, y);
      else if (j.lastPh === 'swing') envSound(state, x, 'clang', 0.6, -10, y);
    }
    j.lastPh = ph;
  }
};
const m0x = (j: Junction) => cellX(j.d.c0 + JW) + 20;

/** A frame: the clocks on, the flaps, the open hazards on him and on the cast. */
export const updateJunctions = (ctx: FrameContext, jn: Junctions) => {
  const { state } = ctx, p = state.player, f = state.frame;
  jn.t.teach++; jn.t.chain++;
  set(state, jn);
  const pb = { x: p.pos.x + 6, y: p.pos.y + 4, w: p.width - 12, h: p.height - 8 };
  const inBox = (b: { x: number; y: number; w: number; h: number }) => pb.x < b.x + b.w && pb.x + pb.w > b.x && pb.y < b.y + b.h && pb.y + pb.h > b.y;
  for (const j of jn.list) {
    if (j.fOpen) continue;
    const d = j.d, sb = streamBox(d), pipe = pipeBox(d);
    // ---- him, in the open hazard's stream (or its pipe)
    if (p.health > 0 && !p.inCutscene && p.swimming && (inBox(sb) || inBox(pipe))) {
      const push = d.hazard === 'bleach' ? -1.1 : d.hazard === 'fan' ? -2.9 : -3.4;
      // (shoved along, not into rock)
      const nx = p.pos.x + push;
      if (!isRock(cellAt(nx + 4, p.pos.y + p.height / 2)) && !isRock(cellAt(nx + 4, p.pos.y + 8)) && !isRock(cellAt(nx + 4, p.pos.y + p.height - 8))) p.pos.x = nx;
      if (p.vel.x > 0) p.vel.x *= 0.9;
      if (d.hazard !== 'bleach' && inBox({ x: sb.x, y: sb.y, w: CELL * 3, h: sb.h })) jn.pushedAt = f;
      if (d.hazard === 'bleach' && f % 30 === 0 && p.invincibilityTimer <= 0) { hurtPlayer(ctx, 6, 'm2:wp3_bleach', { x: -2, y: -2 }, 10); }
    }
    // ---- the fan's blades (in its pipe's end): always turning, hurt to touch (open or not, he can't get in shut)
    if (d.hazard === 'fan' && p.health > 0 && inBox({ x: fanX(d) - 30, y: pipe.y, w: 40, h: pipe.h }) && p.invincibilityTimer <= 0) { hurtPlayer(ctx, 14, 'm2:wp3_fan', { x: -6, y: -2 }, 18); shakeScreen(state, 6, 3); playSound('crunch', 0.7, 4); }
    // ---- the cast in it: shoved, burned, chopped
    for (const e of hazardVictims(state, { flyers: true })) {
      if (!boxHits(e, sb.x, sb.y, sb.w, sb.h) && !boxHits(e, pipe.x, pipe.y, pipe.w, pipe.h)) continue;
      e.pos.x -= d.hazard === 'bleach' ? 1 : 3;
      if (d.hazard === 'bleach' && f % 30 === 0) hazardHit(ctx, e, 8, sb.x + sb.w, 'BLEACHED!', { color: '#D9F99D' });
      if (d.hazard === 'fan' && boxHits(e, fanX(d) - 30, pipe.y, 40, pipe.h) && !(e.hitFlash && e.hitFlash > 0)) hazardHit(ctx, e, 40, fanX(d), 'BLENDED!', { color: '#FCA5A5' });
    }
  }
  setHazardZones(state, 'wp3-valves', jn.list.filter(j => !j.fOpen).map(j => { const b = streamBox(j.d); return { x0: b.x, x1: b.x + b.w, y0: b.y, y1: b.y + b.h }; }));
};
/** Shoved back out of a chamber by its current just now (his line). */
export const pushedBack = (state: GameState, jn: Junctions) => state.frame - jn.pushedAt < 2;

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the frame round the mouths, the lamps, the flap; the open hazard's stream; the fans

export const drawJunctions = (c: Ctx, state: GameState, jn: Junctions) => {
  const f = state.frame;
  for (const j of jn.list) {
    const d = j.d, mx = cellX(d.c0 + JW), x0 = cellX(d.c0 - 3);
    if (!vis(state, x0, mx + CELL * 8)) continue;
    const yF = cellY(d.r0 + 1), yZ = cellY(d.r0 + 5), hy = cellY(d.r0 + 4) + 20, hx = mx + 20;
    // ---- the hazard pipe's end: the fan (its blades turning), or a grate with the intake behind it
    const px = fanX(d), py = yZ + 60;
    if (d.hazard === 'fan') {
      R(c, px - 6, yZ, 12, 120, INK);
      for (let k = 0; k < 3; k++) { const a = f * 0.35 + k * 2.09, ex = Math.cos(a) * 54, ey = Math.sin(a) * 54; c.strokeStyle = INK; c.lineWidth = 12; c.beginPath(); c.moveTo(px, py); c.lineTo(px + ex * 0.25, py + ey); c.stroke(); c.strokeStyle = '#9CA3AF'; c.lineWidth = 8; c.stroke(); }
      R(c, px - 8, py - 8, 16, 16, '#4B5563');
    } else {
      R(c, px - 10, yZ, 20, 120, INK);
      for (let k = 0; k < 6; k++) R(c, px - 8, yZ + 4 + k * 20, 16, 10, d.hazard === 'bleach' ? '#65A30D' : '#475569');
    }
    // ---- the open hazard's stream across the chamber's bottom (and out the inlet)
    if (!j.fOpen) {
      const sb = streamBox(d);
      if (d.hazard === 'bleach') {
        for (let k = 0; k < 9; k++) { const u = ((k / 9) - f * 0.004 + 10) % 1; c.globalAlpha = 0.35; c.fillStyle = k % 2 ? '#BEF264' : '#D9F99D'; c.beginPath(); c.ellipse(sb.x + u * sb.w, sb.y + 20 + (k % 3) * 38, 34, 18, 0, 0, Math.PI * 2); c.fill(); }
        c.globalAlpha = 1;
      } else {
        for (let k = 0; k < 14; k++) { const u = ((k * 0.37) - f * (d.hazard === 'fan' ? 0.018 : 0.022) + 10) % 1, y = sb.y + 8 + ((k * 23) % (sb.h - 16)); R(c, sb.x + u * sb.w, y, 26, 2, 'rgba(230, 255, 250, 0.7)'); R(c, sb.x + u * sb.w + 26, y, 8, 2, 'rgba(230, 255, 250, 0.35)'); }
      }
    }
    // ---- the frame round the mouths (riveted steel), the lamps, the hazard's plate
    R(c, mx - 6, yF - 12, 52, 12, INK); R(c, mx - 4, yF - 10, 48, 8, '#4B5563');
    R(c, mx - 6, yZ + 120, 52, 12, INK); R(c, mx - 4, yZ + 122, 48, 8, '#4B5563');
    const blink = j.tell > 0 && Math.floor(f / 6) % 2 === 0;
    const lamp = (y: number, open: boolean) => { R(c, mx - 22, y - 2, 16, 16, INK); R(c, mx - 20, y, 12, 12, blink ? '#FDE047' : open ? '#22C55E' : '#DC2626'); R(c, mx - 18, y + 2, 4, 4, blink ? '#FEF9C3' : open ? '#BBF7D0' : '#FCA5A5'); };
    lamp(yF + 4, j.fOpen); lamp(yZ + 4, !j.fOpen);
    // (the hazard's plate under its lamp: a fan, arrows back, a skull)
    R(c, mx - 26, yZ + 26, 22, 18, '#FACC15'); R(c, mx - 26, yZ + 26, 22, 2, '#FEF08A');
    c.fillStyle = INK;
    if (d.hazard === 'fan') { for (let k = 0; k < 3; k++) { const a = k * 2.09; c.beginPath(); c.ellipse(mx - 15 + Math.cos(a) * 4, yZ + 35 + Math.sin(a) * 4, 4, 2, a, 0, Math.PI * 2); c.fill(); } }
    else if (d.hazard === 'push') { for (const ox of [0, 8]) { c.beginPath(); c.moveTo(mx - 22 + ox, yZ + 35); c.lineTo(mx - 16 + ox, yZ + 30); c.lineTo(mx - 16 + ox, yZ + 40); c.fill(); } }
    else { R(c, mx - 19, yZ + 29, 8, 7, INK); R(c, mx - 18, yZ + 31, 2, 2, '#FACC15'); R(c, mx - 14, yZ + 31, 2, 2, '#FACC15'); R(c, mx - 18, yZ + 38, 6, 2, INK); }
    // ---- the flap: a riveted steel plate off the hinge (shuddering in the tell)
    const shake = j.tell > 0 ? Math.sin(f * 1.7) * 0.05 : 0, a = j.ang + shake, len = 132;
    c.save(); c.translate(hx, hy); c.rotate(a);
    R(c, 0, -11, len, 22, INK); R(c, 2, -9, len - 4, 18, '#6B7280'); R(c, 2, -9, len - 4, 4, '#9CA3AF');
    for (let k = 14; k < len; k += 26) R(c, k, -2, 4, 4, '#D1D5DB');
    c.restore();
    R(c, hx - 12, hy - 12, 24, 24, INK); R(c, hx - 10, hy - 10, 20, 20, '#374151'); R(c, hx - 4, hy - 4, 8, 8, '#9CA3AF');
  }
};
