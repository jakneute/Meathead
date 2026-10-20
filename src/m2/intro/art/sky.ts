// Behind everything on the way in: the sky, the parking lot out to the horizon, the skyline over America USA.
//
// Drawn in screen space every frame. The still parts (the sky and its sun, the clouds, the tree line, the asphalt, each
// row of cars, the poles and their signs, the skyline, the park in front of it) are each painted once into a canvas of
// their own (`held`, below: at the screen's own resolution) and put down with one drawImage after that, at whatever
// parallax offset; only what moves (clouds drifting, the plane and its banner, the blimp, fireworks, the tram, the
// people, the Ferris wheel turning, the coaster's train) is drawn live.

import type { GameState } from '../../../m1/game/core/state';
import { R, CHECK_END } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import {
  type Ctx, INK, WHITE, BLUE, box, sign, star, pole, mix, rampOf, dim, hash, checker, bandedGradient, hazeBands, steppedGlow, pixelBlob, PIX,
} from './kit';
import { timeOfDay, skyRamp, skyTint, farTint, sunAt, sunTint, cloudTint, drawStars, drawMoon } from '../../timeOfDay';
import { type Far, type RangeLook, rampF, block, cylV, ball as orb, windowGrid, windowRow, across, poly, snap2, wave, jag, range, mist } from '../../space/farArt';
import { crown } from '../../adventure/farArt';
import { noteSun } from '../../sunFlare';
import { signText, signAt, signW, federal } from './letters';

const W = CANVAS_WIDTH, HT = CANVAS_HEIGHT;

// ---------------------------------------------------------------------------------------------------------------------
// Held art: painted once at the screen's resolution, put down after with one drawImage (works under globalAlpha too,
// which the stamps don't: the lot and the skyline fade one into the other)
// ---------------------------------------------------------------------------------------------------------------------

const held = new Map<string, HTMLCanvasElement>();
/** Lets go of all of it (on the way out of the intro: none of it's wanted anywhere else). */
export const clearSkyCache = () => held.clear();
const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check?.('8px "Press Start 2P"');

/** The held canvas for `key` (painted now if it hasn't been), or null when it can't be held yet (no pixel font yet). */
const heldCanvas = (c: Ctx, key: string, w: number, h: number, paint: (g: Ctx) => void, font = false) => {
  if (typeof document === 'undefined' || (font && !fontReady())) return null;
  const a = Math.abs(c.getTransform().a) || 1;
  // (and the hour: timeOfDay.ts, the sky and everything out in it painted for it)
  const id = `${key}@${a.toFixed(3)}@${timeOfDay().key}`;
  let cv = held.get(id);
  if (!cv) {
    if (held.size > 700) held.clear();
    cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.ceil(w * a)); cv.height = Math.max(1, Math.ceil(h * a));
    const g = cv.getContext('2d')!;
    g.scale(a, a); g.imageSmoothingEnabled = false;
    paint(g);
    held.set(id, cv);
  }
  return cv;
};

/**
 * Puts down the art `paint` draws in its own local box (0..w, 0..h) at (x, y), from a canvas it was painted into the
 * once. `key` names the picture. With `font`, it's painted live until the pixel font has loaded (so no sign gets held
 * in the fallback font for good).
 */
const held_ = (c: Ctx, key: string, x: number, y: number, w: number, h: number, paint: (g: Ctx) => void, font = false) => {
  const cv = heldCanvas(c, key, w, h, paint, font);
  if (!cv) { c.save(); c.translate(Math.round(x), Math.round(y)); paint(c); c.restore(); return; }
  const a = Math.abs(c.getTransform().a) || 1;
  c.drawImage(cv, Math.round(x), Math.round(y), cv.width / a, cv.height / a);
};

/** A held strip `tw` wide repeated across the screen, scrolled by `scroll`. */
const tiled = (c: Ctx, key: string, scroll: number, y: number, tw: number, h: number, paint: (g: Ctx) => void) => {
  const off = Math.round(((scroll % tw) + tw) % tw);
  for (let x = -off; x < W; x += tw) held_(c, key, x, y, tw, h, paint);
};

