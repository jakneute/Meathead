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
//   impaled    an icicle, point first, onto the top of his head: straight down through him, stopped dead on it, and
//              if he was off the ground he slides down it to the floor like a kebab
//   plucked    a bird's dive or swoop: it lands on his head, pecks his eyes out, one, two, and flies off with them;
//              him staggering about blind as everything goes dark
//   spiked     down a fault: the kill cam cuts to the bottom of it, a spike of rock, and him coming down onto it on his
//              back, through the middle, and sliding down it a way
//   cactus     run through on a cactus: lying across the top of it with the top of it out through his middle, or pinned
//              to the side of it on one of its arms; spines all over him

import type { FrameContext } from '../core/context';
import type { GameState } from '../core/state';
import { shakeScreen } from '../core/state';
import { hurtJustNow } from '../core/deathCause';
import { playSound } from '../platform/audio';
import { PARTICLE_PALETTES } from '../../constants';
import { floorTopAt } from '../core/terrain';
import { getStageLayout } from '../stages';
import { say, MEATHEAD_VOICE } from '../platform/speech';

export type MeatheadDeathKind = 'burnt' | 'lava' | 'boiled' | 'fried' | 'frozen' | 'buried' | 'flattened' | 'dissolved' | 'roadkill' | 'overdose' | 'impaled' | 'cactus' | 'plucked' | 'spiked'
  // the falls (the kill cam at the bottom: see render/player/fallCams)
  | 'fall_crevasse' | 'fall_trench' | 'fall_alley' | 'fall_crude' | 'fall_arroyo' | 'fall_rocks' | 'fall_dungeon'
  // the storm up Hector's tower: launched clean out of the atmosphere, to float there
  | 'space'
  // off the junk in the Eye of the storm, down into the sea, the Eye watching him all the way down
  | 'eye_fall';

/** What's run him through: an icicle (where), or a cactus (where, the top of it, which side he's on, and that side's edge). */
export interface Impale { frame: number; how: 'icicle' | 'cactus_top' | 'cactus_side'; x: number; top?: number; side?: number; edge?: number }

export interface MeatheadDeath {
  kind: MeatheadDeathKind;
  /** Where he was: his middle (x) and his feet (y), and which way he faced. */
  x: number; y: number; facing: 1 | -1;
  /** (buried) snow, or rock. */
  snow?: boolean;
  /** (impaled, cactus) what went through him; and (impaled) the floor under him. */
  impale?: Impale;
  floor?: number;
  /** (space) When he's out of the air (held back while he's still got something to say about it), and what he's
   * saying going up, while he says it. */
  outAt?: number;
  line?: string;
  talking?: boolean;
  lineUntil?: number;
  /** (plucked) The bird, and where it was when it got him. */
  bird?: { id: string; x: number; y: number };
}

/** How long each one plays before the death screen goes up. */
export const MEATHEAD_DEATH_FRAMES: Record<MeatheadDeathKind, number> = {
  burnt: 95, lava: 125, boiled: 85, fried: 85, frozen: 80, buried: 95, flattened: 70, dissolved: 110, roadkill: 80, overdose: 120,
  impaled: 80, cactus: 80, plucked: 150, spiked: 100,
  space: 360, eye_fall: 190, fall_crevasse: 110, fall_trench: 100, fall_alley: 120, fall_crude: 150, fall_arroyo: 130, fall_rocks: 120, fall_dungeon: 110,
};

