// XENOSCARE inside, painted (the final pass: peak SNES, a haunted spaceship ride: dark, moody, readable). Each area its
// own steel (the queue's fiberglass bone, the pre-show's cold blue, the bridge's teal, the specimen bay's green, the
// engine room's rust, the corridor aft's purple, the resin creeping over it); bulkhead plates in banded light, seams and
// rivets, pipes along the top, a trim strip glowing, a hazard stripe at the foot; the derelict's ribs up the walls
// (cardboard, taped: the cheap shows everywhere: speakers in plain sight, gaffer tape, extension cords, a fog machine).
// Indoors the depth is kept light (the castle's way): straight walls set back a little, the deck going back to them
// (its plates' seams converging on the one eye), the ceiling's strip over them, the bulkhead frames' and the gantries'
// and the crates' sides going back to the wall. Lit top lips on everything stood on (the deck, the catwalks, the
// crates). Still things stamped; what moves (the shows' loops, the fog, the eye's seams) live.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { GY } from '../geometry';
import { drawCheapGreen } from './green';
import { x1, HOUSE_DOOR, QUEUE_END, PRESHOW, HALLS, CATWALKS, CRATES, CEIL, TRAMS } from './layout';
import {
  type Ctx, INK, box, checker, mix, hash, stamp, bandedGradient, hazeBands, pixelBlob, poly, inked, line, words, textW, panel, post, orb,
  pipeH, shown, STEEL, CARD, PINE, HAZ, CHROME, BONE, PINK,
} from './paint';

/** How far back the walls are set (the deck goes back to them). */
const K = 0.9;
/** The eye's height indoors (fixed: the camera holds still up and down in there). */
const EY = GY - 298;
/** The walls' foot and top (where the deck and the ceiling meet them). */
export const FOOT = Math.round(EY + (GY - EY) * K), CTOP = Math.round(EY + (CEIL - EY) * K);
/** A point at the play plane, back at the wall (toward the eye). */
const atWall = (ex: number, x: number, y: number, d = K): [number, number] => [ex + (x - ex) * d, EY + (y - EY) * d];

type AreaId = 'queue' | 'preshow' | 'bridge' | 'specimen' | 'engine' | 'exit';
const ramp7 = (c: string) => [mix(c, INK, 0.72), mix(c, INK, 0.52), mix(c, INK, 0.3), c, mix(c, '#FFFFFF', 0.14), mix(c, '#FFFFFF', 0.3), mix(c, '#FFFFFF', 0.55)];
const AREAS: Record<AreaId, { R: string[]; trim: string; deck: string[] }> = {
  queue: { R: ramp7('#5A4C40'), trim: '#FDE047', deck: ramp7('#3E3630') },
  preshow: { R: ramp7('#2E4064'), trim: '#38BDF8', deck: ramp7('#2A3244') },
  bridge: { R: ramp7('#21525A'), trim: '#2DD4BF', deck: ramp7('#24363A') },
  specimen: { R: ramp7('#24573A'), trim: '#4ADE80', deck: ramp7('#26382C') },
  engine: { R: ramp7('#6A3820'), trim: '#F97316', deck: ramp7('#3E2E26') },
  exit: { R: ramp7('#4A2860'), trim: '#C084FC', deck: ramp7('#30263A') },
};
const BOUNDS: [number, AreaId][] = [[HOUSE_DOOR, 'queue'], [QUEUE_END, 'preshow'], [PRESHOW.r, 'bridge'], [HALLS.bridge.r, 'specimen'], [HALLS.specimen.r, 'engine'], [HALLS.engine.r, 'exit']];
export const areaAt = (x: number): AreaId => { let a: AreaId = 'queue'; for (const [bx, id] of BOUNDS) if (x >= bx) a = id; return a; };
/** The bulkhead frames between the halls (where a tram's tunnel isn't). */
const FRAMES = [QUEUE_END + 10, PRESHOW.r + 14, HALLS.specimen.r - 14];

const view = (state: GameState) => ({ x: state.view?.x ?? state.camera.x, w: state.view?.w ?? CANVAS_WIDTH });

// ---------------------------------------------------------------------------------------------------------------
// The walls (stamped tiles), the overhead, the deck under them

const TILE = 400;
const drawWalls = (c: Ctx, state: GameState) => {
  const v = view(state);
  const a = Math.max(HOUSE_DOOR, v.x - 60), b = Math.min(x1 + 200, v.x + v.w + 60);
  if (b <= a) return;
  for (let tx = Math.floor((a - HOUSE_DOOR) / TILE) * TILE + HOUSE_DOOR; tx < b; tx += TILE) {
    stamp(c, `xs-wall-${Math.round((tx - HOUSE_DOOR) / TILE)}`, tx, CEIL - 160, TILE, GY - CEIL + 580, g => paintWallTile(g, tx));
  }
};

const paintWallTile = (g: Ctx, tx: number) => {
  // (cut where the areas change: each its own steel)
  const cuts = [tx, ...BOUNDS.map(([bx]) => bx).filter(bx => bx > tx && bx < tx + TILE), tx + TILE];
  for (let i = 0; i + 1 < cuts.length; i++) {
    const sa = cuts[i], sb = cuts[i + 1], id = areaAt(sa + 1);
    g.save(); g.beginPath(); g.rect(sa, CEIL - 170, sb - sa, GY - CEIL + 600); g.clip();
    paintSegment(g, sa, sb, id);
    g.restore();
  }
  // (the ribs: big curved frames up the walls every so often, the derelict's bones (cardboard, taped))
  for (let rx = Math.ceil((tx - HOUSE_DOOR - 140) / 320) * 320 + HOUSE_DOOR + 140; rx < tx + TILE + 80; rx += 320) paintRib(g, rx, areaAt(rx));
};

