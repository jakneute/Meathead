// PUNCHY & KICKY's two falls, his own deaths (kill cams: screen space, over everything; drawn by the section's drawHud):
//
//   mesa       into the painted canyon (the user's: "falling down the mesa lands will kill you ... not teleport you"):
//              the coyote's fall. Looking straight down the gorge: he hangs there a beat, looks at us, and drops,
//              tumbling, smaller and smaller, the whistle going down with him, till he's a speck; then, a long way
//              down, a tiny puff of dust. A thud you can barely hear.
//   blackhole  the floor of portable holes on the set past it (the user's: "a special kill animation of you
//              perpetually falling through black holes, forever"): falling with him, a painted black hole coming up
//              under him, growing, swallowing him; out of another one over a different painted backdrop, and the next
//              one's coming up under him already. Round and round, the death screen going up over it, and on.

import type { GameState } from '../../../m1/game/core/state';
import type { MeatheadDeath } from '../../../m1/game/player/deathAnim';
import type { DeathFace } from '../../../m1/game/render/player/deathFace';
import { registerDeathAnim, registerDeathKind } from '../../../m1/game/player/deathAnim';
import { registerDeathDraw, body } from '../../../m1/game/render/player/deathAnim';
import { bandedGradient, checker, hazeBands } from '../../../m1/game/render/pixelArt';
import { playSound } from '../../../m1/game/platform/audio';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../../../m1/constants';
import { pantsSources } from '../../hurtGags';

type Ctx = CanvasRenderingContext2D;
export const MESA = 'own:ct_mesa' as const, BLACKHOLE = 'own:ct_blackhole' as const;
export const CANYON_SRC = 'm2:ct_canyon', BLACKHOLE_SRC = 'm2:ct_blackhole';
const MESA_FRAMES = 160, HANG = 26, HIT = 104;
const BH_FRAMES = 240, CYCLE = 64;
const INK = '#1A1028';
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

for (const s of pantsSources(CANYON_SRC)) registerDeathKind(s, MESA);
for (const s of pantsSources(BLACKHOLE_SRC)) registerDeathKind(s, BLACKHOLE);

/** Him in the kill cam: his middle at (x, y), turned rot, s times life size, the face given. */
const him = (c: Ctx, state: GameState, d: MeatheadDeath, x: number, y: number, rot: number, s: number, face: DeathFace, extra: Record<string, unknown> = {}) => {
  c.save();
  c.translate(x, y); c.scale(s, s); c.rotate(rot);
  body(c, { ...state, blocks: [], camera: { x: 0, y: 0 } } as GameState, { ...d, x: 0, y: 32 }, state.player.currentWeapon, { deathFace: face, isGrounded: false, vel: { x: 0, y: 4 }, ...extra });
  c.restore();
};
/** The still parts, painted the once. */
const stills = new Map<string, HTMLCanvasElement>();
const still = (c: Ctx, key: string, paint: (g: Ctx) => void) => {
  if (typeof document === 'undefined') { paint(c); return; }
  let s = stills.get(key);
  if (!s) { s = document.createElement('canvas'); s.width = W; s.height = H; const g = s.getContext('2d')!; g.imageSmoothingEnabled = false; paint(g); stills.set(key, s); }
  c.drawImage(s, 0, 0);
};
/** Dims at the end, for the message. */
const dimOut = (c: Ctx, t: number, len: number) => { const out = clamp01((t - (len - 20)) / 20); if (out > 0) hazeBands(c, 0, 0, W, H, '#000000', out * 0.45, out * 0.65, 4); };

// ---------------------------------------------------------------------------------------------------------------
// The mesa: straight down the gorge

registerDeathAnim(MESA, {
  frames: MESA_FRAMES, airOk: true, cam: true,
  tick: (_ctx, _d, t) => {
    if (t === 8) playSound('click', 0.4, 10);
    // (the whistle, falling away)
    if (t >= HANG && t < HIT - 10 && (t - HANG) % 9 === 0) playSound('whoosh', 0.55 - (t - HANG) / 200, 6 - (t - HANG) / 5);
    if (t === HIT) { playSound('thud', 0.25, -16); playSound('poof', 0.15, -10); }
  },
});
registerDeathDraw(MESA, () => { /* drawn in screen space: drawItchyDeathCam */ });

