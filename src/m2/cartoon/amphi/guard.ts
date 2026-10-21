// THE SECURITY GUARD at the stage steps (the amphitheater's boss door: his nuts). A big man (half again Meathead's
// size): dark brown skin, the head shaved and shining, a short black goatee, an earpiece with its coiled wire down into
// his collar, a black polo with SECURITY across the chest in yellow, the EVENT STAFF lanyard, black cargo pants, a radio
// on his belt, black boots, a gold watch on a thick wrist. Arms folded, feet planted, facing the bleachers.
//
// drawGuard(c, x, feetY, pose, frame, t, ice): 'stand' (arms folded), 'stop' (a palm up at him), 'hit' (the kick landed:
// knees together, up on his toes, both hands down there, eyes popping), 'keel' (t 0..1: from the hit down to his knees
// and over onto his side), 'down' (on his side, curled up, clutching; a later visit: an ice pack on it).
// drawGuardCloseup(c, cx, cy, s, frame, t): his face the moment it lands (t 0..1 through the close-up: the eyes pop,
// cross, water; the face goes gray; the mouth goes from a little O to every tooth).

import { type Ctx, type Ramp, rampOf, rampMix, shape, shapeTop, ell, px, line, limb, fill, dith } from './paint';

export type GuardPose = 'stand' | 'stop' | 'hit' | 'keel' | 'down';
export const GUARD_H = 96;

const SKIN: Ramp = ['#9C6E52', '#74482F', '#5A3622', '#422616', '#1E0F08'];
const SICK: Ramp = rampMix(SKIN, '#7A8A62', 0.35);
const POLO = rampOf('#26262E', '#000000'), PANTS = rampOf('#2E3138', '#000000'), BOOT: Ramp = ['#3A3A3A', '#1E1E1E', '#141414', '#0A0A0A', '#000000'];
const BEARD = '#141010', YELLOW = '#F5C518', ICE: Ramp = ['#D6F0FF', '#8FD0F2', '#5AA8D8', '#3A82B4', '#16405E'];

/** SECURITY across the chest (little block letters in yellow). */
const security = (c: Ctx, x: number, y: number, w: number) => {
  px(c, x - w / 2, y - 1, w, 6, '#1A1A20');
  const L = 'SECURITY', cw = w / L.length;
  for (let i = 0; i < L.length; i++) { px(c, x - w / 2 + i * cw + 0.6, y, cw - 1.4, 1, YELLOW); px(c, x - w / 2 + i * cw + 0.6, y + 3, cw - 1.4, 1, YELLOW); px(c, x - w / 2 + i * cw + 0.6, y, 1, 4, YELLOW); }
};

/** His head at (hx, hy) (facing left): `look` 'calm' | 'stern' | 'pop' (the kick) | 'pain' (down). */
const head = (c: Ctx, hx: number, hy: number, look: 'calm' | 'stern' | 'pop' | 'pain', f: number, sick = 0) => {
  const S = sick > 0.5 ? SICK : SKIN;
  // (the neck: thick)
  shape(c, () => c.rect(hx - 6, hy + 6, 13, 9), S, hx - 6, hx + 7);
  shape(c, () => c.ellipse(hx, hy, 11, 12, 0, 0, Math.PI * 2), S, hx - 11, hx + 11);
  ell(c, hx - 4, hy - 8, 4, 2, 'rgba(255,255,255,0.35)', -0.3);
  // (the near ear and the earpiece, its coiled wire down into the collar)
  shape(c, () => c.ellipse(hx + 6, hy + 1, 2.6, 4, 0, 0, Math.PI * 2), S, hx + 3.4, hx + 8.6, 0.8);
  ell(c, hx + 6, hy + 1, 1.2, 1.4, '#E8E8E8');
  for (let k = 0; k < 5; k++) { c.strokeStyle = '#D8D8D8'; c.lineWidth = 0.6; c.beginPath(); c.arc(hx + 7, hy + 5 + k * 2, 1.2, 0, Math.PI * 2); c.stroke(); }
  // (the brows, the eyes)
  const pop = look === 'pop';
  line(c, [hx - 10, hy - 4 - (pop ? 3 : look === 'stern' ? -1 : 0), hx - 5, hy - 4 - (pop ? 3 : look === 'stern' ? 0 : 0)], 1.6, BEARD);
  line(c, [hx - 3, hy - 4 - (pop ? 3 : 0), hx + 1, hy - 3 - (pop ? 2 : look === 'stern' ? -1 : 0)], 1.6, BEARD);
  if (look === 'pain') { line(c, [hx - 10, hy - 1, hx - 6, hy - 2.4, hx - 10, hy - 3.6], 0.9, BEARD); line(c, [hx - 3, hy - 3.6, hx + 1, hy - 2.4, hx - 3, hy - 1], 0.9, BEARD); }
  else {
    const r = pop ? 2.6 : 1.6;
    for (const ex of [hx - 7.5, hx - 1]) { ell(c, ex, hy - 1.6, r, r, '#FAFAF6'); px(c, ex + (pop ? (ex < hx - 4 ? 0.8 : -1.6) : -1.2), hy - 2, pop ? 0.8 : 1.4, pop ? 0.8 : 1.4, '#120A06'); }
  }
  // (the nose, the goatee round the mouth)
  shape(c, () => c.ellipse(hx - 10, hy + 2.4, 2.6, 2.2, 0, 0, Math.PI * 2), S, hx - 12.6, hx - 7.4, 0.8);
  fill(c, BEARD, () => { c.moveTo(hx - 11, hy + 5); c.quadraticCurveTo(hx - 6, hy + 4, hx - 2, hy + 6); c.lineTo(hx - 3, hy + 12); c.quadraticCurveTo(hx - 7, hy + 14, hx - 10, hy + 11); c.closePath(); });
  if (look === 'pop') { ell(c, hx - 7, hy + 8.4, 1.6, 2, '#3A0E0E'); }
  else if (look === 'pain') { px(c, hx - 10, hy + 7, 6, 2.4, '#F4F0E4'); line(c, [hx - 10, hy + 8.2, hx - 4, hy + 8.2], 0.5, '#5A4A3A'); }
  else line(c, [hx - 10, hy + 8, hx - 4, hy + 8], 1, '#3A1A10');
  if (look === 'pop' || look === 'pain') { const u = (f % 50) / 50; ell(c, hx + 2, hy - 8 + u * 10, 0.9, 1.4, '#DDF0FF'); }
  void sick;
};

