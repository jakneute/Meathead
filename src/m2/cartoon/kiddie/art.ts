// Sillyville Square, painted (crude-but-clean first pass): a picture book with nothing straight in it. Far off, the sky
// by the hour, the rolling hills and the CARTOON LAND WATER TOWER (monument.ts). Behind the play plane, the square's
// buildings, dimmed (scenery: none of it reads as somewhere to stand): wobbly towers with drooping onion domes, candy
// stripes, round windows, curly chimneys, puff-ball trees and curly lamp posts between them. On the play plane, bright
// and inked, everything he stands on lit along its top: the candy path, the toadstools, the SWEET-TOOTH SHOPPE (a
// frosted cake of a shop: its walls the wall, its frosting the roof), the HAT-HAT HATTERY (a stack of hats; the trolley
// out of its side), the ONE-SCOOP SHOPPE's balcony, the gumdrop on its licorice stalk, the trolley's track, the ball
// pits full to the brim, the YOU MUST BE THIS SHORT TO RIDE stick, the signs, and the studio's front at the end.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { timeOfDay } from '../../timeOfDay';
import { signText } from '../../signLetters';
import { box, mix, stamp, hash, onScreen, hour, dimmed, lit, toonSign, toonSky, toonLetters, puffTree, wobblePath, INK, type Ctx } from '../kit';
import { MONUMENT_AT } from '../monument';
import { GY } from '../geometry';
import {
  PITS, GROUND, SHOP, HATTERY, TOADS, BALCONY, GUMDROP, END_BALCONY, TROLLEY, STUDIO, SIGNS, X, Y, x0 as SX0, x1 as SX1,
} from './layout';

export const drawKiddieBackdrop = (c: Ctx, state: GameState) => toonSky(c, state, MONUMENT_AT.kiddie);

// ---------------------------------------------------------------------------------------------------------------
// Behind: the square's buildings (scenery)

