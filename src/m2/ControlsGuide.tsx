import React, { useSyncExternalStore } from 'react';
import { PadIcon, BindingIcon, useBoundKeys, type PadKey } from '../m1/components/ButtonIcons';
import { useInputDevice, usePadFamily } from '../m1/components/useInputDevice';
import { subscribeKeys, keysVersion, keysFor, keyLabel } from '../m1/game/platform/keys';
import type { GuidePage } from '../m1/components/OptionsScreen';

// Meathead 2's CONTROLS page (the options screen's, OptionsScreen.tsx's guide pages): every move's name and its buttons,
// nothing else, for whatever's being played on right now (a controller's buttons, each family's as printed; or the
// keyboard's keys and the mouse's, as they're bound now: '@jump' and so on). One page: the moves.

/** One way to do it: buttons pressed together (+), or one after another / any of them (/). */
type Chord = { k: string[]; join?: '+' | '/' };
/** A move: its name, the controller's ways (positional buttons), the keyboard and mouse's ways. */
type Row = { label: string; pad: Chord[]; kb: Chord[]; dirs?: boolean };
type Section = { head: string; rows: Row[] };

const c = (join: '+' | '/', ...k: string[]): Chord => ({ k, join });
const one = (...k: string[]): Chord => ({ k });

const Sep: React.FC<{ s: string }> = ({ s }) => <span className={s === '+' ? 'text-yellow-300 text-[9px] px-[1px]' : 'text-zinc-500 px-[1px]'}>{s}</span>;

/** A keyboard chord: each '@action' its bound keys (the primary), plain names as they are. */
const KbChord: React.FC<{ ch: Chord }> = ({ ch }) => {
  const keys = useBoundKeys(ch.k);
  if (!keys.length) return <span className="text-red-500">NONE</span>;
  return <>{keys.map((k, i) => <React.Fragment key={i}>{i > 0 && <Sep s={ch.join ?? '/'} />}<BindingIcon code={k.code} name={k.name} size={12} /></React.Fragment>)}</>;
};

/** The four directions on the keyboard as sets: each set the n-th key bound to up, left, down, right (the arrows, WASD),
 *  the arrows' set first. */
const DirsKb: React.FC = () => {
  useSyncExternalStore(subscribeKeys, keysVersion, keysVersion);
  const per = (['up', 'left', 'down', 'right'] as const).map(a => keysFor(a));
  const n = Math.max(...per.map(k => k.length));
  const sets = Array.from({ length: n }, (_, i) => per.map(k => k[i]).filter((k): k is string => !!k)).filter(s => s.length)
    .sort((a, b) => Number(b.some(k => k.startsWith('arrow'))) - Number(a.some(k => k.startsWith('arrow'))));
  if (!sets.length) return <span className="text-red-500">NONE</span>;
  return <>{sets.map((s, i) => <React.Fragment key={i}>{i > 0 && <Sep s="/" />}{s.map((k, j) => <BindingIcon key={j} code={k} name={keyLabel(k)} size={12} />)}</React.Fragment>)}</>;
};

const RowView: React.FC<{ row: Row; pad: boolean }> = ({ row, pad }) => {
  const family = usePadFamily();
  const single = family === 'joycon-l' || family === 'joycon-r';
  const ways = pad ? row.pad.map(ch => ({ ...ch, k: single ? ch.k.filter(k => k !== 'RT' && k !== 'LT') : ch.k })).filter(ch => ch.k.length) : row.kb;
  if (!ways.length && !(row.dirs && !pad)) return null;
  return (
    <div className="flex items-center justify-between gap-2 border-b border-[#2c0c0c] py-[1px] min-h-[17px]">
      <span className="text-[#f4701c] font-bold tracking-wider">{row.label}</span>
      <span className="inline-flex items-center gap-[2px] shrink-0">
        {row.dirs && !pad ? <DirsKb /> : ways.map((ch, i) => (
          <React.Fragment key={i}>
            {i > 0 && <Sep s="/" />}
            {pad ? ch.k.map((k, j) => <React.Fragment key={j}>{j > 0 && <Sep s={ch.join ?? '/'} />}<PadIcon k={k as PadKey} size={12} family={family} /></React.Fragment>) : <KbChord ch={ch} />}
          </React.Fragment>
        ))}
      </span>
    </div>
  );
};

