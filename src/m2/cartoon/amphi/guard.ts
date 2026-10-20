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
    limb(c, 16, shY + 4, 6.4, 10, shY + 22, 6, POLO); limb(c, 10, shY + 22, 5.6, -14, shY + 18, 5, SKIN);
    limb(c, -16, shY + 4, 6.4, -12, shY + 20, 6, POLO); limb(c, -12, shY + 20, 5.6, 12, shY + 14, 5, SKIN);
    ell(c, 12, shY + 14, 4.6, 4, SKIN[1]); ell(c, -14, shY + 18, 4.6, 4, SKIN[1]);
    px(c, 4, shY + 16, 4, 3, '#C9A43A');
  } else if (pose === 'stop') {
    limb(c, 16, shY + 4, 6.4, 12, shY + 26, 6, POLO); limb(c, 12, shY + 26, 5.6, 12, hipY - 10, 5, SKIN);
    limb(c, -16, shY + 4, 6.4, -28, shY + 6, 6, POLO); limb(c, -28, shY + 6, 5.6, -36, shY - 10, 5, SKIN);
    shape(c, () => c.roundRect(-41, shY - 22, 10, 13, 3), SKIN, -41, -31, 0.8);
    for (let k = 0; k < 4; k++) px(c, -40.4 + k * 2.4, shY - 25, 1.8, 4, SKIN[1]);
    px(c, -38, shY - 6, 6, 2, '#C9A43A');
  } else {
    // (both hands down there, cupping)
    for (const s of [1, -1]) { limb(c, s * 16, shY + 4, 6.4, s * 6, shY + 24, 6, s > 0 ? rampMix(POLO, '#000000', 0.2) : POLO); limb(c, s * 6, shY + 24, 5.6, -6 + s * 3, hipY + 2, 5, SKIN); }
    ell(c, -5, hipY + 2, 6, 4.4, SKIN[1]);
  }
  head(c, -2 - lean * 0.6, shY - 14 + lean * 0.4, pose === 'stand' ? 'calm' : pose === 'stop' ? 'stern' : 'pop', f, kneel);
  c.restore();
  if (hit && pose === 'hit') { for (let k = 0; k < 4; k++) { const a = f * 0.3 + k * 1.57; px(c, Math.cos(a) * 16 - 4, -100 + Math.sin(a) * 4, 2, 2, '#FDE047'); } }
  c.restore();
};

/** On his side on the floor, head toward the bleachers, curled up round it: `k` (0..1) how far over he's gone. */
const drawLying = (c: Ctx, f: number, k: number, ice: boolean) => {
  const rock = Math.sin(f * 0.07) * 1.4 * (1 - (ice ? 0.6 : 0));
  c.save(); c.translate(0, 0); c.rotate((1 - Math.min(1, k)) * -0.9);
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
  limb(c, 34 + rock, by - 8, 6, 8, by - 2, 5, SKIN); ell(c, 8, by - 2, 5, 4, SKIN[1]);
  if (ice) {
    // (the ice pack on it, wrapped in a bar towel (BEER GARDEN's), condensation dripping)
    shape(c, () => c.roundRect(0, by - 11, 16, 7, 2), ['#FFFFFF', '#F2F2EE', '#D8D8D0', '#B4B4AC', '#5A5A54'], 0, 16, 0.6);
    for (let k = 0; k < 3; k++) px(c, 2 + k * 5, by - 10, 1.4, 5, '#2E8A4E');
    shape(c, () => c.roundRect(2, by - 10, 12, 9, 3), ICE, 2, 14, 0.8); px(c, 4, by - 8, 4, 1, '#FFFFFF'); px(c, 5, by - 6, 6, 1, ICE[2]);
    const u = (f % 70) / 70; ell(c, 8, by + u * 12, 0.8, 1.2, '#DDF0FF');
  }
  // (the head, on the floor, face toward us: eyes screwed shut, teeth gritted, a tear)
  c.save(); c.translate(52 + rock, by + 2); c.rotate(-0.25);
  head(c, 0, 0, 'pain', f, 0.6);
  c.restore();
  c.restore();
  // (the groan: little wavy lines off him now and then)
  if (f % 120 < 50) for (let i = 0; i < 2; i++) line(c, [58 + i * 6, -40 - i * 4, 60 + i * 6, -44 - i * 4, 58 + i * 6, -48 - i * 4], 0.8, '#E5E7EB');
};

// ---------------------------------------------------------------------------------------------------------------
// The close-up (screen space): the kick lands

