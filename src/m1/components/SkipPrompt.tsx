import React from 'react';
import { SKIP_LABEL } from '../game/platform/skip';
import { Prompt } from './ButtonIcons';

/** SKIP >> in the top-right corner, where every cutscene has it (the stages draw the same thing on the canvas), with
 * the button that does it (Start on a controller, Esc on the keyboard: whichever's in use). */
const SkipPrompt: React.FC<{ onSkip: () => void }> = ({ onSkip }) => (
  <button
    onMouseDown={e => { e.stopPropagation(); onSkip(); }}
    className="absolute right-[24px] top-[66px] z-10 text-[8px] leading-none text-white/75 hover:text-white">
    <Prompt pad={['START']} kb={['ESC']} label={SKIP_LABEL} size={14} />
  </button>
);

export default SkipPrompt;
