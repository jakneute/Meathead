import React from 'react';

// Title-screen controls: keyboard + mouse and controller side by side, then the
// special moves (which work the same on both, using the SPECIAL button).

const BASICS: [action: string, keys: string, pad: string][] = [
  ['MOVE / CROUCH', 'WASD / ARROWS', 'L-STICK / D-PAD'],
  ['JUMP', 'SPACE', 'A'],
  ['FIRE', 'L-CLICK / F', 'X / RT'],
  ['SPECIAL', 'SHIFT', 'B / LT'],
  ['SWAP WEAPON', 'Q / E / WHEEL', 'LB / RB'],
  ['PAUSE', 'ESC', 'START'],
];

const SPECIALS: [move: string, how: string][] = [
  ['SHOULDER CHARGE', 'SPECIAL'],
  ['SLIDE TACKLE', 'CROUCH + SPECIAL'],
  ['UPPERCUT', 'UP + SPECIAL'],
  ['DIVE KICK', 'DOWN + SPECIAL IN AIR'],
  ['HEAVE BOULDER', 'UP + FIRE'],
];

const ControlsGuide: React.FC = () => (
  <div className="w-full max-w-md mt-2 pt-1.5 border-t border-red-950/80 shrink-0 font-mono uppercase text-[7px]">
    <div className="grid grid-cols-[1fr_1.1fr_1.1fr] gap-x-2 text-left">
      <span className="text-cyan-400 font-bold tracking-widest pb-0.5">CONTROLS</span>
      <span className="text-cyan-400 font-bold tracking-wider pb-0.5">KEYBOARD + MOUSE</span>
      <span className="text-cyan-400 font-bold tracking-wider pb-0.5">CONTROLLER</span>
      {BASICS.map(([action, keys, pad]) => (
        <React.Fragment key={action}>
          <span className="text-red-500 font-bold tracking-wider border-b border-gray-900/90 py-[1px]">{action}</span>
          <span className="text-gray-200 font-semibold border-b border-gray-900/90 py-[1px]">{keys}</span>
          <span className="text-gray-200 font-semibold border-b border-gray-900/90 py-[1px]">{pad}</span>
        </React.Fragment>
      ))}
    </div>
    <div className="grid grid-cols-2 gap-x-4 mt-1 text-left">
      {SPECIALS.map(([move, how]) => (
        <div key={move} className="flex justify-between gap-2 border-b border-gray-900/90 py-[1px]">
          <span className="text-yellow-500 font-bold tracking-wider">{move}</span>
          <span className="text-gray-300 font-semibold">{how}</span>
        </div>
      ))}
    </div>
  </div>
);

export default ControlsGuide;
