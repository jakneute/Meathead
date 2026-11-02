// CON-FUCK-TIOUS's Jungle Land lair, drawn (benLair.ts has the what and why): the park's old PUMP STATION 3, up the
// third maintenance shaft over the culvert, gone gym-bro hideout. At the rest of the game's grade (every material its
// five-step ramp, banded, dithered seams, outlined in its own dark; the light painted on in bands; the dark gathered
// into the corners; the scene's own lighting over it):
//
//   THE SHAFT (from the third air pocket up): poured concrete, its form lines and tie holes, the old ladder's rungs
//     rusted off to stubs (why there are ledges), a conduit and a rusty pipe up it, Ben's extension cord; the ledges,
//     steel grating on bolted brackets, each lit along its top (they're stood on); caged work lamps; a stencil and Ben's
//     scrawl. At its foot the pocket's grate hangs open off its hinge (you can see it goes up).
//   THE ROOM: the back wall's concrete form panels, water stains run down from the pipes, green mold, cracks, roots in
//     through a storm grate in the ceiling (the jungle up there: a green beam down through it); the two big water mains
//     across it (flanges, bolts, the red valve wheel, a gauge, a leaking joint); the floor's band back to the wall with
//     all of Ben's things on it, dimmed (none of it's stood on): the old pump (its motor's fins, the volute, a HIGH
//     VOLTAGE plate, his towel on it), a crate of gift-shop coconuts, the scaffold squat rack and its pipe barbell with
//     concrete-filled paint buckets for plates, the Jungle Cruise boat bench on milk crates, coconut dumbbells, a stack
//     of manhole covers, the cooler, his cardboard sign, a stolen tour guide's pith helmet on a hook, LEG DAY IS EVERY
//     DAY on a flattened box, the chalk tally; the hammock (a cargo net, a gift-shop plush monkey for a pillow) between a
//     standpipe and a valve stand; the Jungle Cruise boat's string lights along the main; the walk line lit along its
//     top. The shaft's hole at the room's left end, its lip in hazard stripes.
//   LIVE: the sled (painted once, put down where it's been shoved), the cannon, Ben, the work lamps' flicker, the leak's
//     drips, dust in the grate's beam; in front, the overflow pipe the cannon fires him up (he goes into it) and the
//     ceiling's near beam. Over in the dinosaur tank, the overflow's end out of its left wall, a flap hanging off it
//     (he's shot out of it).

import type { GameState } from '../../../m1/game/core/state';
import type { Light, SceneLight } from '../../../m1/game/render/lighting';
import { stamp } from '../../../m1/game/render/stamp';
import { checker } from '../../../m1/game/render/pixelArt';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { shapeR, pxR, lineR, ellR, dith, mixHex, type Ramp } from '../../foreign/heli/harryArt';
import { drawCannon, JUNGLE } from '../../upgrades/returnCannon';
import { drawBen, benHeadY } from '../../upgrades/confucktious';
import { saidOver } from '../section';
import { signAt, stencil, graffiti, print } from '../letters';
import { SECTIONS } from '../geometry';
import { POCKET_TOP } from './course';
import { SHAFT, LAIR, LEDGES, SLED, HAMMOCK, CANNON_X, OUTLET_X, OUTLET_Y, OVERFLOW_W, lairOf, benAt, inLair, lairView } from './benLair';

type Ctx = CanvasRenderingContext2D;
const { x0 } = SECTIONS.river;
const R = (x: number) => x0 + x;
/** The room's frame: its left end (the shaft's left side) and its floor's walk line; x across, y up negative. */
const LA = R(LAIR.a), F = LAIR.floor;
const W = LAIR.b - LAIR.a, H = LAIR.floor - LAIR.ceil;
/** The shaft (room x 0..SW), down from the floor to the pocket's roof. */
const SW = SHAFT.b - SHAFT.a, SD = POCKET_TOP - F;
/** Where the back wall meets the floor's band. */
const BACK = -30;
/** Where his things stand on the band. */
const PB = -14;
const lx = (rx: number) => rx - LAIR.a;
/** The work lamps (room coordinates): on the mains, and down the shaft. */
const LAMPS = [{ x: 300, y: -246 }, { x: 760, y: -246 }];
const SHAFT_LAMPS = [{ x: 28, y: 186 }, { x: 172, y: 386 }];
/** The storm grate in the ceiling (the jungle's light down through it). */
const GRATE = { x: 610, w: 64 };
/** The mains across the back wall (their middles), the leaking joint. */
const MAIN1 = -300, MAIN2 = -262, LEAK = 846;

const box = (g: Ctx, x: number, y: number, w: number, h: number, col: string | CanvasPattern) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// (every material its ramp: lit, base, shade, deep, line)
const CONC: Ramp = ['#8E8A7E', '#6E6A60', '#58544C', '#423E38', '#1C1A16'];
const CONC_D: Ramp = ['#5E5A52', '#4A4640', '#3A3632', '#2A2724', '#100E0C'];
const GREENP: Ramp = ['#8CA472', '#647C4C', '#4C6038', '#364428', '#121A0C'];
const RUST: Ramp = ['#C27A4C', '#94522E', '#6E3A22', '#4A2616', '#1A0C08'];
const STEEL: Ramp = ['#C6CCD4', '#9097A2', '#6C7280', '#4C5260', '#1A1E26'];
const GRATEST: Ramp = ['#A6AEB8', '#767E8A', '#58606C', '#3E4450', '#14181E'];
const WOOD: Ramp = ['#B08A5A', '#8A6640', '#6A4C2E', '#4A321C', '#1C120A'];
const COCO: Ramp = ['#A8784A', '#8A5C34', '#6A4426', '#4A2E16', '#1E1006'];
const RED: Ramp = ['#E2604A', '#B83A2A', '#8E2A1E', '#621C14', '#240806'];
const ORANGE: Ramp = ['#FFB86A', '#F48A2A', '#C8661A', '#8E4410', '#3A1A04'];
const BLUE: Ramp = ['#7AA6E0', '#4A7AC0', '#365E9A', '#24426E', '#0C1628'];
const CARD: Ramp = ['#E6C08A', '#C8A070', '#A68052', '#7C5C38', '#2E2010'];
const NET: Ramp = ['#E8DCC0', '#C8B890', '#A89870', '#7A6C4C', '#2A2418'];
const PLUSH: Ramp = ['#C8945A', '#A87438', '#865826', '#5E3C16', '#221406'];
const KHAKI: Ramp = ['#E8D8A8', '#CCB880', '#A8945E', '#7C6C40', '#2C2414'];
const HAZ = '#E8C030';
/** Set dressing, back on the band: dimmed toward the dark. */
const dimR = (r: Ramp, k = 0.3): Ramp => r.map(c => mixHex(c, '#14120C', k)) as unknown as Ramp;

