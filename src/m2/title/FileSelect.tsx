import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Prompt } from '../../m1/components/ButtonIcons';
import { useCursorSound } from '../../m1/components/useCursorSound';
import { getActiveGamepad, isButtonPressed, getGamepadMovement, GP_BUTTONS, menuButtons } from '../../m1/game/platform/gamepad';
import { playMenuOk, playMenuBack } from '../../m1/game/platform/audio';
import { SLOTS, readFile, deleteFile, subscribeFiles, filesVersion, formatPlayTime, formatLastPlayed, type Slot, type SaveFile } from '../save';
import { LANDS } from '../hub/lands';
import { LAND_WEAPON } from '../store';
import { M2WeaponArt } from '../weapons';

// START GAME's file select, over the title, as Meathead 1's is (src/m1/components/FileSelect.tsx): the three save files
// and NO SAVE (play it all, nothing written). An empty file starts a new game on it; a used one asks CONTINUE or START
// OVER (and starting over asks again: it's the file gone). Any used one can be deleted (asked first). Its own input
// while it's up: up and down, confirm and back (a controller's, wherever its menus have them; Start confirms, as on the
// title), X or Delete to delete, the mouse too (left click picks, right click goes back). A file's card shows the lands
// cleared (each one's boss's weapon, in the land's colors; a dark shape if not yet).

type Act = 'up' | 'down' | 'left' | 'right' | 'ok' | 'back' | 'del';
/** What's being asked: a used file's CONTINUE or START OVER (`at` 0 or 1), or YES / NO to starting it over or deleting it. */
type Ask = null | { kind: 'choice'; slot: Slot; at: number } | { kind: 'erase' | 'delete'; slot: Slot; yes: boolean };

/** The rows: the three files, then NO SAVE. */
const ROWS = SLOTS.length + 1;
const NO_SAVE = SLOTS.length;
const PAD_REPEAT_MS = 180;
/** The lands that have a boss to beat (Cartoon Land too, once it's open). */
const BOSS_LANDS = LANDS.filter(l => LAND_WEAPON[l.id]);

/** A land on a file: its boss's weapon on the land's colors if he's cleared it, a dark shape if not. */
const LandTile: React.FC<{ id: string; done: boolean }> = ({ id, done }) => {
  const land = LANDS.find(l => l.id === id)!;
  return (
    <div className="relative w-[32px] h-[32px] shrink-0 flex items-center justify-center overflow-hidden" title={done ? land.name : '???'}
      style={{ background: done ? `linear-gradient(180deg, ${land.swirl[1]}, ${land.swirl[0]})` : '#18181B', border: `2px solid ${done ? land.swirl[2] : '#3F3F46'}`, boxShadow: '1px 1px 0 #000' }}>
      <div style={done ? undefined : { filter: 'brightness(0)', opacity: 0.55 }}><M2WeaponArt type={LAND_WEAPON[id]} size={24} /></div>
    </div>
  );
};

