import { useCursorSound, useOpenCloseSound } from './useCursorSound';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SOUVENIRS } from '../content/garage';
import { ownedSouvenirs } from '../game/garage/store';
import { drawGarage, GARAGE_W, GARAGE_H, SLOTS, SOUVENIR_ORDER } from '../game/garage/draw';
import { getActiveGamepad, getGamepadMovement, isButtonPressed, GP_BUTTONS, menuButtons } from '../game/platform/gamepad';
import type { WeaponType } from '../types';
import PracticeRange from './PracticeRange';
import { Prompt } from './ButtonIcons';
import { drawSouvenirCloseup } from '../game/garage/souvenirClose';
import DamageReport from './DamageReport';
import { setTitleClass } from './Overlay';

/** A souvenir up close: the gross-up of it, filling the screen, its tag under it. */
const Closeup: React.FC<{ id: string; name: string; note: string; boss: string; onClose: () => void }> = ({ id, name, note, boss, onClose }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0, t = 0;
    const tick = () => {
      const ctx = canvas.current?.getContext('2d');
      if (ctx) { ctx.setTransform(3, 0, 0, 3, 0, 0); drawSouvenirCloseup(ctx, id, t++); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [id]);
  return (
    <div className="absolute inset-0 z-[80] bg-black flex flex-col items-center justify-start pt-[16px] gap-2 animate-in fade-in zoom-in-95 duration-300" onClick={onClose}>
      <canvas ref={canvas} width={768} height={432} className="block w-[768px] h-[432px] border-2 border-yellow-500/70" />
      <div className="w-[768px] flex items-baseline justify-between">
        <span className="text-[12px] text-yellow-300">{name}</span>
        <span className="text-[7px] text-cyan-300/90">FROM: {boss.toUpperCase()}</span>
      </div>
      <div className="w-[768px] text-[8px] leading-[12px] text-white/90">"{note}"</div>
      <div className="w-[768px] flex justify-center gap-6 text-[7px] text-zinc-400">
        <Prompt pad={['DPAD']} kb={['ARROWS']} label="NEXT ONE" size={13} />
        <Prompt pad={['BACK']} kb={['ESC']} mouse="right" label="PUT IT BACK" size={13} />
      </div>
    </div>
  );
};

// Meathead's garage: what he's brought home from the bosses, up on the pegboard, the shelves and the floor. Go through
// them (the arrows, the stick, the mouse) and read the tags; leave to get back to the map.

const REPEAT_MS = 180;
/** (in the list of things to pick: the practice range) */
const RANGE = '__range';

/**
 * The shady corner of the garage the damage report's kept in: cinder block gone gray-brown with grime, one bare bulb
 * on its cord (and its light, in bands, on the wall), cobwebs in the corner, a filing cabinet with a drawer hanging
 * open, a stack of paint cans, a space heater glowing, an oil-stained floor. It flickers.
 */
const GarageCorner: React.FC = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0, t = 0;
    const h = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    const draw = () => {
      const ctx = canvas.current?.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      // The wall: cinder blocks, the mortar, grime down it
      ctx.fillStyle = '#16130F'; ctx.fillRect(0, 0, 800, 600);
      for (let r = 0; r < 22; r++) for (let c = -1; c < 14; c++) {
        const bx = c * 62 + (r % 2) * 31, by = r * 24, k = h(r * 17 + c * 5);
        ctx.fillStyle = ['#2A2622', '#25211D', '#2F2A25', '#221E1A'][Math.floor(k * 4)];
        ctx.fillRect(bx + 2, by + 2, 58, 20);
        ctx.fillStyle = 'rgba(255, 240, 220, 0.04)'; ctx.fillRect(bx + 2, by + 2, 58, 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; ctx.fillRect(bx + 2, by + 19, 58, 3);
      }
      for (let k = 0; k < 8; k++) { ctx.fillStyle = 'rgba(20, 14, 8, 0.35)'; ctx.fillRect(40 + h(k * 3) * 720, 0, 3 + h(k) * 5, 200 + h(k * 7) * 300); }
      // The floor: concrete, oil-stained
      ctx.fillStyle = '#1C1A17'; ctx.fillRect(0, 520, 800, 80);
      ctx.fillStyle = '#26231F'; ctx.fillRect(0, 520, 800, 4);
      for (let k = 0; k < 4; k++) { ctx.fillStyle = 'rgba(8, 6, 4, 0.6)'; ctx.beginPath(); ctx.ellipse(120 + k * 190, 560 + (k % 2) * 14, 50 + h(k) * 30, 9, 0, 0, Math.PI * 2); ctx.fill(); }
      // The bulb's light on it all, in bands, flickering now and then
      const flick = (h(Math.floor(t / 7)) > 0.94 ? 0.55 : 1) * (0.95 + Math.sin(t * 0.3) * 0.05);
      for (let i = 5; i >= 1; i--) { ctx.fillStyle = `rgba(253, 224, 140, ${0.035 * flick})`; ctx.beginPath(); ctx.ellipse(250, 330, i * 85, i * 70, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = '#0A0908'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(190, 0); ctx.lineTo(190, 284); ctx.stroke();
      ctx.fillStyle = '#3F3A33'; ctx.fillRect(184, 280, 12, 8);
      ctx.fillStyle = `rgba(255, 247, 214, ${flick})`; ctx.beginPath(); ctx.ellipse(190, 295, 7, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255, 240, 180, ${0.2 * flick})`; ctx.beginPath(); ctx.arc(190, 295, 22, 0, Math.PI * 2); ctx.fill();
      // Cobwebs in the corners
      ctx.strokeStyle = 'rgba(214, 211, 209, 0.25)'; ctx.lineWidth = 0.6;
      for (const [cx, sx] of [[0, 1], [800, -1]] as const) {
        for (let k = 0; k < 7; k++) { const a = (k / 6) * Math.PI / 2; ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx + sx * Math.cos(a) * 110, Math.sin(a) * 110); ctx.stroke(); }
        for (let r = 20; r < 110; r += 18) { ctx.beginPath(); for (let k = 0; k <= 6; k++) { const a = (k / 6) * Math.PI / 2, rr = r * (k % 2 ? 0.92 : 1); const px = cx + sx * Math.cos(a) * rr, py = Math.sin(a) * rr; if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.stroke(); }
      }
      // The filing cabinet, left, a drawer hanging open; paint cans and the space heater, right
      ctx.fillStyle = '#3F4A3C'; ctx.fillRect(18, 330, 70, 190); ctx.fillStyle = '#2E372C'; for (let k = 0; k < 4; k++) ctx.fillRect(22, 338 + k * 46, 62, 40);
      ctx.fillStyle = '#4B5848'; ctx.fillRect(14, 390, 78, 30); ctx.fillStyle = '#E7E5E4'; ctx.fillRect(22, 384, 10, 8); ctx.fillRect(36, 382, 10, 10); ctx.fillRect(52, 385, 10, 7);
      for (let k = 0; k < 3; k++) { ctx.fillStyle = ['#7F1D1D', '#1E3A8A', '#A16207'][k]; ctx.fillRect(720 + (k % 2) * 30, 470 - Math.floor(k / 2) * 44 - (k === 2 ? 0 : 0), 34, 44); ctx.fillStyle = '#A8A29E'; ctx.fillRect(720 + (k % 2) * 30, 470 - Math.floor(k / 2) * 44, 34, 4); }
      ctx.fillStyle = '#292524'; ctx.fillRect(650, 456, 54, 64);
      ctx.fillStyle = `rgba(249, 115, 22, ${0.75 + Math.sin(t * 0.08) * 0.15})`; for (let k = 0; k < 3; k++) ctx.fillRect(656, 466 + k * 16, 42, 6);
      ctx.fillStyle = 'rgba(249, 115, 22, 0.08)'; ctx.beginPath(); ctx.ellipse(677, 520, 90, 18, 0, 0, Math.PI * 2); ctx.fill();
      // Dark all round the edges
      const v = ctx.createRadialGradient(400, 300, 180, 400, 300, 520);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.75)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, 800, 600);
    };
    const tick = () => { draw(); t++; raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvas} width={1600} height={1200} className="absolute inset-0 w-full h-full" />;
};

/** The damage report, on the garage wall (from the second set on): the targets on it, and how each one died. */
export interface GarageReport { bosses: string[]; killRecords: Record<string, WeaponType | null> }

const Garage: React.FC<{ onLeave: () => void; weapons: WeaponType[]; report?: GarageReport }> = ({ onLeave, weapons, report }) => {
  /** Out back at the practice range (the garage's keys and pad do nothing meanwhile). */
  const [practice, setPractice] = useState(false);
  const practiceRef = useRef(practice); practiceRef.current = practice;
  const canvas = useRef<HTMLCanvasElement>(null);
  const owned = useMemo(() => ownedSouvenirs(), []);
  // (the souvenirs, and then the way out back to the practice range: it's one of the things to go through, so the
  // stick and the arrows get to it like anything else)
  const order = useMemo(() => SOUVENIR_ORDER.filter(id => owned.includes(id)), [owned]);
  const [sel, setSel] = useState<string | null>(order[0] ?? null);
  useCursorSound(sel);
  const selRef = useRef(sel); selRef.current = sel;
  /** Looking at the picked one up close (A on it, Enter, or a click). */
  const [inspect, setInspect] = useState(false);
  const inspectRef = useRef(inspect); inspectRef.current = inspect;
  const look = () => { if (selRef.current && selRef.current !== RANGE) setInspect(true); };
  const lookRef = useRef(look); lookRef.current = look;
  const leaveRef = useRef(onLeave); leaveRef.current = onLeave;
  /** The damage report up (X): which target's file, and which page (0 before, 1 after). */
  const reportOn = !!report && report.bosses.length > 0;
  const [showReport, setShowReport] = useState(false);
  // (a souvenir up close, the range, the damage report: in with an OK, out with a BACK)
  useOpenCloseSound(inspect); useOpenCloseSound(practice); useOpenCloseSound(showReport);
  const reportRef = useRef(showReport); reportRef.current = showReport;
  const reportOnRef = useRef(reportOn); reportOnRef.current = reportOn;
  const [rIndex, setRIndex] = useState(0);
  const [rView, setRView] = useState(1);
  const nBosses = report?.bosses.length ?? 0;
  const nRef = useRef(nBosses); nRef.current = nBosses;
  const reportMove = (dx: number, dy: number) => {
    const n = nRef.current;
    if (!n) return;
    setRIndex(i => dx ? (Math.floor(i / 4) * 4 + ((i % 4) + dx + 4) % 4) % n : Math.max(0, Math.min(n - 1, i + dy * 4)));
  };
  const reportView = (d: number) => setRView(v => (v + d + 2) % 2);
  const toggleReport = () => { if (reportOnRef.current) setShowReport(v => !v); };

  // Round the souvenirs, the way they're laid out (only them: out back to the range and the damage report have their own
  // buttons): left and right to the nearest one that way along the same shelf (or the pegboard, or the floor), up and down
  // to the nearest one above or below
  const step = (dx: number, dy: number) => {
    if (!order.length) return;
    const cur = selRef.current && order.includes(selRef.current) ? selRef.current : null;
    if (!cur) { setSel(order[0]); return; }
    const mid = (id: string) => { const b = SLOTS[id].box; return { x: b.x + b.w / 2, y: b.y + b.h / 2 }; };
    const c = mid(cur);
    let best: string | null = null, bestScore = Infinity;
    for (const id of order) {
      if (id === cur) continue;
      const m = mid(id), along = dx ? (m.x - c.x) * dx : (m.y - c.y) * dy, across = dx ? Math.abs(m.y - c.y) : Math.abs(m.x - c.x);
      if (along <= 4) continue;
      const score = along + across * 3;
      if (score < bestScore) { bestScore = score; best = id; }
    }
    if (best) setSel(best);
  };
  const stepRef = useRef(step); stepRef.current = step;

  // The room, drawn every frame (the tube flickers, the lamp bubbles, the clock ticks)
  useEffect(() => {
    let raf = 0, t = 0;
    const tick = () => {
      const ctx = canvas.current?.getContext('2d');
      // (not while he's out back at the range: it covers the room, and both drawing at once was a drag)
      if (ctx && !practiceRef.current) { ctx.setTransform(canvas.current!.width / GARAGE_W, 0, 0, canvas.current!.height / GARAGE_H, 0, 0); drawGarage(ctx, t++, owned, selRef.current); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [owned]);

  // The keyboard and the pad: through the souvenirs, and out
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (practiceRef.current) return;
      const k = e.key.toLowerCase();
      // The damage report: round the files, round the pages, and X (or Esc) to put it away
      if (reportRef.current) {
        e.preventDefault();
        if (k === 'x' || k === 'escape' || k === 'backspace') setShowReport(false);
        else if (k === 'tab' || k === 'enter' || k === ' ') reportView(e.shiftKey ? -1 : 1);
        else if (k === 'arrowright' || k === 'd') reportMove(1, 0);
        else if (k === 'arrowleft' || k === 'a') reportMove(-1, 0);
        else if (k === 'arrowdown' || k === 's') reportMove(0, 1);
        else if (k === 'arrowup' || k === 'w') reportMove(0, -1);
        return;
      }
      if (k === 'x' && !inspectRef.current) { toggleReport(); return; }
      if ((k === 'enter' || k === ' ') && selRef.current === RANGE && !inspectRef.current) { e.preventDefault(); setPractice(true); return; }
      // (up close: Esc puts it back; Enter does too)
      if (inspectRef.current && (k === 'escape' || k === 'backspace' || k === 'enter' || k === ' ')) { e.preventDefault(); setInspect(false); return; }
      if (k === 'enter' || k === ' ') { e.preventDefault(); lookRef.current(); return; }
      // (and straight there from anywhere in the garage: the button shown on it)
      if (k === 'r') { setPractice(true); return; }
      if (k === 'escape' || k === 'backspace') { e.preventDefault(); leaveRef.current(); }
      else if (k === 'arrowright' || k === 'd') stepRef.current(1, 0);
      else if (k === 'arrowleft' || k === 'a') stepRef.current(-1, 0);
      else if (k === 'arrowdown' || k === 's') stepRef.current(0, 1);
      else if (k === 'arrowup' || k === 'w') stepRef.current(0, -1);
    };
    const onMouse = (e: MouseEvent) => { if (e.button === 2 && !practiceRef.current) { if (reportRef.current) setShowReport(false); else if (inspectRef.current) setInspect(false); else leaveRef.current(); } };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onMouse);
    let raf = 0, last = 0, prevB = true, prevA = true, prevY = true, prevX = true, prevL = true, prevR = true;
    const poll = () => {
      const gp = getActiveGamepad();
      if (gp && practiceRef.current) { prevB = true; prevA = true; prevY = true; prevX = true; }
      else if (gp && reportRef.current) {
        // (the damage report's up: the stick round the files, the shoulders round the pages, X or B to put it away)
        const now = Date.now(), m = getGamepadMovement(gp, 0.3);
        const dx = m.left ? -1 : m.right ? 1 : 0, dy = m.up ? -1 : m.down ? 1 : 0;
        if ((dx || dy) && now - last > REPEAT_MS) { last = now; reportMove(dx, dy); }
        const x = isButtonPressed(gp, GP_BUTTONS.X), b = isButtonPressed(gp, menuButtons(gp).back);
        const l = isButtonPressed(gp, GP_BUTTONS.LB), r = isButtonPressed(gp, GP_BUTTONS.RB);
        if ((x && !prevX) || (b && !prevB)) setShowReport(false);
        if (l && !prevL) reportView(-1);
        if (r && !prevR) reportView(1);
        prevX = x; prevB = b; prevL = l; prevR = r; prevA = true; prevY = true;
      }
      else if (gp) {
        const now = Date.now(), m = getGamepadMovement(gp, 0.3);
        const dx = m.left ? -1 : m.right ? 1 : 0, dy = dx ? 0 : m.up ? -1 : m.down ? 1 : 0;
        if ((dx || dy) && now - last > REPEAT_MS) { last = now; stepRef.current(dx, dy); }
        const mb = menuButtons(gp), b = isButtonPressed(gp, mb.back), a = isButtonPressed(gp, mb.ok);
        if (b && !prevB) { if (inspectRef.current) setInspect(false); else leaveRef.current(); }
        const y = isButtonPressed(gp, GP_BUTTONS.Y);
        if (a && !prevA) { if (inspectRef.current) setInspect(false); else if (selRef.current === RANGE) setPractice(true); else lookRef.current(); }
        if (y && !prevY && !inspectRef.current) setPractice(true);
        const x = isButtonPressed(gp, GP_BUTTONS.X);
        if (x && !prevX && !inspectRef.current) toggleReport();
        prevB = b; prevA = a; prevY = y; prevX = x;
      }
      raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onMouse); cancelAnimationFrame(raf); };
  }, []);

  const s = SOUVENIRS.find(x => x.id === sel);
  return (
    <div className="absolute inset-0 z-[75] bg-black select-none animate-in fade-in duration-500" style={{ fontFamily: '"Press Start 2P", monospace' }}
      onContextMenu={e => e.preventDefault()}>
      <canvas ref={canvas} width={GARAGE_W * 2} height={GARAGE_H * 2} className="absolute inset-0 w-full h-full" />
      {/* The souvenirs to point at */}
      {order.filter(id => id !== RANGE).map(id => {
        const b = SLOTS[id].box;
        return <div key={id} className="absolute cursor-pointer" style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
          onMouseEnter={() => setSel(id)} onClick={() => { setSel(id); setInspect(true); }} />;
      })}
      {/* The title, the count */}
      <div className="absolute left-0 right-0 top-[6px] flex items-center justify-between px-3 pointer-events-none">
        <span className="text-[12px] text-yellow-300 italic [text-shadow:2px_2px_0_#7F1D1D,4px_4px_0_#000]">MEATHEAD'S GARAGE</span>
        <span className="text-[8px] text-white/80 [text-shadow:1px_1px_0_#000]">SOUVENIRS {owned.length}/{SOUVENIRS.length}</span>
      </div>
      {/* The tag on whatever's picked */}
      <div className="absolute left-[130px] right-[10px] bottom-[8px] min-h-[46px] px-3 py-2 border-2 border-yellow-500 bg-black shadow-[3px_3px_0_#000] pointer-events-none">
        {s ? (
          <>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[10px] text-yellow-300">{s.name}</span>
              <span className="text-[6px] text-cyan-300/90 shrink-0">FROM: {s.boss.toUpperCase()}</span>
            </div>
            <div className="mt-1 text-[7px] leading-[11px] text-white/90">"{s.note}"</div>
            <Prompt pad={['OK']} kb={['ENTER']} mouse="left" label="LOOK CLOSER" size={12} className="mt-1 text-[6px] text-zinc-400" />
          </>
        ) : sel === RANGE ? (
          <>
            <div className="text-[10px] text-red-400">THE PRACTICE RANGE</div>
            <div className="mt-1 text-[7px] leading-[11px] text-white/90">OUT BACK. A RING, TWO GUYS WHO NEED THE MONEY, AND EVERYTHING HE'S GOT TO TRY ON THEM.</div>
          </>
        ) : (
          <div className="text-[8px] leading-[12px] text-white/80">NOTHING IN HERE YET. GO KILL SOMEBODY AND BRING SOMETHING HOME.</div>
        )}
      </div>
      <button onClick={() => onLeave()}
        className="absolute left-[10px] bottom-[8px] px-3 py-3 text-[9px] text-black bg-yellow-400 border-2 border-black shadow-[3px_3px_0_#000]">
        <span className="inline-flex items-center gap-2"><Prompt pad={['BACK']} kb={['ESC']} size={14} />◀ MAP</span>
      </button>
      {/* Out back: the practice range */}
      <button onClick={() => setPractice(true)} onMouseEnter={() => setSel(RANGE)}
        className={`absolute right-[10px] top-[26px] px-3 py-2 text-[8px] text-black border-2 shadow-[3px_3px_0_#000] ${sel === RANGE ? 'bg-yellow-400 border-white animate-pulse' : 'bg-red-500 border-black'}`}>
        <span className="inline-flex items-center gap-2">
          <Prompt pad={['Y']} kb={['R']} size={18} />
          PRACTICE RANGE ▶
        </span>
      </button>
      {inspect && s && <Closeup id={s.id} name={s.name} note={s.note} boss={s.boss} onClose={() => setInspect(false)} />}
      {/* On the wall: the damage report (from the second set on) */}
      {reportOn && (
        <button onClick={() => setShowReport(true)}
          className="absolute right-[10px] top-[62px] px-3 py-2 text-[8px] text-white bg-red-900 border-2 border-red-500 shadow-[3px_3px_0_#000] hover:bg-red-800">
          <span className="inline-flex items-center gap-2"><Prompt pad={['X']} kb={['X']} size={18} />DAMAGE REPORT</span>
        </button>
      )}
      {showReport && report && (
        <div className="absolute inset-0 z-[85] bg-black flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300" onContextMenu={e => e.preventDefault()}>
          <GarageCorner />
          <div className="relative w-full h-full flex flex-col items-center"><DamageReport bosses={report.bosses} index={Math.min(rIndex, report.bosses.length - 1)} view={rView} killRecords={report.killRecords}
            onSelect={setRIndex} onView={setRView} onClose={() => setShowReport(false)} closeLabel="PUT IT AWAY" titleClass={setTitleClass('DAMAGE REPORT')} /></div>
        </div>
      )}
      {practice && <PracticeRange weapons={weapons} onLeave={() => setPractice(false)} />}
    </div>
  );
};

export default Garage;
