// In front of him (world space, at the play plane): the disasters themselves.
//
//   THE WRECKING BALL   its cable off the crane's trolley (steel, lit along one side), the hook block and the sling's
//                       chain, the ball: stepped from its shade up to its glint, dented, scuffed.
//   WHAT COMES DOWN     its shadow first (stepped rings, darker as it comes), dust trickling out of the sky over it; then
//                       it: a brick (the lot's brick ramp, mortar on it), a studio fresnel (barn doors, its lens), a
//                       chunk of a soundstage (stepped faces, rebar out of it).
//   WHAT THE WIND THROWS  dented trash cans (their lids flapping), plywood sheets (PROP stenciled), porta-potty doors
//                       (vent slats, OCCUPIED), Steve's fliers.
//   THE LOOT            snow globes, Revengers mugs and plushes, lobbed.
//   THE TORNADO         the funnel a row at a time: dust banded up it in a spiral going round, lit orange down its
//                       fire side, shaded on the other, its edges dithered into the air; narrow at its foot, out wide up
//                       top where it goes up into the clouds; the dust skirt rolling round its foot; its junk going round
//                       (a cow, the HAPPYWOOD letters, a porta-potty, Steve's standee, a golf cart). Choked by the
//                       avalanche: thin, white, stuttering. Its foot's exactly as wide as what kills him.
//   WHAT IT THROWS      out of it in an arc onto a red X on the street; what it's torn loose going round it (boards,
//                       guests in a flail).
//   THE SNOW            the chase's slides (a rolling wave, its crest lit, spray off its front); the big avalanche (a
//                       wall of snow taller than the screen, churning in bands, billows stepped from shade to white,
//                       firs and boulders tumbling in it, a front of spray; the bunkers' insides cut out of it).
//   THE FLOOD           its front face over whatever's in it (banded deeper, streaks), the foam along its top, what's
//                       floating. THE SURGE as it first comes in: murky silty water banded down from a churning top,
//                       a curling wave front (glassy green under the lip, the hollow under it, a whitewater curtain
//                       off it, its foot blowing up in foam, spray, mist), junk tumbling in it (2x4s, a trash can, a
//                       golf cart, a prop column, plywood), up STAGE 14's face in a column of spray when it hits; it
//                       settles to the rising water's own level by the time it's done (they meet exactly).

import type { GameState } from '../../../m1/game/core/state';
import { drawPerson } from '../../adventure/temple/people';
import { X, Y, R, BALL, COVERS, ROOF, AV_LEN, AV_H, AV_TELL, SLIDE_H, SLIDE_LEN, CLIMB, SHAFTS, x0, groundH } from './layout';
import type { Hv } from './state';
import { spent, ballAt } from './hazards';
import { tornadoBase, funnelHalf, FUNNEL_H, FORM_T, coverRoof } from './chase';
import { drawSkinned } from './skinned';
import { type Ctx, INK, box, poly, hash, mix, checker, STEEL, BRASS, PLY, ramp6, ball, signText, plain } from '../blvd/kit';
import { enamel, hillside } from '../../hub/letters';
import { steveCard, paintStandee } from '../blvd/props';
import { BRICK } from '../lot/paint';
import { SNOW, ROCK, flame, smokeUp } from './paint';
import { blowNear } from './snowzone';
import { inView } from '../blvd/paint';

const TAU = Math.PI * 2;
const groundAt = (rx: number) => { const h = groundH(rx); return h ?? 0; };

/** A disc in stepped rings: its shade down-right, itself, lit up-left, a glint (`R` a ramp, darkest first). */
const disc = (c: Ctx, x: number, y: number, r: number, R: string[], ink = true) => {
  const d = (dx: number, dy: number, rr: number, col: string) => { if (rr <= 0) return; c.fillStyle = col; c.beginPath(); c.arc(x + dx, y + dy, rr, 0, TAU); c.fill(); };
  if (ink) d(0, 0, r + 1, INK);
  d(0, 0, r, R[1]); d(-r * 0.12, -r * 0.12, r * 0.84, R[2]); d(-r * 0.25, -r * 0.25, r * 0.58, R[3]); d(-r * 0.38, -r * 0.38, r * 0.26, R[4]);
};

// ---------------------------------------------------------------------------------------------------------------
// The wrecking ball

const wreckingBall = (c: Ctx, state: GameState) => {
  const b = ballAt(state);
  if (!inView(state, b.x - 120, b.x + 120)) return;
  const px = X(BALL.px), py = Y(BALL.ph) + 6, S = STEEL;
  // (the cable: inked, steel, lit along one side; the hook block on it over the ball)
  const ang = Math.atan2(b.y - py, b.x - px), hx = b.x - Math.cos(ang) * (BALL.r + 22), hy = b.y - Math.sin(ang) * (BALL.r + 22);
  for (const [w, col] of [[4, INK], [2, S[3]], [1, S[5]]] as const) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(px + (w === 1 ? -0.5 : 0), py); c.lineTo(hx + (w === 1 ? -0.5 : 0), hy); c.stroke(); }
  c.save(); c.translate(hx, hy); c.rotate(ang - Math.PI / 2);
  box(c, -9, -8, 18, 14, INK); box(c, -8, -7, 16, 12, '#CA8A04'); box(c, -8, -7, 16, 2, '#FDE047'); box(c, 5, -7, 3, 12, '#854D0E');
  for (let k = 0; k < 3; k++) { box(c, -3, 6 + k * 5, 6, 5, INK); box(c, -2, 7 + k * 5, 4, 3, k % 2 ? S[3] : S[5]); }
  c.restore();
  // (the ball: stepped, dented, scuffed)
  disc(c, b.x, b.y, BALL.r, ['#0E0E10', '#1E1E22', '#34343A', '#4E4E56', '#7A7A84']);
  for (const [dx, dy, r] of [[12, 8, 5], [-6, 16, 4], [16, -10, 3]] as const) { c.fillStyle = '#18181B'; c.beginPath(); c.arc(b.x + dx, b.y + dy, r, 0, TAU); c.fill(); c.fillStyle = '#3F3F46'; c.beginPath(); c.arc(b.x + dx - 1, b.y + dy - 1, r - 1.5, 0, TAU); c.fill(); }
  box(c, b.x - 15, b.y - 18, 5, 3, '#D4D4D8'); box(c, b.x - 12, b.y - 21, 3, 2, '#F4F4F5');
  box(c, b.x - 2, b.y - BALL.r - 3, 4, 5, INK);
};

// ---------------------------------------------------------------------------------------------------------------
// What comes down, what the wind throws, the loot

