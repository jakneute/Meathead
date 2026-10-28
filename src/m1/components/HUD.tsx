import React from 'react';
import { WeaponType } from '../types';
import { POWER_CELLS } from '../constants';
import { getWeaponInfo } from '../content/roster';
import { WeaponArt } from './WeaponIcon';

interface HUDProps {
  health: number;
  maxHealth: number;
  /** Special-move power, 0..POWER_CELLS (whole cells are usable). */
  power: number;
  currentWeapon: WeaponType;
  ammo: number;
  /** What the weapon's called here, if not its usual name (Meathead 2's pistol is a ray gun). */
  weaponName?: string;
  /** A picture in place of the weapon's own (Meathead 2's ray gun). */
  weaponArt?: React.ReactNode;
  /** Something of the weapon's own, under its ammo (Meathead 2's soul sucker: its gore bag). */
  weaponExtra?: React.ReactNode;
  /** What its ammo's called, if not ammo (Meathead 2's spellbook: MANA), shown by the bar. */
  ammoLabel?: string;
  maxAmmo: number;
  /** A different look for the plate (Meathead 2's, themed to wherever he is): anything left out keeps the steel one. */
  skin?: HudSkin;
  /** How many power cells the PWR row shows (default POWER_CELLS; Meathead 2's helicopter: its one boost charge). */
  powerCells?: number;
  /** How wide each power cell is (px; Meathead 2's: wide, three of them, fully upgraded, two-thirds of the plate). */
  cellWidth?: number;
  /** Something on the PWR row to the right of the cells (Meathead 2's helicopter: its rockets). */
  powerExtra?: React.ReactNode;
  /** Meathead 2's weapon tried empty: bumped each time (the weapon's box flashes red and shakes, `alertText` by it). */
  alert?: number;
  /** Bumped when a power move's asked for without the power for it: the power cells blink red. */
  powerAlert?: number;
  alertText?: string;
}

/** How the HUD plate looks: the plate, what's drawn on it, its words, its bars, its power cells, the weapon's box. */
export interface HudSkin {
  panel?: React.CSSProperties;
  /** Drawn over the plate (corner pieces, stickers, a stripe down the edge in place of the hazard stripe). */
  deco?: React.ReactNode;
  /** The words on it: the labels (HP, PWR), the numbers, the weapon's name. */
  label?: string; value?: string; name?: string;
  /** The bars' wells, and what fills the health bar. */
  track?: React.CSSProperties; hp?: string;
  /** A power cell: charged (its border, its fill, its glow) and charging. */
  cellOn?: { border: string; fill: string; glow: string }; cellOff?: { border: string; fill: string };
  /** The weapon's box. */
  slot?: React.CSSProperties;
  /** What the bars are called here (HP, PWR). */
  hpLabel?: string; pwrLabel?: string;
}

