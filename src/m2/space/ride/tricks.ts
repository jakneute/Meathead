// The ride's tricks, from the sled (laid out in layout.ts; painted in art.ts). The show's (Robo-Butler, the laser
// curtains, the rockets, the meteors lowered onto the track) only while the show's got power: once the MAIN BREAKER's
// gone, they're dead. The warehouse's (the forklift's pallet, the ladder, the meteor on the hand hoist, the workers)
// whatever. Each one, set off as the sled comes (once a go, reset every life), hits whoever's in the way: him, and
// anybody else (hazardHit.ts). And the sled itself: anybody on the track ahead of it is run over.
//   satellite  hung low over the track (duck)
//   butler     the tray out across the track: the eyes light (the tell), out it swings, holds, back (rim-high: jump;
//              head-high: duck)
//   laser      a curtain of beams across the track: full (on and off: time it, on a bit or held back), or a band at head
//              height (duck) or at the rim (jump)
//   meteor     lowered onto the track ahead (it rattles first): sat there a moment, then hauled up. Jump it, or time it
//   rocket     hung nose-up over the track, its exhaust down across it on a cycle (sputtering first): time it
//   forklift   its pallet across the track, rim-high (jump)

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { hazardVictims, hazardHit, hazardKill, boxHits, setHazardZones, type Zone } from '../../hazardHit';
import { registerHurtLines } from '../../kinds';
import {
  SATELLITES, BUTLERS, LASERS, LASER_CYCLE, LASER_ON, LASER_TELL, METEORS, ROCKETS, ROCKET_CYCLE, ROCKET_ON, ROCKET_TELL,
  FORKLIFT_X, trackY, lightsOn,
} from './layout';
import * as L from './lines';

registerHurtLines('ride_satellite', L.HURT_SATELLITE, L.DEATH_SATELLITE);
registerHurtLines('ride_butler', L.HURT_BUTLER, L.DEATH_BUTLER);
registerHurtLines('ride_pit', L.HURT_PIT, L.DEATH_PIT);
registerHurtLines('ride_laser', L.HURT_LASER, L.DEATH_LASER);
registerHurtLines('ride_meteor', L.HURT_METEOR, L.DEATH_METEOR);
registerHurtLines('ride_rocket', L.HURT_ROCKET, L.DEATH_ROCKET);
registerHurtLines('ride_forklift', L.HURT_FORKLIFT, L.DEATH_FORKLIFT);

// ---------------------------------------------------------------------------------------------------------------
// Timing and shape

/** How far over the rail a satellite's bottom is (his head sat up's over that; ducked, under). */
export const SAT_CLEAR = 66;
/** Robo-Butler: cued with the sled this far off; the tell, the swing out, held out, back. Its tray's band over the
 *  rail (rim-high: the sled's rim; head-high: his head sat up). */
export const BUTLER_CUE = 640, BUTLER_TELL = 40, BUTLER_OUT = 10, BUTLER_HOLD = 60, BUTLER_BACK = 24;
export const trayBand = (high: boolean): [number, number] => (high ? [106, 64] : [56, 30]);
export const butlerReach = (t: number) => {
  if (t <= BUTLER_TELL) return 0;
  let u = t - BUTLER_TELL;
  if (u < BUTLER_OUT) return u / BUTLER_OUT;
  u -= BUTLER_OUT;
  if (u < BUTLER_HOLD) return 1;
  u -= BUTLER_HOLD;
  return Math.max(0, 1 - u / BUTLER_BACK);
};
/** A laser curtain's band over the rail (top, bottom). */
export const laserBand = (kind: 'full' | 'high' | 'low'): [number, number] => (kind === 'full' ? [210, 0] : kind === 'high' ? [112, 62] : [52, 20]);
/** A full curtain, on or off, and the tell before it comes on. Bands are always on. */
export const laserAt = (kind: 'full' | 'high' | 'low', frame: number, phase: number) => {
  if (kind !== 'full') return { on: true, tell: 0 };
  const c = (frame + phase) % LASER_CYCLE, off = LASER_CYCLE - LASER_ON;
  return c >= off ? { on: true, tell: 0 } : { on: false, tell: c >= off - LASER_TELL ? (c - off + LASER_TELL) / LASER_TELL : 0 };
};
export const rocketAt = (frame: number, phase: number) => {
  const c = (frame + phase) % ROCKET_CYCLE, off = ROCKET_CYCLE - ROCKET_ON;
  return c >= off ? { on: true, tell: 0 } : { on: false, tell: c >= off - ROCKET_TELL ? (c - off + ROCKET_TELL) / ROCKET_TELL : 0 };
};
export const ROCKET_TOP = 270, EXHAUST_W = 70;
/** A meteor: cued this far off; the rattle, the drop, sat, hauled up; how high it hangs, its size. */
export const MET_CUE = 620, MET_TELL = 30, MET_DROP = 10, MET_SIT = 80, MET_UP = 50, MET_HANG = 300, MET_R = 26;
export const meteorAt = (t: number) => {
  if (t <= 0) return { h: MET_HANG, falling: false, down: false, tell: 0 };
  if (t < MET_TELL) return { h: MET_HANG, falling: false, down: false, tell: t / MET_TELL };
  let u = t - MET_TELL;
  if (u < MET_DROP) return { h: MET_HANG * (1 - (u / MET_DROP) ** 2), falling: true, down: false, tell: 0 };
  u -= MET_DROP;
  if (u < MET_SIT) return { h: 0, falling: false, down: true, tell: 0 };
  u -= MET_SIT;
  return { h: Math.min(MET_HANG, MET_HANG * (u / MET_UP)), falling: false, down: false, tell: 0 };
};
/** The forklift's pallet over the rail (top, bottom) and how wide. */
export const PALLET: [number, number] = [52, 20];

