// Under the river, painted (the final pass): everything below the waterline. The water (banded, its color by where it
// is: the river's green in the open, the culvert's murk, the tank's aquarium blue), the planes behind (the far riverbed
// ridges, the culvert's concrete back wall, the vault's arches, the storage room's old mural), the floor and ceiling
// planes running back to them in perspective, all of it wobbling the way the SNES did it (each strip of lines shifted
// sideways a little, a scanline raster effect: `wave`). Then, crisp over that: the light coming down (the sun's, the
// grates', the tank's lamps), the weed swaying, the concrete roof, the air pockets' chambers, the bed (lit along the
// top where it's stood on), the vents. In front: the surface's underside shimmering, the silt, the bubbles.
//
// The stage's set pieces down here (the sunk rides, the dinosaurs, the tank, the drain) are in under-scenery.ts and
// under-tank.ts. Still art is painted once into stamps (kit's `stamp`), live art (anything that moves) over it.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { SECTIONS } from '../geometry';
import { timeOfDay, type TimeOfDay } from '../../timeOfDay';
import { box, ramp, rampOf, mix, dark, lite, checker, steppedGlow, stamp, hash, sign, INK, PIX } from '../../intro/art/kit';
import { signAt, stencil, dino, enamel, graffiti as graffitiLook } from '../letters';
import type { River } from './index';
import { WS, CEIL, DOCK, FALLS, TUNNEL, POCKETS, POCKET_TOP, TANK, PIPE, BED, bedAt, roofAt, PROPS, VENTS, EELS, eelMouth, EEL_HOLE } from './course';

export type Ctx = CanvasRenderingContext2D;
export const { x0 } = SECTIONS.river;
export const R = (x: number) => x0 + x;

/** How deep the water's drawn (the deepest of the bed is 1020). */
export const BOTTOM = 1060;
/** Where the culvert opens out into the vault (the ride graveyard), and where the prop storage starts. */
export const YARD = 5300, STORE = 7600;

export type Zone = 'open' | 'culvert' | 'yard' | 'store' | 'tank' | 'drain';
export const ZONES: { z: Zone; a: number; b: number }[] = [
  { z: 'open', a: DOCK, b: TUNNEL.x1 }, { z: 'culvert', a: TUNNEL.x1, b: YARD }, { z: 'yard', a: YARD, b: STORE },
  { z: 'store', a: STORE, b: TUNNEL.x2 }, { z: 'tank', a: TANK.x1, b: TANK.x2 }, { z: 'drain', a: TANK.x2, b: PIPE.x2 },
];
export const zoneAt = (rx: number): Zone => (ZONES.find(z => rx < z.b) ?? ZONES[ZONES.length - 1]).z;

/** What's on screen (world), the frame. */
export interface V { f: number; cx: number; cy: number; l: number; r: number; t: number; b: number; tod: TimeOfDay }
export const viewOf = (state: GameState): V => ({
  f: state.frame, cx: state.camera.x, cy: state.camera.y,
  l: state.camera.x, r: state.camera.x + CANVAS_WIDTH, t: state.camera.y, b: state.camera.y + CANVAS_HEIGHT, tod: timeOfDay(),
});
export const onScreen = (v: V, a: number, b: number, pad = 60) => b > v.l - pad && a < v.r + pad;

// ---------------------------------------------------------------------------------------------------------------
// Planes further back: a plane at depth s (1 the play layer's, under 1 further off) is drawn in world coordinates times
// s, offset so it closes in on the middle of the screen (true perspective, no scaling: the pixels stay crisp).

export const offX = (v: V, s: number) => Math.round((v.cx + CANVAS_WIDTH / 2) * (1 - s) * 2) / 2;
export const offY = (v: V, s: number) => Math.round((v.cy + CANVAS_HEIGHT / 2) * (1 - s) * 2) / 2;
/** Where a world point on the plane at s is drawn. */
export const pX = (v: V, s: number, wx: number) => wx * s + offX(v, s);
export const pY = (v: V, s: number, wy: number) => wy * s + offY(v, s);
/** The world x on the plane at s that's drawn at x. */
export const unX = (v: V, s: number, x: number) => (x - offX(v, s)) / s;

// ---------------------------------------------------------------------------------------------------------------
// The water

const WATER: Record<Zone, string[]> = {
  open: ['#4AA595', '#33887F', '#236D6C', '#18555B', '#0F3D4A', '#082838'],
  culvert: ['#22626A', '#1A525A', '#13434B', '#0E353D', '#09272F', '#051A21'],
  yard: ['#1F5A66', '#184B57', '#123D48', '#0D2F3A', '#08222C', '#04161E'],
  store: ['#215A5C', '#1A4B4E', '#133C40', '#0E2F33', '#082227', '#04161A'],
  tank: ['#3A92C4', '#2D7AB0', '#22659A', '#1A5284', '#123F6C', '#0B2C52'],
  drain: ['#1D434B', '#16363E', '#112B32', '#0C2027', '#07161B', '#030C10'],
};
/** The water's color in a zone, k of the way down (0 the surface): the open river's top takes the hour's light. */
export const waterAt = (z: Zone, k: number, tod: TimeOfDay) => {
  let col = ramp(WATER[z], Math.max(0, Math.min(1, k)));
  if (z === 'open') {
    col = mix(col, mix(tod.sky[4], tod.sunGlow, 0.3), 0.3 * tod.skyK * (1 - k));
    col = mix(col, '#020A16', Math.min(0.55, tod.dark * 2.4));
  }
  return col;
};
const BANDS = 20;
const BAND_H = (BOTTOM - WS) / BANDS;

