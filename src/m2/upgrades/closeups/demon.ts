// The cheap shot's own close-up for BRATHAZAR (real hell's punk demon kid, Satan's boy, desperate to impress his dad).
// His cut red scaly gut with a black hair trail, a studded belt with a steel skull buckle, ripped jeans (red showing
// through the holes, white threads, safety pins, a patch), a wallet chain, his tail curled round with its spiked collar.
// Through a hellish X-ray: a charred, spurred pelvis and his forked sack: THREE balls, bone thorns, a steel ring through
// it. His glove clamps on it and WRENCHES (ripKit.ts): the sack dragged down long, lava weeping out of the splitting
// scales, the pelvis cracking with lava in the cracks, till it tears off: black lava-blood full of embers gushing, gore,
// thorns and studs flying, black smoke; the sack held up smoking in his fist. Then the bit for him: DAD WAS WATCHING.
//
// Still layers baked once (closeUp.ts bakeOnce); per frame the stamps plus a few dozen shapes.

import { type CloseUpPaint, PANEL_W, PANEL_H, CX, bakeOnce, rnd, clamp } from '../closeUp';
import { GRIP, RIP, handAt, drawHand, drawTether, drawSnapped, effort, ripShake, ripFlash, gloveGore } from './ripKit';
import {
  type Ramp, INK, orb, bands, banded, clipTo, stroke, vein, hairs, sweatBeads, scanlines, xrayWindow, winPath, tag,
  sheet, stampCell, debris, drops, runs, sparks, smoke, bigWord,
} from './specialKit';

type Ctx = CanvasRenderingContext2D;

// (his ramps, darkest first: spooky/hell/demon.ts's)
const SKIN: Ramp = ['#2E0604', '#560C08', '#7E1610', '#A2241A', '#C23E28', '#DE6646'];
const JEANS: Ramp = ['#141C30', '#22304E', '#34487A', '#4A64A0', '#6C88C0', '#9AB0DA'];
const LEATHER: Ramp = ['#060608', '#101014', '#1C1C22', '#2C2C34', '#44444E', '#62626E'];
const STEEL: Ramp = ['#3A3A42', '#6A6A76', '#A0A0AC', '#D8D8E2', '#FFFFFF'];
const HORN: Ramp = ['#4A3E30', '#7A6A54', '#A89678', '#D0C0A0', '#F0E4C8'];
const CHAR: Ramp = ['#140C0A', '#2E2420', '#544640', '#8A7A6C', '#C8B8A4'];
const XRAY: Ramp = ['#0C0204', '#1C0608', '#2C0A0C', '#3E1012'];
const LAVA: Ramp = ['#0A0202', '#1A0505', '#FB923C'];
const LAVA_RUN: Ramp = ['#000000', '#2A0A04', '#F97316'];

const WX = CX, WY = 146, WRX = 150, WRY = 98;
/** Frames after the boot lands that they burst. */

const thigh = (g: Ctx, s: number) => () => {
  g.moveTo(CX + s * 6, 40); g.lineTo(CX + s * 300, 40); g.lineTo(CX + s * 300, PANEL_H + 4); g.lineTo(CX + s * 74, PANEL_H + 4);
  g.quadraticCurveTo(CX + s * 24, 236, CX + s * 8, 204); g.closePath();
};
const stud = (g: Ctx, x: number, y: number, r = 3) => { g.fillStyle = INK; g.beginPath(); g.moveTo(x, y - r - 2); g.lineTo(x + r + 2, y + r); g.lineTo(x - r - 2, y + r); g.closePath(); g.fill(); g.fillStyle = STEEL[2]; g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r, y + r - 1); g.lineTo(x - r, y + r - 1); g.closePath(); g.fill(); g.fillStyle = STEEL[4]; g.fillRect(x - 1, y - r + 1, 1, 2); };

