import React, { useSyncExternalStore } from 'react';
import { bulkState, onBulk } from './weapons/spellbook';

// The spellbook's bulk up, on the HUD under its mana: READY (glowing) on secondary fire, the seconds left while he's
// pumped, or the seconds till it's back.

const BulkMeter: React.FC = () => {
  const s = useSyncExternalStore(onBulk, bulkState);
  const ready = s.on <= 0 && s.cool <= 0;
  return (
    <div className="flex items-center gap-1 text-[6px] font-black whitespace-nowrap">
      <span className="text-red-400">BULK UP</span>
      {ready ? <span className="text-yellow-300 animate-pulse">READY</span>
        : s.on > 0 ? <span className="text-red-300">PUMPED {s.on}s</span>
        : <span className="text-zinc-500">{s.cool}s</span>}
    </div>
  );
};

export default BulkMeter;
