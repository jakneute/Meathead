// What's out to get him on the ride (and anything else in the way: the rats, the crows): the saws Tucker engaged (wall,
// rising, dropping, swinging, rail, and the sewer's loose rolling ones), the cutter that cuts the flume at the break,
// the animatronic frontier being shredded as the log comes, the sewer's low pipes and gushers, the real river's rocks
// and low branches. Every one telegraphed (a saw spins up loud as it comes on screen; a drop shudders before it falls;
// a gusher gurgles and drips first; a rising saw boils the water; a rail saw sparks along its rail), and every one hits
// the cast too (hazardHit.ts). A saw shot enough jams (smoking, stopped): the other way past it.
//
// Drawn crude: steel discs with their teeth and a hub, hazard-striped mounts, motion blur on the spin.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { registerHurtLines } from '../../kinds';
import { hazardHit, hazardVictims, boxHits, setHazardZones } from '../../hazardHit';
import { meatheadSays, byPants } from '../section';
import { box, mix, INK, onScreen, hash, type Ctx } from '../kit';
import { rideOf, type Saw } from './state';
import { riderBox, feetY } from './ride';
import { X, waterY, SAWS, PROPS, PIPES, GUSHERS, ROCKS, BRANCHES, CUTTER_X, type PropKind } from './layout';
import { HURT, BREAKOUT } from './lines';

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);

const SAW_DMG = 15;
const STEEL = '#C8CDD4', STEEL_D = '#7A808A', STEEL_L = '#F1F5F9';
const STRIPE_Y = '#FACC15', STRIPE_K = '#1C1917';

// ---------------------------------------------------------------------------------------------------------------
// Building

export const buildHazards = (state: GameState) => {
  const r = rideOf(state);
  r.saws = SAWS.map(([type, x, phase]) => ({ type, x, phase: phase ?? 0, cx: X(x), cy: waterY(x), r: radius(type), spin: hash(x) * 6, k: 0, t: 0, live: false, done: false, jam: 0, hits: 0 }));
  r.props = PROPS.map(([x, kind]) => ({ x, kind, t: 0, shred: false }));
  r.rocks = ROCKS.map(x => ({ x, hit: false }));
};
const radius = (t: Saw['type']) => (t === 'drop' ? 28 : t === 'rise' ? 22 : t === 'roll' ? 24 : 22);

// ---------------------------------------------------------------------------------------------------------------
// Each frame

/** Where a saw is right now, and whether it cuts. */
const stepSaw = (state: GameState, s: Saw, logRx: number) => {
  const wy = waterY(s.x);
  s.t++;
  if (!s.jam) s.spin += s.type === 'drop' ? 0.5 : 0.42;
  const near = s.x - logRx;
  switch (s.type) {
    case 'wall': s.cx = X(s.x); s.cy = wy - 70; return near > -60 && near < 700;
    case 'swing': {
      const th = Math.sin(((state.frame + s.phase) / 150) * Math.PI * 2) * 1.0;
      s.cx = X(s.x) + Math.sin(th) * 134; s.cy = wy - 200 + Math.cos(th) * 134; s.k = th;
      return true;
    }
    case 'rise': {
      // (under the water till the log's near; then up out of it; down again once it's by)
      if (!s.live && near < 360) { s.live = true; playSound('splash', 0.7, 6); }
      if (s.live && near < -120) s.done = true;
      s.k += ((s.live && !s.done ? 1 : 0) - s.k) * 0.08;
      s.cx = X(s.x); s.cy = wy + 30 - s.k * 38;
      return s.k > 0.5;
    }
    case 'drop': {
      // (up, the shudder, the slam, down a beat, back up: on its beat)
      const c = (state.frame + s.phase) % 170;
      let down = 0;
      if (c < 90) down = 0; else if (c < 120) down = 0; else if (c < 130) down = (c - 120) / 10; else if (c < 150) down = 1; else down = 1 - (c - 150) / 20;
      s.k = down; s.t = c;
      s.cx = X(s.x) + (c >= 90 && c < 120 ? Math.sin(c * 2.1) * 2 : 0);
      s.cy = wy - 200 + down * 190;
      if (c === 120 && Math.abs(near) < 700) playSound('whoosh', 0.6, -4);
      if (c === 130 && Math.abs(near) < 700) { playSound('slam', 0.7, -2); playSound('splash', 0.6, 0); }
      return down > 0.05;
    }
    case 'rail': case 'roll': {
      // (set off as the log comes: along at him, then off the end)
      if (!s.live && near < 520) { s.live = true; s.k = 0; playSound('grind', 0.6, s.type === 'roll' ? -4 : 2); }
      if (s.live && !s.done) { s.k += s.type === 'roll' ? 4.2 : 3; if (s.k > 900) s.done = true; }
      const at = s.x - s.k;
      s.cx = X(at); s.cy = waterY(at) - (s.type === 'roll' ? 18 + Math.abs(Math.sin(s.t * 0.25)) * 6 : 10);
      return s.live && !s.done;
    }
  }
  return false;
};

