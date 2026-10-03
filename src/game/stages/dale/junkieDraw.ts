// Chuco and his office, drawn. Him: wiry, shaved head, goatee, a mouthful of
// gold, bloodshot eyes out on stalks, a white tank top under gold chains, baggy
// khakis, a gold-plated pistol in his waistband. His poses (twitching after you,
// reaching for your collar, the gold pistol, face down in a pile of crystal, out of
// his mind, head down flat out at the wall, seeing stars). His office: wood
// paneling, the window out onto the yard, his desk, the filing cabinet, the
// ceiling fan, the coat closet with the snitch in it, and what they all end up
// as. His health bar, and what's left of him.

import type { Enemy, WeaponType } from '../../../types';
import type { GameState } from '../../core/state';
import { drawFire } from '../../render/fx/fire';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { KIND_STATS } from '../../enemies/kinds';
import { COURSE } from './course';
import { JunkieFight, JunkieCorpse, JUNKIE_HP, PROPS, PropName, propBox, BUTT_QUICK, BUTT_BIG } from './junkie';
import type { DaleRuntime } from './runtime';
import { saying, drawBubble } from './script';
import { bandedGradient, checker, hazeBands, tilePattern } from '../../render/pixelArt';
import { INK as INK_LINE, dark, lite, ink, shaded } from '../../render/npc/kit';
import { slab, column, pipe } from '../../render/bosses/daleTruck';
import { drawBloodPool, drawSpatter } from '../../render/spatter';

type Ctx = CanvasRenderingContext2D;
const W = KIND_STATS.junkie.w, H = KIND_STATS.junkie.h;
const SKIN = '#C08457', SKIN_DARK = '#9A6440', TANK = '#F5F5F4', PANTS = '#A89F80', SHOE = '#1C1917', GOLD = '#FACC15', INK = '#1E3A8A';

// ---------------------------------------------------------------------------
// Him
// ---------------------------------------------------------------------------

export const drawJunkie = (ctx: Ctx, e: Enemy, fight: JunkieFight, state: GameState) => {
  const f = state.frame;
  const st = e.aiState || 'stalk', t = e.aiTimer || 0;
  ctx.save();
  // (twitching all over, always; much worse out of his mind)
  const jit = st === 'high' ? 4 : st === 'rampage' || st === 'butt' ? 1 : 0.8;
  ctx.translate(e.pos.x + W / 2 + (Math.random() - 0.5) * jit, e.pos.y + H + (Math.random() - 0.5) * jit * 0.5);
  ctx.scale(e.facing === 1 ? 1 : -1, 1);
  if ((e.hitFlash || 0) > 0) ctx.filter = 'brightness(1.8)';
  if (st === 'high' || st === 'rampage' || st === 'butt') ctx.filter = `hue-rotate(${(f * 12) % 360}deg) saturate(1.6)`;
  switch (st) {
    case 'snorting': poseBent(ctx, f, 0.7); break;
    case 'snort': poseBent(ctx, f, 1.2); break;
    case 'rampage': poseRampage(ctx, f); break;
    case 'butt': poseButt(ctx, f, t); break;
    case 'reach': case 'lunge': poseReach(ctx, f, st === 'lunge'); break;
    case 'grab': poseGrab(ctx, f, fight.grab ? fight.grab.t : 0); break;
    case 'aim': case 'shoot': poseGun(ctx, f, st === 'shoot' && t % 18 < 4); break;
    case 'high': poseHigh(ctx, f); break;
    case 'dazed': poseDazed(ctx, f); break;
    case 'to-stash': poseStand(ctx, f, 'run'); break;
    case 'notice': poseStand(ctx, f, 'twitch'); break;
    default: poseStand(ctx, f, Math.abs(e.vel.x) > 0.3 ? 'walk' : 'twitch');
  }
  ctx.restore();
  // Seeing the stash: a big !? over his head
  if (st === 'notice') {
    ctx.save(); ctx.font = 'bold 26px "Press Start 2P"'; ctx.textAlign = 'center';
    const bob = Math.sin(f * 0.4) * 3;
    ctx.fillStyle = '#000'; ctx.fillText('!?', e.pos.x + W / 2 + 2, e.pos.y - 24 + bob); ctx.fillStyle = '#38BDF8'; ctx.fillText('!?', e.pos.x + W / 2, e.pos.y - 26 + bob);
    ctx.restore();
  }
  // The tell: reaching for you
  if (st === 'reach' && Math.floor(f / 4) % 2 === 0) {
    ctx.save(); ctx.font = 'bold 30px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillStyle = '#000'; ctx.fillText('!', e.pos.x + W / 2 + 2, e.pos.y - 18); ctx.fillStyle = '#F87171'; ctx.fillText('!', e.pos.x + W / 2, e.pos.y - 20);
    ctx.restore();
  }
  if (st === 'aim') {
    // A glint off the gold, and where it's pointed
    const p = state.player;
    ctx.save(); ctx.strokeStyle = `rgba(250, 204, 21, ${0.2 + (t / 36) * 0.5})`; ctx.setLineDash([6, 6]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(e.pos.x + W / 2 + (e.facing === 1 ? 34 : -34), e.pos.y + 34); ctx.lineTo(p.pos.x + p.width / 2, p.pos.y + p.height / 2); ctx.stroke(); ctx.restore();
  }
};

const legs = (ctx: Ctx, f: number, stride: number, crouch = 0) => {
  const s = Math.sin(f * 0.3) * stride;
  // Baggy khakis (lit down the front, the crease, the bunching at the knee), sneakers with white soles
  for (const lx of [-12 + s, 2 - s]) {
    shaded(ctx, () => ctx.rect(lx, -40 + crouch, 11, 34 - crouch), PANTS, lx, -40 + crouch, 11, 34 - crouch);
    ctx.fillStyle = '#8A8264'; ctx.fillRect(lx, -20, 11, 3); ctx.fillStyle = '#C7BF9E'; ctx.fillRect(lx + 1, -21, 9, 1);
  }
  for (const sx of [-14 + s, 1 - s]) {
    ink(ctx, () => ctx.roundRect(sx, -6, 14, 6, [3, 3, 1, 1]), SHOE);
    ctx.fillStyle = '#44403C'; ctx.fillRect(sx + 2, -5, 4, 1);
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(sx + 0.5, -2, 13, 1.5);
  }
};

/** From the waist up, (0, y) his waist, leaning `lean`, his face doing `face`. */
const torso = (ctx: Ctx, y: number, lean: number, f: number, face: 'crazy' | 'roar' | 'snort' | 'dazed' | 'grin') => {
  ctx.save(); ctx.translate(0, y); ctx.rotate(lean);
  // Wiry: a white tank top (ribs showing through it), the gold pistol in his waistband
  shaded(ctx, () => ctx.rect(-14, -40, 28, 40), SKIN, -14, -40, 28, 40);
  const tank = () => { ctx.moveTo(-12, 0); ctx.lineTo(-11, -34); ctx.lineTo(-5, -40); ctx.lineTo(5, -40); ctx.lineTo(11, -34); ctx.lineTo(12, 0); ctx.closePath(); };
  shaded(ctx, tank, TANK, -12, -40, 24, 40);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 3; i++) ctx.fillRect(-8, -26 + i * 6, 16, 1);
  ctx.fillStyle = 'rgba(160, 120, 60, 0.18)'; ctx.fillRect(-6, -10, 5, 4); // (a stain)
  ink(ctx, () => ctx.rect(-9, 2, 7, 5), GOLD, 0.8); ctx.fillStyle = '#FEF08A'; ctx.fillRect(-8, 3, 3, 1);
  ink(ctx, () => ctx.rect(-4, 2, 2, 8), '#A16207', 0.6);
  // Chains (inked, a glint on each)
  for (const [cy, r, w, a] of [[-38, 9, 2, 0.3], [-36, 13, 1.5, 0.4]]) {
    ctx.strokeStyle = INK_LINE; ctx.lineWidth = w + 1.2; ctx.beginPath(); ctx.arc(0, cy, r, a, Math.PI - a); ctx.stroke();
    ctx.strokeStyle = GOLD; ctx.lineWidth = w; ctx.stroke();
  }
  ink(ctx, () => ctx.rect(-2, -26, 5, 6), GOLD, 0.8); ctx.fillStyle = '#FEF9C3'; ctx.fillRect(-1, -25, 1, 2);
  // Neck tattoo
  ctx.fillStyle = INK; ctx.fillRect(-4, -46, 8, 3);
  head(ctx, 0, -52, f, face);
  ctx.restore();
};

