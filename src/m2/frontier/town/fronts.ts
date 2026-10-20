// Sawdust Gulch's false fronts (the final pass: peak SNES). Main street's stores stand back from the play plane at
// FRONT_D on a raised boardwalk (dimmed a step: none of it's to stand on), painted up in the park's western colors:
// stepped and bracketed parapets, the names in park-western lettering on their boards, sash windows with curtains (warm
// after dark), display windows with the gag in them (the general store's coonskin caps and rubber tomahawks, the assay
// office's gold-painted rocks, the bank's teller cage, the fudge, the bolts of calico, the barber's chair, the
// undertaker's coffins (Tucker's empty one), the bathhouse's tub and its steam), porch roofs on posts, lamps.
//
// Round their ends, going back toward the eye, what's behind them: the park's plywood ones are a sheet of ply on 2x4
// braces down to sandbags (walk past one and there it is); the real ones a clapboard box with its gable roof going back.
// Behind them all, the back lots (outhouses, barrels, a woodpile, a fence) going back.
//
// The square's bank and jail stand back the same way (their balconies, at the play plane, are ledges: drawn there, lit),
// the bleachers between, packed with guests. The rooftops' stores are at the play plane (he's on their roofs): their
// tar-paper tops going back, lit along the front, their sides going back. The livery barn and the end of the line are
// at the play plane too (art.ts, places.ts).

import type { GameState } from '../../../m1/game/core/state';
import { signText, signW, fit } from '../../signLetters';
import { burned } from '../kit';
import { GY } from '../geometry';
import {
  type Ctx, type TownView, box, checker, mix, hash, at, poly, still, stillAt, atDepth, seen, sideBack, topBack, underBack, INK, timeOfDay,
  FRONT_D, hr, hr7, back7, clapboard, batten, sash, door, western, signPaint, warmth, lampsOn, halo, PLY, PLANK, STEEL, BRASS, TAR, SHINGLE, BRICK, WEATHER, TOPLIP,
} from './paint';
import { X, Y } from './layout';

/** The boardwalk's top (the stores stand on its back edge), its front's depth. */
const WALK_H = 6, WALK_D = 0.935;
/** How far back the stores' bodies go (and their bracing comes down). */
const BACK_D = 0.8;

type Goods = 'souvenirs' | 'gold' | 'bank' | 'fudge' | 'cloth' | 'barber' | 'coffins' | 'bath' | 'jail' | 'none';
type Cornice = 'step' | 'bracket' | 'arch' | 'gable';
export interface Front {
  rx: number; w: number; h: number;
  /** Body paint, trim paint. */
  body: string; trim: string;
  /** A sheet of plywood on braces, or a clapboard building (or brick) behind it. */
  ply: boolean; brick?: boolean;
  name: string; sub?: string;
  goods: Goods; cornice: Cornice;
  /** A porch roof over the boardwalk: its stripes' color. */
  awning?: string;
  /** Upstairs windows. */
  win?: number;
}

/** Main street (and the square's two), x from the section's start. */
export const FRONTS: Front[] = [
  { rx: 920, w: 240, h: 290, body: '#A0582E', trim: '#E8D8B0', ply: false, name: 'GENERAL STORE', sub: 'SOUVENIRS', goods: 'souvenirs', cornice: 'bracket', awning: '#B91C1C', win: 3 },
  { rx: 1210, w: 200, h: 250, body: '#5A6E7E', trim: '#E8D8B0', ply: true, name: 'ASSAY OFFICE', sub: 'GOLD! (FAKE)', goods: 'gold', cornice: 'step', awning: '#1D4ED8', win: 2 },
  { rx: 1520, w: 290, h: 320, body: '#7E3220', trim: '#E8D8B0', ply: false, brick: true, name: 'BANK OF', sub: 'SAWDUST GULCH', goods: 'bank', cornice: 'arch', win: 3 },
  { rx: 1870, w: 200, h: 240, body: '#D8B860', trim: '#7A3A20', ply: true, name: 'FUDGE', sub: 'MADE DAILY (TUESDAYS)', goods: 'fudge', cornice: 'step', win: 2 },
  { rx: 2110, w: 260, h: 270, body: '#6E8460', trim: '#F2E8C8', ply: false, name: 'DRY GOODS', sub: 'CALICO. NOTIONS. MAGNETS.', goods: 'cloth', cornice: 'bracket', awning: '#15803D', win: 3 },
  { rx: 2860, w: 230, h: 260, body: '#D8C8A0', trim: '#7F1D1D', ply: true, name: 'BARBER', sub: 'SHAVES SUSPENDED', goods: 'barber', cornice: 'gable', win: 2 },
  { rx: 3200, w: 240, h: 300, body: '#3A3A3E', trim: '#C8C0A8', ply: false, name: 'UNDERTAKER', sub: 'COFFINS. ALL SIZES.', goods: 'coffins', cornice: 'arch', win: 2 },
  { rx: 3480, w: 230, h: 250, body: '#3E7A78', trim: '#F2E8C8', ply: true, name: 'BATHHOUSE', sub: 'HOT BATHS 25 CENTS', goods: 'bath', cornice: 'step', awning: '#0F766E', win: 2 },
  // (the square)
  { rx: 5990, w: 200, h: 300, body: '#7E3220', trim: '#E8D8B0', ply: false, brick: true, name: 'BANK', sub: 'EST. 2003', goods: 'bank', cornice: 'bracket', win: 2 },
  { rx: 6730, w: 210, h: 300, body: '#B89A72', trim: '#3A2A1A', ply: false, name: 'JAIL', sub: 'SHERIFF', goods: 'jail', cornice: 'step', win: 2 },
];

// ---------------------------------------------------------------------------------------------------------------
// What's in the windows (local: the window's box)

