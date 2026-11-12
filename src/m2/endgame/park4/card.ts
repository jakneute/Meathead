// Ned's title cards (park4/refight.ts's intro, before each sinner's refight): Ned the MC presenting the act. The sin's
// word slammed on in its own lettering, the sinner's gross-up in a frame (stitched up the way he died: the refight's
// look), his punishment's hell behind it all, Ned's own gross-up in the corner doing the talking, the place's name under
// the sin. His words go in the box at the bottom (refight.ts), only while they're said. Painted once where it can be
// (the sin's word, the backdrops); the portraits are the lands' own gross-ups (painted once, ahead, by grossKit).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../../../m1/constants';
import { signText, type Look } from '../../signLetters';
import { drawArtieGross } from '../../adventure/river/artieGross';
import { drawDonnieGross } from '../../spooky/donnieGross';
import { drawSteveGross } from '../../hollywood/stunt/steveGross';
import { drawHarryGross } from '../../foreign/harry/harryGross';
import { drawTuckerGross } from '../../frontier/tuckerGross';
import { drawGrossUp as drawPiperGross } from '../../fantasy/piperGross';
import { drawDadGross } from '../../cartoon/amphi/dadGross';
import { drawNedGross } from './nedGross';
import { placeSky } from './hell';
import { adventureSky } from './place/adventure';
import { FANTASY_HOOKS } from './place/fantasy';
import { seam, staple, patch, holeX, blot, drip } from './looks';
import type { RefightDef, Sin } from './defs';

type Ctx = CanvasRenderingContext2D;
const INK = '#0A0608';

