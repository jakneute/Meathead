// THE PUNDITS, part two: RUSH LIMBAUGH (the Roosevelt Room, done up as his studio), BOB DOLE (the Cabinet Room) and, in
// the Oval Office at the end, NEWT GINGRICH: the show's cartoon impersonators, Mario bosses the way part one's Perot and
// Falwell are (whitehouse1/pundits.ts: the same rules, the same moves, their own throws). Sub-boss rules: in through the
// arena's door and both sides lock behind him till the pundit's dead; never back once beaten (a memo); markBossFight
// every frame of it; the camera held on the room.
//
//   LIMBAUGH  big, heavy: fewer, bigger leaps (a thud); puffs his cigar (the tell) and lobs it (lit, end over end; three
//             at once below half), or holds the golden EIB microphone up to his mouth (ON AIR: the tell) and flings it
//             out at him on its cord and reels it back (it hurts both ways). After a heavy landing now and then he's
//             winded, sat on the floor (his window: "COMMERCIAL BREAK!").
//   DOLE      lean, springy: quick hops and leaps; holds a pineapple up in his left hand (the tell; his right always has
//             his pen) and lobs it (below half it bursts in chunks where it lands), or flings a BOB DOLE campaign button
//             flat. Now and then he lands off a leap flat on his face (the pratfall: his window: "BOB DOLE IS OKAY!").
//   NEWT      stout: hops, leaps; holds the Contract with America up (the tell) and lobs it (two in a row below half), or
//             bangs the gavel on his palm (the tell) and flings it spinning flat. Below half, now and then, a tantrum on
//             his back, kicking and crying about the back of the plane (his window).
//
// None of them can be grabbed (TOO GREASY: part one's). Each fight opens with a short scene (SKIP >> for the lot; no
// input, no HUD): Chelsea names him, his entrance, his piece, Meathead's "who the hell...". Every try after the first
// that visit, straight to the fight. His death: he reels, says his last, and goes up in a cartoon puff, his costume
// flung off out of it; Chelsea's about to be sick but hurries him on; Meathead's say. Newt's puff starts the finale
// (finale.ts: the Clintons' TV, the screen coming down).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll, isTalking } from '../../../m1/game/platform/speech';
import { whLine, whMust } from '../whitehouse1/onceLines';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../../m1/game/platform/skip';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { registerM2Kind } from '../../kinds';
import { markBossFight } from '../../bossQuiet';
import { speak, meatheadSays, byPants, solid, ledge, hands, box, label } from '../section';
import { topBand } from '../../../m1/constants';
import { TOO_GREASY } from '../whitehouse1/lines';
import { chelseaSays, queasy } from '../whitehouse1/chelsea';
import { puffAt } from '../whitehouse1/poof';
import type { PuffBit } from '../whitehouse1/state';
import { wh2Of, saidOnce, LIMBAUGH_MEMO, DOLE_MEMO, NEWT_MEMO, type Pundit, type PunditId, type PunditThrow } from './state';
import { LIMBAUGH_ARENA, DOLE_ARENA, NEWT_ARENA, DESK_EIB, CAB_TABLE, RESOLUTE, X, Y, type Arena } from './layout';
import { LIMBAUGH, DOLE, NEWT, LIMBAUGH_LINES, DOLE_LINES, NEWT_LINES, LIMBAUGH_COMING, DOLE_COMING, NEWT_COMING, QUEASY_LIMBAUGH, QUEASY_DOLE, type PunditLines2 } from './lines';
import { drawPundit2, drawPunditThrow2 } from './punditArt';
import { startFinale } from './finale';

