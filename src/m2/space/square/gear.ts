// Futureland's street gear: set pieces, not scenery, the same ones in the square (where each is taught) and on the main
// drag (where they're escalated and mixed). Each runs whether he's there or not, carries him if he's on it, and hits
// the staff the same as him (hazardHit.ts); nobody walks into one of their own accord (its danger zones, every frame).
//
//   belt     THE PEOPLE MOVER: a moving sidewalk, flush with the street. Stood on it, it carries him (and anybody).
//   plate    the ELECTRIC SIDEWALK ("SAFE AS MILK"): a floor plate on a cycle. Off; then it buzzes (sparks, the tell,
//            harmless); then it's live (arcs up off it, knee-high and some): it zaps whoever's on it, or just over it.
//   pad      a THRUST PAD ("FEEL THE THRUST! PHOTO OP"): a grille in the floor over a rocket nozzle. 'step': stood on
//            it, it counts down (T-3, 2, 1: its lights) and fires, launching him sky-high. 'timed': it fires on its
//            own clock (the escalation: be on it when it goes). Anybody stood on it goes up too.
//   mono     THE MONORAIL OF TOMORROW, EXPRESS ONLY (it has never stopped; it cannot stop): trains out of one shed,
//            along the track, into the other, one after another. Its roof carries him; its nose takes him off the
//            track (and anybody else on it, for good). The horn and the signal before each one comes out.
//   saucer   an ANTI-GRAVITY SAUCER: a hover-platform on a hidden arm, gliding back and forth or bobbing up and down.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Block, Enemy } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pushEnemy } from '../../../m1/game/combat/knockback';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { setHazardZones, hazardVictims, hazardHit, hazardKill, boxHits, type Zone } from '../../hazardHit';
import { box, label } from '../section';
import { GY } from '../geometry';
import { lettering } from './lettering';
import { INK, at, poly, checker, mix, pixelBlob, steppedGlow, viewOf, lit, board, CHROME, RUBBER, COPPER, CONCRETE, PINK, LIP } from './paint';

type Ctx = CanvasRenderingContext2D;
const AWAY = 1e6;

export interface Belt { x0: number; x1: number; y: number; v: number }
export interface Plate { x: number; w: number; y: number; off: number }
export interface Pad { x: number; w: number; y: number; mode: 'step' | 'timed'; off?: number; power?: number; on: number; cd: number; fired: number }
export interface Mono { a: number; b: number; y: number; len: number; v: number; period: number; off: number; x: number; out: boolean; roof: Block; t: number }
export interface Saucer { x: number; y: number; ax: number; ay: number; period: number; phase: number; w: number; block: Block }
export interface Gear { owner: string; belts: Belt[]; plates: Plate[]; pads: Pad[]; monos: Mono[]; saucers: Saucer[] }

/** The electric sidewalk's cycle: off, buzzing (the tell), live. */
export const PLATE = { period: 210, buzz: 110, live: 165, arcH: 54 } as const;
/** The thrust pads: how long stood on one before it goes, how hard, a timed one's clock. */
export const PAD = { fuse: 48, power: 20, period: 170, cool: 50 } as const;
const MONO_H = 62;

const ledgeBlock = (state: GameState, x: number, y: number, w: number, tag: string): Block => {
  const b = { x, y, w, h: 16, type: 'platform', oneWay: true, hidden: true, tag } as Block;
  state.blocks.push(b);
  return b;
};
export const makeGear = (state: GameState, owner: string, o: {
  belts?: [number, number, number, number][]; plates?: [number, number, number, number][];
  pads?: [number, number, number, 'step' | 'timed', number?][];
  monos?: { a: number; b: number; y: number; len: number; v: number; period: number; off: number }[];
  saucers?: [number, number, number, number, number, number, number][];
}): Gear => ({
  owner,
  belts: (o.belts ?? []).map(([x0, x1, y, v]) => ({ x0, x1, y, v })),
  plates: (o.plates ?? []).map(([x, w, y, off]) => ({ x, w, y, off })),
  pads: (o.pads ?? []).map(([x, w, y, mode, off]) => ({ x, w, y, mode, off: off ?? 0, on: 0, cd: 0, fired: -999 })),
  monos: (o.monos ?? []).map(m => ({ ...m, x: m.a - m.len, out: false, t: 0, roof: ledgeBlock(state, m.a - m.len, AWAY, m.len - 20, `${owner}-mono`) })),
  saucers: (o.saucers ?? []).map(([x, y, w, ax, ay, period, phase]) => ({ x, y, w, ax, ay, period, phase, block: ledgeBlock(state, x - w / 2, y, w, `${owner}-saucer`) })),
});

// ---------------------------------------------------------------------------------------------------------------
// The clocks (the same whether he's there or not: the frame's the clock)

export const platePhase = (state: GameState, pl: Plate) => (state.frame + pl.off) % PLATE.period;
export const plateBuzz = (state: GameState, pl: Plate) => { const t = platePhase(state, pl); return t >= PLATE.buzz && t < PLATE.live; };
export const plateLive = (state: GameState, pl: Plate) => platePhase(state, pl) >= PLATE.live;
const padPhase = (state: GameState, pd: Pad) => (state.frame + (pd.off ?? 0)) % PAD.period;
const sauAt = (state: GameState, s: Saucer) => {
  const a = ((state.frame + s.phase) / s.period) * Math.PI * 2;
  return { x: s.x + Math.sin(a) * s.ax, y: s.y + Math.sin(a) * s.ay };
};

// ---------------------------------------------------------------------------------------------------------------
// Him on things

const P = (state: GameState) => state.player;
const standingOn = (state: GameState, x: number, w: number, y: number) => {
  const p = P(state), feet = p.pos.y + p.height;
  return p.health > 0 && p.vel.y >= 0 && Math.abs(feet - y) <= 3 && p.pos.x + p.width > x + 2 && p.pos.x < x + w - 2;
};
const eOn = (e: Enemy, x: number, w: number, y: number) => Math.abs(e.pos.y + e.height - y) <= 3 && e.pos.x + e.width > x && e.pos.x < x + w && e.vel.y >= 0;
const moveLedge = (state: GameState, b: Block, x: number, y: number, carry = true, stopAt?: number) => {
  const on = b.y < AWAY - 1 && standingOn(state, b.x, b.w, b.y);
  const dx = x - b.x;
  b.x = x; b.y = y;
  if (on && carry && y < AWAY - 1) {
    const p = P(state);
    // (carried along, unless that would take him into the wall it's going in under: left standing there instead)
    if (stopAt === undefined || p.pos.x + p.width + dx < stopAt) p.pos.x += dx;
    p.pos.y = y - p.height;
  }
  return on;
};
const launch = (state: GameState, power: number) => {
  const p = P(state);
  p.vel.y = -power; p.isGrounded = false;
  p.coyoteAirTimer = 0; p.coyoteJumpTimer = 0; p.jumpHoldTimer = 0; p.pos.y -= 2; p.squash = -1;
};
const hit = (ctx: FrameContext, dmg: number, source: string, kx: number, ky: number, frames = 18) => {
  const p = ctx.state.player;
  if (p.invincibilityTimer > 0 || p.health <= 0) return false;
  hurtPlayer(ctx, dmg, source, { x: kx, y: ky }, frames);
  shakeScreen(ctx.state, 8, 3);
  return true;
};
/** (each one hit once a pass, not every frame it's touching) */
const lastHit = new WeakMap<Enemy, number>();
const once = (state: GameState, e: Enemy, gap = 30) => {
  const l = lastHit.get(e);
  if (l !== undefined && state.frame - l < gap) return false;
  lastHit.set(e, state.frame);
  return true;
};

