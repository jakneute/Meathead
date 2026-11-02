// The card for a CHARGE SHARD just won (shardAward.ts): the crystal, its name, what it does, how many he's found and
// what that's made of his power cells. PRESS ANY BUTTON only once the buffer's over (no mashing it shut unread).

import React from 'react';
import { FindIcon } from './equipInfo';
import { shards, MAX_SHARDS, powerCells } from './state';

const ShardGotCard: React.FC<{ ready: boolean }> = ({ ready }) => {
  const n = shards(), toNext = 3 - (n % 3);
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-[6px] px-5 py-4 max-w-[520px] bg-black/85 border-4 border-[#22D3EE] text-zinc-100 font-black tracking-wider" style={{ boxShadow: '6px 6px 0 #000' }}>
        <div className="text-[9px] text-[#22D3EE]">YOU GOT</div>
        <div className="flex items-center gap-3">
          <FindIcon id="shards" size={48} />
          <div className="text-[16px] text-white">A CHARGE SHARD</div>
        </div>
        <div className="text-[8px] leading-[14px] text-center text-zinc-100 mt-[2px]">EVERY 3 YOU FIND MAKE ANOTHER POWER CELL.</div>
        <div className="text-[8px] leading-[14px] text-center text-[#FDE047]">
          FOUND {n} / {MAX_SHARDS}. {n >= MAX_SHARDS ? `EVERY SHARD FOUND! ${powerCells()} POWER CELLS.` : n % 3 === 0 ? `A NEW POWER CELL! YOU HAVE ${powerCells()} NOW.` : `${toNext} MORE FOR THE NEXT POWER CELL.`}
        </div>
        <div className="text-[7px] text-zinc-500 mt-[6px] animate-pulse" style={{ visibility: ready ? 'visible' : 'hidden' }}>PRESS ANY BUTTON</div>
      </div>
    </div>
  );
};

export default ShardGotCard;
