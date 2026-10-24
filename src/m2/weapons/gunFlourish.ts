// The shooting's flourishes (the ray gun, the souvenir launcher, the flintlock): the bits of show round a shot that
// make it feel like one, and nothing else. Muzzle flares in flat stepped shapes, smoke that curls as it goes up, rings
// off a hit, cartoon words popping off a kill, the ray gun's bolts trailing dithered ghosts and sparkle. None of it
// touches a hit, a kill or a frame of anybody's timing: it's all looks.
// Kept cheap: every repeated shape (a flare, a puff, a word, a ghost) is painted the once into a little canvas of its
// own (at twice the world's scale, put down at half) and stamped after that with one drawImage; a ring's a few lines;
// there's a cap on how many are going at once, and anything that goes in state.particles respects the engine's.
// Ticked and drawn off the souvenir launcher's own slots (it's always registered in Meathead 2: weapons/index.ts):
// the ray gun's the engine's pistol made over and has none of its own, so its show's worked out here by watching its
// bolts come and go.

import type { Particle, Projectile } from '../../m1/types';
import type { GameState } from '../../m1/game/core/state';
import { shakeScreen } from '../../m1/game/core/state';
import { muzzlePoint } from '../../m1/game/combat/muzzle';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../m1/constants';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';
/** The little canvases are painted at this times the world's scale (put down at 1 / HI: sharp at the usual 2x). */
const HI = 2;
/** Most flourishes going at once; the engine's own particle cap (core/effects.ts). */
const MAX_FX = 160, MAX_PARTICLES = 2500;

// ---------------------------------------------------------------------------------------------------------------
// The little canvases

const sprites = new Map<string, HTMLCanvasElement | null>();
/** One painted the once: `w` x `h` world pixels, the origin at (ox, oy); null where there's no canvas to paint on (a
 *  headless run). */
const sprite = (key: string, w: number, h: number, ox: number, oy: number, paint: (g: Ctx) => void, keep = true) => {
  let cv = sprites.get(key);
  if (cv !== undefined) return cv;
  cv = null;
  if (typeof document !== 'undefined') {
    cv = document.createElement('canvas'); cv.width = Math.ceil(w * HI); cv.height = Math.ceil(h * HI);
    const g = cv.getContext('2d');
    if (g) { g.scale(HI, HI); g.translate(ox, oy); paint(g); } else cv = null;
  }
  if (keep) sprites.set(key, cv);
  return cv;
};
/** Put one down at (x, y) (its origin), turned `rot`, scaled `s`, mirrored `flip`. */
const put = (c: Ctx, cv: HTMLCanvasElement | null, x: number, y: number, ox: number, oy: number, s = 1, rot = 0, flip = 1) => {
  if (!cv) return;
  if (!rot && flip === 1) { const k = s / HI; c.drawImage(cv, x - ox * s, y - oy * s, cv.width * k, cv.height * k); return; }
  c.save(); c.translate(x, y); if (rot) c.rotate(rot); c.scale(flip * s / HI, s / HI); c.drawImage(cv, -ox * HI, -oy * HI); c.restore();
};

/** A checkerboard knocked out of whatever's painted (the SNES's see-through: every other pixel). */
const dither = (g: Ctx, w: number, h: number, ox: number, oy: number, phase = 0) => {
  g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000';
  for (let y = 0; y < h; y++) for (let x = (y + phase) & 1; x < w; x += 2) g.fillRect(x - ox, y - oy, 1, 1);
  g.restore();
};

/** A four-pointed star in flat stepped rows (the ray gun's flare, a glint): each colour a smaller star over the last. */
const starFlare = (R: number, pal: readonly string[]) => sprite(`star:${R}:${pal.join()}`, R * 2 + 2, R * 2 + 2, R + 1, R + 1, g => {
  pal.forEach((col, i) => {
    const len = Math.max(1, Math.round(R * (1 - i * 0.24))), th = Math.max(1, Math.round(len * 0.22));
    g.fillStyle = col;
    for (let y = -len; y <= len; y++) {
      const t = 1 - Math.abs(y) / len, hw = Math.round(len * t * t * t + th * t);
      if (hw > 0) g.fillRect(-hw, y, hw * 2, 1);
    }
  });
});

