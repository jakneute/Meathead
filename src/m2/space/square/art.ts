// The square, painted: the sky by the hour over a skyline of the future, the giant atom looming bigger the closer he
// gets (and Space Needle 2 off to the right, going up out of sight), the shops along the back with their gags, the
// gate, the street, the pit, the wall, the lamps and the PA's horns; the atom's doors at the end.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { timeOfDay } from '../../timeOfDay';
import { box, label } from '../section';
import { SECTIONS, GY } from '../geometry';
import { X, Y, PIT, WALL, DOORS_X, SOLIDS, LEDGES, LAMPS, SPEAKERS, TRACK, TRACK_LEGS, MONO, BELTS, PLATES, PADS } from './layout';
import { INK, still, inView, drawSky, drawSkyline, drawGiantAtom, drawNeedle, drawStreet, drawPitEdge, drawLamp, drawSpeaker, board, drawShop, horizonY, type Shop } from './paint';

type Ctx = CanvasRenderingContext2D;
const { x0, x1 } = SECTIONS.square;

// ---------------------------------------------------------------------------------------------------------------
// The far off

export const drawSquareBackdrop = (c: Ctx, state: GameState) => {
  drawSky(c, state);
  const t = state.frame, cam = state.camera.x + CANVAS_WIDTH / 2;
  const prog = Math.max(0, Math.min(1, (cam - x0) / (x1 - x0)));
  const hz = horizonY(state);
  drawSkyline(c, state, 0.08, '#A5B4FC', 3);
  // Space Needle 2, far off to the right (it goes up out of sight)
  drawNeedle(c, 770 - (cam - x0) * 0.004, hz + 4, 0.26, t);
  // The giant atom: further along, nearer and bigger, till it's over everything at the doors
  const s = 0.42 + prog * prog * 1.25;
  const ax = 500 + (X(DOORS_X) - cam) * 0.014, ay = hz - 120 * s - 40;
  drawGiantAtom(c, ax, ay, s, t);
  drawSkyline(c, state, 0.2, '#C4B5FD', 0);
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The shops along the back, and the gags

const SHOPS: Shop[] = [
  { x: X(560), w: 300, h: 170, wall: '#FBCFE8', trim: '#14B8A6', roof: 'boomerang', name: "ATOMIC ANNIE'S GIFT SHOPPE", sub: 'SOUVENIR URANIUM: NOT REAL (PROBABLY)' },
  { x: X(1460), w: 230, h: 150, wall: '#CCFBF1', trim: '#F472B6', roof: 'flat', name: "TOMORROW'S RESTROOMS", sub: 'OUT OF ORDER SINCE 1987' },
  { x: X(2560), w: 260, h: 180, wall: '#FEF3C7', trim: '#0EA5E9', roof: 'saucer', name: 'THE PHONE OF THE FUTURE', sub: 'SEE WHO YOU CALL! 25 CENTS. NO DIAL TONE.' },
  { x: X(3200), w: 300, h: 160, wall: '#E0E7FF', trim: '#F97316', roof: 'fin', name: 'SATELLITE BURGER', sub: 'NOW WITH REAL MEAT FLAVOR' },
  { x: X(4100), w: 330, h: 190, wall: '#E2E8F0', trim: '#8B5CF6', roof: 'dome', name: 'HALL OF ROBOT BUTLERS', sub: 'CLOSED AFTER THE INCIDENT' },
  { x: X(5560), w: 260, h: 160, wall: '#FCE7F3', trim: '#22C55E', roof: 'boomerang', name: 'ROCKET POPS', sub: '$11. NO REFUNDS IN SPACE.' },
  { x: X(7860), w: 280, h: 170, wall: '#DCFCE7', trim: '#DB2777', roof: 'fin', name: 'SPACE AGE SMOKE SHOP', sub: 'ATOMIC CIGARETTES: NOW 30% LESS GLOWING' },
  { x: X(8760), w: 280, h: 180, wall: '#FEF9C3', trim: '#6366F1', roof: 'saucer', name: 'THE KITCHEN OF 2000', sub: 'MEAL PILLS IN EVERY FLAVOR OF BEIGE' },
];

const gate = (c: Ctx, state: GameState) => {
  const gx = X(330);
  if (!inView(state, gx - 300, gx + 300)) return;
  still(c, 'spc-gate', gx, GY, -260, -330, 520, 332, g => {
    // (two pylons, a boomerang arch between them, the name on it, a starburst on top)
    for (const s of [-1, 1]) { box(g, s * 200 - 14, -280, 28, 280, INK); box(g, s * 200 - 12, -280, 24, 280, '#F8FAFC'); box(g, s * 200 - 12, -280, 6, 280, '#FFFFFF'); box(g, s * 200 + 4, -280, 8, 280, '#CBD5E1'); }
    g.fillStyle = INK; g.beginPath(); g.moveTo(-240, -250); g.quadraticCurveTo(0, -330, 240, -250); g.lineTo(240, -226); g.quadraticCurveTo(0, -300, -240, -226); g.closePath(); g.fill();
    g.fillStyle = '#F472B6'; g.beginPath(); g.moveTo(-236, -247); g.quadraticCurveTo(0, -326, 236, -247); g.lineTo(236, -230); g.quadraticCurveTo(0, -304, -236, -230); g.closePath(); g.fill();
    board(g, 0, -252, 'FUTURELAND', '#0F172A', '#5EEAD4', 14, 10);
    board(g, 0, -212, 'THE WORLD OF TOMORROW! (SINCE 1962)', '#FFFFFF', '#BE185D', 7, 6);
    g.strokeStyle = '#FDE047'; g.lineWidth = 3;
    for (let k = 0; k < 12; k++) { const a = (k * Math.PI) / 6; g.beginPath(); g.moveTo(0, -300); g.lineTo(Math.cos(a) * 26, -300 + Math.sin(a) * 26); g.stroke(); }
  });
};

/** The PEOPLE MOVER's sign over the belts, the ELECTRIC SIDEWALK's, the THRUST pad's, the monorail station's. */
const gags = (c: Ctx, state: GameState) => {
  const big = (key: string, x: number, h: number, a: string, b: string, bg = '#0F172A', ink = '#FDE047') => {
    if (!inView(state, x - 220, x + 220)) return;
    still(c, `spc-sign-${key}`, x, GY, -220, -h - 40, 440, h + 42, g => {
      box(g, -150, -h + 10, 6, h - 10, '#64748B'); box(g, 144, -h + 10, 6, h - 10, '#64748B');
      board(g, 0, -h, a, bg, ink, 9, 8);
      board(g, 0, -h + 26, b, '#FFFFFF', '#0F766E', 6, 5);
    });
  };
  big('mover', X(2140), 150, 'THE PEOPLE MOVER', "TOMORROW'S SIDEWALK, TODAY!");
  big('mover2', X(2670), 150, 'THE PEOPLE MOVER (RETURN)', 'PLEASE WALK BRISKLY');
  big('zap', X(3820), 140, 'THE ELECTRIC SIDEWALK', 'SAFE AS MILK! DO NOT STAND ON IT WHEN IT BUZZES.');
  big('zap2', X(9050), 140, 'THE ELECTRIC SIDEWALK', 'NOW TWICE AS ELECTRIC!');
  big('pad', X(4880), 150, 'FEEL THE THRUST!', 'PHOTO OP. STAND ON THE GRILLE. SMILE.');
  big('pit', X(6440), 120, 'FUTURE SITE OF TOMORROW', 'COMING 1964');
  big('queue', X(9440), 120, 'LINE STARTS HERE', '90 MINUTES FROM THIS POINT');
  big('plaza', X(8150), 160, 'THE ATOM PLAZA', 'THE FUTURE IS SPLITTING!');
};

/** The wall across the street, a painting of tomorrow on it: a family in a flying car, waving. Its top lit (stand on it). */
const wall = (c: Ctx, state: GameState) => {
  const wx = X(WALL.x);
  if (!inView(state, wx - 60, wx + WALL.w + 60)) return;
  still(c, 'spc-wall', wx, GY, -40, -WALL.h - 50, WALL.w + 80, WALL.h + 52, g => {
    box(g, -2, -WALL.h - 2, WALL.w + 4, WALL.h + 2, INK);
    box(g, 0, -WALL.h, WALL.w, WALL.h, '#7DD3FC');
    box(g, 0, -WALL.h, WALL.w, 6, '#F8FAFC');
    box(g, 0, -WALL.h + 6, WALL.w, 3, '#94A3B8');
    // (the painting: a red flying car with fins, four smiling heads, speed lines, a sun)
    g.fillStyle = '#FDE047'; g.beginPath(); g.arc(WALL.w - 22, -WALL.h + 40, 14, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#DC2626'; g.beginPath(); g.ellipse(WALL.w / 2, -WALL.h + 110, 40, 14, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(WALL.w / 2 - 40, -WALL.h + 108); g.lineTo(WALL.w / 2 - 50, -WALL.h + 90); g.lineTo(WALL.w / 2 - 28, -WALL.h + 104); g.fill();
    for (let k = 0; k < 4; k++) { g.fillStyle = ['#F0C8A2', '#8A5A36', '#E4C0A8', '#55331C'][k]; g.beginPath(); g.arc(WALL.w / 2 - 22 + k * 14, -WALL.h + 94, 6, 0, Math.PI * 2); g.fill(); }
    for (let k = 0; k < 3; k++) box(g, 4, -WALL.h + 104 + k * 6, 20, 2, '#F8FAFC');
    label(g, 'THE WALL', WALL.w / 2, -WALL.h + 160, '#0F172A', 8);
    label(g, 'OF', WALL.w / 2, -WALL.h + 174, '#0F172A', 8);
    label(g, 'TOMORROW', WALL.w / 2, -WALL.h + 188, '#0F172A', 8);
  });
};

/** The solids (the rocket trash can, the planter) and the ledges (the kiosk dome, the station steps, the deck). */
const things = (c: Ctx, state: GameState) => {
  for (const [rx, h, w, what] of SOLIDS) {
    const x = X(rx);
    if (what === 'wall' || !inView(state, x - 40, x + w + 40)) continue;
    still(c, `spc-solid-${what}`, x, GY, -10, -h - 30, w + 20, h + 32, g => {
      if (what === 'trashcan') {
        // (a rocket, fins and all, FEED ME, EARTHLING on its side; its top lit)
        box(g, -2, -h - 2, w + 4, h + 2, INK); box(g, 0, -h, w, h, '#F8FAFC'); box(g, 0, -h, w, 3, '#FFFFFF');
        box(g, w - 8, -h, 8, h, '#CBD5E1');
        g.fillStyle = INK; g.beginPath(); g.moveTo(-8, 0); g.lineTo(0, -24); g.lineTo(0, 0); g.fill(); g.beginPath(); g.moveTo(w + 8, 0); g.lineTo(w, -24); g.lineTo(w, 0); g.fill();
        g.fillStyle = '#DC2626'; g.beginPath(); g.moveTo(-6, -1); g.lineTo(-1, -20); g.lineTo(-1, -1); g.fill(); g.beginPath(); g.moveTo(w + 6, -1); g.lineTo(w + 1, -20); g.lineTo(w + 1, -1); g.fill();
        g.fillStyle = INK; g.beginPath(); g.arc(w / 2, -h + 22, 7, 0, Math.PI * 2); g.fill();
        label(g, 'FEED', w / 2, -h + 44, '#DC2626', 5); label(g, 'ME', w / 2, -h + 52, '#DC2626', 5);
      } else {
        box(g, -2, -h - 2, w + 4, h + 2, INK); box(g, 0, -h, w, h, '#F9A8D4'); box(g, 0, -h, w, 4, '#FDF2F8');
        for (let k = 0; k < 5; k++) { g.fillStyle = '#16A34A'; g.beginPath(); g.arc(8 + k * 16, -h - 4, 9, Math.PI, 0); g.fill(); }
      }
    });
  }
  for (const [rx, h, w, what] of LEDGES) {
    const x = X(rx), y = Y(h);
    if (!inView(state, x - 60, x + w + 60)) continue;
    still(c, `spc-ledge-${what}-${w}-${h}`, x, y, -60, -120, w + 120, h + 124, g => {
      if (what === 'kiosk') {
        // (the SPACE FOOD STICKS kiosk: a round counter, its dome roof (stand on it: its lit rim))
        box(g, 20, 0, w - 40, h, INK); box(g, 22, 2, w - 44, h - 2, '#FEF3C7'); box(g, 22, h - 40, w - 44, 40, '#F97316');
        g.fillStyle = INK; g.beginPath(); g.ellipse(w / 2, 6, w / 2 + 6, 14, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#14B8A6'; g.beginPath(); g.ellipse(w / 2, 6, w / 2 + 3, 11, 0, 0, Math.PI * 2); g.fill();
        box(g, 0, -1, w, 4, '#CCFBF1');
        board(g, w / 2, 34, 'SPACE FOOD STICKS', '#0F172A', '#FDBA74', 6, 5);
      } else if (what === 'steps' || what === 'deck') {
        // (a landing on its stilts: steel, a lit lip, a railing at the back)
        box(g, 4, 10, 8, h, '#94A3B8'); box(g, w - 12, 10, 8, h, '#94A3B8');
        box(g, -2, -2, w + 4, 16, INK); box(g, 0, 0, w, 12, '#CBD5E1'); box(g, 0, 0, w, 3, '#F8FAFC');
        box(g, 0, -26, w, 3, '#64748B'); for (let k = 0; k <= w; k += 24) box(g, k, -26, 2, 26, '#64748B');
        if (what === 'deck') board(g, w / 2, -40, 'SATELLITE VIEWING DECK', '#0F172A', '#7DD3FC', 6, 5);
      } else {
        // (an awning: striped, its front edge lit)
        box(g, -2, -2, w + 4, 14, INK);
        for (let k = 0; k < w; k += 20) box(g, k, 0, 10, 10, '#F97316'), box(g, k + 10, 0, 10, 10, '#FFF7ED');
        box(g, 0, 0, w, 3, '#FFFFFF');
      }
    });
  }
};

/** The atom's doors at the end: a low googie pavilion, ENTER THE ATOM over the doors, the giant stalk behind it. */
const doors = (c: Ctx, state: GameState) => {
  const dx = X(DOORS_X);
  if (!inView(state, dx - 400, dx + 300)) return;
  const lit = timeOfDay().lamps > 0.3;
  still(c, `spc-atomdoors-${lit ? 1 : 0}`, dx, GY, -360, -330, 620, 332, g => {
    box(g, -340, -220, 600, 220, INK); box(g, -338, -218, 596, 218, '#EDE9FE');
    box(g, -338, -218, 596, 10, '#A78BFA');
    g.fillStyle = INK; g.beginPath(); g.moveTo(-360, -214); g.lineTo(-40, -300); g.lineTo(280, -214); g.lineTo(-40, -250); g.closePath(); g.fill();
    g.fillStyle = '#8B5CF6'; g.beginPath(); g.moveTo(-354, -217); g.lineTo(-40, -295); g.lineTo(274, -217); g.lineTo(-40, -253); g.closePath(); g.fill();
    for (let k = -320; k < 250; k += 70) { box(g, k, -190, 40, 120, INK); box(g, k + 2, -188, 36, 116, lit ? '#FDE68A' : '#4C1D95'); }
    // (the doors: a pair, chrome, an atom on each)
    box(g, -60, -140, 120, 140, INK); box(g, -58, -138, 56, 138, '#CBD5E1'); box(g, 2, -138, 56, 138, '#CBD5E1');
    for (const s of [-30, 30]) { g.strokeStyle = '#7C3AED'; g.lineWidth = 2; for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(s, -80, 16, 6, (k * Math.PI) / 3, 0, Math.PI * 2); g.stroke(); } }
    board(g, 0, -162, 'ENTER THE ATOM', '#0F172A', '#F0ABFC', 9, 7);
  });
};

/** The pit under the monorail: its two edges, the fence before it, the hard hats left lying there in 1963. */
const pit = (c: Ctx, state: GameState) => {
  if (!inView(state, X(PIT.a) - 100, X(PIT.b) + 100)) return;
  drawPitEdge(c, X(PIT.a), GY, 1);
  drawPitEdge(c, X(PIT.b), GY, -1);
  // (the dark down there, the rebar sticking up far below)
  box(c, X(PIT.a), GY, X(PIT.b) - X(PIT.a), 600, '#0B1020');
  for (let x = X(PIT.a) + 30; x < X(PIT.b); x += 70) box(c, x, GY + 240, 3, 80, '#57534E');
  for (const fx of [X(PIT.a) - 70, X(PIT.b) + 20]) for (let k = 0; k < 3; k++) { box(c, fx + k * 18, GY - 34, 3, 34, '#F97316'); box(c, fx - 2, GY - 30 + k * 0, 56, 4, '#F97316'); box(c, fx - 2, GY - 18, 56, 4, '#FFFFFF'); }
};

export const drawSquareBack = (c: Ctx, state: GameState) => {
  for (const sh of SHOPS) drawShop(c, state, sh, GY);
  gate(c, state);
  gags(c, state);
  doors(c, state);
  for (const rx of LAMPS) if (inView(state, X(rx) - 40, X(rx) + 40)) drawLamp(c, X(rx), GY);
  // (the street, in its runs; the pit between)
  drawStreet(c, state, x0 - 200, X(PIT.a), GY);
  drawStreet(c, state, X(PIT.b), x1 + 200, GY);
  pit(c, state);
  wall(c, state);
  things(c, state);
  void TRACK; void TRACK_LEGS; void MONO; void BELTS; void PLATES; void PADS;
};

export const drawSpeakers = (c: Ctx, state: GameState, talking: boolean) => {
  for (const [rx, h] of SPEAKERS) if (inView(state, X(rx) - 40, X(rx) + 40)) drawSpeaker(c, X(rx), GY, h, talking, state.frame);
};

export const squareLamps = (): Light[] => [
  ...LAMPS.map(rx => ({ x: X(rx) + 27, y: GY - 178, r: 150, a: 0.85, color: '#FFE9A8' })),
  { x: X(DOORS_X), y: GY - 120, r: 260, a: 0.9, color: '#F0ABFC' },
];