/** His head at (x, y) (its middle): shaved, goatee, gold teeth, the eyes. */
const head = (ctx: Ctx, x: number, y: number, f: number, face: 'crazy' | 'roar' | 'snort' | 'dazed' | 'grin') => {
  ink(ctx, () => ctx.rect(x - 3, y + 6, 8, 6), SKIN, 1);
  shaded(ctx, () => ctx.ellipse(x + 1, y, 10, 11, 0, 0, Math.PI * 2), SKIN, x - 9, y - 11, 20, 22);
  ctx.fillStyle = 'rgba(40, 30, 20, 0.35)'; ctx.beginPath(); ctx.ellipse(x, y - 4, 10, 7, 0, Math.PI, 0); ctx.fill(); // the stubble on his scalp
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(x - 4, y - 9, 6, 2);
  ctx.fillStyle = SKIN_DARK; ctx.fillRect(x - 8, y - 1, 3, 4); // (his ear)
  // Eyes: wide, bloodshot, darting
  const dart = Math.sin(f * 0.9) > 0.6 ? 1 : 0;
  const big = face === 'crazy' || face === 'roar' ? 1 : 0;
  ctx.fillStyle = '#FEF2F2'; ctx.beginPath(); ctx.arc(x + 5, y - 2, 2.5 + big, 0, Math.PI * 2); ctx.arc(x - 1, y - 2, 2 + big, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = INK_LINE; ctx.lineWidth = 0.6; ctx.stroke();
  if (face === 'dazed') { ctx.strokeStyle = '#111827'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 3, y - 4); ctx.lineTo(x + 7, y); ctx.moveTo(x + 7, y - 4); ctx.lineTo(x + 3, y); ctx.stroke(); }
  else { ctx.fillStyle = '#111827'; ctx.fillRect(x + 5 + dart, y - 3, 1.5, 2); ctx.fillRect(x - 1 + dart, y - 3, 1.5, 2); }
  ctx.fillStyle = '#DC2626'; ctx.fillRect(x + 3, y - 1, 1, 1); ctx.fillRect(x + 7, y - 3, 1, 1);
  // Mustache and goatee
  ctx.fillStyle = '#1C1917'; ctx.fillRect(x + 2, y + 3, 9, 2); ctx.fillRect(x + 4, y + 8, 5, 4);
  // The mouth: a gold grill, open (always talking)
  if (face === 'roar' || face === 'crazy') { ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x + 3, y + 5, 7, 4); ctx.fillStyle = GOLD; ctx.fillRect(x + 3, y + 5, 7, 1.5); }
  else if (face === 'snort') { ctx.fillStyle = '#E0F2FE'; ctx.fillRect(x + 8, y + 1, 3, 2); }
  else { ctx.fillStyle = GOLD; ctx.fillRect(x + 3, y + 5, 7, 2); ctx.fillStyle = '#A16207'; ctx.fillRect(x + 5, y + 5, 1, 2); }
  if (face === 'crazy' && f % 30 < 10) { ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(x + 12, y + 8, 1.5, 0, Math.PI * 2); ctx.fill(); } // spit
};

/** An arm from the shoulder (x, y) along `angle`, with a fist (and his tattoos). */
const arm = (ctx: Ctx, x: number, y: number, angle: number, len = 26, back = false) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
  const c = back ? SKIN_DARK : SKIN;
  ink(ctx, () => ctx.roundRect(0, -3.5, len, 7, 3), c, 1);
  ctx.fillStyle = back ? dark(c, 0.2) : lite(c, 0.2); ctx.fillRect(2, -2.5, len - 4, 2);
  if (!back) { ctx.fillStyle = INK; ctx.fillRect(4, -3, 7, 2); ctx.fillRect(12, 0, 5, 2); }
  ink(ctx, () => ctx.arc(len, 0, 5, 0, Math.PI * 2), back ? '#7A4A2C' : '#A36F48', 1);
  ctx.fillStyle = back ? '#8E5A38' : '#C08A60'; ctx.fillRect(len - 3, -3, 3, 2);
  ink(ctx, () => ctx.rect(len - 3, -5, 3, 2), GOLD, 0.5); // rings
  ctx.restore();
};

const poseStand = (ctx: Ctx, f: number, mode: 'walk' | 'twitch' | 'run') => {
  const run = mode === 'run';
  legs(ctx, f * (run ? 2 : 1), mode === 'twitch' ? 0 : run ? 9 : 4);
  const lean = run ? 0.35 : Math.sin(f * 0.25) * 0.06;
  const jerk = mode === 'twitch' && f % 40 < 4 ? 0.2 : 0;
  arm(ctx, -10, -78, Math.PI * 0.55 + Math.sin(f * 0.3) * 0.2, 24, true);
  torso(ctx, -40, lean + jerk, f, run ? 'crazy' : 'grin');
  ctx.save(); ctx.translate(0, -40); ctx.rotate(lean);
  arm(ctx, 10, -36, run ? 0.3 + Math.sin(f * 0.5) * 0.6 : 0.8 + Math.sin(f * 0.2) * 0.3, 24);
  ctx.restore();
};

