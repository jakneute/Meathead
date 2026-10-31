// The armor on the walk screens' big Meathead (walkAway/meathead.ts from the front: the walk-aways, the hub portal's
// walk out; walkAway/meatheadBack.ts from behind: the walk-ins, the hub portal's walk in). Picture pixels, his feet at
// the origin (the walk's bob already in what's passed). The same pieces as the sprite's (armorArt.ts: the same baked
// stamps where they read the same from the front or behind, scaled up to his size here; their own pixel art where they
// don't), each shown while has(piece). The cape from behind is split down his spine and stops above his belt, so the
// seat of his jeans (or his bare ass) shows.

import { type Ctx, INK, box, poly, stipple } from '../walkAway/kit';
import { has } from './state';
import { armorStamp, RUST, IRON, BRASS, GOLD, WING, WOOD } from './armorArt';

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

/** The sabatons over a boot (its box): rusted railroad iron, riveted; from the front the toe's dome, from behind the heel
 *  plate; the cowbell off the ankle on the screen's right. */
export const walkBoot = (c: Ctx, bx: number, by: number, bw: number, bh: number, side: number, front: boolean) => {
  if (!has('sabatons')) return;
  c.fillStyle = INK; c.beginPath(); c.roundRect(bx - 2, by - 3, bw + 4, bh + 4, 3); c.fill();
  box(c, bx - 1, by - 2, bw + 2, bh + 1, RUST[2]);
  box(c, bx - 1, by - 2, bw + 2, 2, RUST[4]); box(c, bx - 1, by, 2, bh - 2, RUST[3]); box(c, bx + bw - 1, by, 2, bh - 2, RUST[1]);
  // (the lames across it, each edge dark with a lit lip under it; rivets; pitting)
  for (let k = 0; k < 3; k++) { const ly = by + 2 + k * 4; box(c, bx, ly, bw, 1, RUST[0]); box(c, bx, ly + 1, bw, 1, RUST[3]); }
  for (const rx of [3, bw / 2, bw - 4]) box(c, bx + rx, by + 3, 1, 1, '#F2B27A');
  c.fillStyle = stipple(c, '#D9772E', 1); c.fillRect(bx + 2, by + bh - 7, bw - 4, 3);
  if (front) {
    // (the toe cap: a dome of iron toward us, lit)
    c.fillStyle = RUST[3]; c.beginPath(); c.ellipse(bx + bw / 2, by + bh - 4, bw / 2 - 1, 5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = RUST[4]; c.beginPath(); c.ellipse(bx + bw / 2 - 2, by + bh - 5, bw / 3, 2.5, 0, 0, Math.PI * 2); c.fill();
    box(c, bx + bw / 2 - 1, by + bh - 6, 2, 1, '#F2B27A');
  }
  // (the iron sole)
  box(c, bx - 1, by + bh - 2, bw + 2, 2, IRON[1]); box(c, bx - 1, by + bh - 2, bw + 2, 1, IRON[3]);
  if (side > 0) {
    // (the cowbell, on its strap, swinging off the outside of the ankle)
    const x = bx + bw - 2, y = by - 4;
    box(c, bx - 1, by - 4, bw + 2, 2, '#5C3A1E');
    poly(c, [[x, y], [x + 5, y], [x + 7, y + 9], [x - 2, y + 9]], BRASS[2]);
    box(c, x, y + 1, 2, 7, BRASS[4]); box(c, x + 4, y + 1, 2, 8, BRASS[1]); box(c, x + 1, y + 9, 3, 2, '#1A1206');
  }
};

/** The leg armor on a leg (its middle x, the knee's y, the boot's top): from the front, the film-reel knee cop and the gold
 *  plating down the shin with the stunt pad strapped across; from behind, the plating's edges round the calf and the
 *  pad's strap. Nothing up his thigh. */
export const walkShin = (c: Ctx, lx: number, ky: number, bootTop: number, side: number, front: boolean) => {
  if (!has('legs')) return;
  const top = ky + (front ? 6 : 4), bot = bootTop - 1, h = bot - top;
  if (front) {
    if (h > 3) {
      box(c, lx - 9, top, 16, h, INK);
      box(c, lx - 8, top, 14, h, GOLD[2]);
      for (let x = 0; x < 14; x += 2) box(c, lx - 8 + x, top, 1, h, x < 6 ? GOLD[3] : GOLD[1]);
      box(c, lx - 8, top, 14, 1, GOLD[4]);
      const sy = top + Math.round(h * 0.45);
      box(c, lx - 9, sy, 16, 4, '#18181B'); box(c, lx - 9, sy, 16, 1, '#3F3F46'); box(c, lx - 9, sy + 2, 16, 1, '#DC2626');
    }
    stamp(c, armorStamp('reel'), lx - 1, ky + 1, 15, 15);
  } else if (h > 3) {
    for (const s of [-1, 1]) { box(c, lx + s * 8 - (s > 0 ? 2 : 0), top, 3, h, INK); box(c, lx + s * 8 - (s > 0 ? 1 : -1) - (s > 0 ? 0 : 1), top, 2, h, s === side ? GOLD[3] : GOLD[1]); }
    const sy = top + Math.round(h * 0.45);
    box(c, lx - 8, sy, 16, 3, '#18181B'); box(c, lx - 8, sy + 1, 16, 1, '#DC2626');
  }
};

/** A pauldron over the shoulder (the deltoid's middle), its tusk up and out to that side. */
export const walkShoulder = (c: Ctx, x: number, y: number, side: number) => {
  if (!has('pauldrons')) return;
  stamp(c, armorStamp('pauldron', false), x + side * 2, y - 2, 20 * K, 18 * K, 0, side < 0);
};

/** An armguard along the forearm (elbow to wrist). */
export const walkForearm = (c: Ctx, E: P2, W: P2) => {
  if (!has('armguards')) return;
  const dx = W[0] - E[0], dy = W[1] - E[1], len = Math.hypot(dx, dy);
  if (len < 4) return;
  c.save(); c.translate(E[0], E[1]); c.rotate(Math.atan2(dy, dx));
  const img = armorStamp('bracer');
  if (img) c.drawImage(img, len * 0.18, -9, len * 0.9, 18);
  c.restore();
};

/** The big white glove over a fist (its middle; `r` the fist's size), pointing `a` (down, hanging). */
export const walkFist = (c: Ctx, x: number, y: number, r = 7, a = Math.PI / 2) => {
  if (!has('hands')) return;
  const s = (16 * r) / 5;
  stamp(c, armorStamp('glove'), x - Math.cos(a) * 1.4, y - Math.sin(a) * 1.4, s, s, a);
};

// ---- the helmet, from the front or behind: painted once (picture px), the dome over his flat-top, the brim stopping
// above his brows (the glasses always show), the horns out each side, the flag patch on its front left
const helmCache = new Map<string, HTMLCanvasElement | null>();
const HELM_W = 76, HELM_H = 40;
/** His head's middle at x 38; the brim's bottom at y 34 (his eyes' line less 5 from the front). */
const paintWalkHelmet = (front: boolean): HTMLCanvasElement | null => {
  const key = front ? 'f' : 'b';
  const have = helmCache.get(key);
  if (have !== undefined) return have;
  let cv: HTMLCanvasElement | null = null;
  if (typeof document !== 'undefined') {
    cv = document.createElement('canvas'); cv.width = HELM_W; cv.height = HELM_H;
    const c = cv.getContext('2d')!;
    const IV = ['#6E6248', '#A89A76', '#D8CCA8', '#F2EAD0', '#FFFCF0'];
    // (the horns: out of brass rings each side, curving up and out, banded along their length, lit on top)
    for (const s of [-1, 1]) {
      for (let k = 0; k <= 16; k++) {
        const t = k / 16, x = 38 + s * (17 + t * 13 + t * t * 4), y = 24 - t * 8 - t * t * 14, r = 4.2 - t * 3.3;
        c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 1, 0, Math.PI * 2); c.fill();
      }
      for (let k = 0; k <= 16; k++) {
        const t = k / 16, x = 38 + s * (17 + t * 13 + t * t * 4), y = 24 - t * 8 - t * t * 14, r = 4.2 - t * 3.3;
        c.fillStyle = IV[t < 0.25 ? 2 : t < 0.6 ? 3 : 4]; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
        c.fillStyle = IV[1]; c.fillRect(Math.round(x - r * 0.3), Math.round(y + r * 0.4), Math.max(1, Math.round(r)), 1);
      }
      c.fillStyle = INK; c.fillRect(38 + s * 17 - 3, 20, 6, 9);
      c.fillStyle = BRASS[2]; c.fillRect(38 + s * 17 - 2, 21, 4, 7); c.fillStyle = BRASS[4]; c.fillRect(38 + s * 17 - 2, 21, 1, 7);
    }
    // (the dome: inked, banded from the lit upper left down to the shade, a checker on each band's edge)
    const ST = ['#1A1F2A', '#363D4D', '#5E6779', '#97A1B4', '#DCE2EC'];
    c.fillStyle = INK; c.beginPath(); c.ellipse(38, 34, 19, 26, 0, Math.PI, Math.PI * 2); c.fill();
    c.save(); c.beginPath(); c.ellipse(38, 34, 18, 25, 0, Math.PI, Math.PI * 2); c.clip();
    const bands: [number, number, string][] = [[0, 76, ST[1]], [0, 52, ST[2]], [0, 44, ST[3]], [0, 30, ST[4]]];
    for (const [x0, w, col] of bands) { c.fillStyle = col; c.fillRect(x0, 0, w * 0.62, 40); c.fillStyle = stipple(c, col, 1); c.fillRect(x0 + w * 0.62, 0, 2, 40); }
    c.fillStyle = ST[0]; c.fillRect(52, 0, 6, 40);
    // (the band over the top, riveted)
    c.fillStyle = ST[3]; c.fillRect(35, 8, 6, 26); c.fillStyle = ST[4]; c.fillRect(35, 8, 2, 26); c.fillStyle = ST[1]; c.fillRect(40, 8, 1, 26);
    for (let y = 12; y < 32; y += 5) { c.fillStyle = '#F8FAFC'; c.fillRect(37, y, 2, 2); c.fillStyle = ST[0]; c.fillRect(38, y + 2, 1, 1); }
    c.restore();
    // (the brim, riveted)
    c.fillStyle = INK; c.fillRect(18, 28, 40, 7);
    c.fillStyle = ST[2]; c.fillRect(19, 29, 38, 5); c.fillStyle = ST[4]; c.fillRect(19, 29, 38, 1); c.fillStyle = ST[0]; c.fillRect(19, 33, 38, 1);
    for (let x = 21; x < 56; x += 5) { c.fillStyle = '#F1F5F9'; c.fillRect(x, 30, 2, 2); c.fillStyle = ST[0]; c.fillRect(x + 1, 32, 1, 1); }
    // (the flag patch: a Nordic cross, stitched on, on its left (the screen's left from the front, right from behind))
    const fx = front ? 22 : 44, fy = 16;
    c.fillStyle = '#F8FAFC'; c.fillRect(fx, fy, 11, 8);
    c.fillStyle = '#C8102E'; c.fillRect(fx + 1, fy + 1, 9, 6);
    c.fillStyle = '#F8FAFC'; c.fillRect(fx + 3, fy + 1, 3, 6); c.fillRect(fx + 1, fy + 3, 9, 2);
    c.fillStyle = '#1D4ED8'; c.fillRect(fx + 4, fy + 1, 1, 6); c.fillRect(fx + 1, fy + 4, 9, 1);
  }
  helmCache.set(key, cv);
  return cv;
};
/** The helmet on his head (`hy` the head's own bob: his flat-top's top at -186 + hy). */
export const walkHelmet = (c: Ctx, hy: number, front: boolean) => {
  if (!has('helmet')) return;
  const img = paintWalkHelmet(front);
  if (img) c.drawImage(img, -38, -204 + hy);
};

