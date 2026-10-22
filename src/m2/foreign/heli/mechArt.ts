// The landmarks drawn: each the park's oversized replica, BUILT INTO A MECH once it's up: a hip chassis bolted under it
// (hazard stripes, a warning light), two armored hydraulic legs (a piston in each shin, yellow knee joints, three-toed
// feet), and a pair of GOOGLY EYES stuck on (white, the pupils rolling about after him; shut while it sleeps; X'd on a
// wreck). Each body lit from the upper left in flat steps (its shadow side down the right), inked, with its own
// details. Upright with the base at the origin (y up negative), facing left (at him).
//
// Its arrival (mechs.ts): a replica on its plinth; the ground cracks; it's swallowed (sink: clipped at the ground); it
// bursts back up on its legs, crouched, and stands (unfold); its eyes snap open. Wrecked: blackened, over on its side,
// smoking (the wreck painted once to a cached canvas: the park's ring has up to eight of them on screen).
// Also their shots (outlined and haloed so they read over the busy park), beams, drops, minions; and the blasts.

import type { GameState } from '../../../m1/game/core/state';
import type { Mech, Heli, Boom } from './state';
import { LEG, CY } from './geo';
import { EYES, PISA_DOWN, groundY, pisaPivot, BEAM_LOCK } from './mechs';
import type { MechId } from './lines';
import { checker, mix } from '../../intro/art/kit';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';
const mixC = mix;
const disc = (c: Ctx, x: number, y: number, rr: number, col: string) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, Math.max(0.5, rr), 0, Math.PI * 2); c.fill(); };
/** A color's five steps (shadow, shade, itself, lit, highlight), kept. */
const ramps = new Map<string, string[]>();
const rampOf = (col: string) => { let R = ramps.get(col); if (!R) { R = [mix(col, INK, 0.55), mix(col, INK, 0.3), col, mix(col, '#FFFFFF', 0.32), mix(col, '#FFFFFF', 0.62)]; ramps.set(col, R); } return R; };

const fl = (c: Ctx, col: string, path: () => void, line = 1.8) => { c.beginPath(); path(); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = line; c.lineJoin = 'round'; c.stroke(); };
const r = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
/** A shape lit from the upper left: its body in mid, right of split in dark (the shadow side), inked. */
const lit = (c: Ctx, mid: string, dark: string, path: () => void, split = 0, line = 1.8) => {
  c.beginPath(); path(); c.fillStyle = mid; c.fill();
  c.save(); c.beginPath(); c.rect(split, -4000, 4000, 8000); c.clip(); c.beginPath(); path(); c.fillStyle = dark; c.fill(); c.restore();
  c.beginPath(); path(); c.strokeStyle = INK; c.lineWidth = line; c.lineJoin = 'round'; c.stroke();
};

export interface MechLook {
  awake: boolean; f: number; m?: Mech; wreck?: boolean; flash?: boolean;
  /** A replica on its plinth (asleep: the tour; the ones still to come). */
  plinth?: boolean;
  /** Its legs: 0 folded up in a crouch .. 1 stood (undefined: stood if it's awake). */
  legs?: number;
  /** Its eyes: none (a plain replica), shut (asleep), open. Undefined: open if it's awake. */
  eyes?: 'none' | 'shut' | 'open';
  /** How far it's sunk into the ground (0 .. 1: all of it), clipped at the ground; how hard it's shaking. */
  sink?: number; shake?: number;
  /** Walking in (park.ts): each foot (left, right) where it is on the ground, in its own frame (feet planted). */
  feet?: { x: number; y: number }[];
}

// ---------------------------------------------------------------------------------------------------------------
// The mech under it: the chassis, the legs; or the plinth it stands on as a replica

