// The people backstage and round about (the dino park's maintenance man, the temple's stagehands and cast, the ride
// operators, the guests in the cart and in line): one drawer, dressed by job, a different person by seed (men and
// women, every skin, thin and heavy, hair of every sort). Built from the cast kit (cast/kit.ts): feet at the origin,
// facing right (the caller mirrors). First pass: plain, but every one of them a person.

import { type Ctx, INK, dk, lt, blob, rect, dot, torso, arm, head, eyes, mouth, nose, specs } from '../../cast/kit';

const SKINS = ['#F6DCC8', '#F0C8A2', '#D9A877', '#A86B43', '#6E4426', '#F4C2B0', '#8D5A3B'];
const HAIR = ['#1F1611', '#4A2E1A', '#A16207', '#D6D3D1', '#7F1D1D', '#111827', '#F5D27A'];
const SHIRTS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#A855F7', '#EC4899', '#F8FAFC', '#14B8A6'];
const PANTS = ['#1E3A8A', '#57534E', '#A8A29E', '#0F172A', '#78350F'];

export type Outfit = 'stage' | 'warrior' | 'guest' | 'maint' | 'operator' | 'guide';
export type Pose = 'stand' | 'walk' | 'sit' | 'fly' | 'crank' | 'thrust';

export interface Look { woman: boolean; skin: string; hair: string; heavy: boolean; face: number; bald: boolean; long: boolean; shirt: string; pants: string; kid: boolean }
/** Who this one is, from the seed: the same every time. (`woman` forces it either way.) */
export const lookOf = (seed: number, woman?: boolean): Look => {
  const s = Math.abs(Math.round(seed));
  const w = woman ?? Math.floor(s / 4) % 5 < 2;
  return {
    woman: w,
    skin: SKINS[s % SKINS.length],
    hair: HAIR[Math.floor(s / 7) % HAIR.length],
    heavy: s % 3 === 0,
    face: Math.floor(s / 3) % 4, // 0 plain, 1 mustache, 2 beard, 3 glasses
    bald: !w && Math.floor(s / 11) % 5 === 0,
    long: w ? Math.floor(s / 13) % 3 !== 0 : Math.floor(s / 13) % 7 === 0,
    shirt: SHIRTS[Math.floor(s / 5) % SHIRTS.length],
    pants: PANTS[Math.floor(s / 9) % PANTS.length],
    kid: false,
  };
};

export interface PersonOpts {
  seed: number; outfit: Outfit; f: number;
  pose?: Pose; woman?: boolean; talking?: boolean;
  /** The state of them: their eyes and mouth. */
  mood?: 'bored' | 'angry' | 'scared' | 'happy' | 'shocked';
}

