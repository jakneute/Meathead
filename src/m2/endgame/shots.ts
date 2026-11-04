// The abduction's cutscene pictures (abduction.ts plays them through the gym's scene player, intro/gym/scene.ts: 256 x
// 144 SNES pictures blown up 3x, the words in speech bubbles over whoever's talking). Banded skies and ramps, dithered
// seams, inked; what's still is painted once into a canvas and kept, only what moves drawn each frame.
//
//   wife     Zorblax's wife at the controls of her standby saucer: the cockpit, the dome, her up close (a gross-up:
//            the cinder-block jaw, curlers, a cigarette in the slot of her mouth, the lipstick past the lines)
//   cab      him in the truck's window going up in the beam (the title's bust, framed by the door; flies if he's shit)
//   wide     outside: the parking garage at night, its roof burst, the saucer over it with him going up in its beam;
//            the ground splits, Satan comes up out of it, grabs the saucer, catches the truck, and throws it
//   flight   the truck tumbling over the water park in the dark (its slides and tubes, the wave pool)
//   crash    the lot outside the water park's gate: down it comes
//
// No volcanoes. Satan's his own painting from hell (spooky/hell/satanArt.ts), the saucer her own (space/orbit/art.ts),
// her head her people's (alienHead); his arms here are two-bone limbs off art/limb.ts (elbowFront: out to the sides).

import { paintSatan, drawSatanFace } from '../spooky/hell/satanArt';
import { drawSaucer, alienHead } from '../space/orbit/art';
import { drawTitleMeathead, type TitleMood } from '../title/meathead';
import { flies, stink } from '../../m1/game/scenes/shatLook';
import { elbowFront } from '../art/limb';
import { timeOfDay, skyRamp, drawStars, drawMoon } from '../timeOfDay';
import { ART_W, ART_H } from '../intro/gym/scene';
import type { Dressed } from './lines';

type Ctx = CanvasRenderingContext2D;
const INK = '#08070C';
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = (k: number) => { const t = clamp01(k); return t * t * (3 - 2 * t); };
/** A checker of `col` over a rect (one art pixel a square). */
const dither = (c: Ctx, x: number, y: number, w: number, h: number, col: string, phase = 0) => {
  c.fillStyle = col;
  for (let yy = 0; yy < h; yy++) for (let xx = (yy + phase) & 1; xx < w; xx += 2) c.fillRect(x + xx, y + yy, 1, 1);
};
/** Flat bands down a rect (`cols` top to bottom), each seam dithered. */
const bands = (c: Ctx, x: number, y: number, w: number, h: number, cols: readonly string[]) => {
  const n = cols.length, bh = h / n;
  for (let i = 0; i < n; i++) R(c, x, y + i * bh, w, Math.ceil(bh) + 1, cols[i]);
  for (let i = 1; i < n; i++) dither(c, x, Math.round(y + i * bh) - 1, w, 2, cols[i], i);
};
const canvasOf = (w: number, h: number, paint: (g: Ctx) => void) => {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d')!; g.imageSmoothingEnabled = false; paint(g);
  return cv;
};
const baked = new Map<string, HTMLCanvasElement>();
const bake = (key: string, w: number, h: number, paint: (g: Ctx) => void) => {
  let cv = baked.get(key);
  if (!cv) { cv = canvasOf(w, h, paint); baked.set(key, cv); }
  return cv;
};

// ---------------------------------------------------------------------------------------------------------------
// The clock and the marks: the shots run off the scene's own frame count (abduction.ts ticks it), and what happens when
// in the wide shot is marked by the beats as they start (Satan's grab, the catch, the throw)

export const clip = { t: 0, rise: -1, grab: -1, catch: -1, throw: -1, dress: 'clean' as Dressed };
export const resetClip = (dress: Dressed) => { Object.assign(clip, { t: 0, rise: -1, grab: -1, catch: -1, throw: -1, dress }); };
/** How far along since a mark (frames), or -1 if it's not happened. */
const since = (mark: number) => (mark < 0 ? -1 : clip.t - mark);

// ---------------------------------------------------------------------------------------------------------------
// The night sky (the hour's: it's whatever it was in the park), painted once for the hour

const nightSky = (g: Ctx, h: number) => {
  const tod = timeOfDay();
  bands(g, 0, 0, ART_W, h, skyRamp(['#0A0E24', '#121A3A', '#1C2750', '#2A3462', '#3C4270', '#584C78'], tod));
  drawStars(g, 0, 0, ART_W, h * 0.8, 0, 0, tod, 1);
};

