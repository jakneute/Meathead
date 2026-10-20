// The fairy wheel, laid out (x from the section's start, heights up from the ground line: Y(h) = GY - h).
//
//   0      THE PLAZA (cp 10): in off the loudspeaker's scene; the wheel's arch and its sign, the ticket booth, the
//          queue's rails (nobody in them: everybody's up on the wheel).
//   1650   THE GATE: walk past it and the trial's on (cp 11): it shuts behind him, the far one's shut, both of them
//          locked till every suitor's dead.
//   3000   THE FAIRY WHEEL: gigantic (its gondolas swing round 1600 px up), turning slowly the whole time. Twenty-four
//          gondolas, a suitor in every fourth (six of them), the rest empty: ride one, hop across to the next where
//          they're near (at the top and the bottom and the slants: up the sides they're too far apart to jump, so ride).
//   4350   THE FAR GATE: open once they're all dead (cp 12 past it); the way on to the enchanted glen.

import { SECTIONS, GY } from '../geometry';
import type { SuitorLook } from '../suitors';
import { WHEEL_VOICES, type RosterId, type Item } from './lines';

export const x0 = SECTIONS.wheel.x0, x1 = SECTIONS.wheel.x1;
export const X = (rx: number) => x0 + rx;
export const Y = (h: number) => GY - h;

/** The wheel: its hub (x, height), the gondolas' pivots' radius, how many, how far each hangs below its pivot (pivot
 *  to floor), how fast it turns (radians a frame: about a minute a turn, its rim at about a pixel a frame). */
export const HUB = { x: 3000, h: 790 };
export const R = 620, N = 24, HANG = 112;
export const OMEGA = 1 / R;
/** A gondola's floor: how wide (it's a ledge you stand on; the suitor sits at one end of it). */
export const FLOOR_W = 104;

/** The gates: where the trial locks him in (left), where it opens (right); where walking past starts it. */
export const GATE_L = 1650, GATE_R = 4350, TRIGGER = 1760;

/** Falls longer than this off the wheel hurt (px). */
export const FALL_HURT = 430;

export const CHECKPOINTS = [
  { name: 'THE FAIRY WHEEL', cp: 10, x: X(200), y: GY },
  { name: 'TRIAL ONE', cp: 11, x: X(1820), y: GY },
  { name: 'PAST THE WHEEL', cp: 12, x: X(4560), y: GY },
];

// ---------------------------------------------------------------------------------------------------------------
// The roster: six beefy men (all male), each with a name, a look, a voice and his favorite things to throw. Every
// fourth gondola, from the one at the bottom when the trial starts.

export interface Suitor { id: RosterId; look: SuitorLook; items: Item[]; cart: number; side: 1 | -1 }

const L = (name: string, kit: SuitorLook['kit'], skin: SuitorLook['skin'], hair: string, main: string, trim: string, voice: string, gut: number): SuitorLook => ({ name, kit, skin, hair, main, trim, voice, gut });
const PALE: SuitorLook['skin'] = ['#FFE0CC', '#F2BFA0', '#C88E70'], TAN: SuitorLook['skin'] = ['#E8A070', '#C47A48', '#8E5230'];
const BROWN: SuitorLook['skin'] = ['#9A6644', '#6E4428', '#4A2A16'], OLIVE: SuitorLook['skin'] = ['#F4C8A0', '#D8A478', '#A87650'];
const DARK: SuitorLook['skin'] = ['#6A4026', '#4A2A16', '#2E180A'];

// (six, the user's "slightly reduce the number of suitors": DUANE (a second muscle tee, Chad's) and LORENZO (a second
// prince, Tremaine's) are off the wheel: every kit on it once; a suitor in every fourth gondola. Their lines and voices
// stay in lines.ts for the clips already recorded.)
export const ROSTER: Suitor[] = [
  { id: 'chad', look: L('CHAD', 'tee', PALE, '#E8D090', '#E07A1E', '#FFFFFF', WHEEL_VOICES.chad, 0), items: ['shaker', 'horseshoe'], cart: 0, side: 1 },
  { id: 'braxton', look: { name: 'BRAXTON', skin: TAN, hair: '#2A1A0E', kit: 'cape', main: '#C81E3A', trim: '#F6D365', voice: WHEEL_VOICES.braxton, gut: 0 }, items: ['shaker', 'bouquet'], cart: 4, side: -1 },
  { id: 'derek', look: L('SIR DEREK', 'knight', DARK, '#140A06', '#2A6ADC', '#F6D365', WHEEL_VOICES.derek, 0.4), items: ['horseshoe', 'wand'], cart: 8, side: 1 },
  { id: 'gunnar', look: { name: 'GUNNAR', skin: PALE, hair: '#C2501E', kit: 'viking', main: '#7A5A3A', trim: '#B8B8C0', voice: WHEEL_VOICES.gunnar, gut: 0.8 }, items: ['horseshoe', 'chocolates'], cart: 12, side: -1 },
  { id: 'wayne', look: L('WIZARD WAYNE', 'wizard', OLIVE, '#B8B8C0', '#5A2A9A', '#FEF08A', WHEEL_VOICES.wayne, 0.4), items: ['wand', 'brick'], cart: 16, side: 1 },
  { id: 'tremaine', look: { name: 'TREMAINE', skin: BROWN, hair: '#140A06', kit: 'prince', main: '#2A6ADC', trim: '#F6D365', voice: WHEEL_VOICES.tremaine, gut: 0.1 }, items: ['bouquet', 'brick'], cart: 20, side: -1 },
];
