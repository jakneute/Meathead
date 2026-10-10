// The HUD and the pause menu, done up for wherever he is: a parking stub in the garage, a visitor badge through
// security, stars and stripes down America USA, a ticket in the line, a brochure at the hub, a timecard in the staff
// room; and in Adventure Land, a bamboo sign in the jungle, a wait-time board in the queue, a tour-boat placard on the
// river and a brass porthole under it, a control terminal in the dino park, carved (fiberglass) stone in the temple,
// timber in the mine, and camo out in the clearing. Same layout everywhere (and clear of the HUD zone): just the look.

import React from 'react';
import type { HudSkin } from '../m1/components/HUD';

export type Zone =
  | 'garage' | 'security' | 'america' | 'ticket' | 'hub' | 'staff'
  | 'jungle' | 'queue' | 'boat' | 'underwater' | 'dino' | 'temple' | 'cart' | 'roof' | 'clearing'
  | 'spooky';

/** How the pause menu looks. */
export interface PauseSkin {
  title: string;
  /** A line under the title. */
  sub?: string;
  titleStyle: React.CSSProperties;
  frame: React.CSSProperties;
  /** The band along the top of it. */
  stripe: string;
  /** Drawn over it (corners, stickers). */
  deco?: React.ReactNode;
  /** The colored words (where a weapon's from, section heads); the words to read; the quiet ones. */
  accent: string; text: string; muted: string;
  /** The wells (the arsenal, the weapon up close, how it's worked). */
  well: React.CSSProperties;
  /** A weapon's slot, and the one picked out. */
  slot: string; slotOn: string;
  /** The buttons. */
  button: string; buttonEdge: string;
}

export interface Theme { hud: HudSkin; pause: PauseSkin }

/** A strip down the plate's left edge. */
const edge = (background: string, w = 4) => <div className="absolute left-0 top-0 bottom-0" style={{ width: w, background }} />;
/** A little label stuck on (a sticker, a stamp), at the plate's corner. */
const tag = (text: string, style: React.CSSProperties) => (
  <div className="absolute text-[5px] font-black px-[3px] py-[1px] whitespace-nowrap" style={{ right: 4, top: -6, ...style }}>{text}</div>
);
/** Rivets in the four corners. */
const rivets = (col: string, inset = 3) => (
  <>{[[inset, inset], [inset, -1], [-1, inset], [-1, -1]].map(([l, t], i) => (
    <div key={i} className="absolute w-[4px] h-[4px] rounded-full" style={{ background: col, boxShadow: 'inset -1px -1px 0 rgba(0,0,0,0.5)', left: l >= 0 ? l : undefined, right: l < 0 ? inset : undefined, top: t >= 0 ? t : undefined, bottom: t < 0 ? inset : undefined }} />
  ))}</>
);
const PIXEL_SHADOW = '0 0 0 2px #000, 3px 3px 0 2px rgba(0,0,0,0.6)';

