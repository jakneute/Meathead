// The thing in the cistern: a great heaving mound of the muck up out of its
// pool, and everyone the water killed in it. Bones and skulls drifting about
// inside, hands and faces pressed against the inside of its skin (the faces
// all talk at once), two huge arms made of arms. When it's had what it asked
// for it shivers and glows; when it's ignored, one of the arms goes up and up
// and comes down on the walkway. And it dies the way it's killed: frozen and
// shattered, boiled down to charred bones, burst like a water balloon with
// the bodies spilling out, thinned out by clean water till there's nothing
// holding them together, or just melting down into the pool.

import type { Enemy } from '../../../types';
import type { GameState } from '../../core/state';
import { GROUND_Y } from '../../../constants';
import { COURSE, WALK_Y } from './course';
import { Thing, FIST_UP, FIST_LAND, FIST_DONE, WANT_NAME, THING_SURFACE, NEED, inGrace, GRACE_FRAMES } from './thing';
import { getTommy } from './runtime';
import { saying } from './script';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** What's floating around in it (from its middle): what, where, how big, how it turns. */
const REMAINS = Array.from({ length: 16 }, (_, i) => ({
  look: ['skull', 'ribs', 'hand', 'skull', 'femur', 'shoe', 'skull', 'hand'][i % 8],
  x: (hash(i * 3.1) - 0.5) * 220, y: -60 - hash(i * 5.7) * 260, s: 0.8 + hash(i * 7.3) * 0.6, spin: (hash(i * 9.1) - 0.5) * 0.02, phase: hash(i) * 6,
}));
/** Faces pressed against its skin, and hands. */
const FACES = [{ x: -40, y: -300, s: 1.3 }, { x: 36, y: -280, s: 1.1 }, { x: -70, y: -210, s: 1 }, { x: 60, y: -190, s: 1.2 }, { x: -10, y: -150, s: 0.9 }, { x: 0, y: -330, s: 1 }];

const drawRemain = (ctx: Ctx, look: string, alpha: number) => {
  ctx.fillStyle = `rgba(231, 229, 214, ${alpha})`; ctx.strokeStyle = `rgba(231, 229, 214, ${alpha})`;
  switch (look) {
    case 'skull': ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-5, 6, 10, 6); ctx.fillStyle = `rgba(20, 20, 10, ${alpha})`; ctx.fillRect(-5, -2, 4, 4); ctx.fillRect(2, -2, 4, 4); ctx.fillRect(-1, 3, 2, 3); break;
    case 'ribs': ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(0, 14); for (let k = -10; k <= 10; k += 5) { ctx.moveTo(0, k); ctx.quadraticCurveTo(-12, k + 2, -10, k + 8); ctx.moveTo(0, k); ctx.quadraticCurveTo(12, k + 2, 10, k + 8); } ctx.stroke(); break;
    case 'hand': ctx.fillRect(-5, -2, 10, 10); for (let k = 0; k < 4; k++) ctx.fillRect(-5 + k * 3, -10, 2, 9); ctx.fillRect(5, 0, 5, 2); break;
    case 'femur': ctx.fillRect(-14, -2, 28, 4); ctx.beginPath(); ctx.arc(-14, 0, 4, 0, Math.PI * 2); ctx.arc(14, 0, 4, 0, Math.PI * 2); ctx.fill(); break;
    case 'shoe': ctx.fillStyle = `rgba(244, 244, 245, ${alpha})`; ctx.fillRect(-10, -4, 20, 8); ctx.fillStyle = `rgba(220, 38, 38, ${alpha})`; ctx.fillRect(-10, 2, 20, 3); break;
  }
};

/** The body's outline: a mound, heaving, `h` tall, `w` across at the waterline. */
const bodyPath = (ctx: Ctx, w: number, h: number, f: number, sag: number) => {
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0);
  for (let k = 0; k <= 20; k++) {
    const a = Math.PI - (k / 20) * Math.PI;
    const r = 1 + Math.sin(k * 1.7 + f * 0.06) * 0.03;
    const x = Math.cos(a) * w / 2 * r * (1 + sag * 0.5), y = -Math.sin(a) * h * r * (1 - sag);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w / 2, 0);
  ctx.closePath();
};

