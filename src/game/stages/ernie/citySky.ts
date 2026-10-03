// San Francisco behind the streets and the bridge, in the big one: one panorama, the sky and the city in layers, each
// sliding by slower the further off it is. The sky at sunset, streaks of cloud lit from underneath; far off, downtown
// (the pyramid, the tall round-topped one, the Bay Bridge off the end of it, towers with their windows out, one
// leaning, one cracked and missing a corner), Coit Tower on Telegraph Hill, Sutro Tower on Twin Peaks, the Presidio
// down to the water, and past it the bay, the island, the Marin headlands; nearer, the hills, steep, painted ladies in
// rows stepping up and down them, a cable car line, a billboard, houses burning, down to the Marina and the Palace of
// Fine Arts and the seawall; nearest, the rooftops of the next block over (water tanks, chimneys, a hotel's sign on
// the blink), stepping down to the waterfront. Each layer's city ends at its own shore, so going out onto the bridge
// the city slides away to the left and the bay comes on from the right, nearer layers first: no fading one picture
// into another. Each layer's painted the once at the screen's resolution and put down every frame; only the small
// live things are drawn each frame (smoke, flames, warning lights, the sign, the cable car, the island's light).

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT, RENDER_SCALE } from '../../../constants';
import { bandedGradient, hazeBands, steppedGlow, checker, pixelBlob } from '../../render/pixelArt';
import { hash, rng, mix } from '../../render/backdrops/core';
import { drawFire } from '../../render/fx/fire';
import { COURSE, HOUSES_END } from './course';
import { drawAlcatraz } from './draw';

type Ctx = CanvasRenderingContext2D;
const W = CANVAS_WIDTH, H = CANVAS_HEIGHT, S = RENDER_SCALE;

/** Where the layers are lined up from (the start of the streets), and how far along they can go (past the bridge). */
const X0 = COURSE.streets.x1;
const SPAN = COURSE.bridge.x2 + 200 - X0;
/** How far up and down the camera goes along here (on a fire escape at the top of a hill; out on the bridge). */
const CAM_LO = -560, CAM_HI = 260;
/** The camera's x (from X0) when the last house on the street is mid-screen: every layer's shore is lined up from it. */
const AT_SHORE = HOUSES_END - X0 - W / 2;

interface Layer {
  key: string; fx: number; fy: number; top: number; h: number; w: number;
  paint: (g: Ctx, w: number) => void;
  /** What's under it, down to the bottom of the screen, as far across as `baseTo` (the layer's whole width otherwise). */
  base?: string; baseTo?: number;
}

const canvases = new Map<string, HTMLCanvasElement>();
/** A layer painted the once at the screen's resolution (y as it sits on the screen with the camera at 0). */
const painted = (l: Layer) => {
  if (typeof document === 'undefined') return null;
  let c = canvases.get(l.key);
  if (!c) {
    c = document.createElement('canvas'); c.width = l.w * S; c.height = l.h * S;
    const g = c.getContext('2d')!;
    g.setTransform(S, 0, 0, S, 0, -l.top * S);
    l.paint(g, l.w);
    canvases.set(l.key, c);
  }
  return c;
};
/** Lets the layers go (off the streets and the bridge: out on the bay, on the island). */
export const freeCitySky = () => { canvases.clear(); };

/** How far a layer's slid across (in its own x) and down the screen. */
const slide = (state: GameState, l: Layer) => {
  const u = Math.max(0, Math.min(SPAN, state.camera.x - X0));
  const cy = Math.max(CAM_LO, Math.min(CAM_HI, state.camera.y));
  return { ox: Math.round(u * l.fx * S) / S, oy: -Math.round(cy * l.fy * S) / S };
};

/** Puts a layer down (only as much of it as there is: past its shore there's nothing, the layer behind shows). */
const put = (ctx: Ctx, state: GameState, l: Layer, jy = 0) => {
  const { ox } = slide(state, l);
  const oy = slide(state, l).oy + jy;
  const vw = Math.min(W, l.w - ox);
  if (vw <= 0) return { ox, oy };
  const c = painted(l);
  if (c) ctx.drawImage(c, ox * S, 0, vw * S, l.h * S, 0, l.top + oy, vw, l.h);
  else { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, vw, H); ctx.clip(); ctx.translate(-ox, oy); l.paint(ctx, l.w); ctx.restore(); }
  const bottom = l.top + oy + l.h;
  if (l.base && bottom < H) {
    const bw = Math.min(W, (l.baseTo ?? l.w) - ox);
    if (bw > 0) { ctx.fillStyle = l.base; ctx.fillRect(0, bottom - 1, bw, H - bottom + 1); }
  }
  return { ox, oy };
};

// ---------------------------------------------------------------------------
// Little helpers
// ---------------------------------------------------------------------------

/** Letters 3 cells wide and 5 tall (just the ones the signs need). */
const GLYPHS: Record<string, string[]> = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'], C: ['.##', '#..', '#..', '#..', '.##'], E: ['###', '#..', '##.', '#..', '###'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'], I: ['###', '.#.', '.#.', '.#.', '###'], K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'], N: ['#..#', '##.#', '#.##', '#..#', '#..#'], O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
  Q: ['.#.', '#.#', '#.#', '##.', '.##'], R: ['##.', '#.#', '##.', '#.#', '#.#'], S: ['.##', '#..', '.#.', '..#', '##.'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'], U: ['#.#', '#.#', '#.#', '#.#', '.#.'], ' ': ['..', '..', '..', '..', '..'],
};
const textW = (s: string, px: number) => [...s].reduce((n, ch) => n + ((GLYPHS[ch]?.[0].length ?? 3) + 1) * px, -px);
/** Spells `s` from (x, y), its top left, each letter `color(i)` (null leaves it out). */
const pixText = (g: Ctx, s: string, x: number, y: number, px: number, color: string | ((i: number) => string | null)) => {
  let cx = x;
  [...s].forEach((ch, i) => {
    const rows = GLYPHS[ch] ?? GLYPHS[' '];
    const c = typeof color === 'string' ? color : color(i);
    if (c) { g.fillStyle = c; rows.forEach((row, ry) => { for (let rx = 0; rx < row.length; rx++) if (row[rx] === '#') g.fillRect(cx + rx * px, y + ry * px, px, px); }); }
    cx += (rows[0].length + 1) * px;
  });
};
/** A straight 1px line, a cell at a time. */
const line = (g: Ctx, x0: number, y0: number, x1: number, y1: number, color: string, wd = 1) => {
  const n = Math.max(1, Math.abs(x1 - x0), Math.abs(y1 - y0));
  g.fillStyle = color;
  for (let i = 0; i <= n; i++) g.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), wd, 1);
};
/** A smooth line through points (cosine eased between each pair), for ridges. */
const through = (pts: [number, number][]) => (x: number) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    if (x <= x1) { const t = (1 - Math.cos(((x - x0) / (x1 - x0)) * Math.PI)) / 2; return y0 + (y1 - y0) * t; }
  }
  return pts[pts.length - 1][1];
};

