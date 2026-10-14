// The main drag, painted: the sky by the hour; behind him (to the left) the giant atom with the hole he came out of,
// smoking; ahead, bigger the further he gets, Space Needle 2 going up out of sight. The shops along the back, the
// trench, the drained lagoon, the googie roofs, the needle's plaza and its lift.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { timeOfDay } from '../../timeOfDay';
import { box } from '../section';
import { SECTIONS, GY } from '../geometry';
import { INK, still, inView, drawSky, drawSkyline, drawGiantAtom, drawNeedle, drawStreet, drawPitEdge, drawLamp, drawSpeaker, board, drawShop, horizonY, type Shop } from '../square/paint';
import { X, Y, T1, T2, LEDGES, LAMPS, SPEAKERS, LIFT_X } from './layout';

type Ctx = CanvasRenderingContext2D;
const { x0, x1 } = SECTIONS.drag;

export const drawDragBackdrop = (c: Ctx, state: GameState) => {
  drawSky(c, state);
  const t = state.frame, cam = state.camera.x + CANVAS_WIDTH / 2;
  const prog = Math.max(0, Math.min(1, (cam - x0) / (x1 - x0)));
  const hz = horizonY(state);
  drawSkyline(c, state, 0.08, '#A5B4FC', 11);
  // The giant atom, behind him now (receding off to the left), the hole in it smoking
  const as = 1.1 - prog * 0.6;
  drawGiantAtom(c, 120 - prog * 260, hz - 120 * as - 40, as, t, true);
  // Space Needle 2 ahead: up out of sight; over its own lift once that's on the screen
  const lift = X(LIFT_X) - state.camera.x;
  drawNeedle(c, Math.min(690, lift), hz + 6, 0.6 + prog * prog * 1.5, t);
  drawSkyline(c, state, 0.2, '#C4B5FD', 5);
  return true;
};

const SHOPS: Shop[] = [
  { x: X(60), w: 320, h: 180, wall: '#EDE9FE', trim: '#8B5CF6', roof: 'boomerang', name: 'VOYAGE TO 2010: EXIT', sub: 'PLEASE EXIT THROUGH THE GIFT SHOP' },
  { x: X(6080), w: 230, h: 150, wall: '#FCE7F3', trim: '#0EA5E9', roof: 'dome', name: 'ROBO-DENTIST', sub: 'NO HUMANS INVOLVED. NO REFUNDS.' },
  { x: X(3620), w: 300, h: 170, wall: '#ECFEFF', trim: '#F97316', roof: 'fin', name: 'CAR OF TOMORROW SHOWROOM', sub: 'FLYING CARS: COMING SOON SINCE 1958' },
  { x: X(4000), w: 280, h: 160, wall: '#FEF3C7', trim: '#DB2777', roof: 'saucer', name: 'PNEUMATIC MAIL', sub: 'YOUR LETTER, SHOT THROUGH A TUBE' },
  { x: X(4700), w: 220, h: 260, wall: '#CCFBF1', trim: '#F472B6', roof: 'flat', name: 'MOTEL OF THE FUTURE', sub: 'HOURLY RATES', signDrop: 24 },
  { x: X(5000), w: 200, h: 240, wall: '#E0E7FF', trim: '#22C55E', roof: 'flat', name: 'ATOMIC DRY CLEANERS', sub: 'WE GET THE GLOW OUT', signDrop: 24 },
  { x: X(5300), w: 200, h: 260, wall: '#FFE4E6', trim: '#6366F1', roof: 'flat', name: 'MOON TAN', sub: 'TAN LIKE AN ASTRONAUT. BURN LIKE ONE.', signDrop: 24 },
  { x: X(6820), w: 260, h: 160, wall: '#F1F5F9', trim: '#E11D48', roof: 'boomerang', name: 'NEEDLE GIFTS', sub: 'I WENT TO SPACE AND ALL I GOT WAS THIS SHIRT' },
];