export const updateHazards = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, r = rideOf(state), L = r.log;
  const onRide = L.mode === 'ride' && p.health > 0 && !p.inCutscene;
  const rb = riderBox(state);
  const hitRider = (x: number, y: number, rad: number) => {
    const cx = Math.max(rb.x, Math.min(x, rb.x + rb.w)), cy = Math.max(rb.y, Math.min(y, rb.y + rb.h));
    return Math.hypot(x - cx, y - cy) < rad - 3;
  };
  const hurt = (dmg: number, source: string) => {
    if (!onRide || p.invincibilityTimer > 0) return false;
    hurtPlayer(ctx, dmg, source, { x: 0, y: -4 });
    shakeScreen(state, 9, 4);
    return true;
  };
  const zones: { x0: number; x1: number; y0: number; y1: number }[] = [];
  // ---- the saws
  for (const s of r.saws) {
    if (!onScreen(state, s.cx - 300, s.cx + 300, 400) && s.type !== 'drop' && s.type !== 'swing') { stepSaw(state, s, L.rx); continue; }
    const cuts = stepSaw(state, s, L.rx) && !s.jam;
    if (s.jam) s.jam++;
    // (a hum as it comes on screen)
    if (!s.jam && Math.abs(s.cx - (state.camera.x + 400)) < 420 && state.frame % 26 === (s.x % 26)) playSound('grind', 0.12, s.type === 'drop' ? -8 : -2);
    if (!cuts) continue;
    zones.push({ x0: s.cx - s.r, x1: s.cx + s.r, y0: s.cy - s.r, y1: s.cy + s.r });
    if (hitRider(s.cx, s.cy, s.r) && hurt(SAW_DMG, 'm2:fr_saw')) {
      playSound('gorespray', 0.8, 2); playSound('grind', 0.9, 6);
      for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: s.cx, y: s.cy }, vel: { x: (Math.random() - 0.5) * 9, y: -Math.random() * 7 }, life: 34, color: i % 3 ? '#B91C1C' : '#7F1D1D', size: 2 + Math.random() * 3 });
    }
    for (const e of hazardVictims(state)) if (boxHits(e, s.cx - s.r, s.cy - s.r, s.r * 2, s.r * 2)) hazardHit(ctx, e, 40, s.cx, 'SAWED!', { kill: true });
    // (shot: a clang and sparks off the steel; enough and it jams)
    for (const pj of state.projectiles) {
      if (pj.owner !== 'player' || pj.health <= 0) continue;
      const px = pj.pos.x + pj.width / 2, py = pj.pos.y + pj.height / 2;
      if (Math.hypot(px - s.cx, py - s.cy) > s.r + 4) continue;
      pj.health = 0; s.hits++;
      playSound('clang', 0.6, 6);
      for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: px, y: py }, vel: { x: (Math.random() - 0.5) * 6, y: -Math.random() * 5 }, life: 14, color: i % 2 ? '#FDE047' : '#F97316', size: 2 });
      if (s.hits >= (s.type === 'rail' || s.type === 'roll' || s.type === 'rise' ? 3 : 4)) {
        s.jam = 1; playSound('crunch', 0.9, -6); playSound('clang', 1, -10);
        ctx.fx.spawnDamageNumber({ x: s.cx, y: s.cy - 30 }, 'JAMMED!', true, '#FDE047');
      }
    }
  }
  // ---- the cutter at the break: across the flume ahead of him, the flume cut, the log off the end of it
  if (L.mode === 'ride' && L.rx > CUTTER_X - 170 && !r.cutT) {
    // (back in a log past it: it's been and gone)
    if (L.rx > CUTTER_X + 60) { r.cutT = 999; r.said.grate = r.said.grate || L.rx > 5900; }
  }
  if (L.mode === 'ride' && L.rx > CUTTER_X - 170 && !r.cutT) {
    r.cutT = 1; playSound('grind', 1, -10); playSound('crash', 0.9, -6); shakeScreen(state, 14, 6);
    meatheadSays(state, pickLine(byPants(state, BREAKOUT)), true);
  }
  if (r.cutT) {
    r.cutT++;
    if (r.cutT < 50 && r.cutT % 2 === 0) for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: X(CUTTER_X + 30), y: waterY(CUTTER_X) - 10 }, vel: { x: (Math.random() - 0.3) * 9, y: -2 - Math.random() * 7 }, life: 30, color: i % 2 ? '#D6A060' : '#FDE047', size: 2 + Math.random() * 3 });
  }
  // (the storm grate, as the log goes down through it)
  if (L.mode === 'ride' && L.rx > 5760 && L.rx < 5900 && !r.said.grate) { r.said.grate = true; playSound('crash', 1, -8); playSound('clang', 1, -12); shakeScreen(state, 16, 6); }
  // ---- the animatronics: shredded as the log comes by
  for (const q of r.props) {
    if (!q.shred && L.mode === 'ride' && q.x - L.rx < 240 && q.x - L.rx > -100) { q.shred = true; q.t = 0; playSound('grind', 0.8, 0); playSound('crunch', 0.7, -2); }
    if (q.shred) {
      q.t++;
      if (q.t === 18) {
        playSound('clang', 0.7, 4);
        for (let i = 0; i < 18; i++) state.particles.push({ pos: { x: X(q.x), y: waterY(q.x) - 70 }, vel: { x: (Math.random() - 0.5) * 8, y: -2 - Math.random() * 8 }, life: 50, color: PROP_BITS[q.kind][i % PROP_BITS[q.kind].length], size: 2 + Math.random() * 4 });
      }
    }
  }
  // ---- the sewer's low pipes: stood up as he goes under one, it's his head
  r.pipeCd = Math.max(0, r.pipeCd - 1);
  if (r.pipeCd === 0) for (const px of PIPES) {
    const pipeBottom = waterY(px) - 48;
    if (Math.abs(X(px) - (rb.x + rb.w / 2)) < 26 && rb.y < pipeBottom && hurt(12, 'm2:fr_pipe')) { r.pipeCd = 40; playSound('clang', 1, -6); }
  }
  // ---- the gushers: pouring on a beat
  r.gushCd = Math.max(0, r.gushCd - 1);
  for (const [gx, ph] of GUSHERS) {
    const c = (state.frame + ph) % 160, pour = c >= 115 && c < 150;
    if (c === 90 && Math.abs(X(gx) - state.camera.x - 400) < 500) playSound('glug', 0.6, -6);
    if (c === 115 && Math.abs(X(gx) - state.camera.x - 400) < 500) playSound('gush', 0.8, -4);
    if (!pour) continue;
    const gx0 = X(gx) - 22, gx1 = X(gx) + 22, top = waterY(gx) - 220;
    zones.push({ x0: gx0, x1: gx1, y0: top, y1: waterY(gx) });
    if (r.gushCd === 0 && rb.x + rb.w > gx0 && rb.x < gx1 && hurt(10, 'm2:fr_sewage')) { r.gushCd = 45; playSound('splat', 0.9, -6); }
    for (const e of hazardVictims(state)) if (boxHits(e, gx0, top, gx1 - gx0, 220)) hazardHit(ctx, e, 30, X(gx), 'FLUSHED!', { kill: true });
  }
  // ---- the river's rocks: the log hits one and bucks; in the log as it does, it's his spine
  for (const k of r.rocks) {
    if (k.hit || L.mode !== 'ride' || L.rx < k.x - 56) continue;
    k.hit = true;
    // (back in a log past it: nothing)
    if (L.rx > k.x) continue;
    L.bobV = 7; playSound('crunch', 0.9, -10); playSound('splash', 0.9, -4); shakeScreen(state, 10, 5);
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: X(k.x), y: waterY(k.x) - 10 }, vel: { x: (Math.random() - 0.5) * 8, y: -3 - Math.random() * 7 }, life: 34, color: i % 2 ? '#E0F2FE' : '#BFDBFE', size: 3 + Math.random() * 3 });
    if (L.up < 8 && hurt(11, 'm2:fr_rock')) { L.vy = 6; L.up = 1; }
  }
  // ---- the river's low branches: stood up under one, it sweeps him
  r.branchCd = Math.max(0, r.branchCd - 1);
  if (r.branchCd === 0) for (const bx of BRANCHES) {
    const bottom = waterY(bx) - 50;
    if (Math.abs(X(bx) - (rb.x + rb.w / 2)) < 34 && rb.y < bottom && hurt(10, 'm2:fr_branch')) {
      r.branchCd = 40; playSound('crack', 0.9, -4);
      for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: X(bx), y: bottom - 10 }, vel: { x: (Math.random() - 0.5) * 5, y: -Math.random() * 4 }, life: 34, color: i % 2 ? '#2F6A2A' : '#4A8A3A', size: 3 });
    }
  }
  setHazardZones(state, 'fr-ride', zones);
  void feetY;
};

