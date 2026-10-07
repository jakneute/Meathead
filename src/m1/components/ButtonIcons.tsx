import React from 'react';
import { useInputDevice, usePadFamily } from './useInputDevice';
import type { PadFamily } from '../game/platform/device';
import { padIs360 } from '../game/platform/device';

// Button prompts, drawn as the buttons themselves, for whichever you're using right now: a controller's buttons if
// the controller was the last thing touched, the keyboard's keys (and the mouse) if it was the keyboard or the mouse.
// They change over the moment you switch.

/**
 * A controller's buttons, by where they are (the layout every controller shares): A the bottom face button, B the
 * right, X the left, Y the top; Start; the bumpers; the D-pad. And the menu's two: OK (confirm) and BACK, which are
 * the bottom and right buttons on an Xbox or a PlayStation, and the right and bottom on a Switch (its A, on the right,
 * confirms; its B, on the bottom, goes back). What's printed on them depends on whose controller it is: an Xbox's
 * letters, a PlayStation's shapes, a Switch's letters (the other way round to an Xbox's).
 */
export type PadKey = 'A' | 'B' | 'X' | 'Y' | 'START' | 'LB' | 'RB' | 'DPAD' | 'DPAD_UP' | 'DPAD_DOWN' | 'DPAD_LEFT' | 'DPAD_RIGHT' | 'RSTICK' | 'OK' | 'BACK';
type Face = 'A' | 'B' | 'X' | 'Y';
const XBOX_COLORS: Record<Face, string> = { A: '#22C55E', B: '#EF4444', X: '#3B82F6', Y: '#FACC15' };
const PS_SHAPES: Record<Face, { shape: 'cross' | 'circle' | 'square' | 'triangle'; color: string }> = {
  A: { shape: 'cross', color: '#7DD3FC' }, B: { shape: 'circle', color: '#F87171' }, X: { shape: 'square', color: '#F9A8D4' }, Y: { shape: 'triangle', color: '#6EE7B7' },
};
/** What a Switch prints on each spot (bottom B, right A, left Y, top X). */
const SWITCH_LETTERS: Record<Face, string> = { A: 'B', B: 'A', X: 'Y', Y: 'X' };
/** What's printed on the other buttons, by kind of controller. */
const OTHER_NAMES: Record<PadFamily, Record<'START' | 'LB' | 'RB' | 'LT' | 'RT', string>> = {
  xbox: { START: 'START', LB: 'LB', RB: 'RB', LT: 'LT', RT: 'RT' },
  playstation: { START: 'OPTIONS', LB: 'L1', RB: 'R1', LT: 'L2', RT: 'R2' },
  switch: { START: '+', LB: 'L', RB: 'R', LT: 'ZL', RT: 'ZR' },
  // (one Joy-Con sideways: the little SL and SR on its rail are its shoulders; it's got no triggers)
  'joycon-l': { START: '−', LB: 'SL', RB: 'SR', LT: '', RT: '' },
  'joycon-r': { START: '+', LB: 'SL', RB: 'SR', LT: '', RT: '' },
};
const isJoyCon = (f: PadFamily) => f === 'joycon-l' || f === 'joycon-r';
const FONT = '"Press Start 2P", monospace';

/** Where the menu's confirm and back are on this kind of controller. */
const menuSpot = (k: 'OK' | 'BACK', family: PadFamily): Face => (family === 'switch' || isJoyCon(family) ? (k === 'OK' ? 'B' : 'A') : (k === 'OK' ? 'A' : 'B'));

/** A button's name as it's printed on this kind of controller (for text: the controls guide). */
export const padName = (k: string, family: PadFamily): string => {
  // (a Joy-Con on its side: its four buttons go by which way round they are)
  if ((k === 'A' || k === 'B' || k === 'X' || k === 'Y') && isJoyCon(family)) return ({ A: '▼', B: '▶', X: '◀', Y: '▲' } as const)[k];
  if (k === 'A' || k === 'B' || k === 'X' || k === 'Y') return family === 'playstation' ? ({ A: '✕', B: '○', X: '□', Y: '△' } as const)[k] : family === 'switch' ? SWITCH_LETTERS[k] : k;
  // (an Xbox One / Series pad's START is its Menu button; a 360's says START)
  if (k === 'START' && family === 'xbox') return padIs360() ? 'START' : 'MENU';
  if (k in OTHER_NAMES.xbox) return OTHER_NAMES[family][k as keyof typeof OTHER_NAMES.xbox];
  return k;
};

