// The portals: each a small gateway set back off the walk at the top of its path, dressed as its land (Future Land's
// chrome ring, Wilderness Land's log frame, Spooky Land's crooked stone with lanterns, Cartoon Land's candy canes,
// Hollywood Land's deco frame, Fairy Land's gilded storybook arch, Jungle Land's carved idol stone, Foreign Lands' tiled
// arch), its name over it in the land's own lettering. Through the opening, the land itself, the path running on into
// it. Round the outside of it, the swirl: bands of the land's colors winding round the frame, flecks flung round it.
//
// At the path's mouth, where it meets the walk, a gatepost either side (tiki torches, jack-o'-lanterns on pillars,
// chrome pylons, lanterns on log posts, giant candy canes, deco pylons, gilded orbs, flag poles); a queue rail beside
// it, the line waiting in it (crowd.ts).
//
// Still parts stamped (draw.ts); the swirl, the shimmer through the opening and the flames live.

import { type Ctx, INK, mix, hash, checker, box, R6, inked, slab } from './kit';
import { type Land } from './lands';
import { GATE, GATE_MID, ROW, PATH, depthAt } from './geometry';
import { LAND_LOOK, type StretchId } from './stretch';
import { signText, signW } from '../signLetters';
import { stamp } from '../../m1/game/render/stamp';

const { base: BASE, halfW: HW, h: H, frame: FR } = GATE;
const TOP = BASE - H;

/** The opening, as a path (round-topped). */
export const openingPath = (c: Ctx, cx: number, grow = 0) => {
  const w = HW + grow, top = TOP - grow;
  c.moveTo(cx - w, BASE); c.lineTo(cx - w, top + w); c.arc(cx, top + w, w, Math.PI, 0); c.lineTo(cx + w, BASE); c.closePath();
};

