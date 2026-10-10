// THE CLEARING. A last stretch of jungle (the big health and ammo before the boss), then a tree in the way: he kicks
// it, and the trees go down like dominoes, the last one into the temple's side (it takes a hit: it's still standing),
// and there's Safari Artie, up in a hunting blind waiting to ambush him (the first time: `domino`). Then the fight.
//
// Then the fight (fight.ts: his bushes, his hidden-ball game, his mating whistle and its stampede, stampede.ts). The
// fence goes up behind him for it and comes down after. Beaten, back to the hub.
//
// The look: art.ts (the strip's own things), orbit.ts (round the temple, past the strip) and tower.ts (Artie's blind,
// out on the loop till the view's round to it, then on the strip).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Section, Said } from '../section';
import type { EnemyKind } from '../../../m1/types';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { GUIDE_KIND } from '../guides';
import { lay, solid, speak, meatheadSays, saidOver, hands, sectionState } from '../section';
import { drawTentFlap, drawPath, drawCamp, drawRock, drawHuntSign, drawAidStop, drawTree, drawWing, drawFence, CAMPFIRE, SPEAKER, drawSpeaker } from './art';
import { GY } from '../geometry';
import { goTo, setUi, markLandCleared, noteBossKill } from '../../store';
import { playSound } from '../../../m1/game/platform/audio';
import { silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../../m1/game/platform/skip';
import { shakeScreen } from '../../../m1/game/core/state';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { CANVAS_WIDTH, CANVAS_HEIGHT, KICK_POSE_FRAMES, topBand } from '../../../m1/constants';
import { type Dressed, MEATHEAD_KICK, ARTIE_FOUND, ARTIE_SENDS, MEATHEAD_ARTIE } from './lines';
import { x0, x1, TREE_X, TREE_H, TEMPLE_X, BLIND_X, ARENA_L, ARENA_R, PICKUP_X } from './arena';
import { drawOrbitBackdrop, ORBIT_WRAP } from './orbit';
import { type BlindLook, blindOrbitItem, drawBlindOnStrip, blindWordsAt } from './tower';
import { BEASTS } from './stampede';
import { popAliensIn } from '../../weapons/spawner';
import type { Enemy } from '../../../m1/types';
import { type Fight, startFight as beginFight, updateFight, fightOver, endFight, resetFight, drawFightBack, drawFightFront, drawFightHud, killCamTick, killCamZoom, drawKillCam, artieInBlind } from './fight';
import { type Victory, startVictory, tickVictory, drawVictory, victoryDone } from '../../victory';
import { type WalkAway, playWalkAway, tickWalkAway, drawWalkAway } from '../../walkAway';

const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
/** First time through (a return trip will differ). One flag per set piece. */
const firstVisit = (_state: GameState) => true;
/** The rock on the way in. */
const ROCK = { x: x0 + 700, w: 70, h: 56 };

// ---------------------------------------------------------------------------------------------------------------

interface Clearing {
  init: boolean;
  /** The domino (first time through); with it done (or not the first time) the trees are down already. */
  domino: boolean;
  scene: 'kick' | null; t: number; token: number;
  /** Each tree: how far over (radians), how fast it's going over, done. */
  trees: { a: number; v: number; on: boolean; done: boolean }[];
  trunk: unknown;
  templeHit: boolean;
  /** The fight: not yet, on, won (and when). */
  fight: 'wait' | 'on' | 'won'; wonAt: number; fence: unknown;
  f: Fight | null;
  said: Said | null; nextLine: number;
  /** Things going off one after another (the leftover guides at the lair's door; everything in it when Artie dies). */
  booms: { at: number; go: (ctx: FrameContext) => void }[];
  /** Artie's death's been seen to (everything in the arena gone off). */
  wiped: boolean;
  /** Beaten: VICTORY, stamped on the screen, then out. */
  victory: Victory | null;
  /** After VICTORY: him walking away from it all, his new weapon in his hands (till A). */
  walk: WalkAway | null;
  /** The camp: Artie on its loudspeaker sending his junior guides (none about till he has: nothing on him as he
   *  comes in); then out they come, one by one; `out` how many so far. */
  call: 'no' | 'saying' | 'sent'; callT: number; out: number;
  /** The tent's flap, thrown back as one comes out of it (frames). */
  flap: number;
  /** Who's saying what's said: Artie up in his blind, or over the camp's loudspeaker. */
  saidAt: 'blind' | 'speaker';
}
const getClearing = (state: GameState) => sectionState<Clearing>(state, 'clearing', () => ({
  init: false, domino: firstVisit(state), scene: null, t: 0, token: 0,
  trees: TREE_X.map(() => ({ a: 0, v: 0, on: false, done: false })), trunk: null, templeHit: false,
  fight: 'wait', wonAt: 0, fence: null, f: null, said: null, nextLine: 0, booms: [], wiped: false, victory: null, walk: null,
  call: 'no', callT: 0, out: 0, flap: 0, saidAt: 'blind',
}));

/** The junior guides: where each comes to (one up on the rock, tempting to come down on), in the order they come. */
const GUIDE_SPOTS = (): [number, number][] => [[x0 + 520, GY], [ROCK.x + ROCK.w / 2, GY - ROCK.h], [x0 + 860, GY], [x0 + 940, GY]];
/** Out of the tent's flap they come (or ahead of him, if he's past it: never on top of him). */
const TENT_X = x0 + 350;
const sendGuides = (state: GameState, cl: Clearing) => {
  cl.call = 'sent'; cl.callT = 0; cl.out = 0;
};
const guidesOut = (state: GameState, cl: Clearing) => {
  if (cl.call !== 'sent' || cl.out >= GUIDE_SPOTS().length) return;
  cl.callT++;
  if (cl.callT < 20 + cl.out * 34) return;
  // (every one of them out of the tent's flap, on the ground there: none out of thin air, none off out of bounds)
  const px = state.player.pos.x + state.player.width / 2;
  const e = makeKindEnemy(GUIDE_KIND as EnemyKind, TENT_X, GY);
  e.facing = px < TENT_X ? -1 : 1;
  state.enemies.push(e);
  cl.flap = 24;
  for (let k = 0; k < 5; k++) state.particles.push({ pos: { x: TENT_X + (Math.random() - 0.5) * 20, y: GY - 6 }, vel: { x: (Math.random() - 0.5) * 2, y: -0.5 - Math.random() }, life: 22, color: '#B8A36A', size: 4 + Math.random() * 4 });
  playSound('beep', 0.4, 6 + cl.out);
  cl.out++;
};

// ---------------------------------------------------------------------------------------------------------------
// Going off: a chain of them, one after another (undignified: a wet pop and bits)

const meatPop = (ctx: FrameContext, x: number, y: number, size: number) => {
  const { state, fx } = ctx;
  fx.spawnDeathShower({ x, y }, 0, size);
  fx.spawnExplosion({ x, y }, '#8B0000', Math.round(10 * size), 0, 16 + size * 4);
  for (let i = 0; i < 4 + size * 2; i++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 9, y: -3 - Math.random() * 6 }, life: 50, color: ['#7F1D1D', '#B91C1C', '#F9A8D4'][i % 3], size: 4 + Math.random() * 4 * size, grav: 0.35 });
  playSound('splat', 1, -size); playSound('crunch', 0.6, 4 - size); shakeScreen(state, 6 + size * 3, 3 + size);
};
/** A guide, gone off where he stands. */
const popGuide = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx;
  if (!state.enemies.includes(e) || e.health <= 0 || e.isBlownAway) return;
  e.health = 0;
  state.enemies = state.enemies.filter(o => o !== e);
  meatPop(ctx, e.pos.x + e.width / 2, e.pos.y + e.height / 2, 2);
  // (his hat, up in the air and down again)
  state.particles.push({ pos: { x: e.pos.x + e.width / 2, y: e.pos.y }, vel: { x: (Math.random() - 0.5) * 3, y: -9 }, life: 60, color: '#D6C9A0', size: 9, grav: 0.35 });
};
const liveGuides = (state: GameState) => state.enemies.filter(e => e.kind === GUIDE_KIND && e.health > 0 && !e.isBlownAway);
/** Into the lair: every guide still about goes off, one after another (none locked in with him, none waiting outside). */
const popGuides = (state: GameState, cl: Clearing) => {
  liveGuides(state).forEach((e, i) => cl.booms.push({ at: state.frame + 4 + i * 9, go: ctx => popGuide(ctx, e) }));
};
/** Artie's dead: everything in the arena goes off, a chain, out from him (the animals running, the litter). */
const wipeArena = (state: GameState, cl: Clearing, f: Fight) => {
  cl.wiped = true;
  const fromX = f.x;
  // (none that haven't come out yet ever will)
  for (const a of f.herd) if (!a.done && a.warn > 0) a.done = true;
  const out = f.herd.filter(a => !a.done);
  out.sort((a, b) => Math.abs(a.x + BEASTS[a.kind].w / 2 - fromX) - Math.abs(b.x + BEASTS[b.kind].w / 2 - fromX));
  out.forEach((a, i) => cl.booms.push({ at: state.frame + 12 + i * 12, go: ctx => {
    if (a.done) return;
    a.done = true;
    const b = BEASTS[a.kind];
    meatPop(ctx, a.x + b.w / 2, GY - b.h / 2, b.h > 100 ? 4 : 3);
    meatPop(ctx, a.x + b.w * 0.2, GY - b.h * 0.6, 1);
  } }));
  // (the litter, in slices out from him; not the ones eating him: they finish, and burst when he comes down)
  const keep = f.death?.how === 'eaten' ? 60 : 0;
  for (let k = 0; k < 6; k++) {
    const w = 140;
    cl.booms.push({ at: state.frame + 8 + k * 7, go: ctx => {
      popAliensIn(ctx.state, fromX - keep - (k + 1) * w, -4000, w, 4000 + GY + 40);
      popAliensIn(ctx.state, fromX + keep + k * w, -4000, w, 4000 + GY + 40);
    } });
  }
  // (anybody else about in there)
  // (only what's in the arena: the rest of the park's enemies are all out there too, miles off)
  state.enemies.filter(e => e !== f.e && e.health > 0 && !e.isBlownAway && e.type !== 'boss' && e.pos.x + e.width > ARENA_L - 100 && e.pos.x < ARENA_R + 100)
    .forEach((e, i) => cl.booms.push({ at: state.frame + 16 + i * 10, go: ctx => popGuide(ctx, e) }));
};
const runBooms = (ctx: FrameContext, cl: Clearing) => {
  if (!cl.booms.length) return;
  const now = ctx.state.frame;
  const due = cl.booms.filter(b => b.at <= now);
  cl.booms = cl.booms.filter(b => b.at > now);
  for (const b of due) b.go(ctx);
};

