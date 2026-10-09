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
import { x0, x1, TREE_X, TREE_H, TEMPLE_X, BLIND_X, BLIND_Y, ARENA_L, PICKUP_X } from './arena';
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
}
const getClearing = (state: GameState) => sectionState<Clearing>(state, 'clearing', () => ({
  init: false, domino: firstVisit(state), scene: null, t: 0, token: 0,
  trees: TREE_X.map(() => ({ a: 0, v: 0, on: false, done: false })), trunk: null, templeHit: false,
  fight: 'wait', wonAt: 0, fence: null, f: null, said: null, nextLine: 0,
}));

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
        for (let k = 0; k < 18; k++) state.particles.push({ pos: { x: TEMPLE_X + Math.random() * 30, y: GY - 300 + Math.random() * 60 }, vel: { x: -Math.random() * 3, y: -1 - Math.random() * 3 }, life: 60, color: ['#A8A29E', '#78716C', '#D6D3D1'][k % 3], size: 4 + Math.random() * 8 });
      }
    }
  });
};

const startFight = (state: GameState, cl: Clearing) => {
  cl.fight = 'on';
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
  // (the view goes along the trees with them, to the temple)
  if (t > 30) state.cameraOverride = { x: TEMPLE_X + 160 - CANVAS_WIDTH, y: state.camera.y };
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
  if (cl.scene === 'kick') return kick(ctx, cl);
  const cx = p.pos.x + p.width / 2;
  if (cl.fight === 'wait') {
    if (cl.domino && cx > TREE_X[0] - 60 && p.isGrounded) { cl.scene = 'kick'; cl.t = 0; cl.nextLine = 0; return kick(ctx, cl); }
    // (in past the fallen trees, up to his blind: down he comes out of it, and it's on)
    if (!cl.domino && cx > ARENA_L + 60) startFight(state, cl);
  } else if (cl.fight === 'on') {
    const f = cl.f!;
    const out = updateFight(ctx, f, controls);
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
  drawBackdrop: (c, state) => {
    const g = c.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    g.addColorStop(0, '#38BDF8'); g.addColorStop(1, '#BBF7D0');
    c.fillStyle = g; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const off = (state.camera.x * 0.25) % 140;
    for (let i = -1; i < 8; i++) box(c, i * 140 - off, 300 - ((i * 41) % 80), 120, 400, '#166534');
    return true;
  },
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
  // The ground
  box(c, x0, GY, x1 - x0, 400, '#3F6212'); box(c, x0, GY, x1 - x0, 4, '#84CC16');
  // Jungle, back (dim)
  for (let x = x0; x < TREE_X[0] - 100; x += 130) { box(c, x + 20, GY - 260, 18, 260, '#3B2F1E'); box(c, x - 20, GY - 300, 100, 60, '#14532D'); }
  // The rock (a guide up on it): its top lit, it's something to stand on
  box(c, ROCK.x, GY - ROCK.h, ROCK.w, ROCK.h, '#78716C'); box(c, ROCK.x, GY - ROCK.h, ROCK.w, 3, '#D6D3D1'); box(c, ROCK.x + 6, GY - ROCK.h + 14, ROCK.w - 20, 3, '#57534E');
  // A sign before it
  box(c, x0 + 940, GY - 70, 4, 70, '#57534E'); box(c, x0 + 890, GY - 94, 104, 26, '#1C1917');
  label(c, 'HUNTING AREA', x0 + 942, GY - 77, '#FCA5A5', 6);
  // The temple's side (stepped), knocked about where the tree hit it, still standing
  box(c, TEMPLE_X, GY - 420, 900, 420, '#7A7066');
  for (let y = GY - 400; y < GY; y += 28) box(c, TEMPLE_X, y, 900, 2, '#615850');
  box(c, TEMPLE_X + 110, GY - 560, 900, 140, '#857B70');
  if (cl.templeHit) {
    box(c, TEMPLE_X, GY - 330, 40, 50, '#3F3A35'); box(c, TEMPLE_X + 10, GY - 280, 6, 60, '#3F3A35');
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