const FileSelect: React.FC<{
  /** A file picked: a new game on it (anything on it erased), or carrying on with it; null is NO SAVE (a new game). */
  onPick: (slot: Slot | null, how: 'new' | 'continue') => void;
  onClose: () => void;
}> = ({ onPick, onClose }) => {
  useSyncExternalStore(subscribeFiles, filesVersion, filesVersion);
  const files = SLOTS.map(s => readFile(s));
  const [cursor, setCursor] = useState(0);
  const [ask, setAsk] = useState<Ask>(null);

  useCursorSound(cursor, ask === null);
  useCursorSound(ask ? (ask.kind === 'choice' ? ask.at : ask.yes) : null, ask !== null, ask ? `${ask.kind}${ask.slot}` : null);

  const pickRow = (row: number) => {
    if (row === NO_SAVE) { onPick(null, 'new'); return; }
    const slot = SLOTS[row];
    if (!files[row]) { onPick(slot, 'new'); return; }
    playMenuOk();
    setAsk({ kind: 'choice', slot, at: 0 });
  };
  const askDelete = (row: number) => {
    if (row === NO_SAVE || !files[row]) return;
    playMenuOk();
    setAsk({ kind: 'delete', slot: SLOTS[row], yes: false });
  };
  const answer = (a: NonNullable<Ask>, yes: boolean) => {
    if (a.kind === 'choice') {
      if (!yes) { onPick(a.slot, 'continue'); return; }
      playMenuOk();
      setAsk({ kind: 'erase', slot: a.slot, yes: false });
      return;
    }
    if (!yes) { playMenuBack(); setAsk(a.kind === 'erase' ? { kind: 'choice', slot: a.slot, at: 1 } : null); return; }
    setAsk(null);
    if (a.kind === 'erase') { onPick(a.slot, 'new'); return; }
    // (deleted: the cursor stays on it, NEW now)
    deleteFile(a.slot);
    playMenuBack();
  };

  const act = (a: Act) => {
    if (ask) {
      if (a === 'left' || a === 'right') {
        if (ask.kind === 'choice') setAsk({ ...ask, at: a === 'left' ? 0 : 1 });
        else setAsk({ ...ask, yes: a === 'left' });
      } else if (a === 'ok') answer(ask, ask.kind === 'choice' ? ask.at === 1 : ask.yes);
      else if (a === 'back') { playMenuBack(); setAsk(ask.kind === 'erase' ? { kind: 'choice', slot: ask.slot, at: 1 } : null); }
      return;
    }
    if (a === 'up') setCursor(c => (c + ROWS - 1) % ROWS);
    else if (a === 'down') setCursor(c => (c + 1) % ROWS);
    else if (a === 'back') { playMenuBack(); onClose(); }
    else if (a === 'ok') pickRow(cursor);
    else if (a === 'del') askDelete(cursor);
  };
  const actRef = useRef(act); actRef.current = act;

  // Keyboard and mouse (the menus' own keys, whatever the game's are bound to)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const a: Act | null = k === 'arrowup' || k === 'w' ? 'up' : k === 'arrowdown' || k === 's' ? 'down' : k === 'arrowleft' || k === 'a' ? 'left' : k === 'arrowright' || k === 'd' ? 'right'
        : k === 'enter' || k === ' ' ? 'ok' : k === 'escape' || k === 'backspace' ? 'back' : k === 'delete' ? 'del' : null;
      if (!a) return;
      e.preventDefault();
      e.stopPropagation();
      // (a key held down from the title doesn't run on into a file)
      if (e.repeat && (a === 'ok' || a === 'back' || a === 'del')) return;
      actRef.current(a);
    };
    const onMouseDown = (e: MouseEvent) => { if (e.button === 2) actRef.current('back'); };
    const noMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('mousedown', onMouseDown, true);
    window.addEventListener('contextmenu', noMenu);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('mousedown', onMouseDown, true);
      window.removeEventListener('contextmenu', noMenu);
    };
  }, []);

  // The controller: the stick or the D-pad, its menu confirm (or Start) and back, X to delete
  useEffect(() => {
    let frame = 0, lastMove = 0;
    let prev: { ok: boolean; back: boolean; del: boolean; start: boolean } | null = null;
    const poll = () => {
      const gp = getActiveGamepad();
      if (gp) {
        const m = menuButtons(gp);
        const now = { ok: isButtonPressed(gp, m.ok), back: isButtonPressed(gp, m.back), del: isButtonPressed(gp, GP_BUTTONS.X), start: isButtonPressed(gp, GP_BUTTONS.START) };
        // (whatever was already held as it opened isn't a press)
        const was = prev ?? now;
        const just = (k: keyof typeof now) => now[k] && !was[k];
        const move = getGamepadMovement(gp, 0.25), t = Date.now();
        const dir: Act | null = move.up ? 'up' : move.down ? 'down' : move.left ? 'left' : move.right ? 'right' : null;
        if (!dir) lastMove = 0;
        else if (t - lastMove > PAD_REPEAT_MS) { lastMove = t; actRef.current(dir); }
        if (just('ok') || just('start')) actRef.current('ok');
        if (just('back')) actRef.current('back');
        if (just('del')) actRef.current('del');
        prev = now;
      } else prev = null;
      frame = requestAnimationFrame(poll);
    };
    frame = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frame);
  }, []);

  // --- drawing it (Meathead 1's file select in Happy Land's colors: candy pink, gold, a midway stripe) ---
  const idle = ask === null;
  const rowClass = (on: boolean) => `relative w-full flex items-center gap-3 pl-7 pr-3 text-left transition-colors ${on ? 'bg-[#4a0d38]' : 'bg-black/40 hover:bg-black/60'}`;
  const rowStyle = (on: boolean): React.CSSProperties => ({ outline: on ? '2px solid #FACC15' : '1px solid #3F3F46', boxShadow: on ? '0 0 10px rgba(250,204,21,0.45), 3px 3px 0 #000' : '2px 2px 0 #000' });
  const marker = (on: boolean) => (on ? <span className="absolute left-2 text-yellow-300 animate-pulse">&#9654;</span> : null);
  const hover = (i: number) => () => { if (idle) setCursor(i); };
  const at = files[cursor];

  const fileCard = (f: SaveFile | null, i: number) => {
    const on = cursor === i, slot = SLOTS[i];
    const done = f ? BOSS_LANDS.filter(l => f.cleared.includes(l.id)).length : 0;
    return (
      <div key={slot} role="button" onMouseEnter={hover(i)} onClick={() => { if (idle) { setCursor(i); pickRow(i); } }}
        className={`${rowClass(on)} h-[96px] cursor-pointer`} style={rowStyle(on)}>
        {marker(on)}
        <div className="w-[86px] shrink-0 flex flex-col gap-2">
          <span className="text-[13px] font-black italic tracking-widest text-white" style={{ textShadow: '2px 2px 0 #9D174D' }}>FILE {slot}</span>
          {f && done === BOSS_LANDS.length && <span className="text-[6px] font-black tracking-wider text-yellow-300">&#9733; PARK CLEARED</span>}
        </div>
        {f ? (
          <>
            <div className="flex flex-col gap-[6px]">
              <div className="flex gap-[3px]">{BOSS_LANDS.map(l => <LandTile key={l.id} id={l.id} done={f.cleared.includes(l.id)} />)}</div>
              <div className="flex gap-4 text-[7px] font-black tracking-wider">
                <span className="text-zinc-400">LANDS <span className="text-white">{done}/{BOSS_LANDS.length}</span></span>
                <span className="text-zinc-400">WEAPONS <span className="text-white">{done + 1}/{BOSS_LANDS.length + 1}</span></span>
              </div>
            </div>
            <div className="ml-auto flex flex-col items-end gap-[5px] text-right text-[7px] font-black tracking-wider">
              <span className="text-zinc-400">PLAY TIME <span className="text-white">{formatPlayTime(f.playTimeMs)}</span></span>
              <span className="text-zinc-400">LAST PLAYED</span>
              <span className="text-pink-300 text-[6px]">{formatLastPlayed(f.lastPlayed)}</span>
              <button onClick={e => { e.stopPropagation(); if (idle) { setCursor(i); askDelete(i); } }}
                className="mt-[2px] px-2 py-[3px] text-[6px] font-black tracking-wider text-red-300 bg-red-950/70 border-2 border-red-800 hover:bg-red-900 hover:text-white"
                style={{ boxShadow: '2px 2px 0 #000' }}>DELETE</button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center pr-[86px]">
            <span className={`text-[20px] font-black italic tracking-[0.3em] ${on ? 'text-yellow-400' : 'text-zinc-500'}`} style={{ textShadow: '3px 3px 0 #000' }}>NEW</span>
          </div>
        )}
      </div>
    );
  };

  /** A question over the cards: CONTINUE / START OVER, or YES / NO. */
  const askBox = (a: NonNullable<Ask>) => {
    const title = a.kind === 'choice' ? `FILE ${a.slot}` : a.kind === 'erase' ? `START FILE ${a.slot} OVER?` : `DELETE FILE ${a.slot}?`;
    const note = a.kind === 'choice' ? 'PICK UP WHERE YOU LEFT OFF, OR WIPE IT AND START FROM SCRATCH' : "EVERYTHING ON IT'S GONE FOR GOOD";
    const opts: [string, boolean, string, string][] = a.kind === 'choice'
      ? [['CONTINUE', false, 'linear-gradient(180deg, #CA8A04, #854D0E)', '#422006'], ['START OVER', true, 'linear-gradient(180deg, #B91C1C, #7F1D1D)', '#450A0A']]
      : [['YES', true, 'linear-gradient(180deg, #B91C1C, #7F1D1D)', '#450A0A'], ['NO', false, 'linear-gradient(180deg, #52525B, #3F3F46)', '#18181B']];
    const sel = (yes: boolean) => (a.kind === 'choice' ? (a.at === 1) === yes : a.yes === yes);
    const point = (yes: boolean) => setAsk(a.kind === 'choice' ? { ...a, at: yes ? 1 : 0 } : { ...a, yes });
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 animate-in fade-in duration-150" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center px-8 py-5" style={{ background: 'linear-gradient(180deg, #27272A, #09090B)', border: `3px solid ${a.kind === 'choice' ? '#FACC15' : '#EF4444'}`, boxShadow: '0 0 0 3px #000, 0 0 30px rgba(236,72,153,0.35)' }}>
          <div className="text-yellow-400 text-[15px] font-black italic tracking-widest mb-2" style={{ textShadow: '2px 2px 0 #9D174D' }}>{title}</div>
          <div className="text-zinc-300 text-[8px] font-black uppercase tracking-wider mb-4">{note}</div>
          <div className="flex gap-4">
            {opts.map(([label, yes, face, edge]) => {
              const on = sel(yes);
              return (
                <button key={label} onMouseEnter={() => point(yes)} onClick={() => answer(a, yes)}
                  className={`relative pl-8 pr-5 py-[7px] text-white text-[11px] font-black tracking-wider transition-all ${on ? 'translate-y-[-1px]' : 'opacity-80 hover:opacity-100'}`}
                  style={{ background: face, borderBottom: `4px solid ${edge}`, boxShadow: on ? '0 0 12px rgba(250,204,21,0.6), 3px 3px 0 #000' : '3px 3px 0 #000', outline: on ? '2px solid #FACC15' : 'none' }}>
                  {on && <span className="absolute left-2 text-yellow-300 animate-pulse">&#9654;</span>}{label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/85 select-none animate-in fade-in duration-150" style={{ fontFamily: '"Press Start 2P", monospace' }}>
      <div className="relative flex flex-col items-stretch w-[680px] px-6 pt-4 pb-3"
        style={{
          background: 'linear-gradient(180deg, rgba(30,14,36,0.98) 0%, rgba(10,6,14,0.98) 100%)',
          border: '3px solid #FACC15',
          boxShadow: '0 0 0 3px #000, 0 0 40px rgba(0,0,0,0.9), inset 0 0 30px rgba(236,72,153,0.08)',
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 3px)',
        }}>
        <div className="absolute left-0 right-0 top-0 h-[6px]" style={{ background: 'repeating-linear-gradient(90deg, #EC4899 0 12px, #FDE68A 12px 24px)' }} />
        <div className="flex items-baseline justify-center gap-3 mt-1 mb-3">
          <h2 className="text-2xl font-black italic tracking-widest text-yellow-400" style={{ textShadow: '3px 3px 0 #9D174D, 5px 5px 0 #000' }}>SELECT FILE</h2>
        </div>

        <div className="relative flex flex-col gap-3 px-1 py-1">
          {files.map(fileCard)}
          {(() => {
            const on = cursor === NO_SAVE;
            return (
              <button onMouseEnter={hover(NO_SAVE)} onClick={() => { if (idle) { setCursor(NO_SAVE); pickRow(NO_SAVE); } }} className={`${rowClass(on)} !py-[8px]`} style={rowStyle(on)}>
                {marker(on)}
                <span className="w-[86px] shrink-0 text-[11px] font-black italic tracking-widest text-white" style={{ textShadow: '2px 2px 0 #9D174D' }}>NO SAVE</span>
                <span className="text-[7px] font-black tracking-wider text-zinc-400">PLAY WITHOUT SAVING ANYTHING</span>
              </button>
            );
          })()}
          {ask && askBox(ask)}
        </div>

        {/* What the buttons do here (the menus' own: they never change) */}
        <div className="mt-3 h-[16px] flex items-center justify-center gap-5 text-[6px] text-zinc-400 tracking-wider">
          {ask ? (
            <>
              <Prompt pad={['DPAD', 'OK']} kb={['ENTER']} mouse="left" label="PICK" size={14} />
              <Prompt pad={['BACK']} kb={['ESC']} mouse="right" label="BACK" size={14} />
            </>
          ) : (
            <>
              <Prompt pad={['DPAD', 'OK']} kb={['ENTER']} mouse="left" label={cursor !== NO_SAVE && at ? 'OPEN' : 'START'} size={14} />
              {cursor !== NO_SAVE && at && <Prompt pad={['X']} kb={['DEL']} mouse="left" label="DELETE" size={14} />}
              <button onClick={() => act('back')} className="contents"><Prompt pad={['BACK']} kb={['ESC']} mouse="right" label="BACK" size={14} /></button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileSelect;