const artieSays = (state: GameState, cl: Clearing, text: string, onDone?: () => void, at: Clearing['saidAt'] = 'blind') => {
  const tok = cl.token;
  cl.said = { text }; cl.saidAt = at;
  speak('m2.safari', text, s => { if (cl.token === tok) cl.said = s; }, true, () => { if (cl.token === tok) onDone?.(); });
};

/** All down (the last one up against the temple), and the temple's side knocked about. */
const treesDown = (state: GameState, cl: Clearing) => {
  cl.trees.forEach((t, i) => { t.on = true; t.done = true; t.v = 0; t.a = i === cl.trees.length - 1 ? LAST_LEAN : Math.PI / 2; });
  cl.templeHit = true;
  if (cl.trunk) { state.blocks = state.blocks.filter(b => b !== cl.trunk); cl.trunk = null; }
};
/** How far the last one leans, against the temple. */
const LAST_LEAN = Math.asin((TEMPLE_X - TREE_X[6]) / TREE_H);
/** When the one before has gone over far enough to hit the next. */
const HITS_NEXT = Math.asin(170 / TREE_H);

const fallTrees = (state: GameState, cl: Clearing) => {
  cl.trees.forEach((t, i) => {
    if (!t.on || t.done) return;
    t.v += 0.0016 + t.a * 0.004; t.a += t.v;
    const next = cl.trees[i + 1];
    if (next && !next.on && t.a >= HITS_NEXT) { next.on = true; next.v = t.v * 0.6; playSound('crack', 0.8, -2 - i); playSound('thud', 0.5, -4); }
    const stop = i === cl.trees.length - 1 ? LAST_LEAN : Math.PI / 2;
    if (t.a >= stop) {
      t.a = stop; t.done = true;
      playSound('crash', 0.7, -6); shakeScreen(state, 8, 4);
      for (let k = 0; k < 8; k++) state.particles.push({ pos: { x: TREE_X[i] + Math.sin(stop) * TREE_H * Math.random(), y: GY - Math.cos(stop) * TREE_H * Math.random() }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 40, color: k % 2 ? '#15803D' : '#65A30D', size: 4 + Math.random() * 5 });
      // (the last one, into the temple's side: it takes a hit, it's still standing)
      if (i === cl.trees.length - 1) {
        cl.templeHit = true;
        playSound('boom', 0.6); playSound('crunch', 0.8); shakeScreen(state, 16, 8);
        for (let k = 0; k < 18; k++) state.particles.push({ pos: { x: TEMPLE_X + Math.random() * 30, y: GY - 250 + Math.random() * 60 }, vel: { x: -Math.random() * 3, y: -1 - Math.random() * 3 }, life: 60, color: ['#A8A29E', '#78716C', '#D6D3D1'][k % 3], size: 4 + Math.random() * 8 });
      }
    }
  });
};

