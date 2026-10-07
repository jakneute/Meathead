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
    <div className="w-full max-w-[520px] mt-auto mb-1 shrink-0 font-mono uppercase text-[7px] bg-black/85 border-2 border-[#7c1006] shadow-[0_0_0_2px_#000,inset_0_0_0_1px_#2c0402,5px_5px_0_2px_#000]">
      <div className="grid grid-cols-[1fr_1.2fr] gap-x-2 text-left px-2.5 py-[3px] bg-[#5c0a08] border-b-2 border-black shadow-[inset_0_1px_0_#a81c08]">
        <span className="text-[#fcd850] font-bold tracking-widest [text-shadow:1px_1px_0_#000]">CONTROLS</span>
        <span className="text-[#fcd850] font-bold tracking-wider [text-shadow:1px_1px_0_#000]">{pad ? ({ xbox: 'CONTROLLER', playstation: 'PLAYSTATION CONTROLLER', switch: 'SWITCH CONTROLLER', 'joycon-l': 'JOY-CON (SIDEWAYS)', 'joycon-r': 'JOY-CON (SIDEWAYS)' } as const)[family] : 'KEYBOARD + MOUSE'}</span>
      </div>
      <div className="grid grid-cols-[1fr_1.2fr] gap-x-2 text-left px-2.5 pt-1">
        {BASICS.map(([action, keys, padKeys]) => (
          <React.Fragment key={action}>
            <span className="text-[#f4701c] font-bold tracking-wider border-b border-[#2c0c0c] py-[1px]">{action}</span>
            <span className="text-gray-100 font-semibold border-b border-[#2c0c0c] py-[1px]">{pad ? named(padKeys) : keys}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-4 mt-1 pb-1.5 px-2.5 pt-1 text-left border-t border-[#7c1006]/70">
        {SPECIALS.map(([move, keys, padKeys]) => (
          <div key={move} className="flex justify-between gap-2 border-b border-[#2c0c0c] py-[1px]">
            <span className="text-[#fcd850] font-bold tracking-wider">{move}</span>
            <span className="text-gray-300 font-semibold">{pad ? named(padKeys) : keys}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ControlsGuide;