type Paint = (g: Ctx, x: number, y: number, w: number, h: number) => void;
const shelf = (g: Ctx, x: number, y: number, w: number) => { const P = hr('plank', PLANK); box(g, x, y, w, 3, P[3]); box(g, x, y, w, 1, P[5]); box(g, x, y + 3, w, 1, P[1]); };
const GOODS: Record<Goods, Paint> = {
  souvenirs: (g, x, y, w, h) => {
    // (coonskin caps on a shelf, their tails; rubber tomahawks; a plush bison; a sheriff's star on a card)
    shelf(g, x, y + h * 0.42, w);
    for (let k = 0; k < 3; k++) { const cx = x + 10 + k * 16; box(g, cx - 6, y + h * 0.42 - 8, 12, 8, INK); box(g, cx - 5, y + h * 0.42 - 7, 10, 6, '#7A5230'); box(g, cx - 5, y + h * 0.42 - 7, 10, 2, '#A07848'); for (let t = 0; t < 4; t++) box(g, cx + 5 + t, y + h * 0.42 - 6 + t * 2, 2, 2, t % 2 ? '#2A1A10' : '#C8A070'); }
    for (let k = 0; k < 2; k++) { const tx = x + w - 14 - k * 10; box(g, tx, y + 4, 2, 18, '#C83A2A'); box(g, tx - 4, y + 4, 8, 5, '#9A9AA2'); box(g, tx - 4, y + 4, 8, 1, '#D8D8E0'); }
    box(g, x + 6, y + h - 18, 22, 14, INK); box(g, x + 7, y + h - 17, 20, 12, '#5A3A20'); box(g, x + 7, y + h - 17, 20, 3, '#7A5230'); box(g, x + 22, y + h - 20, 5, 6, '#5A3A20'); box(g, x + 24, y + h - 19, 1, 1, INK);
    box(g, x + w - 24, y + h - 20, 16, 16, '#F2E8C8'); g.fillStyle = '#E8C25A'; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 2.4 : 6; g.lineTo(x + w - 16 + Math.cos(a) * r, y + h - 12 + Math.sin(a) * r); } g.closePath(); g.fill();
  },
  gold: (g, x, y, w, h) => {
    // (rocks painted gold, heaped on a scale; a pan; a jar of "nuggets")
    box(g, x + 6, y + h - 6, w - 12, 3, '#3A2A1A');
    for (let k = 0; k < 6; k++) { const rx = x + 10 + k * ((w - 20) / 6), ry = y + h - 10 - (k % 2) * 4; box(g, rx - 1, ry - 1, 9, 7, INK); box(g, rx, ry, 7, 5, '#C89A2A'); box(g, rx, ry, 3, 2, '#FFE07A'); }
    box(g, x + w / 2 - 1, y + 6, 2, h - 18, '#8A8A92'); box(g, x + w / 2 - 14, y + 8, 28, 2, '#8A8A92'); for (const sx of [-14, 12]) { box(g, x + w / 2 + sx - 4, y + 14, 10, 3, '#B8962E'); box(g, x + w / 2 + sx - 2, y + 11, 6, 3, '#FFE07A'); }
  },
  bank: (g, x, y, w, h) => {
    // (the teller's brass cage, a green-shaded lamp, the safe's dial)
    box(g, x, y + h * 0.55, w, h * 0.45, '#5A3016'); box(g, x, y + h * 0.55, w, 2, '#9A5E2E');
    for (let k = x + 3; k < x + w; k += 5) box(g, k, y + 4, 1, h * 0.55 - 4, '#C8962E');
    box(g, x, y + 4, w, 2, '#E8C25A');
    box(g, x + w - 18, y + h * 0.55 - 10, 10, 6, '#2E6A3A'); box(g, x + w - 14, y + h * 0.55 - 4, 2, 4, '#C8962E');
    g.fillStyle = '#3A3A42'; g.beginPath(); g.arc(x + 12, y + h * 0.78, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = '#C8C8D0'; g.beginPath(); g.arc(x + 12, y + h * 0.78, 3, 0, Math.PI * 2); g.fill();
  },
  fudge: (g, x, y, w, h) => {
    // (slabs of fudge on doilies, a pink box tied with string)
    for (const sy of [y + h * 0.45, y + h - 6]) { shelf(g, x, sy, w); for (let k = 0; k < 3; k++) { const fx = x + 5 + k * ((w - 10) / 3); box(g, fx - 1, sy - 4, (w - 10) / 3 - 2, 4, '#F2F0EA'); box(g, fx, sy - 9, (w - 10) / 3 - 6, 6, k % 2 ? '#5A3018' : '#8A5A30'); box(g, fx, sy - 9, (w - 10) / 3 - 6, 1, k % 2 ? '#7A4A28' : '#B07A48'); } }
    box(g, x + w - 18, y + 6, 14, 10, '#E890B0'); box(g, x + w - 12, y + 6, 1, 10, '#FFFFFF'); box(g, x + w - 18, y + 10, 14, 1, '#FFFFFF');
  },
  cloth: (g, x, y, w, h) => {
    // (bolts of calico stood up in a row, gingham, a dress form)
    for (let k = 0; k < 5; k++) { const bx = x + 4 + k * ((w - 8) / 5), bw = (w - 8) / 5 - 2, col = ['#C83A4A', '#3A6AA8', '#E8C25A', '#5A9A5A', '#9A5AA8'][k]; box(g, bx, y + 10, bw, h - 16, col); for (let yy = y + 12; yy < y + h - 6; yy += 4) box(g, bx + ((yy / 4) % 2) * 2, yy, 1, 1, '#F2F0EA'); box(g, bx, y + 10, 1, h - 16, mix(col, '#FFFFFF', 0.3)); }
    box(g, x, y + h - 6, w, 3, '#5A3A20');
  },
  barber: (g, x, y, w, h) => {
    // (the barber's chair (red leather, chrome), a mirror, combs in blue jar)
    box(g, x + 4, y + 4, w - 8, h * 0.38, '#9AB0C0'); box(g, x + 6, y + 6, 8, 3, '#D8E8F0');
    box(g, x + w / 2 - 9, y + h - 22, 18, 12, '#B91C1C'); box(g, x + w / 2 - 9, y + h - 30, 4, 12, '#B91C1C'); box(g, x + w / 2 - 2, y + h - 10, 4, 8, '#C8C8D0');
    box(g, x + w - 12, y + h * 0.5, 6, 10, '#3A6AC8'); box(g, x + w - 11, y + h * 0.5 - 5, 1, 5, '#1C1209'); box(g, x + w - 9, y + h * 0.5 - 6, 1, 6, '#1C1209');
  },
  coffins: (g, x, y, w, h) => {
    // (coffins stood up on end, pine, the lid's six sides; on the near one a card: TUCKER, and it's empty, the lid off)
    for (let k = 0; k < 2; k++) {
      const cx = x + 8 + k * (w / 2), cw = w / 2 - 12;
      g.fillStyle = INK; g.beginPath(); g.moveTo(cx + cw * 0.2, y + 4); g.lineTo(cx + cw * 0.8, y + 4); g.lineTo(cx + cw, y + h * 0.3); g.lineTo(cx + cw * 0.75, y + h - 2); g.lineTo(cx + cw * 0.25, y + h - 2); g.lineTo(cx, y + h * 0.3); g.closePath(); g.fill();
      g.fillStyle = k ? '#2A1A10' : '#8A5A30'; g.beginPath(); g.moveTo(cx + cw * 0.2 + 1, y + 5); g.lineTo(cx + cw * 0.8 - 1, y + 5); g.lineTo(cx + cw - 1, y + h * 0.3); g.lineTo(cx + cw * 0.75 - 1, y + h - 3); g.lineTo(cx + cw * 0.25 + 1, y + h - 3); g.lineTo(cx + 1, y + h * 0.3); g.closePath(); g.fill();
      if (!k) { box(g, cx + cw * 0.2, y + 8, 3, h - 14, '#B07A48'); box(g, cx + 3, y + h * 0.3, cw - 6, 1, '#5A3A1E'); }
      else { box(g, cx + cw * 0.3, y + 10, cw * 0.4, h - 20, '#120A06'); box(g, cx + 2, y + h * 0.3, 2, h * 0.5, '#5A3A1E'); }
    }
    box(g, x + w / 2 + 2, y + h * 0.22, 28, 11, INK); box(g, x + w / 2 + 3, y + h * 0.22 + 1, 26, 9, '#F2ECD8');
    signText(g, 'TUCKER', x + w / 2 + 16, y + h * 0.22 + 8, { sx: 1, sy: 1, fill: '#7F1D1D' });
  },
  bath: (g, x, y, w, h) => {
    // (a copper tub on claw feet, the steam over it, a towel on a hook, a rubber duck)
    box(g, x + 6, y + h - 22, w - 12, 14, INK); box(g, x + 7, y + h - 21, w - 14, 12, '#B87333'); box(g, x + 7, y + h - 21, w - 14, 3, '#E8A060');
    box(g, x + 10, y + h - 8, 4, 5, '#8A5A2A'); box(g, x + w - 14, y + h - 8, 4, 5, '#8A5A2A');
    for (let k = 0; k < 4; k++) { box(g, x + 12 + k * 8, y + h - 34 - (k % 2) * 6, 6, 8, '#E8EEF2'); box(g, x + 14 + k * 8, y + h - 44 - (k % 2) * 4, 4, 6, '#F8FAFC'); }
    box(g, x + w - 14, y + 6, 8, 18, '#F2F0EA'); for (let yy = y + 8; yy < y + 22; yy += 3) box(g, x + w - 14, yy, 8, 1, '#C83A4A');
    box(g, x + w / 2 + 6, y + h - 26, 6, 5, '#F2D02A'); box(g, x + w / 2 + 11, y + h - 25, 2, 1, '#E86A1A');
  },
  jail: (g, x, y, w, h) => {
    // (the cell's iron bars, a cot, a tin cup, WANTED posters)
    box(g, x, y, w, h, '#1A1410');
    box(g, x + 4, y + h - 14, w - 8, 6, '#6A5A4A'); box(g, x + 4, y + h - 14, w - 8, 2, '#9A8A7A');
    box(g, x + 8, y + 6, 14, 18, '#E8DCB0'); box(g, x + 11, y + 10, 8, 7, '#8A7A6A');
    for (let k = x + 3; k < x + w; k += 6) { box(g, k, y, 2, h, '#3A3A42'); box(g, k, y, 1, h, '#7A7A82'); }
  },
  none: () => {},
};

