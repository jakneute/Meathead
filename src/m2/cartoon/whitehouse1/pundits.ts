// THE PUNDITS, part one: ROSS PEROT (the press room) and JERRY FALWELL (the Lincoln Bedroom): the show's cartoon
// impersonators, Mario bosses (the user's: "they are more tanky enemies but they otherwise don't have special attacks.
// they should take about 30 seconds to a minute to beat with concentrated fire... simple 'mario bosses' who just jump
// around and throw shit"). Sub-boss rules: in through the arena's door and both sides lock behind him till the pundit's
// dead; never back once he's beaten (a memo); markBossFight every frame of it; the camera held on the room.
//
//   PEROT    small and quick: hops about, leaps up onto the ledges and the podium and down again, gliding down on his
//            giant ears (flapping), lobbing PIE CHARTS (the chart held up first: the tell; below half his health they
//            split in three at the top of the throw). His taunts: his 90s talking points, a giant sucking sound.
//   FALWELL  big and heavy: fewer, bigger leaps (a thud as he lands), his portable pulpit put down and the Bible thumped
//            on it (the tell), then a BIBLE lobbed end over end, or a COLLECTION PLATE flung flat; below half, two in a
//            row. His taunts: the moral majority's, played straight by the show.
//
// Neither can be grabbed ("TOO GREASY": he squirts out of the cat's paws). Each fight opens with a short scene (SKIP >>
// for the lot; no input, no HUD): Chelsea names him, his entrance, his piece, Meathead's "who the hell...". Every try
// after the first that visit, straight to the fight. His death: he reels, says his last, and goes up in a cartoon puff,
// his costume flung off out of it (the real body's for later: job 4's backtrack); Chelsea's about to be sick but hurries
// him on; Meathead's say. His health's his own (the engine's enemy is just his body, for the hits: a big pool, the
// difference each frame is the damage; the weapons hit him their mid-boss way).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Block, Enemy, EnemyKind } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll, isTalking } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../../m1/game/platform/skip';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { registerM2Kind } from '../../kinds';
import { markBossFight } from '../../bossQuiet';
import { speak, meatheadSays, byPants, solid, ledge, hands, box, label } from '../section';
import { topBand } from '../../../m1/constants';
import { whOf, saidOnce, PEROT_MEMO, FALWELL_MEMO, type Pundit, type PunditId, type PunditThrow, type PuffBit } from './state';
import { PEROT_ARENA, FALWELL_ARENA, PODIUM, BED, X, Y, type Arena } from './layout';
import { PEROT, FALWELL, PEROT_LINES, FALWELL_LINES, PEROT_COMING, FALWELL_COMING, QUEASY_PEROT, QUEASY_FALWELL, TOO_GREASY, type PunditLines } from './lines';
import { chelseaSays, queasy } from './chelsea';
import { puffAt } from './poof';
import { drawPundit, drawPunditThrow } from './punditArt';

interface Spec {
  id: PunditId; kind: `m2:ct_${string}`; arena: Arena; memo: string; voice: string; lines: PunditLines; coming: string[]; queasy: string[];
  w: number; h: number;
  /** Hops, leaps (their lift), how long he stands between moves (frames: at full health .. near dead). */
  hopVx: number; leapVy: number; rest: [number, number];
  /** Floats down on his ears (Perot). */
  glide: boolean;
  /** Lands with a thud (Falwell). */
  heavy: boolean;
  /** His throws, in turn. */
  throws: PunditThrow['kind'][];
  /** The solid tops in his arena he can land on: [from, to, height]. */
  tops: [number, number, number][];
  /** His costume's bits, flung out of the puff. */
  bits: string[];
}
const SPECS: Record<PunditId, Spec> = {
  perot: {
    id: 'perot', kind: 'm2:ct_perot', arena: PEROT_ARENA, memo: PEROT_MEMO, voice: PEROT, lines: PEROT_LINES, coming: PEROT_COMING, queasy: QUEASY_PEROT,
    w: 52, h: 100, hopVx: 3.4, leapVy: 14, rest: [44, 18], glide: true, heavy: false, throws: ['pie', 'pie'],
    tops: [[PODIUM.a, PODIUM.b, PODIUM.h]], bits: ['ears', 'perothead', 'chart', 'pointer'],
  },
  falwell: {
    id: 'falwell', kind: 'm2:ct_falwell', arena: FALWELL_ARENA, memo: FALWELL_MEMO, voice: FALWELL, lines: FALWELL_LINES, coming: FALWELL_COMING, queasy: QUEASY_FALWELL,
    w: 64, h: 108, hopVx: 2.4, leapVy: 15, rest: [56, 24], glide: false, heavy: true, throws: ['bible', 'plate', 'bible'],
    tops: [[BED.a, BED.b, BED.h]], bits: ['falhead', 'bible', 'pulpit', 'glasses'],
  },
};
const ORDER: PunditId[] = ['perot', 'falwell'];
const BIG = 100000;
const G = 0.6;

