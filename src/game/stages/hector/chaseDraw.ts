// The Coast Guard chase, drawn: the junk the hurricane's throwing (and the shadows of what's coming down), the cutter
// after him, its skipper's bubble, the HUD's how-close meter; the kill camera when they board him; and the cutter going
// up the storm after him, and not making it.

import type { GameState } from '../../core/state';
import type { Chase, Junk } from './chase';
import { junkSize, CHASE_BOAT_W, BOARD_LEAP, BOARD_BEAT, BOARD_LINE, BLOW, WRECK_BLAST, WRECK_RETURN, WRECK_SPLASH, WRECK_LEGS_LIT, dropAhead, DROP_WARN } from './chase';
import { drawSeatedAtMotor, drawFlung } from '../../render/player/moves';
import { inputDevice, padFamily } from '../../platform/device';
import { drawPadFace } from '../../render/padGlyph';
import { COURSE } from './course';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { INK, hash, lin, shape, speckle, blood, deadFace, flames } from '../../scenes/art/ink';

type Ctx = CanvasRenderingContext2D;

// ---------------------------------------------------------------------------
// In the world
// ---------------------------------------------------------------------------

/** One piece of junk: a crate, an oil drum, a car roof, a fridge, a porta-potty (floating); a lawn chair, a palm, a
 * flamingo, a shopping cart, a beach umbrella (flying); a piano, a jet ski, a cow, a car, a hot tub (coming down). */
const drawJunk = (ctx: Ctx, j: Junk) => {
  const { w, h } = junkSize(j);
  ctx.save(); ctx.translate(j.x, j.y - h / 2); ctx.rotate(j.rot);
  const x = -w / 2, y = -h / 2;
  if (j.kind === 'float') {
    switch (j.look) {
      case 0: shape(ctx, () => ctx.rect(x, y, w, h), '#A16207', 1.2); ctx.strokeStyle = '#713F12'; ctx.lineWidth = 2; ctx.strokeRect(x + 4, y + 4, w - 8, h - 8); ctx.beginPath(); ctx.moveTo(x + 4, y + 4); ctx.lineTo(x + w - 4, y + h - 4); ctx.stroke(); break;
      case 1: shape(ctx, () => ctx.rect(x + 6, y - 6, w - 12, h + 6), '#1D4ED8', 1.2); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + 6, y + 4, w - 12, 3); ctx.fillStyle = '#FDE047'; ctx.font = 'bold 6px "Courier New", monospace'; ctx.fillText('OIL', x + 16, y + 14); break;
      case 2: shape(ctx, () => ctx.roundRect(x - 6, y + 4, w + 12, h - 4, 8), '#DC2626', 1.2); ctx.fillStyle = '#93C5FD'; ctx.fillRect(x + 6, y + 8, w - 12, 6); break;
      case 3: shape(ctx, () => ctx.rect(x + 4, y - 10, w - 8, h + 10), '#F1F5F9', 1.2); ctx.fillStyle = '#94A3B8'; ctx.fillRect(x + 8, y - 4, 3, 10); ctx.fillRect(x + 4, y + 8, w - 8, 1.5); break;
      default: shape(ctx, () => ctx.rect(x + 8, y - 14, w - 16, h + 14), '#2563EB', 1.2); ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(0, y - 4, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-2, y + 4, 4, h - 2);
    }
  } else if (j.kind === 'flyer') {
    switch (j.look) {
      case 0: ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(x, y + 6, w, 4); ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 2; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(x + 4 + k * 8, y); ctx.lineTo(x + 4 + k * 8, y + h); ctx.stroke(); } ctx.strokeStyle = '#3B82F6'; ctx.beginPath(); ctx.moveTo(x, y + 8); ctx.lineTo(x + w, y + 8); ctx.stroke(); break;
      case 1: shape(ctx, () => ctx.rect(-3, y, 6, h), '#92400E', 1); ctx.fillStyle = '#15803D'; for (let k = 0; k < 6; k++) { ctx.save(); ctx.rotate(k * 1.05); shape(ctx, () => ctx.ellipse(14, y, 16, 4, 0, 0, Math.PI * 2), '#16A34A', 0.6); ctx.restore(); } break;
      case 2: shape(ctx, () => ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2), '#F472B6', 1); shape(ctx, () => ctx.ellipse(16, -12, 5, 5, 0, 0, Math.PI * 2), '#F472B6', 0.8); ctx.strokeStyle = '#F472B6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(10, -4); ctx.lineTo(16, -10); ctx.stroke(); ctx.fillStyle = INK; ctx.fillRect(20, -13, 6, 2); break;
      case 3: ctx.strokeStyle = '#A1A1AA'; ctx.lineWidth = 2; ctx.strokeRect(x + 2, y, w - 6, h - 10); for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(x + 2 + k * 8, y); ctx.lineTo(x + 2 + k * 8, y + h - 10); ctx.stroke(); } ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x + 8, y + h - 4, 3, 0, Math.PI * 2); ctx.arc(x + w - 10, y + h - 4, 3, 0, Math.PI * 2); ctx.fill(); break;
      default: for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#F8FAFC' : '#EF4444'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 22, Math.PI + k * Math.PI / 6, Math.PI + (k + 1) * Math.PI / 6); ctx.fill(); } ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 22, Math.PI, 0); ctx.stroke(); ctx.fillStyle = INK; ctx.fillRect(-1, 0, 2, 18);
    }
  } else {
    switch (j.look) {
      case 0: shape(ctx, () => ctx.rect(x, y, w, h * 0.6), '#111827', 1.2); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + 4, y + h * 0.42, w - 8, 6); ctx.fillStyle = INK; for (let k = 0; k < 9; k++) ctx.fillRect(x + 6 + k * 6.5, y + h * 0.42, 3, 4); ctx.fillStyle = '#111827'; ctx.fillRect(x + 4, y + h * 0.6, 4, h * 0.4); ctx.fillRect(x + w - 8, y + h * 0.6, 4, h * 0.4); break;
      case 1: shape(ctx, () => { ctx.moveTo(x, y + h * 0.5); ctx.lineTo(x + w, y + h * 0.3); ctx.lineTo(x + w - 6, y + h); ctx.lineTo(x + 4, y + h); ctx.closePath(); }, '#FACC15', 1.2); ctx.fillStyle = INK; ctx.fillRect(x + w * 0.4, y + h * 0.1, 4, h * 0.4); break;
      case 2: shape(ctx, () => ctx.ellipse(0, 0, w / 2, h / 3, 0, 0, Math.PI * 2), '#F8FAFC', 1.2); ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(-10, -4, 8, 5, 0, 0, Math.PI * 2); ctx.ellipse(12, 6, 6, 4, 0, 0, Math.PI * 2); ctx.fill(); for (const lx of [-20, -8, 8, 20]) shape(ctx, () => ctx.rect(lx, h / 4, 4, 14), '#F8FAFC', 0.8); shape(ctx, () => ctx.ellipse(w / 2, -8, 9, 7, 0, 0, Math.PI * 2), '#F8FAFC', 1); ctx.fillStyle = '#FDA4AF'; ctx.fillRect(w / 2 + 4, -6, 6, 4); break;
      case 3: shape(ctx, () => ctx.roundRect(x, y + h * 0.3, w, h * 0.45, 6), '#2563EB', 1.2); shape(ctx, () => ctx.roundRect(x + 12, y, w - 26, h * 0.4, 6), '#2563EB', 1.2); ctx.fillStyle = '#93C5FD'; ctx.fillRect(x + 16, y + 4, w - 34, h * 0.24); for (const wx of [x + 14, x + w - 14]) shape(ctx, () => ctx.arc(wx, y + h * 0.78, 7, 0, Math.PI * 2), INK, 0); break;
      default: shape(ctx, () => ctx.roundRect(x, y + h * 0.2, w, h * 0.8, 8), '#78350F', 1.2); ctx.fillStyle = '#38BDF8'; ctx.fillRect(x + 4, y + h * 0.24, w - 8, 8); ctx.fillStyle = '#F8FAFC'; for (let k = 0; k < 6; k++) ctx.fillRect(x + 6 + k * 10, y + h * 0.18, 4, 4);
    }
  }
  ctx.restore();
};

/** The cutter: a white hull with the orange slash and COAST GUARD down it, the cabin, the light bar flashing, the skipper on the bow with his loudhailer. */
const drawCutter = (ctx: Ctx, bow: number, y: number, frame: number, rot = 0) => {
  const L = 210;
  ctx.save(); ctx.translate(bow, y); ctx.rotate(rot);
  shape(ctx, () => { ctx.moveTo(0, -30); ctx.lineTo(-L, -34); ctx.lineTo(-L + 10, 8); ctx.lineTo(-24, 8); ctx.closePath(); }, lin(ctx, -34, 8, [[0, '#F8FAFC'], [1, '#CBD5E1']]), 1.4);
  ctx.save(); ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(-L, -34); ctx.lineTo(-L + 10, 8); ctx.lineTo(-24, 8); ctx.closePath(); ctx.clip();
  ctx.fillStyle = '#EA580C'; ctx.beginPath(); ctx.moveTo(-70, -34); ctx.lineTo(-54, -34); ctx.lineTo(-74, 8); ctx.lineTo(-90, 8); ctx.fill();
  ctx.fillStyle = '#1D4ED8'; ctx.beginPath(); ctx.moveTo(-50, -34); ctx.lineTo(-46, -34); ctx.lineTo(-66, 8); ctx.lineTo(-70, 8); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#1E293B'; ctx.font = 'bold 9px "Courier New", monospace'; ctx.fillText('COAST GUARD', -186, -12);
  ctx.fillText('714', -40, -12);
  // (the cabin, the light bar)
  shape(ctx, () => ctx.rect(-150, -70, 70, 38), '#F1F5F9', 1.2);
  ctx.fillStyle = '#0F172A'; ctx.fillRect(-144, -64, 58, 12);
  const on = Math.floor(frame / 6) % 2;
  ctx.fillStyle = on ? '#3B82F6' : '#1E3A8A'; ctx.fillRect(-140, -78, 14, 8);
  ctx.fillStyle = on ? '#B91C1C' : '#EF4444'; ctx.fillRect(-122, -78, 14, 8);
  if (on) { ctx.fillStyle = 'rgba(59, 130, 246, 0.25)'; ctx.beginPath(); ctx.arc(-133, -74, 30, 0, Math.PI * 2); ctx.fill(); }
  // (the skipper on the bow: orange vest, the white cap, his loudhailer up)
  shape(ctx, () => ctx.rect(-40, -66, 16, 32), '#F97316', 1);
  shape(ctx, () => ctx.arc(-32, -74, 8, 0, Math.PI * 2), '#E8B495', 1);
  shape(ctx, () => ctx.rect(-41, -84, 18, 6), '#F8FAFC', 0.8);
  shape(ctx, () => { ctx.moveTo(-24, -74); ctx.lineTo(-8, -82); ctx.lineTo(-8, -64); ctx.closePath(); }, '#F8FAFC', 1);
  // (one more of them in the stern, ready: the crew's two, the skipper and him)
  for (const cx of [-184]) { shape(ctx, () => ctx.rect(cx, -60, 12, 26), '#F97316', 0.8); shape(ctx, () => ctx.arc(cx + 6, -66, 6, 0, Math.PI * 2), '#1E3A8A', 0.8); }
  ctx.restore();
};