/** The amulet: from the front, the chain of pink sequins down from his neck to the crystal between his pecs; from behind,
 *  the chain round the back of his neck. */
export const walkAmulet = (c: Ctx, ty: number, front: boolean, t: number) => {
  if (!has('amulet')) return;
  if (!front) {
    for (let x = -11; x <= 11; x += 2) box(c, x, -147 + ty + Math.round(Math.abs(x) * 0.08), 1, 1, (x >> 1) % 2 ? '#F9A8D4' : '#DB2777');
    return;
  }
  for (const s of [-1, 1]) for (let k = 0; k <= 9; k++) {
    const u = k / 9, x = s * (11 - 10 * u), y = -146 + ty + u * 18 + Math.sin(u * Math.PI) * 3;
    box(c, x, y, 2, 2, k % 2 ? '#F9A8D4' : '#DB2777');
  }
  stamp(c, armorStamp('amulet'), 0, -119 + ty, 16, 22);
  if (t % 50 < 8) { const s = t % 50 < 4 ? 1 : 0; box(c, -3, -122 + ty - s, 1, 3 + s * 2, '#FFFFFF'); box(c, -4 - s, -121 + ty, 3 + s * 2, 1, '#FFFFFF'); }
};

/** One bat wing of the cape, `side` the screen's: from the shoulders down his back to a scalloped hem above his belt,
 *  ribs out to each point; swaying with his stride. */
