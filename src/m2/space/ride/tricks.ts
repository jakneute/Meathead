// The ride's obstacles, from the sled (laid out in layout.ts; painted in art.ts), and the sled's own SPACE BLASTER.
// The show's (Robo-Butler, the lasers, the Martian cutouts, the asteroid) only while the show's got power: once the
// MAIN BREAKER's gone, they're dead. The warehouse's (the forklift's pallet, the snack cases) and the hung ones
// whatever. Every one's set by where the sled is (none on a timer: at the ride's fixed speed, what's cued is what
// he gets), and hits whoever's in the way: him, and anybody else (hazardHit.ts). And the sled itself: anybody on the
// track ahead of it is run over.
//
// How he's tested against them is measured up from the rail (rail-relative: a slope's the same as the flat):
//   duck   a wall from CLEAR up: his head sat up's over it, ducked it's under
//   jump   a hurdle up to HURDLE: the sled's wheels have to be over it all the way across
//   blast  a big thing stood on the rail (taller than any jump): blasted to bits before he's there, or it's in his face
//
// The space blaster: a green bolt out of his gun, sat in the sled (fire). Not his gun's: no ammo, the same for all of
// them. 25 a bolt (the ray gun's); it hurts anybody it hits too.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { hazardVictims, hazardHit, hazardKill, boxHits, setHazardZones, type Zone } from '../../hazardHit';
import { registerHurtLines } from '../../kinds';
import { OBS, CUES, CUE_XS, type Ob, trackY, railLine, lightsOn } from './layout';
import * as L from './lines';

registerHurtLines('ride_satellite', L.HURT_SATELLITE, L.DEATH_SATELLITE);
registerHurtLines('ride_butler', L.HURT_BUTLER, L.DEATH_BUTLER);
registerHurtLines('ride_pit', L.HURT_PIT, L.DEATH_PIT);
registerHurtLines('ride_laser', L.HURT_LASER, L.DEATH_LASER);
registerHurtLines('ride_meteor', L.HURT_METEOR, L.DEATH_METEOR);
registerHurtLines('ride_forklift', L.HURT_FORKLIFT, L.DEATH_FORKLIFT);
registerHurtLines('ride_martian', L.HURT_MARTIAN, L.DEATH_MARTIAN);
registerHurtLines('ride_crates', L.HURT_CRATES, L.DEATH_CRATES);

// ---------------------------------------------------------------------------------------------------------------
// Shape (all measured up from the rail)

/** A duck-under's bottom edge (his head sat up's at 78, ducked 48). */
export const CLEAR = 58;
/** A laser band's bottom edge, higher than the rest (so it plainly clears him ducked: his head's at HEAD_DOWN + FEET,
 *  48; sat up, 78, it gets him). */
export const BEAM_CLEAR = 68;
/** A hurdle's top. */
export const HURDLE = 26;
/** How tall a blast-it thing is (over anything he can jump: the jump's top is about 170). */
export const BIG = 220;
/** Half the width of each, along the track. */
export const halfW = (o: Ob) => (o.kind === 'rock' ? 46 : o.kind === 'sat' ? 30 : o.kind === 'tray' ? 40 : o.verb === 'jump' ? 22 : 32);

/** The sled's jump: up, and the pull down (about 63 frames in the air, 170 up at the top). */
export const JUMP_V = 11, JUMP_G = 0.35;
/** His box over the rail: his feet sat in it; his head sat up, ducked. The sled's wheels, from its middle. */
const FEET = 14, HEAD_UP = 64, HEAD_DOWN = 34, SEAT_X = 26, WHEELS: [number, number] = [-50, 46];

/** Robo-Butler's tray: how far out (0 tucked in, 1 across the track), by how far off the sled is. */
export const trayReach = (d: number) => (d > -140 ? Math.max(0, Math.min(1, (620 - d) / 60)) : Math.max(0, 1 - (-140 - d) / 80));
/** The asteroid: how high it hangs over the rail (lowered onto the track as the sled comes), by how far off. */
export const ROCK_HANG = 330, ROCK_R = 46;
export const rockHeight = (d: number) => (d > 610 ? ROCK_HANG : d > 560 ? ROCK_HANG * ((d - 560) / 50) ** 2 : 0);

