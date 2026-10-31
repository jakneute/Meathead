// The armor's look (SPEC.md "Look"; PROVISIONAL land themes, one per piece, mismatched on purpose: "an MMO character who
// doesn't transmog"). Each of the 8 pieces is its own part, worn when has(piece): the cheats' toggles show at once.
//
//   SABATONS   Wilderness  rusted railroad iron: riveted lames, an iron sole, a cowbell on the near ankle
//   PAULDRONS  Jungle      leopard-print caps on a bamboo rim, a tusk up off each
//   LEG ARMOR  Hollywood   a gold film-reel knee cop, gold statuette plating down the shin, a black stunt-pad strap
//                          (knee and shin only: nothing over his crotch or seat)
//   ARMGUARDS  Future      chrome XENOSCARE resin bracers, ribbed, a neon strip that glows
//   HAND ARMOR Cartoon     the big white cartoon glove: flat, outlined, three stitches, a rolled cuff
//   HELMET     Foreign     a Viking helmet, horns, a flag patch (his glasses always show under its brim)
//   AMULET     Fairy       a pink glitter crystal under tiara spikes, on a chain of pink sequins, on his bare chest
//   CAPE       Spooky      a short bat-wing cape (scalloped, ribbed, blood-red lining, a coffin-wood collar, a plastic
//                          skull clasp): it ends above his belt so his jeans' seat shows; flutters with his speed, streams
//                          up as he falls, spreads like wings while he floats (Player.floating)
//
// HOW IT'S DRAWN: Meathead 1's body parts (m1 render/player/body.ts) call an ArmorArt hook as each part's drawn (the
// boot, the shin, the forearm, the fist, the shoulder, the head through the glasses, the chest, the cape behind the
// torso), so every pose built from them wears it: the sprite's every pose, the moves, the grabs, the follow-ups, the
// boss deaths that draw him; player.ts calls the same hook on its own hand-drawn limbs. Meathead 1 never sets the hook.
// SNES look: each rigid piece is painted ONCE into a little canvas (unit pixels, colour ramps, banded shading with a
// checker dither on each band's edge: shade() below), then drawn stretched and turned with the limb (drawImage, no
// per-frame pixel work). The cape bends, so it's a few flat-banded paths a frame; the amulet's chain a few dots.
// Elsewhere: the HUD face's helmet (amuletFace.ts helmetFace), the cheap shot's close-up boot (closeUp.ts:
// drawSabatonCloseUp), the walk-in from behind (walkAway/meatheadBack.ts: drawBackArmor).

import { setArmorArt, armorMotion, type ArmorArt } from '../../m1/game/render/player/body';
import { glowLayer } from '../../m1/game/render/player/spriteOutline';
import { has } from './state';

type C = CanvasRenderingContext2D;
type Ramp = readonly string[];

