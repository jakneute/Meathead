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
const vein = (ctx: Ctx, pts: number[][], w: number, throb: number) => {
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
const bead = (ctx: Ctx, x: number, y: number, r: number) => {
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