const cache = new Map<string, HTMLCanvasElement>();
const bake = (key: string, w: number, h: number, paint: (g: Ctx) => void) => {
  let cv = cache.get(key);
  if (!cv) { cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d')!; g.imageSmoothingEnabled = false; paint(g); cache.set(key, cv); }
  return cv;
};

// ---------------------------------------------------------------------------------------------------------------
// The sin's word, in its own lettering (painted once each)

const SIN_FILL: Record<Sin, { fill: string[]; ink: string; extra?: (g: Ctx, w: number, h: number) => void }> = {
  PRIDE: { fill: ['#FFF4B0', '#F2C84A', '#C8901C', '#8A5A0C'], ink: '#2A1604', extra: (g, w) => { for (const x of [w * 0.2, w * 0.55, w * 0.85]) { g.fillStyle = '#FFFFFF'; g.fillRect(x, 6, 2, 8); g.fillRect(x - 3, 9, 8, 2); } } },
  GLUTTONY: { fill: ['#E0F07A', '#A8C83A', '#6A8A1E', '#3A5210'], ink: '#14200A', extra: (g, w, h) => { for (let k = 0; k < 9; k++) { const x = 10 + k * (w - 20) / 8, l = 6 + (k * 7) % 14; g.fillStyle = '#6A8A1E'; g.fillRect(x, h - 14, 4, l); g.fillRect(x - 1, h - 14 + l, 6, 4); } } },
  ENVY: { fill: ['#C8FFD0', '#4CC466', '#229040', '#0C3A18'], ink: '#041408' },
  WRATH: { fill: ['#FFD0B0', '#FF6A3A', '#C81E1E', '#6A0606'], ink: '#200202', extra: (g, w, h) => { g.strokeStyle = '#200202'; g.lineWidth = 2; for (let k = 0; k < 4; k++) { const x = 20 + k * (w - 40) / 3; g.beginPath(); g.moveTo(x, 8); g.lineTo(x + 6, h * 0.4); g.lineTo(x - 2, h * 0.6); g.lineTo(x + 4, h - 10); g.stroke(); } } },
  GREED: { fill: ['#FFF0A0', '#E8C03A', '#B08A14', '#5A4206'], ink: '#201604', extra: (g, w, h) => { for (let k = 0; k < 7; k++) { const x = 8 + k * (w - 16) / 6, y = h - 8 - (k % 2) * 3; g.fillStyle = '#5A4206'; g.beginPath(); g.ellipse(x, y, 6, 3, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#E8C03A'; g.beginPath(); g.ellipse(x, y - 1, 5, 2, 0, 0, Math.PI * 2); g.fill(); } } },
  LUST: { fill: ['#FFD0E8', '#FF6AA8', '#C8206A', '#5A0A2E'], ink: '#200410', extra: (g, w) => { for (const x of [8, w - 16]) { g.fillStyle = '#C8206A'; g.beginPath(); g.arc(x, 10, 4, 0, Math.PI * 2); g.arc(x + 7, 10, 4, 0, Math.PI * 2); g.moveTo(x - 4, 11); g.lineTo(x + 3.5, 20); g.lineTo(x + 11, 11); g.fill(); } } },
  SLOTH: { fill: ['#D0D8EE', '#8090AA', '#4A5672', '#242C3E'], ink: '#0A0E16', extra: (g, w, h) => { g.fillStyle = 'rgba(10,14,22,0.35)'; for (let y = 0; y < h; y += 3) g.fillRect(0, y, w, 1); } },
  ROBOT: { fill: ['#D2FFD8', '#7CF08C', '#2CC24E', '#0E3A1A'], ink: '#020A04' },
};
const SW = 300, SH = 64;
const sinWord = (sin: Sin) => bake(`rf4-card-sin-${sin}`, SW, SH, g => {
  const S = SIN_FILL[sin], n = sin.length, sx = Math.min(6, Math.floor((SW - 20) / (n * 6)));
  const L: Look = { sx, sy: sin === 'SLOTH' ? 6 : 7, fill: S.fill, dither: true, ink: S.ink, shadow: '#000000', drop: 3, gap: 1, bold: sin === 'WRATH' || sin === 'GREED', slant: sin === 'LUST' ? 1 : sin === 'SLOTH' ? -1 : 0 };
  signText(g, sin, SW / 2, SH - 12 + (sin === 'SLOTH' ? 4 : 0), L);
  S.extra?.(g, SW, SH);
});

// ---------------------------------------------------------------------------------------------------------------
// The backdrop: the punishment's own hell (its place's sky; the jungle's drawn its own way; the bedroom's out its window)

const backdrop = (c: Ctx, def: RefightDef, state: GameState) => {
  if (def.land === 'adventure') { adventureSky(c, 430, 0.3, state); return; }
  if (def.land === 'fantasy') { c.drawImage(bake('rf4-card-fa', W, H, g => FANTASY_HOOKS.view(g, 0, W, 0, H, 430)), 0, 0); return; }
  const sky = def.place ? placeSky(def.land, def.place) : null;
  if (sky) c.drawImage(sky, 0, 0); else { c.fillStyle = '#1A0206'; c.fillRect(0, 0, W, H); }
};

// ---------------------------------------------------------------------------------------------------------------
// The sinner's portrait (the land's own gross-up, in a frame) and how he died, sewn on over it

/** The frame on the card: its middle, half width and height. */
const PF = { x: 572, y: 236, w: 196, h: 160 };
const PORTRAIT: Record<string, { draw: (c: Ctx, cx: number, cy: number, f: number) => void; face: [number, number, number, number] }> = {
  // (face: the face's box in the frame, x, y, w, h from the frame's middle: where the look's sewn on)
  adventure: { draw: (c, x, y, f) => drawArtieGross(c, x, y, 0.5, f), face: [-90, -110, 180, 210] },
  spooky: { draw: (c, x, y, f) => drawDonnieGross(c, x, y, 0.5, f), face: [-90, -110, 180, 210] },
  hollywood: { draw: (c, x, y, f) => drawSteveGross(c, x, y, 0.5, f), face: [-90, -110, 180, 210] },
  foreign: { draw: (c, x, y, f) => drawHarryGross(c, x, y + 190, 0.9, f), face: [-90, -40, 190, 160] },
  frontier: { draw: (c, x, y, f) => drawTuckerGross(c, x, y, 0.5, f, false), face: [-90, -110, 180, 210] },
  fantasy: { draw: (c, x, y, f) => drawPiperGross(c, x + 14, y + 96, 1.4, f, false, false), face: [-47, -60, 130, 150] },
  cartoon: { draw: (c, x, y, f) => drawDadGross(c, x, y, 0.5, f, false, false), face: [-90, -110, 180, 210] },
};

/** The look, sewn on over his face (its box mapped to 100 x 100). */
const GROSS_LOOK: Record<string, (c: Ctx, look: string) => void> = {
  hollywood: (c, look) => {
    if (look === 'weakness') { patch(c, [8, 14, 52, 10, 56, 50, 14, 56], '#7A7470', '#2A2624', '#A8A29E', 5); drip(c, 30, 56, 12, '#9A7A20', '#E8C860'); return; }
    seam(c, [8, 92, 50, 98, 92, 90], '#E8E0D0', 5, 2.4); for (const x of [26, 50, 74]) staple(c, x, 8, 0.2 * (x - 50) / 24, 3);
  },
  frontier: (c, look) => {
    if (look === 'weakness') { seam(c, [20, 86, 50, 92, 80, 84], '#E8E0D0', 5, 2.4); for (const x of [36, 64]) holeX(c, x, 84, '#E8E0D0', 3); return; }
    c.fillStyle = INK; c.beginPath(); c.arc(14, 6, 15, 0, Math.PI * 2); c.fill(); c.fillStyle = '#6A4220'; c.beginPath(); c.arc(14, 6, 13, 0, Math.PI * 2); c.fill(); c.fillStyle = '#4A2C14'; c.beginPath(); c.arc(14, 8, 7, 0, Math.PI * 2); c.fill();
    seam(c, [2, 20, 14, 26, 28, 20], '#E8E0D0', 5, 2); seam(c, [58, 40, 70, 58, 82, 76], '#E8E0D0', 5, 2.4);
  },
  adventure: (c, look) => {
    if (look === 'weakness') { patch(c, [50, 6, 96, 10, 98, 90, 54, 96, 46, 50], '#E8D2B4', '#3A2A1A', '#FFF0DC', 5); c.fillStyle = '#1A1A2A'; c.fillRect(66, 38, 12, 6); c.fillStyle = '#2A3A8A'; c.fillRect(66, 38, 7, 3); return; }
    seam(c, [12, 70, 30, 62, 46, 74], '#F5F5F4', 5, 2.4); staple(c, 30, 66, 0.4, 3); blot(c, 80, 84, 10, 6, '#7A1A1A', 0.4);
  },
  spooky: (c, look) => {
    if (look === 'weakness') { patch(c, [10, 20, 50, 14, 54, 56, 16, 60], '#8A8682', '#2A1A0A', '#B4B0AA', 5); drip(c, 30, 60, 14, '#6A4420', '#9A6A34'); drip(c, 48, 54, 9, '#6A4420', '#9A6A34'); return; }
    seam(c, [6, 10, 30, 0, 70, 0, 94, 10], '#F5F5F4', 5, 2.4); for (const x of [22, 50, 78]) staple(c, x, 4, (x - 50) / 80, 3);
  },
  foreign: (c, look) => {
    if (look === 'buried') { patch(c, [6, 10, 46, 6, 50, 46, 10, 52], '#9A968E', '#3A3630', '#C4C0B8', 5); patch(c, [60, 60, 92, 56, 94, 86, 62, 90], '#9A968E', '#3A3630', '#C4C0B8', 5); return; }
    if (look === 'barfed') { c.strokeStyle = '#E8E0D0'; c.lineWidth = 2; c.beginPath(); for (let k = 0; k < 5; k++) { const x = 34 + k * 8; c.moveTo(x - 3, 74); c.lineTo(x + 3, 84); c.moveTo(x + 3, 74); c.lineTo(x - 3, 84); } c.stroke(); blot(c, 50, 70, 26, 12, '#5E8A2A', 0.35); return; }
    for (const [x, y] of [[22, 20], [74, 28], [40, 56], [82, 70], [16, 80]] as const) holeX(c, x, y, '#E8E0D0', 4);
  },
  fantasy: (c, look) => {
    if (look === 'weakness') { for (const [x, y, r] of [[24, 40, 9], [76, 56, 8], [50, 84, 7]] as const) { c.fillStyle = '#EA580C'; c.beginPath(); c.ellipse(x, y, r + 3, r * 0.8 + 3, 0.3, 0, Math.PI * 2); c.fill(); c.fillStyle = '#18181B'; c.beginPath(); c.ellipse(x, y, r, r * 0.8, 0.3, 0, Math.PI * 2); c.fill(); } return; }
    c.fillStyle = INK; c.fillRect(42, -4, 16, 14); c.fillStyle = '#9A7040'; c.fillRect(43, -3, 14, 12); c.fillStyle = '#C49A60'; c.fillRect(43, -3, 14, 3);
    seam(c, [30, 14, 50, 18, 70, 14], '#F5F5F4', 5, 2.4);
  },
  cartoon: (c, look) => {
    if (look === 'weakness') {
      c.save(); c.translate(6, 14); c.rotate(0.62); c.fillStyle = 'rgba(20,18,22,0.6)'; c.fillRect(0, -9, 120, 18); c.fillStyle = 'rgba(20,18,22,0.8)'; for (let x = 4; x < 116; x += 10) { c.beginPath(); c.moveTo(x, -9); c.lineTo(x + 6, 0); c.lineTo(x, 9); c.lineTo(x + 3, 0); c.closePath(); c.fill(); } c.restore();
      seam(c, [6, 14, 96, 92], '#F5F5F4', 6, 2.4); return;
    }
    for (const k of [0, 1]) seam(c, [8, 46 + k * 26, 30, 56 + k * 26, 60, 44 + k * 26, 92, 56 + k * 26], '#F5F5F4', 6, 2.4);
    blot(c, 30, 74, 14, 8, '#E9B23A', 0.45); drip(c, 50, 92, 12, '#E9B23A', '#FFE08A');
  },
};

const drawPortrait = (c: Ctx, def: RefightDef, look: string, f: number) => {
  const P = PORTRAIT[def.land];
  if (!P) return;
  const { x, y, w, h } = PF;
  // (the frame: black, a gilt edge gone green, rivets; the portrait clipped in it)
  c.fillStyle = INK; c.fillRect(x - w - 10, y - h - 10, w * 2 + 20, h * 2 + 20);
  c.fillStyle = '#6A5A2A'; c.fillRect(x - w - 7, y - h - 7, w * 2 + 14, h * 2 + 14);
  c.fillStyle = '#A8904A'; c.fillRect(x - w - 7, y - h - 7, w * 2 + 14, 3); c.fillStyle = '#3A3018'; c.fillRect(x - w - 7, y + h + 4, w * 2 + 14, 3);
  c.fillStyle = '#1A0C0C'; c.fillRect(x - w, y - h, w * 2, h * 2);
  c.save(); c.beginPath(); c.rect(x - w, y - h, w * 2, h * 2); c.clip();
  P.draw(c, x, y, f);
  const [fx, fy, fw, fh] = P.face;
  c.save(); c.translate(x + fx, y + fy); c.scale(fw / 100, fh / 100); GROSS_LOOK[def.land]?.(c, look); c.restore();
  c.restore();
  for (const [rx, ry] of [[x - w - 4, y - h - 4], [x + w + 1, y - h - 4], [x - w - 4, y + h + 1], [x + w + 1, y + h + 1]]) { c.fillStyle = '#C8C8D0'; c.fillRect(rx, ry, 3, 3); }
};

// ---------------------------------------------------------------------------------------------------------------
// The card

export interface CardDraw { n: number; t: number; at: number; said: string | null; look: string }
/** Frames from the card's start to the sin's slam. */
export const SLAM_AT = 90;

export const drawIntroCard = (c: Ctx, def: RefightDef, k: CardDraw, state: GameState, place: string) => {
  c.save();
  backdrop(c, def, state);
  // (the hell dimmed under it all, banded darker down to the box)
  c.fillStyle = 'rgba(6, 2, 4, 0.45)'; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) { c.fillStyle = `rgba(6, 2, 4, ${(0.05 * i).toFixed(2)})`; c.fillRect(0, 300 + i * 30, W, 30); }
  // (the shake as the sin lands)
  const st = k.t - SLAM_AT, shake = st >= 0 && st < 10 ? (st % 2 ? 4 : -4) * (1 - st / 10) : 0;
  c.translate(shake, 0);
  drawPortrait(c, def, k.look, k.n);
  // (NED THE NECROMANCER PRESENTS, the act's name)
  signText(c, 'NED THE NECROMANCER PRESENTS', 40, 70, { sx: 1, sy: 2, fill: ['#F8C8E0', '#C090B0'], gap: 1, shadow: INK }, 'left');
  signText(c, def.boss, 40, 106, { sx: 2, sy: 3, fill: ['#FFF4B0', '#F2C84A', '#C8901C'], dither: true, ink: INK, shadow: '#000000', drop: 2, gap: 1 }, 'left');
  // (the sin: slammed on, big down to its size in a few frames; the place under it)
  if (st >= 0) {
    const s = st < 6 ? 2.6 - (st / 6) * 1.6 : 1, cv = sinWord(def.sin), cx = 186, cy = 196;
    c.save(); c.translate(cx, cy); c.scale(s, s); c.globalAlpha = Math.min(1, 0.3 + st / 6); c.drawImage(cv, -SW / 2, -SH / 2); c.restore();
    if (st > 10) {
      signText(c, 'NOW SERVING TIME IN', 186, 250, { sx: 1, sy: 1, fill: '#C8B0B8', gap: 1, shadow: INK });
      signText(c, place, 186, 272, { sx: 1, sy: 2, fill: ['#FFFFFF', '#E8D0D8'], gap: 1, shadow: INK, drop: 2 });
    }
  }
  // (Ned, the MC, in the corner over the box: his gross-up, his mouth going while he talks)
  c.save(); c.beginPath(); c.rect(24, 300, 300, 172); c.clip();
  drawNedGross(c, 170, 352, 0.42, k.n, !!k.said && Math.floor(k.n / 6) % 2 === 0);
  c.restore();
  c.strokeStyle = '#7F1D1D'; c.lineWidth = 3; c.strokeRect(24, 300, 300, 172);
  c.restore();
};
