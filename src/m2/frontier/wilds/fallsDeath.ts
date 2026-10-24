// OVER THE FALLS (the user's: "show a special kill animation if you fall down the waterfall shortly before the train.
// make it gory"). Into the drop past the lip at the long river's end (on foot, swept there swimming, or still on the log
// when it goes over: m2:fr_falls_log) is his own death, a kill cam (screen space, over everything: the section's
// drawHud; the HUD down from its first frame; no input; SKIP >> for the lot, the death scene's own):
//
//   over       the camera at the top of the falls: the river curling over the lip, him carried over it, tipping
//              head first, his scream (by the state of his pants)
//   the rocks  the camera falls with him down the white water, three jagged rocks jutting out into it on the way, and
//              he hits every one: a stop-frame on each (the crunch, the pop, the blood flung up into the spray and
//              washed down the falls after him): the first SNAPs his near knee the wrong way (the bone out through
//              his jeans), the second CRACKs his skull (blood out of his head the rest of the way), the third CRUNCHes
//              the other knee the wrong way too
//   the bottom SPLAT onto the spire of rock in the plunge pool: folded the wrong way over it, belly up, its point out
//              through his gut, his head hanging down one side and his legs the other; the near one tears off at the
//              knee and goes in. Blood down the rock, clouding the white water, carried off downstream with the bits
//              of him (a turd too, if he'd shat himself). (Off the log: it was hung up on the first rock; it comes
//              down a beat after him, BONK, onto him, and rolls off into the pool.)
//   the bear   a grizzly wading in the pool below the falls, fishing: rears up at the splat, then watches his leg
//              float down to it, and eats it, boot and all.
//
// Then the death screen (WATERFALL lines: fallsLines.ts). Everything's a function of the frame it's on (the stills
// stamped: the cliffs, the rocks, the spire), so it's the same however it's watched.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { MeatheadDeath } from '../../../m1/game/player/deathAnim';
import type { DeathFace } from '../../../m1/game/render/player/deathFace';
import { registerDeathAnim, registerDeathKind } from '../../../m1/game/player/deathAnim';
import { registerDeathDraw, body } from '../../../m1/game/render/player/deathAnim';
import { drawLeg, pantsColor, skinTone } from '../../../m1/game/render/player/body';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { registerHurtLines } from '../../kinds';
import { joint2, knee, reachTo, type P2 } from '../../art/limb';
import { meatheadSays, byPants, saidOver, label } from '../section';
import { GY } from '../geometry';
import { drawGrizzly, type BearPose } from '../arena/beasts';
import { type Ctx, box, checker, hash, mix, still, near, pine, fiberglass, skyAt, INK, FIBER, STONE, NEEDLE, BARK, WATER } from './paint';
import { WATERS } from './layout';
import { drawLog } from './logs';
import { WATERFALL_SRC, FALLS_SCREAM, FALLS_HURT } from './fallsLines';

export const FALLS_KILL = 'own:fr_waterfall' as const;
const LOG_SRC = 'm2:fr_falls_log';

// ---------------------------------------------------------------------------------------------------------------
// The beats (frames into his death)

/** Carried over the lip; each rock's hit (a stop-frame of HOLD after each); onto the spire; the whole of it. */
const LEAD = 12, HOLD = 8;
const HITS = [38, 76, 114] as const;
const LAND = 150, LEN = 400;
/** Off the log: it comes loose off the first rock, comes down on him, and rolls off into the pool. */
const LOG_WEDGE = 28, LOG_DROP = LAND - 30, LOG_HIT = LAND + 14, LOG_ROLL = 22;

// ---------------------------------------------------------------------------------------------------------------
// The shot: its own little world (cam units, drawn at 2x: 400 wide, the falls 780 tall), the camera falling with him

const Z = 2, VW = CANVAS_WIDTH / Z, VH = CANVAS_HEIGHT / Z, TALL = 780;
/** The lip; the pool's surface; the curtain's edges at height y (it fans out a little as it falls). */
const LIP_Y = 34, POOL = 712;
const curtL = (y: number) => 120 + Math.max(0, y - LIP_Y) * 0.04;
const curtR = (y: number) => 250 + Math.max(0, y - LIP_Y) * 0.05;
/** The spire's point (he comes down on it), and where his hips end up on it. */
const SPIRE = { x: 172, y: 660 }, PIVOT = { x: 172, y: 650 };

/** His hips at each beat (carried over the lip, the three rocks, the spire), and how far he's turned there. */
const PTS: P2[] = [[108, 28], [128, 44], [150, 208], [212, 372], [150, 524], [PIVOT.x, PIVOT.y]];
const ROTS = [0, 0.8, 4.2, -0.9, 5.1, -Math.PI / 2 - Math.PI * 2];
/** Each fall between: from PTS[i] at frame T0[i], S frames long (under G). */
const G = 0.45;
const SEG = [{ t0: LEAD, S: HITS[0] - LEAD }, { t0: HITS[0] + HOLD, S: HITS[1] - HITS[0] - HOLD }, { t0: HITS[1] + HOLD, S: HITS[2] - HITS[1] - HOLD }, { t0: HITS[2] + HOLD, S: LAND - HITS[2] - HOLD }];

