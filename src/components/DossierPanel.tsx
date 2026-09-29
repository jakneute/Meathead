import React, { useEffect, useRef, useState } from 'react';
import { WeaponType } from '../types';
import { DOSSIERS, DOSSIER_HEADER, AFTERMATHS } from '../content/dossiers';
import { BOSS_LOCATIONS } from '../content/roster';
import BossPortrait from './BossPortrait';
import CorpsePhoto from './CorpsePhoto';

/** Right stick: how far it has to go before it scrolls, and how fast it scrolls at full tilt (px a frame). */
const STICK_DEADZONE = 0.2, STICK_SPEED = 7;

/** The right stick's up/down, from whichever pad is pushing it. */
const rightStickY = () => {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return 0;
  try {
    for (const gp of navigator.getGamepads()) {
      const y = gp && gp.connected !== false && gp.axes ? gp.axes[3] : undefined;
      if (typeof y === 'number' && Math.abs(y) > STICK_DEADZONE) return y;
    }
  } catch { /* no pads */ }
  return 0;
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
  const d = DOSSIERS[bossId];
  const loc = BOSS_LOCATIONS[bossId];
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
  const after = defeated ? AFTERMATHS[bossId] : undefined;
  const typewriter: React.CSSProperties = { fontFamily: '"Courier New", Courier, monospace' };
  const field = (label: string, value: string) => (
    <div className="leading-[10px]"><span className="font-bold text-[#7F1D1D]">{label}: </span>{value}</div>
  );
  const section = (title: string, body: string) => (
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
      <div ref={body} onScroll={measure} className={`dossier-body h-full overflow-y-auto pt-2 pb-1 pl-3 ${overflow ? 'pr-[16px]' : 'pr-3'}`} style={{ scrollbarWidth: 'none', overscrollBehavior: 'contain' }}>
        <div className="flex justify-between items-start text-[7px] tracking-widest text-[#44403C] border-b-2 border-[#1C1917] pb-[3px] mb-[5px]">
          <span>{DOSSIER_HEADER}</span>
          <span className="text-[#B91C1C] font-bold">TOP SECRET</span>
        </div>

        <div className="flex gap-2">
          {/* Mugshot, paper-clipped to the file */}
          <div className="relative shrink-0 w-[74px] h-[82px] bg-black border-2 border-[#57534E] rotate-[-2deg]" style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.4)' }}>
            <div className={after ? 'w-full h-full grayscale contrast-125' : 'w-full h-full'}><BossPortrait id={bossId} /></div>
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
            {after ? field('STATUS', corpseWeapon ? 'DECEASED. EXTREMELY.' : 'DECEASED.') : field('THREAT', d.threat)}
          </div>
        </div>

        <div className="mt-[4px] leading-[10px]"><span className="font-bold text-[#7F1D1D]">OCCUPATION: </span>{d.occupation}</div>
        {after ? (
          <>
            {section('REMAINS', corpseWeapon ? after.remains.weakness : after.remains.normal)}
            {section('AFTERMATH', after.aftermath)}
            {section('COLLATERAL DAMAGE', after.collateral)}
            <div className="flex gap-2 items-start">
              {corpseWeapon && (
                <div className="relative shrink-0 w-[150px] mt-[7px] p-[3px] pb-[2px] bg-[#F5F5F4] rotate-[1.5deg]" style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.35)' }}>
                  <CorpsePhoto bossId={bossId} weapon={corpseWeapon} />
                  <div className="text-[6.5px] leading-[9px] text-center text-[#44403C] mt-[1px]">EXHIBIT A: WHAT'S LEFT</div>
                  {/* Tape holding it to the file */}
                  <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-[40px] h-[10px] bg-[#FEF9C3]/70 rotate-[-3deg]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {section('OFFICIAL FINDING', after.finding)}
              </div>
            </div>
            <div className="mt-[6px] p-[4px] leading-[10px] bg-[#FEF3C7] border border-[#A16207]/50 rotate-[-0.6deg]" style={{ boxShadow: '1px 1px 0 rgba(0,0,0,0.25)' }}>
              <span className="font-bold">HANDLER'S NOTE, POST-OP: </span>{after.handler}
            </div>
          </>
        ) : (
          <>
            {section('BACKGROUND', d.background)}
            {section('WHAT HE THINKS HE\'S DOING', d.mission)}
            {section('WHAT HE\'S ACTUALLY DOING', d.reality)}
            {section('FIELD INTEL', d.intel)}
            {section('APPROVED DISPOSAL', d.disposal)}
            <div className="mt-[6px] p-[4px] leading-[10px] bg-[#FEF3C7] border border-[#A16207]/50 rotate-[-0.6deg]" style={{ boxShadow: '1px 1px 0 rgba(0,0,0,0.25)' }}>
              <span className="font-bold">HANDLER'S NOTE RE: ASSET "MEATHEAD": </span>{d.handler}
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

      {/* Rubber stamps */}
      <div className={`absolute ${defeated ? 'top-[72px]' : 'top-[34px]'} right-[10px] rotate-[14deg] px-[6px] py-[1px] text-[14px] font-bold tracking-widest pointer-events-none`}
        style={{ color: defeated ? 'rgba(21, 128, 61, 0.75)' : 'rgba(185, 28, 28, 0.75)', border: `3px solid ${defeated ? 'rgba(21, 128, 61, 0.75)' : 'rgba(185, 28, 28, 0.75)'}` }}>
        {defeated ? 'DISPOSED OF' : 'TERMINATE'}
      </div>
    </div>
  );
};

export default DossierPanel;
