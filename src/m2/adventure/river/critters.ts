// The river's wildlife, drawn (final pass): the piranha, the electric eel, the snapping plant. Each in Meathead 1's
// critter style taken further: an ink line round every part, each material in a four-step ramp (its shadow, its
// shade, itself, lit) with a highlight, stepped (no smooth gradients). Each pose is a set of frames (swim, the burst,
// the leap, the wind-up, the bite, hurt, dead), squashed and stretched into the move, every frame painted once into a
// stamp and put down after that with one drawImage. Only the eel's sparks and the snapper's stalk are drawn live.
// (Origin at the enemy's feet, facing right, as the kind drawers are called.)

import type { Enemy } from '../../../m1/types';
import { stamp } from '../../../m1/game/render/stamp';
import { mix } from '../../../m1/game/render/backdrops/core';
import { SECTIONS } from '../geometry';
import { EELS, eelMouth, EEL_HOLE } from './course';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';
const dark = (c: string, k = 0.28) => mix(c, INK, k);
const lite = (c: string, k = 0.25) => mix(c, '#FFFFFF', k);
/** Four steps of a color: shadow, shade, itself, lit; and its highlight. */
const ramp4 = (c: string) => [dark(c, 0.45), dark(c, 0.22), c, lite(c, 0.28), lite(c, 0.6)];
/** Washed toward white (the frame of a hit). */
const flash = (r: string[], k: number) => (k ? r.map(c => mix(c, '#FFF6F0', k)) : r);

/**
 * A part: clipped to its shape, its color in steps over its box (lit along the top and the left, shaded down the
 * right and along the bottom, a highlight line along the top), then its ink line.
 */
