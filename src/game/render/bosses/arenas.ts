import { ARENA_LEFT, GROUND_Y } from '../../../constants';
import { getArenaRight } from '../../bosses/registry';
import { bandedGradient, checker, hazeBands, pixelBlob, steppedGlow, tilePattern } from '../pixelArt';
import { INK, dark, lite, ink, shaded } from '../npc/kit';
import { drawFire } from '../fx/fire';
import { drawSpatter } from '../spatter';
import { drawArtieLair } from './lairs/artie';
import { drawVictorLair } from './lairs/victor';
import { drawErnieLair } from './lairs/ernie';
import { drawHectorLair } from './lairs/hector';
import { drawBarryLair } from './lairs/barry';
import { drawOscarLair, drawOscarRuin, OSCAR_RUIN_BLAZES } from './lairs/oscar';
import type { Enemy } from '../../../types';
import type { GameState } from '../../core/state';

/** Decorative backdrops for each boss arena (drawn in world coordinates). */
export const drawCustomBossArena = (
  ctx: CanvasRenderingContext2D,
  stageId: string,
  frame: number,
  /** Where the wind is being sucked toward (Hector's hurricane), if anywhere. */
  windTargetX: number | null = null,
  /** The game (for arenas that change as the fight goes: Dale's pharmacy walls). */
  state?: GameState,
) => {
  const arenaLeft = ARENA_LEFT;
  const arenaRight = getArenaRight(stageId);
  const arenaW = arenaRight - arenaLeft;
  const groundY = GROUND_Y;
  const ceilingY = 100;

  ctx.save();

  switch (stageId) {
    case 'Artie Avalanche':
      drawArtieLair(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame, state?.artieVault);
      break;
    case 'Victor Volcano':
      drawVictorLair(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame);
      break;
    case 'Ernie Earthquake':
      drawErnieLair(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame, state?.ernieWreck.quakes);
      break;
    case 'Hector Hurricane':
      drawHectorLair(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame, windTargetX);
      if (state) drawHectorFilth(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame, state.hectorFilthShown);
      break;
    case 'Drug Trade Dale':
      {
        // (more of it wrecked every time his truck's been through: what's standing goes crooked, then goes over, and
        // lies where it fell: see drawDaleDisarray and drawDaleRuin)
        const d = state ? state.enemies.find(e => e.type === 'boss') ?? state.deadBoss ?? undefined : undefined;
        // (each thing in the place goes when the truck gets to it on its way through, not when it sets off: the runs
        // that are over, and this one too wherever its front's already been)
        // (counted by how far each run actually got: a truck wrecked halfway leaves the far half as it was)
        const reach = d?.truckReach ?? [];
        const runsAt = (x: number) => { let n = 0; for (const r of reach) if (r >= x) n++; return n; };
        drawDaleArena(ctx, arenaLeft, arenaRight, arenaW, ceilingY, groundY, frame, runsAt);
        drawDaleRuin(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame, Math.min(1, runsAt(arenaLeft + arenaW / 2) / DALE_RUIN_PASSES));
        drawDaleDisarray(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame, runsAt);
      }
      if (state) drawDaleWalls(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame, state.enemies.find(e => e.type === 'boss') ?? state.deadBoss ?? undefined, state.doorState === 'done');
      break;
    case 'Blackout Barry':
      drawBarryLair(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame, state?.barryWreck);
      break;
    case 'Oily Oscar':
      drawOscarLair(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame);
      {
        // (more of it burned out every time his cigarette sets the oil going, up to a smoldering shell)
        const o = state ? state.enemies.find(e => e.type === 'boss') ?? state.deadBoss ?? undefined : undefined;
        drawOscarRuin(ctx, arenaLeft, arenaRight, ceilingY, groundY, frame, Math.min(1, (o?.blazes ?? 0) / OSCAR_RUIN_BLAZES));
      }
      break;
    default:
      break;
  }

  ctx.restore();
};

/* =========================================================================
 * 5. DRUG TRADE DALE: DALE'S PHARMACY, ALBUQUERQUE
 * The inside of his pharmacy: mint tile, strip lights, aisles of pills, the
 * Rx counter at the back under a neon sign. The glass front doors (left) and
 * the back wall (right) are in his delivery truck's way: the first time it
 * comes through, each of them comes down (and stays down).
 * ========================================================================= */
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// The place is drawn the way everybody in it is: an ink line round every part, each part lit along its top and left
// and shadowed along its right and bottom, in steps; tile, pegboard and ceiling as patterns; no smooth gradients.
type Ctx = CanvasRenderingContext2D;
const STOCK = ['#EF4444', '#F97316', '#FACC15', '#22C55E', '#3B82F6', '#A855F7', '#F8FAFC', '#EC4899'];

/** A panel: its colour, a lit edge top and left, a shadow right and bottom (`e` px), the ink line round it. */
const slab = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string, e = 2) => {
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(c, 0.3); ctx.fillRect(x, y, w, e); ctx.fillRect(x, y, e, h);
  ctx.fillStyle = dark(c, 0.25); ctx.fillRect(x + w - e, y, e, h); ctx.fillRect(x, y + h - e, w, e);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
};

/** Sign lettering, centered, with a drop shadow in the sign's own dark. */
const letter = (ctx: Ctx, text: string, x: number, y: number, font: string, c: string, shadow: string) => {
  ctx.font = font; ctx.textAlign = 'center';
  ctx.fillStyle = shadow; ctx.fillText(text, x + 1, y + 1);
  ctx.fillStyle = c; ctx.fillText(text, x, y);
};

/** Pegboard, the back of a shelving unit: off-white, a hole every few pixels. */
const pegboard = (ctx: Ctx, x: number, y: number, w: number, h: number) => {
  ctx.fillStyle = '#E7E5E4'; ctx.fillRect(x, y, w, h);
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = tilePattern(ctx, 'dalePeg', 10, 10, g => { g.fillStyle = '#C8C3BF'; g.fillRect(4, 4, 2, 2); g.fillStyle = '#F5F5F4'; g.fillRect(4, 6, 2, 1); });
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
};

/** A packet (`bottle` false) or a bottle of stock standing on a shelf at `base`, `w` x `h`: shaded, labeled, inked. */
const stockItem = (ctx: Ctx, x: number, base: number, w: number, h: number, c: string, bottle: boolean) => {
  const y = base - h, ly = y + Math.round(h * 0.38);
  const label = c === '#F8FAFC' ? '#60A5FA' : '#F8FAFC';
  if (!bottle) {
    slab(ctx, x, y, w, h, c, 2);
    ctx.fillStyle = label; ctx.fillRect(x + 2, ly, w - 4, 4);
    ctx.fillStyle = dark(c, 0.45); ctx.fillRect(x + 3, ly + 1, w - 7, 1); ctx.fillRect(x + 3, ly + 6, w - 6, 1);
    return;
  }
  const path = () => ctx.roundRect(x + 1, y, w - 2, h, 3);
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(c, 0.35); ctx.fillRect(x + 2, y, 2, h);
  ctx.fillStyle = dark(c, 0.28); ctx.fillRect(x + w - 4, y, 3, h);
  ctx.fillStyle = label; ctx.fillRect(x, ly, w, Math.max(4, Math.round(h * 0.3)));
  ctx.fillStyle = dark(c, 0.2); ctx.fillRect(x + 3, ly + 2, w - 6, 1);
  ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  slab(ctx, x + 2, y - 3, w - 4, 3, '#F8FAFC', 1);
};

/** A pill bottle behind the counter (amber, or a white one), its label and its white cap; on its side if `tipped`. */
const pillBottle = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string, tipped: boolean) => {
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(c, 0.35); if (tipped) ctx.fillRect(x, y + 1, w, 2); else ctx.fillRect(x + 1, y, 2, h);
  ctx.fillStyle = dark(c, 0.3); if (tipped) ctx.fillRect(x, y + h - 3, w, 2); else ctx.fillRect(x + w - 3, y, 2, h);
  ctx.fillStyle = c === '#F8FAFC' ? '#93C5FD' : '#FFFBEB';
  const ly = y + Math.round(h * 0.3), lh = Math.round(h * 0.4);
  if (tipped) ctx.fillRect(x + 3, y + 2, 7, h - 4); else ctx.fillRect(x + 1, ly, w - 2, lh);
  ctx.fillStyle = '#78716C'; if (tipped) ctx.fillRect(x + 5, y + 3, 1, h - 6); else ctx.fillRect(x + 2, ly + 2, w - 5, 1);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  if (tipped) slab(ctx, x + w - 4, y - 1, 4, h + 2, '#FFFFFF', 1);
};

/** An aisle sign, 100 x 22, centered on `cx` with its top at `y`: a lit face, a pinstripe border, shadowed lettering. */
const signBoard = (ctx: Ctx, cx: number, y: number, text: string, color: string) => {
  slab(ctx, cx - 50, y, 100, 22, color, 2);
  ctx.strokeStyle = lite(color, 0.55); ctx.lineWidth = 1; ctx.strokeRect(cx - 46.5, y + 3.5, 93, 15);
  letter(ctx, text, cx, y + 14, 'bold 6px "Press Start 2P", sans-serif', '#FFFFFF', dark(color, 0.55));
};

