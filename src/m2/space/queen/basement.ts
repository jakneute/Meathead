// THE BASEMENT: XENOSCARE's maintenance tunnels, deep under the hold, in the dark, and the queen stalking him through
// them (a chase, not a fight). He came down through the floor she smashed (show.ts), and it ends up a long flight of
// stairs at its east end, at the space disco's door.
//
//   THE PLACE     two levels, the whole height of it on one screen: the floor, and the catwalks over it (ladders up,
//                 pipe runs to hop up on half way, drop down through them); vents in the ceiling, ducts in the back wall
//                 at the floor. A tight light round him, a flickering emergency strip here and there, the rest near
//                 black. The hum, drips, a hiss in the pipes, her screech far off.
//   HER           silent (screeches, clicks, hydraulics: no words). Not set encounters: a stalker. She roams the vents
//                 on her own schedule and comes out where she likes: ahead of him, behind him, up on the catwalks over
//                 him, down on the floor under him, or crawling along the ceiling and dropping. Every time, told a beat
//                 before she can get at him: her clicks coming, the vent rattling (dust down out of it), a screech. She
//                 prowls her level, stops and sniffs, doubles back now and then, and goes back up a vent. Sometimes it's
//                 nothing (a vent rattles and nobody comes; her silhouette goes by over the near pipes and on). She
//                 sees him if he's on her level, in front of her and near (or right on her); she HEARS him (shooting,
//                 jumping, landing, charging are loud; walking's quiet; standing still, nothing): loud enough with her
//                 about, she comes to it; loud enough with her away, she's out sooner, near the noise. Seen, she runs
//                 him down, and up or down a level after him (she crouches and screeches first, then leaps). Getting past
//                 her once is nothing: she's back, any time, right up to the disco's door. At the foot of the stairs
//                 she comes for him for real, behind him, and it's a run up them for the door. Touched: one shot.
//   THE KILL      she snatches him up to her face; a beat, her jaws opening in his face, her claw closing over his
//                 head; she tears it off; the neck geysers; she drops the body (it twitches); she screeches over the head
//                 and pitches it (the camera in close for it: his own death, 'headripped').
//   HIDING        the cast members' lockers and dark corners (the floor), the air handlers' cabinets (the catwalks):
//                 hold up at one and he's in. In, she goes right by. In with her on him (seen, and close), she finds him.
//   WEAPONS       go through her (nothing down here hurts her); they're loud.
//   THE TEACHING  the first: her silhouette over the pipes ahead, then out of a vent ahead and walking his way, slowly,
//                 lockers right there. Then she's loose.
//
// Kept across his deaths: nothing of hers (a death's back at the checkpoint, the opener past it done, a grace spell
// before she's first out); the door, once kicked in, stays in.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Light, SceneLight } from '../../../m1/game/render/lighting';
import type { Block } from '../../../m1/types';
import type { MeatheadDeath } from '../../../m1/game/player/deathAnim';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { KICK_POSE_FRAMES, CANVAS_WIDTH, CANVAS_HEIGHT, PARTICLE_PALETTES } from '../../../m1/constants';
import { registerHurtLines } from '../../kinds';
import { registerDeathKind, registerDeathAnim } from '../../../m1/game/player/deathAnim';
import { registerDeathDraw, body } from '../../../m1/game/render/player/deathAnim';
import { drawBloodPool } from '../../../m1/game/render/spatter';
import { onLadder, type LadderDef } from '../../moves/ladders';
import { setUi } from '../../store';
import { hands, meatheadSays, box, label } from '../section';
import { ink, limb } from '../../../m1/game/render/npc/kit';
import { stamp } from '../../../m1/game/render/stamp';
import { GY } from '../geometry';
import { BASE_L, BASE_R, DOOR_X, DISCO_L, BF, CATWALK_Y, CEIL_B, STAIRS_A, STAIRS_B, LAND_X, stairsY } from './geo';
import { drawQueen } from './art';
import { FELL_MEMO } from './show';
import * as L from './lines';

export { CEIL_B };

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;
const dressed = (state: GameState): L.Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

const B = BASE_L;
/** The checkpoint half way (the graveyard). */
export const GRAVEYARD_CP = 72;
/** How big she's drawn down here (she has to fit under the catwalks). */
const QS = 0.85;

// ---------------------------------------------------------------------------------------------------------------
// The kill: her own death for him ('headripped'): his head torn off, the neck geysering, the body dropped, twitching

const JAW = 'm2:sp_queen_jaw';
const RIPPED = 'own:headripped' as const;
registerHurtLines(JAW, L.HURT_JAW, L.DEATH_JAW);
registerDeathKind(JAW, RIPPED);
/** The kill's timeline (frames into it): the snatch; the beat (her jaws opening in his face, her claw closing on his
 *  head); the pull; the rip (he dies there); his body held a moment, geysering; dropped; she screeches over the head,
 *  then pitches it. */
const K_SNATCH = 12, K_GRIP = 36, K_PULL = 58, K_RIP = 66, K_DROP = K_RIP + 22, K_TOSS = K_RIP + 70, K_END = K_TOSS + 70;
/** Where he lands when she lets go (his feet's floor). */
const ripKill = { floor: BF };
const GORE = PARTICLE_PALETTES.GORE;
/** (headripped) Frames from his death to her letting go; his fall from then. */
const DROP_AT = K_DROP - K_RIP;
const fallOf = (d: MeatheadDeath, t: number) => (t < DROP_AT ? 0 : Math.min((ripKill.floor ?? d.y) - d.y, 0.5 * 0.7 * (t - DROP_AT) ** 2));
/** The neck's stump, t frames in (his body's middle top). */
const stumpAt = (d: MeatheadDeath, t: number) => ({ x: d.x, y: d.y - 56 + fallOf(d, t) });
registerDeathAnim(RIPPED, {
  frames: 190, airOk: true,
  tick: (ctx, d, t) => {
    const P = ctx.state.particles;
    // (the geyser out of the neck: straight up, hard, while she holds him; then in pumps, weaker, lying there)
    const st = stumpAt(d, t), down = fallOf(d, t) >= (ripKill.floor ?? d.y) - d.y - 0.5;
    const pump = !down ? 1 : t % 18 < 6 ? Math.max(0, 1 - (t - DROP_AT) / 90) : 0;
    if (pump > 0) for (let k = 0; k < (down ? 2 : 4); k++) {
      const up = down ? -d.facing : 0;
      P.push({ pos: { x: st.x + (down ? -d.facing * 30 : 0), y: down ? (ripKill.floor - 10) : st.y }, vel: { x: (Math.random() - 0.5) * 2.5 + up * 3 * pump, y: -(down ? 3 : 7 + Math.random() * 4) * pump }, life: 50, color: GORE[(t + k) % GORE.length], size: 2 + Math.random() * 3, grav: 0.35 });
    }
    // (her: screeching over the head; pitching it; it bouncing)
    if (t === 16) { playSound('roar', 1, -2); playSound('screams', 0.8, -6); shakeScreen(ctx.state, 8, 4); }
    if (t === K_TOSS - K_RIP) playSound('whoosh', 0.8, -4);
    if (t === K_TOSS - K_RIP + 22) playSound('thud', 0.6, 4);
    const fall = fallOf(d, t), was = fallOf(d, t - 1), floor = (ripKill.floor ?? d.y) - d.y;
    if (fall >= floor && was < floor) {
      playSound('thud', 1, -8); playSound('splat', 0.8, -4); shakeScreen(ctx.state, 6, 3);
      for (let k = 0; k < 10; k++) P.push({ pos: { x: d.x, y: ripKill.floor - 4 }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 3 }, life: 40, color: GORE[k % GORE.length], size: 2 + Math.random() * 3, grav: 0.35 });
    }
  },
});
registerDeathDraw(RIPPED, (ctx, state, d, weapon, t) => {
  const fall = fallOf(d, t), floor = (ripKill.floor ?? d.y) - d.y, down = fall >= floor - 0.5;
  const facing = d.facing, since = t - DROP_AT;
  if (down) drawBloodPool(ctx, Math.round(d.x - facing * 26), Math.round(ripKill.floor) + 1, Math.round(10 + Math.min(34, since * 0.6)), 517);
  ctx.save();
  ctx.translate(0, fall);
  // (held: hanging limp off her claw; dropped: over onto his back, and twitching a while (a jerk, a kick), then still)
  const twitch = down && since < 110 && (since % 23 < 3 || since % 37 < 2) ? 1 : 0;
  const tip = down ? -facing * Math.PI / 2 : t < DROP_AT ? 0.05 * Math.sin(t * 0.5) : -facing * Math.min(Math.PI / 2, (t - DROP_AT) * 0.12);
  ctx.translate(d.x, d.y); ctx.rotate(tip + twitch * 0.06); ctx.translate(-d.x, -d.y + (twitch ? -2 : 0));
  body(ctx, state, d, weapon, { isGrounded: down && !twitch, vel: { x: twitch ? 3 : 0, y: down ? 0 : 1 }, headless: 24, deathFace: 'dead' });
  ctx.restore();
});

/** Kept across his deaths: the disco's door is in. */
export const DOOR_MEMO = 'm2:space:discoDoor';

// ---------------------------------------------------------------------------------------------------------------
// The layout (two levels: the floor at BF, the catwalks at CATWALK_Y)

/** The catwalks: [from, to] (one-way grating: up through from below, down through them). */
export const CATWALKS: [number, number][] = [[B + 1500, B + 2200], [B + 2650, B + 3400], [B + 3800, B + 4700], [B + 5000, B + 5560]];
/** The pipe runs half way up (a hop up onto one, then on up through the catwalk): [x, w]. */
export const PIPES: [number, number][] = [[B + 1700, 110], [B + 2950, 100], [B + 4100, 110], [B + 5200, 100]];
export const PIPE_Y = BF - 130;
/** The ladders up to the catwalks (each a little in from a catwalk's end: stepped off onto it). */
const LADDER_X: [number, 1 | -1][] = [[B + 1550, 1], [B + 2150, -1], [B + 2700, 1], [B + 3850, 1], [B + 4650, -1], [B + 5050, 1]];
export const LADDERS: LadderDef[] = LADDER_X.map(([x, inward]) => ({ x, top: CATWALK_Y, bottom: BF, ledge: { x: x + inward * 34, y: CATWALK_Y } }));
/** The catwalk at x (or null). */
const catwalkAt = (x: number) => CATWALKS.find(([a, b]) => x >= a && x <= b) ?? null;