/** Where his hips are and how he's turned, t frames in (falling: ballistic between the rocks; stopped dead on each). */
const himAt = (t: number) => {
  if (t < LEAD) { const k = t / LEAD; return { x: PTS[0][0] + (PTS[1][0] - PTS[0][0]) * k, y: PTS[0][1] + (PTS[1][1] - PTS[0][1]) * k * k, rot: ROTS[1] * k }; }
  for (let i = 0; i < SEG.length; i++) {
    const { t0, S } = SEG[i], a = PTS[i + 1], b = PTS[i + 2];
    if (t < t0) return { x: a[0], y: a[1], rot: ROTS[i + 1] };
    if (t < t0 + S) {
      const s = t - t0, vy = (b[1] - a[1] - 0.5 * G * S * S) / S;
      return { x: a[0] + (b[0] - a[0]) * (s / S), y: a[1] + vy * s + 0.5 * G * s * s, rot: ROTS[i + 1] + (ROTS[i + 2] - ROTS[i + 1]) * (s / S) };
    }
  }
  return { x: PIVOT.x, y: PIVOT.y, rot: -Math.PI / 2 };
};
const camAt = (t: number) => Math.max(0, Math.min(TALL - VH, himAt(Math.min(t, LAND)).y - 130));

/** What's been done to him by t: the near knee, the skull, the far knee; down on the spire. */
const hurtBy = (t: number) => ({ near: t >= HITS[0], skull: t >= HITS[1], far: t >= HITS[2], down: t >= LAND });

// ---------------------------------------------------------------------------------------------------------------
// The registration: his death for the falls (on foot, swimming, off the log)

registerHurtLines(WATERFALL_SRC, FALLS_HURT[WATERFALL_SRC].hurt, FALLS_HURT[WATERFALL_SRC].death);
registerDeathKind(WATERFALL_SRC, FALLS_KILL);
registerDeathKind(LOG_SRC, FALLS_KILL);
registerDeathKind('m2:fr_falls', FALLS_KILL);

/** This death's own: off the log or not, the state of his pants (fixed as it starts), his scream while it's said. */
const run = { log: false, shat: false, nude: false, scream: '' };

registerDeathAnim(FALLS_KILL, {
  frames: LEN, airOk: true, cam: true,
  tick: (ctx, _d, t) => {
    const { state } = ctx;
    if (t === 1) {
      run.log = state.lastHurt?.source === LOG_SRC; run.shat = isShat(state); run.nude = isNude(state); run.scream = '';
      playSound('whoosh', 1, -8); playSound('gush', 0.8, -6);
    }
    // (his scream, the once: up only while it's said)
    if (t === 3) {
      const line = pickLine(byPants(state, FALLS_SCREAM));
      run.scream = line;
      meatheadSays(state, line, false, () => { if (run.scream === line) run.scream = ''; });
    }
    if (t % 70 === 0) playSound('gush', 0.3, -12);
    if (t === HITS[0]) { playSound('crack', 1, -2); playSound('crunch', 1, -4); playSound('splat', 0.7, -2); }
    if (t === HITS[1]) { playSound('crunch', 1, -8); playSound('thud', 1, -6); playSound('splat', 0.8, 0); }
    if (t === HITS[2]) { playSound('crunch', 1, -2); playSound('crack', 0.8, 2); playSound('squish', 0.8, -4); }
    if (t === LAND) { playSound('splat', 1, -6); playSound('crunch', 1, -10); playSound('thud', 1, -8); playSound('squish', 1, -6); }
    if (t === LAND + 4) playSound('roar', 0.45, -6);
    if (t === LEG.t0 + legLands()) playSound('splash', 0.6, 2);
    if (run.log) {
      if (t === LOG_DROP) playSound('crack', 0.6, -10);
      if (t === LOG_HIT) { playSound('thud', 1, -10); playSound('crunch', 1, -6); playSound('squish', 0.8, -8); }
      if (t === LOG_HIT + LOG_ROLL) playSound('splash', 0.9, -8);
    }
    const eat = eatAt();
    if (t === eat) { playSound('crunch', 0.8, -2); playSound('roar', 0.35, -2); }
    if (t > eat && t < eat + CHEW && (t - eat) % 9 === 0) playSound('gnaw', 0.6, (hash(t) - 0.5) * 6);
  },
});
// (in the world: nothing; it's all the kill cam, over everything)
registerDeathDraw(FALLS_KILL, () => { /* drawn in screen space: drawFallsCam */ });

/** Each frame (before logs.ts updateFalls, which it takes over from): over the lip into the drop, or swept to the lip
 *  swimming: that's him. (Swimming's out of it first: a death in the water would only ever come apart.) */
