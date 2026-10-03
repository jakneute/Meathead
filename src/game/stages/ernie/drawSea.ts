// Drawing the bay and the island: the view across the water (Alcatraz getting
// bigger the further you get), the pier, the hipster, the water, the jet ski
// under Meathead (wheelies, leaps and dives), the floating wreckage, the ramp;
// then the cell house, the tour, the ski coming down through the skylight, and
// what's left afterwards.

import type { GameState } from '../../core/state';
import { bandedGradient, checker, hazeBands, pixelBlob, steppedGlow } from '../../render/pixelArt';
import { drawFire } from '../../render/fx/fire';
import type { ErnieRuntime } from './runtime';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../constants';
import { STAGE_BACKDROPS } from '../../render/backdrops/stages';
import { blitLayer } from '../../render/backdrops/core';
import type { LayerSpec } from '../../render/backdrops/core';
import type { Live } from '../../render/backdrops';
import { drawPlayer } from '../../render/player/player';
import { COURSE } from './course';
import { rideProgress, RIDE_FRAMES, wreckBox, FloatingWreck, JetSki } from './jetski';
import { TOURISTS, FADE_IN, DROP_AT, IMPACT_AT, skiDrop, tourWrecked, tourLaughing } from './alcatraz';
import { drawAlcatraz, bubble } from './draw';
import { drawPerson } from '../../render/npc/person';
import type { PersonSpec, Pose } from '../../render/npc/person';
import { INK, ink, limb, shaded, shadedTop, dark, lite } from '../../render/npc/kit';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 250 && x1 < state.camera.x + CANVAS_WIDTH + 250;
const Y = GROUND_Y;

const LAYERS = STAGE_BACKDROPS['Ernie Earthquake'].layers;
const layer = (ctx: Ctx, state: GameState, i: number) => {
  const l = LAYERS[i];
  if (typeof l === 'function') { ctx.save(); (l as Live)(ctx, { camX: state.camera.x, camY: state.camera.y, frame: state.frame }); ctx.restore(); }
  else blitLayer(ctx, l as LayerSpec, state.camera.x, state.camera.y, state.frame);
};

// ---------------------------------------------------------------------------
// The bay
// ---------------------------------------------------------------------------

/** Across the water: the sunset, the bridge back behind you, the city, and the island out ahead getting bigger. */
export const drawBayBackdrop = (ctx: Ctx, state: GameState, rt: ErnieRuntime) => {
  layer(ctx, state, 0);
  // (no bridge back here: out on the water it's just the far shore, the bay, and the island ahead)
  const W = CANVAS_WIDTH, horizon = 412, f = state.frame;
  const drift = state.camera.x * 0.02;
  const ridge = (x: number) => horizon - 18 - 22 * Math.sin((x + drift) * 0.006) - 10 * Math.sin((x + drift) * 0.021) - hash(Math.floor((x + drift) / 16)) * 4;
  ctx.fillStyle = '#4B3D5A';
  ctx.beginPath(); ctx.moveTo(0, horizon);
  for (let x = 0; x <= W + 20; x += 16) ctx.lineTo(x, ridge(x));
  ctx.lineTo(W + 20, horizon); ctx.fill();
  // (the far shore lit along its crest by the sunset, fading into the haze down by the water)
  for (let x = 0; x < W; x += 16) {
    const y0 = ridge(x), y1 = ridge(x + 16);
    ctx.strokeStyle = '#7A4E6A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y0 + 1); ctx.lineTo(x + 16, y1 + 1); ctx.stroke();
  }
  hazeBands(ctx, 0, horizon - 30, W, 30, '#B4436C', 0, 0.35, 4);
  bandedGradient(ctx, 0, horizon, W, CANVAS_HEIGHT - horizon, ['#6C5B7B', '#3B5B80', '#35526F', '#2E4A66', '#294461'], 10);
  ctx.fillStyle = 'rgba(246, 194, 122, 0.4)';
  for (let i = 0; i < 26; i++) { const x = ((hash(i) * W - state.camera.x * 0.1 + f * 0.1) % W + W) % W, y = horizon + 4 + hash(i + 3) * 60; ctx.fillRect(x, y, 8 + hash(i + 5) * 26, 1); }
  layer(ctx, state, 2);
  const k = rideProgress(rt.ski);
  // The rock: a speck off to the right at first, then filling the view ahead
  const s = 0.45 + k * k * 1.9;
  drawAlcatraz(ctx, CANVAS_WIDTH * (0.82 - k * 0.2), horizon, s, state.frame);
  layer(ctx, state, 3);
};

export const drawSeaBack = (ctx: Ctx, state: GameState, rt: ErnieRuntime) => {
  const B = COURSE.bay;
  const x1 = state.camera.x - 20, x2 = state.camera.x + CANVAS_WIDTH + 20;
  // The water, all the way down
  ctx.fillStyle = '#0F2640'; ctx.fillRect(x1, Y - 2, x2 - x1, state.camera.y + CANVAS_HEIGHT + 40 - Y);
  bandedGradient(ctx, x1, Y - 2, x2 - x1, 400, ['#2F5C85', '#274C70', '#1E3B5A', '#163049', '#0F2640'], 10);
  // Streaks on the water (fixed in the world, so they rush past when he's flying along): lit swell, its trough under it
  for (let x = Math.floor(x1 / 90) * 90; x < x2; x += 90) {
    const y = Math.round(Y + 14 + hash(x) * 120), sx = Math.round(x + hash(x + 1) * 40), w = Math.round(24 + hash(x + 2) * 30);
    ctx.fillStyle = 'rgba(224, 242, 254, 0.35)'; ctx.fillRect(sx, y, w, 2);
    ctx.fillStyle = 'rgba(10, 24, 44, 0.35)'; ctx.fillRect(sx + 4, y + 2, w - 8, 2);
  }
  // The pier
  if (visible(state, B.x1, B.pier)) drawPier(ctx, state);
  void rt;
};

