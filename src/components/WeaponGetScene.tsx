import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Prompt } from './ButtonIcons';
import type { Souvenir } from '../content/garage';
import { GameStatus, WeaponType } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, RENDER_SCALE, PRACTICE_RANGE_STAGE } from '../constants';
import { BOSS_WEAPON_MAP, WEAPON_DESCRIPTIONS, getWeaponInfo } from '../content/roster';
import { createRange, stepRange, newRespawns } from '../game/range';
import { KeyboardMouseState, readControls } from '../game/platform/input';
import { PadButton, KeyCap } from './ButtonIcons';
import { useInputDevice } from './useInputDevice';
import { drawWorld } from '../game/render/world';
import { WeaponArt } from './WeaponIcon';
import { getActiveGamepad, isButtonPressed, GP_BUTTONS } from '../game/platform/gamepad';
import { SKIP_AFTER_MS } from '../game/platform/skip';
import SkipPrompt from './SkipPrompt';
import { playWhoosh, playPunchImpact, playThud, playTypeClack, playGlassShatterSound } from '../game/platform/audio';
import { speak, cancelSpeech, MEATHEAD_VOICE } from '../game/platform/speech';

// After a boss: fade out of the victory lap into a black void, face to face with
// Meathead in first person. He decks the camera; it goes down on its side. Then
// the new weapon's name is hammered out on the screen next to a photo of it
// and you get a firing range to try it out on a dummy that keeps
// coming back. Start / Esc moves on (and skips straight to the range before that).

// Timeline (ms)
const FADE_END = 600;
const FACE_IN_END = 1300;
const WINDUP = 2050;
const PUNCH = 2330;
const IMPACT = 2480;
const FALL_END = 3250;
const BLACKOUT = 3500;
const REVEAL = 3800;
const HEADER_AT = REVEAL + 150;
const HEADER_MS = 32;
const NAME_MS = 95;
const RANGE_DELAY = 900;

const HEADER = 'NEW WEAPON ACQUIRED';
const FRAME_MS = 1000 / 60;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeIn = (v: number) => v * v * v;
const easeOutBounce = (x: number) => {
  const n = 7.5625, d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
  return n * (x -= 2.625 / d) * x + 0.984375;
};

interface Props {
  /** The boss just beaten (his weapon is the prize). */
  stageId: string | null;
  /** What he took home from him for the garage (if there was anything new to take). */
  souvenirs?: Souvenir[];
  onDone: () => void;
}