// ---------------------------------------------------------------------------
// The sky
// ---------------------------------------------------------------------------

const SKY = ['#1A1230', '#24163A', '#321C44', '#46224C', '#5E2A52', '#7A3254', '#963C52', '#B04A4E', '#C85C4A', '#DC744C', '#EA9052', '#F2AA5E', '#F6C070'];
const sky: Layer = {
  key: 'ernie-city-sky', fx: 0.008, fy: 0.03, top: -40, h: 520, w: W + Math.ceil(0.008 * SPAN) + 4, base: SKY[SKY.length - 1],
  paint: (g, w) => {
    bandedGradient(g, 0, -40, w, 520, SKY, 26);
    // (the glow where the sun's gone down, out past the Gate)
    steppedGlow(g, w * 0.82, 470, 260, '#FFB070', 0.18, 0, 6);
    // The first stars, up top
    const r = rng(311);
    for (let i = 0; i < 70; i++) {
      const b = r(); g.fillStyle = b > 0.9 ? '#FFF6E4' : b > 0.6 ? '#C8B8E0' : '#7A6A9A';
      g.fillRect(Math.floor(r() * w), Math.floor(-30 + r() * r() * 160), 1, 1);
    }
    // Streaks of cloud, lit from underneath (hotter the lower they are)
    const cr = rng(57);
    for (let i = 0; i < 13; i++) {
      const k = i / 12, y = Math.round(110 + i * 20 + cr() * 10), x = Math.round(cr() * w - 80), len = Math.round(120 + cr() * 240);
      const top = mix('#3A2248', '#8A3E58', k), body = mix('#5A2E58', '#C8605A', k), lit = mix('#B0566A', '#FFB27A', k), edge = mix('#E0907A', '#FFE0A8', k);
      const rows = 3 + Math.floor(cr() * 4);
      for (let rr = 0; rr < rows; rr++) {
        const shrink = Math.abs(rr - (rows - 1) * 0.6) / rows;
        const rx = Math.round(x + len * (0.08 + shrink * 0.3) + (cr() - 0.5) * 30), rl = Math.round(len * (0.75 - shrink * 0.5));
        const ry = y + rr * 2, c = rr === 0 ? top : rr >= rows - 2 ? lit : body;
        g.fillStyle = c; g.fillRect(rx + 4, ry, rl - 8, 2);
        checker(g, rx, ry, 4, 2, c); checker(g, rx + rl - 4, ry, 4, 2, c, 1);
        if (rr === rows - 1) { g.fillStyle = edge; g.fillRect(rx + 10, ry + 1, Math.max(0, rl - 30), 1); }
      }
      checker(g, x + len, y + rows * 2 - 1, Math.round(40 + cr() * 60), 1, body);
    }
  },
};

// ---------------------------------------------------------------------------
// Far off: downtown, the hills, Sutro Tower, the Presidio; the bay, Alcatraz and Marin past the shore
// ---------------------------------------------------------------------------

const FAR_FX = 0.035;
/** The horizon (the far shore, the water's edge out on the bay). */
const HZ = 410;
/** Where the far layer's land ends (the Presidio's bluff), and the water begins. */
const SHORE_F = Math.round(720 + AT_SHORE * FAR_FX);
const ALCATRAZ_U = SHORE_F + 150;
const FAR = { body: '#4A3C60', shade: '#3A2E4E', rim: '#A0687E', win: '#F2C27A', out: '#2A2236', hill: '#3E3254', hillRim: '#8A5A70' };
/** Downtown's towers: x, width, height, and what's wrong with each since this morning. */
const TOWERS: [number, number, number, ('lean' | 'crack' | 'dark' | '')][] = [
  [150, 16, 70, ''], [170, 20, 104, 'dark'], [196, 14, 86, ''], [214, 22, 128, ''], [240, 18, 96, 'crack'], [262, 16, 74, ''],
  [282, 24, 150, ''], [366, 18, 112, 'lean'], [388, 16, 92, ''], [438, 20, 120, 'dark'], [462, 14, 80, ''], [480, 22, 100, ''], [506, 16, 66, ''],
];
const PYRAMID = { x: 330, h: 236 };
const SALESFORCE = { x: 414, w: 20, h: 248 };
const COIT = { x: 640, y: HZ - 76 };
const SUTRO = { x: 830, y: HZ - 108 };
/** Fires in the city (their smoke goes up into the sky). */
const FAR_FIRES = [{ x: 252, y: HZ - 4 }, { x: 496, y: HZ - 2 }, { x: 700, y: HZ - 40 }];

const tower = (g: Ctx, x: number, w: number, h: number, kind: string, seed: number) => {
  const top = HZ - h;
  g.save();
  if (kind === 'lean') { g.translate(x, HZ); g.rotate(0.07); g.translate(-x, -HZ); }
  g.fillStyle = FAR.body; g.fillRect(x, top, w, h);
  g.fillStyle = FAR.rim; g.fillRect(x, top, 1, h);
  g.fillStyle = FAR.shade; g.fillRect(x + w - 4, top, 4, h); checker(g, x + w - 6, top, 2, h, FAR.shade);
  // (a setback on the bigger ones, and a mast)
  if (h > 100) { g.fillStyle = FAR.body; g.fillRect(x + 3, top - 10, w - 6, 10); g.fillStyle = FAR.rim; g.fillRect(x + 3, top - 10, 1, 10); g.fillStyle = FAR.shade; g.fillRect(x + w / 2, top - 22, 1, 12); }
  // (windows: lit here and there; on one, all of them out)
  const r = rng(seed);
  for (let wy = top + 4; wy < HZ - 4; wy += 4) for (let wx = x + 2; wx < x + w - 4; wx += 3) {
    const v = r();
    if (kind === 'dark') { if (v > 0.93) { g.fillStyle = '#6A4A50'; g.fillRect(wx, wy, 1, 2); } continue; }
    if (v > 0.84) { g.fillStyle = v > 0.96 ? '#FFE2A8' : FAR.win; g.fillRect(wx, wy, 1, 2); }
  }
  g.restore();
  if (kind === 'crack') {
    // (a corner gone off the top in steps, and the crack down from it)
    g.clearRect(x + w - 8, top - 1, 9, 6); g.clearRect(x + w - 5, top + 5, 6, 5); g.clearRect(x + w - 2, top + 10, 3, 5);
    let cx = x + w - 6;
    g.fillStyle = '#1E1628';
    for (let y = top + 4; y < top + h * 0.7; y += 2) { cx += (hash(y * 3 + seed) - 0.45) * 2; g.fillRect(Math.round(cx), y, 1, 2); }
  }
};

