// The walk into Hollywood Land (portalWalk.ts): out of the portal and up the cheap imitation of Hollywood Blvd, painted
// by the boulevard's own painting brought into the picture. The Walk of Fame underfoot (charcoal terrazzo in squares,
// coral stars rimmed in brass for nobodies, two rows of them either side of the path, gum and grime). Along both sides,
// the boulevard's plywood fronts as he'll find them (blvd/fronts.ts: SOUVENIRS SOUVENIRS, the WAX MUSEUM-ISH, OSCAR-ISH
// GIFTS and the rest), its palms (ringed trunks, their skirts, the fans), Stuntman Steve's yellow standees by the way.
// Far off at the end of it, the boulevard's far off (blvd/far.ts): the mountains, the HAPPYWOOD hill on its foothills
// (its letters, the fallen O, the mast blinking), the city in the haze; searchlights sweeping after dark. The sky by
// whatever hour it is (timeOfDay.ts).

import { type Ctx, type Prop, type PortalDef, HOR, LW, box, hash, mix } from './kit';
import { farStrip } from './farStrip';
import { timeOfDay, hourMix } from '../timeOfDay';
import { FAR, paintMountains, paintFoothills, paintCity, paintPalms, drawHill } from '../hollywood/blvd/far';
import { FRONTS, paintFront } from '../hollywood/blvd/fronts';
import { paintPalm, paintStandee } from '../hollywood/blvd/props';
import { CHAR, CORAL, BRASS, checker, fameStar } from '../hollywood/blvd/kit';

const SW = LW + 40;

// ---------------------------------------------------------------------------------------------------------------
// The ground: the Walk of Fame (charcoal terrazzo squares; coral stars rimmed in brass down both sides of the path)

const ground = (g: Ctx, w: number, h: number) => {
  const C = CHAR;
  box(g, 0, 0, w, h, C[2]);
  // (the squares: each its own tone of the charcoal, the seams dark with a lit lip)
  for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) {
    const t = hash(x * 0.37 + y * 1.13);
    box(g, x, y, 32, 32, C[t > 0.66 ? 3 : t > 0.25 ? 2 : 1]);
    box(g, x, y, 32, 1, C[0]); box(g, x, y, 1, 32, C[0]); box(g, x + 1, y + 1, 31, 1, C[4]);
  }
  // (the terrazzo's chips)
  for (let i = 0; i < 1400; i++) box(g, hash(i * 1.7) * w, hash(i * 2.3) * h, 1, 1, i % 3 ? C[4] : i % 2 ? C[5] : C[0]);
  // (the stars, for nobodies: a coral square, the brass-rimmed star in it, a brass name strip under)
  for (let y = 0; y < h; y += 64) for (const x of [w / 2 - 72, w / 2 + 40]) {
    box(g, x, y + 2, 32, 30, CORAL[2]); box(g, x, y + 2, 32, 1, CORAL[4]); box(g, x, y + 31, 32, 1, CORAL[1]);
    checker(g, x, y + 2, 32, 30, CORAL[3], 0, 1);
    fameStar(g, x + 16, y + 15, 11);
    box(g, x + 6, y + 24, 20, 3, BRASS[2]); box(g, x + 6, y + 24, 20, 1, BRASS[4]);
    for (let k = 0; k < 5; k++) box(g, x + 8 + k * 4, y + 25, 2, 1, BRASS[1]);
  }
  // (gum, grime)
  for (let i = 0; i < 40; i++) { const x = hash(i * 9.1) * w, y = hash(i * 4.3) * h; box(g, x, y, 2, 2, C[0]); box(g, x, y, 1, 1, C[4]); }
};

// ---------------------------------------------------------------------------------------------------------------
// The far off: the boulevard's own, at half its size; searchlights