// ---------------------------------------------------------------------------
// The hints: which button does what, on whatever's in use
// ---------------------------------------------------------------------------

/** A button, drawn: the jump button (the bottom face button on a pad, Space on the keyboard), or left or right (the
 * d-pad, or the arrow keys). Centred on (x, y). Returns its width. */
const drawButton = (ctx: Ctx, x: number, y: number, which: 'jump' | 'left' | 'right') => {
  const pad = inputDevice() === 'pad';
  ctx.save();
  ctx.font = '7px "Press Start 2P"'; ctx.textAlign = 'center';
  if (which === 'jump') {
    if (pad) {
      // (the bottom face button, as this controller has it printed)
      drawPadFace(ctx, x, y, 8, 'A', padFamily());
      ctx.restore(); return 18;
    }
    ctx.fillStyle = '#E4E4E7'; ctx.beginPath(); ctx.roundRect(x - 22, y - 7, 44, 14, 2); ctx.fill();
    ctx.strokeStyle = '#52525B'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#18181B'; ctx.fillText('SPACE', x, y + 3.5);
    ctx.restore(); return 46;
  }
  const d = which === 'left' ? -1 : 1;
  if (pad) {
    // (the d-pad, the one side of it lit)
    ctx.fillStyle = '#27272A'; ctx.fillRect(x - 3, y - 9, 6, 18); ctx.fillRect(x - 9, y - 3, 18, 6);
    ctx.fillStyle = '#FDE047'; ctx.beginPath(); ctx.moveTo(x + d * 9, y); ctx.lineTo(x + d * 4, y - 3.5); ctx.lineTo(x + d * 4, y + 3.5); ctx.fill();
  } else {
    ctx.fillStyle = '#E4E4E7'; ctx.beginPath(); ctx.roundRect(x - 8, y - 7, 16, 14, 2); ctx.fill();
    ctx.strokeStyle = '#52525B'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#18181B'; ctx.beginPath(); ctx.moveTo(x + d * 4, y); ctx.lineTo(x - d * 2, y - 4); ctx.lineTo(x - d * 2, y + 4); ctx.fill();
  }
  ctx.restore(); return 20;
};

/** Meathead sat at the back of the boat, both fists on the outboard's tiller: no gun. (x, y) is where he's sat. */
export const drawSeatedMeathead = (ctx: Ctx, x: number, y: number, frame: number, hurt: boolean) => {
  ctx.save(); ctx.translate(x, y + Math.sin(frame * 0.3) * 0.6);
  if (hurt && Math.floor(frame / 3) % 2) ctx.globalAlpha = 0.5;
  drawSeatedAtMotor(ctx, frame, hurt);
  ctx.restore();
};

/** Wrecked: him flung up out of it end over end and gone off the top of the screen; then the boat going up, its bits
 * coming down all round, the outboard cartwheeling off, the smoke; the name board floating. And him, back down out of
 * the sky, head first into the sea by it: his legs up out of the water, twitching, till the burning slick gets to them. */