const marin = through([[SHORE_F + 40, HZ + 2], [SHORE_F + 90, HZ - 34], [SHORE_F + 160, HZ - 58], [SHORE_F + 230, HZ - 44], [SHORE_F + 300, HZ - 70], [SHORE_F + 420, HZ - 52]]);
const twinPeaks = through([[560, HZ - 30], [COIT.x - 30, HZ - 46], [COIT.x, HZ - 70], [COIT.x + 40, HZ - 40], [760, HZ - 70], [SUTRO.x, HZ - 108], [880, HZ - 84], [SHORE_F - 60, HZ - 44], [SHORE_F - 6, HZ - 30], [SHORE_F, HZ]]);

const far: Layer = {
  key: 'ernie-city-far', fx: FAR_FX, fy: 0.08, top: 60, h: 500, w: W + Math.ceil(FAR_FX * SPAN) + 4, base: '#1C2C46',
  paint: (g, w) => {
    // The water, all the way across (it's in front of the city too, the bay between)
    bandedGradient(g, 0, HZ, w, 560 - HZ, ['#7A5874', '#5A5A7C', '#465676', '#384C6C', '#2C405E', '#223452', '#1C2C46'], 12);
    const r = rng(91);
    for (let y = HZ + 3; y < 560; y += 4 + Math.floor((y - HZ) / 40)) {
      const gap = 18 + (y - HZ) * 0.3, len = 3 + Math.floor((y - HZ) / 25);
      g.fillStyle = y < HZ + 30 ? '#9A7088' : '#5A7098';
      for (let x = r() * gap; x < w; x += gap * (0.6 + r() * 0.8)) g.fillRect(Math.round(x), y, len, 1);
    }
    // (the sunset laid across it out past the shore)
    for (let y = HZ + 2; y < HZ + 50; y += 3) for (let x = SHORE_F + r() * 30; x < w; x += 20 + r() * 40) { g.fillStyle = y < HZ + 20 ? '#F2B27A' : '#C88470'; g.fillRect(Math.round(x), y, 4 + Math.floor(r() * 8), 1); }
    // The hills behind downtown (Telegraph Hill, Twin Peaks), down to the Presidio's bluff at the water
    g.fillStyle = FAR.hill;
    for (let x = 520; x < SHORE_F; x++) { const y = Math.round(twinPeaks(x)); g.fillRect(x, y, 1, HZ - y); }
    for (let x = 520; x < SHORE_F; x++) { const y = Math.round(twinPeaks(x)), dy = Math.round(twinPeaks(x + 1)) - y; g.fillStyle = dy > 0 ? '#34294A' : FAR.hillRim; g.fillRect(x, y, 1, 1); if (dy < 0) checker(g, x, y + 1, 1, 4, FAR.hillRim); }
    // (houses all over them, the odd window lit; the Presidio's trees down the far end)
    const hr = rng(93);
    for (let x = 530; x < SHORE_F - 70; x += 3 + Math.floor(hr() * 3)) {
      const y0 = Math.round(twinPeaks(x + 1)) + 3 + Math.floor(hr() * 4);
      for (let y = y0; y < HZ - 2; y += 5 + Math.floor(hr() * 3)) { g.fillStyle = hr() > 0.5 ? '#4A3C5E' : '#54445E'; g.fillRect(x, y, 2, 2); if (hr() > 0.86) { g.fillStyle = FAR.win; g.fillRect(x, y, 1, 1); } }
    }
    for (let x = SHORE_F - 80; x < SHORE_F - 4; x += 4) { const y = Math.round(twinPeaks(x)); pixelBlob(g, x, y + 2, 4, 3, '#2E3A3A', 1); g.fillStyle = '#4A5A4A'; g.fillRect(x - 2, y - 1, 2, 1); }
    g.fillStyle = '#2A2238'; g.fillRect(SHORE_F - 2, HZ - 30, 2, 30);
    // Coit Tower on top of Telegraph Hill: the fluted column, the open top
    g.fillStyle = '#C8A898'; g.fillRect(COIT.x - 3, COIT.y - 30, 7, 32);
    g.fillStyle = '#E8C8B0'; g.fillRect(COIT.x - 3, COIT.y - 30, 1, 32);
    g.fillStyle = '#8A6E70'; g.fillRect(COIT.x + 2, COIT.y - 30, 2, 32);
    g.fillStyle = '#5A4450'; for (let y = COIT.y - 28; y < COIT.y - 22; y += 2) g.fillRect(COIT.x - 2, y, 5, 1);
    g.fillStyle = '#B09090'; g.fillRect(COIT.x - 4, COIT.y - 32, 9, 2);
    // Sutro Tower up on Twin Peaks: three legs, the crossbars, the prongs up top
    const sx = SUTRO.x, sy = SUTRO.y;
    line(g, sx - 12, sy, sx - 1, sy - 104, '#7A5268'); line(g, sx + 12, sy, sx + 1, sy - 104, '#5A3E54'); line(g, sx, sy, sx, sy - 100, '#6A4860');
    for (const [k, half] of [[0.3, 12], [0.6, 14], [0.92, 16]] as const) { const y = Math.round(sy - 104 * k); line(g, sx - half, y, sx + half, y, '#7A5268'); }
    for (const px of [-16, -8, 0, 8, 16]) line(g, sx + px, sy - 96, sx + px, sy - 112, '#7A5268');
    // Downtown, standing on the far shore
    hazeBands(g, 120, HZ - 160, 420, 160, '#9A4A62', 0, 0.12, 5);
    for (const [x, tw, th, kind] of TOWERS) tower(g, x, tw, th, kind, x);
    // (the pyramid: lit down its left, the wings, the spire)
    const px = PYRAMID.x;
    for (let y = HZ - PYRAMID.h; y < HZ; y++) {
      const half = Math.max(1, Math.round((y - (HZ - PYRAMID.h)) * 0.06));
      g.fillStyle = FAR.body; g.fillRect(px - half, y, half * 2, 1);
      g.fillStyle = FAR.rim; g.fillRect(px - half, y, 1, 1);
      g.fillStyle = FAR.shade; g.fillRect(px + half - 2, y, 2, 1);
      if (y % 4 === 0 && half > 3 && hash(y) > 0.55) { g.fillStyle = FAR.win; g.fillRect(px - half + 2 + Math.floor(hash(y + 1) * (half * 2 - 4)), y, 1, 1); }
    }
    for (const s of [-1, 1]) { g.fillStyle = s < 0 ? FAR.rim : FAR.shade; g.fillRect(px + s * 9 - (s < 0 ? 2 : 0), HZ - 130, 2, 26); }
    g.fillStyle = FAR.rim; g.fillRect(px, HZ - PYRAMID.h - 14, 1, 14);
    // (the tall one: round-shouldered, its crown in a mesh)
    const { x: fx, w: fw, h: fh } = SALESFORCE, ftop = HZ - fh;
    for (let y = ftop; y < HZ; y++) {
      const k = Math.min(1, (y - ftop) / 30), half = Math.round(fw / 2 * Math.sqrt(k * (2 - k)) * (1 - (y - ftop) / fh * -0.08));
      g.fillStyle = '#5A4C6C'; g.fillRect(fx - half, y, half * 2, 1);
      g.fillStyle = '#B07A88'; g.fillRect(fx - half, y, 1, 1);
      g.fillStyle = '#42364E'; g.fillRect(fx + half - 3, y, 3, 1);
    }
    checker(g, fx - 8, ftop + 6, 16, 22, '#7A6A88');
    for (let y = ftop + 34; y < HZ - 4; y += 6) { g.fillStyle = '#4A3E5C'; g.fillRect(fx - fw / 2 + 2, y, fw - 4, 1); }
    // The Bay Bridge, way off past downtown: the suspension spans, then the truss on to the East Bay
    const deck = HZ - 14;
    g.fillStyle = '#5A4A66'; g.fillRect(0, deck, 150, 2);
    for (const t of [30, 90]) { g.fillStyle = '#6A5874'; g.fillRect(t, deck - 26, 2, 28); g.fillRect(t + 4, deck - 26, 2, 28); g.fillRect(t, deck - 24, 6, 1); g.fillRect(t, deck - 14, 6, 1); }
    for (let x = 0; x < 150; x++) { const t = x < 30 ? 1 - x / 30 : x < 90 ? Math.abs((x - 60) / 30) : (x - 90) / 60; g.fillStyle = '#6A5874'; g.fillRect(x, Math.round(deck - 2 - 24 * t * t), 1, 1); }
    for (let x = 4; x < 150; x += 6) { g.fillStyle = '#F2C27A'; g.fillRect(x, deck - 1, 1, 1); }
    for (let x = 0; x < 150; x += 30) { g.fillStyle = '#4A3E58'; g.fillRect(x + 12, deck + 2, 3, HZ - deck - 2); }
    // (the near shore under it all: piers, the Embarcadero's lights)
    g.fillStyle = '#2E2440'; g.fillRect(0, HZ - 4, SHORE_F, 4);
    g.fillStyle = '#F2C27A'; for (let x = 4; x < SHORE_F - 20; x += 7 + Math.floor(hash(x) * 6)) g.fillRect(x, HZ - 3, 1, 1);
    for (const f of FAR_FIRES) steppedGlow(g, f.x, f.y - 6, 22, '#FF7A3A', 0.3, 0, 4);
    // The island's water and Marin past the Gate: green-brown headlands, lit along the crest, the gullies down them in shadow
    for (let x = SHORE_F + 40; x < w; x++) {
      const y = Math.round(marin(x));
      g.fillStyle = '#3E4A40'; g.fillRect(x, y, 1, HZ + 1 - y);
      const dy = Math.round(marin(x + 1)) - y;
      g.fillStyle = dy > 0 ? '#2E3A32' : '#7A7A56'; g.fillRect(x, y, 1, 1);
      if ((x * 7) % 23 < 2) { g.fillStyle = '#323E36'; g.fillRect(x, y + 6, 1, HZ - y - 6); }
    }
    hazeBands(g, SHORE_F + 40, HZ - 70, w - SHORE_F - 40, 72, '#C07A80', 0, 0.3, 5);
    // (the fog coming in through the Gate, low on the water)
    const fr = rng(17);
    for (let i = 0; i < 16; i++) pixelBlob(g, SHORE_F - 30 + fr() * 260, HZ - 4 - fr() * 10, 20 + fr() * 40, 4 + fr() * 4, 'rgba(236, 222, 232, 0.22)', 2);
    // Haze down the city's foot
    hazeBands(g, 0, HZ - 40, SHORE_F, 40, '#B4506A', 0, 0.3, 4);
  },
};

