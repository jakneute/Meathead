import React, { useEffect, useRef, useState } from 'react';
import { GP_BUTTONS } from '../game/platform/gamepad';
import { hasRightStick } from '../game/platform/device';
import { WeaponType } from '../types';
import { DOSSIERS, DOSSIER_HEADER, AFTERMATHS } from '../content/dossiers';
import { BOSS_LOCATIONS } from '../content/roster';
import BossPortrait from './BossPortrait';
import CorpsePhoto from './CorpsePhoto';
import GaragePortrait from './GaragePortrait';
import { GARAGE_ID, GARAGE_DOSSIER } from '../content/garage';

/** Right stick: how far it has to go before it scrolls, and how fast it scrolls at full tilt (px a frame). */
const STICK_DEADZONE = 0.2, STICK_SPEED = 7;

/** The scroll off a pad: the right stick's up/down; on a pad without one (one Joy-Con), its stick while the top button's held. */
const rightStickY = () => {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return 0;
  try {
    for (const gp of navigator.getGamepads()) {
      if (!gp || gp.connected === false || !gp.axes) continue;
      // (a pad with a right stick: that, and only that; one Joy-Con, with the one stick: that stick, while the top
      // button's held)
      const y = hasRightStick(gp.id) ? gp.axes[3] : gp.buttons?.[GP_BUTTONS.Y]?.pressed ? gp.axes[1] : undefined;
      if (typeof y === 'number' && Math.abs(y) > STICK_DEADZONE) return y;
    }
  } catch { /* no pads */ }
  return 0;
};

/**
 * Easter egg: the blacked-out words can be read. Click one, or keep X held down from the map into the file for a
 * couple of seconds (the bars go grey as it comes), and they're uncovered. Only in this file, and only while it's up:
 * moving to another file (or back) blacks them all out again.
 */
const DECLASSIFY_HOLD_MS = 2000;
/** X held on the keyboard right now (kept track of all along, so a hold that started on the map counts). */
let xKeyDown = false;
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', e => { if (e.key.toLowerCase() === 'x') xKeyDown = true; });
  window.addEventListener('keyup', e => { if (e.key.toLowerCase() === 'x') xKeyDown = false; });
  window.addEventListener('blur', () => { xKeyDown = false; });
}
const padXDown = () => {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return false;
  try { for (const gp of navigator.getGamepads()) if (gp && gp.connected !== false && gp.buttons?.[GP_BUTTONS.X]?.pressed) return true; } catch { /* no pads */ }
  return false;
};

interface DossierPanelProps {
  bossId: string;
  defeated: boolean;
  /** He died to his weakness with this weapon: the file gets an evidence photo of the corpse. */
  corpseWeapon?: WeaponType | null;
}

/**
 * A classified file on the selected boss: a typewritten, stamped and coffee-stained
 * dossier. Once he's dead it becomes the after-action report instead.
 */