// ---- the ramps (dark to light)
const RUST: Ramp = ['#2A120A', '#4E2410', '#7A3A18', '#A4532A', '#C9773F'];
const IRON: Ramp = ['#141417', '#26262C', '#3E3E47', '#62626E', '#9A9AA8'];
const BRASS: Ramp = ['#4A2E06', '#7A520E', '#B07F1E', '#DDB24A', '#F8E08A'];
const GOLD: Ramp = ['#5C3D05', '#8A6008', '#C8961A', '#F0C850', '#FFF2B0'];
const CHROME: Ramp = ['#0F172A', '#334155', '#64748B', '#CBD5E1', '#FFFFFF'];
const LEO: Ramp = ['#6E4010', '#A3661C', '#D29A3C', '#EEC676', '#FFEDB8'];
const BAMBOO: Ramp = ['#3E3A18', '#6B6530', '#9C9452', '#CBC27E', '#ECE4AE'];
const IVORY: Ramp = ['#6E6248', '#A89A76', '#D8CCA8', '#F2EAD0', '#FFFCF0'];
const STEEL: Ramp = ['#1A1F2A', '#363D4D', '#5E6779', '#97A1B4', '#DCE2EC'];
const PINK: Ramp = ['#6B1640', '#B0185A', '#E64395', '#F7A6D2', '#FFF0F8'];
const WING: Ramp = ['#140C20', '#21163A', '#33255A', '#4C3A80', '#6E5AA8'];
const WOOD: Ramp = ['#2E1A0C', '#4E2E16', '#6E4424', '#8E5E36'];
const BONE: Ramp = ['#8A836E', '#C8C0A6', '#ECE6D2', '#FFFFF6'];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const rect = (c: C, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const px = (c: C, x: number, y: number, col: string) => rect(c, x, y, 1, 1, col);

/**
 * Paints a shape a unit pixel at a time (bake time only): `inside(x, y)` the pixel's in it, `lit(x, y)` 0..1 how lit it
 * is; the ramp's bands from dark to light, a checker dither along each band's edge (the SNES's stepped shading).
 */
const shade = (c: C, x0: number, y0: number, w: number, h: number, inside: (x: number, y: number) => boolean, lit: (x: number, y: number) => number, ramp: Ramp) => {
  const n = ramp.length - 1;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const x = x0 + i + 0.5, y = y0 + j + 0.5;
    if (!inside(x, y)) continue;
    const v = clamp01(lit(x, y)) * n, lo = Math.floor(v), fr = v - lo;
    const k = Math.min(n, fr > 0.72 ? lo + 1 : fr > 0.42 && ((x0 + i + y0 + j) & 1) ? lo + 1 : lo);
    px(c, x0 + i, y0 + j, ramp[k]);
  }
};
/** How lit a point on a dome is (the light from the upper left, toward us). */
const domeLit = (cx: number, cy: number, rx: number, ry: number, amb = 0.12) => (x: number, y: number) => {
  const nx = (x - cx) / rx, ny = (y - cy) / ry, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
  return amb + (1 - amb) * Math.max(0, -0.5 * nx - 0.55 * ny + 0.67 * nz);
};
const inEllipse = (cx: number, cy: number, rx: number, ry: number) => (x: number, y: number) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
/** A tapered horn or tusk along a curve (a, control b, tip d), `r0` thick at its root to `r1` at the tip. */
const curveShape = (a: [number, number], b: [number, number], d: [number, number], r0: number, r1: number) => {
  const pts: [number, number, number][] = [];
  for (let k = 0; k <= 24; k++) {
    const t = k / 24, u = 1 - t;
    pts.push([u * u * a[0] + 2 * u * t * b[0] + t * t * d[0], u * u * a[1] + 2 * u * t * b[1] + t * t * d[1], r0 + (r1 - r0) * t]);
  }
  const near = (x: number, y: number) => {
    let best = Infinity, side = 0;
    for (const [qx, qy, r] of pts) { const dd = Math.hypot(x - qx, y - qy) - r; if (dd < best) { best = dd; side = (x - qx) / Math.max(0.3, r); } }
    return { best, side };
  };
  return { inside: (x: number, y: number) => near(x, y).best <= 0, lit: (x: number, y: number) => 0.55 - 0.45 * near(x, y).side };
};

// ---- the baked pieces: each painted once (unit pixels, BAKE canvas pixels to a unit), a far-side copy in shadow
const BAKE = 4;
const baked = new Map<string, HTMLCanvasElement | null>();
const bake = (key: string, w: number, h: number, paint: (c: C, back: boolean) => void, back = false): HTMLCanvasElement | null => {
  const id = back ? key + ':b' : key;
  const have = baked.get(id);
  if (have !== undefined) return have;
  let cv: HTMLCanvasElement | null = null;
  if (typeof document !== 'undefined') {
    cv = document.createElement('canvas');
    cv.width = w * BAKE; cv.height = h * BAKE;
    const c = cv.getContext('2d');
    if (c) {
      c.scale(BAKE, BAKE);
      paint(c, back);
      // (the far one: in his shadow)
      if (back) { c.globalCompositeOperation = 'source-atop'; c.fillStyle = 'rgba(24, 12, 30, 0.36)'; c.fillRect(0, 0, w, h); }
    } else cv = null;
  }
  baked.set(id, cv);
  return cv;
};

// ---------------------------------------------------------------------------------------------------------------------
// SABATONS (Wilderness): 18 x 12; the boot's own rect is x 1..17, y 3..11 (the toe at the right); the strap and the bell
// above it, over his ankle.
const SAB_W = 18, SAB_H = 12;
const sabTop = (x: number) => (x < 10 ? 3 : 4.4 + (x - 10) * 0.36);
const paintSabaton = (c: C, back: boolean) => {
  const inside = (x: number, y: number) => x > 1 && x < 17 && y > sabTop(x) && y < 10 && !(x > 16 && y < 7.6) && !(x < 1.8 && y > 9);
  shade(c, 1, 3, 16, 7, inside, (x, y) => 0.95 - ((y - sabTop(x)) / (10 - sabTop(x))) * 0.75 + (x > 14 ? 0.1 : 0), RUST);
  // (the ankle cuff: a band of iron round the top, riveted)
  shade(c, 1, 3, 9, 2, (x, y) => x > 1 && x < 10 && y > 3 && y < 4.6, (_x, y) => (y < 3.8 ? 0.8 : 0.45), IRON);
  // (the lames: overlapping plates down the instep, each edge dark with a lit lip after it)
  for (const lx of [6, 10, 13.5]) {
    for (let y = Math.ceil(sabTop(lx) + 0.5); y < 10; y++) px(c, Math.floor(lx), y, RUST[0]);
    px(c, Math.floor(lx) + 1, Math.ceil(sabTop(lx + 1) + 0.5), RUST[4]);
  }
  // (rivets, the light on their tops; rust pitting)
  for (const [rx, ry] of [[3, 4], [8, 4], [12, 6], [15, 7.4], [4, 7], [8, 8]] as const) { px(c, rx, ry, '#F2B27A'); px(c, rx, ry + 1, RUST[0]); }
  for (const [rx, ry] of [[5, 6], [11, 8], [14, 9], [2, 8], [9, 6]] as const) px(c, rx, ry, (rx + ry) % 2 ? '#D9772E' : RUST[1]);
  // (the iron sole: thick, a lit edge along its top)
  rect(c, 1, 10, 16, 1.6, IRON[1]); rect(c, 1, 10, 16, 0.6, IRON[3]); rect(c, 15.5, 9.4, 1.5, 1, IRON[2]);
  if (back) return;
  // (a cowbell on the near ankle, on a leather strap)
  rect(c, 1, 2.2, 9, 1, '#5C3A1E'); rect(c, 1, 2.2, 9, 0.4, '#8A5A32');
  shade(c, 2, 2, 6, 5, (x, y) => y > 2.6 && y < 6.8 && Math.abs(x - 5) < 1.4 + (y - 2.6) * 0.42, (x, y) => 0.9 - (x - 3) * 0.16 - (y - 3) * 0.05, BRASS);
  rect(c, 2.6, 6.4, 4.8, 0.6, BRASS[0]); px(c, 4.5, 6.6, '#1A1206');
  px(c, 3.5, 3.4, BRASS[4]);
};

