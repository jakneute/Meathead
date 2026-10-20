// The walk into Spooky Land (portalWalk.ts): out of the portal and across the cobbles toward the town's gate (the
// town's own: its stone pillars and their urns, the iron arch, WELCOME TO SPOOKY LAND), its iron railings running off
// either side, the town's gas lamps along the way (FREE WI-FI), a few old graves and dead trees out in the dark either
// side; through the gate, the town's street (its purple-stucco shopfronts down both sides, as he'll find them), and over
// the far end of it the ELEVATOR TO HELL's clock tower, as it is in the town (the ride going up it and dropping). The
// sky the town's, by whatever hour it is (timeOfDay.ts). It's all the town's painting brought into the picture
// (walkAway/spookyTown.ts), the town's px PPM to a meter.

import { type Ctx, type Prop, type PortalDef, HOR, box, hash } from './kit';
import { timeOfDay, hourMix } from '../timeOfDay';
import { drawTeaseStrip } from './teases';
import { INK, STONE, IRON, mix, drawTownSky, drawTowerIntact, lampProp, gateProp, shopProp, cobbles, litter } from './spookyTown';

/** The town's px a meter here (him: 70 of them in the town; a touch over 2 m in this picture). */
const PPM = 36;
/** Where the gate is when he sets off (m). */
const GATE_Z = 17.5;
/** The town square through the gate: its shopfronts round it facing him (SHOPS' indexes, across from his path (m)),
 *  how far past the gate they stand, the gap where the street goes on (the tower over the end of it). */
const SQUARE: [number, number][] = [[1, -19.4], [2, -9.2], [0, -3.2], [4, 12.6], [3, 23]];
const SQUARE_Z = GATE_Z + 9;

// ---------------------------------------------------------------------------------------------------------------
// The ground: the town's cobbles right across, a worn lane up the middle, puddles and dead leaves

const ground = (g: Ctx, w: number, h: number) => {
  cobbles(g, 0, w, h, 7);
  // (the lane up the middle: worn smoother and paler, where everyone walks)
  for (let y = 0; y < h; y += 2) for (let x = w / 2 - 20; x < w / 2 + 20; x += 2) if (hash(x * 0.71 + y * 1.3) > (Math.abs(x - w / 2) < 12 ? 0.55 : 0.8)) box(g, x, y, 2, 1, mix(STONE[4], STONE[3], 0.5));
  litter(g, 0, w, h, 10);
};

// ---------------------------------------------------------------------------------------------------------------
// The far off and the street: the town's sky and skyline, the tower over it, the street's walls through the gate

