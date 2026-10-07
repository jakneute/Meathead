import React, { useEffect, useRef } from 'react';
import { LANDS, type Land } from './lands';
import { Prompt } from '../../m1/components/ButtonIcons';

// The map: Happy Land's official guest map, the whole ridiculous thing, the land you're about to go into picked out
// on it. Painted on a canvas, redrawn every frame (the highlight blinks).

const W = 640, H = 400;
const HUB_C = { x: 300, y: 178 }, HUB_R = 30, LAND_R = 150;

type Ctx = CanvasRenderingContext2D;
const text = (g: Ctx, s: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center') => {
  g.font = `${size}px "Press Start 2P"`; g.textAlign = align; g.fillStyle = color; g.fillText(s, x, y);
};

/** A land's slice of the ring round the hub (its edge wobbly, like it was drawn by a guy). */
const slice = (g: Ctx, i: number) => {
  const a0 = -Math.PI / 2 + (i / 8) * Math.PI * 2 + 0.02, a1 = a0 + Math.PI * 2 / 8 - 0.04;
  g.beginPath();
  g.arc(HUB_C.x, HUB_C.y, HUB_R + 10, a0, a1);
  for (let k = 10; k >= 0; k--) {
    const a = a0 + (a1 - a0) * (k / 10), r = LAND_R + Math.sin(k * 1.7 + i * 3) * 8;
    g.lineTo(HUB_C.x + Math.cos(a) * r, HUB_C.y + Math.sin(a) * r * 0.82);
  }
  g.closePath();
};
const sliceMid = (i: number, r: number) => {
  const a = -Math.PI / 2 + ((i + 0.5) / 8) * Math.PI * 2;
  return { x: HUB_C.x + Math.cos(a) * r, y: HUB_C.y + Math.sin(a) * r * 0.82 };
};