/** A hanging chain from (x, y0) down to y1, link by link. */
const chain = (ctx: Ctx, x: number, y0: number, y1: number) => {
  for (let y = y0, i = 0; y < y1; y += 4, i++) {
    ctx.fillStyle = '#44403C'; ctx.fillRect(x - (i % 2 ? 1 : 1.5), y, i % 2 ? 2 : 3, 4);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(x - 0.5, y + 1, 1, 1);
  }
};

/** A strip light, 110 x 8 at (x, y): the housing, the diffuser lit (or dead, the tubes showing through). */
const stripLight = (ctx: Ctx, x: number, y: number, on: boolean) => {
  slab(ctx, x, y, 110, 8, '#D6D3D1', 1);
  ctx.fillStyle = on ? '#FEFCE8' : '#A8A29E'; ctx.fillRect(x + 5, y + 2, 100, 5);
  if (on) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 5, y + 3, 100, 2); ctx.fillStyle = '#FDE68A'; ctx.fillRect(x + 5, y + 6, 100, 1); }
  else { ctx.fillStyle = '#78716C'; ctx.fillRect(x + 5, y + 3, 100, 1); ctx.fillRect(x + 5, y + 5, 100, 1); ctx.fillStyle = '#57534E'; ctx.fillRect(x + 5, y + 2, 3, 5); ctx.fillRect(x + 102, y + 2, 3, 5); }
};

/** The free blood pressure machine, 50 x 120 with its top-left at (x, y): kiosk, readout, the cuff to put your arm in. */
const bpKiosk = (ctx: Ctx, x: number, y: number) => {
  slab(ctx, x, y, 50, 120, '#1E40AF', 2);
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(x + 44, y + 4, 3, 110);
  // (the readout)
  slab(ctx, x + 6, y + 8, 38, 24, '#1E293B', 1);
  bandedGradient(ctx, x + 8, y + 10, 34, 20, ['#BFDBFE', '#93C5FD', '#60A5FA'], 3);
  ctx.font = '4px "Press Start 2P", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#1E3A8A';
  ctx.fillText('120', x + 25, y + 19); ctx.fillText('80', x + 25, y + 26);
  slab(ctx, x + 9, y + 37, 9, 5, '#22C55E', 1); slab(ctx, x + 21, y + 37, 9, 5, '#FACC15', 1); slab(ctx, x + 33, y + 37, 9, 5, '#9CA3AF', 1);
  // (the cuff)
  slab(ctx, x + 12, y + 60, 26, 26, '#DC2626', 2);
  ctx.beginPath(); ctx.ellipse(x + 25, y + 67, 8, 4, 0, 0, Math.PI * 2); ctx.fillStyle = '#450A0A'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x + 19, y + 65, 12, 1);
  letter(ctx, 'FREE', x + 25, y + 75, '4px "Press Start 2P", sans-serif', '#FFFFFF', '#7F1D1D');
  slab(ctx, x - 2, y + 114, 54, 6, '#172554', 1);
};

/** The yellow wet floor sign, its point at (x, base - 40) and its feet either side of x at `base`. */
const wetSign = (ctx: Ctx, x: number, base: number) => {
  const tri = () => { ctx.moveTo(x - 12, base); ctx.lineTo(x, base - 40); ctx.lineTo(x + 12, base); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); tri(); ctx.clip();
  ctx.fillStyle = '#FACC15'; ctx.fillRect(x - 12, base - 40, 24, 40);
  ctx.fillStyle = '#FDE68A'; ctx.fillRect(x - 12, base - 40, 9, 40);
  ctx.fillStyle = '#CA8A04'; ctx.fillRect(x + 5, base - 40, 7, 40);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(x - 12, base - 5, 24, 2);
  // (the little man going over)
  ctx.fillRect(x - 1, base - 30, 2, 2); ctx.fillRect(x - 2, base - 27, 4, 1); ctx.fillRect(x - 3, base - 26, 2, 2); ctx.fillRect(x + 1, base - 25, 3, 1);
  ctx.restore();
  ctx.beginPath(); tri(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#111'; ctx.font = '4px "Press Start 2P", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('WET', x, base - 14);
};

/**
 * How the truck's left the place, run by run (`n`: how many times it's been through): what's still standing goes
 * crooked first (a shelf leaning, the portrait askew, a sign swinging off one chain), then over it all goes, and
 * lands here: the shelving units down across the floor with their stock spilled out of them, the signs down, the
 * blood pressure machine on its side, the wet floor sign kicked over, pill bottles and boxes and baskets everywhere.
 * Nothing's taken away: it's all still there, just where a truck put it.
 */
const DALE_FALL = { gondola0: 4, gondola1: 5, signs: 4, portrait: 4, bp: 3, wet: 1 };
const daleTilt = (n: number, fallsAt: number) => (n >= fallsAt ? -1 : Math.min(1, Math.max(0, n - (fallsAt - 3)) / 2));

const drawDaleDisarray = (ctx: CanvasRenderingContext2D, left: number, right: number, top: number, bottom: number, frame: number, runsAt: (x: number) => number) => {
  if (runsAt(left) <= 0) return;
  ctx.save();
  const stock = STOCK;
  // A shelving unit down on its side across the floor, its stock spilled out in front of it
  const downShelf = (x: number, gw: number, dir: number, seed: number) => {
    const h = 54, x0 = dir > 0 ? 0 : -210;
    ctx.save(); ctx.translate(x, bottom); ctx.rotate(dir * 0.06);
    pegboard(ctx, x0, -h, 210, h);
    slab(ctx, x0, -h, 210, 5, '#A8A29E', 1);
    for (let s = 1; s < 4; s++) slab(ctx, x0 + s * 50, -h, 4, h, '#78716C', 1);
    slab(ctx, x0, -4, 210, 4, '#57534E', 1);
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x0 + 0.5, -h + 0.5, 209, h - 1);
    ctx.restore();
    for (let k = 0; k < 26; k++) {
      const hsh = hash(seed + k * 3.3);
      const bx = x + dir * (10 + hash(seed + k) * 240), bw = 8 + hsh * 8, bh = 6 + hash(seed + k + 9) * 10;
      ctx.save(); ctx.translate(bx, bottom - bh / 2 - (k % 3) * 3); ctx.rotate((hsh - 0.5) * 2.4);
      const c = stock[Math.floor(hsh * stock.length)];
      slab(ctx, -bw / 2, -bh / 2, bw, bh, c, 1);
      ctx.fillStyle = c === '#F8FAFC' ? '#60A5FA' : '#F8FAFC'; ctx.fillRect(-bw / 2 + 2, -1, bw - 4, 2);
      ctx.restore();
    }
    void gw;
  };
  if (daleTilt(runsAt(left + 150), DALE_FALL.gondola0) < 0) downShelf(left + 60, 180, 1, 11);
  if (daleTilt(runsAt(left + 345), DALE_FALL.gondola1) < 0) downShelf(left + 420, 150, -1, 29);
  // The aisle signs, down
  if (runsAt(left + 150) >= DALE_FALL.signs) {
    for (const [sx, color, text, rot] of [[left + 170, '#2563EB', 'PAIN RELIEF', 0.2], [left + 330, '#7C3AED', 'SLEEP AIDS', -0.35]] as [number, string, string, number][]) {
      ctx.save(); ctx.translate(sx, bottom - 12); ctx.rotate(rot);
      signBoard(ctx, 0, -11, text, color);
      ctx.restore();
    }
  }
  // Dale's portrait, face down on the floor, the frame cracked
  if (runsAt(left + 345) >= DALE_FALL.portrait) {
    ctx.save(); ctx.translate(left + 300, bottom - 6); ctx.rotate(0.08);
    slab(ctx, -36, -8, 72, 9, '#CA8A04', 1);
    ctx.fillStyle = '#78350F'; ctx.fillRect(-33, -8, 66, 2); ctx.fillStyle = '#92400E'; ctx.fillRect(-33, -6, 66, 1);
    ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(6, -8); ctx.lineTo(9, -4); ctx.lineTo(7, 1); ctx.stroke();
    ctx.fillStyle = '#E0F2FE'; ctx.fillRect(-42, -2, 4, 2); ctx.fillRect(38, -1, 3, 2); ctx.fillRect(28, 0, 2, 1);
    ctx.restore();
  }
  // The blood pressure machine, on its side
  if (runsAt(left + 475) >= DALE_FALL.bp) {
    ctx.save(); ctx.translate(left + 520, bottom); ctx.rotate(-Math.PI / 2 + 0.05);
    bpKiosk(ctx, 0, 0);
    ctx.restore();
  }
  // The wet floor sign, kicked over
  if (runsAt(left + 262) >= DALE_FALL.wet) {
    ctx.save(); ctx.translate(left + 230, bottom - 4); ctx.rotate(1.4);
    wetSign(ctx, 0, 0);
    ctx.restore();
  }
  // Pill bottles, boxes, baskets everywhere (more every run)
  for (let k = 0; k < 80; k++) {
    const x = left + 20 + hash(k * 7.7 + 3) * (right - left - 40), hsh = hash(k * 1.9 + 5);
    if (k >= runsAt(x) * 14) continue;
    ctx.save(); ctx.translate(x, bottom - 3 - (k % 4)); ctx.rotate((hsh - 0.5) * 3);
    if (k % 9 === 0) {
      // (a shopping basket: wire sides, a handle)
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(-10.5, -7.5, 21, 12);
      ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 2; ctx.strokeRect(-9, -6, 18, 9);
      ctx.fillStyle = '#991B1B'; ctx.fillRect(-4, -5, 1, 7); ctx.fillRect(1, -5, 1, 7); ctx.fillRect(6, -5, 1, 7); ctx.fillStyle = '#F87171'; ctx.fillRect(-9, -6, 18, 1);
      ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, -7, 6, Math.PI, 0); ctx.stroke();
    } else if (k % 3 === 0) { pillBottle(ctx, -3, -6, 6, 9, '#F59E0B', false); slab(ctx, -3, -8, 6, 2, '#FFFFFF', 1); }
    else { const c = stock[Math.floor(hsh * stock.length)]; slab(ctx, -5, -4, 10, 7, c, 1); ctx.fillStyle = c === '#F8FAFC' ? '#60A5FA' : '#F8FAFC'; ctx.fillRect(-3, -1, 6, 1); }
    ctx.restore();
  }
  // Pills spilled in drifts, glinting
  for (let k = 0; k < 160; k++) {
    const x = left + 30 + hash(k * 3.1 + 40) * (right - left - 60);
    if (k >= runsAt(x) * 26) continue;
    const px = Math.round(x), py = bottom - 2 - Math.round(hash(k + 77) * 3);
    ctx.fillStyle = ['#FDE68A', '#FFFFFF', '#F9A8D4', '#93C5FD'][k % 4]; ctx.fillRect(px, py, 2, 2);
    ctx.fillStyle = '#A16207'; ctx.fillRect(px + 1, py + 1, 1, 1);
    if ((frame + k * 11) % 90 < 3) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(px, py - 1, 1, 1); }
  }
  ctx.restore();
};

