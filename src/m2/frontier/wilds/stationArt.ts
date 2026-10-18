// LONESOME PINE STATION, drawn (the final pass: peak SNES): the park's 1800s whistle stop. Behind: the water tower on
// its timber legs (the hooped tank, its spout swung up); Tucker's train (a proper American 4-4-0: the cowcatcher's
// slats, the oil headlamp, the diamond stack, the smokebox, the boiler in Russia iron with its brass bands, the sand and
// steam domes and the bell between them, the cylinder and its steam chest, the crosshead on its guides, the two big
// spoked drivers with their counterweights, the side and main rods going round, the pilot truck; the varnished cab with
// its arched windows and number; the tender heaped with cordwood; the coach with its clerestory and gold lettering; the
// red caboose with its cupola and marker lamps); the depot (board and batten, a shake roof, its side going back, the
// ticket window CLOSED, the lantern); in front, the plank platform (its top going back, the fascia, the lit lip:
// standable), the gate with its bell, the DEPARTURES board.
//
// The train's still art (each car's body) is painted once for the hour (a stamp) and slid along as it pulls out; the
// wheels and the rods go round live.

import { signText } from '../../signLetters';
import { burned, painted } from '../kit';
import { drawTucker, type TuckerPose } from '../tucker';
import { type Ctx, type View, box, checker, mix, at, poly, still, near, INK, PLANK, STEEL } from './paint';
import { STATION, Y } from './layout';

/** What the train's drawing needs of the scene. */
export interface TrainLook { trainX: number; inCab: boolean; pose: TuckerPose; talking: boolean; step: string; t: number }

const RED = ['#3A0A0C', '#5E1216', '#821C20', '#A3262A', '#C2403A', '#DC6450', '#F09070'];
const MAROON = ['#200A10', '#341018', '#4A1822', '#5E2230', '#7A3242', '#98485A', '#B86478'];
const IRON = ['#0E1218', '#1A2028', '#28303C', '#384452', '#4C5A6C', '#667688', '#90A0B2'];
const BLACK = ['#08080A', '#121216', '#1C1C22', '#26262E', '#363642', '#4A4A58', '#6A6A7A'];
const BRASS = ['#3A2408', '#6A4410', '#9A6A1C', '#C8962E', '#E8C25A', '#FFF0A8'];
const VARNISH = ['#1E0E06', '#3A1C0C', '#5A3016', '#7A4620', '#9A5E2E', '#BA7A40', '#D89A5A'];
const GOLD = '#F2C84A';

/** A spoked wheel: the tire (steel, lit along its top), the red center, spokes turned by `a`, a counterweight (a
 *  crescent between the spokes, on drivers), the brass hub. */
const wheel = (c: Ctx, x: number, y: number, r: number, a: number, weight = false) => {
  const S = near(STEEL), Rd = near(RED);
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 1.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = S[3]; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = S[5]; c.beginPath(); c.arc(x, y, r, Math.PI * 1.1, Math.PI * 1.7); c.lineTo(x, y); c.closePath(); c.fill();
  c.fillStyle = Rd[1]; c.beginPath(); c.arc(x, y, r - 3, 0, Math.PI * 2); c.fill();
  if (weight) { c.fillStyle = Rd[3]; c.beginPath(); c.arc(x, y, r - 4, a + Math.PI - 0.7, a + Math.PI + 0.7); c.lineTo(x, y); c.closePath(); c.fill(); }
  c.strokeStyle = Rd[4]; c.lineWidth = r > 15 ? 2.4 : 1.6;
  const n = r > 15 ? 12 : 8;
  for (let k = 0; k < n; k++) { const t = a + (k * Math.PI * 2) / n; c.beginPath(); c.moveTo(x + Math.cos(t) * 3, y + Math.sin(t) * 3); c.lineTo(x + Math.cos(t) * (r - 3), y + Math.sin(t) * (r - 3)); c.stroke(); }
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, 4, 0, Math.PI * 2); c.fill();
  c.fillStyle = BRASS[3]; c.beginPath(); c.arc(x, y, 3, 0, Math.PI * 2); c.fill();
  c.fillStyle = BRASS[5]; c.fillRect(x - 2, y - 2, 1.4, 1.4);
};
/** A banded cylinder lying along x (a boiler, a cylinder): lit along its top, shaded under, dithered between. */
const barrel = (g: Ctx, x: number, y: number, w: number, h: number, Rm: string[]) => {
  box(g, x - 1, y - 1, w + 2, h + 2, INK);
  const bands: [number, string][] = [[0.1, Rm[4]], [0.12, Rm[5]], [0.22, Rm[4]], [0.26, Rm[3]], [0.18, Rm[2]], [0.12, Rm[1]]];
  let yy = y;
  for (const [k, col] of bands) { box(g, x, yy, w, h * k + 1, col); yy += h * k; }
  checker(g, x, y + h * 0.44, w, 2, Rm[4], 0); checker(g, x, y + h * 0.7, w, 2, Rm[3], 1);
};
/** A row of rivets along y. */
const rivets = (g: Ctx, x0: number, x1: number, y: number, col: string, step = 6) => { for (let x = x0; x < x1; x += step) { g.fillStyle = INK; g.fillRect(x, y, 2, 2); g.fillStyle = col; g.fillRect(x, y, 1, 1); } };
/** A truck (a car's): its frame and two wheels. */
const truck = (c: Ctx, x: number, y: number, roll: number) => {
  const S = near(STEEL);
  box(c, x - 18, y - 16, 36, 6, INK); box(c, x - 17, y - 15, 34, 4, S[2]); box(c, x - 17, y - 15, 34, 1, S[4]);
  wheel(c, x - 11, y - 9, 9, roll); wheel(c, x + 11, y - 9, 9, roll);
  box(c, x - 3, y - 14, 6, 8, S[1]);
};