const drawPier = (ctx: Ctx, state: GameState) => {
  const B = COURSE.bay;
  const top = Y - 50;
  // Pilings down into the water: round timbers lit down the left, weed and barnacles at the waterline
  for (let x = B.x1 + 20; x < B.pier; x += 70) {
    ctx.fillStyle = INK; ctx.fillRect(x - 1, top, 14, Y + 120 - top);
    ctx.fillStyle = '#4A3222'; ctx.fillRect(x, top, 12, Y + 120 - top);
    ctx.fillStyle = '#6B4A30'; ctx.fillRect(x, top, 4, Y + 120 - top);
    ctx.fillStyle = '#33221A'; ctx.fillRect(x + 9, top, 3, Y + 120 - top);
    ctx.fillStyle = '#3F5A2A'; ctx.fillRect(x, Y - 4, 12, 8); checker(ctx, x, Y + 4, 12, 6, '#3F5A2A');
    ctx.fillStyle = '#D6D3D1'; ctx.fillRect(x + 2, Y - 2, 2, 2); ctx.fillRect(x + 7, Y + 1, 2, 2);
  }
  ctx.fillStyle = 'rgba(15, 38, 64, 0.5)'; ctx.fillRect(B.x1, Y, B.pier - B.x1, 120);
  checker(ctx, B.x1, Y - 2, B.pier - B.x1, 2, 'rgba(224, 242, 254, 0.4)');
  // The planks: lit along the top, the grain, their ends, the stringer under them
  ctx.fillStyle = INK; ctx.fillRect(B.x1, top - 1, B.pier - B.x1, 14);
  ctx.fillStyle = '#8A6A45'; ctx.fillRect(B.x1, top, B.pier - B.x1, 12);
  ctx.fillStyle = '#A8845A'; ctx.fillRect(B.x1, top, B.pier - B.x1, 2);
  ctx.fillStyle = '#C4A070'; ctx.fillRect(B.x1, top, B.pier - B.x1, 1);
  ctx.fillStyle = '#6E5236'; ctx.fillRect(B.x1, top + 9, B.pier - B.x1, 3);
  ctx.fillStyle = '#5E4630'; for (let x = B.x1; x < B.pier; x += 16) ctx.fillRect(x, top, 2, 12);
  ctx.fillStyle = '#76593A'; for (let x = B.x1; x < B.pier; x += 16) { ctx.fillRect(x + 5, top + 4 + (x / 16) % 3, 6, 1); }
  ctx.fillStyle = '#3A2A1C'; ctx.fillRect(B.x1, top + 12, B.pier - B.x1, 6); checker(ctx, B.x1, top + 18, B.pier - B.x1, 2, '#3A2A1C');
  // A sign, a bollard with a rope, lifebuoy
  ctx.fillStyle = INK; ctx.fillRect(B.x1 + 119, top - 90, 8, 90);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(B.x1 + 120, top - 90, 6, 90); ctx.fillStyle = '#CBD5E1'; ctx.fillRect(B.x1 + 124, top - 90, 2, 90);
  ctx.fillStyle = INK; ctx.fillRect(B.x1 + 69, top - 125, 112, 52);
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(B.x1 + 70, top - 124, 110, 50);
  ctx.fillStyle = '#3B5BB0'; ctx.fillRect(B.x1 + 70, top - 124, 110, 2); ctx.fillStyle = '#172C6A'; ctx.fillRect(B.x1 + 70, top - 76, 110, 2);
  ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 1; ctx.strokeRect(B.x1 + 72.5, top - 121.5, 105, 45);
  ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillText('SAUSALITO', B.x1 + 125, top - 110); ctx.fillText('JET SKI RENTAL', B.x1 + 125, top - 98);
  // (a red placard hung across the bottom of the sign)
  ctx.fillStyle = INK; ctx.fillRect(B.x1 + 93, top - 95, 64, 16);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(B.x1 + 94, top - 94, 62, 14);
  ctx.fillStyle = '#CBD5E1'; ctx.fillRect(B.x1 + 94, top - 82, 62, 2);
  ctx.fillStyle = '#DC2626'; ctx.fillText('CLOSED', B.x1 + 125, top - 83);
  ctx.textAlign = 'left';
  // (the bollard: an iron post with a cap, a turn of rope round it)
  ctx.fillStyle = INK; ctx.fillRect(B.pier - 31, top - 17, 14, 17); ctx.fillRect(B.pier - 33, top - 19, 18, 5);
  ctx.fillStyle = '#27272A'; ctx.fillRect(B.pier - 30, top - 16, 12, 16); ctx.fillRect(B.pier - 32, top - 18, 16, 3);
  ctx.fillStyle = '#52525B'; ctx.fillRect(B.pier - 30, top - 16, 3, 16); ctx.fillRect(B.pier - 32, top - 18, 16, 1);
  ctx.fillStyle = '#D6B98A'; ctx.fillRect(B.pier - 30, top - 9, 12, 3); ctx.fillStyle = '#A8865A'; ctx.fillRect(B.pier - 30, top - 7, 12, 1);
  // The lifebuoy, hung on its post on the pier (a hook at the top, the ring hanging off it)
  const lx = B.x1 + 300;
  ctx.fillStyle = INK; ctx.fillRect(lx - 4, top - 77, 8, 77);
  ctx.fillStyle = '#5E4630'; ctx.fillRect(lx - 3, top - 74, 6, 74); ctx.fillStyle = '#7A5C3E'; ctx.fillRect(lx - 3, top - 74, 2, 74);
  ctx.fillStyle = '#44403C'; ctx.fillRect(lx - 3, top - 76, 6, 3);
  ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx, top - 62); ctx.lineTo(lx, top - 56); ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(lx, top - 40, 14, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#F97316'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(lx, top - 40, 14, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 6;
  for (const a of [0.25, 1.82, 3.39, 4.96]) { ctx.beginPath(); ctx.arc(lx, top - 40, 14, a, a + 0.35); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(lx, top - 40, 15, Math.PI * 1.05, Math.PI * 1.45); ctx.stroke();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(lx, top - 40, 13, Math.PI * 0.05, Math.PI * 0.5); ctx.stroke();
  void state;
};

export const drawSeaMid = (ctx: Ctx, state: GameState, rt: ErnieRuntime) => {
  const js = rt.ski;
  // The hipster (and, till it's taken, his ski)
  drawHipster(ctx, state, js);
  for (const w of js.wrecks) if (visible(state, w.x - 60, w.x + 60)) drawWreck(ctx, w, state.frame);
  if (js.rampX && visible(state, js.rampX - 100, js.rampX + 200)) drawRamp(ctx, js.rampX, state.frame);
  // The one who went off the ramp after him
  const c = js.chaser;
  if (c.state === 'riding' || c.state === 'flying') drawHipsterOnSki(ctx, c.x, c.y, c.rot, state.frame);
  // Meathead's ride
  const p = state.player;
  if (p.jetski && !p.hidden && state.deathTimer <= 0) drawRide(ctx, state);
};

const drawHipster = (ctx: Ctx, state: GameState, js: JetSki) => {
  const h = js.hipster;
  const B = COURSE.bay;
  // His ski, bobbing at the end of the pier till Meathead's on it
  if (!state.player.jetski && js.phase !== 'gone' && visible(state, B.ski - 60, B.ski + 60)) {
    ctx.save(); ctx.translate(B.ski, Y + Math.sin(state.frame * 0.1) * 2); drawSki(ctx, 0); ctx.restore();
  }
  if (!visible(state, h.x - 60, h.x + 60)) return;
  ctx.save();
  ctx.translate(h.x, h.y);
  if (h.state === 'flying') ctx.rotate(h.rot);
  if (h.state === 'swimming') {
    // Just his head above the water (the glasses, the bun, yelling) and a flailing arm
    ctx.translate(0, Math.sin(state.frame * 0.15) * 2);
    const a = -1.2 + Math.sin(state.frame * 0.3) * 0.6, ax = 9 + Math.cos(a) * 16, ay = 2 + Math.sin(a) * 16;
    limb(ctx, 9, 4, ax, ay, 5.5, HIPSTER.top.color);
    ink(ctx, () => ctx.arc(ax, ay, 3.4, 0, Math.PI * 2), HIPSTER.skin, 0.8);
    ctx.save(); ctx.beginPath(); ctx.rect(-30, -40, 60, 43); ctx.clip();
    hipsterFigure(ctx, 58, { mouth: 'open', f: state.frame });
    ctx.restore();
    ctx.restore();
    return;
  }
  drawHipsterBody(ctx, h.state === 'sitting', h.state === 'flying' ? 'flung' : h.lineT > 0 ? 'talking' : 'sat', state.frame);
  ctx.restore();
};

/** The hipster: skinny jeans, flannel, the beard, the man bun. */
const HIPSTER: PersonSpec = {
  skin: '#E0AC69', hair: { style: 'bun', color: '#4A2F1D' }, face: 'beard', eyes: 'glasses', build: 'slim',
  top: { style: 'flannel', color: '#991B1B' }, legs: { color: '#1E3A8A' }, shoes: '#78350F',
};

/** His kombucha: a brown bottle, the label, the cap. */
const kombucha = (ctx: Ctx, hx: number, hy: number) => {
  ink(ctx, () => ctx.roundRect(hx - 2, hy - 11, 6, 12, 2), '#B45309', 0.8);
  ink(ctx, () => ctx.rect(hx - 0.5, hy - 15, 3, 4), '#B45309', 0.7);
  ctx.fillStyle = '#F5F5F4'; ctx.fillRect(hx - 1.6, hy - 8, 5.2, 4);
  ctx.fillStyle = '#16A34A'; ctx.fillRect(hx - 0.6, hy - 7, 3, 2);
  ctx.fillStyle = '#FCD34D'; ctx.fillRect(hx - 1, hy - 10, 1, 7);
  ink(ctx, () => ctx.rect(hx - 1, hy - 16.5, 4, 1.8), '#1C1917', 0.5);
};

/** Him, feet at (0, y): the townsfolk figure, then the big thick-rimmed glasses over the little ones. */
const hipsterFigure = (ctx: Ctx, y: number, pose: Pose) => {
  drawPerson(ctx, 0, y, HIPSTER, pose);
  const ey = y - 63;
  ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(-0.6, ey - 2.8, 5, 4.6, 1); ctx.roundRect(4.9, ey - 2.8, 5, 4.6, 1); ctx.stroke();
};

/** The hipster (his feet at 0, 0; sat, on a seat at -24): kombucha in hand, or flung, or yelling, or laid out. */
const drawHipsterBody = (ctx: Ctx, sit: boolean, mood: 'sat' | 'talking' | 'flung' | 'yelling' | 'dead' = 'sat', f = 0) => {
  hipsterFigure(ctx, sit ? -1 : 0, {
    seated: sit, f,
    arms: mood === 'flung' || mood === 'dead' ? 'up' : 'hold',
    mouth: mood === 'sat' ? 'flat' : mood === 'talking' ? 'talk' : mood === 'dead' ? 'o' : 'open',
    prop: mood === 'dead' ? undefined : kombucha,
  });
};

/**
 * The hipster on his standby jet ski (it's also vintage), coming after Meathead: its keel at (x, y), tipped by rot.
 * Charred, after he's come down on the night tour.
 */
export const drawHipsterOnSki = (ctx: Ctx, x: number, y: number, rot: number, f: number, charred = false) => {
  ctx.save();
  // (turning about his middle, not the keel: tumbling end over end off the ramp he goes round his own center)
  ctx.translate(x, y - 30); ctx.rotate(rot); ctx.translate(0, 30);
  if (charred) ctx.filter = 'brightness(0.18)';
  drawSki(ctx, f, '#F59E0B');
  drawHipsterBody(ctx, true, charred ? 'yelling' : 'talking', f);
  ctx.restore();
};

/**
 * The hipster and his ski coming down nose first, spinning like a top (round and round about the up-and-down, so he
 * narrows and widens and flips as he turns): a drill bit, his middle at (x, y). The spiral of the bore round him.
 */
export const drawHipsterDrilling = (ctx: Ctx, x: number, y: number, f: number) => {
  const spin = f * 0.9;
  ctx.save();
  ctx.translate(x, y);
  // The bore: spiral bands of churned dirt whipping round him
  for (let k = 0; k < 4; k++) {
    const ph = spin + k * 1.6;
    ctx.beginPath(); ctx.ellipse(0, -40 + k * 26, 30 + k * 4, 7, 0, ph % (Math.PI * 2), ph % (Math.PI * 2) + Math.PI * 0.9);
    ctx.strokeStyle = 'rgba(74, 52, 40, 0.8)'; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = 'rgba(156, 120, 84, 0.8)'; ctx.lineWidth = 2; ctx.stroke();
  }
  ctx.save();
  ctx.scale(Math.cos(spin) || 0.05, 1);
  ctx.rotate(Math.PI / 2);
  ctx.translate(0, 30);
  drawSki(ctx, f, '#F59E0B');
  drawHipsterBody(ctx, true, 'yelling', f);
  ctx.restore();
  // Sparks off the tip where it's grinding through
  ctx.fillStyle = '#FDE047';
  for (let k = 0; k < 5; k++) { const a = spin * 2 + k * 1.3; ctx.fillRect(Math.cos(a) * 16, 44 + Math.sin(a * 1.7) * 6, 3, 3); }
  ctx.restore();
};

/**
 * What's left of him, on top of the pile of them: flat on his back across the top of it, arms flung out over his head,
 * scorched but plainly him (the flannel, the beard, the glasses cracked, the man bun), his kombucha spilt beside him,
 * smoking.
 */
export const drawHipsterDead = (ctx: Ctx, x: number, y: number, f: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.35, 1.35);
  // His standby ski, snapped, nose up out of the heap behind him
  ctx.save(); ctx.translate(40, 14); ctx.rotate(-0.9); ctx.filter = 'brightness(0.7)'; drawSki(ctx, f, '#F59E0B'); ctx.restore();
  ctx.save();
  ctx.filter = 'brightness(0.85)';
  ctx.rotate(-Math.PI / 2 + 0.08);
  ctx.scale(0.82, 0.82);
  drawHipsterBody(ctx, false, 'dead', f);
  // Soot on him, an X in each lens (drawn with him, so they sit right in them)
  ctx.filter = 'none';
  ctx.fillStyle = 'rgba(28, 25, 23, 0.45)'; for (let k = 0; k < 7; k++) ctx.fillRect(-8 + hash(k + 70) * 14, -50 + hash(k + 71) * 24, 3 + hash(k + 72) * 4, 2);
  ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 0.9;
  for (const cx of [1.9, 7.4]) { ctx.beginPath(); ctx.moveTo(cx - 1.6, -65.4); ctx.lineTo(cx + 1.6, -61.8); ctx.moveTo(cx + 1.6, -65.4); ctx.lineTo(cx - 1.6, -61.8); ctx.stroke(); }
  ctx.restore();
  // His kombucha, spilt
  ctx.save(); ctx.translate(34, 6); ctx.rotate(1.4); kombucha(ctx, -1, 7); ctx.restore();
  ctx.fillStyle = 'rgba(217, 119, 6, 0.5)'; ctx.beginPath(); ctx.ellipse(44, 10, 12, 3, 0, 0, Math.PI * 2); ctx.fill();
  // Smoking
  for (let i = 0; i < 3; i++) { const t = ((f * 0.6 + i * 40) % 120) / 120, r = 5 + t * 12; pixelBlob(ctx, -10 + i * 14 + Math.sin(i + f * 0.02) * 6, -12 - t * 70, r, r * 0.8, `rgba(60, 55, 50, ${(0.5 * (1 - t)).toFixed(3)})`, 1.5); }
  ctx.restore();
};

