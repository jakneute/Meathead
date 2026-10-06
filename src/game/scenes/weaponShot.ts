// The weapon-get screen's shots: in place of the punch, Meathead turns round from the camera and shoots it with the
// weapon he's just won. Each weapon has its own way of turning, its own look on his face, and its own kill (the lens
// effects are in weaponShotFx.ts). Painted the gross-up way of the face-off (faceOff.ts), in its coordinates (200 x
// 440, the head at the top); he's a lefty, so the weapon's in his left hand, on our right.
//
// Here: who does what (SHOTS), the turn, the back of him in his pants (before he turns), and his left arm with the
// weapon in it, pointed at the lens.

import type { WeaponType } from '../../types';
import { INK, hash, shape, speckle } from './art/ink';
import { bead } from './grossUp';
import { FaceSpec, Layer, stamp, warmLayer, legs, bulge, groove, pores, skin, guardArmVein, ARM_LAYERS, FACE_OFF_SHARED_LAYERS } from './faceOff';
import { BACK, BACK_ARMS, backArmVein, backRun, stinkAndFlies } from './faceOffEgg';

type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];

export type ShotWeapon = 'SHOTGUN' | 'FLAMETHROWER' | 'BOULDER' | 'TSUNAMI' | 'NEEDLES' | 'TASER' | 'SLUDGE' | 'OIL_ROCKET';

export interface TurnStyle {
  /** How long the turn takes (ms). */
  ms: number;
  /** How far round he goes, in half turns (1: straight round; 3: whirled round once and a half). */
  halves: number;
  /** How far round he is (0..1) at q (0..1) of the turn's time. */
  ease: (q: number) => number;
  /** A hop as he goes round (picture units, up). */
  hop: number;
  /** Twitching side to side (picture units). */
  jitter: number;
  /** Lurching, tipping over and back (degrees). */
  lurch: number;
}

export interface ShotSpec {
  turn: TurnStyle;
  /** His look, from when he's round to when the shot's gone. */
  face: FaceSpec;
  /** How long from the trigger to it hitting the lens (ms). */
  hit: number;
}

const smooth = (q: number) => q * q * (3 - 2 * q);
const snap = (q: number) => 1 - (1 - q) ** 3;

export const SHOTS: Record<ShotWeapon, ShotSpec> = {
  // Cool as you like: a slow turn, a brow up, a smirk
  SHOTGUN: { turn: { ms: 640, halves: 1, ease: smooth, hop: 0, jitter: 0, lurch: 0 }, face: { mouth: 'smirk', lift: [3.5, -0.5], squint: [0, 0.7] }, hit: 140 },
  // Whips round, wild-eyed, grinning ear to ear
  FLAMETHROWER: { turn: { ms: 240, halves: 1, ease: snap, hop: 0, jitter: 0, lurch: 6 }, face: { mouth: 'grin', wide: true, lift: [2.5, 2.5] }, hit: 150 },
  // Heavy: half round, a stamp, the rest of the way, roaring
  BOULDER: { turn: { ms: 620, halves: 1, ease: q => q < 0.45 ? smooth(q / 0.45) * 0.32 : q < 0.6 ? 0.32 : 0.32 + smooth((q - 0.6) / 0.4) * 0.68, hop: 0, jitter: 0, lurch: 0 }, face: { mouth: 'open', squint: [0.9, 0.9] }, hit: 170 },
  // Whirls round once and a half, whooping, like the hurricane he took it off
  TSUNAMI: { turn: { ms: 620, halves: 3, ease: smooth, hop: 6, jitter: 0, lurch: 0 }, face: { mouth: 'open', lift: [3, 3], squint: [0.3, 0.3] }, hit: 190 },
  // Sly: a lean as he comes round, a wink, the tongue out
  NEEDLES: { turn: { ms: 480, halves: 1, ease: smooth, hop: 0, jitter: 0, lurch: -8 }, face: { mouth: 'smirk', wink: true, tongue: true, lift: [2, 0] }, hit: 140 },
  // Twitching like he's wired to the mains, eyes out on stalks, every tooth
  TASER: { turn: { ms: 380, halves: 1, ease: q => Math.min(1, Math.round(q * 6) / 6 + (q > 0.95 ? 1 : 0)), hop: 0, jitter: 3, lurch: 0 }, face: { mouth: 'grin', wide: true, squint: [0, 0] }, hit: 110 },
  // Lurching round, queasy, the lip curled
  SLUDGE: { turn: { ms: 560, halves: 1, ease: q => smooth(q) + Math.sin(q * Math.PI * 2) * 0.12 * (1 - q), hop: 0, jitter: 0, lurch: 10 }, face: { mouth: 'sneer', squint: [0.2, 0.75], lift: [0, 1.5] }, hit: 160 },
  // Jumps round, grinning like it's his birthday
  OIL_ROCKET: { turn: { ms: 420, halves: 1, ease: smooth, hop: 14, jitter: 0, lurch: 0 }, face: { mouth: 'grin', lift: [3, 3], squint: [0.25, 0.25] }, hit: 300 },
};

