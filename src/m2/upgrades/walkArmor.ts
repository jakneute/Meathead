// The armor on the walk screens' big Meathead (walkAway/meathead.ts from the front: the walk-aways, the hub portal's
// walk out; walkAway/meatheadBack.ts from behind: the walk-ins, the hub portal's walk in). Picture pixels, his feet at
// the origin (the walk's bob already in what's passed). The same pieces as the sprite's (armorArt.ts: the same baked
// stamps where they read the same from the front or behind, scaled up to his size here; their own pixel art where they
// don't), each shown while has(piece). The mismatched fool, same as in play: rusty iron cowboy boots, coconut shoulders,
// gold statuettes duct-taped to his shins, chrome LED bracers, cartoon gloves, a souvenir Viking helmet with beer cans
// and straws, a princess jewel, a cheap creased vampire cape.
// VISIBILITY (SPEC.md): the cape from behind is split down his spine and stops above his belt, so the seat of his jeans
// (or his bare ass) shows; the leg armor is knee and shin; the helmet's brim stops above his glasses and the straws come
// down outside his ears and in under the glasses.

import { type Ctx, INK, box, poly, stipple } from '../walkAway/kit';
import { has } from './state';
import { armorStamp, drawLedWord, GLOVE_BACK, RUST, IRON, CAPE, PLASTIC, HORN, CAN_RED, CAN_BLUE } from './armorArt';

type P2 = [number, number];
/** The sprite's stamps drawn this much bigger here. */
const K = 2.3;

/** A stamp, its middle at (x, y), `w` x `h` picture px, turned `a`, mirrored across when `flip`. */
const stamp = (c: Ctx, img: HTMLCanvasElement | null, x: number, y: number, w: number, h: number, a = 0, flip = false) => {
  if (!img) return;
  c.save(); c.translate(x, y); if (a) c.rotate(a); if (flip) c.scale(-1, 1);
  c.drawImage(img, -w / 2, -h / 2, w, h);
  c.restore();
};

/** The sabatons over a boot (its box): cowboy boots of rusty railroad iron, riveted: the shaft up over his ankle with a V
 *  cut in its top, from the front the pointed iron toe, from behind the stacked heel; a spur off the back of the heel on
 *  the outside; the cowbell off the ankle on the screen's right. */
