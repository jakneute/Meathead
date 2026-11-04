import React, { useEffect, useRef } from 'react';
import { Prompt } from '../../../../m1/components/ButtonIcons';
import { tragonCueAt } from '../../../store';

// Truelling Tragons from behind: the real JUMP or DUCK button over the next obstacle coming at his own track (the
// owner's "make the obstacles more readable"), moved every frame from tragonCueAt by its own frame loop (no re-render a
// frame), fading as the obstacle gets to him.

const JUMP = { pad: ['A' as const], kb: ['@jump'] };
const DUCK = { pad: ['DPAD_DOWN' as const], kb: ['@down'] };

const BehindCue: React.FC<{ cue: 'jump' | 'duck' }> = ({ cue }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = ref.current;
      if (el) {
        el.style.transform = `translate(${Math.round(tragonCueAt.x)}px, ${Math.round(tragonCueAt.y)}px) translate(-50%, -100%)`;
        el.style.opacity = String(tragonCueAt.a);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div ref={ref} className="absolute left-0 top-0 z-20 pointer-events-none flex items-center gap-1 px-1 py-[2px] text-[8px] text-white bg-[#0E1A3A]/85 border-2 shadow-[0_0_0_1px_#1A1028]"
      style={{ borderColor: cue === 'jump' ? '#F97316' : '#38BDF8', transform: `translate(${Math.round(tragonCueAt.x)}px, ${Math.round(tragonCueAt.y)}px) translate(-50%, -100%)` }}>
      <Prompt {...(cue === 'jump' ? JUMP : DUCK)} size={16} />
      <span>{cue === 'jump' ? 'JUMP' : 'DUCK'}</span>
    </div>
  );
};

export default BehindCue;
