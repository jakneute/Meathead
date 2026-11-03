// Ben's way and his lair in Future Land, drawn (benLair.ts has the why): the green guide lights chasing west along the
// basement's floor from where he lands; over the hallway's mouth a lit CAST ONLY box with its arrow pointing west; the
// hallway's west end (the old end wall, newer block, a stencil and an arrow down at the hatch); the hatch in the floor
// (its diamond-plate lid stood open against the wall, its steel rim lit (stand on it), the warm light up out of it);
// the floor grate by where he landed that the cannon puts him back up out of. Under the hallway: the RIDE-OPS BREAK
// ROOM, a 1990s cast break room nobody's been in since the ride's refit, turned gym-bro hideout: drop-ceiling tiles
// (some gone, some sagging, a water stain), a bare bulb on a cord, two-tone painted block (cream over teal, a chair rail),
// brown linoleum (its lip lit), the bank of cast lockers (SMITH on label tape), a mini fridge with a hot plate and a pot
// on it, a CRT on an AV cart playing a workout tape, the DAYS WITHOUT INCIDENT board at 0, a dead animatronic arm
// (the queen knockoff's spare: chrome, hydraulics, cables) bolted across the wall for a pull-up bar, chalk under it, a
// barbell of conduit with the ride's rubber alien eggs for plates racked over a XENOSCARE ride-car seat for a bench, a
// HANG IN THERE poster (an alien off a branch). The rock round it in cross section.
//
// The still art's stamped once in tiles; the live bits (the guide lights' chase, the box's flicker, the CRT's picture,
// the pot's steam, the bulb's sway) are a few rects a frame. Lit by its own light in the room (lairLighting), warm;
// More of his things (paintShade, paintDen): the dark banded into the room's top and ends, the bulb's pool, grime; a
// cable tray, a vent, the pegboard and the lockers' tops for his bench (the next BEEF BRACER half built), soldering
// scorch, a SPOT ME OR GET EATEN poster, the ride's KEEP ARMS AND LEGS INSIDE sign, chalk prints, his army cot, a crate
// of spare eggs; a near cable run across the top in front. The hallway's in the basement's dark (basement.ts hunterLighting) with hallLights' green.

import type { GameState } from '../../../m1/game/core/state';
import type { Light, SceneLight } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { stamp } from '../../../m1/game/render/stamp';
import { brickPattern } from '../../../m1/game/render/pixelArt';
import { SKIP_AFTER, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { drawBen, benHeadY, drawBenGross, drawBenGrossBack, drawGate, drawCannonChain, gateK } from '../../upgrades/confucktious';
import { drawCannon, FUTURE } from '../../upgrades/returnCannon';
import { saidOver } from '../section';
import { BASE_L, BF, CEIL_B, LAND_X, HATCH, LAIR, HALL_L } from './geo';
import { type Ramp, dith, tube, blob, hash } from './paint';
import { stencil, lightbox, print } from './letters';
import { lairOf, inLair, belowHall, BEN_X, GRATE_X } from './benLair';

type Ctx = CanvasRenderingContext2D;
const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string | CanvasPattern) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const seen = (state: GameState, a: number, b: number, t: number, u: number) => {
  const cx = state.camera.x, cy = state.camera.y;
  return b > cx - 40 && a < cx + CANVAS_WIDTH + 40 && u > cy - 40 && t < cy + CANVAS_HEIGHT + 40;
};

const mixHex = (a: string, b: string, k: number) => { const p = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16); const ch = (i: number) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * k).toString(16).padStart(2, '0'); return `#${ch(0)}${ch(1)}${ch(2)}`; };
const STEEL: Ramp = ['#0A0A0E', '#22222A', '#34343F', '#4E4E5C', '#7A7A8A'];
const CHROME: Ramp = ['#0F172A', '#334155', '#64748B', '#CBD5E1', '#F8FAFC'];
const EGG: Ramp = ['#052E16', '#166534', '#22C55E', '#86EFAC', '#F0FFF4'];
const VINYL: Ramp = ['#1E0A2E', '#3B1460', '#5B21B6', '#8B5CF6', '#C4B5FD'];

/** The guide lights: from where he lands west along the floor to the hatch's edge, this far apart. */
const GUIDE_A = LAND_X - 30, GUIDE_B = HATCH.b + 30, GUIDE_GAP = 46;
const GUIDES: number[] = [];
for (let x = GUIDE_A; x >= GUIDE_B; x -= GUIDE_GAP) GUIDES.push(Math.round(x));
/** The guide light i's brightness at frame f (0 dim .. 1 lit): a chase running west, two lit at a time. */
const guideK = (i: number, f: number) => { const d = ((i - Math.floor(f / 5)) % 10 + 10) % 10; return d === 0 ? 1 : d === 1 ? 0.6 : d === 9 ? 0.35 : 0.12; };
/** The CAST ONLY box over the hallway's mouth (its middle, its top). */
const BOX = { x: BASE_L - 70, y: CEIL_B + 120, w: 132, h: 34 };
/** Its flicker (on most of the time). */
const boxOn = (f: number) => !(f % 173 < 5 || (f % 173 > 9 && f % 173 < 12) || f % 611 < 20);

// ---------------------------------------------------------------------------------------------------------------
// The hallway

