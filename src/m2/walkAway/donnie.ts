// The walk-away from Donnie Dracula (Spooky Land's boss): back down the town's street toward the camera at whatever
// hour it is now (timeOfDay.ts). The same Victorian street he crossed coming in, painted by the town's own painting
// (walkAway/spookyTown.ts brings it into the picture): its purple-stucco shopfronts shoulder to shoulder down both
// sides, an alley between each (the gables and mansards, the bays, the boards over the doors: APOTHECARY - NOW WITH
// DRIVE-THRU and the rest, the CRYPT-O ATM in its crypt), each shop's sign hung out over the sidewalk, the town's gas
// lamps (FREE WI-FI) along the curbs, its cobbles, its sky, its skyline. At the street's far end, in the square, the
// ELEVATOR TO HELL clock tower as it is in the town, wrecked: leaning, its spire snapped off, the face cracked and
// stopped (still plain to see), its sign hanging off a bolt, its track torn off the top and the cable swinging, a thin
// smoke blowing off to the side and a dim red glow at its foot (and now and then another car, still being sent,
// dropping in). In the foreground, a little of the ballroom's carnage: gift-shop junk strewn about, a dropped HELLO MY
// NAME IS DONNIE sticker; killed by his weakness, a trail of his ash. His new toy: the SOUL SUCKER.

import { type Ctx, type Prop, type SceneDef, INK, HOR, F, CAM_H, VP_X, ME_X, SPEED, box, hash, lump, smoke, fire, project } from './kit';
import { spriteOf, fogAt, wobble } from './screen';
import { timeOfDay } from '../timeOfDay';
import { STONE, LIP, COBBLE, LEFT_SIDE, RIGHT_SIDE, layoutOf, drawTownSky, drawTowerWrecked, drawStreetWalls, lampProp, lanternUp, bladeProp, cobbles, litter, TOWER_TOP } from './spookyTown';

// ---------------------------------------------------------------------------------------------------------------
// The street's measures (meters; x across from the eye, the path's middle at ME_X)

/** The town's px a meter here (him: about 76 of them). */
const PPM = 40;
/** The roadway's half-width (cobbles), the shopfronts' line (the walls). */
const ROAD = 3.5, WALK = 7.5;
const XL = ME_X - WALK, XR = ME_X + WALK;
/** The lamps, just in from the curb (both sides, a lamp every LAMP_GAP m). */
const LAMP_X = 3.9, LAMP_GAP = 10;
/** Where the street ends (m): its last shops' corners, the tower standing past them in the square. */
const D_END = 60;

// ---------------------------------------------------------------------------------------------------------------
// The ground: the town's cobbles down the road, the gutters, the curbs (granite, lit along the top: the town's lip),
// the sidewalks' flags, puddles, dead leaves, soot

const ground = (g: Ctx, w: number, h: number) => {
  const m = w / 2, road = ROAD * 16;
  cobbles(g, m - road, m + road, h);
  for (const sd of [-1, 1]) {
    // (the gutter, then the curb: granite, its top lit)
    const gx = sd < 0 ? m - road - 3 : m + road;
    box(g, gx, 0, 3, h, COBBLE[0]);
    const cx = sd < 0 ? m - road - 8 : m + road + 3;
    box(g, cx, 0, 5, h, STONE[3]); box(g, sd < 0 ? cx + 2 : cx, 0, 3, h, LIP[1]); box(g, sd < 0 ? cx + 4 : cx, 0, 1, h, LIP[2]);
    for (let y = 0; y < h; y += 24) box(g, cx, y, 5, 1, STONE[1]);
    // (the sidewalk: big flags, seamed, each its own tone, lit along its near edge)
    const x0 = sd < 0 ? 0 : m + road + 8, x1 = sd < 0 ? m - road - 8 : w;
    box(g, x0, 0, x1 - x0, h, STONE[1]);
    for (let y = 0, r = 0; y < h; y += 14, r++) for (let x = x0 + (r % 2) * 8, k = 0; x < x1; x += 16, k++) {
      const ww = Math.min(15, x1 - x - 1);
      if (ww < 2) continue;
      box(g, x, y, ww, 13, STONE[[3, 2, 3, 4][(k + r * 2) % 4]]); box(g, x, y, ww, 1, STONE[5]); box(g, x, y + 12, ww, 1, STONE[1]);
    }
  }
  litter(g, m - road, m + road, h, 8);
  litter(g, 0, w, h, 4);
  // (soot and ash blown down the street from the tower)
  for (let i = 0; i < 220; i++) box(g, hash(i * 1.9) * w, hash(i * 3.7) * h, 1, 1, i % 3 ? COBBLE[0] : COBBLE[5]);
};