const WALLS = ['#FDE68A', '#FBCFE8', '#BFDBFE', '#BBF7D0', '#DDD6FE', '#FED7AA'];
const ROOFS = ['#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#3B82F6', '#EF4444'];
/** One of the square's buildings (seeded): its foot's middle at (x, foot), dimmed. Painted once for the hour. */
const building = (c: Ctx, x: number, foot: number, seed: number) => {
  const w = 120 + Math.round(hash(seed) * 70), h = 200 + Math.round(hash(seed + 1) * 170), lean = Math.round((hash(seed + 2) - 0.5) * 30);
  const wall = WALLS[seed % WALLS.length], roof = ROOFS[(seed * 3 + 1) % ROOFS.length];
  c.save(); c.translate(Math.round(x), Math.round(foot));
  stamp(c, `ct-bldg-${seed}-${timeOfDay().key}`, -w / 2 - 50, -h - 130, w + 100, h + 134, g => {
    const W = dimmed(wall), R = dimmed(roof), K = dimmed(INK);
    // (the body: bulging, leaning, stripes on some)
    g.beginPath(); wobblePath(g, -w / 2, -h, w, h, 10, lean); g.fillStyle = W; g.fill(); g.strokeStyle = K; g.lineWidth = 3; g.lineJoin = 'round'; g.stroke();
    if (seed % 3 === 0) { g.save(); g.beginPath(); wobblePath(g, -w / 2, -h, w, h, 10, lean); g.clip(); g.fillStyle = dimmed(mix(wall, '#FFFFFF', 0.5)); for (let k = -h; k < w; k += 28) { g.beginPath(); g.moveTo(-w / 2 + k, 0); g.lineTo(-w / 2 + k + 12, 0); g.lineTo(-w / 2 + k + 12 + h * 0.3, -h); g.lineTo(-w / 2 + k + h * 0.3, -h); g.closePath(); g.fill(); } g.restore(); g.beginPath(); wobblePath(g, -w / 2, -h, w, h, 10, lean); g.strokeStyle = K; g.stroke(); }
    // (round windows in a wiggle up it, lit warm after dark; a round door)
    for (let i = 0; i < 4; i++) {
      const wy = -h + 40 + i * ((h - 80) / 4), wx = Math.sin(i * 1.7 + seed) * w * 0.22 + lean * (1 - (wy + h) / h) * 0.5;
      g.fillStyle = K; g.beginPath(); g.arc(wx, wy, 13, 0, Math.PI * 2); g.fill();
      g.fillStyle = lit() && hash(seed + i) > 0.3 ? '#FDE68A' : dimmed('#7DD3FC'); g.beginPath(); g.arc(wx, wy, 10, 0, Math.PI * 2); g.fill();
      g.fillStyle = K; g.fillRect(wx - 0.5, wy - 10, 1, 20);
    }
    g.fillStyle = K; g.beginPath(); g.ellipse(0, -2, 18, 30, 0, Math.PI, 0); g.fill();
    g.fillStyle = dimmed(roof); g.beginPath(); g.ellipse(0, -2, 15, 27, 0, Math.PI, 0); g.fill();
    // (the roof: a drooping onion dome, or a floppy cone that flops over, or a stack of balls)
    const tx = lean, ty = -h;
    if (seed % 3 === 0) {
      g.beginPath(); g.moveTo(tx - w / 2 - 6, ty + 4); g.bezierCurveTo(tx - w / 2 - 20, ty - 60, tx - 10, ty - 70, tx + 6, ty - 110); g.bezierCurveTo(tx + 10, ty - 70, tx + w / 2 + 20, ty - 60, tx + w / 2 + 6, ty + 4); g.closePath();
      g.fillStyle = R; g.fill(); g.strokeStyle = K; g.stroke();
      g.fillStyle = K; g.beginPath(); g.arc(tx + 6, ty - 114, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = dimmed('#FDE047'); g.beginPath(); g.arc(tx + 6, ty - 114, 5, 0, Math.PI * 2); g.fill();
    } else if (seed % 3 === 1) {
      const flop = hash(seed + 5) > 0.5 ? 1 : -1;
      g.beginPath(); g.moveTo(tx - w / 2 - 4, ty + 4); g.quadraticCurveTo(tx, ty - 120, tx + flop * 30, ty - 120); g.quadraticCurveTo(tx + flop * 60, ty - 110, tx + flop * 56, ty - 80); g.quadraticCurveTo(tx + flop * 20, ty - 70, tx + w / 2 + 4, ty + 4); g.closePath();
      g.fillStyle = R; g.fill(); g.strokeStyle = K; g.stroke();
      g.fillStyle = K; g.beginPath(); g.arc(tx + flop * 56, ty - 80, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = dimmed('#FFFFFF'); g.beginPath(); g.arc(tx + flop * 56, ty - 80, 6, 0, Math.PI * 2); g.fill();
    } else {
      for (let i = 0; i < 3; i++) { const r = w / 2 - i * 14; g.fillStyle = K; g.beginPath(); g.ellipse(tx, ty - i * 30, r + 2, 18, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = dimmed(ROOFS[(seed + i) % ROOFS.length]); g.beginPath(); g.ellipse(tx, ty - i * 30, r, 16, 0, 0, Math.PI * 2); g.fill(); }
    }
    // (a curly chimney)
    if (seed % 2) { g.strokeStyle = K; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(-w / 2 + 20 + lean, ty + 10); g.bezierCurveTo(-w / 2 + lean, ty - 30, -w / 2 + 40 + lean, ty - 40, -w / 2 + 16 + lean, ty - 70); g.stroke(); g.strokeStyle = dimmed('#F87171'); g.lineWidth = 5; g.stroke(); }
  });
  c.restore();
};
/** A curly lamp post at x (a lamp on a twist of pole), its glow after dark. */
const lampPost = (c: Ctx, x: number) => {
  c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 8; c.beginPath(); c.moveTo(x, GY); c.bezierCurveTo(x - 10, GY - 60, x + 14, GY - 100, x, GY - 140); c.quadraticCurveTo(x - 6, GY - 160, x + 14, GY - 160); c.stroke();
  c.strokeStyle = hour('#7C3AED'); c.lineWidth = 4; c.stroke();
  c.fillStyle = INK; c.beginPath(); c.arc(x + 16, GY - 150, 10, 0, Math.PI * 2); c.fill();
  c.fillStyle = lit() ? '#FEF3C7' : hour('#FDE68A'); c.beginPath(); c.arc(x + 16, GY - 150, 8, 0, Math.PI * 2); c.fill();
};
const LAMPS = [700, 2300, 3300, 4700, 6300, 8200, 9300, 12350, 13100];

// ---------------------------------------------------------------------------------------------------------------
// On the play plane

const LIP = '#FFFBEB';
/** A toadstool: a spotted cap on a fat bendy stalk, its top flat and lit. */
const toadstool = (c: Ctx, a: number, b: number, h: number, seed: number) => {
  const xa = X(a), xb = X(b), top = Y(h), mx = (xa + xb) / 2, cap = ['#EF4444', '#A855F7', '#F97316', '#EC4899'][seed % 4];
  c.save(); c.translate(Math.round(mx), 0);
  stamp(c, `ct-toad-${b - a}-${h}-${seed % 4}-${timeOfDay().key}`, -(xb - xa) / 2 - 20, top - 20, xb - xa + 40, GY - top + 24, g => {
    const w = xb - xa;
    g.beginPath(); g.moveTo(-w * 0.18, GY); g.quadraticCurveTo(-w * 0.28, (GY + top) / 2, -w * 0.14, top + 18); g.lineTo(w * 0.14, top + 18); g.quadraticCurveTo(w * 0.06, (GY + top) / 2, w * 0.2, GY); g.closePath();
    g.fillStyle = hour('#FEF3C7'); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
    g.fillStyle = hour('#FDE68A'); g.fillRect(w * 0.02, top + 24, w * 0.08, GY - top - 30);
    // (the cap: flat on top (he stands on it), domed under, white spots)
    g.beginPath(); g.moveTo(-w / 2, top); g.lineTo(w / 2, top); g.quadraticCurveTo(w / 2 + 8, top + 20, w / 2 - 6, top + 22); g.lineTo(-w / 2 + 6, top + 22); g.quadraticCurveTo(-w / 2 - 8, top + 20, -w / 2, top); g.closePath();
    g.fillStyle = hour(cap); g.fill(); g.strokeStyle = INK; g.stroke();
    for (let i = 0; i < 4; i++) { g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(-w / 2 + 12 + i * (w - 24) / 3, top + 11 + (i % 2) * 3, 4, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = LIP; g.fillRect(-w / 2 + 2, top, w - 4, 3);
  });
  c.restore();
};
/** The SWEET-TOOTH SHOPPE: a frosted cake of a shop, too tall to jump; the frosting's its roof (lit). */
const sweetShop = (c: Ctx) => {
  const xa = X(SHOP.a), xb = X(SHOP.b), top = Y(SHOP.h), w = xb - xa;
  c.save(); c.translate(xa, 0);
  stamp(c, `ct-sweet-${timeOfDay().key}`, -30, top - 80, w + 60, GY - top + 84, g => {
    // (the cake: three tiers, bulging, candy stripes on the middle one)
    const tiers: [number, number, string][] = [[0, 0.42, '#F9A8D4'], [0.42, 0.75, '#FFF7E8'], [0.75, 1, '#C4B5FD']];
    for (const [t0, t1, col] of tiers) {
      const y0 = GY - (GY - top) * t1, y1 = GY - (GY - top) * t0;
      g.beginPath(); g.moveTo(0, y1); g.quadraticCurveTo(-10, (y0 + y1) / 2, 0, y0); g.lineTo(w, y0); g.quadraticCurveTo(w + 10, (y0 + y1) / 2, w, y1); g.closePath();
      g.fillStyle = hour(col); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
      if (col === '#FFF7E8') { g.save(); g.clip(); g.fillStyle = hour('#F472B6'); for (let k = -80; k < w + 80; k += 30) { g.beginPath(); g.moveTo(k, y1); g.lineTo(k + 12, y1); g.lineTo(k + 42, y0); g.lineTo(k + 30, y0); g.closePath(); g.fill(); } g.restore(); }
      // (drips of icing off each tier's top)
      for (let k = 8; k < w - 8; k += 22) { g.fillStyle = hour('#FFFFFF'); g.beginPath(); g.ellipse(k, y0 + 4, 7, 6 + ((k * 7) % 9), 0, 0, Math.PI); g.fill(); }
    }
    // (the window and the door, round; candy in the window)
    g.fillStyle = INK; g.beginPath(); g.ellipse(w * 0.3, GY - 50, 40, 32, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = lit() ? '#FDE68A' : hour('#BAE6FD'); g.beginPath(); g.ellipse(w * 0.3, GY - 50, 36, 28, 0, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 5; i++) { g.fillStyle = ['#EF4444', '#22C55E', '#FDE047', '#3B82F6', '#EC4899'][i]; g.beginPath(); g.arc(w * 0.3 - 22 + i * 11, GY - 40, 5, 0, Math.PI * 2); g.fill(); g.fillRect(w * 0.3 - 23 + i * 11, GY - 40, 2, 14); }
    g.fillStyle = INK; g.beginPath(); g.ellipse(w * 0.72, GY, 26, 46, 0, Math.PI, 0); g.fill();
    g.fillStyle = hour('#7C2D12'); g.beginPath(); g.ellipse(w * 0.72, GY, 22, 42, 0, Math.PI, 0); g.fill();
    // (the roof: the frosting, flat and lit (stand on it); a cherry up one end; its name on the top tier)
    g.fillStyle = INK; g.fillRect(-6, top - 4, w + 12, 12);
    g.fillStyle = hour('#FFFFFF'); g.fillRect(-4, top - 2, w + 8, 8);
    g.fillStyle = LIP; g.fillRect(-4, top - 2, w + 8, 3);
    g.fillStyle = INK; g.beginPath(); g.arc(w - 30, top - 18, 14, 0, Math.PI * 2); g.fill(); g.fillStyle = hour('#DC2626'); g.beginPath(); g.arc(w - 30, top - 18, 12, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#FFFFFF'; g.fillRect(w - 36, top - 24, 4, 3);
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(w - 30, top - 30); g.quadraticCurveTo(w - 24, top - 46, w - 14, top - 50); g.stroke();
    signText(g, 'SWEET-TOOTH SHOPPE', w / 2, GY - (GY - top) * 0.86, toonLetters(1, ['#FFFFFF', '#FFFFFF', '#FDF2F8', '#F9A8D4']));
  });
  c.restore();
};
/** The HAT-HAT HATTERY: a stack of hats for a building (a derby, a bowler, a fez, a topper), the trolley's arch out
 *  its right side, its flat top lit (the roof he gets onto it by). */
const hattery = (c: Ctx) => {
  const xa = X(HATTERY.a), xb = X(HATTERY.b), top = Y(HATTERY.h), w = xb - xa;
  c.save(); c.translate(xa, 0);
  stamp(c, `ct-hattery-${timeOfDay().key}`, -30, top - 30, w + 60, GY - top + 34, g => {
    const bands: [number, number, string, string][] = [[0, 0.3, '#7C3AED', '#FDE047'], [0.3, 0.55, '#16A34A', '#F472B6'], [0.55, 0.8, '#DC2626', '#FFFFFF'], [0.8, 1, '#0EA5E9', '#FDE047']];
    for (const [t0, t1, col, band] of bands) {
      const y0 = GY - (GY - top) * t1, y1 = GY - (GY - top) * t0, inset = (1 - t1) * 0 + t0 * 14;
      g.beginPath(); g.moveTo(inset, y1); g.quadraticCurveTo(inset - 12, (y0 + y1) / 2, inset + 4, y0); g.lineTo(w - inset - 4, y0); g.quadraticCurveTo(w - inset + 12, (y0 + y1) / 2, w - inset, y1); g.closePath();
      g.fillStyle = hour(col); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
      g.fillStyle = hour(band); g.fillRect(inset + 2, y1 - 12, w - inset * 2 - 4, 7);
      // (each hat's brim)
      g.fillStyle = INK; g.beginPath(); g.ellipse(w / 2, y1, w / 2 - inset + 12, 6, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = hour(mix(col, INK, 0.2)); g.beginPath(); g.ellipse(w / 2, y1, w / 2 - inset + 10, 4, 0, 0, Math.PI * 2); g.fill();
    }
    // (the door; the trolley's arch out the right side at the track's height, dark inside)
    g.fillStyle = INK; g.beginPath(); g.ellipse(w * 0.3, GY, 24, 44, 0, Math.PI, 0); g.fill();
    g.fillStyle = hour('#FDE047'); g.beginPath(); g.ellipse(w * 0.3, GY, 20, 40, 0, Math.PI, 0); g.fill();
    const ay = Y(TROLLEY.h);
    g.fillStyle = INK; g.beginPath(); g.moveTo(w - 70, ay + 4); g.lineTo(w - 70, ay - 70); g.quadraticCurveTo(w - 35, ay - 110, w + 2, ay - 70); g.lineTo(w + 2, ay + 4); g.closePath(); g.fill();
    g.fillStyle = '#120A1E'; g.beginPath(); g.moveTo(w - 64, ay); g.lineTo(w - 64, ay - 68); g.quadraticCurveTo(w - 33, ay - 102, w - 2, ay - 68); g.lineTo(w - 2, ay); g.closePath(); g.fill();
    // (the roof: lit)
    g.fillStyle = INK; g.fillRect(58, top - 4, w - 116, 10);
    g.fillStyle = hour('#38BDF8'); g.fillRect(60, top - 2, w - 120, 6);
    g.fillStyle = LIP; g.fillRect(60, top - 2, w - 120, 3);
    signText(g, 'HAT-HAT HATTERY', w / 2 - 20, GY - (GY - top) * 0.42, toonLetters(1));
    signText(g, 'SKY-HIGH TROLLEY', w / 2 - 20, GY - (GY - top) * 0.18, toonLetters(1, ['#FFFFFF', '#FFFFFF', '#FEF9C3', '#FDE047']));
  });
  c.restore();
};
/** The ONE-SCOOP SHOPPE (scenery, dimmed) and its balcony (bright, lit along its top). */
const scoopShop = (c: Ctx) => {
  const xa = X(BALCONY.a) - 60, w = 280, top = Y(380);
  c.save(); c.translate(xa, 0);
  stamp(c, `ct-scoop-${timeOfDay().key}`, -40, top - 140, w + 80, GY - top + 144, g => {
    // (a giant cone of a building: the cone's waffle, three scoops on top)
    g.beginPath(); g.moveTo(30, top + 80); g.lineTo(w - 30, top + 80); g.lineTo(w / 2 + 40, GY); g.lineTo(w / 2 - 40, GY); g.closePath();
    g.fillStyle = dimmed('#D6A35C'); g.fill(); g.strokeStyle = dimmed(INK); g.lineWidth = 3; g.stroke();
    g.save(); g.clip(); g.strokeStyle = dimmed('#A16207'); g.lineWidth = 2; for (let k = -300; k < 300; k += 22) { g.beginPath(); g.moveTo(k, top + 80); g.lineTo(k + 300, GY); g.stroke(); g.beginPath(); g.moveTo(k + 300, top + 80); g.lineTo(k, GY); g.stroke(); } g.restore();
    for (const [sx, sy, r, col] of [[w / 2 - 50, top + 60, 62, '#FBCFE8'], [w / 2 + 50, top + 50, 58, '#BBF7D0'], [w / 2, top - 10, 66, '#FEF3C7']] as [number, number, number, string][]) {
      g.fillStyle = dimmed(INK); g.beginPath(); g.arc(sx, sy, r + 3, 0, Math.PI * 2); g.fill(); g.fillStyle = dimmed(col); g.beginPath(); g.arc(sx, sy, r, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = dimmed(INK); g.beginPath(); g.arc(w / 2, top - 80, 14, 0, Math.PI * 2); g.fill(); g.fillStyle = dimmed('#DC2626'); g.beginPath(); g.arc(w / 2, top - 80, 12, 0, Math.PI * 2); g.fill();
    signText(g, 'ONE-SCOOP SHOPPE', w / 2, top + 4, toonLetters(1));
  });
  c.restore();
  // (the balcony: bright, a scalloped wafer on brackets, lit along its top)
  const ba = X(BALCONY.a), bb = X(BALCONY.b), by = Y(BALCONY.h);
  box(c, ba - 2, by - 2, bb - ba + 4, 16, INK); box(c, ba, by, bb - ba, 12, hour('#F59E0B'));
  for (let x = ba + 6; x < bb; x += 12) box(c, x, by + 4, 6, 2, hour('#B45309'));
  for (const bx of [ba + 14, bb - 18]) { c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(bx, by + 12); c.quadraticCurveTo(bx + 4, by + 40, bx + 18, by + 50); c.stroke(); c.strokeStyle = hour('#B45309'); c.lineWidth = 2.5; c.stroke(); }
  box(c, ba, by, bb - ba, 3, LIP);
};
/** The gumdrop on its licorice stalk, up out of the big pit. */
const gumdrop = (c: Ctx) => {
  const xa = X(GUMDROP.a), xb = X(GUMDROP.b), top = Y(GUMDROP.h), mx = (xa + xb) / 2, w = xb - xa;
  c.lineCap = 'butt';
  c.strokeStyle = INK; c.lineWidth = 22; c.beginPath(); c.moveTo(mx, GY + 30); c.bezierCurveTo(mx - 24, GY - 30, mx + 24, top + 60, mx, top + 20); c.stroke();
  c.strokeStyle = hour('#7F1D1D'); c.lineWidth = 16; c.stroke();
  c.setLineDash([6, 8]); c.strokeStyle = hour('#B91C1C'); c.lineWidth = 6; c.stroke(); c.setLineDash([]);
  c.fillStyle = INK; c.beginPath(); c.moveTo(xa - 3, top + 34); c.quadraticCurveTo(xa - 6, top - 2, xa + 10, top - 3); c.lineTo(xb - 10, top - 3); c.quadraticCurveTo(xb + 6, top - 2, xb + 3, top + 34); c.closePath(); c.fill();
  c.fillStyle = hour('#22C55E'); c.beginPath(); c.moveTo(xa, top + 31); c.quadraticCurveTo(xa - 2, top, xa + 10, top); c.lineTo(xb - 10, top); c.quadraticCurveTo(xb + 2, top, xb, top + 31); c.closePath(); c.fill();
  for (let i = 0; i < 12; i++) box(c, xa + 8 + hash(i * 3.1) * (w - 16), top + 6 + hash(i * 7.7) * 22, 2, 2, '#FFFFFF');
  box(c, xa + 6, top, w - 12, 3, LIP);
};
/** The trolley's track: a candy-striped beam, lit along its top (he walks it). */
const trolleyBeam = (c: Ctx, state: GameState) => {
  const ra = X(TROLLEY.a), rb = X(TROLLEY.b), y = Y(TROLLEY.h);
  const l = Math.max(ra, state.camera.x - 40), r = Math.min(rb, state.camera.x + 840);
  if (r <= l) return;
  box(c, l, y - 2, r - l, 18, INK); box(c, l, y, r - l, 14, hour('#FFF7E8'));
  for (let x = Math.floor(l / 24) * 24; x < r; x += 24) box(c, Math.max(l, x), y + 3, Math.min(12, r - Math.max(l, x)), 9, hour('#22C55E'));
  box(c, l, y + 12, r - l, 2, hour('#9CA3AF'));
  box(c, l, y, r - l, 3, LIP);
};
/** The YOU MUST BE THIS SHORT TO RIDE stick: a grinning sunflower thing on a stalk, its leaf-hand held out flat at
 *  kid height, the words on its board. */
const heightStick = (c: Ctx, x: number) => {
  c.save(); c.translate(Math.round(x), GY);
  stamp(c, `ct-stick-${timeOfDay().key}`, -70, -200, 170, 204, g => {
    g.strokeStyle = INK; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-8, -60, 0, -120); g.stroke();
    g.strokeStyle = hour('#22C55E'); g.lineWidth = 4.5; g.stroke();
    // (the hand: a leaf held out flat at the line)
    g.fillStyle = INK; g.beginPath(); g.ellipse(26, -54, 24, 7, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = hour('#4ADE80'); g.beginPath(); g.ellipse(26, -54, 21, 5, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#FFFFFF'; g.setLineDash([4, 4]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(48, -54); g.lineTo(96, -54); g.stroke(); g.setLineDash([]);
    // (the flower face, grinning)
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; g.fillStyle = INK; g.beginPath(); g.ellipse(Math.cos(a) * 18, -134 + Math.sin(a) * 18, 10, 6, a, 0, Math.PI * 2); g.fill(); g.fillStyle = hour('#FDE047'); g.beginPath(); g.ellipse(Math.cos(a) * 18, -134 + Math.sin(a) * 18, 8, 4.5, a, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = INK; g.beginPath(); g.arc(0, -134, 15, 0, Math.PI * 2); g.fill(); g.fillStyle = hour('#92400E'); g.beginPath(); g.arc(0, -134, 13, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#FFFFFF'; g.fillRect(-6, -140, 4, 4); g.fillRect(3, -140, 4, 4);
    g.strokeStyle = '#FFFFFF'; g.lineWidth = 2; g.beginPath(); g.arc(0, -132, 7, 0.2, Math.PI - 0.2); g.stroke();
    // (the board on the stalk)
    g.fillStyle = INK; g.beginPath(); g.roundRect(-56, -104, 112, 34, 9); g.fill();
    g.fillStyle = hour('#DB2777'); g.beginPath(); g.roundRect(-53, -101, 106, 28, 7); g.fill();
    signText(g, 'YOU MUST BE', 0, -89, toonLetters(1, ['#FFFFFF', '#FFFFFF', '#FDF2F8', '#F9A8D4']));
    signText(g, 'THIS SHORT TO RIDE', 0, -78, toonLetters(1));
  });
  c.restore();
};
/** The studio's front: LEARN THE MAGIC OF HOW CARTOONS ARE MADE (EST. 1994): a 1994 cartoon studio's idea of a
 *  showplace (a big film-reel arch, a clapper of an awning, a marquee with chaser bulbs), its doors (the way on). */
const studioFront = (c: Ctx, state: GameState) => {
  const xa = X(STUDIO.a), xb = X(STUDIO.b) + 200, w = xb - xa, top = Y(420), dx = X(STUDIO.door);
  c.save(); c.translate(xa, 0);
  stamp(c, `ct-studio-${timeOfDay().key}`, -20, top - 140, w + 40, GY - top + 144, g => {
    // (the building: a fat purple drum, wavy top)
    g.beginPath(); g.moveTo(0, GY); g.quadraticCurveTo(-14, (GY + top) / 2, 10, top); for (let k = 0; k < 6; k++) g.quadraticCurveTo(10 + (k + 0.5) * (w - 20) / 6, top - 24, 10 + (k + 1) * (w - 20) / 6, top); g.lineTo(w, GY); g.closePath();
    g.fillStyle = hour('#6D28D9'); g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
    // (the film reel over the door, its holes)
    const rx = dx - xa, ry = top + 90;
    g.fillStyle = INK; g.beginPath(); g.arc(rx, ry, 92, 0, Math.PI * 2); g.fill();
    g.fillStyle = hour('#CBD5E1'); g.beginPath(); g.arc(rx, ry, 86, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; g.fillStyle = hour('#475569'); g.beginPath(); g.arc(rx + Math.cos(a) * 52, ry + Math.sin(a) * 52, 22, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = INK; g.beginPath(); g.arc(rx, ry, 14, 0, Math.PI * 2); g.fill();
    // (the marquee: a long board with chaser bulbs)
    g.fillStyle = INK; g.beginPath(); g.roundRect(rx - 250, top + 196, 500, 74, 12); g.fill();
    g.fillStyle = hour('#FDE047'); g.beginPath(); g.roundRect(rx - 246, top + 200, 492, 66, 10); g.fill();
    g.fillStyle = hour('#DC2626'); g.beginPath(); g.roundRect(rx - 238, top + 208, 476, 50, 8); g.fill();
    signText(g, 'LEARN THE MAGIC OF', rx, top + 224, toonLetters(1, ['#FFFFFF', '#FFFFFF', '#FEF9C3', '#FDE047']));
    signText(g, 'HOW CARTOONS ARE MADE', rx, top + 242, toonLetters(2));
    signText(g, 'EST. 1994', rx + 190, top + 256, toonLetters(1, ['#FFFFFF', '#FFFFFF', '#FEF9C3', '#FDE047']));
    // (the doors: tall, round-topped, propped open: the dark inside)
    g.fillStyle = INK; g.beginPath(); g.moveTo(rx - 60, GY); g.lineTo(rx - 60, GY - 110); g.quadraticCurveTo(rx, GY - 160, rx + 60, GY - 110); g.lineTo(rx + 60, GY); g.closePath(); g.fill();
    g.fillStyle = '#0B0614'; g.beginPath(); g.moveTo(rx - 54, GY); g.lineTo(rx - 54, GY - 108); g.quadraticCurveTo(rx, GY - 152, rx + 54, GY - 108); g.lineTo(rx + 54, GY); g.closePath(); g.fill();
    // (a cardboard 1994 animator stand-in by the door: a ponytail, a turtleneck, a pencil behind the ear, a smug grin)
    const sx = rx - 150;
    g.fillStyle = INK; g.fillRect(sx - 20, GY - 120, 40, 120);
    g.fillStyle = hour('#18181B'); g.fillRect(sx - 18, GY - 90, 36, 70);
    g.fillStyle = hour('#F0C8A2'); g.beginPath(); g.arc(sx, GY - 104, 14, 0, Math.PI * 2); g.fill();
    g.fillStyle = hour('#4A2E1A'); g.fillRect(sx - 14, GY - 120, 28, 8); g.fillRect(sx + 10, GY - 112, 6, 18);
    g.fillStyle = INK; g.fillRect(sx - 6, GY - 108, 3, 3); g.fillRect(sx + 4, GY - 108, 3, 3); g.fillRect(sx - 4, GY - 98, 10, 2);
    g.fillStyle = hour('#FDE047'); g.fillRect(sx - 18, GY - 116, 14, 3);
    g.fillStyle = hour('#475569'); g.fillRect(sx - 20, GY - 20, 40, 20);
    signText(g, 'VISIONARY', sx, GY - 6, toonLetters(1, ['#FFFFFF', '#FFFFFF', '#F1F5F9', '#CBD5E1']));
  });
  c.restore();
  // (the chaser bulbs round the marquee, live)
  const rx = dx, ry = top + 196;
  for (let i = 0; i < 26; i++) { const bx = rx - 244 + i * 19.5; c.fillStyle = (state.frame >> 3) % 3 === i % 3 ? '#FFFFFF' : '#F59E0B'; c.beginPath(); c.arc(bx, ry + 2, 3, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(bx, ry + 72, 3, 0, Math.PI * 2); c.fill(); }
};

/** The candy path (the ground): pink cobbles on top lit along their edge, the grass bank under, flowers. */
const ground = (c: Ctx, state: GameState) => {
  for (const [a, b] of GROUND) {
    const l = Math.max(X(a), state.camera.x - 60), r = Math.min(X(b), state.camera.x + 860);
    if (r <= l) continue;
    box(c, l, GY, r - l, 200, hour('#4ADE80'));
    box(c, l, GY + 18, r - l, 200, hour('#22C55E'));
    for (let x = Math.floor(l / 40) * 40; x < r; x += 40) { const h = hash(x * 0.37); if (h > 0.4) { c.fillStyle = ['#F472B6', '#FDE047', '#FFFFFF', '#C084FC'][Math.floor(h * 4) % 4]; c.beginPath(); c.arc(x + h * 30, GY + 30 + h * 20, 3, 0, Math.PI * 2); c.fill(); } }
    box(c, l, GY, r - l, 12, hour('#F9A8D4'));
    for (let x = Math.floor(l / 18) * 18; x < r; x += 18) box(c, Math.max(l, x), GY + 4, Math.min(16, r - Math.max(l, x)), 1, hour('#EC4899'));
    box(c, l, GY + 12, r - l, 2, INK);
    box(c, l, GY, r - l, 3, LIP);
  }
  // (the pits' sides: the path's cut ends, rounded, inked)
  for (const [a, b] of PITS) for (const [ex, s] of [[X(a), 1], [X(b), -1]] as [number, number][]) {
    if (!onScreen(state, ex - 20, ex + 20)) continue;
    c.fillStyle = INK; c.beginPath(); c.moveTo(ex, GY); c.quadraticCurveTo(ex + s * 8, GY + 40, ex, GY + 200); c.lineTo(ex - s * 4, GY + 200); c.lineTo(ex - s * 4, GY); c.closePath(); c.fill();
  }
};
/** The ball pits: full to the brim with balls (the far ones, behind him). */
const pits = (c: Ctx, state: GameState) => {
  const COLS = ['#EF4444', '#FDE047', '#3B82F6', '#22C55E', '#F472B6', '#FB923C'];
  for (const [a, b] of PITS) {
    const l = Math.max(X(a), state.camera.x - 40), r = Math.min(X(b), state.camera.x + 840);
    if (r <= l) continue;
    box(c, l, GY + 6, r - l, 200, hour('#1E1B4B'));
    for (let row = 0; row < 6; row++) for (let x = Math.floor(l / 14) * 14 + (row % 2) * 7; x < r; x += 14) {
      const y = GY + 8 + row * 11 + Math.sin(x * 0.3 + row) * 1.5, col = COLS[Math.abs(Math.floor(x / 14) * 7 + row * 3) % COLS.length];
      c.fillStyle = mix(hour(col), '#1E1B4B', row * 0.12); c.beginPath(); c.arc(x, y, 7, 0, Math.PI * 2); c.fill();
      if (row < 2) box(c, x - 3, y - 4, 2, 2, 'rgba(255,255,255,0.8)');
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------

export const drawKiddieBack = (c: Ctx, state: GameState) => {
  // (the square's buildings behind, every so often, seeded; none behind the big set pieces' fronts)
  const cam = state.camera.x;
  for (let k = Math.floor((cam - SX0 - 300) / 330); k * 330 + SX0 < cam + 1100; k++) {
    if (k < 0 || k * 330 > SX1 - SX0) continue;
    const rx = k * 330 + 90;
    if (rx > STUDIO.a - 200) continue;
    building(c, X(rx) + (hash(k * 5.3) - 0.5) * 60, GY, k * 7 + 3);
  }
  // (puff-ball trees and lamp posts between)
  for (let k = Math.floor((cam - SX0 - 300) / 260); k * 260 + SX0 < cam + 1000; k++) {
    if (k < 0) continue;
    const rx = k * 260 + 180;
    if (PITS.some(([a, b]) => rx > a - 40 && rx < b + 40) || rx > STUDIO.a - 100) continue;
    puffTree(c, X(rx), GY, 110 + hash(k * 2.7) * 70, hour(['#F472B6', '#FDE047', '#A78BFA', '#FB923C', '#2DD4BF'][k % 5]), k);
  }
  for (const lx of LAMPS) if (onScreen(state, X(lx) - 30, X(lx) + 40)) lampPost(c, X(lx));
  if (onScreen(state, X(STUDIO.a) - 40, X(STUDIO.b) + 300)) studioFront(c, state);
  if (onScreen(state, X(BALCONY.a) - 120, X(BALCONY.b) + 160)) scoopShop(c);
  pits(c, state);
  ground(c, state);
  for (const [x, h, lines, board, tall] of SIGNS) if (onScreen(state, X(x) - 200, X(x) + 200)) toonSign(c, X(x), Y(h), lines, { board, tall });
  if (onScreen(state, X(860) - 80, X(860) + 120)) heightStick(c, X(860));
  if (onScreen(state, X(SHOP.a) - 40, X(SHOP.b) + 40)) sweetShop(c);
  if (onScreen(state, X(HATTERY.a) - 40, X(HATTERY.b) + 40)) hattery(c);
  if (onScreen(state, X(GUMDROP.a) - 40, X(GUMDROP.b) + 40)) gumdrop(c);
  TOADS.forEach(([a, b, h], i) => { if (onScreen(state, X(a) - 30, X(b) + 30)) toadstool(c, a, b, h, i); });
  // (the studio square's balcony: a scalloped awning on brackets off the studio's neighbor)
  if (onScreen(state, X(END_BALCONY.a) - 40, X(END_BALCONY.b) + 40)) {
    const ba = X(END_BALCONY.a), bb = X(END_BALCONY.b), by = Y(END_BALCONY.h);
    box(c, ba - 2, by - 2, bb - ba + 4, 16, INK); box(c, ba, by, bb - ba, 12, hour('#38BDF8'));
    for (const bx of [ba + 10, bb - 14]) { c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(bx, by + 12); c.quadraticCurveTo(bx + 2, by + 60, bx, GY); c.stroke(); c.strokeStyle = hour('#0369A1'); c.lineWidth = 2.5; c.stroke(); }
    box(c, ba, by, bb - ba, 3, LIP);
  }
  trolleyBeam(c, state);
};

export const kiddieLamps = (state: GameState): Light[] => {
  if (timeOfDay().lamps < 0.05) return [];
  const out: Light[] = [];
  for (const lx of LAMPS) { const x = X(lx) + 16; if (x > state.camera.x - 200 && x < state.camera.x + 1000) out.push({ x, y: GY - 150, r: 120, a: 0.55, color: '#FFE8A8' }); }
  const dx = X(STUDIO.door);
  if (dx > state.camera.x - 300 && dx < state.camera.x + 1100) out.push({ x: dx, y: Y(420) + 230, r: 220, a: 0.6, color: '#FDE047' });
  return out;
};
