import React, { useEffect, useRef, useState } from 'react';
import { LANDS } from '../hub/lands';
import { Prompt } from '../../m1/components/ButtonIcons';
import { getActiveGamepad, isButtonPressed, GP_BUTTONS, getGamepadMovement, menuButtons } from '../../m1/game/platform/gamepad';
import { keysFor } from '../../m1/game/platform/keys';
import { playCursor } from '../../m1/game/platform/audio';
import { boundHeld, keyHeld, mapButton } from '../input';
import { MAP_W, MAP_H, SECTORS, landMid } from './geo';
import { ATTRACTIONS, CAST, NUMBERS, attractionOfZone } from './data';
import { castPhotoImg, PHOTO_TILT } from './photos';
import { remainsPhotoImg } from './remains';
import { bossDeath, type BossDeath } from '../store';
import { VIEW_W, VIEW_H, ZOOMS, FIT, levelCanvas, drawMarker, herePoint, hereLand, landOutline, landAtPoint, type Here } from './render';

// The park map (SELECT on a pad, TAB or M, MAP in the pause menu): Happy Land's brochure map, the whole park, a YOU
// ARE HERE where he roughly is (which land, which attraction: not a tracker), the attractions of the land in view down
// the left and its KEY CAST MEMBER down the right. Zoomed in steps (the mouse wheel, LB / LT out, RB / RT in, - and =),
// panned (the stick, the D-pad, the movement keys, a mouse drag); next land with confirm (or a click on one). It reads
// its own input while it's up; App.tsx opens and shuts it.

/** The lands clockwise round the map from the top (the order NEXT LAND goes). */
const RING = SECTORS.filter(s => s.land !== null).map(s => s.land as number);
const PAPER = '#FFF7E0', INK = '#3B2A14';

