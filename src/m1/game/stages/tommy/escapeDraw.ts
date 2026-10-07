// The way out, drawn. Cut scenes over the whole screen: the street, the manhole
// cover blasting up out of it and him after it; the water tower (the cover
// through its tank, him slamming into it, and over it goes onto the next block,
// the tank bursting); him surfing the cover down the street on the front of the
// wave, the houses going under and melting away; the family on their couch in
// front of the TV (the room getting darker, the window filling up with the
// wave); the wave through the wall, and close up, eating them to the bone. Then
// the ruins: a block's worth of houses washed out and melted, the three of them
// on what's left of their couch, the TV still on, and past it, the pit.

import type { GameState } from '../../core/state';
import { hazeBands, bandedGradient, checker, steppedGlow } from '../../render/pixelArt';
import { INK, ink, shaded, shadedTop, dark, lite } from '../../render/npc/kit';
import { drawPerson } from '../../render/npc/person';
import { sewerBrick } from './sewerDraw';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, BOSS_DOOR_X } from '../../../constants';
import { COURSE, RUINS_Y, CAVERN_ROOF } from './course';
import type { TommyRuntime } from './runtime';
import { TOWER_FRAMES, SURF_FRAMES, FAMILY_FRAMES, CRUSH_FRAMES, MELT_FRAMES, LAUNCH, PRE, RUMBLE_AT, COVER_HIT, MAN_HIT, TOWER_DOWN, inSkippable } from './escape';
import { SKIP_AFTER, drawSkipPrompt } from '../../platform/skip';
import { drawStreetSky, drawWaterTower, CITY_SUIT, CITY_CREASE, CITY_VEST, CITY_BAND, CITY_BLUE, CITY_FILTER } from './streetDraw';
import { saying, drawBubble } from './script';

type Ctx = CanvasRenderingContext2D;
const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** A little Meathead in his yellow suit, for the cut scenes (at his feet, `s` big): inked, lit down the left, the visor glinting. */
const suitedMan = (ctx: Ctx, x: number, y: number, s: number, rot = 0, suit = 1) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  // (under it, if it's going: his jeans, his skin)
  if (suit < 1) {
    shaded(ctx, () => { ctx.rect(-9, -26, 8, 26); ctx.rect(2, -26, 8, 26); }, '#1E3A8A', -9, -26, 19, 26, 1);
    shaded(ctx, () => ctx.rect(-14, -58, 28, 34), '#E0AC69', -14, -58, 28, 34, 1);
  }
  ctx.globalAlpha *= suit;
  const Y_ = '#FACC15';
  shaded(ctx, () => ctx.rect(-9, -26, 8, 22), Y_, -9, -26, 8, 22, 1);
  shaded(ctx, () => ctx.rect(2, -26, 8, 22), Y_, 2, -26, 8, 22, 1);
  ink(ctx, () => { ctx.rect(-10, -5, 10, 5); ctx.rect(1, -5, 10, 5); }, '#1C1917', 1);
  ctx.fillStyle = '#44403C'; ctx.fillRect(-9, -5, 8, 1); ctx.fillRect(2, -5, 8, 1);
  shaded(ctx, () => ctx.roundRect(-14, -58, 28, 34, 4), Y_, -14, -58, 28, 34, 1.2);
  ctx.fillStyle = '#CA8A04'; ctx.fillRect(0, -54, 1.5, 28); ctx.fillRect(-11, -36, 8, 1); ctx.fillRect(5, -44, 6, 1); // (the zip, creases)
  shaded(ctx, () => ctx.arc(1, -66, 11, 0, Math.PI * 2), Y_, -10, -77, 22, 22, 1.2);
  ink(ctx, () => ctx.roundRect(1, -70, 11, 6, 2), '#1F2937', 1);
  ctx.fillStyle = '#94A3B8'; ctx.fillRect(3, -69, 4, 1); ctx.fillRect(3, -68, 1, 2);
  ink(ctx, () => ctx.arc(9, -59, 2.5, 0, Math.PI * 2), '#374151', 0.8); // (the filter)
  ctx.restore();
};

// ---------------------------------------------------------------------------
// The cut scenes
// ---------------------------------------------------------------------------

export const drawCutScene = (ctx: Ctx, state: GameState, rt: TommyRuntime) => {
  const es = rt.escape;
  if (es.phase === 'tower') { if (es.t < LAUNCH) drawLaunchScene(ctx, state, es.t); else drawTowerScene(ctx, state, es.t - LAUNCH); }
  else if (es.phase === 'surf') drawSurfScene(ctx, state, es.t);
  else if (es.phase === 'family') drawFamilyScene(ctx, state, rt, es.t, 0);
  else if (es.phase === 'crush') drawFamilyScene(ctx, state, rt, FAMILY_FRAMES, es.t);
};

/** SKIP >> while the scene can be skipped (from the blast out of the cistern to the ruins). */
export const drawEscapeSkip = (ctx: Ctx, rt: TommyRuntime) => { if (inSkippable(rt.escape) && rt.escape.sceneT > SKIP_AFTER) drawSkipPrompt(ctx, W); };

/** A manhole cover, spinning (edge-on and face-on as it turns), at (x, y): cast iron, its rim's thickness under it, rings and a grid on its face, lit along the top. */
const drawCover = (ctx: Ctx, x: number, y: number, spin: number, s = 1) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const ry = 6 + Math.abs(Math.sin(spin)) * 16, face = Math.abs(Math.sin(spin));
  ink(ctx, () => ctx.ellipse(0, 3, 22, ry, 0, 0, Math.PI * 2), '#292524', 1.4);
  ink(ctx, () => ctx.ellipse(0, 0, 22, ry, 0, 0, Math.PI * 2), '#44403C', 1.4);
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 22, ry, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#57534E'; ctx.fillRect(-22, -ry, 44, ry * 0.5);
  if (face > 0.35) {
    ctx.fillStyle = '#292524'; for (let gx = -15; gx <= 15; gx += 6) ctx.fillRect(gx, -ry, 2, ry * 2);
    ctx.strokeStyle = '#292524'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 15, ry * 0.68, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, 0, 21, ry - 1, 0, Math.PI * 1.1, Math.PI * 1.55); ctx.stroke();
  ctx.restore();
};

/** A street across a cut scene: asphalt with grit in it, the curb and sidewalk (lit, slab joints), the center line going by. */
const sceneStreet = (ctx: Ctx, curb: number, road: number, line: number, scroll = 0) => {
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(-20, road, W + 40, H - road + 20);
  checker(ctx, -20, road, W + 40, H - road + 20, 'rgba(0, 0, 0, 0.1)');
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'; ctx.fillRect(-20, road, W + 40, 6);
  ctx.fillStyle = 'rgba(161, 161, 170, 0.35)'; for (let i = 0; i < 60; i++) ctx.fillRect(((hash(i) * (W + 40) - scroll) % (W + 40) + W + 40) % (W + 40) - 20, road + 10 + hash(i * 3) * (H - road - 10), 2, 1);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(-20, curb, W + 40, road - curb);
  ctx.fillStyle = '#C8C3BE'; ctx.fillRect(-20, curb, W + 40, 2);
  ctx.fillStyle = '#78716C'; ctx.fillRect(-20, road - 3, W + 40, 2);
  ctx.fillStyle = INK; ctx.fillRect(-20, road - 1, W + 40, 1);
  ctx.fillStyle = '#6E6863'; for (let x = -((scroll) % 48); x < W; x += 48) ctx.fillRect(x, curb, 1, road - curb - 3);
  for (let x = -((scroll) % 90); x < W; x += 90) { ctx.fillStyle = '#FDE68A'; ctx.fillRect(x, line, 50, 5); ctx.fillStyle = '#D4B860'; ctx.fillRect(x, line + 4, 50, 1); }
};

/**
 * The street at the foot of the tower, dusk: a manhole in the road. It shudders, then the cover blasts up out of it
 * spinning, a geyser of the stuff after it, and him after that, up out of the top of the screen.
 */
const drawLaunchScene = (ctx: Ctx, state: GameState, tt: number) => {
  // (first the hazmat man at his tests over the manhole: t counts from the blast, negative before it)
  const t = tt - PRE;
  const rumble = tt > RUMBLE_AT && t < 0;
  const shake = rumble ? (Math.random() - 0.5) * 2 : t < 0 ? 0 : t >= 8 && t < 26 ? (Math.random() - 0.5) * 14 : t >= 34 && t < 46 ? (Math.random() - 0.5) * 8 : t < 8 ? (Math.random() - 0.5) * 3 : 0;
  ctx.save(); ctx.translate(shake, shake * 0.6);
  drawStreetSky(ctx, { ...state, camera: { x: COURSE.road.x2 - 400, y: GROUND_Y - 550 } } as GameState, 0.85, true);
  // The road, the curb, a house or two across it
  sceneStreet(ctx, 458, 470, 540);
  drawHouse(ctx, 120, 458, 0.9, 0);
  drawHouse(ctx, 640, 458, 0.85, 3);
  // The manhole
  const mx = 400, my = 500;
  ink(ctx, () => ctx.ellipse(mx, my, 38, 12, 0, 0, Math.PI * 2), '#57534E', 1);
  ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.ellipse(mx, my, 34, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0C0A09'; ctx.beginPath(); ctx.ellipse(mx, my + 2, 30, 7, 0, 0, Math.PI * 2); ctx.fill();
  if (t < 0) drawCover(ctx, mx + (rumble ? (Math.random() - 0.5) * 2 : 0), my - 2 - (rumble ? Math.random() * 2 : 0), 0, 1.5);
  else if (t < 8) drawCover(ctx, mx + (Math.random() - 0.5) * 3, my - 2 - Math.random() * 3, 0, 1.5);
  // The hazmat man, crouched on the cover with his kit: a test tube held up to the light, the meter by his knee
  if (t < 8) hazmatAtWork(ctx, mx, my - 2, tt, rumble);
  else hazmatGone(ctx, mx, my, t);
  // The cover, blasted up spinning
  if (t >= 8) { const k = (t - 8) * 26; if (my - k > -60) drawCover(ctx, mx, my - k, t * 0.8, 1.5); }
  // The geyser after it
  if (t >= 8) {
    const h = Math.min(1, (t - 8) / 8) * (my + 60);
    ctx.fillStyle = '#3F6212'; ctx.fillRect(mx - 24, my - h, 48, h);
    ctx.fillStyle = '#65A30D'; ctx.fillRect(mx - 22, my - h, 44, h);
    ctx.fillStyle = '#84CC16'; ctx.fillRect(mx - 16, my - h, 32, h);
    checker(ctx, mx - 18, my - h, 2, h, '#84CC16'); checker(ctx, mx + 16, my - h, 2, h, '#84CC16', 1);
    ctx.fillStyle = '#BEF264'; ctx.fillRect(mx - 10, my - h, 20, h);
    ctx.fillStyle = '#ECFCCB'; ctx.fillRect(mx - 6, my - h, 4, h);
    ctx.fillStyle = 'rgba(236, 252, 203, 0.7)'; for (let i = 0; i < 6; i++) { const sy = my - ((t * 30 + i * 61) % Math.max(1, h)); ctx.fillRect(mx - 14 + i * 5, sy - 18, 2, 18); }
    for (let i = 0; i < 12; i++) { const q = ((t * 3 + i * 9) % 30) / 30; ctx.fillStyle = `rgba(190, 242, 100, ${1 - q})`; ctx.beginPath(); ctx.arc(mx + (i % 2 ? 1 : -1) * (24 + q * 70), my - q * 40, 5, 0, Math.PI * 2); ctx.fill(); }
  }
  // Him, after it, in his suit, arms up
  if (t >= 34) { const y = my - (t - 34) * 30; if (y > -100) { suitedMan(ctx, mx, y, 1.6, Math.sin(t) * 0.1); ctx.strokeStyle = 'rgba(250, 204, 21, 0.5)'; ctx.lineWidth = 3; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(mx + i * 12, y + 10); ctx.lineTo(mx + i * 12, y + 90); ctx.stroke(); } } }
  ctx.restore();
  if (t >= 8 && t < 12) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(0, 0, W, H); }
  // (a moment of black in, and out: the cut)
  if (tt < 4) { ctx.fillStyle = `rgba(0,0,0,${1 - tt / 4})`; ctx.fillRect(0, 0, W, H); }
};