export const isShotWeapon = (w: WeaponType): w is ShotWeapon => w in SHOTS;

/** Where he is in his turn, `q` (0..1) of the way through its time: squeezed side on, his back or his front, hopping, twitching. */
export const turnPose = (turn: TurnStyle, q: number, t: number) => {
  const a = Math.max(0, Math.min(1, turn.ease(Math.max(0, Math.min(1, q))))) * Math.PI * turn.halves;
  const going = q > 0 && q < 1;
  return {
    squeeze: Math.max(0.04, Math.abs(Math.cos(a))),
    front: Math.cos(a) < 0,
    dy: -Math.sin(Math.max(0, Math.min(1, q)) * Math.PI) * turn.hop,
    dx: going ? (hash(Math.floor(t / 33)) - 0.5) * 2 * turn.jitter : 0,
    tilt: Math.sin(Math.max(0, Math.min(1, q)) * Math.PI) * turn.lurch,
  };
};

// ---------------------------------------------------------------------------
// His back, in his pants (as the camera finds him, before he turns round)
// ---------------------------------------------------------------------------

/** The seat of his tactical pants: two great cheeks of navy, the seam up the middle, a back pocket each. */
const seat = (ctx: Ctx) => {
  for (const s of [-1, 1]) {
    const X = (x: number) => 100 + s * (x - 100);
    const cheek = () => { ctx.moveTo(X(100), 244); ctx.lineTo(X(57), 244); ctx.bezierCurveTo(X(52), 266, X(60), 300, X(100), 298); ctx.closePath(); };
    const g = ctx.createRadialGradient(X(80), 258, 2, X(78), 268, 30);
    g.addColorStop(0, s < 0 ? '#3456B8' : '#284A9E'); g.addColorStop(0.5, '#1E3A8A'); g.addColorStop(1, '#13245A');
    shape(ctx, cheek, g, 2.4);
    // (the back pocket, stitched)
    shape(ctx, () => ctx.roundRect(Math.min(X(64), X(90)), 252, 26, 22, 3), '#1B347C', 1.4);
    ctx.strokeStyle = 'rgba(147, 170, 230, 0.4)'; ctx.lineWidth = 0.6; ctx.setLineDash([1.5, 1.5]);
    ctx.strokeRect(Math.min(X(66), X(88)) + 0.5, 254.5, 21, 17); ctx.setLineDash([]);
    // (the crease under the cheek)
    ctx.strokeStyle = 'rgba(8, 14, 40, 0.7)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(X(98), 296); ctx.quadraticCurveTo(X(80), 300, X(64), 290); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(8, 14, 40, 0.85)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(100, 244); ctx.lineTo(100, 298); ctx.stroke();
};

/** The lifting belt from behind: the strap, stitched, no buckle this side. */
const beltBack = (ctx: Ctx) => {
  const path = () => { ctx.moveTo(57, 222); ctx.lineTo(143, 222); ctx.lineTo(144, 250); ctx.lineTo(56, 250); ctx.closePath(); };
  const g = ctx.createLinearGradient(0, 222, 0, 250);
  g.addColorStop(0, '#9A4A14'); g.addColorStop(0.35, '#7A3610'); g.addColorStop(1, '#4A1F08');
  shape(ctx, path, g, 2.6);
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  speckle(ctx, 56, 222, 88, 28, 120, 'rgba(30, 10, 2, 0.4)', 13, 0.6);
  ctx.strokeStyle = 'rgba(253, 230, 138, 0.55)'; ctx.lineWidth = 0.6; ctx.setLineDash([2, 1.6]);
  ctx.beginPath(); ctx.moveTo(58, 225.5); ctx.lineTo(142, 225.5); ctx.moveTo(57, 246.5); ctx.lineTo(143, 246.5); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
};

/** He shat himself before the boss went down, and the seat of his pants shows it: soaked through, a run down one leg. */
const seatShat = (ctx: Ctx) => {
  const stain = () => { ctx.moveTo(84, 262); ctx.bezierCurveTo(90, 252, 112, 252, 117, 264); ctx.bezierCurveTo(124, 280, 116, 300, 100, 302); ctx.bezierCurveTo(84, 300, 78, 280, 84, 262); ctx.closePath(); };
  shape(ctx, stain, 'rgba(74, 52, 24, 0.82)', 0);
  shape(ctx, () => { ctx.moveTo(90, 272); ctx.bezierCurveTo(94, 264, 108, 264, 111, 274); ctx.bezierCurveTo(112, 288, 106, 296, 100, 297); ctx.bezierCurveTo(93, 296, 88, 286, 90, 272); ctx.closePath(); }, 'rgba(56, 38, 16, 0.9)', 0);
  // (the edge of it, a wet tide mark; and down the inside of his right leg)
  ctx.strokeStyle = 'rgba(120, 90, 40, 0.6)'; ctx.lineWidth = 1; ctx.beginPath(); stain(); ctx.stroke();
  ctx.strokeStyle = 'rgba(74, 52, 24, 0.85)'; ctx.lineCap = 'round'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(94, 296); ctx.quadraticCurveTo(92, 330, 90, 362); ctx.stroke();
  shape(ctx, () => ctx.ellipse(90, 364, 3, 3.6, 0, 0, Math.PI * 2), 'rgba(74, 52, 24, 0.9)', 0);
  ctx.fillStyle = 'rgba(214, 170, 110, 0.45)'; ctx.fillRect(96, 268, 6, 1.4); ctx.fillRect(92, 300, 1.4, 14);
};

const BACK_PANTS = [false, true].map(shitty => ({ key: `shot-back-pants${shitty}`, x: 20, y: 220, w: 170, h: 220, draw: (c: Ctx) => { legs(c); seat(c); if (shitty) seatShat(c); } } as Layer));
const BELT_BACK: Layer = { key: 'shot-belt-back', x: 50, y: 216, w: 100, h: 40, draw: beltBack };

/** Him from behind, standing there in his pants (his hands round front, on the weapon). */
export const drawBackClothed = (ctx: Ctx, t: number, k: number, shitty: boolean) => {
  stamp(ctx, BACK_PANTS[shitty ? 1 : 0], k);
  if (shitty) stinkAndFlies(ctx, t);
  stamp(ctx, BACK, k);
  stamp(ctx, BELT_BACK, k);
  backRun(ctx, t);
  for (const s of [-1, 1]) {
    const [u, r] = BACK_ARMS[s < 0 ? 0 : 1];
    stamp(ctx, u, k); backArmVein(ctx, s, t); stamp(ctx, r, k);
  }
  // (and the front of him ready for when he turns: a frame at a time, no hitch)
  warmLayer(FACE_OFF_SHARED_LAYERS, k);
};

// ---------------------------------------------------------------------------
// The weapons, pointed at the lens: in the hand's own units (the fist at 0, 0, the barrel up over it), nearer things
// bigger and the far end running back toward the middle of the picture (up and to the left of the hand)
// ---------------------------------------------------------------------------

/** Which way is away from the camera, from the hand (toward the picture's middle). */
const AWAY: Pt = [-0.6, -0.8];

/** A cylinder pointed at the lens: its near end at (x, y), r across; its far end `len` back, `rb` across. Shaded across with `ramp`. */
const tube = (ctx: Ctx, x: number, y: number, r: number, len: number, rb: number, ramp: string[], line = 2) => {
  const bx = x + AWAY[0] * len, by = y + AWAY[1] * len;
  // (the outer tangents between the two ends: perpendicular to the axis, either side)
  const nx = -AWAY[1], ny = AWAY[0];
  const path = () => {
    ctx.moveTo(x + nx * r, y + ny * r); ctx.lineTo(bx + nx * rb, by + ny * rb);
    ctx.arc(bx, by, rb, Math.atan2(ny, nx), Math.atan2(-ny, -nx), true);
    ctx.lineTo(x - nx * r, y - ny * r);
    ctx.arc(x, y, r, Math.atan2(-ny, -nx), Math.atan2(ny, nx), true);
    ctx.closePath();
  };
  const g = ctx.createLinearGradient(x - nx * r, y - ny * r, x + nx * r, y + ny * r);
  ramp.forEach((c, i) => g.addColorStop(i / (ramp.length - 1), c));
  shape(ctx, path, g, line);
};

/** A band round a tube (a ring, a stripe), `d` back from its near end. */
const band = (ctx: Ctx, x: number, y: number, r: number, d: number, w: number, color: string) => {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w;
  ctx.beginPath(); ctx.arc(x + AWAY[0] * d, y + AWAY[1] * d, r, Math.PI * 0.05, Math.PI * 1.05); ctx.stroke(); ctx.restore();
};

/** The open end of a barrel, facing the lens: a lit rim round a bore. */
const muzzleFace = (ctx: Ctx, x: number, y: number, r: number, rim: string[], bore: string[], boreR = 0.62) => {
  const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
  rim.forEach((c, i) => g.addColorStop(i / (rim.length - 1), c));
  shape(ctx, () => ctx.arc(x, y, r, 0, Math.PI * 2), g, 2);
  const b = ctx.createRadialGradient(x + r * 0.15, y + r * 0.15, 0, x, y, r * boreR);
  bore.forEach((c, i) => b.addColorStop(i / (bore.length - 1), c));
  shape(ctx, () => ctx.arc(x, y, r * boreR, 0, Math.PI * 2), b, 1.2);
};

const STEEL = ['#475569', '#94A3B8', '#E2E8F0', '#94A3B8', '#334155'];
const GUNMETAL = ['#18181B', '#3F3F46', '#71717A', '#3F3F46', '#18181B'];

/** Each weapon: drawn about the fist; where its muzzle is (in the hand's units). */
interface Held { draw: (ctx: Ctx, t: number) => void; muzzle: Pt }

const HELD: Record<ShotWeapon, Held> = {
  // The cryo shotgun: the blue receiver back there, the steel barrel and the magazine tube under it at you, the
  // coolant glowing in its bands, frost round the bore, an icicle off it, a breath of cold coming off
  SHOTGUN: {
    muzzle: [0, -26],
    draw: (ctx, t) => {
      tube(ctx, -3, -18, 11, 22, 8, ['#075985', '#0284C7', '#38BDF8', '#0284C7', '#082F49']);
      const pulse = 0.55 + 0.45 * Math.sin(t / 110);
      for (const d of [6, 12, 18]) band(ctx, -3, -18, 10, d, 2.2, `rgba(125, 211, 252, ${pulse})`);
      tube(ctx, 0, -12, 5, 10, 4, STEEL, 1.6);
      tube(ctx, 1, -9, 7, 8, 6, ['#082F49', '#075985', '#0EA5E9', '#075985', '#082F49'], 1.8); // (the pump)
      for (let i = 0; i < 4; i++) { ctx.strokeStyle = 'rgba(8, 47, 73, 0.8)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(1, -9, 7, Math.PI * (0.2 + i * 0.12), Math.PI * (0.25 + i * 0.12)); ctx.stroke(); }
      muzzleFace(ctx, 1, -9, 4, ['#F1F5F9', '#94A3B8', '#475569'], ['#0C4A6E', '#020617']);
      tube(ctx, 0, -26, 8, 12, 6, STEEL, 2);
      muzzleFace(ctx, 0, -26, 8, ['#FFFFFF', '#CBD5E1', '#64748B'], ['#0C4A6E', '#082F49', '#020617'], 0.66);
      // (frost caked round the bore, in specks)
      speckle(ctx, -8, -34, 16, 16, 40, 'rgba(224, 242, 254, 0.9)', 4, 1);
      ctx.save(); ctx.beginPath(); ctx.arc(0, -26, 5.3, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = '#0C4A6E'; ctx.beginPath(); ctx.arc(0, -26, 4.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#020617'; ctx.beginPath(); ctx.arc(0.6, -25.4, 3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      // (an icicle under the muzzle)
      shape(ctx, () => { ctx.moveTo(-3, -19); ctx.lineTo(3, -19); ctx.lineTo(0.4, -11); ctx.closePath(); }, '#E0F2FE', 1);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-1.6, -19, 1, 5);
      // (cold breathing off it)
      for (let i = 0; i < 3; i++) {
        const q = ((t / 700 + i / 3) % 1);
        ctx.fillStyle = `rgba(224, 242, 254, ${0.55 * (1 - q)})`;
        ctx.beginPath(); ctx.arc(2 + q * 6 + Math.sin(q * 6 + i) * 2, -34 - q * 16, 2 + q * 4, 0, Math.PI * 2); ctx.fill();
      }
    },
  },
  // The flamethrower: the finned barrel coming at you, the brass nozzle, the pilot light licking under it; the red
  // fuel canister on its side by his fist, the gauge, the hose
  FLAMETHROWER: {
    muzzle: [0, -26],
    draw: (ctx, t) => {
      // (the canister, the hose up into the barrel)
      ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-16, -2); ctx.quadraticCurveTo(-24, -26, -12, -38); ctx.stroke();
      ctx.strokeStyle = '#3F3F46'; ctx.lineWidth = 3; ctx.stroke();
      const cg = ctx.createRadialGradient(-20, 0, 1, -17, 3, 11);
      cg.addColorStop(0, '#FCA5A5'); cg.addColorStop(0.35, '#DC2626'); cg.addColorStop(0.8, '#991B1B'); cg.addColorStop(1, '#450A0A');
      shape(ctx, () => ctx.arc(-17, 3, 10, 0, Math.PI * 2), cg, 2);
      shape(ctx, () => ctx.arc(-17, 3, 4, 0, Math.PI * 2), '#FDE68A', 1);
      ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-17, 3); ctx.lineTo(-17 + Math.cos(t / 300) * 3, 3 - 2.5); ctx.stroke();
      tube(ctx, -2, -22, 10, 22, 7, GUNMETAL);
      for (const d of [5, 9, 13, 17]) band(ctx, -2, -22, 10.5, d, 2, '#09090B');
      tube(ctx, 0, -26, 6.5, 6, 6, ['#7C2D12', '#EA580C', '#FDBA74', '#C2410C', '#431407']);
      muzzleFace(ctx, 0, -26, 6.5, ['#FED7AA', '#EA580C', '#7C2D12'], ['#1C1917', '#000000'], 0.6);
      // (the pilot light, licking up off the bottom lip of it: blue at the root, orange up)
      const flick = Math.abs(Math.sin(t / 50)) * 2 + hash(Math.floor(t / 60)) * 1.5;
      ctx.fillStyle = '#60A5FA'; ctx.beginPath(); ctx.ellipse(0, -20.5, 2.2, 1.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FB923C'; ctx.beginPath(); ctx.moveTo(-2, -21); ctx.quadraticCurveTo(-1, -26 - flick, 1 + flick * 0.4, -29 - flick); ctx.quadraticCurveTo(2, -24, 2, -21); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#FEF08A'; ctx.beginPath(); ctx.ellipse(0, -22.5, 0.9, 1.6, 0, 0, Math.PI * 2); ctx.fill();
    },
  },
  // The boulder: a craggy chunk of rock, mossy on top, cracked, in his fist (his fingers round under it)
  BOULDER: {
    muzzle: [0, -18],
    draw: (ctx) => rock(ctx, 0, -16, 21, 0),
  },
  // The hydro cannon: the blue body back there, the chrome nozzle ring at you, water rippling in the bore, a drip
  TSUNAMI: {
    muzzle: [0, -25],
    draw: (ctx, t) => {
      tube(ctx, -2, -20, 11, 22, 8, ['#1E3A8A', '#1D4ED8', '#60A5FA', '#1D4ED8', '#172554']);
      // (the gauge window down its side, the water sloshing in it)
      ctx.save(); ctx.translate(-12, -26); ctx.rotate(Math.atan2(AWAY[1], AWAY[0]) + Math.PI);
      shape(ctx, () => ctx.rect(-2, -4, 12, 5), '#0F172A', 1);
      ctx.fillStyle = '#38BDF8'; ctx.fillRect(-2, -1.5 + Math.sin(t / 150), 12, 2.5);
      ctx.restore();
      tube(ctx, 0, -25, 9, 6, 8, STEEL);
      muzzleFace(ctx, 0, -25, 9, ['#FFFFFF', '#CBD5E1', '#64748B'], ['#93C5FD', '#2563EB', '#1E3A8A'], 0.7);
      // (the water in it, rippling in rings)
      ctx.strokeStyle = 'rgba(219, 234, 254, 0.75)'; ctx.lineWidth = 0.8;
      for (let i = 0; i < 2; i++) { const r = ((t / 200 + i * 0.5) % 1) * 5.5; ctx.beginPath(); ctx.arc(0, -25, r, 0, Math.PI * 2); ctx.stroke(); }
      const drip = (t % 900) / 900;
      if (drip < 0.6) shape(ctx, () => ctx.ellipse(1, -18 + drip * 26, 1.6, 2.2, 0, 0, Math.PI * 2), '#BFDBFE', 0.6);
    },
  },
  // The needle cannon: a fat syringe, nose on to the lens. The plunger plate way back, the glass barrel full of neon
  // pink, the red hub, the needle coming at you with a bead on its tip
  NEEDLES: {
    muzzle: [2, -24],
    draw: (ctx, t) => {
      const fx = 2 + AWAY[0] * 30, fy = -24 + AWAY[1] * 30;
      shape(ctx, () => ctx.ellipse(fx, fy, 11, 10, 0, 0, Math.PI * 2), '#9CA3AF', 1.6);
      tube(ctx, 2 + AWAY[0] * 6, -24 + AWAY[1] * 6, 10, 22, 8.5, ['#86106F', '#FF2BD6', '#FFC2F3', '#FF2BD6', '#86106F']);
      // (the glass over the dope: its shine, the measure marks, the dope sloshing)
      ctx.save(); ctx.globalAlpha = 0.6;
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-10, -26); ctx.lineTo(-20, -42); ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.7)'; ctx.lineWidth = 0.7;
      for (const d of [8, 12, 16, 20]) { const x = 2 + AWAY[0] * d, y = -24 + AWAY[1] * d; ctx.beginPath(); ctx.moveTo(x + 6, y - 6); ctx.lineTo(x + 8.5, y - 4); ctx.stroke(); }
      tube(ctx, 2 + AWAY[0] * 2, -24 + AWAY[1] * 2, 4.5, 4, 4.5, ['#7F1D1D', '#DC2626', '#FCA5A5', '#B91C1C', '#450A0A'], 1.4);
      // (the needle: nose on, a bright point, and the bead of dope on it)
      ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(2 + AWAY[0] * 2, -24 + AWAY[1] * 2); ctx.lineTo(2.4, -23.6); ctx.stroke();
      const swell = 1 + Math.sin(t / 240) * 0.25;
      shape(ctx, () => ctx.arc(2.4, -23, 1.6 * swell, 0, Math.PI * 2), '#FF6BE3', 0.6);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(1.8, -24, 0.8, 0.8);
    },
  },
  // The taser: a black box with hazard stripes down it, the cyan emitter at you, the two prongs, the arc between
  TASER: {
    muzzle: [0, -24],
    draw: (ctx, t) => {
      tube(ctx, -2, -20, 10, 20, 8, ['#09090B', '#27272A', '#52525B', '#27272A', '#09090B']);
      // (hazard stripes down its underside)
      ctx.save(); ctx.beginPath(); ctx.moveTo(-10, -14); ctx.lineTo(-24, -32); ctx.lineTo(-18, -34); ctx.lineTo(-4, -16); ctx.closePath(); ctx.clip();
      ctx.fillStyle = '#FACC15'; for (let i = -40; i < 10; i += 6) { ctx.beginPath(); ctx.moveTo(i, -10); ctx.lineTo(i + 3, -10); ctx.lineTo(i + 23, -40); ctx.lineTo(i + 20, -40); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      ctx.fillStyle = Math.floor(t / 250) % 2 ? '#22C55E' : '#14532D'; ctx.fillRect(-15, -34, 3, 3);
      shape(ctx, () => ctx.roundRect(-7, -31, 14, 14, 3), '#164E63', 2);
      const eg = ctx.createRadialGradient(-1, -25, 0.5, 0, -24, 7);
      eg.addColorStop(0, '#ECFEFF'); eg.addColorStop(0.4, '#22D3EE'); eg.addColorStop(1, '#0E7490');
      shape(ctx, () => ctx.roundRect(-5, -29, 10, 10, 2), eg, 1);
      // (the prongs, either side, and the arc jumping between them)
      for (const s of [-1, 1]) { shape(ctx, () => ctx.arc(s * 7.5, -24, 2.2, 0, Math.PI * 2), '#D1D5DB', 1); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(s * 7.5 - 1, -25, 0.8, 0.8); }
      if (Math.floor(t / 45) % 3 !== 0) {
        const seed = Math.floor(t / 45);
        ctx.strokeStyle = '#A5F3FC'; ctx.lineWidth = 1.6; ctx.lineJoin = 'miter';
        ctx.beginPath(); ctx.moveTo(-7.5, -24);
        for (let i = 1; i < 6; i++) ctx.lineTo(-7.5 + i * 2.5, -24 + (hash(seed * 7 + i) - 0.5) * 7);
        ctx.lineTo(7.5, -24); ctx.stroke();
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 0.6; ctx.stroke();
      }
    },
  },
  // The sludge barfer: the dark green body, the glass canister of goo bubbling up top, the nozzle at you with the
  // goo welling in it and a string of it hanging off the lip
  SLUDGE: {
    muzzle: [0, -24],
    draw: (ctx, t) => {
      tube(ctx, -2, -20, 10, 20, 7.5, ['#052E16', '#14532D', '#16A34A', '#14532D', '#052E16']);
      // (the canister, up on top of it: glass, the goo slopping, bubbles)
      const cx = -16, cy = -46;
      shape(ctx, () => ctx.roundRect(cx - 8, cy - 12, 16, 20, 3), 'rgba(187, 247, 208, 0.45)', 1.6);
      ctx.save(); ctx.beginPath(); ctx.roundRect(cx - 8, cy - 12, 16, 20, 3); ctx.clip();
      const lvl = cy - 4 + Math.sin(t / 160) * 1.2;
      ctx.fillStyle = '#22C55E'; ctx.fillRect(cx - 8, lvl, 16, 20);
      ctx.fillStyle = '#86EFAC'; ctx.fillRect(cx - 8, lvl, 16, 1.2);
      for (let i = 0; i < 3; i++) { const q = ((t / 500 + i / 3) % 1); shape(ctx, () => ctx.arc(cx - 4 + i * 4, cy + 8 - q * 12, 1 + q, 0, Math.PI * 2), '#BBF7D0', 0.4); }
      ctx.restore();
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(cx - 6, cy - 10, 1.4, 14);
      shape(ctx, () => ctx.rect(cx - 9, cy - 14, 18, 3), '#166534', 1.2);
      tube(ctx, 0, -24, 7, 5, 6.5, ['#14532D', '#22C55E', '#86EFAC', '#16A34A', '#052E16']);
      muzzleFace(ctx, 0, -24, 7, ['#BBF7D0', '#22C55E', '#14532D'], ['#BEF264', '#65A30D', '#1A2E05'], 0.66);
      // (the string of it off the lip, stretching, letting go)
      const s = (t % 1100) / 1100;
      ctx.strokeStyle = '#84CC16'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(1, -18); ctx.lineTo(1.4, -18 + s * 14); ctx.stroke();
      shape(ctx, () => ctx.ellipse(1.4, -17 + s * 14, 2, 2.4, 0, 0, Math.PI * 2), '#A3E635', 0.6);
    },
  },
  // The oil rocket launcher: a fat olive tube, hazard bands round it, the sight up top with its red dot, and the red
  // warhead nosing out of it at you, crude slopped over it and running off
  OIL_ROCKET: {
    muzzle: [-2, -28],
    draw: (ctx, t) => {
      tube(ctx, -4, -24, 15, 30, 12, ['#1F1F16', '#3F3F2E', '#7A7A55', '#3F3F2E', '#1F1F16'], 2.4);
      for (const d of [6, 18]) band(ctx, -4, -24, 15.2, d, 3, '#FACC15');
      // (the sight, its red dot)
      shape(ctx, () => ctx.rect(-28, -54, 9, 7), '#27272A', 1.4);
      ctx.fillStyle = Math.floor(t / 300) % 2 ? '#F87171' : '#FECACA'; ctx.fillRect(-24, -52, 2.4, 2.4);
      muzzleFace(ctx, -4, -24, 15, ['#7A7A55', '#3F3F2E', '#1F1F16'], ['#09090B', '#000000'], 0.86);
      // (the warhead: a fat red cone, its nose at you)
      const g = ctx.createRadialGradient(-6, -28, 0.5, -3, -25, 12);
      g.addColorStop(0, '#FECACA'); g.addColorStop(0.25, '#F87171'); g.addColorStop(0.6, '#DC2626'); g.addColorStop(1, '#7F1D1D');
      shape(ctx, () => ctx.arc(-3, -25, 11.5, 0, Math.PI * 2), g, 2);
      ctx.strokeStyle = 'rgba(69, 10, 10, 0.5)'; ctx.lineWidth = 0.8;
      for (const r of [4, 8]) { ctx.beginPath(); ctx.arc(-3, -25, r, 0, Math.PI * 2); ctx.stroke(); }
      // (crude slopped over the top of it, running down in drips)
      const crude = () => { ctx.moveTo(-14, -28); ctx.quadraticCurveTo(-8, -38, 2, -35); ctx.quadraticCurveTo(8, -33, 8, -27); ctx.lineTo(6, -22); ctx.lineTo(4, -27); ctx.lineTo(0, -25); ctx.lineTo(-2, -16); ctx.lineTo(-5, -26); ctx.lineTo(-10, -24); ctx.lineTo(-12, -19); ctx.closePath(); };
      shape(ctx, crude, '#0A0A0A', 1);
      ctx.fillStyle = 'rgba(214, 211, 209, 0.6)'; ctx.fillRect(-8, -33, 5, 1.2); ctx.fillRect(3, -31, 2, 1);
      const d = (t % 1300) / 1300;
      if (d < 0.7) shape(ctx, () => ctx.ellipse(-2, -15 + d * 20, 1.6, 2.4, 0, 0, Math.PI * 2), '#0A0A0A', 0.4);
    },
  },
};

/** The boulder (in his hand, or coming at the lens): craggy, lit from the upper left, a mossy crown, cracks. */
export const rock = (ctx: Ctx, x: number, y: number, r: number, spin: number) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
  const pts: Pt[] = Array.from({ length: 11 }, (_, i) => { const a = (i / 11) * Math.PI * 2, w = r * (0.82 + hash(i * 3.1) * 0.3); return [Math.cos(a) * w, Math.sin(a) * w * 0.9]; });
  const path = () => { ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]); ctx.closePath(); };
  const g = ctx.createRadialGradient(-r * 0.4, -r * 0.45, r * 0.1, 0, 0, r * 1.1);
  g.addColorStop(0, '#D6A866'); g.addColorStop(0.3, '#A16207'); g.addColorStop(0.7, '#854D0E'); g.addColorStop(1, '#3B1F05');
  shape(ctx, path, g, Math.max(1.5, r * 0.09));
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  // (a lit facet up top, a shadowed one under on the right)
  ctx.fillStyle = 'rgba(253, 230, 170, 0.35)'; ctx.beginPath(); ctx.moveTo(-r * 0.7, -r * 0.5); ctx.lineTo(r * 0.1, -r * 0.85); ctx.lineTo(r * 0.5, -r * 0.3); ctx.lineTo(-r * 0.2, -r * 0.15); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(40, 20, 5, 0.4)'; ctx.beginPath(); ctx.moveTo(r * 0.2, r * 0.1); ctx.lineTo(r, 0); ctx.lineTo(r * 0.6, r); ctx.lineTo(-r * 0.2, r); ctx.closePath(); ctx.fill();
  speckle(ctx, -r, -r, r * 2, r * 2, Math.min(220, Math.round(r * 5)), 'rgba(40, 20, 5, 0.45)', 17, Math.max(0.6, r * 0.04));
  speckle(ctx, -r, -r, r * 2, r * 1.2, Math.min(90, Math.round(r * 2)), 'rgba(253, 230, 170, 0.5)', 23, Math.max(0.5, r * 0.035));
  // (moss on the crown)
  ctx.fillStyle = '#4D7C0F'; ctx.beginPath(); ctx.ellipse(-r * 0.25, -r * 0.72, r * 0.42, r * 0.2, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#84CC16'; ctx.beginPath(); ctx.ellipse(-r * 0.32, -r * 0.78, r * 0.22, r * 0.09, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // (cracks, the lip under each catching the light)
  ctx.strokeStyle = INK; ctx.lineWidth = Math.max(0.8, r * 0.06); ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-r * 0.15, -r * 0.1); ctx.lineTo(r * 0.1, r * 0.2); ctx.lineTo(-r * 0.05, r * 0.55); ctx.moveTo(r * 0.1, r * 0.2); ctx.lineTo(r * 0.5, r * 0.25); ctx.stroke();
  ctx.strokeStyle = 'rgba(253, 230, 170, 0.6)'; ctx.lineWidth = Math.max(0.4, r * 0.025);
  ctx.beginPath(); ctx.moveTo(-r * 0.13, -r * 0.05); ctx.lineTo(r * 0.12, r * 0.25); ctx.stroke();
  ctx.restore();
};

