// The finale's alien, in the fight: the same animal the cutscenes draw (scenes/alienLook.ts: his build, his colors,
// the ray gun grafted on his arm), painted as pixel art at its own resolution and put down twice the size on the
// screen, so he's of a piece with the cutscene he's just climbed out of. On top of the figure: how he is right now.
//   floating: on his anti-grav (a pink pulse under his feet), mouth hanging open, breathing through it;
//   the tell: the gun up, the coil glowing hotter, a flickering sight line out along where it's aimed, white when it locks;
//   firing: mouth wide, the beam (white-hot core, pink, magenta) across the room;
//   hit: a white flash; reeling (a heavy one); battered as he loses health (holes oozing slime, bruises, a tooth gone);
//   iced: frosted blue, icicles off his jaw and arms, his breath fogging, shivering;
//   knocked silly / tased through his men: eyes rolled back, stars, tongue out;
//   sludged: down on the floor in it, green to the waist, strings of it, straining;
//   carried off by a wave: drenched, tumbling;   on fire: burning (oiled and lit);
//   beaten (the plead): cringing, brows up, sweating buckets, tears, lobbing sad little bolts.

import { Enemy, Projectile } from '../../../types';
import { drawAlienFigure, ALIEN } from '../../scenes/alienLook';
import { finaleBeingDrawn, FinaleRuntime } from '../../stages/finale/state';
import { aimAngle, alienMuzzle, ART_SCALE } from '../../bosses/alien';
import { FLOOR } from '../../stages/finale/geometry';
import { drawFire } from '../fx/fire';
import { steppedGlow, pixelBlob } from '../pixelArt';
import { goreOf } from './kit';

type Ctx = CanvasRenderingContext2D;

/** The art canvas: his feet at (CX, BASE), room round him for the gun arm out either way. */
const AW = 168, AH = 128, CX = 84, BASE = 122;
let art: HTMLCanvasElement | null = null;

