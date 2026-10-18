// The engine, drawn (the final pass: peak SNES): Lonesome Pine Station's 4-4-0 (wilds/stationArt.ts), No. 7, at the
// train section's size: the cowcatcher's red slats, the oil headlamp in its box, the diamond stack, the smokebox and its
// number plate, the Russia-iron boiler in brass bands with its handrail and running board, the sand and steam domes and
// the bell in its yoke between, the whistle, the cylinder and steam chest, the crosshead on its guides, the two big
// counterweighted drivers and the pilot truck's wheels, the side and main rods going round, the varnished cab with its
// arched window and the open back Tucker leans out of. The still parts are painted once for the hour (paint.ts still());
// the wheels (cached by their turn), the rods, the smoke and the steam go live.
//
// Local: x from the cab's back end, y from the rail (wheels sit on it).

import { signText } from '../../signLetters';
import { type Ctx, box, checker, mix, INK, still, stillAt, N, rivets, barrel, wheel, puff, RED, IRON, BLACK, BRASS, VARNISH, STEEL, GOLD } from './paint';

/** The station's engine blown up to here (its units to the train's). */
const K = 2.4;
const k = (n: number) => Math.round(n * K);
/** Where the drivers, the pilot wheels, the crosshead and the stack sit (local). */
export const ENG = {
  drivers: [k(40), k(96)], dr: k(22), pilots: [k(160), k(186)], pr: k(11),
  stack: { x: k(182), y: -k(144) }, whistle: { x: k(98), y: -k(124) }, lamp: { x: k(214), y: -k(109) }, front: k(236), cabW: k(66), cabTop: -k(134),
};

const dome = (g: Ctx, x: number, w: number, h: number, R: string[]) => {
  const y0 = -k(90);
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - w / 2 - 4, y0 + 2); g.quadraticCurveTo(x - w / 2, y0 - h * 0.4, x - w / 2 + 3, y0 - h); g.lineTo(x + w / 2 - 3, y0 - h); g.quadraticCurveTo(x + w / 2, y0 - h * 0.4, x + w / 2 + 4, y0 + 2); g.closePath(); g.fill();
  g.fillStyle = R[3]; g.beginPath(); g.moveTo(x - w / 2 - 2, y0); g.quadraticCurveTo(x - w / 2 + 2, y0 - h * 0.4, x - w / 2 + 5, y0 - h + 2); g.lineTo(x + w / 2 - 5, y0 - h + 2); g.quadraticCurveTo(x + w / 2 - 2, y0 - h * 0.4, x + w / 2 + 2, y0); g.closePath(); g.fill();
  box(g, x - w / 2 + 4, y0 - h + 4, 5, h - 6, R[5]); box(g, x - w / 2 + 9, y0 - h + 4, 3, h - 8, R[4]); checker(g, x - w / 2 + 12, y0 - h + 4, 4, h - 8, R[4], 0);
  box(g, x + w / 2 - 10, y0 - h + 4, 6, h - 6, R[1]); checker(g, x + w / 2 - 14, y0 - h + 4, 4, h - 6, R[2], 1);
  box(g, x - w / 2 - 1, y0 - h - 6, w + 2, 8, INK); box(g, x - w / 2, y0 - h - 5, w, 5, R[4]); box(g, x - w / 2, y0 - h - 5, w, 1, R[6] ?? R[5]);
  box(g, x - w / 2 - 4, y0 - 4, w + 8, 6, INK); box(g, x - w / 2 - 3, y0 - 3, w + 6, 3, R[2]);
};

