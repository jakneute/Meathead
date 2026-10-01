import React, { useEffect, useRef } from 'react';
import { Prompt } from './ButtonIcons';
import BossPortrait from './BossPortrait';
import DossierPanel from './DossierPanel';
import { BOSS_LOCATIONS } from '../content/roster';
import { CARNAGE_PHOTOS } from '../game/render/scenes/carnage';
import { WeaponType } from '../types';

/** Which of each target's pages is up: his file before, the after-action report, or the photo of the scene. */
export const REPORT_VIEWS = ['BEFORE', 'AFTER', 'PHOTO'] as const;

/** A carnage photo, painted at three times its art size. */
const Photo: React.FC<{ id: string; className?: string }> = ({ id, className }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    const p = CARNAGE_PHOTOS[id];
    if (!ctx || !p) return;
    ctx.setTransform(3, 0, 0, 3, 0, 0);
    ctx.clearRect(0, 0, 256, 144);
    p.draw(ctx);
  }, [id]);
  return <canvas ref={canvas} width={768} height={432} className={className} />;
};

/**
 * The damage report: every target he's done so far, on the one screen (the first four from the start of the second
 * set; all eight once there's nobody left), each one's file before and after, and the photo the cleanup crew took.
 */
const DamageReport: React.FC<{
  bosses: string[];
  index: number;
  view: number;
  killRecords: Record<string, WeaponType | null>;
  onSelect: (i: number) => void;
  onView: (v: number) => void;
  onClose: () => void;
  titleClass: string;
}> = ({ bosses, index, view, killRecords, onSelect, onView, onClose, titleClass }) => {
  const id = bosses[Math.min(index, bosses.length - 1)];
  const photo = view === 2;
  const tabs = (
    <div className="flex">
      {REPORT_VIEWS.map((tab, v) => {
        const on = v === view;
        return (
          <button key={tab} onClick={() => onView(v)}
            className={`px-3 py-[3px] text-[8px] font-black tracking-widest border-2 ${on ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'}`}>
            {tab}
          </button>
        );
      })}
    </div>
  );
  const help = (
    <div className={`flex ${photo ? 'flex-row justify-center gap-5' : 'flex-col gap-1 border-2 border-dashed border-zinc-700 p-2'} text-[7px] font-mono text-zinc-400 tracking-wider`}>
      <Prompt pad={['DPAD']} kb={['ARROWS']} mouse="left" label="PICK A TARGET" size={13} />
      <Prompt pad={['LB', 'RB']} kb={['TAB']} label="BEFORE / AFTER / PHOTO" size={13} />
      <button onClick={onClose} className="self-start"><Prompt pad={['X']} kb={['X']} mouse="left" label="BACK TO THE MAP" size={13} /></button>
    </div>
  );
  const card = (b: string, i: number, small: boolean) => {
    const on = i === index;
    const loc = BOSS_LOCATIONS[b];
    return (
      <button key={b} onClick={() => onSelect(i)} onMouseEnter={() => onSelect(i)}
        className={`${small ? 'h-[74px]' : 'h-[112px]'} flex flex-col overflow-hidden border-2 rounded-sm transition-all text-left ${on ? 'border-yellow-400 scale-[1.04] shadow-[0_0_14px_rgba(255,255,0,0.55)] z-10' : 'border-white/30 hover:border-white/70 opacity-80'}`}>
        <div className="flex-1 bg-black relative overflow-hidden">
          <BossPortrait id={b} dead />
          {!small && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-red-600 text-[7px] font-black rotate-[-15deg] border border-red-900 px-[2px] bg-black/85">DEAD</div>
            </div>
          )}
        </div>
        <div className={`px-[2px] py-[2px] ${on ? 'bg-yellow-400 text-black' : 'bg-zinc-900 text-white'}`}>
          <div className={`${small ? 'text-[5px] h-[6px]' : 'text-[6px] h-[14px]'} font-black uppercase leading-[7px] overflow-hidden`}>{b}</div>
          {loc && !small && <div className={`text-[5px] font-mono leading-[7px] truncate ${on ? 'text-black/75' : 'text-gray-400'}`}>{loc.city}</div>}
        </div>
      </button>
    );
  };
  return (
    <div className="w-full h-full flex flex-col items-center justify-start pt-2 pb-1 overflow-hidden select-none animate-in fade-in duration-300">
      <div className="flex flex-col items-center mb-2 shrink-0">
        <h2 className={titleClass}>DAMAGE REPORT</h2>
        <div className="text-[8px] font-mono text-cyan-400/90 tracking-widest uppercase mt-0.5">
          {bosses.length} TARGETS DISPOSED OF // EVERY FILE, BEFORE AND AFTER // THE PHOTOS
        </div>
      </div>
      {photo ? (
        // The photo, big: a strip of the targets along the top, the print under it, its evidence tag
        <div className="w-full max-w-[740px] flex flex-col items-center gap-2 px-2">
          <div className="w-full flex items-center justify-between gap-3">
            <div className="flex-1 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${bosses.length}, minmax(0, 1fr))` }}>
              {bosses.map((b, i) => card(b, i, true))}
            </div>
            {tabs}
          </div>
          <div className="relative p-[6px] pb-[22px] bg-[#F5F5F4] rotate-[-0.6deg]" style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.6)' }}>
            {id && <Photo id={id} className="block w-[600px] h-[338px]" />}
            <div className="absolute left-[8px] right-[8px] bottom-[4px] text-[7px] leading-[8px] text-[#292524] uppercase truncate" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
              {CARNAGE_PHOTOS[id]?.caption}
            </div>
            <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-[60px] h-[12px] bg-[#FEF9C3]/70 rotate-[2deg]" />
          </div>
          {help}
        </div>
      ) : (
        <div className="w-full max-w-[770px] flex flex-row items-start justify-center gap-4 px-2">
          <div className="w-[330px] shrink-0 flex flex-col gap-2">
            <div className="w-full grid grid-cols-4 gap-1.5">
              {bosses.map((b, i) => card(b, i, false))}
            </div>
            <div className="mt-1">{help}</div>
          </div>
          <div className="w-[390px] shrink-0 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              {tabs}
              <Prompt pad={['RSTICK']} mouse="wheel" label="SCROLL" size={14} className="text-[7px] font-mono text-cyan-400/80 tracking-wider" />
            </div>
            {id && <DossierPanel key={`${id}-${view}`} bossId={id} defeated={view === 1} corpseWeapon={killRecords[id]} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default DamageReport;
