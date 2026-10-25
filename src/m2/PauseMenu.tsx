import React, { useEffect, useSyncExternalStore } from 'react';
import SoundTest from './title/SoundTest';
import type { WeaponType } from '../m1/types';
import { maxAmmo } from '../m1/constants';
import { Prompt } from '../m1/components/ButtonIcons';
import { M2_WEAPON_INFO, M2WeaponArt, ammoName } from './weapons';
import { malletBroken } from './weapons/mallet';
import { HairballSvg } from './cartoon/whitehouse1/HairballArt';
import ChordPrompt from './ChordPrompt';
import { CardRowView, type PauseCard } from './PauseControls';
import { PLAIN_PAUSE, type PauseSkin } from './hudThemes';
import { M2_PUBLIC } from './build';
import { walkBackOn } from './store';
import { getCheats, setCheat, subscribeCheats, pantsNow, setPants, todNow, setTod, setCheatPanelOpen, cheatPanelOpen, cheatCursor, CHEAT_ROWS, stepMusic, stopMusicTest, soundTestLabel, type Pants } from './cheats';

/** The cheats (FOR NOW: out before it ships), mouse only: click to flip them. Not buttons (ENTER and SPACE would set
 *  off whichever was clicked last, along with the menu's own). */
const Chip: React.FC<{ on: boolean; skin: PauseSkin; onClick: () => void; children: React.ReactNode; w?: number; at?: boolean }> = ({ on, skin, onClick, children, w, at }) => (
  <div role="button" onClick={onClick} onMouseDown={e => e.preventDefault()}
    className={`cursor-pointer select-none px-[6px] py-[5px] text-center text-[8px] font-black tracking-wider border-2 hover:brightness-125 ${at ? 'scale-110' : ''}`}
    style={{ minWidth: w, background: on ? skin.slotOn : skin.slot, color: on ? '#000' : skin.text, borderColor: on ? '#FFFFFF' : '#52525B', boxShadow: at ? '0 0 0 2px #FACC15, 0 0 10px rgba(250,204,21,0.7)' : '2px 2px 0 #000' }}>{children}</div>
);

