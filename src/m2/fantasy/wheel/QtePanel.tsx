// The fairy wheel's QTE panel (App.tsx puts it up while ui.qte's set: fantasy/wheel/qte.ts runs the QTE): the real
// buttons (Prompt: a pad's, or the keyboard's keys and the mouse's, live as you switch), what to do with them, the
// meter, the time left; a gondola's pink and lilac with fairy lights, like the wheel's HUD.

import React from 'react';
import { Prompt, type PadKey } from '../../../m1/components/ButtonIcons';
import type { QteUi, QteKey } from '../../store';

const PAD: Record<QteKey, PadKey> = { A: 'A', B: 'B', X: 'X', Y: 'Y', LEFT: 'DPAD_LEFT', RIGHT: 'DPAD_RIGHT' };
// (the keyboard's: the directions, laid out like the pad's face buttons (qte.ts held))
const KB: Record<QteKey, string> = { A: '@down', B: '@right', X: '@left', Y: '@up', LEFT: '@left', RIGHT: '@right' };
const SAY: Record<QteUi['kind'], string> = { mash: 'MASH IT!', press: 'PRESS IT!', alternate: 'BACK AND FORTH!', ring: 'WHEN THE RING HITS!' };

const Key: React.FC<{ k: QteKey; size: number; dim?: boolean }> = ({ k, size, dim }) => (
  <span style={{ opacity: dim ? 0.35 : 1, filter: dim ? 'none' : 'drop-shadow(0 0 4px #FEF08A)' }}><Prompt pad={[PAD[k]]} kb={[KB[k]]} size={size} /></span>
);

const QtePanel: React.FC<{ qte: QteUi }> = ({ qte }) => {
  const border = qte.flash === 'good' ? '#86EFAC' : qte.flash === 'bad' ? '#F87171' : '#FFF0FA';
  const ring = qte.kind === 'ring' && qte.ring !== undefined;
  const R = (k: number) => 30 + k * 70;
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-[124px] z-30 flex flex-col items-center gap-1 px-4 py-2 text-[9px] text-white"
      style={{ background: 'linear-gradient(180deg, rgba(232,140,200,0.95), rgba(110,60,150,0.95))', border: `3px solid ${border}`, borderRadius: 10, boxShadow: '0 0 0 2px #2A0A2A, 4px 4px 0 rgba(0,0,0,0.5)', minWidth: 220 }}>
      <div className="flex w-full justify-between gap-4 text-[8px]">
        <span style={{ color: '#FEF08A' }}>{qte.name}</span>
        <span style={{ color: '#FFE4F2' }}>{qte.step}/{qte.steps}</span>
      </div>
      <div className="text-[10px]" style={{ color: '#FFFFFF', textShadow: '2px 2px 0 #6E2A6E' }}>{SAY[qte.kind]}</div>
      <div className="relative flex items-center justify-center gap-3" style={{ height: ring ? 110 : 40, width: ring ? 160 : 'auto' }}>
        {ring && qte.band && (
          // (the target: a band; the ring closing in on it)
          <span className="absolute rounded-full" style={{ width: R(qte.band[1]) * 2, height: R(qte.band[1]) * 2, border: `${Math.max(3, (R(qte.band[1]) - R(qte.band[0])))}px solid rgba(134,239,172,0.55)`, boxSizing: 'border-box' }} />
        )}
        {ring && (
          <span className="absolute rounded-full" style={{ width: R(qte.ring!) * 2, height: R(qte.ring!) * 2, border: '3px solid #FEF08A', boxSizing: 'border-box' }} />
        )}
        {qte.kind === 'alternate'
          ? qte.keys.map((k, i) => <Key key={k} k={k} size={26} dim={qte.next !== undefined && qte.next !== i} />)
          : <Key k={qte.keys[0]} size={28} />}
      </div>
      {/* (the meter: how far through it he is; the time left under it) */}
      <div style={{ width: 200, height: 8, background: '#3A1A4A', border: '1px solid #FFF0FA' }}>
        <div style={{ width: `${Math.round(Math.max(0, Math.min(1, qte.fill)) * 100)}%`, height: '100%', background: 'linear-gradient(180deg, #FFE4F2, #F472B6)' }} />
      </div>
      <div style={{ width: 200, height: 3, background: '#3A1A4A' }}>
        <div style={{ width: `${Math.round(Math.max(0, Math.min(1, qte.time)) * 100)}%`, height: '100%', background: qte.time < 0.3 ? '#F87171' : '#FEF08A' }} />
      </div>
    </div>
  );
};

export default QtePanel;
