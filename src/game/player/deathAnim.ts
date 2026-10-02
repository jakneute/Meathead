// How Meathead goes, by what got him: a short, stupid little animation in his place before the death screen goes up
// (the stage's own long death scenes aside). Anything with nothing special about it (a bullet, a punch, a fall) and he
// just comes apart, in all the meat he's made of.
//
//   burnt      fire of any kind: on fire, flailing, hopping; black and smoking; blinks; crumbles to a pile of ash
//   lava       into it: thrashing, going under, burning as he goes; then his gun bobs up and cooks off, and sinks
//   boiled     the steam: lobster red, hopping from foot to foot, then keels over, steaming
//   fried      electrocuted: the x-ray flashing, then black and smoking, his hair stood up, and over he goes like a plank
//   frozen     frozen solid in a block of ice, it tips over, and it shatters: ice and meat everywhere
//   buried     a mound of snow (or rock) comes down on him: just his legs out of the top, kicking, and then not
//   flattened  something heavy on him: flat as a pancake, a twitch, a widening pool
//   dissolved  the muck: going green, slumping into a puddle, and his skull bobs up in it and goes back under
//   roadkill   hit by something with an engine: knocked clean out of his boots and over the top of the screen; a twinkle
//   overdose   the needle (or the powder): the colours, a spin, and he floats up and away like the ones he's dosed

import type { FrameContext } from '../core/context';
import type { GameState } from '../core/state';
import { shakeScreen } from '../core/state';
import { hurtJustNow } from '../core/deathCause';
import { playSound } from '../platform/audio';
import { PARTICLE_PALETTES } from '../../constants';

export type MeatheadDeathKind = 'burnt' | 'lava' | 'boiled' | 'fried' | 'frozen' | 'buried' | 'flattened' | 'dissolved' | 'roadkill' | 'overdose';

export interface MeatheadDeath {
  kind: MeatheadDeathKind;
  /** Where he was: his middle (x) and his feet (y), and which way he faced. */
  x: number; y: number; facing: 1 | -1;
  /** (buried) snow, or rock. */
  snow?: boolean;
}

/** How long each one plays before the death screen goes up. */
export const MEATHEAD_DEATH_FRAMES: Record<MeatheadDeathKind, number> = {
  burnt: 95, lava: 125, boiled: 85, fried: 85, frozen: 80, buried: 95, flattened: 70, dissolved: 110, roadkill: 80, overdose: 120,
};

const BY_SOURCE: Record<string, MeatheadDeathKind> = {
  firedancer: 'burnt', flamejet: 'burnt', firebar: 'burnt', victor_barf: 'burnt', oil_fire: 'burnt', oil_fire_jet: 'burnt',
  fire_geyser: 'burnt', fire: 'burnt', gas_jet: 'burnt', lava_bomb: 'burnt', salamander: 'burnt', heatsuit: 'burnt',
  cork_blast: 'burnt', vent: 'burnt', lava_spout: 'burnt',
  lava: 'lava', magmafish: 'lava',
  steam: 'boiled',
  electric: 'fried', shock: 'fried', lightning: 'fried', self_tased: 'fried',
  ice: 'frozen', snowball: 'frozen',
  avalanche: 'buried', cave_in: 'buried', rockslide: 'buried',
  boulder: 'flattened', falling_debris: 'flattened', falling_steel: 'flattened', amalgam_fist: 'flattened', conveyor_crate: 'flattened',
  junk: 'flattened', floating_crate: 'flattened',
  sludge: 'dissolved', sewer_drip: 'dissolved', amalgam_drip: 'dissolved', tommy_burst: 'dissolved',
  traffic: 'roadkill', truck: 'roadkill', truck_charge: 'roadkill', road_car: 'roadkill', lowrider: 'roadkill', pickup: 'roadkill',
  cruiser: 'roadkill', chopper: 'roadkill', moose: 'roadkill', longhorn: 'roadkill', floating_car: 'roadkill',
  needle: 'overdose', powder_blast: 'overdose', meth_barrel: 'overdose',
};

/** What's just killed him, if it's got a death of its own. */
const kindFor = (state: GameState): MeatheadDeathKind | undefined => {
  const h = state.lastHurt;
  if (!h || !hurtJustNow(state, h.at)) return undefined;
  return BY_SOURCE[h.source] ?? (h.source.startsWith('junk_') ? 'flattened' : undefined);
};

/** He's dead: his own death for what did it (and the death screen waits for it), or false (he comes apart). */
export const startMeatheadDeath = (ctx: FrameContext): boolean => {
  const { state } = ctx;
  const p = state.player;
  if (p.health > 0 || p.jetski || p.bike || p.skiing || p.swimming) return false;
  const kind = kindFor(state);
  if (!kind) return false;
  state.meatheadDeath = { kind, x: p.pos.x + p.width / 2, y: p.pos.y + p.height, facing: p.facing === -1 ? -1 : 1, snow: state.lastHurt?.source === 'avalanche' };
  state.deathScene = { t: 0, len: MEATHEAD_DEATH_FRAMES[kind], voiced: false };
  return true;
};

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const GORE = PARTICLE_PALETTES.GORE;