// ---------------------------------------------------------------------------------------------------------------

export interface GearEvents { padFired?: boolean; onMono?: boolean }

export const updateGear = (ctx: FrameContext, g: Gear): GearEvents => {
  const { state } = ctx, p = state.player, ev: GearEvents = {};
  const pm = p.pos.x + p.width / 2;
  const near = (x: number) => Math.abs(x - pm) < CANVAS_WIDTH;
  const foes = hazardVictims(state, { flyers: true }).filter(e => Math.abs(e.pos.x - p.pos.x) < CANVAS_WIDTH * 1.5);
  const zones: Zone[] = [];

  // The people movers
  for (const b of g.belts) {
    if (p.isGrounded && standingOn(state, b.x0, b.x1 - b.x0, b.y)) p.pos.x += b.v;
    for (const e of state.enemies) if (e.health > 0 && !e.isBlownAway && e.enemyType !== 'flyer' && eOn(e, b.x0, b.x1 - b.x0, b.y)) e.pos.x += b.v;
  }

  // The electric sidewalk
  for (const pl of g.plates) {
    const t = platePhase(state, pl), buzz = t >= PLATE.buzz && t < PLATE.live, live = t >= PLATE.live;
    if (t > PLATE.buzz - 40) zones.push({ x0: pl.x - 8, x1: pl.x + pl.w + 8, y0: pl.y - PLATE.arcH, y1: pl.y + 2, ground: true });
    if (!near(pl.x)) continue;
    if (t === PLATE.buzz) playSound('taser', 0.18, -6);
    if (t === PLATE.live) playSound('taser', 0.5, 2);
    if (buzz && state.frame % 5 === 0) state.particles.push({ pos: { x: pl.x + Math.random() * pl.w, y: pl.y - 2 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() * 2 }, life: 12, color: '#BAE6FD', size: 2 });
    if (!live) continue;
    const feet = p.pos.y + p.height;
    if (p.health > 0 && p.pos.x + p.width > pl.x + 4 && p.pos.x < pl.x + pl.w - 4 && feet > pl.y - PLATE.arcH && feet <= pl.y + 3)
      hit(ctx, 12, 'm2:space_zap', pm < pl.x + pl.w / 2 ? -5 : 5, -9);
    for (const e of foes) if (e.enemyType !== 'flyer' && boxHits(e, pl.x, pl.y - PLATE.arcH, pl.w, PLATE.arcH + 3) && once(state, e))
      hazardHit(ctx, e, 45, pl.x + pl.w / 2, 'ZAPPED!', { color: '#BAE6FD' });
  }

  // The thrust pads
  for (const pd of g.pads) {
    pd.cd = Math.max(0, pd.cd - 1);
    const onIt = p.isGrounded && standingOn(state, pd.x, pd.w, pd.y);
    let fire = false;
    if (pd.mode === 'step') {
      if (onIt && pd.cd === 0) {
        pd.on++;
        if (pd.on % 16 === 1) playSound('beep', 0.5, pd.on > 32 ? 8 : 2);
        if (pd.on >= PAD.fuse) fire = true;
      } else pd.on = 0;
    } else {
      const t = padPhase(state, pd);
      if (near(pd.x) && (t === PAD.period - 48 || t === PAD.period - 32 || t === PAD.period - 16)) playSound('beep', 0.4, t === PAD.period - 16 ? 8 : 2);
      fire = t === 0;
      // (about to go: nobody walks onto it)
      if (t > PAD.period - 60) zones.push({ x0: pd.x - 6, x1: pd.x + pd.w + 6, y0: pd.y - 200, y1: pd.y + 2, ground: true });
    }
    if (fire) {
      pd.on = 0; pd.cd = PAD.cool; pd.fired = state.frame;
      if (near(pd.x)) { playSound('boom', 0.45, 6); playSound('whoosh', 0.8, -6); shakeScreen(state, 4, 2); }
      if (onIt) { launch(state, pd.power ?? PAD.power); ev.padFired = true; }
      for (const e of foes) if (e.enemyType !== 'flyer' && eOn(e, pd.x - 4, pd.w + 8, pd.y)) { pushEnemy(e, (Math.random() - 0.5) * 4, -17, 50); if (once(state, e, 10)) hazardHit(ctx, e, 20, pd.x + pd.w / 2, 'BLAST OFF!', { color: '#FDE68A', knock: 1 }); }
    }
    if (state.frame - pd.fired < 26) zones.push({ x0: pd.x - 6, x1: pd.x + pd.w + 6, y0: pd.y - 200, y1: pd.y + 2, ground: true });
  }

  // The monorail
  for (const m of g.monos) {
    m.t = (state.frame + m.off) % m.period;
    const run = (m.b - m.a + m.len) / m.v;
    const wasOut = m.out;
    m.out = m.t < run;
    m.x = m.a - m.len + m.t * m.v;
    if (!wasOut && m.out && near(m.a)) playSound('ding', 0.4, 3);
    if (m.t === m.period - 70 && near(m.a)) playSound('horn', 0.5, 4);
    const roofY = m.y - MONO_H;
    // (the roof: a ledge only where it's out of the sheds)
    const rx = Math.max(m.x + 10, m.a), rw = Math.min(m.x + m.len - 10, m.b) - rx;
    if (m.out && rw > 20) {
      if (moveLedge(state, m.roof, rx, roofY, true, m.b)) ev.onMono = true;
      m.roof.w = rw;
    } else moveLedge(state, m.roof, m.a, AWAY, false);
    if (!m.out) continue;
    zones.push({ x0: m.x - 30, x1: m.x + m.len + 60, y0: roofY, y1: m.y });
    // (its nose takes him off the track if he's stood in front of it, not up on its roof)
    const nose = m.x + m.len;
    if (nose > m.a && nose < m.b + 20 && p.health > 0 && p.pos.x + p.width > nose - 22 && p.pos.x < nose + 4 && p.pos.y + p.height > roofY + 8 && p.pos.y < m.y)
      if (hit(ctx, 14, 'm2:space_monorail', 9, -8, 24)) playSound('horn', 0.7, 2);
    for (const e of foes) if (e.enemyType !== 'flyer' && boxHits(e, Math.max(m.a, m.x), roofY + 6, Math.min(m.b, nose) - Math.max(m.a, m.x), MONO_H - 6) && once(state, e))
      hazardKill(ctx, e, m.x, 'EXPRESS!', { fling: { x: 13, y: -9 }, sound: 'crunch' });
  }

  // The saucers
  for (const s of g.saucers) { const at = sauAt(state, s); moveLedge(state, s.block, at.x - s.w / 2, at.y); }

  setHazardZones(state, g.owner, zones);
  return ev;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (world space; only what's in view, culled by its whole drawn size). Their tops go back toward the eye.

const inView = (state: GameState, a: number, b: number) => b > state.camera.x - 140 && a < state.camera.x + CANVAS_WIDTH + 140;
/** A quad going back from the front edge (x0..x1 at y) from depth d0 to d1. */
const flatBack = (c: Ctx, eye: { x: number; y: number }, x0: number, x1: number, y: number, d0: number, d1: number, col: string) =>
  poly(c, [at(eye, x0, y, d0), at(eye, x1, y, d0), at(eye, x1, y, d1), at(eye, x0, y, d1)], col);
const line = (c: Ctx, a: [number, number], b: [number, number], col: string, w = 1) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); };
const BELT_D = 0.9, PLATE_D = 0.92;