// ---------------------------------------------------------------------------------------------------------------------
// LEG ARMOR (Hollywood): the greave 10 x 14 (down the shin: +y from the knee), the knee cop 10 x 10 (a film reel).
const paintGreave = (c: C) => {
  const hw = (y: number) => 3.6 + Math.max(0, (y - 10) * 0.25);
  const inside = (x: number, y: number) => y > 0.6 && y < 13.6 && Math.abs(x - 5) < hw(y) && !(y < 1.8 && Math.abs(x - 5) > 2.8);
  // (fluted: lit down the middle-left, a ridge every other column)
  shade(c, 0, 0, 10, 14, inside, (x, y) => 0.8 - Math.abs(x - 4.2) * 0.13 + ((Math.floor(x) & 1) ? 0.12 : -0.08) - y * 0.015, GOLD);
  rect(c, 2, 1, 6, 0.8, GOLD[4]);
  // (the stunt pad strapped across it: black padding, a red stripe)
  rect(c, 1, 7, 8, 3, '#18181B'); rect(c, 1, 7, 8, 0.8, '#3F3F46'); rect(c, 1, 8.4, 8, 0.6, '#DC2626'); rect(c, 7.6, 7, 0.6, 3, '#0A0A0B');
};
const paintReel = (c: C) => {
  shade(c, 0, 0, 10, 10, inEllipse(5, 5, 4.7, 4.7), domeLit(5, 5, 4.7, 4.7, 0.2), GOLD);
  // (the reel's holes round its hub, the hub)
  for (let k = 0; k < 5; k++) {
    const a = -Math.PI / 2 + k * (Math.PI * 2 / 5), hx = Math.round(5 + Math.cos(a) * 2.6 - 0.5), hy = Math.round(5 + Math.sin(a) * 2.6 - 0.5);
    px(c, hx, hy, '#2E1E04'); px(c, hx + 1, hy + 1, GOLD[3]);
  }
  px(c, 4, 4, GOLD[4]); px(c, 5, 5, GOLD[1]);
};

// ---------------------------------------------------------------------------------------------------------------------
// ARMGUARDS (Future): 14 x 10 along the forearm (+x elbow to wrist, centred on y = 5); chrome in stark bands, resin ribs,
// a neon strip.
const paintBracer = (c: C) => {
  const hw = (x: number) => 4.7 - 0.9 * (x / 14);
  const inside = (x: number, y: number) => x > 0.4 && x < 13.6 && Math.abs(y - 5) < hw(x) && !((x < 1.2 || x > 12.8) && Math.abs(y - 5) > hw(x) - 1.2);
  shade(c, 0, 0, 14, 10, inside, (x, y) => {
    const v = (y - 5) / hw(x);
    return v < -0.6 ? 0.98 : v < -0.2 ? 0.62 : v < 0.18 ? 0.2 : v < 0.6 ? 0.5 : 0.28;
  }, CHROME);
  // (the resin's ribs, round it)
  for (const rx of [4, 8.5]) for (let y = 1; y < 9; y++) if (inside(rx + 0.5, y + 0.5)) { px(c, rx, y, '#0B1220'); if (y < 4) px(c, rx + 1, y, CHROME[3]); }
  // (the neon: a cyan strip along it, hot in the middle; magenta pips at the wrist)
  rect(c, 1.5, 4.6, 11, 1, '#22D3EE'); for (let x = 2; x < 12; x += 2) px(c, x, 4.6, '#CFFAFE');
  px(c, 12, 2.6, '#F0ABFC'); px(c, 12, 6.6, '#F0ABFC');
};
/** The neon's glow (behind the outline: the sprite's glow layer). */
const paintBracerGlow = (c: C) => {
  const g = c.createRadialGradient(7, 4, 0.5, 7, 4, 7);
  g.addColorStop(0, 'rgba(34, 211, 238, 0.5)'); g.addColorStop(1, 'rgba(34, 211, 238, 0)');
  c.fillStyle = g; c.fillRect(0, 0, 14, 8);
};

