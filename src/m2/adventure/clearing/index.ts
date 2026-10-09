// THE CLEARING. A last stretch of jungle (the big health and ammo before the boss), then a tree in the way: he kicks
// it, and the trees go down like dominoes, the last one into the temple's side (it takes a hit: it's still standing),
// and there's Safari Artie, up in a hunting blind waiting to ambush him (the first time: `domino`). Then the fight.
//
// Then the fight (fight.ts: his bushes, his hidden-ball game, his mating whistle and its stampede, stampede.ts). The
// fence goes up behind him for it and comes down after. Beaten, back to the hub.
//
// Crude on purpose (the first pass): boxes and words.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Section, Said } from '../section';
import type { EnemyKind } from '../../../m1/types';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { GUIDE_KIND } from '../guides';
import { lay, solid, speak, meatheadSays, box, label, saidOver, hands, sectionState } from '../section';
import { GY } from '../geometry';
import { goTo, setUi } from '../../store';
import { playSound } from '../../../m1/game/platform/audio';
import { silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../../m1/game/platform/skip';
import { shakeScreen } from '../../../m1/game/core/state';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { CANVAS_WIDTH, CANVAS_HEIGHT, KICK_POSE_FRAMES, topBand } from '../../../m1/constants';
import { drawSafariArtie } from '../river/artie';
import { type Dressed, MEATHEAD_KICK, ARTIE_FOUND, MEATHEAD_ARTIE } from './lines';
import { x0, x1, TREE_X, TREE_H, TEMPLE_X, BLIND_X, BLIND_Y, ARENA_L, ARENA_R, PICKUP_X } from './arena';
import { drawOrbitBackdrop, ORBIT_WRAP } from './orbit';
import { BEASTS } from './stampede';
import { popAliensIn } from '../../weapons/spawner';
import type { Enemy } from '../../../m1/types';
import { type Fight, startFight as beginFight, updateFight, fightOver, endFight, resetFight, drawFightBack, drawFightFront, drawFightHud } from './fight';

const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
/** First time through (a return trip will differ). One flag per set piece. */
const firstVisit = (_state: GameState) => true;
/** The rock on the way in. */
const ROCK = { x: x0 + 560, w: 70, h: 56 };

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
}
const getClearing = (state: GameState) => sectionState<Clearing>(state, 'clearing', () => ({
  init: false, domino: firstVisit(state), scene: null, t: 0, token: 0,
  trees: TREE_X.map(() => ({ a: 0, v: 0, on: false, done: false })), trunk: null, templeHit: false,
  fight: 'wait', wonAt: 0, fence: null, f: null, said: null, nextLine: 0, booms: [], wiped: false,
}));

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
  // (the litter, in slices out from him; not the ones eating what's left of him)
  for (let k = 0; k < 6; k++) {
    const w = 140;
    cl.booms.push({ at: state.frame + 8 + k * 7, go: ctx => {
      popAliensIn(ctx.state, fromX - (k + 1) * w, -4000, w, 4000 + GY + 40);
      popAliensIn(ctx.state, fromX + k * w, -4000, w, 4000 + GY + 40);
    } });
  }
  // (anybody else about in there)
  state.enemies.filter(e => e !== f.e && e.health > 0 && !e.isBlownAway && e.type !== 'boss').forEach((e, i) => cl.booms.push({ at: state.frame + 16 + i * 10, go: ctx => popGuide(ctx, e) }));
};
const runBooms = (ctx: FrameContext, cl: Clearing) => {
  if (!cl.booms.length) return;
  const now = ctx.state.frame;
  const due = cl.booms.filter(b => b.at <= now);
  cl.booms = cl.booms.filter(b => b.at > now);
  for (const b of due) b.go(ctx);
};

