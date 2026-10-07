// Drawing for Hector's stage: the sky (sunny to hurricane, and the inside of the
// storm), the ground (sand, road, boardwalk, lawn) and the sea, the scenery
// (umbrellas, motels, signs, boats), the platforms, the hazards and the HUD.

import { drawChaseWorld, drawDropMarks, drawChaseHud, drawBoarded, drawCutterDemise } from './chaseDraw';
import type { GameState } from '../../core/state';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../../constants';
import { drawBackdrop, drawBackdropFront } from '../../render/backdrops';
import { COURSE, Plat, Prop, palmTip } from './course';
import { getHector, regionOf, HectorRuntime } from './runtime';
import { drawNews } from './news';
import { drawWaterHazards, drawAirMeter } from './drawWater';
import { STRIKE_WARN, STRIKE_RING, shockPhase, AWNING_BOUNCE, SEA_DEPTH } from './hazards';
import { copsLeft } from './beach';
import { towerFlash, TOWER, RISE_WARNING } from './tower';
import { bandedGradient, checker, hazeBands, pixelBlob, steppedGlow } from '../../render/pixelArt';
import { INK, dark, lite, ink } from '../../render/npc/kit';
import { drawFlameLicks } from '../../render/fx/fireball';
import { drawBoatScene, drawBoatFront, drawTowerJunk, drawEyeArena, drawDaycare, drawDaycareFront, drawPoolWater } from './drawSet';
import { drawEyeHud } from './eyeDraw';
import { stamp } from '../../render/stamp';
import { drawStormWall, stormFlash, stormBoltX } from './stormWall';

type Ctx = CanvasRenderingContext2D;

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 250 && x1 < state.camera.x + CANVAS_WIDTH + 250;

/** A block lit from the upper left: a light top and left edge, a dark right and bottom, inked round. */
const slab = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string, e = 2) => {
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(c, 0.3); ctx.fillRect(x, y, w, e); ctx.fillRect(x, y, e, h);
  ctx.fillStyle = dark(c, 0.25); ctx.fillRect(x + w - e, y, e, h); ctx.fillRect(x, y + h - e, w, e);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
};

/** A wheel side on: inked tire, a lit arc over the top, a hubcap with its glint. */
const wheel = (ctx: Ctx, x: number, y: number, r: number, hub = '#9CA3AF') => {
  ink(ctx, () => ctx.arc(x, y, r, 0, Math.PI * 2), '#1F2937');
  ctx.strokeStyle = '#4B5563'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r - 2, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke();
  ink(ctx, () => ctx.arc(x, y, r * 0.48, 0, Math.PI * 2), hub);
  ctx.fillStyle = dark(hub, 0.3); ctx.fillRect(Math.round(x), Math.round(y), Math.ceil(r * 0.3), Math.ceil(r * 0.3));
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(Math.round(x - r * 0.25), Math.round(y - r * 0.25), 2, 2);
};

/** Neon tube lettering: a stepped halo, the dark tube when it's off, a hot white core when it's on. */
const neon = (ctx: Ctx, text: string, x: number, y: number, size: number, color: string, on: boolean) => {
  ctx.font = `bold ${size}px "Press Start 2P"`; ctx.textAlign = 'center';
  if (on) {
    ctx.save(); ctx.strokeStyle = color;
    for (const [w, a] of [[7, 0.12], [4, 0.25]] as const) { ctx.globalAlpha = a; ctx.lineWidth = w; ctx.strokeText(text, x, y); }
    ctx.restore();
  }
  ctx.fillStyle = on ? color : '#3F3F46'; ctx.fillText(text, x, y);
  if (on) { ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = '#FFFFFF'; ctx.fillText(text, x, y - 1); ctx.restore(); ctx.fillStyle = color; ctx.globalAlpha = 1; }
  ctx.textAlign = 'left';
};

/** How stormy it is where the camera is (0 sunny, 1 hurricane). */
export const stormAt = (state: GameState, rt: HectorRuntime) => {
  const region = regionOf(state.camera.x + 400);
  if (region === 'main') return rt.beach.storm;
  // (after the Eye it's sunshine all the way to the boss door)
  if (region === 'daycare') return 0;
  return 1;
};

// ---------------------------------------------------------------------------
// Sky
// ---------------------------------------------------------------------------

export const drawHectorBackdrop = (ctx: Ctx, state: GameState): boolean => {
  const rt = getHector(state)!;
  const region = regionOf(state.camera.x + 400);
  if (region === 'tower' || region === 'eye') { drawInsideStorm(ctx, state); return true; }
  const storm = stormAt(state, rt);
  // (after the Eye: the sky of a storm that's just ended)
  if (storm < 1) drawBackdrop(ctx, region === 'daycare' ? 'Hector After' : 'Hector Sunny', state.camera.x, state.camera.y, state.frame);
  if (storm > 0) {
    ctx.save(); ctx.globalAlpha = storm;
    drawBackdrop(ctx, 'Hector Hurricane', state.camera.x, state.camera.y, state.frame);
    ctx.restore();
  }
  return true;
};

export const drawHectorWeather = (ctx: Ctx, state: GameState): boolean => {
  const rt = getHector(state)!;
  const region = regionOf(state.camera.x + 400);
  const storm = region === 'tower' || region === 'eye' ? 1 : stormAt(state, rt);
  if (storm > 0) {
    ctx.save();
    ctx.fillStyle = `rgba(8, 14, 32, ${0.22 * storm})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.globalAlpha = storm;
    drawBackdropFront(ctx, 'Hector Hurricane', state.camera.x, state.camera.y, state.frame);
    ctx.restore();
  }
  return true;
};

/** A half-size canvas the storm's spiral is drawn into, the once. */
let stormCv: HTMLCanvasElement | null = null;
const stormCanvas = () => {
  if (!stormCv && typeof document !== 'undefined') { stormCv = document.createElement('canvas'); stormCv.width = CANVAS_WIDTH / 2; stormCv.height = CANVAS_HEIGHT / 2; }
  return stormCv;
};

/** Inside the hurricane: bands of cloud and rain spiralling round (turning as you go round the storm), lightning in the murk. */
const drawInsideStorm = (ctx: Ctx, state: GameState) => {
  const f = state.frame;
  bandedGradient(ctx, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, ['#0B1224', '#141C34', '#1A2340', '#121A30', '#0B1020'], 14);
  // The storm turning: as you go round, the bands slide past (and they spin on their own too)
  const turn = (state.camera.x / TOWER.circumference) * Math.PI * 2 + f * 0.004;
  // (the bands drawn at half size and blown up unsmoothed, so they come out in chunky pixels: each in three tones, a
  // dark underside, the band, a rim lit along its top)
  const sc = stormCanvas();
  if (sc) {
    const g = sc.getContext('2d')!;
    g.clearRect(0, 0, sc.width, sc.height);
    g.save();
    g.scale(0.5, 0.5);
    g.translate(CANVAS_WIDTH / 2, -200 - state.camera.y * 0.05 % 200);
    g.lineJoin = 'round';
    for (let band = 0; band < 7; band++) {
      const tones = band % 2 ? ['#121930', '#36426A', '#27314C'] : ['#10162A', '#28345A', '#1D2744'];
      const lw = 36 + band * 8;
      g.beginPath();
      for (let a = 0; a < Math.PI * 1.6; a += 0.08) {
        const r = 160 + band * 110 + a * 60;
        const ang = a + turn + band * 0.7;
        const x = Math.cos(ang) * r, y = Math.sin(ang) * r * 0.45 + 500;
        if (a === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      [[4, 0], [0, 0], [2, 4]].forEach(([dy, thin], i) => { g.save(); g.translate(0, dy); g.strokeStyle = tones[i]; g.lineWidth = lw - thin; g.stroke(); g.restore(); });
    }
    g.restore();
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(sc, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); ctx.restore();
  }
  // Banks of cloud going round in it, lower and darker the nearer they are, ragged at their edges
  const turnPx = (state.camera.x * 0.35 + f * 0.6);
  for (let i = 0; i < 18; i++) {
    const depth = (i % 3) / 2;
    const w = 90 + hash(i * 1.7) * 120, h = 14 + hash(i * 2.9) * 12;
    const x = ((hash(i * 3.1) * (CANVAS_WIDTH + 400) - turnPx * (0.4 + depth * 0.6)) % (CANVAS_WIDTH + 400) + CANVAS_WIDTH + 400) % (CANVAS_WIDTH + 400) - 200;
    const y = 40 + hash(i * 4.3) * (CANVAS_HEIGHT - 120) + Math.sin(f * 0.01 + i) * 6 - state.camera.y * 0.04 % 80;
    const c = depth > 0.6 ? 'rgba(52, 66, 104, 0.55)' : depth > 0.3 ? 'rgba(38, 48, 80, 0.6)' : 'rgba(26, 34, 58, 0.7)';
    pixelBlob(ctx, x, y, w, h, c);
    pixelBlob(ctx, x + w * 0.3, y - h * 0.5, w * 0.35, h * 0.7, c);
  }
  // Lightning somewhere in the storm (the same flash lights the eye wall and everything on it: see stormWall)
  const flash = stormFlash(f);
  if (flash > 0) {
    ctx.fillStyle = `rgba(210, 225, 255, ${(0.35 * flash).toFixed(3)})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const s = Math.floor(f / 200);
    ctx.strokeStyle = '#E0E7FF'; ctx.lineWidth = 2; ctx.beginPath();
    let x = stormBoltX(f), y = 0; ctx.moveTo(x, y);
    for (let i = 0; i < 8; i++) { x += (hash(s * 9 + i) - 0.5) * 70; y += 35; ctx.lineTo(x, y); }
    ctx.stroke();
  }
};

// ---------------------------------------------------------------------------
// World layers
// ---------------------------------------------------------------------------

export const drawHectorBack = (ctx: Ctx, state: GameState) => {
  const rt = getHector(state)!;
  const region = regionOf(state.camera.x + 400);
  if (region === 'tower') { drawEyeWall(ctx, state, rt.tower.riseY); return; }
  if (region === 'eye') return;
  drawSea(ctx, state);
  for (const p of COURSE.props) if (visible(state, p.x - (p.w ?? 100), p.x + (p.w ?? 100) + 100)) drawProp(ctx, state, p, rt);
  drawGround(ctx, state);
  if (region === 'daycare' || visible(state, COURSE.daycare.x1, COURSE.daycare.x2)) drawDaycare(ctx, state, rt.daycare);
};

export const drawHectorMid = (ctx: Ctx, state: GameState) => {
  const rt = getHector(state)!;
  const region = regionOf(state.camera.x + 400);
  if (region === 'tower') { drawTowerJunk(ctx, state, rt.tower); return; }
  if (region === 'eye') { drawEyeArena(ctx, state, rt.eye); return; }
  COURSE.plats.forEach((p, i) => { if (visible(state, p.x, p.x + p.w)) drawPlat(ctx, state, p, i, rt); });
  drawFloats(ctx, state, rt);
  drawShocks(ctx, state);
  for (const s of rt.hazards.scorches) {
    ctx.fillStyle = `rgba(20, 20, 20, ${0.6 * (1 - s.t / 400)})`;
    ctx.beginPath(); ctx.ellipse(s.x, s.y - 1, 24, 5, 0, 0, Math.PI * 2); ctx.fill();
  }
  // Lightning about to land: the ring on the ground it'll take (a hard edge, the same size the whole way: outside it is
  // out of it), dark ground inside it, the inside filling in yellow as it comes, a column of light up from it, the !
  // over it, all flashing faster as it gets close
  for (const s of rt.hazards.strikes) {
    if (s.t >= STRIKE_WARN) continue;
    const k = Math.max(0, s.t / STRIKE_WARN);
    const on = Math.floor(s.t / (k > 0.6 ? 2 : 4)) % 2 === 0;
    ctx.save();
    // (the ground inside it, darkened, then lit from the edge in as it comes)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)'; ctx.beginPath(); ctx.ellipse(s.x, s.ground - 1, STRIKE_RING, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(253, 224, 71, ${0.25 + k * 0.45})`; ctx.beginPath(); ctx.ellipse(s.x, s.ground - 1, STRIKE_RING * k, 9 * k, 0, 0, Math.PI * 2); ctx.fill();
    // (the edge: black under yellow, so it reads on sand and on water)
    ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(s.x, s.ground - 1, STRIKE_RING, 9, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = on ? '#FDE047' : '#FEF9C3'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(s.x, s.ground - 1, STRIKE_RING, 9, 0, 0, Math.PI * 2); ctx.stroke();
    // (the column of light: as wide as the ring)
    ctx.globalAlpha = on ? 1 : 0.6;
    const ch = 320 * Math.max(0.3, k), peak = 0.2 + k * 0.35;
    hazeBands(ctx, s.x - STRIKE_RING, s.ground - ch, STRIKE_RING * 2, ch, '#FDE047', peak * (1 - ch / 320), peak, 6);
    // (its edges, dashed dark, marching down: it reads against a bright sky as well as a dark one)
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)'; ctx.lineWidth = 2; ctx.setLineDash([8, 8]); ctx.lineDashOffset = -s.t * 2;
    ctx.beginPath(); ctx.moveTo(s.x - STRIKE_RING, s.ground - ch); ctx.lineTo(s.x - STRIKE_RING, s.ground); ctx.moveTo(s.x + STRIKE_RING, s.ground - ch); ctx.lineTo(s.x + STRIKE_RING, s.ground); ctx.stroke(); ctx.setLineDash([]);
    // (the !, big, inked)
    ctx.globalAlpha = 1; ctx.font = 'bold 26px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.lineWidth = 5; ctx.strokeStyle = '#0F172A'; ctx.strokeText('!', s.x, s.ground - 56);
    ctx.fillStyle = on ? '#FDE047' : '#FEF08A'; ctx.fillText('!', s.x, s.ground - 56);
    ctx.restore();
  }
  for (const d of rt.hazards.debris) if (d.warn <= 0) drawDebris(ctx, d.x, d.y, d.rot, d.look, d.size);
  drawPoliceCruiser(ctx, state, rt);
  if (rt.boat.chase && rt.boat.phase !== 'gone') drawChaseWorld(ctx, state, rt.boat.chase);
  drawBoatScene(ctx, state, rt.boat);
  if (rt.boat.chase && rt.boat.phase === 'riding') drawDropMarks(ctx, state, rt.boat.chase);
};

export const drawHectorFront = (ctx: Ctx, state: GameState) => {
  const rt = getHector(state)!;
  const region = regionOf(state.camera.x + 400);
  if (region === 'main') {
    drawWaterFront(ctx, state);
    drawPoolWater(ctx, state);
    drawBoatFront(ctx, state, rt.boat);
    drawWaterHazards(ctx, state, rt.hazards);
    drawAirMeter(ctx, state, rt.hazards);
  }
  // Lightning bolts
  for (const s of rt.hazards.strikes) {
    if (s.t < STRIKE_WARN) continue;
    ctx.save();
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    let x = s.x + (hash(s.x) - 0.5) * 60, y = state.camera.y - 20;
    ctx.moveTo(x, y);
    const steps = 9;
    for (let i = 1; i <= steps; i++) { const ty = y + (s.ground - y) * (i / steps); x = i === steps ? s.x : x + (hash(s.x + i * 13 + s.t) - 0.5) * 50; ctx.lineTo(x, ty); }
    // (a stepped halo, the bolt, a white-hot core)
    ctx.strokeStyle = 'rgba(191, 219, 254, 0.18)'; ctx.lineWidth = 21; ctx.stroke();
    ctx.strokeStyle = 'rgba(191, 219, 254, 0.35)'; ctx.lineWidth = 13; ctx.stroke();
    ctx.strokeStyle = '#BFDBFE'; ctx.lineWidth = 7; ctx.stroke();
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
  }
  if (region === 'tower') drawRisingStorm(ctx, state, rt.tower.riseY);
  if (region === 'daycare') drawDaycareFront(ctx, state, rt.daycare);
};