// ---------------------------------------------------------------------------------------------------------------------
// HAND ARMOR (Cartoon): 16 x 16 round the fist (radius 5 at the middle; +x the way the forearm points): flat white, one
// flat shade, a heavy black outline, three stitches across the back, a rolled cuff at the wrist.
const paintGlove = (c: C) => {
  // (the outline first, a size up all round: the cartoon's black line)
  c.fillStyle = '#0A0A0A';
  c.beginPath(); c.arc(8.6, 8, 6.9, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.roundRect(0.4, 2.2, 5, 11.6, 1.6); c.fill();
  // (the hand)
  c.fillStyle = '#FAFAFA'; c.beginPath(); c.arc(8.6, 8, 5.9, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#D4D4D8'; c.beginPath(); c.arc(8.6, 8, 5.9, Math.PI * 0.1, Math.PI * 0.9); c.arc(8.6, 6.4, 5.2, Math.PI * 0.85, Math.PI * 0.15, true); c.fill();
  // (the cuff, rolled, flaring out over the wrist)
  c.fillStyle = '#FAFAFA'; c.beginPath(); c.roundRect(1.3, 3.1, 3.2, 9.8, 1.2); c.fill();
  c.fillStyle = '#D4D4D8'; c.fillRect(1.3, 9.6, 3.2, 3); c.fillStyle = '#0A0A0A'; c.fillRect(3.2, 3.6, 0.7, 8.8);
  // (the three stitches across the back of it)
  c.fillStyle = '#18181B'; for (const sy of [5.6, 8, 10.4]) c.fillRect(7.4, sy - 0.35, 3.4, 0.7);
  // (the cartoon shine)
  c.fillStyle = '#FFFFFF'; c.fillRect(6.4, 3.8, 1.6, 1);
};

// ---------------------------------------------------------------------------------------------------------------------
// PAULDRONS (Jungle): 20 x 18, the deltoid's middle at (9, 10); a leopard-print dome on a bamboo rim, a tusk up off it.
const SPOTS: readonly (readonly [number, number])[] = [[5, 7], [10, 5.5], [13.5, 8.5], [7.5, 10.5], [11, 11.5], [3, 10.5], [15, 5.5], [8, 4]];
const paintPauldron = (c: C) => {
  const dome = inEllipse(9, 10, 8.2, 7);
  shade(c, 0, 2, 18, 12, (x, y) => dome(x, y) && y < 13, domeLit(9, 10, 8.2, 7, 0.18), LEO);
  // (the rosettes: a broken dark ring round a tan heart)
  for (const [sx, sy] of SPOTS) {
    if (!dome(sx + 0.5, sy + 0.5) || sy > 11.5) continue;
    px(c, sx, sy, '#B5651D');
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [-1, 1], [1, -1]] as const) if (dome(sx + dx + 0.5, sy + dy + 0.5)) px(c, sx + dx, sy + dy, '#2A1606');
  }
  // (the bamboo rim: a pole along the bottom edge, its nodes)
  shade(c, 0, 12, 18, 3, (x, y) => x > 0.8 && x < 17.2 && y > 12 && y < 14.8, (_x, y) => (y < 12.8 ? 0.95 : y < 13.8 ? 0.6 : 0.25), BAMBOO);
  for (let x = 2; x < 17; x += 3.5) { rect(c, Math.floor(x), 12, 1, 3, BAMBOO[0]); px(c, Math.floor(x) + 1, 12, BAMBOO[4]); }
  // (the tusk: ivory, curving up and forward off the top)
  const t = curveShape([12.5, 6.5], [17.5, 5.5], [19, 0.4], 1.7, 0.35);
  shade(c, 10, 0, 10, 8, t.inside, t.lit, IVORY);
  rect(c, 11.4, 5.6, 2.6, 1, BAMBOO[1]);
};

