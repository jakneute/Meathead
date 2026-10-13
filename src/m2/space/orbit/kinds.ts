// Zorblax's people, out for him (Meathead 2's own enemies: new kinds, his species' look; art.ts draws them):
//   zfighter:  a little saucer, a pilot in a glass bubble. Flies a path across the screen (straight, a snake, a swoop
//              in to sit and shoot, up from behind him, a loop), some of them shooting pink bolts at him.
//   zkamikaze: one of them hugging a rocket. Comes on, sizes him up (its nose blinking), yells, and goes: straight for
//              where he was. Whatever it hits, it blows up on (him, the others, a rock).
//   zturret:   a gun pod bolted onto a piece of junk, its pilot in a little window. Turns to him and fires in bursts.
//   zmine:     a space mine, sat there. Get close and it's armed (blinking fast), then it goes off. Shot, it goes off
//              anyway (whoever's near it gets it: chain them).
//   zcruiser:  a gunship. Comes on and sits, warms its nose up (a thin line where it's going), then the beam, swinging
//              up or down after him as it fires; does it again, and leaves. The beam takes out anybody else in it too.
//   ufo:       the flying saucer (the sub-boss): its own file (ufo.ts) drives it; this only makes it a kind.
// Everything that moves with the screen goes along at the scroll's pace plus its own. Each new hurt has his callouts
// and its death screen (registerHurtLines: lines.ts).

import type { Enemy, EnemyKind } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { hazardVictims, hazardHit, setHazardZones } from '../../hazardHit';
import { HURT, KAMIKAZE_YELL, CRUISER_YELL } from './lines';
import { drawFighter, drawKamikaze, drawTurret, drawMine, drawCruiser, drawBeam, drawSaucer } from './art';
import { blast, bolt, bark } from './hazards';
import { orbitOf, type Rock } from './state';
import { CY, W } from './geo';

export const K = {
  fighter: 'm2:zfighter', kamikaze: 'm2:zkamikaze', turret: 'm2:zturret', mine: 'm2:zmine', cruiser: 'm2:zcruiser', ufo: 'm2:ufo',
} as const;

/** How one flies (fighters): its path across the screen. */
export type Path = 'line' | 'sine' | 'swoop' | 'behind' | 'loop';
/** Each one's own business (by enemy). */
export interface Pilot {
  female: boolean;
  t: number;
  /** Gone off the screen (or blown up): the section takes it out. */
  gone?: boolean;
  // fighters
  path?: Path; sy?: number; ey?: number; speed?: number; amp?: number; phase?: number; hold?: number; sit?: number; dir?: number; loopX?: number;
  armed?: boolean; every?: number; cd?: number; cd2?: number;
  // kamikazes
  kz?: 'in' | 'lock' | 'go'; gx?: number; gy?: number;
  // turrets
  on?: Rock; dx?: number; dy?: number; aim?: number; burst?: number; heat?: number;
  // mines
  armedT?: number; boomed?: boolean;
  // cruisers
  cr?: 'in' | 'warn' | 'fire' | 'cool' | 'out'; sx?: number; shots?: number; beamY?: number;
}
const pilots = new WeakMap<Enemy, Pilot>();
export const pilotOf = (e: Enemy) => pilots.get(e);

const mid = (p: { pos: { x: number; y: number }; width: number; height: number }) => ({ x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 });
/** The scroll's pace (world px a frame) and the screen's left. */
const sv = (state: GameState) => orbitOf(state).sv;
const camX = (state: GameState) => state.camera.x;
const onScreen = (state: GameState, e: Enemy, margin = 0) => {
  const x = e.pos.x + e.width / 2 - camX(state), y = e.pos.y + e.height / 2 - state.camera.y;
  return x > -margin && x < W + margin && y > -margin && y < 600 + margin;
};

/** Makes one at (x, y: its middle, world) with its business. */
export const spawn = (state: GameState, kind: string, x: number, y: number, p: Omit<Pilot, 't' | 'female'> & { female?: boolean }) => {
  const e = makeKindEnemy(kind as EnemyKind, x, y);
  e.pos.y = y - e.height / 2;
  e.homeY = e.pos.y;
  const female = p.female ?? Math.random() < 0.45;
  pilots.set(e, { ...p, female, t: 0 });
  e.facing = -1;
  state.enemies.push(e);
  orbitOf(state).tracked.push(e);
  return e;
};