// ---------------------------------------------------------------------------------------------------------------------
// The whole thing
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Behind everything: a patriotic sky (bands of blue, a blazing sun, big clouds, fireworks going off in broad daylight, a
 * plane towing a banner, the park's blimp). Out from the garage, the biggest parking lot anybody's ever seen, rows on
 * rows of cars out to the horizon; down in America USA, a skyline of every American city's landmarks, far off.
 */
export const drawIntroBackdrop = (c: Ctx, state: GameState) => {
  const cam = state.camera.x, f = state.frame || 0;
  // (all of it, to the bottom, every frame: or whatever was there last frame shows through)
  held_(c, 'm2sky', 0, 0, W, HT, paintSky);
  // (the sun's glare, over its disc and under the clouds; the lens's ghosts later on: sunFlare.ts)
  { const s = sunAt(676, 64, HZ); noteSun(c, s.x, s.y); }
  drawStars(c, 0, 0, W, HZ - 20, f, cam * 0.02);
  drawMoon(c, 480, 110);
  clouds(c, cam, f, 0);
  blimp(c, cam, f);
  fireworks(c, f);
  clouds(c, cam, f, 1);
  bannerPlane(c, f);
  // (the parking lot out from the garage, the skyline over America USA: the one fading into the other as he goes down
  // to it, not cut over from one to the other)
  const mid = cam + W / 2;
  const k = Math.max(0, Math.min(1, (mid - R(CHECK_END - 300)) / 1100));
  if (k < 1) { c.globalAlpha = 1 - k; parkingLot(c, cam, f); c.globalAlpha = 1; }
  if (k > 0) { c.globalAlpha = k; skyline(c, cam, f); c.globalAlpha = 1; }
};

// ---------------------------------------------------------------------------------------------------------------------
// The sky
// ---------------------------------------------------------------------------------------------------------------------

const SKY = ['#0C1F5C', '#14318A', '#1F4AB4', '#3367CE', '#5287DE', '#7EA8EA', '#A9C7F0', '#CFE0F4', '#E2ECF6', '#E8EFF6'];
const SKY_PALE = '#DCE8F4';

const paintSky = (g: Ctx) => {
  const tod = timeOfDay();
  bandedGradient(g, 0, 0, W, HT, skyRamp(SKY, tod), 22);
  // (wisps of cirrus way up, thin and flat, lit along their tops)
  for (let i = 0; i < 6; i++) {
    const x = Math.round(hash(i * 3.1) * 700) - 40, y = 30 + i * 26 + Math.round(hash(i * 5.7) * 10), w = 120 + Math.round(hash(i * 9.3) * 140);
    g.globalAlpha = 0.22 + 0.05 * (i % 3);
    box(g, x + 10, y, w - 20, 2, cloudTint('#EAF2FF', tod)); box(g, x + 30, y - 2, w - 70, 2, cloudTint('#FFFFFF', tod)); box(g, x + 20, y + 2, w - 46, 2, cloudTint('#B9CCEA', tod));
    checker(g, x, y, 10, 2, cloudTint('#EAF2FF', tod)); checker(g, x + w - 10, y, 10, 2, cloudTint('#EAF2FF', tod), 1);
    g.globalAlpha = 1;
  }
  // (the sun, high in the upper right: rings of glare stepped out round it, a white-hot disc with a stepped rim; as the
  // day goes, sinking, gold, then gone)
  const sun = sunAt(676, 64, HZ, tod);
  if (sun.up <= 0.02) return;
  g.globalAlpha = sun.up;
  const sx = sun.x, sy = sun.y;
  steppedGlow(g, sx, sy, 128, sunTint('#FFF4C8', tod), 0.3, 0, 6);
  steppedGlow(g, sx, sy, 52, sunTint('#FFFBE6', tod), 0.7, 0.25, 4);
  g.fillStyle = sunTint('#FFE58A', tod); g.beginPath(); g.arc(sx, sy, 22, 0, Math.PI * 2); g.fill();
  g.fillStyle = sunTint('#FFF4C0', tod); g.beginPath(); g.arc(sx, sy, 20, 0, Math.PI * 2); g.fill();
  g.fillStyle = sunTint('#FFFFFF', tod); g.beginPath(); g.arc(sx - 1, sy - 1, 16, 0, Math.PI * 2); g.fill();
  // (a dithered ring where the disc meets the glare)
  for (let a = 0; a < 64; a++) {
    const t = (a / 64) * Math.PI * 2, x = Math.round((sx + Math.cos(t) * 23) / PIX) * PIX, y = Math.round((sy + Math.sin(t) * 23) / PIX) * PIX;
    if (a % 2) box(g, x, y, PIX, PIX, sunTint('#FFE58A', tod));
  }
  // (short stepped rays off it, the four ways and the diagonals)
  for (let i = 0; i < 8; i++) {
    const t = (i / 8) * Math.PI * 2, long = i % 2 ? 38 : 54;
    for (let d = 30; d < long; d += 4) box(g, sx + Math.cos(t) * d - 1, sy + Math.sin(t) * d - 1, 2, 2, sunTint(d < 40 ? '#FFF8D8' : '#FFEFB0', tod));
  }
  g.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------------
// Clouds: big puffy cumulus, lit tops (the sun's side), shaded bellies, dithered edges
// ---------------------------------------------------------------------------------------------------------------------

const CLOUD = { belly: '#8EA2C8', shade: '#AFC0DE', mid: '#D3DEF0', lit: '#EEF4FD', hi: '#FFFFFF' };

const paintCloud = (g: Ctx, w: number, h: number, seed: number, far: boolean) => {
  const base = h - 10, n = 4 + Math.floor(hash(seed) * 3);
  const puffs: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, x = w * (0.16 + t * 0.68) + (hash(seed + i * 7) - 0.5) * w * 0.08;
    // (the middle ones biggest: a heap, not a row)
    const r = (h * 0.32) * (0.65 + 0.55 * Math.sin(t * Math.PI)) * (0.85 + hash(seed + i * 13) * 0.3);
    puffs.push([x, base - r * 0.55, r]);
  }
  const tint = (col: string) => cloudTint(far ? mix(col, '#B8CCEA', 0.35) : col);
  // (the flat belly, then the heap in steps: shade, body, lit toward the sun up on the right, a glint or two of white)
  pixelBlob(g, w / 2, base - 2, w * 0.42, 9, tint(CLOUD.belly));
  for (const [x, y, r] of puffs) pixelBlob(g, x, y + 4, r * 1.05, r * 0.82, tint(CLOUD.shade));
  for (const [x, y, r] of puffs) pixelBlob(g, x + r * 0.08, y - 1, r * 0.92, r * 0.72, tint(CLOUD.mid));
  for (const [x, y, r] of puffs) pixelBlob(g, x + r * 0.22, y - r * 0.2, r * 0.66, r * 0.5, tint(CLOUD.lit));
  for (const [x, y, r] of puffs) if (r > h * 0.26) pixelBlob(g, x + r * 0.35, y - r * 0.38, r * 0.3, r * 0.2, tint(CLOUD.hi));
  // (the belly flattened off: a band of shade along the bottom, dithered up into the body)
  box(g, w * 0.14, base - 2, w * 0.72, 4, tint(CLOUD.belly));
  checker(g, Math.round(w * 0.12 / 2) * 2, base - 6, Math.round(w * 0.76 / 2) * 2, 4, tint(CLOUD.belly));
};

/** Two tiers: far, small and slow (`tier` 0); near, big, drifting quicker (1). */
const clouds = (c: Ctx, cam: number, f: number, tier: number) => {
  const defs = tier === 0
    ? [[60, 178, 120, 48], [330, 198, 96, 40], [560, 168, 132, 52], [860, 190, 108, 44], [1110, 206, 90, 38]]
    : [[0, 56, 250, 104], [420, 96, 200, 86], [760, 40, 230, 96], [1150, 120, 180, 76]];
  const par = tier === 0 ? 0.012 : 0.03, drift = tier === 0 ? 0.04 : 0.09, span = tier === 0 ? 1350 : 1500;
  defs.forEach(([x0, y, w, h], i) => {
    const x = (((x0 - f * drift - cam * par) % span) + span) % span - 260;
    if (x > W || x + w < 0) return;
    held_(c, `m2cloud${tier}_${i}`, x, y, w, h, g => paintCloud(g, w, h, i * 17 + tier * 101 + 3, tier === 0));
  });
};

// ---------------------------------------------------------------------------------------------------------------------
// A plane towing a banner, the park's blimp
// ---------------------------------------------------------------------------------------------------------------------

const BANNER = 'HAPPY LAND: NOW WITH MORE LAND';
const BANNER_LOOK = federal({ sx: 1, sy: 2 }, '#B91C1C', '#C8C4BE');
const BANNER_W = signW(BANNER, BANNER_LOOK) + 20, BANNER_H = 18;

const paintPlane = (g: Ctx) => {
  // (a little high-wing prop plane, facing right: ink edge, white body in steps, a red cheat line, blue tail)
  const body = rampOf('#E8ECF2');
  g.fillStyle = INK; g.beginPath(); g.moveTo(2, 9); g.lineTo(10, 6); g.lineTo(36, 6); g.lineTo(42, 10); g.lineTo(36, 15); g.lineTo(10, 14); g.closePath(); g.fill();
  box(g, 4, 1, 7, 10, INK);
  box(g, 10, 7, 26, 7, body[2]); box(g, 4, 9, 6, 4, body[2]); box(g, 36, 8, 4, 5, body[2]);
  box(g, 10, 7, 26, 2, body[3]); box(g, 10, 7, 26, 1, body[4]); box(g, 10, 12, 30, 2, body[1]);
  box(g, 6, 11, 34, 1, '#B91C1C');
  // (the tail, the windshield with a glint, the wing on top in steps, the wheels)
  box(g, 5, 2, 5, 8, '#1E3A8A'); box(g, 5, 2, 2, 8, '#2D51B0');
  box(g, 29, 7, 5, 4, '#28406E'); box(g, 30, 7, 1, 2, '#BFD6FF');
  box(g, 14, 4, 20, 3, INK); box(g, 15, 4, 18, 2, '#D93A2E'); box(g, 15, 4, 18, 1, '#F06A55');
  box(g, 22, 15, 3, 3, INK); box(g, 32, 15, 3, 3, INK);
};

const paintBanner = (g: Ctx) => {
  box(g, 0, 0, BANNER_W, BANNER_H, INK);
  box(g, 1, 1, BANNER_W - 2, BANNER_H - 2, '#F1EFEA');
  box(g, 1, 1, BANNER_W - 2, 2, '#FFFFFF'); box(g, 1, BANNER_H - 4, BANNER_W - 2, 2, '#C8C4BE');
  box(g, 1, 3, 4, BANNER_H - 6, '#B91C1C'); box(g, BANNER_W - 5, 3, 4, BANNER_H - 6, '#1E3A8A');
  signText(g, BANNER, BANNER_W / 2, BANNER_H / 2 + 7, BANNER_LOOK);
};

const bannerPlane = (c: Ctx, f: number) => {
  // (a pass every so often, left to right, slow, bobbing on the air)
  const x = ((f * 0.55) % 2900) - BANNER_W - 120;
  if (x > W + 60 || x + BANNER_W + 120 < 0) return;
  const y = Math.round(118 + Math.sin(f * 0.02) * 3);
  const px = Math.round(x + BANNER_W + 40);
  // (the banner, a slice at a time riding a ripple along it)
  const bx = Math.round(x), cv = heldCanvas(c, 'm2banner', BANNER_W, BANNER_H, paintBanner, true);
  if (cv) {
    const a = cv.width / BANNER_W;
    for (let s = 0; s < BANNER_W; s += 8) {
      const sw = Math.min(8, BANNER_W - s), dy = Math.round(Math.sin(f * 0.16 - s * 0.05) * 1.6 * (s / BANNER_W));
      c.drawImage(cv, s * a, 0, sw * a, BANNER_H * a, bx + s, y + dy, sw, BANNER_H);
    }
  } else held_(c, 'm2banner', bx, y, BANNER_W, BANNER_H, paintBanner, true);
  // (the tow line, from the tail to the banner's front)
  c.strokeStyle = '#3A3F48'; c.lineWidth = 1; c.beginPath(); c.moveTo(bx + BANNER_W, y + 9); c.lineTo(px + 4, y + 2); c.stroke();
  held_(c, 'm2plane', px, y - 10, 44, 19, paintPlane);
  // (the prop, a blur flickering)
  box(c, px + 42, y - 4 + (f % 4 < 2 ? 0 : 3), 2, 6, f % 4 < 2 ? '#C8CCD4' : '#8A90A0');
};

const BLIMP_W = 132, BLIMP_H = 48;
const paintBlimp = (g: Ctx) => {
  const cx = 64, cy = 20, rx = 58, ry = 17;
  // (fins first, then the envelope in horizontal steps, lit along the top)
  g.fillStyle = INK; g.beginPath(); g.moveTo(10, cy); g.lineTo(0, cy - 15); g.lineTo(18, cy - 6); g.lineTo(18, cy + 6); g.lineTo(0, cy + 15); g.closePath(); g.fill();
  g.fillStyle = '#1E3A8A'; g.beginPath(); g.moveTo(11, cy); g.lineTo(2, cy - 13); g.lineTo(17, cy - 5); g.lineTo(17, cy + 5); g.lineTo(2, cy + 13); g.closePath(); g.fill();
  g.fillStyle = INK; g.beginPath(); g.ellipse(cx, cy, rx + 1, ry + 1, 0, 0, Math.PI * 2); g.fill();
  const env = ['#6E7A90', '#949FB4', '#B8C1D2', '#D6DCE6', '#EEF1F6'];
  const order = [3, 4, 3, 3, 2, 2, 2, 1, 1, 0];
  for (let i = 0; i < order.length; i++) {
    const y0 = cy - ry + (i * ry * 2) / order.length, y1 = cy - ry + ((i + 1) * ry * 2) / order.length;
    g.save(); g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.clip();
    box(g, cx - rx, y0, rx * 2, y1 - y0 + 1, env[order[i]]);
    g.restore();
  }
  // (a red band round its middle with the park's name, the nose cone's battens)
  g.save(); g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.clip();
  box(g, cx - rx, cy - 5, rx * 2, 11, '#B91C1C'); box(g, cx - rx, cy - 5, rx * 2, 2, '#D93A2E'); box(g, cx - rx, cy + 4, rx * 2, 2, '#8E1414');
  for (let i = 0; i < 4; i++) box(g, cx + rx - 10 - i * 3, cy - ry, 1, ry * 2, env[1]);
  g.restore();
  signAt(g, 'HAPPY LAND', cx - 4, cy + 4, 8, federal(8, '#FFFFFF', '#5C0A0A'));
  // (the gondola under it, its windows)
  box(g, cx - 12, cy + ry - 1, 24, 7, INK); box(g, cx - 11, cy + ry - 1, 22, 5, '#B8C1D2'); box(g, cx - 11, cy + ry - 1, 22, 1, '#EEF1F6');
  for (let i = 0; i < 4; i++) box(g, cx - 9 + i * 5, cy + ry + 1, 3, 2, '#28406E');
  // (a star on the fin)
  star(g, 8, cy - 7, 3, '#F8FAFC');
};

const blimp = (c: Ctx, cam: number, f: number) => {
  // (way up, barely moving: the park watching its lot)
  const x = (((900 - f * 0.11 - cam * 0.008) % 1800) + 1800) % 1800 - 300;
  if (x > W || x + BLIMP_W < 0) return;
  held_(c, 'm2blimp', x, 72 + Math.round(Math.sin(f * 0.01) * 2), BLIMP_W, BLIMP_H, paintBlimp, true);
};

// ---------------------------------------------------------------------------------------------------------------------
// Fireworks in broad daylight: a shell going up on a trail, a chunky burst of sparks falling and fading, a puff of smoke
// left hanging (it's noon; you mostly see the smoke)
// ---------------------------------------------------------------------------------------------------------------------

const SPARKS = [
  ['#FFFFFF', '#FFD8D0', '#F06A55', '#D93A2E', '#8E1414'],
  ['#FFFFFF', '#FFFFFF', '#E8EEF8', '#B8C4D8', '#8090A8'],
  ['#FFFFFF', '#FFF2A8', '#FFD84A', '#E8B400', '#9A6C10'],
  ['#FFFFFF', '#D0DCFF', '#6F94F0', '#2D51B0', '#14205C'],
];

const fireworks = (c: Ctx, f: number) => {
  for (let i = 0; i < 4; i++) {
    const P = 190 + i * 37, t = (f + i * 71) % P, cyc = Math.floor((f + i * 71) / P);
    const bx = Math.round(70 + hash(cyc * 7.7 + i * 3.3) * 660), by = Math.round(46 + hash(cyc * 5.1 + i * 9.9) * 130);
    const ramp = SPARKS[Math.floor(hash(cyc * 2.3 + i) * SPARKS.length)];
    const RISE = 26;
    if (t < RISE) {
      // (the shell on its way up, a trail of sparks under it)
      const u = t / RISE, y = by + (1 - u) * (1 - u) * 190 + (1 - u) * 20, x = bx + Math.sin(u * 6 + i) * 2;
      for (let k = 4; k >= 0; k--) {
        const yy = y + k * 5;
        if (k > 0 && (t + k) % 3 === 0) continue;
        box(c, Math.round(x / 2) * 2, Math.round(yy / 2) * 2, 2, 2, ramp[Math.min(4, k)]);
      }
      continue;
    }
    const tb = t - RISE;
    if (tb > 120) continue;
    // (the smoke it leaves, hanging, then thinning out)
    if (tb > 6) {
      const s = Math.min(1, (tb - 6) / 40), a = 0.32 * (1 - Math.max(0, (tb - 40) / 80));
      if (a > 0.02) {
        c.globalAlpha *= a;
        pixelBlob(c, bx + 2, by + 4 + tb * 0.08, 14 + s * 22, 10 + s * 14, '#C8CCD6');
        pixelBlob(c, bx - 8, by - 2 + tb * 0.06, 8 + s * 12, 6 + s * 8, '#E8EBF2');
        c.globalAlpha /= a;
      }
    }
    if (tb > 84) continue;
    // (the flash)
    if (tb < 5) steppedGlow(c, bx, by, 22 - tb * 2, '#FFFFFF', 0.85, 0.15, 3);
    const n = 18, rmax = 44 + hash(cyc * 3.9 + i) * 26;
    for (let ring = 0; ring < 2; ring++) {
      const rr = ring ? rmax * 0.55 : rmax, nn = ring ? 10 : n;
      for (let k = 0; k < nn; k++) {
        const ang = (k / nn) * Math.PI * 2 + ring * 0.3 + cyc;
        // (each spark at a few moments back along its path: the trail, older and darker)
        for (let back = 3; back >= 0; back--) {
          const tt = tb - back * 3;
          if (tt < 0) continue;
          const u = Math.min(1, tt / 46), r = rr * (1 - (1 - u) * (1 - u)), drop = tt * tt * 0.006;
          const life = tb / 84;
          let shade = Math.min(4, Math.floor(life * 4.2) + back);
          if (life > 0.62 && hash(k * 1.7 + ring * 9 + Math.floor(tb / 2) + back) < 0.45) continue; // (the last sparks twinkling out)
          if (back > 0 && shade < 2) shade = 2;
          const x = bx + Math.cos(ang) * r, y = by + Math.sin(ang) * r + drop;
          box(c, Math.round(x / 2) * 2, Math.round(y / 2) * 2, back === 0 ? 4 : 2, back === 0 ? 4 : 2, ramp[shade]);
        }
      }
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------------
// The parking lot
// ---------------------------------------------------------------------------------------------------------------------

/** Where the lot meets the sky. */
const HZ = 244;
const LOT_HAZE = '#B8C2D0';
const ROWS = 10;
const rowK = (r: number) => (r + 1) / ROWS;
const rowY = (r: number) => Math.round(HZ + 2 + rowK(r) * rowK(r) * 240);
const rowS = (r: number) => 0.12 + rowK(r) * 1.1;
const rowPar = (r: number) => 0.04 + rowK(r) * 0.55;
const rowHaze = (r: number) => Math.pow(1 - rowK(r), 1.4) * 0.62;
/** Stalls in one held strip of a row (it repeats after that, the strip being long enough nobody's counting). */
const PER = 37;
/** Every so many stalls, a light pole. */
const POLE_EVERY = 9;
const CAR_COLS = ['#B91C1C', '#1E3A8A', '#E8E8EC', '#52525B', '#CA8A04', '#166534', '#7C3AED', '#111827', '#9CA3AF', '#0E7490', '#9A3412'];
const LOTS = ['EAGLE', 'LIBERTY', 'APPLE PIE', 'BALD', 'GLORY'];

/** The tree line's strip: how tall, and where the lot's far edge is in it. */
const TL_H = 104, TL_EDGE = 90;
/**
 * Out past the far edge of the lot (adventure/farArt.ts's ranges, the hour's light and haze on them): a pale range of
 * mountains at the back, misted; rolling hills in front of it, woods up their lower slopes; then the trees along the
 * lot's edge in stepped crowns (shade, body, lit, a highlight), and the haze lying along it all. Whole cycles across
 * the tile, so it meets round itself. Nothing lit along a top.
 */
const paintTreeLine = (g: Ctx, tw: number) => {
  const tod = timeOfDay(), haze = skyTint(SKY_PALE, 0.96, tod);
  const look = (base: string, k: number): RangeLook => {
    const T = (c: string) => mix(farTint(c, 1.2, tod), haze, k);
    return { body: T(base), lit: T(mix(base, '#E8F0F8', 0.26)), hi: T(mix(base, '#FFFFFF', 0.4)), shade: T(mix(base, '#18223A', 0.16)), deep: T(mix(base, '#18223A', 0.3)) };
  };
  // (the range at the back: palest)
  const backY = (x: number) => snap2(30 + wave(x, tw, 1.3) * 16 + jag(x, tw, 8, 2) * 4);
  range(g, tw, backY, TL_H, look('#8EA3C2', 0.42), 5, { gullies: 20, d: 12 });
  mist(g, tw, 26, TL_H - 26, haze, 0, 0.55, 6);
  // (the hills in front: woods up them)
  const frontY = (x: number) => snap2(64 + wave(x, tw, 4.1, 2) * 9);
  const front = look('#7E98A6', 0.26);
  range(g, tw, frontY, TL_H, front, 11, { gullies: 12, d: 10, forest: [front.shade, front.body], forestY: x => frontY(x) + 10 + wave(x, tw, 2.6, 3) * 4 });
  mist(g, tw, 56, TL_H - 56, haze, 0, 0.5, 5);
  // (the trees along the lot's edge: stepped crowns, their feet in the haze)
  const TR = ['#4E6E78', '#5D7C84', '#6E8E90', '#86A49E'].map(c => mix(farTint(c, 1, tod), haze, 0.12));
  const n = Math.round(tw / 14);
  for (let i = 0; i < n; i++) {
    const r = 8 + hash(i * 7.1) * 7;
    for (const x of [i * 14 + hash(i * 3.7) * 8, i * 14 + hash(i * 3.7) * 8 - tw]) {
      if (x < -r * 2) continue;
      crown(g, x, TL_EDGE - r * 0.5, r, TR);
    }
  }
  box(g, 0, TL_EDGE, tw, TL_H - TL_EDGE, TR[1]);
  checker(g, 0, TL_EDGE - 2, tw, 2, TR[1]);
  mist(g, tw, TL_EDGE - 30, 44, haze, 0.1, 0.7, 6);
};

const paintLotBase = (g: Ctx) => {
  // (local y 0 is the horizon. Asphalt, lighter and hazier far off, darker near; aggregate speckle, tar seams)
  const h = HT - HZ;
  bandedGradient(g, 0, 0, W, h, ['#A9ABB2', '#8E8F96', '#77777E', '#626167', '#4E4D52', '#3E3D42'], 16);
  for (let i = 0; i < 2600; i++) {
    const y = Math.pow(hash(i * 1.31), 0.7) * h, x = hash(i * 2.77) * W, near = y / h, sz = near > 0.45 ? 2 : 1;
    box(g, x, y, sz, sz, hash(i * 5.3) < 0.5 ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.14)');
  }
  for (let i = 0; i < 14; i++) {
    const y = Math.round(20 + hash(i * 4.4) * (h - 30)), x = hash(i * 8.8) * W, w = 30 + hash(i * 6.6) * 120 * (y / h);
    box(g, x, y, w, 1, 'rgba(20,18,22,0.35)'); box(g, x + w * 0.3, y + 1, w * 0.4, 1, 'rgba(20,18,22,0.25)');
  }
  // (the far edge melting into the haze)
  hazeBands(g, 0, 0, W, 26, SKY_PALE, 0.55, 0, 5);
};

/** A parked car seen from behind (its back end to the deck): x its left, `base` the ground under its wheels. */
const paintCar = (g: Ctx, x: number, base: number, u: number, type: number, col: string, hz: number) => {
  const H = (cl: string) => mix(cl, LOT_HAZE, hz);
  const r = rampOf(col).map(H);
  const w = Math.max(4, Math.round(34 * u));
  const bodyH = (type === 1 ? 11 : type === 3 ? 20 : 9) * u, cabH = (type === 1 ? 9 : type === 3 ? 0 : type === 2 ? 6 : 7) * u;
  const bt = base - 3 * u - bodyH, near = u > 0.55;
  // (its shadow on the asphalt, the tires)
  box(g, x - 2 * u, base - 2 * u, w + 4 * u, Math.max(1, 3 * u), `rgba(14, 12, 18, ${(0.5 * (1 - hz)).toFixed(2)})`);
  box(g, x + 2 * u, base - 5 * u, Math.max(1, 5 * u), Math.max(1, 5 * u), H('#141418'));
  box(g, x + w - 7 * u, base - 5 * u, Math.max(1, 5 * u), Math.max(1, 5 * u), H('#141418'));
  // (the cabin: a trapezoid, the back glass with the sky in it and a diagonal glint)
  if (cabH > 0) {
    const ci = (type === 1 ? 3 : type === 2 ? 7 : 5) * u, ct = 3 * u;
    const trap = (inset: number) => { g.beginPath(); g.moveTo(x + ci + inset, bt + 0.5); g.lineTo(x + ci + ct + inset, bt - cabH + inset); g.lineTo(x + w - ci - ct - inset, bt - cabH + inset); g.lineTo(x + w - ci - inset, bt + 0.5); g.closePath(); };
    if (near) { g.strokeStyle = INK; g.lineWidth = 2; trap(0); g.stroke(); }
    g.fillStyle = r[2]; trap(0); g.fill();
    g.fillStyle = H('#24304E'); trap(1.5 * u); g.fill();
    if (u > 0.35) {
      box(g, x + ci + ct, bt - cabH + 1.5 * u, w - 2 * (ci + ct), Math.max(1, 1.2 * u), H('#5A78AE'));
      const gx = x + ci + ct + 3 * u;
      for (let k = 0; k < 3; k++) box(g, gx + k * u * 1.2 + 4 * u, bt - cabH + 2.5 * u + k * u * 1.2, Math.max(1, 1.5 * u), Math.max(1, u), H('#BFD6FF'));
    }
    box(g, x + ci + ct, bt - cabH, w - 2 * (ci + ct), Math.max(1, u), r[4]);
    // (the noon sun on the roof)
    if (u > 0.4) box(g, x + ci + ct + 2 * u, bt - cabH, Math.max(2, 3 * u), Math.max(1, u), H('#FFFFFF'));
  }
  // (the body: lit along the top and down the left, shade along the bottom and the right, dithered between)
  if (near) box(g, x - 1, bt - 1, w + 2, bodyH + 2, INK);
  box(g, x, bt, w, bodyH, r[2]);
  box(g, x, bt, w, Math.max(1, 2 * u), r[3]);
  if (u > 0.5) checker(g, Math.round(x / 2) * 2, Math.round((bt + 2 * u) / 2) * 2, w, PIX, r[3]);
  box(g, x, bt, w, Math.max(1, 0.8 * u), r[4]);
  box(g, x, bt, Math.max(1, 1.5 * u), bodyH, r[3]);
  box(g, x + w - Math.max(1, 1.5 * u), bt, Math.max(1, 1.5 * u), bodyH, r[1]);
  box(g, x, bt + bodyH - 2 * u, w, Math.max(1, 2 * u), r[1]);
  if (type === 3) {
    // (the van's back windows across the top of it)
    box(g, x + 3 * u, bt + 3 * u, w - 6 * u, 5 * u, H('#24304E'));
    box(g, x + w / 2 - 0.5 * u, bt + 3 * u, Math.max(1, u), 5 * u, r[1]);
    if (u > 0.35) box(g, x + 5 * u, bt + 4 * u, Math.max(1, 2 * u), Math.max(1, u), H('#BFD6FF'));
  }
  if (type === 2) box(g, x + 2 * u, bt + 4 * u, w - 4 * u, Math.max(1, 0.6 * u), r[1]); // (the pickup's tailgate seam)
  // (taillights, the plate, the bumper)
  const ty = bt + (type === 3 ? 10 : 2) * u;
  box(g, x + u, ty, Math.max(1, 5 * u), Math.max(1, 2.5 * u), H('#C81E1E')); box(g, x + w - 6 * u, ty, Math.max(1, 5 * u), Math.max(1, 2.5 * u), H('#C81E1E'));
  if (u > 0.45) { box(g, x + u, ty, Math.max(1, 2 * u), Math.max(1, u), H('#FF8A70')); box(g, x + w - 6 * u, ty, Math.max(1, 2 * u), Math.max(1, u), H('#FF8A70')); }
  box(g, x + w / 2 - 4 * u, bt + bodyH - 5.5 * u, Math.max(1, 8 * u), Math.max(1, 3 * u), H('#E8E4D8'));
  box(g, x - 0.5 * u, base - 5 * u, w + u, Math.max(1, 2 * u), H('#2C2C32'));
  if (u > 0.45) box(g, x - 0.5 * u, base - 5 * u, w + u, 1, H('#6A6A74'));
};

/** One row's held strip: PER stalls, the lines between them, the cars in them (or an oil stain where one isn't). */
const stripTop = (r: number) => Math.floor(rowY(r) - 26 * rowS(r) - 4);
const stripH = (r: number) => Math.ceil(rowY(r) + 6 * rowS(r) + 4) - stripTop(r);
const paintRow = (g: Ctx, r: number) => {
  const s = rowS(r), step = 46 * s, hz = rowHaze(r), y = rowY(r) - stripTop(r);
  const line = mix('#ECEAE4', LOT_HAZE, hz * 0.8);
  // (the line along the front of the row, the stall lines, slanted back a touch)
  box(g, 0, y + 2 * s, PER * step, Math.max(1, 1.5 * s), line);
  for (let i = 0; i < PER; i++) {
    const lx = i * step;
    const depth = Math.max(2, 10 * s), lw = Math.max(1, 1.4 * s);
    for (let d = 0; d < depth; d += 1) box(g, lx + d * 0.35, y + 2 * s - d, lw, 1, line);
    const seed = hash(i * 13.1 + r * 101.7);
    const cx = lx + 6 * s;
    if (seed < 0.07) {
      // (the one free space in the whole lot: an oil stain in it)
      pixelBlob(g, cx + 17 * s, y - 2 * s, 9 * s + 2, 2 * s + 1, `rgba(16, 14, 20, ${(0.35 * (1 - hz)).toFixed(2)})`);
      continue;
    }
    const type = Math.floor(hash(i * 7.3 + r * 3.1) * 10), t = type < 5 ? 0 : type < 7 ? 1 : type < 9 ? 2 : 3;
    const col = CAR_COLS[Math.floor(hash(i * 5.9 + r * 11.3) * CAR_COLS.length)];
    paintCar(g, cx, y, s, t, col, hz);
  }
};

/** A light pole on a row: its footing, the round pole, the arm with two lamp heads, a banner hung off it. */
const paintPole = (g: Ctx, r: number, cx: number, base: number) => {
  const s = rowS(r), hz = rowHaze(r), H = (cl: string) => mix(cl, LOT_HAZE, hz);
  const ph = 72 * s, pw = Math.max(2, 3 * s);
  box(g, cx - 4 * s, base - 4 * s, 8 * s, 4 * s, H('#B8B4AE')); box(g, cx - 4 * s, base - 4 * s, 8 * s, Math.max(1, s), H('#DAD7D2'));
  pole(g, cx - pw / 2, base - ph, pw, ph - 3 * s, H('#9AA0AA'), s > 0.6);
  const ay = base - ph;
  box(g, cx - 14 * s, ay - 1, 28 * s, Math.max(2, 2 * s) + 2, s > 0.6 ? INK : H('#5A606A'));
  box(g, cx - 14 * s, ay, 28 * s, Math.max(1, 2 * s), H('#A8AEB8'));
  for (const side of [-1, 1]) {
    const lx = cx + side * 12 * s - 4 * s;
    box(g, lx - 1, ay + 1, 8 * s + 2, 4 * s + 2, s > 0.6 ? INK : H('#3A3F48'));
    box(g, lx, ay + 2, 8 * s, 3 * s, H('#4A505A')); box(g, lx, ay + 2, 8 * s, Math.max(1, s * 0.8), H('#7A808A'));
    box(g, lx + s, ay + 2 + 3 * s, 6 * s, Math.max(1, s), H('#E8ECF0'));
  }
  if (s > 0.4) {
    // (a banner down the pole, red or blue, a white star on it)
    const bw = 7 * s, bh = 14 * s, bx = cx + pw / 2, by = ay + 8 * s, col = r % 2 ? '#1E3A8A' : '#B91C1C', rp = rampOf(col).map(H);
    box(g, bx, by, Math.max(1, s), bh, H('#5A606A'));
    box(g, bx + s, by, bw, bh, rp[2]); box(g, bx + s, by, bw, Math.max(1, 1.5 * s), rp[3]); box(g, bx + s + bw - 1.5 * s, by, Math.max(1, 1.5 * s), bh, rp[1]);
    g.fillStyle = rp[2]; g.beginPath(); g.moveTo(bx + s, by + bh); g.lineTo(bx + s + bw / 2, by + bh + 3 * s); g.lineTo(bx + s + bw, by + bh); g.fill();
    star(g, bx + s + bw / 2, by + bh / 2, 2.4 * s, H('#F8FAFC'));
  }
};

const lotName = (n: number, r: number) => `LOT ${LOTS[((n % 5) + 5) % 5]} ${((n * 7 + r) % 90 + 90) % 90}Z`;

const parkingLot = (c: Ctx, cam: number, f: number) => {
  tiled(c, 'm2treeline', cam * 0.02, HZ - TL_EDGE + 2, 1024, TL_H, g => paintTreeLine(g, 1024));
  held_(c, 'm2lotbase', 0, HZ, W, HT - HZ, paintLotBase);
  // (heat coming off the far asphalt: thin pale streaks wavering)
  for (let i = 0; i < 5; i++) {
    const y = HZ + 2 + i * 3, x0 = Math.round((hash(i * 3.3) * W + Math.sin(f * 0.045 + i * 1.7) * 14) / 2) * 2, w = 60 + Math.round(hash(i * 5.5) * 90);
    c.fillStyle = 'rgba(232, 240, 250, 0.22)';
    c.fillRect(x0, y, w, 1); c.fillRect((x0 + 380) % W, y + 1, w * 0.7, 1);
  }
  for (let r = 0; r < ROWS; r++) {
    const s = rowS(r), step = 46 * s, sw = PER * step, base = cam * rowPar(r) + r * 137, y = rowY(r);
    tiled(c, `m2row${r}`, base, stripTop(r), Math.round(sw), stripH(r), g => paintRow(g, r));
    // (a light pole now and then on its row, going by with it, the same sign on the same pole)
    if (r % 3 === 2) {
      const gap = step * POLE_EVERY, first = Math.floor(base / gap) - 1;
      for (let n = first; n * gap - base < W + gap; n++) {
        const x = Math.round(n * gap - base);
        if (x < -40 * s || x > W + 40 * s) continue;
        const pw = Math.ceil(32 * s) + 4, ptop = Math.floor(y - 72 * s - 4);
        held_(c, `m2pole${r}`, x - pw, ptop, pw * 2, y - ptop + 2, g => paintPole(g, r, pw, y - ptop));
        if (s > 0.7) {
          // (the sign as wide as the lot's name, centered on its pole)
          const name = lotName(n, r), nw = signW(name, federal(5, WHITE)) + 8;
          held_(c, `m2sign:${name}`, x - nw / 2 - 5, y - 50 * s - 5, nw + 10, 22, g => sign(g, 5, 5, nw, 12, BLUE, name, WHITE, 5, INK, federal(5, WHITE)), true);
        }
      }
    }
    if (r === 4) tram(c, cam, f, y + 9);
    if (r === 2 || r === 5 || r === 6) walkers(c, cam, f, r, y + Math.round((rowY(r + 1) - y) * 0.45));
  }
};

const TRAM_W = 120;
const paintTram = (g: Ctx) => {
  // (local: 0..TRAM_W by 0..30, wheels on 28. A little tractor and three open cars with striped canopies, all facing left)
  const car = (x: number, w: number) => {
    box(g, x, 10, w, 2, INK);
    for (let i = 0; i < w; i += 4) box(g, x + i, 10, 2, 2, '#B91C1C');
    for (let i = 2; i < w; i += 4) box(g, x + i, 10, 2, 2, '#F1EFEA');
    box(g, x + 1, 12, 1, 8, '#8A90A0'); box(g, x + w - 2, 12, 1, 8, '#8A90A0');
    // (riders: a head or two)
    for (let i = 0; i < 3; i++) { const hx = x + 4 + i * ((w - 8) / 3); box(g, hx, 15, 3, 3, ['#E0B48A', '#8A5A3A', '#F0C8A0'][i % 3]); box(g, hx - 1, 18, 5, 2, ['#1E3A8A', '#B91C1C', '#CA8A04'][i % 3]); }
    box(g, x - 1, 19, w + 2, 7, INK); box(g, x, 20, w, 5, '#2D51B0'); box(g, x, 20, w, 1, '#4570D0'); box(g, x, 24, w, 1, '#14205C');
    box(g, x + 3, 25, 4, 4, INK); box(g, x + w - 7, 25, 4, 4, INK);
  };
  // (the tractor: a hood, a roof, a flag)
  box(g, 1, 14, 22, 12, INK); box(g, 2, 15, 20, 10, '#E8ECF2'); box(g, 2, 15, 20, 2, '#FFFFFF'); box(g, 2, 23, 20, 2, '#B8C1D2');
  box(g, 8, 8, 14, 2, INK); box(g, 9, 10, 1, 6, '#8A90A0'); box(g, 20, 10, 1, 6, '#8A90A0');
  box(g, 3, 17, 4, 3, '#28406E'); box(g, 4, 17, 1, 1, '#BFD6FF');
  box(g, 3, 25, 5, 4, INK); box(g, 15, 25, 5, 4, INK);
  box(g, 21, 2, 1, 8, '#8A90A0'); box(g, 22, 2, 5, 3, '#B91C1C'); box(g, 22, 3, 5, 1, '#F8FAFC');
  for (let i = 0; i < 3; i++) car(26 + i * 31, 28);
};

const tram = (c: Ctx, cam: number, f: number, base: number) => {
  // (round the lot, going left, slow, picking up nobody)
  const x = (((2600 - f * 0.45 - cam * rowPar(4)) % 3200) + 3200) % 3200 - 400;
  if (x > W || x + TRAM_W < 0) return;
  box(c, x + 2, base - 1, TRAM_W - 4, 2, 'rgba(14, 12, 18, 0.35)');
  held_(c, 'm2tram', x, base - 29, TRAM_W, 30, paintTram);
};

/** A few little people in the aisles, trudging to or from their cars (it's a long way). */
const walkers = (c: Ctx, cam: number, f: number, r: number, y: number) => {
  const s = rowS(r) * 0.9, hz = rowHaze(r), par = rowPar(r);
  const H = (cl: string) => mix(cl, LOT_HAZE, hz);
  for (let i = 0; i < 3; i++) {
    const seed = r * 11 + i, v = (hash(seed * 1.9) < 0.5 ? -1 : 1) * (0.12 + hash(seed * 2.7) * 0.18);
    const x = Math.round(((((hash(seed * 4.1) * 1400 + f * v - cam * par) % 1400) + 1400) % 1400) - 200);
    if (x < -10 || x > W + 10) continue;
    const step = Math.floor(f * Math.abs(v) * 0.5 + i) % 2;
    const skin = H(['#E0B48A', '#8A5A3A', '#C68E62', '#F0C8A0'][((Math.floor(seed * 3) % 4) + 4) % 4]), shirt = H(['#B91C1C', '#F8FAFC', '#1E3A8A', '#CA8A04', '#166534'][((Math.floor(seed) % 5) + 5) % 5]);
    const hgt = 14 * s;
    box(c, x - 3 * s, y - 1, 7 * s, 2, 'rgba(14, 12, 18, 0.3)');
    box(c, x - s, y - hgt * 0.42, Math.max(1, 1.5 * s), hgt * 0.42 - (step ? 1 : 0), H('#2A3550'));
    box(c, x + s, y - hgt * 0.42, Math.max(1, 1.5 * s), hgt * 0.42 - (step ? 0 : 1), H('#2A3550'));
    box(c, x - 2 * s, y - hgt * 0.8, 5 * s, hgt * 0.4, shirt);
    box(c, x - 1.5 * s, y - hgt, 4 * s, hgt * 0.22, skin);
    if (hash(seed * 6.6) < 0.4) box(c, x - 2 * s, y - hgt - 1, 5 * s, Math.max(1, s), H('#B91C1C')); // (a cap)
  }
};

// ---------------------------------------------------------------------------------------------------------------------
// The skyline over America USA: every American city's landmarks, theme-park size, far off in the haze
// ---------------------------------------------------------------------------------------------------------------------

/**
 * The skyline strip: SKY_TW wide, put down at SKY_TOP. The landmarks were laid out in screen y with their feet at 440;
 * they're stood up LIFT higher now, on ground of their own (SKY_FOOT down SKY_GH, over the top of the park in front),
 * so `L` takes those old screen y's to the strip's own.
 */
const SKY_TW = 1400, SKY_TOP = 60, LIFT = 40, SKY_FOOT = 400, SKY_GH = 44;
const L = (y: number) => y - SKY_TOP - LIFT;
/** The landmarks' foot (the strip's own y). */
const SF = SKY_FOOT - SKY_TOP;
/** The far layer's look at the hour (space/farArt.ts's Far): its colors under the hour's light, into the haze; the
 *  windows showing the sky by day, lit after dark. */
const skyFar = (): Far => {
  const tod = timeOfDay(), hz = skyTint(SKY_PALE, 0.95, tod);
  const T = (c: string) => mix(farTint(c, 1, tod), hz, 0.36);
  return { T, night: tod.lamps, s: 1, glass: T(mix(skyTint('#7EA8EA', 0.5, tod), '#2A3A6A', 0.3)) };
};

/** A tower block on the skyline's foot: lit down its left, shade dithered in down its right, windows over it (the sky
 *  in them by day, lit after dark, more the darker it gets). */
const tower = (g: Ctx, F: Far, x: number, w: number, top: number, col = '#B4BCCC') => {
  const R = rampF(F, col);
  block(g, x, top, w, SF - top, R);
  windowGrid(g, F, x + 2, top, w - 6, SF - top - 2, R, x * 7.7, 4);
};

/**
 * Every American city's landmarks, theme-park size, far off (space/farArt.ts's far kit, all on the art's 2 px grid,
 * lit down the left, shade dithered in down the right, round things in columns across or stepped shells): a needle
 * tower (legs to a waist, its saucer's rim of windows, the orange roof, the spire, a beacon after dark); downtown's
 * towers (one stepped back to a spire, one under a crown of arches); the big arch in steel; the torch held up on her
 * pedestal; a capitol (wings in columns, the drum, the dome in shells and ribs, the lantern); a fake mountain, snow
 * painted on; a coaster's lift hill in lattice; the Ferris wheel's legs and rim (it turns, live). Windows show the sky by
 * day and light up after dark. All of it stood on its own ground (a lawn banded darker going down, a walk with its
 * lamps, a tree line along its back in front of their feet), the haze lying over their feet. Nothing lit along a top.
 */
const paintSkyline = (g: Ctx) => {
  const F = skyFar(), tod = timeOfDay();
  const LIT = '#FFE8A0', lamp = (col: string) => (F.night > 0.3 ? mix(col, LIT, Math.min(1, F.night)) : col);
  // A needle tower: three legs pinched at the waist, the saucer, the spire
  {
    const x = 90, C = rampF(F, '#C8CCD6'), O = rampF(F, '#E07A3A');
    poly(g, [[x - 16, SF], [x - 3, L(240)], [x + 3, L(240)], [x + 16, SF], [x + 10, SF], [x, L(262)], [x - 10, SF]], C[1]);
    poly(g, [[x - 16, SF], [x - 3, L(240)], [x - 1, L(240)], [x - 12, SF]], C[3]);
    cylV(g, x, L(240), L(176), 8, 6, C);
    box(g, x - 6, L(244), 12, 2, C[0]); box(g, x - 6, L(244), 4, 2, C[3]);
    // (the saucer: its underside stepped up into the rim, the rim's windows, the orange roof, the cap)
    for (const [k, col] of [[1, C[0]], [0.78, C[1]]] as const) { g.fillStyle = col; g.beginPath(); g.ellipse(x - (1 - k) * 4, L(176), 24 * k, 7 * k, 0, 0, Math.PI); g.fill(); }
    for (let xx = -26; xx < 26; xx += 2) box(g, x + xx, L(176) - 6, 2, 6, across((xx + 26) / 52, C));
    windowRow(g, F, x - 22, x + 22, L(174), C, 17, 4, 2, false);
    for (let xx = -18; xx < 18; xx += 2) box(g, x + xx, L(164), 2, 6, across((xx + 18) / 36, O));
    for (let xx = -10; xx < 10; xx += 2) box(g, x + xx, L(160), 2, 4, across((xx + 10) / 20, C));
    cylV(g, x, L(160), L(124), 4, 2, C);
    box(g, x - 2, L(126), 2, 2, F.night > 0.15 ? '#FF4A5A' : C[0]);
  }
  // Downtown: towers, a stepped one with a spire, one with a crown of arches
  tower(g, F, 160, 34, L(262), '#AEB4C4'); tower(g, F, 198, 26, L(300), '#C4BCB0');
  {
    const x = 232, R = rampF(F, '#C8C0B0');
    tower(g, F, x, 44, L(230), '#C8C0B0'); tower(g, F, x + 6, 32, L(190), '#C8C0B0'); tower(g, F, x + 12, 20, L(156), '#C8C0B0');
    block(g, x + 16, L(130), 12, 26, R);
    cylV(g, x + 22, L(130), L(104), 4, 2, R);
    box(g, x + 20, L(106), 2, 2, F.night > 0.15 ? '#FF4A5A' : R[0]);
  }
  {
    const x = 290, R = rampF(F, '#D4D8E0');
    tower(g, F, x, 30, L(204), '#D4D8E0');
    // (the crown: arches stepped in, each lit at its left and shaded at its right, its windows lit after dark)
    for (let i = 0; i < 5; i++) {
      const w = 30 - i * 6, y = L(204) - (i + 1) * 7, cx = x + 15;
      for (let xx = -w / 2; xx < w / 2; xx += 2) { const hh = Math.sqrt(Math.max(0, 1 - ((xx + 1) / (w / 2)) ** 2)) * (w / 2); box(g, snap2(cx + xx), snap2(y + 7 - hh), 2, snap2(hh) + 2, across((xx + w / 2) / w, R)); }
      for (let k = 0; k < w - 4; k += 4) box(g, cx - w / 2 + 3 + k, y + 4, 2, 2, hash(i * 9 + k) < F.night * 0.9 ? LIT : R[0]);
    }
    cylV(g, x + 15, L(150), L(130), 2, 2, R);
  }
  tower(g, F, 330, 38, L(250), '#A8B0C2'); tower(g, F, 372, 22, L(286), '#C0B8AC');
  // A big arch: stepped steel, lit down its left leg, thinner at the top
  {
    const cx = 480, hw = 76, top = L(236), S = rampF(F, '#D8DEE8');
    for (let dx = -hw; dx <= hw; dx += PIX) {
      const u = dx / hw, yo = top + (SF - top) * (Math.cosh(u * 1.6) - 1) / (Math.cosh(1.6) - 1);
      const th = 6 + 10 * Math.abs(u) * Math.abs(u);
      const ui = (dx + 1) / hw, yi = top + 6 + (SF - top - 6) * (Math.cosh(ui * 1.7) - 1) / (Math.cosh(1.7) - 1);
      const yb = Math.min(SF, Math.max(yo + th * 0.5, yi));
      const col = u < -0.5 ? S[3] : u < -0.1 ? S[4] : u < 0.2 ? S[2] : u < 0.6 ? S[1] : S[0];
      box(g, cx + dx, snap2(yo), PIX, Math.max(2, yb - yo + (Math.abs(u) > 0.9 ? SF - yb : 0)), col);
      if ((dx / PIX) % 2 === 0 && Math.abs(u) > 0.1) checker(g, cx + dx, snap2(yo) + 2, PIX, Math.max(2, snap2((yb - yo) * 0.5)), u < 0 ? S[3] : S[0]);
    }
  }
  // The torch held up: a star-shaped base, the pedestal, the robed figure, the arm, the gold flame (brighter after dark)
  {
    const x = 640, GR = rampF(F, '#7FB0A6'), P = rampF(F, '#C8BEA8');
    block(g, x - 30, L(422), 60, SF - L(422), P);
    block(g, x - 16, L(360), 32, 62, P);
    box(g, x - 18, L(360), 36, 4, P[1]);
    for (let i = 0; i < 4; i++) box(g, x - 10 + i * 6, L(372), 2, 10, P[0]);
    for (let y = L(304); y < L(360); y += 2) { const t = (y - L(304)) / (L(360) - L(304)), hw = snap2(7 + 5 * t); for (let xx = -hw; xx < hw; xx += 2) box(g, x + xx, y, 2, 2, across((xx + hw) / (hw * 2), GR)); }
    for (let i = 0; i < 3; i++) box(g, x - 4 + i * 4, L(320), 1, 38, GR[1]); // (the robe's folds)
    for (let xx = -4; xx < 4; xx += 2) box(g, x + xx, L(296), 2, 9, across((xx + 4) / 8, GR));
    for (let i = -2; i <= 2; i++) box(g, x + i * 3, L(292) - (2 - Math.abs(i)) * 2, 2, 4 + (2 - Math.abs(i)) * 2, i < 0 ? GR[3] : GR[2]); // (the crown's spikes)
    box(g, x + 6, L(262), 4, 44, GR[2]); box(g, x + 6, L(262), 2, 44, GR[3]); box(g, x + 9, L(262), 1, 44, GR[1]);
    box(g, x + 4, L(256), 8, 6, GR[1]); box(g, x + 4, L(256), 2, 6, GR[3]);
    const fl = mix(F.T('#E8B400'), '#FFD84A', 0.4 + F.night * 0.6);
    if (F.night > 0.3) box(g, x + 4, L(250), 8, 10, mix(F.T('#E8B400'), GR[2], 0.5));
    box(g, x + 6, L(248), 4, 8, fl); box(g, x + 7, L(244), 2, 6, lamp('#FFD84A')); box(g, x + 7, L(246), 1, 3, '#FFF2A8');
    box(g, x - 12, L(330), 6, 10, GR[1]); // (the tablet)
  }
  // A capitol: wings with columns, a drum, the dome in stepped shells and ribs, the lantern and the statue on top
  {
    const x = 790, CP = rampF(F, '#E2E4EA');
    block(g, x - 84, L(398), 168, SF - L(398), CP);
    box(g, x - 84, L(404), 168, 2, CP[1]);
    for (let i = -80; i < 80; i += 6) box(g, x + i, L(408), 2, SF - L(408) - 4, i < -40 ? CP[3] : i < 30 ? CP[2] : CP[1]);
    for (let i = -78; i < 78; i += 6) box(g, x + i + 2, L(410), 2, 4, hash(i * 3.3) < F.night * 0.8 ? LIT : CP[0]);
    poly(g, [[x - 30, L(398)], [x, L(384)], [x, L(398)]], CP[3]); poly(g, [[x, L(384)], [x + 30, L(398)], [x, L(398)]], CP[1]);
    block(g, x - 28, L(360), 56, 24, CP);
    for (let i = -24; i < 24; i += 5) box(g, x + i, L(364), 2, 18, i < -8 ? CP[3] : i < 10 ? CP[2] : CP[0]);
    orb(g, x, L(360), 26, CP, true);
    g.save(); g.beginPath(); g.rect(x - 26, L(360) - 26, 52, 26); g.clip();
    g.strokeStyle = CP[1]; g.lineWidth = 1;
    for (const k of [0.4, 0.75]) { g.beginPath(); g.ellipse(snap2(x), L(360), 26 * k, 26, 0, Math.PI, Math.PI * 2); g.stroke(); }
    g.restore();
    cylV(g, x, L(334), L(326), 8, 8, CP); cylV(g, x, L(326), L(318), 6, 4, CP);
    box(g, x - 2, L(318), 2, 2, F.night > 0.3 ? LIT : CP[0]);
  }
  // More towers, one with an antenna, a slim one with a needle
  tower(g, F, 896, 30, L(232), '#B8B0A4'); cylV(g, 911, L(232), L(196), 2, 2, rampF(F, '#B8B0A4'));
  tower(g, F, 930, 46, L(284), '#A4AEC0'); tower(g, F, 980, 26, L(214), '#C8CCD4'); cylV(g, 993, L(214), L(176), 2, 2, rampF(F, '#C8CCD4'));
  box(g, 992, L(178), 2, 2, F.night > 0.15 ? '#FF4A5A' : F.T('#8A8E98'));
  // The big fake mountain: its lit face and its shaded one dithered together down the ridge, crags in them, the snow on
  // top (painted on: lit and shaded the same way), a flag on the peak
  {
    const x0 = 1020, x1 = 1170, px = 1086, py = L(206), M = rampF(F, '#8E98AA'), Sn = rampF(F, '#EEF2F8');
    poly(g, [[x0, SF], [px - 18, L(270)], [px, py], [px + 6, L(300)], [px - 8, SF]], M[3]);
    poly(g, [[px - 8, SF], [px + 6, L(300)], [px, py], [px + 22, L(256)], [x1, SF]], M[1]);
    for (let y = py + 4; y < SF; y += 2) { const t = (y - py) / (SF - py), rx = snap2(px + (t < 0.3 ? 6 * (t / 0.3) : 6 - 14 * ((t - 0.3) / 0.7))); box(g, rx - 2, y, 2, 2, (y / 2) % 2 ? M[2] : M[3]); box(g, rx, y, 2, 2, (y / 2) % 2 ? M[1] : M[2]); }
    for (let i = 0; i < 6; i++) { const cx = x0 + 20 + i * 18 + (i > 2 ? 10 : 0), cy = snap2(L(360) + hash(i) * 50); box(g, cx, cy, 8, 2, i < 3 ? M[4] : M[0]); box(g, cx + 2, cy + 2, 6, 2, i < 3 ? M[2] : M[0]); }
    poly(g, [[px - 18, L(250)], [px, py], [px + 1, py + 2], [px + 4, L(250)], [px - 4, L(242)], [px - 10, L(254)]], Sn[3]);
    poly(g, [[px + 1, py + 2], [px + 18, L(246)], [px + 10, L(240)], [px + 4, L(250)]], Sn[1]);
    box(g, px, py - 14, 1, 14, M[0]); box(g, px + 1, py - 14, 7, 2, F.T('#C86A72')); box(g, px + 1, py - 12, 7, 2, F.T('#E8ECF4')); box(g, px + 1, py - 14, 3, 2, F.T('#6A80B8'));
  }
  // A roller coaster's lift hill: a lattice up, the drop down, the track along its top
  {
    const ax = 1150, ay = SF, bx = 1206, by = L(250), cx = 1250, C = rampF(F, '#E2DCD2');
    const drop = (t: number) => ({ x: bx + (cx - bx) * t, y: by + (SF - by) * (t * t * (3 - 2 * t)) });
    const topAt = (x: number) => (x <= bx ? ay + (by - ay) * ((x - ax) / (bx - ax)) : drop((x - bx) / (cx - bx)).y);
    for (let x = ax; x <= cx; x += 8) {
      const ty = snap2(topAt(x));
      box(g, x, ty, 2, SF - ty, C[2]); box(g, x + 2, ty, 1, SF - ty, C[0]);
      // (the X's between bents, stepped)
      if (x + 8 <= cx) for (let y = Math.max(ty, snap2(topAt(x + 8))) + 2; y < SF - 2; y += 8) for (let k = 0; k < 8; k += 2) { box(g, x + k, y + k, 2, 2, C[1]); box(g, x + 6 - k, y + k, 2, 2, C[0]); }
    }
    for (let x = ax; x <= cx; x += 2) { const ty = snap2(topAt(x)); box(g, x, ty - 2, 2, 4, x <= bx ? C[3] : C[1]); }
  }
  // The Ferris wheel's legs and rim (the spokes and the cars go round, live)
  {
    const { x, y, r } = WHEEL, C = rampF(F, '#E4E8F0');
    poly(g, [[x - 32, SF], [x - 2, L(y + LIFT)], [x + 1, L(y + LIFT)], [x - 26, SF]], C[3]);
    poly(g, [[x + 26, SF], [x - 1, L(y + LIFT)], [x + 2, L(y + LIFT)], [x + 32, SF]], C[1]);
    g.strokeStyle = C[1]; g.lineWidth = 2; g.beginPath(); g.arc(x, L(y + LIFT), r, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = C[0]; g.lineWidth = 1; g.beginPath(); g.arc(x, L(y + LIFT), r - 4, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = C[3]; g.lineWidth = 2; g.beginPath(); g.arc(x, L(y + LIFT), r, Math.PI * 0.8, Math.PI * 1.4); g.stroke();
    block(g, x - 40, SF - 4, 80, 4, C);
  }
  tower(g, F, 1340, 32, L(276), '#B0B8C8'); tower(g, F, 1366, 20, L(318), '#C4BCB0');
  // (the haze lying over their feet)
  mist(g, SKY_TW, L(330), SF - L(330), skyTint(SKY_PALE, 0.95, tod), 0, 0.6, 7);
  skyGround(g, F, tod);
};

/** The ground the skyline stands on, from its foot down: a lawn banded darker going down (each step dithered in), a
 *  pale walk along it with its lamps (lit after dark), and a tree line along its back edge in front of the landmarks'
 *  feet (stepped crowns, gaps here and there), misted. Whole round the tile. */
const skyGround = (g: Ctx, F: Far, tod: ReturnType<typeof timeOfDay>) => {
  const Lw = ['#2E4E26', '#3C6230', '#4A763A', '#5C8A44'].map(F.T), Wk = rampF(F, '#D8D2C4');
  box(g, 0, SF - 2, SKY_TW, SKY_GH + 2, Lw[3]);
  [Lw[2], Lw[1], Lw[0]].forEach((col, i) => { const y = SF + snap2(((i + 1) * SKY_GH) / 4); box(g, 0, y, SKY_TW, SF + SKY_GH - y, col); checker(g, 0, y - 2, SKY_TW, 2, col, i % 2); });
  const wy = SF + 16;
  box(g, 0, wy, SKY_TW, 4, Wk[2]); box(g, 0, wy + 4, SKY_TW, 2, Wk[0]);
  for (let x = 30; x < SKY_TW; x += 100) { box(g, x, wy - 10, 2, 10, Wk[0]); box(g, x - 2, wy - 12, 4, 2, F.night > 0.3 ? '#FFE8A0' : Wk[1]); }
  const T = ['#24442A', '#335E34', '#477A3C', '#62964A'].map(F.T), n = Math.round(SKY_TW / 11);
  for (let i = 0; i < n; i++) {
    if (hash(i * 1.37 + 4) < 0.25) continue;
    const rr = 5 + hash(i * 3.1) * 4;
    for (const x of [(i * SKY_TW) / n, (i * SKY_TW) / n + SKY_TW, (i * SKY_TW) / n - SKY_TW]) if (x > -rr * 2 && x < SKY_TW + rr * 2) crown(g, x, SF + 2 - rr * 0.4, rr, T);
  }
  mist(g, SKY_TW, SF - 10, SKY_GH + 10, skyTint(SKY_PALE, 0.95, tod), 0.42, 0.12, 4);
};

/**
 * The hills out past America USA, behind its skyline (further off still, slower): a pale range, misted, then wooded
 * hills rolling in front of it; their feet under the skyline's ground. Whole cycles round the tile.
 */
const SKY_HILL_TW = 1024, SKY_HILL_H = 130;
const paintSkyHills = (g: Ctx) => {
  const tod = timeOfDay(), haze = skyTint(SKY_PALE, 0.95, tod), tw = SKY_HILL_TW, h = SKY_HILL_H;
  const look = (base: string, k: number): RangeLook => {
    const T = (c: string) => mix(farTint(c, 1.2, tod), haze, k);
    return { body: T(base), lit: T(mix(base, '#E8F0F8', 0.26)), hi: T(mix(base, '#FFFFFF', 0.4)), shade: T(mix(base, '#18223A', 0.16)), deep: T(mix(base, '#18223A', 0.3)) };
  };
  const backY = (x: number) => snap2(30 + wave(x, tw, 3.7) * 18 + jag(x, tw, 8, 6) * 4);
  range(g, tw, backY, h, look('#90A4C4', 0.45), 21, { gullies: 22, d: 12 });
  mist(g, tw, 30, h - 30, haze, 0, 0.55, 6);
  const frontY = (x: number) => snap2(78 + wave(x, tw, 0.9, 2) * 12);
  const front = look('#7C96A8', 0.3);
  range(g, tw, frontY, h, front, 27, { gullies: 14, d: 10, forest: [front.shade, front.body], forestY: x => frontY(x) + 12 + wave(x, tw, 5.1, 3) * 5 });
  mist(g, tw, 70, h - 70, haze, 0, 0.55, 5);
};

/** The Ferris wheel's middle (in the skyline strip's x; its y as laid out, in the old screen terms: see `L`) and its
 *  rim's radius. */
const WHEEL = { x: 1300, y: 352 - LIFT, r: 56 };

const SKY_PAR = 0.1, PARK_PAR = 0.2, PARK_TW = 1200, PARK_TOP = 404;

const paintPark = (g: Ctx) => {
  // (local y 0 = PARK_TOP. The park's nearer roofs and trees, dimmed back toward the sky: nobody's standing up there)
  const D = (cl: string) => dim(mix(cl, SKY_PALE, 0.25));
  const h = HT - PARK_TOP;
  // rooftops: a carousel's cone, tent tops, a turret, plain roofs
  for (let i = 0; i < 12; i++) {
    const x = i * 100 + hash(i * 2.2) * 40, kind = Math.floor(hash(i * 4.4) * 4), top = 30 + hash(i * 6.6) * 24;
    if (kind === 0) {
      // (a carousel: a striped cone, a drum under it)
      for (let k = 0; k < 8; k++) { g.fillStyle = D(k % 2 ? '#F1EFEA' : '#B91C1C'); g.beginPath(); g.moveTo(x + 24, top - 18); g.lineTo(x + k * 6, top + 6); g.lineTo(x + k * 6 + 6, top + 6); g.closePath(); g.fill(); }
      box(g, x + 4, top + 6, 40, 30, D('#CA8A04')); box(g, x + 4, top + 6, 40, 2, D('#FFD84A'));
    } else if (kind === 1) {
      // (a tent top in stripes)
      for (let k = 0; k < 6; k++) { g.fillStyle = D(k % 2 ? '#F1EFEA' : '#1E3A8A'); g.beginPath(); g.moveTo(x + 30, top - 10); g.lineTo(x + k * 10, top + 12); g.lineTo(x + k * 10 + 10, top + 12); g.closePath(); g.fill(); }
    } else if (kind === 2) {
      // (a turret, a pointed cap, a pennant)
      box(g, x + 10, top, 18, 50, D('#C8B8A0')); box(g, x + 10, top, 3, 50, D('#E0D4C0')); box(g, x + 24, top, 4, 50, D('#A89880'));
      g.fillStyle = D('#1E3A8A'); g.beginPath(); g.moveTo(x + 7, top); g.lineTo(x + 19, top - 22); g.lineTo(x + 31, top); g.closePath(); g.fill();
      box(g, x + 19, top - 30, 1, 8, D('#5A606A')); box(g, x + 20, top - 30, 6, 3, D('#B91C1C'));
    } else {
      box(g, x, top + 10, 56, 40, D('#B8A890')); box(g, x, top + 10, 56, 2, D('#D8CCB4')); box(g, x + 44, top + 10, 12, 40, D('#988870'));
      for (let k = 0; k < 5; k++) box(g, x + 6 + k * 10, top + 18, 4, 4, D('#5A6A8A'));
    }
  }
  // trees in front: clumps, shade under, lit on top
  for (let i = 0; i < PARK_TW / 22; i++) {
    const x = i * 22 + hash(i * 9.1) * 10, r = 12 + hash(i * 3.9) * 10, y = 62 - r * 0.3;
    pixelBlob(g, x, y + 3, r, r * 0.75, D('#2F5A3A'));
  }
  for (let i = 0; i < PARK_TW / 22; i++) {
    const x = i * 22 + hash(i * 9.1) * 10, r = 12 + hash(i * 3.9) * 10, y = 62 - r * 0.3;
    pixelBlob(g, x - 2, y - 1, r * 0.75, r * 0.55, D('#3F7046'));
    pixelBlob(g, x - 4, y - r * 0.3, r * 0.4, r * 0.28, D('#5A8C56'));
  }
  bandedGradient(g, 0, 66, PARK_TW, h - 66, [D('#3A6440'), D('#2E5034'), D('#24402A')], 6);
  hazeBands(g, 0, 0, PARK_TW, 50, SKY_PALE, 0.35, 0, 5);
};

const skyline = (c: Ctx, cam: number, f: number) => {
  // (the hills further off still, behind it all: their feet under the skyline's ground)
  tiled(c, 'm2skyhills', cam * SKY_PAR * 0.5, SKY_FOOT + 4 - SKY_HILL_H, SKY_HILL_TW, SKY_HILL_H, paintSkyHills);
  tiled(c, 'm2skyline', cam * SKY_PAR, SKY_TOP, SKY_TW, SF + SKY_GH, paintSkyline);
  // (what goes round: the Ferris wheel, the coaster's train up the lift hill and over; in the far layer's colors)
  const FC = rampF(skyFar(), '#E4E8F0'), night = timeOfDay().lamps;
  const off = ((cam * SKY_PAR) % SKY_TW + SKY_TW) % SKY_TW;
  for (let base = -Math.round(off); base < W + SKY_TW; base += SKY_TW) {
    const wx = base + WHEEL.x;
    if (wx > -WHEEL.r - 10 && wx < W + WHEEL.r + 10) {
      const th = f * 0.004;
      c.strokeStyle = FC[1]; c.lineWidth = 1; c.beginPath();
      for (let i = 0; i < 8; i++) { const a = th + (i / 8) * Math.PI; c.moveTo(wx + Math.cos(a) * WHEEL.r, WHEEL.y + Math.sin(a) * WHEEL.r); c.lineTo(wx - Math.cos(a) * WHEEL.r, WHEEL.y - Math.sin(a) * WHEEL.r); }
      c.stroke();
      box(c, wx - 4, WHEEL.y - 4, 8, 8, FC[1]); box(c, wx - 4, WHEEL.y - 4, 4, 4, FC[3]);
      // (bulbs round the rim after dark)
      if (night > 0.3) for (let i = 0; i < 24; i++) { const a = th + (i / 24) * Math.PI * 2 + 0.13; box(c, Math.round(wx + Math.cos(a) * WHEEL.r) - 1, Math.round(WHEEL.y + Math.sin(a) * WHEEL.r) - 1, 2, 2, i % 2 ? '#FFE8A0' : '#FF9AD0'); }
      const GON = ['#C86A72', '#E6EAF2', '#6A80B8'].map(cl => rampF(skyFar(), cl));
      for (let i = 0; i < 12; i++) {
        const a = th + (i / 12) * Math.PI * 2, gx = Math.round(wx + Math.cos(a) * WHEEL.r), gy = Math.round(WHEEL.y + Math.sin(a) * WHEEL.r), G = GON[i % 3];
        box(c, gx, gy, 1, 3, FC[0]); box(c, gx - 3, gy + 3, 7, 5, G[2]); box(c, gx - 3, gy + 3, 2, 5, G[3]); box(c, gx + 2, gy + 3, 2, 5, G[1]);
        if (night > 0.3) box(c, gx - 1, gy + 4, 2, 2, '#FFE8A0');
      }
    }
    // (the train: up the lift hill slow, down the drop fast, gone round the back, again)
    const cyc = (f % 900) / 900, crest = 250 - LIFT;
    let tx: number, ty: number;
    if (cyc < 0.7) { const u = cyc / 0.7; tx = 1150 + 56 * u; ty = SKY_FOOT + (crest - SKY_FOOT) * u; }
    else if (cyc < 0.8) { const u = (cyc - 0.7) / 0.1; tx = 1206 + 44 * u; ty = crest + (SKY_FOOT - crest) * (u * u * (3 - 2 * u)); }
    else continue;
    const sx = base + tx;
    if (sx > -20 && sx < W + 20) for (let k = 0; k < 3; k++) box(c, Math.round(sx - k * 5 - 2), Math.round(ty - 4 + (cyc < 0.7 ? k * 3.4 : -k * 2)), 4, 3, k === 0 ? '#C04A56' : '#D86A74');
  }
  tiled(c, 'm2park', cam * PARK_PAR, PARK_TOP, PARK_TW, HT - PARK_TOP, paintPark);
};