/** A cone of fire out the front (+x), in flat stepped rows hot to cool, a spike or two out of it: a gun going off. */
const coneFlare = (len: number, hgt: number, pal: readonly string[]) => sprite(`cone:${len}:${hgt}:${pal.join()}`, len + 2, hgt * 2 + 4, 1, hgt + 2, g => {
  pal.forEach((col, i) => {
    const L = Math.round(len * (1 - i * 0.2)), H = hgt * (1 - i * 0.26);
    g.fillStyle = col;
    for (let x = 0; x < L; x++) { const hw = Math.round(H * Math.pow(Math.sin(Math.PI * Math.min(1, (x + 1) / L) * 0.92), 0.7)); if (hw > 0) g.fillRect(x, -hw, 1, hw * 2); }
    // (spikes off it, up and down, the outer colours only)
    if (i < 2) { g.fillRect(Math.round(L * 0.35), -Math.round(H + 2), 1, Math.round(H + 2)); g.fillRect(Math.round(L * 0.55), 0, 1, Math.round(H + 3)); }
  });
});

/** A puff of smoke: a round blob in two tones (lit up top), its rim dithered out. */
const puffSprite = (r: number, tone: 0 | 1 | 2) => sprite(`puff:${r}:${tone}`, r * 2 + 2, r * 2 + 2, r + 1, r + 1, g => {
  const [base, lit] = tone === 0 ? ['#D4D4D8', '#F4F4F5'] : tone === 1 ? ['#A1A1AA', '#D4D4D8'] : ['#57534E', '#78716C'];
  for (let y = -r; y <= r; y++) {
    const hw = Math.round(Math.sqrt(Math.max(0, r * r - y * y)));
    g.fillStyle = base; g.fillRect(-hw, y, hw * 2, 1);
    const lw = Math.round(hw * 0.7);
    if (y < 0 && lw > 0) { g.fillStyle = lit; g.fillRect(-lw - 1, y, Math.round(lw * 1.4), 1); }
  }
  // (the rim: every other pixel gone, so it's soft without a smooth fade)
  g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000';
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) { const d = Math.hypot(x + 0.5, y + 0.5); if (d > r - 1.6 && ((x + y) & 1)) g.fillRect(x, y, 1, 1); }
  g.restore();
});

/** A cartoon word, inked thick, two flat colours (the top half lighter): ZAP!, POP!, CLONK! */
const FONT = 'bold 9px "Press Start 2P"';
const wordSprite = (word: string, pal: readonly [string, string]) => {
  const w = word.length * 9 + 8, h = 17;
  return sprite(`word:${word}:${pal.join()}`, w, h, w / 2, h / 2, g => {
    g.font = FONT; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = INK;
    for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5], [1, 3], [2, 2.5]]) g.fillText(word, dx, dy);
    g.fillStyle = pal[1]; g.fillText(word, 0, 0);
    g.save(); g.beginPath(); g.rect(-w, -h, w * 2, h - 0.5); g.clip(); g.fillStyle = pal[0]; g.fillText(word, 0, 0); g.restore();
  // (kept only once the pixel font's in: painted before it loads, it'd be stuck in the browser's own for good)
  }, typeof document === 'undefined' || !document.fonts || document.fonts.check(FONT));
};

// ---------------------------------------------------------------------------------------------------------------
// The flourishes going

type FxKind = 'star' | 'cone' | 'ring' | 'puff' | 'word' | 'sparkle' | 'spokes';
interface Fx {
  k: FxKind; x: number; y: number; vx: number; vy: number;
  t: number; life: number; size: number;
  /** Frames before it shows (smoke down a ball's line, one puff after another). */
  wait: number;
  dir: 1 | -1; pal: readonly string[]; word?: string; seed: number;
  /** Turned (a cone shot off at an angle). */
  rot?: number;
}
let fxs: Fx[] = [];
const add = (f: Omit<Fx, 't' | 'wait' | 'seed' | 'dir' | 'vx' | 'vy'> & Partial<Pick<Fx, 'wait' | 'dir' | 'vx' | 'vy' | 'rot'>>) => {
  if (fxs.length >= MAX_FX) return;
  fxs.push({ t: 0, wait: 0, dir: 1, vx: 0, vy: 0, seed: Math.random() * 100, ...f });
};