/** The storm rising up the tower: a churning wall of cloud, spray and junk swallowing everything below it. */
const drawRisingStorm = (ctx: Ctx, state: GameState, top: number) => {
  const bottom = state.camera.y + CANVAS_HEIGHT + 40;
  if (top > bottom) return;
  const x0 = state.camera.x - 600, x1 = state.camera.x + CANVAS_WIDTH + 600, f = state.frame;
  const crest = (x: number) => Math.round((top - 18 - Math.abs(Math.sin(x * 0.03 + f * 0.12)) * 26 - Math.sin(x * 0.011 - f * 0.05) * 10) / 2) * 2;
  // The body of it: clipped to the churning crest, slate going black in steps
  ctx.save();
  ctx.beginPath(); ctx.moveTo(x0, bottom);
  for (let x = x0; x <= x1; x += 24) ctx.lineTo(x, crest(x));
  ctx.lineTo(x1, bottom); ctx.closePath(); ctx.clip();
  bandedGradient(ctx, x0, top - 50, x1 - x0, 320, ['#5B6B82', '#475569', '#334155', '#1E293B', '#0F172A'], 10);
  ctx.fillStyle = '#0F172A'; ctx.fillRect(x0, top + 270, x1 - x0, Math.max(0, bottom - top - 270));
  // (rolls of cloud churning in it, lit along their tops)
  for (let i = 0; i < 14; i++) {
    const cx = x0 + ((i * 173 + f * (1.5 + (i % 3))) % (x1 - x0)), cy = top + 30 + ((i * 61) % 160);
    pixelBlob(ctx, cx, cy, 70 + (i % 4) * 16, 12, i % 2 ? 'rgba(100, 116, 139, 0.35)' : 'rgba(15, 23, 42, 0.45)');
  }
  ctx.restore();
  // (a lip of foam along the crest, so you can see it coming: white over its shade, inked under)
  // (only what's in view; a colour at a time, since none of it overlaps)
  const v = state.view, lip0 = Math.floor(x0 / 4) * 4;
  const lipA = v ? lip0 + Math.max(0, Math.floor((v.x - 8 - lip0) / 4)) * 4 : lip0, lipB = v ? Math.min(x1, v.x + v.w + 8) : x1;
  const lip: number[] = [];
  for (let x = lipA; x <= lipB; x += 4) lip.push(crest(x));
  ctx.fillStyle = INK; lip.forEach((y, i) => ctx.fillRect(lipA + i * 4, y + 4, 4, 2));
  ctx.fillStyle = '#94A3B8'; lip.forEach((y, i) => ctx.fillRect(lipA + i * 4, y + 2, 4, 2));
  ctx.fillStyle = '#E2E8F0'; lip.forEach((y, i) => { const x = lipA + i * 4; if ((x / 4) % 3) ctx.fillRect(x, y, 4, 2); });
  ctx.fillStyle = '#F8FAFC'; lip.forEach((y, i) => { const x = lipA + i * 4; if (!((x / 4) % 3)) ctx.fillRect(x, y, 4, 2); });
  // Spray whipping off the top of it, in streaks that fade back along themselves
  for (let i = 0; i < 30; i++) {
    const x = Math.round(x0 + ((i * 97 + f * (6 + (i % 4))) % (x1 - x0))), y = Math.round(top - 30 - ((i * 37 + f * 2) % 50));
    ctx.fillStyle = 'rgba(248, 250, 252, 0.8)'; ctx.fillRect(x + 6, y, 4, 2);
    ctx.fillStyle = 'rgba(226, 232, 240, 0.5)'; ctx.fillRect(x, y, 6, 2);
  }
  // Junk tumbling in it: broken boards, lit and inked, a nail or two
  for (let i = 0; i < 8; i++) {
    const x = x0 + ((i * 211 + f * 4) % (x1 - x0)), y = top + 40 + ((i * 53) % 120);
    ctx.save(); ctx.translate(x, y); ctx.rotate(f * 0.1 + i);
    slab(ctx, -12, -4, 24, 8, i % 3 ? '#78350F' : '#A16207', 1);
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-9, -1, 2, 2); ctx.fillRect(8, -1, 2, 2);
    ctx.restore();
  }
  // Lightning flickering inside it
  if (hash(Math.floor(f / 6)) > 0.8) hazeBands(ctx, x0, top, x1 - x0, Math.max(8, bottom - top), '#E0E7FF', 0.32, 0.12, 4);
};

