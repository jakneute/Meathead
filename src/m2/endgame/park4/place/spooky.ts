// HELL'S BALLROOM (Donnie Dracula's refight, GLUTTONY): Ned's cheap recreation of the ballroom he died in. Nothing of
// it's the real thing: the walls are plywood stage flats rolled rotten purple, a damask stenciled on them by somebody
// who ran out of paint, propped up in front of hell (a flat's missing: out through the gap, heaps of rot to the
// horizon, a fork stuck in one); the pilasters are carpet tubes sprayed gold, a paint bucket for a capital, a cinder
// block for a plinth; the velvet swags are strings of gone-off sausages; the mirror's tin foil, the sconce is candle
// stubs in bottles, the count's portrait is done in crayon from memory. The chandeliers are hula hoops on twine (Ned's
// intro says so), sporks and wishbones hung off them for crystals. And the punishment, which doesn't land (he's
// thrilled): one buffet the length of the room, all of it rotten, seconds mandatory.
//
// Rotten purple and bile green, candle yellow. All of it painted once (stamps); live: a few flies over the buffet, the
// bile's bubbles out in the gap. It goes in through spooky/ballroom/art.ts's BALL_HOOKS, each at the depth of what it
// stands in for (the depth list's in the job's report):
//   - the wall tile: the back wall's, at WALL_D, behind everything;
//   - the buffet and the banner: at WALL_D against the wall, where the land's buffet, DJ table and banner go (dimmed a
//     step like them: not stood on);
//   - the hoops: at his plane, where the chandeliers go (stood on: the same lit lip, the same place and width);
//   - the floor: the dance floor's own tiles, their colors only.

import type { GameState } from '../../../../m1/game/core/state';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../../../../m1/constants';
import type { HellPlace } from '../defs';
import { GY } from '../../../spooky/geometry';
import {
  INK, box, slab, pole, ball, mix, checker, hazeBands, stamp, hash, pixelBlob, steppedGlow, bandedGradient,
  CEIL, inked, standTop, seg,
} from '../../../spooky/control/paint';
import { ARENA_L, ARENA_R, ARENA_MID } from '../../../spooky/ballroom/arena';
import { BALL_HOOKS } from '../../../spooky/ballroom/art';
import { signAt, signW, print, type Look } from '../../../spooky/letters';

type Ctx = CanvasRenderingContext2D;

/** Rotten purple (the roller's paint), bile green (mold, slop), plywood, the tubes' gold spray, hell's rock, meat. */
const RP = ['#12061C', '#1E0A2E', '#2E1244', '#40195C', '#562A78', '#7444A0'];
const BILE = ['#1A2408', '#2E3F0C', '#4D6A12', '#73991C', '#A3C83A', '#D6F07A'];
const PLY = ['#2A1E10', '#4A361C', '#6E522C', '#8E6E40', '#B08E5A', '#CFB07E'];
const TUBE = ['#3A2C0A', '#5E4A12', '#86701E', '#AD942E', '#CDB650', '#E8D88A'];
const ROCK = ['#0E0810', '#1A1020', '#281A30', '#3A2842', '#50385A'];
const MEAT = ['#2E1E18', '#4E3428', '#74503C', '#96705A', '#B8947A'];
const SHEET = ['#5E6048', '#84866A', '#A8AA8C', '#C8CAAE', '#E2E4CC'];
const TAPE = ['#5A5E66', '#8A8E96', '#B4B8C0'];
const WAX = '#E8E2C8', FLAME = '#FDE047';

const fillPath = (g: Ctx, col: string, path: () => void) => { g.fillStyle = col; g.beginPath(); path(); g.fill(); };

// ---------------------------------------------------------------------------------------------------------------
// The sky: what's out through the gap in the flats (screen space, painted once)

const paintSky = (g: Ctx) => {
  const HZ = 336;
  bandedGradient(g, 0, 0, W, HZ, ['#07030C', '#12061C', '#1E0A2E', '#2E1244', '#3E1A4E', '#4A3A2E', '#5E6A1A', '#8AAE2A'], 14);
  // (the glow along the horizon, in steps)
  steppedGlow(g, 520, HZ + 10, 220, '#D6F07A', 0.2, 0.0, 6);
  // (far heaps: mounds of it, hazed at their feet)
  const mound = (cx: number, base: number, rw: number, rh: number, col: string, rim: string) => {
    for (let x = Math.floor((cx - rw) / 2) * 2; x < cx + rw; x += 2) {
      const u = (x - cx) / rw, h = Math.floor((rh * Math.sqrt(Math.max(0, 1 - u * u)) * (0.86 + 0.14 * Math.sin(x * 0.21 + cx))) / 2) * 2;
      if (h <= 0) continue;
      g.fillStyle = col; g.fillRect(x, base - h, 2, h);
      g.fillStyle = rim; g.fillRect(x, base - h, 2, 2);
    }
  };
  for (const [cx, rw, rh] of [[90, 150, 70], [330, 190, 96], [610, 170, 82], [770, 120, 60]] as const) mound(cx, HZ, rw, rh, '#2A1238', '#4A2A5A');
  hazeBands(g, 0, HZ - 60, W, 60, '#5E6A1A', 0, 0.45, 5);
  // (a fork stuck in the heap out past the gap, a knife further off: far silhouettes)
  const fork = (x: number, foot: number, h: number, col: string, lit: string) => {
    box(g, x - 3, foot - h * 0.55, 6, h * 0.55, col); box(g, x - 3, foot - h * 0.55, 2, h * 0.55, lit);
    box(g, x - 11, foot - h * 0.68, 22, h * 0.14, col); box(g, x - 11, foot - h * 0.68, 22, 2, lit);
    for (const dx of [-11, -4, 3, 9]) { box(g, x + dx, foot - h, 3, h * 0.34, col); box(g, x + dx, foot - h, 1, h * 0.34, lit); }
  };
  fork(505, HZ - 34, 118, '#1A0A26', '#3E2A4E');
  box(g, 232, HZ - 150, 10, 110, '#241034'); box(g, 232, HZ - 150, 2, 110, '#3E2A4E'); fillPath(g, '#241034', () => { g.moveTo(232, HZ - 150); g.lineTo(242, HZ - 150); g.lineTo(242, HZ - 190); g.closePath(); });
  // (nearer heaps: bones and platters sticking out of them)
  for (const [cx, rw, rh] of [[200, 130, 46], [470, 120, 40], [560, 90, 52], [720, 140, 44]] as const) mound(cx, HZ + 6, rw, rh, '#1A0A26', '#34204A');
  for (let i = 0; i < 26; i++) { const x = 20 + hash(i * 3.1) * 760, y = HZ - 6 - hash(i * 7.7) * 34; box(g, x, y, 2 + (i % 3) * 2, 2, i % 4 ? '#6A5A70' : '#8A9A4A'); }
  hazeBands(g, 0, HZ - 30, W, 36, '#73991C', 0, 0.3, 4);
  // (the lake of bile out to it: banded, glints along it)
  bandedGradient(g, 0, HZ + 6, W, H - HZ - 6, ['#8AAE2A', '#5E7E18', '#3E5A10', '#2A3F0C', '#1A2808', '#0E1606'], 10);
  for (let i = 0; i < 60; i++) { const y = HZ + 10 + hash(i * 1.7) * 150, x = hash(i * 9.3) * W; box(g, x, y, 6 + hash(i) * 26, 2, i % 3 ? '#A3C83A' : '#D6F07A'); }
  // (hell's roof: rock teeth down from the top, dripping)
  for (let i = 0; i < 16; i++) {
    const x = i * 54 + hash(i * 2.3) * 30, w = 26 + hash(i * 5.1) * 40, h = 40 + hash(i * 8.9) * 110;
    fillPath(g, ROCK[1], () => { g.moveTo(x - w / 2, 0); g.lineTo(x + w * 0.1, h); g.lineTo(x + w / 2, 0); g.closePath(); });
    fillPath(g, ROCK[2], () => { g.moveTo(x - w / 2, 0); g.lineTo(x + w * 0.1, h); g.lineTo(x - w * 0.1, 0); g.closePath(); });
    box(g, x + w * 0.1 - 1, h, 2, 6 + hash(i) * 10, BILE[3]);
  }
};

