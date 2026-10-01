// Drawing for Hector's set pieces: the old fisherman and the boat, the
// waterspout, the junk whirling up the storm tower, the Eye's arena, and the
// daycare (before and after the flood).

import { deadCoastie } from './chaseDraw';
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

type Ctx = CanvasRenderingContext2D;

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 250 && x1 < state.camera.x + CANVAS_WIDTH + 250;

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
      // Sat on a bucket, rod out over the water, bucket hat, pipe
      ctx.fillStyle = '#6B7280'; ctx.fillRect(-10, -16, 20, 16);
      ctx.fillStyle = '#4D7C0F'; ctx.fillRect(-9, -26, 18, 10);
      ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-12, -50, 22, 26);
      ctx.fillStyle = '#FDE68A'; ctx.fillRect(-12, -50, 22, 4);
      ctx.fillStyle = '#F2C9A0'; ctx.beginPath(); ctx.arc(0, -58, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-6, -52, 12, 4);                                  // white beard
      ctx.fillStyle = '#A16207'; ctx.fillRect(-11, -68, 22, 5); ctx.fillRect(-7, -72, 14, 5);  // bucket hat
      ctx.strokeStyle = '#78350F'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(6, -40); ctx.lineTo(70, -90); ctx.stroke();
      ctx.strokeStyle = 'rgba(229, 231, 235, 0.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(70, -90); ctx.lineTo(90, COURSE.sea.y - m.y); ctx.stroke();
    } else {
      // In the water: head, hat and rod bobbing (or cartwheeling through the air)
      ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-10, -20, 20, 22);
      ctx.fillStyle = '#F2C9A0'; ctx.beginPath(); ctx.arc(0, -28, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#A16207'; ctx.fillRect(-11, -38, 22, 5);
      ctx.strokeStyle = '#78350F'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(6, -18); ctx.lineTo(34, -50); ctx.stroke();
    }
    ctx.restore();
    if (m.lineT > 0) bubble(ctx, m.x, m.y - (m.state === 'fishing' ? 84 : 52), m.line);
  }
  // The waterspout: a twisting grey column from the sea up into the clouds
  const sx = COURSE.sea.spoutX;
  if (visible(state, sx - 200, sx + 200) && b.phase !== 'waiting' && b.phase !== 'cutscene') {
    const f = state.frame;
    const top = state.camera.y - 50, bottom = COURSE.sea.y;
    for (let y = bottom; y > top; y -= 12) {
      const k = (bottom - y) / (bottom - top);
      const w = 40 + k * 160;
      const off = Math.sin(y * 0.02 + f * 0.1) * (10 + k * 30);
      ctx.fillStyle = `rgba(${120 + k * 40}, ${135 + k * 40}, ${160 + k * 30}, ${0.55 - k * 0.2})`;
      ctx.fillRect(sx - w / 2 + off, y - 12, w, 13);
      ctx.fillStyle = 'rgba(226, 232, 240, 0.35)';
      ctx.fillRect(sx - w / 2 + off + ((f * 4 + y) % w), y - 12, 6, 13);
    }
    ctx.fillStyle = 'rgba(224, 242, 254, 0.6)';
    for (let i = 0; i < 12; i++) { const a = f * 0.2 + i; ctx.beginPath(); ctx.arc(sx + Math.cos(a) * 70, bottom - 6 + Math.sin(a) * 6, 6, 0, Math.PI * 2); ctx.fill(); }
  }
  // The boat's deck and outboard (the hull's in front of him)
  if (b.phase !== 'gone' && visible(state, b.x - 20, b.x + BOAT_WIDTH + 20)) {
    ctx.save();
    ctx.translate(b.x, b.y);
    if (b.phase === 'spout') ctx.rotate(Math.sin(b.spin) * 0.3);
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(4, -20, BOAT_WIDTH - 8, 6);
    ctx.fillStyle = '#374151'; ctx.fillRect(-14, -30, 16, 26);                 // outboard motor
    ctx.fillStyle = '#6B7280'; ctx.fillRect(-10, -4, 6, 18);
    if (b.phase === 'riding' && state.frame % 2 === 0) ctx.fillRect(-18, 12, 4, 4);
    ctx.restore();
  }
};