const wing = (c: Ctx, side: number, ty: number, sway: number, outset: number) => {
  const s = side;
  const tips: P2[] = [[s * 7, -98 + ty], [s * 22 + sway, -94 + ty], [s * 36 + sway * 1.4, -98 + ty], [s * (46 + outset) + sway * 1.8, -106 + ty]];
  const pts: number[][] = [[s * 6, -146 + ty], [s * 34, -142 + ty], [s * (44 + outset), -128 + ty], tips[3]];
  // (the scallops between the points, bowed up toward the shoulder)
  for (let i = 3; i > 0; i--) { const a = tips[i], b = tips[i - 1]; pts.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 6]); pts.push(b); }
  poly(c, pts, WING[1]);
  c.save(); c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
  // (banded: lighter by the shoulders, a checker on each band's edge)
  box(c, -60, -150 + ty, 120, 18, WING[3]); c.fillStyle = stipple(c, WING[3], s > 0 ? 1 : 0); c.fillRect(-60, -132 + ty, 120, 2);
  box(c, -60, -130 + ty, 120, 12, WING[2]); c.fillStyle = stipple(c, WING[2], 1); c.fillRect(-60, -118 + ty, 120, 2);
  c.fillStyle = stipple(c, WING[0]); c.fillRect(-60, -104 + ty, 120, 10);
  // (the ribs)
  c.strokeStyle = WING[0]; c.lineWidth = 1;
  c.beginPath(); for (const tp of tips.slice(1, 3)) { c.moveTo(s * 8, -144 + ty); c.lineTo(tp[0], tp[1]); } c.stroke();
  box(c, s * 8 - (s > 0 ? 0 : 26), -145 + ty, 26, 1, WING[4]);
  c.restore();
};

