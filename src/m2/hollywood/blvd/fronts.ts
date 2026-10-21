// The boulevard's fronts (back from the play plane at FRONT_D: dimmed, none of them to stand on): plywood, one sheet
// deep, painted up as the real thing: deco palaces of commerce (stepped parapets, fluted piers, chevrons, gold), mission
// revival (barrel tile, arches, iron grilles), sixties boxes (stone veneer, a slanted pylon, plate glass), old brick
// (courses, a ghost ad, dentils); the franchise's own (a banner hung over the lot). Their windows with the gag in them
// (the Oscar-ish statuettes, the wax figure melting, the line of hopefuls...), their names up on boards, the joke under.
// Round their ends, going back toward the eye, what holds them up: 2x4s down to sandbags in the lot behind (walk past
// one and there it is). And the big ones: GROWMAN'S CHINA-ISH THEATRE (a pagoda roof of plywood, its columns), THE
// ROOSEVELT-ISH HOTEL (tall, arched, its rooftop sign), the HAPPYWOOD BLVD arch at the start.

import { GY } from '../geometry';
import { X } from './layout';
import {
  type Ctx, type View, INK, box, checker, mix, hash, poly, at, atDepth, still, stillAt, seen, timeOfDay, signText, signW,
  FRONT_D, BACK_D, PLY, SAND, BRASS, STEVE, STEEL, ramp6, dimmed, rampH, glassOf, lit, slab, post, ball, board, deco, bulbs, paint, plain, words,
} from './kit';
import { gate } from '../../hub/letters';

type Style = 'deco' | 'mission' | 'modern' | 'brick' | 'franchise';
type Goods = 'souvenirs' | 'wax' | 'oscars' | 'maps' | 'oddities' | 'burger' | 'costumes' | 'tattoo' | 'merch' | 'line' | 'liquor' | 'tours' | 'headshots' | 'agents';
interface Front { rx: number; w: number; h: number; wall: string; trim: string; style: Style; goods: Goods; name: string; sub: string }

/** The blocks: which plywood front stands where along the back (x from the section's start). */
export const FRONTS: Front[] = [
  { rx: 600, w: 360, h: 210, wall: '#C8742E', trim: '#2E6A8A', style: 'modern', goods: 'souvenirs', name: 'SOUVENIRS SOUVENIRS', sub: 'EVERYTHING $5. OR $50.' },
  { rx: 1000, w: 300, h: 250, wall: '#2E8A9A', trim: '#E8C25A', style: 'deco', goods: 'wax', name: 'WAX MUSEUM-ISH', sub: 'NOW 40% LESS MELTED' },
  { rx: 1600, w: 420, h: 190, wall: '#E2CCA8', trim: '#9A3A24', style: 'mission', goods: 'oscars', name: 'OSCAR-ISH GIFTS', sub: 'YOU WIN! ($19.99)' },
  { rx: 2100, w: 300, h: 230, wall: '#8A3A2A', trim: '#E8D8B8', style: 'brick', goods: 'maps', name: 'MAPS TO STARS HOMES', sub: 'MOST OF THEM MOVED' },
  { rx: 3550, w: 380, h: 220, wall: '#6A4A9A', trim: '#E8C25A', style: 'deco', goods: 'oddities', name: "BELIEVE IT OR DON'T", sub: "MOSTLY DON'T" },
  { rx: 4450, w: 320, h: 240, wall: '#D85A8A', trim: '#2A2A3A', style: 'modern', goods: 'burger', name: 'CELEBRITY BURGERS', sub: 'A STAR ATE HERE (ALLEGEDLY)' },
  { rx: 4850, w: 420, h: 200, wall: '#D8C49C', trim: '#2E7A6A', style: 'mission', goods: 'costumes', name: 'COSTUMES 4 LESS', sub: 'BE SOMEBODY ELSE. LEGALLY DISTINCT.' },
  { rx: 5350, w: 300, h: 260, wall: '#9A3A2E', trim: '#E8D8B8', style: 'brick', goods: 'tattoo', name: 'TATTOOS & HEADSHOTS', sub: 'ONE OF EACH: $40' },
  { rx: 5750, w: 380, h: 210, wall: '#1E3A8A', trim: '#FDE047', style: 'franchise', goods: 'merch', name: 'REVENGERS: RESEMBLE', sub: 'PART 14: THE RE-SEMBLING' },
  { rx: 6200, w: 320, h: 230, wall: '#D89A3A', trim: '#3A2A2A', style: 'modern', goods: 'line', name: 'AUDITIONS TODAY', sub: 'NOW SEEING #4,082' },
  { rx: 7250, w: 300, h: 250, wall: '#6A5E58', trim: '#D8C8A8', style: 'brick', goods: 'liquor', name: 'LIQUOR', sub: 'OPEN 25 HOURS' },
  { rx: 9200, w: 360, h: 230, wall: '#A8344A', trim: '#E8C25A', style: 'deco', goods: 'tours', name: 'STAR TOURS-ISH', sub: 'SEE WHERE THEY USED TO LIVE' },
  { rx: 9650, w: 320, h: 250, wall: '#2E7A8A', trim: '#F2E2C2', style: 'modern', goods: 'headshots', name: 'HEADSHOTS $5', sub: 'SMILE. NO. NOT LIKE THAT.' },
  { rx: 10050, w: 340, h: 220, wall: '#C8A070', trim: '#7A3A20', style: 'mission', goods: 'agents', name: 'AGENTS WANTED', sub: 'NO EXPERIENCE? NO PROBLEM.' },
];

// ---------------------------------------------------------------------------------------------------------------
// What's in the windows

