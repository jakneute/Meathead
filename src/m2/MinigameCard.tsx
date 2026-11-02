// A minigame's controls card (off ui.minigameCard): its name, its buttons (the real ones, live: pad or keys), a line or
// two on how it goes. PRESS ANY BUTTON only once its buffer's over (the explain screens' rule: whoever puts it up holds
// it ~90 frames, waits for every button to be let go, then takes a fresh press). First used by Future Land's lock.

import React from 'react';
import ChordPrompt from './ChordPrompt';
import type { EquipControl } from './upgrades/equipInfo';

const MinigameCard: React.FC<{ title: string; rows: EquipControl[]; text: string; ready: boolean }> = ({ title, rows, text, ready }) => (
  <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
    <div className="flex flex-col items-center gap-[7px] px-5 py-4 max-w-[540px] bg-black/85 border-4 border-[#86EFAC] text-zinc-100 font-black tracking-wider" style={{ boxShadow: '6px 6px 0 #000' }}>
      <div className="text-[14px] text-[#FDE047] [text-shadow:2px_2px_0_#14532D]">{title}</div>
      <div className="flex flex-col items-start gap-[6px] text-[8px] mt-[2px]">
        {rows.map((r, i) => <ChordPrompt key={i} pad={r.pad} join={r.join ?? '+'} kb={r.kb} mouse={r.mouse} label={r.label} size={14} />)}
      </div>
      <div className="text-[7px] leading-[13px] text-center text-zinc-300 mt-[2px]">{text}</div>
      <div className="text-[7px] text-zinc-500 mt-[4px] animate-pulse" style={{ visibility: ready ? 'visible' : 'hidden' }}>PRESS ANY BUTTON</div>
    </div>
  </div>
);

export default MinigameCard;
