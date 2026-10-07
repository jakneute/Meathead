// How the finale's alien dies: which of his deaths it is (by what finished him), and where everything in it is, when.
// The kill cam (stages/finale/killCam.ts) frames it and keys its sounds and banner off this; the renderer
// (render/bosses/alienDeaths.ts) draws it. Every death starts the same way: wherever he was when he died (usually
// floating), he comes down to a spot on the floor well in from the walls, and it plays out from there. The ones that
// need a wall or the ceiling (the wave, the overdose) take him there from that spot as part of it.
//
//   ice (the shotgun):      frosted solid in mid-air, he drops like a fridge and bursts into green-veined chunks;
//   fire (the flamethrower, his grease going up): ablaze, the President's skin melting off him, the ray gun popping,
//                           over, burnt down to a black husk;
//   rock (the boulder):     his head knocked clean off, off the podium (BONK), rolling; the body staggers, over;
//   wave (the tsunami):     swept up off his feet, tumbling, into the wall flat, splattered across it, sliding down;
//   od (the needles, the contact high): blowing up like a balloon, floating up to the ceiling, POP;
//   zap (the taser):        jolted, his skeleton flickering through, then over stiff as a board, smoking;
//   melt (the sludge):      dissolving into a bubbling green puddle, down to his skull bobbing in it;
//   nuke (the oil rocket, the blast): he lands ticking, swells, and goes up: bits of him everywhere;
//   skull (the pistol, as he begs): a round through his head, out the back in a spray of green, eyes crossing;
//                           his float goes, he folds, keels over, and the lake of slime spreads out of him;
//   plain (anything else):  he comes down, keels over, and the lake of slime spreads out of him.

import type { WeaponType } from '../../types';
import type { BossCorpse } from '../core/state';
import { ROOM_L, ROOM_R, ROOM_MID, ROOM_TOP, FLOOR } from '../stages/finale/geometry';
import { ART_SCALE } from './alien';

export type AlienDeath = 'ice' | 'fire' | 'rock' | 'wave' | 'od' | 'zap' | 'melt' | 'nuke' | 'skull' | 'plain';

/** Which death, by what finished him: begging, the pistol's execution; before that, each special weapon its own. */
export const deathOf = (weapon: WeaponType, pleading: boolean, greaseFire: boolean): AlienDeath => {
  if (pleading) return weapon === 'GUN' || weapon === 'LMG' ? 'skull' : 'plain';
  switch (weapon) {
    case 'SHOTGUN': return 'ice';
    case 'FLAMETHROWER': return 'fire';
    case 'BOULDER': return 'rock';
    case 'TSUNAMI': return 'wave';
    case 'NEEDLES': return 'od';
    case 'TASER': return 'zap';
    case 'SLUDGE': return 'melt';
    case 'OIL_ROCKET': return greaseFire ? 'fire' : 'nuke';
    default: return 'plain';
  }
};

/** How far in from the walls he comes down (the wave needs a run up to its wall, so more). */
export const spotFor = (how: AlienDeath, x: number) => {
  // (the rock: near enough the podium for his head to come down on it, not so near it's in the way)
  if (how === 'rock') { const side = Math.sign(x - ROOM_MID) || 1; return ROOM_MID + side * Math.max(170, Math.min(280, Math.abs(x - ROOM_MID))); }
  const m = how === 'wave' ? 300 : how === 'nuke' ? 240 : 200;
  return Math.max(ROOM_L + m, Math.min(ROOM_R - m, x));
};

/** His figure's height on the screen (feet to the top of his head), and where his eyes are off his feet (asked for,
 * not kept: bosses/alien.ts, which has his scale, loads this). */
export const alienTall = () => 108 * ART_SCALE;
const eyeUp = () => 100 * ART_SCALE, eyeFwd = () => 6 * ART_SCALE;

const own = (c: BossCorpse) => c.own!;
export const howOf = (c: BossCorpse) => (c.own?.how ?? 'plain') as AlienDeath;

/** When his fall starts (some hang in the air first: freezing over, headless a beat, a round through the head). */
export const dropStart = (how: AlienDeath) => (how === 'ice' ? 22 : how === 'rock' ? 14 : how === 'skull' ? 26 : 0);
/** How long the fall takes (by how high he was). */
export const fallFrames = (c: BossCorpse) => Math.max(8, Math.round(Math.sqrt((2 * Math.max(0, FLOOR - own(c).from.y)) / 0.9)));
/** The frame (of his death) he lands on the floor. */
export const landAt = (c: BossCorpse) => dropStart(howOf(c)) + fallFrames(c);

/** Where his feet are while he comes down (0..1 `u` how far through the fall). */
export const dropped = (c: BossCorpse, age: number) => {
  const o = own(c), a0 = dropStart(howOf(c)), T = fallFrames(c);
  const u = Math.max(0, Math.min(1, (age - a0) / T));
  const s = u * u * (3 - 2 * u);
  return { x: o.from.x + (o.spot - o.from.x) * s, y: o.from.y + (FLOOR - o.from.y) * u * u, u };
};