/** Where he can hide: the cast members' lockers and dark corners (the floor), the air handlers' cabinets (up top). */
export const HIDES: { x: number; y: number; kind: 'locker' | 'dark' | 'cabinet' }[] = [
  { x: B + 780, y: BF, kind: 'locker' }, { x: B + 1300, y: BF, kind: 'locker' }, { x: B + 1900, y: BF, kind: 'locker' }, { x: B + 2450, y: BF, kind: 'locker' },
  { x: B + 3200, y: BF, kind: 'dark' }, { x: B + 3600, y: BF, kind: 'locker' }, { x: B + 4380, y: BF, kind: 'locker' }, { x: B + 4880, y: BF, kind: 'dark' },
  { x: B + 5420, y: BF, kind: 'locker' },
  { x: B + 1800, y: CATWALK_Y, kind: 'cabinet' }, { x: B + 3100, y: CATWALK_Y, kind: 'cabinet' }, { x: B + 4200, y: CATWALK_Y, kind: 'cabinet' }, { x: B + 5350, y: CATWALK_Y, kind: 'cabinet' },
];
/** The vents in the ceiling she comes and goes by; the ducts in the back wall at the floor (under the catwalks). */
export const VENTS = [B + 1100, B + 1400, B + 1800, B + 2400, B + 2900, B + 3300, B + 3650, B + 4050, B + 4400, B + 4800, B + 5250, B + 5500];
export const DUCTS = [B + 1000, B + 2050, B + 2550, B + 3400, B + 4500, B + 5150];
/** The emergency strips (flickering), along the ceiling. */
export const STRIPS = [B + 420, B + 1180, B + 1960, B + 2640, B + 3300, B + 4080, B + 4600, B + 5150, B + 5600];

/** The floor's height at x (the stairs at the east end). */
const floorY = (x: number) => stairsY(x);
/** A level's height at x: 0 the floor, 1 the catwalks. */
const levelY = (lvl: 0 | 1, x: number) => (lvl ? CATWALK_Y : floorY(x));

/** Laid out: the catwalks and the pipe runs (one-way), the stairs are ground (index.ts lays them). */
export const layBasement = (state: GameState) => {
  for (const [a, b] of CATWALKS) state.blocks.push({ x: a, y: CATWALK_Y, w: b - a, h: 14, type: 'platform', oneWay: true, grating: true, hidden: true, tag: 'q-catwalk' } as Block);
  for (const [x, w] of PIPES) state.blocks.push({ x, y: PIPE_Y, w, h: 14, type: 'platform', oneWay: true, hidden: true, tag: 'q-pipe' } as Block);
};

// ---------------------------------------------------------------------------------------------------------------
// The state

type Mode = 'away' | 'tell' | 'drop' | 'prowl' | 'hunt' | 'search' | 'climb' | 'ceil' | 'crouch' | 'leap' | 'kill';
/** How she comes out: down a ceiling vent, out of a wall duct, or along the ceiling first. */
type Entry = 'vent' | 'duct' | 'ceil';
export interface Hunter {
  /** Set up against where he really is (the first frame: the checkpoint's put him there after the build). */
  init: boolean;
  mode: Mode; t: number; x: number; y: number; lvl: 0 | 1; dir: 1 | -1; speed: number;
  /** Where she's going (her points along her level), which she's at, how long she's stood sniffing. */
  path: { x: number; stop?: number }[]; leg: number; sniff: number;
  /** How she's coming out this time; after the drop, straight at him (the stairs' finale). */
  entry: Entry; huntOnDrop: boolean;
  /** The leap (between levels): from, to. */
  leap: { x0: number; y0: number; x1: number; y1: number; lvl: 0 | 1; then: Mode } | null;
  /** Frames till she's out again (away); how long she's been out; when she last saw him; where she last had him. */
  next: number; out: number; lastSeen: number; lastX: number;
  /** The opener's done; the finale's on (the stairs); a fake going (a vent rattling for nothing). */
  opened: boolean; finale: boolean; fake: { x: number; t: number } | null;
  /** The vent rattling as she comes (its x, how long). */
  rattle: { x: number; t: number } | null;
  /** The foreground pass (her silhouette over the near pipes: which way, how far through). */
  fg: { t: number; dir: 1 | -1 } | null;
  /** His noise (decays). */
  noise: number;
  /** He's hidden (in which spot), and since when; his heart. */
  hid: number; hidT: number; heart: number;
  /** He was hidden while she went by close: his say once she's gone. */
  passedClose: boolean;
  /** Said: the dark, the first sighting, the useless gun; when he last said something in hiding. */
  saidDark: boolean; saidSpot: boolean; saidGun: boolean; hideSaidAt: number;
  /** The door: shut, being kicked (the frames), in. */
  door: 'shut' | 'kicking' | 'in'; doorT: number; block: Block | null;
  wasGrounded: boolean; lastVy: number; lastShoot: boolean; lastJump: boolean; lastMove: boolean;
  /** This life's one free loud thing (a shot or a charge move): nothing hears it; he catches himself. */
  warned: boolean; freeMove: boolean;
  /** The kill: the camera in on it (0..1). */
  cam: number;
  /** The hiding spot she tore open on him (seen getting in), -1 none: gutted, its door gone. */
  torn: number;
  /** Frames till she's next seen going by in the foreground (between her real goes, to keep him sweating). */
  fgNext: number;
}
export const makeHunter = (state: GameState): Hunter => {
  const cx = state.player.pos.x + state.player.width / 2;
  return {
    init: false, mode: 'away', t: 0, x: 0, y: BF, lvl: 0, dir: -1, speed: 1.5, path: [], leg: 0, sniff: 0,
    entry: 'vent', huntOnDrop: false, leap: null,
    next: 360, out: 0, lastSeen: -9999, lastX: cx,
    opened: cx > B + 620, finale: false, fake: null, rattle: null, fg: null,
    noise: 0, hid: -1, hidT: 0, torn: -1, fgNext: 420, heart: 0, passedClose: false,
    saidDark: cx > B + 400, saidSpot: cx > B + 700, saidGun: false, hideSaidAt: -99999,
    door: state.stageMemo[DOOR_MEMO] ? 'in' : 'shut', doorT: 0, block: null,
    wasGrounded: true, lastVy: 0, lastShoot: false, lastJump: false, lastMove: false, warned: false, freeMove: false,
    cam: 0,
  };
};
export const buildHunter = (state: GameState, h: Hunter) => {
  if (h.door === 'in') return;
  h.block = { x: DOOR_X - 20, y: -4000, w: 40, h: 4000 + GY, type: 'wall', hidden: true, tag: 'disco-door' } as Block;
  state.blocks.push(h.block);
};
export const doorIn = (h: Hunter) => h.door === 'in';
/** In already (a fresh start inside the disco: the checkpoint's set after the build). */
export const forceDoorIn = (state: GameState, h: Hunter) => {
  if (h.door === 'in') return;
  h.door = 'in'; state.stageMemo[DOOR_MEMO] = '1';
  if (h.block) { state.blocks = state.blocks.filter(b => b !== h.block); h.block = null; }
};
export const doorKicking = (h: Hunter) => h.door === 'kicking';

const pmid = (state: GameState) => state.player.pos.x + state.player.width / 2;
const pfeet = (state: GameState) => state.player.pos.y + state.player.height;
/** Which level he's on (or between: on a ladder, a pipe, in the air). */
const plevel = (state: GameState): 0 | 1 | -1 => {
  const f = pfeet(state), x = pmid(state);
  if (onLadder(state) || !state.player.isGrounded) return Math.abs(f - CATWALK_Y) < 30 && catwalkAt(x) ? 1 : Math.abs(f - floorY(x)) < 30 ? 0 : -1;
  return Math.abs(f - CATWALK_Y) < 8 ? 1 : Math.abs(f - floorY(x)) < 12 ? 0 : -1;
};
const inPlay = (h: Hunter) => h.mode !== 'away' && h.mode !== 'tell';
const to = (h: Hunter, m: Mode) => { h.mode = m; h.t = 0; };
const vol = (state: GameState, x: number, k: number) => Math.max(0, k * (1 - Math.abs(x - pmid(state)) / 1000));

// ---------------------------------------------------------------------------------------------------------------
// Each frame (the stage's controls in; what the engine gets out, or null: his own)

