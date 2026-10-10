// After the boss: Meathead walking away from what he did, at the camera, his head down over his new toy (Mega Man 2's
// ending walk, done the SNES way). He walks in place; the world goes away behind him: the ground a Mode-7 plane
// rolling off to the horizon under his feet, the wreck behind him shrinking as it goes (sprite scaling), the haze over
// the fires rippling (raster wobble), the fires' palettes cycling, a banded sky, layered parallax, embers, dither, a
// stepped vignette, letterbox bars. Across the top: HEADING BACK TO HUB. Along the bottom (in the bar, nothing over
// the picture): the new weapon, what it does, the break room line, and PRESS [A] TO CONTINUE. It goes on till A.
//
// Each boss has its own version (walkAway/*.ts: the wreck, the time of day, the weapon, the gags). Shared: any boss
// stage plays it after its VICTORY (playWalkAway; tick it, draw it over everything in drawHud; onDone off A).

import type { GameState } from '../m1/game/core/state';
import type { Controls } from '../m1/game/platform/input';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../m1/constants';
import { playSound } from '../m1/game/platform/audio';
import { inputDevice, padFamily } from '../m1/game/platform/device';
import { drawPadFace } from '../m1/game/render/padGlyph';
import { isNude, isShat } from '../m1/game/player/gut';
import { M2_WEAPON_INFO } from './weapons/index';
import { type Ctx, type Prop, type SceneDef, LW, LH, TOP, BOT, HOR, F, CAM_H, SPEED, STEP, FEET_Y, ME_D, VP_X, ME_X, INK, project, stipple } from './walkAway/kit';
import { drawMeatheadFront, type Pose } from './walkAway/meathead';
import { SAFARI_ARTIE } from './walkAway/artie';
import { timeOfDay, multiply } from './timeOfDay';
import { takeSun, drawSunGhosts } from './sunFlare';
import { mix } from '../m1/game/render/backdrops/core';

/** The bosses that have a walk-away (add each boss's SceneDef here). */
export const WALK_AWAY_SCENES = { 'safari-artie': SAFARI_ARTIE } satisfies Record<string, SceneDef>;
export type WalkAwayBoss = keyof typeof WALK_AWAY_SCENES;

export interface WalkAwayOpts {
  boss: WalkAwayBoss;
  /** Killed by his weakness (the carnage shows it). */
  weakness?: boolean;
  /** A pressed: off it goes (to the hub). */
  onDone: () => void;
}

interface Bit { x: number; y: number; vx: number; vy: number; life: number; max: number; col: string; g: number }
export interface WalkAway {
  def: SceneDef; boss: WalkAwayBoss; weakness: boolean; onDone: () => void;
  t: number; done: boolean;
  /** A has to be let go of first (he may have been holding jump when the boss went down). */
  armed: boolean;
  nude: boolean; shat: boolean;
  props: Prop[];
  bits: Bit[]; embers: Bit[];
  lastStep: number; farted: number;
}

/** How long before A does anything (so a mashed jump off the boss's death doesn't skip it unseen). */
/** A few seconds of it before A takes him on (its prompt only up then). */
const A_AFTER = 180;

// Enter on the keyboard counts too (not one of the game's controls)
let enterDown = false;
let keysOn = false;
const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter') enterDown = e.type === 'keydown'; };
const listenKeys = (on: boolean) => {
  if (typeof window === 'undefined' || on === keysOn) return;
  keysOn = on; enterDown = false;
  if (on) { window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey); }
  else { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); }
};

/** Starts it: `state` (if there is one) for how he's dressed (shitty pants, none). */
export const playWalkAway = (state: GameState | null, opts: WalkAwayOpts): WalkAway => {
  const def = WALK_AWAY_SCENES[opts.boss];
  listenKeys(true);
  return {
    def, boss: opts.boss, weakness: !!opts.weakness, onDone: opts.onDone, t: 0, done: false, armed: false,
    nude: state ? isNude(state) : false, shat: state ? isShat(state) : false,
    props: def.props(!!opts.weakness), bits: [], embers: [], lastStep: 0, farted: 0,
  };
};