const paint = (g: Ctx, chosen: number, t: number) => {
  g.setTransform(1, 0, 0, 1, 0, 0);
  // The paper: printed in bands, a fold down the middle
  ['#F3E9CF', '#EFE3C4', '#EADDBA'].forEach((c, i) => { g.fillStyle = c; g.fillRect(0, i * (H / 3), W, H / 3 + 1); });
  g.fillStyle = 'rgba(120, 90, 50, 0.12)'; g.fillRect(W / 2 - 1, 0, 2, H);
  // The water park, off in its own corner, enormous
  g.fillStyle = '#7DC3E8'; g.beginPath(); g.ellipse(84, 320, 92, 58, -0.2, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#3B82C4'; g.lineWidth = 2; for (let k = 0; k < 4; k++) { g.beginPath(); for (let x = 20; x < 150; x += 6) g.lineTo(x, 300 + k * 12 + Math.sin(x * 0.2 + k + t * 0.003) * 2); g.stroke(); }
  text(g, 'WATER PARK', 84, 318, 8, '#0C4A6E'); text(g, '(COMING SOON-ISH)', 84, 332, 5, '#0C4A6E');
  // The monorail, all the way round, going nowhere in particular
  g.strokeStyle = '#94A3B8'; g.lineWidth = 3; g.setLineDash([8, 4]); g.beginPath(); g.ellipse(HUB_C.x, HUB_C.y, LAND_R + 34, (LAND_R + 34) * 0.82, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
  text(g, 'MONORAIL TO THE OTHER MONORAIL', HUB_C.x + 120, 24, 5, '#475569');
  // The lands
  LANDS.forEach((land, i) => {
    g.fillStyle = land.swirl[1]; slice(g, i); g.fill();
    g.strokeStyle = '#3B2A14'; g.lineWidth = 1.5; g.stroke();
    landIcon(g, land, sliceMid(i, 92));
    const m = sliceMid(i, 128);
    g.fillStyle = 'rgba(255, 255, 255, 0.85)';
    g.font = '5px "Press Start 2P"'; const tw = g.measureText(land.name).width + 6;
    g.fillRect(m.x - tw / 2, m.y - 6, tw, 9);
    text(g, land.name, m.x, m.y + 1, 5, '#1C1917');
  });
  // The hub in the middle, and you in it
  g.fillStyle = '#E7D9BC'; g.beginPath(); g.ellipse(HUB_C.x, HUB_C.y, HUB_R + 6, (HUB_R + 6) * 0.82, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#3B2A14'; g.stroke();
  text(g, 'HAPPY', HUB_C.x, HUB_C.y - 2, 6, '#7C2D12'); text(g, 'HUB', HUB_C.x, HUB_C.y + 8, 6, '#7C2D12');
  // America USA down the boulevard, the ticket booths, the parking (all of it)
  g.fillStyle = '#E7D9BC'; g.fillRect(HUB_C.x - 12, HUB_C.y + 120, 24, 210);
  for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? '#DC2626' : '#1E3A8A'; g.fillRect(HUB_C.x - 22, HUB_C.y + 150 + k * 9, 6, 5); g.fillRect(HUB_C.x + 16, HUB_C.y + 150 + k * 9, 6, 5); }
  text(g, 'AMERICA USA', HUB_C.x + 74, HUB_C.y + 172, 6, '#1E3A8A');
  text(g, 'TICKETS', HUB_C.x + 54, HUB_C.y + 196, 5, '#57534E');
  g.fillStyle = '#A8A29E'; g.fillRect(HUB_C.x - 80, H - 34, 160, 22); g.strokeStyle = '#57534E'; g.strokeRect(HUB_C.x - 80, H - 34, 160, 22);
  text(g, 'PARKING P1-P47', HUB_C.x, H - 20, 6, '#1C1917');
  text(g, 'OVERFLOW PARKING: NEXT STATE >', W - 8, H - 20, 5, '#57534E', 'right');
  // Services
  const note = (s: string, x: number, y: number) => text(g, s, x, y, 5, '#57534E', 'left');
  note('LOST CHILDREN', 500, 70); note('LOST ADULTS', 500, 84); note('FIRST AID', 500, 112); note('SECOND AID', 500, 126); note('RESTROOMS: 2.4 MILES', 500, 154); note('EMPLOYEES ONLY', 500, 182); note('(NOT ON MAP)', 500, 196);
  g.fillStyle = '#1C1917'; g.fillRect(500, 232, 60, 3); g.fillRect(500, 228, 2, 10); g.fillRect(558, 228, 2, 10); note('1 INCH = 1 MILE', 500, 252);
  // You are here; you're going there
  const blink = Math.floor(t / 300) % 2 === 0;
  g.fillStyle = '#DC2626'; g.beginPath(); g.arc(HUB_C.x, HUB_C.y + 18, 3, 0, Math.PI * 2); g.fill();
  if (chosen >= 0) {
    g.strokeStyle = blink ? '#FDE047' : '#DC2626'; g.lineWidth = 4; slice(g, chosen); g.stroke();
    const m = sliceMid(chosen, LAND_R + 18), a = sliceMid(chosen, 70);
    g.strokeStyle = '#DC2626'; g.lineWidth = 3; g.beginPath(); g.moveTo(HUB_C.x, HUB_C.y + 14); g.quadraticCurveTo((HUB_C.x + a.x) / 2 + 10, (HUB_C.y + a.y) / 2 - 10, a.x, a.y); g.stroke();
    g.fillStyle = '#DC2626'; g.beginPath(); g.arc(a.x, a.y, 4, 0, Math.PI * 2); g.fill();
    const lx = Math.max(70, Math.min(W - 70, m.x)), ly = Math.max(40, Math.min(H - 40, m.y));
    g.fillStyle = '#DC2626'; g.fillRect(lx - 64, ly - 9, 128, 14);
    text(g, 'YOU ARE GOING HERE', lx, ly + 2, 5, '#FFFFFF');
  }
  g.textAlign = 'left';
};

/** A tiny landmark for a land on the map. */
const landIcon = (g: Ctx, land: Land, at: { x: number; y: number }) => {
  const { x, y } = at;
  g.fillStyle = land.swirl[0]; g.strokeStyle = land.swirl[0]; g.lineWidth = 2;
  switch (land.id) {
    case 'space': g.fillRect(x - 2, y - 20, 4, 22); g.beginPath(); g.ellipse(x, y - 20, 12, 4, 0, 0, Math.PI * 2); g.fill(); break;
    case 'frontier': g.beginPath(); g.moveTo(x - 16, y + 4); g.lineTo(x - 10, y - 12); g.lineTo(x + 10, y - 14); g.lineTo(x + 16, y + 4); g.fill(); break;
    case 'spooky': g.fillRect(x - 10, y - 12, 20, 16); for (const dx of [-10, 0, 10]) { g.beginPath(); g.moveTo(x + dx - 4, y - 12); g.lineTo(x + dx, y - 24); g.lineTo(x + dx + 4, y - 12); g.fill(); } break;
    case 'cartoon': g.beginPath(); g.arc(x - 6, y, 9, Math.PI, 0); g.arc(x + 7, y, 11, Math.PI, 0); g.fill(); break;
    case 'hollywood': g.fillRect(x - 14, y - 8, 28, 12); text(g, 'HW', x, y + 1, 5, '#FDE047'); break;
    case 'fantasy': for (const dx of [-8, 0, 8]) { g.fillRect(x + dx - 3, y - 14, 6, 18); g.beginPath(); g.moveTo(x + dx - 5, y - 14); g.lineTo(x + dx, y - 24); g.lineTo(x + dx + 5, y - 14); g.fill(); } break;
    case 'nature': g.fillRect(x - 2, y - 6, 4, 10); g.beginPath(); g.arc(x, y - 12, 10, 0, Math.PI * 2); g.fill(); break;
    case 'foreign': g.beginPath(); g.moveTo(x - 10, y + 4); g.lineTo(x, y - 22); g.lineTo(x + 10, y + 4); g.fill(); break;
  }
};

const MapCard: React.FC<{ land: number }> = ({ land }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let id = 0;
    const loop = (t: number) => { const g = ref.current?.getContext('2d'); if (g) paint(g, land, t); id = requestAnimationFrame(loop); };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [land]);
  const l = LANDS[land];
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60">
      <div className="flex flex-col items-center gap-2 p-3" style={{ background: '#3B2A14', border: '3px solid #1C1206', boxShadow: '0 0 0 2px #000, 6px 6px 0 rgba(0,0,0,0.5)' }}>
        <div className="text-[10px] text-amber-100 tracking-wide">HAPPY LAND · OFFICIAL GUEST MAP</div>
        <canvas ref={ref} width={W} height={H} style={{ width: W, height: H, imageRendering: 'auto' }} />
        <div className="w-full flex items-center justify-between text-[8px] text-amber-50 px-1">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-yellow-300">{l?.name}</span>
            <span>{l?.blurb}</span>
          </div>
          <div className="flex gap-4 shrink-0">
            <Prompt pad={['OK']} kb={['ENTER']} label="GO" />
            <Prompt pad={['BACK']} kb={['ESC']} label="BACK" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapCard;