const paintSegment = (g: Ctx, sa: number, sb: number, id: AreaId) => {
  const A = AREAS[id], R = A.R, w = sb - sa, wallH = FOOT - CTOP;
  // The overhead: dark, a truss, an I-beam along the ceiling's edge
  box(g, sa, CEIL - 170, w, 170, STEEL[1]);
  for (let x = Math.floor(sa / 48) * 48; x < sb; x += 48) { line(g, [x, CEIL - 26], [x + 24, CEIL - 70], STEEL[3], 2); line(g, [x + 24, CEIL - 70], [x + 48, CEIL - 26], STEEL[2], 2); }
  box(g, sa, CEIL - 74, w, 6, STEEL[3]); box(g, sa, CEIL - 74, w, 1, STEEL[5]);
  pipeH(g, sa, sb, CEIL - 26, 12, STEEL.slice(1)); box(g, sa, CEIL - 14, w, 14, STEEL[2]); box(g, sa, CEIL - 3, w, 3, STEEL[4]);
  // The ceiling's strip (seams added live): its underside, darker going back
  box(g, sa, CEIL, w, CTOP - CEIL, R[1]); box(g, sa, CTOP - 4, w, 4, R[0]); checker(g, sa, CEIL + 4, w, 2, R[0]);
  // The wall: banded light (dim up top, the work lights' wash in the middle, the shade at its foot)
  bandedGradient(g, sa, CTOP, w, wallH, id === 'queue' ? [R[1], R[2], R[3], R[3], R[2], R[1]] : [R[0], R[1], R[2], R[2], R[1], R[0]], 12);
  if (id === 'queue') {
    // (the outer hull's inside: fiberglass bone, ridged, painted slime run down it)
    for (let y = CTOP + 30; y < FOOT - 20; y += 26) { box(g, sa, y, w, 2, R[4]); box(g, sa, y + 2, w, 2, R[1]); checker(g, sa, y + 4, w, 2, R[1]); }
    for (let x = Math.ceil(sa / 70) * 70; x < sb; x += 70) { const h = 30 + hash(x * 0.01) * 80; box(g, x, CTOP + 30, 3, h, '#3F6212'); box(g, x, CTOP + 30, 1, h, '#84CC16'); box(g, x - 1, CTOP + 30 + h, 5, 4, '#3F6212'); }
  } else {
    // (the plates: seams every 80, a seam across top and bottom, rivets along them)
    for (let x = Math.ceil(sa / 80) * 80; x < sb; x += 80) { box(g, x, CTOP, 1, wallH, R[0]); box(g, x + 1, CTOP, 1, wallH, R[4]); }
    for (const y of [CTOP + 74, FOOT - 132]) { box(g, sa, y, w, 1, R[0]); box(g, sa, y + 1, w, 1, R[4]); }
    for (let x = Math.ceil(sa / 16) * 16; x < sb; x += 16) for (const y of [CTOP + 68, CTOP + 80, FOOT - 138, FOOT - 126]) { box(g, x, y, 2, 2, R[5]); box(g, x + 1, y + 1, 1, 1, R[0]); }
    if (id === 'engine') for (let x = Math.ceil(sa / 32) * 32; x < sb; x += 32) checker(g, x, FOOT - 124, 2, 30 + hash(x) * 50, '#8A3A10');
    if (id === 'exit') {
      // (the resin creeping over it: glossy black ropes and blisters, a glint on each)
      for (let k = Math.floor(sa / 60); k * 60 < sb; k++) {
        const x = k * 60 + hash(k * 3.1) * 40, y = CTOP + 60 + hash(k * 7.3) * (wallH - 140), r = 18 + hash(k * 5.9) * 26;
        pixelBlob(g, x, y, r + 2, r * 1.6 + 2, '#0A0510'); pixelBlob(g, x, y, r, r * 1.6, '#1C1026'); pixelBlob(g, x - r * 0.3, y - r * 0.5, r * 0.45, r * 0.7, '#2E1C3E');
        box(g, x - r * 0.4, y - r * 0.9, 3, 5, '#7E5A9A'); box(g, x - r * 0.4, y - r * 0.9, 1, 2, '#E0CCF0');
      }
    }
  }
  // (the pipes along the top; the trim strip glowing under them; the conduit at knee height)
  pipeH(g, sa, sb, CTOP + 8, 10, STEEL.slice(2));
  pipeH(g, sa, sb, CTOP + 22, 6, R.slice(1));
  for (let x = Math.ceil(sa / 96) * 96; x < sb; x += 96) { box(g, x, CTOP + 6, 6, 26, INK); box(g, x + 1, CTOP + 7, 4, 24, STEEL[4]); box(g, x + 1, CTOP + 7, 1, 24, STEEL[6]); }
  const glow = mix(A.trim, R[1], 0.25);
  box(g, sa, CTOP + 38, w, 4, INK); box(g, sa, CTOP + 39, w, 2, glow); checker(g, sa, CTOP + 42, w, 2, mix(A.trim, R[1], 0.7)); checker(g, sa, CTOP + 36, w, 2, mix(A.trim, R[1], 0.7));
  pipeH(g, sa, sb, FOOT - 60, 8, STEEL.slice(1));
  // (vents: grilles every so often)
  for (let x = Math.ceil((sa - 40) / 240) * 240 + 40; x < sb; x += 240) {
    panel(g, x, FOOT - 112, 44, 26, R[2], true);
    for (let k = 0; k < 5; k++) { box(g, x + 4, FOOT - 107 + k * 4, 36, 2, R[0]); box(g, x + 4, FOOT - 107 + k * 4, 36, 1, INK); }
  }
  // (the hazard stripe along its foot)
  box(g, sa, FOOT - 16, w, 16, INK);
  for (let x = Math.floor((sa - 16) / 16) * 16; x < sb; x += 16) poly(g, [[x, FOOT - 2], [x + 8, FOOT - 14], [x + 16, FOOT - 14], [x + 8, FOOT - 2]], HAZ[3]);
  box(g, sa, FOOT - 16, w, 2, R[3]); box(g, sa, FOOT - 2, w, 2, R[0]);
  // The deck going back to it (its seams added live): plates in bands, darker toward the wall
  const Dk = A.deck;
  box(g, sa, FOOT, w, GY - FOOT, Dk[3]); box(g, sa, FOOT, w, 8, Dk[1]); box(g, sa, FOOT + 8, w, 8, Dk[2]);
  checker(g, sa, FOOT + 6, w, 2, Dk[2]); checker(g, sa, FOOT + 14, w, 2, Dk[3]);
  for (let x = Math.floor(sa / 6) * 6; x < sb; x += 6) for (const y of [FOOT + 18, FOOT + 22, FOOT + 26]) box(g, x + (y % 4), y, 2, 1, Dk[2]);
  // The edge he walks along: lit; the deck's front, a hazard edge, then the dark under it
  box(g, sa, GY, w, 2, mix(A.trim, '#FFFFFF', 0.35)); box(g, sa, GY + 2, w, 2, Dk[5]); checker(g, sa, GY + 4, w, 2, Dk[4]);
  box(g, sa, GY + 6, w, 10, Dk[2]); box(g, sa, GY + 16, w, 1, INK);
  for (let x = Math.floor(sa / 24) * 24; x < sb; x += 24) { box(g, x, GY + 6, 12, 10, Dk[3]); box(g, x, GY + 6, 12, 1, Dk[4]); }
  for (let x = Math.floor((sa - 16) / 16) * 16; x < sb; x += 16) poly(g, [[x, GY + 26], [x + 8, GY + 18], [x + 16, GY + 18], [x + 8, GY + 26]], HAZ[2]);
  box(g, sa, GY + 17, w, 1, INK); box(g, sa, GY + 26, w, 1, INK);
  box(g, sa, GY + 27, w, 400, STEEL[0]);
  hazeBands(g, sa, GY + 27, w, 40, '#1A1422', 0.6, 0, 4);
};

/** A rib of the derelict up the wall: a curved bone frame, stepped, taped where the cardboard split; a speaker on it. */
const paintRib = (g: Ctx, rx: number, id: AreaId) => {
  const R = AREAS[id].R, bone = id === 'queue' ? BONE : R;
  const curve = (dx: number, dy: number, col: string, lw: number) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(rx - 50 + dx, FOOT - 14 + dy); g.quadraticCurveTo(rx - 70 + dx, CTOP + 60 + dy, rx + dx, CTOP + 26 + dy); g.stroke(); };
  curve(4, 2, R[0], 18); curve(0, 0, INK, 16); curve(0, 0, id === 'queue' ? BONE[3] : R[2], 12); curve(-2, -1, id === 'queue' ? BONE[4] : R[3], 7); curve(-4, -2, id === 'queue' ? BONE[6] : R[5], 2);
  // (its knuckles: bands across it)
  for (let k = 1; k < 6; k++) { const u = k / 6, bx = (1 - u) * (1 - u) * (rx - 50) + 2 * u * (1 - u) * (rx - 70) + u * u * rx, by = (1 - u) * (1 - u) * (FOOT - 14) + 2 * u * (1 - u) * (CTOP + 60) + u * u * (CTOP + 26); box(g, bx - 6, by, 12, 2, bone[1]); box(g, bx - 6, by + 2, 12, 1, bone[5] ?? bone[4]); }
  // (the cardboard showing at a split, gaffer tape over it; a speaker bolted on in plain sight)
  box(g, rx - 76, FOOT - 252, 16, 34, INK); box(g, rx - 75, FOOT - 251, 14, 32, CARD[3]); for (let k = 0; k < 4; k++) box(g, rx - 75, FOOT - 247 + k * 8, 14, 1, CARD[2]);
  box(g, rx - 80, FOOT - 240, 24, 8, INK); box(g, rx - 79, FOOT - 239, 22, 6, '#A1A1AA'); box(g, rx - 79, FOOT - 239, 22, 1, '#E4E4E7');
  panel(g, rx + 18, FOOT - 330, 28, 34, '#27272A', false);
  orb(g, rx + 32, FOOT - 315, 9, ['#09090B', '#18181B', '#27272A', '#3F3F46', '#52525B']); orb(g, rx + 32, FOOT - 315, 3, ['#18181B', '#3F3F46', '#71717A']);
  line(g, [rx + 32, FOOT - 296], [rx + 40, CTOP + 30], INK);
};

/** The deck's and the ceiling's seams going back to the walls, converging on the eye (live). */
const drawDepthLines = (c: Ctx, state: GameState) => {
  const v = view(state), ex = v.x + v.w / 2;
  const a = Math.max(HOUSE_DOOR, v.x - 80), b = Math.min(x1 + 200, v.x + v.w + 80);
  if (b <= a) return;
  c.save(); c.beginPath(); c.rect(Math.max(HOUSE_DOOR, v.x - 4), CEIL - 2, b - Math.max(HOUSE_DOOR, v.x - 4), GY - CEIL + 4); c.clip();
  for (let x = Math.floor(a / 40) * 40; x < b; x += 40) {
    const id = areaAt(x), Dk = AREAS[id].deck, R = AREAS[id].R;
    line(c, [x + 0.5, GY], atWall(ex, x + 0.5, GY), Dk[1]);
    if ((x / 40) % 2 === 0) line(c, [x + 1.5, GY], atWall(ex, x + 1.5, GY), Dk[4]);
    line(c, [x + 0.5, CEIL], atWall(ex, x + 0.5, CEIL), R[0]);
  }
  c.restore();
};