/** The hipster's ski (the one Meathead takes off him, so it's the same one all the way to Alcatraz). */
const HIPSTER_SKI = '#14B8A6';

/** A jet ski, facing right, its keel at (0, 0) (the waterline about y = -4): the white hull, the deck in `color`. */
export const drawSki = (ctx: Ctx, f: number, color = HIPSTER_SKI) => {
  // The jet nozzle astern
  ink(ctx, () => ctx.roundRect(-42, -12, 5, 5, 1), '#27272A', 1);
  // The hull: white glassfibre under the rub rail, grimy at the waterline, a stripe down it in the deck's color
  const hull = () => { ctx.moveTo(-38, -14); ctx.lineTo(-37, -4); ctx.lineTo(30, -4); ctx.quadraticCurveTo(40, -6, 44, -18); ctx.closePath(); };
  shadedTop(ctx, hull, '#F1F5F9', -38, -18, 82, 14, 1.2);
  ctx.save(); ctx.beginPath(); hull(); ctx.clip();
  ctx.fillStyle = '#94A3B8'; ctx.fillRect(-38, -7, 82, 2);
  checker(ctx, -38, -9, 82, 2, '#CBD5E1', 0, 1);
  ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-30, -11); ctx.lineTo(32, -14); ctx.lineTo(30, -11.6); ctx.lineTo(-30, -9); ctx.fill();
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(-30, -10.6); ctx.lineTo(31, -13.4); ctx.lineTo(30, -12); ctx.lineTo(-30, -9.6); ctx.fill();
  ctx.restore();
  // (the keel strake along the bottom)
  ctx.fillStyle = INK; ctx.fillRect(-38, -4, 70, 3);
  ctx.fillStyle = '#374151'; ctx.fillRect(-36, -4, 64, 1);
  // The deck: lit along the top, the seat well, the hood rising to the bars
  const deck = () => { ctx.moveTo(-38, -14); ctx.lineTo(-35, -20); ctx.lineTo(-4, -21); ctx.lineTo(8, -24); ctx.lineTo(24, -23); ctx.quadraticCurveTo(38, -21, 44, -18); ctx.closePath(); };
  shadedTop(ctx, deck, color, -38, -24, 82, 10, 1.2);
  ctx.fillStyle = lite(color, 0.45); ctx.fillRect(10, -22.6, 13, 1); ctx.fillRect(-32, -19, 12, 1);
  ctx.fillStyle = dark(color, 0.35); ctx.fillRect(-2, -19.6, 1, 4);
  // (the rub rail, the bumper on the bow)
  ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-38, -14); ctx.lineTo(44, -18);
  ctx.strokeStyle = INK; ctx.lineWidth = 2.6; ctx.stroke(); ctx.strokeStyle = '#4B5563'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.lineCap = 'butt';
  ink(ctx, () => ctx.roundRect(41, -20, 4.4, 4, 1.4), '#27272A', 0.8);
  // The seat: black, padded, the stitching, the grab strap
  ink(ctx, () => ctx.roundRect(-27, -26, 30, 6, [3, 3, 1, 1]), '#1F2937', 1);
  ctx.fillStyle = '#4B5563'; ctx.fillRect(-25, -25, 25, 1);
  ctx.fillStyle = '#111827'; ctx.fillRect(-13, -25.6, 1, 5);
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-24, -21.4, 20, 0.8);
  void f;
};

