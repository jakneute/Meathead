// Hollywood Land's HUD and pause menu, a look per stretch of it: a Walk of Fame star (pink terrazzo, brass rim) on the
// boulevard, gold-trimmed porcelain on THRONES OF THE STARS, a green screen with its tracking marks in the warehouse, a
// call sheet on the backlot, DISASTER: THE RIDE's cheap fiberglass placard, the emergency broadcast's red over black in
// the havoc, and checkered flags and flame decals on Stuntman Steve's stunt stage.

import React from 'react';
import type { Theme } from '../hudThemes';
import { edge, tag, bit, word, PIXEL_SHADOW, FRAME_SHADOW } from '../hudKit';

export type HollywoodZone = 'hollywood' | 'coaster' | 'warehouse' | 'lot' | 'disaster' | 'havoc' | 'stunt';

/** A five-pointed star. */
const star = (size: number, col: string, style: React.CSSProperties) => bit({ width: size, height: size, background: col, clipPath: 'polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', ...style });
/** A tracking mark (a little plus). */
const mark = (style: React.CSSProperties) => bit({ width: 6, height: 6, background: 'linear-gradient(#FFF, #FFF) 50% 0 / 1px 100% no-repeat, linear-gradient(#FFF, #FFF) 0 50% / 100% 1px no-repeat', ...style });
/** Flame licks, pointing right. */
const FLAMES = 'radial-gradient(ellipse 10px 3px at 0 50%, #FDE047 55%, transparent 60%) 0 0 / 14px 6px repeat-y, radial-gradient(ellipse 14px 4px at 0 50%, #F97316 55%, transparent 60%) 0 3px / 18px 6px repeat-y';

