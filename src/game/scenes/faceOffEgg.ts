// The weapon-get screen's easter egg (P, or the pad's top button, held as it fades in): the camera finds him in a
// men's room, from behind, pants and the belt down round his ankles the way he does it everywhere, his hairy ass out,
// going at a urinal. He finishes, shakes, turns round (and he's standing to attention, for some reason), and decks
// the camera all the same. Painted the same gross-up way as the face-off (faceOff.ts), in its coordinates.

import { INK, hash, shape, speckle } from './art/ink';
import { vein, bead } from './grossUp';
import { SKIN_LIT, SKIN, SKIN_MID, SKIN_DARK, skin, bulge, pores, groove, shadeIn, lats, torso, traps, neck, head, guardArm, boot } from './faceOff';

type Ctx = CanvasRenderingContext2D;

/** How long it all takes before the face-off picks up as usual (ms, from when he's faded in). */
export const EGG_PEE_MS = 2500, EGG_SHAKE_MS = 450, EGG_TURN_MS = 380;
export const EGG_MS = EGG_PEE_MS + EGG_SHAKE_MS + EGG_TURN_MS;

/** Hair: short dark strokes scattered inside a path, leaning one way. */
const hairs = (ctx: Ctx, path: () => void, x: number, y: number, w: number, h: number, n: number, seed: number, lean = 1, a = 0.55) => {
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  ctx.strokeStyle = `rgba(35, 18, 6, ${a})`; ctx.lineWidth = 0.4;
  for (let k = 0; k < n; k++) {
    const hx = x + hash(k * 3 + seed) * w, hy = y + hash(k * 7 + seed) * h;
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx + lean * 1.2, hy + 1, hx + lean * 0.6, hy + 2.6); ctx.stroke();
  }
  ctx.restore();
};