/** The ski under him, tipped with what he's doing: a wheelie, a leap, a dive, or just the swell. And the handlebars in front. */
const drawRide = (ctx: Ctx, state: GameState) => {
  const p = state.player;
  const feetX = p.pos.x + p.width / 2, feetY = p.pos.y + p.height;
  let tilt = 0;
  if (p.isCharging) tilt = -0.42;
  else if (p.isUppercutting) tilt = -1.05;
  else if (p.isDivekicking) tilt = 0.75;
  else if (!p.isGrounded) tilt = Math.max(-0.35, Math.min(0.35, p.vel.y * 0.03));
  else tilt = Math.sin(state.frame * 0.18) * 0.03;
  ctx.save();
  ctx.translate(feetX, feetY + 2);
  ctx.rotate(tilt);
  drawSki(ctx, state.frame);
  // The steering column up to where his hands are (inked, lit down one side), the bars and their grips
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(26, -16); ctx.lineTo(18, -40);
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke(); ctx.strokeStyle = '#27272A'; ctx.lineWidth = 4; ctx.stroke();
  ctx.strokeStyle = '#52525B'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(25, -17); ctx.lineTo(17, -39); ctx.stroke();
  ctx.lineCap = 'butt';
  ink(ctx, () => ctx.rect(12, -44, 14, 4), '#111827', 1);
  ctx.fillStyle = '#374151'; ctx.fillRect(12.5, -43.5, 13, 1);
  ctx.restore();
  // Spray: off the back normally, a rooster tail on a wheelie (chunky drops, lit, thinning out as they go)
  if (p.isGrounded || p.isCharging) {
    for (let i = 0; i < (p.isCharging ? 8 : 3); i++) {
      const t = ((state.frame * 2 + i * 7) % 20) / 20;
      const sx = Math.round(feetX - 40 - t * (p.isCharging ? 60 : 30)), sy = Math.round(feetY - t * (p.isCharging ? 50 : 14)), r = Math.round(3 + t * 6);
      pixelBlob(ctx, sx, sy, r, r, `rgba(125, 211, 252, ${(0.6 * (1 - t)).toFixed(3)})`);
      pixelBlob(ctx, sx - 1, sy - 1, r * 0.6, r * 0.6, `rgba(240, 249, 255, ${(0.8 * (1 - t)).toFixed(3)})`);
    }
  }
};

const drawWreck = (ctx: Ctx, w: FloatingWreck, f: number) => {
  const box = wreckBox(w);
  const bob = Math.sin(f * 0.08 + w.x) * 2;
  ctx.save();
  ctx.translate(w.x, Y + bob);
  if (w.look === 'car') {
    // A car gone off the bridge, nose down, wallowing: lit along its roof, the glass, a headlight still on
    ctx.rotate(0.12);
    const cab = () => { ctx.moveTo(-26, -24); ctx.lineTo(-22, -36); ctx.lineTo(20, -36); ctx.lineTo(24, -24); ctx.closePath(); };
    const body = () => ctx.rect(-44, -24, 88, 26);
    shadedTop(ctx, cab, '#B91C1C', -26, -36, 50, 14);
    shadedTop(ctx, body, '#B91C1C', -44, -24, 88, 26);
    ink(ctx, () => { ctx.rect(-22, -34, 18, 10); ctx.rect(2, -34, 18, 10); }, '#1E293B');
    ctx.fillStyle = '#334155'; ctx.fillRect(-21.5, -33.5, 17, 3); ctx.fillRect(2.5, -33.5, 17, 3);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; ctx.fillRect(-20, -32, 2, 5); ctx.fillRect(4, -32, 2, 5);
    ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-1, -22, 1, 18); ctx.fillRect(6, -16, 5, 2);
    ink(ctx, () => ctx.rect(38, -18, 6, 5), '#FDE68A', 0.8);
    ctx.fillStyle = '#FFFBEB'; ctx.fillRect(39, -17, 2, 2);
    ink(ctx, () => ctx.rect(-46, -14, 6, 5), '#9CA3AF', 0.8);
    // (the water lapping up its sides)
    ctx.fillStyle = 'rgba(30, 59, 90, 0.7)'; ctx.fillRect(-46, -4, 92, 8);
    checker(ctx, -46, -6, 92, 2, 'rgba(30, 59, 90, 0.7)');
  } else if (w.look === 'buoy') {
    // A channel buoy: the cone lit down its left, the white band, the cage and its light winking
    const cone = () => { ctx.moveTo(-14, 0); ctx.lineTo(-8, -34); ctx.lineTo(8, -34); ctx.lineTo(14, 0); ctx.closePath(); };
    shaded(ctx, cone, '#F97316', -14, -34, 28, 34);
    ctx.save(); ctx.beginPath(); cone(); ctx.clip();
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-14, -20, 28, 6);
    ctx.fillStyle = '#CBD5E1'; ctx.fillRect(4, -20, 10, 6);
    ctx.fillStyle = INK; ctx.fillRect(-14, -21, 28, 1); ctx.fillRect(-14, -14, 28, 1);
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-6, -34); ctx.lineTo(-4, -46); ctx.lineTo(4, -46); ctx.lineTo(6, -34); ctx.stroke();
    const on = f % 50 < 25;
    if (on) steppedGlow(ctx, 0, -39, 16, '#FDE047', 0.35, 0.05, 3);
    ink(ctx, () => ctx.rect(-3, -44, 6, 10), on ? '#FDE047' : '#78350F', 0.8);
    if (on) { ctx.fillStyle = '#FFFBEB'; ctx.fillRect(-2, -43, 2, 4); }
  } else {
    // A crate: planks lit along their tops, the cross brace, nail heads, inked
    ctx.rotate(Math.sin(w.rot) * 0.1);
    ink(ctx, () => ctx.rect(-22, -32, 44, 32), '#A16207', 1.5);
    ctx.fillStyle = '#B87A1E'; for (let y = -32; y < 0; y += 8) ctx.fillRect(-21, y + 1, 42, 2);
    ctx.fillStyle = '#854D0E'; for (let y = -32; y < 0; y += 8) ctx.fillRect(-21, y + 7, 42, 1);
    ctx.strokeStyle = '#78350F'; ctx.lineWidth = 3; ctx.strokeRect(-22, -32, 44, 32);
    ctx.beginPath(); ctx.moveTo(-22, -32); ctx.lineTo(22, 0); ctx.stroke();
    ctx.strokeStyle = '#B87A1E'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-21, -33); ctx.lineTo(23, -1); ctx.stroke();
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(-23.5, -33.5, 47, 35);
    ctx.fillStyle = '#44403C'; for (const [nx, ny] of [[-19, -29], [18, -29], [-19, -4], [18, -4]]) ctx.fillRect(nx, ny, 2, 2);
  }
  ctx.restore();
  // Chop around it
  ctx.fillStyle = 'rgba(224, 242, 254, 0.7)'; ctx.fillRect(box.x - 6, Y - 1, box.w + 12, 2);
  checker(ctx, box.x - 10, Y - 3, box.w + 20, 2, 'rgba(224, 242, 254, 0.6)');
  checker(ctx, box.x - 2, Y + 1, box.w + 4, 2, 'rgba(224, 242, 254, 0.4)', 1);
};

