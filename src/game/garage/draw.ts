// Meathead's garage, drawn: cinder block, two fluorescent tubes (one on its way out), the roll-up door, the squat rack
// and the bench, a pegboard and two shelves, and the floor. His souvenirs go where they go (the pegboard, the shelves,
// the floor), one spot for each of them; a spot with nothing in it yet is a faint outline and a question mark.

import { SOUVENIRS, Souvenir } from '../../content/garage';

type Ctx = CanvasRenderingContext2D;
export const GARAGE_W = 800, GARAGE_H = 600;

/** Where each souvenir goes: its anchor (a hung thing's middle; a standing thing's bottom middle), and the box it's clicked in. */
export interface Slot { x: number; y: number; box: { x: number; y: number; w: number; h: number } }
const COLS = [217, 311, 405, 499, 593];
const WALL_ROWS = [104, 188], SHELF_Y = [310, 396], FLOOR_Y = 528, FLOOR_X = [236, 366, 496, 616];
const WALL_ORDER = ['antler', 'neon', 'seismo', 'daycare', 'hazmat', 'breaker', 'clock', 'chain', 'goldgun', 'badge'];
const SHELF_ORDER = ['moonboots', 'snowglobe', 'lavalamp', 'mug', 'bell', 'clicker', 'flintjar', 'horn', 'hardhat', 'toaster'];
const FLOOR_ORDER = ['viprope', 'flamingo', 'derrick', 'lizard'];

export const SLOTS: Record<string, Slot> = {};
WALL_ORDER.forEach((id, i) => { const x = COLS[i % 5], y = WALL_ROWS[Math.floor(i / 5)]; SLOTS[id] = { x, y, box: { x: x - 44, y: y - 40, w: 88, h: 80 } }; });
SHELF_ORDER.forEach((id, i) => { const x = COLS[i % 5], y = SHELF_Y[Math.floor(i / 5)]; SLOTS[id] = { x, y, box: { x: x - 44, y: y - 70, w: 88, h: 70 } }; });
FLOOR_ORDER.forEach((id, i) => { const x = FLOOR_X[i], y = FLOOR_Y; SLOTS[id] = { x, y, box: { x: x - 52, y: y - 104, w: 104, h: 104 } }; });

/** The order they're gone through with the arrow keys / the stick: along the pegboard, the shelves, the floor. */
export const SOUVENIR_ORDER = [...WALL_ORDER, ...SHELF_ORDER, ...FLOOR_ORDER];

export const drawGarage = (ctx: Ctx, t: number, owned: string[], selected: string | null, showEmpty = true) => {
  drawRoom(ctx, t);
  for (const s of SOUVENIRS) {
    const slot = SLOTS[s.id];
    if (!slot) continue;
    if (owned.includes(s.id)) {
      if (s.id === selected) highlight(ctx, slot, t);
      ctx.save(); ctx.translate(slot.x, slot.y); DRAW[s.id]?.(ctx, t); ctx.restore();
    } else if (showEmpty) emptySpot(ctx, s, slot);
  }
  // The light from the tubes, over everything
  const flick = tubeFlicker(t);
  const g = ctx.createRadialGradient(400, 40, 20, 400, 200, 520);
  g.addColorStop(0, `rgba(254, 249, 195, ${0.12 * flick})`); g.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, GARAGE_W, GARAGE_H);
};

/** The second tube's on its way out: now and then it stutters. */
const tubeFlicker = (t: number) => (Math.floor(t / 7) % 23 === 0 || Math.floor(t / 5) % 41 === 3 ? 0.4 : 1);

