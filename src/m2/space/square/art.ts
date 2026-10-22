// The square, painted (the final pass: peak SNES, fake 3D, one eye for the lot). The backdrop (sky.ts): the sky by the
// hour, the clouds, the blimp, the far skyline of the future; Space Needle 2 far off to the right going up out of
// sight, and the giant atom looming bigger the closer he gets. In the world, back to front: the walk going back, the
// far row along it, the FUTURE SITE OF TOMORROW cut through it (ground.ts); the sides of everything box-shaped going
// back; the shops (buildings.ts), the gate, the atom's doors; the walk under his feet, bent; then the furniture: the
// wall of tomorrow, the rocket trash can, the planter, the kiosk, the station steps, the deck, the awning, the lamps,
// the big signs (props.ts).

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { SECTIONS, GY } from '../geometry';
import { X, Y, PIT, WALL, DOORS_X, SOLIDS, LEDGES, LAMPS, SPEAKERS } from './layout';
import { type Ctx, INK, box, checker, mix, poly, still, inView, viewOf, board, slab, ramp6, lit, chromePole, starburst, ball, bandedGradient, CHROME, PINK, TEAL, ORANGE, LIP, glassOf, timeOfDay, snapPx } from './paint';
import { lettering } from './lettering';
import { drawSky, drawClouds, drawBlimp, drawFarHills, drawFarSkyline, drawGiantAtom, drawNeedle, horizonY } from './sky';
import { drawGoingBack, drawPlayPlane, drawPitDressing, type Ground } from './ground';
import { type Shop, type Block, drawSides, drawShopFront, shopBlocks } from './buildings';
import { drawLamp, drawSpeaker, drawBigSign, paintGate, paintTrashCan, paintPlanter } from './props';
import { drawFlSkyBits, drawFlHorizon, drawFlXeno } from '../landmarks';

type Ctx2 = Ctx;
const { x0, x1 } = SECTIONS.square;

// ---------------------------------------------------------------------------------------------------------------
// The far off

