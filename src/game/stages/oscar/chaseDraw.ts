// The chase, drawn: the lease road across the field (rutted caliche, up and
// down), the derricks out in the field beside it (standing, going up, burning
// wrecks), oil on the road, the cars and trucks careering off into the derricks
// with the driver slumped on the horn, bikers and their choppers flying, his
// own bike under him, and the count.

import type { GameState } from '../../core/state';
import { groundLineAt } from '../../core/terrain';
import { CANVAS_WIDTH } from '../../../constants';
import { drawDirt, drawDerrick, drawPumpjack } from './fieldDraw';
import { drawPickupBody, drawCruiserBody, drawChopperBike } from '../../render/enemies/oscar';
import { drawKindCorpse } from '../../render/enemies';
import { COURSE } from './course';
import type { Chase } from './chase';
import { derrickX, DERRICKS_PER_LAP, DERRICK_BACK, KILLS_NEEDED, chaseView, farScreenX, farWreckX, FAR_N, FAR_PAR, gapAhead, slickAhead, GAP_AHEAD } from './chase';
import type { FarThing } from './chase';
import { SLICK_AHEAD } from './chase';

type Ctx = CanvasRenderingContext2D;

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
      ctx.save(); ctx.translate(x, y); drawDerrick(ctx, 1, 0.6); ctx.restore();
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
  // The jumps: the road cut clean through, a trench full of crude, barricades and flashing lights on the way up to it
  for (const g of ch.gaps) {
    if (g.x2 < v.x1 - 400 || g.x1 > v.x2 + 400) continue;
    const top = Math.min(groundLineAt(state.groundRuns, g.x1 - 2), groundLineAt(state.groundRuns, g.x2 + 2));
    const gr = ctx.createLinearGradient(0, top, 0, top + 300);
    gr.addColorStop(0, '#3D2B1C'); gr.addColorStop(0.35, '#0C0A09'); gr.addColorStop(1, '#000');
    ctx.fillStyle = gr; ctx.fillRect(g.x1, top - 2, g.x2 - g.x1, state.camera.y + 1400 - top);
    ctx.fillStyle = 'rgba(168, 85, 247, 0.5)'; ctx.fillRect(g.x1 + 20 + (state.frame % 60), top + 90, 30, 2);
    for (const bx of [g.x1 - 260, g.x1 - 30]) {
      const by = groundLineAt(state.groundRuns, bx);
      if (by === Infinity) continue;
      // A sawhorse barricade, striped, a light on top going
      ctx.fillStyle = '#57534E'; ctx.fillRect(bx - 20, by - 26, 4, 26); ctx.fillRect(bx + 16, by - 26, 4, 26);
      for (let k = 0; k < 5; k++) { ctx.fillStyle = k % 2 ? '#F8FAFC' : '#F97316'; ctx.fillRect(bx - 24 + k * 10, by - 34, 10, 10); }
      ctx.fillStyle = state.frame % 16 < 8 ? '#FDE047' : '#78350F'; ctx.beginPath(); ctx.arc(bx, by - 40, 5, 0, Math.PI * 2); ctx.fill();
    }
    const sx = g.x1 - 150, sy = groundLineAt(state.groundRuns, sx);
    if (sy !== Infinity) {
      ctx.fillStyle = '#57534E'; ctx.fillRect(sx - 2, sy - 60, 4, 60);
      ctx.fillStyle = '#F97316'; ctx.beginPath(); ctx.moveTo(sx, sy - 104); ctx.lineTo(sx + 30, sy - 74); ctx.lineTo(sx, sy - 44); ctx.lineTo(sx - 30, sy - 74); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#111827'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#111827'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center'; ctx.fillText('ROAD', sx, sy - 77); ctx.fillText('OUT', sx, sy - 67); ctx.textAlign = 'left';
    }
  }
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
  // The wrecks, on fire, the driver slumped on the horn, careering off the screen
  for (const w of ch.wrecks) {
    if (w.x < v.x1 - 300 || w.x > v.x2 + 300) continue;
    ctx.save(); ctx.translate(w.x, w.y);
    ctx.rotate(Math.sin(w.t * 0.5) * 0.07 - w.dir * 0.04);
    if (w.kind === 'pickup') drawPickupBody(ctx, PAINTS[Math.abs(Math.round(w.paint / 7)) % 4], w.t * 0.8, 0, state.frame, { critical: true, slumped: true, noThrower: true });
    else drawCruiserBody(ctx, w.t * 0.8, state.frame, 1, { critical: true, slumped: true });
    // On fire from end to end
    for (let k = 0; k < 6; k++) {
      const h = 24 + Math.sin(state.frame * 0.4 + k) * 8, x = -60 + k * 24;
      ctx.fillStyle = 'rgba(234, 88, 12, 0.85)'; ctx.beginPath(); ctx.moveTo(x - 10, -40); ctx.quadraticCurveTo(x, -40 - h, x + 10, -40); ctx.fill();
      ctx.fillStyle = 'rgba(253, 224, 71, 0.9)'; ctx.beginPath(); ctx.moveTo(x - 5, -40); ctx.quadraticCurveTo(x, -40 - h * 0.6, x + 5, -40); ctx.fill();
    }
    if (w.t % 16 < 8) { ctx.fillStyle = '#FDE047'; ctx.font = 'bold 14px monospace'; ctx.fillText('HOOONK', 20, -90); }
    ctx.restore();
  }
};

