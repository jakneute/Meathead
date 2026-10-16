// The footage on the big screen (cheesy, stock, 1983), at SNES grade: every shot a banded sky over stepped ground, its
// one disaster painted in ramps (lit from the upper left, inked), the tape's wear over the lot (the scanlines, the
// tracking band rolling down it, a color fringe, the watermark). Which disaster, how far in: the show's beat and k (-1:
// the title card between them). Drawn live (it moves) into the screen's box, clipped to it.

import { type Ctx, INK, box, checker, mix, poly, hash, bandedGradient, pixelBlob, signText, words } from '../blvd/kit';
import { DISASTERS } from './show';
import { FIRE, WATER, ICE, showLook, disasterLook, rideLook } from './paint';
import { plain } from '../blvd/kit';

/** A cone/hill in steps: lit up its left flank, shaded down its right (x the peak, foot at y, half-width w, height h). */
const cone = (c: Ctx, x: number, foot: number, w: number, h: number, R: string[], cap = 0) => {
  poly(c, [[x - w - 2, foot], [x - cap - 1, foot - h - 2], [x + cap + 1, foot - h - 2], [x + w + 2, foot]], INK);
  poly(c, [[x - w, foot], [x - cap, foot - h], [x + cap, foot - h], [x + w, foot]], R[2]);
  poly(c, [[x - w, foot], [x - cap, foot - h], [x - cap * 0.3, foot - h], [x - w * 0.35, foot]], R[3]);
  poly(c, [[x - w * 0.82, foot], [x - cap, foot - h], [x - cap * 0.7, foot - h], [x - w * 0.6, foot]], R[4]);
  poly(c, [[x + w * 0.4, foot], [x + cap * 0.6, foot - h], [x + cap, foot - h], [x + w, foot]], R[1]);
};
/** A ground band: stepped strips going down, a dithered seam between each. */
const ground = (c: Ctx, x: number, y: number, w: number, h: number, R: string[]) => {
  const n = R.length;
  for (let i = 0; i < n; i++) box(c, x, y + (h * i) / n, w, h / n + 1, R[i]);
  for (let i = 1; i < n; i++) checker(c, x, y + (h * i) / n - 2, w, 2, R[i], 0, 2);
};

const title = (c: Ctx, x: number, y: number, w: number, h: number, f: number) => {
  bandedGradient(c, x, y, w, h, ['#0E0A2A', '#1E1B4B', '#2E2470', '#1E1B4B'], 10);
  // (the starburst behind the logo, turning slowly)
  const mx = x + w / 2, my = y + h * 0.46;
  for (let k = 0; k < 16; k++) {
    if (k % 2) continue;
    const a = k * Math.PI / 8 + f * 0.004;
    poly(c, [[mx, my], [mx + Math.cos(a - 0.12) * w, my + Math.sin(a - 0.12) * w], [mx + Math.cos(a + 0.12) * w, my + Math.sin(a + 0.12) * w]], 'rgba(124, 58, 237, 0.22)');
  }
  words(c, 'DISASTER:', mx, y + h * 0.45, disasterLook(4, f % 40 < 30));
  words(c, 'THE RIDE', mx, y + h * 0.45 + 42, rideLook(3));
  words(c, 'PLEASE STAND BY', mx, y + h - 22, showLook(2, 2, '#A5B4FC', '#0E0A2A'));
};