const ParkMap: React.FC<{ here: Here; onClose: () => void }> = ({ here, onClose }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const start = hereLand(here);
  const [focus, setFocus] = useState(start);
  const [zoomAt, setZoomAt] = useState(0);
  const view = useRef({ zi: 0, z: FIT, cx: MAP_W / 2, cy: MAP_H / 2, fly: null as null | { x: number; y: number }, focus: start, drag: null as null | { x: number; y: number; cx: number; cy: number; moved: boolean } });
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const marker = herePoint(here);

  useEffect(() => {
    const v = view.current;
    const clamp = () => {
      const hw = VIEW_W / (2 * v.z), hh = VIEW_H / (2 * v.z);
      v.cx = MAP_W <= hw * 2 ? MAP_W / 2 : Math.max(hw, Math.min(MAP_W - hw, v.cx));
      v.cy = MAP_H <= hh * 2 ? MAP_H / 2 : Math.max(hh, Math.min(MAP_H - hh, v.cy));
    };
    const setF = (f: number) => { if (v.focus !== f) { v.focus = f; setFocus(f); } };
    /** The land at the middle of the view, once zoomed in (the hub plaza: none). */
    const follow = () => { if (v.zi === 0) return; const f = landAtPoint(v.cx, v.cy); if (f >= 0 || Math.hypot((v.cx - 450) / 410, (v.cy - 440) / 360) < 0.25) setF(f); };
    /** A zoom step in or out, about a point on screen (the middle, or the mouse). */
    const zoom = (d: number, sx = VIEW_W / 2, sy = VIEW_H / 2, mouse = false) => {
      const zi = Math.max(0, Math.min(ZOOMS.length - 1, v.zi + d));
      if (zi === v.zi) return;
      const fromWhole = v.zi === 0;
      // (the paper point under (sx, sy) stays put)
      const z0 = ZOOMS[v.zi], z1 = ZOOMS[zi];
      const wx = v.cx + (sx - VIEW_W / 2) / z0, wy = v.cy + (sy - VIEW_H / 2) / z0;
      v.cx = wx - (sx - VIEW_W / 2) / z1; v.cy = wy - (sy - VIEW_H / 2) / z1;
      v.zi = zi; v.fly = null;
      setZoomAt(zi); playCursor();
      // (the next level in, painted ahead while there's a moment)
      if (zi + 1 < ZOOMS.length) setTimeout(() => levelCanvas(zi + 1), 120);
      // (in off the whole park with the stick or the keys: in on the land picked out, where he is to start with)
      if (fromWhole && !mouse) v.fly = v.focus >= 0 ? landMid(v.focus) : { x: 450, y: 440 };
      else setTimeout(follow, 0);
    };
    const nextLand = (d = 1) => {
      const i = RING.indexOf(v.focus);
      const f = RING[(i < 0 ? 0 : i + d + RING.length) % RING.length];
      setF(f); playCursor();
      if (v.zi > 0) v.fly = landMid(f);
    };
    const pickAt = (sx: number, sy: number) => {
      const wx = v.cx + (sx - VIEW_W / 2) / v.z, wy = v.cy + (sy - VIEW_H / 2) / v.z;
      const f = landAtPoint(wx, wy);
      setF(f); playCursor();
      if (v.zi > 0 && f >= 0) v.fly = landMid(f);
    };

    // ---- the keys
    const onKey = (e: KeyboardEvent) => {
      const code = e.code.toLowerCase();
      if (code === 'tab') e.preventDefault();
      if (e.repeat) return;
      if (code === 'escape' || code === 'backspace' || code === 'keyp' || keysFor('map').includes(code)) { closeRef.current(); return; }
      if (code === 'enter' || code === 'space') { nextLand(e.shiftKey ? -1 : 1); return; }
      if (code === 'minus' || code === 'numpadsubtract' || code === 'pagedown' || keysFor('prevWeapon').includes(code)) zoom(-1);
      else if (code === 'equal' || code === 'numpadadd' || code === 'pageup' || keysFor('nextWeapon').includes(code)) zoom(1);
    };
    window.addEventListener('keydown', onKey, true);
    // ---- the mouse: the wheel zooms about it, a drag pans, a click picks a land, a right-click shuts it
    const cv = ref.current!;
    let wheelAt = 0;
    const local = (e: { clientX: number; clientY: number }) => { const r = cv.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * VIEW_W, y: ((e.clientY - r.top) / r.height) * VIEW_H }; };
    const onWheel = (e: WheelEvent) => { e.preventDefault(); const now = performance.now(); if (now - wheelAt < 110 || Math.abs(e.deltaY) < 1) return; wheelAt = now; const p = local(e); zoom(e.deltaY < 0 ? 1 : -1, p.x, p.y, true); };
    const onDown = (e: PointerEvent) => { if (e.button !== 0) return; v.drag = { x: e.clientX, y: e.clientY, cx: v.cx, cy: v.cy, moved: false }; cv.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      const d = v.drag; if (!d) return;
      const r = cv.getBoundingClientRect(), k = VIEW_W / r.width;
      const dx = (e.clientX - d.x) * k, dy = (e.clientY - d.y) * k;
      if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
      if (d.moved) { v.cx = d.cx - dx / v.z; v.cy = d.cy - dy / v.z; v.fly = null; clamp(); follow(); }
    };
    const onUp = (e: PointerEvent) => { const d = v.drag; v.drag = null; if (d && !d.moved) { const p = local(e); pickAt(p.x, p.y); } };
    cv.addEventListener('wheel', onWheel, { passive: false });
    cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove); cv.addEventListener('pointerup', onUp);
    const onContext = (e: MouseEvent) => { e.preventDefault(); closeRef.current(); };
    window.addEventListener('contextmenu', onContext, true);

    // ---- each frame: the pad, the held keys, the view
    const prev: Record<string, boolean> = {};
    let first = true, id = 0;
    const frame = (t: number) => {
      const gp = getActiveGamepad();
      let mx = 0, my = 0;
      if (gp) {
        const m = menuButtons(gp);
        const b: Record<string, boolean> = {
          lb: isButtonPressed(gp, GP_BUTTONS.LB) || isButtonPressed(gp, GP_BUTTONS.LT), rb: isButtonPressed(gp, GP_BUTTONS.RB) || isButtonPressed(gp, GP_BUTTONS.RT),
          close: mapButton(gp) || isButtonPressed(gp, GP_BUTTONS.START) || isButtonPressed(gp, m.back), ok: isButtonPressed(gp, m.ok), y: isButtonPressed(gp, GP_BUTTONS.Y),
        };
        // (whatever's held as it comes up isn't a press: the SELECT that opened it)
        if (first) Object.assign(prev, b);
        const just = (k: string) => b[k] && !prev[k];
        if (just('close')) { closeRef.current(); return; }
        if (just('lb')) zoom(-1);
        if (just('rb')) zoom(1);
        if (just('ok')) nextLand(1);
        if (just('y')) nextLand(-1);
        Object.assign(prev, b);
        const mv = getGamepadMovement(gp, 0.22);
        mx = mv.x; my = mv.y;
      }
      first = false;
      if (boundHeld('left') || keyHeld('arrowleft')) mx = -1;
      if (boundHeld('right') || keyHeld('arrowright')) mx = 1;
      if (boundHeld('up') || keyHeld('arrowup')) my = -1;
      if (boundHeld('down') || keyHeld('arrowdown')) my = 1;
      if (mx || my) { v.cx += (mx * 7) / v.z; v.cy += (my * 7) / v.z; v.fly = null; clamp(); follow(); }
      if (v.fly) { v.cx += (v.fly.x - v.cx) * 0.18; v.cy += (v.fly.y - v.cy) * 0.18; clamp(); if (Math.hypot(v.fly.x - v.cx, v.fly.y - v.cy) < 1) v.fly = null; }
      // (the zoom eases to its step)
      const zt = ZOOMS[v.zi];
      v.z += (zt - v.z) * 0.3; if (Math.abs(zt - v.z) < 0.002) v.z = zt;
      clamp();
      draw(t);
      id = requestAnimationFrame(frame);
    };
    const draw = (t: number) => {
      const g = cv.getContext('2d'); if (!g) return;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = '#E9D9B0'; g.fillRect(0, 0, VIEW_W, VIEW_H);
      // (the finished level that's at least this close, scaled to where the zoom's got to)
      let li = ZOOMS.findIndex(s => s >= v.z - 1e-3); if (li < 0) li = ZOOMS.length - 1;
      const src = levelCanvas(li), s = ZOOMS[li], k = v.z / s;
      const ox = VIEW_W / 2 - v.cx * v.z, oy = VIEW_H / 2 - v.cy * v.z;
      g.imageSmoothingEnabled = k < 0.999;
      g.drawImage(src, Math.round(ox), Math.round(oy), Math.round(src.width * k), Math.round(src.height * k));
      g.imageSmoothingEnabled = false;
      // (the land picked out: its edge, dashed, marching)
      if (v.focus >= 0) {
        const pts = landOutline(v.focus);
        g.save(); g.beginPath();
        pts.forEach((p, i) => { const x = ox + p.x * v.z, y = oy + p.y * v.z; if (i) g.lineTo(x, y); else g.moveTo(x, y); });
        g.closePath();
        g.lineWidth = 2; g.setLineDash([5, 4]); g.lineDashOffset = -t / 60;
        g.strokeStyle = 'rgba(28,18,6,0.8)'; g.stroke();
        g.lineDashOffset = -t / 60 + 4.5; g.strokeStyle = '#FDE047'; g.stroke();
        g.restore();
      }
      drawMarker(g, Math.round(ox + marker.x * v.z), Math.round(oy + marker.y * v.z), t);
    };
    id = requestAnimationFrame(frame);
    // (the closer levels, painted ahead in a quiet moment)
    const warm = setTimeout(() => { levelCanvas(1); setTimeout(() => { levelCanvas(2); setTimeout(() => levelCanvas(3), 250); }, 250); }, 300);
    return () => {
      cancelAnimationFrame(id); clearTimeout(warm);
      window.removeEventListener('keydown', onKey, true); window.removeEventListener('contextmenu', onContext, true);
      cv.removeEventListener('wheel', onWheel); cv.removeEventListener('pointerdown', onDown); cv.removeEventListener('pointermove', onMove); cv.removeEventListener('pointerup', onUp);
    };
  }, []);

  const land = focus >= 0 ? LANDS[focus] : null;
  const hereAttraction = here.place === 'hub' ? null : attractionOfZone(here.zone);
  const hereName = here.place === 'staff' ? 'THE STAFF ROOM (NOT ON MAP)' : here.zone === 'gym' ? 'THE IRON PIT (NOT ON MAP)' : [here.place === 'hub' || here.place === 'intro' ? null : LANDS[hereLand(here)]?.name, hereAttraction?.name].filter(Boolean).join(' · ') || 'THE HAPPY HUB';
  const zoomName = ['WHOLE PARK', 'CLOSER', 'CLOSE', 'UP CLOSE'][zoomAt];

  return (
    <div className="absolute inset-0 z-40 select-none" style={{ background: 'radial-gradient(circle at 50% 40%, #6B4A26 0%, #3B2A14 70%, #24180A 100%)' }} onMouseDown={e => e.preventDefault()}>
      {/* The header: the brochure's band, where he is */}
      <div className="absolute left-2 right-2 top-[6px] h-[24px] flex items-center justify-between px-2" style={{ background: 'linear-gradient(180deg, #EC4899 0 3px, #FDE047 3px 5px, #22D3EE 5px 7px, #FFF7E0 7px)', border: `2px solid ${INK}`, boxShadow: '2px 2px 0 rgba(0,0,0,0.45)' }}>
        <span className="text-[9px] font-black tracking-wider pt-[5px]" style={{ color: '#BE185D', textShadow: '1px 1px 0 #FDE047' }}>HAPPY LAND · PARK MAP</span>
        <span className="text-[6px] pt-[5px] tracking-wider" style={{ color: INK }}>YOU ARE IN: <span style={{ color: '#B91C1C' }}>{hereName}</span> <span style={{ color: '#7C6A4A' }}>(ROUGHLY)</span></span>
      </div>

      {/* Left: the land's attractions (or the park's welcome) */}
      <div className="absolute left-2 top-[34px] w-[152px] h-[516px] overflow-hidden" style={{ background: PAPER, border: `2px solid ${INK}`, boxShadow: '2px 2px 0 rgba(0,0,0,0.45)' }}>
        {land ? <AttractionsPanel landIdx={focus} /> : <WelcomePanel />}
      </div>

      {/* The map */}
      <div className="absolute top-[34px]" style={{ left: 166, width: VIEW_W, height: VIEW_H, border: `2px solid ${INK}`, boxShadow: '2px 2px 0 rgba(0,0,0,0.45)', boxSizing: 'content-box', marginLeft: -2 }}>
        <canvas ref={ref} width={VIEW_W} height={VIEW_H} style={{ width: VIEW_W, height: VIEW_H, imageRendering: 'pixelated', cursor: 'grab', display: 'block' }} />
        <div className="absolute right-1 top-1 px-1 py-[2px] text-[6px] tracking-wider pointer-events-none" style={{ background: 'rgba(255,247,224,0.85)', color: INK, border: `1px solid ${INK}` }}>
          {zoomName} {ZOOMS.map((_, i) => (i <= zoomAt ? '■' : '□')).join('')}
        </div>
      </div>

      {/* Right: the KEY CAST MEMBERS */}
      <div className="absolute right-2 top-[34px] w-[152px] h-[516px] overflow-hidden" style={{ background: PAPER, border: `2px solid ${INK}`, boxShadow: '2px 2px 0 rgba(0,0,0,0.45)' }}>
        {land ? <CastPanel landIdx={focus} /> : <CastIndex />}
      </div>

      {/* The buttons, the real ones */}
      <div className="absolute left-2 right-2 bottom-[6px] h-[40px] flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-2 text-[6px] tracking-wider text-amber-50" style={{ background: 'rgba(0,0,0,0.55)', border: `2px solid ${INK}` }}>
        <Prompt pad={['LB', 'RB']} kb={['-', '=']} mouse="wheel" label="ZOOM" size={13} />
        <Prompt pad={['LSTICK']} kb={['@up', '@left', '@down', '@right']} label="LOOK AROUND" size={13} />
        <Prompt pad={['OK', 'Y']} kb={['ENTER']} mouse="left" label="NEXT LAND" size={13} />
        <Prompt pad={['SELECT', 'BACK']} kb={['@map', 'ESC']} mouse="right" label="CLOSE MAP" size={13} />
      </div>
    </div>
  );
};

