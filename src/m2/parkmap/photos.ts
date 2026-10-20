// The KEY CAST MEMBERS' photographs (the user's: "key cast members should show photographs of them too"): each star's
// park-PR staff photo, the wholesome kind (employee of the month, the staff ID), of these monsters. Built from each
// one's actual drawing in a posed "work photo" pose, cropped head and shoulders, in front of the photo studio's blue
// mottled backdrop with the flash's hot spot behind them and its sheen across the print; mounted on a white card with
// a caption plate and a strip of sticky tape. Painted once per land and size, then kept.

import { signText } from '../signLetters';
import { drawSafariArtie } from '../adventure/river/artie';
import { drawDonnie } from '../cast/donnie';
import { drawQueen } from '../space/queen/sprite';
import { GY } from '../space/geometry';
import { drawSteve } from '../hollywood/stunt/steve';
import { drawHarry } from '../foreign/heli/harryArt';
import { drawTucker } from '../frontier/tucker';
import { drawPiper } from '../fantasy/piper';
import { drawDad } from '../cartoon/amphi/dad';

type Ctx = CanvasRenderingContext2D;

interface Shot {
  /** Them, feet at (0, 0), facing the camera's way (right). */
  draw: (c: Ctx) => void;
  /** The middle of the shot in their drawing's units, and how many photo px per unit (the big print's). */
  cx: number; cy: number; k: number;
  /** The caption on the card's plate. */
  caption: [string, string];
  /** Something over the print after (the queen's sticker, Steve's autograph), in the photo's px. */
  over?: (c: Ctx, w: number, h: number) => void;
}

/** The queen's likeness, pending: a sticker slapped across her jaws. */
const sticker = (c: Ctx, w: number, h: number) => {
  c.save();
  c.translate(w * 0.64, h * 0.56); c.rotate(-0.22);
  const sw = Math.round(w * 0.7), sh = Math.round(h * 0.3), small = w < 60;
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(-sw / 2 + 1, -sh / 2 + 1, sw, sh);
  c.fillStyle = '#FDE047'; c.fillRect(-sw / 2, -sh / 2, sw, sh);
  c.fillStyle = '#FEF9C3'; c.fillRect(-sw / 2, -sh / 2, sw, 1);
  c.fillStyle = '#CA8A04'; c.fillRect(-sw / 2, sh / 2 - 1, sw, 1);
  // (a corner peeling up)
  c.fillStyle = '#E5C230'; c.beginPath(); c.moveTo(sw / 2 - 5, -sh / 2); c.lineTo(sw / 2, -sh / 2); c.lineTo(sw / 2, -sh / 2 + 5); c.closePath(); c.fill();
  c.fillStyle = '#FFFBE0'; c.beginPath(); c.moveTo(sw / 2 - 5, -sh / 2); c.lineTo(sw / 2, -sh / 2 + 5); c.lineTo(sw / 2 - 4, -sh / 2 + 4); c.closePath(); c.fill();
  c.restore();
  if (small) return;
  // (the words set straight on a little canvas of their own, then turned with the sticker)
  const t = document.createElement('canvas'); t.width = 80; t.height = 20;
  const g = t.getContext('2d')!;
  signText(g, 'LIKENESS', 40, 8, { sx: 1, sy: 1, bold: true, fill: '#991B1B' });
  signText(g, 'PENDING', 40, 17, { sx: 1, sy: 1, bold: true, fill: '#991B1B' });
  c.save(); c.translate(w * 0.64, h * 0.56); c.rotate(-0.22); c.imageSmoothingEnabled = false;
  c.drawImage(t, -40, -10); c.restore();
};

