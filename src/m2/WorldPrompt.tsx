import React, { useEffect, useRef } from 'react';
import { Prompt } from '../m1/components/ButtonIcons';
import ChordPrompt from './ChordPrompt';
import { worldPrompt } from './store';

// A button prompt hanging over something in the world, the real button for what's being played on (pad, its family,
// or the keys): B over a head in the ground he can kick (the owner's "when near a planted enemy, show a B button prompt
// show on screen when ready for a field goal kick"), Y + B over the one an armor follow-up would take. Which, and where,
// come from store.ts worldPrompt, set every frame the grabs are drawn (moves/followups.ts drawFollowCue); this reads it
// on its own frame loop (no re-render a frame), bobbing a little. Not set for a moment (paused, a stretch that doesn't
// draw the grabs): hidden.

const STALE_MS = 120;

const WorldPrompt: React.FC = () => {
  const kick = useRef<HTMLDivElement>(null), follow = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      const w = worldPrompt, live = w.kind !== null && now - w.at < STALE_MS;
      const bob = Math.round(Math.sin(now / 200) * 3);
      for (const [el, kind] of [[kick.current, 'kick'], [follow.current, 'follow']] as const) {
        if (!el) continue;
        const on = live && w.kind === kind;
        el.style.display = on ? 'flex' : 'none';
        if (on) el.style.transform = `translate(${Math.round(w.x)}px, ${Math.round(w.y) + bob}px) translate(-50%, -100%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const box = 'absolute left-0 top-0 z-20 pointer-events-none items-center gap-1 px-1 py-[2px] text-[8px] text-white bg-[#1A1028]/80 border-2 shadow-[0_0_0_1px_#0A0A10]';
  return (
    <>
      <div ref={kick} className={`${box} border-[#E0AE3A]`} style={{ display: 'none' }}>
        <Prompt pad={['B']} kb={['@special']} size={16} label="KICK" />
      </div>
      <div ref={follow} className={`${box} border-[#22D3EE]`} style={{ display: 'none' }}>
        {/* (B then Y: the B that started the move held, the thumb rolled onto Y; on the keys, the beatdown key as the charge
            move's button's held, the owner's "press R as you hold down RMB for a charge move". The secondary fire key and the
            charge hotkeys work too, unadvertised: "tutorial prompts will say RMB, but allow those as secondary commands") */}
        <ChordPrompt pad={['B', 'Y']} join=">" kb={['@special', '@beatdown']} size={16} label="" />
      </div>
    </>
  );
};

export default WorldPrompt;