// ---- the panels
const Badge: React.FC<{ n: number }> = ({ n }) => (
  <span className="inline-flex items-center justify-center shrink-0 w-[13px] h-[13px] rounded-full text-[6px] font-black" style={{ background: '#FFFFFF', color: '#7F1D1D', border: '2px solid #DC2626' }}>{n}</span>
);

const LandHead: React.FC<{ landIdx: number; kicker: string }> = ({ landIdx, kicker }) => {
  const l = LANDS[landIdx];
  return (
    <div className="px-2 pt-2 pb-[6px]" style={{ background: `linear-gradient(180deg, ${l.swirl[1]}, ${l.sign})`, borderBottom: `2px solid ${INK}` }}>
      <div className="text-[5px] tracking-widest" style={{ color: l.signText, opacity: 0.85 }}>{kicker}</div>
      <div className="text-[9px] font-black leading-[12px] mt-[2px]" style={{ color: l.signText, textShadow: '1px 1px 0 #000' }}>{l.name}</div>
    </div>
  );
};

const AttractionsPanel: React.FC<{ landIdx: number }> = ({ landIdx }) => {
  const l = LANDS[landIdx];
  const list = ATTRACTIONS.filter(a => a.land === l.id);
  return (
    <div>
      <LandHead landIdx={landIdx} kicker="ATTRACTIONS" />
      <div className="px-2 pt-[5px] pb-[3px] text-[6px] leading-[9px] italic" style={{ color: '#7C2D12' }}>{l.blurb}</div>
      <div className="flex flex-col gap-[4px] px-2 pb-2 pt-[2px]">
        {list.map(a => (
          <div key={a.id} className="flex gap-[3px]">
            {NUMBERS[a.id] ? <Badge n={NUMBERS[a.id]} /> : <span className="w-[13px] shrink-0 text-center text-[7px]" style={{ color: '#A16207' }}>✦</span>}
            <div className="flex flex-col gap-[2px] min-w-0">
              <span className="text-[6px] font-black leading-[9px]" style={{ color: INK }}>{a.name}</span>
              <span className="text-[5px] leading-[8px]" style={{ color: '#44403C' }}>{a.blurb}</span>
              {!a.minor && <span className="text-[5px] leading-[8px]" style={{ color: '#B91C1C' }}>{a.info}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WelcomePanel: React.FC = () => {
  const list = ATTRACTIONS.filter(a => a.land === 'hub' && !a.minor);
  return (
    <div>
      <div className="px-2 pt-2 pb-[6px]" style={{ background: 'linear-gradient(180deg, #EC4899, #9D174D)', borderBottom: `2px solid ${INK}` }}>
        <div className="text-[5px] tracking-widest text-pink-100">WELCOME TO</div>
        <div className="text-[9px] font-black leading-[12px] mt-[2px] text-white" style={{ textShadow: '1px 1px 0 #000' }}>HAPPY LAND!</div>
      </div>
      <div className="px-2 pt-[6px] text-[6px] leading-[9px] italic" style={{ color: '#7C2D12' }}>THE HAPPIEST LAND IN THE LAND. NOW WITH MORE LAND.</div>
      <div className="flex flex-col gap-[3px] px-2 pt-2 text-[5px] leading-[8px]" style={{ color: '#44403C' }}>
        {['PARK HOURS: 9 AM TO WHENEVER', 'TICKETS: ONE DAY $189', 'LOST CHILDREN: THE HUB', 'LOST ADULTS: ALSO THE HUB', 'FIRST AID · SECOND AID', 'RESTROOMS: SEE MAP. BRING WATER.', 'NO RE-ENTRY. NO REFUNDS.', 'OVERFLOW PARKING: NEXT STATE'].map(t => <span key={t}>· {t}</span>)}
      </div>
      <div className="px-2 pt-2 pb-1 text-[6px] font-black tracking-widest" style={{ color: '#9D174D' }}>THE WAY IN</div>
      <div className="flex flex-col gap-[4px] px-2 pb-2">
        {list.map(a => (
          <div key={a.id} className="flex flex-col gap-[2px]">
            <span className="text-[6px] font-black leading-[9px]" style={{ color: INK }}>{a.name}</span>
            <span className="text-[5px] leading-[8px]" style={{ color: '#44403C' }}>{a.blurb}</span>
            <span className="text-[5px] leading-[8px]" style={{ color: '#B91C1C' }}>{a.info}</span>
          </div>
        ))}
      </div>
      <div className="px-2 pb-2 text-[5px] leading-[8px]" style={{ color: '#7C6A4A' }}>PICK A LAND FOR ITS ATTRACTIONS.</div>
    </div>
  );
};

/** The star's staff photo, taped up a little crooked (photos.ts). */
const CastPhoto: React.FC<{ land: string }> = ({ land }) => {
  const img = castPhotoImg(land);
  if (!img) return null;
  return (
    <div className="flex justify-center pt-[6px]">
      <img src={img.url} width={img.w} height={img.h} alt="" draggable={false} style={{ width: img.w, height: img.h, imageRendering: 'pixelated', transform: `rotate(${PHOTO_TILT[land] ?? 0}deg)` }} />
    </div>
  );
};

/** Dead: the evidence photo of what's left of him (remains.ts), on the same tilt. */
const RemainsPhoto: React.FC<{ land: string; how: BossDeath }> = ({ land, how }) => {
  const img = remainsPhotoImg(land, how);
  if (!img) return null;
  return (
    <div className="flex justify-center pt-[6px]">
      <img src={img.url} width={img.w} height={img.h} alt="" draggable={false} style={{ width: img.w, height: img.h, imageRendering: 'pixelated', transform: `rotate(${PHOTO_TILT[land] ?? 0}deg)` }} />
    </div>
  );
};

/** His obituary (once he's dead: store.ts bossDeath), the one for how he went: the newspaper's way, a black rule, IN
 *  MEMORIAM, the dates, the notice, in lieu of flowers. Sized to fit the panel whole (no scrolling): every line set at
 *  a fixed leading, the longest notice measured against the panel's height. */
const ObitPanel: React.FC<{ landIdx: number; how: BossDeath }> = ({ landIdx, how }) => {
  const l = LANDS[landIdx], c = CAST.find(m => m.land === l.id)!;
  const o = c.obit[how];
  return (
    <div className="h-full" style={{ background: '#F2EFE6' }}>
      <LandHead landIdx={landIdx} kicker="KEY CAST MEMBERS" />
      <RemainsPhoto land={l.id} how={how} />
      <div className="px-2 pt-1">
        <div className="text-[5px] leading-[8px] tracking-widest text-center" style={{ color: '#18181B' }}>IN MEMORIAM</div>
        <div className="my-[3px] h-[2px]" style={{ background: '#000' }} />
        <div className="text-[8px] font-black leading-[11px]" style={{ color: '#18181B' }}>{c.name}</div>
        <div className="text-[5px] leading-[8px] mt-[2px]" style={{ color: '#57534E' }}>{c.role}</div>
        <div className="text-[5px] leading-[8px] mt-[2px]" style={{ color: '#7F1D1D' }}>{o.dates}</div>
      </div>
      <div className="mx-2 my-1 h-[2px]" style={{ background: '#000' }} />
      <div className="px-2 pb-[6px] text-[5px] leading-[8px]" style={{ color: '#1C1917' }}>{o.text}</div>
      <div className="px-2 pt-1 pb-1 text-[5px] leading-[8px] italic" style={{ color: '#57534E' }}>{o.flowers}</div>
      {c.foot && <div className="px-2 pb-1 text-[5px] leading-[8px]" style={{ color: '#78716C' }}>{c.foot}</div>}
    </div>
  );
};

const CastPanel: React.FC<{ landIdx: number }> = ({ landIdx }) => {
  const l = LANDS[landIdx], c = CAST.find(m => m.land === l.id);
  if (!c) return <LandHead landIdx={landIdx} kicker="KEY CAST MEMBERS" />;
  const dead = bossDeath(l.id);
  if (dead) return <ObitPanel landIdx={landIdx} how={dead} />;
  return (
    <div>
      <LandHead landIdx={landIdx} kicker="KEY CAST MEMBERS" />
      <CastPhoto land={l.id} />
      <div className="px-2 pt-1">
        <div className="text-[5px] tracking-widest" style={{ color: '#9D174D' }}>MEET</div>
        <div className="text-[8px] font-black leading-[11px] mt-[2px]" style={{ color: l.sign, textShadow: `1px 1px 0 ${l.swirl[2]}` }}>{c.name}</div>
        <div className="text-[5px] leading-[8px] mt-[3px] tracking-wider" style={{ color: '#B91C1C' }}>{c.role}</div>
      </div>
      <div className="mx-2 my-2 h-[2px]" style={{ background: `repeating-linear-gradient(90deg, ${l.swirl[1]} 0 4px, transparent 4px 6px)` }} />
      <div className="px-2 pb-2 text-[5px] leading-[9px]" style={{ color: '#292524' }}>{c.piece}</div>
      {c.foot && <div className="px-2 pb-3 text-[5px] leading-[8px]" style={{ color: '#78716C' }}>{c.foot}</div>}
      {/* (his weakness, hinted: a fun fact in the white space) */}
      <div className="mx-2 mb-3 px-[5px] py-[4px] text-[5px] leading-[8px]" style={{ color: '#7C2D12', background: '#FEF3C7', border: `1px dashed ${l.swirl[1]}` }}>{c.hint}</div>
      <div className="px-2 pb-3 text-[5px] leading-[8px] italic" style={{ color: '#7C6A4A' }}>ASK ANY CAST MEMBER FOR AN AUTOGRAPH!</div>
    </div>
  );
};

const CastIndex: React.FC = () => (
  <div>
    <div className="px-2 pt-2 pb-[6px]" style={{ background: 'linear-gradient(180deg, #22D3EE, #0E7490)', borderBottom: `2px solid ${INK}` }}>
      <div className="text-[5px] tracking-widest text-cyan-100">MEET OUR</div>
      <div className="text-[9px] font-black leading-[12px] mt-[2px] text-white" style={{ textShadow: '1px 1px 0 #000' }}>KEY CAST MEMBERS</div>
    </div>
    <div className="px-2 pt-[6px] text-[5px] leading-[8px] italic" style={{ color: '#7C2D12' }}>THE FRIENDLY FACES WHO MAKE HAPPY LAND HAPPY!</div>
    <div className="flex flex-col gap-[6px] px-2 pt-2 pb-3">
      {RING.map(li => { const l = LANDS[li], c = CAST.find(m => m.land === l.id); return c ? (
        <div key={l.id} className="flex flex-col gap-[1px]">
          <span className="text-[6px] font-black leading-[9px]" style={{ color: l.sign }}>{c.name}{bossDeath(l.id) && <span style={{ color: '#18181B' }}> (LATE)</span>}</span>
          <span className="text-[5px] leading-[7px]" style={{ color: '#44403C' }}>{c.role}</span>
          <span className="text-[5px] leading-[8px] tracking-wider" style={{ color: '#A16207' }}>{l.name}</span>
        </div>
      ) : null; })}
    </div>
    <div className="px-2 pb-3 text-[5px] leading-[8px]" style={{ color: '#7C6A4A' }}>PICK A LAND TO MEET ITS STAR.</div>
  </div>
);

export default ParkMap;