/** The bile's bubbles and a few flies out there (seen only through the gap: the room's drawn over the rest). */
const skyLive = (c: Ctx, state: GameState) => {
  const f = state.frame;
  c.fillStyle = BILE[5];
  for (let i = 0; i < 14; i++) {
    const x = (i * 131 + 37) % W, u = ((f * (0.4 + (i % 4) * 0.15) + i * 61) % 170) / 170;
    c.fillRect(x + Math.round(Math.sin(f * 0.03 + i) * 3), Math.round(352 - u * 150), 2, 2);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The back wall: plywood flats (a tile's 200 wide, a carpet tube at each end)

/** A flat from xa to xb: plywood rolled purple, the stenciled damask, where the paint ran out, mold up from the floor;
 *  its painted-on wainscot. */
const flat = (g: Ctx, xa: number, xb: number, seed: number) => {
  const y0 = CEIL + 14, w = xb - xa, mid = GY - 120;
  box(g, xa, y0, w, GY - y0, '#36164E');
  checker(g, xa, y0, w, mid - y0, 'rgba(18, 6, 28, 0.22)');
  // (the roller's passes: lighter and darker stripes down it, not quite straight)
  for (let k = 0; xa + k < xb; k += 22) { const col = [RP[3], RP[2], RP[1], RP[2]][(k / 22 + seed) % 4 | 0]; g.globalAlpha = 0.35; box(g, xa + k, y0, 14 + ((k * 7 + seed) % 6), mid - y0, col); g.globalAlpha = 1; }
  g.save(); g.beginPath(); g.rect(xa, y0, w, mid - y0); g.clip();
  // (the damask: a stencil of a diamond with a blob in it, gone on crooked; some skipped, some run)
  for (let row = 0; row * 40 < mid - y0 + 40; row++) for (let col = -1; col * 44 < w + 44; col++) {
    const n = row * 17 + col * 5 + seed * 3, h1 = hash(n), h2 = hash(n * 1.9);
    if (h1 < 0.1) continue;
    const cx = xa + col * 44 + 22 + (row % 2 ? 22 : 0) + Math.round((h2 - 0.5) * 6), cy = y0 + row * 40 + 22 + Math.round((h1 - 0.5) * 6);
    const faint = h2 < 0.22;
    fillPath(g, RP[0], () => { g.moveTo(cx + 1, cy - 15); g.lineTo(cx + 12, cy + 1); g.lineTo(cx + 1, cy + 17); g.lineTo(cx - 10, cy + 1); g.closePath(); });
    fillPath(g, faint ? RP[3] : RP[4], () => { g.moveTo(cx, cy - 16); g.lineTo(cx + 11, cy); g.lineTo(cx, cy + 16); g.lineTo(cx - 11, cy); g.closePath(); });
    fillPath(g, RP[2], () => { g.moveTo(cx, cy - 9); g.lineTo(cx + 6, cy); g.lineTo(cx, cy + 9); g.lineTo(cx - 6, cy); g.closePath(); });
    box(g, cx - 2, cy - 3, 4, 6, faint ? RP[3] : RP[5]); box(g, cx - 2, cy - 3, 2, 2, faint ? RP[4] : '#9A72C0');
    if (h1 > 0.72) { const len = 8 + Math.round(h2 * 26); box(g, cx - 1, cy + 14, 2, len, RP[4]); box(g, cx - 1, cy + 14 + len, 2, 2, RP[5]); }
  }
  // (where the paint ran out: bare plywood, its grain, the roller's ragged edge dithered into it)
  const bare = (bx: number, by: number, bw: number, bh: number) => {
    box(g, bx, by, bw, bh, PLY[2]);
    for (let k = 0; k < bh; k += 5) box(g, bx, by + k + ((k * 3) % 2), bw, 1, k % 10 ? PLY[1] : PLY[3]);
    checker(g, bx - 4, by, 4, bh, PLY[2]); checker(g, bx + bw, by, 4, bh, PLY[2]); checker(g, bx, by - 4, bw, 4, PLY[2]); checker(g, bx, by + bh, bw, 4, PLY[2], 1);
    box(g, bx + bw * 0.3, by + bh * 0.4, 6, 4, PLY[0]); box(g, bx + bw * 0.3 + 1, by + bh * 0.4 + 1, 3, 2, PLY[1]);
  };
  if (seed % 2 === 0) bare(xa + w * 0.55, y0 + 210, Math.min(46, w * 0.3), 70); else bare(xa + 10, y0 + 120, Math.min(34, w * 0.3), 96);
  if (seed % 3 === 0) bare(xb - 30, mid - 60, 24, 60);
  g.restore();
  // (the sheets' seams and their screws)
  for (let sx = xa + 96; sx < xb - 20; sx += 96) { box(g, sx, y0, 1, GY - y0, RP[0]); box(g, sx + 1, y0, 1, GY - y0, RP[3]); for (let y = y0 + 30; y < GY - 10; y += 74) { box(g, sx - 3, y, 3, 3, INK); box(g, sx - 2, y, 1, 1, TAPE[2]); } }
  box(g, xa, y0, 2, GY - y0, PLY[4]); box(g, xa + 2, y0, 1, GY - y0, INK); box(g, xb - 2, y0, 2, GY - y0, PLY[1]); box(g, xb - 3, y0, 1, GY - y0, INK);
  // (the dark up under the ceiling)
  hazeBands(g, xa, y0, w, 150, '#07030C', 0.5, 0, 6);
  // (the wainscot: painted on. A darker band, a gold line along its top (by hand), panels drawn in gold, not square)
  box(g, xa + 3, mid, w - 6, GY - mid, RP[1]);
  checker(g, xa + 3, mid, w - 6, 4, RP[2]);
  for (let k = xa + 3; k < xb - 3; k += 8) box(g, k, mid - 2 + (hash(k * 0.7 + seed) < 0.4 ? 1 : 0), 8, 2, k % 16 ? TUBE[3] : TUBE[4]);
  for (let px = xa + 30; px + 34 < xb - 8; px += 43) {
    const j = Math.round((hash(px + seed) - 0.5) * 4), top = GY - 100 + j, bot = GY - 22 - j;
    box(g, px, top, 34, 2, TUBE[3]); box(g, px + j, bot, 34, 2, TUBE[2]); box(g, px, top, 2, bot - top, TUBE[3]); box(g, px + 32 + j, top + 1, 2, bot - top, TUBE[2]);
    box(g, px + 6, top + 8, 2, 20 + j * 3, TUBE[2]); box(g, px + 33, bot + 2, 2, 6 + (px % 7), TUBE[2]);
  }
  // (mold up from the floor, and round the screws up top)
  for (let i = 0; i < 7; i++) { const mx = xa + 12 + hash(seed * 5 + i * 2.7) * (w - 24), mh = 8 + hash(seed + i * 4.1) * 30; pixelBlob(g, mx, GY - mh * 0.4, 12 + hash(i + seed) * 14, mh, BILE[1]); pixelBlob(g, mx + 2, GY - mh * 0.3, 7 + hash(i * 3 + seed) * 6, mh * 0.5, BILE[2]); }
  for (let i = 0; i < 5; i++) box(g, xa + 10 + hash(seed + i * 6.3) * (w - 20), GY - 6 - hash(i * 2.2 + seed) * 40, 2, 2, BILE[4]);
  box(g, xa, GY - 4, w, 4, '#0A0510'); checker(g, xa, GY - 6, w, 2, '#0A0510');
};

/** The pilaster: a carpet tube sprayed gold (its spiral seam, a dent, duct tape round it), a paint bucket upside down
 *  for its capital, a cinder block for its plinth. 20 wide at x. */
const tube = (g: Ctx, x: number) => {
  const top = CEIL + 38, foot = GY - 22;
  pole(g, x, top, 20, foot - top, TUBE[3]);
  // (the spiral seam, the spray missing in patches (the cardboard under it))
  g.save(); g.beginPath(); g.rect(x, top, 20, foot - top); g.clip();
  g.strokeStyle = TUBE[1]; g.lineWidth = 1; g.beginPath();
  for (let y = top - 20; y < foot; y += 34) { g.moveTo(x, y + 20); g.lineTo(x + 20, y); }
  g.stroke();
  for (const [dy, hh] of [[90, 26], [250, 40], [390, 18]] as const) { box(g, x + 3, top + dy, 9, hh, '#8A6A40'); checker(g, x + 2, top + dy - 2, 11, 2, '#8A6A40'); checker(g, x + 2, top + dy + hh, 11, 2, '#8A6A40', 1); box(g, x + 3, top + dy, 2, hh, '#A88A5A'); }
  g.restore();
  // (a dent; tape round it in two places)
  fillPath(g, TUBE[0], () => { g.moveTo(x + 20, top + 170); g.lineTo(x + 13, top + 182); g.lineTo(x + 20, top + 196); g.closePath(); });
  for (const dy of [140, 330]) { box(g, x - 1, top + dy, 22, 9, INK); box(g, x, top + dy + 1, 20, 7, TAPE[1]); box(g, x, top + dy + 1, 20, 2, TAPE[2]); box(g, x + 14, top + dy + 1, 6, 7, TAPE[0]); }
  // (the bucket: upside down on top, its handle hanging, a run of purple down its side)
  inked(g, () => { g.moveTo(x - 6, top); g.lineTo(x - 3, top - 24); g.lineTo(x + 23, top - 24); g.lineTo(x + 26, top); g.closePath(); }, TAPE[1], 2);
  box(g, x - 2, top - 23, 4, 22, TAPE[2]); box(g, x + 18, top - 22, 5, 21, TAPE[0]); box(g, x - 6, top - 3, 32, 3, TAPE[0]);
  box(g, x - 4, top - 26, 28, 3, INK); box(g, x - 3, top - 25, 26, 1, TAPE[2]);
  box(g, x + 6, top - 22, 4, 16, RP[4]); box(g, x + 7, top - 6, 2, 5, RP[4]); box(g, x + 12, top - 22, 3, 8, RP[3]);
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.arc(x + 10, top - 2, 15, 0.15, Math.PI - 0.15); g.stroke();
  // (the cinder block)
  slab(g, x - 6, foot, 32, 22, '#6A6A72', { edge: 2 });
  box(g, x - 7, foot - 1, 34, 1, INK); box(g, x - 7, foot, 1, 22, INK); box(g, x + 26, foot, 1, 22, INK);
  for (const hx of [x - 1, x + 13]) { box(g, hx, foot + 5, 9, 12, '#2A2A30'); box(g, hx, foot + 5, 9, 2, '#18181C'); }
  checker(g, x - 6, foot + 18, 32, 2, '#4A4A52');
};

/** A string of gone-off sausages sagging from xa to xb (the swag). */
const sausages = (g: Ctx, xa: number, xb: number, y: number, sag: number, seed: number) => {
  const n = Math.round((xb - xa) / 13);
  const pt = (t: number): [number, number] => [xa + (xb - xa) * t, y + 4 * t * (1 - t) * sag];
  g.strokeStyle = PLY[1]; g.lineWidth = 1; g.beginPath(); for (let i = 0; i <= n; i++) { const [px, py] = pt(i / n); if (i) g.lineTo(px, py); else g.moveTo(px, py); } g.stroke();
  for (let i = 0; i < n; i++) {
    const [ax, ay] = pt(i / n), [bx, by] = pt((i + 1) / n), mx = (ax + bx) / 2, my = (ay + by) / 2 + 2, a = Math.atan2(by - ay, bx - ax);
    const green = hash(seed + i * 3.3) < 0.35;
    inked(g, () => g.ellipse(mx, my, 6, 3.6, a, 0, Math.PI * 2), green ? '#5A6A3A' : MEAT[2], 2);
    fillPath(g, green ? '#7A8A4A' : MEAT[3], () => g.ellipse(mx - 1, my - 1, 3.6, 1.6, a, 0, Math.PI * 2));
    box(g, mx - 3, my - 2, 2, 1, green ? '#A8B870' : MEAT[4]);
    if (hash(seed + i * 5.9) < 0.3) { box(g, mx + 1, my + 3, 1, 4 + (i % 3) * 2, BILE[3]); box(g, mx + 1, my + 7 + (i % 3) * 2, 1, 1, BILE[5]); }
  }
  // (hung on nails at its ends)
  for (const px of [xa, xb]) { box(g, px - 1, y - 4, 3, 5, INK); box(g, px, y - 4, 1, 3, TAPE[2]); }
};

/** A candle stub in a bottle, its foot at (x, y): wax down the neck, the flame in a halo. */
const bottleCandle = (g: Ctx, x: number, y: number, h: number, glass: string) => {
  steppedGlow(g, x, y - h - 12, 18, FLAME, 0.34, 0.02, 4);
  inked(g, () => { g.rect(x - 5, y - h * 0.6, 10, h * 0.6); }, glass, 2);
  inked(g, () => { g.rect(x - 2, y - h, 5, h * 0.42); }, glass, 2);
  box(g, x - 4, y - h * 0.6 + 1, 2, h * 0.6 - 2, mix(glass, '#FFFFFF', 0.4));
  box(g, x - 2, y - h - 7, 5, 8, WAX); box(g, x - 3, y - h, 7, 2, WAX); box(g, x - 3, y - h + 2, 2, 7, WAX); box(g, x + 3, y - h + 2, 1, 4, '#C8C2A8');
  inked(g, () => { g.moveTo(x + 0.5, y - h - 17); g.quadraticCurveTo(x + 4, y - h - 10, x + 0.5, y - h - 7); g.quadraticCurveTo(x - 3, y - h - 10, x + 0.5, y - h - 17); }, '#FACC15', 1);
  box(g, x, y - h - 12, 1, 4, '#FFFFFF');
};

/** v1, the mirror: tin foil taped up inside a frame painted on by hand. */
const foilMirror = (g: Ctx, x: number) => {
  const fx = x + 52, fy = GY - 326, fw = 96, fh = 190;
  // (the frame: gold paint, straight on the plywood, a go at a crest on top)
  for (let i = 0; i < 6; i++) { const col = TUBE[[2, 4, 3, 2, 3, 1][i]]; box(g, fx + i, fy + i + (i % 2), fw - i * 2, 1, col); box(g, fx + i, fy + fh - 1 - i, fw - i * 2, 1, col); box(g, fx + i, fy + i, 1, fh - i * 2, col); box(g, fx + fw - 1 - i + (i % 3 === 0 ? 1 : 0), fy + i, 1, fh - i * 2, col); }
  fillPath(g, TUBE[3], () => { g.moveTo(fx + 26, fy); g.quadraticCurveTo(fx + fw / 2 + 4, fy - 30, fx + fw - 24, fy); g.closePath(); });
  fillPath(g, TUBE[2], () => { g.moveTo(fx + 36, fy); g.quadraticCurveTo(fx + fw / 2 + 4, fy - 16, fx + fw - 34, fy); g.closePath(); });
  box(g, fx + 20, fy + fh + 2, 2, 14, TUBE[2]); box(g, fx + 60, fy + fh + 2, 2, 8, TUBE[2]);
  // (the foil: crinkled, each facet its own gray; nothing shows in it)
  const gx = fx + 9, gy = fy + 9, gw = fw - 18, gh = fh - 18, FO = ['#4A4E5A', '#6E7482', '#9298A6', '#B8BECA', '#E2E6EE'];
  box(g, gx - 1, gy - 1, gw + 2, gh + 2, INK);
  for (let j = 0; j < gh; j += 13) for (let i = 0; i < gw; i += 13) {
    const n = i * 3.1 + j * 1.7, k = Math.floor(hash(n) * 4);
    box(g, gx + i, gy + j, Math.min(13, gw - i), Math.min(13, gh - j), FO[k]);
    if (hash(n * 2.3) < 0.5) fillPath(g, FO[Math.min(4, k + 1)], () => { g.moveTo(gx + i, gy + j); g.lineTo(gx + Math.min(i + 13, gw), gy + j); g.lineTo(gx + i, gy + Math.min(j + 13, gh)); g.closePath(); });
    else fillPath(g, FO[Math.max(0, k - 1)], () => { g.moveTo(gx + Math.min(i + 13, gw), gy + Math.min(j + 13, gh)); g.lineTo(gx + Math.min(i + 13, gw), gy + j); g.lineTo(gx + i, gy + Math.min(j + 13, gh)); g.closePath(); });
  }
  for (let i = 0; i < 9; i++) box(g, gx + 4 + hash(i * 4.4) * (gw - 10), gy + 4 + hash(i * 8.1) * (gh - 10), 2, 2, '#FFFFFF');
  // (a corner come away, curled over; tape at the corners)
  fillPath(g, RP[2], () => { g.moveTo(gx + gw, gy); g.lineTo(gx + gw - 22, gy); g.lineTo(gx + gw, gy + 24); g.closePath(); });
  inked(g, () => { g.moveTo(gx + gw - 22, gy); g.lineTo(gx + gw - 20, gy + 20); g.lineTo(gx + gw, gy + 24); g.closePath(); }, FO[1], 1);
  for (const [tx, ty, wide] of [[gx - 6, gy - 3, 1], [gx - 4, gy + gh - 5, 1], [gx + gw - 12, gy + gh - 4, 1], [gx + gw / 2 - 8, gy - 4, 1]] as const) { box(g, tx - 1, ty - 1, 18 * wide, 9, INK); box(g, tx, ty, 16, 7, TAPE[1]); box(g, tx, ty, 16, 2, TAPE[2]); }
};

/** v2, the sconce: a plank on a shelf bracket, three candle stubs in bottles, the wax down the wall. */
const shelfCandles = (g: Ctx, x: number) => {
  const cx = x + 100, sy = GY - 236;
  steppedGlow(g, cx, sy - 40, 78, FLAME, 0.15, 0.0, 5);
  // (the bracket, the plank)
  fillPath(g, INK, () => { g.moveTo(cx - 5, sy + 4); g.lineTo(cx + 5, sy + 4); g.lineTo(cx + 5, sy + 30); g.lineTo(cx - 5, sy + 30); g.closePath(); });
  box(g, cx - 4, sy + 5, 8, 24, TAPE[0]); box(g, cx - 4, sy + 5, 2, 24, TAPE[1]);
  seg(g, [cx + 4, sy + 26], [cx + 26, sy + 6], INK, 4); seg(g, [cx + 4, sy + 26], [cx + 26, sy + 6], TAPE[0], 2);
  seg(g, [cx - 4, sy + 26], [cx - 26, sy + 6], INK, 4); seg(g, [cx - 4, sy + 26], [cx - 26, sy + 6], TAPE[0], 2);
  box(g, cx - 41, sy - 1, 82, 7, INK); box(g, cx - 40, sy, 80, 5, PLY[3]); box(g, cx - 40, sy, 80, 1, PLY[5]); box(g, cx - 40, sy + 4, 80, 1, PLY[1]);
  bottleCandle(g, cx - 26, sy, 30, '#2E5A32'); bottleCandle(g, cx + 1, sy, 40, '#5A3A1E'); bottleCandle(g, cx + 27, sy, 26, '#2E5A32');
  // (wax run down off the plank's edge and the wall under it)
  for (const [dx, len] of [[-30, 22], [-8, 40], [12, 14], [30, 30]] as const) { box(g, cx + dx, sy + 6, 3, len, WAX); box(g, cx + dx + 2, sy + 6, 1, len, '#C8C2A8'); box(g, cx + dx, sy + 6 + len, 3, 2, '#C8C2A8'); }
};

/** v3, the count's portrait: crayon on lined paper, taped up inside a painted frame, a nameplate in marker. */
const crayonCount = (g: Ctx, x: number) => {
  const px = x + 56, py = GY - 336, pw = 88, ph = 112;
  for (let i = 0; i < 7; i++) { const col = TUBE[[2, 4, 3, 2, 1, 3, 2][i]]; box(g, px - 10 + i, py - 10 + i, pw + 20 - i * 2, 1, col); box(g, px - 10 + i, py + ph + 9 - i, pw + 20 - i * 2 + (i % 2), 1, col); box(g, px - 10 + i, py - 10 + i, 1, ph + 20 - i * 2, col); box(g, px + pw + 9 - i, py - 10 + i + (i % 2), 1, ph + 20 - i * 2, col); }
  // (the paper: lined, a red margin, three holes, gone yellow)
  box(g, px - 1, py - 1, pw + 2, ph + 2, INK); box(g, px, py, pw, ph, '#E8E2C0');
  for (let y = py + 12; y < py + ph - 4; y += 9) box(g, px + 2, y, pw - 4, 1, '#A8BCD0');
  box(g, px + 12, py, 1, ph, '#D88A8A');
  for (const hy of [16, 56, 96]) { box(g, px + 4, py + hy, 4, 4, RP[1]); }
  box(g, px, py + ph - 6, pw, 6, '#D0C8A0'); checker(g, px, py + ph - 8, pw, 2, '#D0C8A0');
  // (him: a head only, in crayon. A green face, a widow's peak scribbled black, red eyes not level, two fangs, a red
  // collar up either side)
  const cx = px + pw / 2 + 4, cy = py + 50;
  const scrib = (col: string, pts: [number, number][], wd = 3) => { g.strokeStyle = col; g.lineWidth = wd; g.lineJoin = 'round'; g.lineCap = 'round'; g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(cx + a, cy + b) : g.moveTo(cx + a, cy + b))); g.stroke(); g.lineCap = 'butt'; };
  scrib('#B8262E', [[-34, 46], [-26, 8], [-12, 34], [-30, 44]], 4); scrib('#B8262E', [[34, 46], [28, 6], [12, 34], [30, 46]], 4);
  fillPath(g, '#8AAE5A', () => g.ellipse(cx, cy, 24, 29, 0.05, 0, Math.PI * 2));
  g.strokeStyle = '#3E5A2A'; g.lineWidth = 2; g.beginPath(); g.ellipse(cx, cy, 24, 29, 0.05, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 7; i++) scrib('#A8C878', [[-18 + i * 5, -14 + (i % 2) * 3], [-14 + i * 5, 16 - (i % 3) * 4]], 1);
  scrib('#18181B', [[-23, -12], [-18, -27], [-8, -22], [0, -8], [8, -23], [18, -27], [23, -10]], 4);
  scrib('#18181B', [[-16, -24], [-2, -27], [14, -25]], 5);
  for (const [ex, ey] of [[-10, -2], [9, 1]] as const) { fillPath(g, '#F5F0E0', () => g.arc(cx + ex, cy + ey, 6, 0, Math.PI * 2)); fillPath(g, '#C81E1E', () => g.arc(cx + ex + 1, cy + ey + 1, 3, 0, Math.PI * 2)); box(g, cx + ex, cy + ey, 2, 2, '#18181B'); }
  scrib('#18181B', [[-16, -10], [-5, -7]], 2); scrib('#18181B', [[4, -6], [16, -8]], 2);
  scrib('#18181B', [[-13, 14], [-4, 19], [6, 19], [14, 13]], 2);
  fillPath(g, '#FFFFFF', () => { g.moveTo(cx - 8, cy + 17); g.lineTo(cx - 3, cy + 18); g.lineTo(cx - 6, cy + 27); g.closePath(); });
  fillPath(g, '#FFFFFF', () => { g.moveTo(cx + 3, cy + 18); g.lineTo(cx + 8, cy + 17); g.lineTo(cx + 6, cy + 27); g.closePath(); });
  box(g, cx - 2, cy + 3, 4, 5, '#5A8A3A');
  // (a gold star stuck on; tape at its top corners)
  for (const tx of [px - 5, px + pw - 11]) { box(g, tx - 1, py - 6, 18, 9, INK); box(g, tx, py - 5, 16, 7, TAPE[1]); box(g, tx, py - 5, 16, 2, TAPE[2]); }
  fillPath(g, '#FACC15', () => { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 3 : 7; const sx = px + pw - 12 + Math.cos(a) * r, sy = py + 14 + Math.sin(a) * r; if (i) g.lineTo(sx, sy); else g.moveTo(sx, sy); } g.closePath(); });
  // (the nameplate: a strip of tape, marker on it)
  box(g, px + 3, py + ph + 13, 82, 13, INK); box(g, px + 4, py + ph + 14, 80, 11, '#D8D2B8'); box(g, px + 4, py + ph + 14, 80, 2, '#F0EBD8');
  signAt(g, 'THE COUNT', px + 44, py + ph + 20, 6, print(6, '#18181B'));
};

