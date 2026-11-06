// The water park's level 1, its themed areas (the owner's "generally speaking i want the theming of the levels to feel
// unique, like you're going through a water park", then "i want more 'close background' variety. I don't want to make it
// seem like I'm going in circles"). From the gate to the summit, each slide has an area of its own, its own ground, its
// own near background right behind the play (walls, fences, foliage, buildings, set dressing), each piece placed by hand
// (no strip repeating), every one a variant (heights, colors, breaks, its own sign):
//
//   THE ENTRY PLAZA     (the gate to LIL SQUIRT)  pavers; the gift shop arcade, the park map board
//   SPLASH TOT TOWN     (LIL SQUIRT)               pastel rubber safety tiles; picket fences, the tipping bucket tower,
//                                                  mushroom sprinklers, a frog
//   TORNADO ALLEY       (THE TWISTER)              cracked county road; the wrecked barn, a bent windmill, the storm
//                                                  siren, a mobile home on its side, a cow on its back
//   THE LAGOON          (THE LAGOON)               sand; fake rockwork and its waterfalls, bamboo fences, tiki torches,
//                                                  a hammock
//   DAREDEVIL DROP ZONE (THE KAMIKAZE, THE DROP)   diamond plate; the stunt hangar, the bleachers of crash dummies, an
//                                                  ambulance waiting, a biplane nosed into the ground, cones
//   COSMIC QUEUE        (THE BLACK HOLE)           a starship deck; the rocket, planets on poles, mission control
//   SURF CITY           (THE SPLASHDOWN, WIPEOUT)  boardwalk planks; surf shacks, a fence of boards, the volleyball
//                                                  net, cabanas
//   THE DEEP            (THE ABYSS)                barnacled sea tiles; a sunken ship's hull, the anchor, kelp
//   (MOUNT EVEREST BUT BETTER's base camp: art.ts's own.)
//
// The tube rides (over the drop) get theirs up in the air: the Black Hole's giant inflatable planets and a ringed one on
// their tethers, the stars down in its drop; the Abyss's inflatable sea creatures, the glowing plankton down in its.
// Parallaxed off the ride's own shift (art.ts drawParkBackdrop), on a period of their own: round the loop, what's
// behind is never the same twice.
//
// Depth: all of it behind everything else of the plaza's (drawn first, before the palms): dimmed (back()), no flat lit
// tops (nothing here to stand on), stood on the ground at GY (its feet on the ground line). Everything stamped.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../../../m1/constants';
import { stamp } from '../../../m1/game/render/stamp';
import { mix, checker as dither } from '../../intro/art/kit';
import { signText, rampDown } from '../../signLetters';
import { GY } from './geo';

type Ctx = CanvasRenderingContext2D;
const INK = '#0A0806';
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const ramp5 = (col: string) => [mix(col, INK, 0.55), mix(col, INK, 0.3), col, mix(col, '#FFFFFF', 0.25), mix(col, '#FFFFFF', 0.5)];
/** Dimmed back toward the night (nothing here to stand on). */
const back = (col: string) => mix(col, '#26304E', 0.42);
const bk5 = (col: string) => ramp5(back(col));
/** ...and the big ones (rockwork, the wreck) further still: they're the most of the screen. */
const deep5 = (col: string) => ramp5(mix(col, '#26304E', 0.56));
const poly = (c: Ctx, pts: [number, number][], col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); c.fill(); };
const disc = (c: Ctx, x: number, y: number, r: number, col: string) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, a0 = 0, a1 = Math.PI * 2) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, a0, a1); c.fill(); };
/** A box in its ramp: inked, lit down its left, shaded down its right, dithered into the shade. */
const box = (c: Ctx, x: number, y: number, w: number, h: number, Rm: string[]) => {
  R(c, x - 1, y - 1, w + 2, h + 1, INK); R(c, x, y, w, h, Rm[2]); R(c, x, y, 3, h, Rm[3]); R(c, x, y, 1, h, Rm[4]);
  R(c, x + w - 5, y, 5, h, Rm[1]); dither(c, x + w - 8, y, 3, h, Rm[1]); R(c, x, y + h - 4, w, 4, Rm[1]);
};
const word = (c: Ctx, s: string, x: number, y: number, col: string, big = false) =>
  signText(c, s, x, y, { sx: big ? 2 : 1, sy: big ? 2 : 1, fill: rampDown(col, 0.3), dither: big, shadow: INK, drop: 1, gap: 1 });
/** A board with words on it (held up: its own posts are the caller's). */
const plate = (c: Ctx, cx: number, y: number, w: number, h: number, col: string, ink: string, s: string, big = false) => {
  const B = ramp5(col);
  R(c, cx - w / 2 - 1, y - 1, w + 2, h + 2, INK); R(c, cx - w / 2, y, w, h, B[2]); R(c, cx - w / 2, y, w, 2, B[3]); R(c, cx - w / 2, y + h - 2, w, 2, B[1]);
  word(c, s, cx, y + h - (big ? 4 : 3), ink, big);
};

// ---------------------------------------------------------------------------------------------------------------
// The pieces (each painted in its own box: x..x+w, GY-h..GY)

type Paint = (g: Ctx, x: number, v: number, w: number, h: number) => void;
interface Kind { w: number; h: number; paint: Paint }