// ---------------------------------------------------------------------------------------------------------------------
// HELMET (Foreign): 32 x 26, his head's middle at x 16, his eyes' line at y 24; a Viking helmet, horns, a flag patch. Its
// brim stops at y 19.4 (his eyes' line less 4.6): the glasses' rims start lower, so they always show.
const paintHelmet = (c: C) => {
  // (the far horn, behind it)
  const far = curveShape([9, 15], [3.5, 13], [2.6, 3], 2.1, 0.45);
  shade(c, 0, 1, 12, 16, far.inside, (x, y) => far.lit(x, y) * 0.6, IVORY);
  // (the dome, lit from the upper left)
  const dome = (x: number, y: number) => ((x - 15.5) / 12.2) ** 2 + ((y - 19.5) / 10.4) ** 2 <= 1 && y < 19.5;
  shade(c, 3, 9, 26, 11, dome, domeLit(14.5, 18, 12.2, 10.4, 0.15), STEEL);
  // (the band over the top, riveted)
  shade(c, 14, 9, 3, 11, (x, y) => dome(x, y) && x > 14.2 && x < 16.8, (x, y) => 0.95 - (y - 9) * 0.05 - (x - 14) * 0.12, STEEL);
  for (let y = 11; y < 18; y += 2.5) px(c, 15, Math.floor(y), '#F1F5F9');
  // (the brim: a heavier band round the bottom, rivets along it)
  shade(c, 3, 17, 26, 3, (x, y) => x > 3.3 && x < 27.7 && y > 17.2 && y < 19.4, (_x, y) => (y < 18 ? 0.75 : 0.35), STEEL);
  for (let x = 5; x < 27; x += 3) { px(c, x, 18, '#E2E8F0'); px(c, x, 19, STEEL[0]); }
  // (the flag patch on its side: a Nordic cross, stitched on)
  rect(c, 6, 12, 6, 4, '#F8FAFC'); rect(c, 6.4, 12.4, 5.2, 3.2, '#C8102E'); rect(c, 8, 12.4, 1, 3.2, '#F8FAFC'); rect(c, 6.4, 13.6, 5.2, 0.8, '#F8FAFC');
  rect(c, 8.2, 12.4, 0.6, 3.2, '#1D4ED8'); rect(c, 6.4, 13.8, 5.2, 0.4, '#1D4ED8');
  // (the near horn: out of a brass ring, curving up and out)
  const near = curveShape([22.5, 15], [28, 13], [29.4, 2.5], 2.2, 0.45);
  shade(c, 19, 1, 13, 16, near.inside, near.lit, IVORY);
  shade(c, 20, 12, 5, 5, (x, y) => Math.hypot(x - 22.5, y - 14.8) < 2.5, (x) => 0.9 - (x - 20) * 0.15, BRASS);
};

// ---------------------------------------------------------------------------------------------------------------------
// AMULET (Fairy): 8 x 11: tiara spikes, a ring of sequins, the crystal hanging under it.
const paintAmulet = (c: C) => {
  // (tiara spikes: silver, a pink gem at each tip)
  for (const [sx, h] of [[1, 2], [3.5, 3], [6, 2]] as const) {
    rect(c, sx, 3 - h, 1, h, '#E5E7EB'); px(c, sx, 3 - h, '#F472B6');
    px(c, sx, 2.4, '#9CA3AF');
  }
  rect(c, 0.5, 2.6, 7, 1, '#D1D5DB');
  // (the sequins round the mount)
  for (let x = 0; x < 8; x++) px(c, x, 3.4, x % 2 ? '#F9A8D4' : '#EC4899');
  // (the crystal: a kite, facets lit on the left)
  const hw = (y: number) => (y < 6.6 ? (y - 4) * 1.4 : Math.max(0, 3.6 - (y - 6.6) * 0.85));
  shade(c, 0, 4, 8, 7, (x, y) => Math.abs(x - 4) < hw(y), (x, y) => (x < 4 ? 0.85 : 0.35) + (y < 6.6 ? 0.15 : -0.1) - Math.abs(x - 4) * 0.05, PINK);
  px(c, 2, 5, '#FFFFFF'); px(c, 3, 7, '#FFFFFF'); px(c, 5, 6, '#FCE7F3');
};

// ---------------------------------------------------------------------------------------------------------------------
// CAPE (Spooky): the plastic skull clasp 6 x 6.
const paintSkull = (c: C) => {
  shade(c, 0, 0, 6, 5, inEllipse(3, 2.4, 2.8, 2.4), domeLit(3, 2.4, 2.8, 2.4, 0.3), BONE);
  rect(c, 1.6, 4, 2.8, 1.6, BONE[2]); px(c, 2, 5, BONE[0]); px(c, 3.4, 5, BONE[0]);
  px(c, 1, 2, '#18181B'); px(c, 2, 2, '#18181B'); px(c, 4, 2, '#18181B'); px(c, 3, 3.4, '#3F3F46');
};

/** A checker of one colour (the cape's band edges): a 2x2 pattern made once, a unit to a cell. */
let checkCanvas: HTMLCanvasElement | null = null;
const checks = new Map<string, CanvasPattern | string>();
const checker = (ctx: C, col: string): CanvasPattern | string => {
  const have = checks.get(col);
  if (have) return have;
  if (typeof document === 'undefined') return col;
  checkCanvas = document.createElement('canvas'); checkCanvas.width = 2; checkCanvas.height = 2;
  const g = checkCanvas.getContext('2d')!;
  g.fillStyle = col; g.fillRect(0, 0, 1, 1); g.fillRect(1, 1, 1, 1);
  const p = ctx.createPattern(checkCanvas, 'repeat') ?? col;
  checks.set(col, p);
  return p;
};

