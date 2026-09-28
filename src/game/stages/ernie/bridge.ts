// The Golden Gate, coming apart:
//
//   spans:    sections of the deck that give way as he gets near them (a groan,
//             the deck sagging and cracking, then down it goes into the bay):
//             sooner and wider the further out he gets. One's already gone.
//   traffic:  cars on the far lane going over the side when it crumbles under
//             them, and blowing up on the steel underneath. Just scenery.
//   wrecks:   cars stopped on the deck, burning. When he's near, the people in
//             them get out on fire, screaming, running about. They're no threat
//             to anyone; he can put them out of their misery.
//   the drop: fall through a gap and that's it: he's got no say in it any more,
//             it's a long way down, he screams the whole way, and the water at
//             the bottom might as well be concrete.

import type { Block, Enemy } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { shakeScreen } from '../../core/state';
import { playSound } from '../../platform/audio';
import { say, MEATHEAD_VOICE } from '../../platform/speech';
import { makeKindEnemy } from '../../enemies/kinds';
import { killPlayer } from '../../player/player';
import { GROUND_Y, CANVAS_WIDTH } from '../../../constants';
import { COURSE } from './course';
import { BURNING_SCREAMS } from '../../enemies/kinds/ernie';

export interface SpanState { t: number; open: boolean; block: Block | null; drop: number }
export interface BgCar { x: number; y: number; vy: number; rot: number; color: string; t: number; state: 'driving' | 'tipping' | 'falling' | 'boom'; boomAt: number }
export interface Plunge { t: number; x: number; line: string; lineT: number; splashAt: number }
export interface Bridge {
  spans: SpanState[];
  cars: BgCar[];
  carTimer: number;
  /** Wrecks whose people have got out. */
  emptied: boolean[];
  /** Burning people we've already given a send-off (by id). */
  mourned: Set<string>;
  /** What each burning soul is screaming right now. */
  screams: Map<string, { text: string; t: number }>;
  plunge: Plunge | null;
}

/** A span's warning (sagging, cracking, groaning) before it goes. */
export const SPAN_WARN = 50;
/** How far down the bay is from the deck. */
export const DROP_TO_WATER = 2300;
/** Where the far lane is (cars drive on it behind you) and the steel under the deck they blow up on. */
export const FAR_LANE = -26, UNDER_STEEL = 150;
const MERCY = ['PUT OUT OF HIS MISERY!', 'MERCY!', "YOU'RE WELCOME!", 'EXTINGUISHED!'];

export const createBridge = (state: GameState): Bridge => {
  const spans = COURSE.spans.map((s, i) => {
    if (s.open) return { t: SPAN_WARN, open: true, block: null, drop: 999 };
    const block: Block = { x: s.x, y: GROUND_Y, w: s.w, h: 1400, type: 'ground', hidden: true, tag: `span-${i}` };
    state.blocks.push(block);
    return { t: 0, open: false, block, drop: 0 };
  });
  return { spans, cars: [], carTimer: 60, emptied: COURSE.wrecks.map(() => false), mourned: new Set(), screams: new Map(), plunge: null };
};

export const onBridge = (x: number) => x >= COURSE.bridge.x1 - 200 && x <= COURSE.bridge.x2 + 100;

export const updateBridge = (ctx: FrameContext, br: Bridge, controls: Controls): Controls => {
  const { state } = ctx;
  const p = state.player;
  const px = p.pos.x + p.width / 2;
  if (br.plunge) return updatePlunge(ctx, br.plunge);
  if (!onBridge(px) && !onBridge(state.camera.x + CANVAS_WIDTH / 2)) return controls;
  updateSpans(ctx, br);
  updateCars(state, br);
  updateWrecks(ctx, br);
  // Through a gap in the deck: over the side he goes
  if (onBridge(px) && !p.isGrounded && p.pos.y > GROUND_Y + 30 && state.deathTimer <= 0) {
    br.plunge = { t: 0, x: px, line: '', lineT: 0, splashAt: 0 };
    return updatePlunge(ctx, br.plunge);
  }
  return controls;
};

const updateSpans = (ctx: FrameContext, br: Bridge) => {
  const { state } = ctx;
  const px = state.player.pos.x + state.player.width / 2;
  COURSE.spans.forEach((s, i) => {
    const st = br.spans[i];
    if (st.open) { st.drop += 1; return; }
    if (st.t === 0) {
      if (px > s.x - s.trigger && px < s.x + s.w) { st.t = 1; playSound('thunder'); }
      return;
    }
    st.t++;
    if (state.frame % 4 === 0) shakeScreen(state, 4, 3);
    if (state.frame % 3 === 0) state.particles.push({ pos: { x: s.x + Math.random() * s.w, y: GROUND_Y + 2 }, vel: { x: (Math.random() - 0.5) * 1, y: 1 + Math.random() * 2 }, life: 30, color: Math.random() < 0.5 ? '#52525B' : '#A8A29E', size: 2 + Math.random() * 3 });
    if (st.t >= SPAN_WARN) {
      st.open = true;
      if (st.block) { const blk = st.block; state.blocks = state.blocks.filter(b => b !== blk); }
      shakeScreen(state, 22, 9);
      playSound('nuke');
      for (let k = 0; k < 22; k++) state.particles.push({ pos: { x: s.x + Math.random() * s.w, y: GROUND_Y + 6 }, vel: { x: (Math.random() - 0.5) * 3, y: 2 + Math.random() * 6 }, life: 50, color: k % 3 ? '#3F3F46' : '#C0392B', size: 4 + Math.random() * 6 });
    }
  });
};

const CAR_COLORS = ['#2563EB', '#DC2626', '#F8FAFC', '#16A34A', '#FACC15', '#18181B', '#9333EA', '#F97316'];