/** Steve signed his. Of course he did. */
const autograph = (c: Ctx, w: number, h: number) => {
  c.save();
  c.strokeStyle = '#1E1B4B'; c.lineWidth = 1.2; c.lineCap = 'round'; c.lineJoin = 'round';
  const x0 = w * 0.08, y0 = h * 0.86;
  c.beginPath();
  // (an S, a run of loops, a flourish under it all, a star for a dot)
  c.moveTo(x0 + 7, y0 - 9); c.bezierCurveTo(x0 - 1, y0 - 12, x0 - 1, y0 - 4, x0 + 4, y0 - 4); c.bezierCurveTo(x0 + 10, y0 - 4, x0 + 8, y0 + 3, x0, y0 + 1);
  let x = x0 + 9;
  c.moveTo(x, y0 - 2);
  for (let i = 0; i < 5; i++) { c.bezierCurveTo(x + 1, y0 - 8, x + 4, y0 - 8, x + 3, y0 - 1); x += 4; }
  c.moveTo(x0 - 1, y0 + 4); c.bezierCurveTo(x0 + 12, y0 + 2, x0 + 22, y0 + 6, x + 6, y0 + 1);
  c.stroke();
  c.fillStyle = '#1E1B4B'; c.fillRect(x + 2, y0 - 10, 1, 3); c.fillRect(x + 1, y0 - 9, 3, 1);
  c.restore();
};

const SHOTS: Record<string, Shot> = {
  adventure: { caption: ['EMPLOYEE OF', 'THE MONTH'], cx: 2, cy: -66, k: 1.75,
    draw: c => drawSafariArtie(c, 0, 0, 1, 0, 'talk') },
  spooky: { caption: ['NIGHT SHIFT', 'ALL-STAR'], cx: 2, cy: -66, k: 1.7,
    draw: c => drawDonnie(c, 0, 0, 1, 0, 'stand', 0, { wig: true, cape: true, fangs: true }) },
  space: { caption: ['PHOTO UNDER', 'REVIEW'], cx: 30, cy: -262, k: 0.5, over: sticker,
    draw: c => { c.translate(0, -GY); drawQueen(c, 0, 1, { pose: 'idle', t: 0, ext: 0, alive: 0, beat: 0 }); } },
  hollywood: { caption: ['HEADSHOT', '(SIGNED)'], cx: 3, cy: -84, k: 1.55, over: autograph,
    draw: c => drawSteve(c, 0, 0, 1, 'thumb', 0) },
  foreign: { caption: ['20 YEARS OF', 'SERVICE'], cx: 0, cy: -64, k: 1.7,
    draw: c => drawHarry(c, 0, 0, { pose: 'stand', f: 0 }) },
  frontier: { caption: ['PERFECT', 'ATTENDANCE'], cx: 2, cy: -74, k: 1.6,
    draw: c => drawTucker(c, 0, 0, 1, 0, 'stand', { face: 'smile' }) },
  fantasy: { caption: ['LIGHTLY', 'RETOUCHED'], cx: 0, cy: -138, k: 0.85,
    draw: c => drawPiper(c, 0, 0, 1, 0, 'stand', { thin: 1 }) },
  cartoon: { caption: ['STAFF ID', 'DO NOT WAKE'], cx: 2, cy: -74, k: 1.3,
    draw: c => drawDad(c, 0, 0, 'sit', 0, { facing: 1, can: 'near', canFull: true }) },
};