/** How many runs of the truck through the place it takes to leave it a smoldering ruin. */
const DALE_RUIN_PASSES = 6;

/**
 * Dale's pharmacy, coming apart a little more every time his truck comes through it (looks only: the fight's the
 * same). `k` 0..1, how far gone it is: cracks up the walls and tiles off them, a strip light out; then ceiling tiles
 * down with wiring hanging out of the holes and sparking, scorch up the walls, junk on the floor; then holes right
 * through the back wall with the night outside, fires along the floor; then the ceiling mostly gone, soot over
 * everything, smoke rolling under what's left of the roof, fires everywhere, embers going up.
 */
const drawDaleRuin = (ctx: CanvasRenderingContext2D, left: number, right: number, top: number, bottom: number, frame: number, k: number) => {
  if (k <= 0) return;
  const w = right - left;
  const at = (i: number, s: number) => left + 30 + hash(i * 13.7 + s) * (w - 60);
  ctx.save();
  // Cracks up the back wall (a lit lip along one side of each, the dark of it along the other)
  for (let c = 0; c < Math.round(k * 14); c++) {
    const pts: [number, number][] = [];
    let cx = at(c, 1), cy = bottom - 20 - hash(c + 4) * 200;
    pts.push([cx, cy]);
    for (let s = 0; s < 5; s++) { cx += (hash(c * 7 + s) - 0.5) * 26; cy -= 16 + hash(c + s) * 14; pts.push([cx, cy]); }
    for (const [col, dx, lw] of [['rgba(255, 255, 255, 0.5)', 1, 1], ['rgba(41, 37, 36, 0.85)', 0, 1.5]] as [string, number, number][]) {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x + dx, y) : ctx.moveTo(x + dx, y)));
      ctx.stroke();
    }
  }
  // Tiles off the wall, the plaster behind (the edge of the tiles round it throwing a shadow in)
  for (let t = 0; t < Math.round(k * 22); t++) {
    const tx = Math.round(at(t, 2) / 18) * 18, ty = bottom - 18 - Math.floor(hash(t + 9) * 9) * 18;
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(tx, ty, 18, 18);
    ctx.fillStyle = '#78716C'; ctx.fillRect(tx, ty, 18, 2); ctx.fillRect(tx, ty, 2, 18);
    ctx.fillStyle = '#D6D3D1'; ctx.fillRect(tx + 6 + Math.floor(hash(t + 3) * 8), ty + 5, 2, 1); ctx.fillRect(tx + 4, ty + 11 + Math.floor(hash(t + 5) * 4), 1, 2);
    ctx.fillStyle = '#57534E'; ctx.fillRect(tx + 10, ty + 8 + Math.floor(hash(t + 7) * 6), 2, 1);
  }
  // Scorch climbing the walls from the floor (stepped, darker at the foot)
  if (k > 0.2) {
    const h = (k - 0.2) * 360;
    for (let b = 0; b < 5; b++) { ctx.fillStyle = `rgba(28, 25, 23, ${(0.12 + b * 0.06) * Math.min(1, (k - 0.2) * 2)})`; ctx.fillRect(left, bottom - h * (1 - b / 5), w, h * (1 - b / 5)); }
  }
  // Holes through the ceiling: tiles down, the dark above, a joist across it, wiring hanging out and sparking
  const holes = k > 0.25 ? Math.round((k - 0.15) * 8) : 0;
  for (let i = 0; i < holes; i++) {
    const hx = at(i, 3), hw = 50 + hash(i + 30) * 60;
    const edge = () => { ctx.moveTo(hx - hw / 2, top); for (let s = 0; s <= 6; s++) ctx.lineTo(hx - hw / 2 + (hw / 6) * s, top + 18 + hash(i * 5 + s) * 18); ctx.lineTo(hx + hw / 2, top); };
    ctx.save(); ctx.beginPath(); edge(); ctx.closePath(); ctx.clip();
    ctx.fillStyle = '#0C0A09'; ctx.fillRect(hx - hw / 2, top, hw, 40);
    ctx.fillStyle = '#292524'; ctx.fillRect(hx - hw / 2, top + 4, hw, 5); ctx.fillStyle = '#44403C'; ctx.fillRect(hx - hw / 2, top + 4, hw, 1);
    ctx.restore();
    ctx.strokeStyle = '#78716C'; ctx.lineWidth = 2; ctx.beginPath(); edge(); ctx.stroke();
    ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(hx, top + 20); ctx.quadraticCurveTo(hx + 10, top + 50, hx + 4 + Math.sin(frame * 0.05 + i) * 3, top + 70); ctx.stroke();
    ctx.strokeStyle = '#B91C1C'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(hx - 4, top + 20); ctx.quadraticCurveTo(hx - 8, top + 38, hx - 5 + Math.sin(frame * 0.05 + i + 1) * 2, top + 50); ctx.stroke();
    ctx.fillStyle = '#B45309'; ctx.fillRect(hx + 3 + Math.round(Math.sin(frame * 0.05 + i) * 3), top + 69, 2, 2);
    if ((frame + i * 17) % 50 < 4) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(hx + 3, top + 69, 2, 2); ctx.fillStyle = '#FDE047'; ctx.fillRect(hx + 2, top + 68, 4, 1); ctx.fillRect(hx - 2, top + 72, 2, 2); ctx.fillRect(hx + 7, top + 74, 2, 2); }
  }
  // Junk on the floor: plaster, glass, pill bottles, a toppled sign
  if (k > 0.15) {
    for (let j = 0; j < Math.round(k * 30); j++) {
      const jx = at(j, 5), s = 4 + hash(j + 60) * 8;
      slab(ctx, Math.round(jx), Math.round(bottom - s), Math.round(s * 1.5), Math.round(s), ['#D6D3D1', '#78716C', '#F97316', '#E5E7EB', '#B91C1C'][j % 5], 1);
    }
  }
  // Soot over everything, and the ceiling mostly gone at the end
  if (k > 0.65) {
    const a = (k - 0.65) / 0.35;
    ctx.fillStyle = `rgba(12, 10, 9, ${0.18 * a})`; ctx.fillRect(left, top, w, bottom - top);
    ctx.fillStyle = `rgba(12, 10, 9, ${0.9 * a})`; ctx.fillRect(left, top, w, 34);
    // smoke rolling along under the roof (chunky, its edges broken up)
    for (let i = 0; i < 9; i++) {
      const sx = left + ((i * 97 + frame * (0.3 + hash(i) * 0.4)) % (w + 120)) - 60, sy = top + 30 + hash(i + 3) * 60, r = 30 + hash(i + 7) * 30;
      pixelBlob(ctx, sx, sy, r, r, `rgba(41, 37, 36, ${0.45 * a})`);
      pixelBlob(ctx, sx - r * 0.2, sy - r * 0.35, r * 0.5, r * 0.4, `rgba(68, 64, 60, ${0.35 * a})`);
    }
  }
  // Fires along the floor (more of them, bigger, the further gone it is), and embers going up off them
  const fires = k > 0.45 ? Math.round((k - 0.4) * 16) : 0;
  for (let i = 0; i < fires; i++) {
    const fx = at(i, 6), fh = 24 + hash(i + 80) * 34 * k;
    drawFire(ctx, fx, bottom, 26, fh, frame, { seed: i * 7 + 1, sparks: false, glow: 0.8 });
    ctx.fillStyle = '#FDBA74';
    for (let e = 0; e < 2; e++) { const q = ((frame * 1.5 + i * 40 + e * 70) % 140) / 140; ctx.globalAlpha = 1 - q; ctx.fillRect(Math.round(fx + Math.sin(q * 9 + i) * 10), Math.round(bottom - 10 - q * 160), 2, 2); }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
};



