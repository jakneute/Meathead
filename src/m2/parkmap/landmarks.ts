// The park map's landmarks: each attraction as a little illustrated building or ride, the brochure's three-quarter
// view, every material a ramp (paint.ts). Each is drawn about its foot's middle (x, y) on the paper.

import { type Ctx, R, px, hl, vl, dith, line, ell, block, windows, spire, flag, tree, ramp, mix } from './paint';

type Art = (g: Ctx, x: number, y: number) => void;

/** A ride's support (a little steel or wood leg). */
const leg = (g: Ctx, x: number, y0: number, y1: number, col = '#6B7280') => vl(g, x, Math.min(y0, y1), Math.abs(y1 - y0), col);
/** A track or a rail: a run of points, a lit line over a dark one. */
const track = (g: Ctx, pts: [number, number][], col: string, under = '#1F2937') => {
  for (let i = 1; i < pts.length; i++) line(g, pts[i - 1][0], pts[i - 1][1] + 1, pts[i][0], pts[i][1] + 1, under);
  for (let i = 1; i < pts.length; i++) line(g, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], col);
};
/** A little striped tent or awning roof. */
const tent = (g: Ctx, cx: number, y: number, w: number, h: number, a: string, b: string) => {
  for (let j = 0; j < h; j++) {
    const hw = Math.round((w / 2) * ((j + 1) / h));
    for (let i = -hw; i <= hw; i++) px(g, cx + i, y - h + j, (Math.floor((i + 40) / 3) % 2 ? a : b));
  }
  hl(g, cx - w / 2, y, w + 1, mix(a, '#000000', 0.5));
};
/** A ring of seats or a carousel seen from above-front: an ellipse disk with posts. */
const carousel = (g: Ctx, x: number, y: number, r: number, a: string, b: string) => {
  ell(g, x, y, r, r * 0.45, ramp('#E5E7EB'));
  for (let k = 0; k < 6; k++) { const ang = (k / 6) * Math.PI * 2; vl(g, Math.round(x + Math.cos(ang) * r * 0.8), Math.round(y + Math.sin(ang) * r * 0.35) - 6, 6, '#D4A017'); }
  tent(g, x, y - 6, r * 2, 6, a, b);
  vl(g, x, y - 16, 4, '#D4A017'); px(g, x, y - 17, b);
};
const person = (g: Ctx, x: number, y: number, col: string) => { px(g, x, y - 3, '#F2C29A'); vl(g, x, y - 2, 2, col); };