// THE ENTRY PLAZA
const arcade: Paint = (g, x, v, w, h) => {
  const S = bk5(['#F4B6C2', '#A7E3D0', '#FCD9A0'][v % 3]), T = bk5(['#0E7490', '#BE185D', '#7C3AED'][v % 3]);
  const top = GY - h + 20;
  box(g, x, top, w, h - 20, S);
  // (its parapet in steps, a wave along it: no flat top)
  for (let k = 0; k < w; k += 20) { disc(g, x + k + 10, top, 11, INK); disc(g, x + k + 10, top, 9, S[2]); R(g, x + k + 4, top - 7, 5, 2, S[4]); }
  // (arched windows, lit: the gift shop's still open in there)
  for (let k = 0; k < 3; k++) {
    const wx = x + 22 + k * ((w - 44) / 3), ww = (w - 44) / 3 - 14, wy = top + 46;
    R(g, wx - 2, wy - 2, ww + 4, 52, INK); ell(g, wx + ww / 2, wy, ww / 2 + 2, 14, INK, Math.PI, 0);
    R(g, wx, wy, ww, 48, back('#F6C860')); ell(g, wx + ww / 2, wy, ww / 2, 12, back('#F6C860'), Math.PI, 0);
    R(g, wx, wy + 24, ww, 24, back('#E09A3A')); R(g, wx + ww / 2 - 1, wy - 12, 2, 60, S[0]);
    // (stuff in the window: inflatables, towels)
    disc(g, wx + 10, wy + 32, 7, back(['#EF4444', '#22C55E', '#3B82F6'][(k + v) % 3])); R(g, wx + ww - 16, wy + 26, 10, 20, back('#F8FAFC'));
  }
  // (the awning, striped, scalloped)
  for (let k = 0; k < w; k += 12) { R(g, x + k, top + 26, 12, 10, k % 24 ? T[2] : S[4]); ell(g, x + k + 6, top + 36, 6, 4, k % 24 ? T[2] : S[4], 0, Math.PI); }
  R(g, x - 2, top + 25, w + 4, 2, INK);
  plate(g, x + w / 2, top + 4, w - 60, 18, '#1E293B', '#FDE68A', ['SPLASH & STUFF', 'TOWELS $40', 'SUNBURN OUTLET'][v % 3]);
  R(g, x, GY - 6, w, 6, S[0]);
};
const mapboard: Paint = (g, x, v, w, h) => {
  const P = bk5('#6B4F2A'), bx = x + 8, bw = w - 16, by = GY - h + 6, bh = 80;
  for (const px of [bx + 12, bx + bw - 18]) { R(g, px - 1, by + bh, 8, GY - by - bh, INK); R(g, px, by + bh, 6, GY - by - bh, P[2]); R(g, px, by + bh, 2, GY - by - bh, P[3]); }
  box(g, bx, by, bw, bh, P);
  R(g, bx + 6, by + 6, bw - 12, bh - 22, back('#7DD3FC'));
  // (the park's map: blobs of land, the lazy river's loop, the mountain's peak)
  ell(g, bx + 30, by + 30, 20, 12, back('#86EFAC')); ell(g, bx + bw - 34, by + 26, 22, 14, back('#FDE68A'));
  g.strokeStyle = back('#2563EB'); g.lineWidth = 3; g.beginPath(); g.ellipse(bx + bw / 2, by + 34, 30, 12, 0, 0, Math.PI * 2); g.stroke();
  poly(g, [[bx + bw - 40, by + 44], [bx + bw - 28, by + 16], [bx + bw - 16, by + 44]], back('#F1F5F9'));
  disc(g, bx + 22, by + 40, 3, '#EF4444');
  word(g, 'YOU ARE HERE', bx + bw / 2, by + bh - 4, back('#F8FAFC'));
  void v;
};
// SPLASH TOT TOWN
const PASTEL = ['#F9A8D4', '#93C5FD', '#FDE68A', '#86EFAC', '#C4B5FD'];
const picket: Paint = (g, x, v, w) => {
  const rail = bk5('#F8FAFC');
  R(g, x, GY - 34, w, 5, INK); R(g, x, GY - 33, w, 3, rail[2]); R(g, x, GY - 16, w, 5, INK); R(g, x, GY - 15, w, 3, rail[1]);
  for (let k = 0, i = v; k < w - 8; k += 13, i++) {
    const Rm = bk5(PASTEL[i % 5]), t = GY - 52 - (i % 3) * 4;
    poly(g, [[x + k - 1, GY], [x + k - 1, t + 5], [x + k + 5, t - 2], [x + k + 11, t + 5], [x + k + 11, GY]], INK);
    poly(g, [[x + k, GY], [x + k, t + 5], [x + k + 5, t], [x + k + 10, t + 5], [x + k + 10, GY]], Rm[2]);
    R(g, x + k, t + 5, 2, GY - t - 5, Rm[3]); R(g, x + k + 8, t + 5, 2, GY - t - 5, Rm[1]);
  }
};
const bucket: Paint = (g, x, v, w, h) => {
  const Pk = bk5(PASTEL[v % 5]), Bl = bk5(PASTEL[(v + 1) % 5]), top = GY - h + 30, cx = x + w / 2;
  // (the frame: four posts, cross beams, a platform with portholes)
  for (const px of [x + 14, x + w - 22]) box(g, px, top + 40, 8, GY - top - 40, Pk);
  for (let y = top + 70; y < GY - 20; y += 40) { R(g, x + 14, y, w - 28, 6, INK); R(g, x + 15, y + 1, w - 30, 4, Bl[2]); R(g, x + 15, y + 1, w - 30, 1, Bl[3]); }
  // (the giant bucket up top on its pivot (two arms up off the platform, an axle), tipping, water sheeting off its lip)
  for (const ax of [cx - 26, cx + 22]) { R(g, ax - 1, top + 10, 6, 26, INK); R(g, ax, top + 11, 4, 24, Bl[2]); R(g, ax, top + 11, 1, 24, Bl[3]); }
  R(g, cx - 28, top + 13, 56, 5, INK); R(g, cx - 27, top + 14, 54, 3, back('#9CA3AF'));
  g.save(); g.translate(cx, top + 16); g.rotate(-0.25 - (v % 2) * 0.1);
  poly(g, [[-30, -22], [30, -22], [24, 20], [-24, 20]], INK); poly(g, [[-28, -20], [28, -20], [22, 18], [-22, 18]], back('#FACC15'));
  R(g, -28, -20, 56, 4, back('#FDE68A')); R(g, 12, -16, 10, 34, back('#CA8A04')); R(g, -30, -26, 60, 6, INK); R(g, -28, -25, 56, 4, back('#EF4444'));
  g.restore();
  for (let k = 0; k < 5; k++) R(g, cx + 26 + k * 3, top + 2 + k * 2, 2, 46 + k * 6, k % 2 ? back('#BFE6FF') : back('#7DD3FC'));
  R(g, x + 8, top + 34, w - 16, 10, INK); R(g, x + 9, top + 35, w - 18, 8, Pk[2]); R(g, x + 9, top + 35, w - 18, 2, Pk[3]);
};
const mushroom: Paint = (g, x, v, w, h) => {
  const cx = x + w / 2, cap = bk5(['#EF4444', '#A855F7', '#F97316'][v % 3]), st = bk5('#F1EFEA'), top = GY - h + 26;
  box(g, cx - 7, top + 10, 14, GY - top - 10, st);
  ell(g, cx, top + 12, 32, 22, INK, Math.PI, 0); ell(g, cx, top + 12, 30, 20, cap[2], Math.PI, 0); ell(g, cx - 6, top + 4, 18, 10, cap[3], Math.PI, 0);
  R(g, cx - 32, top + 10, 64, 4, cap[0]);
  for (const [dx, dy, r] of [[-14, -2, 5], [6, -10, 4], [16, 2, 4], [-2, 4, 3]] as const) disc(g, cx + dx, top + 8 + dy, r, back('#F8FAFC'));
  // (the sprinkle off its rim: drops in a ring, static)
  for (let k = 0; k < 10; k++) { const a = Math.PI + (k / 9) * Math.PI, rr = 36 + (k % 2) * 4; R(g, cx + Math.cos(a) * rr, top + 24 + (1 - Math.abs(Math.sin(a))) * 30 + (k % 3) * 4, 2, 4, back('#7DD3FC')); }
};
const frog: Paint = (g, x, v, w) => {
  const F = bk5('#4ADE80'), cx = x + w / 2;
  ell(g, cx, GY - 22, 40, 24, INK, Math.PI, 0); ell(g, cx, GY - 22, 38, 22, F[2], Math.PI, 0); ell(g, cx - 8, GY - 30, 22, 12, F[3], Math.PI, 0);
  R(g, cx - 40, GY - 24, 80, 24, INK); R(g, cx - 38, GY - 22, 76, 22, F[1]);
  for (const ex of [-18, 14]) { disc(g, cx + ex, GY - 46, 10, INK); disc(g, cx + ex, GY - 46, 8, back('#F8FAFC')); disc(g, cx + ex + 2, GY - 45, 4, INK); }
  // (its tongue's the slide: a pink tongue down to the splash mat)
  poly(g, [[cx + 20, GY - 22], [cx + 52, GY - 6], [cx + 52, GY], [cx + 18, GY - 14]], back('#F472B6'));
  R(g, cx - 30, GY - 18, 50, 2, F[0]); void v;
};
// TORNADO ALLEY
const barn: Paint = (g, x, v, w, h) => {
  const Rd = bk5('#9F1D1D'), Wh = bk5('#E7E5E4'), top = GY - h + 40, cx = x + w / 2;
  // (the gable, half its roof torn away: the rafters showing)
  poly(g, [[x - 2, top + 2], [cx, top - 40], [x + w + 2, top + 2]], INK);
  poly(g, [[x, top + 2], [cx, top - 38], [x + w, top + 2]], Rd[1]);
  for (let k = 0; k < 6; k++) { const rx = cx + 10 + k * 14; R(g, rx, top - 36 + k * 7, 3, 40 - k * 7, back('#3A2414')); }
  poly(g, [[x, top + 2], [cx, top - 38], [cx, top - 30], [x + 10, top + 2]], Rd[3]);
  // (its planks, boards missing (the dark through), a big X door)
  R(g, x - 1, top, w + 2, GY - top, INK); R(g, x, top + 1, w, GY - top - 1, Rd[2]);
  for (let k = 0; k < w; k += 10) { R(g, x + k, top + 1, 1, GY - top, Rd[1]); if (hash(k + v * 7) < 0.18) R(g, x + k + 1, top + 10 + hash(k) * 30, 9, 30 + hash(k + 1) * 40, back('#0B0A10')); }
  R(g, x, top + 1, 3, GY - top, Rd[3]);
  const dx = cx - 30, dw = 60, dy = top + 30;
  R(g, dx - 2, dy - 2, dw + 4, GY - dy + 2, Wh[1]); R(g, dx, dy, dw, GY - dy, Rd[1]);
  g.strokeStyle = Wh[2]; g.lineWidth = 4; g.beginPath(); g.moveTo(dx, dy); g.lineTo(dx + dw, GY); g.moveTo(dx + dw, dy); g.lineTo(dx, GY); g.stroke();
  R(g, dx, dy, dw, 3, Wh[3]);
  plate(g, cx, top + 6, 74, 14, '#E7E5E4', '#7F1D1D', ['FEED & SEED', 'NO TRESPASS', 'TWISTER 2'][v % 3]);
};
const windmill: Paint = (g, x, v, w, h) => {
  const S = bk5('#7A8494'), cx = x + w / 2, top = GY - h + 40;
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 4, top); g.lineTo(x + 6, GY); g.moveTo(cx + 4, top); g.lineTo(x + w - 6, GY); g.stroke();
  g.strokeStyle = S[2]; g.lineWidth = 2; g.stroke();
  g.strokeStyle = S[1]; g.lineWidth = 1; g.beginPath();
  for (let y = top + 20, k = 0; y < GY - 10; y += 26, k++) { const t = (y - top) / (GY - top), hw = 4 + t * (w / 2 - 6); g.moveTo(cx - hw, y); g.lineTo(cx + hw, y + 26 * (k % 2 ? 1 : -0.0)); g.moveTo(cx - hw, y); g.lineTo(cx + hw, y); }
  g.stroke();
  // (the fan, bent: a few blades gone)
  g.save(); g.translate(cx, top - 4); g.rotate(v * 0.7);
  for (let k = 0; k < 14; k++) { if (k % 5 === 2) continue; g.save(); g.rotate((k / 14) * Math.PI * 2 + (k === 7 ? 0.4 : 0)); poly(g, [[0, -3], [32, -6], [32, 6], [0, 3]], INK); poly(g, [[2, -2], [31, -5], [31, 4], [2, 2]], k % 2 ? S[3] : S[2]); g.restore(); }
  disc(g, 0, 0, 5, INK); disc(g, 0, 0, 3, S[3]); g.restore();
  // (its tail vane, the farm's name rusted off)
  poly(g, [[cx + 4, top - 8], [cx + 34, top - 18], [cx + 34, top + 4], [cx + 4, top]], back('#B45309'));
};
const siren: Paint = (g, x, v, w, h) => {
  const S = bk5('#9CA3AF'), cx = x + w / 2, top = GY - h + 30;
  box(g, cx - 3, top + 24, 6, GY - top - 24, bk5('#6B4F2A'));
  // (the siren: a drum of horns on top, yellow, a cage)
  R(g, cx - 18, top - 2, 36, 26, INK); R(g, cx - 17, top - 1, 34, 24, back('#FACC15')); R(g, cx - 17, top - 1, 34, 3, back('#FEF08A'));
  for (let k = 0; k < 4; k++) R(g, cx - 14 + k * 8, top + 4, 5, 15, back('#1F2937'));
  ell(g, cx, top - 2, 18, 5, INK); ell(g, cx, top - 3, 16, 3, S[3]);
  plate(g, cx, top + 40, 50, 12, '#FACC15', '#111827', 'TORNADO', false); void v;
};
const trailer: Paint = (g, x, v, w, h) => {
  // (a mobile home on its side: its floor's underside toward us, the wheels up, the siding on top)
  const Sd = bk5(['#E8E2C8', '#C7D2E0'][v % 2]), y0 = GY - h + 10;
  R(g, x - 1, y0 - 1, w + 2, GY - y0 + 1, INK); R(g, x, y0, w, GY - y0, Sd[2]);
  for (let yy = y0 + 4; yy < GY; yy += 6) R(g, x, yy, w, 1, Sd[1]);
  R(g, x, y0, w, 3, Sd[3]); R(g, x + w - 6, y0, 6, GY - y0, Sd[1]);
  R(g, x + 14, y0 + 10, 26, 18, back('#1E293B')); R(g, x + 14, y0 + 10, 26, 2, back('#94A3B8'));
  R(g, x + 60, y0 + 8, 44, 4, back('#0E7490')); R(g, x + 60, y0 + 40, 44, 4, back('#0E7490'));
  // (its wheels sticking out the top, the hitch)
  for (const wx of [x + 48, x + 80]) { disc(g, wx, y0 - 6, 9, INK); disc(g, wx, y0 - 6, 6, back('#27272A')); disc(g, wx, y0 - 6, 2, back('#9CA3AF')); }
  poly(g, [[x + w, GY - 20], [x + w + 18, GY - 14], [x + w, GY - 10]], back('#4B5563'));
};
const cow: Paint = (g, x, v, w) => {
  // (a fiberglass cow on its back, legs up: the ride's mascot, blown over)
  const C = bk5('#F5F5F4'), cx = x + w / 2;
  ell(g, cx, GY - 14, 30, 15, INK); ell(g, cx, GY - 14, 28, 13, C[2]);
  for (const [dx, dy] of [[-10, -4], [8, 2], [16, -8]] as const) ell(g, cx + dx, GY - 14 + dy, 7, 4, back('#18181B'));
  for (const lx of [-18, -6, 8, 20]) { R(g, cx + lx - 1, GY - 44, 6, 22, INK); R(g, cx + lx, GY - 43, 4, 20, C[1]); R(g, cx + lx, GY - 46, 4, 4, back('#3F3F46')); }
  ell(g, cx + 32, GY - 10, 10, 8, INK); ell(g, cx + 32, GY - 10, 8, 6, back('#FBCFE8')); void v;
};
// THE LAGOON
const rocks: Paint = (g, x, v, w, h) => {
  const Rk = deep5(['#8B6B4A', '#7A6A5A'][v % 2]), top = GY - h + 10;
  // (fake rockwork: a ridge of boulders in steps, each lit top-left, ferns at its foot, a waterfall down a cleft)
  const pts: [number, number][] = [[x, GY]];
  for (let k = 0; k <= 8; k++) pts.push([x + (k / 8) * w, top + 10 + hash(k + v * 13) * 40 * (k % 2 ? 1 : 0.4)]);
  pts.push([x + w, GY]);
  poly(g, pts.map(([a, b]) => [a, b - 2] as [number, number]), INK); poly(g, pts, Rk[2]);
  for (let k = 0; k < 7; k++) { const bx = x + 10 + hash(k + v) * (w - 50), by = top + 30 + hash(k + 3 + v) * (h - 70); ell(g, bx + 20, by + 14, 22, 15, Rk[1]); ell(g, bx + 16, by + 10, 16, 10, Rk[3]); ell(g, bx + 12, by + 6, 6, 4, Rk[4]); }
  dither(g, x, GY - 30, w, 12, Rk[1]); R(g, x, GY - 18, w, 18, Rk[1]);
  // (the waterfall: bands down the cleft, foam at its foot)
  const fx = x + w * (0.35 + (v % 3) * 0.15), fw = 18 + (v % 2) * 10, fy = top + 26;
  R(g, fx, fy, fw, GY - fy - 6, back('#2A78C0'));
  for (let k = 0; k < fw; k += 4) R(g, fx + k, fy, 2, GY - fy - 6, back(k % 8 ? '#7DD3FC' : '#E0F2FE'));
  ell(g, fx + fw / 2, GY - 8, fw, 6, back('#E0F2FE'));
  // (ferns)
  for (let k = 0; k < 6; k++) { const px = x + 8 + k * (w / 6) + hash(k + 40) * 12; for (let j = -2; j <= 2; j++) poly(g, [[px, GY], [px + j * 9, GY - 24 + Math.abs(j) * 5], [px + j * 6 + 3, GY - 20 + Math.abs(j) * 5]], back(j % 2 ? '#15803D' : '#22C55E')); }
};
const torch: Paint = (g, x, v, w, h) => {
  const B = bk5('#A8843E'), cx = x + w / 2, top = GY - h + 26;
  box(g, cx - 3, top + 14, 6, GY - top - 14, B);
  for (let y = top + 26; y < GY - 6; y += 14) R(g, cx - 3, y, 6, 2, B[0]);
  R(g, cx - 6, top + 8, 12, 10, INK); R(g, cx - 5, top + 9, 10, 8, back('#78350F'));
  // (the flame: stepped yellows, painted still (the lights' glow is the lamps'))
  poly(g, [[cx - 7, top + 9], [cx - 3, top - 8], [cx, top - 2], [cx + 3, top - 14], [cx + 7, top + 9]], '#F97316');
  poly(g, [[cx - 4, top + 9], [cx - 1, top - 2], [cx + 2, top - 6], [cx + 4, top + 9]], '#FACC15');
  R(g, cx - 1, top + 2, 2, 6, '#FEF9C3'); void v;
};
const bamboo: Paint = (g, x, v, w, h) => {
  const B = bk5('#B59248');
  R(g, x, GY - h + 22, w, 4, INK); R(g, x, GY - 26, w, 4, INK);
  for (let k = 0; k < w - 6; k += 8) {
    const t = GY - h + 10 + ((k + v * 5) % 3) * 5;
    R(g, x + k - 1, t, 8, GY - t, INK); R(g, x + k, t + 1, 6, GY - t - 1, B[2]); R(g, x + k, t + 1, 2, GY - t - 1, B[3]); R(g, x + k + 5, t + 1, 1, GY - t - 1, B[1]);
    for (let y = t + 14 + (k % 16) / 2; y < GY - 4; y += 18) R(g, x + k, y, 6, 2, B[0]);
    ell(g, x + k + 3, t + 1, 3, 2, B[1]);
  }
  R(g, x, GY - h + 23, w, 2, back('#6B4F2A')); R(g, x, GY - 25, w, 2, back('#6B4F2A'));
};
const hammock: Paint = (g, x, v, w, h) => {
  const B = bk5('#8B5E34'), top = GY - h + 6;
  for (const px of [x + 4, x + w - 12]) box(g, px, top, 8, GY - top, B);
  g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(x + 10, top + 14); g.quadraticCurveTo(x + w / 2, top + 64, x + w - 10, top + 14); g.stroke();
  const st = ['#F97316', '#0891B2', '#FACC15', '#DB2777'];
  st.forEach((col, k) => { g.strokeStyle = back(col); g.lineWidth = 2; g.beginPath(); g.moveTo(x + 10, top + 11 + k * 2); g.quadraticCurveTo(x + w / 2, top + 61 + k * 2, x + w - 10, top + 11 + k * 2); g.stroke(); });
  // (a coconut drink left in it, a straw)
  disc(g, x + w / 2 + 8, top + 34, 5, back('#5A3A1E')); R(g, x + w / 2 + 9, top + 22, 1, 10, back('#F472B6')); void v;
};
// DAREDEVIL DROP ZONE
const hangar: Paint = (g, x, v, w, h) => {
  const M = bk5(['#64748B', '#6B7280'][v % 2]), top = GY - h + 30, cx = x + w / 2;
  // (a quonset hangar end on: the arch, corrugated, its doors rolled half up)
  ell(g, cx, top + 30, w / 2 + 1, 52, INK, Math.PI, 0); ell(g, cx, top + 30, w / 2 - 1, 50, M[2], Math.PI, 0);
  R(g, x - 1, top + 30, w + 2, GY - top - 30, INK); R(g, x, top + 30, w, GY - top - 30, M[2]);
  for (let k = 4; k < w; k += 6) R(g, x + k, top + 20, 2, GY - top - 20, M[k % 12 ? 1 : 3]);
  ell(g, cx - w / 4, top + 6, w / 6, 16, M[4], Math.PI, 0);
  const dx = x + 30, dw = w - 60, dy = top + 64;
  R(g, dx - 2, dy - 2, dw + 4, GY - dy + 2, INK); R(g, dx, dy, dw, GY - dy, back('#0B0D14'));
  for (let y = dy; y < dy + 30; y += 4) R(g, dx, y, dw, 3, M[1]);
  for (let k = 0; k < dw; k += 16) poly(g, [[dx + k, GY - 10], [dx + k + 8, GY - 10], [dx + k + 16, GY], [dx + k + 8, GY]], back('#FACC15'));
  // (its big painted number, and the sign over the door)
  word(g, String(13 + v * 53), cx + w / 3, top + 52, back('#F8FAFC'), true);
  plate(g, cx, top + 30, 120, 16, '#FACC15', '#111827', ['SIGN THE WAIVER', 'STUNT HANGAR', 'NO REFUNDS'][v % 3]);
};
const bleachers: Paint = (g, x, v, w, h) => {
  const S = bk5('#94A3B8'), top = GY - h + 8;
  // (four tiers, sloped up and back; crash test dummies sat on them, cheering, one fallen through)
  for (let k = 0; k < 4; k++) {
    const y = top + k * 20, x0 = x + k * 12;
    R(g, x0 - 1, y + 16, w - k * 12 + 1, 6, INK); R(g, x0, y + 17, w - k * 12, 4, S[2]); R(g, x0, y + 17, w - k * 12, 1, S[3]);
  }
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); for (let k = 0; k < w; k += 30) { g.moveTo(x + k + 4, top + 22); g.lineTo(x + k + 40, GY); } g.stroke();
  for (let k = 0; k < 9; k++) {
    const tier = k % 4, dx = x + 14 + tier * 12 + Math.floor(k / 4) * 54 + hash(k + v) * 10, dy = top + tier * 20 + 16;
    if (dx > x + w - 10) continue;
    R(g, dx - 4, dy - 16, 9, 14, INK); R(g, dx - 3, dy - 15, 7, 12, back('#FDE047'));
    disc(g, dx + 0.5, dy - 21, 5, INK); disc(g, dx + 0.5, dy - 21, 4, back('#FDE047'));
    R(g, dx - 2, dy - 22, 1, 1, INK); R(g, dx + 2, dy - 22, 1, 1, INK);
    if (k % 3 === 0) R(g, dx + 3, dy - 30, 2, 12, back('#FDE047'));
    R(g, dx - 4, dy - 12, 9, 2, INK);
  }
};
const ambulance: Paint = (g, x, v, w, h) => {
  const Wt = bk5('#F1F5F9'), top = GY - h + 10;
  R(g, x - 1, top - 1, w * 0.62 + 2, GY - top - 8, INK); R(g, x, top, w * 0.62, GY - top - 10, Wt[2]);
  poly(g, [[x + w * 0.62, top + 16], [x + w - 14, top + 16], [x + w, top + 32], [x + w, GY - 10], [x + w * 0.62, GY - 10]], INK);
  poly(g, [[x + w * 0.62, top + 17], [x + w - 15, top + 17], [x + w - 1, top + 33], [x + w - 1, GY - 11], [x + w * 0.62, GY - 11]], Wt[2]);
  R(g, x + w * 0.66, top + 20, 24, 12, back('#1E293B'));
  R(g, x, top + 22, w, 6, back('#DC2626'));
  R(g, x + 30, top + 6, 6, 16, back('#DC2626')); R(g, x + 25, top + 11, 16, 6, back('#DC2626'));
  R(g, x + 20, top - 6, 16, 6, INK); R(g, x + 21, top - 5, 7, 4, '#EF4444'); R(g, x + 28, top - 5, 7, 4, '#3B82F6');
  for (const wx of [x + 22, x + w - 26]) { disc(g, wx, GY - 9, 9, INK); disc(g, wx, GY - 9, 5, back('#6B7280')); }
  word(g, 'ON STANDBY', x + w * 0.3, top + 40, back('#DC2626')); void v;
};
const plane: Paint = (g, x, v, w, h) => {
  // (a biplane nosed into the ground, its tail up, a wing snapped)
  const P = bk5(['#B91C1C', '#1D4ED8'][v % 2]);
  g.save(); g.translate(x + 30, GY - 6); g.rotate(-0.62);
  R(g, -2, -11, w * 0.8 + 4, 22, INK); R(g, 0, -9, w * 0.8, 18, P[2]); R(g, 0, -9, w * 0.8, 4, P[3]);
  for (let k = 12; k < w * 0.8; k += 14) R(g, k, -9, 1, 18, P[1]);
  poly(g, [[w * 0.8, -9], [w * 0.8 + 22, -24], [w * 0.8 + 26, -24], [w * 0.8 + 8, 9]], P[1]);
  R(g, 20, -28, 8, 60, INK); R(g, 21, -27, 6, 58, back('#F5F5F4')); R(g, 50, -26, 6, 30, INK); R(g, 51, -25, 4, 28, back('#F5F5F4'));
  g.restore();
  R(g, x + 10, GY - 8, 46, 8, back('#3F2A1A'));
  for (let k = 0; k < 4; k++) R(g, x + 6 + k * 12, GY - 12 - hash(k + v) * 6, 6, 4, back('#5A3A20'));
  void h;
};
const cones: Paint = (g, x, v, w) => {
  for (let k = 0; k < w - 10; k += 18) {
    const cx = x + k + 8, ht = 18 + ((k / 18 + v) % 2) * 6;
    poly(g, [[cx - 8, GY], [cx, GY - ht - 1], [cx + 8, GY]], INK); poly(g, [[cx - 7, GY], [cx, GY - ht], [cx + 7, GY]], back('#F97316'));
    R(g, cx - 4, GY - ht * 0.55, 8, 3, back('#F8FAFC')); R(g, cx - 9, GY - 3, 18, 3, back('#7C2D12'));
  }
};
// COSMIC QUEUE
const rocket: Paint = (g, x, v, w, h) => {
  const Wt = bk5('#E2E8F0'), cx = x + w / 2, top = GY - h + 20;
  // (the rocket on its pad: its fins, portholes, the nose cone; stamped in its steps)
  ell(g, cx, top + 40, 17, 40, INK); R(g, cx - 17, top + 40, 34, GY - top - 70, INK);
  ell(g, cx, top + 40, 15, 38, Wt[2]); R(g, cx - 15, top + 40, 30, GY - top - 70, Wt[2]);
  R(g, cx - 15, top + 30, 5, GY - top - 60, Wt[3]); R(g, cx + 9, top + 30, 6, GY - top - 60, Wt[1]);
  ell(g, cx, top + 14, 9, 16, back('#DC2626'));
  for (let k = 0; k < 3; k++) { disc(g, cx, top + 60 + k * 34, 6, INK); disc(g, cx, top + 60 + k * 34, 4, back('#38BDF8')); R(g, cx - 2, top + 58 + k * 34, 2, 2, '#E0F2FE'); }
  for (const s of [-1, 1]) poly(g, [[cx + s * 15, GY - 70], [cx + s * 32, GY - 34], [cx + s * 32, GY - 26], [cx + s * 15, GY - 40]], back('#DC2626'));
  R(g, cx - 24, GY - 30, 48, 30, INK); R(g, cx - 23, GY - 29, 46, 29, back('#334155')); for (let k = 0; k < 46; k += 8) R(g, cx - 23 + k, GY - 29, 4, 29, back('#475569'));
  word(g, 'USA', cx, top + 180, back('#1D4ED8')); void v;
};
const planets: Paint = (g, x, v, w, h) => {
  const cx = x + w / 2, top = GY - h + 20;
  R(g, cx - 2, top + 20, 4, GY - top - 20, INK); R(g, cx - 1, top + 20, 2, GY - top - 20, back('#94A3B8'));
  const cols = ['#F59E0B', '#6366F1', '#10B981', '#EC4899'];
  for (let k = 0; k < 3; k++) {
    const py = top + 10 + k * 40, px = cx + (k % 2 ? 18 : -16), r = 10 + ((k + v) % 3) * 4, Rm = bk5(cols[(k + v) % 4]);
    R(g, Math.min(cx, px), py, Math.abs(px - cx), 2, back('#94A3B8'));
    disc(g, px, py, r + 1, INK); disc(g, px, py, r, Rm[2]); disc(g, px - r * 0.3, py - r * 0.3, r * 0.55, Rm[3]); R(g, px - r * 0.5, py - r * 0.5, 2, 2, Rm[4]);
    if ((k + v) % 3 === 1) { g.strokeStyle = Rm[4]; g.lineWidth = 2; g.beginPath(); g.ellipse(px, py, r * 1.8, r * 0.45, -0.3, 0, Math.PI * 2); g.stroke(); }
  }
};
const mission: Paint = (g, x, v, w, h) => {
  const M = bk5('#475569'), top = GY - h + 50, cx = x + w / 2;
  ell(g, cx, top + 10, w / 2 - 10, 42, INK, Math.PI, 0); ell(g, cx, top + 10, w / 2 - 12, 40, back('#1E293B'), Math.PI, 0);
  for (let k = 0; k < 5; k++) ell(g, cx, top + 10, w / 2 - 14 - k * 14, 38 - k * 7, k % 2 ? back('#334155') : back('#1E293B'), Math.PI, 0);
  box(g, x, top + 10, w, GY - top - 10, M);
  for (let k = 0; k < 4; k++) { disc(g, x + 30 + k * ((w - 60) / 3), top + 36, 9, INK); disc(g, x + 30 + k * ((w - 60) / 3), top + 36, 7, back('#A5F3FC')); }
  plate(g, cx, top + 54, w - 40, 18, '#0F172A', '#67E8F9', 'COSMIC QUEUE');
  R(g, cx - 20, GY - 34, 40, 34, INK); R(g, cx - 19, GY - 33, 38, 33, back('#0B1220'));
  R(g, cx - 2, top - 60, 4, 30, M[2]); disc(g, cx, top - 62, 4, '#F43F5E'); void v;
};
// SURF CITY
const shack: Paint = (g, x, v, w, h) => {
  const Wd = bk5(['#0EA5A4', '#F59E0B', '#E879F9'][v % 3]), top = GY - h + 30;
  // (plank walls painted, a slanted tin roof (no flat top), the counter, boards leaning on it)
  box(g, x + 10, top + 14, w - 20, GY - top - 14, Wd);
  for (let k = x + 20; k < x + w - 10; k += 9) R(g, k, top + 14, 1, GY - top - 14, Wd[1]);
  poly(g, [[x - 4, top + 18], [x + w + 4, top - 4], [x + w + 4, top + 4], [x - 4, top + 24]], INK);
  poly(g, [[x - 2, top + 18], [x + w + 2, top - 2], [x + w + 2, top + 2], [x - 2, top + 22]], back('#A1A1AA'));
  R(g, x + 30, top + 40, w - 60, 30, back('#140E0A')); R(g, x + 26, top + 70, w - 52, 5, Wd[0]);
  plate(g, x + w / 2, top + 22, w - 50, 15, '#FEF3C7', '#7C2D12', ['SURF RENTALS', 'SHAVE ICE', 'BAIT & TACKLE', 'WAX ON'][v % 4]);
  for (let k = 0; k < 3; k++) { const bx = x + w - 30 + k * 10; poly(g, [[bx, GY], [bx + 6, GY - 70 + k * 6], [bx + 12, GY]], INK); poly(g, [[bx + 1, GY], [bx + 6, GY - 68 + k * 6], [bx + 11, GY]], back(['#F43F5E', '#FACC15', '#22D3EE'][(k + v) % 3])); }
};
const boards: Paint = (g, x, v, w, h) => {
  const cols = ['#F43F5E', '#FACC15', '#22D3EE', '#A3E635', '#F97316', '#C084FC'];
  for (let k = 0, i = v; k < w - 12; k += 14, i++) {
    const bh = h - 10 - (i % 4) * 9, bx = x + k, Rm = bk5(cols[i % 6]);
    ell(g, bx + 7, GY - bh / 2, 8, bh / 2, INK); ell(g, bx + 7, GY - bh / 2, 6, bh / 2 - 1, Rm[2]); ell(g, bx + 5, GY - bh / 2 - 4, 2, bh / 2 - 8, Rm[3]);
    R(g, bx + 6, GY - bh + 6, 2, bh - 10, i % 2 ? back('#F8FAFC') : Rm[0]);
  }
};
const volley: Paint = (g, x, v, w, h) => {
  const top = GY - h + 10;
  for (const px of [x + 4, x + w - 8]) { R(g, px - 1, top, 6, GY - top, INK); R(g, px, top, 4, GY - top, back('#E5E7EB')); }
  R(g, x + 8, top + 4, w - 16, 24, back('#0B0D14'));
  g.strokeStyle = back('#D4D4D8'); g.lineWidth = 1; g.beginPath();
  for (let k = x + 8; k < x + w - 8; k += 6) { g.moveTo(k, top + 4); g.lineTo(k, top + 28); }
  for (let y = top + 4; y <= top + 28; y += 6) { g.moveTo(x + 8, y); g.lineTo(x + w - 8, y); }
  g.stroke(); R(g, x + 8, top + 3, w - 16, 3, back('#F8FAFC'));
  disc(g, x + w / 2 + 20, GY - 6, 6, INK); disc(g, x + w / 2 + 20, GY - 6, 5, back('#FDE68A')); R(g, x + w / 2 + 16, GY - 8, 8, 1, back('#2563EB')); void v;
};
const cabana: Paint = (g, x, v, w, h) => {
  const A = bk5(['#0891B2', '#DB2777', '#16A34A'][v % 3]), top = GY - h + 16, cx = x + w / 2;
  poly(g, [[x - 2, top + 22], [cx, top - 2], [x + w + 2, top + 22]], INK);
  for (let k = 0; k < 6; k++) poly(g, [[x + (k / 6) * w, top + 21], [cx, top], [x + ((k + 1) / 6) * w, top + 21]], k % 2 ? A[2] : back('#F8FAFC'));
  for (let k = 0; k < w; k += 10) { ell(g, x + k + 5, top + 22, 5, 4, k % 20 ? A[2] : back('#F8FAFC'), 0, Math.PI); }
  R(g, x + 6, top + 22, w - 12, GY - top - 22, back('#1E1A2A'));
  for (let k = 0; k < 5; k++) R(g, x + 6 + k * ((w - 12) / 5), top + 22, (w - 12) / 10, GY - top - 22, A[1]);
  R(g, x + 4, top + 22, 3, GY - top - 22, back('#E5E7EB')); R(g, x + w - 7, top + 22, 3, GY - top - 22, back('#E5E7EB'));
};
// THE DEEP
const ship: Paint = (g, x, v, w, h) => {
  const Hl = deep5('#3F5A55'), top = GY - h + 20;
  // (a sunken galleon's hull, keeled over, barnacled: its bow up, a mast snapped, portholes glowing green)
  poly(g, [[x, GY], [x + 10, top + 50], [x + w * 0.55, top + 30], [x + w, top - 10], [x + w - 10, GY]], INK);
  poly(g, [[x + 2, GY], [x + 12, top + 52], [x + w * 0.55, top + 32], [x + w - 2, top - 7], [x + w - 12, GY]], Hl[2]);
  g.strokeStyle = Hl[0]; g.lineWidth = 4; g.beginPath(); g.moveTo(x + 12, top + 54); g.lineTo(x + w * 0.55, top + 34); g.lineTo(x + w - 2, top - 5); g.stroke();
  for (let k = 0; k < 6; k++) { const yy = top + 60 + k * 16; g.strokeStyle = Hl[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 8, yy + 10); g.lineTo(x + w - 10, yy - 30 + k * 3); g.stroke(); }
  for (let k = 0; k < 5; k++) { const px = x + 40 + k * (w - 80) / 4, py = top + 66 - k * 8; disc(g, px, py, 8, INK); disc(g, px, py, 6, mix('#4ADE80', '#26304E', 0.6)); R(g, px - 2, py - 3, 2, 2, mix('#D9F99D', '#26304E', 0.5)); }
  for (let k = 0; k < 40; k++) R(g, x + 10 + hash(k + v) * (w - 20), GY - 6 - hash(k + 9) * 70, 3, 2, back('#D6D3D1'));
  R(g, x + w * 0.45, top - 40, 6, 76, INK); R(g, x + w * 0.45 + 1, top - 39, 4, 74, back('#5A3A20'));
  poly(g, [[x + w * 0.45 + 6, top - 36], [x + w * 0.45 + 46, top - 10], [x + w * 0.45 + 6, top + 4]], back('#D6CFC0'));
  for (let k = 0; k < 4; k++) R(g, x + w * 0.45 + 12 + k * 8, top - 26 + k * 6, 3, 8, back('#0B0D14'));
  plate(g, x + w * 0.3, GY - 40, 92, 15, '#14532D', '#BBF7D0', 'THE DEEP');
};
const anchor: Paint = (g, x, v, w, h) => {
  const S = bk5('#6B7280'), cx = x + w / 2, top = GY - h + 10;
  g.lineCap = 'round';
  g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(cx, top + 10); g.lineTo(cx, GY - 14); g.moveTo(cx - 20, top + 24); g.lineTo(cx + 20, top + 24); g.moveTo(cx - 28, GY - 34); g.quadraticCurveTo(cx, GY + 6, cx + 28, GY - 34); g.stroke();
  g.strokeStyle = S[2]; g.lineWidth = 5; g.stroke();
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(cx, top + 6, 7, 0, Math.PI * 2); g.stroke();
  g.lineCap = 'butt';
  for (let k = 0; k < 10; k++) R(g, cx - 3 + hash(k + v) * 6, top + 20 + k * 8, 3, 2, back('#A16207'));
};
const kelp: Paint = (g, x, v, w, h) => {
  for (let k = 0; k < 3; k++) {
    const bx = x + 8 + k * ((w - 16) / 2), ht = h - 10 - ((k + v) % 3) * 18;
    for (let y = 0; y < ht; y += 8) {
      const sw = Math.sin((y + k * 20) * 0.07) * 5;
      R(g, bx + sw - 3, GY - y - 8, 7, 9, INK); R(g, bx + sw - 2, GY - y - 8, 5, 8, back(k % 2 ? '#15803D' : '#4D7C0F'));
      if (y % 24 === 8) ell(g, bx + sw + 6, GY - y - 4, 6, 3, back('#65A30D'));
    }
  }
};