const CheatPanel: React.FC<{ skin: PauseSkin; onClose: () => void }> = ({ skin, onClose }) => {
  const c = useSyncExternalStore(subscribeCheats, getCheats);
  const pants = pantsNow(), tod = todNow();
  const [browse, setBrowse] = React.useState(false);
  // (where the pad's cursor is: row by row, CHEAT_ROWS)
  const cur = cheatCursor();
  const at = (r: number, col: number) => cur.row === r && cur.col === col;
  const row = (label: string, body: React.ReactNode) => (
    <div className="flex items-center gap-3 w-full">
      <div className="w-[110px] shrink-0 text-[8px] font-black tracking-widest text-right" style={{ color: skin.accent }}>{label}</div>
      <div className="flex flex-wrap gap-[5px]">{body}</div>
    </div>
  );
  const flag = (k: 'god' | 'ammo' | 'allWeapons' | 'skip') => { const r = CHEAT_ROWS.indexOf(k); return (<>
    <Chip on={c[k]} at={at(r, 0)} skin={skin} w={40} onClick={() => setCheat(k, true)}>ON</Chip>
    <Chip on={!c[k]} at={at(r, 1)} skin={skin} w={40} onClick={() => setCheat(k, false)}>OFF</Chip>
  </>); };
  return (
    <div className="absolute inset-x-4 top-[56px] bottom-4 z-10 flex flex-col items-center gap-3 px-4 py-3" style={{ ...skin.well, background: 'rgba(0,0,0,0.97)' }}>
      <div className="text-[10px] font-black tracking-widest" style={{ color: skin.text }}>CHEATS</div>
      {row('GOD MODE', flag('god'))}
      {row('UNLIMITED AMMO', flag('ammo'))}
      {row('ALL WEAPONS', flag('allWeapons'))}
      {row('CHECKPOINT SKIP', flag('skip'))}
      {row('PANTS', (['normal', 'shitty', 'naked'] as Pants[]).map((p, i) => <Chip key={p} on={pants === p} at={at(4, i)} skin={skin} w={56} onClick={() => setPants(p)}>{p.toUpperCase()}</Chip>))}
      {row('TIME OF DAY', <>
        <Chip on={tod === null} at={at(5, 0)} skin={skin} w={40} onClick={() => setTod(null)}>AUTO</Chip>
        {Array.from({ length: 10 }, (_, n) => <Chip key={n} on={tod === n} at={at(5, n + 1)} skin={skin} w={18} onClick={() => setTod(n)}>{n}</Chip>)}
      </>)}
      <div className="text-[6px] tracking-wider" style={{ color: skin.muted }}>TIME OF DAY: LANDS CLEARED (0 MORNING, 9 NIGHT). AUTO FOLLOWS THE GAME.</div>
      {row('SOUND TEST', <>
        <Chip on={false} at={at(CHEAT_ROWS.indexOf('music'), 0)} skin={skin} w={24} onClick={() => stepMusic(-1)}>&lt;</Chip>
        <Chip on={false} at={at(CHEAT_ROWS.indexOf('music'), 1)} skin={skin} w={24} onClick={() => stepMusic(1)}>&gt;</Chip>
        <Chip on={false} at={at(CHEAT_ROWS.indexOf('music'), 2)} skin={skin} w={40} onClick={stopMusicTest}>STOP</Chip>
        <Chip on={false} at={false} skin={skin} w={56} onClick={() => setBrowse(true)}>BROWSE</Chip>
        <div className="self-center text-[7px] font-black tracking-wider max-w-[240px] truncate" style={{ color: skin.text }}>{soundTestLabel()}</div>
      </>)}
      {browse && <SoundTest onClose={() => setBrowse(false)} />}
      <div className="mt-auto"><Chip on={false} at={at(CHEAT_ROWS.indexOf('done'), 0)} skin={skin} w={80} onClick={onClose}>DONE</Chip></div>
    </div>
  );
};

// The menu's flourishes (all CSS, all small: transforms and opacity, a shine across a slot, scanlines over the up-close
// well): the panel drops in with a bounce, the title stamps down, the slots pop in one after another, the one picked
// out bobs with a cursor round it and a shine across it, its art idles. Off for anyone who's asked for less motion.
const PAUSE_CSS = `
@keyframes pm-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes pm-drop { 0% { transform: translateY(-48px) scale(0.96); opacity: 0; } 55% { transform: translateY(7px) scale(1.01); opacity: 1; } 78% { transform: translateY(-3px) scale(1); } 100% { transform: translateY(0) scale(1); } }
@keyframes pm-stamp { 0% { transform: scale(2.3) rotate(-7deg); opacity: 0; } 60% { transform: scale(0.9) rotate(1deg); opacity: 1; } 80% { transform: scale(1.05) rotate(0deg); } 100% { transform: scale(1); } }
@keyframes pm-slot-in { 0% { transform: translateY(10px) scale(0.6); opacity: 0; } 70% { transform: translateY(-2px) scale(1.06); opacity: 1; } 100% { transform: translateY(0) scale(1); } }
@keyframes pm-pop { 0% { transform: scale(0.7); opacity: 0; } 70% { transform: scale(1.06); opacity: 1; } 100% { transform: scale(1); } }
@keyframes pm-bob { 0%, 100% { transform: translateY(0) rotate(0deg); } 25% { transform: translateY(-2px) rotate(-4deg); } 75% { transform: translateY(-1px) rotate(4deg); } }
@keyframes pm-float { 0%, 100% { transform: translate(0, 0) rotate(-2deg); } 50% { transform: translate(0, -4px) rotate(2deg); } }
@keyframes pm-drift { from { background-position: 0 0, 0 0; } to { background-position: 24px 12px, 0 0; } }
@keyframes pm-shine { 0%, 55% { transform: translateX(-140%) skewX(-20deg); } 85%, 100% { transform: translateX(240%) skewX(-20deg); } }
@keyframes pm-cursor-in { from { transform: scale(1.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes pm-cursor { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.07); } }
@keyframes pm-nudge { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(3px); } }
@keyframes pm-glint { 0%, 80% { opacity: 0; transform: scale(0.4) rotate(0deg); } 88% { opacity: 1; transform: scale(1) rotate(45deg); } 96%, 100% { opacity: 0; transform: scale(0.4) rotate(90deg); } }
.pm-btn:active { transform: translateY(3px) !important; border-bottom-width: 1px !important; box-shadow: 1px 1px 0 #000 !important; }
@media (prefers-reduced-motion: reduce) { .pm-root, .pm-root * { animation: none !important; transition: none !important; } }
`;