export const HOLLYWOOD_THEMES: Record<HollywoodZone, Theme> = {
  // The boulevard: a Walk of Fame star: pink terrazzo, a brass rim, the star in the corner
  hollywood: {
    hud: {
      panel: { backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.35) 0.6px, transparent 1px), radial-gradient(circle, rgba(0,0,0,0.25) 0.6px, transparent 1px), linear-gradient(180deg, rgba(190,24,93,0.96), rgba(131,24,67,0.96))', backgroundSize: '5px 5px, 7px 7px, auto', backgroundPosition: '0 0, 2px 3px, 0 0', border: '3px solid #D4A017', boxShadow: '0 0 0 2px #1C1917, 3px 3px 0 2px rgba(0,0,0,0.6), inset 0 0 0 1px #FDE68A' },
      deco: <>
        {star(22, 'linear-gradient(135deg, #FEF9C3, #EAB308 50%, #A16207)', { right: -8, top: -10, filter: 'drop-shadow(1px 1px 0 #000)' })}
        {edge('linear-gradient(180deg, #3F3F46, #18181B)', 4)}
        {word('MEATHEAD', { right: 18, bottom: 4, color: '#FDE68A', letterSpacing: 1, textShadow: '1px 1px 0 #500724' })}
      </>,
      label: '#FCE7F3', value: '#FFFFFF', name: '#FDE047',
      track: { background: '#1C0A12', borderColor: '#A16207' },
      hp: 'linear-gradient(180deg, #FEF9C3, #EAB308 50%, #A16207)',
      slot: { background: 'rgba(28,10,18,0.55)', borderColor: '#D4A017' },
      cellOn: { border: '#FEF08A', fill: 'linear-gradient(180deg, #FEF9C3, #EAB308)', glow: 'rgba(250,204,21,0.85)' },
      cellOff: { border: '#831843', fill: 'linear-gradient(180deg, #9D174D, #500724)' },
    },
    pause: {
      title: 'CUT!', sub: "WE'LL FIX IT IN POST",
      titleStyle: { color: '#FDE047', textShadow: '3px 3px 0 #831843, 5px 5px 0 #000' },
      frame: { backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1.5px), radial-gradient(circle, rgba(0,0,0,0.2) 1px, transparent 1.5px), linear-gradient(180deg, #BE185D, #831843)', backgroundSize: '9px 9px, 13px 13px, auto', border: '6px solid #D4A017', boxShadow: FRAME_SHADOW('#1C1917') + ', inset 0 0 0 2px #FDE68A' },
      stripe: 'repeating-linear-gradient(135deg, #FAFAFA 0 8px, #18181B 8px 16px)',
      deco: star(46, 'linear-gradient(135deg, #FEF9C3, #EAB308 50%, #A16207)', { right: 10, top: -14, filter: 'drop-shadow(2px 2px 0 #000)' }),
      accent: '#FDE047', text: '#FDF2F8', muted: '#F9A8D4',
      well: { background: 'rgba(28,10,18,0.5)', border: '1px solid #D4A017' },
      slot: 'rgba(28,10,18,0.9)', slotOn: 'rgba(250,204,21,0.9)',
      button: 'linear-gradient(180deg, #CA8A04, #854D0E)', buttonEdge: '#422006',
    },
  },
  // THRONES OF THE STARS: glazed porcelain and gold trim, a flush handle, the seat's crown
  coaster: {
    hud: {
      panel: { background: 'radial-gradient(ellipse at 25% 0, rgba(255,255,255,0.9), transparent 55%), linear-gradient(180deg, rgba(248,250,252,0.97), rgba(203,213,225,0.97))', border: '3px solid #D4A017', borderRadius: '6px 6px 16px 16px', boxShadow: '0 0 0 2px #422006, 3px 3px 0 2px rgba(0,0,0,0.55)' },
      deco: <>
        {bit({ right: 4, top: 8, width: 10, height: 3, borderRadius: 2, background: 'linear-gradient(180deg, #FEF9C3, #CA8A04)', boxShadow: '0 0 0 1px #713F12' })}
        {bit({ right: 12, top: 6, width: 4, height: 7, borderRadius: 2, background: '#A16207' })}
        {bit({ right: 10, top: -9, width: 16, height: 8, background: 'linear-gradient(180deg, #FEF08A, #CA8A04)', clipPath: 'polygon(0 100%, 0 20%, 25% 60%, 50% 0, 75% 60%, 100% 20%, 100% 100%)' })}
        {edge('repeating-linear-gradient(180deg, #D4A017 0 2px, #F1F5F9 2px 6px)', 3)}
        {tag('OCCUPIED', { background: '#DC2626', color: '#FFF', right: 30, borderRadius: 2, boxShadow: '0 0 0 1px #7F1D1D' })}
      </>,
      label: '#713F12', value: '#1E293B', name: '#A16207',
      track: { background: '#1E293B', borderColor: '#A16207' },
      hp: 'linear-gradient(180deg, #FEF9C3, #EAB308 50%, #A16207)',
      slot: { background: 'radial-gradient(ellipse, rgba(125,211,252,0.35), rgba(241,245,249,0.6) 70%)', borderColor: '#D4A017', borderRadius: '50%' },
      cellOn: { border: '#A16207', fill: 'linear-gradient(180deg, #FEF9C3, #EAB308)', glow: 'rgba(234,179,8,0.7)' },
      cellOff: { border: '#94A3B8', fill: 'linear-gradient(180deg, #CBD5E1, #64748B)' },
    },
    pause: {
      title: 'BE RIGHT OUT', sub: 'PLEASE KEEP YOUR SEAT DOWN UNTIL THE RIDE COMES TO A COMPLETE STOP',
      titleStyle: { color: '#A16207', textShadow: '2px 2px 0 #FEF9C3, 4px 4px 0 #422006' },
      frame: { background: 'radial-gradient(ellipse at 25% 0, rgba(255,255,255,0.9), transparent 55%), linear-gradient(180deg, #F8FAFC, #CBD5E1)', border: '6px solid #D4A017', borderRadius: '12px 12px 40px 40px', boxShadow: FRAME_SHADOW('#422006') },
      stripe: 'repeating-linear-gradient(90deg, #D4A017 0 3px, #FEF9C3 3px 6px)',
      deco: <div className="absolute right-6 top-3 text-[7px] font-black px-2 py-1" style={{ background: '#DC2626', color: '#FFF', boxShadow: '2px 2px 0 rgba(0,0,0,0.4)' }}>OCCUPIED</div>,
      accent: '#A16207', text: '#0F172A', muted: '#475569',
      well: { background: 'rgba(148,163,184,0.18)', border: '1px solid #D4A017' },
      slot: 'rgba(30,41,59,0.88)', slotOn: 'rgba(253,224,71,0.95)',
      button: 'linear-gradient(180deg, #CA8A04, #854D0E)', buttonEdge: '#422006',
    },
  },
  // The secret warehouse: chroma green with tracking marks, gaffer-taped edges, a slate's corner
  warehouse: {
    hud: {
      panel: { background: 'radial-gradient(ellipse at 50% 0, rgba(255,255,255,0.18), transparent 60%), linear-gradient(180deg, rgba(34,197,94,0.96), rgba(22,163,74,0.96))', border: '2px solid #14532D', boxShadow: PIXEL_SHADOW },
      deco: <>
        {mark({ left: 10, top: 4 })}{mark({ right: 34, top: 4 })}{mark({ left: 10, bottom: 4 })}{mark({ right: 34, bottom: 4 })}
        {bit({ left: -3, top: -3, width: 16, height: 5, background: '#3F3F46', transform: 'rotate(-35deg)' })}
        {bit({ right: 2, top: -8, width: 22, height: 7, background: 'repeating-linear-gradient(135deg, #FAFAFA 0 4px, #18181B 4px 8px)', boxShadow: '0 0 0 1px #000', transform: 'rotate(-8deg)', transformOrigin: '100% 100%' })}
      </>,
      label: '#052E16', value: '#FFFFFF', name: '#FFFFFF',
      track: { background: '#052E16', borderColor: '#14532D' },
      hp: 'linear-gradient(180deg, #FCE7F3, #EC4899 50%, #9D174D)',
      slot: { background: 'rgba(5,46,22,0.45)', borderColor: '#FFFFFF' },
      cellOn: { border: '#FFFFFF', fill: 'linear-gradient(180deg, #FCE7F3, #EC4899)', glow: 'rgba(236,72,153,0.85)' },
      cellOff: { border: '#14532D', fill: 'linear-gradient(180deg, #15803D, #052E16)' },
    },
    pause: {
      title: 'RESET', sub: 'BACK TO ONE, EVERYBODY',
      titleStyle: { color: '#FFFFFF', textShadow: '3px 3px 0 #14532D, 5px 5px 0 #000' },
      frame: { background: 'radial-gradient(ellipse at 50% 0, rgba(255,255,255,0.15), transparent 60%), linear-gradient(180deg, #22C55E, #15803D)', border: '4px solid #14532D', boxShadow: FRAME_SHADOW() },
      stripe: 'repeating-linear-gradient(135deg, #FAFAFA 0 10px, #18181B 10px 20px)',
      deco: <>{mark({ left: 14, top: 14, transform: 'scale(2)' })}{mark({ right: 14, top: 14, transform: 'scale(2)' })}{mark({ left: 14, bottom: 14, transform: 'scale(2)' })}{mark({ right: 14, bottom: 14, transform: 'scale(2)' })}</>,
      accent: '#FFFFFF', text: '#F0FDF4', muted: '#DCFCE7',
      well: { background: 'rgba(5,46,22,0.45)', border: '1px solid #14532D' },
      slot: 'rgba(5,46,22,0.9)', slotOn: 'rgba(244,114,182,0.95)',
      button: 'linear-gradient(180deg, #EC4899, #9D174D)', buttonEdge: '#500724',
    },
  },
  // The backlot: a call sheet on a clipboard (the clip, the ruled lines, the scene number)
  lot: {
    hud: {
      panel: { backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 9px, rgba(59,130,246,0.25) 9px 10px), linear-gradient(90deg, transparent 22px, rgba(239,68,68,0.4) 22px 23px, transparent 23px), linear-gradient(180deg, rgba(254,252,232,0.97), rgba(245,240,210,0.97))', border: '4px solid #A16207', borderRadius: 4, boxShadow: PIXEL_SHADOW },
      deco: <>
        {bit({ left: '50%', top: -7, width: 30, height: 9, marginLeft: -15, borderRadius: '3px 3px 1px 1px', background: 'linear-gradient(180deg, #E4E4E7, #71717A)', boxShadow: '0 0 0 1px #000' })}
        {tag('SCENE 4  TAKE 37', { background: '#FAFAFA', color: '#18181B', top: 'auto', bottom: 3, right: 4, fontFamily: 'monospace', boxShadow: '0 0 0 1px #A1A1AA' })}
      </>,
      label: '#1E3A8A', value: '#18181B', name: '#B91C1C',
      track: { background: '#27272A', borderColor: '#A16207' },
      hp: 'linear-gradient(180deg, #93C5FD, #2563EB 50%, #1E3A8A)',
      slot: { background: 'rgba(255,255,255,0.5)', borderColor: '#A16207' },
      cellOn: { border: '#1E3A8A', fill: 'linear-gradient(180deg, #BFDBFE, #3B82F6)', glow: 'rgba(59,130,246,0.7)' },
      cellOff: { border: '#A1A1AA', fill: 'linear-gradient(180deg, #D4D4D8, #71717A)' },
    },
    pause: {
      title: 'LUNCH', sub: 'CRAFT SERVICES IS OUT OF EVERYTHING BUT CELERY',
      titleStyle: { color: '#1E3A8A', textShadow: '2px 2px 0 #FDE68A, 4px 4px 0 #78350F' },
      frame: { backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 15px, rgba(59,130,246,0.2) 15px 16px), linear-gradient(90deg, transparent 40px, rgba(239,68,68,0.35) 40px 41px, transparent 41px), linear-gradient(180deg, #FEFCE8, #F5F0D2)', border: '8px solid #A16207', borderRadius: 8, boxShadow: FRAME_SHADOW() },
      stripe: 'linear-gradient(180deg, #E4E4E7, #71717A)',
      accent: '#B91C1C', text: '#18181B', muted: '#52525B',
      well: { background: 'rgba(161,98,7,0.1)', border: '1px solid #A16207' },
      slot: 'rgba(24,24,27,0.88)', slotOn: 'rgba(147,197,253,0.95)',
      button: 'linear-gradient(180deg, #2563EB, #1E3A8A)', buttonEdge: '#172554',
    },
  },
  // DISASTER: THE RIDE: a cheap fiberglass placard: cracked orange letters on brown, a shaky little lightning bolt
  disaster: {
    hud: {
      panel: { backgroundImage: 'linear-gradient(120deg, transparent 58%, rgba(0,0,0,0.4) 58.5%, transparent 59.5%), linear-gradient(180deg, rgba(120,53,15,0.97), rgba(69,26,3,0.97))', border: '3px solid #EA580C', borderRadius: '10px 2px 10px 2px', boxShadow: '0 0 0 2px #1C0A00, 3px 3px 0 2px rgba(0,0,0,0.6)' },
      deco: <>
        {bit({ right: 6, top: -9, width: 10, height: 16, background: '#FACC15', clipPath: 'polygon(40% 0, 100% 0, 60% 40%, 90% 40%, 20% 100%, 40% 55%, 10% 55%)', filter: 'drop-shadow(1px 1px 0 #000)' })}
        {edge('repeating-linear-gradient(180deg, #EA580C 0 3px, #78350F 3px 6px)', 3)}
        {tag('DISASTER: THE RIDE', { background: '#EA580C', color: '#FEF3C7', right: 20, fontStyle: 'italic', transform: 'rotate(-3deg)', boxShadow: '0 0 0 1px #1C0A00' })}
      </>,
      label: '#FED7AA', value: '#FFF7ED', name: '#FACC15',
      track: { background: '#1C0A00', borderColor: '#7C2D12' },
      hp: 'linear-gradient(180deg, #FED7AA, #EA580C 50%, #9A3412)',
      slot: { background: 'rgba(28,10,0,0.55)', borderColor: '#EA580C', borderRadius: '8px 2px 8px 2px' },
      cellOn: { border: '#FEF08A', fill: 'linear-gradient(180deg, #FEF08A, #FACC15)', glow: 'rgba(250,204,21,0.8)' },
      cellOff: { border: '#7C2D12', fill: 'linear-gradient(180deg, #9A3412, #431407)' },
    },
    pause: {
      title: 'TECH DIFFICULTIES', sub: 'THE DISASTER WILL RESUME SHORTLY. PLEASE ACT SCARED.',
      titleStyle: { color: '#FACC15', fontStyle: 'italic', textShadow: '3px 3px 0 #9A3412, 5px 5px 0 #000' },
      frame: { backgroundImage: 'linear-gradient(120deg, transparent 62%, rgba(0,0,0,0.35) 62.3%, transparent 62.8%), linear-gradient(180deg, #78350F, #451A03)', border: '5px solid #EA580C', borderRadius: '24px 4px 24px 4px', boxShadow: FRAME_SHADOW('#1C0A00') },
      stripe: 'repeating-linear-gradient(90deg, #EA580C 0 12px, #FACC15 12px 16px)',
      accent: '#FACC15', text: '#FFF7ED', muted: '#FDBA74',
      well: { background: 'rgba(28,10,0,0.5)', border: '1px solid #9A3412' },
      slot: 'rgba(28,10,0,0.92)', slotOn: 'rgba(250,204,21,0.9)',
      button: 'linear-gradient(180deg, #EA580C, #9A3412)', buttonEdge: '#431407',
    },
  },
  // Every disaster at once: the emergency broadcast: red over black, the warning crawl, a siren light
  havoc: {
    hud: {
      panel: { backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px), linear-gradient(180deg, rgba(10,10,10,0.97) 0 70%, rgba(153,27,27,0.97) 70%)', border: '2px solid #DC2626', boxShadow: '0 0 0 2px #000, 3px 3px 0 2px rgba(0,0,0,0.6), 0 0 8px rgba(220,38,38,0.6)' },
      deco: <>
        {bit({ right: 6, top: -8, width: 10, height: 8, borderRadius: '5px 5px 0 0', background: 'radial-gradient(circle at 50% 70%, #FECACA, #DC2626 60%)', boxShadow: '0 0 8px #EF4444' })}
        {bit({ right: 4, top: -1, width: 14, height: 2, background: '#52525B' })}
        {edge('repeating-linear-gradient(180deg, #DC2626 0 4px, #0A0A0A 4px 8px)', 4)}
        {tag('EMERGENCY ALERT', { background: '#FAFAFA', color: '#B91C1C', right: 22, boxShadow: '0 0 0 1px #000' })}
      </>,
      label: '#FECACA', value: '#FFFFFF', name: '#FDE047',
      track: { background: '#000', borderColor: '#7F1D1D' },
      hp: 'repeating-linear-gradient(90deg, #EF4444 0 6px, #991B1B 6px 7px)',
      slot: { background: 'rgba(0,0,0,0.7)', borderColor: '#DC2626' },
      cellOn: { border: '#FDE047', fill: 'linear-gradient(180deg, #FEF08A, #FACC15)', glow: 'rgba(250,204,21,0.85)' },
      cellOff: { border: '#7F1D1D', fill: 'linear-gradient(180deg, #991B1B, #450A0A)' },
    },
    pause: {
      title: 'SHELTER IN PLACE', sub: 'THIS IS NOT A TEST. THIS IS NOT A RIDE ANYMORE.',
      titleStyle: { color: '#FAFAFA', textShadow: '3px 3px 0 #B91C1C, 5px 5px 0 #000' },
      frame: { backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 3px), linear-gradient(180deg, #0A0A0A 0 82%, #991B1B 82%)', border: '4px solid #DC2626', boxShadow: FRAME_SHADOW('#000', 'rgba(220,38,38,0.35)') },
      stripe: 'repeating-linear-gradient(90deg, #DC2626 0 20px, #FAFAFA 20px 24px)',
      accent: '#F87171', text: '#FAFAFA', muted: '#FCA5A5',
      well: { background: 'rgba(0,0,0,0.65)', border: '1px solid #7F1D1D' },
      slot: 'rgba(0,0,0,0.92)', slotOn: 'rgba(250,204,21,0.9)',
      button: 'linear-gradient(180deg, #DC2626, #7F1D1D)', buttonEdge: '#450A0A',
    },
  },
  // Stuntman Steve's stunt stage: checkered flag, flame decals down the side, chrome
  stunt: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(30,64,175,0.96), rgba(23,37,84,0.96))', border: '3px solid #E5E7EB', borderRadius: 6, boxShadow: '0 0 0 2px #000, 3px 3px 0 2px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.5)' },
      deco: <>
        {bit({ left: 0, top: 0, bottom: 0, width: 20, background: FLAMES, opacity: 0.95 })}
        {bit({ right: 4, top: -8, width: 20, height: 10, backgroundImage: 'conic-gradient(#FAFAFA 0 25%, #18181B 0 50%, #FAFAFA 0 75%, #18181B 0)', backgroundSize: '5px 5px', boxShadow: '0 0 0 1px #000', transform: 'skewX(-12deg)' })}
        {tag('STUNTERY', { background: '#DC2626', color: '#FDE047', right: 28, fontStyle: 'italic', boxShadow: '0 0 0 1px #000' })}
      </>,
      label: '#BFDBFE', value: '#FFFFFF', name: '#FDE047',
      track: { background: '#0B1024', borderColor: '#9CA3AF' },
      hp: 'linear-gradient(180deg, #FEF08A, #F97316 50%, #DC2626)',
      slot: { background: 'rgba(11,16,36,0.65)', borderColor: '#E5E7EB' },
      cellOn: { border: '#FDE047', fill: 'linear-gradient(180deg, #FEF08A, #F97316)', glow: 'rgba(249,115,22,0.85)' },
      cellOff: { border: '#475569', fill: 'linear-gradient(180deg, #475569, #1E293B)' },
    },
    pause: {
      title: 'STUNT DOUBLE', sub: 'STEVE IS STRETCHING. STEVE IS ALWAYS STRETCHING.',
      titleStyle: { color: '#FDE047', fontStyle: 'italic', textShadow: '3px 3px 0 #DC2626, 5px 5px 0 #000' },
      frame: { background: 'linear-gradient(180deg, #1E40AF, #172554)', border: '5px solid #E5E7EB', borderRadius: 10, boxShadow: FRAME_SHADOW() },
      stripe: 'conic-gradient(#FAFAFA 0 25%, #18181B 0 50%, #FAFAFA 0 75%, #18181B 0) 0 0 / 6px 6px',
      deco: bit({ left: 0, top: 30, bottom: 30, width: 50, background: FLAMES.replace(/14px 6px/g, '28px 12px').replace(/18px 6px/g, '36px 12px').replace(/0 3px/g, '0 6px'), opacity: 0.6 }),
      accent: '#FDE047', text: '#EFF6FF', muted: '#93C5FD',
      well: { background: 'rgba(11,16,36,0.6)', border: '1px solid #9CA3AF' },
      slot: 'rgba(11,16,36,0.92)', slotOn: 'rgba(253,224,71,0.95)',
      button: 'linear-gradient(180deg, #DC2626, #991B1B)', buttonEdge: '#450A0A',
    },
  },
};
