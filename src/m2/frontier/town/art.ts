// Sawdust Gulch and the mines, drawn (the prototype first pass: crude but readable: flat colors with a lit and a shaded
// tone, an ink edge, recognizable silhouettes). The PARK's frontier town: plywood false fronts on 2x4 braces (you can
// see the bracing from the side), painted-on windows, fake gold in the assay office's window, a GENERAL STORE that's a
// gift shop, a WILD WEST SHOW sign, guests; then the mill and its pond, the lumber yard, the Mother Lode Mine (a
// fiberglass mountain with its bolts showing outside, murky inside, lantern-lit: never black) and the log ride's queue.
// (The playtest: everything bigger: the fronts two stories and more, doors a head taller than him, the saloon a proper
// saloon (batwings, the long bar and its brass rail, spittoons, the mirror and the bottles, the stage, the piano, the
// card tables, the stairs up to the rooms), the queue a long, long wait.)
//
// Standable reads standable: every ledge, roof, deck, table and landing has its lit top lip; the awnings and the
// painted-on balconies of the far fronts are dimmed (they're not to stand on). Impassable reads impassable: the barred
// batwings, the locked back door, the showdown's gates (SHOW IN PROGRESS), the mill's works stacked solid under its deck.

import type { GameState } from '../../../m1/game/core/state';
import { drawPerson } from '../../adventure/temple/people';
import { signText } from '../../signLetters';
import { GY } from '../geometry';
import { box, mix, INK, frontierSky, frontierSign, hash, burned, painted, type Ctx } from '../kit';
import { townOf } from './state';
import {
  GROUND, LEDGES, SOLIDS, COVER, WATERS, SIGNS, LANTERNS, CANARIES, GAS, SALOON, SQUARE, LADDER, CART_RUN, QUEUE, STATION,
  FY, CEIL_Y, X, Y, inMine, inSaloon,
} from './layout';
import { onScreen, viewOf } from './view';
import { squareShut, wreckHere } from './scenes';
import { drawWreck, drawCanopy, firstAidOpen, wreckLights } from './crash';

const LIP = '#E8C890';
const DIRT = '#7A5A38', DIRT_LIP = '#B8935A';
const ROCK = '#3A2A1E', ROCK_LIT = '#5A4430';

// ---------------------------------------------------------------------------------------------------------------
// Little helpers

/** A board with burned letters on it, hung or nailed at its middle (x, y). */
export const board = (c: Ctx, x: number, y: number, lines: string[], col = '#A0703C', big = 2) => {
  const looks = lines.map((_, i) => burned(i ? 1 : big, i));
  const w = Math.max(...lines.map((l, i) => l.length * (i ? 6 : 6 * big) + 16)), h = lines.length > 1 ? 11 + 7 * big + (lines.length - 1) * 12 : 10 + 7 * big;
  box(c, x - w / 2 - 1, y - h / 2 - 1, w + 2, h + 2, INK); box(c, x - w / 2, y - h / 2, w, h, col); box(c, x - w / 2, y - h / 2, w, 2, mix(col, '#FFFFFF', 0.3));
  let yy = y - h / 2 + 5 + 7 * big;
  lines.forEach((l, i) => { signText(c, l, x, yy, looks[i]); yy += 12; });
};
/** A plank sign painted on (white letters, a dark board). */
const painty = (c: Ctx, x: number, y: number, text: string, col = '#7F1D1D', ink = '#FEF3C7', cell = 1) => {
  const w = text.length * 6 * cell + 14, h = 7 * cell + 10;
  box(c, x - w / 2 - 1, y - h / 2 - 1, w + 2, h + 2, INK); box(c, x - w / 2, y - h / 2, w, h, col);
  signText(c, text, x, y + (7 * cell) / 2, painted(cell, ink));
};
/** A painted sign up on a post stood in the ground at (x, feet), its board's middle `up` over the ground. */
const postBoard = (c: Ctx, x: number, feet: number, up: number, text: string, col = '#1C1917', ink = '#FDE047', cell = 1) => {
  box(c, x - 3, feet - up, 6, up, INK); box(c, x - 2, feet - up, 4, up, '#6B4423');
  painty(c, x, feet - up, text, col, ink, cell);
};
const ledgeArt = (c: Ctx, x: number, y: number, w: number, col = '#7A5230') => { box(c, x, y, w, 14, INK); box(c, x + 1, y + 1, w - 2, 12, col); box(c, x + 1, y, w - 2, 3, LIP); };
const groundRun = (c: Ctx, a: number, b: number, y: number, under = false) => {
  box(c, a, y, b - a, 1500, under ? ROCK : DIRT);
  box(c, a, y, b - a, 4, under ? ROCK_LIT : DIRT_LIP);
  if (!under) for (let x = a + 30; x < b; x += 70) box(c, x + hash(x) * 20, y + 10 + hash(x * 3) * 12, 18, 3, mix(DIRT, '#000000', 0.15));
};

/** A false front: a plywood store front on 2x4 braces, two stories (its sign up top, painted windows, a door taller
 *  than him, a dimmed awning). */
const falseFront = (c: Ctx, x: number, w: number, h: number, col: string, name: string[], opts: { awning?: string; door?: boolean; win?: number; rows?: number } = {}) => {
  const top = GY - h;
  // (the bracing showing past its edge)
  c.strokeStyle = '#5A4028'; c.lineWidth = 4; c.beginPath(); c.moveTo(x + w - 6, top + 30); c.lineTo(x + w + 40, GY); c.moveTo(x + w - 6, top + 120); c.lineTo(x + w + 24, GY); c.stroke();
  box(c, x - 1, top - 1, w + 2, h + 1, INK); box(c, x, top, w, h, col);
  for (let y = top + 8; y < GY; y += 12) box(c, x, y, w, 1, mix(col, '#000000', 0.12));
  // (the stepped parapet up top)
  box(c, x + 12, top - 28, w - 24, 28, INK); box(c, x + 13, top - 27, w - 26, 27, col); box(c, x + 13, top - 27, w - 26, 3, mix(col, '#FFFFFF', 0.25));
  board(c, x + w / 2, top + 20, name, '#E7D8B0', name[0].length > 12 ? 1 : 2);
  // (the windows: upstairs, and down beside the door)
  const n = opts.win ?? 2, rows = opts.rows ?? 2;
  for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) {
    const wx = x + 18 + i * ((w - 36) / n) + ((w - 36) / n - 40) / 2, wy = r === 0 ? top + 52 : GY - 120;
    if (r === 1 && Math.abs(wx + 20 - (x + w / 2)) < 50) continue;
    box(c, wx - 1, wy - 1, 42, 58, INK); box(c, wx, wy, 40, 56, '#2A3A4A'); box(c, wx + 19, wy, 2, 56, INK); box(c, wx, wy + 27, 40, 2, INK); box(c, wx + 3, wy + 3, 10, 3, '#8AA8C0');
  }
  if (opts.door !== false) { box(c, x + w / 2 - 26, GY - 104, 52, 104, INK); box(c, x + w / 2 - 25, GY - 103, 50, 103, mix(col, '#000000', 0.45)); box(c, x + w / 2 + 14, GY - 52, 4, 4, '#CA8A04'); }
  if (opts.awning) {
    // (an awning: dimmed, sloped, fringed: not a platform)
    c.globalAlpha = 0.55;
    c.fillStyle = INK; c.beginPath(); c.moveTo(x - 8, GY - 150); c.lineTo(x + w + 8, GY - 150); c.lineTo(x + w + 18, GY - 128); c.lineTo(x - 18, GY - 128); c.closePath(); c.fill();
    for (let k = 0; k < (w + 36) / 16; k++) { c.fillStyle = k % 2 ? opts.awning : '#E7E5E4'; c.fillRect(x - 17 + k * 16, GY - 148, 16, 18); }
    c.globalAlpha = 1;
  }
  // (the boardwalk in front)
  box(c, x - 8, GY - 8, w + 16, 8, '#7A5230'); for (let k = x - 8; k < x + w + 8; k += 18) box(c, k, GY - 8, 1, 8, INK);
};

