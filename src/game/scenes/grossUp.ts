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