/** v0, the missing flat: out through the gap, hell (the sky shows: nothing's painted there); the flats either side
 *  braced from behind, rock at the gap's edges, a bare sheet leaned across its foot. */
const GAP_A = 64, GAP_B = 138;
const gapDressing = (g: Ctx, x: number) => {
  const a = x + GAP_A, b = x + GAP_B, y0 = CEIL + 14;
  // (rock behind the flats' edges, in from each side: lit toward the gap)
  const rock = (ex: number, s: 1 | -1) => {
    for (let y = y0; y < GY - 96; y += 2) {
      const wdt = 5 + Math.round(6 * (0.5 + 0.5 * Math.sin(y * 0.045 + ex)) + 5 * hash(Math.floor(y / 14) + ex));
      box(g, s > 0 ? ex : ex - wdt, y, wdt, 2, ROCK[1]); box(g, s > 0 ? ex + wdt - 2 : ex - wdt, y, 2, 2, ROCK[3]);
    }
  };
  rock(a, 1); rock(b, -1);
  // (the braces: 2x4s from the back of each flat down to the ground out there, seen through the gap)
  for (const [x1, y1, x2, y2] of [[a, GY - 330, a + 44, GY - 100], [b, GY - 420, b - 30, GY - 100]] as const) { seg(g, [x1, y1], [x2, y2], INK, 8); seg(g, [x1, y1], [x2, y2], PLY[1], 6); seg(g, [x1 - 2, y1], [x2 - 2, y2], PLY[3], 1); }
  // (the flats' cut edges: the plywood's plies)
  box(g, a - 3, y0, 3, GY - y0, PLY[3]); box(g, a - 3, y0, 1, GY - y0, PLY[5]); box(g, a, y0, 1, GY - y0, INK);
  box(g, b, y0, 3, GY - y0, PLY[1]); box(g, b - 1, y0, 1, GY - y0, INK);
  // (a bare sheet leaned across the foot of it, a stencil on it; a strip of caution tape across higher up)
  const top = GY - 104;
  box(g, a - 8, top - 1, b - a + 16, GY - top + 1, INK); box(g, a - 7, top, b - a + 14, GY - top, PLY[2]);
  for (let k = 0; k < GY - top; k += 6) box(g, a - 7, top + k + ((k * 5) % 3), b - a + 14, 1, k % 12 ? PLY[1] : PLY[3]);
  box(g, a - 7, top, b - a + 14, 2, PLY[4]); box(g, a - 7, GY - 5, b - a + 14, 5, PLY[0]);
  signAt(g, 'WALL', (a + b) / 2, top + 28, 8, { ...print({ sx: 2, sy: 2 }, RP[4]), stencil: true });
  signAt(g, 'TO COME', (a + b) / 2, top + 52, 6, print(6, RP[4]));
  pixelBlob(g, a + 6, GY - 8, 16, 14, BILE[1]); pixelBlob(g, b - 4, GY - 6, 12, 10, BILE[2]);
};

