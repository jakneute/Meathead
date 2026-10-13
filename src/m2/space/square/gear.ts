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
// Drawing (world space; only what's in view)

const inView = (state: GameState, a: number, b: number) => b > state.camera.x - 100 && a < state.camera.x + CANVAS_WIDTH + 100;

export const drawGearBack = (c: Ctx, state: GameState, g: Gear) => {
  const f = state.frame;
  for (const b of g.belts) {
    if (!inView(state, b.x0, b.x1)) continue;
    // (the belt: grooved rubber, the grooves crawling along; steel combs at each end; arrows)
    box(c, b.x0, b.y - 2, b.x1 - b.x0, 12, '#1F2937');
    const step = 16, sh = ((f * b.v) % step + step) % step;
    c.save(); c.beginPath(); c.rect(b.x0, b.y - 2, b.x1 - b.x0, 10); c.clip();
    for (let x = b.x0 - step + sh; x < b.x1 + step; x += step) box(c, x, b.y - 2, 3, 10, '#475569');
    c.restore();
    box(c, b.x0, b.y - 3, b.x1 - b.x0, 2, '#94A3B8');
    box(c, b.x0 - 10, b.y - 4, 12, 8, '#CBD5E1'); box(c, b.x1 - 2, b.y - 4, 12, 8, '#CBD5E1');
    // (the handrails: rubber, along the back)
    box(c, b.x0 - 6, b.y - 46, b.x1 - b.x0 + 12, 6, '#0F172A');
    for (let x = b.x0; x <= b.x1; x += 120) box(c, x - 2, b.y - 42, 4, 40, '#94A3B8');
    const dir = Math.sign(b.v);
    for (let x = b.x0 + 60; x < b.x1 - 40; x += 160) { c.fillStyle = '#FDE047'; c.beginPath(); c.moveTo(x + dir * 10, b.y + 3); c.lineTo(x - dir * 4, b.y - 1); c.lineTo(x - dir * 4, b.y + 7); c.closePath(); c.fill(); }
  }
  for (const pl of g.plates) {
    if (!inView(state, pl.x, pl.x + pl.w)) continue;
    const t = platePhase(state, pl), buzz = t >= PLATE.buzz && t < PLATE.live, live = t >= PLATE.live;
    // (the plate: copper, riveted, with hazard stripes along its edges; its coil posts each end)
    box(c, pl.x, pl.y - 1, pl.w, 6, live ? '#FDE68A' : buzz ? '#F59E0B' : '#B45309');
    for (let x = pl.x + 6; x < pl.x + pl.w - 4; x += 14) box(c, x, pl.y + 1, 2, 2, '#78350F');
    for (const ex of [pl.x - 8, pl.x + pl.w]) {
      box(c, ex, pl.y - 36, 8, 36, '#475569'); box(c, ex + 1, pl.y - 36, 2, 36, '#94A3B8');
      for (let k = 0; k < 4; k++) box(c, ex - 2, pl.y - 34 + k * 7, 12, 3, '#B45309');
      c.fillStyle = live || buzz ? '#E0F2FE' : '#64748B'; c.beginPath(); c.arc(ex + 4, pl.y - 40, 5, 0, Math.PI * 2); c.fill();
    }
  }
  for (const pd of g.pads) {
    if (!inView(state, pd.x, pd.x + pd.w)) continue;
    // (the grille in the floor, the chevrons round it, the countdown lights on their post)
    box(c, pd.x, pd.y - 2, pd.w, 6, '#334155');
    for (let x = pd.x + 4; x < pd.x + pd.w - 2; x += 8) box(c, x, pd.y - 1, 4, 3, '#0F172A');
    box(c, pd.x - 6, pd.y - 3, 6, 6, '#FACC15'); box(c, pd.x + pd.w, pd.y - 3, 6, 6, '#FACC15');
    const px = pd.x + pd.w + 14;
    box(c, px, pd.y - 64, 6, 64, '#64748B');
    box(c, px - 8, pd.y - 92, 22, 32, '#0F172A');
    let lit = 0;
    if (pd.mode === 'step') lit = Math.min(3, Math.floor(pd.on / (PAD.fuse / 3)));
    else { const t = padPhase(state, pd); lit = t > PAD.period - 48 ? Math.min(3, Math.floor((t - (PAD.period - 48)) / 16) + 1) : 0; }
    for (let k = 0; k < 3; k++) { c.fillStyle = k < lit ? '#F87171' : '#3F3F46'; c.beginPath(); c.arc(px + 3, pd.y - 84 + k * 9, 3, 0, Math.PI * 2); c.fill(); }
  }
  for (const s of g.saucers) {
    const at = sauAt(state, s);
    if (!inView(state, at.x - s.w, at.x + s.w)) continue;
    // (its arm, down out of sight behind: the anti-gravity)
    box(c, at.x - 3, at.y + 10, 6, 900, '#334155');
  }
};

