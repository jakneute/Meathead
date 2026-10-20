// The hub, painted.
//
//   The camera's stood in the middle of the ring, turning to follow him round, so everything goes round together, near
//   and far (seen from inside the cylinder). Behind it all, flat: the sky. On the roundabout, back to front: the sun,
//   the clouds, each land's big landmark right behind its own stretch, the haze, the treeline and the monorail; each
//   land's stretch (stretch.ts: its buildings, trees and paving, running into the next land's at the seams); the
//   promenade's crowd and the parade (crowd.ts); the portals (gates.ts), the swirl round each; the fence along the back
//   of the walk, the gateposts; the walk's crowd, the queues, the carts; the lamp posts (signposts on them pointing
//   both ways, string lights between); the cast. In front: the flower beds, the pigeons.
//
// Still art's stamped (painted once, put down with a drawImage: the stretches in half-stretch strips, each portal, each
// signpost, each guest's frames); only what moves is drawn live; only what's on screen is drawn at all.

import type { GameState } from '../../m1/game/core/state';
import { GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../m1/constants';
import { INK, dark, lite, ink } from '../../m1/game/render/npc/kit';
import { mix } from '../../m1/game/render/backdrops/core';
import { stamp } from '../../m1/game/render/stamp';
import { LANDS, SPOTS, HUB_SLOTS } from './lands';
import { HUB, HUB_CIRC, HUB_HORIZON, slotX, seamX, ROW } from './geometry';
import { drawCrowdMid, drawCrowdWalk, drawCast, drawPigeons, drawLostBalloons } from './crowd';
import { paintBack, paintWalk, paintPath, paintFence, drawStretchLive, stretchOf, LAND_LOOK } from './stretch';
import { paintGate, paintGateSign, paintPosts, drawSwirl, drawShimmer, drawPostsLive } from './gates';
import { timeOfDay, skyRamp, sunAt, sunTint, cloudTint, farTint, drawStars, drawMoon, lampGlow } from '../timeOfDay';
import { noteSun, drawSunGlare } from '../sunFlare';
import { signText, signAt, signW, enamel } from './letters';
import { paintLandmark, paintAmericaLandmark, paintSkyline, drawFarLive, paintTreeline, paintCloud, paintBlimp, paintHotAir, LANDMARK_BOX, SKYLINE_BOX } from './far';
import { checker } from './kit';
import { drawAmericaExit } from './exit';

type Ctx = CanvasRenderingContext2D;
type Each = (x: number, r: number, draw: (x: number) => void) => void;
const box = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/** Bands top to bottom through the colors. */
const bands = (ctx: Ctx, x: number, y: number, w: number, h: number, cs: string[]) => { const bh = h / cs.length; cs.forEach((c, i) => box(ctx, x, y + i * bh, w, bh + 1, c)); };
export { HUB_HORIZON };
const SKY = ['#4C7BE0', '#5A88E6', '#6995EB', '#7AA3EF', '#8DB1F2', '#A1BFF4', '#B7CDF4', '#CEDBF2', '#E6E3E6', '#F6E7D2'];

/** What of the world's on screen (the world pass's view: the cylinder's strip, through any zoom). */
const viewOf = (state: GameState) => state.view ?? { x: state.camera.x - 40, y: state.camera.y, w: CANVAS_WIDTH + 80, h: CANVAS_HEIGHT };
/** Every lap's copy of something `r` either side of x that's on screen (the roundabout repeats). */
const eachOf = (state: GameState): Each => {
  const v = viewOf(state);
  return (x, r, draw) => { for (let k = -1; k <= 1; k++) { const lx = x + k * HUB_CIRC; if (lx + r > v.x && lx - r < v.x + v.w) draw(lx); } };
};
/** Every lap's copy near enough to matter for the glow (screen-space passes that don't have the view). */
const laps = (state: GameState, x: number, draw: (x: number) => void) => {
  for (let k = -1; k <= 1; k++) {
    const lx = x + k * HUB_CIRC;
    if (lx > state.camera.x - 500 && lx < state.camera.x + CANVAS_WIDTH + 500) draw(lx);
  }
};
/** A stamp put down at every lap's copy of it on screen: `paint` draws it where it is on the first lap. */
const stampEach = (ctx: Ctx, each: Each, key: string, x0: number, y0: number, w: number, h: number, paint: (g: Ctx) => void) =>
  each(x0 + w / 2, w / 2, lx => { const dx = lx - (x0 + w / 2); if (dx) ctx.translate(dx, 0); stamp(ctx, key, x0, y0, w, h, paint); if (dx) ctx.translate(-dx, 0); });

// ---------------------------------------------------------------------------
// Behind: the sky, the lands' landmarks, the treeline
// ---------------------------------------------------------------------------

/** Behind it all, flat: the sky (bands run straight across, so turning doesn't show on it), and the lawn at the bottom. */
export const drawHubBackdrop = (ctx: Ctx, state: GameState) => {
  const tod = timeOfDay();
  bands(ctx, 0, 0, CANVAS_WIDTH, 470, skyRamp(SKY, tod));
  drawStars(ctx, 0, 0, CANVAS_WIDTH, 400, state.frame, 0, tod);
  drawMoon(ctx, 610, 96, 20, tod);
  bands(ctx, 0, 472, CANVAS_WIDTH, CANVAS_HEIGHT - 472, ['#2F6B3A', '#2A6034', '#25562F', '#204C2A'].map(c => farTint(c, 0.3, tod)));
};

/**
 * The far distance, drawn on the roundabout itself (so it turns exactly with it): the sun, clouds, each land's
 * landmark right behind its own stretch (stamped: hazed by the hour), the haze, the treeline, the monorail.
 */
const drawHubFar = (ctx: Ctx, state: GameState, each: Each) => {
  const f = state.frame, top = state.camera.y, v = viewOf(state);
  const x0 = v.x - 40, x1 = v.x + v.w + 40;
  const tod = timeOfDay(), todKey = `${tod.skyK.toFixed(2)}|${tod.haze}`;
  // The sun, in rings, over Fairy Land (sinking toward the skyline as the day goes)
  const sun = sunAt(0, top + 92, top + 440, tod);
  if (sun.up > 0.02) laps(state, slotX(5) + 120, x => {
    ctx.save(); ctx.globalAlpha = sun.up;
    for (const [r, c] of [[46, '#F8E4B0'], [38, '#FBEFC6'], [30, '#FFF7DC'], [24, '#FFFDF2']] as const) { ctx.fillStyle = sunTint(c, tod); ctx.beginPath(); ctx.arc(x, sun.y, r * (1 + Math.max(0, 0.4 - tod.sunH) * 0.4), 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    const a = (x - state.camera.x - CANVAS_WIDTH / 2) / HUB.radius;
    if (Math.abs(a) < 1.2) {
      const sx = CANVAS_WIDTH / 2 + HUB.radius * Math.tan(a), sy = HUB_HORIZON + (sun.y - top - HUB_HORIZON) / Math.cos(a);
      drawSunGlare(ctx, x, sun.y, 1, { hud: false, screen: [sx, sy] }, tod);
      noteSun(null, sx, sy);
    }
  });
  // Clouds drifting (each stamped by its kind and the hour: stepped lumps on a flat foot)
  const cloud = [cloudTint('#B8C4DC', tod), cloudTint('#D8E0EE', tod), cloudTint('#F2F5FA', tod), cloudTint('#FFFFFF', tod)];
  for (let i = 0; i < 12; i++) each(HUB.x0 + i * (HUB_CIRC / 12) + ((f * 0.15 + i * 97) % (HUB_CIRC / 12)), 70, x => {
    const y = top + 50 + (i % 4) * 34, kd = i % 4;
    ctx.translate(x, y); stamp(ctx, `hubCloud|${kd}|${todKey}`, -60, -34, 124, 42, g => paintCloud(g, kd, cloud)); ctx.translate(-x, -y);
  });
  // The park's blimp going round, hot-air balloons drifting
  each(HUB.x0 + ((f * 0.5) % HUB_CIRC), 70, x => { const y = top + 118 + Math.sin(f * 0.01) * 6; ctx.translate(Math.round(x), Math.round(y)); stamp(ctx, `hubBlimp|${todKey}`, -62, -20, 126, 42, paintBlimp); if ((f >> 4) % 2) box(ctx, 58, -2, 2, 2, '#EF4444'); ctx.translate(-Math.round(x), -Math.round(y)); });
  for (let i = 0; i < 6; i++) each(HUB.x0 + i * (HUB_CIRC / 6) + 200 + ((f * (0.08 + i * 0.02)) % (HUB_CIRC / 6)), 20, x => { const y = top + 170 + (i % 3) * 40 + Math.sin(f * 0.012 + i) * 8; ctx.translate(Math.round(x), Math.round(y)); stamp(ctx, `hubHot|${i % 4}|${todKey}`, -17, -19, 34, 50, g => paintHotAir(g, i)); ctx.translate(-Math.round(x), -Math.round(y)); });
  // (gulls, high up, going round)
  for (let i = 0; i < 7; i++) each(HUB.x0 + ((i * 1100 + f * (0.6 + i * 0.1)) % HUB_CIRC), 20, x => {
    const y = top + 140 + i * 16 + Math.sin(f * 0.03 + i) * 6, fl = ((f >> 3) + i) % 2 ? 3 : -1;
    ctx.fillStyle = '#3F3F46'; ctx.fillRect(Math.round(x - 6), Math.round(y + fl), 2, 1); ctx.fillRect(Math.round(x - 4), Math.round(y + fl / 2), 2, 1); ctx.fillRect(Math.round(x - 2), Math.round(y), 4, 1); ctx.fillRect(Math.round(x + 2), Math.round(y + fl / 2), 2, 1); ctx.fillRect(Math.round(x + 4), Math.round(y + fl), 2, 1);
  });
  // Each land's landmark on the skyline, right behind its stretch, as the land itself has it (stamped by the hour); the
  // busy band of its rides in front; what moves on them
  const Y = top + 440, LB = LANDMARK_BOX, SB = SKYLINE_BOX;
  SPOTS.forEach((s, i) => {
    const bx = slotX(i), id = stretchOf(i);
    if (s.kind === 'land') stampEach(ctx, each, `hubL2|${id}|${tod.key}`, bx + LB.x, Y + LB.y, LB.w, LB.h, g => paintLandmark(g, id, bx, Y));
    else if (s.kind === 'america') { const fi = Math.floor(f / 12) % 10; stampEach(ctx, each, `hubL2|america|${fi}|${tod.key}`, bx - 50, Y - 350, 230, 352, g => paintAmericaLandmark(g, bx, Y, fi * 12.5)); }
    stampEach(ctx, each, `hubS|${id}|${tod.key}`, bx + SB.x, Y - 10 + SB.y, SB.w, SB.h, g => paintSkyline(g, id, bx, Y - 10));
    each(bx, 280, x => drawFarLive(ctx, id, x, Y - 44, f));
  });
  // The haze down at the horizon
  const [hr, hg, hb] = [1, 3, 5].map(i => parseInt(mix('#F6E7D2', tod.haze, tod.skyK).slice(i, i + 2), 16));
  for (let i = 0; i < 4; i++) { ctx.fillStyle = `rgba(${hr}, ${hg}, ${hb}, ${(0.08 + i * 0.07).toFixed(2)})`; ctx.fillRect(x0, top + 380 + i * 18, x1 - x0, 18); }
  // The monorail's beam and the treeline (stamped strips), the train going round on the beam
  for (let s = 0; s < HUB_SLOTS * 2; s++) {
    const a = HUB.x0 + s * (HUB.slot / 2);
    stampEach(ctx, each, `hubTree|${s}|${tod.key}`, a, top + 370, HUB.slot / 2, 104, g => { g.save(); g.beginPath(); g.rect(a, top + 300, HUB.slot / 2, 200); g.clip(); paintTreeline(g, a, a + HUB.slot / 2, top); g.restore(); });
  }
  each(HUB.x0 + HUB_CIRC - ((f * 2.2) % HUB_CIRC) + 128, 130, xx => { const x = Math.round(xx - 128); ctx.translate(x, 0); stamp(ctx, `hubTrain|${tod.key}`, -4, top + 370, 264, 32, g => paintTrain(g, top)); ctx.translate(-x, 0); });
};

/** The monorail's train: four cars, the noses rounded, a window band, a stripe, lit after dark. */
const paintTrain = (g: Ctx, top: number) => {
  const tod = timeOfDay(), night = tod.lamps > 0.3;
  for (let c = 0; c < 4; c++) {
    const cx = c * 64, body = c % 2 ? ['#0E5A86', '#1E7AB0', '#38BDF8', '#7DD3FC'] : ['#9CA3AF', '#D1D5DB', '#F1F5F9', '#FFFFFF'];
    ink(g, () => g.roundRect(cx, top + 375, 60, 24, [c === 0 ? 12 : 3, c === 3 ? 12 : 3, 2, 2]), body[2]);
    box(g, cx + 2, top + 377, 56, 3, body[3]); box(g, cx + 2, top + 393, 56, 4, body[1]); checker(g, cx + 2, top + 391, 56, 2, body[1]);
    box(g, cx + 4, top + 380, 52, 9, '#0F172A');
    for (let w = 0; w < 4; w++) { box(g, cx + 6 + w * 13, top + 381, 10, 7, night ? '#FDE68A' : '#3B5A8A'); if (!night) box(g, cx + 6 + w * 13, top + 381, 2, 7, '#9CC8E8'); }
    box(g, cx + 2, top + 390, 56, 1, '#DC2626');
    box(g, cx + 6, top + 397, 10, 2, '#27272A'); box(g, cx + 44, top + 397, 10, 2, '#27272A');
  }
  box(g, 0, top + 386, 2, 4, night ? '#FFF7C2' : '#FDE68A');
};

// ---------------------------------------------------------------------------
// On the roundabout
// ---------------------------------------------------------------------------

/** A portal going (hub/portal.ts): which spot's, how far on its swirl's been wound, how awake it is. Set every frame
 * (slot -1: none). */
const surge = { slot: -1, phase: 0, k: 0 };
export const setPortalSurge = (slot: number, phase: number, k = 0) => { surge.slot = slot; surge.phase = phase; surge.k = k; };

/** The stretches are stamped in strips this wide (each spot's middle and each seam well inside one). */
const STRIP = HUB.slot / 2, STRIP0 = HUB.x0 + STRIP / 2, STRIPS = HUB_SLOTS * 2;

export const drawHubBack = (ctx: Ctx, state: GameState) => {
  const each = eachOf(state), f = state.frame;
  drawHubFar(ctx, state, each);
  const lit = lampGlow() > 0.35;
  // The stretches: the lands' buildings, trees and kiosks along the back, the promenade's paving, the walk's, the
  // portals' paths (stamped in strips)
  for (let s = 0; s < STRIPS; s++) {
    const a = STRIP0 + s * STRIP, b = a + STRIP;
    stampEach(ctx, each, `hubA|${s}|${lit}`, a, 196, STRIP, CANVAS_HEIGHT - 196 + 4, g => {
      g.save(); g.beginPath(); g.rect(a, 0, STRIP, CANVAS_HEIGHT + 10); g.clip();
      paintBack(g, a, b, lit);
      paintWalk(g, a, b);
      for (let i = 0; i < HUB_SLOTS; i++) for (const k of [0, HUB_CIRC]) { const cx = slotX(i) + k; if (SPOTS[i].kind === 'land' && cx + 60 > a && cx - 60 < b) paintPath(g, cx, stretchOf(i)); }
      g.restore();
    });
  }
  // What moves in them; America USA's gate and the staff door (theirs, as they were)
  for (let i = 0; i < HUB_SLOTS; i++) {
    const id = stretchOf(i);
    each(slotX(i), 280, x => {
      drawStretchLive(ctx, x, id, f);
    });
  }
  // The promenade's crowd, the parade
  drawCrowdMid(ctx, state, each);
  // The portals: the still part stamped, the swirl round it live
  for (let i = 0; i < HUB_SLOTS; i++) {
    const spot = SPOTS[i];
    if (spot.kind !== 'land') continue;
    const land = LANDS[spot.land], on = i === surge.slot, pf = on ? f + surge.phase : f;
    each(slotX(i), 120, x => {
      ctx.translate(x, 0); stamp(ctx, `hubP|${land.id}`, -110, 290, 220, 216, g => paintGate(g, land, 0)); ctx.translate(-x, 0);
      drawShimmer(ctx, land, x, pf);
      drawSwirl(ctx, land, x, pf, on ? surge.k : 0);
      // (its sign after the swirl: never under it)
      ctx.translate(x, 0); stamp(ctx, `hubPS|${land.id}`, -110, 330, 220, 72, g => paintGateSign(g, land, 0)); ctx.translate(-x, 0);
    });
  }
  // The fence along the back of the walk, the gateposts at the paths
  for (let s = 0; s < STRIPS; s++) {
    const a = STRIP0 + s * STRIP;
    stampEach(ctx, each, `hubC|${s}`, a, ROW.fence - 34, STRIP, 40, g => { g.save(); g.beginPath(); g.rect(a, 0, STRIP, CANVAS_HEIGHT); g.clip(); paintFence(g, a, a + STRIP); g.restore(); });
  }
  for (let i = 0; i < HUB_SLOTS; i++) {
    const spot = SPOTS[i];
    if (spot.kind !== 'land') continue;
    const land = LANDS[spot.land];
    each(slotX(i), 70, x => { ctx.translate(x, 0); stamp(ctx, `hubPost|${land.id}`, -70, ROW.fence - 76, 140, 82, g => paintPosts(g, land, 0)); ctx.translate(-x, 0); drawPostsLive(ctx, land, x, f); });
  }
  // The walk's crowd (behind him), balloons getting away
  drawCrowdWalk(ctx, state, each);
  // America USA's gate and the staff door (theirs, as they were: out at the front of the walk, the crowd behind them)
  for (let i = 0; i < HUB_SLOTS; i++) {
    const spot = SPOTS[i];
    if (spot.kind === 'staff') each(slotX(i), 280, x => staffDoor(ctx, x, f));
    else if (spot.kind === 'america') each(slotX(i), 140, x => drawAmericaExit(ctx, x, f));
  }
  drawLostBalloons(ctx, state, each);
  // The lamp posts at the seams, the signposts on them, the string lights between
  drawLights(ctx, state, each);
  for (let i = 0; i < HUB_SLOTS; i++) each(seamX(i), 110, x => lamp(ctx, x, i, f));
  // The cast, stood about
  drawCast(ctx, state, each);
};

/** In front, along the bottom edge of the plaza: flower beds, the pigeons. */
export const drawHubFront = (ctx: Ctx, state: GameState) => {
  const bottom = state.camera.y + CANVAS_HEIGHT, v = viewOf(state);
  for (let x = Math.floor((v.x - 120) / 380) * 380; x < v.x + v.w + 40; x += 380) {
    for (const [dx, r, c] of [[0, 34, '#2F6B3A'], [44, 26, '#3F8A4A'], [80, 30, '#2F6B3A']] as const) {
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + dx, bottom + 8, r, Math.PI, 0); ctx.fill();
      ctx.fillStyle = lite(c, 0.15); ctx.beginPath(); ctx.arc(x + dx - r * 0.3, bottom + 4, r * 0.5, Math.PI, 0); ctx.fill();
    }
    for (let k = 0; k < 6; k++) box(ctx, x - 20 + k * 20, bottom - 22 - (k % 3) * 5, 5, 5, ['#F472B6', '#FDE047', '#F87171'][k % 3]);
  }
  drawPigeons(ctx, state, eachOf(state));
};

/** What a spot's called on a signpost. */
const spotName = (slot: number) => { const s = SPOTS[((slot % HUB_SLOTS) + HUB_SLOTS) % HUB_SLOTS]; return s.kind === 'land' ? LANDS[s.land].name : s.kind === 'america' ? 'AMERICA USA' : 'STAFF ONLY'; };
const spotLook = (slot: number) => { const id = stretchOf(slot); return LAND_LOOK[id]?.(false) ?? { sx: 1, sy: 1, fill: '#F8FAFC' }; };
const spotBoard = (slot: number) => { const s = SPOTS[((slot % HUB_SLOTS) + HUB_SLOTS) % HUB_SLOTS]; return s.kind === 'land' ? LANDS[s.land].sign : s.kind === 'america' ? '#1E3A8A' : '#57534E'; };

/** A lamp post at the seam between two stretches: the post, its glass, a banner, and the signpost on it pointing
 * both ways (the land each way, in its own lettering, on its own color). Stamped; the glass lit live after dark. */
const lamp = (ctx: Ctx, x: number, i: number, f: number) => {
  const top = GROUND_Y - 230;
  ctx.translate(x, 0);
  stamp(ctx, `hubLamp|${i}`, -120, top - 30, 240, 236, g => {
    box(g, -5, top, 10, 230, INK); box(g, -4, top, 8, 230, '#1F2937'); box(g, -4, top, 3, 230, '#4B5563');
    box(g, -12, GROUND_Y - 14, 24, 14, '#111827'); box(g, -10, GROUND_Y - 12, 6, 10, '#374151');
    box(g, -14, top - 2, 28, 4, '#111827');
    // (the signpost: an arrow board each way)
    for (const [dir, slot, y] of [[-1, i - 1, top + 70], [1, i, top + 92]] as const) {
      const L = spotLook(slot), name = spotName(slot), w = signW(name, L) + 18, col = spotBoard(slot);
      const x0 = dir < 0 ? -6 - w : 6, x1 = dir < 0 ? -6 : 6 + w, tip = dir < 0 ? x0 - 8 : x1 + 8;
      g.beginPath(); g.moveTo(dir < 0 ? x1 : x0, y - 9); g.lineTo(dir < 0 ? x0 : x1, y - 9); g.lineTo(tip, y); g.lineTo(dir < 0 ? x0 : x1, y + 9); g.lineTo(dir < 0 ? x1 : x0, y + 9); g.closePath();
      g.fillStyle = col; g.fill(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke();
      box(g, Math.min(x0, x1) + 1, y - 8, w - 2, 2, mix(col, '#FFFFFF', 0.25));
      signText(g, name, (x0 + x1) / 2 + dir * 3, y + 4, L);
    }
    // (a banner: HAPPY LAND)
    const land = LANDS[((i % LANDS.length) + LANDS.length) % LANDS.length];
    g.fillStyle = land.sign; g.beginPath(); g.moveTo(4, top + 116); g.lineTo(34, top + 116); g.lineTo(34, top + 170); g.lineTo(19, top + 162); g.lineTo(4, top + 170); g.closePath(); g.fill();
    g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
    signAt(g, 'HAPPY', 19, top + 134, 6, enamel(6, land.signText)); signAt(g, 'LAND', 19, top + 146, 6, enamel(6, land.signText));
  });
  ctx.translate(-x, 0);
  // (its glass: lit up as it gets dark, a glow round it over the dark: drawHubLampGlow)
  ink(ctx, () => ctx.roundRect(x - 12, top - 26, 24, 26, [10, 10, 2, 2]), mix('#FEF3C7', '#FFFBEB', lampGlow()));
  if (lampGlow() > 0.3) box(ctx, x - 6, top - 20, 12, 14, '#FFFFFF');
  void f;
};

/** String lights swagged lamp to lamp over the walk: bulbs in the land colors, twinkling round (brighter after dark). */
const BULBS = ['#F87171', '#FDE047', '#4ADE80', '#60A5FA', '#F472B6', '#FB923C'];
const drawLights = (ctx: Ctx, state: GameState, each: Each) => {
  const f = state.frame, y0 = GROUND_Y - 226, sag = 26, night = lampGlow();
  for (let i = 0; i < HUB_SLOTS; i++) each(seamX(i) + HUB.slot / 2, HUB.slot / 2, mx => {
    const a = mx - HUB.slot / 2;
    ctx.strokeStyle = '#27272A'; ctx.lineWidth = 1; ctx.beginPath();
    for (let k = 0; k <= 12; k++) { const u = k / 12; ctx.lineTo(a + u * HUB.slot, y0 + sag * 4 * u * (1 - u)); }
    ctx.stroke();
    for (let k = 1; k < 30; k++) {
      const u = k / 30, bx = a + u * HUB.slot, by = y0 + sag * 4 * u * (1 - u) + 2;
      const on = night > 0.3 || ((k + (f >> 4)) % 6) !== 0;
      box(ctx, bx - 1, by, 3, 3, on ? (night > 0.3 ? mix(BULBS[(k + i) % 6], '#FFFFFF', 0.4) : BULBS[(k + i) % 6]) : '#57534E');
    }
  });
};

/**
 * The building the staff door's in: the ugly back of something the guests aren't meant to see. Cinderblock gone gray-
 * brown with dirt, the paint peeling off it in sheets, water stains and rust bleeding down from a gutter that's lost a
 * length, a wall air conditioner dripping into a bucket, conduit and a pipe running up it, a caged bulb flickering
 * over the door, one window, wired glass, cracked, a vent furred with grease, a NO SMOKING sign with butts round it.
 */
const backBuilding = (ctx: Ctx, cx: number, f: number) => {
  const x0 = cx - 90, x1 = cx + 210, top = GROUND_Y - 250;
  ink(ctx, () => ctx.rect(x0, top, x1 - x0, GROUND_Y - top), '#6B6256', 2);
  bands(ctx, x0 + 2, top + 2, x1 - x0 - 4, GROUND_Y - top - 2, ['#7A7062', '#73695B', '#6B6153', '#62594B', '#5A5144']);
  // (the blocks)
  for (let y = top + 14; y < GROUND_Y; y += 14) { box(ctx, x0 + 2, y, x1 - x0 - 4, 1, '#4E463A'); for (let x = x0 + ((y - top) / 14 % 2 ? 14 : 0); x < x1; x += 28) box(ctx, x, y - 13, 1, 13, '#4E463A'); }
  // (peeling paint: what's left of the theme-park cream, in patches with curled edges)
  for (const [px, py, pw, ph] of [[x0 + 10, top + 40, 60, 40], [x0 + 150, top + 18, 80, 30], [x0 + 200, top + 120, 70, 50], [x0 + 20, top + 150, 40, 60]] as const) {
    box(ctx, px, py, pw, ph, '#CFC3A6'); box(ctx, px, py, pw, 2, '#E8DEC4');
    for (let k = 0; k < pw; k += 9) box(ctx, px + k, py + ph - ((k * 7) % 9), 6, 3 + ((k * 3) % 5), '#7A7062');
  }
  // (the gutter, a length gone; rust and water bleeding down from it)
  box(ctx, x0, top, x1 - x0, 6, '#57534E'); box(ctx, x0 + 120, top, 40, 6, '#7A7062');
  for (let k = 0; k < 9; k++) { const rx = x0 + 118 + k * 5, len = 60 + ((k * 31) % 90); box(ctx, rx, top + 6, 3, len, k % 3 ? 'rgba(120, 60, 20, 0.55)' : 'rgba(40, 34, 24, 0.5)'); }
  // (conduit and a pipe up the wall)
  box(ctx, x0 + 72, top + 6, 5, GROUND_Y - top - 6, '#6B7280'); for (let y = top + 30; y < GROUND_Y; y += 50) box(ctx, x0 + 70, y, 9, 4, '#4B5563');
  box(ctx, x1 - 26, top + 6, 8, GROUND_Y - top - 6, '#7C2D12'); box(ctx, x1 - 26, top + 6, 2, GROUND_Y - top - 6, '#9A3412');
  // (the window: wired glass, cracked, filthy)
  ink(ctx, () => ctx.rect(cx + 70, top + 60, 56, 40), '#3F3F46', 2);
  box(ctx, cx + 73, top + 63, 50, 34, '#8FA3A8'); for (let k = 0; k < 6; k++) { box(ctx, cx + 73 + k * 9, top + 63, 1, 34, '#52525B'); box(ctx, cx + 73, top + 63 + k * 7, 50, 1, '#52525B'); }
  ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + 80, top + 66); ctx.lineTo(cx + 96, top + 82); ctx.lineTo(cx + 92, top + 95); ctx.moveTo(cx + 96, top + 82); ctx.lineTo(cx + 116, top + 78); ctx.stroke();
  box(ctx, cx + 73, top + 88, 50, 9, 'rgba(60, 50, 30, 0.6)');
  // (the air conditioner, dripping into a bucket)
  ink(ctx, () => ctx.rect(cx + 140, top + 120, 48, 30), '#A8A29E', 2);
  for (let k = 0; k < 5; k++) box(ctx, cx + 144, top + 124 + k * 5, 40, 2, '#78716C');
  box(ctx, cx + 140, top + 150, 48, 4, 'rgba(120, 60, 20, 0.6)');
  const d = (f * 0.7) % 60; box(ctx, cx + 170, top + 154 + d * 1.6, 2, 3, '#7DD3FC');
  ink(ctx, () => ctx.rect(cx + 162, GROUND_Y - 22, 18, 22), '#F97316'); box(ctx, cx + 164, GROUND_Y - 20, 14, 3, '#5B4A2A');
  // (the vent, furred with grease)
  ink(ctx, () => ctx.rect(x0 + 16, top + 96, 40, 28), '#52525B', 2); for (let k = 0; k < 5; k++) box(ctx, x0 + 19, top + 100 + k * 5, 34, 2, '#27272A');
  box(ctx, x0 + 16, top + 124, 40, 22, 'rgba(30, 24, 12, 0.5)');
  // (the caged bulb over the door, flickering)
  const on = (f % 97) > 6 && (f % 31) > 2;
  if (on) { ctx.fillStyle = 'rgba(253, 230, 138, 0.18)'; ctx.beginPath(); ctx.moveTo(cx - 6, GROUND_Y - 138); ctx.lineTo(cx - 60, GROUND_Y); ctx.lineTo(cx + 60, GROUND_Y); ctx.lineTo(cx + 6, GROUND_Y - 138); ctx.fill(); }
  ink(ctx, () => ctx.rect(cx - 7, GROUND_Y - 146, 14, 10), '#3F3F46'); box(ctx, cx - 4, GROUND_Y - 142, 8, 6, on ? '#FDE68A' : '#57534E');
  box(ctx, cx - 7, GROUND_Y - 142, 14, 1, '#18181B'); box(ctx, cx, GROUND_Y - 146, 1, 10, '#18181B');
  // (NO SMOKING, and the butts all round under it)
  ink(ctx, () => ctx.rect(x0 + 2, GROUND_Y - 88, 50, 20), '#F8FAFC'); signAt(ctx, 'NO', x0 + 27, GROUND_Y - 80, 5, enamel(5, '#DC2626')); signAt(ctx, 'SMOKING', x0 + 27, GROUND_Y - 72, 5, enamel(5, '#DC2626'));
  for (let k = 0; k < 9; k++) box(ctx, x0 + 8 + ((k * 23) % 50), GROUND_Y - 2 - (k % 2), 4, 1, k % 3 ? '#F5F5F4' : '#D97706');
};

/**
 * The dumpster the staff door's round the back of: a filthy green one, dented, rust bleeding down it, grime streaked
 * down from under the lid; the lid propped up on the trash bags it can't shut on, more bags heaped on top and split,
 * more dumped on the ground round it, a leak from under it gone into a puddle; flies. `x0` its left end.
 */
const dumpster = (ctx: Ctx, x0: number, f: number) => {
  const W = 128, H = 66, top = GROUND_Y - H;
  // The puddle it's leaking into
  ctx.fillStyle = '#5B4A2A'; ctx.beginPath(); ctx.ellipse(x0 + W * 0.55, GROUND_Y + 6, 72, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7A6436'; ctx.beginPath(); ctx.ellipse(x0 + W * 0.5, GROUND_Y + 5, 40, 3, 0, 0, Math.PI * 2); ctx.fill();
  // The bin: banded green steel, a darker skirt, wheels, a dent
  ink(ctx, () => { ctx.moveTo(x0, top + 6); ctx.lineTo(x0 + W, top); ctx.lineTo(x0 + W - 6, GROUND_Y - 6); ctx.lineTo(x0 + 6, GROUND_Y - 6); ctx.closePath(); }, '#2F5D3A', 2);
  bands(ctx, x0 + 6, top + 10, W - 14, H - 18, ['#3B6E46', '#336240', '#2B5638', '#244B30']);
  box(ctx, x0 + 4, top + 8, W - 8, 4, '#4C8159');
  for (let k = 1; k < 4; k++) box(ctx, x0 + k * (W / 4), top + 10, 2, H - 18, '#1E3F27');
  ctx.fillStyle = '#1E3F27'; ctx.beginPath(); ctx.ellipse(x0 + 38, top + 34, 10, 6, 0.3, 0, Math.PI * 2); ctx.fill();
  // (rust bleeding down from the seams, grime streaks down from the lid, a sticker, half of it gone)
  for (let k = 0; k < 7; k++) { const rx = x0 + 12 + k * 17, len = 10 + ((k * 13) % 22); box(ctx, rx, top + 12, 3, len, k % 2 ? '#8B4A1C' : '#6B3A18'); box(ctx, rx + 1, top + 12 + len, 1, 4, '#8B4A1C'); }
  for (let k = 0; k < 9; k++) box(ctx, x0 + 8 + k * 13, top + 12, 2, 6 + (k * 7) % 14, 'rgba(30, 24, 12, 0.55)');
  box(ctx, x0 + 82, top + 26, 26, 14, '#F5F5F4'); box(ctx, x0 + 82, top + 26, 26, 3, '#DC2626'); box(ctx, x0 + 96, top + 30, 12, 10, '#336240');
  for (const wx of [x0 + 14, x0 + W - 22]) { ink(ctx, () => ctx.arc(wx, GROUND_Y - 4, 5, 0, Math.PI * 2), '#18181B'); box(ctx, wx - 1, GROUND_Y - 5, 2, 2, '#52525B'); }
  // The leak, dripping
  const drip = (f * 0.6) % 10;
  box(ctx, x0 + 60, GROUND_Y - 6, 3, 4, '#5B4A2A'); box(ctx, x0 + 61, GROUND_Y - 2 + drip * 0.4, 2, 2, '#7A6436');
  // The bags: heaped over the rim and propping the lid up, split, a few dumped on the ground
  const bag = (bx: number, by: number, r: number, c: string, split = false) => {
    ink(ctx, () => { ctx.ellipse(bx, by, r, r * 0.82, 0, 0, Math.PI * 2); }, c);
    box(ctx, bx - r * 0.5, by - r * 0.55, r * 0.5, 2, lite(c, 0.25));
    ctx.fillStyle = dark(c, 0.4); ctx.beginPath(); ctx.moveTo(bx - 3, by - r * 0.8); ctx.lineTo(bx, by - r * 1.05); ctx.lineTo(bx + 3, by - r * 0.8); ctx.fill();
    if (split) { box(ctx, bx - 4, by + 1, 8, 4, '#E7E5E4'); box(ctx, bx + 2, by + 3, 5, 3, '#F59E0B'); box(ctx, bx - 6, by + 4, 4, 2, '#65A30D'); }
  };
  for (const [bx, by, r, c, sp] of [[x0 + 18, top - 6, 16, '#18181B', false], [x0 + 46, top - 12, 19, '#27272A', true], [x0 + 78, top - 9, 17, '#1F2937', false], [x0 + 106, top - 7, 15, '#14532D', true], [x0 + 60, top - 26, 14, '#18181B', false]] as const) bag(bx, by, r, c, sp);
  // (the lid, propped up on them)
  ctx.save(); ctx.translate(x0 + 2, top + 2); ctx.rotate(-0.42);
  ink(ctx, () => ctx.rect(0, -6, W - 4, 7), '#1F3B27', 2); box(ctx, 2, -5, W - 10, 2, '#3B6E46');
  ctx.restore();
  for (const [bx, by, r, c, sp] of [[x0 - 10, GROUND_Y - 10, 13, '#27272A', true], [x0 + W + 8, GROUND_Y - 11, 14, '#18181B', false], [x0 + W + 30, GROUND_Y - 8, 10, '#1F2937', true]] as const) bag(bx, by, r, c, sp);
  // (a pizza box, a banana peel, a cup)
  ink(ctx, () => ctx.rect(x0 + W - 4, GROUND_Y - 4, 26, 4), '#D6A35C'); box(ctx, x0 + W + 2, GROUND_Y - 3, 8, 1, '#B91C1C');
  box(ctx, x0 + 24, GROUND_Y - 2, 8, 2, '#FACC15'); box(ctx, x0 + 22, GROUND_Y - 4, 3, 2, '#FACC15'); box(ctx, x0 + 31, GROUND_Y - 4, 3, 2, '#A16207');
  ink(ctx, () => ctx.rect(x0 + W + 44, GROUND_Y - 9, 6, 9), '#F8FAFC'); box(ctx, x0 + W + 44, GROUND_Y - 9, 6, 2, '#DC2626');
  // The stink, coming up off it, and the flies round it
  for (let k = 0; k < 3; k++) { const t = ((f * 0.5 + k * 40) % 120) / 120; ctx.strokeStyle = `rgba(132, 204, 22, ${(0.45 * (1 - t)).toFixed(2)})`; ctx.lineWidth = 2; ctx.beginPath(); const sx = x0 + 30 + k * 34; for (let j = 0; j <= 6; j++) ctx.lineTo(sx + Math.sin(j * 1.3 + f * 0.05 + k) * 5, top - 20 - t * 40 - j * 6); ctx.stroke(); }
  for (let k = 0; k < 7; k++) { const a = f * (0.09 + k * 0.012) + k * 2.1; box(ctx, x0 + W / 2 + Math.cos(a) * (40 + k * 5), top - 18 + Math.sin(a * 1.7) * 18, 2, 2, '#0A0A0A'); }
};

/** Between Foreign Lands and Space Land: a plain gray door in the wall, STAFF ONLY. */
const staffDoor = (ctx: Ctx, cx: number, f: number) => {
  backBuilding(ctx, cx, f);
  dumpster(ctx, cx + 36, f);
  ink(ctx, () => ctx.rect(cx - 30, GROUND_Y - 110, 60, 110), '#9CA3AF');
  box(ctx, cx - 26, GROUND_Y - 106, 52, 106, '#6B7280'); box(ctx, cx - 26, GROUND_Y - 106, 6, 106, '#7C8592');
  box(ctx, cx + 14, GROUND_Y - 58, 6, 4, '#E5E7EB');
  ink(ctx, () => ctx.rect(cx - 24, GROUND_Y - 96, 48, 16), '#DC2626');
  signAt(ctx, 'STAFF', cx, GROUND_Y - 89, 6, enamel(6, '#FFFFFF')); signAt(ctx, 'ONLY', cx, GROUND_Y - 82, 6, enamel(6, '#FFFFFF'));
  // (a sticky note on it, flapping)
  ctx.save(); ctx.translate(cx - 10, GROUND_Y - 70); ctx.rotate(Math.sin(f * 0.05) * 0.06);
  box(ctx, 0, 0, 18, 16, '#FDE047'); ctx.fillStyle = '#1E3A8A'; ctx.font = '4px "Press Start 2P"'; ctx.fillText('NO', 2, 7); ctx.fillText('GUESTS', 2, 13);
  ctx.restore();
};

/**
 * After dark, the lamp posts' glow (screen space, over the time of day's dark: the hub's a cylinder seen from inside,
 * so each lamp's put where the wrap puts it). Stepped rings, added on.
 */
export const drawHubLampGlow = (ctx: Ctx, state: GameState, radius: number, horizon: number, zoom?: { scale: number; x: number; y: number } | null) => {
  const k = lampGlow();
  if (k <= 0.05) return;
  const half = CANVAS_WIDTH / 2, top = GROUND_Y - 230 - 13;
  // (pushed in (the stage's zoom): where the world pass put it on the flat strip, before the wall's wrapped round)
  const zs = zoom?.scale ?? 1, zx = zoom?.x ?? 0, zy = zoom?.y ?? 0;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < HUB_SLOTS; i++) laps(state, HUB.x0 + i * HUB.slot, x => {
    const u = (x - zx) * zs + zx - state.camera.x, v = (top - zy) * zs + zy - state.camera.y;
    const a = (u - half) / radius;
    if (Math.abs(a) > 1.2) return;
    const c = Math.cos(a), sx = half + radius * Math.tan(a), sy = horizon + (v - horizon) / c;
    if (sx < -120 * zs || sx > CANVAS_WIDTH + 120 * zs) return;
    const r = (70 * zs) / c;
    for (let ring = 3; ring >= 1; ring--) {
      ctx.fillStyle = `rgba(255, 176, 84, ${(0.06 * k * (4 - ring) / 2).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(Math.round(sx), Math.round(sy), r * (0.35 + ring * 0.22), 0, Math.PI * 2); ctx.fill();
    }
    // (the glass itself, lit: back up out of the dark)
    ctx.fillStyle = `rgba(255, 236, 190, ${(0.75 * k).toFixed(3)})`;
    ctx.beginPath(); ctx.roundRect(Math.round(sx - (10 * zs) / c), Math.round(sy - (11 * zs) / c), Math.round((20 * zs) / c), Math.round((22 * zs) / c), [(8 * zs) / c, (8 * zs) / c, 2, 2]); ctx.fill();
  });
  ctx.restore();
};