// ---------------------------------------------------------------------------------------------------------------
// The cars' bodies (stamped)

/** The caboose (170 wide, its back end at 0): red planks, the cupola with its windows, the end platforms and their
 *  rails, the marker lamp, gold lettering. */
const paintCaboose = (g: Ctx) => {
  const Rd = near(RED), B = near(BLACK), V = near(VARNISH);
  // (the end platforms, their rails and steps)
  for (const px of [-12, 164]) { box(g, px, -42, 18, 5, INK); box(g, px + 1, -41, 16, 3, V[3]); box(g, px + 1, -41, 16, 1, V[5]); for (let k = 0; k < 4; k++) box(g, px + 2 + k * 4, -68, 2, 26, B[4]); box(g, px, -70, 18, 3, B[5]); }
  // (the body: vertical planks, lit down the left, the frame under)
  box(g, 2, -93, 166, 78, INK); box(g, 3, -92, 164, 76, Rd[3]);
  for (let x = 3; x < 167; x += 6) { box(g, x, -92, 1, 76, Rd[2]); box(g, x + 1, -92, 1, 76, Rd[4]); }
  box(g, 3, -92, 164, 3, Rd[5]); box(g, 3, -20, 164, 4, Rd[1]); checker(g, 3, -24, 164, 4, Rd[2], 0);
  box(g, -2, -97, 174, 6, INK); box(g, -1, -96, 172, 4, B[3]); box(g, -1, -96, 172, 1, B[5]);
  // (the windows: lit glass by day, warm after dark (the caller's light does the rest)), trimmed in gold
  for (const wx of [22, 72, 124]) { box(g, wx - 2, -78, 28, 24, INK); box(g, wx - 1, -77, 26, 22, V[4]); box(g, wx + 1, -75, 22, 18, '#2A3A48'); box(g, wx + 1, -75, 22, 6, '#5A7A94'); box(g, wx + 1, -75, 6, 18, '#7A9AB4'); box(g, wx + 12, -75, 1, 18, V[2]); }
  // (the cupola up top)
  box(g, 58, -121, 60, 30, INK); box(g, 59, -120, 58, 28, Rd[3]); box(g, 59, -120, 58, 2, Rd[5]); box(g, 112, -120, 5, 28, Rd[2]);
  for (const wx of [64, 90]) { box(g, wx, -114, 20, 13, INK); box(g, wx + 1, -113, 18, 11, '#5A7A94'); box(g, wx + 1, -113, 6, 11, '#8AAAC4'); }
  box(g, 54, -126, 68, 6, INK); box(g, 55, -125, 66, 4, B[3]); box(g, 55, -125, 66, 1, B[5]);
  // (the lettering, gold, shadowed)
  signText(g, 'W.L.R.R.', 85, -26, { sx: 1, sy: 1, fill: GOLD, shadow: Rd[0] });
  // (the marker lamp at the back: red lens, brass)
  box(g, -10, -86, 10, 14, INK); box(g, -9, -85, 8, 12, BRASS[3]); box(g, -8, -82, 6, 6, '#E8262A'); box(g, -8, -82, 2, 2, '#FF9A8A');
};

