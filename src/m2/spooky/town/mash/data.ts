// MONSTER MASH's tables: the seven fighters, each mostly data (its moves: frames, hitboxes, hit level, damage, what
// the special does), drawn by art.ts, run by sim.ts.
//
// Units: the cabinet's own screen pixels (the game runs on a 360x260 buffer, blown up 2x on the CRT). A hitbox is
// {x: how far in front of the fighter's middle it starts (negative: behind), w, y: how high off his feet its foot is,
// h}. Frames at 60 a second: start (startup), active, rec (recovery).
//
// HIT LEVELS (the owner's): MID hits at any height (blocked standing or crouching); LOW must be blocked crouching;
// HIGH (an OVERHEAD) must be blocked standing. Grabs can't be blocked at all.

export type Level = 'mid' | 'low' | 'high';
export type CharId = 'drac' | 'monster' | 'mummy' | 'jekyll' | 'invis' | 'phantom' | 'quasi';
/** sn: neutral B; sf: forward B (toward him); sd: down B (the owner's: "special moves are neutral B, forward B and down B.
 *  no Up B"); th: the throw (A, close up). */
export type MoveId = 'sp' | 'sk' | 'cp' | 'ck' | 'jp' | 'jk' | 'sn' | 'sf' | 'sd' | 'th';
export type PoseId =
  | 'idle0' | 'idle1' | 'walk0' | 'walk1' | 'crouch' | 'jump' | 'block' | 'cblock' | 'hit' | 'chit' | 'air' | 'down'
  | 'sp' | 'sk' | 'cp' | 'ck' | 'jp' | 'jk' | 'wind' | 'sn' | 'sd' | 'su' | 'win' | 'th0' | 'th1' | 'th2';
export const POSES: PoseId[] = ['idle0', 'idle1', 'walk0', 'walk1', 'crouch', 'jump', 'block', 'cblock', 'hit', 'chit', 'air', 'down', 'sp', 'sk', 'cp', 'ck', 'jp', 'jk', 'wind', 'sn', 'sd', 'su', 'win', 'th0', 'th1', 'th2'];

export interface Box { x: number; y: number; w: number; h: number }
export interface Proj { kind: string; vx: number; vy?: number; grav?: number; w: number; h: number; y: number; ground?: boolean; life?: number }

export interface Move {
  name: string;
  start: number; active: number; rec: number;
  hit?: Box; level: Level; dmg: number; stun: number; bstun: number; push: number;
  /** Knocks him down. */
  kd?: boolean;
  kind?: 'normal' | 'proj' | 'rush' | 'grab' | 'drop' | 'warp' | 'rise' | 'transform';
  proj?: Proj;
  /** rush: speed forward while it's active. */
  rush?: number;
  /** rise: the jump it takes when it goes active. */
  rise?: { vx: number; vy: number };
  /** warp: gone (and untouchable) through the startup, then over him (falling on him) or behind him. */
  warp?: 'above' | 'behind';
  /** drop: something comes down on him from the top of the screen. */
  drop?: { kind: string; w: number; h: number };
  /** grab: how near he has to be; how long the grab's business takes once it's caught; health back; the throw. */
  grab?: { range: number; anim: number; heal?: number; throwX?: number; lift?: boolean; over?: boolean };
  /** Untouchable for this many frames from the start. */
  inv?: number;
  pose: PoseId;
  sfx?: string;
}

export interface Char {
  id: CharId;
  name: string;
  /** On the select screen's box, the health bar. */
  short: string;
  /** The announcer's callout, picked. */
  call: string;
  walk: number; jumpVx: number; jumpVy: number;
  /** Half his width (the hurtbox), his height standing, crouched. */
  hw: number; tall: number; low: number;
  moves: Record<MoveId, Move>;
  /** The select screen's blurb (cheap arcade bio). */
  bio: string;
  /** The ending move's name. */
  fatal: string;
}