export const walkAwayDone = (w: WalkAway) => w.done;

// ---------------------------------------------------------------------------------------------------------------
// His beats: a loop (10 s) of admiring it, turning it over; up to his nose for a sniff; gagging, spitting; grinning.

const CYCLE = 600;
const ease = (k: number) => { const u = Math.max(0, Math.min(1, k)); return u * u * (3 - 2 * u); };

const poseAt = (w: WalkAway): Pose => {
  const t = w.t, u = t % CYCLE;
  const step = (t * Math.PI) / STEP;
  // (turning it over: a half turn every 150 frames, 40 frames to do it)
  const turnBase = Math.PI * (Math.floor(t / 150) + ease(((t % 150) - 110) / 40));
  // (up to his face and back)
  const up = u < 210 ? 0 : u < 250 ? ease((u - 210) / 40) : u < 330 ? 1 : u < 370 ? 1 - ease((u - 330) / 40) : 0;
  const home = Math.round(turnBase / (Math.PI * 2)) * Math.PI * 2;
  const turn = turnBase + (home - turnBase) * up;
  const green = u < 285 ? 0 : u < 300 ? (u - 285) / 15 : u < 340 ? 1 : u < 400 ? 1 - (u - 340) / 60 : 0;
  const face: Pose['face'] = u >= 245 && u < 290 ? 'sniff' : u >= 290 && u < 335 ? 'gag' : u >= 450 && u < 500 ? 'chuckle' : u < 210 || u >= 400 ? 'grin' : 'smirk';
  const jolt = face === 'gag' ? (u < 300 ? -2 : (Math.floor(t / 3) % 2) - 1) : face === 'chuckle' ? -(Math.floor(t / 6) % 2) : 0;
  return {
    step, t,
    wx: -11 * up, wy: -102 + (-124 + 102) * up + (face === 'chuckle' ? -(Math.floor(t / 6) % 2) : 0),
    rot: 0.05 * Math.sin(t * 0.03) * (1 - up) + -1.25 * up, turn,
    face, green, headY: jolt + (up > 0.5 ? -1 : 0),
    nude: w.nude, shat: w.shat, rim: w.def.rim,
  };
};

// ---------------------------------------------------------------------------------------------------------------

/** A frame. `controls`: the stage's (A is jump); left out, only Enter counts (the dev preview reads the pad itself). */
export const tickWalkAway = (w: WalkAway, controls?: Controls | null, padA = false) => {
  if (w.done) return;
  w.t++;
  const t = w.t, u = t % CYCLE;
  // (his footsteps)
  const stepN = Math.floor((t + STEP / 2) / STEP);
  if (stepN !== w.lastStep) { w.lastStep = stepN; playSound('land', 0.18, -5 + (stepN % 2)); }
  // (the sniff, the gag and the spit)
  if (u === 255 || u === 272) playSound('whoosh', 0.12, 9);
  if (u === 318) {
    playSound('barf', 0.35, 3);
    const [mx, my] = mouthAt(w);
    for (let i = 0; i < 14; i++) w.bits.push({ x: mx + 2, y: my, vx: 0.8 + Math.random() * 1.8, vy: -0.8 + Math.random() * 1.2, life: 0, max: 40 + Math.random() * 20, col: ['#A3B320', '#C5D33B', '#7C8A12'][i % 3], g: 0.12 });
  }
  // (Artie's last one, the once or twice it's in earshot)
  if (w.boss === 'safari-artie' && !w.weakness && t % 260 === 1 && w.farted < 2 && t > 100) { w.farted++; playSound('fart', 0.18, -2); }
  w.bits = w.bits.filter(b => { b.life++; b.x += b.vx; b.y += b.vy; b.vy += b.g; return b.life < b.max && b.y < FEET_Y + 4; });
  // (embers up off the fires, drifting across)
  if (w.def.embers && Math.random() < 0.35) w.embers.push({ x: Math.random() * LW, y: LH + 4, vx: 0.2 + Math.random() * 0.5, vy: -0.4 - Math.random() * 0.7, life: 0, max: 200 + Math.random() * 160, col: '', g: Math.random() * 6 });
  w.embers = w.embers.filter(e => { e.life++; e.x += e.vx + Math.sin(e.life * 0.05 + e.g) * 0.3; e.y += e.vy; return e.life < e.max && e.y > -4; });
  // A: off (a fresh press, once it's had a moment)
  const a = !!controls?.jump || enterDown || padA;
  if (!a) w.armed = true;
  else if (w.armed && t > A_AFTER) {
    w.done = true; listenKeys(false);
    playSound('menuok', 0.8);
    w.onDone();
  }
};