/** A guest (a decoration: in a background crowd), feet at (x, y). */
const guest = (c: Ctx, x: number, y: number, seed: number, f: number, pose: 'stand' | 'cheer' | 'photo' | 'point' | 'sit' = 'stand', mood: 'shocked' | 'happy' | 'bored' | 'scared' = 'bored', facing = 1, outfit: 'guest' | 'operator' | 'maint' = 'guest', scale = 1) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(facing < 0 ? -scale : scale, scale);
  drawPerson(c, { seed, outfit, f, pose, mood });
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The backdrop

export const drawTownBackdrop = (c: Ctx, state: GameState) => {
  const v = viewOf(state), cx = v.x + v.w / 2, cy = v.y + v.h / 2;
  if (inMine(cx, cy) && cy > GY + 160) { box(c, 0, 0, 2000, 2000, '#140D08'); return true; }
  return frontierSky(c, state);
};

// ---------------------------------------------------------------------------------------------------------------
// The world, behind everything that moves

export const drawTownBack = (c: Ctx, state: GameState, wreck: boolean) => {
  const f = state.frame;
  const on = (a: number, b: number) => onScreen(state, X(a), X(b));
  // ---- the far fronts along the street (behind the ground's lip)
  if (on(-1000, 1100)) drawEndOfLine(c, state, wreck);
  if (on(850, 3800)) {
    falseFront(c, X(920), 240, 290, '#A0603A', ['GENERAL STORE', 'SOUVENIRS'], { awning: '#B91C1C' });
    falseFront(c, X(1210), 200, 250, '#5A7A8A', ['ASSAY', 'OFFICE'], { awning: '#1D4ED8' });
    // (the window: fake gold)
    box(c, X(1240), GY - 98, 36, 12, '#EAB308'); box(c, X(1243), GY - 101, 14, 5, '#FDE047'); painty(c, X(1320), GY - 160, 'GOLD! (FAKE)', '#1C1917', '#FDE047');
    falseFront(c, X(1520), 290, 320, '#7A5A8A', ['BANK OF', 'SAWDUST GULCH'], { win: 3 });
    // (the bank's balcony rail: the ledge is its floor)
    for (let x = X(1562); x < X(1800); x += 16) box(c, x, Y(200), 3, 40, '#5A3A1E');
    box(c, X(1560), Y(202), X(1800) - X(1560), 4, '#7A5230');
    falseFront(c, X(1870), 200, 240, '#8A6A3A', ['FUDGE', 'MADE DAILY']);
    falseFront(c, X(2110), 260, 270, '#6A7A4A', ['DRY GOODS']);
    falseFront(c, X(2860), 230, 260, '#E7E5E4', ['BARBER']);
    // (the barber pole)
    box(c, X(3010), GY - 160, 16, 70, INK); for (let k = 0; k < 6; k++) box(c, X(3011), GY - 159 + ((k * 12 + f * 0.5) % 68), 14, 6, k % 2 ? '#DC2626' : '#1D4ED8');
    falseFront(c, X(3200), 240, 300, '#3F3F46', ['UNDERTAKER', 'COFFINS'], { win: 2 });
    drawCoffin(c, X(3330), GY - 104);
    falseFront(c, X(3480), 230, 250, '#7A8A9A', ['BATHHOUSE', 'HOT BATHS 25 CENTS']);
    drawWaterTower(c, X(2700));
    drawWagon(c, X(2250), f);
  }
  // ---- the saloon (outside its front, or opened up while he's in it)
  if (on(3700, 5000)) drawSaloon(c, state);
  // ---- the rooftops' stores
  if (on(4900, 5900)) {
    store(c, X(5000), X(5250), Y(190), '#8A4A3A', 'HOTEL');
    store(c, X(5330), X(5560), Y(280), '#4A6A5A', 'OPERA HOUSE');
    store(c, X(5640), X(5850), Y(200), '#9A7A4A', 'POST OFFICE');
  }
  // ---- the showdown's street
  if (on(5850, 7000)) drawSquare(c, state);
  // ---- the livery and the smithy
  if (on(6980, 8300)) drawLivery(c, state);
  // ---- the mill pond's banks, the mill, the lumber yard
  if (on(9500, 11100)) drawMill(c, state);
  if (on(10800, 11320)) drawYard(c, state);
  // ---- the mine (outside: the mountain and the entrance; inside: the tunnel's walls)
  if (on(11000, 14800)) drawMine(c, state);
  if (on(14400, 15900)) drawQueue(c, state);
  // ---- the ground
  for (const [a, b, h1] of GROUND) if (on(a, b)) groundRun(c, X(a), X(b), Y(h1), h1 < -100);
  // ---- the water's body (under the logs and him)
  for (const w of WATERS) if (onScreen(state, w.a, w.b)) drawWaterBack(c, w);
  // (the rock down into the flooded shaft's water, and the hump under it: swim under them)
  if (on(13100, 14320)) {
    const rock = (a: number, b: number, t: number, bt: number) => {
      box(c, X(a) - 1, t, X(b) - X(a) + 2, bt - t + 1, INK); box(c, X(a), t, X(b) - X(a), bt - t, ROCK_LIT);
      for (let y = t + 20; y < bt - 8; y += 30) for (let x = X(a) + 10; x < X(b) - 40; x += 90) box(c, x + hash(x + y) * 40, y, 30, 6, ROCK);
      box(c, X(a), bt - 3, X(b) - X(a), 3, '#2A1E14');
    };
    rock(13120, 14300, CEIL_Y, Y(-560));
    rock(13520, 13860, Y(-560) - 1, Y(-740));
  }
  // ---- ledges and the solids he stands on
  for (const [a, b, h] of LEDGES) if (on(a - 20, b + 20)) drawLedge(c, state, a, b, h);
  for (const s of SOLIDS) drawSolid(c, state, s);
  for (const [a, b, h] of COVER) if (on(a, b)) drawCover(c, X(a), X(b), Y(h));
  // ---- signs
  for (const [rx, h, words, warn] of SIGNS) if (words.length && on(rx - 140, rx + 140)) frontierSign(c, X(rx), Y(h), words, { warn, seed: rx, tall: h < -100 ? 62 : 110 });
  // ---- the canaries in their cages
  for (const [rx, alive] of CANARIES) if (on(rx - 30, rx + 30)) drawCanary(c, X(rx), CEIL_Y + 50, f, alive && townOf(state).gasGone >= 0);
};

// ---------------------------------------------------------------------------------------------------------------
// The pieces

/** A ledge: plain planks, or (the saloon's card tables) a table on its legs. */
const drawLedge = (c: Ctx, state: GameState, a: number, b: number, h: number) => {
  const inside = inSaloon(state.player.pos.x + state.player.width / 2, state.player.pos.y + state.player.height);
  const saloon = a >= 3800 && b <= 4900;
  if (saloon && !inside) return;
  if (saloon && (a === 4110 || a === 4620)) {
    // (a card table: green baize, its legs, the cards and the chips)
    const xa = X(a), xb = X(b), top = Y(h);
    for (const lx of [xa + 6, xb - 10]) box(c, lx, top + 8, 5, GY - top - 8, '#3F2A14');
    box(c, xa - 4, top, xb - xa + 8, 9, INK); box(c, xa - 3, top + 1, xb - xa + 6, 7, '#166534'); box(c, xa - 3, top, xb - xa + 6, 2, LIP);
    for (let k = 0; k < 4; k++) box(c, xa + 8 + k * 14, top - 3, 9, 3, k % 2 ? '#F5F5F4' : '#DC2626');
    box(c, xb - 18, top - 5, 8, 5, '#CA8A04');
    return;
  }
  ledgeArt(c, X(a), Y(h), X(b) - X(a), h < 0 ? '#5A3A1E' : saloon ? '#6A3A1E' : '#7A5230');
};