/** The coach (200 wide): maroon, gold pinstripes, a row of arched windows, the clerestory roof, its name. */
const paintCoach = (g: Ctx) => {
  const M = near(MAROON), B = near(BLACK);
  for (const px of [-10, 198]) { box(g, px, -40, 12, 4, INK); box(g, px + 1, -39, 10, 2, B[4]); for (let k = 0; k < 3; k++) box(g, px + 1 + k * 4, -62, 2, 22, B[4]); }
  box(g, -1, -97, 202, 82, INK); box(g, 0, -96, 200, 80, M[3]);
  box(g, 0, -96, 200, 3, M[5]); box(g, 0, -96, 3, 80, M[4]); box(g, 195, -96, 5, 80, M[2]);
  box(g, 0, -22, 200, 6, M[1]); checker(g, 0, -26, 200, 4, M[2], 0);
  // (gold pinstripes over and under the windows)
  box(g, 4, -86, 192, 1, GOLD); box(g, 4, -52, 192, 1, GOLD); box(g, 4, -30, 192, 1, BRASS[3]);
  // (the arched windows: lit glass, the sash, a curtain tied back)
  for (let k = 0; k < 6; k++) {
    const wx = 12 + k * 30;
    g.fillStyle = INK; g.beginPath(); g.roundRect(wx - 1, -83, 22, 28, [10, 10, 0, 0]); g.fill();
    g.fillStyle = '#2A3A48'; g.beginPath(); g.roundRect(wx, -82, 20, 26, [9, 9, 0, 0]); g.fill();
    box(g, wx, -76, 20, 6, '#5A7A94'); box(g, wx, -82, 5, 26, '#7A9AB4');
    box(g, wx, -68, 20, 2, M[2]); box(g, wx + 14, -80, 5, 22, '#C8A040'); box(g, wx + 14, -80, 1, 22, '#F2D27A');
  }
  // (the clerestory: the roof, a raised deck down its middle with little windows, its eaves)
  box(g, -6, -103, 212, 8, INK); box(g, -5, -102, 210, 6, B[3]); box(g, -5, -102, 210, 1, B[5]);
  box(g, 20, -112, 160, 10, INK); box(g, 21, -111, 158, 8, M[2]);
  for (let x = 28; x < 172; x += 14) { box(g, x, -109, 8, 4, '#7A9AB4'); }
  box(g, 16, -115, 168, 4, INK); box(g, 17, -114, 166, 2, B[4]);
  signText(g, 'WILDERNESS LAND R.R.', 100, -37, { sx: 1, sy: 1, fill: GOLD, shadow: M[0] });
};