/** Where his mouth is (the picture), this frame. */
let lastMouth: [number, number] = [LW / 2, FEET_Y - 156];
const mouthAt = (_w: WalkAway) => lastMouth;

// ---------------------------------------------------------------------------------------------------------------
// Drawing

let lo: HTMLCanvasElement | null = null, loC: Ctx | null = null;
let tmp: HTMLCanvasElement | null = null;
let groundImg: ImageData | null = null;
// (each keyed by the scene and the hour: timeOfDay.ts)
const tiles = new Map<string, { px: Uint32Array; size: number }>();
const skies = new Map<string, HTMLCanvasElement>();
const sprites = new Map<string, HTMLCanvasElement[]>();
let vignette: HTMLCanvasElement | null = null;
const TILE = 256, TPM = 16;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const hexRgb = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));

/** The hour's light over the picture (timeOfDay.ts): its multiply, eased (the scene's own art carries some of it). */
const gradeOf = () => mix('#FFFFFF', timeOfDay().mul, 0.8);
/** The far haze: the hour's (the scene's own at sundown, where it was painted). */
const hazeOf = (def: SceneDef) => mix(timeOfDay().haze, def.haze, 0.35);

const canvas = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

const tileOf = (def: SceneDef) => {
  const key = `${def.land}|${timeOfDay().key}`;
  let t = tiles.get(key);
  if (!t) {
    const c = canvas(TILE, TILE), g = c.getContext('2d')!;
    def.ground(g, TILE, TILE);
    // (lit by the hour)
    g.globalCompositeOperation = 'multiply'; g.fillStyle = gradeOf(); g.fillRect(0, 0, TILE, TILE); g.globalCompositeOperation = 'source-over';
    t = { px: new Uint32Array(g.getImageData(0, 0, TILE, TILE).data.buffer.slice(0)), size: TILE };
    tiles.set(key, t);
  }
  return t;
};

const skyOf = (def: SceneDef) => {
  const tod = timeOfDay(), key = `${def.land}|${tod.key}`;
  let s = skies.get(key);
  if (!s) {
    // (the hour's own sky, top to horizon, lit as everything else is)
    const sky = tod.sky.map(c => multiply(c, gradeOf()));
    s = canvas(LW, HOR + 2);
    const g = s.getContext('2d')!;
    // (banded: flat steps, a dithered row where each meets the next)
    const n = 22, bh = (HOR + 2) / n;
    const at = (k: number) => {
      const f = Math.min(0.9999, k) * (sky.length - 1), i = Math.floor(f), m = f - i;
      const a = hexRgb(sky[i]), b = hexRgb(sky[i + 1]);
      return `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * m)).join(',')})`;
    };
    for (let i = 0; i < n; i++) {
      const y0 = Math.floor(i * bh), y1 = Math.floor((i + 1) * bh);
      g.fillStyle = at(i / (n - 1)); g.fillRect(0, y0, LW, y1 - y0);
      if (i < n - 1) { g.fillStyle = stipple(g, at((i + 1) / (n - 1))); g.fillRect(0, y1 - 1, LW, 1); }
    }
    skies.set(key, s);
  }
  return s;
};

