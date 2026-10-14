// The dino park's guests: people out for the day all along the park, in the background (never anything to stand on;
// dimmed back), watching the show. Behind the raptor pen's viewing-gallery glass, along the path by the booth, a tour
// group behind the meadow's rail, families about the plaza, the T. rex feeding show's bleachers behind the paddock's
// fence, a few by the exit. Each its own person (temple/people.ts, by seed), some with something: a camera, a dad's
// camcorder, a kid on his shoulders, the tour guide's flag, an ice cream, a balloon; fanny packs, sunburns, shorts.
//
// Nobody told them the robots went HOSTILE (the pebble): it's a show to them. Now and then the nearest of them says
// something (one line at a time, only when nobody else is talking): as he goes by, when he kills one of the robots (it
// bleeds), when one gets him, when the T. rex comes apart. Each thing he does that a show wouldn't, they're surer it
// isn't one ('show', then 'doubt').
//
// Revisit (back through the park from the temple's side, or started there): they've cleared out, all that's left of
// them what they dropped running (art/zoo.ts). Kept across his deaths (state.stageMemo).

import type { GameState } from '../../../m1/game/core/state';
import { isTalking, pickLine } from '../../../m1/game/platform/speech';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { GY } from '../geometry';
import { speak, saidOver, getAdv } from '../section';
import { D, PADDOCK_IN } from './layout';
import { eyeOf, viewOf, P } from './art/kit';
import { GUEST_SEE, GUEST_KILL, GUEST_HURT, GUEST_REX, type Dressed } from './lines';
import { lookOf } from '../temple/people';

export type GuestProp = 'none' | 'camera' | 'camcorder' | 'flag' | 'shoulders' | 'icecream' | 'balloon' | 'kid';
/** Where they're drawn: behind the pen's gallery glass, well back (the meadow, the bleachers), or nearer (the path). */
export type GuestZone = 'window' | 'far' | 'near';
export interface DinoGuest {
  x: number; y: number; d: number; zone: GuestZone; prop: GuestProp; seed: number;
  woman: boolean;
  said: string | null;
}

/** The pen's viewing gallery: a window along its back wall (pushed back to its depth), and where they stand in it. */
export const GALLERY = { x: D + 180, w: 565, top: GY - 290, bottom: GY - 226, d: 0.7, feet: GY - 186 };
/** The T. rex feeding show's bleachers, behind the paddock's back fence: each section's left end, its rows' tops. */
export const BLEACHERS = { d: 0.64, xs: [PADDOCK_IN + 350, PADDOCK_IN + 950, PADDOCK_IN + 1550], w: 260, rows: [GY - 20, GY - 44, GY - 68] };
const MEADOW_D = 0.71, NEAR_D = 0.82;