export const updateFallsKill = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player;
  if (p.health <= 0 || p.inCutscene) return;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  for (const W of WATERS) {
    if (!W.lip || !W.fallsTo) continue;
    const over = (cx > W.lip + 4 && cx < W.fallsTo && feet > GY + 8) || (p.swimming && cx > W.lip - 4 && cx < W.fallsTo);
    if (!over) continue;
    p.invincibilityTimer = 0; p.swimming = false;
    playSound('splash', 1, -6); playSound('screams', 0.6, 2);
    hurtPlayer(ctx, 9999, WATERFALL_SRC);
    return;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The stills (stamped in bands down the shot): behind the curtain, and the rocks in front of it

const BAND = 200;
const R_ROCKS: number[][] = [
  // (the three he hits: a ledge off the cliff, a boulder in the stream, another ledge)
  [106, 252, 110, 230, 124, 226, 136, 216, 150, 212, 164, 218, 176, 226, 170, 238, 146, 244, 124, 252],
  [184, 420, 186, 400, 196, 390, 210, 384, 226, 388, 240, 398, 246, 420, 232, 428, 196, 428],
  [106, 570, 110, 548, 126, 546, 140, 536, 152, 534, 168, 540, 182, 548, 176, 560, 150, 566, 124, 572],
  // (the spire in the pool, and the rocks round its foot)
  [138, 718, 150, 690, 158, 684, 164, 668, SPIRE.x, SPIRE.y, 178, 670, 186, 676, 194, 694, 208, 718],
  [56, 718, 66, 700, 84, 692, 100, 696, 114, 690, 128, 704, 132, 718],
  [226, 718, 234, 704, 250, 700, 262, 694, 276, 704, 286, 718],
];

/** A jagged real rock (the falls' own: not the park's fiberglass): inked, stepped shade down it, its upward edges lit,
 *  wet glints. */
const rock = (g: Ctx, pts: number[], R: string[]) => {
  const path = () => { g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); };
  path(); g.strokeStyle = INK; g.lineWidth = 3; g.lineJoin = 'miter'; g.stroke();
  g.fillStyle = R[3]; g.fill();
  let y0 = Infinity, y1 = -Infinity, x0 = Infinity, x1 = -Infinity, cy = 0;
  for (let i = 0; i < pts.length; i += 2) { x0 = Math.min(x0, pts[i]); x1 = Math.max(x1, pts[i]); y0 = Math.min(y0, pts[i + 1]); y1 = Math.max(y1, pts[i + 1]); cy += pts[i + 1]; }
  cy /= pts.length / 2;
  g.save(); path(); g.clip();
  const h = y1 - y0;
  box(g, x0, y0 + h * 0.55, x1 - x0, h, R[2]); checker(g, x0, y0 + h * 0.55 - 2, x1 - x0, 2, R[2], 0);
  box(g, x0, y0 + h * 0.8, x1 - x0, h, R[1]); checker(g, x0, y0 + h * 0.8 - 2, x1 - x0, 2, R[1], 1);
  // (cracks down its face)
  for (let k = 0; k < 3; k++) { const x = x0 + (x1 - x0) * (0.25 + k * 0.25) + hash(pts[0] + k) * 6; box(g, x, y0 + h * 0.3, 1, h * 0.5, R[0]); box(g, x + 1, y0 + h * 0.3, 1, h * 0.4, R[4]); }
  g.restore();
  // (the edges facing up: lit, a wet glint on each)
  for (let i = 0; i < pts.length; i += 2) {
    const ax = pts[i], ay = pts[i + 1], bx = pts[(i + 2) % pts.length], by = pts[(i + 3) % pts.length];
    if ((ay + by) / 2 > cy - 1) continue;
    g.strokeStyle = R[5]; g.lineWidth = 1.5; g.beginPath(); g.moveTo(ax, ay + 1); g.lineTo(bx, by + 1); g.stroke();
    box(g, (ax + bx) / 2, (ay + by) / 2, 2, 1, R[6]);
  }
};

const paintBack = (g: Ctx) => {
  const F = near(FIBER), FD = F.map(c => mix(c, INK, 0.3)), N = near(NEEDLE), B = near(BARK);
  // (the sky over the top of the gorge, in bands)
  for (let k = 0; k < 6; k++) box(g, 0, k * 12 - 4, VW, 12, skyAt(0.35 + k * 0.1));
  // (the far rim's pines; the near rim's, over the river)
  for (let k = 0; k < 7; k++) pine(g, 280 + k * 20 + hash(k) * 8, 70, 46 + hash(k + 3) * 22, 22, k + 40, N.map(c => mix(c, INK, 0.2)), B);
  for (let k = 0; k < 4; k++) pine(g, 6 + k * 30 + hash(k + 9) * 10, 32, 34 + hash(k + 5) * 16, 18, k + 60, N, B);
  // (behind the curtain: the drop's dark wet rock going down, banded)
  box(g, 110, LIP_Y, 190, TALL - LIP_Y, '#0E1A24');
  for (let y = LIP_Y + 20; y < TALL; y += 34) box(g, 110, y, 190, 2, '#1A2A36');
  // (the gorge's walls: the park's fiberglass cliff under the river, the far wall darker)
  fiberglass(g, 0, LIP_Y + 4, 122, TALL - LIP_Y, F, 11);
  fiberglass(g, 290, 66, 110, TALL - 66, FD, 23);
  box(g, 120, LIP_Y + 4, 3, TALL, INK); box(g, 289, 66, 2, TALL, INK);
  // (the river on top of the near cliff, coming to the lip all along it)
  box(g, 0, LIP_Y - 6, 252, 10, WATER[4]); box(g, 0, LIP_Y - 6, 252, 2, WATER[7]); box(g, 0, LIP_Y + 2, 252, 2, WATER[2]);
  // (the pool: deep in the middle, dark under the falls)
  for (let k = 0; k < 5; k++) box(g, 0, POOL + k * 14, VW, 14, WATER[Math.max(0, 4 - k)]);
};
const paintFront = (g: Ctx) => { for (const pts of R_ROCKS) rock(g, pts, near(STONE)); };

// ---------------------------------------------------------------------------------------------------------------
// The live bits

const FL = ['#1E5A6A', '#2E7A88', '#4A9AA6', '#7EC2C8', '#C8ECEE', '#FFFFFF'];
const BLOOD = ['#5A0000', '#7C0A02', '#8B0000', '#B22222', '#DC2626'];

