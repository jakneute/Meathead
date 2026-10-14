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
import { INK, at, poly, checker, mix, pixelBlob, steppedGlow, viewOf, CHROME, RUBBER, COPPER, CONCRETE, PINK, LIP } from './paint';

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

const drawTrain = (c: Ctx, m: Mono) => {
  const top = m.y - MONO_H, x = m.x, L = m.len, H = MONO_H - 10;
  c.save(); c.beginPath(); c.rect(m.a, top - 20, m.b - m.a, MONO_H + 40); c.clip();
  // The body: a long white capsule, banded top to bottom (lit roof, shaded belly), a pink stripe, a bubble nose
  c.fillStyle = INK; c.beginPath(); c.roundRect(x - 2, top - 2, L + 4, H + 4, [10, 30, 6, 6]); c.fill();
  const bands = ['#FFFFFF', '#F4F6FA', '#E4EAF4', '#C8D0DE', '#A0AABE'];
  c.save(); c.beginPath(); c.roundRect(x, top, L, H, [8, 28, 4, 4]); c.clip();
  for (let i = 0; i < 5; i++) box(c, x, top + (i * H) / 5, L, H / 5 + 1, bands[i]);
  checker(c, x, top + H * 0.4 - 1, L, 2, bands[2], 0, 2); checker(c, x, top + H * 0.8 - 1, L, 2, bands[4], 0, 2);
  box(c, x, top + H - 18, L, 7, PINK[3]); box(c, x, top + H - 18, L, 2, PINK[5]); box(c, x, top + H - 13, L, 2, PINK[1]);
  // (the windows, riders in them: heads, a hand up)
  for (let wx = x + 18; wx < x + L - 56; wx += 34) {
    box(c, wx - 1, top + 11, 26, 18, INK); box(c, wx, top + 12, 24, 16, '#0EA5E9'); box(c, wx, top + 12, 24, 5, '#7DD3FC'); box(c, wx + 2, top + 13, 5, 3, '#E0F2FE');
    const k = Math.abs(Math.floor((wx - x) / 34)) % 4;
    const skin = ['#B07850', '#6E4426', '#E4C0A8', '#C8946A'][k];
    c.fillStyle = skin; c.beginPath(); c.arc(wx + 15, top + 22, 4, 0, Math.PI * 2); c.fill(); box(c, wx + 11, top + 25, 8, 3, ['#E8659E', '#22BCAC', '#F0C840', '#9470C4'][k]);
    if (k === 1) box(c, wx + 19, top + 14, 2, 6, skin);
  }
  c.restore();
  // (the bubble nose: glass, a glint; the headlight)
  c.fillStyle = INK; c.beginPath(); c.ellipse(x + L - 26, top + 20, 18, 13, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#0EA5E9'; c.beginPath(); c.ellipse(x + L - 26, top + 20, 16, 11, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#7DD3FC'; c.beginPath(); c.ellipse(x + L - 30, top + 16, 10, 5, 0, 0, Math.PI * 2); c.fill();
  box(c, x + L - 34, top + 13, 4, 2, '#FFFFFF');
  ballAt(c, x + L - 6, top + MONO_H - 24, 4, '#FDE68A');
  steppedGlow(c, x + L + 4, top + MONO_H - 24, 26, '#FDE68A', 0.3, 0.03, 3);
  // (the roof: its lip lit (stand on it), a fin, the bogie skirt over the beam)
  box(c, x + 8, top, L - 40, 2, LIP[3]);
  poly(c, [[x + 6, top + 2], [x + 20, top - 12], [x + 34, top + 2]], INK); poly(c, [[x + 9, top + 1], [x + 20, top - 9], [x + 31, top + 1]], PINK[3]);
  box(c, x + 10, m.y - 12, L - 30, 10, INK); box(c, x + 11, m.y - 11, L - 32, 8, CHROME[2]); box(c, x + 11, m.y - 11, L - 32, 2, CHROME[4]);
  for (let k = x + 20; k < x + L - 30; k += 30) box(c, k, m.y - 8, 6, 4, CHROME[1]);
  c.font = '7px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = PINK[1]; c.fillText('EXPRESS', x + L / 2 - 10, top + MONO_H - 32); c.textAlign = 'left';
  c.restore();
};

/** A box's side going back (the sheds'): in steps darker back, inked at its far edge. */
const sideBackG = (c: Ctx, eye: { x: number; y: number }, e: number, top: number, bottom: number, d: number, R: string[]) => {
  for (let i = 0; i < 3; i++) { const a = 1 - ((1 - d) * i) / 3, b = 1 - ((1 - d) * (i + 1)) / 3; poly(c, [at(eye, e, top, a), at(eye, e, top, b), at(eye, e, bottom, b), at(eye, e, bottom, a)], R[2 - i]); }
  const [x1, t1] = at(eye, e, top, d), [, b1] = at(eye, e, bottom, d);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(e, top); c.lineTo(x1, t1); c.lineTo(x1, b1); c.stroke();
};

const drawSheds = (c: Ctx, state: GameState, m: Mono, eye: { x: number; y: number }) => {
  const top = m.y - MONO_H - 34;
  for (const [x0, x1, first] of [[m.a - 180, m.a, true], [m.b, m.b + 180, false]] as const) {
    if (!inView(state, x0 - 40, x1 + 40)) continue;
    // The shed: a googie box (its side going back), a boomerang roof, a porthole, the dark mouth the trains run in and
    // out of, its name
    const W2 = ['#5A6680', '#8A96B0', '#C4CCDC', '#E8EEF6', '#FFFFFF'];
    if (eye.x > x1 + 1) sideBackG(c, eye, x1, top, m.y + 6, 0.92, W2);
    else if (eye.x < x0 - 1) sideBackG(c, eye, x0, top, m.y + 6, 0.92, W2);
    box(c, x0, top, x1 - x0, m.y - top + 6, INK);
    box(c, x0 + 2, top + 2, x1 - x0 - 4, m.y - top + 2, W2[3]);
    box(c, x0 + 2, top + 2, 4, m.y - top + 2, W2[4]); box(c, x1 - 8, top + 2, 6, m.y - top + 2, W2[2]); checker(c, x1 - 12, top + 2, 4, m.y - top + 2, W2[2], 0, 2);
    box(c, x0 + 2, m.y - 10, x1 - x0 - 4, 12, W2[1]); box(c, x0 + 2, m.y - 10, x1 - x0 - 4, 2, W2[2]);
    // (the mouth: dark, at the track's end of it)
    const mx = first ? x1 - 60 : x0 + 2;
    box(c, mx, m.y - MONO_H - 4, 58, MONO_H + 4, '#0A0A14'); box(c, mx, m.y - MONO_H - 4, 58, 3, INK);
    box(c, mx + (first ? 0 : 54), m.y - MONO_H - 4, 4, MONO_H + 4, W2[1]);
    // (a porthole)
    const ph = first ? x0 + 40 : x1 - 40;
    c.fillStyle = INK; c.beginPath(); c.arc(ph, top + 52, 13, 0, Math.PI * 2); c.fill(); c.fillStyle = CHROME[4]; c.beginPath(); c.arc(ph, top + 52, 12, 0, Math.PI * 2); c.fill(); c.fillStyle = '#0EA5E9'; c.beginPath(); c.arc(ph, top + 52, 9, 0, Math.PI * 2); c.fill(); box(c, ph - 5, top + 46, 4, 3, '#E0F2FE');
    // (the roof: a boomerang, pink, lit along its top)
    const mid = (x0 + x1) / 2;
    poly(c, [[x0 - 22, top + 8], [mid, top - 24], [x1 + 22, top + 8], [mid, top - 8]], INK);
    poly(c, [[x0 - 19, top + 6], [mid, top - 21], [x1 + 19, top + 6], [mid, top - 9]], PINK[3]);
    poly(c, [[x0 - 19, top + 6], [mid, top - 9], [x1 + 19, top + 6], [mid, top - 5]], PINK[1]);
    poly(c, [[x0 - 19, top + 6], [mid, top - 21], [mid, top - 18], [x0 - 15, top + 5]], PINK[5]);
    c.font = '8px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = W2[4]; c.fillText('MONORAIL', mid + 1, top + 27); c.fillStyle = '#0F172A'; c.fillText('MONORAIL', mid, top + 26); c.textAlign = 'left';
  }
  // (the signal at the first shed: green, then red as the next one comes; how long to go)
  if (inView(state, m.a - 180, m.a + 40)) {
    const wait = m.out ? 0 : Math.ceil((m.period - m.t) / 60);
    const red = m.out || m.t > m.period - 70;
    box(c, m.a + 3, top - 5, 32, 42, INK); box(c, m.a + 4, top - 4, 30, 40, '#0F172A'); box(c, m.a + 4, top - 4, 30, 2, '#334155');
    ballAt(c, m.a + 19, top + 6, 5, red ? '#EF4444' : '#3F3F46');
    ballAt(c, m.a + 19, top + 20, 5, !red ? '#22C55E' : '#3F3F46');
    steppedGlow(c, m.a + 19, red ? top + 6 : top + 20, 14, red ? '#EF4444' : '#22C55E', 0.3, 0.04, 3);
    label(c, m.out ? 'NOW' : `${wait}`, m.a + 19, top + 34, '#FDE047', 6);
  }
};

/** The track's beam (world): drawn behind (the trains run on it, he walks it): its top going back (lit at its front
 *  lip: stand on it), its face banded, rivets; the pylons under it (concrete, T-capped); the sheds' stilts. */
export const drawTrack = (c: Ctx, state: GameState, m: Mono, legs: number[]) => {
  if (!inView(state, m.a - 220, m.b + 220)) return;
  const eye = viewOf(state).eye, L = Math.max(m.a, state.camera.x - 140), R = Math.min(m.b, state.camera.x + CANVAS_WIDTH + 140);
  for (const x0 of [m.a - 180, m.b]) for (const sx of [x0 + 20, x0 + 154]) { box(c, sx - 1, m.y + 6, 10, 900, INK); box(c, sx, m.y + 6, 8, 900, CHROME[2]); box(c, sx, m.y + 6, 2, 900, CHROME[4]); }
  for (const x of legs) {
    if (!inView(state, x - 30, x + 30)) continue;
    box(c, x - 10, m.y + 18, 20, 900, INK); box(c, x - 9, m.y + 18, 18, 900, CONCRETE[3]); box(c, x - 9, m.y + 18, 4, 900, CONCRETE[4]); box(c, x + 4, m.y + 18, 5, 900, CONCRETE[2]); checker(c, x + 1, m.y + 18, 3, 900, CONCRETE[2], 0, 2);
    poly(c, [[x - 28, m.y + 15], [x + 28, m.y + 15], [x + 12, m.y + 30], [x - 12, m.y + 30]], INK);
    poly(c, [[x - 26, m.y + 16], [x + 26, m.y + 16], [x + 11, m.y + 29], [x - 11, m.y + 29]], CONCRETE[3]);
    box(c, x - 26, m.y + 16, 52, 2, CONCRETE[5]);
  }
  if (R > L) { flatBack(c, eye, L, R, m.y, 1, 0.94, CHROME[2]); flatBack(c, eye, L, R, m.y, 1, 0.975, CHROME[3]); }
  box(c, m.a, m.y - 2, m.b - m.a, 20, INK);
  box(c, m.a, m.y, m.b - m.a, 16, CHROME[3]);
  box(c, m.a, m.y + 4, m.b - m.a, 4, CHROME[4]);
  box(c, m.a, m.y + 11, m.b - m.a, 5, CHROME[2]);
  box(c, m.a, m.y, m.b - m.a, 2, LIP[2]); box(c, m.a, m.y, m.b - m.a, 1, LIP[3]);
  for (let x = Math.ceil(L / 40) * 40; x < R; x += 40) { box(c, x, m.y + 6, 2, 2, CHROME[1]); box(c, x, m.y + 12, 1, 4, CHROME[1]); }
  box(c, m.a, m.y + 16, m.b - m.a, 2, INK);
};
