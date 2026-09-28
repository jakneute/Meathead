// The chase, drawn: the lease road across the field (rutted caliche, up and
// down), the derricks out in the field beside it (standing, going up, burning
// wrecks), oil on the road, the cars and trucks careering off into the derricks
// with the driver slumped on the horn, bikers and their choppers flying, his
// own bike under him, and the count.

import type { GameState } from '../../core/state';
import { groundLineAt } from '../../core/terrain';
import { CANVAS_WIDTH } from '../../../constants';
import { drawDirt, drawDerrick, drawPumpjack } from './fieldDraw';
import { drawPickupBody, drawCruiserBody, drawChopperBike, drawCriticalSmoke } from '../../render/enemies/oscar';
import { drawKindCorpse } from '../../render/enemies';
import { COURSE } from './course';
import type { Chase } from './chase';
import { derrickX, DERRICKS_PER_LAP, DERRICK_BACK, KILLS_NEEDED, chaseView } from './chase';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** The field beside the road, the derricks in it (and whatever state they're in), the road itself. */
export const drawChaseBack = (ctx: Ctx, state: GameState, ch: Chase) => {
  const v = chaseView(state, ch);
  const lap0 = Math.floor((v.x1 - COURSE.chase.x1) / COURSE.chase.lap) - 1;
  // The derricks (and a pumpjack between each), back off the road
  for (let lap = lap0; lap <= lap0 + 2; lap++) {
    for (let i = 0; i < DERRICKS_PER_LAP; i++) {
      const x = derrickX(i, lap);
      if (x < v.x1 - 200 || x > v.x2 + 200) continue;
      const y = groundLineAt(state.groundRuns, x) - DERRICK_BACK;
      const d = ch.derricks[i];
      ctx.save(); ctx.translate(x, y);
      if (d.state === 'standing') drawDerrick(ctx, 1, 0.6);
      else drawDerrickRuin(ctx, state.frame + i * 13, d.state === 'blowing' ? d.t : 999);
      ctx.restore();
      const px = x + COURSE.chase.lap / DERRICKS_PER_LAP / 2;
      if (px > v.x1 - 150 && px < v.x2 + 150) { ctx.save(); ctx.translate(px, groundLineAt(state.groundRuns, px)); drawPumpjack(ctx, state.frame + i * 40, 0.55); ctx.restore(); }
    }
  }
  // The road: rutted dirt, up and down
  const runs = state.groundRuns.filter(r => r.x2 > v.x1 - 100 && r.x1 < v.x2 + 100);
  drawDirt(ctx, state, runs, v);
  // The ruts
  ctx.strokeStyle = 'rgba(92, 66, 40, 0.6)'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = Math.floor(v.x1 / 40) * 40; x < v.x2 + 40; x += 40) { const y = groundLineAt(state.groundRuns, x) + 10; if (x === Math.floor(v.x1 / 40) * 40) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
  ctx.stroke();
  // Oil on the road: a black slick with its sheen (jump it)
  for (const s of ch.slicks) {
    for (let x = s.x - s.w / 2; x < s.x + s.w / 2; x += 8) {
      const y = groundLineAt(state.groundRuns, x);
      const edge = Math.min(1, (x - (s.x - s.w / 2)) / 20, (s.x + s.w / 2 - x) / 20);
      ctx.fillStyle = '#0C0A09'; ctx.fillRect(x, y - 1, 8.5, 5 * edge + 2);
    }
    const y0 = groundLineAt(state.groundRuns, s.x);
    ctx.fillStyle = `rgba(168, 85, 247, ${0.5 + Math.sin(state.frame * 0.2) * 0.2})`; ctx.fillRect(s.x - 20, y0, 18, 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.6)'; ctx.fillRect(s.x, y0 + 1, 16, 2);
    // (a hazard flag stuck in the dirt by it)
    ctx.fillStyle = '#57534E'; ctx.fillRect(s.x - s.w / 2 - 14, y0 - 34, 2, 34);
    ctx.fillStyle = state.frame % 20 < 10 ? '#A855F7' : '#FACC15'; ctx.beginPath(); ctx.moveTo(s.x - s.w / 2 - 12, y0 - 34); ctx.lineTo(s.x - s.w / 2 + 4, y0 - 29); ctx.lineTo(s.x - s.w / 2 - 12, y0 - 24); ctx.fill();
  }
  // The wrecks, off in the field (driver slumped on the horn), and what's left of them in the derricks they hit
  for (const w of ch.wrecks) {
    if (w.x < v.x1 - 300 || w.x > v.x2 + 300) continue;
    const k = Math.min(1, w.t / w.dur);
    const s = 1 - k * 0.4;
    ctx.save(); ctx.translate(w.x, w.y); ctx.scale(s, s);
    if (!w.hit) {
      ctx.rotate(Math.sin(w.t * 0.5) * 0.08);
      if (w.kind === 'pickup') drawPickupBody(ctx, ['#B91C1C', '#1D4ED8', '#F5F5F4', '#166534'][Math.abs(Math.round(w.paint / 7)) % 4], w.t * 0.8, 0, state.frame, { critical: true, slumped: true, noThrower: true });
      else drawCruiserBody(ctx, w.t * 0.8, state.frame, 1, { critical: true, slumped: true });
      // HOOOONK
      if (w.t % 16 < 8) { ctx.fillStyle = '#FDE047'; ctx.font = 'bold 14px monospace'; ctx.fillText('HOOONK', 20, -80); }
    } else {
      // A burnt-out shell at the foot of the derrick
      ctx.fillStyle = '#1C1917'; ctx.fillRect(-60, -34, 120, 22); ctx.fillRect(-20, -52, 50, 20);
      ctx.fillStyle = '#292524'; ctx.beginPath(); ctx.arc(-40, -12, 11, 0, Math.PI * 2); ctx.arc(42, -12, 11, 0, Math.PI * 2); ctx.fill();
      drawCriticalSmoke(ctx, 0, -40, state.frame + w.derrick * 7);
    }
    ctx.restore();
  }
};

/** A derrick that's gone up: the tower folded over and burning, a column of smoke and fire going up off it (a blast still going if `t` is small). */
const drawDerrickRuin = (ctx: Ctx, f: number, t: number) => {
  ctx.save(); ctx.scale(0.6, 0.6);
  // What's left of the tower, bent over
  ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-24, -110); ctx.lineTo(40, -150); ctx.moveTo(40, 0); ctx.lineTo(10, -100); ctx.lineTo(70, -120); ctx.stroke();
  ctx.lineWidth = 2; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-36 + k * 4, -k * 28); ctx.lineTo(36 - k * 8, -k * 26 - 20); ctx.stroke(); }
  ctx.fillStyle = '#1C1917'; ctx.fillRect(-50, -14, 100, 14);
  // The fire, roaring, and the smoke off it
  for (let k = 0; k < 6; k++) {
    const q = ((f * 1.5 + k * 23) % 60) / 60;
    ctx.fillStyle = `rgba(41, 37, 36, ${0.7 * (1 - q)})`; ctx.beginPath(); ctx.arc(Math.sin(k) * 20 + q * 30, -120 - q * 300, 20 + q * 50, 0, Math.PI * 2); ctx.fill();
  }
  for (let k = 0; k < 7; k++) {
    const h = 60 + Math.sin(f * 0.3 + k) * 20 + hash(k) * 40;
    const x = -50 + k * 16;
    ctx.fillStyle = 'rgba(234, 88, 12, 0.85)'; ctx.beginPath(); ctx.moveTo(x - 12, 0); ctx.quadraticCurveTo(x, -h, x + 12, 0); ctx.fill();
    ctx.fillStyle = 'rgba(253, 224, 71, 0.9)'; ctx.beginPath(); ctx.moveTo(x - 6, 0); ctx.quadraticCurveTo(x, -h * 0.6, x + 6, 0); ctx.fill();
  }
  if (t < 50) {
    // The blast
    const k = t / 50;
    ctx.fillStyle = `rgba(255, 247, 214, ${1 - k})`; ctx.beginPath(); ctx.arc(0, -120, 60 + k * 160, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(249, 115, 22, ${0.8 * (1 - k)})`; ctx.beginPath(); ctx.arc(0, -120, 40 + k * 120, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
};

/** Bikers and their choppers, rammed or shot off: the man one way, the bike cartwheeling down the road. */
export const drawChaseThrown = (ctx: Ctx, state: GameState, ch: Chase) => {
  for (const t of ch.thrown) {
    ctx.save(); ctx.translate(t.x, t.y); ctx.rotate(t.rot);
    if (t.what === 'bike') drawChopperBike(ctx, 0, 30, 0, t.rot * 3, ['#111827', '#7F1D1D', '#1E3A8A'][Math.abs(Math.round(t.paint / 7)) % 3]);
    else drawKindCorpse(ctx, 'biker', -27, -36, 54, 72, 1, Math.abs(t.paint) % 997, state);
    ctx.restore();
  }
};

/** His own bike under him: Dirty Dan's chopper, tipped with the ground, up on its back wheel for a wheelie, and fishtailing in a spin. */
export const drawRiddenMoto = (ctx: Ctx, state: GameState, ch: Chase | null) => {
  const p = state.player;
  if (!p.moto || p.hidden || state.deathTimer > 0) return;
  const x = p.pos.x + p.width / 2, y = p.pos.y + p.height;
  const ground = p.isGrounded ? Math.atan2(groundLineAt(state.groundRuns, x + 30) - groundLineAt(state.groundRuns, x - 30), 60) : 0;
  const spin = ch && ch.spin > 0 ? Math.sin(ch.spin * 0.8) * 0.35 : 0;
  const tilt = ground + spin + (p.isCharging ? -0.4 : p.isDivekicking ? 0.5 : p.isUppercutting ? -0.3 : 0);
  drawChopperBike(ctx, x - 6, y + 2, tilt, p.pos.x / 12, '#7F1D1D');
};

/** THE ANGRY MOB, top right, a boss's bar: it goes down as he wrecks them. */
export const drawChaseHud = (ctx: Ctx, ch: Chase) => {
  if (ch.phase !== 'riding' && ch.phase !== 'won') return;
  const left = Math.max(0, 1 - ch.kills / KILLS_NEEDED);
  ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(420, 10, 368, 30);
  ctx.fillStyle = '#44403C'; ctx.fillRect(426, 26, 356, 9);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(426, 26, 356 * left, 9);
  ctx.fillStyle = '#FECACA'; ctx.font = 'bold 8px "Press Start 2P", monospace'; ctx.fillText('THE ANGRY MOB', 428, 22);
  ctx.textAlign = 'right'; ctx.fillText(`${Math.max(0, KILLS_NEEDED - ch.kills)} LEFT`, 782, 22);
  ctx.textAlign = 'left';
  // The hint, under it
  if (ch.hintT > 0 && ch.hint) {
    const a = Math.min(1, ch.hintT / 15, (200 - ch.hintT) / 20);
    ctx.save(); ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(160, 60, 480, 26);
    ctx.fillStyle = '#FDE68A'; ctx.font = 'bold 8px "Press Start 2P", monospace'; ctx.textAlign = 'center'; ctx.fillText(ch.hint, 400, 77); ctx.textAlign = 'left';
    ctx.restore();
  }
};

void CANVAS_WIDTH;
