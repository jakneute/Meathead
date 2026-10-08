// What being frozen, tased or set on fire looks like on an ordinary enemy, and the taser's beam itself. Hard-edged and pixel-snapped
// (no glow blur): a shell of faceted ice with a rim, light bands and frost on it, cracking as it's about to let go; and
// for the taser, the two wires out to the darts, a crackle running down them, arcs crawling over whoever's on the end,
// sparks off him, and smoke coming off him as he gets close to going up.

import { Enemy } from '../../types';
import { GameState } from '../core/state';
import { muzzlePoint } from '../combat/muzzle';
import { TASER_FIRE_THRESHOLD, COLORS } from '../../constants';
import { drawFlameLicks } from './fx/fireball';
import { KIND_TOP_REACH } from './enemies/index';

type Ctx = CanvasRenderingContext2D;

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const seedOf = (id: string) => { let h = 7; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 9973; return h; };
const r = Math.round;
/** How far its drawing stands up over its box (a themed one's head and hat; nothing, for a plain block). */
const topReach = (e: Enemy) => (e.kind && KIND_TOP_REACH[e.kind]) || 0;

/** The tint the enemy's own sprite takes while it's frozen or tased (drawn over just its pixels), or null. */
export const statusTint = (e: Enemy, state: GameState): { color: string; alpha: number } | null => {
  if (e.type === 'boss') return null;
  if (isTasedNow(e, state)) return state.frame % 4 < 2 ? { color: '#E6FDFF', alpha: 0.6 } : { color: '#0891B2', alpha: 0.3 };
  if (e.frozenTimer && e.frozenTimer > 0) return { color: '#9DE3FF', alpha: 0.5 };
  return null;
};

export const isTasedNow = (e: Enemy, state: GameState) =>
  (e.shockedUntil !== undefined && e.shockedUntil >= state.frame && e.health > 0 && !e.isBlownAway)
  || (!!e.isTased && state.player.isTasing && (state.player.taserTargetId === e.id || !!state.player.taserChain?.includes(e.id)));

/** How he shakes on the end of the taser: a pixel or two either way, not all over the place. */
export const tasedJitter = (state: GameState) => {
  const f = state.frame;
  return { x: (f % 4 < 2 ? 2 : -2), y: (f % 3) - 1 };
};

// ---------------------------------------------------------------------------------------------------------------------
// On fire
// ---------------------------------------------------------------------------------------------------------------------

/** An ordinary enemy on fire: flames up off it from its hips, near as wide as it is, licking up past its head (its legs
 * still showing, running about under it).
 * (Not a boss: the ones that burn have their own way of showing it.) */
export const drawOnFire = (ctx: Ctx, e: Enemy, frame: number) => {
  if (!e.isOnFire || e.health <= 0 || e.type === 'boss') return;
  const s = seedOf(e.id);
  drawFlameLicks(ctx, e.pos.x + e.width / 2, e.pos.y + e.height * 0.62, Math.max(16, e.width), Math.max(14, e.height * 0.7) + topReach(e), frame + s, { seed: s });
};

// ---------------------------------------------------------------------------------------------------------------------
// Frozen
// ---------------------------------------------------------------------------------------------------------------------

/** How long before it lets go the ice starts cracking (frames). */
const CRACK_FROM = 24;

/** The shell of ice round a frozen enemy: jagged crystal points on top, a dark edge and a bright rim, light bands and
 * facets across it, frost along the top and a glint; cracking up over its last moments. */