/** The boat's hull, in front of him (so he's sitting in it). */
export const drawBoatFront = (ctx: Ctx, state: GameState, b: Boat) => {
  if (b.phase === 'gone' || !visible(state, b.x - 20, b.x + BOAT_WIDTH + 20)) return;
  ctx.save();
  ctx.translate(b.x, b.y);
  if (b.phase === 'spout') ctx.rotate(Math.sin(b.spin) * 0.3);
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(BOAT_WIDTH + 18, -26); ctx.lineTo(BOAT_WIDTH - 10, 8); ctx.lineTo(10, 8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#DC2626'; ctx.fillRect(4, -8, BOAT_WIDTH, 4);
  ctx.fillStyle = '#111827'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.fillText('LIL BASS', 30, -12);
  ctx.restore();
};

/** The pool's water, over the sunken bit of the Pink Flamingo's lot. */
export const drawPoolWater = (ctx: Ctx, state: GameState) => {
  for (const r of state.groundRuns) {
    if (r.surface !== 'pool' || !visible(state, r.x1, r.x2)) continue;
    const top = 560;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.55)'; ctx.fillRect(r.x1, top, r.x2 - r.x1, r.y1 - top);
    ctx.strokeStyle = 'rgba(240, 249, 255, 0.9)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = r.x1; x <= r.x2; x += 8) { const y = top + Math.sin(x * 0.08 + state.frame * 0.12) * 2; if (x === r.x1) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.stroke();
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
      ctx.fillStyle = '#92400E'; ctx.fillRect(x, y, w, 16);
      ctx.fillStyle = '#FACC15'; ctx.fillRect(x + w - 16, y + 5, 5, 5);
      break;
    case 'carroof':
      ctx.fillStyle = '#2563EB'; ctx.beginPath(); ctx.moveTo(x, y + 16); ctx.lineTo(x + 12, y); ctx.lineTo(x + w - 12, y); ctx.lineTo(x + w, y + 16); ctx.fill();
      ctx.fillStyle = '#93C5FD'; ctx.fillRect(x + 16, y + 4, w - 32, 8);
      break;
    case 'shed':
      ctx.fillStyle = '#65A30D'; ctx.beginPath(); ctx.moveTo(x, y + 18); ctx.lineTo(x + w / 2, y - 6); ctx.lineTo(x + w, y + 18); ctx.fill();
      ctx.fillStyle = '#4D7C0F'; ctx.fillRect(x, y + 14, w, 6);
      break;
    case 'billboard':
    {
      const [text, board, ink] = BILLBOARDS[variant % BILLBOARDS.length];
      ctx.fillStyle = board; ctx.fillRect(x, y, w, 20);
      // Chasing bulbs round the edge (the tackier the better)
      for (let bx = x + 4; bx < x + w - 2; bx += 8) {
        ctx.fillStyle = Math.floor((bx - x) / 8 + f / 6) % 2 ? '#FEF9C3' : '#78350F';
        ctx.fillRect(bx, y + 1, 3, 2); ctx.fillRect(bx, y + 17, 3, 2);
      }
      ctx.save();
      ctx.font = 'bold 7px "Press Start 2P"';
      const tw = ctx.measureText(text).width, room = w - 8;
      ctx.translate(x + w / 2, y + 13);
      if (tw > room) ctx.scale(room / tw, 1);
      ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.fillText(text, 0, 0);
      ctx.restore();
      break;
    }
    case 'sofa':
      ctx.fillStyle = '#9D174D'; ctx.fillRect(x, y, w, 14); ctx.fillRect(x, y - 12, 12, 14); ctx.fillRect(x + w - 12, y - 12, 12, 14);
      ctx.fillStyle = '#BE185D'; ctx.fillRect(x + 12, y - 4, w - 24, 6);
      break;
    case 'fridge':
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(x, y, w, 20);
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x + w * 0.6, y + 2, 2, 16);
      break;
    case 'hull':
      ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - 14, y + 18); ctx.lineTo(x + 10, y + 18); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#DC2626'; ctx.fillRect(x + 6, y + 6, w - 12, 3);
      break;
    case 'trampoline': {
      // Springy: it's for bouncing
      ctx.fillStyle = '#111827'; ctx.fillRect(x, y + 2, w, 6);
      ctx.fillStyle = '#3B82F6'; ctx.fillRect(x - 4, y, 8, 12); ctx.fillRect(x + w - 4, y, 8, 12);
      ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 2;
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x + 10 + k * (w - 20) / 3, y + 8); ctx.lineTo(x + 10 + k * (w - 20) / 3, y + 20); ctx.stroke(); }
      if (Math.floor(f / 20) % 2 === 0) { ctx.fillStyle = '#FDE047'; ctx.beginPath(); ctx.moveTo(x + w / 2, y - 30); ctx.lineTo(x + w / 2 - 9, y - 18); ctx.lineTo(x + w / 2 + 9, y - 18); ctx.fill(); }
      break;
    }
    default: // a plank
      ctx.fillStyle = '#A16207'; ctx.fillRect(x, y, w, 12);
      ctx.fillStyle = '#854D0E'; ctx.fillRect(x, y + 8, w, 4);
      ctx.fillStyle = '#44403C'; ctx.fillRect(x + 6, y + 4, 3, 3); ctx.fillRect(x + w - 10, y + 4, 3, 3);
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
    case 'chair': // a folding lawn chair
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-18, -2, 36, 4); ctx.fillRect(-18, -18, 4, 20); ctx.fillRect(14, -2, 4, 18);
      ctx.fillStyle = '#10B981'; for (let k = 0; k < 4; k++) ctx.fillRect(-14, -16 + k * 5, 28, 3);
      break;
    case 'flamingo': // a plastic lawn flamingo
      ctx.fillStyle = '#F472B6'; ctx.beginPath(); ctx.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(10, -20, 4, 18); ctx.beginPath(); ctx.arc(14, -20, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#111827'; ctx.fillRect(18, -20, 5, 3);
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-2, 8, 2, 12);
      break;
    case 'cart': // a shopping cart
      ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 2;
      ctx.strokeRect(-18, -14, 34, 20); for (let k = -12; k < 16; k += 6) { ctx.beginPath(); ctx.moveTo(k, -14); ctx.lineTo(k, 6); ctx.stroke(); }
      ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(-12, 12, 4, 0, Math.PI * 2); ctx.arc(10, 12, 4, 0, Math.PI * 2); ctx.fill();
      break;
    case 'sign': // a stop sign on a bit of pole
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-2, 6, 4, 14);
      ctx.fillStyle = '#DC2626'; ctx.beginPath(); for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + Math.PI / 8; ctx.lineTo(Math.cos(a) * 15, Math.sin(a) * 15 - 4); } ctx.fill();
      ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('STOP', 0, -2);
      break;
    case 'tire':
      ctx.fillStyle = '#1F2937'; ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6B7280'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
      break;
    case 'cow': // a cow (it's a hurricane)
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-18, -10, 30, 16); ctx.fillRect(10, -14, 10, 10);
      ctx.fillStyle = '#111827'; ctx.fillRect(-12, -10, 8, 6); ctx.fillRect(0, -2, 7, 6); ctx.fillRect(-16, 6, 4, 8); ctx.fillRect(6, 6, 4, 8);
      ctx.fillStyle = '#F9A8D4'; ctx.fillRect(16, -8, 5, 4);
      break;
    case 'jetski':
      ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.moveTo(-22, 4); ctx.lineTo(22, 4); ctx.lineTo(14, -8); ctx.lineTo(-16, -6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#111827'; ctx.fillRect(-4, -12, 12, 5); ctx.fillRect(10, -16, 3, 8);
      break;
    default: // a kettle grill
      ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(0, -2, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6B7280'; ctx.fillRect(-10, 10, 2, 10); ctx.fillRect(8, 10, 2, 10); ctx.fillRect(-2, -18, 4, 3);
  }
};

