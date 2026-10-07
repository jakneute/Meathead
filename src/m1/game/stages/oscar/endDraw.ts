// Out back of the field office, drawn: the brick back of it, the NO SMOKING
// sign, the two of them under it with their cigarettes (then what's left of
// them, up the wall), the bike in a heap at the foot of it burning, the machine
// gun flung on top; and him, going over backwards off the bike.
//
// Everything in the 16-bit way: an ink line round each thing, its colour in steps (lit from the upper left), no
// smooth gradients.

import { drawPerson } from '../../render/npc/person';
import type { GameState } from '../../core/state';
import { GROUND_Y } from '../../../constants';
import { drawFire } from '../../render/fx/fire';
import { brickPattern, checker, pixelBlob } from '../../render/pixelArt';
import { drawSpatter, drawSpatterLayer, Spatter } from '../../render/spatter';
import { INK, ink } from '../../render/npc/kit';
import { slab, column, letter } from '../barry/rooms';
import { drawPlayer } from '../../render/player/player';
import { drawChopperBike, drawLmgProp } from '../../render/enemies/oscar';
import { COURSE } from './course';
import type { Ending } from './ending';

type Ctx = CanvasRenderingContext2D;
const Y = GROUND_Y;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** The field office's brick back wall, and its sign. */
export const drawEndBack = (ctx: Ctx, state: GameState, en: Ending) => {
  const W = COURSE.end.wall;
  if (state.camera.x > W + 700 || state.camera.x + 800 < W - 200) return;
  const top = Y - 200;
  // (brick, the courses in two tints, grime up from the ground, inked round)
  ctx.save(); ctx.translate(W, top);
  ctx.fillStyle = brickPattern(ctx, 'oscar-end-brick', 24, 10, ['#9A3412', '#8E3010'], '#7C2D12'); ctx.fillRect(0, 0, 420, 200);
  ctx.restore();
  ctx.fillStyle = '#C2410C'; for (let r = 0; r < 20; r++) for (let c = 0; c < 18; c++) { const o = r % 2 ? 12 : 0; if ((r * 7 + c * 3) % 5 === 0) ctx.fillRect(W + c * 24 + o, top + r * 10, 8, 1); }
  checker(ctx, W, Y - 24, 420, 24, 'rgba(28, 25, 23, 0.35)');
  ctx.fillStyle = 'rgba(28, 25, 23, 0.35)'; ctx.fillRect(W, Y - 10, 420, 10);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(W + 0.5, top + 0.5, 419, 199);
  slab(ctx, W - 6, top - 10, 432, 12, '#44403C'); // the roof edge
  slab(ctx, W + 246, Y - 114, 68, 114, '#57534E');
  slab(ctx, W + 250, Y - 110, 60, 110, '#292524'); // back door
  ctx.fillStyle = '#1C1917'; ctx.fillRect(W + 256, Y - 102, 48, 40); ctx.fillRect(W + 256, Y - 54, 48, 46);
  ink(ctx, () => ctx.rect(W + 300, Y - 60, 5, 5), '#FACC15');
  // The sign
  slab(ctx, W + 30, top + 40, 120, 60, '#F8FAFC', 1);
  ctx.strokeStyle = '#B91C1C'; ctx.lineWidth = 4; ctx.strokeRect(W + 33, top + 43, 114, 54);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(W + 30.5, top + 40.5, 119, 59);
  letter(ctx, 'NO SMOKING', W + 90, top + 64, 'bold 13px monospace', '#B91C1C', '#FECACA');
  letter(ctx, 'FLAMMABLE AREA', W + 90, top + 78, 'bold 7px monospace', '#B91C1C', '#FECACA');
  letter(ctx, 'BY ORDER OF MANAGEMENT', W + 90, top + 90, 'bold 7px monospace', '#44403C', '#E7E5E4');
  ctx.fillStyle = '#A8A29E'; for (const [bx, by] of [[W + 33, top + 43], [W + 145, top + 43], [W + 33, top + 95], [W + 145, top + 95]]) ctx.fillRect(bx, by, 2, 2);
  // A butt can by the door, overflowing
  column(ctx, W + 190, Y - 36, 18, 36, '#6B7280');
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(W + 189, Y - 38, 20, 3);
  for (let k = 0; k < 6; k++) { const bx = W + 186 + k * 4, by = Y - 38 - (k % 2) * 2; ctx.fillStyle = '#F8FAFC'; ctx.fillRect(bx, by, 3, 2); ctx.fillStyle = '#D97706'; ctx.fillRect(bx + (k % 2 ? 2 : 0), by, 1, 2); }
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(W + 212, Y - 2, 4, 2); ctx.fillRect(W + 180, Y - 2, 3, 2); // (and round it)
  // What's left of the two of them, up the wall
  if (en.smokers === 'paste') drawPaste(ctx, W, state.frame - en.splatAt);
};