/** The urinal on the wall: white porcelain, the bowl, the chrome flush valve, a puddle under it. */
const urinal = (ctx: Ctx) => {
  // (the chrome pipe and valve over it)
  const pg = ctx.createLinearGradient(94, 0, 106, 0);
  pg.addColorStop(0, '#64748B'); pg.addColorStop(0.35, '#F1F5F9'); pg.addColorStop(1, '#475569');
  shape(ctx, () => ctx.rect(95, 120, 10, 82), pg, 1.6);
  shape(ctx, () => ctx.roundRect(88, 150, 24, 14, 4), pg, 1.6);
  // (the porcelain: wide at the top, the bowl bellying out, a lip at the bottom)
  const body = () => { ctx.moveTo(40, 196); ctx.lineTo(160, 196); ctx.bezierCurveTo(166, 250, 160, 300, 140, 334); ctx.quadraticCurveTo(100, 350, 60, 334); ctx.bezierCurveTo(40, 300, 34, 250, 40, 196); ctx.closePath(); };
  const g = ctx.createLinearGradient(40, 0, 160, 0);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.4, '#F1F5F9'); g.addColorStop(0.8, '#CBD5E1'); g.addColorStop(1, '#94A3B8');
  shape(ctx, body, g, 2.6);
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  // (inside it, in shadow; the cake; a stain)
  const ig = ctx.createRadialGradient(100, 300, 4, 100, 300, 44);
  ig.addColorStop(0, '#E2D9A8'); ig.addColorStop(0.6, '#CBD5E1'); ig.addColorStop(1, 'rgba(203,213,225,0)');
  ctx.fillStyle = ig; ctx.fillRect(40, 250, 120, 100);
  shape(ctx, () => ctx.roundRect(88, 318, 24, 9, 3), '#60A5FA', 1);
  ctx.fillStyle = 'rgba(161, 98, 7, 0.25)'; ctx.beginPath(); ctx.ellipse(100, 336, 26, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(46, 202, 4, 70);
  // (the puddle on the floor under it, catching the light)
  ctx.fillStyle = 'rgba(253, 224, 71, 0.35)'; ctx.beginPath(); ctx.ellipse(100, 433, 50, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(80, 431, 18, 1);
};

/** The pants, bunched down round his ankles over the boots, and the belt lying slack across them, buckle and all. */
const pantsDown = (ctx: Ctx, front: boolean) => {
  for (const s of [-1, 1]) {
    const X = (x: number) => 100 + s * (x - 100);
    const bunch = () => { ctx.moveTo(X(38), 404); ctx.bezierCurveTo(X(34), 386, X(44), 376, X(56), 378); ctx.bezierCurveTo(X(70), 372, X(90), 376, X(98), 382); ctx.bezierCurveTo(X(104), 392, X(100), 402, X(96), 406); ctx.closePath(); };
    const g = ctx.createLinearGradient(0, 374, 0, 406);
    g.addColorStop(0, '#2B4CA8'); g.addColorStop(0.5, '#1E3A8A'); g.addColorStop(1, '#0F1B3D');
    shape(ctx, bunch, g, 2.4);
    ctx.save(); ctx.beginPath(); bunch(); ctx.clip();
    // (folds on folds, the white of a pocket lining turned out)
    ctx.strokeStyle = 'rgba(8, 14, 40, 0.75)'; ctx.lineWidth = 1.3;
    for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(X(40 + k * 3), 386 + k * 5); ctx.quadraticCurveTo(X(68), 380 + k * 6, X(98 - k * 2), 388 + k * 4); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(147, 170, 230, 0.4)'; ctx.lineWidth = 0.7;
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(X(42 + k * 3), 384 + k * 5); ctx.quadraticCurveTo(X(68), 378 + k * 6, X(96 - k * 2), 386 + k * 4); ctx.stroke(); }
    ctx.restore();
    if (s < 0) shape(ctx, () => ctx.roundRect(X(60), 380, 14, 8, 2), '#E5E7EB', 1);
  }
  // The belt, slack across both ankles, the buckle on top (front) or the strap's end trailing (behind)
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(40, 388); ctx.quadraticCurveTo(100, 404, 160, 386); ctx.stroke();
  ctx.strokeStyle = '#7A3610'; ctx.lineWidth = 6.4; ctx.beginPath(); ctx.moveTo(40, 388); ctx.quadraticCurveTo(100, 404, 160, 386); ctx.stroke();
  ctx.strokeStyle = 'rgba(253, 230, 138, 0.5)'; ctx.lineWidth = 0.5; ctx.setLineDash([2, 1.6]); ctx.beginPath(); ctx.moveTo(42, 386); ctx.quadraticCurveTo(100, 402, 158, 384); ctx.stroke(); ctx.setLineDash([]);
  if (front) {
    const bkg = ctx.createLinearGradient(90, 388, 110, 406);
    bkg.addColorStop(0, '#FEF3C7'); bkg.addColorStop(0.3, '#FACC15'); bkg.addColorStop(0.7, '#CA8A04'); bkg.addColorStop(1, '#713F12');
    shape(ctx, () => ctx.roundRect(90, 388, 20, 17, 2), bkg, 1.8);
    shape(ctx, () => ctx.roundRect(94, 392, 12, 9, 1.5), '#5B2A0C', 1);
  } else {
    ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(150, 388); ctx.quadraticCurveTo(170, 410, 178, 430); ctx.stroke();
    ctx.strokeStyle = '#7A3610'; ctx.lineWidth = 5.4; ctx.beginPath(); ctx.moveTo(150, 388); ctx.quadraticCurveTo(170, 410, 178, 430); ctx.stroke();
  }
};

