// The boss doors: one for each of them, built to keep somebody out (it doesn't). Each is drawn on its face, 40 wide
// and 150 tall in the doorway, with what's over and round it; when he kicks it in it comes off its hinges and goes
// over flat into the room, and lies there on the floor the rest of the fight.
//
//   Artie: the cryo vault's hatch, frosted steel, a wheel to turn, icicles off the lintel
//   Victor: Club Caldera's VIP door, black lacquer and brass studs, a velvet rope, VIP in pink neon
//   Ernie: the old vault door under the prison, oak strapped with iron, a great padlock, 1859 cut over it
//   Hector: a hurricane door, corrugated steel boarded over in an X, sandbags at the foot of it
//   Tommy: a sewer bulkhead, riveted, a porthole, hazard stripes, the muck weeping out of the seams
//   Barry: the power room's door, DANGER HIGH VOLTAGE, black and yellow, sparks at the seams
//   Oscar: Oscar's office, brushed steel with a brass nameplate, NO SMOKING, oil running down it
//   Dale: the pharmacy, a roll-down security shutter, the green cross lit over it

import type { GameState } from '../core/state';
import { GROUND_Y } from '../../constants';

type Ctx = CanvasRenderingContext2D;
type Face = (ctx: Ctx, w: number, h: number, f: number) => void;

const rivets = (ctx: Ctx, w: number, h: number, color: string, every = 18) => {
  ctx.fillStyle = color;
  for (let y = 6; y < h - 4; y += every) { ctx.fillRect(3, y, 3, 3); ctx.fillRect(w - 6, y, 3, 3); }
};
const panel = (ctx: Ctx, w: number, h: number, base: string, light: string, dark: string) => {
  ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = light; ctx.fillRect(0, 0, w, 3); ctx.fillRect(0, 0, 3, h);
  ctx.fillStyle = dark; ctx.fillRect(w - 3, 0, 3, h); ctx.fillRect(0, h - 3, w, 3);
};