export const drawFrozenShell = (ctx: Ctx, e: Enemy, frame: number) => {
  const t = e.frozenTimer || 0;
  if (t <= 0 || e.type === 'boss') return;
  const s = seedOf(e.id);
  const x0 = r(e.pos.x - 5), x1 = r(e.pos.x + e.width + 5);
  const y0 = r(e.pos.y - 4 - topReach(e)), y1 = r(e.pos.y + e.height + 2); // (up over its head, not just its box)
  const w = x1 - x0, h = y1 - y0;
  ctx.save();
  // (in its last few frames it shudders as it goes)
  if (t < 10) ctx.translate(frame % 2 ? 1 : -1, 0);

  // The outline: points of crystal up along the top, a slight bulge down the sides, flat underneath
  const pts: [number, number][] = [];
  const peaks = Math.max(2, Math.min(5, r(w / 18)));
  pts.push([x0, y1]);
  pts.push([x0 - 2, r(y0 + h * (0.45 + hash(s) * 0.2))]);
  pts.push([x0 + 1, y0 + 6]);
  for (let k = 0; k < peaks; k++) {
    const a = x0 + (w * (k + 0.15)) / peaks, b = x0 + (w * (k + 0.85)) / peaks;
    const tip = 4 + r(hash(s + k * 3.1) * 9);
    pts.push([r(a), y0 + 2]);
    pts.push([r((a + b) / 2 + (hash(s + k) - 0.5) * 4), y0 - tip]);
    pts.push([r(b), y0 + 2]);
  }
  pts.push([x1 - 1, y0 + 6]);
  pts.push([x1 + 2, r(y0 + h * (0.5 + hash(s + 9) * 0.2))]);
  pts.push([x1, y1]);
  const path = () => { ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath(); };

  const fade = t < 6 ? t / 6 : 1;
  ctx.globalAlpha = fade;
  // Body of the ice, and two lighter bands slanting across it (clipped to the shell)
  path();
  ctx.fillStyle = 'rgba(140, 214, 255, 0.30)';
  ctx.fill();
  ctx.save();
  path(); ctx.clip();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.20)';
  const lean = h * 0.6;
  for (const [off, bw] of [[0.18, 0.16], [0.46, 0.07]] as const) {
    const bx = x0 + w * off;
    ctx.beginPath();
    ctx.moveTo(bx, y0 - 14); ctx.lineTo(bx + w * bw, y0 - 14); ctx.lineTo(bx + w * bw - lean, y1); ctx.lineTo(bx - lean, y1);
    ctx.closePath(); ctx.fill();
  }
  // A darker band down the shaded side
  ctx.fillStyle = 'rgba(30, 90, 140, 0.22)';
  ctx.fillRect(x1 - r(w * 0.18), y0 - 14, r(w * 0.18) + 3, h + 16);
  // Facets: a couple of edges running in from the rim
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1;
  const fx = r(x0 + w * (0.35 + hash(s + 4) * 0.3)), fy = r(y0 + h * (0.35 + hash(s + 5) * 0.2));
  ctx.beginPath();
  ctx.moveTo(x0, r(y0 + h * 0.3)); ctx.lineTo(fx, fy); ctx.lineTo(x1, r(y0 + h * 0.75));
  ctx.moveTo(fx, fy); ctx.lineTo(r(x0 + w * 0.3), y1);
  ctx.stroke();
  // The cracks, spreading out from a point as it gets ready to give
  if (t < CRACK_FROM) {
    const k = 1 - t / CRACK_FROM;
    const cx = r(x0 + w * (0.3 + hash(s + 7) * 0.4)), cy = r(y0 + h * (0.3 + hash(s + 8) * 0.3));
    ctx.strokeStyle = '#FFFFFF';
    ctx.beginPath();
    for (let j = 0; j < 5; j++) {
      const ang = (j / 5) * Math.PI * 2 + hash(s + j) * 0.8;
      const len = (8 + hash(s + j * 2.3) * Math.max(w, h) * 0.5) * k;
      let px = cx, py = cy;
      ctx.moveTo(px, py);
      for (let q = 1; q <= 3; q++) {
        const d = (len * q) / 3, wob = (hash(s + j * 5 + q) - 0.5) * 6;
        px = r(cx + Math.cos(ang) * d - Math.sin(ang) * wob);
        py = r(cy + Math.sin(ang) * d + Math.cos(ang) * wob);
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
  }
  ctx.restore();

  // The edge: dark outside, a bright rim inside it
  path();
  ctx.strokeStyle = '#2A6F97'; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = '#E8FBFF'; ctx.lineWidth = 1; ctx.stroke();

  // Frost along the top: a scatter of white pixels
  ctx.fillStyle = '#FFFFFF';
  for (let k = 0; k < Math.max(4, r(w / 6)); k++) {
    const px = r(x0 + 3 + hash(s + k * 1.7) * (w - 6)), py = r(y0 + 3 + hash(s + k * 2.9) * 6);
    ctx.fillRect(px, py, hash(s + k) > 0.6 ? 2 : 1, 1);
  }
  // The glint: a pixel highlight up on the lit corner, a little star off it every so often
  const gx = x0 + 5, gy = y0 + 8;
  ctx.fillRect(gx, gy, 3, 2);
  const tw = (frame + s) % 40;
  if (tw < 8) {
    const a = tw < 4 ? 2 : 1;
    ctx.fillRect(gx + 1 - a * 2, gy, a * 4 + 1, 1);
    ctx.fillRect(gx + 1, gy - a * 2, 1, a * 4 + 1);
  }
  ctx.restore();
};

// ---------------------------------------------------------------------------------------------------------------------
// Tased
// ---------------------------------------------------------------------------------------------------------------------

/** A jagged run of current from a to b: the middle of it thrown about, the ends pinned. Reseeded every couple of
 * frames so it crackles rather than strobes. */
const arcPath = (ctx: Ctx, ax: number, ay: number, bx: number, by: number, amp: number, seed: number, segs: number) => {
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  ctx.moveTo(r(ax), r(ay));
  for (let i = 1; i < segs; i++) {
    const t = i / segs, env = Math.sin(t * Math.PI);
    const o = (hash(seed + i * 3.7) - 0.5) * 2 * amp * env;
    ctx.lineTo(r(ax + dx * t + nx * o), r(ay + dy * t + ny * o));
  }
  ctx.lineTo(r(bx), r(by));
};

/** Stroke whatever's been pathed as current: a wide see-through cyan halo, the bolt, a white core. */
const strokeCurrent = (ctx: Ctx, width = 1) => {
  ctx.lineJoin = 'miter';
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)'; ctx.lineWidth = 5 * width; ctx.stroke();
  ctx.strokeStyle = COLORS.TASER_BOLT; ctx.lineWidth = 2 * width; ctx.stroke();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1; ctx.stroke();
};

