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
import { INK, ink } from '../../m1/game/render/npc/kit';
import { mix } from '../../m1/game/render/backdrops/core';
import { stamp } from '../../m1/game/render/stamp';
import { LANDS, SPOTS, HUB_SLOTS } from './lands';
import { HUB, HUB_CIRC, HUB_HORIZON, slotX, seamX, ROW } from './geometry';
import { drawCrowdMid, drawCrowdWalk, drawCast, drawPigeons, drawLostBalloons } from './crowd';
import { paintBack, paintWalk, paintPath, paintFence, drawStretchLive, stretchOf, LAND_LOOK } from './stretch';
import { paintGate, paintGateSign, paintPosts, drawSwirl, drawShimmer, drawPostsLive, drawClearFlag } from './gates';
import { isLandCleared, isLandComplete } from '../store';
import { timeOfDay, skyRamp, sunAt, sunTint, cloudTint, farTint, drawStars, drawMoon, lampGlow } from '../timeOfDay';
import { noteSun, drawSunGlare } from '../sunFlare';
import { signText, signAt, signW, enamel } from './letters';
import { paintLandmark, paintAmericaLandmark, paintSkyline, drawFarLive, paintTreeline, paintCloud, paintBlimp, paintHotAir, landmarkBox, SKYLINE_BOX } from './far';
import { checker } from './kit';
import { drawAmericaExit } from './exit';
import { paintFlowerBed } from './props';
import { drawStaffDoor, STAFF_REACH } from './staffDoor';

