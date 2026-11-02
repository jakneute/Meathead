// The card for a MAX HEALTH find just picked up (healthAward.ts): the heart, MAX HEALTH UP! +10, how many he's found
// and what his max is now. PRESS ANY BUTTON only once the buffer's over (no mashing it shut unread).

import React from 'react';
import { FindIcon } from './equipInfo';
import { healthFinds, MAX_HEALTH_FINDS, maxHealth } from './state';

const HealthGotCard: React.FC<{ ready: boolean }> = ({ ready }) => {
  const n = healthFinds();
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-[6px] px-5 py-4 max-w-[520px] bg-black/85 border-4 border-[#DC2626] text-zinc-100 font-black tracking-wider" style={{ boxShadow: '6px 6px 0 #000' }}>
        <div className="text-[9px] text-[#F87171]">YOU GOT</div>
        <div className="flex items-center gap-3">
          <FindIcon id="health" size={48} />
          <div className="text-[16px] text-white">MAX HEALTH UP! +10</div>
        </div>
        <div className="text-[8px] leading-[14px] text-center text-[#FDE047] mt-[2px]">
          FOUND {n} / {MAX_HEALTH_FINDS}. MAX HEALTH IS {maxHealth()} NOW.
        </div>
        <div className="text-[7px] text-zinc-500 mt-[6px] animate-pulse" style={{ visibility: ready ? 'visible' : 'hidden' }}>PRESS ANY BUTTON</div>
      </div>
    </div>
  );
};

export default HealthGotCard;