/** A run of pipe across (y its middle, r its radius): the ramp in horizontal bands, lit along its top. */
const pipeH = (g: Ctx, xa: number, xb: number, y: number, r: number, P: Ramp) => {
  box(g, xa, y - r - 1, xb - xa, r * 2 + 2, P[4]);
  box(g, xa, y - r, xb - xa, r * 2, P[1]);
  box(g, xa, y - r, xb - xa, Math.max(1, r * 0.35), P[0]); box(g, xa, y - r + r * 0.35, xb - xa, 1, dith(g, P[0]));
  box(g, xa, y + r * 0.35, xb - xa, r * 0.4, P[2]); box(g, xa, y + r * 0.75, xb - xa, r * 0.25, P[3]);
  box(g, xa, y + r * 0.3, xb - xa, 1, dith(g, P[2]));
};
/** A run of pipe up and down (x its middle). */
const pipeV = (g: Ctx, x: number, ya: number, yb: number, r: number, P: Ramp) => {
  shapeR(g, () => g.rect(x - r, ya, r * 2, yb - ya), P, x - r, x + r, 1.2);
  pxR(g, x - r + 2, ya, 1, yb - ya, P[0]);
};
/** A flange round a pipe across (bolts on it). */
const flangeH = (g: Ctx, x: number, y: number, r: number, P: Ramp) => {
  shapeR(g, () => g.rect(x - 4, y - r - 4, 8, r * 2 + 8), P, x - 4, x + 4, 1);
  for (let k = 0; k < 3; k++) { pxR(g, x - 1, y - r - 2 + k * (r + 2), 2, 2, '#1A1410'); pxR(g, x - 1, y - r - 2 + k * (r + 2), 1, 1, P[0]); }
};
/** A coconut (a hairy husk, three eyes, lit up-left). */
const coconut = (g: Ctx, x: number, y: number, r: number, C: Ramp = COCO) => {
  shapeR(g, () => g.ellipse(x, y, r, r * 0.92, 0, 0, Math.PI * 2), C, x - r, x + r, 1);
  for (let k = 0; k < 5; k++) pxR(g, x - r * 0.6 + hash(k + x) * r * 1.2, y - r * 0.5 + hash(k + y) * r, 1, 1, C[0]);
  pxR(g, x - r * 0.25, y - r * 0.55, 1.4, 1.2, '#0E0704'); pxR(g, x + r * 0.15, y - r * 0.6, 1.4, 1.2, '#0E0704'); pxR(g, x - 0.4, y - r * 0.3, 1.4, 1.2, '#0E0704');
};
/** A caged work lamp's guard and its clamp (the bulb's drawn live). */
const lampCage = (g: Ctx, x: number, y: number) => {
  shapeR(g, () => g.rect(x - 4, y - 12, 8, 6), STEEL, x - 4, x + 4, 1);
  lineR(g, [x, y - 6, x, y - 2], 2, '#1A1E26');
  for (const dx of [-6, -2, 2, 6]) lineR(g, [x, y - 4, x + dx, y + 2, x + dx * 0.6, y + 11], 0.8, '#2A2E36');
  lineR(g, [x - 7, y + 4, x + 7, y + 4], 0.8, '#2A2E36');
};

// ---------------------------------------------------------------------------------------------------------------
// The room (painted once, in chunks; room coordinates)

const paintWall = (g: Ctx) => {
  // ---- the poured concrete: form panels 120 across, each its own tone, the tie holes, the seams dithered
  for (let x = -60, i = 0; x < W + 60; x += 120, i++) {
    const k = hash(i + 3) * 0.12;
    const P = CONC.map(c => mixHex(c, '#2A2620', 0.35 + k)) as unknown as Ramp;
    const bands = [P[2], P[1], P[1], P[2], P[3]];
    const bh = (H + BACK + 60) / bands.length;
    bands.forEach((col, j) => { box(g, x, -H - 60 + j * bh, 120, bh + 1, col); if (j) checker(g, x, -H - 60 + j * bh - 1, 120, 2, bands[j - 1], j % 2, 2); });
    box(g, x, -H - 60, 1, H + 60 + BACK, P[4]); box(g, x + 1, -H - 60, 1, H + 60 + BACK, dith(g, P[0]));
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) { const tx = x + 30 + c * 60, ty = -H + 40 + r * 110; ellR(g, tx, ty, 2.4, 2.4, P[4]); pxR(g, tx - 1, ty - 2, 2, 1, P[3]); }
    // (the pour lines across it)
    for (let y = -H + 20; y < BACK; y += 54) box(g, x, y + Math.round(hash(i * 7 + y) * 3), 120, 1, dith(g, P[3]));
  }
  // ---- water run down off the mains (dark streaks, wet at the top), green mold up from the floor and down off the
  // ceiling's grate, cracks
  for (let k = 0; k < 18; k++) {
    const x = hash(k + 40) * W, len = 40 + hash(k + 41) * 120, w = 3 + hash(k + 42) * 8;
    g.fillStyle = 'rgba(16,14,10,0.28)'; g.beginPath(); g.moveTo(x - w / 2, MAIN2 + 12); g.quadraticCurveTo(x - w, MAIN2 + 12 + len * 0.6, x - 1, MAIN2 + 12 + len); g.lineTo(x + 1, MAIN2 + 12 + len); g.quadraticCurveTo(x + w * 0.8, MAIN2 + 12 + len * 0.5, x + w / 2, MAIN2 + 12); g.closePath(); g.fill();
  }
  for (let x = -60; x < W + 60; x += 4) {
    const h = 10 + Math.abs(Math.sin(x * 0.03) * 22 + Math.sin(x * 0.11) * 8);
    box(g, x, BACK - h, 4, h, dith(g, '#3E5A2A')); box(g, x, BACK - h * 0.45, 4, h * 0.45, 'rgba(46,72,30,0.5)');
  }
  for (let x = GRATE.x - 70; x < GRATE.x + GRATE.w + 70; x += 3) {
    const h = 30 + Math.abs(Math.sin(x * 0.07) * 40) * (1 - Math.abs(x - GRATE.x - GRATE.w / 2) / 110);
    box(g, x, -H, 3, h, dith(g, '#3E6A2A'));
  }
  for (let k = 0; k < 7; k++) {
    let x = 120 + hash(k + 70) * (W - 200), y = -H + 30 + hash(k + 71) * 140;
    for (let s = 0; s < 6; s++) { const nx = x + (hash(k * 9 + s) - 0.5) * 16, ny = y + 10 + hash(k * 5 + s) * 14; lineR(g, [x, y, nx, ny], 1, 'rgba(12,10,8,0.6)'); lineR(g, [x + 1, y, nx + 1, ny], 0.6, 'rgba(200,190,170,0.12)'); x = nx; y = ny; }
  }
  // ---- stencils: what the room was; and what it is now
  signAt(g, 'PUMP STATION 3', 520, -214, 6, stencil(6, mixHex('#D8D0B8', '#2A2620', 0.35)));
  signAt(g, 'AUTHORIZED PERSONNEL ONLY', 520, -194, 4, stencil(4, mixHex('#C8B848', '#2A2620', 0.35)));
  signAt(g, "BEN'S", 520, -176, 10, graffiti(10, '#B83A2A', 7));
  // (the chalk tally by the rack: the days, or the reps)
  for (let k = 0; k < 4; k++) { for (let j = 0; j < 4; j++) box(g, 660 + k * 16 + j * 3, -170, 1, 12, 'rgba(230,226,214,0.5)'); lineR(g, [658 + k * 16, -160, 672 + k * 16, -169], 1, 'rgba(230,226,214,0.5)'); }
  // ---- the ceiling: a slab, its underside in shadow, a conduit along it, the storm grate (roots and leaves down through
  // it, the jungle green beyond), the overflow pipe's hole (the pipe's drawn in front)
  box(g, -60, -H - 80, W + 120, 80, CONC_D[3]);
  box(g, -60, -H - 8, W + 120, 4, CONC_D[2]); box(g, -60, -H - 4, W + 120, 4, CONC_D[4]);
  for (let x = -60; x < W + 60; x += 40) box(g, x, -H - 30, 2, 22, CONC_D[4]);
  pipeH(g, -60, W + 60, -H + 8, 3, dimR(STEEL, 0.35));
  for (let x = 20; x < W; x += 90) shapeR(g, () => g.rect(x, -H + 3, 5, 10), dimR(STEEL, 0.4), x, x + 5, 0.8);
  const gx = GRATE.x;
  box(g, gx - 4, -H - 40, GRATE.w + 8, 44, '#141A0C');
  for (let i = 0; i < 6; i++) box(g, gx, -H - 40 + i * 6, GRATE.w, 6, mixHex('#1E3A12', '#9AD06A', i / 7));
  for (let k = 0; k < 12; k++) { const x = gx + 4 + hash(k + 90) * (GRATE.w - 8); lineR(g, [x, -H - 30, x + (hash(k + 91) - 0.5) * 10, -H + 10 + hash(k + 92) * 40], 1.4, '#3A2A16'); }
  for (let k = 0; k < 8; k++) { const x = gx + hash(k + 95) * GRATE.w, y = -H - 2 + hash(k + 96) * 18; ellR(g, x, y, 4, 2, k % 2 ? '#4A8A2A' : '#2E6A1E', hash(k) - 0.5); }
  for (let x = gx; x <= gx + GRATE.w; x += 8) { box(g, x - 1, -H - 6, 3, 8, '#1A1E14'); box(g, x - 1, -H - 6, 1, 8, '#5A6A4A'); }
  box(g, gx - 4, -H - 6, GRATE.w + 8, 2, '#2A3020');
  box(g, R(CANNON_X) - LA - OVERFLOW_W / 2 - 4, -H - 40, OVERFLOW_W + 8, 40, '#0C0A08');
  // ---- the room's end walls: poured concrete, the left one lit along its face, the right in shadow
  for (const [xa, lit] of [[-60, true], [W, false]] as const) {
    const P = lit ? CONC_D : CONC_D.map(c => mixHex(c, '#0C0A08', 0.35)) as unknown as Ramp;
    box(g, xa, -H - 80, 60, H + 140, P[2]);
    for (let y = -H; y < 40; y += 54) box(g, xa, y, 60, 1, dith(g, P[4]));
    const face = lit ? xa + 60 : xa;
    box(g, face - (lit ? 4 : 0), -H - 80, 4, H + 140, lit ? P[0] : P[4]);
    box(g, face + (lit ? 0 : 4), -H - 80, 2, H + 140, dith(g, lit ? P[0] : P[3]));
  }
};

