// Sawdust Gulch's guests and the park's own (the final pass: peak SNES, on Spooky Land's person drawer, costume.ts, as
// the cast is: whoever it is shows (skin, build, face, man or woman), every material in steps, inked round). Seeded:
// no two the same. Each frame painted once into a stamp (by person, pose and frame).
//
//   guest      shorts or jeans or capris, a loud T-shirt (a print on some: a bison, I SURVIVED, a sunset) or a polo, a
//              souvenir hat (a straw cowboy hat, a ball cap, a sun visor, a coonskin cap on the kids' heads), a fanny
//              pack, a lanyard, sneakers; a phone, a souvenir cup, a churro, a map
//   medic      the park's paramedics: a white shirt with the red cross on the chest and a radio on the shoulder, navy
//              trousers, a belt of pouches, gloves
//   barkeep    the saloon's: a white shirt, sleeve garters, a striped vest, a bow tie, an apron, slicked hair; a glass
//              and a rag
//   pianist    the saloon's piano player: a derby, a brocade vest, his sleeves up (seated: only his top half shows)
//   operator   the ride's staff: the park's khaki shirt with a name tag, a lanyard, a radio
//
// Feet at the origin, facing right (the caller mirrors).

import {
  type Pose, type Body, type Frame, INK, dk, lt, part, partTop, px, ball, dither,
  bodyOf, legs, torso, arm, headShape, faceOn, whiskers, glasses, hairTop, hairBack, frameOf, putFrame, pickOf,
} from '../../spooky/costume';

type Ctx = CanvasRenderingContext2D;

export type GuestPose = 'stand' | 'walk' | 'cheer' | 'photo' | 'point' | 'hold' | 'wave' | 'sit' | 'cower';
export type GuestMood = 'bored' | 'happy' | 'shocked' | 'scared' | 'angry';
export type GuestOutfit = 'guest' | 'medic' | 'barkeep' | 'pianist' | 'operator';

const TEES = ['#E84A4A', '#3A7AD8', '#F2B02A', '#2EA86A', '#E85AA8', '#F4F4F0', '#7A5AC8', '#F27A2A', '#2AB0B8', '#1C1C24'];
const BOTTOMS = ['#2E4A7A', '#5A5248', '#B8AE98', '#1C2030', '#7A5A3A', '#3A5A3A'];
const HATS = ['#D8B868', '#C83A3A', '#2E4A8A', '#F4F0E8', '#1C1C24', '#7A5230'];

/** Where the hands go for each pose (far, near). */
const handsFor = (B: Body, pose: GuestPose, fr: number): [[number, number], [number, number]] => {
  switch (pose) {
    case 'cheer': return [[-B.w / 2 - 6, B.hy - 14 - (fr % 2) * 3], [B.w / 2 + 6, B.hy - 16 + (fr % 2) * 3]];
    case 'wave': return [[-B.w / 2 - 2, B.shY + 18], [B.w / 2 + 8, B.hy - 14 + ((fr % 2) ? -3 : 3)]];
    case 'photo': return [[B.hx + 2, B.hy + 2], [B.hx + 9, B.hy + 1]];
    case 'point': return [[-B.w / 2 - 2, B.shY + 18], [B.w / 2 + 22, B.shY + 2]];
    case 'hold': return [[-B.w / 2 + 2, B.shY + 26], [B.w / 2 + 14, B.shY + 24]];
    case 'cower': return [[B.hx - 2, B.hy + 4], [B.hx + 8, B.hy - 2]];
    case 'sit': return [[B.w / 2 + 10, B.shY + 18 + (fr % 2) * 2], [B.w / 2 + 16, B.shY + 20 - (fr % 2) * 2]];
    default: return [[-B.w / 2 - 2, B.shY + 20], [B.w / 2 + 3, B.shY + 21]];
  }
};

