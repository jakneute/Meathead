import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import TitleArt from './TitleArt';
import FileSelect from './FileSelect';
import { Prompt } from '../../m1/components/ButtonIcons';
import OptionsScreen from '../../m1/components/OptionsScreen';
import { useCursorSound, useOpenCloseSound } from '../../m1/components/useCursorSound';
import { getActiveGamepad, isButtonPressed, getGamepadMovement, GP_BUTTONS, menuButtons } from '../../m1/game/platform/gamepad';
import { getAudioContext, audioRunning, playMenuOk } from '../../m1/game/platform/audio';
import { isDesktop, quitToDesktop } from '../../m1/game/platform/desktop';
import { anyFile, latestSlot, closeFile, subscribeFiles, filesVersion, type Slot } from '../save';
import { M2_GUIDE_PAGES } from '../ControlsGuide';
import { PLAIN_PAUSE } from '../hudThemes';
import { M2_PUBLIC } from '../build';

// Meathead 2's title screen, as Meathead 1's is (src/m1/components/Overlay.tsx TitleScreen, App.tsx pickTitle): the
// picture the whole screen (title/art.ts), the menu under the logo: CONTINUE (the file played last, while there's one),
// START GAME (the file select: a file, or NO SAVE), OPTIONS (Meathead 2's options), and in the desktop app QUIT GAME
// (asked first). Up only once the picture's intro has played (or been skipped: a press skips it, and isn't one for
// the menu). Up and down, confirm (or Start) and back, on the keys, the mouse or a pad (its menus'
// confirm and back: swapped on a Nintendo pad). The cheats build saves nothing (as Meathead 1's doesn't): no CONTINUE, no
// file select; START GAME is NO SAVE.

type Kind = 'continue' | 'new' | 'hub' | 'ending' | 'options' | 'quit';
interface TitleOption { label: string; kind: Kind }
const titleOptions = (hasFile: boolean): TitleOption[] => [
  ...(hasFile ? [{ label: 'CONTINUE', kind: 'continue' as const }] : []),
  { label: 'START GAME', kind: 'new' },
  // (the cheats build only: straight onto the hub)
  ...(!M2_PUBLIC ? [{ label: 'SKIP TO HUB', kind: 'hub' as const }, { label: 'ALPHA ENDING', kind: 'ending' as const }] : []),
  { label: 'OPTIONS', kind: 'options' },
  ...(isDesktop ? [{ label: 'QUIT GAME', kind: 'quit' as const }] : []),
];
const PAD_REPEAT_MS = 180;