const pOf = (state: GameState, id: PunditId) => whOf(state)[id];
/** The pundit fight going on now (or about to: the scene), if any. */
const live = (state: GameState) => ORDER.map(id => pOf(state, id)).find(q => q.phase === 'intro' || q.phase === 'on' || q.phase === 'dying') ?? null;
export const inFight = (state: GameState) => !!live(state);
/** The arena of the fight going on, if any. */
export const fightArena = (state: GameState) => { const q = live(state); return q ? SPECS[q.id].arena : null; };
/** The camera held on the arena while a fight's on. */
export const fightCam = (state: GameState) => { const a = fightArena(state); return a ? { min: X(a.a), max: X(a.a) } : undefined; };

// ---------------------------------------------------------------------------------------------------------------
// The pundit as the engine sees him: a body for the hits (his health's ours)

/** Each pundit's sim: his feet, his speed, up in the air or not. */
interface Sim { x: number; y: number; vx: number; vy: number; air: boolean; facing: 1 | -1; wind: number; kind: PunditThrow['kind'] | null; tossN: number }
const sims = new WeakMap<Pundit, Sim>();
export const simOf = (q: Pundit) => { let s = sims.get(q); if (!s) { s = { x: 0, y: 0, vx: 0, vy: 0, air: false, facing: -1, wind: 0, kind: null, tossN: 0 }; sims.set(q, s); } return s; };

