// The Coast Guard chase, drawn: the junk the hurricane's throwing (and the shadows of what's coming down), the cutter
// after him, its skipper's bubble, the HUD's how-close meter; the kill camera when they board him; and the cutter going
// up the storm after him, and not making it.

import type { GameState } from '../../core/state';
import type { Chase, Junk } from './chase';
import { junkSize, BOARD_LEAP, BOARD_BEAT, BOARD_LINE } from './chase';
import { COURSE } from './course';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { INK, hash, lin, shape, speckle, blood, deadFace } from '../../render/scenes/carnage';

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
  // (two more of them in the stern, ready)
  for (const cx of [-176, -194]) { shape(ctx, () => ctx.rect(cx, -60, 12, 26), '#F97316', 0.8); shape(ctx, () => ctx.arc(cx + 6, -66, 6, 0, Math.PI * 2), '#1E3A8A', 0.8); }
  ctx.restore();
};

/** In the world, behind and around him: the junk (and the shadows of what's coming down), the cutter after him. */
export const drawChaseWorld = (ctx: Ctx, state: GameState, c: Chase) => {
  // The shadows of what's coming down, darkening on the water as it gets closer
  for (const j of c.junk) {
    if (j.kind !== 'drop' || j.warn <= 0) continue;
    const k = 1 - j.warn / 95;
    ctx.fillStyle = `rgba(2, 6, 23, ${0.2 + k * 0.5})`;
    ctx.beginPath(); ctx.ellipse(j.x, COURSE.sea.y + 2, 20 + k * 30, 4 + k * 3, 0, 0, Math.PI * 2); ctx.fill();
    if (Math.floor(state.frame / 6) % 2) { ctx.fillStyle = '#EF4444'; ctx.font = 'bold 14px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('!', j.x, COURSE.sea.y - 30); ctx.textAlign = 'left'; }
  }
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

/** The HUD: how close the cutter is (a bar along the top, filling as it closes in), and an arrow at the edge when it's off the screen. */
export const drawChaseHud = (ctx: Ctx, state: GameState, c: Chase, boatX: number) => {
  const gap = Math.max(0, boatX - c.cgX);
  const k = 1 - Math.min(1, gap / 640);
  const x = 250, y = 70, w = 300;
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

/** Rain driving across the picture. */
const rain = (ctx: Ctx, t: number) => {
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.35)'; ctx.lineWidth = 0.5;
  for (let i = 0; i < 50; i++) { const x = (hash(i) * 300 + t * 6) % 300 - 20, y = (hash(i * 3) * 160 + t * 9) % 160 - 10; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 9); ctx.stroke(); }
};

/** A sea in bands, the swell going by. */
const sea = (ctx: Ctx, y0: number, t: number) => {
  for (let i = 0; i < 6; i++) { ctx.fillStyle = ['#334155', '#2B3A4E', '#243246', '#1E2A3D', '#182235', '#121A2B'][i]; ctx.fillRect(0, y0 + i * ((H - y0) / 6), W, (H - y0) / 6 + 1); }
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.45)'; ctx.lineWidth = 0.8;
  for (let k = 0; k < 8; k++) { const sy = y0 + 4 + k * 6; ctx.beginPath(); for (let x = -10; x < W + 10; x += 6) ctx.lineTo(x, sy + Math.sin(x * 0.08 + t * 0.15 + k) * 1.5); ctx.stroke(); }
};

/** A coastie: orange float coat, helmet, his nightstick (arm up, or swinging). */
const coastie = (ctx: Ctx, x: number, y: number, s: number, arm: number, flip = 1) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * flip, s);
  shape(ctx, () => ctx.rect(-5, -4, 4, 14), '#1E3A8A', 0.6); shape(ctx, () => ctx.rect(1, -4, 4, 14), '#1E3A8A', 0.6);
  shape(ctx, () => ctx.roundRect(-8, -24, 16, 22, 3), '#F97316', 0.8);
  ctx.fillStyle = '#FEF08A'; ctx.fillRect(-8, -14, 16, 2);
  shape(ctx, () => ctx.arc(0, -30, 6, 0, Math.PI * 2), '#E8B495', 0.8);
  shape(ctx, () => { ctx.arc(0, -32, 6.4, Math.PI, 0); ctx.closePath(); }, '#1E3A8A', 0.7);
  ctx.fillStyle = INK; ctx.fillRect(1, -31, 1.4, 1.4); ctx.fillRect(4, -31, 1.4, 1.4);
  ctx.save(); ctx.translate(7, -20); ctx.rotate(-1.2 + arm);
  shape(ctx, () => ctx.rect(0, -2, 10, 4), '#F97316', 0.6);
  shape(ctx, () => ctx.rect(9, -1.5, 14, 3), '#18181B', 0.6);
  ctx.restore();
  ctx.restore();
};