const poseBent = (ctx: Ctx, f: number, lean: number) => {
  legs(ctx, f, 0, 6);
  arm(ctx, -8, -70, Math.PI * 0.35, 24, true);
  torso(ctx, -36, lean, f, 'snort');
  ctx.save(); ctx.translate(0, -36); ctx.rotate(lean); arm(ctx, 10, -34, 1.2, 22); ctx.restore();
  // Sniffing: a little cloud of it at his nose
  if (f % 16 < 8) { ctx.fillStyle = 'rgba(245, 245, 244, 0.7)'; ctx.beginPath(); ctx.arc(34, -30 + lean * 10, 3 + (f % 8) * 0.4, 0, Math.PI * 2); ctx.fill(); }
};

const poseReach = (ctx: Ctx, f: number, lunging: boolean) => {
  legs(ctx, f, lunging ? 6 : 0, lunging ? 0 : 4);
  const lean = lunging ? 0.4 : 0.15;
  arm(ctx, -8, -78, 0.2, 30, true);
  torso(ctx, -40, lean, f, 'roar');
  ctx.save(); ctx.translate(0, -40); ctx.rotate(lean); arm(ctx, 10, -36, 0.05, 32); ctx.restore();
};

const poseGrab = (ctx: Ctx, f: number, t: number) => {
  legs(ctx, f, 0, 2);
  // One hand holding the collar out front, the other winding up and punching (on the beat)
  const beat = t % 26, punch = beat > 18 ? (26 - beat) / 8 : beat < 4 ? beat / 4 : 0;
  torso(ctx, -40, 0.1, f, 'roar');
  ctx.save(); ctx.translate(0, -40); ctx.rotate(0.1);
  arm(ctx, 10, -34, -0.1, 26);
  arm(ctx, -6, -36, -0.4 - (1 - punch) * 1.4, 22 + punch * 12, true);
  ctx.restore();
};

const poseGun = (ctx: Ctx, f: number, flash: boolean) => {
  legs(ctx, f, 0);
  arm(ctx, -10, -78, Math.PI * 0.55, 24, true);
  torso(ctx, -40, -0.05, f, 'crazy');
  // The gold pistol, held sideways, arm straight out
  ctx.save(); ctx.translate(0, -40); ctx.rotate(-0.05);
  arm(ctx, 10, -34, -0.05, 26);
  ctx.save(); ctx.translate(36, -36); ctx.rotate(-Math.PI / 2 * 0.9);
  ink(ctx, () => ctx.rect(-2, 3, 6, 8), '#CA8A04', 0.8);
  ink(ctx, () => ctx.rect(-2, -2, 16, 6), GOLD, 0.8); ctx.fillStyle = '#FEF9C3'; ctx.fillRect(0, -1, 10, 1); ctx.fillStyle = '#A16207'; ctx.fillRect(-1, 2, 14, 1);
  if (flash) { ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(20, 1, 6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#FDE047'; ctx.beginPath(); ctx.arc(22, 1, 4, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  ctx.restore();
};

const poseHigh = (ctx: Ctx, f: number) => {
  legs(ctx, f * 3, 3);
  // Arms flung up, head back, howling
  torso(ctx, -40, -0.25 + Math.sin(f * 1.3) * 0.1, f, 'roar');
  arm(ctx, -8, -80, -2.2 + Math.sin(f * 1.1) * 0.3, 26, true);
  arm(ctx, 10, -80, -1.0 + Math.sin(f * 1.4) * 0.3, 26);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#7DD3FC' : '#F0ABFC'; ctx.beginPath(); ctx.arc(Math.cos(f * 0.3 + i) * 26, -104 + Math.sin(f * 0.3 + i) * 8, 3, 0, Math.PI * 2); ctx.fill(); }
};

const poseRampage = (ctx: Ctx, f: number) => {
  legs(ctx, f * 2.5, 11);
  // Head down, flat out, arms pumping
  torso(ctx, -36, 0.95, f, 'roar');
  ctx.save(); ctx.translate(0, -36); ctx.rotate(0.95); arm(ctx, 10, -30, 1.6 + Math.sin(f * 0.8) * 0.6, 22); ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-30 - i * 8, -70 + i * 14); ctx.lineTo(-60 - i * 8, -70 + i * 14); ctx.stroke(); }
};

/** Up against the wall: rearing back and slamming his head into it, twice quick, then once more after a long rear back. */
const poseButt = (ctx: Ctx, f: number, t: number) => {
  let lean: number;
  if (t < BUTT_QUICK * 2) {
    const k = (t % BUTT_QUICK) / BUTT_QUICK;
    lean = k < 0.65 ? 0.6 - k * 1.3 : -0.25 + (k - 0.65) / 0.35 * 1.25;
  } else {
    const k = Math.min(1, (t - BUTT_QUICK * 2) / BUTT_BIG);
    lean = k < 0.85 ? 0.3 - k * 1.1 : -0.64 + (k - 0.85) / 0.15 * 1.7;
  }
  legs(ctx, f, 0, 4);
  arm(ctx, -8, -78, Math.PI * 0.4 - lean, 24, true);
  torso(ctx, -40, lean, f, 'roar');
  ctx.save(); ctx.translate(0, -40); ctx.rotate(lean); arm(ctx, 10, -34, 0.6, 24); ctx.restore();
  if (t < BUTT_QUICK * 2 && t % BUTT_QUICK < 3) { ctx.fillStyle = '#FDE047'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.fillText('*', 34, -96); }
};