const fillWater = (c: Ctx, v: V) => {
  const y0 = Math.max(WS, v.t - 4), y1 = Math.min(BOTTOM, v.b + 4);
  for (const zn of ZONES) {
    const a = Math.max(R(zn.a), v.l - 4), b = Math.min(R(zn.b), v.r + 4);
    if (b <= a) continue;
    for (let i = 0; i < BANDS; i++) {
      const ya = Math.floor(WS + i * BAND_H), yb = Math.floor(WS + (i + 1) * BAND_H);
      if (yb < y0 || ya > y1) continue;
      box(c, a, ya, b - a, yb - ya + 1, waterAt(zn.z, i / (BANDS - 1), v.tod));
      if (i) { checker(c, a, ya, b - a, PIX, waterAt(zn.z, (i - 1) / (BANDS - 1), v.tod), 1); }
    }
  }
  // (where the culvert's water opens into the vault's, and the vault's into the storage's: crossfaded across a wide band in
  // steps, each step's edge dithered into the last)
  const FADE = 8, FW = 32;
  for (const [bx, za, zb] of [[YARD, 'culvert', 'yard'], [STORE, 'yard', 'store']] as [number, Zone, Zone][]) {
    const x0b = R(bx) - (FADE * FW) / 2;
    if (!onScreen(v, x0b, x0b + FADE * FW, 8)) continue;
    for (let i = 0; i < BANDS; i++) {
      const ya = Math.floor(WS + i * BAND_H), yb = Math.floor(WS + (i + 1) * BAND_H);
      if (yb < y0 || ya > y1) continue;
      const ca = waterAt(za, i / (BANDS - 1), v.tod), cb = waterAt(zb, i / (BANDS - 1), v.tod);
      const pa = i ? waterAt(za, (i - 1) / (BANDS - 1), v.tod) : ca, pb = i ? waterAt(zb, (i - 1) / (BANDS - 1), v.tod) : cb;
      let prev = ca;
      for (let j = 0; j <= FADE; j++) {
        const t = j / FADE, col = mix(ca, cb, t), x = x0b + j * FW;
        const w = j === FADE ? 4 : FW;
        if (j < FADE) box(c, x, ya, w, yb - ya + 1, col);
        checker(c, x, ya, 4, yb - ya + 1, prev);
        // (the band above's color dithered along its top, as everywhere else)
        if (i && j < FADE) checker(c, x, ya, w, PIX, mix(pa, pb, t), 1);
        prev = col;
      }
    }
  }
  for (const [bx, za, zb] of [[TANK.x1, 'store', 'tank']] as [number, Zone, Zone][]) {
    if (!onScreen(v, R(bx) - 40, R(bx) + 40)) continue;
    for (let i = 0; i < BANDS; i++) {
      const ya = Math.floor(WS + i * BAND_H), h = Math.ceil(BAND_H) + 1;
      if (ya + h < y0 || ya > y1) continue;
      checker(c, R(bx), ya, 24, h, waterAt(za, i / (BANDS - 1), v.tod));
      checker(c, R(bx) - 24, ya, 24, h, waterAt(zb, i / (BANDS - 1), v.tod), 1);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The wave: what's been painted of the water so far, shifted sideways strip by strip (two pixels tall each), by a
// little sine that drifts down through it: the SNES's underwater wobble, done the way it did it.

let waveBuf: HTMLCanvasElement | null = null;
const wave = (c: Ctx, v: V, wx0: number, wx1: number, wy0: number, wy1: number) => {
  if (typeof document === 'undefined') return;
  const m = c.getTransform(), W = c.canvas.width, H = c.canvas.height;
  if (m.b !== 0 || m.c !== 0 || m.a <= 0) return;
  const dx0 = Math.max(0, Math.floor(wx0 * m.a + m.e)), dx1 = Math.min(W, Math.ceil(wx1 * m.a + m.e));
  const dy0 = Math.max(0, Math.floor(wy0 * m.d + m.f)), dy1 = Math.min(H, Math.ceil(wy1 * m.d + m.f));
  const w = dx1 - dx0, h = dy1 - dy0;
  if (w < 4 || h < 4) return;
  waveBuf ??= document.createElement('canvas');
  if (waveBuf.width < w || waveBuf.height < h) { waveBuf.width = Math.max(w, waveBuf.width); waveBuf.height = Math.max(h, waveBuf.height); }
  const b = waveBuf.getContext('2d')!;
  b.clearRect(0, 0, w, h);
  b.drawImage(c.canvas, dx0, dy0, w, h, 0, 0, w, h);
  const unit = m.a, step = Math.max(2, Math.round(m.d * 2));
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  c.beginPath(); c.rect(dx0, dy0, w, h); c.clip();
  c.imageSmoothingEnabled = false;
  for (let y = 0; y < h; y += step) {
    const wy = (dy0 + y - m.f) / m.d, d = wy - WS;
    // (a gentle sway near the top, a little more down deep: whole pixels of the art, never in between)
    const amp = 1.6 + Math.min(1.4, d / 260);
    const off = Math.round(Math.sin(wy * 0.055 + v.f * 0.05) * amp + Math.sin(wy * 0.019 - v.f * 0.027) * 1.1) * unit;
    if (off) c.drawImage(waveBuf, 0, y, w, Math.min(step, h - y), dx0 + off, dy0 + y, w, Math.min(step, h - y));
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Caustics: the light off the ripples, a net of bright lines crawling over whatever's lit from above. Eight frames of
// a tile, worked out once (each a sum of waves that repeat across the tile, bright where they cancel), looped.

const CW = 96, CH = 48, CF = 8;
let caustics: HTMLCanvasElement[] | null = null;
const causticTiles = () => {
  if (caustics || typeof document === 'undefined') return caustics;
  caustics = [];
  const waves = [[1, 1, 0], [2, -1, 1.3], [-1, 2, 2.1], [3, 1, 0.7]];
  for (let k = 0; k < CF; k++) {
    const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH;
    const g = cv.getContext('2d')!;
    const t = (k / CF) * Math.PI * 2;
    for (let y = 0; y < CH; y += 2) for (let x = 0; x < CW; x += 2) {
      let s = 0;
      for (const [nx, ny, ph] of waves) s += Math.sin(Math.PI * 2 * (nx * x / CW + ny * y / CH) + ph + t * (nx > 0 ? 1 : -1));
      const a = Math.abs(s);
      if (a < 0.28) { g.fillStyle = 'rgba(255,255,255,0.9)'; g.fillRect(x, y, 2, 2); }
      else if (a < 0.6) { g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x, y, 2, 2); }
    }
    caustics.push(cv);
  }
  return caustics;
};
const patterns = new WeakMap<Ctx, CanvasPattern[]>();
/** The caustic net over a path already set (fill it): `a` its strength, `tint` the light's color, scrolling with `ox`. */
export const causticFill = (c: Ctx, v: V, a: number, tint: string, ox = 0, oy = 0) => {
  const tiles = causticTiles();
  if (!tiles || a <= 0.01) return;
  let ps = patterns.get(c);
  if (!ps) { ps = tiles.map(t => c.createPattern(t, 'repeat')!); patterns.set(c, ps); }
  const p = ps[Math.floor(v.f / 7) % CF];
  p.setTransform(new DOMMatrix([1, 0, 0, 1, Math.round(ox), Math.round(oy)]));
  c.save();
  c.clip();
  c.globalCompositeOperation = 'lighter';
  c.globalAlpha = a;
  c.fillStyle = p;
  c.fillRect(v.l - 10, v.t - 10, CANVAS_WIDTH + 20, CANVAS_HEIGHT + 20);
  // (tinted: the light's color multiplied over the net it just laid)
  c.globalCompositeOperation = 'source-over';
  c.restore();
  void tint;
};

// ---------------------------------------------------------------------------------------------------------------
// Behind: the planes

/** The back wall's plane in the tunnel (the culvert, the vault, the storage room), the vault's far junk, the open river's ridges. */
const S_BACK = 0.8, S_FAR = 0.55, S_RIDGE = 0.62, S_RIDGE2 = 0.42;

/** The tunnel's back wall, painted in chunks (stamped), by zone. */
const CHUNK = 320;
const WALL_TOP = CEIL, WALL_BOT = BOTTOM;
const CONC = ['#1C2A2C', '#28393B', '#344A4B', '#41595A', '#526B6B', '#678180'];

const fogged = (col: string, k = 0.45) => mix(col, '#0E3540', k);

/** The culvert's wall: poured concrete panels, the form-tie holes, the seams, stains, stencils; every few, a caged lamp. */
const paintCulvertChunk = (g: Ctx, i: number, u0: number, top: number, bot: number) => {
  const C = CONC.map(c => fogged(c, 0.35));
  box(g, u0, top, CHUNK, bot - top, C[2]);
  // (panels: each its own pour, a shade off the next; tie holes in rows; the joint between, dark, lit on its left)
  for (let k = 0; k < 2; k++) {
    const x = u0 + k * 160, sh = hash(i * 7 + k) < 0.5 ? C[2] : mix(C[2], C[3], 0.4);
    box(g, x, top, 160, bot - top, sh);
    checker(g, x, top, 160, 4, C[3]);
    for (let ty = top + 30; ty < bot - 20; ty += 48) for (let tx = x + 20; tx < x + 160; tx += 40) { box(g, tx, ty, 2, 2, C[0]); box(g, tx, ty - 1, 2, 1, C[1]); }
    // (the stains: the waterline's band, rust down from the ties, algae creeping up from the floor)
    if (hash(i * 13 + k) > 0.45) { const rx = x + 30 + Math.floor(hash(i * 3 + k) * 90); for (let s = 0; s < 70; s += 2) box(g, rx + (s % 6 === 0 ? 1 : 0), top + 40 + s, 2, 2, mix(sh, '#6B3A1A', 0.35 * (1 - s / 70))); }
    box(g, x, top, 2, bot - top, C[0]); box(g, x + 2, top, 1, bot - top, C[4]);
  }
  // (a horizontal cold joint, a third of the way down)
  box(g, u0, top + 64, CHUNK, 2, C[1]); box(g, u0, top + 66, CHUNK, 1, C[3]);
  // (the algae: a dithered green fringe up from the floor (where the floor meets it, back here))
  const fl = Math.round(bedAt((u0 + CHUNK / 2) / S_BACK - x0) * S_BACK) - 46;
  for (let y = 0; y < 3; y++) checker(g, u0, fl - y * 8, CHUNK, 8, fogged('#2E5A2A', 0.3), y % 2);
  box(g, u0, fl + 8, CHUNK, bot - fl - 8, fogged('#22402A', 0.35));
  // (stencils, words on the wall)
  const words = ['STORM CULVERT 3', 'JUNGLE LAND MAINT.', 'NO DIVING', 'DAVE WAS HERE', 'STA. 4+50', 'ARTIE IS AN ASSHOLE', 'HIGH WATER LINE'];
  if (i % 2 === 0) {
    const w = words[(i >> 1) % words.length];
    const graffiti = w === 'DAVE WAS HERE' || w === 'ARTIE IS AN ASSHOLE';
    if (graffiti) signAt(g, w, u0 + 160, top + 50, 7, graffitiLook({ sx: 1, sy: 2 }, fogged('#E0607A', 0.3), i));
    else signAt(g, w, u0 + 160, top + 50, 8, { ...stencil({ sx: 2, sy: 2 }, fogged('#D9C27A', 0.35), fogged('#5A6460', 0.4), i), shadow: fogged(INK, 0.4) });
  }
  // (a depth gauge painted on, in feet, on every third)
  if (i % 3 === 1) {
    const gx = u0 + 250;
    box(g, gx, top + 76, 14, 150, fogged('#E8E2C8', 0.4));
    for (let k = 0; k < 6; k++) { box(g, gx, top + 80 + k * 24, 14, 2, fogged(INK, 0.3)); signAt(g, `${2 + k * 2}`, gx + 24, top + 86 + k * 24, 6, stencil(6, fogged('#E8E2C8', 0.4)), 'left'); }
    signAt(g, 'FT', gx + 7, top + 72, 6, stencil(6, fogged('#E8E2C8', 0.4)));
  }
};

/** The vault the culvert opens into (the ride graveyard): great arches through to the dark, junk piled beyond. Its bays
 * are laid out from where the vault starts on the back plane (six of them, to where the storage starts), not chunk by
 * chunk: a chunk paints whatever of them falls in it, so an arch is never cut off where a seam comes. */
const YARD_BAYS = 6;
const WALL_SEAMS: [number, Zone, Zone][] = [[YARD, 'culvert', 'yard'], [STORE, 'yard', 'store']];
const paintYardChunk = (g: Ctx, _i: number, u0: number, top: number, bot: number) => {
  const C = CONC.map(c => fogged(c, 0.45));
  const uY = R(YARD) * S_BACK, BAY = (STORE - YARD) * S_BACK / YARD_BAYS;
  g.save(); g.beginPath(); g.rect(u0, top, CHUNK, bot - top); g.clip();
  box(g, u0, top, CHUNK, bot - top, C[2]);
  const names = ['BONEYARD', 'BAY 2', 'SURPLUS', 'BAY 4', 'SCRAP ONLY', 'BAY 6'];
  for (let j = Math.max(0, Math.floor((u0 - uY) / BAY)); j < YARD_BAYS && uY + j * BAY < u0 + CHUNK; j++) {
    const b0 = uY + j * BAY;
    // (the arch: its opening cut through (what's beyond is on the far plane, drawn through it))
    const ax = b0 + 40, aw = BAY - 80, ar = aw / 2;
    g.save();
    g.globalCompositeOperation = 'destination-out';
    g.beginPath(); g.moveTo(ax, bot); g.lineTo(ax, top + 40 + ar); g.arc(ax + ar, top + 40 + ar, ar, Math.PI, 0); g.lineTo(ax + aw, bot); g.closePath(); g.fill();
    g.restore();
    // (the arch's voussoirs: stepped blocks round it, lit on top)
    for (let k = 0; k <= 12; k++) {
      const a = Math.PI + (k / 12) * Math.PI, bx = ax + ar + Math.cos(a) * (ar + 6), by = top + 40 + ar + Math.sin(a) * (ar + 6);
      box(g, bx - 5, by - 5, 10, 10, k % 2 ? C[3] : C[4]); box(g, bx - 5, by - 5, 10, 2, C[5]);
    }
    // (the piers either side: lit on the left)
    box(g, b0, top, 40, bot - top, C[3]); box(g, b0, top, 4, bot - top, C[4]); box(g, b0 + 36, top, 4, bot - top, C[1]);
    box(g, b0 + BAY - 40, top, 40, bot - top, C[3]); box(g, b0 + BAY - 40, top, 4, bot - top, C[4]);
    // (a sign over every other arch, mounted with brackets)
    if (j % 2 === 0) sign(g, ax + ar - 50, top + 8, 100, 18, fogged('#B8A040', 0.4), names[j], fogged('#1A1408', 0.2), 7, fogged('#3A3F48', 0.4));
  }
  g.restore();
};

/** Where one zone's back wall gives onto the next: the culvert's end broken off against the vault's first pier (a
 * headwall, a shade between the two), the vault's last pier against the storage's backdrop. */
const paintPortal = (g: Ctx, uS: number, top: number, bot: number, zl: Zone, zr: Zone) => {
  if (zl === 'culvert' && zr === 'yard') {
    const A = CONC.map(c => fogged(c, 0.35)), M = CONC.map(c => fogged(c, 0.4));
    // (the culvert's last panel, its end broken off ragged: the break stepped back into shadow, the rebar out of it)
    for (let y = top; y < bot; y += 8) {
      const d = 6 + Math.floor(hash(y * 0.37) * 14);
      box(g, uS - d, y, d, 8, A[0]); box(g, uS - d, y, 2, 8, A[1]);
      if (hash(y * 1.7) > 0.7) { box(g, uS - d - 6, y + 3, 6 + d, 1, fogged('#7A4A2A', 0.35)); box(g, uS - d - 6, y + 2, 2, 3, fogged('#7A4A2A', 0.35)); }
    }
    // (the headwall the vault's built onto: a thick pilaster, a shade between the culvert's and the vault's, stepped)
    box(g, uS, top, 44, bot - top, M[3]); box(g, uS, top, 4, bot - top, M[4]); box(g, uS + 4, top, 2, bot - top, M[5]);
    box(g, uS + 40, top, 4, bot - top, M[1]);
    for (let y = top + 24; y < bot; y += 56) { box(g, uS + 8, y, 28, 2, M[1]); box(g, uS + 8, y + 2, 28, 1, M[4]); }
    // (dithered into the vault's wall on its right: the shade steps across)
    checker(g, uS + 44, top, 8, bot - top, M[2]);
    signAt(g, 'END CULVERT 3', uS + 22, top + 48, 5, stencil(5, fogged('#D9C27A', 0.4)));
  } else {
    const C = CONC.map(c => fogged(c, 0.45));
    box(g, uS - 20, top, 40, bot - top, C[3]); box(g, uS - 20, top, 4, bot - top, C[4]); box(g, uS + 16, top, 4, bot - top, C[1]);
    checker(g, uS + 20, top, 6, bot - top, C[1]);
  }
};

/** The prop storage: an old ride's painted backdrop (a jungle, a volcano, the sunrise), peeling off the concrete. */
const paintStoreChunk = (g: Ctx, i: number, u0: number, top: number, bot: number) => {
  const F = (c: string) => fogged(c, 0.42);
  // (the painted sky, banded the way a scenic painter would)
  const sky = ['#E8A05A', '#D88A50', '#C07048', '#985448', '#704048'];
  for (let k = 0; k < 5; k++) box(g, u0, top + k * 22, CHUNK, 23, F(sky[k]));
  for (let k = 1; k < 5; k++) checker(g, u0, top + k * 22 - 2, CHUNK, 2, F(sky[k]));
  // (the painted volcano, in one chunk: smoke painted on)
  if (i % 5 === 2) {
    g.fillStyle = F('#5A3A30'); g.beginPath(); g.moveTo(u0 + 30, top + 200); g.lineTo(u0 + 140, top + 60); g.lineTo(u0 + 180, top + 60); g.lineTo(u0 + 300, top + 200); g.fill();
    box(g, u0 + 140, top + 56, 40, 6, F('#E8602A'));
    for (let k = 0; k < 5; k++) box(g, u0 + 150 + k * 6, top + 30 - k * 6, 18, 14, F('#8A7A78'));
  }
  // (the painted jungle: rounded canopies, two greens, stepped)
  for (let k = 0; k < 6; k++) {
    const cx = u0 + 20 + k * 56 + hash(i * 9 + k) * 20, cy = top + 120 + hash(i + k * 3) * 30;
    g.fillStyle = F('#2E5A30'); g.beginPath(); g.arc(cx, cy, 34, 0, Math.PI * 2); g.fill();
    g.fillStyle = F('#3E7038'); g.beginPath(); g.arc(cx - 6, cy - 8, 22, 0, Math.PI * 2); g.fill();
    box(g, cx - 3, cy + 20, 6, 120, F('#4A3420'));
  }
  box(g, u0, top + 150, CHUNK, bot - top - 150, F('#264A28'));
  // (the title, painted across the top of the backdrop: in two chunks)
  if (i % 5 === 0) signAt(g, 'DINO-SAFARI', u0 + CHUNK / 2, top + 34, 14, dino(14, [F('#FFF2B0'), F('#F2D04A'), F('#E8A41E'), F('#B8641A')], F('#5A2A10'), F('#2A1406')));
  if (i % 5 === 0) signAt(g, 'EST. 1979', u0 + CHUNK / 2, top + 52, 7, enamel(7, F('#F2D04A'), F('#5A2A10')));
  // (where it's peeled: bare concrete in a ragged patch, the edge curling)
  if (hash(i * 31) > 0.4) {
    const px = u0 + 40 + hash(i * 17) * 200, py = top + 60 + hash(i * 23) * 80;
    for (let k = 0; k < 8; k++) box(g, px + k * 6, py + Math.floor(hash(k + i) * 8), 6, 50 - Math.floor(hash(k * 2 + i) * 16), F(CONC[3]));
    box(g, px, py - 2, 48, 2, F('#F0E0C0'));
  }
  // (the panel seams of the backdrop: plywood sheets, eight feet wide)
  box(g, u0, top, 2, bot - top, F('#1A1A14'));
  box(g, u0 + 160, top, 2, bot - top, F('#1A1A14'));
};

const paintChunk = (z: Zone, g: Ctx, i: number, u0: number, top: number, bot: number) => {
  if (z === 'culvert') paintCulvertChunk(g, i, u0, top, bot);
  else if (z === 'yard') paintYardChunk(g, i, u0, top, bot);
  else paintStoreChunk(g, i, u0, top, bot);
};

/** The far plane behind the vault's arches: the junk heaped in the dark (a Ferris wheel, a coaster's loop, a head). */
const drawFarJunk = (c: Ctx, v: V) => {
  const s = S_FAR, ox = offX(v, s), oy = offY(v, s);
  // (it's only ever seen through the vault's arches: kept to where the vault's wall is on screen, and laid on well past
  // the vault's ends on its own plane, so there's always junk behind an arch whichever way the eye's looking)
  const wa = pX(v, S_BACK, R(YARD)), wb = pX(v, S_BACK, R(STORE));
  const a = Math.max(R(YARD) - 1600, unX(v, s, Math.max(v.l, wa) - 260)), b = Math.min(R(STORE) + 1600, unX(v, s, Math.min(v.r, wb) + 4));
  if (b <= a || wb < v.l || wa > v.r) return;
  c.save(); c.beginPath(); c.rect(wa, WS, wb - wa, BOTTOM - WS + 200); c.clip(); c.translate(ox, oy);
  const top = CEIL * s, bot = BOTTOM * s;
  const SIL = '#0B2530', RIM = '#1E4A55';
  box(c, a * s, top, (b - a) * s, bot - top, '#0A2029');
  // (the Ferris wheel, a coaster loop, the mascot's head: one each, in turn along it)
  for (let k = Math.floor(a * s / 260); k * 260 < b * s; k++) {
    const x = k * 260, y = bot - 20, kind = k % 4;
    if (kind === 0) {
      c.strokeStyle = SIL; c.lineWidth = 4; c.beginPath(); c.arc(x + 120, y - 120, 96, 0, Math.PI * 2); c.stroke();
      for (let sp = 0; sp < 8; sp++) { const an = sp * Math.PI / 4; c.beginPath(); c.moveTo(x + 120, y - 120); c.lineTo(x + 120 + Math.cos(an) * 96, y - 120 + Math.sin(an) * 96); c.stroke(); }
      c.strokeStyle = RIM; c.lineWidth = 2; c.beginPath(); c.arc(x + 120, y - 120, 96, Math.PI * 1.1, Math.PI * 1.5); c.stroke();
      for (let sp = 0; sp < 8; sp += 2) { const an = sp * Math.PI / 4 + 0.2; box(c, x + 112 + Math.cos(an) * 96, y - 120 + Math.sin(an) * 96, 16, 12, SIL); }
    } else if (kind === 1) {
      c.strokeStyle = SIL; c.lineWidth = 6; c.beginPath(); c.moveTo(x, y - 20); c.bezierCurveTo(x + 120, y - 30, x + 160, y - 200, x + 100, y - 200); c.bezierCurveTo(x + 40, y - 200, x + 60, y - 60, x + 240, y - 40); c.stroke();
      for (let k2 = 0; k2 < 6; k2++) box(c, x + 20 + k2 * 40, y - 30, 4, 30, SIL);
    } else if (kind === 2) {
      // (the old mascot's fiberglass head, on its side, grinning)
      c.fillStyle = SIL; c.beginPath(); c.ellipse(x + 130, y - 50, 70, 54, 0.3, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(x + 80, y - 110, 26, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(x + 180, y - 100, 26, 0, Math.PI * 2); c.fill();
      c.fillStyle = RIM; box(c, x + 100, y - 70, 10, 10, RIM); box(c, x + 140, y - 64, 10, 10, RIM);
      c.strokeStyle = RIM; c.lineWidth = 3; c.beginPath(); c.arc(x + 128, y - 50, 30, 0.3, 2.6); c.stroke();
    } else {
      // (bumper cars stacked up)
      for (let r = 0; r < 3; r++) for (let q = 0; q < 3 - r; q++) { box(c, x + 30 + q * 64 + r * 32, y - 30 - r * 34, 58, 30, SIL); box(c, x + 30 + q * 64 + r * 32, y - 30 - r * 34, 58, 2, RIM); }
    }
  }
  c.restore();
};

/** The open river's far bed: two ridges of rock and weed going off into the murk. */
const drawRidges = (c: Ctx, v: V) => {
  const a = Math.max(R(DOCK), v.l - 4), b = Math.min(R(TUNNEL.x1), v.r + 4);
  if (b <= a) return;
  for (const [s, k] of [[S_RIDGE2, 0.75], [S_RIDGE, 0.55]] as [number, number][]) {
    const ox = offX(v, s), oy = offY(v, s), base = BOTTOM - 140;
    const col = mix(waterAt('open', 0.7, v.tod), '#06202A', k * 0.6), rim = mix(col, waterAt('open', 0.25, v.tod), 0.35);
    for (let x = Math.floor(a / 4) * 4; x < b; x += 4) {
      const u = (x - ox) / s;
      const hgt = 40 + 50 * (0.5 + 0.5 * Math.sin(u * 0.006 + s * 9) * Math.cos(u * 0.0023 + s * 3)) + 14 * Math.sin(u * 0.031 + s);
      const y = Math.round((base - hgt) * s + oy);
      box(c, x, y, 4, v.b - y + 4, col);
      box(c, x, y, 4, 2, rim);
    }
  }
};

/** The tunnel's back wall (by zone, stamped in chunks), the ceiling and floor planes running back to it. */
const drawTunnelBack = (c: Ctx, v: V) => {
  const s = S_BACK, ox = offX(v, s), oy = offY(v, s);
  const t0 = R(TUNNEL.x1), t1 = R(TUNNEL.x2);
  const a = Math.max(t0, unX(v, s, v.l - 8)), b = Math.min(t1, unX(v, s, v.r + 8));
  if (b > a) {
    c.save();
    // (only what's inside the tunnel's own front: past its ends, it's not there)
    c.beginPath(); c.rect(t0, WS, t1 - t0, BOTTOM - WS + 200); c.clip();
    c.translate(ox, oy);
    const top = Math.round(WALL_TOP * s), bot = Math.round(WALL_BOT * s) + 120;
    const walled = (z: Zone) => z === 'culvert' || z === 'yard' || z === 'store';
    for (let i = Math.floor(a * s / CHUNK); i * CHUNK < b * s; i++) {
      const u0 = i * CHUNK;
      const zl = zoneAt(u0 / s - x0), zr = zoneAt((u0 + CHUNK) / s - x0 - 0.01);
      if (!walled(zl) && !walled(zr)) continue;
      // (the seams between two zones' walls near it: each side its own, the seam where the zone changes on this plane
      // (the same place it changes on the floor and in the water), the piece that bridges them over it)
      const near = WALL_SEAMS.filter(([sx]) => { const uS = R(sx) * s; return uS > u0 - 64 && uS < u0 + CHUNK + 64; });
      if (!near.length && zl === zr) { stamp(c, `uw-${zl}-${i}`, u0, top, CHUNK, bot - top, g => paintChunk(zl, g, i, u0, top, bot)); continue; }
      stamp(c, `uw-seam-${i}`, u0, top, CHUNK, bot - top, g => {
        const uS = zl === zr ? u0 + CHUNK : R(ZONES.find(zn => zn.z === zr)!.a) * s;
        // (a zone with no wall of its own here (the open river's, past the tunnel's mouth) is left bare: it's clipped off)
        for (const [z, xa, xb] of [[zl, u0, uS], [zr, uS, u0 + CHUNK]] as [Zone, number, number][]) {
          if (!walled(z) || xb <= xa) continue;
          g.save(); g.beginPath(); g.rect(xa, top, xb - xa, bot - top); g.clip(); paintChunk(z, g, i, u0, top, bot); g.restore();
        }
        g.save(); g.beginPath(); g.rect(u0, top, CHUNK, bot - top); g.clip();
        for (const [sx, za, zb] of near) paintPortal(g, R(sx) * s, top, bot, za, zb);
        g.restore();
      });
    }
    c.restore();
    // (the vault's far junk shows through its arches: under the wall, drawn after it by punching through... see drawFarJunk)
  }
  // (the tunnel's ends: the side of its mouth, seen in perspective, where the back wall's drawn in from its front)
  const side = (wx: number, fromLeft: boolean) => {
    const bx = pX(v, s, wx);
    const xa = Math.min(bx, wx), xb = Math.max(bx, wx);
    if ((fromLeft && bx >= wx) || (!fromLeft && bx <= wx) || !onScreen(v, xa, xb)) return;
    box(c, xa, CEIL, xb - xa, BOTTOM - CEIL, fogged(CONC[1], 0.3));
    // (the courses of its concrete, closing up toward the back: lines from the front edge to the back plane's)
    for (let wy = CEIL + 40; wy < BOTTOM; wy += 60) {
      const by = pY(v, s, wy);
      for (let k = 0; k <= 1; k += 0.08) box(c, Math.round(wx + (bx - wx) * k), Math.round(wy + (by - wy) * k), 2, 1, fogged(CONC[0], 0.3));
    }
    box(c, fromLeft ? xa : xb - 2, CEIL, 2, BOTTOM - CEIL, fogged(CONC[3], 0.3));
    box(c, fromLeft ? xb - 3 : xa, CEIL, 3, BOTTOM - CEIL, fogged(CONC[4], 0.25));
  };
  side(t0, false); side(t1, true);
};

/** The floor running back from the bed to the back plane (the river's sand, the culvert's silted concrete, the tank's
 * gravel), banded, furrows fanning toward the eye, the caustics crawling over it where the light gets down. Each column
 * is worked out piece by piece going back, each piece's zone by the world x it's at at its depth: where one zone's floor
 * gives onto the next, the seam runs back along the line to the eye (as the back wall's seam does), not straight down
 * the screen. `zoneOf` (a relative x) says whose floor that is, null for none of this pass's (left as it is). */
const SAND: Record<Zone, string[]> = {
  open: ['#3D4A3A', '#4E5A44', '#62694E', '#7A7C5C'],
  culvert: ['#2E3A38', '#38463F', '#435146', '#4F5D4E'],
  yard: ['#2C3838', '#35423F', '#3F4C46', '#4A564E'],
  store: ['#2E3A36', '#37443C', '#414E44', '#4C584C'],
  tank: ['#4E5E78', '#5C6C86', '#6C7C94', '#7E8EA4'],
  drain: ['#202A2A', '#283232', '#303A3A', '#384242'],
};
/** The pieces down a column: each band split in two, so a seam steps across it finely. */
const FLOOR_K = [0, 0.09, 0.18, 0.3, 0.42, 0.56, 0.7, 0.85, 1];
const drawFloorPlane = (c: Ctx, v: V, s: number, a: number, b: number, zoneOf: (rx: number) => Zone | null) => {
  const pal = new Map<Zone, string[]>();
  const colsOf = (z: Zone) => { let p = pal.get(z); if (!p) { p = SAND[z].map(col => mix(col, waterAt(z, 0.75, v.tod), 0.35)); pal.set(z, p); } return p; };
  const eye = v.cx + CANVAS_WIDTH / 2;
  const path = new Path2D();
  let lit = false;
  for (let x = Math.floor(Math.max(a, v.l - 4) / 4) * 4; x < Math.min(b, v.r + 4); x += 4) {
    const front = bedAt(x + 2 - x0);
    const back = pY(v, s, bedAt(unX(v, s, x + 2) - x0));
    if (back >= front - 1) continue;
    const span = front - back;
    for (let j = 0; j < 8; j++) {
      const ya = Math.round(back + span * FLOOR_K[j]), yb = Math.round(back + span * FLOOR_K[j + 1]);
      if (yb <= ya) continue;
      const sk = s + (1 - s) * (FLOOR_K[j] + FLOOR_K[j + 1]) / 2, u = (x + 2 - eye * (1 - sk)) / sk;
      const z = zoneOf(u - x0);
      if (!z) continue;
      box(c, x, ya, 4, yb - ya + (j === 7 ? 1 : 0), colsOf(z)[j >> 1]);
      if (z === 'open' || z === 'tank') { path.rect(x, ya, 4, yb - ya); lit = true; }
    }
  }
  // (the furrows and the ripples: dots along lines from the back to the front, each at one world x all the way)
  for (let wx = Math.floor((Math.max(a, v.l) - 100) / 64) * 64; wx < Math.min(b, v.r) + 100; wx += 64) {
    const z = zoneOf(wx - x0);
    if (!z) continue;
    const fy = bedAt(wx - x0), bxp = pX(v, s, wx), byp = pY(v, s, bedAt(wx - x0));
    if (byp >= fy - 2) continue;
    for (let k = 0.1; k < 1; k += 0.12) {
      const x = Math.round(bxp + (wx - bxp) * k), y = Math.round(byp + (fy - byp) * k);
      if (x < a || x > b) continue;
      box(c, x, y, 2, 1, colsOf(z)[3]);
    }
  }
  if (!lit) return;
  const lightK = 0.22 * (0.35 + 0.65 * Math.max(0, Math.min(1, v.tod.sunH + 0.4)));
  c.save(); c.beginPath(); c.rect(a, v.t, b - a, CANVAS_HEIGHT); c.clip(); causticOver(c, v, path, lightK, s); c.restore();
};
const causticOver = (c: Ctx, v: V, path: Path2D, a: number, s: number) => {
  c.save();
  c.clip(path);
  c.beginPath(); c.rect(v.l - 10, v.t - 10, CANVAS_WIDTH + 20, CANVAS_HEIGHT + 20);
  causticFill(c, v, a, '#FFFFFF', offX(v, s), offY(v, s));
  c.restore();
};

/** The tunnel's ceiling plane (the culvert's top slab's underside, running back), its joints fanning out. */
const drawCeilingPlane = (c: Ctx, v: V) => {
  const s = S_BACK, t0 = R(TUNNEL.x1), t1 = R(TUNNEL.x2);
  const a = Math.max(t0, v.l - 4), b = Math.min(t1, v.r + 4);
  if (b <= a) return;
  const back = pY(v, s, CEIL);
  if (back <= CEIL + 1) return;
  const C = CONC.map(col => fogged(col, 0.3));
  // (banded, darker back toward the wall)
  const span = back - CEIL;
  for (let k = 0; k < 3; k++) box(c, a, Math.round(CEIL + span * k / 3), b - a, Math.ceil(span / 3) + 1, C[2 - k]);
  // (the joints between the precast sections: lines from front to back)
  for (let wx = Math.floor((a - x0 - 200) / 160) * 160; wx < b - x0 + 200; wx += 160) {
    const fx = R(wx), bx = pX(v, s, R(wx));
    for (let k = 0; k <= 1; k += 0.1) {
      const x = Math.round(fx + (bx - fx) * k), y = Math.round(CEIL + span * k);
      if (x >= a && x < b) box(c, x, y, 2, 2, C[0]);
    }
  }
  // (the pockets' shafts: open up through it, the light coming down them)
  for (const p of POCKETS) {
    const fa = R(p.x), fb = R(p.x + p.w), ba = pX(v, s, fa), bb = pX(v, s, fb);
    if (!onScreen(v, Math.min(fa, ba), Math.max(fb, bb))) continue;
    c.fillStyle = mix(C[4], rayColor(v.tod), 0.3);
    c.beginPath(); c.moveTo(fa, CEIL); c.lineTo(fb, CEIL); c.lineTo(bb, back); c.lineTo(ba, back); c.closePath(); c.fill();
  }
};

/** The light coming down: the sun's (or the moon's) color for the hour. */
export const rayColor = (tod: TimeOfDay) => {
  const L = tod.p * 9;
  return L <= 5 ? mix('#FFF4D2', tod.sun, 0.3) : L <= 7.5 ? mix('#FFE0A0', tod.sunGlow, 0.4) : '#A8C4F0';
};
const rayStrength = (tod: TimeOfDay) => 0.06 + 0.07 * Math.max(0, Math.min(1, tod.sunH + 0.3));

export const drawUnderWater = (c: Ctx, state: GameState) => {
  const v = viewOf(state);
  if (!onScreen(v, R(DOCK), R(PIPE.x2)) || v.b < WS) return;
  fillWater(c, v);
  // The open river: the far ridges, the floor plane running back to them
  if (onScreen(v, R(DOCK), R(TUNNEL.x1))) { drawRidges(c, v); drawFloorPlane(c, v, S_BACK, R(DOCK), R(TUNNEL.x1), () => 'open'); }
  // The tunnel: the back wall, the junk through the vault's arches, the ceiling and floor planes
  if (onScreen(v, R(TUNNEL.x1), R(TUNNEL.x2))) {
    drawFarJunkUnder(c, v);
    drawTunnelBack(c, v);
    // (in the tunnel's front only; what of it's back past the tunnel's ends is behind the mouths' sides, drawn already)
    drawFloorPlane(c, v, S_BACK, R(TUNNEL.x1), R(TUNNEL.x2), rx => (rx < TUNNEL.x1 || rx >= TUNNEL.x2 ? null : zoneAt(rx)));
    drawCeilingPlane(c, v);
  }
  // (the tank's and the drain's backs are their own: under-tank.ts, drawn next, before the wobble)
};
/** The wobble, over everything painted of the water so far. */
export const drawUnderWave = (c: Ctx, state: GameState) => {
  const v = viewOf(state);
  if (!onScreen(v, R(DOCK), R(PIPE.x2)) || v.b < WS) return;
  wave(c, v, Math.max(R(DOCK), v.l), Math.min(R(PIPE.x2), v.r), Math.max(WS + 2, v.t), Math.min(BOTTOM, v.b));
};
/** (The far junk goes in first, the wall over it: its arches are cut through to show it.) */
const drawFarJunkUnder = (c: Ctx, v: V) => drawFarJunk(c, v);

// ---------------------------------------------------------------------------------------------------------------
// The light down through the water

/** A shaft of light: stepped bands down its length, each fainter and wider, added on. */
export const ray = (c: Ctx, x: number, y: number, w: number, len: number, lean: number, col: string, a: number) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(col.slice(i, i + 2), 16));
  for (let i = 0; i < 4; i++) {
    const k0 = i / 4, k1 = (i + 1) / 4;
    const ya = y + len * k0, yb = y + len * k1, wa = w * (1 + k0 * 0.7), wb = w * (1 + k1 * 0.7);
    const xa = x + lean * len * k0, xb = x + lean * len * k1;
    c.fillStyle = `rgba(${r}, ${g}, ${b}, ${(a * (1 - k0 * 0.85)).toFixed(3)})`;
    c.beginPath(); c.moveTo(xa - wa / 2, ya); c.lineTo(xa + wa / 2, ya); c.lineTo(xb + wb / 2, yb); c.lineTo(xb - wb / 2, yb); c.closePath(); c.fill();
  }
};

/** The sun's shafts in the open river; the light down each air pocket's grate. */
export const drawRays = (c: Ctx, state: GameState) => {
  const v = viewOf(state), f = v.f;
  const col = rayColor(v.tod), a0 = rayStrength(v.tod);
  c.save();
  c.globalCompositeOperation = 'lighter';
  if (onScreen(v, R(DOCK), R(FALLS.x))) {
    c.save(); c.beginPath(); c.rect(R(DOCK), WS, FALLS.x - DOCK, BOTTOM - WS); c.clip();
    // (they drift with the ripples: on a near plane, a little parallax)
    const base = v.cx * 0.08;
    for (let k = Math.floor((v.l - base - 300) / 130); base + k * 130 < v.r + 300; k++) {
      const h = hash(k * 1.7);
      if (h < 0.35) continue;
      const x = base + k * 130 + h * 60 + Math.sin(f * 0.012 + k) * 14;
      ray(c, x, WS, 10 + h * 22, 330, 0.28, col, a0 * (0.6 + 0.4 * Math.sin(f * 0.02 + k * 2)));
    }
    c.restore();
  }
  // (each pocket: a grate in the chamber's roof, the day (or the night) coming down through it, into the tunnel)
  const pc = mix(col, '#FFFFFF', 0.2), pa = Math.max(0.09, a0 * 1.4);
  for (const p of POCKETS) {
    if (!onScreen(v, R(p.x) - 120, R(p.x + p.w) + 200)) continue;
    for (let k = 0; k < 3; k++) {
      const x = R(p.x + 50 + k * 50) + Math.sin(f * 0.015 + k) * 3;
      ray(c, x, POCKET_TOP + 8, 12, bedAt(p.x + 100) - POCKET_TOP, 0.12, pc, pa * (0.75 + 0.25 * Math.sin(f * 0.03 + k * 1.7)));
    }
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The weed: kelp in the open river, a few strands in the vault, pond weed in the storage room, the tank's plastic plants

interface Weed { x: number; h: number; seed: number; kind: 'kelp' | 'reed' | 'plastic' }
let WEEDS: Weed[] | null = null;
const weeds = () => {
  if (WEEDS) return WEEDS;
  WEEDS = [];
  const clear = (x: number) => !PROPS.some(p => x > p.x - 16 && x < p.x + p.w + 16) && !VENTS.some(vx => Math.abs(vx - x) < 30);
  for (let x = DOCK + 40; x < PIPE.x2; x += 22) {
    const h = hash(x * 0.37), z = zoneAt(x);
    if (!clear(x)) continue;
    if (z === 'open' && h > 0.35 && x < FALLS.x - 30) WEEDS.push({ x, h: 50 + hash(x) * 130, seed: h * 10, kind: h > 0.8 ? 'reed' : 'kelp' });
    else if ((z === 'yard' || z === 'store') && h > 0.82) WEEDS.push({ x, h: 30 + hash(x) * 60, seed: h * 10, kind: 'reed' });
    else if (z === 'culvert' && h > 0.9) WEEDS.push({ x, h: 20 + hash(x) * 40, seed: h * 10, kind: 'reed' });
    else if (z === 'tank' && h > 0.86 && x > TANK.x1 + 60 && x < TANK.x2 - 120) WEEDS.push({ x, h: 50 + hash(x) * 40, seed: h * 10, kind: 'plastic' });
  }
  return WEEDS;
};
const KELP = ['#123A22', '#1B5230', '#256A3A', '#378446', '#58A05A'];
const REED = ['#2A3A1A', '#3B5224', '#4E6A2E', '#68843C', '#86A050'];
const PLASTIC = ['#0E5A2A', '#16803A', '#22A84A', '#4ED070', '#9AF0A8'];

const drawWeed = (c: Ctx, w: Weed, f: number, tod: TimeOfDay) => {
  const x = R(w.x), y = bedAt(w.x), z = zoneAt(w.x);
  const pal = (w.kind === 'kelp' ? KELP : w.kind === 'reed' ? REED : PLASTIC).map(col => mix(col, waterAt(z, 0.6, tod), w.kind === 'plastic' ? 0.15 : 0.32));
  const segs = Math.round(w.h / 6);
  // (plastic plants don't sway much: they're plastic. They've got a base, and a sticker on it)
  const sw = w.kind === 'plastic' ? 0.25 : 1;
  let px = x;
  for (let i = 0; i < segs; i++) {
    const t = i / segs;
    const sway = Math.round((Math.sin(f * 0.024 + w.seed * 7 + i * 0.32) * t * t * 12 + Math.sin(f * 0.041 + w.seed + i * 0.55) * t * 2.5) * sw);
    const sx = x + sway, sy = y - i * 6;
    const wdt = w.kind === 'kelp' ? 4 : 2;
    box(c, sx - wdt / 2, sy - 7, wdt, 7, pal[1]);
    box(c, sx - wdt / 2, sy - 7, 1, 7, pal[3]);
    // (the fronds: off alternate sides, bigger on kelp)
    if (i % 2 === 1 && i < segs - 1) {
      const side = (i >> 1) % 2 ? 1 : -1, L = w.kind === 'kelp' ? 8 + Math.round(4 * (1 - t)) : w.kind === 'plastic' ? 9 : 5;
      for (let q = 1; q <= L; q += 2) box(c, sx + side * q - (side < 0 ? 2 : 0), sy - 4 - Math.round(q * 0.45), 2, w.kind === 'kelp' ? 3 : 2, q > L - 3 ? pal[3] : pal[2]);
      if (w.kind !== 'reed') box(c, sx + side * 2, sy - 5, 2, 1, pal[4]);
    }
    px = sx;
  }
  if (w.kind === 'kelp') box(c, px - 2, y - segs * 6 - 4, 4, 4, pal[3]);
  if (w.kind === 'plastic') { box(c, x - 7, y - 4, 14, 4, '#2A2A30'); box(c, x - 7, y - 4, 14, 1, '#5A5A64'); }
};

export const drawWeeds = (c: Ctx, state: GameState) => {
  const v = viewOf(state);
  for (const w of weeds()) if (R(w.x) > v.l - 30 && R(w.x) < v.r + 30) drawWeed(c, w, v.f, v.tod);
};

// ---------------------------------------------------------------------------------------------------------------
// The rock and the roof: the culvert's top slab (and the earth over it), the pockets' chambers, the bed

const EARTH = ['#1A140E', '#241B12', '#2E2318', '#3A2C1E', '#4A3826'];

/** A run of the culvert's roof (front plane): the slab's front edge, the fill over it. */
const paintRoof = (g: Ctx, a: number, b: number, bottom: number, i: number) => {
  // (the earth, banded, stones in it)
  box(g, a, bottom - ROOF_H, b - a, ROOF_H, EARTH[1]);
  for (let k = 0; k < 4; k++) checker(g, a, bottom - ROOF_H + 20 + k * 70, b - a, 6, EARTH[k % 2 ? 0 : 2], k % 2);
  for (let k = 0; k < (b - a) / 30; k++) {
    const sx = a + Math.floor(hash(i * 131 + k) * (b - a)), sy = bottom - 40 - Math.floor(hash(i * 71 + k * 3) * (ROOF_H - 50));
    box(g, sx, sy, 6, 4, EARTH[3]); box(g, sx, sy, 6, 1, EARTH[4]); box(g, sx, sy + 4, 6, 1, EARTH[0]);
  }
  // (the slab: precast concrete, its front edge lit on top, the underside shaded; joints every 160)
  const C = CONC;
  box(g, a, bottom - 30, b - a, 30, C[2]);
  box(g, a, bottom - 30, b - a, 2, C[4]); checker(g, a, bottom - 28, b - a, 2, C[3]);
  box(g, a, bottom - 6, b - a, 4, C[1]); box(g, a, bottom - 2, b - a, 2, C[0]);
  for (let x = Math.ceil((a - x0) / 160) * 160 + x0; x < b; x += 160) { box(g, x, bottom - 30, 2, 30, C[0]); box(g, x + 2, bottom - 30, 1, 30, C[4]); }
  // (drips of calcite off the joints)
  for (let x = Math.ceil((a - x0) / 160) * 160 + x0; x < b; x += 160) { box(g, x - 1, bottom, 3, 4, '#8A9A94'); box(g, x, bottom + 4, 1, 3, '#8A9A94'); }
};

/** An air pocket's chamber: the shaft up through the roof, a concrete room over the water with a grate in its roof. */
const paintPocket = (g: Ctx, p: { x: number; w: number }, n: number) => {
  const a = R(p.x), b = R(p.x + p.w), top = POCKET_TOP;
  const C = CONC;
  // (the back wall, the side walls in steps (they're near: the walls run back from the shaft's edges), the roof)
  box(g, a, top, b - a, WS - top + 2, C[1]);
  checker(g, a, WS - 30, b - a, 30, '#2E4A3A');
  box(g, a, WS - 4, b - a, 4, '#3E5A44');
  box(g, a, top, 14, CEIL - top, C[3]); box(g, a, top, 2, CEIL - top, C[4]);
  box(g, b - 14, top, 14, CEIL - top, C[0]);
  box(g, a + 14, top, b - a - 28, 10, C[0]);
  // (the grate in the roof: bars, the daylight between)
  box(g, a + 40, top - 4, b - a - 80, 6, '#E8F0F0');
  for (let x = a + 40; x < b - 40; x += 10) box(g, x, top - 4, 4, 6, '#3A3A38');
  // (the sign: mounted, bolted on)
  sign(g, a + 30, top + 26, b - a - 60, 26, '#E8C030', 'CONFINED SPACE', '#1A1408', 7);
  signAt(g, `MAINT. ACCESS ${n}`, (a + b) / 2, top + 66, 6, { ...stencil(6, '#B8C0BC'), shadow: INK });
  // (a pipe along the wall, a valve wheel)
  box(g, a + 14, top + 90, b - a - 28, 6, '#5A4A3A'); box(g, a + 14, top + 90, b - a - 28, 1, '#8A7A6A');
  g.strokeStyle = '#B83A2A'; g.lineWidth = 2; g.beginPath(); g.arc(b - 50, top + 93, 8, 0, Math.PI * 2); g.stroke();
};

/** How much of the earth over the roof is in its stamp (the rest, on up, is painted live: plain banded earth). */
const ROOF_H = 300;
/** Plain earth, banded (live: it's big, and there's nothing on it). */
const earth = (c: Ctx, v: V, a: number, b: number, top: number, bottom: number) => {
  const x0_ = Math.max(a, v.l - 4), x1_ = Math.min(b, v.r + 4), y0 = Math.max(top, v.t - 4), y1 = Math.min(bottom, v.b + 4);
  if (x1_ <= x0_ || y1 <= y0) return;
  box(c, x0_, y0, x1_ - x0_, y1 - y0, EARTH[1]);
  for (let y = Math.ceil((y0 - top) / 110) * 110 + top; y < y1; y += 110) checker(c, x0_, y, x1_ - x0_, 6, EARTH[Math.round((y - top) / 110) % 2 ? 0 : 2]);
};

/** The concrete wall at the far end of the tank, over the intake (front plane: it's solid), the earth over the pipe. */
const drawTankEnd = (c: Ctx, v: V) => {
  const a = R(TANK.x2), b = R(PIPE.x2 + 600), bottom = PIPE.top;
  earth(c, v, a + 60, b, bottom - 1600, bottom - 36);
  earth(c, v, a, a + 60, bottom - 1600, bottom - 700);
  // (the pipe's casing along the bottom, over the pipe: a concrete band, its joints)
  const xa = Math.max(a + 60, v.l - 4), xb = Math.min(b, v.r + 4);
  if (xb > xa) {
    box(c, xa, bottom - 36, xb - xa, 36, CONC[3]); box(c, xa, bottom - 36, xb - xa, 2, CONC[5]); box(c, xa, bottom - 4, xb - xa, 4, CONC[0]);
    for (let x = a + 60 + Math.ceil((xa - a - 60) / 120) * 120; x < xb; x += 120) box(c, x, bottom - 36, 2, 36, CONC[0]);
  }
  // (the tank's end wall, and the warning over the intake: stamped)
  if (onScreen(v, a, a + 320)) stamp(c, 'uw-tankend', a, bottom - 700, 320, 700, paintTankEnd);
};
/** Past the pipe's burst end: earth, solid, down past the bed and on past the screen's last edge; the pipe's concrete
 * collar round its end (the grate was bolted into it). */
const drawPipeEnd = (c: Ctx, v: V) => {
  const a = R(PIPE.x2), b = R(PIPE.x2 + 600), top = PIPE.top - 36;
  earth(c, v, a, b, top, Math.max(v.b + 8, BOTTOM + 400));
  // (the collar: poured round the pipe's mouth, lit on its left, a lip of it over the top and under the bottom)
  const bed = Math.round(bedAt(PIPE.x2 - 1));
  if (!onScreen(v, a - 4, a + 30)) return;
  box(c, a, top, 24, bed - top + 30, CONC[3]); box(c, a, top, 3, bed - top + 30, CONC[5]); box(c, a + 3, top, 2, bed - top + 30, CONC[4]);
  box(c, a + 20, top, 4, bed - top + 30, CONC[1]);
  for (let y = top + 20; y < bed + 30; y += 32) { box(c, a + 6, y, 12, 2, CONC[1]); box(c, a + 6, y + 2, 12, 1, CONC[4]); }
  for (let y = top + 10; y < bed + 20; y += 24) box(c, a + 10, y, 4, 4, '#5A3A22');
  checker(c, a + 24, top, 6, bed - top + 30, EARTH[0]);
};
const paintTankEnd = (g: Ctx) => {
  const a = R(TANK.x2), bottom = PIPE.top;
  // (the tank's end wall: poured concrete, painted aquarium blue, its lifts' joints)
  box(g, a, bottom - 700, 60, 700, '#3A5A6A');
  box(g, a, bottom - 700, 4, 700, '#6A8A9A'); box(g, a + 56, bottom - 700, 4, 700, '#22343E');
  for (let y = bottom - 700; y < bottom; y += 40) box(g, a, y, 60, 2, '#2A4250');
  // (hazard stripes round the intake's mouth, the warning stenciled over it)
  for (let k = 0; k < 8; k++) box(g, a + k * 8, bottom - 12, 8, 12, k % 2 ? '#1A1A14' : '#E8C030');
  for (let y = bottom - 120; y < bottom - 12; y += 8) box(g, a, y, 8, 8, ((y - bottom) / 8) % 2 ? '#1A1A14' : '#E8C030');
  sign(g, a + 70, bottom - 130, 220, 40, '#C02020', 'DANGER: INTAKE', '#F8F0E0', 10, INK, enamel({ sx: 2, sy: 2 }, '#F8F0E0', '#5C0A0A'));
  signAt(g, 'STORM DRAIN  KEEP CLEAR', a + 180, bottom - 66, 8, { ...stencil({ sx: 1, sy: 2 }, '#E8C030'), shadow: INK });
};

/** The bed, a chunk of it: the lit lip along the top (stood on), sand or silt over the floor under it, stones in it. */
const BED_CHUNK = 400;
const LIP: Record<Zone, string[]> = {
  open: ['#3A3020', '#54462E', '#706040', '#8E7C52', '#B49E68', '#DCC690'],
  culvert: ['#2A2C26', '#3C3E34', '#525446', '#6A6C58', '#8E8E72', '#C4C2A0'],
  yard: ['#2A2C26', '#3C3E34', '#525446', '#6A6C58', '#8E8E72', '#C4C2A0'],
  store: ['#2A2C26', '#3C3E34', '#525446', '#6A6C58', '#8E8E72', '#C4C2A0'],
  tank: ['#3A3E50', '#525870', '#6A7290', '#8890AC', '#A8B0C8', '#DCE2F0'],
  drain: ['#20221E', '#303228', '#424436', '#565846', '#727460', '#A4A68A'],
};
const paintBed = (g: Ctx, i: number) => {
  const a = i * BED_CHUNK, b = a + BED_CHUNK;
  for (let rx = a; rx < b; rx += 2) {
    if (rx < BED[0][0]) continue;
    const z = zoneAt(rx), L = LIP[z], top = Math.round(bedAt(rx + 1)), x = R(rx);
    const concrete = z !== 'open';
    // (the depths: lip, sand, sand darker, then (built zones) the concrete floor under the silt, else rock)
    box(g, x, top, 2, 2, L[5]);
    box(g, x, top + 2, 2, 4, L[4]);
    box(g, x, top + 6, 2, 10, L[3]);
    box(g, x, top + 16, 2, 16, L[2]);
    if (concrete) {
      box(g, x, top + 32, 2, 22, CONC[3]); box(g, x, top + 32, 2, 2, CONC[5]); box(g, x, top + 54, 2, 300, CONC[1]);
      if (rx % 40 === 0) box(g, x, top + 40, 2, 2, '#6A3A1A');
    } else box(g, x, top + 32, 2, 320, L[1]);
    // (stones)
    const h = hash(rx * 0.71);
    if (h > 0.86) { const sy = top + 8 + Math.floor(hash(rx) * 20); box(g, x, sy, 6, 4, L[1]); box(g, x, sy, 6, 1, L[4]); }
    if (!concrete && h < 0.08) { const sy = top + 40 + Math.floor(hash(rx * 3) * 120); box(g, x, sy, 10, 8, L[0]); box(g, x, sy, 10, 2, L[2]); }
  }
  // (dither where the steps meet)
  for (let rx = a; rx < b; rx += 2) {
    if (rx < BED[0][0]) continue;
    const z = zoneAt(rx), L = LIP[z], top = Math.round(bedAt(rx + 1)), x = R(rx);
    if ((rx >> 1) % 2) { box(g, x, top + 6, 2, 2, L[4]); box(g, x, top + 16, 2, 2, L[3]); box(g, x, top + 32, 2, 2, L[2]); }
  }
};

export const drawRockAndBed = (c: Ctx, state: GameState) => {
  const v = viewOf(state);
  // The culvert's roof, in runs between the pockets, and each pocket's chamber
  let x = TUNNEL.x1, n = 1;
  const roofRun = (a: number, b: number) => {
    if (!onScreen(v, R(a), R(b))) return;
    // (stamped a chunk at a time)
    for (let k = Math.floor(Math.max(a, v.l - x0 - 10) / 400); k * 400 < Math.min(b, v.r - x0 + 10); k++) {
      const ca = Math.max(a, k * 400), cb = Math.min(b, (k + 1) * 400);
      if (cb <= ca) continue;
      stamp(c, `uw-roof-${ca}-${cb}`, R(ca), CEIL - ROOF_H, cb - ca, ROOF_H + 10, g => paintRoof(g, R(ca), R(cb), CEIL, ca));
    }
  };
  for (const p of POCKETS) {
    roofRun(x, p.x);
    if (onScreen(v, R(p.x), R(p.x + p.w))) {
      // (over the chamber: the earth on up)
      stamp(c, `uw-pocketroof-${n}`, R(p.x), POCKET_TOP - ROOF_H, p.w, ROOF_H, g => paintRoof(g, R(p.x), R(p.x + p.w), POCKET_TOP, p.x));
      earth(c, v, R(p.x), R(p.x + p.w), CEIL - 1600, POCKET_TOP - ROOF_H);
      stamp(c, `uw-pocket-${n}`, R(p.x), POCKET_TOP - 6, p.w, WS - POCKET_TOP + 46, g => paintPocket(g, p, n));
    }
    x = p.x + p.w; n++;
  }
  roofRun(x, TUNNEL.x2);
  // (the earth over the tunnel's roof, on up)
  x = TUNNEL.x1;
  for (const p of POCKETS) { earth(c, v, R(x), R(p.x), CEIL - 1600, CEIL - ROOF_H); x = p.x + p.w; }
  earth(c, v, R(x), R(TUNNEL.x2), CEIL - 1600, CEIL - ROOF_H);
  // (the tunnel's mouth into the tank: a concrete headwall edge)
  if (onScreen(v, R(TUNNEL.x2) - 30, R(TUNNEL.x2) + 10)) { box(c, R(TUNNEL.x2) - 24, CEIL - 120, 24, 120, CONC[3]); box(c, R(TUNNEL.x2) - 24, CEIL - 120, 24, 2, CONC[5]); box(c, R(TUNNEL.x2) - 2, CEIL - 120, 2, 120, CONC[1]); }
  // The tank's far end, over the intake
  if (onScreen(v, R(TANK.x2), R(PIPE.x2 + 200))) drawTankEnd(c, v);
  // The bed
  for (let k = Math.floor((v.l - x0 - 10) / BED_CHUNK); k * BED_CHUNK < v.r - x0 + 10; k++) {
    if ((k + 1) * BED_CHUNK < BED[0][0] || k * BED_CHUNK > BED[BED.length - 1][0]) continue;
    const top = Math.min(bedAt(k * BED_CHUNK), bedAt((k + 1) * BED_CHUNK), ...BED.filter(([bx]) => bx >= k * BED_CHUNK && bx <= (k + 1) * BED_CHUNK).map(([, by]) => by));
    stamp(c, `uw-bed-${k}`, R(k * BED_CHUNK), top - 2, BED_CHUNK, 380, g => paintBed(g, k));
  }
  // The rock the pipe goes on into past its end (the section's end: solid to past the last of the screen)
  if (onScreen(v, R(PIPE.x2) - 20, R(PIPE.x2 + 600))) drawPipeEnd(c, v);
  // (the light on the bed's lip: caustics where it's lit from above)
  const lip = new Path2D();
  for (let rx = Math.floor((v.l - x0) / 8) * 8; rx < v.r - x0; rx += 8) {
    const z = zoneAt(rx);
    if (z !== 'open' && z !== 'tank') continue;
    lip.rect(R(rx), Math.round(bedAt(rx + 4)), 8, 16);
  }
  causticOver(c, v, lip, z0Light(v), 1);
};
const z0Light = (v: V) => 0.25 * (0.35 + 0.65 * Math.max(0, Math.min(1, v.tod.sunH + 0.4)));

/** The vents: an aerator's head on the bed (a ring of stone round a brass rose), bubbling. */
export const drawVents = (c: Ctx, state: GameState) => {
  const v = viewOf(state);
  for (const vx of VENTS) {
    if (!onScreen(v, R(vx) - 20, R(vx) + 20)) continue;
    const x = R(vx), y = Math.round(bedAt(vx));
    box(c, x - 14, y - 6, 28, 6, '#3A3A34'); box(c, x - 14, y - 6, 28, 1, '#6A6A5E');
    box(c, x - 8, y - 10, 16, 5, '#8A6A2A'); box(c, x - 8, y - 10, 16, 1, '#E8C060'); box(c, x - 8, y - 6, 16, 1, '#4A3A16');
    for (let k = -6; k <= 6; k += 4) box(c, x + k, y - 9, 2, 2, '#2A1A08');
    // (a steady trickle of little ones over it, and a ring of light off the brass when a big one comes)
    for (let k = 0; k < 4; k++) {
      const t = ((v.f * 1.3 + k * 23 + vx) % 90) / 90;
      const bx = x + Math.round(Math.sin(t * 9 + k) * 3) + (k - 1.5) * 3, by = y - 12 - t * 60;
      box(c, bx, by, 2, 2, `rgba(224, 242, 254, ${(0.8 * (1 - t)).toFixed(2)})`);
    }
    if ((v.f + vx) % 70 < 10) steppedGlow(c, x, y - 10, 16, '#E0F2FE', 0.25, 0, 3);
  }
};

const HOLE_RIM: Record<(typeof EELS)[number]['host'], string> = { rock: '#5C564A', fake: '#5E6E80', boat: '#A8481A', booth: '#1A8AA0' };
/** A row-stepped ellipse (two-pixel rows), filled: the SNES's round. */
const stepOval = (c: Ctx, cx: number, cy: number, rx: number, ry: number, col: string) => {
  for (let y = -ry; y < ry; y += 2) {
    const t = (y + 1) / ry, hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - t * t)));
    if (hw > 0) box(c, cx - hw, cy + y, hw * 2, 2, col);
  }
};
/** A hole in whatever it's in (the scenery's, not the eel's: it's there whether the eel is or not): a broken rim of that
 * thing's own stuff (lit along the top, its lip shadowed under), the dark going in in steps. */
const paintEelHole = (g: Ctx, el: (typeof EELS)[number]) => {
  const m = eelMouth(el), r = rampOf(HOLE_RIM[el.host]);
  const cx = R(m.x) - m.dir * EEL_HOLE.inset, cy = Math.round(m.y), { rx, ry } = EEL_HOLE;
  // (the rim: the stuff round it chipped back, a ring a few pixels out, lit on its top, dark under)
  stepOval(g, cx, cy, rx + 4, ry + 4, r[1]);
  stepOval(g, cx, cy - 1, rx + 3, ry + 2, r[3]);
  stepOval(g, cx, cy + 1, rx + 2, ry + 2, r[0]);
  // (the dark going in: three steps, the deepest off toward the back of it)
  stepOval(g, cx, cy, rx, ry, '#141A18');
  stepOval(g, cx - m.dir * 2, cy, rx - 2, ry - 2, '#0A0E0C');
  stepOval(g, cx - m.dir * 3, cy + 1, rx - 5, ry - 5, '#040605');
  // (the break round it, by what it's in: splinters off the planks, chips off the rock, the paneling's torn edge)
  if (el.host === 'boat') for (const [dx, dy, w, h] of [[-rx - 4, -6, 4, 2], [rx + 1, -9, 5, 2], [-rx - 2, 7, 3, 2], [rx, 6, 4, 2], [-3, -ry - 5, 2, 3]]) box(g, cx + dx, cy + dy, w, h, r[4]);
  else if (el.host === 'booth') for (const [dx, dy] of [[-rx - 3, -4], [rx + 2, 2], [-2, -ry - 4], [3, ry + 3]]) box(g, cx + dx, cy + dy, 3, 3, r[3]);
  else for (const [dx, dy] of [[-rx - 3, -5], [rx + 2, -8], [-rx - 1, 8], [rx + 1, 7]]) { box(g, cx + dx, cy + dy, 3, 2, r[2]); box(g, cx + dx, cy + dy, 3, 1, r[4]); }
  // (slime round the lip, below it, where the eel's dragged itself in and out)
  checker(g, cx - rx, cy + ry + 2, rx * 2, 2, '#2E4A26');
};
export const drawEelHoles = (c: Ctx, state: GameState) => {
  const v = viewOf(state);
  EELS.forEach((el, i) => {
    const x = R(el.x);
    if (!onScreen(v, x - 30, x + 30)) return;
    const m = eelMouth(el);
    stamp(c, `uw-eelhole-${i}`, x - 30, m.y - 24, 60, 48, g => paintEelHole(g, el));
  });
};

// ---------------------------------------------------------------------------------------------------------------
// In front: the surface from below, the silt, the bubbles

export const drawUnderFront = (c: Ctx, state: GameState, rv: River) => {
  const v = viewOf(state), f = v.f;
  if (!onScreen(v, R(DOCK), R(PIPE.x2)) || v.b < WS) return;
  // The surface's underside: bright, broken, wobbling (where it's open to the air)
  const a = Math.max(R(DOCK), v.l - 8), b = Math.min(R(PIPE.x2), v.r + 8);
  if (v.t < WS + 20) {
    const light = mix(rayColor(v.tod), '#E0F7FF', 0.5);
    for (let x = Math.floor(a / 6) * 6; x < b; x += 6) {
      if (roofAt(x - x0) > WS) continue;
      const k = Math.sin(x * 0.07 + f * 0.09) + Math.sin(x * 0.023 - f * 0.05);
      if (k > 0.4) box(c, x, WS + 3 + Math.round(Math.sin(x * 0.11 + f * 0.07)), 4, 2, light);
      else if (k > -0.6) box(c, x, WS + 5, 2, 1, `rgba(224, 247, 255, 0.45)`);
    }
  }
  // The silt: specks drifting, near ones bigger, fewer down in the light (the drain's current takes them along)
  const top = WS + 6;
  for (let i = 0; i < 70; i++) {
    const near = i % 5 === 0, par = near ? 1.15 : 0.85;
    const ux = hash(i * 3.1) * 1000 + f * (0.08 + hash(i) * 0.12) + Math.sin(f * 0.01 + i) * 6;
    const uy = hash(i * 7.7) * 640 + f * (near ? 0.12 : 0.05);
    const sx = ((ux - v.cx * par) % 1000 + 1000) % 1000 - 100, sy = ((uy - v.cy * par) % 640 + 640) % 640 - 20;
    const wx = v.cx + sx, wy = v.cy + sy;
    if (wy < Math.max(top, roofAt(wx - x0) + 4) || wy > bedAt(wx - x0) - 2 || wx < a || wx > b) continue;
    box(c, Math.round(wx), Math.round(wy), near ? 2 : 1, near ? 2 : 1, near ? 'rgba(220, 236, 210, 0.55)' : 'rgba(190, 210, 190, 0.45)');
  }
  // The bubbles: a stepped ring, lit on top, a glint
  for (const bb of rv.bubbles) {
    const r = Math.round(bb.r);
    c.fillStyle = 'rgba(200, 236, 255, 0.22)'; c.beginPath(); c.arc(bb.x, bb.y, r, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(240, 250, 255, 0.95)'; c.lineWidth = 2; c.beginPath(); c.arc(bb.x, bb.y, r, Math.PI * 0.9, Math.PI * 2.1); c.stroke();
    c.strokeStyle = 'rgba(160, 210, 240, 0.8)'; c.lineWidth = 1.5; c.beginPath(); c.arc(bb.x, bb.y, r, Math.PI * 0.1, Math.PI * 0.9); c.stroke();
    box(c, bb.x - r * 0.45, bb.y - r * 0.55, 3, 3, '#FFFFFF');
  }
};

export { dark, lite };

// ---------------------------------------------------------------------------------------------------------------
// The backside of water's rock: a slab of cliff down from the sky into the river (the falls come down over its face)

const FALLS_ROCK = ['#1E1A16', '#2E2822', '#433A30', '#5A4E40', '#76684F', '#9A8A6A'];
const paintFallsRock = (g: Ctx) => {
  const a = R(FALLS.x), w = FALLS.w, top = FALLS.bottom - 1200, bot = FALLS.bottom, F = FALLS_ROCK;
  box(g, a, top, w, bot - top, F[2]);
  // (the strata: blocks a course at a time, each lit along its top and down its left, shadowed under, cracked)
  for (let y = top, n = 0; y < bot; n++) {
    const h = 26 + Math.floor(hash(n * 3.7) * 30), off = Math.floor(hash(n * 1.3) * 30);
    for (let x = a - off; x < a + w; x += 34 + Math.floor(hash(n + x) * 20)) {
      const bx = Math.max(a, x), bw = Math.min(a + w, x + 40) - bx;
      if (bw <= 2) continue;
      const tone = hash(n * 7 + x) > 0.5 ? F[2] : F[3];
      box(g, bx, y, bw, h, tone);
      box(g, bx, y, bw, 2, F[4]); box(g, bx, y, 2, h, F[4]); box(g, bx, y + h - 3, bw, 3, F[1]);
      checker(g, bx + 2, y + 2, bw - 2, 2, F[5]);
      box(g, bx + bw - 1, y, 1, h, F[0]);
    }
    y += h;
  }
  // (wet: dark streaks down it where the water runs; moss in the cracks; algae under the waterline)
  for (let k = 0; k < 6; k++) { const sx = a + 6 + k * 11; for (let y = top; y < bot; y += 4) if (hash(k * 50 + y) > 0.35) box(g, sx + ((y >> 5) % 2), y, 2, 4, 'rgba(10, 8, 6, 0.35)'); }
  for (let y = top + 20; y < bot - 100; y += 37) checker(g, a, y, 14, 4, '#3E5A26');
  box(g, a, WS, w, bot - WS, '#2A3A24'); checker(g, a, WS - 6, w, 6, '#3E5A26'); checker(g, a, WS, w, bot - WS, '#1E2A1A', 1);
  box(g, a, bot - 4, w, 4, F[0]);
};
/** (Its own: the rock's face, stamped.) */
export const drawFallsRock = (c: Ctx, state: GameState) => {
  const v = viewOf(state);
  if (!onScreen(v, R(FALLS.x), R(FALLS.x + FALLS.w))) return;
  stamp(c, 'uw-fallsrock', R(FALLS.x), FALLS.bottom - 1200, FALLS.w, 1200, paintFallsRock);
};
