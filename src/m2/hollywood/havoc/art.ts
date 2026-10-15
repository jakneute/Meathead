// The havoc, drawn (the crude first pass: readable boxes and the park's letters). The sky gone red (the time of day's
// bands under it), ash and snow coming down together, lightning; the HAPPYWOOD hill far off erupting; the soundstages
// burning. Down here: the backlot's facade streets (plywood, the 2x4s and sandbags showing, on fire), the lava rivers,
// what comes down, the climb's buildings and scaffolds and the flood, the hill road in the snow with the HAPPYWOOD
// letters along its ridge, the shelters, the tornado. Spent (the revisit): gray sky, the lava crusted black, every
// facade down, the snow banked up, the ball hanging still, quiet.
//
// Standable reads standable: the ledges, roofs, the shelters' lids and the hill's snow get a lit top lip; what's
// scenery is drawn dimmer, no lip.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { box, steveFlier, happywoodHill, saidOver } from '../section';
import { HWX } from '../geometry';
import { drawTodSky, hourMix } from '../../timeOfDay';
import { hillside } from '../../hub/letters';
import { words, enamel, print, ledgeLip, sidewalk, facade, lamppost, guest, BACK, BACK_Y, inView } from '../blvd/paint';
import { outOf } from '../blvd/state';
import {
  x0, x1 as X1, X, Y, R, GY, RUNS, LAVA, LAVA_DOWN, LAVA_FLOOR, FALLS, LEDGES, BALL, BUILDINGS, SHAFTS, CLIMB, COVERS, ROOF,
  REFILL, HORNS, STEVES, WIND, DECOR, DOWNHILL, PUDDLES, AV_LEN, AV_H, AV_TELL, SLIDE_H, SLIDE_LEN,
} from './layout';
import { hvOf, type Hv } from './state';
import { spent, ballAt } from './hazards';
import { tornadoBase, funnelHalf, FUNNEL_H, FORM_T, coverRoof, isTorn, guestAt, GUEST_BASES } from './chase';

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;

// ---------------------------------------------------------------------------------------------------------------
// The sky and the far off (screen space)

