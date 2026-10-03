// The chase, drawn: the lease road across the field (rutted caliche, up and
// down), the derricks out in the field beside it (standing, going up, burning
// wrecks), oil on the road, the cars and trucks careering off into the derricks
// with the driver slumped on the horn, bikers and their choppers flying, his
// own bike under him, and the count.

import type { GameState } from '../../core/state';
import { bandedGradient, hazeBands, pixelBlob, steppedGlow } from '../../render/pixelArt';
import { INK, ink, shaded } from '../../render/npc/kit';
import { slab, column, letter } from '../barry/rooms';
import { sheen, strut } from './kit';
import { drawFire } from '../../render/fx/fire';
import { groundLineAt } from '../../core/terrain';
import { CANVAS_WIDTH, topBand } from '../../../constants';
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
  // (worn in, a stepped groove: the shadow in it, the lit lip under)
  for (let x = Math.floor(v.x1 / 4) * 4; x < v.x2 + 40; x += 4) {
    const y = groundLineAt(state.groundRuns, x);
    if (y === Infinity) continue;
    const ry = Math.round((y + 10) / 2) * 2;
    ctx.fillStyle = 'rgba(74, 52, 30, 0.7)'; ctx.fillRect(x, ry, 4, 2);
    ctx.fillStyle = 'rgba(214, 186, 140, 0.35)'; ctx.fillRect(x, ry + 2, 4, 1);
  }
  // The jumps: the road cut clean through, a trench full of crude, barricades and flashing lights on the way up to it
  for (const g of ch.gaps) {
    if (g.x2 < v.x1 - 400 || g.x1 > v.x2 + 400) continue;
    const top = Math.min(groundLineAt(state.groundRuns, g.x1 - 2), groundLineAt(state.groundRuns, g.x2 + 2));
    ctx.fillStyle = '#000'; ctx.fillRect(g.x1, top - 2, g.x2 - g.x1, state.camera.y + 1400 - top);
    bandedGradient(ctx, g.x1, top - 2, g.x2 - g.x1, 300, ['#3D2B1C', '#2A1C12', '#0C0A09', '#050403', '#000000'], 10);
    ctx.fillStyle = 'rgba(168, 85, 247, 0.5)'; ctx.fillRect(g.x1 + 20 + (state.frame % 60), top + 90, 30, 2);
    for (const bx of [g.x1 - 260, g.x1 - 30]) {
      const by = groundLineAt(state.groundRuns, bx);
      if (by === Infinity) continue;
      // A sawhorse barricade, striped, a light on top going
      strut(ctx, bx - 22, by, bx - 16, by - 30, 3, '#57534E'); strut(ctx, bx + 22, by, bx + 16, by - 30, 3, '#57534E');
      for (let k = 0; k < 5; k++) { ctx.fillStyle = k % 2 ? '#F8FAFC' : '#F97316'; ctx.fillRect(bx - 24 + k * 10, by - 34, 10, 10); }
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(bx - 24, by - 34, 50, 2); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(bx - 24, by - 26, 50, 2);
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(bx - 23.5, by - 33.5, 49, 9);
      const lit = state.frame % 16 < 8;
      if (lit) steppedGlow(ctx, bx, by - 40, 16, '#FDE047', 0.4, 0.08, 3);
      ink(ctx, () => ctx.arc(bx, by - 40, 5, 0, Math.PI * 2), lit ? '#FDE047' : '#78350F');
      ctx.fillStyle = lit ? '#FEF9C3' : '#A16207'; ctx.fillRect(bx - 3, by - 43, 2, 2);
      slab(ctx, bx - 3, by - 36, 6, 2, '#292524', 1);
    }
    const sx = g.x1 - 150, sy = groundLineAt(state.groundRuns, sx);
    if (sy !== Infinity) {
      column(ctx, sx - 2, sy - 60, 4, 60, '#57534E');
      // (a diamond on its post: a dark rim, the orange face lit along its upper left, its bolts)
      const diamond = (r: number) => () => { ctx.moveTo(sx, sy - 74 - r); ctx.lineTo(sx + r, sy - 74); ctx.lineTo(sx, sy - 74 + r); ctx.lineTo(sx - r, sy - 74); ctx.closePath(); };
      ink(ctx, diamond(30), '#111827', 1);
      shaded(ctx, diamond(27), '#F97316', sx - 27, sy - 101, 54, 54);
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(sx - 1, sy - 98, 2, 2); ctx.fillRect(sx - 1, sy - 52, 2, 2);
      letter(ctx, 'ROAD', sx, sy - 77, 'bold 8px monospace', '#111827', '#FDBA74');
      letter(ctx, 'OUT', sx, sy - 67, 'bold 8px monospace', '#111827', '#FDBA74');
    }
  }
  // Oil on the road: a black slick with its sheen (jump it)
  for (const s of ch.slicks) {
    for (let x = s.x - s.w / 2; x < s.x + s.w / 2; x += 8) {
      const y = groundLineAt(state.groundRuns, x);
      const edge = Math.min(1, (x - (s.x - s.w / 2)) / 20, (s.x + s.w / 2 - x) / 20);
      ctx.fillStyle = '#0C0A09'; ctx.fillRect(x, y - 1, 8.5, Math.round(5 * edge) + 2);
      ctx.fillStyle = '#1E1B2E'; ctx.fillRect(x, y, 8.5, 1);
    }
    const y0 = groundLineAt(state.groundRuns, s.x);
    sheen(ctx, s.x - 20, y0, 36, 0.5 + Math.sin(state.frame * 0.2) * 0.2);
    // (a hazard flag stuck in the dirt by it)
    column(ctx, s.x - s.w / 2 - 15, y0 - 34, 3, 34, '#57534E');
    ink(ctx, () => { ctx.moveTo(s.x - s.w / 2 - 12, y0 - 34); ctx.lineTo(s.x - s.w / 2 + 4, y0 - 29); ctx.lineTo(s.x - s.w / 2 - 12, y0 - 24); ctx.closePath(); }, state.frame % 20 < 10 ? '#A855F7' : '#FACC15');
  }
  // The wrecks, on fire, the driver slumped on the horn, careering off the screen
  for (const w of ch.wrecks) {
    if (w.x < v.x1 - 300 || w.x > v.x2 + 300) continue;
    ctx.save(); ctx.translate(w.x, w.y);
    ctx.rotate(Math.sin(w.t * 0.5) * 0.07 - w.dir * 0.04);
    if (w.kind === 'pickup') drawPickupBody(ctx, PAINTS[Math.abs(Math.round(w.paint / 7)) % 4], w.t * 0.8, 0, state.frame, { critical: true, slumped: true, noThrower: true });
    else drawCruiserBody(ctx, w.t * 0.8, state.frame, 1, { critical: true, slumped: true });
    // On fire from end to end
    drawFire(ctx, 0, -38, 150, 36, state.frame, { seed: Math.floor(w.paint), smoke: 0.35 });
    if (w.t % 16 < 8) { ctx.font = 'bold 14px monospace'; ctx.fillStyle = INK; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [2, 2]]) ctx.fillText('HOOONK', 20 + dx, -90 + dy); ctx.fillStyle = '#FDE047'; ctx.fillText('HOOONK', 20, -90); }
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
  ctx.fillStyle = '#5B4128'; ctx.fillRect(0, base - 4, CANVAS_WIDTH, 600 - base + 4);
  bandedGradient(ctx, 0, base - 4, CANVAS_WIDTH, 160, ['#6B5236', '#7A5C3C', '#6E5134', '#5B4128'], 8);
  ctx.fillStyle = 'rgba(210, 180, 140, 0.35)'; ctx.fillRect(0, base - 4, CANVAS_WIDTH, 2);
  // (the dust in the air out there: the horizon's edge softened into the sky)
  hazeBands(ctx, 0, base - 16, CANVAS_WIDTH, 14, '#C27A3A', 0.3, 0, 4);
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
    ctx.restore();
    // (on fire end to end: drawn out here, not shrunk with it, so it stays as chunky as the rest)
    drawFire(ctx, x, base - 14, 64, 22, state.frame, { seed: Math.floor(w.paint) + 5, glow: 0.6 });
    // The trail of smoke off it
    for (let k = 0; k < 4; k++) { const q = ((state.frame + k * 12) % 48) / 48; pixelBlob(ctx, x - dir * (10 + q * 30), base - 18 - q * 30, 4 + q * 10, 3 + q * 8, `rgba(41, 37, 36, ${(0.5 * (1 - q)).toFixed(3)})`); }
  }
};