/** A bare leg, hip to ankle: the thigh's sweep, the knee, the calf like a ham, hairy all over, a vein down it. */
const bareLeg = (ctx: Ctx, s: number, back: boolean) => {
  const X = (x: number) => 100 + s * (x - 100);
  const leg = () => {
    ctx.moveTo(X(58), 240); ctx.bezierCurveTo(X(44), 268, X(46), 304, X(54), 330);
    ctx.bezierCurveTo(X(44), 350, X(46), 372, X(56), 392); ctx.lineTo(X(86), 392);
    ctx.bezierCurveTo(X(92), 370, X(94), 348, X(88), 332); ctx.bezierCurveTo(X(96), 306, X(100), 284, X(100), 250); ctx.closePath();
  };
  skin(ctx, leg, X(44), 240, X(100), 392);
  pores(ctx, leg, Math.min(X(44), X(100)), 240, 56, 152, 90 + s, 160);
  shadeIn(ctx, leg, Math.min(X(44), X(100)), 300, 56, 92, 0.22);
  hairs(ctx, leg, Math.min(X(44), X(100)), 250, 56, 140, 70, 13 + s, s);
  // (the quad's teardrop over the knee, or behind, the hamstring's split and the crease of the knee)
  if (back) { groove(ctx, [X(72), 262, X(70), 286, X(70), 306, X(72), 326], 1.4, 0.5); groove(ctx, [X(58), 332, X(66), 336, X(78), 336, X(86), 332], 1.6, 0.6); }
  else { groove(ctx, [X(60), 300, X(64), 316, X(72), 324, X(84), 322], 1.4, 0.55); shape(ctx, () => ctx.ellipse(X(72), 334, 9, 6, 0, 0, Math.PI * 2), 'rgba(246, 207, 156, 0.6)', 0); }
  groove(ctx, [X(56), 346, X(54), 358, X(58), 372, X(62), 386], 1.2, 0.45);
  vein(ctx, [[X(78), 344], [X(80), 356], [X(78), 370], [X(80), 384]], 1.1, 1);
};

/** His ass: two great slabs of it, lit on the left, the crack between, hairy, a zit, sweat; and the lower back over it. */
const glutes = (ctx: Ctx, clench: number) => {
  for (const s of [-1, 1]) {
    const X = (x: number) => 100 + s * (x - 100);
    const cheek = () => { ctx.moveTo(X(100), 226); ctx.bezierCurveTo(X(70), 220, X(52), 232, X(54), 258); ctx.bezierCurveTo(X(54), 286, X(76), 298, X(100), 292); ctx.closePath(); };
    ctx.save(); ctx.translate(0, 3); ctx.beginPath(); cheek(); ctx.fillStyle = 'rgba(60, 30, 10, 0.5)'; ctx.fill(); ctx.restore();
    bulge(ctx, cheek, X(76 + clench), 256, 30, 2.6);
    pores(ctx, cheek, Math.min(X(52), X(100)), 220, 48, 76, 120 + s, 140);
    hairs(ctx, cheek, Math.min(X(52), X(100)), 224, 48, 70, 46, 30 + s, -s, 0.5);
    // (the dimple on the side as he clenches, the crease under it)
    groove(ctx, [X(58), 252, X(60), 258, X(60), 264, X(58), 268], 1.2, 0.3 + clench * 0.08);
    groove(ctx, [X(98), 290, X(86), 296, X(70), 294, X(60), 286], 1.6, 0.65);
  }
  // (the crack, hair down it)
  groove(ctx, [100, 228, 101, 250, 99, 272, 100, 292], 2, 0.85);
  hairs(ctx, () => ctx.rect(94, 226, 12, 60), 94, 226, 12, 60, 30, 77, 0, 0.7);
  // (a zit, and sweat)
  shape(ctx, () => ctx.arc(118, 244, 1.8, 0, Math.PI * 2), '#E57A5A', 0.4); ctx.fillStyle = '#FEF9C3'; ctx.fillRect(117.5, 243.2, 1, 1);
  for (const [x, y, r] of [[72, 240, 1.3], [128, 262, 1.1], [86, 272, 1]] as const) bead(ctx, x, y, r);
};

