// XENOSCARE's cheap animatronic greens (the final pass): the stereotype, in molded rubber and a silver jumpsuit. A huge
// bald head (stepped from its lit crown to the shade under its jaw), enormous glossy black eyes, antennae on springs, a
// skinny body in a lamé jumpsuit (a zipper, a pink belt), rubber arms, a toy ray gun in red plastic; on a chrome rod. The
// cheap showing: the mask's seam at its neck, gaffer tape on it, a scuffed nose. Drawn live (they move, rotate, lunge).

import { INK, ink, limb } from '../../../m1/game/render/npc/kit';
import { box } from '../section';

type Ctx = CanvasRenderingContext2D;

/** Its rubber, darkest first. */
const SKIN = ['#0E3B1C', '#166534', '#16A34A', '#22C55E', '#4ADE80', '#86EFAC', '#D1FADF'];
/** Its lamé. */
const LAME = ['#3F3F46', '#52525B', '#71717A', '#A1A1AA', '#D4D4D8', '#F4F4F5'];

/** A rubber limb: inked, its shade down the underside, a highlight along the top. */
const tube = (c: Ctx, x1: number, y1: number, x2: number, y2: number, w: number) => {
  limb(c, x1, y1, x2, y2, w, SKIN[3]);
  c.lineCap = 'round';
  c.strokeStyle = SKIN[2]; c.lineWidth = w * 0.45; c.beginPath(); c.moveTo(x1 + w * 0.2, y1 + w * 0.2); c.lineTo(x2 + w * 0.2, y2 + w * 0.2); c.stroke();
  c.strokeStyle = SKIN[5]; c.lineWidth = Math.max(1, w * 0.25); c.beginPath(); c.moveTo(x1 - w * 0.2, y1 - w * 0.2); c.lineTo(x2 - w * 0.2, y2 - w * 0.2); c.stroke();
  c.lineCap = 'butt';
};
/** A mitt of a hand (three fat fingers). */
const mitt = (c: Ctx, x: number, y: number) => {
  ink(c, () => c.arc(x, y, 4, 0, Math.PI * 2), SKIN[3]);
  box(c, x - 2, y - 2, 2, 2, SKIN[5]);
};

/**
 * One of the cheap animatronic greens. Its feet at (x, y). `pose`: waving its gun; BOO (arms up, jaw dropped); CLAW
 * (taken over: arms out, claws hooked, jaw working); LIMP (let go: arms down, head lolled). `look.eyes`: its eyes lit
 * that color (taken over); `look.jerk`: the puppet's jerk (radians). World.
 */