// ---------------------------------------------------------------------------------------------------------------
// The truck (his, red, the government's), small: side on, facing right, its wheels' bottoms at (0, 0). For the wide
// shots, drawn turned (it's tumbling): painted once, turned as it's put down.

const TRUCK = ['#3A0808', '#6A0E0E', '#A01818', '#C82A22', '#E8604C'];
const paintMiniTruck = (g: Ctx) => {
  g.translate(22, 16);
  R(g, -20, -10, 40, 7, INK); R(g, -19, -9, 38, 5, TRUCK[2]); R(g, -19, -9, 38, 1, TRUCK[4]); R(g, -19, -5, 38, 1, TRUCK[1]);
  R(g, -2, -16, 12, 7, INK); R(g, -1, -15, 10, 6, TRUCK[3]); R(g, 1, -14, 6, 4, '#7AA0C8'); R(g, 1, -14, 2, 1, '#E0F0FF');
  R(g, -20, -12, 18, 2, INK); R(g, -19, -11, 16, 1, '#2A2A30');
  for (const wx of [-12, 12]) { R(g, wx - 4, -4, 8, 5, INK); R(g, wx - 3, -3, 6, 3, '#3A3A42'); R(g, wx - 1, -2, 2, 1, '#C8CCD2'); }
  R(g, 18, -8, 2, 2, '#FFF6C8');
};
const miniTruck = (c: Ctx, x: number, y: number, s = 1, rot = 0) => {
  const cv = bake('truck', 44, 20, paintMiniTruck);
  c.save(); c.translate(Math.round(x), Math.round(y)); if (rot) c.rotate(rot); c.scale(s, s);
  c.drawImage(cv, -22, -16);
  c.restore();
};