/** Who the paste was: the layer it's painted on is theirs. */
const PASTE = {};
/**
 * The two of them, hit from the left by the bike and burst against the bricks: a big splat each, thrown on up and
 * along the wall the way the bike was going, more flung round them. Only on the bricks: not over the sign, the butt
 * can, the door, or off the wall's end.
 */
const pasteSpatter = (W: number, k: number): Spatter[] => {
  const top = Y - 200;
  const wall = [W, top, 30, 200, W + 30, top, 120, 40, W + 30, top + 100, 120, 100, W + 150, top, 38, 200, W + 188, top, 52, 160];
  const out: Spatter[] = [
    { x: W + 34, y: Y - 78, size: 20 * k, seed: 11, dx: 0.7, dy: -0.35, clip: wall, color: '#A51D1D' },
    { x: W + 62, y: Y - 52, size: 17 * k, seed: 12, dx: 0.75, dy: -0.15, clip: wall, color: '#B91C1C' },
  ];
  for (let i = 0; i < 26; i += 2) {
    const r = (6 + hash(i) * 20) * k;
    out.push({ x: W + 6 + hash(i + 3) * 70, y: Y - 20 - hash(i + 9) * 110, size: 2 + r * 0.32, seed: 40 + i, dx: 0.6, dy: -0.3, clip: wall, color: ['#991B1B', '#B91C1C', '#7F1D1D', '#C62828'][i % 4] });
  }
  // (and what ran down to the foot of the wall)
  out.push({ on: 'floor', x: W + 40, y: Y, size: 26 * k, seed: 13, dx: 0.4, x1: W - 56, x2: W + 186, color: '#7F1D1D' });
  return out;
};

/** Two of the union up against the wall: a red smear, a hard hat, a cigarette still smoking on the ground. */
const drawPaste = (ctx: Ctx, W: number, since: number) => {
  const k = Math.min(1, since / 8);
  ctx.save();
  // (painted the once, all of it there; till then, as it spreads)
  if (k < 1) for (const sp of pasteSpatter(W, k)) drawSpatter(ctx, sp);
  else drawSpatterLayer(ctx, PASTE, { x: W - 60, y: Y - 200, w: 300, h: 206 }, () => pasteSpatter(W, 1));
  // Drips running down it
  for (let i = 0; i < 8; i++) {
    const len = Math.round(Math.min(60, Math.max(0, since - 10) * 0.5) * hash(i + 20)), dx = W + 10 + i * 8, dy = Math.round(Y - 100 + hash(i) * 50);
    ctx.fillStyle = '#7F1D1D'; ctx.fillRect(dx, dy, 3, len); ctx.fillStyle = '#450A0A'; ctx.fillRect(dx + 2, dy, 1, len);
    if (len > 4) { ctx.fillStyle = '#7F1D1D'; ctx.fillRect(dx - 1, dy + len, 4, 3); ctx.fillStyle = '#B91C1C'; ctx.fillRect(dx, dy + len, 1, 1); }
  }
  // Bits: a hard hat, a boot, a hi-vis rag, a cigarette
  ink(ctx, () => ctx.arc(W - 30, Y - 4, 9, Math.PI, 0), '#FACC15'); ctx.fillStyle = '#FEF08A'; ctx.fillRect(W - 35, Y - 11, 4, 3);
  ink(ctx, () => ctx.rect(W - 41, Y - 5, 22, 3), '#CA8A04');
  ink(ctx, () => { ctx.rect(W - 60, Y - 8, 14, 8); }, '#44403C'); ctx.fillStyle = '#7F1D1D'; ctx.fillRect(W - 60, Y - 9, 6, 2);
  ink(ctx, () => ctx.rect(W + 20, Y - 60, 20, 8), '#F97316'); ctx.fillStyle = '#FDE047'; ctx.fillRect(W + 21, Y - 57, 18, 2);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(W - 80, Y - 3, 10, 2); ctx.fillStyle = '#EF4444'; ctx.fillRect(W - 70, Y - 3, 2, 2);
  ctx.restore();
};