// ---- the gut, the belt, the ripped jeans, the chain, the tail
const body = () => bakeOnce('demon-body', g => {
  // (the gut: red, cut, scaly, a black trail of hair)
  bands(g, 0, 0, PANEL_W, 26, [SKIN[4], SKIN[3]]);
  g.strokeStyle = SKIN[1]; g.lineWidth = 1.5; g.beginPath();
  for (let y = 2; y < 24; y += 5) for (let x = (y % 10 ? 0 : 5); x < PANEL_W; x += 10) { g.moveTo(x, y); g.quadraticCurveTo(x + 5, y + 4, x + 10, y); }
  g.stroke();
  stroke(g, () => { g.moveTo(CX - 160, -2); g.quadraticCurveTo(CX - 80, 10, CX - 36, 26); g.moveTo(CX + 160, -2); g.quadraticCurveTo(CX + 80, 10, CX + 36, 26); }, SKIN[0], 3);
  hairs(g, CX - 20, -6, 40, 32, 46, 7, '#0A0303', 7);
  sweatBeads(g, 30, 4, 460, 14, 8, 19);
  // (the jeans: two cylinders lit from the upper left, dark in the crease)
  g.fillStyle = JEANS[0]; g.fillRect(0, 36, PANEL_W, PANEL_H);
  banded(g, thigh(g, -1), CX - 300, 40, 306, 260, [JEANS[1], JEANS[2], JEANS[3], JEANS[4], JEANS[3], JEANS[2]], false, INK, 3);
  banded(g, thigh(g, 1), CX, 40, 300, 260, [JEANS[2], JEANS[3], JEANS[3], JEANS[2], JEANS[1], JEANS[0]], false, INK, 3);
  // (the rips: red showing through, the white threads across)
  for (const [x, y, w, h] of [[40, 150, 70, 34], [400, 200, 76, 30], [130, 236, 50, 22], [446, 96, 44, 22]] as const) {
    g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, w / 2 + 3, h / 2 + 3, 0.1, 0, Math.PI * 2); g.fill();
    clipTo(g, () => g.ellipse(x, y, w / 2, h / 2, 0.1, 0, Math.PI * 2), () => bands(g, x - w / 2, y - h / 2, w, h, [SKIN[4], SKIN[3], SKIN[2]]));
    g.strokeStyle = '#E8E4DC'; g.lineWidth = 1; g.beginPath(); for (let k = -h / 2 + 4; k < h / 2; k += 4) { g.moveTo(x - w / 2 + 2, y + k); g.lineTo(x + w / 2 - 2, y + k + (k % 8 ? 2 : -1)); } g.stroke();
  }
  // (safety pins, a patch: SATAN JR in a coffin)
  for (const [x, y] of [[96, 120], [430, 150], [70, 210]] as const) { stroke(g, () => { g.moveTo(x, y); g.lineTo(x + 20, y - 6); g.lineTo(x + 2, y + 4); }, STEEL[3], 2); g.fillStyle = STEEL[1]; g.fillRect(x + 18, y - 9, 5, 6); }
  g.save(); g.translate(440, 236); g.rotate(-0.12);
  banded(g, () => { g.moveTo(-26, -10); g.lineTo(-14, -20); g.lineTo(14, -20); g.lineTo(26, -10); g.lineTo(14, 22); g.lineTo(-14, 22); g.closePath(); }, -26, -20, 52, 42, ['#1C1C22', '#101014'], true, '#B91C1C', 2);
  tag(g, 'SATAN', 0, -2, '#F97316', 7, 'center'); tag(g, 'JR', 0, 12, '#F97316', 7, 'center');
  g.restore();
  // (the belt: studded leather, the steel skull buckle)
  banded(g, () => g.rect(-4, 22, PANEL_W + 8, 22), 0, 22, PANEL_W, 22, [LEATHER[4], LEATHER[3], LEATHER[2], LEATHER[1]], true, INK, 2);
  for (let x = 10; x < PANEL_W; x += 22) if (Math.abs(x - CX) > 30) stud(g, x, 33);
  orb(g, CX, 32, 20, 18, STEEL);
  g.fillStyle = INK; g.beginPath(); g.ellipse(CX - 7, 30, 5, 6, 0, 0, Math.PI * 2); g.ellipse(CX + 7, 30, 5, 6, 0, 0, Math.PI * 2); g.fill();
  g.fillRect(CX - 2, 38, 4, 4); for (let k = -8; k <= 6; k += 4) g.fillRect(CX + k, 45, 2, 4);
  g.fillStyle = '#F97316'; g.fillRect(CX - 8, 29, 2, 2); g.fillRect(CX + 6, 29, 2, 2);
  // (the wallet chain: off the belt, swinging down to his pocket)
  for (let i = 0; i <= 16; i++) {
    const k = i / 16, x = 40 + k * 120, y = 44 + Math.sin(k * Math.PI) * 70;
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.ellipse(x, y, 6, 4, i % 2 ? 0.4 : -0.4, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = i % 2 ? STEEL[3] : STEEL[2]; g.lineWidth = 2; g.stroke();
  }
  // (his tail: round from behind on the right, spiked collar, the arrowhead tip)
  const tailPts: [number, number][] = []; for (let i = 0; i <= 20; i++) { const k = i / 20; tailPts.push([PANEL_W + 20 - k * 120, 270 - Math.sin(k * 2.6) * 70 - k * 30]); }
  for (let pass = 0; pass < 3; pass++) {
    g.strokeStyle = [INK, SKIN[2], SKIN[4]][pass]; g.lineWidth = [22, 16, 5][pass]; g.lineCap = 'round';
    g.beginPath(); tailPts.forEach(([x, y], i) => { const yy = pass === 2 ? y - 4 : y; if (i) g.lineTo(x, yy); else g.moveTo(x, yy); }); g.stroke();
  }
  g.lineCap = 'butt';
  const [tx, ty] = tailPts[20];
  banded(g, () => { g.moveTo(tx + 4, ty - 4); g.lineTo(tx - 30, ty - 16); g.lineTo(tx - 16, ty + 4); g.lineTo(tx - 24, ty + 22); g.closePath(); }, tx - 30, ty - 16, 34, 38, [SKIN[4], SKIN[3], SKIN[1]], false, INK, 2);
  const [cx2, cy2] = tailPts[8];
  banded(g, () => g.rect(cx2 - 8, cy2 - 13, 16, 26), cx2 - 8, cy2 - 13, 16, 26, [LEATHER[4], LEATHER[2], LEATHER[1]], false, INK, 2);
  for (const dy of [-10, 0, 10]) { g.fillStyle = INK; g.beginPath(); g.moveTo(cx2 + 6, cy2 + dy - 4); g.lineTo(cx2 + 20, cy2 + dy); g.lineTo(cx2 + 6, cy2 + dy + 4); g.fill(); g.fillStyle = STEEL[3]; g.beginPath(); g.moveTo(cx2 + 7, cy2 + dy - 2); g.lineTo(cx2 + 17, cy2 + dy); g.lineTo(cx2 + 7, cy2 + dy + 2); g.fill(); }
  // (hell's light: a dark vignette at the sides, embers drifting)
  for (let i = 0; i < 4; i++) { g.fillStyle = `rgba(20,0,0,${0.12 + i * 0.05})`; g.fillRect(0, 0, 14 - i * 3, PANEL_H); g.fillRect(PANEL_W - 14 + i * 3, 0, 14 - i * 3, PANEL_H); }
  tag(g, 'HELL-RAY', PANEL_W - 92, 270, '#FB923C');
});