/** A flare: a stepped four-pointed star (`R` across), a few frames. */
export const flareStar = (x: number, y: number, R: number, pal: readonly string[], life = 4) => add({ k: 'star', x, y, size: R, life, pal });
/** A gun going off: a stepped cone out the way it's pointing (`dir`, tipped `rot` off level). */
export const flareCone = (x: number, y: number, dir: 1 | -1, len: number, pal: readonly string[], life = 4, rot = 0) => add({ k: 'cone', x, y, size: len, life, pal, dir, rot });
/** A ring going out from a hit: from r0 to r1 over its life, an inked octagon, stepping as it goes. */
export const impactRing = (x: number, y: number, r1: number, color: string, life = 10) => add({ k: 'ring', x, y, size: r1, life, pal: [color] });
/** Smoke: drifts (vx, vy), rising, curling side to side as it goes, swelling a little and thinning out. */
export const smokePuff = (x: number, y: number, r: number, tone: 0 | 1 | 2, life: number, vx = 0, vy = -0.5, wait = 0) => add({ k: 'puff', x, y, vx, vy, size: r, life, pal: [String(tone)], wait });
/** A word popping off something: up it pops, holds, and blinks out. */
export const wordPop = (x: number, y: number, word: string, pal: readonly [string, string], life = 34) => add({ k: 'word', x, y, size: 1, life, pal, word });
/** A twinkle hanging where something went by. */
export const sparkle = (x: number, y: number, color: string, life = 12) => add({ k: 'sparkle', x, y, size: 1, life, pal: [color] });
/** Lines shooting out of a hit (a starburst), short and fast. */
export const spokes = (x: number, y: number, len: number, color: string, life = 6) => add({ k: 'spokes', x, y, size: len, life, pal: [color] });

/** A few words a moment apart at most (they'd be a pile on top of each other otherwise). */
let lastWord = -100;
export const wordPopLimited = (state: GameState, x: number, y: number, word: string, pal: readonly [string, string], gap = 20) => {
  if (state.frame - lastWord < gap && state.frame >= lastWord) return;
  lastWord = state.frame; wordPop(x, y, word, pal);
};

/** Bits flying off (into the engine's particles, under its cap). */
export const debris = (state: GameState, p: Particle) => { if (state.particles.length < MAX_PARTICLES) state.particles.push(p); };

/** A little shake of the screen, never much (they're shots, not explosions). */
export const nudge = (state: GameState, frames: number, mag: number) => shakeScreen(state, frames, Math.min(4, mag));

export const clearFlourish = () => { fxs = []; bolts.clear(); };

const tickFx = () => {
  if (!fxs.length) return;
  for (const f of fxs) {
    if (f.wait > 0) { f.wait--; continue; }
    f.t++;
    if (f.k === 'puff') {
      // (curling: a lazy sway that widens as it rises; slowing as it goes)
      f.x += f.vx + Math.sin(f.t * 0.16 + f.seed) * 0.35 * Math.min(1, f.t / 12);
      f.y += f.vy; f.vx *= 0.94; f.vy = f.vy * 0.96 - 0.012;
    } else if (f.k === 'word') { f.y -= f.t < 6 ? 1.2 : 0.25; }
    else { f.x += f.vx; f.y += f.vy; }
  }
  fxs = fxs.filter(f => f.t < f.life);
};

const octagon = (c: Ctx, x: number, y: number, r: number) => {
  c.beginPath();
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + Math.PI / 8; const px = Math.round(x + Math.cos(a) * r), py = Math.round(y + Math.sin(a) * r); if (i) c.lineTo(px, py); else c.moveTo(px, py); }
  c.closePath();
};

