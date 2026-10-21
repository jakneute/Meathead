// Meathead 2: the hurts with an animation of their own (the user's: "make the rakes ... have a special 'hurt' animation if
// one hits you. same for bear traps"). While one plays he's hidden (player.hidden) and drawn here instead, in the pose
// it calls for, by the section that set it off (its update ticks it, its drawFront draws it):
//
//   rake  trod on the tines: the handle comes up WHACK into his face. Stiff as a board, he rocks back on his heels
//         and forward again like a plank; his face flat where it hit (the handle's print down it, red), a tooth or two
//         flying out, X-eyed, stars and the little birdies going round his head.
//   trap  a bear trap's got his ankle: the jaws clamped on his boot (the stake's chain pulled tight), and he's hopping
//         on the spot on it, howling, clutching at his knee: pain lines off the jaws, sweat flying.
//
// Their damage and holds are the hazards' own (itchy/hazards.ts, frontier/wilds/hazards.ts, frontier/woods/hazards.ts);
// this is only how it looks.

import type { GameState } from '../m1/game/core/state';
import type { MeatheadDeath } from '../m1/game/player/deathAnim';
import type { DeathFace } from '../m1/game/render/player/deathFace';
import { body } from '../m1/game/render/player/deathAnim';
import { isShat, isNude } from '../m1/game/player/gut';

type Ctx = CanvasRenderingContext2D;

/** A hurt's source by the state of him (its own hurt lines and death screens each: `base`, `base_shitty`, `base_nude`). */
export const pantsSource = (state: GameState, base: string) => (isNude(state) ? `${base}_nude` : isShat(state) ? `${base}_shitty` : base);
/** The three sources a hurt has (to register each). */
export const pantsSources = (base: string) => [base, `${base}_shitty`, `${base}_nude`];
export type GagKind = 'rake' | 'trap';
export interface HurtGag {
  kind: GagKind; t: number; len: number;
  /** His middle and his feet where it got him, which way he faced. */
  x: number; feet: number; facing: 1 | -1;
  /** (rake) Where the tines are, and which way the handle lay; (trap) where the stake's driven in, and the jaws' look. */
  ax: number; dir: -1 | 1; style?: 'cartoon' | 'rusty';
  /** The frame it was last ticked (gone stale: he's shown again). */
  at: number;
}
const GAGS = new WeakMap<GameState, HurtGag>();

/** How long the rake's lasts (the trap's lasts as long as the trap holds him: endHurtGag). */
export const RAKE_GAG = 34;
/** (rake) How long it holds him (no input: under half a second). */
export const RAKE_LOCK = 28;

export const startHurtGag = (state: GameState, g: Omit<HurtGag, 't' | 'at'>) => {
  const p = state.player;
  if (p.inCutscene || p.health <= 0 || state.deathTimer > 0) return;
  GAGS.set(state, { ...g, t: 0, at: state.frame });
  p.hidden = true;
};
export const endHurtGag = (state: GameState) => {
  if (!GAGS.has(state)) return;
  GAGS.delete(state);
  state.player.hidden = false;
};
export const hurtGagOf = (state: GameState): HurtGag | undefined => GAGS.get(state);