/** The in-game HUD: health, power cells and the equipped weapon on a steel plate in the corner. */
const HUD: React.FC<HUDProps> = ({ health, maxHealth, power, currentWeapon, ammo, maxAmmo, weaponName, weaponArt, weaponExtra, ammoLabel, skin, powerCells = POWER_CELLS, powerExtra, cellWidth, alert, alertText, powerAlert }) => {
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
          ...skin?.panel,
        }}>
        {/* Hazard stripe down the left edge (or the skin's own) */}
        {skin?.deco ?? <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ background: 'repeating-linear-gradient(180deg, #FACC15 0 5px, #111 5px 10px)' }} />}

        {/* Health */}
        <div className="flex items-center gap-2">
          <span className={`relative w-[26px] text-[8px] font-black ${low ? 'text-red-500 animate-pulse' : 'text-zinc-300'}`} style={low ? undefined : { color: skin?.label }}>{skin?.hpLabel ?? 'HP'}</span>
          <div className="relative w-[170px] h-[14px] bg-black border-2 border-zinc-900" style={{ boxShadow: 'inset 0 0 0 1px #3F3F46', ...skin?.track }}>
            {/* The damage you just took, draining away behind the bar */}
            <div className="absolute inset-y-0 left-0 bg-[#FCA5A5] transition-[width] duration-500 delay-150 ease-out" style={{ width: `${hp * 100}%` }} />
            <div className={`absolute inset-y-0 left-0 ${low ? 'animate-pulse' : ''}`}
              style={{ width: `${hp * 100}%`, background: skin?.hp ?? 'linear-gradient(180deg, #F87171 0%, #DC2626 45%, #991B1B 100%)' }} />
            <div className="absolute inset-x-0 top-0 h-[2px] bg-white/25" />
            {/* Segment ticks */}
            <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(90deg, transparent 0 16px, rgba(0,0,0,0.55) 16px 17px)' }} />
          </div>
          <span className="relative w-[26px] text-right text-[8px] font-black text-white" style={{ color: skin?.value }}>{Math.ceil(Math.max(0, health))}</span>
        </div>

        {/* Power: two cells, any special spends one */}
        <div className="flex items-center gap-2">
          <span className="relative w-[26px] text-[8px] font-black text-zinc-300" style={{ color: skin?.label }}>{skin?.pwrLabel ?? 'PWR'}</span>
          <div className="relative flex gap-[6px]">
            {Array.from({ length: powerCells }, (_, i) => <PowerCell key={i} fill={Math.max(0, Math.min(1, power - i))} skin={skin} width={cellWidth} />)}
            {/* (not enough power for what was asked: a red blink over the cells) */}
            {powerAlert ? <div key={powerAlert} className="absolute -inset-[2px] pointer-events-none" style={{ background: '#DC2626', border: '2px solid #FCA5A5', opacity: 0, animation: 'mh-hud-pwr 0.6s steps(1, end) forwards' }} /> : null}
            {powerAlert ? <style>{`@keyframes mh-hud-pwr { 0% { opacity: 0.8; } 20% { opacity: 0; } 40% { opacity: 0.8; } 60% { opacity: 0; } 80% { opacity: 0.6; } 100% { opacity: 0; } }`}</style> : null}
          </div>
          {powerExtra}
        </div>

        {/* Weapon */}
        <div className="flex items-center gap-2 pt-[2px]">
          <div key={alert || 0} className="relative w-[34px] h-[34px] flex items-center justify-center border-2 border-zinc-700"
            style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.15) 0%, rgba(0,0,0,0.6) 75%)', ...skin?.slot, ...(alert ? { animation: 'mh-hud-dry 0.6s steps(12, end)' } : undefined) }}>
            {weaponArt ? <svg viewBox="0 0 32 32" width={28} height={28} shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>{weaponArt}</svg> : <WeaponArt type={currentWeapon} size={28} />}
            {/* (tried empty: its word stamped over the box, fading) */}
            {alert ? <span className="absolute left-1/2 top-1/2 text-[6px] font-black text-white whitespace-nowrap px-[2px]" style={{ background: '#B91C1C', border: '1px solid #000', animation: 'mh-hud-dry-word 1.1s ease-in forwards' }}>{alertText ?? 'EMPTY!'}</span> : null}
            {alert ? <style>{`
              @keyframes mh-hud-dry { 0%, 100% { transform: translateX(0); } 10% { transform: translateX(-3px); border-color: #EF4444; background: rgba(220,38,38,0.6); } 25% { transform: translateX(3px); } 40% { transform: translateX(-2px); border-color: #EF4444; background: rgba(220,38,38,0.45); } 55% { transform: translateX(2px); } 70% { transform: translateX(-1px); border-color: #EF4444; } }
              @keyframes mh-hud-dry-word { 0% { transform: translate(-50%, -50%) rotate(-8deg) scale(1.8); opacity: 0; } 12% { transform: translate(-50%, -50%) rotate(-8deg) scale(1); opacity: 1; } 75% { opacity: 1; } 100% { transform: translate(-50%, -50%) rotate(-8deg) scale(1); opacity: 0; } }
            `}</style> : null}
          </div>
          <div className="relative flex flex-col gap-[4px]">
            <span className="text-[8px] font-black text-yellow-300 uppercase whitespace-nowrap" style={{ color: skin?.name }}>{weaponName ?? getWeaponInfo(currentWeapon).name}</span>
            <div className="flex items-center gap-2">
              {ammoLabel && <span className="text-[6px] font-black text-violet-300 -mr-1">{ammoLabel}</span>}
              <div className="w-[100px] h-[6px] bg-black border border-zinc-900" style={skin?.track}>
                <div className="h-full" style={{
                  width: `${ammoPct * 100}%`,
                  background: !limited ? 'repeating-linear-gradient(90deg, #22C55E 0 4px, #15803D 4px 8px)' : ammoPct > 0.3 ? 'linear-gradient(180deg, #FDE047, #CA8A04)' : 'linear-gradient(180deg, #F87171, #B91C1C)',
                }} />
              </div>
              <span className="text-[7px] font-black text-white whitespace-nowrap" style={{ color: skin?.value }}>{limited ? `${Math.floor(ammo)}/${maxAmmo}` : '∞'}</span>
            </div>
            {weaponExtra}
          </div>
        </div>
      </div>
    </div>
  );
};

/** One power cell: a lightning bolt charging up; glowing when it's ready to spend. */
const PowerCell: React.FC<{ fill: number; skin?: HudSkin; width?: number }> = ({ fill, skin, width = 38 }) => {
  const ready = fill >= 1;
  const on = skin?.cellOn, off = skin?.cellOff;
  return (
    <div className="relative h-[14px] bg-black border-2 overflow-hidden"
      style={{ width, ...skin?.track, borderColor: ready ? on?.border ?? '#FACC15' : off?.border ?? '#3F3F46', boxShadow: ready ? `0 0 6px ${on?.glow ?? 'rgba(250,204,21,0.7)'}` : 'none' }}>
      <div className="absolute inset-y-0 left-0"
        style={{ width: `${fill * 100}%`, background: ready ? on?.fill ?? 'linear-gradient(180deg, #FEF08A 0%, #FACC15 50%, #CA8A04 100%)' : off?.fill ?? 'linear-gradient(180deg, #A16207, #713F12)' }} />
      <svg viewBox="0 0 10 10" className="absolute inset-0 m-auto w-[10px] h-[10px]">
        <path d="M6 0 L2 5.5 L4.5 5.5 L3.5 10 L8 4 L5.5 4 Z" fill={ready ? '#1C1917' : '#52525B'} />
      </svg>
    </div>
  );
};

export default HUD;
