import React from 'react';
import { WeaponType } from '../types';
import { POWER_CELLS } from '../constants';
import { getWeaponInfo } from '../stages';
import { WeaponArt } from './WeaponIcon';

interface HUDProps {
  health: number;
  maxHealth: number;
  /** Special-move power, 0..POWER_CELLS (whole cells are usable). */
  power: number;
  currentWeapon: WeaponType;
  ammo: number;
  maxAmmo: number;
}

/** The in-game HUD: health, power cells and the equipped weapon on a steel plate in the corner. */
const HUD: React.FC<HUDProps> = ({ health, maxHealth, power, currentWeapon, ammo, maxAmmo }) => {
  const hp = Math.max(0, Math.min(1, health / maxHealth));
  const low = hp < 0.35;
  const limited = maxAmmo !== Infinity;
  const ammoPct = limited ? Math.max(0, Math.min(1, ammo / maxAmmo)) : 1;

  return (
    <div className="absolute left-3 top-3 pointer-events-none select-none z-10">
      <div className="relative flex flex-col gap-[7px] pl-3 pr-3 py-2"
        style={{
          background: 'linear-gradient(180deg, rgba(39,39,42,0.88) 0%, rgba(9,9,11,0.88) 100%)',
          border: '2px solid #52525B',
          boxShadow: '0 0 0 2px #000, 3px 3px 0 2px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)',
        }}>
        {/* Hazard stripe down the left edge */}
        <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ background: 'repeating-linear-gradient(180deg, #FACC15 0 5px, #111 5px 10px)' }} />

        {/* Health */}
        <div className="flex items-center gap-2">
          <span className={`w-[26px] text-[8px] font-black ${low ? 'text-red-500 animate-pulse' : 'text-zinc-300'}`}>HP</span>
          <div className="relative w-[170px] h-[14px] bg-black border-2 border-zinc-900" style={{ boxShadow: 'inset 0 0 0 1px #3F3F46' }}>
            {/* The damage you just took, draining away behind the bar */}
            <div className="absolute inset-y-0 left-0 bg-[#FCA5A5] transition-[width] duration-500 delay-150 ease-out" style={{ width: `${hp * 100}%` }} />
            <div className={`absolute inset-y-0 left-0 ${low ? 'animate-pulse' : ''}`}
              style={{ width: `${hp * 100}%`, background: 'linear-gradient(180deg, #F87171 0%, #DC2626 45%, #991B1B 100%)' }} />
            <div className="absolute inset-x-0 top-0 h-[2px] bg-white/25" />
            {/* Segment ticks */}
            <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(90deg, transparent 0 16px, rgba(0,0,0,0.55) 16px 17px)' }} />
          </div>
          <span className="w-[26px] text-right text-[8px] font-black text-white">{Math.ceil(Math.max(0, health))}</span>
        </div>

        {/* Power: two cells, any special spends one */}
        <div className="flex items-center gap-2">
          <span className="w-[26px] text-[8px] font-black text-zinc-300">PWR</span>
          <div className="flex gap-[6px]">
            {Array.from({ length: POWER_CELLS }, (_, i) => <PowerCell key={i} fill={Math.max(0, Math.min(1, power - i))} />)}
          </div>
        </div>

        {/* Weapon */}
        <div className="flex items-center gap-2 pt-[2px]">
          <div className="w-[34px] h-[34px] flex items-center justify-center border-2 border-zinc-700"
            style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.15) 0%, rgba(0,0,0,0.6) 75%)' }}>
            <WeaponArt type={currentWeapon} size={28} />
          </div>
          <div className="flex flex-col gap-[4px]">
            <span className="text-[8px] font-black text-yellow-300 uppercase whitespace-nowrap">{getWeaponInfo(currentWeapon).name}</span>
            <div className="flex items-center gap-2">
              <div className="w-[100px] h-[6px] bg-black border border-zinc-900">
                <div className="h-full" style={{
                  width: `${ammoPct * 100}%`,
                  background: !limited ? 'repeating-linear-gradient(90deg, #22C55E 0 4px, #15803D 4px 8px)' : ammoPct > 0.3 ? 'linear-gradient(180deg, #FDE047, #CA8A04)' : 'linear-gradient(180deg, #F87171, #B91C1C)',
                }} />
              </div>
              <span className="text-[7px] font-black text-white whitespace-nowrap">{limited ? `${Math.floor(ammo)}/${maxAmmo}` : '∞'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** One power cell: a lightning bolt charging up; glowing when it's ready to spend. */
const PowerCell: React.FC<{ fill: number }> = ({ fill }) => {
  const ready = fill >= 1;
  return (
    <div className="relative w-[38px] h-[14px] bg-black border-2 overflow-hidden"
      style={{ borderColor: ready ? '#FACC15' : '#3F3F46', boxShadow: ready ? '0 0 6px rgba(250,204,21,0.7)' : 'none' }}>
      <div className="absolute inset-y-0 left-0"
        style={{ width: `${fill * 100}%`, background: ready ? 'linear-gradient(180deg, #FEF08A 0%, #FACC15 50%, #CA8A04 100%)' : 'linear-gradient(180deg, #A16207, #713F12)' }} />
      <svg viewBox="0 0 10 10" className="absolute inset-0 m-auto w-[10px] h-[10px]">
        <path d="M6 0 L2 5.5 L4.5 5.5 L3.5 10 L8 4 L5.5 4 Z" fill={ready ? '#1C1917' : '#52525B'} />
      </svg>
    </div>
  );
};

export default HUD;