interface Spec {
  id: PunditId; kind: `m2:ct_${string}`; arena: Arena; memo: string; voice: string; lines: PunditLines2; coming: string[]; queasy: string[];
  name: string; bar: string; call: string;
  w: number; h: number;
  hopVx: number; leapVy: number; rest: [number, number];
  heavy: boolean;
  /** His throws, in turn. */
  throws: PunditThrow['kind'][];
  /** The solid tops in his arena he can land on: [from, to, height]. */
  tops: [number, number, number][];
  bits: string[];
  /** His window: how it comes (after a heavy landing; off a leap's landing; a tantrum below half), how often, how long. */
  flop: { when: 'land' | 'leap' | 'half'; chance: number; frames: number };
}
const SPECS: Record<PunditId, Spec> = {
  limbaugh: {
    id: 'limbaugh', kind: 'm2:ct_limbaugh', arena: LIMBAUGH_ARENA, memo: LIMBAUGH_MEMO, voice: LIMBAUGH, lines: LIMBAUGH_LINES, coming: LIMBAUGH_COMING, queasy: QUEASY_LIMBAUGH,
    name: 'RUSH LIMBAUGH', bar: '#DC2626', call: 'LIMBAUGH SIGNS OFF!',
    w: 64, h: 112, hopVx: 2.4, leapVy: 15, rest: [56, 24], heavy: true, throws: ['cigar', 'mic', 'cigar'],
    tops: [[DESK_EIB.a, DESK_EIB.b, DESK_EIB.h]], bits: ['rushhead', 'mic', 'cigar', 'headphones'],
    flop: { when: 'land', chance: 0.28, frames: 70 },
  },
  dole: {
    id: 'dole', kind: 'm2:ct_dole', arena: DOLE_ARENA, memo: DOLE_MEMO, voice: DOLE, lines: DOLE_LINES, coming: DOLE_COMING, queasy: QUEASY_DOLE,
    name: 'BOB DOLE', bar: '#2563EB', call: 'BOB DOLE DROPS!',
    w: 48, h: 118, hopVx: 3.4, leapVy: 15, rest: [44, 18], heavy: false, throws: ['pineapple', 'button', 'pineapple', 'button'],
    tops: [[CAB_TABLE.a, CAB_TABLE.b, CAB_TABLE.h]], bits: ['dolehead', 'pen', 'pineapple', 'button'],
    flop: { when: 'leap', chance: 0.3, frames: 64 },
  },
  newt: {
    id: 'newt', kind: 'm2:ct_newt', arena: NEWT_ARENA, memo: NEWT_MEMO, voice: NEWT, lines: NEWT_LINES, coming: NEWT_COMING, queasy: [],
    name: 'NEWT GINGRICH', bar: '#F1F5F9', call: 'NEWT IS SHUT DOWN!',
    w: 58, h: 112, hopVx: 3, leapVy: 15, rest: [50, 16], heavy: true, throws: ['contract', 'gavel', 'contract', 'gavel'],
    tops: [[RESOLUTE.a, RESOLUTE.b, RESOLUTE.h]], bits: ['newthead', 'wig', 'gavel', 'contract'],
    flop: { when: 'half', chance: 0.22, frames: 90 },
  },
};
const ORDER: PunditId[] = ['limbaugh', 'dole', 'newt'];
const BIG = 100000;
const G = 0.6;

const pOf = (state: GameState, id: PunditId) => wh2Of(state)[id];
const live = (state: GameState) => ORDER.map(id => pOf(state, id)).find(q => q.phase === 'intro' || q.phase === 'on' || q.phase === 'dying') ?? null;
export const inFight2 = (state: GameState) => !!live(state);
export const fightArena2 = (state: GameState) => { const q = live(state); return q ? SPECS[q.id].arena : null; };
/** The camera held on the arena while a fight's on (and through the finale, in the Oval Office). */
export const fightCam2 = (state: GameState) => { const a = fightArena2(state) ?? (wh2Of(state).finale && wh2Of(state).finale!.step !== 'done' ? NEWT_ARENA : null); return a ? { min: X(a.a), max: X(a.a) } : undefined; };
/** Where Chelsea cowers in a fight. */
export const cowerSpot = (state: GameState) => { const a = fightArena2(state); return a ? { x: X(a.a) + 34, y: Y(a.floor) } : null; };

// ---------------------------------------------------------------------------------------------------------------
// The pundit as the engine sees him: a body for the hits (his health's ours)

interface Sim { x: number; y: number; vx: number; vy: number; air: boolean; facing: 1 | -1; wind: number; kind: PunditThrow['kind'] | null; tossN: number; leapt: boolean }
const sims = new WeakMap<Pundit, Sim>();
export const simOf2 = (q: Pundit) => { let s = sims.get(q); if (!s) { s = { x: 0, y: 0, vx: 0, vy: 0, air: false, facing: -1, wind: 0, kind: null, tossN: 0, leapt: false }; sims.set(q, s); } return s; };