/** What's on the end of the taser: arcs crawling over him (more of them the longer he's held), sparks jumping off
 * him, and, getting close to going up, smoke coming off the top of him. */
export const drawTasedFx = (ctx: Ctx, e: Enemy, state: GameState) => {
  const f = state.frame, s = seedOf(e.id);
  const held = state.player.taserTimer || 0;
  const heat = Math.min(1, held / TASER_FIRE_THRESHOLD);
  const x0 = e.pos.x + 2, y0 = e.pos.y + 2, w = Math.max(4, e.width - 4), h = Math.max(4, e.height - 4);
  const step = Math.floor(f / 2);
  const at = (k: number): [number, number] => {
    // (a point round the edge of him)
    const u = hash(s + step * 7.3 + k) * 4;
    if (u < 1) return [x0 + w * u, y0];
    if (u < 2) return [x0 + w, y0 + h * (u - 1)];
    if (u < 3) return [x0 + w * (3 - u), y0 + h];
    return [x0, y0 + h * (4 - u)];
  };
  ctx.save();
  // The arcs
  ctx.beginPath();
  const arcs = 2 + r(heat * 3);
  for (let k = 0; k < arcs; k++) {
    const [ax, ay] = at(k * 2), [bx, by] = at(k * 2 + 1);
    arcPath(ctx, ax, ay, bx, by, 6 + heat * 4, s + step * 13 + k * 31, 5);
  }
  strokeCurrent(ctx);
  // Sparks jumping off him
  for (let k = 0; k < 3 + r(heat * 3); k++) {
    const life = (f + k * 5 + s) % 10;
    const [sx, sy] = at(40 + k + Math.floor((f + k * 5 + s) / 10) * 9);
    const dir = hash(s + k * 3 + Math.floor((f + k * 5) / 10)) * Math.PI * 2;
    ctx.fillStyle = life < 4 ? '#FFFFFF' : (k % 2 ? '#FDE047' : COLORS.TASER_BOLT);
    const d = life * 2.2;
    ctx.fillRect(r(sx + Math.cos(dir) * d), r(sy + Math.sin(dir) * d + life * life * 0.08), 2, 2);
  }
  // Smoke off the top of him as he gets close to going up
  if (heat > 0.5) {
    const n = r((heat - 0.5) * 12);
    for (let k = 0; k < n; k++) {
      const life = (f + k * 7) % 28;
      const px = e.pos.x + e.width * (0.2 + hash(s + k * 1.3) * 0.6) + Math.sin((f + k * 9) * 0.15) * 3;
      const py = e.pos.y - life * 1.3;
      const sz = 2 + Math.floor(life / 10) * 2;
      ctx.fillStyle = life < 14 ? 'rgba(80, 80, 88, 0.7)' : 'rgba(120, 120, 128, 0.45)';
      ctx.fillRect(r(px - sz / 2), r(py), sz, sz);
    }
  }
  ctx.restore();
};

