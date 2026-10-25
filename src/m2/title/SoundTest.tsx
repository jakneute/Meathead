import React, { useEffect, useRef, useState } from 'react';
import { Prompt } from '../../m1/components/ButtonIcons';
import { useCursorSound } from '../../m1/components/useCursorSound';
import { getActiveGamepad, isButtonPressed, getGamepadMovement, menuButtons } from '../../m1/game/platform/gamepad';
import { playMenuOk, playMenuBack } from '../../m1/game/platform/audio';
import { soundFolders, setSoundTest, soundTestCue } from '../music/soundTest';

// The sound test (music/soundTest.ts): the folders, then a folder's songs; pick one and it plays (over whatever the
// game's playing, till it's stopped or the screen's shut). On the title once a file's cleared the game (TitleScreen),
// and in the cheat panel. Up and down, confirm and back, on the keys, the mouse (right button: back) or a pad.

const PAD_REPEAT_MS = 160, ROWS = 11;

const SoundTest: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const folders = soundFolders();
  const [open, setOpen] = useState<number | null>(null);
  const [sel, setSel] = useState(0);
  const [, bump] = useState(0);
  const items = open === null ? folders.map(f => ({ label: f.name, n: f.tracks.length })) : folders[open].tracks.map(t => ({ label: t.label, n: 0 }));
  const playing = soundTestCue();
  useCursorSound(sel, true, open === null ? 'f' : `t${open}`);

  const act = (a: 'up' | 'down' | 'ok' | 'back') => {
    const n = items.length;
    if (a === 'up') setSel(i => (i + n - 1) % n);
    else if (a === 'down') setSel(i => (i + 1) % n);
    else if (a === 'ok') {
      playMenuOk();
      if (open === null) { setOpen(sel); setSel(0); }
      else { const t = folders[open].tracks[sel]; setSoundTest({ song: t.song, arr: t.arr }); bump(k => k + 1); }
    } else {
      playMenuBack();
      if (open !== null) { setSel(open); setOpen(null); }
      else { setSoundTest(null); onClose(); }
    }
  };
  const actRef = useRef(act); actRef.current = act;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const a = k === 'arrowup' || k === 'w' ? 'up' : k === 'arrowdown' || k === 's' ? 'down' : k === 'enter' || k === ' ' ? 'ok' : k === 'escape' || k === 'backspace' ? 'back' : null;
      if (!a) return;
      e.preventDefault(); e.stopPropagation();
      if (e.repeat && (a === 'ok' || a === 'back')) return;
      actRef.current(a);
    };
    const onContext = (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); actRef.current('back'); };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('contextmenu', onContext, true);
    let frame = 0, lastMove = 0, prev: { ok: boolean; back: boolean } | null = null;
    const poll = () => {
      const gp = getActiveGamepad();
      if (gp) {
        const m = menuButtons(gp), now = { ok: isButtonPressed(gp, m.ok), back: isButtonPressed(gp, m.back) }, was = prev ?? now;
        const move = getGamepadMovement(gp, 0.25), t = Date.now(), dir = move.up ? 'up' : move.down ? 'down' : null;
        if (!dir) lastMove = 0; else if (t - lastMove > PAD_REPEAT_MS) { lastMove = t; actRef.current(dir); }
        if (now.ok && !was.ok) actRef.current('ok');
        if (now.back && !was.back) actRef.current('back');
        prev = now;
      } else prev = null;
      frame = requestAnimationFrame(poll);
    };
    frame = requestAnimationFrame(poll);
    return () => { window.removeEventListener('keydown', onKey, true); window.removeEventListener('contextmenu', onContext, true); cancelAnimationFrame(frame); };
  }, []);

  // (a window of the list round the cursor)
  const first = Math.max(0, Math.min(items.length - ROWS, sel - Math.floor(ROWS / 2)));
  const shown = items.slice(first, first + ROWS);
  const nowLabel = playing ? folders.flatMap(f => f.tracks).find(t => t.song === playing.song && t.arr === playing.arr)?.label : null;
  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/85 select-none" style={{ fontFamily: '"Press Start 2P", monospace' }}>
      <div className="flex flex-col w-[560px] px-6 py-5" style={{ background: 'linear-gradient(180deg, #2A0A22, #0E0410)', border: '3px solid #d01c78', boxShadow: '0 0 0 3px #000, 0 0 30px rgba(208,28,120,0.35)' }}>
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-[#fde047] text-[13px] font-black tracking-widest [text-shadow:2px_2px_0_#be185d]">SOUND TEST</div>
          <div className="text-[#ffd8ee] text-[7px] tracking-wider">{open === null ? `${folders.length} FOLDERS` : folders[open].name}</div>
        </div>
        <div className="flex flex-col gap-[3px] min-h-[264px]">
          {first > 0 && <div className="text-center text-[#fcd850] text-[8px] leading-[8px]">&#9650;</div>}
          {shown.map((it, k) => {
            const i = first + k, on = i === sel;
            const isPlaying = open !== null && playing && folders[open].tracks[i].song === playing.song && folders[open].tracks[i].arr === playing.arr;
            return (
              <button key={`${open}-${i}`} onMouseEnter={() => setSel(i)} onClick={() => { setSel(i); actRef.current('ok'); }}
                className={`relative flex items-center justify-between px-4 py-[5px] text-left text-[9px] font-black tracking-wider border-2 border-black ${on ? 'bg-[#d01c78] text-[#fff6d8]' : 'bg-[#3a0828] text-white/75 hover:bg-[#5a0a3a]'}`}>
                <span className="truncate pr-3">{on && <span className="text-[#fcd850] mr-2">&#9654;</span>}{it.label}</span>
                <span className="shrink-0 text-[7px] opacity-80">{open === null ? `${it.n}` : isPlaying ? '♪ NOW' : ''}</span>
              </button>
            );
          })}
          {first + ROWS < items.length && <div className="text-center text-[#fcd850] text-[8px] leading-[8px]">&#9660;</div>}
        </div>
        <div className="mt-3 text-[7px] text-[#ffd8ee] tracking-wider truncate">NOW PLAYING: <span className="text-[#fde047]">{nowLabel ?? '-'}</span></div>
        <div className="mt-3 flex items-center justify-center gap-5">
          <Prompt pad={['DPAD_UP', 'DPAD_DOWN']} kb={['@up', '@down']} label="PICK" />
          <Prompt pad={['OK']} kb={['ENTER']} mouse="left" label={open === null ? 'OPEN' : 'PLAY'} />
          <Prompt pad={['BACK']} kb={['ESC']} mouse="right" label={open === null ? 'CLOSE' : 'BACK'} />
        </div>
      </div>
    </div>
  );
};

export default SoundTest;