const drawDaleArena = (
  ctx: CanvasRenderingContext2D,
  left: number,
  right: number,
  w: number,
  top: number,
  bottom: number,
  frame: number,
  runsAt: (x: number) => number = () => 0,
) => {
  // 0. Above the ceiling: the roof's dark underside, joists, a duct on its hangers
  bandedGradient(ctx, left - 40, top - 200, w + 80, 200, ['#1C1917', '#292524', '#33302D'], 6);
  for (let x = left - 40; x < right + 40; x += 48) {
    ctx.fillStyle = '#44403C'; ctx.fillRect(x, top - 200, 10, 200);
    ctx.fillStyle = '#57534E'; ctx.fillRect(x, top - 200, 2, 200);
    ctx.fillStyle = '#1C1917'; ctx.fillRect(x + 9, top - 200, 1, 200);
  }
  bandedGradient(ctx, left - 40, top - 60, w + 80, 22, ['#A8A29E', '#8A847F', '#5E5853'], 4);
  ctx.fillStyle = INK; ctx.fillRect(left - 40, top - 61, w + 80, 1); ctx.fillRect(left - 40, top - 38, w + 80, 1);
  for (let x = left - 40; x < right + 40; x += 40) {
    ctx.fillStyle = '#57534E'; ctx.fillRect(x, top - 60, 2, 22); ctx.fillStyle = '#C8C3BF'; ctx.fillRect(x + 2, top - 60, 1, 22);
    ctx.fillStyle = '#D6D3D1'; ctx.fillRect(x + 5, top - 57, 1, 1); ctx.fillRect(x + 5, top - 43, 1, 1);
  }
  for (let x = left; x < right; x += 90) slab(ctx, x, top - 64, 6, 30, '#57534E', 1);
  // 1. The back wall: cream up top, mint tile below (each tile lit along its top, its grout, its glaze glinting)
  const tileTop = bottom - 190;
  bandedGradient(ctx, left, top, w, tileTop - top, ['#DCDFCB', '#E8EBDB', '#EEF0E2', '#F2F3E8'], 6);
  ctx.save(); ctx.translate(left, tileTop);
  ctx.fillStyle = tilePattern(ctx, 'daleTile', 18, 18, g => {
    g.fillStyle = '#D3ECE2'; g.fillRect(0, 0, 18, 18);
    g.fillStyle = '#9ED3C0'; g.fillRect(1, 1, 16, 16);
    g.fillStyle = '#C0E5D7'; g.fillRect(1, 1, 16, 1); g.fillRect(1, 1, 1, 16);
    g.fillStyle = '#84BFAA'; g.fillRect(16, 2, 1, 15); g.fillRect(2, 16, 15, 1);
    g.fillStyle = '#E6F6EF'; g.fillRect(3, 3, 2, 2); g.fillRect(5, 3, 1, 1);
  });
  ctx.fillRect(0, 0, w, bottom - tileTop);
  ctx.restore();
  hazeBands(ctx, left, bottom - 48, w, 48, '#1F5C4D', 0, 0.22, 4);
  slab(ctx, left, tileTop - 6, w, 6, '#2F7D6A', 1);

  // 2. The ceiling: drop tiles (speckled, darker toward the back), their grid, and strip lights (one on the blink)
  bandedGradient(ctx, left, top, w, 34, ['#BDB8B3', '#D0CCC8', '#DDDAD7'], 4);
  ctx.fillStyle = tilePattern(ctx, 'daleCeil', 14, 10, g => { g.fillStyle = '#ACA6A1'; for (const [a, b] of [[1, 2], [6, 1], [10, 6], [3, 7], [12, 3], [8, 8]]) g.fillRect(a, b, 1, 1); });
  ctx.fillRect(left, top, w, 34);
  for (let x = left; x < right; x += 60) { ctx.fillStyle = '#8A847F'; ctx.fillRect(x, top, 2, 34); ctx.fillStyle = '#F5F5F4'; ctx.fillRect(x + 2, top, 1, 34); }
  ctx.fillStyle = '#F5F5F4'; ctx.fillRect(left, top + 31, w, 2); ctx.fillStyle = '#78716C'; ctx.fillRect(left, top + 33, w, 1);
  const shining: number[] = [];
  for (let i = 0; i < 4; i++) {
    const lx = left + 70 + i * 170;
    // (knocked loose by the runs through: more of them out, hanging off one end, swinging)
    const runs = runsAt(lx + 55);
    const loose = runs >= 1 + i;
    const on = !(i === 2 && Math.floor(frame / 9) % 11 < 2) && !(runs >= 2 + i * 2);
    if (loose) {
      ctx.save(); ctx.translate(lx, top + 36); ctx.rotate(0.5 + Math.sin(frame * 0.05 + i) * 0.08);
      stripLight(ctx, 0, -4, on);
      ctx.restore();
      if (on && (frame + i * 13) % 37 < 3) { ctx.fillStyle = '#FDE047'; ctx.fillRect(lx + 4, top + 40, 3, 3); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(lx + 5, top + 41, 1, 1); }
      continue;
    }
    stripLight(ctx, lx, top + 34, on);
    if (on) {
      shining.push(lx);
      // (its pool of light down the wall, in steps)
      for (let k = 0; k < 5; k++) {
        const a = 0.32 * (1 - k / 5), y0 = top + 42 + k * 43.6, y1 = y0 + 43.6, s0 = k / 5, s1 = (k + 1) / 5;
        ctx.fillStyle = `rgba(254, 252, 232, ${a.toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(lx - 40 * s0, y0); ctx.lineTo(lx + 110 + 40 * s0, y0); ctx.lineTo(lx + 110 + 40 * s1, y1); ctx.lineTo(lx - 40 * s1, y1); ctx.fill();
      }
    }
  }

  // 3. Hanging signs down the aisles
  const hangSign = (x: number, text: string, color: string) => {
    // (swinging off one chain once it's been hit, down on the floor after: see drawDaleDisarray)
    const runs = runsAt(x);
    if (runs >= DALE_FALL.signs) return;
    if (runs >= 2) {
      ctx.save(); ctx.translate(x + 30, top + 34); ctx.rotate(0.6 + Math.sin(frame * 0.06) * 0.1);
      chain(ctx, 0, 0, 26);
      signBoard(ctx, -30, 26, text, color);
      ctx.restore();
      return;
    }
    chain(ctx, x - 30, top + 34, top + 60); chain(ctx, x + 30, top + 34, top + 60);
    signBoard(ctx, x, top + 60, text, color);
  };
  hangSign(left + 150, 'PAIN RELIEF', '#2563EB');
  hangSign(left + 340, 'SLEEP AIDS', '#7C3AED');

  // 4. The aisles: shelves of boxes and bottles
  const gondola = (x: number, gw: number, fallsAt: number, dir: number) => {
    // (leaning more every run, then over: it's down on the floor, see drawDaleDisarray; a clean patch on the wall
    // where it stood)
    const runs = runsAt(x + gw / 2);
    const lean = daleTilt(runs, fallsAt);
    if (lean < 0) { ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; ctx.fillRect(x, bottom - 214, gw, 214); return; }
    ctx.save();
    if (lean > 0) { const px = dir > 0 ? x + gw : x; ctx.translate(px, bottom); ctx.rotate(dir * lean * 0.22); ctx.translate(-px, -bottom); }
    pegboard(ctx, x, bottom - 210, gw, 210);
    for (let s = 0; s < 4; s++) {
      const sy = bottom - 200 + s * 50;
      for (let k = 0; k < Math.floor((gw - 12) / 16); k++) {
        const hsh = hash(x + s * 31 + k * 7);
        const bx = x + 8 + k * 16, bh = 18 + hsh * 18;
        // (shaken off the shelves, more of the stock gone every run)
        if (hash(x + s * 13 + k * 3) < runs * 0.15) continue;
        stockItem(ctx, bx, sy + 40, 12, bh, STOCK[Math.floor(hsh * 8)], hsh <= 0.5);
      }
      // (the shelf, its price strip, the shade under it)
      slab(ctx, x + 4, sy + 40, gw - 8, 4, '#78716C', 1);
      ctx.fillStyle = '#FEF9C3'; for (let t = x + 14; t < x + gw - 16; t += 32) ctx.fillRect(t, sy + 41, 7, 2);
      ctx.fillStyle = 'rgba(41, 37, 36, 0.16)'; ctx.fillRect(x + 4, sy + 44, gw - 8, 3);
    }
    slab(ctx, x, bottom - 210, 4, 210, '#A8A29E', 1); slab(ctx, x + gw - 4, bottom - 210, 4, 210, '#A8A29E', 1);
    slab(ctx, x, bottom - 214, gw, 6, '#A8A29E', 1);
    slab(ctx, x, bottom - 6, gw, 6, '#57534E', 1);
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, bottom - 213.5, gw - 1, 213);
    ctx.fillStyle = '#57534E'; ctx.fillRect(x + gw / 2 - 14, bottom - 216, 1, 2); ctx.fillRect(x + gw / 2 + 13, bottom - 216, 1, 2);
    slab(ctx, x + gw / 2 - 20, bottom - 232, 40, 16, '#DC2626', 2);
    letter(ctx, 'SALE!', x + gw / 2, bottom - 221, 'bold 5px "Press Start 2P", sans-serif', '#FFFFFF', '#7F1D1D');
    ctx.restore();
  };
  gondola(left + 60, 180, DALE_FALL.gondola0, 1);
  gondola(left + 270, 150, DALE_FALL.gondola1, -1);

  // 5. The pharmacy counter at the back: pill shelves, Rx, a neon sign, Dale's face
  const cx = right - 290, cw = 250;
  const counterRuns = runsAt(cx + cw / 2);
  slab(ctx, cx, bottom - 290, cw, 200, '#F5F5F4', 3);
  ctx.fillStyle = '#E7E5E4'; ctx.fillRect(cx + 8, bottom - 282, cw - 16, 190);
  for (let s = 0; s < 4; s++) {
    ctx.fillStyle = 'rgba(41, 37, 36, 0.1)'; ctx.fillRect(cx + 8, bottom - 282 + s * 40, cw - 16, 4);
    for (let k = 0; k < 14; k++) {
      // (knocked off the shelves, more every run; the ones left tipped over)
      if (hash(k * 5 + s * 11 + 3) < counterRuns * 0.13) continue;
      const tip = hash(k + s * 7 + 1) < counterRuns * 0.1;
      const c = hash(k + s * 20) > 0.3 ? '#F59E0B' : '#F8FAFC';
      if (tip) { pillBottle(ctx, cx + 12 + k * 16, bottom - 256 + s * 40, 16, 10, c, true); continue; }
      pillBottle(ctx, cx + 14 + k * 16, bottom - 266 + s * 40, 10, 16, c, false);
      slab(ctx, cx + 14 + k * 16, bottom - 270 + s * 40, 10, 4, '#FFFFFF', 1);
    }
    slab(ctx, cx + 10, bottom - 250 + s * 40, cw - 20, 3, '#A8A29E', 1);
  }
  // The neon: a dark raceway behind it, the tubes in their glow (in steps), dead when it flickers out
  const neon = Math.floor(frame / 50) % 9 !== 0;
  ctx.fillStyle = '#44403C'; ctx.fillRect(cx + 26, bottom - 304, cw - 52, 3); ctx.fillStyle = '#78716C'; ctx.fillRect(cx + 26, bottom - 304, cw - 52, 1);
  ctx.font = 'bold 18px "Press Start 2P", sans-serif'; ctx.textAlign = 'center';
  const tx = cx + cw / 2, ty = bottom - 306;
  if (neon) {
    ctx.lineJoin = 'round';
    for (const [lw, a] of [[10, 0.1], [6, 0.18], [3, 0.3]] as [number, number][]) {
      ctx.strokeStyle = `rgba(74, 222, 128, ${a})`; ctx.lineWidth = lw; ctx.strokeText('PHARMACY', tx, ty);
      ctx.fillStyle = `rgba(74, 222, 128, ${a})`; ctx.fillRect(cx - 34 - lw, bottom - 330 - lw, 10 + lw * 2, 30 + lw * 2); ctx.fillRect(cx - 44 - lw, bottom - 320 - lw, 30 + lw * 2, 10 + lw * 2);
    }
  }
  ctx.fillStyle = neon ? '#4ADE80' : '#14532D';
  ctx.fillText('PHARMACY', tx, ty);
  ctx.fillRect(cx - 34, bottom - 330, 10, 30); ctx.fillRect(cx - 44, bottom - 320, 30, 10);
  if (!neon) { ctx.strokeStyle = '#052E16'; ctx.lineWidth = 1; ctx.strokeText('PHARMACY', tx, ty); }
  ctx.fillStyle = neon ? '#DCFCE7' : '#166534'; ctx.fillRect(cx - 30, bottom - 327, 2, 24); ctx.fillRect(cx - 41, bottom - 316, 24, 2);
  slab(ctx, cx + 20, bottom - 120, 70, 20, '#1D4ED8', 2); slab(ctx, cx + 150, bottom - 120, 70, 20, '#B91C1C', 2);
  letter(ctx, 'DROP OFF', cx + 55, bottom - 107, 'bold 6px "Press Start 2P", sans-serif', '#FFFFFF', '#1E3A8A');
  letter(ctx, 'PICK UP', cx + 185, bottom - 107, 'bold 6px "Press Start 2P", sans-serif', '#FFFFFF', '#7F1D1D');
  // The counter itself: laminate front in panels, the purple top, a till on it
  slab(ctx, cx - 10, bottom - 90, cw + 20, 90, '#E7E5E4', 2);
  for (let k = 1; k < 5; k++) { const px = Math.round(cx - 10 + (k * (cw + 20)) / 5); ctx.fillStyle = '#A8A29E'; ctx.fillRect(px, bottom - 80, 1, 74); ctx.fillStyle = '#FAFAF9'; ctx.fillRect(px + 1, bottom - 80, 1, 74); }
  ctx.fillStyle = 'rgba(41, 37, 36, 0.18)'; ctx.fillRect(cx - 8, bottom - 80, cw + 16, 4);
  slab(ctx, cx - 10, bottom - 90, cw + 20, 10, '#6D28D9', 2);
  slab(ctx, cx - 10, bottom - 6, cw + 20, 6, '#A8A29E', 1);
  slab(ctx, cx + 108, bottom - 104, 30, 14, '#44403C', 2);
  ctx.fillStyle = '#86EFAC'; ctx.fillRect(cx + 112, bottom - 101, 14, 4); ctx.fillStyle = '#A8A29E'; for (let k = 0; k < 3; k++) ctx.fillRect(cx + 113 + k * 4, bottom - 95, 2, 2);
  ctx.font = 'bold 26px serif'; ctx.textAlign = 'center';
  ctx.fillStyle = '#C4B5FD'; ctx.fillText('Rx', cx + cw / 2 - 1, bottom - 37);
  ctx.fillStyle = '#4C1D95'; ctx.fillText('Rx', cx + cw / 2, bottom - 36);
  // Dale's framed portrait (crooked after a run or two; down on the floor after that, a clean patch where it hung)
  const px = left + 345;
  const portraitRuns = runsAt(px);
  if (portraitRuns >= DALE_FALL.portrait) { ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'; ctx.fillRect(px - 30, bottom - 330, 60, 72); ctx.fillStyle = '#57534E'; ctx.fillRect(px - 1, bottom - 336, 2, 4); }
  else {
  ctx.save(); if (portraitRuns >= 1) { ctx.translate(px, bottom - 334); ctx.rotate(0.12 * Math.min(portraitRuns, 3)); ctx.translate(-px, -(bottom - 334)); }
  const y = bottom - 330;
  // (the gilt frame, bevelled, its inner lip)
  ctx.fillStyle = '#CA8A04'; ctx.fillRect(px - 30, y, 60, 72);
  ctx.fillStyle = '#FDE047'; ctx.fillRect(px - 30, y, 60, 2); ctx.fillRect(px - 30, y, 2, 72);
  ctx.fillStyle = '#854D0E'; ctx.fillRect(px + 28, y, 2, 72); ctx.fillRect(px - 30, y + 70, 60, 2);
  ctx.fillStyle = '#FEF08A'; for (const [a, b] of [[-28, 2], [25, 2], [-28, 67], [25, 67]]) ctx.fillRect(px + a, y + b, 3, 3);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(px - 29.5, y + 0.5, 59, 71);
  // (the studio backdrop, the glow behind him)
  ctx.save(); ctx.beginPath(); ctx.rect(px - 24, y + 6, 48, 60); ctx.clip();
  bandedGradient(ctx, px - 24, y + 6, 48, 60, ['#2E1065', '#5B21B6', '#4C1D95'], 4);
  steppedGlow(ctx, px, y + 30, 26, '#A78BFA', 0.45, 0.05, 4);
  // (the suit, the open shirt, the chain)
  ink(ctx, () => { ctx.moveTo(px - 28, y + 68); ctx.lineTo(px - 23, y + 49); ctx.lineTo(px - 7, y + 44); ctx.lineTo(px + 7, y + 44); ctx.lineTo(px + 23, y + 49); ctx.lineTo(px + 28, y + 68); ctx.closePath(); }, '#8E44AD');
  ctx.fillStyle = '#5B2C6F'; ctx.fillRect(px + 14, y + 50, 8, 18);
  ink(ctx, () => { ctx.moveTo(px - 6, y + 44); ctx.lineTo(px + 6, y + 44); ctx.lineTo(px, y + 57); ctx.closePath(); }, '#FFFFFF');
  ink(ctx, () => { ctx.moveTo(px - 7, y + 44); ctx.lineTo(px - 12, y + 49); ctx.lineTo(px - 2, y + 58); ctx.closePath(); }, '#A569BD');
  ink(ctx, () => { ctx.moveTo(px + 7, y + 44); ctx.lineTo(px + 12, y + 49); ctx.lineTo(px + 2, y + 58); ctx.closePath(); }, '#A569BD');
  ctx.fillStyle = '#EDC3A0'; ctx.fillRect(px - 4, y + 38, 8, 8);
  ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px - 4, y + 45); ctx.quadraticCurveTo(px, y + 53, px + 4, y + 45); ctx.stroke();
  ink(ctx, () => ctx.arc(px, y + 52, 2, 0, Math.PI * 2), '#FFD700', 0.8);
  // (the head: ears, the face shaded, the pompadour, pink aviators, the gold-tooth grin)
  ink(ctx, () => ctx.arc(px - 11, y + 30, 2.5, 0, Math.PI * 2), '#BB8F6E');
  ink(ctx, () => ctx.arc(px + 11, y + 30, 2.5, 0, Math.PI * 2), '#BB8F6E');
  shaded(ctx, () => ctx.arc(px, y + 30, 11, 0, Math.PI * 2), '#EDC3A0', px - 11, y + 19, 22, 22);
  ink(ctx, () => { ctx.moveTo(px - 11, y + 27); ctx.quadraticCurveTo(px - 14, y + 13, px - 2, y + 12); ctx.quadraticCurveTo(px + 15, y + 9, px + 12, y + 26); ctx.lineTo(px + 9, y + 21); ctx.lineTo(px - 8, y + 22); ctx.closePath(); }, '#111111');
  ctx.fillStyle = '#4B5563'; ctx.fillRect(px - 5, y + 14, 6, 1); ctx.fillRect(px - 7, y + 16, 3, 1);
  ctx.fillStyle = '#111111'; ctx.fillRect(px - 9, y + 24, 6, 1); ctx.fillRect(px + 3, y + 24, 6, 1);
  for (const ex of [px - 5, px + 5]) {
    ink(ctx, () => ctx.ellipse(ex, y + 28, 4.2, 3.2, 0, 0, Math.PI * 2), '#111111', 0.8);
    ctx.fillStyle = '#FF007F'; ctx.fillRect(ex - 3, y + 26, 4, 1); ctx.fillStyle = '#00F0FF'; ctx.fillRect(ex - 2, y + 29, 3, 1);
  }
  ctx.fillStyle = '#111111'; ctx.fillRect(px - 1, y + 27, 2, 1);
  ctx.fillStyle = '#BB8F6E'; ctx.fillRect(px, y + 31, 2, 2);
  ink(ctx, () => { ctx.moveTo(px - 5, y + 35); ctx.quadraticCurveTo(px, y + 40, px + 5, y + 35); ctx.closePath(); }, '#FFFFFF', 0.8);
  ctx.fillStyle = '#FFD700'; ctx.fillRect(px + 1, y + 35, 2, 2);
  ctx.restore();
  // (the nameplate)
  slab(ctx, px - 22, y + 57, 44, 13, '#292524', 1);
  ctx.strokeStyle = '#CA8A04'; ctx.lineWidth = 1; ctx.strokeRect(px - 20.5, y + 58.5, 41, 10);
  ctx.fillStyle = '#FDE047'; ctx.font = '4px "Press Start 2P", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('PHARMACIST', px, bottom - 268); ctx.fillText('OF EVERY MONTH', px, bottom - 262);
  ctx.restore();
  }

  // 6. Odds and ends: a blood pressure machine, a security mirror, a wet floor sign
  const bpx = left + 450;
  if (runsAt(bpx + 25) < DALE_FALL.bp) bpKiosk(ctx, bpx, bottom - 120);
  const mx = right - 30, my = top + 70;
  slab(ctx, mx - 3, my - 30, 6, 9, '#78716C', 1);
  ink(ctx, () => ctx.arc(mx, my, 22, 0, Math.PI * 2), '#D1D5DB');
  ctx.strokeStyle = '#F9FAFB'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(mx, my, 20, Math.PI * 0.95, Math.PI * 1.6); ctx.stroke();
  ctx.strokeStyle = '#9CA3AF'; ctx.beginPath(); ctx.arc(mx, my, 20, Math.PI * 0.05, Math.PI * 0.6); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.arc(mx, my, 18, 0, Math.PI * 2); ctx.clip();
  bandedGradient(ctx, mx - 18, my - 18, 36, 36, ['#E2E8F0', '#B4C0CF', '#7C8BA0', '#526075'], 5);
  // (the shop in it, bent round: the strip of ceiling, a shelf, the floor)
  ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(mx, my + 34, 40, Math.PI * 1.25, Math.PI * 1.75); ctx.stroke();
  ctx.strokeStyle = '#A855F7'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(mx, my + 24, 22, Math.PI * 1.2, Math.PI * 1.45); ctx.stroke();
  ctx.strokeStyle = '#EF4444'; ctx.beginPath(); ctx.arc(mx, my + 24, 22, Math.PI * 1.55, Math.PI * 1.8); ctx.stroke();
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(mx, my - 26, 40, Math.PI * 0.3, Math.PI * 0.7); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(mx, my, 18, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(mx - 10, my - 11, 3, 3); ctx.fillRect(mx - 6, my - 13, 1, 1);
  if (runsAt(right - 30) >= 2) { ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; for (let c = 0; c < 5; c++) { const a = c * 1.3; ctx.beginPath(); ctx.moveTo(right - 34, top + 66); ctx.lineTo(right - 34 + Math.cos(a) * 18, top + 66 + Math.sin(a) * 18); ctx.stroke(); } }
  if (runsAt(left + 262) < DALE_FALL.wet) wetSign(ctx, left + 262, bottom);

  // 7. The floor: checkerboard linoleum, waxed (each tile lit along its top, the strip lights shining in it), the slab under it
  bandedGradient(ctx, left - 40, bottom, w + 80, 70, ['#57534E', '#44403C', '#292524'], 4);
  ctx.fillStyle = '#78716C'; ctx.fillRect(left - 40, bottom, w + 80, 4);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(left - 40, bottom, w + 80, 1);
  for (let x = left, k = 0; x < right; x += 16, k++) {
    for (let r = 0; r < 2; r++) {
      const y = bottom - 14 + r * 7, dk = r === k % 2;
      ctx.fillStyle = dk ? '#6B7280' : '#F5F5F4'; ctx.fillRect(x, y, 16, 7);
      ctx.fillStyle = dk ? '#9CA3AF' : '#FFFFFF'; ctx.fillRect(x, y, 16, 1);
      ctx.fillStyle = dk ? '#4B5563' : '#D6D3D1'; ctx.fillRect(x, y + 6, 16, 1); ctx.fillRect(x + 15, y, 1, 7);
    }
  }
  for (const lx of shining) checker(ctx, lx + 10, bottom - 12, 90, 4, 'rgba(255, 255, 255, 0.45)');
  ctx.textAlign = 'left';
};

/**
 * The pharmacy's front doors (left) and back wall (right), over the arena's own walls: standing, cracking as the
 * truck's about to hit, blowing apart (glass and aluminum, or brick and plaster, flying, a cloud of dust), then a
 * ragged hole with the night outside and rubble along the bottom. (Only once the door's shut behind Meathead: till
 * then the way in is the way in.)
 */
const drawDaleWalls = (ctx: CanvasRenderingContext2D, left: number, right: number, top: number, bottom: number, frame: number, boss: Enemy | undefined, doorShut: boolean) => {
  if (!boss) return;
  const lx = left - 40, rx = right;
  const outside = (x: number, w: number, y1: number) => {
    bandedGradient(ctx, x, y1, w, bottom - y1, ['#2E1A55', '#5A2A62', '#A8406E', '#D07068', '#F4A261'], 10);
  };
  /** An end wall, 40 wide: plaster, its inner face (`face` x) in shadow, the ink line where it meets the room. */
  const endWall = (x: number, face: number, inner: number) => {
    ctx.fillStyle = '#E7E5E4'; ctx.fillRect(x, top, 40, bottom - top);
    ctx.fillStyle = '#F5F5F4'; ctx.fillRect(x + (face > x ? 2 : 8), top, 2, bottom - top);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(face, top, 6, bottom - top);
    ctx.fillStyle = '#78716C'; ctx.fillRect(face + (face > x ? 0 : 5), top, 1, bottom - top);
    ctx.fillStyle = INK; ctx.fillRect(inner, top, 1, bottom - top);
  };
  // --- The front doors
  if (doorShut) {
    const down = boss.leftWallDownAt;
    endWall(lx, lx + 34, lx + 39);
    const dy = bottom - 180;
    if (down === undefined) {
      // Sliding glass doors, ENTER and all (the evening through them, the glass catching the shop's lights)
      slab(ctx, lx, dy, 40, 180, '#9CA3AF', 2);
      bandedGradient(ctx, lx + 4, dy + 6, 32, 174, ['#4A2F6E', '#7A4374', '#B86A7A', '#D9937A'], 6);
      hazeBands(ctx, lx + 4, dy + 6, 32, 174, '#BFDBFE', 0.45, 0.25, 4);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath(); ctx.moveTo(lx + 8, dy + 72); ctx.lineTo(lx + 22, dy + 12); ctx.lineTo(lx + 27, dy + 12); ctx.lineTo(lx + 13, dy + 72); ctx.fill();
      ctx.beginPath(); ctx.moveTo(lx + 16, dy + 160); ctx.lineTo(lx + 33, dy + 100); ctx.lineTo(lx + 35, dy + 100); ctx.lineTo(lx + 18, dy + 160); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(lx + 3.5, dy + 5.5, 33, 175);
      slab(ctx, lx + 6, dy + 104, 28, 4, '#D1D5DB', 1);
      slab(ctx, lx + 6, dy + 80, 28, 10, '#16A34A', 1);
      ctx.fillStyle = '#FFFFFF'; ctx.font = '4px "Press Start 2P", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ENTER', lx + 20, dy + 87); ctx.textAlign = 'left';
    } else {
      // Gone, and a lot more than the doors: the truck's taken the front of the place out to well over head height,
      // a ragged hole up the wall with the night outside, brick showing round its edges, chunks of it still coming
      // down after, and the glass and the wall in a heap across the floor
      const t = frame - (boss.leftThroughAt ?? down);
      const n = Math.max(1, boss.leftThroughs ?? 1);
      // (bigger every time it's come through: higher up the wall, further into the shop)
      const hy = bottom - Math.min(380, 330 + (n - 1) * 15);
      const W = Math.min(190, 130 + (n - 1) * 15);
      drawBreach(ctx, lx, W, hy, top, bottom, 1, n, outside);
      // (the door frame, bent over in the hole, a few teeth of glass still in it)
      ctx.save(); ctx.translate(lx + 34, dy - 20); ctx.rotate(0.5); slab(ctx, 0, 0, 5, 110, '#9CA3AF', 1); ctx.restore();
      ctx.save(); ctx.translate(lx + 4, dy + 40); ctx.rotate(-0.3); slab(ctx, 0, 0, 4, 70, '#9CA3AF', 1); ctx.restore();
      for (let k = 0; k < 4; k++) {
        const tooth = () => { ctx.moveTo(lx + k * 10, dy + 2); ctx.lineTo(lx + k * 10 + 8, dy + 2); ctx.lineTo(lx + k * 10 + 3, dy + 14 + hash(k) * 24); ctx.closePath(); };
        ctx.beginPath(); tooth(); ctx.fillStyle = 'rgba(191, 219, 254, 0.8)'; ctx.fill(); ctx.strokeStyle = '#E0F2FE'; ctx.lineWidth = 1; ctx.stroke();
      }
      // (chunks of the wall over it letting go, one after another, for a while after)
      for (let k = 0; k < 5; k++) {
        const t0 = 8 + k * 14, u = t - t0;
        if (u < 0) { slab(ctx, lx + 4 + (k % 3) * 11, hy + 2 + (k % 2) * 6, 12, 9, '#D6D3D1', 1); continue; }
        const y = Math.min(bottom - 10, hy + 6 + 0.45 * u * u);
        ctx.save(); ctx.translate(lx + 8 + (k % 3) * 11 + u * 0.6, y); if (y < bottom - 10) ctx.rotate(u * 0.15);
        slab(ctx, -6, -4, 12, 9, k % 2 ? '#B91C1C' : '#D6D3D1', 1); ctx.restore();
      }
      // (glass glittering in the heap)
      for (let k = 0; k < 12; k++) { ctx.fillStyle = 'rgba(191, 219, 254, 0.8)'; ctx.fillRect(lx + 20 + k * 11, bottom - 4 - (k % 2) * 2, 4, 2); if ((frame + k * 23) % 80 < 4) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(lx + 21 + k * 11, bottom - 5 - (k % 2) * 2, 1, 1); } }
      burst(ctx, t, lx + 20, dy + 90, 1, bottom, 'glass');
      burst(ctx, t - 3, lx + 20, hy + 120, 1, bottom, 'brick');
      burst(ctx, t - 6, lx + 80, hy + 200, 1, bottom, 'brick');
    }
  }
  // --- The back wall (the truck coming at it: it bulges and cracks just before)
  const down = boss.rightWallDownAt;
  if (down === undefined) {
    const front = boss.truckActive && boss.truckX !== undefined ? boss.truckX + 350 : -1e9;
    const k = Math.max(0, Math.min(1, (front - (rx - 110)) / 110));
    ctx.save(); if (k > 0) ctx.translate((Math.random() - 0.5) * k * 4, 0);
    endWall(rx, rx, rx);
    // The staff door: steel, a panel, a kick plate, the handle, the sign
    slab(ctx, rx + 4, bottom - 150, 32, 150, '#78716C', 2);
    ctx.strokeStyle = '#57534E'; ctx.lineWidth = 1; ctx.strokeRect(rx + 9.5, bottom - 108.5, 21, 50); ctx.strokeStyle = '#A8A29E'; ctx.strokeRect(rx + 10.5, bottom - 107.5, 21, 50);
    slab(ctx, rx + 6, bottom - 20, 28, 14, '#A8A29E', 1);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(rx + 7, bottom - 80, 6, 2); ink(ctx, () => ctx.arc(rx + 9, bottom - 76, 2.5, 0, Math.PI * 2), '#D4A017', 0.8);
    slab(ctx, rx + 6, bottom - 130, 28, 14, '#FACC15', 1);
    ctx.fillStyle = '#111827'; ctx.font = '3px "Press Start 2P", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('EMPLOYEES', rx + 20, bottom - 124); ctx.fillText('ONLY', rx + 20, bottom - 119); ctx.textAlign = 'left';
    if (k > 0) {
      ctx.strokeStyle = '#44403C'; ctx.lineWidth = 1.5;
      for (let c = 0; c < Math.ceil(k * 6); c++) { ctx.beginPath(); ctx.moveTo(rx + 4, bottom - 80); ctx.lineTo(rx + 4 + hash(c) * 30, bottom - 80 + (hash(c + 5) - 0.5) * 160); ctx.stroke(); }
    }
    ctx.restore();
  } else {
    // A ragged hole right through it, bigger every time the truck's been out through it, the night outside, brick in
    // its edges, the wall and ceiling over it coming down after, a heap of it across the floor
    const t = frame - (boss.rightThroughAt ?? down);
    const n = Math.max(1, boss.rightThroughs ?? 1);
    const ry = bottom - Math.min(320, 190 + (n - 1) * 25);
    const RW = Math.min(150, 50 + (n - 1) * 20);
    endWall(rx, rx, rx);
    drawBreach(ctx, rx + 40, RW, ry, top, bottom, -1, n, outside);
    burst(ctx, t, rx + 20, ry + 90, -1, bottom, 'brick');
    burst(ctx, t - 4, rx - 30, ry + 150, -1, bottom, 'brick');
  }
};

/**
 * A hole the truck's torn through an end of the shop: from the wall (`edgeX`, the outside face) in toward the middle
 * (`dir` +1 from the left, -1 from the right), `w` across at the floor and up to `hy`, ragged all round, the night
 * outside through it, brick in its torn edges; and the wall, plaster, shelving and glass of it in a heap across the
 * floor, more of it the more times (`n`) it's been through.
 */
const drawBreach = (ctx: CanvasRenderingContext2D, edgeX: number, w: number, hy: number, top: number, bottom: number, dir: number, n: number,
  outside: (x: number, w: number, y1: number) => void) => {
  const X = (d: number) => edgeX + dir * d;
  const reachAt = (y: number) => 40 + (w - 40) * Math.min(1, (y - hy) / 160) - hash(Math.floor(y / 14) + 70 + n) * 26;
  const hole = () => {
    ctx.beginPath(); ctx.moveTo(X(0), hy);
    for (let k = 0; k <= 10; k++) ctx.lineTo(X(k * 4), hy + 6 + hash(k + 60 + n) * 26);
    for (let y = hy + 20; y <= bottom; y += 14) ctx.lineTo(X(reachAt(y)), y);
    ctx.lineTo(X(0), bottom); ctx.closePath();
  };
  ctx.save();
  hole(); ctx.clip();
  outside(Math.min(X(0), X(w + 10)), w + 10, hy);
  ctx.restore();
  hole(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
  void top;
  // (brick in the torn edges)
  for (let k = 0; k < 9; k++) slab(ctx, Math.min(X((k % 3) * 13), X((k % 3) * 13 + 11)), hy + 4 + Math.floor(k / 3) * 7 + (k % 2) * 3, 11, 5, '#B91C1C', 1);
  for (let y = hy + 24; y < bottom - 20; y += 14) { const ex = X(reachAt(y)); slab(ctx, ex - 2, y, 10, 5, '#991B1B', 1); if (hash(y + n) > 0.5) slab(ctx, ex + dir * 4, y + 6, 8, 4, '#991B1B', 1); }
  for (let y = hy + 30; y < bottom - 30; y += 28) { const ex = X(reachAt(y)); slab(ctx, ex + dir * 6, y - 3, 6, 10, '#D6D3D1', 1); }
  // (the heap across the floor, deeper and wider every run)
  const heap = Math.min(w + 60, 120 + n * 50);
  for (let d = 0; d < heap; d += 9) {
    const hgt = 8 + (1 - d / heap) * (6 + n * 4) + (Math.floor(d / 9) % 3) * 3, x = Math.min(X(d), X(d + 10));
    ctx.fillStyle = '#78716C'; ctx.fillRect(x, bottom - hgt, 10, hgt);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(x, bottom - hgt, 10, 2); ctx.fillStyle = '#57534E'; ctx.fillRect(x, bottom - hgt + 2, 1, hgt - 2);
    ctx.fillStyle = INK; ctx.fillRect(x, bottom - hgt - 1, 10, 1);
  }
  for (let d = 4; d < heap; d += 11) slab(ctx, Math.min(X(d), X(d + 9)), bottom - 12 - (1 - d / heap) * (4 + n * 4) - (Math.floor(d / 11) % 2) * 5, 9, 6, '#D6D3D1', 1);
  for (let d = 8; d < heap; d += 13) slab(ctx, Math.min(X(d), X(d + 9)), bottom - 10 - (1 - d / heap) * (3 + n * 3) - (Math.floor(d / 13) % 2) * 4, 9, 5, '#B91C1C', 1);
  // (a toppled shelf and pills spilled, once it's been through a few times)
  if (n >= 3) {
    ctx.save(); ctx.translate(X(w * 0.6), bottom - 14); ctx.rotate(dir * 0.25);
    slab(ctx, -50, -10, 100, 12, '#E7E5E4', 2); slab(ctx, -50, 0, 100, 3, '#A8A29E', 1);
    ctx.restore();
    for (let k = 0; k < 10; k++) { ctx.fillStyle = '#F97316'; ctx.fillRect(X(w * 0.4 + k * 9), bottom - 4 - (k % 2) * 2, 4, 3); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(X(w * 0.4 + k * 9), bottom - 4 - (k % 2) * 2, 4, 1); }
  }
};

/**
 * The wall coming apart, t frames after the hit: bits flying the way the truck's going and landing on the floor, a
 * cloud of dust rolling out and settling. (Worked out from t, so it plays the same however it's drawn.)
 */
const burst = (ctx: CanvasRenderingContext2D, t: number, x: number, y: number, dir: number, floor: number, kind: 'glass' | 'brick') => {
  if (t < 0 || t > 120) return;
  // The flash of the hit (in rings)
  if (t < 5) { const a = 0.8 - t * 0.15; steppedGlow(ctx, x, y, 90, '#FFFFFF', a, a * 0.35, 4); }
  // Bits flying
  for (let i = 0; i < 22; i++) {
    const vx = dir * (2 + hash(i) * 9) - 1.5, vy = -(3 + hash(i + 50) * 9);
    const px = x + vx * t, py = Math.min(floor - 4, y - 60 + hash(i + 9) * 120 + vy * t + 0.3 * t * t);
    ctx.save(); ctx.translate(px, py);
    if (py < floor - 4) ctx.rotate(t * (0.2 + hash(i + 3) * 0.3));
    if (kind === 'glass') {
      const metal = i % 3 === 0;
      ctx.beginPath(); ctx.moveTo(-5, -4); ctx.lineTo(6, -2); ctx.lineTo(-1, 6); ctx.closePath();
      ctx.fillStyle = metal ? '#9CA3AF' : 'rgba(191, 219, 254, 0.9)'; ctx.fill();
      ctx.strokeStyle = metal ? INK : '#E0F2FE'; ctx.lineWidth = 1; ctx.stroke();
    } else {
      slab(ctx, -6, -3, 12, 6, i % 3 === 0 ? '#E7E5E4' : i % 3 === 1 ? '#B91C1C' : '#991B1B', 1);
    }
    ctx.restore();
  }
  // The dust (chunky puffs, their edges broken up)
  for (let i = 0; i < 7; i++) {
    const r = 20 + t * (0.8 + hash(i + 20) * 0.8);
    const a = Math.max(0, 0.45 - t / 260);
    pixelBlob(ctx, x + dir * (i * 14 + t * 0.6) - 20, floor - 20 - hash(i) * 80 - t * 0.2, r, r, `rgba(214, 211, 209, ${a.toFixed(3)})`);
  }
};

/**
 * Hector's arena, filthier the more poop logs have gone into his wind: smears of it up the windows and the pylons with
 * runs down them, a sludge of it building up along the deck with logs and lumps in it, a brown haze over the lot,
 * flies over the worst of it, stink coming up off it, and the telemetry on the glass with something to say about the
 * air. `f`: 0 clean .. 1 as bad as it gets. Every mark has its own place and turns up at its own level, so it builds.
 */
const drawHectorFilth = (ctx: CanvasRenderingContext2D, left: number, right: number, top: number, bottom: number, frame: number, f: number) => {
  if (f < 0.01) return;
  const w = right - left;
  const h = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const BROWN = ['#4A2F12', '#5C3A17', '#6B4423', '#3B2410'];
  ctx.save();
  ctx.beginPath(); ctx.rect(left, top, w, bottom - top); ctx.clip();
  // Smears up the glass and the pylons, as the blood's done (spatter.ts: a lumpy splat flung the way the wind threw it,
  // fingers, flecks, runs down from it, stepped shading and a wet shine), only brown; growing in as it gets worse
  const SMEAR = ['#6B4423', '#5C3A17', '#7A5228', '#4E3315'];
  for (let i = 0; i < 34; i++) {
    const at = h(i) * 0.95;
    if (f < at) continue;
    const k = Math.min(1, (f - at) / 0.15);
    const x = left + 20 + h(i + 50) * (w - 40), y = top + 30 + h(i + 90) * (bottom - top - 120);
    // (grown in steps, so it's worked out a few times, not every frame of it)
    const size = Math.max(3, Math.round((6 + h(i + 130) * 14) * k));
    const a = h(i + 3) * Math.PI * 2;
    drawSpatter(ctx, { x, y, size, seed: 9100 + i * 37, on: 'wall', dx: Math.cos(a) * (0.4 + h(i + 7) * 0.5), dy: Math.sin(a) * 0.4, color: SMEAR[i % SMEAR.length] });
  }
  // The sludge along the deck: a layer of it building up, lumpy, logs in it
  const depth = 2 + f * 12;
  ctx.fillStyle = '#4A2F12';
  ctx.beginPath(); ctx.moveTo(left, bottom);
  for (let x = left; x <= right; x += 12) ctx.lineTo(x, bottom - 14 - depth + Math.sin(x * 0.07 + 1.3) * 2 * f - h(Math.floor(x / 12)) * 3 * f);
  ctx.lineTo(right, bottom); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(150, 110, 50, 0.4)'; for (let x = left + 6; x < right; x += 23) ctx.fillRect(x, bottom - 14 - depth + 1, 6, 1.5);
  for (let i = 0; i < 26; i++) {
    const at = h(i + 300) * 0.9;
    if (f < at) continue;
    const x = left + 30 + h(i + 320) * (w - 60), y = bottom - 14 - depth + 2;
    ctx.save(); ctx.translate(x, y); ctx.rotate((h(i + 340) - 0.5) * 0.8);
    ctx.fillStyle = BROWN[(i + 1) % BROWN.length]; ctx.beginPath(); ctx.roundRect(-11, -5, 22, 9, 4); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-4, -5, 1.5, 9); ctx.fillRect(4, -5, 1.5, 9);
    ctx.restore();
  }
  // A brown haze over the whole room
  ctx.fillStyle = `rgba(92, 64, 24, ${0.28 * f})`; ctx.fillRect(left, top, w, bottom - top);
  // Stink coming up off the deck
  if (f > 0.3) {
    ctx.strokeStyle = `rgba(132, 160, 60, ${0.5 * (f - 0.3) / 0.7})`; ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const x = left + 40 + h(i + 400) * (w - 80), t = ((frame * 0.6 + i * 37) % 90) / 90;
      const y0 = bottom - 20 - depth - t * 120;
      ctx.globalAlpha = 1 - t;
      ctx.beginPath(); ctx.moveTo(x, y0); for (let k = 1; k <= 6; k++) ctx.lineTo(x + Math.sin(k * 1.4 + frame * 0.1) * 5, y0 - k * 7); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  // Flies, over the worst of it
  ctx.fillStyle = '#0B0B0B';
  const flies = Math.floor(f * 28);
  for (let i = 0; i < flies; i++) {
    const cx = left + 40 + h(i + 500) * (w - 80), cy = bottom - 40 - h(i + 520) * 60;
    const a = frame * (0.18 + h(i + 540) * 0.2) + i;
    ctx.fillRect(cx + Math.cos(a) * 14 + Math.sin(a * 2.3) * 4, cy + Math.sin(a * 1.7) * 9, 2, 2);
  }
  // The telemetry on the glass: something to say about the air
  if (f > 0.4) {
    ctx.fillStyle = Math.floor(frame / 20) % 2 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(253, 224, 71, 0.9)';
    ctx.font = '7px monospace';
    ctx.fillText(f > 0.85 ? 'AIR QUALITY: BIOHAZARD // DO NOT BREATHE' : 'AIR QUALITY: HAZARDOUS // FECAL PARTICULATE DETECTED', left + 40, top + 64);
  }
  ctx.restore();
};
