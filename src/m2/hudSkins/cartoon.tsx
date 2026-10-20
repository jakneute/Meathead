// Cartoon Land's HUD and pause menu, a look per stretch of it: a puffy candy-striped cloud board in Sillyville Square, a
// 1994 animation cel on its film strip in the studio, the cartoon White House's paper-white and seal gold (both halves),
// a '90s neon squiggle among the big-kid rides, a too-violent cartoon's red and yellow in the cat-and-mouse knockoff, and
// the amphitheater's stage boards under a spotlight.

import React from 'react';
import type { Theme } from '../hudThemes';
import { edge, tag, rivets, corners, bit, bottomBand, PIXEL_SHADOW, FRAME_SHADOW } from '../hudKit';

export type CartoonZone = 'cartoon' | 'studio' | 'whitehouse' | 'bigkid' | 'itchy' | 'amphi';

/** A five-point star. */
const star = (size: number, col: string, style: React.CSSProperties) => bit({ width: size, height: size, background: col, clipPath: 'polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', ...style });
/** A puff of cartoon cloud. */
const puff = (w: number, col: string, style: React.CSSProperties) => bit({ width: w, height: w * 0.6, background: `radial-gradient(circle at 25% 60%, ${col} 0 28%, transparent 29%), radial-gradient(circle at 55% 40%, ${col} 0 34%, transparent 35%), radial-gradient(circle at 80% 62%, ${col} 0 26%, transparent 27%)`, ...style });
/** Film sprocket holes along an edge. */
const SPROCKETS = 'repeating-linear-gradient(90deg, transparent 0 4px, #F8FAFC 4px 8px, transparent 8px 12px)';

const pause = (p: Omit<Theme['pause'], 'well' | 'slot' | 'slotOn'> & { dark: string; line: string; on: string }): Theme['pause'] => {
  const { dark, line, on, ...rest } = p;
  return { ...rest, well: { background: dark, border: `1px solid ${line}` }, slot: dark.replace(/0\.\d+\)$/, '0.92)'), slotOn: on };
};