/** A ball in stepped shells (the vistas' round things). */
const vball = (c: Ctx, x: number, y: number, r: number, R: string[]) => { for (const [k, col] of [[1, R[1]], [0.78, R[2]], [0.5, R[3]], [0.22, R[4]]] as const) { c.fillStyle = col; c.beginPath(); c.arc(x - r * (1 - k) * 0.4, y - r * (1 - k) * 0.4, r * k, 0, Math.PI * 2); c.fill(); } };
const vpoly = (c: Ctx, pts: number[], col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); };
/** What's seen through it: the land, the path running on into it (each the land as it looks now, small). */
const VISTA: Record<string, { sky: string[]; ground: string; path: string; paint: (c: Ctx, cx: number) => void }> = {
  space: { sky: ['#2A1A5A', '#5A3A9A', '#E8659E', '#FBC4A0'], ground: '#C2D0E0', path: '#F1F5F9', paint: (c, cx) => {
    for (let k = 0; k < 10; k++) box(c, cx - 24 + (k * 37) % 48, TOP + 6 + (k * 13) % 26, 1, 1, '#FFFFFF');
    // (the needle and its saucer deck, the atom over the skyline, domes along the ground)
    const C = R6('#CBD5E1');
    box(c, cx - 5, TOP + 18, 3, 52, C[3]); box(c, cx - 5, TOP + 18, 1, 52, C[5]);
    c.fillStyle = INK; c.beginPath(); c.ellipse(cx - 4, TOP + 22, 13, 4, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#1A808C'; c.beginPath(); c.ellipse(cx - 4, TOP + 22, 12, 3, 0, 0, Math.PI * 2); c.fill(); box(c, cx - 14, TOP + 21, 20, 1, '#FFD87A');
    vball(c, cx + 14, TOP + 32, 6, R6('#C8B4E8')); c.strokeStyle = C[4]; c.lineWidth = 1; c.beginPath(); c.ellipse(cx + 14, TOP + 32, 10, 3, 0.5, 0, Math.PI * 2); c.ellipse(cx + 14, TOP + 32, 10, 3, -0.5, 0, Math.PI * 2); c.stroke();
    for (const [dx, r] of [[-18, 8], [8, 6], [20, 9]] as const) { c.fillStyle = INK; c.beginPath(); c.arc(cx + dx, BASE - 26, r + 1, Math.PI, 0); c.fill(); c.fillStyle = C[3]; c.beginPath(); c.arc(cx + dx, BASE - 26, r, Math.PI, 0); c.fill(); c.fillStyle = C[5]; c.beginPath(); c.arc(cx + dx - 2, BASE - 28, r * 0.4, Math.PI, 0); c.fill(); }
  } },
  frontier: { sky: ['#F59E0B', '#FBBF24', '#FDE68A', '#FEF3C7'], ground: '#C08A54', path: '#9A6A3E', paint: (c, cx) => {
    // (the Rockies far off, snow on them; the fiberglass mountain and its flume; pines)
    vpoly(c, [cx - HW, BASE - 40, cx - 14, BASE - 72, cx - 4, BASE - 56, cx + 8, BASE - 76, cx + HW, BASE - 44, cx + HW, BASE - 26, cx - HW, BASE - 26], '#9AA8C8');
    vpoly(c, [cx - 18, BASE - 64, cx - 14, BASE - 72, cx - 10, BASE - 64], '#F2F6FC'); vpoly(c, [cx + 3, BASE - 68, cx + 8, BASE - 76, cx + 13, BASE - 68], '#F2F6FC');
    vpoly(c, [cx - 6, BASE - 26, cx + 8, BASE - 58, cx + 24, BASE - 26], '#B0805A'); vpoly(c, [cx - 6, BASE - 26, cx + 8, BASE - 58, cx + 6, BASE - 26], '#D0A07A');
    c.strokeStyle = '#4CA8D8'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx + 8, BASE - 56); c.quadraticCurveTo(cx + 18, BASE - 44, cx + 26, BASE - 28); c.stroke();
    for (const px of [cx - 22, cx - 14, cx + 20]) for (let k = 0; k < 3; k++) vpoly(c, [px - 5 + k, BASE - 26 - k * 6, px, BASE - 36 - k * 6, px + 5 - k, BASE - 26 - k * 6], k % 2 ? '#2F6B3A' : '#24542F');
  } },
  spooky: { sky: ['#0E0A1E', '#1E1438', '#3B2A5A', '#5B21B6'], ground: '#2A2438', path: '#4C4560', paint: (c, cx) => {
    vball(c, cx + 13, TOP + 22, 7, ['#8A8A70', '#C8C8A8', '#E8E8D0', '#F5F5DC', '#FFFFFF']);
    // (the crag, Dracula's other castle on it: towers, purple spires, a lit window; the clock tower; bats)
    vpoly(c, [cx - HW, BASE - 26, cx - 20, BASE - 40, cx + 6, BASE - 44, cx + HW, BASE - 30, cx + HW, BASE - 26], '#1A1428');
    box(c, cx - 16, BASE - 58, 22, 16, '#3B3049'); for (let k = 0; k < 4; k++) box(c, cx - 16 + k * 6, BASE - 61, 4, 3, '#3B3049');
    for (const [tx, h] of [[-19, 26], [3, 30]] as const) { box(c, cx + tx, BASE - 42 - h, 7, h, '#4C3D5E'); vpoly(c, [cx + tx - 2, BASE - 42 - h, cx + tx + 3.5, BASE - 54 - h, cx + tx + 9, BASE - 42 - h], '#561A8A'); }
    box(c, cx - 7, BASE - 54, 3, 4, '#BEF264'); box(c, cx + 5, BASE - 64, 2, 3, '#BEF264');
    box(c, cx + 14, BASE - 74, 8, 34, '#2E2440'); vpoly(c, [cx + 13, BASE - 74, cx + 18, BASE - 84, cx + 23, BASE - 74], '#1A1428'); box(c, cx + 16, BASE - 70, 4, 4, '#CDB878');
    for (const [bx, by] of [[cx - 14, TOP + 16], [cx - 4, TOP + 24]] as const) vpoly(c, [bx - 4, by + 1, bx, by - 1, bx + 4, by + 1, bx, by + 2], '#0A0614');
  } },
  cartoon: { sky: ['#86CAF4', '#C6E8FC', '#FFD2E8', '#FFF8C8'], ground: '#6CCC6A', path: '#FFF1F6', paint: (c, cx) => {
    for (const [i, col] of ['#EF4444', '#F59E0B', '#FDE047', '#4ADE80', '#60A5FA'].entries()) { c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.arc(cx, BASE - 20, 30 - i * 2, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    // (the pink water tower with its face, round hills, lollipop trees)
    for (const lx of [-6, 6]) box(c, cx + lx - 1, BASE - 50, 2, 26, '#9476DE');
    c.fillStyle = INK; c.beginPath(); c.roundRect(cx - 12, BASE - 70, 24, 22, 6); c.fill(); c.fillStyle = '#EE62A8'; c.beginPath(); c.roundRect(cx - 11, BASE - 69, 22, 20, 5); c.fill(); box(c, cx - 11, BASE - 69, 4, 20, '#FA9ACA');
    box(c, cx - 6, BASE - 63, 4, 4, '#FFFFFF'); box(c, cx + 2, BASE - 63, 4, 4, '#FFFFFF'); box(c, cx - 5, BASE - 62, 2, 2, INK); box(c, cx + 3, BASE - 62, 2, 2, INK); box(c, cx - 3, BASE - 55, 6, 2, INK);
    vpoly(c, [cx - 13, BASE - 70, cx, BASE - 80, cx + 13, BASE - 70], '#4CA8E8');
    for (const [dx, r, col] of [[-16, 12, '#4CC89C'], [18, 14, '#3CAA4C']] as const) { c.fillStyle = col; c.beginPath(); c.arc(cx + dx, BASE - 24, r, Math.PI, 0); c.fill(); c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.arc(cx + dx - 3, BASE - 27, r * 0.5, Math.PI, 0); c.fill(); }
    for (const [lx, col] of [[-22, '#F472B6'], [22, '#FDE047']] as const) { box(c, cx + lx, BASE - 36, 1, 10, '#FFFFFF'); c.fillStyle = col; c.beginPath(); c.arc(cx + lx, BASE - 37, 3, 0, Math.PI * 2); c.fill(); }
  } },
  hollywood: { sky: ['#0F172A', '#1E293B', '#4C1D95', '#BE185D'], ground: '#3F3F46', path: '#B91C1C', paint: (c, cx) => {
    // (the HAPPYWOOD hill, its letters on their legs; a searchlight; the soundstages along the ground)
    c.fillStyle = 'rgba(254, 249, 195, 0.22)'; c.beginPath(); c.moveTo(cx - 6, BASE - 30); c.lineTo(cx - 24, TOP); c.lineTo(cx - 12, TOP); c.fill();
    vpoly(c, [cx - HW, BASE - 26, cx - 10, BASE - 56, cx + 10, BASE - 54, cx + HW, BASE - 30, cx + HW, BASE - 26], '#A16207'); vpoly(c, [cx - HW, BASE - 26, cx - 10, BASE - 56, cx - 4, BASE - 55, cx - 16, BASE - 30], '#C88A2A');
    for (let k = 0; k < 7; k++) { box(c, cx - 17 + k * 5, BASE - 50 + Math.abs(k - 3), 3, 4, '#F8FAFC'); box(c, cx - 16 + k * 5, BASE - 46 + Math.abs(k - 3), 1, 3, '#78716C'); }
    for (const [sx, w] of [[-26, 16], [-6, 14], [12, 15]] as const) { box(c, cx + sx, BASE - 38, w, 12, '#D6CDB8'); box(c, cx + sx, BASE - 40, w, 2, '#A8A29E'); box(c, cx + sx + 3, BASE - 32, 5, 6, '#57534E'); }
  } },
  fantasy: { sky: ['#1E3A8A', '#3B82F6', '#93C5FD', '#FDE68A'], ground: '#4E7A4C', path: '#A8A2C0', paint: (c, cx) => {
    // (the Great Pixie's castle: lavender stone, blue cones banded gold, pink pennants, Piper's window glowing)
    const S = ['#6A5A8C', '#9484B4', '#BCAED6', '#DCD2EC', '#F4EEFA'];
    box(c, cx - 16, BASE - 46, 32, 20, S[2]); box(c, cx - 16, BASE - 46, 4, 20, S[4]); for (let k = 0; k < 5; k++) box(c, cx - 16 + k * 7, BASE - 49, 4, 3, S[2]);
    for (const [tx, h] of [[-16, 30], [-4, 50], [8, 40], [16, 26]] as const) {
      box(c, cx + tx - 4, BASE - 26 - h, 8, h, S[3]); box(c, cx + tx - 4, BASE - 26 - h, 2, h, S[4]); box(c, cx + tx + 2, BASE - 26 - h, 2, h, S[1]);
      vpoly(c, [cx + tx - 6, BASE - 26 - h, cx + tx, BASE - 40 - h, cx + tx + 6, BASE - 26 - h], '#2E52A8'); vpoly(c, [cx + tx - 6, BASE - 26 - h, cx + tx, BASE - 40 - h, cx + tx - 1, BASE - 26 - h], '#7AA8F0');
      box(c, cx + tx - 4, BASE - 30 - h, 8, 1, '#F2C84A'); vpoly(c, [cx + tx, BASE - 40 - h, cx + tx + 5, BASE - 38 - h, cx + tx, BASE - 36 - h], '#F49AC8');
    }
    box(c, cx - 5, BASE - 66, 2, 3, '#FF8AC8'); box(c, cx - 2, BASE - 38, 4, 12, '#3A3060');
  } },
  adventure: { sky: ['#14532D', '#3F6212', '#A3B53A', '#FDE68A'], ground: '#4D6B22', path: '#9C7A52', paint: (c, cx) => {
    // (the temple stepped up out of the canopy, vines down it, a dark doorway; palms)
    for (const [dx, r] of [[-20, 12], [20, 14], [-6, 9], [10, 10]] as const) vball(c, cx + dx, BASE - 48 + r * 0.3, r, R6('#2F6B22'));
    for (let k = 0; k < 5; k++) { const w = 34 - k * 6, y = BASE - 30 - k * 8; box(c, cx - w / 2, y, w, 8, k % 2 ? '#78716C' : '#A8A29E'); box(c, cx - w / 2, y, w, 1, '#D6D3D1'); box(c, cx + w / 2 - 3, y, 3, 8, '#57534E'); }
    box(c, cx - 3, BASE - 70, 6, 6, '#1C1917'); for (const vx of [-12, 6]) box(c, cx + vx, BASE - 64, 2, 24, '#3F6212');
    for (const px of [cx - 22, cx + 22]) { box(c, px, BASE - 50, 2, 24, '#8A6A44'); for (let k = -2; k <= 2; k++) vpoly(c, [px + 1, BASE - 50, px + k * 6, BASE - 46 + Math.abs(k), px + k * 5, BASE - 49], '#4D7C0F'); }
  } },
  foreign: { sky: ['#7C2D12', '#C2410C', '#FB923C', '#FDE68A'], ground: '#B8A684', path: '#E8DCC4', paint: (c, cx) => {
    // (the mountain, snow on its cap; the cathedral's towers; an onion dome; flags)
    vpoly(c, [cx - HW, BASE - 30, cx - 2, BASE - 76, cx + HW, BASE - 32, cx + HW, BASE - 26, cx - HW, BASE - 26], '#7A8AA8'); vpoly(c, [cx - 10, BASE - 64, cx - 2, BASE - 76, cx + 7, BASE - 64, cx + 2, BASE - 62, cx - 3, BASE - 66], '#F2F6FC');
    for (const tx of [cx + 8, cx + 20]) { box(c, tx, BASE - 54, 8, 28, '#C8BFAE'); box(c, tx + 2, BASE - 50, 2, 6, '#3A4A8A'); box(c, tx - 1, BASE - 56, 10, 2, '#A89E8A'); }
    box(c, cx - 22, BASE - 40, 12, 14, '#F2E6D0'); c.fillStyle = '#2E7D5B'; c.beginPath(); c.moveTo(cx - 17, BASE - 40); c.bezierCurveTo(cx - 26, BASE - 44, cx - 20, BASE - 52, cx - 16, BASE - 56); c.bezierCurveTo(cx - 12, BASE - 52, cx - 6, BASE - 44, cx - 15, BASE - 40); c.fill();
    for (const [fx, col] of [[cx - 6, '#DC2626'], [cx + 4, '#1E40AF']] as const) { box(c, fx, BASE - 44, 1, 18, '#57534E'); box(c, fx + 1, BASE - 44, 6, 4, col); }
  } },
};

/** The land beyond, through the opening (stamped). */
const paintVista = (c: Ctx, land: Land, cx: number) => {
  const V = VISTA[land.id];
  c.save(); c.beginPath(); openingPath(c, cx); c.clip();
  const n = V.sky.length, sh = (BASE - 26 - TOP) / n;
  V.sky.forEach((col, i) => box(c, cx - HW, TOP + i * sh, HW * 2, sh + 1, col));
  for (let i = 1; i < n; i++) checker(c, cx - HW, Math.round(TOP + i * sh) - 2, HW * 2, 2, V.sky[i]);
  V.paint(c, cx);
  box(c, cx - HW, BASE - 26, HW * 2, 26, V.ground);
  checker(c, cx - HW, BASE - 26, HW * 2, 2, mix(V.ground, '#FFFFFF', 0.3));
  // (the path running on into the land, to its own far end)
  c.fillStyle = V.path; c.beginPath(); c.moveTo(cx - PATH.far, BASE); c.lineTo(cx + PATH.far, BASE); c.lineTo(cx + 3, BASE - 26); c.lineTo(cx - 3, BASE - 26); c.closePath(); c.fill();
  c.strokeStyle = mix(V.path, INK, 0.4); c.lineWidth = 1; c.stroke();
  for (let k = 1; k < 5; k++) { const y = BASE - 26 + 26 * (k / 5) ** 1.6, w = 3 + (PATH.far - 3) * (k / 5) ** 1.6; box(c, cx - w, y, w * 2, 1, mix(V.path, INK, 0.25)); }
  c.restore();
};

/** The frame round the opening, by land (stamped), and its name over it. */
const paintFrame = (c: Ctx, land: Land, cx: number) => {
  const ring = (cols: string[], w: number = FR, joints = false) => {
    // (the frame round the opening: stepped bands out from it, inked both edges; the opening itself left be)
    const band = (outer: number, inner: number, col: string) => { c.beginPath(); openingPath(c, cx, outer); openingPath(c, cx, inner); c.fillStyle = col; c.fill('evenodd'); };
    band(w + 1, w, INK);
    cols.forEach((col, i) => band(w - (i * w) / cols.length, w - ((i + 1) * w) / cols.length, col));
    band(1, 0, INK);
    // (the light on it: lit round its upper left, shaded down its right, a dither row between; the joints across it)
    c.save(); c.beginPath(); openingPath(c, cx, w); openingPath(c, cx, 0); c.clip('evenodd');
    c.fillStyle = 'rgba(255, 255, 255, 0.22)'; c.fillRect(cx - HW - w - 2, TOP - w - 2, HW * 0.7, H + w + 4);
    checker(c, cx - HW - w - 2 + HW * 0.7, TOP - w - 2, 2, H + w + 4, 'rgba(255, 255, 255, 0.22)');
    c.fillStyle = 'rgba(26, 16, 40, 0.28)'; c.fillRect(cx + HW * 0.45, TOP - w - 2, HW * 0.55 + w + 2, H + w + 4);
    checker(c, cx + HW * 0.45 - 2, TOP - w - 2, 2, H + w + 4, 'rgba(26, 16, 40, 0.28)');
    if (joints) {
      c.strokeStyle = 'rgba(26, 16, 40, 0.55)'; c.lineWidth = 1; c.beginPath();
      for (let k = 0; k <= 10; k++) { const a = Math.PI + (k / 10) * Math.PI, r0 = HW, r1 = HW + w; c.moveTo(cx + Math.cos(a) * r0, TOP + HW + Math.sin(a) * r0); c.lineTo(cx + Math.cos(a) * r1, TOP + HW + Math.sin(a) * r1); }
      for (let y = TOP + HW + 10; y < BASE; y += 12) { c.moveTo(cx - HW - w, y); c.lineTo(cx - HW, y); c.moveTo(cx + HW, y); c.lineTo(cx + HW + w, y); }
      c.stroke();
    }
    c.restore();
  };

  const L = cx - HW - FR, Rr = cx + HW;
  switch (land.id) {
    case 'space': {
      ring(['#94A3B8', '#E2E8F0', '#F8FAFC', '#CBD5E1']);
      for (const s of [-1, 1]) { inked(c, () => { c.moveTo(cx + s * (HW + FR), BASE); c.lineTo(cx + s * (HW + FR + 14), BASE); c.lineTo(cx + s * (HW + FR + 2), BASE - 46); c.closePath(); }, '#22BCAC'); }
      inked(c, () => c.ellipse(cx, TOP - FR - 4, 22, 5, 0, 0, Math.PI * 2), '#E8659E');
      break;
    }
    case 'frontier': {
      for (const x of [L - 2, Rr]) { slab(c, x, TOP + 8, FR + 2, H - 8, R6('#7A4E2A')); for (let k = 0; k < 6; k++) box(c, x + 1, TOP + 20 + k * 13, FR, 1, '#4A2E18'); }
      slab(c, L - 12, TOP - 6, Rr - L + FR + 26, 14, R6('#8A5A32'));
      for (const x of [L - 12, Rr + FR + 12]) inked(c, () => c.arc(x, TOP + 1, 6, 0, Math.PI * 2), '#B88A5A');
      // (a longhorn skull nailed on)
      inked(c, () => c.ellipse(cx, TOP + 1, 5, 4, 0, 0, Math.PI * 2), '#F5F0E0');
      c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(cx - 4, TOP); c.quadraticCurveTo(cx - 14, TOP - 2, cx - 18, TOP - 8); c.moveTo(cx + 4, TOP); c.quadraticCurveTo(cx + 14, TOP - 2, cx + 18, TOP - 8); c.stroke();
      c.strokeStyle = '#F5F0E0'; c.lineWidth = 1.5; c.stroke();
      break;
    }
    case 'spooky': {
      ring(['#3F3A4C', '#57506A', '#6E6684', '#57506A'], FR, true);
      // (a crooked pointed gable over it, a skull in the keystone)
      c.strokeStyle = INK; c.lineWidth = 10; c.beginPath(); c.moveTo(L - 4, TOP + 22); c.lineTo(cx + 3, TOP - 30); c.lineTo(Rr + FR + 4, TOP + 20); c.stroke();
      c.strokeStyle = '#57506A'; c.lineWidth = 7; c.stroke();
      inked(c, () => c.arc(cx + 1, TOP - 12, 6, 0, Math.PI * 2), '#E7E5E4'); box(c, cx - 3, TOP - 13, 2, 2, INK); box(c, cx + 2, TOP - 13, 2, 2, INK);
      // (cobwebs in the corners)
      c.strokeStyle = 'rgba(241, 245, 249, 0.6)'; c.lineWidth = 1; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(cx - HW, TOP + HW, 6 + k * 4, -Math.PI / 2, -Math.PI * 0.95, true); c.stroke(); }
      break;
    }
    case 'cartoon': {
      ring(['#FDE047', '#FEF08A', '#FDE047', '#EAB308'], FR + 2);
      for (const s of [-1, 1]) for (let k = 0; k < 5; k++) { const y = BASE - 12 - k * 20; inked(c, () => c.arc(cx + s * (HW + FR / 2 + 1), y, 3, 0, Math.PI * 2), ['#EC4899', '#60A5FA', '#4ADE80'][k % 3]); }
      // (a cloud on top, googly eyes)
      for (const [dx, r] of [[-16, 11], [0, 15], [16, 11]] as const) inked(c, () => c.arc(cx + dx, TOP - FR - 4, r, 0, Math.PI * 2), '#FFFFFF');
      box(c, cx - 26, TOP - FR - 4, 52, 10, '#FFFFFF');
      break;
    }
    case 'hollywood': {
      ring(['#18181B', '#27272A', '#CA8A04', '#27272A'], FR + 1);
      for (const s of [-1, 1]) { const x = s < 0 ? L - 12 : Rr + FR + 2; slab(c, x, BASE - 90, 10, 90, R6('#27272A')); for (let k = 0; k < 5; k++) box(c, x + 2, BASE - 82 + k * 16, 6, 2, '#CA8A04'); slab(c, x - 2, BASE - 98, 14, 8, R6('#3F3F46')); }
      break;
    }
    case 'fantasy': {
      ring(['#A8A29E', '#D6D3D1', '#E7E5E4', '#D6D3D1'], FR + 1, true);
      for (const s of [-1, 1]) { const x = s < 0 ? L - 14 : Rr + FR + 2; slab(c, x, BASE - 74, 12, 74, R6('#D6D3D1')); inked(c, () => { c.moveTo(x - 3, BASE - 74); c.lineTo(x + 6, BASE - 100); c.lineTo(x + 15, BASE - 74); c.closePath(); }, '#2563EB'); }
      // (a gilded crown in the keystone)
      inked(c, () => { c.moveTo(cx - 9, TOP - FR + 2); c.lineTo(cx - 9, TOP - FR - 8); c.lineTo(cx - 4, TOP - FR - 3); c.lineTo(cx, TOP - FR - 10); c.lineTo(cx + 4, TOP - FR - 3); c.lineTo(cx + 9, TOP - FR - 8); c.lineTo(cx + 9, TOP - FR + 2); c.closePath(); }, '#F6D365');
      break;
    }
    case 'adventure': {
      ring(['#78716C', '#A8A29E', '#D6D3D1', '#A8A29E'], FR + 1, true);
      for (let k = 0; k < 6; k++) box(c, cx - HW - FR + 1 + (k % 2) * 2, TOP + 30 + k * 10, 4, 4, '#57534E');
      for (let k = 0; k < 6; k++) box(c, cx + HW + 2 + (k % 2) * 2, TOP + 34 + k * 10, 4, 4, '#57534E');
      // (the idol's face over it: glaring)
      slab(c, cx - 18, TOP - FR - 20, 36, 24, R6('#8A847C'));
      box(c, cx - 12, TOP - FR - 14, 8, 5, INK); box(c, cx + 4, TOP - FR - 14, 8, 5, INK); box(c, cx - 9, TOP - FR - 13, 3, 3, '#F59E0B'); box(c, cx + 7, TOP - FR - 13, 3, 3, '#F59E0B');
      box(c, cx - 9, TOP - FR - 5, 18, 4, INK); for (let k = 0; k < 4; k++) box(c, cx - 8 + k * 4, TOP - FR - 5, 2, 2, '#E7E5E4');
      for (const x of [cx - HW - 2, cx + HW - 2]) for (let k = 0; k < 5; k++) box(c, x + (k % 2) * 2, TOP + 6 + k * 9, 3, 9, '#15803D');
      break;
    }
    case 'foreign': {
      ring(['#1E3A8A', '#F8FAFC', '#1E40AF', '#DC2626'], FR + 1, true);
      // (tiles round it: the mosaic)
      for (let a = 0; a < 9; a++) { const t = Math.PI + (a / 8) * Math.PI; box(c, cx + Math.cos(t) * (HW + FR / 2) - 1, TOP + HW + Math.sin(t) * (HW + FR / 2) - 1, 3, 3, a % 2 ? '#FDE047' : '#F8FAFC'); }
      break;
    }
  }
};

/** The sign over a portal, in the land's lettering (its own stamp, put down after the swirl: nothing's ever over it). Its
 *  top kept under the string lights' lowest bulbs, its foot on the frame. */
/** Where a portal's sign sits (round its spot's middle): its lettering, width, height, top. */
const signBox = (land: Land) => {
  const look = LAND_LOOK[land.id](land.id !== 'hollywood');
  const big = land.id === 'hollywood' ? LAND_LOOK.hollywood(true) : look;
  const tw = signW(land.name, big) + 14, th = (big.sy ?? 1) * 7 + 10, ty = TOP - FR - (land.id === 'adventure' ? 26 : land.id === 'spooky' ? 26 : land.id === 'cartoon' ? 22 : 8) - th;
  return { big, tw, th, ty };
};
export const paintGateSign = (c: Ctx, land: Land, cx: number) => {
  const { big, tw, th, ty } = signBox(land);
  const board = land.sign;
  box(c, cx - tw / 2 - 1, ty - 1, tw + 2, th + 2, INK);
  box(c, cx - tw / 2, ty, tw, th, board); box(c, cx - tw / 2, ty, tw, 2, mix(board, '#FFFFFF', 0.25)); box(c, cx - tw / 2, ty + th - 2, tw, 2, mix(board, '#000000', 0.3));
  if (land.id === 'frontier') for (let k = 3; k < th; k += 4) box(c, cx - tw / 2 + 2, ty + k, tw - 4, 1, mix(board, '#000000', 0.2));
  // (posts up from the frame to it)
  for (const s of [-1, 1]) box(c, cx + s * (tw / 2 - 8) - 1, ty + th, 3, TOP - FR - ty - th + 2, mix(board, '#000000', 0.35));
  signText(c, land.name, cx, ty + th - 5, big);
};

/** The gateposts at the mouth of the path, by land (stamped; their flames live: drawGateLive). */
export const paintPosts = (c: Ctx, land: Land, cx: number) => {
  const y = ROW.fence + 2, hw = (PATH.far / depthAt(GATE.base)) * depthAt(y) + 8;
  for (const s of [-1, 1]) {
    const x = cx + s * hw;
    switch (land.id) {
      case 'space': { const C = ['#2A3248', '#4A5670', '#7A88A4', '#AEBAD0', '#DCE4F0', '#FFFFFF']; box(c, x - 5, y - 46, 10, 46, INK); for (let u = 0; u < 8; u++) box(c, x - 4 + u, y - 45, 1, 45, C[[4, 5, 5, 4, 3, 3, 2, 1][u]]); for (let k = 0; k < 4; k++) box(c, x - 4, y - 38 + k * 10, 8, 1, C[2]); c.fillStyle = INK; c.beginPath(); c.ellipse(x, y - 46, 10, 4, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#1A808C'; c.beginPath(); c.ellipse(x, y - 45, 9, 3, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#49B4B8'; c.beginPath(); c.ellipse(x - 1, y - 47, 8, 2, 0, 0, Math.PI * 2); c.fill(); break; }
      case 'frontier': slab(c, x - 4, y - 44, 8, 44, R6('#7A4E2A')); inked(c, () => c.rect(x - 5, y - 54, 10, 10), '#3F3F46'); box(c, x - 3, y - 52, 6, 6, '#FDE68A'); break;
      case 'spooky': slab(c, x - 7, y - 34, 14, 34, R6('#6E6684')); inked(c, () => c.ellipse(x, y - 40, 9, 7, 0, 0, Math.PI * 2), '#EA580C'); box(c, x - 1, y - 49, 2, 3, '#3F6212'); box(c, x - 5, y - 42, 3, 2, INK); box(c, x + 2, y - 42, 3, 2, INK); box(c, x - 4, y - 38, 8, 2, INK); break;
      case 'cartoon': {
        c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 9; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 46); c.arc(x - s * 8, y - 46, 8, 0, Math.PI, true); c.stroke();
        c.strokeStyle = '#FFFFFF'; c.lineWidth = 6; c.stroke(); c.setLineDash([4, 4]); c.strokeStyle = '#DC2626'; c.stroke(); c.setLineDash([]); c.lineCap = 'butt';
        break;
      }
      case 'hollywood': slab(c, x - 5, y - 50, 10, 50, R6('#E8DCC4')); for (let k = 0; k < 3; k++) box(c, x - 3, y - 44 + k * 12, 6, 2, '#C9A227'); inked(c, () => c.arc(x, y - 54, 5, 0, Math.PI * 2), '#FDE68A'); break;
      case 'fantasy': slab(c, x - 6, y - 38, 12, 38, R6('#D6D3D1')); inked(c, () => c.arc(x, y - 43, 6, 0, Math.PI * 2), '#F6D365'); box(c, x - 3, y - 46, 2, 2, '#FFFBEB'); break;
      case 'adventure': {
        // (a tiki torch: lashed bamboo, the cup)
        box(c, x - 2, y - 50, 5, 50, INK); box(c, x - 1, y - 50, 3, 50, '#B4CC5C'); box(c, x - 1, y - 50, 1, 50, '#E0F0A0'); box(c, x + 1, y - 50, 1, 50, '#7A9A30'); for (let k = 0; k < 4; k++) { box(c, x - 2, y - 44 + k * 12, 5, 1, '#6A8A28'); box(c, x - 1, y - 43 + k * 12, 3, 1, '#D8E890'); }
        for (let k = 0; k < 3; k++) box(c, x - 3, y - 54 + k * 2, 7, 1, '#C8A060');
        inked(c, () => { c.moveTo(x - 6, y - 56); c.lineTo(x + 6, y - 56); c.lineTo(x + 3, y - 48); c.lineTo(x - 3, y - 48); c.closePath(); }, '#8A5A32');
        break;
      }
      case 'foreign': box(c, x - 2, y - 60, 5, 60, INK); box(c, x - 1, y - 60, 3, 60, '#78716C'); box(c, x - 1, y - 60, 1, 60, '#D6D3D1'); box(c, x - 5, y - 4, 11, 4, INK); box(c, x - 4, y - 3, 9, 3, '#A8A29E'); c.fillStyle = INK; c.beginPath(); c.arc(x, y - 62, 4, 0, Math.PI * 2); c.fill(); c.fillStyle = '#D09A30'; c.beginPath(); c.arc(x, y - 62, 3, 0, Math.PI * 2); c.fill(); box(c, x - 2, y - 64, 1, 1, '#FFF0A8'); break;
    }
  }
};

/** Where a portal's queue runs (beside its path, along the back of the walk): its left and right ends. */
export const queueSpan = (cx: number) => { const hw = (PATH.far / depthAt(GATE.base)) * depthAt(ROW.fence + 2) + 8; return [cx - hw - 112, cx - hw - 16] as const; };
/** A queue rail (one run of it, feet at ry): posts, the rope swagged between, and at its head (`sign`) the wait. */
export const paintQueueRail = (c: Ctx, land: Land, cx: number, ry: number, sign: boolean) => {
  const [qx0, qx1] = queueSpan(cx);
  for (let x = qx0; x <= qx1 + 1; x += 32) { box(c, x - 2, ry - 16, 5, 16, INK); box(c, x - 1, ry - 15, 1, 15, '#F5F5F4'); box(c, x, ry - 15, 1, 15, '#A8A29E'); box(c, x + 1, ry - 15, 1, 15, '#57534E'); box(c, x - 2, ry - 17, 5, 2, '#D6D3D1'); box(c, x - 4, ry - 3, 9, 3, INK); box(c, x - 3, ry - 2, 7, 2, '#71717A'); box(c, x - 3, ry - 2, 7, 1, '#D6D3D1'); }
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); for (let x = qx0; x < qx1; x += 32) { c.moveTo(x, ry - 12); c.quadraticCurveTo(x + 16, ry - 7, x + 32, ry - 12); } c.stroke();
  c.strokeStyle = mix(land.swirl[1], INK, 0.25); c.lineWidth = 2; c.stroke();
  c.strokeStyle = mix(land.swirl[1], '#FFFFFF', 0.35); c.lineWidth = 1; c.beginPath(); for (let x = qx0; x < qx1; x += 32) { c.moveTo(x + 2, ry - 12.5); c.quadraticCurveTo(x + 16, ry - 8, x + 30, ry - 12.5); } c.stroke();
  if (!sign) return;
  box(c, qx1 + 1, ry - 34, 2, 20, INK);
  box(c, qx1 - 20, ry - 46, 44, 14, INK); box(c, qx1 - 19, ry - 45, 42, 12, land.sign); box(c, qx1 - 19, ry - 45, 42, 1, mix(land.sign, '#FFFFFF', 0.3)); box(c, qx1 - 19, ry - 35, 42, 2, mix(land.sign, '#000000', 0.3));
  signText(c, 'WAIT 5 MIN', qx1 + 2, ry - 36, { sx: 1, sy: 1, fill: land.signText });
};

/** The still part of a portal (one stamp): the land through its opening, its frame and sign. */
export const paintGate = (c: Ctx, land: Land, cx: number) => {
  // (a glow round the opening, under the swirl: the land's light stepped out)
  for (let k = 3; k >= 1; k--) { c.fillStyle = mix(land.swirl[0], land.swirl[1], k / 4); c.globalAlpha = 0.18 + 0.1 * (3 - k); c.beginPath(); c.ellipse(cx, GATE_MID - 4, HW + FR + GATE.halo + k * 3, H * 0.5 + FR + GATE.halo + k * 3, 0, 0, Math.PI * 2); c.fill(); }
  c.globalAlpha = 1;
  paintVista(c, land, cx);
  paintFrame(c, land, cx);
};

/**
 * The swirl round the outside of the portal (live): a band of the land's deep color round the frame, its arms (the
 * mid and the bright colors) curving out round it and turning, a lit rim crawling round the outside, flecks flung off. `f` the swirl's clock (run ahead as it takes
 * him). Only the part above the ground.
 */
export const drawSwirl = (c: Ctx, land: Land, cx: number, f: number, surge = 0) => {
  const rx0 = HW + FR + 3, ry0 = H * 0.5 + FR + 3, cy = GATE_MID - 4;
  // (the angles of the ellipse that are above the portal's foot)
  const lim = (r: number) => Math.asin(Math.max(-1, Math.min(1, (BASE - cy) / r)));
  const [deep, mid, hi] = land.swirl, halo = GATE.halo + surge * 6;
  c.save();
  c.lineCap = 'round';
  // (the bed of it: the deep color, a band round the frame)
  { const rx = rx0 + halo / 2, ry = ry0 + halo / 2, a = lim(ry); c.globalAlpha = 0.75; c.strokeStyle = deep; c.lineWidth = halo; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, Math.PI - a, Math.PI * 2 + a); c.stroke(); c.globalAlpha = 1; }
  // (its arms: curving out round it as they go, turning; the bright ones over the mid ones)
  const spin = f * (0.035 + surge * 0.12);
  for (let pass = 0; pass < 2; pass++) for (let j = pass; j < 12; j += 2) {
    const th0 = (j / 12) * Math.PI * 2 + spin;
    c.strokeStyle = pass ? hi : mid; c.lineWidth = pass ? 2 : 3;
    c.beginPath();
    let pen = false;
    for (let k = 0; k <= 6; k++) {
      const t = k / 6, th = th0 + t * 0.8, x = cx + Math.cos(th) * (rx0 + t * halo), y = cy + Math.sin(th) * (ry0 + t * halo);
      if (y > BASE - 1) { pen = false; continue; }
      if (pen) c.lineTo(x, y); else { c.moveTo(x, y); pen = true; }
    }
    c.stroke();
  }
  // (a lit rim round the outside of it)
  { const rx = rx0 + halo, ry = ry0 + halo, a = lim(ry); c.setLineDash([3, 5]); c.lineDashOffset = -f * 0.5; c.strokeStyle = hi; c.lineWidth = 1; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, Math.PI - a, Math.PI * 2 + a); c.stroke(); c.setLineDash([]); }
  // (flecks going round, spiraling out)
  for (let k = 0; k < 10; k++) {
    const t = ((f * (0.012 + surge * 0.03) + k / 10) % 1), ang = k * 2.4 + f * 0.05 * (k % 2 ? 1 : -1), r = 1 + t * 0.35;
    const x = cx + Math.cos(ang) * (rx0 + 6) * r, y = cy + Math.sin(ang) * (ry0 + 6) * r;
    if (y > BASE - 2) continue;
    box(c, x - 1, y - 1, 2, 2, k % 3 ? '#FFFFFF' : hi);
  }
  c.restore();
};