// ---------------------------------------------------------------------------------------------------------------
// Fighters

const FIGHTER_SHOT = 11, FIGHTER_BOLT = 4.2;
const fighter = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, P = pilots.get(e);
  if (!P) return true;
  const t = ++P.t, v = sv(state), cam = camX(state), sx = e.pos.x + e.width / 2 - cam;
  const baseY = CY + (P.sy ?? 300);
  const speed = P.speed ?? 2.4;
  switch (P.path) {
    case 'sine':
      e.pos.x += v - speed;
      e.pos.y = baseY + Math.sin(t * 0.045 + (P.phase ?? 0)) * (P.amp ?? 70) - e.height / 2;
      e.facing = -1;
      break;
    case 'swoop': {
      // (in, to sit a while where it's put, shooting; then off up or down and out)
      const hold = P.hold ?? 560;
      if (t < (P.sit ?? 180) + 60) {
        const k = Math.min(1, t / 60);
        e.pos.x += v + ((hold + cam) - (e.pos.x + e.width / 2)) * 0.06 * k;
        e.pos.y += (baseY - e.height / 2 - e.pos.y) * 0.05;
      } else {
        const out = P.dir ?? (P.sy! < 300 ? -1 : 1);
        e.pos.x += v - 1.2;
        e.pos.y += out * Math.min(7, (t - (P.sit ?? 180) - 60) * 0.12);
      }
      e.facing = -1;
      break;
    }
    case 'behind':
      // (up from behind him: across the screen the other way, a little wave in it)
      e.pos.x += v + speed;
      e.pos.y = baseY + Math.sin(t * 0.05 + (P.phase ?? 0)) * (P.amp ?? 30) - e.height / 2;
      e.facing = 1;
      break;
    case 'loop': {
      const lx = P.loopX ?? 450;
      if (P.cd === undefined && sx > lx) e.pos.x += v - speed;
      else {
        // (round once, then on)
        P.cd ??= t;
        const a = (t - P.cd) * 0.05;
        if (a < Math.PI * 2) { e.pos.x = cam + lx - Math.sin(a) * 80 - e.width / 2; e.pos.y = baseY + (1 - Math.cos(a)) * -80 * (P.dir ?? 1) - e.height / 2; }
        else e.pos.x += v - speed * 1.3;
      }
      e.facing = -1;
      break;
    }
    default:
      e.pos.x += v - speed;
      e.pos.y = baseY + Math.sin(t * 0.03 + (P.phase ?? 0)) * 6 - e.height / 2;
      e.facing = -1;
  }
  // (just out of the saucer's hatch: from there into its path)
  if (P.ey !== undefined && t < 40) { const k = t / 40, want = e.pos.y; e.pos.y = P.ey - e.height / 2 + (want - (P.ey - e.height / 2)) * k * k * (3 - 2 * k); }
  // (shooting at him, the armed ones, once they're well on the screen)
  if (P.armed && state.player.health > 0) {
    P.cd2 ??= 30 + Math.floor(Math.random() * (P.every ?? 120));
    if (--P.cd2 <= 0 && sx > 40 && sx < W - 30) {
      P.cd2 = (P.every ?? 120) + Math.floor(Math.random() * 40);
      const m = mid(e), pm = mid(state.player);
      if (Math.abs(pm.x - m.x) > 90) { bolt(state, K.fighter, m.x + e.facing * 20, m.y + 4, pm.x, pm.y, FIGHTER_BOLT, FIGHTER_SHOT, v); playSound('sadBolt', 0.35, 4); }
    }
  }
  if (t > 30 && !onScreen(state, e, 160)) P.gone = true;
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// Kamikazes