// ---------------------------------------------------------------------------
// Nearer: the hills, the painted ladies up and down them, down to the Marina and the seawall
// ---------------------------------------------------------------------------

const MID_FX = 0.12;
const SHORE_M = Math.round(640 + AT_SHORE * MID_FX);
/** The hills' line: Russian Hill, a dip, Nob Hill, Pacific Heights, then down to the Marina flats and the water. */
const hills = through([[-20, 318], [110, 262], [250, 222], [390, 312], [520, 244], [640, 212], [790, 300], [920, 236], [1060, 268], [1200, 330], [SHORE_M - 170, 368], [SHORE_M - 60, 374], [SHORE_M + 40, 376]]);
/** Where the land ends at the Marina: a riprap bank, from the flats at its top down into the bay. */
const BANK_TOP = 378, BANK_W = 56;
const bankY = (x: number) => BANK_TOP + Math.max(0, (x - (SHORE_M - BANK_W)) / BANK_W) * (560 - BANK_TOP);
const MID_BOTTOM = 560;
const MID_BASE = '#2A2034';
const PAINT = ['#E8A0B0', '#98CCC0', '#ECC888', '#B0A0D4', '#E8B07E', '#A0C8E4', '#E0D8C0', '#C0D8A0'];
/** The cable car line, cut straight up the face of Nob Hill. */
const CABLE = { x0: 420, y0: 330, x1: 600, y1: 236 };
const BILLBOARD = { x: 720, w: 64, h: 24 };
const MID_FIRES = [{ x: 330, w: 16 }, { x: 1004, w: 14 }];
const PALACE = { x: SHORE_M - 120, y: 372 };

/** A painted lady, small: its paint dimmed by the distance and `d` (rows further down the hill are darker), its gable, bay window, door. */
const lady = (g: Ctx, x: number, top: number, hh: number, c0: string, d: number, seed: number) => {
  const c = mix(mix(c0, '#5A3A5A', 0.5), '#2A1E34', d), lit = mix(c, '#FFE0C0', 0.28), shade = mix(c, '#22162C', 0.38), deep = mix(c, '#22162C', 0.6);
  g.fillStyle = c; g.fillRect(x + 1, top, 11, hh);
  g.fillStyle = lit; g.fillRect(x + 1, top, 1, hh);
  g.fillStyle = shade; g.fillRect(x + 9, top, 3, hh); g.fillStyle = deep; g.fillRect(x + 11, top, 1, hh);
  if (hash(seed) > 0.4) for (let k = 0; k < 5; k++) { const hw = 6 - k; g.fillStyle = mix('#6E5470', '#2A1E34', d); g.fillRect(x + 7 - hw, top - 1 - k, hw, 1); g.fillStyle = mix('#4A3850', '#2A1E34', d); g.fillRect(x + 7, top - 1 - k, hw, 1); }
  else { g.fillStyle = mix('#B8A8A0', '#2A1E34', d + 0.2); g.fillRect(x, top - 1, 13, 1); }
  g.fillStyle = mix('#E8DDD0', '#2A1E34', d + 0.25); g.fillRect(x + 1, top, 11, 1);
  // (the bay window, its panes lit or not; the door)
  g.fillStyle = mix(c, '#FFFFFF', 0.08); g.fillRect(x + 2, top + 3, 6, 6);
  const on = hash(seed + 1) > 0.45;
  g.fillStyle = on ? mix('#F4C878', '#2A1E34', d) : '#261C2E'; g.fillRect(x + 3, top + 4, 1, 4); g.fillRect(x + 6, top + 4, 1, 4);
  g.fillStyle = on ? mix('#FFE8B0', '#2A1E34', d) : '#30263A'; g.fillRect(x + 4, top + 4, 2, 4);
  if (hh > 16) { g.fillStyle = deep; g.fillRect(x + 8, top + hh - 6, 2, 5); }
};

