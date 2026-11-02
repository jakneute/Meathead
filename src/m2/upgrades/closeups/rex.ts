// The cheap shot's own close-up for THE T. REX (the broken animatronic). Its underside between the two huge legs: belly
// scutes, molded rubber hide in panels (stripes, rivets, glued seams, a scuffed spot down to the steel), hydraulic rams.
// In the middle a SERVICE HATCH. It swings open (the back of the door says THANK YOU FOR NOT KICKING), and out on a
// spring-loaded piston drop the chrome robot balls on their bracket, a stenciled plate (TESTICULAR UNIT, DO NOT KICK, a
// smiley, PT# 69-420) and a little amber light on top, bobbing. The designers are silly people. Then his glove clamps on
// them and WRENCHES (ripKit.ts): the piston dragged out of its sleeve, the springs and the wiring straining, the light
// gone red, sparks off the mount, till it all tears off: the springs let go, gears and bolts fly, oil gushes, the
// warning beacons flash red; the chrome pair held up in his fist on the piston's stub. WARRANTY VOID.
//
// Still layers baked once (closeUp.ts bakeOnce); per frame the stamps plus a few dozen shapes.

import { type CloseUpPaint, PANEL_W, PANEL_H, CX, bakeOnce, clamp } from '../closeUp';
import { GRIP, RIP, handAt, drawHand, drawTether, drawSnapped, effort, ripShake, ripFlash, gloveGore } from './ripKit';
import {
  type Ramp, INK, orb, shade, inEllipse, domeLit, bands, banded, clipTo, stroke, dith, scanlines, tag, sheet,
  stampCell, debris, drops, runs, sparks, smoke, bigWord,
} from './specialKit';

type Ctx = CanvasRenderingContext2D;

// (its ramps, darkest first: adventure/dino rex.ts and art/robots.ts)
const HIDE: Ramp = ['#1E1A14', '#352C24', '#463E34', '#5E5446', '#7E725E'];
const BELLY: Ramp = ['#463824', '#6A583A', '#927C56', '#B8A278', '#DACAA0'];
const METAL: Ramp = ['#16191E', '#323842', '#545C68', '#868E9A', '#C2CAD4'];
const CHROME: Ramp = ['#18181B', '#3F3F46', '#8E8E99', '#C9CBD3', '#FAFAFA'];
const BRASS: Ramp = ['#4A2E06', '#7A520E', '#B07F1E', '#DDB24A', '#F8E08A'];
const FIBER = '#D8D0BE';
const OIL: Ramp = ['#050505', '#18140E', '#A8A29E'];
const OIL_RUN: Ramp = ['#000000', '#18140E', '#78716C'];

const HX = CX - 76, HY = 128, HW = 152, HH = 108;
const OPEN0 = 3, OPEN1 = 11, DROP = 10;