const KAMI_DMG = 18, KAMI_SPEED = 8.5, KAMI_R = 70;
const kamikaze = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, P = pilots.get(e);
  if (!P) return true;
  const t = ++P.t, v = sv(state), cam = camX(state), p = state.player, pm = mid(p), m = mid(e);
  P.kz ??= 'in';
  if (P.kz === 'in') {
    // (on, easing in to sit off his right, lined up on him)
    e.pos.x += v + ((cam + (P.hold ?? 680)) - m.x) * 0.06;
    e.pos.y += (pm.y - m.y) * 0.04;
    e.facing = -1;
    if (t === 8) bark(state, e, pickLine(KAMIKAZE_YELL), P.female);
    if (t > 55) { P.kz = 'lock'; P.t = 0; }
  } else if (P.kz === 'lock') {
    e.pos.x += v;
    if (P.t === 1) playSound('alert', 0.5, 6);
    if (P.t > 26) { P.kz = 'go'; P.t = 0; const dx = pm.x - m.x, dy = pm.y - m.y, d = Math.hypot(dx, dy) || 1; P.gx = dx / d; P.gy = dy / d; playSound('whoosh', 0.8, -4); }
  } else {
    e.pos.x += v + (P.gx ?? -1) * KAMI_SPEED;
    e.pos.y += (P.gy ?? 0) * KAMI_SPEED;
    e.facing = (P.gx ?? -1) < 0 ? -1 : 1;
    // (into anybody else on its way: up it goes)
    for (const o of hazardVictims(state)) {
      if (o === e || o.pos.x > e.pos.x + e.width || o.pos.x + o.width < e.pos.x || o.pos.y > e.pos.y + e.height || o.pos.y + o.height < e.pos.y) continue;
      kamikazeBlows(ctx, e); return true;
    }
    // (into a rock)
    for (const k of orbitOf(state).rocks) if (Math.hypot(k.x - m.x, k.y - m.y) < k.r + 12) { kamikazeBlows(ctx, e); return true; }
    if (!onScreen(state, e, 120)) P.gone = true;
  }
  return true;
};
/** It goes up (whatever it hit; him, if he's in it). */
const kamikazeBlows = (ctx: FrameContext, e: Enemy) => {
  const P = pilots.get(e);
  if (P?.boomed) return;
  if (P) P.boomed = true;
  const m = mid(e);
  e.health = 0;
  ctx.fx.spawnDeathShower(m, 0, 0.8);
  blast(ctx, m.x, m.y, KAMI_R, KAMI_DMG, K.kamikaze);
};
/** Touching him: it blows up on him. */
const kamikazeTouch = (ctx: FrameContext, e: Enemy) => {
  if (e.health <= 0) return true;
  kamikazeBlows(ctx, e);
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// Turret pods (on a piece of junk: P.on, where on it P.dx, P.dy)

const TURRET_SHOT = 11, TURRET_BOLT = 4.6;
const turret = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, P = pilots.get(e);
  if (!P) return true;
  P.t++;
  if (P.on) { e.pos.x = P.on.x + (P.dx ?? 0) - e.width / 2; e.pos.y = P.on.y + (P.dy ?? 0) - e.height; }
  const m = { x: e.pos.x + e.width / 2, y: e.pos.y + e.height - 18 }, pm = mid(state.player);
  const want = Math.atan2(pm.y - m.y, pm.x - m.x);
  let d = want - (P.aim ?? Math.PI);
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  P.aim = (P.aim ?? Math.PI) + d * 0.06;
  e.facing = 1;
  if (P.heat) P.heat--;
  const sx = m.x - camX(state);
  if (sx > 30 && sx < W - 20 && state.player.health > 0) {
    P.cd ??= 50 + Math.floor(Math.random() * 60);
    if (--P.cd <= 0) { P.cd = 125; P.burst = 3; }
    if ((P.burst ?? 0) > 0 && P.t % 9 === 0) {
      P.burst!--; P.heat = 6;
      const a = P.aim!;
      bolt(state, K.turret, m.x + Math.cos(a) * 30, m.y + Math.sin(a) * 30, m.x + Math.cos(a) * 100, m.y + Math.sin(a) * 100, TURRET_BOLT, TURRET_SHOT);
      playSound('sadBolt', 0.35, -2);
    }
  }
  if (m.x < camX(state) - 200) P.gone = true;
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// Mines

const MINE_REACH = 115, MINE_FUSE = 34, MINE_R = 95, MINE_DMG = 16;
const mine = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, P = pilots.get(e);
  if (!P) return true;
  P.t++;
  e.pos.y = (e.homeY ?? e.pos.y) + Math.sin((P.t + (P.phase ?? 0)) * 0.04) * 8;
  const m = mid(e), pm = mid(state.player);
  if (P.armedT === undefined && state.player.health > 0 && Math.hypot(pm.x - m.x, pm.y - m.y) < MINE_REACH) { P.armedT = MINE_FUSE; playSound('beep', 0.6, 8); }
  if (P.armedT !== undefined) {
    if (P.armedT % 6 === 0) playSound('beep', 0.3, 12);
    if (--P.armedT <= 0) mineBlows(ctx, e);
  }
  if (m.x < camX(state) - 200) P.gone = true;
  return true;
};
export const mineBlows = (ctx: FrameContext, e: Enemy) => {
  const P = pilots.get(e);
  if (!P || P.boomed) return;
  P.boomed = true;
  const m = mid(e);
  e.health = 0;
  blast(ctx, m.x, m.y, MINE_R, MINE_DMG, K.mine);
};
const mineTouch = (ctx: FrameContext, e: Enemy) => { if (e.health > 0) mineBlows(ctx, e); return true; };