// ---- the X-ray: the charred pelvis with its spurs, the femurs
const xray = () => bakeOnce('demon-xray', g => {
  xrayWindow(g, WX, WY, WRX, WRY, XRAY, '#F97316');
  clipTo(g, winPath(g, WX, WY, WRX, WRY), () => {
    g.fillStyle = 'rgba(251,146,60,0.08)'; for (const s of [-1, 1]) { g.beginPath(); thigh(g, s)(); g.fill(); }
    for (const s of [-1, 1]) {
      g.save(); g.translate(CX + s * 112, 126); g.rotate(s * 0.16);
      banded(g, () => g.rect(-12, 0, 24, 200), -12, 0, 24, 200, [CHAR[2], CHAR[4], CHAR[3], CHAR[1]], false, INK, 3);
      g.restore();
      orb(g, CX + s * 112, 126, 18, 16, CHAR);
    }
    const P = (x: number, y: number): [number, number] => [CX + x * 0.85, 48 + y * 0.9];
    const pelvis = () => {
      const m = (x: number, y: number) => { const p = P(x, y); g.moveTo(p[0], p[1]); };
      const l = (x: number, y: number) => { const p = P(x, y); g.lineTo(p[0], p[1]); };
      const q = (a: number, b: number, x: number, y: number) => { const p = P(a, b), r = P(x, y); g.quadraticCurveTo(p[0], p[1], r[0], r[1]); };
      m(-200, 6);
      // (the crest: spurs of bone up off it)
      for (let i = 1; i <= 6; i++) { const x = -200 + i * 22, y = 6 - i * 2; l(x - 8, y + 2); l(x - 2, y - 22); l(x + 4, y); }
      q(-90, 6, -60, 30); q(-30, 60, -18, 88); l(18, 88); q(30, 60, 60, 30); q(90, 6, 66, 0);
      for (let i = 6; i >= 1; i--) { const x = 200 - i * 22, y = 6 - i * 2; l(x - 4, y); l(x + 2, y - 22); l(x + 8, y + 2); }
      l(200, 6); l(170, 60); q(100, 70, 60, 94); l(-60, 94); q(-100, 70, -170, 60); g.closePath();
    };
    banded(g, pelvis, CX - 180, 20, 360, 110, [CHAR[4], CHAR[3], CHAR[3], CHAR[2], CHAR[1]], true, INK, 3);
    g.fillStyle = XRAY[3]; g.beginPath(); g.ellipse(CX, 95, 30, 22, 0, 0, Math.PI * 2); g.fill();
    banded(g, () => g.rect(CX - 20, 126, 40, 12), CX - 20, 126, 40, 12, [CHAR[4], CHAR[2]], true, INK, 2);
    // (veins of fire through the bone already)
    vein(g, CX - 120, 70, 0.3, 60, 3, '#7C2D12', 2, '#F97316'); vein(g, CX + 120, 70, Math.PI - 0.3, 60, 9, '#7C2D12', 2, '#F97316');
    for (const s of [-1, 1]) stroke(g, () => { g.moveTo(CX + s * 26, 152); g.bezierCurveTo(CX + s * 30, 126, CX + s * 70, 136, CX + s * 60, 104); }, 'rgba(251,146,60,0.5)', 3);
    scanlines(g, 0.2);
  });
});

