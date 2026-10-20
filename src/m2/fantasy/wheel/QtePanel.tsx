// The fairy wheel's QTE panel (App.tsx puts it up while ui.qte's set: fantasy/wheel/qte.ts runs the QTE): the real
// buttons (Prompt: a pad's, or the keyboard's keys and the mouse's, live as you switch), what to do with them, the
// meter, the time left. Done up like one of the wheel's gondolas: a pink toadstool cap over it with its white spots and
// fairy lights twinkling along the rim, the suitor's name on a gilt plaque, the body banded in steps (no smooth
// gradients), pixel-stepped ink borders, the steps as hearts (filled as he gets through them), the meter in stepped pink.

import React from 'react';
import { Prompt, type PadKey } from '../../../m1/components/ButtonIcons';
import type { QteUi, QteKey } from '../../store';

const PAD: Record<QteKey, PadKey> = { A: 'A', B: 'B', X: 'X', Y: 'Y', LEFT: 'DPAD_LEFT', RIGHT: 'DPAD_RIGHT' };
// (the keyboard's: the directions, laid out like the pad's face buttons (qte.ts held))
const KB: Record<QteKey, string> = { A: '@down', B: '@right', X: '@left', Y: '@up', LEFT: '@left', RIGHT: '@right' };
const SAY: Record<QteUi['kind'], string> = { mash: 'MASH IT!', press: 'TAP IT!', alternate: 'BACK AND FORTH!', ring: 'TAP WHEN THE RING HITS!' };

const INK = '#1A1028';
/** A banded fill (hard stops: the SNES's steps, not a smooth blend). */
const bands = (cols: string[]) => `linear-gradient(180deg, ${cols.map((c, i) => `${c} ${(i / cols.length) * 100}%, ${c} ${((i + 1) / cols.length) * 100}%`).join(', ')})`;
/** A pixel-stepped ink border with a lit inner edge (box shadows, no rounding). */
const pixelEdge = (lit: string, shade: string) => `0 0 0 2px ${INK}, inset 2px 2px 0 ${lit}, inset -2px -2px 0 ${shade}, 4px 4px 0 rgba(0,0,0,0.45)`;

const Key: React.FC<{ k: QteKey; size: number; dim?: boolean }> = ({ k, size, dim }) => (
  <span style={{ opacity: dim ? 0.35 : 1, filter: dim ? 'none' : 'drop-shadow(0 0 4px #FEF08A)' }}><Prompt pad={[PAD[k]]} kb={[KB[k]]} size={size} /></span>
);

const HEART = [' XX XX ', 'XXXXXXX', 'XXXXXXX', ' XXXXX ', '  XXX  ', '   X   '];
const CELLS = HEART.flatMap((row, y) => [...row].map((ch, x) => (ch === 'X' ? [x + 1, y + 1] : null)).filter((p): p is number[] => !!p));
const Heart: React.FC<{ on: boolean }> = ({ on }) => (
  <svg width="18" height="16" viewBox="0 0 9 8" shapeRendering="crispEdges" style={{ display: 'block' }}>
    {CELLS.map(([x, y], i) => <rect key={`i${i}`} x={x - 1} y={y - 1} width={3} height={3} fill={INK} />)}
    {CELLS.map(([x, y], i) => <rect key={`f${i}`} x={x} y={y} width={1} height={1} fill={on ? (y > 3 ? '#DB2777' : '#F472B6') : (y > 3 ? '#3A1A3A' : '#4A2A4A')} />)}
    {on && <rect x={2} y={2} width={1} height={1} fill="#FFE4F2" />}
  </svg>
);

