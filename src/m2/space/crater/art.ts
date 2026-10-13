// The crater section, drawn (crude first pass: flat colors in a couple of steps, inked where it stands out, but every
// piece readable for what it is). Still things are stamped (painted once, put down with one drawImage) and culled by
// where they are on screen; only what moves (smoke, fire, the dioramas' loops) is drawn live.
//
// Outdoors, the impact site: the time of day's sky, Futureland far off (the giant atom, Space Needle 2 going up and
// up), the crash's smoke column; the furrow the saucer plowed, the bowl, the wreck; the dead all over; the lawns and
// the pastel walks; the churro cart, the monorail pylon, a burning chunk of hull; XENOSCARE's front (a giant fiberglass
// ship's hull, LEGALLY DISTINCT, its boarding hatch the runners' way in).
// Indoors, XENOSCARE: a haunted spaceship (the park's legally distinct derelict): the boarding queue, the pre-show's
// teleporter, the bridge, the specimen bay, the engine room, the corridor aft to the hold (the queen's chamber); the
// cheap showing through everywhere (cardboard, tape, fog, blacklight, speakers in plain sight).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { stamp } from '../../../m1/game/render/stamp';
import { INK, ink, limb, dark, lite } from '../../../m1/game/render/npc/kit';
import { drawTodSky, farTint } from '../../timeOfDay';
import { box, label } from '../section';
import { GY } from '../geometry';
import { ALIEN } from '../../../m1/game/scenes/alienLook';
import { drawCorpse, slimePool, drawAlienRaw, type CorpseKind } from './aliens';
import {
  D, x0, x1, BOWL, WRECK_X, CART, PYLON, CHUNK_X, FACADE_X, HOUSE_DOOR, MOUTH_X, QUEUE_END, PRESHOW, HALLS, CATWALKS, CRATES, CEIL, TRAMS,
} from './layout';

type Ctx = CanvasRenderingContext2D;

const view = (state: GameState) => state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
/** On screen (world x from a to b, with a margin). */
export const shown = (state: GameState, a: number, b: number, pad = 60) => { const v = view(state); return b > v.x - pad && a < v.x + v.w + pad; };
/** A string's hash (for the scatter). */
const hash = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };

/** The floor's height at x (the bowl dips). */
export const floorAt = (x: number) => {
  const { a, b, c, d, deep } = BOWL;
  if (x <= a || x >= d) return GY;
  if (x < b) return GY + deep * ((x - a) / (b - a));
  if (x > c) return GY + deep * (1 - (x - c) / (d - c));
  return GY + deep;
};

// ---------------------------------------------------------------------------------------------------------------
// Outdoors: the sky and Futureland far off (screen space)

