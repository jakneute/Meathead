import React from 'react';
import type { PadKey } from '../m1/components/ButtonIcons';
import { Prompt } from '../m1/components/ButtonIcons';
import ChordPrompt from './ChordPrompt';
import { ROCKETS_ON } from './foreign/heli/copter';
import type { PauseCardId } from './store';
import type { MinigameId } from './minigamePause';

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
export const pauseCard = (id: PauseCardId | MinigameId, nin: boolean, joycon: boolean): PauseCard => {
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
    // (frontier/logride/ride.ts: the log goes at the ride's pace; right paddles it faster, left drags his hands to
    // slow it, A hops him up out of it (left / right in the hop: back or on along it), down ducks him down in it; no gun)
    case 'logride': return { title: 'THE LOG RIDE', rows: [
      one('PADDLE (FASTER)', ['DPAD_RIGHT'], ['@right']),
      one('BRAKE (HANDS IN THE WATER)', ['DPAD_LEFT'], ['@left']),
      one('HOP', ['A'], ['@jump']),
      one('DUCK', ['DPAD_DOWN'], ['@down']),
    ] };
    // (space/orbit: free flight any way, the ray gun held)
    case 'orbit': return { title: 'SPACE', rows: [
      { label: 'FLY', parts: [DIRS] },
      one('RAY GUN', ['X'], ['@fire'], true),
    ] };

    // THE MINIGAMES (minigamePause.ts: paused in one, its controls here)
    // (hollywood/coaster/plunge.ts: JUMP for all of it, a round at a time)
    case 'plunge': return { title: 'TEST YOUR PLUNGE', rows: [
      one('THE TURD LINE: RAISE THE BAR (LET GO: IT SINKS)', ['A'], ['@jump'], true),
      one('ON THE NOSE: PRESS IN THE SWEET SPOT', ['A'], ['@jump']),
      one('MASH IT: MASH PAST THE LINE', ['A'], ['@jump']),
    ] };
    // (cartoon/bigkid/bumper.ts: tank controls; B (special or charge) boosts once its meter's full)
    case 'bumper': return { title: 'BUMPER BASH', rows: [
      LR('TURN THE CAR'),
      one('GAS', ['DPAD_UP'], ['@up']),
      one('REVERSE', ['DPAD_DOWN'], ['@down']),
      one("BOOST (WHEN THE METER'S FULL)", ['B'], ['@special', '@charge']),
    ] };
    // (frontier/town/gallery.ts: the stick, the d-pad or the arrows move the cursor, the mouse puts it where it is; X,
    // RT or fire (the left mouse button) zaps, held a steady zap)
    case 'gallery': return { title: "DEAD-EYE DOOLEY'S SHOOTIN' GALLERY", rows: [
      { label: 'AIM (OR JUST MOVE THE MOUSE)', parts: [{ pad: ['LSTICK', 'DPAD'], kb: ['@up', '@down', '@left', '@right'] }] },
      { label: 'FIRE', parts: [{ pad: ['X', 'RT'], kb: ['@fire'], mouse: 'left' }] },
    ] };
    // (spooky/town/mash: X punch, Y kick, A throws (up close), B the specials (neutral, toward him, down; a full bar
    // each), up jumps, away blocks; select: A or punch picks, back backs out)
    case 'mash': return { title: 'MONSTER MASH', rows: [
      LR('WALK'),
      one('JUMP (WITH LEFT / RIGHT: THAT WAY)', ['DPAD_UP'], ['@up']),
      one('CROUCH', ['DPAD_DOWN'], ['@down']),
      one('PUNCH', ['X'], ['@@fire']),
      one('KICK', ['Y'], ['@secondary']),
      one('THROW (UP CLOSE)', ['A'], ['@jump']),
      one('SPECIAL (FULL BAR ONLY)', ['B'], ['@special']),
      { label: 'FORWARD SPECIAL (TOWARD HIM)', parts: [{ pad: ['DPAD_RIGHT', 'B'], kb: ['@right', '@special'], join: '+' }] },
      { label: 'DOWN SPECIAL', parts: [{ pad: ['DPAD_DOWN', 'B'], kb: ['@down', '@special'], join: '+' }] },
      one('BLOCK (AWAY FROM HIM; LOW: DOWN TOO)', ['DPAD_LEFT'], ['@left'], true),
    ] };
    // (adventure/dino/hack.ts + hackPuzzle.ts: left / right pick a wheel, up / down or confirm turn it, a click on a
    // wheel's top or bottom half turns it, back quits (ESC pauses now: BACKSPACE quits on the keys))
    case 'hack': return { title: 'THE PADDOCK GATE HACK', rows: [
      { label: 'PICK A WHEEL', parts: [{ pad: ['DPAD_LEFT', 'DPAD_RIGHT'], kb: ['@left', '@right'] }] },
      UD('TURN IT'),
      { label: 'TURN IT (CLICK ITS TOP OR BOTTOM)', parts: [{ pad: ['A'], kb: ['@jump', 'ENTER'], mouse: 'left' }] },
      one('QUIT', ['BACK'], ['BKSP']),
    ] };
    // (space/drag/area51.ts: left / right move the pick, A pushes a pin up, X sets it at the top, B gives up)
    case 'lockpick': return { title: 'THE LOCK', rows: [
      LR('MOVE THE PICK'),
      one('PUSH IT UP', ['A'], ['@jump']),
      one('SET IT AT THE TOP', ['X'], ['@fire']),
      one('GIVE UP', ['B'], ['@special']),
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
