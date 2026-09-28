import React, { useEffect, useRef, useState } from 'react';
import { ART_W, ART_H } from '../game/render/scenes/ending';
import { say, sayModulated, cancelSpeech, canSpeak, Voice } from '../game/platform/speech';
import { openRadio, playSquelch } from '../game/platform/audio';
import { getActiveGamepad, isButtonPressed, GP_BUTTONS } from '../game/platform/gamepad';

// NES-style cutscenes (the ending, the mid-game call): a run of still images with text typed out underneath.
// Press confirm to finish the text or move on; panels also advance on their own.

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
}

const TYPE_FRAMES_PER_CHAR = 2;
const DEFAULT_HOLD = 90;
const INPUT_LOCK_FRAMES = 45;
const FRAME_MS = 1000 / 60;

/**
 * A cutscene: panels of pixel art with their text typed out underneath (spoken, if there's a voice). Confirm finishes
 * the text, then moves on; panels also move on on their own. The last one holds, and `endCard` comes up over it
 * `endAt` frames in; confirm after that and it's done. `radio`: a radio channel's open under the lot, and panels
 * marked `radio` are said through it (the voice scrambled, the modulator buzzing while it talks).
 */
const Cutscene: React.FC<{ panels: Panel[]; endAt: number; endCard: string; radio?: boolean; onDone: () => void }> = ({ panels: PANELS, endAt, endCard, radio, onDone }) => {
  const LAST = PANELS.length - 1;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [panelIndex, setPanelIndex] = useState(0);
  const [shownChars, setShownChars] = useState(0);
  const [ready, setReady] = useState(false);
  const [theEnd, setTheEnd] = useState(false);
  // Mutable state the loop works on
  const run = useRef({ panel: 0, t: 0, total: 0, typedAt: -1, speaking: false, spoke: false, finished: false });
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
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
    setReady(false);
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

  const confirm = () => {
    const r = run.current;
    if (r.total < INPUT_LOCK_FRAMES) return;
    const p = PANELS[r.panel];
    if (r.panel === LAST) {
      if (r.t >= endAt + 60 && !r.finished) { r.finished = true; hangUp.current?.(); cancelSpeech(); onDoneRef.current(); }
      return;
    }
    // First press finishes the text, the next moves on
    if (r.typedAt < 0 && p.text) { r.typedAt = r.t; r.t = Math.max(r.t, p.text.length * TYPE_FRAMES_PER_CHAR); setShownChars(p.text.length); return; }
    enterPanel(r.panel + 1);
  };

  useEffect(() => {
    if (radio) channel.current = openRadio();
    enterPanel(0);
    const ctx = canvasRef.current!.getContext('2d')!;
    let frameId = 0, last = 0;
    const tick = () => {
      const r = run.current;
      const p = PANELS[r.panel];
      r.t++; r.total++;
      const chars = Math.min(p.text.length, Math.floor(r.t / TYPE_FRAMES_PER_CHAR));
      setShownChars(c => (c === p.text.length ? c : chars));
      if (r.typedAt < 0 && chars >= p.text.length) r.typedAt = r.t;
      const talking = r.speaking || (!r.spoke && !!p.voice && r.typedAt < 0);
      p.draw(ctx, r.t, talking);
      if (r.panel === LAST) {
        if (r.t === endAt) setTheEnd(true);
        return;
      }
      // Auto-advance once the text is out and the line has been said
      if (r.typedAt >= 0 && !r.speaking) {
        setReady(true);
        if (r.t - r.typedAt >= (p.hold ?? DEFAULT_HOLD)) enterPanel(r.panel + 1);
      }
    };
    const loop = (now: number) => {
      if (!last) last = now;
      if (now - last >= FRAME_MS - 2) { tick(); last = now - Math.min((now - last) % FRAME_MS, FRAME_MS); }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frameId); hangUp.current?.(); cancelSpeech(); channel.current?.close(); };
  }, []);

  // Keyboard, mouse and gamepad confirm
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') confirm(); };
    window.addEventListener('keydown', onKey);
    let padId = 0;
    let prev = true;
    const poll = () => {
      const gp = getActiveGamepad();
      const down = !!gp && (isButtonPressed(gp, GP_BUTTONS.A) || isButtonPressed(gp, GP_BUTTONS.START));
      if (down && !prev) confirm();
      prev = down;
      padId = requestAnimationFrame(poll);
    };
    padId = requestAnimationFrame(poll);
    return () => { window.removeEventListener('keydown', onKey); cancelAnimationFrame(padId); };
  }, []);

  const panel = PANELS[panelIndex];
  const text = panel.text.slice(0, shownChars);
  return (
    <div className="absolute inset-0 z-[80] bg-black select-none" onMouseDown={confirm}>
      <canvas
        ref={canvasRef}
        width={ART_W}
        height={ART_H}
        style={{ position: 'absolute', left: 16, top: 20, width: ART_W * 3, height: ART_H * 3, imageRendering: 'pixelated' }}
      />
      <div style={{ position: 'absolute', left: 40, right: 40, top: 474, bottom: 12 }} className="text-left">
        {theEnd ? (
          <div className={`h-full flex items-center justify-center text-center text-white ${endCard.length > 12 ? 'text-2xl tracking-wider leading-relaxed' : 'text-5xl tracking-widest'}`} style={{ textShadow: '4px 4px 0 #d82800' }}>
            {endCard}
          </div>
        ) : (
          <>
            {panel.speaker && <div className="text-yellow-400 text-[12px] mb-2">{panel.speaker}:</div>}
            <div className="text-white text-[12px] leading-[1.9] whitespace-pre-line">{text}</div>
            {ready && <div className="absolute right-0 bottom-0 text-white text-[12px] animate-pulse">&#9660;</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default Cutscene;
