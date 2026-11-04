// The water park's level 1 cast, drawn (a crude first pass: inked shapes, two or three steps of each color). Every
// figure feet at the origin, facing right; every elbow and knee from art/limb.ts. Stamped by look, pose and frame
// (painted once each: no per-frame pixel work); the live glows (the possessed's eyes and aura) drawn over the stamp.
//
//   the possessed   park guests in their swimwear, a different person by seed (men and women, every skin, thin and
//                   heavy, hair of every sort, trunks, one-pieces, bikinis, board shorts, a tank top). Possessed by the
//                   demons (red: the skin flushed, little horns come up through the scalp, eyes lit red, the veins dark)
//                   or by the aliens (green: the skin gone grey-green, the veins green, eyes lit green, lumps on the
//                   skull where something's moved in, the jaw hanging, green drool).
//   the gator       a possessed alligator (Florida): red eyes lit, the jaws.
//   the pelican     a possessed pelican, alien: green eyes, the pouch.
//   the hover alien one of Zorblax's people on a hover disc (crater/aliens.ts's alien, stood on it).
//   the yeti        the tower's mascot, YETI-ON-THE-ROCKS, in a fur suit with a cartoon head, possessed by a demon: the
//                   costume's eyes lit red, its zipper burst, horns through the head.

import { stamp } from '../../../m1/game/render/stamp';
import { mix } from '../../../m1/game/render/backdrops/core';
import { elbow, knee, elbowFront, kneeFront } from '../../art/limb';
import { drawAlien, type AlienLook, type AlienPose } from '../../space/crater/aliens';

type Ctx = CanvasRenderingContext2D;
export const INK = '#0E0806';
const dk = (c: string, k = 0.3) => mix(c, INK, k);
const lt = (c: string, k = 0.25) => mix(c, '#FFFFFF', k);

/** A limb: an inked stroke, its lit line along the top. */
export const seg = (g: Ctx, x0: number, y0: number, x1: number, y1: number, w: number, col: string) => {
  g.lineCap = 'round';
  g.strokeStyle = INK; g.lineWidth = w + 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  g.strokeStyle = lt(col, 0.22); g.lineWidth = Math.max(1, w * 0.3); g.beginPath(); g.moveTo(x0 - w * 0.2, y0 - w * 0.2); g.lineTo(x1 - w * 0.2, y1 - w * 0.2); g.stroke();
  g.lineCap = 'butt';
};
/** A filled, inked blob. */
export const blob = (g: Ctx, path: () => void, col: string, line = 1.5) => {
  g.beginPath(); path(); g.fillStyle = col; g.fill(); g.strokeStyle = INK; g.lineWidth = line; g.lineJoin = 'round'; g.stroke();
};
export const ell = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string, rot = 0, line = 1.5) => blob(g, () => g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2), col, line);
const R = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

// ---------------------------------------------------------------------------------------------------------------
// The possessed guests

const SKINS = ['#F6DCC8', '#F0C8A2', '#D9A877', '#A86B43', '#6E4426', '#F4C2B0', '#8D5A3B', '#C68E62'];
const HAIR = ['#1F1611', '#4A2E1A', '#A16207', '#D6D3D1', '#7F1D1D', '#111827', '#F5D27A', '#3B2A20'];
const SWIM = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#A855F7', '#EC4899', '#14B8A6', '#F97316', '#1E3A8A', '#FDE047'];
export type Possession = 'demon' | 'alien';
export interface Guest {
  seed: number; woman: boolean; skin: string; hair: string; heavy: boolean; tall: boolean; bald: boolean; long: boolean;
  /** trunks, board shorts, a one-piece, a bikini, a tank top over trunks */
  suit: 'trunks' | 'board' | 'one' | 'bikini' | 'tank'; col: string; col2: string;
  /** shades pushed up on the head, a lanyard with a locker key, a sunburn */
  shades: boolean; burn: boolean;
}
export const guestOf = (seed: number): Guest => {
  const s = Math.abs(Math.round(seed)) * 7 + 3;
  const woman = Math.floor(s / 5) % 5 < 2;
  return {
    seed: s, woman, skin: SKINS[s % SKINS.length], hair: HAIR[Math.floor(s / 3) % HAIR.length], heavy: s % 3 === 0, tall: Math.floor(s / 11) % 3 === 0,
    bald: !woman && Math.floor(s / 13) % 4 === 0, long: woman ? Math.floor(s / 7) % 3 !== 0 : Math.floor(s / 7) % 6 === 0,
    suit: woman ? (Math.floor(s / 17) % 2 ? 'one' : 'bikini') : (['trunks', 'board', 'tank'] as const)[Math.floor(s / 17) % 3],
    col: SWIM[Math.floor(s / 2) % SWIM.length], col2: SWIM[Math.floor(s / 19) % SWIM.length],
    shades: Math.floor(s / 23) % 3 === 0, burn: Math.floor(s / 29) % 3 === 0,
  };
};
export type GuestPose = 'stand' | 'walk' | 'run' | 'tell' | 'punch' | 'leap' | 'crouch' | 'hurt';