export const drawGuardCloseup = (c: Ctx, cx: number, cy: number, s: number, f: number, t: number) => {
  const k1 = Math.min(1, t / 0.25), k2 = Math.max(0, Math.min(1, (t - 0.25) / 0.35)), k3 = Math.max(0, (t - 0.6) / 0.4);
  const S: Ramp = rampMix(SKIN, '#8A9A6E', 0.4 * k3);
  const jit = (Math.floor(f / 2) % 2 ? 1 : -1) * k3 * 0.8;
  c.save(); c.translate(cx + jit, cy); c.scale(s, s);
  // (the shoulders, the polo's collar, the earpiece wire)
  shape(c, () => { c.moveTo(-80, 80); c.quadraticCurveTo(-70, 40, -26, 38); c.lineTo(26, 38); c.quadraticCurveTo(70, 40, 80, 80); c.closePath(); }, POLO, -80, 80, 0.6);
  shape(c, () => { c.moveTo(-26, 38); c.lineTo(-14, 52); c.lineTo(0, 40); c.lineTo(14, 52); c.lineTo(26, 38); c.closePath(); }, rampOf('#3A3A46', '#000000'), -26, 26, 0.6);
  shape(c, () => c.rect(-15, 22, 30, 20), S, -15, 15, 0.6);
  // (the head: shaved, shining; the ears; the earpiece)
  for (const sx of [-1, 1]) { shape(c, () => c.ellipse(sx * 30, 0, 6, 10, 0, 0, Math.PI * 2), S, sx * 30 - 6, sx * 30 + 6, 0.6); ell(c, sx * 30, 0, 3, 6, S[3]); }
  ell(c, 31, 1, 3, 3, '#E8E8E8'); for (let i = 0; i < 6; i++) { c.strokeStyle = '#D8D8D8'; c.lineWidth = 0.6; c.beginPath(); c.arc(32, 8 + i * 4, 2, 0, Math.PI * 2); c.stroke(); }
  shape(c, () => c.ellipse(0, -2, 30, 33, 0, 0, Math.PI * 2), S, -30, 30, 0.6);
  ell(c, -10, -24, 10, 5, dith(c, '#FFFFFF'), -0.3); ell(c, -12, -25, 5, 2.4, 'rgba(255,255,255,0.7)', -0.3);
  // (sweat: beads popping out, running)
  for (let i = 0; i < 5; i++) { const u = (((f * 0.8 + i * 23) % 100) / 100) * k2; ell(c, -22 + i * 11, -26 + (i % 2) * 6 + u * 30, 1.4, 2.2, '#DDF0FF'); }
  // (the brows: up, way up)
  for (const sx of [-1, 1]) fill(c, BEARD, () => { c.moveTo(sx * 4, -14 - k1 * 6); c.quadraticCurveTo(sx * 13, -20 - k1 * 10, sx * 22, -14 - k1 * 4); c.lineTo(sx * 21, -11 - k1 * 4); c.quadraticCurveTo(sx * 13, -16 - k1 * 8, sx * 5, -11 - k1 * 6); c.closePath(); });
  // (the eyes: popping, the pupils shrinking to pins and crossing; then watering)
  for (const sx of [-1, 1]) {
    const ex = sx * 12, ey = -4, r = 6 + k1 * 4;
    ell(c, ex, ey, r, r * 1.1, '#FAFAF4'); c.strokeStyle = S[4]; c.lineWidth = 0.8; c.beginPath(); c.ellipse(ex, ey, r, r * 1.1, 0, 0, Math.PI * 2); c.stroke();
    for (let i = 0; i < 3; i++) line(c, [ex + sx * r, ey - 2 + i * 2, ex + sx * (r - 3), ey - 1 + i * 2], 0.4, '#E07070');
    const pr = 3 - k1 * 1.8, cross = -sx * 4 * k2;
    ell(c, ex + cross, ey, pr + 1.4, pr + 1.4, '#4A2A14'); ell(c, ex + cross, ey, pr, pr, '#0A0604');
    px(c, ex + cross - 1.6, ey - 2, 1.2, 1.2, '#FFFFFF');
    if (k3 > 0) { ell(c, ex, ey + r * 1.1, 2.4, 1.2 + k3 * 1.6, '#DDF0FF'); if (sx > 0) { const u = (f % 40) / 40; ell(c, ex + 2, ey + r + u * 22, 1.4, 2.4, '#DDF0FF'); } }
  }
  // (the nose: flaring)
  shape(c, () => { c.moveTo(-4, -2); c.quadraticCurveTo(-8, 8, -9, 12); c.quadraticCurveTo(0, 16, 9, 12); c.quadraticCurveTo(8, 8, 4, -2); c.closePath(); }, S, -9, 9, 0.6);
  ell(c, -4, 12, 2 + k1, 1.4 + k1 * 0.4, S[4]); ell(c, 4, 12, 2 + k1, 1.4 + k1 * 0.4, S[4]);
  // (the goatee, the mouth in it: a little O, wider, then every tooth gritted)
  fill(c, BEARD, () => { c.moveTo(-14, 16); c.quadraticCurveTo(0, 13, 14, 16); c.lineTo(10, 34); c.quadraticCurveTo(0, 38, -10, 34); c.closePath(); });
  if (k2 < 1) {
    const r = 2 + k1 * 3 + k2 * 3;
    ell(c, 0, 22, r * 0.8, r, '#3A0A0A'); ell(c, 0, 22 + r * 0.4, r * 0.5, r * 0.3, '#B8404A');
  } else {
    px(c, -10, 19, 20, 7, '#F4F0E4'); line(c, [-10, 22.5, 10, 22.5], 0.6, '#6A5A4A');
    for (let x2 = -8; x2 <= 8; x2 += 4) line(c, [x2, 19, x2, 26], 0.5, '#A89A7A');
    c.strokeStyle = '#3A0A0A'; c.lineWidth = 1; c.strokeRect(-10, 19, 20, 7);
  }
  // (a vein standing out on the dome)
  if (k2 > 0.3) line(c, [8, -30, 10, -24, 7, -18], 1.2 * k2, S[3]);
  c.restore();
};

/** Where his head is (world), for words over it. */
export const guardHeadAt = (x: number, feetY: number, pose: GuardPose) => (pose === 'down' || pose === 'keel' ? { x: x + 40, y: feetY - 40 } : { x, y: feetY - GUARD_H });
