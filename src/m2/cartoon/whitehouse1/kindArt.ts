// The mean men, drawn (a first pass: crude but clean, on Spooky Land's person drawer, costume.ts, so whoever's in the
// suit shows: their skin, build and face, man or woman). Seeded: no two the same. Each drawn hurt, knocked about and
// held (the grabs); they never lie dead here (cartoon kills: a puff). Feet at the origin, facing right (the engine
// mirrors them). Each frame painted once into a stamp.
//
//   goon      a black suit, a white shirt, a skinny black tie, dark glasses, a curly earpiece wire; cracking his
//             knuckles (the tell), the swing; crouched (the tell), the tackle flat out, sprawled on his face
//   lobbyist  a navy pinstripe suit, a red tie, a gold watch, slicked hair, a fat brown briefcase (popped open, bills
//             flying: the tell; swung)
//   pollster  a tan sweater vest over a blue shirt, a red bow tie, glasses on a chain, a clipboard, a pencil behind the
//             ear (licked and ticking: the tell)
//   blimp     a little silver remote control blimp, MEAN MEN on its side, a gondola with a camera, a spinning prop;
//             the hatch underneath open and a red light blinking (the tell)

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, px, ball, flat, limb,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, hairTop, hairBack, frameOf, putFrame, pickOf,
  moodOf, reaction,
} from '../../spooky/costume';
import { stamp } from '../../../m1/game/render/stamp';
import { signText } from '../../signLetters';

type Ctx = CanvasRenderingContext2D;

const moving = (e: Enemy, min = 0.3): Pose => (Math.abs(e.vel.x) > min ? 'walk' : 'stand');
const poseOf = (e: Enemy, tells: string[], strikes: string[]): Pose =>
  tells.includes(e.aiState ?? '') ? 'tell' : strikes.includes(e.aiState ?? '') ? 'strike' : moving(e);
const frameFor = (e: Enemy, f: number, seed: number, pose: Pose, v = '') => {
  const r = reaction(e);
  return frameOf(seed, f, r?.pose ?? pose, r?.md ?? moodOf(e), 0, undefined, v);
};
const BOX: [number, number, number, number] = [-84, -170, 178, 174];
const face = (g: Ctx, B: Body, F: Frame, eyes: 'open' | 'angry' | 'wide' | 'tired' | 'smug' | 'droopy', mouth: 'flat' | 'grin' | 'smile' | 'teeth' | 'o' | 'smirk' | 'frown') => {
  headShape(g, B, B.L.skin);
  faceOn(g, B, { skin: B.L.skin, eyes, mouth, md: F.md, blink: F.blink });
};
const handsAt = (B: Body, F: Frame, far: [number, number], near: [number, number]): { far: [number, number]; near: [number, number]; held: boolean } => {
  const fl = flailHands(B, F.fr);
  return fl ? { far: fl[0], near: fl[1], held: true } : { far, near, held: false };
};

// ---------------------------------------------------------------------------------------------------------------
// The henchman

