import React from 'react';
import { Prompt, PadIcon, BindingIcon, useBoundKeys } from './ButtonIcons';
import { useInputDevice, usePadFamily } from './useInputDevice';

// The gym's lessons (game/stages/gym/runtime.ts): what to do to the ones in the room he's in, as the buttons that do
// it on whatever's being played with (changing over the moment you switch), for as long as there's anybody there.

type Lesson = 'ski' | 'move' | 'fire' | 'charge' | 'push' | 'slide' | 'uppercut' | 'divekick' | 'shield';

const SIZE = 16;

/** A direction on the pad and then a button (UP + B), or the keyboard's own key for it (as they're bound now). */
const Combo: React.FC<{ dir: 'UP' | 'DOWN'; kb: string[]; air?: boolean }> = ({ dir, kb, air }) => {
  const pad = useInputDevice() === 'pad', family = usePadFamily();
  const own = useBoundKeys(kb), dirKey = useBoundKeys([dir === 'UP' ? '@up' : '@down']), special = useBoundKeys(['@special']);
  const icon = (k: { code?: string; name: string }, i: number) => <BindingIcon key={`${k.code ?? k.name}${i}`} code={k.code} name={k.name} size={SIZE} />;
  return pad
    ? <span className="inline-flex items-center gap-[3px]"><PadIcon k={dir === 'UP' ? 'DPAD_UP' : 'DPAD_DOWN'} size={SIZE} family={family} /><span>+</span><PadIcon k="B" size={SIZE} family={family} />{air && <span className="ml-1">IN THE AIR</span>}</span>
    : <span className="inline-flex items-center gap-[3px]">{own.map(icon)}{own.length > 0 && dirKey.length > 0 && special.length > 0 && <span>OR</span>}{dirKey.length > 0 && special.length > 0 && <>{dirKey.map(icon)}<span>+</span>{special.map(icon)}</>}{air && <span className="ml-1">IN THE AIR</span>}</span>;
};

const LESSONS: Record<Lesson, { how: React.ReactNode; what: string; note?: string }> = {
  // (Artie's ski run)
  ski: {
    how: <><Prompt pad={['DPAD_RIGHT']} kb={['@right']} size={SIZE} label="FASTER" /><span className="mx-2" /><Prompt pad={['DPAD_LEFT']} kb={['@left']} size={SIZE} label="SLOWER" /></>,
    what: 'IN THE AIR TOO: HOLD RIGHT TO JUMP FURTHER, LEFT TO COME DOWN SHORTER.',
  },
  move: {
    how: <><Prompt pad={['DPAD']} kb={['@left', '@right']} size={SIZE} label="MOVE" /><span className="mx-2" /><Prompt pad={['A']} kb={['@jump']} size={SIZE} label="JUMP" /><span className="mx-2" /><Prompt pad={['DPAD_DOWN']} kb={['@down']} size={SIZE} label="CROUCH" /></>,
    what: 'GET UP OFF THE BENCH. THERE ARE PENCIL NECKS IN YOUR GYM.',
    note: 'CROUCH AND MOST SHOTS GO OVER YOUR HEAD. HOLD JUMP TO JUMP HIGHER.',
  },
  fire: { how: <Prompt pad={['X']} kb={['@@fire']} size={SIZE} label="SHOOT" />, what: 'SHOOT THE PENCIL NECKS.' },
  charge: {
    how: <Prompt pad={['B']} kb={['@charge', '@special']} size={SIZE} label="SHOULDER CHARGE" />,
    what: 'PLOW THROUGH THE LINE. THE ONES YOU SEND FLYING TAKE OUT THE ONES BEHIND THEM.',
    note: 'HOLD THE BUTTON TO KEEP CHARGING. CHARGE AGAIN THE MOMENT IT ENDS: EVERY ONE LANDS. IT USES POWER (THE CELLS UNDER YOUR HEALTH): THEY REFILL.',
  },
  push: {
    how: <Prompt pad={['B']} kb={['@charge', '@special']} size={SIZE} label="SHOULDER CHARGE (HOLD IT)" />,
    what: 'NOTHING GETS THROUGH THAT MAT. CHARGE INTO IT AND HOLD THE BUTTON: A CHARGE SHOVES ANYONE BEHIND A SHIELD BACK, AS FAR AS YOU KEEP IT UP.',
    note: 'DRIVE HIM INTO THE WALL AND THAT\'S HIM DONE. (OR HOP THE WALL AND DIVE KICK HIM: THE MAT DOESN\'T COVER HIS HEAD.)',
  },
  slide: { how: <Combo dir="DOWN" kb={['@downSpecial']} />, what: 'GYM RATS. ACTUAL RATS. TOO LOW TO SHOOT: SLIDE TACKLE THEM.' },
  uppercut: { how: <Combo dir="UP" kb={['@uppercut']} />, what: 'THEY THINK THEY\'RE SAFE UP ON THE RACKS. UPPERCUT THEM OFF.' },
  divekick: { how: <Combo dir="DOWN" kb={['@downSpecial']} air />, what: "JUMP OFF THE EDGE AND DIVE KICK THEM. LAND ON A HEAD, BOUNCE, DO IT AGAIN. A KICK THAT KILLS GOES STRAIGHT THROUGH HIM: NO BOUNCE, AND THAT'S THE COMBO OVER.", note: "DIVE KICKS ARE FREE, AND ONE THAT DOESN'T KILL GIVES YOU POWER BACK: KEEP BOUNCING OFF THE TOUGH ONES AND YOU CAN GO FOREVER." },
  shield: { how: <Prompt pad={['B']} kb={['@charge', '@special']} size={SIZE} label="SHOULDER CHARGE" />, what: 'A BRIEFCASE WON\'T STOP YOU. CHARGE IT, AND DRIVE HIM INTO THE WALL.', note: 'A SHIELD WON\'T STOP A DIVE KICK EITHER: COME DOWN ON HIM FROM ABOVE AND IT GOES RIGHT THROUGH.' },
};

const TutorialHint: React.FC<{ lesson: string | null }> = ({ lesson }) => {
  const l = lesson ? LESSONS[lesson as Lesson] : undefined;
  if (!l) return null;
  return (
    <div key={lesson} className="absolute left-1/2 -translate-x-1/2 top-[64px] z-[40] pointer-events-none animate-in fade-in slide-in-from-top-2 duration-300"
      style={{ fontFamily: '"Press Start 2P", monospace' }}>
      <div className="px-4 py-2 max-w-[600px] text-center" style={{ background: 'rgba(0,0,0,0.78)', border: '2px solid #FACC15', boxShadow: '3px 3px 0 #000' }}>
        <div className="flex items-center justify-center gap-1 text-[9px] text-yellow-300">{l.how}</div>
        <div className="mt-2 text-[8px] leading-[13px] text-white">{l.what}</div>
        {l.note && <div className="mt-1 text-[7px] leading-[11px] text-cyan-300">{l.note}</div>}
      </div>
    </div>
  );
};

export default TutorialHint;
