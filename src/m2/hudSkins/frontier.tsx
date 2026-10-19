// Wilderness Land's HUD and pause menu, a look per stretch of it: a routed trail sign in the park's wilds, a maroon
// rail car's gold pinstripe and brass on the train, a WANTED poster on Sawdust Gulch's street, red flocked wallpaper and
// a brass rail in the saloon, fresh-cut end grain and a saw blade at the mill, black rock with gold in it down the mine
// (the canary's cage), a wet log and the flume's water on Timber Tumble, a rusted pipe in the sewer, river stones out on
// the real river, birch bark and leaves in the real woods, a motocross number plate on the dirt-bike chase, and a
// trophy plaque in Tucker's arena.

import React from 'react';
import type { Theme } from '../hudThemes';
import { edge, tag, rivets, corners, bit, word, bottomBand, PIXEL_SHADOW, FRAME_SHADOW } from '../hudKit';

export type FrontierZone = 'frontier' | 'train' | 'gulch' | 'saloon' | 'mill' | 'mine' | 'logride' | 'sewer' | 'river' | 'woods' | 'dirtbike' | 'tucker';

/** A pine tree's silhouette. */
const pine = (h: number, col: string, style: React.CSSProperties) => bit({ width: h * 0.6, height: h, background: col, clipPath: 'polygon(50% 0, 72% 30%, 62% 30%, 85% 60%, 70% 60%, 100% 90%, 56% 90%, 56% 100%, 44% 100%, 44% 90%, 0 90%, 30% 60%, 15% 60%, 38% 30%, 28% 30%)', ...style });
/** A nail head. */
const nail = (style: React.CSSProperties) => bit({ width: 3, height: 3, borderRadius: '50%', background: '#52525B', boxShadow: 'inset -1px -1px 0 #18181B', ...style });
/** End grain: a cut log's rings. */
const RINGS = 'repeating-radial-gradient(circle at 50% 50%, #FDE68A 0 2px, #D97706 2px 3px)';