const brick = (c: Ctx) => { const B = BRICK; box(c, -15, -9, 30, 18, INK); box(c, -14, -8, 28, 16, B[3]); box(c, -14, -8, 28, 3, B[5]); box(c, -14, -8, 3, 16, B[4]); box(c, 9, -8, 5, 16, B[1]); box(c, -14, 5, 28, 3, B[2]); box(c, -4, -2, 6, 3, '#C8C0B4'); };
const studioLight = (c: Ctx) => {
  box(c, -15, -15, 30, 28, INK); box(c, -14, -14, 28, 26, '#27272A'); box(c, -14, -14, 28, 3, '#52525B'); box(c, -14, -14, 3, 26, '#3F3F46');
  for (const s of [-1, 1]) { poly(c, [[s * 14, -12], [s * 22, -18], [s * 22, 14], [s * 14, 10]], INK); poly(c, [[s * 14, -11], [s * 21, -16], [s * 21, 12], [s * 14, 9]], '#3F3F46'); }
  disc(c, 0, 0, 8, ['#4A4030', '#8A7A50', '#D8C890', '#FEF3C7', '#FFFFFF'], true);
  box(c, -12, 13, 24, 4, INK); box(c, -11, 14, 22, 2, '#EAB308');
};
const chunk = (c: Ctx) => {
  const C = ['#2A2628', '#423C3C', '#5C5654', '#787270', '#97918C', '#B8B2AA'];
  poly(c, [[-21, -12], [-6, -18], [16, -15], [21, 2], [12, 17], [-14, 16], [-21, 4]], INK);
  poly(c, [[-20, -11], [-6, -17], [15, -14], [20, 2], [11, 16], [-13, 15], [-20, 4]], C[3]);
  poly(c, [[-20, -11], [-6, -17], [15, -14], [4, -6], [-12, -4]], C[4]);
  poly(c, [[15, -14], [20, 2], [11, 16], [4, -6]], C[1]);
  box(c, -12, -4, 2, 2, C[2]); box(c, 6, 6, 3, 2, C[2]);
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(2, -16); c.lineTo(6, -28); c.moveTo(10, -14); c.lineTo(18, -24); c.stroke();
  c.strokeStyle = '#8A3A1A'; c.lineWidth = 1; c.stroke();
};
const trashCan = (c: Ctx, f: number) => {
  const S = ramp6('#5A5E66');
  box(c, -13, -14, 26, 29, INK); box(c, -12, -13, 24, 27, S[3]); box(c, -12, -13, 5, 27, S[4]); box(c, 7, -13, 5, 27, S[1]);
  for (const y of [-6, 4]) { box(c, -12, y, 24, 2, S[1]); box(c, -12, y - 1, 24, 1, S[5]); }
  poly(c, [[-4, -2], [2, -4], [3, 2]], S[1]);
  c.save(); c.translate(0, -15); c.rotate(Math.sin(f * 0.5) * 0.4 - 0.3); box(c, -14, -4, 28, 5, INK); box(c, -13, -3, 26, 3, S[4]); box(c, -3, -7, 6, 3, S[2]); c.restore();
};
const plySheet = (c: Ctx) => {
  const P = PLY;
  box(c, -27, -19, 54, 38, INK); box(c, -26, -18, 52, 36, P[3]);
  for (let k = 0; k < 7; k++) box(c, -24, -14 + k * 5, 30 + hash(k) * 18, 1, P[2]);
  box(c, -26, -18, 52, 2, P[5]); box(c, 22, -18, 4, 36, P[1]);
  signText(c, 'PROP', 0, 4, { sx: 1, sy: 2, fill: '#3A2410', stencil: true });
};
const pottyDoor = (c: Ctx) => {
  const B = ramp6('#1D4ED8');
  box(c, -17, -27, 34, 54, INK); box(c, -16, -26, 32, 52, B[3]); box(c, -16, -26, 4, 52, B[4]); box(c, 12, -26, 4, 52, B[1]);
  for (let k = 0; k < 4; k++) box(c, -10, -22 + k * 4, 20, 2, B[1]);
  box(c, -9, -4, 18, 7, INK); box(c, -8, -3, 16, 5, '#F8FAFC'); box(c, -8, -3, 8, 5, '#DC2626');
  box(c, 10, 4, 3, 8, '#A1A1AA');
};
const loot = (c: Ctx, kind: 'globe' | 'mug' | 'plush') => {
  if (kind === 'globe') { box(c, -7, 4, 14, 5, INK); box(c, -6, 5, 12, 3, '#7C2D12'); disc(c, 0, -2, 7, ['#3A6A8A', '#6AA0C0', '#A0D0EA', '#D8F0FF', '#FFFFFF']); box(c, -3, 0, 6, 2, '#9A8458'); box(c, 2, -6, 1, 1, '#FFFFFF'); box(c, -2, -4, 1, 1, '#FFFFFF'); }
  else if (kind === 'mug') { box(c, -7, -8, 14, 16, INK); box(c, -6, -7, 12, 14, '#1D4ED8'); box(c, -6, -7, 3, 14, '#3B82F6'); box(c, -4, -2, 8, 2, '#FACC15'); c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.arc(8, 0, 4, -1.3, 1.3); c.stroke(); c.strokeStyle = '#1D4ED8'; c.lineWidth = 1; c.stroke(); }
  else { box(c, -7, -6, 14, 15, INK); box(c, -6, -5, 12, 13, '#DC2626'); box(c, -6, -5, 3, 13, '#F87171'); box(c, -3, -2, 6, 3, '#FACC15'); disc(c, 0, -10, 5, ['#8A5A3A', '#C8946A', '#E8C0A0', '#F6DCC8', '#FFFFFF']); box(c, -4, -12, 8, 2, '#1D4ED8'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The tornado's junk

const cow = (c: Ctx) => {
  const W = ['#8A8A90', '#C8C8CC', '#F0F0F2', '#FFFFFF'];
  for (const lx of [-20, -8, 8, 18]) { box(c, lx - 1, 8, 7, 14, INK); box(c, lx, 8, 5, 12, W[1]); box(c, lx, 18, 5, 3, '#1C1917'); }
  box(c, -27, -15, 54, 28, INK); box(c, -26, -14, 52, 26, W[2]); box(c, -26, -14, 52, 4, W[3]); box(c, -26, 8, 52, 4, W[1]);
  poly(c, [[-14, -14], [2, -14], [0, -4], [-12, -2]], '#1C1917'); poly(c, [[8, -6], [18, -8], [20, 4], [10, 6]], '#1C1917'); box(c, -24, 0, 8, 6, '#1C1917');
  box(c, -4, 10, 10, 5, '#F9A8D4'); box(c, -3, 14, 2, 2, '#F472B6'); box(c, 2, 14, 2, 2, '#F472B6');
  box(c, 21, -21, 17, 17, INK); box(c, 22, -20, 15, 15, W[2]); box(c, 22, -20, 15, 3, W[3]); box(c, 30, -12, 8, 6, '#FDA4AF'); box(c, 32, -10, 2, 2, INK);
  box(c, 25, -16, 3, 3, INK); box(c, 21, -24, 3, 5, '#E7E5E4'); box(c, 33, -24, 3, 5, '#E7E5E4');
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(-26, -10); c.quadraticCurveTo(-36, -4, -34, 8); c.stroke();
};
const potty = (c: Ctx) => {
  const B = ramp6('#1D4ED8');
  box(c, -19, -31, 38, 62, INK); box(c, -18, -30, 36, 60, B[3]); box(c, -18, -30, 6, 60, B[4]); box(c, 12, -30, 6, 60, B[1]);
  box(c, -21, -36, 42, 8, INK); box(c, -20, -35, 40, 6, '#F8FAFC'); box(c, -20, -35, 40, 2, '#FFFFFF');
  box(c, -12, -22, 24, 44, B[2]); for (let k = 0; k < 4; k++) box(c, -8, -26 + k * 3, 16, 1, B[1]);
  box(c, -6, -4, 12, 5, '#F8FAFC'); box(c, -6, -4, 6, 5, '#DC2626'); box(c, 8, 2, 2, 8, '#A1A1AA');
};
const golfCart = (c: Ctx) => {
  const W = ramp6('#F0EEE8');
  for (const wx of [-22, 22]) disc(c, wx, 12, 8, ['#0E0E10', '#1E1E22', '#34343A', '#4E4E56', '#7A7A84']);
  box(c, -31, -6, 62, 18, INK); box(c, -30, -5, 60, 16, W[3]); box(c, -30, -5, 60, 3, W[4]); box(c, -30, 4, 60, 3, '#1E3A8A');
  for (const px of [-26, 24]) box(c, px, -34, 3, 28, '#6A6E78');
  box(c, -33, -38, 66, 6, INK); box(c, -32, -37, 64, 4, '#B4243A'); box(c, -32, -37, 64, 1, '#E86A7A');
  box(c, -14, -14, 16, 8, '#3A5470');
};
const junk = (c: Ctx, kind: string, ch: string) => {
  if (kind === 'letter') { signText(c, ch || 'O', 0, 26, hillside({ sx: 7, sy: 8 }, '#F5F5F4', '#A8A29E')); return; }
  if (kind === 'cow') { cow(c); return; }
  if (kind === 'potty') { potty(c); return; }
  if (kind === 'standee') { c.save(); c.scale(0.8, 0.8); c.translate(0, 70); paintStandee(c); c.restore(); return; }
  golfCart(c);
};

// ---------------------------------------------------------------------------------------------------------------
// The tornado

const DUST = ['#241E1C', '#342C28', '#463C36', '#5A4E46', '#706258', '#8A7A6C'];
const ICY = ['#6E7C92', '#8C9AB0', '#AAB8CC', '#C8D4E2', '#E2EAF2', '#F6FAFF'];
const tornado = (c: Ctx, state: GameState, hv: Hv) => {
  const t = hv.tornado, f = state.frame;
  if (!t.on) return;
  const base = Y(tornadoBase(t.x));
  if (!inView(state, t.x - 320, t.x + 320)) return;
  const choke = t.choked < 110 ? 1 - t.choked / 110 : 0, snowy = choke > 0.2;
  const form = Math.min(1, t.formT / FORM_T), reach = FUNNEL_H * (1 - form);
  // (its lean: none at its foot (it's exactly as wide as what gets him), more up it)
  const sway = (y: number) => Math.sin(f * 0.04 + y * 0.008) * (base - y) * 0.08;
  const P = snowy ? ICY : DUST;
  const fire = snowy ? '#FFFFFF' : '#C2602E';
  const ROW = 4;
  for (let y = base - FUNNEL_H; y < base; y += ROW) {
    const up = base - y;
    if (up < reach) continue;
    const hw = funnelHalf(up) * (1 - choke * 0.55), cx = t.x + sway(y), top = up > FUNNEL_H - 90 ? (up - (FUNNEL_H - 90)) / 90 : 0;
    const a = (0.82 - top * 0.6) * (snowy ? 0.75 : 1);
    if (a <= 0.05) continue;
    c.globalAlpha = a;
    // (across it in steps: the fire-lit side, the body banded in a spiral going round and up, the shaded side)
    const segs = 8, sw = (hw * 2) / segs;
    for (let j = 0; j < segs; j++) {
      const u = (j + 0.5) / segs, spiral = Math.floor((up * 0.55 + j * 9 - f * 5) / 16);
      let k = 2 + (((spiral % 3) + 3) % 3 === 0 ? 1 : 0) + (u < 0.2 ? 1 : 0) - (u > 0.72 ? 1 : 0) - (u > 0.88 ? 1 : 0);
      k = Math.max(0, Math.min(5, k));
      c.fillStyle = u < 0.12 ? mix(P[4], fire, 0.35) : P[k];
      c.fillRect(Math.round(cx - hw + j * sw), y, Math.ceil(sw) + 1, ROW);
    }
    // (its edges dithered into the air)
    if ((y / ROW) % 2 === 0) { c.fillStyle = P[3]; c.fillRect(Math.round(cx - hw - 3), y, 3, ROW / 2); c.fillRect(Math.round(cx + hw), y + ROW / 2, 3, ROW / 2); }
  }
  c.globalAlpha = 1;
  // (specks of grit going round and up in it)
  for (let k = 0; k < 40; k++) {
    const y = base - ((k * 53 + f * 4) % FUNNEL_H), up = base - y;
    if (up < reach) continue;
    const hw = funnelHalf(up) * (1 - choke * 0.55), ph = f * 0.14 + k * 1.9;
    if (Math.cos(ph) < 0) continue;
    box(c, t.x + sway(y) + Math.sin(ph) * hw * 0.9, y, 2, 2, snowy ? '#FFFFFF' : k % 3 ? '#1C1714' : '#A8603A');
  }
  if (form < 1) return;
  // (its junk going round: more of it in the fling; the far side behind it skipped)
  const n = hv.fling.step === 'off' ? 6 : 12;
  const kinds = ['cow', 'letter', 'potty', 'standee', 'letter', 'cart'];
  for (let k = 0; k < n; k++) {
    const y = base - 120 - ((k * 97) % (FUNNEL_H - 160)), hw = funnelHalf(base - y);
    const a = f * (0.06 + (k % 3) * 0.02) + k * 1.3, sx = t.x + sway(y) + Math.sin(a) * hw;
    if (Math.cos(a) < -0.2 && k % 2) continue;
    c.save(); c.translate(sx, y); c.rotate(a * 2); c.scale(0.45, 0.45); junk(c, kinds[k % kinds.length], 'HAPPYWOOD'[k % 9]); c.restore();
  }
  // (its foot: the dust skirt rolling round it in stepped puffs, its shadow)
  c.fillStyle = 'rgba(10, 6, 6, 0.3)'; c.fillRect(Math.round(t.x - 80), base - 3, 160, 5);
  for (let k = 0; k < 10; k++) {
    const ph = f * 0.12 + k * 0.63, r = 10 + (k % 3) * 6, px = t.x + Math.sin(ph) * (58 + (k % 4) * 10), py = base - 8 - Math.abs(Math.cos(ph * 1.3)) * 14;
    for (const [s, col] of [[1, snowy ? ICY[2] : DUST[2]], [0.7, snowy ? ICY[4] : DUST[4]], [0.35, snowy ? ICY[5] : DUST[5]]] as const) { c.fillStyle = col; c.fillRect(Math.round(px - r * s), Math.round(py - r * s * 0.6 - (1 - s) * 3), Math.round(r * s * 2), Math.max(2, Math.round(r * s * 1.2))); }
  }
};

/** What it's torn loose, going round it and thrown out. */
const debris = (c: Ctx, state: GameState, hv: Hv) => {
  const f = state.frame;
  for (const d of hv.debris) {
    if (!inView(state, d.x - 40, d.x + 40)) continue;
    c.save(); c.translate(d.x, d.y); c.rotate(d.rot);
    if (d.guest) { const k = d.gk ?? Math.floor(d.orbit); c.scale(0.8, 0.8); drawPerson(c, { seed: 900 + k * 37, outfit: 'guest', f, pose: 'fly', mood: 'scared', woman: k % 2 === 1, shorts: k % 3 === 0 }); }
    else {
      const Rr = ramp6(d.col);
      box(c, -d.w / 2 - 1, -d.h / 2 - 1, d.w + 2, d.h + 2, INK); box(c, -d.w / 2, -d.h / 2, d.w, d.h, Rr[3]);
      box(c, -d.w / 2, -d.h / 2, d.w, Math.max(1, d.h * 0.2), Rr[4]); box(c, -d.w / 2, d.h / 2 - Math.max(1, d.h * 0.2), d.w, Math.max(1, d.h * 0.2), Rr[1]);
      poly(c, [[d.w / 2, -d.h / 2], [d.w / 2 + 4, -d.h / 2 + 3], [d.w / 2, 0]], Rr[2]);
    }
    c.restore();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The snow

const slides = (c: Ctx, state: GameState, hv: Hv) => {
  const f = state.frame, cam = state.camera;
  for (const s of hv.slides) {
    if (s.warn > 0) { if (f % 10 < 6) signText(c, '!', cam.x + 40, Y(groundAt(R(cam.x + 40))) - 90, { sx: 3, sy: 3, fill: ['#FCA5A5', '#EF4444', '#B91C1C'], ink: INK, shadow: INK }); continue; }
    const tail = s.x - SLIDE_LEN;
    if (!inView(state, tail, s.x)) continue;
    for (let x = tail; x < s.x; x += 6) {
      const k = (x - tail) / SLIDE_LEN, hgt = SLIDE_H * Math.sin(Math.PI * Math.min(1, k * 0.9 + 0.1)) + Math.sin(f * 0.4 + x * 0.1) * 3;
      const g = Y(groundAt(R(x)));
      box(c, x, g - hgt, 7, hgt + 4, k > 0.75 ? SNOW[3] : SNOW[4]);
      box(c, x, g - hgt, 7, 3, SNOW[5]); box(c, x, g - hgt * 0.45, 7, 2, SNOW[3]); box(c, x, g - 4, 7, 4, SNOW[2]);
      if (((x + f * 3) >> 3) % 4 === 0) box(c, x + 2, g - hgt + 6, 3, 2, SNOW[5]);
    }
    for (let k = 0; k < 6; k++) { const t = ((f * 2 + k * 9) % 30) / 30, px = s.x + t * 18, py = Y(groundAt(R(s.x))) - SLIDE_H * (0.4 + 0.5 * Math.sin(k)) - t * 14; box(c, px, py, 5 - t * 3, 5 - t * 3, t < 0.5 ? SNOW[5] : SNOW[4]); }
  }
};

/** A billow of snow, stepped (rows, never a smooth disc): its blue shade down-right, itself, lit up-left, a glint. */
const paintBillow = (c: Ctx, x: number, y: number, r: number) => {
  const disc2 = (cx: number, cy: number, rr: number, col: string) => {
    c.fillStyle = col;
    for (let dy = -rr; dy < rr; dy += 3) { const hw = Math.sqrt(Math.max(0, rr * rr - (dy + 1.5) * (dy + 1.5))); c.fillRect(Math.round(cx - hw), Math.round(cy + dy), Math.round(hw * 2), 3); }
  };
  disc2(x + r * 0.16, y + r * 0.16, r, SNOW[3]);
  disc2(x, y, r * 0.84, SNOW[4]);
  disc2(x - r * 0.24, y - r * 0.24, r * 0.5, SNOW[5]);
  c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(x - r * 0.42), Math.round(y - r * 0.42), Math.max(2, Math.round(r * 0.18)), 2);
};

// The avalanche's art, painted once (at the screen's scale) and put down whole: its billows as sprites, the body's
// churning bands, its shaded face and the powder off its front as patterns (the same pixels the old per-frame rows and
// dither made, a few draws a frame instead of thousands under the bunkers' clip). Painted ahead during the rumble.
const avScale = (c: Ctx) => Math.max(1, Math.min(4, Math.round(c.getTransform().a * 100) / 100));
/** A canvas w x h (world) at about scale s (fitted exactly to its whole pixels), its corner at world ox, oy. */
const canvasOf = (w: number, h: number, s: number, ox: number, oy: number, paint: (g: Ctx) => void) => {
  const cv = document.createElement('canvas');
  cv.width = Math.max(1, Math.ceil(w * s)); cv.height = Math.max(1, Math.ceil(h * s));
  const g = cv.getContext('2d')!, sx = cv.width / w, sy = cv.height / h;
  g.imageSmoothingEnabled = false; g.setTransform(sx, 0, 0, sy, -ox * sx, -oy * sy);
  paint(g);
  return cv;
};
const avArt = new Map<string, HTMLCanvasElement | CanvasPattern>();
/** Kept, the oldest let go past AV_MAX (each scale the screen's at has its own: a zoom, a resized window, sweeps through
 *  hundreds of them, each a fresh set never wanted again). A scale's whole set is a dozen. */
const AV_MAX = 72;
const keepAv = (k: string, v: HTMLCanvasElement | CanvasPattern) => {
  avArt.set(k, v);
  while (avArt.size > AV_MAX) avArt.delete(avArt.keys().next().value!);
};
/** Each pattern's tile size (world). */
const tileSize = new WeakMap<CanvasPattern, [number, number, number, number]>();
/** The billows' sizes (the body's, the front's). */
const BILLOW_R = [14, 22, 30, 38, 40, 50];
const billowBox = (r: number) => { const o = Math.ceil(r) + 3; return { o, w: Math.ceil(r * 2.4) + 8 }; };
const billowSprite = (s: number, r: number) => {
  const k = `b${r}@${s}`;
  let cv = avArt.get(k) as HTMLCanvasElement | undefined;
  if (!cv) { const { o, w } = billowBox(r); cv = canvasOf(w, w, s, -o, -o, g => paintBillow(g, 0, 0, r)); keepAv(k, cv); }
  return cv;
};
const billow = (c: Ctx, x: number, y: number, r: number) => {
  const { o, w } = billowBox(r);
  c.drawImage(billowSprite(avScale(c), r), Math.round(x) - o, Math.round(y) - o, w, w);
};
/** A repeating tile (w x h, at scale s) as a pattern. */
const tile = (c: Ctx, key: string, s: number, w: number, h: number, paint: (g: Ctx) => void) => {
  const k = `${key}@${s}`;
  let p = avArt.get(k) as CanvasPattern | undefined;
  if (!p) { const cv = canvasOf(w, h, s, 0, 0, paint); p = c.createPattern(cv, 'repeat')!; tileSize.set(p, [w, h, cv.width, cv.height]); keepAv(k, p); }
  return p;
};
/** The body's bands (four, 24 high, each dithered into the next along its foot): a 96-high tile, 60 across. */
const bodyTile = (c: Ctx, s: number) => tile(c, 'body', s, 60, 96, g => {
  const cols = [SNOW[4], SNOW[5], SNOW[4], SNOW[3]];
  for (let i = 0; i < 4; i++) {
    g.fillStyle = cols[i]; g.fillRect(0, i * 24, 60, 24);
    g.fillStyle = cols[(i + 1) % 4]; for (let x = (i * 3) % 6; x < 60; x += 6) g.fillRect(x, i * 24 + 22, 3, 2);
  }
});
/** Its leading face (50 wide: the dither, the shade, the dither, the deep shade), 40 high. */
const faceTile = (c: Ctx, s: number) => tile(c, 'face', s, 50, 40, g => {
  g.fillStyle = SNOW[3]; g.fillRect(4, 0, 46, 40); g.fillStyle = SNOW[2]; g.fillRect(32, 0, 18, 40);
  for (let k = 0; k < 10; k++) { g.fillStyle = SNOW[3]; g.fillRect((k % 2) * 2, k * 4, 2, 2); g.fillStyle = SNOW[2]; g.fillRect(28 + (k % 2) * 2, k * 4, 2, 2); }
});
/** The powder blown on ahead (six columns 34 wide, thinner and thinner, checkered; ph the checker's phase): 136 high. */
const powderTile = (c: Ctx, s: number, ph: number) => tile(c, `powder${ph}`, s, 210, 136, g => {
  for (let j = 0; j < 6; j++) {
    g.fillStyle = `rgba(246, 250, 255, ${(0.42 * (1 - j / 6)).toFixed(3)})`;
    for (let k = 0; k < 34; k++) if ((k + j + ph) % 2 === 0) g.fillRect(j * 34 + ((k * 7) % 34), k * 4, 4, 4);
  }
});
/** Put a pattern down over x, y, w, h with its tile's corner at ox, oy (world). */
const fillTile = (c: Ctx, p: CanvasPattern, ox: number, oy: number, x: number, y: number, w: number, h: number) => {
  const [tw, th, pw, ph] = tileSize.get(p)!;
  p.setTransform(new DOMMatrix([tw / pw, 0, 0, th / ph, ox, oy]));
  c.fillStyle = p; c.fillRect(x, y, w, h);
};
/** One piece of the avalanche's art painted ahead (during the rumble): a frame's worth at a time. */
const warmAv = (c: Ctx) => {
  const s = avScale(c);
  for (const r of BILLOW_R) if (!avArt.has(`b${r}@${s}`)) { billowSprite(s, r); return; }
  if (!avArt.has(`body@${s}`)) { bodyTile(c, s); return; }
  if (!avArt.has(`face@${s}`)) { faceTile(c, s); return; }
  for (const ph of [0, 1]) if (!avArt.has(`powder${ph}@${s}`)) { powderTile(c, s, ph); return; }
};
/** What the avalanche is carrying, tumbling (local, about its middle): a fir, a boulder, a buried car dug up, a parking
 *  meter, plywood off the chalet, the fake Christmas tree, an AVALANCHE ZONE sign. */
const avJunk = (c: Ctx, k: number) => {
  const kind = k % 7;
  if (kind === 0) { box(c, -4, -18, 8, 36, '#5A3A1E'); poly(c, [[0, -34], [17, 4], [-17, 4]], '#166534'); poly(c, [[0, -34], [-17, 4], [-4, 4]], '#22783E'); poly(c, [[0, -34], [8, -14], [-8, -14]], SNOW[5]); }
  else if (kind === 1) { poly(c, [[-13, -9], [4, -13], [13, 2], [2, 11], [-11, 7]], INK); poly(c, [[-12, -8], [4, -12], [12, 2], [2, 10], [-10, 6]], ROCK[2]); poly(c, [[-12, -8], [4, -12], [0, -2], [-8, -2]], ROCK[4]); box(c, -6, -10, 8, 2, SNOW[5]); }
  else if (kind === 2) {
    box(c, -27, -9, 54, 18, INK); box(c, -26, -8, 52, 12, '#9A3030'); box(c, -26, -8, 52, 3, '#C85050'); box(c, -16, -15, 30, 8, INK); box(c, -15, -14, 28, 6, '#4A6888');
    disc(c, -16, 8, 6, ['#0E0E10', '#1E1E22', '#2A2A30', '#3A3A44', '#52525B']); disc(c, 16, 8, 6, ['#0E0E10', '#1E1E22', '#2A2A30', '#3A3A44', '#52525B']); box(c, -26, -10, 30, 3, SNOW[5]);
  } else if (kind === 3) { box(c, -2, -4, 4, 26, INK); box(c, -1, -4, 2, 26, STEEL[3]); box(c, -8, -18, 16, 15, INK); box(c, -7, -17, 14, 13, STEEL[2]); box(c, -5, -14, 10, 5, '#DC2626'); }
  else if (kind === 4) { box(c, -22, -6, 44, 12, INK); box(c, -21, -5, 42, 10, PLY[3]); box(c, -21, -5, 42, 2, PLY[5]); box(c, -6, -5, 1, 10, PLY[1]); box(c, -21, -6, 20, 2, SNOW[5]); }
  else if (kind === 5) { poly(c, [[0, -26], [15, 6], [-15, 6]], '#14382A'); poly(c, [[0, -26], [-15, 6], [-4, 6]], '#2E6A4E'); for (const [ox, oy, col] of [[-6, 0, '#DC2626'], [5, -6, '#FACC15'], [2, 3, '#3B82F6']] as const) box(c, ox - 2, oy - 2, 4, 4, col); box(c, -2, 6, 4, 8, '#5A3A1E'); }
  else { box(c, -1, 0, 3, 24, STEEL[3]); box(c, -19, -14, 38, 16, INK); box(c, -18, -13, 36, 14, '#B91C1C'); box(c, -16, -11, 32, 10, '#F8FAFC'); box(c, -14, -9, 28, 6, '#B91C1C'); }
};
const avalanches = (c: Ctx, state: GameState, hv: Hv) => {
  const f = state.frame, cam = state.camera;
  for (const av of hv.avalanches) {
    if (av.phase === 'tell') {
      // (the tell: white building up at the left of the screen in bands, the warning)
      const k = Math.min(1, av.t / AV_TELL), w = 40 + k * 200;
      for (let i = 0; i < 6; i++) { c.fillStyle = `rgba(248, 250, 252, ${((0.35 + k * 0.5) * (1 - i / 6)).toFixed(3)})`; c.fillRect(cam.x + (w * i) / 6, cam.y, w / 6 + 1, 600); }
      // (snow shaken loose, the ground starting to jump)
      for (let j = 0; j < 8; j++) { const px = cam.x + 60 + ((j * 97) % 700), g = Y(groundAt(R(px))), hop = Math.abs(Math.sin(f * 0.6 + j * 1.7)) * 4 * k; box(c, px, g - 3 - hop, 3, 3, SNOW[5]); }
      if (f % 16 < 10) signText(c, 'AVALANCHE!', cam.x + 400, cam.y + 260, enamel(16, '#EF4444', '#000'));
      warmAv(c);
      continue;
    }
    if (av.phase !== 'run') continue;
    const tail = av.front - AV_LEN;
    const l = Math.max(tail, cam.x - 40), r = Math.min(av.front + 260, cam.x + 840);
    if (r <= l) continue;
    const top = Math.max(cam.y - 40, Y(groundAt(R(av.front))) - AV_H), bot = cam.y + 640;
    // Ahead of it (out in the open): its shadow thrown forward over everything, stepped, and the ground jumping, snow and
    // grit kicked up off it
    for (let i = 0; i < 4; i++) { const a = av.front + 60 + i * 70; if (a > cam.x + 840) break; c.fillStyle = `rgba(30, 44, 70, ${(0.16 - i * 0.035).toFixed(3)})`; c.fillRect(Math.round(Math.max(a, cam.x - 40)), cam.y - 40, 70, 680); }
    for (let j = 0; j < 16; j++) {
      const px = av.front + 40 + ((j * 53 + f * 5) % 360);
      if (px > cam.x + 840 || px < cam.x - 40) continue;
      const k = 1 - (px - av.front) / 400, g = Y(groundAt(R(px))), hop = Math.abs(Math.sin(f * 0.5 + j * 1.3)) * 12 * k;
      box(c, px, g - 3 - hop, j % 3 ? 3 : 2, j % 3 ? 3 : 2, j % 4 === 0 ? ROCK[3] : SNOW[5]);
    }
    c.save();
    c.beginPath(); c.rect(l, top, r - l, bot - top);
    COVERS.forEach((_, k) => { const cr = coverRoof(k); if (cr.x < r && cr.x + cr.w > l) c.rect(cr.x + 10, cr.y + cr.h, cr.w - 20, ROOF); });
    c.clip('evenodd');
    const body = Math.min(av.front, r) - l;
    // (the body: banded snow churning down it, the bands' edges dithered into each other)
    const s = avScale(c);
    if (body > 0) {
      const off = (f * 6) % 48;
      fillTile(c, bodyTile(c, s), l, top - off, l, top - off, body, bot - (top - off));
      // (its leading face in shade: the light's from the upper left, the face looks right; dithered into the body)
      const fx = Math.round(Math.min(av.front, r));
      fillTile(c, faceTile(c, s), fx - 50, Math.round(top), fx - 50, Math.round(top), 50, bot - Math.round(top));
    }
    // (billows tumbling in it, each going round as it comes on, and what it's carrying)
    for (let k = 0; k < 34; k++) {
      const ox = tail + ((k * 263 + f * 9) % AV_LEN), oy = cam.y + ((k * 151 + f * (3 + (k % 4))) % 640);
      const a = f * 0.09 + k * 1.3, bx = ox + Math.cos(a) * 10, by = oy + Math.sin(a) * 10;
      if (bx < l - 50 || bx > Math.min(av.front, r) + 20) continue;
      billow(c, bx, by, 14 + (k % 4) * 8);
      if (k % 5 === 0) { c.save(); c.translate(bx + 6, by - 4); c.rotate(f * (k % 2 ? 0.1 : -0.08) + k); avJunk(c, Math.floor(k / 5)); c.restore(); }
    }
    // (its front: billows of spray rolling over, stepped; the powder blown on ahead of it, dithered thinner and thinner)
    for (let k = 0; k < 18; k++) {
      const y = cam.y - 20 + k * 38, bx = av.front + Math.sin(f * 0.3 + k) * 16 + ((k * 13) % 30);
      billow(c, bx, y, 30 + (k % 3) * 10);
    }
    if (av.front + 40 <= r) {
      const py = top - ((f * 4) % 8);
      fillTile(c, powderTile(c, s, (f >> 1) % 2), av.front + 40, py, av.front + 40, py, 210, bot - py);
    }
    for (let j = 0; j < 22; j++) { const t = ((f * 3 + j * 19) % 60) / 60, px = av.front + 20 + t * 220, py = cam.y + ((j * 89) % 620) - t * 40; if (px < r) box(c, px, py, 3 - t * 2 + 1, 3 - t * 2 + 1, SNOW[5]); }
    c.restore();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The flood (its front face)

const floodFront = (c: Ctx, state: GameState, hv: Hv) => {
  const fd = hv.flood, f = state.frame, cam = state.camera;
  if (!fd.on) return;
  // (while it's surging in, none of it ahead of the surge's front)
  const s = surgeOf(state, hv);
  const a = Math.max(x0 - 900, cam.x - 20), b = Math.min(X(CLIMB.b), cam.x + 820, s.on ? s.raw + 40 : Infinity), sy = Y(fd.h);
  if (b <= a) { if (s.on) surgeArt(c, state, s); return; }
  const bot = cam.y + 640;
  // (the water: banded deeper, streaks, the red sky on it)
  const bands = ['rgba(64, 92, 124, 0.62)', 'rgba(44, 70, 102, 0.68)', 'rgba(32, 54, 86, 0.74)', 'rgba(22, 40, 68, 0.8)'];
  for (let i = 0, y = sy; y < bot; i++) { const h = 18 + i * 14; c.fillStyle = bands[Math.min(3, i)]; c.fillRect(a, y, b - a, Math.min(h, bot - y)); y += h; }
  for (let k = 0; k < 18; k++) { const sx = a + ((k * 173 + f * 0.8) % Math.max(1, b - a)), syy = sy + 20 + ((k * 61) % 200); box(c, sx, syy, 20 + (k % 3) * 10, 1, 'rgba(150, 180, 210, 0.4)'); }
  box(c, a, sy + 3, b - a, 3, 'rgba(160, 80, 60, 0.35)');
  // (the foam along its top, chopping)
  for (let x = Math.floor(a / 8) * 8; x < b; x += 8) { const h2 = Math.sin(x * 0.05 + f * 0.15) * 3; box(c, x, sy + h2 - 2, 8, 3, '#E2E8F0'); if ((x / 8 + (f >> 3)) % 3 === 0) box(c, x + 2, sy + h2 - 4, 4, 2, '#FFFFFF'); }
  // (on fire (the user's: "make the flood water... on fire as well. sell the idea that the water will hurt you as it
  // rises"): the lava's lit the oil on it; its heat glowing up off it, the flames in patches along it all the way, their
  // smoke going up, embers). Not the surge (the user's: "the initial flood wave isn't on fire. it's the rising water
  // that is"): it catches once the wave's in.
  if (!s.on) {
  for (let i = 0; i < 4; i++) { c.fillStyle = `rgba(249, 115, 22, ${(0.2 - i * 0.045).toFixed(3)})`; c.fillRect(a, sy - 12 - i * 12, b - a, 12); }
  c.fillStyle = 'rgba(234, 88, 12, 0.3)'; c.fillRect(a, sy, b - a, 14);
  for (let x = Math.floor(a / 30) * 30; x < b; x += 30) {
    const k = Math.floor(x / 30), on = hash(k * 1.37 + Math.floor(f / 240 + hash(k) * 3)) > 0.18;
    if (!on) continue;
    flame(c, x + 15 + (hash(k * 2.1) - 0.5) * 10, sy + 2 + Math.sin(x * 0.05 + f * 0.15) * 3, 18 + hash(k * 3.3) * 14, 26 + hash(k * 5.7) * 34, f, k);
  }
  for (let x = Math.floor(a / 230) * 230 + 90; x < b; x += 230) smokeUp(c, x, sy - 30, f, x * 0.01, 0.9, 0.4, 6);
  for (let k = 0; k < 14; k++) { const t = ((f * 0.9 + k * 37) % 120) / 120, ex = a + ((k * 211) % Math.max(1, b - a)) + Math.sin(t * 6 + k) * 8, ey = sy - 10 - t * 150; box(c, ex, ey, 2, 2, t < 0.5 ? '#FDE047' : '#F97316'); }
  }
  // (junk floating on it: a standee face down, a tire, a plush, a plywood sheet)
  for (let k = 0; k < 5; k++) {
    const jx = a + ((k * 197 + f * 0.6) % Math.max(1, b - a)), jy = sy - 4 + Math.sin(f * 0.1 + k) * 2;
    c.save(); c.translate(jx, jy); c.rotate(Math.sin(f * 0.05 + k) * 0.15);
    if (k === 0) { box(c, -13, -5, 26, 8, INK); box(c, -12, -4, 24, 6, '#FACC15'); box(c, -12, -4, 24, 2, '#FEF08A'); }
    else if (k === 1) { disc(c, 0, 0, 8, ['#0E0E10', '#1E1E22', '#2A2A30', '#3A3A44', '#52525B']); box(c, -3, -3, 6, 6, '#1E293B'); }
    else if (k === 2) { box(c, -6, -6, 12, 10, INK); box(c, -5, -5, 10, 8, '#DC2626'); disc(c, 0, -8, 4, ['#8A5A3A', '#C8946A', '#E8C0A0', '#F6DCC8', '#FFFFFF']); }
    else { box(c, -16, -3, 32, 6, INK); box(c, -15, -2, 30, 4, PLY[3]); box(c, -15, -2, 30, 1, PLY[5]); }
    c.restore();
  }
  // (the surge rolling in as it starts, over the water's own level: see surgeArt)
  if (s.on) surgeArt(c, state, s);
};

// ---------------------------------------------------------------------------------------------------------------
// The surge (the flood's first rush in: fd.wave 0..SURGE_T, looks only)

/** The surge's water (silty, green-brown, darkest first), and its whitewater (darkest first). */
const MURK = ['#121A1C', '#1C2A2C', '#2A3C3A', '#3E5046', '#5A6856', '#7C8870'];
const FOAM = ['#7E8A84', '#A8B2AC', '#CCD4CE', '#E8EDE9', '#FFFFFF'];
/** The glassy green under its lip, lit through. */
const GLASS = ['#4E6E5E', '#6E8E78', '#92B09A'];
const SURGE_T = 120;
const smooth = (a: number, b: number, x: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
type Surge = ReturnType<typeof surgeOf>;

/** The surge: its front (the old wave's x, coming on 14 px a frame; it fetches up against STAGE 14's face), how much of
 *  it there still is over the water's own level (E: 1 down to 0 at SURGE_T, when it's just the rising water and the two
 *  meet exactly), the water's height over GY at x behind the front. */
export const surgeOf = (state: GameState, hv: Hv) => {
  const fd = hv.flood, k = fd.wave / SURGE_T;
  const raw = state.camera.x - 200 + fd.wave * 14, wall = X(SHAFTS[0].b), front = Math.min(raw, wall), hit = raw > wall;
  const E = 1 - smooth(0.35, 1, k), grow = Math.min(1, fd.wave / 10);
  // (what it settles to: just over the street while it's surging, down to the flood's own level by the end)
  const base = fd.h + (Math.max(0, fd.h) + 6 - fd.h) * E;
  const ti = hit ? (raw - wall) / 14 : 0, peak = 98 * (hit ? Math.max(0.25, 1 - ti / 22) : 1);
  const hAt = (x: number, f: number) => base + E * grow * (52 + peak * Math.exp(-Math.max(0, front - x) / 170)) + E * (Math.sin(x * 0.07 + f * 0.3) * 3 + Math.sin(x * 0.021 - f * 0.11) * 5);
  return { on: fd.on && fd.wave < SURGE_T, wave: fd.wave, raw, wall, front, hit, ti, E, grow, base, hAt, sy: Y(fd.h) };
};

/** A puff of whitewater, stepped: its shade, itself, lit, a glint. */
const puff = (c: Ctx, x: number, y: number, r: number) => {
  if (r < 1.5) return;
  box(c, x - r, y - r * 0.55, r * 2, r * 1.1, FOAM[1]);
  box(c, x - r * 0.8, y - r * 0.8, r * 1.5, r * 0.9, FOAM[2]);
  box(c, x - r * 0.55, y - r * 0.95, r * 0.9, r * 0.5, FOAM[3]);
  if (r > 5) box(c, x - r * 0.4, y - r * 0.9, Math.max(1, r * 0.3), Math.max(1, r * 0.2), FOAM[4]);
};

/** What it's carrying, tumbling (drawn at its middle). */
const surgeJunk = (c: Ctx, j: number, f: number) => {
  const k = j % 5;
  if (k === 0) {
    // (a 2x4, nails in it)
    box(c, -31, -5, 62, 10, INK); box(c, -30, -4, 60, 8, PLY[3]); box(c, -30, -4, 60, 2, PLY[5]); box(c, -30, 2, 60, 2, PLY[1]);
    for (let n = 0; n < 4; n++) box(c, -24 + n * 15, -3, 6 + (n % 2) * 4, 1, PLY[2]);
    box(c, 20, -8, 2, 4, STEEL[5]); box(c, -18, -9, 2, 5, STEEL[4]);
  } else if (k === 1) { c.scale(0.9, 0.9); trashCan(c, f); }
  else if (k === 2) { c.scale(0.55, 0.55); golfCart(c); }
  else if (k === 3) {
    // (a prop column, styrofoam, fluted, its capital)
    const P = ['#5E5648', '#8A8070', '#B4AA96', '#D6CCB6', '#EEE6D2', '#FFFAEE'];
    box(c, -13, -26, 26, 52, INK); box(c, -12, -22, 24, 44, P[3]);
    for (let n = 0; n < 4; n++) { box(c, -10 + n * 6, -22, 2, 44, P[2]); box(c, -8 + n * 6, -22, 1, 44, P[4]); }
    box(c, 8, -22, 4, 44, P[1]);
    box(c, -16, -27, 32, 7, INK); box(c, -15, -26, 30, 5, P[4]); box(c, -15, -26, 30, 1, P[5]);
    box(c, -15, 21, 30, 6, INK); box(c, -14, 22, 28, 4, P[3]);
    poly(c, [[2, 6], [12, 2], [12, 14], [4, 12]], P[5]);
  } else { c.scale(0.7, 0.7); plySheet(c); }
};

/** The surge drawn: its body behind the front (banded deeper, streaked, silt in it, the junk in it), the whitewater
 *  along its top, the curl at its front (or the spray off STAGE 14's face once it's hit it), the mist. */
const surgeArt = (c: Ctx, state: GameState, s: Surge) => {
  const f = state.frame, cam = state.camera, E = s.E;
  if (E <= 0.002) return;
  const bot = Math.min(s.sy, cam.y + 660);
  const l = Math.max(x0 - 900, cam.x - 40), r = Math.min(cam.x + 840, s.hit ? s.wall : s.front - 6);
  // ---- the body: in 4 px strips, banded down from its surface, dithered where the bands meet
  const BANDS: [number, string][] = [[3, FOAM[2]], [5, MURK[5]], [12, MURK[4]], [24, MURK[3]], [36, MURK[2]], [9999, MURK[1]]];
  c.globalAlpha = 0.62 + 0.32 * E;
  if (r > l) for (let x = Math.floor(l / 4) * 4; x < r; x += 4) {
    const top = Math.round(Y(s.hAt(x, f)));
    if (top >= bot) continue;
    let y = top, prev = '';
    for (const [dh, col] of BANDS) {
      const h = Math.min(dh, bot - y);
      if (h <= 0) break;
      c.fillStyle = col; c.fillRect(x, y, 4, h);
      if (prev && h > 3) { c.fillStyle = prev; c.fillRect(x + ((x >> 2) & 1) * 2, y, 2, 2); }
      prev = col; y += h;
    }
  }
  if (r > l) {
    const W2 = r - l;
    // (flow streaks running with it, silt clouding it)
    for (let k = 0; k < 28; k++) {
      const x = l + ((k * 131 + f * (7 + (k % 4) * 2)) % W2), top = Y(s.hAt(x, f)), y = top + 9 + ((k * 47) % 120);
      if (y > bot - 3) continue;
      box(c, x, y, 10 + (k % 3) * 8, 1, k % 3 ? MURK[5] : MURK[0]);
      if (k % 4 === 0) checker(c, Math.round(x / 2) * 2 - 10, Math.round(y / 2) * 2 + 4, 20, 8, '#6A5236', k % 2);
    }
    c.globalAlpha = 1;
    // ---- the junk in it, tumbling, half under (the water's bands over its lower half), a foam ring round each
    const reach = s.hit ? s.wall - 34 : s.front - 30;
    for (let j = 0; j < 6; j++) {
      const x = s.front - 80 - j * 108 - Math.sin(f * 0.05 + j) * 14;
      if (x < cam.x - 60 || x > reach || E < 0.2) continue;
      const top = Y(s.hAt(x, f)), bob = Math.sin(f * 0.2 + j * 1.7) * 3;
      c.save(); c.translate(x, top + 4 + bob); c.rotate(f * (0.05 + (j % 3) * 0.03) * (j % 2 ? 1 : -1) + j * 1.3); surgeJunk(c, j, f); c.restore();
      c.globalAlpha = 0.62 + 0.32 * E;
      box(c, x - 30, top + 8, 60, 12, MURK[4]); box(c, x - 30, top + 20, 60, 16, MURK[3]);
      c.globalAlpha = 1;
      for (let n = 0; n < 5; n++) puff(c, x - 28 + n * 14 + Math.sin(f * 0.3 + n) * 2, top + 8, 4 + ((n + j) % 3) * 2);
    }
    // ---- its top: a lit line of chop, lace foam trailing back, whitewater thick toward the front
    for (let x = Math.floor(l / 4) * 4; x < r; x += 4) {
      const top = Math.round(Y(s.hAt(x, f)));
      box(c, x, top - 1, 4, 1, FOAM[3]);
      if (hash(Math.floor(x / 4) * 1.7 + Math.floor(f / 4)) > 0.7) box(c, x, top + 3 + ((x >> 2) % 3) * 2, 3, 1, FOAM[1]);
    }
    for (let x = Math.max(l, s.front - 340); x < r; x += 7) {
      const near = Math.exp(-(s.front - x) / 110), hsh = hash(Math.floor(x / 7) * 3.1 + Math.floor(f / 3));
      if (hsh > 0.25 + near * 0.7) continue;
      puff(c, x + Math.sin(f * 0.4 + x) * 2, Y(s.hAt(x, f)) - near * 4, (3 + near * 9) * (0.6 + 0.4 * E) * (0.7 + hsh * 0.6));
    }
  }
  c.globalAlpha = 1;
  if (!s.hit) curl(c, s, f); else wallHit(c, s, f);
};

/** The curl at its front: the face going up, banded, glassy green under the lip, the lip going over, the hollow under it
 *  dark, the whitewater curtain falling off the lip, the foot blowing up in foam, spray off the lip, mist. */
const curl = (c: Ctx, s: Surge, f: number) => {
  const hh = s.hAt(s.front, f) - s.base;
  if (hh < 18) return;
  const sc = Math.max(0.5, hh / 150), y0 = Math.round(Y(s.base)), fx = s.front;
  const P = (u: number, v: number): [number, number] => [fx + u * sc, y0 - v * hh];
  const wob = Math.sin(f * 0.35) * 0.02;
  const outer: [number, number][] = [[-96, 0.74], [-56, 0.87], [-24, 0.97], [4, 1.0], [24, 0.94 + wob], [38, 0.8 + wob], [44, 0.64], [39, 0.5]];
  const inner: [number, number][] = [[30, 0.56], [20, 0.62], [10, 0.58], [4, 0.44], [6, 0.26], [14, 0.1], [24, -0.04]];
  const shape = [...outer, ...inner, [-96, -0.04]].map(([u, v]) => P(u, v));
  // (the face: banded up it, dithered where the bands meet; streaks drawn up it)
  c.save(); c.beginPath(); shape.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
  const bands: [number, string][] = [[0, MURK[2]], [0.28, MURK[3]], [0.5, MURK[4]], [0.66, GLASS[0]], [0.76, GLASS[1]], [0.85, GLASS[2]], [0.93, FOAM[2]]];
  const L = fx - 100 * sc, Wd = 150 * sc;
  bands.forEach(([v, col], i) => {
    const v1 = i + 1 < bands.length ? bands[i + 1][0] : 1.1, ya = y0 - v1 * hh, yb = y0 - v * hh;
    box(c, L, ya, Wd, yb - ya + 1, col);
    if (i > 0) checker(c, Math.round(L / 2) * 2, Math.round(yb / 2) * 2 - 2, Wd, 2, bands[i - 1][1], 0);
  });
  for (let k = 0; k < 9; k++) {
    const t = ((f * 3 + k * 23) % 60) / 60, u = -80 + ((k * 37) % 100), v = 0.1 + t * 0.8;
    const [px, py] = P(u + t * 20, v);
    box(c, px, py, 2, 6 * sc, v > 0.6 ? GLASS[2] : MURK[5]);
  }
  c.restore();
  // (inked round its back and over the top)
  c.strokeStyle = '#0A1012'; c.lineWidth = 2; c.beginPath(); outer.forEach(([u, v], i) => { const [x, y] = P(u, v); if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke();
  // (the hollow under the lip: dark, darker in, its back lit a little)
  poly(c, [P(39, 0.5), P(30, 0.56), P(20, 0.62), P(10, 0.58), P(4, 0.44), P(6, 0.26), P(14, 0.1), P(24, -0.04), P(46, -0.04), P(44, 0.3)], MURK[1]);
  poly(c, [P(30, 0.5), P(18, 0.56), P(11, 0.46), P(12, 0.26), P(20, 0.12), P(34, 0.1), P(38, 0.34)], MURK[0]);
  c.strokeStyle = GLASS[0]; c.lineWidth = 1; c.beginPath(); [P(30, 0.56), P(20, 0.62), P(10, 0.58), P(4, 0.44), P(6, 0.26)].forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  // (the curtain falling off the lip, whitewater streaming down it)
  poly(c, [P(36, 0.54), P(45, 0.62), P(50, -0.04), P(39, -0.04)], FOAM[1]);
  poly(c, [P(40, 0.56), P(45, 0.6), P(48, -0.04), P(43, -0.04)], FOAM[2]);
  for (let k = 0; k < 6; k++) { const t = ((f * 5 + k * 13) % 40) / 40, [px, py] = P(39 + (k % 3) * 3 + t * 3, 0.56 - t * 0.6); box(c, px, py, 2, 5 * sc, FOAM[4]); }
  // (the lip: lit along its top, a glint)
  c.strokeStyle = FOAM[3]; c.lineWidth = 2; c.beginPath(); [P(-24, 0.97), P(4, 1.0), P(24, 0.94 + wob), P(38, 0.8 + wob), P(44, 0.64)].forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  // (whitewater rolling on its crest)
  for (let k = 0; k < 9; k++) { const u = -70 + k * 12 + Math.sin(f * 0.3 + k) * 3, v = k < 5 ? 0.8 + k * 0.04 : 1 - (k - 5) * 0.05, [px, py] = P(u, v); puff(c, px, py + 2, (5 + (k % 3) * 2.5) * sc); }
  // (its foot blowing up in foam, a skirt of it shoved on ahead)
  for (let k = 0; k < 8; k++) { const ph = f * 0.4 + k * 1.3, [px, py] = P(46 + (k % 4) * 10 + Math.sin(ph) * 3, 0.05 + (k % 3) * 0.05 + Math.abs(Math.sin(ph)) * 0.06); puff(c, px, py, (8 + (k % 3) * 4) * sc); }
  for (let k = 0; k < 7; k++) { const [px] = P(70 + k * 14, 0); puff(c, px + Math.sin(f * 0.5 + k) * 2, y0 + 2 - (k % 2) * 2, (6 - k * 0.6) * sc); }
  // (spray off the lip, thrown on ahead and falling)
  for (let k = 0; k < 16; k++) {
    const t = ((f * 1.6 + k * 7) % 26) / 26, [lx, ly] = P(42, 0.7 + (k % 4) * 0.06);
    const px = lx + (20 + (k % 5) * 12) * t * sc * 2, py = ly - (14 + (k % 3) * 10) * t * sc + t * t * 70 * sc, sz = Math.max(1, Math.round((4 - t * 3) * Math.min(1.2, sc)));
    box(c, px, py, sz, sz, t < 0.4 ? FOAM[4] : t < 0.75 ? FOAM[3] : FOAM[1]);
  }
  // (mist hanging round its front, dithered, thinning out)
  c.globalAlpha = 0.28 * s.E;
  checker(c, Math.round((fx - 20 * sc) / 2) * 2, Math.round((y0 - hh * 1.15) / 2) * 2, Math.round(130 * sc), Math.round(hh * 0.5), FOAM[3], (f >> 3) & 1);
  c.globalAlpha = 0.18 * s.E;
  checker(c, Math.round((fx - 60 * sc) / 2) * 2, Math.round((y0 - hh * 1.35) / 2) * 2, Math.round(200 * sc), Math.round(hh * 0.3), FOAM[4], ((f >> 3) + 1) & 1);
  c.globalAlpha = 1;
};

/** Once it's hit STAGE 14's face: it goes up the wall in a column of spray (stepped puffs, rising, spreading back over
 *  it, falling), sheets running back down the wall, droplets coming down, the mist. */
const wallHit = (c: Ctx, s: Surge, f: number) => {
  const wx = s.wall, y0 = Y(s.base), up = Math.min(1, s.ti / 10), fall = Math.max(0, 1 - s.ti / 46);
  const H = 260 * s.E * up * fall + 30 * s.E;
  if (H < 8) return;
  for (let k = 0; k < 18; k++) {
    const t = k / 17, py = y0 - t * H, spread = t * t * 70;
    const px = wx - 14 - spread * (0.6 + hash(k * 3.3) * 0.6) + Math.sin(f * 0.35 + k) * 4;
    puff(c, px, py, (7 + t * 12 + (k % 3) * 2) * (0.5 + 0.5 * fall));
  }
  // (sheets running back down the wall)
  for (let k = 0; k < 6; k++) { const t = ((f * 4 + k * 17) % 60) / 60, x = wx - 6 - k * 4, y = y0 - H * 0.8 + t * H * 0.8; box(c, x, y, 2, 10, k % 2 ? FOAM[2] : MURK[5]); }
  // (droplets falling back)
  for (let k = 0; k < 18; k++) { const t = ((f * 1.3 + k * 11) % 40) / 40, px = wx - 20 - (k * 13) % 120 - t * 30, py = y0 - H * (0.4 + (k % 5) * 0.12) + t * t * 160; if (py < y0) box(c, px, py, 2 + (k % 2), 2 + (k % 2), t < 0.5 ? FOAM[4] : FOAM[2]); }
  c.globalAlpha = 0.24 * s.E;
  checker(c, Math.round((wx - 160) / 2) * 2, Math.round((y0 - H) / 2) * 2, 156, Math.round(H * 0.8), FOAM[3], (f >> 3) & 1);
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------

export const drawHavocEffects = (c: Ctx, state: GameState, hv: Hv) => {
  const f = state.frame, cam = state.camera;
  wreckingBall(c, state);
  // What's coming down: its shadow (the warning) where it'll land, then it
  for (const d of hv.drops) {
    if (!inView(state, d.x - 40, d.x + 40) || d.done > 0) continue;
    const k = d.warn > 0 ? 1 - d.warn / 90 : 1;
    for (const [s, a] of [[1, 0.12 + k * 0.15], [0.6, 0.18 + k * 0.25]] as const) { c.fillStyle = `rgba(10, 6, 6, ${a.toFixed(2)})`; c.fillRect(Math.round(d.x - (18 + k * 12) * s), Math.round(d.land - 4 * s - 1), Math.round((36 + k * 24) * s), Math.max(2, Math.round(7 * s))); }
    if (d.warn > 0) {
      if (d.kind === 'chunk') {
        for (let y = cam.y; y < cam.y + 120; y += 14) { const yy = y + ((f * 3) % 14); box(c, d.x - 2 + ((y + f) % 5), yy, 3, 4, '#D6D3D1'); box(c, d.x + 3 - ((y + f) % 4), yy + 6, 2, 2, '#A8A29E'); }
        signText(c, '!', d.x, cam.y + 140, { sx: 2, sy: 3, fill: ['#FCA5A5', '#EF4444', '#B91C1C'], ink: INK, shadow: INK });
      }
      continue;
    }
    c.save(); c.translate(d.x, d.y - 16); c.rotate(d.rot);
    if (d.kind === 'brick') brick(c); else if (d.kind === 'light') studioLight(c); else chunk(c);
    c.restore();
  }
  // What the wind's throwing
  for (const o of hv.blown) {
    if (!inView(state, o.x - 40, o.x + 40)) continue;
    c.save(); c.translate(o.x, o.y); c.rotate(o.rot);
    if (o.kind === 'can') trashCan(c, f); else if (o.kind === 'sheet') plySheet(c); else if (o.kind === 'door') pottyDoor(c);
    else steveCard(c, 0, 0, 0.5, Math.abs(Math.round(o.x)) % 3);
    c.restore();
  }
  // The looters' loot in the air
  for (const l of hv.lobs) { c.save(); c.translate(l.x, l.y); c.rotate(l.rot); loot(c, l.kind); c.restore(); }
  // The tornado's thrown junk, and its mark where it'll come down
  for (const o of hv.thrown) {
    if (!inView(state, Math.min(o.x, o.tx) - 60, Math.max(o.x, o.tx) + 60)) continue;
    if (o.landed === 0) {
      c.fillStyle = 'rgba(10, 6, 6, 0.3)'; c.fillRect(Math.round(o.tx - 26), Math.round(o.ty - 4), 52, 5);
      const col = f % 10 < 5 ? '#EF4444' : '#FCA5A5';
      for (const [w, cc] of [[5, INK], [3, col]] as const) { c.strokeStyle = cc; c.lineWidth = w; c.lineCap = 'square'; c.beginPath(); c.moveTo(o.tx - 14, o.ty - 8); c.lineTo(o.tx + 14, o.ty + 2); c.moveTo(o.tx + 14, o.ty - 8); c.lineTo(o.tx - 14, o.ty + 2); c.stroke(); }
      c.lineCap = 'butt';
    }
    c.save(); c.translate(o.x, o.y - (o.landed ? 20 : 0)); if (!o.landed) c.rotate(o.rot); junk(c, o.kind, o.ch); c.restore();
  }
  // The tornado (and him dying in it: skinned, in front of it so he reads); what it's torn loose; the snow slides; the
  // avalanche over everything
  tornado(c, state, hv);
  drawSkinned(c, state);
  debris(c, state, hv);
  slides(c, state, hv);
  avalanches(c, state, hv);
  floodFront(c, state, hv);
  // (a little of the weather in front of everything: ash, or snow on the hill and after; down the hill, the blizzard's
  // nearest snow, the frost at the very front: snowzone.ts)
  if (!spent(state)) {
    blowNear(c, state);
    const rx = R(cam.x + 400), snow = rx > CLIMB.b - 200;
    for (let k = 0; k < 14; k++) {
      const px = cam.x + ((k * 151 + f * (snow ? 3 : 1.2) + k * k) % 840) - 20, py = cam.y + ((k * 233 + f * (snow ? 3.4 : 1.5)) % 640) - 20;
      box(c, px, py, 3, 3, snow ? '#F8FAFC' : '#C8C0B8'); if (k % 3 === 0) box(c, px + 3, py + 1, 1, 1, snow ? '#C8D4E4' : '#8A827C');
    }
  }
  void BRASS; void plain; void poly; void ball;
};