const quake = (c: Ctx, x: number, y: number, w: number, h: number, f: number, k: number) => {
  const gy = y + h * 0.74, mx = x + w / 2;
  bandedGradient(c, x, y, w, gy - y, ['#5AA6E0', '#86C2EA', '#BEE0F2', '#E6F2EE'], 8);
  // (hills far off, a fence, the lawn)
  for (let i = 0; i < 4; i++) cone(c, x + 80 + i * 300, gy, 220, 46 + (i % 2) * 22, ['#2E5A2E', '#3E7238', '#548A44', '#6EA456', '#8EBE70']);
  ground(c, x, gy, w, h - (gy - y), ['#6EA456', '#5A9248', '#4A7E3C', '#3E6C32']);
  // (the house: rocking on its foundation, clapboard, its roof shingled, the windows)
  const rock = k >= 0 && k < 150 ? Math.sin(f * 0.6) * 0.04 : 0;
  c.save(); c.translate(mx, gy); c.rotate(rock);
  box(c, -94, -114, 188, 114, INK);
  for (let yy = -112; yy < 0; yy += 6) { box(c, -92, yy, 184, 6, '#F2E6C4'); box(c, -92, yy + 5, 184, 1, '#C8B890'); }
  box(c, -92, -112, 6, 112, '#FFF6DA'); box(c, 80, -112, 12, 112, '#BCA880');
  poly(c, [[-118, -110], [0, -186], [118, -110]], INK);
  poly(c, [[-112, -112], [0, -182], [0, -112]], '#C0392B'); poly(c, [[0, -182], [112, -112], [0, -112]], '#8E2418');
  for (let r = 0; r < 6; r++) box(c, -100 + r * 16, -124 - r * 10, 200 - r * 32, 1, '#6E1A10');
  for (const wx of [-66, 26]) { box(c, wx - 2, -86, 44, 40, INK); box(c, wx, -84, 40, 36, '#5AB4E8'); box(c, wx, -84, 40, 10, '#A6DCF6'); box(c, wx + 19, -84, 2, 36, '#F2E6C4'); box(c, wx, -67, 40, 2, '#F2E6C4'); }
  box(c, -18, -56, 36, 56, INK); box(c, -16, -54, 32, 54, '#7A3A14'); box(c, -16, -54, 4, 54, '#9A5224'); box(c, 8, -28, 3, 3, '#FDE68A');
  c.restore();
  // (the crack opening up the road in front of it, stepped, a lip of lit dirt)
  const open = k < 0 ? 0 : Math.min(1, k / 120);
  if (open > 0) {
    c.fillStyle = INK; c.beginPath(); c.moveTo(x + 40, gy + 18);
    for (let i = 1; i <= 10; i++) c.lineTo(x + 40 + i * 100, gy + 18 + (i % 2 ? 10 : -4) * open);
    for (let i = 10; i >= 0; i--) c.lineTo(x + 40 + i * 100, gy + 24 + (i % 2 ? 16 : 6) * open);
    c.closePath(); c.fill();
  }
};

const volcano = (c: Ctx, x: number, y: number, w: number, h: number, f: number) => {
  const gy = y + h * 0.8, mx = x + w / 2;
  bandedGradient(c, x, y, w, gy - y, ['#2A0808', '#5A120C', '#8A2410', '#C84A16', '#E07A34'], 10);
  // (the smoke column off the top, in stepped puffs)
  for (let i = 0; i < 7; i++) { const t = ((f * 0.5 + i * 30) % 210) / 210; pixelBlob(c, mx + Math.sin(i * 1.7) * 20 + t * 60, y + 66 - t * 70, 20 + t * 40, 12 + t * 20, `rgba(40, 22, 20, ${(0.8 - t * 0.6).toFixed(2)})`); }
  cone(c, mx, gy, 270, 156, ['#1C1210', '#2E1E18', '#44302A', '#5E463A', '#7A5E4E'], 44);
  // (the lava down its flank: a crooked run in steps, glowing)
  for (const [w2, col] of [[16, FIRE[1]], [10, FIRE[3]], [4, FIRE[5]]] as const) {
    c.strokeStyle = col; c.lineWidth = w2; c.beginPath(); c.moveTo(mx - 10, gy - 150); c.lineTo(mx - 30, gy - 110); c.lineTo(mx - 18, gy - 80); c.lineTo(mx - 60, gy - 40); c.lineTo(mx - 50, gy); c.stroke();
  }
  // (the crater's glow, the bombs flying out of it)
  box(c, mx - 44, gy - 160, 88, 6, FIRE[4]); box(c, mx - 30, gy - 162, 60, 3, FIRE[6]);
  for (let i = 0; i < 8; i++) {
    const t = ((f * 2 + i * 37) % 120) / 120, bx = mx + Math.sin(i * 2.3) * 120 * t, by = gy - 160 - t * 90 + t * t * 140;
    c.fillStyle = INK; c.beginPath(); c.arc(bx, by, 9, 0, Math.PI * 2); c.fill();
    c.fillStyle = FIRE[i % 2 ? 3 : 2]; c.beginPath(); c.arc(bx, by, 7, 0, Math.PI * 2); c.fill();
    box(c, bx - 4, by - 4, 3, 3, FIRE[5]);
  }
  ground(c, x, gy, w, h - (gy - y), ['#2A1C16', '#22160F', '#1A100A', '#120A06']);
};