const back = (c: Ctx, t: number, sway: number) => {
  drawTownSky(c, t, sway * 3, {
    moonX: 128, sunX: 96, skylineY: HOR + 18,
    // (the tower: far off over the town's roofs, over the gap in the square where the street goes on; the ride going
    // up it and dropping)
    under: () => { drawTeaseStrip(c, 'spooky', 'near', sway); drawTowerIntact(c, Math.round(222 + sway * 0.4), HOR + 2, 0.19, t); },
    // (out past the hills, the neighbors: the Wilderness's real Rockies, Cartoon Land's water tower; then over the roofs
    // the land's own: Dracula's OTHER castle off to the left)
    beyond: () => drawTeaseStrip(c, 'spooky', 'far', sway),
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Along the way: the town's lamps, its gate, the iron railings off either side of it; old graves and dead trees out
// past the lamps

/** A run of railing (one stone pier and the iron to the next): the pier at its left end (or its right: `side`). */
const paintRailing = (side: number) => (g: Ctx, w: number, h: number) => {
  const px = side < 0 ? w - 30 : 0, foot = h - 1;
  // (the iron: bars with spear tips, two rails, a scroll between each pair)
  const x0 = side < 0 ? 0 : 30, x1 = side < 0 ? w - 30 : w;
  for (let x = x0 + 4; x < x1 - 2; x += 10) {
    box(g, x - 1, foot - 92, 4, 92, INK); box(g, x, foot - 92, 2, 92, IRON[3]); box(g, x, foot - 92, 1, 92, IRON[5]);
    g.fillStyle = INK; g.beginPath(); g.moveTo(x - 3, foot - 92); g.lineTo(x + 1, foot - 104); g.lineTo(x + 5, foot - 92); g.fill();
    g.fillStyle = IRON[4]; g.beginPath(); g.moveTo(x - 1, foot - 93); g.lineTo(x + 1, foot - 101); g.lineTo(x + 2, foot - 93); g.fill();
  }
  for (const y of [foot - 80, foot - 20]) { box(g, x0, y - 1, x1 - x0, 5, INK); box(g, x0, y, x1 - x0, 3, IRON[3]); box(g, x0, y, x1 - x0, 1, IRON[5]); }
  for (let x = x0 + 9; x < x1 - 8; x += 20) { g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(x, foot - 70, 5, 0, Math.PI * 2); g.stroke(); }
  // (the pier: dressed stone in courses, a cap, an urn on it)
  box(g, px - 1, foot - 121, 32, 122, INK);
  for (let y = foot - 120, r = 0; y < foot; y += 15, r++) { box(g, px, y, 30, 14, STONE[r % 2 ? 3 : 4]); box(g, px, y, 30, 1, STONE[5]); box(g, px + (r % 2 ? 9 : 19), y, 1, 14, STONE[1]); }
  box(g, px, foot - 120, 5, 120, STONE[5]); box(g, px + 25, foot - 120, 5, 120, STONE[2]);
  box(g, px - 4, foot - 128, 38, 9, INK); box(g, px - 3, foot - 127, 36, 7, STONE[4]); box(g, px - 3, foot - 127, 36, 2, STONE[6]);
  g.fillStyle = INK; g.beginPath(); g.ellipse(px + 15, foot - 140, 11, 13, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = STONE[4]; g.beginPath(); g.ellipse(px + 15, foot - 140, 9, 11, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = STONE[5]; g.beginPath(); g.ellipse(px + 12, foot - 143, 4, 5, 0, 0, Math.PI * 2); g.fill();
  box(g, px + 11, foot - 156, 8, 5, STONE[3]);
  // (grime up the foot of it)
  g.fillStyle = 'rgba(10, 8, 18, 0.35)'; g.fillRect(0, foot - 10, w, 10);
};

/** An old grave: a headstone (round-topped, or a cross), leaning, moss up its foot, a lit edge; a mound of earth. */
const paintGrave = (seed: number) => (g: Ctx, w: number, h: number) => {
  const foot = h - 4, cross = seed % 3 === 2, lean = (hash(seed) - 0.5) * 0.25;
  g.save(); g.translate(w / 2, foot); g.rotate(lean);
  if (cross) {
    box(g, -5, -h + 9, 10, h - 9, INK); box(g, -4, -h + 10, 8, h - 10, STONE[3]); box(g, -4, -h + 10, 2, h - 10, STONE[5]);
    box(g, -15, -h + 20, 30, 10, INK); box(g, -14, -h + 21, 28, 8, STONE[3]); box(g, -14, -h + 21, 28, 2, STONE[5]);
  } else {
    const sw = w * 0.36, top = -h + 10 + sw;
    g.fillStyle = INK; g.beginPath(); g.moveTo(-sw - 1, 0); g.lineTo(-sw - 1, top); g.arc(0, top, sw + 1, Math.PI, 0); g.lineTo(sw + 1, 0); g.fill();
    g.fillStyle = STONE[3]; g.beginPath(); g.moveTo(-sw, 0); g.lineTo(-sw, top); g.arc(0, top, sw, Math.PI, 0); g.lineTo(sw, 0); g.fill();
    box(g, -sw, top, 3, -top, STONE[5]); box(g, sw - 4, top, 4, -top, STONE[2]);
    // (its lettering, worn: R.I.P., a line or two)
    box(g, -6, top + 2, 2, 6, STONE[1]); box(g, -2, top + 2, 2, 6, STONE[1]); box(g, 3, top + 2, 2, 6, STONE[1]);
    for (let k = 0; k < 2; k++) box(g, -sw + 6, top + 14 + k * 6, sw * 2 - 12, 2, STONE[2]);
  }
  for (let x = -14; x < 14; x += 2) box(g, x, -4 - Math.round(hash(seed + x) * 5), 2, 5, hash(x + seed) > 0.5 ? '#2E4A1E' : '#3E5A26');
  g.restore();
  g.fillStyle = '#1A1420'; g.beginPath(); g.ellipse(w / 2, foot + 1, w * 0.48, 4, 0, Math.PI, 0); g.fill();
};

/** A dead tree: a black trunk, crooked limbs up into the dark. */
const paintDeadTree = (seed: number) => (g: Ctx, w: number, h: number) => {
  const col = hourMix('#241C2C', '#1E1420', '#0C0A12'), lit = hourMix('#3A2E44', '#2E1E2C', '#18141E');
  const limb = (x: number, y: number, a: number, len: number, wd: number, k: number) => {
    let px = x, py = y;
    for (let s = 0; s < len; s += 2) {
      px += Math.cos(a) * 2; py += Math.sin(a) * 2; a += (hash(seed + k * 7 + s) - 0.5) * 0.5;
      const ww = Math.max(1, Math.round(wd * (1 - s / len)));
      box(g, px - ww / 2, py, ww, 2, col); if (ww > 2) box(g, px - ww / 2, py, 1, 2, lit);
      if (k < 2 && s > len * 0.35 && hash(seed + s * 3 + k) > 0.86) limb(px, py, a + (hash(s + k) > 0.5 ? 0.8 : -0.8), len * 0.45, ww * 0.7, k + 1);
    }
  };
  limb(w / 2, h, -Math.PI / 2, h * 0.75, 10, 0);
  limb(w / 2, h - h * 0.4, -Math.PI / 2 - 0.7, h * 0.4, 5, 1);
  limb(w / 2, h - h * 0.5, -Math.PI / 2 + 0.6, h * 0.35, 4, 1);
};

const props = (): Prop[] => {
  const out: Prop[] = [gateProp(PPM, GATE_Z)];
  // (the square through it: the town's shopfronts round it)
  for (const [i, x] of SQUARE) out.push(shopProp(i, PPM, 12, x, SQUARE_Z + (i === 0 ? 1.5 : 0)));
  // (its railings, running off either side of it)
  for (const side of [-1, 1]) for (let k = 0; k < 4; k++) {
    const w = 134 / PPM;
    out.push({ id: `pw-spk-rail${side}`, x: side * (4.55 + w / 2 + k * w), z: GATE_Z + 0.05, w, h: 160 / PPM, ppm: 22, paint: paintRailing(side) });
  }
  // The town's lamps: up the way, either side, staggered (FREE WI-FI on one), and on up the street past the gate
  for (let i = 0; i < 4; i++) { const side = i % 2 ? 1 : -1; out.push(lampProp(i === 2 ? 'FREE WI-FI' : '', PPM, side * 3.4, 3 + i * 3.6, true)); }
  for (let i = 0; i < 2; i++) { const side = i % 2 ? -1 : 1; out.push(lampProp(i === 1 ? 'USB PORT' : '', PPM, side * 3.9 + 1, GATE_Z + 3 + i * 3.5, true)); }
  // Out past the lamps: old graves, dead trees (keyed to which they are)
  for (let i = 0; i < 12; i++) {
    const side = i % 2 ? 1 : -1, z = 1.5 + i * 1.25 + hash(i) * 0.6;
    if (z > GATE_Z - 1) continue;
    out.push({ id: `pw-spk-grave${i % 4}`, x: side * (5.2 + hash(i * 3.3) * 4), z, w: 1.1, h: 1.5, ppm: 30, paint: paintGrave(i % 4) });
  }
  for (const [x, z, k] of [[-8.5, 6, 0], [9.5, 10, 1], [-11, 14, 2], [7.4, 3.2, 3]] as const) out.push({ id: `pw-spk-tree${k}`, x, z, w: 4, h: 6, ppm: 16, paint: paintDeadTree(k + 1) });
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// Over it all: the mist lying low on the cobbles (stippled, drifting), a bat or two flapping over after sundown

const front = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  const mist = mix(tod.haze, '#C8C4D8', 0.3);
  for (let i = 0; i < 4; i++) {
    const y = HOR + 6 + i * 5, x0 = Math.round(((t * (0.06 + i * 0.02) + i * 90) % 140) - 140 + sway);
    for (let x = x0; x < 400; x += 140) { c.fillStyle = mist; c.globalAlpha = 0.12 - i * 0.02; c.fillRect(x, y, 100, 2); c.fillRect(x + 20, y + 2, 60, 1); }
  }
  c.globalAlpha = 1;
  if (tod.lamps > 0.2) for (let i = 0; i < 3; i++) {
    const u = ((t + i * 170) % 520) / 520, bx = Math.round(-10 + u * 420), by = Math.round(26 + i * 9 + Math.sin(u * 14 + i) * 6);
    const flap = ((t >> 2) + i) % 2;
    box(c, bx - 1, by, 3, 2, INK);
    box(c, bx - 4, by - (flap ? 2 : -1), 3, 1, INK); box(c, bx + 2, by - (flap ? 2 : -1), 3, 1, INK);
  }
};

export const INTO_SPOOKY: PortalDef = {
  land: 'SPOOKY LAND',
  lines: ['A HAUNTED CASTLE. THE GHOSTS ARE UNIONIZED.', 'FIRST STOP: THE TOWN SQUARE.'],
  haze: '#2A2240',
  ground, back, props, front,
  rim: () => hourMix('#C8BEE0', '#F59E0B', '#FDE68A'),
};
