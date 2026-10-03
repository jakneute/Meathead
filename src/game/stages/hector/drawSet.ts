// Drawing for Hector's set pieces: the old fisherman and the boat, the
// waterspout, the junk whirling up the storm tower, the Eye's arena, and the
// daycare (before and after the flood).

import { deadCoastie, coastieAssUp, drawSeatedMeathead, drawWreck, drawCutterWreck } from './chaseDraw';
import { WRECK_BLAST } from './chase';
import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { COURSE } from './course';
import type { Boat } from './boat';
import { BOAT_WIDTH } from './boat';
import type { TowerRun } from './tower';
import { TOWER } from './tower';
import type { EyeFight } from './eye';
import { EYE_WEAR_FALL } from './eye';
import type { Daycare } from './daycare';
import { drawEyeCorpse } from './eyeDraw';
import { drawKindEnemy } from '../../render/enemies';
import { sentenceShown } from '../../platform/speech';
import { DAYCARE_LINES } from '../../../content/dialogue';
import { bandedGradient, checker, hazeBands, pixelBlob } from '../../render/pixelArt';
import { drawPerson } from '../../render/npc/person';
import { INK, dark, lite, ink } from '../../render/npc/kit';
import { drawBloodPool } from '../../render/spatter';

type Ctx = CanvasRenderingContext2D;

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 250 && x1 < state.camera.x + CANVAS_WIDTH + 250;

/** A block lit from the upper left: a light top and left edge, a dark right and bottom, inked round. */
const slab = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string, e = 2) => {
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(c, 0.3); ctx.fillRect(x, y, w, e); ctx.fillRect(x, y, e, h);
  ctx.fillStyle = dark(c, 0.25); ctx.fillRect(x + w - e, y, e, h); ctx.fillRect(x, y + h - e, w, e);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
};

const bubble = (ctx: Ctx, x: number, y: number, said: string) => {
  const text = sentenceShown(said);
  ctx.font = 'bold 8px "Press Start 2P"';
  const w = ctx.measureText(text).width + 14;
  ctx.fillStyle = '#F8FAFC'; ctx.strokeStyle = '#111827'; ctx.lineWidth = 2;
  ctx.fillRect(x - w / 2, y - 22, w, 20); ctx.strokeRect(x - w / 2, y - 22, w, 20);
  ctx.beginPath(); ctx.moveTo(x - 5, y - 2); ctx.lineTo(x + 5, y - 2); ctx.lineTo(x, y + 6); ctx.fillStyle = '#F8FAFC'; ctx.fill();
  ctx.fillStyle = '#111827'; ctx.textAlign = 'center'; ctx.fillText(text, x, y - 8); ctx.textAlign = 'left';
};

// ---------------------------------------------------------------------------
// The fisherman, the boat, the spout
// ---------------------------------------------------------------------------

export const drawBoatScene = (ctx: Ctx, state: GameState, b: Boat) => {
  if (b.phase === 'gone' && !visible(state, COURSE.sea.spoutX - 300, COURSE.sea.spoutX + 300)) return;
  // The old man
  const m = b.oldMan;
  if (visible(state, m.x - 60, m.x + 60)) {
    ctx.save();
    ctx.translate(m.x, m.y);
    if (m.state === 'flying') ctx.rotate(m.rot);
    if (m.state === 'fishing') {
      // Sat on a bucket, rod out over the water, bucket hat, the white beard, his vest of lures
      ink(ctx, () => ctx.roundRect(-11, -20, 22, 20, 2), '#6B7280', 1); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-9, -18, 5, 16); ctx.fillStyle = '#4B5563'; ctx.fillRect(-11, -14, 22, 2);
      drawPerson(ctx, -4, 6, {
        skin: '#F2C9A0', hair: { style: 'short', color: '#E5E7EB' }, top: { style: 'vest', color: '#FDE68A', accent: '#65A30D' }, legs: { color: '#1E3A8A', style: 'shorts' }, shoes: '#78350F',
        hat: { style: 'bucket', color: '#A16207' }, face: 'beard', faceHair: '#E5E7EB',
        extra: c => { for (let k = 0; k < 3; k++) { c.fillStyle = ['#EF4444', '#FACC15', '#3B82F6'][k]; c.fillRect(-6 + k * 4, -46, 2, 3); } },
      }, { seated: true, arms: 'hold', mouth: 'flat', f: state.frame, prop: (c, hx, hy) => { c.strokeStyle = '#1A0B06'; c.lineWidth = 3; c.beginPath(); c.moveTo(hx - 4, hy + 4); c.lineTo(hx + 60, hy - 46); c.stroke(); c.strokeStyle = '#92400E'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(hx - 4, hy + 4); c.lineTo(hx + 60, hy - 46); c.stroke(); c.fillStyle = '#374151'; c.fillRect(hx - 2, hy - 2, 5, 5); } });
      ctx.strokeStyle = 'rgba(229, 231, 235, 0.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(70, -90); ctx.lineTo(90, COURSE.sea.y - m.y); ctx.stroke();
    } else {
      // In the water: head, hat and rod bobbing (or cartwheeling through the air)
      drawPerson(ctx, 0, 34, {
        skin: '#F2C9A0', hair: { style: 'short', color: '#E5E7EB' }, top: { style: 'vest', color: '#FDE68A', accent: '#65A30D' }, legs: { color: '#1E3A8A', style: 'shorts' }, shoes: '#78350F',
        hat: { style: 'bucket', color: '#A16207' }, face: 'beard', faceHair: '#E5E7EB',
      }, { arms: 'up', mouth: 'o', f: state.frame });
    }
    ctx.restore();
    if (m.lineT > 0) bubble(ctx, m.x, m.y - (m.state === 'fishing' ? 84 : 52), m.line);
  }
  // The waterspout: a twisting grey column from the sea up into the clouds
  const sx = COURSE.sea.spoutX;
  if (visible(state, sx - 200, sx + 200) && b.phase !== 'waiting' && b.phase !== 'cutscene') {
    const f = state.frame;
    const top = state.camera.y - 50, bottom = COURSE.sea.y;
    // (in rows: each lit down its left, shaded down its right, a streak of spray winding up it)
    for (let y = bottom; y > top; y -= 12) {
      const k = (bottom - y) / (bottom - top);
      const w = Math.round(40 + k * 160);
      const left = Math.round(sx - w / 2 + Math.sin(y * 0.02 + f * 0.1) * (10 + k * 30));
      const a = (0.55 - k * 0.2).toFixed(3);
      ctx.fillStyle = `rgba(${Math.round(120 + k * 40)}, ${Math.round(135 + k * 40)}, ${Math.round(160 + k * 30)}, ${a})`; ctx.fillRect(left, y - 12, w, 13);
      ctx.fillStyle = `rgba(203, 213, 225, ${a})`; ctx.fillRect(left, y - 12, Math.round(w * 0.18), 13);
      ctx.fillStyle = `rgba(30, 41, 59, ${a})`; ctx.fillRect(left + Math.round(w * 0.8), y - 12, Math.round(w * 0.2), 13);
      ctx.fillStyle = 'rgba(226, 232, 240, 0.4)'; ctx.fillRect(left + ((f * 4 + y) % w), y - 12, 6, 13);
      ctx.fillStyle = 'rgba(248, 250, 252, 0.5)'; ctx.fillRect(left + ((f * 4 + y) % w) + 1, y - 12, 2, 13);
    }
    for (let i = 0; i < 12; i++) { const a = f * 0.2 + i; pixelBlob(ctx, sx + Math.cos(a) * 70, bottom - 6 + Math.sin(a) * 6, 9, 6, i % 3 ? 'rgba(224, 242, 254, 0.6)' : 'rgba(255, 255, 255, 0.8)'); }
  }
  // The boat's deck and outboard (the hull's in front of him)
  // (wrecked: it's in bits)
  if (b.chase?.wreckT) drawWreck(ctx, state, b.chase, b.x, b.y);
  if (b.phase !== 'gone' && !(b.chase && b.chase.wreckT >= WRECK_BLAST) && visible(state, b.x - 20, b.x + BOAT_WIDTH + 20)) {
    ctx.save();
    ctx.translate(b.x, b.y);
    if (b.phase === 'spout') ctx.rotate(Math.sin(b.spin) * 0.3);
    // (the bench seat; the outboard: its cowling with a stripe, the leg down into the water, a prop that spits)
    slab(ctx, 4, -20, BOAT_WIDTH - 8, 6, '#9CA3AF', 1);
    ink(ctx, () => ctx.rect(-10, -4, 6, 18), '#6B7280'); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-9, -4, 1, 18);
    slab(ctx, -14, -30, 16, 26, '#374151', 2);
    ctx.fillStyle = '#DC2626'; ctx.fillRect(-13, -20, 14, 3); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-11, -26, 6, 2);
    ctx.fillStyle = '#6B7280';
    if (b.phase === 'riding' && state.frame % 2 === 0) { ctx.fillRect(-18, 12, 4, 4); ctx.fillStyle = '#E0F2FE'; ctx.fillRect(-22, 10, 2, 2); }
    ctx.restore();
    // (out on the water with the Coast Guard after him: him sat at the motor)
    if (b.phase === 'riding' && b.chase && !b.chase.caughtT && !b.chase.wreckT) drawSeatedMeathead(ctx, b.x + 30, b.y - 22, state.frame, b.chase.crash > 0);
  }
};