/** A ball, stepped (the gear's own: lamps, bulbs, insulators). */
const ballAt = (c: Ctx, x: number, y: number, r: number, col: string) => {
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 1, 0, Math.PI * 2); c.fill();
  c.fillStyle = mix(col, INK, 0.25); c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = col; c.beginPath(); c.arc(x - r * 0.15, y - r * 0.15, r * 0.75, 0, Math.PI * 2); c.fill();
  box(c, x - r * 0.45, y - r * 0.45, Math.max(1, r * 0.35), Math.max(1, r * 0.35), mix(col, '#FFFFFF', 0.6));
};

export const drawGearBack = (c: Ctx, state: GameState, g: Gear) => {
  const f = state.frame, eye = viewOf(state).eye;
  for (const b of g.belts) {
    if (!inView(state, b.x0 - 20, b.x1 + 20)) continue;
    // The people mover: its tread going back (black rubber slats crawling along, the way it runs), the steel combs at
    // each end, the glass balustrade along its far side with the rubber handrail running, arrows along its lip
    const step = 16, sh = ((f * b.v) % step + step) % step;
    flatBack(c, eye, b.x0, b.x1, b.y, 1, BELT_D, RUBBER[2]);
    flatBack(c, eye, b.x0, b.x1, b.y, 1, 0.97, RUBBER[3]);
    c.save(); c.beginPath();
    const q = [at(eye, b.x0, b.y, 1), at(eye, b.x1, b.y, 1), at(eye, b.x1, b.y, BELT_D), at(eye, b.x0, b.y, BELT_D)];
    q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
    for (let x = b.x0 - step + sh; x < b.x1 + step; x += step) { line(c, at(eye, x, b.y, 1), at(eye, x, b.y, BELT_D), RUBBER[0], 2); line(c, at(eye, x + 2, b.y, 1), at(eye, x + 2, b.y, BELT_D), RUBBER[4]); }
    c.restore();
    for (const [x, s] of [[b.x0, 1], [b.x1, -1]] as const) poly(c, [at(eye, x, b.y, 1), at(eye, x + s * 14, b.y, 1), at(eye, x + s * 14, b.y, BELT_D), at(eye, x, b.y, BELT_D)], CHROME[4]);
    // (the balustrade: glass panels on chrome posts, the handrail on top, its dashes running)
    const [bl, by] = at(eye, b.x0 - 6, b.y, BELT_D), [br] = at(eye, b.x1 + 6, b.y, BELT_D), hr = 44 * BELT_D;
    box(c, bl, by - hr, br - bl, hr, 'rgba(190, 230, 255, 0.22)');
    for (let x = b.x0; x <= b.x1; x += 100) { const [px] = at(eye, x, b.y, BELT_D); box(c, px - 2, by - hr, 4, hr, INK); box(c, px - 1, by - hr, 2, hr, CHROME[4]); }
    box(c, bl - 1, by - hr - 6, br - bl + 2, 8, INK); box(c, bl, by - hr - 5, br - bl, 6, RUBBER[3]); box(c, bl, by - hr - 5, br - bl, 1, RUBBER[4]);
    const hs = ((f * b.v * BELT_D) % 40 + 40) % 40;
    for (let x = bl - 40 + hs; x < br; x += 40) if (x > bl && x + 8 < br) box(c, x, by - hr - 3, 8, 2, '#3A3A48');
    box(c, bl, by - 2, br - bl, 2, CHROME[2]);
    // (its front lip: brushed steel flush with the walk, arrows on the tread)
    box(c, b.x0, b.y - 1, b.x1 - b.x0, 4, CHROME[3]); box(c, b.x0, b.y - 1, b.x1 - b.x0, 1, LIP[3]); box(c, b.x0, b.y + 3, b.x1 - b.x0, 1, INK);
    const dir = Math.sign(b.v);
    for (let x = b.x0 + 60; x < b.x1 - 40; x += 160) {
      const [ax, ay] = at(eye, x, b.y, 0.95);
      c.fillStyle = INK; c.beginPath(); c.moveTo(ax + dir * 12, ay); c.lineTo(ax - dir * 6, ay - 3); c.lineTo(ax - dir * 6, ay + 3); c.closePath(); c.fill();
      c.fillStyle = '#FDE047'; c.beginPath(); c.moveTo(ax + dir * 10, ay); c.lineTo(ax - dir * 5, ay - 2); c.lineTo(ax - dir * 5, ay + 2); c.closePath(); c.fill();
    }
  }
  for (const pl of g.plates) {
    if (!inView(state, pl.x - 30, pl.x + pl.w + 30)) continue;
    const t = platePhase(state, pl), buzz = t >= PLATE.buzz && t < PLATE.live, live = t >= PLATE.live;
    // The electric sidewalk: a copper plate going back (riveted, its seams, hazard stripes along its front), hot when
    // it's live, flickering when it buzzes; a coil post at each end (copper windings, an insulator, the ball on top)
    const hot = live ? 6 : buzz && (f >> 1) % 2 ? 5 : 3;
    flatBack(c, eye, pl.x, pl.x + pl.w, pl.y, 1, PLATE_D, COPPER[hot]);
    flatBack(c, eye, pl.x, pl.x + pl.w, pl.y, 1, 0.975, COPPER[Math.min(6, hot + 1)]);
    flatBack(c, eye, pl.x, pl.x + pl.w, pl.y, 0.95, PLATE_D, COPPER[hot - 1]);
    for (let x = pl.x + 20; x < pl.x + pl.w; x += 20) line(c, at(eye, x, pl.y, 1), at(eye, x, pl.y, PLATE_D), COPPER[1]);
    for (let x = pl.x + 6; x < pl.x + pl.w - 4; x += 14) { const [rx, ry] = at(eye, x, pl.y, 0.96); box(c, rx, ry, 2, 1, COPPER[1]); }
    box(c, pl.x, pl.y - 1, pl.w, 5, INK);
    for (let x = pl.x; x < pl.x + pl.w; x += 10) box(c, x, pl.y, Math.min(5, pl.x + pl.w - x), 3, '#FACC15');
    if (live) box(c, pl.x, pl.y - 2, pl.w, 1, '#FFFFFF');
    for (const ex of [pl.x - 8, pl.x + pl.w]) {
      box(c, ex - 1, pl.y - 38, 10, 38, INK); box(c, ex, pl.y - 38, 8, 38, CHROME[3]); box(c, ex, pl.y - 38, 2, 38, CHROME[5]);
      for (let k = 0; k < 4; k++) { box(c, ex - 3, pl.y - 34 + k * 7, 14, 4, INK); box(c, ex - 2, pl.y - 33 + k * 7, 12, 2, COPPER[4]); box(c, ex - 2, pl.y - 31 + k * 7, 12, 1, COPPER[2]); }
      box(c, ex - 1, pl.y - 44, 10, 6, '#E8E0D0'); box(c, ex - 1, pl.y - 44, 10, 1, '#FFFFFF');
      ballAt(c, ex + 4, pl.y - 49, 5, live || buzz ? '#BAE6FD' : CHROME[3]);
      if (live) steppedGlow(c, ex + 4, pl.y - 49, 16, '#BAE6FD', 0.35, 0.05, 3);
    }
  }
  for (const pd of g.pads) {
    if (!inView(state, pd.x - 30, pd.x + pd.w + 60)) continue;
    // The thrust pad: the grille going back over the nozzle (it glows up as it counts down), yellow-and-black chevrons
    // round it, the countdown lights on their chrome post
    let lit3 = 0;
    if (pd.mode === 'step') lit3 = Math.min(3, Math.floor(pd.on / (PAD.fuse / 3)));
    else { const t = padPhase(state, pd); lit3 = t > PAD.period - 48 ? Math.min(3, Math.floor((t - (PAD.period - 48)) / 16) + 1) : 0; }
    const heat = ['#1A1A22', '#5A1A0A', '#B8400C', '#FB9440'][lit3];
    flatBack(c, eye, pd.x, pd.x + pd.w, pd.y, 1, PLATE_D, heat);
    for (let x = pd.x + 6; x < pd.x + pd.w - 3; x += 8) line(c, at(eye, x, pd.y, 0.995), at(eye, x, pd.y, PLATE_D + 0.005), CHROME[2], 3);
    for (let k = 1; k < 4; k++) { const dd = 1 - ((1 - PLATE_D) * k) / 4; line(c, at(eye, pd.x, pd.y, dd), at(eye, pd.x + pd.w, pd.y, dd), CHROME[1], 2); }
    for (const [ex, s] of [[pd.x, -1], [pd.x + pd.w, 1]] as const) for (let k = 0; k < 2; k++) {
      const x = ex + s * (2 + k * 6);
      poly(c, [at(eye, x, pd.y, 1), at(eye, x + s * 4, pd.y, 1), at(eye, x + s * 4, pd.y, PLATE_D), at(eye, x, pd.y, PLATE_D)], k ? INK : '#FACC15');
    }
    box(c, pd.x - 6, pd.y - 1, pd.w + 12, 4, INK); for (let x = pd.x - 6; x < pd.x + pd.w + 6; x += 8) box(c, x, pd.y, 4, 2, '#FACC15');
    const px = pd.x + pd.w + 16;
    box(c, px - 1, pd.y - 66, 8, 66, INK); box(c, px, pd.y - 66, 6, 66, CHROME[3]); box(c, px, pd.y - 66, 2, 66, CHROME[5]);
    box(c, px - 10, pd.y - 96, 26, 34, INK); box(c, px - 9, pd.y - 95, 24, 32, '#1E293B'); box(c, px - 9, pd.y - 95, 24, 2, '#475569');
    for (let k = 0; k < 3; k++) { const ly = pd.y - 87 + k * 10, on = 2 - k < lit3; ballAt(c, px + 3, ly, 3.5, on ? '#F87171' : '#3F3F46'); if (on) steppedGlow(c, px + 3, ly, 10, '#F87171', 0.35, 0.05, 3); }
  }
  for (const s of g.saucers) {
    const p = sauAt(state, s);
    if (!inView(state, p.x - s.w, p.x + s.w)) continue;
    // (its arm, down out of sight behind: the anti-gravity (a chrome pipe, banded))
    box(c, p.x - 4, p.y + 10, 8, 900, INK); box(c, p.x - 3, p.y + 10, 6, 900, CHROME[2]); box(c, p.x - 3, p.y + 10, 2, 900, CHROME[4]);
    for (let y = p.y + 30; y < p.y + 600; y += 40) box(c, p.x - 4, y, 8, 2, CHROME[1]);
  }
};