/** Where his hands and feet go for a pose (frame q of 8 for the moving ones), feet at (0, 0), facing right. */
const posePts = (pose: GuestPose, q: number, H: number) => {
  const ph = (q / 8) * Math.PI * 2;
  const run = pose === 'run', walk = pose === 'walk';
  const st = run ? 13 : walk ? 8 : 0;
  const lift = (k: number) => (run || walk ? Math.max(0, Math.sin(ph + k)) * (run ? 9 : 5) : 0);
  let fF: [number, number] = [Math.sin(ph) * st + 3, -lift(0)], fB: [number, number] = [-Math.sin(ph) * st - 3, -lift(Math.PI)];
  let hF: [number, number], hB: [number, number];
  const sh = -H * 0.79;
  switch (pose) {
    case 'tell': hF = [10, sh - 14]; hB = [-4, sh - 18]; fF = [8, 0]; fB = [-8, 0]; break;
    case 'punch': hF = [28, sh + 2]; hB = [-10, sh + 14]; fF = [12, 0]; fB = [-10, 0]; break;
    case 'leap': hF = [16, sh - 20]; hB = [-12, sh - 16]; fF = [10, -14]; fB = [-12, -4]; break;
    case 'crouch': hF = [12, sh + 26]; hB = [-6, sh + 28]; fF = [9, 0]; fB = [-9, 0]; break;
    case 'hurt': hF = [-12, sh - 12]; hB = [-16, sh - 6]; fF = [4, 0]; fB = [-10, 0]; break;
    default: { const sw = run ? 12 : walk ? 7 : 0; hF = [Math.sin(ph + Math.PI) * sw + 4, sh + 24 + (run ? -6 : 0)]; hB = [Math.sin(ph) * sw - 4, sh + 24 + (run ? -6 : 0)]; }
  }
  return { fF, fB, hF, hB };
};