/** The beam along the top (where the cornice was): a 2x4 run, painted gold once, nails; dark over it. */
const beam = (g: Ctx, x: number, w: number) => {
  box(g, x, CEIL - 260, w, 262, '#0A0310');
  box(g, x, CEIL, w, 16, PLY[2]);
  for (let k = 0; k < w; k += 3) box(g, x + k, CEIL + 2 + ((k * 7) % 11), 3, 1, k % 2 ? PLY[1] : PLY[3]);
  box(g, x, CEIL, w, 2, PLY[4]); box(g, x, CEIL + 14, w, 2, PLY[0]); box(g, x, CEIL + 16, w, 1, INK);
  checker(g, x, CEIL + 2, w, 5, TUBE[3]); box(g, x + 30, CEIL + 3, 50, 3, TUBE[4]); box(g, x + 120, CEIL + 4, 40, 2, TUBE[3]);
  for (let k = 14; k < w; k += 48) { box(g, x + k, CEIL + 7, 3, 3, INK); box(g, x + k, CEIL + 7, 1, 1, TAPE[2]); }
  box(g, x, CEIL + 17, w, 4, 'rgba(7, 3, 12, 0.5)');
};

export const paintHellWallTile = (g: Ctx, x: number, v: number) => {
  const TW = 200;
  if (v === 0) { flat(g, x, x + GAP_A, 3); flat(g, x + GAP_B, x + TW, 8); gapDressing(g, x); }
  else flat(g, x, x + TW, v * 2 + 1);
  beam(g, x, TW);
  tube(g, x); tube(g, x + TW);
  if (v === 1) foilMirror(g, x);
  else if (v === 2) shelfCandles(g, x);
  else if (v === 3) crayonCount(g, x);
  sausages(g, x + 26, x + TW - 6, CEIL + 24, 30 + v * 4, v * 11);
};