const paintEngine = (g: Ctx) => {
  const Rd = N(RED), I = N(IRON), B = N(BLACK), V = N(VARNISH), S = N(STEEL), Br = BRASS;
  // ---- the frame along the bottom, the pilot beam
  box(g, -4, -k(40), k(200), k(8), INK); box(g, -3, -k(40) + 1, k(200) - 2, k(8) - 2, B[2]); box(g, -3, -k(40) + 1, k(200) - 2, 2, B[4]);
  // ---- the boiler: Russia iron in bands, its lagging seams, brass bands, the handrail on its stanchions, the running
  //      board along it, the pipes down its side
  barrel(g, k(64), -k(92), k(104), k(48), I);
  for (let x = k(64) + 14; x < k(168); x += 18) box(g, x, -k(92) + 3, 1, k(48) - 6, I[2]);
  for (const bx of [82, 116, 150]) { const x = k(bx); box(g, x - 1, -k(93), 10, k(50), INK); box(g, x, -k(92), 8, k(48), Br[3]); box(g, x, -k(92), 2, k(48), Br[5]); box(g, x + 6, -k(92), 2, k(48), Br[1]); checker(g, x + 2, -k(92), 2, k(48), Br[4], 0); }
  box(g, k(66), -k(80) - 1, k(122), 4, INK); box(g, k(66), -k(80), k(122), 1, Br[5]); box(g, k(66), -k(80) + 1, k(122), 1, Br[3]);
  for (let x = k(72); x < k(184); x += k(18)) { box(g, x, -k(80), 3, 9, INK); box(g, x + 1, -k(80), 1, 8, Br[2]); }
  box(g, k(62), -k(46), k(128), k(5), INK); box(g, k(62) + 1, -k(46) + 1, k(128) - 2, k(5) - 2, B[4]); box(g, k(62) + 1, -k(46) + 1, k(128) - 2, 1, B[6]);
  // (the injector pipe and the sand pipes down to the rails)
  g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(k(70), -k(58)); g.lineTo(k(150), -k(58)); g.lineTo(k(160), -k(50)); g.stroke(); g.strokeStyle = Br[3]; g.lineWidth = 3; g.stroke(); g.strokeStyle = Br[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(k(70), -k(59)); g.lineTo(k(150), -k(59)); g.stroke();
  for (const sx of [k(132), k(148)]) { g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(sx, -k(92)); g.quadraticCurveTo(sx - 30, -k(60), sx - 40, -k(30)); g.stroke(); g.strokeStyle = B[4]; g.lineWidth = 2; g.stroke(); }
  // ---- the smokebox: black, riveted, its door's rim, the number plate in brass
  barrel(g, k(168), -k(96), k(30), k(54), B);
  box(g, k(196), -k(94), 9, k(50), B[4]); box(g, k(196), -k(94), 2, k(50), B[6]);
  rivets(g, k(170), k(196), -k(90), B[6], 6); rivets(g, k(170), k(196), -k(48), B[6], 6);
  for (let y = -k(88); y < -k(48); y += 10) { g.fillStyle = INK; g.fillRect(k(172), y, 2, 2); g.fillStyle = B[6]; g.fillRect(k(172), y, 1, 1); }
  g.fillStyle = INK; g.beginPath(); g.arc(k(184), -k(70), 20, 0, Math.PI * 2); g.fill();
  g.fillStyle = Br[3]; g.beginPath(); g.arc(k(184), -k(70), 18, 0, Math.PI * 2); g.fill();
  g.fillStyle = Br[5]; g.beginPath(); g.arc(k(184) - 4, -k(70) - 5, 8, Math.PI, Math.PI * 1.6); g.lineTo(k(184), -k(70)); g.fill();
  g.fillStyle = Rd[1]; g.beginPath(); g.arc(k(184), -k(70), 13, 0, Math.PI * 2); g.fill();
  signText(g, '7', k(184), -k(70) + 7, { sx: 2, sy: 2, fill: Br[4], shadow: INK });
  // ---- the domes (sand, steam: brass), the bell in its yoke between, the whistle and the safety valve
  dome(g, k(140), k(18), k(16), Br);
  dome(g, k(104), k(20), k(22), Br);
  box(g, k(117), -k(114), 5, k(18), INK); box(g, k(127), -k(114), 5, k(18), INK); box(g, k(117) + 1, -k(114), 3, k(18), B[4]); box(g, k(127) + 1, -k(114), 3, k(18), B[4]);
  box(g, k(115), -k(116), k(17), 6, INK); box(g, k(115) + 1, -k(116) + 1, k(17) - 2, 4, B[5]);
  g.fillStyle = INK; g.beginPath(); g.moveTo(k(116) - 2, -k(96)); g.lineTo(k(119), -k(111)); g.lineTo(k(127), -k(111)); g.lineTo(k(130) + 2, -k(96)); g.closePath(); g.fill();
  g.fillStyle = Br[3]; g.beginPath(); g.moveTo(k(116) + 1, -k(97)); g.lineTo(k(119) + 2, -k(110)); g.lineTo(k(127) - 2, -k(110)); g.lineTo(k(130) - 1, -k(97)); g.closePath(); g.fill();
  box(g, k(119) + 2, -k(109), 4, k(11), Br[5]); box(g, k(119) + 7, -k(109), 2, k(11), Br[4]); box(g, k(126) - 2, -k(109), 3, k(11), Br[1]);
  box(g, k(116), -k(98), k(14), 4, Br[2]);
  box(g, k(96) - 1, -k(122), 12, k(10), INK); box(g, k(96), -k(122), 10, k(10), Br[4]); box(g, k(96), -k(122), 3, k(10), Br[5]); box(g, k(95) - 2, -k(124) - 2, k(6) + 4, 8, INK); box(g, k(95) - 1, -k(124) - 1, k(6) + 2, 6, Br[3]);
  box(g, k(108), -k(116), 8, 10, INK); box(g, k(108) + 1, -k(116) + 1, 6, 9, Br[4]);
  // ---- the diamond stack: the spark arrester flared up top, the taper onto the smokebox, banded
  const sp = (pts: [number, number][], col: string) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(k(x), -k(y)) : g.moveTo(k(x), -k(y)))); g.closePath(); g.fill(); };
  sp([[175.5, 95], [177.5, 116.5], [165.5, 132], [165.5, 142.5], [198.5, 142.5], [198.5, 132], [186.5, 116.5], [188.5, 95]], INK);
  sp([[177, 96], [179, 116], [167, 131], [167, 141], [197, 141], [197, 131], [185, 116], [187, 96]], B[3]);
  sp([[167, 131], [167, 141], [173, 141], [173, 131]], B[5]); sp([[179, 116], [177, 96], [180, 96], [182, 116]], B[5]);
  sp([[191, 131], [191, 141], [197, 141], [197, 131]], B[1]); sp([[185, 116], [187, 96], [184.5, 96], [183, 116]], B[1]);
  checker(g, k(168), -k(131), k(28), 6, B[4], 0);
  box(g, k(166), -k(145), k(32), 10, INK); box(g, k(166) + 1, -k(145) + 1, k(32) - 2, 7, Br[3]); box(g, k(166) + 1, -k(145) + 1, k(32) - 2, 2, Br[5]);
  box(g, k(176), -k(118), k(12), 7, INK); box(g, k(176) + 1, -k(118) + 1, k(12) - 2, 5, Br[2]);
  // ---- the headlamp: a big box lamp on its bracket, brass-trimmed, a painted panel, the lens
  box(g, k(190) - 1, -k(122) - 1, k(30) + 2, k(26) + 2, INK); box(g, k(190), -k(122), k(30), k(26), V[3]); box(g, k(190), -k(122), k(30), 4, V[5]); box(g, k(190), -k(122), 5, k(26), V[4]); box(g, k(220) - 5, -k(122), 5, k(26), V[1]);
  box(g, k(193), -k(118), k(10), k(18), INK); box(g, k(193) + 1, -k(118) + 1, k(10) - 2, k(18) - 2, Rd[3]); box(g, k(193) + 3, -k(118) + 4, k(10) - 6, k(18) - 8, '#2E5A3A');
  box(g, k(188), -k(126), k(34), k(5), INK); box(g, k(188) + 1, -k(126) + 1, k(34) - 2, k(5) - 2, B[4]); box(g, k(196), -k(132), k(12), k(6), INK); box(g, k(196) + 1, -k(132) + 1, k(12) - 2, k(6) - 2, B[3]);
  g.fillStyle = INK; g.beginPath(); g.arc(k(214), -k(109), k(9) + 1, 0, Math.PI * 2); g.fill();
  g.fillStyle = Br[3]; g.beginPath(); g.arc(k(214), -k(109), k(9) - 1, 0, Math.PI * 2); g.fill();
  g.fillStyle = Br[5]; g.beginPath(); g.arc(k(214), -k(109), k(9) - 1, Math.PI, Math.PI * 1.5); g.lineTo(k(214), -k(109)); g.fill();
  g.fillStyle = '#E8DCA0'; g.beginPath(); g.arc(k(214), -k(109), k(6), 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FFF4C8'; g.beginPath(); g.arc(k(214) - 3, -k(109) - 3, k(3), 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FFFFFF'; g.fillRect(k(212) - 4, -k(112) - 2, 4, 4);
  box(g, k(200), -k(96), k(6), k(4), B[4]);
  // ---- the cylinder and its steam chest; the crosshead's guides back from it
  barrel(g, k(150), -k(44), k(40), k(18), B);
  box(g, k(152) - 1, -k(52) - 1, k(36) + 2, k(9) + 2, INK); box(g, k(152), -k(52), k(36), k(9), B[4]); box(g, k(152), -k(52), k(36), 2, B[6]);
  rivets(g, k(154), k(186), -k(50), B[6], 7);
  box(g, k(188), -k(44), k(4), k(18), Br[3]); box(g, k(188), -k(44), 2, k(18), Br[5]);
  for (const gy of [-k(38), -k(31)]) { box(g, k(98), gy - 1, k(54), 6, INK); box(g, k(98), gy, k(54), 2, S[5]); box(g, k(98), gy + 2, k(54), 2, S[3]); }
  // ---- the cab: varnished planks, red trim, the roof overhanging, the arched side window (dark inside), No. 7 in gold,
  //      the steps; its back end open (Tucker's: drawn live)
  box(g, -1, -k(125) - 1, k(66) + 2, k(106) + 2, INK); box(g, 0, -k(125), k(66), k(106), V[3]);
  for (let x = 0; x < k(66); x += 8) { box(g, x, -k(125), 1, k(106), V[2]); box(g, x + 1, -k(125), 2, k(106), V[4]); }
  box(g, 0, -k(125), k(66), 6, Rd[4]); box(g, 0, -k(125), k(66), 2, Rd[5]);
  box(g, 0, -k(46), k(66), k(4), INK); box(g, 0, -k(46) + 1, k(66), k(4) - 2, Rd[3]); box(g, 0, -k(46) + 1, k(66), 2, Rd[5]);
  box(g, 0, -k(24), k(66), k(4), Rd[2]); box(g, k(66) - 6, -k(125), 6, k(106), V[1]);
  g.fillStyle = INK; g.beginPath(); g.roundRect(k(14) - 2, -k(104) - 2, k(42) + 4, k(36) + 4, [36, 36, 0, 0]); g.fill();
  g.fillStyle = V[5]; g.beginPath(); g.roundRect(k(14), -k(104), k(42), k(36), [34, 34, 0, 0]); g.fill();
  g.fillStyle = '#140C08'; g.beginPath(); g.roundRect(k(16), -k(102), k(38), k(34), [30, 30, 0, 0]); g.fill();
  box(g, k(16), -k(102) + 40, k(38), 12, '#24160E'); box(g, k(34) - 1, -k(102), 3, k(34), V[2]);
  box(g, k(14), -k(70), k(42), 8, INK); box(g, k(14), -k(70) + 1, k(42), 5, V[5]); box(g, k(14), -k(70) + 1, k(42), 1, V[6]);
  signText(g, 'No. 7', k(35), -k(50), { sx: 2, sy: 2, fill: GOLD, shadow: V[0] });
  box(g, -k(8), -k(134), k(82), k(10), INK); box(g, -k(8) + 1, -k(134) + 1, k(82) - 2, k(10) - 2, B[3]); box(g, -k(8) + 1, -k(134) + 1, k(82) - 2, 3, B[5]); box(g, -k(8) + 1, -k(127), k(82) - 2, 3, B[1]);
  for (const sy of [-k(18), -k(10)]) { box(g, k(2), sy, k(14), 7, INK); box(g, k(3), sy + 1, k(12), 4, B[5]); }
  // ---- the cowcatcher: red slats in a wedge on its frame, its point at the rail; the coupler pocket
  g.fillStyle = INK; g.beginPath(); g.moveTo(k(196), -k(40)); g.lineTo(k(236), -k(1)); g.lineTo(k(196), -k(1)); g.closePath(); g.fill();
  g.fillStyle = Rd[2]; g.beginPath(); g.moveTo(k(197), -k(37)); g.lineTo(k(233), -k(2)); g.lineTo(k(197), -k(2)); g.closePath(); g.fill();
  for (let n = 0; n < 7; n++) { g.strokeStyle = Rd[5]; g.lineWidth = 4; g.beginPath(); g.moveTo(k(199) + n * 13, -k(2)); g.lineTo(k(199), -k(35) + n * 13); g.stroke(); g.strokeStyle = Rd[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(k(199) + n * 13 + 4, -k(2)); g.lineTo(k(199), -k(35) + n * 13 + 4); g.stroke(); }
  box(g, k(194), -k(42), k(8), k(4), B[4]);
  box(g, k(196) - 4, -k(40) - 2, 10, k(39), INK); box(g, k(196) - 3, -k(40) - 1, 8, k(39) - 2, Rd[3]);
};

const driverAt = (c: Ctx, x: number, y: number, r: number, roll: number, weight: boolean, n: number) => {
  const ph = (((Math.round((roll / (Math.PI * 2)) * n)) % n) + n) % n;
  stillAt(c, `tr-eng-wheel-${r}-${weight ? 1 : 0}-${ph}`, x, y, -r - 3, -r - 3, r * 2 + 6, r * 2 + 6, g => wheel(g, 0, 0, r, (ph / n) * Math.PI * 2, weight));
};

/** The engine at (x, rail y): its body (still), the wheels going round and the rods with them, the smoke out of the stack
 *  (thick and streaming back when it's going), the steam off the whistle (stuck on). */
export const drawMachine = (c: Ctx, x: number, y: number, f: number, roll: number, going: boolean, stuck: boolean) => {
  // (the smoke, behind it all, streaming back over the train)
  for (let n = 0; n < (going ? 10 : 3); n++) {
    const t = (f * (going ? 0.045 : 0.015) + n / (going ? 10 : 3)) % 1, r = 16 + t * 40;
    const sx = x + ENG.stack.x - t * (going ? 700 : 30), sy = y + ENG.stack.y - 10 - t * (going ? 60 : 140);
    puff(c, sx, sy, r, [mix('#2A2A30', '#8A8A92', t), mix('#44444C', '#B8B8C0', t), mix('#5E5E68', '#E4E4EA', t)], 0.8 * (1 - t));
  }
  stillAt(c, 'tr-engine', x, y, -k(10), -k(150) - 6, k(250), k(150) + 8, paintEngine);
  // (the drivers, the pilot truck's wheels; the rods: the side rod coupling the drivers, the main rod from the
  // crosshead to the back driver's crank)
  const [d0, d1] = ENG.drivers, dr = ENG.dr, pr = ENG.pr;
  for (const wx of [d0, d1]) driverAt(c, x + wx, y - dr, dr, roll, true, 24);
  for (const wx of ENG.pilots) driverAt(c, x + wx, y - pr, pr, roll * (dr / pr), false, 16);
  const cr = dr * 0.5, rx = Math.cos(roll) * cr, ry = Math.sin(roll) * cr, S = N(STEEL);
  const rod = (x0: number, y0: number, x1: number, y1: number, w: number) => {
    c.strokeStyle = INK; c.lineWidth = w + 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    c.strokeStyle = S[4]; c.lineWidth = w; c.stroke();
    c.strokeStyle = S[6]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0, y0 - w / 2 + 1); c.lineTo(x1, y1 - w / 2 + 1); c.stroke();
    c.lineCap = 'butt';
  };
  rod(x + d0 + rx, y - dr + ry, x + d1 + rx, y - dr + ry, 9);
  const xh = x + k(126) + rx * 0.9;
  rod(x + d0 + rx, y - dr + ry, xh, y - k(34), 9);
  box(c, xh - 12, y - k(38) - 1, 24, 20, INK); box(c, xh - 11, y - k(38), 22, 18, S[3]); box(c, xh - 11, y - k(38), 22, 2, S[6]); box(c, xh + 8, y - k(38), 3, 18, S[1]);
  box(c, xh + 12, y - k(35), x + k(150) - xh - 12, 5, INK); box(c, xh + 12, y - k(35) + 1, x + k(150) - xh - 12, 3, S[5]);
  for (const wx of [x + d0 + rx, x + d1 + rx]) { box(c, wx - 5, y - dr + ry - 5, 10, 10, INK); box(c, wx - 4, y - dr + ry - 4, 8, 8, BRASS[3]); box(c, wx - 3, y - dr + ry - 3, 3, 3, BRASS[5]); }
  // (the headlamp's flame flickering)
  if (f % 8 < 4) box(c, x + ENG.lamp.x - 2, y + ENG.lamp.y - 2, 4, 4, '#FFFFFF');
  // (the whistle's steam, stuck on)
  if (stuck) for (let n = 0; n < 5; n++) { const t = ((f * 0.08 + n / 5) % 1); puff(c, x + ENG.whistle.x + 4 - t * 30, y + ENG.whistle.y - 10 - t * 70, 6 + t * 16, ['#C8CCD4', '#E8ECF2', '#FFFFFF'], 0.8 * (1 - t)); }
};

