// The clearing, painted (the final pass: peak SNES): the strip's own things (the orbit's backdrop is orbit.ts).
//
//   The path: packed dirt, its lit edge, ruts and pebbles, grass creeping in.
//   The junior guides' camp, back off the path (a tent, a campfire, their banner, a whistle board): dimmed back there.
//   The raised rock (a guide up on it): a boulder in its ramp, moss, its top lit (it's stood on).
//   The first-aid stop before the boss (the big health and ammo on a crate under its sign), the HUNTING AREA sign.
//   The trees going down like dominoes: real jungle trees (buttress roots, banded bark, a crown of leaves, vines);
//     down, they lie back off the path, dimmed (nothing to stand on); the last leans on the temple.
//   The temple's wing across the path: its stonework (the roof's, the dino park's), hit where the last tree struck it.
//   (Artie's hunting blind is tower.ts: stood out on the loop, coming round onto the strip.)
//   The fight: the bamboo fence behind him, the five bushes (lush, leaf on leaf, thinning as they're chewed down to
//     twigs), his vine (twisted, leafy, chewed thin where they've been at it).

import { INK, box, checker, mix, hash, pixelBlob, pole, text, stamp, dim } from '../../intro/art/kit';
import { STONE, MOSS, PLY, SHELL, DARK, stoneWall, vineDown, plaque, glyph } from '../roof/stone';
import { crown } from '../roof/art';
import { GY } from '../geometry';
import { x0, TREE_H, TEMPLE_X, ARENA_L, PICKUP_X, BUSH_W, BUSH_H } from './arena';

type Ctx = CanvasRenderingContext2D;
const r1 = (a: number, b = 0) => hash(a * 12.9898 + b * 78.233);

export const DIRT = ['#4E3A24', '#6E5638', '#8A6E4B', '#A88A5E', '#C4A878'];
export const LEAF = ['#0F2E16', '#1A4A22', '#27662C', '#3A8434', '#5CA444', '#8CCB5A'];
const BARK = ['#2A1A0E', '#432A16', '#5E3E20', '#7A5430', '#966C40'];

// ---------------------------------------------------------------------------------------------------------------
// The path

