// Spooky Land's HUD and pause menu, a look per stretch of it: a moss-grown headstone under the town's iron fence, a gilt
// portrait frame on the castle's velvet, wet block and an iron shackle in the dungeon, the clock tower's brass face and
// gears, obsidian split with lava in hell, Donnie's monitor desk (ON AIR) in the control room, a price tag in the hell
// gift shop, and the ballroom's tacky purple velvet under a chandelier.

import React from 'react';
import type { Theme } from '../hudThemes';
import { edge, tag, rivets, corners, bit, word, topBand, bottomBand, PIXEL_SHADOW, FRAME_SHADOW } from '../hudKit';

export type SpookyZone = 'spooky' | 'castle' | 'dungeon' | 'tower' | 'hell' | 'control' | 'giftshop' | 'ballroom';

/** An iron fence's spikes along a top edge. */
const spikes = (col: string, w = 6) => bit({ left: 8, right: 26, top: -5, height: 6, background: `conic-gradient(from 135deg at 50% 0, ${col} 90deg, transparent 0) 0 0 / ${w}px 6px repeat-x` });
/** A little bat. */
const bat = (style: React.CSSProperties, col = '#0C0A1A') => bit({ width: 12, height: 6, background: col, clipPath: 'polygon(0 30%, 20% 0, 35% 35%, 50% 15%, 65% 35%, 80% 0, 100% 30%, 82% 62%, 65% 50%, 50% 100%, 35% 50%, 18% 62%)', ...style });
/** A brass gear. */
const gear = (size: number, style: React.CSSProperties) => bit({ width: size, height: size, borderRadius: '50%', background: `radial-gradient(circle, #1C1917 ${size * 0.12}px, #FBBF24 ${size * 0.14}px ${size * 0.3}px, #B45309 ${size * 0.32}px ${size * 0.36}px, transparent ${size * 0.38}px), repeating-conic-gradient(#D97706 0 18deg, transparent 0 36deg)`, ...style });