/** Something standing out in the distance, small. */
const drawFarThing = (ctx: Ctx, look: FarThing['look'], f: number) => {
  switch (look) {
    case 'derrick': drawDerrick(ctx, 1, 0.42); break;
    case 'tank':
      column(ctx, -34, -44, 68, 44, '#78716C');
      ctx.fillStyle = '#57534E'; for (let y = -34; y < 0; y += 10) ctx.fillRect(-33, y, 66, 1);
      slab(ctx, -35, -46, 70, 5, '#A8A29E', 1);
      break;
    case 'column':
      column(ctx, -20, -40, 40, 40, '#57534E');
      column(ctx, -9, -150, 18, 112, '#57534E');
      for (let y = -140; y < -40; y += 16) slab(ctx, -12, y - 1, 24, 3, '#78716C', 1);
      if (f % 60 < 30) { steppedGlow(ctx, 0, -152, 8, '#EF4444', 0.4, 0.1, 3); ctx.fillStyle = '#EF4444'; ctx.fillRect(-2, -154, 4, 4); }
      break;
    case 'flare': {
      column(ctx, -3, -120, 6, 120, '#57534E');
      drawFire(ctx, 0, -119, 12, 34, f, { seed: 17, sparks: false, glow: 0.6 });
      break;
    }
  }
};