/** The gorge from above: the walls in rings of strata closing in to the floor, sunlit far down at the bottom. */
const gorge = (g: Ctx) => {
  const cx = W / 2, cy = H / 2 + 10;
  const STRATA = ['#7A2A10', '#9A3A16', '#B84E1E', '#D0682C', '#A2401A', '#C25A26', '#E07E3A', '#8E3414'];
  // (ring by ring, the edge ragged, each a step darker toward the floor, the seams dithered)
  const N = 22;
  const ring = (i: number, dy: number) => {
    const k = i / N, rx = (W * 0.62) * (1 - k) ** 1.6 + 26, ry = (H * 0.68) * (1 - k) ** 1.6 + 18;
    g.beginPath();
    for (let a = 0; a < 48; a++) {
      const an = (a / 48) * Math.PI * 2, rough = 1 + (hash(i * 31 + a) - 0.5) * 0.09;
      g.lineTo(Math.round((cx + Math.cos(an) * rx * rough) / 2) * 2, Math.round((cy + dy + Math.sin(an) * ry * rough) / 2) * 2);
    }
    g.closePath();
  };
  for (let i = 0; i < N; i++) {
    const k = i / N, shade = Math.min(0.62, k * 0.75), col = STRATA[i % STRATA.length];
    // (each ledge: its sunlit top showing as a lighter band along the far (upper) side, then the rock face in its
    // stratum's color, a step darker toward the floor)
    g.fillStyle = mixHex(col, '#FFD8A0', 0.3 - shade * 0.35); ring(i, -4 + k * 2); g.fill();
    g.fillStyle = mixHex(col, '#1A0A10', shade); ring(i, 0); g.fill();
  }
  // (the floor, far down: sunlit sand, a dry wash across it, a cactus or two, a dot of a boulder)
  g.fillStyle = '#E8C48A'; g.beginPath(); g.ellipse(cx, cy, 24, 16, 0, 0, Math.PI * 2); g.fill();
  checker(g, cx - 22, cy + 4, 44, 8, '#C89A60', 0, 2);
  g.fillStyle = '#F8E0B0'; g.fillRect(cx - 14, cy - 8, 12, 2);
  g.fillStyle = '#4A7A2A'; g.fillRect(cx + 9, cy - 4, 2, 5); g.fillRect(cx - 12, cy + 2, 2, 4);
  // (the rim at the edges of the screen: the painted plywood edge of the set's mesa, its sky beyond)
  g.fillStyle = INK; g.fillRect(0, 0, W, 6); g.fillRect(0, H - 6, W, 6); g.fillRect(0, 0, 6, H); g.fillRect(W - 6, 0, 6, H);
};
const mixHex = (a: string, b: string, k: number) => {
  const p = (s: string) => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16));
  const A = p(a), B = p(b), m = A.map((v, i) => Math.round(v + (B[i] - v) * clamp01(k)));
  return `#${m.map(v => v.toString(16).padStart(2, '0')).join('')}`;
};