const part = (c: Ctx, path: (c: Ctx) => void, r: string[], x: number, y: number, w: number, h: number, line = 1) => {
  c.save(); c.beginPath(); path(c); c.clip();
  c.fillStyle = r[2]; c.fillRect(x, y, w, h);
  c.fillStyle = r[3]; c.fillRect(x, y, w, h * 0.3); c.fillRect(x, y, w * 0.22, h);
  c.fillStyle = r[1]; c.fillRect(x + w * 0.76, y, w * 0.24, h); c.fillRect(x, y + h * 0.7, w, h * 0.3);
  c.fillStyle = r[0]; c.fillRect(x, y + h * 0.88, w, h * 0.12);
  c.fillStyle = r[4]; c.fillRect(x + w * 0.2, y + h * 0.1, w * 0.4, Math.max(0.8, h * 0.06));
  c.restore();
  c.beginPath(); path(c); c.strokeStyle = INK; c.lineWidth = line; c.lineJoin = 'round'; c.stroke();
};
const inked = (c: Ctx, path: (c: Ctx) => void, fill: string, line = 0.8) => { c.beginPath(); path(c); c.fillStyle = fill; c.fill(); c.strokeStyle = INK; c.lineWidth = line; c.lineJoin = 'round'; c.stroke(); };
const fang = (c: Ctx, x: number, y: number, w: number, h: number, col = '#F8FAFC') => inked(c, g => { g.moveTo(x, y); g.lineTo(x + w / 2, y + h); g.lineTo(x + w, y); g.closePath(); }, col, 0.5);
const eyeball = (c: Ctx, x: number, y: number, r: number, iris: string, dead = false) => {
  if (dead) { c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(x - r, y - r); c.lineTo(x + r, y + r); c.moveTo(x + r, y - r); c.lineTo(x - r, y + r); c.stroke(); return; }
  inked(c, g => g.arc(x, y, r, 0, Math.PI * 2), iris, 0.7);
  c.fillStyle = INK; c.beginPath(); c.arc(x + r * 0.25, y, r * 0.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#FFFFFF'; c.fillRect(x - r * 0.3, y - r * 0.55, Math.max(1, r * 0.35), Math.max(1, r * 0.35));
};

/** How long ago it was last hurt (frames; big if not lately): its health dropping, seen from here. */
const hurtSeen = new WeakMap<Enemy, { hp: number; at: number }>();
const sinceHurt = (e: Enemy, f: number) => {
  const h = hurtSeen.get(e);
  if (!h) { hurtSeen.set(e, { hp: e.health, at: -999 }); return 999; }
  if (e.health < h.hp) { h.at = f; }
  h.hp = e.health;
  return f - h.at;
};

// ---------------------------------------------------------------------------------------------------------------
// The piranha: a deep, slab-sided body, slate on its back to silver at its sides, the belly blood red; the underbite
// full of teeth, the scowl. Frames: the swim (six beats of the tail), the burst at him (stretched long, jaws wide),
// out of the water (bent, flapping), hurt (squashed, flashed), dead (belly up).

const P_BACK = ramp4('#4A5868'), P_SIDE = ramp4('#8C9AA8'), P_BELLY = ramp4('#C82A26'), P_FIN = ramp4('#5A6470'), P_RED_FIN = ramp4('#A8261E');

type PiranhaPose = 'swim' | 'burst' | 'leap' | 'hurt' | 'dead';
const paintPiranha = (c: Ctx, pose: PiranhaPose, k: number) => {
  const hit = pose === 'hurt' ? 0.55 : 0;
  const back = flash(P_BACK, hit), side = flash(P_SIDE, hit), belly = flash(P_BELLY, hit), fin = flash(P_FIN, hit), rfin = flash(P_RED_FIN, hit);
  const wag = pose === 'dead' ? 0 : Math.sin((k / 6) * Math.PI * 2) * (pose === 'burst' ? 5 : 3.5);
  const gape = pose === 'burst' || pose === 'leap' ? 1 : pose === 'hurt' ? 0.6 : 0.15 + 0.15 * Math.sin((k / 6) * Math.PI * 2);
  // (squash and stretch: long into the burst, short and tall on the hit; bent in the air)
  const sx = pose === 'burst' ? 1.16 : pose === 'hurt' ? 0.86 : 1, sy = pose === 'burst' ? 0.88 : pose === 'hurt' ? 1.14 : 1;
  c.save();
  c.translate(0, -9);
  if (pose === 'dead') c.scale(1, -1);
  if (pose === 'leap') c.rotate(Math.sin((k / 6) * Math.PI * 2) * 0.35);
  c.scale(sx, sy);
  // The tail: forked, its fork swinging
  part(c, g => { g.moveTo(-11, 0); g.lineTo(-20, -8 + wag); g.lineTo(-17, wag * 0.8); g.lineTo(-20, 8 + wag); g.closePath(); }, fin, -20, -8 + wag, 10, 16, 0.8);
  // The dorsal, the anal fin (red), the pectoral (behind: drawn after the body's front half)
  part(c, g => { g.moveTo(-6, -8); g.lineTo(-1, -14 + wag * 0.2); g.lineTo(5, -9); g.closePath(); }, fin, -6, -14, 11, 6, 0.7);
  part(c, g => { g.moveTo(-8, 6); g.lineTo(-4, 11 - wag * 0.2); g.lineTo(1, 7); g.closePath(); }, rfin, -8, 6, 9, 5, 0.7);
  // The body: deep, the head blunt, the jaw jutting
  const body = (g: Ctx) => { g.moveTo(13, -2); g.quadraticCurveTo(12, -9, 3, -10); g.quadraticCurveTo(-8, -10, -12, -2); g.quadraticCurveTo(-11, 7, -2, 8); g.quadraticCurveTo(8, 9, 12, 4 + gape * 2); g.closePath(); };
  c.save(); c.beginPath(); body(c); c.clip();
  c.fillStyle = side[2]; c.fillRect(-14, -12, 30, 22);
  c.fillStyle = back[2]; c.fillRect(-14, -12, 30, 6); c.fillStyle = back[3]; c.fillRect(-14, -12, 30, 2);
  c.fillStyle = side[3]; c.fillRect(-14, -6, 30, 3);
  c.fillStyle = belly[2]; c.beginPath(); c.moveTo(-14, 2); c.lineTo(-6, 1); c.lineTo(2, 2.5); c.lineTo(16, 1); c.lineTo(16, 12); c.lineTo(-14, 12); c.fill();
  c.fillStyle = belly[1]; c.fillRect(-14, 6, 30, 6); c.fillStyle = belly[0]; c.fillRect(-14, 8, 30, 4);
  // (scales: little arcs in rows, darker; a sparkle of silver flecks)
  c.strokeStyle = side[1]; c.lineWidth = 0.6;
  for (let r = 0; r < 3; r++) for (let q = 0; q < 5; q++) { const x = -9 + q * 4 + (r % 2) * 2, y = -5 + r * 3.4; c.beginPath(); c.arc(x, y, 1.8, 0.3, Math.PI - 0.3); c.stroke(); }
  c.fillStyle = side[4]; c.fillRect(-4, -4, 1, 1); c.fillRect(2, -3, 1, 1); c.fillRect(-8, -2, 1, 1);
  c.restore();
  c.beginPath(); body(c); c.strokeStyle = INK; c.lineWidth = 1; c.lineJoin = 'round'; c.stroke();
  // The gill's edge, the pectoral fin
  c.strokeStyle = dark(side[2], 0.4); c.lineWidth = 0.8; c.beginPath(); c.arc(4, -1, 5, -1.1, 1.1); c.stroke();
  part(c, g => { g.moveTo(3, 2); g.lineTo(-3, 5 + wag * 0.3); g.lineTo(-1, 1); g.closePath(); }, rfin, -3, 1, 6, 5, 0.6);
  // The jaw (dropped by the gape), the teeth: the underbite's up over the top lip
  const jy = gape * 3;
  inked(c, g => { g.moveTo(4, 3.5); g.quadraticCurveTo(10, 2.5 + jy * 0.3, 14, 0.8 + jy * 0.5); g.lineTo(13.2, 2.6 + jy); g.quadraticCurveTo(9, 5.2 + jy * 0.8, 4, 5.2); g.closePath(); }, belly[2], 0.8);
  if (gape > 0.3) inked(c, g => { g.moveTo(7, 1.5); g.lineTo(13.4, 0.5); g.lineTo(13, 1 + jy * 0.8); g.lineTo(7, 2 + jy * 0.5); g.closePath(); }, '#4A0A0A', 0.5);
  for (let x = 7; x < 13.5; x += 2) { fang(c, x, 1 + (x - 7) * 0.05 + jy * 0.45, 1.6, -2.2); }
  for (let x = 7.5; x < 13; x += 2.2) fang(c, x, 0.6, 1.4, 1.6);
  // The eye under its scowl
  eyeball(c, 7, -4, 2.2, pose === 'burst' ? '#FF5030' : '#F2C230', pose === 'dead');
  if (pose !== 'dead') { c.fillStyle = INK; c.beginPath(); c.moveTo(4, -7.5); c.lineTo(10.5, -5.5); c.lineTo(10, -4.4); c.lineTo(4.2, -6.2); c.fill(); }
  c.restore();
};

export const drawPiranha = (c: Ctx, e: Enemy, f: number) => {
  const since = sinceHurt(e, f);
  const sp = Math.hypot(e.vel.x, e.vel.y);
  const pose: PiranhaPose = e.health <= 0 ? 'dead' : since < 10 ? 'hurt' : e.aiState === 'leap' ? 'leap' : sp > 3 ? 'burst' : 'swim';
  const rate = pose === 'burst' ? 2 : pose === 'swim' ? 4 + (sp < 1 ? 2 : 0) : 3;
  const k = pose === 'dead' ? 0 : Math.floor((f + (e.homeX ?? 0)) / rate) % 6;
  // (bobbing a pixel on the beat, swimming)
  const bob = pose === 'swim' ? (k < 3 ? 0 : -1) : 0;
  c.save(); c.translate(0, bob);
  stamp(c, `cr-pir-${pose}-${k}`, -28, -28, 52, 36, g => paintPiranha(g, pose, k));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The electric eel: a long olive body (darker on top, the cream belly, the row of pale battery spots down its flank
// that light up when it's charged), the long fin along its underside rippling, the blunt head with its little eyes and
// wide flat mouth. Frames: the wave along it (8), the lunge (straight, jaws open), the zap (coiled, lit, flickering),
// hurt, dead (limp).

const E_SKIN = ramp4('#5E6A2A'), E_BELLY = ramp4('#D8C890'), E_FIN = ramp4('#8A7A3A');
type EelPose = 'wave' | 'lunge' | 'zap' | 'hurt' | 'dead';
const SEG = 14;
const paintEel = (c: Ctx, pose: EelPose, k: number, w: number) => {
  const hit = pose === 'hurt' ? 0.55 : 0, lit = pose === 'zap' && k % 2 === 0;
  const skin = flash(lit ? E_SKIN.map(x => mix(x, '#E8F060', 0.25)) : E_SKIN, hit), belly = flash(E_BELLY, hit), fin = flash(E_FIN, hit);
  const ph = (k / 8) * Math.PI * 2;
  const amp = pose === 'lunge' ? 1.2 : pose === 'zap' ? 6 : pose === 'dead' ? 0 : 3.2;
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= SEG; i++) {
    const t = i / SEG, x = -w / 2 + 4 + (w - 18) * t;
    const y = pose === 'dead' ? (1 - t) * 3 + Math.sin(t * 3) * 1 : Math.sin(t * 5 - ph) * amp * (1 - t * 0.75);
    const r = 2.2 + 4 * Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.62);
    pts.push([x, y, r]);
  }
  c.save(); c.translate(0, -8);
  // (the fin along its underside: a ribbon under the back two thirds, rippling)
  c.beginPath();
  for (let i = 1; i < SEG; i++) { const [x, y, r] = pts[i]; const ry = y + r + 2.5 + Math.sin(i * 1.7 - ph * 2) * 1.2; if (i === 1) c.moveTo(x, y + r - 1); c.lineTo(x, ry); }
  for (let i = SEG - 1; i >= 1; i--) { const [x, y, r] = pts[i]; c.lineTo(x, y + r - 1); }
  c.closePath(); c.fillStyle = fin[2]; c.fill(); c.strokeStyle = INK; c.lineWidth = 0.7; c.stroke();
  // (the body: its ink first, all along, then each segment's ramp: the shade, the belly, the skin, lit along the back)
  c.save();
  for (let i = 0; i < SEG; i++) {
    const [x0, y0, r0] = pts[i], [x1, y1, r1] = pts[i + 1];
    c.strokeStyle = INK; c.lineWidth = r0 + r1 + 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  }
  for (let i = 0; i < SEG; i++) {
    const [x0, y0, r0] = pts[i], [x1, y1, r1] = pts[i + 1], r = (r0 + r1) / 2;
    const seg = (wd: number, col: string, dy: number) => { c.strokeStyle = col; c.lineWidth = wd; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0 + dy); c.lineTo(x1, y1 + dy); c.stroke(); };
    seg(r * 2, skin[1], 0);
    seg(r * 1.4, belly[2], r * 0.35);
    seg(r * 1.3, skin[2], -r * 0.3);
    seg(r * 0.6, skin[3], -r * 0.6);
    seg(Math.max(0.6, r * 0.18), skin[4], -r * 0.78);
  }
  c.restore();
  // (the battery spots down its flank: pale, lit gold when it's charged)
  for (let i = 3; i < SEG - 1; i += 1.5) {
    const j = Math.floor(i), [x, y, r] = pts[j];
    c.fillStyle = pose === 'zap' ? (lit ? '#FFF8A0' : '#E8D040') : pose === 'lunge' ? '#E8E0A0' : mix(skin[3], '#E8E0B0', 0.5);
    c.fillRect(Math.round(x) - 1, Math.round(y - r * 0.1) - 1, 2, 2);
  }
  // The head: blunt, flat-topped, the wide mouth (open on the lunge), the little eyes, the nostril
  const [hx, hy] = pts[SEG];
  const open = pose === 'lunge' ? 4 : pose === 'zap' ? 2 : pose === 'hurt' ? 3 : 0.6;
  part(c, g => { g.moveTo(hx - 8, hy - 4); g.quadraticCurveTo(hx - 2, hy - 7.5, hx + 6, hy - 6); g.quadraticCurveTo(hx + 12, hy - 4.5, hx + 12.5, hy); g.quadraticCurveTo(hx + 6, hy + 2, hx - 8, hy + 4); g.closePath(); }, skin, hx - 8, hy - 8, 21, 12, 0.9);
  part(c, g => { g.moveTo(hx - 6, hy + 3); g.quadraticCurveTo(hx + 4, hy + 1, hx + 11, hy + 1 + open * 0.3); g.quadraticCurveTo(hx + 8, hy + 5 + open, hx - 4, hy + 5.5); g.closePath(); }, belly, hx - 6, hy + 1, 17, 6 + open, 0.8);
  if (open > 1) { inked(c, g => { g.moveTo(hx, hy + 2); g.lineTo(hx + 11, hy + 1); g.lineTo(hx + 10, hy + 1 + open * 0.8); g.lineTo(hx + 1, hy + 3 + open * 0.5); g.closePath(); }, '#3A0A10', 0.5); for (let x = hx + 3; x < hx + 10; x += 2.2) fang(c, x, hy + 1.2, 1.2, 1.4, '#F0E8C0'); }
  eyeball(c, hx + 5, hy - 3, 1.5, pose === 'zap' || pose === 'lunge' ? '#FFF060' : '#E8E0A0', pose === 'dead');
  c.fillStyle = INK; c.fillRect(hx + 10, hy - 3, 1, 1);
  c.restore();
};

