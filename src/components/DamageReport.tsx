import React from 'react';
import { Prompt } from './ButtonIcons';
import BossPortrait from './BossPortrait';
import DossierPanel from './DossierPanel';
import { BOSS_LOCATIONS } from '../content/roster';
import { WeaponType } from '../types';

/**
 * The damage report: every target he's done so far, on the one screen (the first four from the start of the second
 * set; all eight once there's nobody left), each one's file before and after.
 */
const DamageReport: React.FC<{
  bosses: string[];
  index: number;
  after: boolean;
  killRecords: Record<string, WeaponType | null>;
  onSelect: (i: number) => void;
  onToggleAfter: () => void;
  onClose: () => void;
  titleClass: string;
}> = ({ bosses, index, after, killRecords, onSelect, onToggleAfter, onClose, titleClass }) => {
  const id = bosses[Math.min(index, bosses.length - 1)];
  return (
    <div className="w-full h-full flex flex-col items-center justify-start pt-2 pb-1 overflow-hidden select-none animate-in fade-in duration-300">
      <div className="flex flex-col items-center mb-2 shrink-0">
        <h2 className={titleClass}>DAMAGE REPORT</h2>
        <div className="text-[8px] font-mono text-cyan-400/90 tracking-widest uppercase mt-0.5">
          {bosses.length} TARGETS DISPOSED OF // EVERY FILE, BEFORE AND AFTER
        </div>
      </div>
      <div className="w-full max-w-[770px] flex flex-row items-start justify-center gap-4 px-2">
        <div className="w-[330px] shrink-0 flex flex-col gap-2">
          <div className="w-full grid grid-cols-4 gap-1.5">
            {bosses.map((b, i) => {
              const on = i === index;
              const loc = BOSS_LOCATIONS[b];
              return (
                <button key={b} onClick={() => onSelect(i)} onMouseEnter={() => onSelect(i)}
                  className={`h-[112px] flex flex-col overflow-hidden border-2 rounded-sm transition-all text-left ${on ? 'border-yellow-400 scale-[1.04] shadow-[0_0_14px_rgba(255,255,0,0.55)] z-10' : 'border-white/30 hover:border-white/70 opacity-80'}`}>
                  <div className="flex-1 bg-black relative overflow-hidden">
                    <BossPortrait id={b} dead />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-red-600 text-[7px] font-black rotate-[-15deg] border border-red-900 px-[2px] bg-black/85">DEAD</div>
                    </div>
                  </div>
                  <div className={`px-[2px] py-[2px] ${on ? 'bg-yellow-400 text-black' : 'bg-zinc-900 text-white'}`}>
                    <div className="text-[6px] font-black uppercase leading-[7px] h-[14px] overflow-hidden">{b}</div>
                    {loc && <div className={`text-[5px] font-mono leading-[7px] truncate ${on ? 'text-black/75' : 'text-gray-400'}`}>{loc.city}</div>}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-1 flex flex-col gap-1 border-2 border-dashed border-zinc-700 p-2 text-[7px] font-mono text-zinc-400 tracking-wider">
            <Prompt pad={['DPAD']} kb={['ARROWS']} mouse="left" label="PICK A FILE" size={13} />
            <Prompt pad={['LB', 'RB']} kb={['TAB']} label="BEFORE / AFTER" size={13} />
            <button onClick={onClose} className="self-start"><Prompt pad={['X']} kb={['X']} mouse="left" label="BACK TO THE MAP" size={13} /></button>
          </div>
        </div>
        <div className="w-[390px] shrink-0 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex">
              {(['BEFORE', 'AFTER'] as const).map(tab => {
                const on = (tab === 'AFTER') === after;
                return (
                  <button key={tab} onClick={() => { if (!on) onToggleAfter(); }}
                    className={`px-3 py-[3px] text-[8px] font-black tracking-widest border-2 ${on ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'}`}>
                    {tab}
                  </button>
                );
              })}
            </div>
            <Prompt pad={['RSTICK']} mouse="wheel" label="SCROLL" size={14} className="text-[7px] font-mono text-cyan-400/80 tracking-wider" />
          </div>
          {id && <DossierPanel key={`${id}-${after}`} bossId={id} defeated={after} corpseWeapon={killRecords[id]} />}
        </div>
      </div>
    </div>
  );
};

export default DamageReport;