/** Meathead's boat from the side: white, the red stripe, LIL BASS. */
const lilBass = (ctx: Ctx, x: number, y: number) => {
  shape(ctx, () => { ctx.moveTo(x, y - 14); ctx.lineTo(x + 92, y - 16); ctx.lineTo(x + 80, y + 6); ctx.lineTo(x + 6, y + 6); ctx.closePath(); }, '#F8FAFC', 1.1);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(x + 2, y - 4, 88, 2.4);
  ctx.fillStyle = INK; ctx.font = 'bold 5px "Courier New", monospace'; ctx.fillText('LIL BASS', x + 30, y - 7);
};

/** The fight cloud: dust balled up over the boat, arms and boots and nightsticks out of it every which way, stars,
 * the odd tooth, POW and THWACK going up. */
const fightCloud = (ctx: Ctx, cx: number, cy: number, t: number) => {
  const beat = Math.floor(t / 6);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + beat * 0.3, r = 26 + hash(i + beat) * 10;
    shape(ctx, () => ctx.arc(cx + Math.cos(a) * r * 1.5, cy + Math.sin(a) * r * 0.8, 14 + hash(i * 3 + beat) * 8, 0, Math.PI * 2), i % 2 ? '#E7E5E4' : '#D6D3D1', 0.9);
  }
  shape(ctx, () => ctx.ellipse(cx, cy, 48, 26, 0, 0, Math.PI * 2), '#F5F5F4', 0);
  // (what's sticking out of it this beat)
  for (let i = 0; i < 6; i++) {
    const a = hash(i * 7 + beat) * Math.PI * 2, r = 46 + hash(i + beat * 3) * 10, ex = cx + Math.cos(a) * r, ey = cy + Math.sin(a) * r * 0.6;
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(a);
    const what = (i + beat) % 4;
    if (what === 0) { shape(ctx, () => ctx.rect(-14, -2, 14, 4), '#F97316', 0.6); shape(ctx, () => ctx.arc(2, 0, 4, 0, Math.PI * 2), '#E8B495', 0.6); }
    else if (what === 1) { shape(ctx, () => ctx.rect(-14, -2.5, 14, 5), '#1E3A8A', 0.6); shape(ctx, () => ctx.roundRect(0, -3.4, 8, 6.8, 2), '#18181B', 0.6); }
    else if (what === 2) { shape(ctx, () => ctx.rect(-16, -1.6, 18, 3.2), '#18181B', 0.6); }
    else { shape(ctx, () => ctx.rect(-14, -2.4, 14, 4.8), '#E0AC69', 0.6); shape(ctx, () => ctx.arc(2, 0, 4.4, 0, Math.PI * 2), '#E0AC69', 0.6); }
    ctx.restore();
  }
  // (stars going round, a tooth, a drop of blood)
  for (let k = 0; k < 4; k++) { const a = t * 0.2 + k * 1.6; ctx.fillStyle = '#FDE047'; ctx.font = 'bold 9px "Courier New", monospace'; ctx.fillText('*', cx + Math.cos(a) * 54, cy - 30 + Math.sin(a) * 8); }
  const tooth = (t % 30) / 30;
  shape(ctx, () => { ctx.ellipse(cx + 20 + tooth * 50, cy - 20 - tooth * 40 + tooth * tooth * 50, 2.2, 3, tooth * 6, 0, Math.PI * 2); }, '#FEF9C3', 0.5);
  blood(ctx, cx - 30 + (beat % 3) * 20, cy + 20, 3, beat, 0);
  // (and the noises, big)
  const words = ['POW!', 'THWACK!', 'WHAM!', 'BONK!', 'CRUNCH!', 'OOF!'];
  const wx = cx + (hash(beat) - 0.5) * 120, wy = cy - 30 + (hash(beat * 3) - 0.5) * 30;
  ctx.save(); ctx.translate(wx, wy); ctx.rotate((hash(beat * 5) - 0.5) * 0.5);
  shape(ctx, () => { for (let k = 0; k < 14; k++) { const ang = (k / 14) * Math.PI * 2, rr = k % 2 ? 9 : 17; if (k) ctx.lineTo(Math.cos(ang) * rr * 1.6, Math.sin(ang) * rr * 0.8); else ctx.moveTo(Math.cos(ang) * rr * 1.6, Math.sin(ang) * rr * 0.8); } ctx.closePath(); }, '#FDE047', 1);
  ctx.fillStyle = '#B91C1C'; ctx.font = 'bold 9px "Courier New", monospace'; ctx.textAlign = 'center'; ctx.fillText(words[beat % words.length], 0, 3); ctx.textAlign = 'left';
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
  // The storm sky, in bands
  for (let i = 0; i < 6; i++) { ctx.fillStyle = ['#1E293B', '#273449', '#334155', '#3B4A60', '#475569', '#4B5A70'][i]; ctx.fillRect(0, i * 14, W, 15); }
  if (t % 90 < 4) { ctx.fillStyle = 'rgba(241, 245, 249, 0.5)'; ctx.fillRect(0, 0, W, H); }
  const shake = (t < 12 || (t > BOARD_LEAP + 10 && t < BOARD_BEAT && t % 7 < 2)) ? 2 : 0;
  if (shake) ctx.translate((hash(t) - 0.5) * shake * 2, (hash(t * 3) - 0.5) * shake * 2);
  if (t < BOARD_LEAP + 10) {
    // The cutter alongside, slamming into him; them over the side, nightsticks up
    sea(ctx, 96, t);
    const slam = Math.min(1, t / 10);
    lilBass(ctx, 110, 104);
    ctx.save(); ctx.translate(-40 + slam * 40, 0);
    shape(ctx, () => { ctx.moveTo(10, 72); ctx.lineTo(116, 70); ctx.lineTo(104, 108); ctx.lineTo(14, 108); ctx.closePath(); }, '#F8FAFC', 1.2);
    ctx.fillStyle = '#EA580C'; ctx.beginPath(); ctx.moveTo(60, 70); ctx.lineTo(70, 70); ctx.lineTo(60, 108); ctx.lineTo(50, 108); ctx.fill();
    ctx.fillStyle = '#1E293B'; ctx.font = 'bold 6px "Courier New", monospace'; ctx.fillText('COAST GUARD', 16, 92);
    const on = Math.floor(t / 5) % 2; ctx.fillStyle = on ? '#3B82F6' : '#EF4444'; ctx.fillRect(40, 52, 16, 5);
    shape(ctx, () => ctx.rect(30, 56, 40, 16), '#F1F5F9', 0.8);
    ctx.restore();
    if (t < 14) for (let i = 0; i < 12; i++) { ctx.fillStyle = '#E0F2FE'; ctx.beginPath(); ctx.arc(110 + (hash(i) - 0.5) * 30, 96 - hash(i * 3) * 30 * (t / 14), 2 + hash(i) * 2, 0, Math.PI * 2); ctx.fill(); }
    if (t >= BOARD_LEAP - 20) {
      const k = Math.min(1, (t - (BOARD_LEAP - 20)) / 26);
      for (const [x0, d] of [[40, 0], [70, 6]] as const) {
        const kk = Math.max(0, Math.min(1, k - d / 30));
        coastie(ctx, x0 + kk * 90, 70 - Math.sin(kk * Math.PI) * 40 + kk * 24, 1.2, 0.6 + Math.sin(t * 0.5) * 0.3);
      }
    }
    // (him at the wheel, looking round)
    shape(ctx, () => ctx.roundRect(150, 80, 14, 16, 4), '#E0AC69', 0.9);
    ctx.fillStyle = '#101010'; ctx.fillRect(149, 78, 16, 4);
    shape(ctx, () => ctx.arc(153, 86, 2.4, 0, Math.PI * 2), '#FFFFFF', 0.5); ctx.fillStyle = INK; ctx.fillRect(152, 86, 1, 1);
  } else if (t < BOARD_BEAT) {
    // The beating: a cloud of it filling the boat
    sea(ctx, 110, t);
    lilBass(ctx, 70, 118);
    fightCloud(ctx, 116, 84, t - BOARD_LEAP);
    // (his head out of it now and then, a black eye coming up)
    if (Math.floor((t - BOARD_LEAP) / 18) % 3 === 1) {
      const hx = 86 + (hash(Math.floor(t / 18)) - 0.5) * 60, hy = 58;
      shape(ctx, () => ctx.roundRect(hx - 8, hy - 9, 16, 18, 5), '#E0AC69', 0.9);
      ctx.fillStyle = '#101010'; ctx.fillRect(hx - 8.5, hy - 11, 17, 4);
      shape(ctx, () => ctx.arc(hx - 3, hy - 2, 3, 0, Math.PI * 2), '#6B21A8', 0.5);
      shape(ctx, () => ctx.arc(hx + 4, hy - 2, 2.2, 0, Math.PI * 2), '#FFFFFF', 0.5);
      shape(ctx, () => ctx.ellipse(hx, hy + 4, 3, 3, 0, 0, Math.PI * 2), '#7F1D1D', 0.5);
    }
  } else {
    // What's left of him: slumped over the side of his boat, lumps on lumps, eyes gone, teeth gone; them stood over him
    sea(ctx, 104, t);
    shape(ctx, () => { ctx.moveTo(-10, 104); ctx.lineTo(W + 10, 100); ctx.lineTo(W + 10, H + 4); ctx.lineTo(-10, H + 4); ctx.closePath(); }, '#F8FAFC', 1.2);
    ctx.fillStyle = '#DC2626'; ctx.fillRect(0, 114, W, 4);
    coastie(ctx, 196, 104, 2.2, -0.2);
    coastie(ctx, 226, 104, 2, 0.4, -1);
    // (the nightstick bent)
    deadFace(ctx, 96, 92, 2.3, { skin: '#D4A06A', shade: '#7C4A2A', tilt: 0.5, xEyes: true });
    ctx.fillStyle = 'rgba(88, 28, 135, 0.55)';
    for (const [lx, ly, r] of [[80, 70, 9], [108, 62, 7], [118, 88, 6]] as const) { ctx.beginPath(); ctx.arc(lx, ly, r, 0, Math.PI * 2); ctx.fill(); }
    for (const [lx, ly, r] of [[90, 52, 6], [112, 50, 5]] as const) shape(ctx, () => ctx.arc(lx, ly, r, Math.PI, 0), '#E0AC69', 0.8);
    blood(ctx, 92, 128, 12, 7, 3);
    for (let k = 0; k < 3; k++) { shape(ctx, () => ctx.ellipse(70 + k * 18, 132 + (k % 2) * 3, 2, 2.8, k, 0, Math.PI * 2), '#FEF9C3', 0.4); }
    // (his arm hanging over the side, fingers trailing in the water)
    shape(ctx, () => { ctx.moveTo(60, 104); ctx.lineTo(50, 126); ctx.lineTo(56, 128); ctx.lineTo(66, 106); ctx.closePath(); }, '#E0AC69', 0.8);
    speckle(ctx, 40, 96, 80, 20, 40, 'rgba(127, 29, 29, 0.6)', 3, 1);
  }
  rain(ctx, t);
  ctx.restore();
  // The caption: the one line
  if (t >= BOARD_LINE) {
    const y = top + H * s + 14;
    ctx.font = 'bold 13px "Press Start 2P", monospace'; ctx.textAlign = 'center';
    ctx.fillStyle = '#F97316'; ctx.fillText('COAST GUARD', CANVAS_WIDTH / 2, y + 6);
    ctx.font = '12px "Press Start 2P", monospace'; ctx.fillStyle = '#F8FAFC'; ctx.fillText('WE SAID. GET OUT. OF THE WATER.', CANVAS_WIDTH / 2, y + 28);
    ctx.textAlign = 'left';
  } else if (t < 40) {
    const y = top + H * s + 14;
    ctx.font = 'bold 13px "Press Start 2P", monospace'; ctx.textAlign = 'center';
    ctx.fillStyle = '#F97316'; ctx.fillText('COAST GUARD', CANVAS_WIDTH / 2, y + 6);
    ctx.font = '12px "Press Start 2P", monospace'; ctx.fillStyle = '#F8FAFC'; ctx.fillText('YOU ARE BEING BOARDED!', CANVAS_WIDTH / 2, y + 28);
    ctx.textAlign = 'left';
  }
  if (t < 6) { ctx.fillStyle = `rgba(0,0,0,${1 - t / 6})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  ctx.restore();
};

// ---------------------------------------------------------------------------
// Up the storm: the cutter after him, not making it
// ---------------------------------------------------------------------------

/** Frames of it (after he's out at the bottom of the storm), and the smash. */
export const DEMISE_FRAMES = 300, DEMISE_SMASH = 150;

/**
 * Screen space, over the storm: the cutter whirled up past him, spinning, its crew hanging on; then it meets a house
 * coming the other way, and comes apart, them with it, the bits whirled away round the storm and gone.
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
      if (i < 3) coastie(ctx, 0, 0, 1.6, Math.sin(s * 0.6 + i));
      else { ctx.fillStyle = ['#F8FAFC', '#EA580C', '#FDE68A', '#B91C1C', '#1E293B'][i % 5]; ctx.fillRect(-8, -4, 16, 8); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(-8, -4, 16, 8); }
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
