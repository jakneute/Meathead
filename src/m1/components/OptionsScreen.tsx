import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Prompt, BindingIcon } from './ButtonIcons';
import ControlsGuide from './ControlsGuide';
import { useCursorSound } from './useCursorSound';
import { getSettings, subscribeSettings, updateSettings, setFullscreen, DEFAULT_SETTINGS, type Settings } from '../game/settings';
import { KEY_ACTIONS, KEY_SLOTS, bindKey, clearKey, isReservedKey, isWheelCode, wheelFits, keyLabel, type KeyAction } from '../game/platform/keys';
import { getActiveGamepad, isButtonPressed, getGamepadMovement, GP_BUTTONS, menuButtons } from '../game/platform/gamepad';
import { playCursor, playMenuOk, playMenuBack } from '../game/platform/audio';
import { recordedVoices, playClip, voicesHeld, type ClipHandle } from '../game/platform/voiceclips';
import { pickLine } from '../game/platform/speech';

// OPTIONS, from the title screen or the pause menu: the sound (four volumes), the picture (fullscreen, how it's
// scaled up, the screen shake, the flashing), and the controls (what does what, and the keyboard and mouse's buttons
// changed about). Its own input while it's up (the game's is off): up and down to move, left and right to change a
// value, confirm and back (a controller's, wherever its menus have them), the mouse too. Back out of the top and it's
// gone, back to wherever it was opened from.

type Page = 'main' | 'audio' | 'video' | 'controls' | 'keyboard';
const TITLES: Record<Page, string> = { main: 'OPTIONS', audio: 'AUDIO', video: 'VIDEO', controls: 'CONTROLS', keyboard: 'KEYBOARD + MOUSE' };
const MAIN: { page: Page; label: string; note: string }[] = [
  { page: 'audio', label: 'AUDIO', note: 'VOLUMES: MASTER, MUSIC, SOUND EFFECTS, VOICES' },
  { page: 'video', label: 'VIDEO', note: 'FULLSCREEN, SCALING, SCREEN SHAKE, FLASHING' },
  { page: 'controls', label: 'CONTROLS', note: 'WHAT DOES WHAT, AND CHANGING THE KEYS' },
];
const VOLUMES: { id: 'master' | 'music' | 'sfx' | 'voice'; label: string }[] = [
  { id: 'master', label: 'MASTER' }, { id: 'music', label: 'MUSIC' }, { id: 'sfx', label: 'SOUND EFFECTS' }, { id: 'voice', label: 'VOICES' },
];
type VideoId = 'fullscreen' | 'scaling' | 'shake' | 'reduceFlashing';
const VIDEO: { id: VideoId; label: string; opts: { v: unknown; label: string }[]; note: string }[] = [
  { id: 'fullscreen', label: 'FULLSCREEN', opts: [{ v: false, label: 'OFF' }, { v: true, label: 'ON' }], note: 'THE WHOLE SCREEN, NOTHING ELSE ON IT.' },
  { id: 'scaling', label: 'SCALING', opts: [{ v: 'sharp', label: 'SHARP' }, { v: 'stretch', label: 'STRETCH' }], note: 'SHARP: WHOLE-PIXEL STEPS, A BORDER AROUND IT. STRETCH: AS BIG AS THE WINDOW GOES.' },
  { id: 'shake', label: 'SCREEN SHAKE', opts: [{ v: 'none', label: 'NONE' }, { v: 'mild', label: 'MILD' }, { v: 'heavy', label: 'HEAVY' }], note: 'HOW HARD THE SCREEN SHAKES WHEN SHIT BLOWS UP.' },
  { id: 'reduceFlashing', label: 'REDUCE FLASHING', opts: [{ v: false, label: 'OFF' }, { v: true, label: 'ON' }], note: 'FULL-SCREEN FLASHES KEPT DIM, NO STROBING.' },
];
/** The keyboard page's rows: the actions, then RESET TO DEFAULTS. */
const KB_ROWS = KEY_ACTIONS.length + 1;
const PAD_REPEAT_MS = 180;
const LEFT = '\u25C0', RIGHT = '\u25B6';

