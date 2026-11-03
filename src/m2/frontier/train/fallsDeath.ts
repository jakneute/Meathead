// OFF THE TRAIN UNDER THE WATERFALL (the owner's: "when you fall off the train over the waterfall, give a different
// animation unrelated to the circus lion"). Battered off the train outside under the falls (passers.ts soakHim: swept
// off, or knocked down onto the ties while it's still on him) is his own death (m2:fr_train_falls), a kill cam (screen
// space, over everything: the train's drawHud; the HUD down from its first frame; no input; SKIP >> for the lot, the
// death scene's own). It used to be the wilds' falls (fallsDeath.ts there, its grizzly), drawn nowhere on the train, or
// worse, knocked down between the cars onto the ties: the circus lion's scene.
//
//   the roof    the train crossing the park's trestle over the gorge, the falls pouring off the fake cliff's brow onto
//               the car tops: him on the roof under it, pressed flat, the car sliding on under him; it folds him over
//               the edge. His glasses come off and stay on the roof, riding on with the train.
//   the girt    the camera falls with him down through the trestle: he comes down astride a cross-girt, crotch first
//               (DONG!, a stop-frame, his eyes out), and tips off it
//   the brace   a flip, and the lower girt catches his far leg: SNAP, the wrong way
//   the rocks   face first onto the flat boulder at the foot of the falls: SPLAT, flattened, the blood out round him and
//               down the rock into the pool; a twitch, then not. The train rumbles on overhead without him.
//
// Then the death screen (lines.ts HURT['m2:fr_train_falls']). Everything's a function of the frame it's on (the stills
// stamped: the gorge, the trestle, the cars), so it's the same however it's watched.

import type { GameState } from '../../../m1/game/core/state';
import type { MeatheadDeath } from '../../../m1/game/player/deathAnim';
import type { DeathFace } from '../../../m1/game/render/player/deathFace';
import { registerDeathAnim, registerDeathKind } from '../../../m1/game/player/deathAnim';
import { registerDeathDraw, body } from '../../../m1/game/render/player/deathAnim';
import { drawLeg, glassesOn, setGlasses } from '../../../m1/game/render/player/body';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { isShat } from '../../../m1/game/player/gut';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { joint2, knee, reachTo, type P2 } from '../../art/limb';
import { meatheadSays, byPants, saidOver, label } from '../section';
import { type Ctx, box, checker, hash, mix, still, near, pine, fiberglass, skyAt, INK, FIBER, STONE, NEEDLE, BARK, WATER, PLANK } from '../wilds/paint';
import { MAROON, BRASS, IRON, CREAM } from './paint';
import { TRAIN_FALLS_SCREAM } from './lines';

export const TRAIN_FALLS_SRC = 'm2:fr_train_falls';
export const TRAIN_FALLS_KILL = 'own:fr_trainfalls' as const;

// ---------------------------------------------------------------------------------------------------------------
// The beats (frames into his death)

/** On the roof under it; astride the girt (and how long he sits there); the lower girt; the rocks; the whole of it. */
const LEAD = 24, H1 = 58, HOLD1 = 16, H2 = 108, HOLD2 = 6, LAND = 150, LEN = 340;

// ---------------------------------------------------------------------------------------------------------------
// The shot: its own little world (cam units, drawn at 2x: 400 wide, the gorge 760 tall), the camera falling with him

const Z = 2, VW = CANVAS_WIDTH / Z, VH = CANVAS_HEIGHT / Z, TALL = 760;
/** The rails' top; the car tops; the two girts' tops; the flat boulder's top; the pool. */
const RAIL = 118, ROOF_Y = RAIL - 58, GIRT1 = 230, GIRT2 = 470, ROCK_Y = 702, POOL = 716;
/** The train: a car's length and the pitch along, and how fast it goes by (cam units a frame). */
const CL = 150, PITCH = 162, TV = 2.4;
/** The falls: its edges at height y (fanning out a little as it drops). */
const curtL = (y: number) => 146 - Math.max(0, y) * 0.03;
const curtR = (y: number) => 236 + Math.max(0, y) * 0.04;

/** His hips at each beat (on the roof, astride the girt, the lower girt, face down on the rock), and how he's turned. */
const PTS: P2[] = [[204, ROOF_Y - 22], [184, GIRT1 - 2], [168, 452], [150, ROCK_Y - 7]];
const ROTS = [0, 0.18, -0.35 - Math.PI * 2, Math.PI / 2 - Math.PI * 2];
const G = 0.35;
const SEG = [{ t0: LEAD, S: H1 - LEAD }, { t0: H1 + HOLD1, S: H2 - H1 - HOLD1 }, { t0: H2 + HOLD2, S: LAND - H2 - HOLD2 }];

/** Where his hips are and how he's turned, t frames in. */
const himAt = (t: number) => {
  if (t < LEAD) return { x: PTS[0][0] + t * 0.4, y: PTS[0][1] + Math.min(5, t * 0.6), rot: 0 };
  const start: P2 = [PTS[0][0] + LEAD * 0.4, PTS[0][1] + 5];
  for (let i = 0; i < SEG.length; i++) {
    const { t0, S } = SEG[i], a = i === 0 ? start : PTS[i], b = PTS[i + 1];
    if (t < t0) return { x: a[0], y: a[1], rot: ROTS[i] };
    if (t < t0 + S) {
      const s = t - t0, vy = (b[1] - a[1] - 0.5 * G * S * S) / S;
      return { x: a[0] + (b[0] - a[0]) * (s / S), y: a[1] + vy * s + 0.5 * G * s * s, rot: ROTS[i] + (ROTS[i + 1] - ROTS[i]) * (s / S) };
    }
  }
  return { x: PTS[3][0], y: PTS[3][1], rot: ROTS[3] };
};
const camAt = (t: number) => Math.max(0, Math.min(TALL - VH, himAt(Math.min(t, LAND)).y - 120));

// ---------------------------------------------------------------------------------------------------------------
// The registration

registerDeathKind(TRAIN_FALLS_SRC, TRAIN_FALLS_KILL);

/** This death's own: the state of his pants (fixed as it starts), his scream while it's said. */
const run = { shat: false, scream: '' };

registerDeathAnim(TRAIN_FALLS_KILL, {
  frames: LEN, airOk: true, cam: true,
  tick: (ctx, _d, t) => {
    const { state } = ctx;
    if (t === 1) { run.shat = isShat(state); run.scream = ''; playSound('splash', 1, -6); playSound('roar', 0.3, -10); }
    if (t === 3) {
      const line = pickLine(byPants(state, TRAIN_FALLS_SCREAM));
      run.scream = line;
      meatheadSays(state, line, false, () => { if (run.scream === line) run.scream = ''; });
    }
    if (t % 60 === 0 && t < LAND + 120) playSound('splash', 0.25, -12);
    if (t === LEAD) { playSound('whoosh', 1, -4); playSound('glass', 0.3, 4); }
    if (t === H1) { playSound('thud', 1, -2); playSound('crunch', 0.7, 4); playSound('squish', 0.8, 6); }
    if (t === H2) { playSound('crack', 1, -2); playSound('crunch', 1, -4); }
    if (t === LAND) { playSound('splat', 1, -6); playSound('crunch', 1, -10); playSound('thud', 1, -8); playSound('squish', 1, -6); }
    if (t === LAND + 40) playSound('rumble', 0.5, -12);
  },
});
// (in the world: nothing; it's all the kill cam, over everything)
registerDeathDraw(TRAIN_FALLS_KILL, () => { /* drawn in screen space: drawTrainFallsCam */ });

// ---------------------------------------------------------------------------------------------------------------
// The stills (stamped in bands down the shot): the gorge behind, the trestle in front of the falls; a car

const BAND = 190;

const paintBack = (g: Ctx) => {
  const F = near(FIBER), FD = F.map(c => mix(c, INK, 0.35)), N2 = near(NEEDLE), B = near(BARK);
  // (the sky over the gorge, in bands)
  for (let k = 0; k < 8; k++) box(g, 0, k * 14 - 4, VW, 14, skyAt(0.3 + k * 0.08));
  // (the far rim's pines)
  for (let k = 0; k < 9; k++) pine(g, 6 + k * 48 + hash(k) * 16, 128, 40 + hash(k + 3) * 24, 20, k + 70, N2.map(c => mix(c, INK, 0.25)), B);
  // (the gorge's far wall going down, the park's fiberglass, darker as it goes; the dark wet rock behind the falls)
  fiberglass(g, 0, 124, VW, TALL - 124, FD, 31);
  for (let k = 0; k < 5; k++) { g.globalAlpha = 0.1 + k * 0.06; g.fillStyle = '#05080C'; g.fillRect(0, 240 + k * 100, VW, TALL); }
  g.globalAlpha = 1;
  box(g, 126, 124, 132, TALL - 124, '#0E1A24');
  for (let y = 140; y < TALL; y += 30) box(g, 126, y, 132, 2, '#1A2A36');
  // (the fake cliff's brow overhead, the falls spilling off it)
  fiberglass(g, 90, -20, 210, 34, F, 5);
  box(g, 90, 12, 210, 3, INK); checker(g, 92, 10, 206, 2, F[5], 0);
  // (the pool at the bottom: deep in the middle)
  for (let k = 0; k < 4; k++) box(g, 0, POOL + k * 12, VW, 12, WATER[Math.max(0, 4 - k)]);
};