const tornado = (c: Ctx, x: number, y: number, w: number, h: number, f: number) => {
  const gy = y + h * 0.78;
  bandedGradient(c, x, y, w, gy - y, ['#2A3240', '#3E4858', '#58637A', '#7A8498', '#A0A890'], 10);
  ground(c, x, gy, w, h - (gy - y), ['#8A9A3A', '#6E8030', '#566828', '#405020']);
  // (the fence posts and the barn far off)
  for (let px2 = x + 20; px2 < x + w; px2 += 40) { box(c, px2 - 1, gy - 14, 4, 16, INK); box(c, px2, gy - 13, 2, 14, '#7A6A54'); }
  box(c, x + 40, gy - 16, w - 80, 2, '#5A4C3C');
  box(c, x + 80, gy - 70, 90, 70, INK); box(c, x + 82, gy - 68, 86, 68, '#9A2A1E'); poly(c, [[x + 74, gy - 66], [x + 125, gy - 100], [x + 176, gy - 66]], '#5A1A12');
  // (the funnel: stepped ellipses wobbling down to a point, lit on the left, dust kicked up at its foot)
  const tx = x + w / 2 + Math.sin(f * 0.02) * 260;
  for (let i = 0; i < 11; i++) {
    const cy = y + 22 + i * 21, rw = 120 - i * 10, wob = Math.sin(f * 0.2 + i) * 7;
    c.fillStyle = INK; c.beginPath(); c.ellipse(tx + wob, cy, rw + 2, 13, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = i % 2 ? '#5A6474' : '#6E788A'; c.beginPath(); c.ellipse(tx + wob, cy, rw, 11, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#9AA4B4'; c.beginPath(); c.ellipse(tx + wob - rw * 0.4, cy - 2, rw * 0.4, 6, 0, 0, Math.PI * 2); c.fill();
  }
  for (let i = 0; i < 5; i++) pixelBlob(c, tx + Math.sin(f * 0.1 + i * 1.3) * 50, gy - 6 - i * 3, 30, 10, 'rgba(122, 106, 84, 0.8)');
  // (the cow, round and round it, stepped: white, black patches, pink nose)
  const a = f * 0.12, cx = tx + Math.cos(a) * 130, cy = y + 100 + Math.sin(a) * 34;
  box(c, cx - 23, cy - 13, 46, 26, INK); box(c, cx - 22, cy - 12, 44, 24, '#F4F4F2'); box(c, cx - 22, cy + 6, 44, 6, '#C8C8C4');
  box(c, cx - 10, cy - 12, 14, 10, '#1C1917'); box(c, cx + 8, cy, 10, 8, '#1C1917');
  box(c, cx + 19, cy - 17, 16, 16, INK); box(c, cx + 20, cy - 16, 14, 14, '#F4F4F2'); box(c, cx + 29, cy - 9, 5, 5, '#F2A0B0');
  for (const lx of [-18, -6, 8, 18]) { box(c, cx + lx - 1, cy + 12, 6, 11, INK); box(c, cx + lx, cy + 12, 4, 10, '#F4F4F2'); }
  // (debris: boards, a shingle, going round)
  for (let i = 0; i < 6; i++) { const b = a * 1.4 + i; box(c, tx + Math.cos(b) * (80 + i * 14), y + 60 + i * 22 + Math.sin(b) * 20, 12, 3, i % 2 ? '#7A5A3A' : '#5A4C3C'); }
};

const blizzard = (c: Ctx, x: number, y: number, w: number, h: number, f: number) => {
  const gy = y + h * 0.76;
  bandedGradient(c, x, y, w, gy - y, ['#7A8CA6', '#9CAEC4', '#C4D2E0', '#E2EAF2'], 8);
  // (the mountain: rock under snow, the snow line stepped, the shade on its right)
  cone(c, x + 330, gy, 250, 190, ['#3A4658', '#56647A', '#7A889E', ICE[3], ICE[5]], 12);
  poly(c, [[x + 330 - 14, gy - 188], [x + 330 + 14, gy - 188], [x + 330 + 90, gy - 120], [x + 330 + 40, gy - 130], [x + 330, gy - 110], [x + 330 - 50, gy - 128], [x + 330 - 100, gy - 116]], ICE[5]);
  poly(c, [[x + 330 + 14, gy - 188], [x + 330 + 90, gy - 120], [x + 330 + 40, gy - 130]], ICE[3]);
  cone(c, x + 760, gy, 200, 120, ['#3A4658', '#56647A', '#7A889E', ICE[3], ICE[5]], 8);
  ground(c, x, gy, w, h - (gy - y), [ICE[5], ICE[4], ICE[3], ICE[2]]);
  // (a sad snowman: three stepped balls, coal eyes, a stick arm drooping)
  const sx = x + w - 220;
  for (const [cy, r] of [[gy - 30, 34], [gy - 84, 24], [gy - 120, 16]] as const) {
    c.fillStyle = INK; c.beginPath(); c.arc(sx, cy, r + 2, 0, Math.PI * 2); c.fill();
    c.fillStyle = ICE[3]; c.beginPath(); c.arc(sx, cy, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = ICE[5]; c.beginPath(); c.arc(sx - r * 0.2, cy - r * 0.2, r * 0.75, 0, Math.PI * 2); c.fill();
  }
  box(c, sx - 7, gy - 124, 4, 4, INK); box(c, sx + 3, gy - 124, 4, 4, INK);
  for (let i = 0; i < 5; i++) box(c, sx - 6 + i * 3, gy - 112 + Math.abs(i - 2), 2, 2, INK);
  box(c, sx + 1, gy - 118, 8, 3, '#E07A34');
  c.strokeStyle = '#5A3A1A'; c.lineWidth = 3; c.beginPath(); c.moveTo(sx + 22, gy - 86); c.lineTo(sx + 50, gy - 60); c.stroke();
  // (the snow, slanting, in two sizes)
  for (let i = 0; i < 70; i++) { const s = i % 3 ? 2 : 4; box(c, x + ((i * 97 + f * (2 + (i % 3))) % w), y + ((i * 53 + f * (3 + (i % 2))) % h), s, s, i % 4 ? '#FFFFFF' : ICE[4]); }
};

const flood = (c: Ctx, x: number, y: number, w: number, h: number, f: number) => {
  const gy = y + h * 0.78;
  bandedGradient(c, x, y, w, h, ['#5A8ACC', '#86AEE0', '#B6D2F0', '#D8E6F2'], 8);
  // (a roof sticking out, a stop sign half under)
  poly(c, [[x + 120, gy - 40], [x + 200, gy - 100], [x + 280, gy - 40]], INK); poly(c, [[x + 124, gy - 42], [x + 200, gy - 96], [x + 200, gy - 42]], '#8E2418'); poly(c, [[x + 200, gy - 96], [x + 276, gy - 42], [x + 200, gy - 42]], '#5A1810');
  box(c, x + 820, gy - 90, 4, 90, '#7A7E86'); poly(c, [[x + 808, gy - 110], [x + 836, gy - 110], [x + 846, gy - 100], [x + 846, gy - 82], [x + 836, gy - 72], [x + 808, gy - 72], [x + 798, gy - 82], [x + 798, gy - 100]], '#C0392B');
  signText(c, 'STOP', x + 822, gy - 87, plain(1, 1, '#FFFFFF'));
  // (the water, in steps: banded down, its surface waving, crests lit)
  const lvl = gy - 40 - Math.sin(f * 0.03) * 16;
  const surf = (i: number) => lvl + Math.sin(f * 0.1 + i) * 8;
  c.fillStyle = WATER[3]; c.beginPath(); c.moveTo(x, y + h); for (let i = 0; i <= 22; i++) c.lineTo(x + i * (w / 22), surf(i)); c.lineTo(x + w, y + h); c.closePath(); c.fill();
  for (let b = 1; b < 4; b++) box(c, x, lvl + 18 + b * 26, w, 26, WATER[3 - b]);
  for (let i = 0; i < 22; i++) { const sx = x + i * (w / 22); box(c, sx, surf(i) - 1, w / 22, 3, WATER[5]); if (i % 3 === 0) box(c, sx + 8, surf(i) + 8, 14, 2, WATER[4]); }
  // (a car, floating by: red, stepped, its glass)
  const cx = x + ((f * 1.5) % (w + 200)) - 100, cy = lvl - 4;
  box(c, cx - 1, cy - 27, 92, 28, INK); box(c, cx, cy - 26, 90, 26, '#C8302A'); box(c, cx, cy - 26, 90, 3, '#F06A55'); box(c, cx, cy - 6, 90, 6, '#7A1A16');
  box(c, cx + 17, cy - 47, 52, 22, INK); box(c, cx + 18, cy - 46, 50, 21, '#C8302A'); box(c, cx + 24, cy - 42, 38, 13, '#9ACCE8'); box(c, cx + 24, cy - 42, 38, 3, '#D6EEF8'); box(c, cx + 42, cy - 42, 2, 13, '#C8302A');
};

const wildfire = (c: Ctx, x: number, y: number, w: number, h: number, f: number) => {
  const gy = y + h * 0.8;
  bandedGradient(c, x, y, w, gy - y, ['#140606', '#3A0E08', '#7A2410', '#C84A16', '#F08A30'], 10);
  ground(c, x, gy, w, h - (gy - y), ['#1C1410', '#140E0A', '#0E0806']);
  for (let i = 0; i < 9; i++) {
    const tx = x + 60 + i * 120, th = 150 + (i % 3) * 20;
    // (a pine: trunk, the tiers of its crown in steps, black against the glow)
    box(c, tx - 5, gy - 60, 10, 60, '#1A100A');
    for (let t = 0; t < 4; t++) { const ty = gy - 50 - t * 30, tw = 44 - t * 9; poly(c, [[tx - tw, ty], [tx, ty - 46], [tx + tw, ty]], t % 2 ? '#0E1A0E' : '#142414'); }
    void th;
    // (its flames: a stepped tongue each, flickering, white-hot inside)
    const fh = 70 + ((f + i * 13) % 24);
    for (const [k, col] of [[1, FIRE[2]], [0.7, FIRE[4]], [0.38, FIRE[6]]] as const) {
      c.fillStyle = col; c.beginPath(); c.moveTo(tx - 26 * k, gy - 110); c.quadraticCurveTo(tx + Math.sin(f * 0.3 + i) * 8, gy - 110 - fh * k, tx + 26 * k, gy - 110); c.closePath(); c.fill();
    }
  }
  // (embers going up)
  for (let i = 0; i < 26; i++) box(c, x + ((i * 83 + f * 0.7) % w), y + h - ((i * 47 + f * 2) % h), 2, 2, i % 2 ? FIRE[5] : FIRE[3]);
};

/** The footage, in the screen's box (x, y, w, h), clipped. */
export const footage = (c: Ctx, x: number, y: number, w: number, h: number, beat: number, k: number, f: number) => {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  if (k < 0) title(c, x, y, w, h, f);
  else if (beat === 0) quake(c, x, y, w, h, f, k);
  else if (beat === 1) volcano(c, x, y, w, h, f);
  else if (beat === 2) tornado(c, x, y, w, h, f);
  else if (beat === 3) blizzard(c, x, y, w, h, f);
  else if (beat === 4) flood(c, x, y, w, h, f);
  else wildfire(c, x, y, w, h, f);
  // (the tape: scanlines, a color fringe down its left, the tracking band rolling down, its noise, the watermark)
  c.fillStyle = 'rgba(0, 0, 0, 0.2)'; for (let sy = y; sy < y + h; sy += 4) c.fillRect(x, sy, w, 2);
  box(c, x, y, 3, h, 'rgba(255, 60, 90, 0.25)'); box(c, x + w - 3, y, 3, h, 'rgba(60, 200, 255, 0.2)');
  const ty = y + ((f * 3) % (h + 40)) - 20;
  box(c, x, ty, w, 4, 'rgba(255, 255, 255, 0.14)'); box(c, x, ty + 4, w, 2, 'rgba(0, 0, 0, 0.2)');
  for (let i = 0; i < 18; i++) box(c, x + hash(i * 7.3 + Math.floor(f / 3)) * w, ty + (i % 3), 6 + (i % 4) * 4, 1, 'rgba(255,255,255,0.3)');
  if (k >= 0) {
    words(c, `${DISASTERS[beat]}!`, x + 22, y + 32, showLook(2, 3, '#FDE047', '#000000'), 'left');
    words(c, 'STOCK FOOTAGE 1983', x + w - 16, y + h - 12, plain(1, 1, 'rgba(255,255,255,0.6)'), 'right');
  }
  c.restore();
  void mix;
};
