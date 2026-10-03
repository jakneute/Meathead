import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Prompt } from './ButtonIcons';
import type { Souvenir } from '../content/garage';
import { GameStatus, WeaponType } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, RENDER_SCALE, PRACTICE_RANGE_STAGE } from '../constants';
import { BOSS_WEAPON_MAP, WEAPON_DESCRIPTIONS, getWeaponInfo } from '../content/roster';
import { createRange, stepRange, newRespawns } from '../game/range';
import { KeyboardMouseState, readControls } from '../game/platform/input';
import { PadButton, KeyCap } from './ButtonIcons';
import { useInputDevice, usePadFamily } from './useInputDevice';
import { drawWorld } from '../game/render/world';
import { WeaponArt } from './WeaponIcon';
import { getActiveGamepad, isButtonPressed, GP_BUTTONS } from '../game/platform/gamepad';
import { SKIP_AFTER_MS } from '../game/platform/skip';
import SkipPrompt from './SkipPrompt';
import { playWhoosh, playPunchImpact, playThud, playTypeClack, playGlassShatterSound, playSound, playSquelch } from '../game/platform/audio';
import { speak, cancelSpeech, MEATHEAD_VOICE } from '../game/platform/speech';
import { drawFaceOff } from '../game/scenes/faceOff';
import { drawEggBack, drawEggFront, EGG_MS, EGG_PEE_MS, EGG_SHAKE_MS, EGG_TURN_MS } from '../game/scenes/faceOffEgg';

// After a boss: fade out of the victory lap into a black void, face to face with
// Meathead in first person. He decks the camera; it goes down on its side. Then
// the new weapon's name is hammered out on the screen next to a photo of it
// and you get a firing range to try it out on a dummy that keeps
// coming back. Start / Esc moves on (and skips straight to the range before that).
// (Hold P, or the pad's top button, as it fades in, and the camera walks in on him at a urinal first: the scene's
// clock stands still at the fade-in while that plays out, then carries on from there. See faceOffEgg.ts.)

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
/** Walked in on at the urinal: as he swings round, what's still coming out of him catches the lens (ms into it). */
const EGG_SPLASH_AT = EGG_PEE_MS + EGG_SHAKE_MS + EGG_TURN_MS * 0.45;

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
  /** He'd shit himself when he killed him: the egg's view from behind shows it. */
  shitty?: boolean;
  onDone: () => void;
}

