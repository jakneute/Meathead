// The gross-ups in the intro: his "guns", then his gun, each held on screen in
// far more detail than anything else in the game (painted, not pixels: the
// cutscene draws these at full size). The arm: the bicep up like a mountain,
// veins like garden hoses, pores, hairs, stretch marks, a zit, the sweat
// beading and running. The handgun: blued steel he filed out himself,
// scrollwork, no serial number, no maker's mark, a hair stuck to the slide,
// his fist round the grip and his finger laid along the frame.
//
// Both are in the cutscene's art coordinates (256 x 144), drawn three times
// finer. They push in, very slowly, and hardly move otherwise.
//
// And in the ending, the two Meathead looks up and down: the President (the
// chins, the gut, the tie) and then the alien that was wearing him (the traps,
// the veins, the slime), the camera tilting down each and back up.

import { ALIEN } from './alienLook';
import { INK, lin, shape, speckle, hatch as hatchInk } from './art/ink';

type Ctx = CanvasRenderingContext2D;
const W = 256, H = 144;

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** The slow push in (and a lurch as it cuts in), about the middle of the frame. */
const pushIn = (ctx: Ctx, t: number, cx: number, cy: number) => {
  const z = 1.04 - 0.04 * Math.exp(-t / 5) + Math.min(t, 150) / 150 * 0.04;
  ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy);
};

/** A backdrop: a hot radial glow and rays off it, darkening to the edges. */
const backdrop = (ctx: Ctx, t: number, cx: number, cy: number, inner: string, outer: string, ray: string) => {
  const g = ctx.createRadialGradient(cx, cy, 5, cx, cy, 190);
  g.addColorStop(0, inner); g.addColorStop(1, outer);
  ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, H + 40);
  ctx.fillStyle = ray;
  const spin = t * 0.002;
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * Math.PI * 2 + spin;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 400, cy + Math.sin(a) * 400); ctx.lineTo(cx + Math.cos(a + 0.12) * 400, cy + Math.sin(a + 0.12) * 400); ctx.closePath(); ctx.fill();
  }
};

/** Dark round the edges, and a painted grain over the lot (it crawls a little). */
const finish = (ctx: Ctx, t: number) => {
  const v = ctx.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, 170);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  const seed = Math.floor(t / 4);
  for (let i = 0; i < 260; i++) {
    const x = hash(i * 3.1 + seed) * W, y = hash(i * 7.7 + seed * 1.3) * H;
    ctx.fillStyle = i % 2 ? 'rgba(255,255,240,0.05)' : 'rgba(0,0,0,0.07)';
    ctx.fillRect(x, y, 0.7, 0.7);
  }
};

/** A raised vein along a path: its shadow under it, the vein, the light along its top. It throbs. */
export const vein = (ctx: Ctx, pts: number[][], w: number, throb: number) => {
  const path = () => {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    const l = pts[pts.length - 1]; ctx.lineTo(l[0], l[1]);
  };
  const ww = w * throb;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.save(); ctx.translate(0.5, 1.1); path(); ctx.strokeStyle = 'rgba(70, 35, 12, 0.55)'; ctx.lineWidth = ww + 1.6; ctx.stroke(); ctx.restore();
  path(); ctx.strokeStyle = '#6E8A6A'; ctx.lineWidth = ww; ctx.stroke();
  path(); ctx.strokeStyle = 'rgba(96, 120, 150, 0.55)'; ctx.lineWidth = ww * 0.6; ctx.stroke();
  ctx.save(); ctx.translate(-0.3, -ww * 0.3); path(); ctx.strokeStyle = 'rgba(235, 245, 220, 0.55)'; ctx.lineWidth = Math.max(0.35, ww * 0.25); ctx.stroke(); ctx.restore();
};

/** A bead of sweat: see-through, a dark rim on the lower side, a hard white glint. */
export const bead = (ctx: Ctx, x: number, y: number, r: number) => {
  ctx.fillStyle = 'rgba(255, 245, 225, 0.28)'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 1.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(90, 50, 20, 0.45)'; ctx.lineWidth = 0.35; ctx.beginPath(); ctx.arc(x, y + r * 0.1, r * 0.95, 0.2, Math.PI - 0.2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.45, r * 0.3, 0, Math.PI * 2); ctx.fill();
};

// ---------------------------------------------------------------------------
// His guns
// ---------------------------------------------------------------------------

/** The arm, flexed: the upper arm in from the left, the peak of the bicep, the forearm up to the fist, top right. */
const armPath = (ctx: Ctx) => {
  ctx.beginPath();
  ctx.moveTo(-70, 92);
  ctx.bezierCurveTo(-40, 76, -20, 70, -10, 66);
  ctx.bezierCurveTo(22, 38, 70, 6, 122, 10);        // up over the peak
  ctx.bezierCurveTo(160, 13, 180, 34, 183, 58);     // down into the crook of the elbow
  ctx.bezierCurveTo(186, 44, 183, 30, 186, 16);     // the inside of the forearm, up
  ctx.lineTo(250, 14);                              // (under the fist)
  ctx.bezierCurveTo(258, 58, 250, 100, 232, 126);   // the back of the forearm, down to the elbow
  ctx.bezierCurveTo(206, 148, 120, 152, 50, 148);   // the underside
  ctx.lineTo(-70, 160);
  ctx.closePath();
};

