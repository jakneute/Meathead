// The town square, painted (the prototype first pass: crude but readable; peak-SNES later). Behind the street, a row
// of shopfronts (dimmed, no lit edges: they're scenery, not somewhere to stand): HOGSMEAT's crooked, snow-heaped
// timber-and-plaster fronts, the storybook square's cottages, GINGERBREAD LANE's iced houses. In the play plane, lit
// along every top he can stand on: the station's platform pillar, WANDS & SONS, the carousel's deck and canopy, the
// gorge's columns, the porches, the tower's landings and its beam, the bandstand. The set pieces: the FAIRY LAND EXPRESS
// at its platform, the BUTTER BREW cart, the carousel, the gorge (clouds painted a long way down), the troll's little
// bridge, the GRAND STAIRCASE's tower, the bandstand. The signs: storybook shingles on their posts (kit.ts storySign),
// and boards fixed to what they name. The castle's in the sky (monument.ts).

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { timeOfDay, farTint } from '../../timeOfDay';
import { signText } from '../../signLetters';
import { box, mix, hash, onScreen, storySign, fairySky, gilt, INK, type Ctx } from '../kit';
import { MONUMENT_AT } from '../monument';
import { GY } from '../geometry';
import {
  X, Y, GORGE, FAR_BANK, SOLIDS, LEDGES, SHOP, SHOP_ROOF, CAROUSEL, CANOPY, DECK, PILLAR, PORCH, TOWER, LA, PIER, RB, TL, SPEAKER, CART, x1, x0,
} from './layout';

export const drawSquareBackdrop = (c: Ctx, state: GameState) => fairySky(c, state, MONUMENT_AT.square);

// ---------------------------------------------------------------------------------------------------------------
// The shopfronts behind the street (scenery: dimmed toward the haze)

type Style = 'hog' | 'story' | 'ginger';
const AREAS: [number, number, Style][] = [[260, 3660, 'hog'], [4140, 4860, 'hog'], [4860, 6640, 'story'], [7960, 10700, 'ginger'], [12560, 14400, 'story']];
const WALLS: Record<Style, string[]> = {
  hog: ['#8A7A6A', '#9A8470', '#7A6A62', '#A08C78', '#6E6470'],
  story: ['#E8D8B8', '#D8C8E8', '#F0D0C0', '#D0E0D0'],
  ginger: ['#A8683A', '#B87A44', '#9A5E30'],
};
const ROOFS: Record<Style, string[]> = { hog: ['#4A4458', '#5A4A3A', '#3E4A5A'], story: ['#4A78D4', '#8A3A5A', '#6A4A8A', '#3A7A5A'], ginger: ['#F4F0FA', '#F8E0EA'] };
const NAMES = ['WANDS & SONS', 'HONEYPOTS', "SCRIBBLER'S", 'THE THREE BROOMS', 'OWL POST', 'JOKES & SUCH', 'ROBES', 'SWEETS', 'BUTTER BREW', 'TEA ROOM'];