/** The shimmer through the opening (live): a light band rising up it now and then. */
export const drawShimmer = (c: Ctx, land: Land, cx: number, f: number) => {
  const t = (f % 150) / 150;
  if (t > 0.5) return;
  const y = BASE - (t / 0.5) * H;
  c.save(); c.beginPath(); openingPath(c, cx); c.clip();
  c.globalAlpha = 0.35 * Math.sin((t / 0.5) * Math.PI);
  box(c, cx - HW, y, HW * 2, 2, '#FFFFFF'); box(c, cx - HW, y + 4, HW * 2, 1, land.swirl[2]);
  c.restore();
};

/** The flames and lights at the posts (live). */
export const drawPostsLive = (c: Ctx, land: Land, cx: number, f: number) => {
  const y = ROW.fence + 2, hw = (PATH.far / depthAt(GATE.base)) * depthAt(y) + 8;
  for (const s of [-1, 1]) {
    const x = cx + s * hw, fl = Math.sin(f * 0.4 + s * 2) * 1.5;
    if (land.id === 'adventure') { box(c, x - 4, y - 66 + fl, 8, 10, '#F97316'); box(c, x - 2, y - 63 + fl, 4, 6, '#FDE047'); box(c, x - 1, y - 70 + fl * 2, 2, 4, '#FB923C'); }
    else if (land.id === 'spooky') { box(c, x - 4, y - 42, 2, 2, (f + s * 7) % 23 < 3 ? '#7C2D12' : '#FDE047'); box(c, x + 2, y - 42, 2, 2, (f + s * 7) % 23 < 3 ? '#7C2D12' : '#FDE047'); }
    else if (land.id === 'space') { if (((f >> 4) + (s > 0 ? 1 : 0)) % 2) box(c, x - 1, y - 50, 2, 2, '#FFFFFF'); }
    else if (land.id === 'foreign') { c.fillStyle = s < 0 ? '#DC2626' : '#1E40AF'; c.beginPath(); c.moveTo(x + 1, y - 58); c.lineTo(x + 16, y - 55 + Math.sin(f * 0.1 + s) * 2); c.lineTo(x + 1, y - 50); c.fill(); }
  }
  void hash;
};

