// The walk-away from Donnie Dracula (Spooky Land's boss): out of the castle and down the gothic town's street toward
// the camera at whatever hour it is now (timeOfDay.ts: its look was painted for night, and goes by day and dusk too),
// the wrecked ELEVATOR TO HELL clock tower behind him: leaning, its support beams snapped, the clock face cracked and
// stopped, the cable snapped and hanging, smoke and a hellish red glow coming up out of the hole at its foot (and now
// and then another elevator car, still being sent, dropping into it). The town's gabled rooftops either side, gas
// lamps along the street. In the foreground, a little of the ballroom's carnage: gift-shop junk strewn about, a dropped
// HELLO MY NAME IS DONNIE sticker; killed by his weakness, a trail of his ash and the cheap wig.
// His new toy: the SOUL SUCKER.

import { type Ctx, type Prop, type SceneDef, INK, LW, HOR, ME_X, box, hash, lump, rampOf, stipple, smoke, fire } from './kit';
import { timeOfDay, hourMix, drawStars, drawMoon } from '../timeOfDay';

const STONE = rampOf('#5A5266');
const ROOF = rampOf('#2E2638');
const LAMP = '#FDE68A';

// ---------------------------------------------------------------------------------------------------------------
// The ground: wet cobbles, the street down the middle, puddles catching the light, junk

const ground = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, '#2A2438');
  // (the cobbles, every one: rows staggered, a dark seam round each, a lit edge)
  for (let y = 0; y < h; y += 8) for (let x = ((y / 8) % 2) * 6; x < w; x += 12) {
    const tone = ['#3A3350', '#443C5C', '#352E48'][(x * 7 + y) % 3];
    box(g, x + 1, y + 1, 10, 6, tone); box(g, x + 1, y + 1, 10, 1, '#5A5272');
  }
  // (the street's gutters either side of the middle)
  box(g, w / 2 - 34, 0, 3, h, '#1C1828'); box(g, w / 2 + 31, 0, 3, h, '#1C1828');
  // (puddles, the sky in them)
  for (let i = 0; i < 10; i++) {
    const x = hash(i * 5.3) * w, y = hash(i * 8.7) * h;
    g.fillStyle = '#1E1B33'; g.beginPath(); g.ellipse(x, y, 10 + hash(i) * 14, 3 + hash(i + 3) * 3, 0, 0, Math.PI * 2); g.fill();
    box(g, x - 4, y - 1, 8, 1, '#6E66A0');
  }
  // (soot and ash, blown down from the tower)
  for (let i = 0; i < 260; i++) box(g, hash(i * 1.9) * w, hash(i * 3.7) * h, 1, 1, i % 3 ? '#1A1626' : '#6B6478');
};