/** The two of them having their smoke, or the heap, burning, with the gun on it; the bike going in. */
export const drawEndMid = (ctx: Ctx, state: GameState, en: Ending) => {
  const S = COURSE.end.smokers, W = COURSE.end.wall;
  if (state.camera.x > W + 900 || state.camera.x + 800 < S - 900) return;
  const f = state.frame;
  if (en.smokers === 'smoking') {
    drawSmoker(ctx, S - 34, 1, f, '#1D4ED8');
    drawSmoker(ctx, S + 12, -1, f + 40, '#15803D');
  }
  // The bike: loose and heading in, or a burning heap at the foot of the wall
  if (en.bike.state === 'loose') drawChopperBike(ctx, en.bike.x, Y, en.bike.rot, en.bike.x / 12, '#7F1D1D');
  if (en.bike.state === 'crashed') {
    // (reared up against the wall on its back wheel: turned about that wheel's middle, so the tire sits on the
    // ground, not down through it, and the front wheel's up against the bricks)
    ctx.save(); ctx.translate(W - 66, Y - 13); ctx.rotate(-0.5);
    drawChopperBike(ctx, 26, 13, 0, 0, '#1C1917');
    ctx.restore();
    // (its glow kept above the ground: none of it down through the dirt)
    ctx.save(); ctx.beginPath(); ctx.rect(W - 200, Y - 300, 260, 300); ctx.clip();
    drawFire(ctx, W - 46, Y, 72, 34, f, { seed: 41, glow: 0.8 });
    ctx.restore();
    for (let k = 0; k < 3; k++) { const q = ((f + k * 30) % 90) / 90; pixelBlob(ctx, W - 40 + q * 20, Y - 40 - q * 140, 10 + q * 24, 8 + q * 19, `rgba(41, 37, 36, ${(0.5 * (1 - q)).toFixed(3)})`); }
  }
  if (en.gun.state !== 'held') drawLmgProp(ctx, en.gun.x, en.gun.y, en.gun.rot);
};

/** One of them, stood having a smoke: a hard hat, a vest, the cigarette going, a hand going as he complains. */
const drawSmoker = (ctx: Ctx, x: number, facing: number, f: number, shirt: string) => {
  // A smoke break: the work shirt under the vest, the hard hat, the cigarette going up to his mouth and down
  const up = Math.sin(f * 0.03) > 0.6;
  const cig = (c: Ctx, hx: number, hy: number) => {
    c.fillStyle = '#F8FAFC'; c.fillRect(hx + 2, hy - 1, 7, 2); c.fillStyle = '#EF4444'; c.fillRect(hx + 9, hy - 1, 2, 2);
    const q = (f % 50) / 50; pixelBlob(c, hx + 11 + q * 6, hy - 3 - q * 24, 2 + q * 5, 2 + q * 4, `rgba(214, 211, 209, ${(0.6 * (1 - q)).toFixed(3)})`);
  };
  drawPerson(ctx, x, Y, {
    skin: '#E0AC69', hair: { style: 'short', color: '#3F2A1D' }, top: { style: 'vest', color: shirt, accent: '#F97316' }, legs: { color: '#1E3A8A' }, shoes: '#44403C',
    hat: { style: 'hardhat', color: '#FACC15' }, face: 'stubble', extra: c => { c.fillStyle = '#FDE047'; c.fillRect(-9, -38, 18, 2); },
  }, { arms: up ? 'hold' : 'down', mouth: up ? 'o' : 'flat', f, prop: cig }, 1, facing < 0 ? -1 : 1);
};

/** Him, going over backwards off the bike (the real him's hidden while he's up there). */
export const drawEndFront = (ctx: Ctx, state: GameState, en: Ending) => {
  if (en.phase !== 'flip') return;
  const p = state.player, fl = en.flip;
  const cy = fl.y - p.height / 2;
  const body = { ...p, hidden: false, moto: false, jetski: false, skiing: false, isGrounded: false, vel: { x: 0, y: -2 }, pos: { x: fl.x - p.width / 2, y: fl.y - p.height } };
  ctx.save(); ctx.translate(fl.x, cy); ctx.rotate(fl.rot); ctx.translate(-fl.x, -cy);
  drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: 'LMG', showFilthShield: false, invincibilityEnabled: false });
  ctx.restore();
};
