// The finale's running state (state.stage while it's on): the alien's fight, the Secret Service coming in, the room
// being wrecked weapon by weapon, and what's being said. Kept apart from the code that runs it, so the boss (in
// bosses/alien.ts) and the stage (here) can both get at it without importing each other.

import type { GameState } from '../../core/state';
import type { WeaponType } from '../../../types';

/** What the alien's doing. */
export type AlienMode =
  /** Drifting to his spot on his side of the room (along `path`). */
  | 'float'
  /** Raising his ray gun at Meathead, the beam charging (the tell). */
  | 'charge'
  /** The beam going. */
  | 'fire'
  /** The flamethrower's put his shot out: coughing, flapping the smoke off the gun. */
  | 'sputter'
  /** All Meathead's guns empty and his men gone: he's lost, and he knows it. Begging, lobbing sad little bolts. */
  | 'plead';

export interface AlienBeam {
  /** Where it comes out (the ray gun's muzzle) and which way it's going (a unit vector). */
  x: number; y: number; dx: number; dy: number;
  /** How far it reaches this frame (to a wall, the floor, the ceiling, or a flamethrower in the way). */
  len: number;
  /** A flamethrower's in its way: where the two meet. */
  blocked?: { x: number; y: number };
}

/** A line waiting to be said (one at a time: nobody talks over anybody). */
export interface QueuedLine { who: 'alien' | 'meathead' | 'radio'; text: string; shat?: string }

export interface FinaleRuntime {
  kind: 'finale';
  /** Frames since the fight started. */
  t: number;

  // --- The alien
  mode: AlienMode;
  modeT: number;
  /** Which side of the room he's working from (-1 left, 1 right), and where he's headed. */
  side: -1 | 1;
  path: { x: number; y: number }[];
  /** Shots from this side so far (he switches sides after a couple). */
  shots: number;
  /** The beam's aim while it charges (a unit vector, turning toward Meathead), and once it's going. */
  aim: { dx: number; dy: number };
  beam: AlienBeam | null;
  /** What's wrong with him, frames left: iced (slow), stunned (a boulder, the taser through his men), sludged down to
   * the floor, carried off by a wave, on fire. */
  slowT: number; stunT: number; groundT: number; pushT: number; burnT: number;
  /** Which way the wave's carrying him, and whether he's slammed into the wall yet this wave. */
  pushDir: number; slammed: boolean;
  /** Down on the floor in the sludge: how far he's fallen, and when he landed. */
  fallV: number; landedAt?: number;
  /** A hit just landed (frames of flash left), and the last heavy one (how hard he's reeling). */
  flash: number; reel: number;
  /** When each of the needles in him went in (they work their way out). */
  needleAt: number[];
  /** The flamethrower's damage, piling up between the ticks it's counted out in. */
  flameAcc: number; tasedAcc: number;
  /** How much of the President's skin is still hanging off him (1 all of it, 0 none). */
  skin: number;
  /** Bits of it he's shed, lying on the floor (where, which bit, which way up). */
  shed: { x: number; y: number; vy: number; kind: number; flip: number }[];
  /** Said already (once each): the line for each thing done to him, by what it was. */
  said: Record<string, boolean>;
  /** Meathead's nudges to use his weapons (hits since the last, when, how many said). */
  nudge?: { gun: number; melee: number; at: number; said: number };

  // --- The room
  /** When each weapon ran dry and wrecked the room its way (frames since the start). */
  wrecked: Partial<Record<WeaponType, number>>;
  /** Scorch marks on the walls where the beam's hit (x, y, when). */
  scorch: { x: number; y: number; at: number }[];
  /** The two doors (left, right): how far open (0 shut .. 1), and shut for good (the agents have pulled out). */
  doorOpen: [number, number]; doorsShut: boolean; slamAt?: number;
  /** The windows (left, right): smashed (the first jetpack man through each). */
  windowBroken: [boolean, boolean];

  // --- The Secret Service
  spawnT: number; spawnSide: -1 | 1; spawned: number;
  /** Every gun he's got is empty: they're pulling out (when), and then it's just the two of them. */
  retreatAt?: number;

  // --- The end of it
  /** The plead phase: when it started, what a pistol round does to him in it, how far through the begging it's got. */
  pleadAt?: number; pleadGun: number; pleaIdx: number; pleaWaitT: number; boltT: number;

  // --- Talking
  lines: QueuedLine[];
  /** The radio's line on the screen while it's being said (till when, if it isn't recorded). */
  radioText: string | null; radioUntil: number;
  /** Nobody starts the next line before this (a line that isn't recorded stays up its time). */
  speakUntil: number;
  radioCd: number;
  /** His health bar as shown (it trails down after a hit). */
  hpShown?: number;
  /** A big callout over the room (a weapon run dry, the room wrecked): what, and when. */
  banner?: { text: string; color: string; at: number };
}

export const getFinale = (state: GameState): FinaleRuntime | null => {
  const s = state.stage as FinaleRuntime | null;
  return s && s.kind === 'finale' ? s : null;
};

export const newFinale = (): FinaleRuntime => ({
  kind: 'finale', t: 0,
  mode: 'float', modeT: 0, side: 1, path: [], shots: 0, aim: { dx: -1, dy: 0 }, beam: null,
  slowT: 0, stunT: 0, groundT: 0, pushT: 0, burnT: 0, pushDir: 0, slammed: false, fallV: 0,
  flash: 0, reel: 0, needleAt: [], flameAcc: 0, tasedAcc: 0, skin: 1, shed: [], said: {},
  wrecked: {}, scorch: [], doorOpen: [0, 0], doorsShut: false, windowBroken: [false, false],
  spawnT: 100, spawnSide: -1, spawned: 0,
  pleadGun: 0, pleaIdx: 0, pleaWaitT: 0, boltT: 0,
  lines: [], radioText: null, radioUntil: 0, speakUntil: 0, radioCd: 0,
});

/** 0 at full health, 1 at none: he speeds up as it drops. */
export const alienPace = (boss: { health: number; maxHealth: number }) => Math.max(0, Math.min(1, 1 - boss.health / boss.maxHealth));

/** The finale as it's being drawn this frame (set by the stage as it starts drawing; the alien's sprite poses by it). */
let drawing: FinaleRuntime | null = null;
export const drawingFinale = (rt: FinaleRuntime | null) => { drawing = rt; };
export const finaleBeingDrawn = () => drawing;