type Ctx = CanvasRenderingContext2D;
type Each = (x: number, r: number, draw: (x: number) => void) => void;
const box = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/** Bands top to bottom through the colors. */
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
  dithered(ctx, 0, 0, CANVAS_WIDTH, 470, skyRamp(SKY, tod));
  drawStars(ctx, 0, 0, CANVAS_WIDTH, 400, state.frame, 0, tod);
  drawMoon(ctx, 610, 96, 20, tod);
  const lawn = ['#3A7A44', '#2F6B3A', '#2A6034', '#25562F', '#204C2A'].map(c => farTint(c, 0.3, tod));
  dithered(ctx, 0, 472, CANVAS_WIDTH, CANVAS_HEIGHT - 472, lawn);
  ctx.fillStyle = lawn[0]; for (let x = 0; x < CANVAS_WIDTH; x += 5) ctx.fillRect(x + ((x * 7) % 3), 471 + ((x * 13) % 3), 1, 2);
};
/** Bands top to bottom through the colors, a row of dither at each seam (each band reaching into the one above). */
const dithered = (ctx: Ctx, x: number, y: number, w: number, h: number, cs: string[]) => {
  const bh = h / cs.length;
  cs.forEach((c, i) => box(ctx, x, y + i * bh, w, bh + 1, c));
  for (let i = 1; i < cs.length; i++) { checker(ctx, x, Math.round(y + i * bh) - 2, w, 2, cs[i]); checker(ctx, x, Math.round(y + i * bh), w, 2, cs[i - 1], 1); }
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
    ctx.save(); ctx.globalAlpha = sun.up; ctx.translate(Math.round(x), Math.round(sun.y));
    const k = 1 + Math.max(0, 0.4 - tod.sunH) * 0.4;
    stamp(ctx, `hubSun|${tod.key}`, -70, -70, 140, 140, g => {
      const rings = [[46, '#F8E4B0'], [38, '#FBEFC6'], [30, '#FFF7DC'], [24, '#FFFDF2']] as const;
      rings.forEach(([r, c], i) => {
        g.fillStyle = sunTint(c, tod); g.beginPath(); g.arc(0, 0, r * k, 0, Math.PI * 2); g.fill();
        if (i < rings.length - 1) { g.save(); g.beginPath(); g.arc(0, 0, r * k, 0, Math.PI * 2); g.arc(0, 0, (rings[i + 1][0] + 0.5) * k + 2, 0, Math.PI * 2, true); g.clip(); checker(g, -r * k, -r * k, r * k * 2, r * k * 2, sunTint(rings[i + 1][1], tod)); g.restore(); }
      });
      g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(-6 * k, -6 * k, 8 * k, 0, Math.PI * 2); g.fill();
    });
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
  const Y = top + 440, SB = SKYLINE_BOX;
  SPOTS.forEach((s, i) => {
    const bx = slotX(i), id = stretchOf(i);
    // (the landmark and the band of rides in front of it in one stamp: one put down for the lot)
    const LB = landmarkBox(id);
    if (s.kind === 'land') stampEach(ctx, each, `hubL2|${id}|${tod.key}`, bx + LB.x, Y + LB.y, LB.w, LB.h, g => { paintLandmark(g, id, bx, Y); paintSkyline(g, id, bx, Y - 10); });
    else {
      stampEach(ctx, each, `hubS|${id}|${tod.key}`, bx + SB.x, Y - 10 + SB.y, SB.w, SB.h, g => paintSkyline(g, id, bx, Y - 10));
      if (s.kind === 'america') { const fi = Math.floor(f / 12) % 10; stampEach(ctx, each, `hubL2|america|${fi}|${tod.key}`, bx - 50, Y - 350, 230, 352, g => paintAmericaLandmark(g, bx, Y, fi * 12.5)); }
    }
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
      // (cleared: its flag, clamped to the sign's end)
      if (isLandCleared(land.id)) drawClearFlag(ctx, land, x, f, isLandComplete(land.id) ? '100%' : 'CLEAR');
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
    if (spot.kind === 'staff') each(slotX(i), STAFF_REACH, x => drawStaffDoor(ctx, x, f));
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
    const kd = Math.abs(Math.round(x / 380)) % 3;
    ctx.translate(x, bottom); stamp(ctx, `hubBed|${kd}`, -40, -30, 160, 40, g => paintFlowerBed(g, kd)); ctx.translate(-x, -bottom);
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
    // (the post: cast iron, fluted, banded; its stepped plinth; the crown under the lantern, its arms)
    const I = ['#0B0F17', '#151B26', '#1F2937', '#374151', '#4B5563', '#6B7280'];
    box(g, -5, top, 10, 230, INK);
    for (let u = 0; u < 8; u += 2) box(g, -4 + u, top, 2, 230, I[[4, 5, 3, 2][u / 2]]);
    for (let y = top + 30; y < GROUND_Y - 30; y += 3) box(g, -1, y, 1, 2, I[2]);
    for (const y of [top + 24, top + 108, GROUND_Y - 44]) { box(g, -7, y, 14, 5, INK); box(g, -6, y + 1, 12, 3, I[3]); box(g, -6, y + 1, 12, 1, I[5]); }
    box(g, -12, GROUND_Y - 30, 24, 30, INK); box(g, -11, GROUND_Y - 29, 22, 29, I[2]); box(g, -11, GROUND_Y - 29, 4, 29, I[4]); box(g, 6, GROUND_Y - 29, 5, 29, I[1]);
    box(g, -15, GROUND_Y - 8, 30, 8, INK); box(g, -14, GROUND_Y - 7, 28, 7, I[3]); box(g, -14, GROUND_Y - 7, 28, 1, I[5]);
    box(g, -9, GROUND_Y - 24, 18, 10, I[1]); box(g, -8, GROUND_Y - 23, 16, 8, '#C9A227'); signText(g, 'HL', 0, GROUND_Y - 16, { sx: 1, sy: 1, fill: '#1F2937' });
    box(g, -10, top - 4, 20, 6, INK); box(g, -9, top - 3, 18, 4, I[3]); box(g, -9, top - 3, 18, 1, I[5]);
    for (const s2 of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(0, top + 18); g.quadraticCurveTo(s2 * 14, top + 16, s2 * 10, top + 2); g.stroke(); g.strokeStyle = I[4]; g.lineWidth = 1; g.stroke(); }
    // (string-light hooks)
    box(g, -8, top + 4, 16, 2, I[1]);
    // (the signpost: an arrow board each way)
    for (const [dir, slot, y] of [[-1, i - 1, top + 70], [1, i, top + 92]] as const) {
      const L = spotLook(slot), name = spotName(slot), w = signW(name, L) + 18, col = spotBoard(slot);
      const x0 = dir < 0 ? -6 - w : 6, x1 = dir < 0 ? -6 : 6 + w, tip = dir < 0 ? x0 - 8 : x1 + 8;
      g.beginPath(); g.moveTo(dir < 0 ? x1 : x0, y - 9); g.lineTo(dir < 0 ? x0 : x1, y - 9); g.lineTo(tip, y); g.lineTo(dir < 0 ? x0 : x1, y + 9); g.lineTo(dir < 0 ? x1 : x0, y + 9); g.closePath();
      g.fillStyle = col; g.fill(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke();
      box(g, Math.min(x0, x1) + 1, y - 8, w - 2, 2, mix(col, '#FFFFFF', 0.28)); box(g, Math.min(x0, x1) + 1, y + 6, w - 2, 2, mix(col, '#000000', 0.3));
      for (let k = 0; k < 3; k++) box(g, Math.min(x0, x1) + 4 + k * 13, y - 4 + (k % 2) * 6, 7, 1, mix(col, '#000000', 0.14));
      for (const bx of [Math.min(x0, x1) + 2, Math.max(x0, x1) - 4]) { box(g, bx, y - 1, 2, 2, mix(col, '#000000', 0.45)); box(g, bx, y - 1, 1, 1, mix(col, '#FFFFFF', 0.5)); }
      box(g, dir < 0 ? -6 : 4, y - 3, 2, 6, '#1F2937');
      signText(g, name, (x0 + x1) / 2 + dir * 3, y + 4, L);
    }
    // (a banner: HAPPY LAND)
    const land = LANDS[((i % LANDS.length) + LANDS.length) % LANDS.length];
    g.fillStyle = land.sign; g.beginPath(); g.moveTo(4, top + 116); g.lineTo(34, top + 116); g.lineTo(34, top + 170); g.lineTo(19, top + 162); g.lineTo(4, top + 170); g.closePath(); g.fill();
    g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
    box(g, 5, top + 117, 4, 44, mix(land.sign, '#FFFFFF', 0.25)); box(g, 29, top + 117, 4, 44, mix(land.sign, '#000000', 0.3)); checker(g, 9, top + 117, 2, 44, mix(land.sign, '#FFFFFF', 0.25));
    box(g, 2, top + 113, 34, 3, INK); box(g, 3, top + 114, 32, 1, '#9CA3AF'); box(g, 0, top + 112, 4, 5, '#C9A227'); box(g, 34, top + 112, 4, 5, '#C9A227');
    box(g, 5, top + 120, 28, 1, '#C9A227'); box(g, 5, top + 154, 28, 1, '#C9A227');
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
