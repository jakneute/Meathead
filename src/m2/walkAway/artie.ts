// The walk-away from Safari Artie (Adventure Land's boss): the clearing at whatever hour it is now
// (timeOfDay.ts: its look was painted for sundown, and goes by day and by night too), wrecked. The temple behind him with
// its roof caved in and the tree that went into it, both burning; the ground trampled to dirt by the stampede, hoof
// prints all over it; the bushes chewed down to stalks; a hippo on its back, legs up; an elephant's leg, standing there
// on its own; Artie's gift-shop parachute (I HEART ADVENTURE LAND, the $9.99 tag still on it) caught on a stalk; his
// pith helmet. And Artie: beaten, face down with his rear in the air, the flies on him, and every so often one more
// goes out of him; or eaten by the litter (his weakness), a heap of bones in tube socks, boots and heart boxers, the
// skull off on its own, the buck teeth out of it, a vulture picking it over, the burst little goblins round it.
// His new toy: the CROSSBOW OF PLAGUES.

import {
  type Ctx, type Prop, type SceneDef, INK, LW, HOR, ME_X, box, hash, lump, poly, rampOf, stipple, fire, smoke, flies,
} from './kit';
import { mix } from '../../m1/game/render/backdrops/core';
import { timeOfDay, hourMix, sunAt, drawStars, drawMoon } from '../timeOfDay';
import { noteSun } from '../sunFlare';

const STONE = rampOf('#8A7766');
const MOSS = ['#2E3A14', '#3F5219', '#56701F'];
const BARK = ['#24140A', '#3B2412', '#5B3A1C', '#7A5230', '#9A7048'];
const LEAF = ['#13240F', '#1E3A16', '#2D5220', '#3F6E2A', '#5A8C38'];
const KHAKI = rampOf('#B8A06A');
const SHORTS = rampOf('#8C7A4A');
const BONE = ['#6B6355', '#A8A08C', '#D6CFBA', '#EEE8D4', '#FFFFF4'];
const HIPPO = rampOf('#8B7A99');
const ELE = rampOf('#9CA3AF');
const BLOOD = ['#3B0606', '#6B0F0F', '#991B1B', '#C53030'];
const GOB = ['#14532D', '#3F7A1E', '#6CB33A', '#A3E35A'];

// ---------------------------------------------------------------------------------------------------------------
// The ground: trampled dirt, the path down the middle, hoof prints, flattened grass, blood