/** His left fist, round the grip (knuckles to the lens, the thumb over the top), in the hand's units. */
const gripFist = (ctx: Ctx, open: boolean) => {
  if (open) {
    // (thrown: the hand open, the fingers splayed after it)
    for (let i = 0; i < 4; i++) {
      const a = -Math.PI / 2 - 0.7 + i * 0.45;
      skin(ctx, () => ctx.roundRect(-3 + Math.cos(a) * 12, -4 + Math.sin(a) * 12, 6, 10, 3), -6, -16, 6, 6, 1.6);
    }
  }
  const fist = () => ctx.roundRect(-13, -9, 26, 20, 8);
  bulge(ctx, fist, -2, 0, 15, 2.4);
  for (let k = 0; k < 3; k++) { const x = -6 + k * 6.5; groove(ctx, [x, -8, x + 0.5, -2, x + 0.5, 4, x, 10], 1.1, 0.6); }
  // (the knuckles split from the boss, the thumb across the top)
  for (let k = 0; k < 4; k++) { const x = -9.5 + k * 6.5; shape(ctx, () => ctx.ellipse(x, -7.5, 2.4, 1.5, 0, 0, Math.PI * 2), '#C2410C', 0.5); ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x - 1, -8, 2, 1); }
  skin(ctx, () => ctx.roundRect(-14, -12, 18, 7, 3.5), -14, -12, 4, -5, 1.6);
  ctx.fillStyle = '#F5E6D3'; ctx.fillRect(-13, -10.5, 4, 3);
};

