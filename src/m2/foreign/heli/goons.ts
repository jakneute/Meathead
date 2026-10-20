// Harry's lackeys: the ride's cast members (college kids in the ride's blue polo and an aviator cap, name tag on, men
// and women of every look by seed) strapped into the ride's EMERGENCY JETPACKS, sent at him between the landmarks.
// Three ways in: HOVERERS fly in off the right to a spot and pop at him with the ride's flare pistols till they're
// told to go; DIVERS line up on him and come straight at him (the boost shreds them; or get out of the way); SNEAKS
// come in from behind or from over or under him (the back boost, the up boost, the down flip). Teach, then escalate:
// (their spots are laid out on an 800x600 screen: fx/fy put them in the zoomed-out field)
// the first waves are slow and few. The waves between landmark N-1 and N (geo: the transit) are WAVES[N].

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { enemyProjectile } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { registerM2Kind } from '../../kinds';
import { drawCast, womanOf, seedOf, byPants, px, INK, type Costume } from '../cast';
import { heliOf } from './state';
import { goonSays } from './talk';
import { GOON_BARK } from './lines';
import { CAMX, CY, W, H, fx, fy } from './geo';

export const GOON_KIND = 'm2:fl_jetgoon';
const SHOT = 12;

type Mode = 'hover' | 'dive' | 'sneak';
interface Pilot { mode: Mode; t: number; sx: number; sy: number; cd: number; leave: number; dx?: number; dy?: number; locked?: boolean; from?: 'left' | 'top' | 'bottom' | 'right' }
const pilots = new WeakMap<Enemy, Pilot>();

// ---------------------------------------------------------------------------------------------------------------
// The look: the ride's polo, khaki shorts, an aviator cap with goggles, the jetpack on their back

/** The ride's polo (the crew's blues; the odd shift lead in the red one), their shorts (khaki, navy, olive). */
const POLO = (s: number) => (s % 7 === 3 ? '#B91C1C' : ['#1D4ED8', '#2563EB', '#1E40AF', '#1E3A8A'][s % 4]);
const SHORTS = (s: number) => ['#D6C29A', '#1E293B', '#C2B280', '#5A6234'][(s >> 2) % 4];
/** Their caps (by seed): the leather aviator cap with its goggles up, the same with the goggles down over their eyes,
 *  or the ride's navy ball cap and a headset. Leather in a few browns. */
