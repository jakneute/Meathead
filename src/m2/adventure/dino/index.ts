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
//   the last bit: trees, raptors on the ground and in them, a trike in front of the fence, a fence to hop, the temple's
//                 back door.
//
// Backtrackable: everything here goes both ways (the pen's fence has a viewing deck outside it to climb back in by;
// the temple's back door, once it's kicked in, stays open: back through it from the temple's side, see temple/).
// The look: art/ (the sky and the park going back: sky.ts; the ground and the set pieces: world.ts; the booth close-up:
// booth.ts).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Section, Said } from '../section';
import { lay, solid, ledge, teleport, hands, saidOver, speak, meatheadSays, getAdv, sectionState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import type { EnemyKind } from '../../../m1/types';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { CANVAS_WIDTH, CANVAS_HEIGHT, KICK_POSE_FRAMES } from '../../../m1/constants';
import { DINO_KINDS } from './kinds';
import { buildRex, updateRex, drawRex, drawRexHud, drawRexSaid } from './rex';
import { drawDinoBackdrop } from './art/sky';
import { drawDinoWorld, dinoLamps } from './art/world';
import { drawBoothCut } from './art/booth';
import { drawZooFar, drawZooNear } from './art/zoo';
import { updateGuests, drawGuestsSaid } from './guests';
import { MEATHEAD_LANDED, MEATHEAD_RED_EYES, MAINT_OBLIVIOUS, DINO_FRIENDLY, MEATHEAD_DOOR } from './lines';

import { x0, x1, D, PEN_WALL, DRAIN_Y, PADDOCK_IN, PADDOCK_OUT, PADDOCK_TOP, LAST_FENCE, TEMPLE_ZOOM_OUT, TEMPLE_DOOR_X, LEDGES, SOLIDS } from './layout';
export { TEMPLE_DOOR_X, DINO_BACK_DOOR_X } from './layout';
const pick = pickLine;

// ---------------------------------------------------------------------------------------------------------------
// The layout: layout.ts

/** Who's where: [kind, x, the surface it stands on (or, a flyer, how high it flies)]. */
const ENEMIES: [keyof typeof DINO_KINDS, number, number][] = [
  // (well along the pen from where he starts in it: he's not in their jaws the moment he's back)
  ['raptor', D + 700, GY], ['raptor', D + 880, GY],
  // (the second trike kept out of THE VOLCANO checkpoint's safe reach)
  ['trike', D + 1750, GY], ['trike', D + 2080, GY],
  ['raptor', D + 2850, GY - 210], ['raptor', D + 3300, GY - 430], ['raptor', D + 3720, GY - 170],
  ['ptero', D + 3050, GY - 560], ['ptero', D + 3500, GY - 620],
  ['raptor', D + 4950, GY], ['raptor', D + 5150, GY - 280], ['raptor', D + 5450, GY], ['ptero', D + 4600, GY - 470],
  ['ptero', D + 7900, GY - 520],
  // (the last stretch: raptors on the ground and up the trees (one drops on him from the last tree), a trike between
  // the trees in front of the fence: up a tree out of its way, then over)
  ['raptor', D + 9300, GY], ['trike', D + 9650, GY], ['raptor', D + 9970, GY - 180], ['raptor', D + 9310, GY - 245], ['ptero', D + 9800, GY - 500],
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

const PEBBLE_IN = 12, PEBBLE_HIT = 50;
/** Out of the drain: the camera pushes in on the pebble as it flies (from ZOOM_FROM, all the way in by ZOOM_IN), and on
 *  it, cut to the booth (ZOOM_CUT). */
const ZOOM_FROM = 6, ZOOM_IN = 34, ZOOM_CUT = 66;
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
  if (pb.closedAt < 0 && (pb.pip > 0 || pb.t >= ZOOM_CUT)) { pb.pip = Math.min(1, pb.pip + 0.09); if (pb.pip >= 1) pb.pt++; }
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
    // (back for another go at the T. rex: no raptors about the paddock's gate, nothing coming over from the volcano)
    // (down off the volcano's last step, short of the monorail over the gift shop)
    { name: 'THE GIFT SHOP', cp: 32, x: D + 4000, y: GY },
    { name: 'THE T. REX PADDOCK', cp: 33, x: D + 5880, y: GY, clear: [1500, PADDOCK_IN - (D + 5880) - 10] },
    // (past the paddock: the T. rex is done for good from here on (rex.ts: REX_GONE_CP))
    { name: 'THE TEMPLE FENCE', cp: 34, x: D + 8800, y: GY },
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
    // (the park's guests: what they make of it, now and then)
    updateGuests(state, { doorKicked: d.doorKicked, scene: p.inCutscene || d.kick > 0 });
    // (been through the temple's back door already, this life: it's open)
    if (state.checkpoint >= 40) d.doorKicked = true;
    // The temple's back door: kicked in, the first time; through it after that
    const cx = p.pos.x + p.width / 2;
    if (d.kick > 0) {
      d.kick++;
      p.inCutscene = true; p.vel.x = 0; p.facing = 1;
      // (a beat squared up to it, then the boot: the door goes when it's all the way out)
      if ((p.kickPose || 0) > 0) p.kickPose!--;
      if (d.kick === 2) p.pos.x = TEMPLE_DOOR_X - 44 - p.width / 2;
      if (d.kick === 22 - 9) { p.kickPose = KICK_POSE_FRAMES; playSound('whoosh', 0.6, -4); }
      if (d.kick === 22) {
        d.doorKicked = true;
        playSound('slam', 1); playSound('crash', 0.9); playSound('crunch', 0.7, -6); shakeScreen(state, 12, 6);
        for (let i = 0; i < 24; i++) state.particles.push({ pos: { x: TEMPLE_DOOR_X + Math.random() * 40, y: GY - 10 - Math.random() * 80 }, vel: { x: 2 + Math.random() * 5, y: -3 - Math.random() * 4 }, life: 30 + Math.random() * 20, color: i % 2 ? '#A8A29E' : '#78716C', size: 3 + Math.random() * 4, grav: 0.3, chunk: true });
      }
      if (d.kick >= 44) { d.kick = 0; p.inCutscene = false; p.kickPose = 0; teleport(state, SECTIONS.temple.x0 + 150, GY); p.facing = 1; }
      return hands();
    }
    if (p.isGrounded && cx > TEMPLE_DOOR_X - 60 && p.pos.y + p.height > GY - 4) {
      if (d.doorKicked) { teleport(state, SECTIONS.temple.x0 + 150, GY); return controls; }
      d.kick = 1; meatheadSays(state, pick(MEATHEAD_DOOR));
      return hands();
    }
    return controls;
  },
  // (out of the drain: in on the pebble as it flies, till the cut; and coming up on the temple: out, to take it all in)
  zoom: (state) => {
    const pb = dinoOf(state).pebble;
    if (!pb) {
      const p = state.player, cx = p.pos.x + p.width / 2;
      const u = Math.max(0, Math.min(1, (cx - (LAST_FENCE - 900)) / 600)), k = u * u * (3 - 2 * u);
      if (k <= 0) return null;
      // (about him, eased over to the left of the screen, so the temple fills the rest of it)
      return { scale: 1 - TEMPLE_ZOOM_OUT * k, x: cx, y: GY, shiftX: k * (170 - (cx - state.camera.x)) };
    }
    if (pb.pip > 0 || pb.closedAt >= 0 || pb.t < ZOOM_FROM) return null;
    const u = Math.min(1, (pb.t - ZOOM_FROM) / (ZOOM_IN - ZOOM_FROM)), k = u * u * (3 - 2 * u);
    return { scale: 1 + 1.8 * k, x: pb.x, y: pb.y, shiftX: k * (state.camera.x + CANVAS_WIDTH / 2 - pb.x), shiftY: k * (state.camera.y + CANVAS_HEIGHT / 2 - pb.y) };
  },
  // (over a fake jungle, at whatever hour it is: art/sky.ts)
  drawBackdrop: (c, state) => { drawDinoBackdrop(c, state); return true; },
  outdoors: () => 1,
  lamps: (state) => dinoLamps(state),
  drawBack: (c, state) => {
    const d = dinoOf(state);
    drawDinoWorld(c, state, { hostile: d.hostile, doorKicked: d.doorKicked, kick: d.kick, switching: d.pebble?.clicked ?? false }, () => drawRex(c, state), { far: () => drawZooFar(c, state), near: () => drawZooNear(c, state) });
  },
  drawFront: (c, state) => {
    const d = dinoOf(state);
    // (the T. rex's speaker: what it's saying, over its head)
    drawRexSaid(c, state);
    drawGuestsSaid(c, state);
    if (d.pebble) { c.fillStyle = '#1A0B06'; c.fillRect(Math.round(d.pebble.x) - 3, Math.round(d.pebble.y) - 3, 7, 6); c.fillStyle = '#A8A29E'; c.fillRect(Math.round(d.pebble.x) - 2, Math.round(d.pebble.y) - 2, 5, 4); }
    // (friendly mode, before the switch: the speakers in their heads, doing the bit for the kids)
    if (d.pebble && !d.hostile) for (const e of state.enemies) if (e.kind === 'm2:raptor' && Math.abs(e.pos.x - state.player.pos.x) < 700) saidOver(c, DINO_FRIENDLY[(Math.floor(state.frame / 120) + Math.round(e.pos.x)) % 2], e.pos.x + e.width / 2, e.pos.y - 14, '#BFDBFE', 140);
  },
  drawHud: (c, state) => {
    drawRexHud(c, state);
    const d = dinoOf(state);
    if (!d.pebble) return;
    const pb = d.pebble;
    if (pb.pip > 0) drawBoothCut(c, state.frame, { k: pb.pip, pt: pb.pt, clicked: pb.clicked, inAt: PEBBLE_IN, hitAt: PEBBLE_HIT, talking: !!pb.maintSaid }, g => { if (pb.maintSaid) saidOver(g, pb.maintSaid.text, 120, 70, '#FFFFFF', 200); });
    if (d.pebble.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
  },
};