const signs = (c: Ctx, state: GameState) => {
  // (`pylon`: up on one pole, where two posts would stand in front of a shop or the monorail's shed)
  const big = (key: string, x: number, h: number, a: string, b: string, pylon = false) => {
    if (!inView(state, x - 220, x + 220)) return;
    still(c, `spc-dsign-${key}`, x, GY, -220, -h - 40, 440, h + 42, g => {
      if (pylon) { box(g, -5, -h + 10, 10, h - 10, '#475569'); box(g, -3, -h + 10, 3, h - 10, '#94A3B8'); }
      else { box(g, -150, -h + 10, 6, h - 10, '#64748B'); box(g, 144, -h + 10, 6, h - 10, '#64748B'); }
      board(g, 0, -h, a, '#0F172A', '#FDE047', 9, 8);
      board(g, 0, -h + 26, b, '#FFFFFF', '#0F766E', 6, 5);
    });
  };
  big('trench', X(T1.a - 150), 120, 'FUTURELAND UNDERGROUND', 'OPEN TRENCH. CAST MEMBERS ONLY.');
  big('lagoon', X(1880), 150, 'THE LAGOON OF TOMORROW', 'DRAINED 1971. SUBMARINES ON THE BOTTOM.', true);
  big('mover', X(4300), 290, 'THE PEOPLE MOVER (EXPRESS RETURN)', 'WALK FASTER, CITIZEN!', true);
  big('plaza', X(5850), 150, 'SPACE NEEDLE 2', 'TO SPACE AND BEYOND! FIVE MILES UP!');
};

const pits = (c: Ctx, state: GameState) => {
  for (const [a, b, deep] of [[T1.a, T1.b, false], [T2.a, T2.b, true]] as const) {
    if (!inView(state, X(a) - 100, X(b) + 100)) continue;
    box(c, X(a), GY, X(b) - X(a), 600, '#0B1020');
    if (deep) {
      // (the lagoon's bottom, far down: a submarine on its side, the tide line up the walls)
      box(c, X(a), GY + 30, X(b) - X(a), 4, '#1E3A5F');
      c.fillStyle = '#334155'; c.beginPath(); c.ellipse(X(a) + 500, GY + 330, 120, 26, 0.1, 0, Math.PI * 2); c.fill();
      box(c, X(a) + 480, GY + 290, 30, 24, '#334155');
    } else for (let x = X(a) + 40; x < X(b); x += 90) box(c, x, GY + 260, 4, 70, '#57534E');
    drawPitEdge(c, X(a), GY, 1); drawPitEdge(c, X(b), GY, -1);
    for (const fx of [X(a) - 66, X(b) + 12]) { box(c, fx, GY - 30, 56, 4, '#F97316'); box(c, fx, GY - 18, 56, 4, '#FFFFFF'); box(c, fx, GY - 34, 3, 34, '#F97316'); box(c, fx + 52, GY - 34, 3, 34, '#F97316'); }
  }
};

const ledges = (c: Ctx, state: GameState) => {
  for (const [rx, h, w, what] of LEDGES) {
    const x = X(rx), y = Y(h);
    if (!inView(state, x - 40, x + w + 40)) continue;
    still(c, `spc-dledge-${what}-${w}-${h}`, x, y, -20, -40, w + 40, h + 44, g => {
      if (what === 'roof') {
        // (the roof's edge: a lit chrome lip to stand on, a starburst at the corner)
        box(g, -6, -2, w + 12, 14, INK); box(g, -4, 0, w + 8, 10, '#E2E8F0'); box(g, -4, 0, w + 8, 3, '#FFFFFF');
        g.strokeStyle = '#FDE047'; g.lineWidth = 2; for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; g.beginPath(); g.moveTo(w - 10, -14); g.lineTo(w - 10 + Math.cos(a) * 9, -14 + Math.sin(a) * 9); g.stroke(); }
      } else {
        box(g, 4, 10, 8, h, '#94A3B8'); box(g, w - 12, 10, 8, h, '#94A3B8');
        box(g, -2, -2, w + 4, 16, INK); box(g, 0, 0, w, 12, '#CBD5E1'); box(g, 0, 0, w, 3, '#F8FAFC');
        box(g, 0, -26, w, 3, '#64748B'); for (let k = 0; k <= w; k += 24) box(g, k, -26, 2, 26, '#64748B');
        // (its name on the fascia under the floor: up over the railing it was cut off, and whoever stood there covered it)
        if (what === 'balcony') board(g, w / 2, 26, 'OBSERVATION BALCONY', '#0F172A', '#7DD3FC', 6, 5);
      }
    });
  }
};