const LEATHER = [['#3A1E0C', '#78350F', '#A16207'], ['#2A1608', '#5A2E10', '#8A4A1A'], ['#4A2A14', '#92502A', '#C07A40']];
const capOf = (s: number) => (s >> 1) % 3;
const COSTUME: Costume = {
  id: 'jetgoon', top: POLO, sleeveLen: 0.45, legs: SHORTS, shoe: 'sneaker', shoeCol: '#F8FAFC', bareBelow: true,
  back: (g, B) => {
    // (the ride's EMERGENCY JETPACK: two tanks in steps (lit up their left, shaded down their right), the red band and
    // its white letter, the domed tops, the frame and its strap, the nozzles under them)
    const x = Math.round(-B.w / 2 - 10 + B.lean), y = Math.round(B.shY - 2);
    px(g, x - 2, y + 4, 17, 4, INK); px(g, x - 1, y + 5, 15, 2, '#3F3F46');
    for (const dx of [0, 7]) {
      px(g, x + dx - 1, y - 2, 8, 32, INK);
      px(g, x + dx, y, 6, 28, '#A1A1AA'); px(g, x + dx, y, 4, 28, '#D4D4D8'); px(g, x + dx, y, 2, 28, '#F4F4F5'); px(g, x + dx + 5, y, 1, 28, '#71717A');
      px(g, x + dx + 1, y - 1, 4, 1, '#E4E4E7');
      px(g, x + dx, y + 8, 6, 3, '#B91C1C'); px(g, x + dx, y + 8, 6, 1, '#EF4444'); px(g, x + dx + 2, y + 9, 2, 1, '#FFFFFF');
      px(g, x + dx, y + 26, 6, 2, '#52525B');
      px(g, x + dx, y + 28, 6, 4, INK); px(g, x + dx + 1, y + 28, 4, 3, '#3F3F46'); px(g, x + dx + 1, y + 28, 1, 3, '#71717A');
    }
  },
  over: (g, B, F) => {
    // (the polo's white collar, its placket; the ride's patch (a little yellow helicopter) on the chest; the straps)
    const y = Math.round(B.shY + 4), x0 = Math.round(-B.w / 2 + B.lean);
    px(g, x0, y, B.w, 2, '#F8FAFC'); px(g, x0, y + 2, B.w, 1, '#CBD5E1');
    px(g, Math.round(B.lean) - 1, y + 2, 2, 6, POLO(F.seed) === '#B91C1C' ? '#7F1D1D' : '#1E3A8A');
    px(g, x0 + 3, y + 6, 5, 3, '#FACC15'); px(g, x0 + 2, y + 5, 7, 1, '#A16207');
    px(g, x0 + 1, y + 2, 2, 16, '#27272A');
  },
  hat: (g, B, F) => {
    const hx = Math.round(B.hx), hy = Math.round(B.hy), rx = Math.round(B.rx), ry = Math.round(B.ry), cap = capOf(F.seed);
    if (cap === 2) {
      // (the ride's navy ball cap (its bill out front, the button, a gold wing on it) and a headset, the mic boom)
      px(g, hx - rx - 1, hy - ry - 2, rx * 2 + 2, ry, INK); px(g, hx - rx, hy - ry - 1, rx * 2, ry - 2, '#1E3A8A'); px(g, hx - rx, hy - ry - 1, rx * 2, 2, '#2563EB');
      px(g, hx + rx - 2, hy - 3, 8, 3, INK); px(g, hx + rx - 2, hy - 3, 7, 2, '#1E40AF');
      px(g, hx - 2, hy - ry - 3, 3, 2, '#1E3A8A'); px(g, hx - 1, hy - ry + 1, 4, 2, '#FACC15');
      px(g, hx - rx - 2, hy - 2, 4, 6, INK); px(g, hx - rx - 1, hy - 1, 2, 4, '#3F3F46');
      px(g, hx - rx + 1, hy + 3, rx, 1, '#27272A'); px(g, hx + 1, hy + 3, 2, 2, '#52525B');
      return;
    }
    // (a leather aviator cap: stepped, its seams, the ear flaps; the goggles up on the forehead, or down over the eyes)
    const Lc = LEATHER[((Math.floor(F.seed) % 3) + 3) % 3];
    px(g, hx - rx - 1, hy - ry - 2, rx * 2 + 2, ry + 3, INK); px(g, hx - rx, hy - ry - 1, rx * 2, ry + 1, Lc[1]); px(g, hx - rx, hy - ry - 1, rx * 2, 2, Lc[2]);
    px(g, hx - rx, hy - ry + 1, 2, ry - 1, Lc[2]); px(g, hx, hy - ry - 1, 1, ry, Lc[0]);
    px(g, hx - rx - 1, hy - 1, 4, 8, INK); px(g, hx - rx, hy - 1, 3, 7, Lc[1]); px(g, hx - rx, hy + 5, 3, 1, Lc[0]);
    const gy = cap === 1 ? hy - 4 : hy - ry + 1;
    px(g, hx - rx, gy + 1, rx * 2, 2, '#27272A');
    for (const ox of [-4, 3]) { px(g, hx + ox - 1, gy, 6, 5, INK); px(g, hx + ox, gy + 1, 4, 3, cap === 1 ? '#38BDF8' : '#7DD3FC'); px(g, hx + ox, gy + 1, 1, 1, '#FFFFFF'); px(g, hx + ox + 3, gy + 3, 1, 1, '#0369A1'); }
  },
  hairToo: true,
  hold: (g, _B, _F, x, y) => {
    // (the ride's flare pistol: the fat orange barrel, its muzzle, the grip, a white stripe)
    const X = Math.round(x), Y = Math.round(y);
    px(g, X - 1, Y - 5, 13, 7, INK); px(g, X, Y - 4, 11, 5, '#F97316'); px(g, X, Y - 4, 11, 1, '#FDBA74'); px(g, X, Y, 11, 1, '#C2410C');
    px(g, X + 3, Y - 4, 1, 5, '#FFFFFF'); px(g, X + 10, Y - 4, 2, 5, '#9A3412');
    px(g, X - 1, Y, 4, 5, INK); px(g, X, Y, 2, 4, '#3F3F46');
  },
  eyes: 'angry', mouth: 'teeth',
  hands: (B, F) => (F.pose === 'fly' ? [[-B.w / 2 - 6, B.shY + 4], [B.w / 2 + 14, B.shY + 2]] : null),
};

