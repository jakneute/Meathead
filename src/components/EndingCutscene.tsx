import React, { useEffect, useRef, useState } from 'react';
import {
  ART_W, ART_H, drawWhiteHouse, drawPressRoom, drawTrumpCloseUp, drawMedal, drawMeatheadEyes, drawBelly,
  drawMeatheadCloseUp, drawPunch, drawFinale,
} from '../game/render/scenes/ending';
import { say, cancelSpeech, canSpeak, Voice, MEATHEAD_VOICE } from '../game/platform/speech';
import { playSound } from '../game/platform/audio';
import { getActiveGamepad, isButtonPressed, GP_BUTTONS } from '../game/platform/gamepad';

// NES-style ending: a run of still images with text typed out underneath.
// Press confirm to finish the text or move on; panels also advance on their own.

const TRUMP_VOICE: Voice = { pitch: 0.75, rate: 0.9 };

interface Panel {
  draw: (ctx: CanvasRenderingContext2D, t: number, talking: boolean) => void;
  speaker?: string;
  text: string;
  voice?: Voice;
  /** Frames to hold once the text is out (and the line is spoken) before moving on. */
  hold?: number;
  onEnter?: () => void;
}

const FINALE_FREEZE = 48;

const PANELS: Panel[] = [
  { draw: (c, t) => drawWhiteHouse(c, t), text: 'WASHINGTON, D.C.\nTHE WHITE HOUSE PRESS ROOM.' },
  {
    draw: (c, t, talk) => drawPressRoom(c, t, talk), speaker: 'PRESIDENT TRUMP', voice: TRUMP_VOICE,
    text: 'Thank you. Thank you. What a crowd. This man, Meathead, took out the most dangerous, most evil terrorists. Believe me.',
  },
  {
    draw: (c, t, talk) => drawTrumpCloseUp(c, t, talk, 'proud'), speaker: 'PRESIDENT TRUMP', voice: TRUMP_VOICE,
    text: "Nobody's ever seen anything like it. Tremendous job. The best job. People are saying he's the greatest hero in the history of heroes. Maybe ever.",
  },
  {
    draw: (c, t, talk) => drawMedal(c, t, talk), speaker: 'PRESIDENT TRUMP', voice: TRUMP_VOICE,
    text: "It's my great honor to give him the Presidential Medal of Freedom. Beautiful medal. Very expensive. Frankly, I should get one too.",
  },
  { draw: (c, t) => drawMeatheadEyes(c, t), text: 'Meathead looks the President up and down...', hold: 60 },
  { draw: (c, t) => drawBelly(c, t), text: '...', hold: 50 },
  {
    draw: (c, t, talk) => drawMeatheadCloseUp(c, t, talk, 'dumb'), speaker: 'MEATHEAD', voice: MEATHEAD_VOICE,
    text: 'Do you even lift, bro?',
  },
  {
    draw: (c, t, talk) => drawTrumpCloseUp(c, t, talk, 'huh'), speaker: 'PRESIDENT TRUMP', voice: TRUMP_VOICE,
    text: 'Excuse me?',
  },
  { draw: (c, t) => drawMeatheadCloseUp(c, t, false, 'disgust'), text: 'Meathead is disgusted.', hold: 50 },
  {
    draw: (c, t) => drawPunch(c, t), text: '', hold: 70,
    onEnter: () => { playSound('tsunami'); playSound('gun'); playSound('barf'); },
  },
  { draw: (c, t) => drawFinale(c, t, FINALE_FREEZE), text: '' },
];

const LAST = PANELS.length - 1;
const TYPE_FRAMES_PER_CHAR = 2;
const DEFAULT_HOLD = 90;
const INPUT_LOCK_FRAMES = 45;
const FRAME_MS = 1000 / 60;

const EndingCutscene: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [panelIndex, setPanelIndex] = useState(0);
  const [shownChars, setShownChars] = useState(0);
  const [ready, setReady] = useState(false);
  const [theEnd, setTheEnd] = useState(false);
  // Mutable state the loop works on
  const run = useRef({ panel: 0, t: 0, total: 0, typedAt: -1, speaking: false, spoke: false, finished: false });
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const enterPanel = (i: number) => {
    const r = run.current;
    cancelSpeech();
    r.panel = i; r.t = 0; r.typedAt = -1; r.speaking = false; r.spoke = false;
    setPanelIndex(i);
    setShownChars(0);
    setReady(false);
    const p = PANELS[i];
    p.onEnter?.();
    if (p.voice && canSpeak()) {
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
      if (r.t >= FINALE_FREEZE + 60 && !r.finished) { r.finished = true; cancelSpeech(); onDoneRef.current(); }
      return;
    }
    // First press finishes the text, the next moves on
    if (r.typedAt < 0 && p.text) { r.typedAt = r.t; r.t = Math.max(r.t, p.text.length * TYPE_FRAMES_PER_CHAR); setShownChars(p.text.length); return; }
    enterPanel(r.panel + 1);
  };

  useEffect(() => {
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
        if (r.t === FINALE_FREEZE) setTheEnd(true);
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
    return () => { cancelAnimationFrame(frameId); cancelSpeech(); };
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
          <div className="h-full flex items-center justify-center text-5xl text-white tracking-widest" style={{ textShadow: '4px 4px 0 #d82800' }}>
            THE END
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

export default EndingCutscene;
