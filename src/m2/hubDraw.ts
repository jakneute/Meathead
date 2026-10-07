// The hub, painted (a first pass: blocked in with SNES-style banding and inked edges, to be brought up later).
//
//   Behind it all (screen space, turning slower than the roundabout): a bright morning sky, and on the skyline each
//   land's big landmark, sat right behind its own portal, so walking round, the skyline wheels past behind them.
//   On the roundabout (wrapped round the cylinder): the plaza floor, the low wall round the back of it, lamp posts
//   with their banners, and the portals, one a land, each dressed as its land, swirling inside.
//   In front (flat, quicker than the roundabout): flower beds going by along the bottom edge.

import type { GameState } from '../game/core/state';
import { GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { INK, dark, lite, ink } from '../game/render/npc/kit';
import { mix } from '../game/render/backdrops/core';
import { LANDS, STAFF_SLOT, HUB_SLOTS, type Land } from './lands';
import { HUB, HUB_CIRC, slotX } from './hubGeom';

type Ctx = CanvasRenderingContext2D;
const box = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/** Bands top to bottom through the colors. */
const bands = (ctx: Ctx, x: number, y: number, w: number, h: number, cs: string[]) => { const bh = h / cs.length; cs.forEach((c, i) => box(ctx, x, y + i * bh, w, bh + 1, c)); };
const SKY = ['#4C7BE0', '#5A88E6', '#6995EB', '#7AA3EF', '#8DB1F2', '#A1BFF4', '#B7CDF4', '#CEDBF2', '#E6E3E6', '#F6E7D2'];
/** How much slower than the roundabout the skyline and the trees turn. */
const FAR = 0.3, MID = 0.6;

// ---------------------------------------------------------------------------
// Behind: the sky, the lands' landmarks, the treeline
// ---------------------------------------------------------------------------

/** Where something `k` as far round as the roundabout turns shows on screen, for a world x on the roundabout. */
const turned = (state: GameState, worldX: number, k: number, period: number) => {
  const camMid = state.camera.x + CANVAS_WIDTH / 2;
  let d = (worldX - camMid) * k;
  d = ((d % period) + period * 1.5) % period - period / 2;
  return CANVAS_WIDTH / 2 + d;
};

export const drawHubBackdrop = (ctx: Ctx, state: GameState) => {
  const f = state.frame;
  bands(ctx, 0, 0, CANVAS_WIDTH, 470, SKY);
  // The sun, in rings
  const sunX = turned(state, HUB.x0, 0.12, HUB_CIRC * 0.12 + CANVAS_WIDTH), sunY = 92;
  for (const [r, c] of [[46, '#F8E4B0'], [38, '#FBEFC6'], [30, '#FFF7DC'], [24, '#FFFDF2']] as const) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(sunX, sunY, r, 0, Math.PI * 2); ctx.fill(); }
  // Clouds drifting (flat-bottomed puffs, lit on top)
  for (let i = 0; i < 6; i++) {
    const x = turned(state, HUB.x0 + i * 970, 0.2, HUB_CIRC * 0.2 + 400) + Math.sin(f * 0.002 + i) * 6, y = 60 + (i % 3) * 46;
    for (const [dx, r] of [[-30, 16], [0, 24], [28, 18], [52, 12]] as const) { ctx.fillStyle = '#E8EEF8'; ctx.beginPath(); ctx.arc(x + dx, y, r, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(x + dx - 2, y - 3, r * 0.7, Math.PI, 0); ctx.fill(); }
    box(ctx, x - 46, y, 110, 4, '#D3DCEB');
  }
  // Each land's landmark on the skyline, right behind its portal
  const pf = HUB_CIRC * FAR;
  LANDS.forEach((land, i) => {
    const x = turned(state, slotX(i), FAR, pf);
    if (x < -260 || x > CANVAS_WIDTH + 260) return;
    landmark(ctx, land, x, 440, f);
  });
  // The haze down at the horizon
  for (let i = 0; i < 4; i++) { ctx.fillStyle = `rgba(246, 231, 210, ${(0.12 + i * 0.1).toFixed(2)})`; ctx.fillRect(0, 380 + i * 18, CANVAS_WIDTH, 18); }
  // The treeline and the monorail on its beam, turning a bit quicker
  const pm = HUB_CIRC * MID;
  for (let i = 0; i < 40; i++) {
    const x = turned(state, HUB.x0 + i * (HUB_CIRC / 40), MID, pm), r = 22 + (i * 7) % 14;
    ctx.fillStyle = '#2F6B3A'; ctx.beginPath(); ctx.arc(x, 462, r, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#3F8A4A'; ctx.beginPath(); ctx.arc(x - r * 0.25, 458, r * 0.6, Math.PI, 0); ctx.fill();
  }
  box(ctx, 0, 400, CANVAS_WIDTH, 8, '#D6D3D1'); box(ctx, 0, 400, CANVAS_WIDTH, 2, '#F5F5F4'); box(ctx, 0, 406, CANVAS_WIDTH, 2, '#A8A29E');
  for (let i = 0; i < 18; i++) { const x = turned(state, HUB.x0 + i * (HUB_CIRC / 18), MID, pm); box(ctx, x - 4, 408, 8, 60, '#A8A29E'); box(ctx, x - 4, 408, 3, 60, '#D6D3D1'); }
  // (the train, going round the other way)
  const tx = ((f * 1.6) % (CANVAS_WIDTH + 700)) - 350;
  const train = turned(state, HUB.x0, MID, pm) * 0 + CANVAS_WIDTH - tx;
  for (let c = 0; c < 4; c++) {
    const x = train + c * 64;
    ink(ctx, () => ctx.roundRect(x, 376, 60, 24, [c === 0 ? 12 : 3, c === 3 ? 12 : 3, 2, 2]), c % 2 ? '#38BDF8' : '#F8FAFC');
    for (let w = 0; w < 3; w++) box(ctx, x + 8 + w * 16, 382, 10, 7, '#1E3A8A');
  }
  box(ctx, 0, 468, CANVAS_WIDTH, 4, '#24542F');
  // (the lawn under it all, down to the bottom: from inside the ring the plaza's wall dips at the sides, and this is
  // what's behind it there)
  bands(ctx, 0, 472, CANVAS_WIDTH, CANVAS_HEIGHT - 472, ['#2F6B3A', '#2A6034', '#25562F', '#204C2A']);
};

/** A land's big landmark, its base on (x, y): hazed into the sky by distance (flat, with a lit edge). */
const landmark = (ctx: Ctx, land: Land, x: number, y: number, f: number) => {
  const haze = (c: string) => mix(c, '#B7CDF4', 0.42);
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
      ctx.fillStyle = haze('#FFFFFF'); ctx.font = '16px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('HAPPYWOOD', x, y - 96); ctx.textAlign = 'left';
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
    case 'nature': {
      // The great tree: a fat trunk, the crown in heaps, a giraffe looking over the fence
      fill('#78350F', () => { ctx.moveTo(x - 40, y); ctx.lineTo(x - 22, y - 140); ctx.lineTo(x + 22, y - 140); ctx.lineTo(x + 46, y); });
      for (const [dx, dy, r] of [[-70, -170, 54], [0, -210, 70], [70, -170, 56], [-30, -150, 50], [40, -146, 48]] as const) fill(dx % 20 ? '#15803D' : '#16A34A', () => ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2));
      rect(110, -110, 10, 110, '#F59E0B'); fill('#F59E0B', () => ctx.ellipse(x + 124, y - 116, 16, 8, -0.3, 0, Math.PI * 2));
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

// ---------------------------------------------------------------------------
// On the roundabout
// ---------------------------------------------------------------------------

/** Every lap's copy of something near enough to be seen (the roundabout repeats). */
const laps = (state: GameState, x: number, draw: (x: number) => void) => {
  for (let k = -1; k <= 1; k++) {
    const lx = x + k * HUB_CIRC;
    if (lx > state.camera.x - 1100 && lx < state.camera.x + CANVAS_WIDTH + 1100) draw(lx);
  }
};

export const drawHubBack = (ctx: Ctx, state: GameState) => {
  const f = state.frame, x0 = state.camera.x - 1200, x1 = state.camera.x + CANVAS_WIDTH + 1200;
  // The low wall round the back of the plaza: stone, a planter along its top
  box(ctx, x0, GROUND_Y - 78, x1 - x0, 78, '#D6C7A8');
  bands(ctx, x0, GROUND_Y - 78, x1 - x0, 12, ['#4D7C3A', '#3F6B2E']);
  for (let x = Math.floor(x0 / 48) * 48; x < x1; x += 48) { box(ctx, x, GROUND_Y - 66, 1, 66, '#B8A889'); box(ctx, x + 24, GROUND_Y - 33, 1, 33, '#B8A889'); }
  box(ctx, x0, GROUND_Y - 34, x1 - x0, 1, '#B8A889'); box(ctx, x0, GROUND_Y - 66, x1 - x0, 2, '#E8DCC2');
  for (let x = Math.floor(x0 / 30) * 30; x < x1; x += 30) { const c = ['#F472B6', '#FDE047', '#F87171', '#C084FC'][(Math.abs(x / 30) | 0) % 4]; box(ctx, x + 6, GROUND_Y - 84, 6, 6, c); box(ctx, x + 18, GROUND_Y - 82, 5, 5, lite(c, 0.3)); }
  // The plaza floor: big pavers, in bands, lit along the front edge
  bands(ctx, x0, GROUND_Y, x1 - x0, 60, ['#E7D9BC', '#DCCCAB', '#CFBE9C', '#C2B08E']);
  for (let x = Math.floor(x0 / 64) * 64; x < x1; x += 64) { box(ctx, x, GROUND_Y, 1, 60, '#B8A584'); box(ctx, x + 32, GROUND_Y + 20, 1, 40, '#B8A584'); }
  box(ctx, x0, GROUND_Y + 20, x1 - x0, 1, '#B8A584'); box(ctx, x0, GROUND_Y, x1 - x0, 2, '#F5EBD6');
  // The portals, the staff door, and the lamp posts between
  for (let i = 0; i < HUB_SLOTS; i++) {
    laps(state, slotX(i), x => (i === STAFF_SLOT ? staffDoor(ctx, x, f) : portal(ctx, LANDS[i], x, f)));
    laps(state, HUB.x0 + i * HUB.slot, x => lamp(ctx, x, i, f));
  }
};

export const drawHubFront = (_ctx: Ctx, _state: GameState) => {};

/** In front, flat, going by quicker than the roundabout: flower beds along the bottom edge. */
export const drawHubOver = (ctx: Ctx, state: GameState) => {
  const period = 380, off = ((state.camera.x * 1.35) % period + period) % period;
  for (let x = -off - period; x < CANVAS_WIDTH + period; x += period) {
    for (const [dx, r, c] of [[0, 34, '#2F6B3A'], [44, 26, '#3F8A4A'], [80, 30, '#2F6B3A']] as const) {
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + dx, CANVAS_HEIGHT + 8, r, Math.PI, 0); ctx.fill();
      ctx.fillStyle = lite(c, 0.15); ctx.beginPath(); ctx.arc(x + dx - r * 0.3, CANVAS_HEIGHT + 4, r * 0.5, Math.PI, 0); ctx.fill();
    }
    for (let k = 0; k < 6; k++) box(ctx, x - 20 + k * 20, CANVAS_HEIGHT - 22 - (k % 3) * 5, 5, 5, ['#F472B6', '#FDE047', '#F87171'][k % 3]);
  }
};

/** A lamp post on the plaza, its banner (HAPPY LAND, in the land colors in turn) waving. */
const lamp = (ctx: Ctx, x: number, i: number, f: number) => {
  const top = GROUND_Y - 230;
  box(ctx, x - 4, top, 8, 230, '#1F2937'); box(ctx, x - 4, top, 3, 230, '#4B5563');
  box(ctx, x - 12, GROUND_Y - 14, 24, 14, '#111827');
  ink(ctx, () => ctx.roundRect(x - 12, top - 26, 24, 26, [10, 10, 2, 2]), '#FEF3C7');
  box(ctx, x - 14, top - 2, 28, 4, '#111827');
  const land = LANDS[i % LANDS.length], wave = Math.sin(f * 0.06 + i) * 3;
  ctx.fillStyle = land.sign; ctx.beginPath(); ctx.moveTo(x + 4, top + 20); ctx.lineTo(x + 40, top + 20 + wave); ctx.lineTo(x + 40, top + 90 + wave); ctx.lineTo(x + 22, top + 80 + wave * 0.5); ctx.lineTo(x + 4, top + 90); ctx.closePath(); ctx.fill();
  ctx.fillStyle = land.signText; ctx.font = '6px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillText('HAPPY', x + 22, top + 42 + wave * 0.6); ctx.fillText('LAND', x + 22, top + 54 + wave * 0.6); ctx.textAlign = 'left';
};

/** The swirl inside a portal's arch (rings of the land's colors, turning, flecks going round). */
const swirl = (ctx: Ctx, land: Land, cx: number, top: number, w: number, f: number) => {
  const h = GROUND_Y - top;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(cx - w / 2, GROUND_Y); ctx.lineTo(cx - w / 2, top + w / 2); ctx.arc(cx, top + w / 2, w / 2, Math.PI, 0); ctx.lineTo(cx + w / 2, GROUND_Y); ctx.closePath(); ctx.clip();
  box(ctx, cx - w / 2, top, w, h, land.swirl[0]);
  const my = top + h * 0.48;
  for (let r = 220; r > 0; r -= 13) {
    const c = land.swirl[(Math.floor(r / 13 + f * 0.12) % 3 + 3) % 3];
    ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(cx, my, r * 0.62, r, Math.sin(f * 0.01) * 0.2, 0, Math.PI * 2); ctx.fill();
  }
  for (let k = 0; k < 10; k++) {
    const a = f * 0.04 + k * 0.63, rr = 20 + ((k * 37 + f) % 90);
    box(ctx, cx + Math.cos(a) * rr * 0.6, my + Math.sin(a) * rr, 3, 3, '#FFFFFF');
  }
  ctx.restore();
};

/** A land's portal: the arch, dressed as the land, the swirl in it, the sign over it, the path out to it. */
const portal = (ctx: Ctx, land: Land, cx: number, f: number) => {
  const W = 200, top = GROUND_Y - 270, pw = 30;
  // The path out from the walkway to it: lighter pavers, edged
  ctx.fillStyle = '#F2E6CC'; ctx.beginPath(); ctx.moveTo(cx - W / 2, GROUND_Y); ctx.lineTo(cx + W / 2, GROUND_Y); ctx.lineTo(cx + W / 2 + 40, GROUND_Y + 60); ctx.lineTo(cx - W / 2 - 40, GROUND_Y + 60); ctx.closePath(); ctx.fill();
  for (let k = 1; k < 4; k++) box(ctx, cx - W / 2 - k * 13, GROUND_Y + k * 15, W + k * 26, 1, '#D8C9A7');
  swirl(ctx, land, cx, top, W, f);
  // The arch itself, by land
  const pillar = (x: number, c: string) => { ink(ctx, () => ctx.rect(x, top + 40, pw, GROUND_Y - top - 40), c); box(ctx, x + 2, top + 42, 6, GROUND_Y - top - 44, lite(c, 0.3)); box(ctx, x + pw - 8, top + 42, 6, GROUND_Y - top - 44, dark(c, 0.25)); };
  const arch = (c: string, thick = 26) => { ctx.strokeStyle = INK; ctx.lineWidth = thick + 2; ctx.beginPath(); ctx.arc(cx, top + W / 2, W / 2 + thick / 2, Math.PI, 0); ctx.stroke(); ctx.strokeStyle = c; ctx.lineWidth = thick; ctx.stroke(); ctx.strokeStyle = lite(c, 0.3); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, top + W / 2, W / 2 + thick - 4, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke(); };
  const L = cx - W / 2 - pw, R = cx + W / 2;
  switch (land.id) {
    case 'space':
      pillar(L, '#CBD5E1'); pillar(R, '#CBD5E1'); arch('#E2E8F0');
      for (const x of [L, R]) { for (let k = 0; k < 6; k++) box(ctx, x + 10, top + 70 + k * 34, 10, 10, (f >> 3) % 6 === k ? '#FDE047' : '#38BDF8'); ink(ctx, () => ctx.ellipse(x + pw / 2, top + 40, 24, 7, 0, 0, Math.PI * 2), '#94A3B8'); }
      ink(ctx, () => ctx.arc(cx, top - 26, 18, 0, Math.PI * 2), '#A78BFA');
      ctx.strokeStyle = '#FDE68A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, top - 26, 32, 7, -0.25, 0, Math.PI * 2); ctx.stroke();
      break;
    case 'frontier':
      for (const x of [L, R]) { pillar(x, '#92400E'); for (let k = 0; k < 8; k++) box(ctx, x + 4 + (k % 2) * 10, top + 60 + k * 26, 12, 2, '#5C2E0B'); }
      ink(ctx, () => ctx.rect(L - 14, top - 4, R + pw - L + 28, 34), '#A16207');
      for (let k = 0; k < 3; k++) box(ctx, L - 12, top + 4 + k * 9, R + pw - L + 24, 1, '#78350F');
      ink(ctx, () => ctx.arc(cx, top + 60, 26, 0, Math.PI * 2), 'rgba(0,0,0,0)');
      ctx.strokeStyle = '#78350F'; ctx.lineWidth = 3; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + f * 0.01; ctx.beginPath(); ctx.moveTo(cx, top + 60); ctx.lineTo(cx + Math.cos(a) * 26, top + 60 + Math.sin(a) * 26); ctx.stroke(); }
      break;
    case 'spooky':
      pillar(L, '#57534E'); pillar(R, '#57534E');
      ctx.strokeStyle = INK; ctx.lineWidth = 28; ctx.beginPath(); ctx.moveTo(L + pw / 2, top + 60); ctx.lineTo(cx, top - 40); ctx.lineTo(R + pw / 2, top + 60); ctx.stroke(); ctx.strokeStyle = '#57534E'; ctx.lineWidth = 24; ctx.stroke();
      for (const x of [L, R]) { const fl = Math.sin(f * 0.3 + x) * 3; ink(ctx, () => ctx.rect(x + 8, top + 30, 14, 16), '#3F3F46'); ctx.fillStyle = '#86EFAC'; ctx.beginPath(); ctx.ellipse(x + 15, top + 22 + fl * 0.3, 6, 10 + fl, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#F0FDF4'; ctx.beginPath(); ctx.ellipse(x + 15, top + 26, 3, 5, 0, 0, Math.PI * 2); ctx.fill(); }
      for (let b = 0; b < 2; b++) { const bx = cx - 40 + b * 80 + Math.sin(f * 0.08 + b * 2) * 14, by = top - 30 + Math.cos(f * 0.1 + b) * 8, flap = (f >> 2) % 2 ? 4 : -2; ctx.fillStyle = '#1F1630'; ctx.beginPath(); ctx.moveTo(bx - 12, by + flap); ctx.lineTo(bx, by); ctx.lineTo(bx + 12, by + flap); ctx.lineTo(bx, by + 5); ctx.closePath(); ctx.fill(); }
      break;
    case 'cartoon':
      for (const x of [L, R]) { ctx.save(); ctx.beginPath(); ctx.roundRect(x, top + 40, pw, GROUND_Y - top - 40, 14); ctx.clip(); box(ctx, x, top + 40, pw, GROUND_Y - top, '#FFFFFF'); for (let k = -4; k < 14; k++) { ctx.fillStyle = '#EC4899'; ctx.beginPath(); ctx.moveTo(x, top + 40 + k * 24); ctx.lineTo(x + pw, top + 40 + k * 24 - 16); ctx.lineTo(x + pw, top + 40 + k * 24 - 4); ctx.lineTo(x, top + 52 + k * 24); ctx.fill(); } ctx.restore(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(x, top + 40, pw, GROUND_Y - top - 40, 14); ctx.stroke(); }
      arch('#FDE047', 30);
      // A cloud on top with big googly eyes looking about
      for (const [dx, r] of [[-34, 22], [0, 30], [34, 22]] as const) ink(ctx, () => ctx.arc(cx + dx, top - 18, r, 0, Math.PI * 2), '#FFFFFF');
      box(ctx, cx - 60, top - 14, 120, 18, '#FFFFFF');
      for (const ex of [-12, 12]) { ink(ctx, () => ctx.arc(cx + ex, top - 24, 9, 0, Math.PI * 2), '#FFFFFF'); const look = Math.sin(f * 0.03) * 4; ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(cx + ex + look, top - 22, 4, 0, Math.PI * 2); ctx.fill(); }
      break;
    case 'hollywood':
      for (const x of [L, R]) { pillar(x, '#18181B'); for (let k = 0; k < 9; k++) box(ctx, x + 6, top + 60 + k * 24, pw - 12, 4, '#CA8A04'); }
      arch('#18181B', 26);
      ctx.strokeStyle = '#CA8A04'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, top + W / 2, W / 2 + 13, Math.PI, 0); ctx.stroke();
      // A film strip across the top, frames going by
      ink(ctx, () => ctx.rect(L - 10, top - 30, R + pw - L + 20, 30), '#27272A');
      for (let k = 0; k < 14; k++) { const fx = L - 6 + ((k * 20 + f) % (R + pw - L + 12)); box(ctx, fx, top - 28, 6, 4, '#F5F5F4'); box(ctx, fx, top - 6, 6, 4, '#F5F5F4'); }
      break;
    case 'fantasy':
      for (const x of [L - 6, R - 4]) {
        ink(ctx, () => ctx.rect(x, top + 30, pw + 10, GROUND_Y - top - 30), '#D6D3D1');
        for (let k = 0; k < 10; k++) box(ctx, x + (k % 2) * 16, top + 40 + k * 22, 18, 1, '#A8A29E');
        ink(ctx, () => { ctx.moveTo(x - 6, top + 30); ctx.lineTo(x + (pw + 10) / 2, top - 40); ctx.lineTo(x + pw + 16, top + 30); ctx.closePath(); }, '#2563EB');
        const wave = Math.sin(f * 0.12 + x) * 3; ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.moveTo(x + (pw + 10) / 2, top - 40); ctx.lineTo(x + (pw + 10) / 2 + 20, top - 34 + wave); ctx.lineTo(x + (pw + 10) / 2, top - 28); ctx.fill();
      }
      arch('#D6D3D1', 24);
      break;
    case 'nature':
      for (const x of [L, R]) { pillar(x, '#65A30D'); for (let k = 0; k < 9; k++) box(ctx, x, top + 60 + k * 26, pw, 3, '#3F6212'); }
      arch('#65A30D', 22);
      // Leaves heaped round the top of it, a vine hanging down each side
      for (let k = 0; k < 11; k++) { const a = Math.PI + (k / 10) * Math.PI, r = W / 2 + 20; ink(ctx, () => ctx.ellipse(cx + Math.cos(a) * r, top + W / 2 + Math.sin(a) * r, 18, 12, a, 0, Math.PI * 2), k % 2 ? '#16A34A' : '#22C55E'); }
      for (const x of [cx - W / 2 + 16, cx + W / 2 - 16]) for (let k = 0; k < 6; k++) { const sway = Math.sin(f * 0.04 + k * 0.5 + x) * 4; box(ctx, x + sway, top + 40 + k * 16, 4, 16, '#15803D'); box(ctx, x + sway - 4, top + 48 + k * 16, 6, 4, '#4ADE80'); }
      break;
    case 'foreign': {
      // A pillar for each of a few countries, the way an American would do them; a flag over the lot
      const flags = [['#0055A4', '#FFFFFF', '#EF4135'], ['#009246', '#FFFFFF', '#CE2B37']];
      [L, R].forEach((x, j) => { ink(ctx, () => ctx.rect(x, top + 40, pw, GROUND_Y - top - 40), '#FFFFFF'); flags[j].forEach((c, k) => box(ctx, x + 1 + k * (pw - 2) / 3, top + 41, (pw - 2) / 3, GROUND_Y - top - 42, c)); });
      arch('#1E3A8A', 26);
      for (let s = 0; s < 7; s++) box(ctx, cx - 50, top - 60 + s * 6, 100, 6, s % 2 ? '#FFFFFF' : '#DC2626');
      box(ctx, cx - 50, top - 60, 40, 24, '#1E3A8A');
      for (let k = 0; k < 6; k++) box(ctx, cx - 46 + (k % 3) * 12, top - 56 + Math.floor(k / 3) * 10, 3, 3, '#FFFFFF');
      box(ctx, cx - 52, top - 66, 3, 80, '#57534E');
      break;
    }
  }
  // The sign over it
  ctx.font = '10px "Press Start 2P"';
  const tw = ctx.measureText(land.name).width + 24;
  ink(ctx, () => ctx.roundRect(cx - tw / 2, top + 6, tw, 24, 4), land.sign, 2);
  box(ctx, cx - tw / 2 + 3, top + 8, tw - 6, 2, lite(land.sign, 0.25));
  ctx.fillStyle = land.signText; ctx.textAlign = 'center'; ctx.fillText(land.name, cx, top + 23); ctx.textAlign = 'left';
};

/** Between Foreign Lands and Space Land: a plain gray door in the wall, STAFF ONLY. */
const staffDoor = (ctx: Ctx, cx: number, f: number) => {
  ink(ctx, () => ctx.rect(cx - 30, GROUND_Y - 110, 60, 110), '#9CA3AF');
  box(ctx, cx - 26, GROUND_Y - 106, 52, 106, '#6B7280'); box(ctx, cx - 26, GROUND_Y - 106, 6, 106, '#7C8592');
  box(ctx, cx + 14, GROUND_Y - 58, 6, 4, '#E5E7EB');
  ink(ctx, () => ctx.rect(cx - 24, GROUND_Y - 96, 48, 16), '#DC2626');
  ctx.fillStyle = '#FFFFFF'; ctx.font = '6px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('STAFF', cx, GROUND_Y - 89); ctx.fillText('ONLY', cx, GROUND_Y - 82); ctx.textAlign = 'left';
  // (a sticky note on it, flapping)
  ctx.save(); ctx.translate(cx - 10, GROUND_Y - 70); ctx.rotate(Math.sin(f * 0.05) * 0.06);
  box(ctx, 0, 0, 18, 16, '#FDE047'); ctx.fillStyle = '#1E3A8A'; ctx.font = '4px "Press Start 2P"'; ctx.fillText('TEST', 2, 7); ctx.fillText('PEN', 2, 13);
  ctx.restore();
};