// ---------------------------------------------------------------------------------------------------------------------
// Drawing them on (the hook)

/** Where a scaled baked piece goes: drawn if it's baked (no DOM: nothing). */
const put = (ctx: C, img: HTMLCanvasElement | null, x: number, y: number, w: number, h: number) => { if (img) ctx.drawImage(img, x, y, w, h); };

const capeFan = (ctx: C, rx: number, ry: number, tips: [number, number][], scallop: [number, number][], k: number) => {
  ctx.beginPath(); ctx.moveTo(rx, ry);
  const s = (p: [number, number]) => [rx + (p[0] - rx) * k, ry + (p[1] - ry) * k] as const;
  const t0 = s(tips[0]); ctx.lineTo(t0[0], t0[1]);
  for (let i = 1; i < tips.length; i++) { const q = s(scallop[i - 1]), t = s(tips[i]); ctx.quadraticCurveTo(q[0], q[1], t[0], t[1]); }
  ctx.closePath();
};

const ART: ArmorArt = {
  boot(ctx, x, y, w, h, back) {
    if (!has('sabatons')) return;
    const sx = w / 16, sy = h / 8;
    put(ctx, bake('sab', SAB_W, SAB_H, paintSabaton, back), x - sx, y - 3 * sy, SAB_W * sx, SAB_H * sy);
  },
  shin(ctx, hip, knee, foot, back) {
    if (!has('legs')) return;
    const dx = foot[0] - knee[0], dy = foot[1] - knee[1], len = Math.hypot(dx, dy);
    ctx.save(); ctx.translate(knee[0], knee[1]); ctx.rotate(Math.atan2(dy, dx) - Math.PI / 2);
    const y0 = 2.6, y1 = len - 3.4, w = back ? 9.4 : 10.4;
    if (y1 - y0 > 2.5) put(ctx, bake('greave', 10, 14, paintGreave, back), -w / 2, y0, w, y1 - y0);
    ctx.restore();
    // (the knee cop: on the front of the knee, the way it bends)
    const mx = (hip[0] + foot[0]) / 2, my = (hip[1] + foot[1]) / 2, ox = knee[0] - mx, oy = knee[1] - my, ol = Math.hypot(ox, oy);
    const off = ol > 0.6 ? 1.3 / ol : 0, r = back ? 3.8 : 4.4;
    put(ctx, bake('reel', 10, 10, paintReel, back), knee[0] + ox * off - r, knee[1] + oy * off - r, r * 2, r * 2);
  },
  forearm(ctx, ex, ey, wx, wy, back) {
    if (!has('armguards')) return;
    const len = Math.hypot(wx - ex, wy - ey);
    if (len < 3) return;
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(Math.atan2(wy - ey, wx - ex));
    if (!back) {
      // (the neon's glow, behind the outline)
      const g = glowLayer(ctx);
      if (g !== ctx) { g.save(); g.setTransform(ctx.getTransform()); put(g, bake('bracerGlow', 14, 8, paintBracerGlow), -2, -6, len + 6, 12); g.restore(); }
    }
    put(ctx, bake('bracer', 14, 10, paintBracer, back), len * 0.14, -4.9, len * 0.92, 9.8);
    ctx.restore();
  },
  fist(ctx, x, y, r, angle, back) {
    if (!has('hands')) return;
    const k = r / 5;
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(k, k);
    put(ctx, bake('glove', 16, 16, paintGlove, back), -9.4, -8, 16, 16);
    ctx.restore();
  },
  shoulder(ctx, x, y, r, back) {
    if (!has('pauldrons')) return;
    const k = r / 6;
    put(ctx, bake('pauldron', 20, 18, paintPauldron, back), x - 9 * k, y - 10 * k - 1, 20 * k, 18 * k);
  },
  helmet(ctx, hx, ey) {
    if (!has('helmet')) return;
    put(ctx, bake('helmet', 32, 26, paintHelmet), hx - 16, ey - 24, 32, 26);
  },
  chest(ctx, top, pecY) {
    if (!has('amulet')) return;
    const f = armorMotion.frame;
    // (the chain: pink sequins from round his neck down to the crystal, between the pecs)
    for (const s of [-1, 1]) {
      for (let i = 0; i <= 6; i++) {
        const t = i / 6, cx = s * (5.2 - 4.6 * t), cy = top - 4 + (pecY + 2.2 - (top - 4)) * t + Math.sin(t * Math.PI) * 1.2;
        ctx.fillStyle = (i + (s > 0 ? 1 : 0)) % 2 ? '#F9A8D4' : '#DB2777';
        ctx.fillRect(cx - 0.55, cy - 0.55, 1.1, 1.1);
      }
    }
    put(ctx, bake('amulet', 8, 11, paintAmulet), -3.6, pecY + 0.6, 7.2, 9.9);
    // (the glitter: a twinkle now and then, moving round the crystal)
    const tw = f % 46;
    if (tw < 8) {
      const a = Math.floor(f / 46) % 3, gx = [-1.4, 1, -0.2][a], gy = pecY + [5.2, 6.8, 8.4][a], s = tw < 4 ? tw / 4 : (8 - tw) / 4;
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(gx - 0.4, gy - 1.6 * s, 0.8, 3.2 * s); ctx.fillRect(gx - 1.6 * s, gy - 0.4, 3.2 * s, 0.8);
    }
  },
  cape(ctx, top, h) {
    if (!has('cape')) return;
    const m = armorMotion, f = m.frame;
    const run = clamp01(Math.abs(m.fwd) / 7), fall = Math.max(-1, Math.min(1, m.vy / 9));
    const rx = -11.5, ry = top + 1;
    // (how it hangs: off his back, a little behind him; streaming back with his speed, up as he falls; while he floats,
    // spread wide behind him like a bat's wings)
    let a0: number, spread: number, len: number, ribs = 3, flap: number;
    if (m.floating) {
      a0 = Math.PI * 0.6; spread = 1.55; len = h + 7; ribs = 4; flap = Math.sin(f * 0.22) * 0.06;
    } else {
      // (flared out behind him, clear of the arm hanging at his side)
      a0 = Math.PI / 2 + 0.32 + run * 0.85 + Math.max(0, fall) * 0.7 + (m.grounded ? 0 : 0.12);
      spread = 0.5 + run * 0.2 + Math.max(0, fall) * 0.25;
      len = h - 3 + run * 2;
      flap = Math.sin(f * (0.18 + run * 0.25)) * (0.03 + 0.09 * run + 0.06 * Math.abs(fall));
    }
    const tips: [number, number][] = [], scallop: [number, number][] = [];
    for (let i = 0; i <= ribs; i++) {
      const a = a0 + (spread * i) / ribs + flap * (1 + i * 0.5), l = len * (1 - 0.06 * (i % 2)) * (1 + Math.sin(f * 0.3 + i * 1.7) * 0.02 * (1 + run));
      tips.push([rx + Math.cos(a) * l, ry + Math.sin(a) * l]);
      if (i > 0) { const am = a - spread / ribs / 2, lm = l * 0.74; scallop.push([rx + Math.cos(am) * lm, ry + Math.sin(am) * lm]); }
    }
    // (banded: darkest at the hem, a checker on each band's edge; lighter up by the shoulders)
    ctx.fillStyle = WING[0]; capeFan(ctx, rx, ry, tips, scallop, 1); ctx.fill();
    ctx.fillStyle = checker(ctx, WING[1]); capeFan(ctx, rx, ry, tips, scallop, 0.86); ctx.fill();
    ctx.fillStyle = WING[1]; capeFan(ctx, rx, ry, tips, scallop, 0.78); ctx.fill();
    ctx.fillStyle = checker(ctx, WING[2]); capeFan(ctx, rx, ry, tips, scallop, 0.56); ctx.fill();
    ctx.fillStyle = WING[2]; capeFan(ctx, rx, ry, tips, scallop, 0.48); ctx.fill();
    // (the blood-red lining, showing along the edge by his back)
    const t0 = tips[0];
    ctx.fillStyle = '#7F1D1D';
    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(t0[0], t0[1]); ctx.lineTo(rx + (t0[0] - rx) * 0.8 + 1.4, ry + (t0[1] - ry) * 0.8 - 0.4); ctx.closePath(); ctx.fill();
    // (the ribs: dark, the outermost lit along its top)
    ctx.lineWidth = 0.8; ctx.strokeStyle = '#0B0612';
    ctx.beginPath(); for (let i = 1; i < ribs; i++) { ctx.moveTo(rx, ry); ctx.lineTo(tips[i][0], tips[i][1]); } ctx.stroke();
    const tn = tips[ribs];
    ctx.strokeStyle = WING[4]; ctx.beginPath(); ctx.moveTo(rx, ry - 0.4); ctx.lineTo(rx + (tn[0] - rx) * 0.7, ry + (tn[1] - ry) * 0.7 - 0.4); ctx.stroke();
    // (the coffin-wood collar over his shoulders, the plastic skull clasping it)
    ctx.fillStyle = WOOD[1]; ctx.fillRect(rx - 4, ry - 2, 9, 2.6);
    ctx.fillStyle = WOOD[3]; ctx.fillRect(rx - 4, ry - 2, 9, 0.7);
    ctx.fillStyle = WOOD[0]; ctx.fillRect(rx - 1, ry - 1.3, 0.6, 1.9); ctx.fillRect(rx + 2.4, ry - 1.3, 0.6, 1.9);
    put(ctx, bake('skull', 6, 6, paintSkull), rx - 6.6, ry - 3.4, 5, 5);
  },
};

