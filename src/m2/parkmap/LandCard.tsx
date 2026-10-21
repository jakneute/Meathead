import React, { useEffect, useRef } from 'react';
import { LANDS } from '../hub/lands';
import { Prompt } from '../../m1/components/ButtonIcons';
import { signText, rampDown } from '../signLetters';
import { inLand } from './geo';
import { ATTRACTIONS, CAST, NUMBERS } from './data';
import { ZOOMS, levelCanvas, landOutline } from './render';
import { castPhotoImg } from './photos';
import { remainsPhotoImg } from './remains';
import { bossDeath } from '../store';

// The hub's portal card, YOU ARE GOING HERE (up at a land's portal; the hub's own confirm and cancel, hub/index.ts):
// a preview of that one land, not the park map: its corner of the brochure map close up (its landmarks, its walks,
// its numbers), its name in its own gate lettering, YOU ARE GOING HERE on it, and its attractions down the side.

const W = 400, H = 420;
const INK = '#3B2A14';

const LandCard: React.FC<{ land: number }> = ({ land }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const l = LANDS[land];
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
        g.fillStyle = blink ? '#DC2626' : '#B91C1C'; g.fillRect(W / 2 - 74, 48, 148, 15);
        g.fillStyle = '#FCA5A5'; g.fillRect(W / 2 - 74, 48, 148, 1);
        signText(g, 'YOU ARE GOING HERE', W / 2, 59, { sx: 1, sy: 1, bold: true, fill: '#FFFFFF' });
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
              <div className="text-[6px] tracking-widest" style={{ color: l?.signText }}>ATTRACTIONS</div>
              <div className="text-[6px] leading-[9px] mt-[3px] italic" style={{ color: l?.signText }}>{l?.blurb}</div>
            </div>
            <div className="flex flex-col gap-[6px] px-2 pt-2 overflow-hidden">
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
            </div>
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
            <Prompt pad={['OK']} kb={['ENTER']} label="GO" />
            <Prompt pad={['BACK']} kb={['ESC']} label="BACK" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandCard;