// ---------------------------------------------------------------------------------------------------------------
// How they fly

const P = (state: GameState) => ({ x: state.player.pos.x + state.player.width / 2, y: state.player.pos.y + state.player.height / 2 });
const mid = (e: Enemy) => ({ x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 });

const ai = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, Pl = pilots.get(e);
  if (!Pl) return true;
  const t = ++Pl.t, m = mid(e), pc = P(state), woman = womanOf(e);
  e.facing = pc.x < m.x ? -1 : 1;
  e.vel.x = 0; e.vel.y = 0;
  const leaving = t > Pl.leave;
  if (Pl.mode === 'hover') {
    // (in to its spot, bobbing there, a flare at him now and then; told to go: off the way it came)
    // (told to go: off the right at a steady clip (easing toward a spot just off the edge, it never quite got there and
    // hung about out of sight, holding the next wave up))
    const ty = fy(Pl.sy) + Math.sin(t * 0.05 + Pl.sx) * 18;
    if (leaving) e.pos.x += 5; else e.pos.x += (fx(Pl.sx) - m.x) * 0.05;
    e.pos.y += (ty - m.y) * 0.05;
    if (!leaving && t > 50 && --Pl.cd <= 0 && state.player.health > 0 && !state.player.inCutscene) {
      Pl.cd = 110 + Math.floor(Math.random() * 60);
      const a = Math.atan2(pc.y - m.y, pc.x - m.x);
      state.projectiles.push(enemyProjectile(`jg-${state.frame}-${Math.random()}`, m.x - 6, m.y - 6, Math.cos(a) * 4.4, Math.sin(a) * 4.4, 12, 12, SHOT, { sadBolt: true, shooterKind: GOON_KIND, life: 500, bornAt: state.frame }));
      heliOf(state).shots.set(state.projectiles[state.projectiles.length - 1], { col: '#F97316', r: 6, shape: 'orb', t: 0 });
      playSound('gun', 0.3, 10);
    }
  } else if (Pl.mode === 'dive') {
    // (in, lined up on him, a beat (it yells), then straight at him and on out)
    if (t < 60) { e.pos.x += (fx(Pl.sx) - m.x) * 0.06; e.pos.y += (pc.y - m.y) * 0.05; }
    else {
      if (!Pl.locked) { Pl.locked = true; const a = Math.atan2(pc.y - m.y, pc.x - m.x); Pl.dx = Math.cos(a) * 7.5; Pl.dy = Math.sin(a) * 7.5; playSound('whoosh', 0.7, 2); }
      e.pos.x += Pl.dx!; e.pos.y += Pl.dy!;
    }
  } else {
    // (a sneak: in from behind him, or over him, or under him, along its line, and on out the other side)
    const sp = 2.6;
    if (Pl.from === 'left') { e.pos.x += sp; e.pos.y += (fy(Pl.sy) + Math.sin(t * 0.06) * 30 - m.y) * 0.05; }
    else if (Pl.from === 'top') { e.pos.y += sp * 0.9; e.pos.x += (fx(Pl.sx) - m.x) * 0.03; }
    else { e.pos.y -= sp * 0.9; e.pos.x += (fx(Pl.sx) - m.x) * 0.03; }
    if (t > 60 && --Pl.cd <= 0 && state.player.health > 0) {
      Pl.cd = 140;
      const a = Math.atan2(pc.y - m.y, pc.x - m.x);
      state.projectiles.push(enemyProjectile(`jg-${state.frame}-${Math.random()}`, m.x - 6, m.y - 6, Math.cos(a) * 4, Math.sin(a) * 4, 12, 12, SHOT, { sadBolt: true, shooterKind: GOON_KIND, life: 500, bornAt: state.frame }));
      heliOf(state).shots.set(state.projectiles[state.projectiles.length - 1], { col: '#F97316', r: 6, shape: 'orb', t: 0 });
    }
  }
  if (t === 30 && Math.random() < 0.5) goonSays(state, e, woman, pickLine(byPants(state, GOON_BARK)));
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// Always in sight (the user: "make sure all active enemies are always visible"): the view's the whole field (W x H is
// the screen over the zoom; pulled back for an arrival it only shows more). A hoverer at its post is kept fully inside
// it, a little in from the edges; anybody that goes out of it (a diver through and out, a sneak out the far side, one
// told to go, one knocked out) is gone the moment it's all the way out, and one hanging half out for a second is too.