const BY_SOURCE: Record<string, MeatheadDeathKind> = {
  firedancer: 'burnt', flamejet: 'burnt', firebar: 'burnt', victor_barf: 'burnt', oil_fire: 'burnt', oil_fire_jet: 'burnt',
  fire_geyser: 'burnt', fire: 'burnt', gas_jet: 'burnt', lava_bomb: 'burnt', salamander: 'burnt', heatsuit: 'burnt',
  cork_blast: 'burnt', vent: 'burnt', lava_spout: 'burnt',
  lava: 'lava', magmafish: 'lava',
  steam: 'boiled',
  electric: 'fried', shock: 'fried', lightning: 'fried', self_tased: 'fried',
  ice: 'frozen',
  snowball: 'buried',
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
  if (state.impaleAt && state.impaleAt.frame === h.at) return state.impaleAt.how === 'icicle' ? 'impaled' : 'cactus';
  if (state.pluckedBy && state.pluckedBy.frame === h.at && state.enemies.some(e => e.id === state.pluckedBy!.id)) return 'plucked';
  return BY_SOURCE[h.source] ?? (h.source.startsWith('junk_') ? 'flattened' : undefined);
};

/** He's dead: his own death for what did it (and the death screen waits for it), or false (he comes apart). */
export const startMeatheadDeath = (ctx: FrameContext): boolean => {
  const { state } = ctx;
  const p = state.player;
  if (p.jetski || p.bike || p.skiing || p.swimming) return false;
  const kind = p.health > 0 ? getStageLayout(ctx.stageId)?.fallDeathKind?.(ctx) : kindFor(state);
  if (!kind) return false;
  const x = p.pos.x + p.width / 2, y = p.pos.y + p.height;
  const snow = state.lastHurt?.source === 'avalanche' || state.lastHurt?.source === 'snowball';
  const bird = kind === 'plucked' ? state.enemies.find(e => e.id === state.pluckedBy!.id) : undefined;
  state.meatheadDeath = { kind, x, y, facing: p.facing === -1 ? -1 : 1, snow, impale: state.impaleAt, floor: kind === 'impaled' ? (floorTopAt(state.blocks, x, y, 0) ?? y) : undefined,
    bird: bird ? { id: bird.id, x: bird.pos.x, y: bird.pos.y } : undefined };
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
    case 'impaled': {
      if (t === 1) {
        playSound('crunch', 1); playSound('crack', 0.9, -4); shakeScreen(state, 14, 7);
        for (let i = 0; i < 18; i++) P.push({ pos: { x: d.x + rnd(-6, 6), y: top + rnd(-4, 10) }, vel: { x: rnd(-5, 5), y: rnd(-8, -2) }, life: rnd(50, 80), color: GORE[i % GORE.length], size: rnd(3, 7) });
      }
      const slid = impaledFeet(d, t);
      if (slid !== d.y && t < 16 && t % 2 === 0) playSound('splat', 0.25, 6);
      if (t > 4 && t % 5 === 0) P.push({ pos: { x: d.x + rnd(-2, 2), y: slid + 1 }, vel: { x: 0, y: 1 }, life: 30, color: GORE[t % GORE.length], size: rnd(2, 4) });
      break;
    }
    case 'cactus': {
      if (t === 1) {
        playSound('crunch', 1); playSound('splat', 0.8); shakeScreen(state, 12, 6);
        for (let i = 0; i < 18; i++) P.push({ pos: { x: d.x + rnd(-10, 10), y: d.y - rnd(20, 44) }, vel: { x: rnd(-5, 5), y: rnd(-7, -1) }, life: rnd(50, 80), color: GORE[i % GORE.length], size: rnd(3, 7) });
      }
      if (t > 6 && t % 6 === 0) P.push({ pos: { x: d.x + rnd(-8, 8), y: d.impale?.how === 'cactus_top' ? (d.impale.top ?? d.y) + 6 : d.y - 30 }, vel: { x: 0, y: 1.5 }, life: 30, color: GORE[t % GORE.length], size: rnd(2, 4) });
      break;
    }
    case 'plucked': {
      // The bird: onto his head, pecking, and away with them
      const e = state.enemies.find(q => q.id === d.bird?.id);
      if (e) {
        const hx = d.x + d.facing * 4 - e.width / 2, hy = d.y - 62 - e.height + 8;
        e.vel = { x: 0, y: 0 };
        if (t <= PLUCK_LAND) { const k = t / PLUCK_LAND; e.pos.x = d.bird!.x + (hx - d.bird!.x) * k; e.pos.y = d.bird!.y + (hy - d.bird!.y) * k; }
        else if (t < PLUCK_AWAY) { e.pos.x = hx + pluckSway(t); e.pos.y = hy + (t % 8 < 3 ? 5 : 0); e.facing = d.facing; }
        else { const k = t - PLUCK_AWAY; e.facing = (d.facing * -1) as 1 | -1; e.pos.x = hx + e.facing * k * 5; e.pos.y = hy - k * 4 - k * k * 0.02 + Math.sin(k * 0.8) * 2; }
      }
      if (t > PLUCK_LAND && t < PLUCK_AWAY && t % 8 === 0) playSound('punch', 0.25, 10);
      for (const at of PLUCKS) if (t === at) {
        playSound('splat', 0.9, 4); playSound('hurt', 0.8);
        for (let i = 0; i < 12; i++) P.push({ pos: { x: d.x + d.facing * (at === PLUCKS[0] ? 3 : 9), y: d.y - 54 }, vel: { x: rnd(-4, 4), y: rnd(-6, -1) }, life: rnd(40, 70), color: GORE[i % GORE.length], size: rnd(2, 5) });
      }
      if (t === PLUCK_AWAY) playSound('whoosh', 0.8);
      // (and he's got something to say about it, the bird flying off with them)
      if (t === PLUCK_AWAY + 2) say(PLUCK_LINES[Math.floor(Math.random() * PLUCK_LINES.length)], MEATHEAD_VOICE, 'queue', { always: true, onShow: () => {}, onHide: () => {} });
      if (t > PLUCKS[0] && t % 4 === 0) P.push({ pos: { x: d.x + d.facing * 6 + rnd(-3, 3), y: d.y - 50 }, vel: { x: 0, y: 1.2 }, life: 20, color: GORE[t % GORE.length], size: rnd(2, 3) });
      if (t === PLUCK_FALL + 12) playSound('thud', 0.9);
      break;
    }
    case 'fall_crevasse': case 'fall_trench': case 'fall_alley': case 'fall_crude': case 'fall_arroyo': case 'fall_rocks': case 'fall_dungeon': {
      const s = t - FALL_HIT;
      if (t === 1) playSound('whoosh', 0.9, -6);
      if (s === 0) {
        shakeScreen(state, 16, 8);
        if (d.kind === 'fall_crude') playSound('splash', 1, -6);
        else { playSound('crunch', 1); playSound(d.kind === 'fall_crevasse' ? 'thud' : 'splat', 1, -4); }
        if (d.kind === 'fall_arroyo' || d.kind === 'fall_dungeon') playSound('crack', 1, -2);
      }
      if (d.kind === 'fall_crevasse' && s === 40) playSound('ice', 0.7, -4);
      if (d.kind === 'fall_trench' && s > 0 && s % 24 === 0) playSound('splash', 0.25, 4);
      if (d.kind === 'fall_crude' && s === 55) playSound('glug', 0.9, -8);
      if (d.kind === 'fall_crude' && s === 74) { playSound('ignite', 1); playSound('boom', 0.7); }
      if (d.kind === 'fall_rocks' && s === 30) playSound('splash', 1);
      if (d.kind === 'fall_dungeon' && s > 36 && s < 70 && s % 8 === 0) playSound('clink', 0.6, -6);
      break;
    }
    case 'space': {
      // (the roar of it going up; then, out of the air, nothing at all)
      const out = d.outAt ??= SPACE_OUT;
      if (t === 1) { playSound('thunder', 1); playSound('whoosh', 1, -8); }
      // Going up, he's got something to say about this wind
      if (t === 6) {
        const text = SPACE_LINES[Math.floor(Math.random() * SPACE_LINES.length)];
        const said = say(text, MEATHEAD_VOICE, 'urgent', {
          always: true,
          onShow: spoken => { d.talking = spoken; d.lineUntil = spoken ? 0 : t + 150; },
          onHide: () => { d.talking = false; },
        });
        // (up on the screen as he says it; with no voice to say it with, for a while all the same)
        d.line = text; d.lineUntil = t + 160;
        void said;
      }
      // (and he's not out of the air till he's said it)
      if (t >= out - 40 && (d.talking || (d.lineUntil ?? 0) > t) && state.deathScene) { d.outAt = out + 1; state.deathScene.len++; }
      if (t < out && t % 14 === 0) playSound('whoosh', 0.9 - Math.min(1, t / out) * 0.7, -6 + Math.min(t, 140) / 20);
      if (t === out + 26) playSound('glug', 0.3, 12);
      break;
    }
    case 'eye_fall':
      if (t === 1) playSound('whoosh', 0.8, -4);
      if (t === EYE_FALL_SPLASH) playSound('splash', 0.7, 4);
      if (t === EYE_FALL_SPLASH + 26 || t === EYE_FALL_SPLASH + 70) playSound('click', 0.5, -6);
      if (t === EYE_FALL_SPLASH + 40) playSound('beep', 0.5, 10);
      break;
    case 'spiked':
      if (t === 1) playSound('whoosh', 0.9, -6);
      if (t === SPIKE_HIT) { playSound('crunch', 1); playSound('splat', 1, -4); shakeScreen(state, 18, 9); }
      if (t === SPIKE_HIT + 8) playSound('crunch', 0.5, -8);
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
/** (impaled) Where his feet are: stopped dead where it got him, and, if that was off the ground, sliding down it to the floor. */
export const impaledFeet = (d: MeatheadDeath, t: number) => { const k = Math.min(1, Math.max(0, (t - 6) / 12)); return d.y + ((d.floor ?? d.y) - d.y) * k * k; };
/** (plucked) The bird lands on his head; plucks one eye, then the other; flies off with them; he goes over (blind,
 * the dark coming in all the while from the first); and how long it all takes. */
export const PLUCK_LAND = 10, PLUCKS = [24, 36], PLUCK_AWAY = 44, PLUCK_FALL = 110, PLUCK_FRAMES = 150;
/** (plucked) Him staggering about blind, and the bird on his head going with him. */
export const pluckSway = (t: number) => (t > PLUCKS[0] ? Math.sin((t - PLUCKS[0]) * 0.11) * Math.min(1, (t - PLUCKS[0]) / 30) * 14 : 0);
/** (plucked) How dark it's got: from the first eye, slowly, all the way. */
export const pluckDark = (t: number) => Math.max(0, Math.min(1, (t - PLUCKS[0]) / (PLUCK_FRAMES - 10 - PLUCKS[0])));
/** (plucked) Him, blind, as it flies off with them. */
const PLUCK_LINES = [
  'MY EYES! MY BEAUTIFUL EYES!',
  'GIVE THOSE BACK, YOU FEATHERED BASTARD!',
  "I CAN'T SEE MY GAINS!",
  'WHO TURNED OFF THE LIGHTS?!',
];
/** (space) When he's out of the air (at the soonest: he gets his line out first). */
export const SPACE_OUT = 140;
/** (eye_fall) When he hits the water. */
export const EYE_FALL_SPLASH = 64;
/** (space) What he's got to say about it on the way up: a breeze, this is not. */
const SPACE_LINES = [
  'I WEIGH TWO-SIXTY! WHAT KIND OF WIND DOES THIS?!',
  'THIS ISN\'T WIND! THIS IS A ROCKET ENGINE!',
  'I BENCH FOUR HUNDRED AND I\'M LOSING TO A BREEZE?!',
  'WHO PUT A JET ENGINE IN A HURRICANE?!',
];
/** (the falls) When he hits the bottom. */
export const FALL_HIT = 18;
/** (spiked) When he comes down onto it. */
export const SPIKE_HIT = 16;
/** (overdose) How far he's floated up. */
export const overdoseRise = (t: number) => Math.max(0, t - 18) ** 1.45 * 0.32;