export const walkBoot = (c: Ctx, bx: number, by: number, bw: number, bh: number, side: number, front: boolean, t = 0) => {
  if (!has('sabatons')) return;
  const sx = bx + 3, sw = bw - 6, top = by;
  // (the shaft, a V notch in the middle of its top, the pull straps' loops each side)
  poly(c, [[sx, top], [sx + sw / 2 - 3, top], [sx + sw / 2, top + 4], [sx + sw / 2 + 3, top], [sx + sw, top], [sx + sw + 1, by + 4], [sx - 1, by + 4]], RUST[2]);
  box(c, sx, top + 1, 3, by + 3 - top, RUST[3]); box(c, sx + sw - 3, top + 1, 3, by + 3 - top, RUST[1]);
  box(c, sx + 1, top, 3, 3, INK); box(c, sx + sw - 4, top, 3, 3, INK); box(c, sx + 2, top + 1, 1, 1, RUST[4]);
  box(c, sx + 2, top + 4, 1, 1, '#F2B27A'); box(c, sx + sw - 3, top + 4, 1, 1, '#F2B27A');
  // (the foot: rust, banded, lit along its top)
  c.fillStyle = INK; c.beginPath(); c.roundRect(bx - 2, by + 2, bw + 4, bh - 1, 3); c.fill();
  box(c, bx - 1, by + 3, bw + 2, bh - 3, RUST[2]);
  box(c, bx - 1, by + 3, bw + 2, 2, RUST[4]); box(c, bx - 1, by + 5, 2, bh - 7, RUST[3]); box(c, bx + bw - 1, by + 5, 2, bh - 7, RUST[1]);
  c.fillStyle = stipple(c, '#D9772E', 1); c.fillRect(bx + 2, by + 6, bw - 4, 3);
  if (front) {
    // (the pointed toe: an iron cap narrowing to a point toward us, lit, a rivet on it)
    poly(c, [[bx + 2, by + bh - 8], [bx + bw - 2, by + bh - 8], [bx + bw / 2 + 2, by + bh - 1], [bx + bw / 2 - 2, by + bh - 1]], IRON[2]);
    box(c, bx + 4, by + bh - 7, bw / 2 - 4, 2, IRON[4]); box(c, bx + bw / 2 - 1, by + bh - 5, 2, 1, '#F2B27A');
  } else {
    // (the stacked heel, taller than the sole)
    box(c, bx + bw / 2 - 6, by + bh - 6, 12, 6, INK); box(c, bx + bw / 2 - 5, by + bh - 5, 10, 5, IRON[1]); box(c, bx + bw / 2 - 5, by + bh - 5, 10, 1, IRON[3]);
  }
  // (the iron sole)
  box(c, bx - 1, by + bh - 2, bw + 2, 2, IRON[1]); box(c, bx - 1, by + bh - 2, bw + 2, 1, IRON[3]);
  // (the spur: a strap round the heel, the rowel out behind: from the front off the outside, from behind off the back)
  const rx = front ? (side > 0 ? bx + bw + 4 : bx - 4) : bx + bw / 2, ry = by + bh - 6 + (front ? 0 : 3);
  box(c, front ? Math.min(rx, bx + bw) : rx - 1, ry, front ? Math.abs(rx - (side > 0 ? bx + bw : bx)) : 2, 2, '#CBD5E1');
  c.save(); c.translate(rx, ry + 1); c.rotate(t * 0.05);
  for (let k = 0; k < 6; k++) { c.rotate(Math.PI / 3); box(c, -1, -5, 2, 4, k % 2 ? '#E2E8F0' : '#94A3B8'); }
  c.restore();
  if (side > 0) {
    // (the cowbell, on its strap, swinging off the outside of the ankle)
    stamp(c, armorStamp('bell'), bx + bw + 1, by + 2, 12, 14, Math.sin(t * 0.12) * 0.2);
  }
};

/** The leg armor on a leg (its middle x, the knee's y, the boot's top): from the front, the film-reel knee pad and the
 *  gold statuette duct-taped down the shin; from behind, the tape round the calf and the statuette's edges past it.
 *  Nothing up his thigh. */
export const walkShin = (c: Ctx, lx: number, ky: number, bootTop: number, side: number, front: boolean) => {
  if (!has('legs')) return;
  // (from just above the knee to a clean gap above the boot (the boot keeps inside its own box))
  const top = ky - 2, bot = bootTop - 3, h = bot - top;
  if (front) {
    if (h > 4) stamp(c, armorStamp('statue'), lx - 1, top + h / 2, 18, h);
    stamp(c, armorStamp('reel'), lx - 1, ky + 1, 15, 15);
  } else if (h > 4) {
    for (const s of [-1, 1]) box(c, lx + s * 9 - 1, top + 2, 2, h - 4, s === side ? '#F0C850' : '#C8961A');
    for (const ty of [top + h * 0.15, top + h * 0.6]) { box(c, lx - 9, ty, 18, 4, '#9CA3AF'); box(c, lx - 9, ty, 18, 1, '#E5E7EB'); box(c, lx - 9, ty + 3, 18, 1, '#6B7280'); }
  }
};

/** A pauldron over the shoulder (the deltoid's middle), its tusk up and out to that side. */
export const walkShoulder = (c: Ctx, x: number, y: number, side: number) => {
  if (!has('pauldrons')) return;
  stamp(c, armorStamp('pauldron', false), x + side * 2, y - 2, 20 * K, 18 * K, 0, side < 0);
};