/** A grab at him: too greasy (he squirts out, the cat's paws slide off, shoved back a step). */
let greaseAt = -9999;
const greased = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player, dir = p.pos.x + p.width / 2 < e.pos.x + e.width / 2 ? -1 : 1;
  p.isCharging = false; p.isDivekicking = false; p.isUppercutting = false;
  p.vel = { x: dir * 6, y: -4 }; p.lockTimer = Math.max(p.lockTimer, 18);
  playSound('squish', 0.9, -2); playSound('oil', 0.6, 4);
  const hx = p.pos.x + p.width / 2 - dir * 12, hy = p.pos.y + p.height * 0.4;
  for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: hx, y: hy + (Math.random() - 0.5) * 20 }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 4 }, life: 26, color: ['#FDE68A', '#FACC15', '#A16207'][i % 3], size: 2 + Math.random() * 2, grav: 0.3 } as typeof state.particles[number]);
  if (state.frame - greaseAt > 150) { greaseAt = state.frame; meatheadSays(state, pickLine(TOO_GREASY), false); }
  return { said: true, free: true };
};
for (const id of ORDER) {
  const S = SPECS[id];
  registerM2Kind({
    kind: S.kind, stats: { w: S.w, h: S.h, hp: BIG, contact: id === 'perot' ? 8 : 11, mass: id === 'perot' ? 260 : 420 },
    gender: 'm', humanoid: true, grab: 'none', midBoss: true, head: { x: 4, y: -S.h + 22, r: 18 },
    // (he moves himself (pundits.ts's sim); nothing knocks him about)
    ai: () => true,
    draw: (c, e, f, state) => { e.pauseTimer = 0; const q = pOf(state, id); if (q.phase === 'on') drawPundit(c, id, q, simOf(q), f, 0, 0); },
    onGrab: greased,
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Talking

const quiet = () => !isTalking();
const say = (state: GameState, q: Pundit, text: string, after?: () => void, queue = true) => {
  speak(SPECS[q.id].voice, text, s => { q.said = s; }, queue, after);
};
const bark = (state: GameState, q: Pundit, pool: string[]) => {
  if (state.frame - q.barkAt < 300 || !quiet()) return;
  q.barkAt = state.frame;
  say(state, q, pickLine(pool), undefined, false);
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
export const buildArenas = (state: GameState) => {
  for (const id of ORDER) {
    const q = pOf(state, id), A = SPECS[id].arena;
    q.ledges = A.ledges.map(([a, b, h]) => ledge(state, X(a), Y(h), b - a, { hidden: true }));
    if (state.stageMemo[SPECS[id].memo]) q.phase = 'done';
  }
};

const spawn = (state: GameState, q: Pundit) => {
  const S = SPECS[q.id], s = simOf(q);
  const e = makeKindEnemy(S.kind as EnemyKind, s.x - S.w / 2, s.y);
  e.pos.x = s.x - S.w / 2; e.pos.y = s.y - S.h;
  e.health = BIG; e.maxHealth = BIG; e.seen = true; e.noHeal = true; e.facing = s.facing;
  state.enemies.push(e);
  q.e = e;
};

// ---------------------------------------------------------------------------------------------------------------
// His moves (on the ground or in the air, landing on what's in his room)

/** Where he'd land coming down at x (feet y), from `fromY` (the tops he's above). */
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
  const tUp = -vy / G, tDown = Math.sqrt(Math.max(1, 2 * (ty - (s.y - rise)) / G)), T = tUp + tDown * (S.glide ? 1.8 : 1);
  s.vy = vy; s.vx = (tx - s.x) / T; s.air = true;
  q.act = 'leap'; q.actT = 0;
};
const think = (state: GameState, q: Pundit, s: Sim, S: Spec) => {
  const p = state.player, px = p.pos.x + p.width / 2, py = p.pos.y + p.height, A = S.arena, k = Math.max(0, q.hp / q.max);
  const rest = Math.round(S.rest[1] + (S.rest[0] - S.rest[1]) * k);
  const r = Math.random();
  // (he's up on something and the cat's not: down to the floor near him, or off the far side)
  const spots: { x: number; y: number }[] = [{ x: X(A.a) + 90 + Math.random() * (A.b - A.a - 180), y: Y(A.floor) }, ...[...A.ledges, ...S.tops].map(([a, b, h]) => ({ x: X((a + b) / 2), y: Y(h) }))];
  if (r < 0.32) {
    // A leap: somewhere else in the room (up onto a ledge, the podium/the bed, or down and across)
    const opts = spots.filter(o => Math.abs(o.x - s.x) > 120 || Math.abs(o.y - s.y) > 40);
    const near = opts.sort((u, v) => Math.abs(u.y - py) - Math.abs(v.y - py))[Math.random() < 0.5 ? 0 : Math.floor(Math.random() * opts.length)];
    if (near) { leapTo(q, s, S, near.x, near.y); playSound('boing', 0.7, S.heavy ? -8 : 2); return; }
  }
  if (r < 0.72) {
    // A throw (the tell first)
    q.act = 'wind'; q.actT = 0; s.kind = S.throws[s.tossN++ % S.throws.length]; s.wind = S.heavy ? 32 : 26;
    if (Math.random() < 0.4) bark(state, q, S.lines.toss);
    return;
  }
  // A hop: toward him or back off (keeping a throw's distance), on the floor he's on
  const dx = px - s.x, want = Math.abs(dx) < 180 ? -Math.sign(dx) : Math.sign(dx);
  // (a hop along the floor that'd take him through the podium / the bed: up onto it instead)
  const reach = s.x + want * S.hopVx * 26;
  const block = S.tops.find(([a, b, h]) => s.y > Y(h) + 4 && Math.min(s.x, reach) < X(b) && Math.max(s.x, reach) > X(a));
  if (block) { leapTo(q, s, S, X((block[0] + block[1]) / 2), Y(block[2])); playSound('boing', 0.6, S.heavy ? -8 : 2); return; }
  s.vx = want * S.hopVx; s.vy = S.heavy ? -6 : -7.5; s.air = true; q.act = 'hop'; q.actT = 0;
  playSound('boing', 0.35, S.heavy ? -6 : 8);
  q.nextAct = rest;
};
const toss = (state: GameState, q: Pundit, s: Sim, S: Spec) => {
  const p = state.player, tx = p.pos.x + p.width / 2 + p.vel.x * 14, ty = p.pos.y + p.height * 0.45;
  const hx = s.x + s.facing * 20, hy = s.y - S.h + 30, half = q.hp < q.max / 2;
  const kind = s.kind ?? 'pie';
  if (kind === 'plate') {
    q.throws.push({ kind, x: hx, y: hy + 10, vx: s.facing * 6.6, vy: Math.max(-1.4, Math.min(1.4, (ty - hy) / 70)), t: 0, spin: 0 });
    playSound('whoosh', 0.6, 10);
  } else {
    const t = kind === 'bible' ? 36 : 42, g = kind === 'bible' ? 0.36 : 0.3;
    q.throws.push({ kind, x: hx, y: hy, vx: (tx - hx) / t, vy: (ty - hy - 0.5 * g * t * t) / t, t: 0, spin: 0, split: kind === 'pie' && half });
    playSound('whoosh', 0.6, kind === 'bible' ? -4 : 6);
  }
  // (below half his health, Falwell throws two in a row)
  if (S.heavy && half && q.act !== 'second') { q.act = 'second'; q.actT = 0; s.wind = 16; return; }
  q.act = 'after'; q.actT = 0;
};
const moveSim = (state: GameState, q: Pundit, s: Sim, S: Spec) => {
  const A = S.arena;
  if (s.air) {
    const fromY = s.y;
    s.vy += G;
    // (Perot: down on his ears, flapping)
    if (S.glide && s.vy > 1.8) s.vy = 1.8;
    s.x += s.vx; s.y += s.vy;
    if (s.vy > 0) {
      const at = landAt(S, s.x, fromY, s.y);
      if (at !== null) {
        s.y = at; s.vy = 0; s.vx = 0; s.air = false;
        if (S.heavy) { playSound('slam', 0.8, -8); shakeScreen(state, 6, 4); for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: s.x + (Math.random() - 0.5) * 50, y: s.y - 2 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 2 }, life: 20, color: '#E5E7EB', size: 3 }); }
        else playSound('thud', 0.5, 6);
        q.act = 'idle'; q.actT = 0; q.nextAct = Math.round(S.rest[1] + (S.rest[0] - S.rest[1]) * (q.hp / q.max));
      }
    }
  } else {
    // (walked off a ledge's end: down)
    const under = floorTopAt(state.blocks, s.x, s.y - 4, 8);
    if (under === null || under > s.y + 4) s.air = true;
  }
  s.x = Math.max(X(A.a) + S.w / 2 + 6, Math.min(X(A.b) - S.w / 2 - 6, s.x));
  if (s.y > Y(A.floor)) { s.y = Y(A.floor); s.air = false; s.vy = 0; }
};

