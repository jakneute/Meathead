import type { GameState } from '../../core/state';
import type { MeatheadDeath } from '../../player/deathAnim';
import { MEATHEAD_DEATH_FRAMES, FALL_HIT } from '../../player/deathAnim';
import { body } from './deathAnim';
import type { DeathFace } from './deathFace';

// The falls: the kill cam cutting to the bottom of whatever he's gone down (see player/deathAnim), screen space, over
// everything. Quick, and nasty: wedged head first in a crevasse and frozen there, onto the rebar in a dug-up street,
// splattered in an alley (and the rats), into a pit of crude (and then it goes up), folded backwards over a rock in an
// arroyo (and the vultures), onto the rocks under Alcatraz (and the crab), down into the old fort's dungeon (and its
// last tenant has a laugh about it).

type Ctx = CanvasRenderingContext2D;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** Him in the kill cam: his middle at (x, y), turned rot, s times life size, the face given. */
const him = (ctx: Ctx, state: GameState, d: MeatheadDeath, x: number, y: number, rot: number, s: number, face: DeathFace, extra: Record<string, unknown> = {}, clip?: (c: Ctx) => void) => {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(rot);
  if (clip) { ctx.beginPath(); clip(ctx); ctx.clip(); }
  body(ctx, { ...state, blocks: [], camera: { x: 0, y: 0 } } as GameState, { ...d, x: 0, y: 32 }, state.player.currentWeapon, { deathFace: face, ...extra });
  ctx.restore();
};

/** Coming down: from above the top of the screen to y by FALL_HIT. */
const dropTo = (t: number, y: number) => (t >= FALL_HIT ? y : -160 + (y + 160) * (t / FALL_HIT) ** 2);

/** Blood: a pool spreading at (x, y), up to r wide. */
const pool = (ctx: Ctx, x: number, y: number, r: number, color = 'rgba(127, 29, 29, 0.9)') => { ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, r, Math.max(2, r * 0.14), 0, 0, Math.PI * 2); ctx.fill(); };

