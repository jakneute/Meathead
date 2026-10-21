// THE SOFT-PLAY PITS' BOUNCE (the user's: "falling in the ball pits in cartoon land (or similar hazards there) won't
// teleport you but bounce you out of the pit with a dirty needle briefly sticking in you"). Shared by every soft pit in
// the land: the square's ball pits, the studio's reject pile and paint vat, the big kids' glop pits. (Not the itchy
// canyon: that's a real drop.)
//
// In he goes: he sinks in to the shoulders (the stuff closing over him), a beat, then the pit spits him up in a big arc
// to solid ground: the bank on the side he came from (where he last stood safe). A dirty needle's stuck in his ass for the ride, wobbling, and falls out after a couple of seconds. Hurt
// (NEEDLE_DMG, × M2's 0.65 taken: about 6.5), a yelp, a needle callout (clean / shat / naked: their own sources, so the
// engine's hurt picker (fresh lines only) and the death screen both fit the state of him).
//
// No softlock: he's steered (no input) all the way to the landing; if something knocks him back in anyway, he's bounced
// again for free, and a third time in a row he's simply put down where he last stood safe. The cast knocked in get the
// same bounce (hurt; the little ones die), to the nearer bank. Nothing here outlives a death (keyed on state.stage,
// which is rebuilt every time): checkpoints and the world are untouched.

import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import type { Enemy } from '../../m1/types';
import { hurtPlayer } from '../../m1/game/bosses/shared';
import { playSound } from '../../m1/game/platform/audio';
import { floorTopAt } from '../../m1/game/core/terrain';
import { PLAYER_GRAVITY, PLAYER_TERMINAL_VELOCITY } from '../../m1/constants';
import { hazardHit } from '../hazardHit';
import { registerHurtLines } from '../kinds';
import { NEEDLE } from './lines';
import { envSound } from '../bossQuiet';
import { teleport, pantsOf } from './section';
import { ballR, ramp6, hour, box, INK, type Ctx } from './kit';
import { GY } from './geometry';

/** The bounce's hurt (before M2's ×0.65: 6.5 off him). */
export const NEEDLE_DMG = 10;
/** His hurt source by the state of him (lines: cartoon/lines.ts NEEDLE). */
export const needleSource = (state: GameState) => {
  const p = pantsOf(state);
  return p === 'nude' ? 'm2:ct_needle_nude' : p === 'shitty' ? 'm2:ct_needle_shat' : 'm2:ct_needle';
};

for (const [source, l] of Object.entries(NEEDLE)) registerHurtLines(source, l.hurt, l.death);

/** What the pit's full of (for the stuff closing over him as he sinks). */
export type Stuff = { kind: 'balls'; colors: string[] } | { kind: 'goo'; color: string } | { kind: 'paper' } | { kind: 'paint'; colorAt: (x: number) => string };
export interface PitSpec {
  /** The pits, world x: [from, to]. */
  pits: [number, number][];
  /** Where he last stood safe (feet). */
  safe: { x: number; y: number };
  stuff: (pit: [number, number]) => Stuff;
  /** The splash of the stuff (in, and out). */
  splash: (x: number, y: number, pit: [number, number]) => void;
  /** The sound of going in. */
  plunge: (x: number, pit: [number, number]) => void;
  /** The callout over the cast it bounces. */
  call: (pit: [number, number]) => string;
}

type Phase = 'none' | 'sink' | 'fly';
interface Bounce {
  phase: Phase; t: number; T: number;
  pit: [number, number] | null;
  x0: number; tx: number; ty: number;
  sinkY: number; tries: number;
  needle: number; needleFace: number;
}
interface Loose { x: number; y: number; vx: number; vy: number; a: number; va: number; t: number; down: boolean }
interface Fly { x0: number; y0: number; tx: number; ty: number; t: number; T: number }
interface Store { b: Bounce; loose: Loose[]; flying: WeakMap<Enemy, Fly>; stuff: Stuff | null }
const stores = new WeakMap<object, Store>();
const storeOf = (state: GameState): Store => {
  const key = (state.stage ?? state) as object;
  let s = stores.get(key);
  if (!s) stores.set(key, s = { b: { phase: 'none', t: 0, T: 0, pit: null, x0: 0, tx: 0, ty: 0, sinkY: 0, tries: 0, needle: 0, needleFace: 1 }, loose: [], flying: new WeakMap(), stuff: null });
  return s;
};

const SINK = 22;
const NEEDLE_FRAMES = 150;
const APEX = 230;
const MARGIN = 70;

