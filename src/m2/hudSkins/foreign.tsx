// Foreign Lands' HUD and pause menu, a look per pavilion (the park's own kitsch, nothing worse): a passport at the gate,
// papel picado over talavera tile in Mexico, a stave church's tarred wood and rosemaling in Norway, red lacquer and a
// gold fret in China, a cuckoo clock's carving in Germany, gondola stripes and marble in Italy, shoji and a torii's red
// in Japan, zellige tile under a horseshoe arch in Morocco, Metro green iron and a cafe awning in France, a red phone
// box in the UK, buffalo plaid and a maple leaf in Canada; the tour helicopter's yellow and its gauges; Harry's tie-dye
// under a red headband in his arena.

import React from 'react';
import type { Theme } from '../hudThemes';
import { edge, tag, rivets, bit, word, topBand, PIXEL_SHADOW, FRAME_SHADOW } from '../hudKit';

export type ForeignZone = 'foreign' | 'mexico' | 'norway' | 'china' | 'germany' | 'italy' | 'japan' | 'morocco' | 'france' | 'uk' | 'canada' | 'heli' | 'harry';

/** Papel picado: a string of cut-paper flags along a top edge. */
const picado = (h = 7, w = 40) => bit({ left: 8, right: 28, top: -4, height: h, background: `linear-gradient(90deg, #EC4899 0 ${w * 0.2}px, transparent 0 ${w * 0.25}px, #FACC15 0 ${w * 0.45}px, transparent 0 ${w * 0.5}px, #22C55E 0 ${w * 0.7}px, transparent 0 ${w * 0.75}px, #38BDF8 0 ${w * 0.95}px, transparent 0) 0 0 / ${w}px 100% repeat-x`, WebkitMask: `conic-gradient(from -45deg at 50% 100%, transparent 90deg, #000 0) 0 0 / ${w / 8}px 100%`, mask: `conic-gradient(from -45deg at 50% 100%, transparent 90deg, #000 0) 0 0 / ${w / 8}px 100%`, borderTop: '1px solid #F5F5F4' });
const MAPLE = 'polygon(50% 0, 58% 18%, 70% 12%, 66% 38%, 84% 26%, 80% 44%, 100% 42%, 88% 58%, 94% 64%, 66% 72%, 54% 70%, 54% 100%, 46% 100%, 46% 70%, 34% 72%, 6% 64%, 12% 58%, 0 42%, 20% 44%, 16% 26%, 34% 38%, 30% 12%, 42% 18%)';
const ZELLIGE = 'radial-gradient(circle, #FEF3C7 1.2px, transparent 1.6px) 0 0 / 8px 8px, conic-gradient(from 45deg, #0E7490 0 25%, #F1F5F9 0 50%, #0E7490 0 75%, #F1F5F9 0) 0 0 / 8px 8px';
const TIE_DYE = 'radial-gradient(circle at 30% 50%, transparent 0 4px, rgba(255,255,255,0.18) 5px 7px, transparent 8px 12px, rgba(255,255,255,0.15) 13px 15px, transparent 16px), conic-gradient(from 30deg at 30% 50%, #EC4899, #F97316, #FACC15, #22C55E, #3B82F6, #A855F7, #EC4899)';