const startFight = (state: GameState, cl: Clearing) => {
  cl.fight = 'on';
  popGuides(state, cl);
  cl.f = beginFight(state);
  cl.fence = { x: ARENA_L - 30, y: -4000, w: 30, h: 4000 + GY, type: 'wall', hidden: true, tag: 'artie-fence' };
  state.blocks.push(cl.fence as never);
};

const endKick = (state: GameState, cl: Clearing, skipped: boolean) => {
  if (skipped) { silenceAll(); state.playerVulgarityTimer = 0; treesDown(state, cl); }
  cl.token++; cl.said = null; cl.scene = null; cl.domino = false;
  const p = state.player; p.inCutscene = false; p.kickPose = 0;
  state.cameraOverride = null;
};

/** The kick, the dominoes, Artie found out; their say. */
const kick = (ctx: FrameContext, cl: Clearing): Controls => {
  const { state } = ctx, p = state.player;
  cl.t++;
  p.inCutscene = true; p.facing = 1; p.vel.x = 0;
  if (cl.t > SKIP_AFTER) offerSkip();
  if (cl.t > SKIP_AFTER && takeSkip()) { endKick(state, cl, true); return hands(); }
  const t = cl.t;
  if ((p.kickPose || 0) > 0) p.kickPose!--;
  if (t === 12) { p.kickPose = KICK_POSE_FRAMES; playSound('whoosh', 0.6, -4); }
  if (t === 24) {
    playSound('punch', 1); playSound('crack', 1, -4); shakeScreen(state, 10, 5);
    cl.trees[0].on = true; cl.trees[0].v = 0.01;
    if (cl.trunk) { state.blocks = state.blocks.filter(b => b !== cl.trunk); cl.trunk = null; }
    meatheadSays(state, pick(MEATHEAD_KICK));
  }
  fallTrees(state, cl);
  // (the view goes along the trees with them, round the loop to the temple: it swings round as they go)
  if (t > 30) {
    const front = cl.trees.reduce((n, tr, i) => (tr.on ? i : n), 0);
    const want = TREE_X[front] + 170 * Math.sin(cl.trees[front].a) + 140 - CANVAS_WIDTH / 2;
    state.cameraOverride = { x: Math.min(TEMPLE_X + 160 - CANVAS_WIDTH, Math.max(state.camera.x, want)), y: state.camera.y };
  }
  // All down: there he is
  if (cl.templeHit && cl.trees.every(tr => tr.done) && !cl.said && t > 0 && cl.nextLine === 0) {
    cl.nextLine = -1;
    const at = t;
    artieSays(state, cl, pick(ARTIE_FOUND[dressed(state)]), () => {
      const tok = cl.token;
      meatheadSays(state, pick(MEATHEAD_ARTIE), true, () => { if (cl.token === tok) endKick(state, cl, false); });
    });
    cl.t = Math.max(cl.t, at);
  }
  if (t > 1400) endKick(state, cl, false);
  return hands();
};