export const drawWreck = (ctx: Ctx, state: GameState, c: Chase, bx: number, by: number) => {
  const t = c.wreckT;
  // Him: up and away (he's drawn till he's well off the top)
  const mx = bx + 30 + t * 7, my = by - 50 - t * 22 + t * t * 0.16;
  if (my > state.camera.y - 120) {
    ctx.save(); ctx.translate(mx, my); ctx.rotate(t * 0.32); ctx.scale(1.05, 1.05);
    drawFlung(ctx, state.frame);
    ctx.restore();
    // (a streak after him)
    ctx.strokeStyle = 'rgba(241, 245, 249, 0.5)'; ctx.lineWidth = 2;
    for (let k = 1; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(mx - 10 - k * 9, my + 30 + k * 16); ctx.lineTo(mx - 4 - k * 6, my + 16 + k * 12); ctx.stroke(); }
  }
  // Before it goes: smoking where it was hit, a lick of fire at the stern
  if (t < WRECK_BLAST) {
    for (let k = 0; k < 4; k++) { const u = (t * 2 + k * 9) % 30; ctx.fillStyle = `rgba(55, 65, 81, ${0.6 - u / 60})`; ctx.beginPath(); ctx.arc(bx + 40 + k * 18 + u * 0.6, by - 30 - u * 2, 6 + u * 0.4, 0, Math.PI * 2); ctx.fill(); }
    if (t > 8) flames(ctx, bx + 20, by - 20, 24, 8 + (t - 8), Math.floor(state.frame / 4));
    return;
  }
  const u = t - WRECK_BLAST, cx = bx + CHASE_BOAT_W / 2, cy = by - 14;
  // The smoke: a black column, leaning off in the wind
  for (let k = 0; k < 10; k++) {
    const a = Math.max(0, u - 6 - k * 2);
    if (!a) continue;
    const sx = cx - 20 + hash(k) * 40 - a * 0.8, sy = cy - 30 - a * 2.4 - k * 6, sr = 14 + a * 0.5 + hash(k * 3) * 8;
    ctx.fillStyle = k % 2 ? 'rgba(31, 41, 55, 0.7)' : 'rgba(17, 24, 39, 0.75)';
    ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
  }
  // The fireball: banded, white in the middle to red and black at the edge, swelling then breaking up into smoke
  if (u < 40) {
    const r = 26 + Math.min(1, u / 8) * 60 - Math.max(0, u - 20) * 1.2;
    const ramp = ['#450A0A', '#991B1B', '#DC2626', '#F97316', '#FACC15', '#FEF9C3'];
    for (let i = 0; i < ramp.length; i++) {
      const rr = r * (1 - i * 0.15) * (u > 20 ? 1 - (u - 20) / 40 : 1);
      if (rr <= 0) continue;
      ctx.fillStyle = ramp[i];
      ctx.beginPath();
      for (let p = 0; p <= 16; p++) { const an = (p / 16) * Math.PI * 2, wob = 1 + (hash(p + i * 17 + Math.floor(u / 3)) - 0.5) * 0.25; const px = cx + Math.cos(an) * rr * wob, py = cy - rr * 0.35 + Math.sin(an) * rr * 0.8 * wob; if (p) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
      ctx.fill();
    }
    if (u < 4) { ctx.fillStyle = `rgba(255, 255, 255, ${0.6 - u * 0.15})`; ctx.fillRect(state.camera.x, state.camera.y, CANVAS_WIDTH, CANVAS_HEIGHT); }
  }
  // The bits of it: planks of hull, the red stripe, the windshield, up and coming down into the water
  for (let i = 0; i < 12; i++) {
    const vx = (hash(i * 5) - 0.5) * 14, vy = -10 - hash(i * 7) * 12;
    const px = cx + vx * u, py = cy + vy * u + 0.45 * u * u;
    if (py > COURSE.sea.y + 10) continue;
    ctx.save(); ctx.translate(px, py); ctx.rotate(u * (0.2 + hash(i) * 0.3) * (i % 2 ? 1 : -1));
    shape(ctx, () => ctx.rect(-10 - hash(i * 2) * 8, -3, 20 + hash(i * 2) * 16, 6), i % 4 === 0 ? '#DC2626' : i % 4 === 1 ? '#93C5FD' : '#F1F5F9', 0.8);
    ctx.restore();
  }
  // The outboard, cartwheeling off the back, still going
  { const px = bx - 10 - u * 5, py = cy - u * 15 + 0.45 * u * u;
    if (py < COURSE.sea.y + 10) { ctx.save(); ctx.translate(px, py); ctx.rotate(-u * 0.35); shape(ctx, () => ctx.rect(-8, -14, 16, 26), '#374151', 1); ctx.fillStyle = '#6B7280'; ctx.fillRect(-3, 10, 6, 14); ctx.restore(); } }
  // Him, coming back down: head first, into the water, his legs up out of it
  if (t >= WRECK_RETURN) {
    const lx = Math.min(cx + 150, state.camera.x + CANVAS_WIDTH - 80), sea = COURSE.sea.y;
    const k = Math.min(1, (t - WRECK_RETURN) / (WRECK_SPLASH - WRECK_RETURN));
    const my = t < WRECK_SPLASH ? state.camera.y - 60 + (sea - 12 - state.camera.y + 60) * k * k : sea + 4 + Math.max(0, t - WRECK_LEGS_LIT - 20) * 0.5;
    ctx.save(); ctx.beginPath(); ctx.rect(lx - 80, state.camera.y - 100, 160, sea + 2 - state.camera.y + 100); ctx.clip();
    ctx.translate(lx, my); ctx.rotate(Math.PI + (t >= WRECK_SPLASH ? Math.sin(t * 0.6) * 0.05 * (t < WRECK_LEGS_LIT + 30 ? 1 : 0) : Math.sin(t * 0.3) * 0.3));
    drawFlung(ctx, t >= WRECK_SPLASH && t % 30 > 4 ? 0 : state.frame);
    ctx.restore();
    const sp = t - WRECK_SPLASH;
    if (sp >= 0 && sp < 24) { ctx.strokeStyle = `rgba(241, 245, 249, ${0.8 * (1 - sp / 24)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(lx, sea, 10 + sp * 3, 3 + sp * 0.4, 0, 0, Math.PI * 2); ctx.stroke(); for (let k2 = 0; k2 < 6; k2++) { ctx.fillStyle = '#E0F2FE'; ctx.fillRect(lx + (k2 - 2.5) * 7, sea - 4 - Math.sin((k2 + 1) * 1.3) * 22 * Math.max(0, 1 - sp / 10), 3, 3); } }
    // (the slick burning its way across to him, and up his legs)
    if (t > WRECK_LEGS_LIT - 30) { const reach = Math.min(1, (t - WRECK_LEGS_LIT + 30) / 30); flames(ctx, cx + 30 + (lx - cx - 30) * reach, sea, 26, 14, Math.floor(state.frame / 4) + 3); }
    if (t >= WRECK_LEGS_LIT) flames(ctx, lx, sea - 4, 22, 30, Math.floor(state.frame / 4) + 11);
  }
  // Afterwards: the slick burning on the water, and the name board bobbing
  if (u > 30) {
    flames(ctx, cx - 40, COURSE.sea.y, 40, 22, Math.floor(state.frame / 4));
    flames(ctx, cx + 30, COURSE.sea.y, 30, 16, Math.floor(state.frame / 4) + 7);
    ctx.save(); ctx.translate(cx + 10, COURSE.sea.y - 4 + Math.sin(state.frame * 0.1) * 2); ctx.rotate(0.15);
    shape(ctx, () => ctx.rect(-28, -6, 56, 12), '#F8FAFC', 0.8);
    ctx.fillStyle = '#111827'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('LIL BASS', 0, 3); ctx.textAlign = 'left';
    ctx.restore();
  }
};

/**
 * Where what's coming down will land, if he keeps going as he is: over the boat (it's drawn over it), a ring on the
 * water and a column of red light up from it, the way the lightning gives itself away on the beach, filling in as it
 * comes; it slides back along the boat as he speeds up and forward as he eases off, and it's exact when it lands.
 */
export const drawDropMarks = (ctx: Ctx, state: GameState, c: Chase) => {
  for (const j of c.junk) {
    if (j.kind !== 'drop' || j.warn <= 0) continue;
    const k = 1 - j.warn / DROP_WARN;
    const mx = c.boatX + CHASE_BOAT_W / 2 + dropAhead(c, j), my = COURSE.sea.y + 2;
    const blink = 0.55 + 0.45 * Math.abs(Math.floor(j.warn / 4) % 2);
    ctx.save();
    ctx.fillStyle = `rgba(239, 68, 68, ${(0.1 + k * 0.25) * blink})`; ctx.fillRect(mx - 22, my - 260 * k, 44, 260 * k);
    ctx.strokeStyle = `rgba(248, 113, 113, ${0.6 + 0.4 * blink})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(mx, my, 32 - k * 8, 8 - k * 2, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = `rgba(2, 6, 23, ${0.2 + k * 0.45})`; ctx.beginPath(); ctx.ellipse(mx, my, 18 + k * 10, 4 + k * 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
};

/** In the world, behind and around him: the junk, the cutter after him (the marks for what's coming down go over the boat: drawDropMarks). */
export const drawChaseWorld = (ctx: Ctx, state: GameState, c: Chase) => {
  for (const j of c.junk) drawJunk(ctx, j);
  // The cutter (on the water, or up the spout after him)
  const y = COURSE.boat.y + Math.sin(state.frame * 0.1) * 2 - c.cgLift;
  if (c.cgX > state.camera.x - 40 && c.cgX - 220 < state.camera.x + CANVAS_WIDTH) {
    drawCutter(ctx, c.cgX, y, state.frame, c.cgLift > 0 ? Math.sin(c.cgSpin) * 0.4 : 0);
    // (the bow wave)
    if (!c.cgLift) for (let k = 0; k < 3; k++) { ctx.fillStyle = 'rgba(224, 242, 254, 0.7)'; ctx.beginPath(); ctx.arc(c.cgX - 6 - k * 8, COURSE.sea.y + 2 - k * 3, 6 - k, 0, Math.PI * 2); ctx.fill(); }
    if (c.hailT > 0 && c.hail) {
      ctx.font = 'bold 8px "Press Start 2P"';
      const w = Math.min(380, ctx.measureText(c.hail).width + 14), bx = Math.max(state.camera.x + w / 2 + 6, c.cgX - 30), by = y - 98;
      ctx.fillStyle = '#F8FAFC'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
      ctx.fillRect(bx - w / 2, by - 22, w, 20); ctx.strokeRect(bx - w / 2, by - 22, w, 20);
      ctx.fillStyle = '#111827'; ctx.textAlign = 'center'; ctx.fillText(c.hail, bx, by - 8, w - 8); ctx.textAlign = 'left';
    }
  }
};

/** The HUD: how close the cutter is (a bar along the top, filling as it closes in), and an arrow at the edge when it's
 * off the screen; and along the bottom, the controls (it's just the motor and the jump). */
export const drawChaseHud = (ctx: Ctx, state: GameState, c: Chase, boatX: number) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fillRect(170, 560, 460, 30);
  ctx.font = 'bold 8px "Press Start 2P"'; ctx.fillStyle = '#F8FAFC'; ctx.textAlign = 'left';
  drawButton(ctx, 196, 575, 'left'); ctx.fillText('SLOW', 210, 579);
  drawButton(ctx, 270, 575, 'right'); ctx.fillText('FAST', 284, 579);
  const jw = drawButton(ctx, 360 + 12, 575, 'jump'); ctx.fillText('JUMP', 360 + 12 + jw / 2 + 6, 579);
  ctx.fillStyle = '#A1A1AA'; ctx.fillText('NO GUN: BOTH HANDS ON THE MOTOR', 470, 579, 155);
  ctx.restore();
  const gap = Math.max(0, boatX - c.cgX);
  const k = 1 - Math.min(1, gap / 640);
  // (top right: clear of the main HUD, which takes the top left)
  const x = 476, y = 40, w = 300;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x - 4, y - 16, w + 8, 30);
  ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillStyle = gap < 200 && Math.floor(state.frame / 8) % 2 ? '#EF4444' : '#F8FAFC';
  ctx.fillText(gap < 200 ? 'COAST GUARD: RIGHT BEHIND YOU' : 'COAST GUARD', x + w / 2, y - 5);
  ctx.fillStyle = '#1F2937'; ctx.fillRect(x, y, w, 8);
  ctx.fillStyle = k < 0.5 ? '#FACC15' : k < 0.75 ? '#F97316' : '#EF4444'; ctx.fillRect(x, y, w * k, 8);
  ctx.fillStyle = '#EA580C'; ctx.fillRect(x - 2, y - 2, 4, 12);
  ctx.textAlign = 'left';
  // (off the left of the screen: an arrow, flashing as it closes)
  if (c.cgX < state.camera.x) {
    ctx.fillStyle = Math.floor(state.frame / (gap < 260 ? 5 : 12)) % 2 ? '#EA580C' : '#F8FAFC';
    ctx.beginPath(); ctx.moveTo(10, 330); ctx.lineTo(30, 316); ctx.lineTo(30, 344); ctx.fill();
  }
  ctx.restore();
};

// ---------------------------------------------------------------------------
// The kill camera: boarded
// ---------------------------------------------------------------------------

const W = 256, H = 144;

/** Stepped bands down an area, top color to bottom (the SNES way). */
const bands = (ctx: Ctx, x: number, y: number, w: number, h: number, ramp: string[]) => {
  for (let i = 0; i < ramp.length; i++) { ctx.fillStyle = ramp[i]; ctx.fillRect(x, y + (h * i) / ramp.length, w, h / ramp.length + 0.5); }
};

/** Rain driving across the picture, two layers of it. */
const rain = (ctx: Ctx, t: number) => {
  for (const [n, len, alpha, sp] of [[60, 9, 0.35, 9], [30, 14, 0.5, 13]] as const) {
    ctx.strokeStyle = `rgba(203, 213, 225, ${alpha})`; ctx.lineWidth = 0.5;
    for (let i = 0; i < n; i++) { const x = (hash(i * 1.7 + len) * 320 + t * sp * 0.6) % 320 - 30, y = (hash(i * 3.1 + len) * 170 + t * sp) % 170 - 14; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - len * 0.45, y + len); ctx.stroke(); }
  }
};

/** The storm: the sky in bands, clouds rolling over in lumps, Miami's towers dark on the horizon, lightning now and then. */
const stormSky = (ctx: Ctx, t: number, horizon: number) => {
  bands(ctx, 0, 0, W, horizon, ['#0B1120', '#111A2E', '#18233A', '#1F2C45', '#273650', '#2E3F5C']);
  for (let row = 0; row < 3; row++) for (let k = -1; k < 8; k++) {
    const cx = k * 40 + ((t * (0.3 + row * 0.2)) % 40), cy = 10 + row * 16;
    ctx.fillStyle = ['#1A2338', '#222D46', '#2A3754'][row];
    ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.arc(cx + 18, cy + 4, 13, 0, Math.PI * 2); ctx.arc(cx - 16, cy + 5, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(148, 163, 184, 0.12)'; ctx.beginPath(); ctx.arc(cx - 3, cy - 6, 10, Math.PI, 0); ctx.fill();
  }
  // (the towers)
  for (let k = 0; k < 14; k++) {
    const bx = k * 19 + hash(k) * 6, bh = 12 + hash(k * 3) * 26;
    ctx.fillStyle = '#0F172A'; ctx.fillRect(bx, horizon - bh, 14, bh);
    for (let r = 0; r < bh / 4 - 1; r++) for (let c = 0; c < 3; c++) if (hash(k * 31 + r * 7 + c) > 0.82) { ctx.fillStyle = '#FDE68A'; ctx.fillRect(bx + 2 + c * 4, horizon - bh + 2 + r * 4, 1.4, 1.4); }
  }
  // (lightning: a bolt, and the flash with it)
  const cycle = t % 120;
  if (cycle < 6) {
    ctx.fillStyle = `rgba(226, 232, 240, ${0.35 - cycle * 0.05})`; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 1.4; ctx.beginPath();
    let x = 180 + hash(Math.floor(t / 120)) * 60, y = 0; ctx.moveTo(x, y);
    while (y < horizon) { x += (hash(x + y) - 0.5) * 14; y += 6 + hash(y) * 6; ctx.lineTo(x, y); }
    ctx.stroke();
  }
};

/** The sea: the swell in bands, rolling, whitecaps on it, foam. */
const sea = (ctx: Ctx, y0: number, t: number) => {
  bands(ctx, 0, y0, W, H - y0, ['#3B5068', '#324660', '#2A3C55', '#22334B', '#1B2A40', '#142134']);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)'; ctx.lineWidth = 0.7;
  for (let k = 0; k < 9; k++) {
    const sy = y0 + 3 + k * ((H - y0) / 9);
    ctx.beginPath(); for (let x = -10; x < W + 10; x += 5) ctx.lineTo(x, sy + Math.sin(x * 0.07 + t * 0.14 + k * 1.3) * (1 + k * 0.25)); ctx.stroke();
  }
  for (let i = 0; i < 16; i++) { const x = (hash(i) * 280 + t * (1 + hash(i * 2))) % 280 - 12, y = y0 + 4 + hash(i * 5) * (H - y0 - 8); ctx.fillStyle = 'rgba(241, 245, 249, 0.7)'; ctx.fillRect(x, y, 4 + hash(i) * 6, 1); ctx.fillRect(x + 1, y - 1, 2, 1); }
};

/** The light bar's wash over everything: blue, red, blue, red. */
const lightWash = (ctx: Ctx, t: number, strength: number) => {
  const on = Math.floor(t / 6) % 2;
  ctx.fillStyle = on ? `rgba(59, 130, 246, ${strength})` : `rgba(239, 68, 68, ${strength})`;
  ctx.fillRect(0, 0, W, H);
};

/** A coastie: navy trousers and boots, the orange float coat (shaded, its reflective strip), a blue helmet with its
 * visor, a hard face, a nightstick (arm up, or swinging). */
const coastie = (ctx: Ctx, x: number, y: number, s: number, arm: number | 'crossed', flip = 1) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * flip, s);
  // (legs, boots)
  shape(ctx, () => ctx.rect(-5, -4, 4.4, 14), '#1E3A8A', 0.6); shape(ctx, () => ctx.rect(0.6, -4, 4.4, 14), '#1E3A8A', 0.6);
  ctx.fillStyle = '#172554'; ctx.fillRect(-5, 2, 1.4, 8); ctx.fillRect(0.6, 2, 1.4, 8);
  shape(ctx, () => ctx.roundRect(-6, 9, 6, 3, 1), '#0A0A0A', 0.5); shape(ctx, () => ctx.roundRect(0, 9, 6, 3, 1), '#0A0A0A', 0.5);
  // (the coat: three oranges, the strip, the collar)
  ctx.save(); ctx.beginPath(); ctx.roundRect(-8, -24, 16, 22, 3); ctx.clip();
  bands(ctx, -8, -24, 16, 22, ['#FDBA74', '#FB923C', '#F97316', '#EA580C', '#C2410C']);
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-8, -14, 16, 2.4); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(-8, -14, 16, 0.7);
  ctx.fillStyle = 'rgba(124, 45, 18, 0.5)'; ctx.fillRect(-0.4, -22, 0.8, 20);
  ctx.restore();
  ctx.beginPath(); ctx.roundRect(-8, -24, 16, 22, 3); ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.stroke();
  // (the head: jaw set, a mustache, the helmet and its visor glinting)
  shape(ctx, () => ctx.roundRect(-5, -36, 10, 11, 3), '#E8B495', 0.8);
  ctx.fillStyle = '#C68B5E'; ctx.fillRect(-5, -28, 10, 2);
  ctx.fillStyle = '#3F2A1D'; ctx.fillRect(-2.6, -29.4, 6, 1.4);
  ctx.fillStyle = INK; ctx.fillRect(0.4, -32.4, 1.4, 1.2); ctx.fillRect(3.2, -32.4, 1.4, 1.2);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(-0.2, -34); ctx.lineTo(2, -33.4); ctx.moveTo(5, -34); ctx.lineTo(3, -33.4); ctx.stroke();
  shape(ctx, () => { ctx.arc(0, -36, 6.6, Math.PI, 0); ctx.closePath(); }, '#1D4ED8', 0.7);
  ctx.fillStyle = '#60A5FA'; ctx.fillRect(-3.6, -41, 3, 1);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'; ctx.fillRect(-0.5, -36.4, 7, 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; ctx.fillRect(4, -36.2, 1.4, 0.8);
  // (arms folded, chin up, the nightstick tucked under one of them)
  if (arm === 'crossed') {
    shape(ctx, () => ctx.roundRect(-12, -22, 7, 3.2, 1.4), '#18181B', 0.5);
    shape(ctx, () => ctx.roundRect(-9, -19, 18, 4.4, 2), '#EA580C', 0.6);
    shape(ctx, () => ctx.roundRect(-9, -16.4, 18, 4.4, 2), '#F97316', 0.6);
    shape(ctx, () => ctx.arc(8, -17, 2.4, 0, Math.PI * 2), '#E8B495', 0.5);
    shape(ctx, () => ctx.arc(-8, -14.4, 2.4, 0, Math.PI * 2), '#E8B495', 0.5);
    ctx.restore();
    return;
  }
  // (the arm and the nightstick)
  ctx.save(); ctx.translate(7, -20); ctx.rotate(-1.2 + arm);
  shape(ctx, () => ctx.roundRect(0, -2.4, 11, 4.8, 2), '#F97316', 0.6);
  shape(ctx, () => ctx.arc(11.5, 0, 2.6, 0, Math.PI * 2), '#E8B495', 0.5);
  shape(ctx, () => ctx.roundRect(10, -1.6, 17, 3.2, 1.4), '#18181B', 0.6);
  ctx.fillStyle = 'rgba(148, 163, 184, 0.6)'; ctx.fillRect(14, -1.2, 11, 0.7);
  ctx.restore();
  ctx.restore();
};