// ---- the studio backdrop: blue, mottled, the flash's hot spot behind the head (stepped bands, dithered between)
const BLUES = ['#1E2A5A', '#26366E', '#2F4484', '#3A5498', '#4866AE', '#5A7CC2', '#7096D2'];
const h01 = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const backdrop = (c: Ctx, w: number, h: number, seed: number) => {
  const fx = w * 0.5, fy = h * 0.42, R = Math.hypot(w, h) * 0.62;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    // (the hot spot's falloff, a slow mottle over it (two octaves of lumps), a Bayer step between bands)
    const d = Math.hypot((x - fx) * 0.9, (y - fy) * 1.1) / R;
    const m = Math.sin(x * 0.21 + seed) * Math.cos(y * 0.17 - seed * 0.7) * 0.5 + Math.sin(x * 0.07 - y * 0.09 + seed * 2) * 0.6;
    let v = (1 - d) * (BLUES.length - 0.6) + m * 0.55 - 0.3;
    v += ((x & 1) * 2 + (y & 1) === 1 || (x & 1) * 2 + (y & 1) === 2 ? 0.25 : -0.25) * 0.8;
    const i = Math.max(0, Math.min(BLUES.length - 1, Math.floor(v)));
    c.fillStyle = BLUES[i]; c.fillRect(x, y, 1, 1);
  }
  // (a few flecks in the backdrop's paint)
  for (let i = 0; i < w * h / 60; i++) { c.fillStyle = h01(i + seed) < 0.5 ? 'rgba(160,190,240,0.25)' : 'rgba(10,16,40,0.25)'; c.fillRect(Math.floor(h01(i * 3.1 + seed) * w), Math.floor(h01(i * 7.3 + seed) * h), 1, 1); }
};

/** The flash's work over the print: its sheen across a corner, the edges falling off. */
const flash = (c: Ctx, w: number, h: number) => {
  c.save();
  // (the edges falling off, in steps)
  c.fillStyle = 'rgba(8,10,30,0.22)'; c.fillRect(0, 0, w, 1); c.fillRect(0, h - 1, w, 1); c.fillRect(0, 0, 1, h); c.fillRect(w - 1, 0, 1, h);
  c.fillStyle = 'rgba(8,10,30,0.12)'; c.fillRect(1, 1, w - 2, 1); c.fillRect(1, h - 2, w - 2, 1); c.fillRect(1, 1, 1, h - 2); c.fillRect(w - 2, 1, 1, h - 2);
  // (the gloss: a band of light across the top-right corner, a thinner one inside it)
  c.beginPath(); c.moveTo(w * 0.55, 0); c.lineTo(w * 0.78, 0); c.lineTo(w, h * 0.3); c.lineTo(w, h * 0.52); c.closePath();
  c.fillStyle = 'rgba(255,255,255,0.13)'; c.fill();
  c.beginPath(); c.moveTo(w * 0.84, 0); c.lineTo(w * 0.9, 0); c.lineTo(w, h * 0.14); c.lineTo(w, h * 0.22); c.closePath();
  c.fillStyle = 'rgba(255,255,255,0.18)'; c.fill();
  c.restore();
};

const CACHE = new Map<string, HTMLCanvasElement>();
const SEEDS: Record<string, number> = { adventure: 1, spooky: 2, space: 3, hollywood: 4, foreign: 5, frontier: 6, fantasy: 7, cartoon: 8 };

/** Big: the cast panel's (the card, the caption plate, the tape). Small: the YOU ARE GOING HERE card's (a thumbnail
 *  on a thin white border, no plate). Null for a land with no star. */