export const tickHunter = (ctx: FrameContext, h: Hunter, controls: Controls): Controls | null => {
  const { state } = ctx, p = state.player, cx = pmid(state);
  if (cx < B - 60 || cx > DOOR_X + 40 && h.door !== 'kicking') return null;
  if (!h.init) {
    h.init = true;
    h.opened = h.opened || cx > B + 620;
    h.saidDark = h.saidDark || cx > B + 400; h.saidSpot = h.saidSpot || cx > B + 700; h.lastX = cx;
  }
  h.t++;
  if (h.door === 'kicking') return kick(ctx, h);
  // The ambience: hum, drips, the pipes, her far off
  ambience(state, h);
  if (!h.saidDark && cx > B + 420 && p.isGrounded) { h.saidDark = true; meatheadSays(state, pick(L.MH_DARK), false); }
  // Hiding: up at a spot (on its level, his feet down, not in the middle of anything)
  const spot = HIDES.findIndex(s => Math.abs(s.x - cx) < 36 && Math.abs(s.y - pfeet(state)) < 10);
  let out: Controls | null = null;
  if (h.mode !== 'kill' && p.health > 0) {
    if (spot >= 0 && h.hid < 0) setUi({ upPrompt: 'HIDE' });
    if (spot >= 0 && controls.up && p.isGrounded && (h.hid >= 0 || !p.isCharging)) {
      if (h.hid < 0) {
        // (did she see him get in? on her level and looking his way, or right on him: then she knows where he is)
        const sawIt = inPlay(h) && h.mode !== 'leap' && h.mode !== 'crouch' && sees(state, h);
        h.hid = spot; h.hidT = 0;
        playSound('clink', 0.5, -6);
        if (state.frame - h.hideSaidAt > 900) { h.hideSaidAt = state.frame; meatheadSays(state, pick((HIDES[spot].kind === 'locker' ? L.MH_HIDE : L.MH_HIDE_DARK)[dressed(state)]), false); }
        // (in, with her on him and close, or with her watching: she saw that. He's fucked: she comes straight for it)
        if (sawIt || (h.mode === 'hunt' && Math.abs(h.x - cx) < 240 && Math.abs(h.y - pfeet(state)) < 60)) {
          h.hidT = -1;
          if (h.mode !== 'hunt') spotted(state, h);
        }
      }
      h.hidT = h.hidT < 0 ? h.hidT : h.hidT + 1;
      p.hidden = true; p.vel.x = 0; p.pos.x += (HIDES[spot].x - cx) * 0.4;
      out = hands();
    } else if (h.hid >= 0) { h.hid = -1; p.hidden = false; playSound('clink', 0.4, -2); }
  }
  // (his heart, in there: quicker with her near)
  if (h.hid >= 0 && --h.heart <= 0) { const near = inPlay(h) && Math.abs(h.x - cx) < 400; h.heart = near ? 22 : 44; playSound('thud', near ? 0.45 : 0.25, -14); }
  hearHim(state, h, controls);
  if (h.mode === 'away') schedule(state, h);
  runHer(ctx, h);
  if (h.mode !== 'kill') h.cam = Math.max(0, h.cam - 0.03);
  return out;
};

const ambience = (state: GameState, h: Hunter) => {
  const r = Math.random();
  if (r < 1 / 160) playSound('tinkle', 0.15, -4 + Math.random() * 8);
  if (state.frame % 260 === 0) playSound('engine', 0.06, -20);
  if (r > 1 - 1 / 420) playSound('gush', 0.1, -12);
  if (h.mode === 'away' && Math.random() < 1 / 900) playSound('screams', 0.08, -14);
  // (somewhere off in the vents: a skitter that's her, or isn't)
  if (h.mode === 'away' && Math.random() < 1 / 500) playSound('click', 0.12, -6 + Math.random() * 6);
};

const hearHim = (state: GameState, h: Hunter, controls: Controls) => {
  const p = state.player;
  if (h.hid >= 0) { h.noise *= 0.95; return; }
  let n = 0;
  if (Math.abs(p.vel.x) > 0.5 && p.isGrounded) n += 0.5;
  const shot = !!controls.shoot && !h.lastShoot, moving = p.isCharging || p.isSliding || p.isUppercutting || p.isDivekicking, moveStart = moving && !h.lastMove;
  // (the first loud thing this life, a shot or a charge move: nothing hears it; he catches himself, whispering. One
  // warning a life, the two shared; after it, every one counts)
  if (!h.warned && (shot || moveStart)) {
    h.warned = true; h.freeMove = !shot;
    meatheadSays(state, pick(shot ? L.MH_WARN_SHOOT : L.MH_WARN_MOVE), false);
  } else {
    if (shot) {
      n += 45;
      if (inPlay(h) && !h.saidGun) { h.saidGun = true; meatheadSays(state, pick(L.MH_USELESS), false); }
    }
    if (moving && !h.freeMove) n += moveStart ? 30 : 2.5;
  }
  if (controls.jump && !h.lastJump && p.isGrounded) n += 14;
  if (!h.wasGrounded && p.isGrounded && h.lastVy > 7) n += 40;
  h.lastShoot = !!controls.shoot; h.lastJump = !!controls.jump; h.wasGrounded = p.isGrounded; h.lastVy = p.vel.y; h.lastMove = moving;
  if (!moving) h.freeMove = false;
  h.noise = h.noise * 0.97 + n;
  // (loud with her out and in earshot: she comes to it, on her level; on his level already, faster)
  if (n >= 14 && (h.mode === 'prowl' || h.mode === 'search') && Math.abs(h.x - pmid(state)) < 800) {
    h.path = [{ x: clampLvl(h, pmid(state)), stop: 90 }, ...h.path.slice(h.leg)]; h.leg = 0; to(h, 'prowl'); h.speed = Math.max(h.speed, 2.6);
    playSound('screams', 0.3, -6);
  }
};

/** Her x kept on her level (a catwalk's ends; the basement's). */
const clampLvl = (h: Hunter, x: number) => {
  if (h.lvl === 1) { const cw = catwalkAt(h.x) ?? CATWALKS[0]; return Math.max(cw[0] + 30, Math.min(cw[1] - 30, x)); }
  return Math.max(B + 40, Math.min(STAIRS_B - 20, x));
};

// ---------------------------------------------------------------------------------------------------------------
// Her schedule: out again when she likes (sooner if he's loud), from where she likes

const schedule = (state: GameState, h: Hunter) => {
  const p = state.player, cx = pmid(state);
  if (p.health <= 0 || state.deathTimer > 0 || p.inCutscene) return;
  // (the opener: the teaching one, ahead of him, coming his way slowly, lockers right there)
  if (!h.opened) {
    if (cx > B + 620) {
      h.opened = true;
      emerge(state, h, 0, B + 1400, 'vent', [{ x: B + 120 }], 1.4, true);
    }
    return;
  }
  // (the stairs: she comes for him for real, from behind)
  if (!h.finale && cx > STAIRS_A - 380) {
    h.finale = true;
    const from = Math.max(B + 200, cx - 640);
    emerge(state, h, 0, from, 'duct', [], 3.9, false);
    h.huntOnDrop = true;
    return;
  }
  if (h.finale) return;
  // (a fake going: the vent rattling for nothing)
  if (h.fake) {
    h.fake.t++;
    if (h.fake.t % 9 === 0) playSound('click', vol(state, h.fake.x, 0.4), -2);
    if (h.fake.t === 60) { playSound('clang', vol(state, h.fake.x, 0.5), -4); dust(state, h.fake.x, CEIL_B + 4, 6); }
    if (h.fake.t > 110) { h.fake = null; h.next = Math.max(h.next, 200); }
    return;
  }
  h.next--;
  // (and between times, every so often, her in the foreground: stalking along the near pipes, over him, on her way
  // somewhere ahead of him; she's not done with him)
  if (!h.fg && --h.fgNext <= 0) { h.fg = { t: 0, dir: Math.random() < 0.7 ? ((p.facing || 1) as 1 | -1) : ((-(p.facing || 1)) as 1 | -1) }; h.fgNext = rnd(360, 600); playSound('click', 0.4, -4); }
  // (his noise, with her away: out sooner, near it)
  if (h.noise > 60) h.next = Math.min(h.next, h.noise > 100 ? 20 : 90);
  if (h.next > 0) return;
  const r = Math.random();
  // (now and then it's nothing: a rattle, or her shape going by over the near pipes and on)
  if (r < 0.12 && h.noise < 60) { h.fake = { x: pickVent(cx + (Math.random() < 0.5 ? -1 : 1) * rnd(200, 500), -1) ?? cx, t: 0 }; h.next = rnd(300, 520); return; }
  if (r < 0.2 && h.noise < 60) { h.fg = { t: 0, dir: Math.random() < 0.5 ? -1 : 1 }; playSound('screams', 0.25, -10); h.next = rnd(320, 560); return; }
  // (out for real: ahead, behind, above or below him, or along the ceiling first)
  const lvl = plevel(state);
  const his: 0 | 1 = lvl === 1 ? 1 : 0;
  const ahead = (p.facing || 1) as 1 | -1;
  const q = Math.random();
  const loud = h.noise > 60;
  let toLvl: 0 | 1, at: number, entry: Entry;
  if (q < 0.3 && !loud) { toLvl = his; at = cx + ahead * rnd(480, 720); entry = 'vent'; }
  else if (q < 0.55) { toLvl = his; at = cx - ahead * rnd(460, 660); entry = 'vent'; }
  else if (q < 0.8) { toLvl = his ? 0 : 1; at = cx + (Math.random() < 0.5 ? -1 : 1) * rnd(120, 360); entry = 'vent'; }
  else { toLvl = his; at = cx + (Math.random() < 0.5 ? -1 : 1) * rnd(560, 760); entry = 'ceil'; }
  // (the other level: only where there's a catwalk to be on)
  if (toLvl === 1 && !catwalkAt(at)) { const cw = CATWALKS.find(([a, b]) => Math.abs((a + b) / 2 - cx) < 800); if (cw) at = Math.max(cw[0] + 60, Math.min(cw[1] - 60, at)); else toLvl = 0; }
  let from = toLvl === 1 ? pickVent(at, 1) : (entry === 'ceil' ? at : pickFloorEntry(at));
  if (from === null || Math.abs(from - cx) < (toLvl === his ? 380 : 100)) {
    // (nowhere fair to come out there: the other side of him, or the floor ducts)
    from = pickFloorEntry(cx + (cx - at)); toLvl = 0; entry = 'duct';
    if (from === null || Math.abs(from - cx) < 380) { h.next = 60; return; }
  }
  if (toLvl === 0 && entry !== 'ceil') entry = DUCTS.includes(from) ? 'duct' : 'vent';
  // (her way: toward him and past, or along under/over him; lingering; now and then doubling back)
  const past = cx + Math.sign(cx - from || 1) * rnd(300, 600);
  const path: { x: number; stop?: number }[] = [{ x: past, stop: Math.random() < 0.5 ? rnd(60, 160) : 0 }];
  if (Math.random() < 0.35) path.push({ x: from + (past - from) * 0.4, stop: rnd(40, 120) });
  if (loud) path.unshift({ x: h.lastX, stop: 120 });
  emerge(state, h, toLvl, from, entry, path, rnd(1.6, 2.3), false);
};