// ---------------------------------------------------------------------------------------------------------------
// The buffet: one table the length of the back wall, all of it rotten (at WALL_D, where the land's buffet and the DJ's
// table stand); the banner over it

const BX = ARENA_L + 40, BW = ARENA_R - 132 - BX;

const drips = (g: Ctx, x: number, y: number, w: number, col: string, tip: string, seed: number) => {
  for (let k = 0; k < w; k += 5) { const len = 3 + Math.round(hash(seed + k) * 14); if (hash(seed + k * 2.1) < 0.45) continue; box(g, x + k, y, 2, len, col); box(g, x + k, y + len, 2, 2, tip); }
};
const bone = (g: Ctx, x: number, y: number, len: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  box(g, -len / 2 - 1, -2, len + 2, 5, INK); box(g, -len / 2, -1, len, 3, '#D8CCB0'); box(g, -len / 2, -1, len, 1, '#F0E8D4');
  for (const s of [-1, 1]) { ball(g, (s * len) / 2, -2, 2.5, '#D8CCB0'); ball(g, (s * len) / 2, 2, 2.5, '#D8CCB0'); }
  g.restore();
};
/** Fuzz: a bloom of mold (blue-green, a pale middle). */
const fuzz = (g: Ctx, x: number, y: number, r: number) => { pixelBlob(g, x, y, r, r * 0.7, '#3E6A4A'); pixelBlob(g, x, y - 1, r * 0.55, r * 0.4, '#7AB08A'); box(g, x - 1, y - 2, 2, 2, '#C8E8D0'); };

