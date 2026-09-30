import React from 'react';
import { useInputDevice } from './useInputDevice';

// Button prompts, drawn as the buttons themselves, for whichever you're using right now: a controller's buttons if
// the controller was the last thing touched, the keyboard's keys (and the mouse) if it was the keyboard or the mouse.
// They change over the moment you switch.

export type PadKey = 'A' | 'B' | 'X' | 'Y' | 'START' | 'LB' | 'RB' | 'DPAD';
const PAD_COLORS: Record<string, string> = { A: '#22C55E', B: '#EF4444', X: '#3B82F6', Y: '#FACC15' };
const FONT = '"Press Start 2P", monospace';

/** A controller's face button: round, the letter on it in the button's color. */
export const PadButton: React.FC<{ label: 'A' | 'B' | 'X' | 'Y'; size?: number }> = ({ label, size = 36 }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} className="inline-block align-middle shrink-0">
    <circle cx="20" cy="22" r="17" fill="#0B0B0F" />
    <circle cx="20" cy="20" r="17" fill="#27272A" stroke="#0B0B0F" strokeWidth="2" />
    <circle cx="20" cy="19" r="14" fill="#3F3F46" />
    <text x="20" y="26" textAnchor="middle" fontFamily={FONT} fontSize="16" fill={PAD_COLORS[label]}>{label}</text>
    <ellipse cx="14" cy="11" rx="5" ry="2.5" fill="rgba(255,255,255,0.18)" />
  </svg>
);

/** The controller's other buttons: Start (a little pill), the bumpers (a wide rounded bar), the D-pad (a cross). */
const PadOther: React.FC<{ label: 'START' | 'LB' | 'RB' | 'DPAD'; size: number }> = ({ label, size }) => {
  if (label === 'DPAD') return (
    <svg viewBox="0 0 40 40" width={size} height={size} className="inline-block align-middle shrink-0">
      <path d="M15 4 H25 V15 H36 V25 H25 V36 H15 V25 H4 V15 H15 Z" fill="#27272A" stroke="#0B0B0F" strokeWidth="2" />
      <path d="M20 8 l3 4 h-6 Z M20 32 l3 -4 h-6 Z M8 20 l4 3 v-6 Z M32 20 l-4 3 v-6 Z" fill="#A1A1AA" />
    </svg>
  );
  const w = label === 'START' ? 60 : 50;
  return (
    <svg viewBox={`0 0 ${w} 40`} width={(size * w) / 40} height={size} className="inline-block align-middle shrink-0">
      <rect x="2" y={label === 'START' ? 10 : 6} width={w - 4} height={label === 'START' ? 22 : 28} rx={label === 'START' ? 11 : 9} fill="#27272A" stroke="#0B0B0F" strokeWidth="2" />
      <text x={w / 2} y={label === 'START' ? 26 : 25} textAnchor="middle" fontFamily={FONT} fontSize={label === 'START' ? 9 : 12} fill="#E4E4E7">{label}</text>
    </svg>
  );
};

/** A keyboard key: a keycap, the key's name on it (wider for a longer name). */
export const KeyCap: React.FC<{ label: string; size?: number }> = ({ label, size = 36 }) => {
  const w = Math.max(40, 18 + label.length * 11);
  return (
    <svg viewBox={`0 0 ${w} 40`} width={(size * w) / 40} height={size} className="inline-block align-middle shrink-0">
      <rect x="3" y="6" width={w - 6} height="32" rx="5" fill="#52525B" />
      <rect x="3" y="3" width={w - 6} height="30" rx="5" fill="#E4E4E7" stroke="#52525B" strokeWidth="2" />
      <rect x="8" y="6" width={w - 16} height="22" rx="3" fill="#F4F4F5" />
      <text x={w / 2} y="23" textAnchor="middle" fontFamily={FONT} fontSize={label.length > 1 ? 10 : 13} fill="#18181B">{label}</text>
    </svg>
  );
};

/** A mouse, the button that's meant lit up (left, right, or the wheel). */
export const MouseIcon: React.FC<{ button: 'left' | 'right' | 'wheel'; size?: number }> = ({ button, size = 36 }) => (
  <svg viewBox="0 0 30 40" width={(size * 30) / 40} height={size} className="inline-block align-middle shrink-0">
    <rect x="3" y="3" width="24" height="34" rx="11" fill="#E4E4E7" stroke="#52525B" strokeWidth="2" />
    <path d="M15 3 V16 M3 16 H27" stroke="#52525B" strokeWidth="2" />
    {button === 'left' && <path d="M5 16 V13 Q5 4 14 4 V16 Z" fill="#FACC15" />}
    {button === 'right' && <path d="M25 16 V13 Q25 4 16 4 V16 Z" fill="#FACC15" />}
    {button === 'wheel' && <rect x="13" y="7" width="4" height="7" rx="2" fill="#FACC15" />}
  </svg>
);

export const PadIcon: React.FC<{ k: PadKey; size?: number }> = ({ k, size = 36 }) =>
  k === 'A' || k === 'B' || k === 'X' || k === 'Y' ? <PadButton label={k} size={size} /> : <PadOther label={k} size={size} />;

/**
 * A prompt: the buttons that do it on whatever you're using (a controller's, or the keyboard's keys and the mouse's
 * buttons), then what it does. `kb` are key names; `mouse` the mouse button that does it too.
 */
export const Prompt: React.FC<{ pad?: PadKey[]; kb?: string[]; mouse?: 'left' | 'right' | 'wheel'; label?: string; size?: number; className?: string }> = ({ pad = [], kb = [], mouse, label, size = 14, className = '' }) => {
  const device = useInputDevice();
  const icons = device === 'pad'
    ? pad.map(k => <PadIcon key={k} k={k} size={size} />)
    : [...kb.map(k => <KeyCap key={k} label={k} size={size} />), ...(mouse ? [<MouseIcon key="m" button={mouse} size={size} />] : [])];
  if (!icons.length) return label ? <span className={className}>{label}</span> : null;
  return (
    <span className={`inline-flex items-center gap-[3px] align-middle ${className}`}>
      {icons}
      {label && <span className="ml-1">{label}</span>}
    </span>
  );
};