export const drawGrossArm = (ctx: Ctx, t: number) => {
  ctx.save();
  backdrop(ctx, t, 120, 40, '#8A2A14', '#1A0603', 'rgba(255, 190, 120, 0.05)');
  pushIn(ctx, t, 128, 70);
  // (the whole arm in shot: the fist and all)
  ctx.translate(132, 84); ctx.scale(0.84, 0.84); ctx.translate(-128, -66);
  const throb = 1 + Math.sin(t * 0.22) * 0.12;

  // A drop shadow off it onto the glow
  ctx.save(); ctx.translate(4, 5); armPath(ctx); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(); ctx.restore();

  ctx.save();
  armPath(ctx); ctx.clip();
  // Skin: lit from above, going olive in the shadows (it's not a healthy color; it's a gross-up)
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#F2BC84'); g.addColorStop(0.45, '#C98848'); g.addColorStop(0.8, '#8A5A2C'); g.addColorStop(1, '#5A4A22');
  ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, H + 40);
  // The peak, shining; a pink flush on it; the olive under it
  let r = ctx.createRadialGradient(108, 26, 2, 108, 30, 70);
  r.addColorStop(0, 'rgba(255, 238, 205, 0.9)'); r.addColorStop(0.4, 'rgba(255, 210, 160, 0.35)'); r.addColorStop(1, 'rgba(255, 210, 160, 0)');
  ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
  r = ctx.createRadialGradient(135, 40, 2, 135, 40, 40);
  r.addColorStop(0, 'rgba(255, 110, 130, 0.22)'); r.addColorStop(1, 'rgba(255, 110, 130, 0)');
  ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
  r = ctx.createRadialGradient(100, 150, 10, 100, 150, 90);
  r.addColorStop(0, 'rgba(80, 100, 30, 0.45)'); r.addColorStop(1, 'rgba(80, 100, 30, 0)');
  ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
  // The forearm, lit down its length
  r = ctx.createRadialGradient(222, 60, 2, 222, 60, 44);
  r.addColorStop(0, 'rgba(255, 225, 185, 0.6)'); r.addColorStop(1, 'rgba(255, 225, 185, 0)');
  ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
  // Where the muscles meet: the bicep's two heads, the groove under it, the crook of the elbow
  const groove = (pts: number[], a: number, w: number) => {
    for (let k = 3; k >= 1; k--) {
      ctx.strokeStyle = `rgba(80, 40, 14, ${a / k})`; ctx.lineWidth = w * k;
      ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); ctx.bezierCurveTo(pts[2], pts[3], pts[4], pts[5], pts[6], pts[7]); ctx.stroke();
    }
  };
  groove([4, 98, 60, 88, 130, 96, 186, 92], 0.4, 1.4);
  groove([60, 44, 90, 40, 120, 52, 150, 70], 0.22, 1.2);
  groove([176, 70, 190, 80, 200, 96, 214, 118], 0.35, 1.3);
  groove([196, 30, 206, 60, 208, 90, 212, 112], 0.2, 1);
  // Hatching down in the shadows: under the peak, along the underside, down the back of the forearm
  const hatch = (x1: number, x2: number, yAt: (x: number) => number, len: number, a: number) => {
    ctx.strokeStyle = `rgba(60, 28, 8, ${a})`; ctx.lineWidth = 0.4;
    for (let x = x1; x < x2; x += 1.8) { const y = yAt(x) + hash(x) * 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len * 0.45, y + len); ctx.stroke(); }
  };
  hatch(-10, 186, x => 88 - Math.sin(Math.PI * (x + 10) / 196) * 8, 9, 0.32);
  hatch(-10, 200, x => 118 + Math.sin(Math.PI * (x + 10) / 210) * 10, 12, 0.28);
  hatch(60, 170, x => 58 + (x - 60) * 0.12, 6, 0.18);
  for (let y = 40; y < 122; y += 2) { const x = 236 + (y - 40) * -0.05; ctx.strokeStyle = 'rgba(60, 28, 8, 0.28)'; ctx.lineWidth = 0.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 10, y + 3); ctx.stroke(); }
  // Stretch marks up by the armpit, where he's grown faster than his skin has
  for (let k = 0; k < 7; k++) {
    const y = 72 + k * 4.2, x = 2 + k * 2;
    ctx.strokeStyle = 'rgba(190, 95, 140, 0.45)'; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + 10, y - 3, x + 20, y + 2, x + 32 - k * 2, y - 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 210, 230, 0.35)'; ctx.lineWidth = 0.35; ctx.stroke();
  }
  // Pores, everywhere
  for (let i = 0; i < 1400; i++) {
    const x = hash(i * 1.37) * 330 - 70, y = hash(i * 2.91) * 160;
    ctx.fillStyle = i % 3 ? 'rgba(90, 45, 15, 0.32)' : 'rgba(255, 230, 200, 0.18)';
    ctx.fillRect(x, y, 0.45, 0.45);
  }
  // The veins, standing up off it like hoses (throbbing)
  vein(ctx, [[-4, 84], [26, 70], [58, 50], [90, 38], [124, 34], [150, 40]], 3.8, throb);
  vein(ctx, [[58, 50], [72, 62], [94, 66], [116, 76]], 2.5, throb);
  vein(ctx, [[90, 38], [104, 22], [120, 16]], 2.0, throb);
  vein(ctx, [[124, 34], [146, 56], [168, 72], [182, 80]], 2.8, throb);
  vein(ctx, [[222, 120], [218, 96], [214, 70], [218, 46], [214, 24]], 3.3, throb);
  vein(ctx, [[216, 82], [230, 66], [236, 44]], 2.0, throb);
  vein(ctx, [[214, 58], [202, 44], [198, 26]], 1.7, throb);
  // Hairs, the odd one, curling
  ctx.strokeStyle = 'rgba(40, 22, 10, 0.85)'; ctx.lineWidth = 0.35;
  for (let i = 0; i < 90; i++) {
    const x = hash(i * 5.3) * 250, y = 40 + hash(i * 8.1) * 105, a = hash(i * 3.3) * 1.2 - 0.3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * 1.8, y + Math.sin(a) * 1.8 - 1, x + Math.cos(a) * 3.2, y + Math.sin(a) * 3.2 + 0.4); ctx.stroke();
  }
  // A zit, ripe, right on the peak
  r = ctx.createRadialGradient(80, 40, 0.3, 80, 40, 3.6);
  r.addColorStop(0, 'rgba(230, 70, 60, 0.9)'); r.addColorStop(1, 'rgba(230, 70, 60, 0)');
  ctx.fillStyle = r; ctx.beginPath(); ctx.arc(80, 40, 3.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F5E6A8'; ctx.beginPath(); ctx.arc(80, 39.6, 1.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(79.5, 39, 0.5, 0.5);
  // The spiked wristband up by the fist
  ctx.fillStyle = '#16110E'; ctx.beginPath(); ctx.moveTo(184, 30); ctx.lineTo(252, 28); ctx.lineTo(253, 40); ctx.lineTo(185, 42); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(185, 30, 67, 1);
  for (let k = 0; k < 6; k++) {
    const sx = 192 + k * 10.5, sy = 35;
    const sg = ctx.createRadialGradient(sx - 0.8, sy - 1, 0.2, sx, sy, 3);
    sg.addColorStop(0, '#FFFFFF'); sg.addColorStop(0.35, '#C4C8CE'); sg.addColorStop(1, '#3B4048');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(sx - 3, sy + 2.5); ctx.lineTo(sx, sy - 4); ctx.lineTo(sx + 3, sy + 2.5); ctx.closePath(); ctx.fill();
  }
  // Sweat: beaded all over the peak, one running down (a wet trail behind it)
  for (let i = 0; i < 26; i++) {
    const x = 30 + hash(i * 9.7) * 170, y = 18 + hash(i * 4.3) * 70;
    bead(ctx, x, y, 0.8 + hash(i * 6.1) * 1.3);
  }
  const run = (t * 0.35) % 70, rx = 112 + Math.sin(run * 0.1) * 2;
  ctx.strokeStyle = 'rgba(255, 245, 225, 0.25)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(110, 22); ctx.quadraticCurveTo(113, 22 + run / 2, rx, 24 + run); ctx.stroke();
  bead(ctx, rx, 25 + run, 1.9);
  ctx.restore();

  // The fist, up top right, curled in toward his head: the knuckle ridge along the top, the fingers rolled under it
  // (creases at every joint, hair on the knuckles), the thumb clamped across the front of them
  ctx.save();
  const fg = ctx.createLinearGradient(184, -18, 250, 26);
  fg.addColorStop(0, '#F2BA80'); fg.addColorStop(0.55, '#C98848'); fg.addColorStop(1, '#7E5226');
  ctx.beginPath(); ctx.roundRect(182, -20, 70, 46, 16); ctx.fillStyle = fg; ctx.fill();
  ctx.strokeStyle = '#2B1407'; ctx.lineWidth = 2.2; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.roundRect(182, -20, 70, 46, 16); ctx.clip();
  for (let k = 0; k < 4; k++) {
    const fx = 186 + k * 16;
    // The finger, rolled: a lit middle, a crease either side
    const rg = ctx.createLinearGradient(fx, 0, fx + 16, 0);
    rg.addColorStop(0, 'rgba(90, 45, 15, 0.45)'); rg.addColorStop(0.45, 'rgba(255, 225, 185, 0.35)'); rg.addColorStop(1, 'rgba(90, 45, 15, 0.5)');
    ctx.fillStyle = rg; ctx.fillRect(fx, -10, 16, 30);
    ctx.strokeStyle = '#2B1407'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(fx + 16, -8); ctx.quadraticCurveTo(fx + 17, 6, fx + 16, 22); ctx.stroke();
    // Its middle joint: a knot of wrinkles
    ctx.strokeStyle = 'rgba(80, 40, 14, 0.65)'; ctx.lineWidth = 0.45;
    for (let c = 0; c < 4; c++) { ctx.beginPath(); ctx.moveTo(fx + 3, 3 + c * 1.2); ctx.quadraticCurveTo(fx + 8, 1.5 + c * 1.2, fx + 13, 3 + c * 1.2); ctx.stroke(); }
    // The knuckle up top, shining, with its hairs
    ctx.fillStyle = 'rgba(255, 232, 200, 0.55)'; ctx.beginPath(); ctx.ellipse(fx + 8, -14, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(40, 22, 10, 0.85)'; ctx.lineWidth = 0.3;
    for (let h = 0; h < 5; h++) { ctx.beginPath(); ctx.moveTo(fx + 3 + h * 2.4, -10); ctx.quadraticCurveTo(fx + 4 + h * 2.4, -12.5, fx + 5.5 + h * 2.4, -12); ctx.stroke(); }
  }
  // The ridge line between the knuckles and the fingers
  ctx.strokeStyle = 'rgba(60, 28, 8, 0.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(184, -8); ctx.bezierCurveTo(205, -11, 230, -11, 252, -8); ctx.stroke();
  ctx.restore();
  // The thumb, across the front, its nail (chewed)
  ctx.beginPath(); ctx.moveTo(252, 26); ctx.bezierCurveTo(240, 12, 222, 10, 204, 14); ctx.quadraticCurveTo(196, 16, 198, 21); ctx.quadraticCurveTo(210, 24, 228, 26); ctx.closePath();
  const tg = ctx.createLinearGradient(0, 10, 0, 26); tg.addColorStop(0, '#F5C58E'); tg.addColorStop(1, '#A56A34');
  ctx.fillStyle = tg; ctx.fill(); ctx.strokeStyle = '#2B1407'; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.fillStyle = '#E6CDB8'; ctx.beginPath(); ctx.ellipse(204, 17, 4, 2.6, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(90, 60, 40, 0.8)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(200.5, 16); ctx.lineTo(201.5, 18.5); ctx.lineTo(202.5, 16.5); ctx.stroke();
  ctx.strokeStyle = 'rgba(80, 40, 14, 0.6)'; ctx.lineWidth = 0.45; for (let c = 0; c < 3; c++) { ctx.beginPath(); ctx.arc(226, 18 + c, 3 - c * 0.6, 0.4, Math.PI - 0.4); ctx.stroke(); }
  ctx.restore();

  // Outline (thick, the way it is in a gross-up), a hot rim light along the top of it
  armPath(ctx); ctx.strokeStyle = '#2B1407'; ctx.lineWidth = 2.4; ctx.stroke();
  ctx.save(); ctx.translate(0.8, 1.4); ctx.beginPath(); ctx.moveTo(-8, 66); ctx.bezierCurveTo(22, 38, 70, 6, 122, 10); ctx.bezierCurveTo(160, 13, 180, 34, 183, 58);
  ctx.strokeStyle = 'rgba(255, 225, 170, 0.7)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
  ctx.restore();
  finish(ctx, t);
};

// ---------------------------------------------------------------------------
// His gun
// ---------------------------------------------------------------------------

/** Blued steel, lit from above: a hard highlight band near the top, going dark to the bottom. */
const steel = (ctx: Ctx, y1: number, y2: number) => {
  const g = ctx.createLinearGradient(0, y1, 0, y2);
  g.addColorStop(0, '#6B7888'); g.addColorStop(0.12, '#D8E0E8'); g.addColorStop(0.24, '#56626F');
  g.addColorStop(0.6, '#2C343E'); g.addColorStop(1, '#10151B');
  return g;
};

export const drawGrossGun = (ctx: Ctx, t: number) => {
  ctx.save();
  backdrop(ctx, t, 150, 55, '#1E4A73', '#03070D', 'rgba(170, 210, 255, 0.05)');
  pushIn(ctx, t, 140, 60);
  const ink = '#06080B';

  // Drop shadow
  ctx.save(); ctx.translate(4, 5); ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(34, 24, 206, 40); ctx.beginPath(); ctx.moveTo(58, 62); ctx.lineTo(112, 62); ctx.lineTo(100, 150); ctx.lineTo(36, 150); ctx.closePath(); ctx.fill();
  ctx.restore();

  // The grip: walnut panels, the grain, a diamond of checkering, a screw
  ctx.save();
  ctx.beginPath(); ctx.moveTo(56, 60); ctx.lineTo(114, 60); ctx.lineTo(102, 150); ctx.lineTo(34, 150); ctx.closePath();
  ctx.fillStyle = steel(ctx, 60, 150); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(62, 66); ctx.lineTo(106, 66); ctx.lineTo(96, 150); ctx.lineTo(42, 150); ctx.closePath();
  const wg = ctx.createLinearGradient(40, 66, 110, 150); wg.addColorStop(0, '#7A4A26'); wg.addColorStop(0.5, '#5A3218'); wg.addColorStop(1, '#3A1E0C');
  ctx.fillStyle = wg; ctx.fill(); ctx.clip();
  ctx.strokeStyle = 'rgba(30, 14, 4, 0.45)'; ctx.lineWidth = 0.5;
  for (let k = 0; k < 16; k++) { ctx.beginPath(); ctx.moveTo(40, 66 + k * 6); ctx.bezierCurveTo(60, 60 + k * 6 + hash(k) * 8, 80, 72 + k * 6, 110, 64 + k * 6 + hash(k * 3) * 6); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(20, 10, 2, 0.5)'; ctx.lineWidth = 0.35;
  for (let k = -20; k < 30; k++) { ctx.beginPath(); ctx.moveTo(50 + k * 2.2, 74); ctx.lineTo(80 + k * 2.2, 130); ctx.stroke(); ctx.beginPath(); ctx.moveTo(80 + k * 2.2, 74); ctx.lineTo(50 + k * 2.2, 130); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255, 220, 170, 0.12)'; ctx.fillRect(40, 66, 80, 6);
  ctx.restore();
  const screw = (x: number, y: number, r: number) => {
    const sg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0.2, x, y, r);
    sg.addColorStop(0, '#F1F5F9'); sg.addColorStop(0.5, '#8C96A2'); sg.addColorStop(1, '#2A3139');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = ink; ctx.lineWidth = 0.5; ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(x - r * 0.7, y + r * 0.3); ctx.lineTo(x + r * 0.7, y - r * 0.3); ctx.stroke();
  };
  screw(74, 90, 2.6);

  // The frame under the slide, the trigger guard, the trigger
  ctx.beginPath(); ctx.moveTo(56, 56); ctx.lineTo(206, 56); ctx.lineTo(206, 68); ctx.lineTo(150, 70); ctx.quadraticCurveTo(140, 70, 136, 76); ctx.lineTo(114, 76); ctx.lineTo(114, 62); ctx.lineTo(56, 62); ctx.closePath();
  ctx.fillStyle = steel(ctx, 56, 76); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(114, 74); ctx.quadraticCurveTo(116, 98, 136, 98); ctx.quadraticCurveTo(156, 98, 152, 70);
  ctx.strokeStyle = '#2C343E'; ctx.lineWidth = 4; ctx.stroke(); ctx.strokeStyle = 'rgba(210, 222, 235, 0.5)'; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(128, 72); ctx.quadraticCurveTo(122, 82, 126, 92); ctx.lineTo(129, 92); ctx.quadraticCurveTo(127, 82, 132, 72); ctx.closePath();
  ctx.fillStyle = '#9AA5B1'; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 0.7; ctx.stroke();
  // Where the serial number goes: nothing. Filed bright by hand, the file marks still in it
  ctx.fillStyle = 'rgba(200, 212, 224, 0.35)'; ctx.fillRect(160, 59, 36, 7);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 0.25;
  for (let k = 0; k < 24; k++) { ctx.beginPath(); ctx.moveTo(160 + k * 1.5, 66); ctx.lineTo(163 + k * 1.5, 59); ctx.stroke(); }
  screw(172, 72, 1.6); screw(96, 59, 1.4);

  // The hammer, cocked, checkered
  ctx.beginPath(); ctx.moveTo(40, 34); ctx.lineTo(30, 20); ctx.quadraticCurveTo(28, 14, 34, 14); ctx.lineTo(44, 28); ctx.closePath();
  ctx.fillStyle = steel(ctx, 14, 34); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 0.3; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(30 + k * 1.2, 15 + k * 1.6); ctx.lineTo(35 + k * 1.2, 15 + k * 1.6); ctx.stroke(); }

  // The slide: the full length of the thing, the barrel's crown out the front of it
  ctx.beginPath(); ctx.moveTo(36, 26); ctx.lineTo(236, 26); ctx.quadraticCurveTo(242, 26, 242, 32); ctx.lineTo(242, 56); ctx.lineTo(36, 56); ctx.closePath();
  ctx.fillStyle = steel(ctx, 26, 56); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 1.8; ctx.stroke();
  // Serrations at the back, slanted
  for (let k = 0; k < 14; k++) {
    const sx = 44 + k * 2.4;
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.beginPath(); ctx.moveTo(sx, 30); ctx.lineTo(sx + 1.1, 30); ctx.lineTo(sx + 2.4, 54); ctx.lineTo(sx + 1.3, 54); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(220, 230, 240, 0.35)'; ctx.fillRect(sx + 1.1, 30, 0.4, 3);
  }
  // The ejection port, the barrel's hood showing through it (brass-bright where it rubs)
  ctx.fillStyle = '#0B0F14'; ctx.fillRect(150, 29, 34, 12);
  const bh = ctx.createLinearGradient(0, 30, 0, 40); bh.addColorStop(0, '#E9C46A'); bh.addColorStop(1, '#7A5A1C');
  ctx.fillStyle = bh; ctx.fillRect(152, 32, 30, 7);
  ctx.strokeStyle = ink; ctx.lineWidth = 0.8; ctx.strokeRect(150, 29, 34, 12);
  // Sights: dots on them, white
  ctx.fillStyle = '#1B222A'; ctx.fillRect(38, 20, 12, 6); ctx.fillRect(226, 21, 7, 5);
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(41.5, 23, 0.9, 0, Math.PI * 2); ctx.arc(46.5, 23, 0.9, 0, Math.PI * 2); ctx.arc(229.5, 23.2, 0.9, 0, Math.PI * 2); ctx.fill();
  // The crown and the bore
  ctx.fillStyle = '#1B222A'; ctx.beginPath(); ctx.ellipse(242, 47, 3, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(242.5, 47, 1.5, 3.4, 0, 0, Math.PI * 2); ctx.fill();
  // Scrollwork, cut into the slide by hand, and in the middle of it a little flexing arm: the only mark on it
  ctx.strokeStyle = 'rgba(235, 238, 220, 0.55)'; ctx.lineWidth = 0.4;
  const scroll = (x: number, y: number, s: number, dir: number) => {
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 3.2; a += 0.15) { const rr = s * (1 - a / (Math.PI * 3.6)); const px = x + Math.cos(a) * rr * dir, py = y + Math.sin(a) * rr; if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
    ctx.stroke();
  };
  for (let k = 0; k < 5; k++) { scroll(88 + k * 11, 40 + (k % 2 ? 4 : -2), 4.5, k % 2 ? 1 : -1); scroll(186 + k * 9, 48 + (k % 2 ? -3 : 2), 3.6, k % 2 ? -1 : 1); }
  ctx.beginPath(); ctx.moveTo(84, 49); ctx.bezierCurveTo(100, 54, 124, 54, 146, 49); ctx.stroke();
  ctx.save(); ctx.translate(140, 40); ctx.strokeStyle = 'rgba(245, 240, 210, 0.75)'; ctx.lineWidth = 0.55;
  ctx.beginPath(); ctx.moveTo(-5, 3); ctx.quadraticCurveTo(-3, -3, 1, -2); ctx.quadraticCurveTo(3, 1, 2, 3); ctx.lineTo(-5, 3); ctx.stroke(); // (the bicep)
  ctx.beginPath(); ctx.moveTo(2, 1); ctx.lineTo(3, -4); ctx.arc(3, -5, 1, 0, Math.PI * 2); ctx.stroke(); // (forearm, fist)
  ctx.restore();
  // His fingerprints all over it, and a hair stuck to it (his)
  ctx.strokeStyle = 'rgba(200, 210, 220, 0.14)'; ctx.lineWidth = 0.3;
  for (let k = 1; k < 7; k++) { ctx.beginPath(); ctx.ellipse(208, 38, k * 1.4, k * 1.0, 0.4, 0.2, Math.PI * 1.8); ctx.stroke(); ctx.beginPath(); ctx.ellipse(118, 44, k * 1.2, k * 0.9, -0.3, 0.5, Math.PI * 1.9); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(15, 8, 4, 0.9)'; ctx.lineWidth = 0.3;
  ctx.beginPath(); ctx.moveTo(160, 48); ctx.bezierCurveTo(165, 44, 168, 52, 174, 47); ctx.bezierCurveTo(177, 45, 179, 49, 182, 48); ctx.stroke();
  // The highlight running the length of the top edge, and a glint that travels down it
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(38, 27.2, 200, 0.6);
  const gx = 40 + ((t * 2.6) % 260);
  if (gx < 238) {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.moveTo(gx - 7, 27.5); ctx.lineTo(gx, 26.6); ctx.lineTo(gx + 7, 27.5); ctx.lineTo(gx, 28.4); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(gx - 0.8, 21); ctx.lineTo(gx, 27.5); ctx.lineTo(gx + 0.8, 34); ctx.lineTo(gx, 27.5); ctx.closePath(); ctx.fill();
  }

  // His fist round the grip, his finger laid straight along the frame (off the trigger: he knows what he's doing)
  ctx.save();
  const skin = (y1: number, y2: number) => { const g = ctx.createLinearGradient(0, y1, 0, y2); g.addColorStop(0, '#F0B67C'); g.addColorStop(0.6, '#B8783E'); g.addColorStop(1, '#6E4A22'); return g; };
  ctx.beginPath(); ctx.moveTo(112, 60); ctx.lineTo(176, 60); ctx.quadraticCurveTo(182, 60, 182, 64.5); ctx.quadraticCurveTo(182, 69, 176, 69); ctx.lineTo(116, 70); ctx.closePath();
  ctx.fillStyle = skin(60, 70); ctx.fill(); ctx.strokeStyle = '#2B1407'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.strokeStyle = 'rgba(80, 40, 14, 0.6)'; ctx.lineWidth = 0.5; for (const kx of [136, 158]) { ctx.beginPath(); ctx.moveTo(kx, 61); ctx.quadraticCurveTo(kx - 1.5, 64.5, kx, 68.5); ctx.stroke(); }
  ctx.fillStyle = '#D9B8A0'; ctx.fillRect(174, 61.5, 6, 5); ctx.strokeStyle = 'rgba(60, 40, 20, 0.6)'; ctx.lineWidth = 0.4; ctx.strokeRect(174, 61.5, 6, 5);
  // The fingers wrapped round the front of the grip, one under another, the palm and the heel of the hand round the back
  ctx.beginPath(); ctx.moveTo(26, 96); ctx.bezierCurveTo(20, 84, 40, 70, 60, 74); ctx.lineTo(60, 150); ctx.lineTo(20, 150); ctx.closePath();
  ctx.fillStyle = skin(70, 150); ctx.fill(); ctx.strokeStyle = '#2B1407'; ctx.lineWidth = 1.6; ctx.stroke();
  for (let k = 0; k < 3; k++) {
    const fy = 100 + k * 17;
    ctx.beginPath(); ctx.moveTo(98, fy); ctx.quadraticCurveTo(122, fy - 1, 124, fy + 7); ctx.quadraticCurveTo(122, fy + 15, 96, fy + 15); ctx.closePath();
    ctx.fillStyle = skin(fy, fy + 15); ctx.fill(); ctx.strokeStyle = '#2B1407'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = 'rgba(255, 225, 185, 0.45)'; ctx.beginPath(); ctx.ellipse(112, fy + 4, 8, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(80, 40, 14, 0.6)'; ctx.lineWidth = 0.45; for (let c = 0; c < 3; c++) { ctx.beginPath(); ctx.arc(116, fy + 7, 2.5 - c * 0.6, -1.2, 1.2); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(40, 22, 10, 0.8)'; ctx.lineWidth = 0.3; for (let h = 0; h < 5; h++) { ctx.beginPath(); ctx.moveTo(102 + h * 3, fy + 1); ctx.lineTo(103 + h * 3, fy - 1.5); ctx.stroke(); }
    ctx.fillStyle = '#D9B8A0'; ctx.beginPath(); ctx.ellipse(121.5, fy + 9, 2, 3, 0.2, 0, Math.PI * 2); ctx.fill();
  }
  // Sweat on the knuckles, and a drop of it gathering on the bottom one and letting go
  for (let i = 0; i < 9; i++) bead(ctx, 100 + hash(i * 4.4) * 22, 102 + hash(i * 2.2) * 46, 0.7 + hash(i) * 0.9);
  const drip = (t * 0.6) % 60;
  bead(ctx, 108, 146 + Math.max(0, drip - 30) * 1.5, 1.2 + Math.min(drip, 30) / 30 * 0.8);
  ctx.restore();
  ctx.restore();
  finish(ctx, t);
};

// ---------------------------------------------------------------------------
// The President, as Meathead looks him up and down
// ---------------------------------------------------------------------------

/** How tall the painting is (art units): the camera tilts down it and back up. */
const PRES_H = 330, PRES_TOP = 36;

/** Where the tilt's got to (0 the chins, 1 the belt): down, a beat, back up (not all the way). */
const presTilt = (t: number) => {
  const ease = (k: number) => k * k * (3 - 2 * k);
  if (t < 15) return 0;
  if (t < 95) return ease((t - 15) / 80);
  if (t < 112) return 1;
  if (t < 172) return 1 - ease((t - 112) / 60) * 0.85;
  return 0.15;
};

export const drawGrossPresident = (ctx: Ctx, t: number) => {
  ctx.save();
  backdrop(ctx, t, 128, 60, '#233B8C', '#060A1C', 'rgba(255, 255, 255, 0.04)');
  // (starting on the pout, down to the belt)
  ctx.translate(0, PRES_TOP - presTilt(t) * (PRES_H + PRES_TOP - H));
  const ink = '#1A0B06';

  // --- The trousers and the belt, down under all of it (the overhang covers most of it) ---
  ctx.fillStyle = '#191C30'; ctx.fillRect(40, 286, 176, 60);
  ctx.fillStyle = '#0C0D18'; ctx.fillRect(40, 286, 176, 10);
  ctx.fillStyle = '#3A2414'; ctx.fillRect(44, 290, 168, 8);

  // --- The jacket: open, because it hasn't closed in years; pinstripes, creases, the flag pin ---
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.beginPath();
    if (side < 0) { ctx.moveTo(-10, 80); ctx.lineTo(84, 88); ctx.bezierCurveTo(60, 160, 40, 240, 46, 300); ctx.lineTo(-10, 300); }
    else { ctx.moveTo(266, 80); ctx.lineTo(172, 88); ctx.bezierCurveTo(196, 160, 216, 240, 210, 300); ctx.lineTo(266, 300); }
    ctx.closePath();
    const jg = ctx.createLinearGradient(side < 0 ? 0 : 256, 0, side < 0 ? 80 : 176, 0);
    jg.addColorStop(0, '#0E1230'); jg.addColorStop(1, '#262E66');
    ctx.fillStyle = jg; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 1.8; ctx.stroke();
    ctx.clip();
    ctx.strokeStyle = 'rgba(160, 170, 220, 0.12)'; ctx.lineWidth = 0.35;
    for (let x = -10; x < 270; x += 5) { ctx.beginPath(); ctx.moveTo(x, 80); ctx.lineTo(x + side * -6, 300); ctx.stroke(); }
    // (creases where it's pulled tight across him)
    ctx.strokeStyle = 'rgba(0, 0, 10, 0.45)'; ctx.lineWidth = 0.8;
    for (let k = 0; k < 6; k++) { const y = 140 + k * 22; ctx.beginPath(); ctx.moveTo(side < 0 ? 10 : 246, y); ctx.quadraticCurveTo(side < 0 ? 40 : 216, y - 10, side < 0 ? 60 : 196, y + 6); ctx.stroke(); }
    ctx.restore();
    // The lapel
    ctx.beginPath();
    if (side < 0) { ctx.moveTo(84, 88); ctx.lineTo(56, 104); ctx.lineTo(66, 150); ctx.lineTo(80, 130); }
    else { ctx.moveTo(172, 88); ctx.lineTo(200, 104); ctx.lineTo(190, 150); ctx.lineTo(176, 130); }
    ctx.closePath(); ctx.fillStyle = '#303A7A'; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.stroke();
  }
  // (the flag pin)
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(62, 118, 9, 6);
  ctx.fillStyle = '#C8201C'; for (let k = 0; k < 3; k++) ctx.fillRect(62, 118 + k * 2, 9, 1);
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(62, 118, 4, 3);
  ctx.strokeStyle = '#D4AF37'; ctx.lineWidth = 0.5; ctx.strokeRect(62, 118, 9, 6);

  // --- The shirt, the gut in it: bulging out between the jacket, down over the belt ---
  const gut = () => {
    ctx.beginPath();
    ctx.moveTo(84, 88); ctx.bezierCurveTo(52, 150, 26, 230, 60, 280);
    ctx.bezierCurveTo(90, 304, 166, 304, 196, 280);
    ctx.bezierCurveTo(230, 230, 204, 150, 172, 88);
    ctx.closePath();
  };
  gut();
  const sg = ctx.createRadialGradient(118, 200, 10, 128, 200, 120);
  sg.addColorStop(0, '#FFFFFF'); sg.addColorStop(0.55, '#E6E3D8'); sg.addColorStop(1, '#9A9CA8');
  ctx.fillStyle = sg; ctx.fill();
  ctx.save(); gut(); ctx.clip();
  // Sweat through it, under the arms and under the gut
  ctx.fillStyle = 'rgba(190, 170, 110, 0.25)';
  ctx.beginPath(); ctx.ellipse(56, 150, 18, 28, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(200, 150, 18, 28, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(128, 292, 70, 12, 0, 0, Math.PI * 2); ctx.fill();
  // The buttons, straining: each one pulling the cloth into a star of creases, a gap under it with the undershirt
  // showing through, the thread giving
  [124, 162, 200, 238, 272].forEach((by, i) => {
    const strain = 1 + (i === 2 ? 0.4 : 0) + Math.sin(t * 0.35 + i) * 0.15;
    ctx.strokeStyle = 'rgba(80, 80, 100, 0.45)'; ctx.lineWidth = 0.5;
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2 + 0.2, len = (9 + (a % 3) * 4) * strain;
      ctx.beginPath(); ctx.moveTo(142, by); ctx.quadraticCurveTo(142 + Math.cos(ang) * len * 0.6, by + Math.sin(ang) * len * 0.4 + 2, 142 + Math.cos(ang) * len, by + Math.sin(ang) * len * 0.6); ctx.stroke();
    }
    ctx.fillStyle = '#F4F1E6'; ctx.beginPath(); ctx.ellipse(142, by + 12, 5 * strain, 3 * strain, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(70, 70, 90, 0.7)'; ctx.lineWidth = 0.5; ctx.stroke();
    const bg = ctx.createRadialGradient(141, by - 0.5, 0.2, 142, by, 2.4);
    bg.addColorStop(0, '#FFFFFF'); bg.addColorStop(1, '#B8B2A0');
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(142, by, 2.3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(60, 60, 60, 0.7)'; ctx.lineWidth = 0.35; ctx.stroke();
    ctx.fillStyle = 'rgba(60,60,60,0.8)'; ctx.fillRect(141.2, by - 0.4, 0.5, 0.5); ctx.fillRect(142.4, by - 0.4, 0.5, 0.5);
    ctx.strokeStyle = 'rgba(240, 240, 230, 0.9)'; ctx.lineWidth = 0.25; ctx.beginPath(); ctx.moveTo(142, by + 2); ctx.lineTo(141 + Math.sin(t * 0.5 + i) * 0.6, by + 4); ctx.stroke();
  });
  // Folds round the sides of it, where it rolls
  ctx.strokeStyle = 'rgba(90, 90, 110, 0.35)'; ctx.lineWidth = 0.7;
  for (let k = 0; k < 7; k++) { const y = 150 + k * 18; ctx.beginPath(); ctx.moveTo(40 + k * 2, y); ctx.quadraticCurveTo(70, y + 8, 88, y + 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(216 - k * 2, y); ctx.quadraticCurveTo(186, y + 8, 168, y + 2); ctx.stroke(); }
  ctx.restore();
  gut(); ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.stroke();
  // The shadow the overhang throws on the belt
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.ellipse(128, 300, 70, 5, 0, 0, Math.PI * 2); ctx.fill();

  // --- The tie: far too long, taped at the back, lunch down it, the tip hanging past the belt ---
  ctx.beginPath(); ctx.moveTo(122, 96); ctx.lineTo(134, 96); ctx.lineTo(140, 300); ctx.lineTo(128, 318); ctx.lineTo(116, 300); ctx.closePath();
  const tg = ctx.createLinearGradient(116, 0, 140, 0);
  tg.addColorStop(0, '#8A1410'); tg.addColorStop(0.45, '#E0302A'); tg.addColorStop(1, '#8A1410');
  ctx.fillStyle = tg; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 170, 160, 0.2)'; ctx.lineWidth = 0.35;
  for (let y = 100; y < 300; y += 3) { ctx.beginPath(); ctx.moveTo(121, y); ctx.lineTo(135, y + 5); ctx.stroke(); }
  // (the tape, where the back end's stuck down: see-through, a glint on it)
  ctx.fillStyle = 'rgba(235, 240, 245, 0.35)'; ctx.fillRect(119, 150, 18, 7);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 0.4; ctx.strokeRect(119, 150, 18, 7);
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(121, 151, 5, 0.6);
  // (ketchup, a drip of mustard, crumbs)
  ctx.fillStyle = '#B4200C'; ctx.beginPath(); ctx.ellipse(130, 208, 4, 3, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255, 140, 120, 0.6)'; ctx.fillRect(128.5, 206.5, 1.2, 0.8);
  ctx.fillStyle = '#E8B418'; ctx.beginPath(); ctx.moveTo(124, 226); ctx.quadraticCurveTo(122, 234, 124, 240); ctx.quadraticCurveTo(126, 234, 125.5, 226); ctx.fill();
  ctx.fillStyle = '#C89A5A'; for (let k = 0; k < 7; k++) ctx.fillRect(120 + hash(k * 3.3) * 16, 240 + hash(k * 7.1) * 40, 1, 0.8);

  // --- Tiny hands, hanging out of the sleeves at his sides ---
  for (const side of [-1, 1]) {
    const hx = side < 0 ? 30 : 226, hy = 286;
    ctx.fillStyle = '#0E1230'; ctx.fillRect(hx - 12, hy - 18, 24, 14);
    ctx.fillStyle = '#F4F1E6'; ctx.fillRect(hx - 10, hy - 6, 20, 4);
    ctx.fillStyle = '#E8844A'; ctx.beginPath(); ctx.roundRect(hx - 6, hy - 2, 12, 9, 3); ctx.fill();
    ctx.strokeStyle = ink; ctx.lineWidth = 0.7; ctx.stroke();
    for (let f = 0; f < 4; f++) { ctx.fillStyle = '#E8844A'; ctx.beginPath(); ctx.roundRect(hx - 5.5 + f * 2.9, hy + 6, 2.4, 3.5, 1); ctx.fill(); ctx.stroke(); }
  }

  // --- The chins, spilling over a collar that won't close ---
  // The collar, and the tie's knot jammed up into it
  ctx.beginPath(); ctx.moveTo(84, 72); ctx.lineTo(104, 98); ctx.lineTo(128, 88); ctx.lineTo(152, 98); ctx.lineTo(172, 72); ctx.closePath();
  ctx.fillStyle = '#F4F1E6'; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(118, 82); ctx.lineTo(138, 82); ctx.lineTo(136, 98); ctx.lineTo(120, 98); ctx.closePath();
  ctx.fillStyle = tg; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.stroke();
  // The neck: one mass of it, wider at the bottom than the jaw, spilling out over both sides of the collar
  const neck = () => {
    ctx.beginPath();
    ctx.moveTo(74, -80);
    ctx.bezierCurveTo(60, 10, 52, 50, 70, 78);
    ctx.bezierCurveTo(84, 92, 110, 90, 128, 90);
    ctx.bezierCurveTo(146, 90, 172, 92, 186, 78);
    ctx.bezierCurveTo(204, 50, 196, 10, 182, -80);
    ctx.closePath();
  };
  neck();
  const ng = ctx.createLinearGradient(0, -30, 0, 90);
  ng.addColorStop(0, '#F59848'); ng.addColorStop(0.6, '#E8803A'); ng.addColorStop(1, '#D06A2A');
  ctx.fillStyle = ng; ctx.fill();
  ctx.save(); neck(); ctx.clip();
  // Where the spray tan stops: a hard line round it, pale as a fish below
  ctx.fillStyle = '#F2D0B0'; ctx.beginPath(); ctx.moveTo(40, 66); ctx.bezierCurveTo(90, 76, 166, 76, 216, 66); ctx.lineTo(216, 100); ctx.lineTo(40, 100); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(190, 80, 20, 0.7)'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(40, 66); ctx.bezierCurveTo(90, 76, 166, 76, 216, 66); ctx.stroke();
  // The rolls: each lit along its top, a deep crease under it (hatched), hanging over the next
  for (const [cy, rx, sag] of [[24, 62, 10], [44, 68, 12], [62, 70, 12]] as const) {
    const hl = ctx.createLinearGradient(0, cy - 12, 0, cy + sag);
    hl.addColorStop(0, 'rgba(255, 220, 170, 0)'); hl.addColorStop(0.5, 'rgba(255, 220, 170, 0.35)'); hl.addColorStop(1, 'rgba(255, 220, 170, 0)');
    ctx.fillStyle = hl; ctx.beginPath(); ctx.ellipse(128, cy - 2, rx - 6, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(110, 40, 10, 0.75)'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(128 - rx, cy - 4); ctx.quadraticCurveTo(128, cy + sag * 2, 128 + rx, cy - 4); ctx.stroke();
    ctx.strokeStyle = 'rgba(110, 40, 10, 0.35)'; ctx.lineWidth = 0.4;
    for (let x = 128 - rx + 6; x < 128 + rx - 6; x += 2) {
      const k = (x - (128 - rx)) / (2 * rx), yy = (1 - k) * (1 - k) * (cy - 4) + 2 * k * (1 - k) * (cy + sag * 2) + k * k * (cy - 4);
      ctx.beginPath(); ctx.moveTo(x, yy - 4); ctx.lineTo(x + 1, yy - 0.5); ctx.stroke();
    }
  }
  // Pores, stubble he missed
  for (let i = 0; i < 800; i++) { const x = 52 + hash(i * 1.9) * 152, y = -30 + hash(i * 3.7) * 120; ctx.fillStyle = i % 4 ? 'rgba(120, 50, 10, 0.3)' : 'rgba(255, 230, 200, 0.22)'; ctx.fillRect(x, y, 0.45, 0.45); }
  ctx.fillStyle = 'rgba(80, 50, 30, 0.55)'; for (let i = 0; i < 70; i++) ctx.fillRect(92 + hash(i * 5.3) * 72, -18 + hash(i * 2.2) * 30, 0.4, 0.8);
  ctx.restore();
  neck(); ctx.strokeStyle = ink; ctx.lineWidth = 1.6; ctx.stroke();
  // The chin, up out of the rolls (a dimple in it), and the pout over it
  const chg = ctx.createRadialGradient(124, -6, 2, 128, 0, 40);
  chg.addColorStop(0, '#FFB068'); chg.addColorStop(1, '#E27A34');
  ctx.fillStyle = chg; ctx.beginPath(); ctx.ellipse(128, 0, 38, 16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(110, 40, 10, 0.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(128, 0, 38, 16, 0, 0.2, Math.PI - 0.2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(126, 4); ctx.quadraticCurveTo(128, 8, 130, 4); ctx.stroke();
  ctx.fillStyle = '#B83A26'; ctx.beginPath(); ctx.ellipse(128, -20, 13, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8A2216'; ctx.beginPath(); ctx.ellipse(128, -18, 9, 2.4, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = 'rgba(255, 200, 190, 0.6)'; ctx.fillRect(122, -24, 6, 1);
  ctx.strokeStyle = ink; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.ellipse(128, -20, 13, 6, 0, 0, Math.PI * 2); ctx.stroke();
  // A mole with a hair in it, a nick from the razor (a bit of tissue on it), sweat beaded in the creases
  ctx.fillStyle = '#5A3018'; ctx.beginPath(); ctx.arc(156, 44, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(40, 20, 10, 0.9)'; ctx.lineWidth = 0.3; ctx.beginPath(); ctx.moveTo(156, 43); ctx.quadraticCurveTo(158, 40, 157, 38); ctx.stroke();
  ctx.fillStyle = '#C0201C'; ctx.fillRect(104, 20, 3, 0.8); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(103, 19.2, 2, 1.4);
  for (let i = 0; i < 18; i++) bead(ctx, 72 + hash(i * 6.6) * 112, 26 + hash(i * 2.9) * 48, 0.7 + hash(i * 4.4) * 1.1);
  const drip = (t * 0.4) % 80;
  bead(ctx, 100, 62 + drip * 0.6, 1.6);

  ctx.restore();
  finish(ctx, t);
};

// ---------------------------------------------------------------------------
// The alien, as Meathead looks him up and down
// ---------------------------------------------------------------------------

/** How tall his painting is (art units, the under-bite down to his fists): tilted down and back up like the President. */
const ALIEN_H = 342, ALIEN_TOP = 50;

/** A raised vein in his colors: purple, a shadow under it, a lit line along its top. It throbs. */
const purpleVein = (ctx: Ctx, pts: number[][], w: number, throb: number) => {
  const path = () => {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); }
    const l = pts[pts.length - 1]; ctx.lineTo(l[0], l[1]);
  };
  const ww = w * throb;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.save(); ctx.translate(0.5, 1.1); path(); ctx.strokeStyle = 'rgba(8, 16, 6, 0.6)'; ctx.lineWidth = ww + 1.6; ctx.stroke(); ctx.restore();
  path(); ctx.strokeStyle = ALIEN.veinShadow; ctx.lineWidth = ww + 0.5; ctx.stroke();
  path(); ctx.strokeStyle = ALIEN.vein; ctx.lineWidth = ww; ctx.stroke();
  path(); ctx.strokeStyle = 'rgba(154, 114, 184, 0.6)'; ctx.lineWidth = ww * 0.5; ctx.stroke();
  ctx.save(); ctx.translate(-0.3, -ww * 0.3); path(); ctx.strokeStyle = 'rgba(220, 196, 240, 0.65)'; ctx.lineWidth = Math.max(0.3, ww * 0.22); ctx.stroke(); ctx.restore();
};

/** A wet glint: a short hard white stroke and a dot off the end of it. */
const wetGlint = (ctx: Ctx, x: number, y: number, len: number, a = -0.5) => {
  ctx.strokeStyle = 'rgba(255, 255, 240, 0.85)'; ctx.lineWidth = 0.6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); ctx.stroke();
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + Math.cos(a) * len + 0.6, y + Math.sin(a) * len - 0.4, 0.6, 0.6);
};

/** Toad bumps over an area (clip it first): each a little dome, shadowed under, lit up and to the left. */
const bumps = (ctx: Ctx, x: number, y: number, w: number, h: number, n: number, seed: number, lit = 'rgba(214, 238, 170, 0.38)', dark = 'rgba(8, 16, 6, 0.5)') => {
  if ((globalThis as any).NOBUMP) return;
  const at = (i: number) => [x + hash(i * 1.71 + seed) * w, y + hash(i * 3.13 + seed * 1.3) * h, 0.5 + hash(i * 5.7 + seed) * 1.2];
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  for (let i = 0; i < n; i++) { const [bx, by, r] = at(i); ctx.moveTo(bx + Math.cos(0.1) * r, by + Math.sin(0.1) * r); ctx.arc(bx, by, r, 0.1, Math.PI * 0.95); }
  ctx.strokeStyle = dark; ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i < n; i++) { const [bx, by, r] = at(i); ctx.moveTo(bx + Math.cos(Math.PI * 1.1) * r, by + Math.sin(Math.PI * 1.1) * r); ctx.arc(bx, by, r, Math.PI * 1.1, Math.PI * 1.75); }
  ctx.strokeStyle = lit; ctx.stroke();
};

/** A wart: lumpy, lit, a long black hair out of it (or not). */
const wart = (ctx: Ctx, x: number, y: number, r: number, hair = 0) => {
  shape(ctx, () => { for (let a = 0; a <= 10; a++) { const ang = (a / 10) * Math.PI * 2, rr = r * (0.8 + hash(a + x) * 0.35); ctx.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr); } ctx.closePath(); }, '#6A8A48', 0.5);
  ctx.fillStyle = 'rgba(10, 20, 8, 0.35)'; ctx.beginPath(); ctx.arc(x + r * 0.25, y + r * 0.3, r * 0.55, 0, Math.PI); ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 230, 0.7)'; ctx.fillRect(x - r * 0.5, y - r * 0.6, 0.7, 0.7);
  if (hair) {
    ctx.strokeStyle = 'rgba(12, 8, 4, 0.95)'; ctx.lineWidth = 0.3;
    ctx.beginPath(); ctx.moveTo(x, y - r * 0.3); ctx.bezierCurveTo(x + hair * 0.4, y - hair * 0.9, x + hair, y - hair * 0.3, x + hair * 0.8, y + hair * 0.2); ctx.stroke();
  }
};

/** Slime running down from (x, y): a wet trail behind it, the drop on the end swelling; it runs `len`, then starts again. */
const slimeRun = (ctx: Ctx, t: number, x: number, y: number, len: number, speed: number, phase: number) => {
  const k = ((t * speed + phase) % (len + 20)) - 20, run = Math.max(0, k), swell = Math.min(1, (k + 20) / 20);
  ctx.strokeStyle = 'rgba(168, 224, 58, 0.5)'; ctx.lineWidth = 1.1; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 1, y + run * 0.5, x + Math.sin(run * 0.08) * 1.2, y + run); ctx.stroke();
  const dx = x + Math.sin(run * 0.08) * 1.2, dy = y + run + 1;
  ctx.fillStyle = 'rgba(168, 224, 58, 0.85)'; ctx.beginPath(); ctx.ellipse(dx, dy, 1.1 + swell * 0.6, 1.4 + swell * 0.9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(70, 110, 20, 0.7)'; ctx.lineWidth = 0.3; ctx.beginPath(); ctx.arc(dx, dy + 0.2, 1.2 + swell * 0.6, 0.3, Math.PI - 0.3); ctx.stroke();
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(dx - 0.6, dy - 0.8, 0.6, 0.6);
};

/** A wet sheen along a form: a soft broad streak of slime-light and a hard thin one in it. */
const sheen = (ctx: Ctx, x0: number, y0: number, cx: number, cy: number, x1: number, y1: number) => {
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1);
  ctx.strokeStyle = 'rgba(234, 255, 176, 0.18)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = 'rgba(244, 255, 210, 0.6)'; ctx.lineWidth = 0.5; ctx.stroke();
};

/**
 * The alien, Ren & Stimpy close, as Meathead's eyes go down him and back up: the under-bite (the yellow pegs, the
 * sesame seed, the lettuce), the drool off his lip; the frog-belly throat sac pumping under a jaw like a cinder block;
 * a neck wider than his head, the President's collar cutting into it (a button popped and hanging by its thread), the
 * tie stuck to him in the slime, far too short; and the traps: two hills of meat humped up nearly to his ears, every
 * fiber in them, purple veins like garden hoses over them, stretch marks where they've outgrown the hide. Rags of the
 * jacket on his shoulders. The pecs, a nipple like a wart with a hair in it; the gut, pale and mottled, the navel with
 * lint in it; Popeye forearms, the ray gun stapled into the right one, its tubes in his veins; two fat fingers and a
 * thumb, black claws, slime strung between them. Toad bumps over the lot of him, warts, hairs out of the warts, and
 * all of it wet: running, dripping, glinting.
 */
const paintAlien = (ctx: Ctx) => {
  const ink = INK, th = 1;
  /** The hide, lit from the left: lit, mid, dark. */
  const hideAcross = (x0: number, x1: number, dim = 0) => {
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, dim ? '#74994E' : '#97B46A'); g.addColorStop(0.45, dim ? '#416536' : '#587F40'); g.addColorStop(1, dim ? '#15241A' : '#203826');
    return g;
  };
  /** The far side going into shadow (inside a clip). */
  const farSide = (x0: number, x1: number, y0: number, y1: number, a = 0.5) => {
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, 'rgba(8, 16, 6, 0)'); g.addColorStop(1, `rgba(8, 16, 6, ${a})`);
    ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  };
  const glow = (x: number, y: number, r: number, color: string, a: number) => {
    const g = ctx.createRadialGradient(x, y, 1, x, y, r);
    g.addColorStop(0, `rgba(${color}, ${a})`); g.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };

  // --- The thighs, down under the gut: short, thick, bowed ---
  for (const s of [-1, 1]) {
    const X = (x: number) => (s < 0 ? x : 256 - x);
    const thigh = () => { ctx.moveTo(X(56), 266); ctx.bezierCurveTo(X(42), 300, X(46), 340, X(56), 372); ctx.lineTo(X(124), 372); ctx.bezierCurveTo(X(127), 332, X(125), 300, X(122), 266); ctx.closePath(); };
    shape(ctx, thigh, hideAcross(s < 0 ? 42 : 129, s < 0 ? 127 : 214, s > 0 ? 1 : 0), 1.6);
    ctx.save(); ctx.beginPath(); thigh(); ctx.clip();
    bumps(ctx, s < 0 ? 40 : 128, 266, 90, 106, 160, 71 + s);
    speckle(ctx, s < 0 ? 40 : 128, 266, 90, 106, 260, 'rgba(10, 20, 8, 0.4)', 73 + s, 0.5);
    ctx.restore();
    purpleVein(ctx, [[X(66), 310], [X(74), 330], [X(70), 350], [X(78), 372]], 1.8, th);
  }
  // (the dark between them, and the shadow the gut throws down over them)
  ctx.fillStyle = '#050904'; ctx.beginPath(); ctx.moveTo(120, 280); ctx.lineTo(136, 280); ctx.lineTo(132, 372); ctx.lineTo(124, 372); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.beginPath(); ctx.ellipse(128, 300, 80, 16, 0, 0, Math.PI * 2); ctx.fill();

  // --- The body behind it all: the traps humped up off the neck, out over the shoulders, down his flanks ---
  const torso = () => {
    ctx.moveTo(80, -28); ctx.bezierCurveTo(66, -66, 28, -66, 14, -32); ctx.bezierCurveTo(2, -4, -10, 50, -10, 100);
    ctx.lineTo(-10, 292); ctx.lineTo(266, 292); ctx.lineTo(266, 100);
    ctx.bezierCurveTo(266, 50, 254, -4, 242, -32); ctx.bezierCurveTo(228, -66, 190, -66, 176, -28); ctx.closePath();
  };
  ctx.save(); ctx.translate(3, 4); ctx.beginPath(); torso(); ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'; ctx.fill(); ctx.restore();
  shape(ctx, torso, lin(ctx, -60, 292, [[0, '#87AA5C'], [0.25, '#416536'], [1, '#15241A']]), 2.2);
  ctx.save(); ctx.beginPath(); torso(); ctx.clip();
  // (the traps' peaks and the delts, lit; the right side of him in shadow)
  glow(40, -40, 40, '226, 244, 176', 0.75); glow(216, -40, 40, '214, 236, 160', 0.35);
  glow(58, 34, 44, '8, 16, 6', 0.45); glow(198, 34, 44, '8, 16, 6', 0.55);
  glow(12, 70, 30, '200, 226, 150', 0.45); glow(244, 70, 30, '200, 226, 150', 0.2);
  farSide(128, 266, -60, 300, 0.5);
  // The traps' fibers, fanning off the neck out to the shoulder, every one of them
  ctx.lineWidth = 0.45;
  for (const s of [-1, 1]) {
    const X = (x: number) => (s < 0 ? x : 256 - x);
    ctx.lineWidth = 0.45;
    for (let k = 0; k < 16; k++) {
      ctx.strokeStyle = `rgba(16, 30, 12, ${0.22 + (k % 3) * 0.08})`;
      ctx.beginPath(); ctx.moveTo(X(76 - k * 0.6), -34 + k * 6); ctx.quadraticCurveTo(X(46 - k * 1.2), -64 + k * 7, X(10 + k * 1.8), -20 + k * 7); ctx.stroke();
    }
    // (the groove where the trap meets the delt, and the collarbone ridge under it)
    ctx.strokeStyle = 'rgba(16, 30, 12, 0.6)'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(X(0), 36); ctx.quadraticCurveTo(X(26), 46, X(30), 82); ctx.stroke();
    ctx.strokeStyle = 'rgba(16, 30, 12, 0.4)'; ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.moveTo(X(62), 70); ctx.quadraticCurveTo(X(36), 60, X(14), 66); ctx.stroke();
    ctx.strokeStyle = 'rgba(214, 236, 160, 0.4)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(X(60), 67); ctx.quadraticCurveTo(X(36), 57, X(16), 63); ctx.stroke();
    // Stretch marks where the traps meet the neck: they've grown faster than his hide has
    for (let k = 0; k < 7; k++) {
      const y = -34 + k * 6, x = 64 - k * 1.5;
      ctx.beginPath(); ctx.moveTo(X(x), y); ctx.bezierCurveTo(X(x - 5), y + 1, X(x - 9), y + 4, X(x - 15 + k), y + 3);
      ctx.strokeStyle = 'rgba(170, 92, 168, 0.5)'; ctx.lineWidth = 1.3; ctx.stroke();
      ctx.strokeStyle = 'rgba(240, 206, 240, 0.35)'; ctx.lineWidth = 0.35; ctx.stroke();
    }
    // (the flank, down past the armpit: the lat)
    ctx.strokeStyle = 'rgba(16, 30, 12, 0.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(50), 112); ctx.quadraticCurveTo(X(42), 160, X(46), 230); ctx.stroke();
  }
  bumps(ctx, -10, -60, 276, 150, 420, 11);
  speckle(ctx, -10, -60, 276, 150, 800, 'rgba(10, 20, 8, 0.42)', 13, 0.5);
  speckle(ctx, -10, -60, 130, 100, 260, 'rgba(230, 250, 190, 0.32)', 17, 0.4);
  bumps(ctx, -10, 90, 276, 202, 160, 15); speckle(ctx, -10, 90, 276, 202, 300, 'rgba(10, 20, 8, 0.42)', 19, 0.5);
  hatchInk(ctx, 206, -20, 60, 300, 2.4, 0.28);
  ctx.restore();
  // Veins over the traps and down the shoulders, like garden hoses
  purpleVein(ctx, [[74, -24], [62, -44], [44, -50], [28, -38], [16, -10], [8, 30]], 3, th);
  purpleVein(ctx, [[28, -38], [40, -20], [36, 4]], 1.8, th);
  purpleVein(ctx, [[62, -44], [66, -54]], 1.3, th);
  purpleVein(ctx, [[182, -24], [196, -46], [214, -48], [230, -32], [240, -4], [248, 34]], 2.8, th);
  purpleVein(ctx, [[230, -32], [216, -14], [222, 10]], 1.6, th);
  // Warts on the traps, hairs out of two of them; a zit, ripe, on the left one
  wart(ctx, 30, -30, 2.6, 6); wart(ctx, 54, -8, 1.6); wart(ctx, 226, -28, 2.2, 5); wart(ctx, 18, 30, 1.5); wart(ctx, 240, 34, 1.8);
  glow(48, -36, 4, '230, 70, 60', 0.85);
  ctx.fillStyle = '#F5E6A8'; ctx.beginPath(); ctx.arc(48, -36.4, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(47.5, -37, 0.5, 0.5);
  // The wet on the traps: a sheen along each, slime pooled in the crease against the neck
  sheen(ctx, 16, -10, 30, -62, 70, -40); sheen(ctx, 240, -10, 226, -62, 186, -40);
  for (const s of [-1, 1]) {
    const X = (x: number) => (s < 0 ? x : 256 - x);
    ctx.fillStyle = 'rgba(168, 224, 58, 0.55)'; ctx.beginPath(); ctx.ellipse(X(62), 54, 6, 3, s * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(234, 255, 176, 0.8)'; ctx.fillRect(X(60) - 1, 52.5, 2, 0.6);
  }

  // --- The gut: pale and yellowish as a frog's, mottled, hanging ---
  const gut = () => { ctx.moveTo(46, 158); ctx.bezierCurveTo(28, 206, 32, 266, 72, 292); ctx.bezierCurveTo(100, 310, 156, 310, 184, 292); ctx.bezierCurveTo(224, 266, 228, 206, 210, 158); ctx.bezierCurveTo(170, 176, 86, 176, 46, 158); ctx.closePath(); };
  const gg = ctx.createRadialGradient(106, 212, 6, 124, 230, 98);
  gg.addColorStop(0, '#E6E0AE'); gg.addColorStop(0.3, '#CEC888'); gg.addColorStop(0.7, '#8E8A48'); gg.addColorStop(1, '#4A4A24');
  shape(ctx, gut, gg, 2);
  ctx.save(); ctx.beginPath(); gut(); ctx.clip();
  // (mottled, like a toad's belly)
  for (let i = 0; i < 46; i++) {
    const mx = 34 + hash(i * 4.7 + 2) * 190, my = 166 + hash(i * 8.3 + 5) * 140, mr = 1.5 + hash(i * 2.9) * 4.5;
    ctx.fillStyle = i % 3 ? 'rgba(74, 74, 36, 0.24)' : 'rgba(94, 138, 24, 0.2)';
    ctx.beginPath(); ctx.ellipse(mx, my, mr, mr * 0.7, hash(i) * 3, 0, Math.PI * 2); ctx.fill();
  }
  farSide(128, 230, 150, 312, 0.5);
  // (the underside of it, hatched; a crease across where it hangs)
  ctx.strokeStyle = 'rgba(46, 46, 22, 0.35)'; ctx.lineWidth = 0.4;
  for (let x = 40; x < 220; x += 1.8) { const k = (x - 128) / 92, y = 296 - k * k * 40 + hash(x) * 2; ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(x + 3, y); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(46, 46, 22, 0.55)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(62, 268); ctx.quadraticCurveTo(128, 284, 196, 266); ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 250, 220, 0.3)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(64, 266); ctx.quadraticCurveTo(128, 281, 194, 264); ctx.stroke();
  // Stretch marks up its sides
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) {
    const x = s < 0 ? 46 + k * 3 : 210 - k * 3, y = 190 + k * 11;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x - s * 4, y + 6, x + s * 2, y + 12, x - s * 1, y + 20);
    ctx.strokeStyle = 'rgba(170, 92, 168, 0.45)'; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.strokeStyle = 'rgba(250, 220, 250, 0.35)'; ctx.lineWidth = 0.35; ctx.stroke();
  }
  speckle(ctx, 30, 158, 200, 154, 700, 'rgba(74, 74, 36, 0.38)', 23, 0.45);
  bumps(ctx, 30, 158, 200, 154, 260, 29, 'rgba(255, 250, 220, 0.35)', 'rgba(46, 46, 22, 0.4)');
  // The navel: deep, the fat folded over it, a ball of lint down in it, slime glistening at its rim
  ctx.strokeStyle = 'rgba(46, 46, 22, 0.6)'; ctx.lineWidth = 0.6;
  for (let k = 1; k <= 3; k++) { ctx.beginPath(); ctx.arc(130, 238, 6 + k * 1.6, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
  const ng = ctx.createRadialGradient(130, 236, 0.5, 130, 238, 7);
  ng.addColorStop(0, '#120C04'); ng.addColorStop(0.7, '#2E2E16'); ng.addColorStop(1, '#6A6834');
  shape(ctx, () => ctx.ellipse(130, 239, 5, 7, 0, 0, Math.PI * 2), ng, 0.9);
  ctx.fillStyle = '#7C8AA0'; ctx.beginPath(); ctx.arc(131, 242, 2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(190, 200, 220, 0.8)'; ctx.lineWidth = 0.25;
  for (let k = 0; k < 9; k++) { const a = k * 0.7; ctx.beginPath(); ctx.moveTo(131 + Math.cos(a) * 1.2, 242 + Math.sin(a) * 1.2); ctx.lineTo(131 + Math.cos(a) * 2.8, 242 + Math.sin(a + 0.3) * 2.6); ctx.stroke(); }
  ctx.fillStyle = 'rgba(168, 224, 58, 0.7)'; ctx.beginPath(); ctx.ellipse(130, 246, 3, 1, 0, 0, Math.PI * 2); ctx.fill();
  wetGlint(ctx, 127, 234, 2.5);
  wart(ctx, 92, 214, 1.8, 5); wart(ctx, 170, 252, 1.5); wart(ctx, 76, 258, 1.3);
  sheen(ctx, 66, 236, 70, 196, 102, 180); sheen(ctx, 88, 290, 110, 300, 150, 300);
  ctx.restore();

  // --- The pecs: two slabs, every fiber in them, the creases under them deep enough to lose a coin in ---
  for (const s of [-1, 1]) {
    const X = (x: number) => (s < 0 ? x : 256 - x);
    const pec = () => { ctx.moveTo(X(34), 86); ctx.bezierCurveTo(X(66), 70, X(108), 74, X(127), 86); ctx.lineTo(X(127), 156); ctx.bezierCurveTo(X(102), 172, X(62), 176, X(40), 162); ctx.bezierCurveTo(X(26), 138, X(26), 106, X(34), 86); ctx.closePath(); };
    ctx.save(); ctx.translate(1.5, 5); ctx.beginPath(); pec(); ctx.fillStyle = 'rgba(8, 16, 6, 0.55)'; ctx.fill(); ctx.restore();
    const pg = ctx.createRadialGradient(X(68) - 8, 100, 3, X(76), 120, 62);
    pg.addColorStop(0, s < 0 ? '#C0D494' : '#87AA5C'); pg.addColorStop(0.4, s < 0 ? '#74994E' : '#587F40'); pg.addColorStop(1, s < 0 ? '#2F4D30' : '#15241A');
    shape(ctx, pec, pg, 1.6);
    ctx.save(); ctx.beginPath(); pec(); ctx.clip();
    ctx.lineWidth = 0.45;
    for (let k = 0; k < 14; k++) { ctx.strokeStyle = `rgba(16, 30, 12, ${0.2 + (k % 3) * 0.07})`; ctx.beginPath(); ctx.moveTo(X(126), 88 + k * 5); ctx.quadraticCurveTo(X(84), 92 + k * 4, X(30), 94 + k * 2.4); ctx.stroke(); }
    bumps(ctx, s < 0 ? 26 : 128, 70, 102, 106, 200, 41 + s * 3);
    speckle(ctx, s < 0 ? 26 : 128, 70, 102, 106, 360, 'rgba(10, 20, 8, 0.4)', 43 + s, 0.5);
    hatchInk(ctx, s < 0 ? 40 : 130, 146, 90, 26, 2, 0.35);
    ctx.restore();
    // The crease under it, inked heavy
    ctx.strokeStyle = ink; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(X(127), 156); ctx.bezierCurveTo(X(102), 172, X(62), 176, X(40), 162); ctx.stroke();
    // The nipple: a dark warty areola, a ring of bumps round it, a nub in the middle with a long hair out of it
    const nx = X(82), ny = 134;
    shape(ctx, () => ctx.ellipse(nx, ny, 6, 4.6, 0, 0, Math.PI * 2), '#2F3A1C', 0.6);
    ctx.fillStyle = 'rgba(120, 140, 70, 0.8)';
    for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2; ctx.beginPath(); ctx.arc(nx + Math.cos(a) * 4.4, ny + Math.sin(a) * 3.3, 0.6, 0, Math.PI * 2); ctx.fill(); }
    wart(ctx, nx, ny, 1.8, s < 0 ? 9 : 0);
    if (s > 0) { ctx.strokeStyle = 'rgba(12, 8, 4, 0.95)'; ctx.lineWidth = 0.3; ctx.beginPath(); ctx.moveTo(nx + 1, ny); ctx.bezierCurveTo(nx + 5, ny + 2, nx + 3, ny + 7, nx + 7, ny + 9); ctx.stroke(); }
    sheen(ctx, X(40), 120, X(52), 84, X(100), 82);
  }
  // (the groove down his breastbone)
  ctx.strokeStyle = 'rgba(16, 30, 12, 0.8)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(128, 80); ctx.lineTo(128, 160); ctx.stroke();
  purpleVein(ctx, [[60, 92], [76, 104], [90, 120], [96, 146]], 1.6, th);
  purpleVein(ctx, [[198, 94], [184, 110], [176, 132]], 1.4, th);

  // --- The neck: wider than his head; the cords standing out of it, the throat sac pumping under the jaw ---
  const neck = () => { ctx.moveTo(66, -66); ctx.bezierCurveTo(58, -24, 54, 24, 58, 62); ctx.lineTo(198, 62); ctx.bezierCurveTo(202, 24, 198, -24, 190, -66); ctx.closePath(); };
  const neckCrease = () => {
    for (const [w, col] of [[2.6, 'rgba(8, 16, 6, 0.35)'], [1.1, 'rgba(8, 16, 6, 0.75)']] as const) {
      ctx.strokeStyle = col; ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(66, -66); ctx.bezierCurveTo(58, -24, 54, 24, 58, 62); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(190, -66); ctx.bezierCurveTo(198, -24, 202, 24, 198, 62); ctx.stroke();
    }
  };
  shape(ctx, neck, lin(ctx, -60, 62, [[0, '#203826'], [0.35, '#416536'], [0.8, '#587F40'], [1, '#416536']]), 0);
  ctx.save(); ctx.beginPath(); neck(); ctx.clip();
  glow(78, 10, 34, '200, 226, 150', 0.4);
  farSide(128, 200, -70, 64, 0.45);
  const shadeJaw = ctx.createRadialGradient(128, -14, 10, 128, -14, 74);
  shadeJaw.addColorStop(0, 'rgba(4, 8, 3, 0.6)'); shadeJaw.addColorStop(1, 'rgba(4, 8, 3, 0)');
  ctx.fillStyle = shadeJaw; ctx.fillRect(40, -90, 176, 150);
  // The cords: a ridge each side, down from behind the jaw to the middle of the collar
  for (const s of [-1, 1]) {
    const X = (x: number) => (s < 0 ? x : 256 - x);
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(X(70), -50); ctx.quadraticCurveTo(X(84), 10, X(116), 60);
    ctx.strokeStyle = 'rgba(8, 16, 6, 0.32)'; ctx.lineWidth = 9; ctx.stroke();
    ctx.strokeStyle = s < 0 ? 'rgba(151, 180, 106, 0.6)' : 'rgba(88, 127, 64, 0.6)'; ctx.lineWidth = 6; ctx.stroke();
    ctx.strokeStyle = 'rgba(214, 236, 170, 0.45)'; ctx.lineWidth = 1; ctx.save(); ctx.translate(-1.6, -0.4); ctx.stroke(); ctx.restore();
  }
  bumps(ctx, 56, -66, 144, 128, 320, 51);
  speckle(ctx, 56, -66, 144, 128, 600, 'rgba(10, 20, 8, 0.42)', 53, 0.5);
  // The neck spilling over the collar: a roll of it, lit along its top
  for (const y of [44, 52]) {
    ctx.strokeStyle = 'rgba(8, 16, 6, 0.7)'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(58, y); ctx.quadraticCurveTo(128, y + 18, 198, y); ctx.stroke();
    ctx.strokeStyle = 'rgba(200, 226, 150, 0.4)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(60, y - 2.5); ctx.quadraticCurveTo(128, y + 15, 196, y - 2.5); ctx.stroke();
  }
  ctx.restore();
  // (where it meets the traps: a crease, not a line)
  neckCrease();
  purpleVein(ctx, [[80, -40], [84, -14], [94, 14], [102, 40], [108, 56]], 2.6, th);
  purpleVein(ctx, [[94, 14], [84, 28], [80, 48]], 1.4, th);
  purpleVein(ctx, [[178, -42], [172, -14], [164, 16], [158, 46]], 2.3, th);
  purpleVein(ctx, [[172, -14], [182, 4]], 1.2, th);

  // --- The President's collar, still round it, cutting in; the points splayed out on his traps; a button popped,
  // hanging off its thread; the knot of the tie jammed up in it, the tie stuck to his chest, far too short ---
  for (const s of [-1, 1]) {
    const X = (x: number) => (s < 0 ? x : 256 - x);
    shape(ctx, () => { ctx.moveTo(X(56), 58); ctx.lineTo(X(80), 70); ctx.lineTo(X(48), 84); ctx.closePath(); }, '#E8E4D8', 1);
    ctx.fillStyle = 'rgba(168, 224, 58, 0.25)'; ctx.beginPath(); ctx.ellipse(X(58), 74, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
  }
  const collar = () => { ctx.moveTo(54, 50); ctx.quadraticCurveTo(128, 70, 202, 50); ctx.lineTo(204, 64); ctx.quadraticCurveTo(128, 86, 52, 64); ctx.closePath(); };
  shape(ctx, collar, lin(ctx, 50, 80, [[0, '#FFFFFF'], [0.5, '#F4F1E6'], [1, '#B8B4A6']]), 1.3);
  ctx.save(); ctx.beginPath(); collar(); ctx.clip();
  // (stained through, yellow-green, where it's soaked up the slime; the stitching along it)
  for (const [cx2, cy2, r2] of [[72, 62, 9], [104, 68, 6], [170, 66, 10], [196, 58, 6]] as const) { ctx.fillStyle = 'rgba(168, 190, 60, 0.3)'; ctx.beginPath(); ctx.ellipse(cx2, cy2, r2, r2 * 0.5, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.setLineDash([1.2, 1]); ctx.strokeStyle = 'rgba(120, 120, 130, 0.6)'; ctx.lineWidth = 0.3;
  ctx.beginPath(); ctx.moveTo(56, 53); ctx.quadraticCurveTo(128, 73, 200, 53); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(56, 62); ctx.quadraticCurveTo(128, 82, 200, 62); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
  // The knot, and the tie: too short now, stuck down in the slime, the tip curling up off him
  const tieG = ctx.createLinearGradient(118, 0, 138, 0);
  tieG.addColorStop(0, '#8A1410'); tieG.addColorStop(0.45, '#E0302A'); tieG.addColorStop(1, '#8A1410');
  shape(ctx, () => { ctx.moveTo(119, 70); ctx.lineTo(137, 70); ctx.lineTo(135, 82); ctx.lineTo(121, 82); ctx.closePath(); }, tieG, 1);
  const blade = () => { ctx.moveTo(121, 82); ctx.lineTo(135, 82); ctx.lineTo(138, 110); ctx.quadraticCurveTo(136, 116, 131, 115); ctx.lineTo(124, 112); ctx.lineTo(119, 106); ctx.closePath(); };
  shape(ctx, blade, tieG, 1.1);
  ctx.save(); ctx.beginPath(); blade(); ctx.clip();
  ctx.strokeStyle = 'rgba(255, 170, 160, 0.22)'; ctx.lineWidth = 0.35;
  for (let y = 76; y < 116; y += 3) { ctx.beginPath(); ctx.moveTo(118, y); ctx.lineTo(140, y + 6); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(234, 255, 176, 0.45)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(124, 86); ctx.quadraticCurveTo(130, 98, 127, 110); ctx.stroke();
  ctx.restore();
  // (the curled-up tip, its underside paler)
  shape(ctx, () => { ctx.moveTo(124, 112); ctx.quadraticCurveTo(124, 118, 129, 119); ctx.quadraticCurveTo(133, 118, 131, 115); ctx.closePath(); }, '#F0A8A0', 0.6);
  // (the ketchup off the President's lunch, still on it)
  ctx.fillStyle = '#B4200C'; ctx.beginPath(); ctx.ellipse(131, 90, 2.6, 2, 0.4, 0, Math.PI * 2); ctx.fill();
  wetGlint(ctx, 124, 96, 3, -1.2); wetGlint(ctx, 133, 104, 2);

  // --- The jaw like a cinder block, the under-bite up over his top lip ---
  const MOUTH = -34;
  const head = () => { ctx.moveTo(86, -110); ctx.bezierCurveTo(74, -84, 68, -52, 72, -28); ctx.bezierCurveTo(76, -8, 98, 4, 128, 4); ctx.bezierCurveTo(158, 4, 180, -8, 184, -28); ctx.bezierCurveTo(188, -52, 182, -84, 170, -110); ctx.closePath(); };
  ctx.save(); ctx.translate(2, 6); ctx.beginPath(); head(); ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'; ctx.fill(); ctx.restore();
  const hg = ctx.createRadialGradient(100, -70, 3, 124, -40, 80);
  hg.addColorStop(0, '#C0D494'); hg.addColorStop(0.35, '#74994E'); hg.addColorStop(0.75, '#416536'); hg.addColorStop(1, '#15241A');
  shape(ctx, head, hg, 1.9);
  ctx.save(); ctx.beginPath(); head(); ctx.clip();
  farSide(110, 190, -110, 10, 0.55);
  // (the underside of the chin, frog-belly pale; a cleft in it)
  const cg = ctx.createRadialGradient(124, 2, 4, 126, -4, 46);
  cg.addColorStop(0, 'rgba(230, 224, 174, 0.75)'); cg.addColorStop(1, 'rgba(230, 224, 174, 0)');
  ctx.fillStyle = cg; ctx.fillRect(60, -30, 140, 40);
  ctx.strokeStyle = 'rgba(16, 30, 12, 0.6)'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(126, -14); ctx.quadraticCurveTo(125, -6, 126, 2); ctx.stroke();
  ctx.fillStyle = 'rgba(10, 16, 6, 0.4)'; ctx.fillRect(60, MOUTH, 140, 4);
  // (the folds down from his nose to the corners of his mouth)
  ctx.strokeStyle = 'rgba(16, 30, 12, 0.7)'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(110, -66); ctx.quadraticCurveTo(98, -54, 94, MOUTH - 1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(146, -66); ctx.quadraticCurveTo(158, -54, 162, MOUTH - 1); ctx.stroke();
  bumps(ctx, 66, -110, 124, 116, 300, 61);
  speckle(ctx, 66, -110, 124, 116, 800, 'rgba(10, 20, 8, 0.4)', 63, 0.5);
  speckle(ctx, 70, -110, 60, 50, 160, 'rgba(230, 250, 190, 0.32)', 67, 0.4);
  hatchInk(ctx, 160, -90, 30, 92, 2.2, 0.3);
  ctx.restore();
  wart(ctx, 82, -16, 2.4, 7); wart(ctx, 176, -12, 2); wart(ctx, 92, -56, 1.4);
  purpleVein(ctx, [[84, -60], [80, -42], [86, -22]], 1.5, th);
  purpleVein(ctx, [[176, -58], [181, -42], [172, -24]], 1.5, th);
  // The mouth: a slot, the gums showing in it, the line of it wide, the corners pulled down
  ctx.fillStyle = ALIEN.mouth; ctx.fillRect(76, MOUTH - 2, 104, 4.6);
  ctx.fillStyle = ALIEN.gumDark; ctx.fillRect(76, MOUTH - 2, 104, 2);
  ctx.strokeStyle = ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(74, MOUTH + 3); ctx.quadraticCurveTo(80, MOUTH - 1, 126, MOUTH); ctx.quadraticCurveTo(172, MOUTH - 1, 182, MOUTH + 3); ctx.stroke();
  // The pegs: up out of his lower jaw over his top lip; yellow, brown at the roots, tartar caked on them, one chipped;
  // the sesame seed and the lettuce still in them
  const teeth = [[86, 11, 7], [97, 16, 8], [109, 13, 8], [121, 19, 9], [134, 14, 8], [146, 18, 8], [158, 12, 7], [168, 9, 6]];
  teeth.forEach(([x, h, w], i) => {
    const by = MOUTH + 4;
    const tg = ctx.createLinearGradient(0, by - h, 0, by);
    tg.addColorStop(0, '#F8F0C8'); tg.addColorStop(0.6, '#D8CC8C'); tg.addColorStop(1, '#6A5A28');
    const chip = i === 4 ? 3 : 0;
    shape(ctx, () => { ctx.moveTo(x, by); ctx.lineTo(x + 0.6, by - h + 3); ctx.quadraticCurveTo(x + w * 0.3, by - h, x + w * 0.55, by - h + chip); ctx.lineTo(x + w - 0.6, by - h + 2 + chip); ctx.lineTo(x + w, by); ctx.closePath(); }, tg, 0.8);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'; ctx.fillRect(x + 1.4, by - h + 3, 0.8, h * 0.4);
    // (tartar at the roots, brown flecks up them; a crack down the chipped one)
    ctx.fillStyle = 'rgba(120, 96, 30, 0.7)'; ctx.beginPath(); ctx.ellipse(x + w * 0.5, by - 1.5, w * 0.5, 2, 0, Math.PI, Math.PI * 2); ctx.fill();
    speckle(ctx, x + 1, by - h * 0.5, w - 2, h * 0.4, 6, 'rgba(90, 70, 20, 0.6)', i * 7 + 3, 0.5);
    if (chip) { ctx.strokeStyle = 'rgba(60, 50, 20, 0.8)'; ctx.lineWidth = 0.3; ctx.beginPath(); ctx.moveTo(x + w * 0.55, by - h + chip); ctx.lineTo(x + w * 0.45, by - h + 7); ctx.lineTo(x + w * 0.6, by - h + 10); ctx.stroke(); }
  });
  ctx.fillStyle = '#F4E8C0'; ctx.beginPath(); ctx.ellipse(119.5, MOUTH - 3, 1.2, 0.7, 0.4, 0, Math.PI * 2); ctx.fill();
  shape(ctx, () => { ctx.moveTo(141, MOUTH - 1); ctx.quadraticCurveTo(144, MOUTH - 6, 146, MOUTH); ctx.quadraticCurveTo(144, MOUTH + 2, 141, MOUTH - 1); }, '#5CB43C', 0.3);
  for (let i = 0; i < 8; i++) wetGlint(ctx, 78 + hash(i * 9.1) * 100, -60 + hash(i * 4.3) * 58, 1.5 + hash(i * 2.2) * 2.5);

  // --- The arms, hanging to his knees: the upper arms, Popeye forearms twice the size, the fists. The ray gun's
  // grafted into the arm on the right of the picture (the side it's on in his close-up), its tubes in his veins ---
  for (const s of [-1, 1]) {
    const X = (x: number) => (s < 0 ? x : 256 - x);
    const RX = (x: number, w: number) => (s < 0 ? x : 256 - x - w);
    const dim = s > 0 ? 1 : 0;
    const upper = () => { ctx.moveTo(X(-6), 78); ctx.bezierCurveTo(X(-12), 120, X(-6), 160, X(2), 194); ctx.lineTo(X(50), 194); ctx.bezierCurveTo(X(56), 160, X(56), 120, X(48), 84); ctx.closePath(); };
    ctx.save(); ctx.translate(s * -3, 3); ctx.beginPath(); upper(); ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; ctx.fill(); ctx.restore();
    shape(ctx, upper, hideAcross(RX(-12, 68), RX(-12, 68) + 68, dim), 1.8);
    ctx.save(); ctx.beginPath(); upper(); ctx.clip();
    glow(X(16), 128, 24, '214, 236, 160', dim ? 0.2 : 0.45);
    // (the line between the bicep and the tricep)
    ctx.strokeStyle = 'rgba(16, 30, 12, 0.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(10), 96); ctx.quadraticCurveTo(X(4), 140, X(14), 186); ctx.stroke();
    bumps(ctx, RX(-12, 68), 78, 68, 116, 200, 81 + s);
    speckle(ctx, RX(-12, 68), 78, 68, 116, 340, 'rgba(10, 20, 8, 0.42)', 83 + s, 0.5);
    hatchInk(ctx, s < 0 ? 30 : 202, 80, 26, 114, 2.2, 0.3);
    ctx.restore();
    purpleVein(ctx, [[X(24), 100], [X(30), 126], [X(26), 152], [X(32), 180]], 2.4, th);
    purpleVein(ctx, [[X(30), 126], [X(40), 140]], 1.3, th);
    // The forearm: twice as thick; the elbow puckered where it bends
    const fore = () => { ctx.moveTo(X(2), 184); ctx.bezierCurveTo(X(-14), 214, X(-12), 262, X(4), 294); ctx.lineTo(X(48), 294); ctx.bezierCurveTo(X(64), 262, X(66), 214, X(52), 184); ctx.closePath(); };
    shape(ctx, fore, hideAcross(RX(-14, 80), RX(-14, 80) + 80, dim), 0);
    ctx.strokeStyle = ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(X(2), 184); ctx.bezierCurveTo(X(-14), 214, X(-12), 262, X(4), 294); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(48), 294); ctx.bezierCurveTo(X(64), 262, X(66), 214, X(52), 184); ctx.stroke();
    ctx.save(); ctx.beginPath(); fore(); ctx.clip();
    glow(X(14), 226, 30, '214, 236, 160', dim ? 0.2 : 0.5);
    ctx.strokeStyle = 'rgba(16, 30, 12, 0.6)'; ctx.lineWidth = 0.5;
    for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(X(26), 186, 6 + k * 2.4, 0.25, Math.PI - 0.25); ctx.stroke(); }
    ctx.lineWidth = 0.45;
    for (let k = 0; k < 9; k++) { ctx.strokeStyle = `rgba(16, 30, 12, ${0.2 + (k % 3) * 0.08})`; ctx.beginPath(); ctx.moveTo(X(-6 + k * 7), 196); ctx.quadraticCurveTo(X(-10 + k * 8), 240, X(6 + k * 4.5), 292); ctx.stroke(); }
    bumps(ctx, RX(-14, 80), 184, 80, 110, 240, 91 + s);
    speckle(ctx, RX(-14, 80), 184, 80, 110, 420, 'rgba(10, 20, 8, 0.42)', 93 + s, 0.5);
    hatchInk(ctx, s < 0 ? 38 : 190, 190, 28, 104, 2.2, 0.3);
    ctx.restore();
    purpleVein(ctx, [[X(10), 196], [X(4), 222], [X(10), 248], [X(6), 272], [X(14), 292]], 3.4, th);
    purpleVein(ctx, [[X(10), 222], [X(24), 236], [X(34), 260], [X(30), 290]], 2.6, th);
    purpleVein(ctx, [[X(24), 236], [X(42), 222], [X(48), 204]], 1.6, th);
    wart(ctx, X(36), 206, 2, 6); wart(ctx, X(-2), 260, 1.6);
    // The fist: two fat fingers curled under, black claws hooked out of them, the thumb over the top
    const fist = () => ctx.ellipse(X(26), 306, 24, 18, 0, 0, Math.PI * 2);
    const fg = ctx.createRadialGradient(X(26) - 8, 298, 2, X(26), 306, 26);
    fg.addColorStop(0, dim ? '#87AA5C' : '#B0CC80'); fg.addColorStop(1, dim ? '#15241A' : '#2F4D30');
    shape(ctx, fist, fg, 1.8);
    ctx.save(); ctx.beginPath(); fist(); ctx.clip(); bumps(ctx, RX(0, 52), 288, 52, 36, 80, 101 + s); ctx.restore();
    // (the two fingers, curled under, each the size of a sausage; the claws hooked out from under them)
    for (const fx of [14, 31]) {
      const fgr = ctx.createLinearGradient(0, 302, 0, 322);
      fgr.addColorStop(0, dim ? '#74994E' : '#97B46A'); fgr.addColorStop(1, dim ? '#15241A' : '#2F4D30');
      shape(ctx, () => ctx.roundRect(RX(fx - 8, 16), 303, 16, 19, 7), fgr, 1.2);
      ctx.strokeStyle = 'rgba(16, 30, 12, 0.6)'; ctx.lineWidth = 0.45;
      for (let c = 0; c < 3; c++) { ctx.beginPath(); ctx.arc(X(fx), 304 + c * 1.6, 4.5 - c * 0.8, 0.4, Math.PI - 0.4); ctx.stroke(); }
      ctx.fillStyle = 'rgba(230, 250, 190, 0.45)'; ctx.beginPath(); ctx.ellipse(X(fx) - 2.5, 309, 2, 4, 0, 0, Math.PI * 2); ctx.fill();
      shape(ctx, () => { ctx.moveTo(X(fx - 5), 319); ctx.quadraticCurveTo(X(fx + 1), 334, X(fx + 9), 330); ctx.lineTo(X(fx + 4), 319); ctx.closePath(); }, '#1A140C', 0.6);
      ctx.fillStyle = '#4A3E26'; ctx.fillRect(RX(fx - 4, 7), 318.5, 7, 1.2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)'; ctx.lineWidth = 0.35; ctx.beginPath(); ctx.moveTo(X(fx - 3), 321); ctx.quadraticCurveTo(X(fx + 1), 329, X(fx + 6), 329); ctx.stroke();
    }
    // (the thumb down the inside of it, its claw)
    shape(ctx, () => ctx.ellipse(X(45), 300, 6, 12, s * -0.2, 0, Math.PI * 2), dim ? '#416536' : '#587F40', 1.2);
    ctx.strokeStyle = 'rgba(16, 30, 12, 0.6)'; ctx.lineWidth = 0.45; ctx.beginPath(); ctx.arc(X(45), 298, 3.5, 0.5, Math.PI - 0.5); ctx.stroke();
    shape(ctx, () => { ctx.moveTo(X(42), 310); ctx.quadraticCurveTo(X(46), 320, X(52), 318); ctx.lineTo(X(48), 309); ctx.closePath(); }, '#1A140C', 0.5);
    wetGlint(ctx, X(18), 298, 3);
  }
  // The ray gun, grafted into his forearm: chrome, ribbed, the coil glowing pink through slots; the hide puckered and
  // weeping round where it goes in, staples across it; two tubes out of it plugged into his veins; a pink light on him
  const bx0 = 236, bw = 14, by0 = 202, bh = 92;
  shape(ctx, () => ctx.ellipse(bx0 + bw / 2, by0, bw / 2 + 5, 5, 0, 0, Math.PI * 2), '#8E5A5A', 0.9);
  ctx.strokeStyle = 'rgba(120, 30, 40, 0.7)'; ctx.lineWidth = 0.4;
  for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(bx0 + bw / 2 + Math.cos(a) * 8, by0 + Math.sin(a) * 2.6); ctx.lineTo(bx0 + bw / 2 + Math.cos(a) * 11, by0 + Math.sin(a) * 4); ctx.stroke(); }
  const bgr = ctx.createLinearGradient(bx0, 0, bx0 + bw, 0);
  bgr.addColorStop(0, '#5C636E'); bgr.addColorStop(0.25, '#F0F6FA'); bgr.addColorStop(0.45, '#868E9A'); bgr.addColorStop(1, '#1C1F24');
  shape(ctx, () => ctx.roundRect(bx0, by0, bw, bh, 3), bgr, 1.4);
  ctx.fillStyle = 'rgba(10, 12, 16, 0.6)';
  for (let r = 0; r < 8; r++) ctx.fillRect(bx0, by0 + 6 + r * 11, bw, 1.2);
  ctx.fillStyle = '#7A0C5E';
  for (let r = 0; r < 4; r++) ctx.fillRect(bx0 + 4, by0 + 20 + r * 11, bw - 8, 6);
  shape(ctx, () => ctx.ellipse(bx0 + bw / 2, by0 + bh, bw / 2 + 2, 3, 0, 0, Math.PI * 2), '#B6BEC8', 1.2);
  ctx.fillStyle = '#C01C98'; ctx.beginPath(); ctx.ellipse(bx0 + bw / 2, by0 + bh, bw / 2 - 1, 1.6, 0, 0, Math.PI * 2); ctx.fill();
  // (the staples across the seam where it goes into him, ooze weeping out between them)
  for (let k = 0; k < 4; k++) {
    const sx2 = bx0 - 2 + k * 5;
    ctx.strokeStyle = '#2A3139'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(sx2, by0 - 3); ctx.lineTo(sx2, by0 + 3); ctx.stroke();
    ctx.strokeStyle = '#D8E0E8'; ctx.lineWidth = 0.4; ctx.stroke();
  }
  // (the tubes, out of the barrel and down into the veins on his forearm, clamped, a bead of blood at each)
  ctx.lineCap = 'round';
  for (const [y0, y1] of [[224, 240], [252, 272]] as const) {
    ctx.beginPath(); ctx.moveTo(bx0, y0); ctx.quadraticCurveTo(bx0 - 14, (y0 + y1) / 2, bx0 - 22, y1);
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = '#7A0C5E'; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 140, 228, 0.6)'; ctx.lineWidth = 0.5; ctx.save(); ctx.translate(-0.4, -0.6); ctx.stroke(); ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 0.4; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(bx0 - 24 + k * 1.5, y1 - 2); ctx.lineTo(bx0 - 23 + k * 1.5, y1 + 2); ctx.stroke(); }
    ctx.fillStyle = 'rgba(190, 40, 60, 0.7)'; ctx.beginPath(); ctx.ellipse(bx0 - 22, y1 + 2.5, 2.4, 1.2, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'; ctx.fillRect(bx0 + 3.2, by0 + 2, 0.8, bh - 6);

  // --- Rags of the jacket on his shoulders, pinstriped, threads hanging off the rips ---
  for (const s of [-1, 1]) {
    const X = (x: number) => (s < 0 ? x : 256 - x);
    const rag = () => { ctx.moveTo(X(-12), 112); ctx.lineTo(X(6), 70); ctx.lineTo(X(30), 48); ctx.lineTo(X(50), 54); ctx.lineTo(X(44), 64); ctx.lineTo(X(54), 78); ctx.lineTo(X(40), 80); ctx.lineTo(X(38), 96); ctx.lineTo(X(26), 90); ctx.lineTo(X(20), 108); ctx.lineTo(X(8), 100); ctx.lineTo(X(2), 124); ctx.closePath(); };
    const rg = ctx.createLinearGradient(X(-12), 50, X(50), 120);
    rg.addColorStop(0, '#0E1230'); rg.addColorStop(1, '#303A7A');
    shape(ctx, rag, rg, 1.2);
    ctx.save(); ctx.beginPath(); rag(); ctx.clip();
    ctx.strokeStyle = 'rgba(160, 170, 220, 0.2)'; ctx.lineWidth = 0.35;
    for (let k = -30; k < 70; k += 3.5) { ctx.beginPath(); ctx.moveTo(X(k), 44); ctx.lineTo(X(k - 14), 128); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(200, 240, 140, 0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(14), 80); ctx.quadraticCurveTo(X(22), 64, X(34), 58); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = 'rgba(200, 200, 230, 0.7)'; ctx.lineWidth = 0.3;
    for (const [x, y] of [[44, 64], [40, 80], [38, 96], [20, 108], [2, 124]] as const) { ctx.beginPath(); ctx.moveTo(X(x), y); ctx.quadraticCurveTo(X(x + 2), y + 3, X(x), y + 7 + Math.sin(x) * 0.6); ctx.stroke(); }
  }

  // (glints all over him)
  for (let i = 0; i < 40; i++) {
    const gx = 10 + hash(i * 6.3 + 1) * 236, gy = -40 + hash(i * 3.9 + 2) * 330;
    wetGlint(ctx, gx, gy, 1.2 + hash(i * 2.7) * 2.6, -0.5 + (hash(i) - 0.5) * 0.6);
  }

};

/** His painting: the still parts of it, painted once at the size it's shown and kept (from y = -ALIEN_TOP down). */
let alienPainted: { c: HTMLCanvasElement; sc: number } | null = null;

export const drawGrossAlien = (ctx: Ctx, t: number) => {
  ctx.save();
  backdrop(ctx, t, 128, 60, '#3E6A2A', '#030805', 'rgba(210, 255, 150, 0.045)');
  // (starting on the under-bite, down to his fists)
  ctx.translate(0, ALIEN_TOP - presTilt(t) * (ALIEN_H + ALIEN_TOP - H));
  const sc = ctx.getTransform().a;
  if (!alienPainted || alienPainted.sc !== sc) {
    const c = document.createElement('canvas'); c.width = Math.ceil(W * sc); c.height = Math.ceil((ALIEN_H + ALIEN_TOP) * sc);
    const g = c.getContext('2d')!; g.setTransform(sc, 0, 0, sc, 0, ALIEN_TOP * sc);
    paintAlien(g);
    alienPainted = { c, sc };
  }
  ctx.drawImage(alienPainted.c, 0, -ALIEN_TOP, alienPainted.c.width / sc, alienPainted.c.height / sc);

  // --- What moves on him ---
  const th = 1 + Math.max(0, Math.sin(t * 0.3)) * 0.2;  // (the veins throbbing, up over the traps, up his neck)
  const pump = Math.max(0, Math.sin(t * 0.16));         // (the throat sac, pumping: he breathes through his mouth)
  ctx.save(); ctx.beginPath(); ctx.rect(-20, -80, 78, 160); ctx.rect(198, -80, 80, 160); ctx.clip();
  purpleVein(ctx, [[74, -24], [62, -44], [44, -50], [28, -38], [16, -10], [8, 30]], 3, th);
  purpleVein(ctx, [[182, -24], [196, -46], [214, -48], [230, -32], [240, -4], [248, 34]], 2.8, th);
  ctx.restore();
  // The throat sac: frog-belly pale, swelling and going down as he breathes; little red veins in it, wrinkles across
  const sx = 30 + pump * 4, sy = 15 + pump * 3;
  const sg2 = ctx.createRadialGradient(122, 18 - pump, 2, 128, 22, sx);
  sg2.addColorStop(0, '#E6E0AE'); sg2.addColorStop(0.55, '#B0AA64'); sg2.addColorStop(1, '#6A6834');
  shape(ctx, () => ctx.ellipse(128, 22, sx, sy, 0, 0, Math.PI * 2), sg2, 1.1);
  ctx.save(); ctx.beginPath(); ctx.ellipse(128, 22, sx, sy, 0, 0, Math.PI * 2); ctx.clip();
  ctx.strokeStyle = 'rgba(46, 46, 22, 0.5)'; ctx.lineWidth = 0.5;
  for (let k = 0; k < 6; k++) { const y = 12 + k * 4 - pump * 2 + k * pump; ctx.beginPath(); ctx.moveTo(100, y); ctx.quadraticCurveTo(128, y + 4, 156, y); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(190, 40, 50, 0.55)'; ctx.lineWidth = 0.3;
  for (let k = 0; k < 7; k++) { const vx = 104 + k * 8; ctx.beginPath(); ctx.moveTo(vx, 10 + hash(k) * 6); ctx.quadraticCurveTo(vx + 3, 18, vx + (hash(k * 3) - 0.5) * 6, 30); ctx.lineTo(vx + 3, 34); ctx.stroke(); }
  speckle(ctx, 96, 4, 64, 36, 160, 'rgba(46, 46, 22, 0.4)', 33, 0.4);
  ctx.restore();
  wetGlint(ctx, 112, 12 - pump, 4, -0.3);
  ctx.save(); ctx.beginPath(); ctx.rect(56, 2, 144, 46); ctx.clip();
  purpleVein(ctx, [[80, -40], [84, -14], [94, 14], [102, 40], [108, 56]], 2.6, th);
  purpleVein(ctx, [[178, -42], [172, -14], [164, 16], [158, 46]], 2.3, th);
  ctx.restore();
  // (the thread, and the button on the end of it, swinging)
  const bs = Math.sin(t * 0.2) * 1.4;
  ctx.strokeStyle = '#D0D0D0'; ctx.lineWidth = 0.3; ctx.beginPath(); ctx.moveTo(156, 72); ctx.quadraticCurveTo(158, 78, 157 + bs, 84); ctx.stroke();
  shape(ctx, () => ctx.arc(157 + bs, 85.5, 1.8, 0, Math.PI * 2), '#F8F8F0', 0.4);
  ctx.fillStyle = 'rgba(60, 60, 60, 0.8)'; ctx.fillRect(156.3 + bs, 85, 0.5, 0.5); ctx.fillRect(157.5 + bs, 85, 0.5, 0.5);
  const MOUTH = -34;
  // (a string of spit between two of them)
  ctx.strokeStyle = 'rgba(220, 240, 190, 0.6)'; ctx.lineWidth = 0.35; ctx.beginPath(); ctx.moveTo(104, MOUTH - 6); ctx.quadraticCurveTo(106, MOUTH - 3 + Math.sin(t * 0.1), 109, MOUTH - 7); ctx.stroke();
  // Drool off his lip, swinging, a long rope of it down onto his neck
  const sw = Math.sin(t * 0.07) * 3, dl = 26 + (t * 0.25) % 30;
  ctx.strokeStyle = 'rgba(200, 240, 140, 0.75)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(176, MOUTH + 4); ctx.quadraticCurveTo(179 + sw * 0.5, MOUTH + dl * 0.5, 177 + sw, MOUTH + dl); ctx.stroke();
  shape(ctx, () => ctx.ellipse(177 + sw, MOUTH + 1 + dl, 1.8, 2.6, 0, 0, Math.PI * 2), 'rgba(200, 240, 140, 0.85)', 0);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(176.4 + sw, MOUTH + dl, 0.7, 0.7);
  // (the slime strung between his fingers)
  for (const s of [-1, 1]) {
    const X = (x: number) => (s < 0 ? x : 256 - x);
    // (slime strung between the fingers, sagging)
    ctx.strokeStyle = 'rgba(168, 224, 58, 0.7)'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(X(21), 316); ctx.quadraticCurveTo(X(22.5), 324 + Math.sin(t * 0.09 + s) * 1.5, X(24), 316); ctx.stroke();
  }
  // (the ray gun's coil, pulsing, and the pink light off it on him)
  const pulse = 0.6 + Math.sin(t * 0.4) * 0.4, bx0 = 236, bw = 14, by0 = 202, bh = 92;
  const pg = ctx.createRadialGradient(230, 244, 1, 230, 244, 34);
  pg.addColorStop(0, `rgba(255, 140, 228, ${0.08 + pulse * 0.07})`); pg.addColorStop(1, 'rgba(255, 140, 228, 0)');
  ctx.fillStyle = pg; ctx.fillRect(196, 210, 68, 68);
  ctx.fillStyle = `rgba(255, ${Math.round(120 + pulse * 100)}, 228, ${0.7 + pulse * 0.3})`;
  for (let r = 0; r < 4; r++) ctx.fillRect(bx0 + 4, by0 + 20 + r * 11, bw - 8, 6);
  ctx.fillStyle = `rgba(255, 140, 228, ${0.6 + pulse * 0.4})`; ctx.beginPath(); ctx.ellipse(bx0 + bw / 2, by0 + bh, bw / 2 - 1, 1.6, 0, 0, Math.PI * 2); ctx.fill();
  slimeRun(ctx, t, 234, by0 + 3, 40, 0.3, 0);
  // --- All of it wet: slime running down him, a string of it off the bottom of his gut, glints everywhere ---
  slimeRun(ctx, t, 46, 24, 60, 0.35, 0);
  slimeRun(ctx, t, 214, 30, 50, 0.3, 30);
  slimeRun(ctx, t, 96, 166, 50, 0.4, 12);
  slimeRun(ctx, t, 166, 168, 44, 0.33, 40);
  slimeRun(ctx, t, 130, 248, 30, 0.25, 8);
  slimeRun(ctx, t, 20, 190, 40, 0.3, 22);
  const st = (t * 0.5) % 50, sg3 = Math.sin(t * 0.06) * 2;
  ctx.strokeStyle = 'rgba(168, 224, 58, 0.7)'; ctx.lineWidth = Math.max(0.3, 1.4 - st / 40);
  ctx.beginPath(); ctx.moveTo(104, 303); ctx.quadraticCurveTo(105 + sg3, 303 + st * 0.5, 104 + sg3, 306 + st); ctx.stroke();
  shape(ctx, () => ctx.ellipse(104 + sg3, 307 + st, 1.6, 2.2, 0, 0, Math.PI * 2), 'rgba(168, 224, 58, 0.85)', 0);
  ctx.restore();
  finish(ctx, t);
};
