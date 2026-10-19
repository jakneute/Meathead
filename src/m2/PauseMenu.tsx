import React, { useEffect, useSyncExternalStore } from 'react';
import type { WeaponType } from '../m1/types';
import { maxAmmo } from '../m1/constants';
import { Prompt } from '../m1/components/ButtonIcons';
import { M2_WEAPON_INFO, M2WeaponArt, ammoName } from './weapons';
import ChordPrompt from './ChordPrompt';
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
        <div className="self-center text-[7px] font-black tracking-wider max-w-[300px] truncate" style={{ color: skin.text }}>{soundTestLabel()}</div>
      </>)}
      <div className="mt-auto"><Chip on={false} at={at(CHEAT_ROWS.indexOf('done'), 0)} skin={skin} w={80} onClick={onClose}>DONE</Chip></div>
    </div>
  );
};

// Meathead 2's pause menu: the arsenal (each weapon with how much is left in it), the one picked out up close with its
// name, where it came from and what it does, and RESUME. Looks the way Meathead 1's does. Moved round with the D-pad or
// stick (or the arrow keys), picked with the confirm button (or ENTER, or a click); the weapon picked is the one he's
// holding.

interface Props {
  weapons: WeaponType[];
  current: WeaponType;
  ammo: Partial<Record<WeaponType, number>>;
  /** What's picked out: a weapon (its index), RESUME (weapons.length), or OPTIONS (weapons.length + 1). */
  selected: number;
  onPick: (i: number) => void;
  onResume: () => void;
  /** OPTIONS: the options screen (Meathead 1's, OptionsScreen.tsx). */
  onOptions: () => void;
  /** In the intro: skip the rest of it (picked out as weapons.length + 2). */
  onSkip?: () => void;
  /** Done up for wherever he is (hudThemes.tsx). */
  skin?: PauseSkin;
  /** Stuck with the one he's holding for now (the mine cart): the rest shown, but not to be picked. */
  locked?: boolean;
  /** Out in a land (or the break room): BACK TO HUB (picked out as weapons.length + 2), asked first. */
  onHub?: () => void;
  /** ARE YOU SURE? up: which answer's picked out (0 NO, 1 YES), or null. */
  hubAsk?: 0 | 1 | null;
  onHubAnswer?: (yes: boolean) => void;
  onHubPick?: (a: 0 | 1) => void;
}