/** One of them (feet at the origin, facing right). */
export const paintGuest = (g: Ctx, G: Guest, pos: Possession, pose: GuestPose, q: number) => {
  const H = G.tall ? 76 : 70, w = G.heavy ? 26 : G.woman ? 19 : 22;
  const crouch = pose === 'crouch' ? 10 : 0;
  // (the possession in the skin: flushed red, or gone grey-green)
  const skin = pos === 'demon' ? mix(G.skin, '#C0261A', 0.32) : mix(G.skin, '#5E9A4A', 0.5);
  const skinD = dk(skin, 0.22);
  const { fF, fB, hF, hB } = posePts(pose, q, H);
  const hipY = -H * 0.47 + crouch, shY = -H * 0.79 + crouch * 1.3, headY = -H * 0.9 + crouch * 1.3;
  const lean = pose === 'run' ? 6 : pose === 'punch' ? 5 : pose === 'hurt' ? -4 : pose === 'leap' ? 4 : 0;
  const thigh = H * 0.24, shin = H * 0.25, up = H * 0.17, fore = H * 0.17;
  const bottom = G.suit === 'one' || G.suit === 'bikini' ? G.col : G.col;
  // the far leg, the far arm
  const leg = (f: [number, number], col: string, far: boolean) => {
    const hx = far ? -3 : 3, [kx, ky] = knee(hx, hipY, f[0], f[1] - 3, thigh, shin, 1);
    seg(g, hx, hipY, kx, ky, G.heavy ? 9 : 7, col);
    seg(g, kx, ky, f[0], f[1] - 3, G.heavy ? 7 : 6, col);
    // (bare feet: a water park; flip-flops on some)
    ell(g, f[0] + 3, f[1] - 2, 5, 2.4, G.seed % 2 ? col : '#3B82F6', 0, 1);
  };
  const arm = (h: [number, number], col: string, far: boolean) => {
    const sx = lean + (far ? -w / 2 + 3 : w / 2 - 3), [ex, ey] = elbow(sx, shY, h[0] + lean, h[1] + crouch, up, fore, 1);
    seg(g, sx, shY, ex, ey, G.heavy ? 7 : 6, col);
    seg(g, ex, ey, h[0] + lean, h[1] + crouch, G.heavy ? 6 : 5, col);
    ell(g, h[0] + lean, h[1] + crouch, 3.6, 3.6, col, 0, 1);
  };
  leg(fB, skinD, true);
  arm(hB, skinD, true);
  // the body: the torso (a lean), its swimwear
  blob(g, () => { g.moveTo(-w / 2 + lean, shY); g.lineTo(w / 2 + lean, shY); g.quadraticCurveTo(w / 2 + 3 + lean * 0.5, hipY - 10, w / 2 - 1, hipY + 2); g.lineTo(-w / 2 + 1, hipY + 2); g.quadraticCurveTo(-w / 2 - 3 + lean * 0.5, hipY - 10, -w / 2 + lean, shY); g.closePath(); }, skin);
  if (G.heavy) ell(g, 4 + lean * 0.6, hipY - 8, w / 2 - 1, 9, lt(skin, 0.06), 0, 1);
  // (the sunburn: a hot pink back and shoulders)
  if (G.burn) { g.globalAlpha = 0.35; ell(g, lean - 2, shY + 6, w / 2 - 2, 6, '#FB7185', 0, 0); g.globalAlpha = 1; }
  // (the swimwear)
  if (G.suit === 'one') blob(g, () => { g.moveTo(-w / 2 + 2 + lean, shY + 4); g.lineTo(w / 2 - 2 + lean, shY + 4); g.lineTo(w / 2, hipY + 4); g.lineTo(-w / 2, hipY + 4); g.closePath(); }, G.col);
  if (G.suit === 'bikini') { blob(g, () => g.roundRect(-w / 2 + 3 + lean, shY + 7, w - 6, 7, 3), G.col); }
  if (G.suit === 'tank') blob(g, () => { g.moveTo(-w / 2 + 3 + lean, shY + 1); g.lineTo(w / 2 - 3 + lean, shY + 1); g.lineTo(w / 2 - 1, hipY); g.lineTo(-w / 2 + 1, hipY); g.closePath(); }, G.col2);
  // (the bottoms: trunks, board shorts down to the knee)
  const shortsH = G.suit === 'board' ? 15 : G.suit === 'bikini' ? 6 : G.suit === 'one' ? 5 : 10;
  blob(g, () => g.roundRect(-w / 2 + 1, hipY - 4, w - 2, shortsH, 2), bottom);
  if (G.suit === 'board') for (let k = 0; k < 3; k++) R(g, -w / 2 + 4 + k * 6, hipY - 2, 2, shortsH - 3, G.col2);
  // the head
  const hx = lean + 2;
  if ((G.long || G.woman) && !G.bald) blob(g, () => { g.moveTo(hx - 6, headY - 6); g.quadraticCurveTo(hx - 16, headY, hx - 12, headY + (G.long ? 16 : 9)); g.quadraticCurveTo(hx - 8, headY + 4, hx - 3, headY - 2); g.closePath(); }, G.hair);
  ell(g, hx, headY, 9, 10, skin);
  ell(g, hx + 8, headY + 2, 2.6, 2.2, skin, 0, 1);
  if (!G.bald) blob(g, () => { g.moveTo(hx - 9, headY - 1); g.quadraticCurveTo(hx - 8, headY - 13, hx + 1, headY - 12); g.quadraticCurveTo(hx + 9, headY - 12, hx + 10, headY - 5); g.lineTo(hx + 4, headY - 7); g.quadraticCurveTo(hx - 2, headY - 7, hx - 6, headY + 1); g.closePath(); }, G.hair);
  if (G.shades) { R(g, hx - 3, headY - 11, 12, 3, INK); R(g, hx - 2, headY - 10, 4, 1, '#38BDF8'); R(g, hx + 4, headY - 10, 4, 1, '#38BDF8'); }
  // (the possession's tells, painted: horns up through the scalp; lumps on the skull, the jaw hanging)
  if (pos === 'demon') {
    for (const dx of [-2, 5]) blob(g, () => { g.moveTo(hx + dx - 2.5, headY - 9); g.lineTo(hx + dx - 1, headY - 17); g.lineTo(hx + dx + 2.5, headY - 9); g.closePath(); }, '#E8DCC0', 1);
    // (dark veins up the neck and over the cheek)
    g.strokeStyle = '#4A0A0A'; g.lineWidth = 1; g.beginPath(); g.moveTo(hx - 3, headY + 9); g.lineTo(hx - 1, headY + 4); g.lineTo(hx - 4, headY + 1); g.moveTo(hx + 1, headY + 9); g.lineTo(hx + 4, headY + 5); g.stroke();
    // (the snarl: teeth bared)
    R(g, hx + 2, headY + 5, 7, 3, INK); R(g, hx + 3, headY + 5, 1, 2, '#FFF'); R(g, hx + 5, headY + 5, 1, 2, '#FFF'); R(g, hx + 7, headY + 5, 1, 2, '#FFF');
  } else {
    ell(g, hx - 4, headY - 8, 3, 2.4, dk(skin, 0.08), 0, 1); ell(g, hx + 2, headY - 10, 2.4, 2, dk(skin, 0.08), 0, 1);
    g.strokeStyle = '#2F7A12'; g.lineWidth = 1; g.beginPath(); g.moveTo(hx - 5, headY + 8); g.lineTo(hx - 2, headY + 2); g.lineTo(hx - 6, headY - 2); g.moveTo(hx + 2, headY + 9); g.lineTo(hx + 5, headY + 4); g.stroke();
    // (the jaw hanging slack, the drool)
    R(g, hx + 3, headY + 4, 6, 6, INK); R(g, hx + 4, headY + 5, 4, 4, '#3A0A14');
    R(g, hx + 6, headY + 10, 2, 5, '#9BF25E'); R(g, hx + 6, headY + 15, 2, 2, '#C8FF9A');
  }
  // (the eyes' sockets: the glow goes over them live)
  R(g, hx + 3, headY - 3, 5, 3, INK);
  // the near leg, the near arm (the punching fist balled)
  leg(fF, skin, false);
  arm(hF, skin, false);
};
const GUEST_H = (G: Guest) => (G.tall ? 76 : 70);
/** Drawn: stamped (by its look, pose, frame), the eyes' glow and the aura live over it. */
export const drawGuest = (c: Ctx, G: Guest, pos: Possession, pose: GuestPose, f: number) => {
  const moving = pose === 'walk' || pose === 'run';
  const q = moving ? Math.floor(f / (pose === 'run' ? 3 : 5)) % 8 : 0;
  stamp(c, `wp-guest-${G.seed % 997}-${pos}-${pose}-${q}`, -40, -100, 84, 104, g => paintGuest(g, G, pos, pose, q));
  // (the eyes, lit: red or green, a flicker in them)
  const H = GUEST_H(G), crouch = pose === 'crouch' ? 13 : 0, lean = pose === 'run' ? 6 : pose === 'punch' ? 5 : pose === 'hurt' ? -4 : pose === 'leap' ? 4 : 0;
  const ex = lean + 2 + 4, ey = -H * 0.9 + crouch - 2;
  const col = pos === 'demon' ? '#FF3B1F' : '#7CFF3A', fl = 0.6 + 0.4 * Math.abs(Math.sin(f * 0.37 + G.seed));
  c.globalAlpha = 0.35 * fl; c.fillStyle = col; c.beginPath(); c.arc(ex + 1, ey, 6, 0, Math.PI * 2); c.fill();
  c.globalAlpha = 1; R(c, ex - 1, ey - 1, 2, 2, '#FFFFFF'); R(c, ex + 2, ey - 1, 2, 2, col);
  // (the tell: the glow flares, the whole of them lit)
  if (pose === 'tell' || pose === 'crouch') { c.globalAlpha = 0.18 + 0.12 * Math.sin(f * 0.8); c.fillStyle = col; c.beginPath(); c.ellipse(lean, -H * 0.5, 22, H * 0.55, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
};

// ---------------------------------------------------------------------------------------------------------------
// The gator (possessed, demonic): side on, low, facing right. ~110 long, 26 tall.

const GATOR = ['#5A6B2E', '#45531F', '#2F3A12', '#8A9A4A'];
export type GatorPose = 'walk' | 'tell' | 'lunge' | 'hurt';
const paintGator = (g: Ctx, pose: GatorPose, q: number) => {
  const ph = (q / 8) * Math.PI * 2, open = pose === 'tell' ? 0.5 : pose === 'lunge' ? 0.9 : 0.1;
  // (the tail, swinging)
  const tw = Math.sin(ph) * 4;
  blob(g, () => { g.moveTo(-20, -18); g.quadraticCurveTo(-50, -14 + tw, -66, -6 + tw); g.lineTo(-62, -2 + tw); g.quadraticCurveTo(-46, -6, -20, -6); g.closePath(); }, GATOR[1]);
  // (the legs: far pair, then the body, then the near pair; each a two-bone leg, the knee by limb.ts)
  const leg = (hx: number, k: number, col: string) => {
    const fx = hx + Math.sin(ph + k) * 6 + 4, [kx, ky] = knee(hx, -10, fx, 0, 7, 7, 1);
    seg(g, hx, -10, kx, ky, 5, col); seg(g, kx, ky, fx, 0, 4, col);
    R(g, fx - 1, -2, 6, 2, INK);
  };
  leg(-10, Math.PI, GATOR[2]); leg(20, 0, GATOR[2]);
  blob(g, () => { g.moveTo(-22, -20); g.quadraticCurveTo(0, -28, 26, -20); g.lineTo(30, -8); g.quadraticCurveTo(0, -2, -22, -6); g.closePath(); }, GATOR[0]);
  // (the scutes down its back)
  for (let k = 0; k < 6; k++) blob(g, () => { g.moveTo(-18 + k * 8, -22); g.lineTo(-15 + k * 8, -28); g.lineTo(-12 + k * 8, -22); g.closePath(); }, GATOR[2], 1);
  R(g, -16, -8, 40, 3, GATOR[3]);
  // (the head and the jaws, open as much as it's at)
  const a = open * 0.5;
  g.save(); g.translate(28, -14);
  g.save(); g.rotate(-a); blob(g, () => { g.moveTo(0, -6); g.lineTo(40, -4); g.lineTo(42, 0); g.lineTo(0, 2); g.closePath(); }, GATOR[0]); for (let k = 0; k < 6; k++) R(g, 6 + k * 6, 1, 2, 3, '#FFF8E0'); g.restore();
  g.save(); g.rotate(a * 0.6); blob(g, () => { g.moveTo(0, 0); g.lineTo(38, 1); g.lineTo(36, 5); g.lineTo(0, 7); g.closePath(); }, GATOR[1]); for (let k = 0; k < 5; k++) R(g, 8 + k * 6, -2, 2, 3, '#FFF8E0'); g.restore();
  // (the eye's bump: the glow's live)
  ell(g, 6, -8, 5, 4, GATOR[0], 0, 1); R(g, 5, -10, 4, 3, INK);
  g.restore();
  // the near legs
  leg(-6, 0, GATOR[0]); leg(24, Math.PI, GATOR[0]);
};
export const drawGator = (c: Ctx, pose: GatorPose, f: number) => {
  const q = pose === 'walk' || pose === 'lunge' ? Math.floor(f / 3) % 8 : 0;
  stamp(c, `wp-gator-${pose}-${q}`, -72, -40, 150, 46, g => paintGator(g, pose, q));
  const fl = 0.6 + 0.4 * Math.abs(Math.sin(f * 0.3));
  c.globalAlpha = 0.4 * fl; c.fillStyle = '#FF3B1F'; c.beginPath(); c.arc(36, -24, 5, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  R(c, 35, -25, 2, 2, '#FFE0D0');
};

// ---------------------------------------------------------------------------------------------------------------
// The pelican (possessed, alien): side on, facing right; wings up or down.

const PEL = ['#E7E1D2', '#C9C0AA', '#8E8670', '#F2B33D'];
export type PelPose = 'fly' | 'tell' | 'dive' | 'hurt';
const paintPelican = (g: Ctx, pose: PelPose, up: boolean) => {
  const dive = pose === 'dive';
  g.save(); if (dive) g.rotate(0.7);
  /** A wing off the shoulder (sx, sy): a broad wedge, its long dark flight feathers fanned at the tip. */
  const wing = (sx: number, sy: number, col: string, tipCol: string, k: number) => {
    const ty = up ? -30 * k : 18 * k, tx = -34 * k;
    blob(g, () => { g.moveTo(sx + 6, sy); g.quadraticCurveTo(sx - 8, sy + ty * 0.6 - 4, sx + tx, sy + ty); g.lineTo(sx + tx + 10, sy + ty * 0.7 + 6); g.quadraticCurveTo(sx - 4, sy + 8, sx + 10, sy + 6); g.closePath(); }, col);
    for (let f = 0; f < 4; f++) seg(g, sx + tx + 8 + f * 4, sy + ty * (0.8 - f * 0.12) + 4, sx + tx - 2 + f * 3, sy + ty * (0.95 - f * 0.1) + 2, 3, tipCol);
  };
  // far wing
  wing(-2, -4, PEL[2], '#3A3528', 0.85);
  // body, neck, head, the big beak and its pouch (bulging: something green moving in it)
  ell(g, 0, 0, 16, 9, PEL[0]);
  seg(g, 10, -4, 16, -16, 5, PEL[0]);
  ell(g, 18, -18, 6, 5, PEL[0]);
  blob(g, () => { g.moveTo(22, -20); g.lineTo(48, -16); g.lineTo(46, -13); g.lineTo(22, -15); g.closePath(); }, PEL[3], 1);
  blob(g, () => { g.moveTo(22, -15); g.quadraticCurveTo(34, -2, 46, -13); g.closePath(); }, pose === 'tell' ? '#9BF25E' : '#E0A23A', 1);
  R(g, 18, -21, 3, 2, INK);
  // feet tucked; near wing
  seg(g, -4, 7, -12, 11, 2, PEL[3]);
  wing(2, -6, PEL[1], '#4A4434', 1);
  g.restore();
};
export const drawPelican = (c: Ctx, pose: PelPose, f: number) => {
  const up = pose === 'dive' ? true : Math.floor(f / 7) % 2 === 0;
  stamp(c, `wp-pel-${pose}-${up ? 1 : 0}`, -44, -48, 100, 76, g => paintPelican(g, pose, up));
  if (pose !== 'dive') { c.globalAlpha = 0.5; c.fillStyle = '#7CFF3A'; c.beginPath(); c.arc(19.5, -20, 3.5, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
};

// ---------------------------------------------------------------------------------------------------------------
// The hover alien: one of Zorblax's people stood on a hover disc (its glow under it, live)

export const drawHover = (c: Ctx, look: AlienLook, pose: AlienPose, f: number) => {
  // (the disc: a chrome dish, its lights going round, the glow under it)
  c.globalAlpha = 0.25 + 0.1 * Math.sin(f * 0.3); c.fillStyle = '#7CFF3A'; c.beginPath(); c.ellipse(0, 10, 30, 8, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  stamp(c, 'wp-disc', -36, -6, 72, 18, g => {
    ell(g, 0, 2, 32, 6, '#9AA0AE'); ell(g, 0, 0, 28, 4, '#C8CCD6', 0, 1); R(g, -24, 2, 48, 2, '#6A6E7A');
  });
  for (let k = 0; k < 5; k++) { const a = f * 0.15 + k * 1.26, x = Math.cos(a) * 26; if (Math.sin(a) > 0) R(c, x - 1, 3, 3, 2, k % 2 ? '#F9A8D4' : '#7CFF3A'); }
  c.save(); c.translate(0, -2); drawAlien(c, look, pose, f, 0.72); c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The yeti mascot (a fur suit, possessed): big, facing right. ~120 tall. Poses: walk (8), tell (both arms up), pound
// (the fists down on the floor), punch, hurt.

const FUR = ['#F4F6FA', '#D8DEE8', '#A9B4C6', '#7C889E'];
export type YetiPose = 'stand' | 'walk' | 'tell' | 'pound' | 'punch' | 'hurt';
const paintYeti = (g: Ctx, pose: YetiPose, q: number) => {
  // (front-on: a cartoon suit faces the crowd; joints by elbowFront / kneeFront, out to its sides)
  const ph = (q / 8) * Math.PI * 2, walk = pose === 'walk';
  const crouch = pose === 'pound' ? 16 : 0;
  const hipY = -52 + crouch, shY = -98 + crouch, headY = -114 + crouch;
  // (the feet: apart; walking, one lifts then the other)
  const lift = (s: number) => (walk ? Math.max(0, Math.sin(ph + (s > 0 ? 0 : Math.PI))) * 10 : 0);
  const foot = (s: number): [number, number] => [s * (crouch ? 24 : 16), -lift(s)];
  // (the hands, by pose: s -1 its left (screen left), +1 its right)
  const hand = (s: number): [number, number] => pose === 'tell' ? [s * 30, shY - 50] : pose === 'pound' ? [s * 12, -10] : pose === 'punch' ? (s > 0 ? [62, shY - 4] : [-36, shY + 30]) : pose === 'hurt' ? [s * 26, headY - 10] : [s * 42 + (walk ? Math.sin(ph) * s * 6 : 0), shY + 48];
  const leg = (s: number, col: string) => {
    const hx = s * 13, f = foot(s), [kx, ky] = kneeFront(hx, hipY, f[0], f[1] - 6, 26, 26, s);
    seg(g, hx, hipY, kx, ky, 16, col); seg(g, kx, ky, f[0], f[1] - 6, 14, col);
    ell(g, f[0] + s * 3, f[1] - 4, 12, 6, dk(col, 0.1), 0, 1.5);
  };
  const arm = (s: number, col: string) => {
    const sx = s * 30, h = hand(s), [ex, ey] = elbowFront(sx, shY, h[0], h[1], 26, 26, s);
    seg(g, sx, shY, ex, ey, 14, col); seg(g, ex, ey, h[0], h[1], 13, col);
    ell(g, h[0], h[1], 9, 8, col);
  };
  leg(-1, FUR[2]); leg(1, FUR[1]);
  // the body: a fur barrel, the belly, the burst zipper (a red glow from inside it, live)
  ell(g, 0, (hipY + shY) / 2, 32, 32, FUR[1]);
  ell(g, 2, (hipY + shY) / 2 + 6, 20, 22, FUR[0], 0, 1);
  for (let k = 0; k < 6; k++) R(g, 1, shY + 6 + k * 7, 3, 3, '#9A9AA4');
  blob(g, () => { g.moveTo(-2, shY + 30); g.lineTo(8, shY + 22); g.lineTo(6, shY + 44); g.closePath(); }, '#2A0A06', 1);
  // the arms (both out to the sides; the punch's in front, over the body)
  if (pose !== 'punch') { arm(-1, FUR[2]); arm(1, FUR[1]); } else arm(-1, FUR[2]);
  // the head: the cartoon yeti's big grin, its plastic eyes (the glow's live), the horns through it, a toque
  ell(g, 0, headY, 24, 22, FUR[0]);
  blob(g, () => { g.moveTo(-18, headY + 4); g.quadraticCurveTo(0, headY + 22, 18, headY + 4); g.quadraticCurveTo(0, headY + 12, -18, headY + 4); g.closePath(); }, '#3A0A14', 1);
  for (let k = 0; k < 5; k++) R(g, -12 + k * 6, headY + 6, 4, 4, '#FFF');
  ell(g, -7, headY - 6, 6, 6, '#FFF', 0, 1); ell(g, 7, headY - 6, 6, 6, '#FFF', 0, 1);
  for (const dx of [-16, 16]) blob(g, () => { g.moveTo(dx - 4, headY - 16); g.lineTo(dx + (dx < 0 ? -6 : 6), headY - 34); g.lineTo(dx + 4, headY - 16); g.closePath(); }, '#8A0E0A', 1);
  blob(g, () => { g.moveTo(-20, headY - 14); g.quadraticCurveTo(0, headY - 36, 20, headY - 14); g.closePath(); }, '#2563EB', 1);
  R(g, -20, headY - 16, 40, 5, '#F8FAFC');
  ell(g, 0, headY - 30, 5, 5, '#F8FAFC', 0, 1);
  if (pose === 'punch') arm(1, FUR[1]);
};
export const drawYeti = (c: Ctx, pose: YetiPose, f: number) => {
  const q = pose === 'walk' ? Math.floor(f / 5) % 8 : 0;
  stamp(c, `wp-yeti-${pose}-${q}`, -60, -160, 130, 166, g => paintYeti(g, pose, q));
  const crouch = pose === 'pound' ? 16 : 0, fl = 0.6 + 0.4 * Math.abs(Math.sin(f * 0.31));
  for (const ex of [-7, 7]) { c.globalAlpha = 0.45 * fl; c.fillStyle = '#FF3B1F'; c.beginPath(); c.arc(ex, -120 + crouch, 5, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; R(c, ex - 1, -121 + crouch, 3, 3, '#FFE0D0'); }
  c.globalAlpha = 0.4 * fl; c.fillStyle = '#FF3B1F'; c.beginPath(); c.ellipse(3, -62 + crouch, 4, 10, 0.3, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
};
