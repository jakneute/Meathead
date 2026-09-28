import React from 'react';
import { WeaponType } from '../types';

// Weapon art (32x32 pixel-style SVGs with outlines and shading) and the arsenal
// cards they sit on in the pause menu.

const O = '#0B0B0F'; // outline

/** The picture of each weapon. */
export const WeaponArt: React.FC<{ type: WeaponType; size?: number }> = ({ type, size = 44 }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
    {ART[type]}
  </svg>
);

const ART: Record<WeaponType, React.ReactNode> = {
  // Dirty Dan's light machine gun: long, black, a belt of brass hanging off it
  LMG: (
    <g>
      <rect x="1" y="11" width="22" height="7" fill={O} />
      <rect x="2" y="12" width="20" height="5" fill="#27272A" />
      <rect x="22" y="12" width="9" height="4" fill={O} />
      <rect x="22" y="13" width="8" height="2" fill="#3F3F46" />
      <rect x="24" y="13" width="1" height="2" fill="#18181B" /><rect x="27" y="13" width="1" height="2" fill="#18181B" />
      <rect x="10" y="17" width="7" height="7" fill={O} />
      <rect x="11" y="18" width="5" height="5" fill="#3F3F2E" />
      <rect x="17" y="17" width="2" height="2" fill="#CA8A04" /><rect x="18" y="19" width="2" height="2" fill="#CA8A04" /><rect x="19" y="21" width="2" height="2" fill="#CA8A04" /><rect x="20" y="23" width="2" height="2" fill="#CA8A04" />
      <rect x="5" y="17" width="3" height="6" fill="#18181B" />
      <rect x="2" y="12" width="20" height="1" fill="#6B7280" />
    </g>
  ),
  // Handgun: a chunky semi-auto with a serrated slide and a rubber grip
  GUN: (
    <g>
      <rect x="5" y="9" width="23" height="8" fill={O} />
      <rect x="6" y="10" width="21" height="5" fill="#4B5563" />
      <rect x="6" y="10" width="21" height="1" fill="#9CA3AF" />
      <rect x="8" y="12" width="1" height="3" fill="#1F2937" /><rect x="10" y="12" width="1" height="3" fill="#1F2937" /><rect x="12" y="12" width="1" height="3" fill="#1F2937" />
      <rect x="25" y="8" width="2" height="2" fill={O} />
      <rect x="27" y="11" width="3" height="3" fill={O} />
      <rect x="7" y="16" width="16" height="3" fill={O} />
      <rect x="8" y="16" width="14" height="2" fill="#374151" />
      <path d="M7 18 L14 18 L13 28 L5 28 Z" fill={O} />
      <path d="M8 19 L13 19 L12 27 L6 27 Z" fill="#27272A" />
      <rect x="8" y="21" width="4" height="1" fill="#3F3F46" /><rect x="7" y="23" width="4" height="1" fill="#3F3F46" /><rect x="7" y="25" width="4" height="1" fill="#3F3F46" />
      <path d="M14 18 L18 18 L18 22 Q16 23 14 21 Z" fill={O} />
      <rect x="15" y="19" width="2" height="1" fill="#6B7280" />
    </g>
  ),
  // Big Fuckin' Boulder: a craggy rock, lit from the top left
  BOULDER: (
    <g>
      <path d="M6 10 L12 4 L21 5 L28 11 L29 20 L24 27 L12 28 L4 22 L3 14 Z" fill={O} />
      <path d="M7 11 L12 6 L20 7 L26 12 L27 20 L23 25 L12 26 L6 21 L5 14 Z" fill="#78716C" />
      <path d="M7 11 L12 6 L20 7 L17 11 L11 13 L7 15 Z" fill="#A8A29E" />
      <path d="M17 18 L23 17 L26 21 L23 25 L16 25 Z" fill="#57534E" />
      <path d="M12 14 L15 18 L13 22" stroke={O} strokeWidth="1" fill="none" />
      <path d="M20 10 L22 14" stroke={O} strokeWidth="1" fill="none" />
      <rect x="10" y="8" width="2" height="1" fill="#E7E5E4" />
    </g>
  ),
  // Shotgun Ice: a frosted-over shotgun trailing snowflakes
  SHOTGUN: (
    <g>
      <rect x="3" y="14" width="24" height="6" fill={O} />
      <rect x="4" y="15" width="22" height="3" fill="#0284C7" />
      <rect x="4" y="15" width="22" height="1" fill="#7DD3FC" />
      <rect x="11" y="17" width="8" height="4" fill={O} />
      <rect x="12" y="18" width="6" height="2" fill="#38BDF8" />
      <path d="M2 15 L6 15 L7 20 L5 24 L1 23 Z" fill={O} />
      <path d="M3 16 L5 16 L6 20 L4 22 L2 21 Z" fill="#0369A1" />
      <rect x="6" y="13" width="3" height="2" fill="#E0F2FE" />
      <rect x="15" y="13" width="4" height="2" fill="#E0F2FE" />
      <rect x="22" y="13" width="2" height="2" fill="#E0F2FE" />
      <g fill="#F0F9FF">
        <rect x="26" y="5" width="1" height="7" /><rect x="23" y="8" width="7" height="1" />
        <rect x="24" y="6" width="1" height="1" /><rect x="28" y="6" width="1" height="1" /><rect x="24" y="10" width="1" height="1" /><rect x="28" y="10" width="1" height="1" />
      </g>
      <rect x="28" y="16" width="3" height="2" fill="#BAE6FD" />
    </g>
  ),
  // Flamethrower: fuel tank, hose and a nozzle belching fire
  FLAMETHROWER: (
    <g>
      <rect x="2" y="15" width="8" height="12" rx="1" fill={O} />
      <rect x="3" y="16" width="6" height="10" fill="#B91C1C" />
      <rect x="4" y="16" width="1" height="10" fill="#F87171" />
      <rect x="3" y="19" width="6" height="1" fill="#7F1D1D" />
      <path d="M9 20 Q12 22 13 19" stroke={O} strokeWidth="2" fill="none" />
      <rect x="11" y="16" width="10" height="4" fill={O} />
      <rect x="12" y="17" width="8" height="2" fill="#52525B" />
      <rect x="12" y="17" width="8" height="1" fill="#A1A1AA" />
      <path d="M21 18 Q25 11 31 10 Q27 15 31 18 Q27 21 31 26 Q25 25 21 18 Z" fill="#EA580C" />
      <path d="M22 18 Q25 14 28 13 Q26 16 28 18 Q26 20 28 23 Q25 22 22 18 Z" fill="#FACC15" />
      <path d="M22 18 Q24 16 25 16 Q24 18 25 20 Q24 20 22 18 Z" fill="#FEF9C3" />
    </g>
  ),
  // TSUNAMI!: a towering curling wave with a crest of foam
  TSUNAMI: (
    <g>
      <path d="M2 28 L2 20 Q4 8 16 5 Q27 3 29 11 Q24 8 20 12 Q24 12 25 16 Q20 14 17 18 Q15 22 16 28 Z" fill={O} />
      <path d="M3 27 L3 20 Q5 9 16 6 Q25 4 27 9 Q23 7 19 11 Q22 12 23 14 Q19 13 16 17 Q14 21 15 27 Z" fill="#1D4ED8" />
      <path d="M4 26 L4 21 Q6 13 13 10 Q10 15 10 20 Q10 24 12 26 Z" fill="#1E3A8A" />
      <path d="M16 6 Q25 4 27 9 Q23 7 19 11 Q17 9 14 9 Z" fill="#93C5FD" />
      <g fill="#F8FAFC">
        <rect x="24" y="7" width="2" height="1" /><rect x="21" y="6" width="2" height="1" /><rect x="18" y="7" width="2" height="1" />
        <rect x="26" y="10" width="1" height="1" /><rect x="20" y="10" width="1" height="1" />
      </g>
      <rect x="1" y="28" width="30" height="2" fill="#1E40AF" />
    </g>
  ),
  // Rusty Needle Cannon: a fat syringe full of something neon
  NEEDLES: (
    <g transform="rotate(-35 16 16)">
      <rect x="6" y="12" width="16" height="8" fill={O} />
      <rect x="7" y="13" width="14" height="6" fill="#E5E7EB" opacity="0.7" />
      <rect x="11" y="14" width="10" height="4" fill="#EC4899" />
      <rect x="11" y="14" width="10" height="1" fill="#F9A8D4" />
      <rect x="9" y="13" width="1" height="2" fill="#6B7280" /><rect x="13" y="13" width="1" height="2" fill="#6B7280" /><rect x="17" y="13" width="1" height="2" fill="#6B7280" />
      <rect x="22" y="14" width="2" height="4" fill={O} />
      <rect x="24" y="15" width="7" height="2" fill="#9CA3AF" />
      <rect x="24" y="15" width="7" height="1" fill="#D1D5DB" />
      <rect x="2" y="15" width="4" height="2" fill={O} />
      <rect x="1" y="11" width="2" height="10" fill={O} />
      <rect x="1" y="12" width="1" height="8" fill="#9A3412" />
    </g>
  ),
  // Taser Overload: a stun gun with arcing prongs
  TASER: (
    <g>
      <path d="M4 13 L20 13 L20 19 L12 19 L10 27 L4 27 L6 19 L4 19 Z" fill={O} />
      <path d="M5 14 L19 14 L19 18 L11 18 L9 26 L5 26 L7 18 L5 18 Z" fill="#27272A" />
      <rect x="5" y="14" width="14" height="1" fill="#52525B" />
      <rect x="11" y="15" width="6" height="2" fill="#FACC15" />
      <rect x="20" y="14" width="3" height="1" fill="#A1A1AA" /><rect x="20" y="17" width="3" height="1" fill="#A1A1AA" />
      <path d="M23 15 L26 12 L25 16 L29 13 L27 18 L31 17 L26 21 L27 17 L23 18 Z" fill="#FDE047" />
      <path d="M24 15 L26 14 L25.5 16.5 L28 15.5 L26.5 18 Z" fill="#FFFFFF" />
    </g>
  ),
  // Sludge Barfer: a leaking barrel of glowing toxic goo
  SLUDGE: (
    <g>
      <rect x="6" y="6" width="17" height="22" rx="2" fill={O} />
      <rect x="7" y="7" width="15" height="20" fill="#3F6212" />
      <rect x="8" y="7" width="3" height="20" fill="#65A30D" />
      <rect x="7" y="11" width="15" height="2" fill="#1A2E05" />
      <rect x="7" y="21" width="15" height="2" fill="#1A2E05" />
      <circle cx="15" cy="17" r="3" fill="#FACC15" />
      <path d="M15 14.5 L16 16.5 L14 16.5 Z M13 18 L14.5 17.5 L14 19 Z M17 18 L15.5 17.5 L16 19 Z" fill={O} />
      <path d="M22 9 Q27 8 28 13 Q29 18 27 22 Q26 18 25 15 Q24 12 22 12 Z" fill="#84CC16" />
      <path d="M22 9 Q26 9 27 12 Q25 11 22 11 Z" fill="#D9F99D" />
      <rect x="26" y="23" width="2" height="3" fill="#84CC16" /><rect x="25" y="27" width="4" height="2" fill="#65A30D" />
    </g>
  ),
  // Oil Rocket Launcher: a launch tube with a greasy warhead poking out
  OIL_ROCKET: (
    <g>
      <rect x="2" y="11" width="22" height="9" fill={O} />
      <rect x="3" y="12" width="20" height="7" fill="#3F3F46" />
      <rect x="3" y="12" width="20" height="2" fill="#71717A" />
      <rect x="6" y="12" width="2" height="7" fill="#FACC15" />
      <rect x="9" y="19" width="4" height="6" fill={O} />
      <rect x="10" y="20" width="2" height="4" fill="#27272A" />
      <path d="M23 12 L27 12 L31 15.5 L27 19 L23 19 Z" fill={O} />
      <path d="M24 13 L27 13 L29.5 15.5 L27 18 L24 18 Z" fill="#111111" />
      <rect x="25" y="13" width="2" height="1" fill="#6B7280" />
      <path d="M26 19 Q27 22 26 24 Q25 22 26 19 Z" fill="#111111" />
      <path d="M21 20 Q22 24 21 26 Q20 24 21 20 Z" fill="#111111" />
      <path d="M2 13 L0 11 L0 20 L2 18 Z" fill="#DC2626" />
    </g>
  ),
};