export const drawHectorHud = (ctx: Ctx, state: GameState) => {
  const rt = getHector(state)!;
  // The Coast Guard: how close it is; boarded, the kill camera over everything; up the storm, not making it
  const ch = rt.boat.chase;
  if (ch && rt.boat.phase === 'riding' && !ch.caughtT && !ch.wreckT) drawChaseHud(ctx, state, ch, rt.boat.x);
  if (ch && ch.caughtT && state.deathTimer > 0) { drawBoarded(ctx, ch); return; }
  if (regionOf(state.camera.x + 400) === 'tower') drawCutterDemise(ctx, rt.tower.cgT, state.frame);
  const b = rt.beach;
  ctx.save();
  ctx.textAlign = 'center';
  // The cops have you boxed in
  // (once the rain's started, the sirens' red and blue flashing's gone; you've still got the cops to kill)
  const raining = b.storm > 0;
  if (b.police === 'fight' || (b.police === 'coming' && b.policeT > 30 && !raining)) {
    const y = 190;
    const text = b.police === 'fight' ? `THE COPS ARE HERE: ${copsLeft(state, b)} LEFT` : 'SIRENS...';
    ctx.font = 'bold 12px "Press Start 2P"';
    ctx.fillStyle = raining ? '#F8FAFC' : Math.floor(state.frame / 12) % 2 ? '#3B82F6' : '#EF4444';
    ctx.fillText(text, CANVAS_WIDTH / 2, y);
  }
  // Held up at the tiki bar
  if (b.lock && state.player.pos.x > b.lock.x - 260) {
    ctx.font = 'bold 10px "Press Start 2P"'; ctx.fillStyle = '#FDE047';
    ctx.fillText('KILL THE COPS TO MOVE ON', CANVAS_WIDTH / 2, 214);
  }
  // Junk about to blow in from the right: an arrow at its height
  for (const d of rt.hazards.debris) {
    if (d.warn <= 0 || Math.floor(state.frame / 5) % 2) continue;
    const y = Math.max(40, Math.min(560, d.y - state.camera.y));
    ctx.fillStyle = '#F97316'; ctx.strokeStyle = '#FDE047'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(CANVAS_WIDTH - 44, y); ctx.lineTo(CANVAS_WIDTH - 20, y - 16); ctx.lineTo(CANVAS_WIDTH - 20, y + 16); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
  drawEyeHud(ctx, state, rt.eye);
  // Up the storm: it's rising under you
  if (regionOf(state.player.pos.x) === 'tower' && rt.tower.inT > 30 && rt.tower.inT < RISE_WARNING && Math.floor(state.frame / 10) % 3 !== 0) {
    ctx.save(); ctx.textAlign = 'center'; ctx.font = 'bold 16px "Press Start 2P"';
    ctx.fillStyle = '#000'; ctx.fillText("THE STORM'S RISING! CLIMB!", CANVAS_WIDTH / 2 + 2, 152);
    ctx.fillStyle = '#FDE047'; ctx.fillText("THE STORM'S RISING! CLIMB!", CANVAS_WIDTH / 2, 150);
    ctx.restore();
  }
  drawNews(ctx, state, rt.news);
  // Whiteouts: the jump up to the Eye, and the storm dying
  const flash = Math.max(towerFlash(rt.tower), rt.clearT > 0 ? (rt.clearT < 40 ? rt.clearT / 40 : Math.max(0, 1 - (rt.clearT - 40) / 50)) : 0);
  if (flash > 0) { ctx.fillStyle = `rgba(240, 245, 255, ${flash})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
};

// ---------------------------------------------------------------------------
// Ground and water
// ---------------------------------------------------------------------------

/** The sea, under every stretch of open water (and out past the end of the marina). */
/** Every stretch of sea: the open water between the docks and the water under them. */
const seaStretches = (state: GameState) => {
  const out: { x1: number; x2: number }[] = [];
  const runs = state.groundRuns;
  runs.forEach((r, i) => {
    if (r.pitAfter === 'water') { const next = runs[i + 1]; out.push({ x1: r.x2, x2: next && next.x1 > r.x2 ? next.x1 : COURSE.sea.x2 }); }
    if (r.surface === 'dock') out.push({ x1: r.x1, x2: r.x2 });
  });
  return out;
};

/** Where the marina's water ends and the open sea (the boat chase) begins: the marina's under-the-water scene stops here. */
const MARINA_END = 13200;
const MARINA_TILE = 800;
let marinaDeep: HTMLCanvasElement | null = null;

/**
 * Down under the marina's docks (painted the once, a tile that repeats): the water teal under the surface going to
 * navy, light coming down through it, the far rows of pilings green with weed and barnacled, a sailboat sunk on its
 * side, a reef of rock, a car somebody pushed off the end of a dock, kelp swaying in silhouette, a school of fish.
 */
const marinaDeepTile = (): HTMLCanvasElement | null => {
  if (marinaDeep || typeof document === 'undefined') return marinaDeep;
  const c = document.createElement('canvas'); c.width = MARINA_TILE; c.height = SEA_DEPTH;
  const g = c.getContext('2d')!;
  const W = MARINA_TILE, H = SEA_DEPTH;
  bandedGradient(g, 0, 0, W, H, ['#2C7DA0', '#21698C', '#1A5677', '#144563', '#0E334D', '#09243A'], 10);
  // (light down through it: slanting shafts, lighter in steps)
  for (let k = 0; k < 5; k++) {
    const sx = 60 + k * 170 + hash(k) * 40;
    for (let s = 0; s < 3; s++) {
      g.fillStyle = `rgba(186, 230, 253, ${(0.05 + s * 0.03).toFixed(3)})`;
      const w = 30 - s * 9;
      g.beginPath(); g.moveTo(sx + s * 4, 0); g.lineTo(sx + s * 4 + w, 0); g.lineTo(sx + s * 4 + w + 70, H); g.lineTo(sx + s * 4 + 70, H); g.closePath(); g.fill();
    }
  }
  // (the far rows of pilings, hazed blue: weed on them in bands, barnacles)
  for (let x = 20; x < W; x += 96) {
    const pw = 12;
    g.fillStyle = '#0F3A55'; g.fillRect(x, 0, pw, H);
    g.fillStyle = '#145173'; g.fillRect(x, 0, 3, H);
    g.fillStyle = '#0C2E44'; g.fillRect(x + pw - 3, 0, 3, H);
    for (let y = 18; y < H; y += 26) { g.fillStyle = '#1F5E3B'; g.fillRect(x - 2, y, pw + 4, 6); g.fillStyle = '#2F7A4D'; g.fillRect(x - 2, y, pw + 4, 2); }
    g.fillStyle = '#7DA3B8'; for (let k = 0; k < 6; k++) g.fillRect(x + Math.round(hash(x + k) * pw), 40 + Math.round(hash(x * 3 + k) * (H - 60)), 2, 2);
  }
  checker(g, 0, 0, W, H, 'rgba(16, 52, 80, 0.35)');
  // (the reef along the bottom: rock in steps, lit along the top)
  const reef = (x: number) => H - 24 - Math.round((Math.sin(x * 0.021) * 0.5 + 0.5) * 18 + hash(Math.floor(x / 16)) * 8);
  for (let x = 0; x < W; x += 4) { const top = reef(x); g.fillStyle = '#123247'; g.fillRect(x, top, 4, H - top); g.fillStyle = '#1D4A63'; g.fillRect(x, top, 4, 2); }
  // (a sailboat on its side on the bottom: hull, keel up, the mast lying along the sand, a hole in her)
  const bx = 300, by = H - 40;
  g.fillStyle = '#0B2536'; g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx + 60, by - 46, bx + 140, by - 10); g.lineTo(bx + 140, by + 18); g.lineTo(bx + 10, by + 18); g.closePath(); g.fill();
  g.fillStyle = '#16405A'; g.beginPath(); g.moveTo(bx + 4, by); g.quadraticCurveTo(bx + 60, by - 40, bx + 136, by - 8); g.lineTo(bx + 136, by - 4); g.quadraticCurveTo(bx + 60, by - 34, bx + 6, by + 4); g.closePath(); g.fill();
  g.fillStyle = '#071A27'; g.fillRect(bx + 60, by - 14, 16, 10);
  g.fillStyle = '#0B2536'; g.fillRect(bx + 120, by + 12, 160, 4);
  g.fillStyle = '#0B2536'; g.beginPath(); g.moveTo(bx + 70, by - 22); g.lineTo(bx + 90, by - 52); g.lineTo(bx + 96, by - 24); g.fill();
  // (a car pushed off the end of a dock, nose down in the sand)
  const cx = 620, cy = H - 30;
  g.save(); g.translate(cx, cy); g.rotate(0.35);
  g.fillStyle = '#0D2A3C'; g.fillRect(-36, -18, 72, 18); g.fillRect(-20, -30, 40, 14);
  g.fillStyle = '#163E55'; g.fillRect(-36, -18, 72, 3); g.fillRect(-16, -27, 12, 9); g.fillRect(4, -27, 12, 9);
  g.fillStyle = '#071A27'; g.beginPath(); g.arc(-22, 0, 7, 0, Math.PI * 2); g.arc(22, 0, 7, 0, Math.PI * 2); g.fill();
  g.restore();
  // (kelp in silhouette, tall, stepped)
  for (let x = 40; x < W; x += 130) {
    const h = 90 + hash(x) * 70;
    for (let k = 0; k < h; k += 4) { const off = Math.round(Math.sin(k * 0.05 + x) * 6); g.fillStyle = '#0E3B2E'; g.fillRect(x + off, H - 20 - k, 5, 4); if (k % 16 === 8) g.fillRect(x + off + (k % 32 ? 5 : -6), H - 20 - k, 6, 2); }
  }
  // (and the trash: years of it, heaped along the bottom and hanging in the water: tires, carts, barrels, a fridge on
  // its back, a toilet, a traffic cone, bottles and cans, a boot, bags drifting, six-pack rings; all of it hazed blue)
  const junk = (x: number, y: number, kind: number, s: number) => {
    g.save(); g.translate(x, y); g.rotate((hash(x + kind) - 0.5) * 0.8); g.scale(s, s);
    const D = '#16384D', M = '#2F6E8C', L = '#5A9DB8';
    switch (kind % 11) {
      case 0: g.fillStyle = D; g.beginPath(); g.arc(0, 0, 11, 0, Math.PI * 2); g.fill(); g.fillStyle = '#0A2232'; g.beginPath(); g.arc(0, 0, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = M; g.fillRect(-9, -8, 4, 2); break; // a tire
      case 1: g.strokeStyle = M; g.lineWidth = 1.5; g.strokeRect(-14, -12, 24, 12); for (let k = -10; k < 10; k += 4) { g.beginPath(); g.moveTo(k, -12); g.lineTo(k, 0); g.stroke(); } g.fillStyle = D; g.beginPath(); g.arc(-10, 3, 2.5, 0, Math.PI * 2); g.arc(6, 3, 2.5, 0, Math.PI * 2); g.fill(); break; // a cart
      case 2: g.fillStyle = M; g.fillRect(-8, -20, 16, 20); g.fillStyle = D; g.fillRect(-8, -14, 16, 2); g.fillRect(-8, -7, 16, 2); g.fillStyle = L; g.fillRect(-8, -20, 3, 20); break; // a barrel
      case 3: g.fillStyle = '#4F8AA6'; g.fillRect(-16, -12, 32, 12); g.fillStyle = D; g.fillRect(-16, -12, 32, 2); g.fillRect(-2, -10, 1, 8); g.fillStyle = L; g.fillRect(-14, -10, 6, 2); break; // a fridge on its back
      case 4: g.fillStyle = '#7FB2C6'; g.fillRect(-6, -10, 12, 6); g.fillRect(-4, -4, 10, 4); g.fillStyle = M; g.fillRect(4, -18, 6, 10); break; // a toilet
      case 5: g.fillStyle = '#C2703A'; g.beginPath(); g.moveTo(-6, 0); g.lineTo(0, -16); g.lineTo(6, 0); g.closePath(); g.fill(); g.fillStyle = '#E8D2B0'; g.fillRect(-3, -9, 6, 2); g.fillStyle = M; g.fillRect(-8, -1, 16, 2); break; // a cone
      case 6: g.fillStyle = '#3F9A72'; g.fillRect(-2, -10, 4, 10); g.fillRect(-1, -13, 2, 3); break; // a bottle
      case 7: g.fillStyle = '#9FB7C2'; g.fillRect(-3, -6, 6, 6); g.fillStyle = M; g.fillRect(-3, -6, 6, 1); break; // a can
      case 8: g.fillStyle = D; g.fillRect(-6, -10, 6, 10); g.fillRect(-6, -3, 12, 3); break; // a boot
      case 9: g.fillStyle = 'rgba(200, 230, 240, 0.55)'; g.beginPath(); g.moveTo(-8, 0); g.quadraticCurveTo(-10, -14, 0, -16); g.quadraticCurveTo(10, -14, 8, 0); g.quadraticCurveTo(0, 4, -8, 0); g.fill(); g.fillRect(-2, -20, 1, 5); g.fillRect(2, -20, 1, 5); break; // a bag
      default: g.strokeStyle = 'rgba(200, 225, 235, 0.7)'; g.lineWidth = 1; for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(-6 + k * 6, 0, 3, 2, 0, 0, Math.PI * 2); g.stroke(); } // six-pack rings
    }
    g.restore();
  };
  // (heaped along the bottom: the big stuff)
  for (let k = 0; k < 34; k++) { const x = Math.round(hash(k * 7.3) * W), kind = [0, 1, 2, 3, 4, 5, 0, 2, 1, 8, 6, 7][k % 12]; junk(x, reef(x) + 4 - hash(k) * 6, kind, 0.8 + hash(k * 2) * 0.5); }
  // (and hanging in the water, drifting: bags, bottles, cans, rings)
  for (let k = 0; k < 26; k++) junk(Math.round(hash(k * 3.1 + 9) * W), 20 + Math.round(hash(k * 5.7) * (H - 90)), [9, 6, 7, 10, 9, 7][k % 6], 0.8 + hash(k) * 0.4);
  // (a school of fish, small, silver-blue, all one way)
  g.fillStyle = '#5E8FAD';
  for (let k = 0; k < 22; k++) { const fx = 470 + (k % 7) * 14 + hash(k) * 8, fy = 60 + Math.floor(k / 7) * 10 + hash(k * 3) * 6; g.fillRect(Math.round(fx), Math.round(fy), 6, 2); g.fillRect(Math.round(fx) - 2, Math.round(fy) - 1, 2, 4); }
  marinaDeep = c;
  return c;
};

/** The marina's under-the-water scene put down over a stretch of its water, going by slower than the docks (it's
 * further off), wavering the way things do through water: each band of it shifted side to side on its own swell. */
const drawMarinaDeep = (ctx: Ctx, state: GameState, x1: number, x2: number, y: number) => {
  const tile = marinaDeepTile();
  if (!tile) return false;
  const f = state.frame;
  ctx.save(); ctx.beginPath(); ctx.rect(x1, y, x2 - x1, SEA_DEPTH); ctx.clip();
  ctx.imageSmoothingEnabled = false;
  // (parallax: it slides by at a third the speed of the camera)
  const base = state.camera.x - (((state.camera.x * 0.66) % MARINA_TILE) + MARINA_TILE) % MARINA_TILE - MARINA_TILE;
  const from = Math.max(x1, state.camera.x - 40), to = Math.min(x2, state.camera.x + CANVAS_WIDTH + 40);
  for (let r = 0; r < SEA_DEPTH; r += 4) {
    const wob = Math.round(Math.sin(r * 0.07 + f * 0.06) * 3 + Math.sin(r * 0.023 - f * 0.035) * 2);
    for (let tx = base + wob; tx < to; tx += MARINA_TILE) if (tx + MARINA_TILE > from) ctx.drawImage(tile, 0, r, MARINA_TILE, 4, tx, y + r, MARINA_TILE, 4);
  }
  // (light dancing on it from the swell overhead, in pixel flecks near the top)
  ctx.fillStyle = 'rgba(224, 242, 254, 0.35)';
  for (let x = Math.floor(from / 24) * 24; x < to; x += 24) for (let k = 0; k < 3; k++) {
    const q = Math.sin(f * 0.08 + x * 0.3 + k * 2.1);
    if (q > 0.55) ctx.fillRect(x + k * 7, y + 6 + k * 9 + Math.round(Math.sin(f * 0.05 + x) * 2), 4, 2);
  }
  ctx.restore();
  return true;
};

const drawSea = (ctx: Ctx, state: GameState) => {
  const bottom = state.camera.y + CANVAS_HEIGHT + 60;
  const f = state.frame;
  // Out on the boat, the coast guard after him: the sea's open water, deep and churned up, nothing to see down in it
  // (no marina floor, no weed, no trash: it's opaque, top to the bottom of the screen)
  const boat = getHector(state)?.boat;
  const chasing = !!boat?.chase && (boat.phase === 'riding' || boat.phase === 'spout');
  seaStretches(state).forEach(({ x1, x2 }) => {
    if (!visible(state, x1, x2)) return;
    const y = COURSE.sea.y;
    if (chasing) {
      const from = Math.max(x1, state.camera.x - 40), to = Math.min(x2, state.camera.x + CANVAS_WIDTH + 40);
      bandedGradient(ctx, from, y, to - from, bottom - y, ['#2A6688', '#1E4E6E', '#174260', '#123650', '#0B2A40', '#081F30'], 10);
      // (the chop: darker troughs and lit crests in rows, sliding by, smaller and closer together going down)
      for (let r = 0, yy = y + 14; yy < bottom; r++, yy += 12 + r * 3) {
        const drift = (f * (1.2 - Math.min(0.9, r * 0.12)) + r * 37) % 48;
        for (let x = Math.floor((from - drift) / 48) * 48 + drift; x < to; x += 48) {
          const w = 18 + hash(x + r * 7) * 14;
          ctx.fillStyle = 'rgba(8, 26, 40, 0.45)'; ctx.fillRect(Math.round(x / 2) * 2, Math.round(yy / 2) * 2 + 2, Math.round(w / 2) * 2, 2);
          ctx.fillStyle = 'rgba(125, 211, 252, 0.18)'; ctx.fillRect(Math.round(x / 2) * 2 + 4, Math.round(yy / 2) * 2, Math.round(w / 2) * 2 - 6, 2);
        }
      }
      return;
    }
    // The water: teal at the top going navy in steps, light coming down through it in slanting shafts (in the marina,
    // what's down there under the docks, wavering)
    bandedGradient(ctx, x1, y, x2 - x1, SEA_DEPTH, ['#2A6688', '#1E4E6E', '#174260', '#123650', '#0B2A40'], 8);
    if (x1 < MARINA_END) drawMarinaDeep(ctx, state, x1, Math.min(x2, MARINA_END), y);
    ctx.save(); ctx.beginPath(); ctx.rect(x1, y, x2 - x1, SEA_DEPTH); ctx.clip();
    ctx.fillStyle = 'rgba(186, 230, 253, 0.07)';
    for (let x = Math.floor(x1 / 140) * 140; x < x2; x += 140) {
      const sx = x + hash(x) * 60 + Math.sin(f * 0.02 + x) * 8;
      ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(sx + 18, y); ctx.lineTo(sx + 58, y + SEA_DEPTH); ctx.lineTo(sx + 30, y + SEA_DEPTH); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    // The bottom: sand in bands with a lit lip, pebbles, weed, a tire, somebody's shopping cart
    const floor = y + SEA_DEPTH;
    if (bottom > floor) bandedGradient(ctx, x1, floor, x2 - x1, bottom - floor, ['#BFA574', '#A38A5A', '#7C6644'], 4);
    ctx.fillStyle = '#D4BC8A'; ctx.fillRect(x1, floor, x2 - x1, 2);
    for (let x = Math.ceil(x1 / 17) * 17; x < x2; x += 17) {
      const py = Math.round(floor + 6 + hash(x) * 20);
      ctx.fillStyle = '#6B5838'; ctx.fillRect(x, py, 4, 2); ctx.fillStyle = '#D4BC8A'; ctx.fillRect(x, py - 1, 2, 1);
    }
    for (let x = Math.ceil(x1 / 90) * 90; x < x2; x += 90) {
      // (weed: a stack of stepped blades swaying more the higher they go, a lit edge, leaves off it)
      const h = 50 + hash(x) * 30;
      for (let k = 0; k < h; k += 4) {
        const off = Math.round(Math.sin(f * 0.05 + x + k * 0.06) * 6 * (k / h));
        ctx.fillStyle = '#14532D'; ctx.fillRect(x + off - 1, floor - k - 4, 4, 4);
        ctx.fillStyle = '#22C55E'; ctx.fillRect(x + off - 1, floor - k - 4, 1, 4);
        if (k % 12 === 8) { ctx.fillStyle = '#166534'; ctx.fillRect(x + off + (k % 24 ? 3 : -5), floor - k - 4, 4, 2); }
      }
    }
    for (let x = Math.ceil(x1 / 610) * 610; x < x2; x += 610) {
      // (the tire, half sunk: inked, tread on it, the sand showing through the middle)
      const tx = x + 200, ty = floor - 8;
      ink(ctx, () => ctx.ellipse(tx, ty, 19, 11, 0, 0, Math.PI * 2), '#1F2937');
      ctx.strokeStyle = '#4B5563'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(tx, ty, 16, 8, 0, Math.PI * 1.1, Math.PI * 1.7); ctx.stroke();
      ink(ctx, () => ctx.ellipse(tx, ty, 12, 5, 0, 0, Math.PI * 2), '#7C6644');
      ctx.fillStyle = '#111827'; for (let k = -14; k <= 14; k += 6) ctx.fillRect(tx + k, ty + 8, 2, 2);
      // (the cart: on its side, wire basket, a wheel up)
      const cx = x + 430, cy = floor;
      ctx.strokeStyle = '#64748B'; ctx.lineWidth = 2; ctx.strokeRect(cx - 18, cy - 22, 30, 18);
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
      ctx.beginPath(); for (let k = -12; k < 12; k += 5) { ctx.moveTo(cx + k + 0.5, cy - 22); ctx.lineTo(cx + k + 0.5, cy - 4); } ctx.moveTo(cx - 18, cy - 13.5); ctx.lineTo(cx + 12, cy - 13.5); ctx.stroke();
      ctx.strokeStyle = '#94A3B8'; ctx.beginPath(); ctx.moveTo(cx - 18, cy - 22.5); ctx.lineTo(cx + 12, cy - 22.5); ctx.stroke();
      ctx.strokeStyle = '#64748B'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + 12, cy - 22); ctx.lineTo(cx + 20, cy - 30); ctx.stroke();
      ink(ctx, () => ctx.arc(cx - 14, cy - 2, 3, 0, Math.PI * 2), '#111827');
    }
  });
};

/** A rolling surface line over the open water, in front of anything sinking into it. */
const drawWaterFront = (ctx: Ctx, state: GameState) => {
  const f = state.frame;
  seaStretches(state).forEach(({ x1, x2 }) => {
    if (!visible(state, x1, x2)) return;
    const y = COURSE.sea.y;
    const wave = (x: number) => Math.round((y + Math.sin(x * 0.04 + f * 0.1) * 4) / 2) * 2;
    // The water over whatever's in it (him, swimming), a murky tint deepening toward the bottom in steps
    ctx.save();
    ctx.beginPath(); ctx.moveTo(x1, y + SEA_DEPTH);
    for (let x = x1; x <= x2; x += 10) ctx.lineTo(x, wave(x));
    ctx.lineTo(x2, y + SEA_DEPTH); ctx.closePath(); ctx.clip();
    hazeBands(ctx, x1, y - 6, x2 - x1, SEA_DEPTH + 6, '#1E4E6E', 0.55, 0.4, 5);
    ctx.restore();
    // (its skin: a white crest, a pale band under it, glints riding along)
    for (let x = Math.floor(x1 / 4) * 4; x < x2; x += 4) {
      const yy = wave(x);
      ctx.fillStyle = 'rgba(125, 211, 252, 0.6)'; ctx.fillRect(x, yy + 2, 4, 2);
      ctx.fillStyle = 'rgba(240, 249, 255, 0.9)'; ctx.fillRect(x, yy, 4, 2);
    }
    ctx.fillStyle = '#FFFFFF';
    for (let x = Math.floor(x1 / 64) * 64; x < x2; x += 64) { const gx = x + ((f * 0.6 + hash(x) * 64) % 64); ctx.fillRect(Math.round(gx), wave(gx) + 6, 6, 2); }
  });
};

const SURFACE_LOOK: Record<string, { top: string; body: string; dark: string }> = {
  sand: { top: '#F3E3B5', body: '#E6CF95', dark: '#C9AE70' },
  road: { top: '#4B5563', body: '#374151', dark: '#1F2937' },
  dock: { top: '#A16207', body: '#854D0E', dark: '#5B3A1E' },
  grass: { top: '#65A30D', body: '#7C5A3A', dark: '#4D7C0F' },
  pool: { top: '#7DD3FC', body: '#E0F2FE', dark: '#38BDF8' },
};

const drawGround = (ctx: Ctx, state: GameState) => {
  const bottom = state.camera.y + CANVAS_HEIGHT + 60;
  for (const r of state.groundRuns) {
    if (!r.surface || !visible(state, r.x1, r.x2)) continue;
    const look = SURFACE_LOOK[r.surface] ?? SURFACE_LOOK.sand;
    const x1 = Math.max(r.x1, state.camera.x - 260), x2 = Math.min(r.x2, state.camera.x + CANVAS_WIDTH + 260);
    const yAt = (x: number) => (r.x2 === r.x1 ? r.y1 : r.y1 + ((x - r.x1) / (r.x2 - r.x1)) * (r.y2 - r.y1));
    /** A strip following the surface, `off` below it and `h` deep. */
    const strip = (off: number, h: number, c: string) => {
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(x1, yAt(x1) + off); ctx.lineTo(x2, yAt(x2) + off); ctx.lineTo(x2, yAt(x2) + off + h); ctx.lineTo(x1, yAt(x1) + off + h); ctx.closePath(); ctx.fill();
    };
    if (r.surface === 'dock') {
      // Boardwalk on pilings down into the water, driven into the sea bed: round posts lit down one side, cross-braced
      const bed = COURSE.sea.y + SEA_DEPTH + 6;
      for (let x = Math.ceil(x1 / 70) * 70; x < x2; x += 70) {
        const py = yAt(x);
        ctx.fillStyle = look.dark; ctx.fillRect(x, py, 10, bed - py);
        ctx.fillStyle = '#7A5530'; ctx.fillRect(x + 1, py, 3, bed - py);
        ctx.fillStyle = '#3A2412'; ctx.fillRect(x + 8, py, 2, bed - py);
        ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, py + 0.5, 9, bed - py - 1);
        // (barnacles and weed where it's in the water)
        ctx.fillStyle = '#4D7C0F'; ctx.fillRect(x + 1, COURSE.sea.y + 8, 8, 3);
        ctx.fillStyle = '#D6D3D1'; for (let k = 0; k < 3; k++) ctx.fillRect(x + 2 + k * 3, COURSE.sea.y + 14 + (k % 2) * 6, 2, 2);
        if (x + 70 < x2) {
          ctx.strokeStyle = '#3A2412'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(x + 10, py + 16); ctx.lineTo(x + 70, py + 46); ctx.stroke();
          ctx.strokeStyle = '#6B4A2A'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 10, py + 15); ctx.lineTo(x + 70, py + 45); ctx.stroke();
        }
      }
      // (the deck: its stringer, then planks with a gap between, lit along the top, nail heads)
      strip(0, 14, look.body); strip(10, 4, look.dark);
      for (let x = Math.floor(x1 / 26) * 26; x < x2; x += 26) {
        const px = Math.max(x1, x), pw = Math.min(24, x2 - px), py = Math.round(yAt(x));
        ctx.fillStyle = look.top; ctx.fillRect(px, py, pw, 4);
        ctx.fillStyle = '#CA8A04'; ctx.fillRect(px, py, pw, 1);
        ctx.fillStyle = look.dark; ctx.fillRect(px + pw, py, 2, 6);
        ctx.fillStyle = '#44403C'; ctx.fillRect(px + 3, py + 7, 2, 2); ctx.fillRect(px + pw - 5, py + 7, 2, 2);
      }
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x1, yAt(x1) + 14.5); ctx.lineTo(x2, yAt(x2) + 14.5); ctx.stroke();
      continue;
    }
    ctx.fillStyle = look.body;
    ctx.beginPath(); ctx.moveTo(x1, yAt(x1)); ctx.lineTo(x2, yAt(x2)); ctx.lineTo(x2, bottom); ctx.lineTo(x1, bottom); ctx.closePath(); ctx.fill();
    if (r.surface === 'sand') {
      // Sand: drier and paler on top, damper and darker going down in steps, grains in two tones
      strip(30, 30, '#DCC287'); strip(60, 300, '#D2B77C');
      strip(0, 8, look.top); strip(0, 2, '#FBF1D3');
      ctx.fillStyle = look.dark;
      for (let x = Math.ceil(x1 / 13) * 13; x < x2; x += 13) ctx.fillRect(Math.round(x + hash(x) * 6), Math.round(yAt(x) + 14 + hash(x + 1) * 60), 2, 2);
      ctx.fillStyle = '#FBF1D3';
      for (let x = Math.ceil(x1 / 19) * 19; x < x2; x += 19) ctx.fillRect(Math.round(x + hash(x + 7) * 8), Math.round(yAt(x) + 12 + hash(x + 3) * 50), 2, 1);
      // Shells (pink, inked, ribbed) and a footprint or two
      for (let x = Math.ceil(x1 / 170) * 170; x < x2; x += 170) {
        const sx = Math.round(x + hash(x) * 40), sy = Math.round(yAt(x) + 6);
        ink(ctx, () => { ctx.arc(sx, sy, 3, Math.PI, 0); ctx.closePath(); }, '#FBCFE8');
        ctx.fillStyle = '#DB2777'; ctx.fillRect(sx - 1, sy - 2, 1, 2); ctx.fillRect(sx + 1, sy - 2, 1, 2);
        const fx = Math.round(x + 90 + hash(x + 2) * 30), fy = Math.round(yAt(x) + 20 + hash(x + 4) * 20);
        ctx.fillStyle = look.dark; ctx.fillRect(fx, fy, 5, 3); ctx.fillRect(fx + 1, fy - 2, 3, 1); ctx.fillRect(fx + 9, fy + 5, 5, 3); ctx.fillRect(fx + 10, fy + 3, 3, 1);
      }
    } else if (r.surface === 'road') {
      // Asphalt with grit in it, a concrete curb, lane markings with their wear, puddles with the sky in them
      for (let x = Math.ceil(x1 / 7) * 7; x < x2; x += 7) {
        ctx.fillStyle = hash(x) > 0.5 ? '#2B3441' : '#4B5563';
        ctx.fillRect(x, Math.round(yAt(x) + 12 + hash(x + 9) * 70), 2, 2);
      }
      strip(0, 8, look.top); strip(0, 3, '#9CA3AF'); strip(0, 1, '#D1D5DB'); strip(8, 2, INK);
      for (let x = Math.ceil(x1 / 60) * 60; x < x2; x += 60) { ctx.fillStyle = '#1F2937'; ctx.fillRect(x, Math.round(yAt(x)), 1, 8); }
      for (let x = Math.ceil(x1 / 80) * 80; x < x2; x += 80) {
        const ly = Math.round(yAt(x) + 22);
        ctx.fillStyle = '#A16207'; ctx.fillRect(x, ly + 3, 40, 1);
        ctx.fillStyle = '#FACC15'; ctx.fillRect(x, ly, 40, 3);
        ctx.fillStyle = '#FEF08A'; ctx.fillRect(x, ly, 40, 1);
        ctx.fillStyle = look.body; ctx.fillRect(x + 8 + Math.floor(hash(x) * 20), ly, 3, 2);
      }
      for (let x = Math.ceil(x1 / 230) * 230; x < x2; x += 230) {
        const px = x + 60, py = Math.round(yAt(x) + 34);
        ctx.fillStyle = '#1F2937'; ctx.fillRect(px - 30, py - 3, 60, 7);
        ctx.fillStyle = '#64748B'; ctx.fillRect(px - 28, py - 2, 56, 5);
        ctx.fillStyle = '#94A3B8'; ctx.fillRect(px - 24, py - 2, 30, 2);
        ctx.fillStyle = '#E2E8F0'; ctx.fillRect(px - 20, py - 2, 8, 1);
      }
    } else if (r.surface === 'grass') {
      // Turf over dirt, the sidewalk along it in slabs
      strip(40, 40, '#6F5034'); strip(80, 400, '#5E432B'); checker(ctx, x1, Math.max(yAt(x1), yAt(x2)) + 38, x2 - x1, 2, '#6F5034');
      strip(0, 8, look.top); strip(8, 6, '#3F6212');
      ctx.fillStyle = look.dark;
      for (let x = Math.ceil(x1 / 6) * 6; x < x2; x += 6) ctx.fillRect(x, Math.round(yAt(x) - 2 - hash(x) * 3), 2, 4);
      ctx.fillStyle = '#A3E635';
      for (let x = Math.ceil(x1 / 6) * 6 + 3; x < x2; x += 12) ctx.fillRect(x, Math.round(yAt(x) - 1 - hash(x) * 2), 1, 3);
      strip(16, 10, '#D6D3D1'); strip(16, 2, '#F5F5F4'); strip(24, 2, '#A8A29E');
      for (let x = Math.ceil(x1 / 48) * 48; x < x2; x += 48) { ctx.fillStyle = '#A8A29E'; ctx.fillRect(x, Math.round(yAt(x) + 16), 1, 10); }
      ctx.fillStyle = '#5B4330';
      for (let x = Math.ceil(x1 / 23) * 23; x < x2; x += 23) {
        const sx = Math.round(x + hash(x) * 9), sy = Math.round(yAt(x) + 32 + hash(x + 5) * 90);
        ctx.fillStyle = '#3F2D1D'; ctx.fillRect(sx, sy, 4, 3); ctx.fillStyle = '#A8896A'; ctx.fillRect(sx, sy, 2, 1);
      }
    } else if (r.surface === 'pool') {
      // Tile: a grid of grout, a glint on each tile
      strip(0, 8, look.top);
      for (let x = Math.ceil(x1 / 20) * 20; x < x2; x += 20) {
        ctx.fillStyle = '#BAE6FD'; ctx.fillRect(x, yAt(x), 1, 60);
        ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + 2, Math.round(yAt(x)) + 10, 4, 1); ctx.fillRect(x + 2, Math.round(yAt(x)) + 30, 4, 1);
      }
      for (let k = 20; k < 60; k += 20) strip(k, 1, '#BAE6FD');
    }
  }
};

// ---------------------------------------------------------------------------
// Scenery
// ---------------------------------------------------------------------------

/** A bamboo pole: segment rings, a lit edge, a shaded one. */
const bamboo = (ctx: Ctx, x: number, y: number, w: number, h: number, dark = false) => {
  ctx.fillStyle = dark ? '#6B4A1E' : '#A97C2F'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = dark ? '#8A6326' : '#D4A64A'; ctx.fillRect(x + 1, y, Math.max(1, Math.round(w * 0.3)), h);
  ctx.fillStyle = dark ? '#4A3214' : '#7A5520'; ctx.fillRect(x + w - 2, y, 2, h);
  for (let yy = y + 14; yy < y + h - 4; yy += 18) {
    ctx.fillStyle = dark ? '#3B2810' : '#6B4A1E'; ctx.fillRect(x - 1, yy, w + 2, 2);
    ctx.fillStyle = dark ? '#A97C2F' : '#EBC46A'; ctx.fillRect(x, yy + 2, w, 1);
  }
};

/**
 * The tiki bar: a thatched palm roof in three ragged tiers (the fringe flapping in the storm), bamboo posts, a carved
 * tiki face up the corner post, a string of party lights under the eaves, the back shelf of bottles, a bamboo-slat
 * counter with a plank top and drinks with little umbrellas on it, two stools, a carved sign hung off the front, and a
 * tiki torch either side (blown about, and guttering, once the storm's in).
 */
const drawTiki = (ctx: Ctx, p: Prop, f: number, storm: number) => {
  const x = p.x, y = p.y;
  // The back: shade under the roof, the back posts, the shelf and its bottles
  ctx.fillStyle = '#3B2A1A'; ctx.fillRect(x - 86, y - 92, 172, 52);
  bamboo(ctx, x - 78, y - 92, 6, 92, true); bamboo(ctx, x + 72, y - 92, 6, 92, true);
  ctx.fillStyle = '#5B3A1E'; ctx.fillRect(x - 72, y - 66, 144, 4); ctx.fillRect(x - 72, y - 86, 144, 3);
  const bottles = ['#16A34A', '#B45309', '#F8FAFC', '#2563EB', '#DC2626', '#CA8A04', '#7C3AED', '#16A34A', '#B45309', '#0EA5E9'];
  bottles.forEach((c, i) => {
    const bx = x - 66 + i * 14, tall = 12 + (i % 3) * 2;
    ctx.fillStyle = c; ctx.fillRect(bx, y - 66 - tall, 6, tall); ctx.fillRect(bx + 2, y - 66 - tall - 4, 2, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(bx + 1, y - 64 - tall, 1, tall - 4);
  });
  // The front posts
  bamboo(ctx, x - 94, y - 96, 10, 96); bamboo(ctx, x + 84, y - 96, 10, 96);
  // The counter: bamboo slats, a plank top, drinks with umbrellas in them
  for (let i = 0; i < 22; i++) {
    const sx = x - 88 + i * 8;
    ctx.fillStyle = i % 2 ? '#B8893A' : '#A0742C'; ctx.fillRect(sx, y - 38, 8, 38);
    ctx.fillStyle = i % 2 ? '#DDB25A' : '#C99A44'; ctx.fillRect(sx + 1, y - 38, 2, 38);
    ctx.fillStyle = '#6B4A1E'; ctx.fillRect(sx + 7, y - 38, 1, 38); ctx.fillRect(sx, y - 22 + (i % 3) * 2, 8, 2);
  }
  ctx.fillStyle = '#5B3413'; ctx.fillRect(x - 96, y - 44, 192, 8);
  ctx.fillStyle = '#8B5A2B'; ctx.fillRect(x - 96, y - 44, 192, 3);
  ctx.fillStyle = '#2A1A0C'; ctx.fillRect(x - 96, y - 36, 192, 2);
  const drinks: [number, string, string][] = [[-50, '#F97316', '#EC4899'], [20, '#38BDF8', '#FACC15'], [56, '#F43F5E', '#22C55E']];
  for (const [dx, c, u] of drinks) {
    const gx = x + dx;
    ctx.fillStyle = 'rgba(224, 242, 254, 0.7)'; ctx.fillRect(gx - 4, y - 56, 8, 12); ctx.fillStyle = c; ctx.fillRect(gx - 3, y - 52, 6, 8);
    ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx + 2, y - 52); ctx.lineTo(gx + 6, y - 64); ctx.stroke();
    ctx.fillStyle = u; ctx.beginPath(); ctx.moveTo(gx, y - 63); ctx.lineTo(gx + 6, y - 69); ctx.lineTo(gx + 12, y - 63); ctx.closePath(); ctx.fill();
  }
  // Stools out front (dark legs, red cushions)
  for (const sx of [x - 40, x + 40]) {
    ctx.fillStyle = '#3B2810'; ctx.fillRect(sx - 7, y - 22, 3, 22); ctx.fillRect(sx + 4, y - 22, 3, 22); ctx.fillRect(sx - 6, y - 10, 12, 2);
    ctx.fillStyle = '#7F1D1D'; ctx.fillRect(sx - 10, y - 27, 20, 6); ctx.fillStyle = '#DC2626'; ctx.fillRect(sx - 10, y - 27, 20, 3);
    ctx.fillStyle = '#FCA5A5'; ctx.fillRect(sx - 7, y - 26, 5, 1);
  }
  // A tiki carving stood by the corner of the bar: a scowling face on a post, a flat-top of feathers
  const tx = x - 122, tb = y;
  ctx.fillStyle = '#5B3413'; ctx.fillRect(tx - 9, tb - 58, 18, 58);
  ctx.fillStyle = '#7C4A1E'; ctx.fillRect(tx - 9, tb - 58, 13, 58);
  ctx.fillStyle = '#A16207'; ctx.fillRect(tx - 11, tb - 60, 22, 4); ctx.fillRect(tx - 11, tb - 20, 22, 3);
  ctx.fillStyle = '#3B2210'; ctx.fillRect(tx - 7, tb - 50, 6, 5); ctx.fillRect(tx + 1, tb - 50, 6, 5);
  ctx.fillStyle = '#FDE68A'; ctx.fillRect(tx - 5, tb - 48, 2, 2); ctx.fillRect(tx + 3, tb - 48, 2, 2);
  ctx.fillStyle = '#3B2210'; ctx.fillRect(tx - 2, tb - 44, 4, 7); ctx.fillRect(tx - 7, tb - 34, 14, 7);
  ctx.fillStyle = '#F8FAFC'; for (let i = 0; i < 3; i++) ctx.fillRect(tx - 6 + i * 5, tb - 33, 2, 2);
  ctx.fillStyle = '#3B2210'; ctx.fillRect(tx - 6, tb - 14, 12, 2); ctx.fillRect(tx - 1, tb - 18, 2, 10);
  for (let i = 0; i < 5; i++) { ctx.fillStyle = ['#DC2626', '#FACC15', '#16A34A', '#FACC15', '#DC2626'][i]; ctx.fillRect(tx - 10 + i * 4, tb - 70 + Math.abs(i - 2) * 2, 3, 10 - Math.abs(i - 2) * 2); }
  // The roof: three ragged tiers of thatch, darkest at the top, each fringe flapping (hard, in the storm)
  const tiers = [
    { half: 70, top: y - 162, bot: y - 128, c: ['#7A5A14', '#A16207', '#CA8A04'] },
    { half: 104, top: y - 140, bot: y - 108, c: ['#8A6514', '#B07A0A', '#D9A520'] },
    { half: 128, top: y - 120, bot: y - 88, c: ['#946C12', '#C08A10', '#EAB308'] },
  ];
  tiers.forEach((t, ti) => {
    const inner = t.half * 0.35;
    ctx.fillStyle = t.c[0];
    ctx.beginPath(); ctx.moveTo(x - t.half, t.bot); ctx.lineTo(x - inner, t.top); ctx.lineTo(x + inner, t.top); ctx.lineTo(x + t.half, t.bot); ctx.closePath(); ctx.fill();
    // strands down the slope, lit and shaded
    for (let sx = -t.half + 4; sx < t.half - 2; sx += 6) {
      const k = Math.max(0, (Math.abs(sx) - inner) / (t.half - inner));
      const top = t.top + (t.bot - t.top) * k;
      ctx.fillStyle = (Math.round(sx / 6) % 2) ? t.c[1] : t.c[2];
      ctx.fillRect(Math.round(x + sx), Math.round(top), 2, Math.max(1, Math.round(t.bot - top)));
    }
    // the ragged fringe hanging off the bottom edge
    ctx.fillStyle = t.c[1];
    for (let sx = -t.half; sx < t.half; sx += 5) {
      const flap = Math.sin(f * (0.08 + storm * 0.3) + sx * 0.3 + ti) * (1 + storm * 5);
      const len = 6 + (((sx * 7 + ti * 13) % 5) + 5) % 5 + storm * 3;
      ctx.beginPath(); ctx.moveTo(x + sx, t.bot - 1); ctx.lineTo(x + sx + 5, t.bot - 1); ctx.lineTo(x + sx + 2.5 + flap, t.bot + len); ctx.closePath(); ctx.fill();
    }
  });
  // Party lights strung under the eaves (flickering in the storm)
  ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x - 92, y - 80); ctx.quadraticCurveTo(x, y - 66, x + 92, y - 80); ctx.stroke();
  const bulbs = ['#F43F5E', '#FACC15', '#22C55E', '#38BDF8', '#F97316'];
  for (let i = 0; i <= 12; i++) {
    const k = i / 12, bx = x - 92 + k * 184, by = y - 80 + Math.sin(k * Math.PI) * 7 + 2;
    const on = storm < 0.3 || (Math.floor(f / 4) + i * 7) % 11 > 2;
    ctx.fillStyle = on ? bulbs[i % bulbs.length] : '#44403C';
    ctx.fillRect(Math.round(bx) - 2, Math.round(by), 4, 5);
    if (on) { ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; ctx.fillRect(Math.round(bx) - 1, Math.round(by) + 1, 1, 2); }
  }
  // The sign: a carved board hung off the front of the roof on two ropes, swinging
  const swing = Math.sin(f * 0.05) * 0.03 + storm * Math.sin(f * 0.25) * 0.12;
  ctx.save(); ctx.translate(x, y - 104); ctx.rotate(swing);
  ctx.strokeStyle = '#3B2810'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-34, -4); ctx.lineTo(-30, 8); ctx.moveTo(34, -4); ctx.lineTo(30, 8); ctx.stroke();
  ctx.fillStyle = '#5B3413'; ctx.fillRect(-44, 8, 88, 22);
  ctx.fillStyle = '#7C4A1E'; ctx.fillRect(-42, 10, 84, 18);
  ctx.fillStyle = '#3B2210'; ctx.fillRect(-42, 26, 84, 2);
  ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillStyle = '#2A1A0C'; ctx.fillText(p.text ?? '', 1, 24);
  ctx.fillStyle = '#FDE047'; ctx.fillText(p.text ?? '', 0, 23); ctx.textAlign = 'left';
  ctx.restore();
  // Tiki torches either side, flames blown about and guttering in the storm
  for (const side of [-1, 1]) {
    const px = x + side * (side < 0 ? 152 : 140);
    bamboo(ctx, px - 3, y - 80, 6, 80);
    ctx.fillStyle = '#3B2810'; ctx.fillRect(px - 6, y - 90, 12, 10); ctx.fillStyle = '#5B3413'; ctx.fillRect(px - 6, y - 90, 12, 2);
    if (storm > 0.5 && (Math.floor(f / 7) + side + 5) % 5 === 0) continue;
    // (laid over by the wind, and whipping about in it)
    const lean = -storm * (0.6 + Math.sin(f * 0.5 + side) * 0.2), h = 22 + Math.sin(f * 0.4 + side) * 3 - storm * 6;
    steppedGlow(ctx, px, y - 98, 20, '#F97316', 0.25, 0.05, 3);
    drawFlameLicks(ctx, px, y - 88, 12, h, f, { seed: side + 2, n: 2, lean });
  }
};

const drawProp = (ctx: Ctx, state: GameState, p: Prop, rt: HectorRuntime) => {
  const storm = rt.beach.storm;
  const f = state.frame;
  const sway = storm * Math.sin(f * 0.15 + p.x) * 0.25 - storm * 0.5;
  switch (p.look) {
    case 'umbrella': {
      // (it's a trampoline: bounce on it and it gives; in the storm it shakes and strains, but it holds)
      const idx = COURSE.plats.findIndex(q => q.look === 'umbrella' && Math.abs(q.x + 45 - p.x) < 2);
      const bi = rt.hazards.awningBlocks.findIndex(b => b.tag === `awning-${idx}`);
      const wob = bi >= 0 ? rt.hazards.awningWobble[bi] : 0;
      const give = wob > 0 ? Math.sin(wob * 0.6) * (wob / 24) * 8 : 0;
      // (the pole's planted: it's the top that gives, the pole taking it up, its foot staying in the sand)
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(sway * 0.25 + (storm > 0 ? Math.sin(f * 0.4 + p.x) * 0.05 * storm : 0));
      // (the pole: lit down one side, inked, a crank halfway up)
      ink(ctx, () => ctx.rect(-2, -92 + give, 4, 92 - give), '#E5E7EB');
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-1, -92 + give, 1, 92 - give); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(1, -92 + give, 1, 92 - give);
      ink(ctx, () => ctx.rect(-3, -50 + give / 2, 6, 6), '#9CA3AF');
      ctx.translate(0, give);
      // (the canopy: panels in its color and white, lit to the upper left, a shade to the right, ribs, a scalloped hem)
      const col = p.color ?? '#F43F5E';
      const canopy = () => { ctx.moveTo(-55, -80); ctx.quadraticCurveTo(0, -120, 55, -80); ctx.closePath(); };
      ctx.save(); ctx.beginPath(); canopy(); ctx.clip();
      ctx.fillStyle = col; ctx.fillRect(-56, -102, 112, 24);
      ctx.fillStyle = '#F8FAFC';
      for (let i = -2; i <= 2; i += 2) { ctx.beginPath(); ctx.moveTo(i * 11, -80); ctx.quadraticCurveTo(i * 9, -112, 0, -104); ctx.lineTo((i + 1) * 11, -80); ctx.fill(); }
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; ctx.fillRect(-56, -102, 40, 8);
      ctx.fillStyle = 'rgba(26, 11, 6, 0.18)'; ctx.fillRect(22, -102, 34, 24); ctx.fillRect(-56, -84, 112, 4);
      ctx.restore();
      ctx.strokeStyle = dark(col, 0.35); ctx.lineWidth = 1;
      for (const rx of [-33, 33]) { ctx.beginPath(); ctx.moveTo(0, -100); ctx.quadraticCurveTo(rx * 0.7, -96, rx * 1.4, -80); ctx.stroke(); }
      ctx.beginPath(); canopy(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
      for (let k = 0; k < 11; k++) {
        const hx = -55 + k * 10 + 5;
        ink(ctx, () => ctx.arc(hx, -80, 5, 0, Math.PI), k % 2 ? '#F8FAFC' : col);
      }
      // (the finial)
      ink(ctx, () => ctx.rect(-2, -106, 4, 6), '#E5E7EB');
      ctx.restore();
      return;
    }
    case 'net': {
      // A volleyball net, seen across the court the way the players are: the near post, the far one smaller and further
      // back up the beach, the net strung between them (tape along the top, a cord along the bottom, the mesh bellying in
      // the wind), guy ropes out to stakes
      const s2 = 0.82, x1 = p.x, x2 = p.x + 56, b1 = p.y, b2 = p.y - 5;
      const T1 = b1 - 92, B1 = b1 - 56, T2 = b2 - 92 * s2, B2 = b2 - 56 * s2;
      const blow = Math.sin(f * 0.1 + p.x) * (1 + storm * 5) + storm * 4;
      // (the guy ropes and their stakes, behind)
      ctx.strokeStyle = '#D6C7A1'; ctx.lineWidth = 1; ctx.beginPath();
      ctx.moveTo(x1, b1 - 98); ctx.lineTo(x1 - 26, b1 + 6); ctx.moveTo(x2, b2 - 98 * s2); ctx.lineTo(x2 + 20, b2 - 16); ctx.stroke();
      ink(ctx, () => ctx.rect(x1 - 28, b1 + 1, 3, 5), '#8A6E4B'); ink(ctx, () => ctx.rect(x2 + 19, b2 - 18, 2, 4), '#8A6E4B');
      /** Where the net is at u (0 near post .. 1 far post) and v (0 top .. 1 bottom): sagging in the middle, bellying with the wind. */
      const at = (u: number, v: number) => {
        const belly = Math.sin(Math.PI * u), top = T1 + (T2 - T1) * u, bot = B1 + (B2 - B1) * u;
        return { x: x1 + 2 + u * (x2 - x1 - 3) + belly * v * blow, y: top + 1 + belly * (2 + Math.abs(blow) * 0.3) + v * (bot - top - 1) };
      };
      // The mesh
      ctx.strokeStyle = 'rgba(31, 41, 55, 0.65)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let r = 1; r <= 5; r++) { const v = r / 6; for (let k = 0; k <= 20; k++) { const q = at(k / 20, v); if (k) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); } }
      for (let c = 1; c < 12; c++) { const u = c / 12, a = at(u, 0), m = at(u, 0.5), z = at(u, 1); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(m.x, m.y, z.x, z.y); }
      ctx.stroke();
      // The cord along the bottom, and the tape along the top (inked, lit along its upper edge)
      const edge = (v: number) => { ctx.beginPath(); for (let k = 0; k <= 20; k++) { const q = at(k / 20, v); if (k) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); } };
      ctx.strokeStyle = '#374151'; ctx.lineWidth = 2; edge(1); ctx.stroke();
      ctx.strokeStyle = INK; ctx.lineWidth = 6; edge(0); ctx.stroke();
      ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 4; edge(0); ctx.stroke();
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1; ctx.beginPath(); for (let k = 0; k <= 20; k++) { const q = at(k / 20, 0); if (k) ctx.lineTo(q.x, q.y - 1.5); else ctx.moveTo(q.x, q.y - 1.5); } ctx.stroke();
      // The posts (the far one first, smaller): inked, lit down one side, a cap on top, the net tied off on each
      for (const [x, base, s, top, bot] of [[x2, b2, s2, T2, B2], [x1, b1, 1, T1, B1]] as const) {
        const h = Math.round(100 * s), w = s < 1 ? 3 : 4;
        ink(ctx, () => ctx.rect(x - w / 2, base - h, w, h), '#E5E7EB');
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - w / 2 + 1, base - h, 1, h); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x + w / 2 - 1, base - h, 1, h);
        ink(ctx, () => ctx.rect(x - w, base - h - 2, w * 2, 4), '#F8FAFC');
        ink(ctx, () => ctx.rect(x - w + 1, top - 1, w * 2 - 2, 3), '#CBD5E1'); ink(ctx, () => ctx.rect(x - w + 1, bot - 1, w * 2 - 2, 3), '#CBD5E1');
        ctx.fillStyle = '#C2A878'; ctx.fillRect(x - w - 2, base - 2, w * 2 + 4, 2); // (the sand heaped round its foot)
      }
      return;
    }
    case 'palm': {
      const { x: tx, y: ty, lean } = palmTip(p.x, f, storm);
      ctx.save(); ctx.translate(p.x, p.y);
      // The trunk: inked, lit down one side, ringed where the old fronds came off
      const at = (t: number) => ({ x: 2 * (1 - t) * t * tx * 0.3 + t * t * tx, y: 2 * (1 - t) * t * ty * 0.6 + t * t * ty });
      ctx.lineCap = 'round';
      ctx.strokeStyle = INK; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(tx * 0.3, ty * 0.6, tx, ty); ctx.stroke();
      ctx.strokeStyle = '#7C5A3A'; ctx.lineWidth = 9; ctx.stroke();
      ctx.strokeStyle = '#A47B50'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-2, 0); ctx.quadraticCurveTo(tx * 0.3 - 2, ty * 0.6, tx - 2, ty); ctx.stroke();
      ctx.lineCap = 'butt';
      for (let t = 0.04; t < 0.96; t += 0.055) {
        const q = at(t);
        ctx.fillStyle = '#4A3420'; ctx.fillRect(Math.round(q.x) - 4, Math.round(q.y), 9, 2);
        ctx.fillStyle = '#B48A5C'; ctx.fillRect(Math.round(q.x) - 3, Math.round(q.y) + 2, 3, 1);
      }
      // The fronds: a darker layer behind, then the front ones inked, a lit edge, a midrib, leaflets ragged off the
      // underside (same sweep as ever: the iguanas sit in them)
      const frond = (a: number, s: number, c: string, rim: string) => {
        const ex = tx + Math.cos(a) * 70 * s, ey = ty + Math.sin(a) * 30 * s + 10;
        const cx = tx + Math.cos(a) * 40 * s, cy = ty + Math.sin(a) * 20 * s - 10;
        ink(ctx, () => { ctx.moveTo(tx, ty); ctx.quadraticCurveTo(cx, cy, ex, ey); ctx.lineTo(tx + Math.cos(a) * 60 * s, ty + Math.sin(a) * 30 * s + 16); ctx.closePath(); }, c);
        ctx.strokeStyle = rim; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(tx, ty - 1); ctx.quadraticCurveTo(cx, cy - 1, ex, ey - 1); ctx.stroke();
        for (let k = 1; k < 7; k++) {
          const t = k / 7, mx = (1 - t) * (1 - t) * tx + 2 * (1 - t) * t * cx + t * t * ex, my = (1 - t) * (1 - t) * ty + 2 * (1 - t) * t * cy + t * t * ey;
          ctx.fillStyle = dark(c, 0.35); ctx.fillRect(Math.round(mx), Math.round(my) + 2, 2, 4 + (k % 2) * 2);
          ctx.fillStyle = c; ctx.fillRect(Math.round(mx) + 2, Math.round(my) + 2, 2, 3 + (k % 2) * 3);
        }
      };
      for (let i = 0; i < 6; i++) frond((i / 6) * Math.PI * 2 + Math.PI / 6 + lean * 0.8 + Math.sin(f * 0.2 + i + 3) * 0.12 * (0.3 + storm), 0.85, '#14532D', '#166534');
      for (let i = 0; i < 6; i++) frond((i / 6) * Math.PI * 2 + lean + Math.sin(f * 0.2 + i) * 0.15 * (0.3 + storm), 1, '#15803D', '#4ADE80');
      for (let i = 0; i < 3; i++) {
        ink(ctx, () => ctx.arc(tx - 6 + i * 6, ty + 6, 4, 0, Math.PI * 2), '#78350F');
        ctx.fillStyle = '#B45309'; ctx.fillRect(tx - 8 + i * 6, ty + 3, 2, 2);
      }
      ctx.restore();
      return;
    }
    case 'tiki': drawTiki(ctx, p, f, storm); return;
    case 'motel': drawMotel(ctx, state, p, storm); return;
    case 'sign': {
      // A roadside sign on a steel post: a black box with a bezel, a neon tube round its edge and neon letters
      const col = p.color ?? '#F43F5E';
      ink(ctx, () => ctx.rect(p.x - 3, p.y - 170, 6, 170), '#4B5563');
      ctx.fillStyle = '#6B7280'; ctx.fillRect(p.x - 2, p.y - 170, 2, 170); ctx.fillStyle = '#374151'; ctx.fillRect(p.x + 1, p.y - 170, 1, 170);
      ink(ctx, () => ctx.rect(p.x - 10, p.y - 168, 20, 4), '#374151');
      const on = Math.floor(f / (6 + hash(p.x) * 20)) % 9 !== 0; // flickering in the storm
      slab(ctx, p.x - 70, p.y - 210, 140, 44, '#1F2937', 2);
      ctx.fillStyle = '#0B0F19'; ctx.fillRect(p.x - 64, p.y - 204, 128, 32);
      if (on) {
        ctx.strokeStyle = col; ctx.globalAlpha = 0.18; ctx.lineWidth = 7; ctx.strokeRect(p.x - 66, p.y - 206, 132, 36);
        ctx.globalAlpha = 1;
      }
      ctx.strokeStyle = on ? col : '#3F3F46'; ctx.lineWidth = 3; ctx.strokeRect(p.x - 66, p.y - 206, 132, 36);
      if (on) { ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'; ctx.lineWidth = 1; ctx.strokeRect(p.x - 66.5, p.y - 206.5, 133, 37); }
      neon(ctx, p.text ?? '', p.x, p.y - 182, 11, on ? col : '#4B5563', on);
      ctx.fillStyle = '#9CA3AF'; for (const [bx, by] of [[-67, -207], [65, -207], [-67, -171], [65, -171]]) ctx.fillRect(p.x + bx, p.y + by, 2, 2);
      return;
    }
    case 'powerline': drawPowerline(ctx, state, p); return;
    case 'pool': {
      // Tiled coping round the edge, grout between, inked under (the water's drawn in front)
      const pw = (p.w ?? 300) + 16;
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(p.x - 8, p.y - 4, pw, 6);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(p.x - 8, p.y - 4, pw, 1);
      ctx.fillStyle = '#CBD5E1'; for (let x = p.x - 8; x < p.x - 8 + pw; x += 12) ctx.fillRect(x, p.y - 4, 1, 6);
      ctx.fillStyle = '#94A3B8'; ctx.fillRect(p.x - 8, p.y + 1, pw, 1);
      return;
    }
    case 'yacht': {
      const w = p.w ?? 280, x = p.x, y = p.y;
      // (she's afloat behind the dock: her keel's down in the water, not stood on the boards)
      const keel = COURSE.sea.y + 14, belly = keel - y;
      // The hull: white, inked, a shade along its belly and toward the stern, a navy stripe, portholes, a rub rail
      const hull = () => { ctx.moveTo(x, y - 90); ctx.lineTo(x + w, y - 90); ctx.lineTo(x + w - 30, keel); ctx.lineTo(x + 20, keel); ctx.closePath(); };
      ctx.save(); ctx.beginPath(); hull(); ctx.clip();
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x, y - 90, w, 90 + belly);
      ctx.fillStyle = '#E2E8F0'; ctx.fillRect(x, y - 20, w, 20 + belly);
      ctx.fillStyle = '#CBD5E1'; ctx.fillRect(x, y - 4, w, 4 + belly); checker(ctx, x, y - 22, w, 2, '#E2E8F0');
      // (her bottom paint, from the waterline down)
      ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x, COURSE.sea.y - 2, w, keel - COURSE.sea.y + 2); ctx.fillStyle = '#B91C1C'; ctx.fillRect(x, COURSE.sea.y - 2, w, 2);
      ctx.fillStyle = 'rgba(26, 11, 6, 0.1)'; ctx.fillRect(x, y - 90, 24, 90 + belly);
      ctx.fillStyle = '#1E3A8A'; ctx.fillRect(x, y - 40, w, 6); ctx.fillStyle = '#3B82F6'; ctx.fillRect(x, y - 40, w, 1);
      ctx.restore();
      ctx.beginPath(); hull(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#94A3B8'; ctx.fillRect(x, y - 92, w, 3); ctx.fillStyle = '#E2E8F0'; ctx.fillRect(x, y - 92, w, 1);
      for (let k = 0; k < 6; k++) {
        const hx = x + 40 + k * 36;
        ink(ctx, () => ctx.arc(hx, y - 62, 5, 0, Math.PI * 2), '#94A3B8');
        ctx.fillStyle = '#0F172A'; ctx.fillRect(hx - 3, y - 65, 6, 6); ctx.fillStyle = '#7DD3FC'; ctx.fillRect(hx - 2, y - 64, 2, 2);
      }
      // (the deck rail, posts and a top line)
      ctx.fillStyle = '#9CA3AF'; for (let rx = x + 6; rx < x + w - 4; rx += 18) ctx.fillRect(rx, y - 104, 1, 12);
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(x + 4, y - 105, w - 8, 2); ctx.fillStyle = '#6B7280'; ctx.fillRect(x + 4, y - 103, w - 8, 1);
      // The cabin: banded glass, the sky glinting across it, a flybridge and a radar mast on top
      slab(ctx, x + 60, y - 140, 140, 50, '#E5E7EB', 2);
      for (let i = 0; i < 4; i++) {
        const wx = x + 70 + i * 32;
        ctx.fillStyle = '#0F172A'; ctx.fillRect(wx, y - 130, 22, 14);
        ctx.fillStyle = '#1E3A5F'; ctx.fillRect(wx, y - 123, 22, 7);
        ctx.fillStyle = 'rgba(186, 230, 253, 0.55)'; ctx.fillRect(wx + 3, y - 129, 3, 12); ctx.fillRect(wx + 8, y - 129, 1, 12);
        ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(wx + 0.5, y - 129.5, 21, 13);
      }
      ink(ctx, () => ctx.rect(x + 80, y - 150, 90, 10), '#CBD5E1'); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + 81, y - 149, 88, 2);
      ink(ctx, () => ctx.rect(x + 150, y - 172, 3, 22), '#9CA3AF');
      ink(ctx, () => ctx.rect(x + 140, y - 174, 24, 4), '#E5E7EB');
      // (her name on the transom side)
      ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'left';
      ctx.fillStyle = '#CBD5E1'; ctx.fillText('REEL DEAL', x + 41, y - 19);
      ctx.fillStyle = '#111827'; ctx.fillText('REEL DEAL', x + 40, y - 20);
      return;
    }
  }
};

/** A tacky two-story motel: pastel stucco, a row of doors, windows (curtains drawn, an AC unit under each), a neon name that flickers in the storm. */
const drawMotel = (ctx: Ctx, state: GameState, p: Prop, storm: number) => {
  const w = p.w ?? 600, h = p.h ?? 260, x = p.x, base = p.y;
  // (the building and its sign's box never change: painted the once and stamped; the AC units' drips and the neon live)
  stamp(ctx, `hector-motel-${x}-${base}-${w}-${h}-${p.color}`, x - 4, base - h - 54, w + 8, h + 58, g => motelStill(g, p));
  for (let dx = 40; dx < w - 40; dx += 90) for (const fy of [base, base - h / 2 + 2]) {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.5)'; ctx.fillRect(x + dx + 66, fy - 18 + (state.frame + dx) % 14, 1, 2);
  }
  const on = storm < 0.5 || Math.floor(state.frame / (5 + hash(x) * 17)) % 7 !== 0;
  neon(ctx, p.text ?? 'MOTEL', x + w / 2, base - h - 20, 16, on ? '#F472B6' : '#4B5563', on);
};
const motelStill = (ctx: Ctx, p: Prop) => {
  const w = p.w ?? 600, h = p.h ?? 260, x = p.x, base = p.y;
  const color = p.color ?? '#5EEAD4';
  // The stucco: speckled, shaded toward the right end, a scuffed plinth along the bottom
  ctx.fillStyle = '#FDF2F8'; ctx.fillRect(x, base - h, w, h);
  ctx.fillStyle = '#F5DCEB';
  for (let k = 0; k < w * h / 260; k++) ctx.fillRect(Math.round(x + hash(k * 3.1 + x) * w), Math.round(base - h + hash(k * 7.7 + x) * h), 2, 1);
  ctx.fillStyle = 'rgba(131, 24, 67, 0.08)'; ctx.fillRect(x + w - 60, base - h, 60, h); checker(ctx, x + w - 64, base - h, 4, h, 'rgba(131, 24, 67, 0.08)');
  ctx.fillStyle = '#E9CFE0'; ctx.fillRect(x, base - 8, w, 8); ctx.fillStyle = '#D8B4CB'; ctx.fillRect(x, base - 2, w, 2);
  // (the cornice and the band under the walkway, in the trim color, lit on top, a shadow cast under)
  for (const [ty, th] of [[base - h, 16], [base - h / 2 - 8, 8]] as const) {
    ctx.fillStyle = color; ctx.fillRect(x, ty, w, th);
    ctx.fillStyle = lite(color, 0.35); ctx.fillRect(x, ty, w, 2);
    ctx.fillStyle = dark(color, 0.25); ctx.fillRect(x, ty + th - 2, w, 2);
    ctx.fillStyle = 'rgba(131, 24, 67, 0.12)'; ctx.fillRect(x, ty + th, w, 4);
  }
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, base - h + 0.5, w - 1, h - 1);
  // Doors downstairs and up: a frame, panels, a number, a knob, a lamp over; the window beside it with its curtains
  let room = 1;
  for (let dx = 40; dx < w - 40; dx += 90) {
    for (const fy of [base, base - h / 2 + 2]) {
      const n = (fy === base ? 100 : 200) + room;
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + dx - 3, fy - 73, 40, 73);
      slab(ctx, x + dx, fy - 70, 34, 70, color, 2);
      ctx.strokeStyle = dark(color, 0.3); ctx.lineWidth = 1;
      ctx.strokeRect(x + dx + 5.5, fy - 64.5, 23, 24); ctx.strokeRect(x + dx + 5.5, fy - 34.5, 23, 26);
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + dx + 10, fy - 61, 14, 7);
      ctx.fillStyle = '#111827'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText(String(n), x + dx + 17, fy - 55); ctx.textAlign = 'left';
      ink(ctx, () => ctx.rect(x + dx + 26, fy - 38, 4, 4), '#FDE047'); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + dx + 26, fy - 38, 1, 1);
      ink(ctx, () => ctx.rect(x + dx + 14, fy - 80, 6, 5), '#FEF3C7'); ctx.fillStyle = 'rgba(254, 240, 138, 0.25)'; ctx.fillRect(x + dx + 12, fy - 75, 10, 4);
      // (the window: a white frame, the glass, the curtains pulled to, a glint; the AC unit dripping under it)
      slab(ctx, x + dx + 42, fy - 62, 34, 30, '#F8FAFC', 1);
      ctx.fillStyle = '#1E3A5F'; ctx.fillRect(x + dx + 44, fy - 60, 30, 26);
      ctx.fillStyle = dark(color, 0.1); ctx.fillRect(x + dx + 44, fy - 60, 9, 26); ctx.fillRect(x + dx + 65, fy - 60, 9, 26);
      ctx.fillStyle = dark(color, 0.35); for (let k = 0; k < 3; k++) { ctx.fillRect(x + dx + 46 + k * 3, fy - 60, 1, 26); ctx.fillRect(x + dx + 67 + k * 3, fy - 60, 1, 26); }
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x + dx + 55, fy - 58, 2, 10); ctx.fillRect(x + dx + 58, fy - 58, 1, 6);
      slab(ctx, x + dx + 48, fy - 30, 22, 12, '#CBD5E1', 1);
      ctx.fillStyle = '#64748B'; for (let k = 0; k < 4; k++) ctx.fillRect(x + dx + 51, fy - 27 + k * 2, 16, 1);
    }
    room++;
  }
  // The neon name on the roof: a black box on struts, a bezel, the letters in tube
  const sx = x + w / 2 - 130, sy = base - h - 50;
  for (const px of [sx + 40, sx + 220]) { ink(ctx, () => ctx.rect(px - 2, sy + 44, 4, 6), '#4B5563'); }
  slab(ctx, sx, sy, 260, 44, '#1F2937', 2);
  ctx.fillStyle = '#0B0F19'; ctx.fillRect(sx + 5, sy + 5, 250, 34);
  ctx.fillStyle = '#9CA3AF'; for (const bx of [sx + 3, sx + 255]) for (const by of [sy + 3, sy + 39]) ctx.fillRect(bx, by, 2, 2);
};

// ---------------------------------------------------------------------------
// Platforms
// ---------------------------------------------------------------------------

const drawPlat = (ctx: Ctx, state: GameState, p: Plat, i: number, rt: HectorRuntime) => {
  const ground = 550;
  switch (p.look) {
    case 'lifeguard': {
      // The lifeguard stand: white legs cross-braced, a ramp with treads, the red hut (its roof, a window with the
      // cross in it), the yellow deck you stand on
      for (const lx of [p.x + 8, p.x + p.w - 14]) {
        ink(ctx, () => ctx.rect(lx, p.y, 6, ground - p.y), '#F8FAFC');
        ctx.fillStyle = '#CBD5E1'; ctx.fillRect(lx + 4, p.y, 2, ground - p.y);
      }
      ctx.strokeStyle = '#CBD5E1'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(p.x + 14, p.y + 30); ctx.lineTo(p.x + p.w - 14, p.y + 80); ctx.moveTo(p.x + p.w - 14, p.y + 30); ctx.lineTo(p.x + 14, p.y + 80); ctx.stroke();
      ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(p.x + 11, p.y + 20); ctx.lineTo(p.x + p.w - 11, ground - 10); ctx.stroke();
      ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 3; ctx.stroke();
      ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 1; ctx.beginPath();
      for (let k = 1; k < 8; k++) { const t = k / 8, rx = p.x + 11 + (p.w - 22) * t, ry = p.y + 20 + (ground - 10 - p.y - 20) * t; ctx.moveTo(rx - 3, ry + 1); ctx.lineTo(rx + 3, ry - 1); }
      ctx.stroke();
      slab(ctx, p.x, p.y - 50, p.w, 50, '#EF4444', 2);
      ctx.fillStyle = '#B91C1C'; for (let k = p.x + 6; k < p.x + p.w - 4; k += 8) ctx.fillRect(k, p.y - 14, 1, 12);
      ink(ctx, () => ctx.rect(p.x - 4, p.y - 56, p.w + 8, 7), '#F8FAFC'); ctx.fillStyle = '#CBD5E1'; ctx.fillRect(p.x - 3, p.y - 51, p.w + 6, 2);
      slab(ctx, p.x + 8, p.y - 40, p.w - 16, 22, '#F8FAFC', 1);
      ink(ctx, () => { ctx.rect(p.x + p.w / 2 - 3, p.y - 38, 6, 18); ctx.rect(p.x + p.w / 2 - 9, p.y - 32, 18, 6); }, '#EF4444');
      ctx.fillStyle = '#EF4444'; ctx.fillRect(p.x + p.w / 2 - 2, p.y - 31, 4, 4);
      slab(ctx, p.x - 6, p.y, p.w + 12, 6, '#FACC15', 1);
      return;
    }
    case 'pier': {
      // Pilings down into the water, then the deck: planks, a gap and a nail head each, the far end snapped off in splinters
      for (let x = p.x + 10; x < p.x + p.w; x += 60) {
        ink(ctx, () => ctx.rect(x, p.y, 10, COURSE.sea.y - p.y + 60), '#5B3A1E');
        ctx.fillStyle = '#7A5530'; ctx.fillRect(x + 1, p.y + 1, 3, COURSE.sea.y - p.y + 58);
        ctx.fillStyle = '#4D7C0F'; ctx.fillRect(x + 1, COURSE.sea.y + 6, 8, 3);
      }
      ctx.fillStyle = '#854D0E'; ctx.fillRect(p.x, p.y, p.w, 12);
      for (let x = p.x; x < p.x + p.w; x += 22) {
        ctx.fillStyle = '#A16207'; ctx.fillRect(x, p.y, 20, 9);
        ctx.fillStyle = '#CA8A04'; ctx.fillRect(x, p.y, 20, 2);
        ctx.fillStyle = '#5B3A1E'; ctx.fillRect(x + 20, p.y, 2, 12);
        ctx.fillStyle = '#44403C'; ctx.fillRect(x + 3, p.y + 4, 2, 2);
      }
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, 11);
      ink(ctx, () => { ctx.moveTo(p.x + p.w, p.y); ctx.lineTo(p.x + p.w + 8, p.y + 2); ctx.lineTo(p.x + p.w + 3, p.y + 4); ctx.lineTo(p.x + p.w + 14, p.y + 5); ctx.lineTo(p.x + p.w + 4, p.y + 8); ctx.lineTo(p.x + p.w, p.y + 10); ctx.closePath(); }, '#A16207');
      return;
    }
    case 'balcony': {
      // A concrete walkway, lit along its lip, a shadow cast under; the railing's posts and top rail in painted steel
      slab(ctx, p.x, p.y, p.w, 10, '#E5E7EB', 2);
      ctx.fillStyle = 'rgba(131, 24, 67, 0.15)'; ctx.fillRect(p.x, p.y + 10, p.w, 5);
      for (let x = p.x; x <= p.x + p.w; x += 14) { ctx.fillStyle = '#4B5563'; ctx.fillRect(x, p.y - 26, 2, 26); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x, p.y - 26, 1, 26); }
      ink(ctx, () => ctx.rect(p.x, p.y - 28, p.w, 3), '#6B7280');
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(p.x + 1, p.y - 28, p.w - 2, 1);
      ctx.fillStyle = '#4B5563'; ctx.fillRect(p.x, p.y - 12, p.w, 1);
      return;
    }
    case 'car': {
      // A parked sedan: inked body lit along the top, a door seam and handle, chrome bumpers, its lights, glass with a
      // glint, the wheels and hubcaps
      const c = p.color ?? '#DC2626';
      ink(ctx, () => { ctx.moveTo(p.x, p.y + 10); ctx.lineTo(p.x + 12, p.y); ctx.lineTo(p.x + p.w - 12, p.y); ctx.lineTo(p.x + p.w, p.y + 10); ctx.closePath(); }, c);
      ctx.fillStyle = lite(c, 0.3); ctx.fillRect(p.x + 12, p.y + 1, p.w - 24, 1);
      for (const [wx, ww] of [[p.x + 16, p.w / 2 - 20], [p.x + p.w / 2 + 4, p.w / 2 - 20]]) {
        ctx.fillStyle = '#1E3A5F'; ctx.fillRect(wx, p.y + 3, ww, 8);
        ctx.fillStyle = '#93C5FD'; ctx.fillRect(wx, p.y + 3, ww, 4);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; ctx.fillRect(wx + 4, p.y + 3, 2, 8); ctx.fillRect(wx + 8, p.y + 3, 1, 8);
        ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(wx + 0.5, p.y + 3.5, ww - 1, 7);
      }
      slab(ctx, p.x - 20, p.y + 10, p.w + 40, 30, c, 2);
      ctx.fillStyle = dark(c, 0.15); ctx.fillRect(p.x - 18, p.y + 28, p.w + 36, 10);
      ctx.fillStyle = dark(c, 0.45); ctx.fillRect(p.x + p.w / 2, p.y + 12, 1, 24); ctx.fillRect(p.x + 8, p.y + 12, 1, 24); ctx.fillRect(p.x + p.w - 8, p.y + 12, 1, 24);
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(p.x + p.w / 2 - 12, p.y + 16, 6, 2); ctx.fillRect(p.x + p.w / 2 + 6, p.y + 16, 6, 2);
      ink(ctx, () => ctx.rect(p.x - 22, p.y + 32, 8, 6), '#D1D5DB'); ink(ctx, () => ctx.rect(p.x + p.w + 14, p.y + 32, 8, 6), '#D1D5DB');
      ink(ctx, () => ctx.rect(p.x - 20, p.y + 14, 5, 5), '#FEF9C3'); ink(ctx, () => ctx.rect(p.x + p.w + 15, p.y + 14, 5, 5), '#EF4444');
      for (const wx of [p.x, p.x + p.w - 8]) {
        ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(wx + 4, p.y + 40, 13, Math.PI, 0); ctx.fill();
        wheel(ctx, wx + 4, p.y + 40, 10);
      }
      return;
    }
    case 'palm':
      // (the frond top the iguanas sit in: the trunk's drawn with the scenery)
      return;
    case 'umbrella':
      // (drawn with the scenery)
      return;
    case 'awning': {
      const idx = rt.hazards.awningBlocks.findIndex(b => b.tag === `awning-${i}`);
      const wob = idx >= 0 ? rt.hazards.awningWobble[idx] : 0;
      const sag = wob > 0 ? Math.sin(wob * 0.6) * (wob / 24) * 8 : 0;
      // Poles (lit, inked), with springs where the canopy sits on them
      for (const px of [p.x, p.x + p.w - 4]) {
        ink(ctx, () => ctx.rect(px, p.y + 10, 4, 550 - p.y - 10), '#374151');
        ctx.fillStyle = '#6B7280'; ctx.fillRect(px + 1, p.y + 10, 1, 550 - p.y - 10);
      }
      ctx.lineWidth = 2;
      for (const sx of [p.x + 2, p.x + p.w - 2]) {
        ctx.strokeStyle = '#6B7280'; ctx.beginPath(); for (let k = 0; k < 5; k++) { ctx.moveTo(sx - 5, p.y + 13 + k * 4 + sag * 0.5); ctx.lineTo(sx + 5, p.y + 15 + k * 4 + sag * 0.5); } ctx.stroke();
        ctx.strokeStyle = '#E5E7EB'; ctx.beginPath(); for (let k = 0; k < 5; k++) { ctx.moveTo(sx - 5, p.y + 12 + k * 4 + sag * 0.5); ctx.lineTo(sx + 5, p.y + 14 + k * 4 + sag * 0.5); } ctx.stroke();
      }
      // The canopy: bold stripes with a scalloped hem, inked, shaded under, a shine along the top
      const col = p.color ?? '#F472B6';
      for (let k = 0; k < 6; k++) {
        const c = k % 2 ? '#F8FAFC' : col;
        const sx = p.x + (k * p.w) / 6;
        ink(ctx, () => { ctx.moveTo(sx, p.y + sag); ctx.lineTo(sx + p.w / 6, p.y + sag); ctx.lineTo(sx + p.w / 6, p.y + 16 + sag); ctx.quadraticCurveTo(sx + p.w / 12, p.y + 26 + sag, sx, p.y + 16 + sag); ctx.closePath(); }, c);
        ctx.fillStyle = dark(c, 0.18); ctx.fillRect(sx + 1, p.y + 12 + sag, p.w / 6 - 1, 4);
      }
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(p.x, p.y + sag, p.w, 16);
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(p.x + 3, p.y + 2 + sag, p.w - 6, 2);
      // Bouncing arrows over every one: it's for jumping on
      const hop = Math.abs(Math.sin(state.frame * 0.12 + i)) * 8;
      ctx.fillStyle = '#FDE047'; ctx.strokeStyle = '#78350F'; ctx.lineWidth = 1.5;
      for (const k of [0, 1]) {
        const ay = p.y - 22 - hop - k * 12;
        ctx.beginPath(); ctx.moveTo(p.x + p.w / 2, ay - 10); ctx.lineTo(p.x + p.w / 2 - 12, ay + 2); ctx.lineTo(p.x + p.w / 2 - 6, ay + 2); ctx.lineTo(p.x + p.w / 2, ay - 4); ctx.lineTo(p.x + p.w / 2 + 6, ay + 2); ctx.lineTo(p.x + p.w / 2 + 12, ay + 2); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      void AWNING_BOUNCE;
      return;
    }
    case 'boat':
      // (the yacht's deck: teak on top, the white gunwale under it)
      slab(ctx, p.x, p.y, p.w, 8, '#E2E8F0', 1);
      ctx.fillStyle = '#B45309'; ctx.fillRect(p.x + 1, p.y + 1, p.w - 2, 3);
      ctx.fillStyle = '#78350F'; for (let x = p.x + 12; x < p.x + p.w; x += 12) ctx.fillRect(x, p.y + 1, 1, 3);
      return;
    default:
      slab(ctx, p.x, p.y, p.w, 14, '#854D0E', 2);
      ctx.fillStyle = '#5B3A1E'; for (let x = p.x + 22; x < p.x + p.w; x += 22) ctx.fillRect(x, p.y + 2, 1, 10);
  }
};

const drawFloats = (ctx: Ctx, state: GameState, rt: HectorRuntime) => {
  rt.hazards.floatBlocks.forEach((b, i) => {
    if (!visible(state, b.x, b.x + b.w)) return;
    // Blue drums stood up under it, lashed on (banded, lit, inked), long enough to be down in the water even at the
    // top of its bob; the deck on top: planks, gaps, a nail each
    const fd = COURSE.floats[i], len = COURSE.sea.y + 10 - (fd.y - fd.amp) - 8;
    for (let x = b.x + 8; x < b.x + b.w - 18; x += 34) {
      const top = b.y + 8;
      ink(ctx, () => ctx.rect(x, top, 20, len), '#2563EB');
      ctx.fillStyle = '#60A5FA'; ctx.fillRect(x + 2, top, 3, len);
      ctx.fillStyle = '#1E40AF'; ctx.fillRect(x + 15, top, 4, len);
      for (const k of [0.3, 0.62]) {
        const hy = Math.round(top + len * k);
        ctx.fillStyle = '#1E3A8A'; ctx.fillRect(x, hy, 20, 2); ctx.fillStyle = '#93C5FD'; ctx.fillRect(x + 2, hy - 1, 3, 1);
      }
      ctx.fillStyle = '#1E3A8A'; ctx.fillRect(x - 1, top, 22, 3);
    }
    ctx.fillStyle = '#854D0E'; ctx.fillRect(b.x, b.y, b.w, 10);
    for (let x = b.x; x < b.x + b.w; x += 18) {
      ctx.fillStyle = '#A16207'; ctx.fillRect(x, b.y, 16, 8); ctx.fillStyle = '#CA8A04'; ctx.fillRect(x, b.y, 16, 2);
      ctx.fillStyle = '#44403C'; ctx.fillRect(x + 7, b.y + 4, 2, 2);
    }
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, 9);
  });
};

/** Where a shock zone's downed line goes into the water (the powerline prop's frayed end). */
const WIRE_IN = 50;

/** A jagged run of current from a to b, ends pinned, the middle thrown about (more up than down: it's on a surface). */
const boltPath = (ctx: Ctx, ax: number, ay: number, bx: number, by: number, amp: number, seed: number, segs: number, up = false) => {
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  ctx.moveTo(Math.round(ax), Math.round(ay));
  for (let i = 1; i < segs; i++) {
    const t = i / segs, env = Math.sin(t * Math.PI);
    let o = (hash(seed + i * 3.7) - 0.5) * 2 * amp * env;
    if (up) o = -Math.abs(o) * 0.8 - amp * 0.2 * env;
    ctx.lineTo(Math.round(ax + dx * t + nx * o), Math.round(ay + dy * t + ny * o));
  }
  ctx.lineTo(Math.round(bx), Math.round(by));
};
/** Stroke what's been pathed as current: a wide see-through halo, the bolt, a white core. */
const strokeBolt = (ctx: Ctx, w = 1) => {
  ctx.lineJoin = 'miter';
  ctx.strokeStyle = 'rgba(253, 224, 71, 0.3)'; ctx.lineWidth = 6 * w; ctx.stroke();
  ctx.strokeStyle = '#FDE047'; ctx.lineWidth = 2 * w; ctx.stroke();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1; ctx.stroke();
};

/** The shock zone this prop's wire is lying in, if any. */
const zoneOf = (x: number) => COURSE.shocks.find(z => x + 30 >= z.x1 && x + 30 <= z.x2);

/**
 * A snapped wooden power pole leaning over, glass insulators on its crossarm, its line sagging down off the end into
 * the water, the end of it frayed to bare copper and spitting: a fizz now and then while the water's dead, a ball of
 * sparks while it's live.
 */
const drawPowerline = (ctx: Ctx, state: GameState, p: Prop) => {
  const f = state.frame, z = zoneOf(p.x);
  const ph = z ? shockPhase(z, f) : { live: f % 40 < 20, warning: false };
  ctx.save();
  // The stump it snapped off, splintered
  ctx.fillStyle = '#4A3520'; ctx.fillRect(p.x - 7, p.y - 26, 14, 26);
  ctx.fillStyle = '#6B4F2E'; ctx.fillRect(p.x - 7, p.y - 26, 5, 26);
  ctx.fillStyle = '#8B6B42';
  ctx.beginPath(); ctx.moveTo(p.x - 7, p.y - 26); ctx.lineTo(p.x - 4, p.y - 36); ctx.lineTo(p.x, p.y - 28); ctx.lineTo(p.x + 3, p.y - 34); ctx.lineTo(p.x + 7, p.y - 26); ctx.closePath(); ctx.fill();
  // The pole, leaning on what's left of the stump: lit side, wood, shaded side, a few grain lines
  ctx.translate(p.x, p.y - 24); ctx.rotate(-0.25);
  ctx.fillStyle = '#5C4329'; ctx.fillRect(-6, -200, 12, 196);
  ctx.fillStyle = '#7A5A36'; ctx.fillRect(-6, -200, 4, 196);
  ctx.fillStyle = '#3F2E1B'; ctx.fillRect(4, -200, 2, 196);
  ctx.fillStyle = '#4A3520'; for (let k = 0; k < 6; k++) ctx.fillRect(-2 + (k % 2) * 3, -190 + k * 31, 1, 12);
  // (the climbing spikes)
  ctx.fillStyle = '#6B7280'; for (let k = 0; k < 5; k++) ctx.fillRect(k % 2 ? 6 : -9, -150 + k * 24, 3, 2);
  // The crossarm and its insulators
  ctx.fillStyle = '#5C4329'; ctx.fillRect(-32, -192, 64, 7);
  ctx.fillStyle = '#7A5A36'; ctx.fillRect(-32, -192, 64, 2);
  for (const ix of [-28, -12, 12, 28]) {
    ctx.fillStyle = '#5EEAD4'; ctx.fillRect(ix - 3, -200, 6, 8);
    ctx.fillStyle = '#99F6E4'; ctx.fillRect(ix - 3, -200, 2, 8);
    ctx.fillStyle = '#0F766E'; ctx.fillRect(ix - 3, -194, 6, 2);
  }
  // (where the line came off it: an empty insulator, and a stub of wire still on the next)
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(12, -200); ctx.quadraticCurveTo(20, -214, 30, -206); ctx.stroke();
  // Where the downed line hangs from (the crossarm's far end), in the world
  const m = ctx.getTransform();
  ctx.restore();
  const inv = ctx.getTransform().inverse();
  const pt = new DOMPoint(-28, -200).matrixTransform(m);
  const hang = pt.matrixTransform(inv);
  const ex = p.x + 30, ey = p.y - 2;
  // The line: sagging, thick, a glint along it, swaying a touch in the storm
  const sway = Math.sin(f * 0.05) * 6;
  const mx = (hang.x + ex) / 2 + 30 + sway, my = (hang.y + ey) / 2 + 50;
  ctx.beginPath(); ctx.moveTo(hang.x, hang.y); ctx.quadraticCurveTo(mx, my, ex - 4, ey - 4);
  ctx.strokeStyle = '#0B0F19'; ctx.lineWidth = 4; ctx.stroke();
  ctx.strokeStyle = '#374151'; ctx.lineWidth = 1; ctx.stroke();
  // Its end, frayed to bare copper
  ctx.fillStyle = '#0B0F19'; ctx.fillRect(ex - 7, ey - 7, 6, 5);
  ctx.fillStyle = '#D97706';
  ctx.fillRect(ex - 2, ey - 8, 4, 1); ctx.fillRect(ex - 1, ey - 6, 5, 1); ctx.fillRect(ex - 2, ey - 4, 3, 1); ctx.fillRect(ex + 1, ey - 10, 1, 3);
  ctx.fillStyle = '#FBBF24'; ctx.fillRect(ex + 2, ey - 6, 2, 1);
  // Spitting: a ball of sparks while it's live, a fizz now and then while it isn't (more of one when it's about to go)
  const fizz = ph.live || (ph.warning ? f % 6 < 3 : f % 37 < 4);
  if (fizz) {
    const step = Math.floor(f / 2), n = ph.live ? 5 : 2, reach = ph.live ? 22 : 10;
    ctx.beginPath();
    for (let k = 0; k < n; k++) {
      const a = -Math.PI * (0.1 + hash(step * 3 + k) * 0.8);
      boltPath(ctx, ex, ey - 5, ex + Math.cos(a) * reach * (0.6 + hash(step + k * 7) * 0.6), ey - 5 + Math.sin(a) * reach, 4, step * 11 + k * 5, 3);
    }
    strokeBolt(ctx, ph.live ? 1 : 0.6);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(ex - 2, ey - 7, 5, 5);
    for (let k = 0; k < (ph.live ? 6 : 2); k++) {
      const life = (f + k * 4) % 14, a = -Math.PI * hash(k * 9 + Math.floor((f + k * 4) / 14));
      ctx.fillStyle = life < 5 ? '#FFFFFF' : '#FDE047';
      ctx.fillRect(Math.round(ex + Math.cos(a) * life * 2.5), Math.round(ey - 5 + Math.sin(a) * life * 2.5 + life * life * 0.1), 2, 2);
    }
  }
};

/**
 * The flooded ground the line's lying in. Dead: murky standing water, ripples going across it. Live: the water lights
 * up (a banded glow coming up off it), current crawling along the surface out from where the wire's in, forks jumping
 * up off it, sparks. About to go live: it fizzes round the wire and the warning flashes.
 */
const drawShocks = (ctx: Ctx, state: GameState) => {
  const f = state.frame;
  for (const z of COURSE.shocks) {
    if (!visible(state, z.x1, z.x2)) continue;
    const { live, warning } = shockPhase(z, f);
    const w = z.x2 - z.x1, src = z.x1 + WIRE_IN, y = z.y;
    // The water: stepped bands, a lighter skin on top
    if (live) {
      const hot = f % 4 < 2;
      ctx.fillStyle = 'rgba(253, 224, 71, 0.10)'; ctx.fillRect(z.x1, y - 22, w, 10);
      ctx.fillStyle = 'rgba(253, 224, 71, 0.18)'; ctx.fillRect(z.x1, y - 12, w, 6);
      ctx.fillStyle = 'rgba(254, 240, 138, 0.28)'; ctx.fillRect(z.x1, y - 6, w, 3);
      ctx.fillStyle = hot ? '#FEF08A' : '#FACC15'; ctx.fillRect(z.x1, y - 3, w, 6);
      ctx.fillStyle = hot ? '#FFFFFF' : '#FEF9C3'; ctx.fillRect(z.x1, y - 3, w, 1);
    } else {
      ctx.fillStyle = 'rgba(30, 64, 90, 0.75)'; ctx.fillRect(z.x1, y - 3, w, 6);
      ctx.fillStyle = 'rgba(56, 120, 160, 0.8)'; ctx.fillRect(z.x1, y - 3, w, 2);
      ctx.fillStyle = 'rgba(186, 230, 253, 0.7)';
      for (let k = 0; k < Math.floor(w / 50); k++) {
        const x = z.x1 + ((k * 53 + f * (0.3 + (k % 3) * 0.15)) % w);
        ctx.fillRect(Math.round(x), y - 3, 6 + (k % 3) * 3, 1);
      }
    }
    if (live) {
      // Current crawling along the surface, in runs out from the wire both ways, and some loose further out
      const step = Math.floor(f / 2);
      ctx.beginPath();
      for (let k = 0; k < Math.ceil(w / 90); k++) {
        const a = z.x1 + hash(step * 5 + k) * (w - 60), b = Math.min(z.x2, a + 50 + hash(step * 7 + k) * 90);
        boltPath(ctx, a, y - 2, b, y - 2, 7, step * 13 + k * 29, 7, true);
      }
      for (const dir of [-1, 1]) {
        const end = Math.max(z.x1, Math.min(z.x2, src + dir * (80 + hash(step + dir) * 100)));
        boltPath(ctx, src, y - 3, end, y - 2, 9, step * 17 + dir * 41, 9, true);
      }
      strokeBolt(ctx);
      // Forks jumping up off it
      ctx.beginPath();
      for (let k = 0; k < 3; k++) {
        const x = z.x1 + hash(step * 3 + k * 11) * w, h = 14 + hash(step + k * 5) * 22;
        boltPath(ctx, x, y - 2, x + (hash(step + k) - 0.5) * 16, y - 2 - h, 5, step * 19 + k * 7, 4);
      }
      strokeBolt(ctx, 0.7);
      // Sparks
      for (let k = 0; k < Math.ceil(w / 60); k++) {
        const life = (f + k * 5) % 12, x = z.x1 + hash(k * 13 + Math.floor((f + k * 5) / 12)) * w;
        ctx.fillStyle = life < 4 ? '#FFFFFF' : '#FDE047';
        ctx.fillRect(Math.round(x + (k % 2 ? 1 : -1) * life), Math.round(y - 4 - life * 2.2 + life * life * 0.12), 2, 2);
      }
    } else if (warning) {
      // Fizzing round the wire, a little further out each time
      const step = Math.floor(f / 2);
      if (f % 4 < 2) {
        ctx.beginPath();
        for (const dir of [-1, 1]) boltPath(ctx, src, y - 3, src + dir * (20 + hash(step + dir) * 40), y - 2, 4, step * 23 + dir, 5, true);
        strokeBolt(ctx, 0.6);
      }
      if (Math.floor(f / 4) % 2 === 0) {
        ctx.fillStyle = '#FDE047'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText('! LIVE WIRE !', (z.x1 + z.x2) / 2, y - 30); ctx.textAlign = 'left';
      }
    }
  }
};

/** Junk in the wind: a folding beach chair, a beach umbrella, a trash can, a cooler. */
export const drawDebris = (ctx: Ctx, x: number, y: number, rot: number, look: string, size: number) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const s = size / 2;
  switch (look) {
    case 'chair':
      // (aluminum frame, inked; the webbing in stripes)
      ctx.lineCap = 'round';
      ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-s, s); ctx.lineTo(s * 0.4, -s); ctx.moveTo(-s * 0.2, s); ctx.lineTo(s, -s * 0.2); ctx.stroke();
      ctx.strokeStyle = '#D1D5DB'; ctx.lineWidth = 3; ctx.stroke();
      ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 1; ctx.stroke();
      ctx.lineCap = 'butt';
      ink(ctx, () => ctx.rect(-s * 0.7, -s * 0.5, s * 1.2, s * 0.8), '#F43F5E');
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-s * 0.7, -s * 0.2, s * 1.2, s * 0.2);
      ctx.fillStyle = '#BE123C'; ctx.fillRect(-s * 0.7, s * 0.2, s * 1.2, s * 0.1);
      ctx.fillStyle = '#FDA4AF'; ctx.fillRect(-s * 0.7, -s * 0.5, s * 1.2, 1);
      break;
    case 'umbrella': {
      ink(ctx, () => ctx.rect(-1.5, -s, 3, s * 2), '#E5E7EB');
      const can = () => { ctx.moveTo(-s, -s * 0.2); ctx.quadraticCurveTo(0, -s * 1.3, s, -s * 0.2); ctx.closePath(); };
      ctx.save(); ctx.beginPath(); can(); ctx.clip();
      ctx.fillStyle = '#22D3EE'; ctx.fillRect(-s, -s * 1.3, s * 2, s * 1.2);
      ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(-s * 0.3, -s * 0.2); ctx.quadraticCurveTo(0, -s * 1.1, s * 0.3, -s * 0.2); ctx.fill();
      ctx.fillStyle = 'rgba(26, 11, 6, 0.2)'; ctx.fillRect(s * 0.4, -s * 1.3, s, s * 1.2);
      ctx.restore();
      ctx.beginPath(); can(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
      break;
    }
    case 'trashcan':
      // (galvanized: ribbed, lit down the left, its lid knocked askew)
      ink(ctx, () => ctx.rect(-s * 0.7, -s, s * 1.4, s * 2), '#6B7280');
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-s * 0.7 + 1, -s, s * 0.4, s * 2);
      ctx.fillStyle = '#374151'; ctx.fillRect(s * 0.4, -s, s * 0.3 - 1, s * 2);
      for (let i = -1; i <= 1; i++) { ctx.fillStyle = '#374151'; ctx.fillRect(-s * 0.7, i * s * 0.5 - 1, s * 1.4, 2); ctx.fillStyle = '#D1D5DB'; ctx.fillRect(-s * 0.7, i * s * 0.5 - 2, s * 1.4, 1); }
      ink(ctx, () => ctx.rect(-s * 0.85, -s - 4, s * 1.7, 4), '#9CA3AF');
      ink(ctx, () => ctx.rect(-3, -s - 7, 6, 3), '#6B7280');
      break;
    default:
      // (a cooler: blue tub, white lid, its handle)
      ink(ctx, () => ctx.rect(-s, -s * 0.6, s * 2, s * 1.2), '#2563EB');
      ctx.fillStyle = '#60A5FA'; ctx.fillRect(-s + 1, -s * 0.6 + 6, 3, s * 1.2 - 7);
      ctx.fillStyle = '#1E40AF'; ctx.fillRect(s - 4, -s * 0.6 + 6, 3, s * 1.2 - 7); ctx.fillRect(-s + 1, s * 0.6 - 3, s * 2 - 2, 2);
      ink(ctx, () => ctx.rect(-s, -s * 0.6, s * 2, 5), '#F8FAFC');
      ink(ctx, () => ctx.rect(-s * 0.3, -s * 0.6 - 4, s * 0.6, 3), '#D1D5DB');
      ctx.fillStyle = '#1E40AF'; ctx.fillRect(-s * 0.4, -2, s * 0.8, 3);
  }
  ctx.restore();
};

/**
 * The cruiser the cops pull up in: a black-and-white, inked, its hood out front to the left, push bar, a star on the
 * door, POLICE down the side, glass with a glint, a light bar that takes turns red and blue (dark once it's raining
 * or they're all dead).
 */
const drawPoliceCruiser = (ctx: Ctx, state: GameState, rt: HectorRuntime) => {
  const b = rt.beach;
  if (b.police !== 'coming' && b.police !== 'fight' && b.police !== 'done') return;
  if (!b.cruiserX) return;
  const x = b.cruiserX, y = 550;
  // The cabin: white roof, the glass, the pillars
  ink(ctx, () => { ctx.moveTo(x - 40, y - 40); ctx.lineTo(x - 26, y - 62); ctx.lineTo(x + 40, y - 62); ctx.lineTo(x + 56, y - 40); ctx.closePath(); }, '#F8FAFC');
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - 25, y - 61, 64, 2);
  for (const [wx, ww] of [[x - 22, 28], [x + 10, 26]]) {
    ctx.fillStyle = '#1E3A5F'; ctx.fillRect(wx, y - 58, ww, 16);
    ctx.fillStyle = '#93C5FD'; ctx.fillRect(wx, y - 58, ww, 8);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; ctx.fillRect(wx + 5, y - 58, 3, 16); ctx.fillRect(wx + 10, y - 58, 1, 16);
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(wx + 0.5, y - 57.5, ww - 1, 15);
  }
  // The body: white over black, lit along its top, the doors' seams, chrome bumpers, a push bar on the nose
  slab(ctx, x - 70, y - 40, 150, 26, '#F8FAFC', 2);
  ctx.fillStyle = '#111827'; ctx.fillRect(x - 69, y - 26, 148, 11);
  ctx.fillStyle = '#374151'; ctx.fillRect(x - 69, y - 26, 148, 1);
  ctx.fillStyle = '#94A3B8'; ctx.fillRect(x - 6, y - 39, 1, 24); ctx.fillRect(x + 36, y - 39, 1, 24); ctx.fillRect(x - 40, y - 39, 1, 13);
  ink(ctx, () => ctx.rect(x - 74, y - 24, 6, 8), '#D1D5DB');
  ink(ctx, () => ctx.rect(x + 78, y - 24, 5, 8), '#D1D5DB');
  ink(ctx, () => { ctx.rect(x - 80, y - 36, 4, 20); ctx.rect(x - 80, y - 32, 10, 3); ctx.rect(x - 80, y - 22, 10, 3); }, '#1F2937');
  ink(ctx, () => ctx.rect(x - 70, y - 37, 5, 5), '#FEF9C3'); ink(ctx, () => ctx.rect(x + 75, y - 37, 5, 5), '#EF4444');
  // (the star on the door, POLICE along the side)
  ctx.fillStyle = '#CA8A04'; ctx.beginPath();
  for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 2.5 : 6; ctx.lineTo(x + 16 + Math.cos(a) * r, y - 33 + Math.sin(a) * r); }
  ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#FDE047'; ctx.fillRect(x + 15, y - 35, 2, 2);
  ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'left';
  ctx.fillStyle = '#93C5FD'; ctx.fillText('POLICE', x - 35, y - 17);
  ctx.fillStyle = '#F8FAFC'; ctx.fillText('POLICE', x - 36, y - 18);
  // (the light bar goes dark once it's raining, or once the cops are all dead)
  const lit = b.storm <= 0 && b.police !== 'done';
  const blink = lit && Math.floor(state.frame / 6) % 2;
  ink(ctx, () => ctx.rect(x - 9, y - 64, 28, 3), '#111827');
  const left = !lit ? '#7F1D1D' : blink ? '#EF4444' : '#3B82F6', right = !lit ? '#1E3A8A' : blink ? '#3B82F6' : '#EF4444';
  if (lit) steppedGlow(ctx, blink ? x - 1 : x + 11, y - 66, 26, blink ? '#EF4444' : '#3B82F6', 0.35, 0.05, 3);
  for (const [lx, c] of [[x - 6, left], [x + 6, right]] as const) {
    ink(ctx, () => ctx.rect(lx, y - 70, 10, 8), c);
    ctx.fillStyle = lite(c, lit ? 0.5 : 0.2); ctx.fillRect(lx + 1, y - 69, 4, 2);
  }
  // The wheels: arches inked black, tires, hubcaps
  for (const wx of [x - 44, x + 50]) {
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(wx, y - 10, 14, Math.PI, 0); ctx.fill();
    wheel(ctx, wx, y - 10, 11, '#6B7280');
  }
  if (blink) { ctx.fillStyle = 'rgba(239, 68, 68, 0.15)'; ctx.fillRect(state.camera.x, state.camera.y, CANVAS_WIDTH, CANVAS_HEIGHT); }
};

// ---------------------------------------------------------------------------
// The storm tower's eye wall (drawn flat; the renderer wraps it round)
// ---------------------------------------------------------------------------

const drawEyeWall = (ctx: Ctx, state: GameState, riseY: number) => {
  const x0 = state.camera.x - 600, x1 = state.camera.x + CANVAS_WIDTH + 600;
  const f = state.frame;
  // The cloud of the wall turning round, scud dragged over it, lightning in it
  drawStormWall(ctx, state, riseY);
  // The floor of the storm: a churning ring of water at the bottom
  if (state.camera.y + CANVAS_HEIGHT > TOWER.floorY - 20) {
    bandedGradient(ctx, x0, TOWER.floorY, x1 - x0, 200, ['#2C5378', '#1E3A5F', '#152B47', '#0B1A30'], 6);
    for (let x = Math.floor(x0 / 30) * 30; x < x1; x += 30) {
      const fx = x + ((f * 3) % 30), fy = Math.round(TOWER.floorY + Math.sin(x * 0.1 + f * 0.2) * 3);
      ctx.fillStyle = '#7DD3FC'; ctx.fillRect(fx - 2, fy + 3, 20, 2);
      ctx.fillStyle = '#E0F2FE'; ctx.fillRect(fx, fy, 16, 3);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(fx + 4, fy, 6, 1);
    }
  }
};

void clamp01;