/** An armguard along the forearm, from a little up the upper arm (well under the pauldron) to just short of the wrist
 *  (the glove starts past it), the whole word BEEF lit across it, upright (`t` the screen's frame). */
export const walkForearm = (c: Ctx, E: P2, W: P2, t = 0) => {
  if (!has('armguards')) return;
  const dx = W[0] - E[0], dy = W[1] - E[1], len = Math.hypot(dx, dy);
  if (len < 4) return;
  const bx = -6, bw = len - 1 - bx, bh = 24;
  c.save(); c.translate(E[0], E[1]); c.rotate(Math.atan2(dy, dx));
  const img = armorStamp('bracerPlain');
  if (img) c.drawImage(img, bx, -bh / 2, bw, bh);
  c.restore();
  // (the LED panel: the whole word, upright on screen, in the bracer's middle)
  const m = (bx + bw / 2) / len;
  drawLedWord(c, Math.round(E[0] + dx * m), Math.round(E[1] + dy * m), 1, t);
};

/** The big white glove over a fist (its middle; `r` the fist's size), pointing `a` (down, hanging). */
export const walkFist = (c: Ctx, x: number, y: number, r = 7, a = Math.PI / 2) => {
  if (!has('hands')) return;
  // (its cuff's back edge 5 px down from the fist's middle toward the wrist (6 back): clear of the armguard)
  const s = (18 * r) / 5, u = s / 18, off = (9 - GLOVE_BACK) * u - 5;
  stamp(c, armorStamp('glove'), x + Math.cos(a) * off, y + Math.sin(a) * off, s, s, a);
};