const ground = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, '#6E5034');
  // (grass, what's left of it: flattened, in the stampede's direction)
  for (let i = 0; i < 70; i++) {
    const x = hash(i * 3.1) * w, y = hash(i * 7.7) * h;
    if (Math.abs(x - w / 2) < 26) continue;
    g.fillStyle = i % 3 ? '#4A5F26' : '#5B7330';
    g.beginPath(); g.ellipse(x, y, 6 + hash(i) * 12, 4 + hash(i + 9) * 7, 0, 0, Math.PI * 2); g.fill();
    for (let k = 0; k < 6; k++) box(g, x - 8 + k * 3, y - 3 + (k % 2) * 3, 4, 1, '#3A4A1C');
  }
  // (speckled dirt)
  for (let i = 0; i < 900; i++) box(g, hash(i * 1.37) * w, hash(i * 2.91) * h, 1 + (i % 3 === 0 ? 1 : 0), 1, ['#5C422A', '#7E5E3E', '#634830', '#8A6A48'][i % 4]);
  // The path: lighter, packed, the edges broken up
  box(g, w / 2 - 20, 0, 40, h, '#8E6E48');
  for (let y = 0; y < h; y += 2) { box(g, w / 2 - 22 + hash(y) * 3, y, 3, 2, '#7A5C3C'); box(g, w / 2 + 19 + hash(y + 5) * 3, y, 3, 2, '#7A5C3C'); }
  for (let i = 0; i < 160; i++) box(g, w / 2 - 18 + hash(i * 5.3) * 36, hash(i * 9.1) * h, 1, 1, i % 2 ? '#A8865A' : '#7A5C3C');
  // Ruts: the stampede's way across
  for (let i = 0; i < 5; i++) { const y = hash(i * 13) * h; box(g, 0, y, w, 2, '#5A4029'); box(g, 0, y + 2, w, 1, '#8E6E48'); }
  // Hoof prints, all over
  for (let i = 0; i < 120; i++) {
    const x = hash(i * 4.3 + 1) * w, y = hash(i * 6.1 + 2) * h, big = hash(i * 8.8) > 0.6;
    g.fillStyle = '#3E2A18'; g.beginPath(); g.ellipse(x, y, big ? 4 : 2.5, big ? 3 : 2, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#86663F'; g.fillRect(Math.round(x - 1), Math.round(y + (big ? 3 : 2)), big ? 4 : 2, 1);
    if (big) { g.fillStyle = '#3E2A18'; g.fillRect(Math.round(x + 5), Math.round(y - 1), 2, 2); }
  }
  // Blood, here and there
  for (let i = 0; i < 9; i++) {
    const x = hash(i * 17.3) * w, y = hash(i * 23.9) * h;
    g.fillStyle = BLOOD[1]; g.beginPath(); g.ellipse(x, y, 7 + hash(i) * 6, 4 + hash(i + 1) * 3, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = BLOOD[2]; g.beginPath(); g.ellipse(x - 1, y - 1, 4, 2, 0, 0, Math.PI * 2); g.fill();
    for (let k = 0; k < 4; k++) box(g, x + (hash(i + k) - 0.5) * 30, y + (hash(i * 2 + k) - 0.5) * 14, 2, 1, BLOOD[1]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The sky's furniture: the sun going down, the clouds, the hills (Adventure Land's coaster out on them), the jungle

const back = (c: Ctx, t: number, sway: number) => {
  // (whatever hour he's walking off at: timeOfDay.ts. The art's own sundown look, and its day and night)
  const tod = timeOfDay();
  const H = (day: string, sundown: string, night: string) => hourMix(day, sundown, night, tod);
  // After dark: the stars, the moon over the hills
  drawStars(c, 0, 0, LW, HOR - 10, t, 0, tod, 1);
  drawMoon(c, 56, 20, 8, tod);
  // The sun, behind the jungle (low at sundown, high by day): stepped glow, a banded disk, the old cut-out stripes
  // across its bottom half once it's low
  const sp = sunAt(118 + sway * 0.1, 22, HOR, tod), sx = sp.x, sy = sp.y;
  // (its glare, in this scene's own pixels (half the screen's), behind the jungle; drawWalkAway puts the lens's ghosts
  // over the picture: sunFlare.ts)
  noteSun(c, sx, sy, 1, 1, 0.5);
  if (sp.up > 0.02) {
    const [gr, gg, gb] = [1, 3, 5].map(i => parseInt(tod.sunGlow.slice(i, i + 2), 16));
    c.save(); c.globalAlpha = sp.up;
    for (let i = 5; i >= 1; i--) { c.fillStyle = `rgba(${gr}, ${gg}, ${gb}, ${0.06 + (5 - i) * 0.035})`; c.beginPath(); c.arc(sx, sy, 22 + i * 9, 0, Math.PI * 2); c.fill(); }
    const sun = [mix(tod.sun, '#FFFFFF', 0.7), mix(tod.sun, '#FFFFFF', 0.3), tod.sun, mix(tod.sun, tod.sunGlow, 0.5), tod.sunGlow];
    for (let i = 0; i < sun.length; i++) {
      c.save(); c.beginPath(); c.rect(sx - 24, sy - 24 + i * 9.6, 48, 9.6); c.clip();
      c.fillStyle = sun[i]; c.beginPath(); c.arc(sx, sy, 22, 0, Math.PI * 2); c.fill(); c.restore();
    }
    if (tod.sunH < 0.45) for (let i = 0; i < 4; i++) box(c, sx - 24, sy + 2 + i * 5, 48, 1 + Math.floor(i / 2), tod.sunGlow);
    c.restore();
  }
  // Clouds: two strata, drifting, lit from under by the sun
  const strip = (y: number, len: number, th: number, x: number, col: string, lit: string) => {
    c.fillStyle = col; c.beginPath(); c.roundRect(Math.round(x), y, len, th, th / 2); c.fill();
    c.fillStyle = lit; c.fillRect(Math.round(x + th / 2), y + th - 1, len - th, 1);
  };
  const hi = [H('#E8EEF8', '#3E1B57', '#262C52'), H('#FFFFFF', '#B04A5A', '#4A5284')];
  const lo = [H('#D2DCEC', '#6E2A57', '#2E355E'), H('#FFFFFF', '#F2995A', '#5A6294')];
  for (let i = 0; i < 6; i++) {
    const x = ((i * 97 - t * 0.04) % (LW + 160) + LW + 160) % (LW + 160) - 120;
    strip(14 + (i % 3) * 8, 60 + (i % 2) * 40, 4, x, hi[0], hi[1]);
  }
  for (let i = 0; i < 5; i++) {
    const x = ((i * 131 - t * 0.11) % (LW + 200) + LW + 200) % (LW + 200) - 140;
    strip(40 + (i % 2) * 9, 80 + (i % 3) * 30, 5, x, lo[0], lo[1]);
  }
  // The hills, far off (dim), the coaster's loop up on them
  const hx = sway * 0.15;
  c.fillStyle = H('#7E9AAE', '#6A3462', '#1C2244');
  c.beginPath(); c.moveTo(0, HOR);
  for (let x = 0; x <= LW; x += 2) c.lineTo(x, HOR - 16 - Math.round(7 * Math.sin((x + hx) * 0.021) + 4 * Math.sin((x + hx) * 0.057 + 1)));
  c.lineTo(LW, HOR); c.fill();
  const coaster = H('#5E7A90', '#4C2450', '#141834');
  c.strokeStyle = coaster; c.lineWidth = 1;
  const lx = 330 + hx;
  c.beginPath(); c.arc(lx, HOR - 30, 8, 0, Math.PI * 2); c.stroke();
  c.beginPath(); c.moveTo(lx - 40, HOR - 18); c.quadraticCurveTo(lx - 20, HOR - 34, lx, HOR - 22); c.quadraticCurveTo(lx + 22, HOR - 12, lx + 50, HOR - 26); c.stroke();
  for (let k = -36; k < 50; k += 6) box(c, lx + k, HOR - 24 + Math.abs(k) * 0.08, 1, 10, coaster);
  // The jungle: a wall of canopy (lumps, their tops caught by the sun), palms over it; a gap where the trees went down
  // like dominoes
  const jx = sway * 0.35;
  const canopy = (x: number) => 9 + Math.round(5 * Math.abs(Math.sin((x + jx) * 0.07)) + 4 * Math.abs(Math.sin((x + jx) * 0.023 + 2)));
  const gap = (x: number) => x > 236 && x < 300;
  const jungle = H('#2C4A26', '#2B1B36', '#0C1024'), jungleLit = H('#5A8034', '#5A2E4A', '#222A4C');
  c.fillStyle = jungle;
  c.beginPath(); c.moveTo(0, HOR + 1);
  for (let x = 0; x <= LW; x += 2) c.lineTo(x, HOR - (gap(x) ? 2 : canopy(x)));
  c.lineTo(LW, HOR + 1); c.fill();
  for (let x = 0; x < LW; x += 2) if (!gap(x)) { const y = HOR - canopy(x); box(c, x, y, 2, 1, jungleLit); if (x % 6 === 0) box(c, x, y + 1, 1, 1, mix(jungle, jungleLit, 0.5)); }
  for (let i = 0; i < 9; i++) {
    const px = ((i * 47 + 13) % LW) + jx;
    if (px > 226 && px < 310) continue;
    const top = HOR - 26 - (i % 3) * 5, lean = (i % 2 ? 1 : -1) * 3;
    // (the trunk, curved; the fronds drooping off its crown)
    c.strokeStyle = jungle; c.lineWidth = 2; c.beginPath(); c.moveTo(px, HOR - 6); c.quadraticCurveTo(px + lean * 0.3, (top + HOR) / 2, px + lean, top); c.stroke();
    for (const [dx, dy] of [[-9, 4], [9, 4], [-7, -2], [7, -2], [-4, 6], [4, 6], [0, -4]]) {
      c.beginPath(); c.moveTo(px + lean, top); c.quadraticCurveTo(px + lean + dx * 0.6, top + Math.min(0, dy) - 3, px + lean + dx, top + dy); c.stroke();
    }
    box(c, px + lean - 1, top - 1, 3, 2, jungleLit);
  }
  // (the stumps in the gap, splintered)
  for (let i = 0; i < 4; i++) box(c, 244 + i * 15 + jx, HOR - 4 - (i % 2), 2, 4 + (i % 2), H('#4A3420', '#3A2440', '#121428'));
};

// ---------------------------------------------------------------------------------------------------------------
// The wreckage

/** The temple, its roof caved in, the tree that went into it leaning on it (26 m by 13 m; its feet at the middle). */
const paintTemple = (g: Ctx, w: number, h: number) => {
  const tier = (x0: number, x1: number, y0: number, y1: number) => {
    box(g, x0 - 1, y0 - 1, x1 - x0 + 2, y1 - y0 + 2, INK);
    box(g, x0, y0, x1 - x0, y1 - y0, STONE[2]);
    box(g, x0, y0, x1 - x0, 3, STONE[3]); box(g, x0, y0, x1 - x0, 1, STONE[4]);
    box(g, x1 - 12, y0 + 3, 12, y1 - y0 - 3, STONE[1]); g.fillStyle = stipple(g, STONE[1]); g.fillRect(x1 - 16, y0 + 3, 4, y1 - y0 - 3);
    box(g, x0, y1 - 3, x1 - x0, 3, STONE[1]);
    for (let y = y0 + 8; y < y1 - 2; y += 7) {
      box(g, x0, y, x1 - x0, 1, STONE[1]);
      for (let x = x0 + ((y / 7) % 2) * 8; x < x1; x += 16) box(g, x, y - 6, 1, 6, STONE[1]);
    }
    // (moss down it, vines off its lip)
    for (let i = 0; i < 6; i++) { const mx = x0 + hash(x0 + i) * (x1 - x0 - 20); g.fillStyle = stipple(g, MOSS[1 + (i % 2)], i % 2); g.fillRect(mx, y0, 14 + hash(i) * 10, 6 + hash(i + 3) * 10); }
    for (let i = 0; i < 5; i++) { const vx = x0 + 6 + hash(y0 + i * 3) * (x1 - x0 - 12); box(g, vx, y0, 1, 6 + hash(i * 7) * 14, MOSS[2]); }
  };
  const L = 46, H = h;
  tier(L, L + 200, H - 40, H);
  tier(L + 24, L + 176, H - 74, H - 40);
  tier(L + 48, L + 152, H - 104, H - 74);
  // (the stairs up the front)
  for (let y = H - 104; y < H; y += 4) { box(g, L + 86, y, 28, 3, STONE[3]); box(g, L + 86, y + 3, 28, 1, STONE[0]); }
  box(g, L + 85, H - 104, 1, 104, INK); box(g, L + 114, H - 104, 1, 104, INK);
  // The roof, caved in: the top broken off jagged, a black hole down into it, slabs tipped up round the edge
  poly(g, [[L + 52, H - 104], [L + 64, H - 112], [L + 74, H - 106], [L + 90, H - 118], [L + 104, H - 108], [L + 118, H - 120], [L + 132, H - 108], [L + 148, H - 112], [L + 152, H - 104]], STONE[2]);
  poly(g, [[L + 66, H - 104], [L + 78, H - 96], [L + 96, H - 92], [L + 120, H - 95], [L + 136, H - 102], [L + 128, H - 108], [L + 104, H - 106], [L + 84, H - 110]], '#140C10');
  for (const [x, y, a] of [[L + 70, H - 112, -0.4], [L + 128, H - 116, 0.5], [L + 98, H - 118, 0.2]] as const) {
    g.save(); g.translate(x, y); g.rotate(a); box(g, -7, -4, 14, 8, INK); box(g, -6, -3, 12, 6, STONE[3]); box(g, -6, 1, 12, 2, STONE[1]); g.restore();
  }
  // (the doorway at the top of the stairs, half shut with rubble)
  box(g, L + 92, H - 100, 16, 18, '#140C10'); box(g, L + 91, H - 101, 18, 2, STONE[0]);
  // Rubble down the stairs and at its foot
  for (let i = 0; i < 18; i++) {
    const rx = L + 30 + hash(i * 5.1) * 150, ry = H - 2 - hash(i * 3.3) * (i < 10 ? 6 : 40);
    lump(g, rx, ry, 3 + hash(i) * 4, 2 + hash(i + 2) * 3, STONE);
  }
  // The tree that went into it: torn up by the roots on the left, its trunk leaning up into the hole, the crown crushed
  // onto the roof
  const bx = 14, by = H - 2, tx = L + 92, ty = H - 104;
  const steps = 26;
  for (let i = 0; i <= steps; i++) {
    const k = i / steps, x = bx + (tx - bx) * k, y = by + (ty - by) * k, r = 8 - k * 3;
    g.fillStyle = INK; g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fill();
  }
  for (let i = 0; i <= steps; i++) {
    const k = i / steps, x = bx + (tx - bx) * k, y = by + (ty - by) * k, r = 8 - k * 3;
    g.fillStyle = BARK[2]; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    box(g, x - r * 0.6, y - r * 0.7, r * 0.8, 2, BARK[3]);
    if (i % 3 === 0) box(g, x - 1, y - 1, 3, 1, BARK[1]);
  }
  // (the roots, up out of the ground in a clod)
  lump(g, bx - 4, by - 6, 12, 9, ['#2A1A0E', '#4A3220', '#6A4C30', '#7E5E3E', '#8E6E48']);
  for (let i = 0; i < 7; i++) { g.strokeStyle = BARK[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(bx - 4, by - 6); g.lineTo(bx - 18 + i * 4, by - 18 + hash(i) * 22); g.stroke(); }
  // (the crown, crushed on the roof: leaves stepped, some of it browned)
  for (const [x, y, r] of [[tx - 22, ty - 4, 14], [tx + 4, ty - 14, 16], [tx + 26, ty - 6, 12], [tx - 6, ty + 6, 11], [tx + 14, ty + 4, 10]] as const) lump(g, x, y, r, r * 0.75, LEAF);
  for (let i = 0; i < 10; i++) box(g, tx - 30 + hash(i * 2.2) * 60, ty - 20 + hash(i * 4.4) * 26, 3, 2, i % 3 ? '#7A5A20' : '#9A7030');
  // The other trees, down at its foot (the dominoes), lying in a row
  for (let i = 0; i < 3; i++) { const y = H - 4 - i * 2; box(g, 0, y - 4, 50 - i * 8, 6, INK); box(g, 1, y - 3, 48 - i * 8, 4, BARK[2]); box(g, 1, y - 3, 48 - i * 8, 1, BARK[3]); }
  void w;
};

/** A bush chewed down to stalks (by the litter): stubs, ragged, a leaf or two left. */
const paintStalks = (g: Ctx, w: number, h: number) => {
  for (let i = 0; i < 9; i++) {
    const x = 3 + (i / 8) * (w - 6), sh = h * (0.35 + hash(i * 3.7) * 0.6);
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2, h); g.lineTo(x, h - sh); g.stroke();
    g.strokeStyle = i % 2 ? '#6B5A2A' : '#857040'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(w / 2, h); g.lineTo(x, h - sh); g.stroke();
    box(g, x - 1, h - sh - 1, 3, 2, '#B8A070');
    if (i % 4 === 1) box(g, x + 1, h - sh * 0.6, 3, 2, LEAF[3]);
  }
  g.fillStyle = '#3A2A18'; g.beginPath(); g.ellipse(w / 2, h - 1, w / 3, 2, 0, 0, Math.PI * 2); g.fill();
};

/** Artie, beaten: face down, rear up in the air (Meathead 1's standard death, his way). Side on, his head on the left. */
const paintArtieFlat = (g: Ctx, w: number, h: number) => {
  const gy = h - 2;
  g.fillStyle = BLOOD[1]; g.beginPath(); g.ellipse(10, gy, 9, 2, 0, 0, Math.PI * 2); g.fill();
  // (his arm, flopped out in front, palm up)
  poly(g, [[4, gy - 3], [18, gy - 4], [18, gy - 1], [4, gy]], KHAKI[2]);
  lump(g, 3, gy - 2, 3, 2, rampOf('#E8A37A'));
  // (his back: the shirt, sloping up to his rear)
  poly(g, [[12, gy - 1], [12, gy - 10], [22, gy - 16], [32, gy - 22], [36, gy - 14], [30, gy - 2]], KHAKI[2]);
  box(g, 14, gy - 12, 12, 2, KHAKI[3]); box(g, 20, gy - 8, 8, 3, '#8A6A2A');
  // (his rear, up in the air: the khaki shorts torn, the heart boxers showing)
  lump(g, 38, gy - 24, 8, 7, SHORTS);
  g.fillStyle = '#DC2626'; g.beginPath(); g.ellipse(40, gy - 25, 4, 3, 0.3, 0, Math.PI * 2); g.fill();
  box(g, 39, gy - 26, 1, 1, '#FBCFE8'); box(g, 41, gy - 24, 1, 1, '#FBCFE8');
  // (his legs folded under: knees down, the tube socks, the boots sole up)
  poly(g, [[36, gy - 18], [44, gy - 18], [46, gy - 2], [38, gy - 2]], SHORTS[2]);
  box(g, 44, gy - 9, 6, 7, '#F1EFEA'); box(g, 44, gy - 8, 6, 1, '#DC2626'); box(g, 44, gy - 6, 6, 1, '#1D4ED8');
  box(g, 49, gy - 10, 6, 9, INK); box(g, 50, gy - 9, 4, 7, '#5B3A1C'); box(g, 50, gy - 9, 1, 7, '#7A5230');
  // (his head in the dirt: the mullet, an ear, the sunburn on his neck)
  lump(g, 11, gy - 5, 5, 4, rampOf('#D9825E'));
  poly(g, [[8, gy - 9], [16, gy - 10], [20, gy - 6], [17, gy - 2], [12, gy - 4]], '#6B4423');
  for (let i = 0; i < 4; i++) box(g, 14 + i * 2, gy - 3 + (i % 2), 2, 3, '#5A3A1E');
  void w;
};

/** Artie, eaten (his weakness): a heap of bones, still in his tube socks, boots and heart boxers; the goblins, burst. */
const paintBones = (g: Ctx, w: number, h: number) => {
  const gy = h - 2;
  g.fillStyle = BLOOD[1]; g.beginPath(); g.ellipse(w / 2, gy, w / 2 - 2, 3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = BLOOD[2]; g.beginPath(); g.ellipse(w / 2 - 4, gy - 1, w / 4, 1.5, 0, 0, Math.PI * 2); g.fill();
  // (burst goblins, splattered round it)
  for (const [x, y] of [[4, gy - 1], [w - 6, gy], [w / 2 + 14, gy - 2]] as const) { g.fillStyle = GOB[1]; g.beginPath(); g.ellipse(x, y, 5, 2, 0, 0, Math.PI * 2); g.fill(); box(g, x - 2, y - 1, 2, 1, GOB[3]); box(g, x + 2, y - 2, 1, 1, BLOOD[2]); }
  const bone = (x0: number, y0: number, x1: number, y1: number) => {
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = BONE[2]; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    lump(g, x0, y0, 2, 1.6, BONE, false); lump(g, x1, y1, 2, 1.6, BONE, false);
  };
  // (the long bones, thrown about; the ribs, up in a cage; the pelvis in the heart boxers)
  bone(8, gy - 3, 22, gy - 6); bone(12, gy - 9, 26, gy - 2); bone(30, gy - 2, 40, gy - 8);
  for (let i = 0; i < 5; i++) { g.strokeStyle = INK; g.lineWidth = 2.5; g.beginPath(); g.arc(24, gy - 4, 7 - i * 0.6, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); g.strokeStyle = BONE[3 - (i % 2)]; g.lineWidth = 1; g.beginPath(); g.arc(24, gy - 4, 7 - i * 0.6, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); }
  box(g, 23, gy - 12, 2, 10, BONE[1]);
  poly(g, [[30, gy - 8], [40, gy - 8], [41, gy - 3], [35, gy - 1], [29, gy - 3]], '#DC2626');
  for (const [x, y] of [[32, gy - 7], [37, gy - 6], [34, gy - 4], [39, gy - 4]] as const) { box(g, x, y, 1, 1, '#FBCFE8'); box(g, x + 1, y, 1, 1, '#FBCFE8'); box(g, x, y + 1, 2, 1, '#F9A8D4'); }
  // (his legs out of it: shin bones into tube socks, into his boots)
  for (const [x, a] of [[42, -0.25], [44, 0.15]] as const) {
    g.save(); g.translate(x, gy - 4); g.rotate(a);
    box(g, 0, -1, 8, 2, BONE[2]);
    box(g, 7, -2, 9, 4, '#F1EFEA'); box(g, 9, -2, 1, 4, '#DC2626'); box(g, 11, -2, 1, 4, '#1D4ED8');
    box(g, 15, -3, 6, 6, INK); box(g, 16, -2, 4, 4, '#5B3A1C');
    g.restore();
  }
};

/** The skull, off on its own, the jaw open; its buck teeth beside it. */
const paintSkull = (g: Ctx, w: number, h: number) => {
  const gy = h - 1;
  lump(g, 6, gy - 5, 5, 4.5, BONE);
  box(g, 3, gy - 6, 2, 2, INK); box(g, 7, gy - 6, 2, 2, INK); box(g, 5, gy - 4, 2, 1, INK);
  box(g, 2, gy - 2, 7, 2, BONE[1]); box(g, 3, gy - 2, 5, 1, INK);
  // (the buck teeth, out)
  box(g, 12, gy - 3, 2, 3, '#FFFBEA'); box(g, 15, gy - 2, 2, 3, '#FFFBEA'); box(g, 12, gy - 3, 2, 1, BONE[1]);
  void w;
};

/** His pith helmet, on its own: dented, the band, a dart through it. */
const paintHelmet = (g: Ctx, w: number, h: number) => {
  const gy = h - 1, cx = w / 2;
  g.fillStyle = INK; g.beginPath(); g.ellipse(cx, gy - 2, w / 2 - 1, 3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = KHAKI[1]; g.beginPath(); g.ellipse(cx, gy - 2, w / 2 - 2, 2, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = INK; g.beginPath(); g.ellipse(cx, gy - 4, w / 3, h - 4, 0, Math.PI, 0); g.fill();
  g.fillStyle = KHAKI[2]; g.beginPath(); g.ellipse(cx, gy - 4, w / 3 - 1, h - 5, 0, Math.PI, 0); g.fill();
  g.fillStyle = KHAKI[3]; g.beginPath(); g.ellipse(cx - 2, gy - 6, w / 6, (h - 5) / 2, 0, Math.PI, 0); g.fill();
  box(g, cx - w / 3 + 1, gy - 6, (w / 3) * 2 - 2, 2, '#5B3A1C');
  box(g, cx + 2, gy - h + 6, 3, 2, KHAKI[0]);
};

/** A hippo, on its back, legs up, tongue out, darts in it. 3 m by 1.4 m. */
const paintHippo = (g: Ctx, w: number, h: number) => {
  const gy = h - 2;
  g.fillStyle = BLOOD[1]; g.beginPath(); g.ellipse(w / 2, gy, w / 2 - 2, 4, 0, 0, Math.PI * 2); g.fill();
  // (its legs, up: stumps, toes)
  for (const x of [w * 0.3, w * 0.42, w * 0.6, w * 0.72]) {
    poly(g, [[x - 5, gy - 20], [x + 5, gy - 20], [x + 4, gy - h + 6], [x - 4, gy - h + 6]], HIPPO[2]);
    box(g, x - 4, gy - h + 6, 3, 14, HIPPO[3]);
    box(g, x - 4, gy - h + 4, 8, 3, HIPPO[0]); box(g, x - 3, gy - h + 4, 2, 2, '#D6CFC4'); box(g, x + 1, gy - h + 4, 2, 2, '#D6CFC4');
  }
  // (its belly, up: a big stepped barrel, pinker underneath)
  lump(g, w / 2, gy - 12, w * 0.36, 12, HIPPO);
  g.fillStyle = '#C9A0B0'; g.beginPath(); g.ellipse(w / 2 - 2, gy - 18, w * 0.25, 5, 0, Math.PI, 0); g.fill();
  // (its head, on its side at the left: jaw hanging open, tongue out, an X for an eye)
  lump(g, w * 0.13, gy - 9, 11, 8, HIPPO);
  box(g, 2, gy - 6, 14, 3, '#5A1A2A'); box(g, 0, gy - 5, 6, 3, '#E879A0'); box(g, 0, gy - 3, 4, 2, '#E879A0');
  box(g, 5, gy - 9, 2, 2, '#F1EFEA'); box(g, 10, gy - 9, 2, 2, '#F1EFEA');
  for (const [dx, dy] of [[0, 0], [1, 1], [2, 2], [2, 0], [0, 2]] as const) box(g, w * 0.16 + dx, gy - 15 + dy, 1, 1, INK);
  // (the darts in it, green-tipped, and the puke down its chin)
  for (const [x, y, a] of [[w * 0.5, gy - 22, -0.6], [w * 0.58, gy - 20, -0.3], [w * 0.44, gy - 21, -0.9]] as const) {
    g.save(); g.translate(x, y); g.rotate(a); box(g, 0, -0.5, 7, 1, '#A16207'); box(g, 6, -1.5, 2, 3, '#DC2626'); g.restore();
  }
  for (let i = 0; i < 6; i++) box(g, 4 + i * 2, gy - 2 + (i % 2), 2, 2, i % 2 ? '#A3B320' : '#C5D33B');
  // (its tail, a little stub)
  box(g, w * 0.84, gy - 10, 5, 2, HIPPO[1]);
};

/** An elephant's leg, standing on its own: toenails, the torn top, the bone sticking out. */
const paintLeg = (g: Ctx, w: number, h: number) => {
  const gy = h - 1, cx = w / 2;
  poly(g, [[cx - 6, 8], [cx + 6, 8], [cx + 7, gy - 3], [cx - 7, gy - 3]], ELE[2]);
  box(g, cx - 6, 10, 3, gy - 14, ELE[3]); box(g, cx + 3, 10, 3, gy - 14, ELE[1]);
  for (let y = 14; y < gy - 6; y += 5) box(g, cx - 5, y, 9, 1, ELE[1]);
  box(g, cx - 8, gy - 4, 16, 4, ELE[1]);
  for (const x of [-6, -2, 2]) box(g, cx + x, gy - 3, 3, 2, '#E7E2D6');
  // (the top, torn: red, the bone)
  g.fillStyle = BLOOD[2]; g.beginPath(); g.ellipse(cx, 8, 7, 3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = BLOOD[0]; g.beginPath(); g.ellipse(cx, 8, 4, 1.6, 0, 0, Math.PI * 2); g.fill();
  box(g, cx - 1, 1, 3, 7, BONE[2]); lump(g, cx, 2, 2.5, 2, BONE, false);
  for (let i = 0; i < 4; i++) box(g, cx - 5 + i * 3, 10 + i * 3, 1, 4 + i, BLOOD[2]);
  void h;
};

/** Artie's gift-shop parachute, caught on a chewed stalk, the lines trailing; words on it live (they want sharp). */
const paintChute = (g: Ctx, w: number, h: number) => {
  const gy = h - 1;
  // (the lines, trailing off, and the harness on the ground)
  g.strokeStyle = '#D6D3D1'; g.lineWidth = 1;
  for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(8 + i * (w - 16) / 4, gy - 16); g.quadraticCurveTo(w * 0.85, gy - 4, w - 3, gy - 1); g.stroke(); }
  box(g, w - 8, gy - 3, 7, 3, '#57534E');
  // (the canopy, draped: gores of red and white, sagging between the stalk's tops)
  const top = (x: number) => gy - 16 - Math.sin((x / w) * Math.PI) * (h - 20) + Math.abs(Math.sin((x / w) * Math.PI * 3)) * 3;
  const n = 7;
  for (let i = 0; i < n; i++) {
    const x0 = (i / n) * w, x1 = ((i + 1) / n) * w;
    const col = i % 2 ? '#F1EFEA' : '#DC2626', r = rampOf(col);
    poly(g, [[x0, top(x0)], [x1, top(x1)], [x1 - 1, gy - 6], [x0 + 1, gy - 6]], r[2], null);
    box(g, x0 + 1, top((x0 + x1) / 2) + 1, x1 - x0 - 2, 2, r[3]);
    box(g, x1 - 2, top(x1) + 2, 2, gy - 8 - top(x1), r[1]);
  }
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(0, gy - 6);
  for (let x = 0; x <= w; x += 2) g.lineTo(x, top(x));
  g.lineTo(w, gy - 6); g.stroke();
  // (the hem, scalloped)
  for (let x = 0; x < w; x += 4) box(g, x, gy - 6 + (x % 8 ? 1 : 0), 3, 1, '#7F1D1D');
};

/** The words on the chute and its price tag (drawn live, sharp at whatever size). */
const chuteWords = (c: Ctx, sx: number, sy: number, s: number) => {
  const fs = Math.round(s * 0.24);
  if (fs >= 4) {
    c.font = `${fs}px "Press Start 2P"`; c.textAlign = 'left';
    // (I, a heart, ADVENTURE; LAND under it: blue on the canopy, the heart red, pixel drawn)
    const w1 = c.measureText('I').width, w2 = c.measureText('ADVENTURE').width, gap = fs * 0.5;
    const total = w1 + gap + fs + gap + w2;
    let x = Math.round(sx - total / 2);
    const y = Math.round(sy - s * 0.95);
    const say = (str: string, px: number, py: number) => { c.fillStyle = '#F1EFEA'; c.fillText(str, px + 1, py + 1); c.fillStyle = '#1E3A8A'; c.fillText(str, px, py); };
    say('I', x, y); x += w1 + gap;
    const u = fs / 7;
    c.fillStyle = '#B91C1C';
    for (const [hx, hy, hw] of [[1, 0, 2], [4, 0, 2], [0, 1, 7], [0, 2, 7], [1, 3, 5], [2, 4, 3], [3, 5, 1]] as const) c.fillRect(Math.round(x + hx * u), Math.round(y - fs + 1 + hy * u), Math.ceil(hw * u), Math.ceil(u));
    x += fs + gap;
    say('ADVENTURE', x, y);
    say('LAND', Math.round(sx - c.measureText('LAND').width / 2), y + fs + 2);
  }
  // (the tag, still on it, on its string)
  const tx = sx + s * 1.5, ty = sy - s * 0.55;
  c.strokeStyle = '#E7E5E4'; c.lineWidth = 1; c.beginPath(); c.moveTo(tx, ty - s * 0.25); c.lineTo(tx + 1, ty); c.stroke();
  const tw = Math.max(4, s * 0.55), th = Math.max(2, s * 0.24);
  box(c, tx - 1, ty - 1, tw + 2, th + 2, INK); box(c, tx, ty, tw, th, '#FEF3C7');
  if (s * 0.12 >= 3) { c.font = `${Math.round(s * 0.12)}px "Press Start 2P"`; c.fillStyle = '#B91C1C'; c.fillText('$9.99', tx + 1, ty + th - 1); }
};

/** A vulture: stood on something, picking at it (live: its head goes down and up). */
const vulture = (c: Ctx, x: number, y: number, s: number, t: number) => {
  const k = s / 24, peck = Math.floor(t / 14) % 4 === 1;
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(k, k);
  lump(c, 0, -7, 6, 5, ['#0A0A0A', '#1C1917', '#292524', '#44403C', '#57534E']);
  box(c, -1, -2, 1, 3, '#78716C'); box(c, 2, -2, 1, 3, '#78716C');
  // (the ruff, the bald pink neck and head, the hook)
  box(c, -6, -10, 4, 3, '#D6D3D1');
  const hx = peck ? -9 : -7, hy = peck ? -4 : -14;
  box(c, -6, -11, 2, hy + 11 > 0 ? 1 : -1 * (hy + 11) + 1, '#E8A3A3');
  lump(c, hx, hy, 2.5, 2, rampOf('#E8A3A3'), false);
  box(c, hx - 4, hy, 2, 2, '#A8A29E');
  c.restore();
};

/** Vultures overhead, circling the wreck. */
const circling = (c: Ctx, x: number, y: number, s: number, t: number) => {
  for (let i = 0; i < 3; i++) {
    const a = t * 0.012 + i * 2.1, r = s * (3 + i * 1.3);
    const vx = x + Math.cos(a) * r, vy = y + Math.sin(a) * r * 0.3, flap = Math.floor(t / 10 + i) % 2;
    box(c, vx - 4, vy - (flap ? 1 : 0), 4, 1, '#1C1917'); box(c, vx + 1, vy - (flap ? 1 : 0), 4, 1, '#1C1917'); box(c, vx - 1, vy, 3, 1, '#1C1917');
  }
};

// ---------------------------------------------------------------------------------------------------------------

const props = (weakness: boolean): Prop[] => {
  const out: Prop[] = [
    // The temple and its tree, burning; the smoke off them; the vultures over it all
    { id: 'temple', x: 2.4, z: 22, w: 26, h: 13, ppm: 10, paint: paintTemple, heat: 1, live: (c, sx, sy, s, t) => {
      const at = (mx: number, my: number) => [sx + mx * s, sy - my * s] as const;
      const [ax, ay] = at(-0.6, 8.8), [bx, by] = at(-2.6, 10.6), [ccx, ccy] = at(-11.3, 0.6);
      smoke(c, ax, ay, s, t, 1, { n: 10, rise: 0.05, drift: 0.035, size: 2.4 });
      smoke(c, bx, by, s, t, 2, { n: 8, rise: 0.045, drift: 0.03, size: 1.8 });
      fire(c, ax, ay + s * 0.4, s * 2.6, t, 1); fire(c, bx, by + s * 0.3, s * 1.8, t, 4); fire(c, ccx, ccy, s * 1.2, t, 7);
      circling(c, ax - s * 2, ay - s * 6, s, t);
    } },
    // A chewed bush, burning, off to the left
    { id: 'stalkfire', x: 14, z: 20, w: 1.6, h: 1.1, ppm: 20, paint: paintStalks, heat: 1, live: (c, sx, sy, s, t) => { smoke(c, sx, sy - s * 0.8, s, t, 5, { n: 7, size: 0.8, rise: 0.03 }); fire(c, sx, sy - s * 0.1, s * 1.1, t, 9); } },
    // The hippo, belly up, near on the right; the elephant's leg on the left
    { id: 'hippo', x: -6.7, z: 3.6, w: 3.0, h: 1.4, ppm: 24, paint: paintHippo, live: (c, sx, sy, s, t) => flies(c, sx - s * 1.1, sy - s * 0.4, s, t, 6, 3) },
    { id: 'leg', x: -9.6, z: 7.8, w: 0.8, h: 1.7, ppm: 24, paint: paintLeg, live: (c, sx, sy, s, t) => flies(c, sx, sy - s * 1.7, s, t, 3, 8) },
    // His parachute, caught on a stalk
    { id: 'chute', x: 5.5, z: 9.5, w: 3.6, h: 1.6, ppm: 24, paint: paintChute, live: (c, sx, sy, s) => chuteWords(c, sx, sy, s) },
    { id: 'stalks-a', x: 3.4, z: 13, w: 1.3, h: 1, ppm: 40, paint: paintStalks },
    { id: 'stalks-b', x: -5.5, z: 2.2, w: 1.4, h: 1.1, ppm: 40, paint: paintStalks },
  ];
  if (!weakness) {
    // Artie, face down, rear up; the flies; and every so often, one more out of him
    out.push({ id: 'artie-flat', x: 2.1, z: 5, w: 2.3, h: 1.1, ppm: 24, paint: paintArtieFlat, live: (c, sx, sy, s, t) => {
      const rx = sx + s * 0.55, ry = sy - s * 1.0;
      flies(c, rx, ry, s, t, 6, 1);
      const u = t % 260;
      if (u < 90) {
        const k = u / 90, r = Math.max(1, s * (0.15 + k * 0.5));
        c.fillStyle = stipple(c, k < 0.5 ? '#9DB04A' : '#7E9434', u % 2);
        c.beginPath(); c.ellipse(rx + s * (0.2 + k * 0.3), ry - s * k * 0.6, r, r * 0.8, 0, 0, Math.PI * 2); c.fill();
      }
    } });
    out.push({ id: 'helmet', x: 0.4, z: 3.2, w: 0.7, h: 0.45, ppm: 24, paint: paintHelmet });
  } else {
    // Artie, eaten: the heap, the skull and teeth, the vulture on it, the helmet rolled off
    out.push({ id: 'bones', x: 2.1, z: 5, w: 2.4, h: 0.8, ppm: 24, paint: paintBones, live: (c, sx, sy, s, t) => { vulture(c, sx - s * 0.1, sy - s * 0.45, s, t); flies(c, sx + s * 0.5, sy - s * 0.4, s, t, 5, 2); } });
    out.push({ id: 'skull', x: 0.4, z: 3.4, w: 0.75, h: 0.45, ppm: 24, paint: paintSkull });
    out.push({ id: 'helmet', x: 3.6, z: 8, w: 0.7, h: 0.45, ppm: 24, paint: paintHelmet });
  }
  // The litter: the path's strewn the whole way (it keeps coming: wraps): chewed stalks, darts, blood, small fires,
  // and (eaten) more burst goblins
  for (let i = 0; i < 16; i++) {
    const side = i % 2 ? 1 : -1, x = ME_X + side * (1.5 + hash(i * 3.3) * 6), z = 3 + hash(i * 7.1) * 30;
    const kind = i % 4;
    if (kind === 0) out.push({ id: 'litter-stalks', x, z, w: 0.7, h: 0.4, ppm: 40, paint: paintStalks, wrap: true });
    else if (kind === 1) out.push({ id: 'litter-fire', x, z, w: 0.6, h: 0.3, ppm: 20, wrap: true, live: (c, sx, sy, s, t) => { fire(c, sx, sy, s * 0.6, t, i); smoke(c, sx, sy - s * 0.4, s, t, i, { n: 5, size: 0.3, rise: 0.025 }); } });
    else if (kind === 2) out.push({ id: 'litter-dart', x, z, w: 0.4, h: 0.5, ppm: 32, wrap: true, paint: (g, w, h) => { g.save(); g.translate(w / 2, h - 1); g.rotate(-1.1); box(g, 0, -1, 12, 2, '#A16207'); box(g, 11, -2, 3, 4, '#DC2626'); box(g, -3, -1, 3, 2, '#84CC16'); g.restore(); box(g, w / 2 - 2, h - 2, 5, 2, '#3E2A18'); } });
    else out.push({ id: weakness ? 'litter-gob' : 'litter-blood', x, z, w: 0.9, h: 0.3, ppm: 20, wrap: true, paint: (g, w, h) => {
      const R = weakness ? GOB : BLOOD;
      g.fillStyle = R[1]; g.beginPath(); g.ellipse(w / 2, h - 3, w / 2 - 1, 2.5, 0, 0, Math.PI * 2); g.fill();
      lump(g, w / 2 - 2, h - 4, 3, 2.5, weakness ? [GOB[0], GOB[1], GOB[2], GOB[3], '#D9F99D'] : [BLOOD[0], BLOOD[1], BLOOD[2], BLOOD[3], '#FCA5A5']);
      if (weakness) { box(g, w / 2 - 3, h - 6, 1, 1, '#FDE047'); box(g, w / 2, h - 6, 1, 1, '#FDE047'); }
    } });
  }
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// His new toy: the CROSSBOW OF PLAGUES, side on, pointing +x (the weapon icon's colors: the yellow stock, the bone
// prod, a green-tipped dart loaded, a skull sticker on it)

const STOCK = ['#5C3A06', '#A16207', '#CA8A04', '#EAB308', '#FDE047'];
const PROD = ['#57534E', '#A8A29E', '#D6D3D1', '#E7E5E4', '#FFFFFF'];
const crossbow = (c: Ctx, t: number) => {
  // (the grip and trigger, under it)
  poly(c, [[-18, 2], [-11, 2], [-13, 11], [-19, 11]], '#78350F');
  box(c, -18, 3, 2, 7, '#9A4A1A');
  box(c, -9, 3, 1, 4, INK); box(c, -10, 6, 4, 1, '#3F3F46');
  // (the stock: butt flared, the rail along it)
  poly(c, [[-30, -4], [-22, -2], [16, -2], [16, 3], [-22, 3], [-30, 6]], STOCK[2]);
  box(c, -29, -2, 44, 1, STOCK[4]); box(c, -29, 1, 44, 2, STOCK[1]);
  box(c, -22, -3, 38, 1, '#3F2A0A');
  box(c, -27, -1, 2, 2, STOCK[0]);
  // (the skull sticker)
  box(c, -20, -1, 4, 3, '#F5F5F4'); box(c, -19, 0, 1, 1, INK); box(c, -17, 0, 1, 1, INK); box(c, -19, 2, 3, 1, '#D6D3D1');
  // (the string, back to the nut)
  c.strokeStyle = PROD[2]; c.lineWidth = 1;
  c.beginPath(); c.moveTo(11, -17); c.lineTo(-4, -2); c.lineTo(11, 17); c.stroke();
  // (the prod: bone limbs, bowed forward)
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(11, -18); c.quadraticCurveTo(22, 0, 11, 18); c.stroke();
  c.strokeStyle = PROD[2]; c.lineWidth = 2.5; c.beginPath(); c.moveTo(11, -18); c.quadraticCurveTo(22, 0, 11, 18); c.stroke();
  c.strokeStyle = PROD[4]; c.lineWidth = 1; c.beginPath(); c.moveTo(12, -16); c.quadraticCurveTo(20, -4, 18, 0); c.stroke();
  box(c, 14, -3, 4, 6, '#3F3F46');
  // (the dart: the shaft, the fletching, the plague-green tip, glowing; a drip off it now and then)
  box(c, -4, -4, 32, 1, '#A16207');
  box(c, -6, -6, 4, 2, '#DC2626'); box(c, -6, -3, 4, 1, '#16A34A');
  const glow = Math.floor(t / 6) % 3;
  box(c, 27, -6, 2, 5, INK); box(c, 28, -5, 3, 3, ['#65A30D', '#84CC16', '#A3E635'][glow]); box(c, 31, -4, 1, 1, '#D9F99D');
  const u = t % 90;
  if (u < 30) box(c, 29, -1 + u * 0.4, 1, 2, '#84CC16');
};

export const SAFARI_ARTIE: SceneDef = {
  land: 'ADVENTURE LAND',
  weapon: 'CROSSBOW',
  blurb: ["STICK A GUY ENOUGH AND HE PUKES ON WHOEVER'S CLOSEST.", 'THEN THAT GUY PUKES ON THE NEXT GUY. IT NEVER ENDS.'],
  sky: ['#160C2E', '#2E1650', '#541C5C', '#8E2A57', '#C8463F', '#EE7E3A', '#F7AE5A'],
  haze: '#C27650',
  ground, back, props,
  drawWeapon: crossbow,
  grip: [[-15, 5], [8, 2]],
  rim: '#F59E0B',
  embers: ['#FFFBEB', '#FDE047', '#F59E0B', '#EA580C', '#B91C1C'],
};