/** A vent near x (on a catwalk, for the catwalks: `lvl` 1; any: -1). */
const pickVent = (x: number, lvl: 1 | -1) => {
  const ok = VENTS.filter(v => lvl < 0 || !!catwalkAt(v));
  if (!ok.length) return null;
  return ok.reduce((a, v) => (Math.abs(v - x) < Math.abs(a - x) ? v : a));
};
/** Somewhere she can come out onto the floor near x: a duct, or a vent with no catwalk under it. */
const pickFloorEntry = (x: number) => {
  const ok = [...DUCTS, ...VENTS.filter(v => !catwalkAt(v))].filter(v => v > B + 100 && v < STAIRS_A - 40);
  if (!ok.length) return null;
  return ok.reduce((a, v) => (Math.abs(v - x) < Math.abs(a - x) ? v : a));
};

/** She's coming: the tell first (her clicks nearer, the vent rattling, a screech), then out. */
const emerge = (state: GameState, h: Hunter, lvl: 0 | 1, from: number, entry: Entry, path: { x: number; stop?: number }[], speed: number, opener: boolean) => {
  h.lvl = lvl; h.x = from; h.y = levelY(lvl, from); h.entry = entry; h.huntOnDrop = false;
  h.path = path.map(q => ({ ...q, x: lvl ? Math.max((catwalkAt(from) ?? [from, from])[0] + 30, Math.min((catwalkAt(from) ?? [from, from])[1] - 30, q.x)) : Math.max(B + 40, Math.min(STAIRS_A - 30, q.x)) }));
  h.leg = 0; h.speed = speed; h.out = 0; h.passedClose = false;
  h.fg = opener ? { t: 0, dir: from > pmid(state) ? -1 : 1 } : null;
  h.rattle = { x: from, t: 0 };
  h.dir = pmid(state) < from ? -1 : 1;
  to(h, 'tell');
  playSound('screams', opener ? 0.35 : 0.3, -8);
};

// ---------------------------------------------------------------------------------------------------------------
// Her, each frame

const runHer = (ctx: FrameContext, h: Hunter) => {
  const { state } = ctx, p = state.player, cx = pmid(state);
  if (h.fg) { h.fg.t++; if (h.fg.t > 170) h.fg = null; }
  if (h.rattle) { h.rattle.t++; if (h.rattle.t > 160) h.rattle = null; }
  if (inPlay(h)) h.out++;
  switch (h.mode) {
    case 'away': return;
    case 'tell': {
      // (her clicks getting nearer, the vent (or the duct) rattling, dust down out of it; a screech; then out)
      const T = h.finale ? 70 : 120;
      if (h.t % 10 === 0) playSound('click', vol(state, h.x, 0.25 + h.t / 400), -2);
      if (h.fg && h.fg.t === 40 && !h.saidSpot) { h.saidSpot = true; meatheadSays(state, pick(L.MH_SPOT), false); }
      if (h.t % 14 === 0) dust(state, h.x, h.entry === 'duct' ? h.y - 70 : CEIL_B + 4, 3);
      if (h.t === T - 30) { playSound('clang', vol(state, h.x, 0.6), -4); shakeScreen(state, 2, 2); }
      if (h.t >= T) {
        if (h.entry === 'ceil') { to(h, 'ceil'); h.y = CEIL_B; playSound('thud', vol(state, h.x, 0.5), -10); }
        else { to(h, 'drop'); playSound('thud', vol(state, h.x, 0.8), -8); }
      }
      return;
    }
    case 'ceil': {
      // (along the ceiling upside down, over him: the clicks, the dust coming down under her; then she drops, on his
      // level, out in front of him (a beat first: she stops, screeches))
      const over = Math.abs(h.x - cx) < 260;
      if (!over && h.t < 400) { h.dir = cx < h.x ? -1 : 1; h.x += h.dir * 2.4; }
      if (h.t % 7 === 0) playSound('click', vol(state, h.x, 0.5), 2);
      if (h.t % 8 === 0) dust(state, h.x, CEIL_B + 10, 2);
      if (over || h.t >= 400) {
        if (!h.sniff) { h.sniff = 1; playSound('screams', vol(state, h.x, 0.6) + 0.2, -6); }
        if (++h.sniff > 34) {
          h.sniff = 0;
          // (down in front of him, on his level, far enough off to do something about it)
          const lv = plevel(state), lvl: 0 | 1 = lv === 1 ? 1 : 0, ahead = (p.facing || 1) as 1 | -1;
          h.lvl = lvl; h.x = lvl ? Math.max((catwalkAt(cx) ?? [cx, cx])[0] + 30, Math.min((catwalkAt(cx) ?? [cx, cx])[1] - 30, cx + ahead * 280)) : Math.max(B + 40, Math.min(STAIRS_A - 30, cx + ahead * 280));
          if (Math.abs(h.x - cx) < 200) h.x = Math.max(B + 40, Math.min(STAIRS_A - 30, cx - ahead * 280));
          h.y = levelY(lvl, h.x); h.path = [{ x: cx - ahead * 400 }]; h.leg = 0;
          to(h, 'drop');
        }
      }
      return;
    }
    case 'drop':
      h.dir = cx < h.x ? -1 : 1;
      if (h.t === 16) { playSound('land', vol(state, h.x, 0.9), -10); shakeScreen(state, 4, 3); dust(state, h.x, h.y - 4, 8); }
      if (h.t >= 22) {
        if (h.huntOnDrop) { to(h, 'hunt'); h.lastSeen = state.frame; playSound('roar', 0.8, -8); meatheadSays(state, pick(L.MH_SEEN), false); }
        else to(h, 'prowl');
      }
      return;
    case 'prowl': {
      const tgt = h.path[h.leg];
      if (!tgt || h.out > 900) { leave(h); return; }
      const dx = tgt.x - h.x;
      if (Math.abs(dx) > 4) { h.dir = dx < 0 ? -1 : 1; h.x += h.dir * Math.min(Math.abs(dx), h.speed); h.sniff = 0; }
      else if ((h.sniff += 1) >= (tgt.stop ?? 0)) {
        h.leg++; h.sniff = 0;
        // (the end of her way: now and then she doubles back a stretch before she goes)
        if (h.leg >= h.path.length && Math.random() < 0.3 && h.out < 600) h.path.push({ x: clampLvl(h, h.x - h.dir * rnd(250, 450)), stop: rnd(30, 90) });
      } else if (h.sniff % 30 === 0) { h.dir = (-h.dir) as 1 | -1; playSound('snort', 0.4 + vol(state, h.x, 0.3), -10); }
      h.x = clampLvl(h, h.x); h.y = levelY(h.lvl, h.x);
      steps(state, h, 24);
      if (sees(state, h)) spotted(state, h);
      else if (senses(state, h)) { h.dir = cx < h.x ? -1 : 1; startLeap(state, h, 'hunt'); }
      if (h.hid >= 0 && Math.abs(h.x - cx) < 260) h.passedClose = true;
      break;
    }
    case 'hunt': hunting(ctx, h); break;
    case 'search': {
      const tgt = h.path[0];
      if (tgt && Math.abs(tgt.x - h.x) > 4) { h.dir = tgt.x < h.x ? -1 : 1; h.x += h.dir * h.speed; }
      else if (h.t % 30 === 0) { h.dir = (-h.dir) as 1 | -1; playSound('snort', 0.5, -10); }
      h.x = clampLvl(h, h.x); h.y = levelY(h.lvl, h.x);
      steps(state, h, 26);
      if (h.hid >= 0 && Math.abs(h.x - cx) < 300) h.passedClose = true;
      if (sees(state, h)) spotted(state, h);
      if (h.t > 220) leave(h);
      break;
    }
    case 'crouch':
      // (the leap's tell: down on her haunches, the screech)
      if (h.t === 1) { playSound('screams', 0.6, -4); playSound('click', 0.6, 8); }
      if (h.t >= 24 && h.leap) { to(h, 'leap'); playSound('whoosh', 0.9, -8); }
      break;
    case 'leap': {
      const lp = h.leap!;
      const k = Math.min(1, h.t / 30);
      h.x = lp.x0 + (lp.x1 - lp.x0) * k;
      h.y = lp.y0 + (lp.y1 - lp.y0) * k - Math.sin(k * Math.PI) * 90;
      if (k >= 1) {
        h.lvl = lp.lvl; h.y = lp.y1; h.leap = null;
        playSound('land', vol(state, h.x, 0.9), -10); shakeScreen(state, 5, 3); dust(state, h.x, h.y - 4, 6);
        to(h, lp.then); h.lastSeen = state.frame;
        if (lp.then === 'prowl') { h.path = [{ x: clampLvl(h, cx), stop: 60 }]; h.leg = 0; }
      }
      break;
    }
    case 'climb':
      if (h.t === 2) playSound('clang', vol(state, h.x, 0.5), -2);
      if (h.t >= 24) {
        to(h, 'away'); h.next = h.finale ? 9999 : rnd(200, 380);
        if (h.passedClose && p.health > 0) meatheadSays(state, pick(L.MH_PASSED), false);
        h.passedClose = false;
      }
      return;
    case 'kill': killing(ctx, h); return;
  }
  // Touched (on her level, him not hidden): one shot
  if (h.hid < 0 && p.health > 0 && state.deathTimer <= 0 && h.mode !== 'leap' && h.mode !== 'crouch' && Math.abs(h.x - cx) < 48 && Math.abs(pfeet(state) - h.y) < 70) startKill(state, h);
};

/** Off she goes, back up a vent (or into a duct). */
const leave = (h: Hunter) => { to(h, 'climb'); h.entry = h.lvl === 0 && catwalkAt(h.x) ? 'duct' : 'vent'; };