// ---------------------------------------------------------------------------------------------------------------
// What's along the curbs and hung off the walls (all of it nearer than the walls, farther than the junk in the road):
// the town's gas lamps, and each shop's sign hung out over the sidewalk

const LAMPS = { plain: lampProp('', PPM), wifi: lampProp('FREE WI-FI', PPM), usb: lampProp('USB PORT', PPM) };
const BLADES = { l: LEFT_SIDE.map(s => bladeProp(s, -1, PPM)), r: RIGHT_SIDE.map(s => bladeProp(s, 1, PPM)) };
const LAYOUT = { l: layoutOf(LEFT_SIDE), r: layoutOf(RIGHT_SIDE) };

type Item = { d: number; x: number; p: Prop; up: number; lamp: boolean };
const furnitureOf = (travel: number) => {
  const items: Item[] = [];
  for (const side of [-1, 1]) {
    // (the lamps, both sides, staggered; which lamp it is keyed to its place along the street, never the screen)
    const off = side < 0 ? 0 : LAMP_GAP / 2;
    for (let k = Math.ceil((1.5 - travel - off) / LAMP_GAP); ; k++) {
      const d = k * LAMP_GAP + off + travel;
      if (d > 300) break;
      const n = ((k % 7) + 7) % 7;
      items.push({ d, x: ME_X + side * LAMP_X, p: side < 0 && n === 2 ? LAMPS.wifi : side > 0 && n === 5 ? LAMPS.usb : LAMPS.plain, up: 0, lamp: true });
    }
    // (each shop's sign, out from the wall near its near end; where along its side's strip it is, as the walls have it)
    const lay = side < 0 ? LAYOUT.l : LAYOUT.r, slots = side < 0 ? LEFT_SIDE : RIGHT_SIDE, len = lay.len / PPM, list = side < 0 ? BLADES.l : BLADES.r;
    slots.forEach((_, i) => {
      const a = lay.at[i] / PPM, e = (i + 1 < slots.length ? lay.at[i + 1] : lay.len) / PPM;
      const u = side < 0 ? a + 1.4 : e - 1.4;
      const z0 = side < 0 ? u : -u;
      for (let n = Math.ceil((1.2 - travel - z0) / len); ; n++) {
        const d = z0 + n * len + travel;
        if (d > D_END) break;
        items.push({ d, x: (side < 0 ? XL : XR) - side * (list[i].w / 2), p: list[i], up: 3.7, lamp: false });
      }
    });
  }
  return items.sort((a, b) => b.d - a.d);
};
/** Those of them `from` to `to` m off, far to near. */
const drawFurniture = (c: Ctx, items: Item[], sway: number, from: number, to: number) => {
  const glow = timeOfDay().lamps, lu = lanternUp(PPM);
  for (const { d, x, p, up, lamp } of items) {
    if (d <= from || d > to) continue;
    const { sx, sy, s } = project(x, d, sway);
    const pw = p.w * s, ph = p.h * s;
    if (sx + pw / 2 < -2 || sx - pw / 2 > 400 + 2 || pw < 1) continue;
    // (the signs going round the last corner: stippled out over the last few meters, not gone in a blink)
    const fade = up ? Math.min(1, (D_END - d) / 8) : 1;
    if (fade < 1) c.globalAlpha = fade > 0.5 ? 0.66 : 0.33;
    c.drawImage(spriteOf(DONNIE_DRACULA, p, fogAt(d)), Math.round(sx - pw / 2), Math.round(sy - s * up - ph), Math.max(1, Math.round(pw)), Math.max(1, Math.round(ph)));
    c.globalAlpha = 1;
    // (the lamp's glow after dark: dim, stepped, two rings)
    if (lamp && glow > 0.05 && d < 30) for (let r = 2; r >= 1; r--) { c.fillStyle = `rgba(255, 210, 122, ${(0.05 * glow * (3 - r)).toFixed(3)})`; c.beginPath(); c.arc(Math.round(sx), Math.round(sy - s * lu), s * 0.5 * r, 0, Math.PI * 2); c.fill(); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The far end of the street: the town's sky and skyline, the square, and the wrecked ELEVATOR TO HELL in it

/** The tower's scale (picture px a unit of the town's tower) and its lean (px across per px up). */
const TS = 0.23, LEAN = 0.12;

const back = (c: Ctx, t: number, sway: number) => {
  const travel = SPEED * t;
  drawTownSky(c, t, sway * 4, { moonX: 322, sunX: 262 });
  // (what's along the street past its end, in the square: behind the tower)
  const items = furnitureOf(travel);
  drawFurniture(c, items, sway, D_END, 400);
  // The tower, in the square at the street's far end: first its glow (the hole at its foot: red, dim, stepped)
  const tx = Math.round(VP_X + sway + (F * ME_X) / D_END), ty = HOR + Math.round((F * CAM_H) / D_END);
  const glow = 0.7 + 0.3 * Math.sin(t * 0.07);
  for (let i = 3; i >= 1; i--) { c.fillStyle = `rgba(220, 38, 38, ${(0.04 * (4 - i) * glow).toFixed(3)})`; c.beginPath(); c.ellipse(tx, ty - 2, 10 + i * 7, 3 + i * 3, 0, 0, Math.PI * 2); c.fill(); }
  // (leaning over to the right, off its footing)
  const at = drawTowerWrecked(c, tx, ty, TS, LEAN);
  // (the cable: snapped at the top of the torn track, hanging off loose, swinging)
  const [cx, cy] = at(74, TOWER_TOP + 108), sw = Math.sin(t * 0.03) * 2;
  c.strokeStyle = '#71717A'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx, cy); c.quadraticCurveTo(cx + 3 + sw, cy + 10, cx + 2 + sw * 1.5, cy + 22); c.stroke();
  // (now and then, another car sent down what's left of the track: it drops into the hole, a flash of red)
  const u = t % 420;
  if (u < 36) {
    const [x0, y0] = at(55, TOWER_TOP + 150), [, y1] = at(55, -20);
    const y = y0 + (u / 36) ** 2 * (y1 - y0), x = x0 + ((y - y0) / Math.max(1, y1 - y0)) * (at(55, -20)[0] - x0);
    box(c, x - 1, y - 1, 7, 6, INK); box(c, x, y, 5, 4, '#7F1D1D'); box(c, x + 1, y + 1, 3, 1, '#FDE68A');
  } else if (u < 48) { c.fillStyle = `rgba(253, 186, 116, ${(0.4 * (1 - (u - 36) / 12)).toFixed(2)})`; c.beginPath(); c.ellipse(tx + 12, ty - 2, 8, 3, 0, 0, Math.PI * 2); c.fill(); }
  // (the smoke: thin, low, blown off to the right, clear of the face; a wisp off the break; a tongue of fire at its foot)
  smoke(c, tx + 8, ty - 2, 2.2, t, 4, { n: 6, rise: 0.02, drift: 0.1, size: 0.5, col: ['#3A2224', '#4A3036', '#4E3A42', '#54424A'] });
  const [bx, by] = at(20, TOWER_TOP + 28);
  smoke(c, bx, by, 1.6, t, 9, { n: 4, rise: 0.018, drift: 0.12, size: 0.4, col: ['#3A3040', '#463A4A', '#4E4252'] });
  fire(c, tx - 2, ty, 4, t, 3);
  // (the heat off the hole: rows rippling, just round its foot)
  wobble(c, tx - 14, ty - 14, 28, 16, t, 1);
  // The street: its shopfronts down both sides to the square, then what's along the curbs and hung off the walls
  drawStreetWalls(c, DONNIE_DRACULA, 'dw', { vp: VP_X, sway, xl: XL, xr: XR, ppm: PPM, dMin: 0, dMax: D_END, along: d => d - travel });
  drawFurniture(c, items, sway, 0, D_END);
};

// ---------------------------------------------------------------------------------------------------------------
// In the road: the junk out of the gift shop and the ballroom

const paintFork = (g: Ctx, w: number, h: number) => {
  // (a souvenir pitchfork, dropped)
  g.save(); g.translate(w / 2, h / 2); g.rotate(-0.3);
  box(g, -w / 2, -1, w, 3, INK); box(g, -w / 2 + 1, 0, w - 2, 1, '#991B1B');
  for (const ty of [-4, 0, 4]) box(g, w / 2 - 6, ty - 1, 6, 2, '#D4D4D8');
  g.restore();
};
const paintShirt = (g: Ctx, w: number, h: number) => {
  // (an I SURVIVED HELL tee, trodden on)
  g.fillStyle = INK; g.beginPath(); g.moveTo(0, h * 0.2); g.lineTo(w * 0.3, 0); g.lineTo(w * 0.7, 0); g.lineTo(w, h * 0.2); g.lineTo(w * 0.85, h * 0.4); g.lineTo(w * 0.8, h); g.lineTo(w * 0.2, h); g.lineTo(w * 0.15, h * 0.4); g.closePath(); g.fill();
  g.fillStyle = '#18181B'; g.beginPath(); g.moveTo(1, h * 0.2); g.lineTo(w * 0.3, 1); g.lineTo(w * 0.7, 1); g.lineTo(w - 1, h * 0.2); g.lineTo(w * 0.84, h * 0.4); g.lineTo(w * 0.79, h - 1); g.lineTo(w * 0.21, h - 1); g.lineTo(w * 0.16, h * 0.4); g.closePath(); g.fill();
  box(g, w * 0.3, h * 0.4, w * 0.4, h * 0.15, '#DC2626'); box(g, w * 0.35, h * 0.6, w * 0.3, 2, '#FDE047');
};
const paintGlobe = (g: Ctx, w: number, h: number) => {
  // (a snow globe, cracked, its glitter spilled)
  box(g, w * 0.2, h * 0.7, w * 0.6, h * 0.3, INK); box(g, w * 0.22, h * 0.72, w * 0.56, h * 0.24, '#7F1D1D');
  lump(g, w / 2, h * 0.45, w * 0.3, h * 0.3, ['#3B82F6', '#7DD3FC', '#BAE6FD', '#E0F2FE', '#FFFFFF']);
  box(g, w * 0.45, h * 0.25, 1, h * 0.3, INK);
  for (let i = 0; i < 6; i++) box(g, hash(i) * w, h - 2 - hash(i + 4) * 3, 1, 1, '#F97316');
};
const paintTag = (g: Ctx, w: number, h: number) => {
  // (HELLO MY NAME IS DONNIE, peeled off, on the cobbles)
  box(g, 0, 0, w, h, INK); box(g, 1, 1, w - 2, h - 2, '#FFFFFF'); box(g, 1, 1, w - 2, h * 0.35, '#DC2626');
  if (h >= 8) { g.font = `${Math.max(4, Math.round(h * 0.4))}px "Press Start 2P"`; g.fillStyle = '#111827'; g.textAlign = 'center'; g.fillText('DONNIE', w / 2, h - 2); g.textAlign = 'left'; }
};
const paintAsh = (g: Ctx, w: number, h: number) => {
  g.fillStyle = INK; g.beginPath(); g.ellipse(w / 2, h, w / 2, h * 0.8, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#57534E'; g.beginPath(); g.ellipse(w / 2, h, w / 2 - 1, h * 0.7, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#1A1C26'; g.beginPath(); g.ellipse(w * 0.55, h * 0.4, w * 0.2, h * 0.18, 0.2, 0, Math.PI * 2); g.fill();
  box(g, w * 0.5, h * 0.3, w * 0.25, 1, '#7C8AA8');
};


const props = (weakness: boolean): Prop[] => {
  const out: Prop[] = [];
  // Donnie's tag; his ash, if it was the little statue that did for him
  out.push({ id: 'dw-tag', x: 1.4, z: 3.4, w: 0.7, h: 0.4, ppm: 40, paint: paintTag });
  if (weakness) out.push({ id: 'dw-ash', x: -1.6, z: 5.5, w: 1.2, h: 0.5, ppm: 32, paint: paintAsh, live: (c, sx, sy, s, t) => smoke(c, sx, sy - s * 0.3, s, t, 2, { n: 4, size: 0.3, rise: 0.02, col: ['#57534E', '#78716C', '#A8A29E'] }) });
  // The junk, strewn the whole way (in the road: in from the lamps, so nothing in it's ever over one nearer)
  for (let i = 0; i < 12; i++) {
    const side = i % 2 ? 1 : -1, x = ME_X + side * (0.9 + hash(i * 3.3) * 2), z = 3 + hash(i * 7.1) * 28, k = i % 3;
    if (k === 0) out.push({ id: 'dw-fork', x, z, w: 1, h: 0.3, ppm: 32, paint: paintFork, wrap: true });
    else if (k === 1) out.push({ id: 'dw-shirt', x, z, w: 0.7, h: 0.5, ppm: 32, paint: paintShirt, wrap: true });
    else out.push({ id: 'dw-globe', x, z, w: 0.4, h: 0.45, ppm: 40, paint: paintGlobe, wrap: true });
  }
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// His new toy: the SOUL SUCKER, side on, pointing +x: a haunted-house shop vac (purple, a ghost decal), its hose out
// front to a wide nozzle, a meat grinder bolted on where the bag goes, the gore bag hanging under it

const soulSucker = (c: Ctx, t: number) => {
  const sl = Math.sin(t * 0.1) * 1;
  c.fillStyle = INK; c.beginPath(); c.ellipse(-14, 10 + sl, 8, 6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#7F1D1D'; c.beginPath(); c.ellipse(-14, 10 + sl, 7, 5, 0, 0, Math.PI * 2); c.fill();
  box(c, -17, 7 + sl, 3, 2, '#B91C1C');
  box(c, -24, -9, 26, 16, INK); box(c, -23, -8, 24, 14, '#6D28D9'); box(c, -23, -8, 24, 3, '#8B5CF6'); box(c, -23, 3, 24, 3, '#4C1D95');
  box(c, -14, -4, 6, 6, '#F8FAFC'); box(c, -13, -2, 1, 1, INK); box(c, -11, -2, 1, 1, INK);
  box(c, -20, -15, 10, 7, '#71717A'); box(c, -19, -14, 8, 5, '#A1A1AA');
  const a = t * 0.2; box(c, -15 + Math.cos(a) * 5, -17 + Math.sin(a) * 3, 2, 2, '#3F3F46');
  c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(2, 0); c.quadraticCurveTo(14, 6, 22, -1); c.stroke();
  c.strokeStyle = '#52525B'; c.lineWidth = 3; c.stroke();
  box(c, 22, -6, 10, 10, INK); box(c, 23, -5, 8, 8, '#A1A1AA'); box(c, 30, -7, 3, 12, '#3F3F46');
};



export const DONNIE_DRACULA: SceneDef = {
  land: 'SPOOKY LAND',
  weapon: 'SOUL_SUCKER',
  blurb: ['SUCK THEM IN AND GRIND THEM UP. TOO BIG? IT DRINKS THEM DRY.', 'THEN HOSE THEIR BUDDIES DOWN WITH WHAT YOU GOT.'],
  sky: ['#0E0A1E', '#1A1230', '#261A40', '#33224E', '#3E2A58', '#4A3262', '#563A6C'],
  haze: '#2A2240',
  ground, back, props,
  drawWeapon: soulSucker,
  grip: [[-12, -12], [20, 2]],
  rim: '#DC2626',
  embers: ['#FECACA', '#F87171', '#DC2626', '#991B1B'],
  // (no heat over the whole street: its walls stay straight; the tower's hole ripples on its own, in back())
  ripple: false,
};