/** A prop's picture at a fog level (0..3: the haze laid over it in steps, a palette swap's worth). */
const spriteOf = (def: SceneDef, p: Prop, fog: number) => {
  const key = `${p.id}|${p.w}|${p.h}|${timeOfDay().key}`;
  let arr = sprites.get(key);
  if (!arr) {
    const ppm = p.ppm ?? 20, w = Math.max(2, Math.round(p.w * ppm)), h = Math.max(2, Math.round(p.h * ppm));
    const base = canvas(w, h);
    const g = base.getContext('2d')!;
    p.paint!(g, w, h);
    // (lit by the hour: multiplied, then cut back to its own shape)
    const lit = canvas(w, h), lg = lit.getContext('2d')!;
    lg.drawImage(base, 0, 0);
    lg.globalCompositeOperation = 'multiply'; lg.fillStyle = gradeOf(); lg.fillRect(0, 0, w, h);
    lg.globalCompositeOperation = 'destination-in'; lg.drawImage(base, 0, 0);
    arr = [lit];
    for (let f = 1; f <= 3; f++) {
      const c = canvas(w, h), cg = c.getContext('2d')!;
      cg.drawImage(lit, 0, 0);
      cg.globalCompositeOperation = 'source-atop'; cg.globalAlpha = 0.16 * f; cg.fillStyle = hazeOf(def); cg.fillRect(0, 0, w, h);
      arr.push(c);
    }
    sprites.set(key, arr);
  }
  return arr[fog];
};

const vignetteOf = () => {
  if (!vignette) {
    vignette = canvas(LW, LH);
    const g = vignette.getContext('2d')!, img = g.createImageData(LW, LH), d = img.data;
    for (let y = 0; y < LH; y++) for (let x = 0; x < LW; x++) {
      const dx = (x - LW / 2) / (LW / 2), dy = (y - LH * 0.48) / (LH * 0.62);
      const r = Math.sqrt(dx * dx * 0.8 + dy * dy);
      const f = Math.max(0, (r - 0.72) / 0.5) * 4 + BAYER[(y & 3) * 4 + (x & 3)] / 16;
      const lvl = Math.min(4, Math.floor(f));
      const i = (y * LW + x) * 4;
      d[i + 3] = [0, 46, 84, 120, 160][lvl];
    }
    g.putImageData(img, 0, 0);
  }
  return vignette;
};

/** The ground, the SNES's Mode 7 way: a row at a time, each row the tile at its distance, fogged in dithered steps. */
const drawGround = (c: Ctx, def: SceneDef, travel: number, sway: number) => {
  const rows = LH - HOR;
  if (!groundImg || groundImg.height !== rows) groundImg = c.createImageData(LW, rows);
  const out = new Uint32Array(groundImg.data.buffer);
  const tile = tileOf(def).px, mask = TILE - 1;
  const [hr, hg, hb] = hexRgb(hazeOf(def));
  for (let r = 0; r < rows; r++) {
    const dy = r + 0.5, d = (F * CAM_H) / dy;
    const z = d - travel;
    const v = (Math.floor(z * TPM) & mask) * TILE;
    const fogF = Math.min(1, Math.max(0, (d - 5) / 45)) ** 0.75 * 4;
    const k = d / F;
    for (let x = 0; x < LW; x++) {
      const wx = (x + 0.5 - VP_X - sway) * k;
      const u = Math.floor((wx - ME_X) * TPM + TILE / 2) & mask;
      let px = tile[v + u];
      const lvl = Math.min(4, Math.floor(fogF + BAYER[(r & 3) * 4 + (x & 3)] / 16));
      if (lvl > 0) {
        const pr = px & 255, pg = (px >> 8) & 255, pb = (px >> 16) & 255;
        const a = 4 - lvl;
        px = (255 << 24) | (((pb * a + hb * lvl) >> 2) << 16) | (((pg * a + hg * lvl) >> 2) << 8) | ((pr * a + hr * lvl) >> 2);
      }
      out[r * LW + x] = px;
    }
  }
  c.putImageData(groundImg, 0, HOR);
};

