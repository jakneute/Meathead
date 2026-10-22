// The temple's people, drawn (the SNES pass, on Spooky Land's person drawer, costume.ts: whoever it is shows (skin,
// build, face, man or woman), every material in its steps, dithered, inked round; each frame painted once into a
// stamp). Seeded: no two the same.
//   actor      a cast member in the Temple of the Jaguar's warrior costume: a feather fan headdress on a gold band (a
//              jade medallion, ear spools), war paint across the eyes or the jaw, clay stripes on the chest (a
//              jaguar-print tunic on the women), a jade bead collar, gold arm bands, the loincloth (jaguar rosettes,
//              gold trim, a jade disc on the sash; the name tag pinned to it), shin wraps and sandals; a jaguar pelt
//              over the shoulders of some; a wristwatch on some (it's a costume). The spear's real (ash, a leather
//              grip, a steel leaf head, a feather tassel): carried, drawn back high for the tell, driven out for the
//              thrust. Knocked about it flails, or drops; dead, the headdress is knocked crooked and the spear let go.
//   stagehand  the crew in blacks: a black tee, black cargos, work boots, gray work gloves; the headset (its boom mic,
//              the cable down to the belt pack), a roll of gaffer tape and a flashlight on the belt, keys on a
//              carabiner; a beanie or a backwards cap on some. At their trick: cranking the catapult's winch, both
//              hands on the leaf blower's trigger, a hand on the snake's air valve. Near him, cowering.
//   ghost      the Pepper's ghost: a stagehand in a black bodysuit with the bones painted on, a skull hood.
//   flung      a guest kicked out of the cart: tee, shorts or jeans, sneakers, arms and legs everywhere.
// Feet at the origin, facing right (the engine, or the caller, mirrors).

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, partTop, px, ball, dither, limb, flat,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, glasses, hairTop, hairBack, frameOf, putFrame, moodOf,
  reaction, pickOf,
} from '../../spooky/costume';

type Ctx = CanvasRenderingContext2D;

// ---------------------------------------------------------------------------------------------------------------
// The spear (a real one: the props budget went somewhere)

/** A spear gripped at (x, y), pointing along angle `a`: the tip `fore` ahead of the grip, the butt `aft` behind. */
const spear = (g: Ctx, x: number, y: number, a: number, fore = 34, aft = 26) => {
  g.save(); g.translate(x, y); g.rotate(a);
  // (the shaft: ash, in steps; the leather grip; red binding under the head)
  part(g, () => g.rect(-aft, -1.6, aft + fore - 8, 3.2), '#A8743A', -aft, -1.6, aft + fore - 8, 3.2, 1);
  px(g, -aft + 1, -1, aft + fore - 10, 1, '#D8A868');
  for (let k = -6; k < 6; k += 2) px(g, k, -1.6, 1, 3.2, k % 4 ? '#3A2210' : '#5A3418');
  px(g, fore - 12, -2, 4, 4, '#B91C1C'); px(g, fore - 12, -2, 4, 1, '#E85A4A');
  // (the leaf head: steel, ramped, a ridge down it)
  part(g, () => { g.moveTo(fore - 9, -3.6); g.quadraticCurveTo(fore - 2, -4, fore + 7, 0); g.quadraticCurveTo(fore - 2, 4, fore - 9, 3.6); g.closePath(); }, '#B8BEC8', fore - 9, -4, 16, 8, 1);
  px(g, fore - 7, -0.5, 12, 1, '#F1F5F9');
  // (the tassel: feathers off the binding)
  for (let k = 0; k < 3; k++) flat(g, () => { g.moveTo(fore - 11, 1.6); g.lineTo(fore - 15 - k * 2, 7 + k * 2); g.lineTo(fore - 12 - k, 7 + k * 2); g.closePath(); }, ['#16A34A', '#DC2626', '#2563EB'][k], 0.6);
  g.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The warrior

const FEATHERS = [['#16A34A', '#DC2626', '#16A34A', '#2563EB', '#16A34A'], ['#DC2626', '#F59E0B', '#DC2626', '#F59E0B', '#DC2626'], ['#0EA5E9', '#16A34A', '#F8FAFC', '#16A34A', '#0EA5E9'], ['#7C3AED', '#16A34A', '#F59E0B', '#16A34A', '#7C3AED']];
const CLOTH = ['#B45309', '#9A3412', '#A16207', '#7C2D12'];
const GOLD = '#E8B400', JADE = '#10B981';

/** The headdress: a fan of feathers behind the head on a gold band, a jade medallion; knocked crooked on their head when dead. */
const headdress = (g: Ctx, hx: number, hy: number, seed: number, lying: boolean) => {
  const cols = pickOf(seed, 3, FEATHERS);
  const n = 5;
  for (let i = 0; i < n; i++) {
    const a = lying ? -1.35 + i * 0.16 : -0.95 + i * (1.9 / (n - 1)), len = (i === 2 ? 22 : i % 2 ? 19 : 15);
    const bx = hx - 1, by = hy - 8, tx = bx + Math.sin(a) * len, ty = by - Math.cos(a) * len;
    const nx = Math.cos(a) * 3.4, ny = Math.sin(a) * 3.4;
    part(g, () => { g.moveTo(bx - nx * 0.4, by - ny * 0.4); g.quadraticCurveTo(tx - nx * 1.6 - Math.sin(a) * 5, ty - ny * 1.6 + Math.cos(a) * 5, tx, ty); g.quadraticCurveTo(tx + nx * 1.6 - Math.sin(a) * 5, ty + ny * 1.6 + Math.cos(a) * 5, bx + nx * 0.4, by + ny * 0.4); g.closePath(); }, cols[i], Math.min(bx, tx) - 4, Math.min(by, ty) - 4, Math.abs(tx - bx) + 8, Math.abs(ty - by) + 8, 1);
    // (the quill down it, the eye near the tip)
    g.strokeStyle = lt(cols[i], 0.5); g.lineWidth = 1; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + (tx - bx) * 0.85, by + (ty - by) * 0.85); g.stroke();
    px(g, bx + (tx - bx) * 0.78 - 1, by + (ty - by) * 0.78 - 1, 2, 2, i % 2 ? '#FDE047' : INK);
  }
};

