// The riders: everybody who was on the ELEVATOR TO HELL when it came down the shaft, lying where they landed round the
// two wrecks at the bottom of the pit. Theme-park guests (all sorts: men and women, every skin tone, builds, hair) in
// what you wear to a theme park: the ride's I RODE IT! tees, fanny packs, lanyards, the park's devil-horn headbands,
// sunglasses, one still hanging on to a churro, one to a souvenir cup. Nobody died with dignity: half out of a car's
// window, folded over the lap bar, face-down with the butt up, limbs going the wrong way. Bloody (pools, splats, a
// trickle from the mouth), not gross.
//
// Drawn the costume department's way (spooky/costume.ts: the parts in steps, dithered, inked), from a pose given as
// joints; painted once into the pit's stamps (see art.ts). Pulled a little toward the dark: set dressing, still,
// eyes crossed out; nothing about them says get up and come at him, or stand on me.

import { INK, mix, dk, lt, part, partTop, flat, px, dither, limb, ball } from '../costume';

type Ctx = CanvasRenderingContext2D;
type P = [number, number];

/** Set dressing goes a little toward the dark. */
const dim = (c: string) => mix(c, '#2A0C08', 0.14);
export const BLOOD = ['#2E0404', '#5B0A0A', '#7F1111', '#9E1B1B', '#C03030'];

export interface Guest {
  skin: string; hair: string; hairStyle: 'short' | 'long' | 'bun' | 'bald' | 'curly';
  woman: boolean; build: number;
  tee: string; teeText: boolean; pants: string; shorts: boolean; shoe: string;
  fanny?: string; lanyard?: string; horns?: boolean; cap?: string; shades?: boolean;
  holding?: 'churro' | 'cup';
}

// Who they were
export const GUESTS: Guest[] = [
  { skin: '#F1C27D', hair: '#2C1B10', hairStyle: 'short', woman: false, build: 1.15, tee: '#1D4ED8', teeText: true, pants: '#C8B48A', shorts: true, shoe: '#E8E8E8', fanny: '#15803D', horns: true },
  { skin: '#8D5524', hair: '#141010', hairStyle: 'curly', woman: true, build: 1, tee: '#DB2777', teeText: true, pants: '#2B3A67', shorts: false, shoe: '#F4F4F4', lanyard: '#FACC15', shades: true },
  { skin: '#FFDBAC', hair: '#E6C36A', hairStyle: 'long', woman: true, build: 0.9, tee: '#15803D', teeText: true, pants: '#F0E6D2', shorts: true, shoe: '#DB2777', holding: 'cup' },
  { skin: '#5C3A1E', hair: '#18181B', hairStyle: 'bald', woman: false, build: 1.3, tee: '#CA8A04', teeText: true, pants: '#3B4A5A', shorts: false, shoe: '#2A2A2A', cap: '#B91C1C', fanny: '#1E1B4B' },
  { skin: '#C68642', hair: '#7C2D12', hairStyle: 'bun', woman: true, build: 1.1, tee: '#9333EA', teeText: true, pants: '#2B3A67', shorts: true, shoe: '#E8E8E8', horns: true, holding: 'churro' },
  { skin: '#E8B48A', hair: '#A8A29E', hairStyle: 'short', woman: false, build: 1, tee: '#F4F4F4', teeText: true, pants: '#6B7B5A', shorts: true, shoe: '#5A3A22', lanyard: '#2563EB', shades: true, cap: '#1D4ED8' },
];

/** A body by its joints (world or local, any way round). */
export interface Pose {
  head: P; /** which way the face looks: 1 right, -1 left; `down` face-down (back of the head) */ face: 1 | -1; down?: boolean;
  neck: P; hip: P;
  /** far arm then near arm: shoulder, elbow, hand */ arms: [P, P, P][];
  /** far leg then near leg: hip, knee, foot */ legs: [P, P, P][];
}

const S = 0.5; // (a lot of what's drawn is in half-steps)