/** When it lands (its banner and stinger), and when it's played out (the close-up holds a beat after, then out). */
export const timeline = (c: BossCorpse) => {
  const L = landAt(c);
  switch (howOf(c)) {
    case 'ice': return { payoff: L, end: L + 100 };
    case 'fire': return { payoff: L + 50, end: L + 190 };
    case 'rock': return { payoff: ROCK.bonk, end: Math.max(L + 70, ROCK.rest + 30) };
    case 'wave': return { payoff: L + WAVE.slam, end: L + WAVE.heap + 20 };
    case 'od': return { payoff: L + OD.pop, end: L + OD.pop + 80 };
    case 'zap': return { payoff: L + 2, end: L + 150 };
    case 'melt': return { payoff: L + 50, end: L + 180 };
    case 'nuke': return { payoff: L + NUKE.blast, end: L + NUKE.blast + 100 };
    case 'skull': return { payoff: 0, end: L + 100 };
    default: return { payoff: -1, end: L + 70 };
  }
};

// ---------------------------------------------------------------------------
// The ones that go somewhere
// ---------------------------------------------------------------------------

/** The rock: his head off at 0, onto the podium at `bonk`, down onto the floor at `floor`, rolled to a stop by `rest`. */
export const ROCK = { bonk: 34, floor: 62, rest: 92, topple: 26, toppled: 44 } as const;
/** The podium's top (where the head comes down on it). */
const PODIUM_TOP = { x: ROOM_MID, y: 402 };
/** Where his head is (its middle), and how far round it's spun. */
export const rockHead = (c: BossCorpse, age: number) => {
  const o = own(c);
  const h0 = { x: o.from.x + o.face * eyeFwd(), y: o.from.y - eyeUp() + 6 };
  // (onto the podium, back off it the way it came, then a roll across the carpet toward the rest of him)
  const away = Math.sign(PODIUM_TOP.x - h0.x) || o.face;
  const land = { x: PODIUM_TOP.x - away * 80, y: FLOOR - 14 };
  const arc = (a: { x: number; y: number }, b: { x: number; y: number }, u: number, hgt: number) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u - Math.sin(u * Math.PI) * hgt });
  if (age <= ROCK.bonk) {
    const u = age / ROCK.bonk;
    return { ...arc(h0, PODIUM_TOP, u, 120), spin: u * 9 * away };
  }
  if (age <= ROCK.floor) {
    const u = (age - ROCK.bonk) / (ROCK.floor - ROCK.bonk);
    return { ...arc(PODIUM_TOP, land, u, 70), spin: 9 * away + u * 5 * away };
  }
  const u = Math.min(1, (age - ROCK.floor) / (ROCK.rest - ROCK.floor)), r = 1 - (1 - u) * (1 - u);
  return { x: land.x - away * 50 * r, y: land.y, spin: 9 * away + 5 * away - r * 4 * away };
};

/** The wave: it rises behind him, has him, and runs him into the wall (`slam`, from his landing); flat on it till `peel`,
 * sliding down it till `heap`. */
export const WAVE = { rise: 8, grab: 20, slam: 50, peel: 74, heap: 128 } as const;
/** The wall he's going into (the way the wave was going), and the x of its face. */
export const waveWall = (c: BossCorpse) => { const dir: 1 | -1 = c.facing; return { dir, x: dir > 0 ? ROOM_R : ROOM_L }; };
/** Where he is in it (his middle), and how far round he's tumbled. */
export const waveBody = (c: BossCorpse, age: number) => {
  const L = landAt(c), { dir, x: wx } = waveWall(c), spot = own(c).spot;
  const t = age - L;
  const flatX = wx - dir * 14;
  if (t < WAVE.grab) return { x: spot, y: FLOOR - alienTall() / 2, spin: 0, flat: 0 };
  if (t < WAVE.slam) {
    const u = (t - WAVE.grab) / (WAVE.slam - WAVE.grab), e = u * u;
    return { x: spot + (flatX - spot) * e, y: FLOOR - alienTall() / 2 - Math.sin(u * Math.PI) * 90 - u * 60, spin: u * Math.PI * 3 * dir, flat: 0 };
  }
  const top = FLOOR - alienTall() / 2 - 60;
  if (t < WAVE.peel) return { x: flatX, y: top, spin: Math.PI * 3 * dir, flat: 1 };
  const u = Math.min(1, (t - WAVE.peel) / (WAVE.heap - WAVE.peel));
  return { x: flatX, y: top + (FLOOR - 40 - top) * u * u, spin: Math.PI * 3 * dir, flat: 1 - u };
};

/** The overdose: twitching on his feet, blowing up from `swell`, up off the floor at `lift`, at the ceiling at `top`,
 * squashed up against it, and POP. */