const drawRamp = (ctx: Ctx, x: number, f: number) => {
  // A wooden ramp on floats, a banner on it
  const ramp = () => { ctx.beginPath(); ctx.moveTo(x - 60, Y); ctx.lineTo(x + 140, Y - 110); ctx.lineTo(x + 160, Y - 110); ctx.lineTo(x + 160, Y); ctx.closePath(); };
  // (the frame under it: posts and a brace, seen through the side)
  ctx.save(); ramp(); ctx.clip();
  ctx.fillStyle = '#4A321E'; ctx.fillRect(x - 60, Y - 110, 220, 110);
  ctx.fillStyle = '#5E4128'; for (const px of [x + 20, x + 80, x + 140]) ctx.fillRect(px, Y - 110, 8, 110);
  ctx.fillStyle = '#7A5838'; for (const px of [x + 20, x + 80, x + 140]) ctx.fillRect(px, Y - 110, 2, 110);
  ctx.strokeStyle = '#5E4128'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 24, Y); ctx.lineTo(x + 144, Y - 100); ctx.stroke();
  ctx.fillStyle = '#3A2616'; ctx.fillRect(x + 150, Y - 110, 10, 110);
  ctx.restore();
  ramp(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
  // (the deck boards up the slope, each lit on its leading edge)
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 60, Y); ctx.lineTo(x + 140, Y - 110); ctx.lineTo(x + 160, Y - 110);
  ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.stroke(); ctx.strokeStyle = '#8A6A45'; ctx.lineWidth = 5; ctx.stroke();
  ctx.strokeStyle = '#B08A5C'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 58, Y - 3); ctx.lineTo(x + 140, Y - 112); ctx.lineTo(x + 160, Y - 112); ctx.stroke();
  ctx.lineCap = 'butt';
  ctx.strokeStyle = '#5E4630'; ctx.lineWidth = 2;
  ctx.beginPath(); for (let k = 0; k < 8; k++) { const t = k / 8; ctx.moveTo(x - 60 + t * 200, Y - t * 110 - 2); ctx.lineTo(x - 56 + t * 200, Y - t * 110 + 3); } ctx.stroke();
  // (the floats it's on: orange drums, lit on top, the water slapping round them)
  ctx.fillStyle = INK; ctx.fillRect(x - 71, Y - 9, 242, 12);
  ctx.fillStyle = '#F97316'; ctx.fillRect(x - 70, Y - 8, 240, 10);
  ctx.fillStyle = '#FDBA74'; ctx.fillRect(x - 70, Y - 8, 240, 2);
  ctx.fillStyle = '#C2410C'; ctx.fillRect(x - 70, Y - 1, 240, 3);
  ctx.fillStyle = INK; for (let k = x - 40; k < x + 170; k += 40) ctx.fillRect(k, Y - 8, 1, 10);
  checker(ctx, x - 74, Y + 1, 250, 2, 'rgba(224, 242, 254, 0.6)');
  // (the banner on its posts, each post planted on the deck where it stands, a bracket bolted down at its foot)
  for (const bx of [x + 24, x + 152]) {
    const deck = Y - Math.min(110, ((bx + 2 - (x - 60)) / 200) * 110) - 3, h = deck - (Y - 170);
    ctx.fillStyle = INK; ctx.fillRect(bx - 1, Y - 170, 6, h); ctx.fillStyle = '#78716C'; ctx.fillRect(bx, Y - 170, 4, h); ctx.fillStyle = '#A8A29E'; ctx.fillRect(bx, Y - 170, 1, h);
    ctx.fillStyle = INK; ctx.fillRect(bx - 4, deck - 3, 12, 5); ctx.fillStyle = '#57534E'; ctx.fillRect(bx - 3, deck - 2, 10, 3); ctx.fillStyle = '#A8A29E'; ctx.fillRect(bx - 3, deck - 2, 10, 1);
  }
  ctx.fillStyle = INK; ctx.fillRect(x + 19, Y - 171, 152, 32);
  ctx.fillStyle = '#FDE047'; ctx.fillRect(x + 20, Y - 170, 150, 30);
  ctx.fillStyle = '#FEF9C3'; ctx.fillRect(x + 20, Y - 170, 150, 2);
  ctx.fillStyle = '#CA8A04'; ctx.fillRect(x + 20, Y - 142, 150, 2);
  ctx.fillStyle = '#111827'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillText('ALCATRAZ TOURS', x + 95, Y - 159); ctx.fillText('THIS WAY >>', x + 95, Y - 147);
  ctx.textAlign = 'left';
  void f;
};

export const drawSeaFront = (ctx: Ctx, state: GameState, rt: ErnieRuntime) => {
  const js = rt.ski;
  const p = state.player;
  // The hipster's lines (in front of everybody)
  const h = js.hipster;
  if (h.lineT > 0 && h.line) {
    // (off after Meathead on his standby ski, the bubble goes with him, and stays on screen)
    const c = js.chaser, chasing = c.state === 'riding' || c.state === 'flying';
    if (chasing) bubble(ctx, Math.max(state.camera.x + 160, Math.min(state.camera.x + CANVAS_WIDTH - 160, c.x)), Math.max(state.camera.y + 64, c.y - 100), h.line);
    else bubble(ctx, h.x, h.y - (h.state === 'sitting' ? 90 : h.state === 'swimming' ? 30 : 70), h.line);
  }
  // (up off the top of the view, or away off the side of it, the bubble stays on screen)
  if (js.lineT > 0 && js.line && (!p.hidden || js.phase === 'launch') && state.deathTimer <= 0) bubble(ctx, Math.max(state.camera.x + 160, Math.min(state.camera.x + CANVAS_WIDTH - 160, p.pos.x + p.width / 2)), Math.max(state.camera.y + 64, p.pos.y - 16), js.line);
};

export const drawSeaHud = (ctx: Ctx, state: GameState, rt: ErnieRuntime) => {
  const js = rt.ski;
  const W = CANVAS_WIDTH;
  const chasing = js.phase === 'riding' && js.chaser.state !== 'off';
  if (js.phase === 'theft' || js.phase === 'launch' || chasing) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 36); ctx.fillRect(0, CANVAS_HEIGHT - 36, W, 36); }
  if (js.phase !== 'riding' || chasing) return;
  // How far to the island, and the time left
  const k = rideProgress(js);
  // (over on the right, clear of the health and power in the top left)
  const bw = 300, bx = W - bw - 20, by = 40;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(bx - 8, by - 20, bw + 16, 36);
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(bx, by, bw, 8);
  ctx.fillStyle = '#38BDF8'; ctx.fillRect(bx, by, bw * k, 8);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(bx + bw * k - 6, by - 4, 12, 6);
  ctx.font = 'bold 8px "Press Start 2P"'; ctx.fillStyle = '#F8FAFC';
  ctx.textAlign = 'left'; ctx.fillText('SAUSALITO', bx, by - 7);
  ctx.textAlign = 'right'; ctx.fillText('ALCATRAZ', bx + bw, by - 7);
  const left = Math.max(0, Math.ceil((RIDE_FRAMES - js.t) / 60));
  ctx.textAlign = 'center'; ctx.fillStyle = left <= 10 ? '#FDE047' : '#F8FAFC';
  ctx.fillText(`0:${String(left).padStart(2, '0')}`, bx + bw / 2, by - 7);
  // A hint for what's just turned up
  if (js.hintT > 0 && js.hint) {
    ctx.globalAlpha = Math.min(1, js.hintT / 10, (200 - js.hintT) / 20);
    ctx.font = 'bold 10px "Press Start 2P"';
    const w = ctx.measureText(js.hint).width + 24;
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(W / 2 - w / 2, CANVAS_HEIGHT - 86, w, 26);
    ctx.fillStyle = '#FDE047'; ctx.fillText(js.hint, W / 2, CANVAS_HEIGHT - 68);
  }
  ctx.restore();
};