/** The west end wall, the stencil, the hatch's rim and its open lid, the warm light up out of it (world). */
const paintHallEnd = (g: Ctx) => {
  const L = HALL_L - 160;
  // (the rock past the wall)
  px(g, L, CEIL_B - 30, HALL_L - L, BF + 40 - (CEIL_B - 30), '#060508');
  // (the end wall: newer block, lighter, its mortar; banded dark up and down)
  g.fillStyle = brickPattern(g, 'sp-q-ben-blk', 32, 16, ['#24242C', '#282830'], '#14141A'); g.fillRect(HALL_L - 20, CEIL_B, 24, BF - CEIL_B);
  px(g, HALL_L - 22, CEIL_B, 2, BF - CEIL_B, '#050507'); px(g, HALL_L + 2, CEIL_B, 2, BF - CEIL_B, '#3A3A46');
  for (let k = 0; k < 4; k++) px(g, HALL_L - 20, CEIL_B + k * 14, 24, 14, `rgba(4,4,8,${(0.5 - k * 0.12).toFixed(2)})`);
  // (the stencil on the hallway's back wall by the hatch: BREAK RM, an arrow down at it)
  stencil(g, 'BREAK RM', HATCH.a + 150, BF - 196, 2, '#8A8676', { seed: 7, spray: 'rgba(138, 134, 118, 0.3)' });
  const ax = HATCH.a + 150, ay = BF - 176;
  g.fillStyle = '#8A8676'; g.fillRect(ax - 3, ay, 6, 26); g.beginPath(); g.moveTo(ax - 11, ay + 24); g.lineTo(ax + 11, ay + 24); g.lineTo(ax, ay + 38); g.closePath(); g.fill();
  g.fillStyle = dith(g, 'rgba(10,10,14,0.6)'); g.fillRect(ax - 12, ay, 24, 40);
  // (the hatch: the shaft down, its walls, the rungs' shadow; the warm light coming up it)
  px(g, HATCH.a, BF - 2, HATCH.b - HATCH.a, LAIR.top - BF + 4, '#07050A');
  px(g, HATCH.a, BF, 8, LAIR.top - BF, '#1A1418'); px(g, HATCH.b - 8, BF, 8, LAIR.top - BF, '#120E12');
  for (let k = 0; k < 4; k++) px(g, HATCH.a + 8, BF + 2 + k * 9, HATCH.b - HATCH.a - 16, 9, `rgba(255, 160, 80, ${(0.05 + k * 0.05).toFixed(2)})`);
  // (its rim: steel angle, lit along its top: you stand on it)
  for (const [x0, x1] of [[HATCH.a - 10, HATCH.a + 2], [HATCH.b - 2, HATCH.b + 10]]) { px(g, x0, BF - 1, x1 - x0, 8, STEEL[1]); px(g, x0, BF - 1, x1 - x0, 2, '#B4B8C4'); px(g, x0, BF + 5, x1 - x0, 2, STEEL[0]); }
  // (the warm light up out of it into the hallway's dark, in bands)
  for (let k = 0; k < 5; k++) { g.fillStyle = dith(g, `rgba(255, 170, 90, ${(0.14 - k * 0.025).toFixed(3)})`, 2, k % 2); g.fillRect(HATCH.a + 6 - k * 6, BF - 30 - k * 30, HATCH.b - HATCH.a - 12 + k * 12, 30); }
  // (the lid: diamond-plate steel, swung up open, stood against the end wall: a background thing, dimmed)
  const lx = HALL_L + 4, lt = BF - 132;
  px(g, lx - 1, lt - 1, 14, 134, '#050507'); px(g, lx, lt, 12, 132, '#2A2A32'); px(g, lx, lt, 2, 132, '#3A3A44');
  for (let y = lt + 4; y < BF - 4; y += 8) for (let x = lx + 2; x < lx + 11; x += 5) { px(g, x + ((y / 8) % 2) * 2, y, 2, 1, '#4A4A56'); px(g, x + ((y / 8) % 2) * 2 + 1, y + 1, 1, 1, '#18181E'); }
  px(g, lx + 4, lt + 60, 4, 14, '#18181E'); px(g, lx + 5, lt + 61, 2, 12, '#6A6A78');
  px(g, lx, BF - 6, 14, 6, '#18181E');
};

/** The CAST ONLY box over the mouth: its housing, its two words lit (or not), its arrow west. */
const paintBox = (g: Ctx, on: boolean) => {
  const { x, y, w, h } = BOX, L = x - w / 2;
  px(g, L - 2, y - 2, w + 4, h + 4, '#050507'); px(g, L, y, w, h, '#1A1A22'); px(g, L, y, w, 2, '#3A3A46');
  px(g, L + 4, y + 4, w - 8, h - 8, on ? '#0A2A12' : '#08100A');
  if (on) lightbox(g, 'CAST ONLY', x + 12, y + 10, 2, '#4ADE80', '#DCFCE7', 'rgba(74, 222, 128, 0.35)');
  else stencil(g, 'CAST ONLY', x + 12, y + 10, 2, '#14532D', { spray: '', runs: false });
  // (the arrow, west)
  const ax = L + 12, ay = y + h / 2;
  g.fillStyle = on ? '#BBF7D0' : '#14532D';
  g.beginPath(); g.moveTo(ax, ay); g.lineTo(ax + 10, ay - 8); g.lineTo(ax + 10, ay - 3); g.lineTo(ax + 18, ay - 3); g.lineTo(ax + 18, ay + 3); g.lineTo(ax + 10, ay + 3); g.lineTo(ax + 10, ay + 8); g.closePath(); g.fill();
  // (its cage, its conduit up into the ceiling)
  for (let k = 0; k < 6; k++) px(g, L + 6 + k * (w - 12) / 5, y + 1, 1, h - 2, '#3A3A46');
  px(g, x - 2, CEIL_B, 4, y - CEIL_B, '#1A1A22'); px(g, x - 1, CEIL_B, 1, y - CEIL_B, '#3A3A46');
};

/** The floor grate by where he landed (the cannon's way back up): an iron grate in the floor, banged up a moment as he
 *  comes out of it. */