const WeaponGetScene: React.FC<Props> = ({ stageId, souvenirs, onDone }) => {
  const weapon: WeaponType = (stageId && BOSS_WEAPON_MAP[stageId]) || 'GUN';
  const name = getWeaponInfo(weapon).name.toUpperCase();
  const description = (stageId && WEAPON_DESCRIPTIONS[stageId]) || '';
  const nameAt = HEADER_AT + HEADER.length * HEADER_MS + 200;
  const rangeAt = nameAt + name.length * NAME_MS + RANGE_DELAY;

  const [t, setT] = useState(0);
  const startRef = useRef(performance.now());
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const finish = () => { if (!doneRef.current) { doneRef.current = true; onDoneRef.current(); } };
  const rangeCanvas = useRef<HTMLCanvasElement>(null);
  const range = useMemo(() => createRange(weapon, PRACTICE_RANGE_STAGE), [weapon]);

  useEffect(() => {
    const kb = new KeyboardMouseState();
    const detach = kb.attach(window);
    const fired = new Set<string>();
    const once = (key: string, at: number, now: number, fn: () => void) => { if (now >= at && !fired.has(key)) { fired.add(key); fn(); } };
    let typedHeader = 0, typedName = 0;
    let lastStep = 0;
    const respawns = newRespawns();
    let padStartHeld = true; // ignore a Start that's still held from before
    let id = 0;

    const skipOrContinue = () => {
      const now = performance.now() - startRef.current;
      if (now < SKIP_AFTER_MS) return;
      if (now < rangeAt) {
        startRef.current = performance.now() - rangeAt;
        cancelSpeech();
      } else {
        finish();
      }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); skipOrContinue(); } };
    window.addEventListener('keydown', onKey);

    const loop = (wall: number) => {
      const now = wall - startRef.current;
      setT(now);

      // Sound cues
      once('whoosh', PUNCH, now, playWhoosh);
      once('taunt', WINDUP - 250, now, () => speak('Get that camera outta my face.', MEATHEAD_VOICE));
      once('impact', IMPACT, now, () => { playPunchImpact(); playGlassShatterSound(); });
      once('thud', IMPACT + 420, now, playThud);
      once('slam', REVEAL, now, () => playTypeClack(true));
      const h = Math.min(HEADER.length, Math.max(0, Math.floor((now - HEADER_AT) / HEADER_MS)));
      if (h > typedHeader) { typedHeader = h; if (HEADER[h - 1] !== ' ') playTypeClack(false); }
      const n = Math.min(name.length, Math.max(0, Math.floor((now - nameAt) / NAME_MS) + 1));
      if (now >= nameAt && n > typedName) { typedName = n; if (name[n - 1] !== ' ') playTypeClack(true); }

      // Gamepad Start
      const gp = getActiveGamepad();
      const start = !!gp && (isButtonPressed(gp, GP_BUTTONS.START) || isButtonPressed(gp, GP_BUTTONS.SELECT));
      if (start && !padStartHeld) skipOrContinue();
      padStartHeld = start;

      // The firing range, at a fixed 60fps
      const rc = rangeCanvas.current?.getContext('2d');
      if (rc && now >= rangeAt) {
        if (lastStep === 0) lastStep = wall;
        let steps = 0;
        while (wall - lastStep >= FRAME_MS - 2 && steps < 4) {
          lastStep += FRAME_MS;
          steps++;
          stepRange(range, readControls(kb), weapon, respawns);
        }
        if (lastStep < wall - 200) lastStep = wall; // tab was hidden: don't fast-forward
        rc.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
        drawWorld(rc, range, { status: GameStatus.PLAYING, stageId: PRACTICE_RANGE_STAGE, currentWeapon: weapon, invincibilityEnabled: false, bossTauntText: '' });
      }
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(id);
      detach();
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weapon, name, nameAt, rangeAt, range]);

  // --- Derived animation values -------------------------------------------------
  const fade = clamp01(t / FADE_END);
  const faceIn = clamp01((t - FADE_END) / (FACE_IN_END - FADE_END));
  const windup = clamp01((t - WINDUP) / (PUNCH - WINDUP));
  const punch = clamp01((t - PUNCH) / (IMPACT - PUNCH));
  const fall = clamp01((t - IMPACT - 60) / (FALL_END - IMPACT - 60));
  const flash = t >= IMPACT ? clamp01(1 - (t - IMPACT) / 320) : 0;
  const blackout = clamp01((t - BLACKOUT) / (REVEAL - BLACKOUT));
  const inCinematic = t < REVEAL;
  const inRange = t >= rangeAt;
  const punching = t >= PUNCH && t < IMPACT;
  const shake = t >= IMPACT && t < IMPACT + 250 ? (Math.random() - 0.5) * 24 : 0;
  const header = HEADER.slice(0, Math.max(0, Math.floor((t - HEADER_AT) / HEADER_MS)));
  const typed = t >= nameAt ? name.slice(0, Math.floor((t - nameAt) / NAME_MS) + 1) : '';
  const jolt = t >= nameAt && t < rangeAt - RANGE_DELAY + 120 && (t - nameAt) % NAME_MS < 45 ? (Math.random() - 0.5) * 8 : 0;
  const slam = clamp01((t - REVEAL) / 180);

  return (
    <div className="absolute inset-0 z-[70] overflow-hidden select-none" style={{ fontFamily: '"Press Start 2P", monospace' }}>
      {/* Fade out of the victory lap */}
      <div className="absolute inset-0 bg-black" style={{ opacity: fade }} />

      {/* First person: face to face with Meathead in the void */}
      {inCinematic && t >= FADE_END && (
        <div className="absolute inset-0" style={{ transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
          <div className="absolute inset-0"
            style={{
              // The camera tips over onto its side: the world swings round and settles, bouncing. Lying on the
              // floor it takes all of him in, boots and all
              transformOrigin: '50% 50%',
              transform: `translate(${easeOutBounce(fall) * 190}px, ${-easeOutBounce(fall) * 20}px) rotate(${easeOutBounce(fall) * 82}deg) scale(${1 - fall * 0.4})`,
            }}>
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 58%, rgba(127,29,29,0.55) 0%, rgba(20,0,0,0.6) 35%, #000 70%)' }} />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[40px] w-[560px] h-[60px] rounded-[50%]" style={{ background: 'radial-gradient(ellipse, rgba(239,68,68,0.25), transparent 70%)' }} />
            <div className="absolute left-1/2 top-[40px]" style={{ width: 520, height: 1144, marginLeft: -260, opacity: faceIn, filter: 'drop-shadow(0 0 22px rgba(239,68,68,0.45))', transform: `scale(${0.88 + faceIn * 0.12}) rotate(${-windup * 5 + punch * 7}deg)`, transformOrigin: '50% 43%' }}>
              <FaceOffMeathead t={t} windup={windup} punching={punching || (t >= IMPACT && t < IMPACT + 180)} />
            </div>
          </div>

          {/* The fist, coming straight at the lens */}
          {punching && (
            <>
              <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.25 + punch * 0.6 }}>
                {Array.from({ length: 26 }, (_, i) => {
                  const a = (i / 26) * Math.PI * 2;
                  return <line key={i} x1={400 + Math.cos(a) * 140} y1={300 + Math.sin(a) * 140} x2={400 + Math.cos(a) * 600} y2={300 + Math.sin(a) * 600} stroke="#fff" strokeWidth={2 + (i % 3)} />;
                })}
              </svg>
              <div className="absolute left-1/2 top-1/2 w-[240px] h-[240px] -ml-[120px] -mt-[120px]"
                style={{ transform: `translate(${(1 - punch) * 90}px, ${(1 - punch) * 40}px) scale(${0.3 + easeIn(punch) * 6})` }}>
                <GiantFist />
              </div>
            </>
          )}

          {/* The lens took it: cracked glass that stays put while the camera falls */}
          {t >= IMPACT && <LensCrack />}
          <div className="absolute inset-0 bg-white pointer-events-none" style={{ opacity: flash }} />
        </div>
      )}
      <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: inCinematic ? blackout : 0 }} />

      {/* The firing range under everything else */}
      {t >= REVEAL && (
        <>
          <div className="absolute inset-0 bg-black" style={{ opacity: inRange ? 0 : 1, transition: 'opacity 500ms' }} />
          <canvas ref={rangeCanvas} width={CANVAS_WIDTH * RENDER_SCALE} height={CANVAS_HEIGHT * RENDER_SCALE}
            className="absolute inset-0 w-full h-full" style={{ opacity: inRange ? 1 : 0, transition: 'opacity 600ms' }} />
          {!inRange && <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(153,27,27,0.45), transparent 60%)' }} />}
        </>
      )}

      {/* The weapon's photo, on its own */}
      {t >= REVEAL && (
        <div className="absolute pointer-events-none"
          style={{
            width: 190, height: 214,
            left: inRange ? 800 - 118 : 455, top: inRange ? 8 : 118,
            transform: `scale(${inRange ? 0.55 : 1.9 - slam * 0.6}) rotate(${inRange ? 3 : 2}deg)`,
            transformOrigin: 'top left',
            transition: 'left 500ms, top 500ms, transform 500ms',
          }}>
          <PortraitFrame>
            <div className="w-[170px] h-[172px] flex items-center justify-center drop-shadow-[0_6px_0_rgba(0,0,0,0.6)]">
              <WeaponArt type={weapon} size={150} />
            </div>
          </PortraitFrame>
        </div>
      )}

      {/* The name, hammered out */}
      {t >= REVEAL && !inRange && (
        <div className="absolute left-[50px] top-[170px] w-[400px]" style={{ transform: `translate(${jolt}px, ${jolt * 0.5}px)` }}>
          <div className="text-[11px] text-red-500 tracking-[0.2em] mb-4 [text-shadow:2px_2px_0_#000]">{header}<Caret on={header.length < HEADER.length} /></div>
          <div className="text-[34px] leading-[1.15] text-yellow-300 italic [text-shadow:3px_3px_0_#7F1D1D,6px_6px_0_#000]">
            {typed}<Caret on={t >= nameAt && typed.length < name.length} big />
          </div>
        </div>
      )}

      {/* On the range: what it does, and how to leave */}
      {inRange && (
        <>
          <div className="absolute left-0 right-[120px] top-0 px-4 pt-3 pb-3 animate-in fade-in slide-in-from-top-4 duration-500"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 80%, transparent 100%)' }}>
            <div className="flex items-baseline gap-3">
              <span className="text-[9px] text-red-500 tracking-widest">NEW WEAPON</span>
              <span className="text-[15px] text-yellow-300 italic [text-shadow:2px_2px_0_#7F1D1D]">{name}</span>
            </div>
            <p className="mt-2 text-[8px] leading-[14px] text-white/90 uppercase">{description}</p>
            <p className="mt-2 text-[7px] text-cyan-400/90 tracking-wider">TEST IT ON THE HIRED HELP: A WANNABE BOXER WHO ANSWERED AN AD, AND A GUY ON BALLOONS. DON'T ASK. INFINITE AMMO.</p>
            {!!souvenirs?.length && <p className="mt-2 text-[7px] text-yellow-300 tracking-wider">{souvenirs.length > 1 ? 'SOUVENIRS' : 'SOUVENIR'} FOR THE GARAGE: {souvenirs.map(s => s.name).join(', ')}</p>}
            {/* (under all that, on its own: not part of what the weapon is) */}
            {weapon === 'OIL_ROCKET' && <FlameCallout />}
          </div>
          <button onClick={finish}
            className="absolute right-3 bottom-3 px-3 py-2 text-[9px] text-black bg-yellow-400 border-2 border-black shadow-[3px_3px_0_#000] animate-pulse">
            <span className="inline-flex items-center gap-2"><Prompt pad={['START']} kb={['ESC']} size={14} />CONTINUE ▶</span>
          </button>
        </>
      )}

      {/* Skip hint during the cinematic */}
      {!inRange && t > SKIP_AFTER_MS && (
        <SkipPrompt onSkip={() => { startRef.current = performance.now() - rangeAt; cancelSpeech(); }} />
      )}
    </div>
  );
};