// ---------------------------------------------------------------------------
// The cell house
// ---------------------------------------------------------------------------

export const drawCellMid = (ctx: Ctx, state: GameState, rt: ErnieRuntime) => {
  const tour = rt.tour;
  const C = COURSE.cellblock;
  if (!visible(state, C.crashX - 300, C.crashX + 300)) return;
  if (tourWrecked(tour)) { drawAftermath(ctx, state); return; }
  if (tour.phase !== 'tour') { drawTourGroup(ctx, state, 0); return; }
  drawTourGroup(ctx, state, tour.t);
  // The ski on its way down through the roof, him on it
  const k = skiDrop(tour);
  if (k >= 0) {
    const x = C.crashX, y = Y - 520 + k * 520;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(0.5 + k * 0.3);
    drawSki(ctx, state.frame);
    ctx.restore();
    const p = state.player;
    const body = { ...p, pos: { x: 0, y: 0 }, hidden: false, isGrounded: false, vel: { x: 4, y: 14 }, facing: 1 as const, isDivekicking: true, invincibilityTimer: 0, hurtTimer: 0, pushbackTimer: 0, isCharging: false, isSliding: false, isUppercutting: false };
    ctx.save();
    ctx.translate(x - p.width / 2, y - p.height - 6);
    drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: 'GUN', showFilthShield: false, invincibilityEnabled: false });
    ctx.restore();
  }
  // Glass coming down with him
  if (tour.t >= DROP_AT - 8 && tour.t < IMPACT_AT + 30) {
    for (let i = 0; i < 16; i++) {
      const t = tour.t - (DROP_AT - 8);
      const gx = C.crashX + (hash(i) - 0.5) * 160, gy = Y - 500 + t * (8 + hash(i + 2) * 8);
      if (gy > Y) continue;
      ctx.fillStyle = INK; ctx.fillRect(gx - 1, gy - 1, 6, 8); ctx.fillStyle = 'rgba(203, 213, 225, 0.9)'; ctx.fillRect(gx, gy, 4, 6); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(gx, gy, 2, 2);
    }
  }
};

/** Alive and listening (and looking up, once they hear him coming). */
const drawTourGroup = (ctx: Ctx, state: GameState, t: number) => {
  const C = COURSE.cellblock;
  const up = t > 250;
  TOURISTS.forEach((tr, i) => {
    const x = C.crashX + tr.dx;
    ctx.save();
    ctx.translate(x, Y);
    if (tr.look === 'guide') ctx.scale(-1, 1);
    drawTourist(ctx, tr.look, i, state.frame, up);
    ctx.restore();
  });
};

export const TOURIST_LOOKS: Record<string, { shirt: string; pants: string; skin: string; h: number }> = {
  dad: { shirt: '#F97316', pants: '#D6D3D1', skin: '#F2C9A0', h: 64 },
  mom: { shirt: '#EC4899', pants: '#60A5FA', skin: '#E0AC69', h: 58 },
  kid: { shirt: '#FACC15', pants: '#1E3A8A', skin: '#F2C9A0', h: 40 },
  selfie: { shirt: '#A855F7', pants: '#111827', skin: '#C68642', h: 60 },
  grandpa: { shirt: '#22C55E', pants: '#78716C', skin: '#F2C9A0', h: 58 },
  backpacker: { shirt: '#0EA5E9', pants: '#57534E', skin: '#8D5524', h: 62 },
  guide: { shirt: '#166534', pants: '#A16207', skin: '#E0AC69', h: 62 },
};

/**
 * What each of them's got on: dad's Hawaiian shirt, shorts, visor and camera; mom's sun hat and shades; the kid's
 * cap; the selfie girl's ponytail; grandpa's bucket hat, specs and mustache; the backpacker's beanie and beard; the
 * ranger's hat, badge and name tag.
 */
const TOURIST_SPECS: Record<string, PersonSpec> = {
  dad: {
    skin: '#F2B8A0', hair: { style: 'short', color: '#78716C' }, hat: { style: 'visor', color: '#F8FAFC' }, eyes: 'shades', build: 'fat',
    top: { style: 'shirt', color: '#F97316', long: false }, legs: { color: '#D6D3D1', style: 'shorts' }, shoes: '#78350F',
    extra: c => {
      // (the flowers, then the camera round his neck)
      for (const [fx, fy] of [[-8, -48], [3, -45], [-4, -38], [7, -35], [-9, -32]]) { c.fillStyle = '#FDE047'; c.fillRect(fx - 2, fy - 0.8, 4, 1.6); c.fillRect(fx - 0.8, fy - 2, 1.6, 4); c.fillStyle = '#DC2626'; c.fillRect(fx - 0.5, fy - 0.5, 1, 1); }
      c.strokeStyle = INK; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-4, -52); c.lineTo(0, -42); c.lineTo(5, -52); c.stroke();
      ink(c, () => c.roundRect(-4, -43, 10, 7, 1.5), '#1F2937', 0.8);
      ink(c, () => c.arc(1.5, -39.5, 2.4, 0, Math.PI * 2), '#64748B', 0.6);
      c.fillStyle = '#E2E8F0'; c.fillRect(-3, -42, 2, 1);
    },
  },
  mom: {
    skin: '#E0AC69', hair: { style: 'long', color: '#7C2D12' }, hat: { style: 'sunhat', color: '#FDE68A' }, eyes: 'shades',
    top: { style: 'tee', color: '#EC4899', accent: '#F9A8D4' }, legs: { color: '#60A5FA' }, shoes: '#F8FAFC',
  },
  kid: {
    kid: true, skin: '#F2C9A0', hair: { style: 'short', color: '#FDE68A' }, hat: { style: 'cap', color: '#DC2626' },
    top: { style: 'tee', color: '#FACC15', accent: '#DC2626' }, legs: { color: '#1E3A8A', style: 'shorts' }, shoes: '#3B82F6',
  },
  selfie: {
    skin: '#C68642', hair: { style: 'pony', color: '#1C1917' }, build: 'slim',
    top: { style: 'tee', color: '#A855F7', accent: '#F0ABFC' }, legs: { color: '#111827' }, shoes: '#F8FAFC',
  },
  grandpa: {
    skin: '#F2C9A0', hair: { style: 'short', color: '#E7E5E4' }, hat: { style: 'bucket', color: '#F5F5F4' }, eyes: 'glasses', face: 'mustache', faceHair: '#E7E5E4', build: 'slim',
    top: { style: 'shirt', color: '#22C55E', long: false }, legs: { color: '#78716C' }, shoes: '#F8FAFC',
  },
  backpacker: {
    skin: '#8D5524', hair: { style: 'curly', color: '#1C1917' }, hat: { style: 'beanie', color: '#EA580C' }, face: 'beard', faceHair: '#1C1917',
    top: { style: 'tee', color: '#0EA5E9', accent: '#FDE047' }, legs: { color: '#57534E', style: 'shorts' }, shoes: '#78350F',
    extra: c => { c.fillStyle = '#3F6212'; c.fillRect(-7, -52, 3, 24); c.fillRect(4, -52, 3, 24); c.fillRect(-7, -40, 14, 2); },
  },
  guide: {
    skin: '#E0AC69', hair: { style: 'short', color: '#78350F' }, hat: { style: 'stetson', color: '#A16207' },
    top: { style: 'shirt', color: '#166534', accent: '#14532D' }, legs: { color: '#A16207' }, shoes: '#44403C',
    extra: c => {
      // (the badge, the name tag)
      ink(c, () => { for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k * 4 * Math.PI) / 5; c.lineTo(-4 + Math.cos(a) * 3.2, -45 + Math.sin(a) * 3.2); } c.closePath(); }, '#FACC15', 0.6);
      ink(c, () => c.rect(2, -47, 6, 2.6), '#F8FAFC', 0.5);
    },
  },
};

