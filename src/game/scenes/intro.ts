// The opening, drawn the ending's way (SNES-style pixel art on a 256x144 canvas): Meathead
// benching in a dingy gym at five in the morning, two men in black suits in the doorway,
// the one who does the talking up close, Meathead trotting after them down a government
// corridor, and the briefing room: a projector, a screen, a man with a pointer, and the
// back of Meathead's head.

import { ART_W, ART_H, C, R, ell, hash, figure, over, rimLight, mhStandingFig, FIG_INK, DENIM, BELT, BOOT } from './ending';
import { agentFig, agentTalk, agentBlur, pencilFig, pencilBlur, DOOR_RIM } from './suits';
import { shatPants, shatFront, shatCloseUp } from './shatLook';
import { shaded, layer, ball, box, bands, RAMP } from './art/snes';

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

/** Where the agent's neck starts (under his ears, at the line of his jaw) and how far it's spread by his collar. */
const NECK_TOP = 68, NECK_BOTTOM = 108;
/** Half the neck's width at row y: the jaw's width up top, flaring out (faster the lower it gets) to the collar. */
const neckHalf = (y: number) => { const k = Math.max(0, Math.min(1, (y - NECK_TOP) / (NECK_BOTTOM - NECK_TOP))); return 32 + Math.round(k * k * 24); };

/** Where the jacket's shoulders, sloping up, meet the collar (each side, in from the neck's edge at the collar). */
const COLLAR_L = 120 - neckHalf(104) + 6, COLLAR_R = 120 + neckHalf(104) - 6;

/** The close-up agent's neck, row by row: stepped shading across it, lit on the left, the jaw's shadow over the top. */
const drawAgentNeck = (ctx: Ctx) => {
  const S = RAMP.aSkin;
  for (let y = NECK_TOP; y < NECK_BOTTOM; y++) {
    const h = neckHalf(y), l = 120 - h, r = 120 + h;
    // (under the jaw, the top few rows in its shadow, dithered off into the light below)
    const shadow = y < NECK_TOP + 6 || (y < NECK_TOP + 9 && y % 2 === 0);
    for (let x = l; x < r; x++) {
      const fromL = x - l, fromR = r - 1 - x;
      let c: string;
      if (fromL < 2) c = S[2];
      else if (fromR < 2) c = S[1];
      else if (fromL < 5) c = (fromL === 4 && (x + y) % 2) ? S[4] : S[3];
      else if (fromR < 6) c = (fromR === 5 && (x + y) % 2) ? S[3] : S[2];
      else if (x < 104) c = (x === 103 && (x + y) % 2) ? S[3] : S[4];
      else c = S[3];
      if (shadow && c !== S[1]) c = S[Math.max(1, S.indexOf(c) - 1)];
      R(ctx, x, y, 1, 1, c);
    }
    // (the cord down each side, from behind the ear toward the middle of the collar: a highlight on the lit side,
    // a crease on the other)
    const cord = Math.round((y - NECK_TOP) * 0.18);
    if (y > NECK_TOP + 4) { R(ctx, l + 6 + cord, y, 1, 1, S[5]); R(ctx, r - 8 - cord, y, 1, 1, S[1]); }
  }
};

/**
 * The top of the jacket at column x: the round of the shoulders out at the sides, and in toward the neck, the traps
 * under it climbing steeply up to the collar (whichever's higher), so the shoulders and the neck are one shape.
 */
const shoulderTop = (x: number) => {
  const dx = Math.abs(x + 0.5 - 120);
  const round = 150 - 42 * Math.sqrt(Math.max(0, 1 - (dx / 96) ** 2));
  const inset = dx - (120 - COLLAR_L);
  const traps = inset <= 0 ? 103 : 103 + (inset / 35) ** 2 * 30;
  return Math.min(round, traps);
};