/**
 * Beaten, VICTORY stamped: out of here, back to the hub. (The one place it goes from: whatever comes between the
 * VICTORY and the hub, the walk away from it, goes in here; `weakness`: it was his weakness death, eaten alive.)
 */
/** Done here: him walking away from the carnage (Safari Artie's, eaten or not), then the hub. */
const leave = (state: GameState, weakness: boolean) => {
  const cl = getClearing(state);
  // (Adventure Land's cleared: the day moves on, the walk-away already at the new hour: timeOfDay.ts)
  markLandCleared('adventure');
  noteBossKill();
  cl.walk = playWalkAway(state, { boss: 'safari-artie', weakness, onDone: () => goTo('hub') });
};

const run = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player;
  const cl = getClearing(state);
  p.carried = false;
  // (dev: the boss beaten without the fight, for trying out what comes after: the walk-away, back out at the hub)
  if (import.meta.env.DEV) (window as unknown as { __clearingWin: (weak?: boolean) => void }).__clearingWin = (weak = false) => { if (!cl.walk) { cl.fight = 'won'; cl.victory = null; leave(state, weak); } };
  if (!cl.init) {
    cl.init = true;
    // (back for another go, or not the first time: they're down already, he's waiting)
    if (!cl.domino || state.checkpoint >= 71) { cl.domino = false; treesDown(state, cl); }
  }
  runBooms(ctx, cl);
  if (cl.scene === 'kick') return kick(ctx, cl);
  const cx = p.pos.x + p.width / 2;
  if (cl.fight === 'wait') {
    // The camp: in a moment (or once he's in among it), Artie on the loudspeaker, sending them; then out they come
    if (cl.call === 'no' && state.checkpoint < 71) {
      cl.callT++;
      if (cl.callT > 50 || cx > x0 + 240) {
        cl.call = 'saying';
        const tok = cl.token;
        artieSays(state, cl, pick(ARTIE_SENDS[dressed(state)]), () => { if (cl.token === tok) { cl.said = null; sendGuides(state, cl); } }, 'speaker');
      }
    }
    guidesOut(state, cl);
    // (the tree's only kicked once they're all dead: the ones in the spiked helmets)
    const guidesDone = cl.call !== 'no' && cl.call !== 'saying' ? cl.out >= GUIDE_SPOTS().length && liveGuides(state).length === 0 : state.checkpoint >= 71;
    if (cl.domino && guidesDone && cx > TREE_X[0] - 60 && p.isGrounded) { cl.scene = 'kick'; cl.t = 0; cl.nextLine = 0; return kick(ctx, cl); }
    // (in past the fallen trees, up to his blind: down he comes out of it, and it's on)
    if (!cl.domino && cx > ARENA_L + 60) startFight(state, cl);
  } else if (cl.fight === 'on') {
    const f = cl.f!;
    let out = updateFight(ctx, f, controls);
    if (f.mode === 'dead' && !cl.wiped) wipeArena(state, cl, f);
    // (the kill cam on him: out of Meathead's hands)
    if (f.cam) { p.inCutscene = true; out = hands(); }
    // (locked in: nothing carries him out of it, a knock, a ride, a drop, a blast)
    const lo = ARENA_L, hi = ARENA_R + 20 - p.width;
    if (p.pos.x < lo) { p.pos.x = lo; if (p.vel.x < 0) p.vel.x = 0; }
    if (p.pos.x > hi) { p.pos.x = hi; if (p.vel.x > 0) p.vel.x = 0; }
    // (his death played out: the fence comes down, and on)
    if (fightOver(f)) {
      cl.fight = 'won'; cl.wonAt = state.frame;
      endFight(state, f);
      if (cl.fence) { state.blocks = state.blocks.filter(b => b !== cl.fence); cl.fence = null; }
      cl.victory = startVictory();
    }
    return out;
  } else if (cl.fight === 'won') {
    // VICTORY, stamped on the screen (out of his hands, no HUD), then back to the hub
    p.inCutscene = true;
    if (cl.victory) { tickVictory(state, cl.victory); if (victoryDone(cl.victory) && state.frame - cl.wonAt > 60) { cl.victory = null; leave(state, cl.f?.death?.how === 'eaten'); } }
    if (cl.walk) tickWalkAway(cl.walk, controls);
    return hands();
  }
  return controls;
};

