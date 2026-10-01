// The swirly, drawn: the toilet in the HOGS, the three of them that carry him off with him up over their heads, him
// stuffed head first into the bowl with his legs going, and him going down with the flush, round and round, smaller
// and smaller. Then the cutaway of the pipes under the bar: the brown water going by, and him in it in chunks (his
// head, still yelling, blowing bubbles; an arm with its wristband; a boot; the buckle off his belt; a hunk of him; a
// rag of the shitty jeans), a rat on a ledge watching it all go by.

import type { GameState } from '../../core/state';
import { GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { drawKindCorpse } from '../../render/enemies';
import { drawPlayer } from '../../render/player/player';
import { drawHead, drawBoot, drawPantLeg, skinTone, skinShadow, wristbandColor, pantsColor, beltColor, beltBuckle } from '../../render/player/body';
import { bandedGradient, checker } from '../../render/pixelArt';
import type { Bar } from './bar';
import { toiletX, TOILET_RIM, PIPES_FRAMES } from './swirly';

type Ctx = CanvasRenderingContext2D;
const Y = GROUND_Y;
const BIKER_ARM = '#C08457', BIKER_SLEEVE = '#1F2937';

/** The toilet, front on: the tank against the back wall, the lid up against it, the bowl and its foot, a handle. */
export const drawToilet = (ctx: Ctx, front: boolean) => {
  const x = toiletX(), rim = Y - TOILET_RIM;
  if (!front) {
    ctx.fillStyle = '#CBD5E1'; ctx.fillRect(x - 18, Y - 78, 36, 30); // the tank
    ctx.fillStyle = '#E2E8F0'; ctx.fillRect(x - 18, Y - 78, 36, 4); ctx.fillRect(x - 16, Y - 74, 2, 24);
    ctx.fillStyle = '#94A3B8'; ctx.fillRect(x - 24, Y - 70, 8, 3); // the handle
    ctx.fillStyle = '#E2E8F0'; ctx.beginPath(); ctx.ellipse(x, Y - 58, 15, 18, 0, 0, Math.PI * 2); ctx.fill(); // the lid, up
    ctx.fillStyle = 'rgba(120, 80, 30, 0.35)'; ctx.fillRect(x - 6, Y - 52, 4, 6); // (not a clean establishment)
    ctx.fillStyle = '#475569'; ctx.beginPath(); ctx.ellipse(x, rim, 20, 5, 0, 0, Math.PI * 2); ctx.fill(); // the hole
    return;
  }
  // The front of the bowl and its foot (over whatever's down in it)
  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath(); ctx.moveTo(x - 23, rim); ctx.lineTo(x + 23, rim); ctx.lineTo(x + 18, rim + 12); ctx.lineTo(x + 9, rim + 16); ctx.lineTo(x - 9, rim + 16); ctx.lineTo(x - 18, rim + 12); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#CBD5E1'; ctx.fillRect(x - 9, rim + 16, 18, Y - rim - 16); ctx.fillRect(x - 13, Y - 3, 26, 3);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x - 22, rim - 1, 44, 3); // the seat's front edge
  ctx.fillStyle = '#94A3B8'; ctx.fillRect(x - 18, rim + 8, 2, 4); ctx.fillRect(x - 9, rim + 16, 2, Y - rim - 19);
};

/** The three of them, by him (and with him over their heads, or held down in the bowl). */
export const drawSwirly = (ctx: Ctx, state: GameState, b: Bar) => {
  const s = b.swirly!;
  if (s.phase === 'pipes') return;
  const p = state.player, f = state.frame;
  const lifting = s.phase === 'carry', holding = s.phase === 'stuff' || s.phase === 'flush';
  const tx = toiletX(), rim = Y - TOILET_RIM;
  // The three of them (behind him), then him, then their arms on him
  s.carriers.forEach((i, k) => {
    const x = s.x[k], facing: 1 | -1 = lifting ? 1 : (x < (holding ? tx : s.mx) ? 1 : -1);
    drawKindCorpse(ctx, 'biker', x - 27, Y - 72, 54, 72, facing, i * 131, state);
  });
  // Him: up over their heads head first, or upside down in the bowl, kicking
  if (lifting || holding) {
    const kick = Math.sin(f * 0.6) * (holding ? 0.18 : 0.1);
    const body = { ...p, hidden: false, isGrounded: false, isDucking: false, hurtTimer: 10, vel: { x: 0, y: 4 } };
    ctx.save();
    if (lifting) {
      const cx = s.mx, cy = Y - 118 + Math.sin(s.t * 0.3) * 2;
      ctx.translate(cx, cy); ctx.rotate(Math.PI / 2 + kick);
    } else {
      const down = s.down, sink = down * 70;
      // (the bowl hides what's gone in: only what's still above the rim shows)
      ctx.beginPath(); ctx.rect(tx - 200, Y - 400, 400, 400 - TOILET_RIM + 2); ctx.clip();
      ctx.translate(tx + Math.sin(s.t * 0.5) * 2 * (1 - down), rim - p.height / 2 + 16 + sink);
      ctx.rotate(Math.PI + kick + down * down * 14);
      ctx.scale(1 - down * 0.5, 1 - down * 0.5);
    }
    body.pos = { x: -p.width / 2, y: -p.height / 2 };
    drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
    ctx.restore();
  }
  if (lifting || holding) s.carriers.forEach((_, k) => {
    const x = s.x[k], facing: 1 | -1 = lifting ? 1 : (x < tx ? 1 : -1);
    const sx = x + facing * 4, sy = Y - 56;
    const hx = lifting ? x + (k - 1) * 4 : tx + [-8, 8, -12][k], hy = lifting ? Y - 104 : rim - 44 + Math.sin(f * 0.5 + k) * 3;
    ctx.strokeStyle = BIKER_SLEEVE; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo((sx + hx) / 2, (sy + hy) / 2); ctx.stroke();
    ctx.strokeStyle = BIKER_ARM; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo((sx + hx) / 2, (sy + hy) / 2); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.fillStyle = BIKER_ARM; ctx.beginPath(); ctx.arc(hx, hy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.lineCap = 'butt';
  });
};

// ---------------------------------------------------------------------------
// The pipes (screen space, over everything, for the death scene)
// ---------------------------------------------------------------------------

const PIPE_TOP = 190, PIPE_BOT = 390, WATER = 300;

/** One of the chunks of him, at (x, y), turning. */
const drawChunk = (ctx: Ctx, kind: number, x: number, y: number, rot: number, f: number) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(2, 2);
  switch (kind) {
    case 0: // his head, still going
      ctx.rotate(-rot * 0.8);
      drawHead(ctx, 0, 0, f % 40 < 20 ? 'yell' : 'roar', f);
      ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-8, 7, 16, 3); // (where the rest of him was)
      break;
    case 1: // an arm: the forearm, the wristband, the fist
      ctx.fillStyle = skinTone; ctx.beginPath(); ctx.roundRect(-14, -4, 22, 8, 3); ctx.fill();
      ctx.fillStyle = skinShadow; ctx.fillRect(-14, 1, 22, 3);
      ctx.fillStyle = wristbandColor; ctx.fillRect(4, -5, 5, 10);
      ctx.fillStyle = skinTone; ctx.beginPath(); ctx.arc(13, 0, 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-16, -4, 3, 8);
      break;
    case 2: // a boot, and a bit of the leg still in it
      drawPantLeg(ctx, -5, -18, 10, 12, pantsColor);
      ctx.fillStyle = 'rgba(110, 70, 30, 0.7)'; ctx.fillRect(-5, -18, 10, 6);
      drawBoot(ctx, -6, -7, 16, 8, true);
      ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-5, -20, 10, 3);
      break;
    case 3: // the belt, and its buckle
      ctx.fillStyle = beltColor; ctx.fillRect(-16, -3, 32, 6);
      ctx.fillStyle = beltBuckle; ctx.fillRect(-5, -5, 10, 10); ctx.fillStyle = beltColor; ctx.fillRect(-2, -2, 4, 4);
      break;
    case 4: // a hunk of him
      ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.ellipse(-3, 2, 6, 3, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = skinTone; ctx.fillRect(-9, -7, 14, 3);
      ctx.fillStyle = '#F5F5F4'; ctx.fillRect(4, -2, 8, 3); // a bit of bone
      break;
    default: // a rag of the jeans, the seat of them
      drawPantLeg(ctx, -12, -8, 24, 16, pantsColor, true);
      ctx.fillStyle = 'rgba(110, 70, 30, 0.85)'; ctx.beginPath(); ctx.ellipse(0, 2, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
      break;
  }
  ctx.restore();
};

/** In order along the water: what comes by, how far behind the first, how fast it turns. */
const CHUNKS = [
  { kind: 4, lag: 0, spin: 0.05 }, { kind: 1, lag: 28, spin: 0.08 }, { kind: 5, lag: 56, spin: 0.03 },
  { kind: 2, lag: 84, spin: 0.06 }, { kind: 3, lag: 108, spin: 0.1 }, { kind: 0, lag: 150, spin: 0.02 },
];

export const drawSwirlyPipes = (ctx: Ctx, state: GameState, t: number) => {
  const f = state.frame;
  ctx.save();
  // The dirt, the pipe through it, its joints and bolts
  bandedGradient(ctx, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, ['#1C1410', '#2A1D14', '#1C1410'], 10);
  checker(ctx, 0, 0, CANVAS_WIDTH, PIPE_TOP - 24, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(0, PIPE_TOP - 24, CANVAS_WIDTH, 24); ctx.fillRect(0, PIPE_BOT, CANVAS_WIDTH, 24);
  ctx.fillStyle = '#52525B'; ctx.fillRect(0, PIPE_TOP - 24, CANVAS_WIDTH, 6); ctx.fillRect(0, PIPE_BOT, CANVAS_WIDTH, 6);
  ctx.fillStyle = '#18181B'; ctx.fillRect(0, PIPE_TOP, CANVAS_WIDTH, PIPE_BOT - PIPE_TOP);
  const scroll = (t * 1.6) % 240;
  for (let jx = -scroll; jx < CANVAS_WIDTH + 240; jx += 240) {
    ctx.fillStyle = '#27272A'; ctx.fillRect(jx, PIPE_TOP - 30, 22, 36); ctx.fillRect(jx, PIPE_BOT - 6, 22, 36);
    ctx.fillStyle = '#71717A'; for (const by of [PIPE_TOP - 24, PIPE_TOP - 6, PIPE_BOT + 4, PIPE_BOT + 22]) ctx.fillRect(jx + 8, by, 6, 4);
  }
  // Where the bar's comes in, from up top on the left
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(110, 0, 70, PIPE_TOP); ctx.fillStyle = '#18181B'; ctx.fillRect(122, 0, 46, PIPE_TOP + 2);
  ctx.fillStyle = 'rgba(120, 80, 30, 0.8)'; for (let k = 0; k < 4; k++) { const q = ((f * 6 + k * 50) % PIPE_TOP); ctx.fillRect(130 + k * 8, q, 4, 18); }
  // The water: brown, rolling, a scum on top
  const wave = (x: number) => WATER + Math.sin(x * 0.03 + t * 0.12) * 4 + Math.sin(x * 0.011 - t * 0.07) * 3;
  ctx.fillStyle = '#5C3D1E';
  ctx.beginPath(); ctx.moveTo(0, PIPE_BOT); for (let x = 0; x <= CANVAS_WIDTH; x += 8) ctx.lineTo(x, Math.round(wave(x) / 2) * 2); ctx.lineTo(CANVAS_WIDTH, PIPE_BOT); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4A3018'; ctx.fillRect(0, WATER + 40, CANVAS_WIDTH, PIPE_BOT - WATER - 40);
  ctx.fillStyle = '#7A5530'; for (let x = 0; x < CANVAS_WIDTH; x += 8) if ((x + Math.floor(t * 1.6)) % 48 < 20) ctx.fillRect(x, Math.round(wave(x) / 2) * 2, 8, 2);
  // A rat on the ledge, watching it go by
  const rx = CANVAS_WIDTH - 150, ry = PIPE_TOP + 40;
  ctx.fillStyle = '#27272A'; ctx.fillRect(rx - 40, ry, 90, 8);
  ctx.fillStyle = '#57534E'; ctx.beginPath(); ctx.ellipse(rx, ry - 8, 14, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(rx - 14, ry - 11, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F9A8D4'; ctx.fillRect(rx - 22, ry - 12, 3, 2); ctx.fillRect(rx + 12, ry - 4, 22, 2);
  ctx.fillStyle = '#FDE047'; ctx.fillRect(rx - 16, ry - 13, 2, 2);
  // What's left of him, going by
  for (const c of CHUNKS) {
    const x = -60 + (t - c.lag) * 2.6;
    if (x < -80 || x > CANVAS_WIDTH + 80) continue;
    const y = wave(x) + 4 + Math.sin(t * 0.09 + c.lag) * 4;
    drawChunk(ctx, c.kind, x, y, c.kind === 0 ? Math.sin(t * 0.1) * 0.2 : t * c.spin + c.lag, f);
    // (bubbles up off him: the head's still yelling)
    if (c.kind === 0 && t % 30 < 22) { ctx.fillStyle = 'rgba(214, 211, 209, 0.7)'; for (let k = 0; k < 3; k++) ctx.fillRect(x + 18 + k * 6, y - 26 - ((t + k * 9) % 22), 4, 4); }
  }
  // In, from black, and out to it
  const k = Math.max(0, 1 - t / 20, (t - (PIPES_FRAMES - 20)) / 20);
  if (k > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.min(1, k)})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  ctx.restore();
};