/** One of them, posed. */
export const corpse = (g: Ctx, G: Guest, J: Pose) => {
  const skin = dim(G.skin), tee = dim(G.tee), pants = dim(G.pants), hair = dim(G.hair), shoe = dim(G.shoe);
  const bw = 7 * G.build;
  // (far side darker)
  const far = (c: string) => dk(c, 0.22);
  const leg = ([h, k, f]: [P, P, P], isFar: boolean) => {
    const pc = isFar ? far(pants) : pants, sk = isFar ? far(skin) : skin;
    limb(g, h[0], h[1], k[0], k[1], bw * 0.95, pc);
    limb(g, k[0], k[1], f[0], f[1], bw * 0.8, G.shorts ? sk : pc);
    if (G.shorts) { g.fillStyle = INK; g.fillRect(Math.round(k[0] - 2), Math.round(k[1] - 2), 4, 4); g.fillStyle = pc; g.fillRect(Math.round(k[0] - 1), Math.round(k[1] - 1), 2, 2); }
    // (the shoe, the way the leg points)
    const a = Math.atan2(f[1] - k[1], f[0] - k[0]);
    g.save(); g.translate(f[0], f[1]); g.rotate(a);
    part(g, () => g.roundRect(-2, -3.5, 10, 7, 2.5), isFar ? far(shoe) : shoe, -2, -3.5, 10, 7, 1);
    px(g, -2, 2, 10, 1, dk(shoe, 0.45));
    g.restore();
  };
  const arm = ([s, e, h]: [P, P, P], isFar: boolean) => {
    const tc = isFar ? far(tee) : tee, sk = isFar ? far(skin) : skin;
    // (a short sleeve, then the bare arm)
    const mx = s[0] + (e[0] - s[0]) * 0.55, my = s[1] + (e[1] - s[1]) * 0.55;
    limb(g, s[0], s[1], e[0], e[1], bw * 0.6, sk);
    limb(g, s[0], s[1], mx, my, bw * 0.78, tc);
    limb(g, e[0], e[1], h[0], h[1], bw * 0.52, sk);
    ball(g, h[0], h[1], 2.6, sk, 1);
  };
  // Far limbs, behind
  leg(J.legs[0], true); arm(J.arms[0], true);
  // The torso: neck to hip, the tee, its print; the shorts/pants seat
  const [nx, ny] = J.neck, [hx, hy] = J.hip, len = Math.hypot(hx - nx, hy - ny), ang = Math.atan2(hy - ny, hx - nx);
  g.save(); g.translate(nx, ny); g.rotate(ang);
  const tw = bw * 1.25 + (G.woman ? 0 : 1);
  part(g, () => g.roundRect(-2, -tw, len * 0.78 + 2, tw * 2, 4), tee, -2, -tw, len * 0.78 + 2, tw * 2, 1.2);
  part(g, () => g.roundRect(len * 0.7, -tw * 0.95, len * 0.36 + 3, tw * 1.9, 4), pants, len * 0.7, -tw * 0.95, len * 0.36 + 3, tw * 1.9, 1.2);
  px(g, len * 0.7, -tw * 0.95, 2, tw * 1.9, dk(pants, 0.35));
  if (G.teeText) {
    // (the ride's tee: I RODE IT! on the chest, a little flame under it)
    g.save(); g.scale(1, J.face < 0 ? -1 : 1);
    px(g, len * 0.18, -3, len * 0.36, 6, dim('#18181B'));
    px(g, len * 0.2, -2, len * 0.32, 1, dim('#FDE68A')); px(g, len * 0.2, 0, len * 0.22, 1, dim('#FDE68A'));
    px(g, len * 0.2 + len * 0.26, 0, 2, 1, dim('#F97316'));
    g.restore();
  }
  // (a fanny pack round the hips, on its strap)
  if (G.fanny) {
    px(g, len * 0.62, -tw, 2, tw * 2, INK);
    part(g, () => g.roundRect(len * 0.56, tw * 0.1, 9, 7, 2), dim(G.fanny!), len * 0.56, tw * 0.1, 9, 7, 1);
    px(g, len * 0.56 + 2, tw * 0.1 + 2, 5, 1, dim('#D4D4D8'));
  }
  // (blood soaked into the tee)
  dither(g, len * 0.1, -tw * 0.6, len * 0.3, tw * 0.9, BLOOD[2]);
  px(g, len * 0.15, -tw * 0.3, len * 0.12, tw * 0.5, BLOOD[3]);
  g.restore();
  // (a lanyard off the neck, the badge)
  if (G.lanyard) {
    const bx = nx + (hx - nx) * 0.35 + 3, by = ny + (hy - ny) * 0.35 + 5;
    g.strokeStyle = dim(G.lanyard); g.lineWidth = 1.2; g.beginPath(); g.moveTo(nx, ny); g.quadraticCurveTo(bx - 4, by + 4, bx, by); g.stroke();
    flat(g, () => g.rect(bx - 3, by - 1, 6, 8), dim('#F4F4F4'), 1); px(g, bx - 2, by + 1, 4, 2, dim('#2563EB'));
  }
  // Near limbs
  leg(J.legs[1], false);
  arm(J.arms[1], false);
  // What they're hanging on to still
  const h = J.arms[1][2];
  if (G.holding === 'churro') {
    g.save(); g.translate(h[0], h[1]); g.rotate(-0.6);
    part(g, () => g.roundRect(-2, -3, 22, 5, 2), dim('#C98A3A'), -2, -3, 22, 5, 1);
    for (let i = 0; i < 5; i++) px(g, 1 + i * 4, -2, 1, 3, dim('#8A5A20'));
    for (let i = 0; i < 6; i++) px(g, i * 3.4, -3, 1, 1, '#FFFFFF');
    g.restore();
  } else if (G.holding === 'cup') {
    // (the souvenir cup, on its side, spilled; its lid off; the straw)
    g.save(); g.translate(h[0] + 4, h[1]); g.rotate(1.3);
    part(g, () => { g.moveTo(-5, -7); g.lineTo(5, -7); g.lineTo(4, 7); g.lineTo(-4, 7); g.closePath(); }, dim('#E11D48'), -5, -7, 10, 14, 1);
    px(g, -4, -2, 8, 3, dim('#F4F4F4')); px(g, -2, -1, 4, 1, dim('#18181B'));
    g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(1, -7); g.lineTo(3, -15); g.stroke();
    g.restore();
    px(g, h[0] + 10, h[1] + 4, 14, 2, dim('#7A2E8A')); px(g, h[0] + 16, h[1] + 4, 6, 1, dim('#B85ACB'));
  }
  // The head
  head(g, G, J, skin, hair);
};