/** She sees him: on her level, in front of her and near enough (or right on her), not hidden. */
const sees = (state: GameState, h: Hunter) => {
  const p = state.player, dx = pmid(state) - h.x;
  if (h.hid >= 0 || p.health <= 0 || p.inCutscene) return false;
  if (Math.abs(pfeet(state) - h.y) > 70) return false;
  return Math.abs(dx) < 110 || (Math.abs(dx) < 380 && Math.sign(dx) === h.dir);
};
/** She knows he's right over her, or under her (close, moving, not hidden): up (or down) after him. */
const senses = (state: GameState, h: Hunter) => {
  const p = state.player, lv = plevel(state);
  if (h.hid >= 0 || p.health <= 0 || lv < 0 || lv === h.lvl) return false;
  return Math.abs(pmid(state) - h.x) < 150 && (Math.abs(p.vel.x) > 0.5 || h.noise > 8);
};
const spotted = (state: GameState, h: Hunter) => {
  to(h, 'hunt'); h.lastSeen = state.frame;
  playSound('roar', 0.9, -6); shakeScreen(state, 4, 2);
  meatheadSays(state, pick(L.MH_SEEN), false);
};

/** Up or down a level, to him: the crouch (the tell), then the leap, landing short of him. */
const startLeap = (state: GameState, h: Hunter, then: Mode) => {
  const cx = pmid(state), lv = plevel(state), lvl: 0 | 1 = lv === 1 ? 1 : 0;
  if (lvl === h.lvl) return;
  let x1 = cx - Math.sign(cx - h.x || h.dir) * 90;
  if (lvl === 1) { const cw = catwalkAt(cx); if (!cw) return; x1 = Math.max(cw[0] + 30, Math.min(cw[1] - 30, x1)); }
  h.leap = { x0: h.x, y0: h.y, x1, y1: levelY(lvl, x1), lvl, then };
  h.dir = x1 < h.x ? -1 : x1 > h.x ? 1 : h.dir;
  to(h, 'crouch');
};

/** After him: on his level, flat out; up or down after him; lost him (hidden, unseen), searching; gone, off. */
/** Her top speed after him (px a frame). */
const HUNT_TOP = 15.5;
const hunting = (ctx: FrameContext, h: Hunter) => {
  const { state } = ctx, cx = pmid(state);
  if (h.hid >= 0 && h.hidT >= 0) { to(h, 'search'); h.path = [{ x: clampLvl(h, cx), stop: 140 }]; h.speed = 2; return; }
  const lv = plevel(state);
  const same = Math.abs(pfeet(state) - h.y) < 70;
  if (same || sees(state, h)) { h.lastSeen = state.frame; h.lastX = cx; }
  h.dir = cx < h.x ? -1 : 1;
  // (seen, he's as good as dead: she gets up to speed in half a second, then outruns him, charging or not (his charge is
  // 14 a frame); only the run up the stairs to the door is a chase he can win)
  const fast = h.finale ? 3.9 : Math.min(HUNT_TOP, 5 + h.t * 0.35);
  if (!same && lv >= 0 && lv !== h.lvl && Math.abs(cx - h.x) < 260 && (lv === 0 || catwalkAt(cx))) { startLeap(state, h, 'hunt'); return; }
  const want = clampLvl(h, cx);
  if (Math.abs(want - h.x) > 3) h.x += Math.sign(want - h.x) * Math.min(fast, Math.abs(want - h.x));
  // (at the end of her catwalk and him down below and on: down she goes)
  else if (h.lvl === 1 && !same && lv === 0 && Math.abs(cx - h.x) > 40) { startLeap(state, h, 'hunt'); return; }
  h.y = levelY(h.lvl, h.x);
  steps(state, h, 12);
  // (seen getting in: she tears it open, the door (the tarp) flung off, and him out of it by the head)
  if (h.hid >= 0 && h.hidT < 0 && Math.abs(h.x - cx) < 60) {
    const sp = HIDES[h.hid];
    h.torn = h.hid; state.player.hidden = false; h.hid = -1;
    playSound('crash', 1, -4); playSound('clang', 1, -8); playSound('roar', 0.9, -4); shakeScreen(state, 10, 5);
    for (let k = 0; k < 18; k++) state.particles.push({ pos: { x: sp.x + (Math.random() - 0.5) * 40, y: sp.y - 20 - Math.random() * 100 }, vel: { x: -h.dir * (2 + Math.random() * 7), y: -2 - Math.random() * 5 }, life: 50, color: sp.kind === 'dark' ? '#1E293B' : k % 3 ? '#475569' : '#94A3B8', size: 3 + Math.random() * 6, grav: 0.35 });
    startKill(state, h); return;
  }
  // (lost him: out of sight a good while, a way off; not on the stairs (she's on him to the door))
  if (!h.finale && state.frame - h.lastSeen > 200 && Math.abs(cx - h.x) > 500) { to(h, 'search'); h.path = [{ x: clampLvl(h, h.lastX), stop: 120 }]; h.speed = 2.2; }
};

const steps = (state: GameState, h: Hunter, every: number) => {
  if (h.t % every === 0) playSound('thud', vol(state, h.x, 0.5), -12);
  if (h.t % 13 === 0) playSound('click', vol(state, h.x, 0.35), 4);
  if (h.t % 90 === 45) playSound('gush', vol(state, h.x, 0.2), -14);
};
/** Dust down out of the ceiling (or a duct): grey, in steps. */
const dust = (state: GameState, x: number, y: number, n: number) => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 50, y }, vel: { x: (Math.random() - 0.5) * 0.8, y: 0.6 + Math.random() * 1.2 }, life: 50, color: i % 2 ? '#57534E' : '#78716C', size: 2 + Math.random() * 2, grav: 0.05 });
};

// ---------------------------------------------------------------------------------------------------------------
// The kill: snatched up to her face, the beat, his head torn off, the body dropped; she screeches over the head and
// pitches it

const startKill = (state: GameState, h: Hunter) => {
  to(h, 'kill');
  const p = state.player;
  p.inCutscene = true; p.carried = true; p.vel.x = 0; p.vel.y = 0;
  p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false;
  h.dir = pmid(state) < h.x ? -1 : 1;
  ripKill.floor = h.y;
  playSound('roar', 1, -4); shakeScreen(state, 8, 4);
};
/** Where he's held (his feet), t frames into it: up off the floor in her claws, out in front of her face (yanked down
 *  on the pull). */
const heldAt = (h: Hunter, t: number) => {
  const k = Math.min(1, t / K_SNATCH), e = 1 - (1 - k) * (1 - k);
  const pull = t >= K_PULL && t < K_RIP ? Math.sin(((t - K_PULL) / (K_RIP - K_PULL)) * Math.PI) * 10 : 0;
  return { x: h.x + h.dir * (60 + 64 * e), feet: h.y - 118 * e + pull };
};
/** Her mouth (the tip of her outer jaws), drawn at QS from her feet. */
const mouthAt = (h: Hunter) => ({ x: h.x + h.dir * 78, y: h.y - 176 });
/** Her outer jaws, opening in his face over the beat (0..1); wide over the head after. */
const jawOpen = (t: number) => (t < K_SNATCH ? 0.3 : t < K_RIP ? Math.min(1, 0.3 + (t - K_SNATCH) / 40) : t < K_TOSS ? 1 : 0.4);
/** Where his head is in her claw after the rip: up to her face, held up there while she screeches. */
const headHeld = (h: Hunter, t: number) => {
  const at = heldAt(h, K_RIP), from = { x: at.x, y: at.feet - 62 }, to2 = { x: h.x + h.dir * 96, y: h.y - 214 };
  const k = Math.min(1, (t - K_RIP) / 12), e = 1 - (1 - k) * (1 - k), shake = t < K_TOSS && t > K_RIP + 14 ? Math.sin(t * 1.3) * 3 : 0;
  return { x: from.x + (to2.x - from.x) * e + shake, y: from.y + (to2.y - from.y) * e };
};

const killing = (ctx: FrameContext, h: Hunter) => {
  const { state } = ctx, p = state.player;
  h.cam = t2cam(h);
  const t = h.t;
  if (t <= K_RIP) {
    // (held up in front of her face, kicking; her claw on his head; the pull)
    const at = heldAt(h, t), kick = t > K_SNATCH && t < K_PULL && (t >> 2) % 2 ? 1 : 0;
    p.pos.x = at.x - p.width / 2 + kick * h.dir; p.pos.y = at.feet - p.height; p.vel.x = 0; p.vel.y = kick ? -1 : 0;
    p.facing = (h.dir > 0 ? -1 : 1);
    if (t === 2) playSound('screams', 0.7, -6);
    if (t === K_SNATCH + 8) playSound('snort', 0.7, -14);
    if (t === K_GRIP) { playSound('clink', 0.8, -10); playSound('click', 0.8, -4); }
    if (t > K_SNATCH && t % 12 === 0) playSound('click', 0.6, 2 - t / 20);
    if (t > K_GRIP && t < K_PULL && t % 6 === 0) playSound('grind', 0.4, 4 + (t - K_GRIP) / 4);
    if (t === K_PULL) { playSound('crunch', 0.8, -10); shakeScreen(state, 4, 2); }
    if (t > K_SNATCH + 10 && t % 6 === 0) state.particles.push({ pos: { x: mouthAt(h).x + h.dir * 4, y: mouthAt(h).y + 14 }, vel: { x: 0, y: 1 }, life: 30, color: '#D9F99D', size: 2, grav: 0.2 });
  }
  if (t === K_RIP) {
    // (off it comes: the rip, the pop, the spray; dead)
    const at = heldAt(h, t), hx = at.x, hy = at.feet - 56;
    playSound('crunch', 1, -2); playSound('splat', 1, -4); playSound('gorespray', 1, -2); shakeScreen(state, 14, 7);
    for (let i = 0; i < 30; i++) state.particles.push({ pos: { x: hx, y: hy }, vel: { x: (Math.random() - 0.5) * 8, y: -4 - Math.random() * 7 }, life: 55, color: GORE[i % GORE.length], size: 2 + Math.random() * 4, grav: 0.35 });
    // (still held where he is (by the body, her other claw): dropped when she lets go (his death's own drawing))
    p.carried = true; p.invincibilityTimer = 0; p.inCutscene = false;
    hurtPlayer(ctx, 9999, JAW, { x: 0, y: 0 }, 0);
    p.vel.x = 0; p.vel.y = 0;
  }
  if (t > K_RIP && t <= K_DROP) { const at = heldAt(h, K_RIP); p.pos.x = at.x - p.width / 2; p.pos.y = at.feet - p.height; p.vel.x = 0; p.vel.y = 0; }
  if (t === K_DROP) { p.carried = false; playSound('whoosh', 0.5, -6); }
  // (done: she turns, and she's off up a vent (the respawn's long since put things back, as a rule))
  if (t > K_END) leave(h);
};
/** The kill cam: in close for it (eased in while he's alive), back out once she's pitched the head. */
const t2cam = (h: Hunter) => Math.min(1, h.cam + 0.06);
/** The kill's clock: her own frames till the rip; after it the world's held while his death plays, so her side of it
 *  (the head up to her face, the screech, the toss) runs off his death's own time. */
