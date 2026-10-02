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