let greaseAt = -9999;
const greased = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player, dir = p.pos.x + p.width / 2 < e.pos.x + e.width / 2 ? -1 : 1;
  p.isCharging = false; p.isDivekicking = false; p.isUppercutting = false;
  p.vel = { x: dir * 6, y: -4 }; p.lockTimer = Math.max(p.lockTimer, 18);
  playSound('squish', 0.9, -2); playSound('oil', 0.6, 4);
  const hx = p.pos.x + p.width / 2 - dir * 12, hy = p.pos.y + p.height * 0.4;
  for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: hx, y: hy + (Math.random() - 0.5) * 20 }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 4 }, life: 26, color: ['#FDE68A', '#FACC15', '#A16207'][i % 3], size: 2 + Math.random() * 2, grav: 0.3 } as typeof state.particles[number]);
  if (state.frame - greaseAt > 150) { greaseAt = state.frame; const l = whLine(TOO_GREASY); if (l) meatheadSays(state, l, false); }
  return { said: true, free: true };
};
for (const id of ORDER) {
  const S = SPECS[id];
  registerM2Kind({
    kind: S.kind, stats: { w: S.w, h: S.h, hp: BIG, contact: S.heavy ? 11 : 9, mass: S.heavy ? 420 : 280 },
    gender: 'm', humanoid: true, grab: 'none', midBoss: true, head: { x: 4, y: -S.h + 24, r: 18 },
    ai: () => true,
    draw: (c, e, f, state) => { e.pauseTimer = 0; const q = pOf(state, id); if (q.phase === 'on') drawPundit2(c, id, q, simOf2(q), f, 0); },
    onGrab: greased,
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Talking

const quiet = () => !isTalking();
const say = (q: Pundit, text: string, after?: () => void, queue = true) => { speak(SPECS[q.id].voice, text, s => { q.said = s; }, queue, after); };
const bark = (state: GameState, q: Pundit, pool: string[]) => {
  if (state.frame - q.barkAt < 300 || !quiet()) return;
  q.barkAt = state.frame;
  say(q, pickLine(pool), undefined, false);
};

// ---------------------------------------------------------------------------------------------------------------
// The arena

const lockUp = (state: GameState, q: Pundit) => {
  const A = SPECS[q.id].arena;
  q.walls = [
    solid(state, X(A.a) - 40, Y(A.floor) - 1200, 40, 1200 + 40, { hidden: true, tag: `ct-${q.id}-lockL` }),
    solid(state, X(A.b), Y(A.floor) - 1200, 40, 1200 + 40, { hidden: true, tag: `ct-${q.id}-lockR` }),
  ];
  playSound('slam', 1, -10); shakeScreen(state, 6, 3);
};
const unlock = (q: Pundit) => { for (const b of q.walls) b.x = -1e7; q.walls = []; };
/** The arenas' ledges (always there: they're the rooms' furniture). */
export const buildArenas2 = (state: GameState) => {
  for (const id of ORDER) {
    const q = pOf(state, id), A = SPECS[id].arena;
    q.ledges = A.ledges.map(([a, b, h]) => ledge(state, X(a), Y(h), b - a, { hidden: true }));
    if (state.stageMemo[SPECS[id].memo]) q.phase = 'done';
  }
};
const spawn = (state: GameState, q: Pundit) => {
  const S = SPECS[q.id], s = simOf2(q);
  const e = makeKindEnemy(S.kind as EnemyKind, s.x - S.w / 2, s.y);
  e.pos.x = s.x - S.w / 2; e.pos.y = s.y - S.h;
  e.health = BIG; e.maxHealth = BIG; e.seen = true; e.noHeal = true; e.facing = s.facing;
  state.enemies.push(e);
  q.e = e;
};

// ---------------------------------------------------------------------------------------------------------------
// His moves

const landAt = (S: Spec, x: number, fromY: number, toY: number) => {
  const A = S.arena;
  let best = Y(A.floor);
  for (const [a, b, h] of [...A.ledges, ...S.tops]) {
    const top = Y(h);
    if (x > X(a) + 4 && x < X(b) - 4 && fromY <= top + 1 && toY >= top) best = Math.min(best, top);
  }
  return toY >= best ? best : null;
};
const leapTo = (q: Pundit, s: Sim, S: Spec, tx: number, ty: number) => {
  const rise = Math.max(30, s.y - ty + 40), vy = -Math.min(S.leapVy + 3, Math.sqrt(2 * G * rise));
  const tUp = -vy / G, tDown = Math.sqrt(Math.max(1, 2 * (ty - (s.y - rise)) / G)), T = tUp + tDown;
  s.vy = vy; s.vx = (tx - s.x) / T; s.air = true; s.leapt = true;
  q.act = 'leap'; q.actT = 0;
};
const restFor = (q: Pundit, S: Spec) => Math.round(S.rest[1] + (S.rest[0] - S.rest[1]) * Math.max(0, q.hp / q.max));
const think = (state: GameState, q: Pundit, s: Sim, S: Spec) => {
  const p = state.player, px = p.pos.x + p.width / 2, py = p.pos.y + p.height, A = S.arena;
  const r = Math.random(), half = q.hp < q.max / 2;
  // (Newt below half: now and then a tantrum, on his back)
  if (S.flop.when === 'half' && half && !s.air && Math.random() < S.flop.chance) { flop(state, q, S); return; }
  const spots: { x: number; y: number }[] = [{ x: X(A.a) + 90 + Math.random() * (A.b - A.a - 180), y: Y(A.floor) }, ...[...A.ledges, ...S.tops].map(([a, b, h]) => ({ x: X((a + b) / 2), y: Y(h) }))];
  if (r < 0.32) {
    const opts = spots.filter(o => Math.abs(o.x - s.x) > 120 || Math.abs(o.y - s.y) > 40);
    const near = opts.sort((u, v) => Math.abs(u.y - py) - Math.abs(v.y - py))[Math.random() < 0.5 ? 0 : Math.floor(Math.random() * opts.length)];
    if (near) { leapTo(q, s, S, near.x, near.y); playSound('boing', 0.7, S.heavy ? -8 : 2); return; }
  }
  if (r < 0.74) {
    q.act = 'wind'; q.actT = 0; s.kind = S.throws[s.tossN++ % S.throws.length]; s.wind = S.heavy ? 32 : 26;
    if (Math.random() < 0.4) bark(state, q, S.lines.toss);
    return;
  }
  const dx = px - s.x, want = Math.abs(dx) < 180 ? -Math.sign(dx) : Math.sign(dx);
  const reach = s.x + want * S.hopVx * 26;
  const block = S.tops.find(([a, b, h]) => s.y > Y(h) + 4 && Math.min(s.x, reach) < X(b) && Math.max(s.x, reach) > X(a));
  if (block) { leapTo(q, s, S, X((block[0] + block[1]) / 2), Y(block[2])); playSound('boing', 0.6, S.heavy ? -8 : 2); return; }
  s.vx = want * S.hopVx; s.vy = S.heavy ? -6 : -7.5; s.air = true; s.leapt = false; q.act = 'hop'; q.actT = 0;
  playSound('boing', 0.35, S.heavy ? -6 : 8);
  q.nextAct = restFor(q, S);
};
const flop = (state: GameState, q: Pundit, S: Spec) => {
  q.act = 'flop'; q.actT = 0; q.throws = q.throws.filter(t => t.kind !== 'mic');
  bark(state, q, S.lines.flop);
  if (q.id === 'dole') { playSound('thud', 0.8, -4); playSound('crash', 0.4, 8); }
  else if (q.id === 'newt') playSound('screams', 0.3, 12);
  else playSound('thud', 0.6, -10);
};
const toss = (state: GameState, q: Pundit, s: Sim, S: Spec) => {
  const p = state.player, tx = p.pos.x + p.width / 2 + p.vel.x * 14, ty = p.pos.y + p.height * 0.45;
  const hx = s.x + s.facing * 22, hy = s.y - S.h + 34, half = q.hp < q.max / 2;
  const kind = s.kind ?? 'cigar';
  if (kind === 'mic') {
    // (flung straight out at him on its cord, reeled back after)
    q.throws.push({ kind, x: hx, y: hy + 8, vx: s.facing * 8.5, vy: Math.max(-2, Math.min(2, (ty - hy) / 34)), t: 0, spin: 0, ox: hx, oy: hy + 8 });
    playSound('whoosh', 0.7, -2);
  } else if (kind === 'button' || kind === 'gavel') {
    q.throws.push({ kind, x: hx, y: hy + 10, vx: s.facing * (kind === 'gavel' ? 7.2 : 6.6), vy: Math.max(-1.4, Math.min(1.4, (ty - hy) / 70)), t: 0, spin: 0 });
    playSound('whoosh', 0.6, kind === 'gavel' ? 2 : 10);
  } else {
    const t = kind === 'cigar' ? 38 : kind === 'contract' ? 40 : 36, g = 0.32;
    const n = kind === 'cigar' && half ? 3 : 1;
    for (let i = 0; i < n; i++) {
      const tx2 = tx + (i - (n - 1) / 2) * 70;
      q.throws.push({ kind, x: hx, y: hy, vx: (tx2 - hx) / t, vy: (ty - hy - 0.5 * g * t * t) / t, t: 0, spin: 0, burst: kind === 'pineapple' && half });
    }
    playSound('whoosh', 0.6, kind === 'cigar' ? 4 : -2);
  }
  // (below half, Newt throws two in a row)
  if (q.id === 'newt' && half && q.act !== 'second') { q.act = 'second'; q.actT = 0; s.wind = 18; return; }
  q.act = 'after'; q.actT = 0;
};
const moveSim = (state: GameState, q: Pundit, s: Sim, S: Spec) => {
  const A = S.arena;
  if (s.air) {
    const fromY = s.y;
    s.vy += G; s.x += s.vx; s.y += s.vy;
    if (s.vy > 0) {
      const at = landAt(S, s.x, fromY, s.y);
      if (at !== null) {
        const leapt = s.leapt;
        s.y = at; s.vy = 0; s.vx = 0; s.air = false; s.leapt = false;
        if (S.heavy) { playSound('slam', 0.8, -8); shakeScreen(state, 6, 4); for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: s.x + (Math.random() - 0.5) * 50, y: s.y - 2 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 2 }, life: 20, color: '#E5E7EB', size: 3 }); }
        else playSound('thud', 0.5, 6);
        q.act = 'idle'; q.actT = 0; q.nextAct = restFor(q, S);
        // (his window off a landing: winded (Limbaugh, off a leap), the pratfall (Dole, off a leap))
        if (q.phase === 'on' && leapt && (S.flop.when === 'land' || S.flop.when === 'leap') && Math.random() < S.flop.chance) flop(state, q, S);
      }
    }
  } else {
    const under = floorTopAt(state.blocks, s.x, s.y - 4, 8);
    if (under === null || under > s.y + 4) s.air = true;
  }
  s.x = Math.max(X(A.a) + S.w / 2 + 6, Math.min(X(A.b) - S.w / 2 - 6, s.x));
  if (s.y > Y(A.floor)) { s.y = Y(A.floor); s.air = false; s.vy = 0; }
};