// ---- the helmet, from the front or behind: painted once (picture px), a souvenir-shop Viking helmet: the silver
// plastic dome over his flat-top, the brim stopping above his brows (the glasses always show), plastic horns out each
// side, the flag patch on its front left, a beer can in a holder each side (red on his left, blue on his right)
const helmCache = new Map<string, HTMLCanvasElement | null>();
const HELM_W = 76, HELM_H = 40;
/** The cans' tops (the canvas: x each side, y), where the straws come out. */
const CAN_X = 9, CAN_Y = 21;
/** His head's middle at x 38; the brim's bottom at y 34 (his eyes' line less 5 from the front). */
const paintWalkHelmet = (front: boolean): HTMLCanvasElement | null => {
  const key = front ? 'f' : 'b';
  const have = helmCache.get(key);
  if (have !== undefined) return have;
  let cv: HTMLCanvasElement | null = null;
  if (typeof document !== 'undefined') {
    cv = document.createElement('canvas'); cv.width = HELM_W; cv.height = HELM_H;
    const c = cv.getContext('2d')!;
    // (the horns: plastic, out of rings each side, curving up and out, banded along their length, a hard shine, the
    // mould seam)
    for (const s of [-1, 1]) {
      for (let k = 0; k <= 16; k++) {
        const t = k / 16, x = 38 + s * (17 + t * 11 + t * t * 3), y = 24 - t * 9 - t * t * 13, r = 4 - t * 3.1;
        c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 1, 0, Math.PI * 2); c.fill();
      }
      for (let k = 0; k <= 16; k++) {
        const t = k / 16, x = 38 + s * (17 + t * 11 + t * t * 3), y = 24 - t * 9 - t * t * 13, r = 4 - t * 3.1;
        c.fillStyle = HORN[t < 0.3 ? 1 : t < 0.65 ? 2 : 3]; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
        if (k % 3 === 0) { c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(x - s * r * 0.4), Math.round(y - r * 0.3), 1, 1); }
        c.fillStyle = HORN[0]; c.fillRect(Math.round(x + s * r * 0.3), Math.round(y + r * 0.4), 1, 1);
      }
      c.fillStyle = INK; c.fillRect(38 + s * 17 - 3, 20, 6, 9);
      c.fillStyle = HORN[1]; c.fillRect(38 + s * 17 - 2, 21, 4, 7); c.fillStyle = HORN[3]; c.fillRect(38 + s * 17 - 2, 21, 1, 7);
    }
    // (the dome: inked, silver plastic, flat bands from the lit upper left, one hard white shine)
    const ST = PLASTIC;
    c.fillStyle = INK; c.beginPath(); c.ellipse(38, 34, 19, 26, 0, Math.PI, Math.PI * 2); c.fill();
    c.save(); c.beginPath(); c.ellipse(38, 34, 18, 25, 0, Math.PI, Math.PI * 2); c.clip();
    const bands: [number, number, string][] = [[0, 76, ST[1]], [0, 52, ST[2]], [0, 40, ST[3]]];
    for (const [x0, w, col] of bands) { c.fillStyle = col; c.fillRect(x0, 0, w * 0.62, 40); c.fillStyle = stipple(c, col, 1); c.fillRect(x0 + w * 0.62, 0, 2, 40); }
    c.fillStyle = '#FFFFFF'; c.fillRect(26, 13, 6, 2); c.fillRect(25, 16, 2, 2);
    // (the moulded band over the top, fake rivets)
    c.fillStyle = ST[2]; c.fillRect(35, 8, 6, 26); c.fillStyle = ST[4]; c.fillRect(35, 8, 2, 26); c.fillStyle = ST[0]; c.fillRect(40, 8, 1, 26);
    for (let y = 12; y < 32; y += 5) { c.fillStyle = '#FFFFFF'; c.fillRect(37, y, 2, 2); }
    c.restore();
    // (the brim)
    c.fillStyle = INK; c.fillRect(18, 28, 40, 7);
    c.fillStyle = ST[2]; c.fillRect(19, 29, 38, 5); c.fillStyle = ST[4]; c.fillRect(19, 29, 38, 1); c.fillStyle = ST[0]; c.fillRect(19, 33, 38, 1);
    // (the flag patch: a Nordic cross, stitched on crooked, on its left (the screen's left from the front, right from behind))
    const fx = front ? 22 : 44, fy = 16;
    c.fillStyle = '#F8FAFC'; c.fillRect(fx, fy, 11, 8);
    c.fillStyle = '#C8102E'; c.fillRect(fx + 1, fy + 1, 9, 6);
    c.fillStyle = '#F8FAFC'; c.fillRect(fx + 3, fy + 1, 3, 6); c.fillRect(fx + 1, fy + 3, 9, 2);
    c.fillStyle = '#1D4ED8'; c.fillRect(fx + 4, fy + 1, 1, 6); c.fillRect(fx + 1, fy + 4, 9, 1);
    // (the beer cans in their holders, off the brim's ends on straps: red on his left (the screen's right from the front),
    // blue on his right)
    for (const s of [-1, 1]) {
      const red = front ? s > 0 : s < 0, R = red ? CAN_RED : CAN_BLUE, x0 = 38 + s * (38 - CAN_X) - 4;
      c.fillStyle = INK; c.fillRect(s > 0 ? 57 : 13, 29, 7, 2);
      c.fillStyle = INK; c.fillRect(x0 - 1, CAN_Y - 1, 10, 15);
      c.fillStyle = R[2]; c.fillRect(x0, CAN_Y, 8, 13); c.fillStyle = R[3]; c.fillRect(x0 + 1, CAN_Y + 1, 2, 11); c.fillStyle = R[1]; c.fillRect(x0 + 6, CAN_Y + 1, 2, 11);
      c.fillStyle = '#E5E7EB'; c.fillRect(x0, CAN_Y, 8, 2); c.fillStyle = '#F8FAFC'; c.fillRect(x0, CAN_Y + 5, 8, 2);
      c.fillStyle = '#18181B'; c.fillRect(x0 - 1, CAN_Y + 9, 10, 5); c.fillStyle = '#3F3F46'; c.fillRect(x0 - 1, CAN_Y + 9, 10, 1);
    }
  }
  helmCache.set(key, cv);
  return cv;
};
/** A bendy straw along points (picture px): inked, white with red stripes, the bendy ridges at `bend`. */
const straw = (c: Ctx, pts: P2[], bend: P2) => {
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  const path = () => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); };
  c.strokeStyle = INK; c.lineWidth = 4; path(); c.stroke();
  c.strokeStyle = '#FFFFFF'; c.lineWidth = 2.4; path(); c.stroke();
  c.strokeStyle = '#EF4444'; c.setLineDash([2, 2]); path(); c.stroke(); c.setLineDash([]);
  box(c, bend[0] - 2, bend[1] - 2, 4, 1, '#9CA3AF'); box(c, bend[0] - 2, bend[1] + 1, 4, 1, '#9CA3AF');
  c.restore();
};
/** The helmet on his head (`hy` the head's own bob: his flat-top's top at -186 + hy). From the front, a straw from each
 *  can down outside his ears and in under his glasses to the corners of his mouth (his eyes at -165 + hy, his mouth at
 *  -155 + hy); from behind, the straws going round the sides of his head. */
