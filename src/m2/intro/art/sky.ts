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
  type Ctx, INK, WHITE, BLUE, box, text, sign, star, pole, mix, rampOf, dim, hash, checker, bandedGradient, hazeBands, steppedGlow, pixelBlob, PIX,
} from './kit';
import { timeOfDay, skyRamp, sunAt, sunTint, cloudTint, drawStars, drawMoon } from '../../timeOfDay';

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
const BANNER_W = BANNER.length * 8 + 20, BANNER_H = 18;

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
  text(g, BANNER, BANNER_W / 2, BANNER_H / 2 + 4, '#B91C1C', 8, 'center', '#C8C4BE');
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
  text(g, 'HAPPY LAND', cx - 4, cy + 4, '#FFFFFF', 8, 'center', '#5C0A0A');
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

const paintTreeLine = (g: Ctx, tw: number) => {
  // (local y 0..64; the horizon at 52. Low blue hills, then the trees along the far edge of the lot, then the haze)
  const per = (x: number, m: number, ph: number) => Math.sin((x / tw) * Math.PI * 2 * m + ph);
  for (let x = 0; x < tw; x += PIX) {
    const hy = Math.round((30 - 10 * (0.5 + 0.5 * per(x, 3, 1.2)) - 6 * per(x, 7, 0.4)) / PIX) * PIX;
    box(g, x, hy, PIX, 64 - hy, '#8EA3C2');
    box(g, x, hy, PIX, 2, '#A8BAD6');
    if (per(x + 6, 3, 1.2) - per(x - 6, 3, 1.2) < 0) box(g, x, hy + 2, PIX, 4, '#9CB0CC');
  }
  // (the trees: clumps, a shade under, the body, lit tops)
  for (let i = 0; i < tw / 14; i++) {
    const x = i * 14 + hash(i * 3.7) * 8, r = 8 + hash(i * 7.1) * 7, y = 50 - r * 0.5;
    pixelBlob(g, x, y + 2, r, r * 0.7, '#5D7C84');
  }
  for (let i = 0; i < tw / 14; i++) {
    const x = i * 14 + hash(i * 3.7) * 8, r = 8 + hash(i * 7.1) * 7, y = 50 - r * 0.5;
    pixelBlob(g, x - 1, y - 1, r * 0.75, r * 0.5, '#6E8E90');
    pixelBlob(g, x - 3, y - r * 0.3, r * 0.4, r * 0.25, '#86A49E');
  }
  box(g, 0, 50, tw, 14, '#7E908E');
  hazeBands(g, 0, 10, tw, 54, SKY_PALE, 0.15, 0.7, 6);
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
  tiled(c, 'm2treeline', cam * 0.02, HZ - 52, 1024, 64, g => paintTreeLine(g, 1024));
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
          const name = lotName(n, r), nw = name.length * 5 + 8;
          held_(c, `m2sign:${name}`, x - nw / 2 - 5, y - 50 * s - 5, nw + 10, 22, g => sign(g, 5, 5, nw, 12, BLUE, name, WHITE, 5), true);
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
    const skin = H(['#E0B48A', '#8A5A3A', '#C68E62', '#F0C8A0'][(seed * 3) % 4]), shirt = H(['#B91C1C', '#F8FAFC', '#1E3A8A', '#CA8A04', '#166534'][seed % 5]);
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

const SKY_TW = 1400, SKY_TOP = 100, SKY_FOOT = 440;
/** The far stuff's ramp: shadow, shade, body, lit, highlight (all hazy blue-gray). */
const FAR = ['#61779E', '#7489B0', '#8A9FC4', '#A9BCDA', '#C6D5EC'];
const FAR_WIN = '#A3B7D8', FAR_GLINT = '#DCE6F4';

/** A tower block (local coords: the skyline strip's own, y in screen terms minus SKY_TOP). */
const tower = (g: Ctx, x: number, w: number, top: number, foot = SKY_FOOT - SKY_TOP, ramp = FAR) => {
  box(g, x, top, w, foot - top, ramp[2]);
  box(g, x, top, 2, foot - top, ramp[3]);
  box(g, x + w - Math.max(2, Math.round(w / 3 / 2) * 2), top, Math.max(2, Math.round(w / 3 / 2) * 2), foot - top, ramp[1]);
  checker(g, x + w - Math.max(2, Math.round(w / 3 / 2) * 2) - 2, top, 2, foot - top, ramp[1]);
  box(g, x, top, w, 2, ramp[4]);
  box(g, x + w - 1, top, 1, foot - top, ramp[0]);
  // (windows in rows, a glint caught here and there)
  for (let y = top + 6; y < foot - 4; y += 6) for (let wx = x + 4; wx < x + w - 4; wx += 4) {
    const hsh = hash(wx * 1.3 + y * 7.1);
    box(g, wx, y, 2, 2, hsh < 0.08 ? FAR_GLINT : hsh < 0.75 ? FAR_WIN : ramp[1]);
  }
};

const paintSkyline = (g: Ctx) => {
  const F = SKY_FOOT - SKY_TOP; // (the foot, local)
  const L = (y: number) => y - SKY_TOP;
  // A needle tower: three legs pinched at the waist, the saucer, the spire
  {
    const x = 90;
    g.fillStyle = FAR[1];
    g.beginPath(); g.moveTo(x - 16, F); g.lineTo(x - 3, L(240)); g.lineTo(x - 4, L(180)); g.lineTo(x + 4, L(180)); g.lineTo(x + 3, L(240)); g.lineTo(x + 16, F); g.lineTo(x + 10, F); g.lineTo(x, L(260)); g.lineTo(x - 10, F); g.closePath(); g.fill();
    box(g, x - 3, L(180), 2, 80, FAR[3]);
    box(g, x - 22, L(176), 44, 6, FAR[0]); box(g, x - 26, L(170), 52, 6, FAR[2]); box(g, x - 26, L(170), 52, 2, FAR[4]); box(g, x - 18, L(164), 36, 6, FAR[3]);
    for (let i = -22; i < 22; i += 4) box(g, x + i, L(172), 2, 2, FAR_WIN);
    box(g, x - 10, L(160), 20, 4, FAR[2]); box(g, x - 1, L(124), 2, 36, FAR[3]); box(g, x - 1, L(124), 1, 2, FAR_GLINT);
    box(g, x - 2, L(242), 4, 2, FAR[2]); // (the halo ring at its waist)
  }
  // Downtown: towers, a stepped one with a spire, one with a crown of arches
  tower(g, 160, 34, L(262)); tower(g, 198, 26, L(300));
  {
    const x = 232;
    tower(g, x, 44, L(230)); tower(g, x + 6, 32, L(190)); tower(g, x + 12, 20, L(156));
    box(g, x + 16, L(130), 12, 26, FAR[2]); box(g, x + 16, L(130), 2, 26, FAR[3]);
    box(g, x + 21, L(106), 2, 24, FAR[3]); box(g, x + 21, L(106), 1, 2, FAR_GLINT);
  }
  {
    const x = 290;
    tower(g, x, 30, L(204));
    for (let i = 0; i < 5; i++) {
      const w = 30 - i * 6, y = L(204) - (i + 1) * 7;
      g.fillStyle = FAR[i % 2 ? 2 : 3]; g.beginPath(); g.arc(x + 15, y + 7, w / 2, Math.PI, 0); g.fill();
      for (let k = 0; k < w - 4; k += 4) box(g, x + 15 - w / 2 + 3 + k, y + 4, 1, 2, FAR[1]);
    }
    box(g, x + 14, L(150), 2, 18, FAR[4]);
  }
  tower(g, 330, 38, L(250)); tower(g, 372, 22, L(286));
  // A big arch: stepped steel, lit down its left leg, thinner at the top
  {
    const cx = 480, hw = 76, top = L(236);
    for (let dx = -hw; dx <= hw; dx += PIX) {
      const u = dx / hw, yo = top + (F - top) * (Math.cosh(u * 1.6) - 1) / (Math.cosh(1.6) - 1);
      const th = 6 + 10 * Math.abs(u) * Math.abs(u);
      const ui = (dx + 1) / hw, yi = top + 6 + (F - top - 6) * (Math.cosh(ui * 1.7) - 1) / (Math.cosh(1.7) - 1);
      const yb = Math.min(F, Math.max(yo + th * 0.5, yi));
      box(g, cx + dx, yo, PIX, Math.max(2, yb - yo + (Math.abs(u) > 0.9 ? F - yb : 0)), u < -0.1 ? FAR[3] : u < 0.15 ? FAR[4] : FAR[1]);
      box(g, cx + dx, yo, PIX, 2, u < 0.2 ? FAR_GLINT : FAR[2]);
    }
  }
  // The torch held up: a star-shaped base, the pedestal, the robed figure, the arm, the gold flame
  {
    const x = 640, GR = ['#5E8C8A', '#6F9C98', '#86AEA8', '#A0C2BA', '#BCD6CE'].map(cl => mix(cl, FAR[2], 0.3));
    box(g, x - 30, L(422), 60, F - L(422), FAR[1]); box(g, x - 30, L(422), 60, 2, FAR[3]);
    box(g, x - 16, L(360), 32, 62, FAR[2]); box(g, x - 16, L(360), 3, 62, FAR[3]); box(g, x + 8, L(360), 8, 62, FAR[1]); box(g, x - 18, L(360), 36, 4, FAR[3]);
    for (let i = 0; i < 4; i++) box(g, x - 10 + i * 6, L(372), 2, 10, FAR[1]);
    g.fillStyle = GR[2]; g.beginPath(); g.moveTo(x - 12, L(360)); g.lineTo(x - 7, L(304)); g.lineTo(x + 7, L(304)); g.lineTo(x + 12, L(360)); g.closePath(); g.fill();
    box(g, x - 7, L(304), 4, 56, GR[3]); box(g, x + 4, L(306), 6, 54, GR[1]);
    for (let i = 0; i < 3; i++) box(g, x - 4 + i * 4, L(320), 1, 38, GR[1]); // (the robe's folds)
    box(g, x - 4, L(296), 8, 9, GR[2]); box(g, x - 4, L(296), 3, 9, GR[3]);
    for (let i = -2; i <= 2; i++) box(g, x + i * 3, L(292) - (2 - Math.abs(i)) * 2, 2, 4 + (2 - Math.abs(i)) * 2, GR[3]); // (the crown's spikes)
    box(g, x + 6, L(262), 4, 44, GR[2]); box(g, x + 6, L(262), 1, 44, GR[3]);
    box(g, x + 4, L(256), 8, 6, GR[1]); box(g, x + 4, L(256), 8, 2, GR[3]);
    box(g, x + 6, L(248), 4, 8, '#E8B400'); box(g, x + 7, L(244), 2, 6, '#FFD84A'); box(g, x + 7, L(246), 1, 3, '#FFF2A8');
    box(g, x - 12, L(330), 6, 10, GR[1]); // (the tablet)
  }
  // A capitol: wings with columns, a drum, the dome in stepped ribs, the lantern and the statue on top
  {
    const x = 790, CP = ['#7C8CAE', '#93A3C4', '#AEBCD8', '#C8D4EA', '#DFE7F4'];
    box(g, x - 84, L(398), 168, F - L(398), CP[2]); box(g, x - 84, L(398), 168, 2, CP[4]); box(g, x - 84, L(404), 168, 2, CP[1]);
    for (let i = -80; i < 80; i += 6) box(g, x + i, L(408), 2, F - L(408) - 4, i < 0 ? CP[3] : CP[1]);
    g.fillStyle = CP[3]; g.beginPath(); g.moveTo(x - 30, L(398)); g.lineTo(x, L(384)); g.lineTo(x + 30, L(398)); g.closePath(); g.fill();
    box(g, x - 28, L(360), 56, 24, CP[2]); box(g, x - 28, L(360), 56, 2, CP[4]);
    for (let i = -24; i < 24; i += 5) box(g, x + i, L(364), 2, 18, i < 0 ? CP[3] : CP[0]);
    const domeSteps = [CP[1], CP[2], CP[3], CP[4]];
    for (let i = 0; i < 4; i++) { g.fillStyle = domeSteps[i]; g.beginPath(); g.ellipse(x - i * 3, L(360), 26 - i * 6, 28 - i * 5, 0, Math.PI, 0); g.fill(); }
    for (let i = -20; i <= 20; i += 8) box(g, x + i, L(360) - Math.sqrt(1 - (i / 26) ** 2) * 26, 1, Math.sqrt(1 - (i / 26) ** 2) * 24, CP[1]);
    box(g, x - 4, L(340), 8, 10, CP[3]); box(g, x - 3, L(330), 6, 10, CP[2]); box(g, x - 1, L(320), 2, 10, CP[4]);
  }
  // More towers, one with an antenna, a slim one with a needle
  tower(g, 896, 30, L(232)); box(g, 910, L(196), 2, 36, FAR[3]);
  tower(g, 930, 46, L(284)); tower(g, 980, 26, L(214)); box(g, 992, L(176), 1, 38, FAR[4]);
  // The big fake mountain: two faces split down the ridge, the snow on top (painted on), a flag on the peak
  {
    const x0 = 1020, x1 = 1170, px = 1086, py = L(206);
    g.fillStyle = FAR[3]; g.beginPath(); g.moveTo(x0, F); g.lineTo(px - 18, L(270)); g.lineTo(px, py); g.lineTo(px + 6, L(300)); g.lineTo(px - 8, F); g.closePath(); g.fill();
    g.fillStyle = FAR[1]; g.beginPath(); g.moveTo(px - 8, F); g.lineTo(px + 6, L(300)); g.lineTo(px, py); g.lineTo(px + 22, L(256)); g.lineTo(x1, F); g.closePath(); g.fill();
    for (let i = 0; i < 6; i++) box(g, x0 + 20 + i * 18, L(360) + hash(i) * 50, 8, 2, i < 3 ? FAR[2] : FAR[0]); // (crags)
    g.fillStyle = '#E6EEF8'; g.beginPath(); g.moveTo(px - 18, L(250)); g.lineTo(px, py); g.lineTo(px + 18, L(246)); g.lineTo(px + 10, L(240)); g.lineTo(px + 4, L(250)); g.lineTo(px - 4, L(242)); g.lineTo(px - 10, L(254)); g.closePath(); g.fill();
    g.fillStyle = '#C2D0E6'; g.beginPath(); g.moveTo(px + 1, py + 2); g.lineTo(px + 18, L(246)); g.lineTo(px + 10, L(240)); g.lineTo(px + 4, L(250)); g.closePath(); g.fill();
    box(g, px, py - 14, 1, 14, FAR[0]); box(g, px + 1, py - 14, 7, 2, '#C86A72'); box(g, px + 1, py - 12, 7, 2, '#E8ECF4'); box(g, px + 1, py - 14, 3, 2, '#6A80B8');
  }
  // A roller coaster's lift hill: a lattice up, the drop down, the track along its top
  {
    const ax = 1150, ay = F, bx = 1206, by = L(250), cx = 1250;
    const drop = (t: number) => ({ x: bx + (cx - bx) * t, y: by + (F - by) * (t * t * (3 - 2 * t)) });
    for (let x = ax; x <= cx; x += 8) {
      const ty = x <= bx ? ay + (by - ay) * ((x - ax) / (bx - ax)) : drop((x - bx) / (cx - bx)).y;
      box(g, x, ty, 1, F - ty, FAR[1]);
      if (x + 8 <= cx) { g.strokeStyle = FAR[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(x, F); g.lineTo(x + 8, Math.max(ty, F - 40)); g.stroke(); }
    }
    g.strokeStyle = FAR[3]; g.lineWidth = 2; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by);
    for (let t = 0; t <= 1; t += 0.05) { const p = drop(t); g.lineTo(p.x, p.y); }
    g.stroke();
    g.strokeStyle = FAR[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(ax, ay - 1); g.lineTo(bx, by - 1); g.stroke();
  }
  // The Ferris wheel's legs and rim (the spokes and the cars go round, live)
  {
    const { x, y, r } = WHEEL;
    g.strokeStyle = FAR[1]; g.lineWidth = 3;
    g.beginPath(); g.moveTo(x - 30, F); g.lineTo(x, L(y)); g.lineTo(x + 30, F); g.stroke();
    g.strokeStyle = FAR[3]; g.lineWidth = 2; g.beginPath(); g.arc(x, L(y), r, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = FAR[1]; g.lineWidth = 1; g.beginPath(); g.arc(x, L(y), r - 4, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = FAR[4]; g.beginPath(); g.arc(x, L(y), r, Math.PI * 1.05, Math.PI * 1.45); g.stroke();
    box(g, x - 40, F - 4, 80, 4, FAR[1]);
  }
  tower(g, 1340, 32, L(276)); tower(g, 1366, 20, L(318));
  // (the air at their feet: they fade into the haze)
  hazeBands(g, 0, L(330), SKY_TW, F - L(330), SKY_PALE, 0, 0.78, 7);
  box(g, 0, F, SKY_TW, 20, mix(SKY_PALE, FAR[2], 0.2));
};

/** The Ferris wheel's middle (in the skyline strip's x, screen y) and its rim's radius. */
const WHEEL = { x: 1300, y: 352, r: 56 };

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
  tiled(c, 'm2skyline', cam * SKY_PAR, SKY_TOP, SKY_TW, SKY_FOOT - SKY_TOP + 20, paintSkyline);
  // (what goes round: the Ferris wheel, the coaster's train up the lift hill and over)
  const off = ((cam * SKY_PAR) % SKY_TW + SKY_TW) % SKY_TW;
  for (let base = -Math.round(off); base < W + SKY_TW; base += SKY_TW) {
    const wx = base + WHEEL.x;
    if (wx > -WHEEL.r - 10 && wx < W + WHEEL.r + 10) {
      const th = f * 0.004;
      c.strokeStyle = FAR[2]; c.lineWidth = 1; c.beginPath();
      for (let i = 0; i < 8; i++) { const a = th + (i / 8) * Math.PI; c.moveTo(wx + Math.cos(a) * WHEEL.r, WHEEL.y + Math.sin(a) * WHEEL.r); c.lineTo(wx - Math.cos(a) * WHEEL.r, WHEEL.y - Math.sin(a) * WHEEL.r); }
      c.stroke();
      box(c, wx - 3, WHEEL.y - 3, 6, 6, FAR[1]); box(c, wx - 3, WHEEL.y - 3, 3, 3, FAR[3]);
      const GON = ['#C86A72', '#E6EAF2', '#6A80B8'];
      for (let i = 0; i < 12; i++) {
        const a = th + (i / 12) * Math.PI * 2, gx = Math.round(wx + Math.cos(a) * WHEEL.r), gy = Math.round(WHEEL.y + Math.sin(a) * WHEEL.r);
        box(c, gx, gy, 1, 3, FAR[0]); box(c, gx - 3, gy + 3, 7, 5, GON[i % 3]); box(c, gx - 3, gy + 3, 7, 1, '#EEF2F8');
      }
    }
    // (the train: up the lift hill slow, down the drop fast, gone round the back, again)
    const cyc = (f % 900) / 900;
    let tx: number, ty: number;
    if (cyc < 0.7) { const u = cyc / 0.7; tx = 1150 + 56 * u; ty = SKY_FOOT + (250 - SKY_FOOT) * u; }
    else if (cyc < 0.8) { const u = (cyc - 0.7) / 0.1; tx = 1206 + 44 * u; ty = 250 + (SKY_FOOT - 250) * (u * u * (3 - 2 * u)); }
    else continue;
    const sx = base + tx;
    if (sx > -20 && sx < W + 20) for (let k = 0; k < 3; k++) box(c, Math.round(sx - k * 5 - 2), Math.round(ty - 4 + (cyc < 0.7 ? k * 3.4 : -k * 2)), 4, 3, k === 0 ? '#C04A56' : '#D86A74');
  }
  tiled(c, 'm2park', cam * PARK_PAR, PARK_TOP, PARK_TW, HT - PARK_TOP, paintPark);
};