/** The boat's hull, in front of him (so he's sitting in it). */
export const drawBoatFront = (ctx: Ctx, state: GameState, b: Boat) => {
  if (b.phase === 'gone' || (b.chase && b.chase.wreckT >= WRECK_BLAST) || !visible(state, b.x - 20, b.x + BOAT_WIDTH + 20)) return;
  ctx.save();
  ctx.translate(b.x, b.y);
  if (b.phase === 'spout') ctx.rotate(Math.sin(b.spin) * 0.3);
  // (white, a gray belly, a shade toward the stern, the red stripe, a rub rail; inked; the name in hand-done letters)
  const hull = () => { ctx.moveTo(0, -22); ctx.lineTo(BOAT_WIDTH + 18, -26); ctx.lineTo(BOAT_WIDTH - 10, 8); ctx.lineTo(10, 8); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); hull(); ctx.clip();
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-2, -28, BOAT_WIDTH + 22, 38);
  ctx.fillStyle = '#CBD5E1'; ctx.fillRect(-2, 0, BOAT_WIDTH + 22, 10); checker(ctx, -2, -2, BOAT_WIDTH + 22, 2, '#CBD5E1');
  ctx.fillStyle = 'rgba(26, 11, 6, 0.1)'; ctx.fillRect(-2, -28, 16, 38);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(4, -8, BOAT_WIDTH, 4); ctx.fillStyle = '#F87171'; ctx.fillRect(4, -8, BOAT_WIDTH, 1);
  ctx.restore();
  ctx.beginPath(); hull(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(1, -21); ctx.lineTo(BOAT_WIDTH + 16, -25); ctx.stroke();
  ctx.font = 'bold 7px "Press Start 2P"';
  ctx.fillStyle = '#CBD5E1'; ctx.fillText('LIL BASS', 31, -11);
  ctx.fillStyle = '#111827'; ctx.fillText('LIL BASS', 30, -12);
  ctx.restore();
};

/** The pool's water, over the sunken bit of the Pink Flamingo's lot. */
export const drawPoolWater = (ctx: Ctx, state: GameState) => {
  for (const r of state.groundRuns) {
    if (r.surface !== 'pool' || !visible(state, r.x1, r.x2)) continue;
    const top = 560;
    // (deepening in steps, the light on the bottom wobbling, a stepped skin along the top)
    hazeBands(ctx, r.x1, top, r.x2 - r.x1, r.y1 - top, '#38BDF8', 0.5, 0.7, 4);
    ctx.fillStyle = 'rgba(224, 242, 254, 0.45)';
    for (let x = Math.ceil(r.x1 / 24) * 24; x < r.x2 - 10; x += 24) for (let y = top + 10; y < r.y1 - 4; y += 14) {
      const dx = Math.round(Math.sin(y * 0.3 + x * 0.1 + state.frame * 0.08) * 4);
      ctx.fillRect(x + dx, y, 8, 1); ctx.fillRect(x + dx + 8, y + 1, 4, 1);
    }
    for (let x = r.x1; x < r.x2; x += 4) {
      const y = Math.round(top + Math.sin(x * 0.08 + state.frame * 0.12) * 2);
      ctx.fillStyle = 'rgba(125, 211, 252, 0.8)'; ctx.fillRect(x, y + 2, 4, 1);
      ctx.fillStyle = 'rgba(240, 249, 255, 0.95)'; ctx.fillRect(x, y, 4, 2);
    }
  }
};

// ---------------------------------------------------------------------------
// The storm tower
// ---------------------------------------------------------------------------

/** What's whirling up the storm: each piece of junk, all three copies of it near the view. */
export const drawTowerJunk = (ctx: Ctx, state: GameState, tr: TowerRun) => {
  TOWER.plats.forEach((p, i) => {
    for (const b of tr.copies[i]) {
      if (b.x + b.w < state.camera.x - 700 || b.x > state.camera.x + CANVAS_WIDTH + 700) continue;
      if (b.y < state.camera.y - 100 || b.y > state.camera.y + CANVAS_HEIGHT + 100) continue;
      const bob = Math.sin(state.frame * 0.05 + i) * 1.5;
      drawJunk(ctx, b.x, b.y + bob, b.w, p.look, state.frame, i);
    }
  });
};

/** The billboards the storm tore down: every one a different slice of Miami. [text, board, lettering] */
const BILLBOARDS: [string, string, string][] = [
  ['2-4-1 MOJITOS', '#F472B6', '#FEF08A'], ['BAIL BONDS 24/7', '#FACC15', '#111827'], ['CONDOS FROM $9M', '#22D3EE', '#831843'],
  ['GATOR TOURS!', '#65A30D', '#FEF9C3'], ['BOTOX WALK-INS', '#F9A8D4', '#1E3A8A'], ['CUBAN COFFEE', '#7C2D12', '#FDE68A'],
  ['TAN IN 15 MIN', '#FB923C', '#FFFFFF'], ['LADIES NITE', '#A855F7', '#5EEAD4'], ['PAWN & GOLD', '#111827', '#FACC15'],
  ['JET SKI RENTAL', '#0EA5E9', '#FFFFFF'], ['PALM READING', '#DB2777', '#FFFFFF'], ['HURRICANE SALE', '#DC2626', '#FEF08A'],
];