/** Something out there that's been hit: the blast, then a wreck burning, a column of smoke going up high off it. */
const drawFarRuin = (ctx: Ctx, fr: FarThing, f: number) => {
  // The wreck of it
  if (fr.look === 'column') { ink(ctx, () => { ctx.moveTo(-10, 0); ctx.lineTo(-10, -52); ctx.lineTo(-4, -60); ctx.lineTo(2, -54); ctx.lineTo(10, -62); ctx.lineTo(10, 0); ctx.closePath(); }, '#1C1917'); ctx.fillStyle = '#292524'; ctx.fillRect(-8, -50, 4, 50); }
  else if (fr.look === 'tank') { ink(ctx, () => { ctx.moveTo(-34, 0); ctx.lineTo(-30, -20); ctx.lineTo(-10, -30); ctx.lineTo(10, -14); ctx.lineTo(30, -26); ctx.lineTo(34, 0); ctx.closePath(); }, '#1C1917'); ctx.fillStyle = '#292524'; ctx.fillRect(-28, -16, 10, 16); }
  else { ctx.save(); ctx.scale(0.42, 0.42); strut(ctx, -40, 0, -20, -110, 5, '#1C1917'); strut(ctx, -20, -110, 50, -150, 5, '#1C1917'); strut(ctx, 40, 0, 10, -100, 5, '#1C1917'); ctx.restore(); }
  // The smoke going up, and the fire under it
  for (let k = 0; k < 7; k++) {
    const q = ((f * 0.8 + k * 20) % 140) / 140;
    pixelBlob(ctx, Math.sin(k * 1.7) * 10 + q * 60, -40 - q * 360, 14 + q * 60, 12 + q * 50, `rgba(28, 25, 23, ${(0.75 * (1 - q)).toFixed(3)})`, 4);
  }
  drawFire(ctx, 0, 1, 84, 50, f, { seed: 23 });
  if (fr.state === 'blowing') {
    // The fireball: blinding, then rolling up into a mushroom of smoke
    const k = fr.t / 60;
    // (in hard rings: a red rim, orange, yellow, a white-hot heart)
    const cy = -40 - k * 60, R = 40 + k * 140, a = Math.max(0, 1 - k);
    steppedGlow(ctx, 0, cy, R, '#9A3412', 0.5 * a, 0.25 * a, 3);
    steppedGlow(ctx, 0, cy, R * 0.7, '#EA580C', 0.8 * a, 0.6 * a, 3);
    steppedGlow(ctx, 0, cy, R * 0.45, '#FDE047', 0.95 * a, 0.85 * a, 2);
    steppedGlow(ctx, 0, cy, R * 0.22, '#FFFFFF', a, a, 2);
    // (the shock ring along the ground, in cells)
    const rx = 30 + k * 260, ry = 6 + k * 20;
    ctx.fillStyle = `rgba(255, 247, 214, ${(0.8 * a).toFixed(3)})`;
    for (let i = 0; i < 48; i++) { const t = (i / 48) * Math.PI * 2; ctx.fillRect(Math.round(Math.cos(t) * rx / 2) * 2 - 2, Math.round(Math.sin(t) * ry / 2) * 2 - 1, 4, 2); }
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
  // (in the band along the top that's clear of the main HUD, against its right end)
  const band = topBand(), bx = band.x2 - 368;
  ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(bx, 10, 368, 30);
  ctx.fillStyle = '#44403C'; ctx.fillRect(bx + 6, 26, 356, 9);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(bx + 6, 26, 356 * left, 9);
  ctx.fillStyle = '#FECACA'; ctx.font = 'bold 8px "Press Start 2P", monospace'; ctx.fillText('THE ANGRY MOB', bx + 8, 22);
  ctx.textAlign = 'right'; ctx.fillText(`${Math.max(0, KILLS_NEEDED - ch.kills)} LEFT`, bx + 362, 22);
  ctx.textAlign = 'left';
  // The hint, under it
  if (ch.hintT > 0 && ch.hint) {
    const a = Math.min(1, ch.hintT / 15, (200 - ch.hintT) / 20);
    ctx.save(); ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(band.x1, 60, band.x2 - band.x1, 26);
    ctx.fillStyle = '#FDE68A'; ctx.font = 'bold 8px "Press Start 2P", monospace'; ctx.textAlign = 'center'; ctx.fillText(ch.hint, band.mid, 77, band.x2 - band.x1 - 12); ctx.textAlign = 'left';
    ctx.restore();
  }
};

void CANVAS_WIDTH;