export const clearing: Section = {
  id: 'clearing', x0, x1,
  checkpoints: [
    { name: 'THE CLEARING', cp: 70, x: x0 + 150, y: GY },
    // (past the guides and the big health and ammo: back here, nothing's on him)
    { name: 'THE BOSS', cp: 71, x: x0 + 1300, y: GY, clear: [1500, 600] },
  ],
  build: (state) => {
    resetFight();
    lay(state, [{ x1: x0, y1: GY, x2: x1, y2: GY, surface: 'grass' }]);
    // (the temple's side: no way on past it)
    state.blocks.push({ x: TEMPLE_X, y: -4000, w: 400, h: 4000 + GY, type: 'wall', hidden: true, tag: 'clearing-temple' } as never);
    // (the way back: none, this way)
    state.blocks.push({ x: x0 - 40, y: -4000, w: 40, h: 4000 + GY, type: 'wall', hidden: true, tag: 'clearing-l' } as never);
    const cl = getClearing(state);
    // The tree in his way (its trunk)
    cl.trunk = { x: TREE_X[0] - 16, y: GY - TREE_H, w: 32, h: TREE_H, type: 'wall', hidden: true, tag: 'clearing-tree' };
    state.blocks.push(cl.trunk as never);
    // Artie's junior guides on the way in (spiked helmets: no dive kicking them), in ones and twos, one up on a rock
    // (tempting to come down on)
    solid(state, ROCK.x, GY - ROCK.h, ROCK.w, ROCK.h, { tag: 'clearing-rock', hidden: true });
    // (not out yet: Artie sends them, over the camp's loudspeaker, once he's in. Back here again, a fresh go at it)
    cl.call = 'no'; cl.callT = 0; cl.out = 0;
    // Before the boss: the big health and the big ammo
    state.pickups.push(
      { id: 'clearing-health', pos: { x: PICKUP_X - 30, y: GY - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 },
      { id: 'clearing-ammo', pos: { x: PICKUP_X + 10, y: GY - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 },
    );
  },
  update: (ctx, controls) => { const out = run(ctx, controls); setUi({ introCutscene: !!ctx.state.player.inCutscene }); return out; },
  cameraX: (state) => {
    const cl = getClearing(state);
    // (the fight: the arena, all of it, on the screen)
    return cl.fight !== 'wait' ? { min: ARENA_L - 10, max: ARENA_L - 10 } : { min: x0, max: TEMPLE_X + 60 - CANVAS_WIDTH };
  },
  // The path's a loop round the temple: the strip bent round as it curves, the temple and the rest past it (orbit.ts)
  cylinder: () => ({ radius: ORBIT_WRAP }),
  outdoors: () => 1,
  // (the junior guides' campfire, at night)
  lamps: () => [{ x: CAMPFIRE.x, y: CAMPFIRE.y, r: 140, a: 0.9, color: '#FFB060' }],
  // (his blind out there too, from well back once the trees are down: tower.ts; on the strip once the view's round to it)
  drawBackdrop: (c, state) => { const cl = getClearing(state); drawOrbitBackdrop(c, state, cl.templeHit, blindOrbitItem(c, state, blindLook(state, cl))); return true; },
  drawBack: (c, state) => drawClearing(c, state),
  drawFront: (c, state) => {
    const cl = getClearing(state);
    // Artie, up in his blind (till the fight), and the hide's netting across his legs (on the strip: tower.ts)
    if (cl.fight === 'wait') drawBlindOnStrip(c, state, blindLook(state, cl), 'front');
    if (cl.said?.text && cl.fight === 'wait' && cl.saidAt === 'speaker') saidOver(c, cl.said.text, SPEAKER.x + 12, SPEAKER.y - 18, '#FDE68A');
    if (cl.f && cl.fight !== 'wait') drawFightFront(c, state, cl.f);
  },
  drawHud: (c, state) => {
    const cl = getClearing(state);
    // (his words over him up in his blind, wherever on the screen it's got to: out on the loop or on the strip)
    const said = cl.fight === 'wait' ? (cl.saidAt === 'blind' ? cl.said?.text : null) : cl.f && artieInBlind(cl.f) ? cl.f.said : null;
    if (said) { const w = blindWordsAt(state); saidOver(c, said, w.x, w.y, '#FDE68A'); }
    if (cl.fight === 'on' && cl.f) drawFightHud(c, cl.f, topBand(), !!state.player.inCutscene);
    if (cl.f && cl.fight !== 'wait') drawKillCam(c, cl.f);
    if (cl.victory) drawVictory(c, cl.victory);
    if (cl.walk) drawWalkAway(c, cl.walk);
  },
  // (his weakness death: the kill cam's close-up, in slow motion)
  zoom: (state) => { const f = getClearing(state).f; return f ? killCamZoom(state, f) : null; },
  holdTick: (ctx) => { const f = getClearing(ctx.state).f; return f ? killCamTick(f) : false; },
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (crude)

/** How his blind looks just now: in the leaves still, Artie up in it (and how), or not. */
const blindLook = (state: GameState, cl: Clearing): BlindLook => {
  const hidden = cl.fight === 'wait' && cl.domino && cl.trees[5].a <= 0.5;
  let artie: BlindLook['artie'] = null;
  if (cl.fight === 'wait' && !hidden) artie = cl.said?.text ? 'talk' : 'angry';
  else if (cl.fight === 'on' && cl.f && artieInBlind(cl.f)) artie = cl.f.said ? 'talk' : 'angry';
  return { hidden, artie, frame: state.frame };
};

const drawClearing = (c: CanvasRenderingContext2D, state: GameState) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  if (v.x > x1 || v.x + v.w < x0) return;
  const cl = getClearing(state), f = state.frame;
  const vis = (a: number, b: number) => b > v.x - 200 && a < v.x + v.w + 200;
  // The ground: the path (the near side of the loop: its far side's out past the temple, orbit.ts), on past both ends
  // (the strip's drawn wider than the screen, to bend round)
  drawPath(c, Math.max(x0 - 1200, v.x - 400), Math.min(x1 + 1200, v.x + v.w + 400));
  // The junior guides' camp, back off the path
  if (vis(x0 + 180, x0 + 700)) { drawCamp(c, f); drawTentFlap(c, cl.flap > 0 ? cl.flap-- : 0); drawSpeaker(c, cl.saidAt === 'speaker' && !!cl.said?.text, f); }
  // The rock (a guide up on it): its top lit, it's something to stand on
  if (vis(ROCK.x, ROCK.x + ROCK.w)) drawRock(c, ROCK.x, ROCK.w, ROCK.h);
  // The first-aid stop (the big health and ammo on its crate), the sign before the hunting area
  if (vis(PICKUP_X - 100, PICKUP_X + 100)) drawAidStop(c, state.pickups.some(p => p.id.startsWith('clearing-')));
  if (vis(x0 + 1170, x0 + 1310)) drawHuntSign(c, x0 + 1242);
  // The temple's wing, where it crosses the path (the rest of it's out past the strip, orbit.ts), knocked about where
  // the tree hit it, still standing. Nothing lit along its top: it's not something to get up on
  if (vis(TEMPLE_X - 60, TEMPLE_X + 940)) drawWing(c, cl.templeHit);
  // Artie's blind: up on its stilts (hidden in the leaves, till the trees go), once the view's round to it (out on the
  // loop till then: tower.ts); waiting on him, Artie's drawn over its back (drawFront)
  if (vis(BLIND_X - 120, BLIND_X + 120)) drawBlindOnStrip(c, state, blindLook(state, cl), cl.fight === 'wait' ? 'back' : 'all');
  // The trees still standing, or going over; down, gone (not drawn at all: a log lying there would read as something
  // to stand on)
  cl.trees.forEach((t, i) => { if (!t.done && vis(TREE_X[i] - 100, TREE_X[i] + TREE_H + 100)) drawTree(c, TREE_X[i], t.a, i, f, false); });
  // The fight: the bushes
  if (cl.f && cl.fight !== 'wait') drawFightBack(c, state, cl.f);
  // The fence behind him for the fight
  if (cl.fence) drawFence(c, GY - 420);
};
