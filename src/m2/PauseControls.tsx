import React from 'react';
import type { PadKey } from '../m1/components/ButtonIcons';
import { Prompt } from '../m1/components/ButtonIcons';
import ChordPrompt from './ChordPrompt';
import { ROCKETS_ON } from './foreign/heli/copter';
import type { PauseCardId } from './store';

// The pause menu's CONTROLS CARD (the user's): a stretch with its own controls and no weapon switching (the dirt bike,
// the helicopter, the mine cart, the dragons, the broomstick, the star sled, the orbit) says which it is
// (store.ts ui.pauseControls), and the pause menu shows its controls in place of the weapons: a row a move, the
// buttons and its name, nothing more (the options page's way: ControlsGuide.tsx). The buttons are the real ones, for
// the pad or the keys, whichever's being played on. Every binding here is the one the stretch's own code reads.

/** One bit of a row: the pad's buttons and the keys ('@jump': whatever jump's bound to), `/` any one of them, `+` at once. */
export interface CardPart { pad: PadKey[]; kb: string[]; mouse?: 'left' | 'right'; join?: '+' | '/' }
/** A row: its buttons (more than one part: pressed together, a direction AND a button), HOLD them, its name. */
export interface CardRow { label: string; parts: CardPart[]; hold?: boolean }
export interface PauseCard { title: string; rows: CardRow[] }

const one = (label: string, pad: PadKey[], kb: string[], hold = false, join: '+' | '/' = '/'): CardRow => ({ label, parts: [{ pad, kb, join }], hold });
const DIRS: CardPart = { pad: ['DPAD'], kb: ['@up', '@down', '@left', '@right'] };
const LR = (label: string) => one(label, ['DPAD_LEFT', 'DPAD_RIGHT'], ['@left', '@right']);
const UD = (label: string) => one(label, ['DPAD_UP', 'DPAD_DOWN'], ['@up', '@down']);

/** Each stretch's card. `nin`: on a Nintendo pad (the broom's boost and brake swap there); `joycon`: one Joy-Con on
 *  its own (no triggers: the broom's LT and RT left off). */
export const pauseCard = (id: PauseCardId, nin: boolean, joycon: boolean): PauseCard => {
  switch (id) {
    // (frontier/dirtbike/chase.ts: X hits left, B hits right, A jumps, left / right steer, up boosts, down brakes)
    case 'bike': return { title: 'THE DIRT BIKE', rows: [
      LR('STEER'),
      one('BOOST', ['DPAD_UP'], ['@up']),
      one('BRAKE', ['DPAD_DOWN'], ['@down']),
      one('JUMP', ['A'], ['@jump']),
      one('HIT LEFT', ['X'], ['@fire']),
      one('HIT RIGHT', ['B'], ['@charge', '@special']),
    ] };
    // (foreign/heli/copter.ts: any way flies; X held the machine gun; Y a rocket; B boosts the way that's held)
    case 'heli': return { title: 'THE HELICOPTER', rows: [
      { label: 'FLY', parts: [DIRS] },
      one('MACHINE GUN', ['X'], ['@fire'], true),
      ...(ROCKETS_ON ? [one('ROCKETS', ['Y'], ['@secondary'])] : []),
      { label: 'BOOST', parts: [DIRS, { pad: ['B'], kb: ['@special'] }] },
    ] };
    // (adventure/cart: the ride goes at its own pace; A jumps the cart, down ducks; no firing (cart/index.ts: sat back, no gun out))
    case 'cart': return { title: 'THE MINE CART', rows: [
      one('JUMP', ['A'], ['@jump']),
      one('DUCK', ['DPAD_DOWN'], ['@down']),
    ] };
    // (fantasy/tragons/ride.ts and App.tsx: LB / RB hop cars (the weapon buttons), down held in a loop hangs on)
    case 'tragons': return { title: 'TRUELLING TRAGONS', rows: [
      one('HOP UP A CAR (TOP: TO THE BOTTOM)', ['RB'], ['@prevWeapon']),
      one('HOP DOWN A CAR (BOTTOM: TO THE TOP)', ['LB'], ['@nextWeapon']),
      LR('WALK'),
      one('JUMP', ['A'], ['@jump']),
      one('DUCK', ['DPAD_DOWN'], ['@down']),
      one('HANG ON IN A LOOP', ['DPAD_DOWN'], ['@down'], true),
    ] };
    // (fantasy/broom/fight.ts: up / down pitch, left / right turn, A boosts, B brakes (swapped on a Nintendo pad), RB
    // and RT boost too, LB and LT brake, X the laser (held: the lock-on), Y inverts the pitch)
    case 'broom': {
      const trig = (k: 'LT' | 'RT'): PadKey[] => (joycon ? [] : [k]);
      return { title: 'THE BROOMSTICK', rows: [
        UD('PITCH UP / DOWN'),
        LR('TURN'),
        one('BOOST', [nin ? 'B' : 'A', 'RB', ...trig('RT')], ['@jump']),
        one('BRAKE', [nin ? 'A' : 'B', 'LB', ...trig('LT')], ['@charge', '@special']),
        one('LASER', ['X'], ['@fire']),
        one('LOCK ON, LET GO: HOMING SHOT', ['X'], ['@fire'], true),
        one('INVERT PITCH', ['Y'], ['@secondary']),
      ] };
    }
    // (space/ride: the sled sets the pace; A jumps it, down ducks, X the sled's space blaster)
    case 'sled': return { title: 'THE STAR SLED', rows: [
      one('JUMP', ['A'], ['@jump']),
      one('DUCK', ['DPAD_DOWN'], ['@down']),
      one('SPACE BLASTER', ['X'], ['@fire']),
    ] };
    // (space/orbit: free flight any way, the ray gun held)
    case 'orbit': return { title: 'SPACE', rows: [
      { label: 'FLY', parts: [DIRS] },
      one('RAY GUN', ['X'], ['@fire'], true),
    ] };
  }
};

/** A row: HOLD if it's held, its buttons, its name (as the weapon card's control rows look). */
export const CardRowView: React.FC<{ row: CardRow; size?: number }> = ({ row, size = 12 }) => (
  <span className="inline-flex items-center gap-[3px] align-middle">
    {row.hold && <span className="mr-[2px]">HOLD</span>}
    {row.parts.map((p, i) => (
      <React.Fragment key={i}>
        {i > 0 && <span className="text-yellow-300 text-[10px] px-[1px]">+</span>}
        {p.pad.length > 1 || p.kb.length > 1
          ? <ChordPrompt pad={p.pad} join={p.join ?? '/'} kb={p.kb} mouse={p.mouse} label="" size={size} />
          : <Prompt pad={p.pad} kb={p.kb} mouse={p.mouse} size={size} />}
      </React.Fragment>
    ))}
    <span className="ml-1">{row.label}</span>
  </span>
);