export const drawJunk = (ctx: Ctx, x: number, y: number, w: number, look: string, f: number, variant = 0) => {
  switch (look) {
    case 'door':
      // A front door, ripped off its hinges: panels, a brass knob, the hinges still on it
      slab(ctx, x, y, w, 16, '#92400E', 2);
      ctx.strokeStyle = '#5B2A0A'; ctx.lineWidth = 1;
      ctx.strokeRect(x + 6.5, y + 4.5, w * 0.4 - 6, 7); ctx.strokeRect(x + w * 0.45 + 0.5, y + 4.5, w * 0.4 - 20, 7);
      ctx.fillStyle = '#B45309'; ctx.fillRect(x + 7, y + 5, w * 0.4 - 7, 1); ctx.fillRect(x + w * 0.45 + 1, y + 5, w * 0.4 - 21, 1);
      ink(ctx, () => ctx.rect(x + w - 16, y + 5, 5, 5), '#FACC15'); ctx.fillStyle = '#FEF9C3'; ctx.fillRect(x + w - 15, y + 6, 1, 1);
      ctx.fillStyle = '#6B7280'; ctx.fillRect(x + 2, y + 3, 3, 3); ctx.fillRect(x + 2, y + 10, 3, 3);
      break;
    case 'carroof':
      // The roof torn off a car: the paint lit along its top, inked, the glass still in it with a glint, a dent
      ink(ctx, () => { ctx.moveTo(x, y + 16); ctx.lineTo(x + 12, y); ctx.lineTo(x + w - 12, y); ctx.lineTo(x + w, y + 16); ctx.closePath(); }, '#2563EB');
      ctx.fillStyle = '#60A5FA'; ctx.fillRect(x + 12, y + 1, w - 24, 2);
      ctx.fillStyle = '#1E40AF'; ctx.fillRect(x + 2, y + 13, w - 4, 2);
      ctx.fillStyle = '#1E3A5F'; ctx.fillRect(x + 16, y + 4, w - 32, 8);
      ctx.fillStyle = '#93C5FD'; ctx.fillRect(x + 16, y + 4, w - 32, 4);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; ctx.fillRect(x + 22, y + 4, 3, 8); ctx.fillRect(x + 28, y + 4, 1, 8);
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 16.5, y + 4.5, w - 33, 7);
      ctx.fillStyle = '#1E40AF'; ctx.fillRect(x + w - 30, y + 2, 6, 1);
      break;
    case 'shed':
      // A shed's roof: corrugated green tin, inked, rust coming through at the eave
      ink(ctx, () => { ctx.moveTo(x, y + 18); ctx.lineTo(x + w / 2, y - 6); ctx.lineTo(x + w, y + 18); ctx.closePath(); }, '#65A30D');
      ctx.save(); ctx.beginPath(); ctx.moveTo(x, y + 18); ctx.lineTo(x + w / 2, y - 6); ctx.lineTo(x + w, y + 18); ctx.closePath(); ctx.clip();
      for (let cx = x + 2; cx < x + w; cx += 6) { ctx.fillStyle = '#84CC16'; ctx.fillRect(cx, y - 6, 2, 26); ctx.fillStyle = '#3F6212'; ctx.fillRect(cx + 4, y - 6, 1, 26); }
      ctx.fillStyle = 'rgba(26, 11, 6, 0.18)'; ctx.fillRect(x + w / 2, y - 6, w / 2, 26);
      ctx.restore();
      slab(ctx, x, y + 14, w, 6, '#4D7C0F', 1);
      ctx.fillStyle = '#B45309'; for (let k = 0; k < 4; k++) ctx.fillRect(x + 8 + hash(k + w) * (w - 16), y + 16, 3, 2);
      break;
    case 'billboard':
    {
      const [text, board, lettering] = BILLBOARDS[variant % BILLBOARDS.length];
      // (the board, lit and inked, a steel frame round it, a corner torn off where it came down)
      slab(ctx, x, y, w, 20, board, 2);
      ctx.fillStyle = dark(board, 0.35); ctx.fillRect(x + 3, y + 3, w - 6, 1);
      // Chasing bulbs round the edge (the tackier the better)
      for (let bx = x + 4; bx < x + w - 2; bx += 8) {
        const lit = Math.floor((bx - x) / 8 + f / 6) % 2;
        ctx.fillStyle = lit ? '#FEF9C3' : '#78350F';
        ctx.fillRect(bx, y + 1, 3, 2); ctx.fillRect(bx, y + 17, 3, 2);
        if (lit) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(bx, y + 1, 1, 1); ctx.fillRect(bx, y + 17, 1, 1); }
      }
      ctx.save();
      ctx.font = 'bold 7px "Press Start 2P"';
      const tw = ctx.measureText(text).width, room = w - 8;
      ctx.translate(x + w / 2, y + 13);
      if (tw > room) ctx.scale(room / tw, 1);
      ctx.textAlign = 'center';
      ctx.fillStyle = dark(board, 0.45); ctx.fillText(text, 1, 1);
      ctx.fillStyle = lettering; ctx.fillText(text, 0, 0);
      ctx.restore();
      ink(ctx, () => { ctx.moveTo(x + w - 10, y + 20); ctx.lineTo(x + w, y + 12); ctx.lineTo(x + w, y + 20); ctx.closePath(); }, '#4B5563');
      break;
    }
    case 'sofa':
      // A loveseat: velour, inked, the arms and back lit along the top, seams and buttons
      slab(ctx, x, y - 12, 12, 26, '#9D174D', 2); slab(ctx, x + w - 12, y - 12, 12, 26, '#9D174D', 2);
      slab(ctx, x + 12, y, w - 24, 14, '#9D174D', 2);
      slab(ctx, x + 12, y - 4, w - 24, 6, '#BE185D', 1);
      ctx.fillStyle = '#831843'; ctx.fillRect(x + w / 2, y - 3, 1, 4);
      ctx.fillStyle = '#F9A8D4'; for (let k = 0; k < 3; k++) ctx.fillRect(x + 18 + k * (w - 36) / 2, y + 6, 2, 2);
      ctx.fillStyle = '#3B0A20'; ctx.fillRect(x + 4, y + 14, 3, 3); ctx.fillRect(x + w - 7, y + 14, 3, 3);
      break;
    case 'fridge':
      // A fridge on its back: white enamel, inked, the door seam, a chrome handle, magnets
      slab(ctx, x, y, w, 20, '#E5E7EB', 2);
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x + w * 0.35, y + 2, 1, 16);
      ink(ctx, () => ctx.rect(x + w * 0.6, y + 2, 3, 16), '#D1D5DB'); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + w * 0.6, y + 3, 1, 14);
      ctx.fillStyle = '#EF4444'; ctx.fillRect(x + 8, y + 5, 3, 3); ctx.fillStyle = '#FACC15'; ctx.fillRect(x + 16, y + 11, 4, 3); ctx.fillStyle = '#3B82F6'; ctx.fillRect(x + w * 0.7, y + 6, 3, 3);
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + w * 0.42, y + 4, 8, 10); ctx.fillStyle = '#94A3B8'; ctx.fillRect(x + w * 0.42 + 1, y + 6, 6, 1); ctx.fillRect(x + w * 0.42 + 1, y + 9, 5, 1);
      break;
    case 'hull': {
      // A boat's hull, upside down: white, inked, shaded under, the red stripe, a cleat
      const hull = () => { ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - 14, y + 18); ctx.lineTo(x + 10, y + 18); ctx.closePath(); };
      ctx.save(); ctx.beginPath(); hull(); ctx.clip();
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x, y, w, 18);
      ctx.fillStyle = '#CBD5E1'; ctx.fillRect(x, y + 12, w, 6);
      ctx.fillStyle = '#DC2626'; ctx.fillRect(x + 6, y + 6, w - 12, 3); ctx.fillStyle = '#F87171'; ctx.fillRect(x + 6, y + 6, w - 12, 1);
      ctx.restore();
      ctx.beginPath(); hull(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 2, y + 1, w - 4, 1);
      ink(ctx, () => ctx.rect(x + w / 2 - 5, y + 13, 10, 2), '#9CA3AF');
      break;
    }
    case 'lift': {
      // The way up into the Eye: a lifeguard stand's deck torn off whole (striped rail, a red cross, its flag), the
      // updraft roaring up from it in a column of wind and sparkle, an arrow on a board saying so. Plain to see from below.
      const cx = x + w / 2, top = y - 900;
      ctx.save();
      const col = ctx.createLinearGradient(0, top, 0, y);
      col.addColorStop(0, 'rgba(224, 242, 254, 0)'); col.addColorStop(1, 'rgba(186, 230, 253, 0.35)');
      ctx.fillStyle = col; ctx.fillRect(x + 10, top, w - 20, y - top);
      for (let k = 0; k < 14; k++) {
        const q = ((f * (3 + (k % 3)) + k * 67) % 900) / 900;
        const sx = x + 16 + ((k * 41) % (w - 32)) + Math.sin(q * 12 + k) * 8, sy = y - 10 - q * 900;
        ctx.fillStyle = k % 3 ? `rgba(255, 255, 255, ${(0.7 * (1 - q)).toFixed(3)})` : `rgba(254, 240, 138, ${(0.9 * (1 - q)).toFixed(3)})`;
        ctx.fillRect(Math.floor(sx), Math.floor(sy), 2, k % 3 ? 14 : 3);
      }
      ctx.restore();
      // (the deck: planks, the striped rail, posts)
      ctx.fillStyle = '#92400E'; ctx.fillRect(x, y, w, 14); ctx.fillStyle = '#B45309'; for (let px = x; px < x + w; px += 18) ctx.fillRect(px, y, 16, 3);
      ctx.fillStyle = '#78350F'; ctx.fillRect(x, y + 11, w, 3);
      for (let px = x + 4; px < x + w; px += 32) { ctx.fillStyle = '#F8FAFC'; ctx.fillRect(px, y - 26, 4, 26); }
      for (let k = 0; k < Math.floor(w / 16); k++) { ctx.fillStyle = k % 2 ? '#EF4444' : '#F8FAFC'; ctx.fillRect(x + k * 16, y - 26, 16, 5); }
      ctx.fillStyle = '#EF4444'; ctx.fillRect(x + w - 30, y - 22, 4, 12); ctx.fillRect(x + w - 34, y - 18, 12, 4);
      // (its flag, whipping)
      ctx.fillStyle = '#78716C'; ctx.fillRect(x + 6, y - 60, 3, 34);
      ctx.fillStyle = '#EF4444'; ctx.beginPath(); ctx.moveTo(x + 9, y - 60); ctx.lineTo(x + 34 + Math.sin(f * 0.5) * 4, y - 54); ctx.lineTo(x + 9, y - 48); ctx.fill();
      // (the board with the arrow)
      ctx.fillStyle = '#FDE68A'; ctx.fillRect(cx - 22, y - 58, 44, 22); ctx.strokeStyle = '#78350F'; ctx.lineWidth = 2; ctx.strokeRect(cx - 22, y - 58, 44, 22);
      const bob = Math.sin(f * 0.2) * 2;
      ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.moveTo(cx, y - 56 + bob); ctx.lineTo(cx + 9, y - 46 + bob); ctx.lineTo(cx + 4, y - 46 + bob); ctx.lineTo(cx + 4, y - 39 + bob); ctx.lineTo(cx - 4, y - 39 + bob); ctx.lineTo(cx - 4, y - 46 + bob); ctx.lineTo(cx - 9, y - 46 + bob); ctx.fill();
      ctx.fillStyle = '#78716C'; ctx.fillRect(cx - 2, y - 36, 4, 10);
      break;
    }
    case 'trampoline': {
      // Springy: it's for bouncing (a black mat on a padded blue frame, the springs, an arrow saying so)
      ink(ctx, () => ctx.rect(x, y + 2, w, 6), '#111827'); ctx.fillStyle = '#374151'; ctx.fillRect(x + 1, y + 3, w - 2, 1);
      slab(ctx, x - 4, y, 8, 12, '#3B82F6', 1); slab(ctx, x + w - 4, y, 8, 12, '#3B82F6', 1);
      for (let k = 0; k < 4; k++) {
        const sx = x + 10 + k * (w - 20) / 3;
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, y + 8); ctx.lineTo(sx, y + 20); ctx.stroke();
        ctx.fillStyle = '#CBD5E1'; for (let c = y + 9; c < y + 20; c += 3) ctx.fillRect(sx - 2, c, 3, 1);
      }
      if (Math.floor(f / 20) % 2 === 0) ink(ctx, () => { ctx.moveTo(x + w / 2, y - 30); ctx.lineTo(x + w / 2 - 9, y - 18); ctx.lineTo(x + w / 2 + 9, y - 18); ctx.closePath(); }, '#FDE047');
      break;
    }
    default: // a plank
      slab(ctx, x, y, w, 12, '#A16207', 2);
      ctx.fillStyle = '#854D0E'; ctx.fillRect(x + 2, y + 8, w - 4, 2);
      ctx.fillStyle = '#7C4A0E'; for (let k = 0; k < 3; k++) ctx.fillRect(x + 10 + hash(k + w) * (w - 30), y + 4 + k % 2 * 2, 14, 1);
      ink(ctx, () => { ctx.rect(x + 6, y + 4, 3, 3); ctx.rect(x + w - 10, y + 4, 3, 3); }, '#6B7280');
  }
};

/**
 * The sharks circling in the storm, drawn flat over the wrapped tower. Where one is
 * round the cylinder says how it's drawn: dead ahead it's full size, toward the
 * edges it shrinks and fades as it swims away round the side, and round the back
 * of the storm it's out of sight altogether.
 */
export const drawSharksRound = (ctx: Ctx, state: GameState, radius: number, around: (x: number) => number) => {
  for (const e of state.enemies) {
    if (e.kind !== 'shark' || (e.health <= 0 && !e.isBlownAway)) continue;
    const a = around(e.pos.x + e.width / 2);
    const facing = Math.cos(a);
    if (facing <= 0.05) continue;
    const sx = CANVAS_WIDTH / 2 + Math.sin(a) * radius, sy = e.pos.y + e.height / 2 - state.camera.y;
    const k = 0.7 + 0.3 * facing;
    ctx.save();
    ctx.globalAlpha = Math.min(1, facing * 3);
    ctx.translate(sx, sy);
    if (e.isBlownAway) ctx.rotate(e.rotation || 0);
    ctx.scale(k, k);
    ctx.translate(-(e.pos.x + e.width / 2), -(e.pos.y + e.height / 2));
    drawKindEnemy(ctx, e, state);
    ctx.restore();
  }
};

// ---------------------------------------------------------------------------
// The Eye's arena: the junk you stand on (shaking, falling, drifting back in)
// ---------------------------------------------------------------------------

const EYE_JUNK = ['plank', 'door', 'carroof', 'hull', 'billboard'];