/** The cab's open back (local to the cab's back end, world y): the dark inside, the firebox's glow at its foot, the
 *  varnished posts round it. Behind Tucker. */
export const drawCabBack = (c: Ctx, x: number, top: number, sill: number, f: number) => {
  const V = N(VARNISH);
  box(c, x - 4, top - 1, 42, sill - top + 2, INK);
  for (let i = 0; i < 5; i++) box(c, x - 3, top + ((sill - top) * i) / 5, 40, (sill - top) / 5 + 1, mix('#2A1A10', '#120A06', i / 5));
  const glow = 0.5 + 0.2 * Math.sin(f * 0.3);
  c.globalAlpha = glow; box(c, x + 6, sill - 40, 26, 40, '#7A2A0A'); box(c, x + 10, sill - 26, 18, 26, '#C8501A'); c.globalAlpha = 1;
  box(c, x - 3, top, 40, 4, V[5]); box(c, x - 3, top + 4, 40, 2, V[2]);
  box(c, x + 32, top, 6, sill - top, V[1]);
};

/** OUT OF SERVICE hung on the cab (after the crash: the train stood at the end of the line). */
export const drawOutOfService = (c: Ctx, x: number, y: number) => stillAt(c, 'tr-oos', x, y, -2, -2, 114, 40, g => {
  box(g, 20, -2, 2, 6, INK); box(g, 88, -2, 2, 6, INK);
  box(g, -1, 3, 112, 34, INK); box(g, 0, 4, 110, 32, '#F2E8CC'); box(g, 0, 4, 110, 2, '#FFFFFF'); box(g, 0, 34, 110, 2, '#C8B890');
  box(g, 3, 7, 104, 26, '#B91C1C'); box(g, 4, 8, 102, 24, '#F2E8CC');
  signText(g, 'OUT OF', 55, 18, painted1('#7F1D1D'));
  signText(g, 'SERVICE', 55, 30, painted1('#7F1D1D'));
});
const painted1 = (col: string) => ({ sx: 1, sy: 1, fill: col, shadow: '#C8B890' });

