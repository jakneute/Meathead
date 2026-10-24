// The time of day in Happy Land: it goes by as he clears the lands. Morning when he first walks in (nothing cleared),
// midday a couple of lands on, the afternoon, golden hour, the sun going down, dusk, and night once they're all done.
// So the same land can be played in the morning (the first time) or at dusk (come back to it after clearing seven).
//
// Everything outdoors reads it: the skies (each scene's own banded sky pulled toward the hour's colors, its sun sinking
// to the horizon, the moon and stars coming out), the clouds (lit by it), the far scenery, and the world itself (a
// color grade multiplied over everything, and after sundown, the dark the lamps and fires cut through: the lighting
// system's SceneLight). Indoors (the garage, security, the staff room, the temple backstage, the mine) it's left alone.
//
// Continuous: `dayProgress` is 0..1 (lands cleared / 9), and the hour's look is mixed between named keyframes, so a
// palette's always a palette (bands stay bands: only the colors move).
//
// Dev: ?tod=<lands cleared, 0..9> (fractions go between: ?tod=6.5), or ?tod=<0..1 with a decimal point> for the day
// progress itself (?tod=0.5). window.__tod(n) sets it live (n as ?tod takes it; null to go back to the real count).

import { mix, noteBadColor } from '../m1/game/render/backdrops/core';
import { bandedGradient } from '../m1/game/render/pixelArt';
import type { Light, SceneLight } from '../m1/game/render/lighting';
import { landsCleared } from './store';
import { noteSun } from './sunFlare';

type Ctx = CanvasRenderingContext2D;
type RGB = [number, number, number];

/** How many lands Happy Land has (the design's nine: the day's spread over clearing them all). lands.ts lists eight so
 * far; the ninth's still to come. */
export const LAND_COUNT = 9;

// ---------------------------------------------------------------------------------------------------------------
// Where in the day it is

let override: number | null = null;
const parseTod = (s: string | null): number | null => {
  if (s === null || s.trim() === '') return null;
  const v = parseFloat(s);
  if (!Number.isFinite(v)) return null;
  // (with a decimal point and no more than 1: the day's progress itself; else lands cleared)
  if (s.includes('.') && v <= 1) return Math.max(0, Math.min(1, v));
  return Math.max(0, Math.min(1, v / LAND_COUNT));
};
if (import.meta.env.DEV && typeof location !== 'undefined') {
  override = parseTod(new URLSearchParams(location.search).get('tod'));
  (window as unknown as { __tod: (n: number | string | null) => void }).__tod = n => { override = n === null ? null : parseTod(String(n)); };
}

/**
 * Sets the hour by hand (the cheat menu, a preview): `landsCleared` 0..9 (fractions go between), or null to follow
 * the real progress again. Everything reads it the next frame (painted-once art is keyed by the hour).
 */
export const setTimeOfDayOverride = (landsCleared: number | null) => {
  override = landsCleared === null || !Number.isFinite(landsCleared) ? null : Math.max(0, Math.min(1, landsCleared / LAND_COUNT));
};
/** The hand-set hour, as lands cleared (null: following the real progress). */
export const timeOfDayOverride = () => (override === null ? null : override * LAND_COUNT);
/** How far through the day it is: 0 the morning he walks in, 1 night (every land cleared). */
export const dayProgress = () => override ?? Math.max(0, Math.min(1, landsCleared() / LAND_COUNT));

// ---------------------------------------------------------------------------------------------------------------
// The hours (keyframes): by lands cleared

interface Key {
  /** Lands cleared at this look. */
  at: number;
  name: string;
  /** The sky, top to horizon (six stops). */
  sky: string[];
  /** How far a scene's own sky is pulled to this one (0: its own colors). */
  skyK: number;
  /** The sun's height: 1 where the scene put it, 0 on the horizon, under 0 gone. Its disc, its glow. */
  sunH: number; sun: string; sunGlow: string;
  /** The moon and the stars (0..1). */
  moon: number; stars: number;
  /** What the clouds are lit by (multiplied in). */
  cloud: string;
  /** Multiplied over the whole outdoor picture (white: nothing). */
  mul: string;
  /** After dark: how dark (the lights cut through it), its color. */
  dark: number; shade: RGB;
  /** The haze down at the horizon. */
  haze: string;
  /** How much the lamps (signs, lit windows, fires) are glowing. */
  lamps: number;
}