/** Meathead's boat from the side: white, shaded, the red stripe, LIL BASS, the outboard. */
const lilBass = (ctx: Ctx, x: number, y: number) => {
  const hull = () => { ctx.moveTo(x, y - 14); ctx.lineTo(x + 92, y - 16); ctx.lineTo(x + 80, y + 6); ctx.lineTo(x + 6, y + 6); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); hull(); ctx.clip();
  bands(ctx, x, y - 16, 92, 22, ['#FFFFFF', '#F1F5F9', '#E2E8F0', '#CBD5E1', '#94A3B8']);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(x, y - 5, 92, 2.4); ctx.fillStyle = '#991B1B'; ctx.fillRect(x, y - 2.6, 92, 0.8);
  ctx.restore();
  ctx.beginPath(); hull(); ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.stroke();
  ctx.fillStyle = '#1E293B'; ctx.font = 'bold 5px "Courier New", monospace'; ctx.fillText('LIL BASS', x + 30, y - 8);
  shape(ctx, () => ctx.rect(x - 8, y - 18, 9, 14), '#374151', 0.8);
  ctx.fillStyle = '#4B5563'; ctx.fillRect(x - 7, y - 17, 2, 12);
};

/** The cutter, side on, big: the hull in bands, the orange and blue slash, U.S. COAST GUARD, the cabin and its windows,
 * the radar mast, the light bar going, its glow. (Its bow at x.) */
const bigCutter = (ctx: Ctx, x: number, y: number, t: number) => {
  const hull = () => { ctx.moveTo(x, y - 34); ctx.lineTo(x - 150, y - 38); ctx.lineTo(x - 142, y + 8); ctx.lineTo(x - 18, y + 8); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); hull(); ctx.clip();
  bands(ctx, x - 152, y - 40, 154, 48, ['#FFFFFF', '#F8FAFC', '#E2E8F0', '#CBD5E1', '#94A3B8', '#64748B']);
  ctx.fillStyle = '#EA580C'; ctx.beginPath(); ctx.moveTo(x - 46, y - 40); ctx.lineTo(x - 32, y - 40); ctx.lineTo(x - 52, y + 10); ctx.lineTo(x - 66, y + 10); ctx.fill();
  ctx.fillStyle = '#1D4ED8'; ctx.beginPath(); ctx.moveTo(x - 29, y - 40); ctx.lineTo(x - 25, y - 40); ctx.lineTo(x - 45, y + 10); ctx.lineTo(x - 49, y + 10); ctx.fill();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.25)'; for (let k = 0; k < 6; k++) ctx.fillRect(x - 150, y - 30 + k * 7, 150, 0.6);
  ctx.restore();
  ctx.beginPath(); hull(); ctx.strokeStyle = INK; ctx.lineWidth = 1.3; ctx.stroke();
  ctx.fillStyle = '#0F172A'; ctx.font = 'bold 8px "Courier New", monospace'; ctx.fillText('U.S. COAST GUARD', x - 140, y - 14);
  ctx.font = 'bold 9px "Courier New", monospace'; ctx.fillText('714', x - 28, y - 14);
  // (the cabin, windows catching the light; the mast, the radar going round)
  shape(ctx, () => ctx.rect(x - 120, y - 70, 60, 34), '#F1F5F9', 1.1);
  bands(ctx, x - 116, y - 64, 52, 12, ['#1E3A5F', '#0F172A']);
  ctx.fillStyle = 'rgba(147, 197, 253, 0.5)'; ctx.fillRect(x - 112, y - 63, 10, 2); ctx.fillRect(x - 92, y - 63, 10, 2);
  ctx.fillStyle = '#E2E8F0'; ctx.fillRect(x - 96, y - 98, 3, 28);
  ctx.save(); ctx.translate(x - 94.5, y - 100); ctx.scale(Math.cos(t * 0.15), 1); ctx.fillStyle = '#CBD5E1'; ctx.fillRect(-12, -2, 24, 4); ctx.restore();
  const on = Math.floor(t / 6) % 2;
  for (const [lx, blue] of [[-114, true], [-80, false]] as const) {
    const lit = blue ? on : !on;
    ctx.fillStyle = lit ? (blue ? '#60A5FA' : '#F87171') : (blue ? '#1E3A8A' : '#7F1D1D'); ctx.fillRect(x + lx, y - 76, 12, 6);
    if (lit) for (let i = 3; i >= 1; i--) { ctx.fillStyle = blue ? `rgba(96, 165, 250, ${0.08 * i})` : `rgba(248, 113, 113, ${0.08 * i})`; ctx.beginPath(); ctx.arc(x + lx + 6, y - 73, 10 + (3 - i) * 8, 0, Math.PI * 2); ctx.fill(); }
  }
};

/**
 * The fight cloud: a ball of dust and spray over the boat, shaded in three tones, outlined; out of it every which way,
 * changing every beat, arms, boots, nightsticks (and his fist, once in a while); stars going round; teeth and blood
 * flying; the noises going up in bursts.
 */