type Paint = (g: Ctx, x: number, y: number, w: number, h: number, seed: number) => void;
const shelf = (g: Ctx, x: number, y: number, w: number) => { box(g, x, y, w, 3, PLY[2]); box(g, x, y, w, 1, PLY[4]); };
/** A little statuette: gold, on a black base (the Oscar-ish). */
const statuette = (g: Ctx, x: number, foot: number, s = 1) => {
  box(g, x - 3 * s - 1, foot - 3 * s - 1, 6 * s + 2, 3 * s + 1, INK);
  box(g, x - 3 * s, foot - 3 * s, 6 * s, 3 * s, '#1A1418'); box(g, x - 3 * s, foot - 3 * s, 6 * s, 1, '#4A4248');
  box(g, x - 1 * s - 1, foot - 13 * s, 2 * s + 2, 10 * s, INK);
  box(g, x - 1 * s, foot - 13 * s, 2 * s, 10 * s, BRASS[3]); box(g, x - 1 * s, foot - 13 * s, 1, 10 * s, BRASS[5]); box(g, x + s - 1, foot - 13 * s, 1, 10 * s, BRASS[1]);
  if (s >= 1.5) { box(g, x - s, foot - 9 * s, 2 * s, 1, BRASS[1]); box(g, x - s, foot - 6 * s, 2 * s, 1, BRASS[1]); }
  ball(g, x, foot - 15 * s, 1.6 * s, '#E8C25A', false);
};
/** A person in the window (a wax figure, a mannequin), plain: a head, a body in a color. */
const figure = (g: Ctx, x: number, foot: number, body: string, skin = '#E8C0A0', hair = '#3A2414', melt = 0) => {
  const R = ramp6(body);
  box(g, x - 7, foot - 30, 14, 30, INK); box(g, x - 6, foot - 29, 12, 29, R[3]); box(g, x - 6, foot - 29, 3, 29, R[4]); box(g, x + 3, foot - 29, 3, 29, R[1]);
  g.fillStyle = INK; g.beginPath(); g.ellipse(x, foot - 37 + melt * 0.3, 6, 7 + melt * 0.4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = skin; g.beginPath(); g.ellipse(x, foot - 37 + melt * 0.3, 5, 6 + melt * 0.4, 0, 0, Math.PI * 2); g.fill();
  box(g, x - 5, foot - 44, 10, 4, hair);
  box(g, x + 1, foot - 38, 1, 1, INK); box(g, x - 2, foot - 38, 1, 1, INK);
  if (melt) { for (let k = 0; k < 4; k++) box(g, x - 4 + k * 3, foot - 32, 2, 4 + melt * (k % 2 ? 1 : 0.5), skin); box(g, x - 6, foot - 1, 12, 2, skin); }
};
const GOODS: Record<Goods, Paint> = {
  souvenirs: (g, x, y, w, h) => {
    // (snow globes with the hill in them, statuettes, a rack of I-HEART-HW shirts, a cardboard cutout of nobody)
    for (const sy of [y + h * 0.45, y + h - 6]) { shelf(g, x, sy, w); for (let k = 0; k < w / 14 - 1; k++) { const cx = x + 8 + k * 14; if (k % 2) { box(g, cx - 4, sy - 3, 8, 3, '#6A3A1A'); g.fillStyle = INK; g.beginPath(); g.arc(cx, sy - 8, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = '#C8ECFF'; g.beginPath(); g.arc(cx, sy - 8, 5, 0, Math.PI * 2); g.fill(); box(g, cx - 3, sy - 7, 6, 2, '#9A8458'); box(g, cx - 2, sy - 11, 1, 1, '#FFFFFF'); } else statuette(g, cx, sy, 0.8); } }
    for (let k = 0; k < 3; k++) { const sx = x + w - 60 + k * 18; box(g, sx, y + 6, 16, 18, INK); box(g, sx + 1, y + 7, 14, 16, ['#F8FAFC', '#F2C24A', '#E86A8A'][k]); box(g, sx + 5, y + 12, 6, 5, '#C83A4A'); }
  },
  wax: (g, x, y, w, h) => {
    // (wax figures of nobody in particular on plinths; the one by the heater melting)
    for (let k = 0; k < 3; k++) { const cx = x + 22 + k * (w - 40) / 2; box(g, cx - 10, y + h - 8, 20, 8, '#3A2A3A'); box(g, cx - 10, y + h - 8, 20, 1, '#6A5A6A'); figure(g, cx, y + h - 8, ['#1A1A2A', '#8A1A2A', '#E8E0D0'][k], ['#E8C0A0', '#C8946A', '#F0D0B0'][k], ['#2A1A10', '#E8D890', '#5A3A1A'][k], k === 2 ? 6 : 0); }
    box(g, x + w - 18, y + h - 20, 12, 12, '#3A3A3A'); for (let k = 0; k < 3; k++) box(g, x + w - 16, y + h - 18 + k * 3, 8, 1, '#E8602A');
  },
  oscars: (g, x, y, w, h) => {
    // (a red velvet drape behind it all in folds, its swag across the top fringed in gold; the floor a strip of red
    //  carpet; a stepped velvet riser either side, statuettes in rows up it with price tags; the big one in the middle
    //  on a plinth under its own spotlight)
    const V = ['#2A0A10', '#4A1018', '#6A1620', '#8A1E2A', '#B43040'];
    const fold = [1, 2, 3, 3, 2, 1, 0, 1, 2, 2];
    for (let k = 0, fx = x; fx < x + w; k++, fx += 3) box(g, fx, y, 3, h, V[fold[k % fold.length]]);
    for (let fx = x; fx < x + w; fx += 30) checker(g, fx + 17, y + 10, 2, h - 10, V[0], 0, 2);
    // (the swag: scallops across the top, shaded under, a gold fringe)
    box(g, x, y, w, 6, V[2]);
    for (let sx = x - 6; sx < x + w; sx += 24) { g.fillStyle = INK; g.beginPath(); g.ellipse(sx + 12, y + 5, 13, 7, 0, 0, Math.PI); g.fill(); g.fillStyle = V[3]; g.beginPath(); g.ellipse(sx + 12, y + 5, 12, 6, 0, 0, Math.PI); g.fill(); box(g, sx + 4, y + 6, 14, 1, V[4]); box(g, sx + 4, y + 9, 16, 2, V[1]); }
    for (let fx = x; fx < x + w; fx += 2) box(g, fx, y + 12 + ((fx >> 1) & 1), 1, 2, (fx >> 1) % 3 ? BRASS[3] : BRASS[5]);
    // (the carpet)
    box(g, x, y + h - 5, w, 5, '#8A1420'); box(g, x, y + h - 5, w, 1, '#C83A40'); checker(g, x, y + h - 3, w, 2, '#5A0E16', 0, 2);
    // (the risers, stepped, velvet-topped, each step lit along its front edge; statuettes up them, tagged)
    const cx = x + w / 2;
    for (const s of [-1, 1]) for (let st = 0; st < 3; st++) {
      const sw = Math.max(20, w / 2 - 34 - st * 22), sx = s < 0 ? x + 2 : cx + 32 + st * 22, top = y + h - 5 - (st + 1) * 14;
      const sx0 = sx, sw0 = s < 0 ? sw : x + w - 2 - sx;
      box(g, sx0 - 1, top - 1, sw0 + 2, 15, INK); box(g, sx0, top, sw0, 14, V[2]); box(g, sx0, top, sw0, 2, V[4]); box(g, sx0, top + 11, sw0, 3, V[1]);
      for (let k = 0; k < sw0 / 12 - 1; k++) {
        const px = sx0 + 8 + k * 12;
        statuette(g, px, top, 1);
        box(g, px + 3, top + 4, 5, 3, '#F2EAD8'); box(g, px + 3, top + 4, 1, 1, INK);
      }
    }
    // (the plinth in the middle, the big one on it, the spotlight's cone down on it, banded)
    box(g, cx - 15, y + h - 31, 30, 26, INK); box(g, cx - 14, y + h - 30, 28, 25, '#1A1418'); box(g, cx - 14, y + h - 30, 28, 2, '#5A5258'); box(g, cx - 14, y + h - 30, 3, 25, '#3A3238');
    box(g, cx - 10, y + h - 22, 20, 7, BRASS[2]); box(g, cx - 10, y + h - 22, 20, 1, BRASS[4]);
    statuette(g, cx, y + h - 31, 2.2);
    g.save(); g.globalAlpha = 0.18; g.fillStyle = '#FFF2C0';
    for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(cx - 3 - k * 2, y); g.lineTo(cx + 3 + k * 2, y); g.lineTo(cx + 14 + k * 8, y + h - 31); g.lineTo(cx - 14 - k * 8, y + h - 31); g.closePath(); g.fill(); }
    g.restore();
    box(g, cx - 2, y + h - 66, 2, 2, '#FFFFFF');
  },
  maps: (g, x, y, w, h) => {
    // (the maps pinned up, a star on each house; a pile of them; an old guy's folding chair)
    for (let k = 0; k < 3; k++) { const mx = x + 6 + k * (w / 3); box(g, mx, y + 6, w / 3 - 10, h * 0.5, '#E8DCB8'); for (let r = 0; r < 4; r++) box(g, mx + 2, y + 10 + r * 8, w / 3 - 14, 1, '#A89A78'); for (let r = 0; r < 3; r++) box(g, mx + 4 + r * 10, y + 12 + r * 6, 2, 2, '#C83A2A'); }
    box(g, x + w - 30, y + h - 22, 16, 3, '#3A3A3A'); box(g, x + w - 30, y + h - 22, 2, 22, '#3A3A3A'); box(g, x + w - 16, y + h - 22, 2, 22, '#3A3A3A');
    box(g, x + 6, y + h - 10, 40, 8, '#E8DCB8'); box(g, x + 6, y + h - 10, 40, 1, '#FFFFFF');
  },
  oddities: (g, x, y, w, h) => {
    // (a shrunken head under a bell jar, a two-headed calf (stuffed), the world's biggest ball of something)
    const cx = x + 26; box(g, cx - 12, y + h - 8, 24, 8, '#3A2A1A'); g.fillStyle = 'rgba(200,236,255,0.35)'; g.beginPath(); g.arc(cx, y + h - 22, 13, Math.PI, 0); g.fill(); box(g, cx - 13, y + h - 22, 26, 14, 'rgba(200,236,255,0.25)'); ball(g, cx, y + h - 16, 5, '#6A4A2A'); box(g, cx - 3, y + h - 12, 6, 2, '#2A1A0A');
    const kx = x + w / 2; box(g, kx - 16, y + h - 26, 32, 14, '#8A6A4A'); box(g, kx - 16, y + h - 26, 32, 3, '#A88A6A'); for (const lx of [kx - 12, kx - 4, kx + 4, kx + 12]) box(g, lx, y + h - 12, 3, 12, '#6A4A2A'); ball(g, kx - 20, y + h - 30, 5, '#8A6A4A'); ball(g, kx - 18, y + h - 38, 5, '#8A6A4A');
    ball(g, x + w - 26, y + h - 18, 16, '#C8963A');
    g.strokeStyle = '#8A5A1A'; g.lineWidth = 1; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(x + w - 26, y + h - 18, 4 + k * 2.5, k, k + 2.4); g.stroke(); }
  },
  burger: (g, x, y, w, h) => {
    // (a burger the size of a tire on a turntable, a cardboard star holding a fry, the menu board)
    const cx = x + w * 0.36, cy = y + h * 0.58;
    g.fillStyle = INK; g.beginPath(); g.ellipse(cx, cy, 30, 22, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#D8902E'; g.beginPath(); g.ellipse(cx, cy - 6, 28, 14, 0, Math.PI, 0); g.fill();
    for (let k = 0; k < 6; k++) box(g, cx - 16 + k * 6, cy - 14 + (k % 2) * 3, 2, 1, '#FFF4C8');
    box(g, cx - 29, cy - 4, 58, 4, '#4CAF50'); box(g, cx - 28, cy, 56, 6, '#6A3418'); box(g, cx - 27, cy + 6, 54, 3, '#F0C030');
    g.fillStyle = '#C8802A'; g.beginPath(); g.ellipse(cx, cy + 10, 28, 8, 0, 0, Math.PI); g.fill();
    box(g, x + w - 50, y + 6, 44, h - 14, '#1A1A24'); for (let k = 0; k < 5; k++) { box(g, x + w - 46, y + 12 + k * 9, 24, 2, '#F8FAFC'); box(g, x + w - 18, y + 12 + k * 9, 8, 2, '#FDE047'); }
  },
  costumes: (g, x, y, w, h) => {
    // (mannequins in the costumes: a cape and a foam shield, a white halter dress, a pirate's coat and tricorn)
    const n = Math.floor(w / 46);
    for (let k = 0; k < n; k++) {
      const cx = x + 24 + k * 46, foot = y + h - 4, col = ['#1D4ED8', '#F8FAFC', '#991B1B', '#EAB308', '#15803D'][k % 5];
      box(g, cx - 1, foot - 6, 2, 6, '#3A3A3A'); box(g, cx - 6, foot - 1, 12, 2, '#3A3A3A');
      figure(g, cx, foot - 6, col, '#D8D0C8', k % 5 === 1 ? '#FDF4C4' : '#D8D0C8');
      if (k % 5 === 0) { ball(g, cx + 8, foot - 22, 6, '#DC2626'); box(g, cx + 7, foot - 23, 2, 2, '#F8FAFC'); }
      if (k % 5 === 2) poly(g, [[cx - 9, foot - 43], [cx, foot - 50], [cx + 9, foot - 43], [cx, foot - 45]], '#1C1917');
    }
  },
  tattoo: (g, x, y, w, h) => {
    // (flash sheets pinned up (hearts, anchors, MOM), a grid of headshots, the chair)
    for (let k = 0; k < 2; k++) { const fx = x + 6 + k * 46; box(g, fx, y + 6, 40, 34, '#F2EAD8'); for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) box(g, fx + 3 + q * 12, y + 9 + r * 10, 9, 7, ['#C83A3A', '#2A5A9A', '#2A8A4A', '#1A1A1A'][(r + q + k) % 4]); }
    for (let r = 0; r < 2; r++) for (let q = 0; q < 3; q++) { const hx = x + w - 66 + q * 21, hy = y + 6 + r * 24; box(g, hx, hy, 18, 22, '#E8E8E8'); g.fillStyle = '#8A8A8A'; g.beginPath(); g.arc(hx + 9, hy + 9, 5, 0, Math.PI * 2); g.fill(); box(g, hx + 3, hy + 15, 12, 7, '#6A6A6A'); }
    box(g, x + 30, y + h - 20, 40, 8, '#2A2A2A'); box(g, x + 30, y + h - 34, 8, 16, '#2A2A2A');
  },
  merch: (g, x, y, w, h) => {
    // (T-shirts that say RESEMBLE, foam shields, a cardboard Revenger with his face cut out for photos)
    for (let k = 0; k < 4; k++) { const sx = x + 6 + k * 24; box(g, sx, y + 6, 20, 20, INK); box(g, sx + 1, y + 7, 18, 18, ['#1D4ED8', '#DC2626', '#F8FAFC', '#FDE047'][k]); box(g, sx - 3, y + 7, 4, 6, ['#1D4ED8', '#DC2626', '#F8FAFC', '#FDE047'][k]); box(g, sx + 19, y + 7, 4, 6, ['#1D4ED8', '#DC2626', '#F8FAFC', '#FDE047'][k]); box(g, sx + 4, y + 13, 12, 3, k === 2 ? '#1D4ED8' : '#F8FAFC'); }
    for (let k = 0; k < 3; k++) { const cx = x + 20 + k * 22, cy = y + h - 16; for (const [r, col] of [[10, INK], [9, '#DC2626'], [6, '#F8FAFC'], [3, '#2563EB']] as const) { g.fillStyle = col; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill(); } }
    const cx = x + w - 30; box(g, cx - 14, y + 8, 28, h - 12, '#1D4ED8'); box(g, cx - 14, y + 8, 28, 3, '#3B82F6'); g.fillStyle = '#0A0A10'; g.beginPath(); g.ellipse(cx, y + 20, 6, 7, 0, 0, Math.PI * 2); g.fill(); box(g, cx - 4, y + 34, 8, 8, '#FDE047');
  },
  line: (g, x, y, w, h) => {
    // (the hopefuls in a line on folding chairs, numbers pinned on, NOW SEEING over the door in there)
    const n = Math.floor((w - 20) / 22);
    for (let k = 0; k < n; k++) { const cx = x + 14 + k * 22, foot = y + h - 4; box(g, cx - 7, foot - 12, 14, 2, '#5A5A5A'); box(g, cx - 6, foot - 10, 2, 10, '#5A5A5A'); box(g, cx + 4, foot - 10, 2, 10, '#5A5A5A'); figure(g, cx, foot - 12, ['#C83A4A', '#3A6AB8', '#2A2A2A', '#E8C25A', '#8A3AB8'][(k * 3) % 5], ['#E8C0A0', '#8A5A36', '#C8946A', '#F0D0B0', '#5A3A24'][k % 5], ['#2A1A10', '#E8D890', '#1A1A1A', '#8A3A1A', '#5A3A1A'][(k * 2) % 5]); box(g, cx - 3, foot - 30, 6, 5, '#F8FAFC'); }
  },
  liquor: (g, x, y, w, h) => {
    // (bottles in rows, lit from behind; a neon COLD BEER in the corner)
    for (const sy of [y + h * 0.4, y + h * 0.72, y + h - 4]) { shelf(g, x, sy, w); for (let k = 0; k < w / 8 - 1; k++) { const bx = x + 4 + k * 8, col = ['#2A6A2A', '#8A4A1A', '#E8D8A8', '#4A1A3A', '#2A4A8A'][(((k * 7 + Math.round(sy)) % 5) + 5) % 5], hh = 12 + (k % 3) * 3; box(g, bx, sy - hh, 6, hh, col); box(g, bx + 2, sy - hh - 4, 2, 4, col); box(g, bx, sy - hh, 1, hh, mix(col, '#FFFFFF', 0.4)); } }
    signText(g, 'COLD BEER', x + w - 34, y + 14, plain(1, 1, lit() ? '#FF5A8A' : '#8A3A4A'));
  },
  tours: (g, x, y, w, h) => {
    // (a photo of the tour van, a big map, a star on the house of somebody who died in 1971)
    box(g, x + 6, y + 6, 70, 44, '#F2EAD8'); box(g, x + 10, y + 26, 50, 16, '#E8E0D0'); box(g, x + 10, y + 26, 50, 16, '#3A6AB8'); box(g, x + 12, y + 28, 10, 6, '#BFE6FF'); box(g, x + 26, y + 28, 10, 6, '#BFE6FF'); ball(g, x + 18, y + 44, 3, '#2A2A2A'); ball(g, x + 50, y + 44, 3, '#2A2A2A');
    box(g, x + 90, y + 6, w - 100, h - 14, '#E8DCB8'); for (let r = 0; r < 6; r++) box(g, x + 92, y + 12 + r * 9, w - 104, 1, '#B8AA88'); for (let k = 0; k < 6; k++) box(g, x + 96 + k * 18, y + 14 + (k % 3) * 14, 3, 3, '#C83A2A');
  },
  headshots: (g, x, y, w, h) => {
    // (a wall of headshots, every one the same smile; the stool and the lamp)
    for (let r = 0; r < 3; r++) for (let q = 0; q < Math.floor((w - 50) / 20); q++) { const hx = x + 6 + q * 20, hy = y + 6 + r * 22; box(g, hx, hy, 17, 20, '#F0F0F0'); g.fillStyle = ['#C8946A', '#8A5A36', '#E8C0A0', '#5A3A24'][(r + q) % 4]; g.beginPath(); g.arc(hx + 8, hy + 8, 4.5, 0, Math.PI * 2); g.fill(); box(g, hx + 5, hy + 10, 7, 1, '#FFFFFF'); box(g, hx + 3, hy + 14, 11, 6, '#4A4A4A'); }
    const lx = x + w - 22; box(g, lx, y + 20, 2, h - 24, '#2A2A2A'); poly(g, [[lx - 10, y + 10], [lx + 12, y + 10], [lx + 6, y + 24], [lx - 4, y + 24]], '#E8E8E8');
  },
  agents: (g, x, y, w, h) => {
    // (a desk, a phone off the hook, a stack of headshots in the bin, a framed photo of the agent with a celebrity's cutout)
    box(g, x + 10, y + h - 24, 70, 6, '#6A4A2A'); box(g, x + 10, y + h - 24, 70, 1, '#8A6A4A'); box(g, x + 14, y + h - 18, 4, 18, '#5A3A1A'); box(g, x + 72, y + h - 18, 4, 18, '#5A3A1A');
    box(g, x + 20, y + h - 30, 12, 6, '#1A1A1A'); box(g, x + 36, y + h - 32, 10, 4, '#1A1A1A');
    box(g, x + w - 40, y + h - 20, 22, 20, '#3A3A3A'); for (let k = 0; k < 4; k++) box(g, x + w - 38 + k * 4, y + h - 26 + k, 14, 8, '#F0F0F0');
    box(g, x + 100, y + 8, 34, 28, '#C8963A'); box(g, x + 103, y + 11, 28, 22, '#E8E0D0'); g.fillStyle = '#8A6A4A'; g.beginPath(); g.arc(x + 112, y + 20, 4, 0, Math.PI * 2); g.arc(x + 124, y + 20, 4, 0, Math.PI * 2); g.fill();
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The fronts, painted flat (their foot at (0, 0), x across 0..w)

/** The plywood showing: faint sheet seams, nail heads in rows, a sheet's raw edge along the top. */
export const plywood = (g: Ctx, w: number, h: number, R: string[]) => {
  for (let sx = 96; sx < w; sx += 96) { box(g, sx, -h, 1, h, R[1]); for (let y = -h + 8; y < -6; y += 16) box(g, sx + 2, y, 1, 1, R[1]); }
  box(g, 0, -h - 2, w, 2, dimmed(PLY[3])); box(g, 0, -h - 2, w, 1, dimmed(PLY[4]));
};
/** The storefront: the plate window (the hour in its glass, the gag behind it, glints), its frame, the door, a stall
 *  riser of tile; returns where the window's top is. */
const storefront = (g: Ctx, f: Front, R: string[], T: string[]) => {
  const { w } = f, glass = glassOf(), dw = 40, dx = w - dw - 22;
  const wx = 18, ww = dx - wx - 16, wh = 74, wy = -wh - 18;
  // (the window's frame, the glass in steps (the sky in it, or lit warm), what's in it, the glints)
  box(g, wx - 4, wy - 4, ww + 8, wh + 8, INK); box(g, wx - 3, wy - 3, ww + 6, wh + 6, T[3]); box(g, wx - 3, wy - 3, ww + 6, 1, T[5]); box(g, wx - 3, wy - 3, 1, wh + 6, T[4]);
  box(g, wx, wy, ww, wh, glass[1]); box(g, wx, wy, ww, Math.round(wh * 0.3), glass[2]); checker(g, wx, wy + Math.round(wh * 0.3), ww, 2, glass[2], 0, 2);
  g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
  GOODS[f.goods](g, wx + 2, wy + 2, ww - 4, wh - 4, f.rx);
  g.fillStyle = 'rgba(255,255,255,0.2)'; for (const gx of [wx + 10, wx + ww * 0.6]) { g.beginPath(); g.moveTo(gx, wy + wh); g.lineTo(gx + 12, wy + wh); g.lineTo(gx + 12 + wh * 0.6, wy); g.lineTo(gx + wh * 0.6, wy); g.fill(); }
  g.restore();
  // (the riser under it: tile, banded)
  box(g, wx - 4, -18, ww + 8, 18, INK); box(g, wx - 3, -17, ww + 6, 17, T[2]); for (let x = wx - 3; x < wx + ww + 3; x += 8) box(g, x, -17, 1, 17, T[1]); box(g, wx - 3, -17, ww + 6, 2, T[4]);
  // (the door: a frame, a glass panel, a push bar; a little OPEN sign)
  box(g, dx - 2, -78, dw + 4, 78, INK); box(g, dx - 1, -77, dw + 2, 77, T[3]); box(g, dx - 1, -77, dw + 2, 1, T[5]);
  box(g, dx + 4, -72, dw - 8, 56, glass[1]); box(g, dx + 4, -72, dw - 8, 16, glass[2]); box(g, dx + 4, -72, 2, 56, glass[4]);
  box(g, dx + 4, -40, dw - 8, 3, INK); box(g, dx + 5, -39, dw - 10, 1, T[5]);
  box(g, dx + 4, -14, dw - 8, 12, T[1]);
  box(g, dx + 8, -66, 16, 7, INK); box(g, dx + 9, -65, 14, 5, lit() ? '#FF4A6A' : '#6A2A3A');
  box(g, dx - 6, -2, dw + 12, 2, R[1]);
  return wy;
};
const upperWindows = (g: Ctx, f: Front, y0: number, y1: number, R: string[], T: string[], arched = false) => {
  const glass = glassOf(), n = Math.max(2, Math.floor((f.w - 30) / 56));
  for (let wy = y0; wy + 40 < y1; wy += 56) for (let k = 0; k < n; k++) {
    const wx = Math.round(18 + k * ((f.w - 60) / (n - 1 || 1))), ww = 26, wh = 36, on = lit() && hash(f.rx + k * 3 + wy) > 0.5;
    box(g, wx - 2, wy - 2, ww + 4, wh + 4, INK);
    if (arched) { g.fillStyle = INK; g.beginPath(); g.arc(wx + ww / 2, wy, ww / 2 + 2, Math.PI, 0); g.fill(); g.fillStyle = on ? '#E8A646' : glass[2]; g.beginPath(); g.arc(wx + ww / 2, wy, ww / 2, Math.PI, 0); g.fill(); }
    box(g, wx, wy, ww, wh, on ? '#C88A36' : glass[1]); box(g, wx, wy, ww, 10, on ? '#E8A646' : glass[2]);
    // (blinds, half down; the sill, shaded (not a ledge))
    box(g, wx, wy, ww, 8 + (hash(k + wy) * 12 | 0), on ? '#F2D088' : R[4]); for (let b = wy + 2; b < wy + 8; b += 2) box(g, wx, b, ww, 1, on ? '#D8B060' : R[3]);
    box(g, wx + ww / 2 - 1, wy, 2, wh, T[2]);
    box(g, wx - 3, wy + wh + 2, ww + 6, 3, R[1]);
    if (arched) {
      // (the iron grille over it: bars with spear tips, a rail across, a scroll at the foot)
      const S = STEEL.map(dimmed);
      for (let bx = wx + 3; bx < wx + ww - 1; bx += 5) { box(g, bx - 1, wy - 8, 3, wh + 9, INK); box(g, bx, wy - 8, 1, wh + 9, S[3]); poly(g, [[bx - 2, wy - 8], [bx, wy - 13], [bx + 2, wy - 8]], INK); box(g, bx, wy - 11, 1, 2, S[4]); }
      for (const ry of [wy + 6, wy + wh - 4]) { box(g, wx - 1, ry - 1, ww + 2, 4, INK); box(g, wx, ry, ww, 2, S[3]); box(g, wx, ry, ww, 1, S[5]); }
      for (let k = 0; k < 2; k++) { g.strokeStyle = S[3]; g.lineWidth = 1; g.beginPath(); g.arc(wx + 8 + k * 10, wy + wh - 8, 3, Math.PI * 0.2, Math.PI * 1.8); g.stroke(); }
    }
  }
};

export const paintFront = (g: Ctx, f: Front) => {
  const { w, h } = f, R = rampH(f.wall, true), T = rampH(f.trim, true);
  // The wall: stepped, its plywood showing
  box(g, -2, -h - 2, w + 4, h + 2, INK);
  if (f.style === 'brick') {
    box(g, 0, -h, w, h, R[3]);
    for (let y = -h, row = 0; y < 0; y += 6, row++) for (let x = row % 2 ? -8 : 0; x < w; x += 16) { const t = hash(x * 0.3 + y * 0.7 + f.rx); box(g, Math.max(0, x), y, Math.min(15, w - Math.max(0, x)), 5, R[t > 0.8 ? 4 : t > 0.3 ? 3 : 2]); }
    box(g, 0, -h, 4, h, R[4]); box(g, w - 6, -h, 6, h, R[1]);
    // (a ghost ad, faded, painted up the wall)
    signText(g, 'HAIR TONIC 10¢', w / 2, -h + 98, plain(1, 2, mix(R[3], '#F2E8D8', 0.35)));
  } else slab(g, 0, -h, w, h, R);
  // (stucco: light in bands down it (a step lit up top, a step shaded toward the foot, dithered between), its grain,
  // a darker water-stain run under the cap here and there, a patch skimmed over in a fresher tone)
  if (f.style !== 'brick') {
    const up = mix(R[3], R[4], 0.25), low = mix(R[3], R[2], 0.55), b1 = -h + Math.round(h * 0.3), b2 = -h + Math.round(h * 0.7);
    box(g, 5, -h + 2, w - 10, b1 + h - 2, up); checker(g, 5, b1, w - 10, 2, up, 0, 2);
    box(g, 5, b2 + 2, w - 10, -b2 - 8, low); checker(g, 5, b2, w - 10, 2, low, 0, 2);
    for (let i = 0; i < (w * h) / 180; i++) box(g, 4 + hash(f.rx + i * 1.3) * (w - 8), -h + 2 + hash(f.rx + i * 2.9) * (h - 4), 1 + (i % 2), 1, i % 3 ? R[2] : R[4]);
    for (let k = 0; k < 3; k++) { const sx = 24 + hash(f.rx * 1.9 + k) * (w - 48), len = 24 + hash(f.rx + k * 4.7) * 50; for (let y = 0; y < len; y += 2) box(g, sx + ((y >> 1) % 2), -h + 4 + y, 1, 1, y < len * 0.6 ? R[1] : R[2]); }
    if (w > 160) { const px = 30 + hash(f.rx * 3.1) * (w - 120), py = -h + 40 + hash(f.rx * 5.3) * (h * 0.3); box(g, px, py, 46, 20, mix(R[3], R[4], 0.45)); box(g, px, py, 46, 1, R[4]); box(g, px, py + 19, 46, 1, R[2]); checker(g, px, py + 1, 46, 18, R[3], 0, 3); }
  }
  plywood(g, w, h, R);
  // The style's dressing
  if (f.style === 'deco') {
    // (fluted piers up either end and the middle, a chevron band, a stepped parapet up the middle, sunbursts)
    for (const px of [0, w - 18]) { box(g, px, -h, 18, h, R[4]); for (let k = 2; k < 18; k += 4) box(g, px + k, -h, 1, h, R[2]); box(g, px + 16, -h, 2, h, R[1]); }
    for (let x = 18; x < w - 18; x += 12) { poly(g, [[x, -h + 30], [x + 6, -h + 24], [x + 12, -h + 30], [x + 12, -h + 34], [x + 6, -h + 28], [x, -h + 34]], T[3]); }
    box(g, 18, -h + 34, w - 36, 2, T[1]);
    const cw = Math.min(140, w * 0.45);
    for (let k = 0; k < 3; k++) { const sw = cw - k * 34, sx = w / 2 - sw / 2, sy = -h - 14 - k * 12; box(g, sx - 1, sy - 1, sw + 2, 14, INK); box(g, sx, sy, sw, 13, R[3]); box(g, sx, sy, sw, 2, R[4]); box(g, sx + sw - 3, sy, 3, 13, R[1]); for (let x = sx + 6; x < sx + sw - 4; x += 8) box(g, x, sy + 4, 2, 9, R[2]); }
    for (const sx of [34, w - 34]) for (let k = 0; k < 7; k++) { const a = Math.PI + (k / 6) * Math.PI; g.strokeStyle = T[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(sx, -h + 60); g.lineTo(sx + Math.cos(a) * 14, -h + 60 + Math.sin(a) * 14); g.stroke(); }
  } else if (f.style === 'mission') {
    // (the curved bell gable up the middle, barrel tile along the top on its brackets, iron grilles)
    const Rr = rampH('#B8603E', true), cw = Math.min(150, w * 0.42), cx = w / 2;
    poly(g, [[cx - cw / 2 - 2, -h], [cx - cw / 2 - 2, -h - 16], [cx - cw / 4, -h - 22], [cx - 18, -h - 44], [cx + 18, -h - 44], [cx + cw / 4, -h - 22], [cx + cw / 2 + 2, -h - 16], [cx + cw / 2 + 2, -h]], INK);
    poly(g, [[cx - cw / 2, -h], [cx - cw / 2, -h - 15], [cx - cw / 4, -h - 21], [cx - 17, -h - 42], [cx + 17, -h - 42], [cx + cw / 4, -h - 21], [cx + cw / 2, -h - 15], [cx + cw / 2, -h]], R[3]);
    poly(g, [[cx - cw / 2, -h], [cx - cw / 2, -h - 15], [cx - cw / 4, -h - 21], [cx - 17, -h - 42], [cx - 12, -h - 42], [cx - cw / 4 + 4, -h - 18], [cx - cw / 2 + 4, -h - 12], [cx - cw / 2 + 4, -h]], R[4]);
    g.fillStyle = INK; g.beginPath(); g.arc(cx, -h - 22, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = T[2]; g.beginPath(); g.arc(cx, -h - 22, 6, 0, Math.PI * 2); g.fill();
    box(g, -6, -h + 2, w + 12, 10, INK);
    for (let x = -5; x < w + 5; x += 6) { box(g, x, -h + 3, 5, 8, Rr[x % 12 === 1 ? 4 : 3]); box(g, x + 4, -h + 3, 1, 8, Rr[1]); box(g, x, -h + 3, 5, 1, Rr[5]); }
    box(g, -6, -h + 12, w + 12, 3, 'rgba(28, 16, 20, 0.35)');
    for (let x = 10; x < w - 6; x += 30) { box(g, x, -h + 12, 4, 6, R[1]); box(g, x, -h + 12, 4, 1, R[4]); }
    // (the gable's coping, lit along its top; a bell niche in it, arched, a little bell hung, shaded)
    g.strokeStyle = R[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - cw / 2, -h - 15); g.lineTo(cx - cw / 4, -h - 21); g.lineTo(cx - 17, -h - 42); g.lineTo(cx + 17, -h - 42); g.stroke();
    g.strokeStyle = R[2]; g.beginPath(); g.moveTo(cx + 17, -h - 41); g.lineTo(cx + cw / 4, -h - 20); g.lineTo(cx + cw / 2, -h - 14); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.arc(cx, -h - 26, 8, Math.PI, 0); g.fill(); box(g, cx - 8, -h - 26, 16, 12, INK);
    g.fillStyle = R[1]; g.beginPath(); g.arc(cx, -h - 26, 6, Math.PI, 0); g.fill(); box(g, cx - 6, -h - 26, 12, 10, R[1]);
    box(g, cx - 6, -h - 26, 2, 10, R[0]);
    poly(g, [[cx - 4, -h - 18], [cx - 3, -h - 26], [cx + 3, -h - 26], [cx + 4, -h - 18]], dimmed(BRASS[2])); box(g, cx - 2, -h - 25, 1, 6, dimmed(BRASS[4])); box(g, cx - 1, -h - 29, 2, 3, INK); box(g, cx - 1, -h - 18, 2, 2, dimmed(BRASS[1]));
    box(g, cx - 9, -h - 14, 18, 2, R[4]); box(g, cx - 9, -h - 12, 18, 1, R[1]);
    // (the vigas: round beam ends poking out under the tile, end grain, lit up-left, a stain run down from each)
    const VG = rampH('#7A5434', true);
    for (let x = 22; x < w - 16; x += 44) {
      const vy = -h + 26;
      for (let y = 0; y < 14; y += 2) box(g, x - 1 + ((y >> 1) & 1), vy + 5 + y, 2, 1, y < 8 ? R[1] : R[2]);
      g.fillStyle = INK; g.beginPath(); g.arc(x, vy, 6, 0, Math.PI * 2); g.fill();
      g.fillStyle = VG[2]; g.beginPath(); g.arc(x, vy, 5, 0, Math.PI * 2); g.fill();
      g.fillStyle = VG[4]; g.beginPath(); g.arc(x - 1, vy - 1, 3, 0, Math.PI * 2); g.fill();
      box(g, x - 1, vy - 1, 2, 2, VG[1]); box(g, x + 2, vy + 2, 2, 2, VG[1]); box(g, x - 3, vy - 4, 2, 1, VG[5]);
    }
    // (the plaster fallen off in patches, the adobe brick under it in courses, the edges inked and lit)
    for (let k = 0; k < 3; k++) {
      const px = 10 + Math.round(hash(f.rx * 0.7 + k * 3.1) * (w - 70)), py = -h + 44 + Math.round(hash(f.rx * 1.3 + k * 5.7) * (h - 150));
      const pw = 26 + Math.round(hash(f.rx + k * 2.3) * 22), ph = 14 + Math.round(hash(f.rx + k * 7.1) * 10);
      const A = rampH('#A8704A', true);
      poly(g, [[px, py + 4], [px + pw * 0.4, py - 1], [px + pw + 1, py + 3], [px + pw - 3, py + ph + 1], [px + pw * 0.3, py + ph + 1], [px - 1, py + ph - 4]], INK);
      poly(g, [[px + 1, py + 4], [px + pw * 0.4, py], [px + pw, py + 3], [px + pw - 4, py + ph], [px + pw * 0.3, py + ph], [px, py + ph - 4]], A[2]);
      g.save(); g.beginPath(); g.rect(px, py, pw, ph); g.clip();
      for (let by = py + 1, row = 0; by < py + ph; by += 5, row++) for (let bx = px + (row % 2 ? -6 : 0); bx < px + pw; bx += 12) { box(g, bx, by, 11, 4, A[(row + bx) % 3 === 0 ? 3 : 2]); box(g, bx, by, 11, 1, A[4]); box(g, bx, by + 4, 12, 1, A[0]); }
      g.restore();
      box(g, px + Math.round(pw * 0.4), py - 2, Math.round(pw * 0.5), 1, R[5]);
    }
  } else if (f.style === 'modern') {
    // (stone veneer up the left, a slanted sign pylon off the right, a starburst, a flat cantilevered cap)
    for (let y = -h + 4, row = 0; y < -2; y += 9, row++) for (let x = row % 2 ? 0 : 6; x < 34; x += 14) box(g, x, y, 12, 8, hash(x + y * 3 + f.rx) > 0.5 ? mix(R[3], '#C8B8A0', 0.5) : mix(R[2], '#A89880', 0.5));
    box(g, 34, -h, 2, h, R[1]);
    box(g, -8, -h - 8, w + 16, 9, INK); box(g, -7, -h - 7, w + 14, 7, T[3]); box(g, -7, -h - 7, w + 14, 2, T[4]); box(g, -7, -h - 2, w + 14, 2, T[1]);
    box(g, -7, -h + 1, w + 14, 4, 'rgba(28, 16, 20, 0.35)');
    const px = w - 16;
    poly(g, [[px - 12, -h - 50], [px + 8, -h - 62], [px + 14, -h + 40], [px - 6, -h + 52]], INK);
    poly(g, [[px - 10, -h - 48], [px + 6, -h - 58], [px + 12, -h + 38], [px - 4, -h + 48]], T[3]);
    poly(g, [[px - 10, -h - 48], [px - 5, -h - 51], [px + 1, -h + 46], [px - 4, -h + 48]], T[4]);
    for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; g.strokeStyle = k % 2 ? T[4] : '#F2D06A'; g.lineWidth = 2; g.beginPath(); g.moveTo(w * 0.62, -h + 54); g.lineTo(w * 0.62 + Math.cos(a) * (k % 2 ? 8 : 14), -h + 54 + Math.sin(a) * (k % 2 ? 8 : 14)); g.stroke(); }
  } else if (f.style === 'franchise') {
    // (the whole front hung with the franchise's banner: the team in silhouette, posed, the tagline)
    const B = rampH('#1E3A8A', true);
    box(g, 6, -h + 6, w - 12, h - 100, INK);
    for (let y = -h + 7, k = 0; y < -96; y += 8, k++) box(g, 7, y, w - 14, 8, B[[1, 2, 2, 3, 3, 2][k % 6]]);
    for (let k = 0; k < 7; k++) { const cx = 40 + k * ((w - 80) / 6), foot = -100, hh = 54 + (k % 3) * 8, col = ['#B4243A', '#3A6AB8', '#2A8A4A', '#8A3AB8', '#C8962E', '#DC2626', '#0E7490'][k]; box(g, cx - 8, foot - hh, 16, hh, mix(dimmed(col), INK, 0.2)); ball(g, cx, foot - hh - 8, 7, dimmed('#D8A880')); if (k % 2) poly(g, [[cx - 8, foot - hh + 2], [cx - 20, foot - 6], [cx - 8, foot - 10]], mix(dimmed(col), INK, 0.4)); }
    for (let x = 10; x < w - 10; x += 26) { box(g, x, -h + 2, 4, 6, STEEL[2]); }
    box(g, 6, -100, w - 12, 2, B[0]);
    for (let x = 12; x < w - 12; x += 18) poly(g, [[x, -98], [x + 9, -88], [x + 18, -98]], B[1]);
  }
  // The storefront, the floors over it
  const wy = storefront(g, f, R, T);
  if (f.style !== 'franchise') upperWindows(g, f, -h + (f.style === 'deco' ? 74 : 56), wy - 30, R, T, f.style === 'mission');
  if (f.style === 'mission') {
    // (the riser under the window in painted tile: blue and yellow, a star in each, the glaze lit, a chip or two)
    const rx0 = 15, rx1 = w - 40 - 22 - 16 + 3, TB = rampH('#2A5AA8', true), TY = rampH('#E8B83A', true), TW = rampH('#F2EAD8', true);
    g.save(); g.beginPath(); g.rect(rx0, -17, rx1 - rx0, 17); g.clip();
    for (let x = rx0, k = 0; x < rx1; x += 8, k++) for (let r = 0; r < 2; r++) {
      const ty = -17 + r * 8, alt = (k + r) % 2;
      box(g, x, ty, 8, 8, INK); box(g, x, ty, 7, 7, TW[3]);
      box(g, x + 2, ty + 2, 3, 3, alt ? TB[2] : TY[3]); box(g, x + 3, ty, 1, 7, alt ? TB[3] : TY[2]); box(g, x, ty + 3, 7, 1, alt ? TB[3] : TY[2]);
      box(g, x, ty, 7, 1, TW[5]);
      if (hash(f.rx + k * 1.7 + r) > 0.88) box(g, x + 4, ty + 4, 3, 3, mix(R[2], '#7A6A58', 0.4));
    }
    g.restore();
  }
  // (grime up the foot)
  checker(g, 0, -6, w, 4, R[1], 1, 2);
  // The boards: its name up top, the joke under it
  const nameL = f.style === 'deco' ? deco('#F2C24A', dimmed('#1C1014'), 3) : f.style === 'franchise' ? gate({ sx: 2, sy: 3 }, '#FDE047', '#1E3A8A') : f.style === 'modern' ? bulbs(2, 2, '#FFF4C8') : paint(12, '#F8F2E2', INK);
  const nw = signW(f.name, nameL);
  if (f.style === 'modern') {
    // (up the slanted pylon? the name's too long: on a box sign over the cap, its bulbs)
    const [bw] = board(g, w / 2 - 6, -h - 26, [f.name], nameL, '#2A1A2A', STEEL, 6);
    for (const sx of [w / 2 - 6 - bw / 2 + 12, w / 2 - 6 + bw / 2 - 14]) { box(g, sx - 1, -h - 14, 5, 7, INK); box(g, sx, -h - 14, 3, 7, dimmed(STEEL[3])); }
  } else if (f.style === 'deco') board(g, w / 2, -h + 14 - 14, [f.name], nameL, '#2A1A22', BRASS, 6);
  else if (f.style === 'franchise') { signText(g, f.name.split(':')[0], w / 2, -h + 40, nameL); signText(g, 'RESEMBLE', w / 2, -h + 64, gate({ sx: 1, sy: 2 }, '#F8FAFC', '#1E3A8A')); }
  else board(g, w / 2, f.style === 'mission' ? -h + 34 : -h + 20, [f.name], nameL, f.style === 'brick' ? '#2A2A2A' : '#3A2418', f.style === 'brick' ? STEEL : PLY, 6);
  void nw;
  const subL = plain(1, 1, '#2A1A1A');
  const sw = signW(f.sub, subL) + 12;
  const sy = f.style === 'franchise' ? -h + 86 : wy - 16;
  if (sw < w - 10) board(g, Math.max(sw / 2 + 6, Math.min(w - sw / 2 - 6, (w - 62) / 2 + 8)), sy, [f.sub], subL, '#F2EAD8', PLY, 5);
};

// ---------------------------------------------------------------------------------------------------------------
// What holds them up: 2x4s down to sandbags, going back toward the eye past their ends

/** A 2x4 from one point to another (screen), inked, lit along one side. */
export const two4 = (c: Ctx, x0: number, y0: number, x1: number, y1: number, w: number) => {
  c.lineCap = 'butt';
  c.strokeStyle = INK; c.lineWidth = w + 2; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  c.strokeStyle = dimmed(PLY[3]); c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  c.strokeStyle = dimmed(PLY[5]); c.lineWidth = Math.max(1, w * 0.3); c.beginPath(); c.moveTo(x0 - w * 0.25, y0 - w * 0.2); c.lineTo(x1 - w * 0.25, y1 - w * 0.2); c.stroke();
};
/** A pile of sandbags (screen), its middle-bottom at (x, y), `s` its scale. */
export const sandbags = (c: Ctx, x: number, y: number, s: number) => {
  const S = SAND.map(dimmed);
  for (const [dx, dy, w, h] of [[-12, 0, 14, 7], [1, 0, 14, 7], [-6, -6, 14, 7]] as const) {
    const bx = x + dx * s, by = y + (dy - h) * s, bw = w * s, bh = h * s;
    c.fillStyle = INK; c.beginPath(); c.ellipse(bx + bw / 2, by + bh / 2, bw / 2 + 1, bh / 2 + 1, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = S[2]; c.beginPath(); c.ellipse(bx + bw / 2, by + bh / 2, bw / 2, bh / 2, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = S[4]; c.beginPath(); c.ellipse(bx + bw / 2 - bw * 0.12, by + bh / 2 - bh * 0.18, bw * 0.3, bh * 0.22, 0, 0, Math.PI * 2); c.fill();
    box(c, bx + bw - 3 * s, by + bh * 0.3, Math.max(1, s), bh * 0.4, S[1]);
  }
};
/** The bracing round a front's two ends (x0..x1 at the play plane's x, its top `top`), and its plywood edge. */
export const bracing = (c: Ctx, eye: View['eye'], x0: number, x1: number, top: number) => {
  for (const [e, side] of [[x0, -1], [x1, 1]] as const) {
    const ex = e - side * 6;
    // (the plywood's edge: a sliver of raw sheet going back)
    const P = (y: number, d: number) => at(eye, e, y, d);
    if ((eye.x - e) * side > 1) poly(c, [P(top, FRONT_D), P(top, FRONT_D - 0.006), P(GY, FRONT_D - 0.006), P(GY, FRONT_D)], dimmed(PLY[4]));
    const B = (y: number, d: number) => at(eye, ex, y, d);
    const s = (FRONT_D + BACK_D) / 2;
    // (the long brace from up its back down to the lot behind; a short one lower; a stake and the sandbags at each foot)
    const [ax, ay] = B(top + 24, FRONT_D - 0.004), [bx, by] = B(GY, BACK_D + 0.015);
    const [cx, cy] = B(top + (GY - top) * 0.6, FRONT_D - 0.004), [dx, dy] = B(GY, FRONT_D - 0.07);
    const [hx, hy] = B(top + (GY - top) * 0.62, FRONT_D - 0.004), [kx, ky] = B(top + (GY - top) * 0.62, BACK_D + 0.04);
    two4(c, hx, hy, kx, ky, 2);
    two4(c, ax, ay, bx, by, 3 * s);
    two4(c, cx, cy, dx, dy, 3 * s);
    sandbags(c, bx, by + 1, BACK_D + 0.1); sandbags(c, dx, dy + 1, FRONT_D);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// GROWMAN'S CHINA-ISH THEATRE

const PAL = { a: 2700, b: 3450, h: 300 } as const;
const paintPalace = (g: Ctx) => {
  const w = PAL.b - PAL.a, h = PAL.h, cx = w / 2;
  const red = rampH('#B42A2A', true), coral = rampH('#C8604A', true), jade = rampH('#2E7A5A', true), gold = BRASS.map(dimmed), bronze = rampH('#7A5A3A', true);
  // The wing walls either side (curved, coral, lower), their piers
  for (const [x0, x1] of [[0, 220], [w - 220, w]] as const) {
    box(g, x0 - 2, -h * 0.62 - 2, x1 - x0 + 4, h * 0.62 + 2, INK);
    slab(g, x0, -h * 0.62, x1 - x0, h * 0.62, coral);
    for (let k = 0; k < 3; k++) { const px = x0 + 20 + k * 80; box(g, px - 1, -h * 0.62 - 26, 20, h * 0.62 + 26, INK); slab(g, px, -h * 0.62 - 24, 18, h * 0.62 + 24, red, false); box(g, px - 4, -h * 0.62 - 30, 26, 6, gold[3]); box(g, px - 4, -h * 0.62 - 30, 26, 1, gold[5]); poly(g, [[px - 2, -h * 0.62 - 30], [px + 9, -h * 0.62 - 44], [px + 20, -h * 0.62 - 30]], jade[3]); }
    // (poster cases on the wings: NOW SHOWING; one of them Steve, yellow)
    for (let k = 0; k < 2; k++) {
      const px = x0 + 41 + k * 80, py = -120, yellow = x0 > 0 && k === 1;
      box(g, px - 1, py - 1, 58, 64, INK); box(g, px, py, 56, 62, gold[2]); box(g, px + 2, py + 2, 52, 58, yellow ? dimmed(STEVE[3]) : dimmed('#1E2A6A'));
      if (yellow) { box(g, px + 19, py + 10, 18, 20, dimmed('#E2B48C')); box(g, px + 17, py + 8, 22, 6, dimmed('#8A5A2A')); box(g, px + 20, py + 17, 16, 3, INK); box(g, px + 19, py + 30, 18, 3, dimmed('#F4F0E8')); signText(g, 'STEVE', px + 28, py + 48, plain(1, 1, dimmed('#2A1408'))); }
      else { for (let q = 0; q < 4; q++) { box(g, px + 8 + q * 10, py + 16, 8, 24, dimmed(['#B4243A', '#3A6AB8', '#2A8A4A', '#C8962E'][q])); box(g, px + 9 + q * 10, py + 9, 6, 6, dimmed('#D8A880')); } signText(g, 'RESEMBLE', px + 28, py + 52, plain(1, 1, dimmed('#FDE047'))); }
    }
  }
  // The middle: the tall block, the pagoda roof in two tiers over it (jade tile, its eaves turned up, dragons on the
  // ridge ends), the columns, the doors
  const bw = 330, bx = cx - bw / 2;
  box(g, bx - 2, -h - 2, bw + 4, h + 2, INK); slab(g, bx, -h, bw, h, red);
  for (let x = bx + 10; x < bx + bw - 10; x += 22) box(g, x, -h + 40, 2, h - 120, red[2]);
  const tier = (y: number, ww: number, hh: number) => {
    const l = cx - ww / 2, r = cx + ww / 2;
    poly(g, [[l - 26, y + 4], [l - 8, y - 2], [cx - ww * 0.3, y - hh], [cx + ww * 0.3, y - hh], [r + 8, y - 2], [r + 26, y + 4], [r + 22, y + 9], [l - 22, y + 9]], INK);
    poly(g, [[l - 22, y + 3], [l - 6, y - 2], [cx - ww * 0.3, y - hh + 2], [cx, y - hh + 2], [cx, y + 6], [l - 20, y + 6]], jade[4]);
    poly(g, [[cx, y - hh + 2], [cx + ww * 0.3, y - hh + 2], [r + 6, y - 2], [r + 22, y + 3], [r + 20, y + 6], [cx, y + 6]], jade[2]);
    for (let x = l - 4; x < r + 4; x += 6) { const t = (x - (l - 4)) / (ww + 8); box(g, x, y - hh * (1 - Math.abs(t - 0.5) * 0.6) + 4, 1, hh - 4, jade[t < 0.5 ? 3 : 1]); }
    box(g, l - 20, y + 4, ww + 40, 3, gold[3]); box(g, l - 20, y + 4, ww + 40, 1, gold[5]);
    box(g, cx - ww * 0.3, y - hh, ww * 0.6, 3, jade[5]);
    // (the dragons curling up off the ridge's ends)
    for (const s of [-1, 1]) { const dx = cx + s * ww * 0.3; poly(g, [[dx, y - hh + 2], [dx + s * 6, y - hh - 10], [dx + s * 14, y - hh - 14], [dx + s * 10, y - hh - 6], [dx + s * 4, y - hh + 2]], INK); poly(g, [[dx + s * 1, y - hh + 1], [dx + s * 6, y - hh - 8], [dx + s * 12, y - hh - 12], [dx + s * 9, y - hh - 6], [dx + s * 4, y - hh + 1]], gold[3]); }
  };
  tier(-h + 40, bw + 10, 40);
  tier(-h - 8, bw * 0.62, 46);
  box(g, cx - 2, -h - 74, 4, 20, gold[2]); ball(g, cx, -h - 76, 4, '#C8962E');
  // (the two big columns, red lacquer, gold bands; the masks on them)
  for (const px of [bx + 50, bx + bw - 70]) {
    box(g, px - 1, -h + 46, 22, h - 46, INK); slab(g, px, -h + 46, 20, h - 46, red, false);
    for (const by of [-h + 60, -80, -12]) { box(g, px - 3, by, 26, 6, gold[3]); box(g, px - 3, by, 26, 1, gold[5]); box(g, px + 20, by, 3, 6, gold[1]); }
    ball(g, px + 10, -h + 110, 6, '#3A4A3A');
  }
  // (the doors: bronze, deep set, under a canopy)
  box(g, cx - 60, -110, 120, 110, INK); box(g, cx - 58, -108, 116, 108, bronze[1]);
  for (const s of [-1, 1]) { const dx = s < 0 ? cx - 56 : cx + 2; box(g, dx, -104, 54, 104, bronze[3]); box(g, dx, -104, 4, 104, bronze[4]); box(g, dx + 50, -104, 4, 104, bronze[1]); for (let y = -96; y < -8; y += 22) { box(g, dx + 8, y, 38, 16, bronze[2]); box(g, dx + 8, y, 38, 1, bronze[4]); } }
  // The name, on its own frame over the doors (lit bulbs after dark), high: clear of the marquee in front
  const L = deco('#F2C24A', '#5A1010', 3);
  const nw = signW("GROWMAN'S CHINA-ISH THEATRE", L) + 20;
  for (const px of [cx - nw / 2 + 10, cx + nw / 2 - 10]) post(g, px, -h + 66, -h + 108, 4, STEEL.map(dimmed));
  board(g, cx, -h + 84 - 10, ["GROWMAN'S CHINA-ISH THEATRE"], L, '#5A1010', BRASS.map(dimmed), 8);
  for (let x = cx - nw / 2 + 4; x < cx + nw / 2 - 2; x += 8) box(g, x, -h + 52, 2, 2, lit() ? '#FFF2C0' : gold[2]);
};

// ---------------------------------------------------------------------------------------------------------------
// THE ROOSEVELT-ISH HOTEL

const HOT = { a: 7700, b: 8720, h: 420 } as const;
const paintHotel = (g: Ctx) => {
  const w = HOT.b - HOT.a, h = HOT.h, R = rampH('#D8C6A8', true), T = rampH('#9A3A24', true), glass = glassOf();
  box(g, -2, -h - 2, w + 4, h + 2, INK);
  slab(g, 0, -h, w, h, R);
  for (let i = 0; i < (w * h) / 300; i++) box(g, hash(i * 1.3 + 7) * w, -h + hash(i * 2.9 + 3) * h, 2, 1, i % 3 ? R[2] : R[4]);
  plywood(g, w, h, R);
  // (the tower up the middle, taller, its own tile cap; the main cornice, tile, its brackets)
  const tw = 220, tx = w / 2 - tw / 2;
  box(g, tx - 2, -h - 62, tw + 4, 64, INK); slab(g, tx, -h - 60, tw, 62, R, false);
  for (const [y0, x0, ww] of [[-h - 60, tx - 8, tw + 16], [-h, -8, w + 16]] as const) {
    box(g, x0, y0 - 2, ww, 12, INK);
    for (let x = x0 + 1; x < x0 + ww - 1; x += 6) { box(g, x, y0 - 1, 5, 10, T[x % 12 === 1 ? 4 : 3]); box(g, x + 4, y0 - 1, 1, 10, T[1]); box(g, x, y0 - 1, 5, 1, T[5]); }
    box(g, x0, y0 + 10, ww, 3, 'rgba(28, 16, 20, 0.35)');
  }
  // (the windows: rows of them, arched on the top floor, some lit after dark; the belt courses between floors)
  for (let r = 0; r < 5; r++) {
    const wy = -h + 30 + r * 62;
    box(g, 0, wy - 10, w, 3, R[2]);
    for (let x = 30; x < w - 40; x += 52) {
      if (wy > -150) continue;
      const on = lit() && hash(x * 0.7 + r * 13) > 0.45, arch = r === 0;
      box(g, x - 2, wy - 2, 30, 42, INK);
      if (arch) { g.fillStyle = INK; g.beginPath(); g.arc(x + 13, wy, 15, Math.PI, 0); g.fill(); g.fillStyle = on ? '#E8A646' : glass[2]; g.beginPath(); g.arc(x + 13, wy, 13, Math.PI, 0); g.fill(); }
      box(g, x, wy, 26, 38, on ? '#C88A36' : glass[1]); box(g, x, wy, 26, 12, on ? '#E8A646' : glass[2]); box(g, x + 12, wy, 2, 38, R[1]);
      box(g, x - 3, wy + 38, 32, 3, R[1]);
    }
  }
  // (the arcade at street level: arches on piers; the lobby lit warm through them)
  for (let x = 20; x < w - 60; x += 90) {
    box(g, x - 2, -132, 74, 132, INK);
    g.fillStyle = INK; g.beginPath(); g.arc(x + 35, -96, 37, Math.PI, 0); g.fill();
    g.fillStyle = lit() ? '#B8782E' : '#3A2A2A'; g.beginPath(); g.arc(x + 35, -96, 35, Math.PI, 0); g.fill();
    box(g, x, -96, 70, 96, lit() ? '#A86A28' : '#2A1E1E');
    box(g, x + 4, -60, 62, 4, lit() ? '#E8B060' : '#3A2E2E');
    box(g, x - 8, -134, 8, 134, R[3]); box(g, x - 8, -134, 3, 134, R[4]);
  }
  // The name: up on a board over the arcade, and HOTEL on the rooftop frame over the tower (bulbs)
  board(g, w / 2, -150, ['THE ROOSEVELT-ISH HOTEL'], gate({ sx: 2, sy: 2 }, '#FEF3C7', '#1C1917'), '#2A1A1A', BRASS.map(dimmed), 8);
  const S = STEEL.map(dimmed);
  for (let x = w / 2 - 90; x <= w / 2 + 90; x += 30) { box(g, x - 1, -h - 112, 3, 52, INK); box(g, x, -h - 112, 1, 52, S[4]); }
  g.strokeStyle = S[2]; g.lineWidth = 1; g.beginPath(); for (let x = w / 2 - 90; x < w / 2 + 90; x += 30) { g.moveTo(x, -h - 62); g.lineTo(x + 30, -h - 110); } g.stroke();
  signText(g, 'HOTEL', w / 2, -h - 74, bulbs(6, 6, '#FFF4C8'));
};

// ---------------------------------------------------------------------------------------------------------------
// The arch at the start: HAPPYWOOD BLVD on two deco pylons over the pavement

const ARCH_D = 0.965;
const paintArch = (g: Ctx) => {
  const R = rampH('#E8D8B8'), T = rampH('#2E6A8A'), S = STEEL.map(c => c);
  for (const px of [20, 330]) {
    // (a stepped deco pylon: its piers, its fins, a star on top)
    box(g, px - 15, -280, 30, 280, INK); slab(g, px - 14, -278, 28, 278, R);
    for (let k = 0; k < 3; k++) { box(g, px - 18 + k * 2, -40 - k * 10, 36 - k * 4, 6, R[2 + (k % 2)]); }
    for (const fx of [px - 8, px + 4]) box(g, fx, -270, 4, 200, R[2]);
    box(g, px - 10, -300, 20, 22, INK); slab(g, px - 9, -298, 18, 20, T, false);
    ball(g, px, -306, 5, '#E8C25A');
  }
  // (the span: a steel truss between them, the sign box on it, its bulbs)
  box(g, 34, -258, 296, 6, INK); box(g, 34, -257, 296, 4, S[3]); box(g, 34, -257, 296, 1, S[5]);
  g.strokeStyle = S[2]; g.lineWidth = 2; g.beginPath(); for (let x = 34; x < 320; x += 24) { g.moveTo(x, -252); g.lineTo(x + 12, -238); g.lineTo(x + 24, -252); } g.stroke();
  box(g, 34, -240, 296, 4, INK); box(g, 34, -239, 296, 2, S[3]);
  box(g, 12, -306, 340, 52, INK); box(g, 14, -304, 336, 48, '#1E1B4B'); box(g, 14, -304, 336, 2, '#3A3680'); box(g, 14, -258, 336, 2, '#14123A');
  for (let x = 18; x < 348; x += 8) { box(g, x, -301, 2, 2, lit() ? '#FFF2C0' : '#8A7A5A'); box(g, x, -261, 2, 2, lit() ? '#FFF2C0' : '#8A7A5A'); }
  signText(g, 'HAPPYWOOD BLVD', 182, -266, bulbs(3, 3, '#FDE047'));
};

// ---------------------------------------------------------------------------------------------------------------
// Putting them down

interface Piece { x0: number; x1: number; top: number; draw: () => void }

export const drawFronts = (c: Ctx, v: View) => {
  const eye = v.eye, pieces: Piece[] = [];
  for (const f of FRONTS) {
    const x0 = X(f.rx), x1 = x0 + f.w;
    pieces.push({ x0, x1, top: GY - f.h, draw: () => atDepth(c, eye, FRONT_D, () => still(c, `front-${f.rx}`, x0, GY, -40, -f.h - 80, f.w + 80, f.h + 82, g => paintFront(g, f))) });
  }
  pieces.push({ x0: X(PAL.a), x1: X(PAL.b), top: GY - PAL.h, draw: () => atDepth(c, eye, FRONT_D, () => still(c, 'palace', X(PAL.a), GY, -40, -PAL.h - 90, PAL.b - PAL.a + 80, PAL.h + 92, paintPalace)) });
  pieces.push({ x0: X(HOT.a), x1: X(HOT.b), top: GY - HOT.h, draw: () => atDepth(c, eye, FRONT_D, () => still(c, 'hotel', X(HOT.a), GY, -20, -HOT.h - 120, HOT.b - HOT.a + 40, HOT.h + 122, paintHotel)) });
  const on = pieces.filter(p => seen(v, p.x0 - 60, p.x1 + 60, FRONT_D, 120));
  // (the farthest from the eye first: nearer ones' fronts over farther ones' bracing)
  on.sort((p, q) => Math.abs((q.x0 + q.x1) / 2 - eye.x) - Math.abs((p.x0 + p.x1) / 2 - eye.x));
  for (const p of on) { bracing(c, eye, p.x0, p.x1, p.top); p.draw(); }
};

/** The arch over the pavement at the start (stood just back from the curb). */
export const drawArch = (c: Ctx, v: View) => {
  if (!seen(v, X(-20), X(380), ARCH_D)) return;
  stillAt(c, v, ARCH_D, 'arch', X(0), GY, -10, -320, 380, 322, paintArch);
};
/** The arch's sign, the theatre's name, the hotel's: their glow points (world), for the lamps after dark. */
export const archLight = (v: View) => at(v.eye, X(182), GY - 282, ARCH_D);

void words; void timeOfDay; void mix;