/**
 * The taser's beam: two wires out to the darts in him, slack and sagging, with the current crackling down along
 * them; with nothing to lock on to, a crackle fizzing out in front of the gun.
 */
export const drawTaserBeam = (ctx: Ctx, state: GameState) => {
  const { player, enemies, projectiles, frame } = state;
  const target = enemies.find(en => en.id === player.taserTargetId) || projectiles.find(pr => pr.id === player.taserTargetId);
  const { x: sx, y: sy } = muzzlePoint(player, 'TASER');
  const step = Math.floor(frame / 2);
  ctx.save();
  if (!target) {
    ctx.beginPath();
    const ex = sx + player.facing * (180 + hash(step) * 120), ey = sy + (hash(step + 1) - 0.5) * 50;
    arcPath(ctx, sx, sy, ex, ey, 14, step * 17, 9);
    strokeCurrent(ctx);
    ctx.restore();
    return;
  }
  const cx = target.pos.x + target.width / 2, cy = target.pos.y + target.height / 2;
  // The two darts: one high in him, one low
  // The current jumping on from it to whoever's right up against it, and on from them
  // (a long jump, the finale's across the room: as jagged the whole way as a short one is, kinks every 20px or so
  // and swinging wider the further it goes, not one stretched-thin zigzag; at most a dozen drawn)
  for (const [a, b] of (player.taserLinks ?? []).slice(0, 12)) {
    const ea = enemies.find(e => e.id === a), eb = enemies.find(e => e.id === b);
    if (!ea || !eb) continue;
    const ax = ea.pos.x + ea.width / 2, ay = ea.pos.y + ea.height / 2, bx = eb.pos.x + eb.width / 2, by = eb.pos.y + eb.height / 2;
    const len = Math.hypot(bx - ax, by - ay), seed = step * 29 + a.length * 7 + b.length;
    ctx.beginPath();
    arcPath(ctx, ax, ay, bx, by, Math.min(34, 10 + len * 0.05), seed, Math.max(6, Math.min(48, Math.round(len / 20))));
    // (and a fork off a long one, a second thinner bolt on its own path)
    if (len > 260) arcPath(ctx, ax, ay, bx, by, Math.min(26, 6 + len * 0.035), seed + 977, Math.max(6, Math.min(40, Math.round(len / 26))));
    strokeCurrent(ctx);
  }
  const darts: [number, number][] = [[cx - player.facing * 2, cy - Math.min(10, target.height * 0.2)], [cx + player.facing * 2, cy + Math.min(8, target.height * 0.18)]];
  const dist = Math.hypot(cx - sx, cy - sy);
  const sag = Math.min(16, dist * 0.04);
  // The wires
  ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 1;
  darts.forEach(([dx, dy], i) => {
    ctx.beginPath();
    ctx.moveTo(r(sx), r(sy + (i ? 1 : -1)));
    ctx.quadraticCurveTo((sx + dx) / 2, (sy + dy) / 2 + sag * (i ? 1.2 : 0.8), r(dx), r(dy));
    ctx.stroke();
  });
  // The current going down them
  ctx.beginPath();
  darts.forEach(([dx, dy], i) => arcPath(ctx, sx, sy, dx, dy + sag * 0.3, 9, step * 23 + i * 101, Math.max(6, r(dist / 40))));
  strokeCurrent(ctx);
  // A packet of it running down the line, gun to target, over and over
  const run = (frame % 12) / 12;
  ctx.fillStyle = '#FFFFFF';
  darts.forEach(([dx, dy], i) => {
    const t = (run + i * 0.5) % 1;
    const px = sx + (dx - sx) * t, py = sy + (dy - sy) * t + Math.sin(t * Math.PI) * sag;
    ctx.fillRect(r(px) - 1, r(py) - 1, 3, 3);
  });
  // The darts, barbed in
  darts.forEach(([dx, dy]) => {
    ctx.fillStyle = '#E5E7EB'; ctx.fillRect(r(dx) - 2, r(dy) - 1, 4, 2);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(r(dx) - 1, r(dy) - 2, 2, 4);
  });
  ctx.restore();
};