const paintActor = (g: Ctx, F: Frame) => {
  const B: Body = bodyOf(F.seed, F.pose, F.fr, F.woman), L = B.L;
  const fl = flailHands(B, F.fr);
  const cloth = pickOf(F.seed, 2, CLOTH), pelt = F.seed % 3 === 0, watch = F.seed % 4 === 1;
  const paintStyle = F.seed % 3; // 0: black band over the eyes, 1: red jaw, 2: white dots
  const dead = F.md === 'dead';
  // (the pelt behind the shoulders: spotted, its tail and a paw hanging)
  if (pelt) {
    const flap = F.pose === 'walk' ? Math.sin(F.fr) * 3 : F.pose === 'thrown' ? -6 : 0;
    part(g, () => { g.moveTo(-B.w / 2 + 2, B.shY + 1); g.lineTo(-B.w / 2 - 9 + flap, B.hipY + 6); g.lineTo(-B.w / 2 + 3 + flap, B.hipY + 10); g.lineTo(B.w / 2 - 4, B.shY + 3); g.closePath(); }, '#D99A2B', -B.w / 2 - 9, B.shY + 1, B.w + 4, B.hipY - B.shY + 9, 1.1);
    for (const [dx, dy] of [[-8, 8], [-4, 16], [-10, 20], [-1, 6], [-6, 26]] as const) { px(g, -B.w / 2 + 6 + dx + flap * 0.5, B.shY + dy, 3, 2, '#3A2008'); px(g, -B.w / 2 + 7 + dx + flap * 0.5, B.shY + dy + 1, 1, 1, '#B87818'); }
  }
  // The legs: bare, shin wraps, sandals
  legs(g, B, { col: L.skin, shoe: 'sandal', shoeCol: '#5B3A1E', detail: (gg, _hip, knee, foot, near) => {
    // (leather straps crossed up the shin)
    const c = near ? '#7A4A22' : '#5A3418';
    for (let k = 0; k < 3; k++) { const t = 0.35 + k * 0.2, x = knee[0] + (foot[0] - knee[0]) * t, y = knee[1] + (foot[1] - knee[1]) * t; px(gg, x - B.legW / 2, y, B.legW, 1.4, c); px(gg, x - B.legW / 2 + 1, y - 1, 2, 1, lt(c, 0.3)); }
  } });
  // Where the hands go (and the spear with them)
  let far: [number, number], near: [number, number];
  let sp: { x: number; y: number; a: number } | null = null;
  if (fl) {
    [far, near] = fl;
    if (B.held === 'thrown') sp = { x: near[0], y: near[1], a: -1.3 };
    else if (B.held === 'stun') sp = { x: near[0], y: near[1], a: 1.25 };
  } else if (F.pose === 'tell') {
    near = [3, B.shY - 2]; far = [-12, B.shY + 4]; sp = { x: near[0], y: near[1], a: -0.32 };
  } else if (F.pose === 'strike') {
    near = [B.w / 2 + 18, B.shY + 9]; far = [B.w / 2 + 3, B.shY + 9]; sp = { x: near[0], y: near[1], a: 0 };
  } else {
    near = [B.w / 2 + 5, B.shY + 15]; far = [B.w / 2 - 6, B.shY + 14]; sp = { x: near[0], y: near[1], a: -0.1 };
  }
  // (a body: the spear let go (on them, or let go and gone: never on the floor by them, where it'd float once a death tips the body over))
  if (dead) sp = null;
  // Far arm (bare; a gold band, the watch on some)
  arm(g, B, -1, far[0], far[1], { sleeve: dk(L.skin, 0.1), hand: dk(L.skin, 0.1), len: 0 });
  if (watch) { px(g, far[0] - 3, far[1] - 4, 5, 3, INK); px(g, far[0] - 2, far[1] - 3, 3, 1, '#CBD5E1'); }
  // The torso: skin, clay stripes (the women: a jaguar-print tunic), the collar
  const tp = torso(g, B, L.woman ? '#D99A2B' : L.skin);
  g.save(); g.beginPath(); tp(); g.clip();
  if (L.woman) {
    for (const [dx, dy] of [[-6, 6], [3, 10], [-2, 16], [6, 18], [-7, 20], [1, 4]] as const) { px(g, dx, B.shY + dy, 3, 2, '#3A2008'); px(g, dx + 1, B.shY + dy, 1, 1, '#B87818'); }
    dither(g, B.w / 2 - 6, B.shY, 5, B.hipY - B.shY, '#9A6418');
  } else {
    const clay = paintStyle === 1 ? '#F1EAD8' : '#E2DCCB';
    for (let k = 0; k < 3; k++) { px(g, -B.w / 2 + 3, B.shY + 9 + k * 5, B.w - 6, 2, clay); px(g, -B.w / 2 + 3, B.shY + 11 + k * 5, B.w - 6, 1, dk(L.skin, 0.12)); }
  }
  g.restore();
  // (the loincloth: the sash, a jade disc; the front flap down to the knee, rosettes, gold trim; the name tag)
  part(g, () => g.rect(-B.hipW / 2 - 1, B.hipY - 4, B.hipW + 2, 6), dk(cloth, 0.15), -B.hipW / 2 - 1, B.hipY - 4, B.hipW + 2, 6, 1);
  part(g, () => { g.moveTo(-6, B.hipY + 1); g.lineTo(-7, B.hipY + 17); g.lineTo(7, B.hipY + 17); g.lineTo(6, B.hipY + 1); g.closePath(); }, cloth, -7, B.hipY + 1, 14, 16, 1);
  px(g, -7, B.hipY + 15, 14, 2, GOLD); px(g, -7, B.hipY + 15, 14, 1, lt(GOLD, 0.4));
  for (const [dx, dy] of [[-4, 5], [2, 8], [-2, 11]] as const) { px(g, dx, B.hipY + dy, 3, 2, '#3A2008'); }
  ball(g, 0, B.hipY - 1, 3, JADE, 0.8); px(g, -1, B.hipY - 3, 1, 1, lt(JADE, 0.5));
  part(g, () => g.rect(B.hipW / 2 - 7, B.hipY - 4, 6, 4), '#F8FAFC', B.hipW / 2 - 7, B.hipY - 4, 6, 4, 0.5); px(g, B.hipW / 2 - 6, B.hipY - 3, 4, 1, '#B91C1C');
  // (the collar: jade beads, a gold rim)
  partTop(g, () => g.ellipse(B.hx - 0.5, B.shY + 2, B.w / 2 - 1, 5, 0, 0, Math.PI * 2), JADE, B.hx - B.w / 2, B.shY - 3, B.w, 10, 1);
  for (let k = 0; k < 6; k++) px(g, B.hx - B.w / 2 + 3 + k * ((B.w - 6) / 5), B.shY + 5, 2, 2, k % 2 ? GOLD : lt(JADE, 0.4));
  px(g, B.hx - B.w / 2 + 3, B.shY + 7, B.w - 6, 1, dk(GOLD, 0.2));
  // The head: the feathers behind it, the face and its paint, the band
  if (!dead) headdress(g, B.hx, B.hy, F.seed, false);
  else { g.save(); g.translate(B.hx, B.hy); g.rotate(0.55); headdress(g, 0, 0, F.seed, false); g.restore(); }
  hairBack(g, B);
  headShape(g, B, L.skin);
  if (paintStyle === 0) { px(g, B.hx - 6, B.hy - 4, 15, 5, '#18181B'); px(g, B.hx - 6, B.hy - 4, 15, 1, '#3F3F46'); }
  else if (paintStyle === 1) { px(g, B.hx - 2, B.hy + 4, 11, 4, '#B91C1C'); dither(g, B.hx - 4, B.hy + 3, 3, 4, '#B91C1C'); }
  faceOn(g, B, { skin: L.skin, eyes: 'angry', mouth: F.pose === 'strike' ? 'teeth' : 'frown', md: F.md, blink: F.blink });
  if (paintStyle === 2) for (const [dx, dy] of [[-3, 3], [-1, 6], [8, 4]] as const) px(g, B.hx + dx, B.hy + dy, 2, 2, '#F8FAFC');
  whiskers(g, B);
  hairTop(g, B);
  if (!dead) {
    // (the gold band across the brow, the jade medallion, an ear spool)
    part(g, () => g.rect(B.hx - 9, B.hy - 9, 19, 4), GOLD, B.hx - 9, B.hy - 9, 19, 4, 1);
    for (let k = 0; k < 4; k++) px(g, B.hx - 7 + k * 5, B.hy - 8, 2, 1, lt(GOLD, 0.5));
    ball(g, B.hx + 3, B.hy - 9, 2.6, JADE, 0.8);
  }
  ball(g, B.hx - 8, B.hy + 3, 1.8, GOLD, 0.6);
  // Near arm (a gold band above the elbow)
  const a = arm(g, B, 1, near[0], near[1], { sleeve: L.skin, hand: L.skin, len: 0 });
  px(g, (a.sx + a.ex) / 2 - 3, (a.sy + a.ey) / 2 - 1, 6, 2, GOLD); px(g, (a.sx + a.ex) / 2 - 3, (a.sy + a.ey) / 2 - 1, 6, 1, lt(GOLD, 0.45));
  // The spear, in hand
  if (sp) spear(g, sp.x, sp.y, sp.a);
};