export const walkHelmet = (c: Ctx, hy: number, front: boolean) => {
  if (!has('helmet')) return;
  const img = paintWalkHelmet(front);
  if (img) c.drawImage(img, -38, -204 + hy);
  const cy = -204 + hy + CAN_Y;
  for (const s of [-1, 1]) {
    const cx = s * (38 - CAN_X);
    if (front) straw(c, [[cx, cy], [s * 24, cy + 8], [s * 24, -157 + hy], [s * 8, -154 + hy]], [s * 24, -157 + hy]);
    else straw(c, [[cx, cy], [s * 24, cy + 8], [s * 23, -160 + hy], [s * 18, -156 + hy]], [s * 23, -160 + hy]);
  }
};

/** The amulet: from the front, the chain of sequins (pink and silver) down from his neck to the princess jewel between
 *  his pecs; from behind, the chain round the back of his neck. */
export const walkAmulet = (c: Ctx, ty: number, front: boolean, t: number) => {
  if (!has('amulet')) return;
  if (!front) {
    for (let x = -11; x <= 11; x += 2) box(c, x, -147 + ty + Math.round(Math.abs(x) * 0.08), 1, 1, (x >> 1) % 2 ? '#F9A8D4' : '#E5E7EB');
    return;
  }
  for (const s of [-1, 1]) for (let k = 0; k <= 9; k++) {
    const u = k / 9, x = s * (11 - 10 * u), y = -146 + ty + u * 16 + Math.sin(u * Math.PI) * 3;
    box(c, x, y, 2, 2, k % 2 ? '#F9A8D4' : '#E5E7EB');
  }
  stamp(c, armorStamp('amulet'), 0, -120 + ty, 20, 24);
  if (t % 50 < 8) { const s = t % 50 < 4 ? 1 : 0; box(c, -4, -124 + ty - s, 1, 3 + s * 2, '#FFFFFF'); box(c, -5 - s, -123 + ty, 3 + s * 2, 1, '#FFFFFF'); }
};

/** One side of the cape from behind, `side` the screen's: shiny black polyester from the shoulders down his back to a
 *  scalloped hem above his belt, creased in squares from the package; swaying with his stride. */