// ---------------------------------------------------------------------------
// The daycare
// ---------------------------------------------------------------------------

const KID_COLORS = ['#F43F5E', '#22D3EE', '#FACC15', '#A3E635', '#C084FC', '#FB923C'];

/** Small kid at (x, feet y): shirt colour, arms (up for cheering / swinging), pigtails for some. */
const kid = (ctx: Ctx, x: number, y: number, c: string, armsUp: boolean, f: number, seed: number) => {
  const bounce = armsUp ? Math.abs(Math.sin(f * 0.2 + seed)) * 4 : 0;
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(x - 5, y - 12 - bounce, 4, 12); ctx.fillRect(x + 1, y - 12 - bounce, 4, 12);
  ctx.fillStyle = c; ctx.fillRect(x - 7, y - 26 - bounce, 14, 15);
  ctx.fillStyle = ['#F2C9A0', '#C68642', '#8D5524'][seed % 3];
  ctx.beginPath(); ctx.arc(x, y - 33 - bounce, 6.5, 0, Math.PI * 2); ctx.fill();
  if (armsUp) { ctx.fillRect(x - 10, y - 38 - bounce, 3, 12); ctx.fillRect(x + 7, y - 38 - bounce, 3, 12); }
  else { ctx.fillRect(x - 10, y - 25 - bounce, 3, 10); ctx.fillRect(x + 7, y - 25 - bounce, 3, 10); }
  ctx.fillStyle = ['#1F2937', '#78350F', '#FDE68A'][seed % 3];
  ctx.fillRect(x - 6, y - 40 - bounce, 12, 4);
  if (seed % 2) { ctx.fillRect(x - 9, y - 37 - bounce, 3, 5); ctx.fillRect(x + 6, y - 37 - bounce, 3, 5); }
};