/** Frames from feet at y0 going up at vy0 to coming down through ty (his own gravity and terminal speed). */
const flightTime = (y0: number, vy0: number, ty: number) => {
  let y = y0, vy = vy0, t = 0;
  while (t < 400) { vy = Math.min(PLAYER_TERMINAL_VELOCITY, vy + PLAYER_GRAVITY); y += vy; t++; if (vy > 0 && y >= ty) break; }
  return t;
};
const groundAt = (state: GameState, x: number, near: number) => {
  const top = floorTopAt(state.blocks, x, near - 60, 0);
  return top !== null && Math.abs(top - near) < 70 ? top : null;
};
/** Where he lands: the bank on the side he came from (the side he last stood safe on), on the ground there; if
 *  there's no ground there, the other bank; failing both, the safe spot itself. Always a bank, never the safe spot
 *  when there's a bank: that might have been a mover's cel or a tub's rim, gone or too narrow to land on blind. */
const landingFor = (state: GameState, spec: PitSpec, pit: [number, number]) => {
  const mid = (pit[0] + pit[1]) / 2;
  const side = spec.safe.x < pit[0] ? -1 : spec.safe.x > pit[1] ? 1 : spec.safe.x < mid ? -1 : 1;
  for (const s of [side, -side]) {
    const x = s < 0 ? pit[0] - MARGIN : pit[1] + MARGIN, y = groundAt(state, x, GY);
    if (y !== null) return { x, y };
  }
  return { x: spec.safe.x, y: spec.safe.y };
};

const inPit = (spec: PitSpec, x: number) => spec.pits.find(([a, b]) => x > a && x < b) ?? null;

const launch = (ctx: FrameContext, spec: PitSpec, s: Store, hurt: boolean) => {
  const { state } = ctx, p = state.player, b = s.b, pit = b.pit!;
  const cx = p.pos.x + p.width / 2;
  spec.splash(cx, GY, pit);
  playSound('boing', 0.8, -10); envSound(state, cx, 'whoosh', 0.5, -6);
  if (hurt) {
    playSound('dart', 0.7, 6);
    hurtPlayer(ctx, NEEDLE_DMG, needleSource(state));
    if (p.health <= 0) { b.phase = 'none'; return; }
    b.needle = NEEDLE_FRAMES; b.needleFace = p.facing || 1;
  }
  const land = landingFor(state, spec, pit);
  const feet = p.pos.y + p.height;
  // (higher for a longer way across, so he's never flung flat out)
  const apex = Math.max(APEX, Math.min(480, APEX + (Math.abs(land.x - cx) - 300) * 0.25));
  const vy0 = -Math.sqrt(2 * PLAYER_GRAVITY * (feet - (Math.min(GY, land.y) - apex)));
  b.phase = 'fly'; b.t = 0; b.x0 = cx; b.tx = land.x; b.ty = land.y;
  b.T = flightTime(feet, vy0, land.y);
  p.vel.y = vy0; p.vel.x = 0; p.isGrounded = false;
};