const FACES: Record<string, Face> = {
  'Artie Avalanche': (ctx, w, h) => {
    panel(ctx, w, h, '#94A3B8', '#E2E8F0', '#475569');
    ctx.fillStyle = '#CBD5E1'; for (let y = 14; y < h; y += 30) ctx.fillRect(4, y, w - 8, 3);
    rivets(ctx, w, h, '#64748B');
    // the wheel
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(w / 2, h * 0.45, 11, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w / 2 - 11, h * 0.45); ctx.lineTo(w / 2 + 11, h * 0.45); ctx.moveTo(w / 2, h * 0.45 - 11); ctx.lineTo(w / 2, h * 0.45 + 11); ctx.stroke();
    // frost creeping in from the edges
    ctx.fillStyle = 'rgba(240, 249, 255, 0.7)'; for (let y = 0; y < h; y += 8) { ctx.fillRect(0, y, 3 + ((y * 7) % 5), 4); ctx.fillRect(w - 3 - ((y * 5) % 4), y + 4, 3 + ((y * 5) % 4), 4); }
  },
  'Victor Volcano': (ctx, w, h, f) => {
    panel(ctx, w, h, '#18181B', '#3F3F46', '#09090B');
    ctx.fillStyle = '#7F1D1D'; ctx.fillRect(5, 8, w - 10, h - 16); // the padded leather
    ctx.fillStyle = '#CA8A04'; for (let y = 14; y < h - 10; y += 14) for (let x = 9; x < w - 6; x += 11) ctx.fillRect(x + ((y / 14) % 2) * 5, y, 3, 3);
    ctx.fillStyle = '#FACC15'; ctx.fillRect(w - 11, h * 0.5 - 8, 4, 16); // the handle
    ctx.fillStyle = `rgba(236, 72, 153, ${0.6 + Math.sin(f * 0.1) * 0.2})`; ctx.fillRect(4, h - 6, w - 8, 2); // neon glow at the foot
  },
  'Ernie Earthquake': (ctx, w, h) => {
    ctx.fillStyle = '#5B3A1E'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#7C4A1E'; for (let x = 0; x < w; x += 10) ctx.fillRect(x + 1, 0, 8, h); // planks
    ctx.fillStyle = '#3B2210'; for (let x = 9; x < w; x += 10) ctx.fillRect(x, 0, 1, h);
    ctx.fillStyle = '#27272A'; for (const y of [16, h / 2 - 6, h - 28]) { ctx.fillRect(0, y, w, 10); ctx.fillStyle = '#52525B'; ctx.fillRect(0, y, w, 2); ctx.fillStyle = '#27272A'; }
    ctx.fillStyle = '#A1A1AA'; for (const y of [21, h / 2 - 1, h - 23]) for (let x = 5; x < w; x += 10) ctx.fillRect(x, y, 2, 2);
    // the padlock
    ctx.strokeStyle = '#71717A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(w - 13, h * 0.6, 5, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#A16207'; ctx.fillRect(w - 20, h * 0.6, 14, 12); ctx.fillStyle = '#1C1917'; ctx.fillRect(w - 14, h * 0.6 + 4, 2, 5);
  },
  'Hector Hurricane': (ctx, w, h) => {
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#6B7280'; for (let x = 0; x < w; x += 6) ctx.fillRect(x, 0, 3, h); // corrugations
    ctx.fillStyle = '#D1D5DB'; for (let x = 1; x < w; x += 6) ctx.fillRect(x, 0, 1, h);
    // plywood boarded across it in an X, nailed
    ctx.save(); ctx.fillStyle = '#B45309';
    ctx.translate(w / 2, h / 2); ctx.rotate(0.95); ctx.fillRect(-h * 0.55, -5, h * 1.1, 10); ctx.rotate(-1.9); ctx.fillRect(-h * 0.55, -5, h * 1.1, 10);
    ctx.restore();
    ctx.fillStyle = '#7F1D1D'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('KEEP', w / 2, 24); ctx.fillText('OUT', w / 2, 34); ctx.textAlign = 'left';
  },
  'Toxic Tommy': (ctx, w, h, f) => {
    panel(ctx, w, h, '#3F4A3C', '#5F6E5A', '#1F271D');
    rivets(ctx, w, h, '#1F271D', 12);
    ctx.fillStyle = '#FACC15'; for (let x = -10; x < w; x += 10) { ctx.save(); ctx.beginPath(); ctx.rect(0, h - 18, w, 12); ctx.clip(); ctx.translate(x, h - 18); ctx.transform(1, 0, 0.8, 1, 0, 0); ctx.fillRect(0, 0, 5, 12); ctx.restore(); }
    // the porthole, the muck behind it
    ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.arc(w / 2, h * 0.32, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#65A30D'; ctx.beginPath(); ctx.arc(w / 2, h * 0.32, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#A3E635'; ctx.fillRect(w / 2 - 4, h * 0.32 - 5 + Math.sin(f * 0.1) * 2, 3, 3);
    // biohazard plate
    ctx.fillStyle = '#FACC15'; ctx.fillRect(w / 2 - 9, h * 0.55, 18, 16); ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(w / 2, h * 0.55 + 8, 4, 0, Math.PI * 2); ctx.fill();
    // weeping out of the seams
    ctx.fillStyle = '#65A30D'; for (let k = 0; k < 3; k++) { const run = ((f * 0.4 + k * 30) % 60); ctx.fillRect(4 + k * 14, 0, 3, 8 + run); }
  },
  'Blackout Barry': (ctx, w, h, f) => {
    panel(ctx, w, h, '#52525B', '#71717A', '#27272A');
    // black and yellow round the edge
    for (let y = 0; y < h; y += 8) { ctx.fillStyle = (y / 8) % 2 ? '#FACC15' : '#111827'; ctx.fillRect(0, y, 4, 8); ctx.fillRect(w - 4, y, 4, 8); }
    // DANGER HIGH VOLTAGE plate with the bolt
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(7, 24, w - 14, 40); ctx.fillStyle = '#DC2626'; ctx.fillRect(7, 24, w - 14, 10);
    ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('DANGER', w / 2, 32);
    ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.moveTo(w / 2 + 3, 37); ctx.lineTo(w / 2 - 5, 50); ctx.lineTo(w / 2, 50); ctx.lineTo(w / 2 - 3, 61); ctx.lineTo(w / 2 + 6, 46); ctx.lineTo(w / 2 + 1, 46); ctx.closePath(); ctx.fill();
    ctx.textAlign = 'left';
    // sparks at the seams
    if (f % 23 < 3) { ctx.fillStyle = '#FDE047'; ctx.fillRect(w - 6, 90 + (f % 40), 4, 2); ctx.fillRect(w - 3, 88 + (f % 40), 2, 6); }
  },
  'Oily Oscar': (ctx, w, h, f) => {
    panel(ctx, w, h, '#A8A29E', '#D6D3D1', '#57534E');
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; for (let y = 4; y < h; y += 4) ctx.fillRect(3, y, w - 6, 1); // brushed
    ctx.fillStyle = '#CA8A04'; ctx.fillRect(6, 30, w - 12, 12); ctx.fillStyle = '#FEF08A'; ctx.fillRect(6, 30, w - 12, 2);
    ctx.fillStyle = '#422006'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('OSCAR', w / 2, 39);
    // NO SMOKING
    ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(w / 2, 70, 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(w / 2, 70, 8, 0, Math.PI * 2); ctx.moveTo(w / 2 - 6, 64); ctx.lineTo(w / 2 + 6, 76); ctx.stroke();
    ctx.fillStyle = '#111827'; ctx.fillRect(w / 2 - 5, 69, 10, 2);
    ctx.textAlign = 'left';
    // oil running down it
    ctx.fillStyle = '#0C0A09'; for (let k = 0; k < 3; k++) { const run = ((f * 0.3 + k * 25) % 70); ctx.fillRect(6 + k * 12, 0, 3, 20 + run); ctx.beginPath(); ctx.arc(7.5 + k * 12, 20 + run, 2.5, 0, Math.PI * 2); ctx.fill(); }
  },
  'Drug Trade Dale': (ctx, w, h) => {
    // the roll-down shutter, slat over slat, padlocked at the foot
    ctx.fillStyle = '#71717A'; ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 7) { ctx.fillStyle = '#A1A1AA'; ctx.fillRect(0, y, w, 2); ctx.fillStyle = '#52525B'; ctx.fillRect(0, y + 5, w, 2); }
    ctx.fillStyle = '#3F3F46'; ctx.fillRect(0, h - 8, w, 8);
    ctx.fillStyle = '#A16207'; ctx.fillRect(w / 2 - 5, h - 18, 10, 10);
    // spray paint on it
    ctx.fillStyle = 'rgba(22, 163, 74, 0.85)'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('WE', w / 2, 50); ctx.fillText('DLVR', w / 2, 60); ctx.textAlign = 'left';
  },
};

/** The plain one (anywhere without its own): a heavy riveted shutter. */
const plainFace: Face = (ctx, w, h) => {
  panel(ctx, w, h, '#3F3F46', '#52525B', '#18181B');
  ctx.fillStyle = '#52525B'; for (let y = 0; y < h; y += 12) ctx.fillRect(0, y, w, 2);
  ctx.fillStyle = '#FACC15'; for (let y = 6; y < h; y += 24) ctx.fillRect(4, y, w - 8, 3);
};

/** What's over the doorway, stage by stage (a sign, a light, icicles), drawn on the wall above it while it's standing. */
const drawLintel = (ctx: Ctx, stageId: string | null, x: number, y: number, w: number, f: number) => {
  ctx.fillStyle = '#1C1917'; ctx.fillRect(x - 6, y - 10, w + 12, 10);
  switch (stageId) {
    case 'Artie Avalanche':
      ctx.fillStyle = '#E0F2FE'; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(x - 4 + k * 9, y); ctx.lineTo(x + 2 + k * 9, y); ctx.lineTo(x - 1 + k * 9, y + 8 + (k % 3) * 4); ctx.closePath(); ctx.fill(); }
      break;
    case 'Victor Volcano':
      ctx.save(); ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.shadowColor = '#EC4899'; ctx.shadowBlur = 8;
      ctx.fillStyle = f % 90 > 4 ? '#F9A8D4' : '#831843'; ctx.fillText('VIP', x + w / 2, y - 14); ctx.restore();
      break;
    case 'Ernie Earthquake':
      ctx.fillStyle = '#A8A29E'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('1859', x + w / 2, y - 2); ctx.textAlign = 'left';
      break;
    case 'Toxic Tommy':
      ctx.fillStyle = '#65A30D'; for (let k = 0; k < 4; k++) { const d = (f * 0.5 + k * 13) % 30; ctx.fillRect(x + 4 + k * 10, y, 2, 3 + d * 0.4); }
      break;
    case 'Blackout Barry':
      ctx.fillStyle = f % 40 < 20 ? '#EF4444' : '#7F1D1D'; ctx.beginPath(); ctx.arc(x + w / 2, y - 14, 4, 0, Math.PI * 2); ctx.fill();
      break;
    case 'Drug Trade Dale':
      ctx.fillStyle = '#16A34A'; ctx.fillRect(x + w / 2 - 3, y - 26, 6, 18); ctx.fillRect(x + w / 2 - 9, y - 20, 18, 6);
      break;
  }
};