// ---------------------------------------------------------------------------------------------------------------
// His throws

const THROW_SRC: Record<PunditThrow['kind'], [string, number]> = { pie: ['m2:ct_piechart_shot', 10], slice: ['m2:ct_piechart_shot', 6], bible: ['m2:ct_bible_shot', 12], plate: ['m2:ct_offering_shot', 9] };
// (no blood reds in any of it: the cartoon's gore sweep would take them for blood)
const PIE = ['#F05A5A', '#3B82F6', '#FACC15', '#22C55E'];
const updateThrows = (ctx: FrameContext, q: Pundit, S: Spec) => {
  const { state } = ctx, p = state.player, A = S.arena;
  const add: PunditThrow[] = [];
  for (const t of q.throws) {
    t.t++;
    const flat = t.kind === 'plate';
    t.vy += flat ? 0.02 : t.kind === 'bible' ? 0.36 : 0.3;
    t.x += t.vx; t.y += t.vy; t.spin += flat ? 0.5 : t.kind === 'bible' ? 0.25 * Math.sign(t.vx || 1) : 0.18 * Math.sign(t.vx || 1);
    if (flat && t.t % 4 === 0) state.particles.push({ pos: { x: t.x, y: t.y + 2 }, vel: { x: 0, y: 0.6 }, life: 18, color: '#FACC15', size: 2 });
    // (a pie that splits: at the top of the throw, three slices fanning out)
    if (t.split && t.vy > 0) {
      t.dead = true;
      for (const d of [-1.8, 0, 1.8]) add.push({ kind: 'slice', x: t.x, y: t.y, vx: t.vx + d, vy: -1 - Math.abs(d) * 0.3, t: 0, spin: t.spin });
      playSound('crack', 0.5, 10);
      continue;
    }
    const r = flat ? 9 : t.kind === 'bible' ? 9 : t.kind === 'slice' ? 7 : 10;
    if (p.health > 0 && !p.inCutscene && p.invincibilityTimer <= 0 && p.pos.x < t.x + r && p.pos.x + p.width > t.x - r && p.pos.y < t.y + r && p.pos.y + p.height > t.y - r) {
      const [src, dmg] = THROW_SRC[t.kind];
      hurtPlayer(ctx, dmg, src, { x: Math.sign(t.vx || 1) * 6, y: -5 });
      breakUp(state, t); t.dead = true; continue;
    }
    const floor = landAt(S, t.x, t.y - t.vy, t.y);
    if (floor !== null || t.x < X(A.a) - 10 || t.x > X(A.b) + 10 || t.t > 220) { breakUp(state, t); t.dead = true; }
  }
  q.throws = [...q.throws.filter(t => !t.dead), ...add];
};
const breakUp = (state: GameState, t: PunditThrow) => {
  const cols = t.kind === 'pie' || t.kind === 'slice' ? PIE : t.kind === 'plate' ? ['#FACC15', '#B45309', '#FDE68A'] : ['#1C1917', '#F5F5F4', '#C2410C'];
  for (let i = 0; i < (t.kind === 'pie' ? 14 : 9); i++) state.particles.push({ pos: { x: t.x, y: t.y }, vel: { x: (Math.random() - 0.5) * 6, y: -1.5 - Math.random() * 3 }, life: 26 + Math.random() * 14, color: cols[i % cols.length], size: 2.5 + Math.random() * 2.5, grav: 0.25 } as typeof state.particles[number]);
  playSound(t.kind === 'plate' ? 'clang' : t.kind === 'bible' ? 'thud' : 'splat', 0.5, t.kind === 'plate' ? 6 : 4);
};