const shopfront = (c: Ctx, x: number, w: number, h: number, style: Style, seed: number, dim: number) => {
  const tod = timeOfDay(), T = (col: string) => mix(farTint(col, 0.3, tod), tod.haze, dim);
  const wall = T(WALLS[style][seed % WALLS[style].length]), roof = T(ROOFS[style][Math.floor(seed / 3) % ROOFS[style].length]);
  const lean = style === 'hog' ? (hash(seed) - 0.5) * 18 : 0, top = GY - h;
  // (the wall, leaning a bit in Hogsmeat; timber on the plaster ones)
  c.fillStyle = T(INK); c.beginPath(); c.moveTo(x - 1, GY); c.lineTo(x + lean * 0.3 - 1, top - 1); c.lineTo(x + w + lean + 1, top - 1); c.lineTo(x + w + 1, GY); c.closePath(); c.fill();
  c.fillStyle = wall; c.beginPath(); c.moveTo(x, GY); c.lineTo(x + lean * 0.3, top); c.lineTo(x + w + lean, top); c.lineTo(x + w, GY); c.closePath(); c.fill();
  if (style === 'hog') { const tb = T('#3A2A1E'); for (let k = 1; k < 3; k++) box(c, x + lean * 0.15, top + (h * k) / 3, w + lean * 0.5, 3, tb); box(c, x + w / 2 - 2 + lean * 0.4, top, 3, h, tb); }
  if (style === 'ginger') { for (let k = 0; k < w; k += 10) box(c, x + k, top + 6, 6, 3, T('#FFFFFF')); for (let k = 0; k < w; k += 14) box(c, x + k + 3, GY - 14, 6, 6, T(['#F472B6', '#60A5FA', '#FDE047'][k % 3])); }
  // (the roof: pitched, crooked in Hogsmeat, snow heaped on it (iced on the gingerbread))
  const rh = style === 'story' ? 50 : 60, peak = x + w * (0.45 + (hash(seed * 2) - 0.5) * 0.3) + lean;
  c.fillStyle = T(INK); c.beginPath(); c.moveTo(x - 10 + lean * 0.3, top + 2); c.lineTo(peak, top - rh); c.lineTo(x + w + 10 + lean, top + 2); c.closePath(); c.fill();
  c.fillStyle = roof; c.beginPath(); c.moveTo(x - 8 + lean * 0.3, top); c.lineTo(peak, top - rh + 2); c.lineTo(x + w + 8 + lean, top); c.closePath(); c.fill();
  c.fillStyle = T('#F4F8FF'); c.beginPath(); c.moveTo(x - 8 + lean * 0.3, top - 2); c.lineTo(peak, top - rh); c.lineTo(x + w + 8 + lean, top - 2); c.lineTo(x + w + 8 + lean, top + 3); c.lineTo(peak, top - rh + 9); c.lineTo(x - 8 + lean * 0.3, top + 3); c.closePath(); c.fill();
  // (a chimney)
  if (seed % 2) { box(c, peak + 10, top - rh + 6, 10, 26, T('#6A4A3A')); box(c, peak + 8, top - rh + 2, 14, 5, T('#F4F8FF')); }
  // (windows: lit after dark; a door; a name board fixed over the door)
  const lit = tod.lamps > 0.3, win = lit ? T('#FFD87A') : T('#3A3060');
  for (let k = 0; k < Math.floor(w / 46); k++) { const wx = x + 14 + k * 46 + lean * 0.4; box(c, wx - 1, top + 16, 22, 26, T(INK)); box(c, wx, top + 17, 20, 24, win); box(c, wx + 9, top + 17, 2, 24, T(INK)); box(c, wx, top + 28, 20, 2, T(INK)); }
  box(c, x + w / 2 - 13, GY - 44, 26, 44, T(INK)); box(c, x + w / 2 - 11, GY - 42, 22, 42, T('#5A3A1E'));
  if (style !== 'ginger' && seed % 3 !== 2) {
    const name = NAMES[seed % NAMES.length], bw = name.length * 8 + 16, by = GY - 66;
    box(c, x + w / 2 - bw / 2 - 1, by - 1, bw + 2, 16, T(INK)); box(c, x + w / 2 - bw / 2, by, bw, 14, T(style === 'hog' ? '#2A3A5A' : '#5A2A4A'));
    if (dim < 0.5) signText(c, name, x + w / 2, by + 11, { ...gilt(1), shadow: undefined });
  }
};