// ---------------------------------------------------------------------------------------------------------------
// His throws

const THROW_SRC: Record<PunditThrow['kind'], [string, number]> = {
  cigar: ['m2:ct_cigar_shot', 9], mic: ['m2:ct_mic_shot', 10], pineapple: ['m2:ct_pineapple_shot', 11], chunk: ['m2:ct_pineapple_shot', 6],
  button: ['m2:ct_button_shot', 9], contract: ['m2:ct_contract_shot', 10], gavel: ['m2:ct_gavel_shot', 11],
};
const updateThrows = (ctx: FrameContext, q: Pundit, S: Spec) => {
  const { state } = ctx, p = state.player, A = S.arena, s = simOf2(q);
  const add: PunditThrow[] = [];
  for (const t of q.throws) {
    t.t++;
    if (t.kind === 'mic') {
      // (out on its cord, then reeled back in to his hand)
      t.ox = s.x + s.facing * 22; t.oy = s.y - S.h + 42;
      if (!t.back) { t.x += t.vx; t.y += t.vy; t.vx *= 0.965; if (t.t > 34 || t.x < X(A.a) || t.x > X(A.b)) { t.back = true; playSound('click', 0.4, 4); } }
      else { const dx = t.ox - t.x, dy = t.oy - t.y, d = Math.hypot(dx, dy); if (d < 14) { t.dead = true; continue; } t.x += (dx / d) * 9; t.y += (dy / d) * 9; }
      t.spin = Math.sin(t.t * 0.4) * 0.5;
    } else {
      const flat = t.kind === 'button' || t.kind === 'gavel';
      t.vy += flat ? 0.02 : 0.32;
      t.x += t.vx; t.y += t.vy;
      t.spin += flat ? (t.kind === 'gavel' ? 0.6 : 0.5) : 0.2 * Math.sign(t.vx || 1);
      if (t.kind === 'cigar' && t.t % 3 === 0) state.particles.push({ pos: { x: t.x, y: t.y }, vel: { x: 0, y: -0.4 }, life: 22, color: 'rgba(229,231,235,0.7)', size: 3 });
    }
    const r = t.kind === 'chunk' ? 6 : t.kind === 'mic' ? 9 : 10;
    if (p.health > 0 && !p.inCutscene && p.invincibilityTimer <= 0 && p.pos.x < t.x + r && p.pos.x + p.width > t.x - r && p.pos.y < t.y + r && p.pos.y + p.height > t.y - r) {
      const [src, dmg] = THROW_SRC[t.kind];
      hurtPlayer(ctx, dmg, src, { x: Math.sign(t.vx || 1) * 6, y: -5 });
      if (t.kind === 'mic') { t.back = true; playSound('clang', 0.6, 6); continue; }
      breakUp(state, t, add); t.dead = true; continue;
    }
    if (t.kind === 'mic') continue;
    const floor = landAt(S, t.x, t.y - t.vy, t.y);
    if (floor !== null || t.x < X(A.a) - 10 || t.x > X(A.b) + 10 || t.t > 220) { breakUp(state, t, add, floor ?? t.y); t.dead = true; }
  }
  q.throws = [...q.throws.filter(t => !t.dead), ...add];
};
const breakUp = (state: GameState, t: PunditThrow, add: PunditThrow[], floorY?: number) => {
  // (a pineapple below half bursts in chunks where it lands, fanning out low)
  if (t.kind === 'pineapple' && t.burst && floorY !== undefined) for (const d of [-3.2, -1.2, 1.2, 3.2]) add.push({ kind: 'chunk', x: t.x, y: floorY - 6, vx: d, vy: -4 - Math.abs(d) * 0.4, t: 0, spin: 0 });
  const cols = t.kind === 'pineapple' || t.kind === 'chunk' ? ['#F59E0B', '#FCD34D', '#16A34A'] : t.kind === 'cigar' ? ['#F97316', '#E5E7EB', '#7C4A1E'] : t.kind === 'button' ? ['#F8FAFC', '#1D4ED8', '#DC2626'] : t.kind === 'contract' ? ['#FEF3C7', '#E7D7A8', '#DC2626'] : ['#7C2D12', '#FACC15', '#92400E'];
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: t.x, y: t.y }, vel: { x: (Math.random() - 0.5) * 6, y: -1.5 - Math.random() * 3 }, life: 26 + Math.random() * 14, color: cols[i % cols.length], size: 2.5 + Math.random() * 2.5, grav: 0.25 } as typeof state.particles[number]);
  playSound(t.kind === 'button' ? 'clink' : t.kind === 'gavel' ? 'clang' : t.kind === 'cigar' ? 'ignite' : 'splat', 0.5, 4);
};

