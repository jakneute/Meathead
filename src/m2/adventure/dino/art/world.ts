// The dino park, in the world (world space, behind everything that moves): the ground (going back to the backdrop's
// tree line, and down toward the viewer, bent), what's along the back of it, and every set piece he goes by, each with
// the sides and tops of it showing as the eye goes by (kit's prism), standing on the ground going back.
//
//   the raptor pen:   the concrete back wall, the storm drain's culvert out of it, the feeding platforms (steel grating
//                     on posts, a chute and a meat hook), the electrified fence (insulators, the wires humming, warning
//                     signs bolted to it), the viewing deck outside it (coin binoculars).
//   the booth:        a little block hut in perspective, its window (him in it, the DINOSAUR MODE panel lit), the door.
//   the meadow:       boardwalks on stilts, rope rails, the TRICERATOPS MEADOW sign, hay.
//   MOUNT KABOOMA:    a fiberglass volcano (the seams, the bolts, an access hatch), fake lava color-cycling down it,
//                     steam; its steps out front (fiberglass rock).
//   the gift shop:    a proper building (its roof the platform), DINO-MITE GIFTS, windows full of plush.
//   the monorail:     the track on its T-pillars over it all, CLOSED FOR REPAIRS SINCE 1997 bolted to one.
//   the paddock:      the big gates and their arch (torches), the back fence and floodlights, the feeding platforms.
//   the last stretch: big fake trees (platforms round them), the last fence (STAFF ONLY), the temple's back.
//
// Still art is stamped (painted once); anything that moves or depends on where the eye is is drawn live.

import type { GameState } from '../../../../m1/game/core/state';
import { GY } from '../../geometry';
import { drawPerson } from '../../temple/people';
import {
  type Ctx, type Eye, type Pt, INK, box, text, sign, slab, pole, ball, rampOf, dark, lite, mix, hash, checker, steppedGlow, pixelBlob, stamp,
  P, groundAt, FAR, quad, seg, rgba, prism, chunked, speckle, hazard, lipOn, eyeOf, viewOf, bendFloor, PIX,
} from './kit';
import {
  x0, x1, D, PEN_WALL, DRAIN_Y, FENCE_X, FENCE_TOP, BOOTH, PADDOCK_IN, PADDOCK_OUT, PADDOCK_TOP, LAST_FENCE, LAST_FENCE_TOP,
  TEMPLE_L, TEMPLE_R, TIERS, TIER_H, TEMPLE_DOOR_X, LEDGES,
} from '../layout';

/** What the park's art needs to know of its state. */
export interface DinoLook { hostile: boolean; doorKicked: boolean; kick: number; switching: boolean }

// ---------------------------------------------------------------------------------------------------------------
// Palettes (darkest first)

const DIRT = ['#3E2A18', '#5C4026', '#7A5634', '#946C44', '#AC8456'];
const PAVE = ['#5E5A52', '#7A766C', '#959084', '#ABA698', '#C2BDAE'];
const GRASS = ['#24401A', '#345A22', '#467A2C', '#5E9636', '#7EB246'];
const ASH = ['#26201C', '#3A322C', '#504640', '#665A52', '#7E7064'];
const JUNGLE = ['#22301A', '#324422', '#44582C', '#586C36', '#6E8044'];
const STONE = ['#4E463A', '#6A604E', '#857A64', '#9C907A', '#B4A88E'];
const CONC = '#9A968C', STEEL = '#6B7480', WOOD = '#8A6038', FIBER = '#7A5E48', ROCK = '#6E5A48';

type Region = [number, number, string[], string];
const REGIONS: Region[] = [
  [x0 - 400, D + 1000, DIRT, 'pen'], [D + 1000, D + 1480, PAVE, 'path'], [D + 1480, D + 2480, GRASS, 'grass'],
  [D + 2480, D + 3880, ASH, 'ash'], [D + 3880, PADDOCK_IN, PAVE, 'path'], [PADDOCK_IN, PADDOCK_OUT + 20, DIRT, 'paddock'],
  [PADDOCK_OUT + 20, D + 8700, PAVE, 'path'], [D + 8700, LAST_FENCE + 20, JUNGLE, 'jungle'], [LAST_FENCE + 20, x1 + 400, STONE, 'stone'],
];

// ---------------------------------------------------------------------------------------------------------------
// The whole of it

export const drawDinoWorld = (c: Ctx, state: GameState, look: DinoLook, drawRex: () => void) => {
  const eye = eyeOf(state), v = viewOf(state), f = state.frame || 0;
  const vis = (a: number, b: number) => b > v.x - 60 && a < v.x + v.w + 60;
  // The ground going back, and what stands along the back of it
  backGround(c, eye, v);
  if (vis(D - 100, FENCE_X + 200)) atDepth(c, eye, 0.7, () => penBackWall(c, state));
  if (vis(D + 1000, D + 2500)) atDepth(c, eye, 0.74, () => meadowRail(c, state));
  if (vis(D + 3880, D + 5920)) atDepth(c, eye, 0.76, () => plazaBack(c, state, f));
  if (vis(PADDOCK_IN - 300, PADDOCK_OUT + 300)) atDepth(c, eye, 0.68, () => paddockBack(c, state, f));
  if (vis(D + 8600, LAST_FENCE + 100)) atDepth(c, eye, 0.72, () => jungleBack(c, state));
  // The ground toward him (bent: the rows nearer, wider)
  floor(c, state, v);
  bendFloor(c, eye, GY, GY, GY + 170, v.x - 10, v.x + v.w + 10);
  // The set pieces
  if (vis(D - 60, D + 300)) drainWall(c, eye, f);
  if (vis(D + 2350, D + 4000)) volcano(c, state, eye, f);
  if (vis(D + 4050, D + 5750)) giftShop(c, state, eye, f);
  if (vis(D + 4050, D + 5750)) monorail(c, state, eye);
  if (vis(BOOTH.x - 200, BOOTH.x + BOOTH.w + 200)) booth(c, state, eye, f, look);
  if (vis(D + 1500, D + 2500)) meadowSign(c, state, eye);
  for (const [x, y, w] of LEDGES) if (vis(x - 40, x + w + 40) && !(x > PADDOCK_IN && x + w < PADDOCK_OUT)) platform(c, state, eye, x, y, w, f);
  if (vis(D + 8800, D + 10200)) trees(c, state, eye, f);
  if (vis(FENCE_X - 300, FENCE_X + 300)) penFence(c, state, eye, f, look);
  if (vis(PADDOCK_IN - 400, PADDOCK_OUT + 400)) paddock(c, state, eye, f);
  if (vis(LAST_FENCE - 600, x1 + 400)) temple(c, state, eye, f, look);
  if (vis(LAST_FENCE - 200, LAST_FENCE + 200)) lastFence(c, state, eye);
  drawRex();
};