const paintBuffet = (g: Ctx) => {
  const x = BX, w = BW, top = GY - 58, on = top - 2;
  // (the trestles under it, then the cloth: a bedsheet, gone gray-green, stained, in folds to the floor)
  for (let k = 40; k < w; k += 150) { seg(g, [x + k, top + 4], [x + k - 14, GY], INK, 5); seg(g, [x + k, top + 4], [x + k + 14, GY], INK, 5); }
  box(g, x - 1, top - 3, w + 2, 5, INK); box(g, x, top - 2, w, 3, SHEET[4]);
  const fold = [3, 4, 3, 2, 2, 1, 1, 0, 1, 2, 2, 3, 3, 2];
  for (let k = 0; k < w; k++) box(g, x + k, top + 1, 1, GY - top - 1 - ((k * 7) % 14 === 0 ? 3 : 0), SHEET[fold[k % 14]]);
  box(g, x - 1, top, 1, GY - top, INK); box(g, x + w, top, 1, GY - top, INK);
  checker(g, x, GY - 8, w, 2, SHEET[0]); box(g, x, GY - 6, w, 6, SHEET[0]);
  // (stains down it: gravy, bile, something red; the hem's mold)
  for (let i = 0; i < 16; i++) { const sx = x + 14 + hash(i * 3.9) * (w - 28), col = ['#6A4A1E', BILE[2], '#6A1E1E', '#4E5A1A'][i % 4]; g.globalAlpha = 0.55; pixelBlob(g, sx, top + 14 + hash(i * 1.3) * 26, 8 + hash(i) * 12, 8 + hash(i * 2) * 10, col); g.globalAlpha = 1; }
  for (let i = 0; i < 12; i++) fuzz(g, x + 20 + hash(i * 6.1) * (w - 40), GY - 5 - hash(i) * 6, 6 + hash(i * 2.9) * 5);
  // --- what's on it, left to right
  // (plates stacked, crusted, a bone on top)
  for (let i = 0; i < 7; i++) { box(g, x + 8, on - 2 - i * 2, 18, 2, INK); box(g, x + 9, on - 2 - i * 2, 16, 1, i % 2 ? SHEET[2] : SHEET[3]); if (i % 3 === 0) box(g, x + 12 + i, on - 2 - i * 2, 5, 1, '#6A4A1E'); }
  bone(g, x + 18, on - 18, 16, -0.3);
  // (the punch: a bowl of bile, eyes floating in it, a ladle; run over down the cloth)
  const px = x + 62;
  slab(g, px - 8, on - 4, 16, 4, '#8AA8A0', { edge: 1 }); box(g, px - 2, on - 9, 4, 5, '#6A8880');
  inked(g, () => { g.ellipse(px, on - 20, 24, 12, 0, 0, Math.PI); g.closePath(); }, '#7A9890', 2);
  fillPath(g, BILE[2], () => { g.ellipse(px, on - 19, 21, 8, 0, 0, Math.PI); g.closePath(); });
  fillPath(g, BILE[1], () => g.ellipse(px, on - 20, 22, 4, 0, 0, Math.PI * 2));
  fillPath(g, BILE[3], () => g.ellipse(px - 2, on - 20.5, 17, 2.4, 0, 0, Math.PI * 2));
  for (const [ex, ey] of [[-10, -21], [6, -20]] as const) { ball(g, px + ex, on + ey, 4, '#E8E4D0'); box(g, px + ex - 1, on + ey - 1, 3, 3, '#7A1E1E'); box(g, px + ex, on + ey, 1, 1, INK); }
  box(g, px - 21, on - 18, 2, 7, '#C8E0D8'); for (let i = 0; i < 7; i++) box(g, px - 20 + i * 6, on - 21, 2, 1, '#C8E0D8');
  seg(g, [px + 12, on - 21], [px + 22, on - 40], INK, 3); seg(g, [px + 12, on - 21], [px + 22, on - 40], '#A8A8B0', 1);
  drips(g, px - 20, on - 9, 12, BILE[2], BILE[4], 3); drips(g, px - 26, top + 1, 30, BILE[2], BILE[4], 9);
  // (the roast: a bird picked to its ribs, what meat's left gone green, on a platter; a carving fork stood in it)
  const rx = x + 142;
  inked(g, () => g.ellipse(rx, on - 2, 44, 5, 0, 0, Math.PI * 2), '#8A8E96', 2); fillPath(g, '#B4B8C0', () => g.ellipse(rx - 6, on - 3, 30, 2, 0, 0, Math.PI * 2));
  inked(g, () => { g.moveTo(rx - 34, on - 4); g.quadraticCurveTo(rx - 34, on - 36, rx - 6, on - 38); g.quadraticCurveTo(rx + 28, on - 38, rx + 34, on - 4); g.closePath(); }, MEAT[2], 2);
  fillPath(g, MEAT[3], () => { g.moveTo(rx - 28, on - 10); g.quadraticCurveTo(rx - 26, on - 32, rx - 6, on - 34); g.quadraticCurveTo(rx + 8, on - 34, rx + 12, on - 22); g.quadraticCurveTo(rx - 8, on - 26, rx - 28, on - 10); });
  // (the ribs: the cage open on the right, dark in it)
  fillPath(g, '#1E0E0E', () => { g.moveTo(rx - 2, on - 6); g.quadraticCurveTo(rx, on - 30, rx + 18, on - 32); g.quadraticCurveTo(rx + 30, on - 24, rx + 30, on - 6); g.closePath(); });
  for (let i = 0; i < 5; i++) { g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(rx + 2 + i * 6, on - 6, 22 - i * 2, Math.PI * 1.08, Math.PI * 1.5); g.stroke(); g.strokeStyle = '#D8CCB0'; g.lineWidth = 2; g.beginPath(); g.arc(rx + 2 + i * 6, on - 6, 22 - i * 2, Math.PI * 1.08, Math.PI * 1.5); g.stroke(); }
  for (const [mx, my, r] of [[-20, -24, 7], [-8, -30, 5], [22, -10, 6]] as const) { pixelBlob(g, rx + mx, on + my, r, r * 0.7, '#5A7A2A'); box(g, rx + mx - 1, on + my - 1, 2, 2, BILE[4]); }
  // (its drumstick's bone up at the left, a paper frill on it)
  seg(g, [rx - 30, on - 14], [rx - 46, on - 34], INK, 6); seg(g, [rx - 30, on - 14], [rx - 46, on - 34], '#D8CCB0', 4); ball(g, rx - 47, on - 36, 4, '#F0E8D4');
  box(g, rx + 9, on - 60, 2, 28, INK); box(g, rx + 10, on - 60, 1, 28, '#B4B8C0'); box(g, rx + 5, on - 66, 2, 10, '#B4B8C0'); box(g, rx + 13, on - 66, 2, 10, '#B4B8C0'); box(g, rx + 5, on - 58, 10, 2, '#8A8E96');
  // (the cake: three tiers, leaning, slumped; fuzz over it, a slice gone (what's inside is gray); the couple on top sunk)
  const cx = x + 236;
  slab(g, cx - 14, on - 4, 28, 4, TUBE[2], { edge: 1 }); inked(g, () => g.ellipse(cx, on - 6, 30, 3, 0, 0, Math.PI * 2), TUBE[3], 2);
  const tier = (tx: number, ty: number, tw: number, th: number, lean: number) => {
    inked(g, () => { g.moveTo(tx - tw / 2, ty + th); g.lineTo(tx - tw / 2 + lean, ty); g.lineTo(tx + tw / 2 + lean, ty + 2); g.lineTo(tx + tw / 2, ty + th); g.closePath(); }, '#B8B49A', 2);
    fillPath(g, '#D8D4BA', () => { g.moveTo(tx - tw / 2 + 1, ty + th - 1); g.lineTo(tx - tw / 2 + lean + 1, ty + 1); g.lineTo(tx - tw / 6 + lean, ty + 1); g.lineTo(tx - tw / 6, ty + th - 1); g.closePath(); });
    box(g, tx - tw / 2 + lean, ty - 2, tw, 3, '#E8E4CC'); box(g, tx - tw / 2 + lean - 1, ty - 3, tw + 2, 1, INK);
    drips(g, tx - tw / 2 + lean + 1, ty + 1, tw - 2, '#E8E4CC', '#B8B49A', tx);
  };
  tier(cx, on - 34, 54, 26, 3); tier(cx + 3, on - 56, 40, 20, 5); tier(cx + 8, on - 74, 26, 16, 7);
  box(g, cx + 12, on - 34, 14, 26, INK); box(g, cx + 13, on - 33, 12, 25, '#6A6A5A'); for (let i = 0; i < 4; i++) box(g, cx + 13, on - 30 + i * 6, 12, 2, i % 2 ? '#4E5A2A' : '#3A2A2A');
  fuzz(g, cx - 14, on - 24, 9); fuzz(g, cx + 2, on - 48, 7); fuzz(g, cx - 20, on - 10, 6); fuzz(g, cx + 14, on - 68, 5); fuzz(g, cx - 6, on - 60, 4);
  box(g, cx + 12, on - 84, 4, 9, '#18181B'); box(g, cx + 12, on - 88, 4, 4, '#C8C8B8'); box(g, cx + 18, on - 80, 5, 5, '#D8D4BA'); box(g, cx + 19, on - 84, 3, 4, '#B89A7A');
  // (the pig's head on a board: an apple in it, gone brown; its eyes Xs)
  const hx = x + 322;
  box(g, hx - 34, on - 5, 68, 5, INK); box(g, hx - 33, on - 4, 66, 3, PLY[3]); box(g, hx - 33, on - 4, 66, 1, PLY[5]);
  inked(g, () => { g.moveTo(hx - 26, on - 5); g.quadraticCurveTo(hx - 30, on - 40, hx, on - 42); g.quadraticCurveTo(hx + 28, on - 40, hx + 26, on - 5); g.closePath(); }, '#A8848A', 2);
  fillPath(g, '#C8A4A8', () => { g.moveTo(hx - 22, on - 10); g.quadraticCurveTo(hx - 24, on - 36, hx - 2, on - 38); g.quadraticCurveTo(hx - 12, on - 22, hx - 22, on - 10); });
  for (const s of [-1, 1]) inked(g, () => { g.moveTo(hx + s * 16, on - 36); g.lineTo(hx + s * 28, on - 52); g.lineTo(hx + s * 24, on - 30); g.closePath(); }, '#8A646A', 2);
  for (const s of [-1, 1]) { seg(g, [hx + s * 11 - 3, on - 31], [hx + s * 11 + 3, on - 25], INK, 2); seg(g, [hx + s * 11 + 3, on - 31], [hx + s * 11 - 3, on - 25], INK, 2); }
  inked(g, () => g.ellipse(hx, on - 15, 12, 8, 0, 0, Math.PI * 2), '#B8949A', 2); box(g, hx - 6, on - 17, 3, 4, '#3A1E22'); box(g, hx + 3, on - 17, 3, 4, '#3A1E22');
  ball(g, hx, on - 7, 6, '#6A4A1E'); box(g, hx, on - 15, 1, 3, PLY[0]);
  pixelBlob(g, hx + 18, on - 14, 7, 5, '#5A7A2A'); pixelBlob(g, hx - 20, on - 30, 5, 4, '#5A7A2A');
  // (two chafing dishes, run over: the slop down the cloth)
  for (const [dx, col] of [[392, BILE[2]], [438, '#6A4A1E']] as const) {
    const ax = x + dx;
    for (const lx of [ax + 2, ax + 32]) { box(g, lx - 1, on - 10, 3, 10, INK); box(g, lx, on - 10, 1, 10, '#B4B8C0'); }
    slab(g, ax, on - 19, 36, 9, '#8A8E96', { edge: 2 });
    inked(g, () => { g.ellipse(ax + 18, on - 19, 20, 9, 0, Math.PI, 0); g.closePath(); }, col, 2);
    fillPath(g, mix(col, '#FFFFFF', 0.25), () => { g.ellipse(ax + 12, on - 21, 9, 4, 0, Math.PI, 0); g.closePath(); });
    for (const [bx2, by2] of [[8, -24], [22, -26], [28, -22]] as const) box(g, ax + bx2, on + by2, 3, 2, mix(col, INK, 0.4));
    drips(g, ax - 1, on - 12, 38, col, mix(col, '#FFFFFF', 0.3), dx); drips(g, ax + 2, top + 1, 34, col, mix(col, '#FFFFFF', 0.3), dx * 3);
  }
  bone(g, x + 430, on - 30, 20, 0.5);
  // (a fish gone to its bones on a plate; a jelly, set round somebody's teeth)
  const fx = x + 512;
  inked(g, () => g.ellipse(fx, on - 2, 34, 4, 0, 0, Math.PI * 2), SHEET[3], 2);
  box(g, fx - 22, on - 7, 40, 2, '#D8CCB0'); for (let i = 0; i < 9; i++) { box(g, fx - 18 + i * 4, on - 12 + Math.abs(i - 4), 1, 5 - Math.abs(i - 4) * 0.5, '#D8CCB0'); box(g, fx - 18 + i * 4, on - 5, 1, 3 - Math.abs(i - 4) * 0.3, '#D8CCB0'); }
  inked(g, () => { g.moveTo(fx + 18, on - 12); g.lineTo(fx + 30, on - 7); g.lineTo(fx + 18, on - 2); g.closePath(); }, '#A8A890', 1); box(g, fx + 21, on - 9, 2, 2, INK);
  fillPath(g, '#D8CCB0', () => { g.moveTo(fx - 22, on - 6); g.lineTo(fx - 32, on - 12); g.lineTo(fx - 28, on - 6); g.lineTo(fx - 32, on - 1); g.closePath(); });
  const jx = x + 572;
  inked(g, () => g.ellipse(jx, on - 2, 22, 3, 0, 0, Math.PI * 2), SHEET[3], 2);
  inked(g, () => { g.moveTo(jx - 17, on - 3); g.quadraticCurveTo(jx - 16, on - 30, jx, on - 31); g.quadraticCurveTo(jx + 16, on - 30, jx + 17, on - 3); g.closePath(); }, '#7A2A6A', 2);
  fillPath(g, '#A8489A', () => { g.moveTo(jx - 14, on - 6); g.quadraticCurveTo(jx - 13, on - 26, jx - 3, on - 28); g.quadraticCurveTo(jx - 8, on - 16, jx - 14, on - 6); });
  box(g, jx - 10, on - 24, 2, 5, '#E8B8E0');
  for (let i = 0; i < 5; i++) box(g, jx - 6 + i * 3, on - 14 + (i % 2), 2, 3, '#F0E8D4');
  for (let i = 0; i < 4; i++) box(g, jx - 4 + i * 3, on - 9 - (i % 2), 2, 3, '#D8CCB0');
  // (the rule, on a card stood on a stick in a lump of it)
  const sx = x + 318;
  box(g, sx - 1, on - 94, 3, 42, INK); box(g, sx, on - 94, 1, 42, PLY[4]);
  const RULE = print(6, '#3A1010'), rw = signW('SECONDS ARE MANDATORY', RULE) + 14;
  box(g, sx - rw / 2 - 1, on - 109, rw + 2, 18, INK); box(g, sx - rw / 2, on - 108, rw, 16, '#E8E2C0'); box(g, sx - rw / 2, on - 108, rw, 2, '#FFFBE8'); box(g, sx - rw / 2, on - 94, rw, 2, '#C8C09A');
  signAt(g, 'SECONDS ARE MANDATORY', sx, on - 100, 6, RULE);
  // (heaped off the table's end onto the floor: what didn't fit)
  pixelBlob(g, x + w - 6, GY - 10, 26, 14, '#3A3A1E'); pixelBlob(g, x + w - 10, GY - 16, 16, 9, '#5A5A2A');
  bone(g, x + w - 16, GY - 20, 16, 0.8); bone(g, x + w + 6, GY - 6, 12, -0.2);
};