const poseDazed = (ctx: Ctx, f: number) => {
  legs(ctx, f, 1, 6);
  const wob = Math.sin(f * 0.15) * 0.25;
  arm(ctx, -8, -76, Math.PI * 0.6, 24, true);
  torso(ctx, -38, wob, f, 'dazed');
  ctx.save(); ctx.translate(0, -38); ctx.rotate(wob); arm(ctx, 10, -34, 1.3, 22);
  // A lump on his head
  ctx.fillStyle = '#E11D48'; ctx.beginPath(); ctx.arc(8, -64, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  for (let i = 0; i < 3; i++) { const a = f * 0.18 + (i * Math.PI * 2) / 3; ctx.fillStyle = '#FDE047'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.fillText('*', -6 + Math.cos(a) * 18, -108 + Math.sin(a) * 5); }
};

// ---------------------------------------------------------------------------
// His office
// ---------------------------------------------------------------------------

export const drawOffice = (ctx: Ctx, state: GameState, fight: JunkieFight) => {
  const o = COURSE.office;
  const f = state.frame;
  const floor = o.floor, ceil = o.ceiling;
  // Wood paneling (each board lit down its left edge, its grain, the groove between), a baseboard, the drop ceiling
  ctx.fillStyle = '#5B3A1E'; ctx.fillRect(o.x1 - 40, ceil - 30, o.x2 - o.x1 + 100, floor - ceil + 30);
  ctx.save(); ctx.translate(o.x1, ceil);
  ctx.fillStyle = tilePattern(ctx, 'dalePanel', 38, 60, g => {
    g.fillStyle = '#5B3A1E'; g.fillRect(0, 0, 38, 60);
    g.fillStyle = '#6B4626'; g.fillRect(3, 0, 6, 60);
    g.fillStyle = '#4E3118'; g.fillRect(28, 0, 7, 60);
    g.fillStyle = '#4A2F18'; for (const [a, b, h] of [[12, 4, 14], [20, 22, 18], [16, 44, 12], [31, 10, 9]]) g.fillRect(a, b, 1, h);
    g.fillStyle = '#7A5230'; g.fillRect(3, 0, 1, 60);
    g.fillStyle = '#2E1B0C'; g.fillRect(0, 0, 3, 60);
  });
  ctx.fillRect(-40, 0, o.x2 - o.x1 + 100, floor - ceil);
  ctx.restore();
  hazeBands(ctx, o.x1 - 40, ceil, o.x2 - o.x1 + 100, 50, '#1C1008', 0.35, 0, 4);
  slab(ctx, o.x1 - 40, floor - 14, o.x2 - o.x1 + 100, 14, '#3B2612', 2);
  // (the ceiling: speckled tiles in their grid, darker toward the back)
  bandedGradient(ctx, o.x1 - 40, ceil - 30, o.x2 - o.x1 + 100, 30, ['#B8B3AE', '#C9C5C1', '#D6D3D1'], 3);
  ctx.fillStyle = tilePattern(ctx, 'daleOfficeCeil', 14, 10, g => { g.fillStyle = '#A8A29E'; for (const [a, b] of [[1, 2], [6, 1], [10, 6], [3, 7], [12, 3], [8, 8]]) g.fillRect(a, b, 1, 1); });
  ctx.fillRect(o.x1 - 40, ceil - 30, o.x2 - o.x1 + 100, 30);
  for (let x = o.x1 - 40; x < o.x2 + 60; x += 60) { ctx.fillStyle = '#8A847F'; ctx.fillRect(x, ceil - 30, 2, 30); ctx.fillStyle = '#F5F5F4'; ctx.fillRect(x + 2, ceil - 30, 1, 30); }
  ctx.fillStyle = INK_LINE; ctx.fillRect(o.x1 - 40, ceil - 1, o.x2 - o.x1 + 100, 1);
  // Out the window (right wall): the yard, the dusk, the trucks being loaded
  const wx = o.x2 - 150, wy = floor - 230;
  bandedGradient(ctx, wx, wy, 130, 130, ['#5C2A6E', '#8A3C6E', '#C0546C', '#E0666A', '#EE8A62', '#F4A261'], 8);
  ctx.fillStyle = '#3A1D2C'; ctx.fillRect(wx, wy + 100, 130, 30);
  ctx.fillStyle = '#4E2838'; ctx.fillRect(wx, wy + 100, 130, 2);
  if (fight.phase === 'dead' || fight.phase === 'leaving') { const vx = wx + 20 + ((f * 0.5) % 60); slab(ctx, vx, wy + 96, 50, 16, '#E5E7EB', 1); ctx.fillStyle = '#6D28D9'; ctx.fillRect(vx + 2, wy + 102, 46, 4); ink(ctx, () => ctx.arc(vx + 12, wy + 112, 4, 0, Math.PI * 2), '#111', 0.8); }
  const broke = fight.leaveT >= 10000;
  if (!broke) {
    for (let y = wy + 4; y < wy + 60; y += 7) { ctx.fillStyle = 'rgba(214, 211, 209, 0.95)'; ctx.fillRect(wx, y, 130, 4); ctx.fillStyle = 'rgba(245, 245, 244, 0.95)'; ctx.fillRect(wx, y, 130, 1); ctx.fillStyle = 'rgba(120, 113, 108, 0.9)'; ctx.fillRect(wx, y + 3, 130, 1); } // blinds, half up
    ctx.fillStyle = '#E7E5E4'; ctx.fillRect(wx + 30, wy + 4, 1, 58); ctx.fillRect(wx + 100, wy + 4, 1, 58); // (their cords)
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.moveTo(wx + 14, wy + 124); ctx.lineTo(wx + 34, wy + 64); ctx.lineTo(wx + 44, wy + 64); ctx.lineTo(wx + 24, wy + 124); ctx.fill();
  } else { for (let i = 0; i < 6; i++) ink(ctx, () => { const sx = wx + (i * 23) % 120, sy = wy + 120 - (i * 17) % 40; ctx.moveTo(sx, sy + 10); ctx.lineTo(sx + 4, sy); ctx.lineTo(sx + 8, sy + 10); ctx.closePath(); }, 'rgba(224,242,254,0.7)', 0.6); }
  // (the frame: white paint, lit top and left, shadowed right and under; the mullion)
  ctx.strokeStyle = INK_LINE; ctx.lineWidth = 8; ctx.strokeRect(wx, wy, 130, 130);
  ctx.strokeStyle = '#E7E5E4'; ctx.lineWidth = 6; ctx.strokeRect(wx, wy, 130, 130);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(wx - 3, wy - 3, 136, 1); ctx.fillRect(wx - 3, wy - 3, 1, 136);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(wx + 132, wy - 2, 1, 135); ctx.fillRect(wx - 2, wy + 132, 135, 1);
  column(ctx, wx + 63, wy + 2, 4, 126, '#E7E5E4');
  slab(ctx, wx - 8, wy + 131, 146, 6, '#D6D3D1', 1); // (the sill)
  // Framed on the walls: Dale (purple suit, shades, the mustache), and a velvet tiger
  slab(ctx, o.x1 + 40, floor - 250, 60, 76, '#CA8A04', 3);
  bandedGradient(ctx, o.x1 + 46, floor - 244, 48, 64, ['#7C3AED', '#6D28D9', '#4C1D95'], 4);
  ctx.strokeStyle = INK_LINE; ctx.lineWidth = 1; ctx.strokeRect(o.x1 + 45.5, floor - 244.5, 49, 65);
  ink(ctx, () => ctx.roundRect(o.x1 + 52, floor - 208, 36, 28, [10, 10, 0, 0]), '#5B21B6', 1);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(o.x1 + 66, floor - 208, 8, 10);
  ink(ctx, () => ctx.arc(o.x1 + 70, floor - 222, 11, 0, Math.PI * 2), '#F5CBA7', 1);
  ctx.fillStyle = '#DDA982'; ctx.fillRect(o.x1 + 74, floor - 228, 5, 12);
  ctx.fillStyle = '#111'; ctx.fillRect(o.x1 + 60, floor - 236, 20, 6); ctx.fillRect(o.x1 + 62, floor - 225, 16, 3);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(o.x1 + 63, floor - 225, 4, 1);
  ctx.fillStyle = '#44403C'; ctx.fillRect(o.x1 + 64, floor - 218, 12, 2);
  ctx.fillStyle = '#FDE047'; ctx.font = '4px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('BOSS', o.x1 + 70, floor - 186);
  slab(ctx, o.x1 + 297, floor - 263, 96, 66, '#CA8A04', 3);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(o.x1 + 300, floor - 260, 90, 60);
  ink(ctx, () => ctx.ellipse(o.x1 + 345, floor - 230, 26, 16, 0, 0, Math.PI * 2), '#EA580C', 1);
  ctx.fillStyle = '#FDBA74'; ctx.beginPath(); ctx.ellipse(o.x1 + 340, floor - 236, 16, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111827'; for (let i = 0; i < 5; i++) ctx.fillRect(o.x1 + 324 + i * 9, floor - 240, 3, 20);
  ctx.fillStyle = '#FDE047'; ctx.fillRect(o.x1 + 331, floor - 236, 2, 2); ctx.fillRect(o.x1 + 357, floor - 236, 2, 2); // (its eyes)
  ctx.textAlign = 'left';
  // The door you came in by
  const doorShut = fight.phase === 'intro' || fight.phase === 'fight';
  slab(ctx, o.x1 - 40, floor - 170, 40, 170, '#3B2612', 2);
  if (!doorShut) { ctx.fillStyle = '#1C1917'; ctx.fillRect(o.x1 - 30, floor - 160, 30, 160); ctx.fillStyle = '#0C0A09'; ctx.fillRect(o.x1 - 30, floor - 160, 30, 20); }
  else {
    slab(ctx, o.x1 - 34, floor - 164, 34, 164, '#78350F', 2);
    for (const py of [floor - 154, floor - 74]) { ctx.strokeStyle = '#5A2A0A'; ctx.lineWidth = 1; ctx.strokeRect(o.x1 - 28.5, py + 0.5, 22, 60); ctx.fillStyle = '#9A5A26'; ctx.fillRect(o.x1 - 28, py + 1, 21, 1); }
    ink(ctx, () => ctx.arc(o.x1 - 6, floor - 88, 3, 0, Math.PI * 2), GOLD, 0.8);
  }
  // The right-hand wall, end on: the office's outside wall, studs and siding in section, down past the floor to the
  // warehouse wall under it (so the room ends there, and the view doesn't run off into nothing)
  const rw = o.x2, bottom = state.camera.y + CANVAS_HEIGHT + 40;
  ctx.fillStyle = '#44403C'; ctx.fillRect(rw, ceil - 30, 80, bottom - (ceil - 30));
  for (let y = floor + 20; y < bottom; y += 26) { ctx.fillStyle = '#57534E'; ctx.fillRect(rw + 4, y, 72, 3); ctx.fillStyle = '#292524'; ctx.fillRect(rw + 4, y + 3, 72, 1); for (let x = rw + 4 + ((y / 26) % 2) * 18; x < rw + 76; x += 36) ctx.fillRect(x, y - 23, 1, 23); } // block courses under the floor
  column(ctx, rw, ceil - 30, 14, floor - ceil + 44, '#3B2612'); // the end of the paneling, trim
  ctx.fillStyle = '#78350F'; ctx.fillRect(rw + 2, ceil - 30, 4, floor - ceil + 44);
  ctx.fillStyle = '#292524'; ctx.fillRect(rw + 14, ceil - 30, 66, floor - ceil + 44);
  for (let x = rw + 22; x < rw + 80; x += 18) { ctx.fillStyle = '#1C1917'; ctx.fillRect(x, ceil - 30, 6, floor - ceil + 44); ctx.fillStyle = '#3A3330'; ctx.fillRect(x, ceil - 30, 1, floor - ceil + 44); } // studs
  slab(ctx, rw, ceil - 34, 80, 6, '#D6D3D1', 1); slab(ctx, rw, floor + 8, 80, 6, '#D6D3D1', 1); // top and bottom plates
  // Cracks where he's put his head into the walls (the plaster dented in, splits running out, blood in the middle)
  for (const c of fight.cracks) {
    const x = c.side > 0 ? o.x2 : o.x1;
    ctx.fillStyle = 'rgba(28, 16, 8, 0.5)'; ctx.beginPath(); ctx.arc(x - c.side * 4, c.y, 12, 0, Math.PI * 2); ctx.fill();
    for (const [col, w] of [[INK_LINE, 2], ['#7A5230', 1]] as const) {
      ctx.strokeStyle = col; ctx.lineWidth = w;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; ctx.moveTo(x, c.y); ctx.lineTo(x - c.side * Math.abs(Math.cos(a)) * 30, c.y + Math.sin(a) * 30); }
      ctx.stroke();
    }
    drawSpatter(ctx, { x: x - c.side * 4, y: c.y, size: 6, seed: Math.round(c.y), dx: -c.side * 0.5, color: '#7F1D1D' });
  }
  // His side table by the window (where he's at when you come in), a pile of it on the glass
  const tx = o.x2 - 60;
  column(ctx, tx - 26, floor - 36, 4, 36, '#CA8A04'); column(ctx, tx + 22, floor - 36, 4, 36, '#CA8A04');
  ink(ctx, () => ctx.rect(tx - 30, floor - 40, 60, 5), 'rgba(186, 230, 253, 0.8)', 1);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; ctx.fillRect(tx - 28, floor - 39, 20, 1);
  if (fight.phase === 'waiting' || fight.phase === 'intro') { ink(ctx, () => { ctx.moveTo(tx - 12, floor - 40); ctx.lineTo(tx - 2, floor - 47); ctx.lineTo(tx + 8, floor - 40); ctx.closePath(); }, '#E7E5E4', 0.8); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(tx - 5, floor - 45, 2, 2); }
  // His things (and how much they've got left in them, while there's a fight on)
  for (const n of PROPS) drawProp(ctx, state, fight, n);
  if (fight.phase === 'fight') for (const n of PROPS) propBar(ctx, fight, n, f);
  // The stash, out in the open
  for (const s of fight.stashes) if (!s.taken) drawStash(ctx, s.x, s.y, f);
};

/** Over one of his things: a little bar of what it's got left in it, in the colour of what gets at it. */
const PROP_COLORS: Record<PropName, string> = { desk: '#F97316', cabinet: '#38BDF8', fan: '#A8A29E', closet: '#A5F3FC' };
const propBar = (ctx: Ctx, fight: JunkieFight, n: PropName, f: number) => {
  const pr = fight.props[n];
  if (pr.state !== 'intact') return;
  const box = propBox(fight, n);
  const w = 56, x = box.x + box.w / 2 - w / 2, y = n === 'fan' ? box.y + box.h + 8 : box.y - 14;
  const flash = f - pr.hitAt < 6;
  ctx.fillStyle = '#0C0A09'; ctx.fillRect(x - 2, y - 2, w + 4, 8);
  ctx.fillStyle = '#44403C'; ctx.fillRect(x, y, w, 4);
  ctx.fillStyle = flash ? '#FFFFFF' : PROP_COLORS[n]; ctx.fillRect(x, y, w * pr.hp, 4);
};

/** A baggie of it: plain crystal meth, glassy white shards, glittering. */
const drawStash = (ctx: Ctx, x: number, y: number, f: number) => {
  ink(ctx, () => ctx.roundRect(x - 10, y - 10, 20, 14, 3), 'rgba(245, 245, 244, 0.85)', 1);
  ctx.fillStyle = '#D6D3D1'; ctx.fillRect(x - 7, y - 5, 14, 8);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(x - 7, y + 1, 14, 2);
  ctx.fillStyle = '#FFFFFF'; for (let i = 0; i < 4; i++) ctx.fillRect(x - 6 + i * 4, y - 4 + (i % 2) * 3, 2, 2);
  ink(ctx, () => ctx.rect(x - 10, y - 11, 20, 2), '#DC2626', 0.6);
  if (f % 20 < 10) { ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(x + 4 + (f % 3), y - 14, 2, 2); }
};

const drawProp = (ctx: Ctx, state: GameState, fight: JunkieFight, n: PropName) => {
  const o = COURSE.office;
  const pr = fight.props[n];
  const f = state.frame;
  const box = propBox(fight, n);
  switch (n) {
    case 'desk': {
      const burnt = pr.state === 'gone' || (pr.state === 'going' && pr.t > 60);
      const tint = pr.state === 'going' ? Math.min(1, pr.t / 70) : burnt ? 1 : 0;
      ctx.save();
      if (tint > 0) ctx.filter = `brightness(${1 - tint * 0.8}) sepia(${tint})`;
      if (!(pr.state === 'gone')) {
        // (a big executive desk: the top lit along its edge, the pedestals' drawers, gold pulls)
        ctx.fillStyle = '#3B2612'; ctx.fillRect(box.x + 44, box.y + 10, box.w - 88, box.h - 30); // (the modesty panel, in shadow)
        slab(ctx, box.x + 4, box.y + 10, 40, box.h - 10, '#5B3413', 2); slab(ctx, box.x + box.w - 44, box.y + 10, 40, box.h - 10, '#5B3413', 2);
        for (const dx of [box.x + 4, box.x + box.w - 44]) for (let dy = box.y + 26; dy < box.y + box.h - 6; dy += 14) { ctx.fillStyle = '#3B2612'; ctx.fillRect(dx + 3, dy, 34, 1); }
        for (const [gx, gy] of [[box.x + 20, box.y + 20], [box.x + 20, box.y + 34], [box.x + box.w - 28, box.y + 20]]) ink(ctx, () => ctx.rect(gx, gy, 8, 2), GOLD, 0.5);
        slab(ctx, box.x, box.y, box.w, 10, '#7C4A1E', 2);
        ctx.fillStyle = '#9A6434'; ctx.fillRect(box.x + 10, box.y + 4, box.w - 30, 1);
        // On top: a lamp, a pile of it, stacks of cash, a phone
        column(ctx, box.x + 14, box.y - 16, 3, 16, '#A16207');
        ink(ctx, () => { ctx.moveTo(box.x + 6, box.y - 16); ctx.lineTo(box.x + 9, box.y - 23); ctx.lineTo(box.x + 21, box.y - 23); ctx.lineTo(box.x + 24, box.y - 16); ctx.closePath(); }, '#15803D', 1);
        ctx.fillStyle = '#4ADE80'; ctx.fillRect(box.x + 10, box.y - 22, 6, 1);
        ink(ctx, () => { ctx.moveTo(box.x + 40, box.y); ctx.lineTo(box.x + 52, box.y - 8); ctx.lineTo(box.x + 64, box.y); ctx.closePath(); }, '#E7E5E4', 0.8);
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(box.x + 48, box.y - 5, 3, 2);
        slab(ctx, box.x + 74, box.y - 8, 16, 8, '#65A30D', 1); slab(ctx, box.x + 78, box.y - 14, 16, 6, '#65A30D', 1);
        ctx.fillStyle = '#ECFCCB'; ctx.fillRect(box.x + 80, box.y - 12, 3, 2); ctx.fillRect(box.x + 76, box.y - 6, 3, 3);
        slab(ctx, box.x + 96, box.y - 6, 12, 6, '#1C1917', 1); ctx.fillStyle = '#DC2626'; ctx.fillRect(box.x + 99, box.y - 4, 2, 1);
      } else {
        // A charred frame, still smoking
        for (const [cx, cy, cw, ch] of [[box.x + 4, box.y + 24, 10, box.h - 24], [box.x + box.w - 14, box.y + 30, 10, box.h - 30], [box.x + 2, box.y + 18, box.w - 20, 6]]) { slab(ctx, cx, cy, cw, ch, '#1C1917', 1); checker(ctx, cx + 1, cy + 1, cw - 2, Math.min(4, ch - 2), 'rgba(234, 88, 12, 0.5)'); }
      }
      ctx.restore();
      if (pr.state === 'going') drawFire(ctx, box.x + 54, box.y + 4, 100, 36, f, { seed: 9, smoke: 0.7 });
      if (pr.state === 'gone' && f % 6 === 0) state.particles.push({ pos: { x: box.x + Math.random() * box.w, y: box.y + 10 }, vel: { x: 0, y: -1 }, life: 30, color: '#57534E', size: 4 });
      break;
    }
    case 'cabinet': {
      const cx = pr.state === 'intact' ? o.cabinet : pr.x;
      const tip = pr.state === 'intact' ? 0 : Math.min(Math.PI / 2, pr.t * 0.05) * pr.dir;
      ctx.save(); ctx.translate(cx + (tip >= 0 ? 24 : -24), o.floor); ctx.rotate(tip); ctx.translate(tip >= 0 ? -24 : 24, 0);
      slab(ctx, -24, -104, 48, 104, '#6B7280', 2);
      const labels = ['TAXES', 'INVOICES', 'NOT DRUGS', 'DRUGS'];
      for (let i = 0; i < 4; i++) {
        slab(ctx, -20, -100 + i * 25, 40, 21, '#4B5563', 1);
        ink(ctx, () => ctx.rect(-8, -94 + i * 25, 16, 5), '#E5E7EB', 0.5);
        slab(ctx, -6, -86 + i * 25, 12, 3, '#9CA3AF', 1); // (the pull)
        ctx.fillStyle = '#111827'; ctx.font = '3px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText(labels[i], 0, -90 + i * 25);
      }
      ctx.restore(); ctx.textAlign = 'left';
      if (pr.state === 'going' && pr.t < 60) for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * 60, y: o.floor - Math.random() * 80 }, vel: { x: pr.dir * (2 + Math.random() * 3), y: -Math.random() * 3 }, life: 20, color: i % 2 ? '#D6D3D1' : '#FFFFFF', size: 3 + Math.random() * 4 });
      if (pr.state !== 'intact') { ctx.fillStyle = 'rgba(231, 229, 228, 0.35)'; ctx.beginPath(); ctx.ellipse(cx, o.floor - 2, 90, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#F8FAFC'; for (let i = 0; i < 5; i++) ctx.fillRect(cx - 60 + i * 26, o.floor - 4 - (i % 2) * 2, 12, 3); }
      break;
    }
    case 'fan': {
      const y = pr.state === 'intact' ? o.ceiling + 64 : pr.y;
      if (pr.state === 'intact' || (pr.state === 'going' && pr.y < o.floor - 10)) {
        // The rod down from the ceiling (snapped once it's falling)
        column(ctx, o.fan - 2, o.ceiling, 4, pr.state === 'intact' ? 54 : 14, '#A16207');
        const spin = pr.state === 'intact' ? f * 0.25 : f * 0.4;
        ctx.save(); ctx.translate(o.fan, y);
        for (let k = 0; k < 4; k++) { const w = 58 * Math.cos(spin + (k * Math.PI) / 2); if (Math.abs(w) < 1) continue; slab(ctx, Math.min(0, w), -2, Math.abs(w), 5, k % 2 ? '#92400E' : '#A16207', 1); }
        ink(ctx, () => ctx.ellipse(0, 0, 12, 7, 0, 0, Math.PI * 2), '#78350F', 1);
        ctx.fillStyle = '#A16207'; ctx.fillRect(-8, -4, 8, 2);
        // The package taped on top of it
        ink(ctx, () => ctx.rect(-7, -12, 14, 6), '#D6D3D1', 0.8); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-6, -11, 5, 1);
        ink(ctx, () => ctx.rect(-9, -10, 18, 2), '#9CA3AF', 0.5);
        ink(ctx, () => { ctx.arc(0, 8, 6, 0, Math.PI); ctx.closePath(); }, '#FEF9C3', 0.8);
        ctx.restore();
      } else {
        // In a heap on the floor
        ctx.save(); ctx.translate(o.fan, o.floor - 6); ctx.rotate(0.4); slab(ctx, 0, -2, 50, 5, '#A16207', 1); ctx.rotate(2.2); slab(ctx, 0, -2, 44, 5, '#92400E', 1); ctx.rotate(1.9); slab(ctx, 0, -2, 36, 5, '#A16207', 1); ctx.restore();
        ink(ctx, () => ctx.ellipse(o.fan, o.floor - 6, 12, 6, 0, 0, Math.PI * 2), '#78350F', 1);
        column(ctx, o.fan - 2, o.ceiling, 4, 14, '#A16207');
      }
      break;
    }
    case 'closet': {
      // The closet: its door open, the rod, and him on it
      const cx = o.closet;
      ctx.fillStyle = '#1C1917'; ctx.fillRect(cx - 40, o.floor - 190, 80, 190);
      ctx.fillStyle = '#0C0A09'; ctx.fillRect(cx - 40, o.floor - 190, 80, 16);
      ctx.strokeStyle = INK_LINE; ctx.lineWidth = 1; ctx.strokeRect(cx - 40.5, o.floor - 190.5, 81, 191);
      ctx.save(); ctx.translate(cx + 40, o.floor - 190); ctx.transform(1, 0.12, 0, 1, 0, 0); slab(ctx, 0, 0, 26, 190, '#78350F', 2); ctx.strokeStyle = '#5A2A0A'; ctx.strokeRect(5.5, 12.5, 15, 70); ctx.strokeRect(5.5, 100.5, 15, 76); ctx.restore();
      pipe(ctx, cx - 38, o.floor - 172, 76, 4, '#A8A29E');
      // A coat or two (on hangers)
      ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - 27, o.floor - 172); ctx.lineTo(cx - 27, o.floor - 168); ctx.moveTo(cx + 28, o.floor - 172); ctx.lineTo(cx + 28, o.floor - 168); ctx.stroke();
      shaded(ctx, () => ctx.roundRect(cx - 34, o.floor - 168, 14, 70, [4, 4, 1, 1]), '#3F3F46', cx - 34, o.floor - 168, 14, 70);
      shaded(ctx, () => ctx.roundRect(cx + 22, o.floor - 168, 12, 60, [4, 4, 1, 1]), '#7C2D12', cx + 22, o.floor - 168, 12, 60);
      if (pr.state === 'gone' || (pr.state === 'going' && pr.t > 26)) {
        // An empty noose, and what's left of him in a puddle of ice
        ctx.strokeStyle = '#D6B98C'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, o.floor - 170); ctx.lineTo(cx, o.floor - 150); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, o.floor - 146, 5, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(186, 230, 253, 0.6)'; ctx.beginPath(); ctx.ellipse(cx, o.floor - 3, 36, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#BAE6FD'; for (let i = 0; i < 7; i++) ctx.fillRect(cx - 30 + i * 9, o.floor - 6 - (i % 3) * 2, 5, 5);
        ctx.fillStyle = '#7F1D1D'; for (let i = 0; i < 4; i++) ctx.fillRect(cx - 20 + i * 12, o.floor - 5, 4, 3);
      } else {
        // The snitch, hanging, turning slowly, a sign round his neck
        const sway = Math.sin(f * 0.02) * 0.05;
        const frozen = pr.state === 'going';
        ctx.save(); ctx.translate(cx, o.floor - 170); ctx.rotate(sway);
        ctx.strokeStyle = '#D6B98C'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 22); ctx.stroke();
        if (frozen) ctx.filter = 'hue-rotate(170deg) saturate(0.6) brightness(1.4)';
        // (his legs, the shirt, the head lolled on the rope; the sign)
        for (const lx of [-9, 1]) shaded(ctx, () => ctx.rect(lx, 72, 8, 36), '#44403C', lx, 72, 8, 36);
        for (const lx of [-10, 1]) ink(ctx, () => ctx.roundRect(lx, 106, 9, 4, [0, 2, 1, 1]), '#1C1917', 0.8);
        shaded(ctx, () => ctx.roundRect(-10, 38, 20, 34, [4, 4, 1, 1]), '#1E40AF', -10, 38, 20, 34);
        for (const ax of [-12, 9]) ink(ctx, () => ctx.roundRect(ax, 40, 4, 28, 2), '#1E3A8A', 0.8);
        shaded(ctx, () => ctx.arc(0, 30, 9, 0, Math.PI * 2), '#D1A27A', -9, 21, 18, 18);
        ctx.fillStyle = '#111827'; ctx.fillRect(-3, 27, 2, 2); ctx.fillRect(2, 27, 2, 2); ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-2, 33, 5, 2);
        ctx.fillStyle = '#9F1239'; ctx.fillRect(-2, 35, 2, 3); // (his tongue)
        slab(ctx, -13, 44, 26, 14, '#F5F5F4', 1);
        ctx.fillStyle = '#B91C1C'; ctx.font = 'bold 4px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('SNITCH', 0, 53); ctx.textAlign = 'left';
        ctx.restore();
        if (frozen) { ctx.strokeStyle = 'rgba(224, 242, 254, 0.9)'; ctx.lineWidth = 2; ctx.strokeRect(cx - 16, o.floor - 150, 32, 112); }
      }
      break;
    }
  }
};