/** An arm (the joints pass: "the security guard's elbows don't render"): the shoulder's round cap in the polo, the
 *  short sleeve over the top of the upper arm (its stitched hem), the bare arm down to the elbow's knob (a crease in its
 *  crook), the forearm to the hand; `back` the far one (a shade darker). */
const arm = (c: Ctx, sx: number, sy: number, ex: number, ey: number, hx: number, hy: number, back: boolean) => {
  const P = back ? rampMix(POLO, '#000000', 0.2) : POLO, S = back ? rampMix(SKIN, '#000000', 0.15) : SKIN;
  limb(c, sx, sy, 6.2, ex, ey, 5.4, S);
  limb(c, ex, ey, 5.4, hx, hy, 4.8, S);
  // (the elbow: its knob, a crease in the crook, a lit point)
  ell(c, ex, ey, 5.2, 5.2, S[2]); ell(c, ex - 0.6, ey - 0.6, 4.2, 4.2, S[1]);
  const ux = hx - ex, uy = hy - ey, ul = Math.hypot(ux, uy) || 1, vx = sx - ex, vy = sy - ey, vl = Math.hypot(vx, vy) || 1;
  const bx = (ux / ul + vx / vl), by = (uy / ul + vy / vl), bl = Math.hypot(bx, by) || 1;
  line(c, [ex + (bx / bl) * 2.6 - (by / bl) * 2, ey + (by / bl) * 2.6 + (bx / bl) * 2, ex + (bx / bl) * 3.4 + (by / bl) * 2, ey + (by / bl) * 3.4 - (bx / bl) * 2], 0.8, S[4]);
  px(c, ex - (bx / bl) * 3.4 - 0.6, ey - (by / bl) * 3.4 - 0.6, 1.4, 1.4, S[0]);
  // (the sleeve: over the shoulder and the top half of the upper arm, a hem across its end)
  const mx = sx + (ex - sx) * 0.5, my = sy + (ey - sy) * 0.5;
  limb(c, sx, sy, 7.6, mx, my, 6.8, P);
  const nx = -(ey - sy) / (Math.hypot(ex - sx, ey - sy) || 1), ny = (ex - sx) / (Math.hypot(ex - sx, ey - sy) || 1);
  line(c, [mx + nx * 6, my + ny * 6, mx - nx * 6, my - ny * 6], 1.2, P[3]);
  ell(c, sx, sy - 1, 7.4, 6.4, P[1]); ell(c, sx - 1, sy - 3, 4, 2, P[0]);
};