export const drawThing = (ctx: Ctx, e: Enemy, th: Thing, state: GameState) => {
  const f = state.frame;
  const cx = e.pos.x + e.width / 2, base = THING_SURFACE;
  const rt = getTommy(state);
  const talking = !!rt && !!saying(rt.talk, 'thing');
  const d = th.death, dt = th.deathT;
  // Rising up out of the pool at the start
  const rise = th.phase === 'rise' ? clamp01(th.t / 90) : 1;
  // How it's going, dying
  const freeze = d === 'SHOTGUN' ? clamp01(dt / 60) : 0;
  const shattered = d === 'SHOTGUN' && dt > 130;
  const boil = d === 'FLAMETHROWER' ? clamp01(dt / 180) : 0;
  const burst = d === 'BOULDER' && dt > 50;
  const clear = d === 'TSUNAMI' ? clamp01(dt / 90) : 0;
  const melt = d && d !== 'SHOTGUN' && d !== 'BOULDER' ? clamp01((dt - (d === 'TSUNAMI' ? 90 : 0)) / 150) : 0;
  if (th.phase === 'dead' || th.phase === 'dying') { drawRemains(ctx, th, cx, base, f); if (shattered || burst || melt >= 1 || boil >= 1) return; }
  ctx.save();
  ctx.translate(cx, base + (1 - rise) * 380);
  const w = 330, h = 370;
  const sag = Math.max(melt, boil * 0.8);
  const bulge = d === 'BOULDER' ? 1 + clamp01(dt / 50) * 0.18 : 1;
  ctx.scale(bulge, bulge);
  // Its colour: the muck (going icy, boiling dark, or clearing as it dies)
  const tint = freeze > 0 ? `rgba(${Math.round(92 - freeze * 20)}, ${Math.round(104 + freeze * 80)}, ${Math.round(36 + freeze * 200)}, 0.9)`
    : clear > 0 ? `rgba(${Math.round(92 - clear * 40)}, ${Math.round(104 + clear * 60)}, ${Math.round(36 + clear * 170)}, ${0.85 - clear * 0.45})`
    : boil > 0 ? `rgba(${Math.round(92 - boil * 50)}, ${Math.round(80 - boil * 50)}, 30, 0.9)` : 'rgba(92, 104, 36, 0.88)';
  const glow = th.full > 0 ? 0.25 + Math.sin(f * 0.4) * 0.1 : 0;
  // The arms (behind): made of arms, reaching up out of the pool either side; the near one's the fist
  if (!d) drawArms(ctx, th, f, w, h);
  bodyPath(ctx, w, h, f + (th.full ? f * 0.6 : 0), sag);
  const g = ctx.createLinearGradient(0, -h, 0, 0);
  g.addColorStop(0, tint); g.addColorStop(1, 'rgba(38, 44, 14, 0.95)');
  ctx.fillStyle = g; ctx.fill();
  if (th.flash > 0) { ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fill(); }
  if (glow > 0) { ctx.fillStyle = `rgba(217, 249, 157, ${glow})`; ctx.fill(); }
  // What's in it
  ctx.save();
  bodyPath(ctx, w - 20, h - 20, f, sag); ctx.clip();
  for (const r of REMAINS) {
    const bob = Math.sin(f * 0.02 + r.phase) * 10;
    ctx.save(); ctx.translate(r.x + Math.sin(f * 0.013 + r.phase) * 8, r.y * (1 - sag) + bob); ctx.rotate(f * r.spin + r.phase); ctx.scale(r.s, r.s);
    drawRemain(ctx, r.look, clear > 0 ? 0.6 + clear * 0.4 : 0.45);
    ctx.restore();
  }
  ctx.restore();
  // The faces against its skin: eyes rolling toward him, mouths going when it talks
  const px = state.player.pos.x + state.player.width / 2;
  const look = px < cx ? -2 : 2;
  FACES.forEach((fc, i) => {
    ctx.save(); ctx.translate(fc.x + Math.sin(f * 0.03 + i) * 3, fc.y * (1 - sag)); ctx.scale(fc.s, fc.s);
    ctx.fillStyle = freeze > 0.5 ? 'rgba(186, 230, 253, 0.8)' : 'rgba(163, 170, 110, 0.9)';
    ctx.beginPath(); ctx.ellipse(0, 0, 16, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(38, 44, 14, 0.9)'; ctx.beginPath(); ctx.ellipse(-6, -5, 4, 5, 0, 0, Math.PI * 2); ctx.ellipse(6, -5, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FEF9C3'; ctx.fillRect(-7 + look, -6, 2, 2); ctx.fillRect(5 + look, -6, 2, 2);
    const open = talking && (f + i * 3) % 10 < 5 ? 7 : 2;
    ctx.fillStyle = '#1A2E05'; ctx.beginPath(); ctx.ellipse(0, 9, 5, open, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  // Hands pressed flat against the inside
  for (let k = 0; k < 5; k++) {
    const hx = -120 + k * 60 + Math.sin(f * 0.02 + k) * 6, hy = (-100 - hash(k * 11) * 120) * (1 - sag);
    ctx.fillStyle = `rgba(163, 170, 110, ${0.7 * (1 - sag)})`; ctx.fillRect(hx - 6, hy - 2, 12, 12); for (let q = 0; q < 4; q++) ctx.fillRect(hx - 6 + q * 3.5, hy - 12, 2.5, 10);
  }
  // Boiling: steam and bubbles; frozen: frost
  if (boil > 0) { ctx.fillStyle = 'rgba(214, 211, 209, 0.4)'; for (let k = 0; k < 6; k++) { const t = ((f * 1.5 + k * 25) % 120) / 120; ctx.beginPath(); ctx.arc(-120 + k * 50, -h * (1 - sag) - t * 120, 10 + t * 20, 0, Math.PI * 2); ctx.fill(); } }
  if (freeze > 0) { ctx.strokeStyle = `rgba(255,255,255,${freeze * 0.7})`; ctx.lineWidth = 2; for (let k = 0; k < 10; k++) { const a = hash(k) * Math.PI; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 100, -Math.sin(a) * 250); ctx.lineTo(Math.cos(a) * 140, -Math.sin(a) * 300); ctx.stroke(); } }
  ctx.restore();
};

/** The two arms, made of arms: the far one resting on the pool's lip, the near one the fist (up, over, and down). */
const drawArms = (ctx: Ctx, th: Thing, f: number, w: number, h: number) => {
  const limb = (x1: number, y1: number, x2: number, y2: number, r: number) => {
    ctx.strokeStyle = 'rgba(80, 92, 30, 0.95)'; ctx.lineWidth = r; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo((x1 + x2) / 2 + 30, Math.min(y1, y2) - 40, x2, y2); ctx.stroke();
    // (the arms it's made of, along it)
    ctx.strokeStyle = 'rgba(163, 170, 110, 0.5)'; ctx.lineWidth = 3;
    for (let k = 1; k < 5; k++) { const t = k / 5; const x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t - Math.sin(t * Math.PI) * 30; ctx.beginPath(); ctx.moveTo(x - 10, y - 6); ctx.lineTo(x + 10, y + 6); ctx.stroke(); }
  };
  // Far arm: resting, fingers drumming on the lip
  limb(w * 0.4, -h * 0.5, w * 0.62, -20, 46);
  // Near arm: the fist. Down at its side, or going up, or coming down on the walkway
  const reach = WALK_Y - GROUND_Y - 20;
  let fx = -w * 0.62, fy = -60;
  if (th.fist) {
    const t = th.fist;
    if (t < FIST_UP) { const k = t / FIST_UP; fx = -w * 0.62 - k * 120; fy = -60 - k * 480; }
    else if (t < FIST_LAND) { const k = (t - FIST_UP) / (FIST_LAND - FIST_UP); fx = -w * 0.62 - 120 - k * 200; fy = -540 + (k * k) * (540 + reach); }
    else { const k = clamp01((t - FIST_LAND) / (FIST_DONE - FIST_LAND)); fx = -w * 0.62 - 320 + k * 200; fy = reach - k * 80; }
  } else { fy = -60 + Math.sin(f * 0.04) * 10; }
  limb(-w * 0.35, -h * 0.55, fx, fy, 54);
  // The fist itself: a lump of fists
  ctx.fillStyle = 'rgba(80, 92, 30, 0.97)'; ctx.beginPath(); ctx.arc(fx, fy, 44, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(163, 170, 110, 0.7)'; for (let k = 0; k < 4; k++) ctx.fillRect(fx - 30 + k * 16, fy - 38, 12, 10);
  // Its shadow on the walkway, growing, while it's up there
  if (th.fist && th.fist < FIST_LAND) { const k = th.fist / FIST_LAND; ctx.fillStyle = `rgba(0,0,0,${0.15 + k * 0.4})`; ctx.beginPath(); ctx.ellipse(fx, reach + 4, 60 + k * 120, 8 + k * 6, 0, 0, Math.PI * 2); ctx.fill(); }
};

/** What's left of it: however it went. */
const drawRemains = (ctx: Ctx, th: Thing, cx: number, base: number, f: number) => {
  const d = th.death, dt = th.deathT;
  const walkL = COURSE.sewer.cistern.x1 + 180;
  ctx.save();
  if (d === 'SHOTGUN' && dt > 130) {
    // Shattered: chunks of ice flying, then a heap of them with frozen bits of people in it
    const k = clamp01((dt - 130) / 40);
    for (let i = 0; i < 26; i++) {
      const a = hash(i) * Math.PI, sp = 80 + hash(i * 3) * 220;
      const x = cx + Math.cos(a) * sp * k * (i % 2 ? 1 : -1), y = base - 180 + Math.sin(a) * -120 * k + k * k * 200;
      ctx.fillStyle = i % 3 ? 'rgba(186, 230, 253, 0.9)' : 'rgba(224, 242, 254, 0.95)';
      ctx.save(); ctx.translate(x, Math.min(y, base - 10)); ctx.rotate(i + k * 3); ctx.fillRect(-14, -10, 28, 20); ctx.restore();
      if (i % 4 === 0) { ctx.save(); ctx.translate(x, Math.min(y, base - 10)); drawRemain(ctx, REMAINS[i % REMAINS.length].look, 0.9); ctx.restore(); }
    }
  } else if (d === 'BOULDER' && dt > 50) {
    // Burst: the muck thrown right across the room, and the bodies spilled out onto the walkway
    const k = clamp01((dt - 50) / 30);
    ctx.fillStyle = `rgba(92, 104, 36, ${0.9 - k * 0.5})`; ctx.beginPath(); ctx.ellipse(cx - 200 * k, WALK_Y - 4, 120 + 260 * k, 14, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 9; i++) {
      const x = walkL + 30 + i * 36 + hash(i) * 12, y = WALK_Y - 6;
      const t = clamp01((dt - 50 - i * 3) / 30);
      ctx.save(); ctx.translate(cx + (x - cx) * t, base - 200 * (1 - t) - Math.sin(t * Math.PI) * 120 + (y - base) * t); ctx.rotate(t * (6 + i));
      drawCorpse(ctx, i);
      ctx.restore();
    }
  } else if (d === 'FLAMETHROWER' && dt > 150) {
    // Boiled down: charred bones in a smoking heap on the pool
    for (let i = 0; i < 10; i++) { ctx.save(); ctx.translate(cx - 120 + i * 26, base - 8 - hash(i) * 14); ctx.rotate(hash(i * 3) * 3); ctx.filter = 'brightness(0.3)'; drawRemain(ctx, REMAINS[i].look, 1); ctx.restore(); }
    ctx.fillStyle = 'rgba(68, 64, 60, 0.35)'; for (let k = 0; k < 4; k++) { const t = ((f * 0.7 + k * 30) % 120) / 120; ctx.beginPath(); ctx.arc(cx - 60 + k * 40, base - 20 - t * 160, 10 + t * 24, 0, Math.PI * 2); ctx.fill(); }
  } else if (d && (d === 'TSUNAMI' || d !== 'SHOTGUN') && dt > 150) {
    // Thinned out or melted down: the bodies floating face down in the pool (one hand still up, then not)
    for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(cx - 130 + i * 50, base - 4); ctx.rotate(Math.PI / 2 + Math.sin(f * 0.02 + i) * 0.05); drawCorpse(ctx, i); ctx.restore(); }
    if (d !== 'TSUNAMI' && dt < 400) { const k = clamp01((dt - 250) / 150); ctx.fillStyle = 'rgba(163, 170, 110, 0.9)'; ctx.fillRect(cx + 20, base - 40 * (1 - k), 10, 40 * (1 - k)); for (let q = 0; q < 4; q++) ctx.fillRect(cx + 20 + q * 2.5, base - 50 * (1 - k), 2, 10 * (1 - k)); }
  }
  ctx.restore();
};

/** One of them, out of it: a person, grey-green, a bit dissolved. */
const drawCorpse = (ctx: Ctx, i: number) => {
  const shirts = ['#78716C', '#9F1239', '#1E3A8A', '#A16207', '#3F6212', '#6B21A8'];
  ctx.fillStyle = 'rgba(120, 130, 90, 0.95)'; ctx.fillRect(-4, -26, 8, 8); ctx.beginPath(); ctx.arc(0, -30, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = shirts[i % shirts.length]; ctx.fillRect(-7, -20, 14, 16);
  ctx.fillStyle = '#44403C'; ctx.fillRect(-6, -4, 5, 12); ctx.fillRect(1, -4, 5, 12);
  ctx.fillStyle = 'rgba(231, 229, 214, 0.9)'; ctx.fillRect(-10, -18, 3, 10); // (bone showing)
};

/** Its health: top right, clear of his own gauges top left (it's the size of a boss, it gets a boss's bar). */
export const drawThingBar = (ctx: Ctx, th: Thing, frame: number) => {
  if (th.phase !== 'fight' || !th.e) return;
  const k = clamp01(th.e.health / th.e.maxHealth);
  ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(420, 10, 368, 30);
  ctx.fillStyle = '#44403C'; ctx.fillRect(426, 26, 356, 9);
  ctx.fillStyle = '#65A30D'; ctx.fillRect(426, 26, 356 * k, 9);
  ctx.fillStyle = '#D9F99D'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.fillText('THE EAST SIDE', 428, 22);
  drawWantPanel(ctx, th, frame);
  // The start of the fight: hold off till it's said what it wants
  if (inGrace(th)) {
    const a = Math.min(1, (GRACE_FRAMES - th.t) / 30);
    ctx.save();
    ctx.globalAlpha = a * (Math.floor(frame / 16) % 2 ? 1 : 0.55);
    ctx.textAlign = 'center'; ctx.font = 'bold 22px "Press Start 2P"';
    ctx.lineWidth = 6; ctx.strokeStyle = '#1C1917'; ctx.strokeText('HOLD YOUR FIRE', 400, 190);
    ctx.fillStyle = '#FDE047'; ctx.fillText('HOLD YOUR FIRE', 400, 190);
    ctx.restore();
  }
};

/** What it wants, big, on the screen where nothing's in the way of it: an icon, the word, how close it is to its fill, how much patience it's got left. It changes when it says so. */
const drawWantPanel = (ctx: Ctx, th: Thing, frame: number) => {
  // (right-aligned under its health bar, well clear of his own gauges top left)
  const x = 528, y = 48, w = 260, h = 70;
  const angry = th.fist > 0, full = th.full > 0;
  const want = th.shown;
  const fresh = frame - th.shownAt < 50;
  ctx.save();
  ctx.fillStyle = angry ? 'rgba(69, 10, 10, 0.9)' : full ? 'rgba(20, 46, 5, 0.9)' : 'rgba(12, 10, 9, 0.88)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = angry ? (frame % 10 < 5 ? '#EF4444' : '#7F1D1D') : fresh && frame % 8 < 4 ? '#FFFFFF' : '#A3E635';
  ctx.lineWidth = fresh || angry ? 4 : 2.5; ctx.strokeRect(x, y, w, h);
  if (angry) {
    ctx.fillStyle = '#FCA5A5'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText("IT'S ANGRY", x + w / 2, y + 30); ctx.font = 'bold 7px "Press Start 2P"'; ctx.fillText('BRACE YOURSELF', x + w / 2, y + 52);
  } else if (full) {
    ctx.fillStyle = '#D9F99D'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText('SATISFIED...', x + w / 2, y + 40);
  } else if (!want || th.shown !== th.want) {
    // (it's about to tell him)
    ctx.fillStyle = '#A3E635'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText('LISTEN' + '...'.slice(0, 1 + Math.floor(frame / 15) % 3), x + w / 2, y + 42);
  } else if (want) {
    drawWantIcon(ctx, want, x + 36, y + 35, frame);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#A3E635'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.fillText('IT WANTS:', x + 72, y + 20);
    ctx.fillStyle = '#FFFFFF'; ctx.font = `bold ${fresh ? 16 : 14}px "Press Start 2P"`; ctx.fillText(WANT_NAME[want]! + '!', x + 72, y + 42);
    // How close it is to its fill
    ctx.fillStyle = '#44403C'; ctx.fillRect(x + 72, y + 52, 170, 6);
    ctx.fillStyle = '#A3E635'; ctx.fillRect(x + 72, y + 52, 170 * clamp01(th.fed / (NEED[want] ?? 1300)), 6);
    // Its patience: two marks, one gone per time he ignores it
    for (let k = 0; k < 2; k++) { ctx.fillStyle = k < 2 - th.strikes ? '#FACC15' : '#44403C'; ctx.fillRect(x + w - 30 + k * 12, y + 10, 8, 8); }
  }
  ctx.textAlign = 'left';
  ctx.restore();
};

/** The icon for what it wants: an ice crystal, a flame, a rock, a wave. */
const drawWantIcon = (ctx: Ctx, w: string, x: number, y: number, f: number) => {
  ctx.save(); ctx.translate(x, y);
  const pulse = 1 + Math.sin(f * 0.2) * 0.06; ctx.scale(pulse, pulse);
  if (w === 'SHOTGUN') {
    ctx.strokeStyle = '#7DD3FC'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3; ctx.beginPath(); ctx.moveTo(-Math.cos(a) * 22, -Math.sin(a) * 22); ctx.lineTo(Math.cos(a) * 22, Math.sin(a) * 22); ctx.stroke(); }
    ctx.fillStyle = '#E0F2FE'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
  } else if (w === 'FLAMETHROWER') {
    ctx.fillStyle = '#F97316'; ctx.beginPath(); ctx.moveTo(0, -26); ctx.quadraticCurveTo(22, -2, 12, 18); ctx.quadraticCurveTo(0, 26, -12, 18); ctx.quadraticCurveTo(-22, -2, 0, -26); ctx.fill();
    ctx.fillStyle = '#FDE047'; ctx.beginPath(); ctx.moveTo(0, -8); ctx.quadraticCurveTo(10, 6, 6, 14); ctx.quadraticCurveTo(0, 18, -6, 14); ctx.quadraticCurveTo(-10, 6, 0, -8); ctx.fill();
  } else if (w === 'BOULDER') {
    ctx.fillStyle = '#78716C'; ctx.beginPath(); ctx.moveTo(-20, 8); ctx.lineTo(-16, -12); ctx.lineTo(0, -20); ctx.lineTo(18, -12); ctx.lineTo(22, 6); ctx.lineTo(8, 20); ctx.lineTo(-12, 18); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#A8A29E'; ctx.beginPath(); ctx.moveTo(-10, -8); ctx.lineTo(0, -14); ctx.lineTo(8, -8); ctx.lineTo(0, -4); ctx.fill();
  } else {
    ctx.fillStyle = '#38BDF8'; ctx.beginPath(); ctx.moveTo(-24, 20); ctx.quadraticCurveTo(-20, -24, 14, -14); ctx.quadraticCurveTo(-4, -8, 4, 6); ctx.quadraticCurveTo(14, 16, 24, 20); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#E0F2FE'; ctx.beginPath(); ctx.arc(10, -14, 5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
};