/**
 * One of the grown-ups on duty: Denise (scrubs, a clipboard, a whistle) or Gary (polo, khakis, a mug of coffee).
 * Calm, or panicking (hands on the head, mouth open) once they see what's coming.
 */
const adult = (ctx: Ctx, x: number, y: number, who: 0 | 1, panic: boolean, f: number) => {
  const hop = panic ? Math.abs(Math.sin(f * 0.35 + who)) * 3 : 0;
  const Y = y - hop;
  ctx.fillStyle = who === 0 ? '#0F766E' : '#A8A29E'; ctx.fillRect(x - 7, Y - 26, 6, 26); ctx.fillRect(x + 1, Y - 26, 6, 26); // legs
  ctx.fillStyle = '#1C1917'; ctx.fillRect(x - 8, Y - 3, 7, 3); ctx.fillRect(x + 1, Y - 3, 7, 3);
  ctx.fillStyle = who === 0 ? '#14B8A6' : '#1D4ED8'; ctx.fillRect(x - 10, Y - 50, 20, 26); // top
  const skin = who === 0 ? '#C68642' : '#F2C9A0';
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(x, Y - 57, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = who === 0 ? '#1F2937' : '#78716C'; ctx.fillRect(x - 8, Y - 66, 16, 5); // hair
  if (who === 0) { ctx.beginPath(); ctx.arc(x + 7, Y - 62, 4, 0, Math.PI * 2); ctx.fill(); } // (a bun)
  ctx.fillStyle = skin;
  if (panic) {
    // Hands on the head, mouth wide
    ctx.fillRect(x - 14, Y - 66, 4, 18); ctx.fillRect(x + 10, Y - 66, 4, 18);
    ctx.fillStyle = '#450A0A'; ctx.beginPath(); ctx.ellipse(x + 2, Y - 53, 2.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillRect(x - 13, Y - 48, 4, 18); ctx.fillRect(x + 9, Y - 48, 4, 16);
    if (who === 0) { ctx.fillStyle = '#A16207'; ctx.fillRect(x + 10, Y - 40, 10, 13); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + 11, Y - 38, 8, 10); ctx.fillStyle = '#FACC15'; ctx.fillRect(x - 2, Y - 46, 4, 3); } // clipboard, whistle
    else { ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + 10, Y - 36, 7, 8); ctx.fillStyle = 'rgba(203, 213, 225, 0.6)'; ctx.fillRect(x + 12, Y - 42 - (f % 20) / 5, 1, 4); } // coffee
    ctx.fillStyle = '#1F2937'; ctx.fillRect(x - 2, Y - 54, 5, 1);
  }
};