/** The tender (96 wide): the tank in black with its brass trim and lettering, heaped with split cordwood. */
const paintTender = (g: Ctx) => {
  const B = near(BLACK), V = near(VARNISH);
  // (the cordwood heaped in it: split logs, their ends pale, bark dark)
  for (let r = 0; r < 3; r++) for (let k = 0; k < 7 - r; k++) {
    const lx = 4 + k * 13 + r * 6, ly = -78 - r * 8;
    box(g, lx - 1, ly - 1, 14, 10, INK); box(g, lx, ly, 12, 8, V[3 + ((k + r) % 2)]); box(g, lx, ly, 12, 2, V[5]);
    g.fillStyle = V[6]; g.beginPath(); g.ellipse(lx + 2, ly + 4, 2, 3.4, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = V[4]; g.fillRect(lx + 1, ly + 3, 2, 1);
  }
  box(g, -1, -71, 98, 58, INK); box(g, 0, -70, 96, 56, B[3]);
  box(g, 0, -70, 96, 3, B[5]); box(g, 0, -70, 3, 56, B[4]); box(g, 92, -70, 4, 56, B[1]);
  box(g, 0, -66, 96, 2, BRASS[3]); box(g, 0, -66, 96, 1, BRASS[5]); box(g, 0, -18, 96, 2, BRASS[2]);
  rivets(g, 4, 92, -62, B[6]); rivets(g, 4, 92, -22, B[6]);
  signText(g, 'W.L.R.R.', 48, -36, { sx: 1, sy: 1, fill: GOLD, shadow: B[0] });
};

/** The engine's still parts (its cab at 0, the pilot's nose at 234): the cab, the boiler and smokebox, the domes and
 *  the bell, the stack, the headlamp, the cylinder, the running board, the cowcatcher. The rods and wheels go live. */
const paintEngine = (g: Ctx) => {
  const Rd = near(RED), I = near(IRON), B = near(BLACK), V = near(VARNISH);
  // ---- the boiler: Russia iron, banded in brass, the running board and its handrail along it
  barrel(g, 64, -92, 104, 48, I);
  for (const bx of [82, 116, 150]) { box(g, bx - 1, -93, 6, 50, INK); box(g, bx, -92, 4, 48, BRASS[3]); box(g, bx, -92, 1, 48, BRASS[5]); box(g, bx + 3, -92, 1, 48, BRASS[1]); }
  box(g, 66, -80, 120, 2, INK); box(g, 66, -81, 120, 1, BRASS[4]);
  for (let x = 72; x < 184; x += 18) box(g, x, -82, 2, 4, BRASS[2]);
  box(g, 62, -46, 128, 5, INK); box(g, 63, -45, 126, 3, B[4]); box(g, 63, -45, 126, 1, B[6]);
  // ---- the smokebox at the front: black, its door's rim, rivets; the number plate
  barrel(g, 168, -96, 30, 54, B);
  box(g, 196, -94, 4, 50, B[4]); box(g, 196, -94, 1, 50, B[6]);
  rivets(g, 172, 196, -90, B[6], 5); rivets(g, 172, 196, -48, B[6], 5);
  g.fillStyle = INK; g.beginPath(); g.arc(184, -70, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = BRASS[3]; g.beginPath(); g.arc(184, -70, 7, 0, Math.PI * 2); g.fill();
  signText(g, '7', 184, -66, { sx: 1, sy: 1, fill: Rd[1] });
  // ---- the domes: the sand dome, the bell in its yoke between, the steam dome (brass), the whistle by the cab
  const dome = (x: number, w: number, h: number, R: string[]) => {
    g.fillStyle = INK; g.beginPath(); g.moveTo(x - w / 2 - 3, -90); g.quadraticCurveTo(x - w / 2, -90 - h * 0.4, x - w / 2 + 2, -90 - h); g.lineTo(x + w / 2 - 2, -90 - h); g.quadraticCurveTo(x + w / 2, -90 - h * 0.4, x + w / 2 + 3, -90); g.closePath(); g.fill();
    g.fillStyle = R[3]; g.beginPath(); g.moveTo(x - w / 2 - 1, -91); g.quadraticCurveTo(x - w / 2 + 1, -90 - h * 0.4, x - w / 2 + 3, -89 - h); g.lineTo(x + w / 2 - 3, -89 - h); g.quadraticCurveTo(x + w / 2 - 1, -90 - h * 0.4, x + w / 2 + 1, -91); g.closePath(); g.fill();
    box(g, x - w / 2 + 2, -88 - h, 3, h - 2, R[5]); box(g, x + w / 2 - 5, -88 - h, 3, h - 2, R[1]);
    box(g, x - w / 2, -92 - h, w, 4, INK); box(g, x - w / 2 + 1, -91 - h, w - 2, 2, R[4]);
  };
  dome(140, 18, 16, BRASS);
  dome(104, 20, 22, BRASS);
  // (the bell in its yoke)
  box(g, 117, -112, 2, 16, B[4]); box(g, 127, -112, 2, 16, B[4]); box(g, 116, -114, 14, 3, B[5]);
  g.fillStyle = INK; g.beginPath(); g.moveTo(116, -96); g.lineTo(119, -110); g.lineTo(127, -110); g.lineTo(130, -96); g.closePath(); g.fill();
  g.fillStyle = BRASS[3]; g.beginPath(); g.moveTo(117.5, -97); g.lineTo(120, -109); g.lineTo(126, -109); g.lineTo(128.5, -97); g.closePath(); g.fill();
  box(g, 119, -108, 2, 10, BRASS[5]); box(g, 116, -98, 14, 2, BRASS[2]);
  // (the whistle on the steam dome, the safety valves)
  box(g, 96, -122, 4, 10, INK); box(g, 97, -121, 2, 9, BRASS[4]); box(g, 95, -124, 6, 3, BRASS[3]);
  // ---- the diamond stack: the flared spark arrester up top, the taper down onto the smokebox, banded
  g.fillStyle = INK; g.beginPath(); g.moveTo(176, -95); g.lineTo(178, -116); g.lineTo(166, -132); g.lineTo(166, -142); g.lineTo(198, -142); g.lineTo(198, -132); g.lineTo(186, -116); g.lineTo(188, -95); g.closePath(); g.fill();
  g.fillStyle = B[3]; g.beginPath(); g.moveTo(178, -96); g.lineTo(180, -116); g.lineTo(168, -131); g.lineTo(168, -140); g.lineTo(196, -140); g.lineTo(196, -131); g.lineTo(184, -116); g.lineTo(186, -96); g.closePath(); g.fill();
  box(g, 169, -139, 5, 8, B[5]); box(g, 179, -114, 2, 18, B[5]); box(g, 190, -139, 5, 8, B[1]);
  box(g, 166, -144, 32, 4, INK); box(g, 167, -143, 30, 2, BRASS[3]); box(g, 167, -143, 30, 1, BRASS[5]);
  box(g, 176, -118, 12, 3, BRASS[2]);
  // ---- the headlamp: a big box lamp on its bracket over the smokebox, brass trim, the lens (lit live after dark)
  box(g, 190, -122, 30, 26, INK); box(g, 191, -121, 28, 24, V[3]); box(g, 191, -121, 28, 2, V[5]); box(g, 191, -121, 2, 24, V[4]);
  box(g, 188, -126, 34, 5, INK); box(g, 189, -125, 32, 3, B[4]);
  g.fillStyle = INK; g.beginPath(); g.arc(214, -109, 9, 0, Math.PI * 2); g.fill();
  g.fillStyle = BRASS[3]; g.beginPath(); g.arc(214, -109, 8, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#E8DCA0'; g.beginPath(); g.arc(214, -109, 6, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FFF8D8'; g.fillRect(211, -112, 3, 3);
  box(g, 200, -96, 6, 4, B[4]);
  // ---- the cylinder and its steam chest, down by the pilot wheels; the crosshead guides back from it
  barrel(g, 150, -44, 40, 18, B);
  box(g, 152, -52, 36, 9, INK); box(g, 153, -51, 34, 7, B[4]); box(g, 153, -51, 34, 1, B[6]);
  box(g, 188, -44, 4, 18, BRASS[3]); box(g, 188, -44, 1, 18, BRASS[5]);
  box(g, 98, -38, 54, 3, INK); box(g, 98, -37, 54, 1, near(STEEL)[5]); box(g, 98, -31, 54, 3, INK); box(g, 98, -30, 54, 1, near(STEEL)[5]);
  // ---- the cab: varnished planks, red trim, its roof overhanging, the arched window (Tucker's: dark inside), the
  //      number under it; the steps
  box(g, -1, -125, 68, 106, INK); box(g, 0, -124, 66, 104, V[3]);
  for (let x = 0; x < 66; x += 5) { box(g, x, -124, 1, 104, V[2]); box(g, x + 1, -124, 1, 104, V[4]); }
  box(g, 0, -124, 66, 3, Rd[4]); box(g, 0, -46, 66, 4, Rd[3]); box(g, 0, -46, 66, 1, Rd[5]); box(g, 0, -24, 66, 4, Rd[2]);
  g.fillStyle = INK; g.beginPath(); g.roundRect(14, -104, 42, 36, [14, 14, 0, 0]); g.fill();
  g.fillStyle = '#140C08'; g.beginPath(); g.roundRect(16, -102, 38, 34, [12, 12, 0, 0]); g.fill();
  box(g, 14, -70, 42, 4, V[5]); box(g, 14, -70, 42, 1, V[6]);
  signText(g, 'No. 7', 33, -50, { sx: 1, sy: 1, fill: GOLD, shadow: V[0] });
  box(g, -8, -134, 82, 10, INK); box(g, -7, -133, 80, 8, B[3]); box(g, -7, -133, 80, 2, B[5]); box(g, -7, -127, 80, 2, B[1]);
  for (const sy of [-18, -10]) { box(g, 2, sy, 14, 3, INK); box(g, 3, sy, 12, 2, B[5]); }
  // ---- the cowcatcher: red slats in a wedge on its frame, its point at the rail
  g.fillStyle = INK; g.beginPath(); g.moveTo(196, -40); g.lineTo(236, -2); g.lineTo(196, -2); g.closePath(); g.fill();
  g.fillStyle = Rd[2]; g.beginPath(); g.moveTo(198, -36); g.lineTo(232, -4); g.lineTo(198, -4); g.closePath(); g.fill();
  for (let k = 0; k < 6; k++) { g.strokeStyle = Rd[5]; g.lineWidth = 2; g.beginPath(); g.moveTo(199 + k * 6, -5); g.lineTo(199, -34 + k * 6); g.stroke(); g.strokeStyle = Rd[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(201 + k * 6, -5); g.lineTo(201, -33 + k * 6); g.stroke(); }
  box(g, 194, -42, 8, 4, B[4]);
};

// ---------------------------------------------------------------------------------------------------------------

/** The train, its back end (the caboose's) at STATION.caboose, its rails at y; how far it's pulled out (`trainX`)
 *  turning the wheels and the rods. Tucker in its cab once he's aboard. */
export const drawTrain = (c: Ctx, s: TrainLook, f: number) => {
  const dx = s.trainX, y = Y(STATION.deck.h) + 40, roll = dx / 16;
  const cb = STATION.caboose + dx, co = cb + 180, te = co + 210, en = te + 104;
  // (the couplers between the cars: link and pin)
  for (const [x0, x1] of [[cb + 170, co], [co + 200, te], [te + 96, en]]) { box(c, x0 - 2, y - 32, x1 - x0 + 4, 5, INK); box(c, x0 - 1, y - 31, x1 - x0 + 2, 3, near(STEEL)[3]); }
  // ---- the cars (stamped bodies), their trucks going round
  still(c, 'caboose', cb, y, -16, -130, 206, 132, paintCaboose);
  truck(c, cb + 30, y, roll); truck(c, cb + 140, y, roll);
  still(c, 'coach', co, y, -14, -120, 228, 122, paintCoach);
  truck(c, co + 36, y, roll); truck(c, co + 164, y, roll);
  still(c, 'tender', te, y, -4, -104, 104, 106, paintTender);
  truck(c, te + 24, y, roll); truck(c, te + 72, y, roll);
  // ---- the engine
  const cab = en, front = en + 200;
  still(c, 'engine', en, y, -10, -150, 250, 152, paintEngine);
  // (the cab window: Tucker leaning out of it once he's aboard, from the sill up; the whistle cord)
  if (s.inCab) {
    if (s.pose === 'whistle') { c.strokeStyle = '#D6D3D1'; c.lineWidth = 1; c.beginPath(); c.moveTo(cab + 47, y - 124); c.lineTo(cab + 47, y - 122 + Math.max(0, Math.sin(f * 0.2)) * 6); c.stroke(); }
    c.save(); c.beginPath(); c.rect(cab - 30, y - 220, 140, 150); c.clip();
    drawTucker(c, cab + 38, y - 26, 1, f, s.pose, { talking: s.talking });
    c.restore();
    box(c, cab + 14, y - 70, 42, 4, near(VARNISH)[5]); box(c, cab + 14, y - 70, 42, 1, near(VARNISH)[6]);
  }
  // (the drivers, the pilot truck's wheels; the rods going round with them: the side rod coupling the drivers, the
  // main rod from the crosshead to the back driver's crank)
  for (const wx of [cab + 40, cab + 96]) wheel(c, wx, y - 22, 22, roll, true);
  wheel(c, cab + 160, y - 12, 11, roll); wheel(c, cab + 186, y - 12, 11, roll);
  const rx = Math.cos(roll) * 11, ry = Math.sin(roll) * 11, S = near(STEEL);
  const rod = (x0: number, y0: number, x1: number, y1: number, w: number) => { c.strokeStyle = INK; c.lineWidth = w + 2; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.strokeStyle = S[4]; c.lineWidth = w; c.stroke(); c.strokeStyle = S[6]; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y0 - w / 2 + 0.5); c.lineTo(x1, y1 - w / 2 + 0.5); c.stroke(); };
  rod(cab + 40 + rx, y - 22 + ry, cab + 96 + rx, y - 22 + ry, 4);
  const xh = cab + 126 + rx * 0.9;
  rod(cab + 40 + rx, y - 22 + ry, xh, y - 34, 4);
  box(c, xh - 5, y - 38, 10, 9, INK); box(c, xh - 4, y - 37, 8, 7, S[3]); box(c, xh - 4, y - 37, 8, 1, S[6]);
  box(c, xh + 4, y - 35, cab + 150 - xh - 4, 2, S[5]);
  for (const wx of [cab + 40 + rx, cab + 96 + rx]) { box(c, wx - 2, y - 24 + ry, 4, 4, INK); box(c, wx - 1, y - 23 + ry, 2, 2, BRASS[4]); }
  // (the headlamp's glow, soft, after dark is the stage's light; its flame flickers here)
  if (f % 8 < 4) box(c, front + 12, y - 111, 2, 2, '#FFFFFF');
  // ---- the smoke out of the stack (thick and fast when it goes, stepped puffs), the steam off the whistle
  const going = s.step === 'leave' || s.step === 'chase';
  for (let k = 0; k < (going ? 9 : 3); k++) {
    const t = (f * (going ? 0.05 : 0.015) + k / (going ? 9 : 3)) % 1;
    const sx = cab + 182 - t * (going ? 130 : 22), sy = y - 152 - t * 90, r = 9 + t * 22;
    c.globalAlpha = 0.8 * (1 - t);
    c.fillStyle = mix('#3A3A42', '#B8B8C0', t); c.beginPath(); c.arc(sx, sy, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = mix('#5A5A64', '#E4E4EA', t); c.beginPath(); c.arc(sx - r * 0.3, sy - r * 0.3, r * 0.55, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
  }
  if (s.step === 'board' && s.t > 8 && s.t < 50) for (let k = 0; k < 4; k++) { c.globalAlpha = 0.65; c.fillStyle = '#F8FAFC'; c.beginPath(); c.arc(cab + 98 + k * 4, y - 128 - k * 10 - (s.t % 10), 6 + k * 3, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
};

// ---------------------------------------------------------------------------------------------------------------
// The depot, the tower, the platform

/** The water tower behind (timber legs braced, the tank in staves and iron hoops, its conical roof, the spout). */
const paintTower = (g: Ctx) => {
  const P = near(PLANK), B = near(BLACK), V = near(VARNISH);
  for (const lx of [-42, 32]) { box(g, lx - 1, -152, 10, 152, INK); box(g, lx, -151, 8, 151, P[2]); box(g, lx, -151, 2, 151, P[4]); }
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); for (let y = -146; y < -10; y += 36) { g.moveTo(-36, y); g.lineTo(34, y + 36); g.moveTo(34, y); g.lineTo(-36, y + 36); } g.stroke();
  g.strokeStyle = P[2]; g.lineWidth = 2; g.stroke();
  box(g, -52, -156, 104, 6, INK); box(g, -51, -155, 102, 4, P[3]); box(g, -51, -155, 102, 1, P[5]);
  // (the tank: staves, banded, iron hoops)
  box(g, -49, -233, 98, 80, INK); box(g, -48, -232, 96, 78, V[3]);
  for (let x = -48; x < 48; x += 8) { box(g, x, -232, 1, 78, V[2]); box(g, x + 1, -232, 2, 78, V[4]); }
  box(g, -48, -232, 10, 78, V[5]); box(g, 38, -232, 10, 78, V[1]);
  for (const hy of [-224, -200, -176, -160]) { box(g, -49, hy, 98, 3, INK); box(g, -48, hy, 96, 1, B[5]); }
  // (the roof: a cone of shakes)
  g.fillStyle = INK; g.beginPath(); g.moveTo(-56, -230); g.lineTo(0, -266); g.lineTo(56, -230); g.closePath(); g.fill();
  g.fillStyle = P[2]; g.beginPath(); g.moveTo(-52, -231); g.lineTo(0, -262); g.lineTo(52, -231); g.closePath(); g.fill();
  g.fillStyle = P[4]; g.beginPath(); g.moveTo(-52, -231); g.lineTo(0, -262); g.lineTo(-10, -231); g.closePath(); g.fill();
  for (let k = 1; k < 4; k++) box(g, -52 + k * 12, -231 - k * 7, 104 - k * 24, 1, P[1]);
  // (the spout, swung up, its chain)
  box(g, -60, -196, 14, 6, INK); box(g, -59, -195, 12, 4, B[4]);
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-52, -194); g.lineTo(-76, -214); g.stroke(); g.strokeStyle = B[4]; g.lineWidth = 4; g.stroke();
  for (let k = 0; k < 6; k++) box(g, -76 + k * 1, -210 + k * 6, 2, 3, B[5]);
};

/** The depot: board and batten in faded red ochre, its side going back (seen past whichever end he's looking at), a
 *  shake roof, the name board, the barred ticket window with CLOSED hung in it, the door, the lantern. */
const paintDepot = (g: Ctx) => {
  const P = near(PLANK), O = near(['#2A1208', '#46200E', '#663218', '#844624', '#A25E34', '#BE7A4A', '#DA9A66']), B = near(BLACK);
  // (the walls)
  box(g, -91, -151, 182, 151, INK); box(g, -90, -150, 180, 150, O[3]);
  for (let x = -90; x < 90; x += 12) { box(g, x, -150, 3, 150, O[4]); box(g, x + 3, -150, 1, 150, O[2]); }
  box(g, -90, -150, 4, 150, O[5]); box(g, 84, -150, 6, 150, O[1]);
  box(g, -90, -12, 180, 12, O[1]); checker(g, -90, -16, 180, 4, O[2], 0);
  // (the roof: a gable of cedar shakes in rows, each lit along its foot; the fascia)
  g.fillStyle = INK; g.beginPath(); g.moveTo(-108, -146); g.lineTo(0, -208); g.lineTo(108, -146); g.closePath(); g.fill();
  g.save(); g.beginPath(); g.moveTo(-104, -148); g.lineTo(0, -204); g.lineTo(104, -148); g.closePath(); g.clip();
  for (let r = 0; r < 9; r++) for (let x = -104 + (r % 2) * 5; x < 104; x += 10) { box(g, x, -152 - r * 6.4, 9, 6, P[2 + ((x + r * 3) & 1)]); box(g, x, -147 - r * 6.4, 9, 1, P[5]); box(g, x + 8, -152 - r * 6.4, 1, 6, P[1]); }
  g.restore();
  box(g, -108, -148, 216, 4, INK); box(g, -107, -147, 214, 2, P[4]);
  // (the name board)
  box(g, -87, -179, 174, 28, INK); box(g, -86, -178, 172, 26, P[4]); box(g, -86, -178, 172, 2, P[6]); box(g, -86, -154, 172, 2, P[2]);
  signText(g, 'LONESOME PINE STATION', 0, -160, burned(1, 3));
  // (the ticket window: its frame, the bars, CLOSED hung in it; the counter)
  box(g, -51, -111, 48, 42, INK); box(g, -50, -110, 46, 40, P[3]); box(g, -47, -107, 40, 34, '#1A100A');
  for (let k = 0; k < 5; k++) { box(g, -45 + k * 9, -107, 2, 34, B[5]); box(g, -45 + k * 9, -107, 1, 34, B[6]); }
  box(g, -44, -96, 34, 14, INK); box(g, -43, -95, 32, 12, '#F2E8CC');
  signText(g, 'CLOSED', -27, -86, painted(1, '#B91C1C', '#F2E8CC'));
  box(g, -54, -72, 54, 4, INK); box(g, -53, -71, 52, 2, P[5]);
  // (the door: planked, a brass knob, its frame)
  box(g, 19, -101, 42, 101, INK); box(g, 21, -99, 38, 99, P[2]);
  for (let x = 21; x < 59; x += 9) box(g, x, -99, 1, 99, P[1]);
  box(g, 21, -99, 38, 2, P[4]); box(g, 21, -50, 38, 3, P[3]); box(g, 50, -52, 4, 4, BRASS[4]);
  // (the lantern on its bracket by the window)
  box(g, -31, -102, 2, 10, B[4]); box(g, -36, -98, 12, 3, B[4]);
  box(g, -34, -95, 10, 13, INK); box(g, -33, -94, 8, 11, '#F2D27A'); box(g, -33, -94, 2, 11, '#FFF4C8'); box(g, -35, -97, 12, 3, B[5]); box(g, -34, -82, 10, 2, B[5]);
};

/** The depot's side going back (seen past its end he's looking at): board and batten, darker the further back. */
const depotSide = (c: Ctx, v: View) => {
  const dp = STATION.depot, deckY = Y(STATION.deck.h), eye = v.eye;
  for (const [e, side] of [[dp - 90, -1], [dp + 90, 1]] as const) {
    if ((eye.x - e) * side <= 1) continue;
    const O = near(['#46200E', '#663218', '#844624']);
    const pt = (k: number, y: number) => at(eye, e, y, 1 - 0.1 * k);
    for (let j = 0; j < 3; j++) poly(c, [pt(j / 3, deckY - 150), pt((j + 1) / 3, deckY - 150), pt((j + 1) / 3, deckY), pt(j / 3, deckY)], O[2 - j]);
    const [x1, t1] = pt(1, deckY - 150), [, b1] = pt(1, deckY);
    c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(e, deckY - 150); c.lineTo(x1, t1); c.lineTo(x1, b1); c.stroke();
  }
};

/** Behind the train: the tower, the depot (its side going back). */
export const drawDepot = (c: Ctx, v: View) => {
  const deckY = Y(STATION.deck.h);
  still(c, 'tower', STATION.tower, deckY, -84, -270, 150, 272, paintTower);
  depotSide(c, v);
  still(c, 'depot', STATION.depot, deckY, -112, -212, 224, 214, paintDepot);
};

/** The platform: its top going back (planks, banded), the lit lip (standable), the fascia and its posts, the steps up
 *  at its left; the gate (two posts, the bell on its bracket), the DEPARTURES board (ON TIME; later, WHENEVER). */
export const drawDeck = (c: Ctx, v: View, gone: boolean) => {
  const deckY = Y(STATION.deck.h), a = Math.max(STATION.deck.a, v.cam.x - 40), b = Math.min(STATION.deck.b + 200, v.cam.x + 840), eye = v.eye;
  const P = near(PLANK);
  // (its top going back: planks running along it, banded darker further back)
  if (eye.y < deckY && b > a) {
    for (let i = 0; i < 3; i++) { const d0 = 1 - 0.012 * i, d1 = 1 - 0.012 * (i + 1); poly(c, [at(eye, a, deckY, d0), at(eye, b, deckY, d0), at(eye, b, deckY, d1), at(eye, a, deckY, d1)], [P[4], P[3], P[3]][i]); }
  }
  // (the fascia: planks along the front, the lip lit, the posts under)
  box(c, a, deckY - 1, b - a, 1, INK);
  box(c, a, deckY, b - a, 44, INK); box(c, a, deckY + 1, b - a, 40, P[3]);
  for (let x = Math.floor(a / 34) * 34; x < b; x += 34) { box(c, x, deckY + 1, 1, 40, P[1]); box(c, x + 1, deckY + 1, 1, 40, P[5]); }
  box(c, a, deckY + 14, b - a, 1, P[2]); box(c, a, deckY + 28, b - a, 1, P[2]);
  box(c, a, deckY, b - a, 3, P[5]); box(c, a, deckY, b - a, 1, P[6]); box(c, a, deckY + 3, b - a, 1, P[4]);
  for (let x = Math.floor(a / 120) * 120; x < b; x += 120) { box(c, x + 49, deckY + 41, 12, 60, INK); box(c, x + 50, deckY + 41, 10, 60, P[2]); box(c, x + 50, deckY + 41, 3, 60, P[4]); }
  // (the steps up at its left: planks stepping up the ramp)
  const s0 = STATION.deck.a - 80;
  if (s0 + 80 > a - 100 && s0 < b) for (let k = 0; k < 4; k++) {
    const sx = s0 + k * 20, sy = Y(10 + k * 10);
    box(c, sx - 1, sy - 1, 22, Y(0) - sy + 1, INK); box(c, sx, sy, 20, Y(0) - sy, P[2]); box(c, sx, sy, 20, 2, P[5]); box(c, sx, sy + 2, 20, 1, P[3]);
  }
  // (the gate: two posts, the bell on its bracket)
  const g = STATION.gate + 20;
  still(c, 'gate', g, deckY, -20, -82, 60, 84, q => {
    for (const px of [0, 26]) { box(q, px - 1, -61, 8, 61, INK); box(q, px, -60, 6, 60, P[3]); box(q, px, -60, 2, 60, P[5]); box(q, px - 1, -63, 8, 3, P[4]); }
    box(q, -8, -76, 10, 3, INK); box(q, -7, -75, 8, 1, near(BLACK)[5]); box(q, -6, -74, 2, 6, near(BLACK)[4]);
    q.fillStyle = INK; q.beginPath(); q.moveTo(-15, -49); q.lineTo(-11, -68); q.lineTo(-1, -68); q.lineTo(3, -49); q.closePath(); q.fill();
    q.fillStyle = BRASS[3]; q.beginPath(); q.moveTo(-13.5, -50); q.lineTo(-10, -66.5); q.lineTo(-2, -66.5); q.lineTo(1.5, -50); q.closePath(); q.fill();
    box(q, -10, -64, 2, 12, BRASS[5]); box(q, -14, -52, 16, 2, BRASS[2]); box(q, -7, -50, 2, 3, BRASS[1]);
  });
  // (the DEPARTURES board: a chalkboard in its frame on a post)
  const tb = STATION.gate + 130;
  still(c, `timetable-${gone ? 1 : 0}`, tb, deckY, -52, -156, 104, 158, q => {
    box(q, -4, -121, 8, 121, INK); box(q, -3, -120, 6, 120, P[3]); box(q, -3, -120, 2, 120, P[5]);
    box(q, -48, -152, 96, 54, INK); box(q, -47, -151, 94, 52, P[4]); box(q, -47, -151, 94, 2, P[6]); box(q, -43, -147, 86, 44, '#1E2A22'); checker(q, -43, -147, 86, 44, '#24322A', 0);
    signText(q, 'DEPARTURES', 0, -136, { sx: 1, sy: 1, fill: '#F4CC4E' });
    signText(q, 'SAWDUST GULCH', 0, -122, { sx: 1, sy: 1, fill: '#F2EEE0' });
    signText(q, gone ? 'WHENEVER' : 'ON TIME', 0, -110, { sx: 1, sy: 1, fill: gone ? '#F87171' : '#86EFAC' });
    box(q, 30, -104, 8, 2, '#F2EEE0');
  });
};