const drawSolid = (c: Ctx, state: GameState, [a, b, h, h2]: [number, number, number, number?]) => {
  const xa = X(a), xb = X(b), top = Y(h), bot = Y(h2 ?? 0);
  if (!onScreen(state, xa, xb)) return;
  // (only the small ones are drawn here: the wagon's bed, the tower's crate, the alley's crates, the hay bales, and the
  // bar (from inside); the stores, the saloon's walls and roof, the mill's works, the mountain and its rock have their
  // own drawing)
  if (![2150, 2560, 4250, 4930, 5280, 5580, 7040].includes(a)) return;
  if (a === 4250) { if (inSaloon(state.player.pos.x + state.player.width / 2, state.player.pos.y + state.player.height)) drawBar(c, state, xa, xb, top); return; }
  box(c, xa - 1, top - 1, xb - xa + 2, bot - top + 1, INK);
  const col = a === 2150 ? '#6B4423' : a === 7040 ? '#D9B45A' : '#8A6A40';
  box(c, xa, top, xb - xa, bot - top, col);
  box(c, xa, top, xb - xa, 3, LIP);
  if (a === 7040) for (let y = top + 8; y < bot; y += 8) box(c, xa + 2, y, xb - xa - 4, 1, '#B08A3A');
  if (a !== 2150 && a !== 7040) { c.strokeStyle = '#5A3A1E'; c.lineWidth = 2; c.beginPath(); c.moveTo(xa + 2, top + 2); c.lineTo(xb - 2, bot - 2); c.moveTo(xb - 2, top + 2); c.lineTo(xa + 2, bot - 2); c.stroke(); }
};

const drawCover = (c: Ctx, xa: number, xb: number, top: number) => {
  // (a water trough)
  box(c, xa - 1, top - 1, xb - xa + 2, GY - top + 1, INK); box(c, xa, top, xb - xa, GY - top, '#6B4423'); box(c, xa, top, xb - xa, 3, LIP);
  box(c, xa + 4, top + 4, xb - xa - 8, 6, '#3A7CA8');
};

/** A store on the rooftops: its tar-paper roof's lit edge (stand on it), its sign, its windows, its door. */
const store = (c: Ctx, xa: number, xb: number, top: number, col: string, name: string) => {
  box(c, xa - 1, top - 1, xb - xa + 2, GY - top + 1, INK); box(c, xa, top, xb - xa, GY - top, col);
  for (let y = top + 8; y < GY; y += 12) box(c, xa, y, xb - xa, 1, mix(col, '#000000', 0.15));
  box(c, xa - 5, top - 5, xb - xa + 10, 7, '#3F3F46'); box(c, xa - 5, top - 5, xb - xa + 10, 2, LIP);
  board(c, (xa + xb) / 2, top + 30, [name], '#E7D8B0', name.length > 8 ? 1 : 2);
  for (let i = 0; i < 3; i++) { const wx = xa + 22 + i * ((xb - xa - 44) / 3), wy = top + 58; if (wy + 50 < GY - 120) { box(c, wx, wy, 34, 48, INK); box(c, wx + 1, wy + 1, 32, 46, '#2A3A4A'); } }
  box(c, (xa + xb) / 2 - 25, GY - 104, 50, 104, INK); box(c, (xa + xb) / 2 - 24, GY - 103, 48, 103, mix(col, '#000000', 0.45));
};

/** The end of the line: the depot, FIRST AID, and the crash's wreck (crash.ts) or the stop rebuilt. */
const drawEndOfLine = (c: Ctx, state: GameState, wreck: boolean) => {
  // (the rails, coming in from the left to where the stop is (or was))
  box(c, X(-900), GY - 5, X(100) - X(-900), 4, '#71717A');
  for (let x = X(-900); x < X(100); x += 26) box(c, x, GY - 3, 14, 4, '#5A3A1E');
  // (the depot behind)
  falseFront(c, X(380), 240, 260, '#7A6A4A', ['SAWDUST GULCH', 'DEPOT'], { door: true });
  // (FIRST AID: the park's own shack, a red cross; its door open while they carry him in)
  box(c, X(690), GY - 160, 130, 160, INK); box(c, X(691), GY - 159, 128, 159, '#E7E5E4');
  box(c, X(743), GY - 150, 24, 8, '#DC2626'); box(c, X(751), GY - 158, 8, 24, '#DC2626');
  box(c, X(728), GY - 104, 54, 104, INK); box(c, X(729), GY - 103, 52, 103, wreck && firstAidOpen() ? '#1C1917' : '#A8A29E');
  painty(c, X(755), GY - 118, 'FIRST AID', '#DC2626', '#FFFFFF');
  if (wreck) {
    // (the crash (crash.ts): happening, or as it ended up: the engine through the stop and stove into the depot, the
    // tender up on its cab, the coach jackknifed behind, fires, steam, wreckage; the guests well back gawking)
    drawWreck(c, state);
  } else {
    // (rebuilt: fresh lumber, a sawhorse, the bill; the platform's canopy back up)
    drawCanopy(c, 0);
    box(c, X(100), GY - 5, X(200) - X(100), 4, '#71717A');
    for (let x = X(100); x < X(200); x += 26) box(c, x, GY - 3, 14, 4, '#5A3A1E');
    const bx = X(190);
    box(c, bx - 16, GY - 52, 34, 52, INK); box(c, bx - 15, GY - 51, 32, 51, '#D9B45A'); box(c, bx - 15, GY - 34, 32, 8, '#DC2626');
    box(c, X(230), GY - 40, 70, 5, '#FDE047'); box(c, X(236), GY - 35, 5, 35, '#8A5A30'); box(c, X(290), GY - 35, 5, 35, '#8A5A30');
    painty(c, X(265), GY - 60, 'REPAIRS BILLED TO: YOU KNOW WHO', '#1C1917', '#FDE047');
  }
};

/** The undertaker's window: an empty pine coffin, stood up, its lid off, a card on it: TUCKER. */
const drawCoffin = (c: Ctx, x: number, top: number) => {
  box(c, x - 6, top - 64, 120, 70, INK); box(c, x - 5, top - 63, 118, 68, '#1C1917');
  c.fillStyle = INK; c.beginPath(); c.moveTo(x + 8, top - 4); c.lineTo(x + 26, top - 34); c.lineTo(x + 86, top - 34); c.lineTo(x + 106, top - 4); c.closePath(); c.fill();
  c.fillStyle = '#8A5A30'; c.beginPath(); c.moveTo(x + 10, top - 5); c.lineTo(x + 27, top - 32); c.lineTo(x + 85, top - 32); c.lineTo(x + 104, top - 5); c.closePath(); c.fill();
  box(c, x + 28, top - 28, 56, 14, '#3A2A1A');
  box(c, x + 36, top - 56, 40, 14, '#F5F0DC'); signText(c, 'TUCKER', x + 56, top - 45, painted(1, '#7F1D1D'));
};

const drawWaterTower = (c: Ctx, x: number) => {
  // (legs, X-braced; the tank up top; the catwalk is a ledge (lit))
  for (const lx of [x - 80, x + 80]) { box(c, lx - 5, GY - 200, 10, 200, INK); box(c, lx - 4, GY - 200, 8, 200, '#6B4423'); }
  c.strokeStyle = '#5A3A1E'; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 80, GY - 186); c.lineTo(x + 80, GY - 30); c.moveTo(x + 80, GY - 186); c.lineTo(x - 80, GY - 30); c.stroke();
  box(c, x - 76, GY - 380, 152, 176, INK); box(c, x - 74, GY - 378, 148, 172, '#8A5A30');
  for (let y = GY - 368; y < GY - 210; y += 32) box(c, x - 74, y, 148, 4, '#52525B');
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 84, GY - 378); c.lineTo(x, GY - 420); c.lineTo(x + 84, GY - 378); c.closePath(); c.fill();
  c.fillStyle = '#5A3A1E'; c.beginPath(); c.moveTo(x - 80, GY - 380); c.lineTo(x, GY - 416); c.lineTo(x + 80, GY - 380); c.closePath(); c.fill();
  signText(c, 'SAWDUST GULCH', x, GY - 290, painted(1, '#F5F0DC'));
};