/** A fixed scatter (the same broken edge every frame). */
const rnd = (n: number) => { const v = Math.sin(n * 91.7) * 43758.5453; return v - Math.floor(v); };

/**
 * The wall round the doorway once the door's gone through it: the top of the opening torn up into the wall in a
 * ragged bite, the edges chipped back on both sides, cracks running off up the wall, a chunk or two hanging, and the
 * broken wall in heaps either side on the floor (`k`: how far it's got, 0..1, as the door goes over).
 */
const drawBrokenFrame = (ctx: Ctx, x: number, y: number, w: number, h: number, f: number, k: number) => {
  const bottom = y + h;
  ctx.save();
  // (the bite out of the wall over the opening, and the chips out of its sides: the dark of the hole)
  ctx.fillStyle = '#0C0A09';
  ctx.beginPath();
  ctx.moveTo(x - 8, bottom);
  for (let yy = bottom; yy > y; yy -= 12) ctx.lineTo(x - 2 - rnd(yy) * 9, yy);
  for (let i = 0; i <= 8; i++) ctx.lineTo(x - 6 + i * ((w + 12) / 8), y - 4 - rnd(i + 3) * 26 * Math.min(1, k * 2));
  for (let yy = y; yy < bottom; yy += 12) ctx.lineTo(x + w + 2 + rnd(yy + 7) * 8, yy);
  ctx.lineTo(x + w + 8, bottom);
  ctx.closePath(); ctx.fill();
  // (the broken edge: light where it's fresh-broken, then the stone)
  ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 2; ctx.stroke();
  // (cracks running off up the wall from it)
  ctx.strokeStyle = 'rgba(12, 10, 9, 0.85)'; ctx.lineWidth = 1.5;
  for (let c = 0; c < 6; c++) {
    let cx = x + rnd(c + 20) * w, cy = y - 10 - rnd(c + 30) * 16;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    const len = (30 + rnd(c + 40) * 70) * Math.min(1, k * 1.5);
    for (let s = 0; s < 4; s++) { cx += (rnd(c * 7 + s) - 0.5) * 18; cy -= len / 4; ctx.lineTo(cx, cy); }
    ctx.stroke();
  }
  // (a chunk hanging off the top of it, about to go)
  ctx.fillStyle = '#57534E';
  ctx.beginPath(); ctx.moveTo(x + w * 0.55, y - 6); ctx.lineTo(x + w * 0.85, y - 4); ctx.lineTo(x + w * 0.7, y + 10 + Math.sin(f * 0.2) * 0.5); ctx.closePath(); ctx.fill();
  // (heaps of it either side, on the floor)
  for (let i = 0; i < 14; i++) {
    const side = i % 2 ? 1 : -1;
    const px = (side < 0 ? x - 4 - rnd(i) * 30 : x + w + 2 + rnd(i) * 34);
    const s = 4 + rnd(i + 50) * 7;
    ctx.fillStyle = ['#57534E', '#78716C', '#44403C', '#A8A29E'][i % 4];
    ctx.fillRect(Math.round(px), Math.round(bottom - s - rnd(i + 9) * 6 * (1 - Math.abs(px - (x + w / 2)) / 50)), Math.round(s * 1.4), Math.round(s));
  }
  ctx.restore();
};

