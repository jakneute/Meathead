import React, { useEffect, useRef, useState } from 'react';
import { GP_BUTTONS } from '../game/platform/gamepad';
import { hasRightStick } from '../game/platform/device';
import { WeaponType } from '../types';
import { DOSSIERS, DOSSIER_HEADER, AFTERMATHS } from '../content/dossiers';
import { BOSS_LOCATIONS, WEAPON_NAMES } from '../content/roster';
import BossPortrait from './BossPortrait';
import CorpsePhoto from './CorpsePhoto';
import GaragePortrait from './GaragePortrait';
import { GARAGE_ID, GARAGE_DOSSIER } from '../content/garage';
import { lastSouvenirOf } from '../game/garage/store';
import { WHITE_HOUSE_ID, WHITE_HOUSE_DOSSIER, WHITE_HOUSE_LOCATION } from '../content/whiteHouse';
import { GYM_DOSSIER_ID, GYM_DOSSIER } from '../content/gymDossier';
import MeatheadCaricature from './MeatheadCaricature';
import { hasEverShat } from '../game/player/gut';

/** The White House, for its file's photo: the north portico, its columns and the flag, on a gray sky. */
const WhiteHousePhoto: React.FC = () => (
  <svg viewBox="0 0 74 82" className="w-full h-full">
    <rect width="74" height="82" fill="#6B7280" />
    <rect y="60" width="74" height="22" fill="#4D7C0F" />
    <rect x="4" y="34" width="66" height="28" fill="#F5F5F4" />
    <path d="M22 34 L37 22 L52 34 Z" fill="#E7E5E4" stroke="#A8A29E" strokeWidth="0.6" />
    {[0, 1, 2, 3, 4, 5].map(k => <rect key={k} x={6 + k * 11} y="40" width="4" height="7" fill="#57534E" />)}
    {[0, 1, 2, 3, 4, 5].map(k => <rect key={k} x={6 + k * 11} y="51" width="4" height="7" fill="#57534E" />)}
    {[0, 1, 2, 3].map(k => <rect key={k} x={25 + k * 7} y="34" width="2.4" height="28" fill="#FFFFFF" stroke="#D6D3D1" strokeWidth="0.4" />)}
    <rect x="36.6" y="8" width="0.8" height="15" fill="#44403C" />
    <rect x="37.4" y="8" width="9" height="6" fill="#B91C1C" /><rect x="37.4" y="8" width="4" height="3" fill="#1E3A8A" />
    <rect x="37.4" y="9.6" width="9" height="0.8" fill="#FFFFFF" /><rect x="37.4" y="11.6" width="9" height="0.8" fill="#FFFFFF" />
  </svg>
);

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

interface DossierPanelProps {
  bossId: string;
  defeated: boolean;
  /** He died to his weakness with this weapon: the file gets an evidence photo of the corpse. */
  corpseWeapon?: WeaponType | null;
  /** He killed him with his pants full (the aftermath file says so). */
  shat?: boolean;
}

/**
 * A classified file on the selected boss: a typewritten, stamped and coffee-stained
 * dossier. Once he's dead it becomes the after-action report instead.
 */