/** In front: the door frame, the snitch's closet door edge, what everyone's saying. */
export const drawOfficeFront = (ctx: Ctx, state: GameState, rt: DaleRuntime) => {
  const fight = rt.junkie;
  const m = fight.man;
  const jt = saying(rt.talk, 'junkie');
  if (m && jt) drawBubble(ctx, m.pos.x + W / 2, m.pos.y - 16, jt, '#FEF9C3');
  const dt = saying(rt.talk, 'dale');
  if (dt && (fight.phase === 'dead' || fight.phase === 'leaving')) drawBubble(ctx, COURSE.office.x2 - 180, COURSE.office.floor - 244, `DALE (OUTSIDE): ${dt}`, '#FDF4FF');
  // What's left of him
  if (fight.corpse) drawJunkieCorpse(ctx, fight.corpse, state.frame);
};

// ---------------------------------------------------------------------------
// What's left of him
// ---------------------------------------------------------------------------

export const drawJunkieCorpse = (ctx: Ctx, c: JunkieCorpse, f: number) => {
  const o = COURSE.office;
  if (c.headbutt) {
    // His head's through the wall: he hangs out of it by the neck, limp, legs dangling
    const x = c.headbutt > 0 ? o.x2 : o.x1;
    ctx.save(); ctx.translate(x, o.floor - 40); ctx.scale(c.headbutt > 0 ? 1 : -1, 1);
    ctx.fillStyle = 'rgba(127, 29, 29, 0.8)'; ctx.fillRect(-6, -10, 10, 30);
    ctx.save(); ctx.rotate(0.35);
    shaded(ctx, () => ctx.rect(-70, -8, 28, 18), PANTS, -70, -8, 28, 18);
    ink(ctx, () => ctx.roundRect(-78, 6, 12, 8, 2), SHOE, 1);
    shaded(ctx, () => ctx.rect(-44, -10, 36, 22), TANK, -44, -10, 36, 22);
    ink(ctx, () => ctx.rect(-10, -6, 10, 12), SKIN, 1);
    ctx.restore();
    ctx.save(); ctx.translate(-30, 10); ctx.rotate(1.3); ink(ctx, () => ctx.roundRect(0, -3, 22, 6, 3), SKIN, 1); ctx.restore();
    ctx.restore();
    // Plaster dust drifting down
    if (f % 20 === 0) { ctx.fillStyle = '#D6D3D1'; ctx.fillRect(x - 10, o.floor - 60 + (f % 40), 3, 3); }
    return;
  }
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.scale(c.facing, 1);
  const blood = (w: number) => drawBloodPool(ctx, 0, 2, Math.round(Math.min(w, 20 + (f - c.t0) * 0.6)), 545, { color: '#7A0A0A' });
  const body = (tint?: string) => {
    ctx.save(); if (tint) ctx.filter = tint;
    ctx.save(); ctx.translate(-20, -10); ctx.rotate(-Math.PI / 2); torso(ctx, 0, 0, 0, 'dazed'); ctx.restore();
    ctx.fillStyle = PANTS; ctx.fillRect(-14, -16, 46, 13); ctx.fillStyle = SHOE; ctx.fillRect(30, -22, 10, 14);
    ctx.restore();
  };
  const w: WeaponType = c.weapon;
  switch (w) {
    case 'FLAMETHROWER': body('brightness(0.2) sepia(1)'); for (let i = 0; i < 2; i++) { const k = ((f * 0.6 + i * 30) % 70) / 70; ctx.fillStyle = `rgba(80,80,80,${0.5 * (1 - k)})`; ctx.beginPath(); ctx.arc(-10 + i * 20, -24 - k * 50, 7 + k * 8, 0, Math.PI * 2); ctx.fill(); } break;
    case 'SHOTGUN': blood(80); ctx.fillStyle = 'rgba(186,230,253,0.7)'; for (let i = 0; i < 9; i++) ctx.fillRect(-50 + i * 12, -8 - (i % 3) * 5, 8, 7); ctx.fillStyle = '#7F1D1D'; for (let i = 0; i < 6; i++) ctx.fillRect(-40 + i * 14, -4, 5, 4); break;
    case 'BOULDER': blood(70); ctx.fillStyle = SHOE; ctx.fillRect(30, -10, 12, 10); ctx.fillStyle = '#57534E'; ctx.beginPath(); ctx.ellipse(-4, -30, 40, 32, 0, 0, Math.PI * 2); ctx.fill(); break;
    case 'TSUNAMI': ctx.fillStyle = 'rgba(56, 189, 248, 0.5)'; ctx.beginPath(); ctx.ellipse(0, -2, 70, 6, 0, 0, Math.PI * 2); ctx.fill(); body('saturate(0.6) brightness(0.9)'); break;
    case 'SLUDGE': ctx.fillStyle = '#65A30D'; ctx.beginPath(); ctx.ellipse(0, -3, 60, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.save(); ctx.scale(1, Math.max(0.4, 1 - (f - c.t0) / 400)); body('hue-rotate(60deg) saturate(1.4)'); ctx.restore(); break;
    case 'NEEDLES': body('saturate(1.6) hue-rotate(-20deg)'); ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 2; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-34 + i * 10, -26); ctx.lineTo(-38 + i * 10, -38); ctx.stroke(); } break;
    case 'TASER': body(Math.floor(f / 4) % 7 === 0 ? 'invert(1)' : undefined); break;
    case 'OIL_ROCKET': blood(60); ctx.fillStyle = '#0A0A0A'; ctx.beginPath(); ctx.ellipse(0, -2, 60, 5, 0, 0, Math.PI * 2); ctx.fill(); body('brightness(0.45)'); break;
    default: blood(70); body(); ctx.fillStyle = '#450A0A'; for (let i = 0; i < 6; i++) ctx.fillRect(-40 + i * 12, -18 - (i % 2) * 6, 3, 3);
  }
  // His gold pistol, next to him
  ctx.fillStyle = GOLD; ctx.fillRect(48, -4, 14, 4); ctx.fillRect(48, -4, 4, 8);
  ctx.restore();
};

