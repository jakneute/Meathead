// Safari Artie's junior guides, drawn (the SNES pass, on Spooky Land's person drawer, costume.ts, as the temple's cast
// is: whoever it is shows (skin, build, face, man or woman), every material in its steps, dithered, inked round; each
// frame painted once into a stamp). Seeded: no two the same.
//
// The troop's uniform: a khaki safari shirt (button-down flap pockets, epaulettes, sleeves rolled), a green merit-badge
// sash across it (a row of round badges, seeded), a neckerchief in the troop's orange with a woggle, a whistle on a
// yellow lanyard, a JR. GUIDE name tag; khaki shorts on a web belt (a canteen on the hip), knee socks with a red band,
// hiking boots. The pith helmet: khaki, a dark puggaree band, its brim, and three steel spikes welded on top (their weld
// beads showing, each spike in its steel ramp and catching the light: you can see them coming). The hiking staff: ash,
// a carved knob, a leather wrist loop, the troop's shield medallions tacked up it, a steel ferrule.
//
// Poses: walking with the staff, the windup (the staff up and back over the shoulder, the whistle in the mouth), the
// swing (lunged out, the staff through); knocked about (flailing, the staff still in a fist); dead, the helmet's off and
// lying by them, spikes and all, the staff on the ground in front.

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, partTop, px, ball, dither, flat,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, glasses, hairTop, hairBack, frameOf, putFrame, moodOf,
  reaction, pickOf,
} from '../../spooky/costume';

type Ctx = CanvasRenderingContext2D;

const KHAKI = '#BCA670', SHORTS = '#9C8656', SASH = '#3E6B2A', SOCK = '#7A7048', BOOT = '#5A3A1E';
const SCARF = ['#E06A1E', '#D8402A', '#E8A41E'];
const HELMET = '#E2D4A8', BAND = '#6A4A22', STEEL = '#B8C0CC';
const BADGES = ['#DC2626', '#2563EB', '#F59E0B', '#F8FAFC', '#7C3AED', '#10B981', '#EC4899'];

/** The hiking staff gripped at (x, y), along angle `a`: the knob `fore` ahead of the grip, the ferrule `aft` behind. */
const staff = (g: Ctx, x: number, y: number, a: number, fore = 30, aft = 26) => {
  g.save(); g.translate(x, y); g.rotate(a);
  // (the shaft: ash in steps, the grain)
  part(g, () => g.rect(-aft, -1.8, aft + fore, 3.6), '#B07A3E', -aft, -1.8, aft + fore, 3.6, 1);
  px(g, -aft + 2, -1.2, aft + fore - 4, 1, '#DCA868');
  for (let k = -aft + 6; k < fore - 6; k += 9) px(g, k, 0.6, 3, 1, '#7A4A1E');
  // (the steel ferrule at its foot; the carved knob at the top, a band under it)
  part(g, () => g.rect(-aft - 1, -2, 5, 4), '#8A929E', -aft - 1, -2, 5, 4, 0.8);
  part(g, () => g.ellipse(fore + 2, 0, 4.4, 3.6, 0, 0, Math.PI * 2), '#8A5A2A', fore - 3, -4, 10, 8, 1);
  px(g, fore - 2, -2.4, 3, 1, '#C08A4A');
  px(g, fore - 4, -2, 2, 4, '#3A2410');
  // (the troop's shield medallions tacked on, a leather wrist loop at the grip)
  for (const [mx, col] of [[fore - 12, '#E8B400'], [fore - 20, '#C0C8D4']] as const) { flat(g, () => { g.moveTo(mx - 2, -3); g.lineTo(mx + 2, -3); g.lineTo(mx + 2, 1); g.lineTo(mx, 3); g.lineTo(mx - 2, 1); g.closePath(); }, col, 0.6); px(g, mx - 1, -2, 1, 1, '#FFFFFF'); }
  g.strokeStyle = '#4A2A12'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(-3, 4, 2.5, 4, 0.2, 0, Math.PI * 2); g.stroke();
  g.restore();
};