/**
 * The outside of the lair, from the stage's side: what the boss's place is built into, standing up out of the stage
 * and running into the wall with the door in it, so the stage's backdrop goes over into the lair through something
 * that belongs to both rather than stopping dead at a straight wall. Rock (a cliff, a volcano's flank) with a ragged
 * edge that spreads out toward its foot; masonry; or a building, with its cornices, windows and stains. Lit along
 * its outer edge, shadow deepening toward the door, a shadow cast on the backdrop and the ground at its foot.
 */
interface Facade { kind: 'rock' | 'building' | 'masonry'; base: string; light: string; dark: string; accent?: string }
const FACADES: Record<string, Facade> = {
  'Artie Avalanche': { kind: 'rock', base: '#475569', light: '#7A8BA8', dark: '#2B3547', accent: '#E2E8F0' },
  'Victor Volcano': { kind: 'rock', base: '#292524', light: '#44403C', dark: '#140F0D', accent: '#F97316' },
  'Ernie Earthquake': { kind: 'masonry', base: '#6B3F2E', light: '#8A5540', dark: '#3B2218' },
  'Hector Hurricane': { kind: 'building', base: '#8B929C', light: '#B4BAC3', dark: '#5B616B', accent: '#B45309' },
  'Toxic Tommy': { kind: 'masonry', base: '#4A4436', light: '#635B48', dark: '#2A261E', accent: '#65A30D' },
  'Blackout Barry': { kind: 'building', base: '#45454D', light: '#62626B', dark: '#27272A', accent: '#FACC15' },
  'Oily Oscar': { kind: 'building', base: '#5E5954', light: '#7E7872', dark: '#3A3632', accent: '#0C0A09' },
  'Drug Trade Dale': { kind: 'building', base: '#B8966E', light: '#D6BC94', dark: '#8A6E4E', accent: '#16A34A' },
};

