// The clearing, painted (the final pass: peak SNES): the strip's own things (the orbit's backdrop is orbit.ts).
//
//   The path: packed dirt, its lit edge, ruts and pebbles, grass creeping in.
//   The junior guides' camp, back off the path (the wall tent, the pup tent, the dining fly, the flag, the clothesline,
//     the banner, the fire, the whistle board, the merit badges, the woodpile): dimmed back there.
//   The understory along the back of the path (ferns, elephant ears, heliconias, birds of paradise), dimmed, and the
//     park's fakery in it: the fog nozzle, the soundtrack's fiberglass boulder, the animatronic macaw, PA poles made
//     up as bamboo, speakers strapped up the trees, a fiberglass trunk's access door, the bushes' plastic bases.
//   The raised rock (a guide up on it): a boulder in its ramp, moss, its top lit (it's stood on).
//   The first-aid stop before the boss (the big health and ammo on a crate under its sign), the HUNTING AREA sign.
//   The trees going down like dominoes: real jungle trees (buttress roots, banded bark, a crown of leaves, vines);
//     down, they lie back off the path, dimmed (nothing to stand on); the last leans on the temple.
//   The temple's wing across the path: its stonework (the roof's, the dino park's), hit where the last tree struck it.
//   (Artie's hunting blind is tower.ts: stood out on the loop, coming round onto the strip.)
//   The fight: the bamboo fence behind him, the five bushes (lush, leaf on leaf, thinning as they're chewed down to
//     twigs), his vine (twisted, leafy, chewed thin where they've been at it).

import { INK, box, checker, mix, hash, pixelBlob, pole, ball, stamp, dim } from '../../intro/art/kit';
import { STONE, MOSS, PLY, SHELL, DARK, stoneWall, vineDown, plaque, glyph } from '../roof/stone';
import { crown } from '../roof/art';
import { GY } from '../geometry';
import { x0, TREE_H, TEMPLE_X, ARENA_L, PICKUP_X, BUSH_W, BUSH_H } from './arena';
import { signAt, plank, stencil, print } from '../letters';

type Ctx = CanvasRenderingContext2D;
const r1 = (a: number, b = 0) => hash(a * 12.9898 + b * 78.233);

export const DIRT = ['#4E3A24', '#6E5638', '#8A6E4B', '#A88A5E', '#C4A878'];
export const LEAF = ['#0F2E16', '#1A4A22', '#27662C', '#3A8434', '#5CA444', '#8CCB5A'];
const BARK = ['#2A1A0E', '#432A16', '#5E3E20', '#7A5430', '#966C40'];

// ---------------------------------------------------------------------------------------------------------------
// The path

