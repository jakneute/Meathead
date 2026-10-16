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
import { drawCast, womanOf, byPants, px, INK, type Costume } from '../cast';
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

const POLO = (s: number) => ['#1D4ED8', '#2563EB', '#1E40AF'][s % 3];
const COSTUME: Costume = {
  id: 'jetgoon', top: POLO, sleeveLen: 0.45, legs: '#D6C29A', shoe: 'sneaker', shoeCol: '#F8FAFC', bareBelow: true,
  back: (g, B) => {
    // (the jetpack: two silver tanks, the straps)
    const x = Math.round(-B.w / 2 - 10 + B.lean), y = Math.round(B.shY - 2);
    for (const dx of [0, 7]) { px(g, x + dx - 1, y - 1, 8, 30, INK); px(g, x + dx, y, 6, 28, '#D4D4D8'); px(g, x + dx, y, 2, 28, '#F4F4F5'); px(g, x + dx, y + 8, 6, 2, '#DC2626'); px(g, x + dx + 1, y + 28, 4, 4, '#3F3F46'); }
  },
  over: (g, B) => { const y = Math.round(B.shY + 4); px(g, Math.round(-B.w / 2 + B.lean), y, B.w, 2, '#F8FAFC'); },
  hat: (g, B) => {
    // (a leather aviator cap, the ear flaps, goggles up on the forehead)
    const hx = Math.round(B.hx), hy = Math.round(B.hy), rx = Math.round(B.rx), ry = Math.round(B.ry);
    px(g, hx - rx - 1, hy - ry - 2, rx * 2 + 2, ry + 3, INK); px(g, hx - rx, hy - ry - 1, rx * 2, ry + 1, '#78350F'); px(g, hx - rx, hy - ry - 1, rx * 2, 2, '#A16207');
    px(g, hx - rx - 1, hy - 1, 4, 8, '#78350F');
    for (const ox of [-4, 3]) { px(g, hx + ox - 1, hy - ry + 1, 6, 5, INK); px(g, hx + ox, hy - ry + 2, 4, 3, '#7DD3FC'); }
  },
  hairToo: true,
  hold: (g, _B, _F, x, y) => { px(g, Math.round(x) - 1, Math.round(y) - 4, 12, 6, INK); px(g, Math.round(x), Math.round(y) - 3, 10, 4, '#F97316'); },
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
    const tx = leaving ? CAMX + W + 160 : fx(Pl.sx), ty = fy(Pl.sy) + Math.sin(t * 0.05 + Pl.sx) * 18;
    e.pos.x += (tx - m.x) * (leaving ? 0.03 : 0.05); e.pos.y += (ty - m.y) * 0.05;
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
  // (gone off the screen: out of it)
  const sx = m.x - CAMX, sy = m.y - CY;
  if (t > 90 && (sx < -140 || sx > W + 200 || sy < -200 || sy > H + 160)) { (e as Enemy & { gone?: boolean }).gone = true; }
  return true;
};

registerM2Kind({
  kind: GOON_KIND, stats: { w: 38, h: 72, hp: 40, contact: 12, mass: 160, air: true }, humanoid: true, pathing: false, grab: 'none',
  head: { x: 1, y: -66, r: 10 },
  gender: e => (womanOf(e) ? 'f' : 'm'),
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y }),
  ai,
  draw: (c, e, f) => {
    // (the flames out of the jetpack under them, then them)
    const fl = 10 + ((f >> 1) % 3) * 4, bx = -14;
    c.fillStyle = '#F97316'; c.beginPath(); c.moveTo(bx - 6, -36); c.lineTo(bx - 1, -36 + fl + 10); c.lineTo(bx + 6, -36); c.fill();
    c.fillStyle = '#FDE047'; c.beginPath(); c.moveTo(bx - 3, -36); c.lineTo(bx - 1, -36 + fl); c.lineTo(bx + 3, -36); c.fill();
    drawCast(c, e, f, COSTUME, undefined, () => 'fly');
  },
});

// ---------------------------------------------------------------------------------------------------------------
// Spawning, the waves

const spawn = (state: GameState, mode: Mode, p: Omit<Pilot, 'mode' | 't' | 'cd' | 'leave'> & { leave?: number }, x: number, y: number) => {
  const e = makeKindEnemy(GOON_KIND as EnemyKind, x, y);
  e.pos.y = y - e.height / 2; e.initialX = Math.round(x + Math.random() * 1000); e.variant = Math.floor(Math.random() * 13);
  e.seen = true; e.homeY = e.pos.y;
  pilots.set(e, { mode, t: 0, cd: 40 + Math.floor(Math.random() * 80), leave: p.leave ?? 640, ...p });
  state.enemies.push(e);
  heliOf(state).goons.push(e);
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

/** The goons still out (alive, on the screen). */
export const goonsLeft = (state: GameState) => {
  const h = heliOf(state);
  h.goons = h.goons.filter(e => state.enemies.includes(e) && e.health > 0 && !e.isBlownAway && !(e as Enemy & { gone?: boolean }).gone);
  return h.goons.length;
};
/** Clears the gone ones out of the world (flown off). */
export const sweepGoons = (state: GameState) => {
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
