import React, { useSyncExternalStore } from 'react';
import { goreBag, onGore, SPRAY, MAX_SPRAYS } from './weapons/soulSucker';

// The soul sucker's gore bag, on the HUD under its ammo: five blood drops, one per spray, each filling as the grinder
// fills the bag (full ones glowing: that's a spray ready to go, on secondary fire).

const Drop: React.FC<{ fill: number }> = ({ fill }) => {
  const full = fill >= 1;
  const id = React.useId();
  return (
    <svg viewBox="0 0 10 12" width={11} height={13} style={{ filter: full ? 'drop-shadow(0 0 3px rgba(239,68,68,0.8))' : 'none' }}>
      <defs><clipPath id={id}><rect x={0} y={12 - fill * 11} width={10} height={12} /></clipPath></defs>
      <path d="M5 0.5 C5 0.5 1 5.5 1 8 C1 10.3 2.8 11.5 5 11.5 C7.2 11.5 9 10.3 9 8 C9 5.5 5 0.5 5 0.5 Z" fill="#27272A" stroke="#0B0B0F" strokeWidth={1} />
      <path d="M5 0.5 C5 0.5 1 5.5 1 8 C1 10.3 2.8 11.5 5 11.5 C7.2 11.5 9 10.3 9 8 C9 5.5 5 0.5 5 0.5 Z" fill={full ? '#DC2626' : '#7F1D1D'} clipPath={`url(#${id})`} />
      {full && <rect x={3} y={6} width={1.5} height={2} fill="#FCA5A5" />}
    </svg>
  );
};

const GoreBag: React.FC = () => {
  const gore = useSyncExternalStore(onGore, goreBag);
  return (
    <div className="flex items-center gap-[3px]">
      <span className="text-[6px] font-black text-red-400 mr-1 whitespace-nowrap">GORE</span>
      {Array.from({ length: MAX_SPRAYS }, (_, i) => <Drop key={i} fill={Math.max(0, Math.min(1, gore / SPRAY - i))} />)}
    </div>
  );
};

export default GoreBag;
