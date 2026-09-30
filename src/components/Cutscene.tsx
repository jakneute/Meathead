import React, { useEffect, useRef, useState } from 'react';
import { ART_W, ART_H } from '../game/render/scenes/ending';
import { say, sayModulated, cancelSpeech, canSpeak, Voice } from '../game/platform/speech';
import { openRadio, playSquelch } from '../game/platform/audio';
import { getActiveGamepad, isButtonPressed, GP_BUTTONS, menuButtons } from '../game/platform/gamepad';
import { SKIP_AFTER } from '../game/platform/skip';
import SkipPrompt from './SkipPrompt';

// NES-style cutscenes (the ending, the mid-game call): a run of still images with text typed out underneath.
// It plays out on its own, line by line: watch it all, or skip the lot (SKIP >>). Confirm only closes the end card.

export interface Panel {
  draw: (ctx: CanvasRenderingContext2D, t: number, talking: boolean) => void;
  speaker?: string;
  text: string;
  voice?: Voice;
  /** Said over the radio, through the modulator. */
  radio?: boolean;
  /** Frames to hold once the text is out (and the line is spoken) before moving on. */
  hold?: number;
  onEnter?: () => void;
  /** Drawn at the full size it's shown at, not blown up from the pixel art (a close-up in far too much detail). The
   * drawing's still in the art's coordinates. */
  hires?: boolean;
}

const TYPE_FRAMES_PER_CHAR = 2;
/** How much finer a hi-res panel's drawn (the art's shown at three times its size). */
const HIRES = 3;
const DEFAULT_HOLD = 90;
const INPUT_LOCK_FRAMES = 45;
const FRAME_MS = 1000 / 60;

/**
 * A cutscene: panels of pixel art with their text typed out underneath (spoken, if there's a voice). Confirm finishes
 * the text, then moves on; panels also move on on their own. The last one holds, and `endCard` comes up over it
 * `endAt` frames in; confirm after that and it's done. `radio`: a radio channel's open under the lot, and panels
 * marked `radio` are said through it (the voice scrambled, the modulator buzzing while it talks).
 */
/**
 * Handing straight on to what comes next instead of just ending: `after` frames into the end card (or on confirm), the
 * card (styled `className`) rises to land exactly on the element `selector` finds (the stage select's title, which
 * `onHandoff` brings up underneath), and then the cutscene fades away round it.
 */
export interface Handoff { className: string; selector: string; after: number; onHandoff: () => void }

/** The handoff's beats (ms): the screen underneath settling, the card rising onto its title, the cutscene fading off it. */
const SETTLE_MS = 550, RISE_MS = 900, FADE_MS = 900;