/** The pith helmet, its brim's middle at (cx, cy), tipped `rot`: the dome in steps, the band, the brim, the spikes. */
const helmet = (g: Ctx, cx: number, cy: number, rot = 0, sideways = false) => {
  g.save(); g.translate(cx, cy); g.rotate(rot);
  // (the spikes first, welded on top: steel in steps, the weld beads round their feet)
  for (const [sx, sh] of [[-6, 11], [0.5, 15], [7, 11]] as const) {
    part(g, () => { g.moveTo(sx - 3, -11); g.lineTo(sx, -11 - sh); g.lineTo(sx + 3, -11); g.closePath(); }, STEEL, sx - 3, -11 - sh, 6, sh, 1);
    px(g, sx - 1, -9 - sh, 1, sh - 5, '#F8FAFC');
    for (let k = -3; k <= 2; k += 2) px(g, sx + k, -12, 2, 2, k % 4 ? '#C87A3A' : '#8A5A2A');
  }
  // (the dome, lit from above; the puggaree band round it, its folds; the brim, shaded under)
  partTop(g, () => { g.moveTo(-11, -1); g.quadraticCurveTo(-10, -15, 0.5, -15); g.quadraticCurveTo(12, -15, 13, -1); g.closePath(); }, HELMET, -11, -15, 24, 14, 1.1);
  part(g, () => g.rect(-10.5, -6, 23, 4), BAND, -10.5, -6, 23, 4, 0.8);
  for (let k = -8; k < 12; k += 4) px(g, k, -5, 1, 2, dk(BAND, 0.35));
  part(g, () => g.ellipse(1, -1, 15, 2.6, 0, 0, Math.PI * 2), dk(HELMET, 0.08), -14, -4, 30, 5, 1);
  px(g, -12, -2, 12, 1, lt(HELMET, 0.4));
  // (the troop badge on the front)
  ball(g, 7, -9, 1.8, '#E8B400', 0.6);
  if (sideways) px(g, -14, 0, 30, 1, 'rgba(26, 11, 6, 0.35)');
  g.restore();
};