const PAINTS = ['#B91C1C', '#1D4ED8', '#F5F5F4', '#166534'];

/**
 * Out across the field in the distance (screen space, over the sky, going by slower than the road): derricks, tanks, a
 * refinery column, flare stacks; the wrecks careering across it on fire, horns going; the fireball when one hits; and
 * everything that's been hit burning, the smoke going up off it.
 */
export const drawFarField = (ctx: Ctx, state: GameState, ch: Chase) => {
  const base = ch.farBase;
  // The field out there: flat, dusty, going off to the horizon (everything out there stands on it, the wrecks drive on it)
  const g = ctx.createLinearGradient(0, base - 6, 0, base + 160);
  g.addColorStop(0, '#6B5236'); g.addColorStop(0.3, '#7A5C3C'); g.addColorStop(1, '#5B4128');
  ctx.fillStyle = g; ctx.fillRect(0, base - 4, CANVAS_WIDTH, 600 - base + 4);
  ctx.fillStyle = 'rgba(210, 180, 140, 0.35)'; ctx.fillRect(0, base - 4, CANVAS_WIDTH, 2);
  // (a lease road across it, a fence, the odd scrub)
  const off = ((ch.odo * FAR_PAR * 1.2) % 60 + 60) % 60;
  ctx.fillStyle = 'rgba(160, 130, 95, 0.5)'; ctx.fillRect(0, base + 10, CANVAS_WIDTH, 5);
  ctx.fillStyle = 'rgba(40, 30, 20, 0.6)'; for (let x = -off; x < CANVAS_WIDTH; x += 60) ctx.fillRect(x, base - 12, 2, 10);
  ctx.fillRect(0, base - 9, CANVAS_WIDTH, 1);
  for (let i = 0; i < FAR_N; i++) {
    const x = farScreenX(ch, i);
    if (x < -150 || x > CANVAS_WIDTH + 150) continue;
    const f = ch.far[i];
    ctx.save(); ctx.translate(x, base);
    if (f.state === 'standing' || f.state === 'fuse') drawFarThing(ctx, f.look, state.frame + i * 20);
    else drawFarRuin(ctx, f, state.frame + i * 13);
    ctx.restore();
  }
  for (const w of ch.farWrecks) {
    const x = farWreckX(ch, w);
    ctx.save(); ctx.translate(x, base + 2); ctx.scale(0.42, 0.42);
    ctx.rotate(Math.sin(w.t * 0.6) * 0.1);
    const dir = (w.l1 > w.l0 ? 1 : -1);
    ctx.scale(dir, 1);
    if (w.kind === 'pickup') drawPickupBody(ctx, PAINTS[Math.abs(Math.round(w.paint / 7)) % 4], w.t, 0, state.frame, { slumped: true, noThrower: true });
    else drawCruiserBody(ctx, w.t, state.frame, 1, { slumped: true });
    for (let k = 0; k < 5; k++) { const h = 40 + Math.sin(state.frame * 0.4 + k) * 12; ctx.fillStyle = k % 2 ? 'rgba(234, 88, 12, 0.9)' : 'rgba(253, 224, 71, 0.9)'; ctx.beginPath(); ctx.moveTo(-60 + k * 28 - 12, -40); ctx.quadraticCurveTo(-60 + k * 28, -40 - h, -60 + k * 28 + 12, -40); ctx.fill(); }
    ctx.restore();
    // The trail of smoke off it
    for (let k = 0; k < 4; k++) { const q = ((state.frame + k * 12) % 48) / 48; ctx.fillStyle = `rgba(41, 37, 36, ${0.5 * (1 - q)})`; ctx.beginPath(); ctx.arc(x - dir * (10 + q * 30), base - 18 - q * 30, 4 + q * 10, 0, Math.PI * 2); ctx.fill(); }
  }
};

