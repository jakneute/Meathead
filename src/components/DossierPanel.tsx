import React from 'react';
import { DOSSIERS, DOSSIER_HEADER } from '../dossiers';
import { BOSS_LOCATIONS } from '../stages';
import BossPortrait from './BossPortrait';

/** A classified file on the selected boss: a typewritten, stamped and coffee-stained dossier. */
const DossierPanel: React.FC<{ bossId: string; defeated: boolean }> = ({ bossId, defeated }) => {
  const d = DOSSIERS[bossId];
  const loc = BOSS_LOCATIONS[bossId];
  if (!d) return null;
  const typewriter: React.CSSProperties = { fontFamily: '"Courier New", Courier, monospace' };
  const field = (label: string, value: string) => (
    <div className="leading-[10px]"><span className="font-bold text-[#7F1D1D]">{label}: </span>{value}</div>
  );
  const section = (title: string, body: string) => (
    <div className="mt-[5px]">
      <div className="font-bold text-[#7F1D1D] tracking-wider border-b border-[#7F1D1D]/40 mb-[2px] leading-[10px]">{title}</div>
      <div className="leading-[10px]">{body}</div>
    </div>
  );

  return (
    <div className="relative w-full h-[430px] overflow-hidden text-left text-[#1C1917] text-[8px] uppercase animate-in fade-in duration-200"
      style={{
        ...typewriter,
        background: 'linear-gradient(180deg, #E8DCC0 0%, #DDCCA6 100%)',
        boxShadow: 'inset 0 0 30px rgba(120, 90, 40, 0.35), 3px 3px 0 #000',
        border: '2px solid #8B7B5A',
      }}>
      {/* Coffee ring */}
      <div className="absolute right-[26px] bottom-[34px] w-[64px] h-[64px] rounded-full pointer-events-none" style={{ border: '5px solid rgba(110, 70, 30, 0.18)' }} />

      <div className="h-full overflow-y-auto px-3 pt-2 pb-3">
        <div className="flex justify-between items-start text-[7px] tracking-widest text-[#44403C] border-b-2 border-[#1C1917] pb-[3px] mb-[5px]">
          <span>{DOSSIER_HEADER}</span>
          <span className="text-[#B91C1C] font-bold">TOP SECRET</span>
        </div>

        <div className="flex gap-2">
          {/* Mugshot, paper-clipped to the file */}
          <div className="relative shrink-0 w-[74px] h-[82px] bg-black border-2 border-[#57534E] rotate-[-2deg]" style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.4)' }}>
            <BossPortrait id={bossId} />
            <div className="absolute -top-[6px] left-[10px] w-[10px] h-[22px] border-2 border-[#71717A] rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold leading-[13px] mb-[2px]">{bossId}</div>
            {field('REAL NAME', d.realName)}
            {field('AGE', d.age)}
            {loc && field('LAST SEEN', `${loc.city}, ${loc.state}`)}
            {field('THREAT', d.threat)}
          </div>
        </div>

        <div className="mt-[4px] leading-[10px]"><span className="font-bold text-[#7F1D1D]">OCCUPATION: </span>{d.occupation}</div>
        {section('WHAT HE THINKS HE\'S DOING', d.mission)}
        {section('WHAT HE\'S ACTUALLY DOING', d.reality)}
        {section('BACKGROUND', d.background)}
        {section('FIELD INTEL', d.intel)}
        {section('APPROVED DISPOSAL', d.disposal)}
        <div className="mt-[6px] p-[4px] leading-[10px] bg-[#FEF3C7] border border-[#A16207]/50 rotate-[-0.6deg]" style={{ boxShadow: '1px 1px 0 rgba(0,0,0,0.25)' }}>
          <span className="font-bold">HANDLER'S NOTE RE: ASSET "MEATHEAD": </span>{d.handler}
        </div>
      </div>

      {/* Rubber stamps */}
      <div className="absolute top-[34px] right-[10px] rotate-[14deg] px-[6px] py-[1px] text-[14px] font-bold tracking-widest pointer-events-none"
        style={{ color: defeated ? 'rgba(21, 128, 61, 0.75)' : 'rgba(185, 28, 28, 0.75)', border: `3px solid ${defeated ? 'rgba(21, 128, 61, 0.75)' : 'rgba(185, 28, 28, 0.75)'}` }}>
        {defeated ? 'DISPOSED OF' : 'TERMINATE'}
      </div>
    </div>
  );
};

export default DossierPanel;