const paintGuide = (g: Ctx, F: Frame) => {
  const B: Body = bodyOf(F.seed, F.pose, F.fr, F.woman), L = B.L;
  const fl = flailHands(B, F.fr);
  const dead = F.md === 'dead';
  const scarf = pickOf(F.seed, 2, SCARF);
  const tell = F.pose === 'tell', strike = F.pose === 'strike';
  // The legs: bare knees, the knee socks (a red band at the top), the boots
  legs(g, B, { col: SHORTS, shoe: 'boot', shoeCol: BOOT, bareBelow: true, detail: (gg, _hip, knee, foot, near) => {
    const s0 = 0.38, sx = knee[0] + (foot[0] - knee[0]) * s0, sy = knee[1] + (foot[1] - knee[1]) * s0;
    const col = near ? SOCK : dk(SOCK, 0.14);
    gg.lineCap = 'round'; gg.strokeStyle = INK; gg.lineWidth = B.legW + 1.4; gg.beginPath(); gg.moveTo(sx, sy); gg.lineTo(foot[0], foot[1] - 2); gg.stroke();
    gg.strokeStyle = col; gg.lineWidth = B.legW - 0.6; gg.beginPath(); gg.moveTo(sx, sy); gg.lineTo(foot[0], foot[1] - 2); gg.stroke(); gg.lineCap = 'butt';
    px(gg, sx - B.legW / 2 + 0.5, sy, B.legW - 1, 1.6, near ? '#C8282A' : '#9A1E20');
    px(gg, sx - B.legW / 2 + 1, sy + 3, 1, Math.max(1, foot[1] - sy - 6), lt(col, 0.25));
  } });
  // Where the hands go (and the staff with them)
  let far: [number, number], near: [number, number];
  let st: { x: number; y: number; a: number; fore?: number } | null = null;
  if (fl) {
    [far, near] = fl;
    if (B.held === 'thrown') st = { x: near[0], y: near[1], a: -1.1 };
    else if (B.held === 'stun') st = { x: near[0], y: near[1], a: 1.3 };
    else if (B.held === 'pinned' || B.held === 'shaken') st = null;
  } else if (tell) {
    near = [B.hx - 3, B.hy - 13]; far = [B.hx - 9, B.hy - 8]; st = { x: near[0], y: near[1], a: -2.55, fore: 32 };
  } else if (strike) {
    near = [B.w / 2 + 17, B.shY + 10]; far = [B.w / 2 + 6, B.shY + 12]; st = { x: near[0], y: near[1], a: 0.18, fore: 36 };
  } else {
    near = [B.w / 2 + 5, B.shY + 16]; far = [-B.w / 2 - 1, B.shY + 21]; st = { x: near[0], y: near[1], a: -1.28, fore: 28 };
  }
  if (dead && B.held === 'limp') st = null;
  // Far arm (sleeve rolled to the elbow)
  arm(g, B, -1, far[0], far[1], { sleeve: dk(KHAKI, 0.12), hand: dk(L.skin, 0.1), len: 0.45 });
  // (the canteen on the far hip, its strap)
  part(g, () => g.ellipse(-B.hipW / 2 - 1, B.hipY + 2, 4.5, 5.5, 0, 0, Math.PI * 2), '#6E7A4A', -B.hipW / 2 - 6, B.hipY - 4, 10, 12, 0.9);
  px(g, -B.hipW / 2 - 2, B.hipY - 4, 3, 2, '#9CA3AF');
  // The shirt: pockets, the placket and its buttons, epaulettes; the sash across it, its badges
  const tp = torso(g, B, KHAKI);
  g.save(); g.beginPath(); tp(); g.clip();
  px(g, B.lean - 0.5, B.shY + 2, 1, B.hipY - B.shY, dk(KHAKI, 0.25));
  for (let y = B.shY + 6; y < B.hipY - 2; y += 6) px(g, B.lean + 1, y, 2, 2, '#E8DCB8');
  for (const sx of [-B.w / 2 + 3, 4]) { part(g, () => g.rect(sx + B.lean, B.shY + 7, 7, 7), KHAKI, sx + B.lean, B.shY + 7, 7, 7, 0.6); px(g, sx + B.lean, B.shY + 7, 7, 2, dk(KHAKI, 0.18)); px(g, sx + 3 + B.lean, B.shY + 8, 1, 1, '#E8DCB8'); }
  // (the sash, shoulder to hip, a seeded row of badges)
  g.save(); g.translate(B.lean, 0);
  part(g, () => { g.moveTo(-B.w / 2 - 2, B.shY + 1); g.lineTo(-B.w / 2 + 5, B.shY - 1); g.lineTo(B.hipW / 2 + 3, B.hipY - 2); g.lineTo(B.hipW / 2 - 4, B.hipY + 2); g.closePath(); }, SASH, -B.w / 2 - 2, B.shY - 1, B.w + 6, B.hipY - B.shY + 3, 0.9);
  for (let k = 0; k < 4; k++) { const t = 0.12 + k * 0.24, bx = -B.w / 2 + 2 + (B.hipW / 2 + B.w / 2 - 2) * t, by = B.shY + 1 + (B.hipY - B.shY - 1) * t; px(g, bx - 1.5, by - 1.5, 4, 4, INK); px(g, bx - 1, by - 1, 3, 3, BADGES[((Math.floor(F.seed + k * 3) % BADGES.length) + BADGES.length) % BADGES.length]); px(g, bx - 1, by - 1, 1, 1, '#FFFFFF'); }
  g.restore();
  px(g, B.w / 2 - 3 + B.lean, B.shY + 2, 2, B.hipY - B.shY, dk(KHAKI, 0.32));
  g.restore();
  // (the epaulettes, the name tag)
  for (const ex of [-B.w / 2 + 1, B.w / 2 - 7]) { px(g, ex + B.lean, B.shY, 6, 2, dk(KHAKI, 0.3)); px(g, ex + 2 + B.lean, B.shY, 1, 1, '#E8DCB8'); }
  part(g, () => g.rect(B.w / 2 - 9 + B.lean, B.shY + 16, 7, 3), '#F8FAFC', B.w / 2 - 9 + B.lean, B.shY + 16, 7, 3, 0.5); px(g, B.w / 2 - 8 + B.lean, B.shY + 17, 5, 1, '#2E4A2A');
  // (the web belt, its buckle)
  px(g, -B.hipW / 2, B.hipY - 2, B.hipW + 1, 3, '#4A5A2A'); px(g, -B.hipW / 2, B.hipY - 2, B.hipW + 1, 1, '#6E7E44'); part(g, () => g.rect(-2, B.hipY - 3, 5, 4), '#C0C8D4', -2, B.hipY - 3, 5, 4, 0.6);
  // The head: the neckerchief at the collar (its woggle), the face, the whistle; the helmet (dead: off, by them)
  hairBack(g, B);
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: 'angry', mouth: strike ? 'teeth' : tell ? 'o' : 'frown', md: F.md, blink: F.blink });
  whiskers(g, B); glasses(g, B);
  // (the whistle: in the mouth on the windup, cheeks puffed; on its lanyard on the chest otherwise)
  const wx = tell && !dead ? B.hx + 8 : B.lean + 3, wy = tell && !dead ? B.hy + 6 : B.shY + 13;
  g.strokeStyle = '#E8C130'; g.lineWidth = 1; g.beginPath(); g.moveTo(B.hx - 3, B.shY + 1); g.lineTo(wx, wy); g.stroke();
  part(g, () => g.roundRect(wx - 1, wy - 1.5, 5, 3, 1), '#C8D0DA', wx - 1, wy - 1.5, 5, 3, 0.6);
  if (tell && !dead) { px(g, B.hx + 5, B.hy + 3, 2, 2, lt(L.skin, 0.2)); if (F.fr % 2 === 0) for (let k = 0; k < 3; k++) px(g, wx + 6 + k * 3, wy - 3 - k * 2, 2, 1, '#F8FAFC'); }
  // (the neckerchief: a triangle down the chest, the woggle ring)
  part(g, () => { g.moveTo(B.hx - 8 + B.lean, B.shY - 1); g.lineTo(B.hx + 8 + B.lean, B.shY - 1); g.lineTo(B.hx + 1 + B.lean, B.shY + 9); g.closePath(); }, scarf, B.hx - 8 + B.lean, B.shY - 1, 16, 10, 0.9);
  ball(g, B.hx + B.lean, B.shY + 3, 1.8, '#C08A3A', 0.6);
  if (dead || L.long) hairTop(g, B);
  if (!dead) helmet(g, B.hx, B.hy - 3);
  else helmet(g, B.hx - 30, -2, -1.4, true);
  // Near arm, and the staff in its fist (dead: on the ground in front)
  arm(g, B, 1, near[0], near[1], { sleeve: KHAKI, hand: L.skin, len: 0.45 });
  if (st) staff(g, st.x, st.y, st.a, st.fore ?? 30);
  if (dead && !st) staff(g, 16, -3, 0.03, 26, 22);
  void dither;
};

/** A junior guide from its state: the walk, the windup, the swing; knocked about and dead via the engine. */
export const drawGuide = (c: Ctx, e: Enemy, f: number, seed: number, woman?: boolean) => {
  const r = reaction(e);
  const pose: Pose = r?.pose ?? (e.aiState === 'windup' ? 'tell' : e.aiState === 'swing' ? 'strike' : Math.abs(e.vel.x) > 0.3 ? 'walk' : 'stand');
  const F = frameOf(seed, f, pose, r?.md ?? moodOf(e), 0, woman);
  // (the windup's whistle: two frames, blown)
  if (pose === 'tell') F.fr = Math.floor(f / 6) % 2;
  putFrame(c, 'adv-guide', F, [-72, -130, 160, 136], g => paintGuide(g, F));
};
