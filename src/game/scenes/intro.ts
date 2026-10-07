// The opening, drawn the ending's way (SNES-style pixel art on a 256x144 canvas): Meathead
// benching in a dingy gym at five in the morning, two men in black suits in the doorway,
// the one who does the talking up close, Meathead trotting after them down a government
// corridor, and the briefing room: a projector, a screen, a man with a pointer, and the
// back of Meathead's head.

import { ART_W, ART_H, C, R, ell, hash, figure, over, rimLight, mhStandingFig, FIG_INK, DENIM, BELT, BOOT } from './ending';
import { agentFig, agentTalk, agentBlur, pencilFig, pencilBlur, DOOR_RIM, SUIT, CHEAP, PSKIN, PHAIR } from './suits';
import { painting, bayer } from './art/raster';
import { shatPants, shatFront, shatCloseUp } from './shatLook';
import { shaded, layer, ball, bands, RAMP } from './art/snes';

type Ctx = CanvasRenderingContext2D;

const G = {
  brick: '#5c1c14', brick2: '#401008', mortar: '#2c0c08', floor: '#181818', floor2: '#262626', mirror: '#4c6c7c', mirrorLit: '#7c9cac',
  rack: '#3c3c3c', plate: '#1c1c1c', plateRim: '#5c5c5c', bench: '#881400', benchDark: '#581000', tube: '#fcfcf0',
  suit: '#0c0c10', suitLit: '#24242c', shirt: '#e8e8e8', skin: '#e8c4a0', skinShade: '#c09470', shades: '#040404', glint: '#fcfcfc',
  hall: '#6c7470', hall2: '#545c58', hallFloor: '#3c403c', door: '#2c3430', dark: '#08080a', screen: '#dcdcd0', beam: 'rgba(252, 252, 220, 0.10)',
};

const text = (ctx: Ctx, s: string, x: number, y: number, color: string, size = 8, align: CanvasTextAlign = 'center') => {
  ctx.fillStyle = color; ctx.font = `bold ${size}px monospace`; ctx.textAlign = align;
  ctx.fillText(s, x, y); ctx.textAlign = 'left';
};

/** The gym: brick, a strip of mirror, a rack of dumbbells, a sign, rubber floor, a door on the right. */
export const gymBg = (ctx: Ctx) => layer(ctx, 'gym', ART_W, ART_H, g => gymBgOnce(g));

const gymBgOnce = (ctx: Ctx) => {
  // Brick: every one its own shade, a lit top edge and a shadowed bottom one; darker away from the tube light
  R(ctx, 0, 0, ART_W, ART_H, G.mortar);
  const BR = ['#3c0c06', '#4c140c', '#5c1c14', '#6c2418', '#7c2c1c'];
  for (let y = 0; y < 112; y += 8) {
    for (let x = (y / 8) % 2 ? -10 : 0; x < ART_W; x += 20) {
      const lit = Math.max(0, 1 - Math.abs(x + 9 - 110) / 150) * (1 - y / 160);
      const i = Math.max(0, Math.min(4, Math.round(lit * 3 + hash(x * 7 + y) * 1.4)));
      R(ctx, x + 1, y + 1, 19, 7, BR[i]);
      R(ctx, x + 1, y + 1, 19, 1, BR[Math.min(4, i + 1)]);
      R(ctx, x + 1, y + 7, 19, 1, BR[Math.max(0, i - 1)]);
    }
  }
  for (let i = 0; i < 30; i++) R(ctx, hash(i) * ART_W, hash(i + 50) * 110, 6, 3, G.brick2);
  // The mirror, and the sign over it (the room in it, dim; streaks of light down it)
  bands(ctx, 8, 30, 150, 50, ['#6c8c9c', '#5c7c8c', '#4c6c7c', '#3c5c6c', '#34505c']);
  for (let k = 0; k < 6; k++) { R(ctx, 20 + k * 26, 30, 2, 50, G.mirrorLit); R(ctx, 22 + k * 26, 30, 1, 50, 'rgba(255,255,255,0.12)'); }
  R(ctx, 8, 29, 150, 1, '#8c8c8c'); R(ctx, 8, 80, 150, 1, '#1c1c1c');
  R(ctx, 30, 8, 110, 16, C.ink); R(ctx, 31, 9, 108, 14, C.darkRed);
  text(ctx, 'THE IRON PIT', 85, 19, C.gold);
  // A poster: NO PAIN NO GAIN
  R(ctx, 170, 14, 34, 42, C.white); R(ctx, 172, 16, 30, 20, C.red);
  text(ctx, 'NO PAIN', 187, 45, C.ink, 6); text(ctx, 'NO GAIN', 187, 53, C.ink, 6);
  // The door (shut)
  R(ctx, 214, 30, 38, 82, G.door); R(ctx, 216, 32, 34, 78, '#3c4840'); R(ctx, 244, 70, 3, 4, C.gold);
  // Dumbbell rack along the bottom of the mirror
  R(ctx, 10, 86, 146, 4, G.rack);
  for (let k = 0; k < 9; k++) { const x = 16 + k * 16; ell(ctx, x, 84, 4, 4, G.plate); ell(ctx, x + 8, 84, 4, 4, G.plate); R(ctx, x, 83, 8, 2, G.rack); }
  // Floor: rubber tiles, flecked, a chalk handprint or two; lighter under the light
  bands(ctx, 0, 112, ART_W, 32, ['#262626', '#202020', '#1a1a1a', '#141414']);
  ctx.fillStyle = 'rgba(252, 252, 220, 0.05)'; ctx.beginPath(); ctx.ellipse(110, 126, 70, 12, 0, 0, Math.PI * 2); ctx.fill();
  for (let x = 0; x < ART_W; x += 32) R(ctx, x, 112, 1, 32, G.floor2);
  R(ctx, 0, 127, ART_W, 1, G.floor2);
  for (let i = 0; i < 60; i++) R(ctx, hash(i * 4.1) * ART_W, 113 + hash(i * 6.3) * 30, 1, 1, i % 4 ? '#303030' : '#4a4a4a');
  R(ctx, 30, 136, 4, 2, '#d4d4cc'); R(ctx, 29, 134, 1, 2, '#d4d4cc'); R(ctx, 31, 133, 1, 2, '#d4d4cc'); R(ctx, 33, 134, 1, 2, '#d4d4cc');
  // A kettlebell, the chalk bucket, his jug of water (a gallon of it, half gone)
  ell(ctx, 180, 136, 7, 6, '#1c1c1c'); R(ctx, 176, 127, 8, 2, '#1c1c1c'); R(ctx, 175, 127, 2, 5, '#1c1c1c'); R(ctx, 183, 127, 2, 5, '#1c1c1c'); R(ctx, 177, 133, 3, 2, '#3c3c3c');
  R(ctx, 12, 124, 14, 14, '#dcdcd0'); R(ctx, 12, 124, 14, 2, '#f8f8f0'); R(ctx, 14, 128, 10, 3, C.red);
  R(ctx, 196, 116, 12, 20, 'rgba(200, 230, 250, 0.35)'); R(ctx, 196, 124, 12, 12, 'rgba(120, 180, 230, 0.5)'); R(ctx, 199, 112, 6, 4, '#e8e8e8'); R(ctx, 196, 116, 1, 20, 'rgba(255,255,255,0.6)');
  // (the mirror catching the room: a smear, a crack across one corner)
  R(ctx, 120, 34, 30, 1, '#8cacbc'); for (let k = 0; k < 10; k++) R(ctx, 146 - k * 2, 30 + k * 2, 1, 2, '#2c3c44');
};

/** A flickering tube light up top. */
const tubeLight = (ctx: Ctx, t: number, x: number) => {
  const on = !(hash(Math.floor(t / 6)) > 0.93);
  R(ctx, x, 2, 40, 3, on ? G.tube : '#7c7c70');
  if (on) for (let k = 0; k < 4; k++) { const sp = 1 - k * 0.22; ctx.fillStyle = 'rgba(252, 252, 220, 0.035)'; ctx.beginPath(); ctx.moveTo(x + 20 - 20 * sp, 5); ctx.lineTo(x + 20 + 20 * sp, 5); ctx.lineTo(x + 20 + 60 * sp, 144); ctx.lineTo(x + 20 - 60 * sp, 144); ctx.fill(); }
};

/** The bench, painted once: the pad (red vinyl, stitched, his sweat on it), its frame and feet, the rack's upright and its hook, a towel over the end. */
const benchFig = figure('gym-bench', ART_W, ART_H, 0, 0, q => {
  const St = RAMP.steel, Rd = RAMP.red, I = FIG_INK;
  // The rack's upright and its hook
  q.form(g => { g.rect(76, 72, 3, 34); }, { ramp: St, bevel: 1.2, amb: 0.2, ink: I });
  q.form(g => { g.moveTo(71, 69); g.lineTo(80, 69); g.lineTo(80, 73); g.lineTo(74, 73); g.lineTo(74, 71); g.lineTo(71, 71); g.closePath(); }, { ramp: St, bevel: 1, amb: 0.2, ink: I });
  // The legs and their feet
  for (const x of [66, 140]) {
    q.form(g => { g.rect(x, 114, 4, 20); }, { ramp: St, bevel: 1.5, amb: 0.2, ink: I });
    q.form(g => { g.roundRect(x - 5, 133, 14, 3, 1); }, { ramp: St, bevel: 1, amb: 0.2, ink: I });
  }
  q.form(g => { g.rect(60, 112, 90, 3); }, { ramp: St, bevel: 1, amb: 0.15, ink: I });
  // The pad: red vinyl, rounded over, the stitching along its side, a crack in it
  q.form(g => { g.roundRect(59, 104, 92, 9, 3); }, { ramp: Rd, bevel: 3, amb: 0.18, ink: I, spec: '#fcb8a0', wet: 0.35 });
  for (let x = 63; x < 148; x += 3) q.px(x, 110, Rd[1]);
  q.line(112, 106, 116, 107, Rd[1]);
  // (his sweat on the pad)
  q.line(96, 112, 105, 112, '#9cdcfc'); q.px(98, 112, '#e8f8ff');
  // The towel, over the end
  q.form(g => { g.moveTo(133, 103); g.lineTo(148, 103); g.lineTo(149, 117); g.lineTo(145, 116); g.lineTo(141, 118); g.lineTo(136, 116); g.lineTo(133, 117); g.closePath(); }, { ramp: ['#7c7c74', '#a4a49a', '#c8c8bc', '#e4e4d8', '#f8f8ee'], bevel: 2.5, amb: 0.25, ink: I });
  q.line(138, 105, 139, 115, '#a4a49a'); q.line(144, 104, 145, 114, '#a4a49a');
});