/** The needle's base at the end: its three legs coming down into the plaza, the lift's doors in the core. */
const base = (c: Ctx, state: GameState) => {
  const lx = X(LIFT_X);
  if (!inView(state, lx - 400, lx + 400)) return;
  const lit = timeOfDay().lamps > 0.3;
  still(c, `spc-needlebase-${lit ? 1 : 0}`, lx, GY, -380, -560, 760, 562, g => {
    // (the legs, splayed out to their feet)
    for (const [fx, tx, col] of [[-320, -40, '#CBD5E1'], [320, 40, '#F8FAFC'], [-120, -10, '#E2E8F0']] as const) {
      g.fillStyle = INK; g.beginPath(); g.moveTo(fx - 22, 0); g.lineTo(tx - 12, -560); g.lineTo(tx + 12, -560); g.lineTo(fx + 22, 0); g.fill();
      g.fillStyle = col; g.beginPath(); g.moveTo(fx - 18, 0); g.lineTo(tx - 9, -560); g.lineTo(tx + 9, -560); g.lineTo(fx + 18, 0); g.fill();
    }
    // (the core, the lift lobby round its foot)
    box(g, -44, -560, 88, 560, INK); box(g, -40, -560, 80, 560, '#F1F5F9'); box(g, -40, -560, 12, 560, '#FFFFFF');
    box(g, -140, -150, 280, 150, INK); box(g, -136, -146, 272, 146, '#FDA4AF');
    box(g, -136, -146, 272, 10, '#E11D48');
    box(g, -36, -120, 72, 120, INK); box(g, -33, -117, 32, 117, '#CBD5E1'); box(g, 1, -117, 32, 117, '#CBD5E1');
    box(g, -2, -117, 4, 117, INK);
    box(g, 50, -96, 14, 22, INK); g.fillStyle = lit ? '#FDE047' : '#F59E0B'; g.beginPath(); g.moveTo(57, -92); g.lineTo(53, -84); g.lineTo(61, -84); g.fill();
    board(g, 0, -170, 'LIFT TO SPACE', '#0F172A', '#FDE047', 10, 8);
    board(g, 0, -132, 'ALL ABOARD! 5 MILES UP. NO REFUNDS IN ORBIT.', '#FFFFFF', '#BE123C', 6, 4);
  });
};

export const drawDragBack = (c: Ctx, state: GameState) => {
  for (const sh of SHOPS) drawShop(c, state, sh, GY);
  base(c, state);
  signs(c, state);
  for (const rx of LAMPS) if (inView(state, X(rx) - 40, X(rx) + 40)) drawLamp(c, X(rx), GY);
  drawStreet(c, state, x0 - 200, X(T1.a), GY);
  drawStreet(c, state, X(T1.b), X(T2.a), GY);
  drawStreet(c, state, X(T2.b), x1 + 200, GY);
  pits(c, state);
  ledges(c, state);
};

export const drawDragSpeakers = (c: Ctx, state: GameState, talking: boolean) => {
  for (const [rx, h] of SPEAKERS) if (inView(state, X(rx) - 40, X(rx) + 40)) drawSpeaker(c, X(rx), GY, h, talking, state.frame);
};

export const dragLamps = (): Light[] => [
  ...LAMPS.map(rx => ({ x: X(rx) + 27, y: GY - 178, r: 150, a: 0.85, color: '#FFE9A8' })),
  { x: X(LIFT_X), y: GY - 100, r: 260, a: 0.9, color: '#FDE68A' },
];
