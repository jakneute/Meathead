import React from 'react';
import { SKIP_LABEL } from '../game/platform/skip';

/** SKIP >> in the top-right corner, where every cutscene has it (the stages draw the same thing on the canvas). */
const SkipPrompt: React.FC<{ onSkip: () => void }> = ({ onSkip }) => (
  <button
    onMouseDown={e => { e.stopPropagation(); onSkip(); }}
    className="absolute right-[24px] top-[71px] z-10 text-[8px] leading-none text-white/75 hover:text-white">
    {SKIP_LABEL}
  </button>
);

export default SkipPrompt;