const killT = (state: GameState, h: Hunter) => (h.mode === 'kill' && state.meatheadDeath?.kind === RIPPED ? K_RIP + (state.deathScene?.t ?? 0) : h.t);
/** The camera in, by the kill's clock. */
const camK = (state: GameState, h: Hunter) => {
  if (h.mode !== 'kill') return h.cam;
  const t = killT(state, h);
  return t < K_TOSS + 10 ? h.cam : Math.max(0, 1 - (t - K_TOSS - 10) * 0.03);
};
/** His head, pitched (from K_TOSS): an arc back behind her, a bounce, then it lies there. */
const headFlight = (h: Hunter, t: number) => {
  const st = headHeld(h, K_TOSS), s2 = t - K_TOSS, floor = h.y - 10, g = 0.5, vy = -7, vx = -h.dir * 5;
  const land = (-vy + Math.sqrt(vy * vy + 2 * g * (floor - st.y))) / g;
  if (s2 <= land) return { x: st.x + vx * s2, y: st.y + vy * s2 + 0.5 * g * s2 * s2, r: vx * 0.06 * s2 };
  const b = s2 - land, bv = 2.4, bt = (2 * bv) / g, x1 = st.x + vx * land;
  if (b <= bt) return { x: x1 + vx * 0.5 * b, y: floor - (bv * b - 0.5 * g * b * b), r: vx * 0.06 * (land + b) };
  const roll = Math.min(18, (b - bt) * 0.8);
  return { x: x1 + vx * 0.5 * bt + Math.sign(vx) * roll, y: floor, r: vx * 0.06 * (land + bt) + Math.sign(vx) * roll * 0.1 };
};
/** The camera in on the kill: her head and his, filling the screen. */
export const hunterZoom = (state: GameState, h: Hunter) => {
  const cam = camK(state, h);
  if (cam <= 0) return null;
  const k = cam * cam * (3 - 2 * cam), m = mouthAt(h), fx = m.x + h.dir * 30, fy = m.y + 10;
  const z = 1 + k * 1.4;
  return { scale: z, x: fx, y: fy, shiftX: k * (state.camera.x + CANVAS_WIDTH / 2 - fx), shiftY: k * (state.camera.y + CANVAS_HEIGHT / 2 - fy) };
};

// ---------------------------------------------------------------------------------------------------------------
// The disco's door, at the top of the stairs: up to it, the boot (the chase is over: she's held off for it)

export const atDoor = (state: GameState, h: Hunter) => h.door === 'shut' && pmid(state) > DOOR_X - 150 && state.player.isGrounded && state.player.health > 0 && state.deathTimer <= 0 && h.mode !== 'kill';
export const startKick = (state: GameState, h: Hunter) => {
  h.door = 'kicking'; h.doorT = 0;
  const p = state.player;
  if (h.hid >= 0) { h.hid = -1; p.hidden = false; }
  p.inCutscene = true;
};
/** Frames the kicked door takes to go over flat. */
const DOOR_FALL = 16;
const kick = (ctx: FrameContext, h: Hunter): Controls => {
  const { state } = ctx, p = state.player;
  h.doorT++;
  const t = h.doorT;
  p.inCutscene = true; p.facing = 1;
  if (t < 10) { p.vel.x = 0; p.pos.x += (DOOR_X - 90 - p.width / 2 - p.pos.x) * 0.3; }
  if ((p.kickPose || 0) > 0) p.kickPose!--;
  if (t === 8) { p.kickPose = KICK_POSE_FRAMES; playSound('whoosh', 0.7, -4); }
  if (t === 18) {
    if (h.block) { state.blocks = state.blocks.filter(b => b !== h.block); h.block = null; }
    state.stageMemo[DOOR_MEMO] = '1';
    playSound('crash', 1, -4); playSound('boom', 0.6, 2); shakeScreen(state, 14, 7);
    for (let i = 0; i < 26; i++) state.particles.push({ pos: { x: DOOR_X - 10 + Math.random() * 20, y: GY - 20 - Math.random() * 150 }, vel: { x: 2 + Math.random() * 6, y: -2 - Math.random() * 4 }, life: 50, color: ['#C026D3', '#F472B6', '#FDE047', '#A1A1AA'][i % 4], size: 3 + Math.random() * 5, grav: 0.35 });
    // (and she's done with: the chase is over)
    to(h, 'away'); h.next = 1e9; h.finale = true; h.fg = null; h.rattle = null; h.fake = null;
  }
  // (the door down flat: a slam and a puff of dust off the floor)
  if (t === 18 + DOOR_FALL) { playSound('slam', 1, -10); playSound('thud', 0.8, -8); shakeScreen(state, 8, 4); for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: DOOR_X + 60 + Math.random() * 200, y: GY - 4 }, vel: { x: (Math.random() - 0.3) * 4, y: -1 - Math.random() * 2 }, life: 40, color: 'rgba(214, 211, 209, 0.6)', size: 4 + Math.random() * 6 }); }
  if (t > 30 && pmid(state) < DISCO_L + 130) return { ...hands(), right: true } as Controls;
  if (t > 18 + DOOR_FALL) { h.door = 'in'; p.inCutscene = false; p.kickPose = 0; }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** World space, in the play plane: her (dropping, prowling, after him, on the ceiling, leaping, the kill). */
export const drawHunter = (c: Ctx, state: GameState, h: Hunter) => {
  if (!inPlay(h)) return;
  const f = state.frame;
  if (h.mode === 'ceil') {
    // (upside down along the ceiling: her feet to it, hanging, crawling)
    c.save(); c.translate(h.x, CEIL_B); c.scale(QS, -QS); c.translate(-h.x, -GY);
    drawQueen(c, h.x, h.dir, { pose: 'stalk', t: f, ext: 0, alive: 1, beat: 0, free: true, stride: h.sniff ? 0 : f * 0.16 });
    c.restore();
    return;
  }
  // (out of the vent (down from the ceiling) or the duct (out of the back wall, coming forward out of the dark))
  let dy = 0, alpha = 1;
  if (h.mode === 'drop') { if (h.entry === 'duct') alpha = Math.min(1, h.t / 18); else dy = -(h.y - CEIL_B) * Math.max(0, 1 - h.t / 16); }
  if (h.mode === 'climb') { if (h.entry === 'duct') alpha = Math.max(0, 1 - h.t / 20); else dy = -(h.y - CEIL_B) * Math.min(1, h.t / 22); }
  const crouch = h.mode === 'crouch' ? 0.82 : 1;
  const kill = h.mode === 'kill', kt = killT(state, h);
  const pose = kill ? (kt < K_SNATCH ? 'swipe' : kt >= K_RIP + 14 && kt < K_TOSS ? 'roar' : 'grab') : h.mode === 'crouch' ? 'roar' : h.mode === 'leap' ? 'swipe' : h.mode === 'hunt' ? 'stalk' : h.mode === 'search' || (h.mode === 'prowl' && h.sniff > 0) ? 'idle' : 'stalk';
  const moving = h.mode === 'prowl' && h.sniff === 0 || h.mode === 'hunt' || h.mode === 'search';
  if (alpha < 1) c.globalAlpha = alpha;
  c.save(); c.translate(h.x, h.y + dy); c.scale(QS, QS * crouch); c.translate(-h.x, -GY);
  drawQueen(c, h.x, h.dir, { pose, t: f, ext: 0, alive: 1, beat: 0, free: true, stride: moving ? f * (h.mode === 'hunt' ? 0.35 : 0.16) : 0, jaw: kill ? jawOpen(kt) : undefined, inner: kill ? (kt >= K_RIP + 14 && kt < K_TOSS ? 1 : 0) : undefined });
  c.restore();
  c.globalAlpha = 1;
  if (kill) drawRip(c, state, h);
};

/** The kill, her side of it: her claw closing over his head (the beat), his head in it after (up to her face while
 *  she screeches; then pitched, bouncing, lying there). World. */
const drawRip = (c: Ctx, state: GameState, h: Hunter) => {
  const t = killT(state, h);
  // (her hand: down onto the top of his head, the fingers closing round it; the pull; up with it to her face)
  const shoulder = { x: h.x + h.dir * 26, y: h.y - 196 };
  if (t >= K_GRIP && t < K_RIP) {
    const at = heldAt(h, t), k = Math.min(1, (t - K_GRIP) / 10);
    const hx = at.x, hy = at.feet - 58, reach = Math.min(1, (t - K_GRIP) / 6);
    claw(c, shoulder, { x: shoulder.x + (hx - shoulder.x) * reach, y: shoulder.y + (hy - shoulder.y) * reach }, h.dir, k);
    if (t >= K_PULL) { box(c, hx - 9, hy + 10, 18, 3, '#991B1B'); box(c, hx - 2, hy + 12, 3, 4 + (t - K_PULL), '#B91C1C'); }
  }
  if (t >= K_RIP) {
    const flying = t >= K_TOSS, hp = flying ? headFlight(h, t) : { ...headHeld(h, t), r: 0 };
    drawHead(c, hp.x, hp.y, hp.r, h.dir);
    if (!flying) claw(c, shoulder, { x: hp.x, y: hp.y }, h.dir, 1);
  }
};
/** Her hand over a head at `on` (its middle), the arm down to it from her shoulder: the palm on top, four long fingers
 *  curled down round it (k: how far closed), claws at their ends. World. */