export const drawHavocBackdrop = (c: Ctx, state: GameState) => {
  const W = 800, H = 600, cam = state.camera, f = state.frame, done = spent(state);
  const rx = R(cam.x + 400);
  // (up the climb, the horizon drops away under him)
  const hz = 430 + Math.max(0, -cam.y) * 0.14;
  drawTodSky(c, 0, 0, W, H, done ? ['#292524', '#57534E', '#78716C', '#A8A29E'] : ['#3B0A0A', '#7F1D1D', '#C2410C', '#FDBA74'], { horizon: Math.min(560, hz), sun: [620, 120], moon: [160, 90] });
  // (the storm's clouds rolling over, dark, lit red from under)
  if (!done) for (let k = 0; k < 7; k++) {
    const cx = ((k * 173 - f * (0.4 + k * 0.08) - cam.x * 0.05) % 1000 + 1000) % 1000 - 100, cy = 40 + (k % 3) * 46;
    c.fillStyle = 'rgba(28, 25, 23, 0.55)'; c.beginPath(); c.ellipse(cx, cy, 120, 26, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(194, 65, 12, 0.25)'; c.fillRect(cx - 100, cy + 18, 200, 4);
  }
  // (the HAPPYWOOD hill far off, before he's up on it: erupting, lava down its face, the plume)
  if (rx < 7400) {
    const hx = 560 - (cam.x - HWX) * 0.004;
    happywoodHill(c, hx, hz, hourMix('#7C2D12', '#7C2D12', '#3F2A14'));
    if (!done) {
      c.fillStyle = 'rgba(68, 64, 60, 0.7)';
      for (let k = 0; k < 6; k++) { const py = hz - 210 - k * 34 - (f * 0.4 % 34); c.beginPath(); c.ellipse(hx + Math.sin(k + f * 0.01) * 20, py, 30 + k * 12, 18 + k * 4, 0, 0, TAU); c.fill(); }
      c.strokeStyle = '#F97316'; c.lineWidth = 3; c.beginPath();
      for (const s of [-1, 1]) { c.moveTo(hx + s * 6, hz - 200); c.quadraticCurveTo(hx + s * 60, hz - 120, hx + s * 110, hz - 10); }
      c.stroke();
    } else { c.fillStyle = 'rgba(68, 64, 60, 0.35)'; c.beginPath(); c.ellipse(hx, hz - 250, 40, 60, 0, 0, TAU); c.fill(); }
  }
  // (soundstages, far off, burning: boxes with their numbers, fire on their roofs, smoke going up)
  const far = hourMix('#57534E', '#44403C', '#1C1917'), dark = hourMix('#44403C', '#292524', '#0C0A09');
  const off = -((cam.x * 0.22) % 230);
  for (let x = off - 230, k = 0; x < W + 230; x += 230, k++) {
    const n = k + Math.floor(cam.x * 0.22 / 230);
    const h = 80 + (((n * 37) % 4) + 4) % 4 * 22;
    box(c, x, hz - h, 200, h + 400, far); box(c, x, hz - h, 200, 6, dark);
    words(c, `STAGE ${((n % 40) + 40) % 40 + 1}`, x + 100, hz - h + 28, print(2, dark));
    if (!done && ((n % 3) + 3) % 3 === 0) {
      for (let j = 0; j < 4; j++) { const fx = x + 30 + j * 40, fh = 14 + ((f * 0.3 + j * 7 + n) % 12); c.fillStyle = j % 2 ? '#F97316' : '#FDE047'; c.beginPath(); c.moveTo(fx - 10, hz - h); c.lineTo(fx, hz - h - fh); c.lineTo(fx + 10, hz - h); c.fill(); }
      c.fillStyle = 'rgba(41, 37, 36, 0.5)'; for (let j = 0; j < 4; j++) { c.beginPath(); c.ellipse(x + 90 + j * 6, hz - h - 40 - j * 40 - (f * 0.5 % 40), 26 + j * 10, 16 + j * 3, 0, 0, TAU); c.fill(); }
    }
  }
  // (the weather: ash all over; snow on the hill and after; hail at the end. Spent: a little ash, drifting)
  const snow = rx > 8000, ash = rx < 9000 || rx > DOWNHILL.b + 200;
  // (the blizzard, down the hill: the snow thick and driving, the far off whited out)
  const bliz = !done && rx > DOWNHILL.a - 200 && rx < DOWNHILL.b + 200;
  const n = done ? 14 : 46;
  if (ash) { c.fillStyle = 'rgba(214, 211, 209, 0.75)'; for (let k = 0; k < n; k++) { const ax = ((k * 97 + f * (1 + k % 3) - cam.x * 0.3) % 820 + 820) % 820 - 10, ay = ((k * 151 + f * 1.2) % 620) - 10; c.fillRect(ax, ay, 2, 2); } }
  if (bliz) { c.fillStyle = 'rgba(226, 232, 240, 0.35)'; c.fillRect(0, 0, W, H); }
  if (snow && !done) {
    const m = bliz ? 130 : 60, drift = bliz ? 5 : 2;
    c.fillStyle = 'rgba(248, 250, 252, 0.9)';
    for (let k = 0; k < m; k++) { const sx = ((k * 131 + f * (drift + k % 3) - cam.x * 0.5) % 820 + 820) % 820 - 10, sy = ((k * 211 + f * (2 + k % 2)) % 620) - 10; c.fillRect(sx, sy, 3, 3); }
    if (bliz) { c.strokeStyle = 'rgba(248, 250, 252, 0.45)'; c.lineWidth = 1; c.beginPath(); for (let k = 0; k < 24; k++) { const sx = ((k * 173 + f * 9) % 860) - 30, sy = (k * 97 + f * 3) % 600; c.moveTo(sx, sy); c.lineTo(sx + 26, sy + 8); } c.stroke(); }
  }
  // (lightning, now and then: the sky lit, a bolt)
  if (!done) {
    const lt = f % 260, cyc = Math.floor(f / 260);
    if (lt < 6 && (cyc * 7) % 3 !== 0) {
      c.fillStyle = `rgba(255, 255, 255, ${lt < 2 ? 0.35 : 0.12})`; c.fillRect(0, 0, W, H);
      c.strokeStyle = '#F8FAFC'; c.lineWidth = 3; c.beginPath();
      let bx = 100 + ((cyc * 211) % 600), by = 0; c.moveTo(bx, by);
      while (by < hz - 60) { bx += ((by * 13 + cyc * 7) % 50) - 25; by += 40; c.lineTo(bx, by); }
      c.stroke();
    }
  }
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// Behind him (world space)

/** What's left of a facade the tornado took: the stumps of its 2x4s, a sandbag. */
const stump = (c: Ctx, x: number, w: number) => {
  for (let sx = x + 12, k = 0; sx < x + w - 6; sx += 48, k++) {
    const h = 14 + ((k * 37 + Math.floor(x)) % 4) * 9;
    box(c, sx, BACK_Y - h, 6, h, '#78350F'); box(c, sx - 1, BACK_Y - h - 3, 8, 4, '#A16207');
  }
  box(c, x + w / 2 - 14, BACK_Y - 10, 28, 10, '#A8A29E');
};

const flames = (c: Ctx, x: number, y: number, w: number, f: number, k = 1) => {
  for (let j = 0; j < Math.max(1, Math.floor(w / 26)); j++) {
    const fx = x + 13 + j * 26, fh = (16 + ((f * 0.35 + j * 9 + x) % 14)) * k;
    c.fillStyle = '#B91C1C'; c.beginPath(); c.moveTo(fx - 13, y); c.lineTo(fx - 2, y - fh); c.lineTo(fx + 13, y); c.fill();
    c.fillStyle = j % 2 ? '#F97316' : '#FB923C'; c.beginPath(); c.moveTo(fx - 9, y); c.lineTo(fx, y - fh * 0.75); c.lineTo(fx + 9, y); c.fill();
    c.fillStyle = '#FDE047'; c.beginPath(); c.moveTo(fx - 4, y); c.lineTo(fx + 1, y - fh * 0.4); c.lineTo(fx + 5, y); c.fill();
  }
};

/** A sign on two posts, standing on (x, feetY), its words in the park's letters. */
const standSign = (c: Ctx, x: number, feetY: number, lines: string[], board: string, ink: string) => {
  const L = enamel(10, ink, '#000'), w = 200, h = 22 + lines.length * 18, top = feetY - 100 - h;
  box(c, x - w / 2 + 14, top + h, 6, 100, '#57534E'); box(c, x + w / 2 - 20, top + h, 6, 100, '#57534E');
  box(c, x - w / 2 - 2, top - 2, w + 4, h + 4, '#000'); box(c, x - w / 2, top, w, h, board);
  lines.forEach((l, i) => words(c, l, x, top + 26 + i * 18, L));
};

/** The hill (its run of ground from the ridge down to its foot): rock and dirt, the road, the snow on its top (lit:
 *  standable), the lava trench cut across it. */
const hill = (c: Ctx, state: GameState, done: boolean) => {
  const a = X(DOWNHILL.a), b = X(DOWNHILL.b);
  if (!inView(state, a - 200, b + 200)) return;
  const hillRuns = RUNS.filter(r => r[0] >= DOWNHILL.a && r[1] <= DOWNHILL.b);
  c.fillStyle = '#44403C'; c.beginPath(); c.moveTo(a, GY + 400);
  for (const [ra, rb, h1, h2] of hillRuns) { c.lineTo(X(ra), Y(h1)); c.lineTo(X(rb), Y(h2)); }
  c.lineTo(b, GY + 400); c.closePath(); c.fill();
  // (strata in the rock)
  c.strokeStyle = '#57534E'; c.lineWidth = 3;
  for (const [ra, rb, h1, h2] of hillRuns) for (let d = 40; d < 400; d += 70) { c.beginPath(); c.moveTo(X(ra), Y(h1) + d); c.lineTo(X(rb), Y(h2) + d); c.stroke(); }
  // (the snow on it: a thick white top, its lit lip)
  for (const [ra, rb, h1, h2] of hillRuns) {
    c.fillStyle = '#E2E8F0'; c.beginPath(); c.moveTo(X(ra), Y(h1)); c.lineTo(X(rb), Y(h2)); c.lineTo(X(rb), Y(h2) + 12); c.lineTo(X(ra), Y(h1) + 12); c.closePath(); c.fill();
    c.strokeStyle = '#FFFFFF'; c.lineWidth = 3; c.beginPath(); c.moveTo(X(ra), Y(h1) + 1); c.lineTo(X(rb), Y(h2) + 1); c.stroke();
  }
  // (the flank under the ridge, over the climb)
  box(c, a - 4, Y(1500), 8, 1500, '#292524');
  // (the HAPPYWOOD sign along the ridge, behind him: the big letters on their scaffold legs; the second O and the W
  // gone down the hill)
  const L = hillside({ sx: 7, sy: 14 }, done ? '#D6D3D1' : '#F5F5F4', '#A8A29E');
  const word = 'HAPPYWOOD';
  for (let i = 0; i < word.length; i++) {
    if (i === 5 || i === 7) continue;
    const lx = X(8230 + i * 52), base = Y(1500) - 40 - (i % 2) * 6;
    box(c, lx - 14, base, 4, 40, '#57534E'); box(c, lx + 10, base, 4, 40, '#57534E');
    c.save(); c.translate(lx, base); c.rotate(((i * 7) % 5 - 2) * 0.03); words(c, word[i], 0, 0, L); c.restore();
  }
};

/** A lava river (its channel, the lava, its glow); crusted black, spent. */
const lavaRiver = (c: Ctx, state: GameState, l: typeof LAVA[number], done: boolean) => {
  const a = X(l.a), b = X(l.b), lo = Math.min(l.hl, l.hr), top = Y(Math.max(l.hl, l.hr)), f = state.frame;
  if (!inView(state, a, b)) return;
  box(c, a, Y(lo), b - a, LAVA_FLOOR + 400, '#1C1917');
  box(c, a, top, 10, LAVA_FLOOR + 40, '#292524'); box(c, b - 10, top, 10, LAVA_FLOOR + 40, '#292524');
  if (done) {
    const ct = Y((l.hl + l.hr) / 2);
    box(c, a, ct, b - a, Y(lo) + LAVA_FLOOR - ct, '#18181B'); box(c, a, ct, b - a, 3, '#57534E');
    c.strokeStyle = 'rgba(234, 88, 12, 0.5)'; c.lineWidth = 1; c.beginPath();
    for (let x = a + 12; x < b - 12; x += 34) { c.moveTo(x, ct + 6); c.lineTo(x + 12, ct + 14); c.lineTo(x + 4, ct + 24); }
    c.stroke();
    return;
  }
  const s = Y(lo) + LAVA_DOWN;
  box(c, a + 6, s, b - a - 12, LAVA_FLOOR - LAVA_DOWN, '#B91C1C');
  for (let y = s; y < Y(lo) + LAVA_FLOOR; y += 10) box(c, a + 6, y + ((y + f) % 6), b - a - 12, 3, (y / 10) % 2 ? '#EA580C' : '#DC2626');
  for (let x = a + 8; x < b - 8; x += 18) box(c, x, s + Math.sin(f * 0.1 + x * 0.05) * 2, 12, 4, (x / 18) % 2 ? '#FDE047' : '#FB923C');
  // (the glow up off it)
  c.fillStyle = 'rgba(249, 115, 22, 0.18)'; c.fillRect(a, s - 70, b - a, 70);
};

/** A facade (or the billboard, or the light tower) standing, going, or down. */
const drawFall = (c: Ctx, state: GameState, fl: Hv['falls'][number]) => {
  const [rx, w, h, how, name] = FALLS[fl.i], x = X(rx), f = state.frame;
  if (!inView(state, x - h - 60, x + w + h + 60)) return;
  // (the tornado took it: only its stumps)
  if (isTorn(state, 'fall', fl.i)) { stump(c, x, w); return; }
  const k = fl.phase === 'up' ? 0 : fl.phase === 'creak' ? Math.min(1, fl.t / 54) * 0.06 : fl.phase === 'falling' ? 0.06 + (fl.t / 22) * (Math.PI / 2 - 0.06) : Math.PI / 2;
  if (how === 'bridge') {
    // The light tower: a lattice of 2x4s, its lamps up top; tipping right about its foot onto the far bank
    c.save(); c.translate(x + w, GY); c.rotate(k);
    box(c, -w, -h, w, h, 'rgba(0,0,0,0)');
    c.strokeStyle = '#A16207'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(-w, 0); c.lineTo(-w, -h); c.moveTo(0, 0); c.lineTo(0, -h); c.stroke();
    c.lineWidth = 2; c.beginPath();
    for (let y = 0; y > -h + 10; y -= 34) { c.moveTo(-w, y); c.lineTo(0, y - 34); c.moveTo(0, y); c.lineTo(-w, y - 34); }
    c.stroke();
    for (let j = 0; j < 3; j++) { box(c, -w - 4 + j * 16, -h - 18, 14, 14, '#18181B'); box(c, -w - 2 + j * 16, -h - 16, 10, 10, fl.phase === 'down' ? '#57534E' : '#FEF3C7'); }
    c.restore();
    if (fl.phase === 'down') { box(c, x + w - 10, Y(14), h + 10, 3, '#FDE68A'); }
    else words(c, name, x + w / 2, GY - h - 30, print(1, '#FDE68A', '#000'));
    return;
  }
  const bill = how === 'billboard';
  if (fl.phase !== 'down') {
    // (standing, or tipping toward us: the face foreshortening as it comes over, its shadow on the street growing)
    const fh = h * Math.cos(k), feetY = bill ? BACK_Y - 10 : BACK_Y;
    c.fillStyle = `rgba(0, 0, 0, ${0.15 + Math.sin(k) * 0.5})`; c.fillRect(x, BACK_Y, w, BACK + Math.sin(k) * 40);
    if (bill) {
      for (const sx of [x + 30, x + w - 40]) box(c, sx, feetY - 120 * Math.cos(k), 10, 120 * Math.cos(k) + 10, '#57534E');
      const top = feetY - 120 * Math.cos(k) - fh * 0.6;
      box(c, x - 2, top - 2, w + 4, fh * 0.6 + 4, '#000'); box(c, x, top, w, fh * 0.6, '#1E3A8A');
      if (Math.cos(k) > 0.5) { words(c, 'THE REVENGERS 19', x + w / 2, top + 34 * Math.cos(k), enamel(12, '#FACC15', '#000')); words(c, 'REVENGERS: RESEMBLE', x + w / 2, top + 60 * Math.cos(k), enamel(10, '#F8FAFC', '#000')); }
    } else {
      facade(c, x, w, Math.max(4, fh), fl.i % 2 ? '#78716C' : '#92400E', Math.cos(k) > 0.5 ? name : undefined, enamel(10, '#FEF3C7', '#000'), { feetY });
      if (fl.phase === 'up' && !spent(state)) flames(c, x + 20, feetY - fh, w - 40, f, 0.8);
    }
    if (fl.phase === 'creak' && f % 10 < 5) words(c, '!', x + w / 2, BACK_Y - h - 20, enamel(14, '#EF4444', '#000'));
    return;
  }
  // Down: flat on the street, face down, its back showing (bare 2x4s, sandbags: it was only ever a front)
  const y0 = BACK_Y - 4, y1 = GY + 26;
  box(c, x - 4, y0, w + 8, y1 - y0, '#000'); box(c, x - 2, y0 + 2, w + 4, y1 - y0 - 4, bill ? '#1E3A8A' : '#A16207');
  c.strokeStyle = '#78350F'; c.lineWidth = 3; c.beginPath();
  for (let sx = x + 10; sx < x + w; sx += 40) { c.moveTo(sx, y0 + 4); c.lineTo(sx, y1 - 4); }
  c.moveTo(x, (y0 + y1) / 2); c.lineTo(x + w, (y0 + y1) / 2);
  c.stroke();
  box(c, x + w / 2 - 12, y0 + 6, 24, 10, '#A8A29E');
};

/** The climb's buildings, its scaffolds and the buildings behind it coming down as the water comes up. */
const climb = (c: Ctx, state: GameState, hv: Hv, done: boolean) => {
  if (!inView(state, X(CLIMB.a) - 300, X(CLIMB.b) + 100)) return;
  const f = state.frame, flood = hv.flood;
  // (behind: three more soundstages, going down as the water comes up past them: demolished)
  const backs: [number, number, number, number][] = [[6200, 380, 760, 300], [6900, 420, 1100, 700], [7550, 420, 1480, 1100]];
  for (const [bx, bw, bh, at] of backs) {
    const gone = done ? bh * 0.7 : Math.max(0, Math.min(bh * 0.7, (flood.h - at) * 2.2));
    const top = Y(bh - gone);
    box(c, X(bx), top, bw, Y(0) - top + 400, '#3F3A36'); box(c, X(bx), top, bw, 4, '#57534E');
    for (let wy = top + 30; wy < GY - 40; wy += 60) for (let wx = X(bx) + 24; wx < X(bx) + bw - 40; wx += 70) box(c, wx, wy, 28, 30, '#1C1917');
    if (gone > 0 && gone < bh * 0.7 && !done) for (let k = 0; k < 3; k++) { c.fillStyle = 'rgba(168, 162, 158, 0.5)'; c.beginPath(); c.ellipse(X(bx) + 60 + k * 120, top - 10 - ((f + k * 20) % 40), 50, 22, 0, 0, TAU); c.fill(); }
  }
  // (the HOTEL HAPPYWOOD's front, the scaffold up it)
  const s1 = SHAFTS[0];
  box(c, X(s1.a), Y(560), s1.b - s1.a, 560, '#6B4F3A');
  for (let wy = Y(540); wy < GY - 50; wy += 64) for (let wx = X(s1.a) + 30; wx < X(s1.b) - 40; wx += 80) { box(c, wx, wy, 34, 40, '#1C1917'); box(c, wx + 2, wy + 2, 30, 6, '#3F3F46'); }
  words(c, 'HOTEL HAPPYWOOD', X((s1.a + s1.b) / 2), Y(520), enamel(12, '#FDE68A', '#000'));
  c.strokeStyle = '#71717A'; c.lineWidth = 3; c.beginPath();
  for (let sx = X(s1.a) + 100; sx < X(s1.b); sx += 200) { c.moveTo(sx, GY); c.lineTo(sx, Y(500)); }
  c.stroke();
  // (STAGE 14, STAGE 15: big soundstage sides, their roofs lit along the top: stood on)
  for (const [bx, bw, bh, name] of BUILDINGS) {
    box(c, X(bx), Y(bh), bw, bh + 400, '#A8A29E');
    for (let sx = X(bx); sx < X(bx) + bw; sx += 24) box(c, sx, Y(bh), 2, bh, '#8B8580');
    words(c, name, X(bx + bw / 2), Y(bh) + 90, enamel(20, '#7F1D1D', '#000'));
    box(c, X(bx), Y(bh), bw, 5, '#FDE68A');
  }
  // (the crane on STAGE 15's roof: its mast, its jib out over STAGE 14; the cable and the ball are in front)
  const jx = X(BALL.px), jy = Y(BALL.ph);
  box(c, X(7640), Y(1040) - 320, 18, 320, '#CA8A04');
  box(c, jx - 20, jy - 14, X(7660) - jx + 20, 14, '#EAB308');
  c.strokeStyle = '#A16207'; c.lineWidth = 2; c.beginPath();
  for (let x = jx; x < X(7660); x += 20) { c.moveTo(x, jy - 14); c.lineTo(x + 10, jy); }
  c.stroke();
  // (the water tower up on the hill's flank, over shaft 3)
  box(c, X(7980), Y(1700), 160, 120, '#57534E'); words(c, 'HAPPYWOOD', X(8060), Y(1630), enamel(10, '#FDE68A', '#000'));
  for (const lx of [X(7990), X(8130)]) box(c, lx, Y(1580), 6, 80, '#44403C');
  // (the scaffold ledges: lit lips; the crumbly ones cracked, shaking as they go, falling once gone)
  LEDGES.forEach(([rx, h, w, crumbles], i) => {
    const cr = hv.crumbs.find(q => q.i === i);
    if (cr?.gone) { if (cr.fallY < 600) { c.globalAlpha = Math.max(0, 1 - cr.fallY / 600); ledgeLip(c, X(rx), Y(h) + cr.fallY, w, '#57534E', '#A8A29E'); c.globalAlpha = 1; } return; }
    const jig = cr && cr.shake > 0 ? (f % 4 < 2 ? -2 : 2) : 0;
    ledgeLip(c, X(rx) + jig, Y(h), w, crumbles ? '#78716C' : '#64748B', crumbles && !done ? '#FDBA74' : '#FDE68A');
    if (crumbles) { c.strokeStyle = '#1C1917'; c.lineWidth = 1; c.beginPath(); c.moveTo(X(rx) + w * 0.3 + jig, Y(h) + 3); c.lineTo(X(rx) + w * 0.4 + jig, Y(h) + 12); c.lineTo(X(rx) + w * 0.35 + jig, Y(h) + 16); c.stroke(); }
    // (its scaffold poles down from it)
    box(c, X(rx) + 8, Y(h) + 14, 4, 60, 'rgba(113, 113, 122, 0.6)'); box(c, X(rx) + w - 12, Y(h) + 14, 4, 60, 'rgba(113, 113, 122, 0.6)');
  });
};

/** The bunkers (the hill's only): concrete, its inside dark behind him (a caged bulb, sandbags, its name stenciled on
 *  the back wall), open both ends (he walks in and out), the slab roof with its hazard stripes along its face and its
 *  lit top (stood on). The sign before it. */
const bunker = (c: Ctx, state: GameState, k: number, done: boolean) => {
  const cv = COVERS[k], r = coverRoof(k), a = X(cv.a), b = X(cv.b), under = r.y + r.h, floorY = under + ROOF, f = state.frame;
  if (!inView(state, a - 500, b + 100)) return;
  // (the sign before it)
  if (!done) standSign(c, a - 360, Y(groundAtSign(cv.a - 360)), ['AVALANCHE ZONE', 'BUNKER AHEAD >'], '#B91C1C', '#F8FAFC');
  // (the back wall and the dark inside)
  box(c, r.x, under, r.w, ROOF, '#57534E');
  box(c, r.x + 10, under, r.w - 20, ROOF, '#1C1917');
  for (let y = under + 22; y < floorY - 4; y += 22) box(c, r.x + 10, y, r.w - 20, 2, '#292524');
  words(c, cv.name, (a + b) / 2, under + 40, enamel(8, '#FACC15', '#000'));
  // (the caged bulb, its glow)
  const lit = done || f % 90 > 3;
  if (lit) { c.fillStyle = 'rgba(253, 230, 138, 0.16)'; c.beginPath(); c.ellipse((a + b) / 2, under + 14, 70, 40, 0, 0, TAU); c.fill(); }
  box(c, (a + b) / 2 - 1, under, 2, 8, '#18181B'); box(c, (a + b) / 2 - 5, under + 8, 10, 10, lit ? '#FEF3C7' : '#57534E');
  c.strokeStyle = '#18181B'; c.lineWidth = 1; c.strokeRect((a + b) / 2 - 6, under + 7, 12, 12);
  // (sandbags along the back)
  for (let x = r.x + 14; x < r.x + r.w - 30; x += 28) { box(c, x, floorY - 14, 26, 14, '#A8A29E'); box(c, x + 2, floorY - 14, 22, 3, '#D6D3D1'); }
  // (its corner posts, concrete)
  box(c, r.x, under, 10, ROOF, '#78716C'); box(c, r.x + r.w - 10, under, 10, ROOF, '#78716C');
  // (the slab: thick concrete, the hazard stripes along its face, its lit top: stood on)
  box(c, r.x - 4, r.y - 4, r.w + 8, r.h + 6, '#000'); box(c, r.x - 2, r.y - 2, r.w + 4, r.h + 2, '#A8A29E');
  c.save(); c.beginPath(); c.rect(r.x - 2, r.y + 6, r.w + 4, 10); c.clip();
  for (let x = r.x - 12; x < r.x + r.w + 4; x += 16) { c.fillStyle = '#FACC15'; c.beginPath(); c.moveTo(x, r.y + 16); c.lineTo(x + 8, r.y + 16); c.lineTo(x + 18, r.y + 6); c.lineTo(x + 10, r.y + 6); c.fill(); }
  c.restore();
  box(c, r.x - 2, r.y - 2, r.w + 4, 3, '#FDE68A');
};const groundAtSign = (rx: number) => { for (const [a, b, h1, h2] of RUNS) if (rx >= a && rx <= b) return h1 + ((h2 - h1) * (rx - a)) / (b - a); return 0; };

export const drawHavocBack = (c: Ctx, state: GameState) => {
  const hv = hvOf(state), f = state.frame, done = spent(state);
  // The ride they came out of: its wall, the hole, the far wall lying flat on the street
  if (inView(state, X(-200), X(500))) {
    box(c, X(-200), GY - 420, 340, 420, '#27272A'); box(c, X(-200), GY - 420, 340, 6, '#3F3F46');
    // (the hole its far wall left: the way back in)
    c.fillStyle = '#0C0A09'; c.beginPath(); c.moveTo(X(10), GY);
    for (let k = 0; k <= 8; k++) c.lineTo(X(10 + k * 15), GY - 230 - ((k * 37) % 5) * 10);
    c.lineTo(X(130), GY); c.closePath(); c.fill();
    words(c, 'DISASTER: THE RIDE', X(-30), GY - 360, enamel(10, '#FACC15', '#000'));
    // (its far wall, out flat on the street)
    box(c, X(130), BACK_Y - 2, 380, BACK + 14, '#000'); box(c, X(132), BACK_Y, 376, BACK + 10, '#3F3F46');
    for (let x = X(150); x < X(500); x += 40) box(c, x, BACK_Y + 4, 2, BACK + 2, '#27272A');
  }
  // The street (the flat runs)
  for (const [a, b, h1, h2] of RUNS) if (h1 === 0 && h2 === 0 && inView(state, X(a), X(b))) sidewalk(c, state, X(a), X(b), done ? '#78716C' : '#8B8580', '#57534E');
  // (the chase's puddles: ankle-deep water on the street, ripples)
  for (const [a, b] of PUDDLES) {
    if (!inView(state, X(a), X(b))) continue;
    box(c, X(a), GY - 3, b - a, 6, 'rgba(71, 85, 105, 0.85)'); box(c, X(a) + 6, GY - 3, b - a - 12, 2, '#94A3B8');
    for (let x = X(a) + 14; x < X(b) - 14; x += 34) box(c, x + ((f * 0.5 + x) % 10), GY - 1, 10, 1, '#CBD5E1');
  }
  // (the facades behind: plywood, burning; the chase's blown away once the tornado's been)
  DECOR.forEach(([rx, w, h, wall, name], i) => {
    if (!w || !inView(state, X(rx), X(rx + w))) return;
    if (isTorn(state, 'facade', i)) { stump(c, X(rx), w); return; }
    facade(c, X(rx), w, h, wall, name, enamel(10, '#FEF3C7', '#000'));
    if (!done) flames(c, X(rx) + 10, BACK_Y - h, w - 20, f);
    if (rx > DOWNHILL.b) box(c, X(rx) - 6, BACK_Y - h - 8, w + 12, 8, '#F1F5F9');
  });
  // (the PA's horns on their lampposts, Steve's fliers and standees: what the tornado hasn't taken)
  HORNS.forEach((rx, i) => { if (inView(state, X(rx), X(rx))) { if (isTorn(state, 'horn', i)) box(c, X(rx) - 4, BACK_Y - 6, 8, 16, '#3F3F46'); else lamppost(c, X(rx), BACK_Y + 10, true, i); } });
  STEVES.forEach(([rx, kind], i) => { if (inView(state, X(rx), X(rx)) && !isTorn(state, 'steve', i)) steveFlier(c, X(rx), kind === 'standee' ? BACK_Y + 6 : BACK_Y - (kind === 'poster' ? 160 : 120), kind, rx % 3); });
  // (guests running for it, behind: back and forth along the back of the sidewalk; the tornado takes the chase's)
  if (!done) for (let k = 0; k < GUEST_BASES.length; k++) {
    if (hv.guestsGone[k] || !inView(state, X(GUEST_BASES[k]), X(GUEST_BASES[k] + 700))) continue;
    const g = guestAt(k, f);
    guest(c, g.x, BACK_Y + 4, 900 + k * 37, f, 'walk', g.dir, 'scared');
  }
  // The climb, the hill
  climb(c, state, hv, done);
  hill(c, state, done);
  // The lava rivers
  for (const l of LAVA) lavaRiver(c, state, l, done);
  // The facades coming down; the shelters
  for (const fl of hv.falls) drawFall(c, state, fl);
  COVERS.forEach((_, k) => bunker(c, state, k, done));
  // (the snow the avalanches left, banked along the road)
  for (const [a, b] of hv.banks) {
    if (!inView(state, X(a), X(b))) continue;
    for (let x = Math.max(X(a), state.camera.x - 60); x < Math.min(X(b), state.camera.x + 860); x += 40) {
      const g = groundAtSign(R(x)); c.fillStyle = '#F1F5F9'; c.beginPath(); c.ellipse(x, Y(g) + 2, 30, 10 + ((x / 40) % 3) * 3, 0, Math.PI, TAU); c.fill();
    }
  }
  // (spent: the snow banked all along the hill road and the foot of it)
  if (done) for (let x = Math.max(X(8600), state.camera.x - 60); x < Math.min(X(DOWNHILL.b + 600), state.camera.x + 860); x += 46) {
    const g = groundAtSign(R(x)); c.fillStyle = '#E2E8F0'; c.beginPath(); c.ellipse(x, Y(g) + 2, 32, 9 + ((x / 46) % 3) * 3, 0, Math.PI, TAU); c.fill();
  }
  // The first aid station (its tent's roof: under it out of the hail; on it, standable)
  if (inView(state, X(REFILL - 100), X(REFILL + 100))) {
    const t = Y(118);
    box(c, X(REFILL - 76), t - 2, 152, 22, '#000'); box(c, X(REFILL - 74), t, 148, 18, '#F8FAFC'); box(c, X(REFILL - 74), t, 148, 3, '#FDE68A');
    box(c, X(REFILL - 4), t + 3, 8, 14, '#DC2626'); box(c, X(REFILL - 10), t + 7, 20, 6, '#DC2626');
    box(c, X(REFILL - 70), t + 18, 6, 100, '#A1A1AA'); box(c, X(REFILL + 64), t + 18, 6, 100, '#A1A1AA');
    words(c, 'FIRST AID', X(REFILL), t - 10, enamel(10, '#DC2626', '#000'));
  }
  // The way on (revisits: to the stunt stage) at the end
  if (inView(state, X1 - 200, X1)) standSign(c, X1 - 120, GY, ['STUNTMAN STEVE\'S', 'STUPENDOUS STUNTERY >'], '#18181B', '#FACC15');
  // The wind's stretches: a windsock on a pole at their start (the tell's in it)
  for (const [a] of WIND) if (inView(state, X(a), X(a))) {
    const wt = f % 320, k = done ? 0.1 : wt >= 210 ? 1 : wt >= 160 ? 0.6 : 0.25;
    box(c, X(a) - 3, GY - 200, 6, 200, '#57534E');
    c.fillStyle = '#EA580C'; c.beginPath(); c.moveTo(X(a), GY - 200); c.lineTo(X(a) - 70 * k, GY - 196 + (1 - k) * 30); c.lineTo(X(a) - 70 * k, GY - 182 + (1 - k) * 30); c.lineTo(X(a), GY - 178); c.closePath(); c.fill();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// In front of him

const JUNK_COL: Record<string, string> = { cow: '#F8FAFC', potty: '#1D4ED8', standee: '#B91C1C', cart: '#F8FAFC', letter: '#F5F5F4' };
/** A piece of the tornado's junk (its middle at 0, 0). */
const junk = (c: Ctx, kind: string, ch: string) => {
  if (kind === 'letter') { words(c, ch || 'O', 0, 26, hillside({ sx: 7, sy: 8 }, '#F5F5F4', '#A8A29E')); return; }
  if (kind === 'cow') {
    box(c, -26, -14, 52, 26, '#000'); box(c, -24, -12, 48, 22, '#F8FAFC'); box(c, -12, -10, 14, 10, '#1C1917'); box(c, 8, -4, 10, 8, '#1C1917');
    box(c, 22, -18, 14, 14, '#F8FAFC'); box(c, 30, -12, 6, 4, '#FDA4AF');
    for (const lx of [-20, -8, 8, 18]) box(c, lx, 10, 5, 10, '#1C1917');
    return;
  }
  if (kind === 'potty') { box(c, -18, -30, 36, 60, '#000'); box(c, -16, -28, 32, 56, '#1D4ED8'); box(c, -12, -20, 24, 40, '#1E40AF'); box(c, -4, -26, 8, 3, '#F8FAFC'); return; }
  if (kind === 'standee') { c.save(); c.scale(0.8, 0.8); steveFlier(c, 0, 0, 'flier', 1); c.restore(); return; }
  box(c, -30, -12, 60, 24, '#000'); box(c, -28, -10, 56, 20, JUNK_COL.cart); box(c, -24, -6, 48, 6, '#B91C1C');
};

/** The tornado: a funnel of dust and snow and rain, narrow at its foot, out wide up top, turning; its junk going
 *  round; choked (the avalanche just got it), thin, white, stuttering. */
const tornado = (c: Ctx, state: GameState, hv: Hv) => {
  const t = hv.tornado, f = state.frame;
  if (!t.on) return;
  const base = Y(tornadoBase(t.x));
  if (!inView(state, t.x - 300, t.x + 300)) return;
  const choke = t.choked < 110 ? 1 - t.choked / 110 : 0;
  // (coming down: it reaches down out of the clouds first)
  const form = Math.min(1, t.formT / FORM_T), reach = FUNNEL_H * (1 - form);
  const sway = (y: number) => Math.sin(f * 0.04 + y * 0.008) * (20 + (base - y) * 0.06);
  for (let y = base; y > base - FUNNEL_H; y -= 14) {
    const up = base - y, hw = funnelHalf(up) * (1 - choke * 0.55);
    if (up < reach) continue;
    const band = Math.floor((up + f * 6) / 28) % 3;
    c.fillStyle = choke > 0.2 ? (band ? 'rgba(241, 245, 249, 0.55)' : 'rgba(203, 213, 225, 0.6)') : band === 0 ? 'rgba(87, 83, 78, 0.62)' : band === 1 ? 'rgba(120, 113, 108, 0.55)' : 'rgba(68, 64, 60, 0.6)';
    c.beginPath(); c.ellipse(t.x + sway(y), y, hw, 10, 0, 0, TAU); c.fill();
  }
  // (the streaks going round it)
  c.strokeStyle = choke > 0.2 ? 'rgba(255,255,255,0.6)' : 'rgba(231, 229, 228, 0.45)'; c.lineWidth = 2;
  for (let k = 0; k < 10; k++) {
    const y = base - ((k * 77 + f * 3) % FUNNEL_H), hw = funnelHalf(base - y) * (1 - choke * 0.55);
    if (base - y < reach) continue;
    const ph = (f * 0.25 + k * 1.7) % TAU;
    c.beginPath(); c.ellipse(t.x + sway(y), y, hw * 0.9, 6, 0, ph, ph + 1.8); c.stroke();
  }
  if (form < 1) return;
  // (its junk going round: more of it in the fling)
  const n = hv.fling.step === 'off' ? 6 : 12;
  const kinds = ['cow', 'letter', 'potty', 'standee', 'letter', 'cart'];
  for (let k = 0; k < n; k++) {
    const y = base - 120 - ((k * 97) % (FUNNEL_H - 160)), hw = funnelHalf(base - y);
    const a = f * (0.06 + (k % 3) * 0.02) + k * 1.3, sx = t.x + sway(y) + Math.sin(a) * hw;
    if (Math.cos(a) < -0.2 && k % 2) continue;
    c.save(); c.translate(sx, y); c.rotate(a * 2); c.scale(0.45, 0.45); junk(c, kinds[k % kinds.length], 'HAPPYWOOD'[k % 9]); c.restore();
  }
  // (its foot: the dust kicked up)
  c.fillStyle = 'rgba(120, 113, 108, 0.5)'; c.beginPath(); c.ellipse(t.x, base - 6, 90 + Math.sin(f * 0.2) * 10, 16, 0, 0, TAU); c.fill();
};

/** The big avalanche (the downhill's): its tell (the white building up at the left of the screen, the warning), then
 *  the wall of snow down the hill over the whole screen, taller than it, churning, its front a billow; the bunkers'
 *  insides cut out of it (he's seen in there, safe). */
const avalanches = (c: Ctx, state: GameState, hv: Hv) => {
  const f = state.frame, cam = state.camera;
  for (const av of hv.avalanches) {
    if (av.phase === 'tell') {
      const k = Math.min(1, av.t / AV_TELL);
      const w = 40 + k * 200;
      const g = c.createLinearGradient(cam.x, 0, cam.x + w, 0);
      g.addColorStop(0, `rgba(248, 250, 252, ${0.35 + k * 0.5})`); g.addColorStop(1, 'rgba(248, 250, 252, 0)');
      c.fillStyle = g; c.fillRect(cam.x, cam.y, w, 600);
      if (f % 16 < 10) words(c, 'AVALANCHE!', cam.x + 400, cam.y + 260, enamel(16, '#EF4444', '#000'));
      continue;
    }
    if (av.phase !== 'run') continue;
    const tail = av.front - AV_LEN;
    const l = Math.max(tail, cam.x - 40), r = Math.min(av.front + 70, cam.x + 840);
    if (r <= l) continue;
    const top = Math.max(cam.y - 40, Y(groundAtSign(R(av.front))) - AV_H), bot = cam.y + 640;
    // (the wall, less the bunkers' insides)
    c.save();
    c.beginPath(); c.rect(l, top, r - l, bot - top);
    COVERS.forEach((_, k) => { const cr = coverRoof(k); if (cr.x < r && cr.x + cr.w > l) c.rect(cr.x + 10, cr.y + cr.h, cr.w - 20, ROOF); });
    c.clip('evenodd');
    c.fillStyle = '#F1F5F9'; c.fillRect(l, top, Math.min(av.front, r) - l, bot - top);
    // (churning: bands rolling, gray shadows, snowballs tumbling)
    for (let y = top - (f * 6) % 48; y < bot; y += 48) { c.fillStyle = 'rgba(203, 213, 225, 0.55)'; c.fillRect(l, y, Math.min(av.front, r) - l, 14); }
    for (let k = 0; k < 26; k++) {
      const bx = tail + ((k * 263 + f * 9) % AV_LEN), by = cam.y + ((k * 151 + f * (3 + k % 4)) % 640);
      if (bx < l - 40 || bx > r) continue;
      c.fillStyle = k % 3 ? '#FFFFFF' : '#CBD5E1'; c.beginPath(); c.arc(bx, by, 14 + (k % 4) * 8, 0, TAU); c.fill();
      if (k % 7 === 0) { c.save(); c.translate(bx, by); c.rotate(f * 0.1 + k); box(c, -4, -18, 8, 36, '#78350F'); c.fillStyle = '#166534'; c.beginPath(); c.moveTo(0, -30); c.lineTo(16, 4); c.lineTo(-16, 4); c.fill(); c.restore(); }
    }
    // (its front: a billow of spray)
    for (let k = 0; k < 18; k++) {
      const y = cam.y - 20 + k * 38, bx = av.front + Math.sin(f * 0.3 + k) * 16 + ((k * 13) % 30);
      c.fillStyle = 'rgba(248, 250, 252, 0.95)'; c.beginPath(); c.arc(bx, y, 34 + (k % 3) * 10, 0, TAU); c.fill();
    }
    c.restore();
  }
};

/** The chase's snow slides (low, rolling along the street after him): the warning at the left of the screen, then the
 *  slide, a rolling wave of snow no higher than a jump. */
const slides = (c: Ctx, state: GameState, hv: Hv) => {
  const f = state.frame, cam = state.camera;
  for (const s of hv.slides) {
    if (s.warn > 0) {
      if (f % 10 < 6) words(c, '!', cam.x + 40, Y(groundAtSign(R(cam.x + 40))) - 90, enamel(16, '#EF4444', '#000'));
      continue;
    }
    const tail = s.x - SLIDE_LEN;
    if (!inView(state, tail, s.x)) continue;
    for (let x = tail; x < s.x; x += 10) {
      const k = (x - tail) / SLIDE_LEN, hgt = SLIDE_H * Math.sin(Math.PI * Math.min(1, k * 0.9 + 0.1)) + Math.sin(f * 0.4 + x * 0.1) * 3;
      const g = Y(groundAtSign(R(x)));
      box(c, x, g - hgt, 11, hgt + 4, k > 0.8 ? '#E2E8F0' : '#F8FAFC'); box(c, x, g - hgt, 11, 3, '#FFFFFF');
    }
  }
};

/** What the tornado's torn loose, going round it and thrown out. */
const debris = (c: Ctx, state: GameState, hv: Hv) => {
  const f = state.frame;
  for (const d of hv.debris) {
    if (!inView(state, d.x - 40, d.x + 40)) continue;
    c.save(); c.translate(d.x, d.y); c.rotate(d.rot);
    if (d.guest) {
      // (a guest, arms and legs out)
      box(c, -6, -18, 12, 22, '#2563EB'); box(c, -5, -28, 10, 10, d.col); box(c, -16, -16, 10, 4, d.col); box(c, 6, -16, 10, 4, d.col);
      box(c, -6, 4, 4, 14, '#1C1917'); box(c, 2, 4, 4, 14 + (f % 6), '#1C1917');
    } else { box(c, -d.w / 2 - 1, -d.h / 2 - 1, d.w + 2, d.h + 2, '#000'); box(c, -d.w / 2, -d.h / 2, d.w, d.h, d.col); }
    c.restore();
  }
};
export const drawHavocFront = (c: Ctx, state: GameState) => {
  const hv = hvOf(state), f = state.frame, cam = state.camera;
  // The wrecking ball: its cable off the jib, the ball
  const ball = ballAt(state);
  if (inView(state, ball.x - 100, ball.x + 100)) {
    c.strokeStyle = '#18181B'; c.lineWidth = 2; c.beginPath(); c.moveTo(X(BALL.px), Y(BALL.ph)); c.lineTo(ball.x, ball.y); c.stroke();
    c.fillStyle = '#000'; c.beginPath(); c.arc(ball.x, ball.y, BALL.r + 2, 0, TAU); c.fill();
    c.fillStyle = '#3F3F46'; c.beginPath(); c.arc(ball.x, ball.y, BALL.r, 0, TAU); c.fill();
    c.fillStyle = '#71717A'; c.beginPath(); c.arc(ball.x - 10, ball.y - 10, 10, 0, TAU); c.fill();
  }
  // What's coming down: its shadow (the warning) where it'll land, then it
  for (const d of hv.drops) {
    if (!inView(state, d.x - 40, d.x + 40)) continue;
    if (d.done > 0) continue;
    const k = d.warn > 0 ? 1 - d.warn / 90 : 1;
    c.fillStyle = `rgba(0, 0, 0, ${0.2 + k * 0.35})`; c.beginPath(); c.ellipse(d.x, d.land - 2, 18 + k * 12, 5, 0, 0, TAU); c.fill();
    if (d.warn > 0) {
      // (dust trickling down from up out of sight where it's coming from)
      if (d.kind === 'chunk') { c.fillStyle = 'rgba(214, 211, 209, 0.6)'; for (let y = cam.y; y < cam.y + 120; y += 14) c.fillRect(d.x - 2 + ((y + f) % 5), y + ((f * 3) % 14), 3, 4); words(c, '!', d.x, cam.y + 140, enamel(12, '#EF4444', '#000')); }
      continue;
    }
    c.save(); c.translate(d.x, d.y - 16); c.rotate(d.rot);
    if (d.kind === 'brick') { box(c, -14, -8, 28, 16, '#000'); box(c, -13, -7, 26, 14, '#B45309'); }
    else if (d.kind === 'light') { box(c, -14, -14, 28, 26, '#000'); box(c, -12, -12, 24, 22, '#27272A'); box(c, -8, 4, 16, 6, '#FEF3C7'); }
    else { box(c, -20, -16, 40, 32, '#000'); box(c, -18, -14, 36, 28, '#78716C'); box(c, -18, -14, 36, 4, '#A8A29E'); }
    c.restore();
  }
  // What the wind's throwing
  for (const o of hv.blown) {
    if (!inView(state, o.x - 40, o.x + 40)) continue;
    c.save(); c.translate(o.x, o.y); c.rotate(o.rot);
    if (o.kind === 'can') { box(c, -12, -14, 24, 28, '#000'); box(c, -10, -12, 20, 24, '#52525B'); box(c, -10, -12, 20, 4, '#71717A'); }
    else if (o.kind === 'sheet') { box(c, -26, -18, 52, 36, '#000'); box(c, -24, -16, 48, 32, '#D97706'); box(c, -24, -2, 48, 2, '#92400E'); }
    else if (o.kind === 'door') { box(c, -16, -26, 32, 52, '#000'); box(c, -14, -24, 28, 48, '#1D4ED8'); box(c, -6, -18, 12, 4, '#F8FAFC'); }
    else { c.scale(0.5, 0.5); steveFlier(c, 0, 0, 'flier', Math.abs(Math.round(o.x)) % 3); }
    c.restore();
  }
  // The looters' loot in the air
  for (const l of hv.lobs) {
    c.save(); c.translate(l.x, l.y); c.rotate(l.rot);
    if (l.kind === 'globe') { c.fillStyle = '#000'; c.beginPath(); c.arc(0, -2, 8, 0, TAU); c.fill(); c.fillStyle = '#BAE6FD'; c.beginPath(); c.arc(0, -2, 6, 0, TAU); c.fill(); box(c, -6, 4, 12, 4, '#7C2D12'); }
    else if (l.kind === 'mug') { box(c, -7, -8, 14, 16, '#000'); box(c, -6, -7, 12, 14, '#1D4ED8'); box(c, -4, -2, 8, 2, '#FACC15'); }
    else { box(c, -7, -9, 14, 18, '#000'); box(c, -6, -8, 12, 16, '#DC2626'); box(c, -4, -12, 8, 6, '#F6DCC8'); }
    c.restore();
  }
  // The tornado's thrown junk, and its mark where it'll come down
  for (const o of hv.thrown) {
    if (!inView(state, Math.min(o.x, o.tx) - 60, Math.max(o.x, o.tx) + 60)) continue;
    if (o.landed === 0) {
      c.strokeStyle = f % 10 < 5 ? '#EF4444' : '#FCA5A5'; c.lineWidth = 3; c.beginPath();
      c.moveTo(o.tx - 14, o.ty - 8); c.lineTo(o.tx + 14, o.ty + 2); c.moveTo(o.tx + 14, o.ty - 8); c.lineTo(o.tx - 14, o.ty + 2); c.stroke();
      c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.ellipse(o.tx, o.ty - 2, 26, 5, 0, 0, TAU); c.fill();
    }
    c.save(); c.translate(o.x, o.y - (o.landed ? 20 : 0)); if (!o.landed) c.rotate(o.rot); junk(c, o.kind, o.ch); c.restore();
  }
  // The tornado; what it's torn loose; the snow slides; the avalanche over everything
  tornado(c, state, hv);
  debris(c, state, hv);
  slides(c, state, hv);
  avalanches(c, state, hv);
  // The flood: the water up the backlot, its surface, the foam; the wave rolling in as it starts
  const fd = hv.flood;
  if (fd.on || fd.h > -100) {
    const a = Math.max(x0 - 400, cam.x - 20), b = Math.min(X(CLIMB.b), cam.x + 820), sy = Y(fd.h);
    if (b > a && fd.on) {
      c.fillStyle = 'rgba(71, 85, 105, 0.72)'; c.fillRect(a, sy, b - a, Math.max(0, cam.y + 640 - sy));
      c.fillStyle = 'rgba(120, 113, 108, 0.35)'; c.fillRect(a, sy + 20, b - a, 10);
      for (let x = Math.floor(a / 16) * 16; x < b; x += 16) box(c, x, sy + Math.sin(x * 0.05 + f * 0.15) * 3 - 2, 10, 3, '#CBD5E1');
      // (junk floating on it: a Steve standee, a tire, a plush)
      for (let k = 0; k < 5; k++) { const jx = a + ((k * 197 + f * 0.6) % Math.max(1, b - a)); box(c, jx, sy - 6 + Math.sin(f * 0.1 + k) * 2, 18, 8, ['#B91C1C', '#18181B', '#FACC15', '#F8FAFC', '#7C2D12'][k]); }
      if (fd.wave < 120) {
        const wx = cam.x - 200 + fd.wave * 14;
        c.fillStyle = 'rgba(148, 163, 184, 0.85)'; c.beginPath(); c.moveTo(cam.x - 40, GY + 10); c.lineTo(wx, GY + 10); c.quadraticCurveTo(wx + 60, GY - 80, wx - 20, GY - 130); c.lineTo(cam.x - 40, GY - 120); c.closePath(); c.fill();
        for (let k = 0; k < 8; k++) { c.fillStyle = 'rgba(241, 245, 249, 0.85)'; c.beginPath(); c.arc(wx - 20 + ((k * 13) % 50), GY - 120 - (k % 3) * 10, 10, 0, TAU); c.fill(); }
      }
    }
  }
  // Who's saying what: the havoc's people, the PA, the narrator
  const o = outOf(state);
  for (const e of state.enemies) { const s = o.barks.get(e); if (s && e.health > 0 && e.kind?.startsWith('m2:hwh_')) saidOver(c, s.text, e.pos.x + e.width / 2, e.pos.y - 18, '#FDE68A', 220); }
  const top = cam.y + 96;
  if (hv.narr) saidOver(c, hv.narr.text, cam.x + CANVAS_WIDTH / 2, top, '#FDE68A', 340);
  else if (o.pa && R(state.player.pos.x) > -300 && R(state.player.pos.x) < 20000) saidOver(c, o.pa.text, cam.x + CANVAS_WIDTH / 2, top, '#FDE047', 340);
};

/** The lava's glow, the fires, as lamps (the time of day's light). */
export const havocLamps = (state: GameState): Light[] => {
  if (spent(state)) return [];
  const cam = state.camera.x, out: Light[] = [];
  for (const l of LAVA) { const x = X((l.a + l.b) / 2); if (Math.abs(x - cam - 400) < 1200) out.push({ x, y: Y(Math.min(l.hl, l.hr)) + 20, r: Math.max(160, (l.b - l.a) * 0.9), a: 0.9, color: '#F97316' }); }
  return out;
};