export const drawEyeArena = (ctx: Ctx, state: GameState, f: EyeFight) => {
  f.plats.forEach((p, i) => {
    if (p.state === 'gone') return;
    const b = p.block;
    drawJunk(ctx, b.x, b.y, b.w, EYE_JUNK[i % EYE_JUNK.length], state.frame, i + 3);
    // The wear it's taken shows, and stays: a crack for every bit of it, spreading across the piece
    const cracks = Math.min(5, Math.floor((p.wear / EYE_WEAR_FALL) * 6));
    if (cracks > 0) {
      ctx.strokeStyle = 'rgba(17, 24, 39, 0.85)'; ctx.lineWidth = 1.5;
      for (let k = 0; k < cracks; k++) {
        const x0 = b.x + b.w * (0.12 + hash(i * 7 + k) * 0.76);
        ctx.beginPath(); ctx.moveTo(x0, b.y); ctx.lineTo(x0 + (hash(i + k * 3) - 0.5) * 10, b.y + 6); ctx.lineTo(x0 + (hash(i * 3 + k) - 0.5) * 14, b.y + 13); ctx.stroke();
      }
    }
    if (p.state === 'shake') {
      // Cracking, bits falling off
      ctx.strokeStyle = '#111827'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(b.x + b.w * 0.4, b.y); ctx.lineTo(b.x + b.w * 0.5, b.y + 8); ctx.lineTo(b.x + b.w * 0.45, b.y + 14); ctx.stroke();
      if (p.under && state.frame % 4 === 0) { ctx.fillStyle = '#78350F'; ctx.fillRect(b.x + hash(state.frame) * b.w, b.y + 16 + (state.frame % 12), 4, 4); }
    }
  });
  if (f.corpse) drawEyeCorpse(ctx, state, f.corpse.weapon, f.corpse.t0);
  // What the storm's flinging at him: a flashing warning at the screen edge, then the thing itself
  for (const j of f.junk) {
    if (j.warn > 0) {
      if (Math.floor(j.warn / 5) % 2) continue;
      const ex = j.side < 0 ? state.camera.x + 26 : state.camera.x + CANVAS_WIDTH - 26;
      ctx.save();
      ctx.fillStyle = '#DC2626'; ctx.strokeStyle = '#FEF08A'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(ex, j.y, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#FEF08A'; ctx.font = 'bold 18px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('!', ex + 1, j.y + 2);
      // (and an arrow the way it'll come)
      ctx.beginPath(); ctx.moveTo(ex - j.side * 26, j.y); ctx.lineTo(ex - j.side * 36, j.y - 8); ctx.lineTo(ex - j.side * 36, j.y + 8); ctx.fill();
      ctx.restore();
      continue;
    }
    ctx.save(); ctx.translate(j.x, j.y); ctx.rotate(j.rot); ctx.scale(j.size, j.size);
    drawFlyingJunk(ctx, j.look);
    ctx.restore();
  }
};

/** One piece of flying junk, centred on the origin (about 44x36). */
const drawFlyingJunk = (ctx: Ctx, look: string) => {
  switch (look) {
    case 'chair': // a folding lawn chair: aluminum tubes, green and white webbing
      ink(ctx, () => { ctx.rect(-18, -2, 36, 4); ctx.rect(-18, -18, 4, 20); ctx.rect(14, -2, 4, 18); }, '#D1D5DB');
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-17, -17, 1, 18); ctx.fillRect(-17, -1, 34, 1);
      for (let k = 0; k < 4; k++) { ctx.fillStyle = k % 2 ? '#F8FAFC' : '#10B981'; ctx.fillRect(-14, -16 + k * 5, 28, 3); ctx.fillStyle = k % 2 ? '#CBD5E1' : '#047857'; ctx.fillRect(-14, -14 + k * 5, 28, 1); }
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(-14.5, -16.5, 29, 19);
      break;
    case 'flamingo': // a plastic lawn flamingo: pink, inked, a darker wing, the black-tipped beak, its wire legs
      ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-2, 8); ctx.lineTo(-2, 20); ctx.moveTo(3, 8); ctx.lineTo(5, 20); ctx.stroke();
      ink(ctx, () => ctx.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2), '#F472B6');
      ink(ctx, () => ctx.ellipse(-3, 0, 8, 5, -0.2, 0, Math.PI * 2), '#DB2777');
      ctx.fillStyle = '#FBCFE8'; ctx.fillRect(-8, -7, 8, 2);
      ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(10, -2); ctx.quadraticCurveTo(15, -10, 12, -20); ctx.stroke();
      ctx.strokeStyle = '#F472B6'; ctx.lineWidth = 4; ctx.stroke();
      ink(ctx, () => ctx.arc(14, -20, 5, 0, Math.PI * 2), '#F472B6');
      ink(ctx, () => { ctx.moveTo(18, -22); ctx.lineTo(24, -20); ctx.lineTo(21, -16); ctx.lineTo(18, -18); ctx.closePath(); }, '#FBCFE8');
      ctx.fillStyle = '#111827'; ctx.fillRect(21, -19, 3, 3); ctx.fillRect(14, -22, 2, 2);
      break;
    case 'cart': // a shopping cart: the wire basket, its red handle, the casters
      ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(-18, -14, 34, 20);
      ctx.strokeStyle = '#CBD5E1'; ctx.lineWidth = 1.5; ctx.strokeRect(-18, -14, 34, 20);
      ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 1; ctx.beginPath();
      for (let k = -12; k < 16; k += 6) { ctx.moveTo(k + 0.5, -14); ctx.lineTo(k + 0.5, 6); }
      ctx.moveTo(-18, -4.5); ctx.lineTo(16, -4.5); ctx.stroke();
      ink(ctx, () => ctx.rect(14, -20, 8, 4), '#DC2626');
      ink(ctx, () => ctx.rect(-16, 6, 30, 2), '#9CA3AF');
      for (const wx of [-12, 10]) { ink(ctx, () => ctx.arc(wx, 12, 4, 0, Math.PI * 2), '#1F2937'); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(wx - 1, 11, 2, 2); }
      break;
    case 'sign': { // a stop sign on a bit of pole: the white rim, the bolts, the pole snapped
      ink(ctx, () => ctx.rect(-2, 6, 4, 14), '#9CA3AF'); ctx.fillStyle = '#D1D5DB'; ctx.fillRect(-1, 6, 1, 14);
      const oct = (r: number) => { for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + Math.PI / 8; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r - 4); } ctx.closePath(); };
      ink(ctx, () => oct(15), '#F8FAFC');
      ctx.beginPath(); oct(13); ctx.fillStyle = '#DC2626'; ctx.fill();
      ctx.fillStyle = '#EF4444'; ctx.fillRect(-8, -14, 10, 2);
      ctx.fillStyle = '#991B1B'; ctx.fillRect(-4, 6, 10, 1);
      ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('STOP', 0, -2);
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-1, -15, 2, 2); ctx.fillRect(-1, 5, 2, 2);
      break;
    }
    case 'tire': // a tire: tread blocks, the rim, its lug nuts
      ink(ctx, () => ctx.arc(0, 0, 16, 0, Math.PI * 2), '#1F2937');
      ctx.fillStyle = '#111827'; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; ctx.fillRect(Math.round(Math.cos(a) * 14) - 1, Math.round(Math.sin(a) * 14) - 1, 3, 3); }
      ctx.strokeStyle = '#4B5563'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 11, Math.PI * 1.1, Math.PI * 1.7); ctx.stroke();
      ink(ctx, () => ctx.arc(0, 0, 7, 0, Math.PI * 2), '#9CA3AF');
      ctx.fillStyle = '#4B5563'; for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; ctx.fillRect(Math.round(Math.cos(a) * 4) - 1, Math.round(Math.sin(a) * 4) - 1, 2, 2); }
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-4, -5, 2, 2);
      break;
    case 'cow': // a cow (it's a hurricane): inked, patched, horns, a pink muzzle, legs flailing, the udder
      ink(ctx, () => { ctx.rect(-16, 6, 4, 8); ctx.rect(-8, 6, 4, 7); ctx.rect(2, 6, 4, 8); ctx.rect(8, 6, 4, 7); }, '#F8FAFC');
      ctx.fillStyle = '#1F2937'; for (const lx of [-16, -8, 2, 8]) ctx.fillRect(lx, 12, 4, 2);
      ink(ctx, () => ctx.ellipse(-4, 7, 4, 3, 0, 0, Math.PI * 2), '#F9A8D4');
      ink(ctx, () => ctx.roundRect(-18, -10, 30, 17, 4), '#F8FAFC');
      ctx.fillStyle = '#CBD5E1'; ctx.fillRect(-16, 3, 26, 3);
      ctx.fillStyle = '#111827'; ctx.fillRect(-12, -10, 8, 6); ctx.fillRect(-10, -4, 4, 2); ctx.fillRect(0, -2, 7, 6); ctx.fillRect(-16, 0, 4, 4);
      ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-18, -6); ctx.quadraticCurveTo(-24, -10, -22, -2); ctx.stroke();
      ink(ctx, () => ctx.roundRect(10, -16, 11, 11, 3), '#F8FAFC');
      ink(ctx, () => { ctx.rect(11, -19, 2, 3); ctx.rect(18, -19, 2, 3); }, '#FEF3C7');
      ink(ctx, () => ctx.rect(15, -9, 7, 5), '#F9A8D4');
      ctx.fillStyle = '#111827'; ctx.fillRect(13, -13, 2, 2); ctx.fillRect(18, -7, 1, 1); ctx.fillRect(20, -7, 1, 1);
      break;
    case 'jetski': // a jet ski: yellow hull with a stripe, black seat, handlebars
      ink(ctx, () => { ctx.moveTo(-22, 4); ctx.lineTo(22, 4); ctx.lineTo(14, -8); ctx.lineTo(-16, -6); ctx.closePath(); }, '#FACC15');
      ctx.fillStyle = '#FEF08A'; ctx.fillRect(-14, -5, 26, 2);
      ctx.fillStyle = '#2563EB'; ctx.fillRect(-18, 0, 38, 2);
      ctx.fillStyle = '#A16207'; ctx.fillRect(-20, 3, 40, 1);
      ink(ctx, () => ctx.roundRect(-6, -12, 14, 5, 2), '#1F2937'); ctx.fillStyle = '#4B5563'; ctx.fillRect(-4, -11, 8, 1);
      ink(ctx, () => { ctx.rect(10, -16, 3, 8); ctx.rect(7, -17, 9, 2); }, '#374151');
      break;
    default: // a kettle grill: black enamel with a shine, its vent, the legs
      ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-9, 10); ctx.lineTo(-11, 20); ctx.moveTo(9, 10); ctx.lineTo(11, 20); ctx.stroke();
      ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 2; ctx.stroke();
      ink(ctx, () => ctx.arc(0, -2, 14, 0, Math.PI * 2), '#1F2937');
      ctx.fillStyle = '#111827'; ctx.fillRect(-14, -2, 28, 1);
      ctx.fillStyle = '#4B5563'; ctx.fillRect(-8, -12, 6, 2); ctx.fillRect(-10, -9, 2, 4);
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-7, -12, 2, 1);
      ink(ctx, () => ctx.rect(-3, -19, 6, 3), '#6B7280');
      ctx.fillStyle = '#9CA3AF'; for (let k = -2; k <= 2; k += 2) ctx.fillRect(k * 2, 6, 2, 1);
  }
};