export const castPhoto = (land: string, size: 'big' | 'small' = 'big'): HTMLCanvasElement | null => {
  const shot = SHOTS[land];
  if (!shot) return null;
  const key = `${land}:${size}`;
  const hit = CACHE.get(key);
  if (hit) return hit;
  const big = size === 'big';
  const PW = big ? 86 : 40, PH = big ? 78 : 36, s = PW / 86;
  const M = big ? 4 : 0, B = big ? 4 : 2, PLATE = big ? 25 : 0;
  const CW = PW + B * 2, CH = PH + B * 2 + PLATE;
  const cv = document.createElement('canvas');
  cv.width = CW + M * 2 + (big ? 2 : 1); cv.height = CH + M * 2 + (big ? 2 : 1);
  const c = cv.getContext('2d')!;
  c.imageSmoothingEnabled = false;
  const ox = M, oy = M;
  // (the card's shadow on the page, its card stock, the inked edge)
  c.fillStyle = 'rgba(40,24,8,0.35)'; c.fillRect(ox + 2, oy + 2, CW, CH);
  c.fillStyle = '#5B4A33'; c.fillRect(ox, oy, CW, CH);
  c.fillStyle = '#F7F2E4'; c.fillRect(ox + 1, oy + 1, CW - 2, CH - 2);
  c.fillStyle = '#FFFFFF'; c.fillRect(ox + 1, oy + 1, CW - 2, 1); c.fillRect(ox + 1, oy + 1, 1, CH - 2);
  c.fillStyle = '#DCD3BC'; c.fillRect(ox + 1, oy + CH - 2, CW - 2, 1); c.fillRect(ox + CW - 2, oy + 1, 1, CH - 2);
  // (the print)
  const px = ox + B, py = oy + B;
  const p = document.createElement('canvas'); p.width = PW; p.height = PH;
  const g = p.getContext('2d')!;
  backdrop(g, PW, PH, SEEDS[land] ?? 0);
  g.save();
  const k = shot.k * s;
  g.translate(PW / 2 - shot.cx * k, PH * 0.5 - shot.cy * k); g.scale(k, k);
  shot.draw(g);
  g.restore();
  if (big) shot.over?.(g, PW, PH);
  else if (land === 'space') sticker(g, PW, PH);
  flash(g, PW, PH);
  c.drawImage(p, px, py);
  c.fillStyle = 'rgba(30,20,10,0.5)'; c.fillRect(px, py - 1, PW, 1); c.fillRect(px - 1, py, 1, PH);
  if (big) {
    // (the caption plate: brass, engraved)
    const ty = py + PH + 3, tw = PW, th = PLATE - 5;
    c.fillStyle = '#6B4A12'; c.fillRect(px, ty, tw, th);
    c.fillStyle = '#D4A62A'; c.fillRect(px + 1, ty + 1, tw - 2, th - 2);
    c.fillStyle = '#F2D06B'; c.fillRect(px + 1, ty + 1, tw - 2, 1);
    c.fillStyle = '#A57A16'; c.fillRect(px + 1, ty + th - 2, tw - 2, 1);
    c.fillStyle = '#8A6414'; c.fillRect(px + 2, ty + th / 2 - 0.5, 1, 1); c.fillRect(px + tw - 3, ty + th / 2 - 0.5, 1, 1);
    const L = { sx: 1, sy: 1, bold: false, fill: '#3B2506' } as const;
    signText(c, shot.caption[0], px + tw / 2, ty + 9, L, 'center');
    signText(c, shot.caption[1], px + tw / 2, ty + 17, L, 'center');
    // (the tape: a strip of it across the top, the light through it)
    c.save();
    c.translate(ox + CW / 2, oy + 1); c.rotate(-0.08);
    c.fillStyle = 'rgba(250,240,190,0.72)'; c.fillRect(-14, -4, 28, 8);
    c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(-14, -4, 28, 1);
    c.fillStyle = 'rgba(200,180,120,0.5)'; c.fillRect(-14, 3, 28, 1);
    // (its torn ends)
    c.clearRect(-15, -4, 1, 2); c.clearRect(-15, 1, 1, 2); c.clearRect(14, -2, 1, 2); c.clearRect(14, 2, 1, 2);
    c.restore();
  }
  CACHE.set(key, cv);
  return cv;
};

/** Which way each card's tipped (degrees): a little off true, every one its own way. */
export const PHOTO_TILT: Record<string, number> = { adventure: -2.5, spooky: 2, space: -1.5, hollywood: 2.5, foreign: -2, frontier: 1.5, fantasy: -3, cartoon: 2 };

const URLS = new Map<string, { url: string; w: number; h: number } | null>();
/** The photo as an image (for an <img>): its data URL and size, made once. */
export const castPhotoImg = (land: string, size: 'big' | 'small' = 'big') => {
  const key = `${land}:${size}`;
  if (!URLS.has(key)) { const cv = castPhoto(land, size); URLS.set(key, cv ? { url: cv.toDataURL(), w: cv.width, h: cv.height } : null); }
  return URLS.get(key)!;
};