/** The tractor beam: stepped columns of pink light down from (x, y0) to y1, widening; sparkles going up it. */
const beam = (c: Ctx, x: number, y0: number, y1: number, w0: number, w1: number, t: number, k = 1) => {
  if (k <= 0) return;
  const cols = ['rgba(255, 120, 220, 0.16)', 'rgba(255, 160, 235, 0.2)', 'rgba(255, 220, 250, 0.26)'];
  for (let i = 0; i < 3; i++) {
    const f = 1 - i * 0.3;
    c.fillStyle = cols[i]; c.globalAlpha = k;
    c.beginPath(); c.moveTo(x - (w0 / 2) * f, y0); c.lineTo(x + (w0 / 2) * f, y0); c.lineTo(x + (w1 / 2) * f, y1); c.lineTo(x - (w1 / 2) * f, y1); c.closePath(); c.fill();
  }
  for (let i = 0; i < 14; i++) {
    const u = (hash(i) - 0.5) * 0.8, v = 1 - (((t * 0.012 + hash(i + 9)) % 1));
    const yy = y0 + (y1 - y0) * v, ww = w0 + (w1 - w0) * v;
    R(c, x + u * ww, yy, 1, 1, i % 3 ? '#FFD6F4' : '#FFFFFF');
  }
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------
// wife: the cockpit of the standby saucer, her up close

const paintCockpit = (g: Ctx) => {
  // (the dome's glass: the night through it, banded, its curve inked; the frame's struts)
  nightSky(g, 110);
  g.fillStyle = 'rgba(150, 90, 200, 0.18)'; g.fillRect(0, 0, ART_W, 110);
  g.strokeStyle = '#3A2A4A'; g.lineWidth = 5;
  g.beginPath(); g.ellipse(128, 150, 170, 140, 0, Math.PI, 0); g.stroke();
  g.strokeStyle = '#6A5480'; g.lineWidth = 1; g.beginPath(); g.ellipse(128, 150, 167, 137, 0, Math.PI * 1.08, Math.PI * 1.35); g.stroke();
  for (const x of [34, 222]) { R(g, x - 3, 0, 6, 120, INK); R(g, x - 2, 0, 4, 120, '#3A2A4A'); R(g, x - 2, 0, 1, 120, '#6A5480'); }
  // (the console: a sick lilac, banks of buttons, two screens, a fuzzy dice hanging off a strut; a cup holder, her cup)
  bands(g, 0, 104, ART_W, 40, ['#4A3858', '#3A2C48', '#2A2036', '#1C1426']);
  R(g, 0, 104, ART_W, 1, '#8A72A0');
  for (let i = 0; i < 26; i++) { const x = 6 + i * 9.5, y = 112 + (i % 3) * 8; R(g, x, y, 5, 3, INK); R(g, x + 1, y, 3, 2, ['#F472B6', '#FDE047', '#4ADE80', '#60A5FA'][i % 4]); }
  for (const [x, y] of [[18, 92], [196, 92]]) { R(g, x - 1, y - 1, 44, 26, INK); R(g, x, y, 42, 24, '#0E1A12'); for (let k = 0; k < 5; k++) R(g, x + 3, y + 3 + k * 4, 10 + hash(x + k) * 26, 2, '#34D399'); }
  // (the fuzzy dice, pink)
  R(g, 222, 30, 1, 18, '#C8CCD2');
  for (const [dx, dy] of [[-4, 48], [2, 54]]) { R(g, 222 + dx - 1, dy - 1, 8, 8, INK); R(g, 222 + dx, dy, 6, 6, '#F9A8D4'); R(g, 222 + dx + 1, dy + 1, 1, 1, INK); R(g, 222 + dx + 4, dy + 4, 1, 1, INK); }
  // (her mug: WORLD'S BEST WIDOW in tiny letters is too small to read: just a pink mug)
  R(g, 172, 108, 11, 12, INK); R(g, 173, 109, 9, 10, '#EC4899'); R(g, 173, 109, 9, 2, '#F9A8D4'); R(g, 182, 111, 3, 5, INK);
};
const wifeAt = { x: 112, y: 132, s: 4 };
/** Her mouth in the picture (for the bubble). */
export const WIFE_MOUTH: [number, number] = [wifeAt.x + 5 * wifeAt.s, wifeAt.y - 10 * wifeAt.s];
export const shotWife = (c: Ctx, t: number, talking: boolean) => {
  c.drawImage(bake(`cockpit-${timeOfDay().key}`, ART_W, ART_H, paintCockpit), 0, 0);
  const { x, y, s } = wifeAt, open = talking && (t >> 3) % 2 === 0;
  // (a bob: she's driving with her knees)
  const bob = Math.round(Math.sin(t * 0.08) * 1.5);
  c.save(); c.translate(0, bob);
  // (a housecoat round the neck: quilted, pink)
  R(c, x - 15 * s, y - 2 * s, 30 * s, 6 * s, INK); R(c, x - 14 * s, y - 1 * s, 28 * s, 5 * s, '#DB2777'); dither(c, x - 14 * s, y + s, 28 * s, 2, '#9D174D');
  for (let k = 0; k < 6; k++) R(c, x - 12 * s + k * 5 * s, y, 1, 4 * s, '#F9A8D4');
  alienHead(c, x, y, s, true, open);
  // The gross-up on top: curlers on the little cranium, the lipstick past the lines, rouge, a wart with a hair on it,
  // the slime on her jaw, the cigarette in the slot of her mouth (its ash long), her earring
  const P = (dx: number, dy: number, w: number, h: number, col: string) => R(c, x + dx * s, y + dy * s, w * s, h * s, col);
  for (const [cx, cy] of [[-6, -25], [-2, -26], [2, -25]]) { P(cx - 0.5, cy - 0.5, 3, 3, INK); P(cx, cy, 2, 2, '#60A5FA'); P(cx, cy, 2, 0.5, '#BFDBFE'); }
  P(-1.5, open ? -10.5 : -9.5, 13, 0.6, '#F43F5E'); P(9, open ? -11 : -10, 2.5, 1, '#F43F5E');
  P(4, -15, 4, 2, '#E879A8'); dither(c, x + 4 * s, y - 15 * s, 4 * s, 2 * s, '#F9A8D4');
  P(-5, -13, 1.6, 1.6, '#3F4A2A'); P(-4.6, -14.4, 0.25, 1.4, INK);
  P(-7.5, -5, 1, 3, '#B8D88A'); P(-7.5, -2, 1, 1, '#E2F2C4');
  if (!open) {
    P(10, -9.5, 7, 1.4, '#F5F5F4'); P(16, -9.5, 1.6, 1.4, '#9CA3AF'); P(17.3, -9.5, 0.6, 1.4, (t >> 2) % 2 ? '#F97316' : '#FBBF24');
    for (let k = 0; k < 3; k++) { const a = ((t * 0.6 + k * 14) % 40) / 40; R(c, x + (17.6 + a * 3) * s + Math.sin(t * 0.1 + k) * 2, y - (10 + a * 9) * s, 2, 2, `rgba(220, 220, 230, ${(0.6 * (1 - a)).toFixed(2)})`); }
  }
  P(-9, -9, 1.4, 2.4, INK); P(-8.8, -8.6, 1, 2, '#FDE047');
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// cab: him in the truck's window, going up (the title's bust, the door round him; the beam's pink over it)

const paintDoor = (g: Ctx) => {
  // (the door, red, everything but the window; the window's frame inked, the mirror)
  g.fillStyle = TRUCK[2]; g.fillRect(0, 0, ART_W, ART_H);
  g.globalCompositeOperation = 'destination-out';
  g.beginPath(); g.moveTo(66, 6); g.lineTo(178, 6); g.lineTo(206, 70); g.lineTo(206, 112); g.lineTo(66, 112); g.closePath(); g.fill();
  g.globalCompositeOperation = 'source-over';
  g.save(); g.beginPath(); g.rect(0, 0, ART_W, ART_H); g.moveTo(66, 6); g.lineTo(66, 112); g.lineTo(206, 112); g.lineTo(206, 70); g.lineTo(178, 6); g.closePath(); g.clip('evenodd');
  bands(g, 0, 0, ART_W, ART_H, [TRUCK[3], TRUCK[2], TRUCK[2], TRUCK[1], TRUCK[0]]);
  R(g, 0, 118, ART_W, 2, TRUCK[4]); R(g, 0, 120, ART_W, 1, TRUCK[1]);
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(66, 6); g.lineTo(178, 6); g.lineTo(206, 70); g.lineTo(206, 112); g.lineTo(66, 112); g.closePath(); g.stroke();
  g.strokeStyle = '#2A2A30'; g.lineWidth = 2; g.stroke();
  // (the mirror, the handle, a USA #1 sticker corner)
  R(g, 214, 60, 26, 32, INK); R(g, 216, 62, 22, 28, '#C8CCD2'); R(g, 218, 64, 18, 24, '#4E7092'); R(g, 218, 64, 18, 3, '#9ABCE0');
  R(g, 90, 124, 30, 6, INK); R(g, 91, 125, 28, 4, '#C8CCD2'); R(g, 91, 125, 28, 1, '#FFFFFF');
};
const MH_HEAD: [number, number] = [128, 40];
export const MH_MOUTH: [number, number] = [128, 30];
export const shotCab = (mood: TitleMood, heldBySatan = false) => (c: Ctx, t: number, talking: boolean) => {
  // (out of the window behind him: the garage dropping away; or Satan's red glare, held up to his face)
  if (heldBySatan) bands(c, 0, 0, ART_W, ART_H, ['#4A0606', '#6A0A08', '#8A1410', '#6A0A08', '#3A0404']);
  else { c.drawImage(bake(`cabSky-${timeOfDay().key}`, ART_W, ART_H, g => nightSky(g, ART_H)), 0, 0); beam(c, 128, 0, ART_H, 260, 260, t, 0.8); }
  const shake = Math.round(Math.sin(t * 0.9) * (heldBySatan ? 1 : 0.6));
  c.save(); c.translate(shake, 8);
  drawTitleMeathead(c, t, mood, t, true);
  if (talking && t % 8 < 4) { R(c, 116, 86, 24, 3, '#3a0606'); R(c, 118, 86, 20, 1, '#f4ecdc'); }
  c.restore();
  if (clip.dress === 'shitty') { flies(c, 96, 84, 18, 3); stink(c, 170, 100, 3, 26, 9); }
  c.drawImage(bake('door', ART_W, ART_H, paintDoor), 0, 0);
  // (the pink of the beam over it all, or the hellfire's red)
  c.fillStyle = heldBySatan ? 'rgba(255, 60, 20, 0.12)' : 'rgba(255, 140, 230, 0.1)'; c.fillRect(0, 0, ART_W, ART_H);
  void MH_HEAD;
};

// ---------------------------------------------------------------------------------------------------------------
// wide: the parking garage from outside, at night; the saucer; Satan

const GROUND = 124;
/** The garage: four decks of concrete, the openings lit sodium orange, cars in them, the ramp's slope, a sign. */
const GX = 20, GW = 176, GTOP = 78;
const paintWide = (g: Ctx) => {
  nightSky(g, GROUND);
  // (far off: the park's skyline, dark, a few lit windows; tree line)
  g.fillStyle = '#141A30';
  for (let x = 0; x < ART_W; x += 6) { const h = 8 + hash(x * 0.7) * 14 + (x > 160 && x < 210 ? 18 : 0); g.fillRect(x, GROUND - 12 - h, 6, h + 12); }
  for (let i = 0; i < 30; i++) R(g, hash(i * 3) * ART_W, GROUND - 14 - hash(i * 5) * 18, 1, 1, '#F6C860');
  R(g, 0, GROUND - 14, ART_W, 14, '#0E1424'); dither(g, 0, GROUND - 15, ART_W, 2, '#0E1424');
  // (the lot: asphalt, the painted lines, a light pole or two)
  bands(g, 0, GROUND, ART_W, ART_H - GROUND, ['#24262E', '#1C1E24', '#15161A']);
  for (let i = 0; i < 12; i++) R(g, 8 + i * 22, GROUND + 6, 1, 8, '#6A6C72');
  for (const px of [180, 238]) { R(g, px, GROUND - 46, 2, 46, '#3A3E48'); R(g, px - 5, GROUND - 47, 12, 3, INK); R(g, px - 4, GROUND - 46, 10, 1, '#FDE68A'); g.fillStyle = 'rgba(253, 230, 138, 0.12)'; g.beginPath(); g.moveTo(px - 4, GROUND - 45); g.lineTo(px + 6, GROUND - 45); g.lineTo(px + 16, GROUND); g.lineTo(px - 14, GROUND); g.closePath(); g.fill(); }
};
/** The garage on its own (Satan comes up behind it): its decks, the openings between them lit, the cars' shapes in
 *  them; the stair tower at its side; the sign; the roof burst open. */
const paintGarage = (g: Ctx) => {
  R(g, GX - 1, GTOP - 1, GW + 2, GROUND - GTOP + 1, INK);
  for (let d = 0; d < 3; d++) {
    const y = GTOP + d * 16;
    R(g, GX, y, GW, 5, '#8A8C92'); R(g, GX, y, GW, 1, '#B4B6BC'); R(g, GX, y + 4, GW, 1, '#5A5C62');
    R(g, GX, y + 5, GW, 11, '#3A2A14'); bands(g, GX, y + 5, GW, 11, ['#B8862A', '#8A6420', '#5A4216']);
    for (let k = 0; k < 9; k++) { const cx = GX + 6 + k * 19 + hash(d * 7 + k) * 4; if (hash(d * 11 + k) > 0.35) { R(g, cx, y + 10, 12, 5, '#1A1410'); R(g, cx + 3, y + 8, 6, 2, '#1A1410'); } }
    for (let k = 0; k <= 11; k++) R(g, GX + k * 16, y + 5, 2, 11, '#6A6C72');
  }
  R(g, GX, GROUND - 4, GW, 4, '#7A7C82');
  R(g, GX + GW, GTOP - 10, 14, GROUND - GTOP + 10, INK); R(g, GX + GW + 1, GTOP - 9, 12, GROUND - GTOP + 9, '#6E7076'); R(g, GX + GW + 1, GTOP - 9, 3, GROUND - GTOP + 9, '#9A9CA2');
  for (let y = GTOP - 4; y < GROUND - 4; y += 8) R(g, GX + GW + 5, y, 4, 4, '#F6C860');
  // (the sign on it: P, big, in a blue square: readable)
  R(g, GX + 4, GTOP + 18, 12, 14, INK); R(g, GX + 5, GTOP + 19, 10, 12, '#1E40AF');
  R(g, GX + 8, GTOP + 21, 2, 8, '#F8FAFC'); R(g, GX + 10, GTOP + 21, 3, 1, '#F8FAFC'); R(g, GX + 12, GTOP + 22, 1, 2, '#F8FAFC'); R(g, GX + 10, GTOP + 24, 3, 1, '#F8FAFC');
  // (the roof, burst open: a jagged hole up through the top deck, rebar sticking up, the lit inside showing)
  g.fillStyle = '#0A0A10';
  g.beginPath(); g.moveTo(GX + 40, GTOP); g.lineTo(GX + 46, GTOP - 4); g.lineTo(GX + 54, GTOP + 2); g.lineTo(GX + 62, GTOP - 5); g.lineTo(GX + 72, GTOP + 1); g.lineTo(GX + 82, GTOP - 3); g.lineTo(GX + 88, GTOP); g.lineTo(GX + 84, GTOP + 6); g.lineTo(GX + 44, GTOP + 6); g.closePath(); g.fill();
  for (let k = 0; k < 6; k++) R(g, GX + 44 + k * 7, GTOP - 6 - hash(k) * 4, 1, 6, '#8A3A1A');
};
/** Where things are in the wide shot this frame (for the bubbles too). */
const SAT = { x: 178, s: 0.2 };
const UFO0 = { x: GX + 56, y: 30 };
const satanTop = () => { const k = ease(since(clip.rise) / 110); return GROUND + 30 - k * (GROUND + 30 - 4); };
const ufoNow = (t: number) => {
  const g = since(clip.grab);
  if (g < 0) return { x: UFO0.x + Math.sin(t * 0.03) * 2, y: UFO0.y + Math.sin(t * 0.05) * 1.5, held: false };
  const k = ease(g / 16), hx = UFO0.x + 8, hy = UFO0.y + 6;
  const shake = g > 16 ? Math.round(Math.sin(g * 1.3) * 1) : 0;
  return { x: UFO0.x + (hx - UFO0.x) * k + shake, y: UFO0.y + (hy - UFO0.y) * k, held: true };
};
/** The truck in the wide shot: in the beam going up; dropping as the beam goes; in Satan's hand; thrown. */
const truckNow = (t: number) => {
  const g = since(clip.grab), cat = since(clip.catch), th = since(clip.throw);
  const up = { x: UFO0.x, y: GTOP - 2 - Math.min(26, t * 0.12) };
  if (th >= 0) { const k = th / 40; return { x: 230 + k * 120, y: 34 - k * 70 + k * k * 30, rot: th * 0.4, s: 1 }; }
  if (cat >= 0) { const k = ease(cat / 14); const hand = { x: 236, y: 44 }; return { x: up.x + (hand.x - up.x) * k, y: up.y + 6 + (hand.y - up.y - 6) * k, rot: 0.3 * k, s: 1 }; }
  if (g >= 0) return { x: up.x, y: up.y + Math.min(6, g * 0.4), rot: Math.sin(g * 0.3) * 0.1, s: 1 };
  return { ...up, rot: Math.sin(t * 0.05) * 0.06, s: 1 };
};
export const SATAN_MOUTH = (): [number, number] => [SAT.x + 2, satanTop() + 44];
export const UFO_MOUTH = (): [number, number] => { const u = ufoNow(clip.t); return [u.x, u.y - 6]; };
export const TRUCK_MOUTH = (): [number, number] => { const tr = truckNow(clip.t); return [tr.x, tr.y - 10]; };

/** Satan's painting, the once, cut off under the shoulders (his folded arms left out: these are reaching). */
const satanUpper = () => bake('satan-upper', 880, 560, g => { g.translate(440, 90); paintSatan(g); });
const SK = ['#260404', '#4A0A08', '#721410', '#982018', '#BE3424', '#DE5838'];
/** One of his arms (front on): shoulder to hand, the elbow out to the side (limb.ts), thick, banded, a claw at the end. */
const satanArm = (c: Ctx, sx: number, sy: number, hx: number, hy: number, out: number, open: boolean) => {
  const UP = 54, FORE = 50;
  const [ex, ey] = elbowFront(sx, sy, hx, hy, UP, FORE, out);
  const seg = (x0: number, y0: number, x1: number, y1: number, w: number) => {
    c.lineCap = 'round';
    c.strokeStyle = INK; c.lineWidth = w + 3; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    c.strokeStyle = SK[2]; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    c.strokeStyle = SK[4]; c.lineWidth = w * 0.4; c.beginPath(); c.moveTo(x0 - out * w * 0.15, y0 - w * 0.2); c.lineTo(x1 - out * w * 0.15, y1 - w * 0.2); c.stroke();
    c.lineCap = 'butt';
  };
  seg(sx, sy, ex, ey, 16); seg(ex, ey, hx, hy, 12);
  // (the hand: a fist round what it's got, or open, claws out)
  c.fillStyle = INK; c.beginPath(); c.arc(hx, hy, 8, 0, Math.PI * 2); c.fill();
  c.fillStyle = SK[3]; c.beginPath(); c.arc(hx, hy, 6.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = SK[5]; c.fillRect(Math.round(hx - 4), Math.round(hy - 5), 4, 2);
  for (let k = -1; k <= 1; k++) {
    const a = -Math.PI / 2 + k * 0.6, r0 = 6, r1 = open ? 14 : 9;
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(hx + Math.cos(a) * r0, hy + Math.sin(a) * r0); c.lineTo(hx + Math.cos(a) * r1, hy + Math.sin(a) * r1); c.stroke();
    c.strokeStyle = '#4A403A'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(hx + Math.cos(a) * r0, hy + Math.sin(a) * r0); c.lineTo(hx + Math.cos(a) * r1, hy + Math.sin(a) * r1); c.stroke();
  }
};
export const shotWide = (c: Ctx, t: number, talking: boolean) => {
  const T = clip.t;
  c.drawImage(bake(`wide-${timeOfDay().key}`, ART_W, ART_H, paintWide), 0, 0);
  drawMoon(c, 220, 18, 7);
  const rise = since(clip.rise), u = ufoNow(T), tr = truckNow(T), g = since(clip.grab);
  // (the hellfire's light up behind the garage, glowing harder as he comes)
  if (rise >= 0) { c.fillStyle = `rgba(249, 115, 22, ${(0.2 * clamp01(rise / 30)).toFixed(3)})`; c.fillRect(110, 0, 146, GROUND); }
  drawSatanWide(c, T, talking, u, tr, g, rise);
  c.drawImage(bake('garage', ART_W, ART_H, paintGarage), 0, 0);
  // (the ground splitting in front of it: a crack across the lot, the fire up out of it)
  if (rise >= 0) {
    const k = clamp01(rise / 30);
    c.fillStyle = INK; c.beginPath(); c.moveTo(150, GROUND + 2); for (let i = 0; i <= 10; i++) c.lineTo(150 + i * 10, GROUND + 2 + (i % 2 ? 3 : -1) * k * 2); c.lineTo(256, GROUND + 6 * k); c.lineTo(150, GROUND + 6 * k); c.closePath(); c.fill();
    R(c, 152, GROUND + 1, 104 * k, 2, (T >> 2) % 2 ? '#F97316' : '#FBBF24');
  }
  // The saucer (her standby: the same make), its beam down into the roof (cut once he's got it)
  c.save(); c.translate(u.x, u.y + 4); c.scale(0.3, 0.3); drawSaucer(c, T, false, u.held ? 1 : 0, u.held ? 0 : 1); c.restore();
  if (!u.held) beam(c, u.x, u.y + 3, GTOP + 2, 14, 46, T);
  else if (g < 8 && (g >> 1) % 2 === 0) beam(c, u.x, u.y + 3, GTOP + 2, 14, 46, T, 0.5);
  // The truck: going up, dropping, in his hand, thrown (tumbling off out of the picture)
  if (tr.x < ART_W + 30) miniTruck(c, tr.x, tr.y, tr.s, tr.rot);
  // (his fist over the saucer: drawn over it so it's in his grip)
  if (g >= 14 && rise >= 0) { const hx = u.x + 6, hy = u.y + 2; c.fillStyle = INK; c.beginPath(); c.arc(hx, hy, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = SK[3]; c.beginPath(); c.arc(hx, hy, 6.5, 0, Math.PI * 2); c.fill(); c.fillStyle = SK[5]; c.fillRect(hx - 4, hy - 5, 4, 2); }
  // (the throw: speed lines after it)
  const th = since(clip.throw);
  if (th >= 0 && th < 30) for (let k = 0; k < 5; k++) R(c, 200 + k * 9 - th * 2, 20 + k * 6, 22, 1, 'rgba(255, 255, 255, 0.5)');
};
/** Satan, coming up out of the ground behind the garage: his painting from the chest up, the rest of him a banded
 *  trunk down behind it; his arms reaching (one for the saucer, one for the truck); the face live (the grin moving). */
const drawSatanWide = (c: Ctx, T: number, talking: boolean, u: ReturnType<typeof ufoNow>, tr: ReturnType<typeof truckNow>, g: number, rise: number) => {
  if (rise >= 0) {
    const top = satanTop(), s = SAT.s, x = SAT.x;
    c.save(); c.beginPath(); c.rect(0, 0, ART_W, GROUND + 1); c.clip();
    // (the trunk under the painting)
    c.fillStyle = INK; c.fillRect(Math.round(x - 52), Math.round(top + 92), 104, 200);
    bands(c, x - 51, top + 92, 102, 60, [SK[3], SK[2], SK[1], SK[0]]);
    c.drawImage(satanUpper(), Math.round(x - 440 * s), Math.round(top - 90 * s), Math.round(880 * s), Math.round(560 * s));
    c.save(); c.translate(x, top); c.scale(s, s); drawSatanFace(c, T, talking); c.restore();
    // (his right (screen left) arm: up to the saucer once he grabs; else down at his side; his left: the truck)
    const shY = top + 68;
    const reachL = g >= 0 ? [u.x + 6, u.y + 2] : [x - 74, top + 120];
    satanArm(c, x - 56, shY, reachL[0], reachL[1], -1, g < 0);
    const cat = since(clip.catch), th = since(clip.throw);
    const reachR = th >= 0 ? (th < 10 ? [256, 20] : [262, 60]) : cat >= 0 ? [tr.x + 4, tr.y + 6] : [x + 74, top + 120];
    satanArm(c, x + 56, shY, reachR[0], reachR[1], 1, cat < 0 || th > 8);
    c.restore();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// flight: over the water park in the dark, the truck tumbling; and the crash in the lot outside its gate

/** The water park, below, far off: slides' tubes curling, a tower, the wave pool's gleam, palms. */
const paintWaterPark = (g: Ctx, w: number) => {
  const Y = 110;
  R(g, 0, Y, w, ART_H - Y, '#0E1424');
  for (let i = 0; i < 6; i++) {
    const x = 30 + i * 90 + hash(i) * 30, h = 30 + hash(i + 3) * 30;
    R(g, x, Y - h, 6, h, '#2A3450'); R(g, x - 4, Y - h - 4, 14, 5, '#3A4466');
    const col = ['#22D3EE', '#F472B6', '#FACC15', '#4ADE80'][i % 4];
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(x + 6, Y - h); g.bezierCurveTo(x + 40, Y - h, x + 10, Y - 10, x + 60, Y); g.stroke();
    g.strokeStyle = col; g.lineWidth = 4; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.4)'; g.lineWidth = 1; g.stroke();
  }
  R(g, 0, Y, w, 4, '#1A3A5A'); for (let x = 0; x < w; x += 7) R(g, x, Y + 1, 4, 1, '#3A7AAA');
  for (let i = 0; i < 10; i++) { const x = hash(i * 7) * w; R(g, x, Y - 18, 2, 18, '#1A1410'); R(g, x - 6, Y - 20, 14, 3, '#123A1A'); }
};
export const shotFlight = (c: Ctx, t: number) => {
  c.drawImage(bake(`flightSky-${timeOfDay().key}`, ART_W, ART_H, g => nightSky(g, 110)), 0, 0);
  const pk = bake('waterpark', 600, ART_H, g => paintWaterPark(g, 600));
  c.drawImage(pk, -Math.round((t * 2) % 340), 0);
  miniTruck(c, 128 + Math.sin(t * 0.05) * 10, 56 + Math.sin(t * 0.08) * 6, 2, t * 0.18);
  for (let k = 0; k < 6; k++) R(c, ((k * 53 - t * 6) % 300 + 300) % 300 - 20, 20 + k * 18, 30, 1, 'rgba(255, 255, 255, 0.35)');
};
export const FLIGHT_MOUTH: [number, number] = [128, 44];

/** The lot outside the gate: asphalt, the gate's arch far off; the truck coming down out of the sky into it. */
export const shotCrash = (c: Ctx, t: number) => {
  c.drawImage(bake(`lotSky-${timeOfDay().key}`, ART_W, ART_H, g => {
    nightSky(g, 100);
    paintWaterPark(g, ART_W);
    bands(g, 0, 104, ART_W, 40, ['#2A2C34', '#22242A', '#1A1B20']);
    for (let i = 0; i < 10; i++) R(g, 10 + i * 26, 118, 1, 10, '#6A6C72');
    // (the gate's arch: two towers, the arch, its name)
    R(g, 160, 66, 10, 40, INK); R(g, 161, 67, 8, 38, '#3A5A8A'); R(g, 226, 66, 10, 40, INK); R(g, 227, 67, 8, 38, '#3A5A8A');
    g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.arc(198, 80, 34, Math.PI, 0); g.stroke(); g.strokeStyle = '#22D3EE'; g.lineWidth = 5; g.stroke();
  }), 0, 0);
  const fall = 26, k = clamp01(t / fall);
  if (t < fall) miniTruck(c, 40 + k * 50, -20 + k * 132, 1.6, 2.2 + k * 1.6);
  else {
    // (down: on its roof, smashed, the dust and bits going up; then settling)
    const u = t - fall, sh = u < 10 ? (u % 2 ? 2 : -2) : 0;
    miniTruck(c, 92 + sh, 116, 1.6, Math.PI * 0.96);
    for (let i = 0; i < 12; i++) {
      const a = Math.PI + (i / 11) * Math.PI, sp = 1 + hash(i) * 2, tt = Math.min(u, 30);
      const x = 92 + Math.cos(a) * sp * tt, y = 112 + Math.sin(a) * sp * tt + 0.08 * tt * tt;
      if (y < 128) R(c, x, y, 2, 2, i % 3 ? '#9A9CA2' : '#C82A22');
    }
    const d = clamp01(1 - u / 60);
    if (d > 0) for (let i = 0; i < 6; i++) { c.fillStyle = `rgba(180, 176, 170, ${(0.5 * d).toFixed(2)})`; c.beginPath(); c.ellipse(80 + i * 6, 112 - (1 - d) * 20 - i * 2, 10 + (1 - d) * 12, 6, 0, 0, Math.PI * 2); c.fill(); }
  }
};