// ---------------------------------------------------------------------------------------------------------------
// Cruisers: sat at screen x P.sx; the beam out of its nose (on its left: it faces left)

const BEAM_DMG = 14, BEAM_ENEMY = 60, BEAM_H = 26, WARN = 55, FIRE = 100, COOL = 70, BEAM_SWEEP = 1.0;
const NOSE = 92, NOSE_Y = 24;
const cruiser = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, P = pilots.get(e);
  if (!P) return true;
  const t = ++P.t, v = sv(state), cam = camX(state), p = state.player, pm = mid(p);
  P.cr ??= 'in';
  const want = cam + (P.sx ?? 600);
  e.facing = -1;
  const step = (st: Pilot['cr']) => { P.cr = st; P.t = 0; };
  switch (P.cr) {
    case 'in':
      e.pos.x += v + (want - (e.pos.x + e.width / 2)) * 0.04;
      e.pos.y += (CY + (P.sy ?? 300) - e.height / 2 - e.pos.y) * 0.04;
      if (t > 70) step('warn');
      break;
    case 'warn':
      e.pos.x += v;
      if (t === 1 && Math.random() < 0.6) bark(state, e, pickLine(CRUISER_YELL), P.female);
      if (t === 1) playSound('alienCharge', 0.7);
      if (t > WARN) { step('fire'); playSound('alienBeam', 0.9); }
      break;
    case 'fire': {
      e.pos.x += v;
      // (swinging after him as it fires)
      const by = e.pos.y + e.height - NOSE_Y;
      e.pos.y += Math.sign(pm.y - by) * Math.min(BEAM_SWEEP, Math.abs(pm.y - by));
      if (t > FIRE) { step('cool'); P.shots = (P.shots ?? 0) + 1; }
      break;
    }
    case 'cool':
      e.pos.x += v;
      e.pos.y += (CY + (P.sy ?? 300) - e.height / 2 - e.pos.y) * 0.02;
      if (t > COOL) step((P.shots ?? 0) >= (P.every ?? 2) ? 'out' : 'warn');
      break;
    case 'out':
      e.pos.x += v + Math.min(6, t * 0.1);
      if (!onScreen(state, e, 200)) P.gone = true;
      break;
  }
  // The beam: where it is, what's in it
  const beamOn = P.cr === 'warn' || P.cr === 'fire';
  if (beamOn) {
    const x1 = e.pos.x + e.width / 2 - NOSE, y = e.pos.y + e.height - NOSE_Y;
    P.beamY = y;
    setHazardZones(state, `orbit-beam-${e.id}`, [{ x0: x1 - 900, x1, y0: y - BEAM_H, y1: y + BEAM_H }]);
    if (P.cr === 'fire') {
      if (p.health > 0 && p.invincibilityTimer <= 0 && p.pos.x < x1 && p.pos.y < y + BEAM_H / 2 && p.pos.y + p.height > y - BEAM_H / 2) hurtPlayer(ctx, BEAM_DMG, 'm2:alien_beam', { x: -3, y: Math.sign(pm.y - y || 1) * 5 });
      for (const o of hazardVictims(state)) if (o !== e && o.pos.x < x1 && o.pos.x + o.width > x1 - 900 && o.pos.y < y + BEAM_H / 2 && o.pos.y + o.height > y - BEAM_H / 2) hazardHit(ctx, o, BEAM_ENEMY, x1, 'BEAMED!');
    }
  }
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The saucer: driven by ufo.ts (this only keeps it where that puts it)