export const drawTourist = (ctx: Ctx, look: string, i: number, f: number, up: boolean) => {
  const L = TOURIST_LOOKS[look], S = TOURIST_SPECS[look];
  const sc = look === 'kid' ? 0.95 : L.h / 64;
  // The backpacker's pack, behind him: the bedroll on top, a pocket, a bottle in the side
  if (look === 'backpacker') {
    ctx.save(); ctx.scale(sc, sc);
    ink(ctx, () => ctx.roundRect(-14, -46, 5, 9, 1.5), '#38BDF8', 0.7);
    shaded(ctx, () => ctx.roundRect(-19, -55, 13, 30, 3), '#65A30D', -19, -55, 13, 30);
    ink(ctx, () => ctx.roundRect(-20, -60, 15, 6, 3), '#B45309', 0.8);
    ink(ctx, () => ctx.roundRect(-18, -40, 9, 9, 1.5), '#4D7C0F', 0.7);
    ctx.restore();
  }
  // Smiling for the tour; mouths falling open, looking up at the roof, once they hear him coming
  const mouth = up ? 'o' : look === 'grandpa' ? 'flat' : look === 'dad' || look === 'kid' || look === 'selfie' ? 'grin' : 'smile';
  const pose: Pose = { mouth, f: f + i * 41 };
  switch (look) {
    case 'mom': pose.propBack = (c, hx, hy) => { // the bag
      c.strokeStyle = INK; c.lineWidth = 0.8; c.beginPath(); c.arc(hx, hy + 2, 3.4, Math.PI, 0); c.stroke();
      ink(c, () => c.roundRect(hx - 5, hy + 1, 10, 8, 2), '#F472B6', 0.8); c.fillStyle = '#FACC15'; c.fillRect(hx - 1, hy + 3, 2, 1.4);
    }; break;
    case 'kid': pose.arms = 'hold'; pose.prop = (c, hx, hy) => { // the balloon
      c.strokeStyle = '#9CA3AF'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(hx, hy); c.quadraticCurveTo(hx + 6, hy - 20, hx + 3, hy - 32); c.stroke();
      shaded(c, () => c.ellipse(hx + 3, hy - 41, 7.5, 9, 0, 0, Math.PI * 2), '#F472B6', hx - 5, hy - 50, 16, 18, 0.8);
      c.fillStyle = '#FBCFE8'; c.fillRect(hx - 1, hy - 46, 2, 3);
    }; break;
    case 'selfie': pose.arms = 'up'; pose.prop = (c, hx, hy) => { // the stick, the phone
      limb(c, hx, hy, hx + 12, hy - 16, 1.6, '#94A3B8');
      ink(c, () => c.roundRect(hx + 9, hy - 27, 8, 12, 1.5), '#1C1917', 0.8);
      c.fillStyle = '#38BDF8'; c.fillRect(hx + 10.5, hy - 25.5, 5, 8); c.fillStyle = '#E0F2FE'; c.fillRect(hx + 11, hy - 25, 1.4, 3);
    }; break;
    case 'grandpa': pose.arms = 'hold'; pose.prop = (c, hx, hy) => { // the cane
      limb(c, hx + 1, hy, hx + 3, 0, 2.4, '#78350F');
      c.strokeStyle = INK; c.lineWidth = 4.4; c.beginPath(); c.arc(hx - 2, hy, 3, Math.PI, 0); c.stroke();
      c.strokeStyle = '#78350F'; c.lineWidth = 2.4; c.beginPath(); c.arc(hx - 2, hy, 3, Math.PI, 0); c.stroke();
    }; break;
    case 'backpacker': pose.arms = 'hips'; break; // (thumbs in his straps)
    case 'guide': pose.arms = 'point'; pose.propBack = (c, hx, hy) => { // the flag on a stick, up for the tour to follow
      const top = -96, wave = Math.sin(f * 0.1) * 2;
      ink(c, () => { c.moveTo(hx + 1, top + 1); c.lineTo(hx + 20, top + 5 + wave); c.lineTo(hx + 19, top + 13 + wave); c.lineTo(hx + 1, top + 13); c.closePath(); }, '#FDE047', 0.8);
      c.fillStyle = '#CA8A04'; c.fillRect(hx + 4, top + 9, 12, 1.4);
      limb(c, hx, hy + 6, hx, top, 2, '#78350F');
    }; break;
  }
  drawPerson(ctx, 0, 0, S, pose, sc);
};

