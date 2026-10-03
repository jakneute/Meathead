// The animals' own ways of killing him: when it's an animal's attack that's done it (its lunge, its charge, its bite,
// not just bumping into it), it finishes the job its own way. (The birds take his eyes: that's player/deathAnim's
// 'plucked'. The fire lizard and the lava fish burn him, like anything else that's on fire.)
//
//   throat     the wolverine, the coyote, the pit bull, the raccoon: bowled over onto his back, and it's on his chest,
//              worrying at his throat; then it rips it out, gives it a shake, and trots off with it
//   eaten      the gator: it's got his leg, he's down, and it eats him a bite at a time, feet first, working its way up
//              him, till it's had his head too, and it burps up a boot. (Shat himself? It gets as far as the shorts,
//              gags, spits, and leaves him there.)
//   gored      the steer: hooked up onto its horns, through the middle, and carried off across the screen at a trot,
//              bouncing on them and flailing, his blood down its face
//   halved     the flying shark: bitten clean in half, his top half gone off in its jaws; his legs stood there a moment,
//              spurting, before they go over
//   nutcracked the crab: it's clamped onto his crotch; he hops about with it hanging there, then folds, face first, the
//              crab still on, waving its other claw
//   swollen    the rattlesnake, the scorpion: the venom. He goes purple and swells up like a balloon, eyes bulging, lifts
//              off his feet a little, and pops
//   ratted     the rat: up his pant leg, a lump going up him (he slaps at it), up his neck, and out of his mouth; he goes
//              over like a plank, and it sits on him cleaning its whiskers before it's off
//   goated     the goat: butted flat on his back, and it hops up on his chest and screams, king of the hill
//   bowled     the armadillo, rolled into his ankles: he wobbles like a pin and goes over flat on his face. STRIKE.
//   iguanas    the iguana dropped on him: he looks up, and it rains iguanas, a pile of them, wriggling, his boot out of it
//   (the moose, its every reaction to being messed with)
//   stomped    slid into its legs: it rears up and stamps him flat into the snow, three times
//   lawndart   punched in its face: tossed up off its antlers out of sight, and down he comes, head first into the snow,
//              stuck up to his belt, legs kicking, and the moose has a sniff
//   punted     hit from behind: both hind legs, and he flies at the screen, smacks into it face first and slides down it
//   satOn      stomped on its back: bucked off onto his back, and it sits on him; his legs kick out from under its rump,
//              and it breaks wind
//   peedOn     in its way: run over flat, and it comes back, stands over him, and marks its territory

import type { FrameContext } from '../core/context';
import type { GameState } from '../core/state';
import type { Enemy, EnemyKind } from '../../types';
import { shakeScreen } from '../core/state';
import { playSound } from '../platform/audio';
import { PARTICLE_PALETTES } from '../../constants';
import { say, MEATHEAD_VOICE } from '../platform/speech';
import type { MeatheadDeath } from './deathAnim';

export type AnimalDeathKind = 'throat' | 'eaten' | 'gored' | 'halved' | 'nutcracked' | 'swollen' | 'ratted' | 'goated' | 'bowled' | 'iguanas'
  | 'stomped' | 'lawndart' | 'punted' | 'satOn' | 'peedOn';

/** How long each plays before the death screen goes up. */
export const ANIMAL_DEATH_FRAMES: Record<AnimalDeathKind, number> = {
  throat: 130, eaten: 200, gored: 150, halved: 110, nutcracked: 120, swollen: 115, ratted: 140, goated: 120, bowled: 100, iguanas: 120,
  stomped: 120, lawndart: 140, punted: 110, satOn: 140, peedOn: 160,
};

/** The ones that play out where he is, up in the air or not (the rest, up there, are an airfall: see deathAnim). */
export const ANIMAL_AIR_OK = new Set<AnimalDeathKind>(['gored', 'halved', 'stomped', 'lawndart', 'punted', 'satOn', 'peedOn']);