// ---------------------------------------------------------------------------
// Screen space: his health
// ---------------------------------------------------------------------------

export const drawJunkieHud = (ctx: Ctx, state: GameState, rt: DaleRuntime) => {
  const fight = rt.junkie;
  const e = fight.man;
  if (!e || (fight.phase !== 'intro' && fight.phase !== 'fight')) return;
  const fill = fight.phase === 'intro' ? Math.min(1, fight.t / 60) : Math.max(0, e.health / JUNKIE_HP);
  const L = 330, R = 780;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(L - 10, 12, R - L + 20, 40);
  ctx.strokeStyle = '#0EA5E9'; ctx.lineWidth = 2; ctx.strokeRect(L - 10, 12, R - L + 20, 40);
  ctx.font = 'bold 10px "Press Start 2P"'; ctx.fillStyle = '#BAE6FD'; ctx.textAlign = 'left';
  ctx.fillText('CHUCO', L, 28);
  ctx.font = '7px "Press Start 2P"'; ctx.fillStyle = '#FDE047'; ctx.textAlign = 'right'; ctx.fillText("DALE'S DISTRIBUTOR", R, 28);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(L, 34, R - L, 10);
  ctx.fillStyle = fight.hpFlash > 0 ? '#FEF3C7' : '#0EA5E9'; ctx.fillRect(L, 34, (R - L) * fill, 10);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; for (let x = L; x < R; x += 19) ctx.fillRect(x, 34, 1, 10);
  ctx.restore();
  void CANVAS_WIDTH; void state;
};