const drawFronts = (c: Ctx, state: GameState) => {
  for (const [a, b, style] of AREAS) {
    if (!onScreen(state, X(a) - 200, X(b) + 200)) continue;
    let x = a, i = 0;
    while (x < b) {
      const seed = Math.floor(a / 7) + i * 13, w = 120 + Math.floor(hash(seed) * 90), h = style === 'story' ? 120 + hash(seed * 3) * 50 : 150 + hash(seed * 3) * 90;
      if (onScreen(state, X(x) - 40, X(x + w) + 40)) shopfront(c, X(x), w, h, style, seed, 0.35);
      x += w + 16; i++;
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The play plane: ground, walls with their lit tops, ledges with theirs

const COBBLE = '#7A7088', COBBLE_LIT = '#A49AB2', EARTH = '#3A3048';
const drawGround = (c: Ctx, state: GameState) => {
  const L = state.camera.x - 40, R = state.camera.x + 840;
  const runs: [number, number][] = [[X(-200), X(GORGE.a)], [X(FAR_BANK), X(x1 - x0 + 200)]];
  for (const [a, b] of runs) {
    const s = Math.max(a, L), e = Math.min(b, R);
    if (e <= s) continue;
    box(c, s, GY, e - s, 600, EARTH);
    box(c, s, GY, e - s, 18, COBBLE);
    box(c, s, GY, e - s, 3, '#F2E2B8');
    for (let x = Math.floor(s / 16) * 16; x < e; x += 16) { box(c, x, GY + 6, 1, 12, '#5A5068'); box(c, x + 8, GY + 3, 6, 2, COBBLE_LIT); }
  }
};

/** The gorge: its cliffs, the void, painted clouds a long way down (a park's bottomless). */
const drawGorge = (c: Ctx, state: GameState) => {
  const a = X(GORGE.a), b = X(FAR_BANK);
  if (!onScreen(state, a - 40, b + 40)) return;
  const tod = timeOfDay();
  c.fillStyle = farTint('#8EA6D8', 0.5, tod); c.fillRect(a, GY, b - a, 900);
  for (let i = 0; i < 6; i++) { c.fillStyle = farTint(['#C8D8F4', '#E0E8FA', '#F4F6FE'][i % 3], 0.4, tod); c.beginPath(); c.ellipse(a + 80 + i * 200, GY + 340 + (i % 2) * 30, 110, 28, 0, 0, Math.PI * 2); c.fill(); }
  // (the cliff faces either side, stone going down)
  for (const [x, dir] of [[a, -1], [b, 1]] as const) {
    c.fillStyle = INK; c.beginPath(); c.moveTo(x, GY); c.lineTo(x - dir * 4, GY + 400); c.lineTo(x + dir * 30, GY + 400); c.lineTo(x + dir * 30, GY); c.closePath(); c.fill();
    c.fillStyle = '#5A5068'; c.beginPath(); c.moveTo(x - dir * 2, GY); c.lineTo(x - dir * 6, GY + 400); c.lineTo(x + dir * 30, GY + 400); c.lineTo(x + dir * 30, GY); c.closePath(); c.fill();
  }
};

const STONE = '#9A90B0', LIP = '#F2E2B8';
/** A solid, lit along its top (standable reads standable). */
const solidBox = (c: Ctx, a: number, b: number, top: number, bottom: number, col = STONE) => {
  box(c, a - 1, top - 1, b - a + 2, bottom - top + 2, INK);
  box(c, a, top, b - a, bottom - top, col);
  box(c, b - 8, top, 8, bottom - top, mix(col, '#000000', 0.2));
  for (let y = top + 10; y < bottom; y += 12) box(c, a, y, b - a, 1, mix(col, '#000000', 0.25));
  box(c, a, top, b - a, 3, LIP);
};
/** A one-way ledge, lit along its top. */
const ledgeBox = (c: Ctx, a: number, b: number, y: number, col = '#7A5A3A') => {
  box(c, a - 1, y - 1, b - a + 2, 14, INK); box(c, a, y, b - a, 12, col); box(c, a, y + 9, b - a, 3, mix(col, '#000000', 0.3)); box(c, a, y, b - a, 3, LIP);
  for (let x = a + 14; x < b - 6; x += 30) { box(c, x, y + 12, 4, 10, INK); box(c, x + 1, y + 12, 2, 9, mix(col, '#000000', 0.15)); }
};

// ---------------------------------------------------------------------------------------------------------------
// The set pieces

const drawStation = (c: Ctx, state: GameState) => {
  if (!onScreen(state, X(-200), X(1300))) return;
  const f = state.frame;
  // (the FAIRY LAND EXPRESS: a red engine and two coaches, steam off the stack, behind the platform)
  const ty = GY - 30;
  for (let k = 0; k < 2; k++) { const cx = X(-120 + k * 260); box(c, cx - 1, ty - 91, 242, 92, INK); box(c, cx, ty - 90, 240, 80, '#8E1C24'); box(c, cx, ty - 90, 240, 6, '#C83A3A'); for (let w = 0; w < 5; w++) box(c, cx + 14 + w * 46, ty - 76, 30, 26, '#FFE9A8'); box(c, cx, ty - 14, 240, 6, '#E0AE3A'); }
  const ex = X(400);
  box(c, ex - 1, ty - 101, 202, 102, INK); box(c, ex, ty - 100, 200, 90, '#9B1C1C'); box(c, ex + 120, ty - 140, 70, 50, '#7A1218'); box(c, ex + 40, ty - 130, 22, 40, '#2A2A30');
  c.fillStyle = INK; c.beginPath(); c.ellipse(ex + 120, ty - 56, 80, 30, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#B91C1C'; c.beginPath(); c.ellipse(ex + 120, ty - 56, 78, 28, 0, 0, Math.PI * 2); c.fill();
  for (let k = 0; k < 4; k++) { const sx = ex + 50 + Math.sin(f * 0.03 + k) * 6, sy = ty - 140 - k * 18 - (f % 40) * 0.4; c.fillStyle = `rgba(240, 240, 250, ${0.7 - k * 0.15})`; c.beginPath(); c.arc(sx, sy, 10 + k * 4, 0, Math.PI * 2); c.fill(); }
  for (let k = 0; k < 4; k++) { c.fillStyle = INK; c.beginPath(); c.arc(ex + 30 + k * 45, ty - 6, 15, 0, Math.PI * 2); c.fill(); c.fillStyle = '#E0AE3A'; c.beginPath(); c.arc(ex + 30 + k * 45, ty - 6, 12, 0, Math.PI * 2); c.fill(); }
  signText(c, 'FAIRY LAND EXPRESS', ex + 100, ty - 70, gilt(1));
  // (the platform's edge, the brick pillar: PLATFORM 7 5/8 on its plaque, fixed to it)
  const p = PILLAR;
  solidBox(c, X(p.a), X(p.b), Y(p.h), GY, '#9A4A3A');
  for (let y = Y(p.h) + 6; y < GY; y += 8) for (let x = X(p.a) + ((y / 8) % 2) * 8; x < X(p.b) - 4; x += 16) box(c, x, y, 1, 7, '#6A2A20');
  box(c, X(p.a) + 4, Y(p.h) + 22, p.b - p.a - 8, 20, INK); box(c, X(p.a) + 5, Y(p.h) + 23, p.b - p.a - 10, 18, '#1E3A6E');
  signText(c, '7 5/8', X((p.a + p.b) / 2), Y(p.h) + 36, gilt(1));
  storySign(c, X(140), GY, ['FAIRY LAND', 'HOGSMEAT VILLAGE >']);
};

const drawCart = (c: Ctx, state: GameState) => {
  const x = X(CART);
  if (!onScreen(state, x - 100, x + 100)) return;
  // (the BUTTER BREW cart: wheels, a striped awning on poles (dimmed: not a platform), the price board fixed to it)
  const awn = mix('#E0AE3A', timeOfDay().haze, 0.35);
  box(c, x - 52, GY - 104, 4, 74, '#5A3A1E'); box(c, x + 48, GY - 104, 4, 74, '#5A3A1E');
  for (let k = 0; k < 6; k++) box(c, x - 58 + k * 20, GY - 112, 20, 12, k % 2 ? awn : mix('#9B1C1C', timeOfDay().haze, 0.35));
  box(c, x - 56, GY - 32, 112, 14, INK); box(c, x - 55, GY - 31, 110, 12, '#8A5A30');
  for (const wx of [x - 34, x + 34]) { c.fillStyle = INK; c.beginPath(); c.arc(wx, GY - 10, 11, 0, Math.PI * 2); c.fill(); c.fillStyle = '#B8844A'; c.beginPath(); c.arc(wx, GY - 10, 8, 0, Math.PI * 2); c.fill(); }
  box(c, x + 20, GY - 70, 54, 30, INK); box(c, x + 21, GY - 69, 52, 28, '#1E3A6E');
  signText(c, 'BUTTER', x + 47, GY - 58, gilt(1)); signText(c, 'BREW $14', x + 47, GY - 46, gilt(1));
};

const drawShop = (c: Ctx, state: GameState) => {
  const a = X(SHOP.a), b = X(SHOP.b);
  if (!onScreen(state, a - 40, b + 40)) return;
  // (WANDS & SONS: a tall narrow front stacked high with wand boxes in the window, its roof the way on, lit along it)
  solidBox(c, a, b, Y(SHOP_ROOF), GY, '#6E6070');
  for (let k = 0; k < 3; k++) { const wx = a + 30 + k * 120; box(c, wx - 1, Y(SHOP_ROOF) + 40, 82, 92, INK); box(c, wx, Y(SHOP_ROOF) + 41, 80, 90, '#2A2048'); for (let r = 0; r < 8; r++) for (let q = 0; q < 4; q++) box(c, wx + 4 + q * 19, Y(SHOP_ROOF) + 45 + r * 11, 16, 8, ['#5A3A1E', '#3A2A4A', '#7A5A3A'][(r + q) % 3]); }
  box(c, a + 150, GY - 70, 60, 70, INK); box(c, a + 152, GY - 68, 56, 68, '#3A2410');
  box(c, a + 60, Y(SHOP_ROOF) + 12, 280, 22, INK); box(c, a + 61, Y(SHOP_ROOF) + 13, 278, 20, '#2A3A5A');
  signText(c, 'WANDS & SONS', (a + b) / 2, Y(SHOP_ROOF) + 28, gilt(2));
  // (snow on the roof's back edge, not on its top: the top's the walk)
  box(c, a, Y(SHOP_ROOF) - 6, b - a, 3, '#F4F8FF');
};

const drawCarousel = (c: Ctx, state: GameState) => {
  const a = X(CAROUSEL.a), b = X(CAROUSEL.b), f = state.frame;
  if (!onScreen(state, a - 60, b + 60)) return;
  // (the poles and the horses going up and down on them (scenery: they don't carry him), the deck, the striped canopy)
  for (let k = 0; k < 6; k++) {
    const px = a + 40 + k * 72, bob = Math.sin(f * 0.05 + k * 1.3) * 10;
    box(c, px - 1, Y(CANOPY) + 12, 3, CANOPY - DECK - 12, '#E0AE3A');
    const hy = Y(DECK) - 60 + bob, col = ['#FFFFFF', '#F4C8A0', '#C8A8E8'][k % 3];
    box(c, px - 22, hy - 1, 44, 22, INK); box(c, px - 21, hy, 42, 20, col); box(c, px + 14, hy - 16, 12, 22, INK); box(c, px + 15, hy - 15, 10, 20, col); box(c, px - 12, hy + 20, 4, 18, INK); box(c, px + 8, hy + 20, 4, 18, INK); box(c, px - 6, hy - 4, 14, 6, '#9B1C1C');
  }
  ledgeBox(c, a, b, Y(DECK), '#7A4A5A');
  // (the canopy: scalloped, red and gold stripes, a gold finial; its top lit (it's stood on))
  const cy = Y(CANOPY);
  box(c, a - 21, cy - 1, b - a + 42, 30, INK);
  for (let x = a - 20, k = 0; x < b + 20; x += 22, k++) box(c, x, cy, Math.min(22, b + 20 - x), 28, k % 2 ? '#C81E3A' : '#F6D365');
  for (let x = a - 20; x < b + 20; x += 22) { c.fillStyle = INK; c.beginPath(); c.arc(x + 11, cy + 28, 11, 0, Math.PI); c.fill(); c.fillStyle = '#C81E3A'; c.beginPath(); c.arc(x + 11, cy + 28, 9, 0, Math.PI); c.fill(); }
  box(c, a - 20, cy, b - a + 40, 3, LIP);
  box(c, (a + b) / 2 - 3, cy - 30, 6, 30, '#E0AE3A');
};

const drawGingerbread = (c: Ctx, state: GameState) => {
  // (the gorge's far-bank porch house and the lane's porch house: iced gingerbread fronts, their porch roofs lit)
  for (const [a, b, h] of [[PORCH.a, PORCH.b, PORCH.h], [9200, 9350, 130]] as const) {
    if (!onScreen(state, X(a) - 60, X(b) + 60)) continue;
    box(c, X(a) + 10, Y(h) + 12, b - a - 20, h - 12, '#A8683A');
    for (let x = X(a) + 16; x < X(b) - 14; x += 12) box(c, x, Y(h) + 16, 6, 3, '#FFFFFF');
    box(c, X(a) + (b - a) / 2 - 14, GY - 46, 28, 46, '#5A2A10');
    for (const px of [X(a) + 12, X(b) - 16]) { box(c, px - 1, Y(h) + 12, 6, h - 12, INK); for (let y = Y(h) + 14; y < GY; y += 8) box(c, px, y, 4, 4, y % 16 ? '#FFFFFF' : '#E83A5A'); }
    ledgeBox(c, X(a), X(b), Y(h), '#C87A44');
  }
  // (the troll's little stone bridge over a painted brook, scenery)
  const bx = X(9420);
  if (onScreen(state, bx - 120, bx + 120)) {
    const k = 0.35, h = timeOfDay().haze;
    box(c, bx - 110, GY - 4, 220, 4, mix('#6AA8E8', h, k));
    c.fillStyle = mix('#8A84A0', h, k); c.beginPath(); c.moveTo(bx - 100, GY); c.quadraticCurveTo(bx, GY - 60, bx + 100, GY); c.lineTo(bx + 80, GY); c.quadraticCurveTo(bx, GY - 40, bx - 80, GY); c.closePath(); c.fill();
  }
};

const drawTower = (c: Ctx, state: GameState) => {
  const a = X(TOWER.a), b = X(TOWER.b);
  if (!onScreen(state, a - 100, b + 300)) return;
  // (the back wall: stone in courses, tall arched windows, dim (scenery); torch brackets)
  const h = timeOfDay().haze, top = Y(TOWER.top + 80);
  c.fillStyle = mix('#5A5070', h, 0.35); c.fillRect(a, top, b - a, GY - top);
  for (let y = top + 12; y < GY; y += 16) box(c, a, y, b - a, 1, mix('#4A4060', h, 0.35));
  for (let x = a + 80; x < b - 40; x += 220) for (const wy of [Y(560), Y(330)]) { box(c, x, wy, 46, 110, mix('#2A2048', h, 0.3)); c.fillStyle = mix('#2A2048', h, 0.3); c.beginPath(); c.arc(x + 23, wy, 23, Math.PI, 0); c.fill(); }
  // (the far wall's front: the way out's over its top)
  // (the landings, the pier: stone, lit)
  for (const L of [LA, PIER, RB, TL]) ledgeBox(c, X(L.a), X(L.b), Y(L.h), '#7A7090');
  box(c, X(PIER.a) + 70, Y(PIER.h) + 12, 60, PIER.h - 12, '#6A6084');
  box(c, X(LA.a), Y(LA.h) + 12, 30, LA.h - 12, '#6A6084');
  box(c, X(RB.b) - 30, Y(RB.h) + 12, 30, RB.h - 12, '#6A6084');
  box(c, X(TL.a), Y(TL.h) + 12, 26, TL.h - 12, '#6A6084');
};

const drawBandstand = (c: Ctx, state: GameState) => {
  const a = X(SPEAKER.stand.a), b = X(SPEAKER.stand.b);
  if (!onScreen(state, a - 80, b + 80)) return;
  // (the gazebo's roof on its posts (scenery, dimmed), the floor (stood on: lit))
  const h = timeOfDay().haze;
  for (const px of [a + 10, (a + b) / 2, b - 14]) box(c, px, Y(160), 6, 136, mix('#F2EAD0', h, 0.25));
  c.fillStyle = mix('#3A7A5A', h, 0.3); c.beginPath(); c.moveTo(a - 20, Y(160)); c.lineTo((a + b) / 2, Y(230)); c.lineTo(b + 20, Y(160)); c.closePath(); c.fill();
  box(c, a - 20, Y(162), b - a + 40, 6, mix('#F6D365', h, 0.3));
};

// ---------------------------------------------------------------------------------------------------------------

/** Behind everything that moves. */
export const drawSquareBack = (c: Ctx, state: GameState) => {
  drawFronts(c, state);
  drawGorge(c, state);
  drawTower(c, state);
  drawGround(c, state);
  drawStation(c, state);
  drawCart(c, state);
  drawBandstand(c, state);
  for (const [a, b, top, bot] of SOLIDS) {
    if (!onScreen(state, X(a) - 20, X(b) + 20)) continue;
    if (a === SHOP.a || a === PILLAR.a) continue;
    solidBox(c, X(a), X(b), Y(top), bot !== undefined ? Y(bot) : GY, a >= SPEAKER.stand.a ? '#E8D8B8' : STONE);
  }
  drawShop(c, state);
  drawCarousel(c, state);
  drawGingerbread(c, state);
  for (const [a, b, h] of LEDGES) {
    if (!onScreen(state, X(a) - 20, X(b) + 20)) continue;
    // (the carousel's, the porches', the tower's are drawn with their set pieces)
    if ((a >= CAROUSEL.a - 20 && b <= CAROUSEL.b + 20) || a === PORCH.a || a === 9200 || [LA.a, PIER.a, RB.a, TL.a].includes(a)) continue;
    ledgeBox(c, X(a), X(b), Y(h), h >= 360 ? '#7A7090' : '#7A5A3A');
  }
  // (the signs, on their posts)
  const signs: [number, string[], object?][] = [
    [3300, ['WANDS & SONS', 'MIND THE STAIRS']], [4980, ['THE PRANCING PONY', 'CAROUSEL']], [6560, ['THE WISHING GORGE', 'BOTTOMLESS. PROBABLY.'], { warn: true }],
    [8780, ['GINGERBREAD LANE']], [10800, ['THE GRAND STAIRCASE', 'STAIRS MAY MOVE']], [13360, ['THE BANDSTAND', 'ANNOUNCEMENTS TODAY']],
  ];
  for (const [x, words, o] of signs) if (onScreen(state, X(x) - 120, X(x) + 120)) storySign(c, X(x), GY, words, o as { warn?: boolean });
};

/** The lamps after dark: the station's, the shops', the bandstand's lantern. */
export const squareLamps = (state: GameState): Light[] => {
  if (timeOfDay().lamps < 0.05) return [];
  const out: Light[] = [];
  for (const x of [200, 1400, 2400, 3300, 5000, 5600, 8800, 9600, 10800, 12000, 13400, SPEAKER.post]) if (onScreen(state, X(x) - 200, X(x) + 200)) out.push({ x: X(x), y: GY - 120, r: 120, a: 0.6, color: '#FFD08A' });
  return out;
};