export interface Tricks { butler: number[]; meteor: number[]; smashed: Set<number>; hit: Set<string> }
export const newTricks = (): Tricks => ({ butler: BUTLERS.map(() => 0), meteor: METEORS.map(() => 0), smashed: new Set(), hit: new Set() });
export interface SledView { x: number; y: number; air: boolean; t: number }

type Box = { x: number; y: number; w: number; h: number };
const overlap = (a: Box, b: Box) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const pBox = (state: GameState): Box => {
  const p = state.player, low = p.isDucking ? 28 : 0;
  return { x: p.pos.x + 4, y: p.pos.y + low, w: p.width - 8, h: p.height - low };
};
const tub = (s: SledView): Box => ({ x: s.x - 70, y: s.y - 44, w: 160, h: 40 });
const canHurt = (state: GameState) => state.player.invincibilityTimer <= 0 && state.player.health > 0 && !state.player.inCutscene;

/** `first(kind)`: the first of that kind this go (he's got something to say, the first time). */
export const runTricks = (ctx: FrameContext, tr: Tricks, s: SledView, first: (kind: string) => void) => {
  const { state } = ctx, f = state.frame;
  const zones: Zone[] = [];
  const me = pBox(state), body = tub(s);
  const show = !lightsOn(state);
  const cue = s.t > 60;
  const near = (x: number, r = 900) => Math.abs(x - s.x) < r;
  /** Whoever's in a box: him (`mine`: his box or the sled's), anybody else. A once-a-pass key for him. */
  const hit = (key: string, box: Box, mine: Box, dmg: number, source: string, call: string) => {
    if (canHurt(state) && !tr.hit.has(key) && overlap(mine, box)) {
      tr.hit.add(key); hurtPlayer(ctx, dmg, source); shakeScreen(state, 8, 4); playSound('punch', 0.9);
    }
    for (const e of hazardVictims(state)) if (boxHits(e, box.x, box.y, box.w, box.h)) hazardHit(ctx, e, 60, box.x + box.w, call, { knock: 9 });
  };
  // Satellites (and the ladder): ducked under, or it's his face
  SATELLITES.forEach((x, i) => {
    const rail = trackY(x) ?? s.y;
    if (s.x > x - 420 && s.x < x - 280) first('satellite');
    hit(`sat${i}`, { x: x - 30, y: rail - 400, w: 60, h: 400 - SAT_CLEAR }, me, 14, 'ride_satellite', 'BEANED!');
  });
  // Robo-Butler
  if (show) BUTLERS.forEach((b, i) => {
    if (tr.butler[i] === 0) { if (cue && s.x > b.x - BUTLER_CUE && s.x < b.x) { tr.butler[i] = 1; playSound('ding', 0.6, 8); } return; }
    const t = ++tr.butler[i];
    if (t === BUTLER_TELL) { playSound('whoosh', 0.8, 4); first('butler'); }
    const k = butlerReach(t), rail = trackY(b.x) ?? s.y, [top, bot] = trayBand(b.high);
    if (k > 0.7) {
      const box = { x: b.x - 40, y: rail - top, w: 80, h: top - bot };
      hit(`butler${i}`, box, b.high ? me : body, 14, 'ride_butler', 'SERVED!');
      zones.push({ x0: box.x, x1: box.x + box.w, y0: box.y, y1: box.y + box.h });
    }
  });
  // The laser curtains
  if (show) LASERS.forEach((l, i) => {
    if (!near(l.x, 1000)) return;
    const st = laserAt(l.kind, f, l.phase), rail = trackY(l.x) ?? s.y, [top, bot] = laserBand(l.kind);
    if (st.tell > 0 && st.tell < 0.05) playSound('beep', 0.4, 10);
    if (!st.on) return;
    if (Math.abs(s.x - l.x) < 500 && s.x < l.x) first('laser');
    const box = { x: l.x - 6, y: rail - top, w: 12, h: top - bot };
    hit(`laser${i}-${Math.floor((f + l.phase) / LASER_CYCLE)}`, box, l.kind === 'low' ? body : me, 12, 'ride_laser', 'LASERED!');
    zones.push({ x0: box.x - 20, x1: box.x + box.w + 20, y0: box.y, y1: box.y + box.h });
  });
  // The rockets' exhaust
  if (show) ROCKETS.forEach((r, i) => {
    if (!near(r.x, 1000)) return;
    const st = rocketAt(f, r.phase), rail = trackY(r.x) ?? s.y;
    if (st.tell > 0 && Math.random() < 0.5) state.particles.push({ pos: { x: r.x + (Math.random() - 0.5) * 20, y: rail - ROCKET_TOP + 4 }, vel: { x: (Math.random() - 0.5) * 2, y: 2 + Math.random() * 2 }, life: 16, color: Math.random() < 0.5 ? '#FDE047' : '#FB923C', size: 2 });
    if (!st.on) return;
    if ((f + r.phase) % ROCKET_CYCLE === ROCKET_CYCLE - ROCKET_ON) { playSound('flame', 1, -10); playSound('rumble', 0.7, 2); first('rocket'); }
    const box = { x: r.x - EXHAUST_W / 2, y: rail - ROCKET_TOP, w: EXHAUST_W, h: ROCKET_TOP };
    hit(`rocket${i}-${Math.floor((f + r.phase) / ROCKET_CYCLE)}`, box, me, 14, 'ride_rocket', 'TORCHED!');
    zones.push({ x0: box.x - 30, x1: box.x + box.w + 30, y0: box.y, y1: box.y + box.h });
  });
  // The meteors: lowered onto the track (the last: the warehouse's, on a hand hoist, dropped whatever)
  METEORS.forEach((x, i) => {
    if (tr.smashed.has(i) || (!show && i < 3)) return;
    if (tr.meteor[i] === 0) { if (cue && s.x > x - MET_CUE && s.x < x - 150) { tr.meteor[i] = 1; playSound('clink', 0.5, 4); first('meteor'); } return; }
    const t = ++tr.meteor[i], m = meteorAt(t), rail = trackY(x) ?? s.y;
    if (t === MET_TELL + MET_DROP) { playSound('thud', 1, -10); playSound('crumble', 0.4); shakeScreen(state, 6, 3); }
    const box = { x: x - MET_R, y: rail - m.h - MET_R * 2, w: MET_R * 2, h: MET_R * 2 };
    if (m.falling) hit(`metfall${i}`, box, me, 18, 'ride_meteor', 'METEORED!');
    if (m.down || m.h < 50) {
      // (sat on the track: into it, and it's in bits; over it, fine)
      if (overlap(body, box)) {
        tr.smashed.add(i);
        if (canHurt(state)) hurtPlayer(ctx, 16, 'ride_meteor');
        shakeScreen(state, 10, 5); playSound('crash', 0.9, -4); playSound('crumble', 0.8);
        for (let k = 0; k < 14; k++) state.particles.push({ pos: { x, y: rail - MET_R }, vel: { x: 2 + Math.random() * 6, y: -2 - Math.random() * 5 }, life: 40, color: ['#7C2D12', '#A8A29E', '#F97316'][k % 3], size: 3 + Math.random() * 4, grav: 0.3, chunk: true });
      }
      for (const e of hazardVictims(state)) if (boxHits(e, box.x, box.y, box.w, box.h)) hazardHit(ctx, e, 120, x, 'METEORED!', { knock: 8 });
    }
    if (m.tell > 0 || m.falling || m.down) zones.push({ x0: box.x - 20, x1: box.x + box.w + 20, y0: rail - MET_HANG - 60, y1: rail });
  });
  // The forklift's pallet
  {
    const rail = trackY(FORKLIFT_X) ?? s.y;
    if (near(FORKLIFT_X, 700) && s.x < FORKLIFT_X - 400) first('forklift');
    if (near(FORKLIFT_X, 500) && f % 70 === 0) playSound('horn', 0.4, 6);
    hit('forklift', { x: FORKLIFT_X - 44, y: rail - PALLET[0], w: 88, h: PALLET[0] - PALLET[1] }, body, 16, 'ride_forklift', 'FORKLIFTED!');
  }
  // The sled itself: anybody on the track in front of it, run down
  for (const e of hazardVictims(state)) {
    if (!boxHits(e, s.x + 20, s.y - 60, 80, 56)) continue;
    hazardKill(ctx, e, s.x - 40, 'RUN OVER!', { fling: { x: 9, y: -12 } });
    playSound('splat', 0.9); shakeScreen(state, 6, 3);
  }
  setHazardZones(state, 'ride', zones);
};