const BANNER_Y = GY - 420, BANNER_GAP = 26;
const BLOOK: Look = { ...print({ sx: 2, sy: 2 }, '#3A2408'), bold: true, shadow: '#8E9A5A' };
const WL = 'ALL YOU CAN EAT', WR = 'FOR ALL ETERNITY';
let span: { a: number; b: number } | null = null;
const bannerSpan = () => (span ??= { a: Math.round(ARENA_MID - BANNER_GAP - signW(WL, BLOOK) - 18), b: Math.round(ARENA_MID + BANNER_GAP + signW(WR, BLOOK) + 18) });
/** The banner: a bedsheet, the words in something green; hung on twine from nails in the beam, its middle sagging (the
 *  disco ball's wire comes down through the gap between the words, never over one). */
const paintBanner = (g: Ctx) => {
  const { a, b } = bannerSpan(), y = BANNER_Y - 16, h = 32;
  g.strokeStyle = PLY[3]; g.lineWidth = 1;
  for (const [cx, tx] of [[a + 4, a - 26], [b - 4, b + 26]]) { g.beginPath(); g.moveTo(cx, y + 2); g.lineTo(tx, CEIL + 18); g.stroke(); box(g, tx - 1, CEIL + 14, 3, 5, INK); }
  box(g, a - 1, y - 1, b - a + 2, h + 2, INK);
  bandedGradient(g, a, y, b - a, h, [SHEET[4], SHEET[3], SHEET[3], SHEET[2], SHEET[1]], 6);
  for (let k = a + 20; k < b - 16; k += 52) { g.fillStyle = 'rgba(255, 255, 255, 0.12)'; g.fillRect(k, y + 2, 8, h - 4); g.fillStyle = 'rgba(40, 46, 20, 0.2)'; g.fillRect(k + 8, y + 2, 6, h - 4); }
  // (its hem ragged along the bottom; stains; the corners knotted)
  for (let k = a; k < b; k += 4) if (hash(k * 0.37) < 0.4) box(g, k, y + h - 2, 4, 3, INK);
  for (let i = 0; i < 9; i++) { g.globalAlpha = 0.4; pixelBlob(g, a + 20 + hash(i * 5.3) * (b - a - 40), y + 8 + hash(i * 2.1) * 18, 8 + hash(i) * 8, 5 + hash(i * 3) * 5, i % 2 ? '#6A4A1E' : BILE[2]); g.globalAlpha = 1; }
  for (const ex of [a + 2, b - 2]) ball(g, ex, y + 3, 4, SHEET[2]);
  signAt(g, WL, ARENA_MID - BANNER_GAP - 4, BANNER_Y, 8, BLOOK, 'right');
  signAt(g, WR, ARENA_MID + BANNER_GAP + 4, BANNER_Y, 8, BLOOK, 'left');
};