/** What an animal's attacks are (the states it's attacking in), and how it kills with them. */
const ATTACKS: Partial<Record<EnemyKind, [string[], AnimalDeathKind]>> = {
  wolverine: [['lunge'], 'throat'], coyote: [['lunge'], 'throat'], raccoon: [['lunge'], 'throat'], pitbull: [['lunge', 'leap'], 'throat'],
  gator: [['lunge', 'snap', 'ashore-lunge', 'breach'], 'eaten'],
  longhorn: [['charge'], 'gored'],
  goat: [['charge'], 'goated'],
  shark: [['bite'], 'halved'],
  crab: [['pinch', 'scuttle'], 'nutcracked'],
  scorpion: [['pinch', 'scuttle'], 'swollen'], rattlesnake: [['strike'], 'swollen'],
  rat: [['lunge'], 'ratted'],
  armadillo: [['lunge'], 'bowled'],
  iguana: [['drop', 'whip'], 'iguanas'],
};

/** It's just killed him by touching him: if that was its attack, how it finishes him. */
export const animalAttackDeath = (e: Enemy): AnimalDeathKind | undefined => {
  const a = e.kind ? ATTACKS[e.kind] : undefined;
  return a && a[0].includes(e.aiState ?? '') ? a[1] : undefined;
};

/** Note it down, if it's an animal's attack that's just killed him (call once he's out of health). */
export const noteAnimalKill = (state: GameState, e: Enemy, how = animalAttackDeath(e)) => {
  if (how) state.animalKill = { id: e.id, frame: state.frame, how };
};

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const GORE = PARTICLE_PALETTES.GORE;
const blood = (P: GameState['particles'], x: number, y: number, n: number, vx: number, vy: number, spread = 4) => {
  for (let i = 0; i < n; i++) P.push({ pos: { x: x + rnd(-2, 2), y: y + rnd(-2, 2) }, vel: { x: vx + rnd(-spread, spread), y: vy + rnd(-spread, spread * 0.5) }, life: rnd(40, 70), color: GORE[i % GORE.length], size: rnd(2, 5) });
};

// ---- the beats (shared with the drawing: render/player/animalDeaths)

/** (throat) It's on him; it rips it out; it's off with it. */
export const THROAT_ON = 14, THROAT_RIP = 62, THROAT_OFF = 92;
/** (eaten) Each bite: how far up him it's eaten (of his 64), and when. The last is his head. */
export const EAT_BITES: [number, number][] = [[18, 0.16], [36, 0.3], [54, 0.44], [72, 0.58], [92, 0.72], [124, 1]];
/** (eaten) Shat: it bites into the shorts, gags, spits, and goes. */
export const EAT_GAG = 56, EAT_SPIT = 72, EAT_LEAVE = 96;
/** (eaten) The burp that brings up his boot. */
export const EAT_BURP = 160;
/** (gored) Up on the horns; off at a trot. */
export const GORE_UP = 10, GORE_SPEED = 5;
/** (halved) Its lunge carrying on with his top half; his legs going over. */
export const HALVED_TOPPLE = 46;
/** (nutcracked) His hops, and going down. */
export const NUT_FOLD = 64;
/** (swollen) When he pops. */
export const SWELL_POP = 88;
/** (ratted) Into his boot, up his leg, his belly, his neck, out of his mouth, and off. */
export const RAT_IN = 8, RAT_MOUTH = 84, RAT_OFF = 118;
/** (goated) On his chest, and its screams. */
export const GOAT_ON = 22, GOAT_SCREAMS = [34, 70];
/** (bowled) Wobbling; over. */
export const BOWL_FALL = 26;
/** (iguanas) The rain of them: when each lands. */
export const IGUANA_RAIN = [14, 22, 28, 33, 39, 44, 50, 57, 63];
/** (stomped) Its stamps. */
export const STAMPS = [20, 44, 68];
/** (lawndart) Up and out of sight; back down, head first. */
export const DART_DOWN = 46;
/** (punted) When he hits the screen. */
export const PUNT_HIT = 18;
/** (satOn) He's down; it sits; it breaks wind. */
export const SIT_DOWN = 14, SIT_ON = 44, SIT_FART = 84;
/** (peedOn) It's back over him; it goes; it's done. */
export const PEE_BACK = 52, PEE_START = 64, PEE_END = 120;

