// The footage on the big screen (cheesy, stock, 1983), every shot at Ren & Stimpy gross-up level of detail (the kit:
// gross.ts): each its banded sky over stepped ground, its one disaster, and everything in it rendered to the pore (the
// clapboard house board by board, peeling, its shingles tab by tab and its chimney brick by brick; the volcano's strata,
// crags, the lava's crust plates over the glow, charred palms; the storm's hanging pouches, the barn's planks, the silo's
// rivets, the cow's hide hair by hair and her bloodshot eye; the mountain's crevices, the snowman's dirty snow and his
// scarf's fringe; the flood's murk, its scum and oil sheen, the car's rust and the face mashed on its glass; the pines'
// bark and needles, the stumps), and one person in each, hideous at his size (gross.ts: every pore, bloodshot eyes with
// quivering pupils, sweat, stubble, nose hair, cracked lips, each tooth; clothes wrinkled and stained). The stills are
// sprites (painted once); what moves is live over them. Then the 1983 film over the lot (graded faded sepia, a vignette,
// gate weave, grain, scratches and dust) and the tape's wear (scanlines, the fringe, the tracking band, the watermark).
// Which disaster, how far in: the show's beat and k (-1: the title card between them). Clipped to the screen's box.

import { type Ctx, INK, box, checker, mix, poly, hash, bandedGradient, pixelBlob, signText, words } from '../blvd/kit';
import { DISASTERS } from './show';
import { FIRE, ICE, showLook, disasterLook, rideLook } from './paint';
import { plain } from '../blvd/kit';
import { sprite, r6, speckle, streaks, crack, bricks, boards, shingles, puff, blades, grossPerson, pupils, type Gross } from './gross';