const paintGrate = (g: Ctx, open: boolean) => {
  const x = GRATE_X;
  px(g, x - 24, BF - 1, 48, 10, '#050507');
  if (open) {
    px(g, x - 22, BF, 44, 8, '#020203');
    px(g, x - 26, BF - 40, 6, 40, '#2A2A32'); px(g, x - 26, BF - 40, 2, 40, '#5A5A66');
    for (let k = 0; k < 5; k++) px(g, x - 26, BF - 36 + k * 8, 6, 2, '#0A0A0E');
  } else {
    px(g, x - 22, BF, 44, 6, '#2A2A32'); px(g, x - 22, BF, 44, 1, '#8A8A98');
    for (let k = 0; k < 7; k++) px(g, x - 19 + k * 6, BF + 1, 3, 5, '#050507');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The break room (world: its floor at LAIR.floor)

const F = LAIR.floor, T = LAIR.top, A = LAIR.a, Bx = LAIR.b;
/** Where things are in it (from its west end). */
const FRIDGE = A + 305, CART = A + 378, BOARD = A + 296, ARM = { a: A + 470, b: A + 630, y: F - 196 }, RACK = A + 560, POSTER = A + 650, LOCKERS = A + 185;

const paintRock = (g: Ctx) => {
  // (the ground round the room in cross section: the slab under the hallway's floor, then rock, in stepped bands)
  const L = HALL_L - 200, R = BASE_L + 900, top = BF + 40, bot = F + 200;
  px(g, L, top, R - L, bot - top, '#0B090C');
  for (let k = 0; k < 6; k++) px(g, L, top + k * 6, R - L, 3, k % 2 ? '#100D12' : '#0D0B0F');
  for (let i = 0; i < 70; i++) { const x = L + hash(i) * (R - L), y = top + 40 + hash(i + 9) * (bot - top - 40); blob(g, x, y, 6 + hash(i + 3) * 14, 4 + hash(i + 5) * 8, ['#060508', '#141018', '#1C1720', '#251E2A', '#302838'], false); }
  // (the room's shell: a concrete box, its edge)
  px(g, A - 10, T - 10, Bx - A + 20, F - T + 24, '#1A1A20'); px(g, A - 10, T - 10, Bx - A + 20, 2, '#2A2A34');
};

const paintRoom = (g: Ctx) => {
  // (the walls: painted block, cream over teal, a chair rail; the paint chipped, damp at the foot)
  const rail = F - 120;
  g.fillStyle = brickPattern(g, 'sp-q-ben-cream', 32, 16, ['#6E6656', '#746C5C'], '#4E4838'); g.fillRect(A, T, Bx - A, rail - T);
  g.fillStyle = brickPattern(g, 'sp-q-ben-teal', 32, 16, ['#2A4644', '#2E4A48'], '#1A2C2A'); g.fillRect(A, rail, Bx - A, F - rail);
  px(g, A, rail - 3, Bx - A, 6, '#4A3A28'); px(g, A, rail - 3, Bx - A, 1, '#8A6A48'); px(g, A, rail + 2, Bx - A, 1, '#22180E');
  for (let k = 0; k < 4; k++) px(g, A, F - 10 - k * 8, Bx - A, 8, `rgba(8,14,12,${(0.4 - k * 0.09).toFixed(2)})`);
  for (let i = 0; i < 14; i++) { const x = A + 20 + hash(i * 7) * (Bx - A - 40), y = T + 30 + hash(i * 3) * (rail - T - 50); px(g, x, y, 4 + hash(i) * 8, 2 + hash(i + 2) * 4, '#4E4838'); }
  // (the ceiling: drop tiles in a grid, two missing (the dark up there), one sagging, a water stain)
  px(g, A, T, Bx - A, 22, '#58524A');
  for (let x = A; x < Bx; x += 60) { px(g, x, T, 2, 22, '#2A2620'); }
  px(g, A, T + 20, Bx - A, 2, '#2A2620'); px(g, A, T, Bx - A, 1, '#7A7268');
  for (const mx of [A + 240, A + 540]) px(g, mx + 2, T, 58, 20, '#0A080A');
  g.fillStyle = 'rgba(120, 90, 40, 0.35)'; g.fillRect(A + 362, T + 2, 50, 16); g.fillStyle = dith(g, 'rgba(120,90,40,0.4)'); g.fillRect(A + 356, T, 62, 20);
  px(g, A + 602, T + 20, 58, 8, '#4A443C');
  // (the hatch's shaft coming down through it, over the west end)
  px(g, HATCH.a, T - 2, HATCH.b - HATCH.a, 24, '#07050A'); px(g, HATCH.a - 2, T + 20, HATCH.b - HATCH.a + 4, 3, '#3A3A44');
  paintShade(g);
  // (a dead fluorescent fixture)
  px(g, A + 420, T + 22, 120, 10, '#2A2A30'); px(g, A + 424, T + 32, 112, 3, '#B8B8B0'); px(g, A + 424, T + 34, 112, 1, '#6A6A66');
  // (the floor: brown linoleum checker, scuffed; its lip lit: stand on it)
  for (let x = A; x < Bx; x += 20) px(g, x, F, 20, 14, ((x - A) / 20) % 2 ? '#3A2A1C' : '#2E2216');
  px(g, A, F, Bx - A, 2, '#A08060'); px(g, A, F + 2, Bx - A, 1, '#5A4430');
  px(g, A, F + 14, Bx - A, 4, '#0A0806');
  // (the cast lockers: three, one SMITH, one door hanging open with a towel and a bodybuilder pinup)
  for (let i = 0; i < 3; i++) {
    const x = LOCKERS + i * 30, top = F - 132;
    px(g, x - 1, top - 1, 30, 134, '#05070B');
    const cols = ['#2A3646', '#3A4A60', '#475A74', '#3A4A60', '#2A3646'];
    cols.forEach((c, k) => px(g, x + k * 5.6, top, 6, 132, c));
    for (let k = 0; k < 4; k++) px(g, x + 6, top + 10 + k * 5, 16, 2, '#0B1220');
    px(g, x + 22, top + 60, 3, 12, '#A8B4C4');
    if (i === 1) { px(g, x + 3, top + 34, 22, 8, '#1E293B'); print(g, 'SMITH', x + 14, top + 35, 1, 1, '#F1F5F9'); }
    if (i === 2) {
      px(g, x + 2, top + 2, 24, 128, '#0A0E14'); px(g, x + 6, top + 40, 14, 30, '#E8E2D0'); px(g, x + 6, top + 40, 14, 4, '#B8B2A0');
      px(g, x + 8, top + 8, 12, 18, '#D8B898'); px(g, x + 11, top + 10, 6, 5, '#B88A60'); px(g, x + 9, top + 15, 10, 9, '#C89A70');
      px(g, x + 26, top + 4, 10, 126, '#2E3B4D'); px(g, x + 26, top + 4, 2, 126, '#475A74');
    }
  }
  // (the mini fridge, a hot plate and a pot on it; an IRON PIT sticker)
  const fx = FRIDGE;
  px(g, fx - 25, F - 76, 50, 76, '#05070B'); px(g, fx - 24, F - 75, 48, 75, '#C8C2B4'); px(g, fx - 24, F - 75, 6, 75, '#E8E2D4'); px(g, fx + 16, F - 75, 8, 75, '#9A9488');
  px(g, fx - 24, F - 50, 48, 2, '#6A6458'); px(g, fx + 14, F - 44, 3, 16, '#4A463E');
  px(g, fx - 14, F - 36, 18, 10, '#7F1D1D'); print(g, 'IRON', fx - 5, F - 34, 1, 1, '#FDE68A');
  px(g, fx - 20, F - 84, 40, 8, '#18181B'); px(g, fx - 16, F - 82, 14, 3, '#7F1D1D'); px(g, fx + 2, F - 82, 14, 3, '#3F3F46');
  px(g, fx - 18, F - 100, 20, 16, '#05070B'); px(g, fx - 17, F - 99, 18, 15, '#71717A'); px(g, fx - 17, F - 99, 4, 15, '#A1A1AA'); px(g, fx + 1, F - 96, 8, 2, '#3F3F46');
  // (the AV cart with the CRT on it, the VCR under, tapes)
  const cx = CART;
  px(g, cx - 34, F - 70, 68, 4, '#18181B'); px(g, cx - 34, F - 30, 68, 4, '#18181B'); px(g, cx - 32, F - 70, 3, 66, '#27272A'); px(g, cx + 29, F - 70, 3, 66, '#27272A');
  for (const wx of [cx - 30, cx + 30]) { px(g, wx - 4, F - 6, 8, 6, '#05070B'); px(g, wx - 2, F - 5, 4, 3, '#52525B'); }
  px(g, cx - 26, F - 26, 52, 10, '#0A0A0E'); px(g, cx - 24, F - 24, 30, 2, '#3F3F46'); px(g, cx + 12, F - 22, 6, 2, '#DC2626');
  px(g, cx - 30, F - 128, 60, 58, '#05070B'); px(g, cx - 29, F - 127, 58, 56, '#2E2A26'); px(g, cx - 29, F - 127, 58, 3, '#4A4640');
  px(g, cx - 24, F - 121, 40, 36, '#020617');
  for (let k = 0; k < 3; k++) px(g, cx + 20, F - 118 + k * 8, 6, 4, '#18181B');
  px(g, cx - 10, F - 136, 2, 9, '#71717A'); px(g, cx + 8, F - 140, 2, 13, '#71717A');
  for (let k = 0; k < 4; k++) { px(g, cx - 28 + k * 14, F - 64, 12, 30, ['#0A0A0E', '#1E293B', '#3F0A0A', '#0A0A0E'][k]); px(g, cx - 26 + k * 14, F - 60, 8, 6, '#E5E7EB'); }
  // (the board: DAYS WITHOUT INCIDENT, 0)
  const bx = BOARD;
  px(g, bx - 1, F - 230, 98, 50, '#05070B'); px(g, bx, F - 229, 96, 48, '#E8E2D0'); px(g, bx, F - 229, 96, 10, '#B91C1C');
  print(g, 'DAYS WITHOUT', bx + 48, F - 227, 1, 1, '#FFFFFF');
  print(g, 'INCIDENT', bx + 48, F - 216, 1, 1, '#18181B');
  px(g, bx + 36, F - 206, 24, 22, '#18181B'); print(g, '0', bx + 48, F - 203, 2, 2, '#F8FAFC');
  // (the HANG IN THERE poster: an alien hanging off a branch, curled at a corner)
  const po = POSTER;
  px(g, po - 1, F - 236, 52, 70, '#05070B'); px(g, po, F - 235, 50, 68, '#B8D4E8'); px(g, po, F - 200, 50, 33, '#9CC0DC');
  px(g, po + 4, F - 222, 42, 3, '#6B4423'); px(g, po + 30, F - 225, 10, 3, '#15803D');
  px(g, po + 20, F - 219, 2, 6, '#22C55E'); px(g, po + 24, F - 219, 2, 6, '#22C55E'); blob(g, po + 23, F - 204, 7, 8, EGG); px(g, po + 19, F - 206, 3, 2, '#05070B'); px(g, po + 24, F - 206, 3, 2, '#05070B');
  px(g, po + 21, F - 196, 4, 10, '#16A34A');
  print(g, 'HANG IN', po + 25, F - 184, 1, 1, '#1E3A8A'); print(g, 'THERE', po + 25, F - 176, 1, 1, '#1E3A8A');
  px(g, po + 44, F - 235, 6, 6, '#7A92A8');
  // (the dead animatronic arm bolted across for a pull-up bar: the queen knockoff's spare, chrome, its hydraulics, its
  // cables hanging; brackets into the wall; chalk on its grip, and under it on the floor)
  const ay = ARM.y;
  for (const bx2 of [ARM.a + 6, ARM.b - 10]) { px(g, bx2 - 1, ay - 2, 8, 30, '#05070B'); px(g, bx2, ay - 1, 6, 28, STEEL[3]); px(g, bx2, ay - 1, 2, 28, STEEL[4]); px(g, bx2 + 1, ay + 22, 3, 3, '#020203'); }
  tube(g, ARM.a, ay, ARM.a + 70, ay + 2, 12, CHROME);
  tube(g, ARM.a + 70, ay + 2, ARM.b, ay, 10, CHROME);
  blob(g, ARM.a + 70, ay + 1, 10, 9, STEEL);
  tube(g, ARM.a + 20, ay + 8, ARM.a + 66, ay + 9, 4, ['#0A0A0E', '#3F0A0A', '#7F1D1D', '#B91C1C', '#F87171']);
  for (let k = 0; k < 4; k++) px(g, ARM.b - 4 + k * 3, ay - 6 + (k % 2) * 3, 3, 10, '#1E293B');
  for (let k = 0; k < 3; k++) { const hx = ARM.a + 40 + k * 22; g.strokeStyle = ['#0E7490', '#B45309', '#3F3F46'][k]; g.lineWidth = 2; g.beginPath(); g.moveTo(hx, ay + 6); g.quadraticCurveTo(hx + 6, ay + 40, hx - 4, ay + 52 + k * 8); g.stroke(); }
  px(g, ARM.a + 92, ay - 5, 30, 10, dith(g, 'rgba(255,255,255,0.45)'));
  g.fillStyle = dith(g, 'rgba(230,230,225,0.25)'); g.fillRect(ARM.a + 70, F - 4, 80, 4);
  // (the bench: a XENOSCARE ride-car seat, purple vinyl, its yellow lap bar up; the rack: two pipe uprights; the bar:
  // conduit, three of the ride's rubber alien eggs a side for plates)
  const rk = RACK;
  px(g, rk - 50, F - 34, 100, 34, '#05070B'); px(g, rk - 48, F - 32, 96, 20, VINYL[2]); px(g, rk - 48, F - 32, 96, 4, VINYL[3]); px(g, rk - 48, F - 14, 96, 14, '#18181B');
  for (let k = 0; k < 5; k++) px(g, rk - 40 + k * 20, F - 28, 2, 14, VINYL[1]);
  px(g, rk + 34, F - 64, 6, 34, '#CA8A04'); px(g, rk + 34, F - 64, 22, 6, '#CA8A04'); px(g, rk + 34, F - 64, 22, 2, '#FDE047');
  for (const ux of [rk - 40, rk + 26]) { px(g, ux - 1, F - 96, 8, 64, '#05070B'); px(g, ux, F - 95, 6, 62, STEEL[2]); px(g, ux, F - 95, 2, 62, STEEL[3]); px(g, ux - 3, F - 98, 12, 4, STEEL[3]); }
  tube(g, rk - 96, F - 100, rk + 84, F - 100, 4, STEEL);
  for (const side of [-1, 1]) for (let k = 0; k < 3; k++) {
    const ex = side < 0 ? rk - 80 + k * 11 : rk + 70 - k * 11;
    blob(g, ex, F - 100, 7, 15 - k, EGG);
    px(g, ex - 2, F - 115 + k, 4, 3, EGG[0]); px(g, ex - 3, F - 104, 2, 6, EGG[3]);
  }
  // (a towel over the bench, a belt hung on the rack)
  px(g, rk - 20, F - 36, 26, 6, '#E8E2D0'); px(g, rk - 20, F - 30, 6, 10, '#D6D0C0');
  paintDen(g);
};

/** The light and the dark painted on the walls (over the block, under his things): the dark gathered up under the
 *  ceiling and into the room's ends in stepped dithered bands, the bulb's warm pool, grime run down from the ceiling. */
const paintShade = (g: Ctx) => {
  for (let k = 0; k < 5; k++) { g.fillStyle = dith(g, `rgba(6,4,6,${(0.42 - k * 0.08).toFixed(2)})`, 2, k % 2); g.fillRect(A, T + 22 + k * 12, Bx - A, 12); }
  for (let k = 0; k < 4; k++) { const a = `rgba(6,4,6,${(0.4 - k * 0.09).toFixed(2)})`; g.fillStyle = dith(g, a, 2, k % 2); g.fillRect(A + k * 14, T + 22, 14, F - T - 22); g.fillRect(Bx - (k + 1) * 14, T + 22, 14, F - T - 22); }
  for (let i = 0; i < 5; i++) { g.fillStyle = `rgba(255,214,150,${(0.025 + i * 0.012).toFixed(3)})`; g.beginPath(); g.ellipse(A + 330, T + 110 + i * 8, 190 - i * 34, 120 - i * 20, 0, 0, Math.PI * 2); g.fill(); }
  for (let k = 0; k < 16; k++) { const x = A + 30 + hash(k + 300) * (Bx - A - 60), len = 20 + hash(k + 301) * 70; g.fillStyle = dith(g, 'rgba(20,16,10,0.35)', 2, k % 2); g.fillRect(x, T + 22, 2 + hash(k + 302) * 3, len); }
};

/** More of his things (dimmed toward the room's dark: none of it's stood on): the cable tray and conduit under the
 *  ceiling, a wall vent; the lockers' tops for his workbench (the next BEEF BRACER half built: ride-car plastic, a strip
 *  of red LEDs wired up, the soldering iron, solder, a tub of whey, a foam alien head wearing a cast mask) and the
 *  pegboard over them; the soldering's scorch; a SPOT ME OR GET EATEN poster; the stolen KEEP ARMS AND LEGS INSIDE
 *  THE RIDE sign over the pull-up arm; chalk handprints; his army cot behind where he stands (a XENOSCARE blanket, a
 *  pillow); a crate of spare alien eggs. */
const paintDen = (g: Ctx) => {
  const D = (c: string, k = 0.25) => mixHex(c, '#0A080A', k);
  // ---- the cable tray under the ceiling (its rungs, cables in it), a conduit down to a switch box by the lockers
  px(g, A + 180, T + 34, Bx - A - 200, 4, '#05070B'); px(g, A + 180, T + 34, Bx - A - 200, 1, D('#5A5A66'));
  for (let x = A + 184; x < Bx - 20; x += 12) px(g, x, T + 30, 2, 8, D('#3A3A46'));
  for (let k = 0; k < 3; k++) px(g, A + 180, T + 30 + k, Bx - A - 200, 1, ['#3F0A0A', '#0A2A4A', '#2A2A0A'][k]);
  for (const hx of [A + 260, A + 560]) px(g, hx, T + 22, 2, 12, D('#3A3A46'));
  px(g, A + 182, T + 38, 3, F - 150 - T - 38, D('#3A3A46')); px(g, A + 182, T + 38, 1, F - 150 - T - 38, D('#6A6A78'));
  px(g, A + 176, F - 156, 14, 18, '#05070B'); px(g, A + 177, F - 155, 12, 16, D('#4A4A56')); px(g, A + 181, F - 151, 4, 6, D('#18181E'));
  // (the wall vent, dust streaked down from it)
  { const x = A + 600, y = F - 344; px(g, x - 1, y - 1, 42, 26, '#05070B'); px(g, x, y, 40, 24, D('#4A4A56')); for (let k = 0; k < 5; k++) { px(g, x + 3, y + 3 + k * 4, 34, 2, '#0A0A0E'); px(g, x + 3, y + 5 + k * 4, 34, 1, D('#7A7A8A')); }
    g.fillStyle = dith(g, 'rgba(20,16,10,0.4)'); g.fillRect(x + 6, y + 24, 28, 30); }
  // ---- the pegboard over the lockers: masonite, its holes; pliers, cutters, a multimeter, a coil of wire, tape
  { const x = A + 186, y = F - 250, w = 92, h = 64, P = ['#3A2A1C', '#5A4430', '#7A5C40', '#9A7A58'].map(c => D(c));
    px(g, x - 1, y - 1, w + 2, h + 2, '#05070B'); px(g, x, y, w, h, P[1]); px(g, x, y, w, 2, P[2]);
    for (let yy = y + 5; yy < y + h - 2; yy += 6) for (let xx = x + 4; xx < x + w - 2; xx += 6) px(g, xx, yy, 1, 1, P[0]);
    g.strokeStyle = D('#B91C1C'); g.lineWidth = 2; g.beginPath(); g.moveTo(x + 12, y + 8); g.lineTo(x + 8, y + 34); g.moveTo(x + 14, y + 8); g.lineTo(x + 18, y + 34); g.stroke();
    px(g, x + 10, y + 4, 6, 6, D('#71717A'));
    g.strokeStyle = D('#CA8A04'); g.beginPath(); g.moveTo(x + 28, y + 10); g.lineTo(x + 26, y + 30); g.moveTo(x + 30, y + 10); g.lineTo(x + 33, y + 30); g.stroke();
    px(g, x + 42, y + 8, 18, 26, '#05070B'); px(g, x + 43, y + 9, 16, 24, D('#CA8A04')); px(g, x + 45, y + 11, 12, 7, D('#1E3A2A')); px(g, x + 46, y + 13, 6, 1, D('#4ADE80'));
    blob(g, x + 50, y + 26, 4, 4, STEEL); px(g, x + 44, y + 34, 2, 14, '#B91C1C'); px(g, x + 56, y + 34, 2, 12, '#18181B');
    for (let k = 0; k < 3; k++) { g.strokeStyle = k % 2 ? D('#B45309') : D('#0E7490'); g.lineWidth = 1.5; g.beginPath(); g.ellipse(x + 74, y + 18, 9 - k, 10 - k, 0, 0, Math.PI * 2); g.stroke(); }
    blob(g, x + 74, y + 46, 7, 6, ['#0A0A0E', '#1E1E24', '#3A3A44', '#5A5A66', '#8A8A96']); px(g, x + 72, y + 44, 4, 4, '#0A0A0E');
    px(g, x + 6, y + 40, 26, 18, D('#E8E2D0', 0.35)); for (let k = 0; k < 4; k++) px(g, x + 8, y + 43 + k * 4, 18 - k * 3, 1, D('#3F3F46')); }
  // (the soldering's scorch on the block over the lockers' right end)
  for (let i = 0; i < 4; i++) { g.fillStyle = dith(g, `rgba(8,6,4,${(0.16 + i * 0.07).toFixed(2)})`, 2, i % 2); g.beginPath(); g.ellipse(A + 248, F - 156 - i * 3, 24 - i * 5, 14 - i * 3, 0, 0, Math.PI * 2); g.fill(); }
  // ---- on the lockers' tops (his workbench): the bracer half built, its LED strip, the iron in its stand, solder, a tub
  { const y = F - 132, x = A + 186;
    // (the bracer: a curl of the ride car's purple plastic, a strip of red LEDs taped along it, wires off it)
    px(g, x + 4, y - 14, 40, 14, '#05070B'); px(g, x + 5, y - 13, 38, 12, VINYL[2]); px(g, x + 5, y - 13, 38, 3, VINYL[3]); px(g, x + 5, y - 4, 38, 3, VINYL[1]);
    px(g, x + 8, y - 10, 32, 4, '#18181B'); for (let k = 0; k < 7; k++) px(g, x + 9 + k * 4.4, y - 9, 2, 2, k % 3 ? '#7F1D1D' : '#F87171');
    g.strokeStyle = '#B45309'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 42, y - 8); g.quadraticCurveTo(x + 52, y - 2, x + 50, y + 14); g.stroke();
    g.strokeStyle = '#0E7490'; g.beginPath(); g.moveTo(x + 42, y - 6); g.quadraticCurveTo(x + 48, y + 2, x + 46, y + 18); g.stroke();
    // (the iron in its coil stand, its tip glowing; a spool of solder)
    px(g, x + 54, y - 4, 16, 4, '#05070B'); px(g, x + 55, y - 3, 14, 2, D('#3F3F46'));
    for (let k = 0; k < 3; k++) px(g, x + 58 + k * 3, y - 12 + k, 2, 8, D('#A1A1AA'));
    g.strokeStyle = '#05070B'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 58, y - 10); g.lineTo(x + 74, y - 20); g.stroke(); g.strokeStyle = D('#CA8A04'); g.lineWidth = 2; g.beginPath(); g.moveTo(x + 66, y - 15); g.lineTo(x + 74, y - 20); g.stroke();
    px(g, x + 56, y - 9, 2, 2, '#FB923C');
    blob(g, x + 80, y - 5, 5, 5, ['#2A2418', '#7C735A', '#B3AA8A', '#D9D1B4', '#F4EFDC']); px(g, x + 79, y - 6, 2, 2, '#18181B');
    // (a foam alien head wearing a spare cast mask: the ride's)
    blob(g, x + 18, y - 32, 9, 12, ['#052E16', '#166534', '#22C55E', '#86EFAC', '#F0FFF4'].map(c => D(c, 0.3)) as unknown as Ramp);
    px(g, x + 12, y - 34, 5, 3, '#05070B'); px(g, x + 20, y - 34, 5, 3, '#05070B'); px(g, x + 14, y - 20, 8, 6, D('#E8E2D0', 0.35));
    // (whey tub)
    px(g, x + 32, y - 40, 20, 26, '#05070B'); px(g, x + 33, y - 39, 18, 25, D('#18181B', 0.1)); px(g, x + 33, y - 39, 18, 3, D('#3F3F46', 0.1)); px(g, x + 35, y - 30, 14, 7, D('#2563EB'));
    print(g, 'WHEY', x + 42, y - 29, 1, 1, '#F1F5F9'); }
  // ---- the poster in his words (an alien looming over a lifter under a bar)
  { const x = A + 402, y = F - 314, w = 80, h = 88;
    px(g, x - 1, y - 1, w + 2, h + 2, '#05070B'); px(g, x, y, w, h, D('#1E1E2A'));
    for (let k = 0; k < 4; k++) px(g, x, y + 10 + k * 10, w, 10, D(['#14532D', '#166534', '#15803D', '#166534'][k], 0.4));
    blob(g, x + 54, y + 30, 14, 18, EGG); px(g, x + 46, y + 26, 6, 4, '#05070B'); px(g, x + 56, y + 26, 6, 4, '#05070B');
    px(g, x + 14, y + 44, 40, 3, D('#A1A1AA')); px(g, x + 12, y + 38, 4, 14, D('#52525B')); px(g, x + 52, y + 38, 4, 14, D('#52525B'));
    px(g, x + 28, y + 46, 12, 10, D('#C89A70')); px(g, x + 30, y + 40, 8, 6, D('#C89A70'));
    print(g, 'SPOT ME', x + w / 2, y + 64, 1, 1, '#F1F5F9');
    print(g, 'OR GET EATEN', x + w / 2, y + 75, 1, 1, '#4ADE80');
    for (const [tx, ty] of [[x - 2, y - 2], [x + w - 8, y - 2]] as const) px(g, tx, ty, 10, 5, 'rgba(220,210,170,0.5)'); }
  // ---- the KEEP ARMS AND LEGS INSIDE THE RIDE sign off the ride, wired up over the pull-up arm
  { const x = A + 520, y = F - 300, w = 124, h = 34;
    for (const wx of [x + 10, x + w - 10]) { px(g, wx, y - 18, 1, 18, D('#71717A')); }
    px(g, x - 1, y - 1, w + 2, h + 2, '#05070B'); px(g, x, y, w, h, '#CA8A04'); px(g, x, y, w, 2, '#FDE047'); px(g, x + 3, y + 3, w - 6, h - 6, '#18181B');
    print(g, 'KEEP ARMS AND LEGS', x + w / 2, y + 8, 1, 1, '#FDE047');
    print(g, 'INSIDE THE RIDE', x + w / 2, y + 19, 1, 1, '#FDE047');
    for (const bx of [x + 4, x + w - 7]) px(g, bx, y + 4, 2, 2, '#71717A'); }
  // ---- chalk handprints on the block under the arm
  for (const [hx, hy] of [[ARM.a + 30, ARM.y + 40], [ARM.b - 40, ARM.y + 30], [ARM.a + 80, ARM.y + 54]] as const) { g.fillStyle = 'rgba(230,230,225,0.18)'; g.beginPath(); g.ellipse(hx, hy, 4, 5, 0, 0, Math.PI * 2); g.fill(); for (let k = 0; k < 4; k++) px(g, hx - 4 + k * 2.4, hy - 9, 1, 4, 'rgba(230,230,225,0.16)'); }
  // ---- his army cot (behind where he stands): olive canvas on X legs, a XENOSCARE blanket balled up, a pillow
  { const x = A + 418, y = F - 26, w = 88, O = ['#1A2010', '#2E3A1C', '#46562C', '#5E7040'].map(c => D(c, 0.2));
    for (const lx of [x + 6, x + w - 18]) { g.strokeStyle = '#05070B'; g.lineWidth = 3; g.beginPath(); g.moveTo(lx, y + 6); g.lineTo(lx + 12, F); g.moveTo(lx + 12, y + 6); g.lineTo(lx, F); g.stroke(); g.strokeStyle = D('#52525B'); g.lineWidth = 1; g.beginPath(); g.moveTo(lx, y + 6); g.lineTo(lx + 12, F); g.stroke(); }
    px(g, x - 1, y - 1, w + 2, 9, '#05070B'); px(g, x, y, w, 7, O[2]); px(g, x, y, w, 2, O[3]); px(g, x, y + 5, w, 2, O[1]);
    px(g, x + 2, y - 9, 24, 9, '#05070B'); px(g, x + 3, y - 8, 22, 8, D('#E8E2D0', 0.3)); px(g, x + 3, y - 8, 22, 2, D('#FFFFFF', 0.3));
    blob(g, x + 56, y - 6, 22, 7, VINYL.map(c => D(c, 0.25)) as unknown as Ramp); px(g, x + 44, y - 8, 20, 2, D('#4ADE80', 0.35)); }
  // ---- a crate of spare alien eggs by the hatch's foot side of the lockers
  { const x = A + 664, y = F - 24; px(g, x - 1, y - 1, 46, 25, '#05070B'); px(g, x, y, 44, 24, D('#6B4423', 0.3)); for (let k = 1; k < 3; k++) px(g, x, y + k * 8, 44, 1, D('#3A2414', 0.3));
    for (let k = 0; k < 3; k++) blob(g, x + 9 + k * 13, y - 4, 6, 8, EGG.map(c => D(c, 0.25)) as unknown as Ramp); }
};

