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
import { LANDS, SPOTS, HUB_SLOTS, type Land } from './lands';
import { HUB, HUB_CIRC, HUB_HORIZON, slotX, seamX, ROW } from './geometry';
import { drawCrowdMid, drawCrowdWalk, drawCast, drawPigeons, drawLostBalloons } from './crowd';
import { paintBack, paintWalk, paintPath, paintFence, drawStretchLive, stretchOf, LAND_LOOK } from './stretch';
import { paintGate, paintPosts, drawSwirl, drawShimmer, drawPostsLive } from './gates';
import { timeOfDay, skyRamp, skyTint, sunAt, sunTint, cloudTint, farTint, drawStars, drawMoon, lampGlow } from '../timeOfDay';
import { noteSun, drawSunGlare } from '../sunFlare';
import { signText, signAt, signW, gate, hillside, enamel } from './letters';

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
  // Clouds drifting
  const cloud = [cloudTint('#E8EEF8', tod), cloudTint('#FFFFFF', tod), cloudTint('#D3DCEB', tod)];
  for (let i = 0; i < 9; i++) each(HUB.x0 + i * (HUB_CIRC / 9) + ((f * 0.15 + i * 97) % (HUB_CIRC / 9)), 90, x => {
    const y = top + 60 + (i % 3) * 46;
    for (const [dx, r] of [[-30, 16], [0, 24], [28, 18], [52, 12]] as const) { ctx.fillStyle = cloud[0]; ctx.beginPath(); ctx.arc(x + dx, y, r, Math.PI, 0); ctx.fill(); ctx.fillStyle = cloud[1]; ctx.beginPath(); ctx.arc(x + dx - 2, y - 3, r * 0.7, Math.PI, 0); ctx.fill(); }
    box(ctx, x - 46, y, 110, 4, cloud[2]);
  });
  // (gulls, high up, going round)
  for (let i = 0; i < 5; i++) each(HUB.x0 + ((i * 1100 + f * (0.6 + i * 0.1)) % HUB_CIRC), 20, x => {
    const y = top + 140 + i * 18 + Math.sin(f * 0.03 + i) * 6, fl = ((f >> 3) + i) % 2 ? 3 : -1;
    ctx.strokeStyle = '#3F3F46'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 6, y + fl); ctx.lineTo(x, y); ctx.lineTo(x + 6, y + fl); ctx.stroke();
  });
  // Each land's landmark on the skyline, right behind its stretch (stamped)
  SPOTS.forEach((s, i) => {
    const bx = slotX(i);
    if (s.kind === 'land') stampEach(ctx, each, `hubL|${LANDS[s.land].id}|${todKey}`, bx - 240, top + 140, 480, 310, g => landmark(g, LANDS[s.land], bx, top + 440, 0));
    else if (s.kind === 'america') { const fi = Math.floor(f / 12) % 10; stampEach(ctx, each, `hubL|america|${fi}|${todKey}`, bx - 40, top + 120, 200, 330, g => americaLandmark(g, bx, top + 440, fi * 12.5)); }
  });
  // The haze down at the horizon
  const [hr, hg, hb] = [1, 3, 5].map(i => parseInt(mix('#F6E7D2', tod.haze, tod.skyK).slice(i, i + 2), 16));
  for (let i = 0; i < 4; i++) { ctx.fillStyle = `rgba(${hr}, ${hg}, ${hb}, ${(0.12 + i * 0.1).toFixed(2)})`; ctx.fillRect(x0, top + 380 + i * 18, x1 - x0, 18); }
  // The treeline, and the monorail on its beam with the train going round
  for (let x = Math.floor(x0 / 60) * 60; x < x1; x += 60) {
    const r = 22 + (Math.abs(x / 60) * 7) % 14;
    ctx.fillStyle = '#2F6B3A'; ctx.beginPath(); ctx.arc(x, top + 462, r, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#3F8A4A'; ctx.beginPath(); ctx.arc(x - r * 0.25, top + 458, r * 0.6, Math.PI, 0); ctx.fill();
  }
  box(ctx, x0, top + 400, x1 - x0, 8, '#D6D3D1'); box(ctx, x0, top + 400, x1 - x0, 2, '#F5F5F4'); box(ctx, x0, top + 406, x1 - x0, 2, '#A8A29E');
  for (let x = Math.floor(x0 / 320) * 320; x < x1; x += 320) { box(ctx, x - 4, top + 408, 8, 60, '#A8A29E'); box(ctx, x - 4, top + 408, 3, 60, '#D6D3D1'); }
  each(HUB.x0 + HUB_CIRC - ((f * 2.2) % HUB_CIRC) + 128, 130, xx => {
    const x = xx - 128;
    for (let c = 0; c < 4; c++) {
      const cx = x + c * 64;
      ink(ctx, () => ctx.roundRect(cx, top + 376, 60, 24, [c === 0 ? 12 : 3, c === 3 ? 12 : 3, 2, 2]), c % 2 ? '#38BDF8' : '#F8FAFC');
      for (let w = 0; w < 3; w++) box(ctx, cx + 8 + w * 16, top + 382, 10, 7, '#1E3A8A');
    }
  });
  box(ctx, x0, top + 468, x1 - x0, 4, '#24542F');
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
    else if (spot.kind === 'america') each(slotX(i), 140, x => americaGate(ctx, x, f));
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

/** A land's big landmark, its base on (x, y): hazed into the sky by distance (flat, with a lit edge). */
const landmark = (ctx: Ctx, land: Land, x: number, y: number, f: number) => {
  const haze = (c: string) => mix(c, skyTint('#B7CDF4', 0.8), 0.42);
  const fill = (c: string, path: () => void) => { ctx.fillStyle = haze(c); ctx.beginPath(); path(); ctx.fill(); };
  const rect = (rx: number, ry: number, w: number, h: number, c: string) => box(ctx, x + rx, y + ry, w, h, haze(c));
  switch (land.id) {
    case 'space': {
      // The needle tower with its saucer, a rocket on its pad, a ringed planet hung over it
      rect(-6, -260, 12, 260, '#CBD5E1'); rect(-6, -260, 4, 260, '#F1F5F9');
      fill('#E2E8F0', () => ctx.ellipse(x, y - 250, 50, 12, 0, 0, Math.PI * 2)); fill('#94A3B8', () => ctx.ellipse(x, y - 246, 50, 6, 0, 0, Math.PI));
      fill('#F87171', () => ctx.ellipse(x, y - 262, 18, 10, 0, Math.PI, 0));
      fill('#E2E8F0', () => { ctx.moveTo(x + 70, y); ctx.lineTo(x + 70, y - 120); ctx.lineTo(x + 84, y - 150); ctx.lineTo(x + 98, y - 120); ctx.lineTo(x + 98, y); });
      rect(64, -36, 40, 36, '#EF4444');
      fill('#A78BFA', () => ctx.arc(x - 80, y - 200, 22, 0, Math.PI * 2));
      ctx.strokeStyle = haze('#FDE68A'); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x - 80, y - 200, 36, 8, -0.3, 0, Math.PI * 2); ctx.stroke();
      return;
    }
    case 'frontier': {
      // A red mesa, the flume's chute down it, a water tower
      fill('#C2410C', () => { ctx.moveTo(x - 150, y); ctx.lineTo(x - 120, y - 150); ctx.lineTo(x + 90, y - 170); ctx.lineTo(x + 140, y); });
      fill('#EA580C', () => { ctx.moveTo(x - 120, y - 150); ctx.lineTo(x + 90, y - 170); ctx.lineTo(x + 92, y - 158); ctx.lineTo(x - 118, y - 140); });
      for (let k = 0; k < 4; k++) rect(-110 + k * 50, -150 + k * 36, 54, 6, '#7C2D12');
      rect(100, -110, 6, 110, '#78350F'); rect(126, -110, 6, 110, '#78350F'); fill('#92400E', () => ctx.roundRect(x + 92, y - 150, 48, 44, 4));
      return;
    }
    case 'spooky': {
      // The haunted castle on its crag, crooked spires, a lit window, bats
      fill('#3B3049', () => { ctx.moveTo(x - 130, y); ctx.lineTo(x - 90, y - 70); ctx.lineTo(x + 100, y - 80); ctx.lineTo(x + 130, y); });
      rect(-70, -180, 140, 110, '#4C3D5E');
      for (const [sx, h, lean] of [[-74, 90, -0.1], [-20, 130, 0.05], [44, 100, 0.12]] as const) {
        rect(sx, -180 - h * 0.6, 30, h * 0.6, '#4C3D5E');
        fill('#2E2440', () => { ctx.moveTo(x + sx - 4, y - 180 - h * 0.6); ctx.lineTo(x + sx + 15 + lean * 60, y - 180 - h); ctx.lineTo(x + sx + 34, y - 180 - h * 0.6); });
      }
      rect(-8, -150, 10, 14, '#BEF264');
      for (let b = 0; b < 3; b++) { const bx = x - 40 + b * 50 + Math.sin(f * 0.05 + b) * 10, by = y - 230 + Math.cos(f * 0.07 + b) * 6; box(ctx, bx - 6, by, 12, 2, haze('#1F1630')); box(ctx, bx - 2, by - 2, 4, 4, haze('#1F1630')); }
      return;
    }
    case 'cartoon': {
      // Big round hills with faces, a wobbly candy tower, a rainbow
      for (const [i, c] of ['#EF4444', '#F59E0B', '#FDE047', '#4ADE80', '#60A5FA'].entries()) { ctx.strokeStyle = haze(c); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y - 40, 170 - i * 6, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); }
      fill('#86EFAC', () => ctx.arc(x - 70, y, 70, Math.PI, 0)); fill('#4ADE80', () => ctx.arc(x + 60, y, 90, Math.PI, 0));
      rect(-70 - 12, -40, 6, 6, '#14532D'); rect(-70 + 6, -40, 6, 6, '#14532D'); rect(48, -56, 7, 7, '#14532D'); rect(68, -56, 7, 7, '#14532D');
      for (let k = 0; k < 5; k++) fill(k % 2 ? '#F9A8D4' : '#FBCFE8', () => ctx.ellipse(x + 10 + Math.sin(k * 1.3) * 8, y - 110 - k * 30, 22 - k * 2, 16, 0, 0, Math.PI * 2));
      fill('#FDE047', () => ctx.arc(x + 10, y - 270, 12, 0, Math.PI * 2));
      return;
    }
    case 'hollywood': {
      // The hill with its big letters, a soundstage, searchlights sweeping
      for (const k of [-1, 1]) { ctx.fillStyle = haze('#FEF9C3'); ctx.globalAlpha = 0.35; ctx.beginPath(); const a = Math.sin(f * 0.02 + k) * 0.4 + k * 0.2; ctx.moveTo(x + k * 40, y - 60); ctx.lineTo(x + k * 40 + Math.sin(a) * 300 - 14, y - 60 - Math.cos(a) * 300); ctx.lineTo(x + k * 40 + Math.sin(a) * 300 + 14, y - 60 - Math.cos(a) * 300); ctx.fill(); ctx.globalAlpha = 1; }
      fill('#A16207', () => { ctx.moveTo(x - 170, y); ctx.quadraticCurveTo(x, y - 190, x + 170, y); });
      // (the big letters stood up along the crest, each on its scaffold legs down to the hill)
      { const L = hillside({ sx: 2, sy: 3 }, haze('#FFFFFF'), haze('#A8A29E')), hw = signW('HAPPYWOOD', L) / 2;
        for (let k = -hw + 3; k < hw; k += 9) { const t = (k + 170) / 340, foot = y - 380 * t * (1 - t); rect(k, -97, 2, foot - (y - 97) + 2, '#57534E'); }
        signText(ctx, 'HAPPYWOOD', x, y - 96, L); }
      rect(-90, -60, 180, 60, '#E7E5E4'); rect(-90, -60, 180, 6, '#D6D3D1'); rect(-20, -34, 40, 34, '#57534E');
      return;
    }
    case 'fantasy': {
      // The castle: blue cone roofs on round towers, pennants flying
      rect(-90, -110, 180, 110, '#D6D3D1'); rect(-90, -110, 180, 8, '#E7E5E4');
      for (const [tx, h] of [[-100, 170], [-40, 230], [30, 200], [86, 150]] as const) {
        rect(tx - 14, -h, 28, h, '#E7E5E4'); rect(tx - 14, -h, 8, h, '#F5F5F4');
        fill('#2563EB', () => { ctx.moveTo(x + tx - 20, y - h); ctx.lineTo(x + tx, y - h - 60); ctx.lineTo(x + tx + 20, y - h); });
        const wave = Math.sin(f * 0.1 + tx) * 3;
        fill('#FACC15', () => { ctx.moveTo(x + tx, y - h - 60); ctx.lineTo(x + tx + 18, y - h - 54 + wave); ctx.lineTo(x + tx, y - h - 48); });
      }
      return;
    }
    case 'adventure': {
      // A stepped temple in the jungle, its top broken off, vines down it; behind a tall fence, the head of something
      // big and hungry looking over it; a waterfall off the cliff
      for (const [dx, dy, r] of [[-130, -40, 46], [-90, -60, 40], [120, -50, 48], [150, -30, 38]] as const) fill('#166534', () => ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2));
      for (let k = 0; k < 6; k++) rect(-80 + k * 10, -40 - k * 30, 160 - k * 20, 30, k % 2 ? '#78716C' : '#A8A29E');
      rect(-14, -40, 28, 30, '#292524'); rect(-30, -210, 14, 30, '#A8A29E');
      for (const vx of [-60, -20, 30, 55]) rect(vx, -150 + (vx % 3) * 10, 4, 110, '#15803D');
      rect(95, -170, 4, 170, '#57534E'); rect(185, -170, 4, 170, '#57534E');
      for (let k = 0; k < 5; k++) rect(95, -160 + k * 34, 94, 2, '#A8A29E');
      const bob = Math.sin(f * 0.03) * 4;
      fill('#4D7C0F', () => { ctx.moveTo(x + 140, y - 150 + bob); ctx.quadraticCurveTo(x + 150, y - 220 + bob, x + 190, y - 215 + bob); ctx.lineTo(x + 230, y - 200 + bob); ctx.lineTo(x + 228, y - 186 + bob); ctx.lineTo(x + 180, y - 184 + bob); ctx.quadraticCurveTo(x + 165, y - 170 + bob, x + 162, y - 150 + bob); });
      rect(188, -208 + bob, 5, 4, '#FDE047');
      for (let k = 0; k < 4; k++) rect(195 + k * 8, -188 + bob, 3, 4, '#F5F5F4');
      rect(-170, -150, 18, 150, '#7DD3FC'); rect(-170, -150, 6, 150, '#E0F2FE');
      return;
    }
    case 'foreign': {
      // The world's landmarks, fixed: the Eiffel tower, a pyramid, a leaning tower, Big Ben, a big flag over all of it
      fill('#57534E', () => { ctx.moveTo(x - 60, y); ctx.lineTo(x - 14, y - 180); ctx.lineTo(x - 6, y - 180); ctx.lineTo(x + 40, y); ctx.lineTo(x + 20, y); ctx.lineTo(x - 10, y - 120); ctx.lineTo(x - 40, y); });
      fill('#FCD34D', () => { ctx.moveTo(x + 40, y); ctx.lineTo(x + 110, y - 90); ctx.lineTo(x + 180, y); });
      ctx.save(); ctx.translate(x - 110, y); ctx.rotate(-0.1); box(ctx, -14, -130, 28, 130, haze('#F5F5F4')); for (let k = 0; k < 6; k++) box(ctx, -14, -130 + k * 22, 28, 2, haze('#D6D3D1')); ctx.restore();
      rect(-170, -170, 26, 170, '#A16207'); fill('#78350F', () => { ctx.moveTo(x - 174, y - 170); ctx.lineTo(x - 157, y - 210); ctx.lineTo(x - 140, y - 170); }); fill('#FEF3C7', () => ctx.arc(x - 157, y - 150, 8, 0, Math.PI * 2));
      rect(-12, -260, 3, 80, '#57534E');
      for (let s = 0; s < 7; s++) rect(-9, -260 + s * 5, 54, 5, s % 2 ? '#F8FAFC' : '#DC2626');
      rect(-9, -260, 22, 18, '#1E3A8A');
      return;
    }
  }
};