/** His back: the slab of it from the traps to the belt line, the shoulder blades, the spine down the middle, the hair. */
const back = (ctx: Ctx, t: number) => {
  lats(ctx);
  const path = () => { ctx.moveTo(50, 100); ctx.lineTo(60, 236); ctx.lineTo(140, 236); ctx.lineTo(150, 100); ctx.closePath(); };
  skin(ctx, path, 50, 100, 150, 236);
  pores(ctx, path, 50, 100, 100, 136, 141, 260);
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  // (the shoulder blades, standing out, and the rhomboids between)
  for (const s of [-1, 1]) {
    const X = (x: number) => 100 + s * (x - 100);
    const blade = () => { ctx.moveTo(X(92), 112); ctx.bezierCurveTo(X(66), 108, X(58), 126, X(64), 150); ctx.bezierCurveTo(X(74), 160, X(86), 150, X(92), 112); ctx.closePath(); };
    bulge(ctx, blade, X(76), 130, 20, 1.2);
    groove(ctx, [X(92), 120, X(84), 136, X(76), 156, X(66), 170], 1.4, 0.5);
    // (the erectors, either side of the spine, down into the low back)
    groove(ctx, [X(91), 168, X(89), 190, X(89), 214, X(92), 236], 1.3, 0.45);
    groove(ctx, [X(60), 180, X(70), 196, X(80), 210, X(88), 232], 1.2, 0.4);
  }
  // (the spine: a deep groove between the erectors, the knobs of it up top)
  groove(ctx, [100, 104, 100, 150, 100, 200, 100, 236], 2.2, 0.75);
  for (let k = 0; k < 5; k++) shape(ctx, () => ctx.ellipse(100, 104 + k * 9, 1.8, 1.4, 0, 0, Math.PI * 2), 'rgba(246, 207, 156, 0.7)', 0);
  // (hair across the shoulders and down the small of the back; a few zits; sweat running)
  hairs(ctx, () => ctx.rect(60, 100, 80, 30), 60, 100, 80, 30, 60, 5, 1, 0.4);
  hairs(ctx, () => ctx.rect(76, 206, 48, 30), 76, 206, 48, 30, 50, 9, 0, 0.55);
  for (const [x, y] of [[84, 118], [122, 126], [112, 140]] as const) { shape(ctx, () => ctx.arc(x, y, 1.4, 0, Math.PI * 2), '#D9785A', 0.3); }
  ctx.restore();
  for (const [x, y, r] of [[70, 140, 1.4], [132, 150, 1.2], [96, 170, 1.1]] as const) bead(ctx, x, y, r);
  const run = (t / 30) % 50; bead(ctx, 104, 180 + run, 1.3);
};

/** The back of his head: the flat-top from behind, clippered right up the back, the ears, the folds of the neck. */
const backOfHead = (ctx: Ctx) => {
  // (the neck: as wide as his head, the rolls at the back of it)
  const nk = () => { ctx.moveTo(76, 56); ctx.lineTo(74, 92); ctx.lineTo(126, 92); ctx.lineTo(124, 56); ctx.closePath(); };
  skin(ctx, nk, 74, 56, 126, 92, 2.4);
  groove(ctx, [78, 70, 92, 74, 108, 74, 122, 70], 1.6, 0.65); groove(ctx, [80, 80, 92, 83, 108, 83, 120, 80], 1.4, 0.5);
  groove(ctx, [100, 74, 100, 80, 100, 86, 100, 92], 1.6, 0.6);
  for (const s of [-1, 1]) {
    const X = (x: number) => 100 + s * (x - 100);
    const ear = () => { ctx.moveTo(X(68), 36); ctx.bezierCurveTo(X(54), 34, X(55), 58, X(69), 58); ctx.closePath(); };
    skin(ctx, ear, X(54), 34, X(69), 58, 2);
    ctx.strokeStyle = 'rgba(90, 45, 15, 0.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(60), 40); ctx.quadraticCurveTo(X(57), 48, X(62), 55); ctx.stroke();
  }
  // (the skull from behind: clippered dark, skin showing through low down, the flat-top on top)
  const sk = () => { ctx.moveTo(68, 11); ctx.lineTo(132, 11); ctx.lineTo(132, 58); ctx.quadraticCurveTo(100, 66, 68, 58); ctx.closePath(); };
  const g = ctx.createLinearGradient(0, 11, 0, 64);
  g.addColorStop(0, '#27272A'); g.addColorStop(0.55, '#3F3F46'); g.addColorStop(1, '#B98A5A');
  shape(ctx, sk, g, 2.6);
  speckle(ctx, 68, 26, 64, 36, 520, 'rgba(10, 10, 10, 0.55)', 81, 0.55);
  ctx.save(); ctx.beginPath(); sk(); ctx.clip();
  ctx.lineWidth = 0.55;
  for (let k = 0; k < 90; k++) { const x = 68 + k * 0.72 + hash(k) * 0.6; ctx.strokeStyle = k % 3 ? 'rgba(0,0,0,0.7)' : 'rgba(161, 161, 170, 0.6)'; ctx.beginPath(); ctx.moveTo(x, 26); ctx.lineTo(x + (hash(k * 3) - 0.5) * 0.8, 11 + hash(k * 5) * 2); ctx.stroke(); }
  ctx.fillStyle = 'rgba(228, 228, 231, 0.55)'; ctx.fillRect(68, 11, 64, 1.4);
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 0.6;
  for (let k = 0; k < 32; k++) { const x = 69 + k * 2; ctx.beginPath(); ctx.moveTo(x, 11); ctx.lineTo(x + (hash(k) - 0.5), 9 - hash(k * 7) * 1.5); ctx.stroke(); }
  for (const [x, y, r] of [[80, 50, 1.2], [118, 46, 1]] as const) bead(ctx, x, y, r);
};