const drawMesa = (c: Ctx, state: GameState, d: MeatheadDeath, t: number) => {
  still(c, 'mesa-gorge', gorge);
  const cx = W / 2, cy = H / 2 + 10;
  if (t < HIT) {
    // (hanging there a beat in the air over it, looking at us; then gone, tumbling, smaller and smaller)
    const u = clamp01((t - HANG) / (HIT - HANG)), s = 2.4 * (1 - u) ** 2.2 + 0.04;
    const x = cx + (1 - u) * 40 * Math.sin(t * 0.05) + (1 - u) * 30, y = cy - (1 - u) * 60;
    const rot = t < HANG ? Math.sin(t * 0.3) * 0.04 : (t - HANG) * 0.22;
    const face: DeathFace = t < HANG ? 'shock' : 'scream';
    him(c, state, d, x, y, rot, s, face);
    // (the gulp: a sweat drop off him while he hangs there)
    if (t > 10 && t < HANG) { c.fillStyle = INK; c.beginPath(); c.arc(x + 34, y - 70 + (t - 10) * 1.5, 4, 0, Math.PI * 2); c.fill(); c.fillStyle = '#7DD3FC'; c.beginPath(); c.arc(x + 34, y - 70 + (t - 10) * 1.5, 3, 0, Math.PI * 2); c.fill(); }
  } else {
    // (a long way down: the tiny puff of dust, and it settling)
    const u = clamp01((t - HIT) / 30), r = 3 + u * 9, a = 1 - clamp01((t - HIT - 26) / 24);
    c.globalAlpha = a;
    for (let i = 0; i < 7; i++) {
      const an = (i / 7) * Math.PI * 2, px = cx + Math.cos(an) * r, py = cy + Math.sin(an) * r * 0.6 - u * 3;
      c.fillStyle = '#B48A5A'; c.beginPath(); c.arc(px, py + 1, 3 + u * 2, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#F4DCB0'; c.beginPath(); c.arc(px, py, 2.4 + u * 2, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
  }
  dimOut(c, t, MESA_FRAMES);
};

// ---------------------------------------------------------------------------------------------------------------
// The black hole: through one into the next, forever

registerDeathAnim(BLACKHOLE, {
  frames: BH_FRAMES, airOk: true, cam: true,
  tick: (_ctx, _d, t) => {
    const u = t % CYCLE;
    if (u === 1) { playSound('whoosh', 0.6, -8 - (Math.floor(t / CYCLE) % 3) * 2); playSound('poof', 0.25, -6); }
    if (u === 34) playSound('whoosh', 0.35, -14);
  },
});
registerDeathDraw(BLACKHOLE, () => { /* drawn in screen space: drawItchyDeathCam */ });

/** The painted backdrops it goes through, in turn: the set's sky cyc, MOUSE MESA's desert, the show's red curtain, a
 *  starry violet nowhere. */
const BACKS: { sky: string[]; streak: string; deco: (g: Ctx) => void }[] = [
  { sky: ['#4A8AD8', '#6AA6E6', '#8CC2F0', '#B4DAF6', '#DCEEFA'], streak: 'rgba(255,255,255,0.55)', deco: g => { for (let i = 0; i < 5; i++) { const x = hash(i) * W, y = hash(i + 9) * H; g.fillStyle = '#FFFFFF'; g.fillRect(x, y, 60, 14); g.fillRect(x + 12, y - 8, 34, 10); g.fillStyle = '#DCE8F4'; g.fillRect(x, y + 10, 60, 4); } } },
  { sky: ['#C2410C', '#DC6A1E', '#EE8A34', '#F8AE5A', '#FCD08A'], streak: 'rgba(255,240,200,0.5)', deco: g => { for (let i = 0; i < 4; i++) { const x = hash(i + 3) * W, y = 120 + hash(i + 5) * 380, w = 90 + hash(i) * 80; g.fillStyle = '#8A2A0C'; g.fillRect(x, y, w, 40); g.fillStyle = '#A8401A'; g.fillRect(x, y, w, 8); g.fillStyle = '#5A1A08'; g.fillRect(x, y + 32, w, 8); } } },
  { sky: ['#3A060C', '#5E0C14', '#7E141C', '#9E2028', '#B8343A'], streak: 'rgba(253,224,71,0.45)', deco: g => { for (let x = 0; x < W; x += 40) { g.fillStyle = '#4E0A10'; g.fillRect(x, 0, 12, H); g.fillStyle = '#C24048'; g.fillRect(x + 24, 0, 4, H); } } },
  { sky: ['#140A2A', '#22124A', '#341C66', '#4A2A86', '#6A40A8'], streak: 'rgba(200,180,255,0.5)', deco: g => { for (let i = 0; i < 70; i++) { g.fillStyle = i % 5 ? '#E9D5FF' : '#FFFFFF'; g.fillRect(Math.round(hash(i) * W / 2) * 2, Math.round(hash(i + 70) * H / 2) * 2, 2, 2); } } },
];
/** A painted portable hole: flat black, a hard purple-black rim, a glint of the painter's highlight along its back edge. */
const hole = (c: Ctx, x: number, y: number, w: number, h: number) => {
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, w / 2 + 3, h / 2 + 3, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#000000'; c.beginPath(); c.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#3A1E5A'; c.lineWidth = Math.max(2, w / 90); c.beginPath(); c.ellipse(x, y, w / 2 - 2, h / 2 - 2, 0, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = Math.max(1, w / 200); c.beginPath(); c.ellipse(x, y, w / 2 - 1, h / 2 - 1, 0, Math.PI * 1.25, Math.PI * 1.45); c.stroke();
};
/** When each one started (the loop goes on off the frame count, under the death screen too). */
const bhStart = new WeakMap<MeatheadDeath, number>();

const drawBlackHole = (c: Ctx, state: GameState, d: MeatheadDeath, t: number) => {
  if (!bhStart.has(d)) bhStart.set(d, state.frame - t);
  const tt = state.frame - bhStart.get(d)!, n = Math.floor(tt / CYCLE), u = (tt % CYCLE) / CYCLE;
  const B = BACKS[n % BACKS.length];
  still(c, `bh-back-${n % BACKS.length}`, g => { bandedGradient(g, 0, 0, W, H, B.sky, 12); B.deco(g); });
  // (the speed streaks rushing up past)
  c.fillStyle = B.streak;
  for (let i = 0; i < 14; i++) { const x = Math.round(hash(i + n * 17) * W / 2) * 2, len = 30 + hash(i * 3) * 60, y = H - ((tt * 14 + i * 97) % (H + 120)); c.fillRect(x, y, 2, len); }
  // (the hole he's just dropped out of, up over him, going away up)
  if (n > 0 || u > 0) { const k = clamp01(u * 1.6), w = 900 * (1 - k) + 160, y = -40 - k * 220 + (1 - k) * 60; if (k < 1) hole(c, W / 2, y, w, w * 0.3); }
  // (the next one, coming up under him, growing, and he goes in)
  const gk = u ** 3.2, hw = 110 + gk * 2300, hy = H + 30 - u * 250 - gk * 40;
  const mx = W / 2 + Math.sin(tt * 0.05) * 30, my = 250 + Math.sin(tt * 0.09) * 10;
  const face: DeathFace = (n % 2 === 0) !== (u < 0.5) ? 'scream' : 'shock';
  // (going in: what of him's past its middle line is down in it, gone)
  hole(c, W / 2, hy, hw, hw * 0.3);
  c.save(); c.beginPath(); c.rect(0, 0, W, Math.max(0, hy)); c.clip();
  him(c, state, d, mx, my, tt * 0.13, 1.7, face);
  c.restore();
  // (swallowed: a flash of the black, then the next)
  if (u > 0.96) { c.fillStyle = '#000000'; c.fillRect(0, 0, W, H); }
  dimOut(c, Math.min(t, BH_FRAMES), BH_FRAMES);
};

/** The section's drawHud: the kill cam, while one of these is what got him. True if it drew. */
export const drawItchyDeathCam = (c: Ctx, state: GameState): boolean => {
  const d = state.meatheadDeath;
  if (!d || state.deathTimer <= 0 || (d.kind !== MESA && d.kind !== BLACKHOLE)) return false;
  const len = state.deathScene?.len ?? (d.kind === MESA ? MESA_FRAMES : BH_FRAMES);
  const t = Math.min(state.deathScene?.t ?? len, len);
  c.save(); c.imageSmoothingEnabled = false;
  if (d.kind === MESA) drawMesa(c, state, d, t); else drawBlackHole(c, state, d, t);
  c.restore();
  return true;
};
