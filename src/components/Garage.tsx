import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SOUVENIRS } from '../content/garage';
import { ownedSouvenirs } from '../game/garageStore';
import { drawGarage, GARAGE_W, GARAGE_H, SLOTS, SOUVENIR_ORDER } from '../game/render/garage';
import { getActiveGamepad, getGamepadMovement, isButtonPressed, GP_BUTTONS } from '../game/platform/gamepad';

// Meathead's garage: what he's brought home from the bosses, up on the pegboard, the shelves and the floor. Go through
// them (the arrows, the stick, the mouse) and read the tags; leave to get back to the map.

const REPEAT_MS = 180;

const Garage: React.FC<{ onLeave: () => void }> = ({ onLeave }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const owned = useMemo(() => ownedSouvenirs(), []);
  const order = useMemo(() => SOUVENIR_ORDER.filter(id => owned.includes(id)), [owned]);
  const [sel, setSel] = useState<string | null>(order[0] ?? null);
  const selRef = useRef(sel); selRef.current = sel;
  const leaveRef = useRef(onLeave); leaveRef.current = onLeave;

  const step = (d: number) => {
    if (!order.length) return;
    const i = Math.max(0, order.indexOf(selRef.current ?? order[0]));
    setSel(order[(i + d + order.length) % order.length]);
  };
  const stepRef = useRef(step); stepRef.current = step;

  // The room, drawn every frame (the tube flickers, the lamp bubbles, the clock ticks)
  useEffect(() => {
    let raf = 0, t = 0;
    const tick = () => {
      const ctx = canvas.current?.getContext('2d');
      if (ctx) { ctx.setTransform(canvas.current!.width / GARAGE_W, 0, 0, canvas.current!.height / GARAGE_H, 0, 0); drawGarage(ctx, t++, owned, selRef.current); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [owned]);

  // The keyboard and the pad: through the souvenirs, and out
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'escape' || k === 'backspace') { e.preventDefault(); leaveRef.current(); }
      else if (k === 'arrowright' || k === 'd' || k === 'arrowdown' || k === 's') stepRef.current(1);
      else if (k === 'arrowleft' || k === 'a' || k === 'arrowup' || k === 'w') stepRef.current(-1);
    };
    const onMouse = (e: MouseEvent) => { if (e.button === 2) leaveRef.current(); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onMouse);
    let raf = 0, last = 0, prevB = true;
    const poll = () => {
      const gp = getActiveGamepad();
      if (gp) {
        const now = Date.now(), m = getGamepadMovement(gp, 0.3);
        const d = m.right || m.down ? 1 : m.left || m.up ? -1 : 0;
        if (d && now - last > REPEAT_MS) { last = now; stepRef.current(d); }
        const b = isButtonPressed(gp, GP_BUTTONS.B);
        if (b && !prevB) leaveRef.current();
        prevB = b;
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
      {order.map(id => {
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
        ) : (
          <div className="text-[8px] leading-[12px] text-white/80">NOTHING IN HERE YET. GO KILL SOMEBODY AND BRING SOMETHING HOME.</div>
        )}
      </div>
      <button onClick={() => onLeave()}
        className="absolute left-[10px] bottom-[8px] px-3 py-3 text-[9px] text-black bg-yellow-400 border-2 border-black shadow-[3px_3px_0_#000]">
        ◀ MAP
      </button>
    </div>
  );
};

export default Garage;