/**
 * Meathead on his back on the bench, side on, his head at the rack end (painted once, each way): the boots planted, the
 * jeans, the belt; the torso, the pec puffed up over it, the abs along the top; the delt; the neck, the head: flat on
 * the bench, the flat-top toward the rack, his face up, the eye screwed shut, the teeth gritted, a vein in his temple;
 * or (`look`) the bar racked, his head up off the bench looking at the door, his arm down along his side.
 */
const bencherFig = (look: boolean) => figure(`gym-bencher-${look ? 1 : 0}`, ART_W, ART_H, 0, 0, q => {
  const S = RAMP.mSkin, I = FIG_INK;
  // The far leg (a step behind), then the near: the thigh up off the end, the knee, the shin down to the boot
  for (const far of [1, 0]) {
    const dx = far ? -3 : 0, amb = far ? 0.06 : 0.16, gain = far ? 0.8 : 1;
    q.form(g => { g.moveTo(122, 95); g.lineTo(148 + dx, 94); g.bezierCurveTo(154 + dx, 93.5, 157 + dx, 96, 157 + dx, 100); g.lineTo(156 + dx, 104); g.lineTo(122, 106); g.closePath(); },
      { ramp: DENIM, bevel: 3.5, amb, gain, ink: I, inkIn: DENIM[0] });
    q.form(g => { g.moveTo(149 + dx, 99); g.lineTo(157 + dx, 99); g.lineTo(157.5 + dx, 129); g.lineTo(150.5 + dx, 129); g.closePath(); }, { ramp: DENIM, bevel: 3, amb, gain, ink: I, inkIn: DENIM[0] });
    if (!far) { q.line(130, 96, 148, 95, DENIM[5]); q.line(151, 102, 151, 127, DENIM[2]); q.line(150, 126, 157, 126, DENIM[1]); q.line(152, 100, 156, 101, DENIM[1]); }
    q.form(g => { g.moveTo(148 + dx, 128); g.lineTo(158 + dx, 128); g.lineTo(165 + dx, 132); g.lineTo(165 + dx, 135); g.lineTo(147 + dx, 135); g.closePath(); }, { ramp: BOOT, bevel: 2, amb, gain, ink: I });
    if (!far) { q.line(149, 129, 158, 129, BOOT[4]); q.px(163, 133, '#94a3b8'); }
  }
  // The belt round his waist (the buckle on top)
  q.form(g => { g.rect(119, 94, 6, 12); }, { ramp: BELT, bevel: 1.5, amb: 0.3, ink: I });
  q.form(g => { g.rect(118.5, 91.5, 7, 4); }, { ramp: RAMP.gold, bevel: 1.5, ink: '#5c3c00', spec: '#fffff0', wet: 0.6 });
  // The torso: the lats down on the pad, the pec puffed up over the chest, the abs along to the belt
  q.form(g => { g.moveTo(80, 106); g.lineTo(80, 95); g.bezierCurveTo(83, 89, 90, 86, 98, 86.5); g.bezierCurveTo(106, 87, 110, 89.5, 111, 92.5); g.lineTo(119, 94); g.lineTo(119, 106); g.closePath(); },
    { ramp: S, bevel: 6, amb: 0.14, ink: I, inkIn: S[1] });
  // (the pec's edge, shadowed under; the abs, each lit on top; the serratus; the vein)
  q.line(99, 92, 110, 93, S[2]); q.line(99, 91, 108, 91, S[3]); q.line(88, 88, 100, 87.5, S[7]);
  for (const x of [112, 115, 118]) { q.px(x, 95, S[6]); q.px(x + 1, 95, S[6]); q.px(x + 2, 96, S[3]); }
  q.line(96, 99, 110, 100, S[3]); q.line(97, 98, 108, 98, S[5]);
  q.line(84, 104, 116, 104, S[2]);
  q.px(92, 92, '#c96b4b'); q.px(93, 93, '#c96b4b'); q.px(95, 93, '#c96b4b'); q.px(96, 94, '#c96b4b');
  if (look) {
    // The arm down along his side, the fist by his hip
    q.stroke(g => { g.moveTo(88, 97); g.lineTo(101, 100); }, 7, { ramp: S, bevel: 3, amb: 0.2, ink: I, inkIn: S[1] });
    q.stroke(g => { g.moveTo(101, 100); g.lineTo(111, 101); }, 5.5, { ramp: S, bevel: 2.5, amb: 0.2, ink: I, inkIn: S[1] });
    q.form(g => { g.rect(110, 98, 3, 6); }, { ramp: BOOT, bevel: 1, amb: 0.3, ink: I });
    q.form(g => { g.ellipse(116, 101, 3.5, 3.2, 0, 0, Math.PI * 2); }, { ramp: S, bevel: 2, amb: 0.2, ink: I });
    q.line(91, 95, 99, 97, S[6]);
  }
  // The delt, capped round over the shoulder
  q.form(g => { g.ellipse(88, 96, 6, 5, 0, 0, Math.PI * 2); }, { ramp: S, bevel: 3, amb: 0.2, ink: I, inkIn: S[2] });
  q.px(86, 93, S[7]); q.px(87, 93, S[7]);
  if (!look) {
    // The neck, thick, down to the pad; the head on its back, the flat-top toward the rack, his face up: the brow, the
    // nose up, the lips skinned back off his teeth, the chin, the jaw
    q.form(g => { g.rect(78, 95, 7, 11); }, { ramp: S, bevel: 2, amb: 0.15, ink: null });
    q.form(g => {
      g.moveTo(63, 106); g.lineTo(63, 93); g.bezierCurveTo(64, 91, 66, 90, 69, 90); g.lineTo(71, 89.5); g.lineTo(72.5, 91); g.lineTo(74, 88.5); g.lineTo(75.5, 85);
      g.lineTo(77, 85); g.lineTo(77.5, 89.5); g.lineTo(79, 90); g.lineTo(82, 90); g.lineTo(84, 91.5); g.lineTo(85, 96); g.lineTo(84, 106); g.closePath();
    }, { ramp: S, bevel: 4, amb: 0.2, ink: I, inkIn: S[1] });
    // (the flat-top: its flat toward the rack, the bristles standing out of it, the light along its top)
    q.form(g => { g.moveTo(58, 89); g.lineTo(66, 89); g.lineTo(67, 91); g.lineTo(64.5, 92); g.lineTo(64.5, 104); g.lineTo(58, 104); g.closePath(); }, { ramp: RAMP.mHair, bevel: 2, amb: 0.25, ink: I });
    for (let y = 91; y < 104; y += 2) { q.line(59, y, 62, y, '#2a2a32'); q.px(58, y, '#3a3a44'); }
    q.line(59, 90, 66, 90, '#5a5a68');
    // (the eye screwed shut, the creases off it; the brow down over it)
    q.line(69, 93, 72, 92.5, I); q.px(68, 94, S[2]); q.px(68, 92, S[2]); q.px(73, 94, S[3]);
    q.line(68, 90.5, 71, 90.5, '#2a1a10');
    // (the nose lit along its top; the nostril)
    q.px(75, 86, S[7]); q.px(76, 86, S[7]); q.px(74, 88, S[6]); q.px(77, 88, S[2]);
    // (the teeth gritted, bared between the lips; the chin; the jaw's line; the stubble)
    q.line(79, 90, 81, 90, '#f4ecdc'); q.px(80, 90, '#c8bca8'); q.px(78, 90, '#7a1e10'); q.px(82, 90, '#7a1e10');
    q.line(80, 95, 83, 98, S[2]); q.px(83, 92, S[6]);
    for (const [x, y] of [[80, 93], [82, 94], [81, 96], [78, 93], [83, 95]]) q.px(x, y, '#8c5c30');
    // (the ear; the vein standing up in his temple)
    q.form(g => { g.ellipse(70, 99, 2.2, 3, 0, 0, Math.PI * 2); }, { ramp: S, bevel: 1.5, amb: 0.25, ink: null });
    q.px(70, 99, S[2]); q.px(70, 100, S[2]); q.px(69, 97, S[7]); q.px(71, 102, S[2]);
    for (const [x, y] of [[66, 92], [66, 93], [67, 94], [67, 95], [66, 96]]) q.px(x, y, '#c0402c');
  } else {
    // The head up off the bench, looking at the door: the neck craned up, the flat-top flat on top, his face to the right
    q.form(g => { g.moveTo(69, 96); g.lineTo(79, 95); g.lineTo(87, 100); g.lineTo(86, 106); g.lineTo(72, 106); g.closePath(); }, { ramp: S, bevel: 3, amb: 0.15, ink: I, inkIn: S[1] });
    q.form(g => {
      g.moveTo(61, 85); g.lineTo(77, 85); g.lineTo(78, 88); g.lineTo(80.5, 91); g.lineTo(78.5, 92); g.lineTo(78.5, 95);
      g.lineTo(77.5, 97.5); g.lineTo(70, 99); g.lineTo(62, 96); g.closePath();
    }, { ramp: S, bevel: 4, amb: 0.2, ink: I, inkIn: S[1] });
    q.form(g => { g.rect(60, 80, 18, 6); }, { ramp: RAMP.mHair, bevel: 2, amb: 0.25, ink: I });
    for (let x = 61; x < 77; x++) { q.px(x, 81, x < 69 ? '#5a5a68' : '#44444e'); if ((x & 1) === 0) q.line(x, 82, x, 84, '#2a2a32'); }
    q.form(g => { g.ellipse(66, 91, 2.2, 3, 0, 0, Math.PI * 2); }, { ramp: S, bevel: 1.5, amb: 0.2, ink: I });
    q.px(66, 91, S[2]);
    // (the brow, the eye wide, looking at the door; the nose; the mouth hanging open; the stubble)
    q.line(72, 87, 77, 87, I); q.px(74, 89, '#f4ece0'); q.px(75, 89, '#f4ece0'); q.px(76, 89, I); q.px(76, 90, I);
    q.px(79, 90, S[6]); q.px(78, 91, S[3]);
    q.line(76, 94, 78, 94, '#3a0606'); q.px(77, 93, '#f4ecdc');
    for (const [x, y] of [[70, 96], [72, 97], [74, 96], [76, 96], [69, 94]]) q.px(x, y, '#8c5c30');
  }
});