/** A frame of it (the section's update, every frame): over once it's run, or he's dead, or a scene's taken him. */
export const tickHurtGag = (state: GameState) => {
  const g = GAGS.get(state), p = state.player;
  if (!g) return;
  g.t++; g.at = state.frame;
  if (g.t >= g.len || p.health <= 0 || p.inCutscene || state.deathTimer > 0) { endHurtGag(state); return; }
  // (pinned where it got him: the rake's plank rock is on the spot; the trap holds him there anyway)
  g.x = p.pos.x + p.width / 2; g.feet = p.pos.y + p.height;
  p.hidden = true;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const INK = '#1A1028';
const box = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/** Him, stood at (x, feet), turned `rot` about his feet, the face given; `extra` overrides the pose (airborne...). */
const him = (c: Ctx, state: GameState, g: HurtGag, x: number, feet: number, rot: number, face: DeathFace, extra: Record<string, unknown> = {}) => {
  c.save();
  c.translate(x, feet); c.rotate(rot); c.translate(-x, -feet);
  const d = { kind: 'own:hurtgag', x, y: feet, facing: g.facing } as unknown as MeatheadDeath;
  body(c, state, d, state.player.currentWeapon, { deathFace: face, ...extra });
  c.restore();
};
/** A cartoon star (five points, inked, two steps of yellow). */
const star = (c: Ctx, x: number, y: number, r: number, spin: number) => {
  const pts = (rr: number) => { c.beginPath(); for (let i = 0; i < 10; i++) { const a = spin + (i / 10) * Math.PI * 2 - Math.PI / 2, q = i % 2 ? rr * 0.45 : rr; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); };
  c.fillStyle = INK; pts(r + 1.5); c.fill();
  c.fillStyle = '#F59E0B'; pts(r); c.fill();
  c.fillStyle = '#FDE047'; pts(r * 0.62); c.fill();
  box(c, x - 1, y - r * 0.5, 1, 1, '#FFFFFF');
};
/** A little cartoon birdie (round, a beak, a wing flapping). */
const birdie = (c: Ctx, x: number, y: number, flap: boolean, dir: number) => {
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, 4.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#7DD3FC'; c.beginPath(); c.arc(x, y, 3.5, 0, Math.PI * 2); c.fill();
  box(c, x - 2, y - 3, 2, 1, '#E0F2FE');
  box(c, x + dir * 3, y - 1, dir * 3, 2, '#F59E0B');
  box(c, x + dir * 1, y - 2, 1, 1, INK);
  box(c, x - dir * 2 - 2, y + (flap ? -4 : 1), 4, 2, '#0EA5E9');
};
/** Stars and birdies going round his head (cx, cy), k how many/how strong (fades out at the end). */
const dizzy = (c: Ctx, cx: number, cy: number, t: number, alpha: number) => {
  c.save(); c.globalAlpha = alpha;
  for (let i = 0; i < 5; i++) {
    const a = t * 0.16 + (i / 5) * Math.PI * 2, x = cx + Math.cos(a) * 17, y = cy + Math.sin(a) * 5;
    if (i === 2) birdie(c, x, y, (t >> 2) % 2 === 0, Math.sin(a) > 0 ? -1 : 1);
    else star(c, x, y, 4, t * 0.2 + i);
  }
  c.restore();
};

/** (rake) The handle: from the tines up to where it's struck (ex, ey), wood in steps, the red tape at its end. */
const handle = (c: Ctx, x0: number, y0: number, ex: number, ey: number) => {
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.moveTo(x0, y0); c.lineTo(ex, ey); c.stroke();
  c.strokeStyle = '#C8924A'; c.lineWidth = 4.5; c.stroke();
  c.strokeStyle = '#F6DAA6'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x0 - 1, y0); c.lineTo(ex - 1, ey); c.stroke();
  const k = 0.82, tx = x0 + (ex - x0) * k, ty = y0 + (ey - y0) * k;
  c.strokeStyle = '#DC2626'; c.lineWidth = 5.5; c.beginPath(); c.moveTo(tx, ty); c.lineTo(ex, ey); c.stroke();
  c.lineCap = 'butt';
};