const claw = (c: Ctx, from: { x: number; y: number }, on: { x: number; y: number }, dir: 1 | -1, k: number) => {
  const wx = on.x + dir * 14, wy = on.y - 16;
  limb(c, from.x, from.y, (from.x + wx) / 2 + dir * 6, (from.y + wy) / 2 - 10, 8, '#1F2028');
  limb(c, (from.x + wx) / 2 + dir * 6, (from.y + wy) / 2 - 10, wx, wy, 7, '#1F2028');
  ink(c, () => c.ellipse(on.x + dir * 4, on.y - 13, 14, 7, 0, 0, Math.PI * 2), '#1F2028', 1.5);
  box(c, Math.round(on.x - 6), Math.round(on.y - 18), 12, 2, '#6B7280');
  for (let i = 0; i < 4; i++) {
    const fx = on.x - dir * 10 + dir * i * 7, sx = (i - 1.5) * (3 + k * 3);
    const tipX = fx + sx, tipY = on.y - 8 + k * 14;
    limb(c, fx, on.y - 14, tipX, tipY, 4, '#343744');
    box(c, Math.round(tipX) - 1, Math.round(tipY), 3, 3, '#D1D5DB');
  }
};

/** His head, off: the flat-top, the brow, X eyes, the mouth hanging open, the ragged neck end dripping. World, its
 *  middle at (x, y), turned r. */
const drawHead = (c: Ctx, x: number, y: number, r: number, dir: 1 | -1) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(r); c.scale(-dir, 1);
  box(c, -11, -11, 22, 22, '#3B1F0E');
  box(c, -10, -10, 20, 20, '#E0A060');
  box(c, -10, 4, 20, 6, '#C8864A');
  box(c, -11, -14, 22, 6, '#18181B'); for (let i = 0; i < 5; i++) box(c, -10 + i * 4, -16, 2, 3, '#18181B');
  box(c, -8, -5, 7, 2, '#18181B'); box(c, 2, -5, 7, 2, '#18181B');
  for (const ex of [-6, 4]) { box(c, ex, -2, 1, 1, '#18181B'); box(c, ex + 2, -2, 1, 1, '#18181B'); box(c, ex + 1, -1, 1, 1, '#18181B'); box(c, ex, 0, 1, 1, '#18181B'); box(c, ex + 2, 0, 1, 1, '#18181B'); }
  box(c, -4, 4, 9, 4, '#450A0A'); box(c, -2, 7, 4, 2, '#F472B6');
  // (the neck end: ragged, red, a bit of spine)
  box(c, -8, 10, 16, 4, '#991B1B'); box(c, -6, 13, 4, 3, '#7F1D1D'); box(c, 2, 13, 5, 2, '#7F1D1D'); box(c, -1, 11, 3, 4, '#F5F5F4');
  c.restore();
};