const spots: [number, number, number, GuestZone, GuestProp][] = [
  // the pen's gallery
  ...([[215, 'camera'], [285, 'kid'], [345, 'none'], [420, 'camcorder'], [500, 'shoulders'], [578, 'none'], [648, 'camera'], [712, 'icecream']] as const)
    .map(([x, p]) => [D + x, p === 'kid' ? GALLERY.feet - 14 : GALLERY.feet, GALLERY.d, 'window', p] as [number, number, number, GuestZone, GuestProp]),
  // the path by the booth
  ...([[1068, 'camcorder'], [1104, 'none'], [1134, 'kid'], [1452, 'camera'], [1486, 'none']] as const).map(([x, p]) => [D + x, GY, NEAR_D, 'near', p] as [number, number, number, GuestZone, GuestProp]),
  // the tour group behind the meadow's rail, and a couple
  ...([[1600, 'flag'], [1638, 'camera'], [1670, 'none'], [1704, 'shoulders'], [1740, 'none'], [1772, 'balloon'], [1802, 'kid'], [1836, 'camera'], [2380, 'icecream'], [2414, 'none']] as const)
    .map(([x, p]) => [D + x, GY, MEADOW_D, 'far', p] as [number, number, number, GuestZone, GuestProp]),
  // the plaza
  ...([[3960, 'camcorder'], [3995, 'none'], [4026, 'kid'], [4062, 'icecream'], [4180, 'camera'], [4212, 'none'], [4790, 'shoulders'], [4830, 'balloon'], [4864, 'camera'],
    [5262, 'none'], [5296, 'camera'], [5328, 'icecream'], [5366, 'none'], [5400, 'kid'], [5720, 'camcorder'], [5756, 'none']] as const)
    .map(([x, p]) => [D + x, GY, NEAR_D, 'near', p] as [number, number, number, GuestZone, GuestProp]),
  // the bleachers: three sections, three rows (the back row first: drawn in order)
  ...BLEACHERS.xs.flatMap((bx, k) => ([[2, 30, 'none'], [2, 120, 'camera'], [2, 205, 'none'], [1, 60, k === 1 ? 'shoulders' : 'none'], [1, 160, 'camcorder'], [0, 25, 'kid'], [0, 100, 'icecream'], [0, 225, 'balloon']] as const)
    .map(([r, dx, p]) => [bx + dx, BLEACHERS.rows[r], BLEACHERS.d, 'far', p] as [number, number, number, GuestZone, GuestProp])),
  // by the exit, and the jungle trail's start
  ...([[8682, 'camera'], [8716, 'none'], [8790, 'shoulders'], [8830, 'none']] as const).map(([x, p]) => [D + x, GY, NEAR_D, 'near', p] as [number, number, number, GuestZone, GuestProp]),
];
export const GUESTS: DinoGuest[] = spots.map(([x, y, d, zone, prop], i) => {
  const seed = 7001 + i * 37;
  return { x, y, d, zone, prop, seed, woman: lookOf(seed).woman, said: null };
});

// ---------------------------------------------------------------------------------------------------------------
// Their state: how sure they are it's not a show, what's happened that they might say something about

interface Crowd {
  /** Things he's done a show wouldn't (a robot killed, him bitten, the T. rex wrecked): 3 or more and they doubt. */
  alarm: number;
  /** Something just happened (and when, to let it go if nobody gets a word in soon). */
  event: { kind: 'kill' | 'hurt' | 'rex'; at: number } | null;
  /** When they last spoke, and when one of them might next say something as he goes by. */
  lastAt: number; seeAt: number;
  /** Frames left of them cheering (a robot killed, while it's a show). */
  cheer: number;
  seenDead: WeakSet<object>; health: number; rexLive: boolean; rexBroken: number; rexDown: boolean;
  speaking: DinoGuest | null;
}
const crowds = new WeakMap<GameState, Crowd>();
const crowdOf = (state: GameState): Crowd => {
  let c = crowds.get(state);
  if (!c) { c = { alarm: 0, event: null, lastAt: -9999, seeAt: 400, cheer: 0, seenDead: new WeakSet(), health: state.player.health, rexLive: false, rexBroken: 0, rexDown: false, speaking: null }; crowds.set(state, c); }
  return c;
};

const FLED = 'm2:dinoGuestsFled';
/** Gone: been through the temple's back door (this go at the land), or started past it. */
export const guestsFled = (state: GameState) => !!state.stageMemo[FLED] || state.checkpoint >= 40;

const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
/** How sure they are it's not a show. */
export const guestMood = (state: GameState) => {
  const c = crowdOf(state);
  return { doubt: c.alarm >= 3, cheer: c.cheer > 0 };
};

/** Where a guest's head is, in the world (as it lands on screen, pushed back to their depth). */
export const headOf = (state: GameState, g: DinoGuest) => P(eyeOf(state), g.x, g.y - (g.prop === 'kid' ? 52 : g.prop === 'shoulders' ? 112 : 84), g.d);
/** On screen, where they'd be seen. */
const onScreen = (state: GameState, g: DinoGuest) => {
  const v = viewOf(state), [x] = P(eyeOf(state), g.x, g.y, g.d);
  return x > v.x + 30 && x < v.x + v.w - 30;
};

type RexView = { fight?: string; parts?: Record<string, { broken: boolean }>; said?: unknown };
const rexOf = (state: GameState) => (getAdv(state)?.s as { rex?: RexView } | undefined)?.rex;