const artieSays = (state: GameState, cl: Clearing, text: string, onDone?: () => void) => {
  const tok = cl.token;
  cl.said = { text };
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

const run = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player;
  const cl = getClearing(state);
  p.carried = false;
  if (!cl.init) {
    cl.init = true;
    // (back for another go, or not the first time: they're down already, he's waiting)
    if (!cl.domino || state.checkpoint >= 71) { cl.domino = false; treesDown(state, cl); }
  }
  runBooms(ctx, cl);
  if (cl.scene === 'kick') return kick(ctx, cl);
  const cx = p.pos.x + p.width / 2;
  if (cl.fight === 'wait') {
    if (cl.domino && cx > TREE_X[0] - 60 && p.isGrounded) { cl.scene = 'kick'; cl.t = 0; cl.nextLine = 0; return kick(ctx, cl); }
    // (in past the fallen trees, up to his blind: down he comes out of it, and it's on)
    if (!cl.domino && cx > ARENA_L + 60) startFight(state, cl);
  } else if (cl.fight === 'on') {
    const f = cl.f!;
    const out = updateFight(ctx, f, controls);
    if (f.mode === 'dead' && !cl.wiped) wipeArena(state, cl, f);
    // (locked in: nothing carries him out of it, a knock, a ride, a drop, a blast)
    const lo = ARENA_L, hi = ARENA_R + 20 - p.width;
    if (p.pos.x < lo) { p.pos.x = lo; if (p.vel.x < 0) p.vel.x = 0; }
    if (p.pos.x > hi) { p.pos.x = hi; if (p.vel.x > 0) p.vel.x = 0; }
    // (his death played out: the fence comes down, and on)
    if (fightOver(f)) {
      cl.fight = 'won'; cl.wonAt = state.frame;
      endFight(state, f);
      if (cl.fence) { state.blocks = state.blocks.filter(b => b !== cl.fence); cl.fence = null; }
    }
    return out;
  } else if (cl.fight === 'won' && state.frame - cl.wonAt > 60) goTo('hub');
  return controls;
};