/** One of them, standing (or sat, or flying through the air) at the origin, facing right. */
export const drawPerson = (c: Ctx, o: PersonOpts) => {
  const L = lookOf(o.seed, o.woman);
  const f = o.f, pose = o.pose ?? 'stand';
  const sit = pose === 'sit';
  const stride = pose === 'walk' ? Math.sin(f * 0.25 + o.seed) * 4 : pose === 'fly' ? 6 : 0;
  // The outfit's colors
  const top = o.outfit === 'stage' ? '#18181B' : o.outfit === 'warrior' ? L.skin : o.outfit === 'maint' ? '#475569' : o.outfit === 'operator' ? '#B45309' : o.outfit === 'guide' ? '#A39264' : L.shirt;
  const bottom = o.outfit === 'stage' ? '#27272A' : o.outfit === 'warrior' ? '#B45309' : o.outfit === 'maint' ? '#475569' : o.outfit === 'operator' ? '#D6C7A1' : o.outfit === 'guide' ? '#7C6A44' : L.pants;
  const w = L.heavy ? 28 : L.woman ? 20 : 23, hipW = L.heavy ? 26 : 20;
  c.save();
  if (sit) c.translate(0, 18);
  // Legs (sat: out in front)
  for (const s of [-1, 1]) {
    if (sit) {
      rect(c, -4, -34 + (s < 0 ? 0 : 1), 22, 7, s < 0 ? dk(bottom, 0.15) : bottom, 1.5);
      rect(c, 14, -30, 7, 24, s < 0 ? dk(bottom, 0.15) : bottom, 1.5);
      blob(c, () => c.roundRect(14, -7, 11, 5, [2, 3, 1, 1]), '#27272A', 14, 25);
      continue;
    }
    const x = s * 4.5 + s * stride * 0.5 - 3.5;
    const legCol = o.outfit === 'warrior' ? L.skin : s < 0 ? dk(bottom, 0.15) : bottom;
    rect(c, x, -30, 7, 27, legCol, 1.5);
    blob(c, () => c.roundRect(x - 1 + (s > 0 ? 1 : 0), -4.5, 10, 5, [2, 3, 1, 1]), o.outfit === 'warrior' ? '#92400E' : '#27272A', x - 1, x + 9);
  }
  // Far arm, body
  const farHand = pose === 'crank' ? [w / 2 + 6, -40 + Math.sin(f * 0.2) * 6] : pose === 'fly' ? [-w / 2 - 10, -66] : sit ? [w / 2 + 2, -40] : [-w / 2, -32];
  arm(c, -w / 2 + 3, -52, farHand[0], farHand[1], top, L.skin, o.outfit === 'warrior' ? 0 : 0.5, 6);
  torso(c, -30, -56, w, hipW + (L.heavy ? 4 : 0), top);
  if (o.outfit === 'warrior') {
    // (the costume: a loincloth, a jade collar)
    rect(c, -hipW / 2 - 1, -32, hipW + 2, 12, '#B45309', 1);
    dot(c, -3, -24, 6, 8, '#92400E');
    blob(c, () => c.ellipse(1, -54, 10, 4, 0, 0, Math.PI * 2), '#10B981', -9, 11, 1);
  }
  if (o.outfit === 'maint') { dot(c, 2, -50, 7, 5, '#F8FAFC'); dot(c, 3, -49, 5, 1, '#1E3A8A'); }
  if (o.outfit === 'operator') { rect(c, -w / 2 + 2, -56, w - 4, 26, '#15803D', 2); dot(c, 3, -48, 5, 6, '#FACC15'); }
  if (o.outfit === 'guest') dot(c, -w / 2 + 3, -48, w - 6, 2, lt(top, 0.3));
  // Head
  const hy = -66;
  if ((L.long || L.woman) && !L.bald && o.outfit !== 'warrior') blob(c, () => { c.moveTo(-6, hy - 4); c.quadraticCurveTo(-15, hy + 2, -11, hy + (L.long ? 16 : 10)); c.quadraticCurveTo(-8, hy + 5, -4, hy); c.closePath(); }, L.hair, -15, -4);
  head(c, 1, hy, 8.5, 9.5, L.skin);
  if (!L.bald) blob(c, () => { c.moveTo(-8, hy - 1); c.quadraticCurveTo(-7, hy - 12, 2, hy - 11); c.quadraticCurveTo(9, hy - 11, 9.5, hy - 5); c.lineTo(4, hy - 6); c.quadraticCurveTo(-2, hy - 6, -5, hy + 1); c.closePath(); }, L.hair, -8, 9.5, 1);
  const mood = o.mood ?? 'bored';
  eyes(c, 2.5, hy - 1, 3.6, mood === 'bored' ? 'tired' : mood === 'angry' ? 'angry' : mood === 'scared' || mood === 'shocked' ? 'wide' : 'open', f, 0.6, 2.2, dk(L.skin, 0.1));
  if (L.face === 3) specs(c, 2.5, hy - 1, 3.6, 2.8, '#18181B', 'square');
  nose(c, 6, hy + 2.5, 2.2, L.skin);
  if (!L.woman && L.face === 1) blob(c, () => c.roundRect(2, hy + 4.4, 8, 2.4, 1), L.hair, 2, 10, 1);
  if (!L.woman && L.face === 2) blob(c, () => { c.moveTo(-5, hy + 2); c.quadraticCurveTo(2, hy + 14, 9, hy + 3); c.lineTo(8, hy + 6); c.quadraticCurveTo(2, hy + 10, -3, hy + 5); c.closePath(); }, L.hair, -5, 9, 1);
  mouth(c, 4, hy + 6.5, 5, o.talking ? 'talk' : mood === 'angry' ? 'frown' : mood === 'scared' || mood === 'shocked' ? 'o' : mood === 'happy' ? 'smile' : 'flat', f);
  // Headgear: the stagehand's headset, the warrior's feathers, the operator's visor, the maintenance cap
  if (o.outfit === 'stage') { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(1, hy - 2, 10, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); dot(c, -9, hy - 3, 4, 6, '#3F3F46'); c.strokeStyle = '#3F3F46'; c.lineWidth = 1; c.beginPath(); c.moveTo(-7, hy + 2); c.quadraticCurveTo(-2, hy + 9, 4, hy + 8); c.stroke(); }
  if (o.outfit === 'warrior') {
    rect(c, -8, hy - 10, 18, 4, '#FACC15', 1);
    for (let i = 0; i < 5; i++) { const a = -0.9 + i * 0.45; blob(c, () => c.ellipse(1 + Math.sin(a) * 12, hy - 14 - Math.cos(a) * 8, 2.5, 7, a, 0, Math.PI * 2), ['#10B981', '#EF4444', '#3B82F6', '#EF4444', '#10B981'][i], -14, 14, 1); }
  }
  if (o.outfit === 'operator') blob(c, () => { c.moveTo(-8, hy - 6); c.lineTo(9, hy - 6); c.lineTo(15, hy - 4); c.lineTo(-8, hy - 3); c.closePath(); }, '#15803D', -8, 15, 1);
  if (o.outfit === 'maint') blob(c, () => { c.moveTo(-8, hy - 4); c.quadraticCurveTo(-7, hy - 13, 1, hy - 13); c.quadraticCurveTo(9, hy - 13, 9.5, hy - 4); c.lineTo(15, hy - 4); c.lineTo(15, hy - 2); c.lineTo(-8, hy - 2); c.closePath(); }, '#1E3A8A', -8, 15);
  if (o.outfit === 'guide') {
    // A pith helmet with spikes welded on top (big, steel, catching the light: you can see them coming)
    for (const [sx, sh] of [[-6, 11], [1, 15], [8, 11]] as const) blob(c, () => { c.moveTo(sx - 3, hy - 10); c.lineTo(sx, hy - 10 - sh); c.lineTo(sx + 3, hy - 10); c.closePath(); }, '#CBD5E1', sx - 3, sx + 3, 1);
    for (const [sx, sh] of [[-6, 11], [1, 15], [8, 11]] as const) dot(c, sx - 1, hy - 8 - sh, 1, sh - 4, '#F8FAFC');
    blob(c, () => { c.moveTo(-11, hy - 2); c.quadraticCurveTo(-10, hy - 15, 1, hy - 15); c.quadraticCurveTo(12, hy - 15, 13, hy - 2); c.closePath(); }, '#E7DDBE', -11, 13);
    rect(c, -13, hy - 3, 28, 3, '#D6C7A1', 1); rect(c, -10, hy - 6, 22, 2, '#7C2D12', 0);
  }
  // Near arm
  const hand = pose === 'crank' ? [w / 2 + 10, -42 - Math.sin(f * 0.2) * 6] : pose === 'thrust' ? [w / 2 + 16, -48] : pose === 'fly' ? [w / 2 + 10, -70] : sit ? [w / 2 + 6, -44] : [w / 2, -32];
  arm(c, w / 2 - 3, -52, hand[0], hand[1], top, L.skin, o.outfit === 'warrior' ? 0 : 0.5, 6);
  c.restore();
  return L;
};

/** A warrior's spear (a real one: the props budget went somewhere), held at the hand. */
export const drawSpear = (c: Ctx, x: number, y: number, a: number) => {
  c.save(); c.translate(x, y); c.rotate(a);
  c.fillStyle = INK; c.fillRect(-26, -2, 52, 4);
  c.fillStyle = '#92400E'; c.fillRect(-25, -1, 48, 2);
  c.beginPath(); c.moveTo(22, -5); c.lineTo(36, 0); c.lineTo(22, 5); c.closePath(); c.fillStyle = '#D4D4D8'; c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
  c.restore();
};