// The normals, the same frame data for everybody; each fighter scales reach and damage (and Hyde hits harder).
const N = {
  sp: { name: 'PUNCH', start: 4, active: 3, rec: 8, hit: { x: 6, y: 30, w: 18, h: 12 }, level: 'mid', dmg: 5, stun: 14, bstun: 9, push: 2.2, pose: 'sp', sfx: 'punch' },
  sk: { name: 'KICK', start: 7, active: 4, rec: 13, hit: { x: 6, y: 20, w: 22, h: 16 }, level: 'mid', dmg: 7, stun: 17, bstun: 11, push: 2.8, pose: 'sk', sfx: 'stomp' },
  cp: { name: 'LOW PUNCH', start: 4, active: 3, rec: 8, hit: { x: 6, y: 16, w: 18, h: 12 }, level: 'mid', dmg: 4, stun: 12, bstun: 8, push: 2, pose: 'cp', sfx: 'punch' },
  ck: { name: 'SWEEP', start: 6, active: 4, rec: 15, hit: { x: 4, y: 0, w: 24, h: 10 }, level: 'low', dmg: 6, stun: 15, bstun: 10, push: 2.4, pose: 'ck', sfx: 'stomp' },
  jp: { name: 'JUMP PUNCH', start: 4, active: 8, rec: 3, hit: { x: 2, y: 14, w: 18, h: 18 }, level: 'high', dmg: 7, stun: 16, bstun: 10, push: 2.2, pose: 'jp', sfx: 'punch' },
  jk: { name: 'JUMP KICK', start: 5, active: 10, rec: 3, hit: { x: 2, y: 0, w: 22, h: 18 }, level: 'high', dmg: 8, stun: 17, bstun: 11, push: 2.6, pose: 'jk', sfx: 'stomp' },
} satisfies Record<string, Move>;

/** THE THROW (A, the owner's: "you gotta be close to do it. switches sides"): grabbed (unblockable), heaved up over his
 *  head, slammed down on the far side of him. Same for everybody; no meter. Whiffed, it's a long reach to punish. */
const THROW: Move = { name: 'THROW', kind: 'grab', start: 4, active: 3, rec: 24, level: 'mid', dmg: 10, stun: 0, bstun: 0, push: 0, pose: 'th0', grab: { range: 8, anim: 36, over: true }, sfx: 'whoosh' };

/** Every normal's reach out from him, times: out to where the drawn fist or foot gets to (the owner's: "the collision
 *  seems a little off and short"). */
const REACH = 1.45;
/** The normals, reach and damage scaled (r: reach, d: damage, sp: frames added to startups). */
const normals = (r: number, d: number, slow = 0): Record<'sp' | 'sk' | 'cp' | 'ck' | 'jp' | 'jk' | 'th', Move> => {
  const out = {} as Record<'sp' | 'sk' | 'cp' | 'ck' | 'jp' | 'jk' | 'th', Move>;
  for (const k of ['sp', 'sk', 'cp', 'ck', 'jp', 'jk'] as const) {
    const m = N[k] as Move;
    out[k] = { ...m, start: m.start + slow, dmg: Math.round(m.dmg * d), hit: { ...m.hit!, w: Math.round(m.hit!.w * r * REACH) } };
  }
  out.th = THROW;
  return out;
};

