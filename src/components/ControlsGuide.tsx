import React from 'react';
import { useInputDevice, usePadFamily } from './useInputDevice';
import { padName } from './ButtonIcons';

// Title-screen controls, for whatever you're using right now (the keyboard and mouse, or the controller: it changes
// over the moment you switch), then the special moves.

const BASICS: [action: string, keys: string, pad: string][] = [
  ['MOVE / CROUCH', 'WASD / ARROWS', 'L-STICK / D-PAD'],
  ['JUMP', 'SPACE', 'A'],
  ['FIRE', 'L-CLICK', 'X / RT'],
  ['SECONDARY FIRE (IF THE WEAPON HAS ONE)', 'F', 'Y'],
  ['SPECIAL', 'R-CLICK', 'B / LT'],
  ['SWAP WEAPON', 'WHEEL / 1-9', 'LB / RB / R-STICK'],
  ['PAUSE', 'ESC', 'START'],
];

const SPECIALS: [move: string, keys: string, pad: string][] = [
  ['SHOULDER CHARGE', 'R-CLICK / SHIFT', 'B'],
  ['SLIDE TACKLE', 'CROUCH + R-CLICK / C', 'DOWN + B'],
  ['UPPERCUT', 'UP + R-CLICK / E', 'UP + B'],
  ['DIVE KICK', 'DOWN + R-CLICK IN AIR / C', 'DOWN + B IN AIR'],
];

const ControlsGuide: React.FC = () => {
  const pad = useInputDevice() === 'pad', family = usePadFamily();
  // (the controller's buttons as they're printed on this one: a PlayStation's shapes, a Switch's letters)
  const single = family === 'joycon-l' || family === 'joycon-r';
  const named = (s: string) => (single
    // (one Joy-Con: the stick and nothing else to move, no triggers, so just the one button for firing and for specials)
    ? s.replace('L-STICK / D-PAD', 'STICK').replace(' / R-STICK', '').replace(/ \/ (RT|LT)\b/g, '').replace('START', family === 'joycon-l' ? 'MINUS (−)' : 'PLUS (+)')
    : s).replace(/\b(A|B|X|Y|RT|LT|LB|RB|START)\b/g, k => padName(k, family));
  return (
    <div className="w-full max-w-md mt-2 pt-1.5 border-t border-red-950/80 shrink-0 font-mono uppercase text-[7px]">
      <div className="grid grid-cols-[1fr_1.2fr] gap-x-2 text-left">
        <span className="text-cyan-400 font-bold tracking-widest pb-0.5">CONTROLS</span>
        <span className="text-cyan-400 font-bold tracking-wider pb-0.5">{pad ? ({ xbox: 'CONTROLLER', playstation: 'PLAYSTATION CONTROLLER', switch: 'SWITCH CONTROLLER', 'joycon-l': 'JOY-CON (SIDEWAYS)', 'joycon-r': 'JOY-CON (SIDEWAYS)' } as const)[family] : 'KEYBOARD + MOUSE'}</span>
        {BASICS.map(([action, keys, padKeys]) => (
          <React.Fragment key={action}>
            <span className="text-red-500 font-bold tracking-wider border-b border-gray-900/90 py-[1px]">{action}</span>
            <span className="text-gray-200 font-semibold border-b border-gray-900/90 py-[1px]">{pad ? named(padKeys) : keys}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-4 mt-1 text-left">
        {SPECIALS.map(([move, keys, padKeys]) => (
          <div key={move} className="flex justify-between gap-2 border-b border-gray-900/90 py-[1px]">
            <span className="text-yellow-500 font-bold tracking-wider">{move}</span>
            <span className="text-gray-300 font-semibold">{pad ? named(padKeys) : keys}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ControlsGuide;