export type { StretchId };

// ---------------------------------------------------------------------------------------------------------------
// CLEAR: a land he's cleared gets a flag on its portal. A pole clamped to the sign's right end (beside it, never
// over it: the sign stays whole; its top kept under the string lights), a cloth in the sign's own color flying out
// from it with CLEAR across it in the land's lettering, bold. Waving: a few frames of it, each a stamp (painted once,
// put down with one drawImage), the cloth cut in two-pixel columns each lifted on the wave, stepped light and shade
// down the folds (dithered at the turns).

/** How many frames the cloth's wave goes round in, and how long each's held (game frames). */
const FLAG_FRAMES = 8, FLAG_HOLD = 7;
const clearLook = (land: Land) => {
  const l = LAND_LOOK[land.id](land.id !== 'hollywood');
  return { ...l, sy: 2, bold: true };
};
/** The flag's place round the spot's middle: the pole (x), its top, the cloth's size, the box it's all inside. */
const flagBox = (land: Land, word: FlagWord) => {
  const { tw, th, ty } = signBox(land), look = clearLook(land);
  const px = Math.round(tw / 2) + 4, top = Math.max(Math.round(ty) - 4, 360), foot = Math.round(ty + th) + 3;
  const cw = Math.round(signW(word, look)) + 14, ch = 7 * (look.sy ?? 1) + 10;
  return { look, px, top, foot, cw, ch, ty: Math.round(ty), th: Math.round(th), box: [px - 6, top - 8, cw + 16, Math.max(foot, top + ch + 8) - top + 12] as const };
};