/** Drawn at depth d (pushed back about the eye: smaller, sliding by slower). */
const atDepth = (c: Ctx, eye: Eye, d: number, paint: () => void) => {
  c.save(); c.translate(eye.x, eye.y); c.scale(d, d); c.translate(-eye.x, -eye.y); paint(); c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The ground

/** The ground going back from where he walks to the far line (the backdrop's tree line meets it there): each stretch
 *  of it banded, darker going back, its joints and rows running back toward the eye. */
const backGround = (c: Ctx, eye: Eye, v: { x: number; w: number }) => {
  const far = groundAt(eye, FAR);
  const L = v.x - 200, R = v.x + v.w + 200;
  for (const [a0, b0, pal, kind] of REGIONS) {
    const a = Math.max(a0, L - 600), b = Math.min(b0, R + 600);
    if (b <= a) continue;
    const bands = [pal[1], pal[2], pal[2], pal[3]];
    for (let i = 0; i < 4; i++) {
      const d0 = FAR + (1 - FAR) * (i / 4) ** 0.8, d1 = FAR + (1 - FAR) * ((i + 1) / 4) ** 0.8;
      quad(c, [P(eye, a, GY, d0), P(eye, b, GY, d0), P(eye, b, GY, d1), P(eye, a, GY, d1)], bands[i]);
    }
    // (the dither where the bands meet)
    for (let i = 1; i < 4; i++) { const d = FAR + (1 - FAR) * (i / 4) ** 0.8, [xa, y] = P(eye, a, GY, d), [xb] = P(eye, b, GY, d); checker(c, xa, Math.round(y), xb - xa, 2, bands[i]); }
    // (what runs back across it: slab joints, mown rows, ruts)
    if (kind === 'path' || kind === 'stone') {
      c.strokeStyle = rgba(pal[0], 0.45); c.lineWidth = 1;
      for (let x = Math.ceil(a / 64) * 64; x < b; x += 64) { const p0 = P(eye, x, GY, 1), p1 = P(eye, x, GY, FAR); c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke(); }
      for (const d of [0.7, 0.8, 0.9]) { const [xa, y] = P(eye, a, GY, d), [xb] = P(eye, b, GY, d); box(c, xa, y, xb - xa, 1, rgba(pal[0], 0.4)); }
    } else if (kind === 'grass') {
      for (let x = Math.ceil(a / 40) * 40; x < b; x += 40) for (const d of [0.68, 0.78, 0.88, 0.97]) {
        const [px, py] = P(eye, x + hash(x * d) * 30, GY, d), s = d * 2;
        box(c, px, py - 2 * s, s, 2 * s, pal[4]); box(c, px + s, py - s, s, s, pal[3]);
      }
    } else if (kind === 'pen' || kind === 'paddock') {
      for (let x = Math.ceil(a / 90) * 90; x < b; x += 90) { const [px, py] = P(eye, x + hash(x) * 50, GY, 0.7 + hash(x * 3) * 0.25); box(c, px, py, 10, 2, pal[0]); box(c, px + 3, py - 2, 4, 2, pal[0]); }
    } else if (kind === 'ash') {
      for (let x = Math.ceil(a / 50) * 50; x < b; x += 50) { const [px, py] = P(eye, x + hash(x) * 30, GY, 0.68 + hash(x * 7) * 0.3); box(c, px, py, 4, 2, pal[0]); box(c, px + 1, py - 1, 2, 1, pal[4]); }
    } else if (kind === 'jungle') {
      for (let x = Math.ceil(a / 36) * 36; x < b; x += 36) { const d = 0.66 + hash(x * 1.3) * 0.32, [px, py] = P(eye, x, GY, d); pixelBlob(c, px, py - 3 * d, 8 * d, 4 * d, hash(x) > 0.5 ? '#2E4A22' : '#3A5A28'); }
    }
  }
  // (a shade along the far line: it goes on back under the trees)
  const [l] = P(eye, L - 600, GY, FAR), [r] = P(eye, R + 600, GY, FAR);
  box(c, l, far, r - l, 3, 'rgba(10, 20, 8, 0.35)');
};

/** The ground toward him, in stretches (stamped): its own look in each, then bent (bendFloor). */
const floor = (c: Ctx, state: GameState, v: { x: number; y: number; w: number; h: number }) => {
  const H = 200;
  for (const [a, b, pal, kind] of REGIONS) {
    if (b < v.x - 40 || a > v.x + v.w + 40) continue;
    chunked(c, state, `dfl-${kind}-${a}`, Math.max(a, x0 - 400), b, GY, H, (g, ca, cb) => paintFloor(g, ca, cb, pal, kind, H));
  }
};
const paintFloor = (g: Ctx, a: number, b: number, pal: string[], kind: string, H: number) => {
  const w = b - a;
  const bands = [pal[3], pal[2], pal[2], pal[1], pal[1], pal[0]];
  bands.forEach((col, i) => box(g, a, GY + (i * H) / bands.length, w, H / bands.length + 1, col));
  for (let i = 1; i < bands.length; i++) checker(g, a, GY + Math.round((i * H) / bands.length) - 2, w, 2, bands[i]);
  box(g, a, GY, w, 2, pal[4]);
  speckle(g, a, GY + 4, w, H - 4, [pal[0], pal[4], pal[1]], Math.floor(w * 0.12), a);
  if (kind === 'path' || kind === 'stone') {
    const step = kind === 'stone' ? 48 : 96;
    for (let x = Math.floor(a / step) * step; x < b; x += step) { box(g, x, GY + 2, 2, H, pal[0]); box(g, x + 2, GY + 2, 1, H, pal[4]); }
    for (const y of [GY + 30, GY + 80, GY + 150]) box(g, a, y, w, 2, pal[0]);
    // (a curb along the front edge, and (the park's idea of fun) dino footprints set into the concrete)
    box(g, a, GY, w, 4, pal[4]); box(g, a, GY + 4, w, 2, pal[1]);
    if (kind === 'path') for (let x = Math.floor(a / 130) * 130 + 40; x < b; x += 130) {
      const y = GY + 14 + (Math.floor(x / 130) % 2) * 18;
      box(g, x, y + 2, 8, 6, pal[1]); box(g, x - 4, y - 4, 3, 6, pal[1]); box(g, x + 3, y - 6, 3, 7, pal[1]); box(g, x + 9, y - 4, 3, 6, pal[1]);
    }
  } else if (kind === 'grass') {
    for (let x = a; x < b; x += 6) { const h = 4 + Math.floor(hash(x) * 8); box(g, x, GY - h + 4, 2, h, pal[3 + (x % 12 === 0 ? 1 : 0)]); box(g, x + 2, GY - h + 7, 2, h - 3, pal[2]); }
    for (let x = Math.floor(a / 70) * 70; x < b; x += 70) { const fx = x + hash(x) * 50, fy = GY + 20 + hash(x * 2) * 100; box(g, fx, fy, 4, 4, hash(x * 3) > 0.5 ? '#F2E46A' : '#F2F2F2'); box(g, fx + 1, fy + 1, 2, 2, '#E8A040'); }
  } else if (kind === 'pen' || kind === 'paddock') {
    // (ruts, big three-toed prints, a bone or two (plastic))
    for (let x = Math.floor(a / 180) * 180; x < b; x += 180) {
      const px = x + hash(x) * 80, py = GY + 18 + hash(x * 5) * 60, s = kind === 'paddock' ? 2.2 : 1;
      g.fillStyle = pal[0];
      for (const [dx, dy, l] of [[-10, -12, 16], [0, -16, 18], [10, -12, 16]]) { g.save(); g.translate(px, py); g.rotate(dx * 0.04); g.fillRect(dx * s - 2, dy * s, 4 * s, l * s * 0.6); g.restore(); }
      g.fillRect(px - 7 * s, py - 3 * s, 14 * s, 8 * s);
    }
    for (let x = Math.floor(a / 410) * 410 + 120; x < b; x += 410) { const bx = x, by = GY + 40 + hash(x) * 50; box(g, bx, by, 26, 4, '#E8E0CC'); box(g, bx - 3, by - 2, 5, 8, '#F4EEDC'); box(g, bx + 24, by - 2, 5, 8, '#F4EEDC'); box(g, bx, by + 3, 26, 1, '#B8AE98'); }
  } else if (kind === 'ash') {
    for (let x = Math.floor(a / 60) * 60; x < b; x += 60) { const px = x + hash(x) * 40, py = GY + 10 + hash(x * 9) * 120; box(g, px, py, 10, 6, pal[1]); box(g, px, py, 10, 2, pal[4]); box(g, px + 6, py + 2, 4, 4, pal[0]); }
  } else if (kind === 'jungle') {
    for (let x = Math.floor(a / 50) * 50; x < b; x += 50) { const px = x + hash(x) * 30, py = GY + 10 + hash(x * 4) * 100; pixelBlob(g, px, py, 9, 4, hash(x) > 0.5 ? '#3E5A28' : '#5A4A2A'); }
    for (let x = Math.floor(a / 160) * 160; x < b; x += 160) { const px = x + hash(x * 2) * 100; box(g, px, GY + 2, 40, 5, '#4A3622'); box(g, px, GY + 2, 40, 1, '#6E5434'); box(g, px + 36, GY + 6, 12, 4, '#4A3622'); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Along the back

/** The pen's back wall: poured concrete in panels, stained, claw marks, razor wire along the top, the enclosure's
 *  name painted big on it (and a number to call). */
const penBackWall = (c: Ctx, state: GameState) => {
  const top = GY - 300;
  chunked(c, state, 'dpen-back', D - 60, FENCE_X + 40, top - 20, GY - top + 20, (g, a, b) => {
    const w = b - a;
    slab(g, a, top, w, GY - top, '#8A8478', { ink: false });
    for (let x = Math.floor(a / 120) * 120; x < b; x += 120) { box(g, x, top + 6, 2, GY - top - 6, '#6A6458'); box(g, x + 2, top + 6, 1, GY - top - 6, '#A8A296'); for (let y = top + 40; y < GY; y += 70) { box(g, x + 30, y, 3, 3, '#5A5448'); box(g, x + 90, y, 3, 3, '#5A5448'); } }
    // (water stains down it, from the top)
    for (let x = Math.floor(a / 70) * 70; x < b; x += 70) box(g, x + hash(x) * 40, top + 8, 6, 30 + hash(x * 3) * 90, 'rgba(60, 54, 40, 0.25)');
    // (claw marks, in threes)
    for (let x = Math.floor(a / 230) * 230 + 60; x < b; x += 230) for (let k = 0; k < 3; k++) { g.strokeStyle = '#5A5448'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + k * 8, GY - 150); g.lineTo(x + k * 8 + 20, GY - 90); g.stroke(); g.strokeStyle = '#B8B2A6'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + k * 8 + 2, GY - 150); g.lineTo(x + k * 8 + 22, GY - 90); g.stroke(); }
    // (the coping, and razor wire coiled along it)
    slab(g, a, top - 8, w, 10, '#A8A296', { ink: false });
    for (let x = Math.floor(a / 14) * 14; x < b; x += 14) { g.strokeStyle = '#C8CCD2'; g.lineWidth = 1; g.beginPath(); g.arc(x + 7, top - 15, 7, 0, Math.PI * 2); g.stroke(); }
    // (painted on it, stenciled big)
    g.save(); g.beginPath(); g.rect(a, top, w, GY - top); g.clip();
    text(g, 'VELOCIRAPTOR', D + 460, GY - 200, '#C8A21E', 16, 'center', '#5A5040');
    text(g, 'ENCLOSURE  B', D + 460, GY - 176, '#C8A21E', 16, 'center', '#5A5040');
    text(g, 'IN CASE OF ESCAPE DIAL 0', D + 460, GY - 150, '#E8E4DA', 7, 'center', '#5A5040');
    g.restore();
  });
};

/** The meadow's back: a split-rail fence, posts and two rails (well back: not something to stand on). */
const meadowRail = (c: Ctx, state: GameState) => {
  chunked(c, state, 'dmeadow-rail', D + 1000, D + 2500, GY - 80, 80, (g, a, b) => {
    for (let x = Math.floor(a / 110) * 110; x < b; x += 110) { box(g, x, GY - 70, 8, 70, '#5A3E22'); box(g, x, GY - 70, 2, 70, '#7A5A34'); }
    for (const y of [GY - 60, GY - 34]) { box(g, a, y, b - a, 6, '#6A4A2A'); box(g, a, y, b - a, 1, '#8A6A44'); box(g, a, y + 5, b - a, 1, '#3E2A16'); }
  });
};

/** Behind the plaza: planters and the park's lamp posts (their lamps lit after dark), a bench, a trash can shaped like
 *  a dinosaur egg. */
const plazaBack = (c: Ctx, state: GameState, f: number) => {
  chunked(c, state, 'dplaza-back', D + 3880, D + 5920, GY - 190, 190, (g, a, b) => {
    for (let x = Math.floor(a / 300) * 300 + 80; x < b; x += 300) {
      slab(g, x, GY - 34, 90, 34, '#A39A88');
      for (let i = 0; i < 6; i++) pixelBlob(g, x + 10 + i * 14, GY - 40, 12, 9, i % 2 ? '#3E6A2E' : '#4E7A36');
      pixelBlob(g, x + 45, GY - 62, 20, 16, '#4A7A34'); box(g, x + 44, GY - 70, 2, 30, '#5A4A2A');
      // (the lamp post)
      const lx = x + 180;
      pole(g, lx - 2, GY - 150, 5, 150, '#2E3A2E');
      box(g, lx - 9, GY - 162, 18, 12, INK); box(g, lx - 8, GY - 161, 16, 10, '#E8D49A'); box(g, lx - 10, GY - 166, 20, 4, '#2E3A2E');
      // (an egg-shaped trash can)
      g.fillStyle = INK; g.beginPath(); g.ellipse(lx + 50, GY - 18, 13, 19, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#D8CFAE'; g.beginPath(); g.ellipse(lx + 50, GY - 18, 12, 18, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#F0E8CC'; g.beginPath(); g.ellipse(lx + 46, GY - 24, 6, 9, 0, 0, Math.PI * 2); g.fill();
      box(g, lx + 42, GY - 30, 16, 3, '#2A2A2A'); for (let k = 0; k < 4; k++) box(g, lx + 40 + k * 6, GY - 14 + (k % 2) * 4, 3, 2, '#8A7A4E');
    }
  });
  void f;
};

/** The paddock's back: a huge fence (concrete pylons, steel bars, a top rail sparking), floodlight towers, the warning
 *  signs along it. */
const paddockBack = (c: Ctx, state: GameState, f: number) => {
  const top = GY - 420;
  chunked(c, state, 'dpad-back', PADDOCK_IN - 300, PADDOCK_OUT + 320, top - 80, GY - top + 80, (g, a, b) => {
    for (let x = Math.floor(a / 16) * 16; x < b; x += 16) { box(g, x, top + 20, 4, GY - top - 20, '#4A525C'); box(g, x, top + 20, 1, GY - top - 20, '#6A747E'); }
    for (const y of [top + 30, top + 140, top + 260, GY - 30]) { box(g, a, y, b - a, 8, '#5A626C'); box(g, a, y, b - a, 2, '#8A949E'); }
    for (let x = Math.floor(a / 240) * 240; x < b; x += 240) {
      slab(g, x, top, 34, GY - top, '#8E8A80', { ink: false }); box(g, x + 4, top + 4, 26, 4, '#B4B0A4');
      hazard(g, x, GY - 40, 34, 14);
      // (a floodlight tower every other one)
      if (Math.floor(x / 240) % 2 === 0) { pole(g, x + 14, top - 70, 6, 70, '#4A525C'); slab(g, x - 6, top - 84, 46, 16, '#3A424C'); for (let k = 0; k < 4; k++) box(g, x - 2 + k * 10, top - 80, 8, 8, '#D8DCE0'); }
      // (a warning sign on every pylon)
      const sx = x + 60;
      sign(g, sx, top + 170, 120, 40, '#F2D024', '', '#000000', 6);
      text(g, 'WARNING', sx + 60, top + 184, '#B91C1C', 8, 'center', null);
      text(g, 'HIGH VOLTAGE', sx + 60, top + 196, '#1A0B06', 6, 'center', null);
      text(g, '(MOSTLY)', sx + 60, top + 205, '#1A0B06', 5, 'center', null);
    }
  });
  // (the top rail crackling now and then)
  if (f % 90 < 6) {
    const x = PADDOCK_IN + ((Math.floor(f / 90) * 397) % (PADDOCK_OUT - PADDOCK_IN));
    c.strokeStyle = '#A5F3FC'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, top + 30);
    for (let k = 1; k < 5; k++) c.lineTo(x + k * 10, top + 30 + (k % 2 ? -8 : 4));
    c.stroke();
  }
};

/** The last stretch's back: jungle (fake rocks, real-ish ferns), the odd speaker hidden in a rock. */
const jungleBack = (c: Ctx, state: GameState) => {
  chunked(c, state, 'djungle-back', D + 8600, LAST_FENCE + 100, GY - 220, 220, (g, a, b) => {
    for (let x = Math.floor(a / 60) * 60; x < b; x += 60) {
      const h = 60 + hash(x) * 90;
      pixelBlob(g, x + 30, GY - h * 0.5, 40, h * 0.5, '#2A4420');
      pixelBlob(g, x + 24, GY - h * 0.6, 26, h * 0.32, '#3A5A2A');
    }
    for (let x = Math.floor(a / 330) * 330 + 100; x < b; x += 330) {
      slab(g, x, GY - 50, 70, 50, '#7A7262', { ink: false });
      // (a rock with a speaker grille in it: the jungle noises come from somewhere)
      box(g, x + 24, GY - 36, 22, 14, '#3A3630'); for (let k = 0; k < 5; k++) box(g, x + 26 + k * 4, GY - 34, 2, 10, '#1A1814');
    }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The raptor pen

/** The pen's left end: the wall he came down (its side going back), and the storm drain's culvert out of it, its
 *  grate swung open, water dribbling out of it down the wall. */
const drainWall = (c: Ctx, eye: Eye, f: number) => {
  prism(c, eye, D, GY - 700, PEN_WALL, GY, 0.7, CONC, {
    side: (pt) => { for (let y = GY - 680; y < GY; y += 60) seg(c, pt(0, y), pt(1, y), 'rgba(40, 36, 30, 0.35)'); },
    noTop: true,
  });
  stamp(c, 'dwall-front', D - 2, GY - 700, PEN_WALL + 4, 700, g => {
    slab(g, D, GY - 700, PEN_WALL, 700, CONC, { ink: true });
    for (let y = GY - 680; y < GY; y += 60) box(g, D + 2, y, PEN_WALL - 4, 2, '#7A766C');
  });
  // The culvert: a concrete pipe end sticking out of the wall, dark inside, the grate hanging open off one hinge
  const cx = D + PEN_WALL, cy = DRAIN_Y + 22;
  stamp(c, 'dculvert', cx - 6, cy - 40, 40, 82, g => {
    box(g, cx - 4, cy - 36, 18, 72, INK);
    box(g, cx - 2, cy - 34, 14, 68, '#B4AEA2'); box(g, cx - 2, cy - 34, 14, 4, '#D2CCC0'); box(g, cx + 8, cy - 34, 4, 68, '#8A8478');
    box(g, cx - 2, cy - 30, 6, 60, '#141210');
    // (the grate, swung open, hanging)
    box(g, cx + 12, cy - 30, 3, 64, '#3A3A3A');
    for (let y = cy - 28; y < cy + 32; y += 8) box(g, cx + 12, y, 16, 2, '#4A4A4A');
    box(g, cx + 26, cy - 30, 2, 64, '#3A3A3A');
  });
  // (water, dribbling out of it, down the wall, into a puddle)
  for (let i = 0; i < 4; i++) { const y = cy + 30 + ((f * 2 + i * 41) % (GY - cy - 30)); box(c, cx + 2 + (i % 2) * 3, y, 2, 6, 'rgba(160, 210, 240, 0.7)'); }
  c.fillStyle = 'rgba(120, 170, 210, 0.45)'; c.beginPath(); c.ellipse(cx + 30, GY + 6, 40, 4, 0, 0, Math.PI * 2); c.fill();
  box(c, cx + 14 + (f >> 3) % 20, GY + 5, 6, 1, 'rgba(230, 245, 255, 0.7)');
};

/** A platform on its posts (feeding platform, viewing deck, boardwalk, scaffold, a branch round a tree): its deck's
 *  top going back (when he's over it), its front edge lit, its legs to the ground, braced. */
const platform = (c: Ctx, state: GameState, eye: Eye, x: number, y: number, w: number, f: number) => {
  const kind = x < FENCE_X ? 'feed' : x < D + 1300 ? 'deck' : x < D + 2500 ? 'board' : x < D + 5800 && w < 400 ? 'scaffold' : x < D + 5800 ? 'mono' : x < D + 8700 ? 'steel' : 'branch';
  if (kind === 'mono') return; // (the monorail: monorail())
  const deck = kind === 'feed' || kind === 'scaffold' || kind === 'steel' ? '#7A828C' : kind === 'branch' ? '#6E4E30' : WOOD;
  const T = 12;
  // Legs (behind the deck): two, or three for a long one; braced
  if (kind !== 'branch') {
    const legs = w > 160 ? [x + 10, x + w / 2 - 4, x + w - 18] : [x + 10, x + w - 18];
    for (const lx of legs) {
      prism(c, eye, lx, y + T, 8, GY, 0.94, deck, { noTop: true, shadow: false });
      stamp(c, `dleg-${kind}-${GY - y}-${lx}`, lx - 1, y + T, 10, GY - y - T, g => pole(g, lx, y + T, 8, GY - y - T, kind === 'board' || kind === 'deck' ? '#6A4A2A' : '#5A626C'));
    }
    if (GY - y > 60) stamp(c, `dbrace-${kind}-${x}`, x, y + T, w, GY - y - T, g => {
      g.strokeStyle = kind === 'board' || kind === 'deck' ? '#5A3E22' : '#4A525C'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(x + 14, y + T + 4); g.lineTo(x + w - 14, GY - 20); g.moveTo(x + w - 14, y + T + 4); g.lineTo(x + 14, GY - 20); g.stroke();
    });
  }
  // The deck: its top going back, then its front
  prism(c, eye, x, y, w, y + T, 0.9, deck, {
    topCol: lite(deck, 0.1), shadow: false,
    top: pt => {
      if (kind === 'feed' || kind === 'steel' || kind === 'scaffold') for (let u = 0.05; u < 1; u += 0.06) seg(c, pt(u, 0), pt(u, 1), 'rgba(30, 34, 40, 0.5)');
      else for (let k = 0.25; k < 1; k += 0.25) seg(c, pt(0, k), pt(1, k), 'rgba(40, 24, 10, 0.45)');
    },
  });
  stamp(c, `dplat-${kind}-${w}-${x}`, x - 2, y - 2, w + 4, T + 4, g => {
    slab(g, x, y, w, T, deck);
    if (kind === 'board' || kind === 'deck' || kind === 'branch') for (let px = x + 10; px < x + w; px += 14) box(g, px, y + 5, 1, T - 6, dark(deck, 0.35));
    else { for (let px = x + 4; px < x + w - 4; px += 6) box(g, px, y + 5, 2, T - 7, '#3A4048'); }
    if (kind === 'feed' || kind === 'steel') hazard(g, x + 2, y + T - 4, w - 4, 3);
    lipOn(g, x, y, w, deck === WOOD ? '#C89A5A' : kind === 'branch' ? '#A8845A' : '#C8D0DA');
  });
  // What's on it, or hangs off it
  if (kind === 'feed') {
    // (a feeding chute down to it from nowhere, a meat hook swinging under it, its number stenciled on a plate)
    const hx = x + w / 2, sw = Math.sin(f * 0.04 + x) * 4;
    seg(c, [hx, y + T], [hx + sw, y + T + 26], '#3A3A3A', 2);
    c.strokeStyle = '#9AA4AE'; c.lineWidth = 2; c.beginPath(); c.arc(hx + sw, y + T + 32, 5, -Math.PI * 0.2, Math.PI * 1.1); c.stroke();
    stamp(c, `dfeed-plate-${x}`, x + 6, y + T + 2, 46, 14, g => sign(g, x + 10, y + T + 5, 38, 8, '#E8E4DA', `FEED ${x === D + 620 ? 1 : 2}`, '#1A0B06', 5));
  } else if (kind === 'deck') {
    // (the viewing deck: a rail along its back, coin binoculars on a post, a plaque)
    stamp(c, 'dview-deck', x, y - 40, w, 40, g => {
      box(g, x + 4, y - 24, w - 8, 3, '#5A3E22'); box(g, x + 4, y - 24, w - 8, 1, '#8A6A44');
      for (let px = x + 6; px < x + w; px += 32) box(g, px, y - 24, 3, 24, '#5A3E22');
      pole(g, x + w - 40, y - 26, 4, 26, '#3A4A3A');
      slab(g, x + w - 50, y - 36, 24, 12, '#2E5A3A'); box(g, x + w - 52, y - 34, 6, 8, '#1A2A1E'); box(g, x + w - 30, y - 34, 6, 8, '#1A2A1E');
      box(g, x + w - 44, y - 33, 4, 4, '#9AD0F0');
    });
    stamp(c, 'dview-plaque', x + 8, y + T + 2, 104, 16, g => sign(g, x + 14, y + T + 5, 92, 9, '#2E5A3A', 'VIEWING DECK', '#F2E8C8', 5, '#5A3E22'));
  } else if (kind === 'board') {
    // (rope rails: posts, the rope sagging between)
    stamp(c, `dboard-rail-${x}`, x, y - 30, w, 30, g => {
      for (let px = x + 4; px < x + w; px += 48) { box(g, px, y - 22, 4, 22, '#5A3E22'); box(g, px, y - 22, 1, 22, '#8A6A44'); }
      g.strokeStyle = '#C8B07A'; g.lineWidth = 2;
      for (let px = x + 6; px + 48 < x + w + 4; px += 48) { g.beginPath(); g.moveTo(px, y - 20); g.quadraticCurveTo(px + 24, y - 10, px + 48, y - 20); g.stroke(); }
    });
  } else if (kind === 'branch') {
    // (the boughs it's bolted to, back to the trunk)
    stamp(c, `dbranch-${x}`, x, y + T, w, 40, g => {
      g.strokeStyle = '#4A3826'; g.lineWidth = 6; g.beginPath(); g.moveTo(x + 12, y + T); g.lineTo(x + w / 2 - 6, y + T + 34); g.moveTo(x + w - 12, y + T); g.lineTo(x + w / 2 + 6, y + T + 34); g.stroke();
      g.strokeStyle = '#6E5434'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 11, y + T - 1); g.lineTo(x + w / 2 - 7, y + T + 33); g.stroke();
      for (const bx of [x + 8, x + w - 14]) { box(g, bx, y + T, 6, 6, '#5A626C'); box(g, bx + 2, y + T + 2, 2, 2, '#C8D0DA'); }
    });
  } else if (kind === 'scaffold') {
    // (a ladder down its side)
    stamp(c, `dscaf-ladder-${x}`, x + w - 8, y, 22, GY - y, g => { box(g, x + w - 4, y, 3, GY - y, '#C8A020'); box(g, x + w + 10, y, 3, GY - y, '#C8A020'); for (let ly = y + 8; ly < GY; ly += 12) box(g, x + w - 4, ly, 17, 2, '#A88010'); });
  }
};

/** The pen's fence: tall steel posts going back from where he hops it (the front one's the solid), the wires strung
 *  on insulators, humming (a spark along them now and then, more of them hostile), the warning signs bolted to it. */
const penFence = (c: Ctx, state: GameState, eye: Eye, f: number, look: DinoLook) => {
  const top = FENCE_TOP, x = FENCE_X;
  // (the fence going back: posts at depths, wires joining them)
  const deps = [1, 0.92, 0.84, 0.76, 0.68];
  const wires = [top + 20, top + 60, top + 100, top + 140, top + 180, GY - 20];
  for (let i = deps.length - 1; i > 0; i--) {
    const [px, pt0] = P(eye, x + 10, top, deps[i]), [, pb] = P(eye, x + 10, GY, deps[i]);
    box(c, px - 3 * deps[i], pt0, 6 * deps[i], pb - pt0, dark(STEEL, 0.2 + (1 - deps[i])));
  }
  for (const wy of wires) for (let i = 0; i < deps.length - 1; i++) seg(c, P(eye, x + 10, wy, deps[i]), P(eye, x + 10, wy, deps[i + 1]), 'rgba(40, 44, 50, 0.8)');
  // (the front post: the solid he hops)
  prism(c, eye, x, top, 20, GY, 0.96, STEEL, { shadow: true });
  stamp(c, 'dpen-fencepost', x - 4, top - 10, 28, GY - top + 10, g => {
    pole(g, x + 2, top, 16, GY - top, STEEL);
    for (const wy of wires) { box(g, x - 2, wy - 3, 24, 6, INK); box(g, x - 1, wy - 2, 22, 4, '#E8E0C8'); box(g, x - 1, wy - 2, 22, 1, '#FFFFFF'); }
    // (the cap, lit: it's stood on)
    slab(g, x - 2, top - 4, 24, 8, '#A8B0BA'); lipOn(g, x - 2, top - 4, 24, '#C8D0DA');
    // (a warning light on top of it)
  });
  // (the lamp on the cap: red, blinking, hostile; green, steady, before)
  const red = look.hostile;
  const on = red ? (f >> 4) % 2 === 0 : true;
  box(c, x + 6, top - 10, 8, 6, INK); box(c, x + 7, top - 9, 6, 4, red ? (on ? '#FF4040' : '#5A1010') : '#40E070');
  if (on) steppedGlow(c, x + 10, top - 7, 14, red ? '#FF4040' : '#40E070', 0.3, 0.05, 3);
  // The warning signs bolted to the fence's front (facing the path), clear of its top
  stamp(c, 'dpen-signs', x + 14, top + 30, 150, 130, g => {
    // (the brackets they hang off)
    box(g, x + 18, top + 40, 10, 3, '#3A3A3A'); box(g, x + 18, top + 100, 10, 3, '#3A3A3A');
    sign(g, x + 32, top + 36, 112, 42, '#F2D024', '', INK, 6);
    text(g, 'DANGER', x + 88, top + 50, '#B91C1C', 8, 'center', null);
    text(g, '10,000 VOLTS', x + 88, top + 62, INK, 6, 'center', null);
    text(g, '(DECORATIVE)', x + 88, top + 72, INK, 5, 'center', null);
    sign(g, x + 32, top + 92, 112, 34, '#F8FAFC', '', INK, 6, '#B91C1C');
    text(g, 'DO NOT FEED', x + 88, top + 106, '#B91C1C', 6, 'center', null);
    text(g, 'THE RAPTORS', x + 88, top + 116, '#B91C1C', 6, 'center', null);
  });
  // (a spark crawling along a wire now and then: more often, hostile)
  const period = look.hostile ? 50 : 140;
  if (f % period < 5) {
    const wy = wires[Math.floor(f / period) % wires.length], k = (f % period) / 5;
    const [sx, sy] = P(eye, x + 10, wy, 1 - k * 0.3);
    steppedGlow(c, sx, sy, 8, '#A5F3FC', 0.6, 0.1, 3); box(c, sx - 1, sy - 1, 3, 3, '#FFFFFF');
  }
  void state;
};

// ---------------------------------------------------------------------------------------------------------------
// The maintenance booth

const booth = (c: Ctx, state: GameState, eye: Eye, f: number, look: DinoLook) => {
  const { x, w, top } = BOOTH, h = GY - top, win = BOOTH.win;
  // (the roof overhangs a little: the side and the top of it first)
  prism(c, eye, x, top, w, GY, 0.8, '#B8AE98', {
    topCol: '#6A6A70',
    side: pt => {
      for (let y = top + 14; y < GY; y += 10) seg(c, pt(0, y), pt(1, y), 'rgba(90, 80, 60, 0.4)');
      // (an AC unit hung on the side)
      quad(c, [pt(0.3, top + 30), pt(0.62, top + 30), pt(0.62, top + 62), pt(0.3, top + 62)], '#A8ACB0');
      for (let k = 0.34; k < 0.6; k += 0.05) seg(c, pt(k, top + 34), pt(k, top + 58), '#6A6E72');
    },
    top: pt => { quad(c, [pt(0.6, 0.2), pt(0.85, 0.2), pt(0.85, 0.6), pt(0.6, 0.6)], '#8A8E92'); seg(c, pt(0.72, 0.4), pt(0.72, -0.6), '#5A5E62', 2); },
  });
  stamp(c, 'dbooth-front', x - 8, top - 14, w + 16, h + 14, g => {
    slab(g, x, top, w, h, '#C8BEA6');
    for (let y = top + 14; y < GY - 4; y += 10) { box(g, x + 2, y, w - 4, 1, '#A89E86'); box(g, x + 2, y + 1, w - 4, 1, '#DCD2BA'); }
    // (the roof's edge, overhanging)
    slab(g, x - 6, top - 10, w + 12, 12, '#5A5A62');
    // (the window frame (the glass is drawn live: him in there), the door, its sign, the plaque)
    box(g, win.x - 4, win.y - 4, win.w + 8, win.h + 8, INK); box(g, win.x - 3, win.y - 3, win.w + 6, win.h + 6, '#E8E4DA');
    box(g, win.x - 6, win.y + win.h + 3, win.w + 12, 4, '#A89E86');
    const dx = x + w - 56;
    slab(g, dx, GY - 92, 40, 92, '#5A6E7E'); box(g, dx + 6, GY - 84, 28, 20, '#3A4A58'); box(g, dx + 30, GY - 50, 5, 5, '#E8C040');
    sign(g, dx + 4, GY - 58, 32, 12, '#F8FAFC', 'STAFF', '#B91C1C', 5);
    sign(g, x + 22, top + 6, 90, 10, '#1E3A8A', 'MAINTENANCE', '#F8FAFC', 5, '#3A3F48');
    // (a clipboard on a nail, and a fire extinguisher)
    box(g, win.x + win.w + 12, win.y + 2, 12, 16, '#8A6A3A'); box(g, win.x + win.w + 13, win.y + 5, 10, 12, '#F4F4F0'); for (let k = 0; k < 4; k++) box(g, win.x + win.w + 14, win.y + 7 + k * 3, 7, 1, '#8A8A8A');
    box(g, x + 6, GY - 40, 9, 28, INK); box(g, x + 7, GY - 39, 7, 26, '#C81E1E'); box(g, x + 7, GY - 39, 2, 26, '#E85050');
  });
  // The window: dim inside, him sat with his back to it, the panel lit (its lamps' colors the robots' mode)
  c.save(); c.beginPath(); c.rect(win.x, win.y, win.w, win.h); c.clip();
  box(c, win.x, win.y, win.w, win.h, '#2A3240');
  box(c, win.x, win.y + win.h - 12, win.w, 12, '#3A3028');
  c.save(); c.translate(win.x + 22, win.y + win.h + 20); c.scale(-0.62, 0.62);
  drawPerson(c, { seed: 4242, outfit: 'maint', pose: 'sit', f, mood: 'bored', woman: false });
  c.restore();
  const px = win.x + 38;
  box(c, px, win.y + 8, 24, 22, '#4A4E56'); box(c, px + 1, win.y + 9, 22, 2, '#6A6E76');
  const hostile = look.hostile || look.switching;
  const blink = (f >> 3) % 2 === 0;
  box(c, px + 3, win.y + 14, 6, 5, hostile ? '#1A3A1A' : '#40E070');
  box(c, px + 14, win.y + 14, 6, 5, hostile ? (blink ? '#FF4040' : '#6A1010') : '#3A1010');
  box(c, px + 10, win.y + 21, 3, 7, '#D8D8D8');
  if (hostile && blink) steppedGlow(c, px + 17, win.y + 16, 14, '#FF4040', 0.25, 0.04, 3);
  // (the glass: a glint across it)
  c.fillStyle = 'rgba(200, 225, 255, 0.18)'; c.beginPath(); c.moveTo(win.x + 4, win.y + win.h); c.lineTo(win.x + 16, win.y + win.h); c.lineTo(win.x + 40, win.y); c.lineTo(win.x + 28, win.y); c.closePath(); c.fill();
  c.restore();
  void state;
};

// ---------------------------------------------------------------------------------------------------------------
// The meadow

const meadowSign = (c: Ctx, state: GameState, eye: Eye) => {
  // (a carved wooden sign on two log posts, standing on the meadow's back edge; hay bales by it)
  atDepth(c, eye, 0.86, () => stamp(c, 'dmeadow-sign', D + 1920, GY - 150, 240, 150, g => {
    for (const px of [D + 1940, D + 2100]) pole(g, px, GY - 130, 10, 130, '#6A4A2A');
    sign(g, D + 1930, GY - 140, 190, 30, '#8A5A2A', 'TRICERATOPS MEADOW', '#F2DC9A', 8, '#5A3A1A');
    sign(g, D + 1950, GY - 98, 150, 16, '#E8DCB8', 'PLEASE STAY ON THE BOARDWALK', '#5A3A1A', 5, '#5A3A1A');
    for (const [hx, hy] of [[D + 1925, GY - 26], [D + 2080, GY - 26], [D + 2100, GY - 50]] as const) {
      slab(g, hx, hy, 44, 26, '#D8B860', { ink: true }); for (let k = 0; k < 5; k++) box(g, hx + 4 + k * 8, hy + 4, 2, 18, '#B8963A'); box(g, hx + 2, hy + 12, 40, 2, '#8A6A2A');
    }
  }));
  void state;
};

// ---------------------------------------------------------------------------------------------------------------
// MOUNT KABOOMA

const VX0 = D + 2420, VX1 = D + 3980, VPEAK = GY - 600, CRATER = { x: D + 3300, w: 220 };
/** The cone's outline (in the walk plane: it's drawn pushed back). */
const coneTop = (x: number) => {
  const m0 = CRATER.x - CRATER.w / 2, m1 = CRATER.x + CRATER.w / 2;
  if (x >= m0 && x <= m1) {
    // (the crater: a rim either side, the bowl between, a little lower)
    const e = Math.min(x - m0, m1 - x);
    return VPEAK + (e < 16 ? -4 + e * 0.6 : 10) + Math.sin(x * 0.07) * 1.5;
  }
  const k = x < m0 ? (x - VX0) / (m0 - VX0) : (VX1 - x) / (VX1 - m1);
  return GY - (GY - VPEAK) * Math.pow(Math.max(0, k), 0.8) + Math.sin(x * 0.05) * 3;
};
const LAVA = ['#7A1004', '#B82A06', '#E8540A', '#F88A1A', '#FFC23A', '#FFEC8A', '#FFC23A', '#F88A1A', '#E8540A', '#B82A06'];
/** The channels the fake lava runs down: [x at the crater, where it ends, the wiggle]. */
const RUNS: [number, number, number][] = [[D + 3240, GY - 300, 1], [D + 3380, GY - 330, -1], [D + 3300, GY - 470, 0.5]];
const volcano = (c: Ctx, state: GameState, eye: Eye, f: number) => {
  const d = 0.86;
  atDepth(c, eye, d, () => {
    stamp(c, 'dvolcano-cone', VX0, VPEAK - 30, VX1 - VX0, GY - VPEAK + 30, g => paintCone(g));
    // (the fake lava: in the crater, and down its channels, cycling through its colors (the old palette trick))
    const t = Math.floor(f / 5);
    for (let i = 0; i < 12; i++) box(c, CRATER.x - 84 + i * 14, VPEAK + 4, 14, 8, LAVA[(i + t) % LAVA.length]);
    steppedGlow(c, CRATER.x, coneTop(CRATER.x) - 6, 90, '#FF8A2A', 0.18 + 0.05 * Math.sin(f * 0.1), 0, 4);
    for (const [rx, end, wig] of RUNS) {
      for (let y = coneTop(rx), i = 0; y < end; y += 8, i++) box(c, rx + Math.sin(y * 0.03) * 10 * wig - 4, y, 8, 8, LAVA[(i - t + 100 * LAVA.length) % LAVA.length]);
    }
    // (steam: puffs off the crater and out of a vent, rising, thinning)
    for (let i = 0; i < 6; i++) {
      const k = ((f * 0.6 + i * 40) % 240) / 240, sx = CRATER.x - 40 + i * 16 + Math.sin(f * 0.02 + i) * 10 * k;
      pixelBlob(c, sx, coneTop(CRATER.x) - 20 - k * 160, 10 + k * 26, 8 + k * 18, `rgba(236, 236, 240, ${(0.45 * (1 - k)).toFixed(2)})`);
    }
    const vx = D + 2760, vy = coneTop(vx) + 40;
    if ((f % 300) < 120) for (let i = 0; i < 3; i++) { const k = (((f % 300) + i * 20) % 120) / 120; pixelBlob(c, vx + k * 10, vy - k * 70, 6 + k * 14, 5 + k * 10, `rgba(240, 240, 244, ${(0.5 * (1 - k)).toFixed(2)})`); }
  });
  // The steps up it (fiberglass rock): sides and tops going back, then the fronts
  const steps: [number, number, number][] = [[D + 2550, GY - 100, 200], [D + 2750, GY - 210, 200], [D + 2950, GY - 320, 250], [D + 3200, GY - 430, 200], [D + 3400, GY - 300, 200], [D + 3600, GY - 170, 200]];
  for (const [x, top, w] of steps) prism(c, eye, x, top, w, GY, 0.88, ROCK, {
    topCol: '#8A7660',
    side: pt => { for (let y = top + 30; y < GY; y += 44) seg(c, pt(0, y), pt(1, y + 6), 'rgba(30, 20, 14, 0.35)'); },
    top: pt => { for (let u = 0.15; u < 1; u += 0.3) seg(c, pt(u, 0.1), pt(u + 0.05, 0.9), 'rgba(40, 28, 18, 0.35)'); },
  });
  for (const [x, top, w] of steps) stamp(c, `dvstep-${x}`, x - 2, top - 2, w + 4, GY - top + 2, g => paintStep(g, x, top, w));
  // The sign at its foot: carved, on posts, tiki-ish; the plaque under it
  stamp(c, 'dkabooma-sign', D + 2360, GY - 190, 200, 190, g => {
    for (const px of [D + 2380, D + 2520]) { pole(g, px, GY - 160, 12, 160, '#5A3A1E'); for (let y = GY - 150; y < GY; y += 22) box(g, px, y, 12, 2, '#3E2810'); }
    sign(g, D + 2370, GY - 182, 170, 30, '#5A3A1A', 'MOUNT KABOOMA', '#FF9A2A', 9, '#3E2810');
    sign(g, D + 2392, GY - 140, 126, 22, '#E8DCB8', '', '#5A3A1A', 5, '#3E2810');
    text(g, '(NOT A REAL', D + 2455, GY - 130, '#5A3A1A', 5, 'center', null);
    text(g, 'VOLCANO)', D + 2455, GY - 122, '#5A3A1A', 5, 'center', null);
  });
  void state;
};
const paintCone = (g: Ctx) => {
  const r = rampOf(FIBER);
  // (the cone in bands of its ramp, lit on the left flank, the right in shade)
  g.fillStyle = r[2]; g.beginPath(); g.moveTo(VX0, GY);
  for (let x = VX0; x <= VX1; x += 8) g.lineTo(x, coneTop(x));
  g.lineTo(VX1, GY); g.closePath(); g.fill();
  g.save(); g.clip();
  g.fillStyle = r[3]; g.beginPath(); g.moveTo(VX0, GY); for (let x = VX0; x <= CRATER.x; x += 8) g.lineTo(x + 30, coneTop(x) + 20); g.lineTo(CRATER.x - 120, GY); g.closePath(); g.fill();
  g.fillStyle = r[1]; g.beginPath(); g.moveTo(CRATER.x + 60, coneTop(CRATER.x + 60)); for (let x = CRATER.x + 60; x <= VX1; x += 8) g.lineTo(x, coneTop(x)); g.lineTo(VX1, GY); g.lineTo(CRATER.x + 200, GY); g.closePath(); g.fill();
  // (dithered where the flanks meet)
  for (let y = VPEAK; y < GY; y += 4) { const xl = CRATER.x - 120 + (y - VPEAK) * -0.2; checker(g, xl, y, 8, 4, r[2]); }
  // (fiberglass panels: seams going round it and down it, bolted)
  for (let y = VPEAK + 60; y < GY; y += 70) { box(g, VX0, y, VX1 - VX0, 2, r[0]); box(g, VX0, y + 2, VX1 - VX0, 1, r[4]); for (let x = VX0 + 20; x < VX1; x += 40) box(g, x, y - 3, 2, 2, '#B8B0A8'); }
  for (let x = VX0 + 140; x < VX1; x += 180) { g.fillStyle = r[0]; for (let y = coneTop(x); y < GY; y += 6) g.fillRect(x + (y - coneTop(x)) * 0.12 * Math.sign(x - CRATER.x), y, 2, 4); }
  // (an access hatch, half-hidden behind a fake boulder: AUTHORIZED PERSONNEL ONLY)
  const hx = D + 3660, hy = GY - 400;
  slab(g, hx, hy, 46, 56, '#5A5048'); box(g, hx + 4, hy + 4, 38, 48, '#4A423A'); box(g, hx + 34, hy + 26, 6, 6, '#C8C0B0');
  for (let k = 0; k < 4; k++) box(g, hx + 8, hy + 10 + k * 10, 26, 2, '#3A322A');
  text(g, 'AUTHORIZED', hx + 23, hy - 10, '#E8E0D0', 5, 'center', INK); text(g, 'PERSONNEL ONLY', hx + 23, hy - 3, '#E8E0D0', 5, 'center', INK);
  // (charred streaks, painted on, a patch where the paint's flaked showing white fiberglass)
  for (let i = 0; i < 6; i++) { const x = VX0 + 200 + i * 200; box(g, x, coneTop(x) + 30, 10, 80, 'rgba(30, 20, 14, 0.25)'); }
  box(g, D + 2900, GY - 360, 30, 14, '#E8E0D2'); box(g, D + 2904, GY - 356, 22, 6, '#D8CEBE');
  // (the crater's rim: dark in, lit along its edge)
  g.fillStyle = '#2A1A10'; g.beginPath(); g.ellipse(CRATER.x, coneTop(CRATER.x) - 2, CRATER.w / 2 - 20, 10, 0, 0, Math.PI * 2); g.fill();
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); for (let x = VX0; x <= VX1; x += 8) (x === VX0 ? g.moveTo(x, coneTop(x)) : g.lineTo(x, coneTop(x))); g.stroke();
};
const paintStep = (g: Ctx, x: number, top: number, w: number) => {
  const r = rampOf(ROCK), h = GY - top;
  slab(g, x, top, w, h, ROCK);
  // (lumps of fake rock, stepped, and the seams where the molded panels meet)
  for (let i = 0; i < Math.floor(w * h / 2400); i++) {
    const bx = x + 8 + hash(x + i * 3.1) * (w - 30), by = top + 14 + hash(x * 2 + i * 7.3) * (h - 30), bw = 14 + hash(i + x) * 18;
    box(g, bx, by, bw, 10, r[1]); box(g, bx, by, bw, 2, r[3]); box(g, bx + bw - 3, by + 2, 3, 8, r[0]);
  }
  for (let y = top + 44; y < GY; y += 44) { box(g, x + 4, y, w - 8, 1, r[0]); for (let k = x + 16; k < x + w - 8; k += 30) box(g, k, y - 2, 2, 2, '#A8A098'); }
  lipOn(g, x, top, w, '#B8A488');
};

// ---------------------------------------------------------------------------------------------------------------
// The gift shop, the monorail

const SHOP = { x: D + 4300, w: 400, top: GY - 150 };
const giftShop = (c: Ctx, state: GameState, eye: Eye, f: number) => {
  const { x, w, top } = SHOP;
  // (behind its roof: the shop's sign up on a frame, well back (not something to stand on), a cartoon raptor holding
  // a stick of dynamite, its fuse lit)
  atDepth(c, eye, 0.84, () => {
    stamp(c, 'dshop-billboard', x + 20, top - 120, w - 40, 120, g => {
      for (const px of [x + 60, x + w - 70]) { box(g, px, top - 40, 6, 40, '#3A3A3A'); box(g, px + 30, top - 40, 6, 40, '#3A3A3A'); }
      sign(g, x + 30, top - 110, w - 60, 70, '#1E5A3A', '', '#000', 8, '#5A3A1A');
      text(g, 'DINO-MITE', x + w / 2 + 30, top - 82, '#FFD23A', 14, 'center', '#3A1A0A');
      text(g, 'GIFTS', x + w / 2 + 30, top - 58, '#FFFFFF', 10, 'center', '#3A1A0A');
      // (the cartoon raptor, grinning, and its dynamite)
      const rx = x + 70, ry = top - 60;
      g.fillStyle = INK; g.beginPath(); g.ellipse(rx, ry - 6, 22, 16, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#6ABA4A'; g.beginPath(); g.ellipse(rx, ry - 6, 21, 15, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#8AD46A'; g.beginPath(); g.ellipse(rx - 5, ry - 10, 12, 8, 0, 0, Math.PI * 2); g.fill();
      box(g, rx + 4, ry - 12, 6, 6, '#FFFFFF'); box(g, rx + 7, ry - 10, 3, 3, INK);
      box(g, rx - 12, ry + 2, 26, 3, INK); for (let k = 0; k < 6; k++) box(g, rx - 10 + k * 4, ry + 2, 2, 2, '#FFFFFF');
      box(g, rx + 18, ry - 20, 8, 22, INK); box(g, rx + 19, ry - 19, 6, 20, '#D8282A'); box(g, rx + 19, ry - 19, 2, 20, '#F05050');
      box(g, rx + 21, ry - 26, 2, 7, '#3A3A3A');
    });
    // (the fuse's spark, live)
    const sx = x + 70 + 22, sy = top - 60 - 27;
    if (f % 6 < 4) { box(c, sx - 2, sy - 2, 4, 4, '#FFE060'); box(c, sx - 1 + (f % 3) - 1, sy - 4, 2, 2, '#FFFFFF'); }
  });
  prism(c, eye, x, top, w, GY, 0.8, '#C89A6A', {
    topCol: '#8A6A50',
    side: pt => { for (let y = top + 20; y < GY; y += 14) seg(c, pt(0, y), pt(1, y), 'rgba(80, 50, 24, 0.35)'); quad(c, [pt(0.3, GY - 100), pt(0.6, GY - 100), pt(0.6, GY - 60), pt(0.3, GY - 60)], '#2A3A4A'); },
    top: pt => { quad(c, [pt(0.15, 0.2), pt(0.35, 0.2), pt(0.35, 0.55), pt(0.15, 0.55)], '#9AA0A6'); quad(c, [pt(0.7, 0.3), pt(0.82, 0.3), pt(0.82, 0.6), pt(0.7, 0.6)], '#7A8086'); },
  });
  stamp(c, 'dshop-front', x - 6, top - 6, w + 12, GY - top + 6, g => {
    slab(g, x, top, w, GY - top, '#D8A870');
    // (bamboo trim, thatch-look fascia along the roofline)
    box(g, x, top, w, 18, '#8A6A3A'); for (let k = x; k < x + w; k += 6) box(g, k, top + 2, 3, 14 + (k % 12 === 0 ? 3 : 0), '#C8A050');
    lipOn(g, x, top, w, '#E8C878');
    for (const px of [x, x + w - 10]) { pole(g, px, top + 18, 10, GY - top - 18, '#B8A060'); for (let y = top + 30; y < GY; y += 24) box(g, px, y, 10, 2, '#7A6A30'); }
    // (the shop windows: plush dinos stacked, price tags; the door, OPEN; a sale sign)
    for (const wx of [x + 24, x + 250]) {
      box(g, wx - 3, GY - 112, 130, 84, INK); box(g, wx, GY - 109, 124, 78, '#3A5A6A');
      for (let i = 0; i < 6; i++) {
        const px = wx + 14 + i * 19, py = GY - 46 - (i % 2) * 12, col = ['#6ABA4A', '#E86AA0', '#5A8AE8', '#F2C23A', '#A06AE8', '#E8743A'][i];
        g.fillStyle = INK; g.beginPath(); g.ellipse(px, py, 10, 12, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = col; g.beginPath(); g.ellipse(px, py, 9, 11, 0, 0, Math.PI * 2); g.fill();
        box(g, px - 2, py - 6, 3, 3, '#FFFFFF'); box(g, px - 1, py - 5, 1, 1, INK); box(g, px - 5, py + 2, 8, 2, dark(col, 0.4));
      }
      box(g, wx, GY - 34, 124, 4, '#8A6A3A');
      g.fillStyle = 'rgba(220, 240, 255, 0.22)'; g.beginPath(); g.moveTo(wx + 10, GY - 31); g.lineTo(wx + 26, GY - 31); g.lineTo(wx + 60, GY - 109); g.lineTo(wx + 44, GY - 109); g.closePath(); g.fill();
    }
    sign(g, x + 34, GY - 104, 104, 12, '#F8FAFC', 'T-SHIRTS 2 FOR $40', '#B91C1C', 5);
    sign(g, x + 262, GY - 104, 104, 12, '#FFE040', 'EVERYTHING MUST GO', '#B91C1C', 5);
    const dx = x + 170;
    slab(g, dx, GY - 104, 64, 104, '#7A4A22'); box(g, dx + 6, GY - 98, 52, 54, '#3A5A6A'); box(g, dx + 31, GY - 98, 2, 54, '#7A4A22');
    box(g, dx + 50, GY - 40, 6, 6, '#E8C040');
    sign(g, dx + 14, GY - 34, 36, 10, '#F8FAFC', 'OPEN', '#15803D', 5);
  });
  void state;
};

const PILLARS = [D + 4100, D + 4900, D + 5680];
const MONO = { x: D + 4100, w: 1600, y: GY - 280 };
const monorail = (c: Ctx, state: GameState, eye: Eye) => {
  // The pillars (T-topped concrete), then the beam (its underside going back, its front, the lit top he runs along)
  for (const px of PILLARS) {
    prism(c, eye, px, MONO.y + 24, 16, GY, 0.92, CONC, { noTop: true });
    stamp(c, `dmono-pillar-${px}`, px - 26, MONO.y + 20, 68, GY - MONO.y - 20, g => {
      pole(g, px, MONO.y + 34, 16, GY - MONO.y - 34, CONC);
      slab(g, px - 22, MONO.y + 22, 60, 14, '#A8A498');
      box(g, px - 2, GY - 30, 20, 30, '#7A766C');
      for (let y = MONO.y + 60; y < GY - 30; y += 40) box(g, px + 2, y, 12, 1, '#7A766C');
    });
  }
  prism(c, eye, MONO.x, MONO.y, MONO.w, MONO.y + 24, 0.9, '#B0ACA0', { topCol: '#9C988C', shadow: false, top: pt => seg(c, pt(0, 0.5), pt(1, 0.5), 'rgba(60, 56, 50, 0.4)', 2) });
  chunked(c, state, 'dmono-beam', MONO.x - 2, MONO.x + MONO.w + 2, MONO.y - 2, 28, (g, a, b) => {
    slab(g, MONO.x, MONO.y, MONO.w, 24, '#B0ACA0');
    for (let x = Math.floor(a / 200) * 200; x < b; x += 200) { box(g, x, MONO.y + 4, 2, 18, '#7A766C'); box(g, x + 2, MONO.y + 4, 1, 18, '#D0CCC0'); }
    // (the power rail along its side, rusty streaks under it)
    box(g, a, MONO.y + 14, b - a, 3, '#5A4A3A'); for (let x = Math.floor(a / 37) * 37; x < b; x += 37) box(g, x, MONO.y + 17, 2, 4 + (x % 3) * 2, 'rgba(120, 60, 20, 0.5)');
    lipOn(g, a, MONO.y, b - a, '#D8D4C8');
  });
  // The sign, bolted to the middle pillar: CLOSED FOR REPAIRS SINCE 1997 (and a sawhorse across the track's end)
  const sx = PILLARS[1] - 62;
  stamp(c, 'dmono-sign', sx - 6, MONO.y + 40, 152, 66, g => {
    box(g, sx + 50, MONO.y + 44, 40, 4, '#3A3A3A');
    sign(g, sx, MONO.y + 50, 140, 50, '#F8FAFC', '', INK, 6, '#B91C1C');
    text(g, 'MONORAIL', sx + 70, MONO.y + 64, '#1E3A8A', 8, 'center', null);
    text(g, 'CLOSED FOR REPAIRS', sx + 70, MONO.y + 78, '#B91C1C', 6, 'center', null);
    text(g, 'SINCE 1997', sx + 70, MONO.y + 90, '#1A0B06', 6, 'center', null);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The T. rex paddock: its gates (the arch over the way in, torches), the walls

const paddock = (c: Ctx, state: GameState, eye: Eye, f: number) => {
  // The arches over the gates (well back of them), their torches burning
  for (const [gx, words, line2, sub1, sub2] of [[PADDOCK_IN, 'TYRANNOSAURUS REX', 'FEEDING: 2PM, 4PM, WHENEVER', 'DO NOT TAP ON THE GLASS', '(THERE IS NO GLASS)'], [PADDOCK_OUT, 'THANK YOU FOR', 'NOT BEING EATEN', 'PLEASE COME AGAIN', '']] as const) {
    atDepth(c, eye, 0.82, () => {
      stamp(c, `dpad-arch-${gx}`, gx - 150, GY - 500, 320, 500, g => {
        for (const px of [gx - 130, gx + 110]) {
          slab(g, px, GY - 440, 40, 440, '#7A5A3A');
          for (let y = GY - 430; y < GY; y += 30) { box(g, px + 2, y, 36, 2, '#5A3E22'); box(g, px + 2, y + 2, 36, 1, '#9A7A54'); }
          slab(g, px - 6, GY - 452, 52, 16, '#5A3E22');
          box(g, px + 12, GY - 474, 16, 22, '#3A2A1A'); box(g, px + 8, GY - 478, 24, 6, '#5A3E22');
        }
        sign(g, gx - 120, GY - 430, 260, 46, '#5A3A1A', '', '#000', 8, '#3E2810');
        text(g, words, gx + 10, GY - 408, '#F2C23A', words.length > 14 ? 10 : 12, 'center', '#2A1A0A');
        text(g, line2, gx + 10, GY - 392, '#E8DCB8', 6, 'center', '#2A1A0A');
        for (const px of [gx - 50, gx + 70]) box(g, px, GY - 380, 2, 10, '#3A3A3A');
        sign(g, gx - 80, GY - 370, 180, sub2 ? 24 : 14, '#E8DCB8', '', '#5A1A0A', 6, '#3E2810');
        text(g, sub1, gx + 10, GY - 360, '#5A1A0A', 6, 'center', null);
        if (sub2) text(g, sub2, gx + 10, GY - 350, '#5A1A0A', 6, 'center', null);
      });
      // (the torches' flames: stepped, flickering)
      for (const px of [gx - 110, gx + 130]) {
        const fy = GY - 478, fl = Math.sin(f * 0.3 + px) * 2;
        steppedGlow(c, px, fy - 8, 30, '#FFA040', 0.25, 0.03, 4);
        c.fillStyle = '#E8541A'; c.beginPath(); c.moveTo(px - 8, fy); c.quadraticCurveTo(px - 6 + fl, fy - 18, px + fl, fy - 26); c.quadraticCurveTo(px + 6 + fl, fy - 14, px + 8, fy); c.closePath(); c.fill();
        c.fillStyle = '#FFC040'; c.beginPath(); c.moveTo(px - 4, fy); c.quadraticCurveTo(px - 3 + fl, fy - 10, px + fl * 0.5, fy - 16); c.quadraticCurveTo(px + 4, fy - 8, px + 4, fy); c.closePath(); c.fill();
      }
    });
  }
  // The gates' walls (the solids he hops): concrete pylons, steel bars, hazard striped, a lit top
  for (const gx of [PADDOCK_IN, PADDOCK_OUT]) {
    prism(c, eye, gx, PADDOCK_TOP, 20, GY, 0.82, CONC, {});
    stamp(c, `dpad-gate-${gx}`, gx - 4, PADDOCK_TOP - 4, 28, GY - PADDOCK_TOP + 4, g => {
      slab(g, gx, PADDOCK_TOP, 20, GY - PADDOCK_TOP, CONC);
      hazard(g, gx + 2, PADDOCK_TOP + 10, 16, 10);
      for (let y = PADDOCK_TOP + 30; y < GY; y += 26) { box(g, gx + 2, y, 16, 3, '#6A665C'); box(g, gx + 2, y, 16, 1, '#C8C4B8'); }
      lipOn(g, gx - 2, PADDOCK_TOP - 2, 24, '#D8D4C8');
    });
  }
  // Inside: the feeding platforms' decks (their posts are the rex's: rex.ts shakes them), a goat (rubber), on a chain
  for (const [x, y, w] of LEDGES) if (x > PADDOCK_IN && x + w < PADDOCK_OUT) platform(c, state, eye, x, y, w, f);
  const gx = D + 7350;
  stamp(c, 'dpad-goat', gx - 40, GY - 90, 80, 90, g => {
    pole(g, gx - 2, GY - 80, 5, 80, '#5A626C'); box(g, gx - 10, GY - 82, 20, 4, '#3A3A3A');
    for (let k = 0; k < 6; k++) box(g, gx + 2 + k * 3, GY - 76 + k * 6, 3, 3, '#8A929A');
    slab(g, gx + 14, GY - 44, 26, 14, '#F2F0EA'); box(g, gx + 34, GY - 52, 10, 10, '#F2F0EA'); box(g, gx + 38, GY - 49, 2, 2, INK);
    for (const lx of [gx + 16, gx + 34]) box(g, lx, GY - 30, 3, 14, '#E8E4DC');
    box(g, gx + 12, GY - 16, 32, 6, '#7A5A3A'); for (const wx of [gx + 15, gx + 37]) box(g, wx, GY - 12, 5, 5, '#2A2A2A');
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The last stretch: the trees, the last fence

const TREES: [number, number, number][] = [[D + 9065, GY - 140, 130], [D + 9325, GY - 245, 150], [D + 9585, GY - 140, 130], [D + 9970, GY - 180, 140]];
const trees = (c: Ctx, state: GameState, eye: Eye, f: number) => {
  // (each a big fake tree: a fiberglass trunk going up behind its platform, the canopy above (dark, well behind),
  // roots spreading at its foot, and on one, a patch of bark knocked off showing the steel inside)
  for (const [tx, , w] of TREES) {
    const r = 18 + w * 0.06;
    atDepth(c, eye, 0.94, () => {
      stamp(c, `dtree-${tx}`, tx - 120, GY - 520, 240, 520, g => {
        pole(g, tx - r, GY - 440, r * 2, 440, '#5A4430');
        for (let y = GY - 430; y < GY; y += 18) box(g, tx - r + 4 + (y % 36 ? 6 : 0), y, 6, 10, '#3E2E1E');
        for (const s of [-1, 1]) { g.fillStyle = '#4A3826'; g.beginPath(); g.moveTo(tx + s * r, GY - 40); g.quadraticCurveTo(tx + s * (r + 30), GY - 6, tx + s * (r + 46), GY); g.lineTo(tx + s * r * 0.4, GY); g.closePath(); g.fill(); }
        if (tx === TREES[1][0]) { box(g, tx - 6, GY - 120, 16, 22, '#7A828C'); box(g, tx - 4, GY - 118, 2, 18, '#A8B0BA'); for (let k = 0; k < 3; k++) box(g, tx - 6, GY - 114 + k * 6, 16, 1, '#4A525C'); }
        for (let i = 0; i < 9; i++) {
          const a = (i / 9) * Math.PI, cx = tx + Math.cos(a) * 90, cy = GY - 450 - Math.sin(a) * 50;
          pixelBlob(g, cx, cy, 46, 26, '#24401C'); pixelBlob(g, cx - 6, cy - 6, 30, 14, '#30522A');
        }
        // (boughs up into the canopy, dim: nothing to stand on)
        g.strokeStyle = '#3E2E1E'; g.lineWidth = 7;
        for (const s of [-1, 1]) { g.beginPath(); g.moveTo(tx + s * r * 0.5, GY - 380); g.quadraticCurveTo(tx + s * 50, GY - 410, tx + s * 90, GY - 450); g.stroke(); }
      });
    });
    // (a vine or two swaying off it)
    const sw = Math.sin(f * 0.03 + tx) * 4;
    const [vx, vy] = P(eye, tx + 30, GY - 400, 0.94);
    c.strokeStyle = '#3A6A2A'; c.lineWidth = 2; c.beginPath(); c.moveTo(vx, vy); c.quadraticCurveTo(vx + sw, vy + 80, vx + sw * 2, vy + 150); c.stroke();
  }
  void state;
};

const lastFence = (c: Ctx, state: GameState, eye: Eye) => {
  const x = LAST_FENCE, top = LAST_FENCE_TOP;
  // (chain-link going back from the front post, posts at depths)
  const deps = [1, 0.9, 0.8, 0.7];
  for (let i = 0; i < deps.length - 1; i++) {
    const a = P(eye, x + 10, top, deps[i]), b = P(eye, x + 10, top, deps[i + 1]), a2 = P(eye, x + 10, GY, deps[i]), b2 = P(eye, x + 10, GY, deps[i + 1]);
    quad(c, [a, b, b2, a2], 'rgba(120, 128, 136, 0.28)');
    seg(c, a, b, '#8A929A', 2);
    box(c, b[0] - 2, b[1], 4, b2[1] - b[1], '#6A727A');
  }
  prism(c, eye, x, top, 20, GY, 0.95, STEEL, {});
  stamp(c, 'dlast-fence', x - 120, top - 6, 146, GY - top + 6, g => {
    pole(g, x + 2, top, 16, GY - top, '#8A929A');
    slab(g, x - 2, top - 4, 24, 8, '#A8B0BA'); lipOn(g, x - 2, top - 4, 24, '#C8D0DA');
    // (STAFF ONLY, wired to the post, on the path's side, under the top)
    box(g, x - 6, top + 22, 8, 2, '#3A3A3A'); box(g, x - 6, top + 52, 8, 2, '#3A3A3A');
    sign(g, x - 112, top + 16, 104, 42, '#B91C1C', '', '#000', 6, '#3A3F48');
    text(g, 'STAFF ONLY', x - 60, top + 32, '#F8FAFC', 7, 'center', '#5A0A0A');
    text(g, 'BEYOND THIS', x - 60, top + 44, '#F8FAFC', 6, 'center', '#5A0A0A');
    text(g, 'POINT', x - 60, top + 53, '#F8FAFC', 6, 'center', '#5A0A0A');
  });
  void state;
};

// ---------------------------------------------------------------------------------------------------------------
// The temple, from behind: a huge stepped pyramid (fiberglass over a steel frame: the back's not for guests), its
// tiers' tops and ends going back, the seams, ladders, AC units, a cable run, the shrine on top a facade (its back
// braced with two-by-fours), a smokers' bench, the back door (kicked in: a hole, light from inside)

const inset = (TEMPLE_R - TEMPLE_L) / 2 / (TIERS + 2.2);
const tier = (i: number) => ({ a: TEMPLE_L + i * inset, b: TEMPLE_R - i * inset, y: GY - (i + 1) * TIER_H });
const temple = (c: Ctx, state: GameState, eye: Eye, f: number, look: DinoLook) => {
  // Each tier: its ends and its top (going back), then its face
  for (let i = 0; i < TIERS; i++) {
    const t = tier(i);
    prism(c, eye, t.a, t.y, t.b - t.a, t.y + TIER_H, 0.86, '#8A7A5A', {
      topCol: '#5A6440', shadow: i === 0,
      side: pt => { seg(c, pt(0, t.y + 30), pt(1, t.y + 30), 'rgba(40, 30, 20, 0.35)'); seg(c, pt(0.5, t.y), pt(0.5, t.y + TIER_H), 'rgba(40, 30, 20, 0.35)'); },
      top: pt => { for (let u = 0.1; u < 1; u += 0.12) { const [mx, my] = pt(u, 0.5); pixelBlob(c, mx, my, 10, 3, '#5A6A3A'); } },
    });
  }
  chunked(c, state, 'dtemple-back', TEMPLE_L - 20, TEMPLE_R + 20, GY - TIERS * TIER_H - 220, TIERS * TIER_H + 220, (g, a, b) => paintTemple(g, a, b));
  // The back door: shut (EMPLOYEES ONLY painted on it), or kicked in (dark in there, a light on, the door flying)
  const dx = TEMPLE_DOOR_X;
  if (look.doorKicked) {
    box(c, dx, GY - 90, 50, 90, '#0C0A09');
    steppedGlow(c, dx + 25, GY - 60, 34, '#FFD890', 0.22, 0.03, 4);
    box(c, dx + 4, GY - 4, 42, 4, 'rgba(255, 216, 144, 0.25)');
  } else stamp(c, 'dtemple-door', dx - 4, GY - 96, 58, 96, g => {
    slab(g, dx, GY - 90, 50, 90, '#6A4A2A'); box(g, dx + 6, GY - 84, 38, 36, '#5A3E22'); box(g, dx + 6, GY - 42, 38, 36, '#5A3E22');
    box(g, dx + 40, GY - 50, 6, 6, '#D8B040');
    text(g, 'EMPLOYEES', dx + 25, GY - 70, '#F2E2B0', 5, 'center', INK); text(g, 'ONLY', dx + 25, GY - 61, '#F2E2B0', 5, 'center', INK);
  });
  if (look.kick > 22) { c.save(); const k = look.kick - 22; c.translate(dx + 25 + k * 6, GY - 45 - k * 2 + k * k * 0.2); c.rotate(k * 0.25); slab(c, -25, -45, 50, 90, '#6A4A2A'); c.restore(); }
  // (a lamp over the door, a bulb in a cage, moths round it after dark)
  box(c, dx + 18, GY - 108, 14, 8, INK); box(c, dx + 20, GY - 106, 10, 5, '#FFE8A0');
  for (let i = 0; i < 3; i++) box(c, dx + 25 + Math.sin(f * 0.2 + i * 2) * 10, GY - 104 + Math.cos(f * 0.17 + i) * 8, 2, 2, '#E8E0D0');
};
const paintTemple = (g: Ctx, a: number, b: number) => {
  for (let i = 0; i < TIERS; i++) {
    const t = tier(i), x0t = Math.max(a - 4, t.a), x1t = Math.min(b + 4, t.b);
    if (x1t <= x0t) continue;
    const col = i % 2 ? '#8A7A5A' : '#968660', r = rampOf(col);
    box(g, t.a, t.y, t.b - t.a, TIER_H, col);
    box(g, t.a, t.y, t.b - t.a, 4, r[1]); box(g, t.a, t.y + 4, t.b - t.a, 2, r[0]);
    box(g, t.a, t.y + TIER_H - 10, t.b - t.a, 10, r[1]); checker(g, t.a, t.y + TIER_H - 12, t.b - t.a, 2, r[1]);
    // (moss along the tier's edge, dimmed: these aren't ledges)
    for (let x = t.a + 6; x < t.b - 6; x += 26) pixelBlob(g, x + hash(x) * 10, t.y + 2, 8, 3, '#5A6A3A');
    // (the carved band: glyph blocks, molded; the panel seams with their bolts)
    for (let gx = t.a + 30; gx < t.b - 40; gx += 64) {
      box(g, gx, t.y + 26, 36, 40, r[1]); box(g, gx + 2, t.y + 28, 32, 2, r[0]);
      box(g, gx + 8, t.y + 36, 20, 20, r[3]); box(g, gx + 12, t.y + 40, 4, 4, r[0]); box(g, gx + 20, t.y + 40, 4, 4, r[0]); box(g, gx + 12, t.y + 50, 12, 2, r[0]);
    }
    for (let sx = t.a + 160; sx < t.b; sx += 160) { box(g, sx, t.y + 6, 2, TIER_H - 16, r[0]); box(g, sx + 2, t.y + 6, 1, TIER_H - 16, r[3]); for (let y = t.y + 14; y < t.y + TIER_H - 10; y += 20) box(g, sx - 3, y, 2, 2, '#C8C0B0'); }
    // (stenciled on, here and there: what the crew needs to know)
    if (i === 1) text(g, 'THIS SIDE AWAY FROM GUESTS', (t.a + t.b) / 2, t.y + 82, '#E8E0D0', 6, 'center', INK);
    if (i === 3) text(g, 'PANEL 4-C  DO NOT LEAN ON', t.a + 300, t.y + 82, '#E8E0D0', 5, 'center', INK);
  }
  const top = GY - TIERS * TIER_H, sx0 = TEMPLE_L + TIERS * inset, sx1 = TEMPLE_R - TIERS * inset, mid = (sx0 + sx1) / 2;
  // The shrine on top: a facade, its back braced with two-by-fours and sandbags, a spotlight rig
  slab(g, sx0 + 30, top - 150, sx1 - sx0 - 60, 150, '#7A6A4A');
  for (let x = sx0 + 40; x < sx1 - 40; x += 32) { box(g, x, top - 146, 4, 146, '#B8A070'); }
  g.strokeStyle = '#B8A070'; g.lineWidth = 4;
  for (let x = sx0 + 40; x < sx1 - 80; x += 64) { g.beginPath(); g.moveTo(x, top - 140); g.lineTo(x + 60, top - 4); g.stroke(); }
  box(g, sx0 + 30, top - 80, sx1 - sx0 - 60, 4, '#B8A070');
  for (let k = 0; k < 4; k++) slab(g, sx0 + 50 + k * 26, top - 14, 24, 14, '#C8B080');
  slab(g, sx0 + 20, top - 168, sx1 - sx0 - 40, 20, '#968660');
  // (THIS SIDE UP, upside down: somebody hung a panel wrong)
  g.save(); g.translate(mid, top - 110); g.rotate(Math.PI); text(g, 'THIS SIDE UP', 0, 0, '#3A2A1A', 6, 'center', null); g.restore();
  pole(g, mid + 60, top - 220, 4, 70, '#3A3A3A'); slab(g, mid + 52, top - 230, 22, 14, '#2A2A2A'); box(g, mid + 56, top - 226, 14, 6, '#E8E0C0');
  // A ladder up its back, tier by tier; a cable run; AC units on a tier; a breaker box; the smokers' bench by the door
  for (let i = 0; i < TIERS; i++) { const t = tier(i), lx = t.a + 120; box(g, lx, t.y, 3, TIER_H, '#5A5A5A'); box(g, lx + 18, t.y, 3, TIER_H, '#5A5A5A'); for (let y = t.y + 6; y < t.y + TIER_H; y += 12) box(g, lx, y, 21, 2, '#7A7A7A'); }
  for (let i = 0; i < TIERS - 1; i++) { const t = tier(i); box(g, t.b - 90, t.y, 6, TIER_H, '#2A2A2A'); box(g, t.b - 89, t.y, 1, TIER_H, '#5A5A5A'); }
  for (const [ti, ax] of [[3, 120], [3, 220], [5, 80]] as const) {
    const t = tier(ti), x = t.a + ax + 200;
    slab(g, x, t.y - 46, 80, 46, '#A8ACB0'); box(g, x + 6, t.y - 40, 50, 34, '#6A6E72');
    for (let k = 0; k < 6; k++) box(g, x + 8 + k * 8, t.y - 38, 4, 30, '#4A4E52');
    g.fillStyle = '#3A3E42'; g.beginPath(); g.arc(x + 66, t.y - 23, 9, 0, Math.PI * 2); g.fill();
  }
  const t0 = tier(0);
  slab(g, TEMPLE_DOOR_X + 80, GY - 70, 40, 52, '#7A8288'); box(g, TEMPLE_DOOR_X + 84, GY - 64, 32, 6, '#E8C040'); text(g, 'DANGER', TEMPLE_DOOR_X + 100, GY - 46, '#E8E0D0', 5, 'center', INK);
  const bx = TEMPLE_DOOR_X - 150;
  slab(g, bx, GY - 22, 70, 6, '#6A4A2A'); box(g, bx + 6, GY - 16, 4, 16, '#3A3A3A'); box(g, bx + 60, GY - 16, 4, 16, '#3A3A3A');
  slab(g, bx + 80, GY - 24, 18, 24, '#8A8A8A'); for (let k = 0; k < 5; k++) box(g, bx + 82 + k * 3, GY - 28 - (k % 2) * 2, 2, 5, '#F4F0E8');
  pole(g, bx - 20, GY - 90, 4, 90, '#5A5A5A');
  sign(g, bx - 46, GY - 104, 56, 22, '#F8FAFC', '', INK, 5, '#3A3F48');
  text(g, 'SMOKING', bx - 18, GY - 95, '#1A0B06', 5, 'center', null); text(g, 'AREA', bx - 18, GY - 87, '#1A0B06', 5, 'center', null);
  void t0;
};

// ---------------------------------------------------------------------------------------------------------------
// After dark: the park's lamps (world space)

export const dinoLamps = (state: GameState) => {
  const eye = eyeOf(state);
  const at = (x: number, y: number, d: number) => { const [px, py] = P(eye, x, y, d); return { x: px, y: py }; };
  return [
    { x: BOOTH.win.x + 32, y: BOOTH.win.y + 10, r: 60, a: 0.5, color: '#FFE8B0' },
    { x: FENCE_X + 10, y: FENCE_TOP - 8, r: 70, a: 0.7, color: '#FF5050' },
    { ...at(CRATER.x, coneTop(CRATER.x) - 20, 0.86), r: 320, a: 0.9, color: '#FF8A2A' },
    { x: SHOP.x + 90, y: GY - 70, r: 140, a: 0.7, color: '#FFE0A0' }, { x: SHOP.x + 310, y: GY - 70, r: 140, a: 0.7, color: '#FFE0A0' },
    ...[PADDOCK_IN - 110, PADDOCK_IN + 130, PADDOCK_OUT - 110, PADDOCK_OUT + 130].map(x => ({ ...at(x, GY - 486, 0.82), r: 200, a: 0.85, color: '#FFA040' })),
    { x: TEMPLE_DOOR_X + 25, y: GY - 104, r: 150, a: 0.8, color: '#FFE0A0' },
    ...Array.from({ length: 7 }, (_, i) => ({ ...at(D + 3860 + i * 300, GY - 156, 0.76), r: 110, a: 0.6, color: '#FFE8B0' })),
  ];
};

void dark; void mix; void PIX; void ball; void (null as unknown as Pt);