// ---------------------------------------------------------------------------
// The daycare
// ---------------------------------------------------------------------------

const KID_COLORS = ['#F43F5E', '#22D3EE', '#FACC15', '#A3E635', '#C084FC', '#FB923C'];

/** Small kid at (x, feet y): shirt colour, arms (up for cheering / swinging), pigtails for some. */
const kid = (ctx: Ctx, x: number, y: number, c: string, armsUp: boolean, f: number, seed: number) => {
  const bounce = armsUp ? Math.abs(Math.sin(f * 0.2 + seed)) * 4 : 0;
  drawPerson(ctx, x, y - bounce, {
    kid: true, skin: ['#F2C9A0', '#C68642', '#8D5524'][seed % 3],
    hair: { style: seed % 2 ? 'pigtails' : seed % 3 === 2 ? 'curly' : 'short', color: ['#1F2937', '#78350F', '#FDE68A'][seed % 3] },
    top: { style: 'tee', color: c, accent: '#F8FAFC' }, legs: { color: seed % 2 ? '#F472B6' : '#1E3A8A', style: 'shorts' }, shoes: ['#EF4444', '#3B82F6', '#22C55E'][seed % 3],
  }, { arms: armsUp ? 'up' : 'down', mouth: armsUp ? 'grin' : 'smile', f }, 1, seed % 2 ? -1 : 1);
};

/**
 * One of the grown-ups on duty: Denise (scrubs, a clipboard, a whistle) or Gary (polo, khakis, a mug of coffee).
 * Calm, or panicking (hands on the head, mouth open) once they see what's coming.
 */
const adult = (ctx: Ctx, x: number, y: number, who: 0 | 1, panic: boolean, f: number) => {
  const hop = panic ? Math.abs(Math.sin(f * 0.35 + who)) * 3 : 0;
  // Denise: scrubs, her hair up, a whistle, the clipboard. Gary: a polo, khakis, a comb-over and his coffee
  const denise = who === 0;
  drawPerson(ctx, x, y - hop, denise
    ? { skin: '#C68642', hair: { style: 'bun', color: '#1F2937' }, top: { style: 'tee', color: '#14B8A6', accent: '#0F766E' }, legs: { color: '#0F766E' }, shoes: '#F8FAFC',
        extra: c => { c.strokeStyle = '#FACC15'; c.lineWidth = 1; c.beginPath(); c.moveTo(-3, -52); c.lineTo(1, -44); c.lineTo(5, -52); c.stroke(); c.fillStyle = '#FACC15'; c.fillRect(0, -45, 3, 2.4); } }
    : { skin: '#F2C9A0', hair: { style: 'short', color: '#78716C' }, top: { style: 'tee', color: '#1D4ED8', accent: '#1E40AF' }, legs: { color: '#D6C7A1' }, shoes: '#78350F', build: 'fat', face: 'stubble' },
    {
      arms: panic ? 'panic' : 'hold', mouth: panic ? 'open' : 'flat', f,
      prop: panic ? undefined : denise
        ? (c, hx, hy) => { c.fillStyle = '#A16207'; c.fillRect(hx - 2, hy - 12, 10, 13); c.fillStyle = '#F8FAFC'; c.fillRect(hx - 1, hy - 10, 8, 10); c.fillStyle = '#94A3B8'; for (let k = 0; k < 3; k++) c.fillRect(hx, hy - 8 + k * 3, 6, 0.8); }
        : (c, hx, hy) => { c.fillStyle = '#F8FAFC'; c.fillRect(hx - 2, hy - 8, 7, 8); c.strokeStyle = '#1A0B06'; c.lineWidth = 0.6; c.strokeRect(hx - 2, hy - 8, 7, 8); c.fillStyle = 'rgba(203, 213, 225, 0.6)'; c.fillRect(hx, hy - 14 - (f % 20) / 5, 1, 4); },
    }, 1, x < COURSE.daycare.building ? 1 : -1);
};

/** What's left of a grown-up after the wave: flattened into the lawn, a lot of red round them. */
const splatAdult = (ctx: Ctx, x: number, y: number, who: 0 | 1) => {
  // The pool, and what was squeezed out of them sprayed along the lawn either side (on the grass: none of it up in the air)
  drawBloodPool(ctx, x, y, 52, x | 0, { dx: 0 });
  drawBloodPool(ctx, x - 44 - hash(x) * 10, y, 12, (x | 0) + 1, { dx: -0.9, color: '#991B1B' });
  drawBloodPool(ctx, x + 44 + hash(x + 1) * 10, y, 10, (x | 0) + 2, { dx: 0.9, color: '#B91C1C' });
  // (pancaked: the body a smear the colors of their clothes, an arm and a shoe out of it)
  ctx.fillStyle = who === 0 ? '#14B8A6' : '#1D4ED8'; ctx.fillRect(x - 18, y - 8, 30, 7);
  ctx.fillStyle = who === 0 ? '#0F766E' : '#A8A29E'; ctx.fillRect(x + 12, y - 6, 20, 5);
  ctx.fillStyle = who === 0 ? '#C68642' : '#F2C9A0'; ctx.fillRect(x - 30, y - 4, 12, 3); ctx.fillRect(x - 34, y - 9, 3, 7);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(x + 32, y - 6, 7, 4);
  // What they had on them
  if (who === 0) { ctx.fillStyle = '#A16207'; ctx.save(); ctx.translate(x + 50, y - 3); ctx.rotate(0.3); ctx.fillRect(-5, -3, 10, 6); ctx.restore(); ctx.fillStyle = '#FACC15'; ctx.fillRect(x - 44, y - 3, 3, 2); }
  else { ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x - 52, y - 7, 6, 6); ctx.fillStyle = 'rgba(120, 53, 15, 0.7)'; ctx.fillRect(x - 58, y - 2, 12, 2); }
};

/** Where the grown-ups are: Denise by the swings, Gary by the sandbox; where they run to when it comes; where they end up. */
const ADULT_AT = [310, -210], ADULT_PANIC = [-150, 150], ADULT_SPLAT = [230, 420];