/** Meat, and lots of it: the plain death, him coming apart. */
export const meatExplosion = (ctx: FrameContext) => {
  const { state, fx } = ctx;
  const p = state.player;
  const mid = { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 };
  fx.spawnDeathShower(p.pos, p.facing, 5);
  fx.spawnDeathShower(mid, -p.facing, 3);
  // Chunks of him, big ones, all over (they splat where they land)
  for (let i = 0; i < 34; i++) state.particles.push({ pos: { x: mid.x + rnd(-14, 14), y: mid.y + rnd(-26, 26) }, vel: { x: rnd(-13, 13), y: rnd(-15, -3) }, life: rnd(60, 110), color: GORE[i % GORE.length], size: i % 3 === 0 ? rnd(9, 14) : rnd(5, 9) });
  // A fine red mist where he stood
  for (let i = 0; i < 18; i++) state.particles.push({ pos: { x: mid.x + rnd(-20, 20), y: mid.y + rnd(-30, 30) }, vel: { x: rnd(-1.5, 1.5), y: rnd(-1.2, 0.4) }, life: rnd(30, 55), color: 'rgba(153, 27, 27, 0.35)', size: rnd(14, 26) });
  shakeScreen(state, 22, 10);
  playSound('splat', 1, -4); playSound('crunch', 0.8);
};