/** The cloth, flat (x0, y0 its top left, the hem at the pole's side). */
const paintCloth = (c: Ctx, land: Land, x0: number, y0: number, cw: number, ch: number, look: ReturnType<typeof clearLook>, word: FlagWord) => {
  const R = R6(land.sign), trim = land.swirl[2];
  box(c, x0 - 1, y0 - 1, cw + 2, ch + 2, INK);
  box(c, x0, y0, cw, ch, R[3]);
  box(c, x0, y0, cw, 2, R[4]); checker(c, x0, y0 + 2, cw, 2, R[4]);
  box(c, x0, y0 + ch - 2, cw, 2, R[1]); checker(c, x0, y0 + ch - 4, cw, 2, R[2]);
  // (a trim line round it in the land's bright color, the hem down the pole side with its grommets)
  box(c, x0 + 5, y0 + 2, cw - 7, 1, trim); box(c, x0 + 5, y0 + ch - 3, cw - 7, 1, mix(trim, INK, 0.3)); box(c, x0 + cw - 3, y0 + 2, 1, ch - 4, mix(trim, INK, 0.15));
  box(c, x0, y0, 4, ch, R[1]); box(c, x0 + 4, y0, 1, ch, INK);
  for (const gy of [y0 + 3, y0 + ch - 6]) { box(c, x0 + 1, gy, 2, 3, '#D6D3D1'); box(c, x0 + 1, gy + 1, 1, 1, INK); }
  signText(c, word, x0 + 5 + (cw - 7) / 2, y0 + ch - 5, look);
};

