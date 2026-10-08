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

/** `nameOf`, `Art`: a game's own names and pictures for its weapons (Meathead 2's); the engine's otherwise. */
const WeaponWheel: React.FC<{ weapons: WeaponType[]; index: number; current: WeaponType; nameOf?: (w: WeaponType) => string; Art?: React.FC<{ type: WeaponType; size: number }> }> = ({ weapons, index, current, nameOf, Art = WeaponArt }) => {
  const R = 160, n = weapons.length;
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
              style={{ width: 72, height: 72, left: R + 45 + Math.cos(a) * R - 36, top: R + 45 + Math.sin(a) * R - 36 }}>
              <Art type={w} size={52} />
            </div>
          );
        })}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="max-w-[230px] text-center font-mono font-bold uppercase text-[26px] leading-tight text-yellow-300 [text-shadow:0_3px_0_#000]">{picked ? (nameOf ? nameOf(picked) : getWeaponInfo(picked).name) : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default WeaponWheel;