/** The heat over the fires: rows shifted a pixel this way and that, rippling up (the SNES's raster trick). */
const wobble = (c: Ctx, x0: number, y0: number, w: number, h: number, t: number, amp: number) => {
  x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0));
  w = Math.min(LW - x0, Math.ceil(w)); h = Math.min(LH - y0, Math.ceil(h));
  if (w < 2 || h < 2) return;
  if (!tmp) tmp = canvas(LW, LH);
  const g = tmp.getContext('2d')!;
  g.clearRect(0, 0, w, h); g.drawImage(c.canvas, x0, y0, w, h, 0, 0, w, h);
  for (let y = 0; y < h; y++) {
    const off = Math.round(Math.sin((y0 + y) * 0.45 + t * 0.16) * amp * (0.4 + 0.6 * Math.sin((y0 + y) * 0.11 - t * 0.05) ** 2));
    if (off) c.drawImage(tmp, 0, y, w, 1, x0 + off, y0 + y, w, 1);
  }
};


/** The picture, in its own pixels. */
const drawScene = (c: Ctx, w: WalkAway) => {
  const { def, t } = w;
  const travel = SPEED * t;
  const step = (t * Math.PI) / STEP;
  const sway = Math.sin(step * 0.5) * 2;
  c.imageSmoothingEnabled = false;
  drawGround(c, def, travel, sway);
  c.drawImage(skyOf(def), 0, 0);
  def.back(c, t, sway, w.weakness);
  // The wreck, far to near, him in among it
  const LOOP = 30;
  const items: { d: number; p: Prop | null }[] = [{ d: ME_D, p: null }];
  for (const p of w.props) {
    // (litter comes round again: back in at the bottom edge of the picture, low things only, so it isn't seen to pop)
    const d = p.wrap ? ((((p.z + travel) % LOOP) + LOOP) % LOOP) + 2.1 : p.z + travel;
    if (d > 0.6 && d < 400) items.push({ d, p });
  }
  items.sort((a, b) => b.d - a.d);
  let heated = false;
  const heat: [number, number, number, number][] = [];
  for (const { d, p } of items) {
    if (!p) {
      // (the haze over the fires rippling, everything behind him)
      wobble(c, 0, HOR - 46, LW, 52, t, 1);
      for (const [x, y, ww, hh] of heat) wobble(c, x, y, ww, hh, t, 1.5);
      heated = true;
      const pose = poseAt(w);
      const marks = drawMeatheadFront(c, LW / 2, FEET_Y, pose, def.grip, def.drawWeapon);
      lastMouth = marks.mouth;
      continue;
    }
    if (p.wrap && d > 32) continue;
    const { sx, sy, s } = project(p.x, d, sway);
    const pw = p.w * s, ph = p.h * s;
    if (sx + pw / 2 < -40 || sx - pw / 2 > LW + 40) continue;
    if (p.paint && pw >= 1) {
      const fog = d < 8 ? 0 : d < 16 ? 1 : d < 30 ? 2 : 3;
      c.drawImage(spriteOf(def, p, fog), Math.round(sx - pw / 2), Math.round(sy - ph), Math.max(1, Math.round(pw)), Math.max(1, Math.round(ph)));
    }
    p.live?.(c, sx, sy, s, t);
    if (p.heat && !heated) heat.push([sx - pw * 0.6, Math.max(0, sy - ph - s * 6), pw * 1.2, ph + s * 6]);
  }
  // His stink (shitty pants): the flies on him, the wavy lines up off him
  if (w.shat) {
    for (let i = 0; i < 7; i++) { const a = t * (0.1 + i * 0.013) + i * 1.9; c.fillStyle = INK; c.fillRect(Math.round(LW / 2 + Math.cos(a) * (24 + i * 3)), Math.round(FEET_Y - 70 + Math.sin(a * 1.6) * 14), 1, 1); }
    for (let i = 0; i < 3; i++) for (let y = 0; y < 18; y += 2) { const yy = FEET_Y - 82 - y - ((t * 0.4 + i * 9) % 12); c.fillStyle = '#7E9434'; c.fillRect(Math.round(LW / 2 - 30 + i * 30 + Math.sin(yy * 0.5 + t * 0.1) * 2), Math.round(yy), 1, 2); }
  }
  // The spit, the embers
  for (const b of w.bits) { c.fillStyle = b.col; c.fillRect(Math.round(b.x), Math.round(b.y), 2, 2); }
  if (def.embers) for (const e of w.embers) {
    const col = def.embers[Math.floor(e.life / 5 + e.g) % def.embers.length];
    c.fillStyle = col; c.fillRect(Math.round(e.x), Math.round(e.y), 1, 1);
    if ((e.life >> 3) % 3 === 0) { c.fillStyle = stipple(c, col); c.fillRect(Math.round(e.x) - 1, Math.round(e.y) - 1, 3, 3); }
  }
  c.drawImage(vignetteOf(), 0, 0);
};

