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
//                       floating, the wave rolling in.

import type { GameState } from '../../../m1/game/core/state';
import { drawPerson } from '../../adventure/temple/people';
import { GY } from '../geometry';
import { X, Y, R, BALL, COVERS, ROOF, AV_LEN, AV_H, AV_TELL, SLIDE_H, SLIDE_LEN, CLIMB, x0, groundH } from './layout';
import type { Hv } from './state';
import { spent, ballAt } from './hazards';
import { tornadoBase, funnelHalf, FUNNEL_H, FORM_T, coverRoof } from './chase';
import { drawSkinned } from './skinned';
import { type Ctx, INK, box, poly, hash, mix, STEEL, BRASS, PLY, ramp6, ball, signText, plain } from '../blvd/kit';
import { enamel, hillside } from '../../hub/letters';
import { steveCard, paintStandee } from '../blvd/props';
import { BRICK } from '../lot/paint';
import { SNOW, ROCK } from './paint';
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
    if (d.guest) { c.scale(0.8, 0.8); drawPerson(c, { seed: 900 + Math.floor(d.orbit * 7), outfit: 'guest', f, pose: 'fly', mood: 'scared', woman: Math.floor(d.orbit) % 2 === 1 }); }
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

const billow = (c: Ctx, x: number, y: number, r: number) => {
  c.fillStyle = SNOW[3]; c.beginPath(); c.arc(x + r * 0.18, y + r * 0.18, r, 0, TAU); c.fill();
  c.fillStyle = SNOW[4]; c.beginPath(); c.arc(x, y, r * 0.86, 0, TAU); c.fill();
  c.fillStyle = SNOW[5]; c.beginPath(); c.arc(x - r * 0.25, y - r * 0.25, r * 0.5, 0, TAU); c.fill();
};
const avalanches = (c: Ctx, state: GameState, hv: Hv) => {
  const f = state.frame, cam = state.camera;
  for (const av of hv.avalanches) {
    if (av.phase === 'tell') {
      // (the tell: white building up at the left of the screen in bands, the warning)
      const k = Math.min(1, av.t / AV_TELL), w = 40 + k * 200;
      for (let i = 0; i < 6; i++) { c.fillStyle = `rgba(248, 250, 252, ${((0.35 + k * 0.5) * (1 - i / 6)).toFixed(3)})`; c.fillRect(cam.x + (w * i) / 6, cam.y, w / 6 + 1, 600); }
      if (f % 16 < 10) signText(c, 'AVALANCHE!', cam.x + 400, cam.y + 260, enamel(16, '#EF4444', '#000'));
      continue;
    }
    if (av.phase !== 'run') continue;
    const tail = av.front - AV_LEN;
    const l = Math.max(tail, cam.x - 40), r = Math.min(av.front + 70, cam.x + 840);
    if (r <= l) continue;
    const top = Math.max(cam.y - 40, Y(groundAt(R(av.front))) - AV_H), bot = cam.y + 640;
    c.save();
    c.beginPath(); c.rect(l, top, r - l, bot - top);
    COVERS.forEach((_, k) => { const cr = coverRoof(k); if (cr.x < r && cr.x + cr.w > l) c.rect(cr.x + 10, cr.y + cr.h, cr.w - 20, ROOF); });
    c.clip('evenodd');
    const body = Math.min(av.front, r) - l;
    // (the body: banded snow, churning down it, blue in its shade)
    for (let y = top - ((f * 6) % 48), i = 0; y < bot; y += 24, i++) { c.fillStyle = [SNOW[4], SNOW[5], SNOW[4], SNOW[3]][((i % 4) + 4) % 4]; c.fillRect(l, y, body, 24); }
    for (let k = 0; k < 30; k++) {
      const bx = tail + ((k * 263 + f * 9) % AV_LEN), by = cam.y + ((k * 151 + f * (3 + k % 4)) % 640);
      if (bx < l - 40 || bx > r) continue;
      billow(c, bx, by, 14 + (k % 4) * 8);
      if (k % 7 === 0) { c.save(); c.translate(bx, by); c.rotate(f * 0.1 + k); box(c, -4, -18, 8, 36, '#5A3A1E'); poly(c, [[0, -34], [17, 4], [-17, 4]], '#166534'); poly(c, [[0, -34], [-17, 4], [-4, 4]], '#22783E'); poly(c, [[0, -34], [8, -14], [-8, -14]], SNOW[5]); c.restore(); }
      if (k % 11 === 3) { c.save(); c.translate(bx, by); c.rotate(-f * 0.08 + k); poly(c, [[-12, -8], [4, -12], [12, 2], [2, 10], [-10, 6]], ROCK[2]); poly(c, [[-12, -8], [4, -12], [0, -2], [-8, -2]], ROCK[4]); c.restore(); }
    }
    // (its front: a billow of spray, stepped)
    for (let k = 0; k < 18; k++) {
      const y = cam.y - 20 + k * 38, bx = av.front + Math.sin(f * 0.3 + k) * 16 + ((k * 13) % 30);
      billow(c, bx, y, 30 + (k % 3) * 10);
    }
    c.restore();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The flood (its front face)

const floodFront = (c: Ctx, state: GameState, hv: Hv) => {
  const fd = hv.flood, f = state.frame, cam = state.camera;
  if (!fd.on) return;
  const a = Math.max(x0 - 900, cam.x - 20), b = Math.min(X(CLIMB.b), cam.x + 820), sy = Y(fd.h);
  if (b <= a) return;
  const bot = cam.y + 640;
  // (the water: banded deeper, streaks, the red sky on it)
  const bands = ['rgba(64, 92, 124, 0.62)', 'rgba(44, 70, 102, 0.68)', 'rgba(32, 54, 86, 0.74)', 'rgba(22, 40, 68, 0.8)'];
  for (let i = 0, y = sy; y < bot; i++) { const h = 18 + i * 14; c.fillStyle = bands[Math.min(3, i)]; c.fillRect(a, y, b - a, Math.min(h, bot - y)); y += h; }
  for (let k = 0; k < 18; k++) { const sx = a + ((k * 173 + f * 0.8) % Math.max(1, b - a)), syy = sy + 20 + ((k * 61) % 200); box(c, sx, syy, 20 + (k % 3) * 10, 1, 'rgba(150, 180, 210, 0.4)'); }
  box(c, a, sy + 3, b - a, 3, 'rgba(160, 80, 60, 0.35)');
  // (the foam along its top, chopping)
  for (let x = Math.floor(a / 8) * 8; x < b; x += 8) { const h2 = Math.sin(x * 0.05 + f * 0.15) * 3; box(c, x, sy + h2 - 2, 8, 3, '#E2E8F0'); if ((x / 8 + (f >> 3)) % 3 === 0) box(c, x + 2, sy + h2 - 4, 4, 2, '#FFFFFF'); }
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
  // (the wave rolling in as it starts: a curl of it, its lip, the foam off it)
  if (fd.wave < 120) {
    const wx = cam.x - 200 + fd.wave * 14;
    c.fillStyle = 'rgba(52, 80, 112, 0.88)'; c.beginPath(); c.moveTo(cam.x - 40, GY + 10); c.lineTo(wx, GY + 10); c.quadraticCurveTo(wx + 60, GY - 80, wx - 20, GY - 130); c.lineTo(cam.x - 40, GY - 120); c.closePath(); c.fill();
    c.fillStyle = 'rgba(96, 128, 160, 0.8)'; c.beginPath(); c.moveTo(wx - 60, GY - 110); c.quadraticCurveTo(wx + 30, GY - 90, wx - 20, GY - 130); c.lineTo(wx - 60, GY - 124); c.closePath(); c.fill();
    for (let k = 0; k < 10; k++) { const fx = wx - 24 + ((k * 13) % 50), fy = GY - 124 - (k % 3) * 10; billow(c, fx, fy, 7 + (k % 3) * 2); }
  }
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
  // (a little of the weather in front of everything: ash, or snow on the hill and after)
  if (!spent(state)) {
    const rx = R(cam.x + 400), snow = rx > CLIMB.b - 200;
    for (let k = 0; k < 14; k++) {
      const px = cam.x + ((k * 151 + f * (snow ? 3 : 1.2) + k * k) % 840) - 20, py = cam.y + ((k * 233 + f * (snow ? 3.4 : 1.5)) % 640) - 20;
      box(c, px, py, 3, 3, snow ? '#F8FAFC' : '#C8C0B8'); if (k % 3 === 0) box(c, px + 3, py + 1, 1, 1, snow ? '#C8D4E4' : '#8A827C');
    }
  }
  void BRASS; void plain; void poly; void ball;
};