const P = (g: Ctx, x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

/** How he's drawn this frame. */
interface Look {
  f: 1 | -1; t: number; arm: 'down' | 'aim'; aim: number; open: boolean;
  stunned: boolean; slowed: boolean; grounded: boolean; washed: boolean; plead: boolean; flash: number; gore: number; tased: boolean;
}

const lookOf = (e: Enemy, rt: FinaleRuntime | null, frame: number): Look => {
  const f: 1 | -1 = e.facing === -1 ? -1 : 1;
  const mode = rt?.mode ?? 'float';
  const aiming = mode === 'charge' || mode === 'fire';
  const lob = mode === 'plead' && rt !== null && rt.boltT > 85;
  return {
    f, t: frame,
    arm: aiming || lob ? 'aim' : 'down',
    aim: aiming && rt ? aimAngle(rt.aim) : lob ? 0.55 : 0,
    open: mode === 'fire' || mode === 'plead' || (rt?.stunT ?? 0) > 0 || (rt?.groundT ?? 0) > 0 || frame % 200 < 70,
    stunned: (rt?.stunT ?? 0) > 0, slowed: (rt?.slowT ?? 0) > 0, grounded: (rt?.groundT ?? 0) > 0, washed: (rt?.pushT ?? 0) > 0,
    plead: mode === 'plead', flash: rt?.flash ?? 0, gore: goreOf(e), tased: !!e.isTased && (rt?.stunT ?? 0) > 0,
  };
};

/** On the art canvas, facing his way: x is from his middle, toward the way he's facing. */
const mirror = (g: Ctx, f: 1 | -1) => (x: number, y: number, w: number, h: number, c: string) => P(g, f > 0 ? CX + x : CX - x - w, BASE + y, w, h, c);

/** His face, the way he's feeling (over the figure's own: the eyes at x 3 and 9, the mouth at y -93). */
const face = (g: Ctx, L: Look) => {
  const R = mirror(g, L.f), H = ALIEN.hide;
  if (L.stunned) {
    // Eyes rolled back into his head (all white, a crack of red), tongue lolling out the side
    for (const ex of [3, 9]) { R(ex - 1, -101, 4, 3, H[3]); R(ex, -100, 3, 2, '#f0ecd8'); R(ex + 1, -100, 1, 1, ALIEN.eyeRim); }
    R(14, -92, 3, 6 + (L.t % 20 < 10 ? 1 : 0), ALIEN.gumLight); R(14, -86, 3, 1, ALIEN.gum);
  } else if (L.flash > 6) {
    // Squeezed shut (that one hurt)
    for (const ex of [3, 9]) { R(ex - 1, -101, 4, 3, H[3]); R(ex - 1, -100, 4, 1, H[0]); }
  } else if (L.plead) {
    // Brows up in the middle (please), eyes wet, tears running
    R(1, -104, 4, 1, H[1]); R(4, -105, 2, 1, H[1]); R(8, -105, 2, 1, H[1]); R(10, -104, 4, 1, H[1]);
    for (const ex of [3, 9]) { R(ex, -100, 3, 2, ALIEN.sclera); R(ex + 1, -100, 1, 1, ALIEN.pupil); R(ex, -101, 1, 1, '#ffffff'); }
    const run = (L.t * 0.25) % 10;
    R(3, -98 + run, 1, 2, '#bfe8ff'); R(11, -97 + ((run + 5) % 10), 1, 2, '#bfe8ff');
    // (the bottom lip wobbling)
    if (L.t % 10 < 5) R(5, -90, 14, 1, ALIEN.gum);
  } else if (L.arm === 'aim') {
    // Squinting down the gun, the dumb grin of a man who's about to
    for (const ex of [3, 9]) { R(ex - 1, -101, 4, 1, H[1]); R(ex, -100, 3, 1, ALIEN.sclera); R(ex + 1, -100, 1, 1, ALIEN.pupil); }
  }
  if (L.slowed) {
    // Icicles off his jaw, his teeth chattering
    for (let i = 0; i < 4; i++) R(5 + i * 4, -86, 2, 3 + (i % 2) * 2, '#e0f2fe');
    if (L.t % 4 < 2) R(4, -93, 18, 1, '#c8e8f8');
  }
};

/** Battered: holes oozing slime, bruises, a tooth gone, as his health goes. */
const battered = (g: Ctx, L: Look) => {
  const R = mirror(g, L.f);
  const holes: [number, number][] = [[-8, -58], [10, -66], [-16, -44], [4, -48], [18, -54], [-4, -70], [12, -40], [-12, -62]];
  const n = Math.min(holes.length, Math.floor(L.gore * holes.length * 1.05));
  for (let i = 0; i < n; i++) {
    const [x, y] = holes[i];
    R(x, y, 3, 3, ALIEN.mouth); R(x + 1, y + 1, 1, 1, ALIEN.slimeDark);
    // (slime running down out of it)
    const run = ((L.t * 0.3 + i * 7) % 14);
    R(x + 1, y + 3, 1, 2 + Math.min(6, run * 0.5), ALIEN.slime);
  }
  if (L.gore > 0.35) { R(-2, -86, 5, 3, '#4a2a5c'); R(12, -104, 4, 3, '#4a2a5c'); }
  if (L.gore > 0.6) { R(7, -95, 2, 3, ALIEN.mouth); R(-20, -70, 6, 4, '#3a2048'); }
};

/** Anything drawn over the whole of him, just where he is (a tint: iced, slimed, a flash). */
const tint = (g: Ctx, color: string, alpha: number, y0 = 0, y1 = AH) => {
  g.save(); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = alpha; g.fillStyle = color; g.fillRect(0, y0, AW, y1 - y0); g.restore();
};

const paint = (L: Look) => {
  if (typeof document === 'undefined') return null;
  art ??= document.createElement('canvas');
  art.width = AW; art.height = AH;
  const g = art.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  // (shivering with the cold, wobbling on his feet, or stock still in the sludge)
  const sx = L.slowed && L.t % 4 < 2 ? 1 : 0;
  drawAlienFigure(g, CX + sx, BASE, { facing: L.f, t: L.t, arm: L.arm, aim: L.aim, open: L.open });
  battered(g, L);
  face(g, L);
  if (L.slowed) {
    tint(g, '#9fdcff', 0.38);
    const R = mirror(g, L.f);
    // (icicles hanging off his arms and his gut)
    for (const [x, y, h] of [[-32, -30, 5], [33, -28, 6], [-6, -26, 4], [8, -25, 5], [22, -60, 4]] as const) { R(x, y, 2, h, '#e0f2fe'); R(x, y, 1, h - 1, '#ffffff'); }
  }
  if (L.grounded) {
    // Green to the waist in it, strings of it hanging
    tint(g, '#6b8e23', 0.55, BASE - 52, AH);
    const R = mirror(g, L.f);
    for (let i = 0; i < 7; i++) R(-26 + i * 8, -54 + ((i * 5) % 7), 2, 4 + ((L.t * 0.2 + i * 3) % 6), '#84cc16');
  }
  if (L.washed) tint(g, '#1e3a8a', 0.25);
  if (L.flash > 0) tint(g, '#ffffff', Math.min(0.75, L.flash / 10));
  return art;
};

/** The body (local space: his box's top-left at 0, 0). */
export const drawAlien = (ctx: Ctx, e: Enemy, frame: number) => {
  const rt = finaleBeingDrawn();
  const L = lookOf(e, rt, frame);
  const c = paint(L);
  if (!c) return;
  const prev = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  // (his feet at the bottom of his box, the middle of him the middle of it)
  ctx.drawImage(c, e.width / 2 - CX * ART_SCALE, e.height - BASE * ART_SCALE, AW * ART_SCALE, AH * ART_SCALE);
  ctx.imageSmoothingEnabled = prev;
};

// ---------------------------------------------------------------------------
// Round him, in the world
// ---------------------------------------------------------------------------

/** What's round him: the anti-grav under him, the gun's tell, stars, his breath, sweat, fire. (The beam's drawn by the
 * stage, over Meathead.) */
export const drawAlienGear = (ctx: Ctx, e: Enemy, frame: number) => {
  const rt = finaleBeingDrawn();
  if (!rt || e.health <= 0) return;
  const cx = e.pos.x + e.width / 2, top = e.pos.y, feet = e.pos.y + e.height;
  const L = ALIEN.laser;
  // The anti-grav: a pulse of pink light under his feet, rings going down off it, and its glow on the carpet
  if (rt.groundT <= 0) {
    const k = 0.6 + 0.4 * Math.sin(frame * 0.2);
    steppedGlow(ctx, cx, feet + 6, 34, '#ec44c4', 0.28 * k, 0, 4);
    for (let i = 0; i < 3; i++) {
      const u = ((frame * 0.03 + i / 3) % 1);
      ctx.strokeStyle = `rgba(255, 140, 228, ${(0.6 * (1 - u)).toFixed(3)})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(cx, feet + 4 + u * 26, 22 + u * 14, 4 + u * 3, 0, 0, Math.PI * 2); ctx.stroke();
    }
    const gap = FLOOR - feet;
    ctx.fillStyle = `rgba(236, 68, 196, ${(0.22 * k * Math.max(0, 1 - gap / 200)).toFixed(3)})`;
    ctx.beginPath(); ctx.ellipse(cx, FLOOR - 1, 40, 5, 0, 0, Math.PI * 2); ctx.fill();
  }
  // The tell: the coil glowing up, a sight line flickering out along where it's aimed (white once it's locked on)
  if (rt.mode === 'charge') {
    const m = alienMuzzle(e, rt.aim);
    const tell = Math.max(1, rt.tellLen ?? (72 - (1 - e.health / e.maxHealth) * 36) * (rt.slowT > 0 ? 1.6 : 1));
    const k = Math.min(1, rt.modeT / tell), locked = rt.modeT >= tell - 14;
    steppedGlow(ctx, m.x, m.y, 8 + k * 22, '#ec44c4', 0.15 + k * 0.45, 0, 5);
    ctx.fillStyle = L[6]; ctx.fillRect(Math.round(m.x - 2 - k * 2), Math.round(m.y - 2 - k * 2), 4 + k * 4, 4 + k * 4);
    // (sparks drawn in toward the muzzle as it charges)
    for (let i = 0; i < 6; i++) {
      const a = i * 1.05 + frame * 0.2, d = (1 - ((frame * 0.05 + i / 6) % 1)) * (30 - k * 10);
      ctx.fillStyle = i % 2 ? L[5] : L[4]; ctx.fillRect(Math.round(m.x + Math.cos(a) * d), Math.round(m.y + Math.sin(a) * d), 2, 2);
    }
    if (!locked ? frame % 4 < 3 : frame % 4 < 2) {
      const len = 1400;
      ctx.save();
      ctx.strokeStyle = locked ? 'rgba(255, 255, 255, 0.85)' : `rgba(236, 68, 196, ${(0.35 + k * 0.4).toFixed(3)})`;
      ctx.lineWidth = locked ? 2 : 1.5; ctx.setLineDash(locked ? [] : [10, 8]); ctx.lineDashOffset = -frame * 2;
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x + rt.aim.dx * len, m.y + rt.aim.dy * len); ctx.stroke();
      ctx.restore();
    }
  }
  // Knocked silly: stars round his head
  if (rt.stunT > 0) {
    ctx.save(); ctx.font = 'bold 14px "Press Start 2P"'; ctx.textAlign = 'center';
    for (let k = 0; k < 4; k++) { const a = frame * 0.18 + (k * Math.PI * 2) / 4; ctx.fillStyle = k % 2 ? '#FDE047' : '#FFFFFF'; ctx.fillText('*', cx + (e.facing === -1 ? -14 : 14) + Math.cos(a) * 26, top + 2 + Math.sin(a) * 7); }
    ctx.restore();
  }
  // Iced: his breath fogging in front of his face
  if (rt.slowT > 0 && frame % 50 < 30) {
    const u = (frame % 50) / 30;
    pixelBlob(ctx, cx + (e.facing === -1 ? -1 : 1) * (26 + u * 20), top + 30 - u * 6, 6 + u * 8, 4 + u * 5, `rgba(224, 242, 254, ${(0.55 * (1 - u)).toFixed(3)})`);
  }
  // Beaten: sweat flying off him
  if (rt.mode === 'plead') for (let i = 0; i < 3; i++) {
    const u = ((frame * 0.04 + i / 3) % 1), side = i % 2 ? 1 : -1;
    ctx.fillStyle = `rgba(191, 232, 255, ${(0.9 * (1 - u)).toFixed(3)})`;
    ctx.fillRect(Math.round(cx + side * (20 + u * 26)), Math.round(top + 8 - Math.sin(u * Math.PI) * 18 + u * 20), 3, 4);
  }
  // On fire
  if (e.isOnFire) drawFire(ctx, cx, feet - 20, e.width * 0.8, e.height * 0.9, frame, { seed: 77, smoke: 0.7, sparks: true, glow: 1 });
};

/** The beam: a fat white-hot core, pink round it, magenta round that, wobbling; banded like the cutscene's. Weakened
 * (a flamethrower on it), it's thinner and paler: past where the flame meets it, or all of it with the flame on him. */
export const drawBeam = (ctx: Ctx, x: number, y: number, dx: number, dy: number, len: number, frame: number, clash?: { x: number; y: number }, weak = false) => {
  const L = ALIEN.laser;
  const ex = x + dx * len, ey = y + dy * len;
  const wob = Math.sin(frame * 1.3) * 1.5;
  // (where it goes weak: the clash, or straight from the muzzle)
  const cut = !weak ? len : clash ? Math.max(0, Math.min(len, (clash.x - x) * dx + (clash.y - y) * dy)) : 0;
  ctx.save();
  ctx.lineCap = 'butt';
  const bands = [[30 + wob * 2, 'rgba(192, 28, 152, 0.28)'], [20 + wob, L[2]], [13, L[3]], [8, L[4]], [3, L[6]]] as const;
  const run = (s0: number, s1: number, k: number, alpha: number) => {
    if (s1 <= s0) return;
    ctx.globalAlpha = alpha;
    for (const [w, c] of bands) {
      ctx.strokeStyle = c; ctx.lineWidth = Math.max(1, Math.round(w * k));
      ctx.beginPath(); ctx.moveTo(x + dx * s0, y + dy * s0); ctx.lineTo(x + dx * s1, y + dy * s1); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };
  run(0, cut, 1, 1);
  // (weakened: thinner, flickering, a bit see-through)
  run(cut, len, 0.5 + (frame % 4 < 2 ? 0.08 : 0), 0.75);
  // Rings of it rippling down the beam
  const nx = -dy, ny = dx;
  for (let s = (frame * 14) % 60; s < len; s += 60) {
    const px = x + dx * s, py = y + dy * s, r = s < cut ? 9 : 5;
    ctx.fillStyle = L[5];
    ctx.fillRect(Math.round(px + nx * r - 2), Math.round(py + ny * r - 2), 4, 4);
    ctx.fillRect(Math.round(px - nx * r - 2), Math.round(py - ny * r - 2), 4, 4);
  }
  // The flare at the muzzle, the clash with the flame, and the splash where it ends
  steppedGlow(ctx, x, y, 26, '#ec44c4', 0.5, 0, 4);
  ctx.fillStyle = L[6]; ctx.fillRect(Math.round(x - 5), Math.round(y - 5), 10, 10);
  if (clash) {
    steppedGlow(ctx, clash.x, clash.y, 34, '#fde047', 0.55, 0, 4);
    ctx.fillStyle = '#fef9c3'; ctx.fillRect(Math.round(clash.x - 6), Math.round(clash.y - 6), 12, 12);
  }
  steppedGlow(ctx, ex, ey, weak ? 16 : 24, '#ec44c4', 0.55, 0, 4);
  ctx.fillStyle = L[6]; ctx.fillRect(Math.round(ex - (weak ? 4 : 6)), Math.round(ey - (weak ? 4 : 6)), weak ? 8 : 12, weak ? 8 : 12);
  ctx.restore();
};

/** One of the beaten alien's sad little bolts: a droopy pink blob, wobbling, a few sparkles falling off it. */
export const drawSadBolt = (ctx: Ctx, p: Projectile, frame: number) => {
  const L = ALIEN.laser;
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  const sag = Math.sin((frame + (p.bornAt ?? 0)) * 0.25) * 2;
  steppedGlow(ctx, cx, cy, 12, '#ec44c4', 0.25, 0, 3);
  ctx.fillStyle = L[3]; ctx.fillRect(Math.round(cx - 7), Math.round(cy - 3 + sag), 14, 6);
  ctx.fillStyle = L[4]; ctx.fillRect(Math.round(cx - 5), Math.round(cy - 2 + sag), 10, 3);
  ctx.fillStyle = L[6]; ctx.fillRect(Math.round(cx - 2), Math.round(cy - 1 + sag), 4, 2);
  // (drooping at the back end)
  ctx.fillStyle = L[2]; ctx.fillRect(Math.round(cx - Math.sign(p.vel.x || 1) * 9 - 2), Math.round(cy + 1 + sag), 4, 3);
  if (frame % 6 < 3) { ctx.fillStyle = L[5]; ctx.fillRect(Math.round(cx - Math.sign(p.vel.x || 1) * 12), Math.round(cy + 5 + ((frame * 0.5) % 6)), 2, 2); }
};

// ---------------------------------------------------------------------------
// What's left of him
// ---------------------------------------------------------------------------

/**
 * Dead, the pistol's last round in him: flat on his back in a spreading lake of his own slime, deflating (the gas going
 * out of him in burps, the holes in him fountaining, then dribbling), tongue out, eyes rolled up, the ray-gun arm
 * twitching, the tie still on. The flies find him.
 */
export const drawAlienCorpse = (ctx: Ctx, x: number, floor: number, facing: 1 | -1, age: number, frame: number) => {
  const pool = Math.min(1, age / 140);
  // The lake of slime
  ctx.fillStyle = ALIEN.slimeDark; ctx.beginPath(); ctx.ellipse(x, floor - 2, 60 + pool * 90, 6 + pool * 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = ALIEN.slime; ctx.beginPath(); ctx.ellipse(x - 6, floor - 3, 44 + pool * 76, 4 + pool * 3, 0, 0, Math.PI * 2); ctx.fill();
  for (let k = 0; k < 7; k++) { const bx = x - 70 + k * 24 + Math.sin(k * 3.1) * 8; ctx.fillStyle = ALIEN.slimeLight; ctx.fillRect(Math.round(bx), Math.round(floor - 4), 6, 2); }
  // Him, flat on his back, going down like a lilo
  const L: Look = { f: 1, t: Math.min(age, 40), arm: 'down', aim: 0, open: true, stunned: true, slowed: false, grounded: false, washed: false, plead: false, flash: 0, gore: 1, tased: false };
  const c = paint(L);
  if (c) {
    const deflate = 1 - Math.min(0.45, age / 260) + (age < 200 && frame % 40 < 4 ? 0.04 : 0);
    ctx.save();
    ctx.translate(x + facing * 70, floor - 8);
    ctx.scale(facing, deflate);
    ctx.rotate(-Math.PI / 2);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(c, -CX * ART_SCALE, -BASE * ART_SCALE, AW * ART_SCALE, AH * ART_SCALE);
    ctx.restore();
  }
  // The holes in him fountaining (then dribbling)
  const spurt = Math.max(0, 1 - age / 120);
  for (let k = 0; k < 5; k++) {
    const hx = x - 40 + k * 22, h = (10 + ((frame * 0.7 + k * 9) % 18)) * spurt;
    if (h > 1) { ctx.fillStyle = k % 2 ? ALIEN.slime : ALIEN.slimeLight; ctx.fillRect(Math.round(hx), Math.round(floor - 30 - h), 3, Math.round(h)); }
  }
  // (and the burps of gas going out of him)
  if (age < 220 && frame % 50 < 12) pixelBlob(ctx, x - facing * 40, floor - 44 - (frame % 50), 6, 5, 'rgba(190, 242, 100, 0.45)');
  // The flies, once he's been there a while
  if (age > 150) for (let k = 0; k < 4; k++) { const a = frame * 0.12 + k * 1.7; ctx.fillStyle = '#111'; ctx.fillRect(Math.round(x + Math.cos(a) * (30 + k * 6)), Math.round(floor - 50 + Math.sin(a * 1.3) * 12), 2, 2); }
};