// ---------------------------------------------------------------------------------------------------------------
// A front (local: its left foot at (0, 0))

const paintFront = (g: Ctx, F: Front) => {
  const R = hr7(F.body), T = hr7(F.trim), top = -F.h, w = F.w;
  const warm = warmth();
  // ---- the cornice above the top
  const capH = F.cornice === 'gable' ? 46 : F.cornice === 'arch' ? 40 : 30;
  if (F.cornice === 'step') {
    box(g, 13, top - capH - 1, w - 26, capH + 2, INK); box(g, 14, top - capH, w - 28, capH, R[3]); box(g, 14, top - capH, w - 28, 2, R[5]);
    box(g, 4, top - 13, 10, 14, INK); box(g, 5, top - 12, 9, 12, R[3]); box(g, w - 14, top - 13, 10, 14, INK); box(g, w - 14, top - 12, 9, 12, R[3]);
    box(g, 12, top - capH - 4, w - 24, 4, T[3]); box(g, 12, top - capH - 4, w - 24, 1, T[5]);
  } else if (F.cornice === 'bracket') {
    box(g, -1, top - capH, w + 2, capH + 1, INK); box(g, 0, top - capH + 1, w, capH - 1, R[3]);
    box(g, -6, top - capH - 6, w + 12, 8, INK); box(g, -5, top - capH - 5, w + 10, 6, T[3]); box(g, -5, top - capH - 5, w + 10, 1, T[5]); box(g, -5, top - capH, w + 10, 1, T[1]);
    for (let bx = 6; bx < w - 6; bx += 18) { box(g, bx, top - capH + 1, 6, 10, T[2]); box(g, bx, top - capH + 1, 2, 10, T[4]); box(g, bx + 1, top - capH + 11, 4, 2, T[1]); }
  } else if (F.cornice === 'arch') {
    g.fillStyle = INK; g.beginPath(); g.moveTo(-1, top + 1); g.lineTo(-1, top - 14); g.quadraticCurveTo(w / 2, top - capH * 2 + 4, w + 1, top - 14); g.lineTo(w + 1, top + 1); g.closePath(); g.fill();
    g.fillStyle = R[3]; g.beginPath(); g.moveTo(0, top + 1); g.lineTo(0, top - 13); g.quadraticCurveTo(w / 2, top - capH * 2 + 6, w, top - 13); g.lineTo(w, top + 1); g.closePath(); g.fill();
    g.strokeStyle = T[3]; g.lineWidth = 3; g.beginPath(); g.moveTo(0, top - 13); g.quadraticCurveTo(w / 2, top - capH * 2 + 6, w, top - 13); g.stroke();
    g.strokeStyle = T[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(0, top - 15); g.quadraticCurveTo(w / 2, top - capH * 2 + 4, w, top - 15); g.stroke();
  } else {
    g.fillStyle = INK; g.beginPath(); g.moveTo(-3, top + 1); g.lineTo(w / 2, top - capH); g.lineTo(w + 3, top + 1); g.closePath(); g.fill();
    g.fillStyle = R[3]; g.beginPath(); g.moveTo(1, top); g.lineTo(w / 2, top - capH + 3); g.lineTo(w - 1, top); g.closePath(); g.fill();
    g.fillStyle = R[4]; g.beginPath(); g.moveTo(1, top); g.lineTo(w / 2, top - capH + 3); g.lineTo(w / 2, top - capH + 8); g.lineTo(8, top); g.closePath(); g.fill();
    g.strokeStyle = T[3]; g.lineWidth = 3; g.beginPath(); g.moveTo(0, top - 1); g.lineTo(w / 2, top - capH + 1); g.lineTo(w, top - 1); g.stroke();
  }
  // ---- the face: plywood board and batten, clapboard, or brick
  box(g, -1, top - 1, w + 2, F.h + 1, INK);
  if (F.brick) {
    box(g, 0, top, w, F.h, R[3]);
    for (let y = top, row = 0; y < 0; y += 6, row++) { box(g, 0, y, w, 1, R[1]); for (let x = (row % 2) * 9; x < w; x += 18) { box(g, x, y, 1, 6, R[1]); if (hash(x * 0.3 + row) > 0.8) box(g, x + 1, y + 1, 16, 5, R[2]); else if (hash(x + row * 3) > 0.9) box(g, x + 1, y + 1, 16, 5, R[4]); } box(g, 0, y + 1, w, 1, R[4]); }
  } else if (F.ply) batten(g, 0, top, w, F.h, R, 16, F.rx);
  else clapboard(g, 0, top, w, F.h, R, 9, F.rx);
  // (corner boards, a belt course between the floors)
  box(g, 0, top, 6, F.h, T[3]); box(g, 0, top, 2, F.h, T[5]); box(g, w - 6, top, 6, F.h, T[2]); box(g, w - 2, top, 2, F.h, T[1]);
  const belt = -130;
  box(g, 0, belt - 3, w, 6, T[3]); box(g, 0, belt - 3, w, 1, T[5]); box(g, 0, belt + 2, w, 1, T[1]);
  // ---- the name board in park-western letters; the line under it painted on the wall
  const bw = w - 28, bh = 26;
  box(g, 13, top + 9, bw + 2, bh + 2, INK); box(g, 14, top + 10, bw, bh, T[3]); box(g, 14, top + 10, bw, 2, T[5]); box(g, 14, top + 10 + bh - 2, bw, 2, T[1]);
  box(g, 16, top + 12, bw - 4, 1, T[2]); box(g, 16, top + bh + 7, bw - 4, 1, T[4]);
  const nameL = fit(F.name, western(2, F.body === '#3A3A3E' ? '#2A2A2E' : mix(F.body, INK, 0.25), T[1]), bw - 10);
  signText(g, F.name, w / 2, top + 10 + bh / 2 + 7 * (nameL.sy ?? 1) / 2, nameL);
  if (F.sub) { const sl = fit(F.sub, signPaint(1, F.trim, R[1]), w - 16); signText(g, F.sub, w / 2, top + bh + 26, sl); }
  // ---- upstairs: sash windows with curtains
  const n = F.win ?? 2, uy = top + bh + 40;
  if (uy + 50 < belt - 6) for (let i = 0; i < n; i++) {
    const ww = 30, cx = 18 + ((w - 36) * (i + 0.5)) / n - ww / 2;
    sash(g, cx, uy, ww, 44, T, warm, ['#B8302A', '#E8D8B0', '#3A6A9A', '#5A8A4A'][((Math.floor(i + F.rx) % 4) + 4) % 4]);
  } else {
    // (no upstairs on a short one: a louvered diamond vent where it'd be, and a painted price board either side)
    const vy = (top + bh + 34 + belt) / 2, vx = w / 2;
    g.fillStyle = INK; g.beginPath(); g.moveTo(vx, vy - 16); g.lineTo(vx + 16, vy); g.lineTo(vx, vy + 16); g.lineTo(vx - 16, vy); g.closePath(); g.fill();
    g.fillStyle = T[3]; g.beginPath(); g.moveTo(vx, vy - 14); g.lineTo(vx + 14, vy); g.lineTo(vx, vy + 14); g.lineTo(vx - 14, vy); g.closePath(); g.fill();
    for (let k = -8; k <= 8; k += 4) box(g, vx - (10 - Math.abs(k)), vy + k, (10 - Math.abs(k)) * 2, 2, R[1]);
    for (const px of [16, w - 52]) { box(g, px - 1, vy - 11, 38, 22, INK); box(g, px, vy - 10, 36, 20, mix(T[3], '#000000', 0.08)); box(g, px, vy - 10, 36, 1, T[5]); for (let k = 0; k < 3; k++) box(g, px + 4, vy - 6 + k * 5, 18 + (k * 7) % 10, 2, R[1]); }
  }
  // ---- downstairs: the door in the middle, a display window either side, the goods in them
  const dw = 46, dh = 100, dx = w / 2 - dw / 2;
  door(g, dx, -dh, dw, dh, hr('door', ['#1E0E06', '#3A1C0C', '#5A3016', '#7A4620', '#9A5E2E', '#BA7A40', '#D89A5A']));
  box(g, dx + 6, -dh + 8, dw - 12, 30, INK); g.save(); g.beginPath(); g.rect(dx + 7, -dh + 9, dw - 14, 28); g.clip(); box(g, dx + 7, -dh + 9, dw - 14, 28, mix('#2E4456', '#B07A2C', warm)); box(g, dx + 8, -dh + 10, 4, 14, mix('#7A9AB4', '#E8B05A', warm)); g.restore();
  for (const side of [-1, 1]) {
    const ww = Math.min(70, (w - dw) / 2 - 26), wx = side < 0 ? dx - 14 - ww : dx + dw + 14, wy = -104, wh = 76;
    if (ww < 24) continue;
    box(g, wx - 4, wy - 4, ww + 8, wh + 8, INK); box(g, wx - 3, wy - 3, ww + 6, wh + 6, T[3]); box(g, wx - 3, wy - 3, ww + 6, 1, T[5]);
    box(g, wx, wy, ww, wh, mix('#1A2632', '#4A2E10', warm));
    g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
    GOODS[F.goods](g, wx, wy, ww, wh);
    // (the glass over it: a glint, the reflection band)
    g.globalAlpha = 0.18; box(g, wx, wy, ww, wh * 0.3, '#C8DCEA'); g.globalAlpha = 1;
    box(g, wx + 3, wy + 3, 3, wh * 0.4, 'rgba(255, 255, 255, 0.35)'); box(g, wx + 8, wy + 3, 1, wh * 0.25, 'rgba(255, 255, 255, 0.25)');
    g.restore();
    box(g, wx - 6, wy + wh + 3, ww + 12, 4, INK); box(g, wx - 6, wy + wh + 3, ww + 12, 1, T[5]);
    // (the kickplate under it)
    box(g, wx - 3, wy + wh + 7, ww + 6, -wy - wh - 7, R[2]); box(g, wx, wy + wh + 10, ww, -wy - wh - 14, R[1]); box(g, wx, wy + wh + 10, ww, 1, R[4]);
  }
  // ---- a lamp on a bracket by the door (lit after dark)
  const lx = dx + dw + 6, ly = -dh - 14;
  box(g, lx, ly + 4, 8, 2, INK); box(g, lx + 6, ly, 7, 10, INK); box(g, lx + 7, ly + 1, 5, 8, lampsOn() ? '#FFE8A0' : '#C8B890'); box(g, lx + 7, ly + 1, 2, 8, lampsOn() ? '#FFF8D8' : '#E8DCC0'); box(g, lx + 5, ly - 2, 9, 3, BRASS[2]);
  // ---- weathering: grime up from the foot, a drip or two under the sills
  checker(g, 0, -10, w, 10, R[1], 0); box(g, 0, -3, w, 3, R[1]);
  for (let k = 0; k < 4; k++) { const sx = 20 + hash(F.rx + k) * (w - 40); box(g, sx, belt + 3, 1, 6 + hash(k + F.rx) * 10, R[2]); }
};

/** The boardwalk in front of a front: its planks' top going back (lit at its front edge), the front face of it, the
 *  porch roof on posts (dimmed, sloped: not a platform). */
const drawWalk = (c: Ctx, v: TownView, F: Front) => {
  const xa = X(F.rx) - 10, xb = X(F.rx) + F.w + 10, y = GY - WALK_H, eye = v.eye;
  const P = back7('#8A5E34', 0.1);
  // (the top going back: planks laid along, gaps between)
  if (eye.y < y - 1) {
    for (let i = 0; i < 4; i++) { const d0 = WALK_D - ((WALK_D - FRONT_D) * i) / 4, d1 = WALK_D - ((WALK_D - FRONT_D) * (i + 1)) / 4; poly(c, [at(eye, xa, y, d0), at(eye, xb, y, d0), at(eye, xb, y, d1), at(eye, xa, y, d1)], [P[4], P[3], P[4], P[3]][i]); }
    const [ax, ay] = at(eye, xa, y, WALK_D), [bx] = at(eye, xb, y, WALK_D);
    box(c, ax, ay, bx - ax, 1, P[5]);
  }
  // (its front face: the edge board, the joists' ends)
  const [fa, fy] = at(eye, xa, y, WALK_D), [fb, fby] = at(eye, xb, GY, WALK_D);
  box(c, fa, fy, fb - fa, fby - fy, P[2]); box(c, fa, fy, fb - fa, 1, P[5]);
  for (let x = xa + 8; x < xb; x += 30) { const [jx, jy] = at(eye, x, y + 2, WALK_D); box(c, jx, jy, 3, 2, P[1]); }
  // (the porch roof: posts at the front, the roof sloping down to them, striped; its underside)
  if (F.awning) {
    const top = GY - 156, front = GY - 140, S = back7(F.awning, 0.12), W = back7('#E7E5E4', 0.12);
    underBack(c, eye, xa, xb, front, WALK_D, FRONT_D, [P[1], P[2], P[2]]);
    for (const px of [xa + 4, (xa + xb) / 2, xb - 4]) { const [x0, t0] = at(eye, px, front, WALK_D), [, b0] = at(eye, px, y, WALK_D); box(c, x0 - 3, t0, 6, b0 - t0, INK); box(c, x0 - 2, t0, 4, b0 - t0, P[3]); box(c, x0 - 2, t0, 1, b0 - t0, P[5]); }
    const [a0, ya0] = at(eye, xa - 4, front, WALK_D), [b0] = at(eye, xb + 4, front, WALK_D), [, ya1] = at(eye, xa - 4, top, FRONT_D);
    const n = Math.max(4, Math.round((b0 - a0) / 14));
    for (let k = 0; k < n; k++) { const x0 = a0 + ((b0 - a0) * k) / n, x1 = a0 + ((b0 - a0) * (k + 1)) / n; poly(c, [[x0, ya0], [x1, ya0], [x1, ya1], [x0, ya1]], k % 2 ? S[3] : W[3]); box(c, x0, ya0 - 2, x1 - x0, 2, k % 2 ? S[2] : W[2]); }
    box(c, a0, ya1, b0 - a0, 1, S[5]); box(c, a0, ya0, b0 - a0, 2, INK);
    // (the valance's scallops)
    for (let x = a0; x < b0; x += 8) { c.fillStyle = INK; c.beginPath(); c.arc(x + 4, ya0 + 1, 4, 0, Math.PI); c.fill(); c.fillStyle = ((x - a0) / 8) % 2 < 1 ? S[3] : W[3]; c.beginPath(); c.arc(x + 4, ya0 + 1, 3, 0, Math.PI); c.fill(); }
  }
};

/** Round a front's ends, going back: a plywood one's 2x4 braces down to sandbags; a real one's side wall and roof. */
const drawBehind = (c: Ctx, v: TownView, F: Front) => {
  const xa = X(F.rx), xb = X(F.rx) + F.w, top = GY - F.h, eye = v.eye;
  if (F.ply) {
    const P = back7(PLY[3], 0.1), Pd = back7(PLY[1], 0.1), SB = back7('#8A7A5A', 0.1);
    for (const e of [xa + 6, xb - 6]) {
      // (a stud up its back, two braces down to the ground behind, a rail across, a sandbag on each foot)
      const s0 = at(eye, e, top + 20, FRONT_D - 0.005), s1 = at(eye, e, GY, FRONT_D - 0.005);
      box(c, s0[0] - 2, s0[1], 4, s1[1] - s0[1], Pd[3]);
      for (const [hy, d1] of [[top + 30, BACK_D], [top + F.h * 0.55, BACK_D + 0.05]] as const) {
        const p0 = at(eye, e, hy, FRONT_D - 0.005), p1 = at(eye, e, GY, d1);
        c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke();
        c.strokeStyle = P[3]; c.lineWidth = 3; c.stroke();
        c.strokeStyle = P[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(p0[0], p0[1] - 1); c.lineTo(p1[0], p1[1] - 1); c.stroke();
        box(c, p1[0] - 8, p1[1] - 5, 16, 5, INK); box(c, p1[0] - 7, p1[1] - 4, 14, 4, SB[3]); box(c, p1[0] - 7, p1[1] - 4, 14, 1, SB[5]); box(c, p1[0], p1[1] - 4, 1, 4, SB[1]);
      }
      const r0 = at(eye, e, top + F.h * 0.5, FRONT_D - 0.005), r1 = at(eye, e, top + F.h * 0.5 + 10, BACK_D + 0.04);
      c.strokeStyle = Pd[3]; c.lineWidth = 3; c.beginPath(); c.moveTo(r0[0], r0[1]); c.lineTo(r1[0], r1[1]); c.stroke();
    }
  } else {
    // (the building behind: its side wall in clapboard (or brick) going back, a window in it; the gable roof's slope)
    const bodyTop = top + 70, R = back7(F.body, 0.08), Sh = back7(SHINGLE[3], 0.1);
    for (const [e, side] of [[xa + 2, -1], [xb - 2, 1]] as const) {
      if (!sideBack(c, eye, e, side, bodyTop, GY, FRONT_D, BACK_D, R, 4)) continue;
      // (the clapboard's laps going back)
      for (let y = bodyTop + 9; y < GY; y += 9) { const [p0x, p0y] = at(eye, e, y, FRONT_D), [p1x, p1y] = at(eye, e, y, BACK_D); c.strokeStyle = R[1]; c.lineWidth = 1; c.beginPath(); c.moveTo(p0x, p0y); c.lineTo(p1x, p1y); c.stroke(); }
      // (a window in it)
      const wd0 = FRONT_D - 0.035, wd1 = FRONT_D - 0.065, wt = GY - 120, wb = GY - 70;
      poly(c, [at(eye, e, wt, wd0), at(eye, e, wt, wd1), at(eye, e, wb, wd1), at(eye, e, wb, wd0)], INK);
      poly(c, [at(eye, e, wt + 3, wd0 - 0.004), at(eye, e, wt + 3, wd1 + 0.004), at(eye, e, wb - 3, wd1 + 0.004), at(eye, e, wb - 3, wd0 - 0.004)], mix('#2E4456', '#B07A2C', warmth()));
      // (the roof: from the eave along the side wall up toward the ridge, going back)
      const mid = (xa + xb) / 2, ridge = bodyTop - 46;
      poly(c, [at(eye, e, bodyTop, FRONT_D), at(eye, e, bodyTop, BACK_D), at(eye, mid, ridge, BACK_D), at(eye, mid, ridge, FRONT_D)], Sh[3]);
      for (let k = 1; k < 5; k++) { const ex = e + (mid - e) * (k / 5), ey = bodyTop + (ridge - bodyTop) * (k / 5); const [q0x, q0y] = at(eye, ex, ey, FRONT_D), [q1x, q1y] = at(eye, ex, ey, BACK_D); c.strokeStyle = Sh[1]; c.lineWidth = 1; c.beginPath(); c.moveTo(q0x, q0y); c.lineTo(q1x, q1y); c.stroke(); }
      const [e0x, e0y] = at(eye, e, bodyTop, FRONT_D), [e1x, e1y] = at(eye, e, bodyTop, BACK_D);
      c.strokeStyle = Sh[5]; c.lineWidth = 2; c.beginPath(); c.moveTo(e0x, e0y); c.lineTo(e1x, e1y); c.stroke();
      // (a stovepipe out of the roof, on one side)
      if (side === 1) { const [px, py] = at(eye, e - 30, bodyTop - 14, BACK_D + 0.04); box(c, px - 3, py - 22, 6, 24, INK); box(c, px - 2, py - 22, 4, 24, back7(STEEL[3])[3]); box(c, px - 4, py - 24, 8, 3, back7(STEEL[2])[3]); }
    }
  }
};

/** The barber's pole (by the barber's door, turning). */
const drawPole = (c: Ctx, v: TownView, f: number) => {
  atDepth(c, v.eye, FRONT_D, () => {
    const x = X(3010), top = GY - 172;
    box(c, x - 1, top - 1, 18, 82, INK); box(c, x, top + 8, 16, 66, '#F5F5F4');
    c.save(); c.beginPath(); c.rect(x + 1, top + 8, 14, 66); c.clip();
    for (let k = -2; k < 10; k++) { const y = top + 8 + ((k * 12 + f * 0.5) % 96); c.fillStyle = k % 2 ? '#DC2626' : '#1D4ED8'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 16, y - 8); c.lineTo(x + 16, y - 2); c.lineTo(x, y + 6); c.closePath(); c.fill(); }
    c.restore();
    box(c, x + 1, top + 8, 3, 66, 'rgba(255, 255, 255, 0.35)'); box(c, x + 12, top + 8, 3, 66, 'rgba(0, 0, 0, 0.2)');
    for (const y of [top, top + 74]) { box(c, x - 2, y, 20, 8, INK); box(c, x - 1, y + 1, 18, 6, BRASS[3]); box(c, x - 1, y + 1, 18, 2, BRASS[5]); }
    c.fillStyle = INK; c.beginPath(); c.arc(x + 8, top - 2, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = BRASS[4]; c.beginPath(); c.arc(x + 8, top - 2, 5, 0, Math.PI * 2); c.fill();
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The back lots (going back between the fronts): outhouses, barrels, a woodpile, a fence

const LOTS: [number, 'outhouse' | 'barrels' | 'wood' | 'fence' | 'pump', number][] = [
  [1180, 'barrels', 0.84], [1440, 'outhouse', 0.82], [2085, 'wood', 0.84], [2420, 'fence', 0.83], [2600, 'pump', 0.86], [3150, 'outhouse', 0.82],
  [3460, 'barrels', 0.85], [3740, 'fence', 0.83], [6215, 'wood', 0.84], [6650, 'barrels', 0.84],
];
const paintLot = (g: Ctx, k: string) => {
  const W = back7(WEATHER[3], 0.1), P = back7(PLANK[3], 0.1), S = back7(STEEL[3], 0.1);
  if (k === 'outhouse') {
    box(g, -17, -80, 34, 80, INK); box(g, -16, -78, 32, 78, W[3]); for (let x = -14; x < 16; x += 6) box(g, x, -78, 1, 78, W[1]);
    g.fillStyle = INK; g.beginPath(); g.moveTo(-21, -78); g.lineTo(0, -92); g.lineTo(21, -78); g.closePath(); g.fill();
    g.fillStyle = W[2]; g.beginPath(); g.moveTo(-18, -79); g.lineTo(0, -89); g.lineTo(18, -79); g.closePath(); g.fill();
    g.fillStyle = INK; g.beginPath(); g.arc(0, -62, 5, -0.6, Math.PI + 0.6); g.fill(); g.fillStyle = W[3]; g.beginPath(); g.arc(2, -63, 4, -0.6, Math.PI + 0.6); g.fill();
    box(g, 9, -42, 3, 3, S[4]);
  } else if (k === 'barrels') {
    for (const [bx, by] of [[-16, 0], [12, 0], [-2, -30]] as const) { box(g, bx - 13, by - 30, 26, 30, INK); box(g, bx - 12, by - 29, 24, 28, P[3]); box(g, bx - 12, by - 29, 6, 28, P[4]); box(g, bx + 6, by - 29, 6, 28, P[2]); for (const hy of [by - 25, by - 6]) box(g, bx - 12, hy, 24, 2, S[2]); }
  } else if (k === 'wood') {
    for (let r = 0; r < 4; r++) for (let i = 0; i < 6 - r; i++) { const cx = -36 + r * 6 + i * 12, cy = -6 - r * 11; g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, 6.5, 0, Math.PI * 2); g.fill(); g.fillStyle = P[4]; g.beginPath(); g.arc(cx, cy, 5.5, 0, Math.PI * 2); g.fill(); g.fillStyle = P[2]; g.beginPath(); g.arc(cx, cy, 2.5, 0, Math.PI * 2); g.fill(); }
    box(g, 30, -40, 3, 40, P[2]); box(g, 28, -42, 8, 4, S[3]);
  } else if (k === 'fence') {
    for (let x = -60; x <= 60; x += 6) { const h = 40 + ((x * 7) & 3); box(g, x - 1, -h - 1, 6, h + 1, INK); box(g, x, -h, 4, h, W[3]); box(g, x, -h, 1, h, W[5]); }
    box(g, -62, -32, 126, 3, W[1]); box(g, -62, -14, 126, 3, W[1]);
  } else {
    box(g, -6, -46, 12, 46, INK); box(g, -5, -45, 10, 45, S[3]); box(g, -5, -45, 3, 45, S[5]);
    box(g, 4, -36, 16, 4, INK); box(g, 5, -35, 14, 2, S[4]); box(g, -4, -54, 4, 10, S[2]); box(g, -2, -60, 22, 3, S[2]);
    box(g, -18, -10, 36, 10, INK); box(g, -17, -9, 34, 9, P[3]); box(g, -16, -8, 32, 3, '#3A6A8A');
  }
};

// ---------------------------------------------------------------------------------------------------------------

/** The street's stores, back from the play plane: the back lots behind, their bracing or bodies round their ends, the
 *  fronts, the boardwalks and porch roofs, the barber's pole. */
export const drawFronts = (c: Ctx, state: GameState, v: TownView) => {
  // (the back lots, deepest first)
  for (const [rx, k, d] of [...LOTS].sort((p, q) => p[2] - q[2])) {
    const x = X(rx);
    if (!seen(v, x - 70, x + 70, d)) continue;
    stillAt(c, v, d, `lot-${k}`, x, GY, -70, -96, 140, 98, g => paintLot(g, k));
  }
  for (const F of FRONTS) {
    const xa = X(F.rx);
    if (!seen(v, xa - 60, xa + F.w + 60, FRONT_D, 120)) continue;
    drawBehind(c, v, F);
  }
  for (const F of FRONTS) {
    const xa = X(F.rx);
    if (!seen(v, xa - 60, xa + F.w + 60, FRONT_D)) continue;
    stillAt(c, v, FRONT_D, `front-${F.rx}`, xa, GY - WALK_H, -14, -F.h - 96, F.w + 28, F.h + 98, g => paintFront(g, F));
    drawWalk(c, v, F);
  }
  if (seen(v, X(2990), X(3040), FRONT_D)) drawPole(c, v, state.frame);
};

/** A balcony at the play plane (a ledge: its planked floor going back to the front behind, its lit lip, its rail on
 *  turned balusters, the posts down to the street holding it up). */
export const drawBalcony = (c: Ctx, v: TownView, a: number, b: number, h: number) => {
  const xa = X(a), xb = X(b), y = Y(h), eye = v.eye;
  const P = hr7('#7A5230'), L = hr('lip', TOPLIP);
  // (its floor going back to the building)
  topBack(c, eye, xa, xb, y, 1, FRONT_D, [P[1], P[2], P[3], P[4], P[5]], 3);
  underBack(c, eye, xa, xb, y + 10, 1, FRONT_D, [P[0], P[1], P[1]]);
  // (the posts down to the street)
  for (const px of [xa + 6, xb - 6]) { box(c, px - 5, y + 10, 10, GY - y - 10, INK); box(c, px - 4, y + 10, 8, GY - y - 10, P[3]); box(c, px - 4, y + 10, 2, GY - y - 10, P[5]); box(c, px + 2, y + 10, 2, GY - y - 10, P[1]); box(c, px - 7, GY - 6, 14, 6, P[2]); }
  // (the fascia, the lit lip)
  box(c, xa - 4, y - 1, xb - xa + 8, 12, INK); box(c, xa - 3, y, xb - xa + 6, 10, P[3]); box(c, xa - 3, y + 8, xb - xa + 6, 2, P[1]);
  box(c, xa - 3, y, xb - xa + 6, 1, L[3]); box(c, xa - 3, y + 1, xb - xa + 6, 1, L[2]); box(c, xa - 3, y + 2, xb - xa + 6, 1, L[1]);
  // (the rail: turned balusters, the handrail lit)
  for (let x = xa + 2; x < xb - 2; x += 14) { box(c, x - 1, y - 34, 5, 34, INK); box(c, x, y - 33, 3, 33, P[4]); box(c, x, y - 20, 3, 4, P[2]); box(c, x - 1, y - 12, 5, 3, P[3]); }
  box(c, xa - 3, y - 38, xb - xa + 6, 6, INK); box(c, xa - 2, y - 37, xb - xa + 4, 4, P[3]); box(c, xa - 2, y - 37, xb - xa + 4, 1, P[5]);
};

// ---------------------------------------------------------------------------------------------------------------
// The rooftops' stores (at the play plane: he's up on their roofs)

const STORES: [number, number, number, string, string, string][] = [
  [5000, 5250, 190, '#8A4A3A', 'HOTEL', 'ROOMS 2 BITS'],
  [5330, 5560, 280, '#4A6A5A', 'OPERA HOUSE', 'TONIGHT: NOBODY'],
  [5640, 5850, 200, '#9A7A4A', 'POST OFFICE', 'PONY EXPRESS (LATE)'],
];
export const drawStores = (c: Ctx, state: GameState, v: TownView) => {
  const eye = v.eye;
  // (every store's sides and roof going back first, then the fronts over them: a side going back is behind the play
  // plane, so the next store's front covers it (it used to be drawn over the store before's front); and none of it
  // past the saloon's front at the left or the showdown's gate at the right, both nearer)
  c.save(); c.beginPath(); c.rect(X(4900), v.top - 200, X(5941) - X(4900), v.bot - v.top + 400); c.clip();
  for (const [a, b, h, col] of STORES) {
    const xa = X(a), xb = X(b), top = Y(h);
    if (!seen(v, xa - 80, xb + 80)) continue;
    const R = hr7(col), Tr = hr('tar', TAR);
    // (its sides going back, its roof going back (tar paper, lit at the front), a chimney back there)
    sideBack(c, eye, xa, -1, top, GY, 1, 0.84, R, 4);
    sideBack(c, eye, xb, 1, top, GY, 1, 0.84, R, 4);
    topBack(c, eye, xa, xb, top, 1, 0.84, [Tr[1], Tr[2], Tr[3], Tr[3], Tr[4]], 4);
    if (eye.y < top - 1) {
      for (let k = 1; k < 4; k++) { const d = 1 - 0.16 * (k / 4), [p0, py] = at(eye, xa, top, d), [p1] = at(eye, xb, top, d); box(c, p0, py, p1 - p0, 1, Tr[1]); }
      const [cx, cy] = at(eye, xa + (xb - xa) * 0.75, top, 0.88);
      box(c, cx - 9, cy - 30, 18, 30, INK); box(c, cx - 8, cy - 29, 16, 29, hr('brick', BRICK)[3]); box(c, cx - 8, cy - 29, 4, 29, hr('brick', BRICK)[4]); for (let y = cy - 26; y < cy; y += 5) box(c, cx - 8, y, 16, 1, hr('brick', BRICK)[1]); box(c, cx - 10, cy - 32, 20, 4, hr('brick', BRICK)[2]);
    }
  }
  c.restore();
  for (const [a, b, h, col, name, sub] of STORES) {
    const xa = X(a), xb = X(b), top = Y(h);
    if (!seen(v, xa - 80, xb + 80)) continue;
    const R = hr7(col), T = hr7('#E8D8B0'), Tr = hr('tar', TAR);
    still(c, `store-${a}`, xa, GY, -8, top - GY - 10, xb - xa + 16, GY - top + 12, g => {
      const w = xb - xa, t = top - GY;
      box(g, -1, t - 1, w + 2, -t + 1, INK);
      clapboard(g, 0, t, w, -t, R, 9, a);
      box(g, 0, t, 6, -t, T[3]); box(g, w - 6, t, 6, -t, T[2]);
      // (the name board, the line under it)
      const bw = w - 40;
      box(g, 19, t + 14, bw + 2, 26, INK); box(g, 20, t + 15, bw, 24, T[3]); box(g, 20, t + 15, bw, 2, T[5]); box(g, 20, t + 37, bw, 2, T[1]);
      const L = fit(name, western(2, mix(col, INK, 0.3), T[1]), bw - 10);
      signText(g, name, w / 2, t + 27 + 7 * (L.sy ?? 1) / 2, L);
      signText(g, sub, w / 2, t + 54, fit(sub, signPaint(1, '#E8D8B0', R[1]), w - 20));
      // (windows, if there's room above the door)
      for (let i = 0; i < 3; i++) { const wx = 26 + i * ((w - 52) / 3) + ((w - 52) / 3 - 30) / 2, wy = t + 66; if (wy + 46 < -126) sash(g, wx, wy, 30, 44, T, warmth(), ['#B8302A', '#3A6A9A', '#E8D8B0'][i]); }
      door(g, w / 2 - 24, -102, 48, 102, hr('door', ['#1E0E06', '#3A1C0C', '#5A3016', '#7A4620', '#9A5E2E', '#BA7A40', '#D89A5A']));
      checker(g, 0, -10, w, 10, R[1], 0);
      // (the roof's edge: the tar paper's lip lit (he stands on it))
      box(g, -5, t - 5, w + 10, 7, INK); box(g, -4, t - 4, w + 8, 5, Tr[3]);
      const Lp = hr('lip', TOPLIP); box(g, -4, t - 4, w + 8, 1, Lp[3]); box(g, -4, t - 3, w + 8, 1, Lp[2]); box(g, -4, t - 2, w + 8, 1, Lp[1]);
    });
  }
  void state; void burned; void signW; void PLY; void timeOfDay; void halo;
};
