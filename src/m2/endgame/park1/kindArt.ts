// The water park's level 1 cast, drawn: the SNES pass (every material in its steps, lit from the upper left, the seams
// between the steps dithered, inked round every part: Spooky Land's costume kit, spooky/costume.ts). Every figure feet
// at the origin, facing right; every elbow and knee from art/limb.ts (the hand or the foot clamped to the bones' reach
// with reachTo, so it's drawn where the limb ends). Stamped by look, pose and frame (painted once each: no per-frame pixel
// work); the live glows (the possessed's eyes and aura, the disc's lights) drawn over the stamp.
//
//   the possessed   park guests in their swimwear, a different person by seed (men and women, every skin, thin and
//                   heavy, short and tall; hair of every sort (short, buzzed, curly, a ponytail, a bun, long, a mullet,
//                   bald), mustaches and beards, chest hair, tan lines and sunburns; trunks, board shorts, one-pieces,
//                   bikinis, a tank top; flip-flops or bare feet, a locker key on a coil round the wrist). Possessed by
//                   the demons (red: the skin flushed, horns up through the scalp, the skin cracked and glowing in the
//                   cracks, the brow down, the teeth bared) or by the aliens (green: the skin gone grey-green, green veins,
//                   lumps on the skull where something's moved in, the jaw hanging, green drool, a feeler out of an ear).
//   the gator       a possessed alligator (Florida): its hide in olive steps, the belly pale, the back's armor in rows, the
//                   jaws with their teeth (the inside of the mouth dark red when it gapes), red glowing cracks on its head.
//   the pelican     a possessed pelican, alien: its white in steps, the wings' coverts and the dark flight feathers, the
//                   big bill and the pouch (something green squirming in it, veined green).
//   the hover alien one of Zorblax's people on a hover disc (crater/aliens.ts's alien, stood on it): the disc a chrome dish
//                   in its steps, its rim's sockets (the lights going round, live), its emitter glowing under it.
//   the yeti        the tower's mascot, YETI-ON-THE-ROCKS, in a fur suit with a cartoon head, possessed by a demon: the
//                   fur in tufts and steps, the costume's plastic eyes (lit red, live), its zipper burst (the red glow
//                   inside, live), horns up through the head, the toque.
//
// Hitboxes, blood and AI are kinds.ts's (unchanged); the art keeps to the old drawings' outlines and their live glows'
// spots (the eyes, the zipper).

import { stamp } from '../../../m1/game/render/stamp';
import { elbow, knee, elbowFront, kneeFront, reachTo } from '../../art/limb';
import { drawAlien, type AlienLook, type AlienPose } from '../../space/crater/aliens';
import { part, partTop, ball, jointed, dither, px, flat, mix, ramp, INK as CINK } from '../../spooky/costume';

type Ctx = CanvasRenderingContext2D;
type P = [number, number];
export const INK = CINK;
const dk = (c: string, k = 0.3) => mix(c, INK, k);
const lt = (c: string, k = 0.25) => mix(c, '#FFFFFF', k);
const R = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const tri = (g: Ctx, pts: P[], col: string, line = 1) => flat(g, () => { g.moveTo(pts[0][0], pts[0][1]); for (const [x, y] of pts.slice(1)) g.lineTo(x, y); g.closePath(); }, col, line);
/** A two-bone limb from root r to end e (the joint from limb.ts, the end clamped to its reach): inked as one piece, in
 *  steps; returns the joint and the end as drawn. */
const limb2 = (g: Ctx, r: P, e: P, a: number, b: number, w1: number, w2: number, col: string, joint: (rx: number, ry: number, ex: number, ey: number, a: number, b: number) => P, col2 = col) => {
  const end = reachTo(r[0], r[1], e[0], e[1], a, b), j = joint(r[0], r[1], end[0], end[1], a, b);
  jointed(g, [r, j, end], [w1, w2], [col, col2]);
  return { j, end };
};

// ---------------------------------------------------------------------------------------------------------------
// The possessed guests

const SKINS = ['#F6DCC8', '#F0C8A2', '#D9A877', '#A86B43', '#6E4426', '#F4C2B0', '#8D5A3B', '#C68E62'];
const HAIR = ['#1F1611', '#4A2E1A', '#A16207', '#D6D3D1', '#7F1D1D', '#111827', '#F5D27A', '#3B2A20'];
const SWIM = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#A855F7', '#EC4899', '#14B8A6', '#F97316', '#1E3A8A', '#FDE047'];
export type Possession = 'demon' | 'alien';
type Hair = 'short' | 'buzz' | 'curly' | 'pony' | 'bun' | 'long' | 'mullet' | 'bald';
export interface Guest {
  seed: number; woman: boolean; skin: string; hair: string; heavy: boolean; tall: boolean; bald: boolean; long: boolean;
  /** trunks, board shorts, a one-piece, a bikini, a tank top over trunks */
  suit: 'trunks' | 'board' | 'one' | 'bikini' | 'tank'; col: string; col2: string;
  /** shades pushed up on the head, a sunburn */
  shades: boolean; burn: boolean;
  /** the haircut; facial hair (0 none, 1 a mustache, 2 a beard); chest hair; tan lines; flip-flops (or bare feet); a
   *  locker key on its coil round the wrist; the swimwear's print (0 plain, 1 stripes, 2 dots) */
  style: Hair; beard: 0 | 1 | 2; chest: boolean; tan: boolean; flops: boolean; key: boolean; print: 0 | 1 | 2;
}
export const guestOf = (seed: number): Guest => {
  const s = Math.abs(Math.round(seed)) * 7 + 3;
  const woman = Math.floor(s / 5) % 5 < 2;
  const bald = !woman && Math.floor(s / 13) % 4 === 0, long = woman ? Math.floor(s / 7) % 3 !== 0 : Math.floor(s / 7) % 6 === 0;
  const st = Math.floor(s / 31);
  const style: Hair = bald ? 'bald' : woman ? (long ? (['long', 'pony', 'long', 'curly'] as const)[st % 4] : (['bun', 'short', 'curly'] as const)[st % 3]) : long ? (['long', 'mullet'] as const)[st % 2] : (['short', 'buzz', 'curly', 'short', 'mullet'] as const)[st % 5];
  return {
    seed: s, woman, skin: SKINS[s % SKINS.length], hair: HAIR[Math.floor(s / 3) % HAIR.length], heavy: s % 3 === 0, tall: Math.floor(s / 11) % 3 === 0,
    bald, long,
    suit: woman ? (Math.floor(s / 17) % 2 ? 'one' : 'bikini') : (['trunks', 'board', 'tank'] as const)[Math.floor(s / 17) % 3],
    col: SWIM[Math.floor(s / 2) % SWIM.length], col2: SWIM[Math.floor(s / 19) % SWIM.length],
    shades: Math.floor(s / 23) % 3 === 0, burn: Math.floor(s / 29) % 3 === 0,
    style, beard: woman ? 0 : (([0, 1, 0, 2, 0] as const)[Math.floor(s / 37) % 5]), chest: !woman && Math.floor(s / 41) % 3 === 0,
    tan: Math.floor(s / 43) % 3 === 1, flops: Math.floor(s / 47) % 2 === 0, key: Math.floor(s / 53) % 3 === 0, print: (Math.floor(s / 59) % 3) as 0 | 1 | 2,
  };
};
export type GuestPose = 'stand' | 'walk' | 'run' | 'tell' | 'punch' | 'leap' | 'crouch' | 'hurt';