const Caret: React.FC<{ on: boolean; big?: boolean }> = ({ on, big }) =>
  on ? <span className={`inline-block align-middle bg-current animate-pulse ${big ? 'w-[18px] h-[30px] ml-1' : 'w-[8px] h-[11px] ml-1'}`} /> : null;

/** A gold-framed, ray-burst photo card. */
const PortraitFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative p-[6px] bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 border-4 border-black shadow-[6px_6px_0_#000]">
    <div className="relative w-[170px] h-[184px] overflow-hidden border-2 border-black flex items-end justify-center"
      style={{ background: 'radial-gradient(circle at 50% 60%, #7F1D1D 0%, #1C0606 70%)' }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
        {Array.from({ length: 12 }, (_, i) => <path key={i} d="M50 60 L46 -40 L54 -40 Z" fill="#FCA5A5" transform={`rotate(${i * 30} 50 60)`} />)}
      </svg>
      <div className="relative">{children}</div>
    </div>
    <div className="mt-[4px] text-center text-[7px] text-black tracking-widest">PROPERTY OF U.S. GOV'T</div>
  </div>
);

/** The glass in front of the lens after a direct hit. */
const LensCrack: React.FC = () => (
  <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full pointer-events-none">
    <g stroke="#000" strokeWidth="5" fill="none" strokeLinejoin="round" opacity="0.8">
      <path d="M400 300 L470 250 L520 262 L610 170 L700 150 L800 90" />
      <path d="M400 300 L330 260 L300 210 L210 170 L120 60" />
      <path d="M400 300 L380 380 L420 440 L400 520 L430 600" />
      <path d="M400 300 L480 330 L560 380 L640 390 L800 470" />
      <path d="M400 300 L320 330 L250 400 L150 430 L0 520" />
      <path d="M400 300 L420 220 L400 150 L430 60 L420 0" />
    </g>
    <g stroke="#fff" strokeWidth="2" fill="none" strokeLinejoin="round" opacity="0.9">
      <path d="M400 300 L470 250 L520 262 L610 170 L700 150 L800 90" />
      <path d="M400 300 L330 260 L300 210 L210 170 L120 60" />
      <path d="M400 300 L380 380 L420 440 L400 520 L430 600" />
      <path d="M400 300 L480 330 L560 380 L640 390 L800 470" />
      <path d="M400 300 L320 330 L250 400 L150 430 L0 520" />
      <path d="M400 300 L420 220 L400 150 L430 60 L420 0" />
      <path d="M455 262 Q470 300 480 330 M345 268 Q350 310 320 330 M395 360 Q360 330 330 330" />
      <circle cx="400" cy="300" r="26" />
      <circle cx="400" cy="300" r="62" strokeDasharray="14 22" />
    </g>
    <circle cx="400" cy="300" r="14" fill="#fff" opacity="0.7" />
  </svg>
);

/** A fist seen knuckles-first, wrist wrap and all. */
const GiantFist: React.FC = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
    <defs>
      <radialGradient id="wg-fist" cx="45%" cy="35%" r="75%">
        <stop offset="0%" stopColor="#FBE3C4" />
        <stop offset="50%" stopColor="#E0AC69" />
        <stop offset="100%" stopColor="#8A5424" />
      </radialGradient>
    </defs>
    {/* Wrist wrap behind */}
    <rect x="58" y="140" width="84" height="50" rx="8" fill="#18181B" stroke="#000" strokeWidth="6" />
    <path d="M70 150 l4 -8 l4 8 M92 150 l4 -8 l4 8 M114 150 l4 -8 l4 8" fill="#E5E7EB" stroke="#000" strokeWidth="1.5" />
    {/* Back of the fist */}
    <rect x="34" y="40" width="132" height="116" rx="38" fill="url(#wg-fist)" stroke="#000" strokeWidth="7" />
    {/* Four knuckles */}
    {[52, 82, 112, 142].map(x => <ellipse key={x} cx={x} cy="58" rx="16" ry="14" fill="#F5D0A9" stroke="#000" strokeWidth="5" />)}
    {[52, 82, 112, 142].map(x => <ellipse key={`h${x}`} cx={x - 4} cy="53" rx="6" ry="4" fill="#FFF7ED" opacity="0.8" />)}
    {/* Curled fingers */}
    <path d="M67 60 L67 118 M97 60 L97 120 M127 60 L127 118" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
    <path d="M40 96 Q100 108 160 96" stroke="#8A5424" strokeWidth="3" fill="none" />
    {/* Thumb across the front */}
    <path d="M36 118 Q60 104 108 112 Q124 116 120 132 Q104 146 44 140 Z" fill="url(#wg-fist)" stroke="#000" strokeWidth="6" strokeLinejoin="round" />
    <path d="M106 116 Q116 120 114 130" stroke="#78350F" strokeWidth="3" fill="none" />
    {/* Split-knuckle blood from the last guy */}
    <path d="M80 50 q3 8 0 14 M112 52 q2 6 -1 12" stroke="#B91C1C" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

/**
 * Meathead from the front, square to the camera in a boxing guard: the same
 * build as the title-screen portrait. His right fist draws back on the wind-up
 * and is gone (it's coming at you) during the punch.
 */
export const FaceOffMeathead: React.FC<{ t: number; windup: number; punching: boolean }> = ({ t, windup, punching }) => {
  const breathe = 1 + Math.sin(t / 420) * 0.012;
  const glint = Math.floor(t / 90) % 30 === 0;
  return (
    <svg viewBox="0 0 200 440" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id="wg-skin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5D0A9" />
          <stop offset="50%" stopColor="#E0AC69" />
          <stop offset="100%" stopColor="#C68B45" />
        </linearGradient>
        <radialGradient id="wg-bulge" cx="40%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FBE3C4" />
          <stop offset="45%" stopColor="#E0AC69" />
          <stop offset="100%" stopColor="#A86E32" />
        </radialGradient>
        <linearGradient id="wg-trap" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D69A55" />
          <stop offset="100%" stopColor="#9C6530" />
        </linearGradient>
        <linearGradient id="wg-hair" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3F3F46" />
          <stop offset="100%" stopColor="#09090B" />
        </linearGradient>
        <pattern id="wg-stubble" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.6" fill="#5B3413" opacity="0.55" />
          <circle cx="3" cy="3" r="0.5" fill="#5B3413" opacity="0.45" />
        </pattern>
      </defs>

      <g transform={`translate(100 200) scale(${breathe}) translate(-100 -200)`}>
        {/* Legs: navy tactical pants in a wide boxer's stance, combat boots with steel toes
            (off the bottom of the frame until the camera goes over on its side) */}
        <path d="M58 244 L46 404 L94 404 L100 290 Z" fill="#1E3A8A" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
        <path d="M142 244 L154 404 L106 404 L100 290 Z" fill="#1E3A8A" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
        <path d="M100 262 L100 292 M70 300 L64 380 M130 300 L136 380" stroke="#172554" strokeWidth="4" strokeLinecap="round" />
        <path d="M60 330 L90 330 M140 330 L110 330" stroke="#172554" strokeWidth="3" />
        <rect x="56" y="340" width="30" height="18" rx="6" fill="#27272A" stroke="#000" strokeWidth="3" />
        <rect x="114" y="340" width="30" height="18" rx="6" fill="#27272A" stroke="#000" strokeWidth="3" />
        <path d="M40 402 L98 402 L100 432 L36 432 Z" fill="#18181B" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
        <path d="M160 402 L102 402 L100 432 L164 432 Z" fill="#18181B" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
        <path d="M36 420 L54 420 L54 432 L36 432 Z M164 420 L146 420 L146 432 L164 432 Z" fill="#94A3B8" stroke="#000" strokeWidth="2" />
        {/* Lats and traps */}
        <path d="M44 104 L22 170 L64 200 Z M156 104 L178 170 L136 200 Z" fill="#9C6530" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
        <path d="M46 102 L76 58 L124 58 L154 102 Z" fill="url(#wg-trap)" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
        <path d="M78 64 L60 94 M122 64 L140 94" stroke="#7C4A1E" strokeWidth="2" strokeLinecap="round" />

        {/* Torso, pecs, abs */}
        <path d="M50 100 L60 240 L140 240 L150 100 Z" fill="url(#wg-skin)" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
        <path d="M54 100 C54 132 96 138 98 106 C98 95 64 94 54 100 Z" fill="url(#wg-bulge)" stroke="#000" strokeWidth="3.5" />
        <path d="M146 100 C146 132 104 138 102 106 C102 95 136 94 146 100 Z" fill="url(#wg-bulge)" stroke="#000" strokeWidth="3.5" />
        <line x1="100" y1="95" x2="100" y2="240" stroke="#78350F" strokeWidth="3.5" />
        <path d="M72 150 Q100 153 128 150 M74 172 Q100 175 126 172 M76 194 Q100 197 124 194" stroke="#78350F" strokeWidth="3" fill="none" />
        <path d="M60 110 Q80 106 92 114 M140 110 Q120 106 108 114" stroke="#F59E0B" strokeWidth="2" fill="none" opacity="0.5" />
        <circle cx="70" cy="110" r="2" fill="#fff" opacity="0.7" />
        <circle cx="116" cy="160" r="1.5" fill="#fff" opacity="0.6" />
        {/* The lifting belt and its gold buckle */}
        <path d="M57 222 L143 222 L144 250 L56 250 Z" fill="#78350F" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
        <path d="M60 229 H140 M60 243 H140" stroke="#5B2A0C" strokeWidth="1.5" />
        <rect x="88" y="224" width="24" height="24" rx="3" fill="#FACC15" stroke="#000" strokeWidth="3" />
        <rect x="95" y="231" width="10" height="10" fill="#78350F" />

        {/* Neck */}
        <path d="M78 64 L76 86 L124 86 L122 64 Z" fill="#C68B45" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
        <path d="M86 72 L90 84 M114 72 L110 84" stroke="#9C6530" strokeWidth="2" strokeLinecap="round" />

        {/* Head */}
        <path d="M68 40 Q60 42 62 52 Q64 58 69 56 Z M132 40 Q140 42 138 52 Q136 58 131 56 Z" fill="#D69A55" stroke="#000" strokeWidth="3" />
        <path d="M70 28 L130 28 L132 60 L120 74 L80 74 L68 60 Z" fill="url(#wg-skin)" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
        <path d="M72 58 Q100 80 128 58 L122 72 L78 72 Z" fill="#B07D48" opacity="0.35" />
        <path d="M72 58 Q100 80 128 58 L122 72 L78 72 Z" fill="url(#wg-stubble)" />
        <path d="M66 28 L134 28 L134 14 L66 14 Z" fill="url(#wg-hair)" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
        <path d="M70 14 v-2 M76 14 v-3 M82 14 v-2 M88 14 v-3 M94 14 v-2 M100 14 v-3 M106 14 v-2 M112 14 v-3 M118 14 v-2 M124 14 v-3 M130 14 v-2" stroke="#18181B" strokeWidth="2" />
        <rect x="66" y="28" width="6" height="18" fill="#27272A" />
        <rect x="128" y="28" width="6" height="18" fill="#27272A" />
        <path d="M76 33 L82 37 L79 43" stroke="#DC2626" strokeWidth={2.2 + windup * 1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Brows: lower and angrier as he winds up */}
        <polygon points={`71,${42 + windup} 97,${49 + windup * 1.5} 95,${43 + windup} 71,${38 + windup}`} fill="#09090B" stroke="#000" strokeWidth="1.5" />
        <polygon points={`129,${42 + windup} 103,${49 + windup * 1.5} 105,${43 + windup} 129,${38 + windup}`} fill="#09090B" stroke="#000" strokeWidth="1.5" />
        {/* Eyes, dead on the lens */}
        <ellipse cx="85" cy="50" rx="7" ry={4 - windup * 1.2} fill="#FFFFFF" stroke="#000" strokeWidth="2" />
        <ellipse cx="115" cy="50" rx="7" ry={4 - windup * 1.2} fill="#FFFFFF" stroke="#000" strokeWidth="2" />
        <circle cx="85" cy="50" r="2.6" fill="#DC2626" />
        <circle cx="115" cy="50" r="2.6" fill="#DC2626" />
        <circle cx="85" cy="50" r="1.3" fill="#000" />
        <circle cx="115" cy="50" r="1.3" fill="#000" />
        {glint && <path d="M118 45 l1 3 l3 1 l-3 1 l-1 3 l-1 -3 l-3 -1 l3 -1 Z" fill="#FFFFFF" />}
        {/* Nose */}
        <path d="M96 48 L98 56 L93 58 L107 58 L102 56 L104 48" fill="#C68B45" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
        {/* Mouth: a flat stare, then bared teeth for the punch */}
        {windup > 0.1 || punching ? (
          <g>
            <path d="M80 61 L120 61 L120 70 L80 70 Z" fill="#18181B" stroke="#000" strokeWidth="2.5" />
            <path d="M82 62.5 L118 62.5 L118 69 L82 69 Z" fill="#FFFFFF" />
            <path d="M88 62.5 V69 M94 62.5 V69 M100 62.5 V69 M106 62.5 V69 M112 62.5 V69 M82 65.8 H118" stroke="#18181B" strokeWidth="1.2" />
          </g>
        ) : (
          <path d="M84 65 Q100 63 116 65" stroke="#5B3413" strokeWidth="3" fill="none" strokeLinecap="round" />
        )}
      </g>

      {/* Left guard (his left, our right): delt, forearm up, fist by the jaw */}
      <g>
        <circle cx="160" cy="104" r="24" fill="url(#wg-bulge)" stroke="#000" strokeWidth="4" />
        <path d="M168 118 C182 150 170 176 150 170 C140 150 146 128 152 116 Z" fill="url(#wg-bulge)" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
        <path d="M150 170 C160 150 150 110 140 92 L124 100 C132 122 138 150 136 170 Z" fill="url(#wg-bulge)" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
        <path d="M144 150 Q140 130 134 112" stroke="#DC2626" strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect x="120" y="68" width="30" height="30" rx="9" fill="url(#wg-bulge)" stroke="#000" strokeWidth="4" />
        <path d="M126 76 H146 M126 83 H146 M126 90 H144" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Right guard (the punching arm): pulls back on the wind-up, gone mid-punch */}
      {!punching && (
        <g transform={`translate(${-windup * 14} ${windup * 10}) rotate(${-windup * 14} 40 104)`}>
          <circle cx="40" cy="104" r="24" fill="url(#wg-bulge)" stroke="#000" strokeWidth="4" />
          <path d="M32 118 C18 150 30 176 50 170 C60 150 54 128 48 116 Z" fill="url(#wg-bulge)" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
          <path d="M50 170 C40 150 50 110 60 92 L76 100 C68 122 62 150 64 170 Z" fill="url(#wg-bulge)" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
          <path d="M56 150 Q60 130 66 112" stroke="#DC2626" strokeWidth="2" fill="none" strokeLinecap="round" />
          <rect x="50" y="68" width="30" height="30" rx="9" fill="url(#wg-bulge)" stroke="#000" strokeWidth="4" />
          <path d="M54 76 H74 M54 83 H74 M56 90 H74" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
      {/* Mid-punch: the shoulder driving forward */}
      {punching && <circle cx="52" cy="106" r="30" fill="url(#wg-bulge)" stroke="#000" strokeWidth="4" />}
    </svg>
  );
};

export default WeaponGetScene;

/**
 * A button shown: the oil rocket launcher's test, where the flamethrower's on a button of its own (the controller's
 * Y, or F on the keyboard: whichever's being used right now, and it changes over as you switch), drawn as the button.
 */
const FlameCallout = () => {
  const pad = useInputDevice() === 'pad';
  return (
    <div className="mt-3 inline-flex items-center gap-3 px-3 py-2"
      style={{ background: 'rgba(0,0,0,0.6)', border: '2px solid #F97316', boxShadow: '3px 3px 0 #000' }}>
      <div className="animate-pulse">{pad ? <PadButton label="Y" /> : <KeyCap label="F" />}</div>
      <div className="text-[8px] leading-[14px] text-white uppercase">
        <div className="text-orange-400">FLAMETHROWER, NO SWITCHING</div>
        <div className="text-white/80">SLICK 'EM WITH OIL. THEN LIGHT 'EM UP.</div>
      </div>
    </div>
  );
};