/** The hazmat man from the road, crouched over the manhole doing his tests: the suit, the mask, a test tube up to the light, the meter, the clipboard. */
const hazmatAtWork = (ctx: Ctx, x: number, y: number, t: number, rumble: boolean) => {
  ctx.save(); ctx.translate(x - 8, y);
  const s = 1.6; ctx.scale(s, s);
  // (the city's kit, as on the road: see drawCityWorker)
  // (crouched: the legs folded under him, the boots)
  ctx.fillStyle = CITY_SUIT; ctx.fillRect(-12, -14, 24, 12);
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-14, -6, 9, 6);
  ctx.fillStyle = CITY_SUIT; ctx.fillRect(-12, -40, 22, 28);
  ctx.fillStyle = CITY_VEST; ctx.fillRect(-12, -38, 22, 18);
  ctx.fillStyle = CITY_BAND; ctx.fillRect(-12, -33, 22, 2); ctx.fillRect(-12, -26, 22, 2);
  ctx.fillStyle = CITY_CREASE; ctx.fillRect(-12, -18, 22, 3);
  // (the hood, the clear mask with his face in it, the filters, the hard hat)
  ctx.fillStyle = CITY_SUIT; ctx.beginPath(); ctx.arc(0, -48, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.roundRect(0, -54, 12, 11, 3); ctx.fill();
  ctx.fillStyle = '#E0AC69'; ctx.fillRect(2, -52, 8, 7);
  ctx.fillStyle = '#111827'; ctx.fillRect(7, -50, 2, 2);
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(3, -52, 1, 6);
  ctx.fillStyle = CITY_FILTER; ctx.beginPath(); ctx.arc(4, -41, 2.6, 0, Math.PI * 2); ctx.arc(10, -42, 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(0, -55, 10, Math.PI, 0); ctx.fill(); ctx.fillRect(-11, -56, 24, 3);
  ctx.fillStyle = CITY_BLUE; ctx.fillRect(2, -62, 5, 4);
  // (his arm up, the test tube in his glove, glowing green, him tilting it to look)
  const tilt = Math.sin(t * 0.05) * 0.3;
  ctx.save(); ctx.translate(8, -34); ctx.rotate(-1.1 + tilt * 0.3); ctx.fillStyle = CITY_SUIT; ctx.fillRect(0, -3, 16, 6); ctx.fillStyle = CITY_BLUE; ctx.fillRect(13, -3.5, 5, 7); ctx.restore();
  ctx.save(); ctx.translate(18, -48); ctx.rotate(tilt);
  ctx.fillStyle = 'rgba(224, 242, 254, 0.8)'; ctx.fillRect(-1.5, -10, 3, 12);
  ctx.fillStyle = '#A3E635'; ctx.fillRect(-1.5, -4, 3, 6);
  ctx.fillStyle = 'rgba(163, 230, 53, 0.35)'; ctx.beginPath(); ctx.arc(0, -1, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // (the meter on the cover by his knee: the needle twitching, more and more as it starts to rumble)
  ctx.fillStyle = '#27272A'; ctx.fillRect(-26, -10, 12, 9);
  ctx.fillStyle = '#FEF3C7'; ctx.fillRect(-25, -9, 10, 5);
  const needle = rumble ? Math.sin(t * 1.3) * 0.9 : Math.sin(t * 0.2) * 0.2;
  ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-20, -4); ctx.lineTo(-20 + Math.sin(needle) * 5, -4 - Math.cos(needle) * 5); ctx.stroke();
  if (rumble && Math.floor(t / 6) % 2) { ctx.fillStyle = '#EF4444'; ctx.fillRect(-16, -9, 2, 2); }
  // (the clipboard on the road beside him)
  ctx.fillStyle = '#92400E'; ctx.fillRect(14, -6, 10, 6); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(15, -5, 8, 4);
  ctx.restore();
};

/** What's left of him once the cover's come up through him: him in bits, going up with it, and down all round. */
const hazmatGone = (ctx: Ctx, x: number, y: number, t: number) => {
  const s = t - 8;
  for (let i = 0; i < 16; i++) {
    const a = -Math.PI / 2 + (((i * 37) % 17) / 17 - 0.5) * 2.2, sp = 7 + ((i * 13) % 9);
    const px = x + Math.cos(a) * sp * s, py = y - 40 + Math.sin(a) * sp * s + 0.45 * s * s;
    if (py > 640) continue;
    ctx.save(); ctx.translate(px, py); ctx.rotate(s * 0.3 + i);
    if (i % 4 === 0) { ctx.fillStyle = CITY_VEST; ctx.fillRect(-8, -5, 16, 10); ctx.fillStyle = CITY_BAND; ctx.fillRect(-8, -1, 16, 2); ctx.fillStyle = '#B91C1C'; ctx.fillRect(-8, 3, 16, 3); }
    else if (i % 4 === 1) { ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill(); }
    else if (i % 4 === 2) { ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-3, -3, 6, 6); }
    else { ctx.fillStyle = CITY_SUIT; ctx.fillRect(-4, -9, 8, 18); ctx.fillStyle = CITY_BLUE; ctx.fillRect(-4, 7, 8, 5); }
    ctx.restore();
  }
  // (his hard hat, the clipboard: up and over, spinning)
  const spin = (px: number, py: number, draw: () => void) => { ctx.save(); ctx.translate(px, py); ctx.rotate(s * 0.25); draw(); ctx.restore(); };
  spin(x - 30 - s * 4, y - 60 - s * 14 + 0.45 * s * s, () => { ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(0, 0, 14, Math.PI, 0); ctx.fill(); ctx.fillRect(-16, -2, 32, 4); ctx.fillStyle = CITY_BLUE; ctx.fillRect(-3, -10, 7, 6); });
  spin(x + 40 + s * 5, y - 50 - s * 12 + 0.45 * s * s, () => { ctx.fillStyle = '#92400E'; ctx.fillRect(-12, -9, 24, 18); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-10, -7, 20, 14); });
  // (and him, all over the road)
  ctx.fillStyle = 'rgba(153, 27, 27, 0.85)';
  for (let i = 0; i < 9; i++) { const bx = x + ((i * 53) % 260) - 130, r = 4 + ((i * 7) % 10); ctx.beginPath(); ctx.ellipse(bx, y + 18 + ((i * 11) % 30), r * 1.6, r * 0.5, 0, 0, Math.PI * 2); ctx.fill(); }
};

/** A little house on the block (its door at x, its floor at y): walls (siding, the shade side dithered), a shingled roof, windows lit and framed, the door, a porch light. */
const HOUSE_COLORS = ['#9E6B5C', '#7D8C9E', '#B8A27A', '#7C9A6E', '#A7766C', '#8B7FA3'];
const drawHouse = (ctx: Ctx, x: number, y: number, s: number, seed: number) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const wall = HOUSE_COLORS[seed % HOUSE_COLORS.length], roofC = ['#3F2A1D', '#4B5563', '#57534E'][seed % 3];
  ctx.fillStyle = wall; ctx.fillRect(-80, -110, 160, 110);
  checker(ctx, 30, -110, 50, 110, 'rgba(0, 0, 0, 0.16)');
  ctx.fillStyle = 'rgba(0,0,0,0.14)'; for (let yy = -104; yy < 0; yy += 9) ctx.fillRect(-80, yy, 160, 1);
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; for (let yy = -103; yy < 0; yy += 9) ctx.fillRect(-80, yy, 160, 1);
  ctx.fillStyle = lite(wall, 0.3); ctx.fillRect(-80, -110, 3, 110);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-80, -110, 160, 5);
  ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(-80, -110, 160, 110);
  const roof = () => { ctx.moveTo(-94, -108); ctx.lineTo(0, -168); ctx.lineTo(94, -108); ctx.closePath(); };
  ctx.beginPath(); roof(); ctx.fillStyle = roofC; ctx.fill();
  ctx.save(); ctx.beginPath(); roof(); ctx.clip();
  for (let ry = -114, row = 0; ry > -170; ry -= 7, row++) { ctx.fillStyle = dark(roofC, 0.35); ctx.fillRect(-94, ry, 188, 1); ctx.fillStyle = lite(roofC, 0.12); ctx.fillRect(-94, ry + 1, 188, 1); for (let sx = -94 + (row % 2) * 6; sx < 94; sx += 12) ctx.fillRect(sx, ry + 1, 1, 6); }
  ctx.fillStyle = 'rgba(255, 230, 190, 0.12)'; ctx.beginPath(); ctx.moveTo(0, -168); ctx.lineTo(-94, -108); ctx.lineTo(0, -108); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.beginPath(); roof(); ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.fillStyle = '#E7E5E4'; ctx.fillRect(-94, -110, 188, 3);
  for (const wx of [-62, 28]) {
    ink(ctx, () => ctx.rect(wx - 3, -89, 40, 34), '#E7E5E4', 1);
    ctx.fillStyle = '#FDE68A'; ctx.fillRect(wx, -86, 34, 28);
    ctx.fillStyle = '#F59E0B'; ctx.fillRect(wx, -86, 34, 6); checker(ctx, wx, -80, 34, 2, '#F59E0B');
    ctx.fillStyle = '#FEF9C3'; ctx.fillRect(wx + 3, -74, 6, 4);
    ctx.fillStyle = '#44403C'; ctx.fillRect(wx, -73, 34, 2); ctx.fillRect(wx + 16, -86, 2, 28);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(wx - 3, -55, 40, 3);
  }
  ink(ctx, () => ctx.rect(-14, -58, 28, 58), '#5B3A29', 1.2);
  ctx.fillStyle = '#4A2E20'; ctx.fillRect(-10, -54, 9, 20); ctx.fillRect(1, -54, 9, 20); ctx.fillRect(-10, -30, 9, 24); ctx.fillRect(1, -30, 9, 24);
  ctx.fillStyle = '#7A5038'; ctx.fillRect(-13, -57, 2, 56);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(8, -30, 3, 3);
  steppedGlow(ctx, 20.5, -57, 12, '#FEF3C7', 0.35, 0.05, 3);
  ink(ctx, () => ctx.rect(18, -60, 5, 6), '#FEF3C7', 0.8);
  ctx.restore();
};

/**
 * The tower: the cover through its tank (the town's water jetting out of the hole), him slamming into it after (a dent,
 * a CLANG, him bouncing off it), and over it goes, onto the next block over: slow at first, then all at once, the tank
 * bursting as it hits and the water going out of it in a wave. A push in the whole time, a punch at every impact.
 */