// ---------------------------------------------------------------------------------------------------------------

/** Each frame (not in a cutscene): what's happened, and one of them maybe saying something about it. */
export const updateGuests = (state: GameState, o: { doorKicked: boolean; scene: boolean }) => {
  if (guestsFled(state)) return;
  // (through the temple's back door: when he's back, they're gone)
  if (o.doorKicked) { state.stageMemo[FLED] = '1'; for (const g of GUESTS) g.said = null; return; }
  const c = crowdOf(state), p = state.player, f = state.frame;
  if (c.cheer > 0) c.cheer--;
  const cx = p.pos.x + p.width / 2;
  // What's happened: a robot dead near him, him hurt, the T. rex wrecked a bit more (or down)
  for (const e of state.enemies) {
    if (e.health > 0 || c.seenDead.has(e) || !(e.kind === 'm2:raptor' || e.kind === 'm2:trike' || e.kind === 'm2:ptero')) continue;
    c.seenDead.add(e);
    if (Math.abs(e.pos.x - cx) > 700) continue;
    if (c.alarm < 3) c.cheer = 150;
    c.alarm += 1;
    if (Math.random() < 0.6) c.event = { kind: 'kill', at: f };
  }
  if (p.health < c.health && p.health > 0) { c.alarm += 0.5; if (Math.random() < 0.4 && c.event?.kind !== 'kill') c.event = { kind: 'hurt', at: f }; }
  c.health = p.health;
  const rex = rexOf(state);
  if (rex?.parts) {
    const broken = Object.values(rex.parts).filter(q => q.broken).length, down = rex.fight === 'dying' || rex.fight === 'dead';
    // (only what they see happen: not it lying dead already, back from his dying)
    if (c.rexLive && ((broken > c.rexBroken && Math.random() < 0.5) || (down && !c.rexDown))) { c.alarm += 2; c.event = { kind: 'rex', at: f }; }
    c.rexLive = rex.fight === 'on' || rex.fight === 'dying'; c.rexBroken = broken; c.rexDown = down;
  }
  if (c.event && f - c.event.at > 150) c.event = null;
  // Somebody says something: only when nobody else is talking (him, the T. rex, another of them), never in a scene
  if (o.scene || c.speaking || p.health <= 0) return;
  if (isTalking() || state.playerVulgarityTimer > 0 || (rex?.said ?? null) !== null) return;
  if (f - c.lastAt < 300) return;
  const near = GUESTS.filter(g => onScreen(state, g)).sort((a, b) => Math.abs(a.x - cx) - Math.abs(b.x - cx)).slice(0, 3);
  if (!near.length) { c.event = null; return; }
  const dr = dressed(state), st = c.alarm >= 3 ? 'doubt' : 'show';
  let pool: readonly string[] | null = null;
  if (c.event) {
    pool = c.event.kind === 'kill' ? GUEST_KILL[st][dr] : c.event.kind === 'hurt' ? GUEST_HURT[dr] : GUEST_REX[dr];
    c.event = null;
  } else if (f >= c.seeAt) {
    c.seeAt = f + 720 + Math.floor(Math.random() * 480);
    // (not in the middle of the T. rex's fight: it's doing enough talking)
    if (rex?.fight !== 'on') pool = GUEST_SEE[st][dr];
  }
  if (!pool) return;
  const g = near[Math.floor(Math.random() * near.length)];
  c.lastAt = f; c.speaking = g;
  speak(g.woman ? 'm2.guest' : 'm2.guest2', pickLine(pool), s => { g.said = s ? s.text : null; }, false, () => { if (c.speaking === g) c.speaking = null; c.lastAt = state.frame; });
};

/** What they're saying, over their heads (kept whole on screen). */
export const drawGuestsSaid = (c: CanvasRenderingContext2D, state: GameState) => {
  if (guestsFled(state)) return;
  for (const g of GUESTS) if (g.said) { const [x, y] = headOf(state, g); saidOver(c, g.said, x, y - 10, '#FDE68A', 200); }
};