// ---------------------------------------------------------------------------------------------------------------
// The fight, each frame

const startIntro = (state: GameState, q: Pundit) => {
  const S = SPECS[q.id], s = simOf2(q), A = S.arena, p = state.player;
  q.phase = 'intro'; q.t = 0; q.introStep = 0; q.hp = q.max; q.throws = [];
  lockUp(state, q);
  if (p.pos.x < X(A.a) + 10) p.pos.x = X(A.a) + 10;
  s.x = X(A.a + (A.b - A.a) * 0.72); s.y = Y(A.floor) - 420; s.vx = 0; s.vy = 0; s.air = true; s.facing = -1; s.leapt = false;
  state.projectiles = state.projectiles.filter(o => o.owner !== 'player');
};
const begin = (state: GameState, q: Pundit) => {
  const s = simOf2(q), S = SPECS[q.id];
  q.phase = 'on'; q.t = 0; q.act = 'idle'; q.actT = 0; q.nextAct = 50;
  if (s.air && s.y < Y(S.arena.floor) - 300) { s.y = Y(S.arena.floor); s.air = false; s.vy = 0; }
  spawn(state, q);
  state.player.inCutscene = false;
};
const die = (ctx: FrameContext, q: Pundit) => {
  const { state } = ctx, S = SPECS[q.id];
  q.phase = 'dying'; q.t = 0; q.throws = [];
  if (q.e) { const e = q.e; state.enemies = state.enemies.filter(o => o !== e); q.e = null; }
  silenceAll();
  playSound('hurt', 0.9, -4); playSound('boing', 0.8, -10);
  ctx.fx.announceKill(S.call);
  say(q, pickLine(byPants(state, S.lines.death)));
};
const finishDying = (state: GameState, q: Pundit) => {
  const S = SPECS[q.id], s = simOf2(q);
  const bits: PuffBit[] = S.bits.map((what, i) => ({ what, x: s.x, y: s.y - S.h * 0.6, vx: (i - (S.bits.length - 1) / 2) * 3.2 + (Math.random() - 0.5), vy: -9 - Math.random() * 5, rot: 0, spin: (Math.random() - 0.5) * 0.5 }));
  puffAt(state, s.x, s.y - S.h * 0.5, S.h * 1.1, bits);
  playSound('poof', 1.2, -4); playSound('twinkle', 0.6, 0);
  state.stageMemo[S.memo] = '1';
  q.phase = 'done'; q.said = null;
  // (Newt: the finale takes it from here, the Oval Office still shut)
  if (q.id === 'newt') { startFinale(state); return; }
  unlock(q);
  queasy(state, pickLine(S.queasy), () => { if (state.player.health > 0) meatheadSays(state, whMust(byPants(state, S.lines.after)), true); });
};
/** (the finale's: the Oval Office's walls down once it's done) */
export const unlockNewt = (state: GameState) => unlock(pOf(state, 'newt'));