export const SPOOKY_THEMES: Record<SpookyZone, Theme> = {
  // The town: a moss-grown headstone under the town's wrought-iron fence, a bat on the wing
  spooky: {
    hud: {
      panel: { background: 'radial-gradient(ellipse 60px 10px at 20% 100%, rgba(77,124,15,0.7), transparent), radial-gradient(ellipse 40px 8px at 85% 100%, rgba(63,98,18,0.6), transparent), linear-gradient(180deg, rgba(87,83,110,0.96), rgba(55,50,74,0.96) 60%, rgba(40,36,56,0.96))', border: '2px solid #A8A2C0', borderRadius: '14px 14px 2px 2px', boxShadow: PIXEL_SHADOW + ', inset 0 2px 0 rgba(255,255,255,0.15)' },
      deco: <>
        {spikes('#18181B')}
        {edge('linear-gradient(180deg, #3F6212, #1A2E05)', 3)}
        {bat({ right: 30, top: -4 })}
        {bat({ right: 46, top: -9, transform: 'scale(0.7)' })}
        {tag('R.I.P.', { background: '#D6D3D1', color: '#1C1917', top: 'auto', bottom: 4, right: 4, borderRadius: '4px 4px 0 0', boxShadow: '0 0 0 1px #1C1917' })}
      </>,
      label: '#DDD6FE', value: '#FFFFFF', name: '#BEF264',
      track: { background: '#0C0A1A', borderColor: '#4C4466' },
      hp: 'linear-gradient(180deg, #D9F99D, #84CC16 50%, #3F6212)',
      slot: { background: 'rgba(12,10,26,0.6)', borderColor: '#A8A2C0', borderRadius: '8px 8px 0 0' },
      cellOn: { border: '#D9F99D', fill: 'linear-gradient(180deg, #ECFCCB, #A3E635)', glow: 'rgba(190,242,100,0.8)' },
      cellOff: { border: '#4C4466', fill: 'linear-gradient(180deg, #6D6590, #37324A)' },
    },
    pause: {
      title: 'REST IN PAUSE', sub: 'THE GIFT SHOP IS STILL OPEN',
      titleStyle: { color: '#D9F99D', textShadow: '2px 2px 0 #1A2E05, 4px 4px 0 #000' },
      frame: { background: 'radial-gradient(ellipse 200px 40px at 20% 100%, rgba(77,124,15,0.5), transparent), linear-gradient(180deg, #57536E, #37324A 60%, #28243A)', border: '4px solid #A8A2C0', borderRadius: '40px 40px 4px 4px', boxShadow: FRAME_SHADOW() },
      stripe: 'conic-gradient(from 135deg at 50% 0, #18181B 90deg, transparent 0) 0 0 / 10px 6px repeat-x',
      deco: <>{bat({ right: 40, top: 14, transform: 'scale(1.6)' })}{bat({ right: 70, top: 26 })}</>,
      accent: '#BEF264', text: '#EDE9FE', muted: '#C4B5FD',
      well: { background: 'rgba(12,10,26,0.55)', border: '1px solid #6D6590' },
      slot: 'rgba(12,10,26,0.9)', slotOn: 'rgba(190,242,100,0.85)',
      button: 'linear-gradient(180deg, #4D7C0F, #365314)', buttonEdge: '#1A2E05',
    },
  },
  // The castle: a gilt portrait frame on crimson damask, candle glow
  castle: {
    hud: {
      panel: { backgroundImage: 'radial-gradient(ellipse at 90% 0, rgba(253,224,71,0.18), transparent 55%), radial-gradient(circle at 50% 50%, rgba(0,0,0,0.25) 2px, transparent 2.5px), linear-gradient(180deg, rgba(127,29,29,0.97), rgba(69,10,10,0.97))', backgroundSize: 'auto, 8px 8px, auto', border: '4px double #D4A017', boxShadow: '0 0 0 2px #422006, 3px 3px 0 2px rgba(0,0,0,0.6), inset 0 0 0 1px #FDE68A' },
      deco: <>
        {corners('#FDE68A', 9, 2, 3)}
        {bit({ right: 10, top: -9, width: 3, height: 7, background: 'linear-gradient(180deg, #FEF9C3, #FDE68A)', boxShadow: '0 -3px 4px #FBBF24' })}
        {bit({ right: 8, top: -2, width: 7, height: 2, background: '#B45309' })}
        {tag('GHOST TOUR', { background: '#FEF3C7', color: '#7F1D1D', right: 20, boxShadow: '0 0 0 1px #D4A017' })}
      </>,
      label: '#FDE68A', value: '#FFFBEB', name: '#FDE047',
      track: { background: '#1C0606', borderColor: '#854D0E' },
      hp: 'linear-gradient(180deg, #FCA5A5, #DC2626 55%, #7F1D1D)',
      slot: { background: 'rgba(28,6,6,0.6)', borderColor: '#D4A017', borderRadius: '50% / 30%' },
      cellOn: { border: '#FDE68A', fill: 'linear-gradient(180deg, #FEF9C3, #EAB308)', glow: 'rgba(253,224,71,0.8)' },
      cellOff: { border: '#854D0E', fill: 'linear-gradient(180deg, #991B1B, #450A0A)' },
    },
    pause: {
      title: 'THE TOUR WAITS', sub: 'DO NOT TOUCH THE PORTRAITS. THEY TOUCH BACK.',
      titleStyle: { color: '#FDE68A', textShadow: '2px 2px 0 #7F1D1D, 4px 4px 0 #000' },
      frame: { backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.22) 3px, transparent 3.5px), linear-gradient(180deg, #7F1D1D, #450A0A)', backgroundSize: '14px 14px, auto', border: '8px double #D4A017', boxShadow: FRAME_SHADOW('#422006') + ', inset 0 0 0 2px #FDE68A' },
      stripe: 'repeating-linear-gradient(90deg, #FDE68A 0 3px, #B45309 3px 6px)',
      deco: corners('#FDE68A', 18, 3, 2),
      accent: '#FDE047', text: '#FFFBEB', muted: '#FCA5A5',
      well: { background: 'rgba(28,6,6,0.55)', border: '1px solid #D4A017' },
      slot: 'rgba(28,6,6,0.9)', slotOn: 'rgba(253,224,71,0.9)',
      button: 'linear-gradient(180deg, #B45309, #78350F)', buttonEdge: '#422006',
    },
  },
  // The dungeon: wet stone blocks, iron straps, a shackle hanging off it, the drip
  dungeon: {
    hud: {
      panel: { backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.35) 1px, transparent 1px), linear-gradient(180deg, rgba(68,64,60,0.97), rgba(41,37,36,0.97))', backgroundSize: '100% 12px, 24px 12px, auto', border: '3px solid #52525B', boxShadow: PIXEL_SHADOW + ', inset 0 -6px 8px rgba(20,83,45,0.35)' },
      deco: <>
        {edge('linear-gradient(180deg, #3F3F46, #18181B)', 5)}
        {rivets('#71717A', 2)}
        {bit({ right: 14, bottom: -9, width: 10, height: 10, borderRadius: '50%', border: '2px solid #71717A', boxShadow: '1px 1px 0 #000' })}
        {bit({ right: 18, bottom: -1, width: 2, height: 3, background: '#71717A' })}
        {bit({ left: 40, bottom: -5, width: 2, height: 4, borderRadius: '0 0 2px 2px', background: '#67E8F9', opacity: 0.8 })}
        {tag('MIND THE CEILING', { background: '#18181B', color: '#F87171', boxShadow: '0 0 0 1px #71717A' })}
      </>,
      label: '#D6D3D1', value: '#FAFAF9', name: '#FCA5A5',
      track: { background: '#0C0A09', borderColor: '#3F3F46' },
      hp: 'linear-gradient(180deg, #F87171, #B91C1C 60%, #7F1D1D)',
      slot: { background: 'rgba(12,10,9,0.7)', borderColor: '#71717A' },
      cellOn: { border: '#D4D4D8', fill: 'linear-gradient(180deg, #E4E4E7, #71717A)', glow: 'rgba(212,212,216,0.6)' },
      cellOff: { border: '#3F3F46', fill: 'linear-gradient(180deg, #52525B, #27272A)' },
    },
    pause: {
      title: 'CHAINED UP', sub: 'THE SPIKES ARE PATIENT',
      titleStyle: { color: '#E4E4E7', textShadow: '2px 2px 0 #7F1D1D, 4px 4px 0 #000' },
      frame: { backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.35) 2px, transparent 2px), linear-gradient(90deg, rgba(0,0,0,0.35) 2px, transparent 2px), linear-gradient(180deg, #44403C, #1C1917)', backgroundSize: '100% 28px, 56px 28px, auto', border: '6px solid #52525B', boxShadow: FRAME_SHADOW() },
      stripe: 'conic-gradient(from 315deg at 50% 100%, #A1A1AA 90deg, transparent 0) 0 0 / 12px 6px repeat-x',
      deco: rivets('#71717A', 8),
      accent: '#F87171', text: '#F5F5F4', muted: '#A8A29E',
      well: { background: 'rgba(12,10,9,0.6)', border: '1px solid #52525B' },
      slot: 'rgba(12,10,9,0.92)', slotOn: 'rgba(212,212,216,0.9)',
      button: 'linear-gradient(180deg, #52525B, #27272A)', buttonEdge: '#09090B',
    },
  },
  // The clock tower: a brass clock face, its gears, the ELEVATOR TO HELL's floor dial
  tower: {
    hud: {
      panel: { background: 'radial-gradient(ellipse at 100% 50%, rgba(254,243,199,0.12), transparent 60%), linear-gradient(180deg, rgba(41,37,36,0.97), rgba(28,25,23,0.97))', border: '3px solid #B45309', borderRadius: 6, boxShadow: '0 0 0 2px #000, 3px 3px 0 2px rgba(0,0,0,0.6), inset 0 0 0 1px #FBBF24' },
      deco: <>
        {gear(18, { right: -8, top: -8 })}
        {gear(12, { right: 8, top: -6, transform: 'rotate(12deg)' })}
        {edge('repeating-linear-gradient(180deg, #FBBF24 0 2px, #78350F 2px 7px)', 4)}
        {word('XII', { right: 16, bottom: 4, color: '#FBBF24', textShadow: '1px 1px 0 #000' })}
        {tag('ELEVATOR TO HELL', { background: '#78350F', color: '#FEF3C7', right: 30, boxShadow: '0 0 0 1px #FBBF24' })}
      </>,
      label: '#FDE68A', value: '#FFFBEB', name: '#FBBF24',
      track: { background: '#0C0A09', borderColor: '#78350F' },
      hp: 'linear-gradient(180deg, #FEF3C7, #FBBF24 50%, #B45309)',
      slot: { background: 'radial-gradient(circle, rgba(254,243,199,0.25), rgba(28,25,23,0.7) 70%)', borderColor: '#D97706', borderRadius: '50%' },
      cellOn: { border: '#FDE68A', fill: 'linear-gradient(180deg, #FEF3C7, #F59E0B)', glow: 'rgba(251,191,36,0.8)' },
      cellOff: { border: '#78350F', fill: 'linear-gradient(180deg, #92400E, #451A03)' },
    },
    pause: {
      title: 'TIME OUT', sub: 'GOING DOWN. WAY DOWN.',
      titleStyle: { color: '#FBBF24', textShadow: '2px 2px 0 #451A03, 4px 4px 0 #000' },
      frame: { background: 'radial-gradient(circle at 50% 30%, rgba(254,243,199,0.1), transparent 60%), linear-gradient(180deg, #292524, #0C0A09)', border: '6px solid #B45309', borderRadius: 10, boxShadow: FRAME_SHADOW() + ', inset 0 0 0 2px #FBBF24' },
      stripe: 'repeating-linear-gradient(90deg, #FBBF24 0 2px, #451A03 2px 12px)',
      deco: <>{gear(40, { right: -14, top: -14 })}{gear(26, { right: 22, top: -10, transform: 'rotate(10deg)' })}</>,
      accent: '#FBBF24', text: '#FFFBEB', muted: '#FCD34D',
      well: { background: 'rgba(12,10,9,0.6)', border: '1px solid #78350F' },
      slot: 'rgba(12,10,9,0.92)', slotOn: 'rgba(251,191,36,0.9)',
      button: 'linear-gradient(180deg, #B45309, #78350F)', buttonEdge: '#451A03',
    },
  },
  // Real hell: black obsidian split by lava, flames licking up its foot
  hell: {
    hud: {
      panel: { backgroundImage: 'linear-gradient(115deg, transparent 38%, #EA580C 39%, #FDE047 39.4%, #EA580C 39.8%, transparent 41%), linear-gradient(70deg, transparent 74%, #DC2626 75%, #FB923C 75.4%, transparent 76.5%), radial-gradient(ellipse at 50% 120%, rgba(239,68,68,0.55), transparent 60%), linear-gradient(180deg, rgba(28,10,10,0.97), rgba(12,4,4,0.97))', border: '2px solid #7F1D1D', boxShadow: '0 0 0 2px #000, 3px 3px 0 2px rgba(0,0,0,0.6), 0 0 10px rgba(239,68,68,0.45)' },
      deco: <>
        {bit({ left: 6, right: 6, bottom: -4, height: 6, background: 'radial-gradient(ellipse 4px 6px at 50% 100%, #FB923C 60%, transparent 65%) 0 0 / 7px 6px repeat-x' })}
        {edge('linear-gradient(180deg, #FDE047, #EA580C 40%, #7F1D1D)', 3)}
        {tag('666', { background: '#7F1D1D', color: '#FDE047', boxShadow: '0 0 0 1px #F97316, 0 0 6px rgba(249,115,22,0.8)' })}
      </>,
      label: '#FDBA74', value: '#FFF7ED', name: '#FDE047',
      track: { background: '#0C0404', borderColor: '#7F1D1D' },
      hp: 'linear-gradient(180deg, #FEF08A, #F97316 45%, #B91C1C)',
      slot: { background: 'rgba(12,4,4,0.7)', borderColor: '#EA580C' },
      cellOn: { border: '#FDE047', fill: 'linear-gradient(180deg, #FEF08A, #EA580C)', glow: 'rgba(249,115,22,0.9)' },
      cellOff: { border: '#7F1D1D', fill: 'linear-gradient(180deg, #7F1D1D, #2A0A0A)' },
      hpLabel: 'SOUL',
    },
    pause: {
      title: 'DAMNED BREAK', sub: 'ETERNITY CAN WAIT. IT HAS TIME.',
      titleStyle: { color: '#FDE047', textShadow: '0 0 8px rgba(249,115,22,0.9), 3px 3px 0 #7F1D1D' },
      frame: { backgroundImage: 'linear-gradient(115deg, transparent 30%, rgba(234,88,12,0.7) 30.3%, transparent 30.8%), linear-gradient(65deg, transparent 72%, rgba(220,38,38,0.7) 72.3%, transparent 72.8%), radial-gradient(ellipse at 50% 110%, rgba(239,68,68,0.45), transparent 55%), linear-gradient(180deg, #1C0A0A, #0C0404)', border: '4px solid #7F1D1D', boxShadow: FRAME_SHADOW('#000', 'rgba(239,68,68,0.35)') },
      stripe: 'radial-gradient(ellipse 6px 8px at 50% 100%, #F97316 60%, transparent 65%) 0 0 / 12px 6px repeat-x, linear-gradient(90deg, #7F1D1D, #7F1D1D)',
      accent: '#FDE047', text: '#FFEDD5', muted: '#FB923C',
      well: { background: 'rgba(12,4,4,0.65)', border: '1px solid #7F1D1D' },
      slot: 'rgba(12,4,4,0.92)', slotOn: 'rgba(249,115,22,0.9)',
      button: 'linear-gradient(180deg, #DC2626, #7F1D1D)', buttonEdge: '#2A0A0A',
    },
  },
  // Donnie's control room: his monitor desk (green screens, buttons), the ON AIR light
  control: {
    hud: {
      panel: { backgroundImage: 'repeating-linear-gradient(0deg, rgba(134,239,172,0.06) 0 1px, transparent 1px 3px), linear-gradient(180deg, rgba(39,39,42,0.97), rgba(24,24,27,0.97))', border: '3px solid #52525B', borderRadius: 4, boxShadow: PIXEL_SHADOW + ', inset 0 0 8px rgba(74,222,128,0.18)' },
      deco: <>
        {bottomBand('repeating-linear-gradient(90deg, #DC2626 0 4px, #18181B 4px 7px, #FACC15 7px 11px, #18181B 11px 14px, #22C55E 14px 18px, #18181B 18px 21px)', 3)}
        {edge('#3F3F46', 4)}
        {tag('ON AIR', { background: '#DC2626', color: '#FFF', boxShadow: '0 0 0 1px #000, 0 0 8px rgba(239,68,68,0.9)', borderRadius: 2 })}
      </>,
      label: '#86EFAC', value: '#F0FDF4', name: '#F87171',
      track: { background: '#020A05', borderColor: '#3F3F46' },
      hp: 'repeating-linear-gradient(90deg, #4ADE80 0 5px, #166534 5px 6px)',
      slot: { background: 'rgba(2,10,5,0.85)', borderColor: '#52525B', borderRadius: 6 },
      cellOn: { border: '#86EFAC', fill: 'linear-gradient(180deg, #BBF7D0, #22C55E)', glow: 'rgba(74,222,128,0.8)' },
      cellOff: { border: '#3F3F46', fill: 'linear-gradient(180deg, #166534, #052E16)' },
    },
    pause: {
      title: 'PLEASE STAND BY', sub: 'THE COUNT IS FIXING HIS WIG',
      titleStyle: { color: '#86EFAC', textShadow: '0 0 6px rgba(74,222,128,0.7), 3px 3px 0 #000' },
      frame: { backgroundImage: 'repeating-linear-gradient(0deg, rgba(134,239,172,0.05) 0 1px, transparent 1px 3px), linear-gradient(180deg, #27272A, #09090B)', border: '6px solid #52525B', borderRadius: 8, boxShadow: FRAME_SHADOW() },
      stripe: 'repeating-linear-gradient(90deg, #DC2626 0 6px, #FACC15 6px 12px, #22C55E 12px 18px, #3B82F6 18px 24px, #FFFFFF 24px 30px)',
      deco: <div className="absolute right-6 top-3 text-[7px] font-black px-2 py-1" style={{ background: '#DC2626', color: '#FFF', boxShadow: '0 0 10px rgba(239,68,68,0.9), 2px 2px 0 #000' }}>ON AIR</div>,
      accent: '#F87171', text: '#DCFCE7', muted: '#4ADE80',
      well: { background: 'rgba(2,10,5,0.7)', border: '1px solid #3F3F46' },
      slot: 'rgba(2,10,5,0.95)', slotOn: 'rgba(134,239,172,0.85)',
      button: 'linear-gradient(180deg, #DC2626, #991B1B)', buttonEdge: '#450A0A',
    },
  },
  // The hell gift shop: a gaudy price tag on its string, flames clip art
  giftshop: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(254,215,170,0.97), rgba(253,186,116,0.97))', border: '2px solid #9A3412', borderRadius: '2px 12px 12px 2px', boxShadow: PIXEL_SHADOW },
      deco: <>
        {bit({ right: 8, top: '50%', marginTop: -3, width: 6, height: 6, borderRadius: '50%', background: '#1C1917', boxShadow: '0 0 0 1px #9A3412' })}
        {bit({ right: -10, top: '50%', marginTop: -1, width: 14, height: 1, background: '#FDE68A', transform: 'rotate(-20deg)' })}
        {edge('repeating-linear-gradient(180deg, #DC2626 0 4px, #FDE047 4px 8px)', 4)}
        {tag('$66.66', { background: '#DC2626', color: '#FEF08A', transform: 'rotate(-6deg)', boxShadow: '0 0 0 1px #7F1D1D' })}
      </>,
      label: '#7C2D12', value: '#431407', name: '#B91C1C',
      track: { background: '#431407', borderColor: '#9A3412' },
      hp: 'linear-gradient(180deg, #FCA5A5, #DC2626 55%, #991B1B)',
      slot: { background: 'rgba(255,247,237,0.55)', borderColor: '#9A3412' },
      cellOn: { border: '#B91C1C', fill: 'linear-gradient(180deg, #FEF08A, #F97316)', glow: 'rgba(249,115,22,0.7)' },
      cellOff: { border: '#9A3412', fill: 'linear-gradient(180deg, #C2410C, #7C2D12)' },
    },
    pause: {
      title: 'JUST BROWSING', sub: 'YOU BREAK IT, YOU BURN FOR IT',
      titleStyle: { color: '#DC2626', textShadow: '2px 2px 0 #FEF08A, 4px 4px 0 #7C2D12' },
      frame: { background: 'linear-gradient(180deg, #FED7AA, #FDBA74)', border: '4px solid #9A3412', borderRadius: '6px 30px 30px 6px', boxShadow: FRAME_SHADOW() },
      stripe: 'repeating-linear-gradient(90deg, #DC2626 0 10px, #FDE047 10px 20px)',
      deco: <div className="absolute right-8 top-3 text-[8px] font-black px-2 py-1 -rotate-6" style={{ background: '#DC2626', color: '#FEF08A', boxShadow: '2px 2px 0 rgba(0,0,0,0.4)' }}>ALL SOULS 50% OFF</div>,
      accent: '#B91C1C', text: '#431407', muted: '#9A3412',
      well: { background: 'rgba(124,45,18,0.14)', border: '1px solid #C2410C' },
      slot: 'rgba(67,20,7,0.88)', slotOn: 'rgba(254,240,138,0.95)',
      button: 'linear-gradient(180deg, #DC2626, #991B1B)', buttonEdge: '#450A0A',
    },
  },
  // The ballroom: tacky purple velvet, gold glitter, a chandelier's crystals hanging off it
  ballroom: {
    hud: {
      panel: { backgroundImage: 'radial-gradient(circle, rgba(253,224,71,0.5) 0.6px, transparent 1px), linear-gradient(180deg, rgba(88,28,135,0.97), rgba(46,16,101,0.97))', backgroundSize: '6px 6px, auto', border: '3px solid #EAB308', borderRadius: 8, boxShadow: '0 0 0 2px #3B0764, 3px 3px 0 2px rgba(0,0,0,0.6), inset 0 0 0 1px #FEF08A' },
      deco: <>
        {bit({ left: 20, right: 40, bottom: -6, height: 7, background: 'radial-gradient(ellipse 1.5px 3px at 50% 50%, #E0F2FE 80%, transparent) 0 0 / 8px 7px repeat-x' })}
        {topBand('repeating-linear-gradient(90deg, #FEF08A 0 2px, #A16207 2px 4px)', 2)}
        {tag('D.D.', { background: '#EAB308', color: '#3B0764', borderRadius: 6, boxShadow: '0 0 0 1px #3B0764' })}
      </>,
      label: '#F5D0FE', value: '#FFFFFF', name: '#FDE047',
      track: { background: '#1E0538', borderColor: '#A16207' },
      hp: 'linear-gradient(180deg, #F5D0FE, #D946EF 50%, #86198F)',
      slot: { background: 'rgba(30,5,56,0.6)', borderColor: '#EAB308', borderRadius: 10 },
      cellOn: { border: '#FEF08A', fill: 'linear-gradient(180deg, #FEF9C3, #EAB308)', glow: 'rgba(250,204,21,0.85)' },
      cellOff: { border: '#7E22CE', fill: 'linear-gradient(180deg, #7E22CE, #3B0764)' },
    },
    pause: {
      title: 'LAST DANCE', sub: 'THE COUNT REQUESTS YOUR PATIENCE',
      titleStyle: { color: '#FDE047', textShadow: '2px 2px 0 #86198F, 4px 4px 0 #000' },
      frame: { backgroundImage: 'radial-gradient(circle, rgba(253,224,71,0.35) 1px, transparent 1.5px), linear-gradient(180deg, #581C87, #2E1065)', backgroundSize: '10px 10px, auto', border: '5px solid #EAB308', borderRadius: 16, boxShadow: FRAME_SHADOW('#3B0764') + ', inset 0 0 0 2px #FEF08A' },
      stripe: 'repeating-linear-gradient(90deg, #FEF08A 0 4px, #D946EF 4px 8px)',
      deco: rivets('#FEF08A', 8),
      accent: '#FDE047', text: '#FAE8FF', muted: '#E879F9',
      well: { background: 'rgba(30,5,56,0.6)', border: '1px solid #A16207' },
      slot: 'rgba(30,5,56,0.92)', slotOn: 'rgba(250,204,21,0.9)',
      button: 'linear-gradient(180deg, #A21CAF, #701A75)', buttonEdge: '#3B0764',
    },
  },
};