const KEYS: Key[] = [
  { at: 0, name: 'morning', sky: ['#4A78C8', '#6690D6', '#8DAEE2', '#B8CCEA', '#E4DCD2', '#F7DDB4'], skyK: 0.4,
    sunH: 0.72, sun: '#FFF1C4', sunGlow: '#FFE7B0', moon: 0, stars: 0, cloud: '#FFF3E6', mul: '#FFF8EE', dark: 0, shade: [40, 30, 20], haze: '#F2E2CC', lamps: 0 },
  { at: 2, name: 'midday', sky: ['#2F62C8', '#4479D4', '#6494E0', '#8FB4EA', '#BCD2F0', '#DDE8F4'], skyK: 0.08,
    sunH: 1, sun: '#FFFDF2', sunGlow: '#FFF7DC', moon: 0, stars: 0, cloud: '#FFFFFF', mul: '#FFFFFF', dark: 0, shade: [40, 30, 20], haze: '#E6EEF6', lamps: 0 },
  { at: 4, name: 'afternoon', sky: ['#3462B8', '#4A7ACA', '#6E98DA', '#9AB8E4', '#CAD6E6', '#EADFC8'], skyK: 0.28,
    sunH: 0.85, sun: '#FFF4D0', sunGlow: '#FFE9B4', moon: 0, stars: 0, cloud: '#FFF6E8', mul: '#FFF6E8', dark: 0, shade: [40, 30, 20], haze: '#EEE0C8', lamps: 0 },
  { at: 6, name: 'golden hour', sky: ['#4A70B8', '#6A88C0', '#9A9CB8', '#D2A890', '#F2BC7C', '#FCD488'], skyK: 0.62,
    sunH: 0.38, sun: '#FFD878', sunGlow: '#FFB856', moon: 0, stars: 0, cloud: '#FFD8AE', mul: '#FFEAD0', dark: 0.03, shade: [90, 40, 20], haze: '#F2BC86', lamps: 0.15 },
  { at: 7, name: 'sunset', sky: ['#2A2864', '#463578', '#78427E', '#B85A6C', '#E8804E', '#FCB25A'], skyK: 0.84,
    sunH: 0.07, sun: '#FFA448', sunGlow: '#F87A3A', moon: 0.25, stars: 0.1, cloud: '#F4A88E', mul: '#F6CDB0', dark: 0.08, shade: [60, 24, 40], haze: '#E88E66', lamps: 0.45 },
  { at: 8, name: 'dusk', sky: ['#121634', '#1E2250', '#33306A', '#563E78', '#8A5276', '#C27064'], skyK: 0.9,
    sunH: -0.3, sun: '#F2683A', sunGlow: '#C24A44', moon: 0.75, stars: 0.5, cloud: '#9C8AB0', mul: '#BDB8DA', dark: 0.14, shade: [16, 14, 44], haze: '#7E5A80', lamps: 0.8 },
  { at: 9, name: 'night', sky: ['#060A1C', '#0B1230', '#121B42', '#1C2752', '#283460', '#38406C'], skyK: 0.93,
    sunH: -1, sun: '#F2683A', sunGlow: '#C24A44', moon: 1, stars: 1, cloud: '#5E6890', mul: '#A8B0DC', dark: 0.22, shade: [8, 12, 40], haze: '#2E3866', lamps: 1 },
];