/** His near arm up to the bar (`len` from the shoulder to his grip): the bicep and the tricep, the forearm, its vein, the wristband. Anchored at the shoulder. */
const pressArm = (len: number) => figure(`gym-press-${len}`, 24, 48, 12, 44, q => {
  const S = RAMP.mSkin, I = FIG_INK, mid = -Math.round(len * 0.5);
  q.stroke(g => { g.moveTo(1, mid); g.lineTo(1, -len); }, 7, { ramp: S, bevel: 2.5, amb: 0.2, ink: I, inkIn: S[1] });
  q.stroke(g => { g.moveTo(0, 0); g.lineTo(1, mid); }, 9.5, { ramp: S, bevel: 3.5, amb: 0.2, ink: I, inkIn: S[1], gain: 1.05 });
  q.line(-1, -2, 0, mid + 2, S[7]); q.line(3, -2, 3, mid + 1, S[2]);
  for (let y = mid - 2; y > -len + 3; y -= 2) q.px(-1 + ((y & 2) ? 1 : 0), y, '#c96b4b');
  q.form(g => { g.rect(-2, -len + 1, 6, 3); }, { ramp: BOOT, bevel: 1, amb: 0.3, ink: I });
});

/** A plate (side on, its face to us), painted once: the rim, the recess, the hub, the bar's collar clamped on it. */
const plateFig = figure('gym-plate', 38, 38, 19, 19, q => {
  const P = ['#050507', '#0e0e12', '#18181e', '#26262e', '#363642', '#4c4c5c'], I = FIG_INK;
  q.form(g => { g.arc(0, 0, 16.5, 0, Math.PI * 2); }, { ramp: P, bevel: 4, amb: 0.15, ink: I });
  q.form(g => { g.arc(0, 0, 11.5, 0, Math.PI * 2); }, { ramp: P, bevel: 3, amb: 0.2, ink: P[0], light: [0.45, 0.6, 0.66] });
  q.line(-7, -13, 4, -14, P[5]); q.px(-9, -12, P[4]);
  for (const [x, y] of [[-6, -6], [5, 6], [6, -5], [-5, 6]]) q.px(x, y, P[3]);
  q.form(g => { g.arc(0, 0, 4.5, 0, Math.PI * 2); }, { ramp: RAMP.steel, bevel: 2, amb: 0.2, ink: I, spec: '#ffffff', wet: 0.8 });
  q.px(0, 0, '#0c0c0e');
});

/** Meathead flat on the bench, pushing: side on, the bar's plate going up and down (or racked, and him looking up). */
const bencher = (ctx: Ctx, t: number, racked: boolean) => {
  benchFig(ctx, 0, 0);
  bencherFig(racked)(ctx, 0, 0);
  const lift = racked ? 1 : (Math.sin(t * 0.09) + 1) / 2;
  const barY = Math.round(58 + (1 - lift) * 20);
  if (!racked) pressArm(Math.max(4, 95 - (barY + 3)))(ctx, 89, 95);
  // The plate (side on: its face), on the bar's end; racked on its hook, or up over his chest
  const bx = racked ? 76 : 90, by = racked ? 64 : barY;
  plateFig(ctx, bx, by);
  // (sweat flying off him at the top of every rep, and a puff of chalk off his hands)
  if (!racked && lift > 0.9) {
    for (let i = 0; i < 3; i++) R(ctx, 70 + i * 14 + hash(t + i) * 6, 80 - hash(t * 3 + i) * 8, 2, 2, '#9cdcfc');
    for (let i = 0; i < 5; i++) R(ctx, 84 + hash(i * 3) * 14, barY + 2 - hash(i * 7 + t) * 6, 1, 1, 'rgba(255,255,255,0.7)');
  }
};

/** An agent, standing (feet at baseY), walking (`step`) or planted; `back`: a light behind him. */
const agentStanding = (ctx: Ctx, cx: number, baseY: number, t: number, step = 0, back: string | null = null) => {
  const bob = step ? Math.round(Math.abs(Math.sin(t * 0.2 + step)) * 2) : 0;
  const swing = step ? Math.round(Math.sin(t * 0.2 + step) * 4) : 0;
  agentFig(swing, back)(ctx, cx, baseY - bob);
};

/** Chest day, 5 a.m.: Meathead benching alone under a flickering tube light. */
export const drawGym = (ctx: Ctx, t: number) => {
  gymBg(ctx);
  tubeLight(ctx, t, 90);
  bencher(ctx, t, false);
};

/** The door opens: light spilling in, two black suits in it. He's racked the bar to look. */
export const drawDoorway = (ctx: Ctx, t: number) => {
  gymBg(ctx);
  tubeLight(ctx, t, 90);
  const open = Math.min(1, t / 30);
  // The doorway: daylight, then the door swung in against the wall
  R(ctx, 214, 30, 38, 82, '#fcf8d8');
  ctx.fillStyle = 'rgba(252, 248, 216, 0.25)';
  ctx.beginPath(); ctx.moveTo(214, 112); ctx.lineTo(252, 112); ctx.lineTo(252 - 90 * open, 144); ctx.lineTo(214 - 140 * open, 144); ctx.fill();
  R(ctx, 214, 30, Math.round(38 * (1 - open)) + 3, 82, G.door);
  // The two of them, dark against the light
  if (t > 16) { agentStanding(ctx, 226, 114, t, 0, DOOR_RIM); agentStanding(ctx, 242, 116, t, 0, DOOR_RIM); }
  bencher(ctx, t, true);
};

/** The agents' skin up close: a touch more range than RAMP.aSkin, so the jaw's planes read. */
const AS = ['#3a2416', '#5a3c26', '#80583c', '#a47a58', '#c49a74', '#e0bc96', '#f4d8b8', '#fcecd8'];
/** Lenses: black glass, the room's light caught in the top of them. */
const LENS = ['#000000', '#05050a', '#0c0c16', '#161624', '#222236', '#34344e'];
/** A black tie, a little sheen on it. */
const TIE = ['#020203', '#08080c', '#121218', '#1e1e28', '#30303c'];
/** The earpiece's clear plastic and its coil. */
const CLEAR = ['#4c5860', '#6c7880', '#9ca8b0', '#c8d0d8', '#eef4f8'];

/**
 * The agent who talks, up close, painted once (everything of him that doesn't move): the jacket over shoulders like a
 * door, the lapels, the flag pin; the white shirt, the black tie, its clip; the neck wider than his head, the cords
 * standing in it, rolling over a collar that's losing; the head a cinder block, the jaw's corners, the cleft, a five
 * o'clock shadow; the hair a helmet, a side parting you could cut yourself on, the comb's lines, the lacquer shining;
 * the shades (Meathead a tiny one in each lens); the ears, the earpiece, its coil down into the collar.
 */