const FAR_H = 120;
const paintFar = (g: Ctx) => {
  const tod = timeOfDay(), base = FAR_H * 4, tiles = [0, FAR.TW, FAR.TW * 2];
  g.save(); g.scale(0.5, 0.5);
  for (const ox of tiles) { g.save(); g.translate(ox - 300, base - FAR.MH - 26); paintMountains(g, tod); g.restore(); }
  // (the HAPPYWOOD hill at the far end of the boulevard, over the path)
  drawHill(g, (200 + 20) * 4, base - 34, 0);
  for (const ox of tiles) { g.save(); g.translate(ox - 140, base - FAR.FH + 4); paintFoothills(g, tod); g.restore(); }
  for (const ox of tiles) { g.save(); g.translate(ox - 520, base - FAR.CH + 26); paintCity(g, tod); g.restore(); }
  for (const ox of [0, FAR.PW, FAR.PW * 2]) { g.save(); g.translate(ox - 400, base - FAR.PH + 52); paintPalms(g, tod); g.restore(); }
  g.restore();
};

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  // (searchlights after dark, sweeping up off the lot: stepped beams)
  if (tod.lamps > 0.2) for (const k of [-1, 1]) {
    const a = Math.sin(t * 0.01 + k) * 0.5 + k * 0.2, bx = 200 + Math.round(sway * 0.3) + k * 60;
    for (const [w, al] of [[12, 0.1], [7, 0.16], [3, 0.24]] as const) {
      c.fillStyle = `rgba(254, 249, 195, ${al})`; c.beginPath();
      c.moveTo(bx - 1, HOR); c.lineTo(bx + Math.sin(a) * 130 - w, HOR - Math.cos(a) * 130); c.lineTo(bx + Math.sin(a) * 130 + w, HOR - Math.cos(a) * 130); c.lineTo(bx + 1, HOR); c.closePath(); c.fill();
    }
  }
  c.drawImage(farStrip('pw-hw-far', SW, FAR_H, paintFar), -20 + Math.round(sway * 0.3), HOR + 4 - FAR_H);
};

// ---------------------------------------------------------------------------------------------------------------
// Along the way: the boulevard's palms, its fronts, Steve's standees

const palm = (seed: number) => (g: Ctx, w: number, h: number) => {
  const ph = 250, s = h / (ph + 70);
  g.save(); g.translate(w / 2, h - 1); g.scale(s, s); paintPalm(g, ph, seed); g.restore();
};
const front = (k: number) => (g: Ctx, w: number, h: number) => {
  const f = FRONTS[k], s = w / (f.w + 80);
  g.save(); g.translate(40 * s, h - 1); g.scale(s, s); paintFront(g, f); g.restore();
};
const standee = (g: Ctx, w: number, h: number) => {
  const s = h / 134;
  g.save(); g.translate(w / 2 - 2 * s, h - 2); g.scale(s, s); paintStandee(g); g.restore();
};

/** The boulevard's px a meter (him: 70 px; ~1.8 m). */
const PPM = 38;
const props = (): Prop[] => {
  const out: Prop[] = [];
  for (let i = 0; i < 10; i++) { const side = i % 2 ? 1 : -1; out.push({ id: `pw-hw-palm${i % 3}`, x: side * 3.4, z: 2 + i * 2.6, w: 3.4, h: 8.4, ppm: 16, paint: palm(i % 3) }); }
  const picks = [0, 1, 2, 4, 5, 7];
  picks.forEach((fi, k) => {
    const f = FRONTS[fi];
    out.push({ id: `pw-hw-front${fi}`, x: (k % 2 ? 1 : -1) * (6.4 + (f.w + 80) / PPM / 2), z: 3 + k * 4, w: (f.w + 80) / PPM, h: (f.h + 82) / PPM, ppm: 22, paint: front(fi) });
  });
  for (let k = 0; k < 3; k++) out.push({ id: 'pw-hw-steve', x: (k % 2 ? -1 : 1) * 2.4, z: 5 + k * 7, w: 1, h: 2.1, ppm: 40, paint: standee });
  return out;
};

export const INTO_HOLLYWOOD: PortalDef = {
  land: 'HOLLYWOOD LAND',
  lines: ['THE MAGIC OF THE MOVIES. MOSTLY PLYWOOD.', 'SEE STUNTMAN STEVE! (HE WAS IN A MOVIE.)'],
  haze: '#FDE68A',
  ground, back, props,
  rim: () => hourMix('#FEF3C7', '#F59E0B', '#FDE68A'),
};

void mix;
