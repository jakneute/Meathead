import React from 'react';
import type { WeaponType } from '../m1/types';
import { maxAmmo } from '../m1/constants';
import { Prompt } from '../m1/components/ButtonIcons';
import { M2_WEAPON_INFO, M2WeaponArt, ammoName } from './weapons';
import ChordPrompt from './ChordPrompt';

// Meathead 2's pause menu: the arsenal (each weapon with how much is left in it), the one picked out up close with its
// name, where it came from and what it does, and RESUME. Looks the way Meathead 1's does. Moved round with the D-pad or
// stick (or the arrow keys), picked with the confirm button (or ENTER, or a click); the weapon picked is the one he's
// holding.

interface Props {
  weapons: WeaponType[];
  current: WeaponType;
  ammo: Partial<Record<WeaponType, number>>;
  /** What's picked out: a weapon (its index), or RESUME (weapons.length). */
  selected: number;
  onPick: (i: number) => void;
  onResume: () => void;
  /** In the intro: skip the rest of it (picked out as weapons.length + 1). */
  onSkip?: () => void;
}

const PauseMenu: React.FC<Props> = ({ weapons, current, ammo, selected, onPick, onResume, onSkip }) => {
  const shown = selected < weapons.length ? weapons[selected] : current;
  const info = M2_WEAPON_INFO[shown];
  const full = (w: WeaponType) => maxAmmo(w);
  const left = (w: WeaponType) => (full(w) === Infinity ? null : (ammo[w] ?? full(w)) / full(w));
  const ammoText = (w: WeaponType) => (full(w) === Infinity ? 'INFINITE' : `${Math.floor(ammo[w] ?? full(w))} / ${full(w)}`);
  const onResumeBtn = selected === weapons.length, onSkipBtn = selected === weapons.length + 1;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70">
      <div className="relative flex flex-col items-center w-[600px] px-6 pt-4 pb-3"
        style={{
          // (the scanlines over the dark: both in the one background, or the one wipes out the other)
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 3px), linear-gradient(180deg, rgba(24,24,27,0.97) 0%, rgba(9,9,11,0.97) 100%)',
          border: '3px solid #F472B6',
          boxShadow: '0 0 0 3px #000, 0 0 40px rgba(0,0,0,0.9), inset 0 0 30px rgba(244,114,182,0.06)',
        }}>
        <div className="absolute left-0 right-0 top-0 h-[6px]" style={{ background: 'repeating-linear-gradient(135deg, #F472B6 0 8px, #FDE047 8px 16px)' }} />
        <h2 className="mt-1 mb-3 text-3xl font-black italic tracking-widest text-pink-400" style={{ textShadow: '3px 3px 0 #831843, 5px 5px 0 #000' }}>PAUSED</h2>

        <div className="flex gap-4 w-full items-start">
          {/* The arsenal */}
          <div className="flex flex-col items-center">
            <div className="text-[8px] text-zinc-400 font-black tracking-widest mb-2">ARSENAL</div>
            <div className="grid grid-cols-3 gap-[10px] p-2 bg-black/50 border border-zinc-700">
              {weapons.map((w, i) => {
                const on = selected === i, equipped = w === current, fill = left(w);
                return (
                  <button key={w} onClick={() => onPick(i)}
                    className={`relative w-[64px] h-[64px] flex items-center justify-center border-2 transition-transform ${on ? 'scale-110 border-white' : equipped ? 'border-yellow-500' : 'border-zinc-600'}`}
                    style={{ background: on ? 'rgba(250,204,21,0.85)' : 'rgba(24,24,27,0.9)', boxShadow: on ? '0 0 12px rgba(250,204,21,0.6)' : 'none' }}>
                    <span className="absolute left-1 top-0 text-[7px] font-black text-zinc-300">{i + 1}</span>
                    <M2WeaponArt type={w} size={46} />
                    {fill !== null && <span className="absolute left-1 right-1 bottom-1 h-[3px] bg-black"><span className="block h-full bg-green-400" style={{ width: `${Math.max(0, Math.min(1, fill)) * 100}%` }} /></span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* The one picked out, up close */}
          <div className="flex-1 flex flex-col items-center text-center pt-5">
            <div className="w-[104px] h-[104px] flex items-center justify-center mb-2 border-2 border-zinc-700"
              style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.14) 0%, rgba(0,0,0,0.6) 70%)' }}>
              <M2WeaponArt type={shown} size={88} />
            </div>
            <div className="text-yellow-300 text-[11px] font-black uppercase leading-tight mb-1">{info?.name ?? shown}</div>
            <div className="text-[7px] text-pink-400 font-black uppercase tracking-wider mb-2 text-center">FROM {info?.from ?? ''}{shown === current && <span className="block text-red-500 whitespace-nowrap mt-[2px]">[ EQUIPPED ]</span>}</div>
            <div className="text-zinc-300 text-[7px] leading-[11px] uppercase font-bold mb-2 min-h-[44px]">&ldquo;{info?.description ?? ''}&rdquo;</div>
            <div className="text-[7px] font-black tracking-wider text-green-400">{ammoName(shown)}: {ammoText(shown)}</div>
            {/* How it's worked: a line per move, the buttons for whatever's being played on */}
            {info?.controls?.length ? (
              <div className="mt-2 w-full flex flex-col items-start gap-[3px] px-2 py-1 bg-black/40 border border-zinc-700 text-[6px] font-black text-zinc-200 tracking-wider">
                {info.controls.map((k, i) => <ChordPrompt key={i} pad={k.pad} join={k.join ?? '+'} kb={k.kb} mouse={k.mouse} label={k.label} size={12} />)}
                {info.note && <span className="text-red-400 mt-[1px]">{info.note}</span>}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={onResume}
            className={`relative flex items-center gap-2 pl-6 pr-3 py-[7px] text-white text-[10px] font-black uppercase tracking-wider transition-all ${onResumeBtn ? 'translate-x-1' : 'opacity-85 hover:opacity-100'}`}
            style={{ background: 'linear-gradient(180deg, #DB2777, #9D174D)', borderBottom: '4px solid #500724', boxShadow: onResumeBtn ? '0 0 12px rgba(250,204,21,0.6), 3px 3px 0 #000' : '3px 3px 0 #000', outline: onResumeBtn ? '2px solid #FACC15' : 'none' }}>
            {onResumeBtn && <span className="absolute left-2 text-yellow-300 animate-pulse">&#9654;</span>}
            <span className="w-4 text-center">▶</span>RESUME
          </button>
          {onSkip && (
            <button onClick={onSkip}
              className={`relative flex items-center gap-2 pl-6 pr-3 py-[7px] text-white text-[10px] font-black uppercase tracking-wider transition-all ${onSkipBtn ? 'translate-x-1' : 'opacity-85 hover:opacity-100'}`}
              style={{ background: 'linear-gradient(180deg, #2563EB, #1E3A8A)', borderBottom: '4px solid #172554', boxShadow: onSkipBtn ? '0 0 12px rgba(250,204,21,0.6), 3px 3px 0 #000' : '3px 3px 0 #000', outline: onSkipBtn ? '2px solid #FACC15' : 'none' }}>
              {onSkipBtn && <span className="absolute left-2 text-yellow-300 animate-pulse">&#9654;</span>}
              <span className="w-4 text-center">»</span>SKIP INTRO
            </button>
          )}
        </div>
        <div className="mt-3 flex items-center gap-4 text-[6px] text-zinc-500 tracking-wider">
          <Prompt pad={['START', 'BACK']} kb={['ESC']} mouse="right" label="RESUME" size={15} />
          <Prompt pad={['DPAD', 'OK']} kb={['1-9']} mouse="left" label="EQUIP" size={15} />
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;