// ---- his forked sack: three of them, scaly, thorned, a ring through the middle one
const sack = () => bakeOnce('demon-sack', g => {
  banded(g, () => { g.moveTo(62, 0); g.lineTo(108, 0); g.lineTo(114, 34); g.lineTo(56, 34); g.closePath(); }, 56, 0, 58, 34, [SKIN[3], SKIN[2], SKIN[1]], false, INK, 2);
  const lobes: [number, number, number][] = [[46, 66, 27], [124, 66, 27], [85, 80, 30]];
  for (const [x, y, r] of lobes) {
    // (a thorn off the bottom of each, and one out the side)
    for (const [a, len] of [[Math.PI / 2, 22], [x < 85 ? Math.PI * 0.85 : x > 85 ? Math.PI * 0.15 : Math.PI * 0.62, 16]] as const) {
      const bx = x + Math.cos(a) * r * 0.8, by = y + Math.sin(a) * r * 0.8, tx = x + Math.cos(a) * (r + len), ty = y + Math.sin(a) * (r + len);
      banded(g, () => { g.moveTo(bx - Math.sin(a) * 7, by + Math.cos(a) * 7); g.lineTo(tx, ty); g.lineTo(bx + Math.sin(a) * 7, by - Math.cos(a) * 7); g.closePath(); }, Math.min(bx, tx) - 8, Math.min(by, ty) - 8, Math.abs(tx - bx) + 16, Math.abs(ty - by) + 16, [HORN[4], HORN[3], HORN[2], HORN[1]], false, INK, 2);
    }
  }
  for (const [x, y, r] of lobes) orb(g, x, y, r, r * 0.92, SKIN, INK, true);
  // (the scales over them, the seams between)
  g.strokeStyle = SKIN[1]; g.lineWidth = 1.2; g.beginPath();
  for (let y = 46; y < 108; y += 6) for (let x = 20 + (y % 12 ? 0 : 4); x < 152; x += 8) { g.moveTo(x, y); g.quadraticCurveTo(x + 4, y + 3, x + 8, y); }
  g.stroke();
  stroke(g, () => { g.moveTo(66, 50); g.quadraticCurveTo(70, 76, 62, 96); g.moveTo(104, 50); g.quadraticCurveTo(100, 76, 108, 96); }, SKIN[0], 3);
  for (let i = 0; i < 4; i++) vein(g, 30 + i * 32, 56 + (i % 2) * 14, 1 + i * 0.7, 26, 60 + i * 5, '#1A0202', 2, '#F97316');
  hairs(g, 20, 40, 130, 70, 22, 23, '#0A0303', 8);
  // (the ring through the middle one)
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(85, 112, 10, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = STEEL[2]; g.lineWidth = 3; g.stroke(); g.strokeStyle = STEEL[4]; g.lineWidth = 1; g.beginPath(); g.arc(85, 112, 10, Math.PI * 1.1, Math.PI * 1.5); g.stroke();
}, 170, 130);

// ---- the gore: charred meat with lava in the cracks, thorns, the ring, studs
const gore = () => sheet('demon-gore', 8, 30, (g, i) => {
  if (i < 4) {
    const pts = Array.from({ length: 7 }, (_, k) => { const a = (k / 7) * Math.PI * 2, r = 6 + rnd(i * 7 + k + 30) * 6; return [Math.cos(a) * r, Math.sin(a) * r * 0.8] as const; });
    banded(g, () => { pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); }, -12, -12, 24, 24, i < 2 ? [SKIN[4], SKIN[2], SKIN[1], SKIN[0]] : [CHAR[2], CHAR[1], '#1A0505', INK], true, INK, 2);
    stroke(g, () => { g.moveTo(-6, -2); g.lineTo(0, 2); g.lineTo(5, -3); }, '#FB923C', 1.5);
  } else if (i < 6) {
    banded(g, () => { g.moveTo(-5, 8); g.lineTo(0, -11); g.lineTo(5, 8); g.closePath(); }, -5, -11, 10, 19, [HORN[4], HORN[3], HORN[2]], false, INK, 1.5);
  } else if (i === 6) {
    g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 8, 0, Math.PI * 2); g.stroke(); g.strokeStyle = STEEL[2]; g.lineWidth = 3; g.stroke();
  } else stud(g, 0, 0, 5);
});