/** Where his left hand is, how big (nearer the lens: bigger), and whether it's let go of what was in it. */
export interface ArmPose { hand: Pt; scale: number; thrown: boolean; spin?: number }

/** The hand's picture position when he's holding it on you, and drawn back to throw (the boulder). */
export const HOLD: Pt = [142, 150];

/** Where the muzzle is in the picture, for a pose. */
export const muzzleAt = (w: ShotWeapon, p: ArmPose): Pt => [p.hand[0] + HELD[w].muzzle[0] * p.scale, p.hand[1] + HELD[w].muzzle[1] * p.scale];

/**
 * His left arm with the weapon in it, in the face-off's picture (over the torso, as the guard arm would be): the upper
 * arm down to the elbow, the forearm coming at the lens to the fist, the weapon in the fist pointed at you.
 */
export const drawShotArm = (ctx: Ctx, w: ShotWeapon, t: number, k: number, p: ArmPose) => {
  const [u] = ARM_LAYERS[1];
  stamp(ctx, u, k); guardArmVein(ctx, 1, t, 0);
  // The forearm: from the elbow, coming at you, fatter toward the fist (nearer)
  const E: Pt = [152, 170], H = p.hand, rE = 12, rH = 13 * p.scale;
  const dx = H[0] - E[0], dy = H[1] - E[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const fore = () => {
    ctx.moveTo(E[0] + nx * rE, E[1] + ny * rE); ctx.lineTo(H[0] + nx * rH, H[1] + ny * rH);
    ctx.arc(H[0], H[1], rH, Math.atan2(ny, nx), Math.atan2(-ny, -nx), true);
    ctx.lineTo(E[0] - nx * rE, E[1] - ny * rE);
    ctx.arc(E[0], E[1], rE, Math.atan2(-ny, -nx), Math.atan2(ny, nx), true);
    ctx.closePath();
  };
  bulge(ctx, fore, (E[0] + H[0]) / 2 - 3, (E[1] + H[1]) / 2 - 3, Math.max(rE, rH) * 1.6);
  pores(ctx, fore, Math.min(E[0], H[0]) - rH, Math.min(E[1], H[1]) - rH, Math.abs(dx) + rH * 2, Math.abs(dy) + rH * 2, 91, 60);
  ctx.strokeStyle = 'rgba(40, 20, 8, 0.5)'; ctx.lineWidth = 0.35;
  for (let i = 0; i < 14; i++) { const q = hash(i * 3), x = E[0] + dx * q + nx * (hash(i * 5) - 0.5) * rE * 1.4, y = E[1] + dy * q + ny * (hash(i * 5) - 0.5) * rE * 1.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 1.2, y - 2.2); ctx.stroke(); }
  // The delt, over the top of the upper arm
  bulge(ctx, () => ctx.arc(160, 104, 24, 0, Math.PI * 2), 160, 104, 24, 2.6);
  for (let i = 0; i < 4; i++) groove(ctx, [148 + i * 6, 86, 150 + i * 6, 96, 152 + i * 6, 108, 150 + i * 7, 122], 0.7, 0.3);
  bead(ctx, 152, 96, 1.4);
  // The weapon, and the fist round it
  ctx.save(); ctx.translate(H[0], H[1]); ctx.scale(p.scale, p.scale);
  if (!p.thrown) HELD[w].draw(ctx, t);
  gripFist(ctx, p.thrown);
  if (w === 'BOULDER' && !p.thrown) {
    // (his fingers up round the rock's underside)
    for (let i = 0; i < 4; i++) { const x = -9 + i * 6; skin(ctx, () => ctx.roundRect(x - 2.6, -14, 5.2, 8, 2.6), x - 3, -14, x + 3, -6, 1.4); }
  }
  ctx.restore();
};