/** Him stood (stand, stop, hit), his feet at (x, feetY), facing left. */
export const drawGuard = (c: Ctx, x: number, feetY: number, pose: GuardPose, f: number, t = 0, ice = false) => {
  c.save(); c.translate(Math.round(x), Math.round(feetY));
  if (pose === 'down' || (pose === 'keel' && t > 0.55)) { drawLying(c, f, pose === 'keel' ? (t - 0.55) / 0.45 : 1, ice); c.restore(); return; }
  const kneel = pose === 'keel' ? Math.min(1, t / 0.55) : 0;
  const hit = pose === 'hit' || pose === 'keel';
  const breathe = Math.sin(f * 0.05) * 0.6, toes = pose === 'hit' ? 3 : 0;
  // (the skeleton: stood, or doubled over going down to his knees)
  const hipY = -44 + kneel * 22 - toes, shY = -76 + kneel * 18 - toes + (hit ? 6 : 0) + breathe;
  const lean = hit ? 10 + kneel * 6 : 0;
  const kneeY = -22 + kneel * 18 - toes;
  // (legs: the knees knocked together on the hit; on his knees going down)
  for (const s of [1, -1]) {
    const near = s < 0;
    const P = near ? PANTS : rampMix(PANTS, '#000000', 0.2);
    const kx = hit ? -2 + s * 1 : s * 8, fx = kneel > 0.5 ? s * 6 + 14 : hit ? s * 8 : s * 10;
    const fy = kneel > 0.5 ? -2 : -toes;
    limb(c, s * 7, hipY, 8, kx - kneel * 6, kneeY, 7, P);
    limb(c, kx - kneel * 6, kneeY, 7, fx, fy - 6, 6, P);
    for (let k = 0; k < 2; k++) px(c, kx - kneel * 6 - 4 + k * 5, kneeY - 10, 3, 6, P[2]);
    // (the cargo pocket on the thigh, its flap and snap)
    const tx = (s * 7 + kx - kneel * 6) / 2, ty = (hipY + kneeY) / 2;
    shape(c, () => c.rect(tx - 4, ty - 4, 8, 9), P, tx - 4, tx + 4, 0.6); px(c, tx - 4, ty - 4, 8, 2, P[3]); px(c, tx - 0.6, ty - 3, 1.2, 1, '#5A5E66');
    shape(c, () => c.roundRect(fx - (kneel > 0.5 ? 2 : 10), fy - 8, 15, 8, [3, 4, 1, 1]), BOOT, fx - 10, fx + 5);
    for (let k = 0; k < 3; k++) px(c, fx - (kneel > 0.5 ? -2 : 6) + k * 2.4, fy - 7, 1.4, 0.6, '#5A5A5A');
    px(c, fx - (kneel > 0.5 ? 2 : 10), fy - 1.4, 15, 1.4, '#3A3A3A');
  }
  // (the belt, the radio on it)
  shape(c, () => c.rect(-15, hipY - 4, 30, 6), BOOT, -15, 15);
  px(c, -2, hipY - 3, 4, 4, '#C9A43A');
  shape(c, () => c.roundRect(8, hipY - 12, 7, 12, 1.5), BOOT, 8, 15); line(c, [12, hipY - 12, 12, hipY - 22], 1.4, '#1A1A1A');
  if (pose === 'stand' || pose === 'stop') px(c, 9, hipY - 10, 2, 1.4, (f % 60) < 30 ? '#22C55E' : '#14532D');
  // (the polo: broad, tight over the arms; SECURITY; the lanyard)
  c.save(); c.translate(0, hipY); c.rotate(-lean * 0.02); c.translate(0, -hipY);
  shape(c, () => { c.moveTo(-17, hipY - 2); c.lineTo(-21, shY + 6); c.quadraticCurveTo(-18, shY - 2, -8, shY - 2); c.lineTo(10, shY - 2); c.quadraticCurveTo(21, shY - 1, 21, shY + 8); c.lineTo(17, hipY - 2); c.closePath(); }, POLO, -21, 21);
  security(c, -1, shY + 10, 30);
  line(c, [-6, shY, -2, shY + 20, 4, shY], 1, YELLOW); shape(c, () => c.rect(-5, shY + 19, 8, 10), ['#FFFFFF', '#F2F2F2', '#D6D6D6', '#B0B0B0', '#5A5A5A'], -5, 3, 0.6); px(c, -4, shY + 21, 6, 2, YELLOW);
  px(c, -6, shY - 2, 12, 3, POLO[0]);
  // (the polo's placket and its two buttons; the ID on the lanyard: a photo, the lines; the stitched sleeve hems)
  px(c, -1.4, shY - 1, 3, 9, POLO[2]); px(c, -0.6, shY + 2, 1.4, 1.4, '#5A5A66'); px(c, -0.6, shY + 5.4, 1.4, 1.4, '#5A5A66');
  px(c, -4, shY + 21.4, 2.6, 3, '#74482F'); px(c, -0.8, shY + 21.6, 3, 0.8, '#5A5A5A'); px(c, -0.8, shY + 23.4, 3, 0.6, '#9A9A9A'); px(c, -4, shY + 25.6, 6, 1.4, YELLOW);
  // (the arms: folded across the chest; the stop's palm out; both down there on the hit)
  if (pose === 'stand') {
    arm(c, 16, shY + 4, 10, shY + 22, -14, shY + 18, true);
    arm(c, -16, shY + 4, -12, shY + 20, 12, shY + 14, false);
    ell(c, 12, shY + 14, 4.6, 4, SKIN[1]); ell(c, -14, shY + 18, 4.6, 4, SKIN[1]);
    px(c, 4, shY + 16, 4, 3, '#C9A43A');
  } else if (pose === 'stop') {
    arm(c, 16, shY + 4, 14, shY + 24, 12, hipY - 10, true);
    arm(c, -16, shY + 4, -28, shY + 8, -36, shY - 10, false);
    shape(c, () => c.roundRect(-41, shY - 22, 10, 13, 3), SKIN, -41, -31, 0.8);
    for (let k = 0; k < 4; k++) px(c, -40.4 + k * 2.4, shY - 25, 1.8, 4, SKIN[1]);
    px(c, -38, shY - 6, 6, 2, '#C9A43A');
  } else {
    // (both hands down there, cupping: the elbows tucked in tight, the shoulders hunched up round his ears)
    for (const s of [1, -1]) arm(c, s * 15, shY + 5, s * 9, shY + 24, -6 + s * 3, hipY + 2, s > 0);
    ell(c, -5, hipY + 2, 6, 4.4, SKIN[1]); px(c, -9, hipY + 1, 8, 1, SKIN[3]);
  }
  // (the head on the neck between his shoulders; on the hit, sunk down into them, wincing, over his hands)
  if (hit) head(c, -2 - lean * 0.1, shY - 10, 'pop', f, kneel);
  else head(c, -2, shY - 14, pose === 'stand' ? 'calm' : 'stern', f, kneel);
  c.restore();
  if (hit && pose === 'hit') { for (let k = 0; k < 4; k++) { const a = f * 0.3 + k * 1.57; px(c, Math.cos(a) * 16 - 4, -100 + Math.sin(a) * 4, 2, 2, '#FDE047'); } }
  c.restore();
};