const fightCloud = (ctx: Ctx, cx: number, cy: number, t: number) => {
  const beat = Math.floor(t / BLOW);
  // (the puffs: a dark one behind each, a light cap on it)
  const puffs: [number, number, number][] = [];
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2 + beat * 0.25, r = 30 + hash(i + beat) * 10; puffs.push([cx + Math.cos(a) * r * 1.5, cy + Math.sin(a) * r * 0.75, 15 + hash(i * 3 + beat) * 9]); }
  for (const [px, py, pr] of puffs) { ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(px, py, pr + 1.2, 0, Math.PI * 2); ctx.fill(); }
  for (const [px, py, pr] of puffs) { ctx.fillStyle = '#A8A29E'; ctx.beginPath(); ctx.arc(px, py + 2, pr, 0, Math.PI * 2); ctx.fill(); }
  for (const [px, py, pr] of puffs) { ctx.fillStyle = '#D6D3D1'; ctx.beginPath(); ctx.arc(px - 1, py - 1, pr * 0.85, 0, Math.PI * 2); ctx.fill(); }
  for (const [px, py, pr] of puffs) { ctx.fillStyle = '#F5F5F4'; ctx.beginPath(); ctx.arc(px - pr * 0.3, py - pr * 0.35, pr * 0.45, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#E7E5E4'; ctx.beginPath(); ctx.ellipse(cx, cy, 52, 28, 0, 0, Math.PI * 2); ctx.fill();
  // (motion lines whipping round it)
  ctx.strokeStyle = 'rgba(28, 25, 23, 0.6)'; ctx.lineWidth = 0.8;
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + t * 0.3; ctx.beginPath(); ctx.arc(cx, cy, 60 + (k % 3) * 4, a, a + 0.35); ctx.stroke(); }
  // (what's sticking out of it this beat)
  for (let i = 0; i < 7; i++) {
    const a = hash(i * 7 + beat) * Math.PI * 2, r = 50 + hash(i + beat * 3) * 12, ex = cx + Math.cos(a) * r, ey = cy + Math.sin(a) * r * 0.62;
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(a);
    const what = (i + beat) % 5;
    if (what === 0) { shape(ctx, () => ctx.roundRect(-16, -2.6, 16, 5.2, 2), '#F97316', 0.7); shape(ctx, () => ctx.arc(2, 0, 4.6, 0, Math.PI * 2), '#E8B495', 0.7); }
    else if (what === 1) { shape(ctx, () => ctx.rect(-16, -3, 16, 6), '#1E3A8A', 0.7); shape(ctx, () => ctx.roundRect(0, -4, 10, 8, 2), '#0A0A0A', 0.7); }
    else if (what === 2) { shape(ctx, () => ctx.roundRect(-20, -1.8, 22, 3.6, 1.4), '#18181B', 0.7); }
    else if (what === 3) { shape(ctx, () => ctx.roundRect(-16, -3, 16, 6, 3), '#E0AC69', 0.7); shape(ctx, () => ctx.arc(2, 0, 5.4, 0, Math.PI * 2), '#E0AC69', 0.7); ctx.fillStyle = '#C68B45'; ctx.fillRect(-1, -2, 1, 4); }
    else { shape(ctx, () => ctx.rect(-14, -2.6, 14, 5.2), '#1E3A8A', 0.7); shape(ctx, () => ctx.roundRect(0, -3.4, 9, 6.8, 2), '#18181B', 0.7); }
    ctx.restore();
  }
  // (stars, teeth, blood)
  for (let k = 0; k < 5; k++) {
    const a = t * 0.2 + k * 1.3, sx = cx + Math.cos(a) * 58, sy = cy - 34 + Math.sin(a) * 8;
    shape(ctx, () => { for (let p = 0; p < 10; p++) { const an = -Math.PI / 2 + p * Math.PI / 5, rr = p % 2 ? 1.6 : 4; if (p) ctx.lineTo(sx + Math.cos(an) * rr, sy + Math.sin(an) * rr); else ctx.moveTo(sx + Math.cos(an) * rr, sy + Math.sin(an) * rr); } ctx.closePath(); }, '#FDE047', 0.5);
  }
  for (let k = 0; k < 2; k++) {
    const q = ((t + k * 15) % 30) / 30;
    shape(ctx, () => ctx.ellipse(cx + 20 - k * 50 + q * (50 - k * 100), cy - 20 - q * 40 + q * q * 56, 2.2, 3, q * 6, 0, Math.PI * 2), '#FEF9C3', 0.5);
  }
  for (let k = 0; k < 6; k++) { const q = ((t * 1.3 + k * 9) % 24) / 24; ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.arc(cx + (hash(k + beat) - 0.5) * 120 * q, cy - 10 - q * 30 + q * q * 40, 1.6, 0, Math.PI * 2); ctx.fill(); }
  // (and the noise of it: a burst, halftone in it, the word)
  const words = ['POW!', 'THWACK!', 'WHAM!', 'BONK!', 'CRUNCH!', 'OOF!', 'KRAK!'];
  const wx = cx + (hash(beat) - 0.5) * 140, wy = cy - 36 + (hash(beat * 3) - 0.5) * 34;
  ctx.save(); ctx.translate(wx, wy); ctx.rotate((hash(beat * 5) - 0.5) * 0.5);
  const burst = () => { for (let k = 0; k < 14; k++) { const ang = (k / 14) * Math.PI * 2, rr = k % 2 ? 10 : 19; if (k) ctx.lineTo(Math.cos(ang) * rr * 1.7, Math.sin(ang) * rr * 0.85); else ctx.moveTo(Math.cos(ang) * rr * 1.7, Math.sin(ang) * rr * 0.85); } ctx.closePath(); };
  shape(ctx, burst, '#FDE047', 1.2);
  ctx.save(); ctx.beginPath(); burst(); ctx.clip();
  ctx.fillStyle = 'rgba(234, 88, 12, 0.5)'; for (let yy = -16; yy < 16; yy += 3) for (let xx = -32 + (yy % 2); xx < 32; xx += 3) ctx.fillRect(xx, yy, 0.9, 0.9);
  ctx.restore();
  ctx.fillStyle = '#B91C1C'; ctx.font = 'bold 10px "Courier New", monospace'; ctx.textAlign = 'center'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.strokeText(words[beat % words.length], 0, 3.5); ctx.fillText(words[beat % words.length], 0, 3.5); ctx.textAlign = 'left';
  ctx.restore();
};

/** His head out of the cloud, mid-beating: one eye swelling shut, a tooth gone, blood out of his nose. */
const headOut = (ctx: Ctx, hx: number, hy: number, k: number) => {
  shape(ctx, () => ctx.roundRect(hx - 9, hy - 10, 18, 20, 6), '#E0AC69', 0.9);
  ctx.fillStyle = '#C68B45'; ctx.fillRect(hx - 8, hy + 4, 16, 5);
  ctx.fillStyle = '#101010'; ctx.fillRect(hx - 9.5, hy - 12, 19, 5);
  shape(ctx, () => ctx.ellipse(hx - 4, hy - 2, 4 + k, 3.4 + k * 0.6, 0, 0, Math.PI * 2), '#6B21A8', 0.6);
  ctx.fillStyle = INK; ctx.fillRect(hx - 5, hy - 2.4, 2.4, 0.8);
  shape(ctx, () => ctx.arc(hx + 4, hy - 2, 2.6, 0, Math.PI * 2), '#FFFFFF', 0.5); ctx.fillStyle = INK; ctx.fillRect(hx + 4, hy - 2, 1, 1);
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(hx - 0.6, hy + 2, 1.2, 6);
  shape(ctx, () => ctx.ellipse(hx, hy + 6, 4, 2.8, 0, 0, Math.PI * 2), '#7F1D1D', 0.5);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(hx - 3, hy + 4.4, 2, 1.2); ctx.fillRect(hx + 1.4, hy + 4.4, 2, 1.2);
  // (sweat flying off)
  for (let s = 0; s < 3; s++) { ctx.fillStyle = 'rgba(224, 242, 254, 0.8)'; ctx.beginPath(); ctx.ellipse(hx + 12 + s * 3, hy - 10 - s * 3, 1, 1.6, 0.5, 0, Math.PI * 2); ctx.fill(); }
};