/** An arm from behind, the hand round front holding it: the delt, the triceps' horseshoe, the elbow out, the forearm going forward. */
const backArm = (ctx: Ctx, s: number, t: number) => {
  const X = (x: number) => 100 + s * (x - 100);
  const upper = () => { ctx.moveTo(X(172), 112); ctx.bezierCurveTo(X(186), 150, X(178), 188, X(160), 196); ctx.bezierCurveTo(X(146), 190, X(142), 150, X(148), 116); ctx.closePath(); };
  bulge(ctx, upper, X(164), 150, 28);
  pores(ctx, upper, Math.min(X(142), X(186)), 112, 44, 84, 160 + s, 90);
  // (the horseshoe of the triceps)
  groove(ctx, [X(152), 140, X(160), 170, X(172), 170, X(176), 142], 1.4, 0.55);
  vein(ctx, [[X(170), 172], [X(166), 182], [X(160), 190]], 1.2, 1 + Math.sin(t / 240 + s) * 0.1);
  // (the forearm's gone round in front of him, out of sight: just the elbow sticking back)
  // (the elbow, rough)
  shape(ctx, () => ctx.ellipse(X(160), 194, 5, 4, 0, 0, Math.PI * 2), 'rgba(185, 120, 80, 0.7)', 0.6);
  const delt = () => ctx.arc(X(160), 104, 24, 0, Math.PI * 2);
  bulge(ctx, delt, X(160), 104, 24, 2.6);
  for (let k = 0; k < 4; k++) groove(ctx, [X(148 + k * 6), 86, X(150 + k * 6), 96, X(152 + k * 6), 108, X(150 + k * 7), 122], 0.7, 0.3);
};

/** The stream: what can be seen of it from behind (between his legs, into the bowl), splashing. */
const stream = (ctx: Ctx, t: number, flow: number) => {
  if (flow <= 0) return;
  const w = 1.4 + flow * 1.6, wob = Math.sin(t / 60) * 1.5;
  ctx.strokeStyle = 'rgba(234, 179, 8, 0.9)'; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(100, 296); ctx.quadraticCurveTo(100 + wob, 306, 101, 318); ctx.stroke();
  ctx.strokeStyle = 'rgba(254, 249, 195, 0.8)'; ctx.lineWidth = w * 0.35; ctx.beginPath(); ctx.moveTo(99.5, 297); ctx.quadraticCurveTo(99.5 + wob, 306, 100.5, 317); ctx.stroke();
  for (let k = 0; k < 6; k++) {
    const a = ((t / 40 + k * 7) % 10) / 10, dx = (hash(k + Math.floor(t / 400)) - 0.5) * 18 * a;
    ctx.fillStyle = `rgba(253, 224, 71, ${0.9 - a * 0.7})`; ctx.fillRect(101 + dx, 318 - Math.sin(a * Math.PI) * 8 * flow, 1.6, 1.6);
  }
};