// ---- its underside: belly scutes, the legs' rubber hide, rams; the hatch's frame and the bay behind it
const body = () => bakeOnce('rex-body', g => {
  bands(g, 0, 0, PANEL_W, PANEL_H, [HIDE[2], HIDE[1], HIDE[0]]);
  // (the belly: rows of scutes, each banded, lit on top)
  for (let row = 0; row < 7; row++) {
    const y = -6 + row * 34, w = 46 + row * 2, n = Math.ceil(320 / w) + 1;
    for (let k = 0; k < n; k++) {
      const x = CX - 160 + k * w - (row % 2 ? w / 2 : 0);
      banded(g, () => g.roundRect(x + 2, y + 2, w - 4, 30, 6), x, y, w, 34, [BELLY[4], BELLY[3], BELLY[2], BELLY[1]], true, BELLY[0], 2);
    }
  }
  // (the legs: rubber hide in panels, stripes, rivets, seams)
  for (const s of [-1, 1]) {
    const leg = () => { g.moveTo(CX + s * 150, -10); g.quadraticCurveTo(CX + s * 120, 140, CX + s * 140, PANEL_H + 10); g.lineTo(CX + s * 300, PANEL_H + 10); g.lineTo(CX + s * 300, -10); g.closePath(); };
    banded(g, leg, s < 0 ? 0 : CX + 110, -10, 150, PANEL_H + 20, s < 0 ? [HIDE[3], HIDE[4], HIDE[3], HIDE[2]] : [HIDE[2], HIDE[4], HIDE[3], HIDE[2]], false, INK, 3);
    clipTo(g, leg, () => {
      for (let k = 0; k < 5; k++) { g.fillStyle = HIDE[1]; g.beginPath(); const y = 20 + k * 56; g.moveTo(CX + s * 130, y); g.quadraticCurveTo(CX + s * 200, y - 20, CX + s * 270, y + 6); g.lineTo(CX + s * 270, y + 16); g.quadraticCurveTo(CX + s * 200, y - 6, CX + s * 130, y + 12); g.fill(); }
      for (const y of [60, 150, 230]) { stroke(g, () => { g.moveTo(CX + s * 120, y); g.lineTo(CX + s * 300, y + 10); }, INK, 2); for (let x = 0; x < 6; x++) { g.fillStyle = METAL[3]; g.fillRect(CX + s * (140 + x * 24) - 2, y + 3 + x * 0.5, 3, 3); } }
      g.fillStyle = dith(g, FIBER); g.fillRect(s < 0 ? 30 : PANEL_W - 70, 180, 40, 6);
    });
    // (a ram down each leg)
    g.save(); g.translate(CX + s * 160, 0); g.rotate(-s * 0.08);
    banded(g, () => g.rect(-12, -10, 24, 140), -12, -10, 24, 140, [METAL[2], METAL[4], METAL[3], METAL[1]], false, INK, 2);
    banded(g, () => g.rect(-6, 130, 12, 160), -6, 130, 12, 160, [CHROME[3], CHROME[4], CHROME[2]], false, INK, 2);
    g.restore();
  }
  // (a scuffed spot through to the steel)
  g.fillStyle = INK; g.beginPath(); g.ellipse(70, 70, 24, 16, 0.3, 0, Math.PI * 2); g.fill();
  clipTo(g, () => g.ellipse(70, 70, 21, 13, 0.3, 0, Math.PI * 2), () => { bands(g, 48, 56, 44, 28, [METAL[3], METAL[2], METAL[1]]); stroke(g, () => { g.moveTo(54, 66); g.lineTo(86, 74); g.moveTo(58, 76); g.lineTo(80, 60); }, '#EF4444', 2); });
  tag(g, 'UNIT 03', PANEL_W - 86, 40, FIBER, 7);
  // (the hatch: a frame with hazard stripes, the bay dark behind it, the piston's housing, cables)
  g.fillStyle = INK; g.fillRect(HX - 12, HY - HH / 2 - 12, HW + 24, HH + 24);
  clipTo(g, () => g.rect(HX - 9, HY - HH / 2 - 9, HW + 18, HH + 18), () => { g.fillStyle = '#FACC15'; g.fillRect(HX - 9, HY - HH / 2 - 9, HW + 18, HH + 18); g.fillStyle = INK; for (let x = HX - 140; x < HX + HW + 20; x += 16) { g.beginPath(); g.moveTo(x, HY + 80); g.lineTo(x + 8, HY + 80); g.lineTo(x + 168, HY - 80); g.lineTo(x + 160, HY - 80); g.fill(); } });
  clipTo(g, () => g.rect(HX, HY - HH / 2, HW, HH), () => {
    bands(g, HX, HY - HH / 2, HW, HH, [METAL[1], METAL[0], '#0A0B0E']);
    for (const [col, dy] of [['#EF4444', 0], ['#3B82F6', 5], ['#22C55E', 10]] as const) stroke(g, () => { g.moveTo(HX, HY - 30 + dy); g.bezierCurveTo(HX + 40, HY + 20 + dy, HX + 100, HY - 40 + dy, HX + HW, HY + 10 + dy); }, col, 3);
    banded(g, () => g.rect(CX - 14, HY - HH / 2, 28, 26), CX - 14, HY - HH / 2, 28, 26, [METAL[2], METAL[4], METAL[3], METAL[1]], false, INK, 2);
    scanlines(g, 0.12);
  });
  // (the hinge pins down its left side)
  for (const y of [HY - 40, HY + 30]) banded(g, () => g.rect(HX - 8, y, 10, 18), HX - 8, y, 10, 18, [METAL[4], METAL[3], METAL[1]], false, INK, 2);
});