export const clearing: Section = {
  id: 'clearing', x0, x1,
  checkpoints: [
    { name: 'THE CLEARING', cp: 70, x: x0 + 150, y: GY },
    // (past the guides and the big health and ammo: back here, nothing's on him)
    { name: 'THE BOSS', cp: 71, x: x0 + 1000, y: GY },
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
    for (const [x, y] of [[x0 + 430, GY], [ROCK.x + ROCK.w / 2, GY - ROCK.h], [x0 + 690, GY], [x0 + 730, GY]] as const) state.enemies.push(makeKindEnemy(GUIDE_KIND as EnemyKind, x, y));
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
  drawBackdrop: (c, state) => { drawOrbitBackdrop(c, state, getClearing(state).templeHit); return true; },
  drawBack: (c, state) => drawClearing(c, state),
  drawFront: (c, state) => {
    const cl = getClearing(state);
    // Artie, up in his blind (till the fight)
    if (cl.fight === 'wait' && (cl.trees[5].a > 0.5 || !cl.domino)) {
      drawSafariArtie(c, BLIND_X, BLIND_Y, -1, state.frame, cl.said?.text ? 'talk' : 'angry');
      box(c, BLIND_X - 22, BLIND_Y - 30, 44, 4, '#57534E');
    }
    if (cl.said?.text && cl.fight === 'wait') saidOver(c, cl.said.text, Math.min(TEMPLE_X - 130, BLIND_X), BLIND_Y - 100, '#FDE68A');
    if (cl.f && cl.fight !== 'wait') drawFightFront(c, state, cl.f);
  },
  drawHud: (c, state) => {
    const cl = getClearing(state);
    if (cl.fight === 'on' && cl.f) drawFightHud(c, cl.f, topBand(), !!state.player.inCutscene);
  },
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (crude)

const drawClearing = (c: CanvasRenderingContext2D, state: GameState) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  if (v.x > x1 || v.x + v.w < x0) return;
  const cl = getClearing(state);
  // The ground: the path (the near side of the loop: its far side's out past the temple, orbit.ts), on past both ends
  // (the strip's drawn wider than the screen, to bend round)
  box(c, x0 - 1200, GY, x1 - x0 + 2400, 400, '#8A6E4B'); box(c, x0 - 1200, GY, x1 - x0 + 2400, 4, '#A88A5E');
  for (let x = x0 - 1200; x < x1 + 1200; x += 46) box(c, x + ((x / 46) % 3) * 9, GY + 14 + ((x / 23) % 2) * 10, 10, 3, '#6E5638');
  // The rock (a guide up on it): its top lit, it's something to stand on
  box(c, ROCK.x, GY - ROCK.h, ROCK.w, ROCK.h, '#78716C'); box(c, ROCK.x, GY - ROCK.h, ROCK.w, 3, '#D6D3D1'); box(c, ROCK.x + 6, GY - ROCK.h + 14, ROCK.w - 20, 3, '#57534E');
  // A sign before it
  box(c, x0 + 940, GY - 70, 4, 70, '#57534E'); box(c, x0 + 890, GY - 94, 104, 26, '#1C1917');
  label(c, 'HUNTING AREA', x0 + 942, GY - 77, '#FCA5A5', 6);
  // The temple's wing, where it crosses the path (the rest of it's out past the strip, orbit.ts), knocked about where
  // the tree hit it, still standing. Nothing lit along its top: it's not something to get up on
  box(c, TEMPLE_X, GY - 220, 900, 220, '#7A7066'); box(c, TEMPLE_X, GY - 220, 6, 220, '#5E554C');
  for (let y = GY - 186; y < GY; y += 34) box(c, TEMPLE_X, y, 900, 2, '#615850');
  box(c, TEMPLE_X + 40, GY - 300, 900, 80, '#6F665C');
  if (cl.templeHit) {
    box(c, TEMPLE_X, GY - 250, 40, 56, '#3F3A35'); box(c, TEMPLE_X + 10, GY - 196, 6, 50, '#3F3A35');
    for (let i = 0; i < 5; i++) box(c, TEMPLE_X - 40 + i * 14, GY - 14 - (i % 2) * 6, 18, 14, '#A8A29E');
  }
  // Artie's blind: up on its stilts, a camouflage net round it
  box(c, BLIND_X - 40, BLIND_Y, 6, GY - BLIND_Y, '#5B3A1C'); box(c, BLIND_X + 34, BLIND_Y, 6, GY - BLIND_Y, '#5B3A1C');
  box(c, BLIND_X - 46, BLIND_Y - 4, 92, 8, '#6B4423');
  // (hidden in the leaves, till the trees go)
  if (cl.fight === 'wait' && cl.domino && cl.trees[5].a <= 0.5) { c.fillStyle = '#15803D'; c.beginPath(); c.arc(BLIND_X, BLIND_Y - 40, 56, 0, Math.PI * 2); c.fill(); }
  // The trees: standing, falling, down (down ones are background: dim)
  cl.trees.forEach((t, i) => {
    const x = TREE_X[i];
    c.save(); c.translate(x, GY); c.rotate(t.a);
    const down = t.done;
    // (down, they're background: dimmed, so a log lying there doesn't read as something to stand on)
    if (down) c.globalAlpha = 0.55;
    box(c, -14, -TREE_H, 28, TREE_H, down ? '#3B2F1E' : '#5B3A1C');
    c.fillStyle = down ? '#14532D' : '#15803D';
    c.beginPath(); c.arc(0, -TREE_H, 60, 0, Math.PI * 2); c.arc(-40, -TREE_H + 30, 40, 0, Math.PI * 2); c.arc(40, -TREE_H + 30, 40, 0, Math.PI * 2); c.fill();
    c.restore();
  });
  // The fight: the bushes
  if (cl.f && cl.fight !== 'wait') drawFightBack(c, state, cl.f);
  // The fence behind him for the fight
  if (cl.fence) for (let y = GY - 400; y < GY; y += 20) box(c, ARENA_L - 30, y, 30, 18, y % 40 ? '#A3A35A' : '#848440');
  // The big health and ammo: lit up, so they're seen
  if (cl.fight === 'wait' && state.pickups.some(p => p.id.startsWith('clearing-'))) label(c, 'STOCK UP', PICKUP_X, GY - 50, '#FDE68A', 7);
};
