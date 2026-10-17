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

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

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
export const smoke = (c: Ctx, f: number) => {
  for (let k = 0; k < 5; k++) {
    const ph = ((f * 0.6 + k * 40) % 200) / 200;
    c.globalAlpha = (1 - ph) * 0.6; c.fillStyle = k % 2 ? '#3F3F46' : '#52525B';
    c.beginPath(); c.arc(-60 + k * 20 + Math.sin(ph * 6 + k) * 10, -60 - ph * 220, 14 + ph * 30, 0, Math.PI * 2); c.fill();
  }
  // (embers in it)
  for (let k = 0; k < 3; k++) { const ph = ((f * 1.3 + k * 70) % 120) / 120; c.globalAlpha = 1 - ph; r(c, -40 + k * 30 + Math.sin(f * 0.1 + k) * 6, -30 - ph * 120, 3, 3, ph < 0.5 ? '#FDE047' : '#F97316'); }
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
  if (pm?.id === 'pisa' && pm.st === 'fight' && pm.b >= 1 && pm.b < 3) {
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
      c.save(); c.translate(b.x, b.y); c.rotate(b.a);
      fl(c, '#E7EFD9', () => c.rect(0, -b.w / 2, b.len, b.w)); r(c, 0, b.w / 4, b.len, b.w / 4, '#B8C4A6'); r(c, 0, -b.w / 2 + 2, b.len, 3, '#F4F8EC');
      fl(c, '#E7EFD9', () => c.arc(b.len + 6, 0, b.w / 2 + 2, 0, Math.PI * 2));
      c.restore(); continue;
    }
    if (b.src === 'm2:fl_bigben_hand') {
      c.save(); c.translate(b.x, b.y); c.rotate(b.a);
      fl(c, '#1C1917', () => { c.moveTo(0, -b.w / 2); c.lineTo(b.len - 30, -b.w / 4); c.lineTo(b.len, 0); c.lineTo(b.len - 30, b.w / 4); c.lineTo(0, b.w / 2); c.closePath(); }, 1.2);
      r(c, 0, -b.w / 2 + 2, b.len - 40, 2, '#78716C');
      fl(c, '#CA8A04', () => c.arc(0, 0, 8, 0, Math.PI * 2), 1.4);
      c.restore(); continue;
    }
    // (a beam: banded, a dark edge, a white-hot core)
    const w = b.w + (f % 4) * 2;
    c.save(); c.translate(b.x, b.y); c.rotate(b.a);
    c.globalAlpha = 0.3; r(c, 0, -w / 2 - 10, b.len, w + 20, b.col); c.globalAlpha = 1;
    r(c, 0, -w / 2 - 2, b.len, w + 4, INK);
    r(c, 0, -w / 2, b.len, w, b.col); r(c, 0, -w / 4, b.len, w / 2, '#FFFFFF');
    c.fillStyle = b.col; c.beginPath(); c.arc(0, 0, w * 0.8, 0, Math.PI * 2); c.fill();
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
    if (d.kind === 'minaret') { lit(c, '#F8FAFC', '#CBD5E1', () => c.rect(d.x - 12, d.y, 24, 240), d.x + 4); for (let y = d.y + 40; y < d.y + 230; y += 60) r(c, d.x - 15, y, 30, 4, '#94A3B8'); fl(c, '#F8FAFC', () => c.arc(d.x, d.y + 240, 13, 0, Math.PI)); }
    else if (d.kind === 'thumb') {
      // (a giant stone fist, thumb down)
      lit(c, '#E7C9A0', '#C8A47A', () => c.roundRect(d.x - 48, d.y - 200, 96, 130, 14), d.x + 16);
      lit(c, '#E7C9A0', '#C8A47A', () => c.roundRect(d.x - 18, d.y - 80, 36, 80, 14), d.x + 6);
      fl(c, '#F5E6CF', () => c.roundRect(d.x - 10, d.y - 14, 20, 12, 4), 1.2);
      for (let k = 0; k < 3; k++) r(c, d.x - 40, d.y - 180 + k * 30, 70, 3, '#8B6F4E');
    } else { lit(c, '#78716C', '#57534E', () => c.arc(d.x, d.y + 22, 22, 0, Math.PI * 2), d.x + 6); r(c, d.x - 12, d.y + 10, 8, 4, '#A8A29E'); }
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
    switch (s.shape) {
      case 'rivet': fl(c, s.col, () => { for (let k = 0; k < 6; k++) { const a = (k * Math.PI) / 3 + s.t * 0.2; c[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); }, 1.6); r(c, x - 2, y - 2, 3, 3, '#FDE68A'); break;
      case 'note': fl(c, s.col, () => c.ellipse(x - 2, y + 3, rr * 0.75, rr * 0.55, -0.4, 0, Math.PI * 2), 1.6); c.strokeStyle = INK; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x + 4, y + 2); c.lineTo(x + 4, y - 14); c.lineTo(x + 11, y - 9); c.stroke(); break;
      case 'marble': fl(c, '#F8FAFC', () => c.arc(x, y, rr, 0, Math.PI * 2), 1.8); fl(c, '#7DD3FC', () => c.arc(x + 2, y + 2, rr * 0.4, 0, Math.PI * 2), 0.8); r(c, x - 4, y - 4, 3, 3, '#FFFFFF'); break;
      case 'gear': fl(c, s.col, () => { for (let k = 0; k < 16; k++) { const a = (k * Math.PI) / 8 + s.t * 0.15, R = k % 2 ? rr : rr * 0.7; c[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * R, y + Math.sin(a) * R); } c.closePath(); }, 1.4); fl(c, INK, () => c.arc(x, y, 2.5, 0, Math.PI * 2), 0); break;
      case 'cup': fl(c, '#F8FAFC', () => { c.moveTo(x - 9, y - 6); c.lineTo(x + 9, y - 6); c.lineTo(x + 6, y + 7); c.lineTo(x - 6, y + 7); c.closePath(); }, 1.6); c.strokeStyle = INK; c.lineWidth = 1.8; c.beginPath(); c.arc(x + 10, y, 4, -1.2, 1.2); c.stroke(); r(c, x - 7, y - 4, 14, 2, '#92400E'); break;
      case 'block': fl(c, s.col, () => c.rect(x - rr, y - rr * 0.7, rr * 2, rr * 1.4), 1.8); r(c, x - rr + 2, y - rr * 0.7 + 2, rr * 2 - 4, 3, '#FDE68A'); r(c, x + rr * 0.3, y - rr * 0.7 + 2, rr * 0.6, rr * 1.4 - 4, '#B45309'); break;
      case 'rock': fl(c, s.col, () => { for (let k = 0; k < 7; k++) { const a = k * 0.9 + s.t * 0.05, R = rr * (0.8 + ((k * 37) % 5) * 0.06); c[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * R, y + Math.sin(a) * R); } c.closePath(); }, 1.8); r(c, x - rr * 0.4, y - rr * 0.4, rr * 0.5, 2, '#A8A29E'); break;
      default: fl(c, s.col, () => c.arc(x, y, rr, 0, Math.PI * 2), 1.8); r(c, x - rr * 0.45, y - rr * 0.45, Math.max(2, rr * 0.4), Math.max(2, rr * 0.4), '#FFFFFF');
    }
  }
};