const capeSide = (c: Ctx, side: number, ty: number, sway: number): P2 => {
  const s = side;
  const tips: P2[] = [[s * 7, -98 + ty], [s * 22 + sway, -95 + ty], [s * 36 + sway * 1.4, -98 + ty], [s * 46 + sway * 1.8, -104 + ty]];
  const pts: number[][] = [[s * 6, -146 + ty], [s * 34, -142 + ty], [s * 44, -128 + ty], tips[3]];
  for (let i = 3; i > 0; i--) { const a = tips[i], b = tips[i - 1]; pts.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 4]); pts.push(b); }
  poly(c, pts, CAPE[1]);
  c.save(); c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
  // (banded black, a cheap sheen across the shoulders, a checker on each band's edge)
  box(c, -60, -150 + ty, 120, 14, CAPE[3]); c.fillStyle = stipple(c, CAPE[3], s > 0 ? 1 : 0); c.fillRect(-60, -136 + ty, 120, 2);
  box(c, -60, -134 + ty, 120, 14, CAPE[2]); c.fillStyle = stipple(c, CAPE[2], 1); c.fillRect(-60, -120 + ty, 120, 2);
  c.fillStyle = stipple(c, CAPE[0]); c.fillRect(-60, -106 + ty, 120, 10);
  // (the creases: a square grid pressed in, a lit ridge and a dark fold each)
  for (let x = -54; x <= 54; x += 12) { box(c, x, -150 + ty, 1, 60, CAPE[4]); box(c, x + 1, -150 + ty, 1, 60, '#000000'); }
  for (let y = -138; y <= -98; y += 12) { box(c, -60, y + ty, 120, 1, CAPE[4]); box(c, -60, y + 1 + ty, 120, 1, '#000000'); }
  c.restore();
  return tips[3];
};

/** The price tag, hung off (x, y) on its string, flapping (`t` the screen's frame). */
const priceTag = (c: Ctx, x: number, y: number, t: number) => stamp(c, armorStamp('tag'), x, y + 8, 10, 15, Math.sin(t * 0.18) * 0.35);

/** The cape from behind: split down his spine, the collar across his shoulders standing up at its ends, the plastic
 *  skull at its middle, the price tag flapping off one point; above his belt (`step` sways it, `t` the frame). */
export const walkCapeBack = (c: Ctx, ty: number, step: number, t = 0) => {
  if (!has('cape')) return;
  const sway = Math.round(Math.sin(step - 0.5) * 2);
  capeSide(c, -1, ty, -sway); const tip = capeSide(c, 1, ty, sway);
  // (the collar: black, its ends standing up past his traps)
  poly(c, [[-36, -144 + ty], [-40, -160 + ty], [-22, -150 + ty], [22, -150 + ty], [40, -160 + ty], [36, -144 + ty]], CAPE[0]);
  box(c, -36, -150 + ty, 72, 2, CAPE[3]);
  stamp(c, armorStamp('skull'), 0, -148 + ty, 12, 12);
  priceTag(c, tip[0], tip[1] - 2, t);
};

/** The cape from the front: its points flaring out behind him past his sides, the red lining toward us (drawn first:
 *  everything's over it). */
export const walkCapeBehind = (c: Ctx, ty: number, step: number) => {
  if (!has('cape')) return;
  const sway = Math.round(Math.sin(step - 0.5) * 2);
  for (const s of [-1, 1]) {
    const sw = s * sway;
    poly(c, [[s * 30, -144 + ty], [s * 50 + sw, -128 + ty], [s * 56 + sw * 1.5, -106 + ty], [s * 48 + sw, -110 + ty], [s * 44 + sw, -100 + ty], [s * 36, -104 + ty], [s * 28, -100 + ty]], '#991B1B');
    box(c, s * 46 - (s > 0 ? 0 : 4) + sw, -124 + ty, 4, 10, '#DC2626');
    // (its black outside, round the edge)
    box(c, s * 50 - (s > 0 ? 0 : 5) + sw, -128 + ty, 5, 22, CAPE[1]);
  }
};
/** ...and its tall collar standing up behind his traps from the front, red inside, the skull clasped at his throat. */
export const walkCapeCollar = (c: Ctx, ty: number) => {
  if (!has('cape')) return;
  for (const s of [-1, 1]) {
    poly(c, [[s * 14, -146 + ty], [s * 32, -160 + ty], [s * 32, -140 + ty], [s * 14, -141 + ty]], CAPE[0]);
    poly(c, [[s * 17, -145 + ty], [s * 29, -155 + ty], [s * 29, -142 + ty]], '#B91C1C', null);
  }
  stamp(c, armorStamp('skull'), 0, -141 + ty, 11, 11);
};