/** (trap) The jaws shut on his boot at (x, y) (the bottom of the boot), the chain back to the stake at (sx, GY). */
const jaws = (c: Ctx, x: number, y: number, sx: number, ground: number, rusty: boolean, t: number) => {
  const S = rusty ? ['#2A2420', '#4A3E34', '#6E5E50', '#8E7C6A', '#B4A08A'] : ['#141A24', '#3C4656', '#5A6474', '#8A94A2', '#C4CCD6'];
  // (the chain, pulled taut when he's up off the ground, slack lying along it when he's down)
  const lift = ground - y, n = 7;
  for (let k = 0; k <= n; k++) {
    const u = k / n, cx = sx + (x - sx) * u, sag = lift < 3 ? 0 : Math.sin(u * Math.PI) * Math.max(0, 6 - lift * 0.4);
    const cy = ground - 2 + (y - 4 - ground + 2) * u + sag;
    c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.ellipse(cx, cy, 2.6, 1.6, 0, 0, Math.PI * 2); c.stroke();
    box(c, cx - 1, cy - 1, 2, 1, S[3]);
  }
  // (the stake, driven in)
  box(c, sx - 2, ground - 9, 4, 10, INK); box(c, sx - 1, ground - 8, 2, 9, S[2]); box(c, sx - 3, ground - 10, 6, 2, S[3]);
  // (the jaws: two half rings clamped round the boot, standing up, teeth meshed over the leather; the springs out
  // either side, the pan under it)
  const shake = t < 8 ? (t % 2 ? 1 : -1) : 0, jx = x + shake;
  box(c, jx - 11, y - 3, 22, 4, INK); box(c, jx - 10, y - 2, 20, 2, S[2]);
  for (const s of [-1, 1]) { box(c, jx + s * 11 - (s > 0 ? 0 : 5), y - 3, 5, 4, INK); box(c, jx + s * 11 - (s > 0 ? 0 : 4), y - 2, 4, 2, S[3]); }
  c.fillStyle = INK; c.beginPath(); c.ellipse(jx, y - 6, 9.5, 8.5, 0, Math.PI, 0); c.fill();
  c.fillStyle = S[2]; c.beginPath(); c.ellipse(jx, y - 6, 8, 7, 0, Math.PI, 0); c.fill();
  c.fillStyle = S[3]; c.beginPath(); c.ellipse(jx - 2, y - 8, 4.5, 3.5, 0, Math.PI, 0); c.fill();
  box(c, jx - 6, y - 11, 2, 1, S[4]);
  box(c, jx - 9, y - 7, 18, 3, INK);
  for (let i = -2; i <= 2; i++) { box(c, jx + i * 3.2 - 1, y - 9, 2.2, 3, '#FFFFFF'); box(c, jx + i * 3.2 - 1, y - 6, 2.2, 1, INK); }
  if (rusty) { box(c, jx - 5, y - 10, 2, 2, '#8A3A14'); box(c, jx + 4, y - 8, 2, 2, '#5E260C'); }
  // (blood out from under the teeth)
  box(c, jx - 4, y - 5, 2, 4 + ((t >> 3) % 2), '#B91C1C'); box(c, jx + 2, y - 5, 2, 3, '#8E1414');
  // (the pain lines off it: a red starburst, pulsing)
  const pulse = (t >> 2) % 2;
  c.strokeStyle = pulse ? '#EF4444' : '#FDE047'; c.lineWidth = 2;
  for (let i = 0; i < 6; i++) { const a = Math.PI + (i / 5) * Math.PI, r0 = 12 + pulse * 2, r1 = 18 + pulse * 3; c.beginPath(); c.moveTo(jx + Math.cos(a) * r0, y - 6 + Math.sin(a) * r0 * 0.8); c.lineTo(jx + Math.cos(a) * r1, y - 6 + Math.sin(a) * r1 * 0.8); c.stroke(); }
};

/** Him and the gag, in the play plane (the section's drawFront). */
export const drawHurtGag = (c: Ctx, state: GameState) => {
  const g = GAGS.get(state), p = state.player;
  if (!g) return;
  // (gone stale (the section that ticked it isn't any more): he's shown again)
  if (state.frame - g.at > 2) { endHurtGag(state); return; }
  if (g.kind === 'rake') drawRake(c, state, g);
  else drawTrap(c, state, g);
  void p;
};