const KINDS: Record<string, Kind> = {
  arcade: { w: 260, h: 170, paint: arcade }, mapboard: { w: 130, h: 150, paint: mapboard },
  picket: { w: 180, h: 60, paint: picket }, bucket: { w: 120, h: 230, paint: bucket }, mushroom: { w: 76, h: 100, paint: mushroom }, frog: { w: 120, h: 60, paint: frog },
  barn: { w: 200, h: 180, paint: barn }, windmill: { w: 80, h: 240, paint: windmill }, siren: { w: 50, h: 190, paint: siren }, trailer: { w: 170, h: 70, paint: trailer }, cow: { w: 90, h: 50, paint: cow },
  rocks: { w: 220, h: 170, paint: rocks }, torch: { w: 30, h: 120, paint: torch }, bamboo: { w: 160, h: 80, paint: bamboo }, hammock: { w: 130, h: 80, paint: hammock },
  hangar: { w: 260, h: 170, paint: hangar }, bleachers: { w: 180, h: 100, paint: bleachers }, ambulance: { w: 140, h: 76, paint: ambulance }, plane: { w: 130, h: 110, paint: plane }, cones: { w: 70, h: 30, paint: cones },
  rocket: { w: 80, h: 250, paint: rocket }, planets: { w: 70, h: 150, paint: planets }, mission: { w: 200, h: 170, paint: mission },
  shack: { w: 180, h: 130, paint: shack }, boards: { w: 140, h: 90, paint: boards }, volley: { w: 160, h: 70, paint: volley }, cabana: { w: 110, h: 100, paint: cabana },
  ship: { w: 260, h: 180, paint: ship }, anchor: { w: 70, h: 110, paint: anchor }, kelp: { w: 60, h: 140, paint: kelp },
};
/** Each piece: where (its left), what, which look, and (some) its own size. Placed on the ground's runs, clear of the
 *  pits' edges; one area to the next. */