/** A post of the trestle (a timber bent's leg), x at the top, splaying out a little going down. */
const POSTS = [20, 104, 188, 272, 356];
const postX = (x0: number, y: number) => x0 + (x0 - VW / 2) * (y - RAIL) * 0.00012;

/** A jagged real rock: inked, stepped shade down it, its top lit, wet glints. */
const rock = (g: Ctx, pts: number[], R: string[]) => {
  const path = () => { g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); };
  path(); g.strokeStyle = INK; g.lineWidth = 3; g.lineJoin = 'miter'; g.stroke();
  g.fillStyle = R[3]; g.fill();
  let y0 = Infinity, y1 = -Infinity, x0 = Infinity, x1 = -Infinity;
  for (let i = 0; i < pts.length; i += 2) { x0 = Math.min(x0, pts[i]); x1 = Math.max(x1, pts[i]); y0 = Math.min(y0, pts[i + 1]); y1 = Math.max(y1, pts[i + 1]); }
  g.save(); path(); g.clip();
  const h = y1 - y0;
  box(g, x0, y0 + h * 0.45, x1 - x0, h, R[2]); checker(g, x0, y0 + h * 0.45 - 2, x1 - x0, 2, R[2], 0);
  box(g, x0, y0 + h * 0.75, x1 - x0, h, R[1]); checker(g, x0, y0 + h * 0.75 - 2, x1 - x0, 2, R[1], 1);
  box(g, x0, y0, x1 - x0, 2, R[5]); box(g, x0 + 6, y0, 10, 1, R[6]);
  g.restore();
};