const INSET = 10, HALF_OUT_MAX = 60;
const halfOut = new WeakMap<Enemy, number>();
const keepInView = (e: Enemy) => {
  const x0 = CAMX + INSET, x1 = CAMX + W - INSET, y0 = CY + INSET, y1 = CY + H - INSET;
  const gone = () => { (e as Enemy & { gone?: boolean }).gone = true; };
  // (all the way out: gone)
  if (e.pos.x > x1 || e.pos.x + e.width < x0 || e.pos.y > y1 || e.pos.y + e.height < y0) { gone(); return; }
  const out = e.pos.x < x0 || e.pos.x + e.width > x1 || e.pos.y < y0 || e.pos.y + e.height > y1;
  if (!out) { halfOut.delete(e); return; }
  const Pl = pilots.get(e);
  // (a hoverer at its post: back in)
  if (Pl && Pl.mode === 'hover' && Pl.t <= Pl.leave) {
    e.pos.x = Math.max(x0, Math.min(x1 - e.width, e.pos.x)); e.pos.y = Math.max(y0, Math.min(y1 - e.height, e.pos.y));
    return;
  }
  const n = (halfOut.get(e) ?? 0) + 1;
  halfOut.set(e, n);
  if (n > HALF_OUT_MAX) gone();
};

/** Them (origin: their feet's middle): the flames out of the jetpack under them, then them. */
/** The jetpack's flames (under its two nozzles): banded from a red tongue in to the white-hot core, flickering, a
 *  shimmer of heat and a puff of exhaust under them. */
export const jetFlame = (c: CanvasRenderingContext2D, bx: number, by: number, f: number, big = 1) => {
  const fl = (10 + ((f >> 1) % 3) * 4) * big;
  for (const dx of [-3.5, 3.5]) {
    const x = bx + dx, w = 3.5 * big;
    c.fillStyle = '#B91C1C'; c.beginPath(); c.moveTo(x - w - 1, by); c.lineTo(x, by + fl + 12 * big); c.lineTo(x + w + 1, by); c.fill();
    c.fillStyle = '#F97316'; c.beginPath(); c.moveTo(x - w, by); c.lineTo(x, by + fl + 6 * big); c.lineTo(x + w, by); c.fill();
    c.fillStyle = '#FDE047'; c.beginPath(); c.moveTo(x - w * 0.6, by); c.lineTo(x, by + fl * 0.7); c.lineTo(x + w * 0.6, by); c.fill();
    c.fillStyle = '#FFFBEB'; c.fillRect(Math.round(x - 1), by, 2, Math.round(4 * big));
  }
  const ph = (f % 16) / 16;
  c.globalAlpha = 0.3 * (1 - ph); c.fillStyle = '#A1A1AA'; c.beginPath(); c.arc(bx + Math.sin(f * 0.3) * 3, by + fl + 14 * big + ph * 14 * big, (4 + ph * 8) * big, 0, Math.PI * 2); c.fill();
  c.globalAlpha = 1;
};
const drawGoon = (c: CanvasRenderingContext2D, e: Enemy, f: number) => {
  jetFlame(c, -14.5, -36, f + (e.variant ?? 0));
  drawCast(c, e, f, COSTUME, undefined, () => 'fly');
};
/** The swoop's figure (banked, scaled up close, its ghosts): painted the once a fly frame at SPRITE_K into a sprite and
 *  put down with one drawImage (a rotated draw can't use the cast's stamps: painting the whole costume live three
 *  times a goon at five times its size every frame dropped the frame rate as they came in). */
