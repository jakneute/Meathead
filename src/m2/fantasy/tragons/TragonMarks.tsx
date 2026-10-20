import React, { useEffect, useRef } from 'react';
import { Prompt } from '../../../m1/components/ButtonIcons';
import { tragonMarkAt } from '../../store';

// Truelling Tragons: over each dragon he's not on, the button that hops him there (the user's: "show button icons on
// the dragon rides you're not currently on ... like show lb or rb buttons hovering over trains you're not currently
// on"). Which button each is the ride's (ride.ts hopMarks: the next car that way, or round off the top / bottom);
// the real button for what's being played on (pad, its family (SL / SR on a lone Joy-Con), or the keys and wheel).
// Where each hovers is moved every frame from tragonMarkAt by this component's own frame loop (no re-render a frame),
// bobbing a little.

const HOP_UP = { pad: ['RB' as const], kb: ['@prevWeapon'] };
const HOP_DOWN = { pad: ['LB' as const], kb: ['@nextWeapon'] };

const TragonMarks: React.FC<{ marks: string }> = ({ marks }) => {
  const refs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      refs.forEach((r, i) => {
        const el = r.current;
        if (!el) return;
        const p = tragonMarkAt[i], bob = Math.round(Math.sin(now / 260 + i * 2) * 3);
        el.style.transform = `translate(${Math.round(p.x)}px, ${Math.round(p.y) + bob}px) translate(-50%, -100%)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const each = marks.split('|');
  return (
    <>
      {[0, 1, 2].map(i => {
        const m = each[i] ?? '';
        return (
          <div key={i} ref={refs[i]} className="absolute left-0 top-0 z-20 pointer-events-none flex items-center gap-1 px-1 py-[2px] bg-[#0E1A3A]/80 border-2 border-[#E0AE3A] shadow-[0_0_0_1px_#1A1028]"
            style={{ display: m ? 'flex' : 'none', transform: `translate(${Math.round(tragonMarkAt[i].x)}px, ${Math.round(tragonMarkAt[i].y)}px) translate(-50%, -100%)` }}>
            {(m === 'up' || m === 'both') && <Prompt {...HOP_UP} size={16} />}
            {(m === 'down' || m === 'both') && <Prompt {...HOP_DOWN} size={16} />}
          </div>
        );
      })}
    </>
  );
};

export default TragonMarks;
