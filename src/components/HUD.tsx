import React from 'react';
import { WeaponType } from '../types';

interface HUDProps {
  health: number;
  maxHealth: number;
  /** 0..1 readiness of the shoulder charge and the uppercut. */
  chargeMeter: number;
  uppercutMeter: number;
  currentWeapon: WeaponType;
  ammo: number;
  maxAmmo: number;
}

const HUD: React.FC<HUDProps> = ({ health, maxHealth, chargeMeter, uppercutMeter, currentWeapon, ammo, maxAmmo }) => {
  const healthPercent = Math.max(0, (health / maxHealth) * 100);

  const hasLimitedAmmo = maxAmmo !== Infinity;
  const ammoPercent = hasLimitedAmmo ? Math.max(0, (ammo / maxAmmo) * 100) : 100;

  return (
    <div className="absolute inset-0 pt-10 px-8 pb-6 pointer-events-none select-none z-10 flex flex-col justify-between">
      {/* Top Section */}
      <div className="flex justify-between items-start w-full">
        <div className="flex flex-col gap-2">
          {/* HP Bar */}
          <div className="flex items-center gap-4">
            <span className="text-white text-[10px] font-black italic">HP</span>
            <div className="w-48 h-5 bg-black border-2 border-white overflow-hidden shadow-[2px_2px_0px_white]">
              <div 
                className="h-full bg-red-600 transition-all duration-150" 
                style={{ width: `${healthPercent}%` }}
              />
            </div>
          </div>
          
          {/* Combined Special Move Charges */}
          <div className="flex items-center gap-4">
            <span className="text-white text-[10px] font-black italic">PWR</span>
            <div className="flex gap-1 items-center h-5">
              <MoveMeter label="CHG" value={chargeMeter} />
              <MoveMeter label="UPC" value={uppercutMeter} />
            </div>
          </div>

          <div className="mt-2 flex items-center gap-4">
            <span className="text-white text-[10px] font-black italic">WPN</span>
            <div className="flex flex-col gap-1 items-start">
              <div className="w-fit px-2 py-1 bg-red-800 border-2 border-white text-white text-[9px] font-black italic shadow-[2px_2px_0px_white] whitespace-nowrap">
                {currentWeapon.replace(/_/g, ' ')}
              </div>
              
              {hasLimitedAmmo && (
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-24 h-2 bg-black border border-white overflow-hidden">
                     <div 
                        className="h-full bg-yellow-400" 
                        style={{ width: `${ammoPercent}%` }}
                      />
                   </div>
                   <span className="text-white text-[8px] font-black">{Math.floor(ammo)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** One special move's cooldown: fills up as it recharges, solid when ready. */
const MoveMeter: React.FC<{ label: string, value: number }> = ({ label, value }) => {
  const ready = value >= 1;
  return (
    <div className="w-10 h-4 bg-black border-2 border-white relative shadow-[1px_1px_0px_white] overflow-hidden">
      <div className={`absolute inset-y-0 left-0 ${ready ? 'bg-yellow-500' : 'bg-yellow-500/50'}`} style={{ width: `${Math.max(0, value) * 100}%` }} />
      <span className={`absolute inset-0 flex items-center justify-center text-[5px] font-black ${ready ? 'text-black' : 'text-white/70'}`}>{label}</span>
    </div>
  );
};

export default HUD;