const paintPerson = (g: Ctx, F: Frame, pose: GuestPose, mood: GuestMood, outfit: GuestOutfit) => {
  const base: Pose = pose === 'walk' ? 'walk' : 'stand';
  const B = bodyOf(F.seed, base, F.fr, F.woman), L = B.L;
  if (pose === 'cower') { B.hy += 4; B.shY += 3; B.lean = -2; }
  const kid = outfit === 'guest' && F.seed % 9 === 4;
  // ---- the clothes by outfit
  let shirt = pickOf(F.seed, 2, TEES), bottom = pickOf(F.seed, 3, BOTTOMS), shoeCol = pickOf(F.seed, 5, ['#F4F4F0', '#2A2A30', '#C83A3A', '#3A6AD8']), bare = outfit === 'guest' && F.seed % 3 === 0;
  if (outfit === 'medic') { shirt = '#F4F6F8'; bottom = '#1E3A6A'; shoeCol = '#1C1C20'; bare = false; }
  else if (outfit === 'barkeep') { shirt = '#F4F0E6'; bottom = '#2A2622'; shoeCol = '#1C1209'; bare = false; }
  else if (outfit === 'pianist') { shirt = '#E8E0D0'; bottom = '#3A3A42'; shoeCol = '#1C1209'; bare = false; }
  else if (outfit === 'operator') { shirt = '#B8A070'; bottom = '#5A4A32'; shoeCol = '#3A2A1A'; bare = false; }
  if (pose !== 'sit') legs(g, B, { col: bottom, shoe: outfit === 'guest' ? 'sneaker' : 'shoe', shoeCol, bareBelow: bare, detail: (gg, hip, _k, ft) => { if (outfit === 'medic') px(gg, Math.min(hip[0], ft[0]) - 3, hip[1] + 8, 6, 5, dk(bottom, 0.25)); } });
  const [far, nearH] = handsFor(B, pose, F.fr);
  const sleeve = outfit === 'guest' ? 0.35 : outfit === 'barkeep' || outfit === 'pianist' ? 0.6 : 1;
  arm(g, B, -1, far[0], far[1], { sleeve: dk(shirt, 0.12), hand: L.skin, len: sleeve });
  torso(g, B, shirt);
  // ---- what's on the shirt
  if (outfit === 'guest') {
    const print = F.seed % 4;
    if (print === 1) { part(g, () => g.ellipse(1, B.shY + 14, 6, 4, 0, 0, Math.PI * 2), lt(shirt, 0.45), -5, B.shY + 10, 12, 8, 0.6); px(g, -2, B.shY + 13, 6, 2, dk(shirt, 0.5)); }
    else if (print === 2) { for (let k = 0; k < 3; k++) px(g, -6, B.shY + 9 + k * 3, 13, 1, k === 1 ? '#F2C24A' : '#E86A3A'); }
    else if (print === 3) { px(g, -6, B.shY + 10, 12, 2, lt(shirt, 0.6)); px(g, -5, B.shY + 14, 10, 2, lt(shirt, 0.6)); }
    // (a lanyard, a fanny pack)
    if (F.seed % 5 === 1) { px(g, -4, B.shY, 1, 16, '#2A6AC8'); px(g, 3, B.shY, 1, 16, '#2A6AC8'); part(g, () => g.rect(-3, B.shY + 15, 6, 8), '#F4F4F0', -3, B.shY + 15, 6, 8, 0.6); }
    if (F.seed % 4 === 2) { part(g, () => g.roundRect(-B.hipW / 2 + 2, B.hipY - 4, 12, 7, 2), pickOf(F.seed, 6, ['#1C1C24', '#E85AA8', '#2EA86A']), -B.hipW / 2 + 2, B.hipY - 4, 12, 7, 0.8); px(g, -B.hipW / 2, B.hipY - 2, B.hipW, 1, '#1C1C24'); }
  } else if (outfit === 'medic') {
    part(g, () => g.rect(-1, B.shY + 6, 10, 10), '#F8FAFC', -1, B.shY + 6, 10, 10, 0.6); px(g, 3, B.shY + 7, 2, 8, '#D81E1E'); px(g, 0, B.shY + 10, 8, 2, '#D81E1E');
    px(g, -B.hipW / 2, B.hipY - 3, B.hipW, 4, '#1C1C20'); for (const bx of [-B.hipW / 2 + 2, B.hipW / 2 - 6]) part(g, () => g.rect(bx, B.hipY - 2, 5, 6), '#2A2A30', bx, B.hipY - 2, 5, 6, 0.6);
    part(g, () => g.rect(-B.w / 2 + 1, B.shY + 1, 5, 8), '#2A2A30', -B.w / 2 + 1, B.shY + 1, 5, 8, 0.6); px(g, -B.w / 2 + 2, B.shY - 4, 1, 5, '#2A2A30');
  } else if (outfit === 'barkeep') {
    part(g, () => g.rect(-B.w / 2 + 2, B.shY + 2, B.w - 4, B.hipY - B.shY - 2), '#5A1E1E', -B.w / 2 + 2, B.shY + 2, B.w - 4, B.hipY - B.shY - 2, 0.8);
    for (let x = -B.w / 2 + 4; x < B.w / 2 - 2; x += 3) px(g, x, B.shY + 3, 1, B.hipY - B.shY - 4, '#7A2E2E');
    px(g, -2, B.shY + 1, 5, 12, '#F4F0E6');
    part(g, () => { g.moveTo(-5, B.shY + 1); g.lineTo(0, B.shY + 3); g.lineTo(5, B.shY + 1); g.lineTo(5, B.shY + 5); g.lineTo(0, B.shY + 3); g.lineTo(-5, B.shY + 5); g.closePath(); }, '#1C1C20', -5, B.shY + 1, 10, 4, 0.5);
    part(g, () => g.rect(-B.hipW / 2 + 1, B.hipY - 6, B.hipW - 2, 22), '#F4F0E6', -B.hipW / 2 + 1, B.hipY - 6, B.hipW - 2, 22, 0.8);
  } else if (outfit === 'pianist') {
    part(g, () => g.rect(-B.w / 2 + 2, B.shY + 2, B.w - 4, B.hipY - B.shY - 2), '#2E4A3A', -B.w / 2 + 2, B.shY + 2, B.w - 4, B.hipY - B.shY - 2, 0.8);
    for (let y = B.shY + 5; y < B.hipY; y += 4) for (let x = -B.w / 2 + 4 + ((y / 4) % 2) * 2; x < B.w / 2 - 3; x += 4) px(g, x, y, 1, 1, '#C8A040');
    px(g, -2, B.shY + 1, 4, 10, '#E8E0D0'); px(g, -1, B.shY + 2, 2, 8, '#7F1D1D');
  } else if (outfit === 'operator') {
    part(g, () => g.rect(B.w / 2 - 10, B.shY + 6, 7, 4), '#F4F4F0', B.w / 2 - 10, B.shY + 6, 7, 4, 0.5); px(g, B.w / 2 - 9, B.shY + 7, 5, 1, '#2A2A30');
    px(g, -4, B.shY, 1, 16, '#C83A3A'); px(g, 3, B.shY, 1, 16, '#C83A3A');
    for (const sx of [-B.w / 2 + 3, B.w / 2 - 6]) px(g, sx, B.shY + 4, 3, 2, dk(shirt, 0.25));
  }
  // ---- the head
  hairBack(g, B, L.hair, 14);
  headShape(g, B, L.skin);
  const eyes = mood === 'shocked' || mood === 'scared' ? 'wide' : mood === 'angry' ? 'angry' : mood === 'happy' ? 'open' : 'tired';
  const mouth = mood === 'shocked' || mood === 'scared' ? 'o' : mood === 'angry' ? 'teeth' : mood === 'happy' ? 'smile' : 'flat';
  faceOn(g, B, { skin: L.skin, eyes, mouth, md: F.md, blink: F.blink });
  whiskers(g, B); glasses(g, B);
  if (outfit === 'barkeep') { hairTop(g, B); px(g, B.hx - 6, B.hy - 9, 12, 1, lt(L.hair, 0.4)); part(g, () => g.roundRect(B.hx + 1, B.hy + 4, 9, 3, 1), L.woman ? L.skin : L.hair, B.hx + 1, B.hy + 4, 9, 3, 0.6); }
  else if (outfit === 'pianist') {
    partTop(g, () => g.ellipse(B.hx + 1, B.hy - 10, 8, 7, 0, Math.PI, 0), '#1C1C20', B.hx - 7, B.hy - 17, 16, 8, 1);
    part(g, () => g.ellipse(B.hx + 1, B.hy - 10, 11, 2.2, 0, 0, Math.PI * 2), '#1C1C20', B.hx - 10, B.hy - 13, 22, 4, 1);
  } else if (outfit === 'medic' || outfit === 'operator') hairTop(g, B);
  else {
    const hat = F.seed % 5;
    const hc = pickOf(F.seed, 7, HATS);
    if (kid) {
      // (a coonskin cap, its tail down the back)
      partTop(g, () => g.ellipse(B.hx, B.hy - 7, 10, 8, 0, Math.PI, 0), '#7A5230', B.hx - 10, B.hy - 15, 20, 9, 1);
      for (let k = 0; k < 5; k++) px(g, B.hx - 11 - k * 0.5, B.hy - 6 + k * 3, 3, 3, k % 2 ? '#2A1A10' : '#C8A070');
    } else if (hat === 0) {
      // (a straw cowboy hat)
      partTop(g, () => { g.moveTo(B.hx - 7, B.hy - 8); g.quadraticCurveTo(B.hx - 6, B.hy - 21, B.hx + 1, B.hy - 18); g.quadraticCurveTo(B.hx + 8, B.hy - 21, B.hx + 9, B.hy - 8); g.closePath(); }, '#D8B868', B.hx - 7, B.hy - 21, 16, 13, 1);
      part(g, () => g.ellipse(B.hx + 1, B.hy - 8, 15, 3, 0, 0, Math.PI * 2), '#C8A858', B.hx - 14, B.hy - 11, 30, 6, 1);
      px(g, B.hx - 7, B.hy - 11, 16, 2, '#7A3A20');
    } else if (hat === 1) {
      // (a ball cap, the park's logo on it)
      partTop(g, () => g.ellipse(B.hx, B.hy - 7, 9, 7, 0, Math.PI, 0), hc, B.hx - 9, B.hy - 14, 18, 8, 1);
      part(g, () => { g.moveTo(B.hx + 6, B.hy - 8); g.lineTo(B.hx + 16, B.hy - 7); g.lineTo(B.hx + 8, B.hy - 5); g.closePath(); }, dk(hc, 0.2), B.hx + 6, B.hy - 8, 10, 3, 0.8);
      px(g, B.hx - 1, B.hy - 12, 3, 3, '#F2C24A');
      if (L.long || L.woman) hairTop(g, B);
    } else if (hat === 2 && L.woman) {
      // (a sun visor over her hair)
      hairTop(g, B); part(g, () => g.rect(B.hx - 8, B.hy - 10, 16, 3), hc, B.hx - 8, B.hy - 10, 16, 3, 0.8); part(g, () => { g.moveTo(B.hx + 5, B.hy - 8); g.lineTo(B.hx + 15, B.hy - 6); g.lineTo(B.hx + 6, B.hy - 5); g.closePath(); }, hc, B.hx + 5, B.hy - 8, 10, 3, 0.8);
    } else hairTop(g, B);
  }
  arm(g, B, 1, nearH[0], nearH[1], { sleeve: shirt, hand: outfit === 'medic' ? '#8AB8E8' : L.skin, len: sleeve });
  // ---- what's in their hands
  if (pose === 'photo') { part(g, () => g.roundRect(B.hx + 5, B.hy - 6, 6, 10, 1), '#1C1C24', B.hx + 5, B.hy - 6, 6, 10, 0.8); px(g, B.hx + 6, B.hy - 5, 4, 7, '#5A8AC8'); }
  else if (outfit === 'barkeep') { part(g, () => g.rect(nearH[0] - 3, nearH[1] - 9, 7, 9), '#D8E8F0', nearH[0] - 3, nearH[1] - 9, 7, 9, 0.6); px(g, far[0] - 3, far[1] - 2, 7, 6, '#F4F0E6'); }
  else if (outfit === 'guest' && pose === 'stand') {
    const held = F.seed % 7;
    if (held === 1) { part(g, () => g.rect(nearH[0] - 3, nearH[1] - 12, 7, 12), '#C83A3A', nearH[0] - 3, nearH[1] - 12, 7, 12, 0.6); px(g, nearH[0], nearH[1] - 16, 1, 5, '#F4F4F0'); }
    else if (held === 2) { part(g, () => g.rect(nearH[0] - 1, nearH[1] - 18, 4, 18), '#D89A4A', nearH[0] - 1, nearH[1] - 18, 4, 18, 0.6); for (let y = nearH[1] - 16; y < nearH[1]; y += 3) px(g, nearH[0], y, 2, 1, '#A86A2A'); }
    else if (held === 3) { part(g, () => g.rect(nearH[0] - 6, nearH[1] - 10, 12, 8), '#E8DCB0', nearH[0] - 6, nearH[1] - 10, 12, 8, 0.6); px(g, nearH[0] - 4, nearH[1] - 8, 3, 3, '#5A8A4A'); }
  }
  if (outfit === 'operator') part(g, () => g.rect(nearH[0] - 2, nearH[1] - 8, 5, 8), '#2A2A30', nearH[0] - 2, nearH[1] - 8, 5, 8, 0.6);
  void dither; void ball; void INK;
};