const DossierPanel: React.FC<DossierPanelProps> = ({ bossId, defeated, corpseWeapon, shat = false }) => {
  // (the garage has a file too: what the analysts could make of it, which isn't much)
  const garage = bossId === GARAGE_ID;
  // (and the White House has one too, once all eight are dead: the summons)
  const wh = bossId === WHITE_HOUSE_ID;
  // (and him: the department's orders on getting hold of him, only to be read paused in the gym)
  const asset = bossId === GYM_DOSSIER_ID;
  const d = garage ? { ...GARAGE_DOSSIER, mission: '', reality: '', arsenal: '', expect: '', resistance: '', background: '', intel: '', notAlive: '' }
    : wh ? { ...WHITE_HOUSE_DOSSIER, mission: '', reality: '', arsenal: '', expect: '', resistance: '', background: '', intel: '', notAlive: '' }
    : asset ? { ...GYM_DOSSIER, mission: '', reality: '', arsenal: '', expect: '', resistance: '', background: '', intel: '', notAlive: '' } : DOSSIERS[bossId];
  const loc = garage || asset ? undefined : wh ? WHITE_HOUSE_LOCATION : BOSS_LOCATIONS[bossId];
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
  const after = defeated && !garage && !wh ? AFTERMATHS[bossId] : undefined;
  const typewriter: React.CSSProperties = { fontFamily: '"Courier New", Courier, monospace' };
  const field = (label: string, value: string) => (
    <div className="leading-[10px]"><span className="font-bold text-[#7F1D1D]">{label}: </span>{value}</div>
  );
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
          style={{ background: 'rgba(232, 220, 192, 0.85)', color: garage || wh || asset ? 'rgba(161, 98, 7, 0.9)' : defeated ? 'rgba(21, 128, 61, 0.85)' : 'rgba(185, 28, 28, 0.85)', border: `3px solid ${garage || wh || asset ? 'rgba(161, 98, 7, 0.8)' : defeated ? 'rgba(21, 128, 61, 0.75)' : 'rgba(185, 28, 28, 0.75)'}` }}>
          {garage ? 'UNVERIFIED' : wh ? 'REPORT IN' : asset ? 'SECURE' : defeated ? 'DISPOSED OF' : 'TERMINATE'}
        </div>
        <div className="flex justify-between items-start text-[7px] tracking-widest text-[#44403C] border-b-2 border-[#1C1917] pb-[3px] mb-[5px]">
          <span>{DOSSIER_HEADER}</span>
          <span className="text-[#B91C1C] font-bold">TOP SECRET</span>
        </div>

        <div className="flex gap-2">
          {/* Mugshot, paper-clipped to the file */}
          <div className="relative shrink-0 w-[74px] h-[82px] bg-black border-2 border-[#57534E] rotate-[-2deg]" style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.4)' }}>
            <div className={after ? 'w-full h-full grayscale contrast-125' : 'w-full h-full'}>{garage ? <GaragePortrait /> : wh ? <WhiteHousePhoto /> : asset ? <div className="w-full h-full overflow-hidden bg-[#57534E]"><div style={{ width: 136, marginLeft: -31, marginTop: 2, transform: 'scale(0.56)', transformOrigin: 'top center' }}><MeatheadCaricature /></div></div> : <BossPortrait id={bossId} dead={after} />}</div>
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
            {asset && field('LAST SEEN', 'THE IRON PIT. ALWAYS.')}
            {after ? field('STATUS', corpseWeapon ? 'DECEASED. EXTREMELY.' : 'DECEASED.') : field('THREAT', d.threat)}
          </div>
        </div>

        <div className="mt-[4px] leading-[10px]"><span className="font-bold text-[#7F1D1D]">OCCUPATION: </span>{after ? after.occupation : d.occupation}</div>
        {asset ? (
          <>
            {section('THE ORDER', GYM_DOSSIER.order)}
            {section('THE APPROACH', GYM_DOSSIER.approach)}
            {section('THE DECOYS', GYM_DOSSIER.decoys)}
            {section('RISKS', GYM_DOSSIER.risks)}
            <div className="mt-[6px] p-[4px] leading-[10px] bg-[#FEF3C7] border border-[#A16207]/50 rotate-[-0.6deg]" style={{ boxShadow: '1px 1px 0 rgba(0,0,0,0.25)' }}>
              <span className="font-bold">HANDLER'S NOTE: </span>{GYM_DOSSIER.handler}
            </div>
          </>
        ) : wh ? (
          <>
            {section('THE SUMMONS', WHITE_HOUSE_DOSSIER.summons)}
            {section('INSTRUCTIONS', WHITE_HOUSE_DOSSIER.instructions)}
            {section('RISKS', WHITE_HOUSE_DOSSIER.risks)}
            {section('IRREGULARITIES', WHITE_HOUSE_DOSSIER.irregularities)}
            <div className="mt-[6px] p-[4px] leading-[10px] bg-[#FEF3C7] border border-[#A16207]/50 rotate-[-0.6deg]" style={{ boxShadow: '1px 1px 0 rgba(0,0,0,0.25)' }}>
              <span className="font-bold">HANDLER'S NOTE: </span>{WHITE_HOUSE_DOSSIER.handler}{hasEverShat() ? '' : ` ${WHITE_HOUSE_DOSSIER.spotless}`}
            </div>
          </>
        ) : garage ? (
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
            {/* (what he took home: whichever of the three it was) */}
            {(() => { const id = lastSouvenirOf(bossId); return id && after.taken[id] ? section('REMOVED FROM THE SCENE BY THE ASSET', after.taken[id]) : null; })()}
            {/* (the weapon he came away with, and how) */}
            {section(`ADDED TO THE ASSET'S ARSENAL: ${WEAPON_NAMES[bossId] ?? 'UNKNOWN'}`, after.procured)}
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
                {section('OFFICIAL FINDING', shat ? `${after.finding} ${after.shat.finding}` : after.finding)}
              </div>
            </div>
            <div className="mt-[6px] p-[4px] leading-[10px] bg-[#FEF3C7] border border-[#A16207]/50 rotate-[-0.6deg]" style={{ boxShadow: '1px 1px 0 rgba(0,0,0,0.25)' }}>
              <span className="font-bold">HANDLER'S NOTE, POST-OP: </span>{after.handler}{shat ? ` ${after.shat.handler}` : ''}
            </div>
          </>
        ) : (
          <>
            {section('BACKGROUND', d.background)}
            {section('WHAT HE THINKS HE\'S DOING', d.mission)}
            {section('WHAT HE\'S ACTUALLY DOING', d.reality)}
            {section('HOW HE FIGHTS', d.arsenal)}
            {d.resistance && section("WHO'S IN THE WAY", d.resistance)}
            {/* (the ground he's going in over, then the man himself: one section, the one picking up from the other) */}
            {section('FIELD INTEL', <>{d.expect}<div className="mt-[3px]"><span className="font-bold">THE TARGET: </span>{d.intel}</div></>)}
            {section('WHY NOT BRING HIM IN ALIVE', d.notAlive)}
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

    </div>
  );
};

export default DossierPanel;