/** A minion (world): a size up, outlined. */
export const drawMinion = (c: Ctx, kind: string, x: number, y: number, rr: number, t: number, flash: boolean, vx: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(1.2, 1.2);
  if (flash) c.filter = 'brightness(2)';
  switch (kind) {
    case 'keychain': c.rotate(Math.sin(t * 0.2) * 0.5); fl(c, '#EAB308', () => { c.moveTo(0, -16); c.lineTo(10, 14); c.lineTo(4, 14); c.lineTo(0, 6); c.lineTo(-4, 14); c.lineTo(-10, 14); c.closePath(); }); c.strokeStyle = '#CA8A04'; c.lineWidth = 2; c.beginPath(); c.arc(0, -20, 4, 0, Math.PI * 2); c.stroke(); googlySmall(c, 0, -2, 4); break;
    case 'gull': { const w = Math.sin(t * 0.5) * 10; fl(c, '#F8FAFC', () => c.ellipse(0, 0, 12, 7, 0, 0, Math.PI * 2)); fl(c, '#E5E7EB', () => { c.moveTo(-4, -2); c.lineTo(-14, -10 - w); c.lineTo(4, -4); c.closePath(); }, 1.2); fl(c, '#FB923C', () => { c.moveTo(-12, -1); c.lineTo(-19, 1); c.lineTo(-12, 3); c.closePath(); }, 1); googlySmall(c, -7, -3, 3); break; }
    case 'gear': c.rotate(t * 0.1); fl(c, '#CA8A04', () => { for (let k = 0; k < 20; k++) { const a = (k * Math.PI) / 10, R = k % 2 ? rr : rr * 0.75; c[k ? 'lineTo' : 'moveTo'](Math.cos(a) * R, Math.sin(a) * R); } c.closePath(); }); fl(c, '#713F12', () => c.arc(0, 0, 4, 0, Math.PI * 2), 1); break;
    case 'lion': if (vx > 0) c.scale(-1, 1); fl(c, '#B45309', () => c.arc(-8, -4, 14, 0, Math.PI * 2)); fl(c, '#F59E0B', () => c.ellipse(4, 2, 16, 9, 0, 0, Math.PI * 2)); fl(c, '#F59E0B', () => c.arc(-10, -4, 8, 0, Math.PI * 2), 1.2); r(c, -15, -1, 5, 2, INK); googlySmall(c, -12, -7, 3); break;
    case 'scarab': fl(c, '#14532D', () => c.ellipse(0, 0, 10, 7, 0, 0, Math.PI * 2)); r(c, -1, -6, 2, 12, '#84CC16'); for (const s of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-4, s * 6); c.lineTo(-8 + Math.sin(t) * 2, s * 10); c.moveTo(4, s * 6); c.lineTo(8, s * 10); c.stroke(); } break;
    case 'head': fl(c, '#78716C', () => c.roundRect(-14, -20, 28, 40, 6)); r(c, -12, -10, 24, 4, '#57534E'); fl(c, '#78716C', () => c.rect(-4, -6, 6, 14), 1); googlySmall(c, -5, -14, 4); googlySmall(c, 6, -14, 4); break;
  }
  c.restore();
};
const googlySmall = (c: Ctx, x: number, y: number, rr: number) => { fl(c, '#FFFFFF', () => c.arc(x, y, rr, 0, Math.PI * 2), 1.2); c.fillStyle = INK; c.beginPath(); c.arc(x - rr * 0.3, y + rr * 0.2, rr * 0.5, 0, Math.PI * 2); c.fill(); };

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
  // (the fireball, banded, burning out from the middle into smoke)
  const rad = b.r * (0.45 + n * 0.75), fire = Math.max(0, 1 - n * 1.4);
  const bands: [number, string][] = [[1, n > 0.6 ? '#3F3F46' : '#57534E'], [0.86 * fire + 0.08, '#B91C1C'], [0.72 * fire, '#EA580C'], [0.55 * fire, '#F97316'], [0.38 * fire, '#FDE047'], [0.18 * fire, '#FFFFFF']];
  for (const [k, col] of bands) {
    if (rad * k < 1) continue;
    c.fillStyle = col; c.beginPath();
    // (lumpy: puffs round the edge, not a clean circle)
    for (let p = 0; p < 7; p++) { const a = (p / 7) * Math.PI * 2 + seed, pr = rad * k * (0.55 + hb(seed + p) * 0.2), px = b.x + Math.cos(a) * rad * k * 0.45, py = b.y + Math.sin(a) * rad * k * 0.45 - n * 10; c.moveTo(px + pr, py); c.arc(px, py, pr, 0, Math.PI * 2); }
    c.fill();
  }
  // (chunks thrown out, falling)
  const chunks = b.big ? 10 : 6;
  for (let p = 0; p < chunks; p++) {
    const a = hb(seed + p * 3) * Math.PI * 2, sp = b.r * (0.04 + hb(seed + p * 5) * 0.05), t = b.t;
    const cx = b.x + Math.cos(a) * sp * t, cy = b.y + Math.sin(a) * sp * t + 0.12 * t * t;
    r(c, cx - 2, cy - 2, 4, 4, p % 3 ? INK : '#F97316');
  }
};