/** (the ones he says something going) What, and holding the death screen back till he's said it. */
const sayGoing = (d: MeatheadDeath, lines: string[]) => {
  say(lines[Math.floor(Math.random() * lines.length)], MEATHEAD_VOICE, 'urgent', {
    always: true,
    onShow: spoken => { d.talking = spoken; },
    onHide: () => { d.talking = false; },
  });
};
/** (eaten) Him, as it starts on his legs. */
const GATOR_LINES = ['MY LEGS! I NEVER SKIPPED LEG DAY!', 'NOT THE CALVES! DO YOU KNOW HOW HARD CALVES ARE?!'];
/** (eaten, shat) ...and it's headed for the shorts. */
const GATOR_SHAT_LINES = ["IT'S HEADED FOR THE SHORTS. OH, IT'S GONNA REGRET THAT."];
/** (gored) Up on its horns, going. */
const STEER_LINES = ['PUT ME DOWN, YOU OVERGROWN HAMBURGER!', "I'M NOT A RODEO CLOWN! I'M A BODYBUILDER!"];
/** (halved) His top half, going off in its jaws. */
const SHARK_LINES = ['WAIT! MY LEGS ARE STILL DOWN THERE!', 'BRING BACK MY LOWER HALF!'];

/** Each frame of it: its sounds and its bits, on its beats. */
export const tickAnimalDeath = (ctx: FrameContext, d: MeatheadDeath, t: number) => {
  const { state } = ctx;
  const P = state.particles;
  const a = d.animal!;
  const side = a.side, y = d.floor ?? d.y;
  // (anything he says going: the death screen waits for him to finish)
  if (d.talking && state.deathScene && t >= state.deathScene.len - 2) state.deathScene.len++;
  switch (d.kind as AnimalDeathKind) {
    case 'throat': {
      if (t === 1) { playSound('roar', 0.7, 10); playSound('punch', 0.8); }
      if (t === THROAT_ON) { playSound('thud', 1); playSound('crunch', 0.5, 6); shakeScreen(state, 8, 4); }
      const nx = d.x - side * 46, ny = y - 12;
      if (t > THROAT_ON && t < THROAT_RIP) {
        if (t % 6 === 0) { playSound('punch', 0.4, 8); blood(P, nx, ny, 3, 0, -3, 3); }
        if (t % 18 === 0) playSound('roar', 0.35, 14);
      }
      if (t === THROAT_RIP) { playSound('splat', 1); playSound('crunch', 1, -2); shakeScreen(state, 12, 6); blood(P, nx, ny, 22, side * 2, -6, 5); }
      // (the spurts from where it was, weaker and weaker)
      if (t > THROAT_RIP && t < THROAT_RIP + 60 && (t - THROAT_RIP) % 9 < 3) { const k = 1 - (t - THROAT_RIP) / 60; blood(P, nx, ny - 2, 2, rnd(-1, 1), -7 * k - 1, 1.2); }
      if (t === THROAT_OFF) playSound('roar', 0.4, 16);
      break;
    }
    case 'eaten': {
      if (t === 1) { playSound('crunch', 1); playSound('splat', 0.7); shakeScreen(state, 8, 4); }
      if (t === 10) sayGoing(d, d.shat ? GATOR_SHAT_LINES : GATOR_LINES);
      for (const [at, k] of EAT_BITES) {
        if (t !== at || (d.shat && at > EAT_GAG)) continue;
        playSound('crunch', 1, rnd(-4, 0)); playSound('splat', 0.8);
        shakeScreen(state, 6, 3);
        const cx = d.x - side * k * 60;
        blood(P, cx, y - 10, 14, side * 2, -5, 4);
      }
      if (!d.shat && t > 4 && t < EAT_BITES[5][0] && t % 9 === 0) playSound('glug', 0.35, -6);
      if (d.shat) {
        if (t === EAT_GAG) { playSound('crunch', 0.9); playSound('fart', 0.6, -4); }
        if (t > EAT_GAG && t < EAT_SPIT && t % 5 === 0) playSound('glug', 0.6, 8);
        if (t === EAT_SPIT) {
          playSound('splat', 1, 4); playSound('barf', 0.8);
          const cx = d.x - side * 0.44 * 60;
          for (let i = 0; i < 18; i++) P.push({ pos: { x: cx + side * 20, y: y - 12 }, vel: { x: side * rnd(2, 8), y: rnd(-6, -1) }, life: rnd(40, 70), color: i % 3 ? '#713F12' : GORE[i % GORE.length], size: rnd(2, 5) });
        }
      }
      if (!d.shat && t === EAT_BURP) { playSound('fart', 0.9, -10); playSound('clink', 0.5, -8); }
      // (blood off the end of what's left of him)
      if (t > 20 && t % 7 === 0 && (!d.shat || t < EAT_LEAVE + 30)) { const k = eatenAt(d, t); if (k < 1) blood(P, d.x - side * k * 60, y - 8, 1, 0, 0.5, 0.5); }
      break;
    }
    case 'gored': {
      if (t === 1) { playSound('crunch', 1); playSound('splat', 1); shakeScreen(state, 12, 6); blood(P, d.x, d.y - 34, 18, -side * 2, -5, 4); }
      if (t === 8) sayGoing(d, STEER_LINES);
      if (t === GORE_UP + 6) playSound('snort', 0.8);
      if (t > GORE_UP && t % 12 === 0) playSound('step_dirt', 0.6, -6);
      if (t > GORE_UP && t % 5 === 0) { const ax = goredX(d, t) + a.dir * 16; blood(P, ax, a.y - 60 - goreBounce(t), 1, 0, 1, 0.6); }
      if (t === 120) playSound('bellow', 0.3, 6);
      break;
    }
    case 'halved': {
      if (t === 1) { playSound('crunch', 1); playSound('splat', 1, -2); shakeScreen(state, 14, 7); blood(P, d.x, d.y - 30, 26, a.dir * 3, -4, 5); }
      if (t === 6) sayGoing(d, SHARK_LINES);
      // (the fountain off the top of his legs)
      if (t > 2 && t < HALVED_TOPPLE + 30 && t % 2 === 0) { const k = Math.max(0.2, 1 - t / 80); const top = halvedLegsTop(d, t); blood(P, top.x, top.y, 1, rnd(-1.4, 1.4), -9 * k, 0.8); }
      if (t === HALVED_TOPPLE + 12) playSound('thud', 0.9);
      break;
    }
    case 'nutcracked': {
      if (t === 1) { playSound('crunch', 0.8, 8); playSound('hurt', 1, 12); }
      if (t < NUT_FOLD && t % 16 === 6) playSound('hurt', 0.8, 14 + rnd(-2, 2));
      if (t < NUT_FOLD && t % 16 === 0) playSound('land', 0.6);
      if (t === NUT_FOLD + 22) { playSound('thud', 1); shakeScreen(state, 6, 3); }
      break;
    }
    case 'swollen': {
      if (t === 1) playSound('dart', 0.8, -4);
      if (t < SWELL_POP && t % 10 === 0) playSound('snort', 0.4, -10 + t / 8);
      if (t === SWELL_POP) {
        playSound('boom', 0.8, 6); playSound('splat', 1); shakeScreen(state, 18, 9);
        const cx = d.x, cy = d.y - 36 - swellLift(t);
        for (let i = 0; i < 36; i++) P.push({ pos: { x: cx + rnd(-16, 16), y: cy + rnd(-24, 24) }, vel: { x: rnd(-12, 12), y: rnd(-13, 2) }, life: rnd(60, 110), color: i % 4 === 0 ? '#7E22CE' : GORE[i % GORE.length], size: i % 3 === 0 ? rnd(8, 12) : rnd(4, 8) });
        for (let i = 0; i < 14; i++) P.push({ pos: { x: cx + rnd(-20, 20), y: cy + rnd(-26, 26) }, vel: { x: rnd(-1.5, 1.5), y: rnd(-1.2, 0.4) }, life: rnd(30, 55), color: 'rgba(126, 34, 206, 0.3)', size: rnd(14, 24) });
      }
      break;
    }
    case 'ratted': {
      if (t === RAT_IN) playSound('punch', 0.4, 12);
      if (t > RAT_IN && t < RAT_MOUTH && t % 7 === 0) playSound('hurt', 0.4, 10 + rnd(-2, 4));
      if (t > 30 && t < 70 && t % 11 === 0) playSound('punch', 0.7, 2);
      if (t === RAT_MOUTH) { playSound('splat', 0.8, 6); playSound('hurt', 0.9, -2); blood(P, d.x + d.facing * 8, d.y - 50, 8, d.facing * 3, -3, 2); }
      if (t === RAT_MOUTH + 16) { playSound('thud', 1); shakeScreen(state, 6, 3); }
      break;
    }
    case 'goated': {
      if (t === 1) { playSound('punch', 1); playSound('thud', 0.8); }
      if (t === 12) playSound('thud', 1);
      if (t === GOAT_ON) { playSound('crunch', 0.9, 4); blood(P, d.x - side * 34, y - 18, 8, 0, -3, 3); }
      for (const s of GOAT_SCREAMS) if (t === s) { playSound('screams', 1, 10); playSound('bellow', 0.5, 14); }
      break;
    }
    case 'bowled': {
      if (t === 1) { playSound('crash', 0.8, 6); playSound('clink', 0.6, -4); }
      if (t < BOWL_FALL && t % 6 === 0) playSound('clink', 0.3, 6);
      if (t === BOWL_FALL + 10) {
        playSound('crash', 1, 4); playSound('crunch', 0.8); shakeScreen(state, 10, 5);
        ctx.fx.spawnDamageNumber({ x: d.x - 30, y: d.y - 90 }, 'STRIKE!', true, '#FACC15');
        blood(P, d.x + d.facing * 58, y - 6, 10, d.facing * 2, -3, 3);
      }
      break;
    }
    case 'iguanas': {
      if (t === 1) { playSound('thud', 0.7); playSound('hurt', 0.6, 4); }
      for (const at of IGUANA_RAIN) if (t === at) { playSound('thud', 0.6, rnd(-4, 4)); playSound('splat', 0.3, 8); shakeScreen(state, 3, 2); }
      if (t > 70 && t % 13 === 0) playSound('punch', 0.25, 10);
      break;
    }
    case 'stomped': {
      if (t === 1) { playSound('bellow', 0.9); playSound('thud', 0.8); }
      for (const s of STAMPS) if (t === s) {
        playSound('slam', 1); playSound('crunch', 1, -2); shakeScreen(state, 16, 8);
        blood(P, d.x, y - 4, 14, 0, -5, 6);
        for (let i = 0; i < 8; i++) P.push({ pos: { x: d.x + rnd(-30, 30), y: y - 2 }, vel: { x: rnd(-4, 4), y: rnd(-4, -1) }, life: 26, color: i % 2 ? '#F8FAFC' : '#CBD5E1', size: rnd(5, 10) });
      }
      break;
    }
    case 'lawndart': {
      if (t === 1) { playSound('punch', 1); playSound('whoosh', 1, -4); }
      if (t === DART_DOWN - 10) playSound('whoosh', 0.9, 4);
      if (t === DART_DOWN) {
        playSound('thud', 1); playSound('crunch', 0.7, -6); shakeScreen(state, 14, 7);
        for (let i = 0; i < 18; i++) P.push({ pos: { x: d.x + rnd(-20, 20), y: y - 4 }, vel: { x: rnd(-5, 5), y: rnd(-7, -2) }, life: 30, color: i % 2 ? '#F8FAFC' : '#E2E8F0', size: rnd(5, 10) });
      }
      if (t === DART_DOWN + 40) playSound('snort', 0.9);
      if (t === DART_DOWN + 58) playSound('snort', 0.6, 4);
      break;
    }
    case 'punted':
      if (t === 1) { playSound('slam', 1); playSound('whoosh', 1, -6); blood(P, d.x, d.y - 36, 12, -a.dir * 3, -3, 3); }
      if (t === PUNT_HIT) { playSound('splat', 1, -6); playSound('slam', 0.8, 6); shakeScreen(state, 20, 10); }
      if (t > PUNT_HIT + 10 && t < PUNT_HIT + 70 && t % 8 === 0) playSound('glass', 0.15, 12);
      break;
    case 'satOn': {
      if (t === 1) { playSound('whoosh', 0.8); }
      if (t === SIT_DOWN) { playSound('thud', 0.9); }
      if (t === SIT_ON) { playSound('slam', 1, -6); playSound('crunch', 1, -4); shakeScreen(state, 16, 8); blood(P, d.x - side * 10, y - 6, 12, 0, -4, 6); }
      if (t > SIT_ON && t < SIT_FART && t % 10 === 0) playSound('hurt', 0.3, -6);
      if (t === SIT_FART) { playSound('fart', 1, -12); shakeScreen(state, 4, 2); }
      if (t > SIT_FART && t < SIT_FART + 20 && t % 3 === 0) P.push({ pos: { x: d.x + side * 30 + rnd(-6, 6), y: y - 30 + rnd(-6, 6) }, vel: { x: rnd(-0.6, 0.6), y: rnd(-1, -0.3) }, life: 40, color: 'rgba(163, 152, 72, 0.45)', size: rnd(8, 14) });
      break;
    }
    case 'peedOn': {
      if (t === 1) { playSound('crash', 0.9, -4); playSound('crunch', 1); shakeScreen(state, 16, 8); blood(P, d.x, y - 4, 22, side * 4, -5, 6); }
      if (t > 10 && t < PEE_BACK && t % 10 === 0) playSound('step_snow', 0.7, -8);
      if (t === PEE_START) playSound('snort', 0.7);
      if (t > PEE_START && t < PEE_END && t % 6 === 0) playSound('tinkle', 0.6);
      if (t > PEE_START + 6 && t < PEE_END + 30 && t % 4 === 0) P.push({ pos: { x: d.x + rnd(-14, 14), y: y - 6 }, vel: { x: rnd(-0.3, 0.3), y: rnd(-1.4, -0.6) }, life: 34, color: 'rgba(241, 245, 249, 0.55)', size: rnd(6, 11) });
      break;
    }
  }
};