// ---------------------------------------------------------------------------------------------------------------
// The fight, each frame

const startIntro = (state: GameState, q: Pundit) => {
  const S = SPECS[q.id], s = simOf(q), A = S.arena, p = state.player;
  q.phase = 'intro'; q.t = 0; q.introStep = 0; q.hp = q.max; q.throws = [];
  lockUp(state, q);
  if (p.pos.x < X(A.a) + 10) p.pos.x = X(A.a) + 10;
  // (in he comes from up top, at the far side of the room from the cat)
  s.x = X(A.a + (A.b - A.a) * 0.72); s.y = Y(A.floor) - 420; s.vx = 0; s.vy = 0; s.air = true; s.facing = -1;
  state.projectiles = state.projectiles.filter(o => o.owner !== 'player');
};
/** Straight into it (the scene's been seen this visit, or skipped). */
const begin = (state: GameState, q: Pundit) => {
  const s = simOf(q), S = SPECS[q.id];
  q.phase = 'on'; q.t = 0; q.act = 'idle'; q.actT = 0; q.nextAct = 50;
  if (s.air && s.y < Y(S.arena.floor) - 300) { s.y = Y(S.arena.floor); s.air = false; s.vy = 0; }
  spawn(state, q);
  state.player.inCutscene = false;
};
const die = (ctx: FrameContext, q: Pundit) => {
  const { state } = ctx, S = SPECS[q.id], s = simOf(q);
  q.phase = 'dying'; q.t = 0; q.throws = [];
  if (q.e) { const e = q.e; state.enemies = state.enemies.filter(o => o !== e); q.e = null; }
  silenceAll();
  playSound('hurt', 0.9, -4); playSound('boing', 0.8, -10);
  ctx.fx.announceKill(q.id === 'perot' ? 'PEROT DROPS OUT!' : 'FALWELL FALLS!');
  say(state, q, pickLine(byPants(state, S.lines.death)));
  void s;
};
const finishDying = (state: GameState, q: Pundit) => {
  const S = SPECS[q.id], s = simOf(q);
  // (the puff, his costume flung off out of it)
  const bits: PuffBit[] = S.bits.map((what, i) => ({ what, x: s.x, y: s.y - S.h * 0.6, vx: (i - (S.bits.length - 1) / 2) * 3.2 + (Math.random() - 0.5), vy: -9 - Math.random() * 5, rot: 0, spin: (Math.random() - 0.5) * 0.5 }));
  puffAt(state, s.x, s.y - S.h * 0.5, S.h * 1.1, bits);
  playSound('poof', 1.2, -4); playSound('twinkle', 0.6, 0);
  state.stageMemo[S.memo] = '1';
  q.phase = 'done'; q.said = null;
  unlock(q);
  // Chelsea's about to be sick, but she hurries him on; then him
  queasy(state, pickLine(S.queasy), () => { if (state.player.health > 0) meatheadSays(state, pickLine(byPants(state, S.lines.after)), true); });
};

