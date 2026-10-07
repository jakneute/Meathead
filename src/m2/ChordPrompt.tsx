import React from 'react';
import { PadIcon, KeyCap, MouseIcon, type PadKey } from '../m1/components/ButtonIcons';
import { useInputDevice, usePadFamily } from '../m1/components/useInputDevice';

/**
 * A prompt that says how the buttons go together: `+` for pressed at once (a grab's two buttons), `/` for any one of
 * them (the punches). On the keyboard, its own keys (or the mouse button), the same way.
 */
const ChordPrompt: React.FC<{ pad: PadKey[]; join: '+' | '/'; kb?: string[]; mouse?: 'left' | 'right'; label: string; size?: number }> = ({ pad, join, kb = [], mouse, label, size = 14 }) => {
  const device = useInputDevice(), family = usePadFamily();
  const icons = device === 'pad'
    ? pad.map(k => <PadIcon key={k} k={k} size={size} family={family} />)
    : [...kb.map(k => <KeyCap key={k} label={k} size={size} />), ...(mouse ? [<MouseIcon key="m" button={mouse} size={size} />] : [])];
  return (
    <span className="inline-flex items-center gap-[3px] align-middle">
      {icons.map((icon, i) => <React.Fragment key={i}>{i > 0 && <span className={join === '+' ? 'text-yellow-300 text-[10px] px-[1px]' : 'text-zinc-400 px-[1px]'}>{join}</span>}{icon}</React.Fragment>)}
      <span className="ml-1">{label}</span>
    </span>
  );
};

export default ChordPrompt;
