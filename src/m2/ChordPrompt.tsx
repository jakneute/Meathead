import React from 'react';
import { PadIcon, MouseIcon, BindingIcon, useBoundKeys, type PadKey } from '../m1/components/ButtonIcons';
import { useInputDevice, usePadFamily } from '../m1/components/useInputDevice';

/**
 * A prompt that says how the buttons go together: `+` for pressed at once (a grab's two buttons), `/` for any one of
 * them (the punches). On the keyboard, its own keys (or the mouse button), the same way: '@jump' is whatever jump's
 * bound to now (the options screen's KEYBOARD + MOUSE page), as Prompt has it.
 */
const ChordPrompt: React.FC<{ pad: PadKey[]; join: '+' | '/'; kb?: string[]; mouse?: 'left' | 'right'; label: string; size?: number }> = ({ pad, join, kb = [], mouse, label, size = 14 }) => {
  const device = useInputDevice(), family = usePadFamily();
  const keys = useBoundKeys(kb);
  const icons = device === 'pad'
    ? pad.map(k => <PadIcon key={k} k={k} size={size} family={family} />)
    : [...keys.map((k, i) => <BindingIcon key={`${k.code ?? k.name}${i}`} code={k.code} name={k.name} size={size} />), ...(mouse ? [<MouseIcon key="m" button={mouse} size={size} />] : [])];
  return (
    <span className="inline-flex items-center gap-[3px] align-middle">
      {icons.map((icon, i) => <React.Fragment key={i}>{i > 0 && <span className={join === '+' ? 'text-yellow-300 text-[10px] px-[1px]' : 'text-zinc-400 px-[1px]'}>{join}</span>}{icon}</React.Fragment>)}
      <span className="ml-1">{label}</span>
    </span>
  );
};

export default ChordPrompt;