export const drawPath = (c: Ctx, L: number, R: number) => {
  L = Math.floor(L / 4) * 4;
  box(c, L, GY, R - L, 400, DIRT[2]);
  // (the lit edge, dithered down into it; darker going down, in bands)
  box(c, L, GY, R - L, 2, DIRT[4]); box(c, L, GY + 2, R - L, 3, DIRT[3]); checker(c, L, GY + 5, R - L, 2, DIRT[3]);
  box(c, L, GY + 40, R - L, 360, DIRT[1]); checker(c, L, GY + 38, R - L, 2, DIRT[1]);
  // (ruts along it, pebbles, tufts of grass at its edge)
  for (let x = Math.floor(L / 46) * 46; x < R; x += 46) {
    const s = r1(x, 1);
    box(c, x + s * 20, GY + 14 + (s > 0.5 ? 8 : 0), 14 + s * 10, 2, DIRT[1]);
    box(c, x + s * 20, GY + 16 + (s > 0.5 ? 8 : 0), 14 + s * 10, 1, DIRT[3]);
    if (s > 0.3) { box(c, x + 30 * s, GY + 26, 4, 3, DIRT[0]); box(c, x + 30 * s, GY + 26, 3, 1, DIRT[4]); }
    if (s > 0.6) { for (let k = 0; k < 4; k++) box(c, x + 8 + k * 2, GY - 4 - (k % 2) * 3, 2, 5 + (k % 2) * 3, k % 2 ? LEAF[3] : LEAF[2]); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The junior guides' camp, back off the path

const CAMP = x0 + 260;
export const drawCamp = (c: Ctx, f: number) => {
  stamp(c, 'clCamp', CAMP - 60, GY - 190, 420, 194, g => {
    const d = (col: string) => dim(col);
    // (the ground back there, going up to it)
    box(g, CAMP - 60, GY - 18, 420, 18, d(DIRT[2])); box(g, CAMP - 60, GY - 20, 420, 2, d(DIRT[3]));
    // The banner on its poles
    for (const px of [CAMP - 20, CAMP + 300]) pole(g, px, GY - 176, 6, 160, d('#8B6A3E'));
    g.strokeStyle = d('#5A3E1E'); g.lineWidth = 2; g.beginPath(); g.moveTo(CAMP - 16, GY - 170); g.quadraticCurveTo(CAMP + 140, GY - 156, CAMP + 302, GY - 170); g.stroke();
    plaque(g, CAMP + 143, GY - 150, 200, 22, d('#3F6212'), ['JUNIOR GUIDE CAMP'], d('#FDE68A'), 7);
    // The tent: canvas, in its ramp; its flap open, the dark in it
    const tx = CAMP + 40;
    g.fillStyle = INK; g.beginPath(); g.moveTo(tx - 2, GY - 18); g.lineTo(tx + 50, GY - 96); g.lineTo(tx + 102, GY - 18); g.fill();
    g.fillStyle = d('#B8A36A'); g.beginPath(); g.moveTo(tx, GY - 19); g.lineTo(tx + 50, GY - 93); g.lineTo(tx + 100, GY - 19); g.fill();
    g.fillStyle = d('#D6C28A'); g.beginPath(); g.moveTo(tx, GY - 19); g.lineTo(tx + 50, GY - 93); g.lineTo(tx + 34, GY - 19); g.fill();
    g.fillStyle = d('#2A2010'); g.beginPath(); g.moveTo(tx + 40, GY - 19); g.lineTo(tx + 50, GY - 66); g.lineTo(tx + 62, GY - 19); g.fill();
    // (a pith helmet on the tent pole, spikes up)
    box(g, tx + 44, GY - 104, 14, 6, d('#E7DDBE')); for (const sx of [46, 50, 54]) box(g, tx + sx, GY - 110, 2, 6, d('#CBD5E1'));
    // The whistle board: their rules, chalked
    const bx = CAMP + 200;
    pole(g, bx - 30, GY - 70, 4, 52, d('#8B6A3E')); pole(g, bx + 26, GY - 70, 4, 52, d('#8B6A3E'));
    box(g, bx - 36, GY - 92, 72, 44, INK); box(g, bx - 34, GY - 90, 68, 40, d('#2F3A2E'));
    for (const [i, t] of ['1. SALUTE', '2. WHISTLE', '3. STAB'].entries()) text(g, t, bx - 30, GY - 78 + i * 11, d('#E5E7EB'), 5, 'left', null);
    // (logs round the fire to sit on)
    for (const lx of [CAMP + 118, CAMP + 176]) { box(g, lx, GY - 30, 26, 10, d(BARK[2])); box(g, lx, GY - 30, 26, 2, d(BARK[4])); box(g, lx + 22, GY - 30, 4, 10, d(BARK[3])); }
  });
  // The campfire (live: it flickers; its light's a lamp)
  const fx = CAMP + 160, fy = GY - 22, fl = Math.floor(f / 4) % 3;
  for (let k = -2; k <= 2; k++) box(c, fx + k * 6 - 2, fy - 2, 6, 4, dim(k % 2 ? '#78716C' : '#A8A29E'));
  for (const [col, w, h] of [['#B91C1C', 10, 20], ['#F97316', 7, 15], ['#FDE047', 4, 8]] as const) {
    const hh = h + (fl === 1 ? 3 : 0);
    c.fillStyle = col; c.beginPath(); c.moveTo(fx - w, fy); c.quadraticCurveTo(fx - w * 0.5, fy - hh * 0.6, fx + (fl - 1) * 2, fy - hh); c.quadraticCurveTo(fx + w * 0.5, fy - hh * 0.6, fx + w, fy); c.fill();
  }
  // (sparks)
  for (let i = 0; i < 3; i++) { const t = (f + i * 23) % 60; box(c, fx + Math.sin(t * 0.2 + i) * 6, fy - 20 - t * 0.8, 2, 2, t < 30 ? '#FDE047' : '#F97316'); }
};
export const CAMPFIRE = { x: CAMP + 160, y: GY - 40 };
/** The tent's flap thrown back as a junior guide comes out (k: frames of it left): the dark of the tent opening wide,
 *  the flap swung aside. */
export const drawTentFlap = (c: Ctx, k: number) => {
  if (k <= 0) return;
  const tx = CAMP + 40, open = Math.min(1, k / 12);
  const d = (col: string) => dim(col);
  c.fillStyle = d('#1A1408'); c.beginPath(); c.moveTo(tx + 50 - 22 * open, GY - 19); c.lineTo(tx + 50, GY - 80); c.lineTo(tx + 50 + 22 * open, GY - 19); c.fill();
  c.fillStyle = d('#D6C28A'); c.beginPath(); c.moveTo(tx + 50, GY - 80); c.lineTo(tx + 50 - 22 * open, GY - 19); c.lineTo(tx + 50 - 34 * open, GY - 24); c.fill();
};
/** The camp's loudspeaker, up the banner's left pole (Artie's voice, sending them): where it is, where its words go. */
export const SPEAKER = { x: CAMP - 14, y: GY - 184 };
/** The loudspeaker: a gray horn on a bracket, turned out over the camp; it shakes a little while it's talking. */
export const drawSpeaker = (c: Ctx, talking: boolean, f: number) => {
  const x = SPEAKER.x, y = SPEAKER.y + (talking && (f >> 1) % 2 ? 1 : 0);
  const d = (col: string) => dim(col);
  box(c, x - 6, y + 2, 10, 3, INK); box(c, x - 5, y + 3, 8, 1, d('#6B7280'));
  // (the horn: narrow at the bracket, flaring out, its bell's mouth dark)
  c.fillStyle = INK; c.beginPath(); c.moveTo(x, y - 3); c.lineTo(x + 22, y - 11); c.lineTo(x + 22, y + 11); c.lineTo(x, y + 3); c.fill();
  c.fillStyle = d('#9CA3AF'); c.beginPath(); c.moveTo(x + 1, y - 2); c.lineTo(x + 20, y - 9); c.lineTo(x + 20, y + 9); c.lineTo(x + 1, y + 2); c.fill();
  c.fillStyle = d('#D1D5DB'); c.beginPath(); c.moveTo(x + 1, y - 2); c.lineTo(x + 20, y - 9); c.lineTo(x + 20, y - 6); c.lineTo(x + 1, y); c.fill();
  box(c, x + 19, y - 10, 4, 20, INK); box(c, x + 20, y - 8, 2, 16, d('#374151'));
  // (the sound off it, in steps)
  if (talking) for (let k = 0; k < 3; k++) { const r = 6 + k * 6 + ((f >> 2) % 3) * 2; c.strokeStyle = `rgba(253, 230, 138, ${0.5 - k * 0.15})`; c.lineWidth = 2; c.beginPath(); c.arc(x + 22, y, r, -0.7, 0.7); c.stroke(); }
};

// ---------------------------------------------------------------------------------------------------------------
// The rock, the signs, the first-aid stop

export const drawRock = (c: Ctx, x: number, w: number, h: number) => {
  stamp(c, `clRock:${x}`, x - 8, GY - h - 14, w + 16, h + 16, g => {
    const top = GY - h;
    // (the boulder: an ink edge, its ramp across it, lit up top and on the left)
    g.fillStyle = INK; g.beginPath(); g.moveTo(x - 4, GY); g.lineTo(x - 2, top + 10); g.lineTo(x + 8, top - 2); g.lineTo(x + w - 10, top - 2); g.lineTo(x + w + 2, top + 8); g.lineTo(x + w + 4, GY); g.fill();
    const R = ['#3E3A36', '#57524C', '#736C64', '#8F877D', '#ACA398', '#CBC2B4'];
    g.fillStyle = R[2]; g.beginPath(); g.moveTo(x - 2, GY); g.lineTo(x, top + 10); g.lineTo(x + 9, top); g.lineTo(x + w - 11, top); g.lineTo(x + w, top + 9); g.lineTo(x + w + 2, GY); g.fill();
    box(g, x + w * 0.62, top + 8, w * 0.38, h - 8, R[1]); checker(g, x + w * 0.56, top + 8, 6, h - 8, R[1]);
    box(g, x + 2, top + 10, 8, h - 12, R[3]); checker(g, x + 10, top + 10, 4, h - 12, R[3]);
    box(g, x + 14, top + 22, 22, 2, R[1]); box(g, x + 30, top + 30, 2, 12, R[1]); box(g, x + 14, top + 24, 22, 1, R[4]);
    // (its top: lit, flat enough to stand on)
    box(g, x + 6, top - 4, w - 12, 6, R[4]); box(g, x + 6, top - 4, w - 12, 2, R[5]);
    // (moss round its foot)
    for (let k = 0; k < w; k += 6) { const hh = 4 + r1(k, x) * 10; box(g, x + k - 2, GY - hh, 7, hh, MOSS[1]); checker(g, x + k - 2, GY - hh - 2, 7, 2, MOSS[2]); }
  });
};

/** A wooden sign on two posts: HUNTING AREA (antlers on top, a couple of bullet holes). */
export const drawHuntSign = (c: Ctx, x: number) => {
  stamp(c, 'clHunt', x - 70, GY - 132, 140, 134, g => {
    for (const px of [x - 44, x + 40]) { pole(g, px, GY - 90, 6, 90, '#7A5430'); box(g, px - 1, GY - 4, 8, 4, MOSS[1]); }
    plaque(g, x, GY - 80, 112, 38, '#8A5A2E', ['HUNTING AREA', 'TRESPASSERS', 'WILL BE STUFFED'], '#FDE68A', 5);
    for (const [hx, hy] of [[x + 38, GY - 92], [x - 30, GY - 70]]) { box(g, hx - 1, hy - 1, 4, 4, INK); box(g, hx, hy, 2, 2, '#1A0E06'); }
    // (antlers)
    g.strokeStyle = '#E7DCC0'; g.lineWidth = 3; g.beginPath();
    for (const s of [-1, 1]) { g.moveTo(x, GY - 100); g.quadraticCurveTo(x + s * 18, GY - 108, x + s * 24, GY - 126); g.moveTo(x + s * 12, GY - 106); g.lineTo(x + s * 8, GY - 120); g.moveTo(x + s * 20, GY - 114); g.lineTo(x + s * 30, GY - 118); }
    g.stroke();
    box(g, x - 6, GY - 104, 12, 8, '#8A5A2E'); box(g, x - 6, GY - 104, 12, 2, '#B07A44');
  });
};

/** Before the boss: a supply crate (what's on it is the big health and ammo) under a first-aid sign on a post. */
export const drawAidStop = (c: Ctx, stocked: boolean) => {
  const x = PICKUP_X - 10;
  stamp(c, `clAid:${stocked ? 1 : 0}`, x - 80, GY - 156, 200, 158, g => {
    pole(g, x + 60, GY - 120, 6, 120, '#7A5430');
    plaque(g, x + 63, GY - 126, 92, 32, '#F5F0E0', ['LAST CHANCE', 'FIRST AID'], '#B91C1C', 5);
    box(g, x + 59 - 6, GY - 150, 18, 12, INK); box(g, x + 57, GY - 149, 10, 10, '#F8FAFC'); box(g, x + 60, GY - 148, 4, 8, '#DC2626'); box(g, x + 58, GY - 146, 8, 4, '#DC2626');
    // (the crate it's all set out on, behind: planks, its lid ajar)
    box(g, x - 60, GY - 44, 100, 44, INK); box(g, x - 58, GY - 42, 96, 42, '#9A7444');
    for (let k = 0; k < 4; k++) { box(g, x - 58, GY - 42 + k * 11, 96, 1, '#6E5030'); box(g, x - 58, GY - 41 + k * 11, 96, 1, '#BE9660'); }
    box(g, x - 58, GY - 42, 4, 42, '#BE9660'); box(g, x + 34, GY - 42, 4, 42, '#6E5030');
    text(g, stocked ? 'PROPERTY OF S.A.' : 'EMPTY. SORRY.', x - 10, GY - 12, '#3A2410', 5, 'center', null);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The trees: standing, going over, down (back off the path, dimmed), the last leaning on the temple

/** One tree, its foot at (x, GY), turned `a` (radians, over to the right). `down`: lying back there, dimmed. */
export const drawTree = (c: Ctx, x: number, a: number, i: number, f: number, down: boolean) => {
  const d = (col: string) => (down ? dim(mix(col, INK, 0.3)) : col);
  c.save();
  // (down: lying back off the path, nothing of it below the path's edge; the bark's light turned away from its top)
  if (down) { c.beginPath(); c.rect(x - 400, GY - 600, 1000, 600 - 6); c.clip(); }
  c.translate(x, down ? GY - 30 : GY); c.rotate(a);
  const H = TREE_H;
  // (buttress roots, flaring out at the foot)
  for (const s of [-1, 1]) { c.fillStyle = d(BARK[1]); c.beginPath(); c.moveTo(s * 12, -50); c.quadraticCurveTo(s * 18, -10, s * 34, 0); c.lineTo(s * 8, 0); c.closePath(); c.fill(); }
  // (the trunk, banded: lit down its left, shadowed down its right, bark stripes)
  box(c, -16, -H, 32, H, d(INK));
  const bands = down ? [BARK[1], BARK[1], BARK[2], BARK[2], BARK[2], BARK[3], BARK[2]] : [BARK[3], BARK[4], BARK[3], BARK[2], BARK[2], BARK[1], BARK[1]];
  bands.forEach((col, k) => box(c, -15 + k * 4.3, -H, 4.6, H, d(col)));
  for (let y = -H + 12; y < -8; y += 18) { const s = r1(y, i); box(c, -12 + s * 10, y, 8, 2, d(BARK[0])); box(c, -12 + s * 10, y + 2, 8, 1, d(BARK[4])); }
  // (a vine round it, a few leaves)
  vineDown(c, -6, -H + 30, H - 70, i);
  // (the crown: clumps of leaves in their ramp, hanging vines)
  const ramp = [LEAF[1], LEAF[2], LEAF[3], LEAF[5]].map(d);
  for (const [dx, dy, r] of [[-46, 26, 40], [44, 24, 40], [0, -12, 52], [-24, 2, 40], [26, 4, 40]] as const) crown(c, dx, -H + dy, r, ramp);
  for (const vx of [-52, -20, 30, 56]) { box(c, vx, -H + 40, 2, 40 + ((vx * 7) % 30), d(LEAF[1])); box(c, vx - 2, -H + 70 + ((vx * 7) % 30), 6, 4, d(LEAF[3])); }
  // (a toucan up there, not that anyone's looking)
  if (i === 2 && !down && a < 0.05) { const bob = Math.floor(f / 30) % 2; box(c, 20, -H - 30 - bob, 10, 8, INK); box(c, 21, -H - 29 - bob, 8, 6, '#1C1917'); box(c, 29, -H - 29 - bob, 8, 4, '#F97316'); box(c, 22, -H - 27 - bob, 2, 2, '#F8FAFC'); }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The temple's wing across the path

export const drawWing = (c: Ctx, hit: boolean) => {
  stamp(c, `clWing:${hit ? 1 : 0}`, TEMPLE_X - 60, GY - 320, 1000, 324, g => {
    stoneWall(g, TEMPLE_X + 40, GY - 300, 900, 80, 41, { seams: 192, base: 3 });
    stoneWall(g, TEMPLE_X, GY - 220, 900, 220, 29, { seams: 192, moss: 0.3, glyphs: true });
    // (its corner going back: the end of it, in shadow)
    box(g, TEMPLE_X, GY - 220, 8, 220, STONE[2]); checker(g, TEMPLE_X + 8, GY - 220, 4, 220, STONE[2]);
    // (the cornices: dark-capped, not lit like somewhere to stand)
    box(g, TEMPLE_X, GY - 224, 900, 6, STONE[3]); box(g, TEMPLE_X, GY - 218, 900, 3, STONE[1]);
    box(g, TEMPLE_X + 40, GY - 304, 900, 6, STONE[2]);
    for (let x = TEMPLE_X + 80; x < TEMPLE_X + 860; x += 140) glyph(g, x, GY - 260, STONE[3]);
    for (let i = 0; i < 6; i++) vineDown(g, TEMPLE_X + 20 + i * 47 + r1(i) * 20, GY - 218, 60 + r1(i, 2) * 120, i);
    if (!hit) return;
    // (where the last tree hit it: a crater, cracks out from it, a panel cracked off (the plywood), rubble at its foot)
    const hx = TEMPLE_X + 18, hy = GY - 230;
    g.fillStyle = INK; g.beginPath();
    for (let k = 0; k < 16; k++) { const ang = (k / 16) * Math.PI * 2, rr = 27 + r1(k, 5) * 5; g.lineTo(hx + Math.cos(ang) * rr, hy + Math.sin(ang) * rr * 0.9); }
    g.fill();
    g.fillStyle = PLY[1]; g.beginPath();
    for (let k = 0; k < 16; k++) { const ang = (k / 16) * Math.PI * 2, rr = 23 + r1(k, 5) * 4; g.lineTo(hx + Math.cos(ang) * rr, hy + Math.sin(ang) * rr * 0.9); }
    g.fill();
    box(g, hx - 14, hy - 20, 4, 40, PLY[2]); box(g, hx + 4, hy - 22, 4, 44, PLY[0]); box(g, hx - 10, hy - 6, 24, 8, DARK);
    box(g, hx - 26, hy - 2, 4, 10, SHELL); box(g, hx + 22, hy - 8, 4, 12, SHELL);
    g.strokeStyle = STONE[0]; g.lineWidth = 2;
    for (const [dx, dy] of [[70, -50], [90, 30], [40, 80], [120, -10], [30, -70]] as const) { g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + dx * 0.5, hy + dy * 0.4 + 6); g.lineTo(hx + dx, hy + dy); g.stroke(); }
    for (let i = 0; i < 9; i++) { const s = 8 + r1(i, 4) * 12, rx = TEMPLE_X - 50 + i * 12; box(g, rx, GY - s, s * 1.3, s, STONE[3]); box(g, rx, GY - s, s * 1.3, 2, STONE[5]); box(g, rx + s * 1.3 - 2, GY - s, 2, s, STONE[1]); }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The fight's: the fence, the bushes, his vine

/** The bamboo fence that goes up behind him for the fight (lashed poles, cut to points). */
export const drawFence = (c: Ctx, top: number) => {
  const x = ARENA_L - 30;
  for (let k = 0; k < 5; k++) {
    const px = x + k * 6, h = GY - top - (k % 2) * 10;
    box(c, px, GY - h, 6, h, INK); box(c, px + 1, GY - h, 4, h, k % 2 ? '#B89048' : '#D4AC60'); box(c, px + 1, GY - h, 1, h, '#EED08A');
    for (let y = GY - h + 30; y < GY; y += 34) box(c, px + 1, y, 4, 2, '#7A5A2A');
    c.fillStyle = INK; c.beginPath(); c.moveTo(px, GY - h); c.lineTo(px + 3, GY - h - 10); c.lineTo(px + 6, GY - h); c.fill();
  }
  for (let y = GY - 60; y > top; y -= 90) { box(c, x - 2, y, 34, 5, '#6E5030'); box(c, x - 2, y, 34, 1, '#A07A4A'); }
};

/** A bush's leaf clusters (each a cluster of leaves: its middle, its size), outer ones first to go. */
const CLUSTERS: [number, number, number][] = [
  // (its spread at the ends, reaching to the next one's: no gap between them along the row; the first eaten away)
  [-68, -16, 15], [68, -16, 15], [-62, -36, 13], [62, -36, 13],
  [-50, -14, 18], [50, -14, 18], [-36, -44, 20], [36, -44, 20], [0, -58, 22], [-18, -56, 18], [20, -58, 18],
  [-52, -30, 16], [52, -30, 16], [-30, -20, 22], [30, -20, 22], [0, -34, 26], [-12, -14, 22], [14, -14, 22],
];
/** Each cluster's leaves (where round its middle). */
const LEAVES = Array.from({ length: 9 }, (_, k) => { const a = (k / 9) * Math.PI * 2 + 0.3; return [Math.cos(a), Math.sin(a) * 0.8] as const; });

const leafCluster = (g: Ctx, x: number, y: number, r: number, seed: number) => {
  pixelBlob(g, x + 2, y + 3, r, r * 0.8, LEAF[0]);
  pixelBlob(g, x, y, r * 0.9, r * 0.72, LEAF[2]);
  // (the leaves round its edge: little pointed ovals, lit on top)
  for (const [lx, ly] of LEAVES) {
    const px = x + lx * r * 0.85, py = y + ly * r * 0.8;
    const col = ly < -0.2 ? LEAF[4] : ly > 0.3 ? LEAF[1] : LEAF[3];
    g.fillStyle = col; g.beginPath(); g.ellipse(px, py, 5, 3, Math.atan2(ly, lx), 0, Math.PI * 2); g.fill();
  }
  pixelBlob(g, x - r * 0.25, y - r * 0.28, r * 0.4, r * 0.26, LEAF[4]);
  box(g, x - r * 0.3, y - r * 0.4, 2, 2, LEAF[5]);
  if (seed % 4 === 0) { box(g, x + 4, y - 2, 3, 3, '#DC2626'); box(g, x + 4, y - 2, 1, 1, '#FCA5A5'); box(g, x - 6, y + 4, 3, 3, '#DC2626'); }
};

/**
 * A bush, its middle at x, on the ground: `k` how much of it's left (1 whole .. 0 gone: twigs, leaves on the ground).
 * `fringe`: just its front leaves (over whoever's in it). Painted once per step of thinning.
 */
export const drawBushArt = (c: Ctx, x: number, k: number, gone: boolean, fringe: boolean, flip = false) => {
  const step = gone ? 0 : Math.max(1, Math.ceil(k * 7));
  const key = `clBush:${step}:${fringe ? 1 : 0}`;
  c.save(); c.translate(Math.round(x), GY);
  // (every other one mirrored: a row of five that isn't one bush five times over)
  if (flip) c.scale(-1, 1);
  stamp(c, key, -BUSH_W / 2 - 16, -BUSH_H - 20, BUSH_W + 32, BUSH_H + 24, g => {
    const n = step === 0 ? 0 : Math.round((CLUSTERS.length * step) / 7);
    if (fringe) {
      // (the front of it: the lowest clusters, along the bottom)
      CLUSTERS.forEach(([cx, cy, r], i) => { if (i >= CLUSTERS.length - n && cy > -24) leafCluster(g, cx, cy + 4, r * 0.9, i); });
      return;
    }
    // twigs (showing more the more it's eaten)
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath();
    for (const [tx, a] of [[-30, -0.5], [-8, -0.15], [12, 0.2], [34, 0.55]] as const) { g.moveTo(tx * 0.4, 0); g.lineTo(tx + Math.sin(a) * 30, -38 - Math.abs(tx) * 0.2); }
    g.stroke();
    g.strokeStyle = '#6A4A28'; g.lineWidth = 2; g.beginPath();
    for (const [tx, a] of [[-30, -0.5], [-8, -0.15], [12, 0.2], [34, 0.55]] as const) { g.moveTo(tx * 0.4, 0); g.lineTo(tx + Math.sin(a) * 30, -38 - Math.abs(tx) * 0.2); g.moveTo(tx * 0.7 + Math.sin(a) * 15, -20); g.lineTo(tx * 0.7 + Math.sin(a) * 15 + (tx > 0 ? 10 : -10), -30); }
    g.stroke();
    // (the leaves that've come off it, on the ground, the more the more it's eaten)
    for (let i = 0; i < 7 - step + (step === 0 ? 3 : 0); i++) { const lx = -52 + r1(i, 3) * 104; box(g, lx, -3, 6, 3, i % 2 ? LEAF[2] : '#7A8A34'); box(g, lx, -3, 6, 1, LEAF[4]); }
    if (step === 0) return;
    // (what's left of it: the inner clusters last to go)
    CLUSTERS.forEach(([cx, cy, r], i) => { if (i >= CLUSTERS.length - n) leafCluster(g, cx, cy, r, i); });
    // (bitten: ragged gaps, the twigs through them, crumbs)
    if (step < 7) for (let i = 0; i < 7 - step; i++) { const bx = -40 + r1(i, step) * 80, by = -50 + r1(i, step + 1) * 36; box(g, bx, by, 3, 3, LEAF[0]); box(g, bx + 4, by + 2, 2, 2, '#7A8A34'); }
  });
  c.restore();
};

/** His vine: twisted, leafy, from up out of sight down to his hands; chewed thin round `ny` (k: how much is left). */
export const drawVine = (c: Ctx, x: number, top: number, bottom: number, ny: number, k: number) => {
  for (let y = Math.floor(top / 6) * 6; y < bottom; y += 6) {
    const chewed = Math.abs(y - ny) < 9;
    const w = chewed ? Math.max(1, Math.round(4 * k)) : 4;
    const tw = Math.floor(y / 6) % 2;
    box(c, x - w / 2 - 1, y, w + 2, 6, INK);
    box(c, x - w / 2, y, w, 6, MOSS[1]); if (w > 2) box(c, x - w / 2 + (tw ? 0 : w - 2), y, 2, 6, MOSS[3]);
    if (!chewed && Math.floor(y / 6) % 4 === 0) { const s = Math.floor(y / 24) % 2 ? 1 : -1; c.fillStyle = LEAF[3]; c.beginPath(); c.ellipse(x + s * 7, y + 3, 6, 3, s * 0.5, 0, Math.PI * 2); c.fill(); box(c, x + s * 7 - 2, y + 1, 3, 1, LEAF[5]); }
  }
  if (k < 1) for (const sd of [-1, 1]) { box(c, x + sd * (2 + (1 - k) * 4), ny - 2, 2, 1, '#A3E635'); box(c, x + sd * (3 + (1 - k) * 7), ny + 2, 2, 1, '#A3E635'); }
};