/** The far lane: a car comes along, the lane goes under it, it tips over the side, falls and blows up on the steel underneath. */
const updateCars = (state: GameState, br: Bridge) => {
  if (--br.carTimer <= 0) {
    br.carTimer = 110 + Math.floor(Math.random() * 90);
    const x = state.camera.x + 120 + Math.random() * (CANVAS_WIDTH - 240);
    if (x > COURSE.bridge.x1 && x < COURSE.bridge.x2 - 100) br.cars.push({ x: x - 160, y: GROUND_Y + FAR_LANE, vy: 0, rot: 0, color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)], t: 0, state: 'driving', boomAt: 0 });
  }
  for (const c of br.cars) {
    c.t++;
    if (c.state === 'driving') { c.x += 4; if (c.t > 40) { c.state = 'tipping'; c.t = 0; } }
    else if (c.state === 'tipping') { c.x += 1.5; c.rot += 0.05; c.y += 1; if (c.t > 18) { c.state = 'falling'; c.t = 0; } }
    else if (c.state === 'falling') {
      c.vy += 0.5; c.y += c.vy; c.rot += 0.07; c.x += 0.8;
      if (c.y > GROUND_Y + UNDER_STEEL) {
        c.state = 'boom'; c.t = 0; c.boomAt = state.frame;
        playSound('ignite');
        for (let k = 0; k < 24; k++) state.particles.push({ pos: { x: c.x, y: c.y }, vel: { x: (Math.random() - 0.5) * 9, y: -2 - Math.random() * 7 }, life: 30 + Math.random() * 20, color: ['#F97316', '#FDE047', '#1C1917', c.color][k % 4], size: 4 + Math.random() * 6 });
      }
    }
  }
  br.cars = br.cars.filter(c => !(c.state === 'boom' && c.t > 60));
};

const updateWrecks = (ctx: FrameContext, br: Bridge) => {
  const { state, fx } = ctx;
  const px = state.player.pos.x + state.player.width / 2;
  COURSE.wrecks.forEach((w, i) => {
    if (br.emptied[i] || Math.abs(px - w.x) > 520) return;
    br.emptied[i] = true;
    // Out they come, on fire
    for (let k = 0; k < w.people; k++) {
      const e = makeKindEnemy('burning', w.x + (k ? 40 : -30), GROUND_Y);
      e.facing = k % 2 ? 1 : -1;
      e.homeX = w.x + k * 17;
      state.enemies.push(e);
    }
    playSound('screams');
  });
  for (const e of state.enemies) {
    if (e.kind !== 'burning') continue;
    // Screaming
    let s = br.screams.get(e.id);
    if (!s || --s.t <= 0) { s = { text: Math.random() < 0.6 ? BURNING_SCREAMS[Math.floor(Math.random() * BURNING_SCREAMS.length)] : '', t: 50 + Math.floor(Math.random() * 40) }; br.screams.set(e.id, s); }
    // Put out of his misery
    if (e.health <= 0 && !br.mourned.has(e.id)) {
      br.mourned.add(e.id);
      fx.spawnDamageNumber({ x: e.pos.x - 40, y: e.pos.y - 40 }, MERCY[Math.floor(Math.random() * MERCY.length)], true, '#FDE68A');
    }
  }
};

/** What a burning soul's screaming right now (for the draw). */
export const screamOf = (br: Bridge, e: Enemy) => (e.health > 0 ? br.screams.get(e.id)?.text ?? '' : '');

// ---------------------------------------------------------------------------
// Over the side
// ---------------------------------------------------------------------------

const PLUNGE_LINES: [number, string][] = [[4, 'AAAAAAAAAAAAAAHHHHHHH'], [72, 'I REGRET NOTHIIIIIIING']];

const updatePlunge = (ctx: FrameContext, pl: Plunge): Controls => {
  const { state, fx } = ctx;
  const p = state.player;
  pl.t++;
  if (pl.lineT > 0) pl.lineT--;
  p.inCutscene = true;
  p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false;
  // Tumbling, limbs everywhere
  p.vel.x *= 0.96;
  p.vel.y = Math.min(p.vel.y, 15);
  // The camera goes down with him
  state.cameraOverride = null;
  state.camera.y = p.pos.y - 220;
  state.cameraRestY = state.camera.y;
  for (const [at, text] of PLUNGE_LINES) {
    if (pl.t !== at) continue;
    pl.line = text; pl.lineT = 70;
    say(text, MEATHEAD_VOICE, 'urgent', { onShow: () => {}, onHide: () => {} });
  }
  const water = GROUND_Y + DROP_TO_WATER;
  if (p.pos.y + p.height >= water && pl.splashAt === 0 && state.deathTimer <= 0) {
    pl.splashAt = state.frame;
    playSound('tsunami');
    shakeScreen(state, 30, 12);
    for (let k = 0; k < 40; k++) state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: water }, vel: { x: (Math.random() - 0.5) * 12, y: -3 - Math.random() * 14 }, life: 50 + Math.random() * 30, color: k % 4 === 0 ? '#B91C1C' : k % 2 ? '#E0F2FE' : '#93C5FD', size: 4 + Math.random() * 7 });
    p.hidden = true;
    const deaths = ['LIKE HITTING CONCRETE', 'SURFACE TENSION: 1, MEATHEAD: 0', 'BELLY FLOP OF THE CENTURY', 'THE BAY SAYS NO'];
    killPlayer(ctx, deaths[Math.floor(Math.random() * deaths.length)], false);
    fx.spawnDeathShower({ x: p.pos.x, y: water - 20 }, 0, 2);
  }
  return { ...NO_CONTROLS };
};