const SUIT = '#1C1C22';
const shades = (g: Ctx, B: Body) => {
  part(g, () => g.roundRect(B.hx - 3, B.hy - 4, 13, 4.5, 1.5), '#0A0A0E', B.hx - 3, B.hy - 4, 13, 4.5, 1);
  px(g, B.hx + 5, B.hy - 3.5, 3, 1, '#9CA3AF');
};
const earpiece = (g: Ctx, B: Body) => {
  g.strokeStyle = '#E5E7EB'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(B.hx - B.rx + 1, B.hy + 1);
  for (let k = 0; k < 4; k++) g.quadraticCurveTo(B.hx - B.rx - 2, B.hy + 4 + k * 3, B.hx - B.rx + 1, B.hy + 5.5 + k * 3);
  g.stroke();
};
const paintGoon = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const crack = F.v === 'crack', punch = F.v === 'punch', crouch = F.v === 'crouch', rush = F.v === 'rush', sprawl = F.v === 'sprawl';
  g.save();
  if (sprawl) { g.translate(0, -2); g.rotate(1.35); g.translate(-30, 10); }
  else if (rush) { g.translate(0, -6); g.rotate(0.45); }
  else if (crouch) { g.translate(0, 8); B.feet = [-9, 9]; }
  legs(g, B, { col: SUIT, shoe: 'shoe', shoeCol: '#050505' });
  const H = handsAt(B, F,
    crack ? [B.w / 2 + 4, B.shY + 12] : rush ? [B.w / 2 + 14, B.shY + 2] : crouch ? [B.w / 2 + 6, B.shY + 24] : [-B.w / 2 - 4, B.shY + 20],
    crack ? [B.w / 2 + 7, B.shY + 10] : punch ? [B.w / 2 + 24, B.shY + 4] : rush ? [B.w / 2 + 18, B.shY + 8] : crouch ? [B.w / 2 + 12, B.shY + 22] : [B.w / 2 + 4, B.shY + 20]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: SUIT, hand: L.skin });
  torso(g, B, SUIT, B.shY, B.hipY + 2, 4);
  // (the white shirt's V and its collar points, the skinny tie and its knot, the lapels lit along their edges, the one
  // button done up, the MEAN MEN pin)
  flat(g, () => { g.moveTo(-4, B.shY + 1); g.lineTo(5, B.shY + 1); g.lineTo(0.5, B.shY + 15); g.closePath(); }, '#F8FAFC', 0.8);
  flat(g, () => { g.moveTo(-4, B.shY + 1); g.lineTo(-1, B.shY + 1); g.lineTo(-3, B.shY + 5); g.closePath(); }, '#E2E6EE', 0.5);
  flat(g, () => { g.moveTo(5, B.shY + 1); g.lineTo(2, B.shY + 1); g.lineTo(4, B.shY + 5); g.closePath(); }, '#E2E6EE', 0.5);
  px(g, -0.5, B.shY + 3, 2, 12, '#050505'); px(g, -1, B.shY + 2, 3, 2, '#1A1A22');
  px(g, -9, B.shY + 2, 4, 13, '#2A2A33'); px(g, 6, B.shY + 2, 4, 13, '#2A2A33');
  px(g, -9, B.shY + 2, 1, 13, '#4A4A58'); px(g, 6, B.shY + 2, 1, 13, '#4A4A58');
  px(g, 0, B.shY + 17, 1.6, 1.6, '#3A3A48');
  px(g, -8, B.shY + 6, 2.4, 2.4, '#DC2626'); px(g, -8, B.shY + 6, 1, 1, '#FCA5A5');
  hairBack(g, B);
  face(g, B, F, 'angry', crack || punch || rush ? 'teeth' : 'frown');
  whiskers(g, B);
  // (a buzz cut on the men; the women's hair up in a tight bun)
  if (L.woman) { hairTop(g, B); ball(g, B.hx - 8, B.hy - 7, 4, L.hair, 1); } else if (!L.bald) px(g, B.hx - 8, B.hy - 11, 17, 3, L.hair);
  if (F.md !== 'dead') shades(g, B);
  earpiece(g, B);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: SUIT, hand: L.skin });
  // (the knuckles cracking: little stars off them)
  if (crack && F.fr % 2) { px(g, H.near[0] + 4, H.near[1] - 6, 2, 2, '#FDE047'); px(g, H.near[0] + 7, H.near[1] - 3, 2, 2, '#FDE047'); }
  g.restore();
};
export const drawGoon = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState ?? '';
  const v = st === 'punchWind' ? 'crack' : st === 'punch' ? 'punch' : st === 'crouch' ? 'crouch' : st === 'rush' ? 'rush' : st === 'sprawl' ? 'sprawl' : '';
  const F0 = frameFor(e, f, seed, poseOf(e, ['punchWind', 'crouch'], ['punch', 'rush']), v);
  const F = F0.pose === 'tell' ? { ...F0, fr: (f >> 3) % 2 } : F0;
  putFrame(c, 'ct-goon', F, BOX, g => paintGoon(g, F));
  if (st === 'sprawl' && e.health > 0) {
    for (let i = 0; i < 3; i++) { const a = f * 0.2 + (i / 3) * Math.PI * 2; c.fillStyle = INK; c.fillRect(Math.round(Math.cos(a) * 14) + 26, -30 + Math.round(Math.sin(a) * 4) - 2, 5, 5); c.fillStyle = '#FDE047'; c.fillRect(Math.round(Math.cos(a) * 14) + 27, -29 + Math.round(Math.sin(a) * 4) - 2, 3, 3); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The lobbyist

const PINS = ['#1E293B', '#27303F', '#2E2A3A'];
const briefcase = (g: Ctx, x: number, y: number, a: number, open: boolean, f: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => g.roundRect(-12, 0, 24, 16, 2), '#7C4A1E', -12, 0, 24, 16, 1.1);
  px(g, -12, 0, 24, 2, '#9A5E2B'); px(g, -3, -3, 6, 3, '#3F2410'); px(g, -10, 6, 2, 2, '#FACC15'); px(g, 8, 6, 2, 2, '#FACC15');
  if (open) {
    // (the lid up, bills stuffed in it fluttering)
    part(g, () => g.roundRect(-12, -14, 24, 14, 2), '#6B3F19', -12, -14, 24, 14, 1);
    for (let k = 0; k < 4; k++) { const bx = -9 + k * 5, by = -6 - ((f + k * 3) % 6); part(g, () => g.rect(bx, by, 5, 3), '#86EFAC', bx, by, 5, 3, 0.6); }
  }
  g.restore();
};
const paintLobbyist = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, S = pickOf(F.seed, 3, PINS);
  const open = F.v === 'open', swingBack = F.v === 'swingWind', swing = F.v === 'swing';
  legs(g, B, { col: S, shoe: 'shoe', shoeCol: '#1C1917' });
  const H = handsAt(B, F, [-B.w / 2 - 2, B.shY + 18],
    swingBack ? [B.hx - 8, B.hy - 18] : swing ? [B.w / 2 + 22, B.shY + 10] : open ? [B.w / 2 + 12, B.shY + 14] : [B.w / 2 + 4, B.shY + 22]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: S, hand: L.skin });
  // (the gold watch on the far wrist)
  if (!H.held) px(g, H.far[0] - 2, H.far[1] - 5, 4, 2, '#FACC15');
  torso(g, B, S, B.shY, B.hipY + 2, 4);
  // (pinstripes, the shirt, the red tie, the lapels, a pocket square)
  g.strokeStyle = lt(S, 0.18); g.lineWidth = 0.6;
  for (let k = -8; k <= 10; k += 4) { g.beginPath(); g.moveTo(k, B.shY + 2); g.lineTo(k - 1, B.hipY); g.stroke(); }
  flat(g, () => { g.moveTo(-4, B.shY + 1); g.lineTo(5, B.shY + 1); g.lineTo(0.5, B.shY + 14); g.closePath(); }, '#F8FAFC', 0.8);
  flat(g, () => { g.moveTo(-1.5, B.shY + 3); g.lineTo(2, B.shY + 3); g.lineTo(3, B.shY + 15); g.lineTo(0, B.shY + 18); g.lineTo(-2, B.shY + 15); g.closePath(); }, '#DC2626', 0.7);
  px(g, -10, B.shY + 4, 4, 3, '#F8FAFC');
  // (a wad of bills out of the breast pocket, a flag pin on the lapel)
  px(g, 5, B.shY + 4, 4, 4, '#86EFAC'); px(g, 6, B.shY + 3, 3, 2, '#4ADE80'); px(g, 5, B.shY + 7, 4, 1, '#166534');
  px(g, -8, B.shY + 9, 3, 2, '#DC2626'); px(g, -8, B.shY + 9, 1.4, 1, '#1D4ED8'); px(g, -7, B.shY + 10, 2, 1, '#FFFFFF');
  hairBack(g, B);
  face(g, B, F, swingBack || swing ? 'angry' : 'smug', swing ? 'teeth' : 'grin');
  whiskers(g, B);
  hairTop(g, B); if (!L.bald) px(g, B.hx - 4, B.hy - 9, 7, 1, lt(L.hair, 0.45));
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: S, hand: L.skin });
  if (!H.held) briefcase(g, H.near[0], H.near[1] - 2, swingBack ? -2.4 : swing ? 0.8 : open ? -0.2 : 0, open, F.fr);
};
export const drawLobbyist = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState ?? '';
  const F0 = frameFor(e, f, seed, poseOf(e, ['open', 'swingWind'], ['swing']), st === 'open' ? 'open' : st === 'swingWind' ? 'swingWind' : st === 'swing' ? 'swing' : '');
  const F = F0.pose === 'tell' ? { ...F0, fr: (f >> 2) % 6 } : F0;
  putFrame(c, 'ct-lobbyist', F, BOX, g => paintLobbyist(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The pollster

const VEST = ['#C8A26B', '#A3B18A', '#B08968'];
const clipboard = (g: Ctx, x: number, y: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => g.roundRect(-8, -11, 16, 22, 1.5), '#A16207', -8, -11, 16, 22, 1);
  px(g, -6, -8, 12, 17, '#F8FAFC'); px(g, -3, -13, 6, 4, '#9CA3AF');
  for (let k = 0; k < 4; k++) { px(g, -5, -5 + k * 4, 2, 2, k % 2 ? '#DC2626' : '#16A34A'); px(g, -2, -4.5 + k * 4, 6, 1, '#94A3B8'); }
  g.restore();
};
const paintPollster = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, V = pickOf(F.seed, 2, VEST);
  const tickT = F.v === 'tick', slapBack = F.v === 'slapWind', slap = F.v === 'slap';
  legs(g, B, { col: '#57534E', shoe: 'shoe', shoeCol: '#3F2410' });
  const H = handsAt(B, F, tickT ? [B.w / 2 + 4, B.shY + 14] : [-B.w / 2 - 2, B.shY + 18],
    tickT ? [B.hx + 6, B.hy + 6 + (F.fr % 2) * 8] : slapBack ? [B.hx - 6, B.hy - 18] : slap ? [B.w / 2 + 20, B.shY + 8] : [B.w / 2 + 8, B.shY + 16]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: '#93C5FD', hand: L.skin });
  // (the clipboard in the far hand while he ticks)
  if (tickT && !H.held) clipboard(g, H.far[0] + 4, H.far[1] - 6, 0.2);
  torso(g, B, '#93C5FD', B.shY, B.hipY + 2);
  const vest = torso(g, B, V, B.shY + 4, B.hipY + 1, -3);
  // (the vest's argyle: diamonds in a second tone, a dashed cross-line over them)
  g.save(); g.beginPath(); vest(); g.clip();
  for (let row = 0, y = B.shY + 8; y < B.hipY + 2; y += 8, row++) for (let x = -B.w / 2 + (row % 2) * 4; x < B.w / 2 + 4; x += 8) {
    g.fillStyle = dk(V, 0.18); g.beginPath(); g.moveTo(x, y - 4); g.lineTo(x + 4, y); g.lineTo(x, y + 4); g.lineTo(x - 4, y); g.closePath(); g.fill();
    px(g, x - 0.5, y - 4, 1, 1, lt(V, 0.4)); px(g, x + 2, y - 2, 1, 1, '#DC2626');
  }
  g.restore();
  for (let y = B.shY + 8; y < B.hipY - 1; y += 4) px(g, 0, y, 1.2, 1.2, '#F8FAFC');
  flat(g, () => { g.moveTo(-3, B.shY + 4); g.lineTo(3, B.shY + 4); g.lineTo(0, B.shY + 12); g.closePath(); }, '#93C5FD', 0.7);
  // (the bow tie)
  flat(g, () => { g.moveTo(-5, B.shY); g.lineTo(0, B.shY + 2.5); g.lineTo(5, B.shY); g.lineTo(5, B.shY + 5); g.lineTo(0, B.shY + 2.5); g.lineTo(-5, B.shY + 5); g.closePath(); }, '#DC2626', 0.7);
  hairBack(g, B);
  face(g, B, F, tickT ? 'smug' : slap || slapBack ? 'angry' : 'smug', tickT ? 'o' : slap ? 'teeth' : 'smirk');
  whiskers(g, B); hairTop(g, B);
  // (glasses, always, on a chain; the pencil behind the ear)
  for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 1.8; g.beginPath(); g.arc(B.hx + 2.5 + s * 3.6, B.hy - 1, 2.6, 0, Math.PI * 2); g.stroke(); }
  g.strokeStyle = '#D4D4D8'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(B.hx - 4, B.hy); g.quadraticCurveTo(B.hx - 9, B.hy + 10, B.hx - 2, B.hy + 12); g.stroke();
  if (!tickT) px(g, B.hx - B.rx - 1, B.hy - 8, 1.6, 9, '#FACC15');
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: '#93C5FD', hand: L.skin });
  if (tickT) px(g, H.near[0] - 1, H.near[1] - 8, 1.6, 8, '#FACC15');
  else if (!H.held) clipboard(g, H.near[0] + 2, H.near[1] - 4, slapBack ? -2 : slap ? 1.2 : 0.15);
};
export const drawPollster = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState ?? '';
  const F0 = frameFor(e, f, seed, poseOf(e, ['tick', 'slapWind'], ['slap']), st === 'tick' ? 'tick' : st === 'slapWind' ? 'slapWind' : st === 'slap' ? 'slap' : '');
  const F = F0.pose === 'tell' ? { ...F0, fr: (f >> 3) % 2 } : F0;
  putFrame(c, 'ct-pollster', F, BOX, g => paintPollster(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The spy blimp

export const drawBlimp = (c: Ctx, e: Enemy, f: number) => {
  const hatch = e.aiState === 'hatch', hurt = (e.hitFlash ?? 0) > 0;
  // (the envelope painted once; the prop, the light and the hatch live)
  stamp(c, `ct-blimp2-${hurt ? 1 : 0}`, -42, -42, 86, 50, g => {
    const E = hurt ? ['#C8CCD8', '#E2E6EE', '#F2F4F8', '#FFFFFF', '#FFFFFF'] : ['#5E6476', '#868CA0', '#AEB4C6', '#D2D6E2', '#F2F4FA'];
    // (the fins at the back: red, stepped, a white stripe)
    for (const s of [-1, 1]) {
      flat(g, () => { g.moveTo(-22, -16 + s * 4); g.lineTo(-38, -16 + s * 13); g.lineTo(-34, -16 + s * 3); g.lineTo(-26, -16); g.closePath(); }, '#B91C1C', 1.2);
      px(g, -34, -16 + s * 8 - 0.5, 8, 1, '#FCA5A5');
    }
    flat(g, () => { g.moveTo(-24, -17); g.lineTo(-40, -17); g.lineTo(-40, -15); g.lineTo(-24, -15); g.closePath(); }, '#7A0E1C', 1);
    // (the envelope: silver in bands from the top down, a lit crown, the seams' gores, the nose cone)
    g.save(); g.beginPath(); g.ellipse(0, -16, 30, 12, 0, 0, Math.PI * 2); g.clip();
    const bands = [E[4], E[3], E[3], E[2], E[2], E[1], E[0]];
    bands.forEach((col, i) => { px(g, -31, -28 + i * 3.6, 62, 4, col); if (i) for (let x = -30 + (i % 2); x < 31; x += 2) px(g, x, -28 + i * 3.6, 1, 1, col); });
    for (const gx of [-18, -6, 6, 18]) { g.strokeStyle = E[1]; g.lineWidth = 0.8; g.beginPath(); g.moveTo(gx * 0.6, -28); g.quadraticCurveTo(gx * 1.2, -16, gx * 0.6, -4); g.stroke(); }
    px(g, 22, -22, 8, 12, E[2]); px(g, 24, -22, 4, 3, E[4]);
    g.restore();
    g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.ellipse(0, -16, 30, 12, 0, 0, Math.PI * 2); g.stroke();
    px(g, -14, -26, 18, 2, '#FFFFFF'); px(g, -18, -24, 6, 1, '#FFFFFF');
    // (MEAN MEN painted down its side: red letters, inked, a navy stripe under)
    px(g, -26, -11, 50, 2, '#1D3A8A');
    signText(g, 'MEAN MEN', 0, -13, { sx: 1, sy: 1, gap: 1, bold: true, fill: ['#F06A72', '#DC3442'], ink: INK });
    // (the gondola: windows, a lit edge, the camera under it on its gimbal)
    part(g, () => g.roundRect(-10, -5, 20, 8, 3), '#3F3F46', -10, -5, 20, 8, 1.2);
    for (const wx of [-6, -1, 4]) { px(g, wx, -3, 3, 3, '#9CC4F0'); px(g, wx, -3, 1, 1, '#FFFFFF'); }
    ball(g, 11, 0, 3.4, '#18181B', 1); px(g, 12, -1, 1.6, 1.6, '#60A5FA'); px(g, 12.5, -1.5, 0.8, 0.8, '#FFFFFF');
    px(g, 7, -3, 3, 1, '#52525B');
    // (the antenna)
    px(g, -2, -32, 1, 5, INK); px(g, -3, -34, 3, 2, '#DC2626');
  });
  // (the prop at the back spinning; the red light; the hatch open under it)
  const k = Math.abs(Math.sin(f * 0.8));
  part(c, () => c.ellipse(-37, -16, 2, 9 * k + 1, 0, 0, Math.PI * 2), '#52525B', -39, -26, 4, 20, 0.8);
  if (hatch && f % 8 < 4) { c.fillStyle = 'rgba(239, 68, 68, 0.4)'; c.beginPath(); c.arc(0, -2, 6, 0, Math.PI * 2); c.fill(); }
  px(c, -1, -6, 2, 2, hatch && f % 8 < 4 ? '#EF4444' : '#7F1D1D');
  if (hatch) { px(c, -4, 2, 8, 2, '#18181B'); ball(c, 0, 5, 3, '#65A30D', 1); }
};
void dk; void limb;
