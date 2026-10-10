// The walk into Adventure Land (portalWalk.ts): out of the portal and up the jungle path toward the bamboo gate (the
// carved board: ADVENTURE LAND, A REAL JUNGLE!), the jungle closing in either side, the canopy over the top, light
// coming down through the gaps in shafts, by whatever hour it is (timeOfDay.ts): the morning's gold-green, the sun low
// and red through the gap at the end of the path by sundown, moonbeams and fireflies after dark; a morpho by day.

import { type Ctx, type Prop, type PortalDef, INK, LW, HOR, box, hash, stipple, mix } from './kit';
import { timeOfDay, hourMix, sunAt, drawStars, drawMoon } from '../timeOfDay';
import { noteSun } from '../sunFlare';
import { gateSign } from '../adventure/jungle/art/props';
import { SIGNS } from '../adventure/jungle/layout';
import { LEAF, BARK, MOSS, EARTH, clump, fern, bigLeaf, bark, roots } from '../adventure/jungle/art/paint';

/** The jungle's own world pixels a meter, here (him: 70 px in the game; 2.4 m in this picture). */
const PPM = 29;
const GATE = SIGNS.find(s => s[4] === 'gate')!;
/** Where the gate is when he sets off (m). */
const GATE_Z = 17.5;

// ---------------------------------------------------------------------------------------------------------------
// The ground: loam, leaf litter, the path packed hard down the middle, roots across it