const head = (g: Ctx, G: Guest, J: Pose, skin: string, hair: string) => {
  const [x, y] = J.head, s = J.face, r = 7.5;
  // (the back of the hair, long)
  if (G.hairStyle === 'long') flat(g, () => g.ellipse(x - s * 4, y + 3, 7, 9, s * 0.4, 0, Math.PI * 2), hair, 1);
  if (G.hairStyle === 'bun') ball(g, x - s * 8, y - 4, 3.6, hair, 1);
  // (the ear, the head)
  part(g, () => g.ellipse(x, y, r, r * 1.05, 0, 0, Math.PI * 2), skin, x - r, y - r, r * 2, r * 2.1, 1.2);
  if (J.down) {
    // (face down: the back of the head, all hair; an ear)
    if (G.hairStyle !== 'bald') partTop(g, () => g.ellipse(x, y - 1, r, r * 0.95, 0, 0, Math.PI * 2), hair, x - r, y - r, r * 2, r * 2, 1.2);
    ball(g, x - s * 1, y + 2, 2.2, dk(skin, 0.1), 0.8);
  } else {
    // (the hair over the top, toward the back)
    if (G.hairStyle === 'curly') for (let i = 0; i < 6; i++) ball(g, x - s * 3 + Math.cos(-2.6 + i * 0.55) * r * 0.85, y + Math.sin(-2.6 + i * 0.55) * r * 0.85, 2.6, hair, 0.8);
    else if (G.hairStyle !== 'bald') flat(g, () => { g.ellipse(x - s * 1.5, y - 2.5, r + 0.5, r * 0.62, 0, Math.PI, 0); g.lineTo(x - s * (r + 1), y + 2); }, hair, 1);
    px(g, x - s * 5, y - 1, 2, 3, dk(skin, 0.25));
    // (dead: eyes crossed out, tongue out, the mouth bleeding)
    for (const ex of [x + s * 1.5, x + s * 5]) {
      g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(ex - 1.4, y - 2.4); g.lineTo(ex + 1.4, y + 0.4); g.moveTo(ex + 1.4, y - 2.4); g.lineTo(ex - 1.4, y + 0.4); g.stroke();
    }
    if (G.shades) {
      // (the sunglasses knocked crooked)
      g.save(); g.translate(x + s * 3.5, y - 3); g.rotate(s * 0.35);
      flat(g, () => g.rect(-5, -1.5, 4, 3), '#141418', 0.8); flat(g, () => g.rect(1, -1.5, 4, 3), '#141418', 0.8);
      px(g, -4, -1, 1, 1, '#9AA4B8');
      g.restore();
    }
    flat(g, () => g.ellipse(x + s * 3.5, y + 3.5, 2.2, 1.6, 0, 0, Math.PI * 2), '#3A0808', 0.8);
    flat(g, () => g.ellipse(x + s * 4.5, y + 5.5, 1.4, 2.2, 0.3, 0, Math.PI * 2), '#E87A90', 0.6);
    px(g, x + s * 6, y + 4, 1, 5, BLOOD[3]); px(g, x + s * 6, y + 9, 2, 1, BLOOD[2]);
  }
  // (the park's souvenir devil-horn headband, or a cap)
  if (G.horns) {
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r + 0.5, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    for (const k of [-1, 1]) flat(g, () => { g.moveTo(x + k * 3 - 2, y - r + 1); g.lineTo(x + k * 5, y - r - 6); g.lineTo(x + k * 3 + 2, y - r + 1); g.closePath(); }, dim('#DC2626'), 1);
  } else if (G.cap) {
    partTop(g, () => g.ellipse(x - s * 0.5, y - 3, r + 0.5, r * 0.6, 0, Math.PI, 0), dim(G.cap!), x - r, y - r, r * 2, r * 0.6, 1);
    flat(g, () => g.rect(x + (s > 0 ? 3 : -11), y - 4, 8, 2), dk(dim(G.cap!), 0.2), 0.8);
  }
};

