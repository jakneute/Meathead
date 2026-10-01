import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Prompt } from './ButtonIcons';
import { GameStatus, WeaponType } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, RENDER_SCALE, PRACTICE_RANGE_STAGE } from '../constants';
import { getWeaponInfo, getWeaponDescription } from '../content/roster';
import { createRange, stepRange, newRespawns } from '../game/range';
import { KeyboardMouseState, readControls } from '../game/platform/input';
import { drawWorld } from '../game/render/world';
import { getActiveGamepad, isButtonPressed, GP_BUTTONS } from '../game/platform/gamepad';
import { WeaponArt } from './WeaponIcon';

// The practice range, out back of the garage: the same range he gets after a boss (the same floor, the same walls,
// the same two dummies, infinite ammo, nothing can hurt him), in a boxing ring, with everything he's got to try.
// Switch weapons the way you do in a stage (the wheel, the number keys, the bumpers); leave for the garage.

const FRAME_MS = 1000 / 60;

const PracticeRange: React.FC<{ weapons: WeaponType[]; onLeave: () => void }> = ({ weapons: given, onLeave }) => {
  // (the same list, however many times it's handed over: the range isn't rebuilt under him)
  const key = given.join(',');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const weapons = useMemo(() => given, [key]);
  const [weapon, setWeapon] = useState<WeaponType>(weapons[0] ?? 'GUN');
  const weaponRef = useRef(weapon); weaponRef.current = weapon;
  const leaveRef = useRef(onLeave); leaveRef.current = onLeave;
  const canvas = useRef<HTMLCanvasElement>(null);
  const range = useMemo(() => createRange(weapons[0] ?? 'GUN', PRACTICE_RANGE_STAGE, weapons), [weapons]);
  const cycle = (d: number) => setWeapon(w => weapons[(weapons.indexOf(w) + d + weapons.length) % weapons.length]);
  const cycleRef = useRef(cycle); cycleRef.current = cycle;

  useEffect(() => {
    const kb = new KeyboardMouseState();
    const detach = kb.attach(window);
    const respawns = newRespawns();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); leaveRef.current(); return; }
      const slot = /^Digit([1-9])$/.exec(e.code);
      if (slot && Number(slot[1]) <= weapons.length) setWeapon(weapons[Number(slot[1]) - 1]);
    };
    const onWheel = (e: WheelEvent) => cycleRef.current(e.deltaY > 0 ? 1 : -1);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('wheel', onWheel);
    let raf = 0, lastStep = 0;
    const prev = { lb: true, rb: true, start: true };
    const loop = (wall: number) => {
      const gp = getActiveGamepad();
      if (gp) {
        const lb = isButtonPressed(gp, GP_BUTTONS.LB), rb = isButtonPressed(gp, GP_BUTTONS.RB);
        const start = isButtonPressed(gp, GP_BUTTONS.START) || isButtonPressed(gp, GP_BUTTONS.SELECT);
        if (lb && !prev.lb) cycleRef.current(-1);
        if (rb && !prev.rb) cycleRef.current(1);
        if (start && !prev.start) leaveRef.current();
        prev.lb = lb; prev.rb = rb; prev.start = start;
      }
      if (lastStep === 0) lastStep = wall;
      let steps = 0;
      while (wall - lastStep >= FRAME_MS - 2 && steps < 4) { lastStep += FRAME_MS; steps++; if (stepRange(range, readControls(kb), weaponRef.current, respawns)) { leaveRef.current(); return; } }
      if (lastStep < wall - 200) lastStep = wall;
      const rc = canvas.current?.getContext('2d');
      if (rc) {
        rc.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
        drawWorld(rc, range, { status: GameStatus.PLAYING, stageId: PRACTICE_RANGE_STAGE, currentWeapon: weaponRef.current, invincibilityEnabled: false, bossTauntText: '' });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); detach(); window.removeEventListener('keydown', onKey, true); window.removeEventListener('wheel', onWheel); };
  }, [range, weapons]);

  const name = getWeaponInfo(weapon).name.toUpperCase();
  return (
    <div className="absolute inset-0 z-[76] bg-black select-none animate-in fade-in duration-500" style={{ fontFamily: '"Press Start 2P", monospace' }}
      onContextMenu={e => e.preventDefault()}>
      <canvas ref={canvas} width={CANVAS_WIDTH * RENDER_SCALE} height={CANVAS_HEIGHT * RENDER_SCALE} className="absolute inset-0 w-full h-full" />
      <div className="absolute left-0 right-0 top-0 px-4 pt-3 pb-3 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 80%, transparent 100%)' }}>
        <div className="flex items-baseline gap-3">
          <span className="text-[9px] text-red-500 tracking-widest">PRACTICE RANGE</span>
          <span className="text-[15px] text-yellow-300 italic [text-shadow:2px_2px_0_#7F1D1D]">{name}</span>
        </div>
        <p className="mt-2 text-[8px] leading-[14px] text-white/90 uppercase">{getWeaponDescription(weapon)}</p>
        <p className="mt-2 text-[7px] text-cyan-400/90 tracking-wider">THE HIRED HELP: A WANNABE BOXER WHO ANSWERED AN AD, AND A GUY ON BALLOONS. DON'T ASK. THEY GET PAID BY THE HOUR. INFINITE AMMO.</p>
      </div>
      {/* Everything he's got: the one in hand lit up (and how to change it) */}
      <Prompt pad={['LB', 'RB']} kb={['1-9']} mouse="wheel" label="SWITCH" size={13} className="absolute left-3 bottom-[62px] text-[7px] text-white/80" />
      <div className="absolute left-3 bottom-3 flex gap-1">
        {weapons.map((w, i) => (
          <button key={w} onClick={() => setWeapon(w)}
            className={`w-[44px] h-[44px] flex items-center justify-center border-2 ${w === weapon ? 'border-yellow-400 bg-yellow-400/25' : 'border-zinc-700 bg-black/60'}`}>
            <WeaponArt type={w} size={34} />
            <span className="sr-only">{i + 1}</span>
          </button>
        ))}
      </div>
      <button onClick={() => onLeave()}
        className="absolute right-3 bottom-3 px-3 py-2 text-[9px] text-black bg-yellow-400 border-2 border-black shadow-[3px_3px_0_#000]">
        <span className="inline-flex items-center gap-2"><Prompt pad={['START']} kb={['ESC']} size={14} />◀ GARAGE</span>
      </button>
    </div>
  );
};

export default PracticeRange;