export const updatePundits2 = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player;
  let out = controls;
  for (const id of ORDER) {
    const q = pOf(state, id), S = SPECS[id], s = simOf2(q), A = S.arena;
    if (q.phase === 'done') continue;
    if (q.phase === 'wait') {
      const cx = p.pos.x + p.width / 2;
      if (p.health > 0 && !p.inCutscene && cx > X(A.trigger) && cx < X(A.b) && Math.abs(p.pos.y + p.height - Y(A.floor)) < 140 && !inFight2(state)) {
        startIntro(state, q);
        if (!saidOnce(`${id}-intro`)) { s.y = Y(A.floor); s.air = false; begin(state, q); bark(state, q, byPants(state, S.lines.taunt)); }
      }
      continue;
    }
    q.t++;
    markBossFight(state, id);
    if (q.flash > 0) q.flash--;
    if (q.phase === 'intro') {
      p.inCutscene = true; p.vel.x = 0;
      moveSim(state, q, s, S);
      if (q.t > SKIP_AFTER) { offerSkip(); if (takeSkip()) { silenceAll(); q.said = null; begin(state, q); out = hands(); continue; } }
      const next = (k: number) => () => { q.introStep = k; };
      if (q.introStep === 0 && q.t === 8) { q.introStep = -1; chelseaSays(state, pickLine(S.coming), next(1)); }
      if (q.introStep === 1 && !s.air) { q.introStep = -1; say(q, pickLine(byPants(state, S.lines.intro)), next(2)); }
      if (q.introStep === 2) { q.introStep = -1; meatheadSays(state, whMust(byPants(state, S.lines.reply)), true, next(3)); }
      if (q.introStep === 3 || q.t > 1500) begin(state, q);
      out = hands();
      continue;
    }
    if (q.phase === 'dying') {
      if (q.t > 70 && (!q.said || q.t > 260)) finishDying(state, q);
      continue;
    }
    // ON: his health off the engine's (the hits), his sim, his moves
    const e = q.e;
    if (!e || !state.enemies.includes(e)) { if (q.hp > 0) spawn(state, q); continue; }
    const dealt = Math.max(0, BIG - e.health);
    e.health = BIG; e.maxHealth = BIG; e.frozenTimer = 0; e.isTased = false; e.isOiled = false; e.pauseTimer = 0; e.isBlownAway = false;
    if (dealt > 0) { q.hp -= dealt; q.flash = 6; playSound('punch', 0.25, 10); }
    if (q.hp <= 0) { die(ctx, q); continue; }
    const px = p.pos.x + p.width / 2;
    if (!s.air && q.act !== 'hop' && q.act !== 'flop') s.facing = px < s.x ? -1 : 1;
    q.actT++;
    switch (q.act) {
      case 'idle':
        if (q.actT > q.nextAct && p.health > 0) think(state, q, s, S);
        break;
      case 'wind': case 'second':
        if (q.actT === 8 && S.heavy) playSound('thud', 0.5, 2);
        if (q.actT % 10 === 0 && s.kind === 'mic') playSound('beep', 0.25, 14);
        if (q.actT >= s.wind) toss(state, q, s, S);
        break;
      case 'after':
        if (q.actT > 20) { q.act = 'idle'; q.actT = 0; q.nextAct = restFor(q, S); }
        break;
      case 'flop':
        // (his window: down, no throws; up again after)
        if (q.actT > S.flop.frames) { q.act = 'idle'; q.actT = 0; q.nextAct = 20; }
        break;
    }
    moveSim(state, q, s, S);
    e.pos.x = s.x - S.w / 2; e.pos.y = s.y - S.h; e.vel.x = s.vx; e.vel.y = s.vy; e.facing = s.facing;
    updateThrows(ctx, q, S);
    if (q.t % 360 === 200 && Math.random() < 0.8 && q.act !== 'flop') bark(state, q, byPants(state, S.lines.taunt));
    if (state.frame - q.baffleAt > 600 && q.t > 300 && quiet() && Math.random() < 0.006) { q.baffleAt = state.frame; const l = whLine(byPants(state, S.lines.baffled)); if (l) meatheadSays(state, l, false); }
  }
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