const STEEL = ['#2A2A30', '#3F3F46', '#52525B', '#71717A', '#A1A1AA', '#D4D4D8'];
const HAZARD = (c: Ctx, x: number, y: number, w: number, h: number) => {
  r(c, x, y, w, h, '#FACC15');
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.fillStyle = INK;
  for (let k = -h; k < w; k += 12) { c.beginPath(); c.moveTo(x + k, y + h); c.lineTo(x + k + 6, y + h); c.lineTo(x + k + 6 + h, y); c.lineTo(x + k + h, y); c.closePath(); c.fill(); }
  c.restore();
};
const plinthOf = (c: Ctx) => {
  lit(c, '#B8B2A6', '#8E887C', () => c.rect(-64, -LEG, 128, LEG), 30);
  r(c, -62, -LEG + 2, 124, 4, '#DAD5CB'); r(c, -62, -12, 124, 4, '#78716C');
  r(c, -40, -LEG + 16, 80, 16, '#9A9488'); r(c, -38, -LEG + 18, 76, 2, '#C8C2B6');
};
/** The legs at u (0 crouched .. 1 stood): where the body sits on top of them (y). */
const hipY = (u: number) => -LEG * (0.5 + 0.5 * u);
const legsOf = (c: Ctx, L: MechLook, u: number) => {
  const ph = L.wreck ? 0 : L.f * 0.09, hy = hipY(u);
  for (const s of [-1, 1]) {
    // (each foot lifts in turn: stomping in place; crouched, the knees splay out)
    const lift = u > 0.95 ? Math.max(0, Math.sin(ph + (s > 0 ? Math.PI : 0))) * 9 : 0;
    let kx = s * (22 + (1 - u) * 18), ky = hy / 2 - lift, fx = s * 28 + (u > 0.95 ? Math.cos(ph + (s > 0 ? Math.PI : 0)) * 5 : 0), fy = -7 - lift;
    // (walking in: the foot where it is on the ground, the knee between, bent out and up as the foot lifts)
    const ft = L.feet?.[s > 0 ? 1 : 0];
    if (ft) { fx = ft.x; fy = ft.y; kx = (s * 16 + fx) / 2 + s * 8; ky = (hy + fy) / 2 - 4 + Math.min(0, fy + 7) * 0.4; }
    c.lineCap = 'round';
    // (thigh: armored)
    c.strokeStyle = INK; c.lineWidth = 19; c.beginPath(); c.moveTo(s * 16, hy); c.lineTo(kx, ky); c.stroke();
    c.strokeStyle = STEEL[2]; c.lineWidth = 15; c.beginPath(); c.moveTo(s * 16, hy); c.lineTo(kx, ky); c.stroke();
    c.strokeStyle = STEEL[4]; c.lineWidth = 4; c.beginPath(); c.moveTo(s * 16 - 4, hy); c.lineTo(kx - 4, ky); c.stroke();
    // (shin: a piston, the chrome rod showing)
    c.strokeStyle = INK; c.lineWidth = 15; c.beginPath(); c.moveTo(kx, ky); c.lineTo(fx, fy); c.stroke();
    c.strokeStyle = STEEL[1]; c.lineWidth = 11; c.beginPath(); c.moveTo(kx, ky); c.lineTo(fx, fy); c.stroke();
    c.strokeStyle = STEEL[5]; c.lineWidth = 3; c.beginPath(); c.moveTo(kx + (fx - kx) * 0.45 - 2, ky + (fy - ky) * 0.45); c.lineTo(fx - 2, fy); c.stroke();
    // (the knee: a yellow joint, a bolt)
    fl(c, '#FACC15', () => c.arc(kx, ky, 8, 0, Math.PI * 2), 1.6); fl(c, STEEL[3], () => c.arc(kx, ky, 3, 0, Math.PI * 2), 1);
    // (the foot: three toes, splayed)
    fl(c, STEEL[1], () => { c.moveTo(fx - 22, fy + 7); c.lineTo(fx - 14, fy - 5); c.lineTo(fx + 14, fy - 5); c.lineTo(fx + 22, fy + 7); c.closePath(); }, 1.6);
    for (const t of [-18, 0, 18]) fl(c, STEEL[0], () => c.roundRect(fx + t - 5, fy + 3, 10, 6, 2), 1);
    r(c, fx - 12, fy - 4, 24, 2, STEEL[4]);
  }
  // (the hip chassis: a slab with hazard stripes, rivets, a warning light; exhausts)
  fl(c, STEEL[2], () => c.roundRect(-48, hy - 12, 96, 18, 4));
  HAZARD(c, -44, hy - 4, 88, 6);
  r(c, -44, hy - 10, 88, 3, STEEL[4]);
  for (const x of [-40, -20, 20, 40]) r(c, x - 1, hy - 8, 3, 3, STEEL[0]);
  const blink = (L.f >> 4) % 2 === 0 && !L.wreck;
  fl(c, blink ? '#EF4444' : '#7F1D1D', () => c.arc(0, hy - 14, 5, Math.PI, 0), 1.2);
  if (blink) { c.globalAlpha = 0.3; c.fillStyle = '#F87171'; c.beginPath(); c.arc(0, hy - 15, 11, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
  for (const s of [-1, 1]) { fl(c, STEEL[1], () => c.rect(s * 52 - 4, hy - 16, 8, 14), 1.2); if (!L.wreck && (L.f >> 3) % 3 === 0) { c.globalAlpha = 0.5; c.fillStyle = '#A1A1AA'; c.beginPath(); c.arc(s * 54, hy - 22 - (L.f % 8), 5, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; } }
};

// ---------------------------------------------------------------------------------------------------------------
// Googly eyes

/** Its eyes at their spots (from the base, at the body's place): big whites, inked; pupils by m.eyes (rolling,
 *  lagging); a lid down over them while it's shut (open: how far the lid's up); X'd on a wreck. */
export const googly = (c: Ctx, id: MechId, m: Mech | undefined, wreck: boolean, f: number, how: 'shut' | 'open' = 'open', open = 1) => {
  const spots = EYES[id](m ?? ({ k: 0, lean: 0 } as Mech));
  spots.forEach((e, i) => {
    const R = e.r * 1.3;
    fl(c, '#FFFFFF', () => c.arc(e.x, e.y, R, 0, Math.PI * 2), 2.4);
    c.strokeStyle = 'rgba(0,0,0,0.14)'; c.lineWidth = 3; c.beginPath(); c.arc(e.x, e.y, R - 3, 0.3, 1.7); c.stroke();
    if (wreck) { c.strokeStyle = INK; c.lineWidth = 3.5; c.beginPath(); c.moveTo(e.x - R * 0.5, e.y - R * 0.5); c.lineTo(e.x + R * 0.5, e.y + R * 0.5); c.moveTo(e.x + R * 0.5, e.y - R * 0.5); c.lineTo(e.x - R * 0.5, e.y + R * 0.5); c.stroke(); return; }
    const g = m?.eyes[i] ?? { x: Math.sin(f * 0.05 + i) * 2, y: e.r * 0.3 };
    c.fillStyle = INK; c.beginPath(); c.arc(e.x + g.x * 1.3, e.y + g.y * 1.3, R * 0.5, 0, Math.PI * 2); c.fill();
    r(c, e.x + g.x * 1.3 - R * 0.22, e.y + g.y * 1.3 - R * 0.28, Math.max(2, R * 0.18), Math.max(2, R * 0.18), '#FFFFFF');
    const lid = how === 'shut' ? 1 : 1 - open;
    if (lid > 0.02) {
      c.save(); c.beginPath(); c.arc(e.x, e.y, R, 0, Math.PI * 2); c.clip();
      r(c, e.x - R - 1, e.y - R - 1, R * 2 + 2, (R * 2 + 2) * lid, '#9CA3AF');
      r(c, e.x - R - 1, e.y - R - 1 + (R * 2 + 2) * lid - 3, R * 2 + 2, 3, INK);
      c.restore();
      c.strokeStyle = INK; c.lineWidth = 2.4; c.beginPath(); c.arc(e.x, e.y, R, 0, Math.PI * 2); c.stroke();
    }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Each landmark's body (above the legs: y from -LEG up)

const B = -LEG;
type Body = (c: Ctx, L: MechLook) => void;
const eiffel: Body = (c, L) => {
  const iron = ['#3A2214', '#5A3620', '#7C4A2D', '#A0673C', '#C98A52'];
  // (the four-legged base with its arch; the first deck; the narrowing middle; the second deck; the spire)
  lit(c, iron[2], iron[1], () => { c.moveTo(-104, B); c.lineTo(-60, B - 112); c.lineTo(60, B - 112); c.lineTo(104, B); c.lineTo(64, B); c.quadraticCurveTo(0, B - 84, -64, B); c.closePath(); }, 8);
  lit(c, iron[2], iron[1], () => { c.moveTo(-56, B - 122); c.lineTo(-22, B - 252); c.lineTo(22, B - 252); c.lineTo(56, B - 122); c.closePath(); }, 6);
  lit(c, iron[2], iron[1], () => { c.moveTo(-20, B - 262); c.lineTo(-5, B - 402); c.lineTo(5, B - 402); c.lineTo(20, B - 262); c.closePath(); }, 2);
  // (the lattice: crossed girders)
  c.lineWidth = 1.6; c.strokeStyle = iron[0];
  for (let y = B - 18; y > B - 110; y -= 16) { const w = 100 - (B - y) * 0.38; c.beginPath(); c.moveTo(-w, y); c.lineTo(w - 10, y - 16); c.moveTo(w, y); c.lineTo(-w + 10, y - 16); c.stroke(); }
  for (let y = B - 130; y > B - 250; y -= 18) { const w = 56 - (B - 120 - y) * 0.26; c.beginPath(); c.moveTo(-w, y); c.lineTo(w - 4, y - 18); c.moveTo(w, y); c.lineTo(-w + 4, y - 18); c.stroke(); }
  for (let y = B - 270; y > B - 400; y -= 22) { const w = 19 - (B - 262 - y) * 0.11; c.beginPath(); c.moveTo(-w, y); c.lineTo(w, y - 22); c.moveTo(w, y); c.lineTo(-w, y - 22); c.stroke(); }
  // (the decks: lit rails along their tops)
  fl(c, iron[1], () => c.rect(-74, B - 124, 148, 14)); r(c, -72, B - 123, 144, 3, iron[4]); for (let x = -68; x < 70; x += 10) r(c, x, B - 120, 2, 8, iron[0]);
  fl(c, iron[1], () => c.rect(-32, B - 264, 64, 11)); r(c, -30, B - 263, 60, 2, iron[4]);
  fl(c, iron[1], () => c.rect(-12, B - 410, 24, 10)); r(c, -10, B - 409, 20, 2, iron[4]);
  // (the lit edges up its left side)
  c.strokeStyle = iron[3]; c.lineWidth = 3; c.beginPath(); c.moveTo(-98, B - 4); c.lineTo(-60, B - 108); c.moveTo(-52, B - 128); c.lineTo(-21, B - 248); c.moveTo(-17, B - 268); c.lineTo(-5, B - 398); c.stroke();
  // (the antenna, a little flag on it)
  fl(c, '#FDE68A', () => c.rect(-3, B - 436, 6, 28), 1.4);
  const w = Math.sin(L.f * 0.2) * 2;
  const flagCols = ['#1D4ED8', '#F8FAFC', '#DC2626'];
  for (let k = 0; k < 3; k++) fl(c, flagCols[k], () => { c.moveTo(3 + k * 7, B - 434 + (k ? w : 0)); c.lineTo(10 + k * 7, B - 434 + w); c.lineTo(10 + k * 7, B - 424 + w); c.lineTo(3 + k * 7, B - 424 + (k ? w : 0)); c.closePath(); }, 1);
};
const opera: Body = (c, L) => {
  // (the podium: granite steps; the glass walls between the sails; the sails, white tiles lined in gray, opening
  // when it claps, their undersides in shadow)
  lit(c, '#C8A27A', '#A47E58', () => c.rect(-156, B - 62, 312, 62), 60);
  for (let y = B - 52; y < B; y += 10) r(c, -154, y, 308, 2, '#8C6844');
  r(c, -154, B - 61, 308, 3, '#E2C29A');
  fl(c, '#7C5A2A', () => c.rect(-120, B - 100, 240, 38), 1.2);
  for (let x = -116; x < 120; x += 14) r(c, x, B - 98, 2, 34, '#D9A441');
  const open = L.m?.a ?? 0;
  const sail = (x: number, s: number, tip: number) => {
    c.save(); c.translate(x, B - 62); c.rotate(-open * 0.35 * (x < 0 ? 1 : 0.6));
    const path = () => { c.moveTo(-50 * s, 0); c.quadraticCurveTo(-40 * s, -tip * 0.8, 40 * s, -tip); c.quadraticCurveTo(20 * s, -tip * 0.4, 30 * s, 0); c.closePath(); };
    fl(c, '#F8FAFC', path);
    c.save(); c.beginPath(); path(); c.clip(); c.fillStyle = '#CBD5E1'; c.beginPath(); c.moveTo(30 * s, 0); c.quadraticCurveTo(22 * s, -tip * 0.45, 40 * s, -tip); c.lineTo(60 * s, 0); c.closePath(); c.fill(); c.restore();
    c.strokeStyle = '#94A3B8'; c.lineWidth = 1.2;
    for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(-50 * s + k * 16 * s, 0); c.quadraticCurveTo(-40 * s + k * 14 * s, -tip * 0.7, 40 * s - (5 - k) * 4 * s, -tip + k * 4); c.stroke(); }
    c.beginPath(); path(); c.strokeStyle = INK; c.lineWidth = 1.8; c.stroke();
    c.restore();
  };
  sail(-120, 0.6, 80); sail(-70, 1, 140); sail(10, 1.2, 168); sail(70, 0.9, 120);
};
const redeemer: Body = (c, L) => {
  const stone = ['#8E9A7E', '#B8C4A6', '#D6E0C6', '#E7EFD9', '#F4F8EC'];
  lit(c, '#A8ADB2', '#82888E', () => c.rect(-52, B - 62, 104, 62), 18); r(c, -50, B - 60, 100, 4, '#D1D5DB'); r(c, -50, B - 30, 100, 3, '#6B7280');
  // (the robe, flaring at the hem; its folds; the sash)
  lit(c, stone[3], stone[1], () => { c.moveTo(-42, B - 62); c.lineTo(-22, B - 302); c.lineTo(22, B - 302); c.lineTo(42, B - 62); c.closePath(); }, 6);
  c.strokeStyle = stone[0]; c.lineWidth = 2; for (const x of [-20, -6, 12, 26]) { c.beginPath(); c.moveTo(x * 1.3, B - 66); c.lineTo(x * 0.6, B - 290); c.stroke(); }
  c.lineWidth = 3; c.beginPath(); c.moveTo(-28, B - 200); c.lineTo(28, B - 188); c.stroke();
  // (the arms: straight out, or spinning; gone while they're hugging: those are the beams)
  if (!L.m?.b) {
    c.save(); c.translate(0, B - 292); c.rotate(L.m?.a ?? 0);
    fl(c, stone[3], () => { c.moveTo(-182, -13); c.lineTo(182, -13); c.lineTo(182, 11); c.lineTo(-182, 11); c.closePath(); });
    r(c, -180, 2, 360, 8, stone[1]); r(c, -180, -11, 360, 3, stone[4]);
    for (let x = -170; x < 175; x += 30) r(c, x, -10, 2, 20, stone[1]);
    for (const s of [-1, 1]) fl(c, stone[3], () => c.arc(s * 186, -1, 11, 0, Math.PI * 2), 1.4);
    c.restore();
  }
  lit(c, stone[3], stone[1], () => c.arc(0, B - 332, 25, 0, Math.PI * 2), 6);
  fl(c, stone[2], () => { c.moveTo(-25, B - 338); c.quadraticCurveTo(0, B - 372, 25, B - 338); c.quadraticCurveTo(0, B - 352, -25, B - 338); c.closePath(); }, 1.4);
  r(c, -3, B - 330, 4, 10, stone[1]);
};
const pisa: Body = (c, L) => {
  // (over on its pivot, the left base corner: leaning, or down)
  const lean = L.wreck ? PISA_DOWN : L.m?.lean ?? 0.07;
  c.save(); c.translate(-42, B); c.rotate(-lean); c.translate(42, -B);
  lit(c, '#F5F5F4', '#D6D3D1', () => c.rect(-42, B - 440, 84, 440), 14);
  // (the arcades: tiers of little arches on columns, each with its ledge)
  for (let y = B - 40; y > B - 400; y -= 52) {
    fl(c, '#E7E5E4', () => c.rect(-46, y, 92, 7), 1.4); r(c, -44, y + 1, 88, 2, '#FFFFFF');
    for (let x = -34; x < 40; x += 14) { fl(c, x > 12 ? '#57534E' : '#78716C', () => c.roundRect(x, y - 36, 8, 26, [4, 4, 0, 0]), 1); r(c, x - 2, y - 10, 12, 3, '#A8A29E'); }
  }
  lit(c, '#E7E5E4', '#C9C5C1', () => c.rect(-30, B - 478, 60, 38), 10);
  for (let x = -24; x < 30; x += 12) fl(c, '#57534E', () => c.roundRect(x, B - 472, 6, 22, [3, 3, 0, 0]), 1);
  fl(c, '#A8A29E', () => c.rect(-32, B - 482, 64, 6), 1.2);
  // (its eyes go over with it)
  { const e = eyesOf(L); if (e !== 'none') googly(c, 'pisa', L.m, !!L.wreck, L.f, e, L.m?.open ?? 1); }
  c.restore();
};
const taj: Body = (c, L) => {
  const marble = ['#94A3B8', '#CBD5E1', '#E2E8F0', '#F8FAFC'];
  lit(c, marble[3], marble[1], () => c.rect(-112, B - 122, 224, 122), 40);
  fl(c, '#334155', () => { c.moveTo(-28, B); c.lineTo(-28, B - 74); c.quadraticCurveTo(0, B - 106, 28, B - 74); c.lineTo(28, B); c.closePath(); });
  c.strokeStyle = '#CA8A04'; c.lineWidth = 2; c.beginPath(); c.moveTo(-34, B - 2); c.lineTo(-34, B - 78); c.quadraticCurveTo(0, B - 114, 34, B - 78); c.lineTo(34, B - 2); c.stroke();
  for (const x of [-84, 62]) for (const y of [B - 18, B - 70]) fl(c, '#475569', () => { c.moveTo(x, y); c.lineTo(x, y - 30); c.quadraticCurveTo(x + 11, y - 44, x + 22, y - 30); c.lineTo(x + 22, y); c.closePath(); }, 1.2);
  // (the onion dome on its drum, its finial; the two little domes)
  lit(c, marble[3], marble[1], () => c.rect(-58, B - 146, 116, 26), 20);
  lit(c, marble[3], marble[1], () => { c.moveTo(-72, B - 146); c.bezierCurveTo(-114, B - 222, -40, B - 268, 0, B - 296); c.bezierCurveTo(40, B - 268, 114, B - 222, 72, B - 146); c.closePath(); }, 18);
  r(c, -50, B - 220, 10, 50, '#FFFFFF');
  c.strokeStyle = '#CA8A04'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, B - 296); c.lineTo(0, B - 324); c.stroke();
  fl(c, '#EAB308', () => c.arc(0, B - 312, 4, 0, Math.PI * 2), 1);
  for (const x of [-88, 88]) { lit(c, marble[3], marble[1], () => c.arc(x, B - 122, 22, Math.PI, 0), x); r(c, x - 1, B - 152, 2, 8, '#CA8A04'); }
  // (the minarets, unless it's thrown them)
  if (!L.m?.b) for (const x of [-145, 145]) {
    lit(c, marble[3], marble[1], () => c.rect(x - 10, B - 250, 20, 250), x + 3);
    for (let y = B - 60; y > B - 240; y -= 60) fl(c, marble[2], () => c.rect(x - 14, y, 28, 5), 1.2);
    lit(c, marble[3], marble[1], () => c.arc(x, B - 252, 13, Math.PI, 0), x + 3);
  }
  r(c, -104, B - 4, 208, 6, '#38BDF8'); r(c, -100, B - 4, 80, 2, '#BAE6FD');
};
const bigben: Body = (c, L) => {
  const stone = ['#7C5A2A', '#A16207', '#C08A48', '#D6A35C', '#E8C48A'];
  lit(c, stone[3], stone[2], () => c.rect(-52, B - 382, 104, 382), 18);
  // (the gothic panels: tall pointed windows in rows, a ledge between)
  for (let y = B - 20; y > B - 280; y -= 32) {
    r(c, -50, y, 100, 3, stone[0]); r(c, -50, y - 2, 100, 2, stone[4]);
    for (const x of [-38, -14, 10, 30]) fl(c, x > 12 ? '#5B2A10' : '#7C2D12', () => { c.moveTo(x, y - 4); c.lineTo(x, y - 20); c.lineTo(x + 4, y - 26); c.lineTo(x + 8, y - 20); c.lineTo(x + 8, y - 4); c.closePath(); }, 1);
  }
  // (the clock: its gold rim, a face, the hands)
  fl(c, '#CA8A04', () => c.arc(0, B - 330, 44, 0, Math.PI * 2), 2.4);
  fl(c, '#FEF3C7', () => c.arc(0, B - 330, 38, 0, Math.PI * 2), 1.4);
  c.strokeStyle = INK; c.lineWidth = 2;
  for (let k = 0; k < 12; k++) { const a = (k * Math.PI) / 6; c.beginPath(); c.moveTo(Math.cos(a) * 31, B - 330 + Math.sin(a) * 31); c.lineTo(Math.cos(a) * 36, B - 330 + Math.sin(a) * 36); c.stroke(); }
  const t = L.f * 0.01;
  c.lineWidth = 4; c.beginPath(); c.moveTo(0, B - 330); c.lineTo(Math.cos(t) * 30, B - 330 + Math.sin(t) * 30); c.moveTo(0, B - 330); c.lineTo(Math.cos(t / 12 - 1) * 18, B - 330 + Math.sin(t / 12 - 1) * 18); c.stroke();
  // (the belfry, its arches; the green spire; gold finials)
  lit(c, stone[3], stone[2], () => c.rect(-42, B - 424, 84, 42), 14);
  for (const x of [-30, -8, 14]) fl(c, '#3F2A1C', () => c.roundRect(x, B - 418, 14, 28, [7, 7, 0, 0]), 1);
  lit(c, '#4D6B5A', '#36503F', () => { c.moveTo(-46, B - 424); c.lineTo(0, B - 478); c.lineTo(46, B - 424); c.closePath(); }, 0);
  for (const x of [-46, 46]) fl(c, '#CA8A04', () => c.rect(x - 3, B - 440, 6, 16), 1);
  fl(c, '#CA8A04', () => c.rect(-3, B - 498, 6, 22), 1.2);
};
const colosseum: Body = (c) => {
  const stone = ['#6B5238', '#8B6F4E', '#C8A47A', '#E7C9A0', '#F4DEBC'];
  const outline = () => { c.moveTo(-172, B); c.lineTo(-172, B - 202); c.quadraticCurveTo(-90, B - 232, 0, B - 227); c.lineTo(60, B - 224); c.lineTo(90, B - 182); c.lineTo(130, B - 192); c.lineTo(172, B - 142); c.lineTo(172, B); c.closePath(); };
  lit(c, stone[3], stone[2], outline, 70);
  // (three tiers of arches, dark inside, the ones in shadow darker; the attic's little windows)
  for (let row = 0; row < 3; row++) for (let k = 0; k < 9; k++) {
    const x = -160 + k * 36, y = B - 30 - row * 64;
    if (row === 2 && k > 6) continue;
    fl(c, x > 60 ? '#24180F' : '#3F2A1C', () => { c.moveTo(x, y); c.lineTo(x, y - 30); c.quadraticCurveTo(x + 11, y - 44, x + 22, y - 30); c.lineTo(x + 22, y); c.closePath(); }, 1);
    r(c, x + 23, y - 40, 6, 40, x > 60 ? stone[2] : stone[4]);
  }
  for (const y of [B - 4, B - 66, B - 130]) { r(c, -170, y, 342, 4, stone[1]); r(c, -170, y - 2, 342, 2, stone[4]); }
  for (let k = 0; k < 6; k++) r(c, -150 + k * 36, B - 206, 10, 8, stone[0]);
  // (rubble where it's broken off)
  for (const [x, y] of [[66, B - 220], [96, B - 186], [136, B - 196]]) fl(c, stone[2], () => c.rect(x, y, 10, 8), 1);
};
const pyramid: Body = (c) => {
  fl(c, '#FCD34D', () => { c.moveTo(-182, B); c.lineTo(0, B - 302); c.lineTo(182, B); c.closePath(); });
  c.fillStyle = '#D97706'; c.beginPath(); c.moveTo(0, B - 302); c.lineTo(182, B); c.lineTo(30, B); c.closePath(); c.fill();
  // (the courses: lines across, darker on the shadow face; a few blocks picked out)
  for (let y = B - 20; y > B - 290; y -= 20) {
    const w = (y - (B - 302)) * 0.6;
    c.strokeStyle = '#B45309'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-w, y); c.lineTo(w * 0.15, y); c.stroke();
    c.strokeStyle = '#92400E'; c.beginPath(); c.moveTo(w * 0.15, y); c.lineTo(w, y); c.stroke();
    for (let x = -w + 14 + ((y / 20) % 2) * 10; x < w * 0.1; x += 28) r(c, x, y - 18, 1.5, 18, '#D97706');
  }
  c.strokeStyle = '#FEF3C7'; c.lineWidth = 3; c.beginPath(); c.moveTo(-178, B - 2); c.lineTo(-2, B - 298); c.stroke();
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(-182, B); c.lineTo(0, B - 302); c.lineTo(182, B); c.closePath(); c.stroke();
  // (the gold capstone and its eye)
  fl(c, '#FDE68A', () => { c.moveTo(-24, B - 262); c.lineTo(0, B - 302); c.lineTo(24, B - 262); c.closePath(); }, 1.4);
  c.fillStyle = '#EAB308'; c.beginPath(); c.moveTo(0, B - 302); c.lineTo(24, B - 262); c.lineTo(6, B - 262); c.closePath(); c.fill();
  fl(c, '#FFFFFF', () => c.ellipse(0, B - 276, 9, 5, 0, 0, Math.PI * 2), 1.2);
  c.fillStyle = '#BE185D'; c.beginPath(); c.arc(0, B - 276, 3, 0, Math.PI * 2); c.fill();
};
const moai: Body = (c, L) => {
  const rise = (L.m?.k ?? 0) * 150, stone = '#6B6560', dark = '#4A4440', lt = '#8E8780', hi = '#A8A29E';
  // (THE BODY: risen up out of the ground, arms carved down its sides, hands on its belly)
  if (rise > 2) {
    lit(c, stone, dark, () => c.rect(-110, B - rise, 220, rise), 40);
    r(c, -100, B - rise + 10, 14, rise - 20, dark); r(c, 86, B - rise + 10, 14, rise - 20, dark);
    for (const s of [-1, 1]) fl(c, dark, () => c.roundRect(s * 40 - 22, B - rise * 0.45, 44, 14, 6), 1.2);
    fl(c, dark, () => c.arc(0, B - rise * 0.7, 5, 0, Math.PI * 2), 1);
  }
  c.save(); c.translate(0, -rise);
  // (the head: long, a heavy brow, the long nose, pursed lips, a jutting chin; the ears; its red topknot)
  lit(c, stone, dark, () => { c.moveTo(-80, B); c.lineTo(-80, B - 272); c.quadraticCurveTo(-80, B - 302, -50, B - 302); c.lineTo(60, B - 302); c.quadraticCurveTo(80, B - 302, 80, B - 272); c.lineTo(80, B); c.closePath(); }, 26);
  r(c, -78, B - 298, 16, 292, lt); r(c, -74, B - 296, 4, 280, hi);
  fl(c, dark, () => c.rect(-72, B - 242, 144, 18));
  lit(c, lt, stone, () => { c.moveTo(-14, B - 226); c.lineTo(-26, B - 128); c.lineTo(22, B - 128); c.lineTo(10, B - 226); c.closePath(); }, 0);
  fl(c, dark, () => c.rect(-36, B - 104, 72, 12));
  lit(c, stone, dark, () => c.rect(-46, B - 70, 92, 42), 20);
  for (const s of [-1, 1]) fl(c, dark, () => c.rect(s * 80 - (s > 0 ? 0 : 14), B - 222, 14, 132), 1.4);
  lit(c, '#9A3A2A', '#7A2A1E', () => c.roundRect(-56, B - 336, 112, 36, 10), 20);
  r(c, -50, B - 332, 70, 4, '#C0563E');
  c.restore();
};
const BODY: Record<MechId, Body> = { eiffel, opera, redeemer, pisa, taj, bigben, colosseum, pyramid, moai };

/** Its eyes by its look: none on a plain replica; open if it's awake and nothing says otherwise. */
export const eyesOf = (L: MechLook): 'none' | 'shut' | 'open' => L.eyes ?? (L.awake ? 'open' : 'none');

// ---------------------------------------------------------------------------------------------------------------
// The wrecks: painted once each to a canvas (blackened, over on their side), drawn scaled; their smoke live

const WRECKS = new Map<MechId, HTMLCanvasElement>();
const WOX = 760, WOY = 560, WW = 1100, WH = 640;
const wreckCanvas = (id: MechId) => {
  let w = WRECKS.get(id);
  if (w || typeof document === 'undefined') return w ?? null;
  w = document.createElement('canvas'); w.width = WW; w.height = WH;
  const g = w.getContext('2d')!;
  g.translate(WOX, WOY);
  g.filter = 'brightness(0.45) sepia(0.5)';
  const L: MechLook = { awake: true, f: 0, wreck: true };
  legsOf(g, L, 1);
  g.translate(-30, -10); g.rotate(-Math.PI / 2 + 0.15); g.translate(0, LEG);
  BODY[id](g, L);
  googly(g, id, undefined, true, 0);
  g.filter = 'none';
  WRECKS.set(id, w);
  return w;
};
/** A wreck's smoke: rolling up off it in puffs, each in steps (its underside dark, lit up its left), lit orange from
 *  under by the fire at its foot; embers in it. */
export const smoke = (c: Ctx, f: number) => {
  const disc = (x: number, y: number, rr: number, col: string) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rr, 0, Math.PI * 2); c.fill(); };
  for (let k = 0; k < 5; k++) {
    const ph = ((f * 0.6 + k * 40) % 200) / 200, x = -60 + k * 20 + Math.sin(ph * 6 + k) * 10 + ph * 30, y = -60 - ph * 220, rr = 14 + ph * 30;
    c.globalAlpha = (1 - ph) * 0.66;
    disc(x + rr * 0.18, y + rr * 0.2, rr, '#27272A');
    disc(x - rr * 0.06, y - rr * 0.06, rr * 0.84, k % 2 ? '#3F3F46' : '#52525B');
    disc(x - rr * 0.32, y - rr * 0.34, rr * 0.38, '#71717A');
    if (ph < 0.25) { c.globalAlpha = (0.25 - ph) * 2; disc(x + rr * 0.1, y + rr * 0.5, rr * 0.5, '#C2410C'); }
  }
  // (the fire at its foot, licking up)
  c.globalAlpha = 1;
  for (const [dx, w, h, col] of [[-50, 14, 26, '#B91C1C'], [-20, 18, 34, '#B91C1C'], [-34, 10, 22, '#F97316'], [-14, 10, 24, '#F97316'], [-22, 5, 12, '#FDE047']] as const) {
    const fl = 1 + Math.sin(f * 0.5 + dx) * 0.2;
    c.fillStyle = col; c.beginPath(); c.moveTo(dx - w, -24); c.quadraticCurveTo(dx - w * 0.3, -24 - h * 0.6 * fl, dx, -24 - h * fl); c.quadraticCurveTo(dx + w * 0.3, -24 - h * 0.6 * fl, dx + w, -24); c.closePath(); c.fill();
  }
  // (embers in it)
  for (let k = 0; k < 4; k++) { const ph = ((f * 1.3 + k * 70) % 120) / 120; c.globalAlpha = 1 - ph; r(c, -40 + k * 24 + Math.sin(f * 0.1 + k) * 6, -30 - ph * 130, 3, 3, ph < 0.5 ? '#FDE047' : '#F97316'); }
  c.globalAlpha = 1;
};

/** A landmark at (x, y) (its base), scale, turned rot. */
export const drawMech = (c: Ctx, id: MechId, x: number, y: number, scale: number, rot: number, L: MechLook) => {
  if (L.wreck && id !== 'pisa') {
    const w = wreckCanvas(id);
    c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(rot); c.scale(scale, scale);
    if (w) c.drawImage(w, -WOX, -WOY);
    smoke(c, L.f);
    c.restore();
    return;
  }
  c.save();
  const sh = L.shake ? (Math.sin(L.f * 2.7) * L.shake) : 0;
  c.translate(Math.round(x + sh * scale), Math.round(y)); c.rotate(rot); c.scale(scale, scale);
  // (sunk into the ground: what's under it isn't drawn)
  const sink = L.sink ?? 0;
  if (sink !== 0) { if (sink > 0) { c.beginPath(); c.rect(-1200, -2400, 2400, 2400); c.clip(); } c.translate(0, sink * 600); }
  if (L.wreck) c.filter = 'brightness(0.55) sepia(0.4)';
  const plinth = !!L.plinth || (!L.awake && L.legs === undefined);
  const u = plinth ? 1 : Math.max(0, Math.min(1, L.legs ?? 1));
  if (plinth) plinthOf(c); else legsOf(c, L, u);
  // (the body on top: lower while the legs are folded)
  c.translate(0, plinth ? 0 : LEG * 0.5 * (1 - u));
  BODY[id](c, L);
  const e = eyesOf(L);
  if (id !== 'pisa' && e !== 'none') googly(c, id, L.m, !!L.wreck, L.f, e, L.m?.open ?? 1);
  c.filter = 'none';
  if (L.flash) { c.globalAlpha = 0.35; c.globalCompositeOperation = 'lighter'; BODY[id](c, L); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; }
  if (L.wreck) smoke(c, L.f);
  c.restore();
};

/** How a landmark looks where it's got to (out on the circuit, or the one round in front). */
export const mechLook = (h: Heli, m: Mech | undefined, i: number, f: number): MechLook => {
  const ff = f + i * 37;
  if (!m) return { awake: false, f: ff, plinth: true, eyes: 'none' };
  if (m.st === 'dead') return { awake: true, f: ff, m, wreck: true };
  if (m.st === 'wait') return { awake: false, f: ff, m, plinth: true, eyes: h.turned ? 'shut' : 'none' };
  return { awake: true, f: ff, m, plinth: m.unfold < 0, legs: Math.max(0, m.unfold), eyes: m.open > 0 ? 'open' : 'shut', sink: m.sink, shake: m.shake, flash: m.flash > 0 };
};

// ---------------------------------------------------------------------------------------------------------------
// Their attacks

export const drawAttacks = (c: Ctx, state: GameState, h: Heli) => {
  const f = state.frame;
  // The Leaning Tower's landing zone, while it leans: the arc its top sweeps, where it'll lie (red, hatched)
  const pm = h.mechs[h.cur];
  if (pm?.id === 'pisa' && pm.st === 'fight' && pm.b >= 1 && pm.b < 3 && state.deathTimer <= 0) {
    const px = pisaPivot().x, py = pisaPivot().y, Lh = 440 + LEG + 36;
    c.save();
    c.globalAlpha = 0.2 + (f % 20 < 10 ? 0.1 : 0);
    c.fillStyle = '#DC2626'; c.beginPath(); c.moveTo(px, py); c.arc(px, py, Lh, -Math.PI / 2 - pm.lean, -Math.PI / 2 - PISA_DOWN, true); c.closePath(); c.fill();
    c.globalAlpha = 0.9; c.setLineDash([14, 10]); c.strokeStyle = '#FEE2E2'; c.lineWidth = 4;
    c.beginPath(); c.arc(px, py, Lh, -Math.PI / 2 - pm.lean, -Math.PI / 2 - PISA_DOWN, true); c.stroke();
    c.save(); c.translate(px, py); c.rotate(-PISA_DOWN); c.strokeStyle = '#EF4444'; c.lineWidth = 6; c.strokeRect(0, -Lh, 84, Lh); c.restore();
    c.setLineDash([]);
    c.restore();
  }
  for (const b of h.beams) {
    const ex = b.x + Math.cos(b.a) * b.len, ey = b.y + Math.sin(b.a) * b.len;
    if (b.t <= b.warn) {
      // (the warning: a dashed line, dark under it so it reads on anything, flashing; where it starts, a glow)
      c.save(); c.setLineDash([12, 8]);
      c.globalAlpha = 0.55; c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(ex, ey); c.stroke();
      c.globalAlpha = 0.5 + 0.5 * ((b.t >> 2) % 2); c.strokeStyle = b.src === 'm2:fl_redeemer_arms' ? '#FEE2E2' : b.col; c.lineWidth = 3; c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(ex, ey); c.stroke();
      c.setLineDash([]); c.globalAlpha = 0.6; c.fillStyle = b.col; c.beginPath(); c.arc(b.x, b.y, 8 + (b.t % 10), 0, Math.PI * 2); c.fill();
      // (a tracking beam's lock: solid and flashing white, the whole width it'll fire at, just before it does)
      if (b.track && b.t > b.warn - BEAM_LOCK) { c.globalAlpha = (b.t >> 1) % 2 ? 0.85 : 0.35; c.strokeStyle = '#FFFFFF'; c.lineWidth = b.w; c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(ex, ey); c.stroke(); }
      c.restore();
      if (b.src !== 'm2:fl_redeemer_arms') continue;
    }
    if (b.src === 'm2:fl_redeemer_arms') {
      // (the stone arm: its sleeve's folds hanging under, the lit top edge, the seams; the hand open at the end)
      c.save(); c.translate(b.x, b.y); c.rotate(b.a);
      const S = ['#6E7A6C', '#A2AE94', '#CCD8BC', '#E6EED6', '#F8FCEE'];
      fl(c, S[2], () => c.rect(0, -b.w / 2, b.len, b.w));
      r(c, 0, -b.w / 2 + 1, b.len, b.w * 0.3, S[3]); r(c, 0, -b.w / 2 + 1, b.len, 2, S[4]);
      r(c, 0, b.w * 0.15, b.len, b.w * 0.35 - 1, S[1]); checker(c, 0, b.w * 0.15 - 2, b.len, 2, S[1], 0, 1);
      for (let x = 24; x < b.len - 10; x += 34) { r(c, x, -b.w / 2 + 2, 1, b.w - 4, S[0]); r(c, x + 1, -b.w / 2 + 2, 1, b.w * 0.4, S[4]); }
      fl(c, S[2], () => c.arc(b.len + 6, 0, b.w / 2 + 2, 0, Math.PI * 2));
      r(c, b.len + 1, -b.w / 2 + 1, 6, 3, S[4]);
      for (const dy of [-0.3, 0, 0.3]) fl(c, S[3], () => c.roundRect(b.len + 10, dy * b.w - 3, 12, 6, 3), 1.2);
      c.restore(); continue;
    }
    if (b.src === 'm2:fl_bigben_hand') {
      // (the clock hand: black iron, a lit edge, its fretwork, the gilded spade at its tip and the boss it turns on)
      c.save(); c.translate(b.x, b.y); c.rotate(b.a);
      fl(c, '#1C1917', () => { c.moveTo(0, -b.w / 2); c.lineTo(b.len - 30, -b.w / 4); c.lineTo(b.len, 0); c.lineTo(b.len - 30, b.w / 4); c.lineTo(0, b.w / 2); c.closePath(); }, 1.2);
      r(c, 0, -b.w / 2 + 2, b.len - 40, 2, '#78716C'); r(c, 0, b.w / 2 - 4, b.len - 40, 2, '#0C0A09');
      for (let x = 30; x < b.len - 60; x += 46) { c.strokeStyle = '#44403C'; c.lineWidth = 2; c.beginPath(); c.arc(x, 0, Math.max(3, b.w * 0.25), 0, Math.PI * 2); c.stroke(); }
      fl(c, '#CA8A04', () => { c.moveTo(b.len - 34, 0); c.lineTo(b.len - 18, -b.w * 0.4); c.lineTo(b.len, 0); c.lineTo(b.len - 18, b.w * 0.4); c.closePath(); }, 1.2);
      r(c, b.len - 26, -b.w * 0.2, 8, 2, '#FDE68A');
      fl(c, '#CA8A04', () => c.arc(0, 0, 8, 0, Math.PI * 2), 1.4); fl(c, '#EAB308', () => c.arc(-1.5, -1.5, 4.5, 0, Math.PI * 2), 0); r(c, -3, -4, 2, 2, '#FEF3C7');
      c.restore(); continue;
    }
    // (a beam: a dithered glow round it, banded in from its dark edge to the white-hot core, the bands' seams dithered,
    // a flare where it starts and a splash of light where it ends)
    const w = b.w + (f % 4) * 2, len = b.len, dk = mixC(b.col, INK, 0.45), lt = mixC(b.col, '#FFFFFF', 0.5);
    c.save(); c.translate(b.x, b.y); c.rotate(b.a);
    c.globalAlpha = 0.22; r(c, 0, -w / 2 - 12, len, w + 24, b.col); c.globalAlpha = 0.4; checker(c, 0, -w / 2 - 8, len, 6, b.col, f & 1, 2); checker(c, 0, w / 2 + 2, len, 6, b.col, f & 1, 2); c.globalAlpha = 1;
    r(c, 0, -w / 2 - 2, len, w + 4, INK);
    r(c, 0, -w / 2, len, w, dk);
    r(c, 0, -w / 2 + 2, len, w - 4, b.col); checker(c, 0, -w / 2 + 2, len, 2, dk, 0, 1);
    r(c, 0, -w / 4, len, w / 2, lt); checker(c, 0, -w / 4 - 2, len, 2, lt, 1, 1);
    r(c, 0, -w / 8, len, Math.max(2, w / 4), '#FFFFFF');
    // (the light running down it)
    for (let x = (f * 9) % 60; x < len; x += 60) r(c, x, -w / 8, 14, Math.max(2, w / 4), '#FFFBEB');
    c.fillStyle = dk; c.beginPath(); c.arc(0, 0, w * 0.95, 0, Math.PI * 2); c.fill();
    c.fillStyle = b.col; c.beginPath(); c.arc(0, 0, w * 0.75, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(0, 0, w * 0.4, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.5; c.fillStyle = lt; c.beginPath(); c.arc(len, 0, w * (0.9 + (f % 3) * 0.15), 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    c.restore();
  }
  for (const d of h.drops) {
    const gy = groundY(d.x);
    if (d.t <= d.warn) {
      c.save(); c.globalAlpha = 0.2 + 0.16 * ((d.t >> 2) % 2); r(c, d.x - d.w / 2, CY, d.w, gy - CY, '#EF4444'); c.globalAlpha = 0.9;
      c.strokeStyle = '#FEE2E2'; c.lineWidth = 3; c.setLineDash([10, 8]); c.strokeRect(d.x - d.w / 2, CY, d.w, gy - CY); c.setLineDash([]);
      c.font = '24px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = INK; c.fillText('!', d.x + 2, CY + 182 + (d.t % 20 < 10 ? 0 : 6)); c.fillStyle = '#FEE2E2'; c.fillText('!', d.x, CY + 180 + (d.t % 20 < 10 ? 0 : 6)); c.textAlign = 'left';
      c.restore(); continue;
    }
    if (d.kind === 'minaret') {
      // (the minaret, thrown: marble in steps (lit left, shaded right, dithered between), its balconies on their
      // corbels, the arched windows up it, the cap and its gold finial (it's coming down cap first))
      const M = ['#7A869E', '#B4C0D2', '#DCE2EC', '#F4F6FA', '#FFFFFF'];
      fl(c, M[2], () => c.rect(d.x - 12, d.y, 24, 240));
      r(c, d.x - 11, d.y, 6, 240, M[3]); r(c, d.x - 11, d.y, 2, 240, M[4]); r(c, d.x + 5, d.y, 6, 240, M[1]); checker(c, d.x + 2, d.y, 3, 240, M[1], 0, 1);
      for (let y = d.y + 40; y < d.y + 230; y += 60) { fl(c, M[3], () => c.rect(d.x - 16, y, 32, 5), 1.2); r(c, d.x - 15, y + 5, 30, 2, M[0]); for (const x of [-12, -4, 4]) r(c, d.x + x, y + 7, 3, 3, M[1]); }
      for (let y = d.y + 66; y < d.y + 230; y += 60) { fl(c, '#475569', () => { c.moveTo(d.x - 3, y + 14); c.lineTo(d.x - 3, y + 4); c.quadraticCurveTo(d.x, y, d.x + 3, y + 4); c.lineTo(d.x + 3, y + 14); c.closePath(); }, 1); }
      fl(c, M[3], () => c.arc(d.x, d.y + 240, 13, 0, Math.PI)); r(c, d.x - 9, d.y + 242, 6, 3, M[4]);
      fl(c, '#CA8A04', () => c.rect(d.x - 2, d.y + 252, 4, 12), 1); r(c, d.x - 1, d.y + 253, 1, 10, '#FDE68A');
    } else if (d.kind === 'thumb') {
      // (a giant stone fist, thumb down: travertine in steps, the knuckles and the creases between the fingers, the
      // thumbnail, chips knocked off it)
      const T = ['#5A4034', '#86684A', '#C0A078', '#E2C49C', '#F6E0BE'];
      lit(c, T[3], T[2], () => c.roundRect(d.x - 48, d.y - 200, 96, 130, 14), d.x + 16);
      r(c, d.x - 44, d.y - 196, 10, 120, T[4]); checker(c, d.x + 12, d.y - 196, 6, 124, T[2], 0, 1);
      for (let k = 0; k < 3; k++) { r(c, d.x - 40, d.y - 172 + k * 30, 70, 3, T[1]); r(c, d.x - 40, d.y - 169 + k * 30, 70, 1, T[4]); }
      for (let k = 0; k < 4; k++) fl(c, T[3], () => c.roundRect(d.x - 46 + k * 23, d.y - 92, 21, 18, 8), 1.2);
      lit(c, T[3], T[2], () => c.roundRect(d.x - 18, d.y - 80, 36, 80, 14), d.x + 6);
      r(c, d.x - 14, d.y - 76, 6, 66, T[4]);
      fl(c, '#F5E6CF', () => c.roundRect(d.x - 10, d.y - 14, 20, 12, 4), 1.2); r(c, d.x - 7, d.y - 12, 8, 2, '#FFFFFF');
      for (const [x, y] of [[-30, -150], [20, -120], [34, -184]]) r(c, d.x + x, d.y + y, 4, 3, T[0]);
    } else {
      // (a boulder: lumpy, its facets lit up its left, a crack, lichen)
      const R2 = ['#26242A', '#423E40', '#645C58', '#867C74', '#AAA096'];
      fl(c, R2[2], () => { for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2, rr = 22 * (0.86 + ((k * 37) % 5) * 0.05); c[k ? 'lineTo' : 'moveTo'](d.x + Math.cos(a) * rr, d.y + 22 + Math.sin(a) * rr); } c.closePath(); });
      c.fillStyle = R2[1]; c.beginPath(); c.moveTo(d.x + 4, d.y + 4); c.lineTo(d.x + 21, d.y + 18); c.lineTo(d.x + 16, d.y + 38); c.lineTo(d.x - 4, d.y + 42); c.closePath(); c.fill();
      c.fillStyle = R2[3]; c.beginPath(); c.moveTo(d.x - 18, d.y + 10); c.lineTo(d.x - 2, d.y + 3); c.lineTo(d.x - 6, d.y + 18); c.lineTo(d.x - 20, d.y + 24); c.closePath(); c.fill();
      r(c, d.x - 14, d.y + 8, 6, 3, R2[4]); r(c, d.x + 2, d.y + 26, 1, 10, R2[0]); r(c, d.x + 6, d.y + 34, 5, 3, '#6A7A4A');
    }
  }
  for (const n of h.minions) drawMinion(c, n.kind, n.x, n.y, n.r, n.t, n.flash > 0, n.vx);
  drawShots(c, h, f);
};

/** Their shots, drawn over the engine's own: each on a dark halo with a flashing rim (it reads over the park and the
 *  landmarks, whatever's behind it), then its own shape a size up. */
const drawShots = (c: Ctx, h: Heli, f: number) => {
  for (const [q, s] of h.shots) {
    const x = Math.round(q.pos.x + q.width / 2), y = Math.round(q.pos.y + q.height / 2), rr = s.r * 1.25;
    c.globalAlpha = 0.5; c.fillStyle = INK; c.beginPath(); c.arc(x, y, rr + 6, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    c.strokeStyle = (f >> 2) % 2 ? '#FFFFFF' : s.col === '#F8FAFC' ? '#F87171' : s.col; c.lineWidth = 2.5; c.beginPath(); c.arc(x, y, rr + 4, 0, Math.PI * 2); c.stroke();
    const R = rampOf(s.col);
    switch (s.shape) {
      case 'rivet': {
        // (a rivet head, hex-sided: its dark side, the lit facets up its left, the dimple, a glint)
        const hex = (rad: number, dx: number, dy: number) => { for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 3 + s.t * 0.2; c[k ? 'lineTo' : 'moveTo'](x + dx + Math.cos(a) * rad, y + dy + Math.sin(a) * rad); } c.closePath(); };
        fl(c, R[1], () => hex(rr, 0, 0), 1.6);
        c.fillStyle = R[2]; c.beginPath(); hex(rr * 0.78, -rr * 0.08, -rr * 0.08); c.fill();
        c.fillStyle = R[3]; c.beginPath(); hex(rr * 0.42, -rr * 0.26, -rr * 0.26); c.fill();
        disc(c, x + 1, y + 1, rr * 0.22, R[0]); r(c, x - rr * 0.5, y - rr * 0.55, 2, 2, '#FDE68A');
        break;
      }
      case 'note': {
        // (an eighth note: the head in steps, tilted, its stem and its flag)
        fl(c, R[1], () => c.ellipse(x - 2, y + 3, rr * 0.75, rr * 0.55, -0.4, 0, Math.PI * 2), 1.6);
        c.fillStyle = R[2]; c.beginPath(); c.ellipse(x - 3, y + 2, rr * 0.55, rr * 0.36, -0.4, 0, Math.PI * 2); c.fill();
        r(c, x - rr * 0.5, y + 1, 3, 2, R[4]);
        c.strokeStyle = INK; c.lineWidth = 3.4; c.beginPath(); c.moveTo(x + 4, y + 2); c.lineTo(x + 4, y - 14); c.lineTo(x + 11, y - 9); c.stroke();
        c.strokeStyle = R[3]; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x + 4, y + 1); c.lineTo(x + 4, y - 13); c.lineTo(x + 10, y - 9); c.stroke();
        break;
      }
      case 'marble': {
        // (a marble: the glass in steps, the colored twist inside it, the shine)
        fl(c, '#C8D4E0', () => c.arc(x, y, rr, 0, Math.PI * 2), 1.8);
        disc(c, x - rr * 0.08, y - rr * 0.08, rr * 0.84, '#F4F8FC');
        c.fillStyle = '#38BDF8'; c.beginPath(); c.ellipse(x + 1, y + 1, rr * 0.62, rr * 0.22, s.t * 0.15, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#0369A1'; c.beginPath(); c.ellipse(x + 2, y + 2, rr * 0.4, rr * 0.12, s.t * 0.15, 0, Math.PI * 2); c.fill();
        r(c, x - rr * 0.5, y - rr * 0.55, 3, 3, '#FFFFFF'); r(c, x - rr * 0.2, y - rr * 0.65, 2, 1, '#FFFFFF');
        break;
      }
      case 'gear': {
        // (a gear: its teeth, the rim a step dark, the face lit up its left, spokes, the hub)
        const gear = (rad: number) => { for (let k = 0; k < 16; k++) { const a = (k * Math.PI) / 8 + s.t * 0.15, Rr = k % 2 ? rad : rad * 0.7; c[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * Rr, y + Math.sin(a) * Rr); } c.closePath(); };
        fl(c, R[1], () => gear(rr), 1.4);
        disc(c, x - 0.5, y - 0.5, rr * 0.62, R[2]); disc(c, x - rr * 0.2, y - rr * 0.2, rr * 0.3, R[3]);
        c.strokeStyle = R[0]; c.lineWidth = 1.5; c.beginPath(); for (let k = 0; k < 3; k++) { const a = s.t * 0.15 + (k * Math.PI * 2) / 3; c.moveTo(x, y); c.lineTo(x + Math.cos(a) * rr * 0.6, y + Math.sin(a) * rr * 0.6); } c.stroke();
        fl(c, INK, () => c.arc(x, y, 2.5, 0, Math.PI * 2), 0); r(c, x - rr * 0.5, y - rr * 0.5, 2, 2, R[4]);
        break;
      }
      case 'cup': {
        // (a china teacup: white in steps, the gold rim, a blue band, the tea in it, the handle; tumbling)
        c.save(); c.translate(x, y); c.rotate(Math.sin(s.t * 0.2) * 0.4);
        fl(c, '#E2E8F0', () => { c.moveTo(-9, -6); c.lineTo(9, -6); c.lineTo(6, 7); c.lineTo(-6, 7); c.closePath(); }, 1.6);
        c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(-8, -5); c.lineTo(-1, -5); c.lineTo(-2, 6); c.lineTo(-5, 6); c.closePath(); c.fill();
        r(c, -8, 0, 16, 2, '#2563EB'); r(c, -9, -7, 18, 2, '#CA8A04'); r(c, -7, -5, 14, 2, '#92400E');
        c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.arc(10, 0, 4, -1.2, 1.2); c.stroke(); c.strokeStyle = '#F8FAFC'; c.lineWidth = 1.4; c.stroke();
        c.restore();
        break;
      }
      case 'block': {
        // (a two-ton block: its front in steps, the top lit, the shaded side, its tool marks)
        fl(c, R[2], () => c.rect(x - rr, y - rr * 0.7, rr * 2, rr * 1.4), 1.8);
        r(c, x - rr + 1, y - rr * 0.7 + 1, rr * 2 - 2, 3, R[4]); r(c, x - rr + 1, y - rr * 0.7 + 4, 3, rr * 1.4 - 5, R[3]);
        r(c, x + rr * 0.35, y - rr * 0.7 + 4, rr * 0.65 - 1, rr * 1.4 - 5, R[1]); checker(c, x + rr * 0.2, y - rr * 0.7 + 4, 3, rr * 1.4 - 5, R[1], 0, 1);
        r(c, x - rr * 0.5, y - 2, rr * 0.6, 1, R[1]); r(c, x - rr * 0.2, y + rr * 0.3, rr * 0.4, 1, R[1]);
        break;
      }
      case 'rock': {
        // (a rock: lumpy, its facets in steps, lit up its left, a crack)
        const lump = (rad: number) => { for (let k = 0; k < 7; k++) { const a = k * 0.9 + s.t * 0.05, Rr = rad * (0.8 + ((k * 37) % 5) * 0.06); c[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * Rr, y + Math.sin(a) * Rr); } c.closePath(); };
        fl(c, R[1], () => lump(rr), 1.8);
        c.fillStyle = R[2]; c.beginPath(); lump(rr * 0.72); c.fill();
        disc(c, x - rr * 0.32, y - rr * 0.32, rr * 0.3, R[3]); r(c, x - rr * 0.5, y - rr * 0.5, 2, 2, R[4]);
        r(c, x + rr * 0.1, y, 1, rr * 0.5, R[0]);
        break;
      }
      default: {
        // (an orb: banded in from its dark rim, a hot core, the shine)
        fl(c, R[1], () => c.arc(x, y, rr, 0, Math.PI * 2), 1.8);
        disc(c, x - rr * 0.1, y - rr * 0.1, rr * 0.78, s.col); disc(c, x - rr * 0.2, y - rr * 0.2, rr * 0.5, R[4]); disc(c, x - rr * 0.22, y - rr * 0.22, rr * 0.26, '#FFFFFF');
      }
    }
  }
};

/** A minion (world): a size up, outlined. */
export const drawMinion = (c: Ctx, kind: string, x: number, y: number, rr: number, t: number, flash: boolean, vx: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(1.2, 1.2);
  if (flash) c.filter = 'brightness(2)';
  switch (kind) {
    case 'keychain': {
      // (a gold keychain Eiffel: its legs and arch, the lattice scratched on it, the lit edge, its ring and the chain's
      // links; a googly eye)
      c.rotate(Math.sin(t * 0.2) * 0.5);
      const G = ['#5E3410', '#9A5E0A', '#CA8A04', '#EAB308', '#FDE68A'];
      fl(c, G[2], () => { c.moveTo(0, -16); c.lineTo(10, 14); c.lineTo(4, 14); c.lineTo(0, 6); c.lineTo(-4, 14); c.lineTo(-10, 14); c.closePath(); });
      c.fillStyle = G[3]; c.beginPath(); c.moveTo(0, -15); c.lineTo(-9, 13); c.lineTo(-5, 13); c.lineTo(0, 4); c.closePath(); c.fill();
      c.fillStyle = G[1]; c.beginPath(); c.moveTo(1, -12); c.lineTo(9, 13); c.lineTo(6, 13); c.closePath(); c.fill();
      r(c, -6, 2, 12, 2, G[1]); r(c, -3, -6, 6, 1, G[1]); r(c, -2, -13, 1, 6, G[4]);
      c.strokeStyle = INK; c.lineWidth = 3.4; c.beginPath(); c.arc(0, -20, 4, 0, Math.PI * 2); c.stroke(); c.strokeStyle = G[3]; c.lineWidth = 1.6; c.stroke();
      for (let k = 0; k < 2; k++) { c.strokeStyle = G[2]; c.lineWidth = 1.4; c.beginPath(); c.ellipse(0, -27 - k * 5, 1.6, 2.6, 0, 0, Math.PI * 2); c.stroke(); }
      googlySmall(c, 0, -2, 4);
      break;
    }
    case 'gull': {
      // (a seagull: white in steps, the gray back and wings beating (black tips), the yellow beak and its red spot, the
      // feet tucked; a googly eye)
      const w = Math.sin(t * 0.5) * 10;
      fl(c, '#9CA3AF', () => { c.moveTo(6, -2); c.lineTo(16, 6 + w * 0.6); c.lineTo(2, 3); c.closePath(); }, 1.2);
      fl(c, '#E5E7EB', () => c.ellipse(0, 0, 12, 7, 0, 0, Math.PI * 2));
      c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(-2, -2, 9, 4, 0, 0, Math.PI * 2); c.fill();
      r(c, -4, 3, 12, 2, '#C8CCD4'); r(c, 9, -1, 6, 3, '#F8FAFC');
      fl(c, '#9CA3AF', () => { c.moveTo(-4, -2); c.lineTo(-14, -10 - w); c.lineTo(4, -4); c.closePath(); }, 1.2);
      c.fillStyle = '#C8CCD4'; c.beginPath(); c.moveTo(-3, -3); c.lineTo(-11, -9 - w * 0.9); c.lineTo(1, -4); c.closePath(); c.fill();
      c.fillStyle = INK; c.beginPath(); c.moveTo(-14, -10 - w); c.lineTo(-11, -7 - w * 0.8); c.lineTo(-10, -9 - w * 0.9); c.closePath(); c.fill();
      fl(c, '#FACC15', () => { c.moveTo(-12, -1); c.lineTo(-19, 1); c.lineTo(-12, 3); c.closePath(); }, 1);
      r(c, -16, 1, 2, 1, '#DC2626'); r(c, 0, 6, 2, 3, '#FB923C'); r(c, 4, 6, 2, 3, '#FB923C');
      googlySmall(c, -7, -3, 3);
      break;
    }
    case 'gear': {
      // (a brass gear spinning: the teeth, the rim and face in steps, spokes with holes between, the hub's axle)
      c.rotate(t * 0.1);
      const B2 = ['#4A2A08', '#7A4A0A', '#A16207', '#CA8A04', '#FDE68A'];
      fl(c, B2[2], () => { for (let k = 0; k < 20; k++) { const a = (k * Math.PI) / 10, Rr = k % 2 ? rr : rr * 0.75; c[k ? 'lineTo' : 'moveTo'](Math.cos(a) * Rr, Math.sin(a) * Rr); } c.closePath(); });
      disc(c, -0.5, -0.5, rr * 0.66, B2[3]); disc(c, 0, 0, rr * 0.52, B2[2]);
      for (let k = 0; k < 4; k++) { const a = (k * Math.PI) / 2 + Math.PI / 4; disc(c, Math.cos(a) * rr * 0.38, Math.sin(a) * rr * 0.38, rr * 0.12, B2[0]); }
      fl(c, '#713F12', () => c.arc(0, 0, 4, 0, Math.PI * 2), 1); r(c, -1, -1, 2, 2, B2[4]);
      c.strokeStyle = B2[4]; c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, rr * 0.6, Math.PI * 1.1, Math.PI * 1.5); c.stroke();
      break;
    }
    case 'lion': {
      // (a lion leaping: the body in steps, the mane in tufts round its head, the muzzle, a paw out, the tail and its
      // tuft; teeth bared, a googly eye)
      if (vx > 0) c.scale(-1, 1);
      const leg = Math.sin(t * 0.4) * 3;
      fl(c, '#B45309', () => { c.moveTo(16, 2); c.quadraticCurveTo(26, -6, 28, -14 + leg); c.lineTo(30, -13 + leg); c.quadraticCurveTo(28, -2, 18, 6); c.closePath(); }, 1);
      fl(c, '#78350F', () => c.arc(29, -15 + leg, 3, 0, Math.PI * 2), 1);
      fl(c, '#D97706', () => { c.moveTo(12, 6); c.lineTo(20, 12 + leg); c.lineTo(15, 13 + leg); c.lineTo(8, 8); c.closePath(); }, 1);
      fl(c, '#F59E0B', () => c.ellipse(4, 2, 16, 9, 0, 0, Math.PI * 2));
      c.fillStyle = '#FCD34D'; c.beginPath(); c.ellipse(2, -1, 11, 4, 0, 0, Math.PI * 2); c.fill(); r(c, -6, 6, 20, 3, '#D97706');
      for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2, mx = -8 + Math.cos(a) * 12, my = -4 + Math.sin(a) * 12; fl(c, k % 2 ? '#92400E' : '#B45309', () => c.arc(mx, my, 5, 0, Math.PI * 2), 1); }
      disc(c, -8, -4, 10, '#B45309'); disc(c, -10, -6, 6, '#C2410C');
      fl(c, '#F59E0B', () => c.arc(-10, -4, 8, 0, Math.PI * 2), 1.2); disc(c, -12, -6, 4, '#FCD34D');
      fl(c, '#FDE68A', () => c.ellipse(-16, -1, 4, 3, 0, 0, Math.PI * 2), 1);
      r(c, -19, -3, 3, 2, INK); r(c, -18, 1, 4, 1, '#FFFFFF'); r(c, -17, 2, 3, 1, '#7F1D1D');
      fl(c, '#D97706', () => { c.moveTo(-6, 6); c.lineTo(-14, 12 - leg); c.lineTo(-10, 13 - leg); c.lineTo(-2, 8); c.closePath(); }, 1);
      googlySmall(c, -12, -7, 3);
      break;
    }
    case 'scarab': {
      // (a scarab: the shell iridescent in bands (green to blue, the lit stripe), its split down the middle, the head and
      // its horns, legs scrabbling)
      for (const s of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(-4, s * 6); c.lineTo(-8 + Math.sin(t) * 2, s * 10); c.moveTo(0, s * 6); c.lineTo(-1 + Math.cos(t) * 2, s * 11); c.moveTo(4, s * 6); c.lineTo(8, s * 10); c.stroke(); }
      fl(c, '#0F3A24', () => c.ellipse(0, 0, 10, 7, 0, 0, Math.PI * 2));
      c.fillStyle = '#166534'; c.beginPath(); c.ellipse(0, -1, 8.5, 5.5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#0E7490'; c.beginPath(); c.ellipse(1, -2, 6, 3.5, 0, 0, Math.PI * 2); c.fill();
      r(c, -6, -4, 8, 1, '#84CC16'); r(c, -4, -3, 4, 1, '#D9F99D'); r(c, -1, -6, 2, 12, '#052E16');
      fl(c, '#14532D', () => c.ellipse(-11, 0, 3.5, 3, 0, 0, Math.PI * 2), 1); r(c, -16, -2, 3, 1, INK); r(c, -16, 1, 3, 1, INK);
      break;
    }
    case 'head': {
      // (a little moai: tuff in steps, the heavy brow, the long nose, the pursed lips, the red topknot; googly eyes)
      const M2 = ['#2A2830', '#3E3A3E', '#5E5854', '#847C74', '#A8A096'];
      fl(c, M2[2], () => c.roundRect(-14, -20, 28, 40, 6));
      r(c, -12, -18, 7, 36, M2[3]); r(c, -12, -18, 2, 36, M2[4]); r(c, 6, -18, 6, 36, M2[1]); checker(c, 3, -18, 3, 36, M2[1], 0, 1);
      fl(c, M2[1], () => c.rect(-13, -11, 26, 4), 1);
      fl(c, M2[3], () => { c.moveTo(-2, -7); c.lineTo(-5, 7); c.lineTo(5, 7); c.lineTo(2, -7); c.closePath(); }, 1);
      r(c, -6, 10, 12, 2, M2[0]); r(c, -6, 14, 12, 3, M2[1]);
      fl(c, '#9A3A2A', () => c.roundRect(-11, -26, 22, 7, 3), 1); r(c, -9, -25, 10, 2, '#C25A40');
      googlySmall(c, -5, -14, 4); googlySmall(c, 6, -14, 4);
      break;
    }
  }
  c.restore();
};
/** A small googly eye: the white in two steps, the loose pupil, a glint. */
const googlySmall = (c: Ctx, x: number, y: number, rr: number) => {
  fl(c, '#D4D8E0', () => c.arc(x, y, rr, 0, Math.PI * 2), 1.2);
  disc(c, x - rr * 0.12, y - rr * 0.12, rr * 0.78, '#FFFFFF');
  c.fillStyle = INK; c.beginPath(); c.arc(x - rr * 0.3, y + rr * 0.2, rr * 0.5, 0, Math.PI * 2); c.fill();
  if (rr >= 3) r(c, x - rr * 0.45, y - rr * 0.05, 1, 1, '#FFFFFF');
};

// ---------------------------------------------------------------------------------------------------------------
// Blasts (his rockets, a landmark going up a piece at a time): a white flash, then banded fire (no smooth gradient),
// a shock ring going out, chunks thrown, the smoke left rolling up

const hb = (n: number) => { const x = Math.sin(n * 91.7) * 43758.5; return x - Math.floor(x); };
export const drawBoom = (c: Ctx, b: Boom) => {
  const life = b.big ? 40 : 24, n = b.t / life, seed = Math.floor(b.x * 7 + b.y * 13);
  // (the flash, the first frames)
  if (b.t < 3) { c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(b.x, b.y, b.r * (0.7 + b.t * 0.15), 0, Math.PI * 2); c.fill(); return; }
  // (the shock ring)
  if (n < 0.5) { c.globalAlpha = 1 - n * 2; c.strokeStyle = '#FEF3C7'; c.lineWidth = 3; c.beginPath(); c.arc(b.x, b.y, b.r * (0.5 + n * 2.2), 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1; }
  // (the fireball, banded, burning out from the middle into smoke; each band's edge dithered into the one outside it
  // (a checker of it a step further out); the smoke's lumps shaded under, lit up their left)
  const rad = b.r * (0.45 + n * 0.75), fire = Math.max(0, 1 - n * 1.4);
  const bands: [number, string][] = [[1, n > 0.6 ? '#3F3F46' : '#57534E'], [0.86 * fire + 0.08, '#B91C1C'], [0.72 * fire, '#EA580C'], [0.55 * fire, '#F97316'], [0.38 * fire, '#FDE047'], [0.18 * fire, '#FFFFFF']];
  const lumps = (k: number, dy = 0) => { c.beginPath(); for (let p = 0; p < 7; p++) { const a = (p / 7) * Math.PI * 2 + seed, pr = rad * k * (0.55 + hb(seed + p) * 0.2), px = b.x + Math.cos(a) * rad * k * 0.45, py = b.y + Math.sin(a) * rad * k * 0.45 - n * 10 + dy; c.moveTo(px + pr, py); c.arc(px, py, pr, 0, Math.PI * 2); } };
  // (the smoke's shadow side, under it)
  c.fillStyle = '#27272A'; lumps(1, rad * 0.08); c.fill();
  bands.forEach(([k, col], i) => {
    if (rad * k < 1) return;
    if (i > 0 && rad * k > 4) { c.save(); lumps(k * 1.1); c.clip(); checker(c, b.x - rad * k * 1.2, b.y - rad * k * 1.3 - n * 10, rad * k * 2.4, rad * k * 2.6, col, 0, 2); c.restore(); }
    c.fillStyle = col; lumps(k); c.fill();
    if (i === 0) { c.fillStyle = n > 0.6 ? '#52525B' : '#71717A'; c.beginPath(); c.arc(b.x - rad * 0.35, b.y - rad * 0.4 - n * 10, rad * 0.3, 0, Math.PI * 2); c.fill(); }
  });
  // (chunks thrown out, falling, each lit on top, glowing at first; sparks)
  const chunks = b.big ? 10 : 6;
  for (let p = 0; p < chunks; p++) {
    const a = hb(seed + p * 3) * Math.PI * 2, sp = b.r * (0.04 + hb(seed + p * 5) * 0.05), t = b.t;
    const cx = b.x + Math.cos(a) * sp * t, cy = b.y + Math.sin(a) * sp * t + 0.12 * t * t;
    r(c, cx - 3, cy - 3, 6, 6, INK); r(c, cx - 2, cy - 2, 4, 4, p % 3 ? (n < 0.4 ? '#7C2D12' : '#44403C') : '#F97316'); r(c, cx - 2, cy - 2, 4, 1, p % 3 ? '#A8A29E' : '#FDE047');
  }
  if (n < 0.45) for (let p = 0; p < 8; p++) { const a = hb(seed + p * 7) * Math.PI * 2, d = b.r * (0.6 + n * 2.4) * (0.7 + hb(seed + p) * 0.4); r(c, b.x + Math.cos(a) * d - 1, b.y + Math.sin(a) * d - 1, 2, 2, p % 2 ? '#FDE047' : '#FFFFFF'); }
};