export const drawLairFacade = (ctx: Ctx, state: GameState, stageId: string | null) => {
  const door = state.blocks.find(b => b.type === 'door');
  const fc = stageId ? FACADES[stageId] : undefined;
  if (!door || !fc) return;
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: 800, h: 600 };
  if (v.x + v.w < door.x - 260) return;
  const right = door.x + door.w, ground = door.y + door.h;
  const top = Math.min(v.y - 20, ground - 700);
  // How far out from the wall it comes at a height: rock spreads toward its foot, ragged; masonry and buildings step
  const reach = (y: number): number => {
    const d = ground - y;
    if (fc.kind === 'rock') return 54 + Math.max(0, 140 - d) * 0.7 + rnd(Math.floor(y / 18)) * 26 + Math.sin(y * 0.02) * 10;
    if (fc.kind === 'masonry') return 70 + (d < 40 ? 16 : 0) + (Math.floor(y / 120) % 2) * 8;
    return 86 + (d < 30 ? 10 : 0) + ((((y - top) % 160) + 160) % 160 < 14 ? 8 : 0);
  };
  const step = 6;
  ctx.save();
  // (its shadow on the backdrop beside it, a few steps, and on the ground at its foot)
  for (let b = 0; b < 3; b++) {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.05 + b * 0.03})`;
    ctx.beginPath(); ctx.moveTo(right, top);
    for (let y = top; y <= ground; y += step) ctx.lineTo(door.x - reach(y) - (3 - b) * 10, y);
    ctx.lineTo(right, ground); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; ctx.fillRect(door.x - reach(ground - 2) - 44, ground - 4, 50, 4);
  // The mass of it
  const outline = () => {
    ctx.beginPath(); ctx.moveTo(right, top);
    for (let y = top; y <= ground; y += step) ctx.lineTo(Math.round(door.x - reach(y)), y);
    ctx.lineTo(right, ground); ctx.closePath();
  };
  outline(); ctx.fillStyle = fc.base; ctx.fill();
  ctx.save(); outline(); ctx.clip();
  const x0 = door.x - 260;
  if (fc.kind === 'rock') {
    // strata and boulders, lit on top, shadowed under
    for (let y = Math.floor(top / 22) * 22; y < ground; y += 22) {
      for (let x = x0 + ((y / 22) % 2) * 17; x < right; x += 34) {
        const w = 26 + rnd(x * 3 + y) * 12, h = 14 + rnd(x + y * 5) * 6;
        ctx.fillStyle = fc.dark; ctx.fillRect(Math.round(x), y + Math.round(h) - 3, Math.round(w), 3);
        ctx.fillStyle = fc.light; ctx.fillRect(Math.round(x) + 2, y, Math.round(w) - 6, 2);
      }
    }
    if (stageId === 'Victor Volcano') {
      // glowing cracks through it
      ctx.strokeStyle = fc.accent!; ctx.lineWidth = 2; ctx.globalAlpha = 0.6 + Math.sin(state.frame * 0.05) * 0.2;
      for (let c = 0; c < 5; c++) {
        let cx = door.x - 20 - rnd(c) * 60, cy = ground - 40 - c * 90;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        for (let s = 0; s < 4; s++) { cx += (rnd(c * 9 + s) - 0.6) * 22; cy -= 16; ctx.lineTo(cx, cy); }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  } else if (fc.kind === 'masonry') {
    for (let y = Math.floor(top / 12) * 12; y < ground; y += 12) {
      ctx.fillStyle = fc.dark; ctx.fillRect(x0, y + 10, right - x0, 2);
      for (let x = x0 + ((y / 12) % 2) * 12; x < right; x += 24) {
        ctx.fillStyle = fc.dark; ctx.fillRect(x, y, 2, 10);
        ctx.fillStyle = fc.light; ctx.fillRect(x + 3, y + 1, 16, 1);
      }
    }
    if (fc.accent) { ctx.fillStyle = fc.accent; ctx.globalAlpha = 0.55; for (let k = 0; k < 4; k++) ctx.fillRect(door.x - 30 - k * 16, top, 3, ground - top - rnd(k) * 200); ctx.globalAlpha = 1; }
  } else {
    // a building: courses of block, a cornice band every storey, windows (dark, lit, or boarded), stains running down
    for (let y = Math.floor(top / 16) * 16; y < ground; y += 16) { ctx.fillStyle = fc.dark; ctx.fillRect(x0, y + 15, right - x0, 1); }
    for (let y = top; y < ground - 40; y += 160) {
      ctx.fillStyle = fc.light; ctx.fillRect(x0, y, right - x0, 6); ctx.fillStyle = fc.dark; ctx.fillRect(x0, y + 6, right - x0, 3);
      const wx = door.x - 64, wy = y + 40;
      if (wy + 50 < ground - 160) {
        ctx.fillStyle = '#111827'; ctx.fillRect(wx, wy, 30, 46);
        ctx.fillStyle = fc.light; ctx.fillRect(wx - 3, wy + 46, 36, 4);
        if (stageId === 'Hector Hurricane') { ctx.fillStyle = fc.accent!; ctx.save(); ctx.translate(wx + 15, wy + 23); ctx.rotate(0.6); ctx.fillRect(-26, -3, 52, 6); ctx.restore(); }
        else if (stageId === 'Blackout Barry' || stageId === 'Drug Trade Dale') { ctx.fillStyle = 'rgba(253, 224, 71, 0.35)'; ctx.fillRect(wx + 3, wy + 3, 24, 40); }
      }
    }
    // stains running down from the cornices (oil, on Oscar's)
    ctx.fillStyle = stageId === 'Oily Oscar' ? 'rgba(12, 10, 9, 0.7)' : 'rgba(0, 0, 0, 0.12)';
    for (let k = 0; k < 6; k++) ctx.fillRect(door.x - 12 - k * 13, top + (k % 3) * 160 + 9, 3, 30 + rnd(k + 5) * 80);
    if (stageId === 'Blackout Barry') for (let y = ground - 26; y < ground; y += 8) { ctx.fillStyle = (y / 8) % 2 ? fc.accent! : '#111827'; ctx.fillRect(door.x - reach(y), y, reach(y), 4); }
  }
  // (deeper in shadow toward the door: it's set back into it)
  for (let b = 0; b < 4; b++) { ctx.fillStyle = `rgba(0, 0, 0, ${0.06 + b * 0.04})`; ctx.fillRect(door.x - 26 + b * 6, top, 40, ground - top); }
  ctx.restore();
  // Lit along its outer edge; snow along its ledges on Artie's
  ctx.strokeStyle = fc.light; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let y = top; y <= ground; y += step) { const x = Math.round(door.x - reach(y)) + 1; if (y === top) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
  ctx.stroke();
  if (stageId === 'Artie Avalanche') {
    ctx.fillStyle = fc.accent!;
    for (let y = top + 30; y < ground - 20; y += 44) { const x = door.x - reach(y); ctx.fillRect(Math.round(x) - 2, y, Math.round(18 + rnd(y) * 12), 4); ctx.fillRect(Math.round(x) + 2, y - 2, 10, 2); }
  }
  ctx.restore();
};

/** The door, standing; going over into the room; or down flat on the floor in there. */
export const drawBossDoor = (ctx: Ctx, state: GameState, stageId: string | null) => {
  const door = state.blocks.find(b => b.type === 'door');
  if (!door) return;
  const face = (stageId && FACES[stageId]) || plainFace;
  const f = state.frame;
  const k = Math.max(0, Math.min(1, state.doorOpenAmount / 150));
  const kicked = state.doorKick?.hitAt !== undefined || state.doorState === 'done' || state.doorState === 'open';
  const fall = kicked ? (state.doorState === 'done' || state.doorState === 'open' ? 1 : k) : 0;
  if (fall === 0) {
    drawLintel(ctx, stageId, door.x, door.y, door.w, f);
    // (a shudder as the boot goes in)
    ctx.save(); ctx.translate(door.x, door.y);
    face(ctx, door.w, door.h, f);
    ctx.restore();
    return;
  }
  drawBrokenFrame(ctx, door.x, door.y, door.w, door.h, f, fall);
  // Over it goes, about its bottom edge on the room side, faster as it goes; flat, it's a slab on the floor
  const ang = (Math.PI / 2) * fall * fall;
  ctx.save();
  ctx.translate(door.x + door.w, GROUND_Y);
  ctx.rotate(ang);
  // (seen tipping away from you: thinner the further over it is)
  ctx.scale(1 - 0.7 * fall, 1);
  ctx.translate(-door.w, -door.h);
  face(ctx, door.w, door.h, f);
  ctx.fillStyle = `rgba(0, 0, 0, ${0.35 * fall})`; ctx.fillRect(0, 0, door.w, door.h);
  ctx.restore();
};