// ---- the door: front (matching belly scutes, stencil, a handle) and back (bare steel, the sticker)
const door = () => bakeOnce('rex-door', g => {
  banded(g, () => g.rect(1, 1, HW - 2, HH - 2), 0, 0, HW, HH, [BELLY[3], BELLY[2], BELLY[2], BELLY[1]], true, INK, 3);
  for (let k = 0; k < 3; k++) stroke(g, () => { g.moveTo(4, 8 + k * 34); g.lineTo(HW - 4, 8 + k * 34); }, BELLY[0], 2);
  tag(g, 'SERVICE', HW / 2, 46, '#FACC15', 8, 'center'); tag(g, 'HATCH', HW / 2, 60, '#FACC15', 8, 'center');
  banded(g, () => g.roundRect(HW - 26, HH / 2 - 14, 12, 28, 4), HW - 26, HH / 2 - 14, 12, 28, [METAL[4], METAL[3], METAL[1]], false, INK, 2);
  for (const [x, y] of [[8, 8], [HW - 8, 8], [8, HH - 8], [HW - 8, HH - 8]]) orb(g, x, y, 3, 3, METAL, INK, false);
}, HW, HH);
const doorBack = () => bakeOnce('rex-door-back', g => {
  banded(g, () => g.rect(1, 1, HW - 2, HH - 2), 0, 0, HW, HH, [METAL[3], METAL[2], METAL[1]], true, INK, 3);
  stroke(g, () => { g.moveTo(8, 8); g.lineTo(HW - 8, HH - 8); g.moveTo(HW - 8, 8); g.lineTo(8, HH - 8); }, METAL[1], 4);
  // (a bumper sticker, slapped on crooked)
  g.save(); g.translate(HW / 2, HH / 2); g.rotate(-0.08);
  banded(g, () => g.rect(-64, -22, 128, 44), -64, -22, 128, 44, ['#FFFFFF', '#E5E7EB'], true, INK, 2);
  tag(g, 'THANK YOU', 0, -8, '#DC2626', 7, 'center'); tag(g, 'FOR NOT', 0, 3, '#DC2626', 7, 'center'); tag(g, 'KICKING!', 0, 14, '#DC2626', 7, 'center');
  g.restore();
}, HW, HH);

// ---- the balls on their bracket (the plate and the amber light on it): whole, and stove in
const paintBalls = (g: Ctx, smashed: boolean) => {
  // (the bracket)
  banded(g, () => g.rect(8, 4, 124, 30), 8, 4, 124, 30, [METAL[4], METAL[3], METAL[2], METAL[1]], true, INK, 2);
  banded(g, () => g.rect(16, 8, 108, 22), 16, 8, 108, 22, [BRASS[4], BRASS[3], BRASS[2]], true, BRASS[0], 2);
  tag(g, 'TESTICULAR UNIT', 70, 17, INK, 5, 'center');
  tag(g, 'DO NOT KICK', 62, 27, '#B91C1C', 5, 'center');
  // (the smiley)
  g.fillStyle = '#FACC15'; g.beginPath(); g.arc(112, 24, 5, 0, Math.PI * 2); g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
  g.fillStyle = INK; g.fillRect(110, 22, 1, 2); g.fillRect(113, 22, 1, 2); g.beginPath(); g.arc(112, 24, 3, 0.3, Math.PI - 0.3); g.stroke();
  for (const s of [-1, 1]) {
    const x = 70 + s * 26, y = smashed ? 52 : 62, rx = smashed ? 30 : 24, ry = smashed ? 13 : 24;
    // (chrome: the sky up top, a dark horizon, the ground's warm glow under)
    g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, rx + 2, ry + 2, 0, 0, Math.PI * 2); g.fill();
    shade(g, x - rx - 1, y - ry - 1, rx * 2 + 3, ry * 2 + 3, inEllipse(x, y, rx, ry), domeLit(x, y, rx, ry, 0.15), CHROME);
    clipTo(g, () => g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2), () => {
      g.fillStyle = '#27272A'; g.fillRect(x - rx, y + ry * 0.05, rx * 2, Math.max(2, ry * 0.18));
      g.fillStyle = dith(g, '#B8A278'); g.fillRect(x - rx, y + ry * 0.4, rx * 2, ry);
      if (smashed) { stroke(g, () => { g.moveTo(x - rx + 4, y - 4); g.lineTo(x - 6, y + 2); g.lineTo(x + 2, y - 6); g.lineTo(x + rx - 6, y + 4); }, INK, 2); }
    });
    g.fillStyle = '#FFFFFF'; g.fillRect(Math.round(x - rx * 0.5), Math.round(y - ry * 0.6), 6, 3);
    if (!smashed) { g.fillStyle = METAL[1]; g.fillRect(x - 3, 34, 6, y - ry - 32); }
  }
  // (the part number on a little tag)
  banded(g, () => g.rect(56, smashed ? 64 : 84, 28, 12), 56, smashed ? 64 : 84, 28, 12, ['#FFFFFF', '#D4D4D8'], true, INK, 1.5);
  tag(g, '69-420', 70, smashed ? 73 : 93, INK, 4, 'center');
};
const balls = () => bakeOnce('rex-balls', g => paintBalls(g, false), 140, 100);
const smashedBalls = () => bakeOnce('rex-balls-smashed', g => paintBalls(g, true), 140, 100);