/** The look at this point in the day: everything a scene needs to light itself by. */
export interface TimeOfDay {
  /** 0..1 through the day. */
  p: number;
  /** The nearest hour's name ('morning', 'midday', 'afternoon', 'golden hour', 'sunset', 'dusk', 'night'). */
  name: string;
  /** A key for caches (painted-once art): changes whenever the look does. */
  key: string;
  sky: string[]; skyK: number;
  sunH: number; sun: string; sunGlow: string;
  moon: number; stars: number;
  cloud: string; mul: string;
  dark: number; shade: RGB;
  haze: string; lamps: number;
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
let cached: TimeOfDay | null = null;

/** The look at `p` (0..1; the current point in the day by default). */
export const timeOfDay = (p = dayProgress()): TimeOfDay => {
  if (cached && cached.p === p) return cached;
  const L = p * LAND_COUNT;
  let i = 0;
  while (i < KEYS.length - 2 && L > KEYS[i + 1].at) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const k = Math.max(0, Math.min(1, (L - a.at) / (b.at - a.at)));
  const tod: TimeOfDay = {
    p, name: k < 0.5 ? a.name : b.name, key: `tod${Math.round(p * 1000)}`,
    sky: a.sky.map((c, j) => mix(c, b.sky[j], k)), skyK: lerp(a.skyK, b.skyK, k),
    sunH: lerp(a.sunH, b.sunH, k), sun: mix(a.sun, b.sun, k), sunGlow: mix(a.sunGlow, b.sunGlow, k),
    moon: lerp(a.moon, b.moon, k), stars: lerp(a.stars, b.stars, k),
    cloud: mix(a.cloud, b.cloud, k), mul: mix(a.mul, b.mul, k),
    dark: lerp(a.dark, b.dark, k), shade: a.shade.map((v, j) => Math.round(lerp(v, b.shade[j], k))) as RGB,
    haze: mix(a.haze, b.haze, k), lamps: lerp(a.lamps, b.lamps, k),
  };
  cached = tod;
  return tod;
};

// ---------------------------------------------------------------------------------------------------------------
// Colors

const rgb = (c: string): RGB => {
  // (not a color (a palette read past its end somewhere): a mid gray, not a crash that takes the frame down)
  if (typeof c !== 'string' || c[0] !== '#') { noteBadColor('timeOfDay rgb', c); return [128, 128, 128]; }
  if (c.length === 4) return [parseInt(c[1] + c[1], 16), parseInt(c[2] + c[2], 16), parseInt(c[3] + c[3], 16)];
  return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
};
const hex = (v: number[]) => '#' + v.map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
/** `a` multiplied by `b` (as the canvas's 'multiply' would). */
export const multiply = (a: string, b: string) => { const x = rgb(a), y = rgb(b); return hex(x.map((v, i) => (v * y[i]) / 255)); };

/** The hour's sky at `v` (0 the top, 1 the horizon). */
export const skyAt = (v: number, tod = timeOfDay()) => {
  const f = Math.max(0, Math.min(0.9999, v)) * (tod.sky.length - 1), i = Math.floor(f);
  return mix(tod.sky[i], tod.sky[i + 1], f - i);
};
/**
 * For art painted at one hour that needs others: its color by day, at sundown and at night, mixed for the hour (day up
 * to the afternoon, into sundown by sunset, into night by the last land).
 */
export const hourMix = (day: string, sundown: string, night: string, tod = timeOfDay()) => {
  const L = tod.p * LAND_COUNT;
  return L <= 5 ? day : L <= 7 ? mix(day, sundown, (L - 5) / 2) : mix(sundown, night, Math.min(1, (L - 7) / 2));
};
/** A scene's own sky color at `v` (0 top .. 1 horizon), pulled toward the hour's. */
export const skyTint = (col: string, v: number, tod = timeOfDay()) => (tod.skyK < 0.01 ? col : mix(col, skyAt(v, tod), tod.skyK));
/**
 * A scene's own sky palette (top to horizon) as the hour has it: each band pulled toward the hour's sky at its height,
 * `top`..`bottom` being where the palette's ends are in the hour's sky (0 top, 1 horizon: a sky that stops short of
 * the horizon passes a bottom under 1).
 */
export const skyRamp = (cols: string[], tod = timeOfDay(), top = 0, bottom = 1) =>
  cols.map((c, i) => skyTint(c, top + (bottom - top) * (cols.length < 2 ? 1 : i / (cols.length - 1)), tod));
/** A cloud's color, lit by the hour. */
export const cloudTint = (col: string, tod = timeOfDay()) => multiply(col, tod.cloud);
/** Far scenery (hills, a skyline) the hour's way: into the haze a little, under its light. `k`: how much (1 = far). */
// (asked for the same few hundred colors thousands of times a frame: each worked out once an hour's look, kept)
let farTod: TimeOfDay | null = null;
const farMemo = new Map<string, string>();
export const farTint = (col: string, k = 1, tod = timeOfDay()) => {
  if (tod !== farTod) { farTod = tod; farMemo.clear(); }
  const key = k === 1 ? col : col + '|' + k;
  let v = farMemo.get(key);
  if (v === undefined) {
    const lit = multiply(col, tod.mul);
    const hazeK = (tod.skyK - 0.1) * 0.35 * k;
    v = hazeK > 0.01 ? mix(lit, tod.haze, hazeK) : lit;
    if (farMemo.size > 8192) farMemo.clear();
    farMemo.set(key, v);
  }
  return v;
};
/**
 * A cache of art painted for the hour (keyed by `tod.key` among the rest), kept to this hour's: the first ask at a new
 * hour lets the last hour's lot go (never wanted again: the day only goes on). `drop` empties it, if a clear() alone
 * won't (a byte count to reset with it). Gives the cache back.
 */
const hourOf = new WeakMap<object, string>();
export const thisHour = <M extends { clear(): void }>(cache: M, drop?: () => void): M => {
  const key = timeOfDay().key, was = hourOf.get(cache);
  if (was !== key) { hourOf.set(cache, key); if (was !== undefined) { if (drop) drop(); else cache.clear(); } }
  return cache;
};
/**
 * A color helper that depends only on the color (and an optional number) and the hour's look (a land's `dimmed`, its
 * `hour`), worked out once per color per look and kept: the same colors out, without the half-dozen mixes a call every
 * time. Only for helpers that read nothing but their arguments and timeOfDay().
 */
export const hourly = (f: (col: string, k?: number) => string) => {
  let at: TimeOfDay | null = null;
  const memo = new Map<string, string>();
  return (col: string, k?: number) => {
    const tod = timeOfDay();
    if (tod !== at) { at = tod; memo.clear(); }
    const key = k === undefined ? col : col + '|' + k;
    let v = memo.get(key);
    if (v === undefined) { v = f(col, k); if (memo.size > 8192) memo.clear(); memo.set(key, v); }
    return v;
  };
};
/** The hour's sun, for a scene that put its sun at (x, y) over a horizon at `horizon` (screen y): where it is now
 * (sunk toward the horizon), whether it's up at all (0..1), and its colors. */
export const sunAt = (x: number, y: number, horizon: number, tod = timeOfDay()) => {
  const h = tod.sunH;
  return { x, y: horizon + (y - horizon) * h, up: Math.max(0, Math.min(1, (h + 0.12) / 0.2)), core: tod.sun, glow: tod.sunGlow };
};
/** One of a scene's sun colors (its glare, its disc, its rim) in the hour's light: gold toward evening (its steps kept). */
export const sunTint = (col: string, tod = timeOfDay()) => multiply(col, mix('#FFFFFF', tod.sun, Math.min(1, tod.skyK * 1.2)));

// ---------------------------------------------------------------------------------------------------------------
// Night things: stars, the moon (SNES: pixels on a grid, a stepped disc, no blur)

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/**
 * Stars over a sky box (screen space): pixel dots, a few bigger crosses, twinkling (the odd one flicks off and on),
 * fewer and fainter toward the horizon (the bottom of the box). `scroll`: parallax (screen px the sky's moved).
 */
export const drawStars = (c: Ctx, x: number, y: number, w: number, h: number, t = 0, scroll = 0, tod = timeOfDay(), px = 2) => {
  if (tod.stars <= 0.02 || h <= 0) return;
  const n = Math.round(110 * tod.stars * ((w * 2) / px / 800) * Math.min(1, (h * 2) / px / 300));
  c.save();
  for (let i = 0; i < n; i++) {
    const v = hash(i * 7.31 + 2) ** 1.6;
    const sx = x + ((((hash(i * 3.17) * w - scroll * 0.05) % w) + w) % w), sy = y + v * h;
    const fade = (1 - v) * tod.stars;
    if (hash(i * 5.3 + Math.floor(t / 40 + i)) < 0.06) continue;
    c.globalAlpha = Math.min(1, 0.35 + fade * 0.75);
    const big = hash(i * 9.1) > 0.92;
    c.fillStyle = hash(i * 1.7) > 0.8 ? '#FFE9C4' : hash(i * 2.3) > 0.8 ? '#C8DAFF' : '#F4F6FF';
    const gx = Math.round(sx / px) * px, gy = Math.round(sy / px) * px;
    c.fillRect(gx, gy, px, px);
    if (big) { c.globalAlpha *= 0.55; c.fillRect(gx - px, gy, px * 3, px); c.fillRect(gx, gy - px, px, px * 3); }
  }
  c.restore();
};

/** The moon (a fat waxing gibbous: a stepped disc, its maria, a dark bite, a stepped glow round it). Screen space. */
export const drawMoon = (c: Ctx, x: number, y: number, r = 18, tod = timeOfDay()) => {
  if (tod.moon <= 0.02) return;
  c.save();
  c.globalAlpha = Math.min(1, tod.moon);
  // (the glow: rings, stepped)
  for (let i = 3; i >= 1; i--) { c.fillStyle = `rgba(200, 214, 255, ${(0.05 * (4 - i)).toFixed(3)})`; c.beginPath(); c.arc(x, y, r + i * r * 0.55, 0, Math.PI * 2); c.fill(); }
  const disc = (dx: number, dy: number, rr: number, col: string) => { c.fillStyle = col; c.beginPath(); c.arc(Math.round(x + dx), Math.round(y + dy), rr, 0, Math.PI * 2); c.fill(); };
  disc(0, 0, r, '#C9CDE0');
  disc(-r * 0.12, -r * 0.12, r * 0.86, '#E4E6F2');
  disc(-r * 0.3, -r * 0.3, r * 0.42, '#F8F8FF');
  // (the maria: grey blotches)
  disc(r * 0.25, -r * 0.2, r * 0.22, '#B8BCD2'); disc(-r * 0.2, r * 0.3, r * 0.28, '#BEC2D6'); disc(r * 0.35, r * 0.35, r * 0.14, '#B4B8CE');
  c.restore();
  // (the shadow side: a bite of the sky's own color off its right, stepped)
  c.save();
  c.globalAlpha = Math.min(1, tod.moon) * 0.75;
  c.beginPath(); c.arc(x, y, r + 0.5, 0, Math.PI * 2); c.clip();
  c.fillStyle = '#1A2148'; c.beginPath(); c.arc(x + r * 1.45, y - r * 0.1, r * 0.95, 0, Math.PI * 2); c.fill();
  c.restore();
};

/** The sky's night things over a sky box: the stars, then the moon at (moonX, moonY). */
export const drawNightSky = (c: Ctx, x: number, y: number, w: number, h: number, moonX: number, moonY: number, t = 0, scroll = 0, tod = timeOfDay()) => {
  drawStars(c, x, y, w, h, t, scroll, tod);
  drawMoon(c, moonX, moonY, 18, tod);
};

// ---------------------------------------------------------------------------------------------------------------
// The light over the world

/**
 * An outdoor scene's lighting at this hour (null when it needs none: midday). `lights`: the scene's own lamps (their
 * strength scaled up with the dusk), `amount`: how outdoors it is (1 open sky; under the canopy or the water, less).
 */
export const todLight = (lights: Light[] = [], amount = 1, tod = timeOfDay()): SceneLight | null => {
  const k = Math.max(0, Math.min(1, amount));
  const grade = k >= 0.999 ? tod.mul : mix('#FFFFFF', tod.mul, k);
  const dark = tod.dark * k;
  if (grade.toUpperCase() === '#FFFFFF' && dark <= 0.02) return null;
  return {
    dark, shade: tod.shade, rim: 0.6, grade,
    lights: tod.lamps > 0.05 ? lights.map(l => ({ ...l, a: l.a * tod.lamps })) : [],
  };
};

/** How much the lamps are glowing (0 by day .. 1 at night), for a scene's own glow art. */
export const lampGlow = (tod = timeOfDay()) => tod.lamps;

// ---------------------------------------------------------------------------------------------------------------
// A whole sky, for a scene that's only got a plain one (a crude first pass): banded, its sun (or the moon and stars)

/** The sun as the hour has it: stepped rings of glow, a banded disc (low and big and orange toward sundown). Screen
 * space (it notes itself for the lens's glare: sunFlare.ts). */
export const drawSun = (c: Ctx, x: number, y: number, r = 22, tod = timeOfDay()) => {
  const up = Math.max(0, Math.min(1, (tod.sunH + 0.12) / 0.2));
  if (up <= 0.02) return;
  // (its glare, behind its disc; noted for the lens's ghosts over the lot later this frame: sunFlare.ts)
  noteSun(c, x, y, 1, 1, 1, tod);
  const big = r * (1 + 0.25 * Math.max(0, 0.5 - tod.sunH));
  const [gr, gg, gb] = rgb(tod.sunGlow);
  c.save();
  c.globalAlpha = up;
  for (let i = 4; i >= 1; i--) { c.fillStyle = `rgba(${gr}, ${gg}, ${gb}, ${(0.06 * (5 - i)).toFixed(3)})`; c.beginPath(); c.arc(Math.round(x), Math.round(y), big * (1 + i * 0.6), 0, Math.PI * 2); c.fill(); }
  c.fillStyle = tod.sunGlow; c.beginPath(); c.arc(Math.round(x), Math.round(y), big, 0, Math.PI * 2); c.fill();
  c.fillStyle = tod.sun; c.beginPath(); c.arc(Math.round(x), Math.round(y), big * 0.86, 0, Math.PI * 2); c.fill();
  c.fillStyle = mix(tod.sun, '#FFFFFF', 0.6); c.beginPath(); c.arc(Math.round(x - big * 0.15), Math.round(y - big * 0.15), big * 0.55, 0, Math.PI * 2); c.fill();
  c.restore();
};

/**
 * A banded sky (screen space) from `stops` (the scene's own, top to horizon) as the hour has it, in `bands` flat steps
 * dithered where they meet; then the stars, the moon, and the sun (at sunX, sunY by day: it sinks toward `horizon`).
 */
export const drawTodSky = (c: Ctx, x: number, y: number, w: number, h: number, stops: string[], opts: { bands?: number; sun?: [number, number]; moon?: [number, number]; horizon?: number; t?: number; scroll?: number } = {}) => {
  const tod = timeOfDay();
  // (the bands run down to the horizon; under it, the last of them)
  const horizon = opts.horizon ?? y + h, ramp = skyRamp(stops, tod);
  const sh = Math.max(40, Math.min(h, horizon - y));
  bandedGradient(c, x, y, w, sh, ramp, opts.bands ?? 14);
  if (sh < h) { c.fillStyle = ramp[ramp.length - 1]; c.fillRect(x, y + sh, w, h - sh); }
  drawStars(c, x, y, w, Math.min(h, horizon - y), opts.t ?? 0, opts.scroll ?? 0, tod);
  if (opts.moon) drawMoon(c, opts.moon[0], opts.moon[1], 18, tod);
  if (opts.sun) { const s = sunAt(opts.sun[0], opts.sun[1], horizon, tod); drawSun(c, s.x, s.y, 22, tod); }
};