/** A page: its sections in two columns, the guide's own red box, the device it's showing up top. */
const Sheet: React.FC<{ left: Section[]; right: Section[] }> = ({ left, right }) => {
  const pad = useInputDevice() === 'pad', family = usePadFamily();
  useSyncExternalStore(subscribeKeys, keysVersion, keysVersion);
  const col = (ss: Section[]) => (
    <div className="flex flex-col gap-1">
      {ss.map(s => (
        <div key={s.head} className="flex flex-col">
          <span className="text-[#fcd850] font-bold tracking-widest [text-shadow:1px_1px_0_#000] mb-[1px]">{s.head}</span>
          {s.rows.map(r => <RowView key={r.label} row={r} pad={pad} />)}
        </div>
      ))}
    </div>
  );
  return (
    <div className="w-full shrink-0 font-mono uppercase text-[7px] leading-[12px] bg-black/85 border-2 border-[#7c1006] shadow-[0_0_0_2px_#000,inset_0_0_0_1px_#2c0402,5px_5px_0_2px_#000]">
      <div className="flex justify-between px-2.5 py-[3px] bg-[#5c0a08] border-b-2 border-black shadow-[inset_0_1px_0_#a81c08]">
        <span className="text-[#fcd850] font-bold tracking-widest [text-shadow:1px_1px_0_#000]">CONTROLS</span>
        <span className="text-[#fcd850] font-bold tracking-wider [text-shadow:1px_1px_0_#000]">{pad ? ({ xbox: 'CONTROLLER', playstation: 'PLAYSTATION CONTROLLER', switch: 'SWITCH CONTROLLER', 'joycon-l': 'JOY-CON (SIDEWAYS)', 'joycon-r': 'JOY-CON (SIDEWAYS)' } as const)[family] : 'KEYBOARD + MOUSE'}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 px-2.5 py-1">{col(left)}{col(right)}</div>
    </div>
  );
};

// ---- the moves (game/platform/input.ts readControls; App.tsx's weapons and pause; moves/grab.ts's grabs)
const MOVES: Section[] = [
  { head: 'BASICS', rows: [
    { label: 'MOVE / CROUCH', pad: [one('LSTICK'), one('DPAD')], kb: [], dirs: true },
    { label: 'JUMP', pad: [one('A')], kb: [one('@@jump')] },
    { label: 'FIRE', pad: [one('X'), one('RT')], kb: [one('@@fire')] },
    { label: 'SECONDARY FIRE (TAP)', pad: [one('Y')], kb: [one('@@secondary')] },
    { label: 'SPECIAL', pad: [one('B'), one('LT')], kb: [one('@@special')] },
    { label: 'USE / GO IN', pad: [one('DPAD_UP')], kb: [one('@up')] },
    { label: 'SWITCH WEAPON', pad: [c('/', 'LB', 'RB')], kb: [c('/', '@prevWeapon', '@nextWeapon'), one('1-9')] },
    { label: 'WEAPON WHEEL', pad: [one('RSTICK')], kb: [] },
    { label: 'PAUSE', pad: [one('START')], kb: [c('/', 'ESC', 'P')] },
  ] },
];
const MOVES_R: Section[] = [
  { head: 'CHARGE MOVES', rows: [
    { label: 'SHOULDER CHARGE', pad: [one('B')], kb: [one('@special'), one('@@charge')] },
    { label: 'SLIDE TACKLE', pad: [c('+', 'DPAD_DOWN', 'B')], kb: [c('+', '@down', '@special'), one('@downSpecial')] },
    { label: 'UPPERCUT', pad: [c('+', 'DPAD_UP', 'B')], kb: [c('+', '@up', '@special'), one('@uppercut')] },
    { label: 'DIVE KICK (IN THE AIR)', pad: [c('+', 'DPAD_DOWN', 'B')], kb: [c('+', '@down', '@special'), one('@downSpecial')] },
  ] },
  { head: 'GRABS', rows: [
    { label: 'BEATDOWN', pad: [c('+', 'Y', 'B')], kb: [one('@@beatdown')] },
    { label: 'SHAKEDOWN', pad: [c('+', 'Y', 'X')], kb: [one('@@shakedown')] },
    { label: 'AIR GRAB', pad: [c('+', 'A', 'B')], kb: [one('@@airGrab')] },
  ] },
];

// (only the general controls: no rides', vehicles' or set pieces' own; they're taught where they come up (the user's))
export const M2_GUIDE_PAGES: GuidePage[] = [
  { title: 'MOVES', body: <Sheet left={MOVES} right={MOVES_R} /> },
];
