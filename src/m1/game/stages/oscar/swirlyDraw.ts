// The swirly, drawn: the toilet in the HOGS, the three of them that carry him off with him up over their heads, him
// stuffed head first into the bowl with his legs going, and him going down with the flush, round and round, smaller
// and smaller. Then the cutaway of the pipes under the bar: the brown water going by, and him in it in chunks (his
// head, still yelling, blowing bubbles; an arm with its wristband; a boot; the buckle off his belt; a hunk of him; a
// rag of the shitty jeans), a rat on a ledge watching it all go by.
//
// Everything in the 16-bit way: an ink line round each thing, its colour in steps (lit from the upper left), no
// smooth gradients.

import type { GameState } from '../../core/state';
import { GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { drawKindCorpse } from '../../render/enemies';
import { drawPlayer } from '../../render/player/player';
import { drawHead, drawBoot, drawPantLeg, skinTone, skinShadow, wristbandColor, pantsColor, beltColor, beltBuckle } from '../../render/player/body';
import { bandedGradient, checker } from '../../render/pixelArt';
import { INK, ink, shaded, limb } from '../../render/npc/kit';
import { slab, column, pipe } from '../barry/rooms';
import type { Bar } from './bar';
import { toiletX, TOILET_RIM, PIPES_FRAMES } from './swirly';

type Ctx = CanvasRenderingContext2D;
const Y = GROUND_Y;
const BIKER_ARM = '#C08457', BIKER_SLEEVE = '#1F2937';

/** The toilet, front on: the tank against the back wall, the lid up against it, the bowl and its foot, a handle. */
export const drawToilet = (ctx: Ctx, front: boolean) => {
  const x = toiletX(), rim = Y - TOILET_RIM;
  if (!front) {
    shaded(ctx, () => ctx.roundRect(x - 18, Y - 78, 36, 30, 3), '#CBD5E1', x - 18, Y - 78, 36, 30); // the tank
    slab(ctx, x - 20, Y - 80, 40, 5, '#E2E8F0', 1); // (its lid)
    slab(ctx, x - 25, Y - 71, 9, 3, '#94A3B8', 1); // the handle
    shaded(ctx, () => ctx.ellipse(x, Y - 58, 15, 18, 0, 0, Math.PI * 2), '#E2E8F0', x - 15, Y - 76, 30, 36); // the lid, up
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x - 10, Y - 70, 3, 8);
    ctx.fillStyle = 'rgba(120, 80, 30, 0.45)'; ctx.fillRect(x - 6, Y - 52, 4, 6); ctx.fillRect(x - 4, Y - 46, 2, 3); // (not a clean establishment)
    ink(ctx, () => ctx.ellipse(x, rim, 20, 5, 0, 0, Math.PI * 2), '#475569'); // the hole
    ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.ellipse(x + 2, rim + 1, 14, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(146, 64, 14, 0.6)'; ctx.fillRect(x - 4, rim, 10, 2); // (the water in it, the color it is)
    return;
  }
  // The front of the bowl and its foot (over whatever's down in it)
  shaded(ctx, () => ctx.rect(x - 9, rim + 14, 18, Y - rim - 16), '#CBD5E1', x - 9, rim + 14, 18, Y - rim - 16);
  slab(ctx, x - 13, Y - 3, 26, 3, '#CBD5E1', 1);
  const bowl = () => { ctx.moveTo(x - 23, rim); ctx.lineTo(x + 23, rim); ctx.lineTo(x + 18, rim + 12); ctx.lineTo(x + 9, rim + 16); ctx.lineTo(x - 9, rim + 16); ctx.lineTo(x - 18, rim + 12); ctx.closePath(); };
  shaded(ctx, bowl, '#E2E8F0', x - 23, rim, 46, 16);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x - 16, rim + 3, 6, 2);
  slab(ctx, x - 22, rim - 1, 44, 3, '#F8FAFC', 1); // the seat's front edge
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
    limb(ctx, (sx + hx) / 2, (sy + hy) / 2, hx, hy, 6, BIKER_ARM);
    limb(ctx, sx, sy, (sx + hx) / 2, (sy + hy) / 2, 7, BIKER_SLEEVE);
    ink(ctx, () => ctx.arc(hx, hy, 4, 0, Math.PI * 2), BIKER_ARM);
    ctx.fillStyle = '#D9A273'; ctx.fillRect(hx - 2, hy - 3, 2, 2);
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
      ink(ctx, () => ctx.roundRect(-14, -4, 22, 8, 3), skinTone, 0.6);
      ctx.fillStyle = skinShadow; ctx.fillRect(-13, 1, 20, 2);
      ink(ctx, () => ctx.arc(13, 0, 5.5, 0, Math.PI * 2), skinTone, 0.6);
      ctx.fillStyle = skinShadow; ctx.fillRect(13, 1, 4, 3);
      ink(ctx, () => ctx.rect(4, -5, 5, 10), wristbandColor, 0.6);
      ink(ctx, () => ctx.rect(-16, -4, 3, 8), '#7F1D1D', 0.6); ctx.fillStyle = '#F5F5F4'; ctx.fillRect(-16, -1, 2, 2);
      break;
    case 2: // a boot, and a bit of the leg still in it
      drawPantLeg(ctx, -5, -18, 10, 12, pantsColor);
      ctx.fillStyle = 'rgba(110, 70, 30, 0.7)'; ctx.fillRect(-5, -18, 10, 6);
      drawBoot(ctx, -6, -7, 16, 8, true);
      ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-5, -20, 10, 3);
      break;
    case 3: // the belt, and its buckle
      ink(ctx, () => ctx.rect(-16, -3, 32, 6), beltColor, 0.6);
      ink(ctx, () => ctx.rect(-5, -5, 10, 10), beltBuckle, 0.6); ctx.fillStyle = beltColor; ctx.fillRect(-2, -2, 4, 4);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-4, -4, 2, 1);
      break;
    case 4: // a hunk of him
      shaded(ctx, () => ctx.ellipse(0, 0, 11, 7, 0, 0, Math.PI * 2), '#B91C1C', -11, -7, 22, 14, 0.6);
      ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.ellipse(-3, 2, 6, 3, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#F87171'; ctx.fillRect(-6, -3, 3, 1);
      ink(ctx, () => ctx.rect(-9, -7, 14, 3), skinTone, 0.6);
      ink(ctx, () => ctx.rect(4, -2, 8, 3), '#F5F5F4', 0.6); // a bit of bone
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
  // (inside it: dark going darker toward the middle, a tide line of muck along each wall)
  bandedGradient(ctx, 0, PIPE_TOP, CANVAS_WIDTH, PIPE_BOT - PIPE_TOP, ['#27272A', '#18181B', '#0C0C0E', '#18181B'], 6);
  ctx.fillStyle = '#3F2A14'; ctx.fillRect(0, PIPE_TOP, CANVAS_WIDTH, 3); checker(ctx, 0, PIPE_TOP + 3, CANVAS_WIDTH, 2, '#3F2A14');
  pipe(ctx, 0, PIPE_TOP - 24, CANVAS_WIDTH, 24, '#3F3F46'); pipe(ctx, 0, PIPE_BOT, CANVAS_WIDTH, 24, '#3F3F46');
  const scroll = (t * 1.6) % 240;
  for (let jx = -scroll; jx < CANVAS_WIDTH + 240; jx += 240) {
    // (a flanged joint, bolted, rust weeping from it)
    slab(ctx, jx, PIPE_TOP - 30, 22, 36, '#27272A'); slab(ctx, jx, PIPE_BOT - 6, 22, 36, '#27272A');
    for (const by of [PIPE_TOP - 24, PIPE_TOP - 6, PIPE_BOT + 4, PIPE_BOT + 22]) { ctx.fillStyle = '#71717A'; ctx.fillRect(jx + 8, by, 6, 4); ctx.fillStyle = '#A1A1AA'; ctx.fillRect(jx + 8, by, 2, 2); ctx.fillStyle = INK; ctx.fillRect(jx + 8, by + 4, 6, 1); }
    ctx.fillStyle = 'rgba(146, 64, 14, 0.5)'; ctx.fillRect(jx + 22, PIPE_TOP - 22, 2, 14); ctx.fillRect(jx + 24, PIPE_TOP - 14, 2, 6);
  }
  // Where the bar's comes in, from up top on the left
  column(ctx, 110, 0, 70, PIPE_TOP, '#3F3F46');
  ctx.fillStyle = '#18181B'; ctx.fillRect(122, 0, 46, PIPE_TOP + 2); ctx.fillStyle = '#0C0C0E'; ctx.fillRect(150, 0, 18, PIPE_TOP + 2);
  ctx.fillStyle = INK; ctx.fillRect(121, 0, 1, PIPE_TOP + 2); ctx.fillRect(168, 0, 1, PIPE_TOP + 2);
  for (let k = 0; k < 4; k++) { const q = Math.round(((f * 6 + k * 50) % PIPE_TOP) / 2) * 2; ctx.fillStyle = 'rgba(120, 80, 30, 0.85)'; ctx.fillRect(130 + k * 8, q, 4, 18); ctx.fillStyle = 'rgba(160, 112, 50, 0.85)'; ctx.fillRect(130 + k * 8, q, 2, 14); }
  // The water: brown, rolling, a scum on top
  const wave = (x: number) => WATER + Math.sin(x * 0.03 + t * 0.12) * 4 + Math.sin(x * 0.011 - t * 0.07) * 3;
  ctx.fillStyle = '#5C3D1E';
  ctx.beginPath(); ctx.moveTo(0, PIPE_BOT); for (let x = 0; x <= CANVAS_WIDTH; x += 8) ctx.lineTo(x, Math.round(wave(x) / 2) * 2); ctx.lineTo(CANVAS_WIDTH, PIPE_BOT); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4A3018'; ctx.fillRect(0, WATER + 40, CANVAS_WIDTH, PIPE_BOT - WATER - 40);
  checker(ctx, 0, WATER + 36, CANVAS_WIDTH, 4, '#4A3018');
  ctx.fillStyle = '#3A2410'; ctx.fillRect(0, WATER + 70, CANVAS_WIDTH, PIPE_BOT - WATER - 70); checker(ctx, 0, WATER + 66, CANVAS_WIDTH, 4, '#3A2410');
  ctx.fillStyle = '#7A5530'; for (let x = 0; x < CANVAS_WIDTH; x += 8) if ((x + Math.floor(t * 1.6)) % 48 < 20) ctx.fillRect(x, Math.round(wave(x) / 2) * 2, 8, 2);
  ctx.fillStyle = '#A07848'; for (let x = 0; x < CANVAS_WIDTH; x += 8) if ((x + Math.floor(t * 1.6)) % 48 < 6) ctx.fillRect(x, Math.round(wave(x) / 2) * 2, 4, 1);
  // A rat on the ledge, watching it go by
  const rx = CANVAS_WIDTH - 150, ry = PIPE_TOP + 40;
  slab(ctx, rx - 40, ry, 90, 8, '#27272A');
  ink(ctx, () => ctx.rect(rx + 12, ry - 4, 22, 2), '#F9A8D4', 0.6); // (his tail)
  shaded(ctx, () => ctx.ellipse(rx, ry - 8, 14, 8, 0, 0, Math.PI * 2), '#57534E', rx - 14, ry - 16, 28, 16);
  shaded(ctx, () => ctx.ellipse(rx - 14, ry - 11, 7, 5, 0, 0, Math.PI * 2), '#57534E', rx - 21, ry - 16, 14, 10);
  ink(ctx, () => ctx.arc(rx - 10, ry - 16, 3, 0, Math.PI * 2), '#78716C', 0.6); ctx.fillStyle = '#F9A8D4'; ctx.fillRect(rx - 11, ry - 17, 2, 2); // (an ear)
  ctx.fillStyle = '#F9A8D4'; ctx.fillRect(rx - 22, ry - 12, 3, 2);
  ctx.fillStyle = '#FDE047'; ctx.fillRect(rx - 16, ry - 13, 2, 2); ctx.fillStyle = INK; ctx.fillRect(rx - 15, ry - 12, 1, 1);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(rx - 8, ry - 14, 8, 2);
  ink(ctx, () => ctx.rect(rx - 8, ry - 2, 4, 2), '#F9A8D4', 0.6); ink(ctx, () => ctx.rect(rx + 6, ry - 2, 4, 2), '#F9A8D4', 0.6);
  // What's left of him, going by
  for (const c of CHUNKS) {
    const x = -60 + (t - c.lag) * 2.6;
    if (x < -80 || x > CANVAS_WIDTH + 80) continue;
    const y = wave(x) + 4 + Math.sin(t * 0.09 + c.lag) * 4;
    drawChunk(ctx, c.kind, x, y, c.kind === 0 ? Math.sin(t * 0.1) * 0.2 : t * c.spin + c.lag, f);
    // (bubbles up off him: the head's still yelling)
    if (c.kind === 0 && t % 30 < 22) for (let k = 0; k < 3; k++) { const bx = Math.round(x + 18 + k * 6), by = Math.round(y - 26 - ((t + k * 9) % 22)); ctx.strokeStyle = 'rgba(214, 211, 209, 0.85)'; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, 4, 4); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(bx + 1, by + 1, 1, 1); }
  }
  // In, from black, and out to it
  const k = Math.max(0, 1 - t / 20, (t - (PIPES_FRAMES - 20)) / 20);
  if (k > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.min(1, k)})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  ctx.restore();
};