const TitleScreen: React.FC<{
  /** A new game: on a file (anything on it erased), or NO SAVE (null). */
  onNew: (slot: Slot | null) => void;
  /** Carrying on with a file. */
  onContinue: (slot: Slot) => void;
  /** (the cheats build) Straight onto the hub, NO SAVE. */
  onHub?: () => void;
  /** (the cheats build) The alpha's ending on its own (alphaEnd.ts). */
  onEnding?: () => void;
}> = ({ onNew, onContinue, onHub, onEnding }) => {
  const filesV = useSyncExternalStore(subscribeFiles, filesVersion, filesVersion);
  const options = React.useMemo(() => titleOptions(!!M2_PUBLIC && anyFile()), [filesV]);
  const [sel, setSel] = useState(0);
  const [locked, setLocked] = useState(true);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [fileSelect, setFileSelect] = useState(false);
  /** QUIT GAME's are you sure (0 YES, 1 NO: NO highlighted first), or null. */
  const [quitAsk, setQuitAsk] = useState<0 | 1 | null>(null);
  /** The options screen just shut: the press that shut it isn't one for the title too. */
  const shutAt = useRef(0);
  // The intro (TitleArt: the park dropping in, him, the logo stamped on, on the theme's opening): the menu comes up
  // when it's done; any key, click or button skips it straight to the finished picture, the menu ready (that press
  // isn't one for the menu too). It plays once as the title comes up (the options and the file select are over it:
  // shutting them, the picture's still there as it was)
  const [intro, setIntro] = useState(true);
  const introRef = useRef(true);
  const endIntro = () => { if (!introRef.current) return; introRef.current = false; setIntro(false); setLocked(false); };
  // Before it: a browser holds the sound back till the first key or click, so with it held there's PRESS ANY BUTTON
  // over the empty dusk first; that press lets the sound out and starts the intro (in time with the theme from its
  // top), it doesn't skip it. With the sound already allowed (the desktop app), straight into the intro. (null: still
  // finding out, the first moment)
  const [gate, setGate] = useState<boolean | null>(null);
  const gateRef = useRef<boolean | null>(null);
  const openGate = () => { gateRef.current = false; setGate(false); };
  useEffect(() => {
    getAudioContext();
    const id = setTimeout(() => { if (gateRef.current === null) { gateRef.current = !audioRunning(); setGate(gateRef.current); } }, 300);
    return () => clearTimeout(id);
  }, []);
  // (CONTINUE come or gone under the cursor: it stays on the same option)
  const optionsWere = useRef(options);
  useEffect(() => {
    const was = optionsWere.current[sel]?.label;
    optionsWere.current = options;
    const i = options.findIndex(o => o.label === was);
    setSel(i >= 0 ? i : 0);
  }, [options]);

  useCursorSound(sel, !optionsOpen && !fileSelect && quitAsk === null);
  useCursorSound(quitAsk, quitAsk !== null);
  useOpenCloseSound(optionsOpen);
  useOpenCloseSound(quitAsk !== null);

  const closeOptions = () => { shutAt.current = performance.now(); setOptionsOpen(false); };
  const busy = () => optionsOpen || fileSelect || performance.now() - shutAt.current < 150;

  const pick = (i: number) => {
    const o = options[i];
    if (!o || busy() || quitAsk !== null) return;
    // (OPTIONS and QUIT: no waiting for the way in to unlock)
    if (o.kind === 'options') { setOptionsOpen(true); return; }
    if (o.kind === 'quit') { setQuitAsk(1); return; }
    if (locked) return;
    if (o.kind === 'continue') { const slot = latestSlot(); if (slot) { playMenuOk(); onContinue(slot); } return; }
    if (o.kind === 'hub') { if (onHub) { playMenuOk(); onHub(); } return; }
    if (o.kind === 'ending') { if (onEnding) { playMenuOk(); onEnding(); } return; }
    // (the cheats build: straight in, NO SAVE)
    if (!M2_PUBLIC) { playMenuOk(); onNew(null); return; }
    playMenuOk();
    setFileSelect(true);
  };
  const answerQuit = (yes: boolean) => {
    setQuitAsk(null);
    if (yes) { playMenuOk(); closeFile(); quitToDesktop(); }
  };
  const act = (a: 'up' | 'down' | 'left' | 'right' | 'ok' | 'back') => {
    if (busy()) return;
    if (quitAsk !== null) {
      if (a === 'left') setQuitAsk(0); else if (a === 'right') setQuitAsk(1);
      else if (a === 'ok') answerQuit(quitAsk === 0);
      else if (a === 'back') setQuitAsk(null);
      return;
    }
    const n = options.length;
    if (a === 'up') setSel(i => (i + n - 1) % n);
    else if (a === 'down') setSel(i => (i + 1) % n);
    else if (a === 'ok') pick(sel);
  };
  const actRef = useRef(act); actRef.current = act;

  // Keys and the mouse's right button (the menus' own keys)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // (the first key lets the sound out: the browser holds it back till then)
      getAudioContext();
      const k = e.key.toLowerCase();
      if (gateRef.current !== false) {
        if (!e.repeat && k !== 'shift' && k !== 'control' && k !== 'alt' && k !== 'meta') { e.preventDefault(); openGate(); }
        return;
      }
      if (introRef.current) {
        if (!e.repeat && k !== 'shift' && k !== 'control' && k !== 'alt' && k !== 'meta') { e.preventDefault(); endIntro(); }
        return;
      }
      const a =k === 'arrowup' || k === 'w' ? 'up' : k === 'arrowdown' || k === 's' ? 'down' : k === 'arrowleft' || k === 'a' ? 'left' : k === 'arrowright' || k === 'd' ? 'right'
        : k === 'enter' || k === ' ' ? 'ok' : k === 'escape' || k === 'backspace' ? 'back' : null;
      if (!a || busy()) return;
      e.preventDefault();
      if (e.repeat && (a === 'ok' || a === 'back')) return;
      actRef.current(a);
    };
    const onMouseDown = (e: MouseEvent) => { getAudioContext(); if (gateRef.current !== false) { openGate(); return; } if (introRef.current) { endIntro(); return; } if (e.button === 2 && !busy()) actRef.current('back'); };
    const noMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('contextmenu', noMenu);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onMouseDown); window.removeEventListener('contextmenu', noMenu); };
  }, []);

  // The pad: the stick or the D-pad, its menus' confirm (or Start) and back
  useEffect(() => {
    let frame = 0, lastMove = 0;
    let prev: { ok: boolean; back: boolean; start: boolean } | null = null;
    let prevAny: boolean | null = null;
    const poll = () => {
      const gp = getActiveGamepad();
      if (gp) {
        const m = menuButtons(gp);
        const now = { ok: isButtonPressed(gp, m.ok), back: isButtonPressed(gp, m.back), start: isButtonPressed(gp, GP_BUTTONS.START) };
        // (whatever was held as a screen over it shut, or as it came up, isn't a press)
        const was = prev ?? now;
        const just = (k: keyof typeof now) => now[k] && !was[k];
        // (the intro: any button skips it)
        const any = gp.buttons.some(b => b.pressed);
        // (the gate: a button lets it go (a pad's press may not let a browser's sound out: the intro then keeps its own time))
        // (a browser only shows a pad once a button's pressed on it: that first press counts)
        if (gateRef.current !== false) { if (any && prevAny !== true) { getAudioContext(); openGate(); } }
        else if (introRef.current) { if (any && prevAny !== true) endIntro(); }
        else if (!busy()) {
          const move = getGamepadMovement(gp, 0.25), t = Date.now();
          const dir = move.up ? 'up' : move.down ? 'down' : move.left ? 'left' : move.right ? 'right' : null;
          if (!dir) lastMove = 0;
          else if (t - lastMove > PAD_REPEAT_MS) { lastMove = t; actRef.current(dir); }
          if (just('ok') || just('start')) actRef.current('ok');
          if (just('back')) actRef.current('back');
        }
        prev = now; prevAny = any;
      } else { prev = null; prevAny = null; }
      frame = requestAnimationFrame(poll);
    };
    frame = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frame);
  }, []);

  const current = options[sel];
  return (
    <div className="absolute inset-0 z-[60] bg-black select-none" style={{ fontFamily: '"Press Start 2P", monospace' }}>
      {/* (the picture, the whole screen: the logo's in it, over his chest) */}
      <TitleArt skip={!intro} held={gate !== false} onDone={endIntro} />
      {/* PRESS ANY BUTTON (the sound held back till then), where the gate's marquee will come down */}
      {gate === true && (
        <div className="absolute inset-x-0 top-[236px] flex flex-col items-center gap-4 animate-in fade-in duration-500 pointer-events-none">
          <div className="text-[#fde047] text-[18px] tracking-[0.2em] [text-shadow:2px_2px_0_#be185d,4px_4px_0_#12041a] animate-pulse">PRESS ANY BUTTON</div>
          <Prompt pad={['OK']} kb={['ENTER']} mouse="left" size={22} className="text-[9px] text-[#ffd8ee] tracking-wider [text-shadow:1px_1px_0_#000]" />
        </div>
      )}
      <h1 className="sr-only">MEATHEAD 2: MEATHEAD GOES TO HAPPY LAND</h1>
      {/* (the menu in the lot under the plate and its ribbon, once the intro's done) */}
      {!intro && <div className="animate-in fade-in duration-700 absolute inset-x-0 top-[330px] bottom-0 flex flex-col items-center justify-center pb-2">
        <div className="flex flex-col items-center gap-3 shrink-0">
          {options.map((o, i) => {
            const on = sel === i;
            const lockedOut = locked && o.kind !== 'options' && o.kind !== 'quit';
            return (
              <button key={o.label} disabled={lockedOut} onClick={() => pick(i)} onMouseEnter={() => { if (quitAsk === null && !busy()) setSel(i); }}
                className={`relative w-[420px] px-10 ${options.length > 3 ? 'py-2' : 'py-3'} text-base md:text-lg whitespace-nowrap border-2 border-black font-black uppercase shrink-0 [text-shadow:2px_2px_0_#000] ${lockedOut
                  ? 'bg-zinc-700 text-zinc-400 shadow-[inset_0_2px_0_#71717a,inset_0_-4px_0_#27272a,4px_4px_0_#000] opacity-60 cursor-not-allowed'
                  : on ? 'bg-[#d01c78] text-[#fff6d8] shadow-[inset_0_2px_0_#ff84c4,inset_0_-4px_0_#6a0838,0_0_0_2px_#fcd850,0_0_0_4px_#000,6px_6px_0_4px_#000] active:translate-y-1 active:shadow-[inset_0_2px_0_#ff84c4,inset_0_-2px_0_#6a0838,0_0_0_2px_#fcd850,0_0_0_4px_#000]'
                  : 'bg-[#5a0a3a] text-white/70 shadow-[inset_0_2px_0_#9c1a62,inset_0_-4px_0_#2c0420,4px_4px_0_#000] hover:bg-[#8c145a]'}`}>
                {on && !lockedOut && <span className="absolute left-3 text-[#fcd850] animate-pulse">&#9654;</span>}
                {on && !lockedOut && <span className="absolute right-3 text-[#fcd850] animate-pulse">&#9664;</span>}
                {locked && i === 0 ? 'WAITING IN LINE...' : o.label}
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex items-center gap-3 shrink-0">
          {!locked && <Prompt pad={['OK']} kb={['ENTER']} mouse="left" label={current?.kind === 'new' ? 'START' : current?.kind === 'continue' ? 'CONTINUE' : current?.kind === 'quit' ? 'QUIT' : 'OPEN'} size={18} className="text-[8px] font-black text-white/85 tracking-wider [text-shadow:1px_1px_0_#000] animate-pulse" />}
        </div>
      </div>}
      {/* QUIT GAME (the desktop app's): are you sure? */}
      {quitAsk !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 animate-in fade-in duration-150">
          <div className="flex flex-col items-center px-8 py-5" style={{ background: 'linear-gradient(180deg, #27272A, #09090B)', border: '3px solid #EF4444', boxShadow: '0 0 0 3px #000, 0 0 30px rgba(239,68,68,0.35)' }}>
            <div className="text-white text-[11px] font-black tracking-widest mb-2" style={{ textShadow: '2px 2px 0 #000' }}>QUIT GAME?</div>
            <div className="text-yellow-400 text-[15px] font-black italic tracking-widest mb-2" style={{ textShadow: '2px 2px 0 #7F1D1D' }}>ARE YOU SURE?</div>
            <div className="flex gap-4 mt-2">
              {([['YES', 'linear-gradient(180deg, #B91C1C, #7F1D1D)', '#450A0A'], ['NO', 'linear-gradient(180deg, #52525B, #3F3F46)', '#18181B']] as const).map(([label, face, edge], i) => {
                const on = quitAsk === i;
                return (
                  <button key={label} onMouseEnter={() => setQuitAsk(i as 0 | 1)} onClick={() => answerQuit(i === 0)}
                    className={`relative pl-8 pr-5 py-[7px] text-white text-[11px] font-black tracking-wider whitespace-nowrap transition-all ${on ? 'translate-y-[-1px]' : 'opacity-80 hover:opacity-100'}`}
                    style={{ background: face, borderBottom: `4px solid ${edge}`, boxShadow: on ? '0 0 12px rgba(250,204,21,0.6), 3px 3px 0 #000' : '3px 3px 0 #000', outline: on ? '2px solid #FACC15' : 'none' }}>
                    {on && <span className="absolute left-2 text-yellow-300 animate-pulse">&#9654;</span>}{label}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-4 text-[6px] text-zinc-400 tracking-wider">
              <Prompt pad={['OK']} kb={['ENTER']} mouse="left" label="SELECT" size={15} />
              <button onClick={() => setQuitAsk(null)} className="contents"><Prompt pad={['BACK']} kb={['ESC']} mouse="right" label="NO" size={15} /></button>
            </div>
          </div>
        </div>
      )}
      {optionsOpen && (
        <OptionsScreen onClose={closeOptions} guidePages={M2_GUIDE_PAGES}
          look={{ border: PLAIN_PAUSE.frame.border, boxShadow: PLAIN_PAUSE.frame.boxShadow, stripe: PLAIN_PAUSE.stripe }} />
      )}
      {fileSelect && (
        <FileSelect onClose={() => setFileSelect(false)}
          onPick={(slot, how) => { playMenuOk(); if (how === 'continue' && slot !== null) onContinue(slot); else onNew(slot); }} />
      )}
    </div>
  );
};

export default TitleScreen;