/** Each frame of it: its sounds and its bits (fire, smoke, steam, shards, splashes), on its beats. */
export const tickMeatheadDeath = (ctx: FrameContext, d: MeatheadDeath, t: number) => {
  const { state } = ctx;
  const P = state.particles;
  const top = d.y - 64;
  switch (d.kind) {
    case 'burnt':
      if (t === 1) { playSound('ignite', 1); playSound('flame', 0.6); }
      if (t < 42 && t % 2 === 0) P.push({ pos: { x: d.x + rnd(-14, 14), y: d.y - rnd(4, 60) }, vel: { x: rnd(-0.8, 0.8), y: rnd(-3.5, -1.5) }, life: rnd(12, 22), color: t % 4 ? '#FB923C' : '#FDE047', size: rnd(5, 10) });
      if (t > 20 && t % 3 === 0) P.push({ pos: { x: d.x + rnd(-8, 8), y: top + rnd(0, 20) }, vel: { x: rnd(-0.4, 0.4), y: rnd(-1.6, -0.8) }, life: rnd(30, 50), color: 'rgba(63, 63, 70, 0.55)', size: rnd(8, 14) });
      if (t === 60) playSound('crunch', 0.5, 6);
      if (t >= 60 && t < 82 && t % 2 === 0) P.push({ pos: { x: d.x + rnd(-10, 10), y: top + (t - 60) * 2.6 + rnd(0, 8) }, vel: { x: rnd(-1.2, 1.2), y: rnd(0.5, 2) }, life: 16, color: t % 4 ? '#27272A' : '#52525B', size: rnd(2, 4) });
      break;
    case 'lava':
      if (t === 1) { playSound('splash', 0.8, -6); playSound('ignite', 1, -4); }
      if (t < 80 && t % 4 === 0) P.push({ pos: { x: d.x + rnd(-20, 20), y: d.y - 2 }, vel: { x: rnd(-1, 1), y: rnd(-5, -2) }, life: 18, color: t % 8 ? '#F97316' : '#FDE047', size: rnd(3, 6) });
      if (t < 70 && t % 5 === 0) P.push({ pos: { x: d.x + rnd(-10, 10), y: d.y - rnd(10, 40) }, vel: { x: rnd(-0.3, 0.3), y: -1.4 }, life: 40, color: 'rgba(68, 64, 60, 0.5)', size: rnd(8, 14) });
      for (const shot of LAVA_COOKOFF) if (t === shot) { playSound('gun', 0.9, rnd(-2, 2)); for (let i = 0; i < 6; i++) P.push({ pos: { x: d.x, y: d.y - 26 }, vel: { x: rnd(-2, 2), y: rnd(-6, -3) }, life: 8, color: '#FEF08A', size: rnd(2, 4) }); }
      if (t === 112) playSound('glug', 0.8);
      break;
    case 'boiled':
      if (t === 1) playSound('ignite', 0.9, 6);
      if (t % 2 === 0) P.push({ pos: { x: d.x + rnd(-16, 16), y: d.y - rnd(6, 60) }, vel: { x: rnd(-0.6, 0.6), y: rnd(-2.6, -1.2) }, life: rnd(20, 36), color: t % 4 ? 'rgba(248, 250, 252, 0.8)' : 'rgba(226, 232, 240, 0.7)', size: rnd(6, 12) });
      if (t === 57) playSound('thud', 0.8);
      break;
    case 'fried':
      if (t < 38 && t % 5 === 0) playSound('taser', 0.8);
      if (t < 38 && t % 3 === 0) P.push({ pos: { x: d.x + rnd(-18, 18), y: d.y - rnd(4, 62) }, vel: { x: rnd(-3, 3), y: rnd(-3, 1) }, life: 7, color: t % 2 ? '#FFFFFF' : '#7DD3FC', size: rnd(2, 4) });
      if (t > 36 && t % 4 === 0) P.push({ pos: { x: d.x + rnd(-6, 6), y: top + rnd(-4, 10) }, vel: { x: rnd(-0.3, 0.3), y: -1.2 }, life: 40, color: 'rgba(63, 63, 70, 0.5)', size: rnd(6, 11) });
      if (t === 56) { playSound('thud', 1); shakeScreen(state, 6, 3); }
      break;
    case 'frozen':
      if (t === 1) playSound('ice', 1);
      if (t === 46) { playSound('thud', 1); shakeScreen(state, 8, 4); }
      if (t === FROZEN_SHATTER) {
        playSound('glass', 1); playSound('crunch', 0.8); shakeScreen(state, 16, 8);
        const cx = d.x + d.facing * 34, cy = d.y - 16;
        for (let i = 0; i < 30; i++) P.push({ pos: { x: cx + rnd(-34, 34), y: cy + rnd(-14, 14) }, vel: { x: rnd(-8, 8), y: rnd(-9, -2) }, life: rnd(30, 50), color: i % 3 ? '#BAE6FD' : '#F0F9FF', size: rnd(4, 9) });
        for (let i = 0; i < 26; i++) P.push({ pos: { x: cx + rnd(-30, 30), y: cy + rnd(-10, 10) }, vel: { x: rnd(-9, 9), y: rnd(-10, -2) }, life: rnd(60, 100), color: GORE[i % GORE.length], size: i % 3 === 0 ? rnd(8, 12) : rnd(4, 8) });
      }
      break;
    case 'buried':
      if (t === 1) { playSound(d.snow ? 'thud' : 'crash', 1); playSound('rumble', 0.7); shakeScreen(state, 14, 6); }
      if (t < 10) for (let i = 0; i < 3; i++) P.push({ pos: { x: d.x + rnd(-40, 40), y: d.y - rnd(0, 30) }, vel: { x: rnd(-3, 3), y: rnd(-3, -0.5) }, life: 28, color: d.snow ? 'rgba(241, 245, 249, 0.8)' : 'rgba(168, 162, 158, 0.7)', size: rnd(8, 14) });
      break;
    case 'flattened':
      if (t === 1) {
        playSound('slam', 1); playSound('crunch', 1); shakeScreen(state, 16, 8);
        for (let i = 0; i < 26; i++) P.push({ pos: { x: d.x + rnd(-10, 10), y: d.y - 4 }, vel: { x: (i % 2 ? 1 : -1) * rnd(3, 11), y: rnd(-6, -1) }, life: rnd(50, 90), color: GORE[i % GORE.length], size: rnd(3, 8) });
      }
      if (t === 38) playSound('splat', 0.4, 8);
      break;
    case 'dissolved':
      if (t === 1) playSound('ignite', 0.8, -8);
      if (t % 6 === 0) playSound('glug', 0.35, rnd(-4, 4));
      if (t % 3 === 0) P.push({ pos: { x: d.x + rnd(-24, 24), y: d.y - rnd(0, 30) }, vel: { x: rnd(-0.4, 0.4), y: rnd(-1.6, -0.6) }, life: 26, color: t % 2 ? 'rgba(163, 230, 53, 0.7)' : 'rgba(132, 204, 22, 0.5)', size: rnd(4, 9) });
      if (t === 86) playSound('glug', 0.8, -6);
      break;
    case 'roadkill':
      if (t === 1) {
        playSound('crash', 1); playSound('crunch', 1); shakeScreen(state, 18, 9);
        for (let i = 0; i < 24; i++) P.push({ pos: { x: d.x, y: d.y - 30 }, vel: { x: -d.facing * rnd(2, 10), y: rnd(-10, -2) }, life: rnd(50, 90), color: GORE[i % GORE.length], size: rnd(3, 8) });
      }
      if (t === ROADKILL_TWINKLE) playSound('ding', 0.9, 6);
      break;
    case 'overdose':
      if (t === 1) playSound('dart', 1);
      if (t === 20) playSound('powerup', 0.7, -8);
      if (t % 3 === 0) { const y = d.y - overdoseRise(t); P.push({ pos: { x: d.x + rnd(-20, 20), y: y - rnd(0, 64) }, vel: { x: rnd(-0.8, 0.8), y: rnd(-1, 0.6) }, life: 30, color: ['#F472B6', '#A78BFA', '#67E8F9', '#FDE047', '#86EFAC'][t % 5], size: rnd(2, 5) }); }
      break;
  }
};

/** (lava) His gun cooking off, three rounds, after he's under. */
export const LAVA_COOKOFF = [88, 96, 103];
/** (frozen) When the block, on its side, shatters. */
export const FROZEN_SHATTER = 52;
/** (roadkill) When he twinkles, up off the top of the screen. */
export const ROADKILL_TWINKLE = 46;
/** (overdose) How far he's floated up. */
export const overdoseRise = (t: number) => Math.max(0, t - 18) ** 1.45 * 0.32;