/** The near cable run across the top of the room in front, in silhouette (world). */
const paintNear = (g: Ctx) => {
  px(g, A - 12, T - 12, Bx - A + 24, 14, '#030204'); px(g, A - 12, T + 2, Bx - A + 24, 1, '#1E1A20');
  g.strokeStyle = '#030204'; g.lineWidth = 3; g.beginPath(); g.moveTo(A + 220, T); g.quadraticCurveTo(A + 300, T + 22, A + 380, T); g.moveTo(A + 470, T); g.quadraticCurveTo(A + 560, T + 18, A + 640, T); g.stroke();
};

/** The CRT's picture: the workout tape (a stick man doing curls, two frames), the rolling bar, blue. */
const drawCrt = (c: Ctx, f: number) => {
  const x = CART - 24, y = F - 121, w = 40, h = 36, up = Math.floor(f / 16) % 2;
  px(c, x, y, w, h, '#1E3A8A'); px(c, x, y + h - 10, w, 10, '#172554');
  px(c, x + 18, y + 8, 4, 4, '#FDE68A'); px(c, x + 19, y + 12, 2, 12, '#FDE68A');
  px(c, x + 17, y + 24, 2, 8, '#FDE68A'); px(c, x + 21, y + 24, 2, 8, '#FDE68A');
  px(c, x + 14, y + (up ? 10 : 16), 2, up ? 6 : 4, '#FDE68A'); px(c, x + 24, y + (up ? 10 : 16), 2, up ? 6 : 4, '#FDE68A');
  px(c, x + 11, y + (up ? 9 : 19), 18, 2, '#A1A1AA');
  const bar = (f * 0.7) % (h + 10) - 10;
  if (bar > 0) px(c, x, y + bar, w, 3, 'rgba(255,255,255,0.12)');
  if (f % 90 < 2) px(c, x, y, w, h, 'rgba(255,255,255,0.3)');
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing hooks

/** World space, behind everything: the hallway's dressing (over the tunnel's tiles), the guide lights, the grate; and
 *  the break room under it (the rock, the room, the cannon, Ben). */
export const drawBenHallBack = (c: Ctx, state: GameState) => {
  const f = state.frame, h = lairOf(state);
  if (seen(state, HALL_L - 200, HATCH.b + 220, CEIL_B - 40, LAIR.top + 20)) stamp(c, 'sp-q-ben-end', HALL_L - 160, CEIL_B - 30, HATCH.b + 220 - (HALL_L - 160), LAIR.top + 14 - (CEIL_B - 30), paintHallEnd);
  if (seen(state, BOX.x - 80, BOX.x + 80, CEIL_B, BOX.y + 50)) { const on = boxOn(f); stamp(c, `sp-q-ben-box-${on}`, BOX.x - BOX.w / 2 - 4, CEIL_B, BOX.w + 8, BOX.y + BOX.h + 4 - CEIL_B, g => paintBox(g, on)); }
  if (seen(state, GRATE_X - 40, GRATE_X + 40, BF - 50, BF + 20)) { const open = f - h.grateAt < 30; stamp(c, `sp-q-ben-grate-${open}`, GRATE_X - 28, BF - 42, 56, 54, g => paintGrate(g, open)); }
  // (the guide lights: pucks set in the floor along its lip, the chase running west)
  if (seen(state, GUIDE_B - 20, GUIDE_A + 20, BF - 20, BF + 20)) GUIDES.forEach((x, i) => {
    if (x < state.camera.x - 20 || x > state.camera.x + CANVAS_WIDTH + 20) return;
    const k = guideK(i, f);
    px(c, x - 8, BF - 4, 16, 6, '#050507');
    px(c, x - 7, BF - 3, 14, 4, k > 0.9 ? '#BBF7D0' : k > 0.5 ? '#4ADE80' : k > 0.3 ? '#22C55E' : '#166534');
    px(c, x - 7, BF - 3, 14, 1, k > 0.3 ? '#DCFCE7' : '#22C55E');
    // (its glow on the floor and the air over it: banded, dithered)
    c.fillStyle = dith(c, `rgba(74, 222, 128, ${(0.18 + 0.3 * k).toFixed(2)})`); c.fillRect(x - 18, BF - 10, 36, 6);
    if (k > 0.5) { c.fillStyle = dith(c, `rgba(134, 239, 172, ${(0.25 * k).toFixed(2)})`, 2, 1); c.fillRect(x - 10, BF - 22, 20, 12); }
  });
  // The break room
  if (!seen(state, LAIR.a - 200, LAIR.b + 900, LAIR.top - 10, LAIR.floor + 200)) return;
  for (let i = 0; i < 4; i++) {
    const L = HALL_L - 200 + i * 400;
    if (!seen(state, L, L + 400, BF + 40, F + 200)) continue;
    stamp(c, `sp-q-ben-rock-${i}`, L, BF + 40, 400, F + 200 - (BF + 40), g => { g.save(); g.beginPath(); g.rect(L, BF + 40, 400, F + 160); g.clip(); paintRock(g); g.restore(); });
  }
  for (let i = 0; i < 2; i++) {
    const L = A - 12 + i * 370, W2 = i ? Bx + 12 - L : 370;
    stamp(c, `sp-q-ben-room-${i}`, L, T - 12, W2, F + 22 - (T - 12), g => { g.save(); g.beginPath(); g.rect(L, T - 12, W2, F + 22 - (T - 12)); g.clip(); paintRoom(g); g.restore(); });
  }
  drawCrt(c, f);
  // (the pot's steam; the bulb on its cord, swaying a touch)
  for (let i = 0; i < 4; i++) { const u = ((f * 0.6 + i * 25) % 100) / 100; px(c, FRIDGE - 8 + Math.sin(f * 0.05 + i) * 4, F - 104 - u * 50, 3 + u * 4, 3 + u * 4, `rgba(230,230,235,${(0.4 * (1 - u)).toFixed(2)})`); }
  const sw = Math.sin(f * 0.02) * 3, bx = A + 330 + sw;
  c.strokeStyle = '#18181B'; c.lineWidth = 1; c.beginPath(); c.moveTo(A + 330, T + 20); c.lineTo(bx, T + 64); c.stroke();
  px(c, bx - 3, T + 62, 6, 4, '#3F3F46'); px(c, bx - 4, T + 66, 8, 9, '#FDE68A'); px(c, bx - 2, T + 67, 3, 4, '#FFFBEB');
  drawCannon(c, h.cannon, FUTURE);
  drawCannonChain(c, h.cannon, gateK(state, h.gate));
  drawBen(c, BEN_X, F, h.ben.facing, h.ben.pose, Math.floor(f / 8) % 3, h.ben.piece);
};

/** World space, over him: Ben's words over his head (in play: plain text). */
export const drawBenHallFront = (c: Ctx, state: GameState) => {
  const h = lairOf(state);
  if (seen(state, A - 12, Bx + 12, T - 12, T + 30)) stamp(c, 'sp-q-ben-near', A - 12, T - 12, Bx - A + 24, 36, paintNear);
  // (the hatch barred and its ladder chained while Ben's trial's on)
  if (seen(state, HATCH.a - 40, HATCH.b + 200, LAIR.top - 40, LAIR.floor + 10)) drawGate(c, state, h.gate, 'ladder', HATCH.b - HATCH.a, LAIR.floor - h.gate.y);
  if (!h.ben.said || h.script?.gross || !seen(state, BEN_X - 100, BEN_X + 100, F - 200, F + 10)) return;
  saidOver(c, h.ben.said.text, BEN_X, benHeadY(F), '#FFFFFF', 220);
};

/** Screen space: his gross-up while it's up; SKIP >> while the scene can be skipped. */
export const drawBenHallHud = (c: Ctx, state: GameState) => {
  if (!inLair(state)) return;
  const h = lairOf(state), sc = h.script;
  if ((h.phase === 'meet' || h.phase === 'gift') && sc?.gross) {
    drawBenGrossBack(c, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawBenGross(c, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10, 0.9 + 0.1 * Math.min(1, sc.grossT / 10), state.frame, h.phase === 'meet' ? 'armguards' : null, !!h.ben.said);
    // (his words over it, in a bubble: it's a skippable scene)
    if (h.ben.said) saidOver(c, h.ben.said.text, CANVAS_WIDTH / 2 - 60, 120);
  }
  if ((h.phase === 'meet' || h.phase === 'gift') && h.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};

/** The hallway's lights in the basement's dark: the guide lights' green, the box's, the warm light up out of the hatch. */
export const hallLights = (state: GameState): Light[] => {
  const f = state.frame, cx = state.player.pos.x + state.player.width / 2, out: Light[] = [];
  if (cx > LAND_X + 900) return out;
  GUIDES.forEach((x, i) => { if (Math.abs(x - cx) < 700) { const k = guideK(i, f); out.push({ x, y: BF - 8, r: 40 + 50 * k, a: 0.35 + 0.6 * k, color: 'rgba(74, 222, 128, 0.2)' }); } });
  if (Math.abs(BOX.x - cx) < 900 && boxOn(f)) out.push({ x: BOX.x, y: BOX.y + 18, r: 110, a: 0.55, color: 'rgba(74, 222, 128, 0.12)' });
  if (Math.abs(HATCH.a - cx) < 1000) out.push({ x: (HATCH.a + HATCH.b) / 2, y: BF - 30, r: 150, a: 0.6, color: 'rgba(255, 170, 90, 0.12)' });
  return out;
};

/** Down the hatch and in the room: its own light (warm, the bulb, the CRT's blue, the hot plate's red, a glow about him). */
export const benLairLighting = (state: GameState): SceneLight | null => {
  if (!belowHall(state)) return null;
  const f = state.frame, p = state.player;
  const lights: Light[] = [
    { x: A + 330 + Math.sin(f * 0.02) * 3, y: T + 70, r: 300, a: 0.75, color: 'rgba(255, 214, 150, 0.10)' },
    { x: CART - 4, y: F - 100, r: 110, a: 0.5 + (f % 90 < 2 ? 0.3 : 0) + 0.06 * Math.sin(f * 0.9), color: 'rgba(96, 165, 250, 0.14)' },
    { x: FRIDGE - 4, y: F - 84, r: 60, a: 0.5, color: 'rgba(248, 113, 113, 0.14)' },
    { x: (HATCH.a + HATCH.b) / 2, y: T + 10, r: 120, a: 0.35, color: 'rgba(255, 190, 120, 0.08)' },
    { x: p.pos.x + p.width / 2, y: p.pos.y + 24, r: 130, a: 0.35 },
  ];
  return { dark: 0.62, shade: [12, 8, 6], lights, rim: 0.35 };
};