export const FOREIGN_THEMES: Record<ForeignZone, Theme> = {
  // The gate: a passport, navy with a gold edge, a red customs stamp
  foreign: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(30,58,138,0.96), rgba(23,37,84,0.96))', border: '2px solid #CA8A04', borderRadius: '2px 8px 8px 2px', boxShadow: PIXEL_SHADOW + ', inset 0 0 0 2px rgba(202,138,4,0.35)' },
      deco: <>
        {edge('repeating-linear-gradient(180deg, #CA8A04 0 1px, #172554 1px 4px)', 5)}
        {bit({ right: 8, bottom: 4, width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(220,38,38,0.8)', transform: 'rotate(-14deg)' })}
        {word('ENTRY', { right: 10, bottom: 11, color: 'rgba(220,38,38,0.9)', transform: 'rotate(-14deg)', fontSize: 4 })}
        {tag('VISA', { background: '#B91C1C', color: '#FEF2F2', transform: 'rotate(4deg)' })}
      </>,
      label: '#DBEAFE', value: '#FFFFFF', name: '#FDE68A',
      track: { background: '#0B1437', borderColor: '#CA8A04' },
      hp: 'linear-gradient(180deg, #FDE68A, #CA8A04 50%, #854D0E)',
      slot: { background: 'rgba(11,20,55,0.6)', borderColor: '#CA8A04' },
      cellOn: { border: '#FDE68A', fill: 'linear-gradient(180deg, #FEF3C7, #EAB308)', glow: 'rgba(234,179,8,0.8)' },
      cellOff: { border: '#1E40AF', fill: 'linear-gradient(180deg, #1E40AF, #172554)' },
    },
    pause: {
      title: 'CUSTOMS', sub: 'ANYTHING TO DECLARE? BESIDES THAT SMELL?',
      titleStyle: { color: '#FDE68A', textShadow: '3px 3px 0 #B91C1C, 5px 5px 0 #000' },
      frame: { background: 'linear-gradient(180deg, #1E3A8A, #172554)', border: '4px solid #CA8A04', borderRadius: '4px 16px 16px 4px', boxShadow: FRAME_SHADOW() + ', inset 0 0 0 3px rgba(202,138,4,0.3)' },
      stripe: 'repeating-linear-gradient(135deg, #B91C1C 0 8px, #F8FAFC 8px 16px, #1E40AF 16px 24px, #F8FAFC 24px 32px)',
      deco: <div className="absolute right-8 top-4 w-[56px] h-[56px] rounded-full flex items-center justify-center text-[8px] font-black -rotate-12" style={{ border: '3px solid rgba(220,38,38,0.75)', color: 'rgba(220,38,38,0.85)' }}>ADMITTED</div>,
      accent: '#FDE68A', text: '#DBEAFE', muted: '#93C5FD',
      well: { background: 'rgba(11,20,55,0.6)', border: '1px solid #CA8A04' },
      slot: 'rgba(11,20,55,0.92)', slotOn: 'rgba(253,230,138,0.85)',
      button: 'linear-gradient(180deg, #B91C1C, #7F1D1D)', buttonEdge: '#172554',
    },
  },
  // Mexico: papel picado strung over a talavera-tiled plate (cobalt on white), terracotta trim
  mexico: {
    hud: {
      panel: { backgroundImage: 'radial-gradient(circle, rgba(29,78,216,0.5) 1.5px, transparent 2px), radial-gradient(circle, transparent 3px, rgba(29,78,216,0.25) 3.5px 4px, transparent 4.5px), linear-gradient(180deg, rgba(194,65,12,0.96), rgba(154,52,18,0.96))', backgroundSize: '12px 12px, 12px 12px, auto', border: '3px solid transparent', borderImage: 'repeating-linear-gradient(90deg, #1D4ED8 0 4px, #F8FAFC 4px 8px) 3', boxShadow: PIXEL_SHADOW },
      deco: <>
        {picado()}
        {edge('repeating-linear-gradient(180deg, #F8FAFC 0 3px, #1D4ED8 3px 6px)', 3)}
      </>,
      label: '#FFEDD5', value: '#FFFFFF', name: '#FDE047',
      track: { background: '#431407', borderColor: '#1D4ED8' },
      hp: 'linear-gradient(180deg, #FBCFE8, #EC4899 50%, #9D174D)',
      slot: { background: 'rgba(248,250,252,0.25)', borderColor: '#F8FAFC' },
      cellOn: { border: '#FDE047', fill: 'linear-gradient(180deg, #FEF08A, #22C55E)', glow: 'rgba(34,197,94,0.8)' },
      cellOff: { border: '#7C2D12', fill: 'linear-gradient(180deg, #9A3412, #431407)' },
    },
    pause: {
      title: 'UN MOMENTO', sub: 'THE TACO CART WILL WAIT. THE LINE WILL NOT.',
      titleStyle: { color: '#FDE047', textShadow: '3px 3px 0 #1D4ED8, 5px 5px 0 #000' },
      frame: { backgroundImage: 'radial-gradient(circle, rgba(29,78,216,0.35) 3px, transparent 3.5px), linear-gradient(180deg, #C2410C, #7C2D12)', backgroundSize: '22px 22px, auto', border: '6px solid transparent', borderImage: 'repeating-linear-gradient(90deg, #1D4ED8 0 8px, #F8FAFC 8px 16px) 6', boxShadow: FRAME_SHADOW() },
      stripe: 'linear-gradient(90deg, #EC4899 0 20%, #FACC15 0 40%, #22C55E 0 60%, #38BDF8 0 80%, #A855F7 0)',
      accent: '#FDE047', text: '#FFF7ED', muted: '#FED7AA',
      well: { background: 'rgba(67,20,7,0.55)', border: '1px solid #1D4ED8' },
      slot: 'rgba(67,20,7,0.92)', slotOn: 'rgba(253,224,71,0.9)',
      button: 'linear-gradient(180deg, #16A34A, #166534)', buttonEdge: '#052E16',
    },
  },
  // Norway: a stave church's tarred planks, rosemaling flourishes, a dragon-head gable, the flag's cross
  norway: {
    hud: {
      panel: { background: 'repeating-linear-gradient(90deg, rgba(41,24,12,0.97) 0 13px, rgba(28,16,8,0.97) 13px 14px)', border: '3px solid #7F1D1D', boxShadow: PIXEL_SHADOW + ', inset 0 0 0 1px #FDE68A' },
      deco: <>
        {bit({ left: 6, bottom: 3, width: 26, height: 8, background: 'radial-gradient(circle at 20% 60%, #F87171 2px, transparent 2.5px), radial-gradient(circle at 50% 40%, #FDE68A 2px, transparent 2.5px), radial-gradient(circle at 80% 60%, #60A5FA 2px, transparent 2.5px), radial-gradient(ellipse 12px 3px at 50% 80%, transparent 2px, #4ADE80 2.5px 3px, transparent 3.5px)' })}
        {bit({ right: 4, top: -9, width: 18, height: 10, background: '#1C1008', clipPath: 'polygon(0 100%, 40% 20%, 55% 0, 75% 10%, 60% 30%, 100% 100%)', filter: 'drop-shadow(0 0 0.5px #FDE68A)' })}
        {bit({ right: 26, top: -6, width: 14, height: 9, background: 'linear-gradient(90deg, transparent 4px, #FFF 4px 5px, #1D4ED8 5px 7px, #FFF 7px 8px, transparent 8px), linear-gradient(0deg, transparent 3px, #FFF 3px 4px, #1D4ED8 4px 5px, #FFF 5px 6px, transparent 6px), #DC2626', boxShadow: '0 0 0 1px #000' })}
      </>,
      label: '#FDE68A', value: '#FEF3C7', name: '#F87171',
      track: { background: '#0C0704', borderColor: '#7F1D1D' },
      hp: 'linear-gradient(180deg, #FCA5A5, #DC2626 50%, #7F1D1D)',
      slot: { background: 'rgba(12,7,4,0.6)', borderColor: '#FDE68A' },
      cellOn: { border: '#BFDBFE', fill: 'linear-gradient(180deg, #DBEAFE, #3B82F6)', glow: 'rgba(96,165,250,0.85)' },
      cellOff: { border: '#422006', fill: 'linear-gradient(180deg, #57391E, #1C1008)' },
    },
    pause: {
      title: 'HOLD THE LONGSHIP', sub: 'THE TROLLS ARE COUNTING YOU',
      titleStyle: { color: '#FDE68A', textShadow: '3px 3px 0 #7F1D1D, 5px 5px 0 #000' },
      frame: { background: 'repeating-linear-gradient(90deg, #29180C 0 26px, #1C1008 26px 28px)', border: '6px solid #7F1D1D', boxShadow: FRAME_SHADOW() + ', inset 0 0 0 2px #FDE68A' },
      stripe: 'linear-gradient(90deg, #DC2626 0 30%, #F8FAFC 30% 32%, #1D4ED8 32% 36%, #F8FAFC 36% 38%, #DC2626 38%)',
      accent: '#F87171', text: '#FEF3C7', muted: '#FDE68A',
      well: { background: 'rgba(12,7,4,0.6)', border: '1px solid #7F1D1D' },
      slot: 'rgba(12,7,4,0.92)', slotOn: 'rgba(253,230,138,0.9)',
      button: 'linear-gradient(180deg, #1D4ED8, #1E3A8A)', buttonEdge: '#172554',
    },
  },
  // China: red lacquer, a gold fret round it, a paper lantern hung off the corner
  china: {
    hud: {
      panel: { background: 'radial-gradient(ellipse at 30% 0, rgba(255,255,255,0.15), transparent 55%), linear-gradient(180deg, rgba(185,28,28,0.97), rgba(127,29,29,0.97))', border: '4px solid transparent', borderImage: 'repeating-linear-gradient(90deg, #FACC15 0 2px, #7F1D1D 2px 4px, #FACC15 4px 8px, #7F1D1D 8px 10px) 4', boxShadow: '0 0 0 2px #1C0606, 3px 3px 0 2px rgba(0,0,0,0.6)' },
      deco: <>
        {bit({ right: 10, top: -10, width: 1, height: 3, background: '#FACC15' })}
        {bit({ right: 4, top: -7, width: 13, height: 11, borderRadius: '45%', background: 'repeating-linear-gradient(90deg, #EF4444 0 3px, #B91C1C 3px 4px)', boxShadow: '0 0 0 1px #FACC15, 0 0 6px rgba(239,68,68,0.8)' })}
        {bit({ right: 9, top: 4, width: 3, height: 4, background: '#FACC15' })}
        {tag('GREAT WALL', { background: '#FACC15', color: '#7F1D1D', right: 22, boxShadow: '0 0 0 1px #7F1D1D' })}
      </>,
      label: '#FEF3C7', value: '#FFFFFF', name: '#FDE047',
      track: { background: '#1C0606', borderColor: '#A16207' },
      hp: 'linear-gradient(180deg, #FEF08A, #EAB308 50%, #A16207)',
      slot: { background: 'rgba(28,6,6,0.55)', borderColor: '#FACC15', borderRadius: '50%' },
      cellOn: { border: '#FEF08A', fill: 'linear-gradient(180deg, #FEF9C3, #EAB308)', glow: 'rgba(250,204,21,0.85)' },
      cellOff: { border: '#7F1D1D', fill: 'linear-gradient(180deg, #991B1B, #450A0A)' },
    },
    pause: {
      title: 'FIREWORKS DELAYED', sub: 'THE DRAGON DANCE TAKES FIVE',
      titleStyle: { color: '#FDE047', textShadow: '3px 3px 0 #7F1D1D, 5px 5px 0 #000' },
      frame: { background: 'radial-gradient(ellipse at 30% 0, rgba(255,255,255,0.12), transparent 55%), linear-gradient(180deg, #B91C1C, #7F1D1D)', border: '8px solid transparent', borderImage: 'repeating-linear-gradient(90deg, #FACC15 0 4px, #7F1D1D 4px 8px, #FACC15 8px 16px, #7F1D1D 16px 20px) 8', boxShadow: FRAME_SHADOW('#1C0606') },
      stripe: 'repeating-linear-gradient(90deg, #FACC15 0 4px, #7F1D1D 4px 6px)',
      accent: '#FDE047', text: '#FEF3C7', muted: '#FCA5A5',
      well: { background: 'rgba(28,6,6,0.5)', border: '1px solid #A16207' },
      slot: 'rgba(28,6,6,0.92)', slotOn: 'rgba(250,204,21,0.9)',
      button: 'linear-gradient(180deg, #CA8A04, #854D0E)', buttonEdge: '#422006',
    },
  },
  // Germany: a cuckoo clock's carved walnut, its leaves along the top, the pinecone weights, the flag's bands
  germany: {
    hud: {
      panel: { background: 'radial-gradient(ellipse at 50% 0, rgba(253,230,138,0.12), transparent 60%), repeating-linear-gradient(180deg, rgba(92,51,23,0.97) 0 6px, rgba(80,44,20,0.97) 6px 7px)', border: '3px solid #3B1F0A', borderRadius: '10px 10px 2px 2px', boxShadow: PIXEL_SHADOW + ', inset 0 0 0 1px #A16207' },
      deco: <>
        {bit({ left: 10, right: 30, top: -5, height: 7, background: 'radial-gradient(ellipse 4px 3px at 50% 70%, #3F6212 80%, transparent 85%) 0 0 / 9px 7px repeat-x' })}
        {bit({ right: 8, bottom: -10, width: 3, height: 7, borderRadius: 2, background: 'repeating-linear-gradient(180deg, #78350F 0 1px, #A16207 1px 2px)' })}
        {bit({ right: 16, bottom: -7, width: 3, height: 5, borderRadius: 2, background: 'repeating-linear-gradient(180deg, #78350F 0 1px, #A16207 1px 2px)' })}
        {edge('linear-gradient(180deg, #000 0 33%, #DC2626 33% 66%, #FACC15 66%)', 4)}
        {tag('KUCKUCK!', { background: '#FEF3C7', color: '#3B1F0A', borderRadius: 4, boxShadow: '0 0 0 1px #3B1F0A' })}
      </>,
      label: '#FDE68A', value: '#FFFBEB', name: '#FACC15',
      track: { background: '#1C0F05', borderColor: '#3B1F0A' },
      hp: 'linear-gradient(180deg, #FCA5A5, #DC2626 50%, #7F1D1D)',
      slot: { background: 'radial-gradient(circle, rgba(254,243,199,0.3), rgba(28,15,5,0.6) 70%)', borderColor: '#A16207', borderRadius: '50%' },
      cellOn: { border: '#FEF08A', fill: 'linear-gradient(180deg, #FEF08A, #FACC15)', glow: 'rgba(250,204,21,0.8)' },
      cellOff: { border: '#3B1F0A', fill: 'linear-gradient(180deg, #5C3317, #1C0F05)' },
    },
    pause: {
      title: 'PROST!', sub: 'THE CUCKOO WILL BE RIGHT BACK',
      titleStyle: { color: '#FACC15', textShadow: '3px 3px 0 #DC2626, 5px 5px 0 #000' },
      frame: { background: 'radial-gradient(ellipse at 50% 0, rgba(253,230,138,0.1), transparent 60%), repeating-linear-gradient(180deg, #5C3317 0 12px, #502C14 12px 14px)', border: '6px solid #3B1F0A', borderRadius: '30px 30px 4px 4px', boxShadow: FRAME_SHADOW() + ', inset 0 0 0 2px #A16207' },
      stripe: 'linear-gradient(180deg, #000 0 33%, #DC2626 33% 66%, #FACC15 66%)',
      accent: '#FACC15', text: '#FFFBEB', muted: '#FDE68A',
      well: { background: 'rgba(28,15,5,0.55)', border: '1px solid #A16207' },
      slot: 'rgba(28,15,5,0.92)', slotOn: 'rgba(250,204,21,0.9)',
      button: 'linear-gradient(180deg, #3F6212, #1A2E05)', buttonEdge: '#0C1A02',
    },
  },
  // Italy (Venice): a gondolier's striped shirt for the edge, veined marble, a gilt rim
  italy: {
    hud: {
      panel: { backgroundImage: 'linear-gradient(125deg, transparent 30%, rgba(120,113,108,0.35) 31%, transparent 33%), linear-gradient(60deg, transparent 65%, rgba(120,113,108,0.3) 66%, transparent 67.5%), linear-gradient(180deg, rgba(245,245,244,0.97), rgba(214,211,209,0.97))', border: '3px solid #CA8A04', borderRadius: 4, boxShadow: '0 0 0 2px #1E3A8A, 3px 3px 0 2px rgba(0,0,0,0.55)' },
      deco: <>
        {edge('repeating-linear-gradient(180deg, #1E3A8A 0 3px, #F8FAFC 3px 6px)', 6)}
        {bit({ right: 6, top: -7, width: 22, height: 6, background: 'linear-gradient(90deg, #16A34A 0 33%, #F8FAFC 33% 66%, #DC2626 66%)', boxShadow: '0 0 0 1px #000' })}
        {tag('GONDOLA', { background: '#1E3A8A', color: '#FEF3C7', right: 32, boxShadow: '0 0 0 1px #CA8A04' })}
      </>,
      label: '#1E3A8A', value: '#1C1917', name: '#B91C1C',
      track: { background: '#1C1917', borderColor: '#CA8A04' },
      hp: 'linear-gradient(180deg, #FCA5A5, #DC2626 50%, #991B1B)',
      slot: { background: 'rgba(30,58,138,0.15)', borderColor: '#1E3A8A' },
      cellOn: { border: '#15803D', fill: 'linear-gradient(180deg, #BBF7D0, #16A34A)', glow: 'rgba(22,163,74,0.75)' },
      cellOff: { border: '#A8A29E', fill: 'linear-gradient(180deg, #D6D3D1, #78716C)' },
    },
    pause: {
      title: 'GONDOLA PARKED', sub: 'THE BELL TOWER HAS A PIZZA ON IT. NOBODY KNOWS WHY.',
      titleStyle: { color: '#1E3A8A', textShadow: '2px 2px 0 #FDE68A, 4px 4px 0 #78716C' },
      frame: { backgroundImage: 'linear-gradient(125deg, transparent 30%, rgba(120,113,108,0.3) 30.5%, transparent 31.5%), linear-gradient(60deg, transparent 68%, rgba(120,113,108,0.25) 68.5%, transparent 69.5%), linear-gradient(180deg, #F5F5F4, #D6D3D1)', border: '6px solid #CA8A04', boxShadow: FRAME_SHADOW('#1E3A8A') },
      stripe: 'repeating-linear-gradient(90deg, #1E3A8A 0 8px, #F8FAFC 8px 16px)',
      accent: '#B91C1C', text: '#1C1917', muted: '#57534E',
      well: { background: 'rgba(30,58,138,0.08)', border: '1px solid #CA8A04' },
      slot: 'rgba(28,25,23,0.88)', slotOn: 'rgba(253,230,138,0.95)',
      button: 'linear-gradient(180deg, #16A34A, #15803D)', buttonEdge: '#14532D',
    },
  },
  // Japan: shoji paper in its hinoki frame, a torii's red at the corner, a vending machine's coin slot
  japan: {
    hud: {
      panel: { backgroundImage: 'linear-gradient(90deg, rgba(146,90,48,0.55) 1px, transparent 1px), linear-gradient(0deg, rgba(146,90,48,0.55) 1px, transparent 1px), linear-gradient(180deg, rgba(254,252,240,0.97), rgba(245,238,214,0.97))', backgroundSize: '22px 100%, 100% 14px, auto', border: '3px solid #A16207', boxShadow: PIXEL_SHADOW },
      deco: <>
        {bit({ right: 4, top: -8, width: 22, height: 3, borderRadius: '1px 1px 0 0', background: '#DC2626', boxShadow: '0 0 0 1px #000' })}
        {bit({ right: 6, top: -4, width: 18, height: 2, background: '#DC2626' })}
        {bit({ right: 7, top: -5, width: 2, height: 9, background: '#DC2626' })}
        {bit({ right: 21, top: -5, width: 2, height: 9, background: '#DC2626' })}
        {bit({ right: 8, bottom: 4, width: 14, height: 14, borderRadius: '50%', background: '#DC2626', opacity: 0.85 })}
      </>,
      label: '#7C2D12', value: '#1C1917', name: '#B91C1C',
      track: { background: '#292524', borderColor: '#A16207' },
      hp: 'linear-gradient(180deg, #FCA5A5, #DC2626 50%, #991B1B)',
      slot: { background: 'rgba(255,255,255,0.5)', borderColor: '#A16207' },
      cellOn: { border: '#B91C1C', fill: 'linear-gradient(180deg, #FECACA, #EF4444)', glow: 'rgba(239,68,68,0.7)' },
      cellOff: { border: '#A8A29E', fill: 'linear-gradient(180deg, #D6D3D1, #78716C)' },
    },
    pause: {
      title: 'INSERT COIN', sub: 'THE KOI ARE JUDGING YOU',
      titleStyle: { color: '#DC2626', textShadow: '2px 2px 0 #FEF3C7, 4px 4px 0 #44403C' },
      frame: { backgroundImage: 'linear-gradient(90deg, rgba(146,90,48,0.45) 2px, transparent 2px), linear-gradient(0deg, rgba(146,90,48,0.45) 2px, transparent 2px), linear-gradient(180deg, #FEFCF0, #F5EED6)', backgroundSize: '60px 100%, 100% 40px, auto', border: '8px solid #A16207', boxShadow: FRAME_SHADOW() },
      stripe: 'linear-gradient(90deg, #DC2626, #DC2626)',
      deco: <div className="absolute right-10 top-5 w-[40px] h-[40px] rounded-full" style={{ background: '#DC2626', opacity: 0.85 }} />,
      accent: '#B91C1C', text: '#1C1917', muted: '#78350F',
      well: { background: 'rgba(146,90,48,0.1)', border: '1px solid #A16207' },
      slot: 'rgba(41,37,36,0.88)', slotOn: 'rgba(254,202,202,0.95)',
      button: 'linear-gradient(180deg, #DC2626, #991B1B)', buttonEdge: '#450A0A',
    },
  },
  // Morocco: zellige tile under a horseshoe arch, a brass lantern hung off it
  morocco: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(120,53,15,0.97), rgba(69,26,3,0.97))', border: '3px solid #CA8A04', borderRadius: '24px 24px 3px 3px / 18px 18px 3px 3px', boxShadow: '0 0 0 2px #1C0A00, 3px 3px 0 2px rgba(0,0,0,0.6)' },
      deco: <>
        {bit({ left: 0, right: 0, bottom: 0, height: 6, background: ZELLIGE, opacity: 0.9 })}
        {bit({ right: 6, top: -10, width: 10, height: 12, background: 'radial-gradient(circle at 50% 60%, #FEF3C7 1.5px, #FBBF24 2.5px, transparent 3.5px), linear-gradient(180deg, #CA8A04, #854D0E)', clipPath: 'polygon(50% 0, 80% 25%, 100% 60%, 70% 100%, 30% 100%, 0 60%, 20% 25%)', filter: 'drop-shadow(0 0 3px #FBBF24)' })}
        {tag('BAZAAR', { background: '#0E7490', color: '#FEF3C7', right: 22, borderRadius: '6px 6px 0 0', boxShadow: '0 0 0 1px #CA8A04' })}
      </>,
      label: '#FED7AA', value: '#FFF7ED', name: '#67E8F9',
      track: { background: '#1C0A00', borderColor: '#CA8A04' },
      hp: 'linear-gradient(180deg, #A5F3FC, #0E7490 55%, #164E63)',
      slot: { background: 'rgba(28,10,0,0.55)', borderColor: '#CA8A04', borderRadius: '50% 50% 4px 4px / 40% 40% 4px 4px' },
      cellOn: { border: '#FEF3C7', fill: 'linear-gradient(180deg, #FEF3C7, #FBBF24)', glow: 'rgba(251,191,36,0.85)' },
      cellOff: { border: '#164E63', fill: 'linear-gradient(180deg, #0E7490, #164E63)' },
    },
    pause: {
      title: 'BAZAAR CLOSED', sub: 'EVERYTHING IS NEGOTIABLE EXCEPT THIS',
      titleStyle: { color: '#FBBF24', textShadow: '3px 3px 0 #0E7490, 5px 5px 0 #000' },
      frame: { background: 'linear-gradient(180deg, #78350F, #451A03)', border: '6px solid #CA8A04', borderRadius: '120px 120px 6px 6px / 50px 50px 6px 6px', boxShadow: FRAME_SHADOW('#1C0A00') },
      stripe: ZELLIGE.replace(/8px 8px/g, '12px 12px'),
      accent: '#67E8F9', text: '#FFF7ED', muted: '#FDBA74',
      well: { background: 'rgba(28,10,0,0.5)', border: '1px solid #CA8A04' },
      slot: 'rgba(28,10,0,0.92)', slotOn: 'rgba(251,191,36,0.9)',
      button: 'linear-gradient(180deg, #0E7490, #164E63)', buttonEdge: '#083344',
    },
  },
  // France: Metro green iron, its amber lamp, a cafe awning's stripes across the top
  france: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(20,83,45,0.97), rgba(5,46,22,0.97))', border: '3px solid #4D7C0F', borderRadius: '14px 14px 4px 4px', boxShadow: PIXEL_SHADOW + ', inset 0 0 0 1px #A3E635' },
      deco: <>
        {bit({ left: 8, right: 30, top: -5, height: 7, background: 'repeating-linear-gradient(90deg, #DC2626 0 6px, #F8FAFC 6px 12px)', WebkitMask: 'radial-gradient(circle at 50% 100%, transparent 2.5px, #000 3px) 0 0 / 6px 100%', mask: 'radial-gradient(circle at 50% 100%, transparent 2.5px, #000 3px) 0 0 / 6px 100%' })}
        {bit({ right: 8, top: -9, width: 8, height: 10, borderRadius: '50% 50% 40% 40%', background: 'radial-gradient(circle at 50% 40%, #FEF3C7, #F59E0B 60%, #B45309)', boxShadow: '0 0 6px #FBBF24, 0 0 0 1px #14532D' })}
        {tag('METRO', { background: '#FEF3C7', color: '#14532D', right: 20, fontStyle: 'italic', boxShadow: '0 0 0 1px #14532D' })}
      </>,
      label: '#D9F99D', value: '#FFFFFF', name: '#FCD34D',
      track: { background: '#021A0C', borderColor: '#4D7C0F' },
      hp: 'linear-gradient(180deg, #BFDBFE, #2563EB 50%, #1E3A8A)',
      slot: { background: 'rgba(2,26,12,0.6)', borderColor: '#A3E635', borderRadius: '10px 10px 2px 2px' },
      cellOn: { border: '#FEF3C7', fill: 'linear-gradient(180deg, #FEF3C7, #F59E0B)', glow: 'rgba(251,191,36,0.85)' },
      cellOff: { border: '#14532D', fill: 'linear-gradient(180deg, #166534, #052E16)' },
    },
    pause: {
      title: 'PAUSE CAFE', sub: 'THE WAITER HAS SEEN YOU. HE IS CHOOSING NOT TO.',
      titleStyle: { color: '#FCD34D', fontStyle: 'italic', textShadow: '3px 3px 0 #14532D, 5px 5px 0 #000' },
      frame: { background: 'linear-gradient(180deg, #14532D, #052E16)', border: '6px solid #4D7C0F', borderRadius: '50px 50px 8px 8px', boxShadow: FRAME_SHADOW() + ', inset 0 0 0 2px #A3E635' },
      stripe: 'repeating-linear-gradient(90deg, #1D4ED8 0 12px, #F8FAFC 12px 24px, #DC2626 24px 36px)',
      accent: '#FCD34D', text: '#F0FDF4', muted: '#BEF264',
      well: { background: 'rgba(2,26,12,0.55)', border: '1px solid #4D7C0F' },
      slot: 'rgba(2,26,12,0.92)', slotOn: 'rgba(252,211,77,0.9)',
      button: 'linear-gradient(180deg, #DC2626, #991B1B)', buttonEdge: '#450A0A',
    },
  },
  // The UK: a red phone box: its TELEPHONE header, the window panes, the fog creeping up its foot
  uk: {
    hud: {
      panel: { background: 'radial-gradient(ellipse 80% 40% at 50% 115%, rgba(226,232,240,0.45), transparent), linear-gradient(180deg, rgba(220,38,38,0.97), rgba(153,27,27,0.97))', border: '3px solid #7F1D1D', borderRadius: '8px 8px 2px 2px', boxShadow: PIXEL_SHADOW + ', inset 0 0 0 1px #F87171' },
      deco: <>
        {bit({ left: '50%', top: -7, width: 64, height: 8, marginLeft: -32, background: '#0A0A0A', boxShadow: '0 0 0 1px #7F1D1D' }, <div className="text-center text-[5px] font-black leading-[8px] tracking-wider" style={{ color: '#FAFAFA' }}>TELEPHONE</div>)}
        {bit({ right: 8, bottom: 4, width: 14, height: 14, background: 'linear-gradient(90deg, transparent 6px, #7F1D1D 6px 8px, transparent 8px), linear-gradient(0deg, transparent 6px, #7F1D1D 6px 8px, transparent 8px), rgba(254,243,199,0.55)', boxShadow: '0 0 0 1px #7F1D1D' })}
      </>,
      label: '#FEE2E2', value: '#FFFFFF', name: '#FEF3C7',
      track: { background: '#1C0606', borderColor: '#7F1D1D' },
      hp: 'linear-gradient(180deg, #BFDBFE, #1D4ED8 50%, #1E3A8A)',
      slot: { background: 'rgba(254,243,199,0.25)', borderColor: '#7F1D1D' },
      cellOn: { border: '#FEF3C7', fill: 'linear-gradient(180deg, #FEF9C3, #FACC15)', glow: 'rgba(250,204,21,0.8)' },
      cellOff: { border: '#7F1D1D', fill: 'linear-gradient(180deg, #991B1B, #450A0A)' },
    },
    pause: {
      title: 'MIND THE GAP', sub: 'THE FOG WILL LIFT SHORTLY. IT WILL NOT.',
      titleStyle: { color: '#FAFAFA', textShadow: '3px 3px 0 #1D4ED8, 5px 5px 0 #000' },
      frame: { background: 'radial-gradient(ellipse 80% 30% at 50% 110%, rgba(226,232,240,0.35), transparent), linear-gradient(180deg, #DC2626, #991B1B)', border: '6px solid #7F1D1D', borderRadius: '16px 16px 4px 4px', boxShadow: FRAME_SHADOW() + ', inset 0 0 0 2px #F87171' },
      stripe: 'linear-gradient(90deg, #0A0A0A, #0A0A0A)',
      deco: <div className="absolute left-1/2 -translate-x-1/2 top-[1px] text-[6px] font-black tracking-[4px]" style={{ color: '#FAFAFA' }}>TELEPHONE</div>,
      accent: '#FEF3C7', text: '#FEF2F2', muted: '#FECACA',
      well: { background: 'rgba(28,6,6,0.5)', border: '1px solid #7F1D1D' },
      slot: 'rgba(28,6,6,0.92)', slotOn: 'rgba(254,243,199,0.95)',
      button: 'linear-gradient(180deg, #1D4ED8, #1E3A8A)', buttonEdge: '#172554',
    },
  },
  // Canada: buffalo plaid flannel, a maple leaf pinned on, a lumber camp's split-log edge
  canada: {
    hud: {
      panel: { background: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.42) 0 9px, transparent 9px 18px), repeating-linear-gradient(0deg, rgba(0,0,0,0.42) 0 9px, transparent 9px 18px), linear-gradient(180deg, rgba(185,28,28,0.97), rgba(153,27,27,0.97))', border: '3px solid #422006', boxShadow: PIXEL_SHADOW },
      deco: <>
        {edge('repeating-linear-gradient(180deg, #A16207 0 6px, #78350F 6px 7px)', 6)}
        {bit({ right: 4, top: -9, width: 18, height: 18, background: '#DC2626', clipPath: MAPLE, filter: 'drop-shadow(0 0 0.5px #FFF) drop-shadow(1px 1px 0 #000)' })}
        {tag('SORRY', { background: '#FAFAFA', color: '#B91C1C', right: 26, boxShadow: '0 0 0 1px #000' })}
      </>,
      label: '#FFFFFF', value: '#FFFFFF', name: '#FDE68A',
      track: { background: '#1C0606', borderColor: '#422006' },
      hp: 'linear-gradient(180deg, #FAFAFA, #E5E7EB 50%, #9CA3AF)',
      slot: { background: 'rgba(28,6,6,0.65)', borderColor: '#FAFAFA' },
      cellOn: { border: '#FAFAFA', fill: 'linear-gradient(180deg, #FEF3C7, #F59E0B)', glow: 'rgba(245,158,11,0.8)' },
      cellOff: { border: '#422006', fill: 'linear-gradient(180deg, #78350F, #422006)' },
    },
    pause: {
      title: 'SORRY!', sub: 'THE LUMBER CAMP IS ON BREAK. SORRY. SORRY ABOUT THAT.',
      titleStyle: { color: '#FAFAFA', textShadow: '3px 3px 0 #7F1D1D, 5px 5px 0 #000' },
      frame: { background: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.38) 0 20px, transparent 20px 40px), repeating-linear-gradient(0deg, rgba(0,0,0,0.38) 0 20px, transparent 20px 40px), linear-gradient(180deg, #B91C1C, #991B1B)', border: '6px solid #422006', boxShadow: FRAME_SHADOW() },
      stripe: 'linear-gradient(90deg, #DC2626 0 25%, #FAFAFA 25% 75%, #DC2626 75%)',
      deco: bit({ right: 16, top: 10, width: 40, height: 40, background: '#DC2626', clipPath: MAPLE, filter: 'drop-shadow(0 0 1px #FFF)' }),
      accent: '#FDE68A', text: '#FFFFFF', muted: '#FECACA',
      well: { background: 'rgba(28,6,6,0.7)', border: '1px solid #422006' },
      slot: 'rgba(28,6,6,0.94)', slotOn: 'rgba(254,243,199,0.95)',
      button: 'linear-gradient(180deg, #78350F, #422006)', buttonEdge: '#1C0A00',
    },
  },
  // The helicopter: tour-chopper yellow and black, a gauge's needle, rivets
  heli: {
    hud: {
      panel: { background: 'radial-gradient(ellipse at 20% 0, rgba(255,255,255,0.3), transparent 50%), linear-gradient(180deg, rgba(250,204,21,0.97), rgba(202,138,4,0.97))', border: '3px solid #18181B', borderRadius: 6, boxShadow: '0 0 0 2px #FACC15, 3px 3px 0 2px rgba(0,0,0,0.6)' },
      deco: <>
        {rivets('#3F3F46', 3)}
        {edge('repeating-linear-gradient(135deg, #18181B 0 4px, #FACC15 4px 8px)', 6)}
        {bit({ right: 6, top: -9, width: 16, height: 16, borderRadius: '50%', background: 'conic-gradient(from 220deg, #DC2626 0 40deg, #18181B 0 60deg, transparent 0)', backgroundColor: '#F4F4F5', boxShadow: '0 0 0 2px #18181B' }, bit({ left: 7, top: 2, width: 2, height: 6, background: '#DC2626', transformOrigin: '50% 100%', transform: 'rotate(50deg)' }))}
        {tag('TOURS', { background: '#18181B', color: '#FACC15', right: 26, boxShadow: '0 0 0 1px #FACC15' })}
      </>,
      label: '#18181B', value: '#0A0A0A', name: '#7F1D1D',
      track: { background: '#18181B', borderColor: '#18181B' },
      hp: 'linear-gradient(180deg, #86EFAC, #22C55E 50%, #15803D)',
      slot: { background: 'rgba(24,24,27,0.85)', borderColor: '#18181B', borderRadius: '50%' },
      cellOn: { border: '#18181B', fill: 'linear-gradient(180deg, #FCA5A5, #DC2626)', glow: 'rgba(220,38,38,0.8)' },
      cellOff: { border: '#18181B', fill: 'linear-gradient(180deg, #52525B, #18181B)' },
    },
    pause: {
      title: 'HOVERING', sub: 'HARRY SAYS KEEP YOUR HANDS OFF THE STICK',
      titleStyle: { color: '#18181B', textShadow: '2px 2px 0 #FEF08A, 4px 4px 0 #78350F' },
      frame: { background: 'radial-gradient(ellipse at 20% 0, rgba(255,255,255,0.25), transparent 50%), linear-gradient(180deg, #FACC15, #CA8A04)', border: '5px solid #18181B', borderRadius: 10, boxShadow: FRAME_SHADOW('#FACC15') },
      stripe: 'repeating-linear-gradient(135deg, #18181B 0 10px, #FACC15 10px 20px)',
      deco: rivets('#3F3F46', 10),
      accent: '#7F1D1D', text: '#0A0A0A', muted: '#422006',
      well: { background: 'rgba(24,24,27,0.15)', border: '1px solid #18181B' },
      slot: 'rgba(24,24,27,0.9)', slotOn: 'rgba(254,240,138,0.95)',
      button: 'linear-gradient(180deg, #27272A, #09090B)', buttonEdge: '#000',
    },
  },
  // Harry's arena: his tie-dye under a red headband, the crash's smoke
  harry: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.6)), ' + TIE_DYE, border: '2px solid #FAFAFA', borderRadius: 4, boxShadow: PIXEL_SHADOW },
      deco: <>
        {topBand('linear-gradient(180deg, #EF4444, #B91C1C)', 4)}
        {bit({ right: -6, top: 1, width: 12, height: 3, background: '#B91C1C', transform: 'rotate(30deg)', transformOrigin: '0 50%' })}
        {bit({ right: -8, top: 1, width: 10, height: 3, background: '#DC2626', transform: 'rotate(55deg)', transformOrigin: '0 50%' })}
        {tag('PEACE', { background: '#FAFAFA', color: '#7E22CE', right: 14, borderRadius: 6, boxShadow: '0 0 0 1px #000' })}
      </>,
      label: '#FFFFFF', value: '#FFFFFF', name: '#FDE047',
      track: { background: '#0A0A0A', borderColor: '#FAFAFA' },
      hp: 'linear-gradient(90deg, #EC4899, #F97316, #FACC15, #22C55E, #3B82F6, #A855F7)',
      slot: { background: 'rgba(0,0,0,0.55)', borderColor: '#FAFAFA' },
      cellOn: { border: '#FAFAFA', fill: 'linear-gradient(90deg, #22C55E, #3B82F6, #A855F7)', glow: 'rgba(168,85,247,0.85)' },
      cellOff: { border: '#52525B', fill: 'linear-gradient(180deg, #3F3F46, #18181B)' },
    },
    pause: {
      title: 'FAR OUT', sub: 'HARRY IS FINDING HIMSELF. AND HIS ROCKETS.',
      titleStyle: { color: '#FDE047', textShadow: '3px 3px 0 #B91C1C, 5px 5px 0 #000' },
      frame: { background: 'linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.7)), ' + TIE_DYE.replace(/(\d+)px/g, (_, n) => `${Number(n) * 3}px`), border: '4px solid #FAFAFA', boxShadow: FRAME_SHADOW() },
      stripe: 'linear-gradient(180deg, #EF4444, #B91C1C)',
      accent: '#FDE047', text: '#FFFFFF', muted: '#E9D5FF',
      well: { background: 'rgba(0,0,0,0.6)', border: '1px solid #A1A1AA' },
      slot: 'rgba(0,0,0,0.9)', slotOn: 'rgba(253,224,71,0.9)',
      button: 'linear-gradient(180deg, #DC2626, #7F1D1D)', buttonEdge: '#450A0A',
    },
  },
};
