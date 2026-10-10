import React, { useEffect, useRef, useState } from 'react';
import { useCursorSound } from './useCursorSound';
import { stageCheckpoints } from '../game/stages/checkpoints';
import { getActiveGamepad, getGamepadMovement, isButtonPressed, menuButtons } from '../game/platform/gamepad';
import { Prompt } from './ButtonIcons';

/** The skip-level cheat's picker: which checkpoint of the stage to start at (or straight to the boss). */
export type StartAt = number | 'boss';

/** `list`: the places to start from, if not the stage's own checkpoints (a game's own: Meathead 2's lands). */
const CheckpointPicker: React.FC<{ stageId: string; onPick: (at: StartAt) => void; onCancel: () => void; list?: { label: string; at: StartAt }[] }> = ({ stageId, onPick, onCancel, list }) => {
  const items: { label: string; at: StartAt }[] = list ?? [...stageCheckpoints(stageId).map((c, k) => ({ label: `${k + 1}. ${c.name}`, at: c.cp as StartAt })), { label: 'THE BOSS', at: 'boss' }];
  const [i, setI] = useState(0);
  useCursorSound(i);
  const ref = useRef({ i, items, onPick, onCancel });
  ref.current = { i, items, onPick, onCancel };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase(), r = ref.current;
      e.stopPropagation();
      if (k === 'arrowdown' || k === 's') setI(v => (v + 1) % r.items.length);
      else if (k === 'arrowup' || k === 'w') setI(v => (v - 1 + r.items.length) % r.items.length);
      else if (k === 'enter' || k === ' ') { e.preventDefault(); r.onPick(r.items[r.i].at); }
      else if (k === 'escape' || k === 'backspace') r.onCancel();
    };
    window.addEventListener('keydown', onKey, true);
    let raf = 0, last = 0, prev = { a: true, b: true };
    const poll = () => {
      const gp = getActiveGamepad();
      if (gp) {
        const now = Date.now(), m = getGamepadMovement(gp, 0.3), r = ref.current;
        if ((m.up || m.down) && now - last > 170) { last = now; setI(v => (v + (m.down ? 1 : -1) + r.items.length) % r.items.length); }
        const mb = menuButtons(gp), a = isButtonPressed(gp, mb.ok), b = isButtonPressed(gp, mb.back);
        if (a && !prev.a) r.onPick(r.items[r.i].at);
        if (b && !prev.b) r.onCancel();
        prev = { a, b };
      }
      raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);
    return () => { window.removeEventListener('keydown', onKey, true); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div className="absolute inset-0 z-[78] flex items-center justify-center bg-black/80 select-none" style={{ fontFamily: '"Press Start 2P", monospace' }}>
      <div className="w-[360px] p-3 border-4 border-red-600 bg-zinc-950 shadow-[4px_4px_0_#000]">
        <div className="text-[8px] text-red-500 tracking-widest">SKIP LEVEL</div>
        <div className="mt-1 text-[11px] text-yellow-300">{stageId.toUpperCase()}: START WHERE?</div>
        <div className="mt-3 flex flex-col gap-1">
          {items.map((it, k) => (
            <button key={it.label} onMouseEnter={() => setI(k)} onClick={() => onPick(it.at)}
              className={`text-left px-2 py-[5px] text-[8px] border-2 ${k === i ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-zinc-900 text-white border-zinc-700'}`}>
              {k === i ? '▶ ' : '  '}{it.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex justify-between text-[7px] text-white/70">
          <Prompt pad={['OK']} kb={['ENTER']} mouse="left" label="START HERE" size={15} />
          <Prompt pad={['BACK']} kb={['ESC']} label="BACK" size={15} />
        </div>
      </div>
    </div>
  );
};

export default CheckpointPicker;