// ---------------------------------------------------------------------------------------------------------------
// The words

const TITLE = 'HEADING BACK TO HUB';
const TS = 20;
let titleFill: HTMLCanvasElement | null = null;

const font = (px: number) => `${px}px "Press Start 2P"`;

const drawTitle = (c: Ctx, t: number) => {
  const cy = 36;
  c.save();
  c.font = font(TS); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  const total = c.measureText(TITLE).width, x0 = Math.round(W / 2 - total / 2);
  // (each letter drops in, one after another, bounces and settles)
  const xs: number[] = []; let x = x0;
  for (const ch of TITLE) { xs.push(x); x += c.measureText(ch).width; }
  const at = (i: number) => {
    const u = t - 14 - i * 2;
    if (u < 0) return null;
    const k = Math.min(1, u / 10);
    const dy = u < 10 ? -40 * (1 - k) * (1 - k) : u < 16 ? -Math.sin(((u - 10) / 6) * Math.PI) * 4 : 0;
    return Math.round(dy);
  };
  // The fill (in its own canvas: banded gold, the shine swept over it)
  if (!titleFill) titleFill = canvas(W, TOP);
  const g = titleFill.getContext('2d')!;
  g.clearRect(0, 0, W, TOP);
  g.font = font(TS); g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  const bands = ['#FEF9C3', '#FDE047', '#FACC15', '#EAB308', '#CA8A04'];
  for (let i = 0; i < TITLE.length; i++) {
    const dy = at(i); if (dy === null || TITLE[i] === ' ') continue;
    for (let b = 0; b < bands.length; b++) {
      g.save(); g.beginPath(); g.rect(xs[i] - 2, cy - TS + dy + (b * TS) / bands.length, TS + 4, TS / bands.length + 0.5); g.clip();
      g.fillStyle = bands[b]; g.fillText(TITLE[i], xs[i], cy + dy); g.restore();
    }
  }
  // (the shine: a bright bar sweeping across, every few seconds)
  const sweep = (t - 70) % 200;
  if (t > 70 && sweep < 50) {
    const sx = x0 - 60 + (sweep / 50) * (total + 120);
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(sx, cy - TS - 4); g.lineTo(sx + 14, cy - TS - 4); g.lineTo(sx + 2, cy + 4); g.lineTo(sx - 12, cy + 4); g.fill();
    g.fillStyle = '#FFFBEB'; g.beginPath(); g.moveTo(sx + 20, cy - TS - 4); g.lineTo(sx + 24, cy - TS - 4); g.lineTo(sx + 12, cy + 4); g.lineTo(sx + 8, cy + 4); g.fill();
    g.globalCompositeOperation = 'source-over';
  }
  // The shadow and the ink outline, then the fill over them
  for (let i = 0; i < TITLE.length; i++) {
    const dy = at(i); if (dy === null || TITLE[i] === ' ') continue;
    c.fillStyle = '#000000'; c.fillText(TITLE[i], xs[i] + 3, cy + dy + 3);
    c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = 5; c.strokeText(TITLE[i], xs[i], cy + dy);
    c.strokeStyle = '#7C2D12'; c.lineWidth = 2; c.strokeText(TITLE[i], xs[i], cy + dy);
  }
  c.drawImage(titleFill, 0, 0);
  c.restore();
};