const PIECES: { x: number; k: string; v: number; w?: number; h?: number }[] = [
  // THE ENTRY PLAZA
  { x: 860, k: 'arcade', v: 0 }, { x: 1150, k: 'mapboard', v: 0 },
  // SPLASH TOT TOWN
  { x: 1290, k: 'picket', v: 0, w: 200 }, { x: 1700, k: 'mushroom', v: 0, h: 110 }, { x: 1790, k: 'bucket', v: 1 }, { x: 1930, k: 'picket', v: 2, w: 120 },
  { x: 2070, k: 'frog', v: 0 }, { x: 2200, k: 'mushroom', v: 1, h: 86 }, { x: 2290, k: 'picket', v: 3, w: 140 },
  // TORNADO ALLEY
  { x: 2440, k: 'windmill', v: 1 }, { x: 2600, k: 'cow', v: 0 }, { x: 2880, k: 'barn', v: 0 }, { x: 3100, k: 'siren', v: 0 }, { x: 3170, k: 'trailer', v: 0 }, { x: 3380, k: 'cow', v: 1 }, { x: 4060, k: 'windmill', v: 2, h: 200 },
  // THE LAGOON
  { x: 4180, k: 'rocks', v: 0, w: 200, h: 140 }, { x: 4400, k: 'torch', v: 0 }, { x: 4440, k: 'bamboo', v: 0, w: 120 }, { x: 5110, k: 'rocks', v: 1, w: 240, h: 190 },
  { x: 5370, k: 'hammock', v: 0 }, { x: 5520, k: 'torch', v: 1, h: 100 }, { x: 5560, k: 'bamboo', v: 1, w: 180 }, { x: 5760, k: 'torch', v: 2 }, { x: 6080, k: 'torch', v: 0, h: 96 },
  // DAREDEVIL DROP ZONE
  { x: 6800, k: 'hangar', v: 0 }, { x: 7070, k: 'ambulance', v: 0 }, { x: 7230, k: 'bleachers', v: 0 }, { x: 7430, k: 'cones', v: 0, w: 90 },
  { x: 8150, k: 'cones', v: 1, w: 70 }, { x: 8590, k: 'plane', v: 0 },
  // COSMIC QUEUE
  { x: 9190, k: 'rocket', v: 0 }, { x: 9280, k: 'planets', v: 0 }, { x: 9620, k: 'mission', v: 0 },
  // SURF CITY
  { x: 16030, k: 'shack', v: 0 }, { x: 16230, k: 'boards', v: 0 }, { x: 16560, k: 'volley', v: 0 }, { x: 16740, k: 'cabana', v: 0 },
  { x: 17140, k: 'cabana', v: 1, h: 86 }, { x: 17450, k: 'shack', v: 1, w: 170, h: 120 }, { x: 17640, k: 'hammock', v: 1, w: 110 }, { x: 17760, k: 'cabana', v: 2, w: 90 },
  // THE DEEP
  { x: 19070, k: 'kelp', v: 0, h: 120 }, { x: 19160, k: 'ship', v: 0 }, { x: 19425, k: 'anchor', v: 0 }, { x: 19700, k: 'kelp', v: 1 }, { x: 19800, k: 'kelp', v: 2, h: 100 },
];