export const OD = { swell: 14, lift: 50, top: 118, pop: 138 } as const;
/** How blown up he is (1 as he was), and where his middle is. */
export const odBody = (c: BossCorpse, age: number) => {
  const L = landAt(c), t = age - L, spot = own(c).spot;
  const swell = 1 + 0.85 * Math.min(1, Math.max(0, (t - OD.swell) / 60));
  const half = (alienTall() / 2) * swell;
  const ceil = ROOM_TOP + half;
  let y = FLOOR - alienTall() / 2;
  if (t > OD.lift) { const u = Math.min(1, (t - OD.lift) / (OD.top - OD.lift)); y = y + (ceil - y) * u * u; }
  if (t >= OD.top) y = ceil + 2;
  return { x: spot + Math.sin(t * 0.07) * Math.min(1, Math.max(0, t - OD.lift) / 30) * 18, y, swell, squash: t >= OD.top ? Math.min(1, (t - OD.top) / 14) : 0 };
};

/** The blast: on the floor he's ticking, swelling, and goes at `blast` (after he lands). */
export const NUKE = { blast: 18 } as const;

/** Bits flying (the nuke, the ice): where bit `i` of `n` is, `t` frames after it went, off (x0, y0), never through
 * the floor or out of the room. Seeded, so it goes the same way every time. */
export const flyingBit = (i: number, t: number, x0: number, y0: number, power: number, seed: number) => {
  const h = (k: number) => { const s = Math.sin((i * 17.3 + k * 91.7 + seed * 13.1) * 12.9898) * 43758.5453; return s - Math.floor(s); };
  const a = -Math.PI / 2 + (h(1) - 0.5) * 2.6;
  let vx = Math.cos(a) * power * (0.5 + h(2)), vy = Math.sin(a) * power * (0.6 + h(3) * 0.8);
  let x = x0, y = y0, rot = 0;
  const spin = (h(4) - 0.5) * 0.6;
  const g = 0.55;
  let rest = false;
  for (let k = 0; k < t && !rest; k++) {
    vy += g; x += vx; y += vy; rot += spin;
    if (x < ROOM_L + 10) { x = ROOM_L + 10; vx = -vx * 0.4; }
    if (x > ROOM_R - 10) { x = ROOM_R - 10; vx = -vx * 0.4; }
    if (y < ROOM_TOP + 6) { y = ROOM_TOP + 6; vy = -vy * 0.3; }
    if (y > FLOOR - 4) { y = FLOOR - 4; if (Math.abs(vy) < 2.5) { vy = 0; vx *= 0.7; if (Math.abs(vx) < 0.3) rest = true; } else { vy = -vy * 0.35; vx *= 0.7; } }
  }
  return { x, y, rot, rest, h };
};

/**
 * Where the camera's on, `age` frames into his death, and how close (the zoom: the room's drawn at 2/3 normally):
 * the close-up follows what matters in each.
 */
export const camOn = (c: BossCorpse, age: number) => {
  const how = howOf(c), L = landAt(c), d = dropped(c, age), spot = own(c).spot;
  const mid = { x: d.x, y: d.y - alienTall() / 2 };
  switch (how) {
    case 'ice': return age < L ? { ...mid, z: 2 } : { x: spot, y: FLOOR - 60, z: 1.85 };
    case 'fire': return { x: d.x, y: d.y - (age > L + 80 ? 50 : 80), z: 1.95 };
    case 'rock': {
      const h = rockHead(c, Math.min(age, ROCK.rest));
      // (on the head, the body in it too once it's down)
      return age < ROCK.rest ? { x: h.x, y: h.y + 20, z: 1.55 } : { x: (h.x + spot) / 2, y: FLOOR - 70, z: 1.45 };
    }
    case 'wave': {
      const b = waveBody(c, Math.max(age, L));
      return age < L ? { ...mid, z: 1.8 } : { x: b.x - waveWall(c).dir * 110, y: Math.min(b.y, FLOOR - 120), z: 1.7 };
    }
    case 'od': {
      if (age < L) return { ...mid, z: 1.8 };
      const b = odBody(c, Math.min(age, L + OD.pop));
      // (after the pop, down with what's coming down)
      const after = Math.max(0, Math.min(1, (age - L - OD.pop - 20) / 50));
      return { x: b.x, y: b.y + (FLOOR - 120 - b.y) * after * after, z: 1.7 };
    }
    case 'zap': return { x: d.x, y: d.y - (age > L + 96 ? 40 : 80), z: 2.05 };
    case 'melt': return { x: d.x, y: d.y - (age > L + 90 ? 30 : 70), z: 2.1 };
    case 'nuke': return { x: d.x, y: d.y - 90, z: age > L + NUKE.blast ? 1.5 : 1.9 };
    case 'skull': return age < dropStart('skull') + 6 ? { x: c.own!.from.x + c.own!.face * eyeFwd(), y: c.own!.from.y - eyeUp(), z: 2.7 } : { x: d.x, y: d.y - 60, z: 1.9 };
    default: return { x: d.x, y: d.y - 60, z: 1.8 };
  }
};