const mid: Layer = {
  key: 'ernie-city-mid', fx: MID_FX, fy: 0.15, top: 160, h: MID_BOTTOM - 160, w: SHORE_M, base: MID_BASE,
  paint: (g, w) => {
    // The ground under it all (the backs of the houses further down, all in shadow)
    for (let x = 0; x < w; x++) { const y = Math.round(hills(x)); g.fillStyle = MID_BASE; g.fillRect(x, y + 4, 1, MID_BOTTOM - y - 4); }
    // (further down, the rest of the city packed down the hill: rooftops in rows, the odd window lit)
    const wr = rng(149);
    for (let x = 0; x < w; x += 2 + Math.floor(wr() * 3)) {
      const y0 = Math.round(hills(x)) + 52;
      for (let y = y0 + Math.floor(wr() * 8); y < MID_BOTTOM; y += 7 + Math.floor(wr() * 6)) {
        const v = wr();
        if (v > 0.9) { g.fillStyle = v > 0.97 ? '#C8925A' : '#7A5A52'; g.fillRect(x, y, 1, 2); } else if (v < 0.25) { g.fillStyle = '#342840'; g.fillRect(x, y, 4, 1); }
      }
    }
    // Houses in rows down the hills, each row stepping with the slope (a house sits where the ground is, at its own x)
    const r = rng(141);
    for (let row = 0; row < 3; row++) {
      const d = 0.08 + row * 0.16, off = (row * 5) % 13;
      for (let x = -8 + off; x < w - BANK_W - 12; x += 13) {
        const ground = Math.round(hills(x + 6)) + row * 16, hh = 16 + Math.floor(r() * 7);
        if (ground - hh > MID_BOTTOM) continue;
        // (the cable car street goes straight up through them: nothing built on it)
        const t = (x + 6 - CABLE.x0) / (CABLE.x1 - CABLE.x0), cy = CABLE.y0 + (CABLE.y1 - CABLE.y0) * t;
        if (t > -0.04 && t < 1.04 && Math.abs(ground - hh / 2 - cy) < 12) continue;
        lady(g, x, ground - hh, hh + 6, PAINT[Math.floor(r() * PAINT.length)], d, x * 31 + row * 7);
      }
    }
    // The cable car street: asphalt, the slot down the middle, the curbs either side, straight up the hill
    for (let i = 0; i <= 1; i += 1 / 300) {
      const x = Math.round(CABLE.x0 + (CABLE.x1 - CABLE.x0) * i), y = Math.round(CABLE.y0 + (CABLE.y1 - CABLE.y0) * i);
      g.fillStyle = '#3A3240'; g.fillRect(x - 6, y - 3, 12, 6);
    }
    line(g, CABLE.x0 - 6, CABLE.y0 - 4, CABLE.x1 - 6, CABLE.y1 - 4, '#6A5E6A');
    line(g, CABLE.x0, CABLE.y0, CABLE.x1, CABLE.y1, '#1E1824');
    line(g, CABLE.x0 + 6, CABLE.y0 + 2, CABLE.x1 + 6, CABLE.y1 + 2, '#4A4250');
    // The hills' crest (the line of rooftops against the sky), rounded over, the trees in the parks on top

    for (const tx of [240, 256, 640 - 14, 652, 910, 924]) { const ty = Math.round(hills(tx)); pixelBlob(g, tx, ty - 6, 8, 7, '#2E3A34', 1); pixelBlob(g, tx - 2, ty - 9, 4, 3, '#4A5A44', 1); g.fillStyle = '#2A2228'; g.fillRect(tx, ty - 2, 2, 6); }
    // The billboard up on Nob Hill, cracked across, a leg gone and the board hanging off the other
    const bx = BILLBOARD.x, by = Math.round(hills(bx + 30)) - 34;
    g.fillStyle = '#2A2028'; g.fillRect(bx + 8, by + 20, 3, 18); g.fillRect(bx + 50, by + 24, 3, 14); line(g, bx + 50, by + 24, bx + 60, by + 34, '#2A2028', 2);
    g.save(); g.translate(bx, by); g.rotate(0.06);
    g.fillStyle = '#1E1824'; g.fillRect(-1, -1, BILLBOARD.w + 2, BILLBOARD.h + 2);
    g.fillStyle = '#C8B89C'; g.fillRect(0, 0, BILLBOARD.w, BILLBOARD.h);
    g.fillStyle = '#E2D6BC'; g.fillRect(0, 0, 1, BILLBOARD.h);
    g.fillStyle = '#9A8A78'; g.fillRect(0, BILLBOARD.h - 3, BILLBOARD.w, 3);
    pixText(g, 'QUAKE', Math.round((BILLBOARD.w - textW('QUAKE', 1)) / 2), 3, 1, '#9A2A2A');
    pixText(g, 'INSURANCE', Math.round((BILLBOARD.w - textW('INSURANCE', 1)) / 2), 11, 1, '#2A2A3A');
    let cx = 26; g.fillStyle = '#1E1824'; for (let y = 0; y < BILLBOARD.h; y++) { cx += (hash(y * 5 + 3) - 0.5) * 3; g.fillRect(Math.round(cx), y, 1, 1); }
    g.clearRect(BILLBOARD.w - 6, BILLBOARD.h - 6, 7, 7); g.clearRect(BILLBOARD.w - 3, BILLBOARD.h - 10, 4, 4);
    g.restore();
    // The burning houses' glow on what's round them
    for (const f of MID_FIRES) steppedGlow(g, f.x, Math.round(hills(f.x)) + 2, 22, '#FF7A3A', 0.16, 0, 4);
    // Down at the Marina: the Palace of Fine Arts, the rotunda on its columns
    const { x: px, y: py } = PALACE;
    g.fillStyle = '#5A3E4A'; g.fillRect(px - 26, py - 8, 52, 10);
    for (let k = -22; k <= 22; k += 5) { g.fillStyle = '#B08070'; g.fillRect(px + k, py - 26, 2, 18); g.fillStyle = '#6A4A54'; g.fillRect(px + k + 2, py - 26, 1, 18); }
    for (let y = 0; y < 18; y++) { const half = Math.round(18 * Math.sqrt(1 - (y / 18) * (y / 18))); g.fillStyle = y < 3 ? '#C89080' : '#A87468'; g.fillRect(px - half, py - 30 - y, half * 2, 1); g.fillStyle = '#D8A890'; g.fillRect(px - half, py - 30 - y, 1, 1); g.fillStyle = '#7A5058'; g.fillRect(px + half - 4, py - 30 - y, 4, 1); }
    g.fillStyle = '#8A6060'; g.fillRect(px - 20, py - 30, 40, 4);
    g.fillStyle = '#B08070'; g.fillRect(px - 2, py - 52, 4, 4);
    // (the lagoon in front of it, the sunset in it)
    g.fillStyle = '#4A4A6A'; g.fillRect(px - 40, py + 4, 70, 6); g.fillStyle = '#C08070'; g.fillRect(px - 30, py + 6, 20, 1); g.fillRect(px + 2, py + 7, 12, 1);
    // The bank at the water: the land cut off along it (nothing past it: the bay shows through from behind), rocks
    // piled down it into the water, the foam along their foot
    for (let x = SHORE_M - BANK_W; x < w; x++) g.clearRect(x, 0, 1, Math.round(bankY(x)));
    const rr = rng(171);
    for (let k = 0; k < 40; k++) {
      const t = rr(), x = SHORE_M - BANK_W + t * BANK_W, y = bankY(x) + 2 + rr() * 6;
      pixelBlob(g, Math.round(x - 2), Math.round(y), 3 + rr() * 3, 2 + rr() * 2, rr() > 0.5 ? '#4A3E4C' : '#3A3040', 1);
      g.fillStyle = '#5E5060'; g.fillRect(Math.round(x - 3), Math.round(y - 1), 2, 1);
    }
    g.fillStyle = '#2A2232'; g.fillRect(SHORE_M - BANK_W - 30, BANK_TOP - 1, 30, 2);
    // Smoke and the fog creeping up from the water, in bands over the lower rows
    hazeBands(g, 0, 360, SHORE_M - BANK_W, MID_BOTTOM - 360, '#5A3A5A', 0, 0.5, 5);
  },
};