export const drawFallCam = (ctx: Ctx, state: GameState, W: number, H: number) => {
  const d = state.meatheadDeath;
  if (!d || state.deathTimer <= 0 || !d.kind.startsWith('fall_')) return;
  const t = Math.min(state.deathScene?.t ?? 9999, MEATHEAD_DEATH_FRAMES[d.kind]);
  const f = state.frame, hit = t >= FALL_HIT, since = t - FALL_HIT;
  ctx.save();
  switch (d.kind) {
    case 'fall_crevasse': crevasse(ctx, state, d, t, f, hit, since, W, H); break;
    case 'fall_trench': trench(ctx, state, d, t, f, hit, since, W, H); break;
    case 'fall_alley': alley(ctx, state, d, t, f, hit, since, W, H); break;
    case 'fall_crude': crude(ctx, state, d, t, f, hit, since, W, H); break;
    case 'fall_arroyo': arroyo(ctx, state, d, t, f, hit, since, W, H); break;
    case 'fall_rocks': rocks(ctx, state, d, t, f, hit, since, W, H); break;
    case 'fall_dungeon': dungeon(ctx, state, d, t, f, hit, since, W, H); break;
  }
  // (and it dims on him at the end, for the message)
  const out = clamp01((t - (MEATHEAD_DEATH_FRAMES[d.kind] - 20)) / 20);
  if (out > 0) { ctx.fillStyle = `rgba(0, 0, 0, ${out * 0.6})`; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
};

type Scene = (ctx: Ctx, state: GameState, d: MeatheadDeath, t: number, f: number, hit: boolean, since: number, W: number, H: number) => void;

/** Artie's crevasses: head first down the narrowing crack, wedged where it gets too tight, legs kicking; frosting over. */
const crevasse: Scene = (ctx, state, d, t, f, hit, since, W, H) => {
  const cx = W / 2, hw = (y: number) => 175 - y * 0.24;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#BAE6FD'); g.addColorStop(0.4, '#1E3A5F'); g.addColorStop(1, '#020617');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const side of [-1, 1]) {
    const wall = ctx.createLinearGradient(side < 0 ? 0 : W, 0, cx, 0); wall.addColorStop(0, '#0C4A6E'); wall.addColorStop(0.7, '#38BDF8'); wall.addColorStop(1, '#E0F2FE');
    ctx.fillStyle = wall; ctx.beginPath(); ctx.moveTo(side < 0 ? 0 : W, 0);
    for (let y = 0; y <= H; y += 20) ctx.lineTo(cx + side * (hw(y) + (hash(y + side) - 0.5) * 14), y);
    ctx.lineTo(side < 0 ? 0 : W, H); ctx.closePath(); ctx.fill();
    // (streaks in the ice, icicles off its lips)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'; for (let k = 0; k < 9; k++) { const y = 40 + k * 60; ctx.fillRect(cx + side * (hw(y) + 20 + hash(k) * 60), y, 3, 40); }
    ctx.fillStyle = '#E0F2FE'; for (let k = 0; k < 6; k++) { const y = 60 + k * 85, x = cx + side * hw(y); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - side * 10, y); ctx.lineTo(x - side * 3, y + 22); ctx.fill(); }
  }
  const wedge = 470;
  const kick = hit ? Math.sin(since * 0.9) * 0.12 * (1 - clamp01(since / 50)) : Math.sin(t * 0.5) * 0.2;
  const frost = clamp01((since - 40) / 30);
  him(ctx, state, d, cx + (hit ? 0 : Math.sin(t * 0.4) * 10), dropTo(t, wedge) - (hit && since < 4 ? 4 - since : 0), Math.PI + kick, 1.6,
    !hit || since < 40 ? 'scream' : 'frozen', { }, undefined);
  if (frost > 0) {
    ctx.fillStyle = `rgba(224, 242, 254, ${frost * 0.55})`; ctx.beginPath(); ctx.ellipse(cx, wedge, 40, 56, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; for (let k = 0; k < 10; k++) if (hash(k * 7) < frost) ctx.fillRect(cx - 34 + hash(k) * 68, wedge - 50 + hash(k + 3) * 100, 2, 2);
  }
  void f;
};

/** Barry's dug-up streets: on his back onto the rebar sticking up out of the slab, the burst main hosing him down. */
const trench: Scene = (ctx, state, d, t, f, hit, since, W, H) => {
  const cx = W / 2, floor = 520;
  ctx.fillStyle = '#1C1410'; ctx.fillRect(0, 0, W, H);
  for (let b = 0; b < 10; b++) { ctx.fillStyle = ['#3B2A1E', '#4A3524', '#33251A', '#56402C'][b % 4]; ctx.fillRect(0, b * 56, 150 + hash(b) * 30, 56); ctx.fillRect(W - 150 - hash(b + 9) * 30, b * 56, 200, 56); }
  ctx.fillStyle = 'rgba(255, 237, 213, 0.15)'; ctx.fillRect(180, 0, W - 360, 26);
  // The slab, and the rebar
  ctx.fillStyle = '#57534E'; ctx.fillRect(120, floor, W - 240, H - floor); ctx.fillStyle = '#78716C'; ctx.fillRect(120, floor, W - 240, 5);
  const bars = [-60, -22, 14, 50, 88];
  ctx.fillStyle = '#7C2D12'; for (const bx of bars) ctx.fillRect(cx + bx - 2, floor - 130 + (bx % 3) * 8, 4, 130);
  // The burst main, gushing across
  ctx.fillStyle = '#6B7280'; ctx.fillRect(W - 210, 300, 60, 22); ctx.fillStyle = '#4B5563'; ctx.fillRect(W - 214, 296, 8, 30);
  ctx.fillStyle = 'rgba(147, 197, 253, 0.7)'; for (let k = 0; k < 14; k++) { const q = ((f * 4 + k * 23) % 160) / 160; ctx.beginPath(); ctx.arc(W - 216 - q * 230, 310 + q * q * 140 + Math.sin(k) * 6, 5 - q * 2, 0, Math.PI * 2); ctx.fill(); }
  const by = dropTo(t, floor - 100);
  if (hit) pool(ctx, cx, floor, Math.min(150, since * 3), 'rgba(190, 18, 60, 0.6)');
  him(ctx, state, d, cx, by - (hit && since < 8 && since % 4 < 2 ? 2 : 0), -d.facing * Math.PI / 2, 2, hit && since > 20 ? 'dead' : 'scream');
  // (the bars through him, out the front, bloody)
  if (hit) for (const bx of bars.slice(1, 4)) { ctx.fillStyle = '#7C2D12'; ctx.fillRect(cx + bx - 2, by - 70, 4, 34); ctx.fillStyle = '#B91C1C'; ctx.fillRect(cx + bx - 3, by - 44, 6, 8); ctx.fillRect(cx + bx - 1, by - 70, 2, 10); }
};