/** The hole an eel lives in (by its home: the dead one's corpse keeps the home it had), world coordinates. */
const holeOf = (e: Enemy) => {
  if (e.homeX === undefined) return null;
  const el = EELS.find(h => Math.abs(SECTIONS.river.x0 + h.x - e.homeX!) < 1);
  if (!el) return null;
  const m = eelMouth(el);
  return { x: SECTIONS.river.x0 + m.x, y: m.y, dir: m.dir };
};

export const drawEel = (c: Ctx, e: Enemy, f: number) => {
  const since = sinceHurt(e, f), w = e.width;
  const pose: EelPose = e.health <= 0 ? 'dead' : since < 10 ? 'hurt' : e.aiState === 'zap' ? 'zap' : e.aiState === 'lunge' ? 'lunge' : 'wave';
  const k = pose === 'zap' ? Math.floor(f / 2) % 8 : pose === 'dead' ? 0 : Math.floor((f + (e.homeX ?? 0)) / (pose === 'lunge' ? 2 : 5)) % 8;
  // (whatever of it's still back in its hole doesn't show: only what's out of the hole's mouth, and its neck in the dark
  // of the hole, in the hole's shadow. The body's middle (8 up from its feet) runs out of the hole's middle; on the way
  // out at him, its tail's held to the mouth while it's still in, the body bent up or down to where its head's got to)
  const hole = holeOf(e), fc = e.facing ?? 1;
  const live = e.health > 0 && e.aiState !== 'loose' && e.aiState !== 'recover' && !e.isBlownAway;
  const body = (g: Ctx) => stamp(g, `cr-eel-${pose}-${k}-${w}`, -w / 2 - 6, -28, w + 24, 42, s => paintEel(s, pose, k, w));
  let held = false;
  if (hole) {
    const cx = e.pos.x + w / 2, feet = e.pos.y + e.height;
    const out = hole.dir * fc, mouth = (hole.x - cx) * fc, ocx = (hole.x - hole.dir * EEL_HOLE.inset - cx) * fc, ocy = hole.y - feet;
    const tail = -w / 2 + 4;
    // (the dead one, only while it's still in the hole where it died; it's the eel's own business after that)
    const inHole = (out > 0 ? tail < mouth : -tail > mouth) && Math.abs(ocy + 8) < EEL_HOLE.ry + 2;
    if (live || (e.aiState === 'recover' && inHole)) {
      held = true;
      const bend = () => {
        if (!live || out <= 0) return;
        const head = w / 2 - 14, anchor = Math.max(mouth, tail);
        const dy = (ocy + 8) * Math.max(0, Math.min(1, 1 - (tail - mouth) / 60));
        if (Math.abs(dy) >= 1 && head - anchor > 8) { const b = dy / (anchor - head); c.transform(1, b, 0, 1, 0, -b * head); }
      };
      const side = (outward: boolean) => { const r = outward === out > 0; c.beginPath(); c.rect(r ? mouth : mouth - 800, -400, 800, 800); c.clip(); };
      // (out of it)
      c.save(); side(true); bend(); body(c); c.restore();
      // (in it: only in the dark of the hole, shadowed)
      c.save();
      c.beginPath(); c.ellipse(ocx, ocy, EEL_HOLE.rx, EEL_HOLE.ry, 0, 0, Math.PI * 2); c.clip(); side(false);
      c.globalAlpha = 0.45; bend(); body(c); c.restore();
    }
  }
  if (!held) body(c);
  // (the charge: crackling arcs over it, jagged, live)
  if (pose === 'zap' || (pose === 'lunge' && f % 6 < 2)) {
    c.save(); c.translate(0, -8);
    for (let n = 0; n < 3; n++) {
      let x = -w / 2 + ((f * 7 + n * 29) % w), y = -10 - (n % 2) * 3;
      c.strokeStyle = n % 2 ? '#FFFFFF' : '#FDE047'; c.lineWidth = n % 2 ? 1 : 1.6;
      c.beginPath(); c.moveTo(x, y);
      for (let j = 0; j < 4; j++) { x += ((f * 13 + n * 7 + j * 5) % 11) - 5; y += 5; c.lineTo(Math.round(x), Math.round(y)); }
      c.stroke();
    }
    c.restore();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The snapping plant: a flytrap's head big as his (two lobes, waxy green outside, the inside raw red with a
// speckle, the long pale teeth round their rims), on a stalk down to its root in a rosette of leaves. Frames: idle
// (breathing open and shut), the rear (wide, pulled back, squashed), the snap (shut, stretched toward him, a crunch of
// teeth), hurt, dead (shut, wilted).

const S_LOBE = ramp4('#3E9A30'), S_IN = ramp4('#B8283A'), S_STALK = ramp4('#2E7A2A'), S_LEAF = ramp4('#2A6A26');
type SnapPose = 'idle' | 'rear' | 'snap' | 'hurt' | 'dead';
const paintTrap = (c: Ctx, pose: SnapPose, k: number) => {
  const hit = pose === 'hurt' ? 0.55 : 0;
  const lobe = flash(S_LOBE, hit), inside = flash(pose === 'dead' ? ramp4('#7A4A3A') : S_IN, hit);
  const open = pose === 'snap' || pose === 'dead' ? 0.04 : pose === 'rear' ? 1 : pose === 'hurt' ? 0.7 : 0.45 + 0.15 * Math.sin((k / 4) * Math.PI * 2);
  const sx = pose === 'snap' ? 1.18 : pose === 'rear' ? 0.86 : 1, sy = pose === 'snap' ? 0.86 : pose === 'rear' ? 1.12 : 1;
  c.save(); c.translate(0, -15);
  if (pose === 'dead') c.rotate(0.6);
  c.scale(sx, sy);
  // (the hinge at the back, a bulb; the two lobes either side of it, swung open by `open`)
  part(c, g => g.ellipse(-4, 0, 6, 7, 0, 0, Math.PI * 2), lobe, -10, -7, 12, 14, 0.9);
  for (const s of [-1, 1]) {
    c.save(); c.translate(-4, 0); c.rotate(-s * open * 0.85);
    const shell = (g: Ctx) => { g.moveTo(0, 0); g.quadraticCurveTo(10, s * 13, 24, s * 2); g.lineTo(24, 0); g.closePath(); };
    // (the inside, raw, speckled: shown on the lobe's face when it's open)
    if (open > 0.15) {
      part(c, g => { g.moveTo(1, 0); g.quadraticCurveTo(10, s * 10, 22, s * 1.5); g.lineTo(22, 0); g.closePath(); }, inside, 0, s < 0 ? -10 : 0, 22, 10, 0.6);
      c.fillStyle = inside[0]; for (const [dx, dy] of [[6, 2.5], [11, 4], [15, 2], [9, 6]]) c.fillRect(dx, s * dy, 1, 1);
      c.fillStyle = inside[4]; c.fillRect(6, s * 1.5, 4, 0.8);
    }
    part(c, shell, lobe, 0, s < 0 ? -13 : 0, 24, 13, 0.9);
    // (the rim's teeth: long, pale, curved in)
    for (let t = 3; t < 24; t += 3) { const ty = s * (2 + Math.sin(t / 24 * Math.PI) * 9); fang(c, t - 0.8, ty * (open > 0.15 ? 0.85 : 0.2), 1.6, -s * (pose === 'rear' ? 6 : 4.5), '#F0ECC8'); }
    c.restore();
  }
  // (the eye-spots: it hasn't eyes, it's a plant; the markings that look like them do the job)
  if (pose !== 'dead') { c.fillStyle = '#F2E040'; c.fillRect(-6, -3, 2, 2); c.fillStyle = INK; c.fillRect(-5, -3, 1, 1); }
  c.restore();
};

/** The stalk, live (it's tied to the root wherever the head's got to): beads of stem, leaves off it, the rosette. */
const drawStalk = (c: Ctx, e: Enemy, f: number, loose: boolean, rx: number, ry: number) => {
  const top = { x: -4, y: -e.height / 2 };
  const mx = rx * 0.3 + Math.sin(f * 0.05) * 6, my = ry * 0.5;
  const n = Math.max(4, Math.ceil(Math.hypot(rx - top.x, ry - top.y) / 3.5));
  const at = (t: number) => ({ x: (1 - t) * (1 - t) * top.x + 2 * (1 - t) * t * mx + t * t * rx, y: (1 - t) * (1 - t) * top.y + 2 * (1 - t) * t * my + t * t * ry });
  const R = e.health <= 0 ? ramp4('#5A6A2A') : S_STALK;
  for (let i = n; i >= 0; i--) {
    const p = at(i / n), w = 3.2 - (i / n) * 1;
    c.fillStyle = INK; c.fillRect(Math.round(p.x - w - 0.5), Math.round(p.y - 2.5), Math.round(w * 2 + 1), 5);
    c.fillStyle = R[2]; c.fillRect(Math.round(p.x - w), Math.round(p.y - 2), Math.round(w * 2), 4);
    c.fillStyle = R[3]; c.fillRect(Math.round(p.x - w), Math.round(p.y - 2), 1, 4);
    c.fillStyle = R[1]; c.fillRect(Math.round(p.x + w - 1), Math.round(p.y - 2), 1, 4);
    // (a leaf off it now and then)
    if (i === Math.round(n * 0.35) || i === Math.round(n * 0.7)) {
      const s = i === Math.round(n * 0.35) ? 1 : -1;
      inked(c, g => { g.moveTo(p.x, p.y); g.quadraticCurveTo(p.x + s * 8, p.y - 7 + Math.sin(f * 0.06 + i) * 1.5, p.x + s * 13, p.y - 3); g.quadraticCurveTo(p.x + s * 7, p.y + 1, p.x, p.y); }, S_LEAF[3], 0.7);
    }
  }
  if (loose) { inked(c, g => g.arc(rx, ry, 3, 0, Math.PI * 2), '#A3E635', 0.7); return; }
  // (the rosette at the root: leaves flat out round it, the soil heaped)
  for (const [s, len, a] of [[-1, 15, 0.35], [1, 15, -0.35], [-1, 10, 0.9], [1, 10, -0.9]] as [number, number, number][]) {
    c.save(); c.translate(rx, ry - 2); c.rotate(a + Math.sin(f * 0.04 + s) * 0.05);
    part(c, g => g.ellipse(s * len * 0.6, 0, len * 0.6, 3.5, 0, 0, Math.PI * 2), S_LEAF, s < 0 ? -len * 1.2 : 0, -4, len * 1.2, 8, 0.7);
    c.restore();
  }
};

const SNAP_STALK = 210;
export const drawSnapper = (c: Ctx, e: Enemy, f: number) => {
  // (torn off its stalk, in his fist or flying, or with no root to be tied back to (its death drawn from a stand-in
  // with no homeY), or well out of its stalk's reach: a ragged stub, no roots)
  const fc = e.facing ?? 1;
  const toRoot = { x: ((e.homeX ?? 0) - (e.pos.x + e.width / 2)) * fc, y: (e.homeY ?? 0) - (e.pos.y + e.height) };
  // (alive and still rooted, knocked about by a charge however far: the stalk stretches back to its root, never a stub
  // (the user's: "the 'rope' effect disappears when the head is far away from the base"))
  const rooted = e.health > 0 && e.aiState !== 'loose' && e.homeY !== undefined && e.homeX !== undefined;
  const loose = !rooted && (e.aiState === 'loose' || !!e.isBlownAway || e.homeY === undefined || e.homeX === undefined || !(Math.hypot(toRoot.x, toRoot.y) < SNAP_STALK));
  const rx = loose ? -10 + Math.sin(f * 0.3) * 3 : toRoot.x, ry = loose ? 4 : toRoot.y;
  drawStalk(c, e, f, loose, rx, ry);
  const since = sinceHurt(e, f);
  const pose: SnapPose = e.health <= 0 ? 'dead' : since < 10 ? 'hurt' : e.aiState === 'snap' ? 'snap' : e.aiState === 'rear' ? 'rear' : 'idle';
  const k = pose === 'idle' ? Math.floor((f + (e.homeX ?? 0)) / 8) % 4 : 0;
  // (the rear quivers; the snap lands with a jolt)
  const jx = pose === 'rear' ? (f % 4 < 2 ? 1 : -1) : 0;
  c.save(); c.translate(jx, 0);
  stamp(c, `cr-snap-${pose}-${k}`, -34, -62, 72, 72, g => paintTrap(g, pose, k));
  c.restore();
};
