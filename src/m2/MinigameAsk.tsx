// The box every minigame asks with first (minigameConfirm.ts): its name, a line on it, ACCEPT / BACK on the real menu
// buttons (live: pad or keys). The buttons only show once it'll take an answer (its buffer's over).

import React from 'react';
import { Prompt } from '../m1/components/ButtonIcons';

const MinigameAsk: React.FC<{ title: string; text: string; ready: boolean }> = ({ title, text, ready }) => (
  <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
    <div className="flex flex-col items-center gap-[8px] px-6 py-4 max-w-[460px] bg-black/85 border-4 border-[#FDE047] text-zinc-100 font-black tracking-wider" style={{ boxShadow: '6px 6px 0 #000' }}>
      <div className="text-[14px] text-[#FDE047] [text-shadow:2px_2px_0_#7F1D1D]">{title}</div>
      <div className="text-[8px] leading-[14px] text-center text-zinc-200">{text}</div>
      <div className="flex items-center gap-6 mt-[4px] text-[9px]" style={{ visibility: ready ? 'visible' : 'hidden' }}>
        <Prompt pad={['OK']} kb={['ENTER']} label="ACCEPT" size={16} />
        <Prompt pad={['BACK']} kb={['ESC']} label="BACK" size={16} />
      </div>
    </div>
  </div>
);

export default MinigameAsk;