const drawFx = (c: Ctx) => {
  for (const f of fxs) {
    if (f.wait > 0) continue;
    const k = f.t / f.life;
    switch (f.k) {
      case 'star': { const R = Math.max(2, Math.round(f.size * (f.t < 2 ? 1 : 1 - (k - 0.3)))); put(c, starFlare(R, f.pal), f.x, f.y, R + 1, R + 1); break; }
      case 'cone': {
        // (big and white-hot the first frame, then the outer colours only, shrinking)
        const len = Math.max(4, Math.round(f.size * (f.t < 2 ? 1 : 0.7 - k * 0.3))), pal = f.t < 2 ? f.pal : f.pal.slice(0, Math.max(1, f.pal.length - 1 - Math.floor(k * 2)));
        const h = Math.max(2, Math.round(len * 0.32));
        put(c, coneFlare(len, h, pal), f.x, f.y, 1, h + 2, 1, f.rot ?? 0, f.dir);
        break;
      }
      case 'ring': {
        // (stepped out in whole pixels; thinner as it goes; the last of it every other frame)
        if (k > 0.7 && f.t & 1) break;
        const r = Math.round(2 + (f.size - 2) * Math.sqrt(k));
        c.lineWidth = 4 * (1 - k) + 1.5; c.strokeStyle = INK; octagon(c, f.x, f.y, r); c.stroke();
        c.lineWidth = 2 * (1 - k) + 1; c.strokeStyle = f.pal[0]; c.stroke();
        break;
      }
      case 'puff': {
        const tone = Number(f.pal[0]) as 0 | 1 | 2;
        const r = Math.max(2, Math.round(f.size * (0.7 + k * 0.6)));
        // (thinning: the last third, every other frame of it gone, then most of them)
        if (k > 0.66 && (f.t + Math.floor(f.seed)) % (k > 0.85 ? 3 : 2)) break;
        put(c, puffSprite(r, k < 0.35 ? (tone === 2 ? 2 : 0) : tone), f.x, f.y, r + 1, r + 1);
        break;
      }
      case 'word': {
        if (k > 0.75 && f.t & 2) break;
        const s = f.t < 3 ? 0.6 + f.t * 0.3 : f.t < 6 ? 1.5 - (f.t - 3) * 0.15 : 1;
        const cv = wordSprite(f.word!, f.pal as [string, string]);
        if (cv) put(c, cv, Math.round(f.x), Math.round(f.y), cv.width / HI / 2, cv.height / HI / 2, s, Math.sin(f.seed) * 0.12);
        break;
      }
      case 'sparkle': {
        const big = f.t < f.life * 0.4;
        c.fillStyle = f.pal[0];
        const x = Math.round(f.x), y = Math.round(f.y);
        if (big) { c.fillRect(x - 2, y, 5, 1); c.fillRect(x, y - 2, 1, 5); c.fillStyle = '#FFFFFF'; c.fillRect(x, y, 1, 1); }
        else if (f.t & 1) c.fillRect(x, y, 1, 1);
        break;
      }
      case 'spokes': {
        const r0 = 3 + f.size * k, r1 = r0 + f.size * 0.6 * (1 - k);
        c.strokeStyle = f.pal[0]; c.lineWidth = 2 - k;
        c.beginPath();
        for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + f.seed; c.moveTo(f.x + Math.cos(a) * r0, f.y + Math.sin(a) * r0); c.lineTo(f.x + Math.cos(a) * r1, f.y + Math.sin(a) * r1); }
        c.stroke();
        break;
      }
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The ray gun: its bolts watched coming and going (the engine fires them and resolves them; this only dresses them)

const RAY_PAL = ['#DB2777', '#F472B6', '#FBCFE8', '#FFFFFF'] as const;
const RAY_WORDS = ['ZAP!', 'ZORCH!', 'FZZT!', 'POOF!'];
const RAY_WORD_PAL = ['#FBCFE8', '#EC4899'] as const;
/** Each bolt in the air: where it was last frame, how it was going, how old. */
const bolts = new Map<Projectile, { x: number; y: number; vx: number; vy: number; age: number }>();
/** The ray gun's last shot (a flare at its muzzle a few frames, kept on it as he moves). */
let rayShotAt = -100;
/** The vaporizings already seen (a word off some of them). */
const seenDeaths = new WeakSet<object>();
const isBolt = (p: Projectile) => p.isRay && p.owner === 'player' && !p.custom && p.width === 16 && p.height === 6;

/** The pink ghost a bolt leaves behind it, dithered (two of them, the older thinner). */
const boltGhost = (phase: 0 | 1) => sprite(`rayghost:${phase}`, 22, 8, 11, 4, g => {
  g.fillStyle = '#DB2777'; g.fillRect(-10, -2, 20, 4); g.fillRect(-8, -3, 16, 6);
  g.fillStyle = '#F9A8D4'; g.fillRect(-8, -1, 16, 2);
  dither(g, 22, 8, 11, 4, phase);
  if (phase) dither(g, 22, 8, 11, 4, 0);
});

const tickRay = (state: GameState) => {
  const pl = state.player;
  const live = new Set<Projectile>();
  for (const p of state.projectiles) {
    if (!isBolt(p)) continue;
    live.add(p);
    const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
    const b = bolts.get(p);
    if (!b) {
      // A new one: out of his muzzle (if it's near it: a bolt from somewhere else, the orbit's, has no flare here)
      const m = muzzlePoint(pl, 'GUN');
      if (Math.hypot(cx - m.x, cy - m.y) < 64) {
        rayShotAt = state.frame;
        impactRing(m.x + pl.facing * 3, m.y, 9, '#F472B6', 7);
        // (a fleck or two of the alien's pink spat back out of the coils)
        for (let i = 0; i < 2; i++) debris(state, { pos: { x: m.x - pl.facing * 8, y: m.y - 1 }, vel: { x: -pl.facing * (0.4 + Math.random()), y: -1 - Math.random() * 1.2 }, life: 14, color: i ? '#FFFFFF' : '#F472B6', size: 1.5, grav: 0.12, chunk: true });
      }
      bolts.set(p, { x: cx, y: cy, vx: p.vel.x, vy: p.vel.y, age: 0 });
      continue;
    }
    b.x = cx; b.y = cy; b.vx = p.vel.x; b.vy = p.vel.y; b.age++;
    // (sparkle hanging in the air behind it)
    if (b.age % 3 === 0) sparkle(cx - Math.sign(p.vel.x || 1) * (10 + Math.random() * 8), cy + (Math.random() - 0.5) * 6, b.age % 6 ? '#F9A8D4' : '#FFFFFF', 10 + Math.floor(Math.random() * 6));
  }
  // Gone: where it went, on the screen, it hit something (a wall, somebody): a ring and a burst off it
  for (const [p, b] of bolts) {
    if (live.has(p)) continue;
    bolts.delete(p);
    const x = b.x + Math.sign(b.vx || 1) * 8, y = b.y;
    if (x < state.camera.x - 10 || x > state.camera.x + CANVAS_WIDTH + 10 || y < state.camera.y - 10 || y > state.camera.y + CANVAS_HEIGHT + 10) continue;
    impactRing(x, y, 12, '#F472B6', 9);
    flareStar(x, y, 7, RAY_PAL, 3);
    spokes(x, y, 6, '#FBCFE8', 5);
  }
  // Somebody vaporized (the ray gun's own death): now and then a word off it, and the screen ticks
  for (const d of state.enemyDeaths) {
    if (seenDeaths.has(d)) continue;
    seenDeaths.add(d);
    if (d.kind !== 'vaporized' || d.t > 2) continue;
    nudge(state, 2, 1.5);
    if (Math.random() < 0.55) wordPopLimited(state, d.x + d.w / 2, d.y - 6, RAY_WORDS[Math.floor(Math.random() * RAY_WORDS.length)], RAY_WORD_PAL, 30);
  }
};

/** The bolts' dithered ghosts, behind them. */
const drawRayUnder = (c: Ctx) => {
  for (const [p, b] of bolts) {
    if (b.age < 1) continue;
    const a = Math.atan2(p.vel.y, p.vel.x), sp = Math.hypot(p.vel.x, p.vel.y), ux = p.vel.x / (sp || 1), uy = p.vel.y / (sp || 1);
    const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
    for (const [d, ph] of [[sp * 1.6 + 10, 0], [sp * 3.2 + 18, 1]] as const) {
      if (b.age < (ph ? 3 : 1)) continue;
      put(c, boltGhost(ph), cx - ux * d, cy - uy * d, 11, 4, 1, a);
    }
  }
};

/** The flare on his ray gun's muzzle, the frames after a shot (kept on it: he's moving). */
const drawRayMuzzle = (c: Ctx, state: GameState) => {
  const age = state.frame - rayShotAt;
  if (age < 0 || age > 3 || state.player.currentWeapon !== 'GUN' || state.player.catForm) return;
  const m = muzzlePoint(state.player, 'GUN');
  const R = age < 1 ? 9 : age < 2 ? 7 : 4;
  put(c, starFlare(R, age < 2 ? RAY_PAL : RAY_PAL.slice(0, 2)), m.x + state.player.facing * 3, m.y, R + 1, R + 1);
};

// ---------------------------------------------------------------------------------------------------------------
// Hooked in (by the souvenir launcher's own tick, under and overlay: weapons/souvenir.ts)

/** Each frame of the world's moved on once (from the tick; or from the draw, where the tick's not being run: a scene
 *  playing with the player's update off, the smoke still drifts and goes, not hanging frozen over it). */
let fxFrame = -1;
const stepFx = (state: GameState) => { if (state.frame === fxFrame) return; fxFrame = state.frame; tickFx(); };
export const tickFlourish = (state: GameState) => { tickRay(state); stepFx(state); };
export const drawFlourishUnder = (c: Ctx) => { drawRayUnder(c); };
export const drawFlourish = (c: Ctx, state: GameState) => { stepFx(state); drawFx(c); drawRayMuzzle(c, state); };

// ---------------------------------------------------------------------------------------------------------------
// Painted straight into a weapon's own drawing (in his fist, its local frame: they kick and turn with it)

/** A cone flare, out along +x from (x, y). */
export const coneAt = (c: Ctx, x: number, y: number, len: number, pal: readonly string[]) => { const h = Math.max(2, Math.round(len * 0.32)); put(c, coneFlare(len, h, pal), x, y, 1, h + 2); };
/** A star flare round (x, y). */
export const starAt = (c: Ctx, x: number, y: number, R: number, pal: readonly string[]) => put(c, starFlare(R, pal), x, y, R + 1, R + 1);
/** A puff round (x, y). */
export const puffAt = (c: Ctx, x: number, y: number, r: number, tone: 0 | 1 | 2) => put(c, puffSprite(r, tone), x, y, r + 1, r + 1);

// ---------------------------------------------------------------------------------------------------------------
// Ghosts of a tumbling thing: whatever it is, painted the once flat in one colour and dithered (the souvenirs')

const ghosts = new Map<string, HTMLCanvasElement | null>();
/** `paint` draws it round its middle, `w` x `h` across at most; its ghost: that shape filled `tint`, every other pixel. */
export const ghostOf = (key: string, w: number, h: number, tint: string, paint: (g: Ctx) => void) => {
  let cv = ghosts.get(key);
  if (cv !== undefined) return cv;
  const W = Math.ceil((w + 6) / 2) * 2, H = Math.ceil((h + 6) / 2) * 2;
  cv = sprite(`ghost:${key}`, W, H, W / 2, H / 2, g => {
    paint(g);
    g.save(); g.globalCompositeOperation = 'source-atop'; g.fillStyle = tint; g.fillRect(-W, -H, W * 2, H * 2); g.restore();
    dither(g, W, H, W / 2, H / 2);
  });
  ghosts.set(key, cv);
  return cv;
};
export const putGhost = (c: Ctx, cv: HTMLCanvasElement | null, x: number, y: number, w: number, h: number, rot: number) => {
  const W = Math.ceil((w + 6) / 2) * 2, H = Math.ceil((h + 6) / 2) * 2;
  put(c, cv, x, y, W / 2, H / 2, 1, rot);
};