/** Every one can be skipped the usual way (see platform/skip): SKIP >> in the corner, or Start / Esc, jumps straight to the end card. */
const Cutscene: React.FC<{ panels: Panel[]; endAt: number; endCard: string; radio?: boolean; handoff?: Handoff; onDone: () => void }> = ({ panels: PANELS, endAt, endCard, radio, handoff, onDone }) => {
  const LAST = PANELS.length - 1;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [panelIndex, setPanelIndex] = useState(0);
  const [shownChars, setShownChars] = useState(0);
  const [theEnd, setTheEnd] = useState(false);
  const [skipUp, setSkipUp] = useState(false);
  // Mutable state the loop works on
  const run = useRef({ panel: 0, t: 0, total: 0, typedAt: -1, speaking: false, spoke: false, finished: false });
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const [outro, setOutro] = useState<'none' | 'settle' | 'rise' | 'fade'>('none');
  const [lift, setLift] = useState({ x: 0, y: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const handoffRef = useRef(handoff);
  handoffRef.current = handoff;
  const channel = useRef<ReturnType<typeof openRadio> | null>(null);
  const hangUp = useRef<(() => void) | null>(null);

  const enterPanel = (i: number) => {
    const r = run.current;
    hangUp.current?.(); hangUp.current = null;
    channel.current?.talking(false);
    cancelSpeech();
    r.panel = i; r.t = 0; r.typedAt = -1; r.speaking = false; r.spoke = false;
    setPanelIndex(i);
    setShownChars(0);
    const p = PANELS[i];
    p.onEnter?.();
    if (p.voice && p.radio && canSpeak()) {
      // Through the modulator
      r.speaking = true; r.spoke = true;
      playSquelch();
      channel.current?.talking(true);
      hangUp.current = sayModulated(p.text, p.voice, () => {
        if (run.current.panel !== i) return;
        run.current.speaking = false;
        channel.current?.talking(false);
        playSquelch();
      });
    } else if (p.voice && canSpeak()) {
      r.speaking = true;
      r.spoke = say(p.text, p.voice, 'urgent', {
        onShow: () => {}, onHide: () => {},
        onDone: () => { if (run.current.panel === i) run.current.speaking = false; },
      });
      if (!r.spoke) r.speaking = false;
    }
  };

  /** The card rising onto the next screen's title, then the cutscene fading away round it. */
  const startHandoff = () => {
    const r = run.current, h = handoffRef.current;
    if (!h || r.finished) return;
    r.finished = true;
    hangUp.current?.(); cancelSpeech(); channel.current?.close();
    h.onHandoff();
    setOutro('settle');
    setTimeout(() => {
      const root = rootRef.current, mine = titleRef.current;
      if (root && mine) {
        const k = root.getBoundingClientRect().width / (root.offsetWidth || 1);
        const m = mine.getBoundingClientRect(), target = document.querySelector(h.selector)?.getBoundingClientRect();
        const rootTop = root.getBoundingClientRect().top;
        setLift(target
          ? { x: (target.left + target.width / 2 - (m.left + m.width / 2)) / k, y: (target.top - m.top) / k }
          : { x: 0, y: (rootTop + 12 * k - m.top) / k });
      }
      setOutro('rise');
      setTimeout(() => { setOutro('fade'); setTimeout(() => onDoneRef.current(), FADE_MS); }, RISE_MS);
    }, SETTLE_MS);
  };

  const confirm = () => {
    const r = run.current;
    if (r.total < INPUT_LOCK_FRAMES) return;
    if (r.panel === LAST) {
      if (handoffRef.current) { if (r.t >= endAt + 30) startHandoff(); return; }
      if (r.t >= endAt + 60 && !r.finished) { r.finished = true; hangUp.current?.(); cancelSpeech(); onDoneRef.current(); }
      return;
    }
    // (no hurrying a line along, or skipping one: it's the whole thing or none of it)
  };

  /** Straight to the last panel, with its end card up. */
  const skip = () => {
    const r = run.current;
    if (r.finished || r.total < SKIP_AFTER) return;
    if (r.panel !== LAST) enterPanel(LAST);
    if (r.t < endAt) { r.t = endAt - 1; }
  };
  const skipRef = useRef(skip);
  skipRef.current = skip;

  useEffect(() => {
    if (radio) channel.current = openRadio();
    enterPanel(0);
    const ctx = canvasRef.current!.getContext('2d')!;
    let frameId = 0, last = 0;
    const tick = () => {
      const r = run.current;
      const p = PANELS[r.panel];
      r.t++; r.total++;
      if (r.total === SKIP_AFTER) setSkipUp(true);
      const chars = Math.min(p.text.length, Math.floor(r.t / TYPE_FRAMES_PER_CHAR));
      setShownChars(c => (c === p.text.length ? c : chars));
      if (r.typedAt < 0 && chars >= p.text.length) r.typedAt = r.t;
      const talking = r.speaking || (!r.spoke && !!p.voice && r.typedAt < 0);
      // (a hi-res panel: the canvas at the size it's shown, the art's coordinates scaled up to it)
      const s = p.hires ? HIRES : 1, cv = ctx.canvas;
      if (cv.width !== ART_W * s) { cv.width = ART_W * s; cv.height = ART_H * s; }
      ctx.setTransform(s, 0, 0, s, 0, 0);
      p.draw(ctx, r.t, talking);
      if (r.panel === LAST) {
        if (r.t === endAt) setTheEnd(true);
        if (handoffRef.current && r.t === endAt + handoffRef.current.after) startHandoff();
        return;
      }
      // Auto-advance once the text is out and the line has been said
      if (r.typedAt >= 0 && !r.speaking) {
        if (r.t - r.typedAt >= (p.hold ?? DEFAULT_HOLD)) enterPanel(r.panel + 1);
      }
    };
    const loop = (now: number) => {
      if (!last) last = now;
      if (now - last >= FRAME_MS - 2) { tick(); last = now - Math.min((now - last) % FRAME_MS, FRAME_MS); }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frameId); if (!run.current.finished || !handoffRef.current) { hangUp.current?.(); cancelSpeech(); } channel.current?.close(); };
  }, []);

  // Keyboard, mouse and gamepad confirm
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') confirm();
      else if (e.key === 'Escape') skipRef.current();
    };
    window.addEventListener('keydown', onKey);
    let padId = 0;
    let prev = true, prevBack = true;
    const poll = () => {
      const gp = getActiveGamepad();
      const down = !!gp && isButtonPressed(gp, menuButtons(gp).ok);
      if (down && !prev) confirm();
      prev = down;
      const start = !!gp && (isButtonPressed(gp, GP_BUTTONS.START) || isButtonPressed(gp, GP_BUTTONS.SELECT));
      if (start && !prevBack) skipRef.current();
      prevBack = start;
      padId = requestAnimationFrame(poll);
    };
    padId = requestAnimationFrame(poll);
    return () => { window.removeEventListener('keydown', onKey); cancelAnimationFrame(padId); };
  }, []);

  const panel = PANELS[panelIndex];
  const text = panel.text.slice(0, shownChars);
  return (
    <div ref={rootRef} className="absolute inset-0 z-[80] select-none" onMouseDown={confirm}>
      {/* (the picture and its black fade off the next screen at the end of a handoff; the card stays, on its title) */}
      <div className="absolute inset-0" style={{ opacity: outro === 'fade' ? 0 : 1, transition: `opacity ${FADE_MS}ms ease-in-out` }}>
        <div className="absolute inset-0 bg-black" />
        <canvas
          ref={canvasRef}
          width={ART_W}
          height={ART_H}
          style={{ position: 'absolute', left: 16, top: 20, width: ART_W * 3, height: ART_H * 3, imageRendering: 'pixelated' }}
        />
      </div>
      {skipUp && !theEnd && <SkipPrompt onSkip={skip} />}
      {theEnd && handoff && (
        <div className="absolute left-0 right-0 flex justify-center" style={{ top: 510, transform: `translate(${lift.x}px, ${lift.y}px)`, transition: outro === 'rise' || outro === 'fade' ? `transform ${RISE_MS}ms cubic-bezier(0.65, 0, 0.35, 1)` : undefined }}>
          <h2 ref={titleRef} className={handoff.className}>{endCard}</h2>
        </div>
      )}
      <div style={{ position: 'absolute', left: 40, right: 40, top: 474, bottom: 12 }} className="text-left">
        {theEnd && handoff ? null : theEnd ? (
          <div className={`h-full flex items-center justify-center text-center text-white ${endCard.length > 12 ? 'text-2xl tracking-wider leading-relaxed' : 'text-5xl tracking-widest'}`} style={{ textShadow: '4px 4px 0 #d82800' }}>
            {endCard}
          </div>
        ) : (
          <>
            {panel.speaker && <div className="text-yellow-400 text-[12px] mb-2">{panel.speaker}:</div>}
            <div className="text-white text-[12px] leading-[1.9] whitespace-pre-line">{text}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cutscene;