/** Blood on the floor (flat to it, in bands, a few splats off it) at x, `w` either way, the floor's top at y. */
export const bloodPool = (g: Ctx, x: number, w: number, y: number) => {
  g.fillStyle = BLOOD[0]; g.beginPath(); g.ellipse(x, y + 1, w + 1, 3.5, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = BLOOD[1]; g.beginPath(); g.ellipse(x, y + 1, w, 3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = BLOOD[2]; g.beginPath(); g.ellipse(x - w * 0.15, y, w * 0.6, 1.6, 0, 0, Math.PI * 2); g.fill();
  px(g, x - w * 0.4, y - 1, w * 0.3, 1, BLOOD[4]);
  for (let k = 0; k < 5; k++) { const sx = x - w * 1.2 + ((k * 37 + w) % (w * 2.4)); px(g, sx, y - 1 - (k % 2), 3 + (k % 3), 2, BLOOD[2]); px(g, sx + 1, y - 1 - (k % 2), 1, 1, BLOOD[4]); }
};
/** A splat up a wall (a burst, its drips). */
export const splat = (g: Ctx, x: number, y: number, s: number) => {
  flat(g, () => { for (let i = 0; i < 10; i++) { const a = i * 0.63, r = (i % 2 ? 0.55 : 1) * s; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8); } g.closePath(); }, BLOOD[2], 0);
  px(g, x - s * 0.3, y - s * 0.3, s * 0.4, s * 0.25, BLOOD[3]);
  for (let i = 0; i < 3; i++) px(g, x - s * 0.4 + i * s * 0.4, y + s * 0.5, 2, s * (0.6 + (i % 2) * 0.7), BLOOD[1]);
};

void S; void lt;