/** Behind America USA's way in: the biggest flag in the world on the biggest pole, and a bald eagle on top of it. */
const americaLandmark = (ctx: Ctx, x: number, y: number, f: number) => {
  const haze = (c: string) => mix(c, skyTint('#B7CDF4', 0.8), 0.42);
  box(ctx, x - 4, y - 300, 8, 300, haze('#A8A29E')); box(ctx, x - 4, y - 300, 3, 300, haze('#E7E5E4'));
  for (let s = 0; s < 13; s++) {
    const wave = (k: number) => Math.sin(f * 0.05 + k * 0.08) * 6;
    for (let k = 0; k < 150; k += 6) box(ctx, x + 4 + k, y - 296 + s * 7 + wave(k), 6, 7, haze(s % 2 ? '#F8FAFC' : '#DC2626'));
  }
  for (let k = 0; k < 60; k += 6) for (let s = 0; s < 7; s++) box(ctx, x + 4 + k, y - 296 + s * 7 + Math.sin(f * 0.05 + k * 0.08) * 6, 6, 7, haze('#1E3A8A'));
  // (the eagle on top, wings out)
  ctx.fillStyle = haze('#78350F'); ctx.beginPath(); ctx.moveTo(x - 30, y - 312); ctx.lineTo(x, y - 304); ctx.lineTo(x + 30, y - 312); ctx.lineTo(x + 6, y - 298); ctx.lineTo(x - 6, y - 298); ctx.closePath(); ctx.fill();
  ctx.fillStyle = haze('#F8FAFC'); ctx.beginPath(); ctx.arc(x, y - 310, 5, 0, Math.PI * 2); ctx.fill();
  box(ctx, x + 4, y - 310, 5, 2, haze('#F59E0B'));
};