/** The mains, the standpipes, the leak's stain (room coordinates). */
const paintPipes = (g: Ctx) => {
  const P = dimR(GREENP, 0.2);
  // (wall brackets under them)
  for (let x = 40; x < W; x += 160) { shapeR(g, () => g.rect(x - 3, MAIN1 - 4, 6, MAIN2 - MAIN1 + 18), dimR(STEEL, 0.4), x - 3, x + 3, 0.9); }
  pipeH(g, -60, W + 60, MAIN1, 11, P);
  pipeH(g, -60, W + 60, MAIN2, 8, dimR(RUST, 0.25));
  for (let x = 120; x < W; x += 230) { flangeH(g, x, MAIN1, 11, P); flangeH(g, x + 60, MAIN2, 8, dimR(RUST, 0.2)); }
  // (the leaking joint: wet dark down the wall under it)
  g.fillStyle = 'rgba(10,12,10,0.4)'; g.beginPath(); g.moveTo(LEAK - 5, MAIN2 + 8); g.quadraticCurveTo(LEAK - 11, -120, LEAK - 3, BACK); g.lineTo(LEAK + 8, BACK); g.quadraticCurveTo(LEAK + 10, -140, LEAK + 6, MAIN2 + 8); g.closePath(); g.fill();
  pxR(g, LEAK - 1, MAIN2 + 10, 2, 70, dith(g, '#6A8A9A'));
  // (the red valve wheel on the main, a gauge)
  g.strokeStyle = RED[4]; g.lineWidth = 4; g.beginPath(); g.arc(704, MAIN1 + 22, 11, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = RED[1]; g.lineWidth = 2.4; g.beginPath(); g.arc(704, MAIN1 + 22, 11, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = RED[0]; g.lineWidth = 1; g.beginPath(); g.arc(704, MAIN1 + 22, 11, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
  for (let k = 0; k < 3; k++) { const a = (k * Math.PI * 2) / 3; lineR(g, [704, MAIN1 + 22, 704 + Math.cos(a) * 10, MAIN1 + 22 + Math.sin(a) * 10], 1.6, RED[2]); }
  lineR(g, [704, MAIN1 + 11, 704, MAIN1 + 22], 3, P[3]);
  ellR(g, 430, MAIN1 - 20, 9, 9, '#1A1410'); ellR(g, 430, MAIN1 - 20, 7.4, 7.4, '#E8E2CC'); lineR(g, [430, MAIN1 - 20, 435, MAIN1 - 25], 1, '#B83A2A');
  for (let k = 0; k < 5; k++) { const a = Math.PI * (0.8 + k * 0.35); pxR(g, 430 + Math.cos(a) * 5.6, MAIN1 - 20 + Math.sin(a) * 5.6, 1, 1, '#2A2420'); }
  lineR(g, [430, MAIN1 - 11, 430, MAIN1 - 10], 3, P[3]);
  // (the standpipe down to the pump, the hammock's two: a standpipe and a valve stand)
  pipeV(g, 300, MAIN1 + 8, PB - 40, 7, P);
  pipeV(g, HAMMOCK_L, MAIN2 + 6, PB, 6, dimR(RUST, 0.2));
  pipeV(g, HAMMOCK_R, -150, PB, 5, dimR(STEEL, 0.3));
  shapeR(g, () => g.rect(HAMMOCK_R - 9, -158, 18, 10), dimR(RED, 0.25), HAMMOCK_R - 9, HAMMOCK_R + 9, 1);
  // (the string lights off the Jungle Cruise boat, sagging along the main in loops)
  for (let x = 380; x < 900; x += 60) {
    g.strokeStyle = '#1A1A14'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, MAIN2 + 9); g.quadraticCurveTo(x + 30, MAIN2 + 30, x + 60, MAIN2 + 9); g.stroke();
    for (let k = 1; k < 4; k++) { const t = k / 4, bx = x + t * 60, by = MAIN2 + 9 + Math.sin(t * Math.PI) * 10.5; ellR(g, bx, by + 2, 1.8, 2.4, ['#F8D85A', '#E8604A', '#6AC0E8', '#8AE06A'][(k + x / 60) % 4 | 0]); }
  }
};
const HAMMOCK_L = lx(HAMMOCK.a), HAMMOCK_R = lx(HAMMOCK.b);

const paintFloor = (g: Ctx) => {
  // ---- the band back to the wall: concrete, oil stains, a drain, chalk dust
  const FL = ['#3E3A32', '#48443A', '#524C42', '#5C564A'];
  FL.forEach((col, i) => { const y = BACK + (i * -BACK) / FL.length; box(g, SW, y, W - SW + 60, -BACK / FL.length + 1, col); if (i) checker(g, SW, y - 1, W - SW + 60, 2, FL[i - 1], i % 2, 2); });
  box(g, SW, BACK, W - SW + 60, 2, 'rgba(10,8,6,0.55)'); box(g, SW, BACK + 2, W - SW + 60, 2, dith(g, 'rgba(10,8,6,0.55)'));
  for (let k = 0; k < 60; k++) { const x = SW + hash(k + 2000) * (W - SW), y = BACK + 4 + hash(k + 2100) * (-BACK - 8); box(g, x, y, 2 + hash(k + 2200) * 3, 1, hash(k + 2300) > 0.5 ? '#2A2620' : '#6E685A'); }
  for (const [x, rx] of [[470, 30], [800, 22], [590, 18]] as const) ellR(g, x, -12, rx, 5, 'rgba(14,12,10,0.35)');
  shapeR(g, () => g.rect(690, -16, 30, 8), dimR(STEEL, 0.5), 690, 720, 1);
  for (let k = 0; k < 6; k++) box(g, 693 + k * 5, -15, 2, 6, '#100E0C');
  // ---- the cut face under the walk line (the floor slab's edge, then rock), the lip lit along its top (stood on)
  const FF = ['#3A362E', '#302C26', '#28241E', '#201C18'];
  FF.forEach((col, i) => { box(g, SW, 4 + i * 10, W - SW + 60, 11, col); if (i) checker(g, SW, 3 + i * 10, W - SW + 60, 2, FF[i - 1], i % 2, 2); });
  for (let x = SW + 40; x < W + 60; x += 120) box(g, x, 4, 1, 40, '#16140F');
  box(g, SW, 0, W - SW + 60, 4, '#8A8474'); box(g, SW, 0, W - SW + 60, 2, '#B4AE9C'); box(g, SW, 0, W - SW + 60, 1, '#E2DCC8');
  checker(g, SW, 4, W - SW + 60, 2, '#8A8474', 0, 2);
  // (the shaft's lip: hazard stripes along its edge)
  for (let y = 0; y < 44; y += 8) box(g, SW, y, 8, 8, (y / 8) % 2 ? '#1A1A14' : mixHex(HAZ, '#14120C', 0.25));
  for (let x = SW; x < SW + 60; x += 8) box(g, x, -4, 8, 4, (x / 8) % 2 ? '#1A1A14' : mixHex(HAZ, '#14120C', 0.25));
};

/** Ben's things, back on the band (dimmed: none of it's stood on). */
const paintProps = (g: Ctx) => {
  // ---- the old pump: its motor (a drum, cooling fins, the end bell), the volute housing, the base, a HIGH VOLTAGE
  // plate; his towel over it
  const px = 300, PG = dimR(GREENP, 0.32);
  shapeR(g, () => g.rect(px - 70, PB - 6, 140, 6), dimR(STEEL, 0.4), px - 70, px + 70, 1);
  shapeR(g, () => g.roundRect(px - 64, PB - 58, 72, 52, 6), PG, px - 64, px + 8, 1.2);
  for (let k = 0; k < 9; k++) pxR(g, px - 58 + k * 7, PB - 56, 2, 48, PG[3]);
  for (let k = 0; k < 9; k++) pxR(g, px - 57 + k * 7, PB - 56, 1, 48, PG[0]);
  shapeR(g, () => g.ellipse(px - 66, PB - 32, 8, 25, 0, 0, Math.PI * 2), PG, px - 74, px - 58, 1);
  shapeR(g, () => g.ellipse(px + 30, PB - 28, 24, 22, 0, 0, Math.PI * 2), dimR(RUST, 0.3), px + 6, px + 54, 1.2);
  shapeR(g, () => g.ellipse(px + 30, PB - 28, 9, 9, 0, 0, Math.PI * 2), dimR(RUST, 0.45), px + 21, px + 39, 1);
  shapeR(g, () => g.rect(px + 2, PB - 30, 8, 8), dimR(STEEL, 0.4), px + 2, px + 10, 0.8);
  shapeR(g, () => g.rect(px - 46, PB - 46, 26, 14), ['#F8E08A', '#E8C030', '#B8901A', '#806008', '#2A2004'], px - 46, px - 20, 0.8);
  g.fillStyle = '#1A1410'; g.beginPath(); g.moveTo(px - 33, PB - 44); g.lineTo(px - 37, PB - 38); g.lineTo(px - 33, PB - 38); g.lineTo(px - 36, PB - 33); g.lineTo(px - 29, PB - 40); g.lineTo(px - 33, PB - 40); g.closePath(); g.fill();
  // (his towel over the motor: gray, a stripe, hanging down its side in folds)
  shapeR(g, () => { g.moveTo(px - 40, PB - 60); g.lineTo(px - 4, PB - 60); g.lineTo(px - 2, PB - 22); g.lineTo(px - 14, PB - 18); g.lineTo(px - 20, PB - 48); g.lineTo(px - 38, PB - 52); g.closePath(); }, dimR(['#E2E2E8', '#B8B8C2', '#9898A2', '#6C6C76', '#26262E'], 0.25), px - 40, px - 2, 1);
  pxR(g, px - 12, PB - 58, 3, 38, dimR(RED, 0.3)[1]);
  // ---- the coconut crate (stenciled), spilled coconuts, one with a straw in it
  const cx = 392;
  shapeR(g, () => g.rect(cx - 30, PB - 34, 60, 34), dimR(WOOD, 0.3), cx - 30, cx + 30, 1.2);
  for (let k = 1; k < 3; k++) pxR(g, cx - 30, PB - 34 + k * 11, 60, 1, dimR(WOOD, 0.3)[3]);
  signAt(g, 'COCONUTS', cx, PB - 22, 3, stencil(3, '#2A1A0C'));
  for (let k = 0; k < 6; k++) coconut(g, cx - 24 + k * 9 + (k % 2) * 2, PB - 38 - (k % 2) * 6, 6, dimR(COCO, 0.25));
  coconut(g, cx + 44, PB - 5, 6, dimR(COCO, 0.25)); coconut(g, cx - 42, PB - 4, 5, dimR(COCO, 0.25));
  lineR(g, [cx + 46, PB - 10, cx + 52, PB - 22], 1.4, '#E8604A');
  // ---- the cardboard sign by the shaft's lip, propped on a bucket
  shapeR(g, () => g.rect(SW + 18, PB - 74, 62, 40), dimR(CARD, 0.25), SW + 18, SW + 80, 1);
  signAt(g, "BEN'S", SW + 49, PB - 66, 4, print(4, '#2A1A0C'));
  signAt(g, 'NO SOLICITING', SW + 49, PB - 56, 2, print(2, '#2A1A0C'));
  signAt(g, 'NO SWIMMING', SW + 49, PB - 48, 2, print(2, '#7A1A0C'));
  shapeR(g, () => { g.moveTo(SW + 30, PB - 34); g.lineTo(SW + 66, PB - 34); g.lineTo(SW + 62, PB); g.lineTo(SW + 34, PB); g.closePath(); }, dimR(ORANGE, 0.35), SW + 30, SW + 66, 1);
  // ---- the stolen pith helmet on a hook; LEG DAY IS EVERY DAY on a flattened box
  shapeR(g, () => g.rect(468, -168, 4, 6), dimR(STEEL, 0.4), 468, 472, 0.8);
  shapeR(g, () => g.ellipse(470, -156, 16, 4, 0, 0, Math.PI * 2), dimR(KHAKI, 0.3), 454, 486, 1);
  shapeR(g, () => g.ellipse(470, -160, 10, 8, 0, Math.PI, 0), dimR(KHAKI, 0.3), 460, 480, 1);
  pxR(g, 460, -160, 20, 2, dimR(['#6A4A2A', '#4A321C', '#3A2614', '#2A1A0C', '#100804'], 0.2)[1]);
  shapeR(g, () => g.rect(150 + SW, -166, 70, 46), dimR(CARD, 0.3), 150 + SW, 220 + SW, 1);
  signAt(g, 'LEG DAY', 185 + SW, -158, 3, print(3, '#2A1A0C'));
  signAt(g, 'IS EVERY', 185 + SW, -146, 3, print(3, '#2A1A0C'));
  signAt(g, 'DAY', 185 + SW, -134, 3, print(3, '#8A1A0C'));
  for (const [tx, ty] of [[150 + SW, -166], [216 + SW, -166]] as const) pxR(g, tx + 1, ty + 1, 2, 2, '#C8C8D0');
  // ---- the scaffold squat rack, its pipe barbell, paint buckets of concrete for plates (a coconut set in each)
  const rk = 540, SR = dimR(STEEL, 0.35);
  for (const ux of [rk, rk + 70]) { shapeR(g, () => g.rect(ux - 3, -150, 6, 150 + PB), SR, ux - 3, ux + 3, 1); for (let y = -140; y < PB - 10; y += 22) pxR(g, ux - 6, y, 12, 2, SR[3]); shapeR(g, () => g.rect(ux - 9, PB - 4, 18, 4), SR, ux - 9, ux + 9, 1); }
  shapeR(g, () => g.rect(rk - 3, -154, 76, 5), SR, rk - 3, rk + 73, 1);
  lineR(g, [rk - 3, -150, rk + 73, -60], 1.4, SR[3]);
  lineR(g, [rk - 30, -112, rk + 100, -112], 4.4, dimR(RUST, 0.3)[4]); lineR(g, [rk - 30, -112.6, rk + 100, -112.6], 2.6, dimR(RUST, 0.3)[1]);
  for (const bx of [rk - 22, rk + 92]) {
    shapeR(g, () => { g.moveTo(bx - 13, -128); g.lineTo(bx + 13, -128); g.lineTo(bx + 11, -96); g.lineTo(bx - 11, -96); g.closePath(); }, dimR(BLUE, 0.3), bx - 13, bx + 13, 1.1);
    ellR(g, bx, -128, 13, 3, '#4A4840'); ellR(g, bx, -128, 10, 2, '#6A665A');
    coconut(g, bx, -132, 6, dimR(COCO, 0.25));
    pxR(g, bx - 11, -120, 22, 3, dimR(['#F2F2F2', '#D8D8D8', '#B8B8B8', '#8A8A8A', '#2A2A2A'], 0.3)[1]);
  }
  // ---- the boat bench (a Jungle Cruise seat, its cushion split, on two milk crates)
  const bb = 660;
  for (const mx of [bb, bb + 52]) { shapeR(g, () => g.rect(mx, PB - 26, 22, 26), dimR(BLUE, 0.35), mx, mx + 22, 1); for (let k = 0; k < 3; k++) pxR(g, mx + 3 + k * 6, PB - 22, 3, 18, '#141210'); }
  shapeR(g, () => g.roundRect(bb - 6, PB - 38, 86, 12, 3), dimR(ORANGE, 0.3), bb - 6, bb + 80, 1);
  pxR(g, bb + 20, PB - 36, 10, 1, '#F8E8C8'); lineR(g, [bb + 24, PB - 37, bb + 28, PB - 30], 1, '#2A1A08');
  // ---- coconut dumbbells (coconuts set in coffee cans of concrete, on a pipe), on the floor by the bench
  for (const [dx, dy] of [[640, -8], [770, -6]] as const) { lineR(g, [dx - 12, dy - 4, dx + 12, dy - 4], 2, '#2A2620'); coconut(g, dx - 13, dy - 5, 5, dimR(COCO, 0.2)); coconut(g, dx + 13, dy - 5, 5, dimR(COCO, 0.2)); }
  // ---- the hammock: a cargo net slung between the standpipe and the valve stand, the plush monkey pillow, a can
  const ha = HAMMOCK_L + 6, hb = HAMMOCK_R - 5, hy = -96, sag = 34, NR = dimR(NET, 0.3);
  const yAt = (x: number) => hy + Math.sin(((x - ha) / (hb - ha)) * Math.PI) * sag;
  for (let k = 0; k < 4; k++) { g.strokeStyle = k ? NR[2] : NR[4]; g.lineWidth = k ? 1 : 3; g.beginPath(); for (let x = ha; x <= hb; x += 4) { const y = yAt(x) + k * 4; if (x === ha) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke(); }
  for (let x = ha + 8; x < hb; x += 10) lineR(g, [x, yAt(x), x + 5, yAt(x + 5) + 12], 0.8, NR[1]);
  lineR(g, [ha, hy, ha - 2, hy - 30], 1.4, NR[3]); lineR(g, [hb, hy, hb + 2, hy - 54], 1.4, NR[3]);
  const mx = ha + 24, my = yAt(mx) - 8;
  shapeR(g, () => g.ellipse(mx, my, 13, 9, -0.2, 0, Math.PI * 2), dimR(PLUSH, 0.2), mx - 13, mx + 13, 1);
  shapeR(g, () => g.ellipse(mx - 12, my - 7, 8, 7, 0, 0, Math.PI * 2), dimR(PLUSH, 0.2), mx - 20, mx - 4, 1);
  ellR(g, mx - 11, my - 5, 5, 4, dimR(['#F2D8B0', '#E0C090', '#C8A070', '#9A7A4A', '#2A2010'], 0.2)[1]);
  pxR(g, mx - 13, my - 7, 1.4, 1.4, '#100804'); pxR(g, mx - 9, my - 7, 1.4, 1.4, '#100804');
  ellR(g, mx - 19, my - 10, 3, 3, dimR(PLUSH, 0.2)[2]);
  shapeR(g, () => g.rect(hb - 34, yAt(hb - 30) - 12, 7, 11), dimR(['#E8E8F0', '#B8BCC8', '#8A8E9A', '#5A5E6A', '#1A1C22'], 0.25), hb - 34, hb - 27, 0.8);
  // (the cooler under it)
  shapeR(g, () => g.roundRect(HAMMOCK_L + 50, PB - 26, 48, 26, 3), dimR(RED, 0.3), HAMMOCK_L + 50, HAMMOCK_L + 98, 1.1);
  shapeR(g, () => g.rect(HAMMOCK_L + 50, PB - 30, 48, 6), dimR(['#F2F2F2', '#D8D8D8', '#B8B8B8', '#8A8A8A', '#2A2A2A'], 0.3), HAMMOCK_L + 50, HAMMOCK_L + 98, 1);
  // ---- the manhole covers, stacked against the wall (his plates)
  for (let k = 0; k < 4; k++) { const y = PB - 6 - k * 7; shapeR(g, () => g.roundRect(900 - 30 + (k % 2) * 3, y, 60, 7, 2), dimR(['#7A7A80', '#55555C', '#424248', '#2E2E34', '#0E0E10'], 0.25), 870, 930, 1); for (let j = 0; j < 6; j++) pxR(g, 876 + j * 9 + (k % 2) * 3, y + 2, 4, 1, '#1A1A1E'); }
};

/** The light painted on: the lamps' pools on the wall, the grate's beam, the dark gathered into the corners. */
const paintLight = (g: Ctx) => {
  for (const l of LAMPS) for (let i = 0; i < 5; i++) { g.fillStyle = `rgba(255,214,140,${0.03 + i * 0.014})`; g.beginPath(); g.ellipse(l.x, l.y + 90 + i * 10, 200 - i * 34, 150 - i * 26, 0, 0, Math.PI * 2); g.fill(); }
  for (let i = 0; i < 6; i++) {
    const k = i / 6, x = GRATE.x + GRATE.w / 2;
    g.fillStyle = `rgba(200,240,170,${0.03 + k * 0.022})`;
    g.beginPath(); g.moveTo(x - 30 * (1 - k * 0.5), -H); g.lineTo(x + 30 * (1 - k * 0.5), -H); g.lineTo(x + 90 * (1 - k * 0.6) + 30, 0); g.lineTo(x - 70 * (1 - k * 0.6) + 30, 0); g.closePath(); g.fill();
  }
  for (let i = 0; i < 4; i++) {
    g.fillStyle = `rgba(8,6,4,${0.08 + i * 0.04})`;
    g.fillRect(-60, -H - 60, W + 120, 30 + (3 - i) * 20);
    g.fillRect(W - (3 - i) * 26, -H - 60, 60 + (3 - i) * 26, H + 60);
  }
};

const paintRoom = (g: Ctx) => { paintWall(g); paintPipes(g); paintFloor(g); paintProps(g); paintLight(g); };

// ---------------------------------------------------------------------------------------------------------------
// The shaft (painted once; room coordinates: x 0..SW, y 0 at the floor's line down to SD at the pocket's roof)

const paintShaft = (g: Ctx) => {
  // ---- the back wall: deeper concrete, darker going down, its form lines, the tie holes
  const bands = [CONC_D[1], CONC_D[1], CONC_D[2], CONC_D[2], CONC_D[3], CONC_D[3]];
  const top = -H, bh = (SD + 4 - top) / bands.length;
  bands.forEach((col, i) => { box(g, 0, top + i * bh, SW, bh + 1, col); if (i) checker(g, 0, top + i * bh - 1, SW, 2, bands[i - 1], i % 2, 2); });
  for (let y = top + 30; y < SD; y += 60) { box(g, 0, y, SW, 1, dith(g, CONC_D[4])); box(g, 0, y + 1, SW, 1, dith(g, CONC_D[0])); }
  for (let y = top + 50; y < SD; y += 120) for (const x of [50, 150]) { ellR(g, x, y, 2.4, 2.4, CONC_D[4]); pxR(g, x - 1, y - 2, 2, 1, CONC_D[0]); }
  // (the side walls' edges, stepping back: lit on the left, shaded on the right)
  box(g, 0, top, 10, SD - top + 4, CONC[3]); box(g, 0, top, 2, SD - top + 4, CONC[0]); box(g, 10, top, 2, SD - top + 4, dith(g, CONC[3]));
  box(g, SW - 10, top, 10, SD - top + 4, CONC_D[4]); box(g, SW - 12, top, 2, SD - top + 4, dith(g, CONC_D[4]));
  // ---- the old ladder: rung stubs up the middle, rusted off (the reason for the ledges); rust run down under each
  for (let y = SD - 30, k = 0; y > -40; y -= 28, k++) {
    const broken = hash(k + 11) < 0.75;
    lineR(g, [86, y, 86, y + 3], 3, RUST[4]); lineR(g, [114, y, 114, y + 3], 3, RUST[4]);
    pxR(g, 85, y + 3, 2, 10, dith(g, RUST[2])); pxR(g, 113, y + 3, 2, 10, dith(g, RUST[2]));
    if (!broken) { lineR(g, [86, y, 114, y], 2.4, RUST[4]); lineR(g, [86, y - 0.6, 114, y - 0.6], 1.2, RUST[1]); }
    else { lineR(g, [86, y, 92, y + 2], 2, RUST[2]); lineR(g, [114, y, 109, y + 3], 2, RUST[2]); }
  }
  // ---- a conduit and a rusty pipe up the right side, brackets; Ben's extension cord down the left, stapled
  pipeV(g, SW - 22, top, SD, 5, RUST);
  for (let y = top + 20; y < SD; y += 70) shapeR(g, () => g.rect(SW - 30, y, 16, 4), STEEL, SW - 30, SW - 14, 0.8);
  pipeV(g, SW - 40, top, SD, 2.4, STEEL);
  g.strokeStyle = '#8A4A14'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(18, top); for (let y = top; y < SD; y += 40) g.quadraticCurveTo(24, y + 20, 18, y + 40); g.stroke();
  g.strokeStyle = '#E8862A'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(18, top); for (let y = top; y < SD; y += 40) g.quadraticCurveTo(24, y + 20, 18, y + 40); g.stroke();
  // ---- the stencil, and Ben's scrawl with an arrow up
  signAt(g, 'MAINT. ACCESS 3', 100, 230, 4, stencil(4, '#B8C0BC'));
  signAt(g, 'GYM', 100, 120, 6, graffiti(6, '#E8E0C8', 3));
  lineR(g, [100, 112, 100, 86], 2, '#E8E0C8'); lineR(g, [94, 92, 100, 84, 106, 92], 2, '#E8E0C8');
  signAt(g, 'NO KYLES', 60, 452, 3, graffiti(3, '#C8402A', 9));
  // ---- the lamps' brackets (bulbs live) and their light on the wall
  for (const l of SHAFT_LAMPS) {
    lampCage(g, l.x, l.y);
    for (let i = 0; i < 4; i++) { g.fillStyle = `rgba(255,214,140,${0.03 + i * 0.02})`; g.beginPath(); g.ellipse(l.x + (l.x < 100 ? 30 : -30), l.y + 30, 90 - i * 20, 70 - i * 14, 0, 0, Math.PI * 2); g.fill(); }
  }
  // (the dark down the shaft, deepening toward the pocket)
  for (let i = 0; i < 4; i++) { g.fillStyle = `rgba(6,6,4,${0.06 + i * 0.03})`; g.fillRect(0, SD - 60 - i * 60, SW, 60 + i * 60); }
};

/** The ledges (and the hatch at the foot): steel grating on bolted brackets, each lit along its top (they're stood on). */
const paintLedges = (g: Ctx) => {
  for (const [a, b, wy] of LEDGES) {
    const x = lx(a), w = b - a, y = wy - F, right = x > SW / 2;
    // (the bracket under it: a triangle of angle iron bolted into the wall)
    const wx = right ? x + w : x, ox = right ? x + 8 : x + w - 8;
    g.fillStyle = GRATEST[4]; g.beginPath(); g.moveTo(wx, y + 4); g.lineTo(ox, y + 6); g.lineTo(wx, y + 34); g.closePath(); g.fill();
    lineR(g, [wx, y + 32, ox, y + 6], 2.4, GRATEST[2]); lineR(g, [wx, y + 31, ox - (right ? -1 : 1), y + 6], 0.8, GRATEST[0]);
    for (const by of [y + 10, y + 26]) { ellR(g, wx + (right ? -3 : 3), by, 1.6, 1.6, GRATEST[4]); pxR(g, wx + (right ? -4 : 2), by - 1, 1, 1, GRATEST[0]); }
    // (the grating: its frame, the bars across, the lit lip)
    shapeR(g, () => g.rect(x, y, w, 6), GRATEST, x, x + w, 1);
    for (let k = 3; k < w - 2; k += 5) pxR(g, x + k, y + 2, 2, 3, GRATEST[4]);
    box(g, x, y - 1, w, 2, '#D6DCE4'); box(g, x, y - 1, w, 1, '#FFFFFF');
    box(g, x, y + 6, w, 2, dith(g, GRATEST[4]));
    // (hazard tape along its edge)
    for (let k = 0; k < w; k += 8) box(g, x + k, y + 1, 4, 1, HAZ);
  }
  // ---- the pocket's grate, hung open off its hinge at the left of the hole (the bars down, swinging)
  const gx = 40, gy = SD - 2;
  shapeR(g, () => g.rect(gx - 4, gy - 4, 8, 8), STEEL, gx - 4, gx + 4, 1);
  shapeR(g, () => g.rect(gx - 3, gy, 7, 62), GRATEST, gx - 3, gx + 4, 1);
  for (let k = 6; k < 60; k += 10) box(g, gx - 3, gy + k, 7, 4, '#3A3A38');
  box(g, gx - 3, gy, 1, 62, '#E8F0F0');
};

// ---------------------------------------------------------------------------------------------------------------
// The sled, the overflow's end, the near beam, the overflow pipe (painted once each)

const paintSled = (g: Ctx) => {
  // (local: its bottom middle at 0,0, the pad facing -x; the skids, the pallet, three tires stacked, the boat cushion
  // ratchet-strapped on its face, a coconut wedged on top)
  const w = SLED.w, h = SLED.h;
  lineR(g, [-w / 2 - 6, -6, -w / 2 - 2, -2, w / 2, -2], 3, STEEL[4]); lineR(g, [-w / 2 - 6, -6.6, -w / 2 - 2, -2.6, w / 2, -2.6], 1.4, STEEL[1]);
  shapeR(g, () => g.rect(-w / 2, -12, w, 8), WOOD, -w / 2, w / 2, 1);
  for (let k = 1; k < 4; k++) pxR(g, -w / 2 + k * (w / 4), -12, 1, 8, WOOD[3]);
  for (let k = 0; k < 3; k++) {
    const y = -12 - (k + 1) * 15;
    shapeR(g, () => g.roundRect(-w / 2 + 6, y, w - 10, 15, 6), ['#5A5A60', '#36363C', '#28282C', '#1A1A1E', '#08080A'], -w / 2 + 6, w / 2 - 4, 1);
    for (let j = 0; j < 9; j++) pxR(g, -w / 2 + 10 + j * 5, y + 2, 2, 11, '#121214');
    pxR(g, -w / 2 + 9, y + 2, w - 18, 1, '#6A6A72');
  }
  // (the cushion: a boat seat, orange vinyl, JUNGLE CRUISE faded on it, a split taped)
  shapeR(g, () => g.roundRect(-w / 2 - 4, -h + 6, 12, h - 16, 3), ORANGE, -w / 2 - 4, -w / 2 + 8, 1.2);
  pxR(g, -w / 2 - 2, -h + 10, 2, h - 26, ORANGE[0]);
  pxR(g, -w / 2 - 3, -h * 0.55, 10, 4, '#C8C8D0'); pxR(g, -w / 2 - 3, -h * 0.55, 10, 1, '#F2F2F6');
  // (the ratchet straps round it all, the buckle)
  for (const y of [-h + 16, -26]) { lineR(g, [-w / 2 - 5, y, w / 2 - 2, y], 2.6, '#1A1A40'); lineR(g, [-w / 2 - 5, y - 0.6, w / 2 - 2, y - 0.6], 1, '#4A5AC0'); }
  shapeR(g, () => g.rect(w / 2 - 12, -30, 8, 8), STEEL, w / 2 - 12, w / 2 - 4, 0.8);
  coconut(g, 4, -h - 2, 7);
};

const paintOutlet = (g: Ctx) => {
  // (local: the wall's face at x 0, the pipe's middle at y 0; its end out of the wall, a collar bolted round it, the
  // flap hung open off its top hinge, a beard of weed off its lip)
  shapeR(g, () => g.rect(-8, -14, 30, 28), RUST, -8, 22, 1.2);
  shapeR(g, () => g.rect(-2, -18, 6, 36), STEEL, -2, 4, 1);
  for (const by of [-14, -4, 6, 14]) { ellR(g, 1, by, 1.4, 1.4, '#1A0C08'); pxR(g, 0, by - 1, 1, 1, STEEL[0]); }
  ellR(g, 22, 0, 4, 13, RUST[4]); ellR(g, 22, 0, 2.6, 11, '#0A0604');
  shapeR(g, () => { g.moveTo(22, -14); g.lineTo(27, -14); g.lineTo(36, 6); g.lineTo(31, 8); g.closePath(); }, dimR(RUST, 0.1), 22, 36, 1);
  pxR(g, 22, -16, 6, 3, STEEL[2]);
  signAt(g, 'OVERFLOW', 8, -24, 3, stencil(3, '#E8D8B0'));
  for (let k = 0; k < 6; k++) lineR(g, [8 + k * 3, 14, 8 + k * 3 + (hash(k) - 0.5) * 4, 18 + hash(k + 3) * 14], 1, k % 2 ? '#3E5A2A' : '#2E4A1E');
};

const paintBeam = (g: Ctx) => {
  // (the near beam along the ceiling, in silhouette, the conduit's clips, a drip edge; room coordinates)
  box(g, -60, -H - 70, W + 120, 64, '#0C0A08');
  for (let x = -60; x < W + 60; x += 3) { const y = -H - 6 + Math.sin(x * 0.09) * 1.5 + (hash(x + 7) > 0.9 ? 3 + hash(x + 8) * 6 : 0); box(g, x, -H - 8, 3, y + H + 8, '#0C0A08'); }
  box(g, -60, -H - 10, W + 120, 1, '#2A2620');
  for (let x = 30; x < W; x += 140) { box(g, x, -H - 2, 18, 10, '#0C0A08'); box(g, x, -H - 2, 18, 1, '#3A342C'); }
};

const paintOverflow = (g: Ctx) => {
  // (local: the ceiling's line at y 0; the pipe up out of the room, its mouth hanging down into it, flared)
  const r = OVERFLOW_W / 2 - 6, P = dimR(GREENP, 0.15);
  shapeR(g, () => g.rect(-r, -720, r * 2, 720 + 14), P, -r, r, 1.4);
  for (let y = -700; y < 0; y += 120) { shapeR(g, () => g.rect(-r - 4, y, r * 2 + 8, 8), P, -r - 4, r + 4, 1); for (const bx of [-r, 0, r]) pxR(g, bx - 1, y + 3, 2, 2, '#121A0C'); }
  shapeR(g, () => { g.moveTo(-r, 10); g.lineTo(r, 10); g.lineTo(r + 8, 30); g.lineTo(-r - 8, 30); g.closePath(); }, P, -r - 8, r + 8, 1.4);
  ellR(g, 0, 30, r + 7, 4, '#0A0806');
  signAt(g, 'OVERFLOW', 0, -40, 3, stencil(3, '#E8D8B0'));
  lineR(g, [0, -52, 0, -76], 2, '#E8D8B0'); lineR(g, [-5, -70, 0, -78, 5, -70], 2, '#E8D8B0');
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const seen = (state: GameState, a: number, b: number, t: number, bt: number) =>
  b > state.camera.x - 20 && a < state.camera.x + CANVAS_WIDTH + 20 && bt > state.camera.y - 20 && t < state.camera.y + 620;
/** The work lamps' flicker (about 1, on; a dip now and then: the extension cord). */
const flick = (f: number, k: number) => (hash(Math.floor(f / 7) + k * 13) > 0.95 ? 0.5 : 0.93 + Math.sin(f * 0.6 + k) * 0.04);

/** World space, behind everything that moves (after the river's own). */
export const drawLairBack = (c: Ctx, state: GameState) => {
  const f = state.frame;
  // (the overflow's end out of the tank's left wall, where the cannon shoots him out)
  const ox = R(OUTLET_X);
  if (seen(state, ox - 20, ox + 50, OUTLET_Y - 40, OUTLET_Y + 40)) { c.save(); c.translate(ox, OUTLET_Y); stamp(c, 'jl-outlet', -30, -34, 84, 70, paintOutlet); c.restore(); }
  if (!seen(state, LA - 80, R(LAIR.b) + 80, F - H - 80, POCKET_TOP + 140)) return;
  c.save(); c.translate(LA, F);
  // The shaft, its ledges and the pocket's hatch
  if (seen(state, LA, LA + SW, F - H, POCKET_TOP + 140)) {
    stamp(c, 'jl-shaft', 0, -H, SW, SD + 4 + H, paintShaft);
    stamp(c, 'jl-ledges', 0, -10, SW, SD + 120, paintLedges);
  }
  // The room (in chunks: no one canvas huge)
  const CH = 3, cw = (W - SW + 60) / CH;
  for (let i = 0; i < CH; i++) {
    const bx = SW + i * cw;
    if (!seen(state, LA + bx, LA + bx + cw, F - H - 80, F + 50)) continue;
    stamp(c, `jl-room-${i}`, bx, -H - 80, cw, H + 130, g => { g.save(); g.beginPath(); g.rect(bx, -H - 80, cw, H + 130); g.clip(); paintRoom(g); g.restore(); });
  }
  // (the room's air over the shaft's top: the wall and the ceiling go on over the hole)
  if (seen(state, LA, LA + SW, F - H - 80, F)) stamp(c, 'jl-room-over', 0, -H - 80, SW, H + 80, g => { g.save(); g.beginPath(); g.rect(0, -H - 80, SW, H + 80 + BACK + 30); g.clip(); paintWall(g); paintPipes(g); g.restore(); });
  // The work lamps' bulbs (flickering), the leak's drips, dust in the grate's light
  for (const [i, l] of [...LAMPS, ...SHAFT_LAMPS].entries()) {
    const k = flick(f, i);
    if (i < 2) { c.save(); c.translate(0, 0); lampCageLive(c, l.x, l.y); c.restore(); }
    for (let r = 3; r > 0; r--) { c.fillStyle = `rgba(255,214,140,${0.05 * k * (4 - r)})`; c.beginPath(); c.arc(l.x, l.y + 4, 5 + r * 6, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = k > 0.6 ? '#FFF4C8' : '#C8B888'; c.beginPath(); c.ellipse(l.x, l.y + 4, 3.4, 4.4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FFFFFF'; c.fillRect(l.x - 1, l.y + 2, 2, 2);
  }
  for (let i = 0; i < 2; i++) {
    const t = ((f + i * 47) % 90) / 90;
    c.fillStyle = 'rgba(170,200,220,0.8)'; c.fillRect(LEAK - 1 + i, Math.round(MAIN2 + 10 + t * (-MAIN2 - 10 + PB)), 2, 3);
  }
  for (let i = 0; i < 9; i++) {
    const u = ((f * 0.25 + i * 61) % 400) / 400;
    c.fillStyle = `rgba(220,250,190,${0.18 + 0.3 * Math.sin(u * Math.PI)})`;
    c.fillRect(Math.round(GRATE.x + GRATE.w / 2 + Math.sin(f * 0.012 + i * 1.9) * (14 + u * 50) + u * 30), Math.round(-H + u * H), 2, 2);
  }
  c.restore();
  const h = lairOf(state);
  // The sled (where it's been shoved; its pad toward him), the cannon, Ben
  const sx = R(h.sled.x), jolt = h.sled.jolt > 0 ? (h.sled.jolt % 4 < 2 ? 1 : -1) : 0;
  const padLeft = state.player.pos.x + state.player.width / 2 < sx;
  c.save(); c.translate(Math.round(sx + jolt), F); if (!padLeft) c.scale(-1, 1);
  stamp(c, `jl-sled-${padLeft ? 'l' : 'r'}`, -SLED.w / 2 - 10, -SLED.h - 12, SLED.w + 20, SLED.h + 14, paintSled);
  c.restore();
  drawCannon(c, h.cannon, JUNGLE);
  const b = h.ben, at = benAt(state);
  drawBen(c, at.x, at.y, b.facing, b.pose, Math.floor(b.poseT / 5), b.piece);
};
const lampCageLive = (c: Ctx, x: number, y: number) => stamp(c, 'jl-cage', x - 10, y - 14, 20, 28, g => lampCage(g, x, y));

/** World space, in front of everything: the overflow pipe (he's fired up into it), the ceiling's near beam, Ben's words. */
export const drawLairFront = (c: Ctx, state: GameState) => {
  if (!seen(state, LA - 80, R(LAIR.b) + 80, F - H - 800, F + 60)) return;
  const h = lairOf(state);
  c.save(); c.translate(LA, F);
  const CH = 3, cw = (W + 120) / CH;
  for (let i = 0; i < CH; i++) {
    const bx = -60 + i * cw;
    if (!seen(state, LA + bx, LA + bx + cw, F - H - 80, F - H + 20)) continue;
    stamp(c, `jl-beam-${i}`, bx, -H - 72, cw, 90, g => { g.save(); g.beginPath(); g.rect(bx, -H - 72, cw, 90); g.clip(); paintBeam(g); g.restore(); });
  }
  c.restore();
  const ox = R(CANNON_X);
  c.save(); c.translate(ox, F - H); stamp(c, 'jl-overflow', -OVERFLOW_W / 2 - 10, -724, OVERFLOW_W + 20, 760, paintOverflow); c.restore();
  // (his words over his head, only while they're said; not while his gross-up's got them)
  if (h.ben.said && !h.script?.gross) { const at = benAt(state); saidOver(c, h.ben.said.text, at.x, benHeadY(at.y), '#FFFFFF', 220); }
};

/** Up here: dark, the work lamps' warm pools (flickering), the jungle's green beam down the grate, the shaft's lamps; a
 *  soft glow about him so he's never lost in it. */
export const lairLighting = (state: GameState): SceneLight => {
  const f = state.frame, p = state.player;
  const lamp = (l: { x: number; y: number }, i: number, r: number): Light => { const k = flick(f, i); return { x: LA + l.x, y: F + l.y + 6, r, a: 0.9 * k, color: `rgba(255,196,120,${(0.14 * k).toFixed(3)})` }; };
  const lights: Light[] = [
    ...LAMPS.map((l, i) => lamp(l, i, 300)),
    ...SHAFT_LAMPS.map((l, i) => lamp(l, i + 2, 200)),
    { x: LA + GRATE.x + GRATE.w / 2, y: F - H - 10, r: H + 40, cone: 90, a: 0.7, color: 'rgba(190,240,160,0.12)' },
    { x: LA + SW / 2, y: POCKET_TOP + 60, r: 160, a: 0.5, color: 'rgba(160,220,230,0.08)' },
    { x: p.pos.x + p.width / 2, y: p.pos.y + 20, r: 150, a: 0.4 },
  ];
  return { dark: 0.5, shade: [14, 10, 6], rim: 0.5, lights };
};
export { inLair, lairView };