// ---------------------------------------------------------------------------
// Nearest: the rooftops of the next block over, down to the waterfront
// ---------------------------------------------------------------------------

const NEAR_FX = 0.22;
const SHORE_N = Math.round(560 + AT_SHORE * NEAR_FX);
const NEAR_TOP = 270, NEAR_BOTTOM = 560;
/** The waterfront at the end: the walk along the top of the quay, and the bank down from it. */
const QUAY_W = 70, QUAY_TOP = 446;
const quayY = (x: number) => QUAY_TOP + Math.max(0, (x - (SHORE_N - 40)) / 40) * (NEAR_BOTTOM - QUAY_TOP);
const NEAR_BASE = '#211A28';
const NEON = { text: 'HOTEL', x: 0, y: 0 };
const NEAR_FIRES: { x: number; y: number; w: number }[] = [];

interface Roof { x: number; w: number; top: number; c: string; kind: number }
const ROOFS: Roof[] = (() => {
  const r = rng(707), out: Roof[] = [];
  let x = -12, top = 330;
  while (x < SHORE_N - QUAY_W - 20) {
    const w = 34 + Math.floor(r() * 60);
    // (stepping down to the waterfront at the end)
    const toShore = Math.max(0, 1 - (SHORE_N - QUAY_W - x) / 300);
    top = Math.round(Math.max(316, Math.min(376, top + (r() - 0.5) * 50)) * (1 - toShore) + (370 + toShore * 50) * toShore);
    out.push({ x, w: Math.min(w, SHORE_N - QUAY_W - x), top, c: PAINT[Math.floor(r() * PAINT.length)], kind: Math.floor(r() * 6) });
    x += w;
  }
  return out;
})();
{
  const hotel = ROOFS.find(b => b.x > 840 && b.w > 50)!;
  NEON.x = hotel.x + Math.round(hotel.w / 2); NEON.y = hotel.top - 26;
  for (const b of [ROOFS.find(b => b.x > 360)!, ROOFS.find(b => b.x > 1300)!]) NEAR_FIRES.push({ x: b.x + Math.round(b.w / 2), y: b.top, w: Math.min(30, b.w - 10) });
}