/** The buffer stop (heavy timbers bolted up, the red-and-white striped beam, its lamp) and SAWDUST GULCH's station front
 *  behind it (a plywood false front on its 2x4 bracing, board and batten painted on, the burned name board, END OF
 *  LINE in red), world: its face at x0, the ground at gy. */
export const drawBumperArt = (c: Ctx, x0: number, gy: number) => {
  c.save(); c.translate(x0, gy); c.scale(1.5, 1.5);
  still(c, 'tr-bumper', -12, -300, 340, 304, g => {
    const P = N(['#2A1608', '#44260E', '#603818', '#7E4E24', '#9C6834', '#BA8448', '#D8A464']), S = N(STEEL);
    // (the false front's bracing showing past its edge)
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(300, -200); g.lineTo(330, 0); g.moveTo(300, -100); g.lineTo(320, 0); g.stroke(); g.strokeStyle = P[2]; g.lineWidth = 4; g.stroke();
    box(g, 39, -261, 262, 261, INK);
    box(g, 40, -260, 260, 260, P[4]);
    for (let x = 40; x < 300; x += 16) { box(g, x, -260, 3, 260, P[5]); box(g, x + 3, -260, 1, 260, P[2]); }
    box(g, 40, -260, 260, 6, P[6]); box(g, 296, -260, 4, 260, P[1]); box(g, 40, -14, 260, 14, P[2]); checker(g, 40, -18, 260, 4, P[3], 0);
    // (the stepped parapet up top)
    box(g, 100, -282, 140, 24, INK); box(g, 101, -281, 138, 22, P[4]); box(g, 101, -281, 138, 3, P[6]);
    // (the name board, burned in)
    box(g, 59, -241, 222, 42, INK); box(g, 60, -240, 220, 40, P[5]); box(g, 60, -240, 220, 2, P[6]); box(g, 60, -202, 220, 2, P[2]);
    for (let gy2 = -236; gy2 < -204; gy2 += 4) box(g, 64 + ((gy2 * 7) % 13), gy2, 80, 1, P[3]);
    signText(g, 'SAWDUST GULCH', 170, -212, { sx: 2, sy: 2, fill: ['#140A04', '#2A1608', '#2A1608', '#4A2A12'], dither: true, lip: '#E8C890' });
    // (the windows painted on (it's a flat), the door)
    for (const wx of [70, 230]) { box(g, wx - 1, -171, 42, 52, INK); box(g, wx, -170, 40, 50, '#2A3A48'); box(g, wx, -170, 40, 14, '#5A7A94'); box(g, wx + 19, -170, 2, 50, P[3]); box(g, wx, -146, 40, 2, P[3]); }
    box(g, 149, -121, 42, 107, INK); box(g, 150, -120, 40, 106, P[2]); for (let x = 152; x < 190; x += 8) box(g, x, -120, 1, 106, P[1]);
    box(g, 109, -151, 122, 28, INK); box(g, 110, -150, 120, 26, '#7F1D1D'); box(g, 110, -150, 120, 2, '#B83A2A');
    signText(g, 'END OF LINE', 170, -131, { sx: 1, sy: 1, fill: '#FDE047', shadow: '#1C1209' });
    // (the bumper: heavy timbers, bolted, the striped beam the engine's going into, a red lamp on it)
    box(g, -1, -71, 42, 71, INK); box(g, 0, -70, 40, 70, P[2]); box(g, 0, -70, 6, 70, P[4]); box(g, 34, -70, 6, 70, P[1]);
    for (let k2 = 0; k2 < 4; k2++) { box(g, 0, -64 + k2 * 14, 40, 7, k2 % 2 ? '#F2F0EA' : '#C81E1E'); box(g, 0, -64 + k2 * 14, 40, 1, k2 % 2 ? '#FFFFFF' : '#E85A4A'); }
    for (const by of [-60, -20]) for (const bx of [6, 30]) { box(g, bx, by, 4, 4, INK); box(g, bx, by, 2, 2, S[5]); }
    box(g, 12, -86, 16, 16, INK); box(g, 13, -85, 14, 14, S[3]); box(g, 15, -82, 10, 8, '#E8262A'); box(g, 15, -82, 3, 3, '#FF9A8A');
  });
  c.restore();
};
const signTextRef = signText; void signTextRef; void IRON;