/** World space: the hiding spots (lockers, dark corners, the cabinets up top), him in one, the door. */
export const drawHides = (c: Ctx, state: GameState, h: Hunter) => {
  const v = state.camera.x;
  for (let i = 0; i < HIDES.length; i++) {
    const s = HIDES[i], y = s.y;
    if (s.x < v - 100 || s.x > v + CANVAS_WIDTH + 100) continue;
    const inIt = h.hid === i;
    // (torn open on him: the door (the tarp, the heap) ripped off and gone, the inside gutted, the hinges bent out)
    if (h.torn === i) {
      const top = s.kind === 'locker' ? y - 128 : s.kind === 'cabinet' ? y - 108 : y - 110, w = s.kind === 'dark' ? 80 : 56;
      box(c, s.x - w / 2 - 2, top - 2, w + 4, y - top + 2, '#020203');
      box(c, s.x - w / 2, top, w, y - top, '#0B0B10');
      if (s.kind !== 'dark') { box(c, s.x - w / 2 - 2, top, 4, y - top, '#475569'); for (const hy of [top + 18, y - 30]) { box(c, s.x - w / 2 - 8, hy, 8, 3, '#94A3B8'); box(c, s.x - w / 2 - 12, hy - 4, 4, 4, '#94A3B8'); } }
      for (let k = 0; k < 5; k++) box(c, s.x - w / 2 + 6 + k * (w / 5), y - 4 - (k % 2) * 3, 6, 4, k % 2 ? '#334155' : '#7F1D1D');
      continue;
    }
    if (s.kind === 'locker') {
      stamp(c, `sp-q-locker-${i}`, s.x - 30, y - 132, 60, 134, g => {
        ink(g, () => g.rect(s.x - 26, y - 128, 52, 128), '#475569', 2);
        g.fillStyle = '#334155'; g.fillRect(s.x - 22, y - 124, 44, 120);
        g.fillStyle = '#3F4E63'; g.fillRect(s.x - 22, y - 124, 6, 120);
        for (let k = 0; k < 5; k++) { g.fillStyle = '#0F172A'; g.fillRect(s.x - 14, y - 116 + k * 6, 28, 3); }
        g.fillStyle = '#E2E8F0'; g.fillRect(s.x - 16, y - 70, 32, 10); g.fillStyle = '#0F172A'; g.font = '5px "Press Start 2P"'; g.fillText(['BRENDA', 'GARY', 'SID', 'CHUCK', 'SUSAN', 'GLENN', 'LILLY', 'MATT', 'JJ'][i % 9], s.x - 14, y - 62);
        g.fillStyle = '#94A3B8'; g.fillRect(s.x + 14, y - 64, 3, 12);
      });
      if (inIt && state.frame % 90 > 4) { box(c, s.x - 8, y - 110, 4, 3, '#F8FAFC'); box(c, s.x + 4, y - 110, 4, 3, '#F8FAFC'); box(c, s.x - 7, y - 110, 2, 2, '#DC2626'); box(c, s.x + 5, y - 110, 2, 2, '#DC2626'); }
    } else if (s.kind === 'cabinet') {
      // (an air handler's cabinet up on the catwalk: its door hanging open a crack, the louvers, room for one idiot)
      stamp(c, `sp-q-cab-${i}`, s.x - 34, y - 112, 68, 114, g => {
        ink(g, () => g.rect(s.x - 30, y - 108, 60, 108), '#3F3F46', 2);
        g.fillStyle = '#27272A'; g.fillRect(s.x - 26, y - 104, 52, 100);
        g.fillStyle = '#52525B'; g.fillRect(s.x - 26, y - 104, 52, 3);
        for (let k = 0; k < 6; k++) { g.fillStyle = '#0A0A0F'; g.fillRect(s.x - 20, y - 94 + k * 9, 40, 4); g.fillStyle = '#3F3F46'; g.fillRect(s.x - 20, y - 90 + k * 9, 40, 1); }
        g.fillStyle = '#A16207'; g.font = '5px "Press Start 2P"'; g.fillText('AHU-2', s.x - 14, y - 10);
      });
      if (inIt && state.frame % 90 > 4) { box(c, s.x - 7, y - 76, 3, 2, '#F8FAFC'); box(c, s.x + 4, y - 76, 3, 2, '#F8FAFC'); }
    } else {
      // (a dark corner: behind a heap of broken animatronics and a tarp)
      stamp(c, `sp-q-dark-${i}`, s.x - 60, y - 120, 120, 122, g => {
        g.fillStyle = '#0A0A0F'; g.fillRect(s.x - 40, y - 110, 80, 110);
        ink(g, () => { g.moveTo(s.x - 56, y); g.quadraticCurveTo(s.x - 40, y - 120, s.x + 10, y - 112); g.quadraticCurveTo(s.x + 50, y - 100, s.x + 56, y); g.closePath(); }, '#1E293B', 2);
        g.fillStyle = '#15803D'; g.beginPath(); g.ellipse(s.x - 30, y - 30, 16, 18, 0.3, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#0A0A0A'; g.beginPath(); g.ellipse(s.x - 36, y - 30, 5, 3, 0.5, 0, Math.PI * 2); g.ellipse(s.x - 24, y - 30, 5, 3, -0.5, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#F5F5F4'; g.fillRect(s.x + 20, y - 26, 24, 14); g.fillStyle = '#18181B'; g.fillRect(s.x + 26, y - 24, 8, 6);
      });
      if (inIt && state.frame % 90 > 4) { box(c, s.x - 4, y - 70, 3, 2, '#F8FAFC'); box(c, s.x + 5, y - 70, 3, 2, '#F8FAFC'); }
    }
  }
  // (a vent rattling: her coming, or nothing)
  for (const r of [h.rattle, h.fake]) {
    if (!r || r.t > 150 || h.mode === 'ceil' && r === h.rattle) continue;
    const j = (state.frame >> 1) % 2 ? 2 : -2, duct = r === h.rattle && h.entry === 'duct';
    if (duct) { const y = BF - 70; box(c, r.x - 32 + j, y, 64, 44, '#020203'); for (let s = 0; s < 6; s++) box(c, r.x - 30 + j + s * 11, y + 2, 4, 40, '#3F3F4C'); }
    else { box(c, r.x - 30 + j, CEIL_B - 2, 60, 9, '#020203'); for (let s = 0; s < 6; s++) box(c, r.x - 28 + j + s * 10, CEIL_B - 2, 3, 9, '#4B4B57'); }
  }
};
/** The disco's door (drawn over the hall's wall at its left end). World. */
export const drawDiscoDoor = (c: Ctx, state: GameState, h: Hunter) => drawDoor(c, state, h);

/** GALACTIC GROOVE's door at the top of the stairs: chrome and purple, bulbs round it chasing, a star on it; kicked in,
 *  flat on the floor. */
const drawDoor = (c: Ctx, state: GameState, h: Hunter) => {
  if (DOOR_X < state.camera.x - 200 || DOOR_X > state.camera.x + CANVAS_WIDTH + 200) return;
  const f = state.frame, x = DOOR_X;
  box(c, x - 70, GY - 220, 140, 220, '#3B0764');
  box(c, x - 60, GY - 210, 120, 210, '#0A0510');
  for (let i = 0; i < 18; i++) {
    const a = i / 17, bx = i < 6 ? x - 66 : i < 12 ? x - 66 + (i - 6) * 26 : x + 62, by = i < 6 ? GY - a * 6 * 36 : i < 12 ? GY - 214 : GY - (17 - i) * 36;
    box(c, bx, by, 6, 6, (i + Math.floor(f / 6)) % 3 === 0 ? '#FDE047' : '#78350F');
  }
  label(c, 'GALACTIC GROOVE', x, GY - 236, (Math.floor(f / 20) % 2 ? '#F472B6' : '#C084FC'), 8);
  // (kicked: the door goes over, off its hinges, falling away from us into the hall about its bottom edge, faster and
  // faster (seen face on: it shortens down to the floor), flat on the floor in the doorway)
  const fall = h.door === 'kicking' ? Math.max(0, Math.min(1, (h.doorT - 18) / DOOR_FALL)) : h.door === 'in' ? 1 : 0;
  if (fall > 0) {
    const sy = Math.max(0.06, Math.cos(fall * fall * (Math.PI / 2)));
    c.save(); c.translate(x, GY); c.scale(1, sy); c.translate(-x, -GY);
    ink(c, () => c.rect(x - 56, GY - 206, 112, 206), '#7E22CE', 2);
    box(c, x - 50, GY - 200, 44, 194, '#A855F7'); box(c, x + 6, GY - 200, 44, 194, '#A855F7');
    box(c, x - 50, GY - 200, 100, 4, '#E9D5FF');
    if (sy > 0.4) label(c, 'MEMBERS ONLY', x, GY - 120, '#FDE047', 6);
    c.restore();
    // (lying there: its edge lit, the hall's lights through the empty doorway)
    if (fall >= 1) { box(c, x - 58, GY - 13, 116, 3, '#C084FC'); box(c, x - 56, GY - 206, 112, 192, `rgba(${f % 40 < 20 ? '244, 114, 182' : '125, 211, 252'}, 0.18)`); }
    return;
  }
  if (h.door !== 'in') {
    ink(c, () => c.rect(x - 56, GY - 206, 112, 206), '#7E22CE', 2);
    box(c, x - 2, GY - 206, 4, 206, '#3B0764');
    box(c, x - 50, GY - 200, 44, 194, '#A855F7'); box(c, x + 6, GY - 200, 44, 194, '#A855F7');
    box(c, x - 50, GY - 200, 44, 4, '#E9D5FF'); box(c, x + 6, GY - 200, 44, 4, '#E9D5FF');
    label(c, 'MEMBERS ONLY', x, GY - 120, '#FDE047', 6);
    if (f % 30 < 3) box(c, x - 50, GY - 200, 100, 194, 'rgba(255, 255, 255, 0.08)');
  } else {
    box(c, x + 10, GY - 8, 120, 8, '#7E22CE'); box(c, x + 14, GY - 10, 112, 3, '#C084FC');
    box(c, x - 56, GY - 206, 112, 206, `rgba(${f % 40 < 20 ? '244, 114, 182' : '125, 211, 252'}, 0.18)`);
  }
};

/** Screen space, over everything: the foreground pipes (parallax, near), and her silhouette crawling along them. */
let sil: HTMLCanvasElement | null = null;
export const drawHunterFront = (c: Ctx, state: GameState, h: Hunter) => {
  const cam = state.camera.x;
  if (cam + CANVAS_WIDTH < B - 100 || cam > STAIRS_A + 100) return;
  // (only down in it: not looking at the hold above, not on the stairs)
  if (state.camera.y < GY - 200) return;
  c.save(); c.beginPath(); c.rect(0, 0, Math.max(0, Math.min(CANVAS_WIDTH, STAIRS_A - 60 - cam)), CANVAS_HEIGHT); c.clip();
  const off = -((cam - B) * 1.35);
  c.fillStyle = '#05050A'; c.fillRect(0, 36, CANVAS_WIDTH, 26); c.fillRect(0, 74, CANVAS_WIDTH, 14);
  c.fillStyle = '#16161F'; c.fillRect(0, 36, CANVAS_WIDTH, 3); c.fillRect(0, 74, CANVAS_WIDTH, 2);
  for (let k = 0; k < 12; k++) {
    const x = ((off + k * 700) % (12 * 700) + 12 * 700) % (12 * 700) - 200;
    if (x < -80 || x > CANVAS_WIDTH + 80) continue;
    c.fillStyle = '#05050A'; c.fillRect(x, 36, 34, CANVAS_HEIGHT); c.fillStyle = '#16161F'; c.fillRect(x, 36, 3, CANVAS_HEIGHT);
    c.fillStyle = '#0B0B12'; c.fillRect(x - 6, 120 + (k % 3) * 120, 46, 12);
  }
  if (h.fg) {
    const k = h.fg.t / 170, sx = h.fg.dir < 0 ? CANVAS_WIDTH + 260 - k * (CANVAS_WIDTH + 520) : -260 + k * (CANVAS_WIDTH + 520);
    if (!sil) { sil = document.createElement('canvas'); sil.width = 640; sil.height = 420; }
    const g = sil.getContext('2d')!;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, 640, 420);
    g.save(); g.translate(320, 390); g.scale(1.25, 1.25); g.rotate(h.fg.dir * 0.05); g.translate(0, -GY);
    drawQueen(g, 0, h.fg.dir, { pose: 'stalk', t: state.frame, ext: 0, alive: 1, beat: 0, free: true, stride: h.fg.t * 0.2 });
    g.restore();
    g.globalCompositeOperation = 'source-in'; g.fillStyle = '#030306'; g.fillRect(0, 0, 640, 420); g.globalCompositeOperation = 'source-over';
    c.fillStyle = 'rgba(127, 29, 29, 0.28)'; c.beginPath(); c.ellipse(sx, 190, 260, 150, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(185, 28, 28, 0.18)'; c.beginPath(); c.ellipse(sx, 190, 170, 100, 0, 0, Math.PI * 2); c.fill();
    c.save(); c.translate(Math.round(sx), 40); c.scale(1, -1);
    c.drawImage(sil, -320, -390, 640, 420);
    c.restore();
    const ex = sx + h.fg.dir * 120, ey = 40 + 300;
    box(c, ex - 10, ey, 7, 4, '#84FF50'); box(c, ex + 4, ey, 7, 4, '#84FF50');
  }
  c.restore();
  // (the kill cam's bars)
  const camB = camK(state, h);
  if (camB > 0) { const bar = Math.round(camB * 44); c.fillStyle = '#000'; c.fillRect(0, 0, CANVAS_WIDTH, bar); c.fillRect(0, CANVAS_HEIGHT - bar, CANVAS_WIDTH, bar); }
  if (h.mode === 'kill' && killT(state, h) >= K_RIP && killT(state, h) < K_RIP + 3) { c.fillStyle = 'rgba(255, 255, 255, 0.3)'; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
};

/** The dark: a tight light round him, the strips flickering, her eyes when she's out. Null outside the basement. */
export const hunterLighting = (state: GameState, h: Hunter): SceneLight | null => {
  const p = state.player, cx = pmid(state);
  if (cx < B - 80 || cx > DOOR_X + 20 || pfeet(state) < GY - 40 && cx < STAIRS_A) return null;
  const lights: Light[] = [{ x: cx, y: p.pos.y + 30, r: h.hid >= 0 ? 60 : 150, a: 1 }];
  for (const s of STRIPS) {
    if (Math.abs(s - cx) > 900) continue;
    const on = Math.sin(state.frame * 0.13 + s) > -0.6 && (state.frame + s) % 97 > 6;
    if (on) lights.push({ x: s, y: CEIL_B + 20, r: 110, a: 0.6, color: 'rgba(239, 68, 68, 0.12)' });
  }
  // (the catwalks' cage lamps, dim)
  for (const [a, b] of CATWALKS) if (Math.abs((a + b) / 2 - cx) < 1000) lights.push({ x: (a + b) / 2, y: CATWALK_Y - 120, r: 90, a: 0.45, color: 'rgba(253, 186, 116, 0.08)' });
  // (her: the green under her crest; a little of her shape out of the dark, so she reads)
  if (inPlay(h)) {
    const hy = h.mode === 'ceil' ? CEIL_B + 160 : h.y - 190;
    lights.push({ x: h.x + h.dir * 50, y: hy, r: 80, a: 0.8, color: 'rgba(132, 255, 80, 0.22)' });
    lights.push({ x: h.x, y: h.mode === 'ceil' ? CEIL_B + 110 : h.y - 110, r: 170, a: 0.3 });
  }
  // (the hold's light down through the hole he came down)
  if (state.stageMemo[FELL_MEMO] && Math.abs(LAND_X - cx) < 900) lights.push({ x: LAND_X, y: CEIL_B + 140, r: 240, a: 0.55, color: 'rgba(167, 139, 250, 0.10)' });
  // (the kill: lit up close)
  if (h.mode === 'kill') lights.push({ x: mouthAt(h).x, y: mouthAt(h).y, r: 140, a: 0.9 });
  // (the stairs: the disco's light down them from the door)
  if (cx > STAIRS_A - 600) lights.push({ x: DOOR_X - 60, y: GY - 100, r: 340, a: 0.5, color: 'rgba(244, 114, 182, 0.1)' });
  if (Math.abs(DOOR_X - cx) < 900) lights.push({ x: DOOR_X, y: GY - 120, r: 200, a: 0.8, color: 'rgba(244, 114, 182, 0.12)' });
  void BASE_R;
  return { dark: 0.94, shade: [2, 2, 8], lights, rim: 0.3 };
};
