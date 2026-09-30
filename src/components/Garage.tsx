import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SOUVENIRS } from '../content/garage';
import { ownedSouvenirs } from '../game/garageStore';
import { drawGarage, GARAGE_W, GARAGE_H, SLOTS, SOUVENIR_ORDER } from '../game/render/garage';
import { getActiveGamepad, getGamepadMovement, isButtonPressed, GP_BUTTONS, menuButtons } from '../game/platform/gamepad';
import type { WeaponType } from '../types';
import PracticeRange from './PracticeRange';
import { Prompt } from './ButtonIcons';

// Meathead's garage: what he's brought home from the bosses, up on the pegboard, the shelves and the floor. Go through
// them (the arrows, the stick, the mouse) and read the tags; leave to get back to the map.

const REPEAT_MS = 180;
/** (in the list of things to pick: the practice range) */
const RANGE = '__range';

const Garage: React.FC<{ onLeave: () => void; weapons: WeaponType[] }> = ({ onLeave, weapons }) => {
  /** Out back at the practice range (the garage's keys and pad do nothing meanwhile). */
  const [practice, setPractice] = useState(false);
  const practiceRef = useRef(practice); practiceRef.current = practice;
  const canvas = useRef<HTMLCanvasElement>(null);
  const owned = useMemo(() => ownedSouvenirs(), []);
  // (the souvenirs, and then the way out back to the practice range: it's one of the things to go through, so the
  // stick and the arrows get to it like anything else)
  const order = useMemo(() => [...SOUVENIR_ORDER.filter(id => owned.includes(id)), RANGE], [owned]);
  const [sel, setSel] = useState<string | null>(order[0]);
  const selRef = useRef(sel); selRef.current = sel;
  const leaveRef = useRef(onLeave); leaveRef.current = onLeave;

  const step = (d: number) => {
    const i = Math.max(0, order.indexOf(selRef.current ?? order[0]));
    setSel(order[(i + d + order.length) % order.length]);
  };
  const stepRef = useRef(step); stepRef.current = step;

  // The room, drawn every frame (the tube flickers, the lamp bubbles, the clock ticks)
  useEffect(() => {
    let raf = 0, t = 0;
    const tick = () => {
      const ctx = canvas.current?.getContext('2d');
      // (not while he's out back at the range: it covers the room, and both drawing at once was a drag)
      if (ctx && !practiceRef.current) { ctx.setTransform(canvas.current!.width / GARAGE_W, 0, 0, canvas.current!.height / GARAGE_H, 0, 0); drawGarage(ctx, t++, owned, selRef.current); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [owned]);

  // The keyboard and the pad: through the souvenirs, and out
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (practiceRef.current) return;
      const k = e.key.toLowerCase();
      if ((k === 'enter' || k === ' ') && selRef.current === RANGE) { e.preventDefault(); setPractice(true); return; }
      // (and straight there from anywhere in the garage: the button shown on it)
      if (k === 'r') { setPractice(true); return; }
      if (k === 'escape' || k === 'backspace') { e.preventDefault(); leaveRef.current(); }
      else if (k === 'arrowright' || k === 'd' || k === 'arrowdown' || k === 's') stepRef.current(1);
      else if (k === 'arrowleft' || k === 'a' || k === 'arrowup' || k === 'w') stepRef.current(-1);
    };
    const onMouse = (e: MouseEvent) => { if (e.button === 2 && !practiceRef.current) leaveRef.current(); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onMouse);
    let raf = 0, last = 0, prevB = true, prevA = true, prevY = true;
    const poll = () => {
      const gp = getActiveGamepad();
      if (gp && practiceRef.current) { prevB = true; prevA = true; prevY = true; }
      else if (gp) {
        const now = Date.now(), m = getGamepadMovement(gp, 0.3);
        const d = m.right || m.down ? 1 : m.left || m.up ? -1 : 0;
        if (d && now - last > REPEAT_MS) { last = now; stepRef.current(d); }
        const mb = menuButtons(gp), b = isButtonPressed(gp, mb.back), a = isButtonPressed(gp, mb.ok);
        if (b && !prevB) leaveRef.current();
        const y = isButtonPressed(gp, GP_BUTTONS.Y);
        if (a && !prevA && selRef.current === RANGE) setPractice(true);
        if (y && !prevY) setPractice(true);
        prevB = b; prevA = a; prevY = y;
      }
      raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onMouse); cancelAnimationFrame(raf); };
  }, []);

  const s = SOUVENIRS.find(x => x.id === sel);
  return (
    <div className="absolute inset-0 z-[75] bg-black select-none animate-in fade-in duration-500" style={{ fontFamily: '"Press Start 2P", monospace' }}
      onContextMenu={e => e.preventDefault()}>
      <canvas ref={canvas} width={GARAGE_W * 2} height={GARAGE_H * 2} className="absolute inset-0 w-full h-full" />
      {/* The souvenirs to point at */}
      {order.filter(id => id !== RANGE).map(id => {
        const b = SLOTS[id].box;
        return <div key={id} className="absolute cursor-pointer" style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
          onMouseEnter={() => setSel(id)} onClick={() => setSel(id)} />;
      })}
      {/* The title, the count */}
      <div className="absolute left-0 right-0 top-[6px] flex items-center justify-between px-3 pointer-events-none">
        <span className="text-[12px] text-yellow-300 italic [text-shadow:2px_2px_0_#7F1D1D,4px_4px_0_#000]">MEATHEAD'S GARAGE</span>
        <span className="text-[8px] text-white/80 [text-shadow:1px_1px_0_#000]">SOUVENIRS {owned.length}/{SOUVENIRS.length}</span>
      </div>
      {/* The tag on whatever's picked */}
      <div className="absolute left-[130px] right-[10px] bottom-[8px] min-h-[46px] px-3 py-2 border-2 border-yellow-500 bg-black/85 shadow-[3px_3px_0_#000] pointer-events-none">
        {s ? (
          <>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[10px] text-yellow-300">{s.name}</span>
              <span className="text-[6px] text-cyan-300/90 shrink-0">FROM: {s.boss.toUpperCase()}</span>
            </div>
            <div className="mt-1 text-[7px] leading-[11px] text-white/90">"{s.note}"</div>
          </>
        ) : sel === RANGE ? (
          <>
            <div className="text-[10px] text-red-400">THE PRACTICE RANGE</div>
            <div className="mt-1 text-[7px] leading-[11px] text-white/90">OUT BACK. A RING, TWO GUYS WHO NEED THE MONEY, AND EVERYTHING HE'S GOT TO TRY ON THEM.</div>
          </>
        ) : (
          <div className="text-[8px] leading-[12px] text-white/80">NOTHING IN HERE YET. GO KILL SOMEBODY AND BRING SOMETHING HOME.</div>
        )}
      </div>
      <button onClick={() => onLeave()}
        className="absolute left-[10px] bottom-[8px] px-3 py-3 text-[9px] text-black bg-yellow-400 border-2 border-black shadow-[3px_3px_0_#000]">
        <span className="inline-flex items-center gap-2"><Prompt pad={['BACK']} kb={['ESC']} size={14} />◀ MAP</span>
      </button>
      {/* Out back: the practice range */}
      <button onClick={() => setPractice(true)} onMouseEnter={() => setSel(RANGE)}
        className={`absolute right-[10px] top-[26px] px-3 py-2 text-[8px] text-black border-2 shadow-[3px_3px_0_#000] ${sel === RANGE ? 'bg-yellow-400 border-white animate-pulse' : 'bg-red-500 border-black'}`}>
        <span className="inline-flex items-center gap-2">
          <Prompt pad={['Y']} kb={['R']} size={18} />
          PRACTICE RANGE ▶
        </span>
      </button>
      {practice && <PracticeRange weapons={weapons} onLeave={() => setPractice(false)} />}
    </div>
  );
};

export default Garage;