/** Words cut to lines of `n` characters at most. */
const wrap = (s: string, n: number) => {
  const out: string[] = []; let line = '';
  for (const word of s.split(/\s+/)) {
    if ((line + ' ' + word).trim().length > n) { out.push(line); line = word; } else line = (line + ' ' + word).trim();
  }
  if (line) out.push(line);
  return out;
};
const blurbOf = (def: SceneDef) => {
  if (def.blurb) return def.blurb.slice(0, 2);
  const info = def.weapon ? M2_WEAPON_INFO[def.weapon] : undefined;
  if (!info) return ['WHATEVER IT IS, IT WAS HIS. NOW IT IS YOURS.'];
  const lines = wrap(info.description.toUpperCase(), 72);
  if (lines.length > 2) lines[1] = lines[1].replace(/\s*\S*$/, '') + '...';
  return lines.slice(0, 2);
};
const nameOf = (def: SceneDef) => (def.weapon ? M2_WEAPON_INFO[def.weapon]?.name : undefined) ?? def.weaponName ?? 'NEW WEAPON';

const bar = (c: Ctx, y: number, h: number, ruleAt: number) => {
  c.fillStyle = '#05030A'; c.fillRect(0, y, W, h);
  // (banded dark to darker, and a gold rule along the picture's edge, a dithered row off it)
  const bands = ['#0C0816', '#0A0612', '#08050E'];
  for (let i = 0; i < bands.length; i++) { c.fillStyle = bands[i]; c.fillRect(0, ruleAt < y + h / 2 ? y + 3 + i * 6 : y + h - 9 - i * 6, W, 6); }
  c.fillStyle = '#CA8A04'; c.fillRect(0, ruleAt, W, 2);
  c.fillStyle = '#FDE047'; c.fillRect(0, ruleAt + (ruleAt < y + h / 2 ? 0 : 1), W, 1);
  c.fillStyle = stipple(c, '#7C5A05'); c.fillRect(0, ruleAt < y + h / 2 ? ruleAt + 2 : ruleAt - 2, W, 2);
};

const drawBottom = (c: Ctx, w: WalkAway) => {
  const { def, t } = w;
  const y0 = BOT;
  const k = Math.min(1, Math.max(0, (t - 40) / 20));
  if (k <= 0) return;
  c.save();
  c.globalAlpha = k;
  c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  // (the toy, small, beside its name)
  c.save(); c.translate(48, y0 + 22); c.scale(0.75, 0.75); c.imageSmoothingEnabled = false; def.drawWeapon(c, t); c.restore();
  c.font = font(8); c.fillStyle = '#A1A1AA'; c.fillText('NEW WEAPON', 84, y0 + 18);
  c.font = font(10); c.fillStyle = '#000'; c.fillText(nameOf(def), 85, y0 + 33); c.fillStyle = '#FACC15'; c.fillText(nameOf(def), 84, y0 + 32);
  c.font = font(7); c.fillStyle = '#E4E4E7';
  blurbOf(def).forEach((line, i) => c.fillText(line, 24, y0 + 52 + i * 12));
  c.fillStyle = '#7DD3FC'; c.fillText('HEAD TO THE EMPLOYEE BREAK ROOM TO TEST YOUR NEW TOY', 24, y0 + 90);
  c.restore();
  // PRESS [A] TO CONTINUE (bottom right; pulsing once it'll take it)
  if (t > A_AFTER) {
    c.save();
    const pulse = 0.75 + 0.25 * Math.sin(t * 0.12);
    c.globalAlpha = Math.min(1, (t - A_AFTER) / 15) * pulse;
    c.font = font(8); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    const y = y0 + 90, xR = W - 20;
    const tail = 'TO CONTINUE', wTail = c.measureText(tail).width, wPress = c.measureText('PRESS').width;
    const pad = inputDevice() === 'pad';
    c.font = font(6);
    const keyW = pad ? 18 : Math.max(26, c.measureText('SPACE').width + 8);
    c.font = font(8);
    let x = xR - wTail - 8 - keyW - 8 - wPress;
    c.fillStyle = '#F8FAFC'; c.fillText('PRESS', x, y); x += wPress + 8;
    if (pad) drawPadFace(c, x + 9, y - 4, 9, 'A', padFamily());
    else {
      c.fillStyle = '#E4E4E7'; c.beginPath(); c.roundRect(x, y - 11, keyW, 14, 2); c.fill();
      c.strokeStyle = '#52525B'; c.lineWidth = 1; c.stroke();
      c.fillStyle = '#A1A1AA'; c.fillRect(x + 1, y + 1, keyW - 2, 2);
      c.font = font(6); c.fillStyle = '#18181B'; c.textAlign = 'center'; c.fillText('SPACE', x + keyW / 2, y - 1); c.textAlign = 'left'; c.font = font(8);
    }
    x += keyW + 8;
    c.fillStyle = '#F8FAFC'; c.fillText(tail, x, y);
    c.restore();
  }
};