interface WeaponIconProps {
  type: WeaponType;
  isEquipped: boolean;
  isSelected: boolean;
  /** Keyboard hotkey shown in the corner (1-9). */
  slot?: number;
  /** 0..1 of a full load, or null for unlimited. */
  ammo?: number | null;
  /** Not usable right now (a ride that only allows the one weapon): greyed out, chained up. */
  locked?: boolean;
  onClick?: () => void;
}

/** An arsenal card: the weapon's art on a steel plate, with its hotkey, ammo gauge and equipped/selected states. */
const WeaponIcon: React.FC<WeaponIconProps> = ({ type, isEquipped, isSelected, slot, ammo, locked, onClick }) => {
  const empty = ammo !== null && ammo !== undefined && ammo <= 0;
  return (
    <div
      onClick={onClick}
      title={type.replace(/_/g, ' ')}
      className={`relative w-[72px] h-[72px] flex items-center justify-center ${locked ? 'cursor-not-allowed' : 'cursor-pointer'} pointer-events-auto transition-all duration-150
        ${isSelected ? 'scale-110 z-10' : 'hover:scale-105'}`}
      style={{
        background: isEquipped
          ? 'linear-gradient(160deg, #7F1D1D 0%, #450A0A 60%, #1C0505 100%)'
          : 'linear-gradient(160deg, #3F3F46 0%, #1F1F23 60%, #0E0E10 100%)',
        border: `3px solid ${isSelected ? '#FACC15' : isEquipped ? '#EF4444' : '#52525B'}`,
        boxShadow: isSelected
          ? '0 0 14px rgba(250, 204, 21, 0.8), inset 0 1px 0 rgba(255,255,255,0.25)'
          : 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -2px 0 rgba(0,0,0,0.5), 2px 2px 0 #000',
      }}
    >
      {/* Rivets */}
      {[[3, 3], [63, 3], [3, 63], [63, 63]].map(([x, y]) => (
        <span key={`${x}-${y}`} className="absolute w-[3px] h-[3px] rounded-full" style={{ left: x, top: y, background: '#A1A1AA', boxShadow: '0 1px 0 #000' }} />
      ))}
      <div className={empty || locked ? 'opacity-35 grayscale' : ''}><WeaponArt type={type} size={46} /></div>
      {locked && (
        <>
          {/* Chained up, a padlock on it */}
          <div className="absolute inset-[6px]" style={{ background: 'repeating-linear-gradient(45deg, transparent 0 9px, rgba(161,161,170,0.55) 9px 12px), repeating-linear-gradient(-45deg, transparent 0 9px, rgba(161,161,170,0.55) 9px 12px)' }} />
          <svg className="absolute" width="26" height="30" viewBox="0 0 26 30" style={{ filter: 'drop-shadow(1px 2px 0 #000)' }}>
            <path d="M7 13 V9 a6 6 0 0 1 12 0 V13" fill="none" stroke="#D4D4D8" strokeWidth="3.5" />
            <rect x="3" y="13" width="20" height="15" rx="2" fill="#FACC15" stroke="#000" strokeWidth="1.5" />
            <rect x="11.5" y="17" width="3" height="6" fill="#000" />
          </svg>
        </>
      )}
      {slot !== undefined && (
        <span className="absolute -top-[2px] -left-[2px] px-[3px] text-[7px] leading-[11px] font-black text-black" style={{ background: isSelected ? '#FACC15' : '#D4D4D8' }}>{slot}</span>
      )}
      {isEquipped && (
        <span className="absolute -top-[2px] -right-[2px] px-[3px] text-[6px] leading-[10px] font-black text-white bg-red-600">EQ</span>
      )}
      {/* Ammo gauge */}
      <div className="absolute left-[6px] right-[6px] bottom-[4px] h-[4px] bg-black/80 border border-black">
        {ammo === null
          ? <div className="h-full w-full" style={{ background: 'repeating-linear-gradient(90deg, #22C55E 0 3px, #15803D 3px 6px)' }} />
          : <div className="h-full" style={{ width: `${Math.max(0, Math.min(1, ammo ?? 1)) * 100}%`, background: (ammo ?? 1) > 0.3 ? '#22C55E' : '#EF4444' }} />}
      </div>
    </div>
  );
};

export default WeaponIcon;