export const CHARS: Record<CharId, Char> = {
  drac: {
    id: 'drac', name: 'COUNT DRACULA', short: 'DRACULA', call: 'COUNT DRACULA!',
    walk: 1.25, jumpVx: 1.7, jumpVy: -5.4, hw: 8, tall: 66, low: 42,
    bio: 'TRANSYLVANIAN NOBLE. HATES GARLIC, SUN, MIRROR, YOU.',
    fatal: 'THE BIG SUCK',
    moves: {
      ...normals(1.05, 1),
      sn: { name: 'BAT SWARM', kind: 'proj', start: 14, active: 2, rec: 22, level: 'mid', dmg: 11, stun: 20, bstun: 14, push: 3, pose: 'sn', sfx: 'whoosh', proj: { kind: 'bats', vx: 2.6, w: 22, h: 14, y: 36 } },
      sd: { name: 'NECK BITE', kind: 'grab', start: 6, active: 3, rec: 24, level: 'mid', dmg: 13, stun: 0, bstun: 0, push: 0, pose: 'sd', grab: { range: 22, anim: 70, heal: 6 }, sfx: 'crunch' },
      sf: { name: 'MIST DIVE', kind: 'warp', warp: 'above', start: 30, active: 40, rec: 14, inv: 30, hit: { x: -8, y: -4, w: 26, h: 28 }, level: 'high', dmg: 12, stun: 20, bstun: 14, push: 3, kd: true, pose: 'su', sfx: 'whoosh' },
    },
  },
  monster: {
    id: 'monster', name: "FRANKENSTEIN'S MONSTER", short: 'THE MONSTER', call: "FRANKENSTEIN'S MONSTER!",
    walk: 0.85, jumpVx: 1.3, jumpVy: -5.0, hw: 11, tall: 76, low: 50,
    bio: 'MADE OF SEVERAL GUYS. NONE OF THEM WAS NICE.',
    fatal: 'SOME ASSEMBLY REQUIRED',
    moves: {
      ...normals(1.15, 1.3, 2),
      sn: { name: 'NECK BOLT', kind: 'proj', start: 15, active: 2, rec: 22, level: 'mid', dmg: 11, stun: 20, bstun: 14, push: 3, pose: 'su', sfx: 'taser', proj: { kind: 'bolt', vx: 2.8, w: 20, h: 12, y: 44 } },
      sf: { name: 'LIGHTNING CHARGE', kind: 'rush', rush: 3.6, start: 16, active: 24, rec: 20, hit: { x: 0, y: 14, w: 24, h: 50 }, level: 'mid', dmg: 13, stun: 22, bstun: 16, push: 4, kd: true, pose: 'sn', sfx: 'taser' },
      sd: { name: 'GROUND POUND', start: 18, active: 6, rec: 22, hit: { x: -30, y: 0, w: 110, h: 12 }, level: 'low', dmg: 12, stun: 22, bstun: 16, push: 3.5, kd: true, pose: 'sd', sfx: 'slam' },
    },
  },
  mummy: {
    id: 'mummy', name: 'THE MUMMY', short: 'THE MUMMY', call: 'THE MUMMY!',
    walk: 0.95, jumpVx: 1.5, jumpVy: -5.2, hw: 9, tall: 66, low: 42,
    bio: 'DEAD 3000 YEARS. STILL FASTER THAN YOUR DAD.',
    fatal: 'THE SQUEEZE',
    moves: {
      ...normals(1.1, 1),
      sn: { name: 'BANDAGE WHIP', start: 12, active: 4, rec: 24, hit: { x: 10, y: 34, w: 96, h: 10 }, level: 'mid', dmg: 9, stun: 20, bstun: 12, push: -2.5, pose: 'sn', sfx: 'whoosh' },
      sd: { name: 'SARCOPHAGUS DROP', kind: 'drop', start: 16, active: 2, rec: 26, level: 'high', dmg: 14, stun: 24, bstun: 16, push: 2, kd: true, pose: 'sd', drop: { kind: 'sarc', w: 26, h: 44 }, sfx: 'thud' },
      sf: { name: 'SCARAB CURSE', kind: 'proj', start: 14, active: 2, rec: 24, level: 'low', dmg: 10, stun: 20, bstun: 14, push: 3, pose: 'su', proj: { kind: 'scarab', vx: 1.8, w: 22, h: 8, y: 0, ground: true }, sfx: 'scratch' },
    },
  },
  jekyll: {
    id: 'jekyll', name: 'DR. JEKYLL & MR. HYDE', short: 'JEKYLL/HYDE', call: 'DOCTOR JEKYLL AND MISTER HYDE!',
    walk: 1.2, jumpVx: 1.6, jumpVy: -5.3, hw: 8, tall: 66, low: 42,
    bio: 'RESPECTED DOCTOR. ONE DRINK AND HE IS A WHOLE OTHER GUY.',
    fatal: 'BEDSIDE MANNER',
    moves: {
      ...normals(1, 0.9),
      sn: { name: 'POTION TOSS', kind: 'proj', start: 12, active: 2, rec: 22, level: 'mid', dmg: 10, stun: 20, bstun: 14, push: 3, pose: 'sn', proj: { kind: 'potion', vx: 2.4, vy: -3.6, grav: 0.16, w: 10, h: 10, y: 46 }, sfx: 'whoosh' },
      sd: { name: 'DRINK IT', kind: 'transform', start: 36, active: 1, rec: 14, level: 'mid', dmg: 0, stun: 0, bstun: 0, push: 0, pose: 'sd', sfx: 'glug' },
      sf: { name: 'HYDE UPPERCUT', kind: 'rise', rise: { vx: 2.2, vy: -5.4 }, start: 4, active: 14, rec: 16, inv: 8, hit: { x: 0, y: 30, w: 18, h: 40 }, level: 'mid', dmg: 12, stun: 20, bstun: 14, push: 2, kd: true, pose: 'su', sfx: 'punch' },
    },
  },
  invis: {
    id: 'invis', name: 'THE INVISIBLE MAN', short: 'INVISIBLE MAN', call: 'THE INVISIBLE MAN!',
    walk: 1.3, jumpVx: 1.7, jumpVy: -5.4, hw: 8, tall: 66, low: 42,
    bio: 'COMPLETELY INVISIBLE. WE SAVED A LOT OF MONEY ON HIM.',
    fatal: 'NOTHING (PROBABLY)',
    moves: {
      ...normals(1, 1),
      sn: { name: 'FLOATING BRICK', kind: 'proj', start: 12, active: 2, rec: 22, level: 'mid', dmg: 10, stun: 20, bstun: 14, push: 3, pose: 'sn', proj: { kind: 'brick', vx: 3.0, w: 12, h: 8, y: 40 }, sfx: 'whoosh' },
      sf: { name: 'INVISIBLE DASH', kind: 'rush', rush: 4.4, start: 8, active: 16, rec: 18, hit: { x: 0, y: 0, w: 20, h: 14 }, level: 'low', dmg: 10, stun: 20, bstun: 14, push: 3, kd: true, pose: 'sd', sfx: 'whoosh' },
      sd: { name: '???', kind: 'rise', rise: { vx: 1.6, vy: -5.8 }, start: 4, active: 14, rec: 16, inv: 8, hit: { x: 0, y: 26, w: 20, h: 40 }, level: 'mid', dmg: 11, stun: 20, bstun: 14, push: 2, kd: true, pose: 'su', sfx: 'stomp' },
    },
  },
  phantom: {
    id: 'phantom', name: 'THE PHANTOM OF THE OPERA', short: 'THE PHANTOM', call: 'THE PHANTOM OF THE OPERA!',
    walk: 1.15, jumpVx: 1.6, jumpVy: -5.3, hw: 8, tall: 68, low: 42,
    bio: 'LIVES UNDER THE OPERA. WRITES MUSIC. NEVER FINISHES IT.',
    fatal: 'THE UNMASKING',
    moves: {
      ...normals(1.05, 1),
      sn: { name: 'ORGAN BLAST', kind: 'proj', start: 16, active: 2, rec: 22, level: 'mid', dmg: 11, stun: 20, bstun: 14, push: 3.2, pose: 'sn', proj: { kind: 'notes', vx: 2.0, w: 20, h: 20, y: 32 }, sfx: 'alienBeam' },
      sd: { name: 'CHANDELIER DROP', kind: 'drop', start: 18, active: 2, rec: 26, level: 'high', dmg: 14, stun: 24, bstun: 16, push: 2, kd: true, pose: 'sd', drop: { kind: 'chand', w: 36, h: 26 }, sfx: 'glass' },
      sf: { name: 'CAPE VANISH', kind: 'warp', warp: 'behind', start: 26, active: 6, rec: 18, inv: 26, hit: { x: 2, y: 22, w: 26, h: 26 }, level: 'mid', dmg: 11, stun: 20, bstun: 14, push: 3, kd: true, pose: 'su', sfx: 'whoosh' },
    },
  },
  quasi: {
    id: 'quasi', name: 'QUASIMODO', short: 'QUASIMODO', call: 'QUASIMODO!',
    walk: 1.0, jumpVx: 1.5, jumpVy: -5.1, hw: 9, tall: 56, low: 38,
    bio: 'BELL RINGER. DEAF. THINKS YOU SAID SOMETHING NICE.',
    fatal: 'FOR WHOM THE BELL TOLLS',
    moves: {
      ...normals(1.1, 1.1, 1),
      sn: { name: 'BELL CLANG', start: 16, active: 6, rec: 22, hit: { x: -40, y: 0, w: 84, h: 60 }, level: 'mid', dmg: 11, stun: 22, bstun: 14, push: 4, kd: true, pose: 'sn', sfx: 'clang' },
      sd: { name: 'GARGOYLE ROLL', kind: 'proj', start: 14, active: 2, rec: 24, level: 'low', dmg: 11, stun: 20, bstun: 14, push: 3, kd: true, pose: 'sd', proj: { kind: 'gargoyle', vx: 2.2, w: 16, h: 14, y: 0, ground: true }, sfx: 'thud' },
      sf: { name: 'ROPE SWING', kind: 'rise', rise: { vx: 3.2, vy: -5.4 }, start: 8, active: 34, rec: 12, hit: { x: -4, y: -6, w: 24, h: 34 }, level: 'high', dmg: 12, stun: 20, bstun: 14, push: 3, kd: true, pose: 'su', sfx: 'whoosh' },
    },
  },
};

/** The select screen's order (a row of four over a row of three). */
export const ROSTER: CharId[] = ['drac', 'monster', 'mummy', 'jekyll', 'invis', 'phantom', 'quasi'];

/** Hyde: the same moves, harder and slower (and his normals hit like a truck). */
export const hydeMove = (m: Move): Move => ({ ...m, dmg: Math.round(m.dmg * 1.45), start: m.start + (m.kind === 'transform' ? 0 : 1), push: m.push * 1.2 });

/** Specials' names in the order B, FORWARD+B, DOWN+B. */
export const specialNames = (id: CharId) => [CHARS[id].moves.sn.name, CHARS[id].moves.sf.name, CHARS[id].moves.sd.name];