/** What's left of a grown-up after the wave: flattened into the lawn, a lot of red round them. */
const splatAdult = (ctx: Ctx, x: number, y: number, who: 0 | 1) => {
  // A fan of it sprayed up whatever's behind them, then the pool
  ctx.fillStyle = 'rgba(153, 27, 27, 0.85)';
  for (let k = 0; k < 9; k++) { const a = -Math.PI * (0.15 + 0.7 * k / 8), r = 30 + hash(x + k * 5) * 40; ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + Math.cos(a) * r - 3, y + Math.sin(a) * r); ctx.lineTo(x + Math.cos(a) * r + 3, y + Math.sin(a) * r); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 3, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.ellipse(x, y - 2, 52, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.ellipse(x - 6, y - 3, 34, 6, 0, 0, Math.PI * 2); ctx.fill();
  for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#991B1B' : '#DC2626'; ctx.beginPath(); ctx.arc(x - 50 + k * 20 + hash(x + k) * 8, y - 2 - hash(x * 3 + k) * 4, 2 + hash(k + x) * 3, 0, Math.PI * 2); ctx.fill(); }
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
const ADULT_AT = [310, -210], ADULT_PANIC = [-150, 150], ADULT_SPLAT = [-290, 420];

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
    // A cheerful little building: pastel walls, a big sun mural, a sign, a picket fence and a playground
    ctx.fillStyle = '#FDE68A'; ctx.fillRect(bx - 160, g - 170, 320, 170);
    ctx.fillStyle = '#F472B6'; ctx.beginPath(); ctx.moveTo(bx - 180, g - 170); ctx.lineTo(bx, g - 250); ctx.lineTo(bx + 180, g - 170); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FB923C'; ctx.beginPath(); ctx.arc(bx - 90, g - 110, 26, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#FB923C'; ctx.lineWidth = 3;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) { ctx.beginPath(); ctx.moveTo(bx - 90 + Math.cos(a) * 32, g - 110 + Math.sin(a) * 32); ctx.lineTo(bx - 90 + Math.cos(a) * 42, g - 110 + Math.sin(a) * 42); ctx.stroke(); }
    ctx.fillStyle = '#38BDF8'; ctx.fillRect(bx + 10, g - 90, 50, 90);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(bx + 80, g - 130, 50, 40); ctx.fillStyle = '#7DD3FC'; ctx.fillRect(bx + 84, g - 126, 42, 32);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(bx - 140, g - 210, 280, 30);
    ctx.fillStyle = '#DB2777'; ctx.font = 'bold 11px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('LITTLE SUNSHINE DAYCARE', bx, g - 190); ctx.textAlign = 'left';
    // Playground: swings, a slide, a sandbox
    const px = bx + 260;
    ctx.strokeStyle = '#EF4444'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(px, g); ctx.lineTo(px + 30, g - 110); ctx.lineTo(px + 60, g); ctx.moveTo(px + 30, g - 110); ctx.lineTo(px + 150, g - 110); ctx.moveTo(px + 120, g); ctx.lineTo(px + 150, g - 110); ctx.lineTo(px + 180, g); ctx.stroke();
    ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.moveTo(px - 160, g - 90); ctx.lineTo(px - 100, g); ctx.lineTo(px - 88, g); ctx.lineTo(px - 148, g - 90); ctx.fill();
    ctx.fillStyle = '#EF4444'; ctx.fillRect(px - 170, g - 90, 8, 90);
    ctx.fillStyle = '#FDE68A'; ctx.fillRect(bx - 300, g - 10, 90, 10);
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
    // Picket fence
    ctx.fillStyle = '#F8FAFC'; for (let x = bx - 380; x < bx + 480; x += 14) { ctx.fillRect(x, g - 34, 8, 34); ctx.beginPath(); ctx.moveTo(x, g - 34); ctx.lineTo(x + 4, g - 40); ctx.lineTo(x + 8, g - 34); ctx.fill(); }
    ctx.fillRect(bx - 380, g - 26, 860, 4);
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
  ctx.fillStyle = '#FDE68A';
  ctx.beginPath(); ctx.moveTo(bx - 190, g); ctx.lineTo(bx - 170, g - 50); ctx.lineTo(bx - 60, g - 70); ctx.lineTo(bx + 40, g - 40); ctx.lineTo(bx + 150, g - 60); ctx.lineTo(bx + 200, g); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#F472B6';
  ctx.save(); ctx.translate(bx - 20, g - 70); ctx.rotate(-0.25);
  ctx.beginPath(); ctx.moveTo(-160, 0); ctx.lineTo(0, -60); ctx.lineTo(150, 10); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#FFFFFF'; ctx.save(); ctx.translate(bx + 90, g - 30); ctx.rotate(0.5); ctx.fillRect(-80, -12, 160, 24);
  ctx.fillStyle = '#DB2777'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('LITTLE SUNSH', 0, 4); ctx.restore(); ctx.textAlign = 'left';
  // The junk the storm dropped
  ctx.fillStyle = '#2563EB'; ctx.save(); ctx.translate(bx - 60, g - 118); ctx.rotate(0.15); ctx.fillRect(-60, -18, 120, 30); ctx.fillStyle = '#93C5FD'; ctx.fillRect(-40, -14, 80, 10); ctx.restore();
  ctx.fillStyle = '#F8FAFC'; ctx.save(); ctx.translate(bx - 260, g - 10); ctx.rotate(-0.2); ctx.beginPath(); ctx.moveTo(-50, -20); ctx.lineTo(60, -20); ctx.lineTo(45, 6); ctx.lineTo(-40, 6); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#DC2626'; ctx.fillRect(-44, -10, 96, 3); ctx.restore();
  // The swing set, bent in half; a shark on the slide
  const px = bx + 260;
  ctx.strokeStyle = '#EF4444'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(px, g); ctx.lineTo(px + 40, g - 60); ctx.lineTo(px + 110, g - 30); ctx.lineTo(px + 160, g); ctx.stroke();
  ctx.fillStyle = '#64748B'; ctx.beginPath(); ctx.ellipse(px - 120, g - 40, 40, 12, 0.7, 0, Math.PI * 2); ctx.fill();
  // A couple of the Coast Guard, come down with the rest of it: one draped over the car on the roof, one head first in the sandbox
  deadCoastie(ctx, bx - 40, g - 140, 2.4, 0.3);
  ctx.save(); ctx.translate(bx - 255, g - 2); ctx.rotate(Math.PI); deadCoastie(ctx, 0, 0, 2.2, 0); ctx.restore();
  // The grown-ups, once the wave's done with them
  if (t < 0 || t >= RIDE_END) ADULT_SPLAT.forEach((dx, k) => splatAdult(ctx, bx + dx, g, k as 0 | 1));
  // Puddles
  ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
  for (let x = bx - 420; x < bx + 500; x += 90) { ctx.beginPath(); ctx.ellipse(x + hash(x) * 40, g - 1, 36, 4, 0, 0, Math.PI * 2); ctx.fill(); }
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
    const bottom = state.camera.y + (g - state.camera.y + 20) * k;
    const w = 260 + (t > 140 ? (t - 140) * 3 : 0);
    // (once it's hit, the tail end of it comes down after it and the sky's clear)
    const top = state.camera.y - 20 + (t > 140 ? Math.min(1, (t - 140) / 36) * (g - state.camera.y + 20) : 0);
    if (bottom > top) {
      ctx.fillStyle = 'rgba(37, 99, 235, 0.85)';
      ctx.fillRect(bx - w / 2, top, w, bottom - top);
      ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
      for (let i = 0; i < 12; i++) ctx.fillRect(bx - w / 2 + ((i * 37 + f * 9) % w), top + ((i * 53 + f * 21) % Math.max(1, bottom - top)), 6, 40);
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