/** The baked pieces, for the bigger pictures of him (walkArmor.ts: the walk screens): each painted once. */
export type Stamp = 'sab' | 'greave' | 'reel' | 'bracer' | 'glove' | 'pauldron' | 'helmet' | 'amulet' | 'skull';
const STAMPS: Record<Stamp, [number, number, (c: C, back: boolean) => void]> = {
  sab: [SAB_W, SAB_H, paintSabaton], greave: [10, 14, paintGreave], reel: [10, 10, paintReel], bracer: [14, 10, paintBracer], glove: [16, 16, paintGlove],
  pauldron: [20, 18, paintPauldron], helmet: [32, 26, paintHelmet], amulet: [8, 11, paintAmulet], skull: [6, 6, paintSkull],
};
export const armorStamp = (s: Stamp, back = false) => { const [w, h, paint] = STAMPS[s]; return bake(s, w, h, paint, back); };
export { RUST, IRON, BRASS, GOLD, WING, WOOD, STEEL, IVORY, PINK, shade, curveShape, domeLit, bake };

let installed = false;
/** Puts the armor's art on him (once, from apply.ts installUpgrades): from then each piece shows while has(piece). */
export const installArmorArt = () => {
  if (installed) return;
  installed = true;
  setArmorArt(ART);
};

