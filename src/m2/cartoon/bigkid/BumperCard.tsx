// SPAZ & STINKY'S BUMPER BASH: the controls card before the first go of a visit (bumper.ts, off ui.bumperCard). The real
// buttons, live, pad or keys. PRESS ANY BUTTON only once its buffer's over (the explain screens' rule).

import React from 'react';
import { Prompt } from '../../../m1/components/ButtonIcons';

const BumperCard: React.FC<{ ready: boolean }> = ({ ready }) => (
  <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
    <div className="flex flex-col items-center gap-[7px] px-5 py-4 max-w-[540px] bg-gradient-to-b from-[#3B0764] to-[#1E0A3C] border-4 border-[#F472B6] text-zinc-100 font-black tracking-wider" style={{ boxShadow: '6px 6px 0 #000' }}>
      <div className="text-[14px] text-[#FDE047] [text-shadow:2px_2px_0_#BE185D]">BUMPER BASH</div>
      <div className="flex flex-col items-start gap-[6px] text-[8px] mt-[2px]">
        <span className="inline-flex items-center gap-1"><Prompt pad={['DPAD_LEFT', 'DPAD_RIGHT']} kb={['@left', '@right']} size={14} /><span className="ml-1">TURN THE CAR</span></span>
        <Prompt pad={['DPAD_UP']} kb={['@up']} label="GAS" size={14} />
        <Prompt pad={['DPAD_DOWN']} kb={['@down']} label="REVERSE" size={14} />
        <Prompt pad={['B']} kb={['@special', '@charge']} label="BOOST (WHEN THE METER'S FULL)" size={14} />
      </div>
      <div className="text-[7px] leading-[13px] text-center text-zinc-300 mt-[2px]">
        TANK CONTROLS. IT SLIDES. IT'S A BUMPER CAR.<br />
        BOOST INTO A CAR AND THE DRIVER'S DEAD. BUMPS WEAR THEM DOWN.<br />
        BIG DRIVERS TAKE MORE. KILL EVERY CAR BEFORE THE CLOCK RUNS OUT.<br />
        RUN OVER WHAT'S LEFT OF THEM FOR OVERKILL.
      </div>
      <div className="text-[7px] text-zinc-500 mt-[4px] animate-pulse" style={{ visibility: ready ? 'visible' : 'hidden' }}>PRESS ANY BUTTON</div>
    </div>
  </div>
);

export default BumperCard;