/** A slot's pixel frame: a bevel (lit top-left, shadowed bottom-right) and a dark pixel notched out of each corner. */
const PIXEL_BEVEL = 'inset 2px 2px 0 rgba(255,255,255,0.22), inset -2px -2px 0 rgba(0,0,0,0.5)';
const Notches: React.FC<{ color?: string }> = ({ color = '#000' }) => (<>
  {(['left-[-2px] top-[-2px]', 'right-[-2px] top-[-2px]', 'left-[-2px] bottom-[-2px]', 'right-[-2px] bottom-[-2px]'] as const).map(p =>
    <span key={p} className={`absolute ${p} w-[4px] h-[4px] pointer-events-none`} style={{ background: color }} />)}
</>);

/** A shine run across whatever it's in (that's to be `relative` and `overflow-hidden`, or this is put in a box that is). */
const Shine: React.FC<{ period?: number; delay?: number }> = ({ period = 2.2, delay = 0 }) => (
  <span className="absolute inset-y-0 left-0 w-[40%] pointer-events-none"
    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)', animation: `pm-shine ${period}s ease-in-out ${delay}s infinite` }} />
);

/** The cursor round the one picked out: four yellow corner brackets that snap in and breathe. */
const SlotCursor: React.FC = () => (
  <span className="absolute inset-[-6px] pointer-events-none" style={{ animation: 'pm-cursor-in 0.14s ease-out, pm-cursor 0.9s ease-in-out 0.14s infinite' }}>
    {([['left-0 top-0', 'border-l-[3px] border-t-[3px]'], ['right-0 top-0', 'border-r-[3px] border-t-[3px]'], ['left-0 bottom-0', 'border-l-[3px] border-b-[3px]'], ['right-0 bottom-0', 'border-r-[3px] border-b-[3px]']] as const).map(([p, b]) =>
      <span key={p} className={`absolute ${p} ${b} w-[11px] h-[11px] border-yellow-300`} style={{ filter: 'drop-shadow(1px 1px 0 #000)' }} />)}
  </span>
);

/** A section head (ARSENAL, CONTROLS): drop-shadowed, between the zone's own stripe and accent pips. */
const SectionHead: React.FC<{ skin: PauseSkin; children: React.ReactNode }> = ({ skin, children }) => (
  <div className="flex items-center gap-[5px] mb-2">
    <span className="w-[14px] h-[3px]" style={{ background: skin.stripe, boxShadow: '1px 1px 0 #000' }} />
    <span className="w-[4px] h-[4px] rotate-45" style={{ background: skin.accent, boxShadow: '1px 1px 0 #000' }} />
    <span className="text-[8px] font-black tracking-widest" style={{ color: skin.muted, textShadow: '1px 1px 0 #000, 2px 2px 0 rgba(0,0,0,0.35)' }}>{children}</span>
    <span className="w-[4px] h-[4px] rotate-45" style={{ background: skin.accent, boxShadow: '1px 1px 0 #000' }} />
    <span className="w-[14px] h-[3px]" style={{ background: skin.stripe, boxShadow: '1px 1px 0 #000' }} />
  </div>
);

/** A button along the bottom: chunky, presses down when clicked, and when picked out a cursor nudging at it and a
 *  shine across it. */