const agentStill = () => painting('ag-closeup', ART_W, ART_H, p => {
  const I = FIG_INK, S = SUIT, SH = RAMP.shirt, Hm = RAMP.mHair;
  const onIt = (x: number, y: number, c: string) => { if (p.painted(x, y)) p.px(x, y, c); };
  // The jacket: the shoulders out past the frame, the traps under it climbing up into the collar
  p.form(g => { g.moveTo(14, 150); g.bezierCurveTo(22, 126, 44, 112, 70, 105); g.lineTo(80, 99); g.lineTo(160, 99); g.lineTo(170, 105); g.bezierCurveTo(196, 112, 218, 126, 226, 150); g.closePath(); },
    { ramp: S, bevel: 24, amb: 0.1, ink: I });
  // (the shoulder seams; a crease where the jacket's pulled tight across him)
  for (const s of [-1, 1]) { p.line(120 + s * 82, 128, 120 + s * 70, 112, S[s < 0 ? 5 : 3]); p.line(120 + s * 83, 129, 120 + s * 71, 113, S[1]); }
  p.line(48, 136, 70, 126, S[1]); p.line(48, 135, 70, 125, S[4]);
  // The shirt in the V
  p.form(g => { g.moveTo(100, 100); g.lineTo(140, 100); g.lineTo(121, 146); g.lineTo(119, 146); g.closePath(); }, { ramp: SH, bevel: 6, amb: 0.3, ink: null });
  // The tie down it, the clip across it
  p.form(g => { g.moveTo(115.5, 109); g.lineTo(124.5, 109); g.lineTo(126, 146); g.lineTo(114, 146); g.closePath(); }, { ramp: TIE, bevel: 3, amb: 0.25, ink: I, spec: '#7a7a90', wet: 0.35 });
  p.line(119, 112, 118, 144, TIE[4]);
  p.form(g => { g.rect(112, 124, 16, 2.5); }, { ramp: RAMP.gold, bevel: 1, amb: 0.4, ink: '#3c2800', spec: '#fffff0', wet: 0.7 });
  // The lapels: notched, lit along their edges
  for (const s of [-1, 1]) {
    const X = (x: number) => 120 + s * (x - 120);
    p.form(g => { g.moveTo(X(77), 101); g.lineTo(X(102), 101); g.lineTo(X(119), 146); g.lineTo(X(103), 146); g.lineTo(X(90), 124); g.lineTo(X(84), 125); g.lineTo(X(81), 118); g.closePath(); },
      { ramp: S, bevel: 4, amb: s < 0 ? 0.24 : 0.12, ink: I, inkIn: S[0] });
    p.line(X(102), 102, X(118), 144, S[s < 0 ? 6 : 4]); p.line(X(84), 124, X(90), 123, S[s < 0 ? 5 : 3]);
  }
  // (the flag pin on his lapel: the stripes, the blue, the gold round it, a glint)
  p.form(g => { g.rect(89, 112, 9, 7); }, { ramp: RAMP.gold, bevel: 1, amb: 0.4, ink: '#3c2800' });
  for (let y = 0; y < 5; y++) p.line(90, 113 + y, 96, 113 + y, y % 2 ? '#f4f4f4' : '#c81c1c');
  p.rect(90, 113, 3, 3, '#1c2c8c'); p.px(91, 114, '#e8e8f0'); p.px(97, 112, '#fffff0');
  // The neck: out from under the jaw, wider than his head by the time it gets to the collar
  p.form(g => { g.moveTo(90, 60); g.lineTo(150, 60); g.bezierCurveTo(151, 80, 158, 94, 173, 103); g.lineTo(67, 103); g.bezierCurveTo(82, 94, 89, 80, 90, 60); g.closePath(); },
    { ramp: AS, bevel: 18, amb: 0.14, ink: I, inkIn: AS[1] });
  // (in the jaw's shadow, the far side darker; the cords down from behind the ears, each a ridge lit on its left)
  for (let x = 66; x < 175; x++) for (let y = 60; y < 103; y++) if (p.painted(x, y) && bayer(x, y) + 0.5 < (x < 120 ? 0.75 : 1.1) - (y - 60) / 60) p.px(x, y, x < 120 ? AS[3] : AS[2]);
  for (const [x0, x1, s] of [[87, 74, -1], [153, 166, 1]] as const) for (let k = 0; k <= 30; k++) {
    const x = Math.round(x0 + ((x1 - x0) * k * k) / 900), y = 70 + k;
    p.px(x, y, AS[s < 0 ? 2 : 1]); p.px(x - 1, y, s < 0 ? AS[6] : AS[3]);
  }
  // (the neck rolling over the collar)
  for (let x = 70; x < 171; x++) { onIt(x, 99, AS[5]); onIt(x, 100, AS[3]); onIt(x, 101, AS[1]); }
  // The collar, buttoned and losing: dug in round that neck, the stitching strained; its points down either side of the knot
  p.form(g => { g.moveTo(66, 101); g.lineTo(174, 101); g.lineTo(171, 107); g.lineTo(69, 107); g.closePath(); }, { ramp: SH, bevel: 2.5, amb: 0.3, ink: I, inkIn: SH[0] });
  for (let x = 72; x < 168; x += 3) p.px(x, 104, SH[1]);
  for (const s of [-1, 1]) p.form(g => { g.moveTo(120 + s * 2, 103); g.lineTo(120 + s * 12, 102); g.lineTo(120 + s * 10, 113); g.closePath(); }, { ramp: SH, bevel: 2, amb: s < 0 ? 0.4 : 0.25, ink: I });
  // (the knot)
  p.form(g => { g.moveTo(113, 101); g.lineTo(127, 101); g.lineTo(125, 110); g.lineTo(115, 110); g.closePath(); }, { ramp: TIE, bevel: 3, amb: 0.25, ink: I, spec: '#7a7a90', wet: 0.4 });
  // The ears
  for (const [ex, s] of [[84, -1], [156, 1]] as const) {
    p.form(g => { g.ellipse(ex, 58, 5.5, 10, s * 0.1, 0, Math.PI * 2); }, { ramp: AS, bevel: 3.5, amb: s < 0 ? 0.22 : 0.1, ink: I });
    p.line(ex + s, 52, ex + s, 64, AS[2]); p.line(ex + s * 2, 53, ex + s * 2, 63, AS[1]); p.line(ex, 50, ex, 52, AS[6]);
  }
  // The head: a cinder block; the jaw dead square, the corners of it barely rounded
  p.form(g => {
    g.moveTo(90, 24); g.lineTo(150, 24); g.bezierCurveTo(153, 40, 154, 60, 154, 80); g.lineTo(153, 94); g.bezierCurveTo(152, 101, 147, 105, 138, 105);
    g.lineTo(102, 105); g.bezierCurveTo(93, 105, 88, 101, 87, 94); g.lineTo(86, 80); g.bezierCurveTo(86, 60, 87, 40, 90, 24); g.closePath();
  }, { ramp: AS, bevel: 13, amb: 0.2, ink: I, inkIn: AS[1] });
  // (the jaw's corners: the muscle at the hinge, lit on its top; the shadow along under the jawline)
  for (const s of [-1, 1]) {
    const x0 = 120 + s * 30;
    for (let k = 0; k < 18; k++) { p.px(x0 + s * Math.round(k * 0.1), 82 + k, AS[s < 0 ? 3 : 2]); if (s < 0) p.px(x0 + 1, 82 + k, AS[5]); }
    p.line(x0 - s * 4, 101, x0 - s * 14, 103, AS[2]);
  }
  // (the hollows under the cheekbones, a step darker; the temples)
  for (const s of [-1, 1]) for (let y = 66; y < 82; y++) for (let x = 96; x < 146; x++) {
    const d = (Math.abs(x - 120) - 22) / 7, e = (y - 73) / 7;
    if (Math.sign(x - 120) === s && d * d + e * e < 1 && bayer(x, y) + 0.5 < 0.4 - (d * d + e * e) * 0.4) p.px(x, y, s < 0 ? AS[4] : AS[3]);
  }
  // (the brows, flat and heavy, the furrow between them)
  for (const s of [-1, 1]) for (let k = 0; k < 22; k++) { const x = 120 + s * (5 + k); p.px(x, 39, Hm[1]); p.px(x, 40, Hm[2]); p.px(x, 41, Hm[1]); if (k % 3 === 0) p.px(x, 38, Hm[1]); p.px(x, 42, AS[s < 0 ? 5 : 4]); }
  p.line(118, 36, 118, 42, AS[2]); p.line(122, 36, 122, 42, AS[2]); p.line(119, 37, 119, 42, AS[5]);
  // The nose: the bridge lit down its left, the ball of it, the nostrils, the shadow under
  p.line(117, 56, 116, 72, AS[6]); p.line(118, 56, 118, 72, AS[5]); p.line(122, 58, 123, 72, AS[3]); p.line(123, 60, 124, 72, AS[2]);
  p.form(g => { g.ellipse(120, 74, 6, 3.5, 0, 0, Math.PI * 2); }, { ramp: AS, bevel: 3, amb: 0.2, ink: null });
  p.rect(114, 76, 3, 1, '#4a2a18'); p.rect(124, 76, 3, 1, '#4a2a18'); p.line(112, 78, 128, 78, AS[2]); p.line(114, 79, 126, 79, AS[3]);
  p.px(117, 72, AS[7]);
  // (the groove down to the lip; the mouth a flat line, the corners turned down; the lower lip lit)
  p.line(118, 80, 118, 83, AS[3]); p.line(122, 80, 122, 83, AS[3]); p.line(120, 81, 120, 83, AS[5]);
  p.line(107, 85, 133, 85, '#5a2a1c'); p.line(108, 84, 132, 84, AS[2]); p.line(109, 86, 131, 86, '#b07058'); p.line(110, 87, 130, 87, AS[5]);
  p.px(106, 86, '#5a2a1c'); p.px(134, 86, '#5a2a1c'); p.px(105, 87, AS[2]); p.px(135, 87, AS[2]);
  // (the chin: square, the cleft, the light either side of it)
  p.line(120, 95, 120, 102, AS[2]); p.line(119, 96, 119, 101, AS[6]); p.line(121, 96, 121, 101, AS[3]);
  // (a five o'clock shadow over the jaw and the lip: a scatter, bluish, thick low down)
  for (let y = 82; y < 105; y++) for (let x = 88; x < 153; x++) {
    if (!p.painted(x, y) || (y < 89 && Math.abs(x - 120) < 16) || Math.abs(x - 120) > 30 - Math.max(0, 90 - y)) continue;
    if (hash(x * 0.71 + y * 1.37) < 0.1 + (y - 82) / 60 && (x + y) % 2 === 0) p.px(x, y, (x * 3 + y) % 5 ? '#a48c84' : '#8a7470');
  }
  // (the underside of the block: the jaw's bottom edge turned away from the light)
  for (let y = 98; y < 105; y++) for (let x = 90; x < 152; x++) if (p.painted(x, y) && bayer(x, y) + 0.5 < (y - 97) / 7) p.px(x, y, x < 120 ? AS[3] : AS[2]);
  // The hair: a helmet; the side parting, a line you could cut yourself on; the comb's lines; the lacquer's shine
  p.form(g => { g.moveTo(85, 46); g.lineTo(85, 22); g.bezierCurveTo(85, 11, 100, 7, 120, 7); g.bezierCurveTo(141, 7, 156, 11, 156, 22); g.lineTo(156, 46); g.lineTo(152, 46); g.lineTo(151, 31); g.bezierCurveTo(140, 27, 100, 27, 89, 31); g.lineTo(88, 46); g.closePath(); },
    { ramp: Hm, bevel: 6, amb: 0.3, ink: I, gain: 1.2, spec: '#9a9aac', wet: 0.55 });
  for (let i = 0; i < 9; i++) { const x0 = 106 + i * 6; for (let k = 0; k < 20; k++) onIt(x0 + Math.round(k * 0.35), 9 + k, k % 6 < 4 ? '#2a2a34' : '#0c0c10'); }
  for (let i = 0; i < 3; i++) { const x0 = 101 - i * 5; for (let k = 0; k < 20; k++) onIt(x0 - Math.round(k * 0.3), 10 + k, '#22222a'); }
  for (let y = 8; y < 28; y++) { p.px(103, y, AS[4]); p.px(102, y, Hm[0]); p.px(104, y, '#3a3a46'); }
  for (let x = 108; x < 146; x++) onIt(x, 12 + Math.round(((x - 127) / 19) ** 2 * 2), x % 4 ? '#6a6a7c' : '#9a9aac');
  // The shades: wraparound, black; the frame across the top, the bridge, the arms back to the ears
  for (const s of [-1, 1]) {
    const X = (x: number) => 120 + s * (x - 120);
    p.form(g => { g.moveTo(X(92), 44); g.lineTo(X(119), 44); g.lineTo(X(118.5), 53); g.bezierCurveTo(X(118), 57, X(113), 58, X(106), 58); g.bezierCurveTo(X(98), 58, X(93), 56, X(92), 52); g.closePath(); },
      { ramp: LENS, bevel: 4, amb: 0.15, ink: I, gain: 1.1 });
    for (let x = 93; x < 119; x++) { onIt(X(x), 45, LENS[5]); onIt(X(x), 46, LENS[4]); onIt(X(x), 47, LENS[3]); }
    p.line(X(91), 46, X(86), 48, I); p.line(X(91), 45, X(86), 47, '#2a2a36');
  }
  p.line(90, 43, 150, 43, I); p.line(92, 44, 148, 44, '#3a3a4c');
  p.rect(119, 45, 3, 3, I); p.px(119, 45, '#3a3a4c');
  // (Meathead, a tiny one in each lens: the flat-top, the head, the traps)
  for (const lx of [104, 133]) { p.rect(lx, 49, 5, 1, '#1c1c22'); p.rect(lx, 50, 5, 4, '#6a4a2c'); p.px(lx, 50, '#8a6440'); p.rect(lx - 2, 54, 9, 2, '#4c3420'); }
  // The earpiece, clear plastic, and its coil down into the collar
  p.form(g => { g.roundRect(153.5, 52, 5, 7, 2); }, { ramp: CLEAR, bevel: 2, amb: 0.3, ink: I, spec: '#ffffff', wet: 0.6 });
  for (let k = 0; k < 14; k++) {
    const x = 157 + Math.round(k * 0.45), y = 60 + k * 3;
    p.px(x, y, CLEAR[4]); p.px(x + 1, y + 1, CLEAR[2]); p.px(x, y + 2, CLEAR[0]); p.px(x - 1, y + 1, CLEAR[1]);
  }
});