/** A warrior from its state: the walk, the tell (drawn back), the thrust; knocked about and dead via the engine. */
export const drawActor = (c: Ctx, e: Enemy, f: number, seed: number, woman?: boolean) => {
  const r = reaction(e);
  const pose: Pose = r?.pose ?? (e.aiState === 'windup' ? 'tell' : e.aiState === 'thrust' ? 'strike' : Math.abs(e.vel.x) > 0.3 ? 'walk' : 'stand');
  const F = frameOf(seed, f, pose, r?.md ?? moodOf(e), 0, woman);
  putFrame(c, 'tpl-actor', F, [-70, -122, 150, 128], g => paintActor(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The stagehand (and the ghost: one of them in the bone suit)

const BLACKS = '#26262C', CARGO = '#2E2E34', GLOVE = '#6E6E76';

const paintStagehand = (g: Ctx, F: Frame, post: number, cower: boolean, bones: boolean, wave = false) => {
  const B: Body = bodyOf(F.seed, F.pose, F.fr, F.woman), L = B.L;
  const fl = flailHands(B, F.fr);
  if (cower && !fl) { B.hy += 4; B.shY += 3; B.lean = -2; }
  const skull = '#E7E5E4';
  // The legs: cargos (pockets), boots; the suit: the leg bones
  legs(g, B, { col: bones ? '#141418' : CARGO, shoe: 'boot', shoeCol: '#18181C', detail: (gg, hip, knee, foot, near) => {
    if (bones) { gg.strokeStyle = near ? skull : dk(skull, 0.3); gg.lineWidth = 1.6; gg.beginPath(); gg.moveTo(hip[0], hip[1] + 2); gg.lineTo(knee[0], knee[1]); gg.lineTo(foot[0], foot[1] - 5); gg.stroke(); px(gg, knee[0] - 2, knee[1] - 1, 4, 3, near ? skull : dk(skull, 0.3)); return; }
    px(gg, (hip[0] + knee[0]) / 2 - 3, (hip[1] + knee[1]) / 2 + 1, 6, 5, dk(CARGO, 0.3)); px(gg, (hip[0] + knee[0]) / 2 - 3, (hip[1] + knee[1]) / 2 + 1, 6, 1, lt(CARGO, 0.2));
  } });
  // Where the hands go: at the trick, or up round the face
  let far: [number, number], near: [number, number];
  if (fl) [far, near] = fl;
  else if (cower) { far = [B.hx - 2, B.hy + 5]; near = [B.hx + 8, B.hy - 1]; }
  else if (bones && wave) { const k = F.fr % 2; far = [-B.w / 2 - 10, B.shY - 10 - k * 3]; near = [B.w / 2 + 10, B.shY - 12 + k * 3]; }
  else if (bones) { far = [-B.w / 2 - 2, B.shY + 22]; near = [B.w / 2 + 3, B.shY + 21]; }
  else if (post === 1) { const a = (F.fr / 4) * Math.PI * 2; near = [B.w / 2 + 11 + Math.cos(a) * 6, B.shY + 18 + Math.sin(a) * 6]; far = [B.w / 2 + 5, B.shY + 20]; }
  else if (post === 2) { const k = F.fr % 2; near = [B.w / 2 + 13, B.shY + 21 + k]; far = [B.w / 2 + 6, B.shY + 18 + k]; }
  else { const k = F.fr % 2; near = [B.w / 2 + 9, B.shY + 2 + k * 3]; far = [-B.w / 2 - 1, B.shY + 21]; }
  const top = bones ? '#141418' : BLACKS, glove = bones ? '#141418' : GLOVE;
  const armBones = (a: { sx: number; sy: number; ex: number; ey: number }, h: [number, number], col: string) => {
    if (!bones) return;
    g.strokeStyle = col; g.lineWidth = 1.6; g.beginPath(); g.moveTo(a.sx, a.sy + 1); g.lineTo(a.ex, a.ey); g.lineTo(h[0], h[1]); g.stroke();
    px(g, a.ex - 1.5, a.ey - 1.5, 3, 3, col); for (let k = -1; k <= 1; k++) px(g, h[0] + 1, h[1] + k * 1.6, 3, 1, col);
  };
  armBones(arm(g, B, -1, far[0], far[1], { sleeve: dk(top, 0.1), hand: dk(glove, 0.1), len: bones ? 1 : 0.5 }), far, dk(skull, 0.3));
  if (!bones) {
    // (the belt pack, its cable up to the headset)
    part(g, () => g.roundRect(-B.hipW / 2 - 4, B.hipY - 7, 6, 9, 1), '#3A3A42', -B.hipW / 2 - 4, B.hipY - 7, 6, 9, 0.8);
    px(g, -B.hipW / 2 - 3, B.hipY - 6, 1, 1, '#22C55E');
    g.strokeStyle = '#111114'; g.lineWidth = 1; g.beginPath(); g.moveTo(-B.hipW / 2 - 1, B.hipY - 7); g.quadraticCurveTo(-B.w / 2 - 4, B.shY + 10, B.hx - 8, B.hy + 2); g.stroke();
  }
  // The torso: the black tee (a faded crew logo), or the bone suit's ribs
  const tp = torso(g, B, top);
  g.save(); g.beginPath(); tp(); g.clip();
  if (bones) {
    px(g, B.hx - 1, B.shY + 2, 3, B.hipY - B.shY - 2, skull);
    for (let k = 0; k < 4; k++) { const y = B.shY + 5 + k * 5; px(g, B.hx - B.w / 2 + 4 + k, y, B.w - 8 - k * 2, 2, skull); px(g, B.hx - 1, y, 3, 2, INK); }
    part(g, () => { g.moveTo(-B.hipW / 2 + 2, B.hipY); g.lineTo(0, B.hipY - 5); g.lineTo(B.hipW / 2 - 2, B.hipY); g.lineTo(0, B.hipY + 2); g.closePath(); }, skull, -B.hipW / 2 + 2, B.hipY - 5, B.hipW - 4, 7, 0.6);
  } else {
    px(g, -5, B.shY + 8, 11, 6, '#3A3A42'); px(g, -4, B.shY + 9, 9, 1, '#6A6A72'); px(g, -3, B.shY + 12, 7, 1, '#6A6A72');
    px(g, B.w / 2 - 4, B.shY, 3, B.hipY - B.shY + 2, dk(top, 0.3));
  }
  g.restore();
  if (!bones) {
    // (the belt: gaffer tape on it, a flashlight, keys on a carabiner)
    px(g, -B.hipW / 2, B.hipY - 3, B.hipW + 1, 3, '#111114');
    ball(g, B.hipW / 2 - 1, B.hipY + 2, 4, '#9CA3AF', 1); ball(g, B.hipW / 2 - 1, B.hipY + 2, 1.8, '#3A3A42', 0.5);
    part(g, () => g.rect(-2, B.hipY - 2, 3, 11), '#3A3A42', -2, B.hipY - 2, 3, 11, 0.6); px(g, -2, B.hipY + 8, 3, 1, '#FDE68A');
    px(g, 4, B.hipY, 2, 3, '#94A3B8'); px(g, 5, B.hipY + 3, 1, 3, '#CBD5E1'); px(g, 3, B.hipY + 5, 2, 2, '#E8C130');
  }
  // The head: hair, the face; a beanie or a cap on some; the headset (the bone suit: the skull hood)
  if (bones) {
    part(g, () => g.ellipse(B.hx, B.hy - 1, B.rx + 1.5, B.ry + 1.5, 0, 0, Math.PI * 2), '#141418', B.hx - B.rx - 2, B.hy - B.ry - 3, B.rx * 2 + 4, B.ry * 2 + 4, 1);
    part(g, () => g.ellipse(B.hx + 1.5, B.hy, B.rx - 1, B.ry - 1, 0, 0, Math.PI * 2), skull, B.hx - B.rx + 2, B.hy - B.ry + 1, B.rx * 2 - 2, B.ry * 2 - 2, 0.8);
    px(g, B.hx - 2, B.hy - 3, 4, 4, INK); px(g, B.hx + 4, B.hy - 3, 4, 4, INK); px(g, B.hx + 5, B.hy + 2, 2, 2, INK);
    for (let k = 0; k < 4; k++) px(g, B.hx + k * 2.5 - 1, B.hy + 5, 1, 3, INK);
    px(g, B.hx - 1, B.hy - 2, 1, 1, '#93C5FD'); px(g, B.hx + 5, B.hy - 2, 1, 1, '#93C5FD');
  } else {
    hairBack(g, B);
    headShape(g, B, L.skin);
    faceOn(g, B, { skin: L.skin, eyes: cower ? 'wide' : 'tired', mouth: cower ? 'o' : F.seed % 2 ? 'flat' : 'smirk', md: F.md, blink: F.blink });
    whiskers(g, B); glasses(g, B);
    const hat = F.seed % 3;
    if (hat === 0) {
      // (a beanie: ribbed, a fold at the brim)
      partTop(g, () => g.ellipse(B.hx, B.hy - 5, 10, 9, 0, Math.PI, 0), '#3A3A42', B.hx - 10, B.hy - 14, 20, 10, 1);
      part(g, () => g.rect(B.hx - 10, B.hy - 7, 20, 4), '#4A4A54', B.hx - 10, B.hy - 7, 20, 4, 1);
      for (let k = 0; k < 6; k++) px(g, B.hx - 8 + k * 3, B.hy - 7, 1, 4, '#2A2A30');
    } else if (hat === 1) {
      // (a ball cap on backwards: the strap's gap at the front)
      hairTop(g, B);
      partTop(g, () => g.ellipse(B.hx, B.hy - 7, 9.5, 7, 0, Math.PI, 0), '#18181B', B.hx - 9, B.hy - 14, 19, 8, 1);
      part(g, () => { g.moveTo(B.hx - 7, B.hy - 8); g.lineTo(B.hx - 17, B.hy - 6); g.lineTo(B.hx - 8, B.hy - 5); g.closePath(); }, '#18181B', B.hx - 17, B.hy - 8, 10, 3, 0.8);
      px(g, B.hx + 5, B.hy - 9, 3, 2, L.hair);
    } else hairTop(g, B);
    // (the headset: the band over, the ear cup, the boom to the mouth)
    g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.arc(B.hx, B.hy - 1, 10, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
    g.strokeStyle = '#4A4A52'; g.lineWidth = 1; g.beginPath(); g.arc(B.hx, B.hy - 1, 10, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
    part(g, () => g.roundRect(B.hx - 11, B.hy - 3, 5, 8, 1.5), '#2A2A30', B.hx - 11, B.hy - 3, 5, 8, 1);
    g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(B.hx - 8, B.hy + 3); g.quadraticCurveTo(B.hx - 2, B.hy + 10, B.hx + 5, B.hy + 8); g.stroke();
    px(g, B.hx + 4, B.hy + 7, 3, 2, '#3F3F46');
  }
  armBones(arm(g, B, 1, near[0], near[1], { sleeve: top, hand: glove, len: bones ? 1 : 0.5 }), near, skull);
};

/** A stagehand at their post (`post`: which trick), cowering if he's near. */
export const drawStagehand = (c: Ctx, e: Enemy, f: number, seed: number, woman?: boolean) => {
  const r = reaction(e), cower = !r && e.aiState === 'cower';
  const post = e.variant ?? 1;
  const F = frameOf(seed, f, r?.pose ?? 'stand', r?.md ?? moodOf(e), 0, woman, `${post}${cower ? 'c' : ''}`);
  if (!r) F.fr = cower ? Math.floor((f + seed) / 8) % 2 : post === 1 ? Math.floor(f / 5) % 4 : Math.floor((f + seed) / (post === 2 ? 4 : 30)) % 2;
  putFrame(c, 'tpl-hand', F, [-60, -104, 124, 110], g => paintStagehand(g, F, post, cower, false));
};

/** The Pepper's ghost: in the bone suit, arms up and waving (`on`), or stood about between scares. */
export const drawBoneSuit = (c: Ctx, f: number, on: boolean) => {
  const F = frameOf(909, f, 'stand', 'ok', 0, false, on ? 'on' : 'off');
  F.fr = on ? Math.floor(f / 10) % 2 : 0; F.blink = false;
  putFrame(c, 'tpl-bones', F, [-60, -104, 124, 110], g => paintStagehand(g, F, 0, false, true, on));
};

// ---------------------------------------------------------------------------------------------------------------
// A guest kicked out of the cart (flying: arms and legs everywhere)

const TEES = ['#E84A4A', '#3A7AD8', '#F2B02A', '#2EA86A', '#E85AA8', '#F4F4F0', '#7A5AC8'];
const paintFlung = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, 'thrown', F.fr, F.woman), L = B.L;
  const shirt = pickOf(F.seed, 2, TEES), bottom = pickOf(F.seed, 3, ['#2E4A7A', '#B8AE98', '#5A5248', '#7A5A3A']);
  legs(g, B, { col: bottom, shoe: 'sneaker', shoeCol: '#F4F4F0', bareBelow: F.seed % 2 === 0 });
  const [far, near] = flailHands(B, F.fr)!;
  arm(g, B, -1, far[0], far[1], { sleeve: dk(shirt, 0.12), hand: L.skin, len: 0.35 });
  torso(g, B, shirt);
  px(g, -5, B.shY + 9, 11, 2, lt(shirt, 0.5)); px(g, -4, B.shY + 13, 9, 2, lt(shirt, 0.5));
  hairBack(g, B, L.hair, 14);
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: 'wide', mouth: 'o', md: 'ok' });
  whiskers(g, B); glasses(g, B); hairTop(g, B);
  arm(g, B, 1, near[0], near[1], { sleeve: shirt, hand: L.skin, len: 0.35 });
  void limb;
};
export const drawFlungGuest = (c: Ctx, seed: number, woman: boolean, f: number) => {
  const F = frameOf(seed, f, 'thrown', 'ok', 0, woman);
  putFrame(c, 'tpl-flung', F, [-50, -100, 100, 106], g => paintFlung(g, F));
};