/** Where his hands and feet go for a pose (frame q of 8 for the moving ones), feet at (0, 0), facing right. */
const posePts = (pose: GuestPose, q: number, H: number) => {
  const ph = (q / 8) * Math.PI * 2;
  const run = pose === 'run', walk = pose === 'walk';
  const st = run ? 13 : walk ? 8 : 0;
  const lift = (k: number) => (run || walk ? Math.max(0, Math.sin(ph + k)) * (run ? 9 : 5) : 0);
  let fF: P = [Math.sin(ph) * st + 3, -lift(0)], fB: P = [-Math.sin(ph) * st - 3, -lift(Math.PI)];
  let hF: P, hB: P;
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
const leanOf = (pose: GuestPose) => (pose === 'run' ? 6 : pose === 'punch' ? 5 : pose === 'hurt' ? -4 : pose === 'leap' ? 4 : 0);

/** One of them (feet at the origin, facing right). */
export const paintGuest = (g: Ctx, G: Guest, pos: Possession, pose: GuestPose, q: number) => {
  const H = G.tall ? 76 : 70, w = G.heavy ? 26 : G.woman ? 19 : 22;
  const crouch = pose === 'crouch' ? 10 : 0;
  // (the possession in the skin: flushed red, or gone grey-green)
  const skin = pos === 'demon' ? mix(G.skin, '#C0261A', 0.32) : mix(G.skin, '#5E9A4A', 0.5);
  const skinD = dk(skin, 0.2);
  const { fF, fB, hF, hB } = posePts(pose, q, H);
  const hipY = -H * 0.47 + crouch, shY = -H * 0.79 + crouch * 1.3, headY = -H * 0.9 + crouch * 1.3;
  const lean = leanOf(pose);
  const thigh = H * 0.24, shin = H * 0.25, up = H * 0.17, fore = H * 0.17;
  const tw = G.heavy ? 9 : G.woman ? 7 : 8, sw = G.heavy ? 7 : 6, aw = G.heavy ? 7 : G.woman ? 5 : 6;
  const shorts = G.suit === 'board' ? 0.8 : G.suit === 'trunks' || G.suit === 'tank' ? 0.42 : 0;
  const crack = pos === 'demon' ? '#FF7A2A' : '#7CFF3A', crackD = pos === 'demon' ? '#5A0A06' : '#1F4A10';
  // the legs (the far one first, a step darker): bare, the shorts over the thigh, a flip-flop or a bare foot
  const leg = (f: P, far: boolean) => {
    const col = far ? skinD : skin, hip: P = [far ? -3 : 3, hipY];
    const { j, end } = limb2(g, hip, [f[0], f[1] - 1.5], thigh, shin, tw, sw, col, (a, b, c, d, e, h) => knee(a, b, c, d, e, h, 1));
    // (the shorts' leg: down the thigh so far, a hem at its end)
    if (shorts > 0) {
      const sx = hip[0] + (j[0] - hip[0]) * shorts, sy = hip[1] + (j[1] - hip[1]) * shorts;
      const sc = far ? dk(G.col, 0.18) : G.col;
      jointed(g, [hip, [sx, sy]], [tw + 2], [sc]);
      if (G.suit === 'board' && G.print === 1) { g.strokeStyle = far ? dk(G.col2, 0.18) : G.col2; g.lineWidth = 2; g.beginPath(); g.moveTo(hip[0] + 2, hip[1]); g.lineTo(sx + 2, sy); g.stroke(); }
      if (G.print === 2) for (let k = 1; k < 4; k++) px(g, hip[0] + (sx - hip[0]) * k / 4 - 1, hip[1] + (sy - hip[1]) * k / 4 - 1, 2, 2, lt(sc, 0.45));
    }
    // (the foot: a flip-flop (its sole, the thong between the toes) or bare (its toes))
    const fx = end[0], fy = end[1] + 1.5;
    if (G.flops) { R(g, fx - 3, fy - 2, 11, 3, INK); R(g, fx - 2, fy - 2, 9, 2, far ? '#1D4ED8' : '#3B82F6'); R(g, fx - 2, fy - 2, 9, 1, '#93C5FD'); }
    part(g, () => g.ellipse(fx + 3, fy - 3.5, 5, 2.6, 0, 0, Math.PI * 2), col, fx - 2, fy - 6, 10, 5, 1);
    if (G.flops) { R(g, fx + 3, fy - 5, 1, 3, '#1E3A8A'); } else { R(g, fx + 6, fy - 3, 1, 1, dk(col, 0.35)); R(g, fx + 4, fy - 3, 1, 1, dk(col, 0.35)); }
  };
  // the arms (the far one a step darker): a fist balled on the punch; the locker key's coil on the near wrist
  const arm = (h: P, far: boolean) => {
    const col = far ? skinD : skin, sh: P = [lean + (far ? -w / 2 + 3 : w / 2 - 3), shY + 2];
    const { j, end } = limb2(g, sh, [h[0] + lean, h[1] + crouch], up, fore, aw, aw - 1, col, (a, b, c, d, e, hh) => elbow(a, b, c, d, e, hh, 1));
    ball(g, end[0], end[1], pose === 'punch' && !far ? 4.2 : 3.4, col, 1);
    if (pose === 'punch' && !far) { R(g, end[0] + 1, end[1] - 2, 1, 4, dk(col, 0.35)); R(g, end[0] - 1, end[1] - 3, 2, 1, lt(col, 0.3)); }
    if (G.burn && !far) { g.globalAlpha = 0.5; px(g, sh[0] - 1, sh[1] - 1, 4, 3, '#FB7185'); g.globalAlpha = 1; }
    // (the demon's: the skin cracked down the forearm, glowing in the cracks; the alien's: a green vein up it)
    if (!far) { g.strokeStyle = crackD; g.lineWidth = 1.6; g.beginPath(); g.moveTo(j[0], j[1]); g.lineTo((j[0] + end[0]) / 2 + 1, (j[1] + end[1]) / 2); g.lineTo(end[0] - 1, end[1] - 2); g.stroke(); g.strokeStyle = crack; g.lineWidth = 0.8; g.stroke(); }
    if (G.key && !far) { const kx = (j[0] + end[0] * 3) / 4, ky = (j[1] + end[1] * 3) / 4; R(g, kx - 2, ky - 1, 4, 3, INK); R(g, kx - 1, ky, 2, 1, '#F97316'); R(g, kx + 1, ky + 2, 2, 3, '#FACC15'); }
    return end;
  };
  // (the hair down the back, behind the head and the shoulders: long, a ponytail swinging, a mullet)
  const hx = lean + 2;
  const backHair = () => {
    if (G.style === 'long') part(g, () => { g.moveTo(hx - 6, headY - 7); g.quadraticCurveTo(hx - 16, headY, hx - 12, headY + 17); g.lineTo(hx - 4, headY + 15); g.quadraticCurveTo(hx - 6, headY + 4, hx - 2, headY - 2); g.closePath(); }, G.hair, hx - 16, headY - 7, 14, 24, 1);
    else if (G.style === 'mullet') part(g, () => { g.moveTo(hx - 7, headY - 2); g.quadraticCurveTo(hx - 13, headY + 4, hx - 10, headY + 12); g.lineTo(hx - 3, headY + 10); g.quadraticCurveTo(hx - 5, headY + 4, hx - 2, headY); g.closePath(); }, G.hair, hx - 13, headY - 2, 11, 14, 1);
    else if (G.style === 'pony') { const sway = pose === 'run' ? 4 : pose === 'walk' ? (q % 4 < 2 ? 2 : -1) : 0; part(g, () => { g.moveTo(hx - 8, headY - 6); g.quadraticCurveTo(hx - 18 - sway, headY - 2, hx - 15 - sway, headY + 12); g.quadraticCurveTo(hx - 11, headY + 4, hx - 6, headY - 2); g.closePath(); }, G.hair, hx - 19, headY - 6, 14, 18, 1); R(g, hx - 9, headY - 6, 3, 3, G.col); }
  };
  // ---- far side
  leg(fB, true);
  arm(hB, true);
  backHair();
  // ---- the body: the torso (a lean; a waist on the women, a gut on the heavy ones), lit up its left
  const torsoPath = () => {
    const wa = G.woman ? -2 : G.heavy ? 3 : 0;
    g.moveTo(-w / 2 + lean, shY); g.lineTo(w / 2 + lean, shY);
    g.quadraticCurveTo(w / 2 + 2 + wa + lean * 0.5, (shY + hipY) / 2, w / 2 - 1, hipY + 2);
    g.lineTo(-w / 2 + 1, hipY + 2);
    g.quadraticCurveTo(-w / 2 - 2 - (G.woman ? -2 : 0) + lean * 0.5, (shY + hipY) / 2, -w / 2 + lean, shY); g.closePath();
  };
  part(g, torsoPath, skin, -w / 2 + lean - 3, shY, w + 6, hipY - shY + 3, 1.2);
  // (the neck, under the jaw)
  part(g, () => g.rect(hx - 4, headY + 5, 7, shY - headY - 2), skinD, hx - 4, headY + 5, 7, shY - headY, 1);
  // (the gut: hung out over the waistband, its navel; the chest: the pecs' crease, the nipples; chest hair on some)
  const gx = 3 + lean * 0.6;
  if (G.heavy) part(g, () => g.ellipse(gx, hipY - 8, w / 2 - 1, 10, 0, 0, Math.PI * 2), lt(skin, 0.05), gx - w / 2, hipY - 18, w, 20, 1);
  R(g, gx + 2, hipY - 7, 2, 2, dk(skin, 0.4));
  if (!G.woman) {
    g.strokeStyle = dk(skin, 0.3); g.lineWidth = 1; g.beginPath(); g.moveTo(lean - 3, shY + 11); g.quadraticCurveTo(lean + 3, shY + 14, lean + 9, shY + 10); g.stroke();
    if (G.suit !== 'tank') { R(g, lean + 6, shY + 9, 2, 2, dk(skin, 0.42)); R(g, lean - 2, shY + 9, 2, 2, dk(skin, 0.42)); }
    if (G.chest && G.suit !== 'tank') dither(g, lean - 3, shY + 4, 12, 12, dk(G.hair, 0.1));
  }
  // (a sunburn on the shoulders; the tan lines where a suit's been)
  if (G.burn) { g.globalAlpha = 0.35; g.fillStyle = '#FB7185'; g.beginPath(); g.ellipse(lean - 1, shY + 5, w / 2 - 2, 5, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
  if (G.tan) { R(g, -w / 2 + 2, hipY - 7, w - 3, 1, lt(skin, 0.35)); }
  // (the demon's: the chest cracked open in a branching line, glowing in it; the alien's: veins, something lumped under
  // the skin of the belly)
  if (pos === 'demon') {
    g.strokeStyle = crackD; g.lineWidth = 2; g.beginPath(); g.moveTo(lean + 2, shY + 4); g.lineTo(lean - 1, shY + 12); g.lineTo(lean + 4, shY + 18); g.lineTo(lean + 1, hipY - 6); g.moveTo(lean - 1, shY + 12); g.lineTo(lean - 6, shY + 16); g.stroke();
    g.strokeStyle = crack; g.lineWidth = 0.9; g.stroke(); px(g, lean - 1, shY + 12, 1, 1, '#FFE0A0');
  } else {
    g.strokeStyle = '#2F7A12'; g.lineWidth = 1; g.beginPath(); g.moveTo(lean - 4, shY + 3); g.lineTo(lean - 1, shY + 9); g.lineTo(lean - 5, shY + 15); g.moveTo(lean + 6, hipY - 4); g.lineTo(lean + 3, hipY - 12); g.stroke();
    part(g, () => g.ellipse(lean + 5, hipY - 13, 3.2, 2.6, 0, 0, Math.PI * 2), mix(skin, '#9BF25E', 0.25), lean + 2, hipY - 16, 7, 6, 0.8);
  }
  // ---- the swimwear
  const suitTop = (path: () => void, col: string, y0: number, y1: number) => part(g, path, col, -w / 2 + lean - 2, y0, w + 4, y1 - y0, 1);
  if (G.suit === 'one') {
    suitTop(() => { g.moveTo(-w / 2 + 3 + lean, shY + 5); g.lineTo(w / 2 - 2 + lean, shY + 5); g.quadraticCurveTo(w / 2 + 1, (shY + hipY) / 2, w / 2 - 1, hipY + 5); g.lineTo(-w / 2 + 1, hipY + 5); g.quadraticCurveTo(-w / 2 - 1, (shY + hipY) / 2, -w / 2 + 3 + lean, shY + 5); g.closePath(); }, G.col, shY + 5, hipY + 5);
    // (the straps up over the shoulders; a stripe or dots)
    R(g, lean - 4, shY - 1, 2, 7, dk(G.col, 0.2)); R(g, lean + 5, shY - 1, 2, 7, G.col);
    if (G.print === 1) for (let y = shY + 9; y < hipY + 2; y += 6) R(g, -w / 2 + 2, y, w - 3, 2, lt(G.col2, 0.1));
    if (G.print === 2) for (let k = 0; k < 6; k++) px(g, lean - 6 + (k % 3) * 6, shY + 10 + Math.floor(k / 3) * 9, 2, 2, lt(G.col, 0.5));
  }
  if (G.suit === 'bikini') {
    suitTop(() => g.roundRect(-w / 2 + 3 + lean, shY + 7, w - 5, 7, 3), G.col, shY + 7, shY + 14);
    R(g, lean, shY + 9, 1, 4, dk(G.col, 0.4));
    R(g, lean - 4, shY, 1, 8, dk(G.col, 0.2)); R(g, lean + 6, shY, 1, 8, G.col);
    suitTop(() => { g.moveTo(-w / 2 + 1, hipY - 2); g.lineTo(w / 2 - 1, hipY - 2); g.lineTo(w / 2 - 3, hipY + 4); g.lineTo(-w / 2 + 3, hipY + 4); g.closePath(); }, G.col, hipY - 2, hipY + 4);
    if (G.print === 2) { px(g, lean - 2, shY + 9, 2, 2, lt(G.col, 0.5)); px(g, -2, hipY, 2, 2, lt(G.col, 0.5)); }
  }
  if (G.suit === 'tank') {
    suitTop(() => { g.moveTo(-w / 2 + 3 + lean, shY + 1); g.lineTo(lean - 2, shY + 1); g.quadraticCurveTo(lean + 1, shY + 7, lean + 4, shY + 1); g.lineTo(w / 2 - 3 + lean, shY + 1); g.lineTo(w / 2 - 1, hipY); g.lineTo(-w / 2 + 1, hipY); g.closePath(); }, G.col2, shY + 1, hipY);
    // (a print on it: a beer, a flag, a palm)
    const k = G.seed % 3;
    if (k === 0) { R(g, lean, shY + 10, 5, 7, '#F59E0B'); R(g, lean, shY + 10, 5, 2, '#FFFFFF'); }
    else if (k === 1) { R(g, lean - 2, shY + 10, 9, 6, '#F8FAFC'); R(g, lean - 2, shY + 10, 4, 3, '#1E3A8A'); R(g, lean + 2, shY + 12, 5, 1, '#DC2626'); R(g, lean + 2, shY + 14, 5, 1, '#DC2626'); }
    else { R(g, lean + 2, shY + 10, 1, 8, '#7C4A1A'); tri(g, [[lean + 2, shY + 10], [lean - 3, shY + 12], [lean + 7, shY + 12]], '#16A34A', 0.6); }
  }
  // (the bottoms' waistband: trunks, board shorts; the drawstring; a one-piece's or a bikini's is its own)
  if (shorts > 0) {
    part(g, () => g.roundRect(-w / 2 + 1, hipY - 5, w - 2, 9, 2), G.col, -w / 2 + 1, hipY - 5, w - 2, 9, 1);
    R(g, -w / 2 + 2, hipY - 4, w - 4, 1, dk(G.col, 0.3));
    R(g, lean * 0.3 + 3, hipY - 3, 1, 5, '#F8FAFC'); R(g, lean * 0.3 + 5, hipY - 3, 1, 4, '#F8FAFC');
    if (G.print === 1) for (let k = 0; k < 3; k++) R(g, -w / 2 + 4 + k * 6, hipY - 2, 2, 6, G.col2);
  }
  // ---- the head: its shape in steps, the ear, the nose; the hair over it; the face
  part(g, () => g.ellipse(hx, headY, 9, 10, 0, 0, Math.PI * 2), skin, hx - 9, headY - 10, 18, 20, 1.2);
  ball(g, hx - 3, headY + 1, 2.4, skinD, 0.8);
  part(g, () => g.ellipse(hx + 8.5, headY + 2, 2.6, 2.2, 0, 0, Math.PI * 2), skin, hx + 6, headY, 5, 4, 0.8);
  const top = () => { g.moveTo(hx - 9.5, headY); g.quadraticCurveTo(hx - 9, headY - 12.5, hx + 1, headY - 11.5); g.quadraticCurveTo(hx + 9.5, headY - 11.5, hx + 10, headY - 5); g.lineTo(hx + 4, headY - 7); g.quadraticCurveTo(hx - 2, headY - 7, hx - 6, headY + 2); g.closePath(); };
  switch (G.style) {
    case 'bald': R(g, hx - 4, headY - 8, 4, 2, lt(skin, 0.4)); R(g, hx - 5, headY - 6, 2, 1, lt(skin, 0.25)); break;
    case 'buzz': dither(g, hx - 8, headY - 9, 16, 6, dk(G.hair, 0.05)); dither(g, hx - 8, headY - 4, 5, 5, dk(G.hair, 0.05)); break;
    case 'curly': for (let k = 0; k < 7; k++) { const a = Math.PI * (0.95 + k * 0.17); ball(g, hx + Math.cos(a) * 8, headY - 3 + Math.sin(a) * 8.5, 3.3, G.hair, 0.8); } break;
    case 'bun': partTop(g, top, G.hair, hx - 10, headY - 12, 20, 14, 1); ball(g, hx - 5, headY - 13, 4, G.hair, 1); R(g, hx - 6, headY - 10, 4, 1, G.col); break;
    default: partTop(g, top, G.hair, hx - 10, headY - 12, 20, 14, 1);
  }
  if (G.shades) { R(g, hx - 3, headY - 11, 12, 3, INK); R(g, hx - 2, headY - 10, 4, 1, '#38BDF8'); R(g, hx + 4, headY - 10, 4, 1, '#38BDF8'); }
  // (the brow down over the sockets: the eyes' glow goes over them live)
  R(g, hx + 2, headY - 5, 8, 2, pos === 'demon' ? dk(skin, 0.45) : dk(skin, 0.3));
  R(g, hx + 3, headY - 3, 5, 3, INK);
  if (pos === 'demon') { R(g, hx + 2, headY - 3, 1, 3, dk(skin, 0.4)); R(g, hx + 8, headY - 2, 1, 2, dk(skin, 0.4)); }
  // (facial hair: a mustache, a beard)
  if (G.beard === 2) partTop(g, () => { g.moveTo(hx - 3, headY + 3); g.quadraticCurveTo(hx + 1, headY + 12, hx + 8, headY + 8); g.lineTo(hx + 9, headY + 4); g.lineTo(hx + 3, headY + 6); g.closePath(); }, G.hair, hx - 3, headY + 3, 12, 9, 0.8);
  // (the possession's tells, painted: horns up through the scalp, the snarl; lumps on the skull, the jaw hanging)
  if (pos === 'demon') {
    for (const [dx, h] of [[-2, 8], [5, 9]] as const) {
      part(g, () => { g.moveTo(hx + dx - 2.8, headY - 8); g.quadraticCurveTo(hx + dx - 2, headY - 8 - h * 0.6, hx + dx + 1, headY - 8 - h); g.quadraticCurveTo(hx + dx + 1, headY - 8 - h * 0.4, hx + dx + 2.8, headY - 8); g.closePath(); }, '#E8DCC0', hx + dx - 3, headY - 8 - h, 6, h, 1);
      R(g, hx + dx - 2, headY - 10, 5, 1, '#8A7A5A');
    }
    // (cracks over the cheek, glowing)
    g.strokeStyle = crackD; g.lineWidth = 1.6; g.beginPath(); g.moveTo(hx - 5, headY + 8); g.lineTo(hx - 2, headY + 3); g.lineTo(hx - 5, headY - 1); g.moveTo(hx + 1, headY + 9); g.lineTo(hx + 3, headY + 5); g.stroke();
    g.strokeStyle = crack; g.lineWidth = 0.8; g.stroke();
    // (the snarl: teeth bared, the gums dark)
    R(g, hx + 2, headY + 4, 8, 5, INK); R(g, hx + 3, headY + 5, 6, 1, '#7F1D1D');
    for (const tx of [3, 5, 7]) { R(g, hx + tx, headY + 5, 1, 2, '#FFF8E8'); R(g, hx + tx, headY + 7, 1, 1, '#E8DCC0'); }
    if (G.beard === 1) R(g, hx + 2, headY + 2, 8, 2, G.hair);
  } else {
    ball(g, hx - 4, headY - 8, 3, mix(skin, '#9BF25E', 0.15), 0.8); ball(g, hx + 2, headY - 10, 2.4, mix(skin, '#9BF25E', 0.15), 0.8);
    g.strokeStyle = '#2F7A12'; g.lineWidth = 1; g.beginPath(); g.moveTo(hx - 5, headY + 8); g.lineTo(hx - 2, headY + 2); g.lineTo(hx - 6, headY - 2); g.moveTo(hx + 2, headY + 9); g.lineTo(hx + 5, headY + 4); g.stroke();
    // (a feeler out of the ear, curling)
    g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.moveTo(hx - 3, headY + 1); g.quadraticCurveTo(hx - 10, headY - 2, hx - 9, headY - 7); g.stroke();
    g.strokeStyle = '#6FBF3A'; g.lineWidth = 1.2; g.stroke(); px(g, hx - 9, headY - 8, 1, 1, '#C8FF9A');
    // (the jaw hanging slack, the tongue, the drool)
    if (G.beard === 1) R(g, hx + 2, headY + 2, 8, 2, G.hair);
    R(g, hx + 3, headY + 4, 6, 7, INK); R(g, hx + 4, headY + 5, 4, 5, '#3A0A14'); R(g, hx + 4, headY + 8, 4, 2, '#9A3A4A');
    R(g, hx + 6, headY + 11, 2, 5, '#9BF25E'); R(g, hx + 6, headY + 16, 2, 2, '#C8FF9A'); R(g, hx + 6, headY + 11, 1, 3, '#E8FFD0');
  }
  // ---- near side: the leg, the arm
  leg(fF, false);
  arm(hF, false);
};
const GUEST_H = (G: Guest) => (G.tall ? 76 : 70);
/** Drawn: stamped (by its look, pose, frame), the eyes' glow and the aura live over it. */
export const drawGuest = (c: Ctx, G: Guest, pos: Possession, pose: GuestPose, f: number) => {
  const moving = pose === 'walk' || pose === 'run';
  const q = moving ? Math.floor(f / (pose === 'run' ? 3 : 5)) % 8 : 0;
  stamp(c, `wp-guest2-${G.seed % 997}-${pos}-${pose}-${q}`, -40, -100, 84, 104, g => paintGuest(g, G, pos, pose, q));
  // (the eyes, lit: red or green, a flicker in them)
  const H = GUEST_H(G), crouch = pose === 'crouch' ? 13 : 0, lean = leanOf(pose);
  const ex = lean + 2 + 4, ey = -H * 0.9 + crouch - 2;
  const col = pos === 'demon' ? '#FF3B1F' : '#7CFF3A', fl = 0.6 + 0.4 * Math.abs(Math.sin(f * 0.37 + G.seed));
  c.globalAlpha = 0.35 * fl; c.fillStyle = col; c.beginPath(); c.arc(ex + 1, ey, 6, 0, Math.PI * 2); c.fill();
  c.globalAlpha = 1; R(c, ex - 1, ey - 1, 2, 2, '#FFFFFF'); R(c, ex + 2, ey - 1, 2, 2, col);
  // (the tell: the glow flares, the whole of them lit)
  if (pose === 'tell' || pose === 'crouch') { c.globalAlpha = 0.18 + 0.12 * Math.sin(f * 0.8); c.fillStyle = col; c.beginPath(); c.ellipse(lean, -H * 0.5, 22, H * 0.55, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
};

// ---------------------------------------------------------------------------------------------------------------
// The gator (possessed, demonic): side on, low, facing right. ~110 long, 26 tall.

const HIDE = '#5A6B2E', HIDE_D = '#3E4A1C', BELLY = '#B8B070';
export type GatorPose = 'walk' | 'tell' | 'lunge' | 'hurt';
const paintGator = (g: Ctx, pose: GatorPose, q: number) => {
  const ph = (q / 8) * Math.PI * 2, open = pose === 'tell' ? 0.5 : pose === 'lunge' ? 0.9 : pose === 'hurt' ? 0.3 : 0.1;
  const tw = Math.sin(ph) * 4;
  // (the legs: the far pair (a step darker), then the body, then the near pair; each two bones, the knee by limb.ts,
  // a splayed foot of claws)
  const leg = (hx: number, k: number, col: string) => {
    const fx = hx + Math.sin(ph + k) * 6 + 4, lift = Math.max(0, -Math.cos(ph + k)) * 2;
    const { end } = limb2(g, [hx, -10], [fx, -lift], 7, 7, 6, 5, col, (a, b, c, d, e, h) => knee(a, b, c, d, e, h, 1));
    R(g, end[0] - 2, end[1] - 2, 8, 3, INK); R(g, end[0] - 1, end[1] - 2, 6, 2, dk(col, 0.1));
    for (const dx of [0, 2, 4]) R(g, end[0] + dx + 2, end[1], 1, 1, '#E8DCC0');
  };
  leg(-10, Math.PI, HIDE_D); leg(20, 0, HIDE_D);
  // (the tail, swinging: its body in steps, the pale underside, the double row of scutes along its top)
  const tail = () => { g.moveTo(-18, -20); g.quadraticCurveTo(-46, -16 + tw, -68, -6 + tw); g.lineTo(-64, -2 + tw); g.quadraticCurveTo(-44, -5, -18, -5); g.closePath(); };
  partTop(g, tail, HIDE, -68, -20, 52, 18, 1.2);
  g.strokeStyle = BELLY; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-20, -6); g.quadraticCurveTo(-44, -6 + tw * 0.5, -62, -3 + tw); g.stroke();
  for (let k = 0; k < 6; k++) { const u = k / 6, x = -22 - u * 40, y = -19 + u * 11 + tw * u * u; tri(g, [[x - 3, y + 1], [x - 1, y - 4 + u * 2], [x + 2, y + 1]], dk(HIDE, 0.25), 0.8); px(g, x - 1, y - 3 + u * 2, 1, 1, lt(HIDE, 0.3)); }
  // (the body: the hide in steps (lit along the top), the belly pale under it; the armor on its back in rows of bumps)
  const body = () => { g.moveTo(-22, -20); g.quadraticCurveTo(0, -29, 26, -21); g.lineTo(31, -8); g.quadraticCurveTo(0, -2, -22, -6); g.closePath(); };
  partTop(g, body, HIDE, -22, -28, 54, 26, 1.4);
  g.save(); g.beginPath(); body(); g.clip();
  R(g, -24, -9, 58, 4, BELLY); R(g, -24, -9, 58, 1, lt(BELLY, 0.3)); dither(g, -24, -11, 58, 2, BELLY);
  for (let x = -18; x < 26; x += 5) R(g, x, -8, 1, 3, dk(BELLY, 0.3));
  g.restore();
  for (let row = 0; row < 2; row++) for (let k = 0; k < 7; k++) {
    const x = -17 + k * 6.5 + row * 3, y = -24 + row * 4 - Math.sin((k / 6) * Math.PI) * 2;
    R(g, x - 1, y, 4, 3, INK); R(g, x, y, 3, 2, dk(HIDE, 0.15)); R(g, x, y, 2, 1, lt(HIDE, 0.25));
  }
  // (the possession: red cracks glowing down its flank)
  g.strokeStyle = '#4A0A06'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(-8, -20); g.lineTo(-4, -15); g.lineTo(-9, -11); g.moveTo(10, -21); g.lineTo(13, -15); g.stroke();
  g.strokeStyle = '#FF6A2A'; g.lineWidth = 0.8; g.stroke();
  // (the head and the jaws, open as much as it's at: the mouth dark red inside, the teeth, the nostrils' knob, the
  // eye's bony bump (the glow's live))
  const a = open * 0.5;
  g.save(); g.translate(28, -14);
  if (open > 0.2) tri(g, [[0, -2], [36 * Math.cos(a), -36 * Math.sin(a) - 1], [34 * Math.cos(a * 0.6), 34 * Math.sin(a * 0.6) + 3]], '#6A1414', 0.8);
  g.save(); g.rotate(a * 0.6);
  partTop(g, () => { g.moveTo(0, 0); g.lineTo(38, 1); g.lineTo(36, 5); g.lineTo(0, 7); g.closePath(); }, lt(HIDE, 0.08), 0, 0, 38, 7, 1);
  R(g, 2, 4, 32, 2, BELLY);
  for (let k = 0; k < 5; k++) { R(g, 8 + k * 6, -2, 2, 3, '#FFF8E0'); R(g, 8 + k * 6, 0, 2, 1, '#D8C8A0'); }
  g.restore();
  g.save(); g.rotate(-a);
  partTop(g, () => { g.moveTo(0, -7); g.quadraticCurveTo(20, -8, 40, -4); g.lineTo(43, 0); g.lineTo(0, 2); g.closePath(); }, HIDE, 0, -8, 43, 10, 1.2);
  for (let k = 0; k < 6; k++) { R(g, 6 + k * 6, 1, 2, 3, '#FFF8E0'); R(g, 6 + k * 6, 3, 2, 1, '#D8C8A0'); }
  ball(g, 39, -5, 2.4, HIDE, 0.8); R(g, 39, -6, 1, 1, INK);
  for (let k = 0; k < 4; k++) R(g, 14 + k * 6, -5, 3, 1, dk(HIDE, 0.3));
  g.restore();
  ball(g, 6, -8, 5, HIDE, 1); R(g, 3, -12, 7, 2, lt(HIDE, 0.25)); R(g, 5, -10, 4, 3, INK);
  g.strokeStyle = '#4A0A06'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(12, -9); g.lineTo(16, -6); g.lineTo(20, -8); g.stroke(); g.strokeStyle = '#FF6A2A'; g.lineWidth = 0.8; g.stroke();
  g.restore();
  // the near legs
  leg(-6, 0, HIDE); leg(24, Math.PI, HIDE);
};
export const drawGator = (c: Ctx, pose: GatorPose, f: number) => {
  const q = pose === 'walk' || pose === 'lunge' ? Math.floor(f / 3) % 8 : 0;
  stamp(c, `wp-gator2-${pose}-${q}`, -72, -40, 150, 46, g => paintGator(g, pose, q));
  const fl = 0.6 + 0.4 * Math.abs(Math.sin(f * 0.3));
  c.globalAlpha = 0.4 * fl; c.fillStyle = '#FF3B1F'; c.beginPath(); c.arc(36, -24, 5, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  R(c, 35, -25, 2, 2, '#FFE0D0');
};

// ---------------------------------------------------------------------------------------------------------------
// The pelican (possessed, alien): side on, facing right; wings up or down.

const PEL = '#ECE6D6', PEL_G = '#9A9484', BILL = '#F2B33D', POUCH = '#E09A3A';
export type PelPose = 'fly' | 'tell' | 'dive' | 'hurt';
const paintPelican = (g: Ctx, pose: PelPose, up: boolean) => {
  const dive = pose === 'dive';
  g.save(); if (dive) g.rotate(0.7);
  /** A wing off the shoulder (sx, sy): its coverts in rows (scalloped, in steps), its long dark flight feathers fanned at
   *  the tip, each lit along its leading edge. */
  const wing = (sx: number, sy: number, col: string, tipCol: string, k: number) => {
    const ty = up ? -30 * k : 18 * k, tx = -34 * k;
    for (let f = 0; f < 5; f++) {
      const ax = sx + tx * (0.75 + f * 0.06) + 6, ay = sy + ty * (0.78 + f * 0.05) + 3;
      jointed(g, [[ax + 8, ay + (up ? 4 : -2)], [ax - 4 + f * 2, ay + (up ? -2 : 3) + f]], [3], [f % 2 ? tipCol : lt(tipCol, 0.12)]);
    }
    partTop(g, () => { g.moveTo(sx + 6, sy); g.quadraticCurveTo(sx - 8, sy + ty * 0.6 - 4, sx + tx, sy + ty); g.lineTo(sx + tx + 10, sy + ty * 0.7 + 6); g.quadraticCurveTo(sx - 4, sy + 8, sx + 10, sy + 6); g.closePath(); }, col, sx + tx, Math.min(sy, sy + ty), 46, Math.abs(ty) + 10, 1.2);
    for (let r = 0; r < 3; r++) for (let j = 0; j < 4; j++) {
      const u = 0.25 + j * 0.17, v = 0.3 + r * 0.18, x = sx + 4 + (tx * u) * (1 - v * 0.3), y = sy + 2 + ty * u * 0.7 + r * 2;
      R(g, x, y, 3, 1, dk(col, 0.25)); R(g, x, y - 1, 2, 1, lt(col, 0.2));
    }
  };
  // far wing
  wing(-2, -4, PEL_G, '#2E2A20', 0.85);
  // (the tail's stub of feathers)
  tri(g, [[-14, -2], [-24, -4], [-22, 3], [-13, 3]], PEL_G, 1);
  // body, neck, head (its yellow crest), the big bill (hooked red at the tip) and its pouch (bulging: something green
  // moving in it, veined green; lit up green on the tell)
  partTop(g, () => g.ellipse(0, 0, 16, 9, 0, 0, Math.PI * 2), PEL, -16, -9, 32, 18, 1.2);
  R(g, -10, 4, 18, 2, dk(PEL, 0.18));
  jointed(g, [[10, -4], [14, -11], [16, -16]], [6, 5], [PEL, PEL]);
  part(g, () => g.ellipse(18, -18, 6.5, 5.5, 0, 0, Math.PI * 2), PEL, 11, -24, 14, 11, 1);
  tri(g, [[13, -22], [10, -27], [16, -23]], '#F5D27A', 0.8); tri(g, [[15, -23], [14, -28], [18, -23]], '#F5D27A', 0.8);
  const pouchCol = pose === 'tell' ? '#9BF25E' : POUCH;
  part(g, () => { g.moveTo(22, -15); g.quadraticCurveTo(28, -3, 38, -6); g.quadraticCurveTo(44, -8, 46, -13); g.closePath(); }, pouchCol, 22, -15, 24, 12, 1);
  ball(g, 31, -8, 2.6, mix(pouchCol, '#5E9A4A', 0.5), 0.6); ball(g, 37, -9, 2, mix(pouchCol, '#5E9A4A', 0.5), 0.6);
  g.strokeStyle = '#2F7A12'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(25, -13); g.lineTo(29, -9); g.lineTo(34, -11); g.moveTo(36, -12); g.lineTo(41, -10); g.stroke();
  partTop(g, () => { g.moveTo(22, -20); g.lineTo(46, -17); g.quadraticCurveTo(50, -16, 48, -12); g.lineTo(46, -13); g.lineTo(22, -15); g.closePath(); }, BILL, 22, -20, 28, 8, 1);
  R(g, 45, -15, 3, 3, '#C2410C'); R(g, 24, -17, 20, 1, dk(BILL, 0.3));
  R(g, 17, -22, 4, 3, INK);
  // (the feet tucked: webbed, orange)
  jointed(g, [[-4, 7], [-10, 10], [-14, 11]], [2.2, 2], [BILL, BILL]);
  tri(g, [[-14, 9], [-18, 12], [-13, 13]], POUCH, 0.6);
  // near wing
  wing(2, -6, lt(PEL_G, 0.1), '#3A3428', 1);
  g.restore();
};
export const drawPelican = (c: Ctx, pose: PelPose, f: number) => {
  const up = pose === 'dive' ? true : Math.floor(f / 7) % 2 === 0;
  stamp(c, `wp-pel2-${pose}-${up ? 1 : 0}`, -44, -48, 100, 76, g => paintPelican(g, pose, up));
  if (pose !== 'dive') { c.globalAlpha = 0.5; c.fillStyle = '#7CFF3A'; c.beginPath(); c.arc(19.5, -20, 3.5, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
};

// ---------------------------------------------------------------------------------------------------------------
// The hover alien: one of Zorblax's people stood on a hover disc (its glow under it, live)

const CHROME = '#A8AEBC';
const paintDisc = (g: Ctx) => {
  // (the underside: the hull dished, its emitter ring; the top deck in its chrome steps, lit along the left; the rim's
  // band and its light sockets (the lights going round over them, live); a scuffed tread plate where he stands)
  part(g, () => g.ellipse(0, 4, 26, 6, 0, 0, Math.PI * 2), dk(CHROME, 0.45), -26, -2, 52, 12, 1.2);
  ball(g, 0, 8, 5, '#2A3A20', 1); R(g, -3, 8, 6, 2, '#7CFF3A'); R(g, -2, 8, 3, 1, '#E8FFD0');
  part(g, () => g.ellipse(0, 1, 33, 6, 0, 0, Math.PI * 2), CHROME, -33, -5, 66, 12, 1.4);
  partTop(g, () => g.ellipse(0, -1, 27, 3.6, 0, 0, Math.PI * 2), lt(CHROME, 0.15), -27, -5, 54, 8, 1);
  R(g, -31, 2, 62, 2, dk(CHROME, 0.3)); R(g, -30, 4, 60, 1, dk(CHROME, 0.5));
  for (let k = 0; k < 7; k++) { const x = -24 + k * 8; R(g, x, 2, 3, 2, INK); }
  dither(g, -10, -3, 20, 3, dk(CHROME, 0.15));
  R(g, -18, -2, 6, 1, '#FFFFFF');
};
export const drawHover = (c: Ctx, look: AlienLook, pose: AlienPose, f: number) => {
  // (the disc: a chrome dish, its lights going round, the glow under it)
  c.globalAlpha = 0.25 + 0.1 * Math.sin(f * 0.3); c.fillStyle = '#7CFF3A'; c.beginPath(); c.ellipse(0, 12, 30, 8, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  stamp(c, 'wp-disc2', -36, -8, 72, 22, paintDisc);
  for (let k = 0; k < 5; k++) { const a = f * 0.15 + k * 1.26, x = Math.cos(a) * 26; if (Math.sin(a) > 0) R(c, x - 1, 3, 3, 2, k % 2 ? '#F9A8D4' : '#7CFF3A'); }
  c.save(); c.translate(0, -2); drawAlien(c, look, pose, f, 0.72); c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The yeti mascot (a fur suit, possessed): big, facing right. ~120 tall. Poses: walk (8), tell (both arms up), pound
// (the fists down on the floor), punch, hurt.

const FUR = '#DCE2EC', FUR_F = '#B4BED0';
export type YetiPose = 'stand' | 'walk' | 'tell' | 'pound' | 'punch' | 'hurt';
/** Fur's ragged edge along a run of points: tufts out from it, in its steps. */
const tufts = (g: Ctx, pts: P[], col: string, len = 5) => {
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1], dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1, nx = dy / d, ny = -dx / d;
    for (let s = 0; s < d; s += 6) {
      const x = ax + (dx * s) / d, y = ay + (dy * s) / d;
      tri(g, [[x, y], [x + nx * len * 0.7 + (dx / d) * 2, y + ny * len * 0.7 + (dy / d) * 2], [x + (dx / d) * 5, y + (dy / d) * 5]], dk(col, 0.14), 0);
    }
  }
};
const paintYeti = (g: Ctx, pose: YetiPose, q: number) => {
  // (front-on: a cartoon suit faces the crowd; joints by elbowFront / kneeFront, out to its sides)
  const ph = (q / 8) * Math.PI * 2, walk = pose === 'walk';
  const crouch = pose === 'pound' ? 16 : 0;
  const hipY = -52 + crouch, shY = -98 + crouch, headY = -114 + crouch;
  const lift = (s: number) => (walk ? Math.max(0, Math.sin(ph + (s > 0 ? 0 : Math.PI))) * 10 : 0);
  const foot = (s: number): P => [s * (crouch ? 24 : 16), -lift(s)];
  const hand = (s: number): P => pose === 'tell' ? [s * 30, shY - 50] : pose === 'pound' ? [s * 12, -10] : pose === 'punch' ? (s > 0 ? [62, shY - 4] : [-36, shY + 30]) : pose === 'hurt' ? [s * 26, headY - 10] : [s * 42 + (walk ? Math.sin(ph) * s * 6 : 0), shY + 48];
  const leg = (s: number) => {
    const col = s < 0 ? FUR_F : FUR, hip: P = [s * 13, hipY], f = foot(s);
    const { j, end } = limb2(g, hip, [f[0], f[1] - 6], 26, 26, 17, 15, col, (a, b, c, d, e, h) => kneeFront(a, b, c, d, e, h, s));
    tufts(g, [[j[0] + s * 7, j[1] - 4], [end[0] + s * 6, end[1] - 2]], col, 4);
    // (the big foot: the sole's dark pad, three toes in front)
    part(g, () => g.ellipse(end[0] + s * 3, end[1] + 2, 13, 6.5, 0, 0, Math.PI * 2), dk(col, 0.08), end[0] + s * 3 - 13, end[1] - 4, 26, 13, 1.4);
    R(g, end[0] + s * 3 - 10, end[1] + 6, 20, 2, '#6A7488');
    for (const dx of [-7, 0, 7]) { R(g, end[0] + s * 3 + dx - 2, end[1] + 1, 4, 4, INK); R(g, end[0] + s * 3 + dx - 1, end[1] + 1, 2, 2, lt(col, 0.35)); }
  };
  const arm = (s: number) => {
    const col = s < 0 ? FUR_F : FUR, sh: P = [s * 30, shY], h = hand(s);
    const { j, end } = limb2(g, sh, h, 26, 26, 15, 14, col, (a, b, c, d, e, hh) => elbowFront(a, b, c, d, e, hh, s));
    tufts(g, [[sh[0] + s * 7, sh[1]], [j[0] + s * 7, j[1]], [end[0] + s * 6, end[1]]], col, 4);
    // (the mitt: a fat fur paw, its black claws)
    part(g, () => g.ellipse(end[0], end[1], 10, 9, 0, 0, Math.PI * 2), col, end[0] - 10, end[1] - 9, 20, 18, 1.4);
    for (const dx of [-5, 0, 5]) { R(g, end[0] + dx - 1, end[1] + 6, 2, 4, INK); R(g, end[0] + dx - 1, end[1] + 6, 1, 1, '#6A6E78'); }
    R(g, end[0] - 6, end[1] - 6, 5, 2, lt(col, 0.5));
  };
  leg(-1); leg(1);
  // the body: a fur barrel in its steps, tufts round its edge; the belly patch (dingy, a stain); the burst zipper (its
  // teeth, the split dark inside, a red glow from in there: live over it), the seams torn, stuffing out
  const by = (hipY + shY) / 2;
  part(g, () => g.ellipse(0, by, 33, 33, 0, 0, Math.PI * 2), FUR, -33, by - 33, 66, 66, 1.6);
  const ring: P[] = Array.from({ length: 14 }, (_, i) => { const a = Math.PI * (0.55 + (i / 13) * 0.9); return [Math.cos(a) * 33, by + Math.sin(a) * 33]; });
  tufts(g, ring, FUR, 5); tufts(g, ring.map(([x, y]) => [-x, y] as P).reverse(), FUR, 5);
  part(g, () => g.ellipse(2, by + 6, 20, 22, 0, 0, Math.PI * 2), '#EEF0E4', -18, by - 16, 40, 44, 1);
  dither(g, 6, by + 10, 10, 8, '#C8C0A0');
  for (let k = 0; k < 6; k++) { R(g, 0, shY + 6 + k * 7, 4, 3, INK); R(g, 1, shY + 6 + k * 7, 2, 2, '#B8BCC4'); }
  tri(g, [[-3, shY + 28], [9, shY + 20], [7, shY + 46], [1, shY + 40]], '#1A0604', 1);
  tri(g, [[0, shY + 31], [6, shY + 25], [5, shY + 40]], '#6A0A06', 0);
  for (const [x, y] of [[-20, by - 12], [24, by + 6]] as const) { R(g, x - 1, y - 1, 8, 3, INK); R(g, x, y, 6, 1, '#F8F6EE'); dither(g, x - 2, y + 2, 8, 3, '#F8F6EE'); }
  // the arms (both out to the sides; the punch's in front, over the body)
  if (pose !== 'punch') { arm(-1); arm(1); } else arm(-1);
  // the head: the cartoon yeti's big round head in its steps, tufted; its grin (the teeth), the plastic dome eyes (the
  // glow's live), the horns burst up through it (the fur torn round them), the toque (striped, its cuff, the pompom)
  part(g, () => g.ellipse(0, headY, 25, 23, 0, 0, Math.PI * 2), FUR, -25, headY - 23, 50, 46, 1.6);
  tufts(g, Array.from({ length: 8 }, (_, i) => { const a = Math.PI * (0.6 + (i / 7) * 0.8); return [Math.cos(a) * 25, headY + Math.sin(a) * 23] as P; }), FUR, 4);
  part(g, () => g.ellipse(0, headY + 6, 16, 11, 0, 0, Math.PI * 2), '#C8D0DC', -16, headY - 5, 32, 22, 1);
  flat(g, () => { g.moveTo(-18, headY + 4); g.quadraticCurveTo(0, headY + 23, 18, headY + 4); g.quadraticCurveTo(0, headY + 12, -18, headY + 4); g.closePath(); }, '#3A0A14', 1);
  R(g, -8, headY + 13, 16, 3, '#7A2030');
  for (let k = 0; k < 5; k++) { R(g, -12 + k * 6, headY + 6, 4, 4, INK); R(g, -12 + k * 6, headY + 6, 3, 3, '#FFF8EE'); R(g, -12 + k * 6, headY + 8, 3, 1, '#D8D0C0'); }
  ball(g, -1, headY - 1, 3.5, '#4A5468', 1); R(g, -2, headY - 3, 2, 1, '#A8B0C0');
  for (const ex of [-7, 7]) { ball(g, ex, headY - 6, 6.5, '#F4F4F0', 1.2); R(g, ex - 3, headY - 10, 3, 2, '#FFFFFF'); R(g, ex - 2, headY - 7, 5, 4, '#2A0604'); }
  for (const dx of [-16, 16]) {
    const s = dx < 0 ? -1 : 1;
    part(g, () => { g.moveTo(dx - 5, headY - 15); g.quadraticCurveTo(dx + s * 2, headY - 26, dx + s * 8, headY - 36); g.quadraticCurveTo(dx + s * 4, headY - 24, dx + 5, headY - 15); g.closePath(); }, '#8A0E0A', dx - 6, headY - 36, 14, 22, 1);
    R(g, dx - 4, headY - 17, 8, 2, '#3A0604'); for (const tx of [-4, 3]) R(g, dx + tx, headY - 19, 2, 2, FUR);
  }
  partTop(g, () => { g.moveTo(-21, headY - 13); g.quadraticCurveTo(0, headY - 38, 21, headY - 13); g.closePath(); }, '#2563EB', -21, headY - 34, 42, 21, 1.2);
  R(g, -14, headY - 25, 28, 3, '#DC2626'); R(g, -9, headY - 30, 18, 2, '#F8FAFC');
  part(g, () => g.roundRect(-21, headY - 17, 42, 6, 2), '#F1F5F9', -21, headY - 17, 42, 6, 1);
  for (let x = -18; x < 20; x += 4) R(g, x, headY - 16, 1, 4, '#C8D0DC');
  ball(g, 0, headY - 33, 5.5, '#F8FAFC', 1);
  if (pose === 'punch') arm(1);
};
export const drawYeti = (c: Ctx, pose: YetiPose, f: number) => {
  const q = pose === 'walk' ? Math.floor(f / 5) % 8 : 0;
  stamp(c, `wp-yeti2-${pose}-${q}`, -60, -160, 130, 166, g => paintYeti(g, pose, q));
  const crouch = pose === 'pound' ? 16 : 0, fl = 0.6 + 0.4 * Math.abs(Math.sin(f * 0.31));
  for (const ex of [-7, 7]) { c.globalAlpha = 0.45 * fl; c.fillStyle = '#FF3B1F'; c.beginPath(); c.arc(ex, -120 + crouch, 5, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; R(c, ex - 1, -121 + crouch, 3, 3, '#FFE0D0'); }
  c.globalAlpha = 0.4 * fl; c.fillStyle = '#FF3B1F'; c.beginPath(); c.ellipse(3, -62 + crouch, 4, 10, 0.3, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
};

// (dev only: the figures painted on their own, for their contact sheets)
if (import.meta.env.DEV && typeof window !== 'undefined') (window as unknown as { __wpKindArt: unknown }).__wpKindArt = { paintGuest, guestOf, paintGator, paintPelican, paintYeti, paintDisc, drawAlien, ramp };
