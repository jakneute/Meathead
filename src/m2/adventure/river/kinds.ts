// The river's wildlife (the hostile kind), as Meathead 2's own enemies:
//   piranha: small, quick, in schools. In the water with him it darts at him (knocked up out of it, it falls back in).
//   eel:     an electric eel in a hole in the bank. He swims past and it shoots out at him crackling, then back in.
//   snapper: a snapping water plant on the river bed: sways, and when he's near it rears up on its stalk and snaps.
// Each one's bite has his hurt callouts and its death screen (registerHurtLines; the text's in lines.ts).

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { HURT } from './lines';

type Ctx = CanvasRenderingContext2D;
const mid = (e: { pos: { x: number; y: number }; width: number; height: number }) => ({ x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 });
/** The water a fish keeps to, and whether he's in it. */
const inBox = (b: Enemy['swimBox'], x: number, y: number) => !b || (x > b.x1 && x < b.x2 && y > b.y1 - 10 && y < b.y2);
const blocked = (ctx: FrameContext, e: Enemy, x: number, y: number) =>
  ctx.state.blocks.some(b => b.type !== 'pit' && !b.oneWay && x < b.x + b.w && x + e.width > b.x && y < b.y + b.h && y + e.height > b.y);
/** Moves it, but not into anything solid. */
const step = (ctx: FrameContext, e: Enemy) => {
  if (!blocked(ctx, e, e.pos.x + e.vel.x, e.pos.y)) e.pos.x += e.vel.x; else e.vel.x *= -0.3;
  if (!blocked(ctx, e, e.pos.x, e.pos.y + e.vel.y)) e.pos.y += e.vel.y; else e.vel.y *= -0.3;
};

// ---------------------------------------------------------------------------------------------------------------
// Piranha