/**
 * Where he came in: the end of America USA's narrow street, through an arch hung with bunting. Turnstiles across it
 * that only turn one way (EXIT ONLY: NO RE-ENTRY), and down the street behind them the shopfronts, flags out.
 */
const americaGate = (ctx: Ctx, cx: number, f: number) => {
  const top = GROUND_Y - 230, W = 170;
  // The street beyond, narrowing away: shopfronts either side, flags, the far end in haze
  ctx.save(); ctx.beginPath(); ctx.rect(cx - W / 2, top + 30, W, GROUND_Y - top - 30); ctx.clip();
  bands(ctx, cx - W / 2, top + 30, W, GROUND_Y - top - 30, ['#BFDBFE', '#DBEAFE', '#F1E8D8']);
  for (const side of [-1, 1]) for (let k = 0; k < 4; k++) {
    const d = 1 - k * 0.2, fx = cx + side * (W / 2 - 12 - k * 14) - (side < 0 ? 0 : 26 * d), fh = 120 * d;
    ink(ctx, () => ctx.rect(fx, GROUND_Y - fh, 26 * d, fh), ['#FCA5A5', '#FDE68A', '#BFDBFE', '#F5F5F4'][(k + (side > 0 ? 2 : 0)) % 4]);
    box(ctx, fx + 4 * d, GROUND_Y - fh * 0.55, 18 * d, 14 * d, '#7DD3FC');
    box(ctx, fx, GROUND_Y - fh, 26 * d, 6 * d, (k % 2 ? '#DC2626' : '#1E3A8A'));
  }
  box(ctx, cx - 24, GROUND_Y - 10, 48, 10, '#E7D9BC');
  ctx.restore();
  // The arch, posts and bunting
  for (const x of [cx - W / 2 - 22, cx + W / 2]) { ink(ctx, () => ctx.rect(x, top + 20, 22, GROUND_Y - top - 20), '#F8FAFC'); for (let k = 0; k < 8; k++) box(ctx, x + 2, top + 40 + k * 22, 18, 3, '#DC2626'); }
  ink(ctx, () => ctx.rect(cx - W / 2 - 30, top, W + 60, 30), '#1E3A8A', 2);
  for (let k = 0; k < 12; k++) box(ctx, cx - W / 2 - 24 + k * 19, top + 4, 4, 4, '#F8FAFC');
  signAt(ctx, 'AMERICA USA', cx, top + 24, 12, gate(12, '#F8FAFC', '#7F1D1D'));
  for (let k = 0; k < 8; k++) {
    const bx = cx - W / 2 + k * (W / 8), sag = Math.sin(f * 0.04 + k) * 1.5;
    ctx.fillStyle = ['#DC2626', '#F8FAFC', '#1E3A8A'][k % 3]; ctx.beginPath(); ctx.moveTo(bx, top + 32); ctx.quadraticCurveTo(bx + W / 16, top + 46 + sag, bx + W / 8, top + 32); ctx.lineTo(bx, top + 32); ctx.fill();
  }
  // The turnstiles across it, and the sign
  for (let k = 0; k < 3; k++) {
    const tx = cx - 50 + k * 50;
    ink(ctx, () => ctx.rect(tx - 6, GROUND_Y - 44, 12, 44), '#9CA3AF');
    const a = Math.sin(f * 0.02 + k) * 0.1;
    for (const r of [0, 2.1, 4.2]) { ctx.strokeStyle = '#4B5563'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx, GROUND_Y - 32); ctx.lineTo(tx + Math.cos(r + a) * 18, GROUND_Y - 32 + Math.sin(r + a) * 6); ctx.stroke(); }
  }
  ink(ctx, () => ctx.rect(cx - 52, GROUND_Y - 84, 104, 26), '#DC2626', 2);
  signAt(ctx, 'EXIT ONLY', cx, GROUND_Y - 73, 6, enamel(6, '#FFFFFF', '#7F1D1D')); signAt(ctx, 'NO RE-ENTRY', cx, GROUND_Y - 63, 6, enamel(6, '#FFFFFF', '#7F1D1D'));
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