export const drawPath = (c: Ctx, L: number, R: number) => {
  L = Math.floor(L / 4) * 4;
  box(c, L, GY, R - L, 400, DIRT[2]);
  // (the lit edge, dithered down into it; darker going down, in bands)
  box(c, L, GY, R - L, 2, DIRT[4]); box(c, L, GY + 2, R - L, 3, DIRT[3]); checker(c, L, GY + 5, R - L, 2, DIRT[3]);
  box(c, L, GY + 40, R - L, 360, DIRT[1]); checker(c, L, GY + 38, R - L, 2, DIRT[1]);
  // (ruts along it, pebbles, tufts of grass at its edge)
  for (let x = Math.floor(L / 46) * 46; x < R; x += 46) {
    const s = r1(x, 1);
    box(c, x + s * 20, GY + 14 + (s > 0.5 ? 8 : 0), 14 + s * 10, 2, DIRT[1]);
    box(c, x + s * 20, GY + 16 + (s > 0.5 ? 8 : 0), 14 + s * 10, 1, DIRT[3]);
    if (s > 0.3) { box(c, x + 30 * s, GY + 26, 4, 3, DIRT[0]); box(c, x + 30 * s, GY + 26, 3, 1, DIRT[4]); }
    if (s > 0.6) { for (let k = 0; k < 4; k++) box(c, x + 8 + k * 2, GY - 4 - (k % 2) * 3, 2, 5 + (k % 2) * 3, k % 2 ? LEAF[3] : LEAF[2]); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The junior guides' camp, back off the path

const CAMP = x0 + 260;
/** Canvas (the tents, the fly, the banner), darkest first. */
const CANVAS = ['#5E5230', '#7E7046', '#A09062', '#C0B07E', '#DCCE9E'];
/**
 * The camp, back off the path (dimmed: nothing back there's to stand on), painted once: the troop's flag on its pole,
 * the dining fly (a canvas tarp on poles over the mess table: tin plates and cups, the jug, the bugle), the clothesline
 * (khaki shirts and knee socks drying), the banner on its poles (canvas, grommets, its scalloped hem; the loudspeaker up
 * the left pole is live), the wall tent (its gable end: canvas in its steps, stitched seams, a patch, TROOP 9 over the
 * door, the valance, guy lines to their stakes, a spiked pith helmet on the ridge pole), the fire ring and its logs,
 * the whistle board, a pup tent, the merit badge board (KNOTS, WHISTLING, TAXIDERMY, AMBUSH), the woodpile and the axe
 * in its stump.
 */
export const drawCamp = (c: Ctx, f: number) => {
  stamp(c, 'clCamp2', CAMP - 210, GY - 230, 650, 234, g => {
    const d = (col: string) => dim(col);
    const C = CANVAS.map(d), W = BARK.map(d), ink = INK;
    // (the ground back there, going up to it: trodden dirt, grass at its edges, a few stones)
    box(g, CAMP - 210, GY - 18, 650, 18, d(DIRT[2])); box(g, CAMP - 210, GY - 20, 650, 2, d(DIRT[3])); checker(g, CAMP - 210, GY - 16, 650, 2, d(DIRT[3]));
    for (let x = CAMP - 206; x < CAMP + 436; x += 9) { const s = r1(x, 41); if (s > 0.55) { box(g, x, GY - 24, 2, 5, d(LEAF[2])); box(g, x + 2, GY - 26, 2, 7, d(LEAF[3])); } else if (s < 0.12) { box(g, x, GY - 12, 5, 3, d('#8A8278')); box(g, x, GY - 12, 4, 1, d('#B8B0A4')); } }
    // The flag pole: the troop's pennant (green, a yellow whistle on it), its halyard
    const fpx = CAMP - 186;
    pole(g, fpx, GY - 214, 5, 196, d('#B8BEC8'));
    ball(g, fpx + 2.5, GY - 216, 4, d('#E8B400'));
    g.fillStyle = ink; g.beginPath(); g.moveTo(fpx + 5, GY - 210); g.lineTo(fpx + 60, GY - 196); g.lineTo(fpx + 5, GY - 180); g.fill();
    g.fillStyle = d('#2E7A3A'); g.beginPath(); g.moveTo(fpx + 6, GY - 208); g.lineTo(fpx + 56, GY - 196); g.lineTo(fpx + 6, GY - 182); g.fill();
    g.fillStyle = d('#4A9A4A'); g.beginPath(); g.moveTo(fpx + 6, GY - 208); g.lineTo(fpx + 56, GY - 196); g.lineTo(fpx + 6, GY - 200); g.fill();
    box(g, fpx + 14, GY - 198, 9, 4, d('#E8C130')); box(g, fpx + 22, GY - 197, 3, 2, d('#E8C130')); box(g, fpx + 12, GY - 196, 2, 2, ink);
    g.strokeStyle = d('#E7E5E4'); g.lineWidth = 1; g.beginPath(); g.moveTo(fpx + 5, GY - 212); g.lineTo(fpx + 7, GY - 30); g.stroke();
    // The dining fly: the tarp, sagging between its poles; the mess table under it, what's on it
    const fx0 = CAMP - 160, fx1 = CAMP - 66;
    for (const px of [fx0, fx1]) pole(g, px - 2, GY - 92, 4, 74, d('#8B6A3E'));
    g.fillStyle = ink; g.beginPath(); g.moveTo(fx0 - 14, GY - 76); g.lineTo(fx0 + 2, GY - 96); g.quadraticCurveTo((fx0 + fx1) / 2, GY - 88, fx1 - 2, GY - 96); g.lineTo(fx1 + 14, GY - 76); g.closePath(); g.fill();
    g.fillStyle = C[3]; g.beginPath(); g.moveTo(fx0 - 12, GY - 77); g.lineTo(fx0 + 2, GY - 94); g.quadraticCurveTo((fx0 + fx1) / 2, GY - 86, fx1 - 2, GY - 94); g.lineTo(fx1 + 12, GY - 77); g.closePath(); g.fill();
    for (let k = fx0 - 10; k < fx1 + 12; k += 4) box(g, k, GY - 78, 2, 2 + ((k / 4) % 2) * 2, C[1]);
    for (let k = fx0 + 16; k < fx1 - 8; k += 22) box(g, k, GY - 92, 1, 12, C[2]);
    box(g, fx0 + 4, GY - 46, fx1 - fx0 - 8, 4, W[3]); box(g, fx0 + 4, GY - 46, fx1 - fx0 - 8, 1, W[4]);
    for (const lx of [fx0 + 8, fx1 - 12]) box(g, lx, GY - 42, 3, 24, W[2]);
    for (let k = 0; k < 4; k++) { box(g, fx0 + 12 + k * 18, GY - 49, 10, 3, d('#9CA3AF')); box(g, fx0 + 14 + k * 18, GY - 49, 6, 1, d('#E5E7EB')); }
    box(g, fx0 + 26, GY - 58, 6, 8, d('#6B7280')); box(g, fx0 + 27, GY - 57, 2, 6, d('#D1D5DB'));
    box(g, fx1 - 30, GY - 64, 12, 18, ink); box(g, fx1 - 29, GY - 63, 10, 16, d('#3A7AC8')); box(g, fx1 - 29, GY - 63, 10, 3, d('#E5E7EB'));
    // (the bugle, on the table)
    box(g, fx0 + 44, GY - 52, 14, 2, d('#E8B400')); g.fillStyle = d('#E8B400'); g.beginPath(); g.moveTo(fx0 + 58, GY - 51); g.lineTo(fx0 + 66, GY - 56); g.lineTo(fx0 + 66, GY - 46); g.fill();
    // The clothesline, flag pole to banner pole: khaki shirts, shorts, knee socks drying
    g.strokeStyle = d('#E7E5E4'); g.lineWidth = 1; g.beginPath(); g.moveTo(fpx + 5, GY - 120); g.quadraticCurveTo(CAMP - 120, GY - 104, CAMP - 18, GY - 116); g.stroke();
    const lineY = (x: number) => { const t = (x - fpx - 5) / (CAMP - 23 - fpx); return GY - 120 + 4 * t + 16 * 4 * t * (1 - t) * 0.5; };
    for (const [hx, kind] of [[CAMP - 166, 0], [CAMP - 140, 2], [CAMP - 118, 1], [CAMP - 92, 2], [CAMP - 70, 0], [CAMP - 44, 2]] as const) {
      const hy = lineY(hx);
      if (kind === 0) { box(g, hx - 9, hy, 18, 18, ink); box(g, hx - 8, hy + 1, 16, 16, d('#BCA670')); box(g, hx - 13, hy + 1, 6, 7, d('#BCA670')); box(g, hx + 7, hy + 1, 6, 7, d('#A8945E')); box(g, hx - 6, hy + 5, 4, 4, d('#A8945E')); box(g, hx - 1, hy + 1, 1, 16, d('#8A7A4A')); }
      else if (kind === 1) { box(g, hx - 8, hy, 16, 14, ink); box(g, hx - 7, hy + 1, 14, 12, d('#9C8656')); box(g, hx - 1, hy + 6, 1, 7, ink); }
      else { box(g, hx - 2, hy, 4, 16, ink); box(g, hx - 1, hy + 1, 3, 14, d('#7A7048')); box(g, hx - 1, hy + 1, 3, 2, d('#C8282A')); box(g, hx - 1, hy + 13, 5, 3, d('#7A7048')); }
      box(g, hx - 1, hy - 2, 2, 3, d('#C8A060'));
    }
    // The banner on its poles: canvas, grommets roped to the poles, a scalloped hem; its words in the troop's stencil
    for (const px of [CAMP - 20, CAMP + 300]) pole(g, px, GY - 176, 6, 160, d('#8B6A3E'));
    for (const px of [CAMP - 20, CAMP + 300]) ball(g, px + 3, GY - 178, 4, d('#8B6A3E'));
    const bx0 = CAMP + 30, bx1 = CAMP + 256;
    g.strokeStyle = d('#5A3E1E'); g.lineWidth = 2; g.beginPath(); g.moveTo(CAMP - 14, GY - 168); g.lineTo(bx0, GY - 164); g.moveTo(bx1, GY - 164); g.lineTo(CAMP + 300, GY - 168); g.stroke();
    box(g, bx0 - 1, GY - 166, bx1 - bx0 + 2, 32, ink); box(g, bx0, GY - 165, bx1 - bx0, 30, C[3]); box(g, bx0, GY - 165, bx1 - bx0, 2, C[4]); box(g, bx0, GY - 139, bx1 - bx0, 4, C[2]);
    for (let k = bx0; k < bx1; k += 12) { g.fillStyle = C[3]; g.beginPath(); g.ellipse(k + 6, GY - 135, 6, 4, 0, 0, Math.PI); g.fill(); g.strokeStyle = ink; g.lineWidth = 1; g.beginPath(); g.ellipse(k + 6, GY - 135, 6, 4, 0, 0, Math.PI); g.stroke(); }
    for (const gx of [bx0 + 3, bx1 - 7]) { box(g, gx, GY - 163, 4, 4, d('#9CA3AF')); box(g, gx + 1, GY - 162, 2, 2, ink); }
    signAt(g, 'JUNIOR GUIDE CAMP', (bx0 + bx1) / 2, GY - 145, 12, stencil(12, d('#2E5A2A')));
    box(g, bx0 + 8, GY - 160, 10, 10, d('#2E5A2A')); box(g, bx0 + 10, GY - 157, 6, 3, d('#E8C130')); box(g, bx1 - 18, GY - 160, 10, 10, d('#2E5A2A')); box(g, bx1 - 16, GY - 157, 6, 3, d('#E8C130'));
    // The wall tent: its gable end toward us, in its steps; the door (live: the flap, drawTentFlap); guy lines
    const tx = CAMP + 40, ty = GY - 19, eave = GY - 54, ridge = GY - 98, mx = tx + 50;
    g.strokeStyle = d('#C8B890'); g.lineWidth = 1; g.beginPath();
    for (const [ax, sx] of [[tx, tx - 30], [tx + 100, tx + 130]] as const) { g.moveTo(ax, eave + 2); g.lineTo(sx, ty); }
    g.moveTo(mx, ridge); g.lineTo(tx - 34, ty - 2); g.moveTo(mx, ridge); g.lineTo(tx + 134, ty - 2); g.stroke();
    for (const sx of [tx - 32, tx + 128, tx - 36, tx + 132]) box(g, sx, ty - 3, 3, 5, W[3]);
    const gable = (col: string, o: number) => { g.fillStyle = col; g.beginPath(); g.moveTo(tx - o, ty + o); g.lineTo(tx - o, eave - o * 0.5); g.lineTo(mx, ridge - o); g.lineTo(tx + 100 + o, eave - o * 0.5); g.lineTo(tx + 100 + o, ty + o); g.closePath(); g.fill(); };
    gable(ink, 2); gable(C[2], 0);
    g.save(); gable('rgba(0,0,0,0)', 0); g.clip();
    box(g, tx, ridge, 28, 90, C[3]); box(g, tx, ridge, 8, 90, C[4]); checker(g, tx + 28, ridge, 2, 90, C[3]);
    box(g, tx + 70, ridge, 30, 90, C[1]); checker(g, tx + 68, ridge, 2, 90, C[1]); box(g, tx + 92, ridge, 8, 90, C[0]);
    // (the seams, stitched; a patch on it; TROOP 9 stenciled over the door)
    for (const sx of [tx + 25, tx + 75]) { box(g, sx, ridge, 1, 90, C[1]); for (let y = eave - 20; y < ty; y += 4) box(g, sx + 2, y, 1, 2, C[4]); }
    box(g, tx + 12, eave + 14, 12, 10, d('#9A8A5A')); for (let k = 0; k < 12; k += 3) { box(g, tx + 12 + k, eave + 13, 1, 1, ink); box(g, tx + 12 + k, eave + 24, 1, 1, ink); }
    signAt(g, 'TROOP 9', mx, eave - 6, 5, stencil(5, d('#3E3A20')));
    g.restore();
    // (the valance along the eaves, the ridge pole's end; the door's dark, laced edges; the helmet on the pole, spikes up)
    for (const s of [-1, 1]) { const ex = s < 0 ? tx : tx + 100; g.strokeStyle = C[0]; g.lineWidth = 2; g.beginPath(); g.moveTo(ex, eave); g.lineTo(mx, ridge); g.stroke(); }
    g.fillStyle = d('#1A1408'); g.beginPath(); g.moveTo(mx - 12, ty); g.lineTo(mx, GY - 76); g.lineTo(mx + 12, ty); g.fill();
    for (let k = 0; k < 6; k++) { const yy = ty - 6 - k * 9, w2 = 12 - k * 2; box(g, mx - w2 - 1, yy, 2, 1, C[0]); box(g, mx + w2, yy, 2, 1, C[0]); }
    box(g, mx - 1, ridge - 10, 3, 10, W[2]);
    box(g, mx - 7, ridge - 16, 15, 6, d('#E2D4A8')); box(g, mx - 9, ridge - 11, 19, 2, d('#C8B890')); box(g, mx - 7, ridge - 14, 15, 2, d('#6A4A22'));
    for (const sx of [-5, 0, 5]) { box(g, mx + sx, ridge - 23, 2, 7, d('#CBD5E1')); box(g, mx + sx, ridge - 23, 1, 4, d('#F8FAFC')); }
    // The fire ring's logs to sit on
    for (const lx of [CAMP + 118, CAMP + 176]) { box(g, lx - 1, GY - 31, 28, 12, ink); box(g, lx, GY - 30, 26, 10, W[2]); box(g, lx, GY - 30, 26, 2, W[4]); box(g, lx + 22, GY - 30, 4, 10, W[3]); box(g, lx + 23, GY - 28, 2, 6, W[1]); for (let k = lx + 4; k < lx + 20; k += 6) box(g, k, GY - 26, 3, 1, W[1]); }
    // The pup tent, behind the board
    const ptx = CAMP + 232;
    g.fillStyle = ink; g.beginPath(); g.moveTo(ptx - 2, ty + 1); g.lineTo(ptx + 30, GY - 62); g.lineTo(ptx + 62, ty + 1); g.fill();
    g.fillStyle = C[2]; g.beginPath(); g.moveTo(ptx, ty); g.lineTo(ptx + 30, GY - 59); g.lineTo(ptx + 60, ty); g.fill();
    g.fillStyle = C[3]; g.beginPath(); g.moveTo(ptx, ty); g.lineTo(ptx + 30, GY - 59); g.lineTo(ptx + 20, ty); g.fill();
    g.fillStyle = d('#1A1408'); g.beginPath(); g.moveTo(ptx + 24, ty); g.lineTo(ptx + 30, GY - 44); g.lineTo(ptx + 37, ty); g.fill();
    box(g, ptx + 36, ty - 4, 10, 4, d('#4A5A2A')); box(g, ptx + 36, ty - 4, 10, 1, d('#6E7E44'));
    // The whistle board: their rules, chalked
    const wb = CAMP + 200;
    pole(g, wb - 30, GY - 70, 4, 52, d('#8B6A3E')); pole(g, wb + 26, GY - 70, 4, 52, d('#8B6A3E'));
    box(g, wb - 37, GY - 93, 74, 46, ink); box(g, wb - 35, GY - 91, 70, 42, W[3]); box(g, wb - 33, GY - 89, 66, 38, d('#2F3A2E'));
    checker(g, wb - 33, GY - 89, 66, 2, d('#3E4A3C'));
    for (const [i, t] of ['1. SALUTE', '2. WHISTLE', '3. STAB'].entries()) signAt(g, t, wb - 30, GY - 77 + i * 11, 5, plank(5, d('#E5E7EB'), undefined, undefined, i), 'left');
    box(g, wb - 20, GY - 50, 12, 3, d('#F4F4F0'));
    // The merit badge board, on its post past the banner: the badges, what for
    const mb = CAMP + 350;
    pole(g, mb - 2, GY - 96, 5, 78, d('#8B6A3E'));
    box(g, mb - 41, GY - 130, 84, 52, ink); box(g, mb - 40, GY - 129, 82, 50, d('#8A5A2E')); box(g, mb - 40, GY - 129, 82, 2, d('#B07A44'));
    box(g, mb - 36, GY - 122, 74, 40, d('#C8A878'));
    signAt(g, 'MERIT BADGES', mb + 1, GY - 115, 4, print(4, d('#3A2410')));
    for (const [i, t] of ['KNOTS', 'WHISTLING', 'TAXIDERMY', 'AMBUSH'].entries()) {
      const by = GY - 108 + i * 7;
      box(g, mb - 33, by - 4, 6, 6, ink); box(g, mb - 32, by - 3, 4, 4, d(['#DC2626', '#2563EB', '#F59E0B', '#7C3AED'][i])); box(g, mb - 32, by - 3, 1, 1, '#FFFFFF');
      signAt(g, t, mb - 24, by + 2, 4, print(4, d('#3A2410')), 'left');
    }
    // The woodpile, the axe in its stump
    const wp = CAMP + 404;
    for (let r = 0; r < 3; r++) for (let k = 0; k < 4 - r; k++) { const lx = wp - 24 + k * 13 + r * 6, ly = ty - 10 - r * 9; ball(g, lx, ly, 5, W[3]); box(g, lx - 2, ly - 2, 3, 3, W[4]); box(g, lx, ly, 1, 1, W[1]); }
    box(g, wp + 26, ty - 14, 18, 14, ink); box(g, wp + 27, ty - 13, 16, 13, W[2]); box(g, wp + 27, ty - 13, 16, 3, d('#C8A070')); box(g, wp + 29, ty - 12, 12, 1, d('#9A7A4A'));
    box(g, wp + 34, ty - 30, 3, 18, d('#A07A4A')); box(g, wp + 30, ty - 16, 9, 5, d('#9CA3AF')); box(g, wp + 30, ty - 16, 9, 1, d('#E5E7EB'));
  });
  // The campfire (live: it flickers; its light's a lamp)
  const fx = CAMP + 160, fy = GY - 22, fl = Math.floor(f / 4) % 3;
  // (the ring of stones, inked, lit along their tops; the charred logs crossed in it; a coffee pot on a stone)
  for (let k = -3; k <= 3; k++) { const sx = fx + k * 6 - 3, sh = 4 + (k & 1); box(c, sx - 1, fy - sh - 1, 7, sh + 2, INK); box(c, sx, fy - sh, 5, sh, dim(k % 2 ? '#78716C' : '#8F877D')); box(c, sx, fy - sh, 5, 1, dim('#C8C0B4')); }
  box(c, fx - 10, fy - 6, 20, 3, dim('#2A1A0E')); box(c, fx - 8, fy - 7, 4, 1, dim('#E8641A'));
  box(c, fx + 21, fy - 15, 8, 9, INK); box(c, fx + 22, fy - 14, 6, 8, dim('#4A5A6A')); box(c, fx + 22, fy - 14, 2, 8, dim('#8A9AAA')); box(c, fx + 28, fy - 12, 3, 2, dim('#4A5A6A'));
  for (const [col, w, h] of [['#B91C1C', 10, 20], ['#F97316', 7, 15], ['#FDE047', 4, 8]] as const) {
    const hh = h + (fl === 1 ? 3 : 0);
    c.fillStyle = col; c.beginPath(); c.moveTo(fx - w, fy); c.quadraticCurveTo(fx - w * 0.5, fy - hh * 0.6, fx + (fl - 1) * 2, fy - hh); c.quadraticCurveTo(fx + w * 0.5, fy - hh * 0.6, fx + w, fy); c.fill();
  }
  // (sparks)
  for (let i = 0; i < 3; i++) { const t = (f + i * 23) % 60; box(c, fx + Math.sin(t * 0.2 + i) * 6, fy - 20 - t * 0.8, 2, 2, t < 30 ? '#FDE047' : '#F97316'); }
};
export const CAMPFIRE = { x: CAMP + 160, y: GY - 40 };
/** The tent's flap thrown back as a junior guide comes out (k: frames of it left): the dark of the tent opening wide,
 *  the flap swung aside. */
export const drawTentFlap = (c: Ctx, k: number) => {
  if (k <= 0) return;
  const tx = CAMP + 40, open = Math.min(1, k / 12);
  const d = (col: string) => dim(col);
  c.fillStyle = d('#1A1408'); c.beginPath(); c.moveTo(tx + 50 - 22 * open, GY - 19); c.lineTo(tx + 50, GY - 78); c.lineTo(tx + 50 + 22 * open, GY - 19); c.fill();
  // (the flap thrown back: canvas, its lit fold, the ink round it)
  c.fillStyle = INK; c.beginPath(); c.moveTo(tx + 50, GY - 80); c.lineTo(tx + 50 - 24 * open, GY - 18); c.lineTo(tx + 50 - 37 * open, GY - 23); c.fill();
  c.fillStyle = d(CANVAS[3]); c.beginPath(); c.moveTo(tx + 50, GY - 78); c.lineTo(tx + 50 - 22 * open, GY - 19); c.lineTo(tx + 50 - 34 * open, GY - 24); c.fill();
  c.fillStyle = d(CANVAS[4]); c.beginPath(); c.moveTo(tx + 50, GY - 78); c.lineTo(tx + 50 - 8 * open, GY - 40); c.lineTo(tx + 50 - 14 * open, GY - 42); c.fill();
};
/** The camp's loudspeaker, up the banner's left pole (Artie's voice, sending them): where it is, where its words go. */
export const SPEAKER = { x: CAMP - 14, y: GY - 184 };
/** The loudspeaker: a gray horn on a bracket, turned out over the camp; it shakes a little while it's talking. */
export const drawSpeaker = (c: Ctx, talking: boolean, f: number) => {
  const x = SPEAKER.x, y = SPEAKER.y + (talking && (f >> 1) % 2 ? 1 : 0);
  const d = (col: string) => dim(col);
  box(c, x - 6, y + 2, 10, 3, INK); box(c, x - 5, y + 3, 8, 1, d('#6B7280'));
  // (the horn: narrow at the bracket, flaring out, its bell's mouth dark)
  c.fillStyle = INK; c.beginPath(); c.moveTo(x, y - 3); c.lineTo(x + 22, y - 11); c.lineTo(x + 22, y + 11); c.lineTo(x, y + 3); c.fill();
  c.fillStyle = d('#9CA3AF'); c.beginPath(); c.moveTo(x + 1, y - 2); c.lineTo(x + 20, y - 9); c.lineTo(x + 20, y + 9); c.lineTo(x + 1, y + 2); c.fill();
  c.fillStyle = d('#D1D5DB'); c.beginPath(); c.moveTo(x + 1, y - 2); c.lineTo(x + 20, y - 9); c.lineTo(x + 20, y - 6); c.lineTo(x + 1, y); c.fill();
  box(c, x + 19, y - 10, 4, 20, INK); box(c, x + 20, y - 8, 2, 16, d('#374151'));
  // (the sound off it, in steps)
  if (talking) for (let k = 0; k < 3; k++) { const r = 6 + k * 6 + ((f >> 2) % 3) * 2; c.strokeStyle = `rgba(253, 230, 138, ${0.5 - k * 0.15})`; c.lineWidth = 2; c.beginPath(); c.arc(x + 22, y, r, -0.7, 0.7); c.stroke(); }
};

// ---------------------------------------------------------------------------------------------------------------
// The understory along the back of the path (dimmed: back off it, not to stand on), and the park's fakery in it

/** One of the understory's plants, its foot at (x, y): a fern, an elephant ear, a heliconia, a bird of paradise, a tuft. */
const plant = (g: Ctx, x: number, y: number, kind: number, s: number) => {
  const L = LEAF.map(dim), ink = dim(INK);
  if (kind === 0) {
    // (a fern: fronds arching out, leaflets down each, lit on the upper ones)
    for (const [dx, h, lean] of [[-1, 30, -1], [1, 34, 1], [0, 40, -0.3], [-1, 22, -1.6], [1, 24, 1.6]] as const) {
      const ex = x + lean * 18 * s, ey = y - h * s;
      for (let t = 0; t <= 1; t += 0.08) {
        const px = x + dx + (ex - x) * t + lean * 6 * t * t * s, py = y + (ey - y) * t + 10 * t * t * s;
        box(g, px - 1, py - 1, 2, 2, L[1]);
        const leaf = (1 - t) * 6 * s + 1;
        box(g, px - leaf, py, leaf, 1, t < 0.6 ? L[3] : L[2]); box(g, px, py, leaf, 1, L[2]);
      }
    }
  } else if (kind === 1) {
    // (an elephant ear: a big heart of a leaf on its stem, the midrib, lit down its left)
    const lx = x + 6 * s, ly = y - 34 * s;
    g.strokeStyle = L[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 2, y - 20 * s, lx, ly + 8 * s); g.stroke();
    g.fillStyle = ink; g.beginPath(); g.ellipse(lx, ly, 13 * s + 1, 17 * s + 1, 0.3, 0, Math.PI * 2); g.fill();
    g.fillStyle = L[2]; g.beginPath(); g.ellipse(lx, ly, 13 * s, 17 * s, 0.3, 0, Math.PI * 2); g.fill();
    g.fillStyle = L[3]; g.beginPath(); g.ellipse(lx - 4 * s, ly - 3 * s, 7 * s, 12 * s, 0.3, 0, Math.PI * 2); g.fill();
    g.strokeStyle = L[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(lx + 4 * s, ly + 14 * s); g.lineTo(lx - 4 * s, ly - 14 * s); g.stroke();
    for (let k = -2; k <= 2; k++) box(g, lx - 2 + k * 2, ly + k * 5 * s, 6 * s, 1, L[1]);
  } else if (kind === 2) {
    // (a heliconia: the stalk, its red bracts down it alternating, tipped yellow; a leaf behind)
    g.fillStyle = L[1]; g.beginPath(); g.ellipse(x - 6, y - 26 * s, 5, 18 * s, -0.3, 0, Math.PI * 2); g.fill();
    box(g, x, y - 46 * s, 2, 46 * s, L[1]);
    for (let k = 0; k < 5; k++) { const by = y - 44 * s + k * 7 * s, sd = k % 2 ? 1 : -1; g.fillStyle = ink; g.beginPath(); g.moveTo(x + 1, by - 1); g.lineTo(x + 1 + sd * 9 * s, by - 4); g.lineTo(x + 1, by + 5); g.fill(); g.fillStyle = dim('#D8282A'); g.beginPath(); g.moveTo(x + 1, by); g.lineTo(x + 1 + sd * 8 * s, by - 3); g.lineTo(x + 1, by + 4); g.fill(); box(g, x + sd * 6 * s, by - 3, 2, 1, dim('#F2C21E')); }
  } else if (kind === 3) {
    // (a bird of paradise: blade leaves, the flower's orange crest and blue tongue on its beak)
    for (const [dx, h] of [[-5, 26], [3, 30], [8, 20]] as const) { box(g, x + dx, y - h * s, 3, h * s, L[2]); box(g, x + dx, y - h * s, 1, h * s, L[3]); }
    const fy = y - 30 * s;
    box(g, x - 2, fy, 12, 3, L[1]); box(g, x + 9, fy - 1, 3, 2, L[1]);
    for (let k = 0; k < 3; k++) box(g, x + k * 3, fy - 6 - k, 2, 6 + k, dim('#F27A1E'));
    box(g, x + 8, fy - 3, 2, 3, dim('#3A5AC8'));
  } else {
    // (a tuft of grass, a flower or two in it)
    for (let k = 0; k < 6; k++) box(g, x - 6 + k * 2.5, y - (8 + ((k * 5) % 7)) * s, 2, (8 + ((k * 5) % 7)) * s, k % 2 ? L[2] : L[3]);
    if (s > 0.9) { box(g, x - 3, y - 14 * s, 3, 3, dim('#F4F0E8')); box(g, x - 2, y - 13 * s, 1, 1, dim('#F2C21E')); }
  }
};
/** The understory from L to R, along the back of the path: painted in chunks, once each. */
export const drawUnderstory = (c: Ctx, L: number, R: number) => {
  const CH = 400;
  for (let cx = Math.floor(L / CH) * CH; cx < R; cx += CH) {
    stamp(c, `clUnder:${cx}`, cx, GY - 74, CH, 72, g => {
      g.save(); g.beginPath(); g.rect(cx, GY - 74, CH, 72); g.clip();
      // (the shade along its foot first, then the plants: big ones further back (higher), small ones in front)
      box(g, cx, GY - 10, CH, 8, dim(LEAF[0])); checker(g, cx, GY - 12, CH, 2, dim(LEAF[0]));
      for (const row of [0, 1]) for (let x = cx - 60 + row * 11; x < cx + CH + 60; x += 23) {
        const h = r1(x, 19 + row), kind = Math.floor(r1(x, 7 + row) * 5);
        if (row === 0 && h < 0.25) continue;
        plant(g, x + Math.round(h * 9), GY - 4 - (row ? 0 : 4), row ? (kind === 1 ? 4 : kind) : kind, row ? 0.7 + h * 0.3 : 0.95 + h * 0.4);
      }
      g.restore();
    });
  }
};

/** A fiberglass boulder with the jungle's soundtrack in it: the seam, an access panel on a hinge, the speaker grille,
 *  its label; the status light blinking. */
export const drawSpeakerRock = (c: Ctx, x: number, f: number) => {
  stamp(c, 'clFakeRock', x - 50, GY - 64, 104, 64, g => {
    const R = ['#3E3A36', '#57524C', '#736C64', '#8F877D', '#ACA398'].map(dim);
    g.fillStyle = INK; g.beginPath(); g.moveTo(x - 46, GY - 2); g.quadraticCurveTo(x - 48, GY - 44, x - 12, GY - 58); g.quadraticCurveTo(x + 30, GY - 62, x + 48, GY - 30); g.lineTo(x + 50, GY - 2); g.closePath(); g.fill();
    g.fillStyle = R[2]; g.beginPath(); g.moveTo(x - 44, GY - 3); g.quadraticCurveTo(x - 46, GY - 43, x - 12, GY - 56); g.quadraticCurveTo(x + 28, GY - 60, x + 46, GY - 30); g.lineTo(x + 48, GY - 3); g.closePath(); g.fill();
    g.save(); g.clip();
    box(g, x - 50, GY - 64, 30, 64, R[3]); box(g, x - 50, GY - 64, 10, 64, R[4]); checker(g, x - 20, GY - 64, 2, 64, R[3]);
    box(g, x + 22, GY - 64, 30, 64, R[1]); checker(g, x + 20, GY - 64, 2, 64, R[1]);
    g.restore();
    // (the seam where the halves are bolted: the bolts; the panel, its hinge and hasp; the grille)
    box(g, x + 6, GY - 58, 1, 56, R[0]); for (let y = GY - 50; y < GY - 6; y += 12) box(g, x + 4, y, 2, 2, R[0]);
    box(g, x - 34, GY - 40, 30, 26, R[0]); box(g, x - 33, GY - 39, 28, 24, R[2]); box(g, x - 33, GY - 39, 28, 1, R[4]);
    for (let gy2 = GY - 36; gy2 < GY - 18; gy2 += 3) for (let gx = x - 30 + ((gy2 / 3) % 2); gx < x - 8; gx += 3) box(g, gx, gy2, 1, 1, R[0]);
    box(g, x - 35, GY - 36, 2, 6, dim('#9CA3AF')); box(g, x - 35, GY - 24, 2, 6, dim('#9CA3AF'));
    box(g, x + 9, GY - 32, 38, 11, INK); box(g, x + 10, GY - 31, 36, 9, dim('#F4F0E4')); signAt(g, 'LOOP 3', x + 28, GY - 23, 4, print(4, dim('#2A2A30')));
    box(g, x + 14, GY - 16, 6, 4, dim('#E8C030'));
  });
  if (Math.floor(f / 30) % 2) { box(c, x + 30, GY - 16, 3, 3, INK); box(c, x + 31, GY - 15, 1, 1, '#4ADE80'); }
};

/** The animatronic macaw on its perch (bolted to a pole, its cable down it): red, blue and yellow, its head turning
 *  this way and that, a wing lifting now and then. */
export const drawParrot = (c: Ctx, x: number, f: number) => {
  const d = (col: string) => dim(col);
  stamp(c, 'clPerch', x - 20, GY - 110, 40, 110, g => {
    pole(g, x - 2, GY - 96, 5, 94, d('#7A5A34'));
    box(g, x - 16, GY - 98, 32, 4, INK); box(g, x - 15, GY - 97, 30, 2, d('#9A7448'));
    g.strokeStyle = d('#1A1A1A'); g.lineWidth = 1; g.beginPath(); g.moveTo(x + 3, GY - 94); g.lineTo(x + 4, GY - 4); g.stroke();
    box(g, x + 1, GY - 60, 6, 8, d('#3A3A42'));
  });
  const turn = Math.floor(f / 50) % 3, flap = f % 140 < 12 && Math.floor(f / 6) % 2;
  const bx = x, by = GY - 100;
  // (the body: red, the wing blue-yellow-green; the tail down past the perch)
  box(c, bx - 3, by + 2, 6, 22, INK); box(c, bx - 2, by + 3, 4, 20, d('#2563EB')); box(c, bx - 2, by + 12, 4, 10, d('#D8282A'));
  box(c, bx - 7, by - 16, 14, 20, INK); box(c, bx - 6, by - 15, 12, 18, d('#D8282A')); box(c, bx - 6, by - 15, 4, 18, d('#F05A4A'));
  if (flap) { box(c, bx + 4, by - 22, 12, 14, INK); box(c, bx + 5, by - 21, 10, 5, d('#E8B400')); box(c, bx + 5, by - 16, 10, 7, d('#2563EB')); }
  else { box(c, bx + 1, by - 10, 7, 14, INK); box(c, bx + 2, by - 9, 5, 4, d('#E8B400')); box(c, bx + 2, by - 5, 5, 4, d('#16A34A')); box(c, bx + 2, by - 1, 5, 4, d('#2563EB')); }
  // (the head, turned: the white face patch, the hooked beak, the eye)
  const hx = bx + (turn - 1) * 2;
  box(c, hx - 6, by - 26, 12, 11, INK); box(c, hx - 5, by - 25, 10, 9, d('#D8282A'));
  const fwd = turn === 0 ? -1 : 1;
  box(c, hx + fwd * 1 - 2, by - 23, 4, 4, d('#F4F0E8')); box(c, hx + fwd * 1 - 1, by - 22, 1, 1, INK);
  box(c, hx + fwd * 5 - (fwd < 0 ? 4 : 0), by - 23, 5, 5, INK); box(c, hx + fwd * 5 - (fwd < 0 ? 3 : -1), by - 22, 3, 3, d('#E8E0C8'));
  // (its feet on the perch)
  box(c, bx - 4, by + 1, 3, 2, d('#3A3A42')); box(c, bx + 1, by + 1, 3, 2, d('#3A3A42'));
};

/** The fog nozzle hid in the ferns: the jungle's mist, every so often, in dithered puffs. */
export const drawFogger = (c: Ctx, x: number, f: number) => {
  box(c, x - 3, GY - 12, 6, 8, INK); box(c, x - 2, GY - 11, 4, 7, dim('#4A4A52')); box(c, x - 2, GY - 11, 4, 1, dim('#9CA3AF'));
  const t = f % 360;
  if (t > 60) return;
  for (let i = 0; i < 7; i++) {
    const u = (t + i * 9) / 70, px = x + Math.sin(i * 2.1) * 10 * u + i * 3 * u, py = GY - 14 - u * 46, r = 4 + u * 12;
    c.globalAlpha = u < 0.5 ? 0.45 : 0.25;
    pixelBlob(c, px, py, r, r * 0.7, i % 2 ? '#E2E8EE' : '#C8D2DA');
  }
  c.globalAlpha = 1;
};

/** A PA pole made up as a bamboo stalk (green, its nodes, a leaf or two glued on), the park's horn speakers up it, the
 *  junction box, the cable. Up it: Artie's whistle, his set. */
export const drawSpeakerPole = (c: Ctx, x: number, h: number) => {
  stamp(c, `clPA:${x}:${h}`, x - 40, GY - h - 30, 80, h + 30, g => {
    const B = ['#2E4A1E', '#466A2A', '#5E8A36', '#7EA84A'].map(dim);
    box(g, x - 5, GY - h, 10, h, INK); box(g, x - 4, GY - h, 8, h, B[2]); box(g, x - 4, GY - h, 2, h, B[3]); box(g, x + 2, GY - h, 2, h, B[1]);
    for (let y = GY - h + 18; y < GY - 4; y += 26) { box(g, x - 5, y, 10, 3, B[0]); box(g, x - 4, y, 8, 1, B[3]); }
    // (a leaf glued on: a seam of glue shows)
    g.fillStyle = B[2]; g.beginPath(); g.ellipse(x + 12, GY - h + 50, 12, 4, 0.5, 0, Math.PI * 2); g.fill(); box(g, x + 3, GY - h + 46, 3, 2, dim('#E8E4D8'));
    // (two horns, out either way, on their brackets)
    for (const s of [-1, 1]) {
      const sy = GY - h + 8;
      box(g, x + s * 4 - (s < 0 ? 4 : 0), sy + 2, 4, 3, dim('#3A3A42'));
      g.fillStyle = INK; g.beginPath(); g.moveTo(x + s * 6, sy - 2); g.lineTo(x + s * 26, sy - 10); g.lineTo(x + s * 26, sy + 14); g.lineTo(x + s * 6, sy + 6); g.fill();
      g.fillStyle = dim('#8A929C'); g.beginPath(); g.moveTo(x + s * 7, sy - 1); g.lineTo(x + s * 24, sy - 8); g.lineTo(x + s * 24, sy + 12); g.lineTo(x + s * 7, sy + 5); g.fill();
      g.fillStyle = dim('#C4CAD2'); g.beginPath(); g.moveTo(x + s * 7, sy - 1); g.lineTo(x + s * 24, sy - 8); g.lineTo(x + s * 24, sy - 4); g.lineTo(x + s * 7, sy + 1); g.fill();
      box(g, x + s * 24 - (s < 0 ? 3 : 0), sy - 9, 3, 24, INK);
    }
    box(g, x - 7, GY - 70, 14, 16, INK); box(g, x - 6, GY - 69, 12, 14, dim('#5A6470')); box(g, x - 6, GY - 69, 12, 2, dim('#8A949E')); box(g, x - 2, GY - 64, 4, 3, dim('#E8C030'));
    g.strokeStyle = dim('#1A1A1A'); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + 5, GY - h + 12); g.quadraticCurveTo(x + 8, GY - 90, x + 5, GY - 70); g.moveTo(x, GY - 54); g.quadraticCurveTo(x + 10, GY - 20, x + 18, GY - 4); g.stroke();
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The rock, the signs, the first-aid stop

export const drawRock = (c: Ctx, x: number, w: number, h: number) => {
  stamp(c, `clRock:${x}`, x - 8, GY - h - 14, w + 16, h + 16, g => {
    const top = GY - h;
    // (the boulder: an ink edge, its ramp across it, lit up top and on the left)
    g.fillStyle = INK; g.beginPath(); g.moveTo(x - 4, GY); g.lineTo(x - 2, top + 10); g.lineTo(x + 8, top - 2); g.lineTo(x + w - 10, top - 2); g.lineTo(x + w + 2, top + 8); g.lineTo(x + w + 4, GY); g.fill();
    const R = ['#3E3A36', '#57524C', '#736C64', '#8F877D', '#ACA398', '#CBC2B4'];
    g.fillStyle = R[2]; g.beginPath(); g.moveTo(x - 2, GY); g.lineTo(x, top + 10); g.lineTo(x + 9, top); g.lineTo(x + w - 11, top); g.lineTo(x + w, top + 9); g.lineTo(x + w + 2, GY); g.fill();
    box(g, x + w * 0.62, top + 8, w * 0.38, h - 8, R[1]); checker(g, x + w * 0.56, top + 8, 6, h - 8, R[1]);
    box(g, x + 2, top + 10, 8, h - 12, R[3]); checker(g, x + 10, top + 10, 4, h - 12, R[3]);
    box(g, x + 14, top + 22, 22, 2, R[1]); box(g, x + 30, top + 30, 2, 12, R[1]); box(g, x + 14, top + 24, 22, 1, R[4]);
    // (its top: lit, flat enough to stand on)
    box(g, x + 6, top - 4, w - 12, 6, R[4]); box(g, x + 6, top - 4, w - 12, 2, R[5]);
    // (moss round its foot)
    for (let k = 0; k < w; k += 6) { const hh = 4 + r1(k, x) * 10; box(g, x + k - 2, GY - hh, 7, hh, MOSS[1]); checker(g, x + k - 2, GY - hh - 2, 7, 2, MOSS[2]); }
  });
};

/** A wooden sign on two posts: HUNTING AREA (antlers on top, a couple of bullet holes). */
export const drawHuntSign = (c: Ctx, x: number) => {
  stamp(c, 'clHunt', x - 70, GY - 132, 140, 134, g => {
    for (const px of [x - 44, x + 40]) { pole(g, px, GY - 90, 6, 90, '#7A5430'); box(g, px - 1, GY - 4, 8, 4, MOSS[1]); }
    plaque(g, x, GY - 80, 112, 38, '#8A5A2E', ['HUNTING AREA', 'TRESPASSERS', 'WILL BE STUFFED'], '#FDE68A', 5);
    for (const [hx, hy] of [[x + 38, GY - 92], [x - 30, GY - 70]]) { box(g, hx - 1, hy - 1, 4, 4, INK); box(g, hx, hy, 2, 2, '#1A0E06'); }
    // (antlers)
    g.strokeStyle = '#E7DCC0'; g.lineWidth = 3; g.beginPath();
    for (const s of [-1, 1]) { g.moveTo(x, GY - 100); g.quadraticCurveTo(x + s * 18, GY - 108, x + s * 24, GY - 126); g.moveTo(x + s * 12, GY - 106); g.lineTo(x + s * 8, GY - 120); g.moveTo(x + s * 20, GY - 114); g.lineTo(x + s * 30, GY - 118); }
    g.stroke();
    box(g, x - 6, GY - 104, 12, 8, '#8A5A2E'); box(g, x - 6, GY - 104, 12, 2, '#B07A44');
  });
};

/** Before the boss: a supply crate (what's on it is the big health and ammo) under a first-aid sign on a post. */
export const drawAidStop = (c: Ctx, stocked: boolean) => {
  const x = PICKUP_X - 10;
  stamp(c, `clAid:${stocked ? 1 : 0}`, x - 80, GY - 156, 200, 158, g => {
    pole(g, x + 60, GY - 120, 6, 120, '#7A5430');
    plaque(g, x + 63, GY - 126, 92, 32, '#F5F0E0', ['LAST CHANCE', 'FIRST AID'], '#B91C1C', 5);
    box(g, x + 59 - 6, GY - 150, 18, 12, INK); box(g, x + 57, GY - 149, 10, 10, '#F8FAFC'); box(g, x + 60, GY - 148, 4, 8, '#DC2626'); box(g, x + 58, GY - 146, 8, 4, '#DC2626');
    // (the crate it's all set out on, behind: planks, its lid ajar)
    box(g, x - 60, GY - 44, 100, 44, INK); box(g, x - 58, GY - 42, 96, 42, '#9A7444');
    for (let k = 0; k < 4; k++) { box(g, x - 58, GY - 42 + k * 11, 96, 1, '#6E5030'); box(g, x - 58, GY - 41 + k * 11, 96, 1, '#BE9660'); }
    box(g, x - 58, GY - 42, 4, 42, '#BE9660'); box(g, x + 34, GY - 42, 4, 42, '#6E5030');
    signAt(g, stocked ? 'PROPERTY OF S.A.' : 'EMPTY. SORRY.', x - 10, GY - 12, 5, stencil(5, '#3A2410'));
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The trees: standing, going over, down (back off the path, dimmed), the last leaning on the temple

/** One tree, its foot at (x, GY), turned `a` (radians, over to the right). `down`: lying back there, dimmed. */
export const drawTree = (c: Ctx, x: number, a: number, i: number, f: number, down: boolean) => {
  const d = (col: string) => (down ? dim(mix(col, INK, 0.3)) : col);
  c.save();
  // (down: lying back off the path, nothing of it below the path's edge; the bark's light turned away from its top)
  if (down) { c.beginPath(); c.rect(x - 400, GY - 600, 1000, 600 - 6); c.clip(); }
  c.translate(x, down ? GY - 30 : GY); c.rotate(a);
  const H = TREE_H;
  // (buttress roots, flaring out at the foot)
  for (const s of [-1, 1]) { c.fillStyle = d(BARK[1]); c.beginPath(); c.moveTo(s * 12, -50); c.quadraticCurveTo(s * 18, -10, s * 34, 0); c.lineTo(s * 8, 0); c.closePath(); c.fill(); }
  // (the trunk, banded: lit down its left, shadowed down its right, bark stripes)
  box(c, -16, -H, 32, H, d(INK));
  const bands = down ? [BARK[1], BARK[1], BARK[2], BARK[2], BARK[2], BARK[3], BARK[2]] : [BARK[3], BARK[4], BARK[3], BARK[2], BARK[2], BARK[1], BARK[1]];
  bands.forEach((col, k) => box(c, -15 + k * 4.3, -H, 4.6, H, d(col)));
  for (let y = -H + 12; y < -8; y += 18) { const s = r1(y, i); box(c, -12 + s * 10, y, 8, 2, d(BARK[0])); box(c, -12 + s * 10, y + 2, 8, 1, d(BARK[4])); }
  // (a vine round it, a few leaves)
  vineDown(c, -6, -H + 30, H - 70, i);
  // (the park's speakers strapped up some of them (the jungle's noises; his set): a box, its grille, the straps round
  // the trunk, the cable down; on another, an access door in the bark (the trunk's fiberglass), its hinges)
  if (i === 1 || i === 4) {
    const sy = -H + 96;
    box(c, -18, sy + 4, 36, 3, d(INK)); box(c, -18, sy + 22, 36, 3, d(INK)); box(c, -17, sy + 4, 34, 1, d('#5A5A60')); box(c, -17, sy + 22, 34, 1, d('#5A5A60'));
    box(c, 6, sy - 1, 20, 30, d(INK)); box(c, 7, sy, 18, 28, d('#3A3E44')); box(c, 7, sy, 18, 2, d('#6A7078')); box(c, 7, sy, 2, 28, d('#5A6068'));
    for (let gy = sy + 5; gy < sy + 24; gy += 3) for (let gx = 10 + ((gy - sy) % 2); gx < 23; gx += 3) box(c, gx, gy, 1, 1, d('#1A1C20'));
    box(c, 22, sy + 24, 2, 2, d('#4ADE80'));
    c.strokeStyle = d('#1A1A1A'); c.lineWidth = 1.5; c.beginPath(); c.moveTo(16, sy + 28); c.quadraticCurveTo(18, sy + 80, 10, -20); c.stroke();
  }
  if (i === 3) { box(c, -10, -64, 20, 36, d(BARK[0])); box(c, -9, -63, 18, 34, d(BARK[2])); box(c, -9, -63, 18, 1, d(BARK[4])); box(c, -11, -58, 3, 4, d('#9CA3AF')); box(c, -11, -40, 3, 4, d('#9CA3AF')); box(c, 5, -48, 3, 3, d('#C8A040')); }
  // (the crown: clumps of leaves in their ramp, hanging vines)
  const ramp = [LEAF[1], LEAF[2], LEAF[3], LEAF[5]].map(d);
  for (const [dx, dy, r] of [[-46, 26, 40], [44, 24, 40], [0, -12, 52], [-24, 2, 40], [26, 4, 40]] as const) crown(c, dx, -H + dy, r, ramp);
  for (const vx of [-52, -20, 30, 56]) { box(c, vx, -H + 40, 2, 40 + ((vx * 7) % 30), d(LEAF[1])); box(c, vx - 2, -H + 70 + ((vx * 7) % 30), 6, 4, d(LEAF[3])); }
  // (a toucan up there, not that anyone's looking)
  if (i === 2 && !down && a < 0.05) { const bob = Math.floor(f / 30) % 2; box(c, 20, -H - 30 - bob, 10, 8, INK); box(c, 21, -H - 29 - bob, 8, 6, '#1C1917'); box(c, 29, -H - 29 - bob, 8, 4, '#F97316'); box(c, 22, -H - 27 - bob, 2, 2, '#F8FAFC'); }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The temple's wing across the path

export const drawWing = (c: Ctx, hit: boolean) => {
  stamp(c, `clWing:${hit ? 1 : 0}`, TEMPLE_X - 60, GY - 320, 1000, 324, g => {
    stoneWall(g, TEMPLE_X + 40, GY - 300, 900, 80, 41, { seams: 192, base: 3 });
    stoneWall(g, TEMPLE_X, GY - 220, 900, 220, 29, { seams: 192, moss: 0.3, glyphs: true });
    // (its corner going back: the end of it, in shadow)
    box(g, TEMPLE_X, GY - 220, 8, 220, STONE[2]); checker(g, TEMPLE_X + 8, GY - 220, 4, 220, STONE[2]);
    // (the cornices: dark-capped, not lit like somewhere to stand)
    box(g, TEMPLE_X, GY - 224, 900, 6, STONE[3]); box(g, TEMPLE_X, GY - 218, 900, 3, STONE[1]);
    box(g, TEMPLE_X + 40, GY - 304, 900, 6, STONE[2]);
    for (let x = TEMPLE_X + 80; x < TEMPLE_X + 860; x += 140) glyph(g, x, GY - 260, STONE[3]);
    for (let i = 0; i < 6; i++) vineDown(g, TEMPLE_X + 20 + i * 47 + r1(i) * 20, GY - 218, 60 + r1(i, 2) * 120, i);
    if (!hit) return;
    // (where the last tree hit it: a crater, cracks out from it, a panel cracked off (the plywood), rubble at its foot)
    const hx = TEMPLE_X + 18, hy = GY - 230;
    g.fillStyle = INK; g.beginPath();
    for (let k = 0; k < 16; k++) { const ang = (k / 16) * Math.PI * 2, rr = 27 + r1(k, 5) * 5; g.lineTo(hx + Math.cos(ang) * rr, hy + Math.sin(ang) * rr * 0.9); }
    g.fill();
    g.fillStyle = PLY[1]; g.beginPath();
    for (let k = 0; k < 16; k++) { const ang = (k / 16) * Math.PI * 2, rr = 23 + r1(k, 5) * 4; g.lineTo(hx + Math.cos(ang) * rr, hy + Math.sin(ang) * rr * 0.9); }
    g.fill();
    box(g, hx - 14, hy - 20, 4, 40, PLY[2]); box(g, hx + 4, hy - 22, 4, 44, PLY[0]); box(g, hx - 10, hy - 6, 24, 8, DARK);
    box(g, hx - 26, hy - 2, 4, 10, SHELL); box(g, hx + 22, hy - 8, 4, 12, SHELL);
    g.strokeStyle = STONE[0]; g.lineWidth = 2;
    for (const [dx, dy] of [[70, -50], [90, 30], [40, 80], [120, -10], [30, -70]] as const) { g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + dx * 0.5, hy + dy * 0.4 + 6); g.lineTo(hx + dx, hy + dy); g.stroke(); }
    for (let i = 0; i < 9; i++) { const s = 8 + r1(i, 4) * 12, rx = TEMPLE_X - 50 + i * 12; box(g, rx, GY - s, s * 1.3, s, STONE[3]); box(g, rx, GY - s, s * 1.3, 2, STONE[5]); box(g, rx + s * 1.3 - 2, GY - s, 2, s, STONE[1]); }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The fight's: the fence, the bushes, his vine

/** The bamboo fence that goes up behind him for the fight (lashed poles, cut to points). */
export const drawFence = (c: Ctx, top: number) => {
  const x = ARENA_L - 30;
  stamp(c, `clFence:${top}`, x - 6, top - 16, 44, GY - top + 18, g => {
    const B = ['#6A4A1E', '#8E6A2E', '#B89048', '#D4AC60', '#EED08A'];
    for (let k = 0; k < 5; k++) {
      const px = x + k * 6, h = GY - top - (k % 2) * 10, ty = GY - h;
      // (a cane: inked, in its steps across, the nodes banded (a dark ring, a lit swell over it))
      box(g, px, ty, 6, h, INK); box(g, px + 1, ty, 4, h, B[k % 2 ? 2 : 3]); box(g, px + 1, ty, 1, h, B[4]); box(g, px + 4, ty, 1, h, B[1]);
      for (let y = ty + 26 + (k % 3) * 6; y < GY - 4; y += 34) { box(g, px + 1, y, 4, 2, B[0]); box(g, px + 1, y - 1, 4, 1, B[4]); }
      // (its top cut to a point on the slant: the hollow inside it showing)
      g.fillStyle = INK; g.beginPath(); g.moveTo(px, ty + 1); g.lineTo(px + (k % 2 ? 6 : 0), ty - 11); g.lineTo(px + 6, ty + 1); g.fill();
      g.fillStyle = B[3]; g.beginPath(); g.moveTo(px + 1, ty); g.lineTo(px + (k % 2 ? 5 : 1), ty - 9); g.lineTo(px + 5, ty); g.fill();
      box(g, px + 2, ty - 3, 2, 2, B[0]);
    }
    // (the rails across it, lashed on with rope in an X at each cane)
    for (let y = GY - 60; y > top; y -= 90) {
      box(g, x - 3, y - 1, 36, 7, INK); box(g, x - 2, y, 34, 5, B[1]); box(g, x - 2, y, 34, 1, B[3]); box(g, x - 2, y + 4, 34, 1, B[0]);
      for (let k = 0; k < 5; k++) { const px = x + k * 6; box(g, px + 1, y - 2, 1, 9, '#C8A870'); box(g, px + 4, y - 2, 1, 9, '#C8A870'); box(g, px + 2, y + 2, 2, 1, '#E8D4A0'); }
    }
  });
};

/** A bush's leaf clusters (each a cluster of leaves: its middle, its size), outer ones first to go. */
const CLUSTERS: [number, number, number][] = [
  // (its spread at the ends, reaching to the next one's: no gap between them along the row; the first eaten away)
  [-68, -16, 15], [68, -16, 15], [-62, -36, 13], [62, -36, 13],
  [-50, -14, 18], [50, -14, 18], [-36, -44, 20], [36, -44, 20], [0, -58, 22], [-18, -56, 18], [20, -58, 18],
  [-52, -30, 16], [52, -30, 16], [-30, -20, 22], [30, -20, 22], [0, -34, 26], [-12, -14, 22], [14, -14, 22],
];
/** Each cluster's leaves (where round its middle). */
const LEAVES = Array.from({ length: 9 }, (_, k) => { const a = (k / 9) * Math.PI * 2 + 0.3; return [Math.cos(a), Math.sin(a) * 0.8] as const; });

const leafCluster = (g: Ctx, x: number, y: number, r: number, seed: number) => {
  pixelBlob(g, x + 2, y + 3, r, r * 0.8, LEAF[0]);
  pixelBlob(g, x, y, r * 0.9, r * 0.72, LEAF[2]);
  // (the leaves round its edge: little pointed ovals, lit on top)
  for (const [lx, ly] of LEAVES) {
    const px = x + lx * r * 0.85, py = y + ly * r * 0.8;
    const col = ly < -0.2 ? LEAF[4] : ly > 0.3 ? LEAF[1] : LEAF[3];
    g.fillStyle = col; g.beginPath(); g.ellipse(px, py, 5, 3, Math.atan2(ly, lx), 0, Math.PI * 2); g.fill();
  }
  // (the steps between dithered: the body into its lit crown, its shade up into the body)
  checker(g, x - r * 0.6, y - r * 0.12, r * 1.2, 2, LEAF[3]);
  checker(g, x - r * 0.5, y + r * 0.42, r * 1.1, 2, LEAF[1], 1);
  pixelBlob(g, x - r * 0.25, y - r * 0.28, r * 0.4, r * 0.26, LEAF[4]);
  box(g, x - r * 0.3, y - r * 0.4, 2, 2, LEAF[5]);
  // (berries on some, little white flowers on others)
  if (seed % 4 === 0) { box(g, x + 4, y - 2, 3, 3, '#DC2626'); box(g, x + 4, y - 2, 1, 1, '#FCA5A5'); box(g, x - 6, y + 4, 3, 3, '#DC2626'); box(g, x - 6, y + 4, 1, 1, '#FCA5A5'); }
  else if (seed % 5 === 1) for (const [fx, fy] of [[-5, -3], [5, 2], [0, -8]] as const) { box(g, x + fx - 1, y + fy, 3, 1, '#F4F4F0'); box(g, x + fx, y + fy - 1, 1, 3, '#F4F4F0'); box(g, x + fx, y + fy, 1, 1, '#F2C21E'); }
};

/**
 * A bush, its middle at x, on the ground: `k` how much of it's left (1 whole .. 0 gone: twigs, leaves on the ground).
 * `fringe`: just its front leaves (over whoever's in it). Painted once per step of thinning.
 */
export const drawBushArt = (c: Ctx, x: number, k: number, gone: boolean, fringe: boolean, flip = false) => {
  const step = gone ? 0 : Math.max(1, Math.ceil(k * 7));
  const key = `clBush:${step}:${fringe ? 1 : 0}`;
  c.save(); c.translate(Math.round(x), GY);
  // (every other one mirrored: a row of five that isn't one bush five times over)
  if (flip) c.scale(-1, 1);
  stamp(c, key, -BUSH_W / 2 - 16, -BUSH_H - 20, BUSH_W + 32, BUSH_H + 24, g => {
    const n = step === 0 ? 0 : Math.round((CLUSTERS.length * step) / 7);
    if (fringe) {
      // (the front of it: the lowest clusters, along the bottom)
      CLUSTERS.forEach(([cx, cy, r], i) => { if (i >= CLUSTERS.length - n && cy > -24) leafCluster(g, cx, cy + 4, r * 0.9, i); });
      return;
    }
    // twigs (showing more the more it's eaten)
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath();
    for (const [tx, a] of [[-30, -0.5], [-8, -0.15], [12, 0.2], [34, 0.55]] as const) { g.moveTo(tx * 0.4, 0); g.lineTo(tx + Math.sin(a) * 30, -38 - Math.abs(tx) * 0.2); }
    g.stroke();
    g.strokeStyle = '#6A4A28'; g.lineWidth = 2; g.beginPath();
    for (const [tx, a] of [[-30, -0.5], [-8, -0.15], [12, 0.2], [34, 0.55]] as const) { g.moveTo(tx * 0.4, 0); g.lineTo(tx + Math.sin(a) * 30, -38 - Math.abs(tx) * 0.2); g.moveTo(tx * 0.7 + Math.sin(a) * 15, -20); g.lineTo(tx * 0.7 + Math.sin(a) * 15 + (tx > 0 ? 10 : -10), -30); }
    g.stroke();
    // (the leaves that've come off it, on the ground, the more the more it's eaten)
    for (let i = 0; i < 7 - step + (step === 0 ? 3 : 0); i++) { const lx = -52 + r1(i, 3) * 104; box(g, lx, -3, 6, 3, i % 2 ? LEAF[2] : '#7A8A34'); box(g, lx, -3, 6, 1, LEAF[4]); }
    // (chewed down, the fakery shows: it's a prop, its twigs wired into a black plastic base, stenciled)
    if (step <= 2) {
      box(g, -22, -9, 44, 9, INK); box(g, -21, -8, 42, 8, '#2A2A30'); box(g, -21, -8, 42, 1, '#4A4A54'); box(g, -21, -2, 42, 2, '#18181C');
      for (const bx of [-17, 15]) box(g, bx, -6, 2, 2, '#8A929C');
      // (the props department's inventory tag, its barcode)
      box(g, -7, -7, 14, 5, '#E8E4D8'); for (let bx = -6; bx < 6; bx += 2) box(g, bx, -6, 1, 3, '#2A2A30');
    }
    if (step === 0) return;
    // (what's left of it: the inner clusters last to go)
    CLUSTERS.forEach(([cx, cy, r], i) => { if (i >= CLUSTERS.length - n) leafCluster(g, cx, cy, r, i); });
    // (bitten: ragged gaps, the twigs through them, crumbs)
    if (step < 7) for (let i = 0; i < 7 - step; i++) { const bx = -40 + r1(i, step) * 80, by = -50 + r1(i, step + 1) * 36; box(g, bx, by, 3, 3, LEAF[0]); box(g, bx + 4, by + 2, 2, 2, '#7A8A34'); }
  });
  c.restore();
};

/** His vine: twisted, leafy, from up out of sight down to his hands; chewed thin round `ny` (k: how much is left). */
export const drawVine = (c: Ctx, x: number, top: number, bottom: number, ny: number, k: number) => {
  // (a liana: two strands twisted round each other (each lit on its turn toward the light, shaded going round the
  // back), leaves off it in pairs with a midrib; it's the park's: rubber over a rope core, which shows where it's chewed)
  const V = ['#1A2A10', '#2E4A1C', '#46682A', '#62883A', '#86AA4E'];
  for (let y = Math.floor(top / 6) * 6; y < bottom; y += 6) {
    const chewed = Math.abs(y - ny) < 9;
    const w = chewed ? Math.max(1, Math.round(5 * k)) : 5;
    const tw = Math.floor(y / 6) % 2;
    box(c, x - w / 2 - 1, y, w + 2, 6, INK);
    if (chewed) {
      // (bitten through to the rope inside: tan fibers, frayed ends sticking out)
      box(c, x - w / 2, y, w, 6, '#B8965A'); if (w > 1) box(c, x - w / 2, y + (tw ? 0 : 3), w, 1, '#E8D4A0');
      continue;
    }
    box(c, x - w / 2, y, w, 6, V[2]);
    // (the twist: one strand over the other, the crossing alternating side to side)
    c.fillStyle = V[tw ? 3 : 1]; c.fillRect(Math.round(x - w / 2), y, 2, 6);
    c.fillStyle = V[tw ? 1 : 3]; c.fillRect(Math.round(x + w / 2 - 2), y, 2, 6);
    box(c, x - w / 2 + (tw ? 1 : w - 3), y + 2, 2, 2, V[4]);
    box(c, x - w / 2 + 1, y + 5, w - 2, 1, V[0]);
    if (Math.floor(y / 6) % 4 === 0) {
      const s = Math.floor(y / 24) % 2 ? 1 : -1, lx = x + s * 8, ly = y + 3;
      c.fillStyle = INK; c.beginPath(); c.moveTo(x + s * 2, ly); c.quadraticCurveTo(lx, ly - 6, x + s * 15, ly + 1); c.quadraticCurveTo(lx, ly + 5, x + s * 2, ly); c.fill();
      c.fillStyle = LEAF[3]; c.beginPath(); c.moveTo(x + s * 3, ly); c.quadraticCurveTo(lx, ly - 4.5, x + s * 13.5, ly + 1); c.quadraticCurveTo(lx, ly + 3.5, x + s * 3, ly); c.fill();
      c.fillStyle = LEAF[4]; c.beginPath(); c.moveTo(x + s * 3, ly); c.quadraticCurveTo(lx, ly - 4.5, x + s * 13.5, ly + 1); c.lineTo(x + s * 3, ly); c.fill();
      box(c, Math.min(x + s * 3, x + s * 12), ly, 9, 1, LEAF[1]);
    }
  }
  if (k < 1) for (const sd of [-1, 1]) { box(c, x + sd * (3 + (1 - k) * 4), ny - 2, 2, 1, '#E8D4A0'); box(c, x + sd * (4 + (1 - k) * 7), ny + 2, 2, 1, '#B8965A'); box(c, x + sd * (2 + (1 - k) * 5), ny, 1, 1, '#A3E635'); }
};