export const drawDaycare = (ctx: Ctx, state: GameState, dc: Daycare) => {
  const D = COURSE.daycare, bx = D.building, g = D.y, f = state.frame;
  const wrecked = dc.hitAt !== 0 && state.frame >= dc.hitAt;
  if (!visible(state, bx - 400, bx + 600)) return;
  const t = dc.phase === 'cutscene' ? dc.t : -1;
  if (!wrecked) {
    // (the torrent landing on it: the whole thing crushed flat under the weight of it)
    const crush = t >= CRUSH_AT ? Math.min(1, (t - CRUSH_AT) / (HIT - CRUSH_AT)) : 0;
    ctx.save();
    if (crush > 0) { ctx.translate(bx, g); ctx.scale(1 + crush * 0.15, 1 - crush * 0.7); ctx.translate(-bx, -g); }
    // A cheerful little building: clapboard in pastel, a shingled roof, a sun mural with a face, the kids' drawings in
    // the windows, flower boxes, a sign in crayon letters on posts, bunting; a picket fence and a playground
    drawLawn(ctx, bx - 420, bx + 520, g, f);
    drawSchoolhouse(ctx, bx, g, f);
    // Playground: swings, a slide (its ladder), a sandbox (its bucket)
    const px = bx + 260;
    drawSwingFrame(ctx, px, g);
    drawSlide(ctx, px - 170, g);
    drawSandbox(ctx, bx - 300, g);
    // Kids: on the swings, down the slide, in the sandbox (till they see what's coming)
    const lookUp = t >= LOOK_UP;
    for (let s = 0; s < 2 && !lookUp; s++) {
      const a = Math.sin(f * 0.07 + s * 2) * 0.6;
      const sx = px + 65 + s * 50 + Math.sin(a) * 70, sy = g - 110 + Math.cos(a) * 80;
      ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px + 65 + s * 50, g - 110); ctx.lineTo(sx, sy); ctx.stroke();
      kid(ctx, sx, sy + 12, KID_COLORS[s], true, f, s);
    }
    const slideT = (f % 120) / 120;
    if (!lookUp) {
      kid(ctx, px - 150 + slideT * 55, g - 90 + slideT * 88, KID_COLORS[2], true, f, 2);
      kid(ctx, bx - 280, g, KID_COLORS[3], false, f, 3); kid(ctx, bx - 240, g, KID_COLORS[4], false, f, 4);
      adult(ctx, bx + ADULT_AT[0], g, 0, false, f); adult(ctx, bx + ADULT_AT[1], g, 1, false, f);
    }
    // Picket fence: shaded pickets, its rails, a gate
    drawFence(ctx, bx - 380, bx + 480, g);
    ctx.restore();
    if (lookUp) {
      // They've seen it coming: out on the lawn, jumping up and down, cheering it in
      CHEER_SPOTS.forEach((dx, k) => kid(ctx, bx + dx, g - Math.abs(Math.sin(f * 0.3 + k)) * 10, KID_COLORS[k], true, f, k));
      // ...while the grown-ups, who know what that is, lose it
      ADULT_PANIC.forEach((dx, k) => adult(ctx, bx + dx, g, k as 0 | 1, true, f));
      for (const [who, text] of Object.entries(dc.saying)) {
        const k = Number(who.slice(-1));
        if (who.startsWith('kid')) bubble(ctx, bx + CHEER_SPOTS[k], g - 60, text);
        else bubble(ctx, bx + ADULT_PANIC[k], g - 86, text);
      }
    }
    return;
  }
  // After: flattened, soaked, junk everywhere (a car on the roof, a boat in the sandbox) and the kids on top, loving it
  drawLawn(ctx, bx - 420, bx + 520, g, f, true);
  drawWreckedSchoolhouse(ctx, bx, g, f);
  // (the cutter, come down beside it: see drawCutterWreck)
  drawCutterWreck(ctx, bx - 300, g, f);
  // The swing set, bent in half; a shark on the slide
  const px = bx + 260;
  // (the frame's tube: inked, lit along it)
  ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(px, g); ctx.lineTo(px + 40, g - 60); ctx.lineTo(px + 110, g - 30); ctx.lineTo(px + 160, g);
  ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.stroke(); ctx.strokeStyle = '#B91C1C'; ctx.lineWidth = 6; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(px - 1, g - 1); ctx.lineTo(px + 39, g - 61); ctx.lineTo(px + 109, g - 31); ctx.lineTo(px + 159, g - 1);
  ctx.strokeStyle = '#F87171'; ctx.lineWidth = 2; ctx.stroke();
  // (the shark, dead on its back where the slide was: gray over a white belly, fins, X for an eye)
  ctx.save(); ctx.translate(px - 120, g - 40); ctx.rotate(0.7);
  ink(ctx, () => { ctx.moveTo(-40, 0); ctx.lineTo(-52, -12); ctx.lineTo(-48, 0); ctx.lineTo(-52, 12); ctx.closePath(); }, '#475569');
  ink(ctx, () => ctx.ellipse(0, 0, 40, 12, 0, 0, Math.PI * 2), '#64748B');
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 40, 12, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#E2E8F0'; ctx.fillRect(-40, -12, 80, 7); ctx.fillStyle = '#94A3B8'; ctx.fillRect(-40, 6, 80, 6);
  ctx.restore();
  ink(ctx, () => { ctx.moveTo(-6, 10); ctx.lineTo(4, 22); ctx.lineTo(10, 10); ctx.closePath(); }, '#475569');
  ink(ctx, () => { ctx.moveTo(8, -10); ctx.lineTo(14, -18); ctx.lineTo(18, -9); ctx.closePath(); }, '#CBD5E1');
  ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(26, -3); ctx.lineTo(31, 2); ctx.moveTo(31, -3); ctx.lineTo(26, 2); ctx.stroke();
  ctx.fillStyle = '#F8FAFC'; for (let k = 0; k < 4; k++) ctx.fillRect(32 + k * 2 - 4, -8 + k, 2, 2);
  ctx.restore();
  // The other of the Coast Guard (the one aboard is in pieces round the wreck): out on the lawn past the playground
  // (the same size as his crewmate in pieces round the wreck)
  coastieAssUp(ctx, bx + 560, g, 1);
  // The grown-ups, once the wave's done with them
  if (t < 0 || t >= RIDE_END) ADULT_SPLAT.forEach((dx, k) => splatAdult(ctx, bx + dx, g, k as 0 | 1));
  // Puddles: the sky in them, a ripple now and then
  for (let x = bx - 420; x < bx + 500; x += 90) {
    const px0 = x + hash(x) * 40;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.55)'; ctx.beginPath(); ctx.ellipse(px0, g - 1, 36, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(224, 242, 254, 0.8)'; ctx.fillRect(px0 - 20, g - 3, 14, 1);
    if ((f + x) % 90 < 20) { const r = ((f + x) % 90) * 1.4; ctx.strokeStyle = `rgba(255, 255, 255, ${(0.6 - r / 50).toFixed(2)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(px0 + 8, g - 1, r, r * 0.12, 0, 0, Math.PI * 2); ctx.stroke(); }
  }
  // (what the flood left: toys, crayons, a beach ball, a lunchbox)
  for (let k = 0; k < 12; k++) {
    const dx = bx - 380 + hash(k * 7) * 860, cols = ['#EF4444', '#3B82F6', '#22C55E', '#FACC15', '#A855F7'];
    if (k % 4 === 0) { ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(dx, g - 6, 6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = cols[k % 5]; ctx.beginPath(); ctx.arc(dx, g - 6, 6, 0, Math.PI); ctx.fill(); }
    else if (k % 4 === 1) { ctx.fillStyle = cols[k % 5]; ctx.save(); ctx.translate(dx, g - 2); ctx.rotate(hash(k) * 3); ctx.fillRect(-6, -1, 12, 3); ctx.restore(); }
    else if (k % 4 === 2) { ctx.fillStyle = cols[(k + 2) % 5]; ctx.fillRect(dx - 6, g - 8, 12, 8); ctx.fillStyle = '#1C1917'; ctx.fillRect(dx - 3, g - 10, 6, 2); }
    else { ctx.fillStyle = cols[(k + 1) % 5]; ctx.fillRect(dx - 4, g - 6, 8, 6); ctx.fillRect(dx - 2, g - 9, 4, 3); }
  }
  // The kids, sat on top of the wreck in their floaties, cheering (once they've ridden the wave in)
  if (t < 0 || t >= RIDE_END) for (let k = 0; k < 5; k++) { const w = wreckSpot(k); floatieKid(ctx, w.x, w.y, k, f); }
  // (what they're saying: up on the wreck once they're there)
  if (t < 0 || t >= RIDE_END) for (const [who, text] of Object.entries(dc.saying)) if (who.startsWith('kid')) { const w = wreckSpot(Number(who.slice(-1))); bubble(ctx, w.x, w.y - 50, text); }
};

/** The flood's timeline, in cutscene frames (daycare.ts drives it). */
const LOOK_UP = 100, CRUSH_AT = 128, HIT = 140, RIDE_END = 200;
/** Where the kids stand cheering it in (from the building), and where they end up on the wreck. */
const CHEER_SPOTS = [-330, -250, 230, 310, 390];
const wreckSpot = (k: number) => ({ x: COURSE.daycare.building - 120 + k * 60, y: COURSE.daycare.y - 64 - (k === 2 ? 60 : 0) + (k % 2) * 8 });

const floatieKid = (ctx: Ctx, x: number, y: number, k: number, f: number) => {
  kid(ctx, x, y, KID_COLORS[k], true, f, k);
  ctx.strokeStyle = '#F97316'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y - 20, 11, 4, 0, 0, Math.PI * 2); ctx.stroke();
};

/** The flood: the whole storm coming down on the daycare at once. */
export const drawDaycareFront = (ctx: Ctx, state: GameState, dc: Daycare) => {
  if (dc.phase !== 'cutscene') return;
  const D = COURSE.daycare, bx = D.building, g = D.y;
  const t = dc.t, f = state.frame;
  if (t >= 100 && t < 190) {
    // A column of water (and a car, and a cow) falling out of the sky
    const k = Math.min(1, (t - 100) / 40);
    const bottom = state.camera.y + (g - state.camera.y) * k;
    const w = 260 + (t > 140 ? (t - 140) * 3 : 0);
    // (once it's hit, the tail end of it comes down after it and the sky's clear)
    const top = state.camera.y - 20 + (t > 140 ? Math.min(1, (t - 140) / 36) * (g - state.camera.y + 20) : 0);
    if (bottom > top) {
      // (in bands across it, darker at its edges, streaks rushing down it, its edges white and ragged)
      const cols = ['#1E3A8A', '#1D4ED8', '#3B82F6', '#60A5FA', '#93C5FD', '#60A5FA', '#3B82F6', '#1D4ED8', '#1E3A8A'];
      const bw = w / cols.length;
      cols.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(Math.floor(bx - w / 2 + i * bw), top, Math.ceil(bw) + 1, bottom - top); if (i) checker(ctx, Math.floor(bx - w / 2 + i * bw) - 2, top, 2, bottom - top, c, i % 2); });
      for (let i = 0; i < 22; i++) { ctx.fillStyle = i % 3 ? 'rgba(240, 249, 255, 0.75)' : 'rgba(255, 255, 255, 0.95)'; ctx.fillRect(Math.floor(bx - w / 2 + ((i * 37 + f * 3) % w)), top + ((i * 53 + f * 21) % Math.max(1, bottom - top)), 2, 30 + (i % 4) * 12); }
      ctx.fillStyle = 'rgba(240, 249, 255, 0.85)';
      for (let y = top; y < bottom; y += 10) for (const side of [-1, 1]) ctx.fillRect(Math.floor(bx + side * w / 2 + Math.sin(y * 0.1 + f * 0.6) * 4) - 2, y, 4, 8);
      // (and the spray where it's coming down, once it's down)
      if (bottom >= g - 10) for (let k = 0; k < 8; k++) pixelBlob(ctx, bx + (k - 3.5) * w / 6 + Math.sin(f * 0.3 + k) * 8, g - 30 - (k % 3) * 18, 34, 18, 'rgba(240, 249, 255, 0.75)');
    }
    // (and a couple of the Coast Guard coming down in it, with everything else)
    if (t < 146) for (let k = 0; k < 2; k++) { const kk = Math.min(1, (t - 100) / 44); deadCoastie(ctx, bx - 60 + k * 90, state.camera.y - 40 + (g - state.camera.y) * kk - k * 60, 2.4, t * 0.2 * (k ? 1 : -1)); }
    if (t > 140) {
      // The wave spreading out across the lawn
      const spread = (t - 140) * 18;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.beginPath(); ctx.moveTo(bx - spread, g); ctx.quadraticCurveTo(bx - spread * 0.6, g - 90 + (t - 140), bx, g - 120 + (t - 140)); ctx.quadraticCurveTo(bx + spread * 0.6, g - 90 + (t - 140), bx + spread, g); ctx.closePath(); ctx.fill();
    }
  }
  // The kids riding the wave, whooping, tossed up and over onto the wreck
  if (t >= HIT && t < RIDE_END) {
    const k01 = (t - HIT) / (RIDE_END - HIT);
    CHEER_SPOTS.forEach((dx, k) => {
      const from = { x: bx + dx, y: g }, to = wreckSpot(k);
      const x = from.x + (to.x - from.x) * k01, y = from.y + (to.y - from.y) * k01 - Math.sin(k01 * Math.PI) * (160 + k * 25);
      floatieKid(ctx, x, y, k, f);
    });
    if (dc.saying[DAYCARE_LINES.ride.who]) bubble(ctx, bx, g - 250, dc.saying[DAYCARE_LINES.ride.who]);
    // The grown-ups, not riding it: rolled over and over in it, out to where they end up, red in the water round them
    ADULT_PANIC.forEach((dx, k) => {
      const x = bx + dx + (ADULT_SPLAT[k] - dx) * k01, y = g - 30 + Math.sin(k01 * Math.PI * 3) * 14;
      ctx.fillStyle = `rgba(185, 28, 28, ${0.5 * (1 - k01 * 0.5)})`; ctx.beginPath(); ctx.ellipse(x - Math.sign(ADULT_SPLAT[k]) * 30, y + 10, 40, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.translate(x, y); ctx.rotate(k01 * 14 * (k ? 1 : -1)); ctx.translate(-x, -(y + 30));
      adult(ctx, x, y + 30, k as 0 | 1, true, f);
      ctx.restore();
    });
  }
  // Flash of the impact
  if (t >= 140 && t < 150) { ctx.fillStyle = `rgba(255,255,255,${(150 - t) / 12})`; ctx.fillRect(state.camera.x, state.camera.y, CANVAS_WIDTH, CANVAS_HEIGHT); }
};

// ---------------------------------------------------------------------------
// The daycare, in its pieces
// ---------------------------------------------------------------------------

/** The lawn: grass in bands, blades flicked up along its top, a few flowers (soaked flat, after). */
const drawLawn = (ctx: Ctx, x1: number, x2: number, g: number, f: number, soaked = false) => {
  bandedGradient(ctx, x1, g - 6, x2 - x1, 12, soaked ? ['#3F6212', '#365314'] : ['#65A30D', '#4D7C0F'], 3);
  ctx.fillStyle = soaked ? '#4D7C0F' : '#84CC16';
  for (let x = x1; x < x2; x += 4) if (hash(x) > 0.35) ctx.fillRect(x, g - 6 - (soaked ? 0 : Math.floor(hash(x + 1) * 3) * 2), 2, soaked ? 2 : 4);
  if (!soaked) for (let k = 0; k < 14; k++) { const x = x1 + hash(k * 13) * (x2 - x1); ctx.fillStyle = ['#F472B6', '#FDE047', '#F8FAFC'][k % 3]; ctx.fillRect(Math.floor(x), g - 9, 3, 3); ctx.fillStyle = '#FDE047'; ctx.fillRect(Math.floor(x) + 1, g - 8, 1, 1); }
  void f;
};

/** The schoolhouse, before: pastel clapboard (shaded down its right), a shingled pink roof, the sun mural with a smile,
 * a blue door (its window, its knob), two windows with the kids' crayon drawings taped up and flower boxes under,
 * the sign in rainbow crayon letters up on posts, bunting along the eaves. */
const drawSchoolhouse = (ctx: Ctx, bx: number, g: number, f: number) => {
  const L = bx - 160, R = bx + 160, T = g - 170;
  // Walls: clapboard
  ctx.fillStyle = '#FDE68A'; ctx.fillRect(L, T, 320, 170);
  for (let y = T + 8; y < g; y += 10) { ctx.fillStyle = '#FCD34D'; ctx.fillRect(L, y, 320, 2); ctx.fillStyle = '#FEF3C7'; ctx.fillRect(L, y - 2, 320, 1); }
  ctx.fillStyle = 'rgba(180, 83, 9, 0.18)'; ctx.fillRect(R - 50, T, 50, 170); checker(ctx, R - 54, T, 4, 170, 'rgba(180, 83, 9, 0.18)');
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(L - 4, T, 6, 170); ctx.fillRect(R - 2, T, 6, 170); ctx.fillRect(L - 4, g - 8, 328, 8);
  // Roof: shingles in rows, the eave's shadow under it
  ctx.save(); ctx.beginPath(); ctx.moveTo(L - 20, T); ctx.lineTo(bx, g - 250); ctx.lineTo(R + 20, T); ctx.closePath(); ctx.clip();
  ctx.fillStyle = '#F472B6'; ctx.fillRect(L - 20, g - 252, 360, 84);
  for (let r = 0; r < 9; r++) { const y = g - 250 + r * 9; ctx.fillStyle = r % 2 ? '#EC4899' : '#F9A8D4'; for (let x = L - 20 + (r % 2) * 9; x < R + 20; x += 18) ctx.fillRect(x, y + 6, 14, 3); }
  ctx.fillStyle = 'rgba(131, 24, 67, 0.3)'; ctx.beginPath(); ctx.moveTo(bx, g - 250); ctx.lineTo(R + 20, T); ctx.lineTo(bx, T); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#BE185D'; ctx.fillRect(L - 22, T - 2, 364, 5);
  ctx.fillStyle = 'rgba(120, 53, 15, 0.25)'; ctx.fillRect(L, T + 3, 320, 6);
  // Bunting along the eaves
  for (let k = 0; k < 16; k++) { const x = L - 14 + k * 22, sway = Math.sin(f * 0.08 + k) * 1.5; ctx.fillStyle = ['#EF4444', '#3B82F6', '#22C55E', '#FACC15'][k % 4]; ctx.beginPath(); ctx.moveTo(x, T + 6); ctx.lineTo(x + 14, T + 6); ctx.lineTo(x + 7 + sway, T + 18); ctx.fill(); }
  ctx.strokeStyle = '#78350F'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L - 14, T + 6); ctx.lineTo(R + 14, T + 6); ctx.stroke();
  // The sun mural, smiling
  const sx = bx - 90, sy = g - 104;
  ctx.fillStyle = '#FDBA74'; for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) { ctx.save(); ctx.translate(sx, sy); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(30, -5); ctx.lineTo(44, 0); ctx.lineTo(30, 5); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = '#FB923C'; ctx.beginPath(); ctx.arc(sx, sy, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FDBA74'; ctx.beginPath(); ctx.arc(sx - 6, sy - 6, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7C2D12'; ctx.fillRect(sx - 10, sy - 8, 4, 5); ctx.fillRect(sx + 6, sy - 8, 4, 5);
  ctx.strokeStyle = '#7C2D12'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx, sy + 2, 10, 0.2, Math.PI - 0.2); ctx.stroke();
  ctx.fillStyle = 'rgba(244, 114, 182, 0.6)'; ctx.fillRect(sx - 18, sy + 2, 6, 3); ctx.fillRect(sx + 12, sy + 2, 6, 3);
  // The door
  ctx.fillStyle = '#1E40AF'; ctx.fillRect(bx + 6, g - 94, 58, 94); ctx.fillStyle = '#38BDF8'; ctx.fillRect(bx + 10, g - 90, 50, 90);
  ctx.fillStyle = '#0EA5E9'; ctx.fillRect(bx + 50, g - 90, 10, 90); ctx.fillStyle = '#E0F2FE'; ctx.fillRect(bx + 20, g - 80, 30, 22); ctx.fillStyle = '#1E40AF'; ctx.fillRect(bx + 34, g - 80, 2, 22);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(bx + 50, g - 46, 5, 5);
  // The windows: frames, the drawings taped up, flower boxes
  for (const wx of [bx + 80, bx - 150]) {
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(wx, g - 134, 54, 46); ctx.fillStyle = '#7DD3FC'; ctx.fillRect(wx + 4, g - 130, 46, 38);
    ctx.fillStyle = '#E0F2FE'; ctx.fillRect(wx + 6, g - 128, 12, 2); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(wx + 25, g - 130, 4, 38);
    // (a crayon drawing: a house and a stick family, a red scribble sun)
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(wx + 8, g - 124, 14, 18); ctx.fillStyle = '#EF4444'; ctx.fillRect(wx + 10, g - 122, 4, 4); ctx.fillStyle = '#22C55E'; ctx.fillRect(wx + 9, g - 110, 12, 2); ctx.fillStyle = '#1C1917'; ctx.fillRect(wx + 16, g - 116, 1, 6); ctx.fillRect(wx + 19, g - 114, 1, 4);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(wx + 32, g - 122, 14, 16); ctx.fillStyle = '#A855F7'; ctx.fillRect(wx + 35, g - 118, 8, 6); ctx.fillStyle = '#3B82F6'; ctx.fillRect(wx + 34, g - 110, 10, 2);
    ctx.fillStyle = '#92400E'; ctx.fillRect(wx - 2, g - 88, 58, 8); ctx.fillStyle = '#78350F'; ctx.fillRect(wx - 2, g - 82, 58, 2);
    for (let k = 0; k < 6; k++) { ctx.fillStyle = '#16A34A'; ctx.fillRect(wx + 2 + k * 9, g - 94, 3, 6); ctx.fillStyle = ['#F472B6', '#FDE047', '#F87171'][k % 3]; ctx.fillRect(wx + 1 + k * 9, g - 97, 5, 4); }
  }
  // The sign: a white board on posts, each letter a different crayon
  ctx.fillStyle = '#92400E'; ctx.fillRect(bx - 128, g - 214, 6, 40); ctx.fillRect(bx + 122, g - 214, 6, 40);
  ctx.fillStyle = '#78350F'; ctx.fillRect(bx - 144, g - 214, 288, 34); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(bx - 140, g - 210, 280, 26);
  ctx.font = 'bold 11px "Press Start 2P"'; ctx.textAlign = 'left';
  const text = 'LITTLE SUNSHINE DAYCARE', cw = ctx.measureText(text).width / text.length;
  [...text].forEach((ch, k) => { ctx.fillStyle = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#A855F7', '#EC4899'][k % 7]; ctx.fillText(ch, bx - cw * text.length / 2 + k * cw, g - 191 + (k % 2)); });
};

/** The schoolhouse, after: knocked flat, its boards splintered and sticking up, the roof slid off in a heap, shingles
 * everywhere, the sign snapped off its posts, a car upside down on top of the lot (wheels in the air), water still
 * pouring off it all. */
const drawWreckedSchoolhouse = (ctx: Ctx, bx: number, g: number, f: number) => {
  // (the walls, down in a heap of boards)
  ctx.fillStyle = '#FDE68A';
  ctx.beginPath(); ctx.moveTo(bx - 190, g); ctx.lineTo(bx - 170, g - 50); ctx.lineTo(bx - 60, g - 70); ctx.lineTo(bx + 40, g - 40); ctx.lineTo(bx + 150, g - 60); ctx.lineTo(bx + 200, g); ctx.closePath(); ctx.fill();
  for (let y = g - 64; y < g; y += 10) { ctx.fillStyle = '#FCD34D'; ctx.fillRect(bx - 180, y, 370, 2); }
  ctx.fillStyle = 'rgba(120, 53, 15, 0.3)'; ctx.fillRect(bx - 190, g - 16, 390, 16);
  // (boards splintered and sticking up out of it)
  for (let k = 0; k < 9; k++) {
    const x = bx - 170 + k * 42 + hash(k) * 12, a = (hash(k + 3) - 0.5) * 1.4, len = 30 + hash(k + 5) * 40;
    ctx.save(); ctx.translate(x, g - 40 + hash(k + 9) * 20); ctx.rotate(a);
    ctx.fillStyle = k % 3 ? '#FDE68A' : '#F8FAFC'; ctx.fillRect(-4, -len, 8, len); ctx.fillStyle = '#B45309'; ctx.fillRect(-4, -len, 8, 2);
    ctx.fillStyle = '#FCD34D'; ctx.beginPath(); ctx.moveTo(-4, -len); ctx.lineTo(0, -len - 8); ctx.lineTo(4, -len); ctx.fill();
    ctx.restore();
  }
  // (the roof, slid off in one piece onto the heap, its shingles)
  ctx.save(); ctx.translate(bx - 20, g - 70); ctx.rotate(-0.25);
  ctx.beginPath(); ctx.moveTo(-160, 0); ctx.lineTo(0, -60); ctx.lineTo(150, 10); ctx.closePath(); ctx.save(); ctx.clip();
  ctx.fillStyle = '#F472B6'; ctx.fillRect(-170, -70, 330, 90);
  for (let r = 0; r < 8; r++) { ctx.fillStyle = r % 2 ? '#EC4899' : '#F9A8D4'; for (let x = -170 + (r % 2) * 9; x < 160; x += 18) if (hash(x + r * 31) > 0.2) ctx.fillRect(x, -60 + r * 9, 14, 3); }
  ctx.restore();
  ctx.fillStyle = '#BE185D'; ctx.beginPath(); ctx.moveTo(-160, 0); ctx.lineTo(150, 10); ctx.lineTo(150, 14); ctx.lineTo(-160, 4); ctx.fill();
  ctx.restore();
  for (let k = 0; k < 18; k++) { ctx.fillStyle = k % 2 ? '#EC4899' : '#F9A8D4'; ctx.save(); ctx.translate(bx - 260 + hash(k * 3) * 560, g - 3 - hash(k) * 4); ctx.rotate(hash(k + 1) * 3); ctx.fillRect(-7, -2, 14, 4); ctx.restore(); }
  // (the sign, snapped off, the crayon letters all that's left of the name)
  ctx.save(); ctx.translate(bx + 90, g - 30); ctx.rotate(0.5);
  ctx.fillStyle = '#78350F'; ctx.fillRect(-84, -16, 168, 32); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-80, -12, 160, 24);
  ctx.font = 'bold 7px "Press Start 2P"'; ctx.textAlign = 'left';
  [...'LITTLE SUNSH'].forEach((ch, k) => { ctx.fillStyle = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#A855F7', '#EC4899'][k % 7]; ctx.fillText(ch, -66 + k * 9, 4); });
  ctx.fillStyle = '#FDE68A'; ctx.beginPath(); ctx.moveTo(80, -12); ctx.lineTo(70, 0); ctx.lineTo(80, 12); ctx.fill();
  ctx.restore();
  ctx.textAlign = 'left';
  // The car the storm dropped on it: upside down, its wheels in the air, a door hanging open
  ctx.save(); ctx.translate(bx - 60, g - 118); ctx.rotate(0.15);
  ctx.fillStyle = '#1D4ED8'; ctx.fillRect(-64, -10, 128, 26); ctx.fillStyle = '#2563EB'; ctx.fillRect(-64, -10, 128, 6);
  ctx.fillStyle = '#1E3A8A'; ctx.beginPath(); ctx.moveTo(-40, 16); ctx.lineTo(-30, 34); ctx.lineTo(30, 34); ctx.lineTo(42, 16); ctx.fill();
  ctx.fillStyle = '#93C5FD'; ctx.fillRect(-26, 20, 22, 10); ctx.fillRect(4, 20, 22, 10);
  for (const wx of [-44, 44]) { ctx.fillStyle = '#18181B'; ctx.beginPath(); ctx.arc(wx, -12, 13, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#A1A1AA'; ctx.beginPath(); ctx.arc(wx, -12, 5, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#EF4444'; ctx.fillRect(58, -4, 6, 6); ctx.fillStyle = '#FDE68A'; ctx.fillRect(-64, -4, 6, 6);
  ctx.restore();
  // (water still running off the lot)
  ctx.fillStyle = 'rgba(147, 197, 253, 0.8)'; for (let k = 0; k < 8; k++) { const x = bx - 160 + k * 46, y = (f * 2 + k * 23) % 60; ctx.fillRect(x, g - 70 + y, 2, 6); }
};

/** The swing set: tube frame (lit, shaded), its seats (the kids on them are drawn by the scene). */
const drawSwingFrame = (ctx: Ctx, px: number, g: number) => {
  const tube = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.strokeStyle = '#B91C1C'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.strokeStyle = '#F87171'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1 - 1, y1); ctx.lineTo(x2 - 1, y2); ctx.stroke();
  };
  tube(px, g, px + 30, g - 110); tube(px + 60, g, px + 30, g - 110); tube(px + 120, g, px + 150, g - 110); tube(px + 180, g, px + 150, g - 110);
  tube(px + 26, g - 110, px + 154, g - 110);
  ctx.fillStyle = '#7F1D1D'; for (const x of [px, px + 60, px + 120, px + 180]) ctx.fillRect(x - 4, g - 3, 8, 3);
};

/** The slide: its ladder, the yellow chute shaded down one edge. */
const drawSlide = (ctx: Ctx, x: number, g: number) => {
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(x, g - 90, 8, 90); ctx.fillRect(x - 22, g - 90, 6, 90);
  ctx.fillStyle = '#DC2626'; for (let y = g - 80; y < g; y += 14) ctx.fillRect(x - 20, y, 26, 3);
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(x - 24, g - 94, 34, 6);
  ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.moveTo(x + 10, g - 90); ctx.quadraticCurveTo(x + 50, g - 70, x + 70, g); ctx.lineTo(x + 82, g); ctx.quadraticCurveTo(x + 62, g - 70, x + 22, g - 90); ctx.fill();
  ctx.strokeStyle = '#CA8A04'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 22, g - 90); ctx.quadraticCurveTo(x + 62, g - 70, x + 82, g); ctx.stroke();
  ctx.strokeStyle = '#FEF08A'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 13, g - 89); ctx.quadraticCurveTo(x + 52, g - 69, x + 72, g - 1); ctx.stroke();
};

/** The sandbox: a timber frame, the sand dithered, a bucket and spade. */
const drawSandbox = (ctx: Ctx, x: number, g: number) => {
  ctx.fillStyle = '#92400E'; ctx.fillRect(x - 4, g - 14, 98, 14); ctx.fillStyle = '#B45309'; ctx.fillRect(x - 4, g - 14, 98, 3);
  ctx.fillStyle = '#FDE68A'; ctx.fillRect(x + 2, g - 11, 86, 6); checker(ctx, x + 2, g - 11, 86, 6, '#FCD34D');
  ctx.fillStyle = '#EF4444'; ctx.fillRect(x + 60, g - 22, 12, 10); ctx.fillRect(x + 58, g - 23, 16, 2); ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x + 66, g - 22, 6, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = '#3B82F6'; ctx.save(); ctx.translate(x + 30, g - 14); ctx.rotate(-0.6); ctx.fillRect(-1, -14, 2, 12); ctx.fillRect(-4, -4, 8, 6); ctx.restore();
};

/** The picket fence: pickets lit on the left and shaded on the right, two rails, a gate with a latch. */
const drawFence = (ctx: Ctx, x1: number, x2: number, g: number) => {
  ctx.fillStyle = '#E2E8F0'; ctx.fillRect(x1, g - 28, x2 - x1, 4); ctx.fillRect(x1, g - 14, x2 - x1, 4);
  for (let x = x1; x < x2; x += 14) {
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x, g - 34, 8, 34); ctx.beginPath(); ctx.moveTo(x, g - 34); ctx.lineTo(x + 4, g - 40); ctx.lineTo(x + 8, g - 34); ctx.fill();
    ctx.fillStyle = '#CBD5E1'; ctx.fillRect(x + 6, g - 34, 2, 34);
  }
  ctx.fillStyle = '#94A3B8'; ctx.fillRect(x1 + 300, g - 24, 4, 4);
};