/** Flies over the roast, the cake and the pig (a few dots going round: fillRects). */
const FLY_AT = [BX + 142, BX + 236, BX + 322, BX + 415];
const drawTables = (c: Ctx, f: number) => {
  stamp(c, 'rf-ball-buffet', BX - 12, GY - 176, BW + 40, 178, paintBuffet);
  c.fillStyle = '#0A0A0A';
  for (let i = 0; i < 10; i++) {
    const cx = FLY_AT[i % 4], a = f * (0.07 + (i % 3) * 0.02) + i * 1.9;
    c.fillRect(Math.round(cx + Math.cos(a) * (16 + (i % 4) * 6)), Math.round(GY - 108 - (i % 5) * 7 + Math.sin(a * 1.6) * 9), 2, 2);
  }
  // (dimmed a step: background, not stood on)
  c.fillStyle = 'rgba(10, 3, 18, 0.22)'; c.fillRect(BX - 12, GY - 176, BW + 40, 176);
  const { a, b } = bannerSpan();
  stamp(c, 'rf-ball-banner', a - 40, CEIL + 12, b - a + 80, BANNER_Y + 40 - CEIL - 12, paintBanner);
};

// ---------------------------------------------------------------------------------------------------------------
// The chandelier: a hula hoop on twine (stood on: its lip's the land's, lit the same), sporks and wishbones hung off it

const paintHoop = (g: Ctx, x: number, top: number, w: number) => {
  const mid = x + w / 2;
  // (a hook in the ceiling, three lengths of twine down to the hoop, knotted)
  box(g, mid - 3, CEIL, 6, 6, INK); box(g, mid - 2, CEIL, 4, 4, TAPE[1]);
  for (const hx of [x + 12, mid, x + w - 12]) {
    for (let y = CEIL + 4, i = 0; y < top; y += 4, i++) { const t = (y - CEIL) / (top - CEIL), px = mid + (hx - mid) * t; box(g, px - 1, y, 2, 4, i % 2 ? PLY[3] : PLY[4]); box(g, px + 1, y, 1, 4, PLY[1]); }
    ball(g, hx, top - 2, 3, PLY[3]);
  }
  // (the hoop's far side going round behind (an ellipse hung under the lip), then its near side: the lip he stands on)
  const HOOP = ['#DB2777', '#F5F5F0', '#73991C', '#F5F5F0'];
  g.lineWidth = 7; g.strokeStyle = INK; g.beginPath(); g.ellipse(mid, top + 12, w / 2 - 4, 9, 0, 0, Math.PI); g.stroke();
  for (let i = 0; i < 16; i++) { g.strokeStyle = mix(HOOP[i % 4], INK, 0.3); g.lineWidth = 5; g.beginPath(); g.ellipse(mid, top + 12, w / 2 - 4, 9, 0, (i / 16) * Math.PI, ((i + 1) / 16) * Math.PI + 0.02); g.stroke(); }
  standTop(g, x, top, w, '#9D174D', '#F9A8D4');
  for (let k = 0; k < w; k += 13) box(g, x + k, top + 4, 6, 3, k % 26 ? '#F5F5F0' : '#A3C83A');
  // (tape where it's been mended)
  for (const dx of [38, 96]) { box(g, x + dx - 1, top - 1, 9, 9, INK); box(g, x + dx, top, 7, 7, TAPE[1]); box(g, x + dx, top, 7, 2, TAPE[2]); }
  // (hung off it on threads: sporks, wishbones, a fish's spine: the crystals)
  for (let i = 0; i < 9; i++) {
    const hx = x + 9 + i * ((w - 18) / 8), len = 8 + ((i * 7) % 4) * 5, y = top + 8 + (i > 0 && i < 8 ? 9 * Math.sin((i / 8) * Math.PI) : 0);
    box(g, hx, y, 1, len, '#8A8E96');
    const by = y + len;
    if (i % 3 === 0) { box(g, hx - 2, by, 5, 6, INK); box(g, hx - 1, by, 3, 5, '#F0F0E8'); box(g, hx, by + 5, 1, 9, '#F0F0E8'); box(g, hx - 1, by, 1, 3, '#FFFFFF'); box(g, hx - 1, by - 1, 1, 2, '#F0F0E8'); box(g, hx + 1, by - 1, 1, 2, '#F0F0E8'); }
    else if (i % 3 === 1) { seg(g, [hx, by], [hx - 4, by + 12], INK, 3); seg(g, [hx, by], [hx + 4, by + 12], INK, 3); seg(g, [hx, by], [hx - 4, by + 12], '#D8CCB0', 1); seg(g, [hx, by], [hx + 4, by + 12], '#D8CCB0', 1); ball(g, hx, by, 2, '#F0E8D4'); }
    else { box(g, hx, by, 1, 12, '#D8CCB0'); for (let k = 0; k < 4; k++) box(g, hx - 3 + (k % 2), by + 1 + k * 3, 7 - (k % 2) * 2, 1, '#D8CCB0'); }
  }
  // (candle stubs taped on at its ends, where the land's bulbs flicker)
  for (const cx of [x + 4, x + w - 10]) { pole(g, cx, top - 12, 6, 12, WAX); box(g, cx, top - 12, 2, 4, '#FFFFFF'); box(g, cx - 2, top - 5, 10, 5, INK); box(g, cx - 1, top - 4, 8, 3, TAPE[1]); box(g, cx + 5, top - 10, 2, 8, WAX); }
};

// ---------------------------------------------------------------------------------------------------------------

/** The dance floor's colors: the lit tiles bile and candle, the dark ones a rottener purple. */
const FLOOR = { lit: ['#A3C83A', '#FDE047', '#C084FC', '#73991C'], dark: ['#22103A', '#38185A'] as [string, string] };

/** Sets hell's ballroom up (the land's own art asks BALL_HOOKS only while this refight's on). */
export const installSpookyPlace = () => {
  BALL_HOOKS.wallTile = paintHellWallTile;
  BALL_HOOKS.tables = drawTables;
  BALL_HOOKS.chandelier = paintHoop;
  BALL_HOOKS.floor = FLOOR;
};

export const spookyPlace: HellPlace = {
  light: { dark: 0.3, shade: [24, 10, 36], grade: '#E0EDBE' },
  sky: { paint: paintSky, alpha: 1 },
  skyLive,
};

void slab; void H;