/** What's in front of him: the trains and their sheds, the saucers, the jets. */
export const drawGearFront = (c: Ctx, state: GameState, g: Gear) => {
  const f = state.frame;
  for (const s of g.saucers) {
    const at = sauAt(state, s);
    if (!inView(state, at.x - s.w, at.x + s.w)) continue;
    // (the saucer: a lit chrome rim to stand on, a dome under, its lights chasing)
    c.fillStyle = '#1A0B06'; c.beginPath(); c.ellipse(at.x, at.y + 6, s.w / 2 + 2, 9, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#94A3B8'; c.beginPath(); c.ellipse(at.x, at.y + 6, s.w / 2, 7, 0, 0, Math.PI * 2); c.fill();
    box(c, at.x - s.w / 2 + 4, at.y, s.w - 8, 3, '#F1F5F9');
    c.fillStyle = '#475569'; c.beginPath(); c.ellipse(at.x, at.y + 12, s.w / 4, 6, 0, 0, Math.PI); c.fill();
    for (let k = 0; k < 5; k++) { const on = (Math.floor(f / 8) + k) % 5 === 0; c.fillStyle = on ? '#F472B6' : '#7DD3FC'; c.beginPath(); c.arc(at.x - s.w / 2 + 10 + (k * (s.w - 20)) / 4, at.y + 7, 2, 0, Math.PI * 2); c.fill(); }
  }
  for (const pd of g.pads) {
    const age = state.frame - pd.fired;
    if (age < 0 || age > 30 || !inView(state, pd.x, pd.x + pd.w)) continue;
    // (the jet: white-hot at the grille, a column of exhaust)
    const hgt = 200 * Math.min(1, age / 4) * (1 - age / 34), w = pd.w * (0.7 + age * 0.01);
    c.fillStyle = 'rgba(254, 243, 199, 0.85)'; c.fillRect(pd.x + pd.w / 2 - w / 2, pd.y - hgt, w, hgt);
    c.fillStyle = 'rgba(255, 255, 255, 0.9)'; c.fillRect(pd.x + pd.w / 2 - w / 4, pd.y - hgt * 0.7, w / 2, hgt * 0.7);
    for (let k = 0; k < 4; k++) { c.fillStyle = 'rgba(203, 213, 225, 0.6)'; c.beginPath(); c.arc(pd.x + pd.w / 2 + Math.sin(age + k * 2) * 20, pd.y - hgt + k * 16, 14 + age * 0.6, 0, Math.PI * 2); c.fill(); }
  }
  for (const pl of g.plates) {
    if (!plateLive(state, pl) || !inView(state, pl.x, pl.x + pl.w)) continue;
    // (the arcs: jagged, jumping about, from post to post and up off the plate)
    c.strokeStyle = '#E0F2FE'; c.lineWidth = 2;
    for (let k = 0; k < 3; k++) {
      c.beginPath(); c.moveTo(pl.x - 4, pl.y - 40);
      const n = 8;
      for (let i = 1; i <= n; i++) { const x = pl.x - 4 + ((pl.w + 8) * i) / n, y = pl.y - 40 + (i === n ? 0 : Math.sin(f * 1.7 + i * 2.3 + k * 4) * 12 + 14 * Math.sin((i / n) * Math.PI)); c.lineTo(x, y); }
      c.stroke();
    }
    c.strokeStyle = '#7DD3FC'; c.lineWidth = 1;
    for (let x = pl.x + 8; x < pl.x + pl.w; x += 22) { c.beginPath(); c.moveTo(x, pl.y); for (let y = pl.y; y > pl.y - PLATE.arcH; y -= 9) c.lineTo(x + Math.sin(f * 2.1 + y + x) * 5, y); c.stroke(); }
  }
  for (const m of g.monos) {
    if (m.out && inView(state, m.x, m.x + m.len)) drawTrain(c, m, f);
    drawSheds(c, state, m);
  }
};

const drawTrain = (c: Ctx, m: Mono, f: number) => {
  const top = m.y - MONO_H, x = m.x, L = m.len;
  c.save(); c.beginPath(); c.rect(m.a, top - 20, m.b - m.a, MONO_H + 40); c.clip();
  // (the body: a long white capsule, a pink stripe, a bubble nose, windows with riders in them)
  c.fillStyle = '#1A0B06'; c.beginPath(); c.roundRect(x - 2, top - 2, L + 4, MONO_H - 6, [10, 30, 6, 6]); c.fill();
  c.fillStyle = '#F8FAFC'; c.beginPath(); c.roundRect(x, top, L, MONO_H - 10, [8, 28, 4, 4]); c.fill();
  box(c, x + 4, top + 2, L - 30, 3, '#FFFFFF');
  box(c, x, top + MONO_H - 26, L - 6, 6, '#EC4899');
  for (let wx = x + 18; wx < x + L - 50; wx += 34) { box(c, wx, top + 12, 24, 16, '#0EA5E9'); box(c, wx + 2, top + 14, 6, 6, '#BAE6FD'); box(c, wx + 12, top + 18, 7, 10, ['#B07850', '#6E4426', '#E4C0A8'][Math.abs(Math.floor(wx / 34)) % 3]); }
  c.fillStyle = '#0EA5E9'; c.beginPath(); c.ellipse(x + L - 24, top + 20, 16, 11, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#FDE68A'; c.beginPath(); c.arc(x + L - 6, top + MONO_H - 22, 4, 0, Math.PI * 2); c.fill();
  // (the bogie over the beam)
  box(c, x + 10, m.y - 12, L - 30, 10, '#475569');
  label(c, 'EXPRESS', x + L / 2 - 10, top + MONO_H - 30, '#BE185D', 7);
  c.restore();
  void f;
};
const drawSheds = (c: Ctx, state: GameState, m: Mono) => {
  const top = m.y - MONO_H - 34;
  for (const [x0, x1, name] of [[m.a - 180, m.a, 'MONORAIL'], [m.b, m.b + 180, 'MONORAIL']] as const) {
    if (!inView(state, x0, x1)) continue;
    // (the shed: a googie box on its stilts, a boomerang roof, a round porthole, the mouth the trains go in and out of)
    box(c, x0, top, x1 - x0, m.y - top + 6, '#1A0B06');
    box(c, x0 + 2, top + 2, x1 - x0 - 4, m.y - top + 2, '#E2E8F0');
    box(c, x0 + 2, top + 2, x1 - x0 - 4, 4, '#FFFFFF');
    box(c, x0 + 2, m.y - 8, x1 - x0 - 4, 10, '#94A3B8');
    c.fillStyle = '#F472B6'; c.beginPath(); c.moveTo(x0 - 20, top + 6); c.lineTo((x0 + x1) / 2, top - 22); c.lineTo(x1 + 20, top + 6); c.lineTo((x0 + x1) / 2, top - 8); c.closePath(); c.fill();
    label(c, name, (x0 + x1) / 2, top + 26, '#0F172A', 8);
  }
  // (the signal at the first shed: green, then red as the next one comes; how long to go)
  if (inView(state, m.a - 180, m.a + 40)) {
    const wait = m.out ? 0 : Math.ceil((m.period - m.t) / 60);
    const red = m.out || m.t > m.period - 70;
    box(c, m.a + 4, top - 4, 30, 40, '#0F172A');
    c.fillStyle = red ? '#EF4444' : '#3F3F46'; c.beginPath(); c.arc(m.a + 19, top + 6, 5, 0, Math.PI * 2); c.fill();
    c.fillStyle = !red ? '#22C55E' : '#3F3F46'; c.beginPath(); c.arc(m.a + 19, top + 20, 5, 0, Math.PI * 2); c.fill();
    label(c, m.out ? 'NOW' : `${wait}`, m.a + 19, top + 33, '#FDE047', 6);
  }
};

/** The track's beam (world): drawn behind (the trains run on it, he walks it). */
export const drawTrack = (c: Ctx, state: GameState, m: Mono, legs: number[]) => {
  if (!inView(state, m.a - 200, m.b + 200)) return;
  box(c, m.a, m.y - 2, m.b - m.a, 20, '#1A0B06');
  box(c, m.a, m.y, m.b - m.a, 16, '#CBD5E1');
  box(c, m.a, m.y, m.b - m.a, 3, '#F8FAFC');
  box(c, m.a, m.y + 12, m.b - m.a, 3, '#64748B');
  // (the sheds' stilts, behind him)
  for (const x0 of [m.a - 180, m.b]) for (const sx of [x0 + 20, x0 + 154]) box(c, sx, m.y + 6, 8, 900, '#94A3B8');
  for (const x of legs) { box(c, x - 9, m.y + 18, 18, 900, '#1A0B06'); box(c, x - 7, m.y + 18, 14, 900, '#94A3B8'); box(c, x - 7, m.y + 18, 3, 900, '#E2E8F0'); box(c, x - 24, m.y + 16, 48, 8, '#64748B'); }
};