/** Something standing out in the distance, small. */
const drawFarThing = (ctx: Ctx, look: FarThing['look'], f: number) => {
  switch (look) {
    case 'derrick': drawDerrick(ctx, 1, 0.42); break;
    case 'tank':
      ctx.fillStyle = '#78716C'; ctx.fillRect(-34, -44, 68, 44); ctx.fillStyle = '#A8A29E'; ctx.fillRect(-34, -44, 68, 5);
      ctx.fillStyle = '#57534E'; for (let y = -34; y < 0; y += 10) ctx.fillRect(-34, y, 68, 1);
      break;
    case 'column':
      ctx.fillStyle = '#57534E'; ctx.fillRect(-9, -150, 18, 150); ctx.fillRect(-20, -40, 40, 40);
      ctx.strokeStyle = '#78716C'; ctx.lineWidth = 1.5; for (let y = -140; y < -40; y += 16) { ctx.beginPath(); ctx.moveTo(-12, y); ctx.lineTo(12, y); ctx.stroke(); }
      if (f % 60 < 30) { ctx.fillStyle = '#EF4444'; ctx.fillRect(-2, -154, 4, 4); }
      break;
    case 'flare': {
      ctx.fillStyle = '#57534E'; ctx.fillRect(-3, -120, 6, 120);
      const h = 18 + Math.sin(f * 0.35) * 5;
      ctx.fillStyle = 'rgba(249, 115, 22, 0.9)'; ctx.beginPath(); ctx.moveTo(-6, -120); ctx.quadraticCurveTo(0, -120 - h * 1.4, 6, -120); ctx.fill();
      break;
    }
  }
};