const BOX: [number, number, number, number] = [-40, -100, 84, 104];
/** A guest (or one of the park's own), feet at (x, y). */
export const drawGuest = (c: Ctx, x: number, y: number, o: { seed: number; f: number; pose?: GuestPose; mood?: GuestMood; facing?: number; outfit?: GuestOutfit; scale?: number; woman?: boolean }) => {
  const pose = o.pose ?? 'stand', mood = o.mood ?? 'bored', outfit = o.outfit ?? 'guest', s = o.scale ?? 1;
  // (cheering, waving, sitting: their own two-frame beat)
  const beat = pose === 'cheer' || pose === 'wave' ? Math.floor((o.f + o.seed * 3) / 10) % 2 : pose === 'sit' ? Math.floor(o.f / 7) % 2 : null;
  const F = frameOf(o.seed, o.f, pose === 'walk' ? 'walk' : 'stand', 'ok', 0, o.woman, `${pose}-${mood}-${outfit}`);
  if (beat !== null) F.fr = beat;
  if (pose !== 'walk' && pose !== 'stand' && beat === null) F.fr = 0;
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale((o.facing ?? 1) < 0 ? -s : s, s);
  putFrame(c, 'ft-guest', F, BOX, g => paintPerson(g, F, pose, mood, outfit));
  c.restore();
};