const SKY = ['#1D4ED8', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#E0F2FE'];
export const drawImpactBackdrop = (c: Ctx, state: GameState) => {
  drawTodSky(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, SKY, { horizon: 430, sun: [600, 110], moon: [140, 90], t: state.frame, scroll: state.camera.x * 0.02 });
  const cam = state.camera.x - D;
  // (the far skyline: Futureland's googie roofs, the giant atom, Space Needle 2 going up out of the picture)
  const far = farTint('#7C83A8', 1), farD = farTint('#5B6286', 1), lit = farTint('#A5B4FC', 1);
  const px = (wx: number, k: number) => Math.round(wx - cam * k);
  c.fillStyle = far;
  for (let i = 0; i < 14; i++) { const x = px(i * 220 - 300, 0.12), h = 40 + hash(i) * 50; c.fillRect(x, 430 - h, 160, h + 10); c.fillRect(x + 20, 430 - h - 14, 120, 14); }
  // (Space Needle 2: a thin tower going up and up, its saucers stacked, the top out of sight)
  { const x = px(-120, 0.08); c.fillStyle = farD; c.fillRect(x - 6, -10, 12, 440); for (let k = 0; k < 4; k++) { c.fillRect(x - 40 + k * 4, 330 - k * 110, 80 - k * 8, 8); } c.fillStyle = lit; c.fillRect(x - 2, -10, 3, 440); }
  // (the giant atom, far back: its ball and its orbits)
  { const x = px(260, 0.1), y = 330; c.strokeStyle = farD; c.lineWidth = 4; for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(x, y, 70, 22, (k * Math.PI) / 3, 0, Math.PI * 2); c.stroke(); } c.fillStyle = lit; c.beginPath(); c.arc(x, y, 18, 0, Math.PI * 2); c.fill(); c.fillStyle = farD; c.fillRect(x - 4, y + 18, 8, 120); }
  // (nearer: trees and the park's fence line)
  c.fillStyle = farTint('#3F6B3A', 0.6);
  for (let i = 0; i < 26; i++) { const x = px(i * 140 - 200, 0.3), r = 30 + hash(i + 9) * 18; c.beginPath(); c.arc(x, 440 - r * 0.6, r, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = farTint('#2F5530', 0.5); c.fillRect(0, 440, CANVAS_WIDTH, 160);
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// Outdoors: the ground (world)

const LAWN = '#4D7C0F', LAWN_L = '#84CC16', DIRT = '#5B4636', DIRT_D = '#3F2E22', SCORCH = '#2A1F18', WALK = '#B4BCD0', WALK_L = '#E2E8F0';

const drawImpactGround = (c: Ctx, state: GameState) => {
  const v = view(state);
  const a = Math.max(x0 - 200, v.x - 40), b = Math.min(HOUSE_DOOR + 40, v.x + v.w + 40);
  if (b <= a) return;
  // (the lawn and the walk, in tiles of 400: stamped)
  for (let tx = Math.floor((a - D) / 400) * 400 + D; tx < b; tx += 400) {
    const i = Math.round((tx - D) / 400);
    stamp(c, `sp-cr-ground-${i}`, tx, GY - 12, 400, 420, g => paintGroundTile(g, tx, i));
  }
};
const paintGroundTile = (g: Ctx, tx: number, i: number) => {
  for (let x = tx; x < tx + 400; x += 4) {
    const y = floorAt(x + 2), inBowl = x > BOWL.a - 60 && x < BOWL.d + 60;
    // (the furrow: scorched dirt from where it came in to the bowl; the lawn either side of it; the walk past it)
    const furrow = x < BOWL.a && x > D - 200;
    const walk = x > BOWL.d + 300 && Math.floor((x - D) / 900) % 2 === 1;
    g.fillStyle = inBowl || furrow ? DIRT : walk ? WALK : LAWN; g.fillRect(x, y, 4, 420);
    g.fillStyle = inBowl ? DIRT_D : furrow ? SCORCH : walk ? '#94A3B8' : '#3F6212'; g.fillRect(x, y + 14, 4, 406);
    // (the lit top lip: standable)
    g.fillStyle = inBowl || furrow ? '#8B6B50' : walk ? WALK_L : LAWN_L; g.fillRect(x, y, 4, 3);
    if (walk && (x - D) % 64 < 4) { g.fillStyle = '#F472B6'; g.fillRect(x, y + 3, 2, 12); }
    if (!walk && !inBowl && !furrow && hash(x * 0.37) < 0.25) { g.fillStyle = '#65A30D'; g.fillRect(x + 1, y - 3, 1, 3); }
    if ((inBowl || furrow) && hash(x * 0.71) < 0.2) { g.fillStyle = '#271C14'; g.fillRect(x, y + 4 + hash(x) * 10, 3, 2); }
  }
  void i;
};

// ---------------------------------------------------------------------------------------------------------------
// The wreck: the saucer, nose down in the bowl, the dome cracked, plates torn back, a hatch hanging open with one of
// them hanging out of it upside down; under its rim, a pair of feet sticking out

const HULL = '#9CA3AF', HULL_D = '#6B7280', HULL_L = '#E5E7EB';
const drawWreck = (c: Ctx, state: GameState) => {
  if (!shown(state, WRECK_X - 420, WRECK_X + 420)) return;
  const floor = GY + BOWL.deep;
  stamp(c, 'sp-cr-wreck', WRECK_X - 360, floor - 200, 720, 230, g => {
    const cx = WRECK_X, cy = floor - 40;
    // (dirt banked up against it where it plowed in)
    g.fillStyle = DIRT; g.beginPath(); g.ellipse(cx - 260, floor, 90, 30, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#8B6B50'; g.fillRect(cx - 340, floor - 2, 160, 3);
    // (the hull: a big flat lens, tipped)
    g.save(); g.translate(cx, cy); g.rotate(-0.08);
    ink(g, () => g.ellipse(0, 0, 300, 46, 0, 0, Math.PI * 2), HULL, 2);
    g.fillStyle = HULL_L; g.fillRect(-280, -14, 560, 6);
    g.fillStyle = HULL_D; g.fillRect(-290, 10, 580, 12);
    // (the band of lights round its rim: most out, a couple flickering (live, over the stamp))
    for (let i = 0; i < 12; i++) { g.fillStyle = i % 4 === 1 ? '#FDE047' : '#3F3F46'; g.fillRect(-250 + i * 44, 0, 14, 6); }
    // (plates torn back, the guts showing: wires, a blown panel)
    g.fillStyle = '#18181B'; g.fillRect(90, -20, 70, 26);
    for (let i = 0; i < 6; i++) limb(g, 96 + i * 10, -16, 100 + i * 9 + (i % 2) * 6, 10 + (i % 3) * 6, 2, ['#EF4444', '#22C55E', '#3B82F6', '#FDE047'][i % 4]);
    ink(g, () => { g.moveTo(90, -20); g.lineTo(140, -48); g.lineTo(162, -20); g.closePath(); }, HULL_D);
    // (the dome: cracked, a hole punched through it, the dark inside)
    ink(g, () => g.ellipse(-20, -40, 84, 60, 0, Math.PI, 0), 'rgba(147, 197, 253, 0.55)', 2);
    g.fillStyle = 'rgba(15, 23, 42, 0.75)'; g.beginPath(); g.ellipse(10, -46, 30, 22, 0.3, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#E0F2FE'; g.lineWidth = 1.5;
    for (let i = 0; i < 7; i++) { const a = -0.2 - i * 0.45; g.beginPath(); g.moveTo(10, -46); g.lineTo(10 + Math.cos(a) * 70, -46 + Math.sin(a) * 40); g.stroke(); }
    g.fillStyle = 'rgba(255, 255, 255, 0.5)'; g.fillRect(-80, -70, 30, 4);
    // (a bent antenna off the top, and one of them on it (impaled: drawn after, standing))
    // (the hatch hanging open underneath, one of them hanging out of it upside down)
    ink(g, () => g.roundRect(-170, 14, 60, 34, 4), '#27272A');
    g.save(); g.translate(-140, 48); g.rotate(Math.PI); g.scale(0.8, 0.8); g.beginPath(); g.rect(-60, -40, 120, 140); g.clip(); g.translate(0, 90); drawAlienRaw(g, { seed: 41, gun: true }, 'dead'); g.restore();
    g.restore();
    // (under the rim: a pair of three-toed feet sticking out, toes up)
    for (const fx of [cx + 210, cx + 232]) { ink(g, () => g.roundRect(fx, floor - 14, 9, 14, 3), ALIEN.hide[5]); for (let t = 0; t < 3; t++) { g.fillStyle = INK; g.fillRect(fx + t * 3, floor - 17, 2, 3); } }
    slimePool(g, cx + 222, floor, 40);
    // (YT-7 on the hull: whatever it said, it's theirs)
    g.fillStyle = '#4B5563'; g.font = '10px "Press Start 2P"'; g.fillText('ZRB-2', cx - 230, cy + 6);
  });
  // Live: the lights flickering, the smoke, the fire in the torn plates
  const f = state.frame;
  if (f % 30 < 18) box(c, WRECK_X - 250 + 44 * 5, GY + BOWL.deep - 40 + 18, 14, 6, '#FDE047');
  if (f % 46 < 10) box(c, WRECK_X - 250 + 44 * 9, GY + BOWL.deep - 40 + 22, 14, 6, '#F87171');
  fireAt(c, WRECK_X + 130, GY + BOWL.deep - 66, 40, f);
};

/** Fire licking up off a line from x - w/2 to x + w/2 at y (live). */
export const fireAt = (c: Ctx, x: number, y: number, w: number, f: number) => {
  const n = Math.max(3, Math.round(w / 8));
  for (let i = 0; i < n; i++) {
    const fx = x - w / 2 + (i + 0.5) * (w / n), h = 10 + 14 * Math.abs(Math.sin(f * 0.23 + i * 1.7)) + (i % 2 ? 6 : 0);
    box(c, fx - 4, y - h - 1, 8, h + 2, INK);
    box(c, fx - 3, y - h, 6, h, i % 2 ? '#DC2626' : '#F97316');
    box(c, fx - 1, y - h * 0.65, 3, h * 0.65, '#FDE047');
  }
};

/** The smoke going up off the wreck and the burning chunk (live: puffs rising, swelling, fading; world). */
const drawSmoke = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const [sx, sy, n] of [[WRECK_X + 120, GY - 30, 14], [CHUNK_X, GY - 30, 8]] as const) {
    if (!shown(state, sx - 300, sx + 300)) continue;
    for (let i = 0; i < n; i++) {
      const k = ((f * 0.6 + i * (500 / n)) % 500) / 500;
      const x = sx + Math.sin(k * 6 + i) * 20 + k * 120, y = sy - k * 520, r = 10 + k * 46;
      c.fillStyle = `rgba(${Math.round(60 + 40 * k)}, ${Math.round(58 + 40 * k)}, ${Math.round(56 + 40 * k)}, ${(0.55 * (1 - k)).toFixed(2)})`;
      c.beginPath(); c.ellipse(Math.round(x), Math.round(y), Math.round(r), Math.round(r * 0.8), 0, 0, Math.PI * 2); c.fill();
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The dead, strewn about the site (and a few further out, thinning)

const CORPSES: [number, CorpseKind, number][] = [
  [D + 420, 'flat', 3], [D + 640, 'halves', 7], [D + 1060, 'splat', 12], [D + 1250, 'impaled', 5], [D + 1820, 'heap', 9],
  [D + 2060, 'seat', 14], [D + 2420, 'headfirst', 21], [D + 2740, 'flat', 18], [D + 3290, 'wrapped', 26], [D + 3820, 'splat', 30],
  [D + 4020, 'halves', 33], [D + 4660, 'headfirst', 38],
];
const drawCorpses = (c: Ctx, state: GameState) => {
  for (const [x, kind, seed] of CORPSES) {
    if (!shown(state, x - 160, x + 160)) continue;
    c.save(); c.translate(x, floorAt(x)); drawCorpse(c, kind, seed); c.restore();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The park's things: the churro cart (crushed, one of them under it), the monorail pylon (toppled: stand on it), the
// burning chunk of hull, a lamp or two, the signs

const drawProps = (c: Ctx, state: GameState) => {
  if (shown(state, CART.x - 60, CART.x + CART.w + 60)) stamp(c, 'sp-cr-cart', CART.x - 40, GY - CART.h - 70, CART.w + 80, CART.h + 74, g => {
    const x = CART.x, top = GY - CART.h;
    ink(g, () => g.roundRect(x, top + 6, CART.w, CART.h - 6, 3), '#F9A8D4', 1.5);
    g.fillStyle = '#EC4899'; g.fillRect(x + 2, top + 20, CART.w - 4, 8);
    g.fillStyle = '#FFFFFF'; g.font = '7px "Press Start 2P"'; g.fillText('COSMIC', x + 8, top + 42); g.fillText('CHURROS', x + 6, top + 52);
    // (the lit top lip: stand on it)
    g.fillStyle = '#FBCFE8'; g.fillRect(x, top + 6, CART.w, 3);
    // (the umbrella, snapped, hanging off it; churros everywhere)
    limb(g, x + 70, top + 6, x + 96, top - 40, 3, '#A1A1AA');
    ink(g, () => { g.moveTo(x + 80, top - 60); g.lineTo(x + 130, top - 30); g.lineTo(x + 100, top - 10); g.closePath(); }, '#38BDF8');
    for (let i = 0; i < 7; i++) limb(g, x - 30 + i * 22, GY - 3, x - 18 + i * 22, GY - 6 - (i % 2) * 3, 4, '#D97706');
    // (one of them under it: an arm and the gun sticking out)
    limb(g, x + 4, GY - 6, x - 24, GY - 4, 9, ALIEN.hide[5]);
    limb(g, x - 10, GY - 10, x - 34, GY - 10, 5, ALIEN.steel[3]);
    slimePool(g, x - 10, GY, 40);
  });
  if (shown(state, PYLON.x - 80, PYLON.x + PYLON.w + 80)) stamp(c, 'sp-cr-pylon', PYLON.x - 70, PYLON.y - 70, PYLON.w + 140, GY - PYLON.y + 74, g => {
    // (the monorail pylon, knocked over by the crash: its column lying across the walk, the beam on top of it bent; its
    // flat top (the beam's) is what's stood on)
    const { x, y, w } = PYLON;
    ink(g, () => { g.moveTo(x - 50, GY); g.lineTo(x + 30, y + 16); g.lineTo(x + 54, y + 16); g.lineTo(x - 20, GY); g.closePath(); }, '#CBD5E1', 1.5);
    ink(g, () => g.roundRect(x, y, w, 18, 3), '#94A3B8', 1.5);
    g.fillStyle = '#E2E8F0'; g.fillRect(x, y, w, 3);
    for (let i = 0; i < 6; i++) { g.fillStyle = '#64748B'; g.fillRect(x + 20 + i * 56, y + 8, 30, 4); }
    ink(g, () => g.roundRect(x + w - 30, y + 18, 20, GY - y - 18, 2), '#94A3B8');
    g.fillStyle = '#F472B6'; g.fillRect(x + 60, y + 14, w - 120, 3);
    // (a monorail car's nose, crumpled, poking in from the end)
    ink(g, () => g.ellipse(x + w + 30, y - 10, 46, 28, -0.4, 0, Math.PI * 2), '#F1F5F9', 1.5);
    g.fillStyle = '#0EA5E9'; g.fillRect(x + w + 14, y - 26, 34, 10);
  });
  if (shown(state, CHUNK_X - 100, CHUNK_X + 100)) {
    stamp(c, 'sp-cr-chunk', CHUNK_X - 90, GY - 70, 180, 74, g => {
      ink(g, () => { g.moveTo(CHUNK_X - 80, GY); g.lineTo(CHUNK_X - 50, GY - 50); g.lineTo(CHUNK_X + 40, GY - 62); g.lineTo(CHUNK_X + 80, GY); g.closePath(); }, HULL_D, 1.5);
      g.fillStyle = HULL_L; g.fillRect(CHUNK_X - 44, GY - 50, 70, 4);
      g.fillStyle = SCORCH; g.beginPath(); g.ellipse(CHUNK_X, GY, 110, 8, 0, 0, Math.PI * 2); g.fill();
    });
    fireAt(c, CHUNK_X - 6, GY - 54, 70, state.frame);
  }
  // (Futureland's signs: a pole sign at the start, a lamp post or two)
  if (shown(state, D + 280, D + 420)) stamp(c, 'sp-cr-sign', D + 260, GY - 150, 180, 154, g => {
    limb(g, D + 300, GY, D + 300, GY - 96, 5, '#64748B');
    ink(g, () => g.roundRect(D + 268, GY - 146, 150, 50, 6), '#1E1B4B', 1.5);
    g.fillStyle = '#F472B6'; g.font = '8px "Press Start 2P"'; g.fillText('TOMORROW PLAZA', D + 280, GY - 124);
    g.fillStyle = '#A5B4FC'; g.fillText('PICNIC AREA', D + 288, GY - 108);
  });
  for (const lx of [D + 2300, D + 4880]) if (shown(state, lx - 40, lx + 40)) stamp(c, `sp-cr-lamp-${lx}`, lx - 30, GY - 170, 60, 174, g => {
    limb(g, lx, GY, lx, GY - 150, 4, '#64748B');
    ink(g, () => g.ellipse(lx, GY - 156, 14, 8, 0, 0, Math.PI * 2), '#F9A8D4');
    ink(g, () => g.ellipse(lx, GY - 166, 6, 6, 0, 0, Math.PI * 2), '#FDF2F8');
  });
};

// ---------------------------------------------------------------------------------------------------------------
// XENOSCARE's front: the fiberglass hull of a crashed alien ship (a derelict, ribbed, bone-gray, very much like one
// from the movies and, the signs insist, LEGALLY DISTINCT), stenciled M.S. COINCIDENCE; its boarding hatch with the
// ramp down (the runners go in there); a cheap green alien statue up on it waving; the neon name; the height sign. The
// queue's way in is at its end (the building's corner).

const BONE = '#A8A29E', BONE_D = '#78716C', BONE_L = '#D6D3D1';
const drawFacade = (c: Ctx, state: GameState) => {
  if (!shown(state, FACADE_X - 360, HOUSE_DOOR + 100)) return;
  const cx = MOUTH_X, bl = HOUSE_DOOR - 380;
  stamp(c, 'sp-cr-facade2', bl - 160, GY - 600, HOUSE_DOOR - bl + 180, 604, g => {
    // (the building behind it: a black box, a starfield painted on it)
    g.fillStyle = '#0F0A1E'; g.fillRect(bl, GY - 470, HOUSE_DOOR - bl, 470);
    for (let i = 0; i < 50; i++) { g.fillStyle = i % 3 ? '#C4B5FD' : '#FFFFFF'; g.fillRect(bl + 10 + hash(i) * (HOUSE_DOOR - bl - 20), GY - 460 + hash(i + 50) * 440, 2, 2); }
    // (the hull: a great curved fiberglass shell, tipped, ribbed, jutting out of a fake rock berm)
    ink(g, () => { g.moveTo(bl - 40, GY); g.quadraticCurveTo(bl - 30, GY - 400, cx + 40, GY - 440); g.quadraticCurveTo(HOUSE_DOOR + 10, GY - 420, HOUSE_DOOR - 10, GY); g.closePath(); }, BONE, 3);
    g.fillStyle = BONE_L; g.beginPath(); g.moveTo(bl - 10, GY - 120); g.quadraticCurveTo(bl, GY - 360, cx - 20, GY - 410); g.lineTo(cx - 30, GY - 380); g.quadraticCurveTo(bl + 30, GY - 330, bl + 20, GY - 120); g.fill();
    // (the ribs: curved bands over it, darker between)
    for (let i = 0; i < 9; i++) {
      const rx = bl + 10 + i * 40;
      g.strokeStyle = BONE_D; g.lineWidth = 6; g.beginPath(); g.moveTo(rx, GY); g.quadraticCurveTo(rx + 10, GY - 260 - i * 10, rx + 60, GY - 380 - (i % 3) * 10); g.stroke();
      g.strokeStyle = BONE_L; g.lineWidth = 2; g.beginPath(); g.moveTo(rx - 3, GY); g.quadraticCurveTo(rx + 7, GY - 260 - i * 10, rx + 57, GY - 380 - (i % 3) * 10); g.stroke();
    }
    // (the fiberglass's seams and a patch of the cheap: gaffer tape, a speaker bolted on in plain sight)
    g.fillStyle = BONE_D; g.fillRect(cx + 60, GY - 300, 3, 180);
    g.fillStyle = '#A1A1AA'; g.fillRect(cx + 100, GY - 250, 40, 9); g.fillRect(cx + 115, GY - 262, 9, 34);
    ink(g, () => g.rect(bl + 30, GY - 300, 26, 34), '#18181B'); g.fillStyle = '#3F3F46'; g.beginPath(); g.arc(bl + 43, GY - 283, 9, 0, Math.PI * 2); g.fill();
    // (portholes, a couple lit green)
    for (let i = 0; i < 3; i++) { ink(g, () => g.arc(cx - 90 + i * 70, GY - 330 + i * 12, 14, 0, Math.PI * 2), i === 1 ? '#4ADE80' : '#1C1917', 3); }
    // (the stencil)
    g.fillStyle = '#44403C'; g.font = '10px "Press Start 2P"'; g.fillText('M.S. COINCIDENCE', cx - 100, GY - 250);
    // (the boarding hatch: a dark oval, the ramp down out of it, its rails)
    ink(g, () => g.ellipse(cx, GY - 110, 60, 96, 0, 0, Math.PI * 2), '#0A0510', 3);
    g.fillStyle = '#1F1F23'; g.beginPath(); g.moveTo(cx - 52, GY - 40); g.lineTo(cx + 52, GY - 40); g.lineTo(cx + 80, GY); g.lineTo(cx - 80, GY); g.closePath(); g.fill();
    for (let i = 0; i < 4; i++) { g.fillStyle = '#FDE047'; g.fillRect(cx - 60 - i * 6, GY - 36 + i * 10, 120 + i * 12, 2); }
    // (the fog machine's fog rolling down the ramp, painted on: blacklight purple)
    g.fillStyle = 'rgba(167, 139, 250, 0.3)'; g.beginPath(); g.ellipse(cx, GY - 6, 110, 10, 0, 0, Math.PI * 2); g.fill();
    // (the cheap green on top, waving: a statue)
    // (the sign under the name: LEGALLY DISTINCT)
    ink(g, () => g.roundRect(cx - 120, GY - 520, 240, 30, 4), '#18181B', 2);
    g.fillStyle = '#FDE047'; g.font = '7px "Press Start 2P"'; g.fillText('A LEGALLY DISTINCT DERELICT', cx - 108, GY - 501);
    // (the height sign: YOU MUST BE THIS TALL TO BE ABDUCTED)
    const hx = bl - 100;
    limb(g, hx, GY, hx, GY - 110, 4, '#E5E7EB');
    ink(g, () => g.roundRect(hx - 50, GY - 170, 100, 64, 4), '#FDE047', 1.5);
    g.fillStyle = INK; g.font = '6px "Press Start 2P"';
    g.fillText('YOU MUST BE', hx - 40, GY - 152); g.fillText('THIS TALL', hx - 34, GY - 140); g.fillText('TO BE', hx - 18, GY - 128); g.fillText('ABDUCTED', hx - 30, GY - 116);
    limb(g, hx + 30, GY - 106, hx + 54, GY - 106, 4, '#E5E7EB');
  });
  const f = state.frame;
  drawCheapGreen(c, cx + 150, GY - 420, f, 0.9, 'wave');
  // (the neon over it, live: the letters stepping on, one tube dead, flickering)
  const word = 'XENOSCARE!', n = word.length, on = Math.floor(f / 6) % (n + 12);
  c.font = '22px "Press Start 2P"'; c.textAlign = 'left';
  const w = c.measureText(word).width, sx = cx - w / 2, sy = GY - 548;
  box(c, sx - 14, sy - 30, w + 28, 40, '#0F0420');
  for (let i = 0; i < n; i++) {
    const lit = i <= on && !(i === 4 && f % 50 < 8);
    const x = sx + c.measureText(word.slice(0, i)).width;
    c.fillStyle = INK; c.fillText(word[i], x + 2, sy + 2);
    c.fillStyle = lit ? (i % 2 ? '#F472B6' : '#4ADE80') : '#3F3F46'; c.fillText(word[i], x, sy);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Indoors: the ship (bulkheads, ribs, pipes, grated decks; the cheap showing through: cardboard, tape, speakers in
// plain sight, fog, blacklight), tiled and stamped; each area its own color and its own show

const AREAS: Record<string, { a: string; b: string; trim: string; rib: string; lip: string }> = {
  queue: { a: '#1C1917', b: '#292524', trim: '#FDE047', rib: '#44403C', lip: '#A8A29E' },
  preshow: { a: '#0F172A', b: '#172036', trim: '#38BDF8', rib: '#334155', lip: '#64748B' },
  bridge: { a: '#0B1E2A', b: '#10293A', trim: '#2DD4BF', rib: '#1E3A4C', lip: '#5EEAD4' },
  specimen: { a: '#0A1F14', b: '#0F2A1C', trim: '#4ADE80', rib: '#1F3A2A', lip: '#86EFAC' },
  engine: { a: '#24120A', b: '#2E170C', trim: '#F97316', rib: '#4A2412', lip: '#FDBA74' },
  exit: { a: '#1A0B24', b: '#22102E', trim: '#C084FC', rib: '#3B1250', lip: '#D8B4FE' },
};
const areaAt = (x: number): keyof typeof AREAS => (x < QUEUE_END ? 'queue' : x < PRESHOW.r ? 'preshow' : x < HALLS.bridge.r ? 'bridge' : x < HALLS.specimen.r ? 'specimen' : x < HALLS.engine.r ? 'engine' : 'exit');

const drawWalls = (c: Ctx, state: GameState) => {
  const v = view(state);
  const a = Math.max(HOUSE_DOOR, v.x - 40), b = Math.min(x1 + 200, v.x + v.w + 40);
  if (b <= a) return;
  for (let tx = Math.floor((a - HOUSE_DOOR) / 400) * 400 + HOUSE_DOOR; tx < b; tx += 400) {
    const i = Math.round((tx - HOUSE_DOOR) / 400);
    stamp(c, `sp-hh-ship-${i}`, tx, CEIL - 120, 400, GY - CEIL + 540, g => paintWallTile(g, tx));
  }
};
const paintWallTile = (g: Ctx, tx: number) => {
  for (let x = tx; x < tx + 400; x += 8) {
    const w = AREAS[areaAt(x + 4)], col = x - HOUSE_DOOR;
    // (the bulkhead's plates in two steps, a rivet row along each seam)
    g.fillStyle = Math.floor(col / 80) % 2 ? w.a : w.b; g.fillRect(x, CEIL, 8, GY - CEIL);
    if (col % 80 < 8) { g.fillStyle = dark(w.a, 0.5); g.fillRect(x, CEIL, 2, GY - CEIL); }
    if (col % 16 < 8) { g.fillStyle = w.rib; g.fillRect(x + 3, GY - 300, 2, 2); g.fillRect(x + 3, GY - 180, 2, 2); }
    // (the pipes: two along the top, one at knee height; a hazard stripe along the bottom)
    g.fillStyle = '#3F3F46'; g.fillRect(x, CEIL + 12, 8, 10); g.fillStyle = '#71717A'; g.fillRect(x, CEIL + 12, 8, 2);
    g.fillStyle = dark(w.trim, 0.55); g.fillRect(x, CEIL + 28, 8, 6);
    g.fillStyle = '#27272A'; g.fillRect(x, GY - 64, 8, 8); g.fillStyle = '#52525B'; g.fillRect(x, GY - 64, 8, 2);
    g.fillStyle = Math.floor(col / 16) % 2 ? '#CA8A04' : '#18181B'; g.fillRect(x, GY - 14, 8, 14);
    // (the deck: grating, a lit lip)
    g.fillStyle = '#111114'; g.fillRect(x, GY, 8, 420);
    g.fillStyle = col % 16 < 8 ? '#1F1F23' : '#16161A'; g.fillRect(x, GY + 4, 8, 12);
    g.fillStyle = w.lip; g.fillRect(x, GY, 8, 3);
    // (the overhead: dark, a truss)
    g.fillStyle = '#09090B'; g.fillRect(x, CEIL - 120, 8, 120);
    if (col % 48 < 8) { g.fillStyle = '#27272A'; g.fillRect(x, CEIL - 20, 3, 20); }
  }
  // (the ribs: big curved frames up the walls every so often, the derelict's bones; cardboard, taped)
  for (let rx = Math.ceil((tx - HOUSE_DOOR) / 320) * 320 + HOUSE_DOOR + 140; rx < tx + 400; rx += 320) {
    const w = AREAS[areaAt(rx)];
    g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.moveTo(rx - 50, GY - 14); g.quadraticCurveTo(rx - 70, CEIL + 60, rx, CEIL + 30); g.stroke();
    g.strokeStyle = w.rib; g.lineWidth = 12; g.stroke();
    g.strokeStyle = lite(w.rib, 0.25); g.lineWidth = 3; g.beginPath(); g.moveTo(rx - 54, GY - 14); g.quadraticCurveTo(rx - 74, CEIL + 60, rx - 4, CEIL + 26); g.stroke();
    // (the tape over a split in the cardboard, a speaker bolted on in plain sight)
    g.fillStyle = '#A8A29E'; g.fillRect(rx - 72, GY - 260, 14, 30);
    ink(g, () => g.rect(rx + 20, GY - 330, 24, 30), '#18181B'); g.fillStyle = '#3F3F46'; g.beginPath(); g.arc(rx + 32, GY - 315, 8, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = '#3F3F46'; g.fillRect(tx, CEIL - 22, 400, 4);
};

/** Fog off the machines, rolling along the deck (live: drifting bands, blacklight purple). */
const drawFog = (c: Ctx, state: GameState) => {
  const v = view(state);
  if (v.x + v.w < HOUSE_DOOR) return;
  const f = state.frame;
  for (let i = 0; i < 6; i++) {
    const x = ((i * 260 + f * (0.3 + (i % 3) * 0.15)) % 1600) + Math.floor(v.x / 1600) * 1600 - 400;
    for (const ox of [0, 1600]) {
      const fx = x + ox;
      if (fx < HOUSE_DOOR - 200 || fx + 300 < v.x || fx > v.x + v.w) continue;
      c.fillStyle = 'rgba(167, 139, 250, 0.10)'; c.fillRect(Math.round(Math.max(HOUSE_DOOR, fx)), GY - 22 - (i % 2) * 8, 300, 22 + (i % 2) * 8);
      c.fillStyle = 'rgba(196, 181, 253, 0.07)'; c.fillRect(Math.round(Math.max(HOUSE_DOOR, fx + 40)), GY - 34 - (i % 3) * 6, 200, 14);
    }
  }
};

/** The areas' shows and their dressing (static parts stamped; the loops live). */
const drawShows = (c: Ctx, state: GameState) => {
  const f = state.frame;
  // The boarding queue: the posters, the rope rails, the wait-time sign
  if (shown(state, HOUSE_DOOR, QUEUE_END)) {
    stamp(c, 'sp-hh-queue2', HOUSE_DOOR, GY - 330, QUEUE_END - HOUSE_DOOR, 334, g => {
      const P: [string, string, string][] = [['THEY WANT', 'YOUR PLANET', '#DC2626'], ['IN SPACE NO ONE', 'HEARS YOU WHINE', '#1E3A8A'], ['THEY', 'PROBE!', '#7C3AED'], ['THE QUEEN', '(LEGALLY DISTINCT)', '#0A0A0A']];
      P.forEach(([l1, l2, col], i) => {
        const px = HOUSE_DOOR + 140 + i * 220, py = GY - 300;
        ink(g, () => g.rect(px, py, 130, 150), '#FEF3C7', 2);
        g.fillStyle = col; g.fillRect(px + 6, py + 6, 118, 96);
        if (i === 3) {
          // (her silhouette: the long crested head, the jaws; LEGALLY DISTINCT stamped over it)
          g.fillStyle = '#3F3F46'; g.beginPath(); g.ellipse(px + 70, py + 44, 46, 16, -0.4, 0, Math.PI * 2); g.fill();
          g.beginPath(); g.ellipse(px + 40, py + 70, 18, 26, 0, 0, Math.PI * 2); g.fill();
          g.fillStyle = '#E5E7EB'; for (let t = 0; t < 4; t++) g.fillRect(px + 22 + t * 6, py + 54, 3, 6);
          g.save(); g.translate(px + 64, py + 52); g.rotate(-0.3); g.strokeStyle = '#DC2626'; g.lineWidth = 2; g.strokeRect(-56, -9, 112, 18); g.fillStyle = '#DC2626'; g.font = '6px "Press Start 2P"'; g.fillText('LEGALLY DISTINCT', -50, 3); g.restore();
        } else {
          g.fillStyle = '#4ADE80'; g.beginPath(); g.ellipse(px + 44, py + 44, 22, 26, 0, 0, Math.PI * 2); g.fill();
          g.fillStyle = '#0A0A0A'; g.beginPath(); g.ellipse(px + 34, py + 44, 8, 5, 0.5, 0, Math.PI * 2); g.ellipse(px + 54, py + 44, 8, 5, -0.5, 0, Math.PI * 2); g.fill();
        }
        g.fillStyle = '#0A0A0A'; g.font = '6px "Press Start 2P"'; g.fillText(l1, px + 8, py + 120); g.fillText(l2, px + 8, py + 136);
      });
      for (let x = HOUSE_DOOR + 60; x < QUEUE_END - 40; x += 90) {
        limb(g, x, GY, x, GY - 52, 4, '#D4D4D8'); ink(g, () => g.arc(x, GY - 54, 4, 0, Math.PI * 2), '#FDE047');
        g.strokeStyle = '#DC2626'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, GY - 48); g.quadraticCurveTo(x + 45, GY - 30, x + 90, GY - 48); g.stroke();
      }
      ink(g, () => g.roundRect(HOUSE_DOOR + 60, GY - 120, 150, 44, 4), '#18181B', 2);
      g.fillStyle = '#FDE047'; g.font = '7px "Press Start 2P"'; g.fillText('WAIT FROM HERE', HOUSE_DOOR + 70, GY - 102); g.fillText('45 MINUTES', HOUSE_DOOR + 84, GY - 86);
    });
  }
  // The pre-show: the ship's teleporter (the tube in the middle, its rings; the host on a screen)
  if (shown(state, PRESHOW.l, PRESHOW.r)) {
    const tx = PRESHOW.tube;
    stamp(c, 'sp-hh-preshow2', PRESHOW.l, CEIL - 20, PRESHOW.r - PRESHOW.l, GY - CEIL + 24, g => {
      ink(g, () => g.ellipse(tx, GY - 6, 90, 14, 0, 0, Math.PI * 2), '#475569', 2);
      ink(g, () => g.ellipse(tx, CEIL + 40, 90, 14, 0, 0, Math.PI * 2), '#475569', 2);
      g.fillStyle = 'rgba(125, 211, 252, 0.12)'; g.fillRect(tx - 86, CEIL + 40, 172, GY - CEIL - 46);
      g.fillStyle = 'rgba(224, 242, 254, 0.35)'; g.fillRect(tx - 70, CEIL + 50, 6, GY - CEIL - 70); g.fillRect(tx + 50, CEIL + 50, 3, GY - CEIL - 70);
      ink(g, () => g.roundRect(tx - 130, CEIL + 60, 260, 32, 4), '#0F172A', 2);
      g.fillStyle = '#38BDF8'; g.font = '8px "Press Start 2P"'; g.fillText('TELEPORTER BAY B', tx - 100, CEIL + 82);
      ink(g, () => g.rect(PRESHOW.l + 120, GY - 330, 150, 100), '#0B1120', 3);
      g.fillStyle = '#1E3A8A'; g.fillRect(PRESHOW.l + 126, GY - 324, 138, 88);
      g.fillStyle = '#E5E7EB'; g.fillRect(PRESHOW.l + 180, GY - 296, 30, 60); g.fillStyle = '#F2C49B'; g.beginPath(); g.arc(PRESHOW.l + 195, GY - 306, 12, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#78350F'; g.fillRect(PRESHOW.l + 183, GY - 320, 24, 8);
    });
    for (let i = 0; i < 4; i++) { const ry = GY - 80 - i * 80, lit = Math.floor(f / 10) % 4 === i; box(c, tx - 88, ry, 176, 4, lit ? '#7DD3FC' : '#1E3A5F'); }
  }
  // THE BRIDGE: a cardboard viewscreen (Earth, saucers over it, painted), consoles blinking, the captain's chair with a
  // cheap green in it waving its gun, cardboard crew at their stations
  if (shown(state, HALLS.bridge.l, HALLS.bridge.r)) {
    const { l, r } = HALLS.bridge;
    stamp(c, 'sp-hh-bridge', l, GY - 340, r - l, 344, g => {
      ink(g, () => g.roundRect(l + 300, GY - 330, 700, 200, 8), '#57534E', 6);
      g.fillStyle = '#020617'; g.fillRect(l + 306, GY - 324, 688, 188);
      for (let i = 0; i < 40; i++) { g.fillStyle = '#E2E8F0'; g.fillRect(l + 310 + hash(i + 7) * 680, GY - 320 + hash(i + 70) * 180, 2, 2); }
      g.fillStyle = '#1D4ED8'; g.beginPath(); g.arc(l + 650, GY - 140, 110, Math.PI, 0); g.fill();
      g.fillStyle = '#16A34A'; g.beginPath(); g.ellipse(l + 620, GY - 190, 40, 24, 0.4, 0, Math.PI * 2); g.ellipse(l + 700, GY - 160, 30, 18, 0, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < 3; i++) { g.fillStyle = '#F97316'; g.beginPath(); g.arc(l + 580 + i * 60, GY - 150 - (i % 2) * 20, 8, 0, Math.PI * 2); g.fill(); }
      // (the cardboard's edge showing at the corner, a strip of tape)
      g.fillStyle = '#B45309'; g.fillRect(l + 980, GY - 330, 14, 30); g.fillStyle = '#A8A29E'; g.fillRect(l + 970, GY - 316, 30, 8);
      // (the consoles)
      for (let i = 0; i < 4; i++) { const cx2 = l + 140 + i * 360; ink(g, () => { g.moveTo(cx2, GY); g.lineTo(cx2, GY - 70); g.lineTo(cx2 + 120, GY - 90); g.lineTo(cx2 + 120, GY); g.closePath(); }, '#334155', 2); }
      // (the captain's chair)
      ink(g, () => g.roundRect(l + 650, GY - 110, 70, 110, 10), '#7F1D1D', 2);
      g.fillStyle = '#FFFFFF'; g.font = '10px "Press Start 2P"'; g.fillText('THE BRIDGE', l + 70, GY - 300);
      g.fillStyle = '#5EEAD4'; g.font = '6px "Press Start 2P"'; g.fillText('BRIDGE OF A LEGALLY DISTINCT SHIP', l + 40, GY - 284);
    });
    for (let i = 0; i < 4; i++) for (let k = 0; k < 5; k++) box(c, HALLS.bridge.l + 156 + i * 360 + k * 18, GY - 76 - k * 3, 8, 5, (f + k * 11 + i * 7) % 40 < 20 ? '#22D3EE' : '#F43F5E');
    drawCheapGreen(c, HALLS.bridge.l + 685, GY - 20, f, 0.8, 'wave');
  }
  // THE SPECIMEN BAY: stasis tubes (a cow in one, going up and down in its green beam; a farmer dummy in another),
  // a crate of eggs (DO NOT TOUCH: LEGALLY DISTINCT EGGS)
  if (shown(state, HALLS.specimen.l, HALLS.specimen.r)) {
    const { l, r } = HALLS.specimen;
    stamp(c, 'sp-hh-specimen', l, GY - 340, r - l, 344, g => {
      for (const tx of [l + 720, r - 260]) {
        ink(g, () => g.ellipse(tx, GY - 4, 70, 12, 0, 0, Math.PI * 2), '#3F3F46', 2);
        ink(g, () => g.ellipse(tx, GY - 300, 70, 12, 0, 0, Math.PI * 2), '#3F3F46', 2);
        g.fillStyle = 'rgba(74, 222, 128, 0.14)'; g.fillRect(tx - 66, GY - 300, 132, 296);
        g.fillStyle = 'rgba(220, 252, 231, 0.3)'; g.fillRect(tx - 54, GY - 290, 5, 260);
      }
      // (the farmer: a dummy in overalls, floating in his tube, mouth a painted O)
      const fx = r - 260; g.fillStyle = '#1D4ED8'; g.fillRect(fx - 10, GY - 170, 20, 44); g.fillStyle = '#F2C49B'; g.beginPath(); g.arc(fx, GY - 182, 10, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#FDE047'; g.fillRect(fx - 14, GY - 196, 28, 6); g.fillStyle = '#18181B'; g.fillRect(fx - 2, GY - 180, 4, 4);
      g.fillStyle = '#1E3A8A'; g.fillRect(fx - 9, GY - 126, 7, 30); g.fillRect(fx + 2, GY - 126, 7, 30);
      // (the eggs: leathery, split at the top, in a crate; its sign)
      for (let i = 0; i < 4; i++) { ink(g, () => g.ellipse(l + 250 + i * 34, GY - 24, 14, 22, 0, 0, Math.PI * 2), '#57534E', 1.5); g.fillStyle = '#292524'; g.fillRect(l + 244 + i * 34, GY - 46, 12, 4); }
      ink(g, () => g.roundRect(l + 200, GY - 120, 220, 40, 4), '#FDE047', 2);
      g.fillStyle = INK; g.font = '6px "Press Start 2P"'; g.fillText('DO NOT TOUCH THE EGGS', l + 210, GY - 102); g.fillText('(LEGALLY DISTINCT EGGS)', l + 206, GY - 90);
      g.fillStyle = '#FFFFFF'; g.font = '10px "Press Start 2P"'; g.fillText('SPECIMEN BAY', l + 500, GY - 320);
    });
    const tx = l + 720, cy = GY - 120 - (Math.sin(f * 0.02) * 0.5 + 0.5) * 120;
    drawCow(c, tx, cy, f);
  }
  // THE ENGINE ROOM: the reactor (a fiberglass core, glowing, pulsing), pipes into it, steam
  if (shown(state, HALLS.engine.l, HALLS.engine.r)) {
    const { l } = HALLS.engine, rx = l + 760;
    stamp(c, 'sp-hh-engine', l, GY - 360, HALLS.engine.r - l, 364, g => {
      ink(g, () => g.roundRect(rx - 90, GY - 340, 180, 340, 12), '#44403C', 3);
      for (let i = 0; i < 6; i++) { g.fillStyle = '#57534E'; g.fillRect(rx - 90, GY - 320 + i * 54, 180, 8); }
      for (const s of [-1, 1]) { limb(g, rx + s * 90, GY - 200, rx + s * 300, GY - 260, 18, '#52525B'); limb(g, rx + s * 90, GY - 120, rx + s * 260, GY - 60, 14, '#3F3F46'); }
      g.fillStyle = '#FFFFFF'; g.font = '10px "Press Start 2P"'; g.fillText('ENGINE ROOM', l + 120, GY - 320);
      g.fillStyle = '#FDBA74'; g.font = '6px "Press Start 2P"'; g.fillText('REACTOR: FIBERGLASS. DO NOT LICK.', l + 100, GY - 304);
    });
    const k = Math.sin(f * 0.08) * 0.5 + 0.5;
    box(c, rx - 30, GY - 300, 60, 260, `rgba(251, 146, 60, ${(0.35 + 0.4 * k).toFixed(2)})`);
    box(c, rx - 10, GY - 290, 20, 240, `rgba(254, 243, 199, ${(0.3 + 0.5 * k).toFixed(2)})`);
    for (let i = 0; i < 3; i++) { const u = ((f * 0.7 + i * 40) % 120) / 120; c.fillStyle = `rgba(214, 211, 209, ${(0.35 * (1 - u)).toFixed(2)})`; c.fillRect(Math.round(rx + 250 - 10 + u * 20), Math.round(GY - 270 - u * 80), Math.round(14 + u * 30), Math.round(14 + u * 20)); }
  }
  // The corridor aft to the hold: resin creeping over the bulkheads, the signs
  if (shown(state, HALLS.exit.l, HALLS.exit.r)) stamp(c, 'sp-hh-exit2', HALLS.exit.l, GY - 340, HALLS.exit.r - HALLS.exit.l, 344, g => {
    const l = HALLS.exit.l;
    for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(41, 37, 36, 0.8)'; g.beginPath(); g.ellipse(l + 200 + i * 40, GY - 260 + (i % 3) * 30, 30 + (i % 4) * 8, 60, 0.2 * (i % 3), 0, Math.PI * 2); g.fill(); }
    ink(g, () => g.roundRect(l + 100, GY - 320, 320, 56, 6), '#18181B', 2);
    g.fillStyle = '#FDE047'; g.font = '9px "Press Start 2P"'; g.fillText('THE HOLD: THE QUEEN', l + 120, GY - 296);
    g.fillStyle = '#D8B4FE'; g.font = '6px "Press Start 2P"'; g.fillText('(LEGALLY DISTINCT)', l + 190, GY - 280);
    for (let i = 0; i < 4; i++) { const ax = l + 160 + i * 140; ink(g, () => { g.moveTo(ax, GY - 200); g.lineTo(ax + 40, GY - 220); g.lineTo(ax, GY - 240); g.closePath(); }, '#F472B6'); }
    g.fillStyle = '#C4B5FD'; g.font = '7px "Press Start 2P"'; g.fillText('NO FLASH PHOTOGRAPHY', l + 140, GY - 160);
  });
  drawFog(c, state);
};

/** A fiberglass cow (in the beam, legs dangling). World. */
const drawCow = (c: Ctx, x: number, y: number, f: number) => {
  for (let i = 0; i < 4; i++) limb(c, x - 22 + i * 14, y + 12, x - 22 + i * 14 + Math.sin(f * 0.1 + i) * 3, y + 32, 5, '#F5F5F4');
  ink(c, () => c.ellipse(x, y, 34, 18, 0, 0, Math.PI * 2), '#F5F5F4', 1.5);
  box(c, x - 14, y - 10, 14, 10, '#18181B'); box(c, x + 10, y + 2, 12, 8, '#18181B');
  ink(c, () => c.ellipse(x + 36, y - 6, 12, 10, 0, 0, Math.PI * 2), '#F5F5F4');
  box(c, x + 42, y - 4, 6, 5, '#F9A8D4');
};

/**
 * One of the cheap animatronic greens: the stereotype (a huge bald head, enormous black eyes, antennae on springs, a
 * skinny body in a silver jumpsuit, a toy ray gun). Its feet at (x, y). `pose`: waving its gun; BOO (arms up, jaw
 * dropped); CLAW (taken over: arms out, claws hooked, jaw working); LIMP (let go: arms down, head lolled). `look.eyes`:
 * its eyes lit that color (taken over); `look.jerk`: the puppet's jerk (radians). World.
 */
export const drawCheapGreen = (c: Ctx, x: number, y: number, f: number, s = 1, pose: 'wave' | 'boo' | 'claw' | 'limp' = 'wave', look: { eyes?: string; jerk?: number } = {}) => {
  c.save(); c.translate(x, y); c.scale(s, s);
  const wob = Math.sin(f * 0.3) * (pose === 'boo' ? 0.12 : pose === 'limp' ? 0 : 0.05) + (look.jerk ?? 0);
  c.rotate(wob);
  box(c, -3, -20, 6, 20, '#52525B');
  ink(c, () => c.roundRect(-12, -70, 24, 50, 6), '#D4D4D8', 1.5);
  box(c, -12, -50, 24, 3, '#A1A1AA');
  if (pose === 'boo') { limb(c, -10, -64, -28, -100, 5, '#4ADE80'); limb(c, 10, -64, 28, -100, 5, '#4ADE80'); }
  else if (pose === 'claw') {
    const a = Math.sin(f * 0.5) * 6;
    limb(c, -10, -64, -30, -72 + a, 5, '#4ADE80'); limb(c, 10, -64, 34, -74 - a, 5, '#4ADE80');
    for (const [hx, hy] of [[-30, -72 + a], [34, -74 - a]]) for (let k = 0; k < 3; k++) limb(c, hx, hy, hx + (hx < 0 ? -8 : 8), hy - 6 + k * 6, 2, '#18181B');
  } else if (pose === 'limp') { limb(c, -10, -64, -14, -36, 5, '#4ADE80'); limb(c, 10, -64, 16, -34, 5, '#4ADE80'); }
  else { const a = Math.sin(f * 0.15) * 10; limb(c, -10, -64, -22, -40, 5, '#4ADE80'); limb(c, 10, -64, 30, -78 + a, 5, '#4ADE80'); box(c, 26, -86 + a, 14, 6, '#F43F5E'); box(c, 38, -84 + a, 4, 2, '#FDE047'); }
  c.save(); if (pose === 'limp') { c.translate(0, -84); c.rotate(0.5); c.translate(0, 84); }
  ink(c, () => c.ellipse(0, -100, 28, 32, 0, 0, Math.PI * 2), '#4ADE80', 1.5);
  c.fillStyle = '#86EFAC'; c.beginPath(); c.ellipse(-10, -114, 10, 10, 0, 0, Math.PI * 2); c.fill();
  for (const sx of [-1, 1]) {
    ink(c, () => c.ellipse(sx * 12, -100, 11, 6, sx * 0.5, 0, Math.PI * 2), look.eyes ?? '#0A0A0A');
    if (look.eyes) { box(c, sx * 12 - 3, -102, 6, 3, '#F7FEE7'); } else box(c, sx * 12 - 6, -104, 3, 2, '#FFFFFF');
  }
  if (pose === 'boo' || pose === 'claw') { box(c, -9, -84, 18, 10 + (f % 8 < 4 ? 4 : 0), '#0A0A0A'); box(c, -7, -82, 14, 2, pose === 'claw' ? '#84FF50' : '#F87171'); }
  else box(c, -6, -82, 12, 2, '#0A0A0A');
  for (const sx of [-1, 1]) { const tip = sx * (14 + Math.sin(f * 0.5 + sx) * (pose === 'limp' ? 1 : 6)); limb(c, sx * 8, -128, tip, -150, 2, '#16A34A'); ink(c, () => c.arc(tip, -152, 4, 0, Math.PI * 2), look.eyes ?? '#FDE047'); }
  c.restore();
  // (let go: smoking, a spark now and then)
  if (pose === 'limp' && f % 30 < 3) { box(c, 6, -120, 3, 3, '#FDE047'); box(c, -10, -60, 3, 3, '#FFFFFF'); }
  c.restore();
};

/** The catwalks (gantries) and the crates (the parts he stands on: lit top lips). */
const drawStandables = (c: Ctx, state: GameState) => {
  for (const [x, y, w] of CATWALKS) {
    if (!shown(state, x, x + w)) continue;
    stamp(c, `sp-hh-catwalk-${x}`, x - 4, y - 34, w + 8, GY - y + 38, g => {
      g.fillStyle = '#3F3F46'; g.fillRect(x, y, w, 12);
      g.fillStyle = '#A1A1AA'; g.fillRect(x, y, w, 3);
      for (let k = x + 8; k < x + w - 8; k += 12) { g.fillStyle = '#27272A'; g.fillRect(k, y + 5, 6, 5); }
      for (const lx of [x + 16, x + w - 22]) { g.fillStyle = '#27272A'; g.fillRect(lx, y + 12, 6, GY - y - 12); }
      g.fillStyle = '#52525B'; g.fillRect(x, y - 30, w, 3); for (let k = x; k <= x + w; k += 40) g.fillRect(k, y - 30, 3, 30);
    });
  }
  for (const [x, w, h] of CRATES) {
    if (!shown(state, x, x + w)) continue;
    stamp(c, `sp-hh-crate-${x}`, x - 2, GY - h - 2, w + 4, h + 4, g => {
      ink(g, () => g.rect(x, GY - h, w, h), '#92400E', 2);
      g.fillStyle = '#B45309'; g.fillRect(x + 4, GY - h + 4, w - 8, h - 8);
      limb(g, x + 6, GY - h + 6, x + w - 6, GY - 6, 3, '#78350F');
      g.fillStyle = '#FCD34D'; g.fillRect(x, GY - h, w, 3);
      g.fillStyle = '#18181B'; g.font = '6px "Press Start 2P"'; g.fillText('PROPS', x + w / 2 - 14, GY - h / 2);
    });
  }
};

/** The ride's track along the deck (where the trams run), the airlock doors they come out of and go into. */
const drawTrack = (c: Ctx, state: GameState) => {
  for (const [a, b] of TRAMS) {
    if (!shown(state, a - 120, b + 120)) continue;
    stamp(c, `sp-hh-track2-${a}`, a - 120, GY - 150, b - a + 240, 156, g => {
      g.fillStyle = '#52525B'; g.fillRect(a - 100, GY - 3, b - a + 200, 3);
      for (let x = a - 100; x < b + 100; x += 30) { g.fillStyle = '#3F3F46'; g.fillRect(x, GY - 2, 14, 2); }
      for (const tx of [a - 110, b + 20]) {
        ink(g, () => g.roundRect(tx, GY - 140, 90, 140, [30, 30, 0, 0]), '#0A0A0A', 3);
        g.strokeStyle = '#CA8A04'; g.lineWidth = 4; g.beginPath(); g.roundRect(tx - 6, GY - 146, 102, 146, [34, 34, 0, 0]); g.stroke();
        for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? 'rgba(148, 163, 184, 0.35)' : 'rgba(100, 116, 139, 0.35)'; g.fillRect(tx + 6 + i * 10, GY - 130, 8, 130); }
      }
    });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The lot, in order (world space, behind him)

export const drawCraterBack = (c: Ctx, state: GameState) => {
  drawSmoke(c, state);
  drawImpactGround(c, state);
  drawProps(c, state);
  drawWreck(c, state);
  drawCorpses(c, state);
  drawFacade(c, state);
  drawWalls(c, state);
  drawShows(c, state);
  drawTrack(c, state);
  drawStandables(c, state);
};

/** In front of him: the house's front wall edge (he walks in through the mouth: the jaw's near side over him). */
export const drawCraterFront = (c: Ctx, state: GameState) => {
  if (!shown(state, HOUSE_DOOR - 200, HOUSE_DOOR + 100)) return;
  // (the building's corner, the queue's way in: a lintel over him with its sign, a jamb either side)
  const x = HOUSE_DOOR;
  box(c, x - 10, CEIL - 130, 40, GY - 160 - CEIL + 130, '#2E1065');
  box(c, x - 10, CEIL - 130, 3, GY - 160 - CEIL + 130, '#6D28D9');
  box(c, x - 10, GY - 160, 40, 10, '#4C1D95');
  box(c, x - 10, GY - 150, 8, 150, '#4C1D95');
  box(c, x + 22, GY - 150, 8, 150, '#4C1D95');
  label(c, 'QUEUE', x + 10, GY - 176, '#FDE047', 7);
  void lite;
};