/** The near background: each piece stamped (on screen only), stood on the ground. Behind all else of the plaza's. */
export const drawZonesBack = (c: Ctx, state: GameState, vis: (a: number, b: number) => boolean) => {
  if (state.camera.y + H < GY - 260) return;
  for (const p of PIECES) {
    const K = KINDS[p.k], w = p.w ?? K.w, h = p.h ?? K.h;
    if (!vis(p.x - 60, p.x + w + 60) || GY < state.camera.y - 4 || GY - h - 16 > state.camera.y + H) continue;
    // (its box tight round it: a stamp's every pixel is put down each frame, empty or not)
    stamp(c, `wp-zone-${p.k}-${p.x}`, p.x - 20, GY - h - 16, w + 40, h + 20, g => K.paint(g, p.x, p.v, w, h));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The ground, area by area (a tile each, GT wide; the lit lip along the top, always: it's stood on)

export type Ground = 'pave' | 'rubber' | 'road' | 'sand' | 'plate' | 'deck' | 'boards' | 'sea';
// (on the ground tiles' grid (GT 256): each area's ground starts at a tile's edge)
const AREA: [number, Ground][] = [[-1e9, 'pave'], [1280, 'rubber'], [2304, 'road'], [3840, 'sand'], [6144, 'plate'], [8960, 'deck'], [15360, 'boards'], [18944, 'sea'], [27648, 'pave']];
export const groundAt = (x: number): Ground => { let g: Ground = 'pave'; for (const [a, k] of AREA) if (x >= a) g = k; return g; };
/** Paints an area's tile (x the tile's left, w by h from GY; v one of four looks). */
export const paintZoneGround = (g: Ctx, z: Ground, x: number, v: number, w: number, h: number) => {
  const y = GY;
  const lip = (base: string) => { const B = ramp5(base); R(g, x, y, w, 2, '#FFF6E2'); R(g, x, y + 2, w, 3, B[4]); R(g, x, y + 5, w, 4, B[3]); dither(g, x, y + 7, w, 2, B[2]); R(g, x, y + 9, w, 2, B[0]); };
  if (z === 'rubber') {
    // (pastel foam safety tiles, interlocked, each lit along its top, a dimple pattern)
    for (let k = 0; k < w; k += 32) for (const [ty, th] of [[11, 38], [49, h - 49]] as const) {
      const Rm = ramp5(mix(PASTEL[(k / 32 + (ty > 20 ? 2 : 0) + v) % 5], '#3A3448', 0.5));
      R(g, x + k, y + ty, 32, th, Rm[2]); R(g, x + k, y + ty, 32, 2, Rm[3]); R(g, x + k, y + ty, 1, th, Rm[3]); R(g, x + k + 31, y + ty, 1, th, Rm[0]);
      for (let d = 0; d < 4; d++) R(g, x + k + 6 + (d % 2) * 14, y + ty + 8 + Math.floor(d / 2) * 14, 3, 2, Rm[1]);
      dither(g, x + k, y + ty + th - 6, 32, 4, Rm[1]);
    }
    lip('#C8A0B4');
  } else if (z === 'road') {
    // (a cracked county road: asphalt in its steps, the faded center line, gravel shoulder, cracks)
    const A = ['#1C1C22', '#2A2A32', '#38383F', '#4A4A52', '#62626A'];
    R(g, x, y, w, h, A[1]); dither(g, x, y + 20, w, h - 30, A[2]);
    for (let k = 0; k < 60; k++) R(g, x + hash(k + v * 31) * w, y + 12 + hash(k * 3 + v) * (h - 16), 2, 1, k % 2 ? A[3] : A[0]);
    for (let k = 0; k < w; k += 64) R(g, x + k + 8, y + 40, 34, 4, mix('#E6B422', A[1], 0.45));
    g.strokeStyle = A[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 30 + v * 40, y + 12); g.lineTo(x + 46 + v * 40, y + 30); g.lineTo(x + 40 + v * 40, y + 52); g.lineTo(x + 70 + v * 40, y + 70); g.stroke();
    R(g, x, y + h - 14, w, 14, '#3A3228'); dither(g, x, y + h - 18, w, 4, '#3A3228');
    lip('#8A8478');
  } else if (z === 'sand') {
    // (sand: warm banded, ripples, shells, a footprint or two)
    const S = ['#8A6E46', '#A88A58', '#C2A46C', '#D8BC82', '#EAD4A0'];
    R(g, x, y, w, h, S[2]); dither(g, x, y + 24, w, 6, S[1]); R(g, x, y + 30, w, h - 30, S[1]); dither(g, x, y + 56, w, 6, S[0]); R(g, x, y + 62, w, h - 62, S[0]);
    for (let k = 0; k < w; k += 22) { R(g, x + k + ((k / 22) % 2) * 8, y + 18, 12, 1, S[3]); R(g, x + k + 6, y + 42, 10, 1, S[2]); }
    for (let k = 0; k < 4; k++) R(g, x + hash(k + v * 5) * (w - 6), y + 14 + hash(k + 7 + v) * 40, 4, 2, k % 2 ? '#F5E6D0' : '#E7A9A0');
    if (v === 1) for (let k = 0; k < 3; k++) { R(g, x + 60 + k * 40, y + 22 + (k % 2) * 6, 6, 3, S[1]); R(g, x + 60 + k * 40, y + 21 + (k % 2) * 6, 6, 1, S[0]); }
    lip('#C2A46C');
  } else if (z === 'plate') {
    // (diamond plate steel, hazard stripes along its front, bolted)
    const M = ['#2A3038', '#3C444E', '#525C68', '#6C7884', '#8E9AA6'];
    R(g, x, y, w, h, M[2]);
    for (let yy = y + 14; yy < y + h - 20; yy += 8) for (let k = ((yy / 8) % 2) * 8; k < w; k += 16) { R(g, x + k, yy, 6, 2, M[4]); R(g, x + k + 1, yy + 2, 6, 1, M[0]); }
    for (let k = 0; k < w; k += 20) poly(g, [[x + k, y + h - 6], [x + k + 10, y + h - 18], [x + k + 20, y + h - 18], [x + k + 10, y + h - 6]], '#C59A14');
    R(g, x, y + h - 20, w, 2, M[0]); R(g, x, y + h - 6, w, 6, M[0]);
    for (let k = 8; k < w; k += 64) { R(g, x + k, y + 13, 3, 3, M[0]); R(g, x + k, y + 13, 1, 1, M[4]); }
    lip('#8E9AA6');
  } else if (z === 'deck') {
    // (a starship deck: dark panels, glowing seams, blinking-looking dots (painted lit))
    const D = ['#0E1226', '#171C38', '#232A4E', '#343E6A', '#55618E'];
    R(g, x, y, w, h, D[1]);
    for (let k = 0; k < w; k += 64) { R(g, x + k + 1, y + 13, 62, 30, D[2]); R(g, x + k + 1, y + 13, 62, 2, D[3]); R(g, x + k + 1, y + 47, 62, h - 50, D[1]); dither(g, x + k + 1, y + 43, 62, 4, D[2]); R(g, x + k, y + 11, 1, h, '#22D3EE'); }
    for (let k = 0; k < w; k += 32) R(g, x + k + 14, y + 26, 3, 3, (k / 32 + v) % 3 ? '#A78BFA' : '#F472B6');
    R(g, x, y + 46, w, 1, mix('#22D3EE', D[1], 0.4));
    lip('#55618E');
  } else if (z === 'boards') {
    // (a boardwalk: weathered planks across, nail heads, gaps between, sand under in the cracks)
    const B = ['#4A3420', '#644830', '#7E5E3E', '#9A7650', '#B89468'];
    R(g, x, y, w, h, B[0]);
    for (let k = 0; k < w; k += 18) {
      const c0 = B[1 + ((k / 18 + v) % 3)];
      R(g, x + k, y + 11, 16, h - 11, c0); R(g, x + k, y + 11, 16, 2, B[4]); R(g, x + k + 14, y + 11, 2, h - 11, B[0]);
      R(g, x + k + 3, y + 18, 2, 2, B[0]); R(g, x + k + 3, y + h - 14, 2, 2, B[0]);
      if (hash(k + v * 9) < 0.3) R(g, x + k + 6, y + 30 + hash(k) * 30, 1, 12, B[0]);
    }
    dither(g, x, y + h - 10, w, 4, B[0]);
    lip('#B89468');
  } else if (z === 'sea') {
    // (sea-green pool tiles, barnacled and crusted, a starfish stuck on)
    const T = ['#0B3340', '#124A58', '#1A6070', '#2C8090', '#5AAAB4'];
    R(g, x, y, w, h, T[0]);
    for (let yy = y + 12; yy < y + h; yy += 20) for (let k = ((yy - y) / 20 % 2) * 10; k < w; k += 20) { R(g, x + k + 1, yy + 1, 18, 18, T[2]); R(g, x + k + 1, yy + 1, 18, 2, T[3]); dither(g, x + k + 1, yy + 14, 18, 3, T[1]); }
    for (let k = 0; k < 24; k++) R(g, x + hash(k + v * 17) * w, y + 14 + hash(k + 3) * (h - 18), 3, 2, '#C8C0A8');
    if (v === 2) { const sx = x + 120, sy = y + 40; for (let a = 0; a < 5; a++) poly(g, [[sx, sy], [sx + Math.cos(a * 1.257) * 9, sy + Math.sin(a * 1.257) * 9], [sx + Math.cos(a * 1.257 + 0.4) * 3, sy + Math.sin(a * 1.257 + 0.4) * 3]], '#F97316'); }
    lip('#5AAAB4');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The tube rides' theming, up in the air and down in the drop (screen space, stamped strips)

const RIDE_W = 2600;
/** The Black Hole's inflatables (planets, a ringed one, a moon, a rocket balloon, a satellite) and the Abyss's (a
 *  whale, an anglerfish, its lure lit, jellyfish, an octopus, a sub), each on its tether down into the drop; varied
 *  in size and height along the strip. Dimmed: far off, nothing to land on. */
const RIDE_N = 9;
/** Where each one floats along the strip, how big, which. */
const rideObj = (ride: string, i: number) => ({
  x: Math.round(120 + i * (RIDE_W / RIDE_N) + hash(i + (ride === 'abyss' ? 50 : 0)) * 120), y: Math.round(60 + hash(i * 7 + 3) * 180),
  s: 0.7 + hash(i * 3 + 9) * 0.8, k: (i * 5 + (ride === 'abyss' ? 2 : 0)) % 6,
});
const TETHER = mix('#8A94A8', '#1A2040', 0.58);
/** Each one's reach about its middle, in its size (left, up, right, down: paintRide's shapes, their ink and strokes):
 *  its stamp's box cut to that (it was 150 by 110 of its size, mostly sky, every one of it put down every frame). */
const RIDE_BOX: Record<string, [number, number, number, number][]> = {
  blackHole: [[46, 26, 46, 26], [26, 26, 26, 26], [26, 26, 26, 26], [26, 26, 26, 26], [32, 12, 32, 12], [20, 32, 20, 32]],
  abyss: [[48, 22, 64, 22], [42, 42, 24, 24], [22, 16, 22, 34], [22, 16, 22, 34], [36, 36, 36, 16], [26, 26, 30, 40]],
};
const rideBox = (ride: string, q: { x: number; y: number; s: number; k: number }) => {
  const [l, u, r, d] = (RIDE_BOX[ride] ?? RIDE_BOX.blackHole)[q.k], P = 4;
  const x0 = Math.floor(q.x - l * q.s - P), y0 = Math.floor(q.y - u * q.s - P);
  return { x0, y0, w: Math.ceil(q.x + r * q.s + P) - x0, h: Math.ceil(q.y + d * q.s + P) - y0 };
};
/** One of them (stamped in its own small box: the strip's mostly sky). */
const paintRide = (g: Ctx, ride: string, i: number) => {
  const T = (col: string) => mix(col, '#1A2040', 0.58);
  {
    const { x, y, s, k } = rideObj(ride, i);
    if (ride !== 'abyss') {
      const cols = ['#F59E0B', '#6366F1', '#10B981', '#EC4899', '#38BDF8', '#F43F5E'], Rm = ramp5(T(cols[k]));
      if (k === 4) {
        // (a satellite: its panels, the dish)
        R(g, x - 30 * s, y - 6 * s, 22 * s, 12 * s, T('#1E3A8A')); R(g, x + 8 * s, y - 6 * s, 22 * s, 12 * s, T('#1E3A8A'));
        for (let j = 0; j < 4; j++) { R(g, x - 30 * s + j * 6 * s, y - 6 * s, 1, 12 * s, T('#60A5FA')); R(g, x + 8 * s + j * 6 * s, y - 6 * s, 1, 12 * s, T('#60A5FA')); }
        R(g, x - 8 * s, y - 10 * s, 16 * s, 20 * s, Rm[2]); R(g, x - 8 * s, y - 10 * s, 3, 20 * s, Rm[3]);
      } else if (k === 5) {
        // (a rocket balloon)
        ell(g, x, y, 10 * s, 30 * s, INK); ell(g, x, y, 9 * s, 29 * s, T('#E2E8F0')); ell(g, x, y - 22 * s, 6 * s, 8 * s, Rm[2]);
        for (const sd of [-1, 1]) poly(g, [[x + sd * 8 * s, y + 14 * s], [x + sd * 18 * s, y + 30 * s], [x + sd * 6 * s, y + 26 * s]], Rm[2]);
      } else {
        const r = 22 * s;
        disc(g, x, y, r + 1.5, INK); disc(g, x, y, r, Rm[1]); disc(g, x - r * 0.15, y - r * 0.15, r * 0.82, Rm[2]); disc(g, x - r * 0.35, y - r * 0.35, r * 0.42, Rm[3]); R(g, x - r * 0.5, y - r * 0.55, 3, 2, Rm[4]);
        if (k === 1 || k === 3) for (let j = -2; j <= 2; j++) R(g, x - r * 0.8, y + j * r * 0.28, r * 1.6, 2, j % 2 ? Rm[1] : Rm[3]);
        if (k === 0) { g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.ellipse(x, y, r * 1.9, r * 0.45, -0.25, 0, Math.PI * 2); g.stroke(); g.strokeStyle = Rm[4]; g.lineWidth = 3; g.stroke(); }
        if (k === 2) for (let j = 0; j < 4; j++) disc(g, x + (hash(j + i) - 0.5) * r, y + (hash(j + i + 4) - 0.5) * r, r * 0.12, Rm[0]);
      }
    } else {
      const cols = ['#3B82F6', '#F97316', '#E879F9', '#A855F7', '#FACC15', '#22D3EE'], Rm = ramp5(T(cols[k]));
      if (k === 0) {
        // (a whale)
        ell(g, x, y, 46 * s, 20 * s, INK); ell(g, x, y, 44 * s, 18 * s, Rm[2]); ell(g, x, y + 8 * s, 36 * s, 9 * s, Rm[4]);
        poly(g, [[x + 40 * s, y], [x + 62 * s, y - 16 * s], [x + 60 * s, y + 10 * s]], Rm[2]); disc(g, x - 30 * s, y - 4 * s, 2.5 * s, INK);
      } else if (k === 1) {
        // (an anglerfish, its lure lit: the one light out there)
        disc(g, x, y, 22 * s, INK); disc(g, x, y, 20 * s, Rm[1]); disc(g, x - 4 * s, y - 4 * s, 14 * s, Rm[2]);
        poly(g, [[x - 20 * s, y + 2 * s], [x - 2 * s, y + 6 * s], [x - 20 * s, y + 12 * s]], INK);
        for (let j = 0; j < 4; j++) poly(g, [[x - 18 * s + j * 4 * s, y + 4 * s], [x - 16 * s + j * 4 * s, y + 9 * s], [x - 14 * s + j * 4 * s, y + 4 * s]], '#F8FAFC');
        g.strokeStyle = Rm[0]; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 6 * s, y - 18 * s); g.quadraticCurveTo(x - 20 * s, y - 40 * s, x - 34 * s, y - 24 * s); g.stroke();
        disc(g, x - 34 * s, y - 24 * s, 6 * s, 'rgba(190, 242, 100, 0.25)'); disc(g, x - 34 * s, y - 24 * s, 3 * s, '#D9F99D');
      } else if (k === 2 || k === 3) {
        // (jellyfish)
        ell(g, x, y, 20 * s, 14 * s, INK, Math.PI, 0); ell(g, x, y, 18 * s, 12 * s, Rm[2], Math.PI, 0); ell(g, x - 4 * s, y - 5 * s, 9 * s, 5 * s, Rm[4], Math.PI, 0);
        for (let j = 0; j < 5; j++) for (let t = 0; t < 4; t++) R(g, x - 14 * s + j * 7 * s + Math.sin(t + j) * 2, y + t * 8 * s, 2, 7 * s, Rm[t % 2 ? 1 : 3]);
      } else if (k === 4) {
        // (a yellow sub)
        ell(g, x, y, 34 * s, 14 * s, INK); ell(g, x, y, 32 * s, 12 * s, Rm[2]); R(g, x - 6 * s, y - 24 * s, 14 * s, 12 * s, Rm[2]); R(g, x + 2 * s, y - 34 * s, 3, 10 * s, Rm[1]);
        for (let j = 0; j < 3; j++) { disc(g, x - 16 * s + j * 14 * s, y, 4 * s, INK); disc(g, x - 16 * s + j * 14 * s, y, 3 * s, T('#7DD3FC')); }
      } else {
        // (an octopus)
        disc(g, x, y - 6 * s, 18 * s, INK); disc(g, x, y - 6 * s, 16 * s, Rm[2]); disc(g, x - 5 * s, y - 11 * s, 7 * s, Rm[3]);
        for (let j = 0; j < 6; j++) { g.strokeStyle = Rm[1]; g.lineWidth = 4 * s; g.beginPath(); g.moveTo(x - 12 * s + j * 5 * s, y + 6 * s); g.quadraticCurveTo(x - 20 * s + j * 9 * s, y + 26 * s, x - 14 * s + j * 6 * s, y + 34 * s); g.stroke(); }
      }
    }
  }
};
/** Down in the drop: the Black Hole's stars and its swirl, the Abyss's glowing plankton and bubbles (a tile, wrapped). */
const DROP_W = 512, DROP_H = 300;
/** (a tile's specks: where, how big, which color) */
const SPECKS = Array.from({ length: 34 }, (_, i) => ({ x: Math.floor(hash(i + 7) * DROP_W), y: Math.floor(hash(i * 3 + 1) * DROP_H), big: hash(i + 99) < 0.2, alt: hash(i + 51) < 0.5 }));
// (opaque, mixed down into the drop's black already: no see-through fills in the frame)
const SPECK_COL: Record<string, [string, string]> = { abyss: ['#3E8C9A', '#5A8A7C'], blackHole: ['#A9ABB2', '#6E6690'] };
/** (screen space, behind the world) The ride's inflatables up in the sky: parallax 0.4 off the ride's own way along
 *  (`along`: the camera plus how far the loops have carried him back, so never the same twice round the loop). */
export const drawRideSky = (c: Ctx, ride: string, along: number, camY: number) => {
  const o = ((along * 0.4) % RIDE_W + RIDE_W) % RIDE_W, top = Math.round(40 - (camY + 400 - (GY - 700)) * 0.15);
  if (top >= H) return;
  for (const dx of [-o, RIDE_W - o]) {
    const x0 = Math.round(dx);
    for (let i = 0; i < RIDE_N; i++) {
      const q = rideObj(ride, i), b = rideBox(ride, q);
      const sx = x0 + q.x;
      if (x0 + b.x0 >= W || x0 + b.x0 + b.w <= 0) continue;
      // (its tether, live: one fill, on down into the drop)
      const ty = top + q.y + Math.round(20 * q.s);
      if (ty < H) R(c, sx, ty, 1, H - ty, TETHER);
      // (its box off the top or the bottom of the screen: nothing of it to put down, just the tether)
      if (top + b.y0 + b.h <= 0 || top + b.y0 >= H) continue;
      c.save(); c.translate(x0, top);
      stamp(c, `wp-ride-${ride}-${i}`, b.x0, b.y0, b.w, b.h, g => paintRide(g, ride, i));
      c.restore();
    }
  }
};
/** ...and its drop's specks, under the haze's solid line (`drop`: that line on screen and the drop's sides). */
export const drawRideDrop = (c: Ctx, ride: string, along: number, drop: { x0: number; x1: number; y: number }) => {
  if (drop.y + 30 >= H || drop.x1 <= drop.x0) return;
  // (live: a few dozen 1-2 px fills, cheaper than putting a tile of mostly nothing down over the drop)
  const d = ((along * 0.15) % DROP_W + DROP_W) % DROP_W, cols = SPECK_COL[ride] ?? SPECK_COL.blackHole;
  for (const alt of [false, true]) {
    c.fillStyle = cols[alt ? 1 : 0];
    for (let x = -d; x < W; x += DROP_W) for (let y = drop.y + 30; y < H; y += DROP_H) for (const q of SPECKS) {
      if (q.alt !== alt) continue;
      const sx = Math.round(x + q.x), sy = y + q.y;
      if (sx < drop.x0 || sx >= drop.x1 || sy >= H) continue;
      c.fillRect(sx, sy, q.big ? 2 : 1, q.big ? 2 : 1);
    }
  }
};
