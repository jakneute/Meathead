// The amulet on the HUD (SPEC.md): at the end of the weapon row, a DOOM-style face of Meathead (amuletFace.ts: the
// ANGER face from the meter, the HURT over it from his health) and an upright meter beside it, its color going from
// yellow to orange to red as it fills, flashing when it's about to go. Through the rage it's white-hot and running
// down (the time he's invulnerable); through the cooldown, gray and coming back. Only once he owns the amulet; switched
// off in the pause menu, the face stays and the meter's dark. Hidden with the rest of the HUD in cutscenes.

import React, { useSyncExternalStore } from 'react';
import { subscribeAmulet, amuletSnap } from './amulet';
import { has, amuletOn, subscribeUpgrades, upgradesVersion } from './state';
import { angerFace, hurtFace, helmetFace, angerLevel, hurtLevel, FACE_W, FACE_H } from './amuletFace';

/** The ammo bar's width when the amulet's sharing the row (HUD.tsx's ammoBarWidth; 100 otherwise). */
export const AMULET_AMMO_BAR = 58;

const METER_H = FACE_H + 4;
const CSS = `@keyframes amu-full { 0%, 49% { filter: brightness(1.6); } 50%, 100% { filter: none; } }`;

/** The fill's color, banded (lit left, base, shade right), by how full. */
const band = (f: number) => {
  const [lt, md, dk] = f >= 0.9 ? ['#FECACA', '#EF4444', '#991B1B'] : f >= 0.7 ? ['#FCA5A5', '#DC2626', '#7F1D1D'] : f >= 0.4 ? ['#FDBA74', '#F97316', '#9A3412'] : ['#FEF08A', '#FACC15', '#A16207'];
  return `linear-gradient(90deg, ${lt} 0 1px, ${md} 1px 3px, ${dk} 3px)`;
};

export const amuletOwned = () => has('amulet');

const AmuletHud: React.FC<{ health: number; maxHealth: number }> = ({ health, maxHealth }) => {
  useSyncExternalStore(subscribeUpgrades, upgradesVersion);
  const s = useSyncExternalStore(subscribeAmulet, amuletSnap);
  if (!has('amulet')) return null;
  const on = amuletOn();
  const anger = !on ? 0 : s.phase === 'rage' ? 4 : s.phase === 'cool' ? 0 : angerLevel(s.fill);
  const hurt = hurtLevel(Math.max(0, health) / Math.max(1, maxHealth));
  const top = hurtFace(hurt);
  // (the meter: how much of it's lit, and in what)
  const level = !on ? 0 : s.phase === 'fill' ? s.fill : s.phase === 'rage' ? s.left : 1 - s.left;
  const fill = !on ? 'transparent' : s.phase === 'rage' ? 'linear-gradient(90deg, #FFFFFF 0 1px, #FEF2F2 1px 3px, #FCA5A5 3px)' : s.phase === 'cool' ? 'linear-gradient(90deg, #A1A1AA 0 1px, #71717A 1px 3px, #52525B 3px)' : band(s.fill);
  const flash = on && ((s.phase === 'fill' && s.fill >= 0.85) || s.phase === 'rage');
  return (
    <div className="flex items-center gap-[3px]">
      <style>{CSS}</style>
      <div className="relative border-2 border-zinc-700" style={{ width: FACE_W + 4, height: FACE_H + 4, background: s.phase === 'rage' && on ? 'radial-gradient(circle, rgba(239,68,68,0.45) 0%, rgba(0,0,0,0.7) 80%)' : 'radial-gradient(circle, rgba(250,204,21,0.12) 0%, rgba(0,0,0,0.65) 80%)' }}>
        <img src={angerFace(anger)} width={FACE_W} height={FACE_H} alt="" className="absolute left-[0px] top-[0px]" style={{ imageRendering: 'pixelated' }} draggable={false} />
        {has('helmet') && <img src={helmetFace()} width={FACE_W} height={FACE_H} alt="" className="absolute left-[0px] top-[0px]" style={{ imageRendering: 'pixelated' }} draggable={false} />}
        {top && <img src={top} width={FACE_W} height={FACE_H} alt="" className="absolute left-[0px] top-[0px]" style={{ imageRendering: 'pixelated' }} draggable={false} />}
      </div>
      <div className="relative w-[7px] bg-black border border-zinc-900" style={{ height: METER_H, boxShadow: 'inset 0 0 0 1px #3F3F46' }}>
        <div className="absolute left-0 right-0 bottom-0" style={{ height: `${Math.max(0, Math.min(1, level)) * 100}%`, background: fill, animation: flash ? 'amu-full 0.3s steps(1, end) infinite' : undefined }} />
        {/* (notches: quarters) */}
        <div className="absolute inset-0" style={{ background: `repeating-linear-gradient(180deg, transparent 0 ${METER_H / 4 - 3}px, rgba(0,0,0,0.6) ${METER_H / 4 - 3}px ${METER_H / 4 - 2}px)` }} />
      </div>
    </div>
  );
};

export default AmuletHud;
