// Future Land's HUD and pause menu, a look per stretch of it: a Googie boomerang sign on the square, the giant atom's
// backstage (black flats, gaff tape, glow tape), the STAR SLED's 1990 dash on the ride, a neon starburst on the main
// drag, Space Needle 2's teal and orange rings, a capsule's cockpit in orbit, hazard tape at the crater, XENOSCARE's
// slimed bio-lab sign, and the queen's disco (a mirror ball, the dance floor's squares).

import React from 'react';
import type { Theme } from '../hudThemes';
import { edge, tag, rivets, bit, word, PIXEL_SHADOW, FRAME_SHADOW } from '../hudKit';

export type SpaceZone = 'space' | 'atom' | 'ride' | 'drag' | 'needle' | 'orbit' | 'crater' | 'xenoscare' | 'queen';

/** A Googie starburst (a ring of spikes). */
const starburst = (size: number, col: string, style: React.CSSProperties) => bit({ width: size, height: size, background: `repeating-conic-gradient(${col} 0 6deg, transparent 0 30deg)`, WebkitMask: 'radial-gradient(circle, #000 48%, transparent 50%)', mask: 'radial-gradient(circle, #000 48%, transparent 50%)', ...style });
/** A little planet with its ring. */
const planet = (style: React.CSSProperties) => <>
  {bit({ width: 12, height: 12, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #FBCFE8, #EC4899 60%, #831843)', boxShadow: '0 0 0 1px #000', ...style })}
  {bit({ width: 22, height: 5, borderRadius: '50%', border: '1.5px solid #FDE68A', boxSizing: 'border-box', ...style, transform: 'translate(5px, 3.5px) rotate(-18deg)' })}
</>;
/** Stars sprinkled over a background. */
const STARS = 'radial-gradient(circle at 20% 30%, #FFF 0.6px, transparent 1px), radial-gradient(circle at 70% 60%, #FFF 0.5px, transparent 1px), radial-gradient(circle at 45% 80%, #C7D2FE 0.5px, transparent 1px)';

export const SPACE_THEMES: Record<SpaceZone, Theme> = {
  // The square: a Googie boomerang sign, turquoise and atomic orange, a starburst on top
  space: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(45,212,191,0.96), rgba(13,148,136,0.96))', border: '3px solid #FFF7ED', borderRadius: '18px 4px 18px 4px', boxShadow: '0 0 0 2px #134E4A, 3px 3px 0 2px rgba(0,0,0,0.55)' },
      deco: <>
        {starburst(22, '#FB923C', { right: -9, top: -11 })}
        {bit({ right: 1, top: -1, width: 4, height: 4, borderRadius: '50%', background: '#FFF7ED' })}
        {bit({ left: 10, right: 34, bottom: 3, height: 3, borderRadius: 2, background: 'linear-gradient(90deg, #FB923C, #FDE047)' })}
        {tag('THE FUTURE!', { background: '#FB923C', color: '#FFF7ED', right: 18, borderRadius: 6, boxShadow: '0 0 0 1px #134E4A' })}
      </>,
      label: '#042F2E', value: '#022C22', name: '#9A3412',
      track: { background: '#042F2E', borderColor: '#FFF7ED' },
      hp: 'linear-gradient(180deg, #FED7AA, #FB923C 50%, #C2410C)',
      slot: { background: 'rgba(255,247,237,0.4)', borderColor: '#FFF7ED', borderRadius: '10px 2px 10px 2px' },
      cellOn: { border: '#FFF7ED', fill: 'linear-gradient(180deg, #FEF08A, #FB923C)', glow: 'rgba(251,146,60,0.85)' },
      cellOff: { border: '#134E4A', fill: 'linear-gradient(180deg, #0F766E, #134E4A)' },
    },
    pause: {
      title: 'TOMORROW CAN WAIT', sub: 'THE FUTURE IS ON HOLD',
      titleStyle: { color: '#FFF7ED', textShadow: '3px 3px 0 #EA580C, 5px 5px 0 #134E4A' },
      frame: { background: 'linear-gradient(180deg, #2DD4BF, #0F766E)', border: '4px solid #FFF7ED', borderRadius: '40px 8px 40px 8px', boxShadow: FRAME_SHADOW('#134E4A') },
      stripe: 'repeating-linear-gradient(90deg, #FB923C 0 16px, #FDE047 16px 24px, #FFF7ED 24px 28px)',
      deco: starburst(46, '#FB923C', { right: -10, top: -16 }),
      accent: '#7C2D12', text: '#022C22', muted: '#134E4A',
      well: { background: 'rgba(255,255,255,0.25)', border: '2px solid #FFF7ED', borderRadius: 10 },
      slot: 'rgba(4,47,46,0.9)', slotOn: 'rgba(253,224,71,0.95)',
      button: 'linear-gradient(180deg, #FB923C, #C2410C)', buttonEdge: '#7C2D12',
    },
  },
  // Inside the atom: backstage of the dark ride: black-painted flats, gaff tape, glow-tape marks, a work light
  atom: {
    hud: {
      panel: { background: 'radial-gradient(ellipse at 85% 0, rgba(254,249,195,0.16), transparent 50%), linear-gradient(180deg, rgba(24,24,27,0.97), rgba(9,9,11,0.97))', border: '2px solid #3F3F46', boxShadow: PIXEL_SHADOW },
      deco: <>
        {bit({ left: -4, top: 6, width: 20, height: 6, background: '#71717A', transform: 'rotate(-14deg)', opacity: 0.9 })}
        {bit({ right: -4, bottom: 8, width: 18, height: 6, background: '#71717A', transform: 'rotate(10deg)', opacity: 0.9 })}
        {bit({ left: 24, bottom: 2, width: 10, height: 3, background: '#BEF264', boxShadow: '0 0 4px #A3E635' })}
        {bit({ left: 40, bottom: 2, width: 10, height: 3, background: '#BEF264', boxShadow: '0 0 4px #A3E635' })}
        {tag('CAST ONLY', { background: '#FAFAFA', color: '#18181B', transform: 'rotate(3deg)', boxShadow: '0 0 0 1px #000' })}
      </>,
      label: '#D4D4D8', value: '#FAFAFA', name: '#BEF264',
      track: { background: '#000', borderColor: '#3F3F46' },
      hp: 'linear-gradient(180deg, #ECFCCB, #A3E635 50%, #4D7C0F)',
      slot: { background: 'rgba(0,0,0,0.6)', borderColor: '#52525B' },
      cellOn: { border: '#BEF264', fill: 'linear-gradient(180deg, #ECFCCB, #84CC16)', glow: 'rgba(163,230,53,0.85)' },
      cellOff: { border: '#3F3F46', fill: 'linear-gradient(180deg, #3F3F46, #18181B)' },
    },
    pause: {
      title: 'HOLD', sub: 'RIDE STOPPED. PLEASE REMAIN SEATED. YOU ARE NOT SEATED.',
      titleStyle: { color: '#FAFAFA', textShadow: '3px 3px 0 #3F3F46, 5px 5px 0 #000' },
      frame: { background: 'radial-gradient(ellipse at 80% 0, rgba(254,249,195,0.12), transparent 50%), linear-gradient(180deg, #18181B, #09090B)', border: '4px solid #3F3F46', boxShadow: FRAME_SHADOW() },
      stripe: 'repeating-linear-gradient(90deg, #BEF264 0 14px, transparent 14px 28px)',
      deco: <>{bit({ left: -8, top: 18, width: 60, height: 12, background: '#71717A', transform: 'rotate(-12deg)', opacity: 0.85 })}{bit({ right: -8, bottom: 40, width: 50, height: 12, background: '#71717A', transform: 'rotate(8deg)', opacity: 0.85 })}</>,
      accent: '#BEF264', text: '#F4F4F5', muted: '#A1A1AA',
      well: { background: 'rgba(0,0,0,0.6)', border: '1px solid #3F3F46' },
      slot: 'rgba(0,0,0,0.92)', slotOn: 'rgba(190,242,100,0.9)',
      button: 'linear-gradient(180deg, #3F3F46, #18181B)', buttonEdge: '#000',
    },
  },
  // The ride: the STAR SLED's 1990 dash: black plastic, a magenta-cyan sweep, a seven-segment readout
  ride: {
    hud: {
      panel: { background: 'linear-gradient(170deg, transparent 72%, rgba(34,211,238,0.5) 72.5%, rgba(34,211,238,0.5) 75%, rgba(236,72,153,0.5) 75.5%, rgba(236,72,153,0.5) 78%, transparent 78.5%), linear-gradient(180deg, rgba(30,27,46,0.97), rgba(12,10,24,0.97))', border: '2px solid #6366F1', borderRadius: 6, boxShadow: '0 0 0 2px #000, 3px 3px 0 2px rgba(0,0,0,0.6), 0 0 8px rgba(236,72,153,0.4)' },
      deco: <>
        {edge('linear-gradient(180deg, #22D3EE, #EC4899)', 3)}
        {word('88:88', { right: 8, bottom: 5, color: '#F472B6', fontFamily: 'monospace', textShadow: '0 0 4px #EC4899' })}
        {tag('STAR SLED', { background: 'linear-gradient(90deg, #EC4899, #22D3EE)', color: '#0C0A18', fontStyle: 'italic', boxShadow: '0 0 0 1px #000' })}
      </>,
      label: '#67E8F9', value: '#F0ABFC', name: '#F472B6',
      track: { background: '#05040C', borderColor: '#4338CA' },
      hp: 'linear-gradient(90deg, #22D3EE, #A855F7 60%, #EC4899)',
      slot: { background: 'rgba(5,4,12,0.75)', borderColor: '#EC4899', borderRadius: 4 },
      cellOn: { border: '#67E8F9', fill: 'linear-gradient(180deg, #A5F3FC, #22D3EE)', glow: 'rgba(34,211,238,0.85)' },
      cellOff: { border: '#4338CA', fill: 'linear-gradient(180deg, #4338CA, #1E1B4B)' },
    },
    pause: {
      title: 'EMERGENCY STOP', sub: 'THIS RIDE INSPECTED: 1990',
      titleStyle: { color: '#F472B6', fontStyle: 'italic', textShadow: '0 0 6px rgba(236,72,153,0.8), 3px 3px 0 #0E7490' },
      frame: { background: 'linear-gradient(170deg, transparent 80%, rgba(34,211,238,0.3) 80.5%, rgba(34,211,238,0.3) 83%, rgba(236,72,153,0.3) 83.5%, rgba(236,72,153,0.3) 86%, transparent 86.5%), linear-gradient(180deg, #1E1B2E, #0C0A18)', border: '4px solid #6366F1', borderRadius: 10, boxShadow: FRAME_SHADOW('#000', 'rgba(236,72,153,0.3)') },
      stripe: 'linear-gradient(90deg, #22D3EE, #A855F7, #EC4899)',
      accent: '#22D3EE', text: '#FAE8FF', muted: '#F0ABFC',
      well: { background: 'rgba(5,4,12,0.65)', border: '1px solid #4338CA' },
      slot: 'rgba(5,4,12,0.92)', slotOn: 'rgba(103,232,249,0.9)',
      button: 'linear-gradient(180deg, #DB2777, #9D174D)', buttonEdge: '#500724',
    },
  },
  // The main drag: a neon sign at dusk: pink tube on a dark board, a starburst, a planet with its ring
  drag: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(30,27,75,0.96), rgba(17,15,46,0.96))', border: '2px solid #F472B6', borderRadius: 10, boxShadow: '0 0 0 2px #000, 3px 3px 0 2px rgba(0,0,0,0.6), 0 0 10px rgba(244,114,182,0.6), inset 0 0 6px rgba(244,114,182,0.4)' },
      deco: <>
        {planet({ right: 6, top: -8 })}
        {starburst(14, '#67E8F9', { right: 28, top: -7 })}
        {bit({ left: 6, top: 4, bottom: 4, width: 2, borderRadius: 1, background: '#67E8F9', boxShadow: '0 0 4px #22D3EE' })}
      </>,
      label: '#F9A8D4', value: '#FFFFFF', name: '#67E8F9',
      track: { background: '#0B0A24', borderColor: '#9D174D' },
      hp: 'linear-gradient(180deg, #FBCFE8, #F472B6 50%, #BE185D)',
      slot: { background: 'rgba(11,10,36,0.7)', borderColor: '#67E8F9', borderRadius: 8, boxShadow: '0 0 6px rgba(103,232,249,0.6)' },
      cellOn: { border: '#FBCFE8', fill: 'linear-gradient(180deg, #FBCFE8, #EC4899)', glow: 'rgba(244,114,182,0.9)' },
      cellOff: { border: '#3730A3', fill: 'linear-gradient(180deg, #3730A3, #1E1B4B)' },
    },
    pause: {
      title: 'CLOSED', sub: 'SORRY! WE ARE OPEN TOMORROW (THE FUTURE)',
      titleStyle: { color: '#FBCFE8', textShadow: '0 0 6px #F472B6, 0 0 14px #EC4899, 3px 3px 0 #000' },
      frame: { background: 'linear-gradient(180deg, #1E1B4B, #0B0A24)', border: '4px solid #F472B6', borderRadius: 18, boxShadow: FRAME_SHADOW('#000', 'rgba(244,114,182,0.4)') + ', inset 0 0 12px rgba(244,114,182,0.35)' },
      stripe: 'linear-gradient(90deg, #67E8F9, #F472B6, #67E8F9)',
      deco: starburst(40, '#67E8F9', { right: 14, top: -14 }),
      accent: '#67E8F9', text: '#FCE7F3', muted: '#F9A8D4',
      well: { background: 'rgba(11,10,36,0.6)', border: '1px solid #9D174D' },
      slot: 'rgba(11,10,36,0.92)', slotOn: 'rgba(103,232,249,0.9)',
      button: 'linear-gradient(180deg, #EC4899, #9D174D)', buttonEdge: '#500724',
    },
  },
  // Space Needle 2: its teal decks, chrome rims and the orange rings up its shaft
  needle: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(229,231,235,0.97) 0 4px, rgba(20,184,166,0.96) 4px, rgba(15,118,110,0.96))', border: '2px solid #E5E7EB', borderRadius: '12px 12px 4px 4px', boxShadow: '0 0 0 2px #134E4A, 3px 3px 0 2px rgba(0,0,0,0.6), inset 0 -2px 0 #9CA3AF' },
      deco: <>
        {edge('repeating-linear-gradient(180deg, #F97316 0 3px, #D1D5DB 3px 9px)', 5)}
        {bit({ right: 12, top: -8, width: 14, height: 8, borderRadius: '50% 50% 0 0', background: 'linear-gradient(180deg, #5EEAD4, #0F766E)', boxShadow: '0 0 0 1px #E5E7EB' })}
        {bit({ right: 18, top: -12, width: 2, height: 5, background: '#E5E7EB' })}
        {tag('OBSERVATION DECK', { background: '#F97316', color: '#FFF7ED', right: 30, boxShadow: '0 0 0 1px #134E4A' })}
      </>,
      label: '#F0FDFA', value: '#FFFFFF', name: '#FDBA74',
      track: { background: '#042F2E', borderColor: '#9CA3AF' },
      hp: 'linear-gradient(180deg, #FED7AA, #F97316 50%, #C2410C)',
      slot: { background: 'linear-gradient(180deg, rgba(229,231,235,0.4), rgba(4,47,46,0.6))', borderColor: '#E5E7EB', borderRadius: '50% 50% 4px 4px' },
      cellOn: { border: '#FED7AA', fill: 'linear-gradient(180deg, #FED7AA, #F97316)', glow: 'rgba(249,115,22,0.8)' },
      cellOff: { border: '#134E4A', fill: 'linear-gradient(180deg, #0F766E, #042F2E)' },
    },
    pause: {
      title: 'ON THE WAY UP', sub: 'NEXT STOP: OUTER SPACE. PLEASE HOLD THE RAIL.',
      titleStyle: { color: '#FFF', textShadow: '3px 3px 0 #EA580C, 5px 5px 0 #134E4A' },
      frame: { background: 'linear-gradient(180deg, #14B8A6, #0F766E 60%, #134E4A)', border: '5px solid #E5E7EB', borderRadius: '30px 30px 8px 8px', boxShadow: FRAME_SHADOW('#134E4A') + ', inset 0 0 0 2px #9CA3AF' },
      stripe: 'repeating-linear-gradient(90deg, #F97316 0 8px, #E5E7EB 8px 12px)',
      accent: '#FDBA74', text: '#F0FDFA', muted: '#99F6E4',
      well: { background: 'rgba(4,47,46,0.55)', border: '1px solid #9CA3AF' },
      slot: 'rgba(4,47,46,0.92)', slotOn: 'rgba(253,186,116,0.95)',
      button: 'linear-gradient(180deg, #F97316, #C2410C)', buttonEdge: '#7C2D12',
    },
  },
  // In orbit: a capsule's instrument panel, the stars through it, a planet going by
  orbit: {
    hud: {
      panel: { backgroundImage: STARS + ', linear-gradient(180deg, rgba(3,7,30,0.96), rgba(2,4,18,0.96))', backgroundSize: '18px 14px, 26px 20px, 22px 18px, auto', border: '3px solid #94A3B8', borderRadius: 8, boxShadow: '0 0 0 2px #000, 3px 3px 0 2px rgba(0,0,0,0.6), inset 0 0 0 1px #E2E8F0' },
      deco: <>
        {rivets('#CBD5E1', 3)}
        {planet({ right: 12, top: -6 })}
        {tag('ALT: VERY', { background: '#E2E8F0', color: '#0F172A', right: 36, fontFamily: 'monospace', boxShadow: '0 0 0 1px #000' })}
      </>,
      label: '#93C5FD', value: '#F8FAFC', name: '#FDE68A',
      track: { background: '#020412', borderColor: '#475569' },
      hp: 'linear-gradient(180deg, #BFDBFE, #3B82F6 50%, #1E3A8A)',
      slot: { background: 'rgba(2,4,18,0.75)', borderColor: '#94A3B8', borderRadius: '50%' },
      cellOn: { border: '#FDE68A', fill: 'linear-gradient(180deg, #FEF9C3, #FACC15)', glow: 'rgba(250,204,21,0.8)' },
      cellOff: { border: '#334155', fill: 'linear-gradient(180deg, #334155, #0F172A)' },
      hpLabel: 'O2',
    },
    pause: {
      title: 'ZERO G', sub: 'IN SPACE, NOBODY CAN HEAR YOU PAUSE',
      titleStyle: { color: '#E2E8F0', textShadow: '3px 3px 0 #1E3A8A, 5px 5px 0 #000' },
      frame: { backgroundImage: STARS + ', linear-gradient(180deg, #03071E, #020412)', backgroundSize: '40px 30px, 60px 46px, 50px 40px, auto', border: '6px solid #94A3B8', borderRadius: 24, boxShadow: FRAME_SHADOW() + ', inset 0 0 0 2px #E2E8F0' },
      stripe: 'repeating-linear-gradient(90deg, #E2E8F0 0 2px, #475569 2px 10px)',
      deco: rivets('#CBD5E1', 10),
      accent: '#FDE68A', text: '#F1F5F9', muted: '#93C5FD',
      well: { background: 'rgba(2,4,18,0.6)', border: '1px solid #475569' },
      slot: 'rgba(2,4,18,0.92)', slotOn: 'rgba(250,204,21,0.9)',
      button: 'linear-gradient(180deg, #475569, #1E293B)', buttonEdge: '#020617',
    },
  },
  // The crater: the impact site's yellow hazard tape round a scorched plate, a warning light
  crater: {
    hud: {
      panel: { background: 'radial-gradient(ellipse at 30% 100%, rgba(0,0,0,0.5), transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(249,115,22,0.18), transparent 50%), linear-gradient(180deg, rgba(68,64,60,0.97), rgba(41,37,36,0.97))', border: '3px solid transparent', borderImage: 'repeating-linear-gradient(45deg, #FACC15 0 5px, #1C1917 5px 10px) 3', boxShadow: PIXEL_SHADOW },
      deco: <>
        {bit({ right: 6, top: -7, width: 8, height: 6, borderRadius: '4px 4px 0 0', background: '#F97316', boxShadow: '0 0 6px #F97316' })}
        {tag('DO NOT CROSS', { background: '#FACC15', color: '#1C1917', right: 18, transform: 'rotate(-3deg)' })}
      </>,
      label: '#FDE68A', value: '#FAFAF9', name: '#FB923C',
      track: { background: '#0C0A09', borderColor: '#57534E' },
      hp: 'linear-gradient(180deg, #FEF08A, #FACC15 50%, #A16207)',
      slot: { background: 'rgba(12,10,9,0.65)', borderColor: '#FACC15' },
      cellOn: { border: '#FEF08A', fill: 'linear-gradient(180deg, #FEF08A, #EAB308)', glow: 'rgba(250,204,21,0.8)' },
      cellOff: { border: '#57534E', fill: 'linear-gradient(180deg, #57534E, #292524)' },
    },
    pause: {
      title: 'IMPACT SITE', sub: 'AUTHORIZED SCIENTISTS AND LOOTERS ONLY',
      titleStyle: { color: '#FACC15', textShadow: '3px 3px 0 #1C1917, 5px 5px 0 #000' },
      frame: { background: 'radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.45), transparent 60%), linear-gradient(180deg, #44403C, #1C1917)', border: '6px solid transparent', borderImage: 'repeating-linear-gradient(45deg, #FACC15 0 10px, #1C1917 10px 20px) 6', boxShadow: FRAME_SHADOW() },
      stripe: 'repeating-linear-gradient(45deg, #FACC15 0 8px, #1C1917 8px 16px)',
      accent: '#FACC15', text: '#FAFAF9', muted: '#D6D3D1',
      well: { background: 'rgba(12,10,9,0.55)', border: '1px solid #57534E' },
      slot: 'rgba(12,10,9,0.92)', slotOn: 'rgba(250,204,21,0.9)',
      button: 'linear-gradient(180deg, #CA8A04, #854D0E)', buttonEdge: '#422006',
    },
  },
  // XENOSCARE: the haunted house's bio-lab sign, slime dripping off its top, a biohazard-ish badge
  xenoscare: {
    hud: {
      panel: { backgroundImage: 'radial-gradient(circle at 15% 70%, rgba(132,204,22,0.18) 6px, transparent 7px), radial-gradient(circle at 75% 40%, rgba(132,204,22,0.12) 9px, transparent 10px), linear-gradient(180deg, rgba(20,30,20,0.97), rgba(8,14,8,0.97))', border: '2px solid #65A30D', boxShadow: '0 0 0 2px #000, 3px 3px 0 2px rgba(0,0,0,0.6), 0 0 8px rgba(132,204,22,0.35)' },
      deco: <>
        {bit({ left: 6, right: 30, top: -1, height: 8, background: 'radial-gradient(ellipse 3px 7px at 50% 0, #A3E635 70%, transparent 75%) 0 0 / 11px 8px repeat-x, radial-gradient(ellipse 2px 4px at 30% 0, #84CC16 70%, transparent 75%) 0 0 / 17px 8px repeat-x' })}
        {bit({ right: 6, bottom: 5, width: 12, height: 12, borderRadius: '50%', background: 'repeating-conic-gradient(#A3E635 0 60deg, transparent 0 120deg)', WebkitMask: 'radial-gradient(circle, transparent 1.5px, #000 2px)', mask: 'radial-gradient(circle, transparent 1.5px, #000 2px)' })}
        {tag('XENOSCARE', { background: '#1A2E05', color: '#BEF264', fontStyle: 'italic', boxShadow: '0 0 0 1px #65A30D, 0 0 6px rgba(163,230,53,0.7)' })}
      </>,
      label: '#BEF264', value: '#F7FEE7', name: '#D9F99D',
      track: { background: '#020602', borderColor: '#365314' },
      hp: 'linear-gradient(180deg, #ECFCCB, #84CC16 50%, #365314)',
      slot: { background: 'rgba(2,6,2,0.7)', borderColor: '#65A30D', borderRadius: '40% 60% 50% 50%' },
      cellOn: { border: '#D9F99D', fill: 'linear-gradient(180deg, #ECFCCB, #84CC16)', glow: 'rgba(132,204,22,0.9)' },
      cellOff: { border: '#365314', fill: 'linear-gradient(180deg, #365314, #1A2E05)' },
    },
    pause: {
      title: 'CONTAINMENT', sub: 'DO NOT FEED THE SPECIMENS. THEY ARE ALREADY EATING.',
      titleStyle: { color: '#BEF264', textShadow: '0 0 8px rgba(163,230,53,0.8), 3px 3px 0 #000' },
      frame: { backgroundImage: 'radial-gradient(circle at 15% 70%, rgba(132,204,22,0.12) 20px, transparent 22px), radial-gradient(circle at 80% 30%, rgba(132,204,22,0.1) 30px, transparent 32px), linear-gradient(180deg, #141E14, #080E08)', border: '4px solid #65A30D', boxShadow: FRAME_SHADOW('#000', 'rgba(132,204,22,0.25)') },
      stripe: 'radial-gradient(ellipse 4px 10px at 50% 0, #A3E635 70%, transparent 75%) 0 0 / 14px 6px repeat-x, linear-gradient(90deg, #365314, #365314)',
      accent: '#BEF264', text: '#F7FEE7', muted: '#84CC16',
      well: { background: 'rgba(2,6,2,0.6)', border: '1px solid #365314' },
      slot: 'rgba(2,6,2,0.92)', slotOn: 'rgba(190,242,100,0.9)',
      button: 'linear-gradient(180deg, #4D7C0F, #1A2E05)', buttonEdge: '#020602',
    },
  },
  // The queen's disco: a mirror ball, the light-up dance floor's squares, a violet glow
  queen: {
    hud: {
      panel: { backgroundImage: 'conic-gradient(rgba(236,72,153,0.35) 0 25%, rgba(34,211,238,0.35) 0 50%, rgba(250,204,21,0.35) 0 75%, rgba(168,85,247,0.35) 0)', backgroundSize: '16px 16px', backgroundColor: 'rgba(15,5,30,0.95)', border: '2px solid #E879F9', boxShadow: '0 0 0 2px #000, 3px 3px 0 2px rgba(0,0,0,0.6), 0 0 10px rgba(232,121,249,0.55)' },
      deco: <>
        {bit({ right: 10, top: -11, width: 1, height: 4, background: '#A1A1AA' })}
        {bit({ right: 4, top: -8, width: 14, height: 14, borderRadius: '50%', backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(0deg, rgba(0,0,0,0.3) 1px, transparent 1px), radial-gradient(circle at 35% 35%, #FFF, #CBD5E1 50%, #64748B)', backgroundSize: '3px 3px, 3px 3px, auto', boxShadow: '0 0 0 1px #000, 0 0 8px rgba(255,255,255,0.7)' })}
        {tag('ALL HAIL', { background: '#A855F7', color: '#FFF', right: 22, boxShadow: '0 0 0 1px #000, 0 0 6px rgba(168,85,247,0.8)' })}
      </>,
      label: '#F5D0FE', value: '#FFFFFF', name: '#FDE047',
      track: { background: '#0A0314', borderColor: '#7E22CE' },
      hp: 'linear-gradient(90deg, #EC4899, #A855F7, #22D3EE)',
      slot: { background: 'rgba(10,3,20,0.75)', borderColor: '#E879F9' },
      cellOn: { border: '#FDE047', fill: 'linear-gradient(180deg, #FEF9C3, #FACC15)', glow: 'rgba(250,204,21,0.9)' },
      cellOff: { border: '#7E22CE', fill: 'linear-gradient(180deg, #7E22CE, #3B0764)' },
    },
    pause: {
      title: 'THE MUSIC STOPS', sub: 'HER MAJESTY WILL SEE YOU NOW. AND EAT YOU.',
      titleStyle: { color: '#FDE047', textShadow: '0 0 6px #E879F9, 3px 3px 0 #7E22CE, 5px 5px 0 #000' },
      frame: { backgroundImage: 'conic-gradient(rgba(236,72,153,0.22) 0 25%, rgba(34,211,238,0.22) 0 50%, rgba(250,204,21,0.22) 0 75%, rgba(168,85,247,0.22) 0)', backgroundSize: '40px 40px', backgroundColor: '#0F051E', border: '4px solid #E879F9', boxShadow: FRAME_SHADOW('#000', 'rgba(232,121,249,0.35)') },
      stripe: 'linear-gradient(90deg, #EC4899, #FACC15, #22D3EE, #A855F7, #EC4899)',
      accent: '#FDE047', text: '#FAE8FF', muted: '#E879F9',
      well: { background: 'rgba(10,3,20,0.75)', border: '1px solid #7E22CE' },
      slot: 'rgba(10,3,20,0.95)', slotOn: 'rgba(250,204,21,0.9)',
      button: 'linear-gradient(180deg, #A855F7, #6B21A8)', buttonEdge: '#3B0764',
    },
  },
};