const PIRANHA_SEES = 420;
const piranha = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player;
  const box = e.swimBox;
  e.aiTimer = (e.aiTimer ?? 0) + 1;
  const m = mid(e), pm = mid(p);
  const dx = pm.x - m.x, dy = pm.y - m.y, d = Math.hypot(dx, dy) || 1;
  const surface = box?.y1 ?? -Infinity;
  // (out of the water: it falls back in)
  if (e.aiState === 'leap' || (box && e.pos.y + e.height < surface - 4)) {
    e.aiState = 'leap';
    e.vel.y += 0.45; e.pos.x += e.vel.x; e.pos.y += e.vel.y;
    if (e.vel.y > 0 && e.pos.y > surface + 4) { e.aiState = 'swim'; e.aiTimer = 0; e.vel.y *= 0.3; splash(ctx, m.x, surface); }
    e.facing = e.vel.x < 0 ? -1 : 1;
    return true;
  }
  const seen = Math.abs(dx) < PIRANHA_SEES && p.health > 0;
  if (seen && inBox(box, pm.x, pm.y)) {
    // In the water with him: darting at him, a burst every so often
    const sp = (e.aiTimer + (e.homeX ?? 0)) % 70 < 18 ? 4.6 : 1.6;
    e.vel.x += ((dx / d) * sp - e.vel.x) * 0.12;
    e.vel.y += ((dy / d) * sp - e.vel.y) * 0.12;
  } else {
    // Milling about where it was put
    const hx = (e.homeX ?? e.pos.x) + Math.sin((state.frame + (e.homeX ?? 0)) * 0.02) * 60;
    const hy = (e.homeY ?? e.pos.y) + Math.sin((state.frame + (e.homeX ?? 0)) * 0.05) * 10;
    e.vel.x += ((hx - e.pos.x) * 0.02 - e.vel.x) * 0.05;
    e.vel.y = (hy - e.pos.y) * 0.05;
  }
  e.facing = e.vel.x < 0 ? -1 : 1;
  step(ctx, e);
  if (box) { e.pos.x = Math.max(box.x1, Math.min(box.x2 - e.width, e.pos.x)); e.pos.y = Math.max(box.y1 + 4, Math.min(box.y2 - e.height, e.pos.y)); }
  return true;
};
const splash = (ctx: FrameContext, x: number, y: number) => {
  for (let i = 0; i < 8; i++) ctx.state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 4 }, life: 20, color: i % 2 ? '#E0F2FE' : '#7DD3FC', size: 2 + Math.random() * 3 });
};
const drawPiranha = (c: Ctx, e: Enemy, f: number) => {
  const wag = Math.sin(f * 0.5 + (e.homeX ?? 0)) * 3;
  c.save(); c.translate(0, -9);
  // (tail, body, the belly red, the underbite full of teeth, the eye)
  c.fillStyle = '#475569'; c.beginPath(); c.moveTo(-13, 0); c.lineTo(-20, -6 + wag); c.lineTo(-20, 6 + wag); c.closePath(); c.fill();
  c.fillStyle = '#64748B'; c.beginPath(); c.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#DC2626'; c.beginPath(); c.ellipse(1, 4, 11, 4.5, 0, 0, Math.PI); c.fill();
  c.fillStyle = '#334155'; c.beginPath(); c.moveTo(-4, -8); c.lineTo(3, -13); c.lineTo(5, -8); c.fill();
  c.fillStyle = '#F8FAFC'; for (let x = 5; x < 14; x += 3) { c.beginPath(); c.moveTo(x, 2); c.lineTo(x + 1.5, -1); c.lineTo(x + 3, 2); c.fill(); }
  c.fillStyle = '#FDE047'; c.fillRect(6, -4, 4, 3); c.fillStyle = '#000'; c.fillRect(8, -4, 2, 2);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Eel: in its hole (homeX, homeY: the hole's mouth; aiX the way it comes out, ±1)

const EEL_REACH = 170, EEL_SEES = 230;
const eel = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player, pm = mid(p);
  const dir = e.aiX ?? 1;
  const hx = e.homeX ?? e.pos.x, hy = e.homeY ?? e.pos.y;
  e.aiTimer = (e.aiTimer ?? 0) + 1;
  e.facing = dir as 1 | -1;
  const out = () => Math.abs(e.pos.x + (dir > 0 ? 0 : e.width) - hx);
  if (e.aiState === 'lunge') {
    e.pos.x += dir * 7;
    e.pos.y += (Math.max(hy - 60, Math.min(hy + 60, pm.y - e.height / 2)) - e.pos.y) * 0.08;
    if (out() > EEL_REACH) { e.aiState = 'zap'; e.aiTimer = 0; }
  } else if (e.aiState === 'zap') {
    if (state.frame % 3 === 0) state.particles.push({ pos: { x: e.pos.x + Math.random() * e.width, y: e.pos.y + Math.random() * e.height }, vel: { x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3 }, life: 8, color: Math.random() > 0.5 ? '#FDE047' : '#E0FFFF', size: 2 + Math.random() * 2 });
    if (e.aiTimer > 40) { e.aiState = 'back'; e.aiTimer = 0; }
  } else if (e.aiState === 'back') {
    e.pos.x -= dir * 2.5;
    e.pos.y += (hy - e.pos.y) * 0.1;
    if (out() < 8) { e.pos.x = dir > 0 ? hx : hx - e.width; e.aiState = 'in'; e.aiTimer = 0; }
  } else {
    // In the hole, its head just out, waiting
    e.pos.x = dir > 0 ? hx - e.width + 22 : hx - 22; e.pos.y = hy;
    const ahead = (pm.x - hx) * dir;
    if (ahead > -20 && ahead < EEL_SEES && Math.abs(pm.y - hy) < 110 && e.aiTimer > 70 && p.health > 0) { e.aiState = 'lunge'; e.aiTimer = 0; e.pos.x = dir > 0 ? hx - e.width + 22 : hx - 22; }
  }
  return true;
};
const drawEel = (c: Ctx, e: Enemy, f: number) => {
  const w = e.width, live = e.aiState === 'zap' || e.aiState === 'lunge';
  c.save(); c.translate(0, -8);
  // (a long wavy body back from the head, the head at the front: x from -w/2 to w/2)
  c.strokeStyle = '#3F6212'; c.lineWidth = 11; c.lineCap = 'round';
  c.beginPath();
  for (let i = 0; i <= 12; i++) { const x = -w / 2 + (w - 12) * (i / 12); const y = Math.sin(i * 0.9 - f * 0.3) * 3 * (1 - i / 12); if (i) c.lineTo(x, y); else c.moveTo(x, y); }
  c.stroke();
  c.strokeStyle = '#A3E635'; c.lineWidth = 3; c.stroke();
  c.lineCap = 'butt';
  c.fillStyle = '#4D7C0F'; c.beginPath(); c.ellipse(w / 2 - 8, 0, 10, 7, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = live ? '#FDE047' : '#FEF9C3'; c.fillRect(w / 2 - 6, -4, 3, 3);
  c.fillStyle = '#1C1917'; c.fillRect(w / 2 - 6, 2, 8, 1.5);
  if (live) {
    c.strokeStyle = '#FDE047'; c.lineWidth = 1.5;
    for (let k = 0; k < 3; k++) { c.beginPath(); let x = -w / 2 + Math.random() * w, y = -10; c.moveTo(x, y); for (let j = 0; j < 3; j++) { x += (Math.random() - 0.5) * 10; y += 6; c.lineTo(x, y); } c.stroke(); }
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Snapper: rooted at homeX (its middle), homeY (the riverbed); the head (the enemy) on its stalk above

const SNAP_SEES = 170;
/** The longest its stalk ever gets (its head to its root, snapping straight up is about 180): any further, it's not on it. */
const SNAP_STALK = 210;
const snapper = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player, pm = mid(p);
  const rx = e.homeX ?? e.pos.x, ry = e.homeY ?? e.pos.y;
  e.aiTimer = (e.aiTimer ?? 0) + 1;
  const d = Math.hypot(pm.x - rx, pm.y - (ry - 70));
  let tx = rx + Math.sin((state.frame + rx) * 0.03) * 10, ty = ry - 70;
  if (d < SNAP_SEES && p.health > 0) {
    // Rearing back, then the snap: straight at him, as far as its stalk goes
    const t = e.aiTimer % 80;
    const a = Math.atan2(pm.y - (ry - 70), pm.x - rx);
    if (t < 30) { tx = rx - Math.cos(a) * 15; ty = ry - 70 - Math.sin(a) * 15; e.aiState = 'rear'; }
    else if (t < 50) { const reach = Math.min(110, d); tx = rx + Math.cos(a) * reach; ty = ry - 70 + Math.sin(a) * reach; e.aiState = 'snap'; }
    else e.aiState = 'idle';
  } else e.aiState = 'idle';
  const k = e.aiState === 'snap' ? 0.35 : 0.1;
  e.pos.x += (tx - e.width / 2 - e.pos.x) * k;
  e.pos.y += (ty - e.height / 2 - e.pos.y) * k;
  e.facing = pm.x < rx ? -1 : 1;
  return true;
};
const drawSnapper = (c: Ctx, e: Enemy, f: number) => {
  // (the stalk back down to its root, in the enemy's own space: feet at 0,0 facing right)
  // (torn off its stalk, in his fist or flying: a ragged stub of it hanging off, no roots)
  // (and with no root to be tied back to: its death animation draws it from a stand-in with no homeY, which tied the
  // stalk to y = 0, a long green line up off the top of the world; or knocked or squeaked free well out of its
  // stalk's reach, on its way back to plant itself)
  const fc = e.facing ?? 1;
  const toRoot = { x: ((e.homeX ?? 0) - (e.pos.x + e.width / 2)) * fc, y: (e.homeY ?? 0) - (e.pos.y + e.height) };
  const loose = e.aiState === 'loose' || !!e.isBlownAway || e.homeY === undefined || e.homeX === undefined || !(Math.hypot(toRoot.x, toRoot.y) < SNAP_STALK);
  const rx = loose ? -10 + Math.sin(f * 0.3) * 3 : toRoot.x, ry = loose ? 4 : toRoot.y;
  c.strokeStyle = '#166534'; c.lineWidth = 6;
  c.beginPath(); c.moveTo(0, -e.height / 2); c.quadraticCurveTo(rx * 0.3 + Math.sin(f * 0.05) * 6, ry * 0.5, rx, ry); c.stroke();
  if (loose) { c.fillStyle = '#A3E635'; c.beginPath(); c.arc(rx, ry, 3, 0, Math.PI * 2); c.fill(); }
  else for (const s of [-1, 1]) { c.fillStyle = '#15803D'; c.beginPath(); c.ellipse(rx + s * 12, ry - 6, 14, 5, s * 0.4, 0, Math.PI * 2); c.fill(); }
  // (the trap: two lobes with teeth round the edge, open wide, or shut on the snap)
  const open = e.aiState === 'snap' ? 0.1 : e.aiState === 'rear' ? 0.9 : 0.5 + Math.sin(f * 0.08) * 0.15;
  c.save(); c.translate(0, -e.height / 2);
  for (const s of [-1, 1]) {
    c.save(); c.rotate(-s * open * 0.8);
    c.fillStyle = '#16A34A'; c.beginPath(); c.ellipse(10, s * 6, 16, 10, 0, s < 0 ? Math.PI : 0, s < 0 ? Math.PI * 2 : Math.PI); c.fill();
    c.fillStyle = '#BE123C'; c.beginPath(); c.ellipse(10, s * 6, 12, 6, 0, s < 0 ? Math.PI : 0, s < 0 ? Math.PI * 2 : Math.PI); c.fill();
    c.fillStyle = '#F8FAFC'; for (let x = -2; x < 24; x += 4) { c.beginPath(); c.moveTo(x, s * 6); c.lineTo(x + 1.5, s * 6 + s * 5); c.lineTo(x + 3, s * 6); c.fill(); }
    c.restore();
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------

registerM2Kind({ kind: 'm2:piranha', stats: { w: 28, h: 18, hp: 22, contact: 5, mass: 25, air: true }, ai: piranha, draw: drawPiranha, head: { x: 8, y: -9, r: 6 }, gender: 'n', grab: 'critter', make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y }) });
registerM2Kind({ kind: 'm2:eel', stats: { w: 80, h: 16, hp: 60, contact: 9, mass: 60, air: true }, ai: eel, draw: drawEel, head: { x: 32, y: -8, r: 7 }, gender: 'n', grab: 'critter', grabHurts: { dmg: 9, when: e => e.aiState === 'zap' || e.aiState === 'lunge' }, make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y }) });
registerM2Kind({ kind: 'm2:snapper', stats: { w: 34, h: 30, hp: 80, contact: 10, mass: 80, air: true }, ai: snapper, draw: drawSnapper, head: { x: 8, y: -15, r: 10 }, gender: 'n', grab: 'critter', make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y }) });
for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, [...l.hurt], [...l.death]);