/** The jacket over his shoulders and traps, as one form: lit from up on the left, brightest along the top of it. */
const drawAgentShoulders = (ctx: Ctx) => {
  const X = 24, Y = 100, W = 192, H = 92;
  shaded(ctx, 'ag-upper', X, Y, W, H, RAMP.aSuit, (u, v) => {
    const x = X + u * W, y = Y + v * H, top = shoulderTop(x - 0.5);
    if (y < top) return -1;
    // (a mound: turned toward the light up on the left, up along the top of it, away down the far side)
    const nx = Math.max(-0.95, Math.min(0.95, (x - 120) / 100));
    const ny = -Math.max(0, 1 - (y - top) / 16) * 0.85;
    const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    const lx = -0.4, ly = -0.75, lz = Math.sqrt(1 - lx * lx - ly * ly);
    return 0.06 + 0.94 * Math.max(0, nx * lx + ny * ly + nz * lz) * (1 - v * 0.35);
  });
};

/** The agent who talks, up close: shades, earpiece, the other one behind him, the gym out of focus. */
export const drawAgent = (ctx: Ctx, t: number, talking: boolean, where: 'gym' | 'briefing' = 'gym') => {
  if (where === 'gym') { gymBg(ctx); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, ART_W, ART_H); } else briefingBg(ctx, t, -1);
  // The other one, behind him, out of focus
  agentBlur(ctx, 215, 18);
  // The neck: out from under his jaw just below the ears and spreading as it goes down, wider than his head by the
  // time it's at his collar; the light from up on the left, the jaw's shadow across the top of it
  drawAgentNeck(ctx);
  // Shoulders, lapels, shirt, tie (the traps under the jacket sloping up into the collar)
  drawAgentShoulders(ctx);
  shaded(ctx, 'ag-shirt', 104, 104, 32, 40, RAMP.shirt, box(-0.5, -0.5, 0.3, 1, 0.3));
  ctx.fillStyle = G.suit;
  ctx.beginPath(); ctx.moveTo(104, 104); ctx.lineTo(120, 144); ctx.lineTo(96, 144); ctx.fill();
  ctx.beginPath(); ctx.moveTo(136, 104); ctx.lineTo(120, 144); ctx.lineTo(144, 144); ctx.fill();
  R(ctx, 116, 106, 8, 38, C.black);
  // Head: square, pale, a side parting you could cut yourself on
  shaded(ctx, 'ag-head', 88, 24, 64, 80, RAMP.aSkin, box(-0.5, -0.4, 0.18, 1, 0.45));
  shaded(ctx, 'ag-hair', 84, 12, 72, 16, RAMP.mHair, box(-0.4, -0.9, 0.1, 0.7, 1));
  R(ctx, 84, 28, 6, 14, RAMP.mHair[1]); R(ctx, 108, 12, 2, 10, '#3c3c3c');
  shaded(ctx, 'ag-ear', 80, 50, 8, 18, RAMP.aSkin, ball(-0.5, -0.4, 0.2)); shaded(ctx, 'ag-ear2', 152, 50, 8, 18, RAMP.aSkin, ball(-0.9, -0.2, 0.08));
  // The earpiece, and its coil down into the collar
  R(ctx, 154, 54, 4, 5, C.lightGray);
  for (let k = 0; k < 8; k++) R(ctx, 156 + (k % 2), 60 + k * 5, 2, 3, C.lightGray);
  // The shades, and a glint going across them
  R(ctx, 94, 44, 26, 12, G.shades); R(ctx, 124, 44, 26, 12, G.shades); R(ctx, 118, 46, 8, 2, G.shades);
  // (the lenses: the room's light across their tops, going dark down them)
  for (const lx of [94, 124]) { R(ctx, lx + 1, 45, 24, 2, '#1c1c28'); R(ctx, lx + 1, 47, 24, 1, '#10101a'); }
  const g = (t * 2) % 120;
  if (g < 26) { R(ctx, 94 + g, 45, 2, 4, G.glint); R(ctx, 124 + g, 45, 2, 4, G.glint); }
  // Nose, mouth: a flat line, or barely open when he talks
  R(ctx, 118, 58, 4, 16, G.skinShade);
  if (talking && t % 10 < 5) R(ctx, 108, 84, 24, 4, '#400000'); else { R(ctx, 108, 85, 24, 2, '#8c5040'); R(ctx, 112, 88, 16, 1, '#b08870'); }
  R(ctx, 88, 98, 64, 6, G.skinShade);
  // The comb's lines through the hair, and the shine on it
  for (let k = 0; k < 11; k++) R(ctx, 88 + k * 6, 16 + (k % 2), 4, 1, '#2a2a2a');
  R(ctx, 112, 14, 26, 2, '#34343c');
  // The inside of his ears; the cheekbones under the shades; the nostrils; the cleft in his chin; a five o'clock shadow
  R(ctx, 82, 54, 3, 10, '#a07858'); R(ctx, 155, 54, 3, 10, '#a07858');
  R(ctx, 96, 58, 20, 2, G.skinShade); R(ctx, 126, 58, 18, 2, G.skinShade);
  R(ctx, 114, 73, 3, 2, '#8c5c40'); R(ctx, 123, 73, 3, 2, '#8c5c40');
  R(ctx, 119, 92, 2, 5, G.skinShade);
  for (let i = 0; i < 60; i++) { const sx = 90 + hash(i * 2.3) * 60, sy = 80 + hash(i * 4.9) * 18; if (Math.abs(sx - 120) > 14 || sy > 90) R(ctx, sx, sy, 1, 1, '#b8987c'); }
  // Meathead, in his shades (a tiny one in each lens)
  for (const lx of [104, 134]) { R(ctx, lx, 49, 5, 5, C.mSkin); R(ctx, lx, 48, 5, 2, C.mHair); R(ctx, lx - 2, 54, 9, 2, C.mSkin); }
  // (the collar, buttoned, and losing: dug in round that neck, the neck rolling over the top of it)
  for (let x = COLLAR_L - 2; x <= COLLAR_R + 2; x++) {
    // (going off round the neck at the sides, into the shade, and tucked down under the jacket at the ends)
    const out = Math.abs(x - 120) - 38, end = Math.max(0, Math.abs(x - 120) - (120 - COLLAR_L) + 1);
    const c = out > 8 ? (x < 120 ? '#9c9ca4' : '#7c7c84') : out > 0 ? ((x + 104) % 2 ? '#c8c8c8' : (x < 120 ? '#e0e0e0' : '#a8a8a8')) : x < 120 ? G.shirt : '#d8d8d8';
    R(ctx, x, 104 + end, 1, 4 - Math.min(3, end), c); R(ctx, x, 108, 1, 1, '#3c3c44');
    // (the neck just above it, in the collar's shadow)
    if (x < 88 || x >= 152) { R(ctx, x, 103 + end, 1, 1, RAMP.aSkin[1]); if ((x + 102) % 2) R(ctx, x, 102 + end, 1, 1, RAMP.aSkin[2]); }
  }
  // (and its points, down onto the shirt either side of the knot)
  for (let i = 0; i < 6; i++) { R(ctx, 106 + i, 108, 1, 5 - Math.floor(i * 0.8), G.shirt); R(ctx, 128 + i, 108, 1, 1 + Math.floor(i * 0.8), '#d0d0d0'); }
  // The tie's knot, the clip, the flag on his lapel, the edges of the lapels catching the light
  R(ctx, 115, 104, 10, 6, '#1c1c1c'); R(ctx, 114, 124, 12, 1, C.gold);
  R(ctx, 96, 118, 6, 4, C.white); R(ctx, 96, 118, 6, 1, C.red); R(ctx, 96, 120, 6, 1, C.red); R(ctx, 96, 118, 2, 2, C.blue);
  for (let i = 0; i < 40; i++) { R(ctx, 104 - Math.floor(i * 0.2), 104 + i, 1, 1, G.suitLit); R(ctx, 136 + Math.floor(i * 0.2), 104 + i, 1, 1, G.suitLit); }
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