export const FRONTIER_THEMES: Record<FrontierZone, Theme> = {
  // The park's wilds: a routed trailhead sign (yellow letters cut in brown), pines over it, a trail blaze
  frontier: {
    hud: {
      panel: { background: 'repeating-linear-gradient(180deg, rgba(120,72,36,0.97) 0 11px, rgba(100,58,28,0.97) 11px 12px)', border: '3px solid #3F2A14', borderRadius: 3, boxShadow: PIXEL_SHADOW + ', inset 0 0 0 1px #A16207' },
      deco: <>
        {pine(16, '#14532D', { right: 6, top: -12 })}
        {pine(12, '#166534', { right: 16, top: -8 })}
        {pine(10, '#15803D', { right: -2, top: -6 })}
        {edge('linear-gradient(180deg, transparent 6px, #FACC15 6px 14px, transparent 14px)', 5)}
        {tag('TRAILHEAD', { background: '#FACC15', color: '#3F2A14', right: 28, boxShadow: '0 0 0 1px #3F2A14' })}
      </>,
      label: '#FDE68A', value: '#FEF3C7', name: '#FACC15',
      track: { background: '#1C1208', borderColor: '#3F2A14' },
      hp: 'linear-gradient(180deg, #BBF7D0, #22C55E 50%, #166534)',
      slot: { background: 'rgba(28,18,8,0.55)', borderColor: '#FACC15' },
      cellOn: { border: '#FEF08A', fill: 'linear-gradient(180deg, #FEF08A, #FACC15)', glow: 'rgba(250,204,21,0.8)' },
      cellOff: { border: '#3F2A14', fill: 'linear-gradient(180deg, #6B4423, #3F2A14)' },
    },
    pause: {
      title: 'MAKE CAMP', sub: 'THE BEARS ARE ANIMATRONIC. MOSTLY.',
      titleStyle: { color: '#FACC15', textShadow: '3px 3px 0 #3F2A14, 5px 5px 0 #000' },
      frame: { background: 'repeating-linear-gradient(180deg, #78482A 0 22px, #643A1C 22px 24px)', border: '6px solid #3F2A14', borderRadius: 4, boxShadow: FRAME_SHADOW() + ', inset 0 0 0 2px #A16207' },
      stripe: 'linear-gradient(180deg, #166534, #14532D)',
      deco: <>{pine(40, '#14532D', { right: 16, top: -26 })}{pine(30, '#166534', { right: 44, top: -16 })}</>,
      accent: '#FACC15', text: '#FEF3C7', muted: '#FDE68A',
      well: { background: 'rgba(28,18,8,0.55)', border: '1px solid #A16207' },
      slot: 'rgba(28,18,8,0.92)', slotOn: 'rgba(250,204,21,0.9)',
      button: 'linear-gradient(180deg, #15803D, #14532D)', buttonEdge: '#052E16',
    },
  },
  // The train: a maroon rail car's side, gold pinstripe and scrollwork, brass rivets, a punched ticket
  train: {
    hud: {
      panel: { background: 'radial-gradient(ellipse at 30% 0, rgba(255,255,255,0.12), transparent 55%), linear-gradient(180deg, rgba(127,29,29,0.97), rgba(80,16,16,0.97))', border: '3px solid #A16207', borderRadius: 4, boxShadow: '0 0 0 2px #1C0606, 3px 3px 0 2px rgba(0,0,0,0.6), inset 0 0 0 2px #7F1D1D, inset 0 0 0 3px #FACC15' },
      deco: <>
        {rivets('#FBBF24', 2)}
        {bit({ right: 2, top: -8, width: 26, height: 10, background: '#FEF3C7', clipPath: 'polygon(0 0, 100% 0, 100% 35%, 92% 50%, 100% 65%, 100% 100%, 0 100%, 0 65%, 8% 50%, 0 35%)', boxShadow: '0 0 0 1px #000' }, <div className="text-[4px] font-black text-center leading-[10px]" style={{ color: '#7F1D1D' }}>ADMIT 1</div>)}
        {bit({ right: 8, top: -5, width: 3, height: 3, borderRadius: '50%', background: '#7F1D1D' })}
      </>,
      label: '#FDE68A', value: '#FFFBEB', name: '#FACC15',
      track: { background: '#1C0606', borderColor: '#A16207' },
      hp: 'linear-gradient(180deg, #FEF3C7, #FBBF24 50%, #B45309)',
      slot: { background: 'rgba(28,6,6,0.55)', borderColor: '#FBBF24', borderRadius: 3 },
      cellOn: { border: '#FEF3C7', fill: 'linear-gradient(180deg, #FEF3C7, #F59E0B)', glow: 'rgba(251,191,36,0.85)' },
      cellOff: { border: '#7F1D1D', fill: 'linear-gradient(180deg, #991B1B, #450A0A)' },
    },
    pause: {
      title: 'TICKETS, PLEASE', sub: 'MIND THE COUPLINGS. AND THE CONDUCTOR.',
      titleStyle: { color: '#FACC15', textShadow: '3px 3px 0 #450A0A, 5px 5px 0 #000' },
      frame: { background: 'radial-gradient(ellipse at 30% 0, rgba(255,255,255,0.1), transparent 55%), linear-gradient(180deg, #7F1D1D, #501010)', border: '6px solid #A16207', borderRadius: 6, boxShadow: FRAME_SHADOW('#1C0606') + ', inset 0 0 0 3px #7F1D1D, inset 0 0 0 4px #FACC15' },
      stripe: 'repeating-linear-gradient(90deg, #52525B 0 18px, #18181B 18px 22px)',
      deco: rivets('#FBBF24', 8),
      accent: '#FACC15', text: '#FFFBEB', muted: '#FCD34D',
      well: { background: 'rgba(28,6,6,0.55)', border: '1px solid #A16207' },
      slot: 'rgba(28,6,6,0.92)', slotOn: 'rgba(251,191,36,0.9)',
      button: 'linear-gradient(180deg, #B45309, #78350F)', buttonEdge: '#451A03',
    },
  },
  // Sawdust Gulch: a WANTED poster nailed up: yellowed paper, a torn corner, the reward in red
  gulch: {
    hud: {
      panel: { background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(120,53,15,0.35)), linear-gradient(180deg, rgba(253,230,170,0.97), rgba(234,200,130,0.97))', border: '2px solid #78350F', boxShadow: PIXEL_SHADOW },
      deco: <>
        {nail({ left: 4, top: 3 })}{nail({ right: 4, top: 3 })}
        {bit({ right: -2, bottom: -2, width: 12, height: 12, background: '#3F2A14', clipPath: 'polygon(100% 0, 100% 100%, 0 100%, 30% 70%, 50% 80%, 60% 40%, 85% 30%)' })}
        {tag('WANTED', { background: 'transparent', color: '#1C1917', top: 2, right: 'auto', left: '50%', transform: 'translateX(-50%)', fontSize: 6, letterSpacing: 2 })}
        {word('$500 REWARD', { right: 16, bottom: 4, color: '#B91C1C' })}
      </>,
      label: '#451A03', value: '#1C1917', name: '#991B1B',
      track: { background: '#292524', borderColor: '#78350F' },
      hp: 'linear-gradient(180deg, #FCA5A5, #B91C1C 50%, #7F1D1D)',
      slot: { background: 'rgba(120,53,15,0.15)', borderColor: '#78350F' },
      cellOn: { border: '#7F1D1D', fill: 'linear-gradient(180deg, #FECACA, #DC2626)', glow: 'rgba(220,38,38,0.7)' },
      cellOff: { border: '#A16207', fill: 'linear-gradient(180deg, #D6A35E, #92400E)' },
    },
    pause: {
      title: 'HOLD YER HORSES', sub: "THIS TOWN AIN'T BIG ENOUGH. IT'S MOSTLY PLYWOOD.",
      titleStyle: { color: '#1C1917', textShadow: '2px 2px 0 #FDE68A, 4px 4px 0 #92400E' },
      frame: { background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(120,53,15,0.35)), linear-gradient(180deg, #FDE6AA, #EAC882)', border: '4px solid #78350F', boxShadow: FRAME_SHADOW() },
      stripe: 'linear-gradient(90deg, #78350F, #78350F)',
      deco: <>{nail({ left: 10, top: 10, transform: 'scale(2)' })}{nail({ right: 10, top: 10, transform: 'scale(2)' })}</>,
      accent: '#991B1B', text: '#1C1917', muted: '#78350F',
      well: { background: 'rgba(120,53,15,0.12)', border: '1px solid #92400E' },
      slot: 'rgba(41,37,36,0.88)', slotOn: 'rgba(254,202,202,0.95)',
      button: 'linear-gradient(180deg, #991B1B, #7F1D1D)', buttonEdge: '#450A0A',
    },
  },
  // The saloon: red flocked wallpaper, a brass rail, a hand of cards
  saloon: {
    hud: {
      panel: { backgroundImage: 'radial-gradient(ellipse 3px 5px at 50% 50%, rgba(0,0,0,0.3) 80%, transparent), radial-gradient(ellipse 5px 3px at 50% 50%, rgba(0,0,0,0.3) 80%, transparent), linear-gradient(180deg, rgba(153,27,27,0.97), rgba(105,18,18,0.97))', backgroundSize: '10px 10px, 10px 10px, auto', backgroundPosition: '0 0, 5px 5px, 0 0', border: '3px solid #3B1F0A', boxShadow: PIXEL_SHADOW },
      deco: <>
        {bottomBand('linear-gradient(180deg, #FEF3C7, #CA8A04 40%, #78350F)', 3)}
        {bit({ right: 14, top: -8, width: 9, height: 12, borderRadius: 1, background: '#FAFAFA', boxShadow: '0 0 0 1px #000', transform: 'rotate(-14deg)' }, word('A', { left: 1, top: 1, color: '#000' }))}
        {bit({ right: 6, top: -9, width: 9, height: 12, borderRadius: 1, background: '#FAFAFA', boxShadow: '0 0 0 1px #000', transform: 'rotate(10deg)' }, word('A', { left: 1, top: 1, color: '#DC2626' }))}
        {edge('linear-gradient(180deg, #78350F, #3B1F0A)', 4)}
      </>,
      label: '#FDE68A', value: '#FFFBEB', name: '#FCD34D',
      track: { background: '#1C0606', borderColor: '#78350F' },
      hp: 'linear-gradient(180deg, #FEF3C7, #F59E0B 50%, #92400E)',
      slot: { background: 'rgba(28,6,6,0.55)', borderColor: '#CA8A04' },
      cellOn: { border: '#FEF3C7', fill: 'linear-gradient(180deg, #FEF3C7, #F59E0B)', glow: 'rgba(245,158,11,0.85)' },
      cellOff: { border: '#3B1F0A', fill: 'linear-gradient(180deg, #78350F, #3B1F0A)' },
    },
    pause: {
      title: 'LAST CALL', sub: 'THE PIANO MAN KEEPS PLAYING. HE ALWAYS KEEPS PLAYING.',
      titleStyle: { color: '#FCD34D', textShadow: '3px 3px 0 #450A0A, 5px 5px 0 #000' },
      frame: { backgroundImage: 'radial-gradient(ellipse 6px 10px at 50% 50%, rgba(0,0,0,0.28) 80%, transparent), radial-gradient(ellipse 10px 6px at 50% 50%, rgba(0,0,0,0.28) 80%, transparent), linear-gradient(180deg, #991B1B, #691212)', backgroundSize: '22px 22px, 22px 22px, auto', backgroundPosition: '0 0, 11px 11px, 0 0', border: '6px solid #3B1F0A', boxShadow: FRAME_SHADOW() + ', inset 0 -4px 0 #CA8A04' },
      stripe: 'linear-gradient(180deg, #FEF3C7, #CA8A04 50%, #78350F)',
      accent: '#FCD34D', text: '#FFFBEB', muted: '#FCA5A5',
      well: { background: 'rgba(28,6,6,0.55)', border: '1px solid #78350F' },
      slot: 'rgba(28,6,6,0.92)', slotOn: 'rgba(252,211,77,0.9)',
      button: 'linear-gradient(180deg, #78350F, #3B1F0A)', buttonEdge: '#1C0A00',
    },
  },
  // The mill: fresh-cut pine, its end grain on the corner, a saw blade, sawdust
  mill: {
    hud: {
      panel: { backgroundImage: 'radial-gradient(circle, rgba(254,243,199,0.6) 0.6px, transparent 1px), repeating-linear-gradient(180deg, rgba(222,184,135,0.97) 0 4px, rgba(210,170,120,0.97) 4px 5px, rgba(222,184,135,0.97) 5px 10px, rgba(200,160,110,0.97) 10px 11px)', backgroundSize: '6px 5px, auto', border: '2px solid #78350F', boxShadow: PIXEL_SHADOW },
      deco: <>
        {bit({ right: 4, top: -8, width: 16, height: 16, borderRadius: '50%', background: RINGS, boxShadow: '0 0 0 2px #78350F' })}
        {bit({ right: 26, top: -7, width: 13, height: 13, borderRadius: '50%', background: 'radial-gradient(circle, #52525B 2px, #D4D4D8 2.5px 4.5px, #A1A1AA 5px), repeating-conic-gradient(#E4E4E7 0 15deg, transparent 0 30deg)', WebkitMask: 'radial-gradient(circle, #000 60%, transparent 62%), repeating-conic-gradient(#000 0 15deg, transparent 0 30deg)', mask: 'radial-gradient(circle, #000 60%, transparent 62%), repeating-conic-gradient(#000 0 15deg, transparent 0 30deg)' })}
        {edge('repeating-linear-gradient(180deg, #FACC15 0 4px, #18181B 4px 8px)', 4)}
      </>,
      label: '#451A03', value: '#1C1917', name: '#9A3412',
      track: { background: '#292524', borderColor: '#78350F' },
      hp: 'linear-gradient(180deg, #FDE68A, #D97706 50%, #92400E)',
      slot: { background: 'rgba(255,251,235,0.4)', borderColor: '#78350F' },
      cellOn: { border: '#78350F', fill: 'linear-gradient(180deg, #FEF9C3, #EAB308)', glow: 'rgba(234,179,8,0.7)' },
      cellOff: { border: '#A16207', fill: 'linear-gradient(180deg, #C8A06E, #92400E)' },
    },
    pause: {
      title: 'SHIFT CHANGE', sub: 'KEEP ALL LIMBS AWAY FROM THE BLADE. ALL OF THEM.',
      titleStyle: { color: '#78350F', textShadow: '2px 2px 0 #FEF3C7, 4px 4px 0 #451A03' },
      frame: { backgroundImage: 'radial-gradient(circle, rgba(254,243,199,0.5) 1px, transparent 1.5px), repeating-linear-gradient(180deg, #DEB887 0 10px, #D2AA78 10px 12px, #DEB887 12px 22px, #C8A06E 22px 24px)', backgroundSize: '12px 10px, auto', border: '5px solid #78350F', boxShadow: FRAME_SHADOW() },
      stripe: 'repeating-linear-gradient(135deg, #FACC15 0 8px, #18181B 8px 16px)',
      deco: bit({ right: 14, top: 10, width: 40, height: 40, borderRadius: '50%', background: RINGS.replace(/2px/g, '4px').replace(/3px/g, '6px'), boxShadow: '0 0 0 3px #78350F' }),
      accent: '#9A3412', text: '#1C1917', muted: '#78350F',
      well: { background: 'rgba(120,53,15,0.12)', border: '1px solid #92400E' },
      slot: 'rgba(41,37,36,0.88)', slotOn: 'rgba(254,240,138,0.95)',
      button: 'linear-gradient(180deg, #CA8A04, #854D0E)', buttonEdge: '#422006',
    },
  },
  // Down the Mother Lode: black rock with gold showing in it, a candle helmet's glow, the canary in its cage
  mine: {
    hud: {
      panel: { backgroundImage: 'radial-gradient(circle at 20% 30%, #FACC15 0.8px, transparent 1.2px), radial-gradient(circle at 70% 70%, #FDE047 0.7px, transparent 1.1px), radial-gradient(ellipse at 15% 0, rgba(251,191,36,0.3), transparent 45%), linear-gradient(160deg, rgba(41,37,36,0.97), rgba(23,20,18,0.97) 50%, rgba(41,37,36,0.97))', backgroundSize: '14px 11px, 19px 15px, auto, auto', border: '3px solid #44403C', borderRadius: '8px 3px 10px 4px', boxShadow: PIXEL_SHADOW },
      deco: <>
        {bit({ right: 6, top: -10, width: 12, height: 14, borderRadius: '6px 6px 1px 1px', border: '1px solid #A1A1AA', background: 'repeating-linear-gradient(90deg, transparent 0 2px, rgba(161,161,170,0.8) 2px 3px)' }, bit({ left: 3, top: 5, width: 5, height: 4, borderRadius: '50% 50% 40% 40%', background: '#FACC15' }))}
        {bit({ left: 12, top: -5, width: 3, height: 5, borderRadius: '50% 50% 0 0', background: '#FEF3C7', boxShadow: '0 -2px 5px #FBBF24' })}
        {edge('repeating-linear-gradient(180deg, #78350F 0 10px, #451A03 10px 11px)', 5)}
        {tag('GUIDED TOURS', { background: '#78350F', color: '#FDE68A', right: 22, boxShadow: '0 0 0 1px #000' })}
      </>,
      label: '#FDE68A', value: '#FAFAF9', name: '#FACC15',
      track: { background: '#0C0A09', borderColor: '#44403C' },
      hp: 'linear-gradient(180deg, #FEF08A, #EAB308 50%, #854D0E)',
      slot: { background: 'radial-gradient(circle at 50% 30%, rgba(251,191,36,0.25), rgba(12,10,9,0.7) 70%)', borderColor: '#57534E', borderRadius: '6px 3px 8px 4px' },
      cellOn: { border: '#FEF08A', fill: 'linear-gradient(180deg, #FEF9C3, #EAB308)', glow: 'rgba(250,204,21,0.85)' },
      cellOff: { border: '#44403C', fill: 'linear-gradient(180deg, #44403C, #1C1917)' },
    },
    pause: {
      title: 'TOUR PAUSED', sub: 'IF THE CANARY STOPS SINGING, SO DO YOU',
      titleStyle: { color: '#FACC15', textShadow: '0 0 6px rgba(251,191,36,0.6), 3px 3px 0 #000' },
      frame: { backgroundImage: 'radial-gradient(circle at 20% 30%, #FACC15 1px, transparent 1.6px), radial-gradient(circle at 70% 70%, #FDE047 1px, transparent 1.5px), radial-gradient(ellipse at 50% 0, rgba(251,191,36,0.2), transparent 50%), linear-gradient(160deg, #292524, #171412 50%, #292524)', backgroundSize: '40px 30px, 55px 44px, auto, auto', border: '6px solid #44403C', borderRadius: '20px 8px 24px 10px', boxShadow: FRAME_SHADOW() },
      stripe: 'repeating-linear-gradient(90deg, #78350F 0 20px, #451A03 20px 22px)',
      accent: '#FACC15', text: '#FAFAF9', muted: '#D6D3D1',
      well: { background: 'rgba(12,10,9,0.6)', border: '1px solid #44403C' },
      slot: 'rgba(12,10,9,0.92)', slotOn: 'rgba(250,204,21,0.9)',
      button: 'linear-gradient(180deg, #78350F, #451A03)', buttonEdge: '#1C0A00',
    },
  },
  // Timber Tumble: a wet log's side, its cut end, the flume's water along the foot, the splash
  logride: {
    hud: {
      panel: { background: 'linear-gradient(180deg, transparent 75%, rgba(56,189,248,0.75) 75%), repeating-linear-gradient(180deg, rgba(120,72,36,0.97) 0 5px, rgba(92,54,26,0.97) 5px 7px)', border: '3px solid #3F2A14', borderRadius: '14px 4px 4px 14px', boxShadow: PIXEL_SHADOW + ', inset 0 2px 0 rgba(255,255,255,0.18)' },
      deco: <>
        {bit({ left: -5, top: '50%', marginTop: -9, width: 18, height: 18, borderRadius: '50%', background: RINGS, boxShadow: '0 0 0 2px #3F2A14' })}
        {bit({ right: 8, top: -6, width: 16, height: 7, background: 'radial-gradient(circle at 20% 80%, #E0F2FE 2px, transparent 2.5px), radial-gradient(circle at 50% 30%, #BAE6FD 2.5px, transparent 3px), radial-gradient(circle at 80% 70%, #E0F2FE 2px, transparent 2.5px)' })}
        {tag('YOU WILL GET WET', { background: '#0369A1', color: '#F0F9FF', right: 26, boxShadow: '0 0 0 1px #082F49' })}
      </>,
      label: '#FEF3C7', value: '#FFFFFF', name: '#7DD3FC',
      track: { background: '#082F49', borderColor: '#3F2A14' },
      hp: 'linear-gradient(180deg, #BAE6FD, #0EA5E9 50%, #0369A1)',
      slot: { background: 'rgba(8,47,73,0.55)', borderColor: '#7DD3FC' },
      cellOn: { border: '#E0F2FE', fill: 'linear-gradient(180deg, #E0F2FE, #38BDF8)', glow: 'rgba(56,189,248,0.85)' },
      cellOff: { border: '#3F2A14', fill: 'linear-gradient(180deg, #6B4423, #3F2A14)' },
    },
    pause: {
      title: 'TIMBER TUMBLE', sub: 'YOU HAVE BEEN WARNED. BY A SIGN. THIS SIGN.',
      titleStyle: { color: '#7DD3FC', textShadow: '3px 3px 0 #3F2A14, 5px 5px 0 #000' },
      frame: { background: 'linear-gradient(180deg, transparent 85%, rgba(56,189,248,0.55) 85%), repeating-linear-gradient(180deg, #78482A 0 10px, #5C361A 10px 14px)', border: '6px solid #3F2A14', borderRadius: '40px 8px 8px 40px', boxShadow: FRAME_SHADOW() },
      stripe: 'radial-gradient(ellipse 8px 4px at 50% 100%, #E0F2FE 60%, transparent 65%) 0 0 / 16px 6px repeat-x, linear-gradient(90deg, #0EA5E9, #0EA5E9)',
      accent: '#7DD3FC', text: '#FEF3C7', muted: '#FDE68A',
      well: { background: 'rgba(28,18,8,0.55)', border: '1px solid #A16207' },
      slot: 'rgba(28,18,8,0.92)', slotOn: 'rgba(125,211,252,0.9)',
      button: 'linear-gradient(180deg, #0284C7, #075985)', buttonEdge: '#082F49',
    },
  },
  // The sewer: a rusted pipe, its bolted flange, sludge dripping off its bottom
  sewer: {
    hud: {
      panel: { background: 'radial-gradient(ellipse 20px 6px at 30% 40%, rgba(146,64,14,0.55), transparent), radial-gradient(ellipse 14px 5px at 80% 70%, rgba(146,64,14,0.5), transparent), linear-gradient(180deg, rgba(87,83,78,0.97) 0, rgba(120,113,108,0.97) 20%, rgba(68,64,60,0.97) 80%, rgba(41,37,36,0.97))', border: '3px solid #292524', borderRadius: 12, boxShadow: PIXEL_SHADOW },
      deco: <>
        {bit({ left: 0, top: -2, bottom: -2, width: 8, borderRadius: 3, background: 'linear-gradient(90deg, #44403C, #78716C, #44403C)', boxShadow: '0 0 0 1px #000' })}
        {bit({ left: 2, top: 4, width: 3, height: 3, borderRadius: '50%', background: '#A8A29E' })}
        {bit({ left: 2, bottom: 4, width: 3, height: 3, borderRadius: '50%', background: '#A8A29E' })}
        {bit({ left: 20, right: 30, bottom: -6, height: 7, background: 'radial-gradient(ellipse 2px 5px at 50% 0, #65A30D 70%, transparent 75%) 0 0 / 13px 7px repeat-x, radial-gradient(ellipse 1.5px 3px at 50% 0, #4D7C0F 70%, transparent 75%) 6px 0 / 19px 7px repeat-x' })}
        {tag('NOT PART OF THE RIDE', { background: '#3F6212', color: '#ECFCCB', right: 10, boxShadow: '0 0 0 1px #000' })}
      </>,
      label: '#D9F99D', value: '#FAFAF9', name: '#BEF264',
      track: { background: '#0C0A09', borderColor: '#292524' },
      hp: 'linear-gradient(180deg, #D9F99D, #65A30D 50%, #3F6212)',
      slot: { background: 'rgba(12,10,9,0.65)', borderColor: '#78716C', borderRadius: '50%' },
      cellOn: { border: '#D9F99D', fill: 'linear-gradient(180deg, #ECFCCB, #84CC16)', glow: 'rgba(132,204,22,0.8)' },
      cellOff: { border: '#292524', fill: 'linear-gradient(180deg, #57534E, #292524)' },
    },
    pause: {
      title: 'BACKED UP', sub: 'THIS IS NOT PART OF THE RIDE. IT SMELLS LIKE IT, THOUGH.',
      titleStyle: { color: '#BEF264', textShadow: '3px 3px 0 #3F6212, 5px 5px 0 #000' },
      frame: { background: 'radial-gradient(ellipse 60px 16px at 25% 30%, rgba(146,64,14,0.45), transparent), radial-gradient(ellipse 40px 12px at 80% 75%, rgba(146,64,14,0.4), transparent), linear-gradient(180deg, #57534E, #78716C 15%, #44403C 80%, #292524)', border: '6px solid #292524', borderRadius: 30, boxShadow: FRAME_SHADOW() },
      stripe: 'radial-gradient(ellipse 3px 7px at 50% 0, #65A30D 70%, transparent 75%) 0 0 / 18px 6px repeat-x, linear-gradient(90deg, #3F6212, #3F6212)',
      deco: rivets('#A8A29E', 12),
      accent: '#BEF264', text: '#FAFAF9', muted: '#D6D3D1',
      well: { background: 'rgba(12,10,9,0.55)', border: '1px solid #57534E' },
      slot: 'rgba(12,10,9,0.92)', slotOn: 'rgba(190,242,100,0.9)',
      button: 'linear-gradient(180deg, #4D7C0F, #365314)', buttonEdge: '#1A2E05',
    },
  },
  // The real river: wet river stones, the current running over them, no park paint anywhere
  river: {
    hud: {
      panel: { backgroundImage: 'radial-gradient(ellipse 12px 7px at 15% 75%, #57534E 90%, transparent), radial-gradient(ellipse 16px 8px at 55% 85%, #44403C 90%, transparent), radial-gradient(ellipse 10px 6px at 88% 70%, #57534E 90%, transparent), repeating-linear-gradient(170deg, transparent 0 8px, rgba(186,230,253,0.18) 8px 9px), linear-gradient(180deg, rgba(21,94,117,0.96), rgba(12,74,110,0.96))', border: '3px solid #57534E', borderRadius: '10px 6px 12px 4px', boxShadow: PIXEL_SHADOW },
      deco: <>
        {bit({ left: -4, top: -4, width: 14, height: 9, borderRadius: '50%', background: 'radial-gradient(ellipse at 40% 30%, #A8A29E, #57534E)', boxShadow: '0 0 0 1px #000' })}
        {bit({ right: 10, top: -5, width: 18, height: 8, borderRadius: '50%', background: 'radial-gradient(ellipse at 40% 30%, #78716C, #44403C)', boxShadow: '0 0 0 1px #000' })}
        {bit({ right: 16, top: -7, width: 8, height: 3, borderRadius: '50%', background: '#4D7C0F' })}
      </>,
      label: '#E0F2FE', value: '#FFFFFF', name: '#BAE6FD',
      track: { background: '#082F49', borderColor: '#44403C' },
      hp: 'linear-gradient(180deg, #E0F2FE, #38BDF8 50%, #075985)',
      slot: { background: 'rgba(8,47,73,0.6)', borderColor: '#A8A29E', borderRadius: '45% 55% 50% 50%' },
      cellOn: { border: '#E0F2FE', fill: 'linear-gradient(180deg, #E0F2FE, #7DD3FC)', glow: 'rgba(125,211,252,0.85)' },
      cellOff: { border: '#44403C', fill: 'linear-gradient(180deg, #57534E, #292524)' },
    },
    pause: {
      title: 'DOWNSTREAM', sub: 'NO TRACK. NO BRAKES. NO REFUNDS.',
      titleStyle: { color: '#E0F2FE', textShadow: '3px 3px 0 #075985, 5px 5px 0 #000' },
      frame: { backgroundImage: 'radial-gradient(ellipse 40px 20px at 12% 90%, #57534E 90%, transparent), radial-gradient(ellipse 50px 24px at 88% 92%, #44403C 90%, transparent), repeating-linear-gradient(170deg, transparent 0 18px, rgba(186,230,253,0.12) 18px 20px), linear-gradient(180deg, #155E75, #0C4A6E)', border: '6px solid #57534E', borderRadius: '24px 14px 28px 10px', boxShadow: FRAME_SHADOW() },
      stripe: 'repeating-linear-gradient(90deg, #BAE6FD 0 10px, #38BDF8 10px 14px, #0EA5E9 14px 30px)',
      accent: '#BAE6FD', text: '#F0F9FF', muted: '#7DD3FC',
      well: { background: 'rgba(8,47,73,0.55)', border: '1px solid #57534E' },
      slot: 'rgba(8,47,73,0.92)', slotOn: 'rgba(186,230,253,0.95)',
      button: 'linear-gradient(180deg, #57534E, #292524)', buttonEdge: '#0C0A09',
    },
  },
  // The real woods: birch bark, a fall of leaves, the kids' MINE scrawled on a strip of tape
  woods: {
    hud: {
      panel: { backgroundImage: 'linear-gradient(90deg, transparent 20%, #1C1917 20% 23%, transparent 23% 56%, #292524 56% 58%, transparent 58% 84%, #1C1917 84% 86%, transparent 86%), linear-gradient(180deg, rgba(245,245,244,0.97), rgba(214,211,209,0.97))', backgroundSize: '40px 9px, auto', border: '2px solid #57534E', boxShadow: PIXEL_SHADOW },
      deco: <>
        {bit({ left: 6, right: 6, bottom: -5, height: 8, background: 'radial-gradient(ellipse 4px 3px at 30% 60%, #EA580C 80%, transparent), radial-gradient(ellipse 3px 3px at 70% 40%, #CA8A04 80%, transparent), radial-gradient(ellipse 4px 2.5px at 50% 80%, #B91C1C 80%, transparent)', backgroundSize: '14px 8px, 11px 8px, 17px 8px' })}
        {tag('MINE', { background: '#FAFAFA', color: '#DC2626', fontStyle: 'italic', fontSize: 7, transform: 'rotate(-6deg)', boxShadow: '0 0 0 1px #A1A1AA' })}
      </>,
      label: '#292524', value: '#0C0A09', name: '#C2410C',
      track: { background: '#292524', borderColor: '#57534E' },
      hp: 'linear-gradient(180deg, #FED7AA, #EA580C 50%, #9A3412)',
      slot: { background: 'rgba(255,255,255,0.45)', borderColor: '#57534E' },
      cellOn: { border: '#9A3412', fill: 'linear-gradient(180deg, #FED7AA, #EA580C)', glow: 'rgba(234,88,12,0.7)' },
      cellOff: { border: '#A8A29E', fill: 'linear-gradient(180deg, #D6D3D1, #78716C)' },
    },
    pause: {
      title: 'OFF THE MAP', sub: 'NO RIDES. NO STAFF. JUST TREES AND BAD KIDS.',
      titleStyle: { color: '#C2410C', textShadow: '2px 2px 0 #FAFAF9, 4px 4px 0 #292524' },
      frame: { backgroundImage: 'linear-gradient(90deg, transparent 20%, #1C1917 20% 22%, transparent 22% 56%, #292524 56% 57.5%, transparent 57.5% 84%, #1C1917 84% 85.5%, transparent 85.5%), linear-gradient(180deg, #F5F5F4, #D6D3D1)', backgroundSize: '100px 20px, auto', border: '5px solid #57534E', boxShadow: FRAME_SHADOW() },
      stripe: 'linear-gradient(90deg, #EA580C, #CA8A04, #B91C1C, #EA580C)',
      accent: '#C2410C', text: '#1C1917', muted: '#57534E',
      well: { background: 'rgba(87,83,78,0.1)', border: '1px solid #78716C' },
      slot: 'rgba(41,37,36,0.88)', slotOn: 'rgba(254,215,170,0.95)',
      button: 'linear-gradient(180deg, #EA580C, #9A3412)', buttonEdge: '#431407',
    },
  },
  // The dirt-bike chase: a motocross number plate: white plastic, a big number, sponsor stickers, mud
  dirtbike: {
    hud: {
      panel: { background: 'radial-gradient(circle at 12% 85%, rgba(120,72,36,0.7) 3px, transparent 3.5px), radial-gradient(circle at 80% 15%, rgba(120,72,36,0.6) 2px, transparent 2.5px), radial-gradient(circle at 60% 90%, rgba(120,72,36,0.55) 4px, transparent 4.5px), linear-gradient(180deg, rgba(250,250,250,0.97), rgba(228,228,231,0.97))', border: '3px solid #18181B', borderRadius: '12px 12px 4px 4px', boxShadow: PIXEL_SHADOW },
      deco: <>
        {bit({ right: 4, top: -9, width: 22, height: 14, borderRadius: 3, background: '#FACC15', boxShadow: '0 0 0 1px #000' }, <div className="text-[9px] font-black italic text-center leading-[14px]" style={{ color: '#18181B' }}>42</div>)}
        {tag('RAD', { background: '#DC2626', color: '#FFF', right: 30, fontStyle: 'italic', transform: 'skewX(-12deg)' })}
        {edge('linear-gradient(180deg, #2563EB 0 50%, #DC2626 50%)', 4)}
      </>,
      label: '#18181B', value: '#0A0A0A', name: '#DC2626',
      track: { background: '#18181B', borderColor: '#18181B' },
      hp: 'linear-gradient(180deg, #86EFAC, #16A34A 50%, #14532D)',
      slot: { background: 'rgba(24,24,27,0.12)', borderColor: '#18181B', borderRadius: 8 },
      cellOn: { border: '#18181B', fill: 'linear-gradient(180deg, #FEF08A, #FACC15)', glow: 'rgba(250,204,21,0.8)' },
      cellOff: { border: '#71717A', fill: 'linear-gradient(180deg, #A1A1AA, #52525B)' },
    },
    pause: {
      title: 'PIT STOP', sub: 'THE TEENAGERS ARE REVVING. THEY NEVER STOP REVVING.',
      titleStyle: { color: '#DC2626', fontStyle: 'italic', textShadow: '3px 3px 0 #18181B, 5px 5px 0 #FACC15' },
      frame: { background: 'radial-gradient(circle at 10% 85%, rgba(120,72,36,0.55) 8px, transparent 9px), radial-gradient(circle at 85% 20%, rgba(120,72,36,0.5) 6px, transparent 7px), linear-gradient(180deg, #FAFAFA, #E4E4E7)', border: '5px solid #18181B', borderRadius: '30px 30px 8px 8px', boxShadow: FRAME_SHADOW() },
      stripe: 'linear-gradient(90deg, #2563EB 0 33%, #FAFAFA 33% 66%, #DC2626 66%)',
      deco: <div className="absolute right-8 top-3 w-[54px] h-[34px] rounded flex items-center justify-center text-[20px] font-black italic" style={{ background: '#FACC15', color: '#18181B', boxShadow: '0 0 0 2px #000' }}>42</div>,
      accent: '#DC2626', text: '#0A0A0A', muted: '#52525B',
      well: { background: 'rgba(24,24,27,0.08)', border: '1px solid #18181B' },
      slot: 'rgba(24,24,27,0.9)', slotOn: 'rgba(250,204,21,0.95)',
      button: 'linear-gradient(180deg, #DC2626, #991B1B)', buttonEdge: '#450A0A',
    },
  },
  // Tucker's arena: a hunting-lodge trophy plaque: varnished walnut, a beveled edge, the brass name plate
  tucker: {
    hud: {
      panel: { background: 'radial-gradient(ellipse at 30% 0, rgba(255,255,255,0.18), transparent 50%), linear-gradient(180deg, rgba(69,26,3,0.97), rgba(41,16,2,0.97))', border: '4px solid transparent', borderImage: 'linear-gradient(135deg, #92400E, #451A03 50%, #1C0A00) 4', borderRadius: 0, boxShadow: PIXEL_SHADOW },
      deco: <>
        {corners('#FBBF24', 6, 1, 0)}
        {bit({ right: 8, bottom: 4, width: 30, height: 9, background: 'linear-gradient(180deg, #FEF3C7, #CA8A04 50%, #854D0E)', boxShadow: '0 0 0 1px #000' }, <div className="text-[4px] font-black text-center leading-[9px]" style={{ color: '#451A03' }}>BOUNTY</div>)}
        {tag('DEAD OR ALIVE', { background: '#7F1D1D', color: '#FEF3C7', boxShadow: '0 0 0 1px #000' })}
      </>,
      label: '#FDE68A', value: '#FFFBEB', name: '#FCA5A5',
      track: { background: '#140700', borderColor: '#78350F' },
      hp: 'linear-gradient(180deg, #FCA5A5, #B91C1C 50%, #7F1D1D)',
      slot: { background: 'rgba(20,7,0,0.6)', borderColor: '#CA8A04' },
      cellOn: { border: '#FEF3C7', fill: 'linear-gradient(180deg, #FEF3C7, #CA8A04)', glow: 'rgba(202,138,4,0.85)' },
      cellOff: { border: '#451A03', fill: 'linear-gradient(180deg, #78350F, #2A1002)' },
    },
    pause: {
      title: 'THE BOUNTY', sub: 'ONE OF YOU LEAVES THESE WOODS IN A BAG',
      titleStyle: { color: '#FDE68A', textShadow: '3px 3px 0 #7F1D1D, 5px 5px 0 #000' },
      frame: { background: 'radial-gradient(ellipse at 30% 0, rgba(255,255,255,0.12), transparent 50%), linear-gradient(180deg, #451A03, #291002)', border: '8px solid transparent', borderImage: 'linear-gradient(135deg, #92400E, #451A03 50%, #1C0A00) 8', boxShadow: FRAME_SHADOW() },
      stripe: 'linear-gradient(180deg, #FEF3C7, #CA8A04 50%, #854D0E)',
      deco: corners('#FBBF24', 16, 2, -4),
      accent: '#FCA5A5', text: '#FFFBEB', muted: '#FDE68A',
      well: { background: 'rgba(20,7,0,0.55)', border: '1px solid #78350F' },
      slot: 'rgba(20,7,0,0.92)', slotOn: 'rgba(253,230,138,0.9)',
      button: 'linear-gradient(180deg, #7F1D1D, #450A0A)', buttonEdge: '#1C0606',
    },
  },
};