/** From behind, at the urinal. `p`: ms into it; the stream runs, tails off, then he shakes. */
export const drawEggBack = (ctx: Ctx, p: number) => {
  const flow = p < EGG_PEE_MS - 400 ? 1 : Math.max(0, (EGG_PEE_MS - p) / 400);
  const shaking = p > EGG_PEE_MS && p < EGG_PEE_MS + EGG_SHAKE_MS;
  const jig = shaking ? Math.sin(p / 22) * 2 : 0;
  urinal(ctx);
  stream(ctx, p, flow);
  for (const s of [-1, 1]) boot(ctx, s);
  for (const s of [-1, 1]) bareLeg(ctx, s, true);
  pantsDown(ctx, false);
  ctx.save(); ctx.translate(0, jig * 0.4);
  glutes(ctx, shaking ? 2 : 0);
  ctx.translate(jig, 0);
  back(ctx, p);
  traps(ctx);
  backOfHead(ctx);
  // (the arms, hands round front on it: shaking it off at the end)
  for (const s of [-1, 1]) { ctx.save(); ctx.translate(0, s < 0 ? jig : 0); backArm(ctx, s, p); ctx.restore(); }
  ctx.restore();
};

/** The front of him with it all out: bare legs, the pants round his ankles, the hair, the balls, and it, standing up. */
const groin = (ctx: Ctx, t: number, boing: number) => {
  // (the hips, bare: the V of the obliques down into it, the skin paler where the pants were)
  const hips = () => { ctx.moveTo(58, 228); ctx.lineTo(142, 228); ctx.bezierCurveTo(146, 244, 144, 256, 140, 262); ctx.lineTo(100, 280); ctx.lineTo(60, 262); ctx.bezierCurveTo(56, 256, 54, 244, 58, 228); ctx.closePath(); };
  const g = ctx.createLinearGradient(58, 0, 142, 0);
  g.addColorStop(0, '#F9DCB4'); g.addColorStop(0.4, '#ECC08A'); g.addColorStop(1, SKIN_MID);
  shape(ctx, hips, g, 0);
  ctx.save(); ctx.beginPath(); hips(); ctx.clip();
  ctx.fillStyle = 'rgba(224, 172, 105, 0.6)'; ctx.fillRect(56, 226, 90, 5); // (the tan line)
  groove(ctx, [70, 228, 80, 240, 90, 250, 96, 258], 1.6, 0.6); groove(ctx, [130, 228, 120, 240, 110, 250, 104, 258], 1.6, 0.6);
  ctx.restore();
  // (the hair: a dark bush, curls off its edges, the trail up into it)
  const bush = () => ctx.ellipse(100, 254, 17, 9, 0, 0, Math.PI * 2);
  const bg = ctx.createRadialGradient(100, 254, 2, 100, 254, 17);
  bg.addColorStop(0, '#3B2412'); bg.addColorStop(0.7, 'rgba(59, 36, 18, 0.85)'); bg.addColorStop(1, 'rgba(59, 36, 18, 0.2)');
  shape(ctx, bush, bg, 0);
  hairs(ctx, bush, 83, 245, 34, 18, 90, 301, 1, 0.8);
  ctx.strokeStyle = '#2A170B'; ctx.lineWidth = 0.6;
  for (let k = 0; k < 26; k++) { const a = Math.PI * (k / 13), r = 16 + hash(k) * 3; ctx.beginPath(); ctx.arc(100 + Math.cos(a) * r, 254 + Math.sin(a) * r * 0.55, 1.4, 0, Math.PI * 1.4); ctx.stroke(); }
  speckle(ctx, 84, 246, 32, 16, 60, 'rgba(90, 60, 30, 0.6)', 201, 0.5);
  // (his balls: hanging, one lower, wrinkled, a few hairs)
  for (const [bx, by, r] of [[93, 276, 9], [107, 279, 8.6]] as const) {
    const ball = () => ctx.ellipse(bx, by, r, r * 1.12, 0, 0, Math.PI * 2);
    bulge(ctx, ball, bx, by, r, 1.8);
    ctx.save(); ctx.beginPath(); ball(); ctx.clip();
    ctx.strokeStyle = 'rgba(110, 55, 25, 0.5)'; ctx.lineWidth = 0.5;
    for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(bx - r + k * 3, by - r); ctx.quadraticCurveTo(bx - r + 2 + k * 3, by, bx - r + k * 3, by + r); ctx.stroke(); }
    ctx.restore();
  }
  groove(ctx, [100, 270, 100.5, 276, 100, 282, 100, 288], 1, 0.6);
  // (it: standing straight up, tilted a little, bobbing from the turn; shaded, a vein, the head)
  ctx.save();
  ctx.translate(100, 262);
  ctx.rotate(-0.22 + Math.sin(t / 70) * 0.18 * boing);
  const shaft = () => ctx.roundRect(-6.5, -44, 13, 46, 6);
  const sg = ctx.createLinearGradient(-6.5, 0, 6.5, 0);
  sg.addColorStop(0, SKIN_LIT); sg.addColorStop(0.45, SKIN); sg.addColorStop(1, SKIN_DARK);
  shape(ctx, shaft, sg, 2.2);
  pores(ctx, shaft, -6.5, -44, 13, 46, 211, 30);
  vein(ctx, [[-2, 0], [-3, -12], [-1, -24], [-3, -34]], 1.3, 1 + Math.sin(t / 150) * 0.15);
  ctx.fillStyle = 'rgba(255, 240, 215, 0.6)'; ctx.fillRect(-4.5, -38, 1.6, 30);
  const tip = () => { ctx.moveTo(-7.4, -40); ctx.bezierCurveTo(-8, -54, 8, -54, 7.4, -40); ctx.quadraticCurveTo(0, -36, -7.4, -40); ctx.closePath(); };
  const tg = ctx.createRadialGradient(-2, -48, 1, 0, -44, 10);
  tg.addColorStop(0, '#F2A890'); tg.addColorStop(0.6, '#D9876E'); tg.addColorStop(1, '#A0523D');
  shape(ctx, tip, tg, 2);
  ctx.strokeStyle = '#6E2A1C'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(0, -51); ctx.lineTo(0, -47); ctx.stroke();
  ctx.fillStyle = 'rgba(255, 235, 225, 0.8)'; ctx.fillRect(-4, -49, 2.4, 1.2);
  ctx.restore();
};