const near: Layer = {
  key: 'ernie-city-near', fx: NEAR_FX, fy: 0.25, top: NEAR_TOP, h: NEAR_BOTTOM - NEAR_TOP, w: SHORE_N, base: NEAR_BASE,
  paint: (g, w) => {
    const r = rng(733);
    for (const b of ROOFS) {
      const body = mix(mix(b.c, '#4A3050', 0.66), '#1E1626', 0.55), rim = mix(body, '#E8907A', 0.3), shade = mix(body, '#120C18', 0.35), dark = mix(body, '#120C18', 0.55);
      // The wall: its paint gone dark against the sunset, lit just down its left edge, shaded right
      g.fillStyle = body; g.fillRect(b.x, b.top, b.w, NEAR_BOTTOM - b.top);
      g.fillStyle = rim; g.fillRect(b.x, b.top, 1, NEAR_BOTTOM - b.top);
      g.fillStyle = shade; g.fillRect(b.x + b.w - 6, b.top, 6, NEAR_BOTTOM - b.top); checker(g, b.x + b.w - 8, b.top, 2, NEAR_BOTTOM - b.top, shade);
      // (the top: a coping in shadow, darker than the wall, never lit: a roof up there isn't anywhere to stand)
      g.fillStyle = dark; g.fillRect(b.x, b.top, b.w, 3);
      // Windows in rows down it, a few lit, a few with a curtain or a shade half down
      for (let wy = b.top + 9; wy < NEAR_BOTTOM - 6; wy += 13) for (let wx = b.x + 5; wx < b.x + b.w - 10; wx += 9) {
        const v = r();
        if (v > 0.8) { g.fillStyle = v > 0.95 ? '#D8A068' : '#8A6650'; g.fillRect(wx, wy, 3, 5); g.fillStyle = '#5A4038'; g.fillRect(wx, wy, 3, Math.floor(r() * 3)); }
        else { g.fillStyle = dark; g.fillRect(wx, wy, 3, 5); }
      }
      // What's up on the roof
      const mx = b.x + 6 + Math.floor(r() * Math.max(1, b.w - 30));
      switch (b.kind) {
        case 0: { // a water tank on its stilts, its hoops, a pointed lid
          const tw = 16, tx = Math.min(mx, b.x + b.w - tw - 4), ty = b.top - 30;
          g.fillStyle = dark; for (const lx of [tx + 2, tx + tw - 4]) g.fillRect(lx, ty + 18, 2, 12); line(g, tx + 2, ty + 29, tx + tw - 3, ty + 20, dark);
          g.fillStyle = mix('#6A4A3A', '#1E1626', 0.5); g.fillRect(tx, ty + 4, tw, 14);
          g.fillStyle = mix('#A07050', '#1E1626', 0.45); g.fillRect(tx, ty + 4, 1, 14);
          g.fillStyle = mix('#3A2A2A', '#1E1626', 0.4); for (const hy of [ty + 7, ty + 12, ty + 16]) g.fillRect(tx, hy, tw, 1);
          for (let k = 0; k < 4; k++) { g.fillStyle = mix('#4A3434', '#1E1626', 0.4); g.fillRect(tx + k * 2, ty + 3 - k, tw - k * 4, 1); }
          break;
        }
        case 1: // chimneys
          for (const cx of [mx, mx + 14]) if (cx < b.x + b.w - 8) { g.fillStyle = mix('#7A3A34', '#1E1626', 0.5); g.fillRect(cx, b.top - 12, 6, 12); g.fillStyle = dark; g.fillRect(cx - 1, b.top - 13, 8, 2); }
          break;
        case 2: // a roof deck's railing, a chair up there
          g.fillStyle = dark; g.fillRect(b.x + 4, b.top - 8, b.w - 8, 1); for (let rx = b.x + 4; rx < b.x + b.w - 4; rx += 5) g.fillRect(rx, b.top - 8, 1, 8);
          break;
        case 3: // the back of a gable (a painted lady's, from behind)
          for (let k = 0; k < Math.floor(b.w / 2); k += 1) { g.fillStyle = k < b.w / 4 ? mix(body, '#E8907A', 0.12) : shade; g.fillRect(b.x + k, b.top - Math.min(k, b.w - k) * 0.5, 1, Math.min(k, b.w - k) * 0.5); g.fillRect(b.x + b.w - 1 - k, b.top - Math.min(k, b.w - k) * 0.5, 1, Math.min(k, b.w - k) * 0.5); }
          break;
        case 4: // an aerial and a dish
          g.fillStyle = dark; g.fillRect(mx, b.top - 20, 1, 20); g.fillRect(mx - 4, b.top - 18, 9, 1); g.fillRect(mx - 3, b.top - 14, 7, 1);
          pixelBlob(g, mx + 12, b.top - 5, 4, 4, dark, 1);
          break;
        default: // an air handler, its fan grille
          g.fillStyle = mix('#5A5460', '#1E1626', 0.5); g.fillRect(mx, b.top - 9, 18, 9); g.fillStyle = dark; g.fillRect(mx + 3, b.top - 7, 5, 5); g.fillRect(mx + 10, b.top - 7, 5, 5);
      }
      // (an ink line down where one meets the next)
      g.fillStyle = '#120C18'; g.fillRect(b.x + b.w - 1, b.top, 1, NEAR_BOTTOM - b.top);
    }
    // The hotel's sign frame on its roof (the letters lit live)
    const tw = textW(NEON.text, 3);
    g.fillStyle = '#16101C'; g.fillRect(NEON.x - tw / 2 - 4, NEON.y - 4, tw + 8, 23);
    g.fillStyle = '#2A1E2E'; g.fillRect(NEON.x - tw / 2 - 3, NEON.y - 3, tw + 6, 21);
    g.fillStyle = '#16101C'; g.fillRect(NEON.x - tw / 2, NEON.y + 18, 2, 8); g.fillRect(NEON.x + tw / 2 - 2, NEON.y + 18, 2, 8);
    pixText(g, NEON.text, Math.round(NEON.x - tw / 2), NEON.y, 3, '#4A2030');
    for (const f of NEAR_FIRES) steppedGlow(g, f.x, f.y - 4, 26, '#FF7A3A', 0.16, 0, 4);
    // The waterfront: the walk along the quay, a lamp and a bollard on it, the bank down into the water (and
    // nothing past it: the bay shows through from behind)
    const q0 = SHORE_N - QUAY_W;
    g.fillStyle = '#2C2434'; g.fillRect(q0, QUAY_TOP, QUAY_W, NEAR_BOTTOM - QUAY_TOP);
    g.fillStyle = '#382E40'; for (let y = QUAY_TOP + 5; y < NEAR_BOTTOM; y += 6) g.fillRect(q0, y, QUAY_W, 1);
    g.fillStyle = '#16101C'; g.fillRect(q0 + 20, QUAY_TOP - 8, 4, 8); g.fillRect(q0 + 8, QUAY_TOP - 26, 1, 26); g.fillRect(q0 + 6, QUAY_TOP - 27, 5, 2);
    g.fillStyle = '#E8B070'; g.fillRect(q0 + 7, QUAY_TOP - 25, 3, 1);
    for (let x = SHORE_N - 40; x < w; x++) g.clearRect(x, 0, 1, Math.round(quayY(x)));
    const qr = rng(181);
    for (let k = 0; k < 30; k++) { const x = SHORE_N - 40 + qr() * 40, y = quayY(x) + 3 + qr() * 5; pixelBlob(g, Math.round(x - 2), Math.round(y), 3 + qr() * 4, 2 + qr() * 2, qr() > 0.5 ? '#3A3040' : '#2E2636', 1); }
    // A haze of smoke down low over it all
    hazeBands(g, 0, 400, SHORE_N - 40, NEAR_BOTTOM - 400, '#2A1C2C', 0, 0.6, 4);
    void w;
  },
};

// ---------------------------------------------------------------------------
// Live bits
// ---------------------------------------------------------------------------

/** Puffs of smoke, painted the once a size (every 4px across), at the screen's resolution; put down see-through. */
const PUFFS = new Map<number, HTMLCanvasElement>();
const puff = (rw: number) => {
  const k = Math.max(1, Math.round(rw / 4));
  let c = PUFFS.get(k);
  if (!c && typeof document !== 'undefined') {
    const w = k * 4, h = Math.ceil(w * 0.5);
    c = document.createElement('canvas'); c.width = (w * 2 + 4) * S; c.height = (h * 2 + 4) * S;
    const g = c.getContext('2d')!; g.setTransform(S, 0, 0, S, 0, 0);
    pixelBlob(g, w + 2, h + 2, w, h, '#3A2A36');
    PUFFS.set(k, c);
  }
  return c;
};
/** A column of smoke going up off a fire, leaning off with the wind, thinning out. */
const smoke = (ctx: Ctx, x: number, y: number, f: number, size: number, seed: number) => {
  for (let i = 0; i < 12; i++) {
    const t = ((f * 0.2 + i * 24 + seed * 13) % 288) / 288;
    const c = puff((5 + t * 22) * size);
    if (!c) return;
    const pw = c.width / S, ph = c.height / S;
    ctx.globalAlpha = t < 0.3 ? 0.3 : t < 0.6 ? 0.22 : t < 0.85 ? 0.14 : 0.07;
    ctx.drawImage(c, Math.round(x - t * t * 90 * size + Math.sin(t * 5 + i + seed) * 2 - pw / 2), Math.round(y - t * 160 * size - ph / 2), pw, ph);
  }
  ctx.globalAlpha = 1;
};
/** A red aircraft light, blinking. */
const warnLight = (ctx: Ctx, x: number, y: number, f: number, phase: number) => {
  if ((f + phase) % 90 >= 32) { ctx.fillStyle = '#5A2030'; ctx.fillRect(x, y, 1, 1); return; }
  ctx.fillStyle = 'rgba(255, 70, 60, 0.25)'; ctx.fillRect(x - 2, y - 1, 5, 3); ctx.fillRect(x - 1, y - 2, 3, 5);
  ctx.fillStyle = '#FF5A48'; ctx.fillRect(x, y, 1, 1);
};

