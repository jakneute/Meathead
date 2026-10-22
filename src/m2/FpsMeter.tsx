import React, { useEffect, useRef } from 'react';

// The cheats build's frame rate, up in the top right corner: counted off its own animation frames, written straight
// into the text twice a second (no React renders for it).

const FpsMeter: React.FC = () => {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0, n = 0, last = performance.now(), worst = 0, prev = last;
    const tick = (now: number) => {
      n++; worst = Math.max(worst, now - prev); prev = now;
      if (now - last >= 500) {
        const fps = Math.round((n * 1000) / (now - last));
        if (el.current) {
          el.current.textContent = `${fps} FPS  ${worst.toFixed(0)}MS`;
          el.current.style.color = fps >= 58 ? '#86EFAC' : fps >= 45 ? '#FDE047' : '#F87171';
        }
        n = 0; last = now; worst = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <div ref={el} className="absolute right-1 top-1 z-[60] px-1 text-[8px] leading-[12px] bg-black/60 pointer-events-none select-none" />;
};

export default FpsMeter;