const MenuBtn: React.FC<{ on: boolean; onClick: () => void; cls: string; bg: string; edge: string; icon: React.ReactNode; children: React.ReactNode }> = ({ on, onClick, cls, bg, edge, icon, children }) => (
  <button onClick={onClick}
    className={`pm-btn relative flex items-center gap-2 ${cls} py-[7px] text-white font-black uppercase tracking-wider transition-all ${on ? 'translate-x-1 -translate-y-[1px]' : 'opacity-85 hover:opacity-100 hover:-translate-y-[1px]'}`}
    style={{ background: bg, borderBottom: `4px solid ${edge}`, boxShadow: on ? `0 0 12px rgba(250,204,21,0.6), 3px 3px 0 #000, ${PIXEL_BEVEL}` : `3px 3px 0 #000, ${PIXEL_BEVEL}`, outline: on ? '2px solid #FACC15' : 'none', textShadow: '1px 1px 0 rgba(0,0,0,0.6)' }}>
    {on && <span className="absolute inset-0 overflow-hidden pointer-events-none"><Shine period={1.8} /></span>}
    {on && <span className="absolute left-2 text-yellow-300" style={{ animation: 'pm-nudge 0.5s ease-in-out infinite' }}>&#9654;</span>}
    <span className="w-4 text-center">{icon}</span>{children}
  </button>
);

// Meathead 2's pause menu: the arsenal (each weapon with how much is left in it), the one picked out up close with its
// name, where it came from and what it does, and RESUME. Looks the way Meathead 1's does. Moved round with the D-pad or
// stick (or the arrow keys), picked with the confirm button (or ENTER, or a click); the weapon picked is the one he's
// holding.

interface Props {
  weapons: WeaponType[];
  current: WeaponType;
  ammo: Partial<Record<WeaponType, number>>;
  /** What's picked out: a weapon (its index), RESUME (weapons.length), MAP (weapons.length + 1), or OPTIONS
   *  (weapons.length + 2). */
  selected: number;
  onPick: (i: number) => void;
  onResume: () => void;
  /** MAP: the park map (parkmap/ParkMap.tsx). */
  onMap: () => void;
  /** No map here (the gym: he's not at the park yet): its button grayed out. */
  mapOff?: boolean;
  /** OPTIONS: the options screen (Meathead 1's, OptionsScreen.tsx). */
  onOptions: () => void;
  /** In the intro: skip the rest of it (picked out as weapons.length + 3). */
  onSkip?: () => void;
  /** What that button says, if not SKIP INTRO (the gym's, in the cheats build: SKIP STAGE). */
  skipLabel?: string;
  /** Done up for wherever he is (hudThemes.tsx). */
  skin?: PauseSkin;
  /** Stuck with the one he's holding for now (the mine cart): the rest shown, but not to be picked. */
  locked?: boolean;
  /** Out in a land (or the break room): BACK TO HUB (picked out as weapons.length + 3), asked first. */
  onHub?: () => void;
  /** ARE YOU SURE? up: which answer's picked out (0 NO, 1 YES), or null. */
  hubAsk?: 0 | 1 | null;
  onHubAnswer?: (yes: boolean) => void;
  onHubPick?: (a: 0 | 1) => void;
  /** QUIT (to the title), picked out as the last button; asked first (`asking` says which question's up). */
  onQuit?: () => void;
  quitAt?: number;
  asking?: 'hub' | 'quit';
  /** Playing on a save file (what QUIT loses is only what's since its last save) or with NO SAVE (the lot). */
  onFile?: boolean;
  /** A stretch with its own controls and no weapon switching (the dirt bike, the broom...): its controls card, shown
   *  in place of the weapons (PauseControls.tsx); the buttons along the bottom as ever. */
  card?: PauseCard | null;
  /** He's the cat (the cartoon White House): the ray gun's the HAIRBALL, here as on the HUD. */
  cat?: boolean;
}

/** The ray gun as the cat has it. */
const HAIRBALL_INFO = {
  name: 'HAIRBALL', from: "SOCKS THE CAT'S THROAT",
  controls: M2_WEAPON_INFO.GUN?.controls,
  description: 'Hork. A wet wad of fur and spit, hacked up at whoever. Never runs dry. Nobody wants to touch it, least of all the guy it hits.',
};

const PauseMenu: React.FC<Props> = ({ weapons, current, ammo, selected, onPick, onResume, onMap, onOptions, onSkip, skipLabel, skin = PLAIN_PAUSE, locked = false, onHub, hubAsk = null, onHubAnswer, onHubPick, card = null, onQuit, quitAt = -1, asking = 'hub', onFile = false, cat = false, mapOff = false }) => {
  const onQuitBtn = selected === quitAt;
  const shown = selected < weapons.length ? weapons[selected] : current;
  const info = cat && shown === 'GUN' ? HAIRBALL_INFO : M2_WEAPON_INFO[shown];
  const Art = ({ type, size }: { type: WeaponType; size: number }) => (cat && type === 'GUN' ? <HairballSvg size={size} /> : <M2WeaponArt type={type} size={size} />);
  const full = (w: WeaponType) => maxAmmo(w);
  const left = (w: WeaponType) => (full(w) === Infinity ? null : (ammo[w] ?? full(w)) / full(w));
  const ammoText = (w: WeaponType) => (full(w) === Infinity ? 'INFINITE' : `${Math.floor(ammo[w] ?? full(w))} / ${full(w)}`);
  const onResumeBtn = selected === weapons.length, onMapBtn = selected === weapons.length + 1, onOptionsBtn = selected === weapons.length + 2, onSkipBtn = selected === weapons.length + 3;
  // (five buttons along the bottom (BACK TO HUB or SKIP, and QUIT): set a little tighter, so they fit across)
  const tight = !!(onSkip || onHub) && !!onQuit;
  const btnCls = tight ? 'pl-5 pr-2 text-[8px] whitespace-nowrap' : 'pl-6 pr-3 text-[10px]';
  // (open, the menu behind it is dead to the pad and the keys: App asks cheatPanelOpen(); X on the pad opens it too;
  // shut when the menu goes)
  useSyncExternalStore(subscribeCheats, getCheats);
  const cheatsOpen = cheatPanelOpen();
  const setCheatsOpen = (open: boolean) => setCheatPanelOpen(open);
  useEffect(() => () => setCheatPanelOpen(false), []);

  return (
    <div className="pm-root absolute inset-0 z-40 flex items-center justify-center bg-black/70">
      <style>{PAUSE_CSS}</style>
      {/* (a soft vignette behind the panel) */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%)', animation: 'pm-fade 0.2s ease-out' }} />
      <div className="relative" style={{ animation: 'pm-drop 0.42s cubic-bezier(0.2, 0.9, 0.3, 1) both' }}>
      <div className="relative flex flex-col items-center w-[600px] px-6 pt-4 pb-3"
        style={skin.frame}>
        <div className="absolute left-0 right-0 top-0 h-[6px] overflow-hidden" style={{ background: skin.stripe }}><Shine period={4.5} delay={0.5} /></div>
        {skin.deco}
        {/* The cheats (mouse only) */}
        {!cheatsOpen && !M2_PUBLIC && <div role="button" onClick={() => setCheatsOpen(true)} onMouseDown={e => e.preventDefault()}
          className="absolute right-3 top-3 z-10 cursor-pointer select-none px-[5px] py-[2px] text-[6px] font-black tracking-widest border opacity-70 hover:opacity-100"
          style={{ color: skin.muted, borderColor: skin.muted, background: 'rgba(0,0,0,0.5)' }}>CHEATS</div>}
        {/* (over the whole of the menu while it's up: nothing behind it can be clicked) */}
        {cheatsOpen && <div className="absolute inset-0 z-[9]" onClick={e => e.stopPropagation()} onContextMenu={e => e.preventDefault()} />}
        {cheatsOpen && <CheatPanel skin={skin} onClose={() => setCheatsOpen(false)} />}
        {/* BACK TO HUB, asked first (over the menu: nothing behind it can be clicked) */}
        {hubAsk !== null && (
          <div className="absolute inset-0 z-[20] flex items-center justify-center bg-black/70" onClick={e => e.stopPropagation()} onContextMenu={e => e.preventDefault()}>
            <div className="flex flex-col items-center gap-3 px-6 py-4 border-4 border-red-600 bg-zinc-950 shadow-[4px_4px_0_#000]" style={{ animation: 'pm-pop 0.2s ease-out' }}>
              <div className="text-[12px] font-black tracking-widest text-yellow-300">{asking === 'quit' ? 'QUIT TO TITLE?' : 'BACK TO THE HUB?'}</div>
              <div className="text-[7px] font-black tracking-wider text-zinc-300">{asking === 'quit' ? (onFile ? "YOU'LL LOSE WHAT YOU'VE DONE SINCE THE LAST SAVE." : 'NO SAVE FILE: YOU LOSE EVERY LAND, EVERY WEAPON.') : "YOU'LL LOSE YOUR PLACE IN THIS LAND."}</div>
              <div className="flex gap-3">
                {(['NO', 'YES'] as const).map((t, k) => (
                  <button key={t} onMouseEnter={() => onHubPick?.(k as 0 | 1)} onClick={() => onHubAnswer?.(k === 1)}
                    className={`pm-btn px-4 py-[6px] text-[10px] font-black border-2 transition-transform ${hubAsk === k ? 'scale-110' : ''} ${hubAsk === k ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-zinc-900 text-white border-zinc-700'}`}>
                    {hubAsk === k ? '▶ ' : ''}{t}
                  </button>
                ))}
              </div>
              <div className="flex gap-4 text-[6px] tracking-wider text-zinc-400">
                <Prompt pad={['OK']} kb={['ENTER']} mouse="left" label="ANSWER" size={14} />
                <Prompt pad={['BACK']} kb={['ESC']} mouse="right" label="NO" size={14} />
              </div>
            </div>
          </div>
        )}
        <h2 className={`mt-1 ${skin.sub ? 'mb-1' : 'mb-3'} ${skin.title.length > 12 ? 'text-2xl' : 'text-3xl'} font-black italic tracking-widest whitespace-nowrap`} style={{ ...skin.titleStyle, animation: 'pm-stamp 0.34s cubic-bezier(0.3, 1.4, 0.5, 1) 0.16s both' }}>{skin.title}</h2>
        {skin.sub && <div className="mb-3 text-[7px] font-black tracking-wider" style={{ color: skin.muted, textShadow: '1px 1px 0 rgba(0,0,0,0.5)', animation: 'pm-fade 0.25s ease-out 0.35s both' }}>{skin.sub}</div>}

        {card ? (
          // A stretch with its own controls (no weapon switching there): its controls, in place of the weapons
          <div className="flex flex-col items-center w-full" style={{ animation: 'pm-pop 0.28s ease-out 0.2s both' }}>
            <SectionHead skin={skin}>CONTROLS</SectionHead>
            <div className="text-[11px] font-black uppercase leading-tight mb-2" style={{ color: skin.text, textShadow: '1px 1px 0 rgba(0,0,0,0.35)' }}>{card.title}</div>
            <div className="relative flex flex-col items-start gap-[6px] px-4 py-3 min-w-[300px] bg-black/60 border border-zinc-700 text-[8px] font-black text-zinc-200 tracking-wider" style={{ boxShadow: `${PIXEL_BEVEL}, 2px 2px 0 rgba(0,0,0,0.5)` }}>
              {card.rows.map((r, i) => <CardRowView key={i} row={r} size={15} />)}
            </div>
          </div>
        ) : (
        <div className="flex gap-4 w-full items-start">
          {/* The arsenal */}
          <div className="flex flex-col items-center">
            <SectionHead skin={skin}>ARSENAL</SectionHead>
            <div className="grid grid-cols-3 gap-[10px] p-2" style={skin.well}>
              {weapons.map((w, i) => {
                const on = selected === i, equipped = w === current, fill = left(w);
                return (
                  <button key={w} onClick={() => { if (!locked) onPick(i); }}
                    className={`relative w-[64px] h-[64px] flex items-center justify-center border-2 transition-transform duration-150 ${on ? 'scale-110 border-white z-[1]' : equipped ? 'border-yellow-500 hover:scale-105' : 'border-zinc-600 hover:scale-105'} ${locked && !equipped ? 'opacity-35' : ''}`}
                    style={{ background: on ? skin.slotOn : skin.slot, boxShadow: on ? `0 0 12px rgba(250,204,21,0.6), 2px 2px 0 #000, ${PIXEL_BEVEL}` : `2px 2px 0 rgba(0,0,0,0.6), ${PIXEL_BEVEL}`, animation: `pm-slot-in 0.26s ease-out ${0.18 + i * 0.03}s backwards` }}>
                    <Notches />
                    {on && <span className="absolute inset-0 overflow-hidden pointer-events-none"><Shine period={2} /></span>}
                    {on && <SlotCursor />}
                    <span className="absolute left-1 top-0 text-[7px] font-black text-zinc-300" style={{ textShadow: '1px 1px 0 #000' }}>{i + 1}</span>
                    <span className="flex" style={on ? { animation: 'pm-bob 1.1s ease-in-out infinite' } : undefined}><Art type={w} size={46} /></span>
                    {fill !== null && <span className="absolute left-1 right-1 bottom-1 h-[3px] bg-black"><span className="block h-full bg-green-400" style={{ width: `${Math.max(0, Math.min(1, fill)) * 100}%`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45)' }} /></span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* The one picked out, up close */}
          <div className="flex-1 flex flex-col items-center text-center pt-5" style={{ animation: 'pm-fade 0.3s ease-out 0.22s both' }}>
            {/* (a dot field drifting behind it, the art floating over: a little depth; scanlines and a glint over the lot) */}
            <div className="relative w-[104px] h-[104px] flex items-center justify-center mb-2 border-2 border-zinc-700 overflow-hidden"
              style={{ backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1.5px), radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.6) 70%)`, backgroundSize: '12px 12px, auto', borderColor: skin.accent, boxShadow: `${PIXEL_BEVEL}, 0 0 0 2px #000, 3px 3px 0 2px rgba(0,0,0,0.45)`, animation: 'pm-drift 6s linear infinite' }}>
              <span key={shown} className="flex" style={{ animation: 'pm-pop 0.22s ease-out' }}>
                <span className="flex" style={{ animation: 'pm-float 2.4s ease-in-out infinite' }}><Art type={shown} size={88} /></span>
              </span>
              <span className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(180deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 3px)' }} />
              <span className="absolute inset-0 overflow-hidden pointer-events-none"><Shine period={3.4} delay={0.8} /></span>
              <span className="absolute right-[10px] top-[10px] w-[10px] h-[10px] pointer-events-none" style={{ animation: 'pm-glint 3.4s linear 0.8s infinite', opacity: 0, background: 'linear-gradient(90deg, transparent 4px, #fff 4px 6px, transparent 6px), linear-gradient(180deg, transparent 4px, #fff 4px 6px, transparent 6px)' }} />
            </div>
            <div className="text-[11px] font-black uppercase leading-tight mb-1" style={{ color: skin.text, textShadow: '1px 1px 0 rgba(0,0,0,0.35)' }}>{info?.name ?? shown}</div>
            <div className="text-[7px] font-black uppercase tracking-wider mb-2 text-center" style={{ color: skin.accent }}>FROM {info?.from ?? ''}{shown === current && <span className="block text-red-500 whitespace-nowrap mt-[2px]">[ EQUIPPED ]</span>}</div>
            <div className="text-[7px] leading-[11px] uppercase font-bold mb-2 min-h-[44px]" style={{ color: skin.text }}>&ldquo;{info?.description ?? ''}&rdquo;</div>
            <div className="text-[7px] font-black tracking-wider" style={{ color: skin.muted }}>{ammoName(shown)}: {ammoText(shown)}</div>
            {/* (worn right out: what's left of it) */}
            {shown === 'MALLET' && malletBroken() && <div className="text-[7px] font-black tracking-wider text-red-500 mt-[2px]">BROKEN: JUST A STICK. NO TORNADO, NO SMASHES. AMMO FIXES IT.</div>}
            {/* How it's worked: a line per move, the buttons for whatever's being played on */}
            {info?.controls?.length ? (
              <div className="mt-2 w-full flex flex-col items-start gap-[3px] px-2 py-1 bg-black/60 border border-zinc-700 text-[6px] font-black text-zinc-200 tracking-wider" style={{ boxShadow: `${PIXEL_BEVEL}, 2px 2px 0 rgba(0,0,0,0.5)` }}>
                {info.controls.map((k, i) => <ChordPrompt key={i} pad={k.pad} join={k.join ?? '+'} kb={k.kb} mouse={k.mouse} label={k.label} size={12} />)}
                {info.note && <span className="text-red-400 mt-[1px]">{info.note}</span>}
              </div>
            ) : null}
          </div>
        </div>
        )}

        <div className="flex gap-2 mt-4" style={{ animation: 'pm-fade 0.25s ease-out 0.3s both' }}>
          <MenuBtn on={onResumeBtn} onClick={onResume} cls={btnCls} bg={skin.button} edge={skin.buttonEdge} icon="▶">RESUME</MenuBtn>
          <MenuBtn on={onMapBtn} onClick={onMap} cls={btnCls} bg={mapOff ? 'linear-gradient(180deg, #52525B, #3F3F46)' : 'linear-gradient(180deg, #0E7490, #155E75)'} edge={mapOff ? '#27272A' : '#083344'} icon="✦">MAP</MenuBtn>
          <MenuBtn on={onOptionsBtn} onClick={onOptions} cls={btnCls} bg="linear-gradient(180deg, #3F6212, #365314)" edge="#1A2E05" icon="⚙">OPTIONS</MenuBtn>
          {onSkip && <MenuBtn on={onSkipBtn} onClick={onSkip} cls={btnCls} bg="linear-gradient(180deg, #2563EB, #1E3A8A)" edge="#172554" icon="»">{skipLabel ?? (walkBackOn() ? 'SKIP TO HUB' : 'SKIP INTRO')}</MenuBtn>}
          {onHub && <MenuBtn on={onSkipBtn} onClick={onHub} cls={btnCls} bg="linear-gradient(180deg, #B91C1C, #7F1D1D)" edge="#450A0A" icon="«">BACK TO HUB</MenuBtn>}
          {onQuit && <MenuBtn on={onQuitBtn} onClick={onQuit} cls={btnCls} bg="linear-gradient(180deg, #52525B, #27272A)" edge="#09090B" icon="✕">QUIT</MenuBtn>}
        </div>
        <div className="mt-3 flex items-center gap-4 text-[6px] tracking-wider px-2 py-1 bg-black/60 text-zinc-400" style={{ boxShadow: PIXEL_BEVEL }}>
          <Prompt pad={['START', 'BACK']} kb={['ESC']} mouse="right" label="RESUME" size={15} />
          <Prompt pad={['SELECT']} kb={['@map']} label="MAP" size={15} />
          {card ? <Prompt pad={['DPAD', 'OK']} kb={['ENTER']} mouse="left" label="SELECT" size={15} />
            : locked ? <span className="text-red-400 font-black">WEAPON SWITCHING LOCKED</span>
            : <Prompt pad={['DPAD', 'OK']} kb={['1-9']} mouse="left" label="EQUIP" size={15} />}
          {!M2_PUBLIC && <Prompt pad={['X']} mouse="left" label="CHEATS" size={15} />}
        </div>
      </div>
      </div>
    </div>
  );
};

export default PauseMenu;