/** On his side on the floor, head toward the bleachers, curled up round it: `k` (0..1) how far over he's gone. */
const drawLying = (c: Ctx, f: number, k: number, ice: boolean) => {
  const rock = Math.sin(f * 0.07) * 1.4 * (1 - (ice ? 0.6 : 0));
  // (keeling over: from up on his knees (the whole curled-up body stood on end about his knees, his head where the
  // kneeling one was) toppling over onto his side, easing in and settling, head on his neck all the way)
  const e = Math.min(1, Math.max(0, k)), ee = e * e * (3 - 2 * e), PX = -4, PY = -3;
  c.save(); c.translate(PX, PY); c.rotate((1 - ee) * -1.42); c.translate(-PX, -PY);
  // (the body on its side: the back to the camera's right, knees drawn up in front)
  const by = -14;
  limb(c, 6, by + 2, 8, -10, by - 2, 7, PANTS);
  limb(c, -10, by - 2, 7, 2, by + 6, 6, PANTS);
  shape(c, () => c.roundRect(-2, by + 2, 15, 8, [3, 4, 1, 1]), BOOT, -2, 13);
  limb(c, 4, by - 6, 8, -12, by - 10, 7, rampMix(PANTS, '#000000', 0.2));
  limb(c, -12, by - 10, 7, 0, by - 4, 6, rampMix(PANTS, '#000000', 0.2));
  shapeTop(c, () => c.ellipse(26 + rock, by - 2, 22, 13, 0.1, 0, Math.PI * 2), POLO, by - 15, by + 11);
  px(c, 18 + rock, by - 12, 16, 1, '#3A3A44');
  // (his hands down there; the ice pack on a later visit)
  arm(c, 34 + rock, by - 8, 20 + rock * 0.5, by + 2, 8, by - 2, false); ell(c, 8, by - 2, 5, 4, SKIN[1]);
  if (ice) {
    // (the ice pack on it, wrapped in a bar towel (BEER GARDEN's), condensation dripping)
    shape(c, () => c.roundRect(0, by - 11, 16, 7, 2), ['#FFFFFF', '#F2F2EE', '#D8D8D0', '#B4B4AC', '#5A5A54'], 0, 16, 0.6);
    for (let k = 0; k < 3; k++) px(c, 2 + k * 5, by - 10, 1.4, 5, '#2E8A4E');
    shape(c, () => c.roundRect(2, by - 10, 12, 9, 3), ICE, 2, 14, 0.8); px(c, 4, by - 8, 4, 1, '#FFFFFF'); px(c, 5, by - 6, 6, 1, ICE[2]);
    const u = (f % 70) / 70; ell(c, 8, by + u * 12, 0.8, 1.2, '#DDF0FF');
  }
  // (the head, on the floor at the end of his body, its neck running back into the polo's collar (turned with him: the
  // neck toward the body, not dangling into the floor), the face turned up: eyes screwed shut, teeth gritted, a tear)
  c.save(); c.translate(58 + rock, by - 3); c.rotate(1.4);
  head(c, 0, 0, 'pain', f, 0.6);
  c.restore();
  c.restore();
  // (the groan: little wavy lines off him now and then)
  if (f % 120 < 50) for (let i = 0; i < 2; i++) line(c, [58 + i * 6, -40 - i * 4, 60 + i * 6, -44 - i * 4, 58 + i * 6, -48 - i * 4], 0.8, '#E5E7EB');
};

// ---------------------------------------------------------------------------------------------------------------
// The close-up (screen space): the kick lands

/** How far the close-up pans down (its own units, at its scale): from his face to the boot in his nuts. */
export const GUARD_PAN = 276;
/** Meathead's leg in the grind shot: jeans, jeans he's shat, or bare. */
export type KickLeg = 'jeans' | 'shat' | 'bare';

