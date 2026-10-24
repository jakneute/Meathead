import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import { LANDS } from '../hub/lands';
import { Prompt } from '../../m1/components/ButtonIcons';
import { signText, rampDown } from '../signLetters';
import { inLand } from './geo';
import { ATTRACTIONS, CAST, NUMBERS } from './data';
import { ZOOMS, levelCanvas, landOutline } from './render';
import { attractionAt } from './terrain';
import { type Stop, fastTravelStops, fastTravelPick, setFastTravelPick, subscribeFastTravel, askFastTravelGo } from './fastTravel';
import { playCursor } from '../../m1/game/platform/audio';
import { castPhotoImg } from './photos';
import { remainsPhotoImg } from './remains';
import { bossDeath } from '../store';
import { idleTasks } from '../../m1/game/scenes/art/raster';

// The hub's portal card, YOU ARE GOING HERE (up at a land's portal; the hub's own confirm and cancel, hub/index.ts):
// a preview of that one land, not the park map: its corner of the brochure map close up (its landmarks, its walks,
// its numbers), its name in its own gate lettering, YOU ARE GOING HERE on it, and its attractions down the side.
// A land he's cleared: fast travel (fastTravel.ts): its stops down the side instead, the one picked out (up / down, or
// a click) shown on the map, YOU ARE GOING HERE pinned on its attraction, its blurb under the list.

const W = 400, H = 420;
const INK = '#3B2A14';

/** The cards' photos (each a portrait painted then encoded for an <img>: a stall the moment a card came up), made ahead
 *  one per idle moment. */
export const prewarmLandCards = () => idleTasks(CAST.map(c => () => {
  const dead = bossDeath(c.land);
  if (dead) remainsPhotoImg(c.land, dead, 'small'); else castPhotoImg(c.land, 'small');
}));