const junk = () => sheet('rex-junk', 8, 32, (g, i) => {
  if (i === 0) {
    g.fillStyle = INK; for (let k = 0; k < 8; k++) { g.save(); g.rotate((k / 8) * Math.PI * 2); g.fillRect(-4, -15, 8, 7); g.restore(); }
    orb(g, 0, 0, 11, 11, BRASS); for (let k = 0; k < 8; k++) { g.save(); g.rotate((k / 8) * Math.PI * 2); g.fillStyle = BRASS[3]; g.fillRect(-3, -14, 6, 5); g.restore(); }
    g.fillStyle = INK; g.beginPath(); g.arc(0, 0, 4, 0, Math.PI * 2); g.fill();
  } else if (i === 1 || i === 2) {
    for (let k = 0; k < 7; k++) { g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.ellipse(-12 + k * 4, 0, 4, 9, 0.25, 0, Math.PI * 2); g.stroke(); g.strokeStyle = CHROME[3]; g.lineWidth = 2; g.stroke(); }
  } else if (i === 3) {
    g.beginPath(); for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; g.lineTo(Math.cos(a) * 7, Math.sin(a) * 7); } g.closePath(); g.fillStyle = METAL[3]; g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); g.fillStyle = METAL[1]; g.fillRect(-2, -2, 4, 4);
  } else if (i === 4) {
    banded(g, () => { g.moveTo(-12, -6); g.lineTo(10, -8); g.lineTo(12, 6); g.lineTo(-10, 8); g.closePath(); }, -12, -8, 24, 16, [CHROME[4], CHROME[3], CHROME[2]], true, INK, 2);
  } else if (i === 5) {
    banded(g, () => { g.moveTo(-12, -6); g.quadraticCurveTo(0, -12, 12, -6); g.lineTo(10, 6); g.quadraticCurveTo(0, 0, -10, 6); g.closePath(); }, -12, -12, 24, 18, [BELLY[3], BELLY[2], BELLY[1]], true, INK, 2);
  } else if (i === 6) {
    stroke(g, () => { g.moveTo(-12, 0); g.bezierCurveTo(-4, -10, 4, 10, 12, 0); }, '#EF4444', 3); stroke(g, () => { g.moveTo(-12, 4); g.bezierCurveTo(-4, -6, 4, 14, 12, 4); }, '#3B82F6', 3);
  } else {
    // (the brass plate itself, torn off)
    banded(g, () => g.rect(-14, -6, 28, 12), -14, -6, 28, 12, [BRASS[4], BRASS[3], BRASS[2]], true, BRASS[0], 2);
    g.fillStyle = '#B91C1C'; g.fillRect(-10, -1, 20, 2);
  }
});

