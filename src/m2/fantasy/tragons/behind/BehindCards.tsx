import React from 'react';
import { Prompt } from '../../../../m1/components/ButtonIcons';
import type { BvCard } from './ride';

// Truelling Tragons from behind: the card at the bottom (behind/ride.ts card): hanging on in a roll now (HOLD down, the
// lean with the real button, a hand off), a roll coming (which tracks), the first time each thing comes at his track
// (the button that beats it), and the controls the first ride. A storybook shingle, as the classic ride's cards.

const HOP_L = { pad: ['LB' as const], kb: ['@nextWeapon'] };
const HOP_R = { pad: ['RB' as const], kb: ['@prevWeapon'] };
const DOWN = { pad: ['DPAD_DOWN' as const], kb: ['@down'] };
const JUMP = { pad: ['A' as const], kb: ['@jump'] };
const LEFT = { pad: ['DPAD_LEFT' as const], kb: ['@left'] };
const RIGHT = { pad: ['DPAD_RIGHT' as const], kb: ['@right'] };

const shingle = 'absolute left-1/2 -translate-x-1/2 bottom-[10px] z-30 flex flex-col items-center gap-1 px-3 py-2 text-white bg-gradient-to-b from-[#2A4A8A] via-[#1E3A6E] to-[#0E1A3A] shadow-[0_0_0_2px_#1A1028,inset_0_0_0_2px_#7A5418] border-4';
const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="inline-flex items-center gap-1 align-middle whitespace-nowrap">{children}</span>;

const BehindCards: React.FC<{ card: BvCard }> = ({ card }) => {
  if (card.k === 'now') {
    return (
      <div className={`${shingle} text-[12px] ${card.oneOff ? 'border-red-500' : 'border-white'}`}>
        <Row><span>BALANCE!</span><Prompt {...LEFT} /><Prompt {...RIGHT} /><span>KEEP IT IN THE GREEN</span></Row>
        {card.oneOff && <span className="text-[9px] text-red-300">ONE HAND OFF! PUSH IT BACK!</span>}
      </div>
    );
  }
  if (card.k === 'coming') {
    const tracks = card.lanes.map((l, i) => <span key={l} style={{ color: card.cols[i] }}>{l}</span>);
    const joined = tracks.flatMap((el, i) => (i ? [<span key={`a${i}`}>{i === tracks.length - 1 ? ' AND ' : ', '}</span>, el] : [el]));
    return (
      <div className={`${shingle} ${card.teach ? 'text-[10px] border-[#FACC15]' : 'text-[9px]'}`} style={card.teach ? undefined : { borderColor: card.cols[0] }}>
        <Row>{card.kind} ON {joined}{card.lanes.length > 1 ? ' TRACKS' : ' TRACK'}{card.mine ? <span className="text-red-400"> YOURS!</span> : null}</Row>
        <Row><span>HE HANGS ON. YOU BALANCE HIM:</span><Prompt {...LEFT} /><Prompt {...RIGHT} /><span>KEEP THE BAR IN THE GREEN</span></Row>
        {card.teach && <span className="text-[8px] text-zinc-300">RED: ONE HAND OFF. OFF THE END: YOU FALL. LIGHTNING ONLY LOOPS WHEN ALL THREE DO.</span>}
      </div>
    );
  }
  if (card.k === 'teach') {
    return (
      <div className={`${shingle} text-[10px] border-[#FACC15]`}>
        {card.what === 'ring' && <Row><span>RINGS OF FIRE:</span><Prompt {...JUMP} /><span>JUMP THROUGH</span></Row>}
        {card.what === 'bar' && <Row><span>FROZEN BAR:</span><Prompt {...JUMP} /><span>JUMP IT</span></Row>}
        {card.what === 'icicles' && <Row><span>ICICLES:</span><Prompt {...DOWN} /><span>DUCK</span></Row>}
        {card.what === 'zap' && <Row><span>THE LIGHTNING DRAGON'S GOING LIVE:</span><Prompt {...HOP_L} /><Prompt {...HOP_R} /><span>HOP OFF</span></Row>}
        {card.what === 'gap' && <Row><span>TRACK OUT AHEAD:</span><Prompt {...HOP_L} /><Prompt {...HOP_R} /><span>HOP TO ANOTHER DRAGON</span></Row>}
      </div>
    );
  }
  return (
    <div className={`${shingle} text-[9px] border-[#E0AE3A]`}>
      <div className="flex gap-4">
        <Prompt {...HOP_L} label="HOP LEFT" />
        <Prompt {...HOP_R} label="HOP RIGHT" />
        <Prompt {...JUMP} label="JUMP" />
        <Prompt {...DOWN} label="DUCK" />
      </div>
      <span className="text-zinc-400">NO GUNS ON THE RIDE: HANG ON</span>
    </div>
  );
};

export default BehindCards;