/** Every frame (in the section's update, before he moves): him and the cast in the pits. */
export const updatePitBounce = (ctx: FrameContext, spec: PitSpec) => {
  const { state } = ctx, p = state.player, s = storeOf(state), b = s.b;
  // (dev: the harness reads it)
  if (import.meta.env?.DEV && typeof window !== 'undefined') (window as unknown as { __pitBounce?: Store }).__pitBounce = s;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  if (b.needle > 0 && --b.needle === 0) {
    // (out it falls)
    const f = b.needleFace;
    s.loose.push({ x: cx - f * 10, y: p.pos.y + p.height * 0.55, vx: -f * 1.6, vy: -3, a: f > 0 ? Math.PI - 0.5 : 0.5, va: -f * 0.3, t: 0, down: false });
    playSound('clink', 0.35, 10);
  }
  if (p.health <= 0 || p.inCutscene) { if (b.phase !== 'none' && p.health <= 0) b.phase = 'none'; }
  else if (b.phase === 'none') {
    const pit = inPit(spec, cx);
    if (pit && feet > GY + 30) {
      b.phase = 'sink'; b.t = 0; b.pit = pit; b.sinkY = feet; b.tries = 0;
      s.stuff = spec.stuff(pit);
      spec.splash(cx, GY, pit); spec.plunge(cx, pit);
    } else if (p.isGrounded) b.tries = 0;
  } else if (b.phase === 'sink') {
    // (down to his shoulders, held there: nobody steers)
    b.t++;
    state.playerStunTimer = Math.max(state.playerStunTimer, 2);
    const to = GY + p.height * 0.72;
    b.sinkY += (to - b.sinkY) * 0.2;
    p.pos.y = b.sinkY - p.height; p.vel.x = 0; p.vel.y = -PLAYER_GRAVITY;
    if (b.t >= SINK) launch(ctx, spec, s, b.tries === 0);
  } else if (b.phase === 'fly') {
    b.t++;
    state.playerStunTimer = Math.max(state.playerStunTimer, 2);
    // (steered along the arc to the landing: walls still stop him)
    const u = Math.min(1, (b.t + 1) / b.T), want = b.x0 + (b.tx - b.x0) * u;
    p.vel.x = Math.max(-24, Math.min(24, want - cx));
    if (Math.abs(want - cx) > 0.5) p.facing = want > cx ? 1 : -1;
    if (p.isGrounded && p.vel.y >= 0 && b.t > 4) { b.phase = 'none'; p.vel.x = 0; spec.splash(cx, feet, b.pit!); }
    else if (b.t > b.T + 120) b.phase = 'none';
    else if (p.vel.y > 0 && feet > GY + 30 && inPit(spec, cx)) {
      // (knocked back in, or short of it: again for free; a third time, just put him down safe)
      b.tries++; b.pit = inPit(spec, cx);
      if (b.tries >= 3) { b.phase = 'none'; teleport(state, spec.safe.x, spec.safe.y); spec.splash(spec.safe.x, spec.safe.y, b.pit!); }
      else { b.phase = 'sink'; b.t = 0; b.sinkY = feet; spec.splash(cx, GY, b.pit!); spec.plunge(cx, b.pit!); }
    }
  }
  // The cast in the pits: the same bounce, to the nearer bank (hurt; the little ones die of it)
  for (const e of state.enemies) {
    if (e.health <= 0 || e.type === 'boss' || e.enemyType === 'flyer' || e.isBlownAway) continue;
    const fly = s.flying.get(e);
    if (fly) {
      fly.t++;
      const u = Math.min(1, fly.t / fly.T);
      e.pos.x = fly.x0 + (fly.tx - fly.x0) * u - e.width / 2;
      e.pos.y = fly.y0 + (fly.ty - fly.y0) * u - 4 * (APEX - 30) * u * (1 - u) - e.height;
      e.vel.x = 0; e.vel.y = 0; e.pauseTimer = Math.max(e.pauseTimer ?? 0, 3);
      if (u >= 1) { s.flying.delete(e); e.pos.y = fly.ty - e.height; }
      continue;
    }
    const ex = e.pos.x + e.width / 2;
    const pit = inPit(spec, ex);
    if (!pit || e.pos.y + e.height < GY + 30) continue;
    spec.splash(ex, GY, pit);
    // (never seen: spared, back where it was put)
    if (!e.seen) { e.pos.x = e.homeX ?? e.pos.x; e.pos.y = e.homeY ?? GY - e.height; e.vel.x = 0; e.vel.y = 0; continue; }
    if (hazardHit(ctx, e, 30, ex, spec.call(pit), { knock: 0 })) continue;
    playSound('boing', 0.6, -6);
    const left = pit[0] - MARGIN + 20, right = pit[1] + MARGIN - 20;
    const tx = Math.abs(ex - left) < Math.abs(ex - right) ? left : right;
    s.flying.set(e, { x0: ex, y0: e.pos.y + e.height, tx, ty: groundAt(state, tx, GY) ?? GY, t: 0, T: Math.round(40 + Math.min(40, Math.abs(tx - ex) / 14)) });
  }
  // (the needles that fell out: down, a bounce, lie there a moment)
  for (const n of s.loose) {
    n.t++;
    if (n.down) continue;
    n.vy += 0.4; n.x += n.vx; n.y += n.vy; n.a += n.va;
    const top = floorTopAt(state.blocks, n.x, n.y - 12, 0);
    if (top !== null && n.y >= top) { n.y = top - 1; if (Math.abs(n.vy) > 2.5) { n.vy = -n.vy * 0.35; n.vx *= 0.5; } else { n.down = true; n.a = Math.round(n.a / Math.PI) * Math.PI; } }
    if (n.y > GY + 300) n.t = 9999;
  }
  s.loose = s.loose.filter(n => n.t < 200);
};

/** Is he in a pit's bounce right now (sinking, or on the way out)? */
export const bouncing = (state: GameState) => storeOf(state).b.phase !== 'none';

// ---------------------------------------------------------------------------------------------------------------
// Drawing (world space, in front of him: the section's drawFront)