const drawTowerScene = (ctx: Ctx, state: GameState, t: number) => {
  const tx = 330, ty = 540, s = 1.45;
  // Over it goes: a shudder, then faster and faster (to the right: onto the block over there)
  const lean = clamp01((t - MAN_HIT - 10) / (TOWER_DOWN - MAN_HIT - 10));
  const tilt = t > MAN_HIT ? lean * lean * lean * 1.35 + (t < MAN_HIT + 30 ? Math.sin(t * 0.9) * 0.015 : 0) : 0;
  const punch = (at: number) => (t >= at && t < at + 22 ? Math.sin(((t - at) / 22) * Math.PI) : 0);
  const zoom = 1 + Math.min(t, TOWER_DOWN) / TOWER_DOWN * 0.08 + punch(COVER_HIT) * 0.1 + punch(MAN_HIT) * 0.08 + punch(TOWER_DOWN) * 0.12;
  const shakeK = Math.max(punch(COVER_HIT) * 16, punch(MAN_HIT) * 14, punch(TOWER_DOWN) * 26, t > MAN_HIT + 20 && t < TOWER_DOWN ? lean * 5 : 0);
  const sx = (Math.random() - 0.5) * shakeK, sy = (Math.random() - 0.5) * shakeK;
  ctx.save();
  ctx.translate(W / 2 + sx, H * 0.55 + sy); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -H * 0.55);
  drawStreetSky(ctx, { ...state, camera: { x: COURSE.road.x2 + t * 4, y: GROUND_Y - 550 } } as GameState, 0.85, false);
  // The block over there it's going to come down on
  for (let i = 0; i < 4; i++) drawHouse(ctx, 560 + i * 130, 560, 0.55, i + 2);
  if (t > MAN_HIT + 30) for (let i = 0; i < 6; i++) { const q = ((t * 1.3 + i * 20) % 90) / 90; ctx.fillStyle = `rgba(120, 100, 90, ${0.5 * (1 - q)})`; ctx.beginPath(); ctx.arc(tx - 60 + i * 24 + q * 30 * (i % 2 ? 1 : -1), ty - q * 40, 10 + q * 20, 0, Math.PI * 2); ctx.fill(); }
  const down = t >= TOWER_DOWN;
  if (!down) drawWaterTower(ctx, tx, ty, s, 0.85, tilt, t >= COVER_HIT);
  else {
    // Down across the block, the tank burst open, the wave going out of it
    drawWaterTower(ctx, tx, ty, s, 0.85, 1.35, true);
    const k = clamp01((t - TOWER_DOWN) / 30);
    ctx.fillStyle = 'rgba(92, 104, 36, 0.9)';
    ctx.beginPath(); ctx.moveTo(560, 580); ctx.quadraticCurveTo(620 + k * 200, 560 - 180 * k, 700 + k * 400, 560 - 120 * k); ctx.lineTo(W + 60, 600); ctx.lineTo(560, 620); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 14; i++) { const q = ((t * 3 + i * 13) % 40) / 40; ctx.fillStyle = `rgba(217, 249, 157, ${0.8 * (1 - q)})`; ctx.beginPath(); ctx.arc(620 + i * 30 + q * 60, 540 - 120 * k - q * 50 + (i % 3) * 20, 6 + q * 8, 0, Math.PI * 2); ctx.fill(); }
  }
  const tank = (u: number) => ({ x: tx + (-20 * Math.cos(u) + 196 * Math.sin(u)) * s, y: ty + (-196 * Math.cos(u) - 20 * Math.sin(u)) * s });
  const hole = tank(tilt);
  // The water jetting out of the hole
  if (t >= COVER_HIT && !down) {
    const k = clamp01((t - COVER_HIT) / 12);
    ctx.strokeStyle = 'rgba(120, 140, 60, 0.9)'; ctx.lineWidth = 22 * k; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hole.x, hole.y); ctx.quadraticCurveTo(hole.x - 140, hole.y - 30, hole.x - 210, H + 40); ctx.stroke();
    ctx.fillStyle = 'rgba(190, 200, 120, 0.8)';
    for (let i = 0; i < 16; i++) { const q = ((t * 4 + i * 23) % 100) / 100; ctx.fillRect(hole.x - q * 210 - 10 + Math.sin(i * 3) * 18 * q, hole.y + q * q * (H - hole.y) - 10, 5, 5); }
  }
  // The hits: a flash and a ring, shards flying
  for (const at of [COVER_HIT, MAN_HIT]) if (t >= at && t < at + 45 && !down) {
    const k = (t - at) / 45, c = at === COVER_HIT ? hole : tank(tilt * 0.5);
    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - k})`; ctx.lineWidth = 6 * (1 - k);
    ctx.beginPath(); ctx.arc(c.x, c.y, 20 + k * 180, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#8E9AAB';
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + 0.3, d = k * (120 + (i % 3) * 60); ctx.save(); ctx.translate(c.x + Math.cos(a) * d, c.y + Math.sin(a) * d + k * k * 160); ctx.rotate(t * 0.4 + i); ctx.fillRect(-6, -3, 12, 6); ctx.restore(); }
  }
  // The cover: up out of the bottom of the screen at the tank (then, through it, dropping away on the far side)
  if (t < COVER_HIT) {
    const k = clamp01(t / COVER_HIT);
    drawCover(ctx, 120 + (hole.x - 120) * k, H + 60 - (H + 60 - hole.y) * (1 - (1 - k) * (1 - k)), t * 0.7, 1.2);
  } else if (!down) drawCover(ctx, hole.x + (t - COVER_HIT) * 3, hole.y + (t - COVER_HIT) ** 2 * 0.08, t * 0.5, 1.2);
  // Him: blasted up after it, straight into the side of the tank, and off it
  if (t > 15 && !down) {
    const hit = tank(0);
    if (t < MAN_HIT) {
      const k = clamp01((t - 15) / (MAN_HIT - 15));
      suitedMan(ctx, 90 + (hit.x - 30 - 90) * k, H + 80 - (H + 80 - hit.y - 40) * (1 - (1 - k) * (1 - k)), 1.2, t * 0.35);
    } else {
      // (splatted against it a moment, then off, falling back, tumbling)
      const u = t - MAN_HIT;
      const x = hit.x - 30 - u * 1.2, y = hit.y + 40 + (u > 10 ? (u - 10) ** 2 * 0.05 : 0);
      ctx.save(); ctx.translate(x, y); ctx.scale(u < 10 ? 0.7 : 1, 1); suitedMan(ctx, 0, 0, 1.2, u < 10 ? 0 : (u - 10) * -0.2); ctx.restore();
      if (u < 30) {
        const k = u / 30;
        ctx.save(); ctx.translate(hit.x + 40, hit.y - 40); ctx.rotate(-0.2); ctx.scale(1 + k * 0.4, 1 + k * 0.4);
        ctx.fillStyle = `rgba(253, 224, 71, ${1 - k})`; ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 22 : 44; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill();
        ctx.fillStyle = `rgba(28, 25, 23, ${1 - k})`; ctx.font = 'bold 13px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('CLANG', 0, 6); ctx.textAlign = 'left';
        ctx.restore();
      }
    }
  }
  ctx.restore();
  if ((t > COVER_HIT && t < COVER_HIT + 5) || (t > TOWER_DOWN && t < TOWER_DOWN + 8)) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(0, 0, W, H); }
  // (out to white as the wave goes)
  if (t > TOWER_FRAMES - LAUNCH - 14) { ctx.fillStyle = `rgba(255,255,255,${(t - (TOWER_FRAMES - LAUNCH - 14)) / 14})`; ctx.fillRect(0, 0, W, H); }
  bubble(ctx, state, 'meathead', 260, 150);
};

/**
 * Down the street on the front of the wave: him on the cover up on its crest, in his suit, riding it (knees bent, arms
 * out); the block going by, and every house the wave reaches lifted, tipped over into it and melting away (a skeleton
 * or two bobbing up out of it); junk in the wave behind him.
 */
const drawSurfScene = (ctx: Ctx, state: GameState, t: number) => {
  const f = state.frame;
  drawStreetSky(ctx, { ...state, camera: { x: COURSE.road.x2 + 2000 + t * 3, y: GROUND_Y - 550 } } as GameState, 0.9, false);
  const scroll = t * 7;
  // The street, going by
  sceneStreet(ctx, 488, 500, 560, scroll);
  const crestX = 360 + Math.sin(t * 0.05) * 20;
  // The houses: every 280 along, reached by the wave and gone
  for (let i = 0; i < 12; i++) {
    const hx = 600 + i * 280 - scroll;
    if (hx < -200 || hx > W + 200) continue;
    const e = clamp01((crestX + 90 - hx) / 220);
    ctx.save();
    // (seen through the water as it goes under: tipping, sinking, going green and melting away)
    if (e > 0) { ctx.translate(hx, 488); ctx.rotate(-e * 0.6); ctx.translate(-hx, -488 - e * 20 + e * e * 60); ctx.globalAlpha = 1 - e * 0.75; }
    drawHouse(ctx, hx, 488, 0.95, i);
    ctx.restore();
    if (e > 0 && e < 1) {
      // Melting: smoke and bubbles off it, a skeleton coming up out of it
      for (let k = 0; k < 4; k++) { const q = ((f * 0.8 + k * 20 + i * 7) % 60) / 60; ctx.fillStyle = `rgba(163, 190, 120, ${0.5 * (1 - q)})`; ctx.beginPath(); ctx.arc(hx - 60 + k * 40, 400 - q * 120, 12 + q * 20, 0, Math.PI * 2); ctx.fill(); }
      if (i % 2 === 0) skeleton(ctx, hx + 30, 470 - e * 60, 0.8, e * 2);
    }
  }
  // Folk out on the street and their dogs: running for it (not fast enough), then caught up, tumbling over into the
  // wave, melting down to the bone
  for (let i = 0; i < 16; i++) {
    const dog = i % 3 === 1;
    const wx = 480 + i * 170 + (i % 2) * 60 + t * (dog ? 3.2 : 2.2);
    const px = wx - scroll;
    if (px < -100 || px > W + 60) continue;
    const e = clamp01((crestX + 50 - px) / 140);
    const run = Math.sin(f * 0.6 + i) * 5;
    ctx.save();
    if (e > 0) {
      // Swept up into it: lifted, tumbling back, going under
      ctx.translate(px - e * 120, 510 - Math.sin(e * Math.PI) * 140 + e * e * 60);
      ctx.rotate(-e * 5 - i);
      ctx.globalAlpha = 1 - e * 0.6;
    } else ctx.translate(px, 510);
    if (dog) {
      // (a dog flat out: legs going, ears back, tail out, inked and lit along its back)
      const coat = ['#78350F', '#A16207', '#1C1917'][i % 3];
      for (const lx of [-12 + run * 0.5, 8 - run * 0.5]) shaded(ctx, () => ctx.rect(lx, -8, 4, 8), dark(coat, 0.15), lx, -8, 4, 8, 1);
      ink(ctx, () => { ctx.moveTo(-14, -12); ctx.lineTo(-20, -18); ctx.lineTo(-17, -19); ctx.lineTo(-12, -15); ctx.closePath(); }, coat, 1);
      shadedTop(ctx, () => ctx.roundRect(-14, -17, 28, 11, 4), coat, -14, -17, 28, 11, 1);
      shadedTop(ctx, () => ctx.roundRect(9, -23, 12, 10, 3), coat, 9, -23, 12, 10, 1);
      ink(ctx, () => ctx.rect(19, -18, 5, 4), dark(coat, 0.2), 0.8);
      ink(ctx, () => { ctx.moveTo(11, -22); ctx.lineTo(8, -27); ctx.lineTo(14, -23); ctx.closePath(); }, dark(coat, 0.3), 0.8);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(15, -21, 2, 2); ctx.fillStyle = INK; ctx.fillRect(16, -21, 1, 1);
      if (e > 0) { ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(-12, -15, 24, 7); ctx.strokeStyle = '#E7E5D6'; ctx.lineWidth = 1.5; ctx.strokeRect(-12, -15, 24, 7); }
    } else {
      const shirt = ['#DC2626', '#2563EB', '#F59E0B', '#7C3AED', '#0D9488'][i % 5], skin = ['#E0AC69', '#8D5524', '#C68642', '#F2C9A0'][i % 4];
      // (arms up, running for it, screaming)
      drawPerson(ctx, 0, 0, {
        skin, hair: { style: (['short', 'long', 'curly', 'bald', 'pony'] as const)[i % 5], color: ['#111827', '#3F2A1D', '#78350F', '#A16207'][i % 4] },
        top: { style: (['tee', 'shirt', 'hoodie', 'tank'] as const)[i % 4], color: shirt }, legs: { color: '#1F2937' }, shoes: '#F8FAFC',
      }, { arms: 'panic', walk: f * 0.6 + i, stride: 1, mouth: 'open', f }, 1, 1);
      if (e > 0.3) skeleton(ctx, 0, 0, 0.88, (e - 0.3) * 2); // (their size: the skull where their head is)
    }
    ctx.restore();
    // (and they're screaming)
    if (!dog && e === 0 && px < crestX + 260 && i % 2 === 0) { ctx.save(); ctx.font = 'bold 7px "Press Start 2P"'; ctx.fillStyle = '#FEF9C3'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeText('AAAH!', px - 16, 440); ctx.fillText('AAAH!', px - 16, 440); ctx.restore(); }
  }
  // The wave: a wall of it from the left up to the crest, curling over, foam along the top, junk in it
  // (a bit smaller, and see-through: everything it's run into tumbling and melting in it)
  const top = 330 + Math.sin(t * 0.08) * 8;
  ctx.fillStyle = 'rgba(92, 104, 36, 0.58)';
  ctx.beginPath(); ctx.moveTo(-20, H); ctx.lineTo(-20, top - 20);
  for (let x = -20; x <= crestX; x += 20) ctx.lineTo(x, top - 20 + Math.sin(x * 0.03 + t * 0.2) * 10);
  ctx.quadraticCurveTo(crestX + 64, top - 24, crestX + 48, top + 46);
  ctx.quadraticCurveTo(crestX + 88, top + 120, crestX + 128, H);
  ctx.closePath(); ctx.fill();
  // (lighter up at the crest, darker down in the body of it, in bands)
  ctx.strokeStyle = 'rgba(26, 30, 8, 0.6)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.save(); ctx.clip();
  hazeBands(ctx, -20, top - 30, crestX + 160, (H - top) * 0.4, '#84A13A', 0.35, 0, 5);
  hazeBands(ctx, -20, top + (H - top) * 0.4, crestX + 160, (H - top) * 0.6 + 30, '#3A4217', 0, 0.45, 6);
  ctx.restore();
  // (its lip curling over, and foam)
  ctx.fillStyle = 'rgba(217, 249, 157, 0.85)';
  for (let x = -20; x <= crestX + 48; x += 14) ctx.fillRect(x, top - 24 + Math.sin(x * 0.03 + t * 0.2) * 10, 10, 6);
  for (let i = 0; i < 10; i++) { const q = ((t * 3 + i * 11) % 40) / 40; ctx.fillStyle = `rgba(217, 249, 157, ${0.8 * (1 - q)})`; ctx.beginPath(); ctx.arc(crestX + 60 + q * 60, top + 40 + i * 20 - q * 30, 5 + q * 6, 0, Math.PI * 2); ctx.fill(); }
  // Junk tumbling in it: a car, a mailbox, a couch, a skeleton
  for (let i = 0; i < 5; i++) {
    const jx = ((i * 173 + t * 2) % (crestX + 40)), jy = top + 60 + (i * 67) % 200;
    ctx.save(); ctx.translate(jx, jy); ctx.rotate(t * 0.05 + i);
    if (i === 3) skeleton(ctx, 0, 0, 0.6, 1);
    else if (i === 0) { shadedTop(ctx, () => { ctx.moveTo(-18, 4); ctx.lineTo(-18, -2); ctx.lineTo(-8, -3); ctx.lineTo(-3, -8); ctx.lineTo(9, -8); ctx.lineTo(13, -2); ctx.lineTo(18, -1); ctx.lineTo(18, 4); ctx.closePath(); }, '#DC2626', -18, -8, 36, 12, 1); ctx.fillStyle = '#93C5FD'; ctx.fillRect(-2, -7, 5, 4); ctx.fillRect(5, -7, 4, 4); for (const wx of [-10, 10]) ink(ctx, () => ctx.arc(wx, 4, 4, 0, Math.PI * 2), '#1C1917', 1); } // (a car)
    else if (i === 1) { shaded(ctx, () => ctx.rect(-2, 0, 4, 10), '#57534E', -2, 0, 4, 10, 1); shadedTop(ctx, () => ctx.roundRect(-8, -8, 16, 9, [5, 5, 0, 0]), '#1E3A8A', -8, -8, 16, 9, 1); ctx.fillStyle = '#DC2626'; ctx.fillRect(7, -10, 2, 6); } // (a mailbox)
    else if (i === 2) { shaded(ctx, () => ctx.rect(-18, -2, 36, 10), '#65743F', -18, -2, 36, 10, 1); shadedTop(ctx, () => ctx.rect(-16, -9, 32, 8), '#65743F', -16, -9, 32, 8, 1); ink(ctx, () => { ctx.rect(-20, -6, 5, 14); ctx.rect(15, -6, 5, 14); }, '#4D5A2E', 1); } // (a couch)
    else { ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = '#27272A'; ctx.lineWidth = 6; ctx.stroke(); ctx.strokeStyle = '#52525B'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 10, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke(); } // (a tire)
    ctx.restore();
  }
  // Him, on the cover on the crest, riding it
  const bob = Math.sin(t * 0.15) * 6;
  const rx = crestX - 20, ry = top - 26 + bob;
  ctx.save(); ctx.translate(rx, ry); ctx.rotate(-0.12 + Math.sin(t * 0.1) * 0.08);
  drawCover(ctx, 0, 6, 1.4, 1.6);
  ctx.restore();
  suitedMan(ctx, rx, ry, 1.3, -0.1 + Math.sin(t * 0.1) * 0.06);
  // (arms out for balance)
  ctx.save(); ctx.translate(rx, ry - 60); ctx.rotate(Math.sin(t * 0.2) * 0.2); shadedTop(ctx, () => ctx.roundRect(-44, -4, 88, 8, 3), '#FACC15', -44, -4, 88, 8, 1.2); ink(ctx, () => { ctx.arc(-44, 0, 5, 0, Math.PI * 2); }, '#FACC15', 1); ink(ctx, () => { ctx.arc(44, 0, 5, 0, Math.PI * 2); }, '#FACC15', 1); ctx.restore();
  // Spray off the front of it
  for (let i = 0; i < 8; i++) { const q = ((t * 4 + i * 9) % 30) / 30; ctx.fillStyle = `rgba(190, 242, 100, ${0.9 * (1 - q)})`; ctx.fillRect(rx + 30 + q * 80, ry - q * 40 + i * 3, 5, 5); }
  if (t < 12) { ctx.fillStyle = `rgba(255,255,255,${1 - t / 12})`; ctx.fillRect(0, 0, W, H); }
  bubble(ctx, state, 'meathead', rx, ry - 110);
  void SURF_FRAMES;
};

/** A skeleton (bones, grinning), upright at its feet (x, y), `s` big: the bones inked, the skull lit on top. */
const skeleton = (ctx: Ctx, x: number, y: number, s: number, a = 1) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= Math.min(1, a);
  const bones = () => {
    ctx.beginPath();
    ctx.moveTo(0, -58); ctx.lineTo(0, -24); for (let r = -54; r < -30; r += 6) { ctx.moveTo(-10, r); ctx.lineTo(10, r); }
    ctx.moveTo(0, -24); ctx.lineTo(-8, 0); ctx.moveTo(0, -24); ctx.lineTo(8, 0); ctx.moveTo(0, -52); ctx.lineTo(-16, -30); ctx.moveTo(0, -52); ctx.lineTo(16, -30);
  };
  ctx.lineCap = 'round';
  bones(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
  bones(); ctx.strokeStyle = '#E7E5D6'; ctx.lineWidth = 3; ctx.stroke();
  ctx.lineCap = 'butt';
  ink(ctx, () => ctx.arc(0, -70, 12, 0, Math.PI * 2), '#E7E5D6', 1.5);
  ctx.fillStyle = '#FFFFF5'; ctx.fillRect(-6, -80, 6, 3);
  ctx.fillStyle = '#B8B5A0'; ctx.fillRect(-10, -64, 20, 3);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(-6, -74, 4, 4); ctx.fillRect(2, -74, 4, 4); ctx.fillRect(-1, -68, 2, 2); ctx.fillRect(-4, -64, 8, 2);
  ctx.fillStyle = '#E7E5D6'; ctx.fillRect(-2, -64, 1, 2); ctx.fillRect(1, -64, 1, 2);
  ctx.restore();
};

/** The family: the couch, the TV, a nice night in; the room going dark as the tower comes over; then the roof coming in. */
const drawFamilyScene = (ctx: Ctx, state: GameState, rt: TommyRuntime, t: number, crushT: number) => {
  const f = state.frame;
  const dark = clamp01((t - 30) / (FAMILY_FRAMES - 30));
  // The room: wallpaper, a window, a lamp, the rug
  // (wallpaper: stripes and a little sprig between them, darker up under the ceiling; the wainscot, the baseboard)
  bandedGradient(ctx, 0, 0, W, 470, ['#B5A486', '#C9B99A', '#CFC0A2'], 6);
  ctx.fillStyle = 'rgba(160, 120, 80, 0.25)'; for (let x = 0; x < W; x += 40) ctx.fillRect(x, 0, 16, 400);
  ctx.fillStyle = 'rgba(160, 120, 80, 0.4)'; for (let x = 0; x < W; x += 40) ctx.fillRect(x + 7, 0, 2, 400);
  ctx.fillStyle = 'rgba(120, 80, 50, 0.35)'; for (let x = 24; x < W; x += 40) for (let y = 14; y < 400; y += 30) { ctx.fillRect(x + 2, y, 4, 2); ctx.fillRect(x + 3, y - 2, 2, 6); }
  ctx.fillStyle = '#8A6A4A'; ctx.fillRect(0, 400, W, 70); ctx.fillStyle = '#A7835E'; ctx.fillRect(0, 400, W, 3); ctx.fillStyle = '#5B3A29'; ctx.fillRect(0, 403, W, 2);
  ctx.fillStyle = '#6E5236'; for (let x = 0; x < W; x += 50) ctx.fillRect(x, 405, 2, 60);
  ctx.fillStyle = '#4A3424'; ctx.fillRect(0, 462, W, 8); ctx.fillStyle = '#7A5A3E'; ctx.fillRect(0, 462, W, 1);
  // (the floor: boards, lit along one edge)
  ctx.fillStyle = '#7C5A3A'; ctx.fillRect(0, 470, W, 130);
  for (let y = 470; y < H; y += 14) { ctx.fillStyle = '#5E4229'; ctx.fillRect(0, y, W, 1); ctx.fillStyle = '#93704C'; ctx.fillRect(0, y + 1, W, 1); for (let x = ((y / 14) % 3) * 70; x < W; x += 210) { ctx.fillStyle = '#5E4229'; ctx.fillRect(x, y, 1, 14); } }
  // (the rug: inked, a border band, a medallion, the fringe)
  ink(ctx, () => ctx.ellipse(400, 540, 300, 36, 0, 0, Math.PI * 2), '#9F1239', 1.5);
  ctx.strokeStyle = '#FDE68A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(400, 540, 282, 30, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#4C0519'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(400, 540, 268, 26, 0, 0, Math.PI * 2); ctx.stroke();
  ink(ctx, () => ctx.ellipse(400, 540, 90, 12, 0, 0, Math.PI * 2), '#1E3A8A', 1);
  ctx.fillStyle = '#FDE68A'; ctx.beginPath(); ctx.ellipse(400, 540, 40, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#E7E5E4'; for (const side of [-1, 1]) for (let k = -4; k <= 4; k++) ctx.fillRect(400 + side * 300 + side * 2, 540 + k * 4, side * 5, 1);
  // The window: sky, and the tower in it, coming over and filling it
  shaded(ctx, () => ctx.rect(470, 90, 230, 170), '#5B3A29', 470, 90, 230, 170, 1.5);
  ctx.fillStyle = '#7A5038'; ctx.fillRect(472, 92, 226, 2);
  bandedGradient(ctx, 480, 100, 210, 150, ['#7A3F66', '#C2546A', '#F59E4B'], 6);
  // (the wave coming up the street at the window: a green wall rising in it, foam along the top, till it fills it)
  ctx.save(); ctx.beginPath(); ctx.rect(480, 100, 210, 150); ctx.clip();
  const come = dark * dark;
  if (crushT === 0) {
    const wy = 250 - come * 170;
    ctx.fillStyle = '#5C6824'; ctx.fillRect(480, wy, 210, 260);
    ctx.fillStyle = '#84A13A'; ctx.beginPath(); ctx.moveTo(480, wy + 10); for (let x = 480; x <= 690; x += 15) ctx.lineTo(x, wy + Math.sin(x * 0.08 + f * 0.2) * 6); ctx.lineTo(690, wy + 30); ctx.lineTo(480, wy + 30); ctx.fill();
    ctx.fillStyle = 'rgba(217, 249, 157, 0.9)'; for (let x = 480; x <= 690; x += 12) ctx.fillRect(x, wy - 3 + Math.sin(x * 0.08 + f * 0.2) * 6, 8, 4);
    // (a car and a mailbox going by in it)
    ctx.fillStyle = '#DC2626'; ctx.fillRect(500 + (f * 2) % 180, wy + 40, 30, 12); ctx.fillStyle = '#1E3A8A'; ctx.fillRect(620 - (f * 1.3) % 140, wy + 70, 10, 16);
  } else { ctx.fillStyle = '#3A4217'; ctx.fillRect(480, 100, 210, 150); }
  ctx.restore();
  ink(ctx, () => { ctx.rect(582, 100, 6, 150); ctx.rect(480, 172, 210, 6); }, '#5B3A29', 1);
  ctx.fillStyle = '#7A5038'; ctx.fillRect(582, 100, 2, 150); ctx.fillRect(480, 172, 210, 2);
  shadedTop(ctx, () => ctx.rect(462, 258, 246, 8), '#7A5038', 462, 258, 246, 8, 1); // (the sill)
  // The TV (a sitcom, a laugh track) in its wood cabinet, on its stand; a lamp
  shaded(ctx, () => ctx.rect(60, 440, 110, 30), '#44403C', 60, 440, 110, 30, 1);
  ctx.fillStyle = '#292524'; ctx.fillRect(68, 448, 94, 16);
  shaded(ctx, () => ctx.roundRect(40, 330, 150, 110, 6), '#5B3A29', 40, 330, 150, 110, 1.5);
  ink(ctx, () => ctx.rect(48, 338, 134, 92), '#1C1917', 1);
  ctx.fillStyle = f % 60 < 30 ? '#93C5FD' : '#BFDBFE'; ctx.fillRect(50, 340, 130, 88);
  ctx.fillStyle = '#FDE68A'; ctx.beginPath(); ctx.arc(95, 380, 12, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#F472B6'; ctx.beginPath(); ctx.arc(140, 386, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = INK; ctx.fillRect(90, 377, 2, 2); ctx.fillRect(98, 377, 2, 2); ctx.fillRect(136, 383, 2, 2); ctx.fillRect(143, 383, 2, 2); ctx.fillRect(91, 384, 8, 1); ctx.fillRect(137, 390, 7, 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'; for (let y = 340; y < 428; y += 3) ctx.fillRect(50, y, 130, 1); // (scan lines)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'; ctx.fillRect(54, 344, 30, 3); ctx.fillRect(54, 347, 3, 16);
  for (const kx of [100, 120]) ink(ctx, () => ctx.arc(kx, 434, 2, 0, Math.PI * 2), '#A8A29E', 0.8);
  steppedGlow(ctx, 724, 280, 70, '#FDE68A', 0.25, 0, 4);
  shaded(ctx, () => ctx.rect(720, 290, 8, 180), '#78716C', 720, 290, 8, 180, 1);
  ink(ctx, () => ctx.ellipse(724, 470, 18, 4, 0, 0, Math.PI * 2), '#57534E', 1);
  shaded(ctx, () => { ctx.moveTo(700, 290); ctx.lineTo(748, 290); ctx.lineTo(736, 250); ctx.lineTo(712, 250); ctx.closePath(); }, '#FDE68A', 700, 250, 48, 40, 1.2);
  // The couch, and them on it: inked, lit from the lamp's side, the cushions split, the arms rolled
  shadedTop(ctx, () => ctx.roundRect(230, 340, 350, 50, 8), '#65743F', 230, 340, 350, 50, 1.5);
  ctx.fillStyle = '#4D5A2E'; ctx.fillRect(345, 346, 2, 40); ctx.fillRect(460, 346, 2, 40);
  shadedTop(ctx, () => ctx.rect(240, 380, 330, 90), '#65743F', 240, 380, 330, 90, 1.5);
  ctx.fillStyle = '#4D5A2E'; ctx.fillRect(350, 384, 2, 30); ctx.fillRect(460, 384, 2, 30); ctx.fillRect(240, 414, 330, 2);
  ctx.fillStyle = '#7E8F52'; ctx.fillRect(244, 383, 322, 2);
  shaded(ctx, () => ctx.roundRect(220, 370, 30, 100, [10, 10, 2, 2]), '#4D5A2E', 220, 370, 30, 100, 1.5);
  shaded(ctx, () => ctx.roundRect(560, 370, 30, 100, [10, 10, 2, 2]), '#4D5A2E', 560, 370, 30, 100, 1.5);
  const dissolve = clamp01((crushT - 60) / 120);
  const people: [number, string, string, number][] = [[300, '#1D4ED8', '#E0AC69', 1.1], [400, '#BE185D', '#E0AC69', 1.0], [490, '#16A34A', '#E0AC69', 0.75]];
  people.forEach(([x, shirt, skin, s], i) => {
    const laugh = crushT === 0 && t < 200 ? Math.abs(Math.sin(f * 0.3 + i)) * 3 : 0;
    ctx.save(); ctx.translate(x, 420 - laugh); ctx.scale(s, s);
    if (dissolve < 1) {
      ctx.globalAlpha = 1 - dissolve;
      familyMember(ctx, i, shirt, skin, crushT > 0 ? 7 : 3 + laugh, crushT > 0, f);
      ctx.globalAlpha = 1;
    }
    if (crushT > 60) {
      // What's left: the bones, sat just where they were
      ctx.globalAlpha = clamp01((crushT - 60) / 60);
      seatedBones(ctx);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  });
  // The chips, a juice box
  if (crushT === 0) { shaded(ctx, () => ctx.rect(330, 430, 22, 16), '#FACC15', 330, 430, 22, 16, 1); ctx.fillStyle = '#DC2626'; ctx.fillRect(333, 435, 16, 4); shaded(ctx, () => ctx.rect(488, 390, 10, 14), '#F97316', 488, 390, 10, 14, 1); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(494, 386, 1, 4); }
  // Getting dark in here
  ctx.fillStyle = `rgba(20, 16, 30, ${dark * 0.55})`; ctx.fillRect(0, 0, W, H);
  // The wave through the window and the wall round it, filling the room
  if (crushT > 0) {
    const k = clamp01(crushT / 30);
    for (let i = 0; i < 18; i++) {
      const sx = 480 + hash(i) * 210, sy = 100 + hash(i * 3) * 150;
      const dx = (sx - 585) * (1 + k * 3) - k * 120, dy = k * (160 + hash(i * 5) * 300);
      ctx.save(); ctx.translate(585 + dx, sy + dy); ctx.rotate(k * (hash(i * 7) - 0.5) * 8);
      ctx.fillStyle = i % 3 === 0 ? 'rgba(191, 219, 254, 0.8)' : i % 3 === 1 ? '#78716C' : '#5B3A29';
      ctx.fillRect(-10 - hash(i * 9) * 12, -6, 20 + hash(i * 9) * 24, 12);
      ctx.restore();
    }
    const flood = clamp01((crushT - 6) / 50);
    ctx.fillStyle = 'rgba(92, 104, 36, 0.8)';
    ctx.beginPath(); ctx.moveTo(W, 90); ctx.quadraticCurveTo(W - flood * 500, 200, W - flood * 900, H); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    ctx.fillRect(0, H - flood * 300, W, flood * 300);
    ctx.fillStyle = 'rgba(217, 249, 157, 0.6)'; for (let i = 0; i < 12; i++) { const x = (i * 71 + crushT * 5) % W; ctx.beginPath(); ctx.arc(x, H - flood * 300 + 4, 4, 0, Math.PI * 2); ctx.fill(); }
    if (crushT < 8) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(0, 0, W, H); }
    // Close up on them: in it, the skin coming away (sizzling, smoking) from the top down to the bone
    if (crushT > 40) drawBurnCloseUp(ctx, f, crushT);
    const out = clamp01((crushT - (CRUSH_FRAMES - 40)) / 40);
    if (out > 0) { ctx.fillStyle = `rgba(0,0,0,${out})`; ctx.fillRect(0, 0, W, H); }
  }
  bubble(ctx, state, 'dad', 300, 300); bubble(ctx, state, 'mom', 400, 300); bubble(ctx, state, 'kid', 490, 330);
  void rt;
};

/**
 * One of the family, sat on the couch, in the frame their bones are drawn in (head at (0, -88), the shirt -20..20 by
 * -70..-10): Dad (receding, a mustache, a polo), Mom (long auburn hair, bangs, hoops), the kid (a blond bowl cut, a
 * tee); ink round all of it, shaded, faces with eyes and brows; `mouth` how open; screaming, brows up and eyes wide.
 */
const familyMember = (ctx: Ctx, who: number, shirt: string, skin: string, mouth: number, scream: boolean, f: number) => {
  const INKC = '#1A0B06', skinD = '#B07A4F', skinL = '#F0C48F';
  const inked = (path: () => void, fill: string, w = 1.6) => { ctx.beginPath(); path(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = INKC; ctx.lineWidth = w; ctx.stroke(); };
  // Shirt: shaded in steps, a collar, the arms down by their sides, hands in their laps
  ctx.save(); ctx.beginPath(); ctx.roundRect(-20, -70, 40, 60, [10, 10, 3, 3]); ctx.clip();
  ctx.fillStyle = shirt; ctx.fillRect(-22, -72, 44, 64);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)'; ctx.fillRect(-22, -72, 14, 64);
  ctx.fillStyle = 'rgba(26, 11, 6, 0.22)'; ctx.fillRect(8, -72, 14, 64); ctx.fillRect(-22, -20, 44, 12);
  if (who === 2) { ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(0, -46, 7, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#111827'; ctx.fillRect(-3, -48, 2, 2); ctx.fillRect(2, -48, 2, 2); }
  ctx.restore();
  ctx.beginPath(); ctx.roundRect(-20, -70, 40, 60, [10, 10, 3, 3]); ctx.strokeStyle = INKC; ctx.lineWidth = 1.6; ctx.stroke();
  if (who === 0) { inked(() => { ctx.moveTo(-10, -70); ctx.lineTo(0, -60); ctx.lineTo(10, -70); ctx.closePath(); }, '#F8FAFC', 1.2); ctx.fillStyle = INKC; ctx.fillRect(-1, -60, 2, 2); ctx.fillRect(-1, -55, 2, 2); }
  for (const side of [-1, 1]) {
    inked(() => ctx.roundRect(side * 22 - 5, -64, 10, 34, 5), shirt, 1.4);
    inked(() => ctx.ellipse(side * 12, -24, 7, 5, 0, 0, Math.PI * 2), skin, 1.2);
  }
  // Head: shaded, an ear, the neck
  inked(() => ctx.rect(-6, -74, 12, 8), skinD, 1.2);
  ctx.save(); ctx.beginPath(); ctx.arc(0, -88, 18, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = skin; ctx.fillRect(-20, -108, 40, 40);
  ctx.fillStyle = skinD; ctx.fillRect(-20, -108, 8, 40); ctx.fillRect(-20, -76, 40, 6);
  ctx.fillStyle = skinL; ctx.fillRect(4, -102, 8, 6);
  ctx.fillStyle = 'rgba(244, 114, 182, 0.35)'; ctx.fillRect(-12, -84, 6, 3); ctx.fillRect(7, -84, 6, 3);
  ctx.restore();
  ctx.beginPath(); ctx.arc(0, -88, 18, 0, Math.PI * 2); ctx.strokeStyle = INKC; ctx.lineWidth = 1.6; ctx.stroke();
  for (const side of [-1, 1]) inked(() => ctx.ellipse(side * 18, -86, 3, 5, 0, 0, Math.PI * 2), skinD, 1.2);
  // Hair
  if (who === 0) { inked(() => { ctx.arc(0, -92, 18.5, Math.PI * 1.05, Math.PI * 1.32); ctx.lineTo(-10, -98); ctx.closePath(); }, '#3F2A1D', 1.2); inked(() => { ctx.arc(0, -92, 18.5, Math.PI * 1.68, Math.PI * 1.95); ctx.lineTo(10, -98); ctx.closePath(); }, '#3F2A1D', 1.2); ctx.fillStyle = skinL; ctx.fillRect(-4, -106, 8, 3); }
  if (who === 1) {
    inked(() => ctx.roundRect(-23, -100, 10, 40, 4), '#9A3412', 1.4); inked(() => ctx.roundRect(13, -100, 10, 40, 4), '#9A3412', 1.4);
    inked(() => { ctx.ellipse(0, -96, 20, 13, 0, Math.PI, Math.PI * 2); ctx.lineTo(18, -92); ctx.quadraticCurveTo(0, -100, -18, -92); ctx.closePath(); }, '#9A3412', 1.4);
    ctx.fillStyle = '#C2410C'; ctx.fillRect(-8, -106, 12, 2);
    ctx.strokeStyle = '#FACC15'; ctx.lineWidth = 1.6; for (const side of [-1, 1]) { ctx.beginPath(); ctx.arc(side * 19, -78, 4, 0, Math.PI * 2); ctx.stroke(); }
  }
  if (who === 2) { inked(() => { ctx.ellipse(0, -92, 20, 16, 0, Math.PI, Math.PI * 2); ctx.lineTo(19, -90); ctx.lineTo(-19, -90); ctx.closePath(); }, '#FDE047', 1.4); ctx.fillStyle = '#CA8A04'; for (let k = -14; k <= 14; k += 4) ctx.fillRect(k, -92, 2, 3); ctx.fillStyle = '#FEF9C3'; ctx.fillRect(-6, -104, 10, 2); }
  // Eyes: whites, pupils, brows (up and the eyes wide if they're screaming)
  const er = scream ? 4.4 : 3.4;
  for (const ex of [-7, 7]) {
    inked(() => ctx.ellipse(ex, -92, er, scream ? er + 1 : er, 0, 0, Math.PI * 2), '#FFFFFF', 1);
    ctx.fillStyle = INKC; ctx.fillRect(ex - 1, -93, scream ? 2 : 3, scream ? 2 : 3);
    ctx.fillStyle = who === 1 ? '#7C2D12' : who === 2 ? '#CA8A04' : '#3F2A1D';
    ctx.save(); ctx.translate(ex, -99 - (scream ? 3 : 0)); ctx.rotate((ex < 0 ? 1 : -1) * (scream ? -0.3 : 0.1)); ctx.fillRect(-5, -1, 10, 2.4); ctx.restore();
  }
  if (who === 0) { ctx.strokeStyle = INKC; ctx.lineWidth = 1; ctx.strokeRect(-12, -96, 10, 8); ctx.strokeRect(2, -96, 10, 8); ctx.beginPath(); ctx.moveTo(-2, -93); ctx.lineTo(2, -93); ctx.stroke(); }
  if (who === 1) { ctx.fillStyle = INKC; for (const ex of [-7, 7]) { ctx.fillRect(ex - 5, -97, 2, 2); ctx.fillRect(ex + 3, -97, 2, 2); } }
  // Nose, mustache, the mouth
  ctx.fillStyle = skinD; ctx.fillRect(-2, -88, 4, 6);
  if (who === 0) inked(() => ctx.roundRect(-8, -82, 16, 4, 2), '#3F2A1D', 1);
  inked(() => ctx.ellipse(0, -77, 6, Math.max(1.2, mouth), 0, 0, Math.PI * 2), '#7F1D1D', 1.2);
  if (mouth > 3) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-4, -77 - mouth + 1, 8, 2); ctx.fillStyle = '#DC2626'; ctx.fillRect(-3, -77 + mouth - 3, 6, 2); }
  void f;
};

/**
 * The bones of one of them sat on the couch, in their own body's place (the same frame as it: head at -88, the eyes'
 * sockets where the eyes were, the jaw where the mouth was, the spine and ribs down the shirt, the arms down its sides),
 * so the skin burning away off them leaves just what was under it.
 */
const seatedBones = (ctx: Ctx) => {
  const bone = '#E7E5D6';
  ctx.fillStyle = bone; ctx.beginPath(); ctx.arc(0, -90, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-9, -80, 18, 7); // the jaw
  ctx.fillStyle = '#1C1917'; ctx.fillRect(-9, -96, 6, 6); ctx.fillRect(3, -96, 6, 6); ctx.fillRect(-1, -87, 2, 3);
  ctx.fillRect(-7, -78, 14, 1); for (let k = -6; k <= 6; k += 3) ctx.fillRect(k, -80, 1, 5); // the teeth
  ctx.strokeStyle = bone; ctx.lineCap = 'round'; ctx.lineWidth = 4; ctx.beginPath();
  ctx.moveTo(0, -73); ctx.lineTo(0, -17); // the spine
  ctx.moveTo(-16, -66); ctx.lineTo(16, -66); // the collarbones
  ctx.moveTo(-16, -66); ctx.lineTo(-17, -40); ctx.lineTo(-15, -14); ctx.moveTo(16, -66); ctx.lineTo(17, -40); ctx.lineTo(15, -14); // the arms
  ctx.stroke();
  ctx.lineWidth = 3; ctx.beginPath(); for (let r = -60; r <= -33; r += 7) { ctx.moveTo(-13, r + 2); ctx.quadraticCurveTo(0, r - 3, 13, r + 2); } ctx.stroke();
  ctx.fillStyle = bone; ctx.beginPath(); ctx.ellipse(0, -17, 14, 5, 0, 0, Math.PI * 2); ctx.fill(); // the pelvis
  ctx.lineCap = 'butt';
};

/**
 * Close up on the three of them on the couch as the wave eats them: pushed right in, the green stuff over them, and
 * each one's skin burning away from the top down (a line of fizz working down them, smoke coming off), the bones left
 * sat there grinning.
 */
const drawBurnCloseUp = (ctx: Ctx, f: number, crushT: number) => {
  const zin = clamp01((crushT - 40) / 20);
  ctx.save();
  ctx.globalAlpha = zin;
  bandedGradient(ctx, 0, 0, W, H, ['#2A3010', '#3A4217', '#4A5420'], 8);
  shadedTop(ctx, () => ctx.rect(40, 380, 720, 220), '#4D5A2E', 40, 380, 720, 220, 2);
  const burn = clamp01((crushT - 70) / 110);
  const people: [number, string, string, number][] = [[190, '#1D4ED8', '#E0AC69', 2.1], [400, '#BE185D', '#E0AC69', 2.0], [610, '#16A34A', '#E0AC69', 1.6]];
  people.forEach(([x, shirt, skin, sc], i) => {
    ctx.save(); ctx.translate(x, 470); ctx.scale(sc, sc);
    // (their mouths open: screaming)
    const b = clamp01(burn * 1.3 - i * 0.12);
    const cut = -120 + b * 130;
    seatedBones(ctx);
    ctx.save(); ctx.beginPath(); ctx.rect(-40, cut, 80, 200); ctx.clip();
    familyMember(ctx, i, shirt, skin, 8, true, f);
    ctx.restore();
    // The line it's burning along: fizz and smoke
    if (b > 0 && b < 1) {
      ctx.fillStyle = 'rgba(217, 249, 157, 0.9)'; for (let k = 0; k < 8; k++) ctx.fillRect(-22 + k * 6, cut - 2 + Math.sin(f * 0.8 + k) * 2, 4, 4);
      for (let k = 0; k < 3; k++) { const q = ((f * 0.9 + k * 15) % 40) / 40; ctx.fillStyle = `rgba(200, 200, 180, ${0.5 * (1 - q)})`; ctx.beginPath(); ctx.arc(-10 + k * 10, cut - q * 50, 5 + q * 8, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
  });
  // The green stuff over it all, bubbling
  ctx.fillStyle = 'rgba(92, 104, 36, 0.35)'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(217, 249, 157, 0.6)'; for (let i = 0; i < 20; i++) { const q = ((f * 1.5 + i * 17) % 80) / 80; ctx.beginPath(); ctx.arc((i * 47) % W, H - q * H, 3 + (i % 3) * 2, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
};

/** Whoever's talking in a cut scene, over them (screen space). */
const bubble = (ctx: Ctx, state: GameState, who: 'meathead' | 'dad' | 'mom' | 'kid', x: number, y: number) => {
  const rt = (state.stage as TommyRuntime | null);
  if (!rt) return;
  const text = saying(rt.talk, who);
  if (text) drawBubble(ctx, x, y, text, who === 'meathead' ? '#F8FAFC' : '#FEF9C3');
};

// ---------------------------------------------------------------------------
// The ruins
// ---------------------------------------------------------------------------

/** The ground up in the ruins (dirt and rubble), and down at the bottom of the pit (the sewer's floor, and Tommy's door). */
export const drawRuinsGround = (ctx: Ctx, state: GameState) => {
  const bottom = state.camera.y + H + 60;
  for (const r of state.groundRuns) {
    if (r.x2 < state.camera.x - 60 || r.x1 > state.camera.x + W + 60) continue;
    if (r.surface === 'rubble') {
      ctx.fillStyle = '#4A3F35'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 1400);
      bandedGradient(ctx, r.x1, r.y1 + 6, r.x2 - r.x1, 120, ['#4A3F35', '#3A3029', '#2A221C'], 5);
      ctx.fillStyle = '#2A221C'; ctx.fillRect(r.x1, r.y1 + 126, r.x2 - r.x1, 1274);
      checker(ctx, r.x1, r.y1 + 6, r.x2 - r.x1, 120, 'rgba(0, 0, 0, 0.08)');
      for (let x = Math.ceil(r.x1 / 31) * 31; x < r.x2 - 8; x += 31) { const yy = r.y1 + 14 + hash(x * 5) * 90, c = hash(x) > 0.5 ? '#5B4B3E' : '#6B635C'; ink(ctx, () => ctx.rect(x, yy, 6 + hash(x * 2) * 8, 4), c, 0.8); }
      ctx.fillStyle = '#5D6B3A'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 6);
      ctx.fillStyle = '#7A8A4C'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 1);
      checker(ctx, r.x1, r.y1 + 6, r.x2 - r.x1, 2, '#5D6B3A');
      // (the rubble on it: broken brick and block, inked, lit on top)
      for (let x = r.x1; x < r.x2; x += 23) { const rx = x + hash(x) * 10, ry = r.y1 - 4 - hash(x * 3) * 6, rw = 8 + hash(x * 7) * 12, c = hash(x * 11) > 0.6 ? '#7C4A3A' : '#6B635C'; if (rx + rw > r.x2) continue; ink(ctx, () => ctx.rect(rx, ry, rw, 6), c, 0.8); ctx.fillStyle = lite(c, 0.25); ctx.fillRect(rx + 1, ry + 0.5, rw - 2, 1); }
      // The hole's lips: the ground broken off round it
      if (r.x2 === COURSE.ruins.pit) { ctx.fillStyle = '#2A221B'; ctx.fillRect(r.x2 - 16, r.y1, 16, 60); ctx.fillStyle = '#6B635C'; ctx.fillRect(r.x2 - 26, r.y1 - 6, 18, 8); }
      if (r.x1 === COURSE.ruins.pit + COURSE.ruins.pitW) { ctx.fillStyle = '#2A221B'; ctx.fillRect(r.x1, r.y1, 16, 60); ctx.fillStyle = '#6B635C'; ctx.fillRect(r.x1 + 8, r.y1 - 6, 18, 8); }
    } else if (r.surface === 'floor') {
      ctx.fillStyle = '#3F3A36'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, bottom - r.y1);
      checker(ctx, r.x1, r.y1 + 5, r.x2 - r.x1, bottom - r.y1 - 5, 'rgba(0, 0, 0, 0.1)');
      ctx.fillStyle = '#2E2A27'; for (let x = Math.ceil(r.x1 / 64) * 64; x < r.x2; x += 64) ctx.fillRect(x, r.y1 + 5, 2, bottom - r.y1);
      ctx.fillStyle = '#57534E'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 5);
      ctx.fillStyle = '#78716C'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 1); ctx.fillStyle = INK; ctx.fillRect(r.x1, r.y1 + 5, r.x2 - r.x1, 1);
    }
  }
  // The hole down: a narrow shaft from the ruins to the cavern outside Tommy's door
  const P = COURSE.ruins.pit, PW = COURSE.ruins.pitW;
  if (P + 800 > state.camera.x && P - 400 < state.camera.x + W) {
    ctx.fillStyle = '#16110E'; ctx.fillRect(P, RUINS_Y, PW, GROUND_Y - 330 - RUINS_Y);
    checker(ctx, P + 10, RUINS_Y, PW - 20, GROUND_Y - 330 - RUINS_Y, 'rgba(42, 37, 33, 0.35)');
    for (let y = RUINS_Y + 10; y < GROUND_Y - 330; y += 36) for (const [sx, sy] of [[P, y], [P + PW - 10, y + 18]]) { ink(ctx, () => ctx.rect(sx, sy, 10, 26), '#2A2521', 1); ctx.fillStyle = '#3D3530'; ctx.fillRect(sx + 1, sy + 1, 8, 1); }
    ctx.fillStyle = 'rgba(101, 163, 13, 0.3)'; for (let y = RUINS_Y + 80; y < GROUND_Y - 330; y += 220) ctx.fillRect(P + 14, y, 6, 70);
    // The cavern at the bottom: brick, a pipe or two, the door's at the far end of it
    ctx.fillStyle = sewerBrick(ctx, 'tommyCavern', 36, 16, ['#2A2521', '#2E2823', '#26211D'], '#1C1714'); ctx.fillRect(P - 420, GROUND_Y - 330, 900, 330);
    hazeBands(ctx, P - 420, GROUND_Y - 330, 900, 120, '#0C0A09', 0.5, 0, 4);
    hazeBands(ctx, P - 420, GROUND_Y - 80, 900, 80, '#2D3A12', 0, 0.3, 4);
    ctx.fillStyle = INK; ctx.fillRect(P - 420, GROUND_Y - 251, 900, 14);
    ctx.fillStyle = '#4A3B2F'; ctx.fillRect(P - 420, GROUND_Y - 250, 900, 12);
    ctx.fillStyle = '#5B4A3B'; ctx.fillRect(P - 420, GROUND_Y - 249, 900, 6);
    ctx.fillStyle = '#7A6656'; ctx.fillRect(P - 420, GROUND_Y - 248, 900, 1);
    for (let x = P - 400; x < P + 480; x += 150) { ink(ctx, () => ctx.rect(x, GROUND_Y - 253, 8, 18), '#3F3228', 1); ctx.fillStyle = '#6B584A'; ctx.fillRect(x + 1, GROUND_Y - 252, 2, 2); }
    // Its ceiling: a slab of old brick on an iron beam, the hole he came down through the only way up
    for (const [x1, x2] of [[P - 420, P], [P + PW, P + 480]]) {
      ctx.fillStyle = sewerBrick(ctx, 'tommyCavernRoof', 36, 16, ['#2F2723', '#2A231F', '#332B26'], '#231C18'); ctx.fillRect(x1, GROUND_Y - CAVERN_ROOF - 160, x2 - x1, 146);
      ctx.fillStyle = INK; ctx.fillRect(x1, GROUND_Y - CAVERN_ROOF - 15, x2 - x1, 16);
      ctx.fillStyle = '#44403C'; ctx.fillRect(x1, GROUND_Y - CAVERN_ROOF - 14, x2 - x1, 13);
      ctx.fillStyle = '#6B635C'; ctx.fillRect(x1, GROUND_Y - CAVERN_ROOF - 14, x2 - x1, 2);
      ctx.fillStyle = '#2E2A27'; ctx.fillRect(x1, GROUND_Y - CAVERN_ROOF - 4, x2 - x1, 3);
      ctx.fillStyle = '#1C1917'; for (let x = x1 + 30; x < x2 - 10; x += 120) { ctx.fillRect(x, GROUND_Y - CAVERN_ROOF - 14, 10, 14); ctx.fillStyle = '#78716C'; ctx.fillRect(x + 12, GROUND_Y - CAVERN_ROOF - 9, 2, 2); ctx.fillRect(x - 4, GROUND_Y - CAVERN_ROOF - 9, 2, 2); ctx.fillStyle = '#1C1917'; } // (the beam's splices, their rivets)
      ctx.fillStyle = 'rgba(101, 163, 13, 0.35)'; for (let x = x1 + 50; x < x2 - 10; x += 90) ctx.fillRect(x, GROUND_Y - CAVERN_ROOF, 4, 6 + ((x * 7) % 9));
    }
    ctx.fillStyle = '#0C0A09'; ctx.fillRect(P, GROUND_Y - 330, PW, 20);
  }
};

/**
 * What's left of the block: a row of houses washed out and melted (walls down to stumps, a doorframe standing on its own,
 * a bathtub, a fridge on its side, the odd skeleton), theirs among them, the three of them on what's left of the couch,
 * the TV still going; the water, pooled and smoking. Off in the distance, the tower, lying where it came down.
 */
export const drawRuinsHouse = (ctx: Ctx, state: GameState) => {
  const hx = COURSE.ruins.house, y = RUINS_Y, f = state.frame;
  drawWalkPaint(ctx, state);
  drawLairSign(ctx, state);
  if (hx + 1500 < state.camera.x || hx - 1500 > state.camera.x + W) return;
  // The tower, down, off in the distance behind
  ctx.save(); ctx.globalAlpha = 0.55; ctx.translate(hx - 900, y - 40); ctx.rotate(-1.45); drawWaterTower(ctx, 0, 0, 0.7, 0.95, 0, true); ctx.restore();
  // The other houses: washed out and melted
  for (const [dx, seed] of [[-1060, 1], [-560, 4], [720, 2], [1400, 3]] as [number, number][]) wreckedHouse(ctx, hx + dx, y, seed, f);
  // (and an arrow sprayed on what's left of that last one's wall, pointing on)
  paintArrow(ctx, hx + 1400 + 84, y - 44, 44, 0.9);
  // Theirs: what's standing of the walls
  wallStump(ctx, [[hx - 260, y], [hx - 260, y - 150], [hx - 200, y - 120], [hx - 170, y - 170], [hx - 120, y - 90], [hx - 120, y]], '#9E6B5C', y);
  wallStump(ctx, [[hx + 180, y], [hx + 180, y - 110], [hx + 230, y - 160], [hx + 260, y - 70], [hx + 260, y]], '#9E6B5C', y);
  // The couch, and them on it (bones, sat just where they were)
  shadedTop(ctx, () => ctx.rect(hx + 36, y - 52, 128, 18), '#4D5A2E', hx + 36, y - 52, 128, 18, 1.2);
  shadedTop(ctx, () => ctx.rect(hx + 40, y - 34, 120, 34), '#4D5A2E', hx + 40, y - 34, 120, 34, 1.2);
  checker(ctx, hx + 40, y - 20, 120, 20, 'rgba(26, 30, 8, 0.45)'); // (eaten away, the stuffing out)
  ctx.fillStyle = '#D6D3C4'; ctx.fillRect(hx + 70, y - 33, 6, 3); ctx.fillRect(hx + 120, y - 31, 4, 3);
  for (let i = 0; i < 3; i++) {
    const px = hx + 62 + i * 38, s = i === 2 ? 0.75 : 1;
    const bones = () => { ctx.beginPath(); ctx.moveTo(px, y - 60 * s - 5); ctx.lineTo(px, y - 34); for (let r = y - 60 * s; r < y - 38; r += 6) { ctx.moveTo(px - 7, r); ctx.lineTo(px + 7, r); } };
    bones(); ctx.strokeStyle = INK; ctx.lineWidth = 4.5; ctx.stroke();
    bones(); ctx.strokeStyle = '#E7E5D6'; ctx.lineWidth = 2.5; ctx.stroke();
    ink(ctx, () => ctx.arc(px, y - 60 * s - 12, 7 * s, 0, Math.PI * 2), '#E7E5D6', 1.2);
    ctx.fillStyle = '#1C1917'; ctx.fillRect(px - 4 * s, y - 62 * s - 14, 3 * s, 3 * s); ctx.fillRect(px + 1, y - 62 * s - 14, 3 * s, 3 * s);
  }
  // The TV on its side, still on (snow)
  shaded(ctx, () => ctx.roundRect(hx + 190, y - 50, 60, 46, 4), '#3F2A1D', hx + 190, y - 50, 60, 46, 1.2);
  ink(ctx, () => ctx.rect(hx + 196, y - 44, 48, 34), f % 6 < 3 ? '#E5E7EB' : '#9CA3AF', 1);
  checker(ctx, hx + 196, y - 44, 48, 34, f % 6 < 3 ? '#9CA3AF' : '#E5E7EB', (f >> 1) & 1);
  // The water, pooled and smoking, all along the block
  ctx.fillStyle = 'rgba(92, 104, 36, 0.8)';
  for (const [dx, w] of [[-1060, 220], [-560, 240], [0, 300], [720, 160], [1400, 150]] as [number, number][]) { ctx.beginPath(); ctx.ellipse(hx + dx, y - 2, w, 8, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = 'rgba(163, 190, 120, 0.25)'; for (let k = 0; k < 10; k++) { const t = ((f * 0.6 + k * 30) % 150) / 150; ctx.beginPath(); ctx.arc(hx - 1200 + k * 200, y - 10 - t * 100, 8 + t * 18, 0, Math.PI * 2); ctx.fill(); }
};

/** A yellow arrow slopped on with a brush, pointing right (its tip at x + len), `k` how wobbly. */
const paintArrow = (ctx: Ctx, x: number, y: number, len: number, k = 1) => {
  ctx.fillStyle = '#FACC15';
  const sh = len * 0.38;
  ctx.beginPath(); ctx.moveTo(x, y - 3 * k); ctx.lineTo(x + len - sh, y - 2); ctx.lineTo(x + len - sh, y - 8); ctx.lineTo(x + len, y);
  ctx.lineTo(x + len - sh, y + 8); ctx.lineTo(x + len - sh, y + 2); ctx.lineTo(x, y + 3 * k); ctx.closePath(); ctx.fill();
  // (where the brush ran dry, and a drip or two off it)
  ctx.fillStyle = '#A16207'; ctx.fillRect(x + 2, y - 1, len * 0.3, 1);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(x + len * 0.3, y + 2, 2, 5 + 4 * k); ctx.fillRect(x + len - sh + 1, y + 7, 2, 4);
};

/**
 * The walk from the house to the hole: little signs knocked together out of whatever was lying about, stuck in the rubble,
 * each with a yellow arrow slopped on it pointing on, and the yellow paint dribbled the whole way along, big arrows slapped
 * down on the ground every so often. Somebody really wanted you to find the hole.
 */
const drawWalkPaint = (ctx: Ctx, state: GameState) => {
  const R = COURSE.ruins, y = RUINS_Y, f = state.frame;
  const x0 = R.house + 260, x1 = R.pit - 260;
  if (x1 < state.camera.x - 40 || x0 > state.camera.x + W + 40) return;
  // The dribble: dots and dashes along the ground where the can leaked
  ctx.fillStyle = '#FACC15';
  for (let x = x0; x < x1; x += 11) {
    const h = hash(x * 0.37);
    if (h < 0.3) continue;
    ctx.fillRect(x, y - 2, h > 0.7 ? 7 : 3, 2);
    if (h > 0.93) { ctx.beginPath(); ctx.ellipse(x + 3, y - 1, 6 + h * 4, 2, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  // Big arrows on the ground, splashed
  for (const ax of R.arrows) {
    if (ax + 120 < state.camera.x || ax - 60 > state.camera.x + W) continue;
    ctx.fillStyle = '#FACC15';
    ctx.beginPath(); ctx.moveTo(ax - 50, y - 2); ctx.lineTo(ax + 40, y - 2); ctx.lineTo(ax + 40, y - 7); ctx.lineTo(ax + 70, y); ctx.lineTo(ax + 40, y + 7); ctx.lineTo(ax + 40, y + 2); ctx.lineTo(ax - 50, y + 2); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(ax - 40 + hash(ax + i) * 100, y - 1, 3 + hash(ax * 3 + i) * 4, 1.5, 0, 0, Math.PI * 2); ctx.fill(); }
    // (a chunk of block by it, painted too: an arrow on that and all)
    ink(ctx, () => ctx.rect(ax - 86, y - 18, 26, 18), '#6B635C', 1); ctx.fillStyle = lite('#6B635C', 0.25); ctx.fillRect(ax - 85, y - 17.5, 24, 1);
    paintArrow(ctx, ax - 82, y - 9, 18, 0.5);
  }
  // The little signs: a stake, a board nailed on it (tilted, every one different), a yellow arrow and a word or two on it
  const WORDS = [['THIS', 'WAY'], ['LAIR'], ['KEEP', 'GOING']];
  const BOARDS: [string, number, number, number][] = [['#8A6A4A', 64, 34, -0.08], ['#7D8C9E', 56, 30, 0.1], ['#9E6B5C', 70, 36, -0.04]];
  R.signs.forEach((sx, i) => {
    if (sx + 60 < state.camera.x || sx - 60 > state.camera.x + W) return;
    const [col, bw, bh, tilt] = BOARDS[i % BOARDS.length];
    const lean = tilt * 0.6 + Math.sin(f * 0.03 + i) * 0.01;
    ctx.save(); ctx.translate(sx, y); ctx.rotate(lean);
    shaded(ctx, () => ctx.rect(-3, -78, 6, 78), '#5B3A29', -3, -78, 6, 78, 1);
    ctx.translate(0, -66); ctx.rotate(tilt);
    shadedTop(ctx, () => ctx.rect(-bw / 2, -bh / 2, bw, bh), col, -bw / 2, -bh / 2, bw, bh, 1.2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'; ctx.fillRect(-bw / 2, -bh / 2 + bh * 0.5, bw, 1);
    ctx.fillStyle = '#44403C'; ctx.fillRect(-1, -bh / 2 + 3, 2, 2); ctx.fillRect(-1, bh / 2 - 5, 2, 2); // (the nails)
    const words = WORDS[i % WORDS.length];
    ctx.fillStyle = '#FACC15'; ctx.font = '8px "Press Start 2P"'; ctx.textAlign = 'left';
    words.forEach((w, k) => ctx.fillText(w, -bw / 2 + 4, -bh / 2 + 11 + k * 10));
    paintArrow(ctx, -bw / 2 + 6, bh / 2 - 6 - (words.length > 1 ? 0 : 6), bw - 12, 0.6);
    // (a run of the paint down off the bottom of it)
    ctx.fillStyle = '#FACC15'; ctx.fillRect(bw / 2 - 12, bh / 2, 2, 6 + (i * 3) % 7);
    ctx.restore();
  });
};

/**
 * A big dumb neon sign on a pole right in front of the hole: TOMMY'S LAIR in green neon, chase lights round its edge,
 * and a fat arrow under it flashing, pointing straight down the hole. (Who put it up is anyone's guess.)
 */
const drawLairSign = (ctx: Ctx, state: GameState) => {
  const P = COURSE.ruins.pit, PW = COURSE.ruins.pitW, y = RUINS_Y, f = state.frame;
  const sx = P - 120, sy = y - 300;
  // Yellow paint slopped all round the hole (the lips, the rubble, down the sides of it), a bucket kicked over, a
  // roller left lying: somebody really wanted you to know this is the way
  const paint = '#FACC15';
  ctx.fillStyle = paint;
  for (let i = 0; i < 14; i++) {
    const side = i % 2 ? P + PW + 6 + hash(i) * 70 : P - 6 - hash(i) * 70;
    ctx.beginPath(); ctx.ellipse(side, y - 1, 8 + hash(i + 3) * 14, 3 + hash(i + 5) * 2, 0, 0, Math.PI * 2); ctx.fill();
  }
  // (a thick stripe right along both lips, and drips running down inside the hole)
  ctx.fillRect(P - 24, y - 3, 24, 5); ctx.fillRect(P + PW, y - 3, 24, 5);
  for (let i = 0; i < 7; i++) { const dx = i % 2 ? P + PW - 4 - hash(i) * 6 : P + hash(i) * 6; const len = 20 + hash(i + 9) * 70 + Math.sin(f * 0.02 + i) * 3; ctx.fillRect(dx, y, 4, len); ctx.beginPath(); ctx.arc(dx + 2, y + len, 3, 0, Math.PI * 2); ctx.fill(); }
  // (and it's run: two long streaks down the walls of the shaft, the whole way down, dripping off the bottom of it
  // into a puddle on the cavern floor where you land)
  const bottomY = GROUND_Y - CAVERN_ROOF;
  for (const [sx0, w0] of [[P + 1, 5], [P + PW - 7, 6]] as [number, number][]) {
    ctx.beginPath(); ctx.moveTo(sx0, y);
    for (let yy = y; yy <= bottomY; yy += 40) ctx.lineTo(sx0 + Math.sin(yy * 0.02 + sx0) * 2, yy);
    ctx.lineTo(sx0 + w0, bottomY); for (let yy = bottomY; yy >= y; yy -= 40) ctx.lineTo(sx0 + w0 + Math.sin(yy * 0.02 + sx0) * 2, yy);
    ctx.closePath(); ctx.fill();
  }
  for (let i = 0; i < 3; i++) { const dx = P + 14 + i * 36, q = ((f * 1.2 + i * 40) % 90) / 90; ctx.fillRect(dx, bottomY + q * (CAVERN_ROOF - 6), 3, 6); }
  ctx.beginPath(); ctx.ellipse(P + PW / 2, GROUND_Y - 1, 70, 5, 0, 0, Math.PI * 2); ctx.fill();
  // (and on from the puddle all the way to his door: drips, a smeared line, arrows slapped down every so often,
  // up the step and right to the foot of it, and a handprint and a splash on the wall by the door)
  const floorAt = (x: number) => {
    let top = GROUND_Y;
    for (const b of state.blocks) if ((b.type === 'ground' || b.type === 'platform') && !b.hidden && x >= b.x && x <= b.x + b.w && b.y > GROUND_Y - 90 && b.y < top) top = b.y;
    return top;
  };
  const from = P + PW / 2 + 74, to = BOSS_DOOR_X - 6;
  for (let x = from; x < to; x += 9) {
    const fy = floorAt(x), wob = Math.sin(x * 0.07) * 1.5;
    ctx.fillRect(x, fy - 2 + wob * 0.3, 7, 3);
    if (hash(x) > 0.82) { ctx.beginPath(); ctx.ellipse(x + 3, fy - 1, 5 + hash(x + 1) * 6, 2.2, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  for (let x = from + 120; x < to - 60; x += 260) {
    const fy = floorAt(x) - 1;
    ctx.beginPath(); ctx.moveTo(x, fy - 2); ctx.lineTo(x + 40, fy - 2); ctx.lineTo(x + 40, fy - 6); ctx.lineTo(x + 62, fy); ctx.lineTo(x + 40, fy + 6); ctx.lineTo(x + 40, fy + 2); ctx.lineTo(x, fy + 2); ctx.closePath(); ctx.fill();
  }
  const dy = floorAt(to - 2);
  ctx.beginPath(); ctx.ellipse(BOSS_DOOR_X - 14, dy - 1, 22, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(BOSS_DOOR_X - 8, dy - 64, 6, 62);
  for (let k = 0; k < 4; k++) ctx.fillRect(BOSS_DOOR_X - 20 + k * 3, dy - 80 + k * 3, 3, 10 + k * 4);
  ctx.beginPath(); ctx.arc(BOSS_DOOR_X - 26, dy - 96, 6, 0, Math.PI * 2); ctx.fill();
  for (let k = 0; k < 4; k++) ctx.fillRect(BOSS_DOOR_X - 33 + k * 4, dy - 108 + (k === 0 || k === 3 ? 4 : 0), 3, 9);
  // (splashed up the rubble and a broken wall stump, and a big painted arrow on the ground pointing at it)
  ctx.beginPath(); ctx.moveTo(P - 200, y - 2); ctx.lineTo(P - 90, y - 2); ctx.lineTo(P - 90, y - 7); ctx.lineTo(P - 60, y); ctx.lineTo(P - 90, y + 7); ctx.lineTo(P - 90, y + 2); ctx.lineTo(P - 200, y + 2); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.translate(P - 250, y); ctx.rotate(1.3);
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-10, -12, 20, 22); ctx.fillStyle = paint; ctx.fillRect(-10, -12, 20, 5);
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(P - 238, y - 1, 26, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#44403C'; ctx.fillRect(P + PW + 60, y - 4, 18, 3); ctx.fillStyle = paint; ctx.fillRect(P + PW + 76, y - 8, 14, 10);
  // (big: scaled up about its middle)
  ctx.save(); ctx.translate(sx, sy + 31); ctx.scale(1.4, 1.4); ctx.translate(-sx, -(sy + 31));
  // The pole, and a little buzzing transformer box on it
  const poleH = (y - sy - 60) / 1.4 + 20;
  shaded(ctx, () => ctx.rect(sx - 4, sy + 60, 8, poleH), '#3F3F46', sx - 4, sy + 60, 8, poleH, 1);
  ink(ctx, () => ctx.rect(sx + 4, sy + 84, 12, 14), '#52525B', 1); ctx.fillStyle = '#A1A1AA'; ctx.fillRect(sx + 5, sy + 85, 10, 1); // (the transformer box)
  // The board: its steel frame (lit along the top), bolts, the dark face
  ink(ctx, () => ctx.rect(sx - 110, sy, 220, 62), '#18181B', 1);
  ctx.strokeStyle = '#3F3F46'; ctx.lineWidth = 3; ctx.strokeRect(sx - 110, sy, 220, 62);
  ctx.fillStyle = '#71717A'; ctx.fillRect(sx - 111, sy - 1.5, 222, 1);
  ctx.fillStyle = '#27272A'; for (let k = 0; k < 220; k += 4) ctx.fillRect(sx - 108 + k, sy + 3, 1, 56);
  // Chase lights round its edge
  for (let i = 0; i < 26; i++) {
    const perim = 2 * (220 + 62), d = (i / 26) * perim;
    const [lx, ly] = d < 220 ? [sx - 110 + d, sy] : d < 282 ? [sx + 110, sy + d - 220] : d < 502 ? [sx + 110 - (d - 282), sy + 62] : [sx - 110, sy + 62 - (d - 502)];
    const onL = (i + Math.floor(f / 5)) % 3 === 0;
    if (onL) { ctx.fillStyle = 'rgba(253, 224, 71, 0.3)'; ctx.beginPath(); ctx.arc(lx, ly, 5, 0, Math.PI * 2); ctx.fill(); }
    ink(ctx, () => ctx.arc(lx, ly, 3, 0, Math.PI * 2), onL ? '#FDE047' : '#713F12', 0.8);
    if (onL) { ctx.fillStyle = '#FFFBEB'; ctx.fillRect(lx - 1.5, ly - 1.5, 1.5, 1.5); }
  }
  // TOMMY'S LAIR, buzzing (it cuts out now and then)
  const on = (f % 97) > 6 && (f % 41) !== 3;
  ctx.save();
  ctx.font = 'bold 20px "Press Start 2P"'; ctx.textAlign = 'center';
  // (its glow, in steps: the letters spread out wide and faint, then nearer and brighter, then the tube)
  if (on) for (const [d, a] of [[3, 0.18], [2, 0.3], [1, 0.5]] as const) {
    ctx.fillStyle = `rgba(132, 204, 22, ${a})`;
    for (const [ox, oy] of [[-d, 0], [d, 0], [0, -d], [0, d]]) { ctx.fillText("TOMMY'S", sx + ox, sy + 28 + oy); ctx.fillText('LAIR', sx + ox, sy + 54 + oy); }
  }
  ctx.fillStyle = on ? '#D9F99D' : '#365314';
  ctx.fillText("TOMMY'S", sx, sy + 28);
  ctx.fillText('LAIR', sx, sy + 54);
  if (on) { ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; ctx.font = 'bold 20px "Press Start 2P"'; ctx.save(); ctx.beginPath(); ctx.rect(sx - 110, sy + 12, 220, 3); ctx.rect(sx - 110, sy + 38, 220, 3); ctx.clip(); ctx.fillText("TOMMY'S", sx, sy + 28); ctx.fillText('LAIR', sx, sy + 54); ctx.restore(); }
  ctx.restore();
  ctx.restore();
  // The arrow: from the sign, out over the hole and straight down it, flashing
  const lit = Math.floor(f / 12) % 2 === 0;
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const ax = P + PW / 2;
  const tube = () => { ctx.beginPath(); ctx.moveTo(sx + 154, sy + 31); ctx.lineTo(ax, sy + 31); ctx.lineTo(ax, y - 30); };
  const head = (g: number) => { ctx.beginPath(); ctx.moveTo(ax - 22 - g, y - 40 - g * 0.6); ctx.lineTo(ax + 22 + g, y - 40 - g * 0.6); ctx.lineTo(ax, y - 8 + g); ctx.closePath(); };
  // (its glow in two steps, the tube, the hot line down its middle)
  if (lit) for (const [lw, a] of [[20, 0.15], [14, 0.25]] as const) { ctx.strokeStyle = `rgba(244, 114, 182, ${a})`; ctx.lineWidth = lw; tube(); ctx.stroke(); ctx.fillStyle = ctx.strokeStyle; head(lw / 3); ctx.fill(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 10; tube(); ctx.stroke();
  ctx.strokeStyle = lit ? '#F472B6' : '#6B213F'; ctx.lineWidth = 8; tube(); ctx.stroke();
  ink(ctx, () => { ctx.moveTo(ax - 22, y - 40); ctx.lineTo(ax + 22, y - 40); ctx.lineTo(ax, y - 8); ctx.closePath(); }, lit ? '#F472B6' : '#6B213F', 1.5);
  ctx.strokeStyle = lit ? '#FDF2F8' : '#9D3D68'; ctx.lineWidth = 2; tube(); ctx.stroke();
  ctx.restore();
};

/** A wall left standing, broken off along `pts` (a polygon down to `base`): siding, an ink line round, the broken top lit, the green stuff's line up it and the wall eaten away under. */
const wallStump = (ctx: Ctx, pts: [number, number][], color: string, base: number) => {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys);
  const path = () => { ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  ctx.fillStyle = color; ctx.fillRect(x0, y0, x1 - x0, base - y0);
  checker(ctx, x0 + (x1 - x0) * 0.65, y0, (x1 - x0) * 0.35, base - y0, 'rgba(0, 0, 0, 0.18)');
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; for (let yy = y0; yy < base; yy += 9) ctx.fillRect(x0, yy, x1 - x0, 1);
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; for (let yy = y0 + 1; yy < base; yy += 9) ctx.fillRect(x0, yy, x1 - x0, 1);
  ctx.fillStyle = 'rgba(92, 104, 36, 0.4)'; ctx.fillRect(x0, base - 60, x1 - x0, 60);
  checker(ctx, x0, base - 64, x1 - x0, 4, 'rgba(92, 104, 36, 0.45)');
  ctx.fillStyle = 'rgba(190, 242, 100, 0.35)'; ctx.fillRect(x0, base - 60, x1 - x0, 1);
  checker(ctx, x0, base - 40, x1 - x0, 40, 'rgba(26, 30, 8, 0.35)');
  ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke();
  // (the broken top's edge: the studs and the plaster showing)
  ctx.strokeStyle = '#D6D3C4'; ctx.lineWidth = 1; ctx.beginPath();
  for (let i = 1; i < pts.length - 2; i++) { ctx.moveTo(pts[i][0] + 1, pts[i][1] + 2); ctx.lineTo(pts[i + 1][0] + 1, pts[i + 1][1] + 2); }
  ctx.stroke();
};

/** Somebody else's house on the block, after: stumps of wall, a doorframe on its own, a tub or a fridge, a skeleton. */
const wreckedHouse = (ctx: Ctx, x: number, y: number, seed: number, f: number) => {
  const c = HOUSE_COLORS[seed % HOUSE_COLORS.length];
  wallStump(ctx, [[x - 140, y], [x - 140, y - 70 - seed * 8], [x - 110, y - 40], [x - 90, y - 90], [x - 60, y - 30], [x - 60, y]], c, y);
  wallStump(ctx, [[x + 80, y], [x + 80, y - 50], [x + 110, y - 100 + seed * 6], [x + 140, y - 40], [x + 140, y]], c, y);
  // The doorframe, standing on its own
  shaded(ctx, () => ctx.rect(x - 24, y - 90, 6, 90), '#5B3A29', x - 24, y - 90, 6, 90, 1);
  shaded(ctx, () => ctx.rect(x + 18, y - 90, 6, 90), '#5B3A29', x + 18, y - 90, 6, 90, 1);
  shadedTop(ctx, () => ctx.rect(x - 24, y - 94, 48, 6), '#5B3A29', x - 24, y - 94, 48, 6, 1);
  // A bathtub, or a fridge on its side
  if (seed % 2) {
    shadedTop(ctx, () => ctx.roundRect(x + 30, y - 22, 44, 22, [8, 8, 2, 2]), '#F5F5F4', x + 30, y - 22, 44, 22, 1.2);
    ctx.fillStyle = '#D6D3D1'; ctx.fillRect(x + 32, y - 21, 40, 3);
    for (const fx of [x + 34, x + 66]) ink(ctx, () => ctx.rect(fx, y - 3, 4, 3), '#A8A29E', 0.8); // (claw feet)
    ink(ctx, () => ctx.rect(x + 70, y - 28, 3, 7), '#A8A29E', 0.8);
  } else {
    shadedTop(ctx, () => ctx.roundRect(x + 20, y - 26, 60, 26, 3), '#E7E5E4', x + 20, y - 26, 60, 26, 1.2);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(x + 48, y - 25, 1, 24);
    ink(ctx, () => ctx.rect(x + 64, y - 22, 3, 14), '#A8A29E', 0.8);
    checker(ctx, x + 22, y - 10, 56, 8, 'rgba(146, 64, 14, 0.4)');
  }
  // Whoever lived there, sat up against what's left
  skeleton(ctx, x - 90, y, 0.55);
  // Roof shingles and bricks about
  for (let i = 0; i < 6; i++) { const bx = x - 120 + i * 40 + ((i * 13) % 11), by = y - 4 - (i % 2) * 3, c2 = i % 3 ? '#44403C' : '#7C4A3A'; ink(ctx, () => ctx.rect(bx, by, 14, 5), c2, 0.8); ctx.fillStyle = lite(c2, 0.25); ctx.fillRect(bx + 1, by + 0.5, 12, 1); }
  void f;
};

/** The suit coming off him in the ruins: strips of yellow melting down him and away (over him, while it goes). */
export const drawSuitMelt = (ctx: Ctx, state: GameState, rt: TommyRuntime) => {
  if (rt.escape.phase !== 'melt') return;
  const p = state.player;
  const k = clamp01(rt.escape.t / (MELT_FRAMES - 30));
  ctx.save();
  ctx.globalAlpha = 1 - k;
  ctx.fillStyle = '#FACC15';
  ctx.fillRect(p.pos.x - 2, p.pos.y + k * 40, p.width + 4, p.height - k * 40);
  ctx.globalAlpha = 1;
  for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(250, 204, 21, 0.8)'; ctx.fillRect(p.pos.x + i * 8, p.pos.y + p.height - 4 + ((state.frame + i * 7) % 12), 4, 6); }
  ctx.fillStyle = 'rgba(214, 211, 209, 0.5)'; for (let i = 0; i < 3; i++) { const t = ((state.frame + i * 20) % 60) / 60; ctx.beginPath(); ctx.arc(p.pos.x + 10 + i * 12, p.pos.y - t * 40, 6 + t * 8, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
};

// ---------------------------------------------------------------------------
// The blast out of the cistern
// ---------------------------------------------------------------------------

/**
 * The floor going under him just before (bubbling, cracking, a glow coming up through it), then the column of sewage
 * that fires him up and out: thick, churning, a hot bright core, streaks racing up it, junk in it, a crown of spray where
 * it bursts out of the floor, and droplets flying off its sides.
 */
export const drawBlast = (ctx: Ctx, state: GameState, rt: TommyRuntime) => {
  const es = rt.escape;
  const x = COURSE.sewer.cistern.rack, floor = GROUND_Y;
  const f = state.frame;
  if (es.phase === 'suit' && es.t > 50) {
    // The tell: something coming up under him
    const k = clamp01((es.t - 50) / 50);
    ctx.save(); ctx.beginPath(); ctx.rect(x - 100, floor - 90, 200, 110); ctx.clip();
    steppedGlow(ctx, x, floor, 30 + k * 60, '#D9F99D', 0.6 * k, 0.05 * k, 4);
    ctx.restore();
    ctx.strokeStyle = `rgba(190, 242, 100, ${0.5 + k * 0.5})`; ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI - Math.PI, len = 10 + k * 40 * (0.6 + hash(i) * 0.6);
      ctx.beginPath(); ctx.moveTo(x, floor + 2); ctx.lineTo(x + Math.cos(a) * len * 0.5, floor + 2 - 3); ctx.lineTo(x + Math.cos(a) * len, floor + 2); ctx.stroke();
    }
    for (let i = 0; i < 6; i++) {
      const q = ((f * (1 + k) + i * 13) % 30) / 30;
      ctx.fillStyle = `rgba(190, 242, 100, ${0.9 * (1 - q)})`;
      ctx.beginPath(); ctx.arc(x - 30 + hash(i + 3) * 60, floor - q * 22 * k, 2 + q * 4, 0, Math.PI * 2); ctx.fill();
    }
    return;
  }
  if (es.phase !== 'blast') return;
  const t = es.t;
  const top = state.camera.y - 40;
  // (never below nothing: a negative size to draw an ellipse at throws, and that stops the whole game drawing)
  const w = Math.max(2, Math.min(1, t / 5) * 64 + Math.sin(f * 0.9) * 4);
  // A glow round it
  for (const [k, a] of [[2.2, 0.1], [1.7, 0.12], [1.3, 0.14]] as const) { ctx.fillStyle = `rgba(163, 230, 53, ${a})`; ctx.fillRect(x - w * k, top, w * k * 2, floor - top); }
  // The column: wobbling edges, dark outside, bright inside
  const column = (half: number, color: string, phase: number) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let y = floor; y >= top; y -= 16) ctx.lineTo(x - half - Math.sin(y * 0.05 + f * 0.8 + phase) * half * 0.18, y);
    for (let y = top; y <= floor; y += 16) ctx.lineTo(x + half + Math.sin(y * 0.045 - f * 0.7 + phase) * half * 0.18, y);
    ctx.closePath(); ctx.fill();
  };
  column(w + 2, '#1A2E05', 0);
  column(w, '#3F6212', 0);
  column(w * 0.72, '#65A30D', 1.3);
  column(w * 0.4, '#BEF264', 2.1);
  column(w * 0.16, '#F7FEE7', 3);
  // Streaks racing up it
  ctx.strokeStyle = 'rgba(247, 254, 231, 0.7)'; ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const sx = x + (hash(i) - 0.5) * w * 1.3, sy = floor - ((f * 34 + i * 97) % (floor - top + 200));
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - 40 - hash(i + 9) * 50); ctx.stroke();
  }
  // Junk going up in it: bones, a can, a tire
  for (let i = 0; i < 5; i++) {
    const jy = floor - ((f * 26 + i * 173) % (floor - top + 100)), jx = x + (hash(i + 20) - 0.5) * w;
    ctx.save(); ctx.translate(jx, jy); ctx.rotate(f * 0.3 + i);
    ctx.fillStyle = i % 3 === 0 ? '#E7E5D6' : i % 3 === 1 ? '#78716C' : '#1C1917';
    if (i % 3 === 2) { ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); } else ctx.fillRect(-8, -3, 16, 6);
    ctx.restore();
  }
  // Where it bursts out of the floor: a crown of spray
  for (let i = 0; i < 14; i++) {
    const a = -Math.PI / 2 + (i / 13 - 0.5) * 2.6, q = ((f * 2 + i * 7) % 24) / 24;
    const r = w * 0.8 + q * 90;
    ctx.fillStyle = `rgba(${i % 2 ? '190, 242, 100' : '101, 163, 13'}, ${0.9 * (1 - q)})`;
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * r, floor + Math.sin(a) * r * 0.6, 5 + (1 - q) * 6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#65A30D'; ctx.beginPath(); ctx.ellipse(x, floor, w * 1.6, 14, 0, Math.PI, 0); ctx.fill();
  // Droplets flung off its sides all the way up
  for (let i = 0; i < 16; i++) {
    const dy = floor - hash(i + 40) * (floor - top), side = i % 2 ? 1 : -1, q = ((f * 3 + i * 11) % 30) / 30;
    ctx.fillStyle = `rgba(190, 242, 100, ${0.85 * (1 - q)})`;
    ctx.beginPath(); ctx.arc(x + side * (w + q * 60), dy - q * 30, 3 + (1 - q) * 3, 0, Math.PI * 2); ctx.fill();
  }
};