/** (eaten) How far up him it's eaten (of him, 0..1), t frames in. */
export const eatenAt = (d: MeatheadDeath, t: number) => {
  let k = 0;
  for (const [at, to] of EAT_BITES) if (t >= at && !(d.shat && at > EAT_GAG)) k = to;
  return k;
};
/** (gored) Where the steer's got to (its middle), and how high he's bouncing on its horns. */
export const goredX = (d: MeatheadDeath, t: number) => {
  const a = d.animal!;
  return a.x + a.dir * GORE_SPEED * Math.max(0, t - GORE_UP) + a.dir * Math.min(t, GORE_UP) * 3;
};
export const goreBounce = (t: number) => (t > GORE_UP ? Math.abs(Math.sin(t * 0.32)) * 14 : 0);
/** (halved) Where the top of his legs is (the fountain), t frames in. */
export const halvedLegsTop = (d: MeatheadDeath, t: number) => {
  const fall = Math.max(0, Math.min(1, (t - HALVED_TOPPLE) / 12));
  const a = -(d.animal?.dir ?? 1) * fall * fall * Math.PI / 2;
  const feet = halvedFeet(d, t);
  return { x: d.x + Math.sin(a) * 30, y: feet - Math.cos(a) * 30 };
};
/** (halved) His legs' feet: where he was, or (up in the air) dropping to the floor. */
export const halvedFeet = (d: MeatheadDeath, t: number) => Math.min(d.floor ?? d.y, d.y + 0.5 * 0.7 * t * t);
/** (swollen) How far up off his feet he's floated. */
export const swellLift = (t: number) => Math.max(0, t - 50) * 0.35;