/** The agent who talks, up close: shades, earpiece, the other one behind him, the gym out of focus. */
export const drawAgent = (ctx: Ctx, t: number, talking: boolean, where: 'gym' | 'briefing' = 'gym') => {
  if (where === 'gym') { gymBg(ctx); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, ART_W, ART_H); } else briefingBg(ctx, t, -1);
  // The other one, behind him, out of focus
  agentBlur(ctx, 215, 18);
  ctx.drawImage(agentStill(), 0, 0);
  // A glint going across the shades
  const g = (t * 2) % 120;
  if (g < 30) for (const [l, r] of [[93, 118], [122, 147]]) for (let y = 45; y < 57; y++) {
    const x = l + g - 4 + Math.round((56 - y) * 0.5);
    for (let k = 0; k < 2; k++) if (x + k > l && x + k < r && (y < 54 || (x + k > l + 3 && x + k < r - 3))) R(ctx, x + k, y, 1, 1, k ? '#c8c8dc' : G.glint);
  }
  // The mouth: barely open when he talks
  if (talking && t % 10 < 5) { R(ctx, 108, 84, 24, 3, '#3a0606'); R(ctx, 110, 84, 20, 1, '#e8e0d0'); R(ctx, 109, 87, 22, 1, '#b07058'); }
  // (Meathead's shit himself: it's coming up off him at the agent, and a fly's found the agent)
  if (shatPants()) shatCloseUp(ctx, 120, 56);
};

/**
 * Meathead bounding along after them like a dog (his standing figure, painted over): the arms bent up in front of his
 * chest, the fists flopped over at the wrists like paws; the mouth hanging open (the tongue goes in over it, flapping).
 */
const escortFig = over('mh-escort', 60, 76, 30, 72, (g, x, y) => mhStandingFig(false, false, false)(g, x, y), q => {
  const S = RAMP.mSkin, I = FIG_INK;
  for (const s of [-1, 1]) {
    const amb = s < 0 ? 0.2 : 0.08;
    // The upper arm off the delt, down to the elbow, out a bit (too big to hang in)
    q.form(g => { g.moveTo(s * 12, -51); g.bezierCurveTo(s * 19, -51, s * 21, -46, s * 20, -40); g.lineTo(s * 15, -38); g.lineTo(s * 13, -44); g.closePath(); }, { ramp: S, bevel: 3.5, amb, ink: I, inkIn: S[1] });
    q.line(s * 14, -43, s * 19, -42, S[2]); q.px(s * 17, -48, S[s < 0 ? 6 : 4]);
    // The forearm, up from the elbow in front of him to the wrist by his pec; the wristband; the fist flopped over, a paw
    q.stroke(g => { g.moveTo(s * 18, -40); g.lineTo(s * 12, -48); }, 5.5, { ramp: S, bevel: 2.5, amb: amb + 0.08, ink: I, inkIn: S[2] });
    q.line(s * 17, -42, s * 13, -47, S[s < 0 ? 6 : 5]);
    q.line(s * 10, -48, s * 13, -50, BOOT[3]); q.line(s * 11, -48, s * 14, -50, BOOT[2]);
    q.form(g => { g.ellipse(s * 10.5, -45, 3, 3.2, 0, 0, Math.PI * 2); }, { ramp: S, bevel: 2, amb: amb + 0.08, ink: I, inkIn: S[1] });
    q.line(s * 9, -43, s * 12, -43, S[2]); q.px(s * 10, -47, S[7]); q.px(s * 9, -44, S[3]);
  }
  // The mouth, hanging open: the dark of it, the top teeth
  q.rect(-2, -54, 5, 2, '#3a0606'); q.line(-2, -54, 2, -54, '#f4ecdc');
  // (the eyes up, wide: happy)
  q.px(-4, -59, '#f4ece0'); q.px(3, -59, '#f4ece0');
});

/** Out of the gym and down a government corridor: two suits walking, Meathead bounding round them like a dog. */
export const drawEscort = (ctx: Ctx, t: number) => {
  bands(ctx, 0, 0, ART_W, 114, ['#4c5450', '#5c6460', '#687070', '#707874', '#6c7470', '#646c68', '#5c645f']);
  bands(ctx, 0, 0, ART_W, 14, ['#3c4440', '#444c48', '#4c5450']);
  // Doors going by, each with a little frosted window and a number. (Each slot's things go by its place along the
  // corridor, not its place on the screen: so as the scroll comes back round, nothing swaps for something else.)
  const scroll = (t * 1.2) % 80, along = Math.floor(t * 1.2 / 80);
  for (let k = -1; k < 5; k++) {
    const x = Math.round(k * 80 - scroll + 20);
    R(ctx, x, 40, 34, 74, G.door); R(ctx, x + 6, 48, 22, 16, '#9cacac'); R(ctx, x + 26, 80, 3, 3, C.gold);
    text(ctx, `B-${(14 + k + Math.floor(t * 1.2 / 80)) % 90}`, x + 17, 60, C.ink, 6);
  }
  // Between the doors: a portrait of somebody important, a fire extinguisher, a notice nobody reads
  for (let k = -1; k < 5; k++) {
    const x = Math.round(k * 80 - scroll + 20) + 46;
    if ((k + along) % 2 === 0) { R(ctx, x, 44, 20, 24, '#8c6c2c'); R(ctx, x + 2, 46, 16, 20, '#3c4c5c'); ell(ctx, x + 10, 54, 4, 5, '#c8a888'); R(ctx, x + 5, 60, 10, 6, '#1c1c24'); }
    else { R(ctx, x + 6, 84, 7, 18, C.red); R(ctx, x + 7, 81, 4, 3, C.ink); R(ctx, x + 6, 88, 7, 2, C.white); R(ctx, x + 2, 50, 16, 20, '#e8e8d8'); for (let l = 0; l < 5; l++) R(ctx, x + 4, 54 + l * 3, 12 - (l % 2) * 4, 1, '#8c8c80'); }
  }
  // The baseboard
  R(ctx, 0, 110, ART_W, 4, '#3c4440');
  // Lights along the ceiling
  for (let k = -1; k < 5; k++) R(ctx, Math.round(k * 80 - scroll + 44), 16, 30, 3, G.tube);
  // Floor, polished: the ceiling lights shining back up off it
  bands(ctx, 0, 114, ART_W, 30, ['#4c504c', '#444844', '#3c403c', '#343834', '#2c302c']);
  for (let k = -1; k < 5; k++) { const lx = Math.round(k * 80 - scroll + 44); R(ctx, lx, 120, 30, 2, 'rgba(252, 252, 240, 0.18)'); R(ctx, lx + 6, 128, 18, 1, 'rgba(252, 252, 240, 0.1)'); }
  for (let k = 0; k < 8; k++) R(ctx, Math.round((((k * 40 - t * 1.8) % 320) + 320) % 320) - 20, 124, 18, 1, '#5c605c');
  // The two of them, walking in step (a good stretch further ahead of him, if he's shit himself)
  const ahead = shatPants() ? 22 : 0;
  agentStanding(ctx, 150 + ahead, 118, t, 1);
  agentStanding(ctx, 178 + ahead, 118, t, 1);
  // Him: bounding round behind them, up on his toes, tongue out
  const hop = Math.abs(Math.sin(t * 0.25)) * 12;
  const cx = 96 + Math.round(Math.sin(t * 0.05) * 16);
  const y = 118 - Math.round(hop);
  escortFig(ctx, cx, y);
  // (the tongue, out over his chin, flapping)
  const tl = 4 + (t % 12 < 6 ? 1 : 0);
  R(ctx, cx - 1, y - 52, 3, tl, '#d84860'); R(ctx, cx - 1, y - 52, 1, tl - 1, '#f08ca0'); R(ctx, cx + 1, y - 52, 1, tl, '#a02838'); R(ctx, cx, y - 52 + tl, 1, 1, '#a02838');
  // (little hearts going up off him)
  for (let i = 0; i < 2; i++) {
    const a = (t + i * 30) % 60;
    if (a < 40) {
      const hx = cx + 10 + i * 6, hy = y - 70 - a / 2;
      R(ctx, hx, hy, 2, 2, C.red); R(ctx, hx + 3, hy, 2, 2, C.red); R(ctx, hx, hy + 2, 5, 2, C.red); R(ctx, hx + 1, hy + 4, 3, 1, C.red); R(ctx, hx + 2, hy + 5, 1, 1, C.red);
      R(ctx, hx, hy, 1, 1, '#fc7c5c'); R(ctx, hx + 4, hy + 2, 1, 2, C.darkRed); R(ctx, hx + 3, hy + 4, 1, 1, C.darkRed);
    }
  }
  if (shatPants()) shatFront(ctx, cx, y);
};

/** What's on the projector screen. */
export type Slide = 'four' | 'four2' | 'artie' | 'victor' | 'ernie' | 'hector' | 'tommy' | 'barry' | 'oscar' | 'dale' | 'drop';

// Each one on his slide: his name, where he's from, and his colour (the photo's backdrop, and the light in his eyes).
const BOSS_SLIDES: Record<string, { name: string; where: string; color: string }> = {
  artie: { name: 'ARTIE AVALANCHE', where: 'ANCHORAGE, AK', color: '#60a5fa' },
  victor: { name: 'VICTOR VOLCANO', where: 'HILO, HI', color: '#f97316' },
  ernie: { name: 'ERNIE EARTHQUAKE', where: 'SAN FRANCISCO, CA', color: '#b45309' },
  hector: { name: 'HECTOR HURRICANE', where: 'MIAMI, FL', color: '#14b8a6' },
  tommy: { name: 'TOXIC TOMMY', where: 'FLINT, MI', color: '#65a30d' },
  barry: { name: 'BLACKOUT BARRY', where: 'NEW YORK, NY', color: '#3b82f6' },
  oscar: { name: 'OILY OSCAR', where: 'HOUSTON, TX', color: '#ca8a04' },
  dale: { name: 'DRUG TRADE DALE', where: 'ALBUQUERQUE, NM', color: '#ec4899' },
};

/** Each set's four, in order, and their title on the slide. */
const SETS = { four: { title: 'THE FOUR ASSHOLES', keys: ['artie', 'victor', 'ernie', 'hector'] }, four2: { title: 'FOUR MORE ASSHOLES', keys: ['tommy', 'barry', 'oscar', 'dale'] } };

/**
 * How a boss's bust goes on a slide: his actual sprite in silhouette, cropped to his head and shoulders, lit round
 * the edges, the eyes lit ((cx, base): the middle of his head, and where the photo's bottom cuts him off; `clip`, the
 * photo's frame). Set by bossFour.ts: this file can't pull in the bosses' sprites (one of the stages pulls in this one).
 */