/** The cape from behind: two bat wings split down his spine, coffin-wood collar across his shoulders, the plastic skull at
 *  its middle; above his belt (`step` sways it). */
export const walkCapeBack = (c: Ctx, ty: number, step: number) => {
  if (!has('cape')) return;
  const sway = Math.round(Math.sin(step - 0.5) * 2);
  wing(c, -1, ty, -sway, 0); wing(c, 1, ty, sway, 0);
  box(c, -36, -150 + ty, 72, 6, INK); box(c, -35, -149 + ty, 70, 4, WOOD[2]); box(c, -35, -149 + ty, 70, 1, WOOD[3]); box(c, -35, -146 + ty, 70, 1, WOOD[0]);
  for (const x of [-26, -12, 12, 26]) box(c, x, -149 + ty, 1, 4, WOOD[0]);
  stamp(c, armorStamp('skull'), 0, -148 + ty, 12, 12);
};

/** The cape from the front: its points flaring out behind him past his sides (drawn first: everything's over it). */
export const walkCapeBehind = (c: Ctx, ty: number, step: number) => {
  if (!has('cape')) return;
  const sway = Math.round(Math.sin(step - 0.5) * 2);
  for (const s of [-1, 1]) {
    const sw = s * sway;
    poly(c, [[s * 30, -144 + ty], [s * 50 + sw, -128 + ty], [s * 56 + sw * 1.5, -106 + ty], [s * 48 + sw, -110 + ty], [s * 44 + sw, -100 + ty], [s * 36, -104 + ty], [s * 28, -100 + ty]], WING[1]);
    box(c, s * 46 - (s > 0 ? 0 : 4) + sw, -124 + ty, 4, 10, WING[2]);
  }
};
/** ...and its collar over his traps from the front, the skull clasped at his throat. */
export const walkCapeCollar = (c: Ctx, ty: number) => {
  if (!has('cape')) return;
  for (const s of [-1, 1]) { poly(c, [[s * 12, -147 + ty], [s * 32, -142 + ty], [s * 32, -138 + ty], [s * 12, -142 + ty]], WOOD[2]); box(c, s * 22, -144 + ty, 1, 3, WOOD[0]); }
  stamp(c, armorStamp('skull'), 0, -141 + ty, 11, 11);
};