/** What's in front of him: the trains and their sheds, the saucers, the jets, the arcs. */
export const drawGearFront = (c: Ctx, state: GameState, g: Gear) => {
  const f = state.frame, eye = viewOf(state).eye;
  for (const s of g.saucers) {
    const p = sauAt(state, s);
    if (!inView(state, p.x - s.w, p.x + s.w)) continue;
    // The saucer: its top a chrome disc (lit at its lip: stand on it), the rim banded, the dome under it, lights chasing
    const hw = s.w / 2;
    c.fillStyle = INK; c.beginPath(); c.ellipse(p.x, p.y + 14, hw * 0.5 + 1, 8, 0, 0, Math.PI); c.fill();
    c.fillStyle = CHROME[2]; c.beginPath(); c.ellipse(p.x, p.y + 14, hw * 0.5, 7, 0, 0, Math.PI); c.fill();
    c.fillStyle = CHROME[3]; c.beginPath(); c.ellipse(p.x - 4, p.y + 14, hw * 0.3, 4, 0, 0, Math.PI); c.fill();
    const [, ty] = at(eye, p.x, p.y, 0.94);
    const depth = Math.max(2, p.y - ty);
    c.fillStyle = INK; c.beginPath(); c.ellipse(p.x, p.y + 6, hw + 2, 9, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = CHROME[2]; c.beginPath(); c.ellipse(p.x, p.y + 6, hw, 7, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = CHROME[4]; c.beginPath(); c.ellipse(p.x, p.y + 1, hw - 2, Math.min(8, depth) + 1, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = CHROME[5]; c.beginPath(); c.ellipse(p.x - hw * 0.2, p.y - 1, hw * 0.5, Math.min(5, depth * 0.6) + 1, 0, 0, Math.PI * 2); c.fill();
    box(c, p.x - hw + 4, p.y - 1, s.w - 8, 2, LIP[3]);
    for (let k = 0; k < 7; k++) { const on = (Math.floor(f / 6) + k) % 7 === 0; ballAt(c, p.x - hw + 8 + (k * (s.w - 16)) / 6, p.y + 8, 1.6, on ? '#F472B6' : '#7DD3FC'); }
  }
  for (const pd of g.pads) {
    const age = state.frame - pd.fired;
    if (age < 0 || age > 30 || !inView(state, pd.x - 60, pd.x + pd.w + 60)) continue;
    // The jet: a column of exhaust in stepped bands (orange shell, yellow, a white-hot core), puffs rolling off it
    const hgt = 200 * Math.min(1, age / 4) * (1 - age / 34), w = pd.w * (0.7 + age * 0.01), cx = pd.x + pd.w / 2;
    for (const [k, col] of [[1, '#EA580C'], [0.75, '#FB9440'], [0.5, '#FDE68A'], [0.22, '#FFFFFF']] as const) {
      c.fillStyle = col; c.beginPath(); c.moveTo(cx - (w * k) / 2, pd.y); c.lineTo(cx - ((w * k) / 2) * 0.7, pd.y - hgt * (0.4 + k * 0.6)); c.lineTo(cx + ((w * k) / 2) * 0.7, pd.y - hgt * (0.4 + k * 0.6)); c.lineTo(cx + (w * k) / 2, pd.y); c.fill();
    }
    for (let k = 0; k < 5; k++) { const u = k / 4; pixelBlob(c, cx + Math.sin(age * 0.6 + k * 2) * 20, pd.y - hgt * (0.5 + u * 0.5), 14 + age * 0.7, 10 + age * 0.4, k % 2 ? 'rgba(226, 232, 240, 0.75)' : 'rgba(203, 213, 225, 0.6)'); }
    steppedGlow(c, cx, pd.y - 10, 60, '#FDBA74', 0.3 * (1 - age / 30), 0.02, 3);
  }
  for (const pl of g.plates) {
    if (!plateLive(state, pl) || !inView(state, pl.x - 20, pl.x + pl.w + 20)) continue;
    // The arcs: jagged, jumping about, from post to post and up off the plate (a pale halo under each)
    for (const [w2, col] of [[5, 'rgba(125, 211, 252, 0.45)'], [2, '#E0F2FE']] as const) {
      c.strokeStyle = col; c.lineWidth = w2;
      for (let k = 0; k < 3; k++) {
        c.beginPath(); c.moveTo(pl.x - 4, pl.y - 49);
        const n = 8;
        for (let i = 1; i <= n; i++) { const x = pl.x - 4 + ((pl.w + 8) * i) / n, y = pl.y - 49 + (i === n ? 0 : Math.sin(f * 1.7 + i * 2.3 + k * 4) * 12 + 18 * Math.sin((i / n) * Math.PI)); c.lineTo(x, y); }
        c.stroke();
      }
    }
    c.strokeStyle = '#7DD3FC'; c.lineWidth = 1;
    for (let x = pl.x + 8; x < pl.x + pl.w; x += 22) { c.beginPath(); c.moveTo(x, pl.y); for (let y = pl.y; y > pl.y - PLATE.arcH; y -= 9) c.lineTo(x + Math.sin(f * 2.1 + y + x) * 5, y); c.stroke(); }
  }
  for (const m of g.monos) {
    if (m.out && inView(state, m.x, m.x + m.len)) drawTrain(c, m);
    drawSheds(c, state, m, eye);
  }
};

// The monorail's art, around the same rideable surfaces (the roof at m.y - MONO_H, the beam's top at m.y): the beam
// deep under its top, the trains' skirts straddling it, the stations bigger than the trains.
const BEAM = 30, BEAM_D = 0.92, SKIRT = 14, ST_H = 56, PYL_D = 0.95;
const darken = (col: string, k: number) => mix(col, '#000000', Math.max(0, Math.min(1, k)));

const drawTrain = (c: Ctx, m: Mono) => {
  const top = m.y - MONO_H, bot = m.y + SKIRT, x = m.x, L = m.len, H = bot - top;
  c.save(); c.beginPath(); c.rect(m.a, top - 24, m.b - m.a, H + 60); c.clip();
  // The body: a long white capsule, banded top to bottom (lit roof, shaded belly), dithered between bands
  c.fillStyle = INK; c.beginPath(); c.roundRect(x - 2, top - 2, L + 4, H + 4, [12, 38, 8, 8]); c.fill();
  const bands = ['#FFFFFF', '#F4F6FA', '#E4EAF4', '#CDD4E2', '#AEB8CC', '#8792AA'];
  c.save(); c.beginPath(); c.roundRect(x, top, L, H, [10, 36, 6, 6]); c.clip();
  const bh = [0, 10, 26, 40, 54, 64, H];
  for (let i = 0; i < 6; i++) box(c, x, top + bh[i], L, bh[i + 1] - bh[i], bands[i]);
  for (let i = 1; i < 6; i++) checker(c, x, top + bh[i] - 2, L, 2, bands[i], 0, 2);
  // (the stripe: pink, lit and shaded, EXPRESS along it; a teal pinstripe under)
  box(c, x, top + 38, L, 11, PINK[3]); box(c, x, top + 38, L, 2, PINK[5]); box(c, x, top + 47, L, 2, PINK[1]);
  box(c, x, top + 51, L, 2, '#14B8A6'); box(c, x, top + 51, L, 1, '#5EEAD4');
  // (the windows, riders in them: heads, a hand up; a door every third bay)
  for (let wx = x + 20, n = 0; wx < x + L - 66; wx += 38, n++) {
    if (n % 3 === 2) {
      box(c, wx + 2, top + 8, 1, H - 22, bands[4]); box(c, wx + 26, top + 8, 1, H - 22, bands[4]); box(c, wx + 3, top + 8, 1, H - 22, '#FFFFFF');
      box(c, wx + 6, top + 12, 18, 20, INK); box(c, wx + 7, top + 13, 16, 18, '#0369A1'); box(c, wx + 7, top + 13, 16, 5, '#38BDF8');
      continue;
    }
    box(c, wx - 1, top + 10, 30, 22, INK); box(c, wx, top + 11, 28, 20, '#0369A1'); box(c, wx, top + 11, 28, 7, '#0EA5E9'); box(c, wx, top + 11, 28, 2, '#7DD3FC'); box(c, wx + 2, top + 12, 6, 3, '#E0F2FE');
    const k = Math.abs(Math.floor((wx - x) / 38)) % 4;
    const skin = ['#B07850', '#6E4426', '#E4C0A8', '#C8946A'][k], shirt = ['#E8659E', '#22BCAC', '#F0C840', '#9470C4'][k];
    c.fillStyle = mix(skin, INK, 0.25); c.beginPath(); c.arc(wx + 17, top + 22, 5, 0, Math.PI * 2); c.fill();
    c.fillStyle = skin; c.beginPath(); c.arc(wx + 16, top + 21, 4, 0, Math.PI * 2); c.fill();
    box(c, wx + 11, top + 26, 12, 5, shirt); box(c, wx + 11, top + 26, 12, 1, mix(shirt, '#FFFFFF', 0.4));
    if (k === 1) box(c, wx + 22, top + 13, 3, 8, skin);
    box(c, wx, top + 29, 28, 2, 'rgba(0,0,0,0.25)');
  }
  // (the skirt down over the beam: brushed chrome, the wheels' housings, bolts)
  box(c, x, m.y - 4, L, SKIRT + 4, CHROME[3]); box(c, x, m.y - 4, L, 2, CHROME[5]); box(c, x, bot - 4, L, 4, CHROME[1]); checker(c, x, bot - 6, L, 2, CHROME[1], 0, 2);
  for (let k = x + 22; k < x + L - 30; k += 46) { box(c, k - 1, m.y, 22, 10, INK); box(c, k, m.y + 1, 20, 8, '#1E2230'); box(c, k + 2, m.y + 4, 16, 3, CHROME[1]); box(c, k + 24, m.y + 2, 2, 2, CHROME[6]); }
  c.restore();
  lettering(c, 'EXPRESS', x + L / 2 - 8, top + 43, 'small', '#FFFFFF', PINK[3]);
  // (the bubble nose: glass in steps, the driver, a glint; the headlight; the tail light)
  c.fillStyle = INK; c.beginPath(); c.ellipse(x + L - 30, top + 22, 23, 16, 0, 0, Math.PI * 2); c.fill();
  for (const [r, col, d] of [[1, '#075985', 0], [0.86, '#0369A1', -1], [0.66, '#0EA5E9', -3], [0.4, '#7DD3FC', -6]] as const) { c.fillStyle = col; c.beginPath(); c.ellipse(x + L - 30 + d, top + 22 + d, 21 * r, 14 * r, 0, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = '#C8946A'; c.beginPath(); c.arc(x + L - 34, top + 26, 4, 0, Math.PI * 2); c.fill(); box(c, x + L - 38, top + 21, 8, 2, '#1E293B');
  box(c, x + L - 40, top + 13, 5, 2, '#FFFFFF'); box(c, x + L - 42, top + 16, 2, 2, '#FFFFFF');
  ballAt(c, x + L - 8, top + 44, 5, '#FDE68A');
  steppedGlow(c, x + L + 4, top + 44, 30, '#FDE68A', 0.3, 0.03, 3);
  ballAt(c, x + 5, top + 44, 3, '#EF4444');
  // (the roof: its lip lit (stand on it), vents flush along it, the fin at the back)
  box(c, x + 8, top, L - 44, 2, LIP[3]); box(c, x + 8, top + 2, L - 44, 1, LIP[2]);
  for (let k = x + 60; k < x + L - 70; k += 60) { box(c, k, top + 4, 14, 3, bands[3]); box(c, k, top + 4, 14, 1, bands[4]); }
  poly(c, [[x + 6, top + 3], [x + 24, top - 16], [x + 30, top - 16], [x + 46, top + 3]], INK);
  poly(c, [[x + 9, top + 2], [x + 25, top - 13], [x + 29, top - 13], [x + 43, top + 2]], PINK[3]);
  poly(c, [[x + 9, top + 2], [x + 25, top - 13], [x + 27, top - 13], [x + 15, top + 2]], PINK[5]);
  poly(c, [[x + 35, top + 2], [x + 29, top - 13], [x + 29, top - 9], [x + 43, top + 2]], PINK[1]);
  c.restore();
};

/** A box's side going back (the stations'): in steps darker back, inked at its far edge. */
const sideBackG = (c: Ctx, eye: { x: number; y: number }, e: number, top: number, bottom: number, d: number, R: string[]) => {
  for (let i = 0; i < 3; i++) { const a = 1 - ((1 - d) * i) / 3, b = 1 - ((1 - d) * (i + 1)) / 3; poly(c, [at(eye, e, top, a), at(eye, e, top, b), at(eye, e, bottom, b), at(eye, e, bottom, a)], R[2 - i]); }
  const [x1, t1] = at(eye, e, top, d), [, b1] = at(eye, e, bottom, d);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(e, top); c.lineTo(x1, t1); c.lineTo(x1, b1); c.stroke();
};

/**
 * A concrete pylon (the track's, the stations'): a column, square in plan, its side going back toward the eye; a
 * flared capital up under the beam, chrome bearings on it; down at `foot` a footing on the walk and its shadow, or (in a
 * hole) on down into the dark to the hole's floor, darker the deeper.
 */
const pylon = (c: Ctx, eye: { x: number; y: number }, x: number, yTop: number, foot: number, inHole: boolean, hw = 13) => {
  const capH = 20, cw = hw + 17, C = CONCRETE, s = eye.x > x ? 1 : -1;
  const bot = inHole ? foot + 340 : foot;
  const dk = (col: string, y: number) => (inHole ? darken(col, (y - foot - 20) / 300) : col);
  // (its side going back, the capital's flared side over it)
  if (Math.abs(eye.x - x) > hw + 1) {
    const e = x + s * hw;
    for (let y = yTop + capH; y < bot; y += 40) {
      const y2 = Math.min(bot, y + 40);
      for (let i = 0; i < 2; i++) { const a = 1 - ((1 - PYL_D) * i) / 2, b = 1 - ((1 - PYL_D) * (i + 1)) / 2; poly(c, [at(eye, e, y, a), at(eye, e, y, b), at(eye, e, y2 + 1, b), at(eye, e, y2 + 1, a)], dk(C[2 - i], y)); }
    }
    poly(c, [[x + s * cw, yTop], [e, yTop + capH], at(eye, e, yTop + capH, PYL_D), at(eye, x + s * cw, yTop, PYL_D)], C[1]);
    const [fx, fy] = at(eye, e, yTop + capH, PYL_D), [, by] = at(eye, e, bot, PYL_D);
    c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx, by); c.stroke();
  }
  // (the column's face: lit down its left, shaded down its right, the form-tie rows, a rust streak under the capital)
  for (let y = yTop + capH; y < bot; y += 40) {
    const h = Math.min(40, bot - y);
    box(c, x - hw - 1, y, hw * 2 + 2, h, INK);
    box(c, x - hw, y, hw * 2, h, dk(C[3], y));
    box(c, x - hw, y, 4, h, dk(C[4], y)); box(c, x - hw + 4, y, 1, h, dk(C[5], y));
    box(c, x + hw - 6, y, 6, h, dk(C[2], y)); checker(c, x + hw - 9, y, 3, h, dk(C[2], y), 0, 2);
    box(c, x - hw, y, hw * 2, 1, dk(C[2], y));
    for (const bx of [x - hw + 6, x + hw - 9]) box(c, bx, y + 20, 2, 2, dk(C[1], y));
  }
  checker(c, x - hw + 6, yTop + capH, 4, 30, C[2], 0, 2); box(c, x + 2, yTop + capH, 2, 22, '#8A6A4A');
  // (the capital: a flared block up under the beam, lit along its top; the bearings on it)
  poly(c, [[x - cw - 1, yTop - 1], [x + cw + 1, yTop - 1], [x + hw + 1, yTop + capH], [x - hw - 1, yTop + capH]], INK);
  poly(c, [[x - cw, yTop], [x + cw, yTop], [x + hw, yTop + capH - 1], [x - hw, yTop + capH - 1]], C[3]);
  poly(c, [[x - cw, yTop], [x - cw + 5, yTop], [x - hw + 3, yTop + capH - 1], [x - hw, yTop + capH - 1]], C[4]);
  poly(c, [[x + cw - 6, yTop], [x + cw, yTop], [x + hw, yTop + capH - 1], [x + hw - 5, yTop + capH - 1]], C[2]);
  box(c, x - cw, yTop, cw * 2, 2, C[5]);
  for (const bx of [x - cw + 6, x + cw - 16]) { box(c, bx - 1, yTop - 4, 12, 5, INK); box(c, bx, yTop - 3, 10, 3, CHROME[4]); box(c, bx, yTop - 3, 10, 1, CHROME[6]); }
  if (inHole) return;
  // (its footing on the walk, its side going back too; its shadow)
  c.fillStyle = 'rgba(16, 10, 30, 0.3)'; c.beginPath(); c.ellipse(x + s * 6, foot + 1, hw + 26, 4, 0, 0, Math.PI * 2); c.fill();
  const pw = hw + 8;
  if (Math.abs(eye.x - x) > pw + 1) poly(c, [[x + s * pw, foot - 12], at(eye, x + s * pw, foot - 12, PYL_D), at(eye, x + s * pw, foot, PYL_D), [x + s * pw, foot]], C[1]);
  box(c, x - pw - 1, foot - 13, pw * 2 + 2, 13, INK); box(c, x - pw, foot - 12, pw * 2, 12, C[3]); box(c, x - pw, foot - 12, pw * 2, 2, C[5]); box(c, x + pw - 5, foot - 12, 5, 12, C[2]);
  checker(c, x - pw, foot - 4, pw * 2, 4, C[2], 0, 2);
};

/** The stations at the track's ends: a googie box up on pylons, its side going back, a gabled roof sitting on it (thick,
 *  its eaves out past the walls with their shadow under them, its own side going back), windows with folk waiting, the
 *  dark mouth the trains run in and out of, MONORAIL in its gable; the signal on a bracket off the first one. */
const drawSheds = (c: Ctx, state: GameState, m: Mono, eye: { x: number; y: number }) => {
  const top = m.y - MONO_H - ST_H, floor = m.y + BEAM, rTop = top - 40;
  const W2 = ['#5A6680', '#8A96B0', '#C4CCDC', '#E8EEF6', '#FFFFFF'];
  const P = ['#5A0E2A', PINK[1], PINK[2], PINK[3], PINK[4], PINK[5]];
  for (const [x0, x1, first] of [[m.a - 180, m.a, true], [m.b, m.b + 180, false]] as const) {
    if (!inView(state, x0 - 60, x1 + 60)) continue;
    const mid = (x0 + x1) / 2, xl = x0 - 18, xr = x1 + 18, eave = top + 2, D = 0.88;
    // The body's side going back (on the eye's side), then the roof's: its slope, its fascia's end, the soffit under it
    const s = eye.x > x1 ? 1 : eye.x < x0 ? -1 : 0;
    if (s) {
      sideBackG(c, eye, s > 0 ? x1 : x0, top, floor, D, W2);
      const e = s > 0 ? xr : xl, below = eye.y > eave + 8;
      poly(c, [[e, eave + 8], [mid, rTop], at(eye, mid, rTop, D), at(eye, e, eave + 8, D)], below ? P[1] : P[3]);
      poly(c, [[e, eave], [e, eave + 8], at(eye, e, eave + 8, D), at(eye, e, eave, D)], CHROME[2]);
      if (below) poly(c, [[xl, eave + 8], [xr, eave + 8], at(eye, xr, eave + 8, D), at(eye, xl, eave + 8, D)], P[0]);
      const [rx, ry] = at(eye, mid, rTop, D), [ex, ey] = at(eye, e, eave + 8, D);
      c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(mid, rTop); c.lineTo(rx, ry); c.lineTo(ex, ey); c.stroke();
    }
    // The body: inked, stepped (lit left, shaded right)
    box(c, x0 - 1, top - 1, x1 - x0 + 2, floor - top + 2, INK);
    box(c, x0, top, x1 - x0, floor - top, W2[3]);
    box(c, x0, top, 4, floor - top, W2[4]); box(c, x0 + 4, top, 2, floor - top, mix(W2[3], W2[4], 0.5));
    box(c, x1 - 8, top, 8, floor - top, W2[2]); checker(c, x1 - 12, top, 4, floor - top, W2[2], 0, 2);
    // (the eaves' shadow down the wall's top)
    box(c, x0, top, x1 - x0, 9, W2[1]); checker(c, x0, top + 9, x1 - x0, 2, W2[1], 0, 2);
    // (the window band: chrome-framed, folk waiting in it)
    const wa = first ? x0 + 12 : x0 + 86, wb = first ? x1 - 86 : x1 - 12;
    box(c, wa - 3, top + 14, wb - wa + 6, 30, INK); box(c, wa - 2, top + 15, wb - wa + 4, 28, CHROME[4]); box(c, wa - 2, top + 15, wb - wa + 4, 1, CHROME[6]);
    box(c, wa, top + 17, wb - wa, 24, '#0369A1'); box(c, wa, top + 17, wb - wa, 8, '#0EA5E9'); checker(c, wa, top + 25, wb - wa, 2, '#0EA5E9', 0, 2);
    for (let k = 0, px = wa + 10; px < wb - 8; px += 17, k++) { c.fillStyle = ['#C8946A', '#6E4426', '#E4C0A8', '#B07850'][k % 4]; c.beginPath(); c.arc(px, top + 31, 3.5, 0, Math.PI * 2); c.fill(); box(c, px - 5, top + 35, 10, 6, ['#9470C4', '#F0C840', '#22BCAC', '#E8659E'][k % 4]); }
    for (let px = wa + 30; px < wb - 4; px += 30) box(c, px, top + 17, 2, 24, CHROME[3]);
    c.fillStyle = 'rgba(255,255,255,0.2)'; c.beginPath(); c.moveTo(wa + 8, top + 41); c.lineTo(wa + 16, top + 41); c.lineTo(wa + 30, top + 17); c.lineTo(wa + 22, top + 17); c.fill();
    // (the trim band, pink, studded, under the windows; the floor slab: the beam run in, chrome)
    box(c, x0, top + 48, x1 - x0, 6, P[3]); box(c, x0, top + 48, x1 - x0, 1, P[5]); box(c, x0, top + 53, x1 - x0, 1, P[1]);
    for (let k = x0 + 6; k < x1 - 4; k += 14) box(c, k, top + 50, 2, 2, P[5]);
    box(c, x0 - 1, m.y - 2, x1 - x0 + 2, BEAM + 3, INK); box(c, x0, m.y, x1 - x0, BEAM, CHROME[3]); box(c, x0, m.y, x1 - x0, 2, CHROME[5]); box(c, x0, m.y + 10, x1 - x0, 4, CHROME[4]); box(c, x0, floor - 8, x1 - x0, 8, CHROME[2]); box(c, x0, floor - 2, x1 - x0, 2, CHROME[1]);
    // (the mouth at the track's end of it: dark, banded back into the dark; its chrome jamb; the hazard header)
    const mw = 76, mx = first ? x1 - mw : x0, mt = m.y - MONO_H - 6, mb = m.y + SKIRT;
    box(c, mx, mt, mw, mb - mt, '#05050C');
    for (let i = 0; i < 3; i++) box(c, first ? mx + i * 6 : mx + mw - 20, mt + 6 + i * 4, 20 - i * 6, mb - mt - 6 - i * 8, ['#0E0E1A', '#16162A', '#20203A'][i]);
    box(c, mx, mt - 10, mw, 7, INK); box(c, mx, mt - 9, mw, 5, '#FACC15');
    for (let k = 0; k < mw; k += 8) poly(c, [[mx + k, mt - 4], [mx + k + 4, mt - 9], [mx + k + 7, mt - 9], [mx + k + 3, mt - 4]], INK);
    const jx = first ? mx - 4 : mx + mw;
    box(c, jx - 1, mt - 10, 6, mb - mt + 10, INK); box(c, jx, mt - 10, 4, mb - mt + 10, CHROME[3]); box(c, jx, mt - 10, 1, mb - mt + 10, CHROME[5]);
    // (a porthole by the mouth's other side)
    const ph = first ? x0 + 40 : x1 - 40;
    c.fillStyle = INK; c.beginPath(); c.arc(ph, m.y - 30, 14, 0, Math.PI * 2); c.fill(); c.fillStyle = CHROME[4]; c.beginPath(); c.arc(ph, m.y - 30, 13, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#0369A1'; c.beginPath(); c.arc(ph, m.y - 30, 10, 0, Math.PI * 2); c.fill(); c.fillStyle = '#0EA5E9'; c.beginPath(); c.arc(ph - 2, m.y - 32, 7, 0, Math.PI * 2); c.fill(); box(c, ph - 6, m.y - 37, 4, 3, '#E0F2FE');
    // The roof: a gable sitting on the walls (its fascia over the wall's top: no gap), thick, eaves out past the walls
    poly(c, [[xl - 1, eave + 1], [mid, rTop - 2], [xr + 1, eave + 1]], INK);
    c.save(); c.beginPath(); c.moveTo(xl, eave); c.lineTo(mid, rTop); c.lineTo(xr, eave); c.closePath(); c.clip();
    const rb = [P[2], P[3], P[3], P[4]], rh = (eave - rTop) / 4;
    for (let i = 0; i < 4; i++) box(c, xl, eave - (i + 1) * rh, xr - xl, rh + 1, rb[i]);
    for (let i = 1; i < 4; i++) checker(c, xl, eave - i * rh - 1, xr - xl, 2, rb[i], 0, 2);
    c.restore();
    // (the slopes' edges: lit up the left, shaded down the right; the ridge cap, a gold ball)
    c.lineCap = 'butt'; c.lineWidth = 3;
    c.strokeStyle = P[5]; c.beginPath(); c.moveTo(xl + 3, eave - 1); c.lineTo(mid, rTop + 2); c.stroke();
    c.strokeStyle = P[1]; c.beginPath(); c.moveTo(mid, rTop + 2); c.lineTo(xr - 3, eave - 1); c.stroke();
    ballAt(c, mid, rTop - 4, 4, '#F0C840');
    // (the fascia: a chrome band along the eave, lit along its top, shaded under; bulbs along it)
    box(c, xl - 1, eave - 1, xr - xl + 2, 10, INK); box(c, xl, eave, xr - xl, 8, CHROME[3]); box(c, xl, eave, xr - xl, 2, CHROME[5]); box(c, xl, eave + 6, xr - xl, 2, CHROME[1]);
    for (let k = xl + 6; k < xr - 4; k += 12) box(c, k, eave + 3, 2, 2, lit() ? '#FFF3B0' : '#C8A848');
    board(c, mid, eave - 13, 'MONORAIL', '#0F172A', '#7DD3FC', 7, 4, false, 'chrome');
  }
  // (the signal at the first station, on a bracket off its corner: green, then red as the next one comes; how long to go)
  if (inView(state, m.a - 180, m.a + 60)) {
    const wait = m.out ? 0 : Math.ceil((m.period - m.t) / 60);
    const red = m.out || m.t > m.period - 70, sy = m.y - MONO_H - 52;
    box(c, m.a - 1, sy + 13, 10, 6, INK); box(c, m.a, sy + 14, 8, 4, CHROME[4]);
    box(c, m.a + 7, sy - 1, 32, 44, INK); box(c, m.a + 8, sy, 30, 42, '#0F172A'); box(c, m.a + 8, sy, 30, 2, '#334155'); box(c, m.a + 36, sy, 2, 42, '#020617');
    ballAt(c, m.a + 23, sy + 10, 5, red ? '#EF4444' : '#3F3F46');
    ballAt(c, m.a + 23, sy + 24, 5, !red ? '#22C55E' : '#3F3F46');
    steppedGlow(c, m.a + 23, red ? sy + 10 : sy + 24, 14, red ? '#EF4444' : '#22C55E', 0.3, 0.04, 3);
    label(c, m.out ? 'NOW' : `${wait}`, m.a + 23, sy + 38, '#FDE047', 6);
  }
};

/** The track's beam (world): drawn behind (the trains run on it, he walks it): the pylons under it (concrete, standing
 *  on the walk or down in the holes, their sides going back), the stations' pylons; its top going back (lit at its
 *  front lip: stand on it), its underside when he's under it, its deep face banded, the joints. `holes`: [a, b] spans
 *  with no walk under them (the pylons there go on down). */
export const drawTrack = (c: Ctx, state: GameState, m: Mono, legs: number[], holes: [number, number][] = []) => {
  if (!inView(state, m.a - 240, m.b + 240)) return;
  const eye = viewOf(state).eye, L = Math.max(m.a, state.camera.x - 140), R = Math.min(m.b, state.camera.x + CANVAS_WIDTH + 140);
  for (const x0 of [m.a - 180, m.b]) if (inView(state, x0 - 60, x0 + 240)) for (const sx of [x0 + 36, x0 + 144]) pylon(c, eye, sx, m.y + BEAM, GY, false, 11);
  for (const x of legs) if (inView(state, x - 60, x + 60)) pylon(c, eye, x, m.y + BEAM, GY, holes.some(([a, b]) => x > a && x < b));
  if (R > L) {
    if (eye.y > m.y + BEAM) flatBack(c, eye, L, R, m.y + BEAM, 1, BEAM_D, CHROME[1]);
    flatBack(c, eye, L, R, m.y, 1, BEAM_D, CHROME[2]); flatBack(c, eye, L, R, m.y, 1, 0.97, CHROME[3]);
  }
  box(c, m.a, m.y - 2, m.b - m.a, BEAM + 3, INK);
  box(c, m.a, m.y, m.b - m.a, BEAM, CHROME[3]);
  box(c, m.a, m.y + 5, m.b - m.a, 5, CHROME[4]); box(c, m.a, m.y + 5, m.b - m.a, 1, CHROME[5]);
  box(c, m.a, m.y + 14, m.b - m.a, 2, CHROME[2]);
  box(c, m.a, m.y + 19, m.b - m.a, BEAM - 19, CHROME[2]); checker(c, m.a, m.y + 17, m.b - m.a, 2, CHROME[2], 0, 2);
  box(c, m.a, m.y + BEAM - 3, m.b - m.a, 3, CHROME[1]);
  box(c, m.a, m.y, m.b - m.a, 2, LIP[2]); box(c, m.a, m.y, m.b - m.a, 1, LIP[3]);
  for (let x = Math.ceil(L / 40) * 40; x < R; x += 40) {
    if (x % 160 === 0) { box(c, x, m.y + 3, 1, BEAM - 4, INK); box(c, x + 1, m.y + 3, 1, BEAM - 4, CHROME[5]); box(c, x - 6, m.y + 20, 14, 6, CHROME[1]); box(c, x - 5, m.y + 21, 12, 1, CHROME[4]); }
    else { box(c, x, m.y + 8, 2, 2, CHROME[1]); box(c, x, m.y + 22, 2, 2, CHROME[1]); }
  }
  box(c, m.a, m.y + BEAM, m.b - m.a, 1, INK);
};