/** Barry's rooftop alleys: flat on the pavement, splattered; the rats come for what's spread furthest. */
const alley: Scene = (ctx, state, d, t, f, hit, since, W, H) => {
  const cx = W / 2, floor = 500;
  ctx.fillStyle = '#0F0D0C'; ctx.fillRect(0, 0, W, H);
  for (const side of [-1, 1]) for (let r = 0; r < 26; r++) for (let c = 0; c < 6; c++) {
    const x = side < 0 ? c * 30 + (r % 2) * 15 - 15 : W - 180 + c * 30 + (r % 2) * 15 - 15, y = r * 20;
    ctx.fillStyle = ['#7F1D1D', '#991B1B', '#6B2121'][(r * 7 + c) % 3]; ctx.fillRect(x, y, 28, 18);
  }
  ctx.fillStyle = '#292524'; ctx.fillRect(180, floor, W - 360, H - floor); ctx.fillStyle = '#44403C'; ctx.fillRect(180, floor, W - 360, 4);
  ctx.fillStyle = '#18181B'; ctx.beginPath(); ctx.ellipse(250, floor - 14, 30, 18, 0, 0, Math.PI * 2); ctx.ellipse(285, floor - 10, 24, 14, 0, 0, Math.PI * 2); ctx.fill();
  if (hit) {
    // The splatter, everywhere
    ctx.fillStyle = '#7F1D1D';
    for (let k = 0; k < 18; k++) { const a = hash(k) * Math.PI, r = 40 + hash(k + 4) * 140 * clamp01(since / 6); ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * r * (k % 2 ? 1 : -1), floor - 2 - Math.sin(a) * r * 0.25, 6 + hash(k + 9) * 10, 3, 0, 0, Math.PI * 2); ctx.fill(); }
    pool(ctx, cx, floor - 1, Math.min(110, 40 + since * 2));
  }
  const sq = hit ? 0.32 : 1;
  ctx.save(); ctx.translate(cx, hit ? floor - 14 : dropTo(t, floor - 40)); ctx.scale(1 + (1 - sq) * 0.6, sq); ctx.translate(-cx, -(hit ? floor - 14 : dropTo(t, floor - 40)));
  him(ctx, state, d, cx, hit ? floor - 14 : dropTo(t, floor - 40), hit ? -d.facing * Math.PI / 2 : Math.sin(t * 0.5) * 0.4, 2, hit ? 'dead' : 'scream');
  ctx.restore();
  // The rats: in from the dark, and off with a bit of him
  if (since > 30) for (let k = 0; k < 2; k++) {
    const q = since - 30 - k * 10; if (q < 0) continue;
    const back = q > 28, rx = back ? W + 40 - (90 - (q - 28) * 5) : W + 40 - Math.min(q, 28) * 5 - k * 30, ry = floor - 6;
    ctx.save(); ctx.translate(rx, ry); if (back) ctx.scale(-1, 1);
    ctx.fillStyle = '#44403C'; ctx.beginPath(); ctx.ellipse(0, 0, 14, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(-14, -2, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(14, 0); ctx.quadraticCurveTo(26, -4, 34, 4); ctx.stroke();
    ctx.fillStyle = '#EF4444'; ctx.fillRect(-19, -4, 2, 2);
    if (back) { ctx.fillStyle = '#991B1B'; ctx.beginPath(); ctx.ellipse(-24, 2, 6, 4, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
};

/** Oscar's crude pits: in, thrashing, black, going under; a burp of it; then the flare drips into it and the lot goes up. */
const crude: Scene = (ctx, state, d, t, f, hit, since, W, H) => {
  const cx = W / 2, surf = 400;
  const g = ctx.createLinearGradient(0, 0, 0, surf); g.addColorStop(0, '#431407'); g.addColorStop(1, '#C2410C');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, surf);
  // A derrick and the flare stack against the dusk
  ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(90, surf); ctx.lineTo(150, 80); ctx.lineTo(210, surf); ctx.moveTo(110, 300); ctx.lineTo(190, 300); ctx.moveTo(125, 200); ctx.lineTo(175, 200); ctx.stroke();
  ctx.fillStyle = '#1C1917'; ctx.fillRect(640, 120, 14, surf - 120);
  ctx.fillStyle = f % 6 < 3 ? '#FBBF24' : '#F97316'; ctx.beginPath(); ctx.moveTo(634, 120); ctx.quadraticCurveTo(647, 70 + Math.sin(f * 0.4) * 8, 660, 120); ctx.fill();
  // The pit
  ctx.fillStyle = '#0A0806'; ctx.fillRect(0, surf, W, H - surf);
  ctx.fillStyle = 'rgba(167, 139, 250, 0.25)'; for (let k = 0; k < 6; k++) ctx.fillRect(60 + k * 120 + Math.sin(f * 0.05 + k) * 10, surf + 4 + k % 2 * 6, 50, 2);
  // Him: in, and under, the crude creeping up him
  const sink = hit ? Math.min(140, since * 2.6) : 0;
  const by = hit ? surf + sink - 30 : dropTo(t, surf - 30);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, surf + 2); ctx.clip();
  him(ctx, state, d, cx + (hit ? Math.sin(since * 0.8) * 6 : 0), by, hit ? Math.sin(since * 0.5) * 0.25 : 0, 2, 'scream', { }, undefined);
  if (hit) { ctx.fillStyle = `rgba(10, 8, 6, ${clamp01(since / 30) * 0.8})`; ctx.fillRect(cx - 60, by - 70, 120, 140); }
  ctx.restore();
  if (hit && since < 6) { ctx.fillStyle = '#0A0806'; for (let k = 0; k < 14; k++) { ctx.beginPath(); ctx.arc(cx + (hash(k) - 0.5) * 140, surf - since * (6 + hash(k + 2) * 8), 4 + hash(k + 5) * 5, 0, Math.PI * 2); ctx.fill(); } }
  // (the burp)
  if (since > 55 && since < 66) { const q = (since - 55) / 11; ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 2; ctx.fillStyle = '#0A0806'; ctx.beginPath(); ctx.arc(cx + 10, surf - q * 10, 6 + q * 10, Math.PI, 0); ctx.fill(); ctx.stroke(); }
  // The flare drips; the pit goes up
  if (since > 62 && since < 74) { const q = (since - 62) / 12; ctx.fillStyle = '#FBBF24'; ctx.beginPath(); ctx.arc(647, 125 + q * (surf - 125), 4, 0, Math.PI * 2); ctx.fill(); }
  if (since >= 74) {
    const k = clamp01((since - 74) / 10), fl = 1 - clamp01((since - 110) / 20);
    for (let i = 0; i < 26; i++) {
      const x = 647 - (647 + 20) * clamp01(k * 1.2 - i * 0.02) * (i / 26) - 0 + i * 0, hgt = (50 + hash(i) * 110) * fl * (0.8 + 0.2 * Math.sin(f * 0.6 + i));
      const xx = W - (i / 25) * W * k;
      ctx.fillStyle = i % 2 ? 'rgba(249, 115, 22, 0.9)' : 'rgba(253, 224, 71, 0.85)';
      ctx.beginPath(); ctx.moveTo(xx - 22, surf + 4); ctx.quadraticCurveTo(xx - 10, surf - hgt * 0.6, xx + Math.sin(f * 0.5 + i) * 6, surf - hgt); ctx.quadraticCurveTo(xx + 12, surf - hgt * 0.6, xx + 22, surf + 4); ctx.fill();
      void x;
    }
  }
};

/** Dale's arroyos: down onto the rock at the bottom on his back, folded the wrong way over it; the vultures come down. */
const arroyo: Scene = (ctx, state, d, t, f, hit, since, W, H) => {
  const cx = W / 2, floor = 520, rockTop = 450;
  ctx.fillStyle = '#FDBA74'; ctx.fillRect(0, 0, W, H);
  for (const side of [-1, 1]) for (let b = 0; b < 12; b++) {
    ctx.fillStyle = ['#9A3412', '#B45309', '#7C2D12', '#C2410C'][b % 4];
    const y = b * 50, x0 = side < 0 ? 0 : W, inner = 190 + Math.sin(b * 1.3) * 40 + hash(b + side) * 30;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(side < 0 ? inner : W - inner, y); ctx.lineTo(side < 0 ? inner + 20 : W - inner - 20, y + 51); ctx.lineTo(x0, y + 51); ctx.fill();
  }
  ctx.fillStyle = '#D6A35C'; ctx.fillRect(0, floor, W, H - floor);
  ctx.fillStyle = '#78350F'; ctx.beginPath(); ctx.ellipse(cx, floor, 60, floor - rockTop, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#92400E'; ctx.beginPath(); ctx.ellipse(cx - 14, floor - 10, 30, 30, 0, Math.PI, 0); ctx.fill();
  // Him: down on his back over it, folded backwards at the middle
  if (!hit) him(ctx, state, d, cx, dropTo(t, rockTop - 30), -d.facing * Math.PI / 2 + Math.sin(t * 0.4) * 0.2, 2, 'scream');
  else {
    // (each end of him, either side of the rock, hanging down off it: the left end turned down to the left, the right
    // end down to the right, about the top of the rock)
    const fold = 0.7, py = rockTop - 4;
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.beginPath(); ctx.rect(side < 0 ? 0 : cx, 0, side < 0 ? cx : W - cx, H); ctx.clip();
      ctx.translate(cx, py); ctx.rotate(side * fold); ctx.translate(-cx, -py);
      him(ctx, state, d, cx, py - 20, -d.facing * Math.PI / 2, 2, 'dead');
      ctx.restore();
    }
    pool(ctx, cx, floor, Math.min(70, since * 1.5));
    ctx.fillStyle = '#7F1D1D'; ctx.fillRect(cx - 4, rockTop - 4, 8, Math.min(60, since * 2));
  }
  // The vultures: circling down, then on him
  for (let k = 0; k < 2; k++) {
    const q = clamp01((since - 20 - k * 12) / 50);
    const a = f * 0.05 + k * Math.PI;
    const vx = q < 1 ? cx + Math.cos(a) * 160 * (1 - q) + (k ? 40 : -40) * q : cx + (k ? 46 : -46), vy = q < 1 ? 60 + (rockTop - 90) * q + Math.sin(a) * 30 * (1 - q) : rockTop - 40 + (f % 14 < 4 ? 6 : 0);
    if (since < 20 + k * 12) continue;
    ctx.save(); ctx.translate(vx, vy); if ((k ? -1 : 1) < 0) ctx.scale(-1, 1);
    ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.ellipse(0, 0, 16, 9, 0, 0, Math.PI * 2); ctx.fill();
    const flap = q < 1 ? Math.sin(f * 0.5 + k) * 14 : 4;
    ctx.beginPath(); ctx.moveTo(-6, -4); ctx.lineTo(-30, -6 - flap); ctx.lineTo(-10, 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(4, -4); ctx.lineTo(26, -8 - flap); ctx.lineTo(8, 2); ctx.fill();
    ctx.fillStyle = '#FCA5A5'; ctx.beginPath(); ctx.arc(16, -6, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#E7E5E4'; ctx.fillRect(11, -2, 6, 3);
    ctx.restore();
  }
};

/** Under Alcatraz's cliffs: belly first onto the rocks in the surf; a wave over it all, red going out with it; a crab. */
const rocks: Scene = (ctx, state, d, t, f, hit, since, W, H) => {
  const cx = W / 2, rockTop = 430, sea = 470;
  const g = ctx.createLinearGradient(0, 0, 0, sea); g.addColorStop(0, '#94A3B8'); g.addColorStop(1, '#CBD5E1');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, sea);
  ctx.fillStyle = '#57534E'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(150, 0); ctx.lineTo(120, 200); ctx.lineTo(170, 380); ctx.lineTo(120, sea); ctx.lineTo(0, sea); ctx.fill();
  ctx.fillStyle = '#1E3A5F'; ctx.fillRect(0, sea, W, H - sea);
  ctx.fillStyle = '#44403C'; ctx.beginPath(); ctx.moveTo(cx - 120, sea + 10); ctx.lineTo(cx - 40, rockTop - 10); ctx.lineTo(cx + 10, rockTop); ctx.lineTo(cx + 70, rockTop + 14); ctx.lineTo(cx + 130, sea + 10); ctx.fill();
  ctx.fillStyle = '#292524'; ctx.beginPath(); ctx.moveTo(cx + 150, sea + 10); ctx.lineTo(cx + 200, sea - 40); ctx.lineTo(cx + 260, sea + 10); ctx.fill();
  if (!hit) him(ctx, state, d, cx, dropTo(t, rockTop - 18), d.facing * Math.PI / 2 + Math.sin(t * 0.4) * 0.2, 2, 'scream');
  else {
    ctx.fillStyle = '#7F1D1D'; for (let k = 0; k < 12; k++) { ctx.beginPath(); ctx.arc(cx - 70 + hash(k) * 140, rockTop - 4 + hash(k + 3) * 30, 4 + hash(k + 7) * 6, 0, Math.PI * 2); ctx.fill(); }
    ctx.save(); ctx.translate(cx, rockTop - 12); ctx.scale(1.15, 0.7); ctx.translate(-cx, -(rockTop - 12));
    him(ctx, state, d, cx, rockTop - 12, d.facing * Math.PI / 2, 2, 'dead');
    ctx.restore();
  }
  // The wave, over the lot, and back out pink
  const w = clamp01((since - 30) / 25), back = clamp01((since - 55) / 25);
  if (w > 0) {
    const x = W + 60 - (W + 200) * w + (W + 200) * back * 0.4;
    ctx.fillStyle = back > 0 ? `rgba(251, 113, 133, ${0.6 * (1 - back)})` : 'rgba(241, 245, 249, 0.85)';
    ctx.beginPath(); ctx.moveTo(x, sea + 20); ctx.quadraticCurveTo(x + 40, rockTop - 60, x + 120, rockTop - 30); ctx.lineTo(W + 200, rockTop - 30); ctx.lineTo(W + 200, sea + 20); ctx.fill();
  }
  // The crab, off with a finger
  if (since > 50) {
    const q = since - 50, x = cx + 40 + q * 4, y = rockTop + 6 - Math.abs(Math.sin(q * 0.6)) * 2;
    ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.ellipse(x, y, 10, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#991B1B'; ctx.lineWidth = 2; for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(x + s * 6, y + 2); ctx.lineTo(x + s * (12 + k * 2), y + 7 + (q % 4 < 2 ? 1 : -1)); ctx.stroke(); }
    ctx.fillStyle = '#D4A373'; ctx.fillRect(x + 10, y - 6, 9, 3); ctx.fillStyle = '#B91C1C'; ctx.fillRect(x + 10, y - 6, 2, 3);
  }
};

/** Down the hole in the cell house floor into the old fort: head first onto the flagstones, crumpled the wrong way;
 * the old boy chained to the wall, who's been down here since 1934, turns his head to look, and has a laugh. */
const dungeon: Scene = (ctx, state, d, t, f, hit, since, W, H) => {
  const floor = 500, cx = W / 2 + 40;
  ctx.fillStyle = '#1C1917'; ctx.fillRect(0, 0, W, H);
  for (let r = 0; r < 14; r++) for (let c = 0; c < 9; c++) { ctx.fillStyle = ['#3F3A36', '#44403C', '#36312D'][(r * 3 + c) % 3]; ctx.fillRect(c * 92 + (r % 2) * 46 - 46, r * 38, 88, 34); }
  const lg = ctx.createRadialGradient(cx, 0, 10, cx, 0, 260); lg.addColorStop(0, 'rgba(254, 243, 199, 0.4)'); lg.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#292524'; ctx.fillRect(0, floor, W, H - floor);
  // The old boy, chained up, sat against the wall
  const sx = 200, sy = floor;
  ctx.strokeStyle = '#71717A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx - 30, sy - 120); ctx.lineTo(sx - 18, sy - 70); ctx.moveTo(sx + 30, sy - 120); ctx.lineTo(sx + 18, sy - 70); ctx.stroke();
  ctx.strokeStyle = '#E7E5D6'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath();
  ctx.moveTo(sx, sy - 76); ctx.lineTo(sx, sy - 30); for (let r = 0; r < 4; r++) { ctx.moveTo(sx - 12, sy - 70 + r * 9); ctx.lineTo(sx + 12, sy - 70 + r * 9); }
  ctx.moveTo(sx - 14, sy - 74); ctx.lineTo(sx - 18, sy - 70); ctx.moveTo(sx + 14, sy - 74); ctx.lineTo(sx + 18, sy - 70);
  ctx.moveTo(sx, sy - 30); ctx.lineTo(sx + 30, sy - 26); ctx.lineTo(sx + 34, sy); ctx.moveTo(sx, sy - 30); ctx.lineTo(sx - 26, sy - 22); ctx.lineTo(sx - 30, sy);
  ctx.stroke(); ctx.lineCap = 'butt';
  const look = clamp01((since - 20) / 12), laugh = since > 36 && since < 70 && since % 8 < 4;
  ctx.save(); ctx.translate(sx, sy - 90); ctx.rotate(0.35 * look);
  ctx.fillStyle = '#E7E5D6'; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1C1917'; ctx.fillRect(-6 + look * 4, -4, 4, 4); ctx.fillRect(2 + look * 4, -4, 4, 4); ctx.fillRect(-1 + look * 3, 2, 2, 3);
  ctx.fillStyle = '#E7E5D6'; ctx.fillRect(-7, 9 + (laugh ? 6 : 0), 14, 5);
  ctx.fillStyle = '#1C1917'; for (let k = -6; k <= 6; k += 3) ctx.fillRect(k, 9 + (laugh ? 6 : 0), 1, 3);
  ctx.restore();
  if (laugh) { ctx.fillStyle = '#E7E5D6'; ctx.font = 'bold 9px "Press Start 2P"'; ctx.fillText(since % 16 < 8 ? 'HEH' : 'HEH HEH', sx + 20, sy - 120); }
  // Him: head first onto the flags, crumpled, his neck the wrong way
  if (!hit) him(ctx, state, d, cx, dropTo(t, floor - 46), Math.PI + Math.sin(t * 0.5) * 0.2, 1.6, 'scream');
  else {
    him(ctx, state, d, cx, floor - 30, Math.PI * 0.62 * d.facing, 1.6, 'dead', { }, undefined);
    pool(ctx, cx - 30 * d.facing, floor, Math.min(70, since * 1.4));
    if (since < 10) { ctx.fillStyle = 'rgba(168, 162, 158, 0.6)'; for (let k = 0; k < 8; k++) { ctx.beginPath(); ctx.arc(cx + (hash(k) - 0.5) * 120, floor - since * 2 - hash(k + 1) * 20, 8 + since, 0, Math.PI * 2); ctx.fill(); } }
  }
  void f;
};