const drawRake = (c: Ctx, state: GameState, g: HurtGag) => {
  const t = g.t, f = g.facing;
  // (the board-stiff rock: back from the handle, forward, settling; WHACK on the first frame, his head knocked back)
  const away = (Math.sign(g.x - g.ax) || -g.dir) as number;
  const rock = t < 4 ? away * 0.32 * (t / 4) : away * 0.32 * Math.exp(-(t - 4) / 13) * Math.cos((t - 4) * 0.42);
  const settle = t > g.len - 8 ? 1 - (g.len - t) / 8 : 0;
  const rot = rock * (1 - settle);
  const face: DeathFace = t < 10 ? 'shock' : 'dead';
  // (squashed flat for a moment as it hits: a frame or two of him shorter, wider)
  c.save();
  if (t < 5) { const k = 1 - (5 - t) * 0.012; c.translate(g.x, g.feet); c.scale(2 - k, k); c.translate(-g.x, -g.feet); }
  him(c, state, g, g.x, g.feet, rot, face);
  c.restore();
  // Where his face is (turned with him): about 58 up from his feet (the top of his head 72)
  const hx = g.x + Math.sin(rot) * 58 + f * 3, hy = g.feet - Math.cos(rot) * 58;
  // (the handle up in his face while it's there: the tines' end down at the ground)
  if (t < 12) handle(c, g.ax, g.feet - 3, hx - away * 2, hy - 6);
  // (the print of it down his face: flat, red, the grain in it; fading as the wobble does)
  const print = Math.max(0, Math.min(1, (g.len - 6 - t) / 14));
  if (t >= 4 && print > 0) {
    c.save(); c.globalAlpha = 0.85 * print;
    c.translate(hx, hy); c.rotate(rot);
    box(c, -2.5, -9, 5, 18, '#B91C1C'); box(c, -2.5, -9, 1, 18, '#EF4444'); box(c, 1.5, -9, 1, 18, '#7F1D1D');
    for (let k = -6; k < 9; k += 5) box(c, -1.5, k, 3, 1, '#7F1D1D');
    c.restore();
  }
  // (the stars and birdies round his head)
  if (t >= 6) dizzy(c, g.x + Math.sin(rot) * 78, g.feet - Math.cos(rot) * 78, t, Math.min(1, (g.len - t) / 8));
  // (the WHACK lines off the hit)
  if (t < 7) {
    c.strokeStyle = '#FFFFFF'; c.lineWidth = 2;
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3, r0 = 10 + t, r1 = 16 + t * 2; c.beginPath(); c.moveTo(hx - away * 6 + Math.cos(a) * r0, hy - 6 + Math.sin(a) * r0); c.lineTo(hx - away * 6 + Math.cos(a) * r1, hy - 6 + Math.sin(a) * r1); c.stroke(); }
  }
};

const drawTrap = (c: Ctx, state: GameState, g: HurtGag) => {
  const t = g.t, f = g.facing;
  // (hopping on the spot: up, down, up, howling; the trapped foot comes up with him, jaws and all)
  const period = 16, ph = (t % period) / period, hop = t < 6 ? 0 : Math.sin(ph * Math.PI) * 9;
  const lean = Math.sin(t * 0.39) * 0.07 - f * 0.05;
  him(c, state, g, g.x, g.feet - hop, lean, 'scream', hop > 1 ? { isGrounded: false, vel: { x: 0, y: ph < 0.5 ? -3 : 3 } } : {});
  // (the jaws on his boot (the front foot), the chain back to the stake)
  jaws(c, g.x + f * 6, g.feet - hop + 1, g.ax, g.feet, g.style === 'rusty', t);
  // (sweat flying off his head)
  const hx = g.x + f * 3, hy = g.feet - hop - 54;
  for (let i = 0; i < 3; i++) {
    const u = ((t + i * 6) % 18) / 18, sx = hx + (i - 1) * 9 + (i - 1) * u * 10, sy = hy - 6 - u * 8 + u * u * 14;
    c.fillStyle = INK; c.beginPath(); c.arc(sx, sy, 2.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#7DD3FC'; c.beginPath(); c.arc(sx, sy, 1.6, 0, Math.PI * 2); c.fill();
  }
};