const spring = (c: Ctx, x: number, y0: number, y1: number, w = 10) => {
  const n = 9;
  c.beginPath(); c.moveTo(x, y0);
  for (let k = 1; k <= n; k++) c.lineTo(x + (k === n ? 0 : (k % 2 ? w : -w)), y0 + (y1 - y0) * (k / n));
  c.strokeStyle = INK; c.lineWidth = 5; c.stroke(); c.strokeStyle = CHROME[3]; c.lineWidth = 2; c.stroke();
};

export const closeUp: CloseUpPaint = (c, t) => {
  const rip = t - RIP, top = HY - HH / 2 + 26;
  const h = handAt(t, CX, top + 36 + 74, { from: 9, pull: 40 });
  c.save();
  c.fillStyle = INK; c.fillRect(0, 0, PANEL_W, PANEL_H);
  ripShake(c, t, 14);
  c.drawImage(body(), 0, 0);
  // (the balls out on their piston and springs, bobbing; clamped and dragged down, the piston stretched out of its
  // sleeve, the springs straining, sparks off the mount; torn off the end of it)
  const u = t - DROP;
  if (u >= 0 && rip < 0) {
    const len = h.shut ? Math.max(36, h.y - 74 - top) : 36 * (1 - Math.exp(-u * 0.45) * Math.cos(u * 1.1));
    const by = top + len;
    c.fillStyle = INK; c.fillRect(CX - 7, top - 2, 14, len + 4);
    c.fillStyle = CHROME[3]; c.fillRect(CX - 5, top, 10, len); c.fillStyle = CHROME[4]; c.fillRect(CX - 4, top, 2, len);
    spring(c, CX - 34, top - 6, by); spring(c, CX + 34, top - 6, by);
    if (h.shut) { sparks(c, (t - GRIP) % 6, CX, top, 3 + Math.round(h.strain * 9), t, 6); drawTether(c, t, CX, top - 4, h.x, h.y - 30, h.strain, ['#1E1B16', '#EF4444', '#FCA5A5'], 3, 3, 40); }
    const tilt = h.shut ? h.rot : Math.sin(u * 0.6) * 0.06 * Math.exp(-u * 0.15);
    c.save(); c.translate(h.shut ? h.x : CX, by); c.rotate(tilt); c.drawImage(balls(), -70, -4); c.restore();
    // (its amber light: blinking happily, then red and frantic)
    const on = h.shut ? t % 2 === 0 : (t >> 2) % 2 === 0, lx = h.shut ? h.x : CX;
    c.fillStyle = INK; c.fillRect(lx - 6, by - 10, 12, 8);
    c.fillStyle = on ? (h.shut ? '#EF4444' : '#FBBF24') : '#57534E'; c.fillRect(lx - 4, by - 9, 8, 6);
    if (on) { c.fillStyle = h.shut ? 'rgba(239,68,68,0.4)' : 'rgba(251,191,36,0.35)'; c.beginPath(); c.arc(lx, by - 6, 14, 0, Math.PI * 2); c.fill(); }
  }
  if (rip >= 0) {
    // (the snapped stub of the piston and the torn wiring, whipping, sparking; the oil after)
    drawSnapped(c, rip, CX, top - 2, [INK, CHROME[3], CHROME[4]], OIL[1], 1, 10, 30);
    drawSnapped(c, rip, CX, top - 4, ['#1E1B16', '#EF4444', '#FCA5A5'], OIL[1], 3, 3, 26, 40);
    if (rip % 5 < 2) sparks(c, rip % 5, CX, top + 24, 6, rip, 6);
    runs(c, rip, [[CX - 50, 176], [CX - 20, 180], [CX + 16, 180], [CX + 46, 176]], OIL_RUN, 80, 2.4, 5);
  }
  // (the door: swings open on its hinge, a bounce at the end; its back shows once it's past square)
  const k = clamp((t - OPEN0) / (OPEN1 - OPEN0)), ang = k * k * (3 - 2 * k) * Math.PI * 0.88 + (t > OPEN1 ? Math.sin((t - OPEN1) * 0.8) * 0.08 * Math.exp(-(t - OPEN1) * 0.25) : 0);
  const co = Math.cos(ang), sk = Math.sin(ang) * 0.18;
  c.save(); c.translate(HX, HY);
  if (co >= 0) { c.transform(Math.max(0.02, co), -sk, 0, 1, 0, 0); c.drawImage(door(), 0, -HH / 2); }
  else { c.transform(-co, sk, 0, 1, 0, 0); c.drawImage(doorBack(), -HW, -HH / 2); }
  c.restore();
  // (held up after: the chrome pair in his fist, the piston's torn stub up out of it, the light flashing red)
  if (h.held) {
    c.save(); c.translate(h.x, h.y - 10); c.rotate(h.rot); c.scale(0.7, 0.7);
    c.fillStyle = INK; c.fillRect(-7, -64, 14, 50); c.fillStyle = CHROME[3]; c.fillRect(-5, -62, 10, 48);
    c.fillStyle = '#FACC15'; c.fillRect(-7, -68, 14, 6);
    c.drawImage(smashedBalls(), -70, -18);
    if (t % 2 === 0) { c.fillStyle = '#EF4444'; c.fillRect(-4, -26, 8, 6); }
    c.restore();
  }
  drawHand(c, h, t);
  gloveGore(c, h, [OIL[0], OIL[1], '#1A1A1A']);
  if (h.held) drops(c, rip % 24, h.x, h.y + 10, 6, 7 + (rip >> 3), OIL, { spread: 0.8, ang: Math.PI / 2, v0: 1, v1: 3, delay: 10 });
  if (rip >= 0) {
    // (the springs letting go, the junk, the oil gushing out of the hatch, the sparks)
    for (const s of [-1, 1]) { const v = rip; stampCell(c, junk(), 1, CX + s * (34 + v * 9), 110 - v * 12 + 0.45 * v * v, v * 0.5 * s, 2); }
    debris(c, junk(), 24, rip, CX, 140, { seed: 5, ang: -Math.PI / 2, spread: 3.6, v0: 4, v1: 12, grav: 0.4, delay: 4, scale: 1.2, spin: 0.6 });
    stampCell(c, junk(), 7, CX + rip * 6, 128 - rip * 9 + 0.32 * rip * rip, rip * 0.4, 2.2);
    drops(c, rip, CX, 130, 48, 13, OIL, { spread: 3.2, v0: 3, v1: 13, delay: 8, size: 1.2 });
    sparks(c, rip, CX, 130, 32, 7, 18, ['#FDE047', '#FFFFFF', '#FB923C'], 11);
    smoke(c, rip - 8, CX, 120, 9, 71, { rise: 1.2, every: 6, life: 56, alpha: 0.6 });
  }
  if (t >= GRIP) {
    // (the warning beacons on the hide: red, turning)
    for (const [x, y] of [[40, 24], [PANEL_W - 40, 24]] as const) {
      const a = t * 0.5 + x;
      c.fillStyle = INK; c.fillRect(x - 10, y - 4, 20, 16); c.fillStyle = '#B91C1C'; c.fillRect(x - 8, y - 2, 16, 12);
      c.fillStyle = 'rgba(239,68,68,0.35)'; c.beginPath(); c.moveTo(x, y + 4); c.arc(x, y + 4, 90, a, a + 0.5); c.closePath(); c.fill();
      if ((t >> 1) % 2) { c.fillStyle = '#FCA5A5'; c.fillRect(x - 6, y, 6, 4); }
    }
  }
  c.restore();
  if (rip >= 0 && (t >> 2) % 2) { c.fillStyle = 'rgba(220,38,38,0.14)'; c.fillRect(0, 0, PANEL_W, PANEL_H); }
  effort(c, t);
  bigWord(c, rip - 1, 'SPROIIING!', CX + 120, 64, 24, '#FDE047', '#1E1A14');
  ripFlash(c, t, '255,200,60', PANEL_W, PANEL_H);
  if (rip > 20) tag(c, 'WARRANTY VOID', 12, 268, '#FDE047');
};