/** Something out there that's been hit: the blast, then a wreck burning, a column of smoke going up high off it. */
const drawFarRuin = (ctx: Ctx, fr: FarThing, f: number) => {
  // The wreck of it
  ctx.fillStyle = '#1C1917';
  if (fr.look === 'column') ctx.fillRect(-10, -60, 20, 60); else if (fr.look === 'tank') { ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(-30, -20); ctx.lineTo(-10, -30); ctx.lineTo(10, -14); ctx.lineTo(30, -26); ctx.lineTo(34, 0); ctx.closePath(); ctx.fill(); }
  else { ctx.save(); ctx.scale(0.42, 0.42); ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-20, -110); ctx.lineTo(50, -150); ctx.moveTo(40, 0); ctx.lineTo(10, -100); ctx.stroke(); ctx.restore(); }
  // The smoke going up, and the fire under it
  for (let k = 0; k < 7; k++) {
    const q = ((f * 0.8 + k * 20) % 140) / 140;
    ctx.fillStyle = `rgba(28, 25, 23, ${0.75 * (1 - q)})`; ctx.beginPath(); ctx.arc(Math.sin(k * 1.7) * 10 + q * 60, -40 - q * 360, 14 + q * 60, 0, Math.PI * 2); ctx.fill();
  }
  for (let k = 0; k < 5; k++) {
    const h = 30 + Math.sin(f * 0.3 + k) * 10 + (k % 2) * 16, x = -30 + k * 15;
    ctx.fillStyle = 'rgba(234, 88, 12, 0.9)'; ctx.beginPath(); ctx.moveTo(x - 9, 0); ctx.quadraticCurveTo(x, -h, x + 9, 0); ctx.fill();
    ctx.fillStyle = 'rgba(253, 224, 71, 0.9)'; ctx.beginPath(); ctx.moveTo(x - 4, 0); ctx.quadraticCurveTo(x, -h * 0.6, x + 4, 0); ctx.fill();
  }
  if (fr.state === 'blowing') {
    // The fireball: blinding, then rolling up into a mushroom of smoke
    const k = fr.t / 60;
    const g = ctx.createRadialGradient(0, -40 - k * 60, 4, 0, -40 - k * 60, 40 + k * 140);
    g.addColorStop(0, `rgba(255, 255, 255, ${1 - k})`); g.addColorStop(0.3, `rgba(253, 224, 71, ${0.95 * (1 - k)})`); g.addColorStop(0.7, `rgba(234, 88, 12, ${0.8 * (1 - k)})`); g.addColorStop(1, 'rgba(120, 30, 10, 0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -40 - k * 60, 40 + k * 140, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(255, 247, 214, ${0.8 * (1 - k)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 30 + k * 260, 6 + k * 20, 0, 0, Math.PI * 2); ctx.stroke();
  }
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

/**
 * What's coming up that isn't on the screen yet: a jump (the road's out), or oil on the road. A flashing sign at the
 * right edge, chevrons racing toward it, a bar filling as it gets close.
 */
export const drawChaseWarnings = (ctx: Ctx, state: GameState, ch: Chase) => {
  if (ch.phase !== 'riding') return;
  const g = gapAhead(state, ch), s = slickAhead(state, ch);
  const gap = g && !g.onScreen ? g : null, oil = s && !s.onScreen ? s : null;
  const w = gap && (!oil || gap.dist < oil.dist + 400) ? { dist: gap.dist, max: GAP_AHEAD, big: 'JUMP AHEAD!', small: 'THE ROAD IS OUT', face: '#DC2626', dark: '#991B1B', chevron: '#FCA5A5' }
    : oil ? { dist: oil.dist, max: SLICK_AHEAD + 900, big: 'OIL AHEAD!', small: 'JUMP IT', face: '#7E22CE', dark: '#581C87', chevron: '#D8B4FE' } : null;
  if (!w) return;
  const k = Math.max(0, Math.min(1, 1 - w.dist / w.max));
  const x = CANVAS_WIDTH - 150, y = 250, bw = 138, bh = 64;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(x - 4, y - 4, bw + 8, bh + 8);
  ctx.fillStyle = state.frame % 20 < 10 ? w.face : w.dark; ctx.fillRect(x, y, bw, bh);
  ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 2; ctx.strokeRect(x + 4, y + 4, bw - 8, bh - 8);
  ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 10px "Press Start 2P", monospace'; ctx.textAlign = 'center'; ctx.fillText(w.big, x + bw / 2, y + 22);
  ctx.font = 'bold 7px "Press Start 2P", monospace'; ctx.fillText(w.small, x + bw / 2, y + 38);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x + 12, y + 46, bw - 24, 8);
  ctx.fillStyle = '#FDE047'; ctx.fillRect(x + 12, y + 46, (bw - 24) * k, 8);
  ctx.fillStyle = w.chevron; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
  for (let c = 0; c < 3; c++) {
    const cx = x - 40 + ((state.frame * 2 + c * 14) % 42), a = 1 - ((state.frame * 2 + c * 14) % 42) / 42;
    ctx.globalAlpha = 0.3 + a * 0.7;
    ctx.beginPath(); ctx.moveTo(cx, y + 18); ctx.lineTo(cx + 12, y + 32); ctx.lineTo(cx, y + 46); ctx.lineTo(cx - 6, y + 46); ctx.lineTo(cx + 6, y + 32); ctx.lineTo(cx - 6, y + 18); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
  ctx.textAlign = 'left';
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