const SPRITE_K = 4, SB: [number, number, number, number] = [-64, -132, 140, 136];
const sprites = new Map<string, HTMLCanvasElement>();
const goonSprite = (e: Enemy, f: number) => {
  const fr = Math.floor((f + seedOf(e)) / 5) % 4, key = `${seedOf(e)}|${fr}|${(e.hitFlash ?? 0) > 0 ? 1 : 0}`;
  let s = sprites.get(key);
  if (!s) {
    if (sprites.size > 96) sprites.clear();
    s = document.createElement('canvas'); s.width = SB[2] * SPRITE_K; s.height = SB[3] * SPRITE_K;
    const g = s.getContext('2d')!;
    g.setTransform(SPRITE_K, 0, 0, SPRITE_K, -SB[0] * SPRITE_K, -SB[1] * SPRITE_K);
    drawCast(g, e, f, COSTUME, undefined, () => 'fly');
    sprites.set(key, s);
  }
  return s;
};
const drawGoonSprite = (c: CanvasRenderingContext2D, e: Enemy, f: number) => {
  jetFlame(c, -14.5, -36, f + (e.variant ?? 0));
  if (typeof document === 'undefined') return;
  c.imageSmoothingEnabled = true;
  c.drawImage(goonSprite(e, f), SB[0], SB[1], SB[2], SB[3]);
};

registerM2Kind({
  kind: GOON_KIND, stats: { w: 38, h: 72, hp: 40, contact: 12, mass: 160, air: true }, humanoid: true, pathing: false, grab: 'none',
  head: { x: 1, y: -66, r: 10 },
  gender: e => (womanOf(e) ? 'f' : 'm'),
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y }),
  ai,
  draw: (c, e, f) => drawGoon(c, e, f),
});

// ---------------------------------------------------------------------------------------------------------------
// Their entrance (the user: "put them in the foreground first then stylishly 'mode 7' them to the fight plane. they
// zoom out to you"): each comes in huge, up close to the camera, low and partly off the screen, its jetpack flaring;
// then swoops away from the camera down onto the fight plane in a curve, banking, shrinking in perspective (its depth
// eased, its size one over it), speed lines and a trail behind it, its shadow sweeping across the park below; and
// settles at its own size at its spot, where it starts its business. Not in the world till then: nothing hits it and
// it hurts nobody. A group's come in one after another.