export const THEMES: Record<Zone, Theme> = {
  // The parking garage: a concrete pillar, the curb paint, the level marker
  garage: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(120,120,116,0.94), rgba(82,82,78,0.94))', border: '2px solid #A8A29E', boxShadow: PIXEL_SHADOW },
      deco: <>{edge('repeating-linear-gradient(180deg, #FACC15 0 6px, #1C1917 6px 12px)', 5)}
        <div className="absolute right-[6px] bottom-[6px] w-[16px] h-[16px] rounded-full flex items-center justify-center text-[7px] font-black text-white" style={{ background: '#1D4ED8', boxShadow: '0 0 0 1px #fff' }}>P</div></>,
      label: '#F5F5F4', value: '#FFFFFF', name: '#FDE047',
      slot: { background: 'rgba(28,25,23,0.6)', borderColor: '#FACC15' },
    },
    pause: {
      title: 'PARKED', sub: 'LEVEL P2 · REMEMBER WHERE YOU PARKED',
      titleStyle: { color: '#FDE047', textShadow: '3px 3px 0 #1C1917' },
      frame: { background: 'linear-gradient(180deg, #78716C, #44403C)', border: '3px solid #FACC15', boxShadow: '0 0 0 3px #000, 0 0 40px rgba(0,0,0,0.9)' },
      stripe: 'repeating-linear-gradient(135deg, #FACC15 0 10px, #1C1917 10px 20px)',
      accent: '#FDE047', text: '#F5F5F4', muted: '#D6D3D1',
      well: { background: 'rgba(28,25,23,0.55)', border: '1px solid #57534E' },
      slot: 'rgba(28,25,23,0.9)', slotOn: 'rgba(250,204,21,0.85)',
      button: 'linear-gradient(180deg, #CA8A04, #854D0E)', buttonEdge: '#422006',
    },
  },
  // Security: a visitor badge on a lanyard
  security: {
    hud: {
      panel: { background: 'linear-gradient(180deg, #1E40AF 0 12px, rgba(241,245,249,0.96) 12px)', border: '2px solid #CBD5E1', borderRadius: 6, boxShadow: PIXEL_SHADOW },
      deco: <>
        <div className="absolute left-1/2 -translate-x-1/2 -top-[5px] w-[22px] h-[6px] rounded-sm" style={{ background: '#64748B', boxShadow: '0 0 0 1px #000' }} />
        {tag('VISITOR', { background: '#DC2626', color: '#fff', top: 'auto', bottom: 4, right: 4, transform: 'rotate(-8deg)' })}
      </>,
      label: '#1E3A8A', value: '#0F172A', name: '#B91C1C',
      track: { background: '#0F172A', borderColor: '#334155' },
      slot: { background: '#E2E8F0', borderColor: '#1E40AF' },
      cellOff: { border: '#94A3B8', fill: 'linear-gradient(180deg, #64748B, #334155)' },
    },
    pause: {
      title: 'PLEASE HOLD', sub: 'REMAIN WITH YOUR BELONGINGS AT ALL TIMES',
      titleStyle: { color: '#F97316', textShadow: '3px 3px 0 #0C4A6E' },
      frame: { backgroundImage: 'repeating-linear-gradient(0deg, rgba(56,189,248,0.06) 0 1px, transparent 1px 4px), linear-gradient(180deg, #0B1E3F, #020617)', border: '3px solid #38BDF8', boxShadow: '0 0 0 3px #000, 0 0 40px rgba(56,189,248,0.25)' },
      stripe: 'linear-gradient(90deg, #F97316, #38BDF8, #F97316)',
      accent: '#38BDF8', text: '#E0F2FE', muted: '#7DD3FC',
      well: { background: 'rgba(2,6,23,0.6)', border: '1px solid #0369A1' },
      slot: 'rgba(8,47,73,0.9)', slotOn: 'rgba(249,115,22,0.85)',
      button: 'linear-gradient(180deg, #0284C7, #075985)', buttonEdge: '#082F49',
    },
  },
  // America USA: stars and stripes, the tackier the better
  america: {
    hud: {
      panel: { backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1.5px), linear-gradient(180deg, rgba(30,58,138,0.95), rgba(23,37,84,0.95))', backgroundSize: '10px 10px, auto', border: '2px solid #FFFFFF', boxShadow: '0 0 0 2px #B91C1C, 3px 3px 0 2px rgba(0,0,0,0.6)' },
      deco: <>{edge('repeating-linear-gradient(180deg, #DC2626 0 5px, #F8FAFC 5px 10px)', 5)}{tag('★ USA ★', { background: '#DC2626', color: '#fff', boxShadow: '0 0 0 1px #fff' })}</>,
      label: '#FFFFFF', value: '#FFFFFF', name: '#FCA5A5',
      hp: 'repeating-linear-gradient(90deg, #DC2626 0 6px, #F8FAFC 6px 9px)',
      slot: { background: 'rgba(23,37,84,0.8)', borderColor: '#F8FAFC' },
      cellOn: { border: '#F8FAFC', fill: 'linear-gradient(180deg, #FCA5A5, #DC2626)', glow: 'rgba(248,113,113,0.8)' },
    },
    pause: {
      title: 'FREEDOM BREAK', sub: 'AMERICA NEVER STOPS. EXCEPT RIGHT NOW.',
      titleStyle: { color: '#FFFFFF', textShadow: '3px 3px 0 #B91C1C, 5px 5px 0 #1E3A8A' },
      frame: { backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1.5px, transparent 2px), linear-gradient(180deg, #1E3A8A, #172554)', backgroundSize: '18px 18px, auto', border: '3px solid #F8FAFC', boxShadow: '0 0 0 3px #B91C1C, 0 0 40px rgba(0,0,0,0.9)' },
      stripe: 'repeating-linear-gradient(90deg, #DC2626 0 14px, #F8FAFC 14px 28px)',
      accent: '#FCA5A5', text: '#F8FAFC', muted: '#BFDBFE',
      well: { background: 'rgba(15,23,42,0.6)', border: '1px solid #93C5FD' },
      slot: 'rgba(23,37,84,0.95)', slotOn: 'rgba(220,38,38,0.85)',
      button: 'linear-gradient(180deg, #DC2626, #991B1B)', buttonEdge: '#450A0A',
    },
  },
  // The ticket line: an admission stub
  ticket: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(254,243,199,0.97), rgba(253,230,138,0.97))', border: '2px dashed #B45309', boxShadow: PIXEL_SHADOW },
      deco: <>{edge('radial-gradient(circle at 0 50%, #000 2px, transparent 2.5px) 0 0 / 6px 8px repeat-y', 6)}{tag('ADMIT ONE', { color: '#B91C1C', border: '1px solid #B91C1C', background: '#FEF3C7', transform: 'rotate(4deg)' })}</>,
      label: '#7C2D12', value: '#7F1D1D', name: '#B91C1C',
      track: { background: '#451A03', borderColor: '#78350F' },
      slot: { background: '#FDE68A', borderColor: '#B45309' },
      cellOff: { border: '#B45309', fill: 'linear-gradient(180deg, #D97706, #92400E)' },
    },
    pause: {
      title: 'INTERMISSION', sub: 'NO RE-ENTRY · NO REFUNDS · NO EXCEPTIONS',
      titleStyle: { color: '#B91C1C', textShadow: '2px 2px 0 #FDE68A, 4px 4px 0 #78350F' },
      frame: { background: 'linear-gradient(180deg, #FEF3C7, #FDE68A)', border: '3px dashed #B45309', boxShadow: '0 0 0 3px #000, 0 0 40px rgba(0,0,0,0.9)' },
      stripe: 'repeating-linear-gradient(90deg, #B91C1C 0 4px, transparent 4px 10px)',
      accent: '#B91C1C', text: '#451A03', muted: '#92400E',
      well: { background: 'rgba(120,53,15,0.12)', border: '1px solid #D97706' },
      slot: 'rgba(69,26,3,0.85)', slotOn: 'rgba(220,38,38,0.85)',
      button: 'linear-gradient(180deg, #DC2626, #991B1B)', buttonEdge: '#450A0A',
    },
  },
  // The hub: the park brochure (glossy, pastel, relentlessly happy)
  hub: {
    hud: {
      panel: { background: 'linear-gradient(135deg, rgba(249,168,212,0.96), rgba(196,181,253,0.96) 55%, rgba(147,197,253,0.96))', border: '3px solid #FFFFFF', borderRadius: 10, boxShadow: '0 0 0 2px #7C3AED, 3px 3px 0 2px rgba(0,0,0,0.45)' },
      deco: tag('HAPPY LAND!', { background: '#FDE047', color: '#9D174D', borderRadius: 6, boxShadow: '0 0 0 1px #9D174D' }),
      label: '#4C1D95', value: '#4C1D95', name: '#BE185D',
      track: { background: '#2E1065', borderColor: '#FFFFFF' },
      hp: 'linear-gradient(180deg, #F9A8D4, #EC4899 50%, #BE185D)',
      slot: { background: 'rgba(255,255,255,0.6)', borderColor: '#FFFFFF', borderRadius: 8 },
      cellOn: { border: '#FFFFFF', fill: 'linear-gradient(180deg, #FEF08A, #FACC15)', glow: 'rgba(255,255,255,0.9)' },
      cellOff: { border: '#C4B5FD', fill: 'linear-gradient(180deg, #A78BFA, #7C3AED)' },
    },
    pause: {
      title: 'HAVE A HAPPY DAY!', sub: 'THE FUN WILL WAIT FOR YOU! IT HAS NO CHOICE!',
      titleStyle: { color: '#FFFFFF', textShadow: '3px 3px 0 #DB2777, 5px 5px 0 #7C3AED' },
      frame: { background: 'linear-gradient(135deg, #F9A8D4, #C4B5FD 55%, #93C5FD)', border: '4px solid #FFFFFF', borderRadius: 14, boxShadow: '0 0 0 3px #7C3AED, 0 0 40px rgba(0,0,0,0.8)' },
      stripe: 'repeating-linear-gradient(90deg, #FDE047 0 12px, #FFFFFF 12px 24px)',
      accent: '#9D174D', text: '#3B0764', muted: '#6D28D9',
      well: { background: 'rgba(255,255,255,0.45)', border: '2px solid #FFFFFF', borderRadius: 8 },
      slot: 'rgba(76,29,149,0.85)', slotOn: 'rgba(253,224,71,0.95)',
      button: 'linear-gradient(180deg, #EC4899, #BE185D)', buttonEdge: '#831843',
    },
  },
  // The staff room: a timecard
  staff: {
    hud: {
      panel: { backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 11px, rgba(120,113,108,0.35) 11px 12px), linear-gradient(180deg, rgba(231,211,161,0.97), rgba(214,190,135,0.97))', border: '2px solid #78716C', boxShadow: PIXEL_SHADOW },
      deco: <>{edge('#DC2626', 3)}{tag('ON THE CLOCK', { color: '#B91C1C', border: '1px solid #B91C1C', transform: 'rotate(-5deg)', background: 'rgba(254,226,226,0.8)' })}</>,
      label: '#44403C', value: '#1C1917', name: '#7F1D1D',
      track: { background: '#292524', borderColor: '#57534E' },
      slot: { background: 'rgba(255,255,255,0.35)', borderColor: '#78716C' },
      cellOff: { border: '#78716C', fill: 'linear-gradient(180deg, #A8A29E, #57534E)' },
    },
    pause: {
      title: 'ON BREAK', sub: 'FIFTEEN MINUTES. UNPAID.',
      titleStyle: { color: '#FEF3C7', textShadow: '3px 3px 0 #7F1D1D' },
      frame: { backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.25) 1px, transparent 1.5px), linear-gradient(180deg, #A16207, #713F12)', backgroundSize: '6px 6px, auto', border: '6px solid #57534E', boxShadow: '0 0 0 3px #000, 0 0 40px rgba(0,0,0,0.9)' },
      stripe: 'linear-gradient(90deg, #DC2626, #DC2626)',
      deco: <div className="absolute right-6 top-3 text-[7px] font-black px-2 py-1 rotate-6" style={{ background: '#FEF08A', color: '#713F12', boxShadow: '2px 2px 0 rgba(0,0,0,0.4)' }}>WASH YOUR HANDS</div>,
      accent: '#FDE68A', text: '#FEF3C7', muted: '#FCD34D',
      well: { background: 'rgba(231,211,161,0.18)', border: '1px solid #D6BE87' },
      slot: 'rgba(41,37,36,0.9)', slotOn: 'rgba(253,230,138,0.9)',
      button: 'linear-gradient(180deg, #57534E, #292524)', buttonEdge: '#0C0A09',
    },
  },
  // The jungle: a bamboo-framed sign, vines over it
  jungle: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(92,58,30,0.95), rgba(59,36,18,0.95))', border: '4px solid transparent', borderImage: 'repeating-linear-gradient(90deg, #D9B26F 0 14px, #6B4F1D 14px 16px) 4', boxShadow: PIXEL_SHADOW },
      deco: <>
        <div className="absolute -top-[4px] left-[12px] right-[30px] h-[7px]" style={{ background: 'radial-gradient(ellipse at 50% 0, #3F6212 3px, transparent 3.5px) 0 0 / 12px 7px repeat-x' }} />
        <div className="absolute -left-[3px] top-0 w-[3px] h-[30px]" style={{ background: '#4D7C0F' }} />
      </>,
      label: '#FEF3C7', value: '#FEF3C7', name: '#BEF264',
      track: { background: '#1C1208', borderColor: '#3F2A12' },
      slot: { background: 'rgba(28,18,8,0.6)', borderColor: '#A3E635' },
      cellOn: { border: '#BEF264', fill: 'linear-gradient(180deg, #D9F99D, #84CC16)', glow: 'rgba(163,230,53,0.8)' },
    },
    pause: {
      title: 'PAUSED', sub: 'THE MONKEYS ARE WATCHING',
      titleStyle: { color: '#D9B26F', textShadow: '2px 2px 0 #1C1208, -1px -1px 0 #F5DEB3' },
      frame: { background: 'linear-gradient(180deg, #5C3A1E, #3B2412)', border: '6px solid transparent', borderImage: 'repeating-linear-gradient(90deg, #D9B26F 0 20px, #6B4F1D 20px 23px) 6', boxShadow: '0 0 0 3px #000, 0 0 40px rgba(0,0,0,0.9)' },
      stripe: 'radial-gradient(ellipse at 50% 0, #4D7C0F 6px, transparent 6.5px) 0 0 / 18px 10px repeat-x',
      accent: '#BEF264', text: '#FEF3C7', muted: '#D9B26F',
      well: { background: 'rgba(28,18,8,0.55)', border: '1px solid #6B4F1D' },
      slot: 'rgba(28,18,8,0.9)', slotOn: 'rgba(163,230,53,0.85)',
      button: 'linear-gradient(180deg, #4D7C0F, #365314)', buttonEdge: '#1A2E05',
    },
  },
  // The Jungle Cruise's queue: the wait-time board
  queue: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(21,83,45,0.96), rgba(20,61,36,0.96))', border: '3px solid #CA8A04', borderRadius: 4, boxShadow: '0 0 0 2px #000, 3px 3px 0 2px rgba(0,0,0,0.6), inset 0 0 0 1px #FDE047' },
      deco: tag('WAIT: 185 MIN', { background: '#FEF3C7', color: '#7F1D1D', boxShadow: '0 0 0 1px #CA8A04' }),
      label: '#FDE68A', value: '#FFFFFF', name: '#FDE047',
      slot: { background: 'rgba(5,46,22,0.7)', borderColor: '#CA8A04' },
    },
    pause: {
      title: 'PLEASE WAIT', sub: 'CURRENT WAIT: 185 MIN · EXTRA FAST PASS: 190 MIN',
      titleStyle: { color: '#FDE047', textShadow: '3px 3px 0 #14532D, 5px 5px 0 #000' },
      frame: { background: 'linear-gradient(180deg, #166534, #14532D)', border: '4px solid #CA8A04', borderRadius: 6, boxShadow: '0 0 0 3px #000, inset 0 0 0 2px #FDE047, 0 0 40px rgba(0,0,0,0.9)' },
      stripe: 'repeating-linear-gradient(90deg, #FDE047 0 6px, #CA8A04 6px 12px)',
      accent: '#FDE047', text: '#F0FDF4', muted: '#BBF7D0',
      well: { background: 'rgba(5,46,22,0.6)', border: '1px solid #CA8A04' },
      slot: 'rgba(5,46,22,0.95)', slotOn: 'rgba(253,224,71,0.9)',
      button: 'linear-gradient(180deg, #CA8A04, #854D0E)', buttonEdge: '#422006',
    },
  },
  // The boat ride: a khaki tour placard with a life ring
  boat: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(196,180,128,0.97), rgba(163,146,100,0.97))', border: '3px double #5C3A1E', boxShadow: PIXEL_SHADOW },
      deco: <>
        {edge('repeating-linear-gradient(180deg, #A16207 0 3px, #78350F 3px 6px)', 4)}
        <div className="absolute -right-[6px] -top-[6px] w-[18px] h-[18px] rounded-full" style={{ background: 'conic-gradient(#DC2626 0 25%, #FFF 0 50%, #DC2626 0 75%, #FFF 0)', WebkitMask: 'radial-gradient(circle, transparent 4px, #000 4.5px)', mask: 'radial-gradient(circle, transparent 4px, #000 4.5px)', boxShadow: '0 0 0 1px #000' }} />
      </>,
      label: '#422006', value: '#1C1917', name: '#7F1D1D',
      track: { background: '#292524', borderColor: '#5C3A1E' },
      slot: { background: 'rgba(255,251,235,0.4)', borderColor: '#5C3A1E' },
      cellOff: { border: '#78716C', fill: 'linear-gradient(180deg, #A8A29E, #57534E)' },
    },
    pause: {
      title: 'OUT OF GAS', sub: 'MAINTENANCE HAS BEEN NOTIFIED. PLEASE ENJOY THE VIEW.',
      titleStyle: { color: '#FEF3C7', textShadow: '3px 3px 0 #5C3A1E, 5px 5px 0 #000' },
      frame: { background: 'linear-gradient(180deg, #A39264, #7C6A44)', border: '5px double #422006', boxShadow: '0 0 0 3px #000, 0 0 40px rgba(0,0,0,0.9)' },
      stripe: 'repeating-linear-gradient(90deg, #DC2626 0 10px, #FFFFFF 10px 20px)',
      accent: '#7F1D1D', text: '#1C1917', muted: '#422006',
      well: { background: 'rgba(66,32,6,0.2)', border: '1px solid #5C3A1E' },
      slot: 'rgba(41,37,36,0.9)', slotOn: 'rgba(254,243,199,0.95)',
      button: 'linear-gradient(180deg, #78350F, #451A03)', buttonEdge: '#1C0A00',
    },
  },
  // Under the river: a brass porthole, bubbles going up
  underwater: {
    hud: {
      panel: { background: 'radial-gradient(ellipse at 30% 0, rgba(34,211,238,0.25), transparent 60%), linear-gradient(180deg, rgba(8,51,68,0.95), rgba(4,30,44,0.95))', border: '3px solid #D97706', borderRadius: 10, boxShadow: '0 0 0 2px #451A03, 3px 3px 0 2px rgba(0,0,0,0.6), inset 0 0 0 1px #FCD34D' },
      deco: <>{rivets('#FBBF24', 4)}
        <div className="absolute right-[12px] bottom-[22px] w-[5px] h-[5px] rounded-full border border-cyan-200/70" /><div className="absolute right-[18px] bottom-[12px] w-[3px] h-[3px] rounded-full border border-cyan-200/60" /><div className="absolute right-[10px] bottom-[8px] w-[4px] h-[4px] rounded-full border border-cyan-200/50" /></>,
      label: '#A5F3FC', value: '#ECFEFF', name: '#FCD34D',
      track: { background: '#021A24', borderColor: '#92400E' },
      slot: { background: 'rgba(2,26,36,0.7)', borderColor: '#D97706', borderRadius: '50%' },
      cellOn: { border: '#FCD34D', fill: 'linear-gradient(180deg, #A5F3FC, #22D3EE)', glow: 'rgba(34,211,238,0.8)' },
    },
    pause: {
      title: 'HOLDING BREATH', sub: "DON'T FORGET TO BREATHE",
      titleStyle: { color: '#A5F3FC', textShadow: '3px 3px 0 #164E63, 5px 5px 0 #000' },
      frame: { background: 'radial-gradient(ellipse at 50% 0, rgba(34,211,238,0.2), transparent 60%), linear-gradient(180deg, #083344, #021A24)', border: '6px solid #D97706', borderRadius: 18, boxShadow: '0 0 0 3px #451A03, 0 0 40px rgba(0,0,0,0.9), inset 0 0 0 2px #FCD34D' },
      stripe: 'radial-gradient(circle, rgba(165,243,252,0.6) 2px, transparent 2.5px) 0 0 / 14px 6px repeat-x',
      accent: '#FCD34D', text: '#ECFEFF', muted: '#67E8F9',
      well: { background: 'rgba(2,26,36,0.6)', border: '1px solid #92400E' },
      slot: 'rgba(2,26,36,0.95)', slotOn: 'rgba(252,211,77,0.9)',
      button: 'linear-gradient(180deg, #D97706, #92400E)', buttonEdge: '#451A03',
    },
  },
  // The dino park: the control terminal (green on black), the mode light red
  dino: {
    hud: {
      panel: { backgroundImage: 'repeating-linear-gradient(0deg, rgba(74,222,128,0.07) 0 1px, transparent 1px 3px), linear-gradient(180deg, rgba(5,20,10,0.95), rgba(2,10,5,0.95))', border: '2px solid #166534', boxShadow: '0 0 0 2px #000, 3px 3px 0 2px rgba(0,0,0,0.6), 0 0 10px rgba(74,222,128,0.25)' },
      deco: <>{edge('#14532D', 3)}{tag('MODE: HOSTILE', { background: '#450A0A', color: '#F87171', boxShadow: '0 0 0 1px #DC2626, 0 0 6px rgba(239,68,68,0.8)' })}</>,
      label: '#4ADE80', value: '#86EFAC', name: '#4ADE80',
      track: { background: '#020A05', borderColor: '#14532D' },
      hp: 'repeating-linear-gradient(90deg, #22C55E 0 5px, #15803D 5px 6px)',
      slot: { background: 'rgba(2,10,5,0.8)', borderColor: '#16A34A' },
      cellOn: { border: '#4ADE80', fill: 'linear-gradient(180deg, #86EFAC, #16A34A)', glow: 'rgba(74,222,128,0.8)' },
      cellOff: { border: '#14532D', fill: 'linear-gradient(180deg, #166534, #052E16)' },
      hpLabel: 'BIO', pwrLabel: 'PWR',
    },
    pause: {
      title: 'SYSTEM HALT', sub: '> DINOSAUR MODE: HOSTILE   > CAUSE: UNKNOWN',
      titleStyle: { color: '#4ADE80', textShadow: '0 0 8px rgba(74,222,128,0.8), 3px 3px 0 #052E16' },
      frame: { backgroundImage: 'repeating-linear-gradient(0deg, rgba(74,222,128,0.05) 0 1px, transparent 1px 3px), linear-gradient(180deg, #05140A, #020A05)', border: '3px solid #16A34A', boxShadow: '0 0 0 3px #000, 0 0 40px rgba(34,197,94,0.25)' },
      stripe: 'repeating-linear-gradient(135deg, #DC2626 0 8px, #1C1917 8px 16px)',
      accent: '#F87171', text: '#86EFAC', muted: '#22C55E',
      well: { background: 'rgba(2,10,5,0.7)', border: '1px solid #166534' },
      slot: 'rgba(2,10,5,0.95)', slotOn: 'rgba(74,222,128,0.8)',
      button: 'linear-gradient(180deg, #16A34A, #14532D)', buttonEdge: '#052E16',
    },
  },
  // The temple: carved stone (it's fiberglass)
  temple: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(120,113,108,0.97), rgba(87,83,78,0.97))', border: '4px solid transparent', borderImage: 'repeating-linear-gradient(90deg, #A8A29E 0 8px, #44403C 8px 10px, #A8A29E 10px 14px, #57534E 14px 16px) 4', boxShadow: PIXEL_SHADOW },
      deco: tag('FIBERGLASS', { background: '#FEF08A', color: '#713F12', transform: 'rotate(5deg)' }),
      label: '#FDE68A', value: '#FEF3C7', name: '#FCD34D',
      track: { background: '#1C1917', borderColor: '#44403C' },
      slot: { background: 'rgba(28,25,23,0.6)', borderColor: '#CA8A04' },
      cellOn: { border: '#FCD34D', fill: 'linear-gradient(180deg, #FDE68A, #B45309)', glow: 'rgba(252,211,77,0.7)' },
    },
    pause: {
      title: 'THE GODS REST', sub: '(FIBERGLASS. DO NOT CLIMB. DO NOT LICK.)',
      titleStyle: { color: '#FCD34D', textShadow: '2px 2px 0 #292524, -1px -1px 0 #D6D3D1' },
      frame: { background: 'linear-gradient(180deg, #78716C, #44403C)', border: '6px solid transparent', borderImage: 'repeating-linear-gradient(90deg, #A8A29E 0 12px, #44403C 12px 15px, #A8A29E 15px 22px, #57534E 22px 24px) 6', boxShadow: '0 0 0 3px #000, 0 0 40px rgba(0,0,0,0.9)' },
      stripe: 'repeating-linear-gradient(90deg, #CA8A04 0 6px, #1C1917 6px 8px, #0F766E 8px 14px, #1C1917 14px 16px)',
      accent: '#FCD34D', text: '#F5F5F4', muted: '#D6D3D1',
      well: { background: 'rgba(28,25,23,0.5)', border: '1px solid #A8A29E' },
      slot: 'rgba(28,25,23,0.9)', slotOn: 'rgba(202,138,4,0.9)',
      button: 'linear-gradient(180deg, #0F766E, #134E4A)', buttonEdge: '#042F2E',
    },
  },
  // The mine cart: timber and riveted iron, a lantern's glow
  cart: {
    hud: {
      panel: { background: 'radial-gradient(ellipse at 90% 10%, rgba(251,191,36,0.3), transparent 50%), repeating-linear-gradient(180deg, rgba(120,53,15,0.96) 0 14px, rgba(69,26,3,0.96) 14px 16px)', border: '3px solid #52525B', boxShadow: PIXEL_SHADOW },
      deco: rivets('#A1A1AA', 3),
      label: '#FED7AA', value: '#FFF7ED', name: '#FBBF24',
      track: { background: '#1C0A00', borderColor: '#3F3F46' },
      slot: { background: 'rgba(28,10,0,0.6)', borderColor: '#71717A' },
    },
    pause: {
      title: 'BRAKES ON', sub: 'KEEP ARMS, LEGS AND GRUDGES INSIDE THE CART',
      titleStyle: { color: '#FBBF24', textShadow: '3px 3px 0 #451A03, 5px 5px 0 #000' },
      frame: { background: 'radial-gradient(ellipse at 85% 0, rgba(251,191,36,0.2), transparent 50%), repeating-linear-gradient(180deg, #78350F 0 22px, #451A03 22px 25px)', border: '5px solid #52525B', boxShadow: '0 0 0 3px #000, 0 0 40px rgba(0,0,0,0.9)' },
      stripe: 'repeating-linear-gradient(90deg, #A1A1AA 0 4px, #3F3F46 4px 24px)',
      deco: rivets('#A1A1AA', 6),
      accent: '#FBBF24', text: '#FFF7ED', muted: '#FDBA74',
      well: { background: 'rgba(28,10,0,0.55)', border: '1px solid #52525B' },
      slot: 'rgba(28,10,0,0.9)', slotOn: 'rgba(251,191,36,0.85)',
      button: 'linear-gradient(180deg, #52525B, #27272A)', buttonEdge: '#09090B',
    },
  },
  // The roof: the temple's stone, cracked
  roof: {
    hud: {
      panel: { backgroundImage: 'linear-gradient(115deg, transparent 46%, #1C1917 47%, transparent 48%), linear-gradient(60deg, transparent 70%, #1C1917 71%, transparent 72%), linear-gradient(180deg, rgba(120,113,108,0.97), rgba(87,83,78,0.97))', border: '4px solid transparent', borderImage: 'repeating-linear-gradient(90deg, #A8A29E 0 8px, #44403C 8px 10px, #A8A29E 10px 14px, #57534E 14px 16px) 4', boxShadow: PIXEL_SHADOW },
      deco: tag('STRUCTURAL INTEGRITY: LOW', { background: '#FEF08A', color: '#7F1D1D', transform: 'rotate(-4deg)' }),
      label: '#FDE68A', value: '#FEF3C7', name: '#FCD34D',
      track: { background: '#1C1917', borderColor: '#44403C' },
      slot: { background: 'rgba(28,25,23,0.6)', borderColor: '#CA8A04' },
    },
    pause: {
      title: 'STILL STANDING', sub: '(MOSTLY)',
      titleStyle: { color: '#FCD34D', textShadow: '2px 2px 0 #292524, -1px -1px 0 #D6D3D1' },
      frame: { backgroundImage: 'linear-gradient(110deg, transparent 30%, rgba(0,0,0,0.6) 30.4%, transparent 30.8%), linear-gradient(70deg, transparent 72%, rgba(0,0,0,0.6) 72.4%, transparent 72.8%), linear-gradient(180deg, #78716C, #44403C)', border: '6px solid #57534E', boxShadow: '0 0 0 3px #000, 0 0 40px rgba(0,0,0,0.9)' },
      stripe: 'repeating-linear-gradient(135deg, #FACC15 0 8px, #1C1917 8px 16px)',
      accent: '#FCD34D', text: '#F5F5F4', muted: '#D6D3D1',
      well: { background: 'rgba(28,25,23,0.5)', border: '1px solid #A8A29E' },
      slot: 'rgba(28,25,23,0.9)', slotOn: 'rgba(202,138,4,0.9)',
      button: 'linear-gradient(180deg, #0F766E, #134E4A)', buttonEdge: '#042F2E',
    },
  },
  // The clearing: hunter's camo
  clearing: {
    hud: {
      panel: { backgroundImage: 'radial-gradient(ellipse 14px 8px at 20% 30%, #3F6212 98%, transparent), radial-gradient(ellipse 18px 9px at 70% 70%, #1A2E05 98%, transparent), radial-gradient(ellipse 12px 7px at 85% 20%, #65400F 98%, transparent), linear-gradient(180deg, rgba(77,94,40,0.96), rgba(54,70,26,0.96))', border: '2px solid #A3A380', boxShadow: PIXEL_SHADOW },
      deco: <>{edge('#EA580C', 4)}{tag('HUNTING SEASON', { background: '#EA580C', color: '#fff' })}</>,
      label: '#ECFCCB', value: '#FFFFFF', name: '#FDBA74',
      track: { background: '#1A2E05', borderColor: '#365314' },
      slot: { background: 'rgba(26,46,5,0.6)', borderColor: '#EA580C' },
      cellOn: { border: '#FDBA74', fill: 'linear-gradient(180deg, #FDBA74, #EA580C)', glow: 'rgba(234,88,12,0.8)' },
    },
    pause: {
      title: 'PAUSED', sub: 'SOMETHING IN THE TREES IS PAUSED TOO',
      titleStyle: { color: '#FDBA74', textShadow: '3px 3px 0 #1A2E05, 5px 5px 0 #000' },
      frame: { backgroundImage: 'radial-gradient(ellipse 40px 20px at 20% 30%, #3F6212 98%, transparent), radial-gradient(ellipse 50px 24px at 75% 65%, #1A2E05 98%, transparent), radial-gradient(ellipse 30px 16px at 50% 90%, #65400F 98%, transparent), linear-gradient(180deg, #4D5E28, #36461A)', border: '4px solid #EA580C', boxShadow: '0 0 0 3px #000, 0 0 40px rgba(0,0,0,0.9)' },
      stripe: 'linear-gradient(90deg, #EA580C, #F97316, #EA580C)',
      accent: '#FDBA74', text: '#ECFCCB', muted: '#BEF264',
      well: { background: 'rgba(26,46,5,0.6)', border: '1px solid #65A30D' },
      slot: 'rgba(26,46,5,0.92)', slotOn: 'rgba(234,88,12,0.85)',
      button: 'linear-gradient(180deg, #EA580C, #9A3412)', buttonEdge: '#431407',
    },
  },
  // Spooky Land (the first pass: one look for all of it): a tombstone, slime green on it
  spooky: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(46,16,101,0.96), rgba(26,11,46,0.96))', border: '2px solid #86EFAC', boxShadow: PIXEL_SHADOW },
      deco: <>{edge('#86EFAC', 4)}{tag('R.I.P.', { background: '#86EFAC', color: '#1A0B2E' })}</>,
      label: '#BBF7D0', value: '#FFFFFF', name: '#86EFAC',
      track: { background: '#1A0B2E', borderColor: '#5B21B6' },
      slot: { background: 'rgba(26,11,46,0.6)', borderColor: '#86EFAC' },
    },
    pause: {
      title: 'PAUSED', sub: 'THE GHOSTS ARE ON BREAK TOO',
      titleStyle: { color: '#86EFAC', textShadow: '3px 3px 0 #2E1065, 5px 5px 0 #000' },
      frame: { background: 'linear-gradient(180deg, #2E1065, #1A0B2E)', border: '4px solid #86EFAC', boxShadow: '0 0 0 3px #000, 0 0 40px rgba(0,0,0,0.9)' },
      stripe: 'repeating-linear-gradient(135deg, #86EFAC 0 8px, #2E1065 8px 16px)',
      accent: '#86EFAC', text: '#EDE9FE', muted: '#C4B5FD',
      well: { background: 'rgba(26,11,46,0.6)', border: '1px solid #5B21B6' },
      slot: 'rgba(26,11,46,0.92)', slotOn: 'rgba(134,239,172,0.8)',
      button: 'linear-gradient(180deg, #5B21B6, #2E1065)', buttonEdge: '#1A0B2E',
    },
  },
};

/** The pause menu as it always looked (pink on black), where there's no theme. */
export const PLAIN_PAUSE: PauseSkin = {
  title: 'PAUSED',
  titleStyle: { color: '#F472B6', textShadow: '3px 3px 0 #831843, 5px 5px 0 #000' },
  frame: {
    // (the scanlines over the dark: both in the one background, or the one wipes out the other)
    backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 3px), linear-gradient(180deg, rgba(24,24,27,0.97) 0%, rgba(9,9,11,0.97) 100%)',
    border: '3px solid #F472B6',
    boxShadow: '0 0 0 3px #000, 0 0 40px rgba(0,0,0,0.9), inset 0 0 30px rgba(244,114,182,0.06)',
  },
  stripe: 'repeating-linear-gradient(135deg, #F472B6 0 8px, #FDE047 8px 16px)',
  accent: '#F472B6', text: '#D4D4D8', muted: '#A1A1AA',
  well: { background: 'rgba(0,0,0,0.5)', border: '1px solid #3F3F46' },
  slot: 'rgba(24,24,27,0.9)', slotOn: 'rgba(250,204,21,0.85)',
  button: 'linear-gradient(180deg, #DB2777, #9D174D)', buttonEdge: '#500724',
};
