// What's out past the hills round the loop (orbit.ts puts it between the hills and the near ridge): the park, each piece
// a sprite stood on a ring round the clearing and put through the loop's one camera (proj), so it comes round with the
// hills as he walks and keeps its own direction: back the way he came, the Jungle Cruise (the queue house's thatch, the
// boathouse, the lookout); the other lands on the horizon (the Great Pixie's castle in Fairy Land, the World Showcase's
// castle on its hill, SPACE NEEDLE 2 and the GIANT ATOM past them: parkFar.ts); the dino park's water tower and the
// monorail's beam (its train going by, live). Each sprite's painted once an hour (its feet hidden behind the near
// ridge) and culled by where it lands on screen. No volcanoes.

import { CANVAS_WIDTH } from '../../../m1/constants';
import { timeOfDay, farTint, skyAt, type TimeOfDay } from '../../timeOfDay';
import { mix } from '../../intro/art/kit';
import { farCruise, farWaterTower, farMonorailBeam, drawMonorail } from '../teases';
import { farMark, type FarMark } from '../../parkFar';
import { proj, polar, depth, F, DC, type View } from './orbit';

type Ctx = CanvasRenderingContext2D;

/** The ring they stand on (between the hills, 4200, and the near ridge, 3000); the scale they're painted at. */
// (K0 worked out when it's first wanted: orbit.ts and this import each other)
const RING = 3600;
const K0 = () => F / (DC + RING);
const SW = 300, SH = 230, FOOT = 186;

interface Piece { a: number; paint: (g: Ctx, tod: TimeOfDay) => void; train?: boolean }
const T = (tod: TimeOfDay, k: number) => (c: string) => mix(farTint(c, 1, tod), skyAt(0.88, tod), k);
const mark = (id: FarMark, h: number, dy = 0) => (g: Ctx, tod: TimeOfDay) => farMark(g, id, SW / 2, FOOT - dy, h, 0.5, tod);
const PIECES: Piece[] = [
  { a: 1.0, paint: (g, tod) => farCruise(g, SW / 2 + 20, FOOT, T(tod, 0.32), tod.lamps) },
  { a: 1.7, paint: mark('fairyCastle', 150) },
  { a: 2.4, paint: mark('showcase', 120, 4) },
  { a: 3.7, paint: mark('needle', 132) },
  { a: 4.2, paint: mark('atom', 80, 6) },
  { a: 3.04, paint: (g, tod) => { farMonorailBeam(g, 0, SW, FOOT - 84, FOOT + 40, T(tod, 0.3), 110); farWaterTower(g, SW / 2 + 40, FOOT - 6, T(tod, 0.3), tod.lamps); }, train: true },
];

const sprites = new Map<string, HTMLCanvasElement>();
const spriteOf = (i: number, tod: TimeOfDay) => {
  const key = `${i}|${tod.key}`;
  let cv = sprites.get(key);
  if (!cv) {
    if (sprites.size > 40) sprites.clear();
    cv = document.createElement('canvas'); cv.width = SW; cv.height = SH;
    const g = cv.getContext('2d')!; g.imageSmoothingEnabled = false;
    PIECES[i].paint(g, tod);
    sprites.set(key, cv);
  }
  return cv;
};

/** The park round the loop, far side only (anything at the near side's behind the camera, or under the strip). */
export const drawParkRing = (c: Ctx, v: View, f: number) => {
  if (typeof document === 'undefined') return;
  const tod = timeOfDay();
  PIECES.forEach((pc, i) => {
    const p = polar(RING, pc.a);
    if (depth(v, p.x, p.z) < DC + RING * 0.3) return;
    const b = proj(v, p.x, 0, p.z), s = b.k / K0();
    const w = SW * s, h = SH * s;
    // (culled by where it lands on screen, its whole width either side)
    if (b.x + w / 2 < 0 || b.x - w / 2 > CANVAS_WIDTH) return;
    const x = Math.round(b.x - (SW / 2) * s), y = Math.round(b.y - (FOOT + 40) * s);
    c.save(); c.imageSmoothingEnabled = false;
    c.drawImage(spriteOf(i, tod), x, y, Math.round(w), Math.round(h));
    if (pc.train) {
      c.beginPath(); c.rect(x, y, w, h); c.clip();
      c.translate(x, y); c.scale(s, s);
      drawMonorail(c, ((f * 0.5) % (SW + 160)), FOOT - 84, T(tod, 0.3), tod.lamps);
    }
    c.restore();
  });
};