// ---------------------------------------------------------------------------------------------------------------
// The far off: the sky's furniture, the rooftops, the wrecked clock tower

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  const H = (day: string, dusk: string, night: string) => hourMix(day, dusk, night, tod);
  drawStars(c, 0, 0, LW, HOR - 10, t, 0, tod, 1);
  drawMoon(c, 70, 22, 9, tod);
  // (low cloud, drifting)
  for (let i = 0; i < 5; i++) {
    const x = ((i * 113 - t * 0.05) % (LW + 160) + LW + 160) % (LW + 160) - 120;
    c.fillStyle = H('#C8C4D8', '#5A3A5A', '#2A2440'); c.beginPath(); c.roundRect(Math.round(x), 18 + (i % 3) * 9, 70 + (i % 2) * 40, 5, 2.5); c.fill();
  }
  const tx = 312 + sway * 0.12;
  // The clock tower: its glow first (the hole at its foot, red, pulsing, stepped)
  const glow = 0.7 + 0.3 * Math.sin(t * 0.07);
  for (let i = 4; i >= 1; i--) { c.fillStyle = `rgba(220, 38, 38, ${(0.06 * (5 - i) * glow).toFixed(3)})`; c.beginPath(); c.ellipse(tx, HOR - 4, 22 + i * 14, 8 + i * 8, 0, 0, Math.PI * 2); c.fill(); }
  // (leaning: over to the right, off its footing)
  c.save(); c.translate(tx, HOR - 2); c.rotate(0.14); c.scale(0.62, 0.62);
  const towerCol = H('#4A4258', '#2E2238', '#1A1426'), towerLit = H('#6A6278', '#4A2E48', '#2A2238');
  box(c, -14, -112, 28, 112, INK); box(c, -13, -111, 26, 110, towerCol); box(c, -13, -111, 4, 110, towerLit);
  // (its windows, one lit, one blown out)
  box(c, -4, -70, 8, 10, INK); box(c, -3, -69, 6, 8, '#3B0A0A'); box(c, -4, -44, 8, 10, INK); box(c, -3, -43, 6, 8, LAMP);
  // (the spire, cracked off at the top, hanging)
  c.fillStyle = INK; c.beginPath(); c.moveTo(-16, -112); c.lineTo(0, -138); c.lineTo(9, -124); c.lineTo(16, -112); c.closePath(); c.fill();
  c.fillStyle = ROOF[2]; c.beginPath(); c.moveTo(-14, -113); c.lineTo(-1, -134); c.lineTo(7, -123); c.lineTo(14, -113); c.closePath(); c.fill();
  c.save(); c.translate(9, -124); c.rotate(0.9); box(c, -2, -12, 4, 12, ROOF[1]); c.restore();
  // (the clock face: cracked across, the hands stopped, one hanging)
  c.fillStyle = INK; c.beginPath(); c.arc(0, -94, 10, 0, Math.PI * 2); c.fill();
  c.fillStyle = H('#E8DCAA', '#C8A870', '#8A7A58'); c.beginPath(); c.arc(0, -94, 9, 0, Math.PI * 2); c.fill();
  c.strokeStyle = INK; c.lineWidth = 1;
  c.beginPath(); c.moveTo(-8, -99); c.lineTo(-2, -95); c.lineTo(1, -98); c.lineTo(7, -90); c.stroke();
  c.beginPath(); c.moveTo(0, -94); c.lineTo(-4, -99); c.stroke();
  c.beginPath(); c.moveTo(0, -94); c.lineTo(1, -86); c.stroke();
  // (the support beams: out its side like a ribcage, snapped, splintered ends)
  for (const [y, len, snap] of [[-80, 22, 0.5], [-60, 26, -0.4], [-36, 24, 0.7], [-16, 28, -0.6]] as const) {
    for (const sd of [-1, 1]) {
      c.save(); c.translate(sd * 13, y); c.rotate(sd * (0.6 + snap * 0.3));
      box(c, sd > 0 ? 0 : -len / 2, -2, len / 2, 4, INK); box(c, sd > 0 ? 1 : -len / 2 + 1, -1, len / 2 - 2, 2, '#78350F');
      box(c, sd > 0 ? len / 2 - 1 : -len / 2 - 2, -3, 3, 2, '#A16207');
      c.restore();
    }
  }
  // (the car's track up its front: the cable snapped at the top, hanging off loose, swinging)
  box(c, 15, -108, 3, 108, '#3F3F46');
  const sw = Math.sin(t * 0.03) * 4;
  c.strokeStyle = '#71717A'; c.lineWidth = 1; c.beginPath(); c.moveTo(16, -110); c.quadraticCurveTo(24 + sw, -80, 20 + sw * 1.6, -58); c.stroke();
  c.restore();
  // (now and then, another car sent down: it drops into the hole, a flash of red)
  const u = t % 420;
  if (u < 40) {
    const y = HOR - 74 + (u / 40) ** 2 * 72;
    box(c, tx + 14, y - 7, 8, 7, INK); box(c, tx + 15, y - 6, 6, 5, '#7C2D12'); box(c, tx + 16, y - 5, 4, 2, LAMP);
  } else if (u < 52) { c.fillStyle = `rgba(253, 186, 116, ${(0.6 * (1 - (u - 40) / 12)).toFixed(2)})`; c.beginPath(); c.ellipse(tx + 14, HOR - 6, 16, 6, 0, 0, Math.PI * 2); c.fill(); }
  // (the smoke up off the hole, and a tongue of fire in it)
  smoke(c, tx, HOR - 6, 7, t, 4, { n: 9, rise: 0.06, drift: 0.02, size: 2.2, col: ['#3A2224', '#4A3036', '#5A4248', '#6E5A62'] });
  fire(c, tx, HOR - 2, 8, t, 3);
  // The town either side: gabled rooftops, chimneys, a lit window or two (far, dim)
  const roofs = H('#3A3448', '#24182E', '#100C1A'), lit = H('#8A8098', LAMP, LAMP);
  const town = (x0: number, x1: number, seed: number) => {
    for (let x = x0; x < x1; x += 22) {
      const k = hash(x * 0.37 + seed), hgt = 18 + Math.round(k * 22);
      c.fillStyle = roofs; c.beginPath(); c.moveTo(x, HOR); c.lineTo(x, HOR - hgt); c.lineTo(x + 11, HOR - hgt - 12); c.lineTo(x + 22, HOR - hgt); c.lineTo(x + 22, HOR); c.closePath(); c.fill();
      if (k > 0.5) box(c, x + 15, HOR - hgt - 14, 3, 8, roofs);
      if (k > 0.35) box(c, x + 8, HOR - hgt + 6, 4, 5, (Math.floor(t / 90 + x) % 7) ? lit : roofs);
    }
  };
  town(-10 + sway * 0.3, 270, 1); town(350 + sway * 0.3, LW + 20, 2);
};