// ---------------------------------------------------------------------------------------------------------------------
// The cheap shot's close-up boot (closeUp.ts), with the sabatons on: his boot toe-up into the crotch, rusted railroad
// iron plates riveted down it, the cowbell swinging off the ankle; drawn where closeUp.ts drew the plain one (its
// coordinates: (x, y) the toe's middle, the cuff below at y + 40). Panel-sized, a few dozen rects a frame.
export const drawSabatonCloseUp = (c: C, x: number, y: number, t: number) => {
  // (the jeans' cuff)
  c.fillStyle = '#1E3A8A'; c.fillRect(x - 30, y + 40, 60, 80);
  c.fillStyle = '#2563EB'; c.fillRect(x - 30, y + 40, 8, 80);
  // (the iron: the toe cap's dome, banded; lames down to the ankle)
  const bands: [number, string][] = [[0, RUST[1]], [10, RUST[2]], [22, RUST[3]], [34, RUST[4]]];
  c.fillStyle = IRON[0];
  c.beginPath(); c.moveTo(x - 35, y + 46); c.lineTo(x - 35, y + 2); c.quadraticCurveTo(x - 33, y - 26, x - 2, y - 30); c.quadraticCurveTo(x + 33, y - 26, x + 35, y + 2); c.lineTo(x + 35, y + 46); c.closePath(); c.fill();
  for (const [inset, col] of bands) {
    c.fillStyle = col;
    c.beginPath(); c.moveTo(x - 32 + inset, y + 44); c.lineTo(x - 32 + inset, y + 2 + inset * 0.2); c.quadraticCurveTo(x - 30 + inset, y - 22 + inset * 0.5, x - 2 + inset * 0.3, y - 26 + inset * 0.6); c.quadraticCurveTo(x + 30 - inset * 0.4, y - 22 + inset * 0.6, x + 32 - inset * 0.6, y + 2); c.lineTo(x + 32 - inset * 0.6, y + 44); c.closePath(); c.fill();
  }
  // (the lames' edges across it, each lit on its lip; rivets; pitting)
  for (let i = 0; i < 4; i++) {
    const ly = y + 4 + i * 10;
    c.fillStyle = RUST[0]; c.fillRect(x - 32, ly, 64, 3);
    c.fillStyle = RUST[4]; c.fillRect(x - 32, ly + 3, 64, 2);
    c.fillStyle = '#F2B27A'; for (const rx of [-24, 0, 24]) c.fillRect(x + rx - 2, ly + 5, 4, 3);
  }
  c.fillStyle = '#D9772E'; for (let i = 0; i < 9; i++) c.fillRect(x - 26 + ((i * 23) % 52), y - 12 + ((i * 17) % 50), 3, 3);
  // (the iron sole's edge over the top)
  c.fillStyle = IRON[1]; c.fillRect(x - 36, y - 34, 72, 8); c.fillStyle = IRON[3]; c.fillRect(x - 36, y - 34, 72, 2);
  // (the cowbell off the ankle, swinging, clanking)
  const sw = Math.sin(t * 0.5) * 0.35;
  c.save(); c.translate(x + 30, y + 30); c.rotate(sw);
  c.fillStyle = '#5C3A1E'; c.fillRect(-3, -6, 6, 8);
  for (let i = 0; i < 4; i++) { c.fillStyle = BRASS[i + 1]; c.fillRect(-9 + i * 3.5, 2, 4, 24); }
  c.fillStyle = BRASS[0]; c.fillRect(-11, 24, 22, 4); c.fillStyle = '#1A1206'; c.fillRect(-2, 28, 4, 4);
  c.restore();
};
