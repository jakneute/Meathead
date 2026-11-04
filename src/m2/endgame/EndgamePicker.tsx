// The endgame test picker (the owner's: "when levels happen, exiting through america usa will bring up a large
// checkpoint list that will let me skip to certain levels or checkpoints in the levels. only with the checkpoints skip
// cheat on. you can press left/right to change which stage to test. up/down will have the specific checkpoint"). The
// cheats build only (the checkpoint skip's a cheat). Every stage in endgame/stages.ts, every checkpoint of each.

import React, { useEffect, useRef, useState } from 'react';
import { useCursorSound } from '../../m1/components/useCursorSound';
import { getActiveGamepad, getGamepadMovement, isButtonPressed, menuButtons } from '../../m1/game/platform/gamepad';
import { Prompt } from '../../m1/components/ButtonIcons';
import { ENDGAME_STAGES } from './stages';

const EndgamePicker: React.FC<{ onPick: (stage: string, cp: number) => void; onCancel: () => void }> = ({ onPick, onCancel }) => {
  const [s, setS] = useState(0), [c, setC] = useState(0);
  useCursorSound(s * 100 + c);
  const ref = useRef({ s, c, onPick, onCancel });
  ref.current = { s, c, onPick, onCancel };
  useEffect(() => {
    const N = ENDGAME_STAGES.length;
    const stage = (d: number) => { setS(v => (v + d + N) % N); setC(0); };
    const cp = (d: number) => { const n = ENDGAME_STAGES[ref.current.s].checkpoints.length; setC(v => (v + d + n) % n); };
    const go = () => { const r = ref.current, st = ENDGAME_STAGES[r.s]; r.onPick(st.id, st.checkpoints[r.c].cp); };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      e.stopPropagation();
      if (k === 'arrowleft' || k === 'a') stage(-1);
      else if (k === 'arrowright' || k === 'd') stage(1);
      else if (k === 'arrowdown' || k === 's') cp(1);
      else if (k === 'arrowup' || k === 'w') cp(-1);
      else if (k === 'enter' || k === ' ') { e.preventDefault(); go(); }
      else if (k === 'escape' || k === 'backspace') ref.current.onCancel();
    };
    window.addEventListener('keydown', onKey, true);
    let raf = 0, last = 0, prev = { a: true, b: true };
    const poll = () => {
      const gp = getActiveGamepad();
      if (gp) {
        const now = Date.now(), m = getGamepadMovement(gp, 0.3);
        if ((m.up || m.down || m.left || m.right) && now - last > 170) { last = now; if (m.left || m.right) stage(m.right ? 1 : -1); else cp(m.down ? 1 : -1); }
        const mb = menuButtons(gp), a = isButtonPressed(gp, mb.ok), b = isButtonPressed(gp, mb.back);
        if (a && !prev.a) go();
        if (b && !prev.b) ref.current.onCancel();
        prev = { a, b };
      }
      raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);
    return () => { window.removeEventListener('keydown', onKey, true); cancelAnimationFrame(raf); };
  }, []);
  const st = ENDGAME_STAGES[s];
  return (
    <div className="absolute inset-0 z-[78] flex items-center justify-center bg-black/80 select-none" style={{ fontFamily: '"Press Start 2P", monospace' }}>
      <div className="w-[420px] max-h-[92%] flex flex-col p-3 border-4 border-red-600 bg-zinc-950 shadow-[4px_4px_0_#000]">
        <div className="text-[8px] text-red-500 tracking-widest">ENDGAME TEST</div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-yellow-300">
          <span>◀</span><span>{st.name}</span><span>▶</span>
        </div>
        <div className="mt-1 text-center text-[7px] text-zinc-400">{`STAGE ${s + 1} OF ${ENDGAME_STAGES.length} · HOUR ${st.hour}`}</div>
        <div className="mt-3 flex flex-col gap-1 min-h-0 overflow-y-auto pr-1">
          {st.checkpoints.map((it, k) => (
            <button key={it.name + k} onMouseEnter={() => setC(k)} onClick={() => onPick(st.id, it.cp)}
              className={`shrink-0 text-left px-2 py-[5px] text-[8px] border-2 ${k === c ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-zinc-900 text-white border-zinc-700'}`}>
              {k === c ? '▶ ' : '  '}{`${k + 1}. ${it.name}`}
            </button>
          ))}
        </div>
        <div className="mt-3 flex justify-between text-[7px] text-white/70">
          <Prompt pad={['DPAD_LEFT', 'DPAD_RIGHT']} kb={['@left', '@right']} label="STAGE" size={15} />
          <Prompt pad={['OK']} kb={['ENTER']} mouse="left" label="GO" size={15} />
          <Prompt pad={['BACK']} kb={['ESC']} label="BACK" size={15} />
        </div>
      </div>
    </div>
  );
};

export default EndgamePicker;