export const LANDMARKS: Record<string, Art> = {
  // ---- Jungle Land
  jungleTrail: (g, x, y) => {
    for (let k = 0; k < 9; k++) tree(g, x - 18 + ((k * 13) % 36), y - 10 + ((k * 7) % 16), k % 3 ? 'palm' : 'round', 1 + (k % 2) * 0.3);
    // (a rope bridge and a monkey in it)
    track(g, [[x - 12, y - 4], [x, y - 1], [x + 12, y - 4]], '#C8A26A', '#5A3A1E'); px(g, x + 2, y - 3, '#6A4220'); px(g, x + 3, y - 4, '#6A4220');
  },
  cruise: (g, x, y) => {
    // (the dock: a thatched boathouse, and the AFRICAN QUEASY tied up)
    block(g, x - 10, y, 16, 6, 7, '#8A6A3A', '#C9A44A');
    for (let i = 0; i < 16; i += 2) px(g, x - 10 + i, y - 13, '#7A5A22');
    R(g, x - 8, y + 4, 22, 4, '#F2E6C8'); hl(g, x - 8, y + 7, 22, '#8A6A3A'); hl(g, x - 9, y + 3, 24, '#1C1917');
    tent(g, x + 3, y + 3, 16, 3, '#16A34A', '#F5F5F4'); vl(g, x - 4, y, 3, '#5A3A1E'); vl(g, x + 10, y, 3, '#5A3A1E');
  },
  dino: (g, x, y) => {
    // (the paddock fence, a brontosaurus over it, a little volcano (fiberglass) behind)
    spire(g, x + 12, y - 6, 22, 14, '#7A5A4A'); R(g, x + 10, y - 21, 4, 2, '#F97316'); px(g, x + 11, y - 23, '#FDE047');
    const D = ramp('#4D7C0F');
    R(g, x - 10, y - 9, 14, 6, D.base); hl(g, x - 10, y - 9, 14, D.lit); hl(g, x - 10, y - 4, 14, D.shade);
    line(g, x + 3, y - 8, x + 9, y - 18, D.base, 2); R(g, x + 8, y - 20, 4, 2, D.base); px(g, x + 11, y - 20, '#000000');
    line(g, x - 10, y - 6, x - 17, y - 3, D.base, 2);
    for (const lx of [-8, -5, 0, 2]) vl(g, x + lx, y - 3, 3, D.shade);
    for (let i = -18; i <= 18; i += 3) vl(g, x + i, y - 2, 4, '#78716C'); hl(g, x - 18, y - 1, 37, '#A8A29E'); hl(g, x - 18, y + 1, 37, '#57534E');
  },
  temple: (g, x, y) => {
    // (a stepped pyramid, a jaguar's mouth for a door, vines on it)
    const S = ramp('#A8A29E');
    for (let k = 0; k < 5; k++) { const w = 34 - k * 6; R(g, x - w / 2, y - 5 - k * 5, w, 5, S.base); hl(g, x - w / 2, y - 5 - k * 5, w, S.lit); hl(g, x - w / 2, y - 1 - k * 5, w, S.shade); vl(g, x + w / 2 - 1, y - 5 - k * 5, 5, S.shade); }
    block(g, x - 4, y - 25, 8, 4, 2, '#A8A29E', '#78716C');
    R(g, x - 3, y - 5, 6, 5, '#1C1917'); hl(g, x - 3, y - 5, 6, '#FBBF24'); px(g, x - 2, y - 4, '#FFFFFF'); px(g, x + 1, y - 4, '#FFFFFF');
    for (let k = 0; k < 6; k++) vl(g, x - 15 + k * 6, y - 8 - (k % 3) * 4, 5, '#3F6212');
  },
  mineCart: (g, x, y) => {
    // (the track in and out of a cave mouth in the rock, a cart on it)
    const Rk = ramp('#8A7A6A');
    ell(g, x, y - 8, 16, 10, Rk); R(g, x - 5, y - 8, 10, 8, '#1C1917');
    track(g, [[x - 22, y + 2], [x - 10, y - 1], [x - 4, y - 1]], '#A8A29E', '#44403C');
    track(g, [[x + 4, y - 1], [x + 12, y + 3], [x + 22, y]], '#A8A29E', '#44403C');
    R(g, x - 16, y - 4, 6, 3, '#78350F'); hl(g, x - 16, y - 4, 6, '#B45309'); px(g, x - 15, y - 1, '#1C1917'); px(g, x - 12, y - 1, '#1C1917');
  },
  clearing: (g, x, y) => {
    // (a ring of jungle round a clearing, five bushes in it, a vine hanging over)
    ell(g, x, y - 4, 16, 7, '#9AAE5A', false);
    for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; tree(g, Math.round(x + Math.cos(a) * 18), Math.round(y - 4 + Math.sin(a) * 9), 'palm'); }
    for (let k = 0; k < 5; k++) ell(g, x - 10 + k * 5, y - 4 + (k % 2) * 2, 2, 1.5, ramp('#2F6B2A'));
  },

  // ---- Spooky Land
  spookyTown: (g, x, y) => {
    // (gabled Victorian shopfronts round a little square, a coffin-cup ride in it)
    for (let k = 0; k < 3; k++) { const bx = x - 22 + k * 15; block(g, bx, y - 4, 12, 9, 3, ['#4C3A5E', '#3E4A5E', '#5E3A4A'][k], '#2A2238'); spire(g, bx + 6, y - 16, 12, 6, '#2A2238'); windows(g, bx + 1, y - 10, 10, 3, '#A3E635'); }
    carousel(g, x + 2, y + 6, 8, '#6D28D9', '#86EFAC');
    tree(g, x - 26, y + 6, 'dead'); tree(g, x + 24, y + 4, 'dead');
  },
  castle: (g, x, y) => {
    // (Dracula's other castle: dark towers, pointed roofs, one lit window, bats)
    const W = '#4A4458';
    block(g, x - 14, y, 28, 14, 4, W, '#2E2A3A');
    for (const [dx, h] of [[-16, 22], [-6, 30], [8, 26], [16, 18]] as [number, number][]) { block(g, x + dx - 3, y, 6, h, 2, W, '#2E2A3A'); spire(g, x + dx, y - h - 2, 8, 9, '#3B1F5A'); }
    R(g, x - 3, y - 7, 6, 7, '#1C1917'); px(g, x - 5, y - 24, '#FDE047'); px(g, x + 7, y - 20, '#FDE047');
    for (const [bx, by] of [[x - 20, y - 34], [x + 14, y - 38], [x + 2, y - 42]]) { px(g, bx, by, '#1C1917'); px(g, bx - 1, by - 1, '#1C1917'); px(g, bx + 1, by - 1, '#1C1917'); }
  },
  clockTower: (g, x, y) => {
    // (the clock tower: tall, a big clock face, the hotel-ish block at its foot (the drop))
    block(g, x - 10, y, 20, 10, 3, '#5E5470', '#3A3248');
    block(g, x - 5, y - 13, 10, 30, 2, '#6E6480', '#3A3248');
    ell(g, x, y - 36, 4, 4, ramp('#F5F0E1')); line(g, x, y - 36, x, y - 39, '#1C1917'); line(g, x, y - 36, x + 2, y - 36, '#1C1917');
    spire(g, x, y - 45, 12, 12, '#3B1F5A'); windows(g, x - 9, y - 8, 18, 4, '#A3E635');
  },
  ballroom: (g, x, y) => {
    // (a domed hall, lit up purple, a red carpet out the door)
    block(g, x - 16, y, 32, 10, 3, '#5B4A6E', '#3A2E4A');
    ell(g, x, y - 16, 10, 7, ramp('#7C3AED')); px(g, x, y - 24, '#FDE047');
    windows(g, x - 14, y - 8, 28, 6, '#F0ABFC'); R(g, x - 2, y - 4, 4, 4, '#1C1917'); R(g, x - 1, y, 2, 4, '#DC2626');
  },

  // ---- Future Land
  futureSquare: (g, x, y) => {
    // (a Googie sign, a flying-saucer snack bar on a stalk, the reflecting pool's fountain)
    vl(g, x + 14, y - 22, 22, '#E5E7EB'); for (let k = 0; k < 4; k++) R(g, x + 15, y - 21 + k * 5, 8 - k, 3, ['#F472B6', '#22D3EE', '#FDE047', '#A78BFA'][k]);
    spire(g, x + 14, y - 22, 4, 6, '#F97316');
    vl(g, x - 14, y - 12, 12, '#94A3B8'); ell(g, x - 14, y - 14, 10, 3, ramp('#E2E8F0')); ell(g, x - 14, y - 17, 4, 2, ramp('#67E8F9'));
    vl(g, x - 2, y - 8, 4, '#BDE6FA'); px(g, x - 3, y - 9, '#BDE6FA'); px(g, x - 1, y - 9, '#BDE6FA');
  },
  atom: (g, x, y) => {
    // (a big atom over a white dome: three elliptical orbits, the nucleus)
    ell(g, x, y - 6, 14, 7, ramp('#E2E8F0'));
    const cy = y - 22;
    g.save(); g.imageSmoothingEnabled = false;
    for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI; for (let t = 0; t < 64; t++) { const th = (t / 64) * Math.PI * 2; const ex = Math.cos(th) * 12, ey = Math.sin(th) * 4; px(g, Math.round(x + ex * Math.cos(a) - ey * Math.sin(a)), Math.round(cy + ex * Math.sin(a) + ey * Math.cos(a)), '#22D3EE'); } }
    g.restore();
    ell(g, x, cy, 3, 3, ramp('#EF4444')); vl(g, x, cy + 3, 9, '#94A3B8');
  },
  voyage: (g, x, y) => {
    // (a long low show building, PROGRESSCO's globe on it, a sled track out round the side)
    block(g, x - 18, y, 36, 9, 5, '#CBD5E1', '#94A3B8');
    ell(g, x - 8, y - 18, 5, 5, ramp('#3B82F6')); hl(g, x - 12, y - 18, 9, '#86EFAC');
    track(g, [[x + 18, y - 4], [x + 24, y - 10], [x + 20, y - 18], [x + 10, y - 16]], '#F97316');
    for (const lx of [x + 22, x + 21]) leg(g, lx, y - 8, y);
    windows(g, x - 16, y - 7, 32, 8, '#67E8F9');
  },
  needle: (g, x, y) => {
    // (SPACE NEEDLE 2: a tall stalk, the saucer top, a beacon; taller than anything)
    const S = ramp('#E5E7EB');
    for (let j = 0; j < 46; j++) { const w = j < 8 ? 6 - (j >> 2) : 2; R(g, x - w / 2, y - j, w, 1, j % 6 === 0 ? S.shade : S.base); }
    ell(g, x, y - 48, 12, 3, ramp('#F97316')); ell(g, x, y - 52, 6, 2, ramp('#E2E8F0')); vl(g, x, y - 60, 6, '#94A3B8'); px(g, x, y - 61, '#EF4444');
  },
  xenoscare: (g, x, y) => {
    // (a ribbed black haunted house with a green glow, the crater next door (new!))
    block(g, x - 12, y, 24, 14, 3, '#27272A', '#18181B');
    for (let k = 0; k < 6; k++) vl(g, x - 11 + k * 4, y - 14, 14, '#3F3F46');
    R(g, x - 3, y - 6, 6, 6, '#16A34A'); dith(g, x - 5, y - 8, 10, 2, '#86EFAC');
    ell(g, x + 20, y - 1, 8, 3, ramp('#57534E')); ell(g, x + 20, y - 1, 5, 2, '#292524', false);
  },
  disco: (g, x, y) => {
    // (the space disco: a saucer-roofed club, a mirror ball on top, spotlights)
    block(g, x - 14, y, 28, 8, 3, '#4C1D95', '#2E1065');
    ell(g, x, y - 12, 16, 4, ramp('#A78BFA'));
    ell(g, x, y - 20, 4, 4, ramp('#E5E7EB')); px(g, x - 1, y - 21, '#FFFFFF'); px(g, x + 1, y - 19, '#67E8F9');
    line(g, x - 12, y - 12, x - 22, y - 30, '#FDE047'); line(g, x + 12, y - 12, x + 22, y - 30, '#F472B6');
    windows(g, x - 12, y - 6, 24, 6, '#F0ABFC');
  },

  // ---- Hollywood Land
  blvd: (g, x, y) => {
    // (the boulevard: a movie palace with a marquee, palm trees, stars on the walk)
    block(g, x - 14, y, 28, 14, 3, '#B91C1C', '#7F1D1D');
    R(g, x - 10, y - 10, 20, 4, '#FDE047'); for (let i = 0; i < 20; i += 2) px(g, x - 10 + i, y - 11, '#FFFFFF');
    spire(g, x, y - 17, 8, 10, '#FDE047');
    tree(g, x - 20, y + 2, 'palm'); tree(g, x + 20, y + 2, 'palm');
    for (let k = 0; k < 5; k++) px(g, x - 12 + k * 6, y + 4, '#FDE047');
  },
  toiletCoaster: (g, x, y) => {
    // (THRONES OF THE STARS: a coaster's hill and dip, a giant golden toilet at the top of the lift)
    const pts: [number, number][] = [[x - 22, y], [x - 14, y - 22], [x - 8, y - 22], [x, y - 4], [x + 8, y - 14], [x + 16, y - 2], [x + 22, y - 6]];
    for (const [px0, py0] of pts) leg(g, px0, py0, y, '#A8A29E');
    track(g, pts, '#FDE047', '#78350F');
    ell(g, x - 11, y - 28, 5, 3, ramp('#FDE047')); R(g, x - 9, y - 36, 5, 8, ramp('#FDE047').base); hl(g, x - 9, y - 36, 5, '#FFFBEB');
  },
  soundstage: (g, x, y) => {
    // (SOUNDSTAGE 66: a big barrel-roofed box, a stage door, a red light over it (shooting? no))
    block(g, x - 16, y, 32, 16, 6, '#D6D3D1', '#A8A29E');
    for (let i = 0; i < 32; i += 4) vl(g, x - 16 + i, y - 22, 6, '#78716C');
    R(g, x - 3, y - 8, 6, 8, '#57534E'); px(g, x, y - 11, '#EF4444');
    R(g, x + 6, y - 12, 8, 4, '#1C1917'); px(g, x + 8, y - 11, '#FDE047'); px(g, x + 11, y - 11, '#FDE047');
  },
  backlot: (g, x, y) => {
    // (false fronts: a western street, a New York stoop, propped up from behind; a tram)
    const fronts = ['#C2410C', '#78716C', '#1E40AF', '#A16207'];
    fronts.forEach((c, k) => { const bx = x - 22 + k * 11; block(g, bx, y - 2, 10, 12 + (k % 2) * 4, 1, c, mix(c, '#000000', 0.3)); windows(g, bx + 1, y - 10 - (k % 2) * 4, 8, 2); line(g, bx + 9, y - 2, bx + 12, y - 12, '#57534E'); });
    R(g, x - 14, y + 2, 26, 3, '#F5F5F4'); hl(g, x - 14, y + 5, 26, '#1C1917'); for (let i = 0; i < 26; i += 6) px(g, x - 13 + i, y + 3, '#1E3A8A');
  },
  disaster: (g, x, y) => {
    // (DISASTER: THE RIDE: a cracked street set, a tilted building, a flood tank, a tornado fan)
    block(g, x - 16, y, 14, 18, 2, '#9CA3AF', '#6B7280'); line(g, x - 12, y - 18, x - 8, y - 4, '#1F2937');
    ell(g, x + 8, y - 4, 10, 4, ramp('#3B82F6'));
    for (let k = 0; k < 5; k++) hl(g, x + 14 - k, y - 14 - k * 3, 6 - k, '#D6D3D1');
    R(g, x - 18, y + 2, 36, 2, '#57534E'); line(g, x - 6, y + 2, x + 2, y + 4, '#1C1917');
    px(g, x - 20, y - 22, '#F97316'); px(g, x - 19, y - 23, '#FDE047');
  },
  stuntArena: (g, x, y) => {
    // (the Stuntery: a horseshoe of bleachers, a dirt arena, ramps and a ring of fire)
    ell(g, x, y - 6, 24, 11, ramp('#9CA3AF'));
    ell(g, x, y - 5, 18, 7, '#B08A5A', false);
    R(g, x - 10, y - 7, 6, 3, '#DC2626'); R(g, x + 4, y - 4, 6, 3, '#2563EB');
    line(g, x - 2, y - 5, x + 3, y - 9, '#F5F5F4', 2);
    ell(g, x + 12, y - 9, 3, 3, ramp('#F97316'), false); px(g, x + 12, y - 9, '#FDE047');
    vl(g, x - 22, y - 26, 16, '#FDE047'); R(g, x - 21, y - 26, 10, 6, '#FDE047'); px(g, x - 18, y - 24, '#DC2626');
  },

  // ---- Foreign Lands
  lagoon: (g, x, y) => {
    // (ten pavilions round the lagoon: each its own little landmark)
    const pav: [number, number, (gx: number, gy: number) => void][] = [
      [-46, 6, (a, b) => { spire(g, a, b - 2, 14, 10, '#A8A29E'); hl(g, a - 6, b - 1, 13, '#57534E'); }],
      [-40, -14, (a, b) => { block(g, a - 5, b, 10, 7, 3, '#7C2D12', '#1C1917'); spire(g, a, b - 10, 10, 5, '#1C1917'); }],
      [-26, -28, (a, b) => { for (let k = 0; k < 3; k++) { R(g, a - 5 + k, b - 4 - k * 5, 10 - k * 2, 2, '#DC2626'); R(g, a - 3 + k, b - 2 - k * 5, 6 - k * 2, 3, '#FDE047'); } }],
      [-6, -34, (a, b) => { block(g, a - 6, b, 12, 8, 4, '#F5F0E1', '#7C2D12'); vl(g, a + 6, b - 18, 6, '#78350F'); }],
      [14, -33, (a, b) => { block(g, a - 5, b, 10, 6, 2, '#E7D9BC', '#B45309'); for (let j = 0; j < 14; j++) px(g, a + 3 + (j >> 3), b - 8 - j, '#F5F0E1'); }],
      [32, -26, (a, b) => { block(g, a - 4, b, 8, 4, 2, '#DC2626', '#DC2626'); vl(g, a - 4, b - 10, 6, '#DC2626'); vl(g, a + 3, b - 10, 6, '#DC2626'); hl(g, a - 6, b - 10, 13, '#1C1917'); }],
      [44, -10, (a, b) => { block(g, a - 6, b, 12, 9, 2, '#F5E6C8', '#F5E6C8'); ell(g, a, b - 12, 3, 3, ramp('#2DD4BF')); vl(g, a + 6, b - 16, 7, '#F5E6C8'); }],
      [46, 10, (a, b) => { for (let j = 0; j < 22; j++) { const w = Math.max(1, Math.round(8 - j / 3)); hl(g, a - (w >> 1), b - j, w, j % 5 ? '#78716C' : '#44403C'); } }],
      [-26, 22, (a, b) => { block(g, a - 4, b, 8, 12, 2, '#B45309', '#78350F'); ell(g, a, b - 15, 2, 2, ramp('#F5F0E1')); R(g, a + 5, b - 6, 3, 6, '#DC2626'); }],
      [26, 22, (a, b) => { for (let k = 0; k < 3; k++) vl(g, a - 4 + k * 4, b - 12, 12, '#A16207'); px(g, a, b - 14, '#DC2626'); px(g, a - 1, b - 14, '#DC2626'); }],
    ];
    for (const [dx, dy, f] of pav) f(x + dx, y + dy);
  },
  helipad: (g, x, y) => {
    // (the helipad: an H in a circle, a helicopter on it)
    ell(g, x, y - 3, 12, 6, ramp('#6B7280')); R(g, x - 3, y - 5, 1, 5, '#F5F5F4'); R(g, x + 2, y - 5, 1, 5, '#F5F5F4'); hl(g, x - 2, y - 3, 4, '#F5F5F4');
    ell(g, x + 4, y - 10, 5, 3, ramp('#3F6212')); hl(g, x + 6, y - 10, 9, '#3F6212'); hl(g, x - 4, y - 14, 18, '#1C1917'); vl(g, x + 4, y - 14, 2, '#1C1917');
    px(g, x + 2, y - 11, '#BAE6FD'); px(g, x + 3, y - 11, '#BAE6FD');
  },
  construction: (g, x, y) => {
    // (the America pavilion: a crane, a half-built skeleton, a fence, a big flag)
    for (let k = 0; k < 3; k++) { hl(g, x - 12, y - 6 - k * 7, 20, '#B45309'); for (let i = 0; i <= 20; i += 5) vl(g, x - 12 + i, y - 6 - k * 7, 7, '#B45309'); }
    vl(g, x + 14, y - 34, 34, '#FACC15'); hl(g, x + 2, y - 34, 22, '#FACC15'); vl(g, x + 4, y - 33, 8, '#1C1917');
    for (let i = -16; i < 20; i += 3) px(g, x + i, y - 1, i % 2 ? '#F97316' : '#F5F5F4');
    flag(g, x - 16, y - 10, '#DC2626', 12);
  },

  // ---- Wilderness Land
  wilds: (g, x, y) => {
    for (let k = 0; k < 10; k++) tree(g, x - 20 + ((k * 11) % 40), y - 8 + ((k * 5) % 14), 'pine');
    // (a bear (animatronic, mostly) and a log)
    ell(g, x + 4, y + 2, 3, 2, ramp('#57361E')); px(g, x + 6, y, '#57361E');
    hl(g, x - 10, y + 4, 8, '#8A5A2E'); hl(g, x - 10, y + 5, 8, '#5A3A1E');
  },
  railroad: (g, x, y) => {
    // (LONESOME PINE STATION: a depot with a water tower, the train at the platform)
    block(g, x - 14, y - 2, 18, 8, 4, '#B45309', '#7C2D12');
    vl(g, x + 10, y - 12, 10, '#5A3A1E'); vl(g, x + 14, y - 12, 10, '#5A3A1E'); R(g, x + 9, y - 18, 7, 6, '#8A5A2E'); hl(g, x + 9, y - 18, 7, '#B07A3E');
    R(g, x - 20, y + 2, 40, 1, '#57534E'); for (let i = -20; i < 20; i += 3) px(g, x + i, y + 3, '#78350F');
    R(g, x - 18, y - 3, 8, 5, '#1C1917'); vl(g, x - 17, y - 6, 3, '#1C1917'); R(g, x - 9, y - 2, 7, 4, '#991B1B'); R(g, x - 1, y - 2, 7, 4, '#991B1B'); px(g, x - 14, y - 7, '#E5E7EB');
  },
  gulch: (g, x, y) => {
    // (SAWDUST GULCH: false-front saloon, the general store, the old sawmill's wheel)
    block(g, x - 20, y, 12, 12, 1, '#A16207', '#78350F'); R(g, x - 19, y - 14, 10, 3, '#F5E6C8');
    block(g, x - 6, y, 12, 10, 1, '#B45309', '#78350F'); windows(g, x - 5, y - 7, 10, 3, '#FDE68A');
    block(g, x + 8, y, 12, 9, 4, '#8A5A2E', '#57361E'); ell(g, x + 21, y - 6, 5, 5, ramp('#78350F')); px(g, x + 21, y - 6, '#1C1917');
    hl(g, x - 20, y + 3, 40, '#C9A564');
  },
  mine: (g, x, y) => {
    // (a mountain with a timbered mine mouth, a cart, a canary)
    const Rk = ramp('#A16207');
    for (let j = 0; j < 22; j++) { const w = Math.round(32 * (1 - j / 24)); R(g, x - w / 2, y - j, w, 1, j > 18 ? '#F5F5F4' : j % 5 === 0 ? Rk.shade : Rk.base); }
    R(g, x - 4, y - 8, 8, 8, '#1C1917'); vl(g, x - 5, y - 9, 9, '#78350F'); vl(g, x + 4, y - 9, 9, '#78350F'); hl(g, x - 5, y - 9, 10, '#78350F');
    px(g, x + 10, y - 3, '#FDE047');
  },
  logFlume: (g, x, y) => {
    // (TIMBER TUMBLE: the flume up a big hill and the long drop to the splash)
    const pts: [number, number][] = [[x - 24, y - 2], [x - 16, y - 8], [x - 6, y - 26], [x + 2, y - 28], [x + 18, y - 2], [x + 24, y]];
    for (const [a, b] of pts) for (let j = b; j < y; j += 3) px(g, a, j, '#5A3A1E');
    track(g, pts, '#B07A3E', '#3B2412');
    for (let k = 0; k < 4; k++) px(g, x + 20 + k, y - 4 - (k % 2), '#BAE6FD');
    R(g, x - 3, y - 30, 5, 2, '#8A5A2E');
  },
  woods: (g, x, y) => {
    // (off the map: a clearing in the woods, a farm road, the fence)
    ell(g, x, y, 14, 7, '#7A8A4A', false);
    for (let k = 0; k < 8; k++) tree(g, x - 18 + k * 5, y - 10 - (k % 2) * 3, 'pine');
    line(g, x - 30, y + 12, x + 30, y + 4, '#A8875A', 3);
  },

  // ---- Fairy Land
  village: (g, x, y) => {
    // (HOGSMEAT: crooked snowy-roofed shops, a carousel)
    for (let k = 0; k < 4; k++) { const bx = x - 24 + k * 12; block(g, bx, y - (k % 2) * 2, 10, 10 + (k % 3) * 2, 2, ['#7C5A3A', '#5E4A6E', '#3E5A7A', '#7A3A3A'][k], '#F5F5F4'); spire(g, bx + 5, y - 13 - (k % 3) * 2 - (k % 2) * 2, 10, 7, '#475569'); windows(g, bx + 1, y - 7 - (k % 2) * 2, 8, 2, '#FDE68A'); }
    carousel(g, x + 4, y + 8, 7, '#EC4899', '#FDE68A');
  },
  wheel: (g, x, y) => {
    // (THE FAIRY WHEEL: a big Ferris wheel, colored cars)
    const cy = y - 20, r = 17;
    g.save();
    for (let t = 0; t < 120; t++) { const a = (t / 120) * Math.PI * 2; px(g, Math.round(x + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), '#E5E7EB'); }
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; line(g, x, cy, x + Math.cos(a) * r, cy + Math.sin(a) * r, '#9CA3AF'); R(g, Math.round(x + Math.cos(a) * r) - 1, Math.round(cy + Math.sin(a) * r), 3, 3, ['#F472B6', '#60A5FA', '#FDE047', '#A78BFA'][k % 4]); }
    g.restore();
    line(g, x, cy, x - 8, y, '#6B7280', 2); line(g, x, cy, x + 8, y, '#6B7280', 2); ell(g, x, cy, 2, 2, ramp('#FDE047'));
  },
  glen: (g, x, y) => {
    for (let k = 0; k < 6; k++) tree(g, x - 18 + k * 7, y - 2 + (k % 2) * 4, k % 2 ? 'mushroom' : 'round', k === 2 ? 1.6 : 1);
    // (Cupid, on his wire)
    line(g, x - 20, y - 26, x + 20, y - 22, '#9CA3AF'); px(g, x + 2, y - 23, '#F2C29A'); px(g, x + 1, y - 24, '#FFFFFF'); px(g, x + 3, y - 24, '#FFFFFF');
  },
  tragons: (g, x, y) => {
    // (TRUELLING TRAGONS: three twisted tracks (fire, ice, lightning) round each other, a dragon's head on the station)
    const cols = ['#EF4444', '#38BDF8', '#FACC15'];
    cols.forEach((c, k) => {
      const pts: [number, number][] = [];
      for (let t = 0; t <= 24; t++) { const a = (t / 24) * Math.PI * 2; pts.push([x - 22 + t * 1.8, y - 14 + Math.sin(a + k * 2.1) * 9 - Math.cos(a * 0.5) * 6]); }
      track(g, pts, c, mix(c, '#000000', 0.55));
    });
    for (let i = -20; i <= 20; i += 8) leg(g, x + i, y - 8, y, '#57534E');
    block(g, x - 26, y, 8, 6, 2, '#3F6212', '#1A2E05'); px(g, x - 23, y - 7, '#FDE047');
  },
  pixieCastle: (g, x, y) => {
    // (the Great Pixie's castle, the tallest thing in the land: pink and gold spires; the drained moat round it)
    const W = '#F9E6F0';
    block(g, x - 14, y, 28, 12, 4, W, '#F0C4DA');
    for (const [dx, h] of [[-14, 22], [-6, 34], [0, 44], [6, 34], [14, 22]] as [number, number][]) { block(g, x + dx - 3, y - 2, 6, h, 2, W, '#F0C4DA'); spire(g, x + dx, y - h - 4, 8, dx === 0 ? 14 : 10, '#DB2777'); px(g, x + dx, y - h - (dx === 0 ? 18 : 14), '#FDE047'); }
    R(g, x - 3, y - 7, 6, 7, '#7A3A5A'); hl(g, x - 3, y - 7, 6, '#FDE047');
    // (the runway off the back: a long ramp out)
    line(g, x + 16, y - 16, x + 30, y - 24, '#A8A29E', 2);
  },

  // ---- Cartoon Land
  sillyville: (g, x, y) => {
    // (wobbly Seussy towers, a striped carousel, a candy tree)
    for (let k = 0; k < 3; k++) { const bx = x - 20 + k * 16; for (let j = 0; j < 16 + k * 4; j++) R(g, bx + Math.round(Math.sin(j * 0.4 + k) * 2), y - j, 7, 1, j % 4 < 2 ? '#F472B6' : '#FDE68A'); ell(g, bx + 3, y - 18 - k * 4, 5, 2, ramp('#60A5FA')); }
    carousel(g, x, y + 6, 7, '#F472B6', '#FFFFFF');
    tree(g, x + 22, y + 4, 'candy'); tree(g, x - 24, y + 6, 'candy');
  },
  studio: (g, x, y) => {
    // (the animation studio: a big box with a giant pencil on the roof, a water tower with the logo)
    block(g, x - 14, y, 24, 12, 4, '#FDE68A', '#F59E0B');
    line(g, x - 10, y - 18, x + 6, y - 24, '#FACC15', 3); px(g, x + 7, y - 25, '#1C1917'); R(g, x - 12, y - 18, 2, 2, '#F472B6');
    vl(g, x + 14, y - 10, 10, '#78716C'); vl(g, x + 18, y - 10, 10, '#78716C'); ell(g, x + 16, y - 14, 5, 4, ramp('#60A5FA')); px(g, x + 16, y - 14, '#FFFFFF');
    windows(g, x - 13, y - 8, 22, 5, '#FFFFFF');
  },
  whiteHouse: (g, x, y) => {
    // (the Wacky White House: the portico, its columns, a flag; a cat's tail out a window)
    block(g, x - 18, y, 36, 10, 4, '#F5F5F4', '#D6D3D1');
    R(g, x - 6, y - 16, 12, 2, '#F5F5F4'); spire(g, x, y - 16, 14, 4, '#E7E5E4');
    for (let i = -5; i <= 5; i += 2) vl(g, x + i, y - 14, 14, '#FFFFFF');
    windows(g, x - 17, y - 7, 10, 3, '#1E3A8A'); windows(g, x + 7, y - 7, 10, 3, '#1E3A8A');
    flag(g, x, y - 20, '#DC2626', 8); px(g, x - 14, y - 5, '#1C1917'); px(g, x - 15, y - 6, '#1C1917');
  },
  bigKid: (g, x, y) => {
    // (the Big-Kid Zone: a halfpipe, a whirly ride, the glop pit, neon zigzags)
    for (let i = -12; i <= 12; i++) { const h = Math.round((i * i) / 18); px(g, x - 12 + i + 12, y - 8 + h - 6, '#22D3EE'); }
    R(g, x - 12, y - 4, 26, 2, '#7C3AED');
    vl(g, x - 18, y - 14, 14, '#9CA3AF'); for (let k = 0; k < 4; k++) R(g, x - 18 + Math.round(Math.cos(k * 1.57) * 6), y - 14 + Math.round(Math.sin(k * 1.57) * 3), 3, 2, ['#F97316', '#84CC16', '#EC4899', '#FDE047'][k]);
    line(g, x + 10, y - 22, x + 14, y - 16, '#84CC16'); line(g, x + 14, y - 16, x + 10, y - 12, '#84CC16'); line(g, x + 10, y - 12, x + 14, y - 8, '#84CC16');
  },
  punchy: (g, x, y) => {
    // (PUNCHY & KICKY: a cartoon gate with a giant mallet and a cleaver crossed over it, an anvil)
    block(g, x - 14, y, 28, 10, 3, '#F97316', '#C2410C');
    line(g, x - 12, y - 30, x + 8, y - 12, '#8A5A2E', 2); R(g, x - 16, y - 34, 8, 6, '#78350F');
    line(g, x + 12, y - 30, x - 8, y - 12, '#57534E', 2); R(g, x + 10, y - 34, 6, 7, '#D6D3D1');
    R(g, x + 16, y - 4, 8, 4, '#1C1917'); R(g, x + 18, y - 6, 5, 2, '#374151');
  },
  amphi: (g, x, y) => {
    // (the UBX amphitheater: a band shell, rows of seats in a fan, the beer garden's umbrellas)
    for (let k = 0; k < 5; k++) { const w = 18 + k * 5; hl(g, x - w, y - 2 + k * 2, w * 2, k % 2 ? '#9CA3AF' : '#B8BCC6'); }
    ell(g, x, y - 10, 12, 10, ramp('#F5F5F4')); ell(g, x, y - 8, 8, 6, '#3F3F46', false);
    R(g, x - 3, y - 5, 6, 2, '#C2410C');
    for (const ux of [x + 26, x + 32]) { tent(g, ux, y - 2, 6, 2, '#DC2626', '#FFFFFF'); vl(g, ux, y - 2, 3, '#57534E'); }
  },

  // ---- shared bits
  food: (g, x, y) => { block(g, x - 4, y, 8, 5, 2, '#F5F0E1', '#DC2626'); tent(g, x, y - 7, 10, 2, '#DC2626', '#FFFFFF'); },
  shop: (g, x, y) => { block(g, x - 5, y, 10, 6, 2, '#7F1D1D', '#450A0A'); windows(g, x - 4, y - 4, 8, 2, '#F97316'); },
  hub: () => { /* (drawn with the plaza: global.ts) */ },
  none: () => { /* (drawn with the way in: global.ts) */ },
};

/** A few guests, scattered (the detail layer). */
export const guests = (g: Ctx, x: number, y: number, n: number, seed: number) => {
  const cols = ['#DC2626', '#2563EB', '#16A34A', '#F59E0B', '#7C3AED', '#F5F5F4', '#EC4899'];
  for (let k = 0; k < n; k++) person(g, x + ((k * 7 + seed * 3) % 11) - 5, y + ((k * 5 + seed) % 7) - 3, cols[(k + seed) % cols.length]);
};