const drawRoom = (ctx: Ctx, t: number) => {
  // Cinder block
  ctx.fillStyle = '#4A4540'; ctx.fillRect(0, 0, GARAGE_W, 420);
  ctx.fillStyle = '#524C46';
  for (let y = 0; y < 420; y += 24) for (let x = ((y / 24) % 2) * 30 - 30; x < GARAGE_W; x += 60) ctx.fillRect(x + 2, y + 2, 56, 20);
  // The floor: concrete, an oil stain, a drain
  ctx.fillStyle = '#5B5650'; ctx.fillRect(0, 420, GARAGE_W, 180);
  ctx.fillStyle = '#524D48'; for (let x = 0; x < GARAGE_W; x += 160) ctx.fillRect(x, 420, 2, 180);
  ctx.fillStyle = 'rgba(20, 16, 12, 0.45)'; ctx.beginPath(); ctx.ellipse(470, 560, 120, 18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2A2724'; ctx.fillRect(390, 470, 30, 8); ctx.fillStyle = '#1A1816'; for (let i = 0; i < 5; i++) ctx.fillRect(392 + i * 6, 472, 3, 4);
  ctx.fillStyle = '#3A3632'; ctx.fillRect(0, 416, GARAGE_W, 6);
  // The tubes
  const flick = tubeFlicker(t);
  ctx.fillStyle = '#2A2724'; ctx.fillRect(200, 14, 170, 10); ctx.fillRect(440, 14, 170, 10);
  ctx.fillStyle = '#FEF9C3'; ctx.fillRect(206, 24, 158, 5);
  ctx.fillStyle = flick < 1 ? '#78716C' : '#FEF9C3'; ctx.fillRect(446, 24, 158, 5);
  // The roll-up door, light coming in under it
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(660, 110, 130, 310);
  ctx.fillStyle = '#6B7280'; for (let y = 124; y < 420; y += 22) ctx.fillRect(660, y, 130, 3);
  ctx.fillStyle = '#374151'; ctx.fillRect(654, 104, 142, 8); ctx.fillRect(654, 104, 6, 316); ctx.fillRect(790, 104, 6, 316);
  ctx.fillStyle = '#4B5563'; ctx.fillRect(712, 396, 26, 6);
  ctx.fillStyle = 'rgba(253, 230, 138, 0.35)'; ctx.fillRect(660, 418, 130, 4);
  ctx.fillStyle = 'rgba(253, 230, 138, 0.12)'; ctx.beginPath(); ctx.moveTo(660, 422); ctx.lineTo(790, 422); ctx.lineTo(800, 470); ctx.lineTo(630, 470); ctx.closePath(); ctx.fill();
  // A poster
  ctx.fillStyle = '#FACC15'; ctx.fillRect(22, 40, 110, 70); ctx.fillStyle = '#111827'; ctx.fillRect(26, 44, 102, 62);
  ctx.fillStyle = '#EF4444'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillText('NO PAIN', 77, 70); ctx.fillStyle = '#F8FAFC'; ctx.fillText('NO GAIN', 77, 92); ctx.textAlign = 'left';
  // The squat rack, the bar, the plates
  ctx.fillStyle = '#1F2937'; ctx.fillRect(28, 150, 12, 270); ctx.fillRect(122, 150, 12, 270); ctx.fillRect(22, 146, 118, 8);
  ctx.fillStyle = '#6B7280'; for (let y = 180; y < 400; y += 16) { ctx.fillRect(36, y, 4, 4); ctx.fillRect(122, y, 4, 4); }
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(4, 244, 156, 5);
  for (const [px, s] of [[14, 1], [148, 1], [22, 0.8], [140, 0.8]] as const) { ctx.fillStyle = '#111827'; ctx.fillRect(px - 5, 246 - 30 * s, 10, 60 * s); ctx.fillStyle = '#374151'; ctx.fillRect(px - 3, 246 - 26 * s, 6, 52 * s); }
  // The pegboard
  // (the pegboard's just big enough for its two rows, 8px round them)
  const pegTop = WALL_ROWS[0] - 48, pegBottom = WALL_ROWS[1] + 48;
  ctx.fillStyle = '#A16207'; ctx.fillRect(166, pegTop, 478, pegBottom - pegTop);
  ctx.fillStyle = '#B45309'; ctx.fillRect(166, pegTop, 478, 4);
  ctx.fillStyle = '#78350F'; for (let y = pegTop + 12; y < pegBottom - 4; y += 12) for (let x = 174; x < 640; x += 12) ctx.fillRect(x, y, 2, 2);
  // The shelves, and their brackets
  for (const y of SHELF_Y) {
    ctx.fillStyle = '#78716C'; ctx.fillRect(166, y, 478, 8); ctx.fillStyle = '#A8A29E'; ctx.fillRect(166, y, 478, 2);
    ctx.fillStyle = '#44403C'; for (const x of [176, 400, 624]) { ctx.fillRect(x, y + 8, 6, 22); ctx.fillRect(x, y + 8, 14, 4); }
  }
  // The mini fridge (protein)
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(28, 470, 70, 90); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(28, 500, 70, 3); ctx.fillRect(88, 480, 4, 16);
  ctx.fillStyle = '#DC2626'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('PROTEIN', 63, 530); ctx.fillText('ONLY', 63, 542); ctx.textAlign = 'left';
};

/** A spot with nothing in it yet: a faint outline where it'll go, and a question mark. */
const emptySpot = (ctx: Ctx, s: Souvenir, slot: Slot) => {
  ctx.save();
  ctx.strokeStyle = 'rgba(245, 245, 244, 0.13)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
  const b = slot.box, inset = 14;
  ctx.strokeRect(b.x + inset, b.y + inset, b.w - inset * 2, b.h - inset * 2 - (s.spot === 'wall' ? 0 : 4));
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(245, 245, 244, 0.18)'; ctx.font = 'bold 16px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillText('?', b.x + b.w / 2, b.y + b.h / 2 + 8);
  ctx.restore();
};

const highlight = (ctx: Ctx, slot: Slot, t: number) => {
  const b = slot.box, a = 0.5 + 0.3 * Math.sin(t * 0.12);
  ctx.save();
  ctx.fillStyle = `rgba(250, 204, 21, ${0.12 * a})`; ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.strokeStyle = `rgba(250, 204, 21, ${a})`; ctx.lineWidth = 3; ctx.strokeRect(b.x + 1.5, b.y + 1.5, b.w - 3, b.h - 3);
  ctx.restore();
};

// ---------------------------------------------------------------------------
// The souvenirs (each drawn about its anchor: a hung one's middle, a standing one's bottom middle)
// ---------------------------------------------------------------------------

const peg = (ctx: Ctx, x: number, y: number) => { ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x - 2, y - 2, 4, 8); };