export type SlideBust = (ctx: Ctx, key: string, cx: number, base: number, s: number, clip: [number, number, number, number], rim: string, eyes: string) => void;
let bust: SlideBust | null = null;
export const setSlideBust = (b: SlideBust) => { bust = b; };

/** Mixes a colour toward another (both hex), `k` of the way. */
const mix = (a: string, b: string, k: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (sh: number) => Math.round(((pa >> sh) & 255) + ((((pb >> sh) & 255) - ((pa >> sh) & 255)) * k));
  return '#' + ((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0');
};

/** A boss on the slide: his bust in silhouette (or, if nothing's set the bust drawer, a plain head and shoulders). */
const slideBoss = (ctx: Ctx, cx: number, base: number, key: string, s: number, clip: [number, number, number, number], rim: string) => {
  const b = BOSS_SLIDES[key];
  if (bust) { bust(ctx, key, cx, base, s, clip, rim, b.color); return; }
  ell(ctx, cx, base - 34 * s, 11 * s, 12 * s, C.ink);
  R(ctx, cx - 18 * s, base - 22 * s, 36 * s, 22 * s, C.ink);
};

/**
 * A boss's photo on his slide (76..126 x 16..80): a studio backdrop in his colour, lit behind his head and falling
 * off to the corners in steps; the height marks up the side, like a mugshot.
 */
const slidePhoto = (ctx: Ctx, key: string, color: string) => {
  const ramp = [mix(color, '#000000', 0.42), mix(color, '#000000', 0.26), mix(color, '#000000', 0.12), color, mix(color, '#ffffff', 0.16), mix(color, '#ffffff', 0.32)];
  shaded(ctx, `slide-${key}`, 76, 16, 50, 64, ramp, (u, v) => Math.max(0, 1 - Math.hypot((u - 0.5) * 1.3, (v - 0.32) * 1.05) * 1.05));
  const mark = mix(color, '#ffffff', 0.55);
  for (let y = 20; y < 80; y += 6) R(ctx, 77, y, (y - 20) % 12 ? 2 : 4, 1, mark);
  R(ctx, 76, 16, 50, 1, mix(color, '#000000', 0.5)); R(ctx, 76, 16, 1, 64, mix(color, '#000000', 0.5));
};

/** The briefing room: dark, the projector's beam, the screen, and whatever slide's up (-1: nothing, the room only). */
export const briefingBg = (ctx: Ctx, t: number, slide: Slide | -1) => {
  layer(ctx, 'briefing', ART_W, ART_H, g => {
    // Wood paneling, just about visible, lit by the screen: brighter near it, falling off in rings
    shaded(g, 'brief-wall', 0, 0, ART_W, ART_H, ['#050406', '#0a0808', '#100c0a', '#18120c', '#221810', '#2c2014'], (u, v) => {
      const d = Math.hypot((u - 0.53) * 1.8, (v - 0.33) * 1.1);
      return Math.max(0, 1 - d * 1.15);
    });
    for (let x = 0; x < ART_W; x += 16) R(g, x, 0, 1, ART_H, 'rgba(0,0,0,0.35)');
    // The seal on the wall, in the dark (a gold rim catching the screen)
    shaded(g, 'brief-seal', 14, 16, 28, 28, ['#140e06', '#1c1408', '#2a1e0c', '#3a2a10', '#4c3814'], ball(0.6, -0.3, 0.1));
    ell(g, 28, 30, 10, 10, '#141008'); R(g, 22, 28, 12, 4, '#241c10');
  });
  // The screen
  R(ctx, 70, 8, 132, 78, G.screen); R(ctx, 70, 8, 132, 3, '#a0a094'); R(ctx, 134, 4, 4, 6, C.gray);
  if (slide !== -1) drawSlide(ctx, t, slide);
  // The beam, from the projector behind (off the bottom)
  ctx.fillStyle = G.beam; ctx.beginPath(); ctx.moveTo(70, 86); ctx.lineTo(202, 86); ctx.lineTo(146, 144); ctx.lineTo(126, 144); ctx.fill();
  for (let i = 0; i < 10; i++) R(ctx, 120 + hash(i * 7 + Math.floor(t / 20)) * 40, 90 + hash(i * 3) * 50, 1, 1, 'rgba(252,252,220,0.4)');
};

/** A slide on the screen (it's at 70..202 x 8..86); `stamp`: what gets slammed across a boss's. */
export const drawSlide = (ctx: Ctx, t: number, slide: Slide, stamp = 'ASSHOLE') => {
  if (slide === 'four' || slide === 'four2') {
    text(ctx, SETS[slide].title, 136, 22, C.darkRed, 8);
    SETS[slide].keys.forEach((k, i) => { const cx = 91 + i * 30; slideBoss(ctx, cx, 80, k, 0.55, [cx - 14, 28, 28, 52], BOSS_SLIDES[k].color); });
    R(ctx, 76, 26, 120, 1, C.darkRed);
    return;
  }
  if (slide === 'drop') {
    // A cargo plane over a map, a parachute (or no parachute) going out of the back
    text(ctx, 'LOGISTICS', 136, 22, C.darkRed, 8);
    R(ctx, 78, 30, 116, 50, '#b8c8b0');
    for (let k = 0; k < 5; k++) R(ctx, 82 + k * 24, 34 + (k % 2) * 20, 14, 10, '#9cb094');
    const px = 90 + ((t * 0.6) % 70);
    R(ctx, px, 42, 40, 7, C.ink); R(ctx, px + 12, 36, 6, 20, C.ink); R(ctx, px + 36, 38, 4, 6, C.ink);
    ell(ctx, px - 4, 58, 3, 3, C.mSkin); R(ctx, px - 6, 61, 5, 6, C.mSkin);
    text(ctx, 'UNLIMITED', 136, 84, C.red, 7);
    return;
  }
  const b = BOSS_SLIDES[slide];
  slidePhoto(ctx, slide, b.color);
  slideBoss(ctx, 101, 80, slide, 0.8, [76, 16, 50, 64], mix(b.color, '#ffffff', 0.7));
  text(ctx, b.name, 164, 30, C.ink, 7);
  text(ctx, b.where, 164, 42, '#4c4c44', 6);
  // The stamp, slammed on a moment in
  if (t > 20) {
    ctx.save(); ctx.translate(164, 64); ctx.rotate(-0.2);
    ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.strokeRect(-30, -9, 60, 16);
    text(ctx, stamp, 0, 3, C.red, 8);
    ctx.restore();
  }
};

/**
 * The back of Meathead's head in the dark of the briefing room, painted once: the traps like hills, the neck, the
 * flat-top, the ears; the screen's light along the top of every edge of him (the bristles, the ears' rims, the tops of
 * his traps). The table at the side: a file stamped TOP SECRET, a mug of coffee going cold.
 */
const briefingBackFig = figure('brief-back', ART_W, ART_H, 0, 0, q => {
  const D = ['#000000', '#020202', '#050504', '#090907', '#0e0e0b'], I = '#000000';
  q.form(g => { g.moveTo(-4, 146); g.lineTo(6, 138); g.bezierCurveTo(40, 124, 80, 119, 99, 113); g.lineTo(101, 100); g.lineTo(155, 100); g.lineTo(157, 113); g.bezierCurveTo(176, 119, 216, 124, 250, 138); g.lineTo(260, 146); g.closePath(); }, { ramp: D, bevel: 14, amb: 0.1, ink: I });
  for (const s of [-1, 1]) q.form(g => { g.ellipse(128 + s * 33, 102, 3.5, 7, 0, 0, Math.PI * 2); }, { ramp: D, bevel: 2, amb: 0.1, ink: I, inkIn: null });
  q.form(g => { g.roundRect(97, 84, 62, 26, 6); }, { ramp: D, bevel: 8, amb: 0.1, ink: I, inkIn: null });
  q.form(g => { g.rect(95, 81, 66, 9); }, { ramp: D, bevel: 2, amb: 0.2, ink: I, inkIn: null });
  // (the screen's light along the top of him: the bristles of the flat-top, the ears, the traps)
  for (let x = 0; x < ART_W; x++) for (let y = 60; y < ART_H; y++) if (q.painted(x, y)) {
    const top = y < 84;
    q.px(x, y, top ? (x % 3 ? '#4c4c3c' : '#6c6c58') : '#34342a');
    if (top && x % 3 === 0) q.px(x, y - 1, '#3c3c30');
    break;
  }
  rimLight(q, 0, ART_W - 1, 82, 143, '#2c2c24', '#4c4c3c', 120);
  // The table, its edge catching the light; the file; the mug, the coffee in it
  q.form(g => { g.rect(-4, 128, 66, 20); }, { ramp: ['#0c0804', '#140c06', '#1c140c', '#2c2014', '#3c2c1c'], bevel: 3, amb: 0.2, ink: I });
  q.line(-4, 128, 61, 128, '#4c3a24');
  q.form(g => { g.rect(8, 123, 28, 7); }, { ramp: ['#6c5430', '#8c7040', '#b89a5c', '#d8ba7c'], bevel: 2, amb: 0.3, ink: I });
  q.rect(12, 125, 20, 2, C.darkRed); q.line(14, 125, 29, 125, '#b02010');
  q.form(g => { g.roundRect(53, 120, 4, 6, 2); }, { ramp: ['#8c8c84', '#b4b4a8', '#dcdcd0'], bevel: 1, amb: 0.3, ink: I });
  q.rect(54, 122, 2, 2, '#1c140c');
  q.form(g => { g.rect(44, 118, 10, 10); }, { ramp: ['#8c8c84', '#b4b4a8', '#dcdcd0', '#f4f4ec'], bevel: 2.5, amb: 0.3, ink: I });
  q.line(45, 119, 52, 119, '#3c2010'); q.px(46, 119, '#5c3418');
});

/** The briefing, from the back: an agent at the screen with a pointer, and the back of Meathead's head in the foreground. */
export const drawBriefing = (ctx: Ctx, t: number, talking: boolean, slide: Slide) => {
  briefingBg(ctx, t, slide);
  // The agent at the side of the screen, his pointer on it
  agentStanding(ctx, 216, 128, t);
  const tap = talking && t % 30 < 6 ? 2 : 0;
  ctx.strokeStyle = C.lightGray; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(206, 90); ctx.lineTo(slide === 'four' || slide === 'four2' || slide === 'drop' ? 180 : 110 + tap, 52 + tap); ctx.stroke();
  // (his mouth, when he's talking)
  if (talking && t % 10 < 5) agentTalk(ctx, 216, 128);
  // The back of Meathead's head and his shoulders, lit round the edge by the screen; the table in front of him
  briefingBackFig(ctx, 0, 0);
  for (let k = 0; k < 3; k++) { const st = (t * 0.4 + k * 6) % 18; R(ctx, 46 + k * 2 + Math.round(Math.sin(st * 0.5 + k) * 1), 116 - st, 1, 2, `rgba(220, 220, 210, ${0.35 * (1 - st / 18)})`); }
};

// ---------------------------------------------------------------------------
// The pencil necks (START GAME + INTRO, before the gym's played): the department's interns, sent in first
// ---------------------------------------------------------------------------

/** A pencil neck standing (feet at baseY), the light from the doorway behind him round his edges; the shakes, the sweat. */
const pencilStanding = (ctx: Ctx, cx: number, baseY: number, t: number, k: number) => {
  const sh = Math.round(Math.sin(t * 1.3 + k * 2) * 0.6);
  const x = cx + sh, y = baseY;
  pencilFig(k, DOOR_RIM)(ctx, x, y);
  // (sweat)
  if ((t + k * 13) % 40 < 20) R(ctx, x - 5, y - 64 + ((t + k * 13) % 40) / 4, 1, 2, '#9cdcfc');
};

/** The door opens: light spilling in, four skinny suits jostling in it, one being shoved in front. He's racked the bar to look. */
export const drawDoorwayPencils = (ctx: Ctx, t: number) => {
  gymBg(ctx);
  tubeLight(ctx, t, 90);
  const open = Math.min(1, t / 30);
  R(ctx, 214, 30, 38, 82, '#fcf8d8');
  ctx.fillStyle = 'rgba(252, 248, 216, 0.25)';
  ctx.beginPath(); ctx.moveTo(214, 112); ctx.lineTo(252, 112); ctx.lineTo(252 - 90 * open, 144); ctx.lineTo(214 - 140 * open, 144); ctx.fill();
  R(ctx, 214, 30, Math.round(38 * (1 - open)) + 3, 82, G.door);
  if (t > 16) {
    // (the one at the front shoved in by the ones behind him, and trying to get back behind them)
    const shove = Math.max(0, Math.min(14, (t - 40) * 0.5)) - Math.max(0, Math.sin(t * 0.15)) * 3;
    pencilStanding(ctx, 246, 113, t, 3); pencilStanding(ctx, 236, 114, t, 2); pencilStanding(ctx, 226, 115, t, 1);
    pencilStanding(ctx, 216 - shove, 117, t, 0);
  }
  bencher(ctx, t, true);
};

/** The interns up close: the skin (a touch more range than PSKIN), the clip-on tie, the lanyard, the badge's card. */
const PS = ['#4a2c22', '#6a4434', '#946450', '#b8846a', '#d4a486', '#ecc4a4', '#f8dcc4', '#fdecdc'];
const PTIE = ['#0c1440', '#16205c', '#1c2c6c', '#2c3c8c', '#4050a8', '#5c70c8'];
const STRAP = ['#4c0606', '#7c0c0c', '#b01616', '#d82828', '#f05050'];
const CARD = ['#9c9ca4', '#c4c4cc', '#e4e4ea', '#fafafc'];

/**
 * The pencil neck who's been made to do the talking, up close, painted once (everything of him that doesn't move):
 * the jacket two sizes too big, the shoulder pads out past his own shoulders with nothing in them, the cloth caving in
 * off the ends of them; the shirt, the clip-on tie crooked (the clip showing); the collar a size too big, standing off
 * a neck like a broom handle; the lanyard, the badge (INTERN, and a photo of him looking exactly this scared); the
 * head small on top of all that, the ears out, the chin not much of one; the hair gelled flat and parted, shining, a
 * cowlick up at the crown anyway; the shades too big for him, out past his head, slipped down his nose; the fuzz he
 * calls a mustache, the zits.
 */
const pencilStill = () => painting('pn-closeup', ART_W, ART_H, p => {
  const I = FIG_INK, Cs = CHEAP, SH = RAMP.shirt, Hh = PHAIR, St = RAMP.steel;
  const onIt = (x: number, y: number, c: string) => { if (p.painted(x, y)) p.px(x, y, c); };
  // The jacket: the pads square, out past where his shoulders stop; the sleeves hanging off the ends of them
  p.form(g => { g.moveTo(30, 150); g.lineTo(33, 128); g.bezierCurveTo(34, 118, 40, 113, 54, 112); g.lineTo(102, 106); g.lineTo(154, 106); g.lineTo(202, 112); g.bezierCurveTo(216, 113, 222, 118, 223, 128); g.lineTo(226, 150); g.closePath(); },
    { ramp: Cs, bevel: 14, amb: 0.12, ink: I, spec: '#8a8aa0', wet: 0.1 });
  // (the cloth caving in under the pads, nothing in there to hold it up; the sleeve seams; the pads' corners)
  for (const s of [-1, 1]) {
    const X = (x: number) => 128 + s * (x - 128);
    for (const [x0, y0, x1, y1] of [[58, 115, 74, 136], [64, 114, 86, 128], [72, 113, 96, 122]]) { p.line(X(x0), y0, X(x1), y1, Cs[1]); p.line(X(x0) + 1, y0, X(x1) + 1, y1, Cs[s < 0 ? 5 : 4]); }
    p.line(X(50), 116, X(48), 150, Cs[s < 0 ? 4 : 3]); p.line(X(51), 116, X(49), 150, Cs[1]);
    p.px(X(54), 112, Cs[6]); p.px(X(55), 112, Cs[5]); p.px(X(53), 113, Cs[5]);
  }
  // The shirt in the V
  p.form(g => { g.moveTo(104, 105); g.lineTo(152, 105); g.lineTo(130, 146); g.lineTo(126, 146); g.closePath(); }, { ramp: SH, bevel: 6, amb: 0.3, ink: null });
  // The clip-on tie, crooked
  const cs = Math.cos(0.12), sn = Math.sin(0.12);
  const rot = (g: Ctx, pts: number[][]) => { pts.forEach(([x, y], i) => { const rx = 128 + (x - 128) * cs - (y - 110) * sn, ry = 110 + (x - 128) * sn + (y - 110) * cs; if (i) g.lineTo(rx, ry); else g.moveTo(rx, ry); }); g.closePath(); };
  p.form(g => rot(g, [[124.5, 116], [131.5, 116], [133.5, 143], [128, 148], [122.5, 143]]), { ramp: PTIE, bevel: 3, amb: 0.2, ink: I });
  for (let y = 120; y < 144; y += 5) p.line(124 + (y - 110) * 0.12, y, 132 + (y - 110) * 0.12, y + 1, PTIE[1]);
  // The lapels: wide, floppy, lit along their edges
  for (const s of [-1, 1]) {
    const X = (x: number) => 128 + s * (x - 128);
    p.form(g => { g.moveTo(X(88), 108); g.lineTo(X(106), 106); g.lineTo(X(126), 146); g.lineTo(X(110), 146); g.lineTo(X(100), 128); g.lineTo(X(93), 129); g.lineTo(X(91), 121); g.closePath(); },
      { ramp: Cs, bevel: 4, amb: s < 0 ? 0.24 : 0.12, ink: I, inkIn: Cs[0] });
    p.line(X(106), 107, X(125), 144, Cs[s < 0 ? 6 : 4]);
  }
  // The inside of the collar, behind his neck (it stands that far off it)
  p.form(g => { g.ellipse(128, 104, 13, 4, 0, 0, Math.PI * 2); }, { ramp: ['#3c3c46', '#5c5c68', '#8c8c98', '#b4b8c4'], bevel: 2, amb: 0.2, ink: I });
  // The neck: a broom handle; the tendons, the jaw's shadow over the top of it
  p.form(g => { g.moveTo(122, 58); g.lineTo(134, 58); g.lineTo(134.5, 107); g.lineTo(121.5, 107); g.closePath(); }, { ramp: PS, bevel: 4, amb: 0.16, ink: I, inkIn: PS[1] });
  p.line(124, 74, 124, 104, PS[6]); p.line(132, 74, 132, 104, PS[2]);
  for (let y = 58; y < 76; y++) for (let x = 122; x < 135; x++) if (bayer(x, y) + 0.5 < 1.1 - (y - 58) / 14) onIt(x, y, y < 64 ? PS[1] : PS[2]);
  // The collar's points, standing off his neck either side
  for (const s of [-1, 1]) {
    const X = (x: number) => 128 + s * (x - 128);
    p.form(g => { g.moveTo(X(110), 100); g.lineTo(X(124), 107); g.lineTo(X(119), 117); g.lineTo(X(106), 108); g.closePath(); }, { ramp: SH, bevel: 2, amb: s < 0 ? 0.4 : 0.25, ink: I });
  }
  p.line(113, 100, 143, 100, SH[3]);
  // (the tie's knot, and the clip over the top of it)
  p.form(g => rot(g, [[123, 107], [133, 107], [132, 116], [124, 116]]), { ramp: PTIE, bevel: 3, amb: 0.25, ink: I });
  p.form(g => rot(g, [[121, 105], [135, 105], [135, 107.5], [121, 107.5]]), { ramp: St, bevel: 1, amb: 0.3, ink: I, spec: '#ffffff', wet: 0.6 });
  // The lanyard round his neck, its print, and the badge on the end of it
  for (const [x0, x1] of [[114, 99], [142, 107]]) {
    p.form(p.strokeMask(g => { g.moveTo(x0, 104); g.quadraticCurveTo((x0 + x1) / 2 + 2, 118, x1, 130); }, 2.6), { ramp: STRAP, bevel: 1, amb: 0.3, ink: null });
  }
  for (let k = 0; k < 6; k++) { p.px(113 - k * 2.2, 108 + k * 4, '#f4d0d0'); p.px(139 - k * 5, 108 + k * 3.6, '#f4d0d0'); }
  p.form(g => { g.rect(100, 127, 6, 5); }, { ramp: St, bevel: 1, amb: 0.3, ink: I, spec: '#ffffff', wet: 0.5 });
  p.form(g => { g.roundRect(88, 131, 26, 17, 1.5); }, { ramp: CARD, bevel: 2, amb: 0.45, ink: I });
  p.rect(89, 132, 24, 2, '#c81c1c');
  p.rect(90, 135, 8, 9, '#9cc4dc'); p.rect(92, 136, 4, 1, PHAIR[2]); p.disc(94, 139, 2, 2.5, PSKIN[4]); p.rect(92, 139, 5, 1, I); p.rect(91, 142, 6, 2, CHEAP[3]);
  p.rect(100, 136, 11, 1, '#1c1c24'); p.rect(100, 138, 9, 1, '#7c7c84'); p.rect(100, 140, 10, 1, '#7c7c84');
  for (let x = 100; x < 111; x++) if (hash(x * 1.3) > 0.4) p.px(x, 142, '#3c3c44');
  // The ears, out
  for (const [ex, s] of [[102, -1], [154, 1]] as const) {
    p.form(g => { g.ellipse(ex, 46, 5.5, 9.5, s * 0.35, 0, Math.PI * 2); }, { ramp: PS, bevel: 3, amb: s < 0 ? 0.22 : 0.1, ink: I });
    p.line(ex + s, 41, ex + s * 2, 51, PS[2]); p.line(ex + s * 2, 41, ex + s * 3, 50, '#d08878'); p.line(ex - s, 38, ex, 40, PS[7]);
  }
  // The head: small on top of all that; the chin not much of one
  p.form(g => { g.moveTo(106, 22); g.lineTo(150, 22); g.bezierCurveTo(153, 34, 153, 48, 151, 56); g.bezierCurveTo(148, 66, 138, 72, 128, 72); g.bezierCurveTo(118, 72, 108, 66, 105, 56); g.bezierCurveTo(103, 48, 103, 34, 106, 22); g.closePath(); },
    { ramp: PS, bevel: 13, amb: 0.2, ink: I, inkIn: PS[1] });
  // (the sheen of the sweat on his forehead; the far cheek in shade; under the chin)
  for (const [x, y] of [[112, 32], [120, 30], [135, 31], [141, 33], [126, 34]]) { p.px(x, y, PS[7]); p.px(x + 1, y, PS[6]); }
  for (let y = 40; y < 70; y++) for (let x = 140; x < 152; x++) if (bayer(x, y) + 0.5 < (x - 140) / 18) onIt(x, y, PS[3]);
  for (let x = 116; x < 140; x++) onIt(x, 70, PS[3]);
  // The nose: long and thin, the bridge (the shades down on it), the end of it, the nostrils, the shadow under
  p.line(127, 44, 126, 59, PS[6]); p.line(130, 46, 131, 59, PS[3]);
  p.form(g => { g.ellipse(128, 60, 3.5, 2.5, 0, 0, Math.PI * 2); }, { ramp: PS, bevel: 2, amb: 0.25, ink: null });
  p.px(126, 62, '#5a3428'); p.px(130, 62, '#5a3428'); p.line(125, 63, 131, 63, PS[3]); p.px(127, 59, PS[7]);
  // (the fuzz he calls a mustache; the zits on his chin)
  for (let k = 0; k < 9; k++) p.px(120 + k * 2, 64 + (k % 2), '#a88c70');
  for (const [x, y] of [[120, 68], [136, 67], [131, 70]]) { p.rect(x, y, 2, 2, '#d0705c'); p.px(x, y, '#f0a08c'); }
  // The hair: gelled flat to his head and parted, shining; the comb's lines in it
  p.form(g => { g.moveTo(103, 38); g.lineTo(103, 24); g.bezierCurveTo(103, 14, 114, 11, 128, 11); g.bezierCurveTo(143, 11, 154, 14, 154, 24); g.lineTo(154, 36); g.lineTo(151, 36); g.lineTo(150, 27); g.bezierCurveTo(140, 24.5, 120, 24.5, 107, 27.5); g.lineTo(106, 38); g.closePath(); },
    { ramp: Hh, bevel: 4, amb: 0.3, ink: I, gain: 1.1, spec: '#f0e0c0', wet: 0.75 });
  for (let y = 13; y < 26; y++) { p.px(117, y, PS[4]); p.px(116, y, Hh[0]); }
  for (let i = 0; i < 7; i++) for (let k = 0; k < 14; k++) onIt(120 + i * 5 + Math.round(k * 0.6), 12 + k, k % 5 < 3 ? Hh[1] : Hh[2]);
  for (let i = 0; i < 3; i++) for (let k = 0; k < 14; k++) onIt(113 - i * 4 - Math.round(k * 0.4), 12 + k, Hh[1]);
  for (let x = 120; x < 148; x += 2) onIt(x, 15 + Math.round(((x - 134) / 14) ** 2 * 2), '#d8c8a8');
  // (the cowlick, up at the crown anyway)
  for (const [x0, x1, y1] of [[138, 145, 4], [142, 150, 8]]) p.form(p.strokeMask(g => { g.moveTo(x0, 14); g.quadraticCurveTo(x0 + 1, 6, x1, y1); }, 2.4), { ramp: Hh, bevel: 1.5, amb: 0.45, ink: Hh[0], spec: '#f0e0c0', wet: 0.5 });
  // The shades: too big for him, out past the sides of his head, slipped down his nose; the arms up to his ears
  for (const s of [-1, 1]) {
    const X = (x: number) => 128 + s * (x - 128);
    p.form(g => { g.moveTo(X(99), 51); g.lineTo(X(127), 51); g.lineTo(X(126.5), 56); g.bezierCurveTo(X(126), 60, X(121), 61, X(114), 61); g.bezierCurveTo(X(105), 61, X(100), 59, X(99), 56); g.closePath(); },
      { ramp: LENS, bevel: 3, amb: 0.15, ink: I, gain: 1.1 });
    for (let x = 100; x < 126; x++) { onIt(X(x), 52, LENS[5]); onIt(X(x), 53, LENS[4]); }
    p.line(X(98), 52, X(100), 47, I);
  }
  p.line(97, 50, 159, 50, I); p.line(99, 51, 157, 51, '#3a3a4c');
  p.rect(126, 52, 4, 2, I);
});

/** His Adam's apple (it goes up and down his neck as he swallows). */
const pnApple = figure('pn-apple', 10, 12, 5, 6, q => {
  q.form(g => { g.ellipse(0, 0, 3.5, 4.5, 0, 0, Math.PI * 2); }, { ramp: PS, bevel: 3, amb: 0.2, ink: null });
  q.px(-1, -3, PS[7]); q.line(2, -2, 2, 3, PS[2]); q.line(-2, 5, 2, 5, PS[2]);
});

/** An eye over the top of his shades: (cx, cy) its middle; wide, the pupil shrunk to a dot (`pin`: to a point). */
const pnEye = (ctx: Ctx, cx: number, cy: number, hw: number, hh: number, pin: boolean) => {
  const half = (dy: number) => Math.round(hw * Math.sqrt(Math.max(0, 1 - (dy / (hh + 0.6)) ** 2)));
  // (the socket round it, a step darker; the white, shaded under the lid; the lid's line, the lower lid)
  for (let dy = -hh - 2; dy <= hh + 1; dy++) { const w = half(Math.max(-hh, Math.min(hh, dy))) + 2; R(ctx, cx - w, cy + dy, w * 2, 1, PS[4]); }
  for (let dy = -hh; dy <= hh; dy++) { const w = half(dy); if (w > 0) R(ctx, cx - w, cy + dy, w * 2, 1, dy === -hh ? '#dcd0c4' : '#fcf8f0'); }
  R(ctx, cx - 1, cy - 1, 3, 3, pin ? '#fcf8f0' : '#6c4c24'); R(ctx, cx, cy, 1, 1, FIG_INK);
  if (!pin) { R(ctx, cx - 1, cy - 1, 1, 1, '#fcfcfc'); R(ctx, cx + 1, cy + 1, 1, 1, '#4c3418'); }
  for (let dx = -hw; dx < hw; dx++) R(ctx, cx + dx, cy - hh - 1 + (Math.abs(dx + 0.5) > hw - 1.5 ? 1 : 0), 1, 1, FIG_INK);
  for (let dx = -hw + 2; dx < hw - 2; dx++) R(ctx, cx + dx, cy + hh + 1, 1, 1, PS[2]);
};

/**
 * The pencil neck who's been made to do the talking, up close (see pencilStill): the Adam's apple going up and down
 * his neck as he swallows; his eyes over the top of his shades, wide, the brows right up; the sweat; the shakes. The
 * other three behind him, out of focus, the gym dim.
 */
export const drawPencilNeck = (ctx: Ctx, t: number, talking: boolean, scared = false) => {
  gymBg(ctx); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, ART_W, ART_H);
  // The others behind him, out of focus: thin, the shoulders of their jackets out past them
  for (const [ox, oy] of [[28, 40], [206, 34], [232, 48]] as const) pencilBlur(ctx, ox, oy);
  ctx.save();
  // (the shakes)
  ctx.translate(Math.round(Math.sin(t * 1.9) * (scared ? 1.4 : 0.7)), 0);
  ctx.drawImage(pencilStill(), 0, 0);
  // The Adam's apple, going up and down
  const gulp = (t % 70) < 10 ? -5 : 0;
  pnApple(ctx, 128, 90 + gulp);
  // The eyes over the top of the shades, wide; the brows right up, worried
  const up = scared ? 2 : 0, hh = scared ? 4 : 3;
  for (const [ex, s] of [[116, -1], [140, 1]] as const) {
    pnEye(ctx, ex, 45, 5, hh, scared);
    for (let k = 0; k < 11; k++) { const inner = s < 0 ? k / 10 : 1 - k / 10; R(ctx, ex - 5 + k, 37 - up - Math.round(inner * 2.5), 1, 2, PHAIR[1]); R(ctx, ex - 5 + k, 39 - up - Math.round(inner * 2.5), 1, 1, PS[6]); }
  }
  // The mouth: a wobbly little line, or an O when he talks
  if (talking && t % 10 < 5) { ell(ctx, 128, 67, 4, 3, '#3a0606'); R(ctx, 126, 64, 4, 1, '#e8e0d0'); R(ctx, 126, 70, 4, 1, '#b06a5a'); }
  else for (let k = 0; k < 16; k++) { const y = 66 + (Math.floor(k / 4) % 2 ? -1 : 0); R(ctx, 120 + k, y, 1, 1, '#8c5040'); R(ctx, 120 + k, y + 1, 1, 1, PS[6]); }
  // Sweat: beads on his forehead, a drop running down his temple and off his jaw
  for (const [sx, sy] of [[112, 29], [127, 27], [143, 30]] as const) { R(ctx, sx, sy, 2, 3, '#9cdcfc'); R(ctx, sx, sy, 1, 1, '#fcfcfc'); R(ctx, sx + 1, sy + 2, 1, 1, '#5c9cc8'); }
  const run = (t * 0.6) % 40, dy = 32 + run;
  const dx = 107 + Math.round(Math.max(0, dy - 54) * 0.35);
  R(ctx, dx, dy, 2, 3, '#9cdcfc'); R(ctx, dx, dy, 1, 1, '#fcfcfc');
  ctx.restore();
};