/** The face-off, as drawFaceOff, but bare from the waist down at the urinal (see the top of the file). */
export const drawEggFront = (ctx: Ctx, t: number, windup: number, punching: boolean, boing: number) => {
  const breathe = 1 + Math.sin(t / 420) * 0.012;
  urinal(ctx);
  ctx.save();
  ctx.translate(100, 200); ctx.scale(breathe, breathe); ctx.translate(-100, -200);
  for (const s of [-1, 1]) boot(ctx, s);
  for (const s of [-1, 1]) bareLeg(ctx, s, false);
  pantsDown(ctx, true);
  lats(ctx);
  torso(ctx, t);
  groin(ctx, t, boing);
  traps(ctx);
  neck(ctx, t, windup);
  head(ctx, t, windup, punching);
  ctx.restore();
  // (he's a lefty: the right stays up in the guard, it's the left, on our right, that draws back and goes)
  guardArm(ctx, -1, t);
  if (!punching) {
    ctx.save(); ctx.translate(windup * 14, windup * 10); ctx.translate(160, 104); ctx.rotate(windup * 14 * Math.PI / 180); ctx.translate(-160, -104);
    guardArm(ctx, 1, t);
    ctx.restore();
  } else {
    bulge(ctx, () => ctx.arc(148, 106, 30, 0, Math.PI * 2), 148, 106, 30, 2.8);
    for (let k = 0; k < 5; k++) groove(ctx, [164 - k * 7, 84, 162 - k * 7, 98, 160 - k * 7, 112, 162 - k * 8, 128], 0.8, 0.35);
  }
};