export const CARTOON_THEMES: Record<CartoonZone, Theme> = {
  // Sillyville Square: a puffy cloud board in candy stripes, a lollipop, a little cloud
  cartoon: {
    hud: {
      panel: { background: 'repeating-linear-gradient(135deg, rgba(249,168,212,0.97) 0 8px, rgba(255,247,232,0.97) 8px 16px)', border: '3px solid #1A1028', borderRadius: 12, boxShadow: PIXEL_SHADOW + ', inset 0 0 0 2px #FFFFFF' },
      deco: <>
        {puff(26, '#FFFFFF', { right: 4, top: -12, filter: 'drop-shadow(0 0 1px #1A1028)' })}
        {bit({ right: 34, top: -10, width: 10, height: 10, borderRadius: '50%', background: 'conic-gradient(#EF4444 0 25%, #FDE047 0 50%, #3B82F6 0 75%, #22C55E 0)', boxShadow: '0 0 0 1px #1A1028' })}
        {tag('SILLYVILLE', { background: '#7C3AED', color: '#FDE047', right: 50, boxShadow: '0 0 0 1px #1A1028' })}
      </>,
      label: '#4C1D95', value: '#1A1028', name: '#BE185D',
      track: { background: '#1A1028', borderColor: '#1A1028' },
      hp: 'linear-gradient(180deg, #FEF08A, #F472B6 50%, #BE185D)',
      slot: { background: 'rgba(255,255,255,0.55)', borderColor: '#1A1028' },
      cellOn: { border: '#FFFFFF', fill: 'linear-gradient(180deg, #FEF08A, #F472B6)', glow: 'rgba(244,114,182,0.85)' },
      cellOff: { border: '#4C1D95', fill: 'linear-gradient(180deg, #C4B5FD, #6D28D9)' },
    },
    pause: pause({
      title: 'TIME OUT!', sub: 'NO GOOD RIDES. NO REFUNDS.',
      titleStyle: { color: '#FDE047', textShadow: '3px 3px 0 #BE185D, 5px 5px 0 #1A1028' },
      frame: { background: 'radial-gradient(ellipse at 30% 10%, rgba(255,255,255,0.35), transparent 60%), linear-gradient(180deg, #38BDF8, #0EA5E9)', border: '6px solid #1A1028', borderRadius: 18, boxShadow: FRAME_SHADOW() + ', inset 0 0 0 3px #FFFFFF' },
      stripe: 'repeating-linear-gradient(135deg, #F472B6 0 8px, #FFF7E8 8px 16px)',
      deco: <>{puff(60, '#FFFFFF', { right: 14, top: -22, filter: 'drop-shadow(0 0 2px #1A1028)' })}</>,
      accent: '#FDE047', text: '#FFFFFF', muted: '#E0F2FE',
      dark: 'rgba(12,74,110,0.55)', line: '#1A1028', on: 'rgba(253,224,71,0.9)',
      button: 'linear-gradient(180deg, #EC4899, #BE185D)', buttonEdge: '#1A1028',
    }),
  },
  // The studio: a 1994 animation cel on its strip (sprocket holes), a pencil, EST. 1994
  studio: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(30,27,46,0.96), rgba(18,16,30,0.96))', border: '3px solid #94A3B8', borderRadius: 2, boxShadow: PIXEL_SHADOW },
      deco: <>
        {bit({ left: 0, right: 0, top: 1, height: 4, background: SPROCKETS })}
        {bottomBand(SPROCKETS, 4)}
        {bit({ right: 10, top: -9, width: 28, height: 6, background: 'linear-gradient(90deg, #F472B6 0 4px, #FDE047 4px 22px, #1E293B 22px)', transform: 'rotate(-12deg)', boxShadow: '0 0 0 1px #000' })}
        {tag('EST. 1994', { background: '#FDE047', color: '#1E1B2E', right: 44 })}
      </>,
      label: '#CBD5E1', value: '#F8FAFC', name: '#FDE047',
      track: { background: '#0B0A14', borderColor: '#94A3B8' },
      slot: { background: 'rgba(148,163,184,0.15)', borderColor: '#94A3B8' },
    },
    pause: pause({
      title: 'PAUSED', sub: 'THE MAGIC IS ON A COFFEE BREAK. THE SUCKERS ARE NOT.',
      titleStyle: { color: '#FDE047', textShadow: '3px 3px 0 #6D28D9, 5px 5px 0 #000' },
      frame: { background: 'linear-gradient(180deg, #241638, #120A1E)', border: '6px solid #94A3B8', borderRadius: 4, boxShadow: FRAME_SHADOW() },
      stripe: SPROCKETS.replace('#F8FAFC', '#94A3B8'),
      accent: '#FDE047', text: '#F8FAFC', muted: '#CBD5E1',
      dark: 'rgba(11,10,20,0.6)', line: '#94A3B8', on: 'rgba(253,224,71,0.85)',
      button: 'linear-gradient(180deg, #6D28D9, #4C1D95)', buttonEdge: '#000',
    }),
  },
  // The cartoon White House: paper white, a blue rule, the seal's gold, stars and stripes
  whitehouse: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(255,255,255,0.97), rgba(232,226,210,0.97))', border: '3px solid #1E3A8A', borderRadius: 6, boxShadow: PIXEL_SHADOW + ', inset 0 0 0 1px #CA8A04' },
      deco: <>
        {edge('repeating-linear-gradient(180deg, #B91C1C 0 4px, #FFFFFF 4px 8px)', 5)}
        {bit({ right: 6, top: -10, width: 18, height: 18, borderRadius: '50%', background: 'radial-gradient(circle, #FDE68A 0 40%, #CA8A04 41% 70%, #1E3A8A 71%)', boxShadow: '0 0 0 1px #000' })}
        {star(9, '#1E3A8A', { right: 30, top: -6 })}
        {tag('WACKY!', { background: '#B91C1C', color: '#FFFFFF', right: 44 })}
      </>,
      label: '#1E3A8A', value: '#0F172A', name: '#B91C1C',
      track: { background: '#0F172A', borderColor: '#1E3A8A' },
      hp: 'linear-gradient(180deg, #FCA5A5, #DC2626 50%, #7F1D1D)',
      slot: { background: 'rgba(30,58,138,0.12)', borderColor: '#1E3A8A' },
    },
    pause: pause({
      title: 'RECESS', sub: 'CONGRESS IS ALSO ON A BREAK.',
      titleStyle: { color: '#FFFFFF', textShadow: '3px 3px 0 #B91C1C, 5px 5px 0 #1E3A8A' },
      frame: { background: 'linear-gradient(180deg, #1E3A8A, #172554)', border: '6px solid #FFFFFF', borderRadius: 6, boxShadow: FRAME_SHADOW() + ', inset 0 0 0 3px #CA8A04' },
      stripe: 'repeating-linear-gradient(180deg, #B91C1C 0 6px, #FFFFFF 6px 12px)',
      deco: <>{star(18, '#FFFFFF', { right: 20, top: 14 })}{star(12, '#FFFFFF', { right: 44, top: 22 })}</>,
      accent: '#FDE68A', text: '#FFFFFF', muted: '#BFDBFE',
      dark: 'rgba(15,23,42,0.6)', line: '#CA8A04', on: 'rgba(253,230,138,0.9)',
      button: 'linear-gradient(180deg, #B91C1C, #7F1D1D)', buttonEdge: '#000',
    }),
  },
  // The big-kid rides: a '90s neon squiggle (teal, purple, yellow), a lightning bolt
  bigkid: {
    hud: {
      panel: { background: 'radial-gradient(circle at 20% 30%, rgba(253,224,71,0.5) 0 4px, transparent 5px), radial-gradient(circle at 70% 70%, rgba(236,72,153,0.5) 0 3px, transparent 4px), linear-gradient(135deg, rgba(20,184,166,0.96), rgba(124,58,237,0.96))', border: '3px solid #FDE047', borderRadius: 3, boxShadow: PIXEL_SHADOW },
      deco: <>
        {bit({ right: 8, top: -12, width: 12, height: 20, background: '#FDE047', clipPath: 'polygon(40% 0, 100% 0, 60% 45%, 90% 45%, 20% 100%, 40% 55%, 10% 55%)', filter: 'drop-shadow(0 0 1px #000)' })}
        {tag('BIG KIDS', { background: '#EC4899', color: '#FFFFFF', right: 28 })}
      </>,
      label: '#FEF9C3', value: '#FFFFFF', name: '#FDE047',
      track: { background: '#1E1B4B', borderColor: '#FDE047' },
      slot: { background: 'rgba(30,27,75,0.45)', borderColor: '#FDE047' },
    },
    pause: pause({
      title: 'PAUSED, DUDE', sub: 'NO TRACK, NO DICE.',
      titleStyle: { color: '#FDE047', textShadow: '3px 3px 0 #EC4899, 5px 5px 0 #000' },
      frame: { background: 'linear-gradient(135deg, #0F766E, #5B21B6)', border: '6px solid #FDE047', borderRadius: 4, boxShadow: FRAME_SHADOW() },
      stripe: 'repeating-linear-gradient(90deg, #EC4899 0 10px, #FDE047 10px 20px, #14B8A6 20px 30px)',
      accent: '#FDE047', text: '#FFFFFF', muted: '#CCFBF1',
      dark: 'rgba(30,27,75,0.6)', line: '#FDE047', on: 'rgba(236,72,153,0.9)',
      button: 'linear-gradient(180deg, #EC4899, #9D174D)', buttonEdge: '#000',
    }),
  },
  // The cat-and-mouse knockoff: a too-violent cartoon's red and yellow, a mallet, a splat
  itchy: {
    hud: {
      panel: { background: 'linear-gradient(180deg, rgba(254,240,138,0.97), rgba(250,204,21,0.97))', border: '3px solid #7F1D1D', borderRadius: 6, boxShadow: PIXEL_SHADOW },
      deco: <>
        {bit({ right: 6, top: -9, width: 22, height: 14, background: 'radial-gradient(circle at 50% 50%, #DC2626 0 40%, transparent 41%), radial-gradient(circle at 20% 30%, #DC2626 0 15%, transparent 16%), radial-gradient(circle at 85% 70%, #DC2626 0 14%, transparent 15%)' })}
        {bit({ right: 32, top: -12, width: 8, height: 18, background: 'linear-gradient(180deg, #DC2626 0 40%, #92400E 40%)', transform: 'rotate(25deg)', boxShadow: '0 0 0 1px #000' })}
        {tag('TOO VIOLENT', { background: '#7F1D1D', color: '#FEF08A', right: 44 })}
      </>,
      label: '#7F1D1D', value: '#1C0A0A', name: '#B91C1C',
      track: { background: '#1C0A0A', borderColor: '#7F1D1D' },
      hp: 'linear-gradient(180deg, #FCA5A5, #DC2626 50%, #7F1D1D)',
      slot: { background: 'rgba(127,29,29,0.15)', borderColor: '#7F1D1D' },
    },
    pause: pause({
      title: 'PAUSED', sub: 'THEY FIGHT AND BITE. THEY FIGHT AND BITE AND FIGHT.',
      titleStyle: { color: '#FEF08A', textShadow: '3px 3px 0 #B91C1C, 5px 5px 0 #000' },
      frame: { background: 'linear-gradient(180deg, #B91C1C, #7F1D1D)', border: '6px solid #FEF08A', borderRadius: 6, boxShadow: FRAME_SHADOW() },
      stripe: 'repeating-linear-gradient(90deg, #FEF08A 0 8px, #B91C1C 8px 16px)',
      accent: '#FEF08A', text: '#FFFFFF', muted: '#FECACA',
      dark: 'rgba(69,10,10,0.6)', line: '#FEF08A', on: 'rgba(254,240,138,0.9)',
      button: 'linear-gradient(180deg, #FACC15, #A16207)', buttonEdge: '#000',
    }),
  },
  // The amphitheater: stage boards, a spotlight, a beer can, LIVE!
  amphi: {
    hud: {
      panel: { background: 'repeating-linear-gradient(90deg, rgba(120,53,15,0.97) 0 18px, rgba(98,42,12,0.97) 18px 20px)', border: '3px solid #1C0A04', borderRadius: 3, boxShadow: PIXEL_SHADOW + ', inset 0 0 0 1px #F59E0B' },
      deco: <>
        {rivets('#FDE68A', 3)}
        {corners('#F59E0B', 6, 2, 2)}
        {bit({ right: 8, top: -10, width: 9, height: 15, borderRadius: 2, background: 'linear-gradient(180deg, #E5E7EB 0 12%, #DC2626 12% 88%, #E5E7EB 88%)', boxShadow: '0 0 0 1px #000' })}
        {tag('LIVE!', { background: '#DC2626', color: '#FFFFFF', right: 24 })}
      </>,
      label: '#FDE68A', value: '#FFFBEB', name: '#F59E0B',
      track: { background: '#1C0A04', borderColor: '#F59E0B' },
      slot: { background: 'rgba(28,10,4,0.5)', borderColor: '#F59E0B' },
    },
    pause: pause({
      title: 'INTERMISSION', sub: 'HE NEEDS ANOTHER BEER.',
      titleStyle: { color: '#FDE68A', textShadow: '3px 3px 0 #92400E, 5px 5px 0 #000' },
      frame: { background: 'radial-gradient(ellipse at 50% 0, rgba(253,230,138,0.35), transparent 60%), linear-gradient(180deg, #451A03, #1C0A04)', border: '6px solid #92400E', borderRadius: 4, boxShadow: FRAME_SHADOW() + ', inset 0 0 0 2px #F59E0B' },
      stripe: 'repeating-linear-gradient(90deg, #7F1D1D 0 12px, #991B1B 12px 24px)',
      accent: '#FDE68A', text: '#FFFBEB', muted: '#FDE68A',
      dark: 'rgba(28,10,4,0.6)', line: '#F59E0B', on: 'rgba(245,158,11,0.9)',
      button: 'linear-gradient(180deg, #DC2626, #7F1D1D)', buttonEdge: '#000',
    }),
  },
};