const paintFront = (g: Ctx) => {
  const P = near(PLANK), PD = P.map(c => mix(c, INK, 0.2));
  // (the bents' legs: square timbers, lit down their left)
  for (const x0 of POSTS) {
    for (let y = RAIL + 8; y < POOL + 6; y += 4) { const x = postX(x0, y); box(g, x - 1, y, 12, 4, INK); box(g, x, y, 10, 4, P[3]); box(g, x, y, 2, 4, P[5]); box(g, x + 8, y, 2, 4, P[1]); }
  }
  // (X braces between the girts: planks, behind the girts)
  g.lineCap = 'butt';
  for (const [ya, yb] of [[RAIL + 12, GIRT1], [GIRT1 + 10, GIRT2], [GIRT2 + 10, POOL]] as const) {
    for (let i = 0; i < POSTS.length - 1; i++) {
      const a = POSTS[i] + 5, b = POSTS[i + 1] + 5;
      for (const [x1, y1, x2, y2] of [[a, ya, b, yb], [b, ya, a, yb]]) {
        g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
        g.strokeStyle = PD[3]; g.lineWidth = 5; g.stroke();
        g.strokeStyle = PD[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(x1, y1 - 2); g.lineTo(x2, y2 - 2); g.stroke();
      }
    }
  }
  // (the girts across: heavy timbers, their tops lit, bolts at each post)
  for (const y of [GIRT1, GIRT2]) {
    box(g, 0, y - 1, VW, 12, INK); box(g, 0, y, VW, 10, P[3]); box(g, 0, y, VW, 2, P[5]); box(g, 0, y + 8, VW, 2, P[1]);
    checker(g, 0, y + 6, VW, 2, P[2], 0);
    for (const x0 of POSTS) { const x = postX(x0, y); box(g, x + 3, y + 3, 3, 3, INK); box(g, x + 3, y + 3, 2, 2, near(IRON)[5]); }
  }
  // (the cap under the ties, the ties, the rails)
  box(g, 0, RAIL + 4, VW, 9, INK); box(g, 0, RAIL + 5, VW, 7, P[2]); box(g, 0, RAIL + 5, VW, 1, P[4]);
  for (let x = 0; x < VW; x += 12) { box(g, x, RAIL, 9, 5, INK); box(g, x + 1, RAIL + 1, 7, 3, P[1]); }
  box(g, 0, RAIL - 3, VW, 4, INK); box(g, 0, RAIL - 2, VW, 2, near(IRON)[5]);
  // (the rocks at the foot: the flat boulder he lands on, and the rest)
  const S = near(STONE);
  rock(g, [92, POOL + 8, 98, ROCK_Y + 4, 112, ROCK_Y, 196, ROCK_Y, 210, ROCK_Y + 6, 216, POOL + 8], S);
  rock(g, [10, POOL + 8, 20, 700, 44, 692, 62, 698, 74, POOL + 8], S);
  rock(g, [262, POOL + 8, 272, 696, 300, 688, 322, 694, 336, POOL + 8], S);
};

/** A coach (local: its left end at 0, its wheels on y 0): maroon, gold lettering stripe, lit windows, a passenger or
 *  two in them, the roof's lit top edge (it's stood on). */
const paintCar = (g: Ctx, seed: number) => {
  const M = near(MAROON), Bz = near(BRASS), I = near(IRON), C = near(CREAM);
  const top = ROOF_Y - RAIL;
  // (trucks and wheels)
  for (const wx of [22, 40, CL - 40, CL - 22]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, -6, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = I[3]; g.beginPath(); g.arc(wx, -6, 5.5, 0, Math.PI * 2); g.fill(); box(g, wx - 1, -7, 2, 2, I[6]); }
  box(g, 8, -14, CL - 16, 4, INK); box(g, 10, -13, CL - 20, 2, I[2]);
  // (the body)
  box(g, -1, top + 3, CL + 2, -top - 15, INK); box(g, 0, top + 4, CL, -top - 17, M[3]);
  box(g, 0, top + 4, CL, 2, M[5]); box(g, 0, -16, CL, 3, M[1]);
  box(g, 0, top + 30, CL, 2, Bz[4]);
  // (the windows: lit, the odd passenger's head in one)
  for (let k = 0; k < 6; k++) {
    const x = 12 + k * 22, y = top + 10;
    box(g, x - 1, y - 1, 15, 16, INK); box(g, x, y, 13, 14, C[4]); box(g, x, y, 13, 2, C[6]);
    if (hash(seed * 7 + k) < 0.4) {
      const hx = x + 6, skin = hash(seed + k) < 0.5 ? '#E8B48A' : '#8A5A3A';
      g.fillStyle = INK; g.beginPath(); g.ellipse(hx, y + 9, 4.5, 5.5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = skin; g.beginPath(); g.ellipse(hx, y + 9, 3.6, 4.6, 0, 0, Math.PI * 2); g.fill();
      box(g, hx - 2, y + 7, 1, 1, INK); box(g, hx + 1, y + 7, 1, 1, INK); box(g, hx - 1, y + 11, 2, 2, INK);
      box(g, hx - 4, y + 3, 8, 2, hash(seed + k * 3) < 0.5 ? '#3A2A1A' : '#C8C8C8');
    }
  }
  // (the roof: a clerestory, the lit lip along its top)
  box(g, -3, top - 1, CL + 6, 6, INK); box(g, -2, top, CL + 4, 4, M[2]);
  box(g, -2, top, CL + 4, 1, '#E8C890');
  box(g, 20, top - 7, CL - 40, 7, INK); box(g, 21, top - 6, CL - 42, 6, M[2]); box(g, 21, top - 6, CL - 42, 1, '#E8C890');
};

// ---------------------------------------------------------------------------------------------------------------
// The live bits

const FL = ['#1E5A6A', '#2E7A88', '#4A9AA6', '#7EC2C8', '#C8ECEE', '#FFFFFF'];
const BLOOD = ['#5A0000', '#7C0A02', '#8B0000', '#B22222', '#DC2626'];

/** The falls between heights a and b (on screen only): bands down it, streaks cycling down, white breaking out. */
const drawCurtain = (c: Ctx, f: number, top: number, a: number, b: number) => {
  const y0 = Math.max(a, top - 30), y1 = Math.min(b, top + VH + 30);
  if (y1 <= y0) return;
  c.save(); c.beginPath(); c.rect(0, y0, VW, y1 - y0); c.clip();
  for (let y = y0 - (y0 % 20); y < y1; y += 20) {
    const l = curtL(y), r = curtR(y);
    for (let x = l; x < r; x += 6) box(c, x, y, Math.min(6, r - x), 20, FL[Math.floor((x - l) / 6) % 2 ? 1 : 2]);
  }
  for (let k = 0; k < 18; k++) {
    const fr = (k + 0.5) / 18, sp = 5 + (k % 3);
    for (let y = y0 - 60 + ((f * sp + k * 37) % 60); y < y1; y += 60) {
      const x = curtL(y) + (curtR(y) - curtL(y)) * fr;
      box(c, x, y, 2, 28, k % 2 ? FL[4] : FL[3]); box(c, x, y + 28, 2, 6, FL[5]);
    }
  }
  for (let y = y0 - (y0 % 22); y < y1; y += 22) {
    const l = curtL(y), r = curtR(y);
    for (let x = l; x < r - 6; x += 8) if ((((x | 0) + y + f * 3) >> 3) % 3 === 0) box(c, x, y + ((f * 4) % 22), 6, 4, 'rgba(255, 255, 255, 0.7)');
  }
  c.restore();
};

/** The spray where it hits: the car tops going by, the girts, the pool. */
const drawSpray = (c: Ctx, f: number) => {
  for (const [y, w] of [[ROOF_Y - 6, 96], [GIRT1, 100], [GIRT2, 106]] as const) {
    const l = curtL(y) - 6;
    for (let i = 0; i < 12; i++) {
      const ph = ((f * 1.4 + i * 23) % 36) / 36, sx = l + ((i * 29) % w) + ph * (i % 2 ? 9 : -9), sy = y - Math.sin(ph * Math.PI) * (6 + (i % 4) * 4);
      box(c, sx, sy, 2 + (i % 2), 2, i % 3 ? FL[5] : FL[4]);
    }
  }
  const l = curtL(POOL), r = curtR(POOL);
  for (let i = 0; i < 14; i++) {
    const x = l - 10 + ((i * 37 + f * (i % 2 ? 1 : -1)) % (r - l + 20) + (r - l + 20)) % (r - l + 20), bob = Math.sin(f * 0.3 + i) * 2;
    c.fillStyle = i % 3 ? '#F0F9FF' : '#BAE6FD'; c.beginPath(); c.arc(x, POOL + bob, 4 + (i % 4) * 2, Math.PI, 0); c.fill();
  }
};

/** The train going by on the trestle (the cars that are on screen), t frames in. */
const carX = (k: number, t: number) => -720 + k * PITCH + t * TV;
const drawTrain = (c: Ctx, t: number, top: number) => {
  if (top > RAIL + 20) return;
  for (let k = 0; k < 12; k++) {
    const x = carX(k, t);
    if (x > VW + 4 || x + CL < -4) continue;
    still(c, `tfk-car-${k % 3}`, x, RAIL, -4, ROOF_Y - RAIL - 10, CL + 8, RAIL - ROOF_Y + 10, g => paintCar(g, k % 3));
    // (the coupling over the gap to the next)
    box(c, x + CL, RAIL - 16, PITCH - CL, 4, INK);
  }
};

/** His glasses: blown off his face at LEAD, a hop, and down on the roof of the car going by, riding on with it. */
const GL_CAR = (() => { for (let k = 0; k < 12; k++) { const x = carX(k, LEAD); if (x < 208 && x + CL > 214) return k; } return 4; })();
const GL_ON = 214 - carX(GL_CAR, LEAD);
const drawGlasses = (c: Ctx, t: number) => {
  if (t < LEAD) return;
  const s = t - LEAD, hop = s < 18 ? Math.max(0, 10 * Math.sin((s / 18) * Math.PI)) : 0;
  const x = carX(GL_CAR, t) + GL_ON + (s < 18 ? -s * 0.3 : -5.4), y = ROOF_Y - 2 - hop;
  if (x > VW + 10) return;
  c.save(); c.translate(x, y); if (s < 18) c.rotate(s * 0.5);
  box(c, -6, -3, 5, 4, INK); box(c, 1, -3, 5, 4, INK); box(c, -1, -2, 2, 1, INK);
  box(c, -5, -2, 3, 2, '#BFE8F5'); box(c, 2, -2, 3, 2, '#BFE8F5');
  c.restore();
};

/** A burst of blood: n drops from (x, y) at frame t0. */
const burst = (c: Ctx, t: number, t0: number, x: number, y: number, n: number, seed: number, power = 1) => {
  const s = t - t0;
  if (s < 0 || s > 50) return;
  for (let i = 0; i < n; i++) {
    const vx = (hash(seed + i) - 0.5) * 6 * power, vy = (-1.5 - hash(seed + i * 1.7) * 3.5) * power;
    const px = x + vx * s, py = y + vy * s + 0.5 * 0.3 * s * s;
    if (py > ROCK_Y + 2 && px > 96 && px < 212) continue;
    if (py > POOL + 4) continue;
    const sz = 2 + Math.floor(hash(seed + i * 3.1) * 3) - (s > 34 ? 1 : 0);
    box(c, px, py, sz, sz, BLOOD[(i + seed) % BLOOD.length]);
  }
};

/** A pop over a hit. */
const pop = (c: Ctx, t: number, t0: number, s: string, x: number, y: number, col: string) => {
  const u = t - t0;
  if (u < 0 || u > 34) return;
  label(c, s, x, y - 18 - Math.min(10, u * 0.6), col, 8);
};

// ---------------------------------------------------------------------------------------------------------------
// Him: his top half his own drawing; his legs drawn here (so one can be broken the wrong way)

const THIGH = 11, SHIN = 11, HIP_N: P2 = [5, -22], HIP_F: P2 = [-4, -22];
const D = { kind: TRAIN_FALLS_KILL, x: 0, y: 0, facing: 1 } as unknown as MeatheadDeath;

/** A leg from the hip to the foot (facing +1, his feet the origin): sound, the knee forward; broken, folded the wrong
 *  way at the knee, the bone out through the front of it. */
const leg = (c: Ctx, hip: P2, foot: P2, broken: boolean, back: boolean) => {
  const kn = broken ? joint2(hip[0], hip[1], foot[0], foot[1], THIGH, SHIN, 1) : knee(hip[0], hip[1], foot[0], foot[1], THIGH, SHIN, 1);
  const ft = reachTo(hip[0], hip[1], foot[0], foot[1], THIGH, SHIN);
  drawLeg(c, hip, kn, ft, broken ? 1.2 : 0.2, back);
  if (!broken) return;
  const dx = kn[0] - (hip[0] + ft[0]) / 2, dy = kn[1] - (hip[1] + ft[1]) / 2, d = Math.hypot(dx, dy) || 1, ux = -dx / d, uy = -dy / d;
  c.fillStyle = BLOOD[2]; c.beginPath(); c.ellipse(kn[0], kn[1], 5, 4, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = INK; c.lineWidth = 3.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(kn[0], kn[1]); c.lineTo(kn[0] + ux * 8, kn[1] + uy * 8); c.stroke();
  c.strokeStyle = '#F2EBDD'; c.lineWidth = 2; c.beginPath(); c.moveTo(kn[0], kn[1]); c.lineTo(kn[0] + ux * 8, kn[1] + uy * 8); c.stroke();
  box(c, kn[0] - 1, kn[1] + 2, 2, 5, BLOOD[3]);
};

/** His top half (above his belt), his own drawing, his feet the origin; lowered by `drop` (crouched). Without his
 *  glasses once they're off him. */
const topHalf = (c: Ctx, state: GameState, face: DeathFace, hurt: boolean, bare: boolean, drop = 0) => {
  const had = glassesOn();
  if (bare && had) setGlasses(false);
  c.save(); c.translate(0, drop); c.beginPath(); c.rect(-60, -110, 120, 89); c.clip();
  body(c, state, D, state.player.currentWeapon, { deathFace: face, hurtTimer: hurt ? 30 : 0, isGrounded: !hurt, vel: { x: 0, y: hurt ? 4 : 0 } });
  c.restore();
  if (bare && had) setGlasses(true);
};

/** The water battering him on the roof: crouched, knees bent, pressed down. */
const drawOnRoof = (c: Ctx, state: GameState, t: number, f: number) => {
  const h = himAt(t), drop = Math.min(6, t * 0.5), wob = Math.sin(f * 0.9) * 0.6;
  c.save(); c.translate(h.x, ROOF_Y); // (his feet on the roof)
  const hipN: P2 = [HIP_N[0], HIP_N[1] + drop], hipF: P2 = [HIP_F[0], HIP_F[1] + drop];
  leg(c, hipF, [-8, 0], false, true);
  topHalf(c, state, 'shock', true, false, drop + wob);
  leg(c, hipN, [9, 0], false, false);
  c.restore();
};

/** Falling and hitting: tumbling, flailing; astride the girt; the far leg broken from the second girt on. */
const drawFalling = (c: Ctx, state: GameState, t: number, f: number) => {
  const h = himAt(t), astride = t >= H1 && t < H1 + HOLD1, snapped = t >= H2, held = astride || (t >= H2 && t < H2 + HOLD2);
  const w = held ? 0 : f;
  c.save(); c.translate(h.x, h.y); c.rotate(h.rot); c.translate(0, 22);
  if (astride && t - H1 < 3) c.scale(1.1, 0.88);
  const flop = (a: number, r: number, hip: P2): P2 => [hip[0] + Math.cos(a) * r, hip[1] + Math.sin(a) * r];
  if (astride) {
    // (a leg down either side of the girt, the knees bent round it)
    leg(c, HIP_F, [-13, -6], false, true);
    topHalf(c, state, t - H1 < 6 ? 'shock' : 'agony', true, true);
    leg(c, HIP_N, [14, -6], false, false);
    // (his eyes out on stalks a beat)
    if (t - H1 < 10) for (const ex of [3, 10]) { box(c, ex - 2, -58, 5, 5, INK); box(c, ex - 1, -57, 3, 3, '#FFFFFF'); box(c, ex, -56, 1, 1, INK); }
  } else {
    leg(c, HIP_F, snapped ? flop(Math.PI / 2 + 0.9 * Math.sin(w * 0.5 + 1), 14, HIP_F) : [-4 + Math.sin(w * 0.45 + 2) * 9, -2], snapped, true);
    topHalf(c, state, 'scream', true, true);
    leg(c, HIP_N, [5 + Math.sin(w * 0.45) * 9, -2 + Math.cos(w * 0.45) * 3], false, false);
  }
  c.restore();
};

/** Face down on the boulder: flattened, splayed, the far leg the wrong way; twitching a while, then not. */
const drawSplat = (c: Ctx, state: GameState, t: number) => {
  const s = t - LAND, squash = s < 4 ? 0.55 + s * 0.04 : 0.72;
  const tw = s < 120 && (s % 29 < 3 || s % 47 < 2) ? (hash(t) - 0.5) * 3 : 0;
  // (the blood out round him on the rock, and down its face into the pool)
  const r = Math.min(46, 6 + s * 0.6);
  c.fillStyle = BLOOD[1]; c.beginPath(); c.ellipse(PTS[3][0] + 2, ROCK_Y + 1, r, Math.min(4, 1 + s * 0.08), 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = BLOOD[2]; c.beginPath(); c.ellipse(PTS[3][0] - 2, ROCK_Y + 0.5, r * 0.7, Math.min(3, 1 + s * 0.06), 0, 0, Math.PI * 2); c.fill();
  if (r > 30) for (let k = 0; k < 3; k++) { const x = k ? 208 + k * 2 : 98; box(c, x, ROCK_Y + 4, 2, Math.min(POOL - ROCK_Y, (s - 40) * 0.3 + k * 2), BLOOD[2 + (k % 2)]); }
  c.save(); c.translate(PTS[3][0], PTS[3][1]); c.rotate(Math.PI / 2); c.scale(squash, 1); c.translate(0, 22);
  // (his legs: the far one bent the wrong way, the near one splayed, twitching)
  leg(c, HIP_F, [-9, -7], true, true);
  topHalf(c, state, s < 20 ? 'agony' : 'dead', false, true);
  leg(c, HIP_N, [3, tw], false, false);
  c.restore();
};

/** The blood clouding the pool off the foot of the rock, carried off downstream. */
const drawBloodClouds = (c: Ctx, t: number) => {
  c.save(); c.beginPath(); c.rect(0, POOL + 3, VW, TALL - POOL); c.clip();
  for (let k = 0; k < 40; k++) {
    const a = t - (LAND + 30 + k * 6);
    if (a < 0) break;
    const x = 214 + a * 0.4 + (hash(k) - 0.5) * 16, y = POOL + 8 + hash(k + 9) * 30, r = Math.min(22, 4 + a * 0.18);
    if (x - r > VW) continue;
    c.globalAlpha = a < 60 ? 0.5 : a < 150 ? 0.34 : 0.2;
    c.fillStyle = k % 3 ? BLOOD[2] : BLOOD[3];
    c.beginPath(); c.ellipse(x, y, r * 1.4, r * 0.6, 0, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
  c.restore();
};

/** If he'd shat himself: the turd, popped out of him on the splat, rolls off the rock and plops in. */
const drawTurd = (c: Ctx, t: number) => {
  const s = t - LAND;
  if (!run.shat || s < 0) return;
  const T = 26, x = 136 - Math.min(s, T + 20) * 1.4, y = s < T ? ROCK_Y - 10 - 4 * s + 0.31 * s * s : Math.min(POOL + 4, ROCK_Y + (s - T) * 1.5);
  if (x < 60) return;
  c.save(); c.translate(x, y); c.rotate(s * 0.2);
  c.fillStyle = INK; c.beginPath(); c.ellipse(0, 0, 6, 3.6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#6B4423'; c.beginPath(); c.ellipse(0, 0, 5, 2.6, 0, 0, Math.PI * 2); c.fill(); box(c, -2, -2, 2, 1, '#8B5A2B');
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The kill cam

const shakeAt = (t: number) => {
  let a = 0;
  for (const at of [H1, H2]) if (t >= at && t < at + 12) a = Math.max(a, (12 - (t - at)) * 0.5);
  if (t >= LAND && t < LAND + 20) a = Math.max(a, (20 - (t - LAND)) * 0.6);
  return { x: (hash(t * 1.3) - 0.5) * 2 * a, y: (hash(t * 2.7) - 0.5) * 2 * a };
};

/** Draws the shot t frames in (the kill cam's whole screen). */
export const drawTrainFallsAt = (c: Ctx, state: GameState, t: number, f: number) => {
  const top = camAt(t), sh = shakeAt(t);
  c.save();
  c.fillStyle = '#0E1A24'; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  c.scale(Z, Z); c.translate(Math.round(sh.x), Math.round(-top + sh.y));
  const bands = (key: string, paint: (g: Ctx) => void) => {
    for (let i = 0; i * BAND < TALL; i++) if (i * BAND < top + VH + 10 && (i + 1) * BAND > top - 10) still(c, `${key}-${i}`, 0, 0, 0, i * BAND, VW, BAND, g => { g.save(); g.beginPath(); g.rect(0, i * BAND, VW, BAND); g.clip(); paint(g); g.restore(); });
  };
  bands('tfk-back', paintBack);
  // (the falls below the track, behind the trestle; the trestle; the train on it; the falls pouring onto it)
  drawCurtain(c, f, top, RAIL, POOL + 4);
  bands('tfk-front', paintFront);
  drawTrain(c, t, top);
  drawCurtain(c, f, top, 12, ROOF_Y - 2);
  drawSpray(c, f);
  drawGlasses(c, t);
  // (the pool's surface, the blood in it, what's gone in)
  c.fillStyle = 'rgba(28, 70, 98, 0.6)'; c.fillRect(0, POOL + 4, VW, TALL - POOL);
  drawBloodClouds(c, t);
  // (him)
  if (t < LEAD) drawOnRoof(c, state, t, f);
  else if (t < LAND) drawFalling(c, state, t, f);
  else drawSplat(c, state, t);
  drawTurd(c, t);
  // (the water still pouring down over him on the roof)
  if (t < LEAD + 4) drawCurtain(c, f, top, ROOF_Y - 50, ROOF_Y - 30);
  // (the gore, the pops)
  burst(c, t, H1, 186, GIRT1 + 2, 8, 5, 0.7);
  burst(c, t, H2, 160, GIRT2 + 2, 14, 19);
  burst(c, t, LAND, PTS[3][0], ROCK_Y - 4, 30, 43, 1.3);
  pop(c, t, H1, 'DONG!', 186, GIRT1 - 30, '#FDE047');
  pop(c, t, H2, 'SNAP!', 160, GIRT2 - 20, '#FDE047');
  pop(c, t, LAND, 'SPLAT!', PTS[3][0], ROCK_Y - 26, '#F87171');
  c.restore();
  for (const at of [H1, H2, LAND]) if (t >= at && t < at + 4) { c.fillStyle = at === LAND ? 'rgba(220, 38, 38, 0.3)' : 'rgba(255, 255, 255, 0.28)'; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  return top;
};

/** Is it on (his death off the train under the falls, playing)? Then the kill cam over the whole screen. */
export const drawTrainFallsCam = (c: Ctx, state: GameState): boolean => {
  const d = state.meatheadDeath;
  if (!d || d.kind !== TRAIN_FALLS_KILL || state.deathTimer <= 0) return false;
  const t = Math.min(state.deathScene?.t ?? LEN, LEN);
  const top = drawTrainFallsAt(c, state, t, state.frame);
  if (run.scream && state.playerLastVulgarity === run.scream && state.playerVulgarityTimer > 0) {
    const h = himAt(Math.min(t, LAND));
    saidOver(c, run.scream, h.x * Z, (h.y - top) * Z - 90);
  }
  return true;
};