const WeaponGetScene: React.FC<Props> = ({ stageId, souvenirs, shitty = false, onDone }) => {
  const weapon: WeaponType = (stageId && BOSS_WEAPON_MAP[stageId]) || 'GUN';
  const name = getWeaponInfo(weapon).name.toUpperCase();
  const description = (stageId && WEAPON_DESCRIPTIONS[stageId]) || '';
  const nameAt = HEADER_AT + HEADER.length * HEADER_MS + 200;
  const rangeAt = nameAt + name.length * NAME_MS + RANGE_DELAY;

  const [t, setT] = useState(0);
  /** The camera walked in on him at the urinal; and how far into that it is (ms). */
  const [egg, setEgg] = useState<number | null>(null);
  const eggRef = useRef(false);
  /** Wall time past the start, less however long the urinal held the clock up. */
  const sceneTime = (raw: number) => eggRef.current ? raw - Math.max(0, Math.min(EGG_MS, raw - FADE_END)) : raw;
  const jumpTo = (sceneT: number) => { startRef.current = performance.now() - sceneT - (eggRef.current ? EGG_MS : 0); };
  const startRef = useRef(performance.now());
  const doneRef = useRef(false);
  /** Training's being called off (he's shat himself in the ring): it plays out, no skipping it. */
  const cancellingRef = useRef(false);
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
      if (respawns.cancelled !== undefined) return;
      const now = sceneTime(performance.now() - startRef.current);
      if (now < SKIP_AFTER_MS) return;
      if (now < rangeAt) {
        jumpTo(rangeAt);
        cancelSpeech();
      } else {
        finish();
      }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); skipOrContinue(); } };
    window.addEventListener('keydown', onKey);

    let lastTinkle = 0;
    const loop = (wall: number) => {
      const raw = wall - startRef.current;
      // The easter egg: P, or the pad's top button, held while it fades in
      const gp0 = getActiveGamepad();
      if (!eggRef.current && raw < FADE_END && (kb.isDown('p') || (!!gp0 && isButtonPressed(gp0, GP_BUTTONS.Y)))) eggRef.current = true;
      const now = sceneTime(raw);
      setT(now);
      if (eggRef.current) {
        const e = raw - FADE_END;
        setEgg(e);
        if (e > 150 && e < EGG_PEE_MS - 250 && wall - lastTinkle > 90 + Math.random() * 90) { lastTinkle = wall; playSound('tinkle', 0.9); }
        once('egg-turn', EGG_PEE_MS + EGG_SHAKE_MS, e, playWhoosh);
        once('egg-splash', EGG_SPLASH_AT, e, () => { playSquelch(); playSound('tinkle', 1.2, 3); });
      }

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
          // (training's been called off: he's shit himself, and the help's gone home)
          if (stepRange(range, readControls(kb), weapon, respawns)) { finish(); break; }
          cancellingRef.current = respawns.cancelled !== undefined;
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
  // (walked in on at the urinal, he's been in full view all along: he fades in on that instead)
  // (walked in on: pulled back to start with, head to knees, his hairy ass and all, then pushing in on him as he
  // finishes and turns round, to the face-off's usual framing; the top of him held where it is as it does)
  const eggPush = egg === null ? 1 : clamp01((egg - EGG_PEE_MS * 0.55) / (EGG_PEE_MS * 0.45 + EGG_SHAKE_MS + EGG_TURN_MS));
  const eggS = 0.62 + 0.38 * eggPush * eggPush * (3 - 2 * eggPush);
  const eggPull = { s: eggS, ty: -0.43 * 1144 * (1 - eggS) };
  const faceIn = egg !== null ? clamp01(egg / (FACE_IN_END - FADE_END)) : clamp01((t - FADE_END) / (FACE_IN_END - FADE_END));
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
            {egg !== null ? <RestroomWall /> : <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 58%, rgba(127,29,29,0.55) 0%, rgba(20,0,0,0.6) 35%, #000 70%)' }} />}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[40px] w-[560px] h-[60px] rounded-[50%]" style={{ background: 'radial-gradient(ellipse, rgba(239,68,68,0.25), transparent 70%)' }} />
            <div className="absolute left-1/2 top-[40px]" style={{ width: 520, height: 1144, marginLeft: -260, opacity: faceIn, filter: egg !== null ? 'drop-shadow(0 6px 14px rgba(0,0,0,0.6))' : 'drop-shadow(0 0 22px rgba(239,68,68,0.45))', transform: `translateY(${eggPull.ty}px) scale(${(0.88 + faceIn * 0.12) * eggPull.s}) rotate(${-windup * 5 + punch * 7}deg)`, transformOrigin: '50% 43%' }}>
              <FaceOffMeathead t={t} windup={windup} punching={punching || (t >= IMPACT && t < IMPACT + 180)} egg={egg} shitty={shitty} />
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

          {/* (walked in on: he swung round still going, and some of it's on the lens) */}
          {egg !== null && egg >= EGG_SPLASH_AT - 120 && <LensSplash since={egg - EGG_SPLASH_AT} />}

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
          <button onClick={() => { if (!cancellingRef.current) finish(); }}
            className="absolute right-3 bottom-3 px-3 py-2 text-[9px] text-black bg-yellow-400 border-2 border-black shadow-[3px_3px_0_#000] animate-pulse">
            <span className="inline-flex items-center gap-2"><Prompt pad={['START']} kb={['ESC']} size={14} />CONTINUE ▶</span>
          </button>
        </>
      )}

      {/* Skip hint during the cinematic */}
      {!inRange && t > SKIP_AFTER_MS && (
        <SkipPrompt onSkip={() => { jumpTo(rangeAt); cancelSpeech(); }} />
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

/**
 * The easter egg's last word: as he swings round from the urinal, a last spurt arcs across at the camera (just
 * before, `since` < 0) and splatters the lens: drops of it beaded on the glass, catching the light, a few running
 * down in trails that keep getting longer. It stays put on the glass while everything behind it moves, like the crack.
 */
const LensSplash: React.FC<{ since: number }> = ({ since }) => {
  if (since < 0) {
    // (the spurt, coming at the lens)
    const k = 1 + since / 120;
    return (
      <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full pointer-events-none">
        <path d={`M400 560 Q${380 - k * 60} ${420 - k * 120} ${330 + k * 40} ${300 - k * 40}`} stroke="rgba(234,179,8,0.75)" strokeWidth={6 + k * 30} fill="none" strokeLinecap="round" />
        <path d={`M400 560 Q${380 - k * 60} ${420 - k * 120} ${330 + k * 40} ${300 - k * 40}`} stroke="rgba(254,249,195,0.6)" strokeWidth={2 + k * 8} fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  const DROPS = [[300, 260, 46], [362, 220, 22], [250, 330, 28], [420, 300, 34], [330, 360, 18], [470, 230, 14], [210, 240, 12], [390, 400, 16], [280, 190, 10], [500, 330, 11], [440, 180, 9], [235, 400, 9]];
  const pop = Math.min(1, since / 60), drip = Math.min(1, since / 2200);
  return (
    <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <radialGradient id="wg-drop" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="rgba(254,249,195,0.85)" />
          <stop offset="45%" stopColor="rgba(250,204,21,0.55)" />
          <stop offset="100%" stopColor="rgba(161,98,7,0.7)" />
        </radialGradient>
      </defs>
      {DROPS.map(([x, y, r], i) => {
        const rr = r * (0.6 + pop * 0.4), trail = i % 3 === 0 ? (60 + r * 3) * drip : 0;
        // (a splat: a lumpy blob with a spray of specks thrown out on the side it hit from)
        const pts = Array.from({ length: 9 }, (_, k) => { const a = (k / 9) * Math.PI * 2, w = rr * (0.8 + ((i * 7 + k * 13) % 5) * 0.08); return [x + Math.cos(a) * w, y + Math.sin(a) * w * 0.9]; });
        // (rounded off: a curve through the midpoints, bent toward each lump)
        const mid = (k: number) => { const p = pts[k % 9], q = pts[(k + 1) % 9]; return `${(p[0] + q[0]) / 2} ${(p[1] + q[1]) / 2}`; };
        const blob = `M${mid(0)} ` + pts.map((_, k) => `Q${pts[(k + 1) % 9][0]} ${pts[(k + 1) % 9][1]} ${mid(k + 1)}`).join(' ') + ' Z';
        return (
          <g key={i}>
            {trail > 0 && <path d={`M${x - rr * 0.25} ${y} L${x - rr * 0.18} ${y + trail} Q${x} ${y + trail + rr * 0.35} ${x + rr * 0.18} ${y + trail} L${x + rr * 0.25} ${y} Z`} fill="url(#wg-drop)" />}
            <path d={blob} fill="url(#wg-drop)" stroke="rgba(120,72,6,0.5)" strokeWidth="1.5" strokeLinejoin="round" />
            <ellipse cx={x - rr * 0.3} cy={y - rr * 0.35} rx={rr * 0.22} ry={rr * 0.12} fill="rgba(255,255,255,0.75)" />
            {r > 20 && Array.from({ length: 6 }, (_, k) => <circle key={k} cx={x + (k - 2.5) * r * 0.5 + 10} cy={y - r * 0.9 - (k % 2) * 14} r={2 + (k % 3)} fill="rgba(234,179,8,0.7)" />)}
          </g>
        );
      })}
    </svg>
  );
};

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
 * Meathead from the front, square to the camera in a boxing guard, painted in gross-up detail (see
 * game/scenes/faceOff.ts). His left fist draws back on the wind-up and is gone (it's coming at you) during the punch.
 */
export const FaceOffMeathead: React.FC<{ t: number; windup: number; punching: boolean; egg?: number | null; shitty?: boolean }> = ({ t, windup, punching, egg = null, shitty = false }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.scale(c.width / 200, c.height / 440);
    if (egg === null) { drawFaceOff(ctx, t, windup, punching); return; }
    // Walked in on: from behind at the urinal; then he turns (the picture squeezing to a sliver and out again, his
    // back on one side of it, his front on the other); then the face-off, it bobbing a while from the turn
    const turnAt = EGG_PEE_MS + EGG_SHAKE_MS, q = (egg - turnAt) / EGG_TURN_MS;
    if (q > 0 && q < 1) { ctx.translate(100, 0); ctx.scale(Math.max(0.04, Math.abs(Math.cos(q * Math.PI))), 1); ctx.translate(-100, 0); }
    if (q < 0.5) drawEggBack(ctx, egg, shitty);
    else drawEggFront(ctx, t, windup, punching, Math.max(0, 1 - (egg - turnAt - EGG_TURN_MS / 2) / 1400));
  }, [t, windup, punching, egg, shitty]);
  return <canvas ref={ref} width={780} height={1716} className="w-full h-full" />;
};

/** The men's room the camera walked in on him in: grimy green tile, the grout gone dark, a stall's edge, under a flickering tube. */
const RestroomWall: React.FC = () => (
  <div className="absolute inset-0" style={{
    background: [
      'radial-gradient(ellipse at 50% 30%, rgba(254,252,232,0.35) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.85) 90%)',
      'repeating-linear-gradient(0deg, rgba(30,41,30,0.9) 0 2px, transparent 2px 34px)',
      'repeating-linear-gradient(90deg, rgba(30,41,30,0.9) 0 2px, transparent 2px 34px)',
      'linear-gradient(180deg, #9CB79A 0%, #7E9A7C 60%, #4B5E4A 100%)',
    ].join(', '),
  }}>
    <div className="absolute left-0 top-0 bottom-0 w-[90px]" style={{ background: 'linear-gradient(90deg, #3F4A3E, #59685A)', borderRight: '4px solid #1F2620' }} />
    <div className="absolute right-0 top-0 bottom-0 w-[90px]" style={{ background: 'linear-gradient(270deg, #3F4A3E, #59685A)', borderLeft: '4px solid #1F2620' }} />
    <div className="absolute left-[120px] top-[60px] text-[9px] text-black/50 rotate-[-6deg]">FOR A GOOD TIME CALL</div>
  </div>
);

export default WeaponGetScene;

/**
 * A button shown: the oil rocket launcher's test, where the flamethrower's on a button of its own (the controller's
 * Y, or F on the keyboard: whichever's being used right now, and it changes over as you switch), drawn as the button.
 */
const FlameCallout = () => {
  const pad = useInputDevice() === 'pad';
  const family = usePadFamily();
  return (
    <div className="mt-3 inline-flex items-center gap-3 px-3 py-2"
      style={{ background: 'rgba(0,0,0,0.6)', border: '2px solid #F97316', boxShadow: '3px 3px 0 #000' }}>
      <div className="animate-pulse">{pad ? <PadButton label="Y" family={family} /> : <KeyCap label="F" />}</div>
      <div className="text-[8px] leading-[14px] text-white uppercase">
        <div className="text-orange-400">SECONDARY FIRE: A FLAMETHROWER, NO SWITCHING</div>
        <div className="text-white/80">SLICK 'EM WITH OIL. THEN LIGHT 'EM UP.</div>
      </div>
    </div>
  );
};