/** Draws it over the whole screen (call it from the stage's drawHud, screen space, last). */
export const drawWalkAway = (c: Ctx, w: WalkAway) => {
  if (typeof document === 'undefined') return;
  if (!lo) { lo = canvas(LW, LH); loC = lo.getContext('2d', { willReadFrequently: true })!; }
  drawScene(loC!, w);
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  // (the game canvas may be bigger than 800 x 600: scale to it)
  const cw = c.canvas.width, ch = c.canvas.height;
  c.scale(cw / W, ch / H);
  c.imageSmoothingEnabled = false;
  c.drawImage(lo!, 0, TOP, LW * 2, LH * 2);
  // (the lens's ghosts, if the scene has its sun up: over the picture, inside the letterbox; sunFlare.ts)
  const sun = takeSun();
  if (sun) drawSunGhosts(c, sun.x, TOP + sun.y, sun.k * sun.ghosts, { x: 0, y: TOP, w: W, h: BOT - TOP });
  bar(c, 0, TOP, TOP - 2);
  bar(c, BOT, H - BOT, BOT);
  // The line under the title: where he's leaving
  c.textAlign = 'center';
  drawTitle(c, w.t);
  if (w.t > 60) { c.font = font(7); c.fillStyle = '#A78BFA'; c.textAlign = 'center'; c.fillText(`${w.def.land} - CLEARED`, W / 2, 56); c.textAlign = 'left'; }
  drawBottom(c, w);
  // In: an iris opening out from him (the first half second)
  if (w.t < 30) {
    const r = ((w.t / 30) ** 2) * 560;
    c.fillStyle = '#000';
    c.beginPath(); c.rect(0, 0, W, H); c.arc(W / 2, TOP + (FEET_Y - 90) * 2, Math.max(0, r), 0, Math.PI * 2, true); c.fill('evenodd');
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Dev: ?walkaway=artie (&weak for his weakness death; &shat, &nude) plays it on its own over the page, again and again.

export const devPreviewWalkAway = () => {
  if (typeof document === 'undefined') return;
  const q = new URLSearchParams(location.search);
  const cv = canvas(W, H);
  Object.assign(cv.style, { position: 'fixed', inset: '0', margin: 'auto', zIndex: '9999', background: '#000', imageRendering: 'pixelated', maxWidth: '100vw', maxHeight: '100vh', aspectRatio: '4 / 3', width: 'min(100vw, 133.33vh)' });
  document.body.appendChild(cv);
  const c = cv.getContext('2d')!;
  let jumpDown = false;
  window.addEventListener('keydown', e => { if (e.key === ' ') jumpDown = true; });
  window.addEventListener('keyup', e => { if (e.key === ' ') jumpDown = false; });
  const start = () => {
    const w = playWalkAway(null, { boss: 'safari-artie', weakness: q.has('weak'), onDone: () => setTimeout(() => { cur = start(); }, 400) });
    w.shat = q.has('shat'); w.nude = q.has('nude');
    return w;
  };
  let cur = start();
  (window as unknown as { __walkAway: () => WalkAway }).__walkAway = () => cur;
  const frame = () => {
    const pad = navigator.getGamepads?.().find(p => p);
    tickWalkAway(cur, { left: false, right: false, up: false, down: false, jump: jumpDown, special: false, shoot: false }, !!pad?.buttons[0]?.pressed);
    drawWalkAway(c, cur);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};
