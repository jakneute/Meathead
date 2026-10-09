// THE DINO PARK: out of the storm drain into the raptor pen of Adventure Land's fake Jurassic zoo, through the park
// and its robot dinosaurs (see kinds.ts), over the fence, and in through the temple's back door (kicked in).
//
//   the pen:      he comes out of the drain with a pebble. The PEBBLE CUTSCENE (first visit, `pebbleSeen`): the
//                 pebble flies on, over the fence; cut (full screen) to the maintenance booth: in through its window, it
//                 flips the DINOSAUR MODE switch, FRIENDLY to HOSTILE. The maintenance man doesn't notice. Cut back: The raptors' eyes go red. Out of the pen up the feeding platforms and over the fence.
//   the field:    the trikes charge along the ground; the boardwalks over it.
//   the volcano:  a fake one, climbed and gone down, raptors leaping up after him, pteros overhead.
//   the shop:     the gift shop's roof and the monorail track over it, or the ground under it.
//   the paddock:  the rex's (the big one): fenced in, feeding platforms to keep above it.
//   the last bit: trees, a pack of raptors, a fence to hop, the temple's back door.
//
// Backtrackable: everything here goes both ways (the pen's fence has a viewing deck outside it to climb back in by;
// the temple's back door, once it's kicked in, stays open: back through it from the temple's side, see temple/).
// Crude on purpose (the first pass): boxes and words.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Section, Said } from '../section';
import { lay, solid, ledge, teleport, hands, box, label, saidOver, speak, meatheadSays, getAdv, sectionState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import type { EnemyKind } from '../../../m1/types';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { DINO_KINDS } from './kinds';
import { buildRex, updateRex, drawRex, drawRexHud } from './rex';
import { drawPerson } from '../temple/people';
import { MEATHEAD_LANDED, MEATHEAD_RED_EYES, MAINT_OBLIVIOUS, DINO_FRIENDLY, MEATHEAD_DOOR } from './lines';

const { x0, x1 } = SECTIONS.dino;
const D = x0;
type Ctx = CanvasRenderingContext2D;
const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

// ---------------------------------------------------------------------------------------------------------------
// The layout (x from D, y up from GY)

/** The pen: its back wall (the drain's mouth in it), its fence, the feeding platforms in it, the deck outside it. */
const PEN_WALL = 30, DRAIN_Y = GY - 330, FENCE_X = D + 980, FENCE_TOP = GY - 240;
/** The maintenance booth, outside the pen (its window, the switch inside). */
const BOOTH = { x: D + 1240, w: 180, top: GY - 140, win: { x: D + 1262, y: GY - 112, w: 64, h: 44 } };
/** The paddock's fences, the last fence, the temple's back door. */
const PADDOCK_IN = D + 6100, PADDOCK_OUT = D + 8500, PADDOCK_TOP = GY - 200;
const LAST_FENCE = D + 10400, LAST_FENCE_TOP = GY - 110;
export const TEMPLE_DOOR_X = D + 10850;
/** Where he comes out, back from the temple through its back door. */
export const DINO_BACK_DOOR_X = D + 10760;

const LEDGES: [number, number, number][] = [
  // the pen's feeding platforms, the viewing deck outside it
  [D + 620, GY - 100, 130], [D + 800, GY - 185, 150], [D + 1030, GY - 120, 170],
  // boardwalks over the trike field
  [D + 1550, GY - 130, 200], [D + 1850, GY - 220, 200], [D + 2150, GY - 130, 200],
  // the monorail (one long track over the gift shop) and a ledge up to it on the far side
  [D + 4100, GY - 280, 1600], [D + 5300, GY - 150, 120],
  // the paddock: in, the feeding platforms, out
  [D + 5960, GY - 110, 120], [D + 6200, GY - 110, 140], [D + 6600, GY - 190, 160], [D + 7100, GY - 290, 180], [D + 7600, GY - 190, 160], [D + 8340, GY - 110, 140], [D + 8560, GY - 110, 120],
  // the trees on the last stretch
  [D + 9000, GY - 140, 130], [D + 9250, GY - 245, 150], [D + 9520, GY - 140, 130], [D + 9900, GY - 180, 140],
];
/** Solid things: the volcano's steps, the gift shop, the fences, the pen wall. [x, top, w] (down to the ground). */
const SOLIDS: [number, number, number, string][] = [
  [D, GY - 700, PEN_WALL, 'wall'],
  [FENCE_X, FENCE_TOP, 20, 'fence'],
  [D + 2550, GY - 100, 200, 'rock'], [D + 2750, GY - 210, 200, 'rock'], [D + 2950, GY - 320, 250, 'rock'], [D + 3200, GY - 430, 200, 'rock'],
  [D + 3400, GY - 300, 200, 'rock'], [D + 3600, GY - 170, 200, 'rock'],
  [D + 4300, GY - 150, 400, 'shop'],
  [PADDOCK_IN, PADDOCK_TOP, 20, 'fence'], [PADDOCK_OUT, PADDOCK_TOP, 20, 'fence'],
  [LAST_FENCE, LAST_FENCE_TOP, 20, 'fence'],
  [D + 10890, GY - 700, 200, 'temple'],
];

/** Who's where: [kind, x, the surface it stands on (or, a flyer, how high it flies)]. */
const ENEMIES: [keyof typeof DINO_KINDS, number, number][] = [
  // (well along the pen from where he starts in it: he's not in their jaws the moment he's back)
  ['raptor', D + 700, GY], ['raptor', D + 880, GY],
  ['trike', D + 1750, GY], ['trike', D + 2300, GY],
  ['raptor', D + 2850, GY - 210], ['raptor', D + 3300, GY - 430], ['raptor', D + 3720, GY - 170],
  ['ptero', D + 3050, GY - 560], ['ptero', D + 3500, GY - 620],
  ['raptor', D + 4950, GY], ['raptor', D + 5150, GY - 280], ['raptor', D + 5450, GY], ['ptero', D + 4600, GY - 470],
  ['ptero', D + 7900, GY - 520],
  ['raptor', D + 9300, GY], ['raptor', D + 9700, GY], ['raptor', D + 10050, GY], ['raptor', D + 9310, GY - 245], ['ptero', D + 9800, GY - 500],
];

// ---------------------------------------------------------------------------------------------------------------
// Its state

interface Pebble {
  t: number;
  /** In the world: the pebble, flying on out of the pen. */
  x: number; y: number; vx: number; vy: number;
  landedAt: number;
  /** The cut to the booth (full screen): how far faded in (0..1), and its own clock. */
  pip: number; pt: number;
  clicked: boolean; landedSaid: boolean; maintAsked: boolean; maintSaid: Said | null; maintDone: boolean; closedAt: number;
  redAt: number; done: boolean;
}
interface Dino {
  /** The robots' mode (kinds.ts reads it): hostile, and held still (a cutscene). */
  hostile: boolean; held: boolean;
  /** First visit: the pebble cutscene's been (a revisit skips it). */
  pebbleSeen: boolean;
  pebble: Pebble | null;
  /** The temple's back door: kicked in (it stays open), and the kick going on. */
  doorKicked: boolean; kick: number;
  friendlyBark: number;
}
const dinoOf = (state: GameState) => sectionState<Dino>(state, 'dino', () => ({ hostile: true, held: false, pebbleSeen: false, pebble: null, doorKicked: false, kick: 0, friendlyBark: 0 }));

let devPebble = false;

// ---------------------------------------------------------------------------------------------------------------
// The pebble cutscene

const startPebble = (state: GameState, d: Dino) => {
  const p = state.player;
  d.pebbleSeen = true; d.hostile = false; d.held = false;
  // Out of the drain's mouth, tumbling, with a gush of drain water (and the pebble, out with him, on ahead)
  p.swimming = false; p.carried = false;
  p.pos.x = D + PEN_WALL + 6; p.pos.y = DRAIN_Y; p.vel.x = 3.4; p.vel.y = -2; p.facing = 1;
  p.inCutscene = true;
  state.camera.x = Math.max(x0, p.pos.x - CANVAS_WIDTH / 2);
  d.pebble = { t: 0, x: D + PEN_WALL + 20, y: DRAIN_Y + 20, vx: 7.5, vy: -9, landedAt: -1, pip: 0, pt: 0, clicked: false, landedSaid: false, maintAsked: false, maintSaid: null, maintDone: false, closedAt: -1, redAt: -1, done: false };
  playSound('splash', 0.9); playSound('whoosh', 0.6);
  for (let i = 0; i < 40; i++) state.particles.push({ pos: { x: D + PEN_WALL + 4, y: DRAIN_Y + 10 + Math.random() * 30 }, vel: { x: 2 + Math.random() * 6, y: -2 + Math.random() * 4 }, life: 30 + Math.random() * 20, color: i % 3 ? '#7DD3FC' : '#E0F2FE', size: 2 + Math.random() * 3, isWater: true });
};

const endPebble = (state: GameState, d: Dino, skipped: boolean) => {
  const p = state.player;
  if (skipped) {
    silenceAll();
    p.pos.x = D + 200 - p.width / 2; p.pos.y = GY - p.height; p.vel.x = 0; p.vel.y = 0; p.isGrounded = true;
  }
  d.pebble = null; d.hostile = true; d.held = false;
  p.inCutscene = false;
  for (const e of state.enemies) if (e.kind?.startsWith('m2:')) e.puppet = false;
};

const PIP_OPEN_AT = 34, PEBBLE_IN = 12, PEBBLE_HIT = 50;
const runPebble = (ctx: FrameContext, d: Dino): Controls => {
  const { state } = ctx, p = state.player;
  const pb = d.pebble!;
  pb.t++;
  p.inCutscene = true;
  // (the engine holds everybody still for it: no daze stars over them for that)
  for (const e of state.enemies) if (e.kind?.startsWith('m2:')) e.puppet = true;
  if (pb.t > SKIP_AFTER) offerSkip();
  if (pb.t > SKIP_AFTER && takeSkip()) { endPebble(state, d, true); return hands(); }
  // The pebble, in the world: up and away over the fence
  pb.vy += 0.32; pb.x += pb.vx; pb.y += pb.vy;
  // Him: down, splat, up, his line
  if (pb.landedAt < 0 && pb.t > 4 && p.isGrounded) {
    pb.landedAt = pb.t; playSound('land', 1); playSound('thud', 0.8, -6); shakeScreen(state, 6, 3);
    meatheadSays(state, pick(MEATHEAD_LANDED), true, () => { pb.landedSaid = true; });
  }
  // The cut to the booth (once he's up and said his piece): the pebble in through the window, onto the switch
  if (pb.closedAt < 0 && (pb.pip > 0 || (pb.t >= PIP_OPEN_AT && pb.landedSaid) || pb.t > 220)) { pb.pip = Math.min(1, pb.pip + 0.09); if (pb.pip >= 1) pb.pt++; }
  if (pb.closedAt >= 0) pb.pip = Math.max(0, pb.pip - 0.09);
  if (pb.pt === PEBBLE_IN) playSound('glass', 0.25, 10);
  if (pb.pt === PEBBLE_HIT && !pb.clicked) {
    pb.clicked = true; playSound('click', 1); playSound('beep', 0.6, -4);
  }
  // (he doesn't look up; he says what he was going to say anyway: once Meathead's done with his)
  if (pb.clicked && !pb.maintAsked && (pb.landedSaid || pb.t > 400) && pb.pt > PEBBLE_HIT + 20) {
    pb.maintAsked = true;
    speak('m2.maint', pick(MAINT_OBLIVIOUS), s => { pb.maintSaid = s; }, true, () => { pb.maintDone = true; });
  }
  if (pb.clicked && pb.pt === PEBBLE_HIT + 30) playSound('alarm', 0.35, -6);
  if (pb.closedAt < 0 && ((pb.maintDone && pb.pt > PEBBLE_HIT + 60) || pb.pt > PEBBLE_HIT + 420)) pb.closedAt = pb.t;
  // Back in the pen: their eyes go red (they're held, looking at him, till it's over)
  if (pb.closedAt >= 0 && pb.redAt < 0 && pb.t > pb.closedAt + 12) {
    pb.redAt = pb.t; d.hostile = true; d.held = true;
    playSound('grind', 0.8, -4); playSound('beep', 0.7, 6);
    meatheadSays(state, pick(MEATHEAD_RED_EYES), true, () => { pb.done = true; });
  }
  if (pb.redAt >= 0 && (pb.done || pb.t > pb.redAt + 300)) endPebble(state, d, false);
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------


export const dino: Section = {
  id: 'dino', x0, x1,
  checkpoints: [
    { name: 'THE RAPTOR PEN', cp: 30, x: D + 200, y: GY },
    { name: 'THE VOLCANO', cp: 31, x: D + 2450, y: GY },
    { name: 'THE T. REX PADDOCK', cp: 32, x: D + 5880, y: GY },
    { name: 'THE TEMPLE FENCE', cp: 33, x: D + 8800, y: GY },
  ],
  build: (state) => {
    const n0 = state.blocks.length;
    lay(state, [{ x1: x0 - 200, y1: GY, x2: x1, y2: GY, surface: 'concrete' }]);
    for (const [x, top, w] of SOLIDS) solid(state, x, top, w, GY - top, { hidden: true, tag: 'dino' });
    for (const [x, y, w] of LEDGES) ledge(state, x, y, w, { hidden: true, tag: 'dino' });
    for (let i = n0; i < state.blocks.length; i++) state.blocks[i].hidden = true;
    for (const [k, x, y] of ENEMIES) {
      const e = makeKindEnemy(DINO_KINDS[k] as EnemyKind, x, y);
      e.facing = -1;
      state.enemies.push(e);
    }
    // (the paddock's sub-boss: rex.ts)
    buildRex(state, { x: D + 7300, inX: PADDOCK_IN, outX: PADDOCK_OUT, top: PADDOCK_TOP });
    dinoOf(state);
    // (in dev, ?adv=30 the first time: as if he'd just come down the drain)
    if (import.meta.env.DEV && !devPebble && new URLSearchParams(location.search).get('adv') === '30') {
      devPebble = true; (getAdv(state)!.s as Record<string, unknown>).dinoArrival = true;
    }
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player;
    const d = dinoOf(state);
    const s = getAdv(state)!.s as Record<string, unknown>;
    // Down the drain into the pen: the first time, the pebble
    if (s.dinoArrival) { s.dinoArrival = false; if (!d.pebbleSeen) startPebble(state, d); }
    if (d.pebble) return runPebble(ctx, d);
    updateRex(ctx);
    // (been through the temple's back door already, this life: it's open)
    if (state.checkpoint >= 40) d.doorKicked = true;
    // The temple's back door: kicked in, the first time; through it after that
    const cx = p.pos.x + p.width / 2;
    if (d.kick > 0) {
      d.kick++;
      p.inCutscene = true; p.vel.x = 0; p.facing = 1;
      if (d.kick === 22) {
        d.doorKicked = true;
        playSound('slam', 1); playSound('crash', 0.9); playSound('crunch', 0.7, -6); shakeScreen(state, 12, 6);
        for (let i = 0; i < 24; i++) state.particles.push({ pos: { x: TEMPLE_DOOR_X + Math.random() * 40, y: GY - 10 - Math.random() * 80 }, vel: { x: 2 + Math.random() * 5, y: -3 - Math.random() * 4 }, life: 30 + Math.random() * 20, color: i % 2 ? '#A8A29E' : '#78716C', size: 3 + Math.random() * 4, grav: 0.3, chunk: true });
      }
      if (d.kick >= 44) { d.kick = 0; p.inCutscene = false; teleport(state, SECTIONS.temple.x0 + 150, GY); p.facing = 1; }
      return hands();
    }
    if (p.isGrounded && cx > TEMPLE_DOOR_X - 60 && p.pos.y + p.height > GY - 4) {
      if (d.doorKicked) { teleport(state, SECTIONS.temple.x0 + 150, GY); return controls; }
      d.kick = 1; meatheadSays(state, pick(MEATHEAD_DOOR));
      return hands();
    }
    return controls;
  },
  drawBackdrop: (c) => {
    // A hot afternoon over a fake jungle: banded sky, a far ridge, palms
    const bands = ['#7DD3FC', '#93DBFB', '#A5E1F8', '#BDE8F2', '#D4EEE6'];
    bands.forEach((col, i) => { c.fillStyle = col; c.fillRect(0, (i * CANVAS_HEIGHT) / bands.length * 0.7, CANVAS_WIDTH, CANVAS_HEIGHT); });
    c.fillStyle = '#4D7C0F'; c.beginPath(); c.moveTo(0, 420);
    for (let x = 0; x <= CANVAS_WIDTH; x += 40) c.lineTo(x, 400 - Math.sin(x * 0.013) * 30 - Math.sin(x * 0.041) * 12);
    c.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT); c.lineTo(0, CANVAS_HEIGHT); c.closePath(); c.fill();
    c.fillStyle = '#3F6212'; c.fillRect(0, 440, CANVAS_WIDTH, CANVAS_HEIGHT);
    return true;
  },
  drawBack: (c, state) => drawDinoBack(c, state),
  drawFront: (c, state) => {
    const d = dinoOf(state);
    if (d.pebble) { c.fillStyle = '#1A0B06'; c.fillRect(Math.round(d.pebble.x) - 3, Math.round(d.pebble.y) - 3, 7, 6); c.fillStyle = '#A8A29E'; c.fillRect(Math.round(d.pebble.x) - 2, Math.round(d.pebble.y) - 2, 5, 4); }
    // (friendly mode, before the switch: the speakers in their heads, doing the bit for the kids)
    if (d.pebble && !d.hostile) for (const e of state.enemies) if (e.kind === 'm2:raptor' && Math.abs(e.pos.x - state.player.pos.x) < 700) saidOver(c, DINO_FRIENDLY[(Math.floor(state.frame / 120) + Math.round(e.pos.x)) % 2], e.pos.x + e.width / 2, e.pos.y - 14, '#BFDBFE', 140);
  },
  drawHud: (c, state) => {
    drawRexHud(c, state);
    const d = dinoOf(state);
    if (!d.pebble) return;
    if (d.pebble.pip > 0) drawCut(c, state, d.pebble);
    if (d.pebble.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
  },
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (crude: the first pass)

const lip = (c: Ctx, x: number, y: number, w: number, col: string) => { box(c, x, y, w, 4, col); box(c, x, y + 4, w, 2, 'rgba(0,0,0,0.25)'); };

const drawDinoBack = (c: Ctx, state: GameState) => {
  const cam = state.camera.x;
  const vis = (a: number, b: number) => b > cam - 100 && a < cam + CANVAS_WIDTH + 100;
  const f = state.frame;
  const d = dinoOf(state);
  // Ground: park dirt and a paved path
  box(c, Math.max(x0 - 200, cam - 50), GY, CANVAS_WIDTH + 100, 400, '#7C5A3A');
  box(c, Math.max(x0 - 200, cam - 50), GY, CANVAS_WIDTH + 100, 5, '#A3825C');
  // Far scenery: paddock fences, palms, a sign now and then
  for (let x = Math.floor((cam - 200) / 260) * 260; x < cam + CANVAS_WIDTH + 200; x += 260) {
    if (x < x0 || x > x1) continue;
    const h = 90 + ((x / 260) % 3) * 30;
    box(c, x + 40, GY - h, 8, h, '#6B4F2E');
    for (let i = 0; i < 4; i++) box(c, x + 44 - 26 + (i % 2) * 26, GY - h - 8 + (i >> 1) * 6, 30, 7, '#3F6212');
  }
  // The pen: its back wall (the drain mouth), the electric fence, a sign
  if (vis(D - 50, FENCE_X + 300)) {
    box(c, D, GY - 700, PEN_WALL, 700, '#57534E');
    box(c, D + PEN_WALL - 4, DRAIN_Y - 6, 24, 52, '#1C1917'); box(c, D + PEN_WALL - 4, DRAIN_Y - 6, 24, 4, '#78716C');
    label(c, 'STORM DRAIN', D + 90, DRAIN_Y - 16, '#D6D3D1', 7);
    box(c, FENCE_X, FENCE_TOP, 20, GY - FENCE_TOP, '#3F3F46');
    for (let y = FENCE_TOP + 20; y < GY; y += 30) box(c, FENCE_X - 300, y, 300, 2, 'rgba(63,63,70,0.45)');
    for (let x = FENCE_X - 300; x < FENCE_X; x += 50) box(c, x, FENCE_TOP + 10, 4, GY - FENCE_TOP - 10, 'rgba(63,63,70,0.45)');
    lip(c, FENCE_X - 2, FENCE_TOP, 24, '#A1A1AA');
    label(c, 'VELOCIRAPTOR ENCLOSURE', D + 480, GY - 300, '#FDE047', 9);
    label(c, 'DANGER: 10,000 VOLTS (DECORATIVE)', D + 480, GY - 284, '#FCA5A5', 7);
  }
  // The maintenance booth, outside the pen: its window, him in it, the switch panel through it
  if (vis(BOOTH.x, BOOTH.x + BOOTH.w)) {
    box(c, BOOTH.x, BOOTH.top, BOOTH.w, GY - BOOTH.top, '#A8A29E');
    box(c, BOOTH.x - 6, BOOTH.top - 10, BOOTH.w + 12, 10, '#78716C');
    const w = BOOTH.win;
    box(c, w.x, w.y, w.w, w.h, '#1E293B');
    c.save(); c.beginPath(); c.rect(w.x, w.y, w.w, w.h); c.clip();
    c.translate(w.x + 40, w.y + w.h + 22); c.scale(-0.7, 0.7); drawPerson(c, { seed: 4242, outfit: 'maint', pose: 'sit', f, mood: 'bored', woman: false });
    c.restore();
    box(c, w.x + 80, w.y + 4, 70, 30, '#52525B');
    const hostile = d.hostile || (d.pebble?.clicked ?? false);
    label(c, hostile ? 'HOSTILE' : 'FRIENDLY', w.x + 115, w.y + 24, hostile ? (f % 30 < 15 ? '#EF4444' : '#7F1D1D') : '#4ADE80', 7);
    label(c, 'MAINTENANCE', BOOTH.x + BOOTH.w / 2, BOOTH.top + 18, '#1C1917', 7);
  }
  // The trike field's sign; the volcano (fake: you can see the seams); the gift shop; the monorail
  if (vis(D + 1500, D + 2500)) label(c, 'TRICERATOPS MEADOW', D + 1950, GY - 330, '#FDE047', 9);
  if (vis(D + 2500, D + 3850)) {
    label(c, 'MOUNT KABOOMA (NOT A REAL VOLCANO)', D + 3200, GY - 560, '#FDE047', 9);
    c.fillStyle = `rgba(249, 115, 22, ${0.5 + 0.2 * Math.sin(f * 0.1)})`; c.fillRect(D + 3230, GY - 450, 140, 14);
    label(c, 'FAKE LAVA', D + 3300, GY - 460, '#FED7AA', 7);
  }
  if (vis(D + 4050, D + 5750)) {
    for (const x of [D + 4100, D + 4900, D + 5680]) box(c, x, GY - 270, 16, 270, '#9CA3AF');
    label(c, 'DINO-MITE GIFTS', D + 4500, GY - 170, '#FDE047', 9);
    label(c, 'MONORAIL: CLOSED FOR REPAIRS SINCE 1997', D + 4900, GY - 320, '#E5E7EB', 7);
  }
  if (vis(PADDOCK_IN - 300, PADDOCK_OUT + 300)) {
    label(c, 'TYRANNOSAURUS REX', (PADDOCK_IN + PADDOCK_OUT) / 2, GY - 420, '#FDE047', 10);
    label(c, 'DO NOT TAP ON THE GLASS (THERE IS NO GLASS)', (PADDOCK_IN + PADDOCK_OUT) / 2, GY - 404, '#FCA5A5', 7);
    for (const x of [PADDOCK_IN, PADDOCK_OUT]) { box(c, x, PADDOCK_TOP, 20, GY - PADDOCK_TOP, '#3F3F46'); lip(c, x - 2, PADDOCK_TOP, 24, '#A1A1AA'); }
  }
  if (vis(LAST_FENCE - 200, x1)) {
    // The temple, from behind: a stepped pyramid's back, its back door (kicked in: a hole)
    for (let i = 0; i < 6; i++) box(c, D + 10560 + i * 40, GY - 130 - i * 70, 600 - i * 80, 70, i % 2 ? '#8A7A5A' : '#9C8B66');
    label(c, 'TEMPLE OF THE JAGUAR', D + 10900, GY - 560, '#FDE047', 10);
    label(c, '(BACK OF)', D + 10900, GY - 544, '#E7E5E4', 7);
    if (d.doorKicked) box(c, TEMPLE_DOOR_X, GY - 90, 50, 90, '#0C0A09');
    else { box(c, TEMPLE_DOOR_X, GY - 90, 50, 90, '#78350F'); box(c, TEMPLE_DOOR_X + 38, GY - 48, 6, 6, '#FACC15'); label(c, 'EMPLOYEES', TEMPLE_DOOR_X + 25, GY - 70, '#FDE68A', 6); label(c, 'ONLY', TEMPLE_DOOR_X + 25, GY - 60, '#FDE68A', 6); }
    if (d.kick > 22) { c.save(); const k = d.kick - 22; c.translate(TEMPLE_DOOR_X + 25 + k * 6, GY - 45 - k * 2 + k * k * 0.2); c.rotate(k * 0.25); box(c, -25, -45, 50, 90, '#78350F'); c.restore(); }
    box(c, LAST_FENCE, LAST_FENCE_TOP, 20, GY - LAST_FENCE_TOP, '#57534E'); lip(c, LAST_FENCE - 2, LAST_FENCE_TOP, 24, '#A8A29E');
    label(c, 'STAFF ONLY BEYOND THIS POINT', LAST_FENCE - 100, LAST_FENCE_TOP - 16, '#FDE047', 7);
  }
  // Solids: rock steps, the shop's roof; ledges with their lit lips
  for (const [x, top, w, kind] of SOLIDS) {
    if (!vis(x, x + w) || kind === 'fence' || kind === 'wall' || kind === 'temple') continue;
    const col = kind === 'rock' ? '#6B5E4E' : '#B45309';
    box(c, x, top, w, GY - top, col);
    if (kind === 'rock') for (let y = top + 30; y < GY; y += 40) box(c, x + 6, y, w - 12, 2, 'rgba(0,0,0,0.18)');
    lip(c, x, top, w, kind === 'rock' ? '#A8977F' : '#F59E0B');
  }
  for (const [x, y, w] of LEDGES) {
    if (!vis(x, x + w)) continue;
    box(c, x, y, w, 12, '#8B6B43'); lip(c, x, y, w, '#D6B88A');
  }
  drawRex(c, state);
};

/** The cut: the maintenance booth, close up, full screen (letterboxed), the pebble coming in its window and onto the
 *  switch; faded in from black, and back out to it. */
const PIP = { w: 340, h: 220 };
const CUT_SCALE = CANVAS_WIDTH / PIP.w;
const drawCut = (c: Ctx, state: GameState, pb: Pebble) => {
  const k = pb.pip, f = state.frame;
  box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#000000');
  if (k < 0.5) return;
  const h = PIP.h * CUT_SCALE, y = (CANVAS_HEIGHT - h) / 2;
  c.save(); c.beginPath(); c.rect(0, y, CANVAS_WIDTH, h); c.clip(); c.translate(0, y); c.scale(CUT_SCALE, CUT_SCALE);
  // the booth inside: the wall, the window (the park out of it), the panel, him
  box(c, 0, 0, PIP.w, PIP.h, '#D6D3D1'); box(c, 0, 170, PIP.w, 50, '#78716C');
  box(c, 14, 34, 96, 80, '#1A0B06'); box(c, 18, 38, 88, 72, '#7DD3FC'); box(c, 18, 86, 88, 24, '#4D7C0F');
  label(c, 'DAYS WITHOUT INCIDENT: 4,380', 140, 22, '#1C1917', 7);
  box(c, 180, 60, 130, 96, '#52525B'); box(c, 184, 64, 122, 88, '#71717A');
  label(c, 'DINOSAUR MODE', 245, 80, '#FDE047', 7);
  label(c, 'FRIENDLY', 212, 142, '#4ADE80', 6); label(c, 'HOSTILE', 280, 142, '#F87171', 6);
  // the switch: over the moment it's hit
  const flip = pb.clicked ? Math.min(1, (pb.pt - PEBBLE_HIT) / 5) : 0;
  c.save(); c.translate(245, 124); c.rotate(-0.6 + 1.2 * flip);
  box(c, -3, -26, 6, 26, '#E4E4E7'); box(c, -6, -32, 12, 8, '#DC2626');
  c.restore();
  box(c, 233, 120, 24, 10, '#27272A');
  // the warning light: off, then going
  const lit = pb.clicked && f % 20 < 10;
  box(c, 288, 40, 18, 14, lit ? '#EF4444' : '#450A0A');
  if (lit) { c.fillStyle = 'rgba(239,68,68,0.25)'; c.beginPath(); c.arc(297, 47, 26, 0, Math.PI * 2); c.fill(); }
  // him: sat with his back to it all, feet up, a magazine
  c.save(); c.translate(110, 196); c.scale(-1.5, 1.5);
  drawPerson(c, { seed: 4242, outfit: 'maint', pose: 'sit', f, mood: 'bored', woman: false, talking: !!pb.maintSaid });
  c.restore();
  box(c, 52, 118, 24, 18, '#F8FAFC'); label(c, 'DIRT BIKE', 64, 130, '#DC2626', 5);
  // the pebble: in through the window, onto the switch's knob, and off it to the floor
  const t = pb.pt;
  if (t >= PEBBLE_IN) {
    let px: number, py: number;
    if (t <= PEBBLE_HIT) { const u = (t - PEBBLE_IN) / (PEBBLE_HIT - PEBBLE_IN); px = 30 + u * 215; py = 70 - Math.sin(u * Math.PI) * 40 + u * 26; }
    else { const u = Math.min(1, (t - PEBBLE_HIT) / 24); px = 250 + u * 30; py = 96 + u * 74 - Math.sin(u * Math.PI) * 20; }
    box(c, px - 4, py - 3, 8, 7, '#1A0B06'); box(c, px - 3, py - 2, 6, 5, '#A8A29E');
    if (t > PEBBLE_HIT && t < PEBBLE_HIT + 6) label(c, 'CLICK', 245, 54, '#FFFFFF', 9);
  }
  if (pb.maintSaid) saidOver(c, pb.maintSaid.text, 120, 70, '#FFFFFF', 200);
  c.restore();
  // (fading in from black, and out to it)
  if (k < 1) { c.fillStyle = `rgba(0, 0, 0, ${((1 - k) * 2).toFixed(2)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
};