/** The close-up (screen space), Ren & Stimpy gross: his face the moment it lands (t 0..1: the eyes pop, cross, go
 *  bloodshot and water; the face goes gray-green and sweats; the mouth goes from a little O to every yellow tooth and
 *  its gums), then (`pan` 0..1) the camera sliding down him, the polo, the lanyard, the belt, to Meathead's boot dug
 *  into his crotch and grinding (`grind` 0..1 into it), both his hands clutching round it. */
export const drawGuardCloseup = (c: Ctx, cx: number, cy: number, s: number, f: number, t: number, pan = 0, grind = 0, leg: KickLeg = 'jeans') => {
  const k1 = Math.min(1, t / 0.25), k2 = Math.max(0, Math.min(1, (t - 0.25) / 0.35)), k3 = Math.max(0, (t - 0.6) / 0.4);
  const S: Ramp = rampMix(SKIN, '#8A9A6E', 0.4 * k3);
  const jit = (Math.floor(f / 2) % 2 ? 1 : -1) * (k3 * 0.8 + grind * 1.2);
  const e = pan * pan * (3 - 2 * pan);
  c.save(); c.translate(cx + jit, cy - e * GUARD_PAN * s); c.scale(s, s);
  // (the body under the face, for the pan down: drawn once the camera starts down)
  if (pan > 0) guardBody(c, S, f, grind, leg, k3);
  // (the shoulders, the polo's collar, the earpiece wire)
  shape(c, () => { c.moveTo(-80, 80); c.quadraticCurveTo(-70, 40, -26, 38); c.lineTo(26, 38); c.quadraticCurveTo(70, 40, 80, 80); c.closePath(); }, POLO, -80, 80, 0.6);
  shape(c, () => { c.moveTo(-26, 38); c.lineTo(-14, 52); c.lineTo(0, 40); c.lineTo(14, 52); c.lineTo(26, 38); c.closePath(); }, rampOf('#3A3A46', '#000000'), -26, 26, 0.6);
  shape(c, () => c.rect(-15, 22, 30, 20), S, -15, 15, 0.6);
  // (the neck: the tendons standing out like cables, a vein throbbing, the sweat in its creases)
  for (const sx of [-1, 1]) line(c, [sx * 9, 22, sx * 6, 40], 1.4 + k2, S[3]);
  line(c, [-3, 24, -1, 30, -4, 38], 0.9 + k2 * Math.abs(Math.sin(f * 0.4)), '#3A1A2A');
  px(c, -12, 33, 24, 0.8, S[4]);
  // (the head: shaved, shining; the ears; the earpiece)
  for (const sx of [-1, 1]) { shape(c, () => c.ellipse(sx * 30, 0, 6, 10, 0, 0, Math.PI * 2), S, sx * 30 - 6, sx * 30 + 6, 0.6); ell(c, sx * 30, 0, 3, 6, S[3]); }
  ell(c, 31, 1, 3, 3, '#E8E8E8'); for (let i = 0; i < 6; i++) { c.strokeStyle = '#D8D8D8'; c.lineWidth = 0.6; c.beginPath(); c.arc(32, 8 + i * 4, 2, 0, Math.PI * 2); c.stroke(); }
  shape(c, () => c.ellipse(0, -2, 30, 33, 0, 0, Math.PI * 2), S, -30, 30, 0.6);
  ell(c, -10, -24, 10, 5, dith(c, '#FFFFFF'), -0.3); ell(c, -12, -25, 5, 2.4, 'rgba(255,255,255,0.7)', -0.3);
  // (Ren & Stimpy up close: the pores and the stubble come up on the dome and the cheeks, the forehead buckles into
  // rolls of wrinkles, bags hang under the eyes, the cheeks sag)
  c.save(); c.beginPath(); c.ellipse(0, -2, 29.4, 32.4, 0, 0, Math.PI * 2); c.clip();
  for (let i = 0; i < 90; i++) { const a = i * 2.39996, r = 4 + ((i * 37) % 26); const x2 = Math.cos(a) * r, y2 = Math.sin(a) * r * 1.08 - 2; px(c, x2, y2, 0.7, 0.7, i % 3 ? S[3] : S[4]); }
  for (let i = 0; i < 40; i++) { const x2 = -24 + ((i * 53) % 48), y2 = -33 + ((i * 29) % 12); px(c, x2, y2, 0.6, 0.6, '#2A1A12'); }
  c.restore();
  for (let i = 0; i < 3; i++) { const w = 1 + k1 * 1.4; c.strokeStyle = S[3]; c.lineWidth = 0.7 * w; c.beginPath(); c.moveTo(-18 + i * 2, -18 - k1 * 6 - i * 4); c.quadraticCurveTo(0, -22 - k1 * 8 - i * 4, 18 - i * 2, -18 - k1 * 6 - i * 4); c.stroke(); }
  for (const sx of [-1, 1]) { c.strokeStyle = S[3]; c.lineWidth = 0.8; c.beginPath(); c.arc(sx * 12, 5 + k1 * 2, 7 + k1 * 2, 0.25 * Math.PI, 0.75 * Math.PI); c.stroke(); c.beginPath(); c.arc(sx * 12, 8 + k1 * 2, 6, 0.3 * Math.PI, 0.7 * Math.PI); c.stroke(); }
  for (const sx of [-1, 1]) line(c, [sx * 19, 6, sx * 22, 18, sx * 18, 28], 0.8, S[3]);
  // (sweat: beads popping out, running)
  for (let i = 0; i < 5; i++) { const u = (((f * 0.8 + i * 23) % 100) / 100) * k2; ell(c, -22 + i * 11, -26 + (i % 2) * 6 + u * 30, 1.4, 2.2, '#DDF0FF'); }
  // (the brows: up, way up)
  for (const sx of [-1, 1]) fill(c, BEARD, () => { c.moveTo(sx * 4, -14 - k1 * 6); c.quadraticCurveTo(sx * 13, -20 - k1 * 10, sx * 22, -14 - k1 * 4); c.lineTo(sx * 21, -11 - k1 * 4); c.quadraticCurveTo(sx * 13, -16 - k1 * 8, sx * 5, -11 - k1 * 6); c.closePath(); });
  // (the eyes: popping, the pupils shrinking to pins and crossing; then watering)
  for (const sx of [-1, 1]) {
    const ex = sx * 12, ey = -4, r = 6 + k1 * 4;
    ell(c, ex, ey, r, r * 1.1, '#FAFAF4'); c.strokeStyle = S[4]; c.lineWidth = 0.8; c.beginPath(); c.ellipse(ex, ey, r, r * 1.1, 0, 0, Math.PI * 2); c.stroke();
    // (bloodshot: red veins forking in from the rims, more as it sinks in)
    for (let i = 0; i < 4 + Math.round(k2 * 6); i++) {
      const a = i * 1.37 + sx, r0 = r * 0.98, r1 = r * (0.45 + (i % 3) * 0.1), ax = ex + Math.cos(a) * r0, ay = ey + Math.sin(a) * r0 * 1.1, bx = ex + Math.cos(a + 0.25) * r1, by = ey + Math.sin(a + 0.25) * r1 * 1.1;
      line(c, [ax, ay, (ax + bx) / 2 + Math.sin(i) * 0.8, (ay + by) / 2, bx, by], 0.45, '#D85060');
      if (i % 2) line(c, [(ax + bx) / 2, (ay + by) / 2, (ax + bx) / 2 + Math.cos(a + 1.2) * 1.6, (ay + by) / 2 + Math.sin(a + 1.2) * 1.6], 0.35, '#D85060');
    }
    const pr = 3 - k1 * 1.8, cross = -sx * 4 * k2;
    ell(c, ex + cross, ey, pr + 1.4, pr + 1.4, '#4A2A14'); ell(c, ex + cross, ey, pr, pr, '#0A0604');
    px(c, ex + cross - 1.6, ey - 2, 1.2, 1.2, '#FFFFFF');
    if (k3 > 0) { ell(c, ex, ey + r * 1.1, 2.4, 1.2 + k3 * 1.6, '#DDF0FF'); if (sx > 0) { const u = (f % 40) / 40; ell(c, ex + 2, ey + r + u * 22, 1.4, 2.4, '#DDF0FF'); } }
  }
  // (the nose: flaring)
  shape(c, () => { c.moveTo(-4, -2); c.quadraticCurveTo(-8, 8, -9, 12); c.quadraticCurveTo(0, 16, 9, 12); c.quadraticCurveTo(8, 8, 4, -2); c.closePath(); }, S, -9, 9, 0.6);
  ell(c, -4, 12, 2 + k1, 1.4 + k1 * 0.4, S[4]); ell(c, 4, 12, 2 + k1, 1.4 + k1 * 0.4, S[4]);
  // (nose hairs out of the flared nostrils; a bead of snot)
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) line(c, [sx * 4 - 1 + i, 12, sx * 4 - 1.5 + i * 1.2, 13.6 + (i % 2)], 0.4, '#140A08');
  if (k3 > 0.2) ell(c, 4.5, 13.5 + k3 * 2, 1, 1 + k3 * 1.5, 'rgba(200,230,170,0.9)');
  // (the goatee, the mouth in it: a little O, wider, then every tooth gritted)
  fill(c, BEARD, () => { c.moveTo(-14, 16); c.quadraticCurveTo(0, 13, 14, 16); c.lineTo(10, 34); c.quadraticCurveTo(0, 38, -10, 34); c.closePath(); });
  if (k2 < 1) {
    const r = 2 + k1 * 3 + k2 * 3;
    ell(c, 0, 22, r * 0.8, r, '#3A0A0A'); ell(c, 0, 22 + r * 0.4, r * 0.5, r * 0.3, '#B8404A');
  } else {
    // (every tooth gritted: the gums pulled back off them, the teeth yellowed and stained at the roots, a gap, a gold
    // one, a string of spit between them)
    px(c, -12, 17, 24, 11, '#3A0A0A');
    px(c, -11, 17.4, 22, 2.2, '#D86A7A'); px(c, -11, 26, 22, 1.8, '#D86A7A');
    for (let x2 = -10; x2 < 10; x2 += 3.2) { const gold = Math.abs(x2 - 2.8) < 0.5; px(c, x2, 19.4, 2.8, 3, gold ? '#E8C040' : '#EDE4C4'); px(c, x2, 22.8, 2.8, 3, '#E4D8B0'); px(c, x2, 19.4, 2.8, 0.8, gold ? '#A07A20' : '#C8B47A'); px(c, x2, 25, 2.8, 0.8, '#B8A470'); }
    px(c, -4.2, 19.4, 0.9, 6.4, '#3A0A0A');
    line(c, [-6, 22.5, -5, 24, -6.2, 25.6], 0.5, 'rgba(230,240,255,0.85)');
    c.strokeStyle = '#1A0606'; c.lineWidth = 1; c.strokeRect(-12, 17, 24, 11);
  }
  // (a vein standing out on the dome)
  if (k2 > 0.3) line(c, [8, -30, 10, -24, 7, -18], 1.2 * k2, S[3]);
  c.restore();
};

