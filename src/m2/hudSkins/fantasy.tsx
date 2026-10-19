// Fairy Land's HUD and pause menu, a look per section of it: a storybook page with a gilt border in the town square
// (a wax seal), a fairy wheel's gondola (pink and lilac, fairy lights) on trial one, mossy bark and toadstools in the
// enchanted glen, a coaster's three cars' colors (fire, ice, lightning) on Truelling Tragons, castle stone and a banner
// in the castle's base, a runway's red carpet and its gold rope out on the runway, a broomstick's bristles and a
// pennant in the deathmatch, and Piper's chambers (pink satin, a heart, glitter) at the end.

import React from 'react';
import type { Theme } from '../hudThemes';
import { edge, tag, rivets, corners, bit, bottomBand, PIXEL_SHADOW, FRAME_SHADOW } from '../hudKit';

export type FantasyZone = 'fantasy' | 'wheel' | 'glen' | 'tragons' | 'keep' | 'runway' | 'broom' | 'piper';

/** A four-point sparkle. */
const sparkle = (size: number, col: string, style: React.CSSProperties) => bit({ width: size, height: size, background: col, clipPath: 'polygon(50% 0, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0 50%, 40% 40%)', ...style });
/** A pennant on a little pole. */
const pennant = (col: string, style: React.CSSProperties) => bit({ width: 14, height: 9, background: col, clipPath: 'polygon(0 0, 100% 50%, 0 100%)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3)', ...style });
/** A toadstool: a red cap with white spots on a stalk. */
const toadstool = (h: number, style: React.CSSProperties) => bit({ width: h, height: h, ...style }, <>
  <div className="absolute" style={{ left: '35%', top: '45%', width: '30%', height: '55%', background: '#F5F0DC', boxShadow: '0 0 0 1px #3A2A1A' }} />
  <div className="absolute" style={{ left: 0, top: 0, width: '100%', height: '55%', borderRadius: '50% 50% 10% 10%', background: 'radial-gradient(circle at 30% 40%, #FFFFFF 0 12%, transparent 13%), radial-gradient(circle at 70% 30%, #FFFFFF 0 10%, transparent 11%), #DC2626', boxShadow: '0 0 0 1px #3A0A0A' }} />
</>);

/** The pause menu's common bits for a look (the rest given per zone). */
const pause = (p: Omit<Theme['pause'], 'well' | 'slot' | 'slotOn'> & { dark: string; line: string; on: string }): Theme['pause'] => {
  const { dark, line, on, ...rest } = p;
  return { ...rest, well: { background: dark, border: `1px solid ${line}` }, slot: dark.replace(/0\.\d+\)$/, '0.92)'), slotOn: on };
};