/** The curtain: bands down it, streaks cycling down, white breaking out; the river curling over the lip. */
const drawCurtain = (c: Ctx, f: number, top: number) => {
  const y0 = Math.max(LIP_Y, top - 40), y1 = Math.min(POOL + 4, top + VH + 40);
  for (let y = y0; y < y1; y += 20) {
    const l = curtL(y), r = curtR(y);
    for (let x = l; x < r; x += 6) box(c, x, y, Math.min(6, r - x), 20, FL[Math.floor((x - l) / 6) % 2 ? 1 : 2]);
  }
  for (let k = 0; k < 18; k++) {
    const fr = (k + 0.5) / 18, sp = 5 + (k % 3);
    for (let y = top - 60 + ((f * sp + k * 37) % 60); y < y1; y += 60) {
      if (y < LIP_Y) continue;
      const x = curtL(y) + (curtR(y) - curtL(y)) * fr;
      box(c, x, y, 2, 28, k % 2 ? FL[4] : FL[3]); box(c, x, y + 28, 2, 6, FL[5]);
    }
  }
  for (let y = Math.max(LIP_Y + 40, top - 20); y < y1; y += 22) {
    const l = curtL(y), r = curtR(y);
    for (let x = l; x < r - 6; x += 8) if ((((x | 0) + y + f * 3) >> 3) % 3 === 0) box(c, x, y + ((f * 4) % 22), 6, 4, 'rgba(255, 255, 255, 0.7)');
  }
  // (the lip: the river going glassy and green as it curls over)
  if (top < LIP_Y + 30) for (let x = 0; x < curtR(LIP_Y); x += 4) {
    const curl = Math.round(Math.sin(f * 0.2 + x * 0.3) * 1.5);
    if (x > 100) { box(c, x, LIP_Y - 3 + curl, 4, 4, FL[2]); box(c, x, LIP_Y - 3 + curl, 4, 1, FL[4]); }
    else if ((x + f * 2) % 24 < 8) box(c, x, LIP_Y - 4, 6, 1, FL[4]);
  }
};