const QtePanel: React.FC<{ qte: QteUi }> = ({ qte }) => {
  const border = qte.flash === 'good' ? '#86EFAC' : qte.flash === 'bad' ? '#F87171' : '#FFF0FA';
  const ring = qte.kind === 'ring' && qte.ring !== undefined;
  const R = (k: number) => 30 + k * 70;
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => { const id = window.setInterval(() => setTick(t => t + 1), 160); return () => window.clearInterval(id); }, []);
  const bulbs = ['#FEF08A', '#A5F3FC', '#F9A8D4', '#FFFFFF', '#BBF7D0'];
  const fill = Math.round(Math.max(0, Math.min(1, qte.fill)) * 100), time = Math.round(Math.max(0, Math.min(1, qte.time)) * 100);
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-[124px] z-30 flex flex-col items-center text-[9px] text-white" style={{ minWidth: 236 }}>
      {/* (the cap: a toadstool's, banded, spotted, its rim lit with fairy lights) */}
      <div className="relative" style={{ width: 252, height: 26, marginBottom: -4 }}>
        <div className="absolute inset-0" style={{ background: bands(['#FBC4E0', '#F49AC8', '#E0789F', '#C8508E']), borderRadius: '126px 126px 6px 6px / 26px 26px 6px 6px', boxShadow: `0 0 0 2px ${INK}` }} />
        {[[30, 9, 6], [76, 4, 5], [128, 7, 7], [176, 3, 5], [214, 10, 4]].map(([x, y, s], i) => (
          <span key={i} className="absolute" style={{ left: x, top: y, width: s * 1.6, height: s, background: '#FFFFFF', boxShadow: `inset -1px -1px 0 #E8E0F0, 0 0 0 1px ${INK}`, borderRadius: 2 }} />
        ))}
        <div className="absolute left-2 right-2 flex justify-between" style={{ bottom: 1 }}>
          {Array.from({ length: 12 }, (_, i) => {
            const on = (i + tick) % 4 !== 0, col = bulbs[i % bulbs.length];
            return <span key={i} style={{ width: 4, height: 4, background: on ? col : '#5A4A6A', boxShadow: `0 0 0 1px ${INK}${on ? `, 0 0 5px ${col}` : ''}` }} />;
          })}
        </div>
      </div>
      <div className="relative flex flex-col items-center gap-1 px-4 pb-2 pt-3"
        style={{ background: bands(['#E88CC8', '#D27ABE', '#B868B0', '#9A58A4', '#7C4A98', '#6A3C8A']), boxShadow: `${pixelEdge('#FFD0EC', '#4A2A6A')}, 0 0 0 4px ${border}`, minWidth: 236 }}>
        {/* (the gilt plaque with his name; the steps as hearts) */}
        <div className="flex w-full items-center justify-between gap-3">
          <span className="px-2 py-[2px] text-[8px]" style={{ color: '#FEF08A', background: '#4A1A5A', boxShadow: `0 0 0 1px ${INK}, inset 0 0 0 1px #E0AE3A`, textShadow: '1px 1px 0 #3A2208' }}>{qte.name}</span>
          <span className="flex gap-[2px]">{Array.from({ length: qte.steps }, (_, i) => <Heart key={i} on={i < qte.step} />)}</span>
        </div>
        <div className="text-[10px]" style={{ color: '#FFFFFF', textShadow: `2px 2px 0 #6E2A6E, -1px -1px 0 ${INK}, 1px -1px 0 ${INK}, -1px 1px 0 ${INK}` }}>{SAY[qte.kind]}</div>
        <div className="relative flex items-center justify-center gap-3" style={{ height: ring ? 110 : 40, width: ring ? 160 : 'auto' }}>
          {ring && qte.band && (
            // (the target: a band; the ring closing in on it)
            <span className="absolute rounded-full" style={{ width: R(qte.band[1]) * 2, height: R(qte.band[1]) * 2, border: `${Math.max(3, (R(qte.band[1]) - R(qte.band[0])))}px solid rgba(134,239,172,0.55)`, boxSizing: 'border-box', boxShadow: `0 0 0 1px ${INK}` }} />
          )}
          {ring && (
            <span className="absolute rounded-full" style={{ width: R(qte.ring!) * 2, height: R(qte.ring!) * 2, border: '3px solid #FEF08A', boxSizing: 'border-box', boxShadow: `0 0 0 1px ${INK}, inset 0 0 0 1px ${INK}` }} />
          )}
          {qte.kind === 'alternate'
            ? qte.keys.map((k, i) => <Key key={k} k={k} size={26} dim={qte.next !== undefined && qte.next !== i} />)
            : <Key k={qte.keys[0]} size={28} />}
        </div>
        {/* (the meter: how far through it he is, in stepped pink; the time left under it) */}
        <div style={{ width: 204, height: 10, background: '#2A1238', boxShadow: `0 0 0 1px ${INK}, inset 1px 1px 0 #1A0A24`, padding: 1 }}>
          <div style={{ width: `${fill}%`, height: '100%', background: bands(['#FFE4F2', '#F9A8D4', '#F472B6', '#DB2777']) }} />
        </div>
        <div style={{ width: 204, height: 4, background: '#2A1238', boxShadow: `0 0 0 1px ${INK}` }}>
          <div style={{ width: `${time}%`, height: '100%', background: qte.time < 0.3 ? bands(['#FCA5A5', '#F87171']) : bands(['#FEF9C3', '#FEF08A']) }} />
        </div>
      </div>
      {/* (the flower bowl under it, a scallop of petals) */}
      <div className="flex" style={{ marginTop: -2 }}>
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} style={{ width: 20, height: 9 - Math.abs(i - 3), background: bands(['#C8508E', '#9A3A72']), borderRadius: '0 0 10px 10px', boxShadow: `0 0 0 1px ${INK}`, margin: '0 1px' }} />
        ))}
      </div>
    </div>
  );
};

export default QtePanel;