/** A dirty syringe along +x, its tip at 0 (in him), the plunger out at ~27. */
const syringe = (c: Ctx) => {
  const S = ['#4B5563', '#9CA3AF', '#E5E7EB'];
  box(c, 0, -0.5, 9, 1, S[1]); box(c, 2, -0.5, 7, 0.5, S[2]);
  box(c, 8, -2, 3, 4, INK); box(c, 8.5, -1.5, 2, 3, '#EA580C');
  box(c, 10, -3.5, 13, 7, INK);
  box(c, 11, -2.5, 11, 5, 'rgba(226,232,240,0.85)');
  box(c, 11, -0.5, 6, 3, '#9A7B2F'); box(c, 11, 1.5, 6, 1, '#6B4F1D'); box(c, 13, -0.5, 1, 1, '#7F1D1D');
  box(c, 11, -2.5, 11, 1, 'rgba(255,255,255,0.9)');
  for (let i = 0; i < 3; i++) box(c, 14 + i * 3, -3.5, 1, 2, INK);
  box(c, 22, -5, 2, 10, INK); box(c, 22.5, -4.5, 1, 9, S[1]);
  box(c, 24, -1, 4, 2, INK); box(c, 24, -0.5, 4, 1, S[2]);
  box(c, 27, -3.5, 2, 7, INK); box(c, 27.5, -3, 1, 6, S[1]);
};

/** The stuff closing over him as he sinks (only what's above his feet in the pit, below the lip). */
const drawCover = (c: Ctx, state: GameState, stuff: Stuff, cx: number, feet: number, pit: [number, number]) => {
  const l = Math.max(pit[0] + 2, cx - 34), r = Math.min(pit[1] - 2, cx + 34), top = GY + 8;
  if (r <= l || feet <= top) return;
  c.save(); c.beginPath(); c.rect(l, top - 8, r - l, feet - top + 20); c.clip();
  const f = state.frame;
  if (stuff.kind === 'balls') {
    box(c, l, top, r - l, feet - top + 12, hour('#2A1E4A'));
    for (let row = 0, y = top; y < feet + 12; y += 11, row++) for (let x = l - (row % 2) * 6; x < r + 8; x += 13) {
      const col = stuff.colors[Math.abs(Math.floor(x / 13) + row * 3) % stuff.colors.length];
      ballR(c, x + 6, y + 3, 6.5, ramp6(hour(col)));
    }
  } else if (stuff.kind === 'goo') {
    const R = ramp6(hour(stuff.color));
    box(c, l, top, r - l, feet - top + 12, R[2]);
    for (let y = top; y < feet + 12; y += 8) box(c, l, y + Math.sin(f * 0.1 + y) * 1.5, r - l, 3, R[3]);
    box(c, l, top - 2, r - l, 4, R[4]);
    for (let i = 0; i < 3; i++) { const bx = l + ((f * 0.7 + i * 23) % (r - l)), by = top + 6 + ((i * 17) % Math.max(1, feet - top)); ballR(c, bx, by, 2.5, R, false); }
  } else if (stuff.kind === 'paper') {
    box(c, l, top, r - l, feet - top + 12, hour('#CFC8B6'));
    for (let row = 0, y = top - 4; y < feet + 12; y += 7, row++) for (let x = l - 10 + (row % 3) * 5; x < r + 10; x += 17) {
      c.save(); c.translate(x, y); c.rotate(((row * 7 + Math.floor(x)) % 5 - 2) * 0.18);
      box(c, -9, -5, 18, 10, INK); box(c, -8, -4, 16, 8, hour(['#FFFFFF', '#F5F0E1', '#FDF6E3'][row % 3])); box(c, -6, -1, 9, 1, hour('#94A3B8'));
      c.restore();
    }
  } else {
    const col = stuff.colorAt(cx), R = ramp6(hour(col));
    box(c, l, top, r - l, feet - top + 12, R[3]);
    for (let y = top + 4; y < feet + 12; y += 10) box(c, l, y, r - l, 2, R[2]);
    box(c, l, top - 2, r - l, 4, R[4]); box(c, l + 6, top - 1, 10, 1, R[5]);
  }
  c.restore();
};

export const drawPitBounce = (c: Ctx, state: GameState) => {
  const s = storeOf(state), b = s.b, p = state.player;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  if (b.phase === 'sink' && s.stuff && b.pit) drawCover(c, state, s.stuff, cx, feet, b.pit);
  if (b.needle > 0 && p.health > 0) {
    // (stuck in his ass, out behind him, wobbling: harder at first)
    const f = p.facing || 1, age = NEEDLE_FRAMES - b.needle;
    const wob = Math.sin(age * 0.7) * 0.35 * Math.max(0.25, 1 - age / 60);
    c.save();
    c.translate(cx - f * 9, p.pos.y + p.height * 0.56);
    c.scale(-f, 1); c.rotate(-0.45 + wob);
    syringe(c);
    c.restore();
  }
  for (const n of s.loose) {
    c.save(); c.globalAlpha = Math.max(0, Math.min(1, (200 - n.t) / 30));
    c.translate(n.x, n.y); c.rotate(n.a); c.translate(-14, 0); syringe(c);
    c.restore();
  }
};