const PauseMenu: React.FC<Props> = ({ weapons, current, ammo, selected, onPick, onResume, onOptions, onSkip, skin = PLAIN_PAUSE, locked = false, onHub, hubAsk = null, onHubAnswer, onHubPick }) => {
  const shown = selected < weapons.length ? weapons[selected] : current;
  const info = M2_WEAPON_INFO[shown];
  const full = (w: WeaponType) => maxAmmo(w);
  const left = (w: WeaponType) => (full(w) === Infinity ? null : (ammo[w] ?? full(w)) / full(w));
  const ammoText = (w: WeaponType) => (full(w) === Infinity ? 'INFINITE' : `${Math.floor(ammo[w] ?? full(w))} / ${full(w)}`);
  const onResumeBtn = selected === weapons.length, onOptionsBtn = selected === weapons.length + 1, onSkipBtn = selected === weapons.length + 2;
  // (open, the menu behind it is dead to the pad and the keys: App asks cheatPanelOpen(); X on the pad opens it too;
  // shut when the menu goes)
  useSyncExternalStore(subscribeCheats, getCheats);
  const cheatsOpen = cheatPanelOpen();
  const setCheatsOpen = (open: boolean) => setCheatPanelOpen(open);
  useEffect(() => () => setCheatPanelOpen(false), []);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70">
      <div className="relative flex flex-col items-center w-[600px] px-6 pt-4 pb-3"
        style={skin.frame}>
        <div className="absolute left-0 right-0 top-0 h-[6px]" style={{ background: skin.stripe }} />
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
            <div className="flex flex-col items-center gap-3 px-6 py-4 border-4 border-red-600 bg-zinc-950 shadow-[4px_4px_0_#000]">
              <div className="text-[12px] font-black tracking-widest text-yellow-300">BACK TO THE HUB?</div>
              <div className="text-[7px] font-black tracking-wider text-zinc-300">YOU'LL LOSE YOUR PLACE IN THIS LAND.</div>
              <div className="flex gap-3">
                {(['NO', 'YES'] as const).map((t, k) => (
                  <button key={t} onMouseEnter={() => onHubPick?.(k as 0 | 1)} onClick={() => onHubAnswer?.(k === 1)}
                    className={`px-4 py-[6px] text-[10px] font-black border-2 ${hubAsk === k ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-zinc-900 text-white border-zinc-700'}`}>
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
        <h2 className={`mt-1 ${skin.sub ? 'mb-1' : 'mb-3'} ${skin.title.length > 12 ? 'text-2xl' : 'text-3xl'} font-black italic tracking-widest whitespace-nowrap`} style={skin.titleStyle}>{skin.title}</h2>
        {skin.sub && <div className="mb-3 text-[7px] font-black tracking-wider" style={{ color: skin.muted }}>{skin.sub}</div>}

        <div className="flex gap-4 w-full items-start">
          {/* The arsenal */}
          <div className="flex flex-col items-center">
            <div className="text-[8px] font-black tracking-widest mb-2" style={{ color: skin.muted }}>ARSENAL</div>
            <div className="grid grid-cols-3 gap-[10px] p-2" style={skin.well}>
              {weapons.map((w, i) => {
                const on = selected === i, equipped = w === current, fill = left(w);
                return (
                  <button key={w} onClick={() => { if (!locked) onPick(i); }}
                    className={`relative w-[64px] h-[64px] flex items-center justify-center border-2 transition-transform ${on ? 'scale-110 border-white' : equipped ? 'border-yellow-500' : 'border-zinc-600'} ${locked && !equipped ? 'opacity-35' : ''}`}
                    style={{ background: on ? skin.slotOn : skin.slot, boxShadow: on ? '0 0 12px rgba(250,204,21,0.6)' : 'none' }}>
                    <span className="absolute left-1 top-0 text-[7px] font-black text-zinc-300">{i + 1}</span>
                    <M2WeaponArt type={w} size={46} />
                    {fill !== null && <span className="absolute left-1 right-1 bottom-1 h-[3px] bg-black"><span className="block h-full bg-green-400" style={{ width: `${Math.max(0, Math.min(1, fill)) * 100}%` }} /></span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* The one picked out, up close */}
          <div className="flex-1 flex flex-col items-center text-center pt-5">
            <div className="w-[104px] h-[104px] flex items-center justify-center mb-2 border-2 border-zinc-700"
              style={{ background: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.6) 70%)`, borderColor: skin.accent }}>
              <M2WeaponArt type={shown} size={88} />
            </div>
            <div className="text-[11px] font-black uppercase leading-tight mb-1" style={{ color: skin.text, textShadow: '1px 1px 0 rgba(0,0,0,0.35)' }}>{info?.name ?? shown}</div>
            <div className="text-[7px] font-black uppercase tracking-wider mb-2 text-center" style={{ color: skin.accent }}>FROM {info?.from ?? ''}{shown === current && <span className="block text-red-500 whitespace-nowrap mt-[2px]">[ EQUIPPED ]</span>}</div>
            <div className="text-[7px] leading-[11px] uppercase font-bold mb-2 min-h-[44px]" style={{ color: skin.text }}>&ldquo;{info?.description ?? ''}&rdquo;</div>
            <div className="text-[7px] font-black tracking-wider" style={{ color: skin.muted }}>{ammoName(shown)}: {ammoText(shown)}</div>
            {/* How it's worked: a line per move, the buttons for whatever's being played on */}
            {info?.controls?.length ? (
              <div className="mt-2 w-full flex flex-col items-start gap-[3px] px-2 py-1 bg-black/60 border border-zinc-700 text-[6px] font-black text-zinc-200 tracking-wider">
                {info.controls.map((k, i) => <ChordPrompt key={i} pad={k.pad} join={k.join ?? '+'} kb={k.kb} mouse={k.mouse} label={k.label} size={12} />)}
                {info.note && <span className="text-red-400 mt-[1px]">{info.note}</span>}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={onResume}
            className={`relative flex items-center gap-2 pl-6 pr-3 py-[7px] text-white text-[10px] font-black uppercase tracking-wider transition-all ${onResumeBtn ? 'translate-x-1' : 'opacity-85 hover:opacity-100'}`}
            style={{ background: skin.button, borderBottom: `4px solid ${skin.buttonEdge}`, boxShadow: onResumeBtn ? '0 0 12px rgba(250,204,21,0.6), 3px 3px 0 #000' : '3px 3px 0 #000', outline: onResumeBtn ? '2px solid #FACC15' : 'none' }}>
            {onResumeBtn && <span className="absolute left-2 text-yellow-300 animate-pulse">&#9654;</span>}
            <span className="w-4 text-center">▶</span>RESUME
          </button>
          <button onClick={onOptions}
            className={`relative flex items-center gap-2 pl-6 pr-3 py-[7px] text-white text-[10px] font-black uppercase tracking-wider transition-all ${onOptionsBtn ? 'translate-x-1' : 'opacity-85 hover:opacity-100'}`}
            style={{ background: 'linear-gradient(180deg, #3F6212, #365314)', borderBottom: '4px solid #1A2E05', boxShadow: onOptionsBtn ? '0 0 12px rgba(250,204,21,0.6), 3px 3px 0 #000' : '3px 3px 0 #000', outline: onOptionsBtn ? '2px solid #FACC15' : 'none' }}>
            {onOptionsBtn && <span className="absolute left-2 text-yellow-300 animate-pulse">&#9654;</span>}
            <span className="w-4 text-center">⚙</span>OPTIONS
          </button>
          {onSkip && (
            <button onClick={onSkip}
              className={`relative flex items-center gap-2 pl-6 pr-3 py-[7px] text-white text-[10px] font-black uppercase tracking-wider transition-all ${onSkipBtn ? 'translate-x-1' : 'opacity-85 hover:opacity-100'}`}
              style={{ background: 'linear-gradient(180deg, #2563EB, #1E3A8A)', borderBottom: '4px solid #172554', boxShadow: onSkipBtn ? '0 0 12px rgba(250,204,21,0.6), 3px 3px 0 #000' : '3px 3px 0 #000', outline: onSkipBtn ? '2px solid #FACC15' : 'none' }}>
              {onSkipBtn && <span className="absolute left-2 text-yellow-300 animate-pulse">&#9654;</span>}
              <span className="w-4 text-center">»</span>{walkBackOn() ? 'SKIP TO HUB' : 'SKIP INTRO'}
            </button>
          )}
          {onHub && (
            <button onClick={onHub}
              className={`relative flex items-center gap-2 pl-6 pr-3 py-[7px] text-white text-[10px] font-black uppercase tracking-wider transition-all ${onSkipBtn ? 'translate-x-1' : 'opacity-85 hover:opacity-100'}`}
              style={{ background: 'linear-gradient(180deg, #B91C1C, #7F1D1D)', borderBottom: '4px solid #450A0A', boxShadow: onSkipBtn ? '0 0 12px rgba(250,204,21,0.6), 3px 3px 0 #000' : '3px 3px 0 #000', outline: onSkipBtn ? '2px solid #FACC15' : 'none' }}>
              {onSkipBtn && <span className="absolute left-2 text-yellow-300 animate-pulse">&#9654;</span>}
              <span className="w-4 text-center">«</span>BACK TO HUB
            </button>
          )}
        </div>
        <div className="mt-3 flex items-center gap-4 text-[6px] tracking-wider px-2 py-1 bg-black/60 text-zinc-400">
          <Prompt pad={['START', 'BACK']} kb={['ESC']} mouse="right" label="RESUME" size={15} />
          {locked ? <span className="text-red-400 font-black">WEAPON SWITCHING LOCKED</span>
            : <Prompt pad={['DPAD', 'OK']} kb={['1-9']} mouse="left" label="EQUIP" size={15} />}
          {!M2_PUBLIC && <Prompt pad={['X']} mouse="left" label="CHEATS" size={15} />}
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;