/** What's left: a crater, the ski on fire in it, and the tour all over the place. */
const drawAftermath = (ctx: Ctx, state: GameState) => {
  const C = COURSE.cellblock, f = state.frame;
  const x = C.crashX;
  // Scorch out round it in rings, and the crater: its lip chipped, its throat black
  ctx.fillStyle = 'rgba(20, 16, 14, 0.45)'; ctx.beginPath(); ctx.ellipse(x, Y + 2, 190, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(20, 16, 14, 0.6)'; ctx.beginPath(); ctx.ellipse(x, Y + 2, 135, 9, 0, 0, Math.PI * 2); ctx.fill();
  checker(ctx, x - 190, Y - 2, 55, 4, 'rgba(20, 16, 14, 0.5)'); checker(ctx, x + 135, Y - 2, 55, 4, 'rgba(20, 16, 14, 0.5)', 1);
  ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.ellipse(x, Y + 4, 70, 10, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#0A0807'; ctx.beginPath(); ctx.ellipse(x, Y + 4, 54, 7, 0, 0, Math.PI); ctx.fill();
  for (let i = 0; i < 9; i++) {
    const px = Math.round(x - 74 + i * 18 + hash(i + 70) * 6), py = Y - 2 + Math.round(hash(i + 71) * 3), s = 4 + Math.round(hash(i + 72) * 3);
    ctx.fillStyle = INK; ctx.fillRect(px - 1, py - 1, s + 2, s + 2); ctx.fillStyle = i % 2 ? '#6B706A' : '#8A8F87'; ctx.fillRect(px, py, s, s); ctx.fillStyle = '#A3A8A0'; ctx.fillRect(px, py, s, 1);
  }
  // Blood up the cell bars (running down) and across the floor (a wet glint on each pool)
  for (let i = 0; i < 12; i++) {
    const bx = x + (hash(i) - 0.5) * 420, rw = 14 + hash(i + 1) * 20;
    ctx.fillStyle = 'rgba(127, 29, 29, 0.85)'; ctx.beginPath(); ctx.ellipse(bx, Y + 1, rw, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(69, 10, 10, 0.8)'; ctx.fillRect(bx - rw * 0.6, Y + 2, rw * 1.2, 1);
    ctx.fillStyle = 'rgba(254, 202, 202, 0.5)'; ctx.fillRect(bx - rw * 0.4, Y, 3, 1);
  }
  for (let i = 0; i < 8; i++) {
    const bx = Math.round(x + (hash(i + 20) - 0.5) * 500), by = Math.round(Y - 40 - hash(i + 21) * 160), sw = Math.round(5 + hash(i) * 8), run = Math.round(10 + hash(i + 3) * 14);
    ctx.fillStyle = '#7F1D1D'; ctx.fillRect(bx, by, sw, 3); ctx.fillRect(bx + 2, by, 2, run);
    ctx.fillStyle = '#991B1B'; ctx.fillRect(bx, by, sw - 2, 1);
    ctx.fillStyle = '#450A0A'; ctx.fillRect(bx + 1, by + run, 3, 2);
  }
  // The ski, wrapped round itself, burning
  ctx.save(); ctx.translate(x - 10, Y - 4); ctx.rotate(-0.35); drawSki(ctx, f, '#44403C'); ctx.restore();
  drawFire(ctx, x - 6, Y - 10, 76, 38, f, { seed: Math.floor(x) });
  for (let i = 0; i < 4; i++) {
    const t = ((f * 0.7 + i * 50) % 200) / 200, r = 14 + t * 30;
    pixelBlob(ctx, x + t * 20, Y - 40 - t * 300, r, r * 0.8, `rgba(40, 36, 34, ${(0.5 * (1 - t)).toFixed(3)})`);
  }
  // The tour: charred, in bits, strewn out from the middle. The guide's flag, still standing. A selfie stick.
  TOURISTS.forEach((tr, i) => {
    const bx = x + tr.dx * 1.9 + (hash(i + 30) - 0.5) * 30;
    const L = TOURIST_LOOKS[tr.look];
    ctx.save();
    ctx.translate(bx, Y);
    ctx.rotate((hash(i + 40) - 0.5) * 0.4);
    // A charred body, flat out: inked, a burnt sheen along its top, the cracks still glowing, a scrap of shirt
    const len = L.h * 0.8;
    ctx.fillStyle = INK; ctx.fillRect(-L.h * 0.45 - 1, -10, len + 2, 11);
    ctx.beginPath(); ctx.arc(L.h * 0.4, -6, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1C1917'; ctx.fillRect(-L.h * 0.45, -9, len, 9);
    ctx.beginPath(); ctx.arc(L.h * 0.4, -6, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#44403C'; ctx.fillRect(-L.h * 0.45, -9, len, 2); ctx.fillRect(L.h * 0.4 - 3, -11, 4, 2);
    ctx.fillStyle = (f + i * 9) % 40 < 20 ? '#F97316' : '#B45309';
    ctx.fillRect(-L.h * 0.1, -5, 3, 1); ctx.fillRect(L.h * 0.15, -4, 1, 3);
    ctx.fillStyle = L.shirt; ctx.globalAlpha = 0.5; ctx.fillRect(-L.h * 0.2, -8, L.h * 0.3, 4); ctx.globalAlpha = 1;
    checker(ctx, -L.h * 0.2, -8, L.h * 0.3, 4, '#1C1917', 0, 1);
    ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-L.h * 0.5, -3, 10, 3); ctx.fillStyle = '#B91C1C'; ctx.fillRect(-L.h * 0.5, -3, 6, 1);
    ctx.restore();
    // A limb, further off
    if (i % 2 === 0) {
      ctx.save(); ctx.translate(bx + (i % 4 ? 70 : -80), Y - 3); ctx.rotate(hash(i) * 3);
      ctx.fillStyle = INK; ctx.fillRect(-9, -3, 18, 7); ctx.fillStyle = '#1C1917'; ctx.fillRect(-8, -2, 16, 5); ctx.fillStyle = '#44403C'; ctx.fillRect(-8, -2, 16, 1);
      ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-9, -2, 2, 5);
      ctx.restore();
    }
  });
  // (the guide's flag, on its stick)
  ctx.save(); ctx.translate(x + 240, Y); ctx.rotate(0.3);
  ctx.fillStyle = INK; ctx.fillRect(-2, -61, 4, 61); ctx.fillStyle = '#78350F'; ctx.fillRect(-1, -60, 2, 60);
  ink(ctx, () => ctx.rect(1, -60, 18, 12), '#FDE047', 0.8); ctx.fillStyle = '#CA8A04'; ctx.fillRect(4, -52, 12, 1);
  ctx.restore();
  // (the selfie stick, the phone)
  ctx.save(); ctx.translate(x - 250, Y - 2); ctx.rotate(-0.1);
  ctx.fillStyle = INK; ctx.fillRect(-1, -1, 36, 4); ctx.fillStyle = '#94A3B8'; ctx.fillRect(0, 0, 34, 2);
  ink(ctx, () => ctx.rect(32, -5, 7, 9), '#111827', 0.8); ctx.fillStyle = '#38BDF8'; ctx.fillRect(33, -4, 5, 2);
  ctx.restore();
  // A balloon, drifting up
  const by = Y - 120 - ((f * 0.4) % 400);
  if (by > Y - 470) {
    ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 90, by + 8); ctx.quadraticCurveTo(x - 86, by + 18, x - 90, by + 28); ctx.stroke();
    shaded(ctx, () => ctx.ellipse(x - 90, by, 7, 8.5, 0, 0, Math.PI * 2), '#F472B6', x - 97, by - 9, 14, 17, 0.8);
    ctx.fillStyle = '#FBCFE8'; ctx.fillRect(x - 94, by - 5, 2, 3);
  }
};

export const drawCellFront = (ctx: Ctx, state: GameState, rt: ErnieRuntime) => {
  const tour = rt.tour;
  const C = COURSE.cellblock;
  // The whole tour chuckling at the guide's joke
  if (tourLaughing(tour)) {
    ctx.save();
    ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center';
    TOURISTS.forEach((tr, i) => {
      if (i % 2 === 1 && tr.look !== 'guide') return;
      const bob = Math.abs(Math.sin(state.frame * 0.3 + i)) * 4;
      ctx.fillStyle = '#000'; ctx.fillText(tr.look === 'guide' ? 'HO HO!' : 'HA HA!', C.crashX + tr.dx + 1, Y - 92 - bob + 1);
      ctx.fillStyle = '#FDE68A'; ctx.fillText(tr.look === 'guide' ? 'HO HO!' : 'HA HA!', C.crashX + tr.dx, Y - 92 - bob);
    });
    ctx.restore();
  }
  if (tour.lineT <= 0 || !tour.line) return;
  if (tour.who === 'meathead') {
    if (tour.phase === 'tour' && tour.t < IMPACT_AT) {
      // Off the top of the screen, coming closer
      bubble(ctx, C.crashX, state.camera.y + 64, tour.line);
      ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(C.crashX - 6, state.camera.y + 38); ctx.lineTo(C.crashX + 6, state.camera.y + 38); ctx.lineTo(C.crashX, state.camera.y + 26); ctx.fill();
    } else {
      const p = state.player;
      bubble(ctx, p.pos.x + p.width / 2, p.pos.y - 16, tour.line);
    }
    return;
  }
  const i = tour.who === 'guide' ? TOURISTS.length - 1 : Number(tour.who);
  const tr = TOURISTS[i];
  if (!tr) return;
  bubble(ctx, C.crashX + tr.dx, Y - 100, tour.line);
};

export const drawCellHud = (ctx: Ctx, state: GameState, rt: ErnieRuntime) => {
  const tour = rt.tour;
  if (tour.phase !== 'tour') return;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_WIDTH, 36); ctx.fillRect(0, CANVAS_HEIGHT - 36, CANVAS_WIDTH, 36);
  if (tour.t < FADE_IN) { ctx.fillStyle = `rgba(0,0,0,${1 - tour.t / FADE_IN})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  // A caption for where we are
  if (tour.t < 120) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, tour.t / 20, (120 - tour.t) / 20);
    ctx.font = 'bold 10px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillStyle = '#F5F5F4';
    ctx.fillText('ALCATRAZ ISLAND. MEANWHILE...', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 14);
    ctx.restore();
  }
  // A white flash on impact
  if (tour.t >= IMPACT_AT && tour.t < IMPACT_AT + 16) { ctx.fillStyle = `rgba(255,255,255,${1 - (tour.t - IMPACT_AT) / 16})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  void state;
};