// Each one's head in silhouette, as he looks now: (cx, top) is the top of the head, which is a round about 11 across
// sitting 12 below it. Anything lit (a lens, an ember, a bulb) is drawn in its own colour; the rest in the ink.
const lit = (ctx: Ctx, color: string, draw: () => void) => { const f = ctx.fillStyle; ctx.fillStyle = color; draw(); ctx.fillStyle = f; };

const BOSS_SLIDES: Record<string, { name: string; where: string; color: string; head: (ctx: Ctx, cx: number, top: number) => void }> = {
  artie: {
    name: 'ARTIE AVALANCHE', where: 'ANCHORAGE, AK', color: '#60a5fa',
    // (wild hair sticking up, snow goggles up on his forehead, a big frosted beard, ice grown out of his shoulders)
    head: (ctx, cx, top) => {
      for (const [dx, h] of [[-11, 7], [-5, 10], [1, 8], [7, 10], [12, 6]]) { ctx.beginPath(); ctx.moveTo(cx + dx - 3, top + 6); ctx.lineTo(cx + dx, top + 6 - h); ctx.lineTo(cx + dx + 3, top + 6); ctx.fill(); }
      ctx.beginPath(); ctx.moveTo(cx - 11, top + 14); ctx.quadraticCurveTo(cx - 10, top + 30, cx, top + 33); ctx.quadraticCurveTo(cx + 10, top + 30, cx + 11, top + 14); ctx.fill();
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s * 16, top + 26); ctx.lineTo(cx + s * 22, top + 14); ctx.lineTo(cx + s * 20, top + 26); ctx.fill(); }
      lit(ctx, '#38bdf8', () => { ctx.fillRect(cx - 8, top + 3, 6, 3); ctx.fillRect(cx + 2, top + 3, 6, 3); });
    },
  },
  victor: {
    name: 'VICTOR VOLCANO', where: 'HILO, HI', color: '#f97316',
    // (a man bun, a sweatband, the collar of the open shirt standing up either side of his neck, a glowing pendant)
    head: (ctx, cx, top) => {
      ctx.beginPath(); ctx.arc(cx - 6, top - 1, 5, 0, Math.PI * 2); ctx.fill();
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s * 6, top + 22); ctx.lineTo(cx + s * 15, top + 20); ctx.lineTo(cx + s * 10, top + 30); ctx.fill(); }
      lit(ctx, '#ea580c', () => ctx.fillRect(cx - 12, top + 3, 24, 3));
      lit(ctx, '#f97316', () => ctx.fillRect(cx - 1, top + 32, 3, 4));
    },
  },
  ernie: {
    name: 'ERNIE EARTHQUAKE', where: 'SAN FRANCISCO, CA', color: '#b45309',
    // (bald on top with tufts out the sides, thick glasses catching the light, a pencil behind his ear, jowls)
    head: (ctx, cx, top) => {
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + s * 12, top + 9, 4, 0, Math.PI * 2); ctx.arc(cx + s * 11, top + 5, 3, 0, Math.PI * 2); ctx.fill(); }
      ctx.beginPath(); ctx.arc(cx - 7, top + 21, 5, 0, Math.PI * 2); ctx.arc(cx + 7, top + 21, 5, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.translate(cx + 12, top + 4); ctx.rotate(0.5); ctx.fillRect(-1, -9, 2, 10); ctx.restore();
      lit(ctx, '#e7e5e4', () => { ctx.fillRect(cx - 9, top + 8, 7, 1); ctx.fillRect(cx + 2, top + 8, 7, 1); });
    },
  },
  hector: {
    name: 'HECTOR HURRICANE', where: 'MIAMI, FL', color: '#14b8a6',
    // (lacquered TV hair swept up at the front, the windbreaker's collar popped up round his neck, the clicker)
    head: (ctx, cx, top) => {
      ctx.beginPath(); ctx.moveTo(cx - 11, top + 7); ctx.quadraticCurveTo(cx - 10, top - 4, cx + 2, top - 5); ctx.quadraticCurveTo(cx + 14, top - 7, cx + 15, top + 2); ctx.quadraticCurveTo(cx + 8, top + 1, cx + 3, top + 3); ctx.closePath(); ctx.fill();
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s * 7, top + 24); ctx.lineTo(cx + s * 16, top + 16); ctx.lineTo(cx + s * 15, top + 28); ctx.fill(); }
      lit(ctx, '#dc2626', () => ctx.fillRect(cx - 24, top + 20, 2, 2));
      ctx.fillRect(cx - 25, top + 22, 4, 6);
    },
  },
  tommy: {
    name: 'TOXIC TOMMY', where: 'FLINT, MI', color: '#65a30d',
    // (bloated, the hazmat hood hanging off his back, the tank of sludge over one shoulder, dripping)
    head: (ctx, cx, top) => {
      ctx.beginPath(); ctx.arc(cx - 9, top + 20, 7, 0, Math.PI * 2); ctx.arc(cx + 9, top + 20, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(cx - 24, top + 4, 9, 24);
      lit(ctx, '#84cc16', () => ctx.fillRect(cx - 22, top + 12, 5, 14));
      ctx.fillRect(cx - 16, top + 24, 3, 12); ctx.fillRect(cx + 14, top + 26, 3, 10);
    },
  },
  barry: {
    name: 'BLACKOUT BARRY', where: 'NEW YORK, NY', color: '#3b82f6',
    // (the hard hat, foil round it, an antenna up off the top with its bulb blinking, insulators on his shoulders)
    head: (ctx, cx, top) => {
      ctx.beginPath(); ctx.arc(cx, top + 7, 13, Math.PI, 0); ctx.fill(); ctx.fillRect(cx - 17, top + 5, 34, 3);
      ctx.fillRect(cx + 4, top - 14, 1, 10);
      lit(ctx, '#f87171', () => { ctx.beginPath(); ctx.arc(cx + 4.5, top - 15, 2, 0, Math.PI * 2); ctx.fill(); });
      lit(ctx, '#9ca3af', () => ctx.fillRect(cx - 13, top + 1, 26, 2));
      for (const s of [-1, 1]) for (let k = 0; k < 3; k++) ctx.fillRect(cx + s * 21 - 4 + k * 0.5, top + 22 - k * 4, 8 - k, 3);
    },
  },
  oscar: {
    name: 'OILY OSCAR', where: 'HOUSTON, TX', color: '#ca8a04',
    // (the Stetson, the cigarette's ember, the fire suit's hood down round his neck, the launcher up on his shoulder)
    head: (ctx, cx, top) => {
      ctx.beginPath(); ctx.ellipse(cx, top + 4, 22, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx - 11, top + 3); ctx.lineTo(cx - 10, top - 9); ctx.quadraticCurveTo(cx, top - 6, cx, top - 11); ctx.quadraticCurveTo(cx, top - 6, cx + 10, top - 9); ctx.lineTo(cx + 11, top + 3); ctx.fill();
      ctx.fillRect(cx + 16, top + 16, 26, 9);
      lit(ctx, '#fcfcfc', () => ctx.fillRect(cx + 8, top + 20, 8, 2)); lit(ctx, '#d82800', () => ctx.fillRect(cx + 16, top + 20, 2, 2));
    },
  },
  dale: {
    name: 'DRUG TRADE DALE', where: 'ALBUQUERQUE, NM', color: '#ec4899',
    // (a towering pompadour with the aviators pushed up into it, the shoulder pads, the dollar medallion)
    head: (ctx, cx, top) => {
      ctx.beginPath(); ctx.moveTo(cx - 12, top + 8); ctx.quadraticCurveTo(cx - 14, top - 6, cx - 2, top - 8); ctx.quadraticCurveTo(cx + 10, top - 14, cx + 17, top - 5); ctx.quadraticCurveTo(cx + 8, top - 1, cx + 4, top + 2); ctx.closePath(); ctx.fill();
      for (const s of [-1, 1]) ctx.fillRect(cx + s * 20 - 6, top + 22, 12, 7);
      lit(ctx, '#ff007f', () => { ctx.fillRect(cx - 7, top - 4, 5, 2); ctx.fillRect(cx + 2, top - 5, 5, 2); });
      lit(ctx, '#ffd700', () => { ctx.beginPath(); ctx.arc(cx, top + 34, 2.5, 0, Math.PI * 2); ctx.fill(); });
    },
  },
};