/** White water flung up off each rock the falls pour over, and the churn and mist at the foot of the falls. */
const drawSpray = (c: Ctx, f: number) => {
  for (const [rx, ry, w] of [[146, 214, 30], [212, 386, 40], [150, 536, 34]] as const) {
    for (let i = 0; i < 9; i++) {
      const ph = ((f * 1.4 + i * 23) % 36) / 36, sx = rx - w / 2 + ((i * 29) % w) + ph * (i % 2 ? 8 : -8), sy = ry - 2 - Math.sin(ph * Math.PI) * (8 + (i % 4) * 5);
      box(c, sx, sy, 2 + (i % 2), 2, i % 3 ? FL[5] : FL[4]);
    }
  }
  // (the foam where the falls hit the pool)
  const l = curtL(POOL), r = curtR(POOL);
  for (let i = 0; i < 16; i++) {
    const x = l - 14 + ((i * 37 + f * (i % 2 ? 1 : -1)) % (r - l + 28) + (r - l + 28)) % (r - l + 28), bob = Math.sin(f * 0.3 + i) * 2;
    c.fillStyle = i % 3 ? '#F0F9FF' : '#BAE6FD'; c.beginPath(); c.arc(x, POOL + bob, 5 + (i % 4) * 2, Math.PI, 0); c.fill();
  }
  for (let i = 0; i < 8; i++) {
    const my = POOL + 10 - ((f * 0.6 + i * 22) % 120), mx = (l + r) / 2 + Math.sin(f * 0.03 + i * 1.7) * (r - l) * 0.6;
    c.globalAlpha = 0.18; c.fillStyle = '#F0F9FF'; c.beginPath(); c.arc(mx, my, 12 + (i % 3) * 6, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  }
};

/** The pool's surface over whatever's wading or floating in it (its legs under): see-through, the current's streaks
 *  running off downstream. */
const drawPoolFront = (c: Ctx, f: number) => {
  c.fillStyle = 'rgba(28, 70, 98, 0.82)'; c.fillRect(0, POOL + 4, VW, TALL - POOL);
  box(c, 0, POOL + 2, VW, 2, 'rgba(120, 180, 200, 0.8)');
  for (let k = 0; k < 14; k++) { const x = ((k * 53 + f * (0.8 + (k % 3) * 0.3)) % (VW + 40)) - 20; box(c, x, POOL + 6 + (k % 4) * 9, 10 + (k % 3) * 6, 1, k % 2 ? WATER[7] : WATER[6]); }
};

/** A burst of blood (flung up into the spray, coming down): n drops from (x, y) at frame t0. */
const burst = (c: Ctx, t: number, t0: number, x: number, y: number, n: number, seed: number, power = 1) => {
  const s = t - t0;
  if (s < 0 || s > 50) return;
  for (let i = 0; i < n; i++) {
    const vx = (hash(seed + i) - 0.5) * 6 * power, vy = (-1.5 - hash(seed + i * 1.7) * 3.5) * power;
    const px = x + vx * s, py = y + vy * s + 0.5 * 0.3 * s * s;
    if (py > POOL + 4) continue;
    const sz = 2 + Math.floor(hash(seed + i * 3.1) * 3) - (s > 34 ? 1 : 0);
    box(c, px, py, sz, sz, BLOOD[(i + seed) % BLOOD.length]);
  }
};

/** The blood washing down the curtain below a rock he hit, thinning as it goes. */
const bloodDown = (c: Ctx, t: number, t0: number, x: number, y: number) => {
  const s = t - t0;
  if (s < 0 || s > 130) return;
  c.globalAlpha = s < 60 ? 0.85 : s < 100 ? 0.55 : 0.3;
  for (let k = 0; k < 6; k++) {
    const yy = y + ((s * 5 + k * 47) % Math.min(POOL - y, 40 + s * 5)), xx = x - 10 + k * 4 + Math.sin(yy * 0.05 + k) * 2;
    box(c, xx, yy, 2, 16, BLOOD[2 + (k % 3)]);
  }
  c.globalAlpha = 1;
};

/** A pop over a hit. */
const pop = (c: Ctx, t: number, t0: number, s: string, x: number, y: number, col: string) => {
  const u = t - t0;
  if (u < 0 || u > 34) return;
  label(c, s, x, y - 18 - Math.min(10, u * 0.6), col, 8);
};

// ---------------------------------------------------------------------------------------------------------------
// Him: his top half his own drawing; his legs drawn here (so they can be broken the wrong way, and torn off)

const THIGH = 11, SHIN = 11, HIP_N: P2 = [5, -22], HIP_F: P2 = [-4, -22];
const D = { kind: FALLS_KILL, x: 0, y: 0, facing: 1 } as unknown as MeatheadDeath;

/** A leg from the hip to the foot (his facing +1, in the frame his feet are the origin of): sound, the knee forward;
 *  broken, folded the wrong way at the knee, the bone out through the front of it. */
const leg = (c: Ctx, hip: P2, foot: P2, broken: boolean, back: boolean) => {
  const kn = broken ? joint2(hip[0], hip[1], foot[0], foot[1], THIGH, SHIN, 1) : knee(hip[0], hip[1], foot[0], foot[1], THIGH, SHIN, 1);
  const ft = reachTo(hip[0], hip[1], foot[0], foot[1], THIGH, SHIN);
  drawLeg(c, hip, kn, ft, broken ? 1.2 : 0.2, back);
  if (!broken) return;
  // (the bone out of the knee's front, pointing forward out of the jeans; blood soaking the leg round it)
  const dx = kn[0] - (hip[0] + ft[0]) / 2, dy = kn[1] - (hip[1] + ft[1]) / 2, d = Math.hypot(dx, dy) || 1, ux = -dx / d, uy = -dy / d;
  c.fillStyle = BLOOD[2]; c.beginPath(); c.ellipse(kn[0], kn[1], 5, 4, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = INK; c.lineWidth = 3.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(kn[0], kn[1]); c.lineTo(kn[0] + ux * 8, kn[1] + uy * 8); c.stroke();
  c.strokeStyle = '#F2EBDD'; c.lineWidth = 2; c.beginPath(); c.moveTo(kn[0], kn[1]); c.lineTo(kn[0] + ux * 8, kn[1] + uy * 8); c.stroke();
  box(c, kn[0] - 1, kn[1] + 2, 2, 5, BLOOD[3]);
};

/** The near leg torn off at the knee: the thigh, the stump (the bone out of the meat). */
const stump = (c: Ctx, hip: P2, end: P2) => {
  const a = Math.atan2(end[1] - hip[1], end[0] - hip[0]) - Math.PI / 2, len = Math.hypot(end[0] - hip[0], end[1] - hip[1]);
  c.save(); c.translate(hip[0], hip[1]); c.rotate(a);
  c.fillStyle = INK; c.fillRect(-7, 0, 14, len + 1); c.fillStyle = pantsColor; c.fillRect(-6, 0, 12, len);
  c.fillStyle = 'rgba(0, 0, 0, 0.25)'; c.fillRect(2, 0, 4, len);
  c.fillStyle = BLOOD[1]; c.beginPath(); c.ellipse(0, len, 7, 3.4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = BLOOD[3]; c.beginPath(); c.ellipse(-1, len - 0.5, 5, 2.2, 0, 0, Math.PI * 2); c.fill();
  box(c, -1.5, len - 1, 3, 5, '#F2EBDD');
  c.restore();
};

/** His skull cracked: blood out of his hair and down his face (the frame his feet are the origin of). */
const skullBlood = (c: Ctx, t: number) => {
  c.fillStyle = BLOOD[2]; c.beginPath(); c.ellipse(-2, -61, 7, 4, -0.3, 0, Math.PI * 2); c.fill();
  c.fillStyle = BLOOD[4]; c.beginPath(); c.ellipse(-1, -62, 3.5, 2, -0.3, 0, Math.PI * 2); c.fill();
  for (let k = 0; k < 3; k++) box(c, -4 + k * 4, -59, 2, 6 + ((t + k * 5) % 9), BLOOD[3]);
};

/** His top half (above his belt), his own drawing, in the frame his feet are the origin of. */
const topHalf = (c: Ctx, state: GameState, face: DeathFace, hurt: boolean) => {
  c.save(); c.beginPath(); c.rect(-60, -110, 120, 89); c.clip();
  body(c, state, D, state.player.currentWeapon, { deathFace: face, hurtTimer: hurt ? 30 : 0, isGrounded: !hurt, vel: { x: 0, y: hurt ? 4 : 0 } });
  c.restore();
};

/** Falling: tumbling, flailing; what's broken flopping. */
const drawFalling = (c: Ctx, state: GameState, t: number, f: number) => {
  const h = himAt(t), dmg = hurtBy(t), held = HITS.some(at => t >= at && t < at + HOLD);
  const w = held ? 0 : f;
  c.save(); c.translate(h.x, h.y); c.rotate(h.rot); c.translate(0, 22);
  // (on each rock, squashed against it a frame or two)
  if (held) { const k = HITS.find(at => t >= at && t < at + HOLD)!; if (t - k < 3) c.scale(1.12, 0.86); }
  const flop = (a: number, r: number, hip: P2): P2 => [hip[0] + Math.cos(a) * r, hip[1] + Math.sin(a) * r];
  leg(c, HIP_F, dmg.far ? flop(Math.PI / 2 + 0.9 * Math.sin(w * 0.5 + 1), 14, HIP_F) : [-4 + Math.sin(w * 0.45 + 2) * 9, -2], dmg.far, true);
  topHalf(c, state, 'scream', true);
  if (dmg.skull) skullBlood(c, f);
  leg(c, HIP_N, dmg.near ? flop(Math.PI / 2 - 0.9 * Math.sin(w * 0.55), 14, HIP_N) : [5 + Math.sin(w * 0.45) * 9, -2 + Math.cos(w * 0.45) * 3], dmg.near, false);
  c.restore();
};

/** Down on the spire: folded the wrong way over it, belly up, its point out through his gut; head down one side, legs
 *  down the other (the near one gone at the knee); twitching a while, then not. */
const DROOP = 0.62;
const drawOnSpire = (c: Ctx, state: GameState, t: number) => {
  const s = t - LAND, squash = s < 4 ? 1 - (4 - s) * 0.04 : 1;
  const tw = s < 140 && (s % 31 < 3 || s % 53 < 2) ? (hash(t) - 0.5) * 0.25 : 0;
  // (the blood down the rock from him, to the water)
  const drip = Math.min(POOL - PIVOT.y, s * 1.4);
  for (let k = 0; k < 4; k++) box(c, PIVOT.x - 6 + k * 3.5, PIVOT.y + 4, 2 + (k % 2), drip * (0.6 + 0.4 * hash(k)), BLOOD[2 + (k % 2)]);
  // (his legs: down the far side)
  c.save(); c.translate(PIVOT.x, PIVOT.y); c.rotate(-Math.PI / 2 + DROOP + tw); c.scale(1, squash); c.translate(0, 22);
  leg(c, HIP_F, [-6, -6], true, true);
  stump(c, HIP_N, [6, -12]);
  c.restore();
  // (his top half: down the near side, head hanging)
  c.save(); c.translate(PIVOT.x, PIVOT.y); c.rotate(-Math.PI / 2 - DROOP - tw * 0.4); c.scale(1, squash); c.translate(0, 22);
  topHalf(c, state, s < 30 ? 'scream' : s < 140 ? 'agony' : 'dead', false);
  skullBlood(c, t);
  c.restore();
  // (the spire's point out through his gut: bloody, dripping)
  const tip = { x: PIVOT.x + 2, y: PIVOT.y - 16 };
  c.fillStyle = INK; c.beginPath(); c.moveTo(PIVOT.x - 6, PIVOT.y - 1); c.lineTo(tip.x, tip.y - 1); c.lineTo(PIVOT.x + 7, PIVOT.y - 1); c.closePath(); c.fill();
  c.fillStyle = STONE[3]; c.beginPath(); c.moveTo(PIVOT.x - 4, PIVOT.y - 2); c.lineTo(tip.x, tip.y); c.lineTo(PIVOT.x + 5, PIVOT.y - 2); c.closePath(); c.fill();
  c.fillStyle = BLOOD[3]; c.beginPath(); c.moveTo(PIVOT.x - 4, PIVOT.y - 2); c.lineTo(tip.x - 1, tip.y + 5); c.lineTo(PIVOT.x + 5, PIVOT.y - 2); c.closePath(); c.fill();
  c.fillStyle = BLOOD[1]; c.beginPath(); c.ellipse(PIVOT.x, PIVOT.y - 1, 9, 3, 0, 0, Math.PI * 2); c.fill();
  box(c, tip.x - 1, tip.y + 2, 2, 2 + (s % 20) * 0.4, BLOOD[4]);
};

// ---------------------------------------------------------------------------------------------------------------
// What comes off him (into the pool, carried off downstream), the log, the bear

const GB = 0.35;
interface Bit { t0: number; x: number; y: number; vx: number; vy: number; drift: number; spin: number }
/** His near leg (shin and boot), torn off at the knee as he hits the spire. */
const LEG: Bit = { t0: LAND, x: 176, y: 662, vx: 1.6, vy: -4.5, drift: 0.6, spin: 0.3 };
const CHUNKS: Bit[] = [
  { t0: LAND, x: 170, y: 652, vx: -1.2, vy: -3.6, drift: 0.55, spin: 0.2 },
  { t0: LAND, x: 174, y: 650, vx: 2.6, vy: -2.6, drift: 0.8, spin: -0.25 },
  { t0: LAND + 2, x: 172, y: 648, vx: 0.7, vy: -5.2, drift: 0.65, spin: 0.15 },
];
/** Frames till a bit's in the water. */
const landsIn = (b: Bit) => (-b.vy + Math.sqrt(b.vy * b.vy + 2 * GB * (POOL + 4 - b.y))) / GB;
const legLands = () => landsIn(LEG) | 0;
/** Where a bit is t frames in (flying, then floating off downstream, bobbing), or null before it's off him. */
const bitAt = (b: Bit, t: number) => {
  const s = t - b.t0;
  if (s < 0) return null;
  const T = landsIn(b);
  if (s < T) return { x: b.x + b.vx * s, y: b.y + b.vy * s + 0.5 * GB * s * s, rot: s * b.spin, wet: false };
  const lx = b.x + b.vx * T;
  return { x: lx + b.drift * (s - T), y: POOL + 6 + Math.sin(s * 0.12 + b.x) * 1.5, rot: T * b.spin * 0.2 + Math.PI / 2 + Math.sin(s * 0.08) * 0.2, wet: true };
};

/** The bear: wading in the pool downstream of the falls, facing them; its mouth (it takes the leg as it floats by). */
const BEAR = { x: 340, feet: POOL + 20, s: 0.55 }, MOUTH_X = BEAR.x - 46, CHEW = 80;
const eatAt = () => LEG.t0 + Math.ceil(landsIn(LEG) + (MOUTH_X - (LEG.x + LEG.vx * landsIn(LEG))) / LEG.drift);

const drawBear = (c: Ctx, t: number) => {
  const eat = eatAt(), s = t - LAND;
  let pose: BearPose = 'stand', at = t, bloody = 0;
  if (s >= 4 && s < 50) { pose = 'rear'; at = s; }
  if (t >= eat - 4 && t < eat + CHEW) { pose = 'maul'; at = t - eat; bloody = Math.min(1, Math.max(0, (t - eat) / 30)); }
  else if (t >= eat + CHEW) bloody = 1;
  c.save(); c.translate(BEAR.x, BEAR.feet); c.scale(BEAR.s, BEAR.s);
  drawGrizzly(c, 0, 0, -1, at, pose, { bloody });
  c.restore();
};

/** The torn-off leg: the shin and the boot, the bloody end with the bone out of it. */
const drawLooseLeg = (c: Ctx, x: number, y: number, rot: number) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  drawLeg(c, [0, -10], [0, -10], [0, 4], 0.2, false);
  c.fillStyle = BLOOD[1]; c.beginPath(); c.ellipse(0, -10, 6, 2.6, 0, 0, Math.PI * 2); c.fill();
  box(c, -1.5, -14, 3, 4, '#F2EBDD');
  c.restore();
};
/** A chunk of him: meat, or a scrap of his jeans (his skin, naked), or a turd (if he'd shat himself). */
const drawChunk = (c: Ctx, i: number, x: number, y: number, rot: number) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  if (i === 1) {
    const col = run.nude ? skinTone : pantsColor;
    c.fillStyle = INK; c.fillRect(-6, -3, 12, 6); c.fillStyle = col; c.fillRect(-5, -2, 10, 4); box(c, -5, 1, 10, 1, BLOOD[2]);
  } else if (i === 2 && run.shat) {
    c.fillStyle = INK; c.beginPath(); c.ellipse(0, 0, 6, 3.6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#6B4423'; c.beginPath(); c.ellipse(0, 0, 5, 2.6, 0, 0, Math.PI * 2); c.fill(); box(c, -2, -2, 2, 1, '#8B5A2B');
  } else {
    c.fillStyle = INK; c.beginPath(); c.ellipse(0, 0, 5.5, 4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = BLOOD[3]; c.beginPath(); c.ellipse(0, 0, 4.5, 3, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#F2A0A0'; c.fillRect(-2, -2, 2, 1); c.fillStyle = '#F8E8C8'; c.fillRect(1, 0, 2, 2);
  }
  c.restore();
};

/** The blood clouding the pool from the foot of the spire, carried off downstream, spreading and thinning in steps. */
const drawBloodClouds = (c: Ctx, t: number) => {
  c.save(); c.beginPath(); c.rect(0, POOL + 3, VW, TALL - POOL); c.clip();
  for (let k = 0; k < 46; k++) {
    const a = t - (LAND + 4 + k * 5);
    if (a < 0) break;
    const x = PIVOT.x + 2 + a * 0.45 + (hash(k) - 0.5) * 18, y = POOL + 8 + hash(k + 9) * 34, r = Math.min(26, 4 + a * 0.2);
    if (x - r > VW) continue;
    c.globalAlpha = a < 60 ? 0.5 : a < 150 ? 0.34 : 0.2;
    c.fillStyle = k % 3 ? BLOOD[2] : BLOOD[3];
    c.beginPath(); c.ellipse(x, y, r * 1.4, r * 0.6, 0, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
  c.restore();
};

/** Off the log: where it is (falling with him, hung up on the first rock, coming down on him, rolling off, floating). */
const LOG_LEN = 170, LOG_S = 0.6;
const logAt = (t: number) => {
  const x0 = 160, wedgeY = 200;
  if (t < LOG_WEDGE) return { x: 150 + t * 0.4, y: Math.min(wedgeY, 30 + 0.225 * t * t), rot: t * 0.04 };
  if (t < LOG_DROP) return { x: x0, y: wedgeY, rot: 0.18 + Math.sin(t * 0.3) * (t > LOG_DROP - 20 ? 0.03 : 0) };
  if (t < LOG_HIT) { const s = t - LOG_DROP; return { x: x0 + s * 0.27, y: wedgeY + 0.225 * s * s, rot: 0.18 + s * 0.06 }; }
  const s = t - LOG_HIT;
  if (s < LOG_ROLL) { const k = s / LOG_ROLL; return { x: 172 + (250 - 172) * k, y: PIVOT.y - 18 + (POOL - 2 - (PIVOT.y - 18)) * k - 30 * Math.sin(Math.PI * k), rot: 2.8 + s * 0.12 }; }
  return { x: 250 + (s - LOG_ROLL) * 0.6, y: POOL - 2 + Math.sin(s * 0.1) * 1.5, rot: Math.PI + Math.sin(s * 0.07) * 0.05 };
};
const drawFallingLog = (c: Ctx, t: number, f: number) => {
  const L = logAt(t);
  c.save(); c.translate(L.x, L.y); c.rotate(L.rot); c.scale(LOG_S, LOG_S);
  drawLog(c, -LOG_LEN / 2, -14, LOG_LEN, f * 0.2);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The kill cam

/** The camera's shake: every hit kicks it, dying off. */
const shakeAt = (t: number, log: boolean) => {
  let a = 0;
  for (const at of HITS) if (t >= at && t < at + 12) a = Math.max(a, (12 - (t - at)) * 0.5);
  if (t >= LAND && t < LAND + 20) a = Math.max(a, (20 - (t - LAND)) * 0.6);
  if (log && t >= LOG_HIT && t < LOG_HIT + 14) a = Math.max(a, (14 - (t - LOG_HIT)) * 0.5);
  return { x: (hash(t * 1.3) - 0.5) * 2 * a, y: (hash(t * 2.7) - 0.5) * 2 * a };
};

/** Is it on (his death over the falls, playing)? Then the kill cam, t frames in, over the whole screen. */
export const drawFallsCam = (c: Ctx, state: GameState): boolean => {
  const d = state.meatheadDeath;
  if (!d || d.kind !== FALLS_KILL || state.deathTimer <= 0) return false;
  const t = Math.min(state.deathScene?.t ?? LEN, LEN), f = state.frame, top = camAt(t), sh = shakeAt(t, run.log);
  c.save();
  c.fillStyle = '#0E1A24'; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  c.scale(Z, Z); c.translate(Math.round(sh.x), Math.round(-top + sh.y));
  // (the stills behind, in bands, only the ones on screen)
  for (let i = 0; i * BAND < TALL; i++) if (i * BAND < top + VH + 10 && (i + 1) * BAND > top - 10) still(c, `wfk-back-${i}`, 0, 0, 0, i * BAND, VW, BAND, g => { g.save(); g.beginPath(); g.rect(0, i * BAND, VW, BAND); g.clip(); paintBack(g); g.restore(); });
  drawCurtain(c, f, top);
  // (his blood washing down the falls below each rock he hit)
  bloodDown(c, t, HITS[0], 150, 214); bloodDown(c, t, HITS[1], 212, 386); bloodDown(c, t, HITS[2], 150, 536);
  if (run.log && t < LOG_DROP) drawFallingLog(c, t, f);
  for (let i = 0; i * BAND < TALL; i++) if (i * BAND < top + VH + 10 && (i + 1) * BAND > top - 10) still(c, `wfk-front-${i}`, 0, 0, 0, i * BAND, VW, BAND, g => { g.save(); g.beginPath(); g.rect(0, i * BAND, VW, BAND); g.clip(); paintFront(g); g.restore(); });
  drawSpray(c, f);
  // (the pool: the bear wading in it, the water over its legs, the blood, what's floating off downstream)
  if (top + VH > POOL - 120) {
    drawBear(c, t);
    drawPoolFront(c, f);
    drawBloodClouds(c, t);
    CHUNKS.forEach((b, i) => { const q = bitAt(b, t); if (q && q.x < VW + 20) drawChunk(c, i, q.x, q.y, q.rot); });
    const L = bitAt(LEG, t);
    if (L && t < eatAt()) drawLooseLeg(c, L.x, L.y, L.rot);
    if (run.log && t >= LOG_HIT + LOG_ROLL) drawFallingLog(c, t, f);
  }
  // (him)
  if (t < LAND) drawFalling(c, state, t, f); else drawOnSpire(c, state, t);
  if (run.log && t >= LOG_DROP && t < LOG_HIT + LOG_ROLL) drawFallingLog(c, t, f);
  // (the gore flung off each hit, the pops)
  burst(c, t, HITS[0], 152, 212, 14, 3); burst(c, t, HITS[1], 210, 380, 16, 17); burst(c, t, HITS[2], 152, 530, 14, 31);
  burst(c, t, LAND, PIVOT.x, PIVOT.y - 6, 30, 47, 1.3);
  if (run.log) burst(c, t, LOG_HIT, PIVOT.x + 4, PIVOT.y - 8, 18, 61, 1.1);
  pop(c, t, HITS[0], 'SNAP!', 150, 200, '#FDE047'); pop(c, t, HITS[1], 'CRACK!', 214, 366, '#FDE047'); pop(c, t, HITS[2], 'CRUNCH!', 150, 518, '#FDE047');
  pop(c, t, LAND, 'SPLAT!', PIVOT.x, PIVOT.y - 30, '#F87171');
  if (run.log) pop(c, t, LOG_HIT, 'BONK!', PIVOT.x + 30, PIVOT.y - 40, '#FDE047');
  const eat = eatAt();
  pop(c, t, eat, 'CHOMP!', MOUTH_X, POOL - 30, '#F87171');
  c.restore();
  // (a flash on each hit: white on the rocks, red on the spire)
  for (const at of [...HITS, LAND]) if (t >= at && t < at + 4) { c.fillStyle = at === LAND ? 'rgba(220, 38, 38, 0.3)' : 'rgba(255, 255, 255, 0.28)'; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  // (his scream, over him, only while it's said)
  if (run.scream && state.playerLastVulgarity === run.scream && state.playerVulgarityTimer > 0) {
    const h = himAt(Math.min(t, LAND));
    saidOver(c, run.scream, h.x * Z, (h.y - top) * Z - 90);
  }
  return true;
};