/** The bulkhead frames: their sides going back to the wall (over what's on it), their faces at the play plane (thick
 *  steel, a hazard band, a light over the opening). */
const drawFrames = (c: Ctx, state: GameState) => {
  const v = view(state), ex = v.x + v.w / 2;
  // (the bulkhead frames between the halls: their sides going back to the wall)
  for (const fx of FRAMES) {
    if (fx < v.x - 200 || fx > v.x + v.w + 200) continue;
    const id = areaAt(fx), R = AREAS[id].R, l = fx - 16, r = fx + 16;
    const side = (e: number, s: 1 | -1) => {
      if ((ex - e) * s <= 1) return;
      poly(c, [[e, CEIL], atWall(ex, e, CEIL), atWall(ex, e, GY), [e, GY]], R[1]);
      poly(c, [[e, CEIL], atWall(ex, e, CEIL), atWall(ex, e, CEIL + 30), [e, CEIL + 30]], R[0]);
      line(c, atWall(ex, e, CEIL), atWall(ex, e, GY), INK);
    };
    side(r, 1); side(l, -1);
  }
  for (const fx of FRAMES) {
    if (!shown(state, fx - 30, fx + 30)) continue;
    const id = areaAt(fx);
    stamp(c, `xs-frame-${fx}`, fx - 20, CEIL - 4, 40, GY - CEIL + 6, g => {
      const R = AREAS[id].R, l = fx - 16;
      box(g, l - 1, CEIL - 2, 34, GY - CEIL + 2, INK);
      box(g, l, CEIL, 32, GY - CEIL, R[3]); box(g, l, CEIL, 6, GY - CEIL, R[4]); box(g, l + 1, CEIL, 2, GY - CEIL, R[5]); box(g, l + 26, CEIL, 6, GY - CEIL, R[2]); checker(g, l + 24, CEIL, 2, GY - CEIL, R[2]);
      for (let y = CEIL + 40; y < GY - 20; y += 60) { box(g, l + 3, y, 26, 1, R[1]); box(g, l + 3, y + 1, 26, 1, R[5]); box(g, l + 6, y + 6, 2, 2, R[6]); box(g, l + 24, y + 6, 2, 2, R[6]); }
      for (let k = 0; k < 7; k++) poly(g, [[l, GY - 60 + k * 8], [l + 32, GY - 76 + k * 8], [l + 32, GY - 72 + k * 8], [l, GY - 56 + k * 8]], k % 2 ? HAZ[4] : INK);
      box(g, l + 8, CEIL + 8, 16, 8, INK); box(g, l + 9, CEIL + 9, 14, 6, AREAS[id].trim); box(g, l + 9, CEIL + 9, 14, 2, '#FFFFFF');
    });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Fog off the machines, rolling along the deck (live: drifting puffs, blacklight purple; each puff stamped)

const drawFog = (c: Ctx, state: GameState) => {
  const v = view(state);
  if (v.x + v.w < HOUSE_DOOR) return;
  const f = state.frame;
  for (let i = 0; i < 9; i++) {
    const span = 1800, x = ((i * 200 + f * (0.3 + (i % 3) * 0.15)) % span) + Math.floor(v.x / span) * span - 300;
    for (const ox of [0, span]) {
      const fx = Math.round(x + ox), fy = GY - 10 - (i % 3) * 6;
      if (fx < HOUSE_DOOR + 60 || fx - 170 > v.x + v.w || fx + 170 < v.x) continue;
      c.save(); c.translate(fx, fy); stamp(c, `xs-fog-${i % 3}`, -170, -30, 340, 50, g => paintFog(g, i % 3)); c.restore();
    }
  }
};
const paintFog = (g: Ctx, k: number) => {
  pixelBlob(g, 0, 4, 150 - k * 24, 16 + k * 3, 'rgba(124, 92, 200, 0.16)');
  pixelBlob(g, -20 + k * 10, 0, 100 - k * 14, 10, 'rgba(167, 139, 250, 0.14)');
  pixelBlob(g, -40, -4, 50, 5, 'rgba(221, 214, 254, 0.12)');
};

// ---------------------------------------------------------------------------------------------------------------
// The shows (each area's dressing): stamped, the loops live

/** The bridge's consoles (their left ends), clear of the tram's airlock, the captain's chair and the wall rig's hatch. */
const CONSOLES = [250, 410, 840, 1180].map(k => HALLS.bridge.l + k);

const title = (g: Ctx, x: number, y: number, big: string, small: string, col: string, trim: string) => {
  const w = Math.max(textW(g, big, 10), textW(g, small, 6)) + 28;
  panel(g, x - w / 2, y - 18, w, 38, '#18181B');
  box(g, x - w / 2 + 3, y - 15, w - 6, 1, trim);
  words(g, big, x, y, col, 10, INK);
  words(g, small, x, y + 13, trim, 6, INK);
};

const drawShows = (c: Ctx, state: GameState) => {
  const f = state.frame;
  // The boarding queue: the posters, the stanchions and ropes, the wait-time sign, a safety-video monitor, the cast door
  if (shown(state, HOUSE_DOOR, QUEUE_END)) {
    stamp(c, 'xs-queue', HOUSE_DOOR, GY - 340, QUEUE_END - HOUSE_DOOR, 344, paintQueue);
    // (the monitor's safety video: a loop of a cartoon green waving, the scanlines rolling)
    const mx = HOUSE_DOOR + 44, my = GY - 300;
    if (shown(state, mx, mx + 100)) {
      box(c, mx + 5, my + 5, 70, 60, '#0B1A12');
      const k = Math.floor(f / 20) % 4;
      box(c, mx + 26 + (k % 2) * 4, my + 18, 22, 26, '#22C55E'); box(c, mx + 30 + (k % 2) * 4, my + 26, 5, 4, INK); box(c, mx + 40 + (k % 2) * 4, my + 26, 5, 4, INK);
      box(c, mx + 48 + (k % 2) * 4, my + 18 - (k % 2) * 6, 4, 12, '#22C55E');
      box(c, mx + 5, my + 5 + ((f * 0.5) % 58), 70, 2, 'rgba(255, 255, 255, 0.12)');
      for (let y = my + 5; y < my + 65; y += 3) box(c, mx + 5, y, 70, 1, 'rgba(0, 0, 0, 0.25)');
    }
  }
  // The pre-show: the ship's teleporter (the tube in the middle, its rings chasing; the host on a screen)
  if (shown(state, PRESHOW.l, PRESHOW.r)) {
    const tx = PRESHOW.tube;
    stamp(c, 'xs-preshow', PRESHOW.l, CEIL - 20, PRESHOW.r - PRESHOW.l, GY - CEIL + 24, paintPreshow);
    for (let i = 0; i < 4; i++) {
      const ry = GY - 80 - i * 80, lit = Math.floor(f / 10) % 4 === i;
      box(c, tx - 89, ry - 1, 178, 6, INK); box(c, tx - 88, ry, 176, 4, lit ? '#7DD3FC' : '#1E3A5F'); box(c, tx - 88, ry, 176, 1, lit ? '#E0F2FE' : '#2A4A70');
    }
  }
  // THE BRIDGE: a cardboard viewscreen (Earth, saucers over it, painted), consoles blinking, the captain's chair with a
  // cheap green in it waving its gun, cardboard crew at their stations
  if (shown(state, HALLS.bridge.l, HALLS.bridge.r)) {
    const { l } = HALLS.bridge;
    stamp(c, 'xs-bridge', l, GY - 344, HALLS.bridge.r - l, 348, paintBridge);
    CONSOLES.forEach((cx2, i) => { for (let k = 0; k < 5; k++) { const on = (f + k * 11 + i * 7) % 40 < 20; box(c, cx2 + 16 + k * 18, GY - 77 - k * 3, 8, 5, on ? '#22D3EE' : '#F43F5E'); box(c, cx2 + 16 + k * 18, GY - 77 - k * 3, 8, 1, on ? '#CFFAFE' : '#FECDD3'); } });
    // (a saucer crossing the viewscreen, on its wire)
    const sx = l + 320 + ((f * 0.6) % 660);
    c.save(); c.beginPath(); c.rect(l + 306, GY - 324, 688, 188); c.clip();
    line(c, [sx, GY - 324], [sx, GY - 250], '#52525B');
    c.fillStyle = INK; c.beginPath(); c.ellipse(sx, GY - 244, 15, 6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#A1A1AA'; c.beginPath(); c.ellipse(sx, GY - 244, 14, 5, 0, 0, Math.PI * 2); c.fill();
    box(c, sx - 10, GY - 246, 20, 2, '#E4E4E7'); box(c, sx - 5, GY - 251, 10, 5, '#7DD3FC');
    c.restore();
    drawCheapGreen(c, l + 685, GY - 20, f, 0.8, 'wave');
  }
  // THE SPECIMEN BAY: stasis tubes (a cow in one, going up and down in its green beam; a farmer dummy in another), a
  // crate of eggs (DO NOT TOUCH: LEGALLY DISTINCT EGGS)
  if (shown(state, HALLS.specimen.l, HALLS.specimen.r)) {
    const { l } = HALLS.specimen;
    stamp(c, 'xs-specimen', l, GY - 344, HALLS.specimen.r - l, 348, paintSpecimen);
    const tx = l + 720, cy = GY - 120 - (Math.sin(f * 0.02) * 0.5 + 0.5) * 120;
    // (the beam's rings going up)
    for (let i = 0; i < 4; i++) { const ry = GY - 20 - ((f * 1.2 + i * 70) % 280); box(c, tx - 54, ry, 108, 2, 'rgba(134, 239, 172, 0.35)'); }
    drawCow(c, tx, cy, f);
    for (const gx of [tx, HALLS.specimen.r - 260]) { box(c, gx - 50, GY - 290, 3, 270, 'rgba(240, 253, 244, 0.35)'); box(c, gx - 44, GY - 290, 1, 270, 'rgba(240, 253, 244, 0.25)'); }
  }
  // THE ENGINE ROOM: the reactor (a fiberglass core, glowing, pulsing), pipes into it, steam
  if (shown(state, HALLS.engine.l, HALLS.engine.r)) {
    const { l } = HALLS.engine, rx = l + 760;
    stamp(c, 'xs-engine', l, GY - 364, HALLS.engine.r - l, 368, paintEngine);
    const k = Math.sin(f * 0.08) * 0.5 + 0.5, step = Math.floor(k * 4);
    const core = ['#7C2D12', '#C2410C', '#F97316', '#FDBA74'], hot = ['#C2410C', '#F97316', '#FDBA74', '#FEF3C7'];
    box(c, rx - 30, GY - 300, 60, 260, core[step]); box(c, rx - 18, GY - 296, 36, 252, hot[Math.max(0, step - 1)]); box(c, rx - 8, GY - 290, 16, 240, hot[step]);
    checker(c, rx - 30, GY - 300, 4, 260, core[Math.max(0, step - 1)]); checker(c, rx + 26, GY - 300, 4, 260, core[Math.max(0, step - 1)]);
    for (let y = GY - 296; y < GY - 44; y += 18) box(c, rx - 30, y, 60, 2, 'rgba(0, 0, 0, 0.25)');
    for (let i = 0; i < 3; i++) {
      const u = ((f * 0.7 + i * 40) % 120) / 120, r = Math.round((8 + u * 18) / 2) * 2;
      c.save(); c.translate(Math.round(rx + 250 + u * 20), Math.round(GY - 270 - u * 80)); stamp(c, `xs-steam-${r}-${Math.min(3, Math.floor(u * 4))}`, -r - 4, -r - 4, r * 2 + 8, r * 2 + 8, g => {
        const a = [0.42, 0.32, 0.22, 0.12][Math.min(3, Math.floor(u * 4))];
        pixelBlob(g, 0, 0, r, r * 0.8, `rgba(214, 211, 209, ${a})`); pixelBlob(g, -r * 0.3, -r * 0.3, r * 0.5, r * 0.4, `rgba(250, 250, 249, ${a})`);
      }); c.restore();
    }
  }
  // The corridor aft to the hold: the resin, the signs
  if (shown(state, HALLS.exit.l, HALLS.exit.r)) stamp(c, 'xs-exit', HALLS.exit.l, GY - 344, HALLS.exit.r - HALLS.exit.l, 348, paintExit);
  drawFog(c, state);
};

const paintQueue = (g: Ctx) => {
  const P: [string, string, string][] = [['THEY WANT', 'YOUR PLANET', '#B91C1C'], ['IN SPACE NO ONE', 'HEARS YOU WHINE', '#1E3A8A'], ['THEY', 'PROBE!', '#6D28D9'], ['THE QUEEN', '(LEGALLY DISTINCT)', '#0A0A0A']];
  P.forEach(([l1, l2, col], i) => {
    const px = HOUSE_DOOR + 140 + i * 220, py = GY - 304;
    // (a lit poster case: chrome frame, the print, its glass's glare)
    box(g, px - 7, py - 7, 144, 164, INK); box(g, px - 6, py - 6, 142, 162, CHROME[3]); box(g, px - 6, py - 6, 142, 2, CHROME[5]); box(g, px - 6, py + 154, 142, 2, CHROME[1]);
    box(g, px - 1, py - 1, 132, 152, INK);
    box(g, px, py, 130, 150, '#FEF3C7');
    const rr = [mix(col, INK, 0.45), mix(col, INK, 0.2), col, mix(col, '#FFFFFF', 0.2)];
    bandedGradient(g, px + 6, py + 6, 118, 96, [rr[3], rr[2], rr[1], rr[0]], 6);
    if (i === 3) {
      // (her silhouette: the long crested head, the jaws; LEGALLY DISTINCT stamped over it)
      g.fillStyle = '#3F3F46'; g.beginPath(); g.ellipse(px + 70, py + 44, 46, 16, -0.4, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#52525B'; g.beginPath(); g.ellipse(px + 66, py + 38, 36, 8, -0.4, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#3F3F46'; g.beginPath(); g.ellipse(px + 40, py + 70, 18, 26, 0, 0, Math.PI * 2); g.fill();
      for (let t = 0; t < 4; t++) { box(g, px + 22 + t * 6, py + 54, 3, 6, '#E5E7EB'); box(g, px + 22 + t * 6, py + 54, 3, 1, '#FFFFFF'); }
      g.save(); g.translate(px + 64, py + 52); g.rotate(-0.3); g.strokeStyle = '#DC2626'; g.lineWidth = 2; g.strokeRect(-56, -9, 112, 18); g.fillStyle = '#DC2626'; g.font = '6px "Press Start 2P"'; g.fillText('LEGALLY DISTINCT', -50, 3); g.restore();
    } else {
      // (the green: a big head, the eyes, a menacing glow)
      g.fillStyle = INK; g.beginPath(); g.ellipse(px + 64, py + 50, 25, 29, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#16A34A'; g.beginPath(); g.ellipse(px + 64, py + 50, 24, 28, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#4ADE80'; g.beginPath(); g.ellipse(px + 60, py + 44, 18, 20, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#86EFAC'; g.beginPath(); g.ellipse(px + 55, py + 36, 7, 6, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#0A0A0A'; g.beginPath(); g.ellipse(px + 54, py + 50, 8, 5, 0.5, 0, Math.PI * 2); g.ellipse(px + 74, py + 50, 8, 5, -0.5, 0, Math.PI * 2); g.fill();
      box(g, px + 50, py + 48, 3, 2, '#FFFFFF'); box(g, px + 70, py + 48, 3, 2, '#FFFFFF');
      if (i === 2) { line(g, [px + 90, py + 60], [px + 112, py + 30], INK, 4); line(g, [px + 90, py + 60], [px + 112, py + 30], CHROME[4], 2); orb(g, px + 113, py + 28, 4, ['#7F1D1D', '#DC2626', '#F87171', '#FECACA']); }
      if (i === 0) { orb(g, px + 22, py + 82, 14, ['#1E3A8A', '#2563EB', '#3B82F6', '#22C55E', '#86EFAC']); }
    }
    words(g, l1, px + 65, py + 120, '#0A0A0A', 6); words(g, l2, px + 65, py + 136, '#0A0A0A', 6);
    poly(g, [[px + 90, py], [px + 110, py], [px + 40, py + 150], [px + 20, py + 150]], 'rgba(255, 255, 255, 0.12)');
  });
  // (the stanchions: chrome, the velvet ropes swagged between)
  for (let x = HOUSE_DOOR + 60; x < QUEUE_END - 40; x += 90) {
    post(g, x, GY - 52, GY, 4); orb(g, x, GY - 55, 4, HAZ);
    if (x + 90 < QUEUE_END - 40) for (const [dy, col, lw] of [[1, INK, 5], [0, '#991B1B', 3], [-1, '#EF4444', 1]] as const) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(x, GY - 48 + dy); g.quadraticCurveTo(x + 45, GY - 30 + dy, x + 90, GY - 48 + dy); g.stroke(); }
  }
  // (the wait-time board)
  panel(g, HOUSE_DOOR + 60, GY - 122, 154, 46, '#18181B');
  words(g, 'WAIT FROM HERE', HOUSE_DOOR + 137, GY - 102, HAZ[5], 7, INK); words(g, '45 MINUTES', HOUSE_DOOR + 137, GY - 86, HAZ[5], 7, INK);
  // (the safety-video monitor on its bracket (the picture's live))
  const mx = HOUSE_DOOR + 44, my = GY - 300;
  line(g, [mx + 40, CTOP + 30], [mx + 40, my], INK, 4); line(g, [mx + 40, CTOP + 30], [mx + 40, my], STEEL[4], 2);
  panel(g, mx, my, 80, 70, '#27272A', false); box(g, mx + 4, my + 4, 72, 62, INK);
  words(g, 'SAFETY VIDEO', mx + 40, my + 84, '#A1A1AA', 6, INK);
  // (the cast members' door (its plate on it), a fire extinguisher)
  const dx = QUEUE_END - 150;
  panel(g, dx, GY - 140, 88, 140, '#3F3F46', false); box(g, dx + 6, GY - 134, 76, 128, '#27272A'); box(g, dx + 6, GY - 134, 2, 128, '#52525B'); orb(g, dx + 74, GY - 70, 3, CHROME);
  panel(g, dx + 4, GY - 130, 80, 26, '#1E3A8A');
  words(g, 'CAST MEMBERS', dx + 44, GY - 119, '#E0E7FF', 6, INK); words(g, 'ONLY', dx + 44, GY - 109, '#E0E7FF', 6, INK);
  inked(g, [[dx - 34, GY - 70], [dx - 22, GY - 70], [dx - 22, GY - 20], [dx - 34, GY - 20]], '#DC2626'); box(g, dx - 33, GY - 69, 3, 48, '#F87171'); box(g, dx - 32, GY - 78, 8, 8, INK);
};

const paintPreshow = (g: Ctx) => {
  const tx = PRESHOW.tube;
  // (the teleporter: a glass tube floor to ceiling, chrome rings at its ends, its pad, the glass's glints)
  const ring = (y: number) => { g.fillStyle = INK; g.beginPath(); g.ellipse(tx, y, 94, 16, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = CHROME[2]; g.beginPath(); g.ellipse(tx, y, 92, 14, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = CHROME[4]; g.beginPath(); g.ellipse(tx, y - 2, 90, 10, 0, Math.PI, 0); g.fill(); box(g, tx - 60, y - 11, 40, 2, CHROME[6]); };
  g.fillStyle = 'rgba(56, 189, 248, 0.10)'; g.fillRect(tx - 86, CEIL + 40, 172, GY - CEIL - 46);
  checker(g, tx - 86, CEIL + 40, 172, GY - CEIL - 46, 'rgba(125, 211, 252, 0.06)');
  box(g, tx - 74, CEIL + 50, 6, GY - CEIL - 70, 'rgba(224, 242, 254, 0.35)'); box(g, tx - 66, CEIL + 50, 2, GY - CEIL - 70, 'rgba(224, 242, 254, 0.2)'); box(g, tx + 52, CEIL + 50, 3, GY - CEIL - 70, 'rgba(224, 242, 254, 0.3)');
  box(g, tx - 87, CEIL + 40, 2, GY - CEIL - 46, 'rgba(224, 242, 254, 0.4)'); box(g, tx + 85, CEIL + 40, 2, GY - CEIL - 46, 'rgba(224, 242, 254, 0.25)');
  ring(CEIL + 40); ring(GY - 6);
  // (its sign; the cheap: a garden hose for a power line, taped)
  panel(g, tx - 130, CEIL + 64, 260, 32, '#0F172A');
  words(g, 'TELEPORTER BAY B', tx, CEIL + 86, '#38BDF8', 8, INK);
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(tx + 92, GY - 8); g.quadraticCurveTo(tx + 160, GY - 2, tx + 190, GY - 60); g.stroke();
  g.strokeStyle = '#15803D'; g.lineWidth = 4; g.stroke();
  box(g, tx + 160, GY - 30, 14, 6, '#A1A1AA');
  // (the host's screen: a TV in a fiberglass bezel, him on it in his jumpsuit (the words are live, over it))
  const sx = PRESHOW.l + 120;
  panel(g, sx - 8, GY - 338, 166, 116, '#334155');
  box(g, sx - 1, GY - 331, 152, 102, INK);
  bandedGradient(g, sx, GY - 330, 150, 100, ['#1E3A8A', '#1E40AF', '#2563EB', '#1E40AF'], 6);
  for (let k = 0; k < 6; k++) box(g, sx + 10 + k * 24, GY - 320 + (k % 3) * 9, 2, 2, '#BFDBFE');
  // (the host: silver jumpsuit, shoulder pads, a mullet, the grin)
  const hx = sx + 75;
  box(g, hx - 17, GY - 298, 34, 68, INK); box(g, hx - 16, GY - 297, 32, 67, '#D4D4D8'); box(g, hx - 16, GY - 297, 8, 67, '#F4F4F5'); box(g, hx + 10, GY - 297, 6, 67, '#A1A1AA');
  box(g, hx - 22, GY - 298, 44, 8, '#E4E4E7'); box(g, hx - 22, GY - 298, 44, 2, '#FFFFFF');
  box(g, hx - 2, GY - 296, 4, 30, '#DC2626');
  g.fillStyle = INK; g.beginPath(); g.arc(hx, GY - 309, 13, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#F2C49B'; g.beginPath(); g.arc(hx, GY - 309, 12, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FBD9B8'; g.beginPath(); g.arc(hx - 3, GY - 312, 7, 0, Math.PI * 2); g.fill();
  box(g, hx - 13, GY - 324, 26, 8, '#78350F'); box(g, hx - 15, GY - 318, 5, 18, '#78350F'); box(g, hx + 10, GY - 318, 5, 18, '#78350F'); box(g, hx - 12, GY - 324, 14, 2, '#A16207');
  box(g, hx - 6, GY - 310, 3, 3, INK); box(g, hx + 3, GY - 310, 3, 3, INK); box(g, hx - 5, GY - 303, 10, 3, '#FFFFFF'); box(g, hx - 5, GY - 303, 10, 1, INK);
  for (let y = GY - 330; y < GY - 230; y += 3) box(g, sx, y, 150, 1, 'rgba(0, 0, 0, 0.18)');
  box(g, sx + 4, GY - 328, 40, 3, 'rgba(255, 255, 255, 0.22)');
};

const paintBridge = (g: Ctx) => {
  const l = HALLS.bridge.l;
  // (the viewscreen: a cardboard frame round a painted space, Earth, saucers over it)
  panel(g, l + 294, GY - 336, 712, 212, CARD[2], false);
  box(g, l + 300, GY - 330, 700, 200, INK);
  bandedGradient(g, l + 306, GY - 324, 688, 188, ['#020617', '#030A1E', '#071030', '#0B1840'], 6);
  for (let i = 0; i < 60; i++) { const sx = l + 310 + hash(i + 7) * 680, sy = GY - 320 + hash(i + 70) * 180; box(g, sx, sy, 2, 2, i % 5 ? '#94A3B8' : '#F8FAFC'); }
  g.save(); g.beginPath(); g.rect(l + 306, GY - 324, 688, 188); g.clip();
  const ex = l + 650, ey = GY - 140, rings = ['#0B2A6E', '#1D4ED8', '#2563EB', '#3B82F6', '#60A5FA'];
  rings.forEach((col, i) => { g.fillStyle = col; g.beginPath(); g.arc(ex - i * 6, ey - i * 7, 112 - i * 14, 0, Math.PI * 2); g.fill(); });
  g.fillStyle = '#15803D'; g.beginPath(); g.ellipse(l + 620, GY - 190, 40, 24, 0.4, 0, Math.PI * 2); g.ellipse(l + 700, GY - 160, 30, 18, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#22C55E'; g.beginPath(); g.ellipse(l + 612, GY - 196, 26, 14, 0.4, 0, Math.PI * 2); g.ellipse(l + 694, GY - 166, 18, 10, 0, 0, Math.PI * 2); g.fill();
  for (let k = 0; k < 4; k++) { box(g, l + 560 + k * 50, GY - 224 + (k % 2) * 30, 30, 4, 'rgba(255, 255, 255, 0.5)'); }
  for (let i = 0; i < 3; i++) orb(g, l + 580 + i * 60, GY - 150 - (i % 2) * 20, 8, ['#7C2D12', '#C2410C', '#F97316', '#FDBA74', '#FFF7ED']);
  g.restore();
  // (the cardboard's edge showing at the corner, a strip of tape)
  poly(g, [[l + 980, GY - 336], [l + 1006, GY - 336], [l + 1006, GY - 300]], CARD[4]); for (let k = 0; k < 3; k++) box(g, l + 990, GY - 334 + k * 6, 12, 1, CARD[2]);
  box(g, l + 968, GY - 318, 32, 9, INK); box(g, l + 969, GY - 317, 30, 7, '#A1A1AA'); box(g, l + 969, GY - 317, 30, 1, '#E4E4E7');
  // (the consoles: sloped desks, stepped, their screens)
  for (const cx2 of CONSOLES) {
    inked(g, [[cx2, GY], [cx2, GY - 70], [cx2 + 120, GY - 90], [cx2 + 120, GY]], '#334155', 2);
    poly(g, [[cx2 + 1, GY - 70], [cx2 + 119, GY - 90], [cx2 + 119, GY - 84], [cx2 + 1, GY - 64]], '#64748B');
    box(g, cx2 + 1, GY - 60, 119, 60, '#1E293B'); box(g, cx2 + 1, GY - 60, 4, 60, '#475569'); checker(g, cx2 + 1, GY - 62, 119, 2, '#1E293B');
    box(g, cx2 + 10, GY - 50, 50, 26, INK); box(g, cx2 + 11, GY - 49, 48, 24, '#064E3B'); for (let k = 0; k < 4; k++) box(g, cx2 + 14, GY - 45 + k * 5, 20 + (k * 7) % 22, 2, '#34D399');
  }
  // (cardboard crew at their stations: flat cutouts on stands, a smile painted on)
  for (const [i, col] of [[1, '#DC2626'], [2, '#2563EB']] as const) {
    const cx2 = CONSOLES[i] + 60;
    poly(g, [[cx2 - 2, GY - 70], [cx2 + 6, GY - 64], [cx2 + 6, GY - 20], [cx2 - 2, GY - 20]], CARD[2]);
    box(g, cx2 - 14, GY - 132, 28, 64, INK); box(g, cx2 - 13, GY - 131, 26, 62, col); box(g, cx2 - 13, GY - 131, 6, 62, mix(col, '#FFFFFF', 0.25));
    g.fillStyle = INK; g.beginPath(); g.arc(cx2, GY - 144, 13, 0, Math.PI * 2); g.fill(); g.fillStyle = '#F2C49B'; g.beginPath(); g.arc(cx2, GY - 144, 12, 0, Math.PI * 2); g.fill();
    box(g, cx2 - 12, GY - 157, 24, 6, '#3F2A14'); box(g, cx2 - 5, GY - 146, 2, 2, INK); box(g, cx2 + 3, GY - 146, 2, 2, INK); box(g, cx2 - 4, GY - 139, 8, 2, '#991B1B');
    box(g, cx2 + 10, GY - 120, 6, 30, CARD[4]); box(g, cx2 + 10, GY - 120, 6, 1, CARD[6]);
  }
  // (the captain's chair)
  inked(g, [[l + 650, GY], [l + 650, GY - 100], [l + 660, GY - 110], [l + 710, GY - 110], [l + 720, GY - 100], [l + 720, GY]], '#7F1D1D', 2);
  box(g, l + 652, GY - 108, 10, 106, '#B91C1C'); box(g, l + 653, GY - 108, 3, 106, '#EF4444'); box(g, l + 706, GY - 108, 12, 106, '#5F1414');
  for (let y = GY - 96; y < GY - 10; y += 16) box(g, l + 664, y, 42, 1, '#5F1414');
  box(g, l + 640, GY - 50, 90, 8, INK); box(g, l + 641, GY - 49, 88, 6, '#52525B'); box(g, l + 641, GY - 49, 88, 2, '#A1A1AA');
  title(g, l + 270, GY - 304, 'THE BRIDGE', 'BRIDGE OF A LEGALLY DISTINCT SHIP', '#FFFFFF', '#5EEAD4');
};

const paintSpecimen = (g: Ctx) => {
  const { l, r } = HALLS.specimen;
  for (const tx of [l + 720, r - 260]) {
    const ring = (y: number) => { g.fillStyle = INK; g.beginPath(); g.ellipse(tx, y, 72, 14, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#3F3F46'; g.beginPath(); g.ellipse(tx, y, 70, 12, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#71717A'; g.beginPath(); g.ellipse(tx, y - 2, 68, 8, 0, Math.PI, 0); g.fill(); box(g, tx - 50, y - 9, 30, 2, '#D4D4D8'); };
    const greens = ['rgba(20, 83, 45, 0.30)', 'rgba(22, 163, 74, 0.18)', 'rgba(74, 222, 128, 0.14)', 'rgba(22, 163, 74, 0.18)'];
    greens.forEach((col, i) => { g.fillStyle = col; g.fillRect(tx - 66 + i * 33, GY - 300, 33, 296); });
    for (let k = 0; k < 10; k++) box(g, tx - 40 + hash(k + tx) * 80, GY - 280 + hash(k * 3 + tx) * 260, 3, 3, 'rgba(187, 247, 208, 0.45)');
    ring(GY - 300); ring(GY - 4);
    box(g, tx - 10, GY - 316, 20, 16, INK); box(g, tx - 9, GY - 315, 18, 14, '#52525B');
  }
  // (the farmer: a dummy in overalls floating in his tube, mouth a painted O, a straw hat)
  const fx = r - 260;
  box(g, fx - 11, GY - 171, 22, 46, INK); box(g, fx - 10, GY - 170, 20, 44, '#1D4ED8'); box(g, fx - 10, GY - 170, 5, 44, '#3B82F6'); box(g, fx - 6, GY - 170, 3, 12, '#93C5FD'); box(g, fx + 3, GY - 170, 3, 12, '#93C5FD');
  box(g, fx - 16, GY - 166, 6, 26, '#B91C1C'); box(g, fx + 10, GY - 166, 6, 26, '#B91C1C');
  g.fillStyle = INK; g.beginPath(); g.arc(fx, GY - 182, 11, 0, Math.PI * 2); g.fill(); g.fillStyle = '#F2C49B'; g.beginPath(); g.arc(fx, GY - 182, 10, 0, Math.PI * 2); g.fill();
  box(g, fx - 16, GY - 196, 32, 5, INK); box(g, fx - 15, GY - 195, 30, 3, '#FDE047'); box(g, fx - 8, GY - 202, 16, 7, '#EAB308');
  box(g, fx - 5, GY - 185, 2, 2, INK); box(g, fx + 3, GY - 185, 2, 2, INK); box(g, fx - 2, GY - 180, 4, 4, INK);
  box(g, fx - 9, GY - 126, 7, 30, '#1E3A8A'); box(g, fx + 2, GY - 126, 7, 30, '#1E3A8A'); box(g, fx - 10, GY - 98, 9, 5, '#422006'); box(g, fx + 1, GY - 98, 9, 5, '#422006');
  // (the eggs: leathery, split at the top, in a crate; its sign)
  inked(g, [[l + 226, GY], [l + 226, GY - 30], [l + 398, GY - 30], [l + 398, GY]], PINE[3]);
  for (let k = 0; k < 3; k++) box(g, l + 228, GY - 26 + k * 9, 168, 2, PINE[2]);
  for (let i = 0; i < 4; i++) {
    const ex = l + 252 + i * 40, ey = GY - 46;
    g.fillStyle = INK; g.beginPath(); g.ellipse(ex, ey, 16, 24, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#44403C'; g.beginPath(); g.ellipse(ex, ey, 15, 23, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#57534E'; g.beginPath(); g.ellipse(ex - 3, ey - 3, 10, 17, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#78716C'; g.beginPath(); g.ellipse(ex - 6, ey - 8, 4, 7, 0, 0, Math.PI * 2); g.fill();
    for (let k = 0; k < 4; k++) box(g, ex - 12 + k * 7, ey - 6 + (k % 2) * 8, 1, 10, '#292524');
    poly(g, [[ex - 6, ey - 22], [ex, ey - 16], [ex + 6, ey - 22], [ex + 2, ey - 24], [ex, ey - 20], [ex - 2, ey - 24]], '#1C1917');
  }
  // (its sign: down off the catwalk's underside)
  // (its sign, on a post clear of the catwalk over them, pointing at them)
  const sx = l + 128;
  post(g, sx, GY - 70, GY, 4);
  panel(g, sx - 78, GY - 108, 156, 42, HAZ[4]);
  words(g, 'DO NOT TOUCH', sx, GY - 94, INK, 6); words(g, 'THE EGGS', sx, GY - 84, INK, 6); words(g, '(LEGALLY DISTINCT)', sx, GY - 72, INK, 6);
  inked(g, [[sx + 82, GY - 92], [sx + 92, GY - 87], [sx + 82, GY - 82]], HAZ[4]);
  title(g, l + 540, GY - 316, 'SPECIMEN BAY', 'SPECIMENS OF A LEGALLY DISTINCT PLANET', '#FFFFFF', '#86EFAC');
};

const paintEngine = (g: Ctx) => {
  const { l } = HALLS.engine, rx = l + 760;
  // (the reactor's housing: fiberglass, banded, its window (the core's live), its fins)
  inked(g, [[rx - 90, GY], [rx - 90, GY - 328], [rx - 78, GY - 340], [rx + 78, GY - 340], [rx + 90, GY - 328], [rx + 90, GY]], '#44403C', 3);
  box(g, rx - 88, GY - 336, 30, 336, '#57534E'); box(g, rx - 88, GY - 336, 6, 336, '#78716C'); box(g, rx + 58, GY - 336, 30, 336, '#292524');
  for (let i = 0; i < 6; i++) { box(g, rx - 90, GY - 320 + i * 54, 180, 8, INK); box(g, rx - 89, GY - 319 + i * 54, 178, 6, '#57534E'); box(g, rx - 89, GY - 319 + i * 54, 178, 2, '#A8A29E'); }
  box(g, rx - 34, GY - 304, 68, 268, INK);
  // (the pipes into it: fat, stepped, with valves)
  for (const s of [-1, 1]) {
    for (const [y0, x2, y2, w, col] of [[GY - 200, s * 300, GY - 260, 18, '#52525B'], [GY - 120, s * 260, GY - 60, 14, '#3F3F46']] as const) {
      g.lineCap = 'round';
      line(g, [rx + s * 90, y0], [rx + x2, y2], INK, w + 2); line(g, [rx + s * 90, y0], [rx + x2, y2], col, w); line(g, [rx + s * 90, y0 - w * 0.25], [rx + x2, y2 - w * 0.25], mix(col, '#FFFFFF', 0.3), 2);
      g.lineCap = 'butt';
      const vx = rx + s * 90 + (x2 - s * 90) * 0.5, vy = y0 + (y2 - y0) * 0.5;
      orb(g, vx, vy - w * 0.8, 7, ['#7F1D1D', '#B91C1C', '#EF4444', '#FCA5A5']); box(g, vx - 1, vy - w * 0.8, 2, w * 0.8, INK);
    }
  }
  title(g, l + 200, GY - 316, 'ENGINE ROOM', 'REACTOR: FIBERGLASS. DO NOT LICK.', '#FFFFFF', '#FDBA74');
  // (a breaker panel, its door hanging open, a cord off it along the floor)
  panel(g, l + 1180, GY - 260, 70, 110, '#3F3F46'); box(g, l + 1186, GY - 252, 58, 94, '#18181B');
  for (let k = 0; k < 6; k++) { box(g, l + 1192 + (k % 2) * 26, GY - 246 + Math.floor(k / 2) * 28, 18, 10, '#52525B'); box(g, l + 1192 + (k % 2) * 26 + (k === 3 ? 12 : 2), GY - 244 + Math.floor(k / 2) * 28, 4, 6, k === 3 ? '#EF4444' : '#A1A1AA'); }
  words(g, 'DANGER', l + 1215, GY - 136, HAZ[5], 7, INK);
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(l + 1215, GY - 150); g.quadraticCurveTo(l + 1230, GY - 6, l + 1320, GY - 4); g.stroke(); g.strokeStyle = '#EA580C'; g.lineWidth = 2; g.stroke();
};

const paintExit = (g: Ctx) => {
  const l = HALLS.exit.l;
  // (the resin, thick here, round the signs)
  for (let i = 0; i < 14; i++) {
    const x = l + 200 + i * 40, y = GY - 260 + (i % 3) * 30, rw = 30 + (i % 4) * 8;
    pixelBlob(g, x, y, rw + 2, 62, '#0A0510'); pixelBlob(g, x, y, rw, 60, '#1C1026'); pixelBlob(g, x - rw * 0.3, y - 20, rw * 0.4, 26, '#2E1C3E'); box(g, x - rw * 0.4, y - 40, 2, 6, '#9D7AB8');
  }
  // (the signs, clear of it)
  panel(g, l + 100, GY - 322, 320, 58, '#18181B');
  box(g, l + 104, GY - 318, 312, 1, '#C084FC');
  words(g, 'THE HOLD: THE QUEEN', l + 260, GY - 296, HAZ[5], 9, INK);
  words(g, '(LEGALLY DISTINCT)', l + 260, GY - 279, '#D8B4FE', 6, INK);
  for (let i = 0; i < 4; i++) { const ax = l + 160 + i * 140; inked(g, [[ax, GY - 204], [ax + 24, GY - 204], [ax + 24, GY - 212], [ax + 44, GY - 198], [ax + 24, GY - 184], [ax + 24, GY - 192], [ax, GY - 192]], PINK[4]); box(g, ax + 1, GY - 203, 22, 2, PINK[6]); }
  panel(g, l + 120, GY - 174, 220, 24, '#18181B');
  words(g, 'NO FLASH PHOTOGRAPHY', l + 230, GY - 158, '#C4B5FD', 7, INK);
  // (the real exit sign over a door, green: the one thing in here that works)
  const ex = l + 40;
  panel(g, ex, GY - 150, 64, 150, '#3F3F46', false); box(g, ex + 6, GY - 144, 52, 138, '#1C1917'); box(g, ex + 8, GY - 80, 48, 4, '#52525B');
  panel(g, ex + 6, GY - 176, 52, 20, '#14532D'); words(g, 'EXIT', ex + 32, GY - 162, '#86EFAC', 8, INK);
};

/** A fiberglass cow (in the beam, legs dangling). World. */
const drawCow = (c: Ctx, x: number, y: number, f: number) => {
  for (let i = 0; i < 4; i++) {
    const lx = x - 22 + i * 14, fx = lx + Math.sin(f * 0.1 + i) * 3;
    line(c, [lx, y + 12], [fx, y + 32], INK, 7); line(c, [lx, y + 12], [fx, y + 32], '#E7E5E4', 5); box(c, fx - 3, y + 30, 6, 4, '#292524');
  }
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, 35, 19, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#E7E5E4'; c.beginPath(); c.ellipse(x, y, 34, 18, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#FAFAF9'; c.beginPath(); c.ellipse(x - 6, y - 5, 24, 10, 0, 0, Math.PI * 2); c.fill();
  box(c, x - 14, y - 10, 14, 10, '#18181B'); box(c, x + 10, y + 2, 12, 8, '#18181B'); box(c, x - 26, y + 4, 8, 6, '#18181B');
  c.fillStyle = INK; c.beginPath(); c.ellipse(x + 36, y - 6, 13, 11, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#E7E5E4'; c.beginPath(); c.ellipse(x + 36, y - 6, 12, 10, 0, 0, Math.PI * 2); c.fill();
  box(c, x + 40, y - 3, 8, 6, '#F9A8D4'); box(c, x + 42, y - 2, 1, 2, INK); box(c, x + 45, y - 2, 1, 2, INK);
  box(c, x + 32, y - 10, 2, 2, INK); box(c, x + 28, y - 18, 4, 4, '#E7E5E4'); box(c, x + 38, y - 18, 4, 4, '#E7E5E4');
  box(c, x - 4, y + 16, 8, 4, '#F9A8D4');
};

// ---------------------------------------------------------------------------------------------------------------
// The catwalks (gantries back to the wall) and the crates (the parts he stands on: lit top lips)

const drawStandables = (c: Ctx, state: GameState) => {
  const v = view(state), ex = v.x + v.w / 2;
  for (const [x, y, w] of CATWALKS) {
    if (!shown(state, x - 80, x + w + 80)) continue;
    const r = x + w;
    // (its deck going back to the wall: grating, its seams converging; the rail along its back)
    const p = (px: number, py: number, d: number) => atWall(ex, px, py, d);
    poly(c, [[x, y], [r, y], p(r, y, K), p(x, y, K)], '#27272A');
    for (let k = 0; k < 3; k++) { const d0 = 1 - ((1 - K) * k) / 3, d1 = 1 - ((1 - K) * (k + 1)) / 3; poly(c, [p(x, y, d0), p(r, y, d0), p(r, y, d1), p(x, y, d1)], ['#3F3F46', '#34343B', '#2A2A30'][k]); }
    for (let gx = x + 6; gx < r; gx += 10) line(c, [gx, y], p(gx, y, K), '#1F1F24');
    const [bl, by] = p(x, y, K), [br] = p(r, y, K);
    for (let k = 0; k <= Math.floor(w / 40); k++) { const px2 = bl + ((br - bl) * k * 40) / w; box(c, px2, by - 28, 2, 28, '#52525B'); }
    box(c, bl, by - 29, br - bl, 3, '#71717A'); box(c, bl, by - 29, br - bl, 1, '#A1A1AA'); box(c, bl, by - 15, br - bl, 2, '#52525B');
    // (its front: a channel, the lit lip on top (stand here); legs down to the deck, braced)
    stamp(c, `xs-catwalk-${x}`, x - 4, y - 2, w + 8, GY - y + 4, g => {
      for (const lx of [x + 16, r - 22]) { box(g, lx - 1, y + 12, 8, GY - y - 12, INK); box(g, lx, y + 12, 6, GY - y - 12, '#3F3F46'); box(g, lx, y + 12, 2, GY - y - 12, '#71717A'); }
      for (let k = 0; k < Math.floor((GY - y - 30) / 40); k++) { const yy = y + 20 + k * 40; line(g, [x + 22, yy], [r - 22, yy + 30], '#27272A', 2); line(g, [r - 22, yy], [x + 22, yy + 30], '#27272A', 2); }
      box(g, x - 1, y - 1, w + 2, 14, INK);
      box(g, x, y, w, 12, '#52525B'); box(g, x, y + 8, w, 4, '#3F3F46');
      for (let k = x + 8; k < r - 8; k += 12) { box(g, k, y + 4, 6, 4, '#27272A'); box(g, k, y + 4, 6, 1, '#18181B'); }
      box(g, x, y, w, 2, '#D4D4D8'); box(g, x, y + 2, w, 1, '#A1A1AA');
      for (let k = x + 4; k < r; k += 30) box(g, k, y + 9, 2, 2, HAZ[4]);
    });
  }
  for (const [x, w, h] of CRATES) {
    if (!shown(state, x - 60, x + w + 60)) continue;
    const top = GY - h, r = x + w, dd = 0.95;
    // (its top (he's above it) and its side toward the middle, going back)
    const p = (px: number, py: number, d: number) => atWall(ex, px, py, d);
    if (ex > r) { poly(c, [[r, top], p(r, top, dd), p(r, GY, dd), [r, GY]], PINE[2]); line(c, p(r, top, dd), p(r, GY, dd), INK); }
    else if (ex < x) { poly(c, [[x, top], p(x, top, dd), p(x, GY, dd), [x, GY]], PINE[2]); line(c, p(x, top, dd), p(x, GY, dd), INK); }
    poly(c, [[x, top], [r, top], p(r, top, dd), p(x, top, dd)], PINE[4]);
    poly(c, [p(x, top, 0.975), p(r, top, 0.975), p(r, top, dd), p(x, top, dd)], PINE[3]);
    line(c, p(x, top, dd), p(r, top, dd), INK);
    stamp(c, `xs-crate-${x}`, x - 2, top - 2, w + 4, h + 4, g => paintCrate(g, x, top, w, h, 'PROPS'));
  }
};

/** A shipping crate's front (pine, its frame, a cross brace, stenciled), its lit top lip. */
export const paintCrate = (g: Ctx, x: number, top: number, w: number, h: number, stencil: string) => {
  box(g, x - 1, top - 1, w + 2, h + 2, INK);
  box(g, x, top, w, h, PINE[3]);
  for (let k = top + 10; k < top + h; k += 10) { box(g, x, k, w, 1, PINE[2]); checker(g, x, k + 1, w, 1, PINE[4]); }
  box(g, x, top, 6, h, PINE[4]); box(g, x + w - 6, top, 6, h, PINE[2]); box(g, x, top + h - 6, w, 6, PINE[2]); box(g, x, top, w, 6, PINE[4]);
  box(g, x + 6, top + 6, w - 12, 1, INK);
  g.lineCap = 'round'; line(g, [x + 8, top + 8], [x + w - 8, top + h - 8], INK, 5); line(g, [x + 8, top + 8], [x + w - 8, top + h - 8], PINE[4], 3); line(g, [x + 8, top + 7], [x + w - 8, top + h - 9], PINE[5], 1); g.lineCap = 'butt';
  for (const [nx, ny] of [[x + 3, top + 3], [x + w - 4, top + 3], [x + 3, top + h - 4], [x + w - 4, top + h - 4]]) box(g, nx, ny, 1, 1, PINE[0]);
  words(g, stencil, x + w / 2, top + h / 2 + 4, mix(INK, PINE[2], 0.3), 6);
  box(g, x, top, w, 2, PINE[6]); box(g, x, top + 2, w, 1, PINE[5]);
};

// ---------------------------------------------------------------------------------------------------------------
// The ride's track along the deck (where the trams run), the airlock doors they come out of and go into

const drawTrack = (c: Ctx, state: GameState) => {
  for (const [a, b] of TRAMS) {
    if (!shown(state, a - 140, b + 140)) continue;
    stamp(c, `xs-track-${a}`, a - 130, GY - 164, b - a + 260, 170, g => {
      // (the rails along the deck, set into it, lit along their tops; the sleepers)
      for (let x = a - 100; x < b + 100; x += 30) { box(g, x, GY - 7, 16, 4, '#27272A'); box(g, x, GY - 7, 16, 1, '#3F3F46'); }
      for (const ry of [GY - 9, GY - 3]) { box(g, a - 100, ry - 1, b - a + 200, 4, INK); box(g, a - 100, ry, b - a + 200, 2, '#71717A'); box(g, a - 100, ry, b - a + 200, 1, '#D4D4D8'); }
      // (the airlocks: round-topped hatches in a striped frame, the shutter's slats)
      for (const tx of [a - 110, b + 20]) {
        g.fillStyle = INK; g.beginPath(); g.roundRect(tx - 8, GY - 150, 106, 150, [38, 38, 0, 0]); g.fill();
        g.fillStyle = HAZ[3]; g.beginPath(); g.roundRect(tx - 6, GY - 148, 102, 148, [36, 36, 0, 0]); g.fill();
        g.save(); g.beginPath(); g.roundRect(tx - 6, GY - 148, 102, 148, [36, 36, 0, 0]); g.clip();
        for (let k = -160; k < 120; k += 14) poly(g, [[tx + k, GY], [tx + k + 7, GY], [tx + k + 160, GY - 160], [tx + k + 153, GY - 160]], INK);
        g.restore();
        g.fillStyle = INK; g.beginPath(); g.roundRect(tx, GY - 140, 90, 140, [30, 30, 0, 0]); g.fill();
        g.save(); g.beginPath(); g.roundRect(tx + 1, GY - 139, 88, 139, [29, 29, 0, 0]); g.clip();
        for (let i = 0; i < 12; i++) { box(g, tx, GY - 139 + i * 12, 90, 11, i % 2 ? '#3F3F46' : '#52525B'); box(g, tx, GY - 139 + i * 12, 90, 1, '#A1A1AA'); }
        box(g, tx, GY - 139, 90, 139, 'rgba(10, 8, 20, 0.35)');
        g.restore();
      }
    });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The lot, in order (world space, behind him)

export const drawShipBack = (c: Ctx, state: GameState) => {
  const v = view(state);
  if (v.x + v.w < HOUSE_DOOR - 40) return;
  drawWalls(c, state);
  drawDepthLines(c, state);
  drawShows(c, state);
  drawFrames(c, state);
  drawTrack(c, state);
  drawStandables(c, state);
};

