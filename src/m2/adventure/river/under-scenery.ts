// Under the river, the set pieces (final pass): the rides sunk on the bed (solid: stood on, swum round), the junk of the
// ride graveyard that isn't (the carousel horse, the barricade with the sign, the bumper car, the height sign), and the
// animatronic dinosaurs in the prop storage (harmless scenery: seams, hydraulics showing, the price tag still on one).
// Still art is stamped; anything that moves (a nodding head, a swinging tag, a blinking eye) is drawn live over it.

import type { GameState } from '../../../m1/game/core/state';
import { box, mix, rampOf, checker, stamp, hash, sign, pole, ball, INK } from '../../intro/art/kit';
import { signAt, plank, enamel, print, stone } from '../letters';
import { PROPS, DINOS, bedAt, CEIL, type Prop } from './course';
import { R, viewOf, onScreen, waterAt, zoneAt, type Ctx, type V } from './under';

/**
 * A shape painted the SNES way: an ink line round it, lit along its upper left, shaded along its lower right (the
 * shape's own outline, offset, cut out of itself), `ramp` its five steps (darkest first).
 */
export const shade = (c: Ctx, shape: (c: Ctx) => void, r: string[], ink = true, edge = 3) => {
  if (ink) { c.beginPath(); shape(c); c.lineWidth = 3; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke(); }
  c.save();
  c.beginPath(); shape(c); c.clip();
  c.fillStyle = r[3]; c.beginPath(); shape(c); c.fill();
  c.translate(edge, edge); c.fillStyle = r[2]; c.beginPath(); shape(c); c.fill(); c.translate(-edge, -edge);
  // (the shadow: everything not in the shape shifted up-left)
  c.fillStyle = r[1]; c.beginPath(); c.rect(-1e4, -1e4, 2e4, 2e4); c.translate(-edge - 1, -edge - 1); shape(c); c.translate(edge + 1, edge + 1); c.fill('evenodd');
  c.restore();
};
/** Scales (or a texture) speckled over a shape: little dark dots on a staggered grid, inside it. */
const speckle = (c: Ctx, shape: (c: Ctx) => void, col: string, x0: number, y0: number, w: number, h: number, step = 6) => {
  c.save(); c.beginPath(); shape(c); c.clip();
  for (let y = y0; y < y0 + h; y += step) for (let x = x0 + ((y / step) % 2 ? step / 2 : 0); x < x0 + w; x += step) box(c, x, y, 2, 2, col);
  c.restore();
};
/** Into the murk a way: background things (not to be stood on) fogged toward the water's color there. */
const fog = (col: string, x: number, k: number, v: V) => mix(col, waterAt(zoneAt(x), 0.55, v.tod), k);
const fogRamp = (col: string, x: number, k: number, v: V) => rampOf(col).map(c => fog(c, x, k, v));

// ---------------------------------------------------------------------------------------------------------------
// The sunk rides (solid). Each painted in its own box: (x, y) its top left, the top its lip (lit: it's stood on).

const lipOn = (c: Ctx, x: number, y: number, w: number, col: string) => { box(c, x, y, w, 3, col); box(c, x, y, w, 1, '#FFFFFF'); box(c, x, y + 3, w, 1, INK); };

const paintRock = (c: Ctx, x: number, y: number, w: number, h: number, fake: boolean) => {
  const r = fake ? rampOf('#5E6E80') : rampOf('#5C564A');
  const shape = (g: Ctx) => { g.moveTo(x + 6, y); g.lineTo(x + w - 8, y); g.quadraticCurveTo(x + w + 2, y + 4, x + w - 2, y + 18); g.quadraticCurveTo(x + w + 8, y + h * 0.5, x + w + 4, y + h + 30); g.lineTo(x - 4, y + h + 30); g.quadraticCurveTo(x - 8, y + h * 0.4, x - 1, y + 20); g.quadraticCurveTo(x - 4, y + 4, x + 6, y); g.closePath(); };
  shade(c, shape, r);
  // (cracks, facets: stepped darker lines; the fake one's fiberglass seam and its bolts)
  c.save(); c.beginPath(); shape(c); c.clip();
  for (let k = 0; k < 4; k++) { const cx = x + 14 + hash(x + k) * (w - 30); for (let s = 0; s < 22; s += 2) box(c, cx + Math.round(Math.sin(s + k) * 2), y + 14 + k * 9 + s, 2, 2, r[0]); }
  if (fake) { for (let s = 0; s < h + 30; s += 2) box(c, x + w * 0.55, y + s, 1, 2, '#2A3440'); for (let s = 10; s < h; s += 22) { box(c, x + w * 0.55 - 4, y + s, 3, 3, '#A8B4C0'); } }
  else checker(c, x, y + 4, w, 8, '#4A6A2A');
  c.restore();
  lipOn(c, x + 6, y, w - 14, fake ? '#B8C8D8' : '#B8B098');
};