export const drawCheapGreen = (c: Ctx, x: number, y: number, f: number, s = 1, pose: 'wave' | 'boo' | 'claw' | 'limp' = 'wave', look: { eyes?: string; jerk?: number } = {}) => {
  c.save(); c.translate(x, y); c.scale(s, s);
  const wob = Math.sin(f * 0.3) * (pose === 'boo' ? 0.12 : pose === 'limp' ? 0 : 0.05) + (look.jerk ?? 0);
  c.rotate(wob);
  // (its rod, chrome, and the plate it's bolted to)
  box(c, -4, -21, 8, 21, INK); box(c, -3, -20, 6, 20, LAME[2]); box(c, -3, -20, 2, 20, LAME[5]); box(c, 2, -20, 1, 20, LAME[0]);
  box(c, -10, -23, 20, 4, INK); box(c, -9, -22, 18, 2, LAME[3]);
  // (the scare poses (BOO, CLAW): elbows out, hands up beside the head, clear of its silhouette and its face, drawn
  // over it after; the others: the back arm first)
  const scare = pose === 'boo' || pose === 'claw';
  const arms = (): [number, number, number, number][] => {
    if (pose === 'boo') { const a = Math.sin(f * 0.6) * 3; return [[-10, -64, -46, -108 + a], [10, -64, 46, -108 - a]]; }
    if (pose === 'claw') { const a = Math.sin(f * 0.5) * 6; return [[-10, -64, -50, -88 + a], [10, -64, 50, -90 - a]]; }
    if (pose === 'limp') return [[-10, -64, -14, -36], [10, -64, 16, -34]];
    const a = Math.sin(f * 0.15) * 10; return [[-10, -64, -22, -40], [10, -64, 30, -78 + a]];
  };
  const [back, front] = arms();
  /** A scare arm: out to its elbow (low, wide, under the jaw's line), up to its hand; claws hooked out from it. */
  const scareArm = (a: [number, number, number, number]) => {
    const sx = Math.sign(a[2]), ex = sx * 34, ey = -64;
    tube(c, a[0], a[1], ex, ey, 5); tube(c, ex, ey, a[2], a[3], 5);
    for (let k = 0; k < 3; k++) limb(c, a[2], a[3], a[2] + sx * (5 + k * 2), a[3] - 9 + k * 3, 2, '#18181B');
    mitt(c, a[2], a[3]);
  };
  if (!scare) { tube(c, back[0], back[1], back[2], back[3], 5); mitt(c, back[2], back[3]); }
  // (the jumpsuit: lamé in steps, lit down its left, a zipper, a pink belt, a collar ring)
  ink(c, () => c.roundRect(-12, -70, 24, 50, 6), LAME[3], 1.5);
  c.save(); c.beginPath(); c.roundRect(-12, -70, 24, 50, 6); c.clip();
  box(c, -12, -70, 7, 50, LAME[4]); box(c, -12, -70, 3, 50, LAME[5]); box(c, 5, -70, 7, 50, LAME[2]); box(c, 9, -70, 3, 50, LAME[1]);
  for (let k = -66; k < -22; k += 4) box(c, -1, k, 2, 2, k % 8 ? LAME[1] : LAME[5]);
  box(c, -12, -46, 24, 4, '#BE185D'); box(c, -12, -46, 24, 1, '#F472B6'); box(c, -3, -46, 6, 4, '#FDE047'); box(c, -2, -45, 2, 1, '#FFFFFF');
  box(c, -12, -24, 24, 4, LAME[1]);
  c.restore();
  box(c, -9, -72, 18, 4, INK); box(c, -8, -71, 16, 2, LAME[4]);
  // (the front arm, its hand, the toy ray gun when it's waving)
  if (!scare) { tube(c, front[0], front[1], front[2], front[3], 5); mitt(c, front[2], front[3]); }
  if (pose === 'wave') {
    const gx = front[2], gy = front[3];
    box(c, gx - 5, gy - 9, 18, 9, INK); box(c, gx - 4, gy - 8, 16, 7, '#DC2626'); box(c, gx - 4, gy - 8, 16, 2, '#F87171'); box(c, gx - 4, gy - 3, 16, 2, '#991B1B');
    box(c, gx + 11, gy - 7, 5, 5, INK); box(c, gx + 12, gy - 6, 3, 3, '#FDE047'); box(c, gx + 12, gy - 6, 1, 1, '#FFFFFF');
    box(c, gx - 2, gy - 1, 4, 6, INK); box(c, gx - 1, gy, 2, 4, '#B91C1C');
  }
  // (the head: lolled when it's let go)
  c.save(); if (pose === 'limp') { c.translate(0, -84); c.rotate(0.5); c.translate(0, 84); }
  // (the mask's seam at the neck, gaffer-taped)
  box(c, -8, -80, 16, 8, INK); box(c, -7, -79, 14, 6, SKIN[2]); box(c, -7, -77, 14, 2, '#A1A1AA'); box(c, -7, -77, 14, 1, '#D4D4D8');
  // (the head: a huge egg, stepped from its lit crown to the shade under the jaw)
  c.fillStyle = INK; c.beginPath(); c.ellipse(0, -100, 29.5, 33.5, 0, 0, Math.PI * 2); c.fill();
  c.save(); c.beginPath(); c.ellipse(0, -100, 28, 32, 0, 0, Math.PI * 2); c.clip();
  c.fillStyle = SKIN[2]; c.fillRect(-30, -134, 60, 68);
  c.fillStyle = SKIN[3]; c.beginPath(); c.ellipse(-3, -104, 27, 30, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = SKIN[4]; c.beginPath(); c.ellipse(-6, -110, 22, 22, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = SKIN[5]; c.beginPath(); c.ellipse(-10, -118, 11, 9, -0.3, 0, Math.PI * 2); c.fill();
  box(c, -14, -124, 5, 3, SKIN[6]);
  // (dithered seams between the steps, the jaw's shade)
  for (let k = -26; k < 26; k += 2) { box(c, k, -78 - ((k / 2) % 2 ? 0 : 1), 1, 1, SKIN[1]); }
  box(c, -28, -76, 56, 8, SKIN[1]);
  c.restore();
  // (the eyes: huge, almond, glossy black; or lit, taken over)
  for (const sx of [-1, 1]) {
    c.save(); c.translate(sx * 12, -100); c.rotate(sx * 0.5);
    c.fillStyle = INK; c.beginPath(); c.ellipse(0, 0, 12, 7, 0, 0, Math.PI * 2); c.fill();
    if (look.eyes) {
      c.fillStyle = look.eyes; c.beginPath(); c.ellipse(0, 0, 10.5, 5.5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#F7FEE7'; c.beginPath(); c.ellipse(0, 0, 6, 2.5, 0, 0, Math.PI * 2); c.fill();
    } else {
      c.fillStyle = '#0A0A0A'; c.beginPath(); c.ellipse(0, 0, 10.5, 5.5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#27272A'; c.beginPath(); c.ellipse(1, 2, 7, 2.5, 0, 0, Math.PI * 2); c.fill();
      box(c, -6, -3, 4, 2, '#FFFFFF'); box(c, 3, 1, 2, 1, '#A1A1AA');
    }
    c.restore();
  }
  // (the nose holes, the mouth: a slit, or dropped open)
  box(c, -3, -90, 1, 2, SKIN[0]); box(c, 2, -90, 1, 2, SKIN[0]);
  if (pose === 'boo' || pose === 'claw') {
    const h = 10 + (f % 8 < 4 ? 4 : 0);
    box(c, -10, -85, 20, h + 2, INK); box(c, -9, -84, 18, h, '#1C0610'); box(c, -7, -82, 14, 2, pose === 'claw' ? '#84FF50' : '#F87171');
    for (let k = -8; k < 8; k += 4) box(c, k, -84, 2, 2, '#F4F4F5');
  } else { box(c, -6, -83, 12, 2, SKIN[0]); box(c, -6, -81, 12, 1, SKIN[4]); }
  // (the antennae on their springs, the balls on top: lit with its eyes when it's taken over)
  for (const sx of [-1, 1]) {
    const tip = sx * (14 + Math.sin(f * 0.5 + sx) * (pose === 'limp' ? 1 : 6));
    for (let k = 0; k <= 8; k++) { const u = k / 8, ax = sx * 8 + (tip - sx * 8) * u, ay = -128 - 22 * u; box(c, Math.round(ax) - 2 + (k % 2) * 2, Math.round(ay) - 1, 3, 2, k % 2 ? SKIN[1] : SKIN[4]); }
    c.fillStyle = INK; c.beginPath(); c.arc(tip, -152, 5, 0, Math.PI * 2); c.fill();
    c.fillStyle = look.eyes ?? '#EAB308'; c.beginPath(); c.arc(tip, -152, 4, 0, Math.PI * 2); c.fill();
    c.fillStyle = look.eyes ? '#F7FEE7' : '#FEF08A'; c.beginPath(); c.arc(tip - 1, -153, 2, 0, Math.PI * 2); c.fill();
  }
  c.restore();
  // (the scare arms, over everything: out wide, never across the face)
  if (scare) { scareArm(back); scareArm(front); }
  // (let go: smoking, a spark now and then)
  if (pose === 'limp' && f % 30 < 3) { box(c, 6, -120, 3, 3, '#FDE047'); box(c, -10, -60, 3, 3, '#FFFFFF'); }
  c.restore();
};