/** Down him, for the close-up's pan (its units: his face at 0): the polo over the barrel of him (SECURITY across the
 *  chest, the lanyard and its ID), the belt (the buckle, the radio), the cargo pants, and at the bottom Meathead's leg
 *  coming in from the left, the boot's steel toe dug into his crotch and grinding (twisting, the pants' cloth bunched and
 *  creased round it), both his hands clutched round the boot, veins up on them, the sweat coming off him. */
const guardBody = (c: Ctx, S: Ramp, f: number, grind: number, leg: KickLeg, sick: number) => {
  // (the cargo pants: the thighs spread a little, the crotch seam and the fly, a pocket each side)
  shape(c, () => { c.moveTo(-86, 222); c.lineTo(-96, 380); c.lineTo(-14, 380); c.lineTo(0, 276); c.lineTo(14, 380); c.lineTo(96, 380); c.lineTo(86, 222); c.closePath(); }, PANTS, -96, 96, 0.8);
  line(c, [0, 228, 0, 272], 1, PANTS[3]); line(c, [4, 228, 4, 262, 0, 270], 0.8, PANTS[3]);
  for (const sx of [-1, 1]) { shape(c, () => c.rect(sx * 66 - 13, 300, 26, 32), PANTS, sx * 66 - 13, sx * 66 + 13, 0.6); px(c, sx * 66 - 13, 300, 26, 5, PANTS[3]); px(c, sx * 66 - 1.5, 302, 3, 2, '#5A5E66'); }
  // (the polo over the barrel of him, the arms down his sides in their short sleeves)
  shape(c, () => { c.moveTo(-80, 60); c.quadraticCurveTo(-96, 140, -88, 222); c.lineTo(88, 222); c.quadraticCurveTo(96, 140, 80, 60); c.closePath(); }, POLO, -96, 96, 0.8);
  c.save(); c.translate(0, 112); c.scale(2.2, 2.2); security(c, 0, 0, 52); c.restore();
  line(c, [-22, 42, -6, 160, 0, 164, 6, 160, 22, 42], 2, YELLOW);
  shape(c, () => c.rect(-14, 160, 28, 34), ['#FFFFFF', '#F2F2F2', '#D6D6D6', '#B0B0B0', '#5A5A5A'], -14, 14, 0.6);
  px(c, -11, 164, 10, 12, '#74482F'); px(c, -10, 165, 8, 3, '#141010'); px(c, 1, 166, 10, 1.4, '#5A5A5A'); px(c, 1, 170, 9, 1, '#9A9A9A'); px(c, -12, 184, 24, 5, YELLOW);
  for (let i = 0; i < 6; i++) { const u = ((f * 0.7 + i * 31) % 100) / 100; ell(c, -60 + i * 24, 70 + u * 140, 1.6, 2.6, 'rgba(221,240,255,0.8)'); }
  // (the belt: the buckle, the radio)
  shape(c, () => c.rect(-88, 214, 176, 16), BOOT, -88, 88, 0.8);
  shape(c, () => c.rect(-9, 213, 18, 18), ['#FFF0A8', '#E2B33C', '#C9A43A', '#8A6A1A', '#3A2A08'], -9, 9, 0.8); px(c, -5, 217, 10, 10, '#141414');
  shape(c, () => c.roundRect(52, 190, 22, 34, 4), BOOT, 52, 74, 0.8); line(c, [64, 190, 64, 160], 3, '#1A1A1A'); px(c, 56, 196, 6, 3, '#14532D');
  // (Meathead's leg in from the left, the boot dug in at the crotch: twisting, pushing in and out)
  const tw = Math.sin(f * 0.55) * 0.14 * grind, push = Math.sin(f * 0.3) * 3 * grind;
  const toe: [number, number] = [-4 + push, 270];
  const ankle: [number, number] = [toe[0] - 64, toe[1] + 24];
  const cloth: Ramp = leg === 'bare' ? ['#F2C8A6', '#E0A884', '#C08262', '#9A6244', '#3A2010'] : ['#6A8CC8', '#3A5C9C', '#2A4A82', '#1C3462', '#0A1630'];
  // (the shin: off the left edge to the boot's top; his jeans, shat jeans (the stain), or bare and hairy)
  c.save(); c.translate(ankle[0], ankle[1]); c.rotate(-0.36 + tw);
  shape(c, () => c.rect(-240, -22, 240, 44), cloth, -240, 0, 0.8);
  if (leg === 'bare') for (let i = 0; i < 30; i++) line(c, [-230 + i * 7.6, -14 + (i * 11) % 26, -226 + i * 7.6, -16 + (i * 11) % 26], 0.6, '#5A3A22');
  else { line(c, [-240, -8, 0, -6], 0.8, cloth[0]); px(c, -30, -22, 30, 44, cloth[2]); px(c, -30, -22, 3, 44, cloth[3]); }
  if (leg === 'shat') { ell(c, -150, 6, 40, 16, 'rgba(110,70,20,0.75)'); ell(c, -170, 12, 20, 8, 'rgba(80,50,12,0.8)'); }
  c.restore();
  // (the combat boot: the shaft, the laces crossing, the thick lugged sole, the steel toe shining, pressed in)
  c.save(); c.translate(ankle[0], ankle[1]); c.rotate(-0.36 + tw);
  shape(c, () => { c.moveTo(-8, -26); c.lineTo(30, -26); c.quadraticCurveTo(64, -24, 74, -6); c.lineTo(76, 14); c.lineTo(-8, 14); c.closePath(); }, BOOT, -8, 76, 0.8);
  for (let i = 0; i < 4; i++) { line(c, [4 + i * 8, -24, 10 + i * 8, -12], 1.2, '#C8C8C8'); line(c, [10 + i * 8, -24, 4 + i * 8, -12], 1.2, '#A8A8A8'); }
  shape(c, () => c.rect(-10, 14, 90, 10), ['#4A4A4A', '#2A2A2A', '#1A1A1A', '#0E0E0E', '#000000'], -10, 80, 0.6);
  for (let i = 0; i < 9; i++) px(c, -6 + i * 10, 22, 5, 3, '#000000');
  shape(c, () => { c.moveTo(48, -20); c.quadraticCurveTo(70, -18, 76, -4); c.lineTo(76, 12); c.lineTo(50, 12); c.closePath(); }, ['#F0F4FA', '#B8C2D0', '#8A96A8', '#5A6676', '#1A2230'], 48, 76, 0.6);
  px(c, 56, -14, 10, 2, '#FFFFFF');
  c.restore();
  // (the cloth bunched and creased round the toe, stress lines out of it, sweat flying)
  for (let i = 0; i < 7; i++) { const a = -1.4 + i * 0.45 + tw, r0 = 14, r1 = 26 + (i % 2) * 8; line(c, [toe[0] + Math.cos(a) * r0, toe[1] + Math.sin(a) * r0 * 0.8, toe[0] + Math.cos(a) * r1, toe[1] + Math.sin(a) * r1 * 0.8], 1.1, PANTS[4]); }
  if (grind > 0) for (let i = 0; i < 4; i++) { const a = -2.4 + i * 0.5, r = 40 + ((f * 2 + i * 9) % 18); line(c, [toe[0] + Math.cos(a) * r, toe[1] + Math.sin(a) * r, toe[0] + Math.cos(a) * (r + 9), toe[1] + Math.sin(a) * (r + 9)], 2, '#FDE047'); }
  // (his hands clutched round the boot from both sides: thick fingers, knuckles gone pale, veins up)
  for (const sx of [-1, 1]) {
    const hx = toe[0] + sx * 34, hy = toe[1] - 6 + sx * 6;
    shape(c, () => c.ellipse(hx, hy, 18, 15, sx * 0.5, 0, Math.PI * 2), S, hx - 18, hx + 18, 0.8);
    for (let i = 0; i < 4; i++) { const fx = hx - sx * 12 + sx * 2, fy = hy - 9 + i * 6; shape(c, () => c.roundRect(fx - (sx > 0 ? 10 : 0), fy - 3, 10, 6, 3), S, fx - 10, fx + 10, 0.6); px(c, fx - (sx > 0 ? 9 : -6), fy - 1.6, 2.6, 2.6, S[0]); }
    line(c, [hx + sx * 6, hy - 10, hx + sx * 2, hy - 2, hx + sx * 7, hy + 6], 1, '#3A1A2A');
  }
  void sick;
};

/** Where his head is (world), for words over it. */
export const guardHeadAt = (x: number, feetY: number, pose: GuardPose) => (pose === 'down' || pose === 'keel' ? { x: x + 58, y: feetY - 40 } : { x, y: feetY - GUARD_H });