export const FANTASY_THEMES: Record<FantasyZone, Theme> = {
  // The town square: a storybook's page (cream vellum), a gilt border, a red wax seal, a gold star or two
  fantasy: {
    hud: {
      panel: { background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.35), transparent 60%), linear-gradient(180deg, rgba(246,236,206,0.97), rgba(226,208,166,0.97))', border: '3px solid #B07A1E', borderRadius: 4, boxShadow: PIXEL_SHADOW + ', inset 0 0 0 1px #F6D365, inset 0 0 0 3px rgba(176,122,30,0.35)' },
      deco: <>
        {corners('#E0AE3A', 8, 2, 2)}
        {bit({ right: 6, top: -8, width: 16, height: 16, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #F05252, #9B1C1C 70%)', boxShadow: '0 0 0 1px #450A0A' })}
        {sparkle(8, '#F6D365', { right: 26, top: -6 })}
      </>,
      label: '#6B3F12', value: '#2A1A08', name: '#9B1C1C',
      track: { background: '#3A2A1A', borderColor: '#B07A1E' },
      hp: 'linear-gradient(180deg, #FDE68A, #E0AE3A 50%, #92400E)',
      slot: { background: 'rgba(120,80,30,0.25)', borderColor: '#B07A1E' },
      cellOn: { border: '#FFF6C8', fill: 'linear-gradient(180deg, #FFF6C8, #E0AE3A)', glow: 'rgba(246,211,101,0.85)' },
      cellOff: { border: '#6B3F12', fill: 'linear-gradient(180deg, #8A6A3A, #4A3418)' },
    },
    pause: pause({
      title: 'ONCE UPON A PAUSE', sub: 'THE BUTTER DRINK IS STILL $14.',
      titleStyle: { color: '#F6D365', textShadow: '3px 3px 0 #6B3F12, 5px 5px 0 #000' },
      frame: { background: 'radial-gradient(ellipse at 30% 10%, rgba(255,255,255,0.25), transparent 60%), linear-gradient(180deg, #1E3A6E, #14264A)', border: '6px solid #B07A1E', borderRadius: 6, boxShadow: FRAME_SHADOW() + ', inset 0 0 0 2px #F6D365' },
      stripe: 'repeating-linear-gradient(90deg, #F6D365 0 6px, #B07A1E 6px 12px)',
      deco: <>{corners('#F6D365', 14, 3, 4)}{sparkle(14, '#F6D365', { right: 20, top: 14 })}</>,
      accent: '#F6D365', text: '#FFF7E0', muted: '#E8D4A8',
      dark: 'rgba(10,20,46,0.6)', line: '#B07A1E', on: 'rgba(246,211,101,0.9)',
      button: 'linear-gradient(180deg, #B91C1C, #7F1D1D)', buttonEdge: '#450A0A',
    }),
  },
  // The fairy wheel: a gondola's pink and lilac paint, a string of fairy lights along its top
  wheel: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(232,140,200,0.96), rgba(150,90,180,0.96))', border: '3px solid #FFF0FA', borderRadius: 10, boxShadow: PIXEL_SHADOW + ', inset 0 0 0 1px #6E2A6E' },
      deco: <>
        {bit({ left: 6, right: 6, top: -4, height: 6, background: 'radial-gradient(circle, #FEF08A 0 2px, transparent 3px) 0 0 / 10px 6px repeat-x, radial-gradient(circle, #A5F3FC 0 2px, transparent 3px) 5px 0 / 10px 6px repeat-x' })}
        {sparkle(10, '#FFFFFF', { right: 8, top: -10 })}
      </>,
      label: '#FFF0FA', value: '#FFFFFF', name: '#FEF08A',
      track: { background: '#3A1A4A', borderColor: '#FFF0FA' },
      hp: 'linear-gradient(180deg, #FFE4F2, #F472B6 50%, #9D174D)',
      slot: { background: 'rgba(58,26,74,0.5)', borderColor: '#FFF0FA', borderRadius: 4 },
      cellOn: { border: '#FFFFFF', fill: 'linear-gradient(180deg, #FFE4F2, #F472B6)', glow: 'rgba(244,114,182,0.85)' },
      cellOff: { border: '#6E2A6E', fill: 'linear-gradient(180deg, #7A3A8A, #3A1A4A)' },
    },
    pause: pause({
      title: 'ROUND AND ROUND', sub: 'NO STANDING IN THE CARTS. OR KILLING.',
      titleStyle: { color: '#FFE4F2', textShadow: '3px 3px 0 #9D174D, 5px 5px 0 #000' },
      frame: { background: 'linear-gradient(180deg, #8A3A9A, #4A1A5A)', border: '6px solid #FFF0FA', borderRadius: 14, boxShadow: FRAME_SHADOW() + ', inset 0 0 0 2px #F472B6' },
      stripe: 'repeating-linear-gradient(135deg, #F472B6 0 8px, #FFF0FA 8px 16px)',
      deco: <>{sparkle(14, '#FFFFFF', { right: 18, top: 12 })}{sparkle(10, '#FEF08A', { right: 40, top: 22 })}</>,
      accent: '#FEF08A', text: '#FFF0FA', muted: '#F5D0FE',
      dark: 'rgba(58,26,74,0.6)', line: '#F472B6', on: 'rgba(244,114,182,0.9)',
      button: 'linear-gradient(180deg, #DB2777, #9D174D)', buttonEdge: '#500724',
    }),
  },
  // The enchanted glen: mossy bark, a toadstool, fireflies
  glen: {
    hud: {
      panel: { background: 'repeating-linear-gradient(90deg, rgba(74,52,30,0.97) 0 9px, rgba(90,64,38,0.97) 9px 11px)', border: '3px solid #4D7C0F', borderRadius: 4, boxShadow: PIXEL_SHADOW + ', inset 0 2px 0 #84CC16' },
      deco: <>{toadstool(16, { right: 8, top: -12 })}{toadstool(10, { right: 26, top: -6 })}{sparkle(6, '#D9F99D', { right: 42, top: -4 })}</>,
      label: '#D9F99D', value: '#F7FEE7', name: '#BEF264',
      track: { background: '#1A2E05', borderColor: '#4D7C0F' },
      hp: 'linear-gradient(180deg, #ECFCCB, #84CC16 50%, #3F6212)',
      slot: { background: 'rgba(26,46,5,0.55)', borderColor: '#84CC16' },
      cellOn: { border: '#ECFCCB', fill: 'linear-gradient(180deg, #ECFCCB, #84CC16)', glow: 'rgba(190,242,100,0.8)' },
      cellOff: { border: '#3F6212', fill: 'linear-gradient(180deg, #4A3418, #2A1A08)' },
    },
    pause: pause({
      title: 'HUSH', sub: 'THE MUSHROOMS ARE LISTENING.',
      titleStyle: { color: '#BEF264', textShadow: '3px 3px 0 #1A2E05, 5px 5px 0 #000' },
      frame: { background: 'repeating-linear-gradient(90deg, #4A3420 0 18px, #5A4026 18px 22px)', border: '6px solid #4D7C0F', borderRadius: 6, boxShadow: FRAME_SHADOW() + ', inset 0 0 0 2px #84CC16' },
      stripe: 'linear-gradient(180deg, #65A30D, #3F6212)',
      deco: <>{toadstool(30, { right: 16, top: -18 })}{toadstool(20, { right: 50, top: -8 })}</>,
      accent: '#BEF264', text: '#F7FEE7', muted: '#D9F99D',
      dark: 'rgba(26,46,5,0.6)', line: '#4D7C0F', on: 'rgba(132,204,22,0.9)',
      button: 'linear-gradient(180deg, #DC2626, #7F1D1D)', buttonEdge: '#450A0A',
    }),
  },
  // Truelling Tragons: the three cars' colors down the edge (fire, ice, lightning), riveted coaster steel
  tragons: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(40,40,52,0.97), rgba(20,20,28,0.97))', border: '3px solid #A1A1AA', borderRadius: 4, boxShadow: PIXEL_SHADOW },
      deco: <>{edge('linear-gradient(180deg, #F97316 0 33%, #38BDF8 33% 66%, #FACC15 66%)', 6)}{rivets('#D4D4D8', 3)}{tag('3 CARS', { background: '#FACC15', color: '#18181B', right: 8 })}</>,
      label: '#E4E4E7', value: '#FFFFFF', name: '#FACC15',
      track: { background: '#09090B', borderColor: '#A1A1AA' },
      hp: 'linear-gradient(180deg, #FED7AA, #F97316 50%, #9A3412)',
      slot: { background: 'rgba(9,9,11,0.6)', borderColor: '#A1A1AA' },
      cellOn: { border: '#E0F2FE', fill: 'linear-gradient(180deg, #E0F2FE, #38BDF8)', glow: 'rgba(56,189,248,0.85)' },
      cellOff: { border: '#3F3F46', fill: 'linear-gradient(180deg, #3F3F46, #18181B)' },
    },
    pause: pause({
      title: 'KEEP ARMS INSIDE', sub: 'PICK A CAR. ANY CAR. QUICKLY.',
      titleStyle: { color: '#FACC15', textShadow: '3px 3px 0 #9A3412, 5px 5px 0 #000' },
      frame: { background: 'linear-gradient(180deg, #27272A, #09090B)', border: '6px solid #A1A1AA', borderRadius: 4, boxShadow: FRAME_SHADOW() },
      stripe: 'linear-gradient(90deg, #F97316 0 33%, #38BDF8 33% 66%, #FACC15 66%)',
      deco: rivets('#D4D4D8', 8),
      accent: '#FACC15', text: '#FAFAFA', muted: '#D4D4D8',
      dark: 'rgba(9,9,11,0.6)', line: '#71717A', on: 'rgba(250,204,21,0.9)',
      button: 'linear-gradient(180deg, #F97316, #9A3412)', buttonEdge: '#431407',
    }),
  },
  // The castle's base: pale stone blocks, a hanging banner
  keep: {
    hud: {
      panel: { background: 'repeating-linear-gradient(180deg, rgba(196,186,214,0.97) 0 11px, rgba(150,138,176,0.97) 11px 12px)', border: '3px solid #4A3A6A', borderRadius: 2, boxShadow: PIXEL_SHADOW },
      deco: <>{bit({ right: 10, top: -6, width: 16, height: 26, background: '#2E52A8', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)', boxShadow: 'inset 0 0 0 1px #E0AE3A' })}{bit({ right: 15, top: 2, width: 6, height: 6, background: '#F6D365', clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' })}</>,
      label: '#2A1E44', value: '#120A24', name: '#2E52A8',
      track: { background: '#1A1028', borderColor: '#4A3A6A' },
      hp: 'linear-gradient(180deg, #DBEAFE, #4A78D4 50%, #1E3678)',
      slot: { background: 'rgba(42,30,68,0.35)', borderColor: '#4A3A6A' },
      cellOn: { border: '#FFF6C8', fill: 'linear-gradient(180deg, #FFF6C8, #E0AE3A)', glow: 'rgba(246,211,101,0.8)' },
      cellOff: { border: '#4A3A6A', fill: 'linear-gradient(180deg, #6A5A8C, #3A2E54)' },
    },
    pause: pause({
      title: 'HALT', sub: 'SUITORS WAIT IN THE COURTYARD.',
      titleStyle: { color: '#F6D365', textShadow: '3px 3px 0 #1E3678, 5px 5px 0 #000' },
      frame: { background: 'repeating-linear-gradient(180deg, #6A5A8C 0 22px, #5A4A7A 22px 24px)', border: '6px solid #2A1E44', borderRadius: 2, boxShadow: FRAME_SHADOW() },
      stripe: 'linear-gradient(180deg, #2E52A8, #1E3678)',
      accent: '#F6D365', text: '#F4EEFA', muted: '#DCD2EC',
      dark: 'rgba(26,16,40,0.6)', line: '#9484B4', on: 'rgba(246,211,101,0.9)',
      button: 'linear-gradient(180deg, #2E52A8, #1E3678)', buttonEdge: '#0F1A3A',
    }),
  },
  // The runway: a red carpet, the gold rope and its brass posts
  runway: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(160,24,40,0.97), rgba(110,14,28,0.97))', border: '3px solid #F6D365', borderRadius: 3, boxShadow: PIXEL_SHADOW },
      deco: <>{bottomBand('repeating-linear-gradient(90deg, #F6D365 0 4px, #B07A1E 4px 8px)', 3)}{tag('VIP', { background: '#F6D365', color: '#6E0E1C', right: 8 })}</>,
      label: '#FFE4E6', value: '#FFFFFF', name: '#F6D365',
      track: { background: '#2A0408', borderColor: '#F6D365' },
      hp: 'linear-gradient(180deg, #FFF6C8, #F6D365 50%, #B07A1E)',
      slot: { background: 'rgba(42,4,8,0.5)', borderColor: '#F6D365' },
      cellOn: { border: '#FFF6C8', fill: 'linear-gradient(180deg, #FFF6C8, #F6D365)', glow: 'rgba(246,211,101,0.85)' },
      cellOff: { border: '#6E0E1C', fill: 'linear-gradient(180deg, #8A1A2A, #4A0810)' },
    },
    pause: pause({
      title: 'STRIKE A POSE', sub: 'BROOMS ARE PARK PROPERTY.',
      titleStyle: { color: '#F6D365', textShadow: '3px 3px 0 #6E0E1C, 5px 5px 0 #000' },
      frame: { background: 'linear-gradient(180deg, #A01828, #6E0E1C)', border: '6px solid #F6D365', borderRadius: 4, boxShadow: FRAME_SHADOW() },
      stripe: 'repeating-linear-gradient(90deg, #F6D365 0 8px, #B07A1E 8px 16px)',
      accent: '#F6D365', text: '#FFF1F2', muted: '#FECDD3',
      dark: 'rgba(42,4,8,0.6)', line: '#B07A1E', on: 'rgba(246,211,101,0.9)',
      button: 'linear-gradient(180deg, #F6D365, #B07A1E)', buttonEdge: '#5A3A08',
    }),
  },
  // The broomstick deathmatch: a broom's bristles along the bottom, a pennant
  broom: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(30,40,90,0.96), rgba(14,20,50,0.96))', border: '3px solid #C8962A', borderRadius: 4, boxShadow: PIXEL_SHADOW },
      deco: <>{bottomBand('repeating-linear-gradient(90deg, #D9B45A 0 2px, #8A6A2A 2px 3px)', 5)}{pennant('#F472B6', { right: 8, top: -10 })}{pennant('#38BDF8', { right: 26, top: -8 })}</>,
      label: '#E0E7FF', value: '#FFFFFF', name: '#F6D365',
      track: { background: '#0A0F22', borderColor: '#C8962A' },
      hp: 'linear-gradient(180deg, #E0E7FF, #6366F1 50%, #312E81)',
      slot: { background: 'rgba(10,15,34,0.6)', borderColor: '#C8962A' },
      cellOn: { border: '#FFF6C8', fill: 'linear-gradient(180deg, #FFF6C8, #E0AE3A)', glow: 'rgba(246,211,101,0.8)' },
      cellOff: { border: '#312E81', fill: 'linear-gradient(180deg, #3730A3, #1E1B4B)' },
    },
    pause: pause({
      title: 'HOVERING', sub: 'NO REFUNDS ON BROOMS.',
      titleStyle: { color: '#F6D365', textShadow: '3px 3px 0 #312E81, 5px 5px 0 #000' },
      frame: { background: 'linear-gradient(180deg, #1E2A5A, #0E1432)', border: '6px solid #C8962A', borderRadius: 6, boxShadow: FRAME_SHADOW() },
      stripe: 'repeating-linear-gradient(90deg, #D9B45A 0 3px, #8A6A2A 3px 5px)',
      accent: '#F6D365', text: '#EEF2FF', muted: '#C7D2FE',
      dark: 'rgba(10,15,34,0.6)', line: '#C8962A', on: 'rgba(246,211,101,0.9)',
      button: 'linear-gradient(180deg, #6366F1, #312E81)', buttonEdge: '#1E1B4B',
    }),
  },
  // Piper's chambers: pink satin, a gold heart, glitter
  piper: {
    hud: {
      panel: { background: 'radial-gradient(ellipse at 30% 0, rgba(255,255,255,0.3), transparent 60%), linear-gradient(180deg, rgba(240,120,170,0.97), rgba(190,60,120,0.97))', border: '3px solid #F6D365', borderRadius: 8, boxShadow: PIXEL_SHADOW + ', inset 0 0 0 1px #FFE4F2' },
      deco: <>
        {bit({ right: 8, top: -10, width: 16, height: 14, background: '#F6D365', clipPath: 'polygon(50% 100%, 0 35%, 15% 5%, 50% 25%, 85% 5%, 100% 35%)', boxShadow: '0 0 0 1px #7A1E4E' })}
        {sparkle(8, '#FFFFFF', { right: 28, top: -6 })}{sparkle(6, '#FEF08A', { right: 40, top: -2 })}
      </>,
      label: '#FFE4F2', value: '#FFFFFF', name: '#FEF08A',
      track: { background: '#4A0A2A', borderColor: '#F6D365' },
      hp: 'linear-gradient(180deg, #FFE4F2, #EC4899 50%, #9D174D)',
      slot: { background: 'rgba(74,10,42,0.5)', borderColor: '#F6D365', borderRadius: 4 },
      cellOn: { border: '#FFFFFF', fill: 'linear-gradient(180deg, #FFE4F2, #EC4899)', glow: 'rgba(236,72,153,0.85)' },
      cellOff: { border: '#7A1E4E', fill: 'linear-gradient(180deg, #9D174D, #4A0A2A)' },
    },
    pause: pause({
      title: 'NOT NOW, DARLING', sub: 'THE GREAT PIXIE IS INDISPOSED.',
      titleStyle: { color: '#FFE4F2', textShadow: '3px 3px 0 #9D174D, 5px 5px 0 #000' },
      frame: { background: 'radial-gradient(ellipse at 30% 0, rgba(255,255,255,0.2), transparent 60%), linear-gradient(180deg, #BE3C78, #7A1E4E)', border: '6px solid #F6D365', borderRadius: 12, boxShadow: FRAME_SHADOW() + ', inset 0 0 0 2px #FFE4F2' },
      stripe: 'repeating-linear-gradient(135deg, #EC4899 0 8px, #FFE4F2 8px 16px)',
      deco: <>{sparkle(16, '#FFFFFF', { right: 18, top: 12 })}{sparkle(10, '#FEF08A', { right: 44, top: 24 })}</>,
      accent: '#FEF08A', text: '#FFF1F7', muted: '#FBCFE8',
      dark: 'rgba(74,10,42,0.6)', line: '#F6D365', on: 'rgba(236,72,153,0.9)',
      button: 'linear-gradient(180deg, #F6D365, #B07A1E)', buttonEdge: '#5A3A08',
    }),
  },
};