const LandCard: React.FC<{ land: number }> = ({ land }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const l = LANDS[land];
  const stops = fastTravelStops(l?.id);
  const pick = useSyncExternalStore(subscribeFastTravel, fastTravelPick);
  const stop = stops ? stops[Math.min(pick, stops.length - 1)] : null;
  const target = stop ? ATTRACTIONS.find(a => a.id === stop.attraction) ?? null : null;
  /** (the canvas's loop reads the stop's spot from here: it doesn't restart on a new pick) */
  const targetRef = useRef<{ x: number; y: number } | null>(null);
  targetRef.current = target ? attractionAt(target) : null;
  useEffect(() => {
    let id = 0;
    // (the brochure map at its own size (the 1:1 level: names on), centered on the land)
    const zi = ZOOMS.indexOf(1);
    const src = levelCanvas(zi < 0 ? ZOOMS.length - 1 : zi), s = ZOOMS[zi < 0 ? ZOOMS.length - 1 : zi];
    const mid = inLand(land, 0, 0.55);
    const sx = Math.max(0, Math.min(src.width - W, Math.round(mid.x * s - W / 2))), sy = Math.max(0, Math.min(src.height - H, Math.round(mid.y * s - H / 2)));
    const outline = landOutline(land);
    const loop = (t: number) => {
      const g = ref.current?.getContext('2d');
      if (g) {
        g.imageSmoothingEnabled = false;
        g.drawImage(src, sx, sy, W, H, 0, 0, W, H);
        // (everything that isn't this land, faded back)
        g.save();
        g.beginPath(); g.rect(0, 0, W, H);
        outline.forEach((p, i) => { const x = p.x * s - sx, y = p.y * s - sy; if (i) g.lineTo(x, y); else g.moveTo(x, y); });
        g.closePath();
        g.fillStyle = 'rgba(243,233,207,0.62)'; g.fill('evenodd');
        // (its edge, marching)
        g.beginPath(); outline.forEach((p, i) => { const x = p.x * s - sx, y = p.y * s - sy; if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath();
        g.lineWidth = 3; g.setLineDash([6, 4]); g.lineDashOffset = -t / 50; g.strokeStyle = Math.floor(t / 300) % 2 ? '#FDE047' : '#DC2626'; g.stroke();
        g.restore();
        // (its name in its own gate lettering, up top; YOU ARE GOING HERE under it)
        g.fillStyle = 'rgba(28,18,6,0.55)'; g.fillRect(0, 0, W, 44);
        signText(g, l.name, W / 2, 30, { sx: 3, sy: 3, bold: false, fill: rampDown(l.swirl[2], 0.35), dither: true, ink: l.sign, shadow: '#1C1206', drop: 2 });
        const blink = Math.floor(t / 300) % 2 === 0;
        const tp = targetRef.current;
        if (tp) drawGoingPin(g, tp.x * s - sx, tp.y * s - sy, t);
        else {
          g.fillStyle = blink ? '#DC2626' : '#B91C1C'; g.fillRect(W / 2 - 74, 48, 148, 15);
          g.fillStyle = '#FCA5A5'; g.fillRect(W / 2 - 74, 48, 148, 1);
          signText(g, 'YOU ARE GOING HERE', W / 2, 59, { sx: 1, sy: 1, bold: true, fill: '#FFFFFF' });
        }
      }
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [land]);
  const list = ATTRACTIONS.filter(a => a.land === l?.id && !a.minor && (a.v ?? 0) <= 1);
  const star = CAST.find(c => c.land === l?.id);
  // (dead: what's left of him, and IN MEMORIAM: parkmap's obituaries)
  const dead = star ? bossDeath(star.land) : null;
  const photo = star ? (dead ? remainsPhotoImg(star.land, dead, 'small') : castPhotoImg(star.land, 'small')) : null;
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60">
      <div className="flex flex-col items-center gap-2 p-3" style={{ background: '#3B2A14', border: '3px solid #1C1206', boxShadow: '0 0 0 2px #000, 6px 6px 0 rgba(0,0,0,0.5)' }}>
        <div className="text-[10px] text-amber-100 tracking-wide">HAPPY LAND · OFFICIAL GUEST MAP</div>
        <div className="flex gap-2">
          <canvas ref={ref} width={W} height={H} style={{ width: W, height: H, imageRendering: 'pixelated', border: `2px solid ${INK}` }} />
          <div className="w-[262px] flex flex-col" style={{ height: H + 4, background: '#FFF7E0', border: `2px solid ${INK}` }}>
            <div className="px-2 pt-2 pb-[6px]" style={{ background: `linear-gradient(180deg, ${l?.swirl[1]}, ${l?.sign})`, borderBottom: `2px solid ${INK}` }}>
              <div className="text-[6px] tracking-widest" style={{ color: l?.signText }}>{stops ? 'FAST TRAVEL · WHERE TO?' : 'ATTRACTIONS'}</div>
              <div className="text-[6px] leading-[9px] mt-[3px] italic" style={{ color: l?.signText }}>{l?.blurb}</div>
            </div>
            {stops ? <StopList stops={stops} pick={Math.min(pick, stops.length - 1)} sign={l.sign} /> : <div className="flex flex-col gap-[6px] px-2 pt-2 overflow-hidden">
              {list.map(a => (
                <div key={a.id} className="flex gap-[5px]">
                  <span className="inline-flex items-center justify-center shrink-0 w-[13px] h-[13px] rounded-full text-[6px] font-black" style={{ background: '#FFFFFF', color: '#7F1D1D', border: '2px solid #DC2626' }}>{NUMBERS[a.id]}</span>
                  <div className="flex flex-col gap-[1px] min-w-0">
                    <span className="text-[6px] font-black leading-[9px]" style={{ color: INK }}>{a.name}</span>
                    <span className="text-[5px] leading-[8px]" style={{ color: '#44403C' }}>{a.blurb}</span>
                    <span className="text-[5px] leading-[8px]" style={{ color: '#B91C1C' }}>{a.info}</span>
                  </div>
                </div>
              ))}
            </div>}
            {stops && target && <div className="flex gap-[5px] mx-2 mt-[6px] px-[5px] py-[4px]" style={{ background: '#FFFBEB', border: `1px dashed ${l.swirl[1]}` }}>
              {NUMBERS[target.id] ? <span className="inline-flex items-center justify-center shrink-0 w-[13px] h-[13px] rounded-full text-[6px] font-black" style={{ background: '#FFFFFF', color: '#7F1D1D', border: '2px solid #DC2626' }}>{NUMBERS[target.id]}</span> : <span className="w-[13px] shrink-0 text-center text-[7px]" style={{ color: '#A16207' }}>✦</span>}
              <div className="flex flex-col gap-[1px] min-w-0">
                <span className="text-[6px] font-black leading-[9px]" style={{ color: INK }}>{target.name}</span>
                <span className="text-[5px] leading-[8px]" style={{ color: '#44403C' }}>{target.blurb}</span>
                <span className="text-[5px] leading-[8px]" style={{ color: '#B91C1C' }}>{target.info}</span>
              </div>
            </div>}
            {star && <div className="mt-auto flex items-center gap-[6px] px-2 py-[5px] text-[5px] leading-[8px]" style={{ color: '#44403C', borderTop: `2px dashed ${l?.swirl[1]}` }}>
              {photo && <img src={photo.url} width={photo.w} height={photo.h} alt="" draggable={false} className="shrink-0" style={{ width: photo.w, height: photo.h, imageRendering: 'pixelated', transform: 'rotate(-3deg)' }} />}
              {dead
                ? <div className="min-w-0">IN MEMORIAM:<br /><span className="font-black" style={{ color: '#18181B' }}>{star.name}</span><br /><span style={{ color: '#7F1D1D' }}>{star.obit[dead].dates}</span></div>
                : <div className="min-w-0">KEY CAST MEMBER:<br /><span className="font-black" style={{ color: l?.sign }}>{star.name}</span><br />{star.role}</div>}
            </div>}
          </div>
        </div>
        <div className="w-full flex items-center justify-between text-[8px] text-amber-50 px-1">
          <span className="text-[11px] text-yellow-300">{l?.name}</span>
          <div className="flex gap-4 shrink-0">
            {stops && <Prompt pad={['DPAD_UP', 'DPAD_DOWN']} kb={['@up', '@down']} label="PICK" />}
            <Prompt pad={['OK']} kb={['ENTER']} mouse={stops ? 'left' : undefined} label="GO" />
            <Prompt pad={['BACK']} kb={['ESC']} mouse="right" label="BACK" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandCard;

/** A cleared land's stops, the picked one marked (a click picks one; a click on the picked one goes). */
const StopList: React.FC<{ stops: Stop[]; pick: number; sign: string }> = ({ stops, pick, sign }) => (
  <div className="flex flex-col gap-[2px] px-2 pt-2">
    {stops.map((st, i) => {
      const on = i === pick;
      return (
        <div key={st.name} className="flex items-center gap-[4px] px-[4px] h-[16px] cursor-pointer"
          style={{ background: on ? sign : 'transparent', border: `1px solid ${on ? INK : 'transparent'}` }}
          onMouseDown={e => { e.preventDefault(); if (on) askFastTravelGo(); else { setFastTravelPick(i); playCursor(); } }}>
          <span className="w-[8px] shrink-0 text-[7px]" style={{ color: on ? '#FDE047' : 'transparent' }}>{'\u25B6'}</span>
          <span className="text-[6px] font-black leading-[9px] truncate" style={{ color: on ? '#FFFFFF' : INK, textShadow: on ? '1px 1px 0 #000' : undefined }}>{st.name}</span>
          <span className="ml-auto shrink-0 text-[5px] leading-[8px]" style={{ color: on ? '#FDE68A' : '#7C6A4A' }}>{st.cp === null ? 'THE WAY IN' : i === stops.length - 1 ? 'BOSS DOOR' : ''}</span>
        </div>
      );
    })}
  </div>
);

/** YOU ARE GOING HERE, pinned on the stop's attraction (kept on the card: one off the paper's edge sits at its edge). */
const drawGoingPin = (g: CanvasRenderingContext2D, px: number, py: number, t: number) => {
  const x = Math.round(Math.max(68, Math.min(W - 68, px))), y = Math.round(Math.max(96, Math.min(H - 24, py)));
  const bob = Math.round(Math.abs(Math.sin(t / 220)) * -5);
  const blink = Math.floor(t / 300) % 2 === 0;
  g.save();
  g.strokeStyle = blink ? '#DC2626' : '#FDE047'; g.lineWidth = 2; g.setLineDash([3, 3]);
  g.beginPath(); g.ellipse(x, y, 22, 12, 0, 0, Math.PI * 2); g.stroke();
  g.setLineDash([]);
  g.fillStyle = '#7F1D1D'; g.fillRect(x - 1, y - 12 + bob, 3, 10);
  g.fillStyle = '#DC2626'; g.beginPath(); g.arc(x, y - 16 + bob, 5, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FCA5A5'; g.fillRect(x - 2, y - 19 + bob, 2, 2);
  const w = 132, lx = x - w / 2, ly = y - 40 + bob;
  g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(lx + 1, ly + 1, w, 15);
  g.fillStyle = blink ? '#DC2626' : '#B91C1C'; g.fillRect(lx, ly, w, 15);
  g.fillStyle = '#FCA5A5'; g.fillRect(lx, ly, w, 1);
  g.restore();
  signText(g, 'YOU ARE GOING HERE', x, ly + 11, { sx: 1, sy: 1, bold: true, fill: '#FFFFFF' });
};
