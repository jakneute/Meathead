import React from 'react';

const ControlsGuide: React.FC = () => (
  <div className="w-full max-w-md mt-2 pt-2 border-t border-red-950/80 shrink-0">
    <div className="text-[7.5px] font-mono text-cyan-400 font-bold uppercase tracking-widest mb-1.5 opacity-90">
      TACTICAL COMBAT CONTROLS
    </div>
    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[7.5px] uppercase font-mono w-full">
      <div className="flex items-center justify-between border-b border-gray-900/90 pb-0.5">
        <span className="text-red-500 font-bold tracking-wider">MOVE:</span>
        <span className="text-gray-300 font-semibold">WASD / ARROWS / D-PAD</span>
      </div>
      <div className="flex items-center justify-between border-b border-gray-900/90 pb-0.5">
        <span className="text-red-500 font-bold tracking-wider">JUMP:</span>
        <span className="text-gray-300 font-semibold">SPACE / A (PAD)</span>
      </div>
      <div className="flex items-center justify-between border-b border-gray-900/90 pb-0.5">
        <span className="text-red-500 font-bold tracking-wider">FIRE:</span>
        <span className="text-gray-300 font-semibold">L-CLICK / X, RT</span>
      </div>
      <div className="flex items-center justify-between border-b border-gray-900/90 pb-0.5">
        <span className="text-red-500 font-bold tracking-wider">SHLDR CHRG:</span>
        <span className="text-gray-300 font-semibold">SHIFT / B, LT</span>
      </div>
      <div className="flex items-center justify-between border-b border-gray-900/90 pb-0.5">
        <span className="text-red-500 font-bold tracking-wider">UPPERCUT:</span>
        <span className="text-gray-300 font-semibold">UP+SHIFT / UP+B</span>
      </div>
      <div className="flex items-center justify-between border-b border-gray-900/90 pb-0.5">
        <span className="text-red-500 font-bold tracking-wider">DIVEKICK:</span>
        <span className="text-gray-300 font-semibold">DOWN+SHIFT (AIR)</span>
      </div>
      <div className="flex items-center justify-between border-b border-gray-900/90 pb-0.5">
        <span className="text-red-500 font-bold tracking-wider">CYCLE WPN:</span>
        <span className="text-gray-300 font-semibold">Q, E / WHEEL / BUMPERS</span>
      </div>
      <div className="flex items-center justify-center gap-2 border-b border-gray-900/90 pb-0.5 col-span-2 text-center pt-0.5">
        <span className="text-red-500 font-bold tracking-wider">PAUSE / ARSENAL:</span>
        <span className="text-gray-300 font-semibold">ESC / START (PAD)</span>
      </div>
    </div>
  </div>
);

export default ControlsGuide;