const paintBoat = (c: Ctx, x: number, y: number, w: number, h: number) => {
  // (the hull, sunk in the silt to its waterline: planks, the stripe, the name, portholes, weed on it)
  const H = rampOf('#A8481A');
  const hull = (g: Ctx) => { g.moveTo(x - 6, y); g.lineTo(x + w + 10, y); g.lineTo(x + w - 6, y + h + 30); g.lineTo(x + 8, y + h + 30); g.closePath(); };
  shade(c, hull, H);
  c.save(); c.beginPath(); hull(c); c.clip();
  for (let py = y + 10; py < y + h + 30; py += 8) box(c, x - 6, py, w + 16, 1, H[1]);
  box(c, x - 6, y + 6, w + 16, 5, '#E8E0D0'); box(c, x - 6, y + 6, w + 16, 1, '#FFFFFF');
  for (let k = 0; k < 4; k++) { const px = x + 40 + k * 56; c.fillStyle = INK; c.beginPath(); c.arc(px, y + 30, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = '#0A2830'; c.beginPath(); c.arc(px, y + 30, 6, 0, Math.PI * 2); c.fill(); box(c, px - 3, y + 26, 2, 2, '#4A8090'); }
  checker(c, x - 6, y + h + 4, w + 16, 26, '#2E4A1E'); box(c, x - 6, y + h + 14, w + 16, 16, '#2A3A1A');
  c.restore();
  signAt(c, 'JUNGLE CRUISE', x + w * 0.5, y + 48, 6, plank(6, '#F2D04A', undefined, '#5A1A08', 1));
  signAt(c, '3', x + w - 26, y + 34, 10, plank(10, '#F2D04A', undefined, '#5A1A08', 2));
  // (its canopy's posts, snapped; the striped canopy's rags off one)
  pole(c, x + 10, y - 58, 4, 58, '#A8A29E'); pole(c, x + w - 16, y - 26, 4, 26, '#A8A29E');
  for (let k = 0; k < 5; k++) { box(c, x + 14, y - 58 + k * 9, 16 - k * 2, 9, k % 2 ? '#E8E0D0' : '#B02020'); }
  // (the last skipper, at the stern: it ran out of gas on him too)
  const sx = x + w - 52, sy = y;
  box(c, sx - 6, sy - 22, 12, 14, '#E8E4D8'); box(c, sx - 6, sy - 22, 12, 2, '#FFFFFF');
  for (let k = 0; k < 3; k++) box(c, sx - 5, sy - 18 + k * 4, 10, 1, '#5A5A50');
  box(c, sx - 1, sy - 8, 2, 8, '#E8E4D8');
  box(c, sx - 6, sy - 34, 12, 11, '#F0ECE0'); box(c, sx - 4, sy - 30, 3, 3, INK); box(c, sx + 1, sy - 30, 3, 3, INK); box(c, sx - 3, sy - 25, 6, 1, INK);
  box(c, sx - 9, sy - 38, 18, 4, '#E8D8A0'); box(c, sx - 6, sy - 42, 12, 5, '#E8D8A0'); box(c, sx - 6, sy - 39, 12, 1, '#7A3A1A');
  lipOn(c, x - 6, y, w + 16, '#F0C890');
};

const paintTeacup = (c: Ctx, x: number, y: number, w: number, h: number, k: number) => {
  const col = k ? '#7AB8E8' : '#F49AC8', r = rampOf(col);
  // (the saucer it turns on, then the cup: flared at the rim, round at the foot; a handle, dots, a gold rim)
  shade(c, g => { g.ellipse(x + w / 2, y + h + 4, w / 2 + 12, 9, 0, 0, Math.PI * 2); }, rampOf('#C8B8C8'));
  const cup = (g: Ctx) => { g.moveTo(x - 2, y); g.lineTo(x + w + 2, y); g.quadraticCurveTo(x + w, y + h, x + w / 2, y + h); g.quadraticCurveTo(x, y + h, x - 2, y); g.closePath(); };
  c.beginPath(); c.lineWidth = 5; c.strokeStyle = INK; c.arc(x + w + 2, y + h * 0.4, 10, -Math.PI / 2, Math.PI / 2); c.stroke();
  c.beginPath(); c.lineWidth = 3; c.strokeStyle = r[2]; c.arc(x + w + 2, y + h * 0.4, 10, -Math.PI / 2, Math.PI / 2); c.stroke();
  shade(c, cup, r);
  c.save(); c.beginPath(); cup(c); c.clip();
  for (let dy = 10; dy < h; dy += 12) for (let dx = (dy / 12) % 2 ? 6 : 12; dx < w; dx += 14) { box(c, x + dx, y + dy, 5, 5, k ? '#F8F0E0' : '#BE185D'); box(c, x + dx, y + dy, 2, 2, '#FFFFFF'); }
  c.restore();
  lipOn(c, x - 2, y, w + 4, '#F2D04A');
};

const paintLog = (c: Ctx, x: number, y: number, w: number, h: number) => {
  const r = rampOf('#7A4A1E');
  const log = (g: Ctx) => { g.moveTo(x + 10, y); g.lineTo(x + w - 14, y); g.quadraticCurveTo(x + w + 10, y + 2, x + w + 6, y + h + 20); g.lineTo(x + 2, y + h + 20); g.quadraticCurveTo(x - 12, y + 6, x + 10, y); g.closePath(); };
  shade(c, log, r);
  c.save(); c.beginPath(); log(c); c.clip();
  // (bark: wavy stepped lines along it; the seat's recess under the lip; knots)
  for (let ly = y + 8; ly < y + h + 20; ly += 6) for (let lx = x; lx < x + w; lx += 8) box(c, lx + Math.round(Math.sin(lx * 0.2 + ly) * 2), ly, 6, 1, r[1]);
  box(c, x + 24, y + 5, w - 50, 7, r[0]); box(c, x + 24, y + 12, w - 50, 1, r[3]);
  for (const kx of [0.25, 0.7]) { c.fillStyle = r[0]; c.beginPath(); c.ellipse(x + w * kx, y + h * 0.7, 6, 4, 0, 0, Math.PI * 2); c.fill(); }
  c.restore();
  signAt(c, 'SPLASH!', x + w * 0.5, y + h - 2, 7, plank(7, '#F8E0A0', undefined, '#3A1A08', 3));
  signAt(c, 'LOG 12', x + w - 30, y + h + 12, 5, plank(5, '#F8E0A0', undefined, '#3A1A08', 4));
  lipOn(c, x + 6, y, w - 16, '#E8C078');
};

const paintBooth = (c: Ctx, x: number, y: number, w: number, h: number) => {
  // (the roof (stood on: lit), the scalloped awning, the fascia with the word on it, the window, the price board)
  box(c, x, y, w, 10, '#B02020'); box(c, x, y + 10, w, 2, INK);
  for (let k = 0; k < w; k += 15) { c.fillStyle = (k / 15) % 2 ? '#F0E8D8' : '#C02828'; c.beginPath(); c.moveTo(x + k, y + 12); c.lineTo(x + k + 15, y + 12); c.arc(x + k + 7.5, y + 12, 7.5, 0, Math.PI); c.fill(); }
  const body = (g: Ctx) => g.rect(x + 4, y + 20, w - 8, h + 10);
  shade(c, body, rampOf('#1A8AA0'));
  sign(c, x + 12, y + 24, w - 24, 14, '#F2D04A', 'TICKETS', '#5A1A08', 6, INK, plank(6, '#5A1A08', undefined, '#C8A030', 5));
  box(c, x + 16, y + 44, w - 32, 34, INK); box(c, x + 18, y + 46, w - 36, 30, '#0A3040');
  box(c, x + 20, y + 48, 10, 26, '#2A6070');
  box(c, x + 26, y + 54, w - 52, 14, '#F0E8D8'); signAt(c, 'CLOSED', x + w / 2, y + 64, 5, print(5, '#B02020'));
  box(c, x + 12, y + 80, w - 24, 2, INK); box(c, x + 12, y + 78, w - 24, 2, '#E0E0D0');
  signAt(c, 'ADULTS $4.50', x + w / 2, y + 96, 5, plank(5, '#F8F0E0', undefined, INK, 6));
  signAt(c, 'KIDS $2.25', x + w / 2, y + 106, 5, plank(5, '#F8F0E0', undefined, INK, 7));
  lipOn(c, x, y, w, '#F08080');
};

const paintProp = (c: Ctx, p: Prop, i: number) => {
  const x = R(p.x), y = Math.round(bedAt(p.x + p.w / 2) - p.h);
  if (p.look === 'rock') paintRock(c, x, y, p.w, p.h, zoneAt(p.x) === 'tank');
  else if (p.look === 'boat') paintBoat(c, x, y, p.w, p.h);
  else if (p.look === 'teacup') paintTeacup(c, x, y, p.w, p.h, i % 2);
  else if (p.look === 'log') paintLog(c, x, y, p.w, p.h);
  else paintBooth(c, x, y, p.w, p.h);
};

export const drawProps = (c: Ctx, state: GameState) => {
  const v = viewOf(state);
  PROPS.forEach((p, i) => {
    if (!onScreen(v, R(p.x) - 20, R(p.x + p.w) + 20)) return;
    const y = bedAt(p.x + p.w / 2) - p.h;
    stamp(c, `uw-prop-${i}`, R(p.x) - 30, y - 70, p.w + 60, p.h + 110, g => paintProp(g, p, i));
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The ride graveyard's junk that isn't solid (back of the play layer, fogged: not to be stood on)

const paintHorse = (c: Ctx, v: V) => {
  const px = R(6800), bed = bedAt(6800), x = R(6800), y = 864;
  // (the brass pole, ceiling to bed: twisted, stepped)
  pole(c, px - 3, CEIL, 6, bed - CEIL, fog('#C8A040', 6800, 0.35, v), false);
  for (let yy = CEIL + 4; yy < bed; yy += 10) box(c, px - 3, yy, 6, 2, fog('#7A5A18', 6800, 0.35, v));
  const W = fogRamp('#F4F0E8', 6800, 0.3, v);
  // (the horse: leaping, its head up; the saddle, the bridle, a painted eye, the mane, the tail)
  shade(c, g => { g.ellipse(x - 4, y, 40, 18, 0, 0, Math.PI * 2); }, W);
  shade(c, g => { g.moveTo(x + 24, y - 10); g.lineTo(x + 44, y - 42); g.lineTo(x + 62, y - 36); g.lineTo(x + 54, y - 26); g.lineTo(x + 38, y + 2); g.closePath(); }, W);
  for (const [lx, ly, a] of [[-30, 10, 0.6], [-20, 12, 0.2], [14, 10, -0.6], [26, 8, -1.1]] as [number, number, number][]) {
    c.save(); c.translate(x + lx, y + ly); c.rotate(a); shade(c, g => g.rect(-4, 0, 8, 28), W); box(c, -5, 24, 10, 6, fog('#3A3A3A', 6800, 0.3, v)); c.restore();
  }
  shade(c, g => { g.rect(x - 14, y - 22, 28, 12); }, fogRamp('#E05090', 6800, 0.3, v));
  box(c, x - 16, y - 12, 32, 3, fog('#E8C040', 6800, 0.3, v));
  box(c, x + 46, y - 36, 10, 2, fog('#E8C040', 6800, 0.3, v)); box(c, x + 50, y - 38, 3, 3, INK);
  for (let k = 0; k < 5; k++) box(c, x + 30 + k * 3, y - 34 + k * 5, 6, 6, fog('#E8C040', 6800, 0.25, v));
  for (let k = 0; k < 4; k++) box(c, x - 46 - k * 3, y - 6 + k * 5, 6, 8, fog('#E8C040', 6800, 0.25, v));
};

const paintBarricade = (c: Ctx, v: V) => {
  const x = R(7040), bed = bedAt(7105);
  // (a sawhorse barricade, striped, the sign wired to its rail)
  const st = (sx: number, a: number) => { c.save(); c.translate(sx, bed); c.rotate(a); box(c, -3, -70, 6, 70, fog('#D8D0C0', 7100, 0.3, v)); c.restore(); };
  st(x + 14, 0.12); st(x + 30, -0.12); st(x + 104, 0.12); st(x + 120, -0.12);
  for (let k = 0; k < 136; k += 16) box(c, x - 4 + k, bed - 66, 8, 12, fog('#E86A1A', 7100, 0.3, v));
  for (let k = 8; k < 136; k += 16) box(c, x - 4 + k, bed - 66, 8, 12, fog('#F0EAE0', 7100, 0.3, v));
  box(c, x - 4, bed - 66, 136, 1, fog('#FFFFFF', 7100, 0.3, v)); box(c, x - 4, bed - 54, 136, 2, fog(INK, 7100, 0.2, v));
  sign(c, x, bed - 110, 130, 38, fog('#E8E0C8', 7100, 0.25, v), '', INK, 6, fog('#5A5A5A', 7100, 0.3, v));
  signAt(c, 'CLOSED FOR', x + 65, bed - 96, 7, enamel(7, fog('#A01818', 7100, 0.2, v)));
  signAt(c, 'REFURBISHMENT', x + 65, bed - 86, 6, enamel(6, fog('#A01818', 7100, 0.2, v)));
  signAt(c, 'BACK SOON! 1994', x + 65, bed - 77, 5, print(5, fog('#3A3A3A', 7100, 0.2, v)));
  // (the wire it's tied on with)
  box(c, x + 20, bed - 72, 1, 6, fog('#8A8A8A', 7100, 0.3, v)); box(c, x + 110, bed - 72, 1, 6, fog('#8A8A8A', 7100, 0.3, v));
};

const paintBumper = (c: Ctx, v: V) => {
  const x = R(5790), bed = bedAt(5830);
  c.save(); c.translate(x + 40, bed - 18); c.rotate(-0.35);
  shade(c, g => { g.roundRect(-40, -20, 80, 30, 10); }, fogRamp('#2A6AD0', 5830, 0.35, v));
  box(c, -44, 6, 88, 8, fog('#2A2A2A', 5830, 0.35, v));
  pole(c, 20, -70, 3, 50, fog('#A0A0A0', 5830, 0.35, v), false);
  signAt(c, '7', -4, 2, 12, enamel(12, fog('#F2D04A', 5830, 0.3, v), fog(INK, 5830, 0.3, v)));
  c.restore();
};

const paintHeight = (c: Ctx, v: V) => {
  const x = R(6640), bed = bedAt(6640);
  c.save(); c.translate(x, bed); c.rotate(0.18);
  pole(c, -3, -150, 6, 150, fog('#8A8A8A', 6640, 0.35, v), false);
  sign(c, -2, -150, 70, 44, fog('#F2D04A', 6640, 0.3, v), '', INK, 6, fog('#3A3F48', 6640, 0.35, v));
  signAt(c, 'YOU MUST BE', 33, -136, 5, print(5, fog('#3A1A08', 6640, 0.25, v)));
  signAt(c, 'THIS TALL', 33, -126, 5, print(5, fog('#3A1A08', 6640, 0.25, v)));
  signAt(c, 'TO DROWN', 33, -116, 5, print(5, fog('#A01818', 6640, 0.25, v)));
  // (the cartoon monkey's arm out to the line)
  box(c, 2, -104, 60, 4, fog('#7A4A1E', 6640, 0.3, v)); box(c, 60, -106, 8, 8, fog('#E8C090', 6640, 0.3, v));
  c.restore();
};

/** A slice of the carousel's canopy stuck in the bed: scallops, mirrors, bulbs (a couple still lit, God knows how). */
const paintCanopy = (c: Ctx, v: V) => {
  const x = R(6900), bed = bedAt(6960);
  c.save(); c.translate(x, bed); c.rotate(-0.4);
  shade(c, g => g.rect(0, -40, 130, 40), fogRamp('#C83A3A', 6960, 0.35, v));
  for (let k = 0; k < 130; k += 26) { box(c, k + 4, -34, 18, 14, fog('#9AB8C8', 6960, 0.3, v)); box(c, k + 4, -34, 6, 4, fog('#E8F0F8', 6960, 0.3, v)); }
  for (let k = 0; k < 130; k += 13) { c.fillStyle = fog((k / 13) % 2 ? '#F0E8D0' : '#C83A3A', 6960, 0.35, v); c.beginPath(); c.arc(k + 6.5, 0, 6.5, 0, Math.PI); c.fill(); }
  c.restore();
};

export const drawYard = (c: Ctx, state: GameState) => {
  const v = viewOf(state);
  if (!onScreen(v, R(5700), R(7300))) return;
  if (onScreen(v, R(5760), R(5900))) stamp(c, 'uw-bumper', R(5720), bedAt(5830) - 110, 160, 130, g => paintBumper(g, v));
  if (onScreen(v, R(6600), R(6720))) stamp(c, 'uw-height', R(6620), bedAt(6640) - 170, 120, 180, g => paintHeight(g, v));
  if (onScreen(v, R(6880), R(7040))) stamp(c, 'uw-canopy', R(6880), bedAt(6960) - 110, 170, 130, g => paintCanopy(g, v));
  if (onScreen(v, R(6730), R(6880))) stamp(c, 'uw-horse', R(6730), CEIL - 4, 150, bedAt(6800) - CEIL + 10, g => paintHorse(g, v));
  // (the horse goes up and down on its pole still, a little, the current at it: no, it doesn't. It's stuck.)
  if (onScreen(v, R(7020), R(7180))) stamp(c, 'uw-barricade', R(7020), bedAt(7105) - 120, 160, 130, g => paintBarricade(g, v));
  // (a couple of the canopy's bulbs, still lit)
  if (onScreen(v, R(6880), R(7040)) && v.f % 90 < 70) {
    const bed = bedAt(6960);
    for (const k of [1, 4]) { const a = -0.4, lx = R(6900) + Math.cos(a) * (k * 26 + 13) - Math.sin(a) * -44, ly = bed + Math.sin(a) * (k * 26 + 13) + Math.cos(a) * -44; box(c, lx - 2, ly - 2, 4, 4, '#FFF0A0'); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The animatronic dinosaurs: on their plinths (DINO-SAFARI's, from the storage), fogged a little (they're back of where
// he swims). Bodies stamped; heads stamped too, put down live where the nod has them (jerky: it's hydraulics).

type DinoLook = (typeof DINOS)[number]['look'];
const DINO_COL: Record<DinoLook, string> = { rex: '#4D7C0F', stego: '#6A9A20', trike: '#B0701A', bronto: '#3A8A80' };
const STEEL = ['#2A2E34', '#4A5058', '#6E7680', '#A0A8B0', '#D8E0E8'];

/** A hydraulic ram: its cylinder, the chrome rod out of it (`out` long), the hoses. */
const ram = (c: Ctx, x: number, y: number, x2: number, y2: number, steel: string[]) => {
  const ang = Math.atan2(y2 - y, x2 - x), len = Math.hypot(x2 - x, y2 - y);
  c.save(); c.translate(x, y); c.rotate(ang);
  box(c, 0, -4, len * 0.55, 8, INK); box(c, 1, -3, len * 0.55 - 2, 6, steel[1]); box(c, 1, -3, len * 0.55 - 2, 2, steel[2]);
  box(c, len * 0.55, -2, len * 0.45, 4, steel[3]); box(c, len * 0.55, -2, len * 0.45, 1, steel[4]);
  c.restore();
};
/** The plinth: a steel turntable, bolts round it, the plate on its front. */
const plinth = (c: Ctx, x: number, w: number, label: string, steel: string[]) => {
  box(c, x - w / 2, -14, w, 14, INK); box(c, x - w / 2 + 1, -13, w - 2, 12, steel[1]); box(c, x - w / 2 + 1, -13, w - 2, 2, steel[3]);
  for (let k = x - w / 2 + 6; k < x + w / 2 - 4; k += 12) box(c, k, -9, 2, 2, steel[4]);
  box(c, x - 22, -13, 44, 11, steel[3]); signAt(c, label, x, -5, 5, stone(5, steel[0], steel[4]));
};

const paintDinoBody = (c: Ctx, look: DinoLook, v: V, wx: number) => {
  const r = fogRamp(DINO_COL[look], wx, 0.28, v), belly = fogRamp(mix(DINO_COL[look], '#E8D8A0', 0.5), wx, 0.28, v), st = STEEL.map(s => fog(s, wx, 0.28, v));
  const seam = r[0], wire = fog('#C83030', wx, 0.25, v), wire2 = fog('#E8C030', wx, 0.25, v);
  if (look === 'rex') {
    plinth(c, 0, 140, 'UNIT 4', st);
    ram(c, -10, -14, -10, -64, st);
    const tail = (g: Ctx) => { g.moveTo(-40, -112); g.quadraticCurveTo(-110, -118, -160, -96); g.lineTo(-40, -82); g.closePath(); };
    shade(c, tail, r);
    const leg = (dx: number) => (g: Ctx) => { g.moveTo(dx - 18, -96); g.lineTo(dx + 14, -96); g.lineTo(dx + 10, -40); g.lineTo(dx + 14, -14); g.lineTo(dx - 12, -14); g.lineTo(dx - 6, -44); g.closePath(); };
    shade(c, leg(-26), r); shade(c, leg(8), r);
    const body = (g: Ctx) => { g.ellipse(-4, -98, 52, 32, -0.25, 0, Math.PI * 2); };
    shade(c, body, r);
    shade(c, g => g.ellipse(6, -86, 30, 14, -0.25, 0, Math.PI * 2), belly, false);
    speckle(c, body, r[1], -60, -130, 110, 64);
    // (a skin panel off its flank: the frame inside, the wires)
    box(c, -36, -112, 30, 22, INK); box(c, -34, -110, 26, 18, st[0]);
    for (let k = -34; k < -8; k += 8) box(c, k, -110, 2, 18, st[2]); box(c, -34, -102, 26, 2, st[2]);
    box(c, -26, -96, 2, 12, wire); box(c, -20, -96, 2, 16, wire2);
    // (the seams between panels, riveted)
    for (const [sx, sy] of [[10, -126], [22, -110], [-48, -100]]) { for (let k = 0; k < 24; k += 2) box(c, sx + Math.round(k * 0.2), sy + k, 1, 2, seam); for (let k = 2; k < 24; k += 6) box(c, sx + 2, sy + k, 1, 1, st[4]); }
    // (the neck's ram, out to where the head goes)
    ram(c, 30, -118, 52, -150, st);
    // (its little arm (the tag hangs off it: live))
    shade(c, g => { g.rect(36, -96, 16, 6); }, r);
    box(c, 50, -92, 4, 4, belly[3]);
  } else if (look === 'stego') {
    plinth(c, 0, 160, 'UNIT 7', st);
    const tail = (g: Ctx) => { g.moveTo(-60, -70); g.quadraticCurveTo(-120, -64, -150, -40); g.lineTo(-58, -46); g.closePath(); };
    shade(c, tail, r);
    for (const [tx, ty] of [[-140, -46], [-126, -54]]) box(c, tx, ty - 10, 3, 12, belly[4]);
    for (const dx of [-50, -26, 26, 46]) shade(c, g => g.rect(dx - 9, -44, 18, 30), r);
    const body = (g: Ctx) => { g.moveTo(-70, -50); g.quadraticCurveTo(-60, -104, 0, -104); g.quadraticCurveTo(60, -104, 76, -54); g.lineTo(76, -40); g.lineTo(-70, -40); g.closePath(); };
    // (the plates along its back, one missing: the bracket where it was)
    for (let k = -54; k < 64; k += 22) {
      if (k === 12) { box(c, k - 2, -108, 4, 8, st[2]); continue; }
      const ph = 26 - Math.abs(k) * 0.12;
      shade(c, g => { g.moveTo(k - 10, -96); g.lineTo(k, -96 - ph); g.lineTo(k + 10, -96); g.closePath(); }, fogRamp('#C86A1A', wx, 0.28, v));
    }
    shade(c, body, r);
    speckle(c, body, r[1], -70, -104, 150, 64);
    for (let k = -40; k < 70; k += 36) { for (let s = 0; s < 50; s += 2) box(c, k, -98 + s, 1, 2, seam); }
    ram(c, 0, -14, 0, -42, st);
    ram(c, 64, -60, 82, -62, st);
  } else if (look === 'trike') {
    plinth(c, 0, 150, 'UNIT 2', st);
    for (const dx of [-44, -20, 22, 44]) shade(c, g => g.rect(dx - 9, -40, 18, 26), r);
    const body = (g: Ctx) => { g.moveTo(-64, -46); g.quadraticCurveTo(-56, -96, 6, -94); g.quadraticCurveTo(58, -92, 64, -52); g.lineTo(64, -36); g.lineTo(-64, -36); g.closePath(); };
    shade(c, g => { g.moveTo(-60, -60); g.lineTo(-104, -40); g.lineTo(-56, -44); g.closePath(); }, r);
    shade(c, body, r);
    speckle(c, body, r[1], -64, -96, 130, 60);
    for (let s = 0; s < 52; s += 2) box(c, -10, -92 + s, 1, 2, seam);
    // (a panel hanging open on its hinge)
    box(c, 20, -80, 24, 20, INK); box(c, 22, -78, 20, 16, st[0]); box(c, 44, -80, 3, 30, r[1]); box(c, 26, -74, 12, 2, wire);
    ram(c, 0, -14, 0, -36, st);
    ram(c, 52, -70, 70, -78, st);
  } else {
    plinth(c, 0, 170, 'UNIT 9', st);
    for (const dx of [-54, -28, 26, 50]) shade(c, g => g.rect(dx - 11, -46, 22, 32), r);
    const body = (g: Ctx) => { g.ellipse(0, -74, 76, 36, 0, 0, Math.PI * 2); };
    shade(c, g => { g.moveTo(-60, -80); g.quadraticCurveTo(-120, -70, -170, -30); g.lineTo(-60, -54); g.closePath(); }, r);
    shade(c, body, r);
    shade(c, g => g.ellipse(4, -56, 50, 12, 0, 0, Math.PI * 2), belly, false);
    speckle(c, body, r[1], -76, -110, 152, 72);
    for (const k of [-30, 10, 44]) for (let s = 0; s < 60; s += 2) box(c, k, -106 + s, 1, 2, seam);
    // (the neck's come off its mount: the mount, the bundle of wires out of it; the neck's on the floor, the head with it)
    box(c, 54, -104, 24, 18, INK); box(c, 56, -102, 20, 14, st[1]); box(c, 56, -102, 20, 2, st[3]);
    for (let k = 0; k < 4; k++) { c.strokeStyle = [wire, wire2, st[3], wire][k]; c.lineWidth = 2; c.beginPath(); c.moveTo(60 + k * 4, -96); c.quadraticCurveTo(80 + k * 6, -70, 96 + k * 6, -60 + k * 3); c.stroke(); }
    const neck = (g: Ctx) => { g.moveTo(84, -8); g.quadraticCurveTo(150, -40, 230, -14); g.lineTo(232, 0); g.lineTo(84, 0); g.closePath(); };
    shade(c, neck, r);
    for (let k = 100; k < 220; k += 20) box(c, k, -18 + Math.round((k - 150) * (k - 150) * 0.0008), 1, 10, seam);
    box(c, 84, -16, 6, 16, st[2]);
  }
};

/** The heads (each in its own frame, the neck end at 0, 0, looking right). */
const paintDinoHead = (c: Ctx, look: DinoLook, v: V, wx: number) => {
  const r = fogRamp(DINO_COL[look], wx, 0.28, v), st = STEEL.map(s => fog(s, wx, 0.28, v));
  const TEETH = fog('#F4F0E0', wx, 0.25, v), MOUTH = fog('#6A1A1A', wx, 0.25, v);
  if (look === 'rex') {
    const top = (g: Ctx) => { g.moveTo(-10, -10); g.quadraticCurveTo(-4, -36, 30, -34); g.lineTo(66, -26); g.lineTo(68, -8); g.lineTo(-6, 6); g.closePath(); };
    box(c, 4, 0, 56, 12, MOUTH);
    shade(c, g => { g.moveTo(-4, 6); g.lineTo(58, 2); g.lineTo(56, 16); g.lineTo(0, 18); g.closePath(); }, r);
    shade(c, top, r);
    for (let k = 10; k < 62; k += 7) { box(c, k, -8, 3, 6, TEETH); box(c, k + 2, 2, 3, 5, TEETH); }
    box(c, 26, -28, 10, 6, r[0]);
    // (a seam round the snout, where the latex was glued; a bolt showing)
    for (let s = -32; s < 4; s += 2) box(c, 44, s, 1, 2, r[0]);
    box(c, 40, -24, 3, 3, st[4]);
  } else if (look === 'stego') {
    shade(c, g => { g.moveTo(-6, -12); g.quadraticCurveTo(10, -22, 28, -12); g.lineTo(30, 4); g.lineTo(-6, 6); g.closePath(); }, r);
    box(c, 18, -2, 12, 2, MOUTH);
    box(c, 14, -12, 4, 4, r[0]);
  } else if (look === 'trike') {
    const R2 = fogRamp('#D89030', wx, 0.28, v);
    shade(c, g => { g.moveTo(-14, -34); g.quadraticCurveTo(-4, -52, 10, -40); g.lineTo(14, 0); g.lineTo(-14, 6); g.closePath(); }, R2);
    shade(c, g => { g.moveTo(0, -20); g.quadraticCurveTo(30, -26, 44, -6); g.lineTo(36, 8); g.lineTo(2, 10); g.closePath(); }, r);
    // (its horns: one's snapped off, the broken end white)
    box(c, 22, -36, 26, 4, TEETH); box(c, 22, -36, 26, 1, '#FFFFFF');
    box(c, 22, -26, 10, 4, TEETH); box(c, 31, -26, 2, 4, fog('#B0A890', wx, 0.25, v));
    box(c, 40, -10, 8, 4, TEETH);
    box(c, 22, -16, 4, 4, r[0]);
    box(c, -4, -12, 4, 4, st[3]);
  } else {
    // (the bronto's head, on the floor at the end of its neck, mouth open)
    shade(c, g => { g.ellipse(14, -8, 24, 12, 0.1, 0, Math.PI * 2); }, r);
    box(c, 22, -4, 14, 3, MOUTH);
    box(c, 18, -14, 4, 4, r[0]);
  }
};

/** Where each head sits on its body (the neck end), and how far it nods. */
const HEAD_AT: Record<DinoLook, [number, number, number]> = { rex: [52, -154, 6], stego: [76, -64, 4], trike: [60, -66, 4], bronto: [222, -12, 0] };

export const drawDinos = (c: Ctx, state: GameState) => {
  const v = viewOf(state);
  for (const d of DINOS) {
    if (!onScreen(v, R(d.x) - 240, R(d.x) + 260)) continue;
    const x = R(d.x), y = Math.round(bedAt(d.x));
    c.save(); c.translate(x, y);
    stamp(c, `uw-dino-${d.look}`, -180, -240, 440, 250, g => paintDinoBody(g, d.look, v, d.x));
    // (the head, nodding: in steps, jerky, the hydraulics catching)
    const [hx, hy, amp] = HEAD_AT[d.look];
    const ph = v.f * 0.035 + d.x;
    const nod = Math.round(Math.sin(ph) * amp / 2) * 2 + (Math.sin(ph * 3.1) > 0.92 ? 2 : 0);
    c.save(); c.translate(hx, hy + nod);
    stamp(c, `uw-dhead-${d.look}`, -30, -60, 110, 80, g => paintDinoHead(g, d.look, v, d.x));
    // (its eyes: the bulbs, one still working)
    const eye = d.look === 'rex' ? [30, -24] : d.look === 'stego' ? [15, -11] : d.look === 'trike' ? [23, -15] : [19, -13];
    if (Math.sin(v.f * 0.05 + d.x) > -0.7) box(c, eye[0], eye[1], 3, 3, d.look === 'bronto' ? '#6A6A5A' : '#FF4030');
    c.restore();
    // (the bronto's wires fizzing; the rex's price tag, swinging off its arm on its string)
    if (d.look === 'bronto' && v.f % 4 < 2) for (let k = 0; k < 3; k++) box(c, 92 + k * 6 + (hash(v.f + k) * 6 | 0), -64 - (hash(v.f * 3 + k) * 20 | 0), 2, 2, 'rgba(255, 250, 200, 0.85)');
    if (d.look === 'rex') {
      const sw = Math.sin(v.f * 0.03) * 0.25, tx = 52 + Math.sin(sw) * 18, ty = -90 + Math.cos(sw) * 18;
      c.strokeStyle = '#E8E0D0'; c.lineWidth = 1; c.beginPath(); c.moveTo(52, -90); c.lineTo(tx, ty); c.stroke();
      c.save(); c.translate(tx, ty); c.rotate(sw);
      box(c, -18, 0, 38, 14, INK); box(c, -17, 1, 36, 12, '#F4EEDC'); box(c, -17, 1, 36, 2, '#FFFFFF'); box(c, -16, 3, 2, 2, INK);
      signAt(c, '$49.99', 2, 11, 5, print(5, '#B02020'));
      c.restore();
    }
    c.restore();
  }
};

export { ball };