export const updatePundits = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player;
  let out = controls;
  for (const id of ORDER) {
    const q = pOf(state, id), S = SPECS[id], s = simOf(q), A = S.arena;
    if (q.phase === 'done') continue;
    if (q.phase === 'wait') {
      const cx = p.pos.x + p.width / 2;
      if (p.health > 0 && !p.inCutscene && cx > X(A.trigger) && cx < X(A.b) && Math.abs(p.pos.y + p.height - Y(A.floor)) < 140 && !inFight(state)) {
        startIntro(state, q);
        if (!saidOnce(`${id}-intro`)) { s.y = Y(A.floor); s.air = false; begin(state, q); bark(state, q, byPants(state, S.lines.taunt)); }
      }
      continue;
    }
    q.t++;
    markBossFight(state, id);
    if (q.flash > 0) q.flash--;
    if (q.phase === 'intro') {
      // His scene: in he drops, Chelsea names him, his piece, Meathead's
      p.inCutscene = true; p.vel.x = 0;
      moveSim(state, q, s, S);
      if (q.t > SKIP_AFTER) { offerSkip(); if (takeSkip()) { silenceAll(); q.said = null; begin(state, q); out = hands(); continue; } }
      const next = (k: number) => () => { q.introStep = k; };
      if (q.introStep === 0 && q.t === 8) { q.introStep = -1; chelseaSays(state, pickLine(S.coming), next(1)); }
      if (q.introStep === 1 && !s.air) { q.introStep = -1; say(state, q, pickLine(byPants(state, S.lines.intro)), next(2)); }
      if (q.introStep === 2) { q.introStep = -1; meatheadSays(state, pickLine(byPants(state, S.lines.reply)), true, next(3)); }
      if (q.introStep === 3 || q.t > 1500) begin(state, q);
      out = hands();
      continue;
    }
    if (q.phase === 'dying') {
      // Reeling, spinning on the spot, stars round his head, his last words; then the puff
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
    if (!s.air && q.act !== 'hop') s.facing = px < s.x ? -1 : 1;
    q.actT++;
    switch (q.act) {
      case 'idle':
        if (q.actT > q.nextAct && p.health > 0) think(state, q, s, S);
        break;
      case 'wind': case 'second':
        // (the tell: the chart up / the Bible thumped on the pulpit)
        if (q.actT === 8 && S.heavy) playSound('thud', 0.5, 2);
        if (q.actT >= s.wind) toss(state, q, s, S);
        break;
      case 'after':
        if (q.actT > 20) { q.act = 'idle'; q.actT = 0; q.nextAct = Math.round(S.rest[1] + (S.rest[0] - S.rest[1]) * (q.hp / q.max)); }
        break;
    }
    moveSim(state, q, s, S);
    e.pos.x = s.x - S.w / 2; e.pos.y = s.y - S.h; e.vel.x = s.vx; e.vel.y = s.vy; e.facing = s.facing;
    updateThrows(ctx, q, S);
    // (his taunts; Meathead baffled now and then)
    if (q.t % 360 === 200 && Math.random() < 0.8) bark(state, q, byPants(state, S.lines.taunt));
    if (state.frame - q.baffleAt > 900 && q.t > 400 && quiet() && Math.random() < 0.004) { q.baffleAt = state.frame; meatheadSays(state, pickLine(byPants(state, S.lines.baffled)), false); }
  }
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (the fight's own: the scene's drop-in, his reel and the puff; the throws; the bar)

/** Behind him: the pundit in the scene or reeling (in the fight, the engine draws him), his throws. */
export const drawPunditsWorld = (c: CanvasRenderingContext2D, state: GameState) => {
  for (const id of ORDER) {
    const q = pOf(state, id), s = simOf(q);
    if (q.phase === 'intro') drawPundit(c, id, q, s, state.frame, 0, 1, true);
    if (q.phase === 'dying') drawPundit(c, id, q, s, state.frame, Math.min(1, q.t / 70), 1, true);
    for (const t of q.throws) drawPunditThrow(c, t);
  }
};
/** What he's saying, over him. */
export const drawPunditsSaid = (c: CanvasRenderingContext2D, state: GameState, saidOver: (c: CanvasRenderingContext2D, s: string, x: number, y: number, col: string, w: number) => void) => {
  for (const id of ORDER) {
    const q = pOf(state, id), s = simOf(q);
    if (q.said && q.phase !== 'wait') saidOver(c, q.said.text, s.x, s.y - SPECS[id].h - 18, '#FDE68A', 260);
  }
};
/** His bar (screen space: the top band, clear of the HUD). */
export const drawPunditBar = (c: CanvasRenderingContext2D, state: GameState) => {
  const q = live(state);
  if (!q || q.phase !== 'on' || state.player.inCutscene) return;
  const band = topBand(), w = band.x2 - band.x1;
  box(c, band.x1, 18, w, 14, '#18181B');
  box(c, band.x1 + 2, 20, (w - 4) * Math.max(0, q.hp / q.max), 10, q.flash > 0 ? '#FEF3C7' : q.id === 'perot' ? '#F59E0B' : '#7C3AED');
  label(c, q.id === 'perot' ? 'ROSS PEROT' : 'JERRY FALWELL', band.mid, 44, '#FDE68A', 8);
};
/** (the scene's hooks: is a pundit's scene on) */
export const punditScene = (state: GameState) => ORDER.some(id => pOf(state, id).phase === 'intro');
export const punditSkipShown = (state: GameState) => ORDER.some(id => { const q = pOf(state, id); return q.phase === 'intro' && q.t > SKIP_AFTER; });
export type { Block };