const DossierPanel: React.FC<DossierPanelProps> = ({ bossId, defeated, corpseWeapon }) => {
  // (the garage has a file too: what the analysts could make of it, which isn't much)
  const garage = bossId === GARAGE_ID;
  const d = garage ? { ...GARAGE_DOSSIER, mission: '', reality: '', background: '', intel: '', rules: '', notAlive: '' } : DOSSIERS[bossId];
  const loc = garage ? undefined : BOSS_LOCATIONS[bossId];
  // The blacked-out bits: uncovered by a click on one, or by X held from the map into the file
  const [revealed, setRevealed] = useState(false);
  const [holding, setHolding] = useState(0);
  const declassify = () => { setRevealed(true); setHolding(0); };
  useEffect(() => {
    // (a different file: blacked out again)
    setRevealed(false); setHolding(0);
    // (only a hold that's on as the file opens: the X that brought him here, kept down)
    if (!xKeyDown && !padXDown()) return;
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      if (!xKeyDown && !padXDown()) { setHolding(0); return; }
      const k = Math.min(1, (performance.now() - start) / DECLASSIFY_HOLD_MS);
      setHolding(k);
      if (k >= 1) { declassify(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [bossId]);
  // Too long for the page: our own scroll bar (the browser's is hidden), moved by the mouse wheel, the right stick or dragging it
  const body = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ top: 0, height: 1, client: 1 });
  const measure = () => { const el = body.current; if (el) setView({ top: el.scrollTop, height: el.scrollHeight, client: el.clientHeight }); };
  useEffect(() => { if (body.current) body.current.scrollTop = 0; measure(); }, [bossId, defeated, corpseWeapon]);
  // (the evidence photo and the like can change the page's length after it's up)
  useEffect(() => {
    const el = body.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    for (let i = 0; i < el.children.length; i++) ro.observe(el.children[i]);
    return () => ro.disconnect();
  }, [bossId, defeated, corpseWeapon]);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const y = rightStickY();
      const el = body.current;
      if (el && y) {
        const k = (Math.abs(y) - STICK_DEADZONE) / (1 - STICK_DEADZONE);
        el.scrollTop += Math.sign(y) * k * STICK_SPEED;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const drag = useRef<{ y: number; top: number } | null>(null);
  if (!d) return null;
  const overflow = view.height - view.client > 2;
  const TRACK_PAD = 6;
  const trackH = view.client - TRACK_PAD * 2;
  const thumbH = Math.max(24, trackH * view.client / view.height);
  const maxTop = Math.max(1, view.height - view.client);
  const thumbY = TRACK_PAD + (trackH - thumbH) * Math.min(1, view.top / maxTop);
  const onThumbDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, top: view.top };
  };
  const onThumbMove = (e: React.PointerEvent) => {
    const el = body.current;
    if (!drag.current || !el) return;
    el.scrollTop = drag.current.top + (e.clientY - drag.current.y) * maxTop / Math.max(1, trackH - thumbH);
  };
  const onThumbUp = () => { drag.current = null; };
  const after = defeated && !garage ? AFTERMATHS[bossId] : undefined;
  const typewriter: React.CSSProperties = { fontFamily: '"Courier New", Courier, monospace' };
  const field = (label: string, value: string) => (
    <div className="leading-[10px]"><span className="font-bold text-[#7F1D1D]">{label}: </span>{value}</div>
  );
  // (a line with parts blacked out: [[like this]]; uncovered, they show through a yellow highlighter)
  const redacted = (body: string) => body.split(/(\[\[.*?\]\])/).map((part, i) => part.startsWith('[[')
    ? (revealed
      ? <span key={i} className="bg-[#FDE047]/80 text-[#7F1D1D] font-bold px-[1px] animate-in fade-in duration-700">{part.slice(2, -2)}</span>
      : <span key={i} onClick={declassify} title="" className="text-transparent select-none px-[1px] cursor-pointer"
          style={{ background: `rgba(28, 25, 23, ${1 - holding * 0.6})` }}>{part.slice(2, -2)}</span>)
    : <React.Fragment key={i}>{part}</React.Fragment>);
  const section = (title: string, body: React.ReactNode) => (
    <div className="mt-[5px]">
      <div className="font-bold text-[#7F1D1D] tracking-wider border-b border-[#7F1D1D]/40 mb-[2px] leading-[10px]">{title}</div>
      <div className="leading-[10px]">{body}</div>
    </div>
  );

  return (
    <div className="relative w-full h-[430px] overflow-hidden text-left text-[#1C1917] text-[8px] uppercase animate-in fade-in duration-200"
      style={{
        ...typewriter,
        background: 'linear-gradient(180deg, #E8DCC0 0%, #DDCCA6 100%)',
        boxShadow: 'inset 0 0 30px rgba(120, 90, 40, 0.35), 3px 3px 0 #000',
        border: '2px solid #8B7B5A',
      }}>
      {/* Coffee ring */}
      <div className="absolute right-[26px] bottom-[34px] w-[64px] h-[64px] rounded-full pointer-events-none" style={{ border: '5px solid rgba(110, 70, 30, 0.18)' }} />

      <style>{'.dossier-body::-webkit-scrollbar { display: none; }'}</style>
      <div ref={body} onScroll={measure} className={`dossier-body relative h-full overflow-y-auto pt-2 pb-1 pl-3 ${overflow ? 'pr-[16px]' : 'pr-3'}`} style={{ scrollbarWidth: 'none', overscrollBehavior: 'contain' }}>
        {/* The rubber stamp: across the corner of the photo, off the writing; it's on the paper, so it goes up with the
            rest of the file as it's scrolled (and off the top, a long way down it) */}
        <div className="absolute top-[74px] left-[4px] rotate-[-12deg] text-[10px] px-[6px] py-[1px] font-bold tracking-widest pointer-events-none z-10"
          style={{ background: 'rgba(232, 220, 192, 0.85)', color: garage ? 'rgba(161, 98, 7, 0.9)' : defeated ? 'rgba(21, 128, 61, 0.85)' : 'rgba(185, 28, 28, 0.85)', border: `3px solid ${garage ? 'rgba(161, 98, 7, 0.8)' : defeated ? 'rgba(21, 128, 61, 0.75)' : 'rgba(185, 28, 28, 0.75)'}` }}>
          {garage ? 'UNVERIFIED' : defeated ? 'DISPOSED OF' : 'TERMINATE'}
        </div>
        <div className="flex justify-between items-start text-[7px] tracking-widest text-[#44403C] border-b-2 border-[#1C1917] pb-[3px] mb-[5px]">
          <span>{DOSSIER_HEADER}</span>
          <span className="text-[#B91C1C] font-bold">TOP SECRET</span>
        </div>

        <div className="flex gap-2">
          {/* Mugshot, paper-clipped to the file */}
          <div className="relative shrink-0 w-[74px] h-[82px] bg-black border-2 border-[#57534E] rotate-[-2deg]" style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.4)' }}>
            <div className={after ? 'w-full h-full grayscale contrast-125' : 'w-full h-full'}>{garage ? <GaragePortrait /> : <BossPortrait id={bossId} dead={after} />}</div>
            {after && (
              <svg viewBox="0 0 10 10" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                <path d="M1 1 L9 9 M9 1 L1 9" stroke="rgba(185, 28, 28, 0.85)" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
            )}
            <div className="absolute -top-[6px] left-[10px] w-[10px] h-[22px] border-2 border-[#71717A] rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold leading-[13px] mb-[2px]">{bossId}</div>
            {field('REAL NAME', d.realName)}
            {field('AGE', d.age)}
            {loc && field('LAST SEEN', `${loc.city}, ${loc.state}`)}
            {garage && field('LAST SEEN', 'SEVERAL PLACES. SIMULTANEOUSLY.')}
            {after ? field('STATUS', corpseWeapon ? 'DECEASED. EXTREMELY.' : 'DECEASED.') : field('THREAT', d.threat)}
          </div>
        </div>

        <div className="mt-[4px] leading-[10px]"><span className="font-bold text-[#7F1D1D]">OCCUPATION: </span>{d.occupation}</div>
        {garage ? (
          <>
            {section('LOCATION', GARAGE_DOSSIER.location)}
            {section('WHAT WE THINK IT IS', GARAGE_DOSSIER.whatItIs)}
            {section('CONTENTS (ESTIMATED)', GARAGE_DOSSIER.contents)}
            {section('RECOMMENDATION', GARAGE_DOSSIER.recommendation)}
            <div className="mt-[6px] p-[4px] leading-[10px] bg-[#FEF3C7] border border-[#A16207]/50 rotate-[-0.6deg]" style={{ boxShadow: '1px 1px 0 rgba(0,0,0,0.25)' }}>
              <span className="font-bold">HANDLER'S NOTE: </span>{GARAGE_DOSSIER.handler}
            </div>
          </>
        ) : after ? (
          <>
            {section('REMAINS', corpseWeapon ? after.remains.weakness : after.remains.normal)}
            {section('AFTERMATH', after.aftermath)}
            {section('COLLATERAL DAMAGE', after.collateral)}
            <div className="flex gap-2 items-start">
              {/* (the evidence photo: what's left of him after his weakness, or him where he fell after anything else) */}
              {(
                <div className="relative shrink-0 w-[150px] mt-[7px] p-[3px] pb-[2px] bg-[#F5F5F4] rotate-[1.5deg]" style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.35)' }}>
                  <CorpsePhoto bossId={bossId} weapon={corpseWeapon ?? null} />
                  <div className="text-[6.5px] leading-[9px] text-center text-[#44403C] mt-[1px]">{corpseWeapon ? "EXHIBIT A: WHAT'S LEFT" : 'EXHIBIT A: WHERE HE FELL'}</div>
                  {/* Tape holding it to the file */}
                  <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-[40px] h-[10px] bg-[#FEF9C3]/70 rotate-[-3deg]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {section('OFFICIAL FINDING', after.finding)}
              </div>
            </div>
            <div className="mt-[6px] p-[4px] leading-[10px] bg-[#FEF3C7] border border-[#A16207]/50 rotate-[-0.6deg]" style={{ boxShadow: '1px 1px 0 rgba(0,0,0,0.25)' }}>
              <span className="font-bold">HANDLER'S NOTE, POST-OP: </span>{redacted(after.handler)}
            </div>
          </>
        ) : (
          <>
            {section('BACKGROUND', d.background)}
            {section('WHAT HE THINKS HE\'S DOING', d.mission)}
            {section('WHAT HE\'S ACTUALLY DOING', d.reality)}
            {section('FIELD INTEL', d.intel)}
            {section('RULES OF ENGAGEMENT', d.rules)}
            {section('WHY NOT BRING HIM IN ALIVE', redacted(d.notAlive))}
            <div className="mt-[6px] p-[4px] leading-[10px] bg-[#FEF3C7] border border-[#A16207]/50 rotate-[-0.6deg]" style={{ boxShadow: '1px 1px 0 rgba(0,0,0,0.25)' }}>
              <span className="font-bold">HANDLER'S NOTE RE: ASSET "MEATHEAD": </span>{redacted(d.handler)}
            </div>
          </>
        )}
      </div>

      {/* The scroll bar: a strip of tape down the edge of the file, and a tab on it that says where you are */}
      {overflow && (
        <>
          <div className="absolute right-[3px] w-[7px] rounded-[2px] pointer-events-none" style={{ top: TRACK_PAD, height: trackH, background: 'rgba(87, 83, 78, 0.25)', border: '1px solid rgba(87, 83, 78, 0.35)' }} />
          <div className="absolute right-[2px] w-[9px] rounded-[2px] cursor-pointer touch-none"
            onPointerDown={onThumbDown} onPointerMove={onThumbMove} onPointerUp={onThumbUp} onPointerCancel={onThumbUp}
            style={{ top: thumbY, height: thumbH, background: '#7F1D1D', boxShadow: '1px 1px 0 rgba(0,0,0,0.4)' }} />
          {view.top < maxTop - 2 && (
            <div className="absolute left-0 right-[14px] bottom-0 h-[26px] flex items-end justify-center pb-[2px] pointer-events-none text-[9px] font-bold text-[#7F1D1D]"
              style={{ background: 'linear-gradient(180deg, rgba(221, 204, 166, 0) 0%, rgba(221, 204, 166, 0.95) 70%)' }}>▼ MORE ▼</div>
          )}
        </>
      )}

    </div>
  );
};

export default DossierPanel;