const ground = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, EARTH[3]);
  // (leaf litter: flecks of green, brown, rust)
  for (let i = 0; i < 1400; i++) box(g, hash(i * 1.37) * w, hash(i * 2.91) * h, 1 + (i % 4 === 0 ? 1 : 0), 1, [EARTH[2], EARTH[4], '#5A4A1C', '#3A4A18', '#6A3A18', EARTH[5]][i % 6]);
  // (low plants either side of the path: fronds lying over, clumps of moss)
  for (let i = 0; i < 90; i++) {
    const x = hash(i * 3.1) * w, y = hash(i * 7.7) * h;
    if (Math.abs(x - w / 2) < 30) continue;
    g.fillStyle = [LEAF[1], LEAF[2], MOSS[1]][i % 3];
    g.beginPath(); g.ellipse(x, y, 5 + hash(i) * 10, 3 + hash(i + 9) * 6, 0, 0, Math.PI * 2); g.fill();
    for (let k = 0; k < 5; k++) box(g, x - 7 + k * 3, y - 2 + (k % 2) * 3, 3, 1, LEAF[3]);
  }
  // The path: packed dirt, lighter, its edges ragged, the worn middle lighter still
  box(g, w / 2 - 22, 0, 44, h, '#7A5E3E');
  box(g, w / 2 - 10, 0, 20, h, '#8A6C48');
  for (let y = 0; y < h; y += 2) { box(g, w / 2 - 25 + hash(y) * 4, y, 4, 2, EARTH[4]); box(g, w / 2 + 21 + hash(y + 5) * 4, y, 4, 2, EARTH[4]); }
  for (let i = 0; i < 200; i++) box(g, w / 2 - 20 + hash(i * 5.3) * 40, hash(i * 9.1) * h, 1, 1, i % 3 ? '#9C7C54' : '#5E4630');
  // (footprints, boots and bare: the cast going to work)
  for (let i = 0; i < 26; i++) { const x = w / 2 - 12 + (i % 2) * 14 + hash(i) * 4, y = hash(i * 4.4) * h; box(g, x, y, 4, 6, '#6A4E32'); box(g, x + 1, y + 7, 2, 2, '#6A4E32'); }
  // Roots across it, lit along the top
  for (let i = 0; i < 4; i++) {
    const y = Math.round(hash(i * 13) * h), x0 = w / 2 - 50 - hash(i) * 30, x1 = w / 2 + 50 + hash(i + 2) * 30;
    for (let x = x0; x < x1; x += 2) { const yy = y + Math.round(Math.sin(x * 0.08 + i) * 2); box(g, x, yy, 2, 3, BARK[2]); box(g, x, yy, 2, 1, BARK[4]); }
  }
  // (puddles in the ruts, the sky in them)
  for (let i = 0; i < 3; i++) { const x = w / 2 - 14 + hash(i * 7) * 20, y = hash(i * 17) * h; g.fillStyle = '#2E3A2A'; g.beginPath(); g.ellipse(x, y, 7, 3, 0, 0, Math.PI * 2); g.fill(); box(g, x - 3, y - 1, 4, 1, '#6E8A74'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The far jungle (a wall of it, the hour's colors), the sky through the gap at the end of the path, the canopy over

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  const H = (day: string, sundown: string, night: string) => hourMix(day, sundown, night, tod);
  drawStars(c, 120, 0, 160, HOR - 10, t, 0, tod, 1);
  drawMoon(c, 236, 34, 6, tod);
  // The sun, through the gap at the end of the path: up over the canopy by day (glimpsed), low and red in the gap by
  // sundown (the lens catches it then: sunFlare.ts)
  const sp = sunAt(214 + sway * 0.1, -30, HOR - 4, tod);
  if (sp.up > 0.02) {
    const [gr, gg, gb] = [1, 3, 5].map(i => parseInt(tod.sunGlow.slice(i, i + 2), 16));
    c.save(); c.globalAlpha = sp.up;
    for (let i = 5; i >= 1; i--) { c.fillStyle = `rgba(${gr}, ${gg}, ${gb}, ${0.05 + (5 - i) * 0.03})`; c.beginPath(); c.arc(sp.x, sp.y, 12 + i * 7, 0, Math.PI * 2); c.fill(); }
    const disc = [mix(tod.sun, '#FFFFFF', 0.7), mix(tod.sun, '#FFFFFF', 0.3), tod.sun, mix(tod.sun, tod.sunGlow, 0.5)];
    for (let i = 0; i < disc.length; i++) { c.save(); c.beginPath(); c.rect(sp.x - 14, sp.y - 14 + i * 7, 28, 7); c.clip(); c.fillStyle = disc[i]; c.beginPath(); c.arc(sp.x, sp.y, 12, 0, Math.PI * 2); c.fill(); c.restore(); }
    c.restore();
  }
  // (low: in the open gap, its glare and the lens's ghosts; high, it's behind the leaves: a glimmer)
  const low = sp.y > 20;
  noteSun(c, sp.x, sp.y, low ? 1 : 0.35, low ? 0.8 : 0, 0.5);
  // The far jungle: three walls of it, each nearer one darker and taller, a gap in the middle where the path goes
  const walls: [string, number, number][] = [
    [H('#6C8E7A', '#7A4A5E', '#1A2238'), 18, 0.09],
    [H('#4A6E4A', '#4E2E44', '#121A2C'), 30, 0.16],
    [H('#2E4E2C', '#2E1C2E', '#0A1020'), 44, 0.28],
  ];
  walls.forEach(([col, hgt, par], wi) => {
    const jx = sway * par * 3;
    c.fillStyle = col;
    c.beginPath(); c.moveTo(0, HOR + 2);
    for (let x = 0; x <= LW; x += 2) {
      const gap = Math.max(0, 1 - Math.abs(x - 200 - jx) / (40 + wi * 26));
      const top = hgt * (1 - gap * 0.85) + 6 * Math.abs(Math.sin((x + jx) * (0.05 + wi * 0.02) + wi)) + 4 * Math.abs(Math.sin((x + jx) * 0.017 + wi * 2));
      c.lineTo(x, HOR - Math.round(top));
    }
    c.lineTo(LW, HOR + 2); c.fill();
    // (their tops lit, a palm or two sticking up)
    const lit = mix(col, H('#B8D890', '#F2995A', '#3A4A74'), 0.35);
    for (let x = 0; x < LW; x += 3) if (Math.abs(x - 200 - jx) > 50 + wi * 30 && hash(x * 0.37 + wi) > 0.6) box(c, x, HOR - hgt - 4 + Math.round(4 * Math.sin(x * 0.2)), 2, 1, lit);
    for (let i = 0; i < 4; i++) {
      const px = Math.round(((i * 97 + wi * 41) % LW) + jx);
      if (Math.abs(px - 200) < 60 + wi * 30) continue;
      const top = HOR - hgt - 14 - (i % 2) * 6;
      c.strokeStyle = col; c.lineWidth = 1;
      c.beginPath(); c.moveTo(px, HOR - hgt + 4); c.lineTo(px + 1, top); c.stroke();
      for (const [dx, dy] of [[-7, 3], [7, 3], [-5, -2], [5, -2], [0, -4]]) { c.beginPath(); c.moveTo(px + 1, top); c.quadraticCurveTo(px + 1 + dx * 0.6, top - 3, px + 1 + dx, top + dy); c.stroke(); }
    }
  });
  // (mist lying in the gap, banded)
  const mist = mix(tod.haze, '#FFFFFF', 0.25);
  for (let i = 0; i < 3; i++) { c.fillStyle = stipple(c, mist, i % 2); c.fillRect(110 - i * 20, HOR - 8 + i * 3, 180 + i * 40, 2); }
  // The canopy: a ceiling of leaves across the top, hanging lower toward the sides, the gap over the path
  const leaf = [H(LEAF[0], '#140A16', '#03060C'), H(LEAF[1], '#22122A', '#060C18'), H(LEAF[2], '#3A1E34', '#0C1424'), H(LEAF[3], '#5A2E3E', '#16203A')];
  for (let layer = 0; layer < 3; layer++) {
    const jx = sway * (0.6 + layer * 0.4);
    c.fillStyle = leaf[layer];
    c.beginPath(); c.moveTo(0, 0);
    for (let x = 0; x <= LW; x += 2) {
      const dx = (x - 200 - jx) / 200;
      const drop = 6 + dx * dx * (60 - layer * 14) + 5 * Math.abs(Math.sin((x + jx) * 0.11 + layer * 2)) + 3 * Math.sin((x + jx) * 0.31 + layer + t * 0.01);
      c.lineTo(x, Math.round(drop - layer * 4));
    }
    c.lineTo(LW, 0); c.fill();
  }
  // (leaf edges along its underside catching the light from the gap)
  for (let x = 0; x < LW; x += 3) {
    const dx = (x - 200 - sway) / 200, y = Math.round(6 + dx * dx * 32 + 5 * Math.abs(Math.sin((x + sway) * 0.11 + 4)) - 8);
    if (hash(x * 0.71) > 0.45) box(c, x, y, 2, 1, leaf[3]);
  }
  // Vines hanging down out of it, swaying
  for (let i = 0; i < 9; i++) {
    const vx = ((i * 53 + 17) % LW), dx = (vx - 200) / 200;
    if (Math.abs(dx) < 0.18) continue;
    const top = Math.round(4 + dx * dx * 40), len = 20 + hash(i * 3.3) * 34;
    const swy = Math.sin(t * 0.02 + i) * 2;
    for (let y = 0; y < len; y += 2) { const xx = Math.round(vx + sway * 0.8 + swy * (y / len)); box(c, xx, top + y, 1, 2, leaf[1]); if (y % 8 === 4) box(c, xx - 1, top + y, 3, 1, leaf[2]); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Along the way: the trees either side (trunks, buttress roots, crowns up into the canopy), ferns and elephant ears at
// the path's edges, the gate ahead

const paintTree = (seed: number) => (g: Ctx, w: number, h: number) => {
  const tw = Math.round(w * (0.24 + hash(seed) * 0.08)), tx = Math.round(w / 2 - tw / 2), foot = h - 2;
  // (vines up it)
  bark(g, tx, h * 0.12, foot - 20, tw, seed);
  roots(g, tx, tw, foot, seed);
  for (let i = 0; i < 3; i++) { const vx = tx + 3 + hash(seed + i) * (tw - 6); for (let y = h * 0.2; y < foot - 30; y += 3) box(g, vx + Math.sin(y * 0.1 + i) * 2, y, 2, 3, MOSS[2 + (i % 2)]); }
  // (the crown, up into the canopy: lumps of it, the lower ones lit from under by the path's light)
  clump(g, w / 2, h * 0.1, w * 0.48, h * 0.1, seed + 3);
  clump(g, w * 0.3, h * 0.2, w * 0.3, h * 0.07, seed + 5, LEAF, 1);
  clump(g, w * 0.7, h * 0.17, w * 0.3, h * 0.07, seed + 7, LEAF, 1);
  // (a limb out over the path, a fern on it)
  if (hash(seed * 2.2) > 0.4) { const ly = h * 0.36; box(g, tx - w * 0.3, ly, w * 0.3 + 4, 6, BARK[3]); box(g, tx - w * 0.3, ly, w * 0.3 + 4, 2, BARK[5]); fern(g, tx - w * 0.18, ly, 18, seed + 9); }
};
const paintFern = (seed: number) => (g: Ctx, w: number, h: number) => fern(g, w / 2, h - 1, h * 0.95, seed, (hash(seed) - 0.5) * 0.3);
const paintEars = (seed: number) => (g: Ctx, w: number, h: number) => {
  for (let i = 0; i < 4; i++) bigLeaf(g, w / 2 + (i - 1.5) * w * 0.12, h - 2, h * (0.3 + hash(seed + i) * 0.12), -Math.PI / 2 + (i - 1.5) * 0.55, LEAF, 3);
};
const paintBush = (seed: number) => (g: Ctx, w: number, h: number) => clump(g, w / 2, h * 0.55, w * 0.48, h * 0.44, seed);
const paintGate = (g: Ctx, w: number, h: number) => gateSign(g, w / 2, h - 3, GATE[2], GATE[3]);

const props = (): Prop[] => {
  const out: Prop[] = [
    // (the gate: its posts either side of the path, the board hung over it)
    { id: 'pw-adv-gate', x: 0, z: GATE_Z, w: 300 / PPM, h: 200 / PPM, ppm: PPM, paint: paintGate },
  ];
  // The trees, either side, all the way up (the near ones framing it, going by out of the edges as he walks)
  const trees: [number, number][] = [[-4.2, 2.6], [4.6, 3.4], [-5.6, 7], [5.2, 8.6], [-4.6, 12.5], [6, 14], [-7.5, 18.5], [7, 20], [-5.4, 24], [5.6, 27], [-8, 31], [8, 34]];
  trees.forEach(([x, z], i) => out.push({ id: `pw-adv-tree${i % 5}`, x, z, w: 3.6, h: 13, ppm: 18, paint: paintTree(i % 5 + 1) }));
  // Ferns, elephant ears and bushes along the path's edges
  for (let i = 0; i < 18; i++) {
    const side = i % 2 ? 1 : -1, z = 1.8 + i * 1.6 + hash(i) * 0.8, x = side * (1.7 + hash(i * 3.1) * 1.2);
    const kind = i % 3;
    if (Math.abs(z - GATE_Z) < 0.8 && Math.abs(x) < 4) continue;
    out.push(kind === 0
      ? { id: `pw-adv-fern${i % 4}`, x, z, w: 1.6, h: 1.2, ppm: PPM, paint: paintFern(i % 4) }
      : kind === 1
        ? { id: `pw-adv-ears${i % 3}`, x: x + side * 0.4, z, w: 2, h: 1.7, ppm: PPM, paint: paintEars(i % 3) }
        : { id: `pw-adv-bush${i % 3}`, x: x + side * 0.8, z, w: 2.4, h: 1.6, ppm: 24, paint: paintBush(i % 3 + 11) });
  }
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// Over it all: the light coming down in shafts through the gaps (added, the SNES's color math), motes in them;
// fireflies after dark; a morpho going over by day

const front = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  const night = Math.min(1, tod.lamps * 1.4), day = 1 - night;
  const col = night > 0.5 ? '#6E8CC8' : tod.sunGlow;
  const [r, g, b] = [1, 3, 5].map(i => parseInt(col.slice(i, i + 2), 16));
  c.save();
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    const x0 = 70 + i * 66 + hash(i * 3.3) * 20 + sway * 0.7, wd = 8 + hash(i * 7.7) * 12, slant = -0.32;
    const k = (0.05 + 0.03 * Math.sin(t * 0.013 + i * 2)) * (0.45 + 0.55 * day);
    c.fillStyle = `rgba(${r}, ${g}, ${b}, ${k.toFixed(3)})`;
    const len = 150 + hash(i) * 50;
    c.beginPath(); c.moveTo(x0, 6); c.lineTo(x0 + wd, 6); c.lineTo(x0 + wd + slant * len * -1, 6 + len); c.lineTo(x0 + slant * len * -1, 6 + len); c.closePath(); c.fill();
    // (its core, stippled)
    c.globalAlpha = k * 0.9; c.fillStyle = stipple(c, col, i % 2);
    c.beginPath(); c.moveTo(x0 + wd * 0.3, 6); c.lineTo(x0 + wd * 0.7, 6); c.lineTo(x0 + wd * 0.7 - slant * len, 6 + len); c.lineTo(x0 + wd * 0.3 - slant * len, 6 + len); c.closePath(); c.fill();
    c.globalAlpha = 1;
    // (motes drifting in it)
    for (let m = 0; m < 3; m++) {
      const u = ((t * (0.003 + hash(i + m) * 0.002) + hash(i * 9 + m)) % 1), my = 10 + u * (len - 10);
      if ((t + m * 31 + i * 13) % 100 < 80) box(c, x0 + wd * hash(m + i * 2) - slant * my + Math.sin(t * 0.04 + m) * 2, 6 + my, 1, 1, `rgba(${r}, ${g}, ${b}, 0.6)`);
    }
  }
  c.restore();
  // Fireflies, after dark
  if (night > 0.05) for (let i = 0; i < 14; i++) {
    const fx = (hash(i * 4.1) * LW + Math.sin(t * 0.013 + i) * 14 + sway) % LW, fy = HOR - 10 + hash(i * 2.3) * 90 + Math.sin(t * 0.021 + i * 2) * 6;
    const on = (t + i * 37) % 120 < 50;
    if (!on) continue;
    c.fillStyle = `rgba(214, 255, 120, ${(0.5 * night).toFixed(2)})`; c.fillRect(Math.round(fx) - 1, Math.round(fy) - 1, 3, 3);
    box(c, fx, fy, 1, 1, '#F4FFB0');
  }
  // A morpho, by day: blue, flapping across over the path
  if (day > 0.5) {
    const u = (t % 420) / 420, mx = -10 + u * (LW + 20), my = 70 + Math.sin(u * 9) * 14 + Math.sin(t * 0.1) * 3;
    const flap = (t >> 2) % 2;
    box(c, mx - (flap ? 3 : 2), my - (flap ? 2 : 0), flap ? 3 : 2, flap ? 3 : 2, '#3B82F6');
    box(c, mx + 1, my - (flap ? 2 : 0), flap ? 3 : 2, flap ? 3 : 2, '#60A5FA');
    box(c, mx, my, 1, 2, INK);
  }
};

export const INTO_ADVENTURE: PortalDef = {
  land: 'ADVENTURE LAND',
  lines: ['ANCIENT RUINS. HOSTILE WILDLIFE. SIGN THE WAIVER.', 'FIRST STOP: THE JUNGLE.'],
  haze: '#5E7A5A',
  ground, back, props, front,
  rim: () => hourMix('#E8F0A0', '#F59E0B', '#8AA4E0'),
};