interface Entry { e: Enemy; t: number; delay: number; lx: number; ly: number; sx: number; sy: number; side: number }
/** How long the swoop takes (frames), the gap between a group's, how big it starts (times its size). */
const ENTER_T = 46, STAGGER = 16, BIG = 5.5;
const entries = new WeakMap<object, Entry[]>();
const entriesOf = (state: GameState) => { const h = heliOf(state); let l = entries.get(h); if (!l) { l = []; entries.set(h, l); } return l; };
let groupAt = -1, groupN = 0;
const isEntering = (state: GameState, e: Enemy) => entriesOf(state).some(q => q.e === e);
const enter = (state: GameState, e: Enemy, mode: Mode, p: Omit<Pilot, 'mode' | 't' | 'cd' | 'leave'>) => {
  if (groupAt !== state.frame) { groupAt = state.frame; groupN = 0; }
  // (where it settles: its spot on the plane, or just in from the edge it sneaks in at)
  const lx = mode === 'sneak' ? (p.from === 'left' ? CAMX + 70 : fx(p.sx)) : fx(p.sx);
  const ly = mode === 'sneak' ? (p.from === 'top' ? CY + 90 : p.from === 'bottom' ? CY + H - 90 : fy(p.sy)) : fy(p.sy);
  const side = (groupN % 2 ? -1 : 1) * (lx > CAMX + W / 2 ? -1 : 1);
  entriesOf(state).push({ e, t: 0, delay: groupN++ * STAGGER, lx, ly, sx: Math.max(CAMX + 80, Math.min(CAMX + W - 80, lx + side * W * 0.32)), sy: CY + H + 60, side });
};
/** Where it is in its swoop (u 0..1): world point (its middle), scale, bank, how near the camera still (1 .. 0). */
const swoop = (q: Entry, u: number) => {
  // (its depth eased from up close out to the plane; its size one over its depth; the way across follows the size)
  const z0 = 1 / BIG, k = u * u * (3 - 2 * u), z = z0 + (1 - z0) * k, sc = 1 / z, near = (sc - 1) / (BIG - 1);
  const ox = q.sx - q.lx, oy = q.sy - q.ly, L = Math.hypot(ox, oy) || 1, curve = Math.sin(near * Math.PI) * 120 * q.side;
  return { x: q.lx + ox * near + (-oy / L) * curve, y: q.ly + oy * near + (ox / L) * curve, sc, bank: q.side * (0.5 * near + 0.12 * Math.sin(u * Math.PI)), near };
};
/** Each frame: the swoops on; any down on the plane, into the world at its spot. */
export const tickEntrances = (state: GameState) => {
  const l = entriesOf(state), h = heliOf(state);
  for (const q of l) {
    if (q.e.health <= 0) { q.t = -1; continue; }
    if (q.delay > 0) { q.delay--; continue; }
    if (q.t === 0) playSound('whoosh', 0.7, 6);
    if (++q.t >= ENTER_T) {
      q.e.pos.x = q.lx - q.e.width / 2; q.e.pos.y = q.ly - q.e.height / 2; q.e.homeY = q.e.pos.y; q.e.initialY = q.e.pos.y;
      state.enemies.push(q.e); h.goonLandAt = state.frame; q.t = -1;
      playSound('ignite', 0.4, 8);
    }
  }
  const left = l.filter(q => q.t >= 0);
  l.length = 0; l.push(...left);
};
/** World, in front of everything (they're up close): the swoops, their trails, their shadows on the park. */
export const drawEntrances = (c: CanvasRenderingContext2D, state: GameState) => {
  const l = entriesOf(state), f = state.frame, px = state.player.pos.x + state.player.width / 2;
  for (const q of l) {
    if (q.delay > 0 || q.t < 0) continue;
    const u = q.t / ENTER_T, s = swoop(q, u), e = q.e, facing = px < s.x ? -1 : 1;
    // (its shadow sweeping across the park below: big and soft up close, tight down on the plane)
    c.fillStyle = `rgba(10, 10, 20, ${(0.12 + 0.18 * (1 - s.near)).toFixed(3)})`;
    c.beginPath(); c.ellipse(s.x + q.side * 40 * s.near, CY + H - 30, 30 * s.sc, 6 * s.sc, 0, 0, Math.PI * 2); c.fill();
    // (its exhaust left hanging along the way it came: puffs in steps (shaded under, lit up their left), thinning)
    for (let i = 1; i <= 5; i++) {
      const du = i * 0.06; if (u - du < 0) break;
      const g = swoop(q, u - du), rr = (6 + i * 3) * g.sc;
      c.globalAlpha = 0.34 * (1 - i / 6);
      c.fillStyle = '#52525B'; c.beginPath(); c.arc(g.x + rr * 0.2, g.y + rr * 0.25, rr, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#A1A1AA'; c.beginPath(); c.arc(g.x - rr * 0.1, g.y - rr * 0.1, rr * 0.8, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#D4D4D8'; c.beginPath(); c.arc(g.x - rr * 0.35, g.y - rr * 0.35, rr * 0.35, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
    // (speed lines streaming off it, back the way it came: white, a pale blue edge)
    const b = swoop(q, Math.max(0, u - 0.08)), vx = s.x - b.x, vy = s.y - b.y, vl = Math.hypot(vx, vy) || 1;
    for (const [col, lw, sh] of [['rgba(147, 197, 253, 0.45)', 4, 1.5], ['rgba(255, 255, 255, 0.75)', 2, 0]] as const) {
      c.strokeStyle = col; c.lineWidth = lw;
      for (let i = 0; i < 6; i++) {
        const o = (i - 2.5) * 14 * s.sc, ax = s.x - (vy / vl) * o + sh, ay = s.y + (vx / vl) * o + sh, len = (40 + ((i * 37 + f * 5) % 50)) * Math.min(3, vl / 20);
        c.beginPath(); c.moveTo(ax - (vx / vl) * 20 * s.sc, ay - (vy / vl) * 20 * s.sc); c.lineTo(ax - (vx / vl) * (20 * s.sc + len), ay - (vy / vl) * (20 * s.sc + len)); c.stroke();
      }
    }
    // (the trail: two ghosts of it behind, fading; then it, the jetpack flaring big up close (a glow round the flames))
    for (const [du, al] of [[0.16, 0.18], [0.08, 0.35], [0, 1]] as const) {
      if (u - du < 0) continue;
      const g = du ? swoop(q, u - du) : s;
      c.save(); c.globalAlpha = al;
      c.translate(g.x, g.y + (e.height / 2) * g.sc); c.rotate(g.bank); c.scale(facing * g.sc, g.sc);
      if (!du) {
        c.fillStyle = 'rgba(249, 115, 22, 0.28)'; c.beginPath(); c.ellipse(-14, -18, 18 + (f % 3) * 3, 34 + (f % 4) * 4, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = 'rgba(249, 115, 22, 0.45)'; c.beginPath(); c.ellipse(-14, -20, 12 + (f % 3) * 3, 26 + (f % 4) * 4, 0, 0, Math.PI * 2); c.fill();
        jetFlame(c, -14.5, -36, f, 1.6);
      }
      drawGoonSprite(c, e, f);
      c.restore();
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Spawning, the waves

const spawn = (state: GameState, mode: Mode, p: Omit<Pilot, 'mode' | 't' | 'cd' | 'leave'> & { leave?: number }, x: number, y: number) => {
  const e = makeKindEnemy(GOON_KIND as EnemyKind, x, y);
  e.pos.y = y - e.height / 2; e.initialX = Math.round(x + Math.random() * 1000); e.variant = Math.floor(Math.random() * 13);
  e.seen = true; e.homeY = e.pos.y;
  pilots.set(e, { mode, t: 0, cd: 40 + Math.floor(Math.random() * 80), leave: p.leave ?? 640, ...p });
  // (not into the world yet: it swoops in first)
  heliOf(state).goons.push(e);
  enter(state, e, mode, p);
  return e;
};
const hover = (state: GameState, sx: number, sy: number, delay = 0, leave = 640) => spawn(state, 'hover', { sx, sy, leave: leave + delay }, CAMX + W + 80 + delay * 3, fy(sy));
const diver = (state: GameState, sy: number, dx = 0) => spawn(state, 'dive', { sx: 660, sy }, CAMX + W + 80 + dx, fy(sy));
const sneak = (state: GameState, from: 'left' | 'top' | 'bottom', s: number) =>
  from === 'left' ? spawn(state, 'sneak', { from, sx: 0, sy: s }, CAMX - 60, fy(s))
    : spawn(state, 'sneak', { from, sx: s, sy: 0 }, fx(s), from === 'top' ? CY - 60 : CY + H + 40);

/** The waves before each landmark (by its index), each a function putting one wave out. */
// (trimmed for length (the user: a land plays ~5 min): the lesson before the first landmark whole; one wave before
// each of the rest)
export const WAVES: ((state: GameState) => void)[][] = ([
  // (before the Eiffel Tower: the lesson. Three that hover and pop at him; then two from behind and two from over him)
  [s => { hover(s, 560, 180); hover(s, 640, 320, 30); hover(s, 560, 460, 60); }, s => { sneak(s, 'left', 200); sneak(s, 'left', 420); sneak(s, 'top', 300); sneak(s, 'top', 460); }],
  [s => { diver(s, 200); diver(s, 420, 120); hover(s, 620, 300); }, s => { sneak(s, 'bottom', 280); sneak(s, 'bottom', 420); hover(s, 560, 160); hover(s, 600, 460, 40); }],
  [s => { for (let i = 0; i < 4; i++) hover(s, 520 + (i % 2) * 120, 140 + i * 110, i * 20); }, s => { diver(s, 150); diver(s, 300, 80); diver(s, 450, 160); }],
  [s => { sneak(s, 'left', 180); sneak(s, 'left', 460); hover(s, 600, 320); }, s => { sneak(s, 'top', 260); sneak(s, 'bottom', 380); diver(s, 300, 100); }],
  [s => { for (let i = 0; i < 5; i++) hover(s, 500 + (i % 2) * 140, 120 + i * 95, i * 15); }, s => { diver(s, 200); diver(s, 400, 60); sneak(s, 'left', 300); }],
  [s => { diver(s, 130); diver(s, 260, 60); diver(s, 390, 120); diver(s, 520, 180); }, s => { sneak(s, 'top', 200); sneak(s, 'top', 380); sneak(s, 'bottom', 300); hover(s, 620, 300); }],
  [s => { for (let i = 0; i < 4; i++) hover(s, 540 + (i % 2) * 120, 150 + i * 105, i * 25); sneak(s, 'left', 300); }, s => { diver(s, 180); diver(s, 450, 50); sneak(s, 'bottom', 250); sneak(s, 'top', 450); }, s => { for (let i = 0; i < 3; i++) hover(s, 600, 160 + i * 150, i * 30); }],
  [s => { diver(s, 160); diver(s, 300, 50); diver(s, 440, 100); hover(s, 640, 220); hover(s, 640, 400, 30); }, s => { sneak(s, 'left', 160); sneak(s, 'left', 300); sneak(s, 'left', 440); }, s => { sneak(s, 'top', 220); sneak(s, 'top', 420); sneak(s, 'bottom', 320); diver(s, 300, 80); }],
  [s => { for (let i = 0; i < 5; i++) hover(s, 520 + (i % 2) * 130, 120 + i * 95, i * 15); }, s => { diver(s, 150); diver(s, 270, 40); diver(s, 390, 80); diver(s, 510, 120); sneak(s, 'left', 330); }, s => { sneak(s, 'top', 250); sneak(s, 'top', 450); sneak(s, 'bottom', 350); hover(s, 620, 200); hover(s, 620, 420, 20); }],
] as ((state: GameState) => void)[][]).map((w, i) => (i === 0 ? w : w.slice(0, 1)));

/** The goons still out (alive, on the screen, or still swooping in). */
export const goonsLeft = (state: GameState) => {
  const h = heliOf(state);
  h.goons = h.goons.filter(e => (state.enemies.includes(e) || isEntering(state, e)) && e.health > 0 && !e.isBlownAway && !(e as Enemy & { gone?: boolean }).gone);
  return h.goons.length;
};
/** Clears the gone ones out of the world (flown off). */
export const sweepGoons = (state: GameState) => {
  // (every frame: those on the plane kept in sight, or gone)
  for (const e of heliOf(state).goons) if (e.health > 0 && !e.isBlownAway && state.enemies.includes(e)) keepInView(e);
  state.enemies = state.enemies.filter(e => !(e as Enemy & { gone?: boolean }).gone);
};

/** A few of them sent in DURING a landmark's fight (the user: "jetpack enemies spawn in semi regularly during the mid
 *  boss fights"): a small group from all round, a little bigger later in the gauntlet. `n`: which group this fight. */
export const fightGroup = (state: GameState, landmark: number, n: number) => {
  const size = 2 + (landmark >= 3 ? 1 : 0) + (landmark >= 6 ? 1 : 0);
  const pick = (k: number) => (n * 3 + k * 5 + landmark) % 5;
  for (let k = 0; k < size; k++) {
    const y = 140 + ((n * 97 + k * 131) % 340);
    switch (pick(k)) {
      case 0: hover(state, 520 + (k % 2) * 90, y, k * 20, 420); break;
      case 1: sneak(state, 'left', y); break;
      case 2: sneak(state, 'top', 200 + (k * 150) % 400); break;
      case 3: sneak(state, 'bottom', 220 + (k * 130) % 380); break;
      default: diver(state, y, k * 50);
    }
  }
};
