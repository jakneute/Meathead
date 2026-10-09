// THE CLEARING. A last stretch of jungle (the big health and ammo before the boss), then a tree in the way: he kicks
// it, and the trees go down like dominoes, the last one into the temple's side (it takes a hit: it's still standing),
// and there's Safari Artie, up in a hunting blind waiting to ambush him (the first time: `domino`). Then the fight.
//
// THE FIGHT IS A PLACEHOLDER: Artie walks at him, stops to shoot tranquilizer darts, now and then charges. Simple and
// beatable, till his real fight's designed. Beaten, back to the hub.
//
// Crude on purpose (the first pass): boxes and words.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind } from '../../../m1/types';
import type { Section, Said } from '../section';
import { lay, speak, meatheadSays, box, label, saidOver,  hands, sectionState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { goTo, setUi } from '../../store';
import { playSound } from '../../../m1/game/platform/audio';
import { silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../../m1/game/platform/skip';
import { shakeScreen } from '../../../m1/game/core/state';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { enemyProjectile } from '../../../m1/game/bosses/shared';
import { CANVAS_WIDTH, CANVAS_HEIGHT, KICK_POSE_FRAMES, topBand } from '../../../m1/constants';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { drawSafariArtie, type ArtiePose } from '../river/artie';
import {
  type Dressed, MEATHEAD_KICK, ARTIE_FOUND, MEATHEAD_ARTIE, ARTIE_FIGHT, MEATHEAD_WON, HURT_ARTIE, DEATH_ARTIE, HURT_DART, DEATH_DART,
} from './lines';

const { x0, x1 } = SECTIONS.clearing;

const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
/** First time through (a return trip will differ). One flag per set piece. */
const firstVisit = (_state: GameState) => true;

/** The trees in a row (the first one's in his way), the temple's side past them, Artie's blind. */
const TREE_X = Array.from({ length: 7 }, (_, i) => x0 + 1100 + i * 170);
const TREE_H = 320;
const TEMPLE_X = x0 + 2350;
const BLIND_X = x0 + 2190, BLIND_Y = GY - 150;
/** The fight's bounds: the bamboo fence that goes up behind him, the temple's wall. */
const ARENA_L = TEMPLE_X - 800, ARENA_R = TEMPLE_X - 20;
const PICKUP_X = x0 + 800;

// ---------------------------------------------------------------------------------------------------------------
// Safari Artie (the placeholder fight)

const ARTIE_KIND = 'm2:safariartie' as const;
const FIGHT_POSE: Record<string, ArtiePose> = { walk: 'run', charge: 'run', aim: 'point', shoot: 'point', taunt: 'angry' };
registerM2Kind({
  kind: ARTIE_KIND,
  stats: { w: 34, h: 86, hp: 500, contact: 12, mass: 260 },
  gender: 'm',
  // (a person, but the boss: no getting hold of him, the lunge stops dead against him)
  humanoid: true, grab: 'none',
  head: { x: 2, y: -66, r: 10 },
  draw: (c, e, f) => drawSafariArtie(c, 0, 0, 1, f, (e.hitFlash ?? 0) > 0 ? 'hurt' : FIGHT_POSE[e.aiState ?? ''] ?? 'stand'),
  ai: (ctx, e) => {
    const { state } = ctx, p = state.player;
    const px = p.pos.x + p.width / 2, ex = e.pos.x + e.width / 2;
    const dir = px < ex ? -1 : 1;
    e.aiTimer = (e.aiTimer ?? 0) + 1;
    const t = e.aiTimer;
    const to = (s: string) => { e.aiState = s; e.aiTimer = 0; };
    switch (e.aiState) {
      case 'walk':
        e.facing = dir;
        if (Math.abs(px - ex) > 90) e.pos.x += dir * 1.8;
        if (t > 100) { e.shootTimer = (e.shootTimer ?? 0) + 1; to(e.shootTimer % 3 === 0 ? 'charge' : 'aim'); }
        break;
      case 'aim':
        e.facing = dir;
        if (t > 30) to('shoot');
        break;
      case 'shoot':
        if (t % 14 === 1 && t < 40) {
          const y = e.pos.y + 30;
          state.projectiles.push(enemyProjectile(`artie-dart-${state.frame}-${t}`, ex + e.facing * 24, y, e.facing * 7.5, 0, 14, 4, 10, { shooterKind: ARTIE_KIND }));
          playSound('dart', 0.7);
        }
        if (t > 50) to('walk');
        break;
      case 'charge':
        if (t === 1) { e.facing = dir; playSound('whoosh', 0.7); }
        if (t > 20) e.pos.x += e.facing * 6;
        if (t > 75) to('walk');
        break;
      default:
        to('walk');
    }
    e.pos.x = Math.max(ARENA_L + 10, Math.min(ARENA_R - e.width - 10, e.pos.x));
    return false;
  },
});
registerHurtLines(ARTIE_KIND, HURT_ARTIE, DEATH_ARTIE);
registerHurtLines(`${ARTIE_KIND}_shot`, HURT_DART, DEATH_DART);

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
  artie: Enemy | null; maxHp: number;
  said: Said | null; nextLine: number;
}
const getClearing = (state: GameState) => sectionState<Clearing>(state, 'clearing', () => ({
  init: false, domino: firstVisit(state), scene: null, t: 0, token: 0,
  trees: TREE_X.map(() => ({ a: 0, v: 0, on: false, done: false })), trunk: null, templeHit: false,
  fight: 'wait', wonAt: 0, fence: null, artie: null, maxHp: 500, said: null, nextLine: 0,
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
  const e = makeKindEnemy(ARTIE_KIND as EnemyKind, BLIND_X, GY);
  e.facing = -1; e.seen = true; e.aiState = 'taunt'; e.aiTimer = -40;
  state.enemies.push(e);
  cl.artie = e; cl.maxHp = e.maxHealth;
  cl.fence = { x: ARENA_L - 30, y: -4000, w: 30, h: 4000 + GY, type: 'wall', hidden: true, tag: 'artie-fence' };
  state.blocks.push(cl.fence as never);
  cl.nextLine = state.frame + 400;
  playSound('jump', 0.8);
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
    if (!cl.domino && cx > ARENA_L + 60) { startFight(state, cl); artieSays(state, cl, pick(ARTIE_FIGHT)); }
  } else if (cl.fight === 'on') {
    const e = cl.artie!;
    if (e.health <= 0 || !state.enemies.includes(e)) {
      cl.fight = 'won'; cl.wonAt = state.frame; cl.token++; cl.said = null;
      if (cl.fence) { state.blocks = state.blocks.filter(b => b !== cl.fence); cl.fence = null; }
      meatheadSays(state, pick(MEATHEAD_WON));
    } else if (state.frame > cl.nextLine && !cl.said) { cl.nextLine = state.frame + 500 + Math.floor(Math.random() * 300); artieSays(state, cl, pick(ARTIE_FIGHT)); }
  } else if (cl.fight === 'won' && state.frame - cl.wonAt > 300) goTo('hub');
  return controls;
};

export const clearing: Section = {
  id: 'clearing', x0, x1,
  checkpoints: [
    { name: 'THE CLEARING', cp: 70, x: x0 + 150, y: GY },
    { name: 'THE BOSS', cp: 71, x: x0 + 650, y: GY },
  ],
  build: (state) => {
    lay(state, [{ x1: x0, y1: GY, x2: x1, y2: GY, surface: 'grass' }]);
    // (the temple's side: no way on past it)
    state.blocks.push({ x: TEMPLE_X, y: -4000, w: 400, h: 4000 + GY, type: 'wall', hidden: true, tag: 'clearing-temple' } as never);
    // (the way back: none, this way)
    state.blocks.push({ x: x0 - 40, y: -4000, w: 40, h: 4000 + GY, type: 'wall', hidden: true, tag: 'clearing-l' } as never);
    const cl = getClearing(state);
    // The tree in his way (its trunk)
    cl.trunk = { x: TREE_X[0] - 16, y: GY - TREE_H, w: 32, h: TREE_H, type: 'wall', hidden: true, tag: 'clearing-tree' };
    state.blocks.push(cl.trunk as never);
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
    return cl.fight === 'on' ? { min: ARENA_L - 10, max: ARENA_L - 10 } : { min: x0, max: TEMPLE_X + 60 - CANVAS_WIDTH };
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
    if (cl.said?.text) {
      const e = cl.artie;
      const at = e && cl.fight === 'on' ? { x: e.pos.x + e.width / 2, y: e.pos.y - 24 } : { x: BLIND_X, y: BLIND_Y - 100 };
      saidOver(c, cl.said.text, Math.min(TEMPLE_X - 130, at.x), at.y, '#FDE68A');
    }
  },
  drawHud: (c, state) => {
    const cl = getClearing(state);
    const band = topBand();
    if (cl.fight === 'on' && cl.artie && !state.player.inCutscene) {
      const w = band.x2 - band.x1, k = Math.max(0, cl.artie.health / cl.maxHp);
      box(c, band.x1, 22, w, 14, '#18181B'); box(c, band.x1 + 2, 24, (w - 4) * k, 10, '#F59E0B');
      label(c, 'SAFARI ARTIE (PLACEHOLDER FIGHT)', band.mid, 50, '#FDE68A', 7);
    }
    if (cl.fight === 'won') label(c, 'PLACEHOLDER BOSS DOWN: BACK TO THE HUB', CANVAS_WIDTH / 2, 140, '#FDE68A', 9);
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
  // A sign before it
  box(c, x0 + 940, GY - 70, 4, 70, '#57534E'); box(c, x0 + 890, GY - 94, 104, 26, '#1C1917');
  label(c, 'BOSS (TO COME)', x0 + 942, GY - 77, '#FCA5A5', 6);
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
  // The fence behind him for the fight
  if (cl.fence) for (let y = GY - 400; y < GY; y += 20) box(c, ARENA_L - 30, y, 30, 18, y % 40 ? '#A3A35A' : '#848440');
  // The big health and ammo: lit up, so they're seen
  if (cl.fight === 'wait' && state.pickups.some(p => p.id.startsWith('clearing-'))) label(c, 'STOCK UP', PICKUP_X, GY - 50, '#FDE68A', 7);
};