const drawWagon = (c: Ctx, x: number, f: number) => {
  // (the snake-oil wagon: the bed is a solid; a painted canopy over it (dimmed), DR. PEABODY'S on its side)
  c.globalAlpha = 0.7;
  c.fillStyle = INK; c.beginPath(); c.moveTo(X(2152), GY - 80); c.quadraticCurveTo(x, GY - 260, X(2348), GY - 80); c.closePath(); c.fill();
  c.fillStyle = '#E7D8B0'; c.beginPath(); c.moveTo(X(2158), GY - 82); c.quadraticCurveTo(x, GY - 252, X(2342), GY - 82); c.closePath(); c.fill();
  c.globalAlpha = 1;
  board(c, x, GY - 150, ["DR. PEABODY'S", 'MIRACLE TONIC'], '#7F1D1D', 1);
  for (const wx of [X(2180), X(2320)]) { c.fillStyle = INK; c.beginPath(); c.arc(wx, GY - 22, 22, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#A0703C'; c.lineWidth = 3; c.beginPath(); c.arc(wx, GY - 22, 18, 0, Math.PI * 2); c.stroke(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; c.beginPath(); c.moveTo(wx, GY - 22); c.lineTo(wx + Math.cos(a) * 18, GY - 22 + Math.sin(a) * 18); c.stroke(); } }
  void f;
};

/** The saloon: from outside, its two-story front (SALOON up top, the batwing doors, the balcony painted on); in it,
 *  opened up: the wallpaper, the stage and its curtain, the piano, the card tables, the long bar, its mirror and
 *  bottles, the barkeep, the stairs and the balcony's rooms, the chandeliers, the posters. */
const drawSaloon = (c: Ctx, state: GameState) => {
  const tw = townOf(state), p = state.player, f = state.frame;
  const inside = inSaloon(p.pos.x + p.width / 2, p.pos.y + p.height);
  const a = SALOON.a, b = SALOON.b, top = Y(486), brawl = tw.saloon.state === 'on', done = tw.saloon.state === 'done';
  if (!inside) {
    box(c, a - 1, top - 60, b - a + 2, GY - top + 60, INK); box(c, a, top - 58, b - a, GY - top + 58, '#8A4A2A');
    for (let y = top - 50; y < GY; y += 14) box(c, a, y, b - a, 1, '#6A3A1E');
    board(c, (a + b) / 2, top - 14, ['SALOON'], '#E7D8B0', 4);
    // (upstairs: the rooms' windows behind a painted balcony (dimmed), its rail)
    for (let i = 0; i < 7; i++) { const wx = a + 80 + i * 140, wy = Y(380); box(c, wx, wy, 52, 70, INK); box(c, wx + 1, wy + 1, 50, 68, '#F2C46A'); box(c, wx + 25, wy, 2, 70, INK); }
    c.globalAlpha = 0.55; box(c, a - 10, Y(262), b - a + 20, 10, '#5A2A1A'); for (let x = a - 6; x < b + 10; x += 18) box(c, x, Y(300), 3, 38, '#5A2A1A'); box(c, a - 10, Y(302), b - a + 20, 4, '#5A2A1A'); c.globalAlpha = 1;
    for (let i = 0; i < 6; i++) { const wx = a + 150 + i * 140, wy = Y(200); box(c, wx, wy, 56, 64, INK); box(c, wx + 1, wy + 1, 54, 62, '#F2C46A'); }
    painty(c, (a + b) / 2, Y(225), 'WHISKEY  CARDS  CAN-CAN  ROOMS', '#1C1917', '#FDE047', 2);
    // (the batwings in the front door: swinging a little; barred in the brawl)
    box(c, a - 4, SALOON.doorTop, 22, GY - SALOON.doorTop, INK); box(c, a - 2, SALOON.doorTop + 2, 18, GY - SALOON.doorTop - 2, '#1C1209');
    if (brawl) { for (const y of [Y(90), Y(40)]) { box(c, a - 12, y, 40, 12, INK); box(c, a - 11, y + 1, 38, 10, '#8A5A30'); } }
    else { const sw = Math.sin(f * 0.05) * 3; box(c, a + sw, Y(96), 14, 50, '#5A2A1A'); box(c, a + sw, Y(96), 14, 3, '#8A5A30'); }
    // (the back door on its far side: locked till the brawl's won)
    box(c, b - 18, SALOON.doorTop, 22, GY - SALOON.doorTop, INK); box(c, b - 16, SALOON.doorTop + 2, 18, GY - SALOON.doorTop - 2, done ? '#1C1209' : '#6B4423');
    return;
  }
  // ---- the room
  box(c, a, top, b - a, GY - top, '#5A2A2A');
  for (let x = a + 8; x < b; x += 24) for (let y = top + 20; y < GY - 20; y += 30) box(c, x, y + ((x / 24) % 2) * 15, 3, 6, '#7A3A3A');
  // (the wainscot)
  box(c, a, GY - 80, b - a, 80, '#4A2414'); box(c, a, GY - 82, b - a, 3, '#7A3A1E');
  // (the stage: its curtain, footlights)
  box(c, X(3840), Y(250), 230, 214, INK); box(c, X(3842), Y(248), 226, 210, '#7F1D1D');
  for (let k = 0; k < 8; k++) box(c, X(3846) + k * 28, Y(248), 5, 210, '#991B1B');
  box(c, X(3836), Y(262), 240, 18, '#CA8A04'); board(c, X(3955), Y(270), ['CAN-CAN'], '#E7D8B0', 1);
  for (let k = 0; k < 7; k++) box(c, X(3858) + k * 30, Y(40), 6, 4, f % 20 < 10 === (k % 2 === 0) ? '#FEF08A' : '#CA8A04');
  // (wanted posters; a painting of a horse)
  const poster = (x: number, y: number, words: string[]) => { box(c, x - 1, y - 1, 52, 66, INK); box(c, x, y, 50, 64, '#E7D8B0'); signText(c, words[0], x + 25, y + 12, painted(1, '#7F1D1D', '#E7D8B0')); box(c, x + 13, y + 18, 24, 22, '#A8A29E'); signText(c, words[1], x + 25, y + 54, painted(1, '#1C1917', '#E7D8B0')); };
  poster(X(4110), Y(200), ['WANTED', '$4 FARE']); poster(X(4180), Y(190), ['WANTED', 'CHEATS']);
  box(c, X(4600), Y(330), 90, 60, INK); box(c, X(4603), Y(327), 84, 54, '#CA8A04'); box(c, X(4607), Y(323), 76, 46, '#7A9A6A');
  c.fillStyle = '#5A3A1E'; c.beginPath(); c.ellipse(X(4645), Y(298), 20, 8, 0, 0, Math.PI * 2); c.fill(); box(c, X(4625), Y(298), 4, 14, '#5A3A1E'); box(c, X(4660), Y(298), 4, 14, '#5A3A1E'); box(c, X(4662), Y(312), 8, 10, '#5A3A1E');
  // (the back bar: the mirror (the room in it, dimly), shelves of bottles, over the long bar)
  box(c, X(4260), Y(180), 290, 110, INK); box(c, X(4263), Y(177), 284, 104, '#4A2414');
  box(c, X(4290), Y(172), 230, 50, '#9AB0C0'); box(c, X(4292), Y(170), 60, 4, '#C8D8E4');
  for (const sy of [Y(110), Y(84)]) { box(c, X(4268), sy, 278, 4, '#7A3A1E'); for (let k = 0; k < 22; k++) box(c, X(4272) + k * 12, sy - 18 + (k % 3) * 2, 7, 18 - (k % 3) * 2, ['#8A5A20', '#3E7A3A', '#7F1D1D', '#D9C08A'][k % 4]); }
  // (the barkeep behind the bar: polishing a glass; in the brawl, ducked down behind it, peeking)
  const duck = brawl ? 34 + Math.sin(f * 0.1) * 4 : 0;
  c.save(); c.beginPath(); c.rect(X(4250), Y(300), 320, Y(52) - Y(300)); c.clip();
  guest(c, X(4470), GY - 10 + duck, 333, f, 'stand', brawl ? 'scared' : 'bored', -1, 'operator');
  c.restore();
  // (the chandeliers)
  for (const lx of [X(4000), X(4400), X(4750)]) {
    box(c, lx - 1, top + 16, 2, 40, INK);
    box(c, lx - 26, top + 56, 52, 5, '#CA8A04');
    for (let k = -2; k <= 2; k++) { box(c, lx + k * 11 - 2, top + 48, 4, 8, '#F5F0DC'); box(c, lx + k * 11 - 1, top + 44 - (f % 8 < 4 ? 1 : 0), 2, 4, '#FDE047'); }
  }
  // (the piano under the stairs, its player playing on through anything)
  box(c, X(4770), GY - 76, 96, 76, INK); box(c, X(4772), GY - 74, 92, 74, '#3A1A10'); box(c, X(4774), GY - 40, 88, 8, '#F5F5F4');
  for (let k = 0; k < 11; k++) box(c, X(4777) + k * 8, GY - 40, 3, 5, '#1C1917');
  guest(c, X(4790), GY, 517, f + (brawl ? f : 0), 'sit', brawl ? 'scared' : 'happy', 1, 'guest', 0.95);
  // (the balcony's rooms upstairs, their doors)
  for (let i = 0; i < 3; i++) { const dx = X(4300) + i * 140; box(c, dx, Y(310), 60, 108, INK); box(c, dx + 2, Y(308), 56, 106, '#6B4423'); box(c, dx + 46, Y(260), 4, 4, '#CA8A04'); signText(c, String(i + 1), dx + 30, Y(290), painted(1, '#FDE047')); }
  // (the balcony's rail; the stairs' rail)
  for (let x = X(4262); x < X(4718); x += 16) box(c, x, Y(236), 3, 36, '#5A2A1A');
  box(c, X(4260), Y(238), X(4720) - X(4260), 4, '#7A3A1E');
  c.strokeStyle = '#7A3A1E'; c.lineWidth = 4; c.beginPath(); c.moveTo(X(4720), Y(190)); c.lineTo(X(4892), Y(86)); c.stroke();
  // (the walls and ceiling)
  box(c, a - 8, top, 16, SALOON.doorTop - top, '#3A1A10');
  box(c, b - 8, top, 16, SALOON.doorTop - top, '#3A1A10');
  box(c, a, top, b - a, 16, '#3A1A10');
  // (the batwings: swinging, or barred with planks across; the back door: locked (a padlock, STAFF ONLY), then open)
  if (brawl) { box(c, a - 10, SALOON.doorTop, 20, GY - SALOON.doorTop, '#5A2A1A'); for (const y of [Y(90), Y(40)]) { box(c, a - 16, y, 34, 12, INK); box(c, a - 15, y + 1, 32, 10, '#8A5A30'); } }
  else { const sw = Math.sin(f * 0.05) * 3; box(c, a - 2 + sw, Y(96), 12, 50, '#5A2A1A'); box(c, a - 2 + sw, Y(96), 12, 3, '#8A5A30'); }
  if (!done) {
    box(c, b - 12, SALOON.doorTop, 20, GY - SALOON.doorTop, INK); box(c, b - 11, SALOON.doorTop + 1, 18, GY - SALOON.doorTop - 1, '#6B4423');
    for (let y = SALOON.doorTop + 10; y < GY; y += 14) box(c, b - 11, y, 18, 2, '#3F2A14');
    box(c, b - 8, Y(60), 10, 12, '#A1A1AA'); box(c, b - 6, Y(68), 6, 6, INK);
    painty(c, b - 70, Y(150), 'STAFF ONLY', '#7F1D1D', '#FEF3C7');
  } else box(c, b - 10, SALOON.doorTop, 18, GY - SALOON.doorTop, '#BFE0F8');
};

/** The long bar (a solid: he can jump up on it): the counter, its lit top, the brass foot rail, the spittoons. */
const drawBar = (c: Ctx, state: GameState, xa: number, xb: number, top: number) => {
  box(c, xa - 6, top - 1, xb - xa + 12, GY - top + 1, INK); box(c, xa - 5, top, xb - xa + 10, 10, '#7A3A1E'); box(c, xa - 5, top, xb - xa + 10, 3, LIP);
  box(c, xa, top + 10, xb - xa, GY - top - 10, '#5A2A1A');
  for (let x = xa + 10; x < xb - 20; x += 60) { box(c, x, top + 18, 48, GY - top - 34, '#4A2014'); box(c, x, top + 18, 48, 2, '#6A3A1E'); }
  box(c, xa - 4, GY - 12, xb - xa + 8, 4, '#CA8A04'); for (let x = xa + 20; x < xb; x += 70) box(c, x, GY - 12, 3, 12, '#A16207');
  for (const sx of [xa - 26, xb + 14]) { box(c, sx, GY - 14, 14, 14, INK); box(c, sx + 1, GY - 13, 12, 13, '#A16207'); box(c, sx - 2, GY - 16, 18, 4, '#CA8A04'); }
  void state;
};

/** The Wild West Show's street: the bleachers packed with guests, the speakers on their pole, the bank and the jail
 *  with their balconies, the board over it all, the marks in the dirt; the gates at its ends, shut while it's on. */
const drawSquare = (c: Ctx, state: GameState) => {
  const f = state.frame, tw = townOf(state), shut = squareShut(state);
  // (the bleachers behind, packed; the rope in front of them)
  const bx = X(6300), bw = 320;
  for (let k = 0; k < 5; k++) { box(c, bx + k * 10, GY - 50 - k * 30, bw - k * 20, 10, '#6B4423'); box(c, bx + k * 10, GY - 50 - k * 30, bw - k * 20, 3, '#8A5A30'); }
  box(c, bx, GY - 50, 5, 50, '#3F2A14'); box(c, bx + bw - 5, GY - 50, 5, 50, '#3F2A14');
  const cheer = tw.duel.phase === 'won' || tw.duel.phase === 'done' || tw.duel.phase === 'intro', boo = tw.duel.phase === 'posse';
  for (let k = 0; k < 5; k++) for (let i = 0; i < 7 - k; i++) {
    const gx = bx + 26 + k * 10 + i * ((bw - k * 20 - 36) / (7 - k)), gy = GY - 50 - k * 30;
    c.save(); c.translate(gx, gy); c.scale(0.72, 0.72);
    drawPerson(c, { seed: k * 13 + i * 7 + 3, outfit: 'guest', f, pose: cheer && (i + k + Math.floor(f / 30)) % 3 === 0 ? 'cheer' : boo && (i + k) % 3 === 0 ? 'point' : 'stand', mood: cheer ? 'happy' : boo ? 'angry' : tw.duel.phase === 'duel' ? 'scared' : 'bored' });
    c.restore();
  }
  for (let x = bx - 20; x < bx + bw + 20; x += 40) box(c, x, GY - 30, 4, 30, '#71717A');
  c.strokeStyle = '#B91C1C'; c.lineWidth = 2; c.beginPath(); for (let x = bx - 20; x < bx + bw - 20; x += 40) { c.moveTo(x + 2, GY - 28); c.quadraticCurveTo(x + 22, GY - 20, x + 42, GY - 28); } c.stroke();
  const pole = (SQUARE.a + SQUARE.b) / 2;
  box(c, pole - 3, Y(320), 6, 320 - 190, '#52525B'); box(c, pole - 14, Y(320), 28, 18, '#27272A'); box(c, pole - 11, Y(318), 8, 13, '#71717A');
  // (the bank and the jail either side, their balconies' rails)
  falseFront(c, X(5990), 200, 300, '#6A5A7A', ['BANK'], { win: 2 });
  falseFront(c, X(6730), 210, 300, '#7A6A5A', ['JAIL', 'SHERIFF'], { win: 2 });
  for (const [a, b] of [[6000, 6180], [6740, 6920]]) { for (let x = X(a); x < X(b); x += 16) box(c, x, Y(206), 3, 36, '#5A3A1E'); box(c, X(a), Y(208), X(b) - X(a), 4, '#7A5230'); }
  board(c, (SQUARE.a + SQUARE.b) / 2, Y(400), ['THE SHOWDOWN', 'DAILY. NOBODY GETS HURT.'], '#A0703C', 2);
  // (the marks in the dirt: an X each, scuffed)
  for (const mx of [SQUARE.mine, SQUARE.his]) { c.strokeStyle = '#F5F0DC'; c.lineWidth = 2; c.beginPath(); c.moveTo(mx - 8, GY + 2); c.lineTo(mx + 8, GY + 8); c.moveTo(mx + 8, GY + 2); c.lineTo(mx - 8, GY + 8); c.stroke(); }
  // (the gates at the ends: shut while it's on)
  for (const gx of [SQUARE.a - 14, SQUARE.b + 2]) {
    box(c, gx - 4, GY - 200, 6, 200, '#3F2A14'); box(c, gx + 12, GY - 200, 6, 200, '#3F2A14');
    if (shut) {
      box(c, gx - 6, GY - 200, 26, 200, INK); box(c, gx - 5, GY - 199, 24, 198, '#7A5230');
      for (let y = GY - 190; y < GY; y += 24) box(c, gx - 5, y, 24, 4, '#5A3A1E');
      c.save(); c.translate(gx + 7, GY - 110); c.rotate(-Math.PI / 2); signText(c, 'SHOW IN PROGRESS', 0, 3, painted(1, '#FDE047')); c.restore();
    }
  }
};

const drawLivery = (c: Ctx, state: GameState) => {
  const f = state.frame;
  // (the livery barn: red, the loft door (the loft is a ledge), a horse's rump in a stall (a fiberglass one))
  box(c, X(7050), Y(330), 400, 330, INK); box(c, X(7052), Y(328), 396, 328, '#8A2A1E');
  for (let x = X(7060); x < X(7450); x += 20) box(c, x, Y(328), 2, 328, '#7A2216');
  c.fillStyle = INK; c.beginPath(); c.moveTo(X(7036), Y(330)); c.lineTo(X(7250), Y(420)); c.lineTo(X(7464), Y(330)); c.closePath(); c.fill();
  c.fillStyle = '#6A1E14'; c.beginPath(); c.moveTo(X(7042), Y(332)); c.lineTo(X(7250), Y(416)); c.lineTo(X(7458), Y(332)); c.closePath(); c.fill();
  board(c, X(7250), Y(300), ['LIVERY'], '#E7D8B0', 3);
  box(c, X(7180), Y(270), 140, 90, '#3A1A10');
  box(c, X(7180), Y(140), 160, 140, '#3A1A10');
  box(c, X(7200), Y(100), 70, 48, '#E7E5E4'); box(c, X(7194), Y(90), 10, 42, '#D6D3D1');
  // (the smithy: the forge glowing, the anvil, the chimney)
  box(c, X(7550), Y(240), 300, 240, INK); box(c, X(7552), Y(238), 296, 238, '#5A4A3A');
  board(c, X(7700), Y(210), ['SMITHY'], '#E7D8B0', 3);
  box(c, X(7760), Y(100), 70, 100, '#3F3F46'); box(c, X(7768), Y(60), 54, 28, f % 10 < 5 ? '#F97316' : '#FDBA74');
  box(c, X(7790), Y(360), 26, 120, '#3F3F46');
  box(c, X(7600), Y(48), 56, 16, INK); box(c, X(7602), Y(46), 52, 12, '#52525B'); box(c, X(7618), Y(34), 18, 34, '#3F3F46');
};

const drawMill = (c: Ctx, state: GameState) => {
  // (the mill house: its back wall, its roof (high over the deck), its windows)
  const a = X(9780), b = X(10800), top = Y(560);
  box(c, a, top, b - a, Y(220) - top, '#5A4630');
  for (let x = a; x < b; x += 20) box(c, x, top, 2, Y(220) - top, '#4A3826');
  for (let k = 0; k < 4; k++) { const wx = a + 120 + k * 230; box(c, wx, Y(470), 70, 70, INK); box(c, wx + 1, Y(469), 68, 68, '#8AA8C0'); }
  box(c, a - 24, top - 14, b - a + 48, 18, INK); box(c, a - 22, top - 12, b - a + 44, 14, '#3F3F46');
  board(c, (a + b) / 2, top + 40, ['SAWDUST GULCH', 'LUMBER MILL'], '#E7D8B0', 3);
  board(c, a + 120, Y(360), ['JACK LADDER', 'LOGS UP. PEOPLE NOT ALLOWED.'], '#FDE047', 1);
  // (the works under the deck: stacked lumber, gears, a wall of it: solid)
  const wa = X(9800), wb = X(10780), wt = Y(220);
  box(c, wa - 1, wt, wb - wa + 2, GY - wt, INK); box(c, wa, wt + 1, wb - wa, GY - wt - 1, '#6B4A2A');
  for (let y = wt + 12; y < GY; y += 16) for (let x = wa + ((y / 16) % 2) * 30; x < wb; x += 60) { box(c, x, y, 56, 12, '#8A6A40'); box(c, x, y, 56, 2, '#A88A5A'); }
  for (const gx of [wa + 200, wa + 620]) { c.fillStyle = INK; c.beginPath(); c.arc(gx, wt + 100, 40, 0, Math.PI * 2); c.fill(); c.fillStyle = '#52525B'; c.beginPath(); c.arc(gx, wt + 100, 36, 0, Math.PI * 2); c.fill(); c.save(); c.translate(gx, wt + 100); c.rotate(state.frame * 0.02); for (let k = 0; k < 8; k++) { c.rotate(Math.PI / 4); box(c, -4, -42, 8, 10, '#52525B'); } c.restore(); }
  // (the deck's lit edge)
  box(c, wa, wt - 2, wb - wa, 3, LIP);
};

const drawYard = (c: Ctx, state: GameState) => {
  void state;
  for (const [rx, n] of [[10880, 5], [11140, 4]] as const) for (let k = 0; k < n; k++) { const y = GY - 20 - k * 20; box(c, X(rx) - 60 + k * 8, y, 120 - k * 16, 20, INK); box(c, X(rx) - 59 + k * 8, y + 1, 118 - k * 16, 18, '#A0703C'); box(c, X(rx) - 59 + k * 8, y + 1, 118 - k * 16, 3, '#C8A070'); }
};

const drawMine = (c: Ctx, state: GameState) => {
  const f = state.frame, tw = townOf(state);
  // (the mountain: fiberglass, its seams and bolts outside; the paint stopping at its back)
  const ma = X(11600), mb = X(14420), mt = Y(420);
  c.fillStyle = INK; c.beginPath(); c.moveTo(ma - 20, GY); c.lineTo(ma - 20, mt + 60); c.lineTo(ma + 300, mt); c.lineTo(ma + 1000, mt - 80); c.lineTo(ma + 1900, mt + 10); c.lineTo(mb + 20, mt + 90); c.lineTo(mb + 20, GY); c.closePath(); c.fill();
  c.fillStyle = '#8A6A4A'; c.beginPath(); c.moveTo(ma - 16, GY); c.lineTo(ma - 16, mt + 62); c.lineTo(ma + 300, mt + 4); c.lineTo(ma + 1000, mt - 76); c.lineTo(ma + 1900, mt + 14); c.lineTo(mb + 16, mt + 92); c.lineTo(mb + 16, GY); c.closePath(); c.fill();
  for (let x = ma + 60; x < mb; x += 180) { box(c, x, mt + 90 + hash(x) * 60, 2, 140, '#6A4A30'); for (let y = mt + 110; y < GY - 20; y += 50) box(c, x - 3, y, 3, 3, '#A1A1AA'); }
  // (the rock under the ground line, the tunnels cut in it)
  box(c, X(11300), GY + 4, X(14690) - X(11300), 1500, ROCK);
  for (let x = X(11300); x < X(14690); x += 64) for (let y = GY + 20; y < Y(-900); y += 48) box(c, x + hash(x + y) * 30, y + hash(y) * 20, 20, 8, '#2E2016');
  // (the shafts, the tunnel: its back wall, timber sets, the lanterns)
  const cut = (a: number, b: number, y0: number, y1: number) => { box(c, a, y0, b - a, y1 - y0, '#24180F'); for (let x = a + 30; x < b; x += 90) box(c, x + hash(x) * 20, y0 + 20 + hash(x * 7) * (y1 - y0 - 40), 30, 10, '#2C1F14'); };
  cut(X(11300), X(11600), GY - 2, FY);
  cut(X(11600), X(14420), CEIL_Y, FY + 300);
  cut(X(13000), X(14420), FY, Y(-880));
  cut(X(14420), X(14690), GY - 2, FY);
  for (let x = X(11650); x < X(14400); x += 160) {
    if (x > X(13080) && x < X(14320)) continue;
    box(c, x - 6, CEIL_Y, 10, FY - CEIL_Y, '#4A3020'); box(c, x - 30, CEIL_Y, 60, 10, '#5A3A24'); box(c, x - 30, CEIL_Y, 60, 2, '#7A5230');
  }
  // (a side adit at the top of the cart track: where the runaways come from)
  box(c, CART_RUN.b + 10, FY - 90, 60, 90, '#0A0604'); box(c, CART_RUN.b + 6, FY - 96, 68, 8, '#5A3A24');
  for (const [lx, lh] of LANTERNS) {
    const x = X(lx), y = Y(lh);
    if (!onScreen(state, x - 20, x + 20)) continue;
    box(c, x - 1, y - 16, 2, 10, INK); box(c, x - 5, y - 6, 10, 12, INK); box(c, x - 4, y - 5, 8, 10, f % 30 < 2 ? '#FDE68A' : '#FBBF24');
  }
  // (the gas: a sickly haze in the pocket, while it's there)
  if (tw.gasGone === 0) {
    for (let k = 0; k < 9; k++) { c.globalAlpha = 0.16 + 0.05 * Math.sin(f * 0.03 + k); c.fillStyle = k % 2 ? '#BEF264' : '#A3E635'; c.beginPath(); c.ellipse(GAS.a + 20 + k * ((GAS.b - GAS.a - 40) / 8), FY - 70 + Math.sin(f * 0.02 + k * 2) * 20, 40, 60, 0, 0, Math.PI * 2); c.fill(); }
    c.globalAlpha = 1;
  } else if (tw.gasGone > 360) { c.globalAlpha = 0.3; box(c, GAS.a, CEIL_Y, GAS.b - GAS.a, FY - CEIL_Y, '#1C1917'); c.globalAlpha = 1; }
  // (the entrance up top: a timber headframe over the shaft, the tour's sign; the tour's waiting shed)
  const frame = (ha: number, hb: number, words: string) => {
    box(c, ha - 5, GY - 260, 10, 260, '#5A3A24'); box(c, hb - 5, GY - 260, 10, 260, '#5A3A24');
    c.strokeStyle = '#5A3A24'; c.lineWidth = 5; c.beginPath(); c.moveTo(ha, GY - 260); c.lineTo((ha + hb) / 2, GY - 330); c.lineTo(hb, GY - 260); c.moveTo(ha, GY - 140); c.lineTo(hb, GY - 260); c.stroke();
    c.fillStyle = INK; c.beginPath(); c.arc((ha + hb) / 2, GY - 318, 22, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#A1A1AA'; c.lineWidth = 3; c.beginPath(); c.arc((ha + hb) / 2, GY - 318, 17, 0, Math.PI * 2); c.stroke();
    board(c, (ha + hb) / 2, GY - 230, [words], '#E7D8B0', 2);
  };
  frame(X(11300), X(11600), 'MOTHER LODE MINE');
  box(c, X(11140), GY - 130, 150, 130, INK); box(c, X(11142), GY - 128, 146, 128, '#6A5A3A'); painty(c, X(11215), GY - 90, 'TOURS: WAIT HERE', '#1C1917', '#FDE047');
  // (the far shaft's mouth: its own headframe, posts either side of the hole (nothing over it), the ground right up to it)
  frame(X(14420), X(14690), 'MINE EXIT');
  for (const px of [X(14412), X(14698)]) { box(c, px - 4, GY - 50, 8, 50, INK); box(c, px - 3, GY - 49, 6, 49, '#FDE047'); box(c, px - 3, GY - 30, 6, 6, '#1C1917'); }
};

/** The log ride's queue: the line sold as LONG. Switchbacks rows deep on a plank deck stepping back from the ground
 *  (every row on it, nothing hanging in the air), packed with bored guests, rope and pipe rails, WAIT FROM HERE boards
 *  all the way along, the flume on its trestles behind with a log coming down its drop, and the station's front with the
 *  ride's marquee. */
const drawQueue = (c: Ctx, state: GameState) => {
  const f = state.frame, a = QUEUE.a, b = QUEUE.b;
  // ---- the flume behind (far: muted), on trestles down to the ground; a log going down its drop, the splash
  const far = (col: string) => mix(col, '#9AB0C0', 0.35);
  const fy = (x: number) => (x < X(15000) ? GY - 300 - (x - X(14700)) * 0.25 : x < X(15250) ? GY - 375 : GY - 375 + (x - X(15250)) * 1.2);
  for (let x = X(14700); x < X(15500); x += 50) { const y = fy(x); box(c, x - 3, y, 6, GY - 76 - y, far('#5A3A1E')); c.strokeStyle = far('#5A3A1E'); c.lineWidth = 2; c.beginPath(); c.moveTo(x, y + 20); c.lineTo(x + 50, GY - 100); c.stroke(); }
  c.strokeStyle = far('#3F2A14'); c.lineWidth = 18; c.beginPath(); for (let x = X(14700); x <= X(15500); x += 20) { const y = fy(x); if (x === X(14700)) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke();
  c.strokeStyle = far('#7A5230'); c.lineWidth = 12; c.stroke();
  const lt = (f % 240) / 240, lx = X(14700) + lt * 800;
  if (lx < X(15500)) { c.save(); c.translate(lx, fy(lx) - 10); c.rotate(lx > X(15250) ? 0.88 : lx < X(15000) ? -0.24 : 0); box(c, -22, -7, 44, 14, far('#6B4423')); c.restore(); }
  // ---- the deck the switchbacks stand on: planks stepping back from the ground (three rows deep), on posts
  for (let r = 3; r >= 1; r--) {
    const y = GY - r * 26;
    box(c, a - 10, y, b - a + 20, r * 26, '#5A3E26'); box(c, a - 10, y, b - a + 20, 3, '#8A6A40');
    for (let x = a; x < b; x += 30) box(c, x, y + 3, 1, r * 26 - 3, '#4A3020');
  }
  // ---- the rows: rails, their U-turns at alternate ends, the guests (smaller, further back)
  const rows: [number, number][] = [[GY - 78, 0.58], [GY - 52, 0.7], [GY - 26, 0.84], [GY, 1]];
  rows.forEach(([y, s], r) => {
    for (const ry of [y - 40 * s, y - 22 * s]) box(c, a, ry, b - a, Math.max(2, 3 * s), '#A1A1AA');
    for (let x = a; x <= b; x += 46) box(c, x, y - 42 * s, Math.max(2, 4 * s), 42 * s, '#71717A');
    if (r < 3) { const ex = r % 2 ? a - 6 : b + 2; box(c, ex, y - 42 * s, 4, 42 * s + 26, '#A1A1AA'); }
    const n = Math.floor((b - a) / (34 * s));
    for (let k = 0; k < n; k++) {
      const seed = 101 + r * 53 + k * 17;
      if (r === 3 && hash(seed) < 0.45) continue;
      const gx = a + 14 + k * 34 * s + hash(seed) * 8;
      const pose = hash(seed + 1) < 0.12 ? 'photo' : hash(seed + 2) < 0.1 ? 'point' : 'stand';
      guest(c, gx, y - 2, seed, f, pose, hash(seed + 3) < 0.15 ? 'happy' : 'bored', hash(seed + 4) < 0.5 ? 1 : -1, 'guest', s);
    }
  });
  // ---- the rope barrier along the front (velvet, sagging between brass posts)
  for (let x = a - 60; x < a; x += 30) { box(c, x, GY - 34, 4, 34, '#CA8A04'); box(c, x - 2, GY - 36, 8, 4, '#FDE047'); }
  c.strokeStyle = '#991B1B'; c.lineWidth = 3; c.beginPath(); for (let x = a - 60; x < a - 30; x += 30) { c.moveTo(x + 2, GY - 32); c.quadraticCurveTo(x + 17, GY - 22, x + 32, GY - 32); } c.stroke();
  // ---- WAIT FROM HERE, all the way along (each up on its post, on the row's deck)
  postBoard(c, a + 40, GY, 120, 'WAIT FROM HERE: 90 MIN', '#1C1917', '#FDE047');
  postBoard(c, a + 380, GY - 26, 112, '75 MIN FROM HERE', '#1C1917', '#FDE047');
  postBoard(c, b - 80, GY - 52, 104, '60 MIN FROM HERE', '#1C1917', '#FDE047');
  postBoard(c, a + 260, GY - 78, 96, '45 MIN. HANG IN THERE', '#1C1917', '#FDE047');
  // ---- the station's front: its marquee (bulbs chasing), the way in
  const sa = STATION.a, sb = STATION.b;
  box(c, sa, Y(300), sb - sa, 300, INK); box(c, sa + 2, Y(298), sb - sa - 2, 298, '#6B4A2A');
  for (let x = sa + 10; x < sb; x += 22) box(c, x, Y(298), 2, 298, '#5A3E26');
  c.fillStyle = INK; c.beginPath(); c.moveTo(sa - 20, Y(300)); c.lineTo((sa + sb) / 2, Y(380)); c.lineTo(sb + 20, Y(300)); c.closePath(); c.fill();
  c.fillStyle = '#4A6A3A'; c.beginPath(); c.moveTo(sa - 14, Y(302)); c.lineTo((sa + sb) / 2, Y(376)); c.lineTo(sb + 14, Y(302)); c.closePath(); c.fill();
  const mx = (sa + sb) / 2, my = Y(250);
  box(c, mx - 140, my - 40, 280, 80, INK); box(c, mx - 137, my - 37, 274, 74, '#A0703C');
  for (let k = 0; k < 20; k++) { const bxk = mx - 132 + k * 14; c.fillStyle = (k + Math.floor(f / 6)) % 3 === 0 ? '#FEF08A' : '#CA8A04'; c.beginPath(); c.arc(bxk, my - 34, 2.5, 0, Math.PI * 2); c.arc(bxk, my + 34, 2.5, 0, Math.PI * 2); c.fill(); }
  signText(c, 'TIMBER TUMBLE', mx, my - 4, burned(3, 4));
  signText(c, 'THE LONGEST LOG RIDE IN THE WEST', mx, my + 20, painted(1, '#FEF3C7'));
  box(c, mx - 50, GY - 120, 100, 120, INK); box(c, mx - 47, GY - 117, 94, 117, '#120C08');
  painty(c, mx, GY - 140, 'RIDE TIME: 11 MIN. YOU WILL GET WET.', '#7F1D1D', '#FEF3C7');
};

const drawCanary = (c: Ctx, x: number, y: number, f: number, alive: boolean) => {
  box(c, x - 1, CEIL_Y, 2, y - CEIL_Y - 20, INK);
  c.strokeStyle = '#CA8A04'; c.lineWidth = 1.5;
  c.beginPath(); c.arc(x, y - 12, 12, Math.PI, 0); c.stroke();
  for (let k = -10; k <= 10; k += 5) { c.beginPath(); c.moveTo(x + k, y - 12 - Math.sqrt(Math.max(0, 144 - k * k)) + 2); c.lineTo(x + k, y + 6); c.stroke(); }
  box(c, x - 13, y + 6, 26, 3, '#CA8A04');
  if (alive) {
    const hop = f % 40 < 6 ? -2 : 0;
    box(c, x - 5, y - 4 + hop, 9, 7, INK); box(c, x - 4, y - 3 + hop, 7, 5, '#FDE047'); box(c, x + 3, y - 2 + hop, 3, 2, '#F97316');
    if (f % 90 < 30) { box(c, x + 10, y - 22 - (f % 90) / 3, 3, 4, '#FDE047'); box(c, x + 12, y - 26 - (f % 90) / 3, 1, 4, '#FDE047'); }
  } else {
    // (feet up on the cage floor, X eyes)
    box(c, x - 5, y + 1, 9, 5, INK); box(c, x - 4, y + 2, 7, 3, '#FDE047');
    box(c, x - 2, y - 2, 1, 3, '#F97316'); box(c, x + 1, y - 2, 1, 3, '#F97316');
  }
};

const drawWaterBack = (c: Ctx, w: { a: number; b: number; surface: number; bed: number; mine?: boolean }) => {
  const col = w.mine ? '#1E3A4A' : '#3A6A88', deep = w.mine ? '#0A1A24' : '#1E3F56';
  if (!w.mine) { box(c, w.a, GY, w.b - w.a, w.surface - GY, '#5A3E24'); box(c, w.a, GY, w.b - w.a, 2, '#7A9A4A'); }
  const bands = [col, mix(col, deep, 0.35), mix(col, deep, 0.7), deep];
  for (let i = 0; i < bands.length; i++) box(c, w.a, w.surface + (i * (w.bed - w.surface)) / bands.length, w.b - w.a, (w.bed - w.surface) / bands.length + 1, bands[i]);
  box(c, w.a, w.bed, w.b - w.a, 300, '#2A2018');
  // (the steps out: lit lips)
  for (const sx of [w.a, w.b - 50]) { box(c, sx, w.surface + 26, 50, 6, '#6B5A3A'); box(c, sx, w.surface + 26, 50, 2, '#A89060'); }
  // (sunk ore carts and timbers in the flooded shaft; a sunk log in the pond)
  if (w.mine) for (const k of [0.12, 0.55, 0.8]) { const x = w.a + (w.b - w.a) * k; box(c, x, w.bed - 30, 60, 30, '#3F3F46'); box(c, x, w.bed - 30, 60, 3, '#71717A'); box(c, x + 80, w.bed - 8, 90, 8, '#3A2A1A'); }
};

/** Over whoever's in it: the water's front, see-through, its lit surface rippling. */
export const drawWaterFront = (c: Ctx, state: GameState) => {
  const f = state.frame, v = viewOf(state);
  for (const w of WATERS) {
    if (!onScreen(state, w.a, w.b)) continue;
    const col = w.mine ? '#1E3A4A' : '#3A6A88';
    const xa = Math.max(w.a, v.x - 40), xb = Math.min(w.b, v.x + v.w + 40);
    c.globalAlpha = w.mine ? 0.7 : 0.55;
    box(c, xa, w.surface + 6, xb - xa, w.bed - w.surface - 6, mix(col, '#0A1A24', 0.4));
    c.globalAlpha = 1;
    for (let x = Math.floor((xa - w.a) / 6) * 6 + w.a; x < xb; x += 6) {
      const y = Math.round(w.surface - Math.sin(f * 0.07 + x * 0.04) * 1.5);
      box(c, x, y, 6, 3, mix(col, '#FFFFFF', 0.4)); box(c, x, y + 3, 6, 2, mix(col, '#FFFFFF', 0.15));
    }
  }
};

/** The lit things for the lighting system: the mine's lanterns (muted: soft warm glows, the playtest's, as the train's
 *  tunnels), the saloon's chandeliers (soft), the jack ladder's lamp. */
export const townLamps = (state: GameState) => {
  const out = LANTERNS.map(([lx, lh]) => ({ x: X(lx), y: Y(lh), r: 120, a: 0.32, color: '#4A3818' }));
  for (const lx of [4000, 4400, 4750]) out.push({ x: X(lx), y: Y(400), r: 220, a: 0.4, color: '#5A4420' });
  out.push({ x: LADDER.foot, y: Y(120), r: 140, a: 0.35, color: '#5A4420' });
  if (wreckHere(state)) out.push(...wreckLights(state));
  return out.filter(l => onScreen(state, l.x - l.r, l.x + l.r));
};