/** A cone/hill in steps: lit up its left flank, shaded down its right (x the peak, foot at y, half-width w, height h). */
const cone = (c: Ctx, x: number, foot: number, w: number, h: number, R: string[], cap = 0) => {
  poly(c, [[x - w - 2, foot], [x - cap - 1, foot - h - 2], [x + cap + 1, foot - h - 2], [x + w + 2, foot]], INK);
  poly(c, [[x - w, foot], [x - cap, foot - h], [x + cap, foot - h], [x + w, foot]], R[2]);
  poly(c, [[x - w, foot], [x - cap, foot - h], [x - cap * 0.3, foot - h], [x - w * 0.35, foot]], R[3]);
  poly(c, [[x - w * 0.82, foot], [x - cap, foot - h], [x - cap * 0.7, foot - h], [x - w * 0.6, foot]], R[4]);
  poly(c, [[x + w * 0.4, foot], [x + cap * 0.6, foot - h], [x + cap, foot - h], [x + w, foot]], R[1]);
};
/** A cone's surface roughed up: strata, crags lit on their upper left, specks (inside its outline). */
const rough = (c: Ctx, x: number, foot: number, w: number, h: number, cap: number, R: string[], seed: number) => {
  c.save(); c.beginPath(); c.moveTo(x - w, foot); c.lineTo(x - cap, foot - h); c.lineTo(x + cap, foot - h); c.lineTo(x + w, foot); c.closePath(); c.clip();
  for (let yy = foot - h + 6; yy < foot; yy += 7) for (let xx = x - w; xx < x + w; xx += 2) { const k = hash(xx * 0.13 + yy * 0.7 + seed); if (k > 0.45) box(c, xx, yy + (k > 0.8 ? 1 : 0), 2, 1, k > 0.75 ? R[4] : R[0]); }
  for (let i = 0; i < Math.ceil(w * h / 500); i++) {
    const px = x - w + hash(seed + i * 1.7) * w * 2, py = foot - hash(seed + i * 2.9) * h, s = 2 + Math.floor(hash(seed + i) * 5);
    poly(c, [[px, py], [px + s, py - s], [px + s * 2, py]], R[1]); box(c, px + s - 1, py - s, 2, 1, R[5]);
  }
  speckle(c, x - w, foot - h, w * 2, h, Math.ceil(w * h / 30), R[0], seed + 3);
  speckle(c, x - w, foot - h, w, h, Math.ceil(w * h / 80), R[5], seed + 7);
  c.restore();
};
/** A ground band: stepped strips going down, a dithered seam between each. */
const ground = (c: Ctx, x: number, y: number, w: number, h: number, R: string[]) => {
  const n = R.length;
  for (let i = 0; i < n; i++) box(c, x, y + (h * i) / n, w, h / n + 1, R[i]);
  for (let i = 1; i < n; i++) checker(c, x, y + (h * i) / n - 2, w, 2, R[i], 0, 2);
};
/** A rock or boulder, stepped. */
const rock = (c: Ctx, x: number, y: number, r: number, R: string[], seed: number) => {
  pixelBlob(c, x, y, r + 1, r * 0.7 + 1, INK); pixelBlob(c, x, y, r, r * 0.7, R[2]); pixelBlob(c, x - r * 0.3, y - r * 0.25, r * 0.55, r * 0.35, R[3]); box(c, x - r * 0.5, y - r * 0.5, 2, 1, R[5]);
  speckle(c, x - r, y - r * 0.6, r * 2, r * 1.2, Math.ceil(r), R[0], seed);
};
/** A person in the shot (a sprite), his pupils quivering live. */
const person = (c: Ctx, id: string, cx: number, foot: number, o: Gross, f: number) => {
  sprite(c, `fs-p-${id}`, cx - 32, foot - 96, 64, 98, g => grossPerson(g, cx, foot, o));
  pupils(c, cx, foot - 76, f, o.seed);
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

// ---------------------------------------------------------------------------------------------------------------
// The earthquake: a clapboard house rocking on its lawn, the road cracking open in front of it

const housePaint = (g: Ctx) => {
  // (the chimney behind the roof, brick by brick, its cap)
  box(g, 49, -177, 24, 50, INK); bricks(g, 50, -176, 22, 48, '#9A4A32', 71); box(g, 47, -180, 28, 5, INK); box(g, 48, -179, 26, 3, '#7A766E'); box(g, 48, -179, 26, 1, '#A8A49A');
  // (the walls: clapboard, peeling, nail heads; the corner boards; the foundation's brick)
  box(g, -94, -114, 188, 114, INK);
  boards(g, -92, -112, 184, 106, '#F2E6C4', 51, 6);
  box(g, -92, -112, 5, 106, '#FFF6DA'); box(g, -88, -112, 1, 106, '#C8B890'); box(g, 84, -112, 8, 106, '#BCA880'); box(g, 84, -112, 1, 106, '#E8DCB8');
  box(g, -95, -7, 190, 8, INK); bricks(g, -94, -6, 188, 6, '#8A4A3A', 61);
  // (the roof: shingle by shingle, the shade side darker, the fascia, the gutter sagging with rust and leaves)
  poly(g, [[-118, -110], [0, -186], [118, -110]], INK);
  g.save(); g.beginPath(); g.moveTo(-112, -112); g.lineTo(0, -182); g.lineTo(112, -112); g.closePath(); g.clip();
  shingles(g, -112, -184, 224, 74, '#C0392B', 81);
  poly(g, [[0, -182], [112, -112], [0, -112]], 'rgba(40, 8, 4, 0.38)');
  checker(g, -2, -182, 4, 70, 'rgba(40, 8, 4, 0.38)', 0, 1);
  g.restore();
  box(g, -116, -113, 232, 4, INK); box(g, -115, -112, 230, 2, '#E8E0CC');
  box(g, -114, -109, 228, 3, '#8A8A84'); box(g, -114, -109, 228, 1, '#B8B8B0'); speckle(g, -114, -109, 228, 3, 40, '#8A4A1A', 91); speckle(g, -114, -110, 228, 2, 14, '#5A6A2A', 93);
  box(g, 102, -106, 4, 100, INK); box(g, 103, -106, 2, 100, '#9A9A92'); speckle(g, 103, -106, 2, 100, 12, '#8A4A1A', 95);
  // (the windows: frames, shutters, the curtains in folds, a cracked pane, the sills, the stains under them)
  for (const wx of [-66, 26]) {
    boards(g, wx - 12, -88, 9, 44, '#3E6A3A', 101 + wx, 3, true); boards(g, wx + 43, -88, 9, 44, '#3E6A3A', 111 + wx, 3, true);
    box(g, wx - 3, -87, 46, 42, INK); box(g, wx - 2, -86, 44, 40, '#E8E0CC');
    box(g, wx, -84, 40, 36, '#5AB4E8'); box(g, wx, -84, 40, 6, '#A6DCF6'); box(g, wx, -78, 40, 4, '#86C8EE'); checker(g, wx, -80, 40, 2, '#A6DCF6', 0, 1);
    for (let k = 0; k < 4; k++) { box(g, wx + k * 3, -84, 2, 36, k % 2 ? '#E8A0A8' : '#F2C0C8'); box(g, wx + 38 - k * 3, -84, 2, 36, k % 2 ? '#E8A0A8' : '#F2C0C8'); }
    box(g, wx + 19, -84, 2, 36, '#F2E6C4'); box(g, wx, -67, 40, 2, '#F2E6C4');
    if (wx > 0) crack(g, wx + 24, -82, 14, 7, false, '#2A5A7A', '#FFFFFF');
    box(g, wx - 4, -46, 48, 4, INK); box(g, wx - 3, -45, 46, 2, '#FFF6DA'); speckle(g, wx - 3, -45, 46, 2, 10, '#9A8A6A', 121 + wx);
    streaks(g, wx, -42, 40, 30, 4, 'rgba(90, 70, 40, 0.3)', 131 + wx);
  }
  // (the door: panels beveled in steps, the brass knob, the kick plate scuffed, the number)
  box(g, -20, -58, 40, 58, INK); box(g, -18, -56, 36, 56, '#7A3A14'); boards(g, -16, -54, 32, 54, '#7A3A14', 141, 4, true);
  for (const [px, py] of [[-14, -50], [2, -50], [-14, -26], [2, -26]] as const) { box(g, px, py, 12, 20, '#5A2A0E'); box(g, px, py, 12, 1, '#3A1A06'); box(g, px, py + 19, 12, 1, '#9A5224'); box(g, px + 11, py, 1, 20, '#9A5224'); }
  box(g, 8, -30, 4, 4, INK); box(g, 9, -29, 2, 2, '#FDE68A'); box(g, -16, -6, 32, 6, '#8A8478'); speckle(g, -16, -6, 32, 6, 14, '#4A4438', 151);
  box(g, -4, -64, 8, 5, '#E8C25A'); box(g, -3, -63, 2, 3, INK); box(g, 1, -63, 2, 3, INK);
};
const quakeBg = (g: Ctx, x: number, y: number, w: number, h: number) => {
  const gy = y + h * 0.74, mx = x + w / 2;
  bandedGradient(g, x, y, w, gy - y, ['#5AA6E0', '#86C2EA', '#BEE0F2', '#E6F2EE'], 8);
  for (let i = 0; i < 5; i++) puff(g, x + 90 + i * 230, y + 52 + (i % 2) * 20, 22 + (i % 3) * 8, ['#9ABCD8', '#C8DCEC', '#E8F0F8', '#FFFFFF'], 300 + i);
  const HL = ['#2E5A2E', '#3E7238', '#548A44', '#6EA456', '#8EBE70', '#AED890'];
  for (let i = 0; i < 4; i++) { cone(g, x + 80 + i * 300, gy, 220, 46 + (i % 2) * 22, HL); rough(g, x + 80 + i * 300, gy, 220, 46 + (i % 2) * 22, 0, HL, 400 + i); }
  for (let j = 0; j < 70; j++) { const tx = x + hash(j * 2.3) * w, ty = gy - 3 - hash(j * 5.1) * 26; box(g, tx - 1, ty - 1, 5, 5, INK); box(g, tx, ty, 3, 3, '#24481F'); box(g, tx, ty, 1, 1, '#5A8A44'); }
  ground(g, x, gy, w, h - (gy - y), ['#6EA456', '#5A9248', '#4A7E3C', '#3E6C32']);
  blades(g, x, gy + 2, w, 12, ['#2E5A28', '#3E6C32', '#4A7E3C', '#6EA456', '#8EBE70'], 11);
  // (the road: asphalt, its aggregate speck by speck, tar seams, the curb, the faded line)
  const ry = gy + 14;
  box(g, x, ry - 3, w, 3, INK); box(g, x, ry - 3, w, 1, '#C8C4BC'); box(g, x, ry - 2, w, 2, '#9A9690');
  box(g, x, ry, w, 32, '#4A4646'); checker(g, x, ry, w, 32, '#3E3A3A', 0, 1);
  speckle(g, x, ry, w, 32, 700, '#6E6868', 21); speckle(g, x, ry, w, 32, 400, '#262222', 23);
  for (let k = 0; k < 9; k++) crack(g, x + 40 + k * 120 + hash(k) * 40, ry, 26, 31 + k, false, '#1E1A1A', 'rgba(140, 130, 120, 0.5)');
  for (let k = x + 10; k < x + w; k += 60) { box(g, k, ry + 30, 30, 2, '#C8A848'); speckle(g, k, ry + 30, 30, 2, 8, '#4A4646', k); }
  // (the picket fence either side: rails behind, each picket's grain, a nail, peeling, one gone)
  for (const [a, b] of [[x + 16, mx - 140], [mx + 140, x + w - 160]] as const) {
    for (const ry2 of [gy - 24, gy - 10]) { box(g, a, ry2 - 1, b - a, 5, INK); boards(g, a, ry2, b - a, 3, '#D8D2C2', ry2 + a, 3); }
    for (let px = a; px < b - 6; px += 14) {
      if (hash(px * 0.7) > 0.93) continue;
      poly(g, [[px - 1, gy - 28], [px + 4, gy - 35], [px + 9, gy - 28]], INK);
      box(g, px - 1, gy - 29, 10, 31, INK); boards(g, px, gy - 28, 8, 30, '#ECE8DC', px, 8, true); poly(g, [[px, gy - 28], [px + 4, gy - 33], [px + 8, gy - 28]], '#F8F6EE');
      box(g, px + 3, gy - 22, 1, 1, '#4A4440'); box(g, px + 3, gy - 8, 1, 1, '#4A4440');
    }
  }
  // (the mailbox: a dented tin box on a leaning post, rust, its flag up)
  const bx = x + w - 120;
  box(g, bx - 3, gy - 34, 7, 40, INK); boards(g, bx - 2, gy - 33, 5, 38, '#8A6A44', 171, 5, true);
  box(g, bx - 15, gy - 48, 32, 16, INK); box(g, bx - 14, gy - 47, 30, 14, '#8A9098'); box(g, bx - 14, gy - 47, 30, 3, '#C8CED6'); box(g, bx - 14, gy - 36, 30, 3, '#5A6068');
  pixelBlob(g, bx - 2, gy - 42, 4, 3, '#6A7078'); speckle(g, bx - 14, gy - 47, 30, 14, 26, '#8A4A1A', 181); box(g, bx + 16, gy - 54, 3, 14, '#C0392B'); box(g, bx + 16, gy - 54, 6, 4, '#C0392B');
};
const quake = (c: Ctx, x: number, y: number, w: number, h: number, f: number, k: number) => {
  const gy = y + h * 0.74, mx = x + w / 2;
  sprite(c, 'fs-quake-bg', x, y, w, h, g => quakeBg(g, x, y, w, h));
  // (the house: rocking on its foundation)
  const rk = k >= 0 && k < 150 ? Math.sin(f * 0.6) * 0.04 : 0;
  c.save(); c.translate(mx, gy); c.rotate(rk);
  sprite(c, 'fs-house', -120, -190, 240, 192, housePaint);
  c.restore();
  // (the dad on his lawn, arms up, screaming)
  person(c, 'dad', x + 190, gy + 12, { skin: '#E8B48C', hair: '#4A3A2A', seed: 11, shirt: '#F2EEE2', pants: '#4A5A7A', pose: 'up' }, f);
  // (the crack opening up the road, stepped: its dirt walls in layers, its lit lip crumbling, pebbles falling in)
  const open = k < 0 ? 0 : Math.min(1, k / 120);
  if (open > 0) {
    const top = (i: number) => gy + 18 + (i % 2 ? 10 : -4) * open, bot = (i: number) => gy + 24 + (i % 2 ? 16 : 6) * open;
    c.fillStyle = INK; c.beginPath(); c.moveTo(x + 40, gy + 18);
    for (let i = 1; i <= 10; i++) c.lineTo(x + 40 + i * 100, top(i));
    for (let i = 10; i >= 0; i--) c.lineTo(x + 40 + i * 100, bot(i));
    c.closePath(); c.fill();
    for (let i = 0; i < 10; i++) {
      const x0 = x + 40 + i * 100, x1 = x0 + 100;
      for (let s = 0; s < 100; s += 2) {
        const t = s / 100, ty = top(i) + (top(i + 1) - top(i)) * t, by2 = bot(i) + (bot(i + 1) - bot(i)) * t, hh = by2 - ty;
        if (hh < 2) continue;
        box(c, x0 + s, ty + 1, 2, Math.min(3, hh * 0.3), '#6A4A2A'); box(c, x0 + s, ty + 1 + Math.min(3, hh * 0.3), 2, Math.min(2, hh * 0.2), '#4A3018');
        if (hash(x0 + s) > 0.7) box(c, x0 + s, ty + 2, 1, 1, '#9A7A4A');
        box(c, x0 + s, ty - 1, 2, 1, '#C8B898');
      }
      void x1;
    }
    for (let i = 0; i < 10; i++) { const t = ((f * 2 + i * 13) % 30) / 30, px = x + 70 + i * 97; box(c, px, top(Math.round((px - x - 40) / 100)) + t * 14, 2, 2, i % 2 ? '#8A8478' : '#5A5450'); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The volcano

const VOLC = ['#1C1210', '#2E1E18', '#44302A', '#5E463A', '#7A5E4E', '#9A7A66'];
const LAVA: [number, number][] = [[-10, -150], [-30, -110], [-18, -80], [-60, -40], [-50, 0]];
const volcanoBg = (g: Ctx, x: number, y: number, w: number, h: number) => {
  const gy = y + h * 0.8, mx = x + w / 2;
  bandedGradient(g, x, y, w, gy - y, ['#2A0808', '#5A120C', '#8A2410', '#C84A16', '#E07A34'], 10);
  for (let i = 0; i < 7; i++) puff(g, x + 60 + i * 170, y + 26 + (i % 3) * 10, 30 + (i % 2) * 10, ['#1A0C0A', '#2E1612', '#46201A', '#6A3424'], 500 + i);
  cone(g, mx, gy, 270, 156, VOLC, 44); rough(g, mx, gy, 270, 156, 44, VOLC, 510);
  // (the lava down its flank: a crooked run, glowing, crusted over in dark plates, the glow through their cracks)
  for (const [w2, col] of [[18, INK], [16, FIRE[1]], [10, FIRE[3]], [4, FIRE[5]]] as const) {
    g.strokeStyle = col; g.lineWidth = w2; g.lineJoin = 'round'; g.beginPath(); LAVA.forEach(([lx, ly], i) => (i ? g.lineTo(mx + lx, gy + ly) : g.moveTo(mx + lx, gy + ly))); g.stroke();
  }
  for (let i = 0; i < LAVA.length - 1; i++) {
    const [ax, ay] = LAVA[i], [bx, by] = LAVA[i + 1];
    for (let t = 0; t < 1; t += 0.12) { const px = mx + ax + (bx - ax) * t + (hash(i + t) - 0.5) * 6, py = gy + ay + (by - ay) * t; box(g, px - 3, py - 2, 5 + hash(t * 9 + i) * 3, 3, '#2A1A16'); box(g, px - 3, py - 2, 3, 1, '#4A3A30'); }
  }
  box(g, mx - 44, gy - 160, 88, 6, FIRE[4]); box(g, mx - 30, gy - 162, 60, 3, FIRE[6]);
  ground(g, x, gy, w, h - (gy - y), ['#2A1C16', '#22160F', '#1A100A', '#120A06']);
  speckle(g, x, gy, w, h - (gy - y), 900, '#3A2A20', 521); speckle(g, x, gy, w, h - (gy - y), 300, '#0A0604', 523);
  for (let j = 0; j < 16; j++) rock(g, x + 30 + hash(j * 3.3) * (w - 60), gy + 6 + hash(j * 1.9) * (h - (gy - y) - 12), 4 + hash(j) * 9, VOLC, 530 + j);
  // (charred palms: trunks ring by ring, the fronds drooping, burnt to their tips)
  for (const [px, ph] of [[x + 120, 120], [x + 270, 96]] as const) {
    for (let i = 0; i < ph; i += 4) { const bx = px + Math.sin(i * 0.03) * 10; box(g, bx - 4, gy - i - 4, 9, 5, INK); box(g, bx - 3, gy - i - 3, 7, 3, i % 8 ? '#3A2A20' : '#2A1C14'); box(g, bx - 3, gy - i - 3, 2, 1, '#5A4434'); }
    const tx = px + Math.sin(ph * 0.03) * 10, ty = gy - ph;
    for (let k = 0; k < 7; k++) {
      const a = -Math.PI + (k / 6) * Math.PI, ex = tx + Math.cos(a) * 34, ey = ty + 18 + Math.abs(Math.cos(a)) * 6;
      g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + Math.cos(a) * 18, ty - 10, ex, ey); g.stroke();
      g.strokeStyle = '#3A3A1E'; g.lineWidth = 2; g.stroke();
      for (let s = 0; s < 6; s++) { const t = 0.3 + s * 0.12, fx = tx + (ex - tx) * t, fy = ty - 6 + (ey - ty) * t; box(g, fx, fy, 1, 4, s > 3 ? '#1A0C08' : '#4A4A24'); }
      box(g, ex - 1, ey - 1, 3, 3, FIRE[2]);
    }
  }
};
const bombPaint = (g: Ctx) => {
  g.fillStyle = INK; g.beginPath(); g.arc(0, 0, 9, 0, Math.PI * 2); g.fill();
  g.fillStyle = FIRE[2]; g.beginPath(); g.arc(0, 0, 7, 0, Math.PI * 2); g.fill();
  for (const [px, py, s] of [[-5, -5, 5], [1, -6, 4], [-6, 1, 4], [2, 1, 5], [-2, -1, 3]] as const) { box(g, px, py, s, s - 1, '#2A1A16'); box(g, px, py, s - 1, 1, '#4A3A30'); }
  box(g, -4, -4, 3, 3, FIRE[5]); box(g, 3, 4, 2, 1, FIRE[4]);
};
const volcano = (c: Ctx, x: number, y: number, w: number, h: number, f: number) => {
  const gy = y + h * 0.8, mx = x + w / 2;
  sprite(c, 'fs-volcano-bg', x, y, w, h, g => volcanoBg(g, x, y, w, h));
  // (the smoke column off the top, in dense stepped balls)
  for (let i = 0; i < 7; i++) { const t = ((f * 0.5 + i * 30) % 210) / 210, a = 0.85 - t * 0.6; puff(c, mx + Math.sin(i * 1.7) * 20 + t * 60, y + 66 - t * 70, 20 + t * 40, [`rgba(30, 16, 14, ${a})`, `rgba(54, 30, 24, ${a})`, `rgba(84, 50, 38, ${a})`, `rgba(130, 70, 40, ${a * 0.8})`], i); }
  // (the lava glowing, pulsing through its crust; the crater flaring)
  for (let i = 0; i < 14; i++) { const t = ((i * 0.071 + f * 0.004) % 1), seg = Math.min(LAVA.length - 2, Math.floor(t * (LAVA.length - 1))), u = t * (LAVA.length - 1) - seg; const [ax, ay] = LAVA[seg], [bx, by] = LAVA[seg + 1]; box(c, mx + ax + (bx - ax) * u - 1, gy + ay + (by - ay) * u - 1, 2, 2, (f + i * 3) % 8 < 4 ? FIRE[6] : FIRE[5]); }
  box(c, mx - 30, gy - 162, 60, 3, f % 12 < 6 ? FIRE[6] : FIRE[5]);
  // (the bombs flying out of it, crusted, glowing through, their smoke trails)
  for (let i = 0; i < 8; i++) {
    const t = ((f * 2 + i * 37) % 120) / 120, bx = mx + Math.sin(i * 2.3) * 120 * t, by = gy - 160 - t * 90 + t * t * 140;
    for (let j = 1; j < 4; j++) { const tt = Math.max(0, t - j * 0.03), tx = mx + Math.sin(i * 2.3) * 120 * tt, ty = gy - 160 - tt * 90 + tt * tt * 140; pixelBlob(c, tx, ty, 5 - j, 4 - j, `rgba(40, 24, 20, ${0.6 - j * 0.15})`); }
    c.save(); c.translate(bx, by); c.rotate(f * 0.1 + i); sprite(c, 'fs-bomb', -10, -10, 20, 20, bombPaint); c.restore();
  }
  person(c, 'tourist', x + w - 170, y + h - 8, { skin: '#F0A888', hair: '#8A6A3A', seed: 23, shirt: '#2A9AB0', pants: '#C8B898', shoes: '#E8E0D0', pose: 'run', hawaiian: true, camera: true }, f);
};

// ---------------------------------------------------------------------------------------------------------------
// The tornado

const cowPaint = (g: Ctx) => {
  // (the hide hair by hair, the patches ragged, the udder, her legs, the hooves cracked)
  for (const lx of [-18, -6, 8, 18]) { box(g, lx - 1, 12, 6, 12, INK); box(g, lx, 12, 4, 10, '#F4F4F2'); box(g, lx, 12, 1, 10, '#FFFFFF'); box(g, lx, 20, 4, 3, '#2A2422'); box(g, lx + 1, 21, 1, 2, '#5A4A40'); }
  box(g, -23, -13, 46, 26, INK); box(g, -22, -12, 44, 24, '#F4F4F2'); box(g, -22, 6, 44, 6, '#C8C8C4'); checker(g, -22, 3, 44, 3, '#C8C8C4', 0, 1);
  for (let i = 0; i < 70; i++) box(g, -22 + Math.floor(hash(i * 1.3) * 44), -12 + Math.floor(hash(i * 2.7) * 24), 1, 2, hash(i) > 0.5 ? '#D8D8D4' : '#FFFFFF');
  for (const [px, py, pw, ph] of [[-10, -12, 14, 10], [8, 0, 10, 8], [-20, 2, 6, 6]] as const) { pixelBlob(g, px + pw / 2, py + ph / 2, pw / 2 + 1, ph / 2, '#1C1917'); speckle(g, px, py, pw, ph, 8, '#3A3634', px * 3 + py); }
  box(g, -6, 12, 12, 5, INK); box(g, -5, 12, 10, 4, '#F2A0B0'); box(g, -5, 12, 10, 1, '#F8C8D0'); for (const tx of [-4, -1, 2, 4]) box(g, tx, 16, 1, 3, '#E08090');
  box(g, -27, -10, 5, 12, INK); box(g, -26, -8, 3, 10, '#C8C8C4'); box(g, -27, 2, 4, 4, '#3A3634');
  // (the head: the bulging bloodshot eye, the wet nostrils dripping snot, the tongue lolling, a horn cracked)
  box(g, 19, -17, 18, 18, INK); box(g, 20, -16, 16, 16, '#F4F4F2'); box(g, 20, -16, 16, 2, '#FFFFFF'); speckle(g, 20, -16, 16, 16, 14, '#D8D8D4', 61);
  box(g, 22, -14, 7, 6, INK); box(g, 23, -13, 5, 4, '#F2EEDC'); box(g, 23, -13, 1, 1, '#C8282A'); box(g, 27, -11, 1, 1, '#C8282A'); box(g, 24, -10, 2, 1, '#D8484A'); box(g, 25, -12, 2, 2, INK);
  box(g, 29, -8, 8, 7, INK); box(g, 30, -7, 6, 5, '#F2A0B0'); box(g, 31, -6, 1, 2, '#7A3A44'); box(g, 34, -6, 1, 2, '#7A3A44'); box(g, 32, -2, 1, 4, 'rgba(200, 230, 200, 0.8)');
  box(g, 31, -1, 4, 5, INK); box(g, 32, -1, 2, 4, '#D8607A');
  box(g, 21, -21, 3, 5, INK); box(g, 22, -21, 1, 4, '#E8D8A8'); box(g, 32, -21, 3, 5, INK); box(g, 33, -21, 1, 4, '#E8D8A8'); box(g, 33, -19, 1, 1, INK);
};
const boardPaint = (g: Ctx) => { box(g, -7, -2, 14, 4, INK); box(g, -6, -1, 12, 2, '#7A5A3A'); box(g, -6, -1, 12, 1, '#9A7A54'); box(g, -3, 0, 4, 1, '#5A3A22'); box(g, 3, -1, 1, 1, '#C8C8C4'); };
const tornadoBg = (g: Ctx, x: number, y: number, w: number, h: number) => {
  const gy = y + h * 0.78;
  bandedGradient(g, x, y, w, gy - y, ['#2A3240', '#3E4858', '#58637A', '#7A8498', '#A0A890'], 10);
  // (the storm's underside: hanging pouches, row on row, each stepped)
  for (let row = 0; row < 3; row++) for (let i = 0; i < 16; i++) { const px = x + i * 72 + (row % 2) * 36, py = y + 8 + row * 18; puff(g, px, py, 16 - row * 2, ['#1E242E', '#2E3644', '#46505E', '#626E80'], 600 + row * 20 + i); }
  ground(g, x, gy, w, h - (gy - y), ['#8A9A3A', '#6E8030', '#566828', '#405020']);
  // (the wheat, stalk by stalk, its heads)
  for (let i = 0; i < 900; i++) { const sx = x + hash(i * 1.13) * w, sy = gy + 4 + hash(i * 2.31) * (h - (gy - y) - 4), sl = 3 + hash(i) * 5; box(g, sx, sy - sl, 1, sl, hash(i * 7) > 0.5 ? '#C8B060' : '#A89040'); box(g, sx, sy - sl - 2, 1, 2, '#E8D080'); }
  // (the barn far off: planks, peeling red, the X-braced doors, the hayloft; the roof's rusted corrugation; the silo's rivets)
  const bx = x + 80;
  box(g, bx, gy - 70, 90, 70, INK); boards(g, bx + 2, gy - 68, 86, 68, '#9A2A1E', 701, 4, true);
  box(g, bx + 28, gy - 44, 34, 44, INK); box(g, bx + 29, gy - 43, 32, 43, '#7A2016');
  g.strokeStyle = '#E8E0D0'; g.lineWidth = 2; g.beginPath(); g.moveTo(bx + 30, gy - 42); g.lineTo(bx + 60, gy - 1); g.moveTo(bx + 60, gy - 42); g.lineTo(bx + 30, gy - 1); g.stroke(); g.strokeRect(bx + 30, gy - 42, 30, 41);
  box(g, bx + 38, gy - 62, 14, 12, INK); box(g, bx + 39, gy - 61, 12, 10, '#2A0A06'); speckle(g, bx + 39, gy - 55, 12, 4, 10, '#C8B060', 711);
  poly(g, [[bx - 6, gy - 66], [bx + 45, gy - 100], [bx + 96, gy - 66]], INK); poly(g, [[bx - 2, gy - 68], [bx + 45, gy - 97], [bx + 92, gy - 68]], '#5A1A12');
  for (let k = 0; k < 30; k++) { const t = k / 30; box(g, bx + t * 94 - 2, gy - 68 - Math.min(t, 1 - t) * 58, 1, 4, '#3A120C'); }
  speckle(g, bx - 2, gy - 97, 94, 30, 60, '#8A4A1A', 721);
  const sx = bx + 104;
  box(g, sx - 1, gy - 92, 30, 92, INK);
  for (let i = 0; i < 28; i++) box(g, sx + i, gy - 91, 1, 91, ['#9AA0A8', '#B8BEC6', '#C8CED6', '#B8BEC6', '#9AA0A8', '#7A8088', '#5A6068'][Math.floor(i / 4)]);
  for (let yy = gy - 86; yy < gy; yy += 10) { box(g, sx, yy, 28, 1, '#6A7078'); for (let k = 2; k < 28; k += 5) box(g, sx + k, yy + 2, 1, 1, '#E8ECF0'); }
  streaks(g, sx, gy - 90, 28, 80, 5, 'rgba(138, 74, 26, 0.35)', 731);
  pixelBlob(g, sx + 14, gy - 92, 15, 8, INK); pixelBlob(g, sx + 14, gy - 92, 14, 7, '#A8AEB6'); pixelBlob(g, sx + 10, gy - 95, 6, 3, '#D8DEE6');
  // (the fence: posts in their grain, the barbed wire sagging between, barbs)
  for (let px2 = x + 20; px2 < x + w; px2 += 40) { box(g, px2 - 1, gy - 14, 5, 17, INK); boards(g, px2, gy - 13, 3, 15, '#7A6A54', px2, 3, true); }
  for (const wy of [gy - 12, gy - 6]) { for (let px2 = x + 20; px2 < x + w; px2 += 2) { const s = Math.sin(((px2 - x - 20) % 40) / 40 * Math.PI) * 2; box(g, px2, wy + s, 2, 1, '#5A5450'); } for (let px2 = x + 30; px2 < x + w; px2 += 10) { box(g, px2, wy - 1, 1, 3, '#7A746E'); } }
};
const tornado = (c: Ctx, x: number, y: number, w: number, h: number, f: number) => {
  const gy = y + h * 0.78;
  sprite(c, 'fs-tornado-bg', x, y, w, h, g => tornadoBg(g, x, y, w, h));
  // (the funnel: stepped rings wobbling down to a point, striated, dirt whipping round it, lit on the left)
  const tx = x + w / 2 + Math.sin(f * 0.02) * 260;
  for (let i = 0; i < 11; i++) {
    const cy = y + 22 + i * 21, rw = 120 - i * 10, wob = Math.sin(f * 0.2 + i) * 7;
    c.fillStyle = INK; c.beginPath(); c.ellipse(tx + wob, cy, rw + 2, 13, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = i % 2 ? '#5A6474' : '#6E788A'; c.beginPath(); c.ellipse(tx + wob, cy, rw, 11, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#9AA4B4'; c.beginPath(); c.ellipse(tx + wob - rw * 0.4, cy - 2, rw * 0.4, 6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#46505E'; c.beginPath(); c.ellipse(tx + wob + rw * 0.45, cy + 2, rw * 0.4, 6, 0, 0, Math.PI * 2); c.fill();
    for (let j = 0; j < 8; j++) { const a = f * 0.3 + j * 0.8 + i, px = tx + wob + Math.cos(a) * rw * 0.9; box(c, px, cy + Math.sin(a) * 9, Math.sin(a) > 0 ? 3 : 2, 1, j % 2 ? '#3A4250' : '#B8C0CC'); }
    for (let j = 0; j < 4; j++) { const a = -f * 0.25 + j * 1.6 + i * 0.5; box(c, tx + wob + Math.cos(a) * rw, cy + Math.sin(a) * 10, 2, 2, j % 2 ? '#5A4A3A' : '#7A6A54'); }
  }
  for (let i = 0; i < 5; i++) { const px = tx + Math.sin(f * 0.1 + i * 1.3) * 50; pixelBlob(c, px, gy - 6 - i * 3, 32, 11, 'rgba(90, 76, 58, 0.8)'); pixelBlob(c, px - 8, gy - 9 - i * 3, 20, 7, 'rgba(140, 122, 96, 0.7)'); speckle(c, px - 30, gy - 16 - i * 3, 60, 14, 10, '#4A3A2A', i + (f >> 2)); }
  // (the cow, round and round it; the boards and a shingle, tumbling)
  const a = f * 0.12, cx = tx + Math.cos(a) * 130, cy = y + 100 + Math.sin(a) * 34;
  c.save(); c.translate(cx, cy); sprite(c, 'fs-cow', -30, -24, 70, 50, cowPaint); c.restore();
  for (let i = 0; i < 6; i++) { const b = a * 1.4 + i; c.save(); c.translate(tx + Math.cos(b) * (80 + i * 14) + 6, y + 60 + i * 22 + Math.sin(b) * 20 + 1); c.rotate(b * 2); sprite(c, 'fs-board', -8, -3, 16, 6, boardPaint); c.restore(); }
  person(c, 'farmer', x + w - 140, gy + 40, { skin: '#D89A70', hair: '#9A9A9A', seed: 37, shirt: '#C8C0B0', pants: '#3A5A8A', pose: 'clutch', overalls: true, hat: 'straw' }, f);
};

// ---------------------------------------------------------------------------------------------------------------
// The blizzard

const MTN = ['#3A4658', '#56647A', '#7A889E', ICE[3], ICE[5], '#FFFFFF'];
const blizzardBg = (g: Ctx, x: number, y: number, w: number, h: number) => {
  const gy = y + h * 0.76;
  bandedGradient(g, x, y, w, gy - y, ['#7A8CA6', '#9CAEC4', '#C4D2E0', '#E2EAF2'], 8);
  for (let i = 0; i < 6; i++) puff(g, x + 60 + i * 200, y + 30 + (i % 2) * 14, 28, ['#8A9AB2', '#A8B6C8', '#C8D2DE', '#E2E8F0'], 800 + i);
  const px = x + 330;
  cone(g, px, gy, 250, 190, MTN, 12); rough(g, px, gy, 250, 190, 12, MTN, 810);
  for (let k = 0; k < 12; k++) crack(g, px - 200 + k * 34, gy - 20 - hash(k) * 120, 18 + hash(k * 3) * 20, 820 + k, false, '#26303E', 'rgba(255,255,255,0.5)');
  poly(g, [[px - 14, gy - 188], [px + 14, gy - 188], [px + 90, gy - 120], [px + 40, gy - 130], [px, gy - 110], [px - 50, gy - 128], [px - 100, gy - 116]], ICE[5]);
  poly(g, [[px + 14, gy - 188], [px + 90, gy - 120], [px + 40, gy - 130]], ICE[3]);
  g.strokeStyle = '#FFFFFF'; g.lineWidth = 1; g.beginPath(); g.moveTo(px - 100, gy - 116); g.lineTo(px - 50, gy - 128); g.lineTo(px, gy - 110); g.lineTo(px + 40, gy - 130); g.stroke();
  speckle(g, px - 90, gy - 186, 170, 70, 80, ICE[3], 830);
  cone(g, x + 760, gy, 200, 120, MTN, 8); rough(g, x + 760, gy, 200, 120, 8, MTN, 840);
  // (snow-laden pines between them)
  for (const [tx, s] of [[x + 540, 1], [x + 585, 0.8], [x + 625, 1.1]] as const) {
    box(g, tx - 2, gy - 8 * s, 4, 10 * s, '#3A2A1A');
    for (let t = 0; t < 4; t++) { const ty = gy - 6 * s - t * 10 * s, tw = (16 - t * 3) * s; poly(g, [[tx - tw - 1, ty + 1], [tx, ty - 15 * s - 1], [tx + tw + 1, ty + 1]], INK); poly(g, [[tx - tw, ty], [tx, ty - 15 * s], [tx + tw, ty]], t % 2 ? '#1E3A2A' : '#24442E'); poly(g, [[tx - tw, ty], [tx, ty - 15 * s], [tx - tw * 0.2, ty - 3]], '#F4FBFF'); speckle(g, tx - tw, ty - 6, tw * 2, 6, 6, '#FFFFFF', tx + t); }
  }
  ground(g, x, gy, w, h - (gy - y), [ICE[5], ICE[4], ICE[3], ICE[2]]);
  for (let i = 0; i < 26; i++) { const sx = x + hash(i * 3.1) * w, sy = gy + 6 + hash(i * 1.7) * (h - (gy - y) - 10); for (let k = 0; k < 18; k += 2) box(g, sx + k, sy + Math.round(Math.sin(k * 0.4) * 1.5), 2, 1, ICE[3]); }
  speckle(g, x, gy, w, h - (gy - y), 140, '#FFFFFF', 851);
  // (the sad snowman: lumpy, dirty, a yellow patch at his foot, coal eyes, a ridged carrot drooping, a stick arm, a frayed scarf)
  const sx = x + w - 220;
  for (const [cy, r] of [[gy - 30, 34], [gy - 84, 24], [gy - 120, 16]] as const) {
    g.fillStyle = INK; g.beginPath(); g.arc(sx, cy, r + 2, 0, Math.PI * 2); g.fill();
    g.fillStyle = ICE[3]; g.beginPath(); g.arc(sx, cy, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = ICE[4]; g.beginPath(); g.arc(sx - r * 0.15, cy - r * 0.15, r * 0.82, 0, Math.PI * 2); g.fill();
    g.fillStyle = ICE[5]; g.beginPath(); g.arc(sx - r * 0.3, cy - r * 0.3, r * 0.55, 0, Math.PI * 2); g.fill();
    speckle(g, sx - r, cy - r, r * 2, r * 2, r, '#8A949E', cy); speckle(g, sx - r, cy - r, r * 2, r * 2, r, '#FFFFFF', cy + 1);
    for (let k = 0; k < 6; k++) { const aa = k * 1.05 + r; pixelBlob(g, sx + Math.cos(aa) * r * 0.9, cy + Math.sin(aa) * r * 0.9, 3, 2, ICE[2]); }
  }
  pixelBlob(g, sx + 14, gy - 2, 10, 3, '#E8D860'); pixelBlob(g, sx + 12, gy - 2, 5, 2, '#C8B840');
  for (const ex of [sx - 7, sx + 3]) { box(g, ex, gy - 124, 4, 4, INK); box(g, ex, gy - 124, 1, 1, '#5A5A64'); }
  for (let i = 0; i < 5; i++) box(g, sx - 6 + i * 3, gy - 112 + Math.abs(i - 2), 2, 2, INK);
  poly(g, [[sx + 1, gy - 119], [sx + 1, gy - 115], [sx + 12, gy - 110]], '#E07A34'); for (let k = 0; k < 3; k++) box(g, sx + 3 + k * 3, gy - 117 + k, 1, 2, '#A84A14');
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(sx + 22, gy - 86); g.lineTo(sx + 50, gy - 60); g.moveTo(sx + 40, gy - 69); g.lineTo(sx + 46, gy - 78); g.stroke();
  g.strokeStyle = '#5A3A1A'; g.lineWidth = 2; g.stroke(); speckle(g, sx + 24, gy - 84, 24, 22, 8, '#8A6A3A', 861);
  box(g, sx - 18, gy - 106, 36, 7, INK); box(g, sx - 17, gy - 105, 34, 5, '#B91C1C'); for (let k = -16; k < 17; k += 3) box(g, sx + k, gy - 105, 1, 5, '#8A1414');
  box(g, sx + 8, gy - 100, 7, 18, INK); box(g, sx + 9, gy - 100, 5, 16, '#B91C1C'); for (let k = 0; k < 5; k++) box(g, sx + 9 + k, gy - 84, 1, 3 + (k % 2), '#D84A4A');
};
const blizzard = (c: Ctx, x: number, y: number, w: number, h: number, f: number) => {
  const gy = y + h * 0.76;
  sprite(c, 'fs-blizzard-bg', x, y, w, h, g => blizzardBg(g, x, y, w, h));
  person(c, 'hiker', x + 120, gy + 44, { skin: '#E0B8A8', hair: '#6A4A2A', seed: 53, shirt: '#2A6AB0', pants: '#4A4A54', pose: 'up', hat: 'beanie', frost: true }, f);
  // (an icicle of snot off his nose)
  box(c, x + 120, gy + 44 - 76 + 20, 1, 5, '#D4EAF6');
  // (the snow, slanting, in two sizes; a few big flakes, every arm of them)
  for (let i = 0; i < 70; i++) { const s = i % 3 ? 2 : 4; box(c, x + ((i * 97 + f * (2 + (i % 3))) % w), y + ((i * 53 + f * (3 + (i % 2))) % h), s, s, i % 4 ? '#FFFFFF' : ICE[4]); }
  for (let i = 0; i < 8; i++) {
    const fx = x + ((i * 151 + f * 1.5) % w), fy = y + ((i * 67 + f * 2) % h);
    box(c, fx - 3, fy, 7, 1, '#FFFFFF'); box(c, fx, fy - 3, 1, 7, '#FFFFFF'); box(c, fx - 2, fy - 2, 1, 1, ICE[4]); box(c, fx + 2, fy - 2, 1, 1, ICE[4]); box(c, fx - 2, fy + 2, 1, 1, ICE[4]); box(c, fx + 2, fy + 2, 1, 1, ICE[4]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The flood

const floodBg = (g: Ctx, x: number, y: number, w: number, h: number) => {
  const gy = y + h * 0.78;
  bandedGradient(g, x, y, w, h, ['#5A8ACC', '#86AEE0', '#B6D2F0', '#D8E6F2'], 8);
  for (let i = 0; i < 6; i++) puff(g, x + 80 + i * 190, y + 30 + (i % 2) * 16, 30, ['#4A5A6E', '#6A7A90', '#8E9EB2', '#B8C4D2'], 900 + i);
  // (the telephone poles, the wires sagging, birds on them)
  for (const px of [x + 420, x + 640, x + 980]) { box(g, px - 2, gy - 150, 5, 150, INK); boards(g, px - 1, gy - 149, 3, 149, '#5A4030', px, 3, true); box(g, px - 14, gy - 144, 29, 3, INK); box(g, px - 13, gy - 143, 27, 1, '#7A5A40'); }
  for (const [a, b] of [[x + 420, x + 640], [x + 640, x + 980]] as const) for (const o of [0, 5]) for (let px = a; px < b; px += 2) { const t = (px - a) / (b - a); box(g, px, gy - 143 + o + Math.sin(t * Math.PI) * (14 + o), 2, 1, '#2A2A30'); }
  for (let i = 0; i < 5; i++) { const bx = x + 470 + i * 31, by = gy - 143 + Math.sin(((bx - x - 420) / 220) * Math.PI) * 14 - 4; box(g, bx, by, 4, 3, '#1A1A20'); box(g, bx + 3, by - 1, 2, 2, '#1A1A20'); }
  // (the roof sticking out: shingles, a chimney, the antenna, the gutter clogged)
  poly(g, [[x + 120, gy - 40], [x + 200, gy - 100], [x + 280, gy - 40]], INK);
  g.save(); g.beginPath(); g.moveTo(x + 124, gy - 42); g.lineTo(x + 200, gy - 96); g.lineTo(x + 276, gy - 42); g.closePath(); g.clip();
  shingles(g, x + 124, gy - 98, 152, 58, '#8E2418', 911);
  poly(g, [[x + 200, gy - 96], [x + 276, gy - 42], [x + 200, gy - 42]], 'rgba(30, 6, 4, 0.4)');
  g.restore();
  box(g, x + 239, gy - 99, 18, 40, INK); bricks(g, x + 240, gy - 98, 16, 38, '#9A4A32', 921);
  box(g, x + 160, gy - 140, 2, 40, '#8A8A90'); for (let k = 0; k < 4; k++) box(g, x + 150 + k * 2, gy - 136 + k * 8, 22 - k * 4, 1, '#9A9AA2');
  // (the stop sign: bent, rusting, shot up, a sticker on it)
  const sx = x + 822;
  box(g, sx - 3, gy - 90, 6, 90, INK); box(g, sx - 2, gy - 90, 4, 90, '#7A7E86'); box(g, sx - 2, gy - 90, 1, 90, '#A8ACB4'); for (let yy = gy - 86; yy < gy; yy += 6) box(g, sx - 1, yy, 2, 2, INK);
  poly(g, [[sx - 15, gy - 111], [sx + 15, gy - 111], [sx + 25, gy - 101], [sx + 25, gy - 81], [sx + 15, gy - 71], [sx - 15, gy - 71], [sx - 25, gy - 81], [sx - 25, gy - 101]], INK);
  poly(g, [[sx - 14, gy - 110], [sx + 14, gy - 110], [sx + 24, gy - 100], [sx + 24, gy - 82], [sx + 14, gy - 72], [sx - 14, gy - 72], [sx - 24, gy - 82], [sx - 24, gy - 100]], '#F2F0EA');
  poly(g, [[sx - 13, gy - 108], [sx + 13, gy - 108], [sx + 22, gy - 99], [sx + 22, gy - 83], [sx + 13, gy - 74], [sx - 13, gy - 74], [sx - 22, gy - 83], [sx - 22, gy - 99]], '#C0392B');
  poly(g, [[sx - 13, gy - 108], [sx + 2, gy - 108], [sx - 22, gy - 90], [sx - 22, gy - 99]], '#D84A3A');
  streaks(g, sx - 20, gy - 100, 40, 26, 6, 'rgba(120, 50, 10, 0.4)', 931);
  for (const [hx, hy] of [[sx - 12, gy - 102], [sx + 10, gy - 80], [sx + 16, gy - 98]] as const) { box(g, hx - 1, hy - 1, 3, 3, '#E8E0D0'); box(g, hx, hy, 1, 1, INK); }
  box(g, sx + 4, gy - 79, 10, 5, '#F8E060'); box(g, sx + 5, gy - 78, 8, 1, '#3A3A3A');
  signText(g, 'STOP', sx, gy - 87, plain(1, 1, '#FFFFFF'));
};
const carPaint = (g: Ctx) => {
  const cy = 0;
  box(g, -1, cy - 27, 92, 28, INK); box(g, 0, cy - 26, 90, 26, '#C8302A'); box(g, 0, cy - 26, 90, 3, '#F06A55'); box(g, 0, cy - 6, 90, 6, '#7A1A16');
  speckle(g, 0, cy - 22, 90, 18, 50, '#8A1A14', 951); for (const [dx, dy] of [[20, -16], [60, -12]] as const) { pixelBlob(g, dx, cy + dy, 5, 3, '#9A2420'); box(g, dx - 3, cy + dy - 2, 4, 1, '#E86A55'); }
  streaks(g, 0, cy - 20, 90, 16, 6, 'rgba(110, 50, 14, 0.5)', 961);
  box(g, -2, cy - 12, 94, 4, INK); box(g, -1, cy - 11, 92, 2, '#C8CED6'); box(g, -1, cy - 11, 92, 1, '#FFFFFF');
  box(g, 17, cy - 47, 52, 22, INK); box(g, 18, cy - 46, 50, 21, '#C8302A'); box(g, 24, cy - 42, 38, 13, '#9ACCE8'); box(g, 24, cy - 42, 38, 3, '#D6EEF8'); box(g, 42, cy - 42, 2, 13, '#C8302A');
  // (a passenger's face mashed on the glass: the nose flattened, one bloodshot eye rolled, the breath fogging it)
  pixelBlob(g, 54, cy - 35, 7, 6, '#E8B48C'); pixelBlob(g, 53, cy - 36, 4, 3, '#F8D0B0'); box(g, 52, cy - 34, 5, 3, '#F0A0A0'); box(g, 53, cy - 33, 1, 1, INK); box(g, 55, cy - 33, 1, 1, INK);
  box(g, 49, cy - 39, 4, 3, '#F2EEDC'); box(g, 50, cy - 38, 1, 1, '#C8282A'); box(g, 51, cy - 39, 1, 1, INK); box(g, 57, cy - 39, 3, 2, '#F2EEDC'); box(g, 58, cy - 38, 1, 1, INK);
  box(g, 51, cy - 31, 6, 2, '#7A2A2A'); box(g, 52, cy - 31, 1, 1, '#F2E8C8'); box(g, 54, cy - 31, 1, 1, '#F2E8C8');
  checker(g, 46, cy - 34, 14, 6, 'rgba(240, 248, 255, 0.5)', 0, 1);
  crack(g, 28, cy - 42, 10, 971, false, '#2A5A7A', '#FFFFFF');
  for (const wx of [14, 70]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, cy, 10, 0, Math.PI * 2); g.fill(); g.fillStyle = '#2A2A2E'; g.beginPath(); g.arc(wx, cy, 9, 0, Math.PI * 2); g.fill(); g.fillStyle = '#B8BEC6'; g.beginPath(); g.arc(wx, cy, 5, 0, Math.PI * 2); g.fill(); box(g, wx - 2, cy - 4, 2, 2, '#FFFFFF'); }
};
const flood = (c: Ctx, x: number, y: number, w: number, h: number, f: number) => {
  const gy = y + h * 0.78;
  sprite(c, 'fs-flood-bg', x, y, w, h, g => floodBg(g, x, y, w, h));
  person(c, 'roof', x + 200, gy - 96, { skin: '#C88A60', hair: '#2A1A10', seed: 71, shirt: '#E8E0C8', pants: '#5A4A3A', pose: 'up' }, f);
  // (the water: murky in steps, banded down, its surface waving, the crests foamed, scum and debris riding it, an oil sheen)
  const lvl = gy - 40 - Math.sin(f * 0.03) * 16;
  const surf = (i: number) => lvl + Math.sin(f * 0.1 + i) * 8;
  c.fillStyle = '#4A6A70'; c.beginPath(); c.moveTo(x, y + h); for (let i = 0; i <= 22; i++) c.lineTo(x + i * (w / 22), surf(i)); c.lineTo(x + w, y + h); c.closePath(); c.fill();
  const MB = ['#3E5A5C', '#344C4C', '#2A3E3C', '#20302C'];
  for (let b = 0; b < 4; b++) { box(c, x, lvl + 18 + b * 26, w, 26, MB[b]); checker(c, x, lvl + 16 + b * 26, w, 2, MB[b], 0, 1); }
  for (let i = 0; i < 60; i++) { const px = x + ((i * 71 + f * (0.6 + (i % 3) * 0.3)) % w), py = lvl + 14 + ((i * 37) % (h - (lvl - y) - 14)); box(c, px, py, 2 + (i % 3), 1, i % 2 ? '#5A6A5A' : '#6A5A40'); }
  for (let i = 0; i < 22; i++) {
    const sx = x + i * (w / 22), sy = surf(i);
    box(c, sx, sy - 1, w / 22, 3, '#8AAAA8'); box(c, sx, sy - 1, w / 22, 1, '#DCE8E0'); checker(c, sx, sy + 2, w / 22, 3, '#8AAAA8', i & 1, 1);
    if (i % 3 === 0) { box(c, sx + 8, sy + 8, 14, 2, '#6A8A88'); box(c, sx + 10, sy + 12, 6, 1, '#E070C0'); box(c, sx + 16, sy + 12, 6, 1, '#70D0E0'); box(c, sx + 22, sy + 12, 4, 1, '#E0D070'); }
    if (i % 4 === 1) { box(c, sx + 4, sy - 2, 6, 3, '#5A4A2A'); box(c, sx + 5, sy - 2, 2, 1, '#8A7A4A'); }
  }
  // (a car, floating by: rusting, dented, someone's face mashed on its glass)
  const cx = x + ((f * 1.5) % (w + 200)) - 100, cy = lvl - 4;
  c.save(); c.translate(cx, cy); sprite(c, 'fs-car', -4, -50, 98, 62, carPaint); c.restore();
  box(c, cx - 4, cy, 98, 2, '#DCE8E0'); checker(c, cx - 8, cy + 2, 106, 2, '#8AAAA8', f & 1, 1);
};

// ---------------------------------------------------------------------------------------------------------------
// The wildfire

const pinePaint = (g: Ctx, tx: number, gy: number, seed: number) => {
  box(g, tx - 6, gy - 61, 12, 62, INK);
  for (let yy = gy - 60; yy < gy; yy++) { box(g, tx - 5, yy, 10, 1, '#1A100A'); if (hash(yy + seed) > 0.4) box(g, tx - 5 + Math.floor(hash(yy * 2 + seed) * 9), yy, 1, 2, '#2E1E14'); }
  for (let yy = gy - 58; yy < gy; yy += 3) box(g, tx + 3, yy, 1, 2, FIRE[1]);
  for (let t = 0; t < 4; t++) {
    const ty = gy - 50 - t * 30, tw = 44 - t * 9;
    poly(g, [[tx - tw - 1, ty + 1], [tx, ty - 47], [tx + tw + 1, ty + 1]], INK);
    poly(g, [[tx - tw, ty], [tx, ty - 46], [tx + tw, ty]], t % 2 ? '#0E1A0E' : '#142414');
    for (let k = 0; k < 40; k++) { const u = hash(seed + t * 50 + k), v = hash(seed * 2 + t * 30 + k), py = ty - v * 44, half = tw * (1 - (ty - py) / 46); const px = tx + (u * 2 - 1) * half; box(g, px, py, 1, 2, k % 3 ? '#1E321E' : '#0A120A'); }
    poly(g, [[tx + tw * 0.4, ty], [tx, ty - 46], [tx + tw, ty]], 'rgba(200, 74, 22, 0.25)');
    for (let k = 0; k < 6; k++) box(g, tx + tw - k * 6, ty - k * 5, 2, 1, FIRE[3]);
  }
};
const wildfireBg = (g: Ctx, x: number, y: number, w: number, h: number) => {
  const gy = y + h * 0.8;
  bandedGradient(g, x, y, w, gy - y, ['#140606', '#3A0E08', '#7A2410', '#C84A16', '#F08A30'], 10);
  for (let i = 0; i < 9; i++) puff(g, x + 40 + i * 130, y + 20 + (i % 3) * 12, 34, ['#0E0606', '#1E0E0A', '#3A1A10', '#5A2A14'], 1000 + i);
  ground(g, x, gy, w, h - (gy - y), ['#1C1410', '#140E0A', '#0E0806']);
  speckle(g, x, gy, w, h - (gy - y), 700, '#3A322C', 1011); speckle(g, x, gy, w, h - (gy - y), 120, FIRE[1], 1013);
  for (let i = 0; i < 9; i++) pinePaint(g, x + 60 + i * 120, gy, 1020 + i * 7);
  // (stumps, a fallen log: bark, its rings at the cut, glowing)
  for (const sx of [x + 120, x + 480, x + 830]) { box(g, sx - 7, gy + 10, 14, 12, INK); box(g, sx - 6, gy + 11, 12, 11, '#2A1C14'); box(g, sx - 6, gy + 11, 12, 2, '#4A3A2A'); box(g, sx - 3, gy + 11, 6, 1, FIRE[2]); }
  const lx = x + 560, ly = gy + 34;
  box(g, lx - 1, ly - 1, 122, 14, INK); for (let k = 0; k < 120; k += 2) box(g, lx + k, ly, 2, 12, hash(k) > 0.5 ? '#2A1C14' : '#1E140E'); box(g, lx, ly, 120, 1, '#4A3A2A'); for (let k = 0; k < 120; k += 9) box(g, lx + k, ly + 4, 3, 1, FIRE[1]);
  g.fillStyle = INK; g.beginPath(); g.ellipse(lx + 120, ly + 6, 5, 7, 0, 0, Math.PI * 2); g.fill(); for (const [r, col] of [[4, '#5A3A22'], [3, '#7A5232'], [2, '#5A3A22'], [1, FIRE[3]]] as const) { g.fillStyle = col; g.beginPath(); g.ellipse(lx + 120, ly + 6, r, r + 2, 0, 0, Math.PI * 2); g.fill(); }
};
const wildfire = (c: Ctx, x: number, y: number, w: number, h: number, f: number) => {
  const gy = y + h * 0.8;
  sprite(c, 'fs-wildfire-bg', x, y, w, h, g => wildfireBg(g, x, y, w, h));
  for (let i = 0; i < 9; i++) {
    const tx = x + 60 + i * 120;
    // (its flames: stepped tongues, the licks inside them, white-hot at the heart, sparks off the tips)
    const fh = 70 + ((f + i * 13) % 24);
    for (const [k, col] of [[1.05, FIRE[1]], [1, FIRE[2]], [0.82, FIRE[3]], [0.62, FIRE[4]], [0.42, FIRE[5]], [0.24, FIRE[6]]] as const) {
      c.fillStyle = col; c.beginPath(); c.moveTo(tx - 26 * k, gy - 110); c.quadraticCurveTo(tx + Math.sin(f * 0.3 + i) * 8 * k, gy - 110 - fh * k, tx + 26 * k, gy - 110); c.closePath(); c.fill();
    }
    for (const s of [-1, 1]) { const lh = 30 + ((f * 2 + i * 7 + s * 5) % 20), lx = tx + s * 18; for (const [k, col] of [[1, FIRE[2]], [0.6, FIRE[4]]] as const) { c.fillStyle = col; c.beginPath(); c.moveTo(lx - 8 * k, gy - 100 + s * 6); c.quadraticCurveTo(lx + Math.sin(f * 0.4 + i + s) * 5, gy - 100 + s * 6 - lh * k, lx + 8 * k, gy - 100 + s * 6); c.closePath(); c.fill(); } }
    for (let j = 0; j < 3; j++) { const t = ((f * 2 + j * 11 + i * 5) % 30) / 30; box(c, tx + Math.sin(i + j + t * 4) * 10, gy - 110 - fh - t * 30, 2, 2, t < 0.5 ? FIRE[6] : FIRE[4]); }
  }
  // (embers going up, the smoke rolling off)
  for (let i = 0; i < 26; i++) box(c, x + ((i * 83 + f * 0.7) % w), y + h - ((i * 47 + f * 2) % h), 2, 2, i % 2 ? FIRE[5] : FIRE[3]);
  for (let i = 0; i < 4; i++) { const t = ((f * 0.4 + i * 50) % 200) / 200; puff(c, x + 150 + i * 260 + t * 80, y + 60 - t * 40, 22 + t * 20, [`rgba(20, 10, 8, ${0.6 - t * 0.4})`, `rgba(40, 20, 14, ${0.6 - t * 0.4})`, `rgba(70, 34, 20, ${0.5 - t * 0.3})`, `rgba(110, 50, 24, ${0.4 - t * 0.3})`], i); }
  person(c, 'ranger', x + w - 110, y + h - 6, { skin: '#D8A07A', hair: '#3A2A1A', seed: 89, shirt: '#B8A060', pants: '#4A5A3A', pose: 'up', hat: 'ranger', soot: true }, f);
};

// ---------------------------------------------------------------------------------------------------------------

/** The film over the shot: faded to sepia, the blacks lifted, a vignette, grain, scratches, dust, a flicker. */
const film = (c: Ctx, x: number, y: number, w: number, h: number, f: number) => {
  c.fillStyle = 'rgba(122, 84, 40, 0.16)'; c.fillRect(x, y, w, h);
  c.fillStyle = 'rgba(255, 236, 200, 0.05)'; c.fillRect(x, y, w, h);
  for (const [d, a] of [[28, 0.12], [12, 0.12]] as const) { c.fillStyle = `rgba(30, 18, 8, ${a})`; c.fillRect(x, y, w, d); c.fillRect(x, y + h - d, w, d); c.fillRect(x, y, d, h); c.fillRect(x + w - d, y, d, h); }
  for (let i = 0; i < 220; i++) box(c, x + hash(i * 1.31 + f * 0.713) * w, y + hash(i * 2.17 + f * 0.391) * h, 1, 1, i % 2 ? 'rgba(20, 12, 6, 0.4)' : 'rgba(255, 240, 210, 0.3)');
  for (let i = 0; i < 3; i++) { const k = hash(Math.floor(f / 5) + i * 9.1); if (k > 0.35) box(c, x + hash(Math.floor(f / 5) * 1.7 + i) * w, y, 1, h, k > 0.8 ? 'rgba(20, 12, 6, 0.35)' : 'rgba(255, 245, 220, 0.35)'); }
  if (f % 53 < 4) { const hx = x + hash(Math.floor(f / 53)) * w, hy = y + hash(Math.floor(f / 53) + 3) * h; c.strokeStyle = 'rgba(20, 12, 6, 0.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx, hy); c.quadraticCurveTo(hx + 12, hy - 10, hx + 6, hy + 18); c.stroke(); }
  for (let i = 0; i < 4; i++) { const k = hash(Math.floor(f / 2) * 3.1 + i); if (k > 0.6) box(c, x + hash(f + i * 7) * w, y + hash(f * 1.3 + i) * h, 2, 2, 'rgba(20, 12, 6, 0.5)'); }
  if (f % 7 === 0) { c.fillStyle = 'rgba(255, 245, 225, 0.04)'; c.fillRect(x, y, w, h); }
};

/** The footage, in the screen's box (x, y, w, h), clipped. */
export const footage = (c: Ctx, x: number, y: number, w: number, h: number, beat: number, k: number, f: number) => {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  // (the gate weave: the frame wandering a pixel)
  c.save(); c.translate(Math.round(Math.sin(f * 0.31) * 1.2), Math.round(Math.sin(f * 0.17 + 1) * 1));
  if (k < 0) title(c, x, y, w, h, f);
  else if (beat === 0) quake(c, x, y, w, h, f, k);
  else if (beat === 1) volcano(c, x, y, w, h, f);
  else if (beat === 2) tornado(c, x, y, w, h, f);
  else if (beat === 3) blizzard(c, x, y, w, h, f);
  else if (beat === 4) flood(c, x, y, w, h, f);
  else wildfire(c, x, y, w, h, f);
  c.restore();
  if (k >= 0) film(c, x, y, w, h, f);
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
  void mix; void signText; void r6;
};