const DRAW: Record<string, (ctx: Ctx, t: number) => void> = {
  antler: ctx => {
    ctx.fillStyle = '#5B3417'; ctx.beginPath(); ctx.ellipse(0, 22, 16, 10, 0, 0, Math.PI * 2); ctx.fill(); // the plaque
    ctx.fillStyle = '#D6C4A1';
    ctx.beginPath(); ctx.moveTo(-6, 18); ctx.quadraticCurveTo(-30, 6, -34, -22); ctx.lineTo(-26, -14); ctx.lineTo(-24, -32); ctx.lineTo(-16, -18); ctx.lineTo(-10, -34); ctx.lineTo(-6, -16);
    ctx.lineTo(2, -30); ctx.lineTo(4, -12); ctx.lineTo(12, -24); ctx.lineTo(10, -4); ctx.quadraticCurveTo(8, 10, 4, 18); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#B8A580'; ctx.fillRect(-4, 8, 6, 10);
  },
  neon: (ctx, t) => {
    ctx.fillStyle = '#111827'; ctx.fillRect(-42, -22, 84, 44); peg(ctx, -34, -26); peg(ctx, 34, -26);
    const on = Math.floor(t / 40) % 9 !== 0;
    ctx.save(); ctx.shadowColor = '#F472B6'; ctx.shadowBlur = on ? 10 : 0;
    ctx.fillStyle = on ? '#F9A8D4' : '#6B213F'; ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText('CLUB', 0, -4); ctx.fillStyle = on ? '#FDBA74' : '#7C2D12'; ctx.fillText('CALDERA', 0, 12); ctx.restore();
  },
  seismo: ctx => {
    ctx.fillStyle = '#1C1917'; ctx.fillRect(-40, -30, 80, 60); ctx.fillStyle = '#F5F5F4'; ctx.fillRect(-35, -25, 70, 50);
    ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-32, 2);
    for (let x = -32; x <= 32; x += 4) ctx.lineTo(x, 2 + (Math.abs(x - 6) < 5 ? (x % 8 === 0 ? -22 : 20) : Math.sin(x * 1.3) * 3));
    ctx.stroke(); ctx.fillStyle = '#1C1917'; ctx.font = '5px "Press Start 2P"'; ctx.fillText('YOU', 8, -16);
  },
  daycare: ctx => {
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-42, -18, 84, 36); ctx.strokeStyle = '#DB2777'; ctx.lineWidth = 2; ctx.strokeRect(-42, -18, 84, 36);
    ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(-28, 0, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#DB2777'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('LITTLE', 8, -2); ctx.fillText('SUNSHINE', 8, 9);
    ctx.save(); ctx.translate(30, 14); ctx.rotate(0.4); ctx.fillStyle = '#A16207'; ctx.fillRect(-6, -2, 12, 4); ctx.restore(); // (a crack across the corner)
  },
  hazmat: ctx => {
    peg(ctx, 0, -32);
    ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.ellipse(0, 0, 24, 28, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1F2937'; ctx.fillRect(-14, -8, 28, 14); ctx.fillStyle = 'rgba(163, 230, 53, 0.35)'; ctx.fillRect(-12, -6, 24, 3);
    ctx.fillStyle = '#A16207'; ctx.fillRect(-10, 16, 20, 4);
  },
  breaker: (ctx, t) => {
    // The big knife switch: its slate panel bolted to the pegboard, the copper blades thrown down to OFF, the red
    // handle, MANHATTAN on the label; scorched round the jaws, and now and then an arc off them (it's on nothing)
    peg(ctx, -24, -34); peg(ctx, 24, -34);
    ctx.fillStyle = '#3F3F46'; ctx.fillRect(-26, -32, 52, 66); ctx.fillStyle = '#52525B'; ctx.fillRect(-24, -30, 48, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(0, -20, 18, 6, 0, 0, Math.PI * 2); ctx.fill();
    for (const x of [-12, 12]) { ctx.fillStyle = '#B45309'; ctx.fillRect(x - 3, -24, 6, 8); ctx.fillStyle = '#D97706'; ctx.fillRect(x - 3, 10, 6, 8); }
    ctx.fillStyle = '#F59E0B'; ctx.fillRect(-14, 0, 4, 20); ctx.fillRect(10, 0, 4, 20); ctx.fillRect(-14, 18, 28, 4);
    ctx.fillStyle = '#DC2626'; ctx.fillRect(-8, 22, 16, 9); ctx.fillStyle = '#FCA5A5'; ctx.fillRect(-7, 23, 6, 2);
    ctx.fillStyle = '#F5F5F4'; ctx.fillRect(-20, -9, 40, 7); ctx.fillStyle = '#111827'; ctx.font = 'bold 4px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('MANHATTAN', 0, -4);
    ctx.fillStyle = '#16A34A'; ctx.font = 'bold 4px "Press Start 2P"'; ctx.fillText('ON', 0, -26); ctx.fillStyle = '#DC2626'; ctx.fillText('OFF', 0, 33);
    if (Math.floor(t / 4) % 53 === 0) { ctx.strokeStyle = '#BAE6FD'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-12, -16); ctx.lineTo(-6, -10); ctx.lineTo(-10, -6); ctx.lineTo(-4, 0); ctx.stroke(); }
  },
  clock: ctx => {
    // (it keeps real time)
    const d = new Date(), h = d.getHours() % 12, m = d.getMinutes(), s = d.getSeconds();
    ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#111827'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#111827'; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; ctx.fillRect(Math.sin(a) * 21 - 1, -Math.cos(a) * 21 - 1, 2, 2); }
    const hand = (turns: number, len: number, w: number, c: string) => { const a = turns * Math.PI * 2; ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(a) * len, -Math.cos(a) * len); ctx.stroke(); };
    hand((h + m / 60) / 12, 13, 3, '#111827'); hand((m + s / 60) / 60, 19, 2, '#111827'); hand(s / 60, 20, 1, '#DC2626');
    ctx.lineCap = 'butt';
  },
  chain: ctx => {
    peg(ctx, -28, -26); peg(ctx, 28, -26);
    ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 3;
    for (let i = 0; i <= 10; i++) { const u = i / 10, x = -28 + u * 56, y = -22 + Math.sin(u * Math.PI) * 40; ctx.beginPath(); ctx.ellipse(x, y, 4, 2.5, (i % 2) * Math.PI / 2, 0, Math.PI * 2); ctx.stroke(); }
  },
  goldgun: ctx => {
    peg(ctx, -10, -14); peg(ctx, 16, -14);
    ctx.fillStyle = '#EAB308'; ctx.fillRect(-26, -10, 52, 12); ctx.fillRect(-26, -10, 14, 30);
    ctx.fillStyle = '#FDE047'; ctx.fillRect(-24, -9, 48, 3);
    ctx.fillStyle = '#A16207'; ctx.fillRect(-10, 2, 8, 6); ctx.fillStyle = '#111827'; ctx.fillRect(24, -8, 3, 4);
  },
  badge: ctx => {
    peg(ctx, 0, -28);
    ctx.fillStyle = '#FACC15'; ctx.beginPath();
    for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 11 : 24; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#A16207'; ctx.font = 'bold 4px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('SHERIFF', 0, 2);
  },
  moonboots: ctx => {
    for (const dx of [-16, 14]) {
      ctx.fillStyle = '#D1D5DB'; ctx.fillRect(dx - 12, -44, 22, 30); ctx.fillRect(dx - 14, -16, 30, 16);
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(dx - 12, -30, 22, 3); ctx.fillStyle = '#374151'; ctx.fillRect(dx - 14, -4, 30, 4);
    }
  },
  snowglobe: (ctx, t) => {
    ctx.fillStyle = '#5B3417'; ctx.fillRect(-20, -12, 40, 12);
    ctx.fillStyle = 'rgba(186, 230, 253, 0.35)'; ctx.beginPath(); ctx.arc(0, -34, 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(-16, -18); ctx.lineTo(-2, -44); ctx.lineTo(4, -34); ctx.lineTo(8, -40); ctx.lineTo(18, -18); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; for (let i = 0; i < 9; i++) { const y = -56 + ((t * 0.3 + i * 5) % 36), x = Math.sin(i * 2.1 + t * 0.02) * 16; ctx.fillRect(x, y, 2, 2); }
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -34, 24, -2.5, -1.6); ctx.stroke();
  },
  lavalamp: (ctx, t) => {
    ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.lineTo(8, -14); ctx.lineTo(-8, -14); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#7C2D12'; ctx.beginPath(); ctx.moveTo(-8, -14); ctx.lineTo(8, -14); ctx.lineTo(12, -54); ctx.lineTo(-12, -54); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#F97316';
    for (let i = 0; i < 3; i++) { const y = -18 - ((t * 0.25 + i * 13) % 34); ctx.beginPath(); ctx.ellipse(Math.sin(t * 0.02 + i) * 3, y, 4 + (i % 2) * 2, 5, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.moveTo(-12, -54); ctx.lineTo(12, -54); ctx.lineTo(6, -66); ctx.lineTo(-6, -66); ctx.closePath(); ctx.fill();
  },
  mug: ctx => {
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-16, -34, 28, 34); ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(14, -18, 8, -1.2, 1.2); ctx.stroke();
    ctx.fillStyle = '#1E3A8A'; ctx.font = 'bold 4px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('ALCATRAZ', -2, -18);
    ctx.fillStyle = '#44403C'; ctx.fillRect(-14, -32, 24, 3);
  },
  bell: ctx => {
    ctx.fillStyle = '#44403C'; ctx.fillRect(-18, -4, 36, 4); ctx.fillRect(-2, -52, 4, 50);
    ctx.fillStyle = '#CA8A04'; ctx.beginPath(); ctx.moveTo(-14, -18); ctx.quadraticCurveTo(-12, -44, 0, -46); ctx.quadraticCurveTo(12, -44, 14, -18); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FDE047'; ctx.fillRect(-10, -40, 4, 16); ctx.fillStyle = '#78350F'; ctx.beginPath(); ctx.arc(0, -15, 3, 0, Math.PI * 2); ctx.fill();
  },
  clicker: (ctx, t) => {
    ctx.fillStyle = '#4B5563'; ctx.fillRect(-10, -40, 20, 40); ctx.fillStyle = '#6B7280'; ctx.fillRect(-8, -38, 16, 4);
    ctx.fillStyle = Math.floor(t / 30) % 2 ? '#EF4444' : '#991B1B'; ctx.beginPath(); ctx.arc(0, -24, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-6, -12, 5, 4); ctx.fillRect(1, -12, 5, 4);
  },
  flintjar: (ctx, t) => {
    const glow = 0.35 + 0.15 * Math.sin(t * 0.05);
    ctx.fillStyle = `rgba(163, 230, 53, ${glow})`; ctx.beginPath(); ctx.arc(0, -24, 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(186, 230, 253, 0.3)'; ctx.fillRect(-15, -46, 30, 46);
    ctx.fillStyle = 'rgba(101, 84, 22, 0.85)'; ctx.fillRect(-14, -34, 28, 34);
    ctx.fillStyle = 'rgba(163, 230, 53, 0.6)'; ctx.fillRect(-14, -34, 28, 3);
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-16, -52, 32, 7);
  },
  horn: ctx => {
    ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(-18, -16, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#CA8A04'; ctx.beginPath(); ctx.moveTo(-8, -20); ctx.lineTo(16, -26); ctx.lineTo(26, -34); ctx.lineTo(26, 2); ctx.lineTo(16, -6); ctx.lineTo(-8, -12); ctx.closePath(); ctx.fill();
  },
  hardhat: ctx => {
    ctx.fillStyle = '#1D4ED8'; ctx.beginPath(); ctx.ellipse(0, -8, 32, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -10, 24, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('CON ED', 0, -18);
    ctx.fillStyle = '#3B82F6'; ctx.fillRect(-2, -34, 4, 24);
  },
  toaster: ctx => {
    ctx.fillStyle = '#D1D5DB'; ctx.beginPath(); ctx.roundRect(-26, -36, 52, 36, 8); ctx.fill();
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-26, -12, 52, 3);
    ctx.fillStyle = '#B45309'; ctx.fillRect(-16, -48, 12, 14); ctx.fillRect(4, -46, 12, 12);
    ctx.fillStyle = '#374151'; ctx.fillRect(22, -24, 8, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(-22, -32, 4, 16);
  },
  viprope: ctx => {
    for (const dx of [-38, 38]) {
      ctx.fillStyle = '#CA8A04'; ctx.fillRect(dx - 3, -62, 6, 62); ctx.beginPath(); ctx.ellipse(dx, -2, 12, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(dx, -64, 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#B91C1C'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-35, -56); ctx.quadraticCurveTo(0, -24, 35, -56); ctx.stroke();
  },
  flamingo: ctx => {
    ctx.strokeStyle = '#1F2937'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(-2, -36); ctx.moveTo(6, 0); ctx.lineTo(2, -36); ctx.stroke();
    ctx.fillStyle = '#F472B6'; ctx.beginPath(); ctx.ellipse(0, -44, 20, 12, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#F472B6'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(14, -48); ctx.quadraticCurveTo(26, -70, 16, -84); ctx.stroke();
    ctx.fillStyle = '#F472B6'; ctx.beginPath(); ctx.arc(16, -86, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.moveTo(20, -86); ctx.lineTo(30, -80); ctx.lineTo(20, -82); ctx.fill();
    ctx.fillStyle = '#FACC15'; ctx.fillRect(16, -89, 2, 2);
  },
  derrick: (ctx, t) => {
    ctx.fillStyle = 'rgba(12, 10, 9, 0.8)'; ctx.beginPath(); ctx.ellipse(10, -2, 40, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#44403C'; ctx.fillRect(-40, -8, 80, 8);
    ctx.strokeStyle = '#78716C'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-30, -8); ctx.lineTo(-16, -90); ctx.lineTo(-2, -8); ctx.moveTo(-26, -34); ctx.lineTo(-6, -34); ctx.moveTo(-22, -60); ctx.lineTo(-10, -60); ctx.stroke();
    // The pumpjack nodding
    const a = Math.sin(t * 0.05) * 0.3;
    ctx.fillStyle = '#374151'; ctx.fillRect(18, -40, 6, 32);
    ctx.save(); ctx.translate(21, -42); ctx.rotate(a); ctx.fillStyle = '#EAB308'; ctx.fillRect(-26, -4, 52, 8); ctx.fillStyle = '#374151'; ctx.fillRect(-30, -8, 8, 22); ctx.restore();
  },
  lizard: (ctx, t) => {
    ctx.fillStyle = 'rgba(186, 230, 253, 0.2)'; ctx.fillRect(-48, -60, 96, 60);
    ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 2; ctx.strokeRect(-48, -60, 96, 60);
    ctx.fillStyle = '#A16207'; ctx.fillRect(-46, -10, 92, 8); ctx.fillStyle = '#65A30D'; ctx.fillRect(-36, -24, 4, 14); ctx.fillRect(-30, -20, 4, 10);
    ctx.fillStyle = '#4D7C0F'; ctx.beginPath(); ctx.ellipse(6, -14, 18, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-24, -14, 14, 2); ctx.beginPath(); ctx.arc(24, -15, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111827'; ctx.fillRect(25, -17, 2, 2);
    if (Math.floor(t / 20) % 5 === 0) { ctx.fillStyle = '#EF4444'; ctx.fillRect(29, -14, 8, 1.5); }
    ctx.fillStyle = '#78350F'; ctx.fillRect(-10 + ((t * 0.5) % 30), -12, 3, 2); // a cricket
  },
};
