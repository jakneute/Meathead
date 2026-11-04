// The lot outside the water park, drawn (a crude first pass: the owner fills the stage in later). At night (the
// endgame's hour 10: the same sky as 9, no fireworks): the sky, the moon; far off on the horizon to the left, Happy Land
// as it is now (the park he's just walked out of: its lands' landmarks dark against the sky, a few lights); to the right
// the water park's rides (the slides' tubes, the drop tower, the big tipping bucket, the wave pool's wall). Up there the
// aliens' saucers and Satan's demons going at each other over who gets him: pink lasers, fireballs, now and then one
// going down in smoke. On the ground: the lot's asphalt and its lines, its light poles, the fence at the back, his
// truck where it came down (on its roof, smashed, steaming), and the water park's gate at the far end, chained shut.
// No volcanoes. Nothing here to stand on but the ground.

import type { GameState } from '../../../m1/game/core/state';
import { GROUND_Y, CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../../../m1/constants';
import { drawTodSky, farTint, timeOfDay, lampGlow } from '../../timeOfDay';
import { drawFighter } from '../../space/orbit/art';
import { truckPicture } from '../../intro/art/upper';
import { text, steppedGlow, pixelBlob } from '../../intro/art/kit';
import { elbow, knee } from '../../art/limb';
import { stamp } from '../../../m1/game/render/stamp';

type Ctx = CanvasRenderingContext2D;
const INK = '#08070C';
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const checker = (c: Ctx, x: number, y: number, w: number, h: number, col: string, ph = 0) => { c.fillStyle = col; for (let yy = 0; yy < h; yy += 2) for (let xx = ((yy >> 1) + ph) & 1 ? 2 : 0; xx < w; xx += 4) c.fillRect(x + xx, y + yy, 2, 2); };

/** The lot's layout (world x). */
export const LOT = { x0: 0, wreck: 520, gate: 2000, end: 2100 };
export const HORIZON = GROUND_Y - 150;

// ---------------------------------------------------------------------------------------------------------------
// Far off: the sky, Happy Land, the water park's rides (painted once a hour, wide, slid for the parallax)

const FAR_W = 1150;
const paintFar = (g: Ctx) => {
  const t = (col: string, k = 1) => farTint(col, k);
  // Happy Land, to the left: its landmarks against the sky, dark (it's shut), the odd light
  const y = HORIZON;
  g.save(); g.scale(0.6, 1);
  g.fillStyle = t('#1A1E34');
  const marks: [number, number, number][] = [[60, 90, 40], [130, 140, 18], [180, 70, 60], [270, 120, 30], [330, 60, 50], [420, 170, 14], [470, 80, 40], [560, 50, 70]];
  for (const [x, h, w] of marks) g.fillRect(x, y - h, w, h);
  // (the space needle's disc; the castle's spires; the coaster's hill)
  g.beginPath(); g.ellipse(427, y - 170, 22, 6, 0, 0, Math.PI * 2); g.fill();
  for (const sx of [186, 210, 232]) { g.beginPath(); g.moveTo(sx - 6, y - 70); g.lineTo(sx, y - 110); g.lineTo(sx + 6, y - 70); g.fill(); }
  g.strokeStyle = t('#1A1E34'); g.lineWidth = 3; g.beginPath(); g.moveTo(600, y); g.quadraticCurveTo(660, y - 160, 720, y); g.stroke();
  for (let i = 0; i < 40; i++) R(g, 50 + hash(i) * 600, y - hash(i + 7) * 120, 2, 2, i % 4 ? '#F6C860' : '#93C5FD');
  g.restore();
  // The water park, to the right: the slides' tubes curling down off their towers, the drop tower, the bucket, the wave
  // pool's wall; colored, unlit but for a few work lights
  const X = 470;
  const tube = (x0: number, y0: number, x1: number, y1: number, cx: number, cy: number, col: string) => {
    g.lineCap = 'round';
    g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke();
    g.strokeStyle = t(col, 0.8); g.lineWidth = 12; g.stroke();
    g.strokeStyle = t('#FFFFFF', 0.8); g.globalAlpha = 0.25; g.lineWidth = 3; g.stroke(); g.globalAlpha = 1;
    g.lineCap = 'butt';
  };
  for (let i = 0; i < 4; i++) {
    const tx = X + 60 + i * 150, th = 130 + hash(i) * 70;
    R(g, tx - 1, y - th - 1, 22, th + 1, INK); R(g, tx, y - th, 20, th, t('#3A4466', 0.8));
    for (let k = 0; k < th; k += 14) R(g, tx, y - th + k, 20, 2, t('#28304C', 0.8));
    R(g, tx - 8, y - th - 12, 36, 12, INK); R(g, tx - 7, y - th - 11, 34, 10, t('#C2410C', 0.8));
    const col = ['#06B6D4', '#EC4899', '#FACC15', '#22C55E'][i];
    tube(tx + 20, y - th + 10, tx + 150, y - 6, tx + 170, y - th, col);
    tube(tx + 20, y - th + 40, tx - 60, y - 6, tx - 90, y - th * 0.6, ['#A855F7', '#F97316', '#3B82F6', '#EF4444'][i]);
  }
  // (the drop tower; the big bucket on its frame, tipped a little)
  R(g, X + 640, y - 260, 26, 260, INK); R(g, X + 642, y - 258, 22, 258, t('#4B5577', 0.8)); R(g, X + 632, y - 270, 46, 14, INK); R(g, X + 634, y - 268, 42, 10, t('#DC2626', 0.8));
  g.fillStyle = INK; g.beginPath(); g.moveTo(X + 520, y - 170); g.lineTo(X + 600, y - 170); g.lineTo(X + 588, y - 120); g.lineTo(X + 532, y - 120); g.closePath(); g.fill();
  g.fillStyle = t('#FACC15', 0.8); g.beginPath(); g.moveTo(X + 524, y - 167); g.lineTo(X + 596, y - 167); g.lineTo(X + 585, y - 123); g.lineTo(X + 535, y - 123); g.closePath(); g.fill();
  R(g, X + 510, y - 120, 6, 120, INK); R(g, X + 604, y - 120, 6, 120, INK);
  // (the wave pool's wall, long and low)
  R(g, X + 20, y - 34, 470, 34, INK); R(g, X + 22, y - 32, 466, 30, t('#1E3A5F', 0.8)); R(g, X + 22, y - 32, 466, 3, t('#38BDF8', 0.8));
  for (const [x, h] of [[X + 200, 8], [X + 420, 10], [X + 650, 6]] as [number, number][]) R(g, x, y - h - 200, 4, 4, '#FDE68A');
};

/** The sky fight: who's up there (screen space, by the frame): saucers and demons on loops round each other. */
interface Flyer { alien: boolean; seed: number }
const FLYERS: Flyer[] = Array.from({ length: 9 }, (_, i) => ({ alien: i % 2 === 0, seed: i * 7.3 + 1 }));
/** Where one is at frame f (screen x, y), its facing, whether it's down (a smoking fall, then back on again). */
export const flyerAt = (fl: Flyer, f: number) => {
  const s = fl.seed, sp = 0.004 + hash(s) * 0.004, ph = f * sp + s;
  const cycle = 900 + Math.floor(hash(s + 2) * 600), local = (f + Math.floor(hash(s + 3) * cycle)) % cycle;
  const falling = local > cycle - 120 ? (local - (cycle - 120)) / 120 : 0;
  const x = W / 2 + Math.sin(ph) * (W * 0.42) + Math.sin(ph * 2.3 + s) * 60;
  const y = 70 + hash(s + 1) * 150 + Math.sin(ph * 1.7) * 30 + falling * falling * 300;
  const vx = Math.cos(ph) * (W * 0.42) * sp;
  return { x, y, face: vx >= 0 ? 1 : -1, falling };
};
export const FLYER_LIST = FLYERS;

// A demon, flying (one of Satan's: red, bat-winged, horned, a pitchfork): side on, facing right, about 40 tall; the
// arms and the legs two-bone (limb.ts). Two wing beats, stamped.
const SKIN = ['#3A0606', '#6A0E0A', '#981C12', '#C8321E', '#E8603C'];
const seg = (c: Ctx, x0: number, y0: number, x1: number, y1: number, col: string, w: number) => {
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = w + 2; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  c.lineCap = 'butt';
};
export const paintDemon = (g: Ctx, up: boolean) => {
  // (the far wing, the body leant into the flight, the near wing over it)
  const wing = (dx: number, col: string) => {
    g.fillStyle = INK; g.beginPath(); g.moveTo(-2 + dx, -24); g.lineTo(-22 + dx, up ? -44 : -18); g.lineTo(-16 + dx, up ? -34 : -12); g.lineTo(-10 + dx, up ? -36 : -8); g.lineTo(-6 + dx, up ? -28 : -10); g.lineTo(2 + dx, -18); g.closePath(); g.fill();
    g.fillStyle = col; g.beginPath(); g.moveTo(-1 + dx, -23); g.lineTo(-20 + dx, up ? -41 : -17); g.lineTo(-15 + dx, up ? -32 : -12); g.lineTo(-10 + dx, up ? -33 : -9); g.lineTo(-6 + dx, up ? -26 : -11); g.lineTo(1 + dx, -19); g.closePath(); g.fill();
  };
  wing(4, SKIN[1]);
  // (the legs: thigh back, the knee forward (limb.ts), the shin trailing; the tail)
  for (const s of [-1, 1]) {
    const hip: [number, number] = [-2, -12], foot: [number, number] = [-12 + s * 2, 2];
    const [kx, ky] = knee(hip[0], hip[1], foot[0], foot[1], 8, 9, 1);
    seg(g, hip[0], hip[1], kx, ky, s < 0 ? SKIN[1] : SKIN[2], 4); seg(g, kx, ky, foot[0], foot[1], s < 0 ? SKIN[1] : SKIN[2], 3);
  }
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(-4, -12); g.quadraticCurveTo(-20, -4, -24, -14); g.stroke();
  g.strokeStyle = SKIN[2]; g.lineWidth = 1.5; g.stroke();
  g.fillStyle = INK; g.beginPath(); g.moveTo(-27, -17); g.lineTo(-21, -15); g.lineTo(-25, -10); g.closePath(); g.fill();
  // (the body, the head: horns, a yellow eye, the grin)
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, -20, 8, 10, 0.4, 0, Math.PI * 2); g.fill();
  g.fillStyle = SKIN[2]; g.beginPath(); g.ellipse(0, -20, 6.5, 8.5, 0.4, 0, Math.PI * 2); g.fill();
  g.fillStyle = SKIN[3]; g.beginPath(); g.ellipse(-2, -23, 3, 4, 0.4, 0, Math.PI * 2); g.fill();
  g.fillStyle = INK; g.beginPath(); g.arc(5, -32, 6.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = SKIN[3]; g.beginPath(); g.arc(5, -32, 5.2, 0, Math.PI * 2); g.fill();
  for (const hx of [2, 7]) { g.fillStyle = INK; g.beginPath(); g.moveTo(hx - 2, -36); g.lineTo(hx - 3, -43); g.lineTo(hx + 2, -36); g.fill(); g.fillStyle = '#E8DCC0'; g.fillRect(hx - 2, -40, 1, 3); }
  R(g, 7, -34, 2, 2, '#FDE047'); R(g, 8, -34, 1, 1, INK);
  R(g, 6, -29, 5, 1, INK); R(g, 7, -29, 1, 1, '#FFFFFF'); R(g, 9, -29, 1, 1, '#FFFFFF');
  // (the arms: the far one back, the near one forward round the pitchfork's shaft; elbows from limb.ts)
  const sh: [number, number] = [2, -26];
  const far: [number, number] = [-6, -16], [fex, fey] = elbow(sh[0], sh[1], far[0], far[1], 6, 6, 1);
  seg(g, sh[0], sh[1], fex, fey, SKIN[1], 3); seg(g, fex, fey, far[0], far[1], SKIN[1], 2.5);
  const hand: [number, number] = [12, -18], [ex, ey] = elbow(sh[0] + 1, sh[1], hand[0], hand[1], 6, 6, 1);
  // (the pitchfork: the shaft through the hand, the three tines out in front)
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(-2, -8); g.lineTo(22, -26); g.stroke();
  g.strokeStyle = '#6B4A2A'; g.lineWidth = 1.5; g.stroke();
  for (const k of [-3, 0, 3]) { g.strokeStyle = INK; g.lineWidth = 2.5; g.beginPath(); g.moveTo(21 + k * 0.6, -26 + k * 0.8); g.lineTo(27 + k * 0.6, -31 + k * 0.8); g.stroke(); g.strokeStyle = '#B8BCC4'; g.lineWidth = 1; g.stroke(); }
  seg(g, sh[0] + 1, sh[1], ex, ey, SKIN[2], 3); seg(g, ex, ey, hand[0], hand[1], SKIN[3], 2.5);
  R(g, hand[0] - 1.5, hand[1] - 1.5, 3, 3, SKIN[3]);
  wing(0, SKIN[2]);
};
const drawDemon = (c: Ctx, f: number, seed: number) => {
  const up = ((f >> 3) + Math.floor(seed)) % 2 === 0;
  stamp(c, `lot-demon-${+up}`, -32, -50, 64, 56, g => paintDemon(g, up));
};

/** The far off, and the fight over it (screen space). */
export const drawLotBackdrop = (c: Ctx, state: GameState) => {
  const f = state.frame, cam = state.camera.x;
  drawTodSky(c, 0, 0, W, H, ['#060A1C', '#0B1230', '#121B42', '#1C2752', '#283460', '#38406C'], { moon: [640, 90], horizon: HORIZON, t: f, scroll: cam });
  c.save(); c.translate(-Math.round(Math.max(0, Math.min(FAR_W - W, cam * 0.27))), 0);
  stamp(c, `lot-far-${timeOfDay().key}`, 0, 0, FAR_W, HORIZON + 2, paintFar);
  c.restore();
  // The fight: shots between them first (pink from the saucers, fireballs from the demons), then them
  for (let i = 0; i < FLYERS.length; i++) {
    const a = flyerAt(FLYERS[i], f), b = flyerAt(FLYERS[(i + 3) % FLYERS.length], f);
    if (a.falling || FLYERS[i].alien === FLYERS[(i + 3) % FLYERS.length].alien) continue;
    const ph = (f + i * 37) % 90;
    if (ph < 12) {
      const k = ph / 12, x = a.x + (b.x - a.x) * k, y = a.y + (b.y - a.y) * k;
      if (FLYERS[i].alien) { c.strokeStyle = '#FF7AD9'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (b.x - a.x) * 0.12, y + (b.y - a.y) * 0.12); c.stroke(); }
      else { steppedGlow(c, x, y, 6, '#F97316', 0.5, 0.1, 3); R(c, x - 2, y - 2, 4, 4, '#FDE047'); }
      if (ph === 11) steppedGlow(c, b.x, b.y, 14, FLYERS[i].alien ? '#FF7AD9' : '#F97316', 0.5, 0.05, 3);
    }
  }
  for (const fl of FLYERS) {
    const a = flyerAt(fl, f);
    if (a.y > HORIZON + 10) continue;
    c.save(); c.translate(Math.round(a.x), Math.round(a.y));
    if (a.face < 0) c.scale(-1, 1);
    if (fl.alien) { c.scale(0.55, 0.55); drawFighter(c, f, fl.seed > 30, false, false, true); } else { c.scale(0.85, 0.85); drawDemon(c, f, fl.seed); }
    c.restore();
    if (a.falling) for (let k = 0; k < 4; k++) pixelBlob(c, a.x - a.face * k * 6, a.y - k * 8, 4 + k, 3 + k, `rgba(60, 60, 66, ${(0.6 - k * 0.12).toFixed(2)})`);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The lot itself (world space)

const LIGHTS = [260, 900, 1400, 1850];
export const lotLights = () => LIGHTS.map(x => ({ x, y: GROUND_Y - 150, r: 170, a: 0.3, color: '#FDE68A' }));
export const drawLotBack = (c: Ctx, state: GameState, wreck: { steam: number }) => {
  const cam = state.camera.x, f = state.frame;
  const vis = (a: number, b: number) => b > cam - 60 && a < cam + W + 60;
  // (the fence at the back of the lot, chain link, against the far off)
  for (let x = Math.floor(cam / 60) * 60 - 60; x < cam + W + 60; x += 60) { R(c, x, GROUND_Y - 70, 3, 70, '#3A3E48'); }
  c.fillStyle = 'rgba(120, 130, 150, 0.25)';
  for (let x = Math.floor(cam / 8) * 8 - 8; x < cam + W + 8; x += 8) { c.fillRect(x, GROUND_Y - 66, 1, 64); }
  R(c, cam - 60, GROUND_Y - 70, W + 120, 2, '#5A6070');
  // (the asphalt, its painted lines; its far edge's curb)
  R(c, cam - 60, GROUND_Y - 4, W + 120, H - GROUND_Y + 4, '#24262E');
  checker(c, Math.floor(cam / 4) * 4 - 60, GROUND_Y + 30, W + 120, 4, '#1C1E24');
  R(c, cam - 60, GROUND_Y - 4, W + 120, 3, '#4A4C54');
  for (let x = Math.floor(cam / 120) * 120 - 120; x < cam + W + 120; x += 120) { R(c, x, GROUND_Y + 8, 4, 40, '#B8B8B0'); }
  // (the light poles: their heads lit, the pool of light under each)
  for (const x of LIGHTS) if (vis(x - 140, x + 140)) {
    R(c, x - 3, GROUND_Y - 160, 6, 160, '#3A3E48'); R(c, x - 3, GROUND_Y - 160, 2, 160, '#5A606C');
    R(c, x - 22, GROUND_Y - 166, 44, 8, INK); R(c, x - 20, GROUND_Y - 160, 40, 3, '#FDE68A');
    const k = lampGlow();
    c.fillStyle = `rgba(253, 230, 138, ${(0.1 * k).toFixed(3)})`; c.beginPath(); c.moveTo(x - 20, GROUND_Y - 158); c.lineTo(x + 20, GROUND_Y - 158); c.lineTo(x + 110, GROUND_Y + 10); c.lineTo(x - 110, GROUND_Y + 10); c.closePath(); c.fill();
  }
  // His truck, where it came down: on its roof, smashed, steaming, a wheel still turning
  if (vis(LOT.wreck - 180, LOT.wreck + 180)) {
    const img = truckPicture();
    // (turned over about the picture's middle, its cab's roof down on the asphalt: the hood's at the left now)
    c.save(); c.translate(LOT.wreck, GROUND_Y - 34); c.rotate(Math.PI - 0.04); c.drawImage(img, -150, -76); c.restore();
    // (the glass round it)
    for (let k = 0; k < 14; k++) R(c, LOT.wreck - 140 + hash(k) * 280, GROUND_Y - 3 - hash(k + 3) * 4, 3, 2, k % 2 ? '#BFE0FF' : '#9A9CA2');
    for (let k = 0; k < 5; k++) {
      const age = (f * 1.2 + k * 24) % 120;
      pixelBlob(c, LOT.wreck - 112 + Math.sin((f + k * 40) * 0.05) * 6, GROUND_Y - 30 - age * 0.9, 6 + age * 0.12, 5 + age * 0.1, `rgba(232, 236, 240, ${(0.45 * wreck.steam * (1 - age / 120)).toFixed(2)})`);
    }
    // (a back wheel up in the air, still going round)
    const wx = LOT.wreck + 80, wy = GROUND_Y - 92, a = f * 0.2;
    for (let k = 0; k < 5; k++) { const an = a + (k / 5) * Math.PI * 2; R(c, wx + Math.cos(an) * 11, wy + Math.sin(an) * 11, 2, 2, '#FFFFFF'); }
  }
  // The water park's gate: two towers, the arch, its name; the gates under it shut, a chain and a padlock, CLOSED
  if (vis(LOT.gate - 200, LOT.gate + 200)) drawGate(c, f);
};

const drawGate = (c: Ctx, f: number) => {
  const X = LOT.gate, B = GROUND_Y;
  stamp(c, 'lot-gate', X - 190, B - 300, 380, 302, g => {
    for (const tx of [X - 170, X + 120]) {
      R(g, tx - 2, B - 260, 54, 260, INK); R(g, tx, B - 258, 50, 258, '#1E4A7A'); R(g, tx, B - 258, 8, 258, '#3A7AB8'); R(g, tx + 42, B - 258, 8, 258, '#14345A');
      for (let k = 0; k < 8; k++) R(g, tx, B - 240 + k * 30, 50, 3, '#0E2A48');
      R(g, tx - 8, B - 276, 66, 18, INK); R(g, tx - 6, B - 274, 62, 14, '#22D3EE'); R(g, tx - 6, B - 274, 62, 3, '#A5F3FC');
    }
    // (the arch over it: a wave, cresting)
    g.lineCap = 'round';
    g.strokeStyle = INK; g.lineWidth = 34; g.beginPath(); g.moveTo(X - 150, B - 236); g.quadraticCurveTo(X, B - 330, X + 150, B - 236); g.stroke();
    g.strokeStyle = '#0891B2'; g.lineWidth = 28; g.stroke();
    g.strokeStyle = '#67E8F9'; g.lineWidth = 6; g.beginPath(); g.moveTo(X - 150, B - 246); g.quadraticCurveTo(X, B - 340, X + 150, B - 246); g.stroke();
    g.lineCap = 'butt';
    // (its name: readable, up on the arch)
    text(g, 'HAPPY WATERS', X, B - 262, '#FEF08A', 14);
    // (the gates: bars, shut, the chain round the middle, the padlock, the sign hung off it)
    for (let x = X - 116; x <= X + 114; x += 14) { R(g, x, B - 150, 4, 150, INK); R(g, x + 1, B - 150, 2, 150, '#8A8E98'); }
    R(g, X - 118, B - 154, 236, 6, INK); R(g, X - 117, B - 153, 234, 4, '#A4A8B2');
    R(g, X - 118, B - 70, 236, 6, INK); R(g, X - 117, B - 69, 234, 4, '#A4A8B2');
    for (let k = 0; k < 9; k++) { g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.ellipse(X - 32 + k * 8, B - 96 + Math.sin(k) * 2, 5, 3, 0, 0, Math.PI * 2); g.stroke(); g.strokeStyle = '#C8CCD2'; g.lineWidth = 1.2; g.stroke(); }
    R(g, X - 8, B - 92, 16, 16, INK); R(g, X - 6, B - 90, 12, 12, '#D4A017'); R(g, X - 2, B - 86, 4, 5, INK);
    R(g, X - 44, B - 76, 88, 28, INK); R(g, X - 42, B - 74, 84, 24, '#F8FAFC'); R(g, X - 42, B - 74, 84, 4, '#DC2626');
    text(g, 'CLOSED', X, B - 55, '#B91C1C', 10);
  });
  // (the work lights on its towers, blinking)
  for (const tx of [X - 145, X + 145]) if ((f >> 5) % 2) steppedGlow(c, tx, B - 268, 12, '#22D3EE', 0.5, 0.1, 3);
};
