// Frozen solid in Piper's bedroom (liquid nitrogen, or her ICE BALL): MASH! with the real buttons (Prompt: a pad's, or
// the keyboard's keys and the mouse's, live as you switch): only A (jump) breaks the ice (the user's; fight.ts), a bit
// a press; the meter's how far it's cracked. Icy blue, like the block he's in.

import React from 'react';
import { Prompt } from '../../../m1/components/ButtonIcons';

const IcePanel: React.FC<{ fill: number }> = ({ fill }) => (
  <div className="absolute left-1/2 -translate-x-1/2 top-[124px] z-30 flex flex-col items-center gap-1 px-4 py-2 text-[9px] text-white"
    style={{ background: 'linear-gradient(180deg, rgba(186,230,253,0.95), rgba(56,120,190,0.95))', border: '3px solid #F0FAFF', borderRadius: 6, boxShadow: '0 0 0 2px #0A1A3A, 4px 4px 0 rgba(0,0,0,0.5)', minWidth: 200 }}>
    <div className="text-[10px]" style={{ color: '#FFFFFF', textShadow: '2px 2px 0 #1E3A6E' }}>FROZEN! MASH IT!</div>
    <div className="flex items-center justify-center gap-3" style={{ height: 36 }}>
      <Prompt pad={['A']} kb={['@jump']} size={28} />
    </div>
    <div style={{ width: 180, height: 8, background: '#0A1A3A', border: '1px solid #F0FAFF' }}>
      <div style={{ width: `${Math.round(Math.max(0, Math.min(1, fill)) * 100)}%`, height: '100%', background: 'linear-gradient(180deg, #FFFFFF, #7DD3FC)' }} />
    </div>
  </div>
);

export default IcePanel;