/** A dead coastie (for the daycare's wreck): limp, the arms and legs every which way, the eyes crossed out. */
export const deadCoastie = (ctx: Ctx, x: number, y: number, s: number, rot: number) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  shape(ctx, () => ctx.rect(-14, -2, 12, 4), '#1E3A8A', 0.6); shape(ctx, () => ctx.rect(2, 0, 12, 4), '#1E3A8A', 0.6);
  shape(ctx, () => ctx.roundRect(-8, -12, 16, 14, 3), '#F97316', 0.8);
  ctx.fillStyle = '#FEF08A'; ctx.fillRect(-8, -6, 16, 2);
  shape(ctx, () => ctx.rect(-18, -12, 10, 3), '#F97316', 0.5); shape(ctx, () => ctx.rect(8, -14, 10, 3), '#F97316', 0.5);
  shape(ctx, () => ctx.arc(0, -18, 6, 0, Math.PI * 2), '#E8B495', 0.8);
  shape(ctx, () => { ctx.arc(0, -20, 6.4, Math.PI, 0); ctx.closePath(); }, '#1E3A8A', 0.7);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.7;
  for (const ex of [-2.4, 2.4]) { ctx.beginPath(); ctx.moveTo(ex - 1.2, -19.2); ctx.lineTo(ex + 1.2, -16.8); ctx.moveTo(ex + 1.2, -19.2); ctx.lineTo(ex - 1.2, -16.8); ctx.stroke(); }
  ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.ellipse(0, -13.6, 1.6, 1, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

/**
 * A dead coastie on the lawn, ass in the air: on his knees, his head driven into the dirt to the shoulders, blood
 * sprayed round where it went in, arms limp out along the grass palms up; and a plastic lawn flamingo stuck in his ass by its wire legs, stood
 * up proud. Ground at y, head to the left.
 */
export const coastieAssUp = (ctx: Ctx, x: number, y: number, s: number) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // (the shins flat on the grass, the boots toes down)
  shape(ctx, () => ctx.roundRect(12, -6, 18, 6, 2), '#1E3A8A', 0.7);
  ctx.fillStyle = '#172554'; ctx.fillRect(13, -2, 16, 1.4);
  shape(ctx, () => ctx.roundRect(28, -7, 8, 7, 2), '#0A0A0A', 0.6);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; ctx.fillRect(29, -6, 4, 1);
  // (the thighs up off the knees)
  shape(ctx, () => { ctx.moveTo(10, -3); ctx.lineTo(18, -3); ctx.lineTo(18, -24); ctx.lineTo(6, -26); ctx.closePath(); }, '#1E3A8A', 0.7);
  ctx.fillStyle = '#172554'; ctx.fillRect(15, -22, 3, 19);
  // (the float coat, sloping down off his hips to his shoulders in the grass: three oranges, the reflective strip)
  const coat = () => { ctx.moveTo(16, -26); ctx.lineTo(4, -30); ctx.quadraticCurveTo(-8, -22, -16, -12); ctx.lineTo(-14, -2); ctx.quadraticCurveTo(-2, -8, 14, -16); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); coat(); ctx.clip();
  bands(ctx, -18, -32, 36, 32, ['#FDBA74', '#FB923C', '#F97316', '#EA580C', '#C2410C']);
  ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(8, -28); ctx.lineTo(-4, -8); ctx.stroke();
  ctx.restore();
  ctx.beginPath(); coat(); ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.stroke();
  // (the ass, highest thing on the lawn, the pants pulled tight over it, the seam)
  shape(ctx, () => ctx.ellipse(11, -27, 8, 6, -0.25, 0, Math.PI * 2), '#1E3A8A', 0.8);
  ctx.fillStyle = 'rgba(147, 197, 253, 0.35)'; ctx.beginPath(); ctx.ellipse(9, -30, 4, 1.6, -0.25, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(4, -29); ctx.quadraticCurveTo(11, -27, 18, -24); ctx.stroke();
  // (the arms, out past his head along the grass, palms up)
  for (const [ax, ay] of [[-14, -4], [-12, -1]] as const) {
    shape(ctx, () => { ctx.moveTo(ax, ay - 3); ctx.lineTo(ax - 14, ay - 1); ctx.lineTo(ax - 14, ay + 2); ctx.lineTo(ax, ay + 1); ctx.closePath(); }, ay < -2 ? '#C2410C' : '#F97316', 0.6);
    shape(ctx, () => ctx.ellipse(ax - 16, ay + 0.5, 2.6, 1.8, 0, 0, Math.PI * 2), '#E8B495', 0.5);
  }
  // (the head, driven into the dirt to the shoulders: the neck going in, a crater of thrown-up dirt round it, clods
  // and torn turf, and blood sprayed out round where he went in)
  ctx.fillStyle = 'rgba(127, 29, 29, 0.75)'; ctx.beginPath(); ctx.ellipse(-19, 0.6, 15, 2.6, 0, 0, Math.PI * 2); ctx.fill();
  for (let k = 0; k < 9; k++) { const a = Math.PI + (k / 8) * Math.PI, r = 9 + hash(k * 3.3) * 9; ctx.fillStyle = k % 2 ? '#991B1B' : '#B91C1C'; ctx.beginPath(); ctx.ellipse(-19 + Math.cos(a) * r * 1.3, Math.sin(a) * r * 0.5 - 1, 1 + hash(k) * 1.2, 0.8 + hash(k * 7) * 0.8, 0, 0, Math.PI * 2); ctx.fill(); }
  shape(ctx, () => { ctx.moveTo(-14, -6); ctx.quadraticCurveTo(-17, -3, -18, 0); ctx.lineTo(-13, 0); ctx.quadraticCurveTo(-12, -3, -9, -6); ctx.closePath(); }, '#E8B495', 0.6);
  shape(ctx, () => { ctx.moveTo(-29, 0.5); ctx.quadraticCurveTo(-27, -5, -22, -4.5); ctx.quadraticCurveTo(-19, -7, -15, -4); ctx.quadraticCurveTo(-11, -4.5, -9, 0.5); ctx.closePath(); }, '#5B3A24', 0.7);
  ctx.fillStyle = '#3F2A1D'; ctx.fillRect(-22, -3, 3, 1.2); ctx.fillRect(-15, -2, 2.4, 1);
  ctx.fillStyle = '#7C5A3A'; ctx.fillRect(-25, -3.6, 2.4, 1); ctx.fillRect(-18, -5.4, 2, 1);
  for (const [cx, cy] of [[-32, -1.4], [-6, -1], [-27, -7], [-11, -6]] as const) shape(ctx, () => ctx.ellipse(cx, cy, 1.4, 1, 0.4, 0, Math.PI * 2), '#5B3A24', 0.4);
  ctx.fillStyle = '#4D7C0F'; for (let k = 0; k < 5; k++) ctx.fillRect(-28 + k * 4.4, -5 - (k % 2) * 1.6, 1, 2.4);
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(-20, -5.4, 1.4, 1.4); ctx.fillRect(-13.6, -3.4, 1, 1);
  // The flamingo: its wire legs in him to the knees, stood up out of it, head up, the black beak
  ctx.save(); ctx.translate(11, -32); ctx.rotate(0.12); ctx.scale(0.8, 0.8);
  ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(-1.5, 2); ctx.lineTo(-1, -12); ctx.moveTo(1.5, 2); ctx.lineTo(1, -12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1, -7); ctx.lineTo(4, -9); ctx.lineTo(1, -11); ctx.stroke();
  const body = () => ctx.ellipse(0, -17, 9, 5.6, -0.15, 0, Math.PI * 2);
  ctx.save(); ctx.beginPath(); body(); ctx.clip(); bands(ctx, -10, -23, 20, 12, ['#FBCFE8', '#F9A8D4', '#F472B6', '#EC4899', '#DB2777']); ctx.restore();
  ctx.beginPath(); body(); ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.stroke();
  // (the tail feathers, the wing's moulded line)
  shape(ctx, () => { ctx.moveTo(-8, -18); ctx.lineTo(-13, -21); ctx.lineTo(-12, -16); ctx.closePath(); }, '#EC4899', 0.6);
  ctx.strokeStyle = '#BE185D'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(-5, -18); ctx.quadraticCurveTo(0, -15, 5, -18); ctx.stroke();
  // (the neck, an S up to the head)
  ctx.strokeStyle = INK; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(6, -19); ctx.bezierCurveTo(12, -24, 4, -30, 8, -36); ctx.stroke();
  ctx.strokeStyle = '#F472B6'; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(6, -19); ctx.bezierCurveTo(12, -24, 4, -30, 8, -36); ctx.stroke();
  shape(ctx, () => ctx.ellipse(9, -37, 3.2, 2.6, 0, 0, Math.PI * 2), '#F472B6', 0.6);
  shape(ctx, () => { ctx.moveTo(11.5, -38); ctx.lineTo(15.5, -35.5); ctx.lineTo(11.5, -35.6); ctx.closePath(); }, '#FDF2F8', 0.5);
  ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(14, -36.6); ctx.lineTo(15.8, -35.4); ctx.lineTo(13.6, -35.5); ctx.fill();
  ctx.fillRect(9.4, -38, 1, 1);
  ctx.restore();
  ctx.restore();
};

/** Over the whole screen while it plays: the cutter alongside and them over the side; the beating; what's left of him. */
export const drawBoarded = (ctx: Ctx, c: Chase) => {
  const t = c.caughtT;
  ctx.save();
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const s = CANVAS_WIDTH / W, top = (CANVAS_HEIGHT - H * s) / 2 - 20;
  ctx.save(); ctx.translate(0, top); ctx.scale(s, s);
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  const shake = (t < 12 || (t > BOARD_LEAP + 10 && t < BOARD_BEAT && (t - BOARD_LEAP) % BLOW < 2)) ? 3 : 0;
  if (shake) ctx.translate((hash(t) - 0.5) * shake * 2, (hash(t * 3) - 0.5) * shake * 2);
  if (t < BOARD_LEAP + 10) {
    // The cutter slamming in alongside, the spray going up between them; over the side they come, nightsticks up
    stormSky(ctx, t, 90);
    sea(ctx, 90, t);
    const slam = Math.min(1, t / 10);
    // (his boat, him in it at the motor, knocked about by it)
    ctx.save(); ctx.translate(166, 98); ctx.scale(0.6, 0.6); drawSeatedAtMotor(ctx, t, true); ctx.restore();
    lilBass(ctx, 146, 108);
    bigCutter(ctx, 92 + slam * 46, 104, t);
    // (the slam: a wall of spray between them, the boats rocking)
    if (t >= 8 && t < 30) {
      const k = (t - 8) / 22;
      for (let i = 0; i < 26; i++) { const a = -Math.PI / 2 + (hash(i) - 0.5) * 1.4, sp = 30 + hash(i * 3) * 50; ctx.fillStyle = i % 3 ? 'rgba(241, 245, 249, 0.85)' : 'rgba(147, 197, 253, 0.8)'; ctx.beginPath(); ctx.arc(138 + Math.cos(a) * sp * k, 100 + Math.sin(a) * sp * k + k * k * 30, 1.5 + hash(i) * 2.5, 0, Math.PI * 2); ctx.fill(); }
      ctx.save(); ctx.translate(140, 62);
      shape(ctx, () => { for (let p = 0; p < 14; p++) { const an = (p / 14) * Math.PI * 2, rr = p % 2 ? 8 : 15; if (p) ctx.lineTo(Math.cos(an) * rr * 1.6, Math.sin(an) * rr * 0.8); else ctx.moveTo(Math.cos(an) * rr * 1.6, Math.sin(an) * rr * 0.8); } ctx.closePath(); }, '#F8FAFC', 1);
      ctx.fillStyle = '#1D4ED8'; ctx.font = 'bold 9px "Courier New", monospace'; ctx.textAlign = 'center'; ctx.fillText('KRUNCH!', 0, 3); ctx.textAlign = 'left';
      ctx.restore();
    }
    // (them, over the side: arcing across, nightsticks up, motion lines after them)
    if (t >= BOARD_LEAP - 40) {
      const k = Math.min(1, (t - (BOARD_LEAP - 40)) / 46);
      for (const [x0, d] of [[40, 0], [62, 7]] as const) {
        const kk = Math.max(0, Math.min(1, k - d / 30));
        const px = x0 + kk * 110, py = 72 - Math.sin(kk * Math.PI) * 44 + kk * 26;
        ctx.strokeStyle = 'rgba(241, 245, 249, 0.6)'; ctx.lineWidth = 0.8;
        for (let m = 1; m <= 3; m++) { ctx.beginPath(); ctx.moveTo(px - 10 - m * 6, py - 20 + m * 3); ctx.lineTo(px - 4 - m * 6, py - 20 + m * 3); ctx.stroke(); }
        coastie(ctx, px, py, 1.3, 0.4 + Math.sin(t * 0.5 + d) * 0.4);
      }
    }
    lightWash(ctx, t, 0.08);
  } else if (t < BOARD_BEAT) {
    // The beating: in close on his boat, a cloud of it filling it, the light bar washing over it all
    stormSky(ctx, t, 70);
    sea(ctx, 70, t);
    // (the boat, big: its gunwale and deck in the foreground)
    const hull = () => { ctx.moveTo(-10, 110); ctx.lineTo(W + 10, 106); ctx.lineTo(W + 10, H + 4); ctx.lineTo(-10, H + 4); ctx.closePath(); };
    ctx.save(); ctx.beginPath(); hull(); ctx.clip();
    bands(ctx, -10, 104, W + 20, 44, ['#FFFFFF', '#F1F5F9', '#E2E8F0', '#CBD5E1']);
    ctx.fillStyle = '#DC2626'; ctx.fillRect(-10, 118, W + 20, 4); ctx.fillStyle = '#991B1B'; ctx.fillRect(-10, 122, W + 20, 1);
    ctx.restore();
    ctx.beginPath(); hull(); ctx.strokeStyle = INK; ctx.lineWidth = 1.3; ctx.stroke();
    fightCloud(ctx, 128, 76, t - BOARD_LEAP);
    // (his head out of it now and then, worse every time; dragged back in)
    const u = t - BOARD_LEAP;
    if (Math.floor(u / 26) % 3 === 1) headOut(ctx, 96 + (hash(Math.floor(u / 26)) - 0.5) * 70, 46, Math.min(3, u / 110));
    // (each blow landing: a flash ring off it)
    const since = u % BLOW;
    if (since < 5) { ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 - since * 0.16})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(110 + (hash(Math.floor(u / BLOW)) - 0.5) * 50, 70 + (hash(Math.floor(u / BLOW) * 3) - 0.5) * 20, 6 + since * 5, 0, Math.PI * 2); ctx.stroke(); }
    lightWash(ctx, t, 0.1);
  } else {
    // What's left of him: slumped over the side of his own boat, lumps on lumps; them stood behind him in the rain, one
    // either side, arms folded, the light bar going
    stormSky(ctx, t, 96);
    sea(ctx, 96, t);
    const hull = () => { ctx.moveTo(-10, 104); ctx.lineTo(W + 10, 100); ctx.lineTo(W + 10, H + 4); ctx.lineTo(-10, H + 4); ctx.closePath(); };
    ctx.save(); ctx.beginPath(); hull(); ctx.clip();
    bands(ctx, -10, 98, W + 20, 50, ['#FFFFFF', '#F1F5F9', '#E2E8F0', '#CBD5E1', '#94A3B8']);
    ctx.fillStyle = '#DC2626'; ctx.fillRect(-10, 114, W + 20, 4);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)'; ctx.beginPath(); ctx.ellipse(120, 136, 60, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.beginPath(); hull(); ctx.strokeStyle = INK; ctx.lineWidth = 1.3; ctx.stroke();
    coastie(ctx, 44, 82, 1.9, 'crossed');
    coastie(ctx, 150, 82, 1.9, 'crossed', -1);
    deadFace(ctx, 96, 90, 2.4, { skin: '#D4A06A', shade: '#7C4A2A', tilt: 0.5, xEyes: true });
    // (the lumps, the bruising, a band-aid nobody put on him)
    ctx.fillStyle = 'rgba(88, 28, 135, 0.5)';
    for (const [lx, ly, r] of [[78, 68, 9], [106, 60, 7], [118, 86, 6], [84, 96, 5]] as const) { ctx.beginPath(); ctx.arc(lx, ly, r, 0, Math.PI * 2); ctx.fill(); }
    for (const [lx, ly, r] of [[88, 48, 7], [112, 46, 5], [100, 42, 4]] as const) { shape(ctx, () => ctx.arc(lx, ly, r, Math.PI, 0), '#E0AC69', 0.8); ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'; ctx.fillRect(lx - r * 0.4, ly - r * 0.7, r * 0.5, 1); }
    blood(ctx, 92, 128, 13, 7, 3);
    for (let k = 0; k < 4; k++) shape(ctx, () => ctx.ellipse(66 + k * 16, 132 + (k % 2) * 3, 2, 2.8, k, 0, Math.PI * 2), '#FEF9C3', 0.4);
    // (his arm over the side, fingers in the water, the swell lapping at them)
    shape(ctx, () => { ctx.moveTo(58, 102); ctx.quadraticCurveTo(50, 116, 48, 128); ctx.lineTo(56, 130); ctx.quadraticCurveTo(58, 116, 66, 104); ctx.closePath(); }, '#E0AC69', 0.8);
    ctx.fillStyle = '#C68B45'; ctx.fillRect(52, 112, 3, 12);
    speckle(ctx, 40, 96, 80, 20, 40, 'rgba(127, 29, 29, 0.6)', 3, 1);
    // (stars still going round his head)
    for (let k = 0; k < 3; k++) { const a = t * 0.15 + k * 2.1; ctx.fillStyle = '#FDE047'; ctx.font = 'bold 7px "Courier New", monospace'; ctx.fillText('*', 96 + Math.cos(a) * 30, 34 + Math.sin(a) * 5); }
    lightWash(ctx, t, 0.07);
  }
  rain(ctx, t);
  // (the letterbox's own vignette)
  const v = ctx.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, 160);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  // The caption
  const cap = (who: string, text: string) => {
    const y = top + H * s + 14;
    ctx.font = 'bold 13px "Press Start 2P", monospace'; ctx.textAlign = 'center';
    ctx.fillStyle = '#F97316'; ctx.fillText(who, CANVAS_WIDTH / 2, y + 6);
    ctx.font = '12px "Press Start 2P", monospace'; ctx.fillStyle = '#F8FAFC'; ctx.fillText(text, CANVAS_WIDTH / 2, y + 28);
    ctx.textAlign = 'left';
  };
  if (t >= BOARD_LINE) cap('COAST GUARD', 'WE SAID. GET OUT. OF THE WATER.');
  else if (t < 40) cap('COAST GUARD', 'YOU ARE BEING BOARDED!');
  if (t < 6) { ctx.fillStyle = `rgba(0,0,0,${1 - t / 6})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  ctx.restore();
};

// ---------------------------------------------------------------------------
// Up the storm: the cutter after him, not making it
// ---------------------------------------------------------------------------

/** Frames of it (after he's out at the bottom of the storm), and the smash. */
export const DEMISE_FRAMES = 380, DEMISE_SMASH = 150;

/**
 * Screen space, over the storm: the cutter whirled up past him, spinning, its crew hanging on; then it meets a house
 * coming the other way, and comes apart, them with it, the bits whirled away round the storm and gone. The crew fall
 * a long way, and then the storm takes them back up again, past him, one more time, and they're gone.
 */
export const drawCutterDemise = (ctx: Ctx, t: number, frame: number) => {
  if (t <= 0 || t > DEMISE_FRAMES) return;
  ctx.save();
  if (t < DEMISE_SMASH) {
    const k = t / DEMISE_SMASH;
    const x = 120 + k * 520, y = 640 - k * 520;
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.12); ctx.scale(0.6, 0.6);
    drawCutter(ctx, 100, 0, frame);
    ctx.restore();
    // (the house coming the other way, end over end)
    const hk = Math.max(0, (t - DEMISE_SMASH + 50) / 50);
    if (hk > 0) {
      ctx.save(); ctx.translate(820 - hk * 180, 40 + hk * 80); ctx.rotate(-t * 0.08);
      shape(ctx, () => ctx.rect(-50, -30, 100, 60), '#FDE68A', 1.4);
      shape(ctx, () => { ctx.moveTo(-58, -30); ctx.lineTo(0, -66); ctx.lineTo(58, -30); ctx.closePath(); }, '#B91C1C', 1.4);
      ctx.fillStyle = '#93C5FD'; ctx.fillRect(-36, -14, 18, 16); ctx.fillRect(18, -14, 18, 16);
      ctx.restore();
    }
  } else {
    // SMASH: the pair of them in pieces, everything flung out, the crew among it
    const s = t - DEMISE_SMASH;
    if (s < 10) { ctx.fillStyle = `rgba(255, 255, 255, ${0.6 - s * 0.06})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
    const cx = 640, cy = 120;
    for (let i = 0; i < 26; i++) {
      const a = hash(i) * Math.PI * 2, sp = 3 + hash(i * 3) * 6;
      const px = cx + Math.cos(a) * sp * s - s * s * 0.02, py = cy + Math.sin(a) * sp * s + s * s * 0.06;
      ctx.save(); ctx.translate(px, py); ctx.rotate(s * 0.2 + i);
      if (i < 3) { ctx.restore(); continue; }
      { ctx.fillStyle = ['#F8FAFC', '#EA580C', '#FDE68A', '#B91C1C', '#1E293B'][i % 5]; ctx.fillRect(-8, -4, 16, 8); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(-8, -4, 16, 8); }
      ctx.restore();
    }
    // The crew: thrown out, falling a long way down past him... and then the updraft has them, and up they go again,
    // flailing, past him one more time and off the top, for good
    for (let i = 0; i < 2; i++) {
      const fallFor = 90 + i * 10;
      let px: number, py: number;
      if (s < fallFor) { px = cx - 80 - i * 70 - s * (1.5 + i * 0.4); py = cy + s * s * 0.075; }
      else {
        const u = s - fallFor, x0 = cx - 80 - i * 70 - fallFor * (1.5 + i * 0.4), y0 = cy + fallFor * fallFor * 0.075;
        px = x0 + Math.sin(u * 0.08 + i) * 90 - u * 0.8; py = y0 - u * u * 0.06 - u * 2;
      }
      ctx.save(); ctx.translate(px, py); ctx.rotate(s * (0.25 + i * 0.05) * (i % 2 ? -1 : 1));
      coastie(ctx, 0, 0, 1.6, Math.sin(s * 0.6 + i) * 1.4);
      ctx.restore();
    }
    if (s < 40) {
      ctx.save(); ctx.translate(cx, cy - 20);
      shape(ctx, () => { for (let k = 0; k < 16; k++) { const ang = (k / 16) * Math.PI * 2, rr = k % 2 ? 22 : 44; if (k) ctx.lineTo(Math.cos(ang) * rr * 1.5, Math.sin(ang) * rr * 0.8); else ctx.moveTo(Math.cos(ang) * rr * 1.5, Math.sin(ang) * rr * 0.8); } ctx.closePath(); }, '#F97316', 1.6);
      ctx.fillStyle = '#FDE047'; ctx.font = 'bold 22px "Courier New", monospace'; ctx.textAlign = 'center'; ctx.strokeStyle = INK; ctx.lineWidth = 3;
      ctx.strokeText('KRAKOOM!', 0, 8); ctx.fillText('KRAKOOM!', 0, 8); ctx.textAlign = 'left';
      ctx.restore();
    }
  }
  ctx.restore();
};