export const drawPunditsWorld2 = (c: CanvasRenderingContext2D, state: GameState) => {
  for (const id of ORDER) {
    const q = pOf(state, id), s = simOf2(q);
    if (q.phase === 'intro') drawPundit2(c, id, q, s, state.frame, 0, true);
    if (q.phase === 'dying') drawPundit2(c, id, q, s, state.frame, Math.min(1, q.t / 70), true);
    for (const t of q.throws) drawPunditThrow2(c, t);
  }
};
export const drawPunditsSaid2 = (c: CanvasRenderingContext2D, state: GameState, saidOver: (c: CanvasRenderingContext2D, s: string, x: number, y: number, col: string, w: number) => void) => {
  for (const id of ORDER) {
    const q = pOf(state, id), s = simOf2(q);
    if (q.said && q.phase !== 'wait') saidOver(c, q.said.text, s.x, s.y - SPECS[id].h - 22, '#FDE68A', 260);
  }
};
export const drawPunditBar2 = (c: CanvasRenderingContext2D, state: GameState) => {
  const q = live(state);
  if (!q || q.phase !== 'on' || state.player.inCutscene) return;
  const S = SPECS[q.id], band = topBand(), w = band.x2 - band.x1;
  box(c, band.x1, 18, w, 14, '#18181B');
  box(c, band.x1 + 2, 20, (w - 4) * Math.max(0, q.hp / q.max), 10, q.flash > 0 ? '#FEF3C7' : S.bar);
  label(c, S.name, band.mid, 44, '#FDE68A', 8);
};
export const punditScene2 = (state: GameState) => ORDER.some(id => pOf(state, id).phase === 'intro');
export const punditSkipShown2 = (state: GameState) => ORDER.some(id => { const q = pOf(state, id); return q.phase === 'intro' && q.t > SKIP_AFTER; });
