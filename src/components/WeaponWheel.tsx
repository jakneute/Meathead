import React from 'react';
import { WeaponType } from '../types';
import { WeaponArt } from './WeaponIcon';
import { getWeaponInfo } from '../content/roster';

// The weapon wheel: the right stick pushed any way brings it up over the game (it doesn't stop), the weapons he's got
// round it (the first at the top, on round clockwise), the one the stick's pointing at picked out and named in the
// middle; let the stick go and that's the one he's holding.

/** Which weapon on the wheel a stick direction points at (up is the first, clockwise from there). */
export const wheelIndexAt = (x: number, y: number, count: number) => {
  const a = (Math.atan2(x, -y) + Math.PI * 2) % (Math.PI * 2);
  return Math.round(a / ((Math.PI * 2) / count)) % count;
};

const WeaponWheel: React.FC<{ weapons: WeaponType[]; index: number; current: WeaponType }> = ({ weapons, index, current }) => {
  const R = 120, n = weapons.length;
  const picked = weapons[index];
  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
      <div className="relative" style={{ width: R * 2 + 90, height: R * 2 + 90 }}>
        <div className="absolute rounded-full bg-black/55 border-2 border-gray-700" style={{ inset: 20 }} />
        {weapons.map((w, i) => {
          const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
          const on = i === index;
          return (
            <div key={w} className={`absolute flex items-center justify-center rounded-full border-2 transition-transform duration-75 ${on ? 'bg-yellow-400/90 border-white scale-125' : w === current ? 'bg-gray-800/90 border-yellow-500' : 'bg-gray-900/90 border-gray-600'}`}
              style={{ width: 58, height: 58, left: R + 45 + Math.cos(a) * R - 29, top: R + 45 + Math.sin(a) * R - 29 }}>
              <WeaponArt type={w} size={40} />
            </div>
          );
        })}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="max-w-[170px] text-center font-mono font-bold uppercase text-[15px] leading-tight text-yellow-300 [text-shadow:0_2px_0_#000]">{picked ? getWeaponInfo(picked).name : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default WeaponWheel;