export const closeUp: CloseUpPaint = (c, t) => {
  const rip = t - RIP, h = handAt(t, CX, 180, { pull: 50 });
  c.save();
  c.fillStyle = INK; c.fillRect(0, 0, PANEL_W, PANEL_H);
  ripShake(c, t, 16);
  c.drawImage(body(), 0, 0);
  c.drawImage(xray(), 0, 0);
  // (the pelvis cracking open with the strain, lava glowing in the cracks)
  const ck = t - GRIP - 10;
  if (ck >= 1) {
    const n = Math.min(8, 1 + Math.floor(ck / 3));
    c.beginPath();
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (rnd(i + 11) - 0.5) * 3.1; c.moveTo(CX, 132); c.lineTo(CX + Math.cos(a) * 36, 132 + Math.sin(a) * 26); c.lineTo(CX + Math.cos(a + 0.35) * 70, 132 + Math.sin(a + 0.35) * 46); c.lineTo(CX + Math.cos(a + 0.1) * 100, 132 + Math.sin(a + 0.1) * 62); }
    c.strokeStyle = '#000'; c.lineWidth = 4; c.stroke();
    c.strokeStyle = (t >> 1) % 2 ? '#FB923C' : '#FDE047'; c.lineWidth = 1.5; c.stroke();
  }
  if (rip < 0) {
    // (the sack: hanging, breathing; clamped, then dragged down long, the scales splitting, lava weeping out)
    const sx = h.shut ? 1 - 0.22 * h.strain : 1 + Math.sin(t * 0.45) * 0.03;
    const sy = h.shut ? Math.max(1, (h.y - 100) / 80) : 1, x = h.shut ? CX + (h.x - CX) * 0.5 : CX;
    if (h.shut) drawTether(c, t, CX, 104, h.x, h.y - 40, h.strain, [INK, SKIN[2], SKIN[4]], 2, 12, 20);
    c.save(); c.translate(x, 100); c.scale(sx, sy); c.drawImage(sack(), -85, 0); c.restore();
    if (h.strain > 0.3) runs(c, (t - GRIP) * 0.6, [[x - 30, 130], [x + 26, 136], [x - 4, 150]], LAVA_RUN, 60, 2, 4);
  } else {
    // (what's left: a torn stump, the cords whipping, black lava-blood pumping out)
    stampCell(c, gore(), 2, CX - 6, 118, 0.3, 2.2);
    drawSnapped(c, rip, CX, 106, [INK, SKIN[2], SKIN[4]], LAVA[1], 2, 10, 40, 20);
    runs(c, rip - 2, [[CX - 40, 128], [CX - 14, 136], [CX + 18, 138], [CX + 44, 126], [CX - 64, 120], [CX + 70, 122]], LAVA_RUN, 120, 2.6, 6);
  }
  // (held up after: the forked sack in his fist, smoking, embers dropping off it)
  if (h.held) {
    c.save(); c.translate(h.x, h.y - 6); c.rotate(h.rot); c.scale(0.62, 0.62); c.drawImage(sack(), -85, -110); c.restore();
    smoke(c, rip, h.x, h.y - 50, 5, 9, { rise: 1.4, every: 6, life: 30, alpha: 0.6 });
  }
  drawHand(c, h, t);
  gloveGore(c, h, [LAVA[0], LAVA[1], '#7E1610']);
  if (h.held) drops(c, rip % 24, h.x, h.y + 10, 6, 5 + (rip >> 3), LAVA, { spread: 0.8, ang: Math.PI / 2, v0: 1, v1: 3, delay: 10 });
  // (the tear: black lava-blood with embers in it, gore and thorns, black smoke after)
  if (rip >= 0) {
    smoke(c, rip - 4, CX, 120, 12, 51, { rise: 1.4, every: 5, life: 60, alpha: 0.8 });
    drops(c, rip, CX, 120, 60, 31, LAVA, { spread: 3.4, v0: 4, v1: 14, delay: 8, size: 1.2 });
    sparks(c, rip, CX, 120, 34, 17, 26, ['#FDE047', '#F97316', '#FB923C'], 9);
    debris(c, gore(), 22, rip, CX, 120, { seed: 77, ang: -Math.PI / 2, spread: 3.6, v0: 4, v1: 12, grav: 0.4, delay: 3, scale: 1.3 });
    for (let i = 0; i < 14; i++) { const u = (rip * 1.5 + i * 19) % 120; const x = CX - 140 + rnd(i * 3.3) * 280 + Math.sin(u * 0.1 + i) * 8, y = 240 - u * 1.8; c.fillStyle = (t + i) % 6 < 3 ? '#FDE047' : '#F97316'; c.fillRect(x, y, 3, 3); }
  }
  c.restore();
  effort(c, t);
  bigWord(c, rip - 1, 'SKRUNCH!', CX + 120, 70, 28, '#F97316', '#1A0202');
  ripFlash(c, t, '255,140,40', PANEL_W, PANEL_H);
  // (the bit for him: his dad saw it)
  if (rip > 24) {
    const k = clamp((rip - 24) / 6);
    c.globalAlpha = k; tag(c, 'DAD WAS WATCHING', 12, 268, '#FCA5A5', 9); c.globalAlpha = 1;
  }
};