const ufoAI = () => true;

// ---------------------------------------------------------------------------------------------------------------

const flyer = (b: Enemy): Enemy => ({ ...b, enemyType: 'flyer', initialY: b.pos.y });
const g = (e: Enemy) => (pilots.get(e)?.female ? 'f' : 'm') as 'm' | 'f';
const fl = (e: Enemy) => (e.hitFlash ?? 0) > 0;

registerM2Kind({
  kind: K.fighter, stats: { w: 56, h: 30, hp: 50, contact: 12, mass: 90, air: true }, ai: fighter, make: flyer, gender: g, grab: 'none',
  draw: (c, e, f) => { const P = pilots.get(e); drawFighter(c, f, !!P?.female, false, fl(e), !!P?.armed); },
});
registerM2Kind({
  kind: K.kamikaze, stats: { w: 60, h: 26, hp: 30, contact: 0, mass: 70, air: true }, ai: kamikaze, make: flyer, gender: g, grab: 'none', touch: kamikazeTouch,
  draw: (c, e, f) => { const P = pilots.get(e); drawKamikaze(c, f, !!P?.female, fl(e) || (P?.kz === 'lock' && f % 6 < 3), P?.kz === 'go'); },
});
registerM2Kind({
  kind: K.turret, stats: { w: 40, h: 32, hp: 140, contact: 10, mass: 200, air: true }, ai: turret, make: flyer, gender: g, grab: 'none', fixture: true,
  draw: (c, e) => { const P = pilots.get(e); drawTurret(c, P?.aim ?? Math.PI, !!P?.female, fl(e), P?.heat ?? 0); },
});
registerM2Kind({
  kind: K.mine, stats: { w: 30, h: 30, hp: 20, contact: 0, mass: 40, air: true }, ai: mine, make: flyer, gender: 'n', robot: true, grab: 'none', touch: mineTouch, fixture: true,
  draw: (c, e, f) => { const P = pilots.get(e); drawMine(c, f, P?.armedT ?? 0, fl(e)); },
});
registerM2Kind({
  kind: K.cruiser, stats: { w: 180, h: 58, hp: 520, contact: 14, mass: 900, air: true }, ai: cruiser, make: flyer, gender: g, grab: 'none',
  draw: (c, e, f) => {
    const P = pilots.get(e);
    const charge = P?.cr === 'warn' ? Math.min(1, P.t / WARN) : P?.cr === 'fire' ? 1 : 0;
    drawCruiser(c, f, !!P?.female, fl(e), charge);
    if (P?.cr === 'warn') drawBeam(c, NOSE, -NOSE_Y, 900, f, true);
    else if (P?.cr === 'fire') drawBeam(c, NOSE, -NOSE_Y, 900, f, false, Math.min(1, P.t / 8));
  },
});
registerM2Kind({
  kind: K.ufo, stats: { w: 250, h: 92, hp: 100000, contact: 16, mass: 5000, air: true }, ai: ufoAI, make: flyer, gender: 'f', grab: 'none', midBoss: true,
  draw: (c, e, f, state) => {
    const s = orbitOf(state).saucer;
    drawSaucer(c, f, fl(e) || (s?.flash ?? 0) > 0, s?.red ?? 0, s?.open ?? 0);
  },
});

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, [...l.hurt], [...l.death]);

export const isOrbitKind = (e: Enemy) => !!e.kind && (Object.values(K) as string[]).includes(e.kind);
