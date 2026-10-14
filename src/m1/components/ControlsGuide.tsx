import React, { useSyncExternalStore } from 'react';
import { useInputDevice, usePadFamily } from './useInputDevice';
import { padName } from './ButtonIcons';
import { keysFor, keyLabel, getKeyBindings, subscribeKeys, keysVersion, type KeyAction } from '../game/platform/keys';

// The controls (the options screen's CONTROLS page), for whatever you're using right now (the keyboard and mouse, or
// the controller: it changes over the moment you switch), then the special moves. The keyboard's and mouse's are the
// ones they're bound to now (the KEYBOARD page changes them).

type Row = [action: string, keys: () => string, pad: string];

/** An action's bound keys, as they're printed, primary then secondary ('NONE' if it's got neither). */
const k = (a: KeyAction) => keysFor(a).map(keyLabel).join(' / ') || 'NONE';
/** The four directions as one (WASD), primaries then secondaries. */
const dirs = () => {
  const b = getKeyBindings(), order: KeyAction[] = ['up', 'left', 'down', 'right'];
  return [0, 1].map(i => { const l = order.map(a => b[a][i]).filter(Boolean).map(keyLabel); return l.every(x => x.length === 1) ? l.join('') : l.join(' '); }).filter(Boolean).join(' / ') || 'NONE';
};
const special = () => keysFor('special').map(keyLabel)[0];
const withSpecial = (dir: string, extra: string, own: KeyAction) => [special() ? `${dir} + ${special()}${extra}` : '', keysFor(own).map(keyLabel).join(' / ')].filter(Boolean).join(' / ') || 'NONE';
const swap = () => ['WHEEL / 1-9', ...keysFor('prevWeapon').map(keyLabel), ...keysFor('nextWeapon').map(keyLabel)].join(' / ');

const BASICS: Row[] = [
  ['MOVE / CROUCH', dirs, 'L-STICK / D-PAD'],
  ['JUMP', () => k('jump'), 'A'],
  ['FIRE', () => k('fire'), 'X / RT'],
  ['SECONDARY FIRE (IF THE WEAPON HAS ONE)', () => k('secondary'), 'Y'],
  ['SPECIAL', () => k('special'), 'B / LT'],
  ['SWAP WEAPON', swap, 'LB / RB / R-STICK'],
  ['PAUSE', () => 'ESC', 'START'],
];

const SPECIALS: Row[] = [
  ['SHOULDER CHARGE', () => [special(), ...keysFor('charge').map(keyLabel)].filter(Boolean).join(' / ') || 'NONE', 'B'],
  ['SLIDE TACKLE', () => withSpecial('CROUCH', '', 'downSpecial'), 'DOWN + B'],
  ['UPPERCUT', () => withSpecial('UP', '', 'uppercut'), 'UP + B'],
  ['DIVE KICK', () => withSpecial('DOWN', ' IN AIR', 'downSpecial'), 'DOWN + B IN AIR'],
];

const ControlsGuide: React.FC = () => {
  const pad = useInputDevice() === 'pad', family = usePadFamily();
  useSyncExternalStore(subscribeKeys, keysVersion, keysVersion);
  // (the controller's buttons as they're printed on this one: a PlayStation's shapes, a Switch's letters)
  const single = family === 'joycon-l' || family === 'joycon-r';
  const named = (s: string) => (single
    // (one Joy-Con: the stick and nothing else to move, no triggers, so just the one button for firing and for specials)
    ? s.replace('L-STICK / D-PAD', 'STICK').replace(' / R-STICK', '').replace(/ \/ (RT|LT)\b/g, '').replace('START', family === 'joycon-l' ? 'MINUS (−)' : 'PLUS (+)')
    : s).replace(/\b(A|B|X|Y|RT|LT|LB|RB|START)\b/g, k => padName(k, family));
  return (
    <div className="w-full shrink-0 font-mono uppercase text-[8px] leading-[14px] bg-black/85 border-2 border-[#7c1006] shadow-[0_0_0_2px_#000,inset_0_0_0_1px_#2c0402,5px_5px_0_2px_#000]">
      <div className="grid grid-cols-[1fr_1.2fr] gap-x-2 text-left px-2.5 py-[3px] bg-[#5c0a08] border-b-2 border-black shadow-[inset_0_1px_0_#a81c08]">
        <span className="text-[#fcd850] font-bold tracking-widest [text-shadow:1px_1px_0_#000]">CONTROLS</span>
        <span className="text-[#fcd850] font-bold tracking-wider [text-shadow:1px_1px_0_#000]">{pad ? ({ xbox: 'CONTROLLER', playstation: 'PLAYSTATION CONTROLLER', switch: 'SWITCH CONTROLLER', 'joycon-l': 'JOY-CON (SIDEWAYS)', 'joycon-r': 'JOY-CON (SIDEWAYS)' } as const)[family] : 'KEYBOARD + MOUSE'}</span>
      </div>
      <div className="grid grid-cols-[1fr_1.2fr] gap-x-2 text-left px-2.5 pt-1">
        {BASICS.map(([action, keys, padKeys]) => (
          <React.Fragment key={action}>
            <span className="text-[#f4701c] font-bold tracking-wider border-b border-[#2c0c0c] py-[1px]">{action}</span>
            <span className="text-gray-100 font-semibold border-b border-[#2c0c0c] py-[1px]">{pad ? named(padKeys) : keys()}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-4 mt-1 pb-1.5 px-2.5 pt-1 text-left border-t border-[#7c1006]/70">
        {SPECIALS.map(([move, keys, padKeys]) => (
          <div key={move} className="flex justify-between gap-2 border-b border-[#2c0c0c] py-[1px]">
            <span className="text-[#fcd850] font-bold tracking-wider">{move}</span>
            <span className="text-gray-300 font-semibold">{pad ? named(padKeys) : keys()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ControlsGuide;
