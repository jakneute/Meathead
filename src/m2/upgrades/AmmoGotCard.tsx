// The card for a MAX AMMO find just picked up (ammoAward.ts): the bullet, MAX AMMO UP! +10%, how many he's found and
// what every weapon holds now. PRESS ANY BUTTON only once the buffer's over (no mashing it shut unread).

import React from 'react';
import { FindIcon } from './equipInfo';
import { ammoFinds, MAX_AMMO_FINDS, ammoScale } from './state';

const AmmoGotCard: React.FC<{ ready: boolean }> = ({ ready }) => {
  const n = ammoFinds();
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-[6px] px-5 py-4 max-w-[520px] bg-black/85 border-4 border-[#F59E0B] text-zinc-100 font-black tracking-wider" style={{ boxShadow: '6px 6px 0 #000' }}>
        <div className="text-[9px] text-[#FCD34D]">YOU GOT</div>
        <div className="flex items-center gap-3">
          <FindIcon id="ammo" size={48} />
          <div className="text-[16px] text-white">MAX AMMO UP! +10% ({n}/{MAX_AMMO_FINDS})</div>
        </div>
        <div className="text-[8px] leading-[14px] text-center text-[#FDE047] mt-[2px]">
          EVERY WEAPON HOLDS {Math.round(ammoScale() * 100)}% NOW.
        </div>
        <div className="text-[7px] text-zinc-500 mt-[6px] animate-pulse" style={{ visibility: ready ? 'visible' : 'hidden' }}>PRESS ANY BUTTON</div>
      </div>
    </div>
  );
};

export default AmmoGotCard;