/** One frame of the flag (k of FLAG_FRAMES), the pole and its clamps with it. */
const paintFlag = (c: Ctx, land: Land, cx: number, k: number, word: FlagWord) => {
  const { look, px, top, foot, cw, ch, ty, th } = flagBox(land, word), x = cx + px;
  const ph = (k / FLAG_FRAMES) * Math.PI * 2;
  // (the pole: inked, lit down its left, a gold knob on top)
  box(c, x - 1, top - 1, 4, foot - top + 1, INK); box(c, x, top, 2, foot - top - 1, '#A8A29E'); box(c, x, top, 1, foot - top - 1, '#F5F5F4');
  inked(c, () => c.arc(x + 1, top - 3, 2.5, 0, Math.PI * 2), '#E0AE3A'); box(c, x, top - 5, 1, 1, '#FFF6C8');
  // (clamped to the sign's end)
  for (const cy of [ty + 3, ty + th - 6]) { box(c, cx + px - 6, cy - 1, 9, 4, INK); box(c, cx + px - 5, cy, 7, 2, '#78716C'); box(c, cx + px - 5, cy, 7, 1, '#D6D3D1'); }
  // (the cloth, cut in columns, each lifted on the wave: more the farther from the pole; light and shade down the folds)
  const x0 = x + 3, y0 = top + 1, lit = mix(land.sign, '#FFFFFF', 0.3), shade = mix(land.sign, INK, 0.45);
  for (let col = 0; col < cw + 2; col += 2) {
    const u = col / cw, a = ph - u * 4.4, dy = Math.round(2.6 * Math.min(1, u * 1.6) * Math.sin(a)), s = Math.cos(a) * Math.min(1, u * 2);
    c.save(); c.beginPath(); c.rect(x0 - 1 + col, y0 - 6, 2, ch + 12); c.clip();
    c.translate(0, dy);
    paintCloth(c, land, x0, y0, cw, ch, look, word);
    if (col >= 6 && col < cw) {
      if (s > 0.6) { c.globalAlpha = 0.35; box(c, x0 - 1 + col, y0, 2, ch, lit); c.globalAlpha = 1; }
      else if (s > 0.3) checker(c, x0 - 1 + col, y0, 2, ch, lit, col & 1);
      else if (s < -0.6) { c.globalAlpha = 0.35; box(c, x0 - 1 + col, y0, 2, ch, shade); c.globalAlpha = 1; }
      else if (s < -0.3) checker(c, x0 - 1 + col, y0, 2, ch, shade, col & 1);
    }
    c.restore();
  }
};

/** What the flag says: CLEAR (the boss beaten), or 100% (that and every collectible found: store.ts isLandComplete). */
export type FlagWord = 'CLEAR' | '100%';
/** A cleared land's flag on its portal (live in that it waves; each frame of it a stamp). */
export const drawClearFlag = (c: Ctx, land: Land, cx: number, f: number, word: FlagWord = 'CLEAR') => {
  const k = Math.floor(f / FLAG_HOLD) % FLAG_FRAMES, [bx, by, bw, bh] = flagBox(land, word).box;
  c.translate(cx, 0); stamp(c, `hubFlag|${land.id}|${word}|${k}`, bx, by, bw, bh, g => paintFlag(g, land, 0, k, word)); c.translate(-cx, 0);
};