/**
 * The cutter, come down with the rest of the storm onto the lawn beside the daycare: broken in two, the bow driven into
 * the grass nose first, the stern half up on its side with the cabin stove in, the light bar hanging off it still going,
 * smoke coming off it, fuel in a slick round it; and one of its crew, who was in it when it hit, in pieces all round it.
 * (x: the middle of it; g: the ground.)
 */
export const drawCutterWreck = (ctx: Ctx, x: number, g: number, frame: number) => {
  ctx.save();
  // (what's driven into the lawn is out of sight under it)
  ctx.beginPath(); ctx.rect(x - 400, g - 400, 800, 404); ctx.clip();
  // The fuel, in a sheen round it
  ctx.fillStyle = 'rgba(30, 27, 75, 0.55)'; ctx.beginPath(); ctx.ellipse(x, g + 1, 170, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(167, 139, 250, 0.25)'; ctx.beginPath(); ctx.ellipse(x - 30, g, 90, 2.4, 0, 0, Math.PI * 2); ctx.fill();
  // The stern half: over on its side, the break toward the bow, the cabin crushed into it
  ctx.save(); ctx.translate(x + 50, g - 4); ctx.rotate(0.22);
  const stern = () => { ctx.moveTo(-90, -60); ctx.lineTo(-74, -48); ctx.lineTo(-86, -34); ctx.lineTo(-70, -18); ctx.lineTo(-84, 0); ctx.lineTo(96, 4); ctx.lineTo(110, -56); ctx.closePath(); };
  shape(ctx, stern, lin(ctx, -60, 4, [[0, '#F8FAFC'], [1, '#CBD5E1']]), 1.6);
  ctx.save(); ctx.beginPath(); stern(); ctx.clip();
  ctx.fillStyle = '#EA580C'; ctx.beginPath(); ctx.moveTo(20, -60); ctx.lineTo(40, -60); ctx.lineTo(16, 6); ctx.lineTo(-4, 6); ctx.fill();
  ctx.fillStyle = '#1D4ED8'; ctx.beginPath(); ctx.moveTo(46, -60); ctx.lineTo(51, -60); ctx.lineTo(27, 6); ctx.lineTo(22, 6); ctx.fill();
  // (the hull's insides showing at the break: dark, ribs)
  ctx.fillStyle = '#1E293B'; ctx.beginPath(); ctx.moveTo(-90, -60); ctx.lineTo(-74, -48); ctx.lineTo(-86, -34); ctx.lineTo(-70, -18); ctx.lineTo(-84, 0); ctx.lineTo(-60, 0); ctx.lineTo(-60, -60); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#64748B'; for (const rx of [-80, -70]) ctx.fillRect(rx, -58, 3, 56);
  ctx.restore();
  ctx.fillStyle = '#1E293B'; ctx.font = 'bold 12px "Courier New", monospace'; ctx.fillText('714', 58, -28);
  // (the cabin, stove in, its windows gone)
  shape(ctx, () => { ctx.moveTo(-20, -60); ctx.lineTo(-10, -96); ctx.lineTo(44, -84); ctx.lineTo(60, -60); ctx.closePath(); }, '#E2E8F0', 1.4);
  ctx.fillStyle = '#0F172A'; ctx.beginPath(); ctx.moveTo(-6, -88); ctx.lineTo(38, -80); ctx.lineTo(42, -70); ctx.lineTo(-10, -74); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(4, -86); ctx.lineTo(10, -74); ctx.moveTo(24, -82); ctx.lineTo(20, -72); ctx.stroke();
  // (the light bar, hanging off by its wires, still going)
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(20, -90); ctx.quadraticCurveTo(30, -70, 34, -58); ctx.stroke();
  ctx.save(); ctx.translate(34, -56); ctx.rotate(1.1 + Math.sin(frame * 0.05) * 0.05);
  const on = Math.floor(frame / 9) % 2;
  shape(ctx, () => ctx.rect(-14, -4, 14, 8), on ? '#3B82F6' : '#1E3A8A', 0.8); shape(ctx, () => ctx.rect(0, -4, 14, 8), on ? '#B91C1C' : '#EF4444', 0.8);
  ctx.restore();
  // (the stern's outboard, up in the air, prop bent)
  shape(ctx, () => ctx.rect(100, -64, 14, 30), '#334155', 1);
  ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(107, -34); ctx.lineTo(116, -26); ctx.moveTo(107, -34); ctx.lineTo(98, -22); ctx.stroke();
  ctx.restore();
  // The bow half: nose first into the lawn (what's under the grass, out of sight), a crater of turf thrown up round it
  ctx.save(); ctx.beginPath(); ctx.rect(x - 400, g - 400, 800, 402); ctx.clip();
  ctx.translate(x - 110, g + 6); ctx.rotate(-0.62);
  const bow = () => { ctx.moveTo(0, 0); ctx.lineTo(100, -20); ctx.lineTo(88, -6); ctx.lineTo(104, 8); ctx.lineTo(92, 22); ctx.lineTo(102, 34); ctx.lineTo(10, 34); ctx.closePath(); };
  shape(ctx, bow, lin(ctx, -20, 34, [[0, '#F8FAFC'], [1, '#CBD5E1']]), 1.6);
  ctx.save(); ctx.beginPath(); bow(); ctx.clip();
  ctx.fillStyle = '#1E293B'; ctx.font = 'bold 9px "Courier New", monospace'; ctx.fillText('COAST GU', 18, 14);
  ctx.fillStyle = '#1E293B'; ctx.beginPath(); ctx.moveTo(100, -20); ctx.lineTo(88, -6); ctx.lineTo(104, 8); ctx.lineTo(92, 22); ctx.lineTo(102, 34); ctx.lineTo(80, 34); ctx.lineTo(80, -20); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.restore();
  for (let k = 0; k < 10; k++) {
    const a = Math.PI + (k / 9) * Math.PI, r = 30 + hash(k * 2.7) * 20;
    shape(ctx, () => ctx.ellipse(x - 112 + Math.cos(a) * r, g - 2 + Math.sin(a) * r * 0.25, 4 + hash(k) * 3, 2.4, hash(k * 3) * 2, 0, Math.PI * 2), k % 2 ? '#5B3A24' : '#3F6212', 0.5);
  }
  // Smoke off the stern, drifting
  for (let k = 0; k < 5; k++) {
    const life = (frame * 0.6 + k * 40) % 200, sx = x + 70 + life * 0.25 + Math.sin((frame + k * 30) * 0.03) * 8, sy = g - 110 - life * 0.9;
    ctx.fillStyle = `rgba(51, 65, 85, ${(0.45 * (1 - life / 200)).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(sx, sy, 10 + life * 0.12, 0, Math.PI * 2); ctx.fill();
  }
  // Debris: hull plates, a life ring, the loudhailer
  for (let k = 0; k < 7; k++) {
    const dx = x - 170 + hash(k * 5.1) * 340, ang = hash(k * 1.3) * 3;
    ctx.save(); ctx.translate(dx, g - 3); ctx.rotate(ang);
    shape(ctx, () => ctx.rect(-8, -2, 16, 4), k % 3 ? '#E2E8F0' : '#EA580C', 0.6); ctx.restore();
  }
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.fillStyle = '#F97316';
  ctx.beginPath(); ctx.ellipse(x - 20, g - 4, 12, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#F8FAFC'; for (const a of [0.4, 2, 3.6, 5.2]) ctx.fillRect(x - 20 + Math.cos(a) * 9 - 2, g - 4 + Math.sin(a) * 3 - 1, 4, 2);
  shape(ctx, () => { ctx.moveTo(x + 150, g - 2); ctx.lineTo(x + 164, g - 9); ctx.lineTo(x + 164, g + 2); ctx.closePath(); }, '#F8FAFC', 0.8);

  // The one of them who was aboard when it hit: in pieces round it, a lot of blood
  ctx.fillStyle = 'rgba(127, 29, 29, 0.8)';
  for (const [bx, bw] of [[x - 60, 34], [x + 4, 22], [x - 136, 18], [x + 120, 16]] as const) { ctx.beginPath(); ctx.ellipse(bx, g, bw, 3, 0, 0, Math.PI * 2); ctx.fill(); }
  blood(ctx, x - 60, g - 2, 14, 7);
  // (the torso, in the float coat, on its back, ragged at the waist)
  ctx.save(); ctx.translate(x - 62, g - 6); ctx.rotate(-0.1);
  ctx.save(); ctx.beginPath(); ctx.roundRect(-14, -8, 26, 12, 3); ctx.clip();
  bands(ctx, -14, -8, 26, 12, ['#FDBA74', '#FB923C', '#F97316', '#EA580C']);
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-14, -3, 26, 2);
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.roundRect(-14, -8, 26, 12, 3); ctx.stroke();
  ctx.fillStyle = '#991B1B'; for (let k = 0; k < 5; k++) ctx.fillRect(12 + (k % 2) * 2, -7 + k * 2.4, 3, 1.6);
  ctx.fillStyle = '#FCA5A5'; ctx.fillRect(13, -4, 3, 2);
  ctx.restore();
  // (the head, helmet still on, face to the sky, a way off from the rest)
  ctx.save(); ctx.translate(x - 138, g - 5);
  shape(ctx, () => ctx.roundRect(-5, -5, 10, 10, 3), '#E8B495', 0.7);
  shape(ctx, () => { ctx.arc(0, -2, 6.4, Math.PI, 0); ctx.closePath(); }, '#1E3A8A', 0.7);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.7;
  for (const ex of [-2.2, 2.2]) { ctx.beginPath(); ctx.moveTo(ex - 1, 0); ctx.lineTo(ex + 1, 2); ctx.moveTo(ex + 1, 0); ctx.lineTo(ex - 1, 2); ctx.stroke(); }
  ctx.fillStyle = '#991B1B'; ctx.fillRect(-4, 5, 8, 2);
  ctx.restore();
  // (the legs, still in their boots, one up against the hull, one out on the grass)
  for (const [lx, ly, rot] of [[x + 8, g - 4, 0.9], [x + 118, g - 3, -0.2]] as const) {
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(rot);
    shape(ctx, () => ctx.rect(-12, -2.4, 18, 5), '#1E3A8A', 0.6);
    shape(ctx, () => ctx.roundRect(6, -3.4, 6, 7, 1.4), '#0A0A0A', 0.5);
    ctx.fillStyle = '#991B1B'; ctx.fillRect(-14, -2, 3, 4);
    ctx.restore();
  }
  // (an arm, caught on the bow's broken edge, hanging)
  ctx.save(); ctx.translate(x - 64, g - 46); ctx.rotate(1.2);
  shape(ctx, () => ctx.rect(-2, 0, 4, 16), '#F97316', 0.5); shape(ctx, () => ctx.ellipse(0, 18, 2.4, 2, 0, 0, Math.PI * 2), '#E8B495', 0.5);
  ctx.fillStyle = '#991B1B'; ctx.fillRect(-2, -2, 4, 2);
  ctx.restore();
  ctx.fillStyle = '#B91C1C'; for (let k = 0; k < 9; k++) ctx.fillRect(x - 160 + hash(k * 4.4) * 300, g - 2 - hash(k) * 3, 2, 2);
  ctx.restore();
};