/** A controller's face button (by where it is): round, with what that controller prints on it. */
export const PadButton: React.FC<{ label: Face; size?: number; family?: PadFamily }> = ({ label, size = 36, family = 'xbox' }) => {
  const ps = PS_SHAPES[label];
  // One Joy-Con on its side: its four little buttons in their diamond, the one that's meant filled in
  if (isJoyCon(family as PadFamily)) {
    const spots: Record<Face, [number, number]> = { A: [20, 30], B: [30, 20], X: [10, 20], Y: [20, 10] };
    return (
      <svg viewBox="0 0 40 40" width={size} height={size} className="inline-block align-middle shrink-0">
        <circle cx="20" cy="20" r="19" fill="#27272A" stroke="#0B0B0F" strokeWidth="2" />
        {(Object.keys(spots) as Face[]).map(f => <circle key={f} cx={spots[f][0]} cy={spots[f][1]} r="6" fill={f === label ? '#F4F4F5' : '#52525B'} stroke="#0B0B0F" strokeWidth="1.5" />)}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className="inline-block align-middle shrink-0">
      <circle cx="20" cy="22" r="17" fill="#0B0B0F" />
      <circle cx="20" cy="20" r="17" fill={family === 'switch' ? '#3F3F46' : '#27272A'} stroke="#0B0B0F" strokeWidth="2" />
      <circle cx="20" cy="19" r="14" fill={family === 'switch' ? '#52525B' : '#3F3F46'} />
      {family === 'playstation' ? (
        ps.shape === 'cross' ? <path d="M13 12 L27 26 M27 12 L13 26" stroke={ps.color} strokeWidth="3.5" strokeLinecap="round" />
        : ps.shape === 'circle' ? <circle cx="20" cy="19" r="7" fill="none" stroke={ps.color} strokeWidth="3.5" />
        : ps.shape === 'square' ? <rect x="13.5" y="12.5" width="13" height="13" fill="none" stroke={ps.color} strokeWidth="3.5" />
        : <path d="M20 11 L28 25 H12 Z" fill="none" stroke={ps.color} strokeWidth="3.2" strokeLinejoin="round" />
      ) : (
        <text x="20" y="26" textAnchor="middle" fontFamily={FONT} fontSize="16" fill={family === 'switch' ? '#F4F4F5' : XBOX_COLORS[label]}>{family === 'switch' ? SWITCH_LETTERS[label] : label}</text>
      )}
      <ellipse cx="14" cy="11" rx="5" ry="2.5" fill="rgba(255,255,255,0.18)" />
    </svg>
  );
};

/** The controller's other buttons: Start (a little pill), the bumpers (a wide rounded bar), the D-pad (a cross). */
type DpadDir = 'DPAD_UP' | 'DPAD_DOWN' | 'DPAD_LEFT' | 'DPAD_RIGHT';
const PadOther: React.FC<{ label: 'START' | 'LB' | 'RB' | 'DPAD' | DpadDir | 'RSTICK'; size: number; family?: PadFamily }> = ({ label, size, family = 'xbox' }) => {
  // (the right stick: a thumbstick seen from above, R on it, arrows up and down)
  if (label === 'RSTICK') return (
    <svg viewBox="0 0 40 40" width={size} height={size} className="inline-block align-middle shrink-0">
      <circle cx="20" cy="20" r="17" fill="#27272A" stroke="#0B0B0F" strokeWidth="2" />
      <circle cx="20" cy="20" r="11" fill="#3F3F46" stroke="#18181B" strokeWidth="2" />
      <text x="20" y="25" textAnchor="middle" fontFamily={FONT} fontSize="11" fill="#E4E4E7">R</text>
      <path d="M20 1 l3 4 h-6 Z M20 39 l3 -4 h-6 Z" fill="#A1A1AA" />
    </svg>
  );
  if (label === 'DPAD') return (
    <svg viewBox="0 0 40 40" width={size} height={size} className="inline-block align-middle shrink-0">
      <path d="M15 4 H25 V15 H36 V25 H25 V36 H15 V25 H4 V15 H15 Z" fill="#27272A" stroke="#0B0B0F" strokeWidth="2" />
      <path d="M20 8 l3 4 h-6 Z M20 32 l3 -4 h-6 Z M8 20 l4 3 v-6 Z M32 20 l-4 3 v-6 Z" fill="#A1A1AA" />
    </svg>
  );
  // (one way on the D-pad: that arm lit, its arrow bright, the rest dim)
  if (label === 'DPAD_UP' || label === 'DPAD_DOWN' || label === 'DPAD_LEFT' || label === 'DPAD_RIGHT') {
    const arm = { DPAD_UP: 'M15 4 H25 V15 H15 Z', DPAD_DOWN: 'M15 25 H25 V36 H15 Z', DPAD_LEFT: 'M4 15 H15 V25 H4 Z', DPAD_RIGHT: 'M25 15 H36 V25 H25 Z' }[label];
    const arrows = { DPAD_UP: 'M20 7 l4 5 h-8 Z', DPAD_DOWN: 'M20 33 l4 -5 h-8 Z', DPAD_LEFT: 'M7 20 l5 4 v-8 Z', DPAD_RIGHT: 'M33 20 l-5 4 v-8 Z' };
    return (
      <svg viewBox="0 0 40 40" width={size} height={size} className="inline-block align-middle shrink-0">
        <path d="M15 4 H25 V15 H36 V25 H25 V36 H15 V25 H4 V15 H15 Z" fill="#27272A" stroke="#0B0B0F" strokeWidth="2" />
        <path d={arm} fill="#FACC15" />
        {(Object.keys(arrows) as DpadDir[]).map(d => <path key={d} d={arrows[d]} fill={d === label ? '#18181B' : '#52525B'} />)}
      </svg>
    );
  }
  const name = OTHER_NAMES[family][label];
  // (a Switch's + is a little round button of its own)
  if (label === 'START' && (family === 'switch' || isJoyCon(family as PadFamily))) return (
    <svg viewBox="0 0 40 40" width={size} height={size} className="inline-block align-middle shrink-0">
      <circle cx="20" cy="20" r="13" fill="#27272A" stroke="#0B0B0F" strokeWidth="2" />
      <path d={family === 'joycon-l' ? 'M13 20 H27' : 'M20 13 V27 M13 20 H27'} stroke="#E4E4E7" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
  // (an Xbox's: the newer pads' Menu button, three lines on a little round button; a 360's, round and silver, an arrow)
  if (label === 'START' && family === 'xbox') return padIs360() ? (
    <svg viewBox="0 0 40 40" width={size} height={size} className="inline-block align-middle shrink-0">
      <circle cx="20" cy="20" r="13" fill="#D4D4D8" stroke="#0B0B0F" strokeWidth="2" />
      <circle cx="20" cy="19" r="10.5" fill="#E4E4E7" />
      <path d="M16 13.5 L26 20 L16 26.5 Z" fill="#3F3F46" />
    </svg>
  ) : (
    <svg viewBox="0 0 40 40" width={size} height={size} className="inline-block align-middle shrink-0">
      <circle cx="20" cy="20" r="13" fill="#27272A" stroke="#0B0B0F" strokeWidth="2" />
      <path d="M13 15 H27 M13 20 H27 M13 25 H27" stroke="#E4E4E7" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
  const w = label === 'START' ? Math.max(60, 20 + name.length * 9) : 50;
  return (
    <svg viewBox={`0 0 ${w} 40`} width={(size * w) / 40} height={size} className="inline-block align-middle shrink-0">
      <rect x="2" y={label === 'START' ? 10 : 6} width={w - 4} height={label === 'START' ? 22 : 28} rx={label === 'START' ? 11 : 9} fill="#27272A" stroke="#0B0B0F" strokeWidth="2" />
      <text x={w / 2} y={label === 'START' ? 26 : 25} textAnchor="middle" fontFamily={FONT} fontSize={label === 'START' ? 9 : 12} fill="#E4E4E7">{name}</text>
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

export const PadIcon: React.FC<{ k: PadKey; size?: number; family?: PadFamily }> = ({ k, size = 36, family = 'xbox' }) => {
  const at = k === 'OK' || k === 'BACK' ? menuSpot(k, family as PadFamily) : k;
  return at === 'A' || at === 'B' || at === 'X' || at === 'Y' ? <PadButton label={at} size={size} family={family} /> : <PadOther label={at} size={size} family={family} />;
};

/**
 * A prompt: the buttons that do it on whatever you're using (a controller's, or the keyboard's keys and the mouse's
 * buttons), then what it does. `kb` are key names; `mouse` the mouse button that does it too.
 */
export const Prompt: React.FC<{ pad?: PadKey[]; kb?: string[]; mouse?: 'left' | 'right' | 'wheel'; label?: string; size?: number; className?: string }> = ({ pad = [], kb = [], mouse, label, size = 14, className = '' }) => {
  const device = useInputDevice(), family = usePadFamily();
  const icons = device === 'pad'
    ? pad.map(k => <PadIcon key={k} k={k} size={size} family={family} />)
    : [...kb.map(k => <KeyCap key={k} label={k} size={size} />), ...(mouse ? [<MouseIcon key="m" button={mouse} size={size} />] : [])];
  if (!icons.length) return label ? <span className={className}>{label}</span> : null;
  return (
    <span className={`inline-flex items-center gap-[3px] align-middle ${className}`}>
      {icons}
      {label && <span className="ml-1">{label}</span>}
    </span>
  );
};