const PROP_BITS: Record<PropKind, string[]> = {
  beaver: ['#7A4A24', '#A16207', '#3F3F46', '#FDE047', '#1C1917'],
  jack: ['#B91C1C', '#1C1917', '#E8C8A0', '#3F3F46', '#FDE047'],
  bear: ['#5A3A1E', '#3F2A14', '#3F3F46', '#FDE047'],
  settler: ['#3B6AA0', '#F1F5F9', '#E8C8A0', '#3F3F46', '#FDE047'],
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** A buzzsaw: its teeth round a steel disc, the blur of its spin, its hub. Jammed: still, smoking, a tooth gone. */
export const drawSawDisc = (c: Ctx, x: number, y: number, r: number, spin: number, jam = 0) => {
  const teeth = Math.max(10, Math.round(r * 0.75));
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(spin);
  c.fillStyle = INK; c.beginPath();
  for (let i = 0; i < teeth * 2; i++) { const a = (i / (teeth * 2)) * Math.PI * 2, rr = i % 2 ? r + 1 : r + 6; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  c.closePath(); c.fill();
  c.fillStyle = STEEL; c.beginPath();
  for (let i = 0; i < teeth * 2; i++) { const a = (i / (teeth * 2)) * Math.PI * 2, rr = i % 2 ? r - 1 : r + 4; if (jam && i === 3) { c.lineTo(Math.cos(a) * (r - 2), Math.sin(a) * (r - 2)); continue; } c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  c.closePath(); c.fill();
  c.fillStyle = STEEL_D; c.beginPath(); c.arc(0, 0, r * 0.82, 0, Math.PI * 2); c.fill();
  c.fillStyle = mix(STEEL, STEEL_D, 0.4); c.beginPath(); c.arc(0, 0, r * 0.74, 0, Math.PI * 2); c.fill();
  // (the blade's shine: two wedges across it, turning with it)
  c.fillStyle = STEEL_L; c.globalAlpha = 0.55;
  c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, r * 0.72, -0.3, 0.15); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, r * 0.72, Math.PI - 0.3, Math.PI + 0.15); c.closePath(); c.fill();
  c.globalAlpha = 1;
  c.restore();
  // (the spin's blur ring; jammed, none: smoke instead)
  if (!jam) { c.strokeStyle = 'rgba(241, 245, 249, 0.35)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r + 2, spin % 6, (spin % 6) + 2.2); c.stroke(); }
  else for (let i = 0; i < 3; i++) { const t = ((jam * 0.02 + i / 3) % 1); c.globalAlpha = 0.5 * (1 - t); c.fillStyle = '#71717A'; c.beginPath(); c.arc(x + Math.sin(t * 6 + i) * 4, y - r * 0.4 - t * 40, 4 + t * 10, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
  // (the hub: hazard-striped, its nut)
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, r * 0.3 + 1.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = STRIPE_Y; c.beginPath(); c.arc(x, y, r * 0.3, 0, Math.PI * 2); c.fill();
  c.fillStyle = STRIPE_K; c.beginPath(); c.moveTo(x, y); c.arc(x, y, r * 0.3, spin, spin + Math.PI / 2); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(x, y); c.arc(x, y, r * 0.3, spin + Math.PI, spin + Math.PI * 1.5); c.closePath(); c.fill();
  box(c, x - 2, y - 2, 4, 4, '#52525B');
};

/** A hazard-striped bar (a saw's mount, an arm). */
const stripes = (c: Ctx, x: number, y: number, w: number, h: number) => {
  box(c, x - 1, y - 1, w + 2, h + 2, INK); box(c, x, y, w, h, STRIPE_Y);
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = STRIPE_K; for (let k = -h; k < w + h; k += 10) { c.beginPath(); c.moveTo(x + k, y + h); c.lineTo(x + k + 5, y + h); c.lineTo(x + k + 5 + h, y); c.lineTo(x + k + h, y); c.closePath(); c.fill(); }
  c.restore();
};
const arm = (c: Ctx, ax: number, ay: number, bx: number, by: number, w = 6) => {
  c.strokeStyle = INK; c.lineWidth = w + 2; c.lineCap = 'butt'; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
  c.strokeStyle = '#71717A'; c.lineWidth = w; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
  c.strokeStyle = '#A1A1AA'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(ax, ay - w / 3); c.lineTo(bx, by - w / 3); c.stroke();
};

/** Behind the log: the saws' mounts, the gantries, the rails, the saws that are behind the trough's front wall. */
export const drawHazardsBack = (c: Ctx, state: GameState) => {
  const r = rideOf(state), f = state.frame;
  for (const s of r.saws) {
    if (!onScreen(state, X(s.x) - 260, X(s.x) + 260)) continue;
    const wy = waterY(s.x);
    switch (s.type) {
      case 'wall':
        // (a hazard-striped bulkhead hung down from the overhead timbers to head height, the saw at its foot: a wall
        // to duck under, not a bar to jump)
        box(c, X(s.x) - 40, wy - 300, 80, 14, INK); box(c, X(s.x) - 39, wy - 299, 78, 12, '#6B4423'); box(c, X(s.x) - 39, wy - 299, 78, 3, '#9A6A3A');
        stripes(c, X(s.x) - 28, wy - 286, 56, 196);
        drawSawDisc(c, s.cx, s.cy, s.r, s.spin, s.jam);
        break;
      case 'swing':
        // (the gantry over the trough, the pendulum's arm down from it)
        stripes(c, X(s.x) - 170, wy - 214, 340, 14);
        box(c, X(s.x) - 176, wy - 214, 10, 214, INK); box(c, X(s.x) - 174, wy - 212, 6, 212, '#52525B');
        box(c, X(s.x) + 166, wy - 214, 10, 214, INK); box(c, X(s.x) + 168, wy - 212, 6, 212, '#52525B');
        arm(c, X(s.x), wy - 200, s.cx, s.cy, 5);
        drawSawDisc(c, s.cx, s.cy, s.r, s.spin, s.jam);
        break;
      case 'drop': {
        // (its guide rails up into the rafters, the motor box over it)
        box(c, X(s.x) - 36, wy - 250, 6, 250, INK); box(c, X(s.x) + 30, wy - 250, 6, 250, INK);
        box(c, X(s.x) - 35, wy - 250, 4, 250, '#71717A'); box(c, X(s.x) + 31, wy - 250, 4, 250, '#71717A');
        stripes(c, X(s.x) - 40, wy - 262, 80, 16);
        arm(c, X(s.x), wy - 246, s.cx, s.cy, 6);
        // (the shudder: sparks off its rails, a red lamp)
        if (s.t >= 90 && s.t < 120 && !s.jam) { box(c, X(s.x) - 6, wy - 274, 12, 10, f % 6 < 3 ? '#EF4444' : '#7F1D1D'); if (f % 3 === 0) box(c, X(s.x) + (f % 2 ? 30 : -36), s.cy - 20 + (f % 20), 3, 3, '#FDE047'); }
        drawSawDisc(c, s.cx, s.cy, s.r, s.spin, s.jam);
        break;
      }
      case 'rail':
        // (its rail along the trough's edge, sparks where it runs)
        box(c, X(s.x - 900), wy - 2, 900 + 40, 5, INK); box(c, X(s.x - 900), wy - 1, 940, 3, '#A1A1AA');
        stripes(c, X(s.x) + 10, wy - 40, 20, 40);
        break;
      default: break;
    }
  }
  // (the cutter: a giant saw on a carriage across the flume at the break)
  if (onScreen(state, X(CUTTER_X) - 200, X(CUTTER_X) + 200)) {
    const wy = waterY(CUTTER_X), k = r.cutT ? Math.min(1, r.cutT / 16) : 0, cx = X(CUTTER_X) + 30, cy = wy - 230 + k * 210;
    stripes(c, cx - 90, wy - 300, 180, 18);
    box(c, cx - 4, wy - 284, 8, cy - (wy - 284), INK); box(c, cx - 3, wy - 284, 6, cy - (wy - 284), '#A1A1AA');
    drawSawDisc(c, cx, cy, 60, f * 0.5, 0);
  }
};

/** In front of the log: the saws that come up out of the water or run along its surface (in front of the trough's
 *  front wall: they're in the water with him). */
export const drawHazardsFront = (c: Ctx, state: GameState) => {
  const r = rideOf(state), f = state.frame;
  for (const s of r.saws) {
    if (!onScreen(state, s.cx - 80, s.cx + 80)) continue;
    const wy = waterY(s.x);
    if (s.type === 'rise') {
      // (the water boiling over it till it's up, then it up through the surface, the water clipped off its bottom)
      if (s.k < 0.95) for (let i = 0; i < 4; i++) { const bx = s.cx - 18 + ((f * 2 + i * 13) % 36), by = wy - 2 - ((f + i * 7) % 8); box(c, bx, by, 3, 3, '#E0F2FE'); }
      c.save(); c.beginPath(); c.rect(s.cx - 40, s.cy - 40, 80, wy + 2 - (s.cy - 40)); c.clip();
      drawSawDisc(c, s.cx, s.cy, s.r, s.spin, s.jam);
      c.restore();
      if (s.k > 0.3) for (let i = 0; i < 3; i++) box(c, s.cx - 16 + i * 14, wy - 4 - ((f + i * 5) % 6), 4, 3, '#F1F5F9');
    } else if ((s.type === 'rail' || s.type === 'roll') && s.live && !s.done) {
      drawSawDisc(c, s.cx, s.cy, s.r, s.spin, s.jam);
      if (f % 2 === 0) for (let i = 0; i < 2; i++) box(c, s.cx + 10 + Math.random() * 14, s.cy + s.r - 6 - Math.random() * 8, 2, 2, '#FDE047');
    }
  }
};

/** An animatronic (its stand, the figure, and once the saw's been through it: in two halves, sparking). */
export const drawProps = (c: Ctx, state: GameState) => {
  const r = rideOf(state), f = state.frame;
  for (const q of r.props) {
    if (!onScreen(state, X(q.x) - 120, X(q.x) + 120)) continue;
    const x = X(q.x), y = waterY(q.x) - 24;
    // (on its rock by the trough's back edge)
    box(c, x - 34, y - 6, 68, 10, INK); box(c, x - 33, y - 5, 66, 8, '#8A7A6A'); box(c, x - 33, y - 5, 66, 2, '#B8A898');
    for (const bx of [x - 28, x + 24]) box(c, bx, y - 3, 3, 3, '#52525B');
    const t = q.shred ? q.t : 0;
    // (the saw through it: across from the right, then the two halves going their ways)
    const split = q.shred ? Math.min(1, Math.max(0, (t - 16) / 30)) : 0;
    const cutY = y - 40;
    const nod = q.shred ? 0 : Math.sin(f * 0.08 + q.x) * 0.06;
    // (the bottom half)
    c.save(); c.beginPath(); c.rect(x - 60, cutY, 120, 60); c.clip();
    c.translate(x, y); c.rotate(-split * 0.3); drawFigure(c, q.kind, f, nod, false);
    c.restore();
    // (the top half: off, tumbling)
    c.save(); c.beginPath(); c.rect(x - 60, cutY - 120, 120, 120); c.clip();
    c.translate(x + split * 38, y - split * 22 + split * split * 60); c.rotate(split * 1.6); drawFigure(c, q.kind, f, nod, split > 0);
    c.restore();
    if (q.shred && t < 34) { const sx = x + 60 - Math.min(120, t * 6); drawSawDisc(c, sx, cutY, 20, f * 0.5); }
    // (cut: sparks and the wires out of it)
    if (split > 0 && split < 1 && f % 3 === 0) box(c, x - 10 + Math.random() * 20, cutY - 2, 3, 3, '#FDE047');
    if (split >= 1) { c.strokeStyle = '#DC2626'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 4, cutY); c.lineTo(x - 8, cutY - 8 + Math.sin(f * 0.3) * 2); c.moveTo(x + 3, cutY); c.lineTo(x + 6, cutY - 6); c.stroke(); }
  }
};

/** The figure, feet at the origin, crude: the park's fiberglass and fur. `split`: its bolts and wires showing. */
const drawFigure = (c: Ctx, kind: PropKind, f: number, nod: number, split: boolean) => {
  c.rotate(nod);
  switch (kind) {
    case 'beaver':
      box(c, -22, -10, 22, 8, INK); box(c, -21, -9, 20, 6, '#3F2A14');
      box(c, -10, -34, 26, 30, INK); box(c, -9, -33, 24, 28, '#7A4A24'); box(c, -9, -33, 24, 4, '#9A6A3A');
      box(c, 6, -46, 20, 16, INK); box(c, 7, -45, 18, 14, '#7A4A24'); box(c, 20, -40, 5, 2, INK); box(c, 21, -35, 4, 5, '#FEF3C7');
      box(c, 9, -48, 4, 4, '#5A3A1E'); box(c, 18, -42, 2, 2, INK);
      // (gnawing its fake log, its head going)
      box(c, 16, -26, 26, 8, INK); box(c, 17, -25, 24, 6, '#A0703C');
      break;
    case 'jack':
      // (a lumberjack, plaid, a beard, his axe up)
      box(c, -10, -38, 8, 38, INK); box(c, 2, -38, 8, 38, INK); box(c, -9, -37, 6, 36, '#1E3A8A'); box(c, 3, -37, 6, 36, '#1E3A8A');
      box(c, -13, -74, 26, 38, INK); box(c, -12, -73, 24, 36, '#B91C1C');
      for (let k = -12; k < 12; k += 6) box(c, k, -73, 2, 36, '#7F1D1D'); for (let k = -70; k < -38; k += 7) box(c, -12, k, 24, 2, '#7F1D1D');
      box(c, -9, -94, 18, 20, INK); box(c, -8, -93, 16, 18, '#E8C8A0'); box(c, -8, -82, 16, 8, '#7A4A24'); box(c, 2, -88, 2, 2, INK);
      box(c, -10, -98, 20, 6, '#B91C1C');
      c.save(); c.translate(12, -68); c.rotate(-0.8 + Math.sin(f * 0.1) * 0.3); box(c, -2, -36, 4, 36, '#8A5A30'); box(c, -8, -40, 14, 9, '#A1A1AA'); c.restore();
      break;
    case 'bear':
      box(c, -16, -30, 12, 30, INK); box(c, 4, -30, 12, 30, INK); box(c, -15, -29, 10, 28, '#5A3A1E'); box(c, 5, -29, 10, 28, '#5A3A1E');
      box(c, -20, -84, 40, 58, INK); box(c, -19, -83, 38, 56, '#6B4423'); box(c, -10, -70, 20, 30, '#8A6040');
      box(c, -13, -108, 30, 26, INK); box(c, -12, -107, 28, 24, '#6B4423'); box(c, 8, -98, 12, 10, '#8A6040'); box(c, 16, -98, 4, 3, INK);
      box(c, -12, -112, 8, 8, '#6B4423'); box(c, 6, -112, 8, 8, '#6B4423'); box(c, 4, -102, 2, 2, INK);
      // (the paws up: GRR)
      box(c, 18, -88, 14, 8, '#6B4423'); box(c, -32, -88, 14, 8, '#6B4423');
      break;
    case 'settler':
      // (a pioneer woman at her butter churn)
      box(c, -14, -50, 28, 50, INK); box(c, -13, -49, 26, 48, '#3B6AA0'); box(c, -10, -46, 20, 30, '#F1F5F9');
      box(c, -9, -70, 18, 20, INK); box(c, -8, -69, 16, 18, '#E8C8A0'); box(c, 3, -63, 2, 2, INK);
      box(c, -12, -76, 24, 12, '#F1F5F9'); box(c, -12, -76, 24, 3, '#CBD5E1');
      box(c, 16, -36, 16, 36, INK); box(c, 17, -35, 14, 34, '#A0703C');
      box(c, 22, -60 + Math.abs(Math.sin(f * 0.15)) * 10, 3, 30, '#8A5A30');
      break;
  }
  // (the cut face: fiberglass shell, its steel armature, a spring)
  if (split) { box(c, -14, -42, 28, 3, '#E5E7EB'); box(c, -2, -42, 4, 3, '#52525B'); }
};

/** The sewer's pipes and gushers, the river's rocks and branches (behind him: the pipes and branches are in front, see
 *  drawObstaclesFront). */
export const drawObstaclesBack = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const [gx, ph] of GUSHERS) {
    if (!onScreen(state, X(gx) - 60, X(gx) + 60)) continue;
    const wy = waterY(gx), top = wy - 230, cyc = (f + ph) % 160;
    // (the pipe's mouth in the roof)
    box(c, X(gx) - 26, top - 20, 52, 26, INK); box(c, X(gx) - 24, top - 18, 48, 22, '#5A5A48'); box(c, X(gx) - 18, top, 36, 6, '#1C1C14');
    if (cyc < 115 && cyc >= 90) for (let i = 0; i < 3; i++) box(c, X(gx) - 10 + i * 10, top + 8 + ((f * 4 + i * 30) % 200), 4, 6, '#6B5A1E');
    else if (cyc % 40 < 4) box(c, X(gx) - 2, top + 8 + (cyc % 40) * 8, 3, 5, '#6B5A1E');
  }
  for (const k of ROCKS) {
    if (!onScreen(state, X(k) - 60, X(k) + 60)) continue;
    const wy = waterY(k);
    // (a real boulder: lumpy, mossy, no bolts)
    c.fillStyle = INK; c.beginPath(); c.ellipse(X(k), wy + 2, 42, 26, 0, Math.PI, 0); c.fill();
    c.fillStyle = '#6E6A62'; c.beginPath(); c.ellipse(X(k), wy + 2, 40, 24, 0, Math.PI, 0); c.fill();
    c.fillStyle = '#8E8A80'; c.beginPath(); c.ellipse(X(k) - 8, wy - 6, 24, 12, -0.2, Math.PI, 0); c.fill();
    c.fillStyle = '#4A6A2A'; c.beginPath(); c.ellipse(X(k) + 10, wy - 18, 14, 5, 0.2, Math.PI, 0); c.fill();
    for (let i = 0; i < 3; i++) box(c, X(k) - 40 + i * 30 + (f % 20), wy - 2, 8, 2, '#F1F5F9');
  }
};

export const drawObstaclesFront = (c: Ctx, state: GameState) => {
  const r = rideOf(state), f = state.frame;
  for (const px of PIPES) {
    if (!onScreen(state, X(px) - 60, X(px) + 60)) continue;
    const wy = waterY(px), y = wy - 76;
    // (a brick header wall down from the tunnel's roof, a fat pipe along its foot, low: duck under it)
    box(c, X(px) - 26, y - 200, 52, 200, INK); box(c, X(px) - 24, y - 200, 48, 200, '#5A4A3A');
    for (let k = 0; k < 12; k++) box(c, X(px) - 24 + ((k % 2) * 12), y - 196 + k * 16, 48, 2, '#3A2E24');
    box(c, X(px) - 30, y - 4, 60, 32, INK); box(c, X(px) - 28, y - 2, 56, 28, '#6A6A58'); box(c, X(px) - 28, y - 2, 56, 5, '#8A8A74');
    box(c, X(px) - 30, y + 6, 60, 4, '#3A3A30');
    if (f % 50 < 30) box(c, X(px) - 1, y + 26 + (f % 50), 3, 4, '#A3A35A');
  }
  for (const [gx, ph] of GUSHERS) {
    if (!onScreen(state, X(gx) - 60, X(gx) + 60)) continue;
    const wy = waterY(gx), top = wy - 222, cyc = (f + ph) % 160;
    if (cyc >= 115 && cyc < 150) {
      // (the pour: a thick brown column, lumpy, splattering where it hits the water)
      box(c, X(gx) - 20, top, 40, wy - top, '#5A4A18');
      for (let k = 0; k < 8; k++) box(c, X(gx) - 18 + ((k * 7 + f * 3) % 30), top + ((k * 37 + f * 9) % (wy - top)), 8, 10, k % 2 ? '#7A6A28' : '#3F3410');
      for (let i = 0; i < 4; i++) box(c, X(gx) - 30 + ((f * 5 + i * 17) % 60), wy - 6 - ((f + i * 9) % 14), 5, 4, '#7A6A28');
    }
  }
  for (const bx of BRANCHES) {
    if (!onScreen(state, X(bx) - 140, X(bx) + 140)) continue;
    const wy = waterY(bx), y = wy - 64;
    // (a real tree fallen across from the near bank, its crown a solid mass of leaves from up high down to the gap: duck)
    c.strokeStyle = INK; c.lineWidth = 16; c.beginPath(); c.moveTo(X(bx) + 160, wy - 20); c.lineTo(X(bx) - 40, wy - 250); c.stroke();
    c.strokeStyle = '#5A3E24'; c.lineWidth = 12; c.stroke();
    for (let row = 0; row < 6; row++) for (let i = 0; i < 4; i++) {
      const lx = X(bx) - 40 + i * 26 + (row % 2) * 12, ly = y - row * 34 + Math.sin(i * 2 + row + f * 0.04) * 3;
      c.fillStyle = INK; c.beginPath(); c.ellipse(lx, ly, 20, 15, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = (i + row) % 2 ? '#2F6A2A' : '#3E7E34'; c.beginPath(); c.ellipse(lx, ly, 18, 13, 0, 0, Math.PI * 2); c.fill();
    }
  }
  void r;
};