export interface Bolt { x: number; y: number; vx: number; vy: number; ang: number; life: number }
export interface Bit { x: number; y: number; vx: number; vy: number; rot: number; col: string; w: number; h: number }
export interface Tricks {
  /** What's left of each blast-it one; which are in bits. */
  hp: number[]; broken: Set<number>;
  /** (once a pass: what's hit him) */
  hit: Set<string>;
  /** (the asteroid's come down: its thud's been) */
  landed: Set<number>;
  bolts: Bolt[]; cool: number; flash: number; bits: Bit[];
  /** Frames since each one was blasted (its bits), the hits it's taken (a flash). */
  hurtT: number[];
}
export const newTricks = (): Tricks => ({ hp: OBS.map(o => o.hp), broken: new Set(), hit: new Set(), landed: new Set(), bolts: [], cool: 0, flash: 0, bits: [], hurtT: OBS.map(() => 0) });
export interface SledView { x: number; y: number; air: boolean; t: number; ducked: boolean; speed: number }

/** Is it there, this go (the show's are dead once the breaker's gone; the blasted are in bits)? */
export const obLive = (state: GameState, tr: Tricks, i: number) => !tr.broken.has(i) && (!OBS[i].show || !lightsOn(state));
/** Is a cue's arrow lit: what it's about still to come, and near. */
export const cueLive = (state: GameState, tr: Tricks, i: number, sledX: number) => {
  const q = CUES[i];
  if (q.ob >= 0 && !obLive(state, tr, q.ob)) return false;
  return sledX < q.x + 20 && sledX > CUE_XS[i] - 900;
};

type Box = { x: number; y: number; w: number; h: number };
const canHurt = (state: GameState) => state.player.invincibilityTimer <= 0 && state.player.health > 0 && !state.player.inCutscene;

const burst = (state: GameState, tr: Tricks, x: number, y: number, cols: string[], n: number, big = 1) => {
  for (let k = 0; k < n; k++) tr.bits.push({ x: x + (Math.random() - 0.5) * 40 * big, y: y - Math.random() * 80 * big, vx: 1 + Math.random() * 8, vy: -3 - Math.random() * 7, rot: Math.random() * 6, col: cols[k % cols.length], w: 6 + Math.random() * 14 * big, h: 4 + Math.random() * 8 * big });
  for (let k = 0; k < 10; k++) state.particles.push({ pos: { x, y: y - 40 }, vel: { x: (Math.random() - 0.3) * 8, y: -Math.random() * 6 }, life: 22, color: k % 2 ? '#BBF7D0' : '#FDE047', size: 2 + Math.random() * 2 });
};
const COLS: Record<string, string[]> = { martian: ['#4ADE80', '#A16207', '#D6D3D1', '#166534'], rock: ['#78350F', '#A8A29E', '#F97316', '#57534E'], crates: ['#A16207', '#FDE047', '#DC2626', '#D6D3D1'] };

/** Blasts it to bits (a bolt's finished it, or he's gone through it). */
const smash = (state: GameState, tr: Tricks, i: number) => {
  const o = OBS[i], rail = trackY(o.x) ?? railLine(o.x);
  tr.broken.add(i);
  burst(state, tr, o.x, rail, COLS[o.kind] ?? COLS.crates, 18, o.kind === 'martian' ? 0.8 : 1.2);
  playSound('crash', 0.9, o.kind === 'martian' ? 6 : -4); playSound((o.kind === 'martian' ? 'crack' : 'crumble'), 0.8);
  shakeScreen(state, 6, 3);
};