/** Each set's four, in order, and their title on the slide. */
const SETS = { four: { title: 'THE FOUR ASSHOLES', keys: ['artie', 'victor', 'ernie', 'hector'] }, four2: { title: 'FOUR MORE ASSHOLES', keys: ['tommy', 'barry', 'oscar', 'dale'] } };

/** A boss in silhouette on the slide: a head, shoulders, and the red stamp over him. */
const slideBoss = (ctx: Ctx, cx: number, base: number, key: string, s = 1) => {
  const b = BOSS_SLIDES[key];
  ctx.fillStyle = C.ink;
  ell(ctx, cx, base - 34 * s, 11 * s, 12 * s, C.ink);
  R(ctx, cx - 18 * s, base - 22 * s, 36 * s, 22 * s, C.ink);
  // (his head's details at the same scale as the rest of him)
  ctx.save(); ctx.translate(cx, base - 46 * s); ctx.scale(s, s); ctx.fillStyle = C.ink; b.head(ctx, 0, 0); ctx.restore();
  R(ctx, cx - 5 * s, base - 36 * s, 3 * s, 2 * s, b.color); R(ctx, cx + 2 * s, base - 36 * s, 3 * s, 2 * s, b.color);
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
    SETS[slide].keys.forEach((k, i) => slideBoss(ctx, 91 + i * 30, 80, k, 0.62));
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
  R(ctx, 76, 16, 50, 64, b.color);
  slideBoss(ctx, 101, 80, slide, 1);
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

const PN = { suit: '#1c1c22', suitLit: '#34343e', suitDark: '#0c0c10', skin: '#ecc8a4', skinShade: '#c4987c', skinDeep: '#9c7458', hair: '#4c3418', hairLit: '#7c5c34', lanyard: '#c81c1c' };

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

/**
 * The pencil neck who's been made to do the talking, up close: the suit hanging off him, the collar loose round a neck
 * like a broom handle (the Adam's apple going up and down it as he swallows), the clip-on tie crooked, the lanyard,
 * the badge (INTERN); the shades slipped down his nose and his eyes over the top of them, wide; the sweat; the shakes.
 * The other three behind him, out of focus, the gym dim.
 */
export const drawPencilNeck = (ctx: Ctx, t: number, talking: boolean, scared = false) => {
  gymBg(ctx); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, ART_W, ART_H);
  // The others behind him, out of focus: thin, the shoulders of their jackets out past them
  for (const [ox, oy] of [[28, 40], [206, 34], [232, 48]] as const) pencilBlur(ctx, ox, oy);
  ctx.save();
  // (the shakes)
  ctx.translate(Math.round(Math.sin(t * 1.9) * (scared ? 1.4 : 0.7)), 0);
  // The jacket: shoulders out past his own (the pads), sagging; the lapels; the gap round his neck
  shaded(ctx, 'pn-shoulders', 40, 112, 176, 70, RAMP.aSuit, ball(-0.4, -0.85, 0.1));
  ctx.fillStyle = PN.suitDark; ctx.beginPath(); ctx.moveTo(108, 108); ctx.lineTo(126, 144); ctx.lineTo(98, 144); ctx.fill(); ctx.beginPath(); ctx.moveTo(148, 108); ctx.lineTo(130, 144); ctx.lineTo(158, 144); ctx.fill();
  // (the shirt collar, a size too big, standing off his neck)
  ctx.fillStyle = '#e8e8ec'; ctx.beginPath(); ctx.moveTo(110, 104); ctx.lineTo(146, 104); ctx.lineTo(140, 116); ctx.lineTo(128, 112); ctx.lineTo(116, 116); ctx.closePath(); ctx.fill();
  R(ctx, 112, 112, 32, 32, '#d8d8e0');
  // (the clip-on tie, crooked, the clip showing)
  ctx.save(); ctx.translate(128, 112); ctx.rotate(0.12);
  R(ctx, -4, 0, 8, 6, '#1c2c6c'); R(ctx, -3, 6, 6, 26, '#24348c'); R(ctx, -3, 6, 1, 26, '#3c4ca4'); R(ctx, -4, -1, 8, 2, '#9c9ca4');
  ctx.restore();
  // (the lanyard and the badge: INTERN, and a photo of him looking exactly this scared)
  ctx.strokeStyle = PN.lanyard; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(114, 108); ctx.lineTo(96, 132); ctx.moveTo(142, 108); ctx.lineTo(104, 132); ctx.stroke();
  R(ctx, 88, 130, 26, 14, C.white); R(ctx, 90, 132, 8, 9, '#9cc4dc'); R(ctx, 92, 133, 4, 4, PN.skin); R(ctx, 100, 133, 12, 2, C.ink); R(ctx, 100, 137, 10, 1, C.gray);
  // The neck: long and thin, the cords in it, the Adam's apple (going up and down)
  shaded(ctx, 'pn-neck', 118, 64, 20, 48, RAMP.aSkin, box(-0.5, -0.3, 0.2, 1, 0.2));
  const gulp = (t % 70) < 10 ? -5 : 0;
  ell(ctx, 129, 90 + gulp, 4, 4, PN.skin); R(ctx, 131, 88 + gulp, 2, 5, PN.skinShade);
  R(ctx, 121, 70, 1, 34, PN.skinShade); R(ctx, 135, 70, 1, 34, PN.skinShade);
  // The head: smaller than you'd think, on top of all that
  shaded(ctx, 'pn-head', 100, 16, 56, 56, RAMP.aSkin, box(-0.5, -0.4, 0.2, 1, 0.5));
  shaded(ctx, 'pn-ear', 94, 38, 8, 16, RAMP.aSkin, ball(-0.5, -0.4, 0.2)); shaded(ctx, 'pn-ear2', 154, 38, 8, 16, RAMP.aSkin, ball(-0.9, -0.2, 0.08));
  // (the hair: gelled flat and parted, shining, a cowlick sticking up anyway)
  R(ctx, 98, 12, 60, 10, PN.hair); R(ctx, 98, 20, 6, 10, PN.hair); for (let k = 0; k < 9; k++) R(ctx, 104 + k * 6, 13 + (k % 2), 4, 1, PN.hairLit);
  R(ctx, 116, 12, 2, 8, '#2c1c08'); R(ctx, 140, 6, 2, 7, PN.hair); R(ctx, 142, 4, 2, 3, PN.hair);
  R(ctx, 118, 14, 30, 2, 'rgba(255,255,255,0.3)');
  // (the eyes, over the top of the shades: wide, the brows right up)
  const wide = scared ? 6 : 5;
  for (const ex of [112, 136]) {
    R(ctx, ex, 38 - (scared ? 2 : 0), 10, 2, PN.hair);
    R(ctx, ex, 42, 10, wide, C.white); R(ctx, ex + 4, 43, 3, 3, C.ink); R(ctx, ex + 4, 43, 1, 1, C.white);
  }
  // (the shades, too big for him, slipped down his nose)
  R(ctx, 104, 50, 22, 10, G.shades); R(ctx, 130, 50, 22, 10, G.shades); R(ctx, 124, 52, 8, 2, G.shades);
  R(ctx, 105, 51, 20, 1, '#2c2c3c'); R(ctx, 131, 51, 20, 1, '#2c2c3c');
  // Nose, the mouth: a wobbly little line, or an O when he talks
  R(ctx, 126, 58, 4, 8, PN.skinShade);
  if (talking && t % 10 < 5) ell(ctx, 128, 66, 4, 3, '#400000'); else { R(ctx, 120, 66, 4, 1, '#8c5040'); R(ctx, 124, 65, 4, 1, '#8c5040'); R(ctx, 128, 66, 4, 1, '#8c5040'); R(ctx, 132, 65, 4, 1, '#8c5040'); }
  // (the zits on his chin, the fuzz he calls a mustache)
  R(ctx, 120, 69, 2, 2, '#d47c6c'); R(ctx, 136, 68, 2, 2, '#d47c6c');
  for (let k = 0; k < 8; k++) R(ctx, 120 + k * 2, 63, 1, 1, '#b89c7c');
  // Sweat: beads on his forehead, a drop running down his temple and off his jaw
  for (const [sx, sy] of [[110, 28], [128, 26], [146, 30]] as const) R(ctx, sx, sy, 2, 3, '#9cdcfc');
  const run = (t * 0.6) % 40;
  R(ctx, 104, 32 + run, 2, 3, '#9cdcfc');
  ctx.restore();
};