// ---------------------------------------------------------------------------------------------------------------
// Along the street: gas lamps, house fronts, the junk out of the gift shop and the ballroom

const paintLamp = (g: Ctx, w: number, h: number) => {
  box(g, w / 2 - 2, h * 0.18, 4, h * 0.82, INK); box(g, w / 2 - 1, h * 0.18, 2, h * 0.82, '#3F3F46');
  box(g, w / 2 - 6, h - 4, 12, 4, INK);
  box(g, w / 2 - 6, h * 0.06, 12, h * 0.13, INK); box(g, w / 2 - 5, h * 0.07, 10, h * 0.11, LAMP);
  box(g, w / 2 - 7, h * 0.04, 14, 3, INK);
};
const paintHouse = (seed: number) => (g: Ctx, w: number, h: number) => {
  const wall = STONE[1 + (seed % 2)];
  box(g, 0, h * 0.3, w, h * 0.7, INK); box(g, 1, h * 0.3 + 1, w - 2, h * 0.7 - 1, wall);
  g.fillStyle = INK; g.beginPath(); g.moveTo(-2, h * 0.32); g.lineTo(w / 2, 0); g.lineTo(w + 2, h * 0.32); g.closePath(); g.fill();
  g.fillStyle = ROOF[2]; g.beginPath(); g.moveTo(1, h * 0.31); g.lineTo(w / 2, 3); g.lineTo(w - 1, h * 0.31); g.closePath(); g.fill();
  for (let i = 0; i < 2; i++) { box(g, w * (0.18 + i * 0.44), h * 0.45, w * 0.2, h * 0.16, INK); box(g, w * (0.18 + i * 0.44) + 1, h * 0.45 + 1, w * 0.2 - 2, h * 0.16 - 2, (seed + i) % 3 ? '#2A2438' : LAMP); }
  box(g, w * 0.4, h * 0.72, w * 0.2, h * 0.28, INK); box(g, w * 0.4 + 1, h * 0.72 + 1, w * 0.2 - 2, h * 0.28 - 1, '#3B1A0A');
};
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
  // The houses along the street, both sides, and the gas lamps in front of them
  for (let i = 0; i < 7; i++) {
    out.push({ id: `dw-house-l${i % 3}`, x: -9, z: 5 + i * 5, w: 5, h: 6, ppm: 16, paint: paintHouse(i % 3) });
    // (the right side's houses kept near: the tower's over there, past them, in sight)
    if (i < 4) out.push({ id: `dw-house-r${(i + 1) % 3}`, x: 14, z: 7 + i * 5, w: 5, h: 6, ppm: 16, paint: paintHouse((i + 1) % 3) });
    out.push({ id: 'dw-lamp', x: i % 2 ? 3.6 : -3.6, z: 3 + i * 4.5, w: 0.8, h: 3.4, ppm: 20, paint: paintLamp, live: (c, sx, sy, s) => { c.fillStyle = 'rgba(253, 230, 138, 0.10)'; c.beginPath(); c.arc(sx, sy - s * 3.1, s * 1.1, 0, Math.PI * 2); c.fill(); } });
  }
  // The junk, and Donnie's tag; his ash and wig, if it was the little statue that did for him
  out.push({ id: 'dw-tag', x: 1.4, z: 3.4, w: 0.7, h: 0.4, ppm: 40, paint: paintTag });
  if (weakness) out.push({ id: 'dw-ash', x: -1.6, z: 5.5, w: 1.2, h: 0.5, ppm: 32, paint: paintAsh, live: (c, sx, sy, s, t) => smoke(c, sx, sy - s * 0.3, s, t, 2, { n: 4, size: 0.3, rise: 0.02, col: ['#57534E', '#78716C', '#A8A29E'] }) });
  for (let i = 0; i < 12; i++) {
    const side = i % 2 ? 1 : -1, x = ME_X + side * (1.2 + hash(i * 3.3) * 4), z = 3 + hash(i * 7.1) * 28, k = i % 3;
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

void stipple;

export const DONNIE_DRACULA: SceneDef = {
  land: 'SPOOKY LAND',
  weapon: 'SOUL_SUCKER',
  blurb: ['HOLD TO SUCK THEM IN AND GRIND THEM UP. TOO BIG? IT BLEEDS THEM DRY.', "THE BAG FILLS WITH GORE. SPRAY IT BACK OUT ALL OVER WHOEVER'S NEXT."],
  sky: ['#0E0A1E', '#1A1230', '#261A40', '#33224E', '#3E2A58', '#4A3262', '#563A6C'],
  haze: '#2A2240',
  ground, back, props,
  drawWeapon: soulSucker,
  grip: [[-12, -12], [20, 2]],
  rim: '#DC2626',
  embers: ['#FECACA', '#F87171', '#DC2626', '#991B1B'],
};