const rowCount = (page: Page) => (page === 'main' ? MAIN.length : page === 'audio' ? VOLUMES.length : page === 'video' ? VIDEO.length : page === 'controls' ? 1 : KB_ROWS);

type Act = 'up' | 'down' | 'left' | 'right' | 'ok' | 'back' | 'clear';

const OptionsScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const settings = useSyncExternalStore(subscribeSettings, getSettings, getSettings);
  const [page, setPage] = useState<Page>('main');
  const [cursor, setCursor] = useState(0);
  /** Keyboard page: which of the two columns (primary, secondary). */
  const [slot, setSlot] = useState(0);
  /** Keyboard page: waiting for a key (or a mouse button) to put in the highlighted slot. */
  const [capturing, setCapturing] = useState(false);
  /** Keyboard page: RESET TO DEFAULTS asked, and which answer's highlighted. */
  const [confirmReset, setConfirmReset] = useState<null | boolean>(null);
  /** What just happened on the keyboard page (a swap, a key that can't be used). */
  const [note, setNote] = useState<{ text: string; warn?: boolean } | null>(null);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tell = (text: string, warn?: boolean) => {
    setNote({ text, warn });
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(null), 3500);
  };
  useEffect(() => () => { if (noteTimer.current) clearTimeout(noteTimer.current); }, []);

  useCursorSound(cursor, !capturing && confirmReset === null, page);
  useCursorSound(slot, page === 'keyboard' && !capturing, `${page}${cursor}`);
  useCursorSound(confirmReset, confirmReset !== null, confirmReset === null);

  // (the voices' slider says something, at the new level: not while the game's paused, when every voice is held)
  const voiceClip = useRef<ClipHandle | null>(null);
  const previewVoice = () => {
    if (voicesHeld()) { playCursor(); return; }
    const v = recordedVoices(), who = v.meathead ? 'meathead' : Object.keys(v)[0], lines = who ? v[who] : undefined;
    if (!who || !lines?.length) { playCursor(); return; }
    voiceClip.current?.stop();
    voiceClip.current = playClip(who, pickLine(lines));
  };
  useEffect(() => () => voiceClip.current?.stop(), []);

  const go = (p: Page, at = 0) => { setPage(p); setCursor(at); setSlot(0); setCapturing(false); setConfirmReset(null); setNote(null); };

  const setVolume = (id: typeof VOLUMES[number]['id'], v: number) => {
    const next = Math.max(0, Math.min(100, Math.round(v / 10) * 10));
    if (next === settings[id]) return;
    updateSettings({ [id]: next } as Partial<Settings>);
    if (id === 'voice') previewVoice(); else playCursor();
  };
  const setVideo = (id: VideoId, v: unknown) => {
    if (settings[id] === v) return;
    if (id === 'fullscreen') setFullscreen(!!v);
    else updateSettings({ [id]: v } as Partial<Settings>);
    playCursor();
  };
  const stepVideo = (i: number, d: number) => {
    const row = VIDEO[i], at = row.opts.findIndex(o => o.v === settings[row.id]);
    // (two-way switches go round; the shake stops at the ends)
    const n = row.opts.length === 2 ? (at + 1) % 2 : Math.max(0, Math.min(row.opts.length - 1, at + d));
    setVideo(row.id, row.opts[n].v);
  };

  const bindTo = (code: string) => {
    const action = KEY_ACTIONS[cursor]?.id;
    if (!action) return;
    setCapturing(false);
    if (isWheelCode(code) && !wheelFits(action)) { tell('THE WHEEL ONLY CHANGES WEAPONS', true); playMenuBack(); return; }
    if (isReservedKey(code)) { tell(`${keyLabel(code)} CAN NOT BE USED: IT IS TAKEN`, true); playMenuBack(); return; }
    const { keys, from } = bindKey(settings.keys, action, slot, code);
    updateSettings({ keys });
    playMenuOk();
    if (from) {
      const fromLabel = KEY_ACTIONS.find(a => a.id === from)!.label;
      tell(keys[from].some(Boolean) ? `${keyLabel(code)} WAS ON ${fromLabel}: SWAPPED` : `${keyLabel(code)} WAS ON ${fromLabel}: ${fromLabel} HAS NOTHING NOW`, true);
    } else tell(`${KEY_ACTIONS[cursor].label}: ${keyLabel(code)}`);
  };
  const clearSlot = () => {
    const action = KEY_ACTIONS[cursor]?.id;
    if (!action || !settings.keys[action][slot]) return;
    updateSettings({ keys: clearKey(settings.keys, action, slot) });
    playMenuBack();
    tell(`${KEY_ACTIONS[cursor].label}: ${slot ? 'SECONDARY' : 'PRIMARY'} CLEARED`, !settings.keys[action][1 - slot]);
  };
  const resetKeys = () => { updateSettings({ keys: DEFAULT_SETTINGS.keys }); playMenuOk(); tell('BACK TO THE DEFAULTS'); };
  const startCapture = () => { playMenuOk(); setNote(null); setCapturing(true); };

  // --- the one place every input goes (keyboard, controller, and the mouse's back) ---
  const act = (a: Act) => {
    if (capturing) { if (a === 'back') { setCapturing(false); tell('CANCELED'); playMenuBack(); } return; }
    if (confirmReset !== null) {
      if (a === 'left' || a === 'right') setConfirmReset(a === 'left');
      else if (a === 'ok') { if (confirmReset) resetKeys(); else playMenuBack(); setConfirmReset(null); }
      else if (a === 'back') { setConfirmReset(null); playMenuBack(); }
      return;
    }
    const n = rowCount(page);
    if (a === 'up') { setCursor(c => (c + n - 1) % n); return; }
    if (a === 'down') { setCursor(c => (c + 1) % n); return; }
    if (a === 'back') {
      // (shutting it altogether: the menus' BACK comes from whatever opened it)
      if (page === 'main') { onClose(); return; }
      playMenuBack();
      if (page === 'keyboard') go('controls');
      else go('main', MAIN.findIndex(m => m.page === page));
      return;
    }
    if (page === 'main') { if (a === 'ok') { playMenuOk(); go(MAIN[cursor].page); } return; }
    // (OK on a setting doesn't change it: it's done, close and keep it all, as it is)
    if ((page === 'audio' || page === 'video') && a === 'ok') { playMenuOk(); onClose(); return; }
    if (page === 'audio') {
      const id = VOLUMES[cursor].id;
      if (a === 'left') setVolume(id, settings[id] - 10);
      else if (a === 'right') setVolume(id, settings[id] + 10);
      return;
    }
    if (page === 'video') {
      if (a === 'left' || a === 'right') stepVideo(cursor, a === 'left' ? -1 : 1);
      return;
    }
    if (page === 'controls') { if (a === 'ok') { playMenuOk(); go('keyboard'); } return; }
    // the keyboard page
    if (cursor === KEY_ACTIONS.length) { if (a === 'ok') { playMenuOk(); setConfirmReset(false); } return; }
    if (a === 'left' || a === 'right') setSlot(s => Math.max(0, Math.min(KEY_SLOTS - 1, s + (a === 'left' ? -1 : 1))));
    else if (a === 'ok') startCapture();
    else if (a === 'clear') clearSlot();
  };
  const actRef = useRef(act); actRef.current = act;
  const capRef = useRef(capturing); capRef.current = capturing;
  const bindRef = useRef(bindTo); bindRef.current = bindTo;
  /** The click that comes after a mouse button's been taken for a binding: swallowed, so it doesn't press anything. */
  const swallowClick = useRef(false);

  // Keyboard and mouse (the menus' own keys, whatever the game's are bound to)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (capRef.current) {
        e.preventDefault();
        if (e.repeat) return;
        const code = e.code.toLowerCase();
        if (code === 'escape') { actRef.current('back'); return; }
        bindRef.current(code);
        return;
      }
      const k = e.key.toLowerCase();
      const a: Act | null = k === 'arrowup' || k === 'w' ? 'up' : k === 'arrowdown' || k === 's' ? 'down' : k === 'arrowleft' || k === 'a' ? 'left' : k === 'arrowright' || k === 'd' ? 'right'
        : k === 'enter' || k === ' ' ? 'ok' : k === 'escape' || k === 'backspace' ? 'back' : k === 'delete' ? 'clear' : null;
      if (!a) return;
      // (a clicked button keeps focus: don't let the browser press it again on top of this)
      e.preventDefault();
      actRef.current(a);
    };
    const onMouseDown = (e: MouseEvent) => {
      if (capRef.current) { e.preventDefault(); swallowClick.current = true; bindRef.current(`mouse${e.button}`); return; }
      if (e.button === 2) actRef.current('back');
    };
    // (the wheel, while a slot's waiting: a notch up or down is what's bound)
    const onWheel = (e: WheelEvent) => { if (!capRef.current || Math.abs(e.deltaY) < 1) return; e.preventDefault(); bindRef.current(e.deltaY > 0 ? 'wheeldown' : 'wheelup'); };
    window.addEventListener('wheel', onWheel, { capture: true, passive: false });
    const onClick = (e: MouseEvent) => { if (swallowClick.current) { swallowClick.current = false; e.preventDefault(); e.stopPropagation(); } };
    // (the side buttons are buttons here, not the browser's back and forward)
    const onMouseUp = (e: MouseEvent) => { if (e.button === 3 || e.button === 4) e.preventDefault(); };
    const noMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('mousedown', onMouseDown, true);
    window.addEventListener('mouseup', onMouseUp, true);
    window.addEventListener('click', onClick, true);
    window.addEventListener('contextmenu', noMenu);
    return () => {
      window.removeEventListener('wheel', onWheel, true);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('mousedown', onMouseDown, true);
      window.removeEventListener('mouseup', onMouseUp, true);
      window.removeEventListener('click', onClick, true);
      window.removeEventListener('contextmenu', noMenu);
    };
  }, []);

  // The controller: the stick or the D-pad to move and change, its menu confirm and back (Start backs out too), X to
  // clear a key
  useEffect(() => {
    let frame = 0, lastMove = 0;
    let prev: { ok: boolean; back: boolean; clear: boolean; start: boolean } | null = null;
    const poll = () => {
      const gp = getActiveGamepad();
      if (gp) {
        const m = menuButtons(gp);
        const now = { ok: isButtonPressed(gp, m.ok), back: isButtonPressed(gp, m.back), clear: isButtonPressed(gp, GP_BUTTONS.X), start: isButtonPressed(gp, GP_BUTTONS.START) };
        // (whatever was already held as it opened isn't a press)
        const was = prev ?? now;
        const just = (k: keyof typeof now) => now[k] && !was[k];
        const move = getGamepadMovement(gp, 0.25), t = Date.now();
        const dir: Act | null = move.up ? 'up' : move.down ? 'down' : move.left ? 'left' : move.right ? 'right' : null;
        if (!dir) lastMove = 0;
        else if (!capRef.current && t - lastMove > PAD_REPEAT_MS) { lastMove = t; actRef.current(dir); }
        if (just('ok')) actRef.current('ok');
        if (just('back') || just('start')) actRef.current('back');
        if (just('clear')) actRef.current('clear');
        prev = now;
      } else prev = null;
      frame = requestAnimationFrame(poll);
    };
    frame = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frame);
  }, []);

  // --- drawing it ---
  const idle = !capturing && confirmReset === null;
  const rowClass = (on: boolean) => `relative w-full flex items-center gap-3 pl-7 pr-3 py-[6px] text-left transition-colors ${on ? 'bg-[#3a2c06]' : 'bg-black/40 hover:bg-black/60'}`;
  const rowStyle = (on: boolean): React.CSSProperties => ({ outline: on ? '2px solid #FACC15' : '1px solid #3F3F46', boxShadow: on ? '0 0 10px rgba(250,204,21,0.45), 3px 3px 0 #000' : '2px 2px 0 #000' });
  const marker = (on: boolean) => (on ? <span className="absolute left-2 text-yellow-300 animate-pulse">&#9654;</span> : null);
  const hover = (i: number) => () => { if (idle) setCursor(i); };

  const volumeRow = (v: typeof VOLUMES[number], i: number) => {
    const on = cursor === i, val = settings[v.id];
    return (
      <div key={v.id} className={rowClass(on)} style={rowStyle(on)} onMouseEnter={hover(i)}>
        {marker(on)}
        <span className="w-[150px] text-[9px] font-black tracking-wider text-yellow-300">{v.label}</span>
        <button onClick={() => { setCursor(i); setVolume(v.id, val - 10); }} className="px-1 text-[10px] text-zinc-300 hover:text-white">&#9664;</button>
        <div className="flex gap-[3px]">
          {Array.from({ length: 10 }, (_, k) => {
            const lit = (k + 1) * 10 <= val;
            return (
              <button key={k} onClick={() => { setCursor(i); setVolume(v.id, (k + 1) * 10 === val ? k * 10 : (k + 1) * 10); }}
                className="w-[16px] h-[14px] border border-black"
                style={{ background: lit ? (on ? '#FACC15' : '#CA8A04') : '#27272A', boxShadow: lit ? 'inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,0,0,0.35)' : 'inset 0 2px 0 rgba(0,0,0,0.5)' }} />
            );
          })}
        </div>
        <button onClick={() => { setCursor(i); setVolume(v.id, val + 10); }} className="px-1 text-[10px] text-zinc-300 hover:text-white">&#9654;</button>
        <span className="ml-auto w-[34px] text-right text-[9px] font-black text-white">{val}</span>
      </div>
    );
  };

  const videoRow = (v: typeof VIDEO[number], i: number) => {
    const on = cursor === i;
    return (
      <div key={v.id} className={rowClass(on)} style={rowStyle(on)} onMouseEnter={hover(i)}>
        {marker(on)}
        <span className="w-[170px] text-[9px] font-black tracking-wider text-yellow-300">{v.label}</span>
        <div className="flex gap-2 ml-auto">
          {v.opts.map(o => {
            const sel = settings[v.id] === o.v;
            return (
              <button key={o.label} onClick={() => { setCursor(i); setVideo(v.id, o.v); }}
                className={`px-2 py-[3px] text-[8px] font-black tracking-wider border-2 ${sel ? 'bg-yellow-400 text-black border-black' : 'bg-zinc-900 text-zinc-500 border-zinc-700 hover:text-zinc-200'}`}
                style={{ boxShadow: sel ? '2px 2px 0 #000' : undefined }}>{o.label}</button>
            );
          })}
        </div>
      </div>
    );
  };

  const keyRow = (a: typeof KEY_ACTIONS[number], i: number) => {
    const on = cursor === i, codes = settings.keys[a.id as KeyAction], none = !codes.some(Boolean);
    return (
      <div key={a.id} className={`${rowClass(on)} !py-[2px]`} style={rowStyle(on)} onMouseEnter={hover(i)}>
        {marker(on)}
        <span className={`text-[8px] font-black tracking-wider ${none && a.required ? 'text-red-500' : 'text-yellow-300'}`}>{a.label}</span>
        {none && <span className="text-[6px] font-black text-red-500">NOTHING BOUND</span>}
        <div className="flex gap-2 ml-auto">
          {Array.from({ length: KEY_SLOTS }, (_, s) => {
            const sel = on && slot === s, code = codes[s];
            return (
              <button key={s} onClick={() => { if (!idle) return; setCursor(i); setSlot(s); startCapture(); }}
                onMouseEnter={() => { if (idle) { setCursor(i); setSlot(s); } }}
                className={`w-[118px] h-[22px] flex items-center justify-center border-2 text-[7px] font-black ${sel ? (capturing ? 'border-red-500 bg-red-950 animate-pulse' : 'border-yellow-400 bg-zinc-800') : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500'}`}>
                {sel && capturing ? <span className="text-red-300">PRESS A KEY...</span> : code ? <BindingIcon code={code} name={keyLabel(code)} size={16} /> : <span className="text-zinc-600">--</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/85 select-none animate-in fade-in duration-150" style={{ fontFamily: '"Press Start 2P", monospace' }}>
      <div className="relative flex flex-col items-stretch w-[680px] max-h-[584px] px-6 pt-4 pb-3"
        style={{
          background: 'linear-gradient(180deg, rgba(24,24,27,0.98) 0%, rgba(9,9,11,0.98) 100%)',
          border: '3px solid #FACC15',
          boxShadow: '0 0 0 3px #000, 0 0 40px rgba(0,0,0,0.9), inset 0 0 30px rgba(250,204,21,0.06)',
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 3px)',
        }}>
        <div className="absolute left-0 right-0 top-0 h-[6px]" style={{ background: 'repeating-linear-gradient(135deg, #FACC15 0 8px, #111 8px 16px)' }} />
        <div className={`flex items-baseline justify-center gap-3 mt-1 ${page === 'keyboard' ? 'mb-1' : 'mb-3'}`}>
          {page !== 'main' && <span className="text-[9px] font-black tracking-widest text-zinc-500">OPTIONS &#9656;</span>}
          <h2 className={`${page === 'keyboard' ? 'text-lg' : 'text-2xl'} font-black italic tracking-widest text-yellow-400`} style={{ textShadow: '3px 3px 0 #7F1D1D, 5px 5px 0 #000' }}>{TITLES[page]}</h2>
        </div>

        {page === 'main' && (
          <div className="flex flex-col gap-3 px-16 py-4">
            {MAIN.map((m, i) => {
              const on = cursor === i;
              return (
                <button key={m.page} onMouseEnter={hover(i)} onClick={() => { playMenuOk(); go(m.page); }} className={`${rowClass(on)} !py-[10px] flex-col !items-start !gap-1`} style={rowStyle(on)}>
                  {marker(on)}
                  <span className="text-[13px] font-black italic tracking-widest text-white" style={{ textShadow: '2px 2px 0 #7F1D1D' }}>{m.label}</span>
                  <span className="text-[7px] font-black tracking-wider text-zinc-400">{m.note}</span>
                </button>
              );
            })}
          </div>
        )}

        {page === 'audio' && <div className="flex flex-col gap-3 px-6 py-4">{VOLUMES.map(volumeRow)}</div>}

        {page === 'video' && (
          <div className="flex flex-col gap-3 px-6 py-4">
            {VIDEO.map(videoRow)}
            <div className="mt-2 min-h-[28px] text-center text-[7px] leading-[12px] font-black tracking-wider text-cyan-300/90">{VIDEO[cursor]?.note}</div>
          </div>
        )}

        {page === 'controls' && (
          <div className="flex flex-col gap-3 px-2 py-1">
            <ControlsGuide />
            <button onMouseEnter={hover(0)} onClick={() => { playMenuOk(); go('keyboard'); }} className={rowClass(cursor === 0)} style={rowStyle(cursor === 0)}>
              {marker(cursor === 0)}
              <span className="text-[9px] font-black tracking-wider text-yellow-300">CHANGE KEYBOARD + MOUSE BUTTONS</span>
              <span className="ml-auto text-[9px] text-zinc-400">&#9654;</span>
            </button>
            <div className="text-center text-[6px] font-black tracking-wider text-zinc-500">CONTROLLER BUTTONS STAY WHERE THEY ARE. THE MENUS' KEYS NEVER CHANGE.</div>
          </div>
        )}

        {page === 'keyboard' && (
          <div className="relative flex flex-col gap-[4px] px-1">
            <div className="flex pr-3 text-[6px] font-black tracking-widest text-zinc-500">
              <span className="ml-auto w-[118px] text-center">PRIMARY</span><span className="ml-2 w-[118px] text-center">SECONDARY</span>
            </div>
            {KEY_ACTIONS.map(keyRow)}
            {(() => {
              const i = KEY_ACTIONS.length, on = cursor === i;
              return (
                <button onMouseEnter={hover(i)} onClick={() => { if (!idle) return; setCursor(i); playMenuOk(); setConfirmReset(false); }} className={`${rowClass(on)} mt-1 !py-[4px]`} style={rowStyle(on)}>
                  {marker(on)}
                  <span className="text-[8px] font-black tracking-wider text-red-400">RESET TO DEFAULTS</span>
                </button>
              );
            })()}
            <div className={`h-[14px] flex items-center justify-center text-center text-[7px] font-black tracking-wider ${note?.warn ? 'text-red-400' : 'text-cyan-300'}`}>
              {capturing ? <span className="inline-flex items-center gap-2 text-red-300">PRESS A KEY OR A MOUSE BUTTON FOR {KEY_ACTIONS[cursor]?.label}<Prompt pad={['BACK']} kb={['ESC']} label="CANCEL" size={11} /></span> : note?.text}
            </div>

            {confirmReset !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 animate-in fade-in duration-150">
                <div className="flex flex-col items-center px-8 py-5" style={{ background: 'linear-gradient(180deg, #27272A, #09090B)', border: '3px solid #EF4444', boxShadow: '0 0 0 3px #000, 0 0 30px rgba(239,68,68,0.35)' }}>
                  <div className="text-yellow-400 text-[15px] font-black italic tracking-widest mb-2" style={{ textShadow: '2px 2px 0 #7F1D1D' }}>ARE YOU SURE?</div>
                  <div className="text-zinc-300 text-[8px] font-black uppercase tracking-wider mb-4">EVERY KEY AND MOUSE BUTTON BACK THE WAY IT CAME</div>
                  <div className="flex gap-4">
                    {([['YES', true, 'linear-gradient(180deg, #B91C1C, #7F1D1D)', '#450A0A'], ['NO', false, 'linear-gradient(180deg, #52525B, #3F3F46)', '#18181B']] as const).map(([label, yes, face, edge]) => {
                      const on = confirmReset === yes;
                      return (
                        <button key={label} onMouseEnter={() => setConfirmReset(yes)} onClick={() => { if (yes) resetKeys(); else playMenuBack(); setConfirmReset(null); }}
                          className={`relative pl-8 pr-5 py-[7px] text-white text-[11px] font-black tracking-wider transition-all ${on ? 'translate-y-[-1px]' : 'opacity-80 hover:opacity-100'}`}
                          style={{ background: face, borderBottom: `4px solid ${edge}`, boxShadow: on ? '0 0 12px rgba(250,204,21,0.6), 3px 3px 0 #000' : '3px 3px 0 #000', outline: on ? '2px solid #FACC15' : 'none' }}>
                          {on && <span className="absolute left-2 text-yellow-300 animate-pulse">&#9654;</span>}{label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* What the buttons do here (the menus' own: they never change) */}
        <div className={`${page === 'keyboard' ? 'mt-1' : 'mt-3'} flex items-center justify-center gap-5 text-[6px] text-zinc-400 tracking-wider`}>
          {page === 'main' && <Prompt pad={['DPAD', 'OK']} kb={['ENTER']} mouse="left" label="OPEN" size={14} />}
          {page === 'audio' && <Prompt pad={['DPAD']} kb={[LEFT, RIGHT]} mouse="left" label="VOLUME" size={14} />}
          {page === 'video' && <Prompt pad={['DPAD', 'OK']} kb={[LEFT, RIGHT]} mouse="left" label="CHANGE" size={14} />}
          {page === 'keyboard' && !capturing && <>
            <Prompt pad={['OK']} kb={['ENTER']} mouse="left" label="CHANGE" size={14} />
            <Prompt pad={['X']} kb={['DEL']} label="CLEAR" size={14} />
          </>}
          {!capturing && (
            <button onClick={() => act('back')} className="contents"><Prompt pad={['BACK']} kb={['ESC']} mouse="right" label={page === 'main' ? 'DONE' : 'BACK'} size={14} /></button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptionsScreen;