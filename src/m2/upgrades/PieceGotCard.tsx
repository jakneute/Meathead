// The card for an armor piece he's just been given (CON-FUCK-TIOUS's gift, in every land): the owner's "make sure the
// players know exactly what they are getting". The piece's icon and name, what the junk is, what it does, and how it's
// worked (the real buttons, pad or keys, live: ChordPrompt), all from the EQUIPMENT tab's own entry (equipInfo.tsx, the
// source of truth), so the card and the pause menu never disagree. Up while the land says (ui.gotPiece); a press moves
// on (the land's call: PRESS ANY BUTTON along its bottom).
//
// A piece can hide a surprise (`SURPRISE`): the hand armor's cheap shot is CON-FUCK-TIOUS's tease ("try doing a
// beatdown on bosses or sub bosses, you'll get a surprise"), so the card says to try it rather than spelling it out (the
// pause menu's EQUIPMENT tab still has it all).

import React from 'react';
import ChordPrompt from '../ChordPrompt';
import type { PadKey } from '../../m1/components/ButtonIcons';
import { EQUIP_ENTRIES, equipIcon, type EquipControl } from './equipInfo';
import type { ArmorPiece } from './state';

/** What a piece's card shows in place of a control line that'd give its surprise away. */
const SURPRISE: Partial<Record<ArmorPiece, { match: (c: EquipControl) => boolean; with: EquipControl }>> = {
  hands: {
    match: c => c.label.startsWith('RIGHT NEXT TO A BOSS'),
    with: { pad: ['Y', 'B'] as PadKey[], join: '+', kb: ['@beatdown'], label: 'ON A BOSS OR SUB BOSS: ??? (TRY IT)' },
  },
};

const PieceGotCard: React.FC<{ piece: ArmorPiece; ready: boolean }> = ({ piece, ready }) => {
  const e = EQUIP_ENTRIES.find(x => x.id === piece);
  if (!e) return null;
  const icon = equipIcon(piece);
  const sur = SURPRISE[piece];
  const controls = (e.controls ?? []).map(c => (sur && sur.match(c) ? sur.with : c));
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-[6px] px-5 py-4 max-w-[560px] bg-black/85 border-4 border-[#FDE047] text-zinc-100 font-black tracking-wider" style={{ boxShadow: '6px 6px 0 #000' }}>
        <div className="text-[9px] text-[#FDE047]">YOU GOT</div>
        <div className="flex items-center gap-3">
          {icon && <img src={icon} width={48} height={48} style={{ imageRendering: 'pixelated' }} alt="" />}
          <div className="text-[16px] text-white">{e.name}</div>
        </div>
        {e.junk && <div className="text-[7px] leading-[12px] text-zinc-400 text-center">{e.junk}</div>}
        <div className="text-[8px] leading-[14px] text-center text-zinc-100 mt-[2px]">{e.what}</div>
        {controls.length > 0 && (
          <div className="flex flex-col items-start gap-[5px] mt-[4px] text-[8px]">
            {controls.map((k, i) => <ChordPrompt key={i} pad={k.pad} join={k.join ?? '+'} kb={k.kb} mouse={k.mouse} label={k.label} size={14} />)}
          </div>
        )}
        {/* (only once the land's buffer is over: mashing through the gift doesn't shut it unread) */}
        <div className="text-[7px] text-zinc-500 mt-[6px] animate-pulse" style={{ visibility: ready ? 'visible' : 'hidden' }}>PRESS ANY BUTTON</div>
      </div>
    </div>
  );
};

export default PieceGotCard;