/** Fires the space blaster (from his gun: `mx`, `my`), if it's ready. */
/** Fired from (mx, my), the way the sled's pointed (`ang`: up a hill, up it; in the air, the way it's tipped). */
export const fireBlaster = (tr: Tricks, mx: number, my: number, speed: number, ang = 0) => {
  if (tr.cool > 0) return false;
  tr.cool = 12; tr.flash = 5;
  const v = speed + 16;
  tr.bolts.push({ x: mx, y: my, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, ang, life: 30 });
  playSound('raygun', 0.55, -7);
  return true;
};

/** `first(kind)`: the first of that kind this go (he's got something to say, the first time). */
export const runTricks = (ctx: FrameContext, tr: Tricks, s: SledView, first: (kind: string) => void) => {
  const { state } = ctx, p = state.player;
  const zones: Zone[] = [];
  const lift = railLine(s.x) - s.y;
  const me = { x0: s.x + SEAT_X - 16, x1: s.x + SEAT_X + 16, top: lift + FEET + (s.ducked ? HEAD_DOWN : HEAD_UP) };
  const tub = { x0: s.x + WHEELS[0], x1: s.x + WHEELS[1], bot: lift };
  if (tr.cool > 0) tr.cool--;
  if (tr.flash > 0) tr.flash--;
  for (const [i, q] of CUES.entries()) if (s.x > CUE_XS[i] - 260 && s.x < q.x && cueLive(state, tr, i, s.x)) first(q.ob >= 0 ? OBS[q.ob].kind : 'gap');
  const hurt = (key: string, dmg: number, source: string) => {
    if (!canHurt(state) || tr.hit.has(key)) return;
    tr.hit.add(key); hurtPlayer(ctx, dmg, source); shakeScreen(state, 8, 4); playSound('punch', 0.9);
  };
  /** Anybody else in it. */
  const others = (box: Box, call: string) => { for (const e of hazardVictims(state)) if (boxHits(e, box.x, box.y, box.w, box.h)) hazardHit(ctx, e, 60, box.x + box.w, call, { knock: 9 }); };
  OBS.forEach((o, i) => {
    if (!obLive(state, tr, i)) return;
    if (Math.abs(o.x - s.x) > 1100) return;
    const rail = trackY(o.x) ?? railLine(o.x), hw = halfW(o), d = o.x - s.x;
    if (tr.hurtT[i] > 0) tr.hurtT[i]--;
    const across = (x0: number, x1: number) => x0 < o.x + hw && x1 > o.x - hw;
    if (o.verb === 'duck') {
      if (o.kind === 'tray' && trayReach(d) < 0.7) return;
      if (across(me.x0, me.x1) && me.top > (o.kind === 'beam' ? BEAM_CLEAR : CLEAR)) hurt(`${i}`, 14, o.kind === 'sat' ? 'ride_satellite' : o.kind === 'tray' ? 'ride_butler' : 'ride_laser');
      const box = { x: o.x - hw, y: rail - 600, w: hw * 2, h: 600 - CLEAR };
      others(box, o.kind === 'beam' ? 'LASERED!' : 'BEANED!');
      zones.push({ x0: box.x, x1: box.x + box.w, y0: box.y, y1: box.y + box.h });
    } else if (o.verb === 'jump') {
      if (across(tub.x0, tub.x1) && tub.bot < HURDLE - 4) hurt(`${i}`, 14, o.kind === 'trolley' ? 'ride_butler' : o.kind === 'wire' ? 'ride_laser' : 'ride_forklift');
      const box = { x: o.x - hw, y: rail - HURDLE, w: hw * 2, h: HURDLE };
      others(box, o.kind === 'wire' ? 'LASERED!' : 'TRIPPED!');
      zones.push({ x0: box.x, x1: box.x + box.w, y0: box.y, y1: box.y + box.h });
    } else {
      // (the asteroid: lowered onto the track as he comes; till it's down, it's not in his way)
      if (o.kind === 'rock') {
        const h = rockHeight(d);
        if (h === 0 && !tr.landed.has(i)) { tr.landed.add(i); playSound('thud', 1, -10); playSound('crumble', 0.5); shakeScreen(state, 6, 3); }
        if (h > ROCK_R) return;
      }
      const box = { x: o.x - hw, y: rail - BIG, w: hw * 2, h: BIG };
      if (across(Math.min(me.x0, tub.x0), Math.max(me.x1, tub.x1)) && tub.bot < BIG) {
        // (straight through it: it's in bits, and so's his face)
        smash(state, tr, i);
        if (canHurt(state)) { hurtPlayer(ctx, 18, o.kind === 'rock' ? 'ride_meteor' : o.kind === 'martian' ? 'ride_martian' : 'ride_crates'); shakeScreen(state, 10, 5); }
        return;
      }
      others(box, o.kind === 'rock' ? 'METEORED!' : 'FLATTENED!');
      zones.push({ x0: box.x - 20, x1: box.x + box.w + 20, y0: box.y, y1: box.y + box.h });
    }
  });
  // The space blaster's bolts: into the first thing in their way (a blast-it one, or anybody)
  for (const b of tr.bolts) {
    b.x += b.vx; b.y += b.vy; b.life--;
    for (const [i, o] of OBS.entries()) {
      if (o.verb !== 'blast' || !obLive(state, tr, i)) continue;
      if (o.kind === 'rock' && rockHeight(o.x - s.x) > ROCK_R) continue;
      const rail = trackY(o.x) ?? railLine(o.x), hw = halfW(o);
      if (b.x + 20 > o.x - hw && b.x - b.vx < o.x + hw && b.y > rail - BIG && b.y < rail + 4) {
        b.life = 0; tr.hp[i] -= 25; tr.hurtT[i] = 8;
        playSound('gunhit', 0.7, 4);
        for (let k = 0; k < 6; k++) state.particles.push({ pos: { x: o.x - hw, y: b.y }, vel: { x: -Math.random() * 3, y: (Math.random() - 0.5) * 4 }, life: 12, color: k % 2 ? '#4ADE80' : '#F0FDF4', size: 2 });
        if (tr.hp[i] <= 0) smash(state, tr, i);
        break;
      }
    }
    if (b.life <= 0) continue;
    for (const e of hazardVictims(state, { innocents: true })) if (boxHits(e, b.x - 4, b.y - 3, 28, 6)) { hazardHit(ctx, e, 25, b.x - 30, 'BLASTED!', { knock: 7 }); b.life = 0; break; }
    // (into the rail where it climbs: fizzled)
    const ry = trackY(b.x + 10);
    if (b.life > 0 && ry !== null && b.y > ry - 2) { b.life = 0; for (let k = 0; k < 5; k++) state.particles.push({ pos: { x: b.x, y: b.y }, vel: { x: -Math.random() * 2, y: -Math.random() * 3 }, life: 10, color: '#86EFAC', size: 2 }); }
  }
  tr.bolts = tr.bolts.filter(b => b.life > 0);
  for (const b of tr.bits) { b.vy += 0.4; b.x += b.vx; b.y += b.vy; b.rot += 0.2; }
  tr.bits = tr.bits.filter(b => b.y < s.y + 700).slice(-80);
  // The sled itself: anybody on the track in front of it, run down
  for (const e of hazardVictims(state, { innocents: true })) {
    if (!boxHits(e, s.x + 20, s.y - 60, 80, 56)) continue;
    hazardKill(ctx, e, s.x - 40, 'RUN OVER!', { fling: { x: 9, y: -12 } });
    playSound('splat', 0.9); shakeScreen(state, 6, 3);
  }
  setHazardZones(state, 'ride', zones);
  void p;
};

/** The bolts and the bits, once he's out of the riding (the brake run's scene): just moved on. */
export const settleTricks = (tr: Tricks) => {
  for (const b of tr.bolts) { b.x += b.vx; b.y += b.vy; b.life--; }
  tr.bolts = tr.bolts.filter(b => b.life > 0);
  for (const b of tr.bits) { b.vy += 0.4; b.x += b.vx; b.y += b.vy; b.rot += 0.2; }
  if (tr.cool > 0) tr.cool--;
  if (tr.flash > 0) tr.flash--;
};