export const drawSquareBackdrop = (c: Ctx2, state: GameState) => {
  drawSky(c, state);
  const t = state.frame, cam = state.camera.x + CANVAS_WIDTH / 2;
  const prog = Math.max(0, Math.min(1, (cam - x0) / (x1 - x0)));
  const hz = horizonY(state);
  drawClouds(c, state);
  drawBlimp(c, state);
  drawFlSkyBits(c, state, hz);
  drawFarHills(c, state);
  // (the park's horizon: Foreign Lands' showcase one way, Wilderness Land's mesa the other)
  drawFlHorizon(c, state, hz - 56);
  drawFarSkyline(c, state, 0.03, 0.45, 3);
  // (XENOSCARE, way off across the park where the land ends)
  drawFlXeno(c, state, hz + 6);
  // Space Needle 2, far off to the right (it goes up out of sight)
  drawNeedle(c, 770 - (cam - x0) * 0.004, hz + 4, 0.26, t);
  // The giant atom: further along, nearer and bigger, till it's over everything at the doors
  const s = 0.42 + prog * prog * 1.25;
  const ax = 500 + (X(DOORS_X) - cam) * 0.014, ay = hz - 120 * s - 40;
  drawGiantAtom(c, ax, ay, s, t);
  drawFarSkyline(c, state, 0.08, 0.22, 7, 14);
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The shops along the back, and the gags

const SHOPS: Shop[] = [
  { x: X(560), w: 300, h: 170, wall: '#FBCFE8', trim: '#14B8A6', roof: 'boomerang', font: 'enamel', name: "ATOMIC ANNIE'S GIFT SHOPPE", sub: 'SOUVENIR URANIUM: NOT REAL (PROBABLY)' },
  { x: X(1460), w: 230, h: 150, wall: '#CCFBF1', trim: '#F472B6', roof: 'flat', font: 'chrome', name: "TOMORROW'S RESTROOMS", sub: 'OUT OF ORDER SINCE 1987' },
  { x: X(2960), w: 216, h: 180, wall: '#FEF3C7', trim: '#0EA5E9', roof: 'saucer', font: 'neon', nameBg: '#1E0B2E', nameInk: '#7DF9FF', name: 'THE PHONE OF THE FUTURE', sub: 'SEE WHO YOU CALL! 25 CENTS. NO DIAL TONE.' },
  { x: X(3200), w: 300, h: 200, wall: '#E0E7FF', trim: '#F97316', roof: 'fin', font: 'neon', nameBg: '#1E0B2E', nameInk: '#FDBA74', name: 'SATELLITE BURGER', sub: 'NOW WITH REAL MEAT FLAVOR' },
  { x: X(4100), w: 330, h: 190, wall: '#E2E8F0', trim: '#8B5CF6', roof: 'dome', font: 'chrome', name: 'HALL OF ROBOT BUTLERS', sub: 'CLOSED AFTER THE INCIDENT' },
  { x: X(5560), w: 260, h: 200, wall: '#FCE7F3', trim: '#22C55E', roof: 'boomerang', font: 'marquee', nameBg: '#991B1B', name: 'ROCKET POPS', sub: '$11. NO REFUNDS IN SPACE.' },
  { x: X(8020), w: 280, h: 170, wall: '#DCFCE7', trim: '#DB2777', roof: 'fin', font: 'enamel', nameBg: '#14532D', nameInk: '#FEF08A', name: 'SPACE AGE SMOKE SHOP', sub: 'ATOMIC CIGARETTES: NOW 30% LESS GLOWING' },
  { x: X(8760), w: 280, h: 180, wall: '#FEF9C3', trim: '#6366F1', roof: 'saucer', font: 'chrome', name: 'THE KITCHEN OF 2000', sub: 'MEAL PILLS IN EVERY FLAVOR OF BEIGE' },
];

const GROUND: Ground = { id: 'sq', floor: [[x0 - 200, X(PIT.a)], [X(PIT.b), x1 + 200]], pits: [{ a: X(PIT.a), b: X(PIT.b), kind: 'site' }] };

const GATE_X = X(330);
/** Everything box-shaped whose sides go back. */
const BLOCKS: Block[] = [
  ...shopBlocks(SHOPS, GY),
  { x0: GATE_X - 214, x1: GATE_X - 186, top: GY - 281, bottom: GY, col: '#F4F6FA', d: 0.95, noTop: true },
  { x0: GATE_X + 186, x1: GATE_X + 214, top: GY - 281, bottom: GY, col: '#F4F6FA', d: 0.95, noTop: true },
  { x0: X(DOORS_X) - 340, x1: X(DOORS_X) + 260, top: GY - 220, bottom: GY, col: '#DDD6FE', noTop: true },
  { x0: X(WALL.x), x1: X(WALL.x + WALL.w), top: Y(WALL.h), bottom: GY, col: '#7DD3FC', d: 0.9 },
  ...SOLIDS.filter(s => s[3] === 'planter').map(([rx, h, w]) => ({ x0: X(rx), x1: X(rx) + w, top: Y(h), bottom: GY, col: '#F59AC2', d: 0.93 })),
];

const gate = (c: Ctx2, state: GameState) => {
  if (!inView(state, GATE_X - 300, GATE_X + 300)) return;
  still(c, 'spc-gate', GATE_X, GY, -270, -345, 540, 347, paintGate);
};

const gags = (c: Ctx2, state: GameState) => {
  drawBigSign(c, state, 'mover', X(2140), 150, 'THE PEOPLE MOVER', "TOMORROW'S SIDEWALK, TODAY!", undefined, undefined, false, 'chrome2');
  drawBigSign(c, state, 'mover2', X(2670), 150, 'THE PEOPLE MOVER (RETURN)', 'PLEASE WALK BRISKLY', undefined, undefined, false, 'chrome2');
  drawBigSign(c, state, 'zap', X(3820), 140, 'THE ELECTRIC SIDEWALK', 'SAFE AS MILK! DO NOT STAND ON IT WHEN IT BUZZES.', '#1E0B2E', '#7DF9FF', false, 'neon2');
  drawBigSign(c, state, 'zap2', X(9100), 280, 'THE ELECTRIC SIDEWALK', 'NOW TWICE AS ELECTRIC!', '#1E0B2E', '#FF6AD5', true, 'neon2');
  drawBigSign(c, state, 'pad', X(4880), 150, 'FEEL THE THRUST!', 'PHOTO OP. STAND ON THE GRILLE. SMILE.', '#7F1D1D', undefined, false, 'marquee');
  drawBigSign(c, state, 'pit', X(6350), 120, 'FUTURE SITE OF TOMORROW', 'COMING 1964', '#F8FAFC', '#1D4ED8', false, 'enamel2');
  drawBigSign(c, state, 'queue', X(9440), 120, 'LINE STARTS HERE', '90 MINUTES FROM THIS POINT', '#4C1D95', undefined, false, 'marquee');
  drawBigSign(c, state, 'plaza', X(8440), 200, 'THE ATOM PLAZA', 'THE FUTURE IS SPLITTING!', undefined, undefined, true, 'chrome2');
};

/** The wall across the street (too tall to jump): a stucco slab between two fluted pilasters, a chrome coping on top
 *  (lit: he stands on it), a pink trim band under it, studded, two little hooded lamps over the mural; the mural of
 *  tomorrow framed in chrome (the sky banded, painted stars, the sun and its rays, clouds, a city of domes, a needle, a
 *  monorail running through, the family in their flying car waving, its jet, speed lines); under it the name on an
 *  enamel plaque, riveted, rust weeping off it; grime up the foot, a chrome kickplate. Everything on it inside its face:
 *  the mural clipped to its frame, nothing past the wall's ends or over its top. */
const paintWall = (g: Ctx2) => {
  const w = WALL.w, h = WALL.h, R = ramp6('#7DD3FC'), on = lit();
  // (the slab: inked round, stucco in bands, lit toward the top, a step darker toward the foot, a stipple)
  box(g, -1, -h - 1, w + 2, h + 1, INK);
  box(g, 0, -h, w, h, R[3]);
  box(g, 0, -h, w, 40, mix(R[3], R[4], 0.35)); checker(g, 0, -h + 40, w, 2, mix(R[3], R[4], 0.35), 0, 2);
  box(g, 0, -60, w, 60, R[2]); checker(g, 0, -62, w, 2, R[2], 0, 2);
  for (let i = 0; i < 70; i++) box(g, 7 + ((i * 37) % (w - 14)), -h + 14 + ((i * 53) % (h - 30)), 1, 1, i % 3 ? R[2] : R[4]);
  // (fluted pilasters up both ends: each flute lit one side, shaded the other; a chrome cap and base)
  for (const px of [0, w - 7]) {
    box(g, px, -h + 12, 7, h - 12, R[4]); box(g, px + 6, -h + 12, 1, h - 12, R[1]);
    for (let k = 1; k < 6; k += 2) { box(g, px + k, -h + 16, 1, h - 34, R[2]); box(g, px + k + 1, -h + 16, 1, h - 34, R[5]); }
    box(g, px, -h + 12, 7, 3, CHROME[4]); box(g, px, -h + 12, 7, 1, CHROME[6]);
    box(g, px, -18, 7, 4, CHROME[3]); box(g, px, -18, 7, 1, CHROME[5]);
  }
  // The coping (he stands on it: lit along its top, flush with the wall's ends) and the trim band under it, studded
  box(g, 0, -h, w, 7, CHROME[4]); box(g, 0, -h, w, 2, LIP[3]); box(g, 0, -h + 2, w, 1, LIP[2]); box(g, 0, -h + 6, w, 1, CHROME[1]);
  for (let x = 6; x < w - 4; x += 12) box(g, x, -h + 4, 2, 1, CHROME[2]);
  box(g, 0, -h + 7, w, 6, PINK[3]); box(g, 0, -h + 7, w, 1, PINK[5]); box(g, 0, -h + 12, w, 1, PINK[1]);
  for (let x = 4; x < w - 2; x += 8) box(g, x, -h + 9, 2, 2, PINK[5]);
  // The mural, in its chrome frame (everything in it clipped to it)
  const mx = 10, my = -h + 22, mw = w - 20, mh = 112;
  box(g, mx - 3, my - 3, mw + 6, mh + 6, INK);
  box(g, mx - 2, my - 2, mw + 4, mh + 4, CHROME[3]); box(g, mx - 2, my - 2, mw + 4, 1, CHROME[6]); box(g, mx - 2, my - 2, 1, mh + 4, CHROME[5]);
  box(g, mx + mw + 1, my - 2, 1, mh + 4, CHROME[1]); box(g, mx - 2, my + mh + 1, mw + 4, 1, CHROME[1]);
  box(g, mx - 1, my - 1, mw + 2, mh + 2, INK);
  g.save(); g.beginPath(); g.rect(mx, my, mw, mh); g.clip();
  // (the sky, banded and dithered; a few painted stars still up in its top)
  bandedGradient(g, mx, my, mw, mh, ['#1E4FB8', '#2A6ED8', '#4A9AEA', '#86C8F2', '#C8E6F6', '#FCE6B8'], 8, 2);
  for (const [sx0, sy0] of [[6, 6], [22, 12], [40, 4], [58, 14], [14, 22]] as const) { box(g, mx + sx0, my + sy0, 1, 1, '#FFFFFF'); box(g, mx + sx0 - 1, my + sy0 + 3, 3, 1, '#C8E6F6'); }
  // (the sun: stepped, rays round it in two lengths)
  const sx = mx + mw - 16, sy = my + 22;
  g.strokeStyle = '#FDE68A'; g.lineWidth = 2;
  for (let k = 0; k < 12; k++) { const a = (k * Math.PI) / 6, l = k % 2 ? 15 : 20; g.beginPath(); g.moveTo(sx + Math.cos(a) * 11, sy + Math.sin(a) * 11); g.lineTo(sx + Math.cos(a) * l, sy + Math.sin(a) * l); g.stroke(); }
  g.fillStyle = '#F59E0B'; g.beginPath(); g.arc(sx, sy, 10, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FDE047'; g.beginPath(); g.arc(sx - 1, sy - 1, 8, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FEF9C3'; g.beginPath(); g.arc(sx - 3, sy - 3, 4, 0, Math.PI * 2); g.fill();
  // (puffy painted clouds, lit tops)
  for (const [cx0, cy0, cw] of [[mx + 4, my + 40, 22], [mx + 44, my + 50, 18]] as const) {
    g.fillStyle = '#C8E6F6'; g.beginPath(); g.ellipse(cx0 + cw / 2, cy0 + 2, cw / 2, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(cx0 + cw / 2 - 2, cy0, cw / 2 - 3, 3, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(cx0 + cw / 2 - 3, cy0 - 2, 4, 0, Math.PI * 2); g.fill();
  }
  // (the city along its foot: a hazed back row of domes, a needle up through them, a monorail on its pylons with a
  // train on it, the front row of domes in color with lit windows, a strip of lawn)
  const gy = my + mh - 16;
  g.fillStyle = '#9CB8DC'; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(mx + 4 + k * 20, gy - 6, 10, Math.PI, 0); g.fill(); }
  box(g, mx + 52, gy - 58, 3, 52, '#6E46A2'); box(g, mx + 52, gy - 58, 1, 52, '#9470C4');
  g.fillStyle = INK; g.beginPath(); g.ellipse(mx + 53, gy - 58, 13, 4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#E8659E'; g.beginPath(); g.ellipse(mx + 53, gy - 58, 12, 3, 0, 0, Math.PI * 2); g.fill(); box(g, mx + 45, gy - 60, 8, 1, '#FCD0E2');
  box(g, mx + 52, gy - 66, 2, 6, '#6E46A2');
  box(g, mx, gy - 26, mw, 3, '#E2E8F0'); box(g, mx, gy - 23, mw, 1, '#64748B');
  for (let x = mx + 12; x < mx + mw; x += 28) box(g, x, gy - 23, 2, 23, '#94A3B8');
  box(g, mx + 6, gy - 32, 22, 6, '#F8FAFC'); box(g, mx + 6, gy - 32, 22, 1, '#FFFFFF'); for (let k = 0; k < 4; k++) box(g, mx + 8 + k * 5, gy - 30, 3, 2, '#0EA5E9');
  for (let k = 0; k < 4; k++) {
    const dx = mx + 8 + k * 22, r = 9 + (k % 2) * 4, col = ['#9470C4', '#22BCAC', '#E8659E', '#6E46A2'][k];
    g.fillStyle = INK; g.beginPath(); g.arc(dx, gy, r + 1, Math.PI, 0); g.fill();
    g.fillStyle = col; g.beginPath(); g.arc(dx, gy, r, Math.PI, 0); g.fill();
    g.fillStyle = mix(col, '#FFFFFF', 0.4); g.beginPath(); g.arc(dx - r * 0.3, gy - r * 0.3, r * 0.4, Math.PI, 0); g.fill();
    for (let j = -1; j <= 1; j++) box(g, dx + j * 4 - 1, gy - 4, 2, 2, on ? '#FFE8A0' : '#1E3A8A');
  }
  box(g, mx, gy, mw, 16, '#3A6A3A'); box(g, mx, gy, mw, 2, '#5EB86A'); checker(g, mx, gy + 2, mw, 2, '#5EB86A', 0, 2);
  // (the flying car: speed lines behind, its jet, a fin, the body red in bands with a chrome strake, four heads waving
  // (Dad's arm up), a bubble top with a glint)
  const cx = mx + mw / 2 + 4, cy = my + 66;
  for (let k = 0; k < 3; k++) box(g, mx, cy - 4 + k * 5, 18 - k * 4, 2, '#F8FAFC');
  g.fillStyle = '#FB9440'; g.beginPath(); g.moveTo(cx - 32, cy + 2); g.lineTo(cx - 42, cy + 6); g.lineTo(cx - 32, cy + 9); g.fill();
  g.fillStyle = '#FDE047'; g.beginPath(); g.moveTo(cx - 32, cy + 4); g.lineTo(cx - 38, cy + 6); g.lineTo(cx - 32, cy + 7); g.fill();
  poly(g, [[cx - 30, cy + 2], [cx - 38, cy - 12], [cx - 33, cy - 12], [cx - 22, cy + 1]], INK);
  poly(g, [[cx - 29, cy + 1], [cx - 36, cy - 11], [cx - 33, cy - 11], [cx - 23, cy + 1]], '#B91C1C');
  g.fillStyle = INK; g.beginPath(); g.ellipse(cx, cy + 5, 33, 11, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#991B1B'; g.beginPath(); g.ellipse(cx, cy + 5, 32, 10, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#DC2626'; g.beginPath(); g.ellipse(cx, cy + 3, 31, 8, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#F87171'; g.beginPath(); g.ellipse(cx - 4, cy + 1, 24, 4, 0, 0, Math.PI * 2); g.fill();
  box(g, cx - 28, cy + 6, 56, 1, '#E2E8F0');
  for (let k = 0; k < 4; k++) {
    const hx = cx - 15 + k * 10;
    box(g, hx - 3, cy - 3, 6, 4, ['#F472B6', '#38BDF8', '#FDE047', '#34D399'][k]);
    g.fillStyle = INK; g.beginPath(); g.arc(hx, cy - 7, 4.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = ['#F0C8A2', '#8A5A36', '#E4C0A8', '#55331C'][k]; g.beginPath(); g.arc(hx, cy - 7, 3.5, 0, Math.PI * 2); g.fill();
    box(g, hx - 2, cy - 8, 1, 1, INK); box(g, hx + 1, cy - 8, 1, 1, INK);
  }
  box(g, cx + 16, cy - 20, 2, 9, '#F0C8A2'); box(g, cx + 15, cy - 22, 4, 3, '#F0C8A2');
  g.fillStyle = 'rgba(200,236,255,0.4)'; g.beginPath(); g.ellipse(cx, cy - 3, 24, 11, 0, Math.PI, 0); g.fill();
  box(g, cx - 12, cy - 12, 6, 1, 'rgba(255,255,255,0.8)');
  g.restore();
  // (the lamps over it: hooded, on short chrome arms off the trim band, well inside the wall's ends; lit after dark,
  // their light laid down the mural's top in dithered bands)
  for (const lx of [24, w - 30]) {
    box(g, lx + 2, -h + 13, 2, 4, CHROME[3]);
    box(g, lx - 1, -h + 16, 8, 4, INK); box(g, lx, -h + 16, 6, 3, CHROME[4]); box(g, lx, -h + 16, 6, 1, CHROME[6]);
    box(g, lx + 1, -h + 19, 4, 1, on ? '#FFF3B0' : CHROME[1]);
    if (on) { checker(g, lx - 4, my, 14, 6, 'rgba(255,240,180,0.55)', 0, 2); checker(g, lx - 7, my + 6, 20, 8, 'rgba(255,240,180,0.35)', 1, 2); }
  }
  // The plaque: enamel, navy, a chrome bezel, four rivets (rust weeping off the lower two), the name on it
  const py = my + mh + 8, ph = 58;
  box(g, 9, py - 1, w - 18, ph + 2, INK);
  box(g, 10, py, w - 20, ph, CHROME[3]); box(g, 10, py, w - 20, 1, CHROME[6]); box(g, 10, py + ph - 1, w - 20, 1, CHROME[1]);
  box(g, 12, py + 2, w - 24, ph - 4, '#1E3A8A'); box(g, 12, py + 2, w - 24, 2, '#3B5BB0'); box(g, 12, py + ph - 4, w - 24, 2, '#14285E');
  for (const [rx, ry] of [[14, py + 4], [w - 16, py + 4], [14, py + ph - 6], [w - 16, py + ph - 6]] as const) { box(g, rx, ry, 2, 2, CHROME[5]); box(g, rx + 1, ry + 1, 1, 1, CHROME[1]); }
  for (const [s, y] of [['THE WALL', 11], ['OF', 29], ['TOMORROW', 47]] as const) lettering(g, s, w / 2, py + y, 'enamel', '#F8FAFC', '#14285E');
  for (const rx of [14, w - 16]) for (let y = 1; y < 9; y += 2) box(g, rx + ((y >> 1) & 1), py + ph + y, 1, 2, y < 6 ? '#8A5A3A' : R[2]);
  // (grime up the foot, the kickplate: chrome, bolted)
  checker(g, 7, -26, w - 14, 8, R[1], 0, 2); box(g, 7, -18, w - 14, 4, R[1]);
  box(g, 0, -14, w, 14, CHROME[2]); box(g, 0, -14, w, 1, CHROME[5]); box(g, 0, -1, w, 1, CHROME[0]);
  for (let x = 4; x < w - 2; x += 12) { box(g, x, -10, 2, 2, CHROME[4]); box(g, x, -5, 2, 2, CHROME[4]); }
};

/** The solids (the rocket trash can, the planter) and the ledges (the kiosk dome, the station steps, the deck, the
 *  burger shop's awning). */
const things = (c: Ctx2, state: GameState) => {
  for (const [rx, h, w, what] of SOLIDS) {
    const x = X(rx);
    if (what === 'wall' || !inView(state, x - 40, x + w + 40)) continue;
    still(c, `spc-solid-${what}`, x, GY, -14, -h - 34, w + 28, h + 36, g => (what === 'trashcan' ? paintTrashCan(g, w, h) : paintPlanter(g, w, h)));
  }
  for (const [rx, h, w, what] of LEDGES) {
    const x = X(rx), y = Y(h);
    if (!inView(state, x - 60, x + w + 60)) continue;
    still(c, `spc-ledge-${what}-${w}-${h}`, x, y, -60, -120, w + 120, h + 124, g => {
      if (what === 'kiosk') {
        // (the SPACE FOOD STICKS kiosk: a round counter in stepped bands, its dome roof (stand on it: its lit rim))
        const R = ramp6('#FEF3C7'), O = ramp6('#F97316');
        box(g, 19, 0, w - 38, h, INK);
        slab(g, 20, 2, w - 40, h - 2, R, false);
        box(g, 20, h - 42, w - 40, 42, O[3]); box(g, 20, h - 42, w - 40, 2, O[5]); for (let k = 26; k < w - 24; k += 12) box(g, k, h - 38, 6, 36, O[2]);
        box(g, 26, 22, w - 52, 40, INK); box(g, 27, 23, w - 54, 38, glassOf()[2]); for (let k = 0; k < 5; k++) { box(g, 32 + k * 18, 40, 12, 18, INK); box(g, 33 + k * 18, 41, 10, 16, ['#F97316', '#22C55E', '#E8659E', '#F0C840', '#9470C4'][k]); }
        g.fillStyle = INK; g.beginPath(); g.ellipse(w / 2, 6, w / 2 + 6, 15, 0, 0, Math.PI * 2); g.fill();
        for (let k = 0; k < 4; k++) { g.fillStyle = TEAL[1 + k]; g.beginPath(); g.ellipse(w / 2 - k * 6, 6 - k * 2, w / 2 + 3 - k * 14, 12 - k * 2.5, 0, 0, Math.PI * 2); g.fill(); }
        box(g, 0, -1, w, 4, LIP[2]); box(g, 0, -1, w, 1, LIP[3]);
        starburst(g, w / 2, -14, 10, '#F97316');
        board(g, w / 2, 32, 'SPACE FOOD STICKS', '#0F172A', '#FDBA74', 6, 3, false, 'small');
      } else if (what === 'steps' || what === 'deck') {
        // (a landing on chrome stilts: a lit lip, a railing along the back)
        chromePole(g, 8, 12, h, 8); chromePole(g, w - 8, 12, h, 8);
        box(g, -2, -2, w + 4, 16, INK); box(g, 0, 0, w, 12, CHROME[3]); box(g, 0, 8, w, 4, CHROME[2]);
        box(g, 0, 0, w, 3, LIP[2]); box(g, 0, 0, w, 1, LIP[3]);
        for (let k = 6; k < w - 4; k += 12) box(g, k, 5, 4, 2, PINK[3]);
        box(g, 0, -28, w, 4, INK); box(g, 0, -27, w, 2, CHROME[4]); for (let k = 0; k <= w; k += 24) { box(g, k - 1, -27, 3, 27, INK); box(g, k, -27, 1, 27, CHROME[4]); }
        if (what === 'deck') board(g, w / 2, 26, 'SATELLITE VIEWING DECK', '#0F172A', '#7DD3FC', 6, 4, false, 'small');
      } else {
        // (the awning: orange and white stripes, its front edge a lit chrome tube (stand on it), its brackets)
        box(g, -2, -2, w + 4, 16, INK);
        for (let k = 0; k < w; k += 20) { box(g, k, 2, 10, 10, ORANGE[3]); box(g, k + 10, 2, 10, 10, '#FFF7ED'); box(g, k, 9, 10, 3, ORANGE[2]); box(g, k + 10, 9, 10, 3, '#E8D8C8'); }
        for (let k = 0; k < w; k += 10) { g.fillStyle = (k / 10) % 2 ? '#FFF7ED' : ORANGE[3]; g.beginPath(); g.moveTo(k, 12); g.lineTo(k + 10, 12); g.lineTo(k + 5, 18); g.fill(); }
        box(g, -1, -1, w + 2, 4, LIP[2]); box(g, -1, -1, w + 2, 1, LIP[3]);
        for (const bx of [8, w - 10]) { g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(bx, 12); g.lineTo(bx + 2, 40); g.stroke(); g.strokeStyle = CHROME[4]; g.lineWidth = 1; g.stroke(); }
      }
    });
  }
};

/** The atom's doors at the end: a googie pavilion (lilac stucco, a band of portholes lit after dark, a boomerang roof),
 *  chrome doors with an atom on each, ENTER THE ATOM over them, queue rails out front. */
const paintDoors = (g: Ctx2) => {
  const on = lit(), R = ramp6('#DDD6FE'), V = ramp6('#8B5CF6'), glass = glassOf();
  // (the roof: a boomerang over the lot)
  poly(g, [[-362, -212], [-40, -302], [282, -212], [-40, -250]], INK);
  poly(g, [[-356, -215], [-40, -297], [276, -215], [-40, -253]], V[3]);
  poly(g, [[-356, -215], [-40, -253], [276, -215], [-40, -246]], V[1]);
  poly(g, [[-356, -215], [-40, -297], [-40, -292], [-350, -216]], V[5]);
  for (let k = 0.1; k < 1; k += 0.1) box(g, -356 + 316 * k - 1, -215 - 82 * k, 3, 3, on ? '#FFF3B0' : V[4]);
  box(g, -342, -222, 604, 222, INK);
  slab(g, -340, -220, 600, 220, R);
  box(g, -340, -220, 600, 10, V[3]); box(g, -340, -220, 600, 2, V[5]);
  // (the gable under the roof's plate, glazed, mullioned: the roof sits on it, no gap; the eaves' shadow under it)
  poly(g, [[-288, -221], [-40, -248], [208, -221]], INK);
  poly(g, [[-284, -221], [-40, -245], [204, -221]], glass[1]);
  g.save(); g.beginPath(); g.moveTo(-284, -221); g.lineTo(-40, -245); g.lineTo(204, -221); g.closePath(); g.clip();
  box(g, -284, -246, 488, 12, glass[2]); checker(g, -284, -235, 488, 2, glass[2], 0, 2);
  for (let x = -270; x < 204; x += 18) { box(g, x - 1, -248, 3, 28, INK); box(g, x, -248, 1, 28, CHROME[4]); }
  g.restore();
  box(g, -340, -210, 600, 4, 'rgba(20, 12, 36, 0.3)'); checker(g, -340, -206, 600, 2, 'rgba(20, 12, 36, 0.3)', 0, 2);
  // (the windows: tall, banded, lit warm after dark)
  for (let k = -320; k < 250; k += 70) {
    if (k > -110 && k < 70) continue;
    box(g, k - 1, -191, 42, 122, INK); box(g, k, -190, 40, 120, glass[1]); box(g, k, -190, 40, 40, glass[2]); box(g, k, -190, 2, 120, glass[4]);
    box(g, k + 19, -190, 2, 120, CHROME[3]); box(g, k - 3, -70, 46, 4, CHROME[4]);
  }
  // (the doors: a pair, chrome, an atom on each, a canopy over)
  box(g, -64, -144, 128, 144, INK); box(g, -62, -142, 124, 142, CHROME[2]);
  for (const s of [-1, 1]) {
    const dx = s < 0 ? -60 : 2;
    box(g, dx, -140, 58, 140, CHROME[4]); box(g, dx, -140, 4, 140, CHROME[6]); box(g, dx + 52, -140, 6, 140, CHROME[3]);
    g.strokeStyle = V[2]; g.lineWidth = 2; for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(dx + 29, -84, 17, 6, (k * Math.PI) / 3, 0, Math.PI * 2); g.stroke(); }
    ball(g, dx + 29, -84, 4, '#E8659E');
    box(g, dx + (s < 0 ? 50 : 4), -76, 4, 20, CHROME[1]);
  }
  poly(g, [[-80, -150], [80, -150], [70, -138], [-70, -138]], INK); poly(g, [[-78, -149], [78, -149], [69, -140], [-69, -140]], PINK[3]);
  board(g, 0, -170, 'ENTER THE ATOM', '#1E0B2E', '#F0ABFC', 9, 7, true, 'neon2');
  starburst(g, 200, -150, 14, '#F0ABFC'); starburst(g, -280, -150, 14, '#F0ABFC');
  void TEAL;
};
const doors = (c: Ctx2, state: GameState) => {
  const dx = X(DOORS_X);
  if (!inView(state, dx - 400, dx + 300)) return;
  still(c, 'spc-atomdoors', dx, GY, -370, -340, 640, 342, paintDoors);
};

/** `mid`: what goes on the walk, in front of the shops but behind the furniture (the track, the gear). */
export const drawSquareBack = (c: Ctx2, state: GameState, mid?: () => void) => snapPx(c, () => {
  const v = viewOf(state);
  drawGoingBack(c, v, GROUND);
  drawSides(c, v, BLOCKS);
  for (const sh of SHOPS) drawShopFront(c, state, sh, GY);
  gate(c, state);
  doors(c, state);
  drawPlayPlane(c, v, GROUND);
  drawPitDressing(c, v, GROUND);
  mid?.();
  if (inView(state, X(WALL.x) - 60, X(WALL.x + WALL.w) + 60)) still(c, 'spc-wall', X(WALL.x), GY, -4, -WALL.h - 4, WALL.w + 8, WALL.h + 6, paintWall);
  things(c, state);
  gags(c, state);
  for (const rx of LAMPS) if (inView(state, X(rx) - 50, X(rx) + 60)) drawLamp(c, X(rx), GY, state.frame);
  void mix; void timeOfDay;
});

export const drawSpeakers = (c: Ctx2, state: GameState, talking: boolean) => {
  for (const [rx, h] of SPEAKERS) if (inView(state, X(rx) - 40, X(rx) + 40)) drawSpeaker(c, X(rx), GY, h, talking, state.frame);
};

export const squareLamps = (): Light[] => [
  ...LAMPS.map(rx => ({ x: X(rx) + 28, y: GY - 180, r: 150, a: 0.85, color: '#FFE9A8' })),
  { x: X(DOORS_X), y: GY - 120, r: 260, a: 0.9, color: '#F0ABFC' },
];
void ORANGE;