/** The sky and the city behind the streets and the bridge. `quake` (0..1) shakes the nearer layers. */
export const drawCityBackdrop = (ctx: Ctx, state: GameState, quake: number, drawFog: () => void) => {
  const f = state.frame || 0;
  // (above the sky, should the camera get that high: more of the night)
  ctx.fillStyle = SKY[0]; ctx.fillRect(0, 0, W, H);
  const s = put(ctx, state, sky);
  for (let i = 0; i < 5; i++) {
    const x = Math.round(hash(i + 3) * W), y = Math.round(10 + hash(i + 9) * 90 + s.oy), a = 0.4 + 0.6 * Math.abs(Math.sin(f * 0.03 + i * 1.7));
    ctx.fillStyle = `rgba(255, 246, 222, ${a.toFixed(2)})`; ctx.fillRect(x, y, 1, 1);
  }
  // (in a quake, everything with its feet on the ground shakes: a little far off, more nearer)
  const j = quake > 0 ? Math.sin(f * 1.9) * quake : 0;
  const a = put(ctx, state, far, Math.round(j));
  const at = (x: number) => x - a.ox;
  // The city's fires, the smoke off them
  FAR_FIRES.forEach((fi, i) => { const x = at(fi.x); if (x > -100 && x < W + 40) smoke(ctx, x, fi.y + a.oy - 4, f, 1, i); });
  // (the lights on Sutro Tower and the tall one)
  const sx = at(SUTRO.x);
  if (sx > -30 && sx < W + 30) for (const [px, ph] of [[-16, 0], [0, 30], [16, 60]]) warnLight(ctx, sx + px, SUTRO.y - 113 + a.oy, f, ph);
  const fx = at(SALESFORCE.x);
  if (fx > -10 && fx < W + 10) warnLight(ctx, fx, HZ - SALESFORCE.h - 2 + a.oy, f, 45);
  // The island out in the bay, its light going round; the sun on the water past the shore
  const ax = at(ALCATRAZ_U);
  if (ax > -80 && ax < W + 80) drawAlcatraz(ctx, ax, HZ + 4 + a.oy, 0.3, f);
  const gx0 = Math.max(0, at(SHORE_F + 10));
  if (gx0 < W) for (let i = 0; i < 10; i++) {
    const h = hash(Math.floor(f / 9) * 10 + i);
    if (h < 0.35) continue;
    ctx.fillStyle = h > 0.8 ? '#FFD49A' : '#E8945A';
    ctx.fillRect(Math.round(gx0 + h * (W - gx0)), HZ + 3 + (i % 6) * 3 + a.oy, 2 + Math.floor(h * 5), 1);
  }
  drawFog();
  const m = put(ctx, state, mid, Math.round(j * 1.5));
  // The cable car, grinding up the hill and back down (stopped dead in a quake)
  const mx = (x: number) => x - m.ox;
  if (mx(CABLE.x0) < W + 20 && mx(CABLE.x1) > -20) {
    const t = 0.5 - 0.5 * Math.cos(Math.floor(f * (quake > 0 ? 0 : 1) / 3) * 0.006);
    const cx = Math.round(mx(CABLE.x0 + (CABLE.x1 - CABLE.x0) * t)), cy = Math.round(CABLE.y0 + (CABLE.y1 - CABLE.y0) * t + m.oy);
    ctx.fillStyle = '#1E1418'; ctx.fillRect(cx - 7, cy - 9, 14, 8);
    ctx.fillStyle = '#7A3A30'; ctx.fillRect(cx - 6, cy - 8, 12, 6);
    ctx.fillStyle = '#C8B088'; ctx.fillRect(cx - 6, cy - 6, 12, 2);
    ctx.fillStyle = '#E8C070'; ctx.fillRect(cx - 5, cy - 6, 2, 2); ctx.fillRect(cx - 1, cy - 6, 2, 2); ctx.fillRect(cx + 3, cy - 6, 2, 2);
    ctx.fillStyle = '#4A2A26'; ctx.fillRect(cx - 7, cy - 10, 14, 1);
  }
  // (the billboard's lamp on the blink)
  const bx = mx(BILLBOARD.x);
  if (bx > -80 && bx < W + 10 && hash(Math.floor(f / 5)) > 0.3) {
    const by = Math.round(hills(BILLBOARD.x + 30)) - 34 + m.oy;
    ctx.fillStyle = 'rgba(255, 220, 150, 0.16)'; ctx.fillRect(bx + 4, by + 2, BILLBOARD.w - 8, BILLBOARD.h - 6);
    ctx.fillStyle = '#FFE2A8'; ctx.fillRect(bx + BILLBOARD.w / 2 - 1, by - 3, 3, 1);
  }
  MID_FIRES.forEach((fi, i) => {
    const x = mx(fi.x);
    if (x < -120 || x > W + 40) return;
    const y = Math.round(hills(fi.x)) + 4 + m.oy;
    smoke(ctx, x, y - 10, f, 1.3, 7 + i);
    drawFire(ctx, x, y, fi.w, 16, f, { seed: 40 + i, sparks: false, glow: 0 });
  });
  const n = put(ctx, state, near, Math.round(j * 2));
  const nx = (x: number) => x - n.ox;
  // The hotel's sign, on the blink (the T's had it: it hardly comes on)
  const hx = nx(NEON.x);
  if (hx > -60 && hx < W + 60) {
    const tw = textW(NEON.text, 3), on = !(Math.floor(f / 80) % 5 === 2 && hash(Math.floor(f / 3)) > 0.3);
    if (on) {
      steppedGlow(ctx, hx, NEON.y + 7 + n.oy, 34, '#FF6A8A', 0.14, 0, 3);
      pixText(ctx, NEON.text, Math.round(hx - tw / 2), NEON.y + n.oy, 3, i => (i === 2 && hash(Math.floor(f / 4) + 9) > 0.4 ? null : i === 2 ? '#FF9AB0' : '#FF7A98'));
    }
  }
  NEAR_FIRES.forEach((fi, i) => {
    const x = nx(fi.x);
    if (x < -160 || x > W + 60) return;
    smoke(ctx, x, fi.y + n.oy - 14, f, 1.8, 20 + i);
    drawFire(ctx, x, fi.y + n.oy, fi.w, 22, f, { seed: 60 + i, sparks: false, glow: 0 });
  });
};
