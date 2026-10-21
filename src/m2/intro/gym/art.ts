// The Iron Pit, drawn (Meathead 2's opening stage): Meathead 1's gym, its own walls and things (m1 stages/gym/draw:
// the two-tone cinderblock gone yellow under the tubes, the drop ceiling, the mirrors, the posters, the treadmills, the
// benches, the plyo boxes), the length of it this time, the morning light through the windows; and what's new: the
// TV up on the wall, the duct down off the ceiling, the tall storage shelves, the mezzanine, his souvenirs from
// Meathead 1 all over the place (hung, on little shelves, on the floor), Meathead 1's ring (the posts rusting, the
// ropes sagging, MEATHEAD'S GYM on its apron with a letter gone), and the way out: EXIT, the arrow pointing on.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { drawWallStill, drawTubeLights, drawProp, drawLedge, propSpan, steel, signText, floorShadow } from '../../../m1/game/stages/gym/draw';
import type { Prop } from '../../../m1/game/stages/gym/course';
import { stamp } from '../../../m1/game/render/stamp';
import { bandedGradient, checker, steppedGlow } from '../../../m1/game/render/pixelArt';
import { INK, ink, shaded, shadedTop, dark, lite } from '../../../m1/game/render/npc/kit';
import { drawSouvenir } from '../../../m1/game/garage/draw';
import { newsPicture } from './shots';
import { X0, Y, LEFT, RIGHT, CEIL_Y, LEDGES, DUCT, MEZZ, MEZZ_Y, RING, EXIT_X, SOUVENIR_SPOTS, WALL_SHELVES, SQUAT_X, TRUCK_X, FRONT_DOOR_X } from './course';

type Ctx = CanvasRenderingContext2D;
const R = (x: number) => X0 + x;
const inView = (s: GameState, a: number, b: number) => b > s.camera.x - 60 && a < s.camera.x + CANVAS_WIDTH + 60;

/** Meathead 1's gym things along the back wall (its own props, drawn its own way). */
const PROPS: Prop[] = [
  { look: 'mirror', x: R(420), y: Y - 250 }, { look: 'poster', x: R(160), y: Y - 340, text: 'LEG DAY EVERY DAY' },
  { look: 'window', x: R(780), y: Y - 360 }, { look: 'dumbbells', x: R(600), y: Y }, { look: 'poster', x: R(1000), y: Y - 340, text: 'NO PAIN NO GAIN' },
  { look: 'treadmill', x: R(1380), y: Y }, { look: 'bike', x: R(1500), y: Y }, { look: 'treadmill', x: R(1640), y: Y }, { look: 'window', x: R(1540), y: Y - 360 },
  { look: 'poster', x: R(1220), y: Y - 340, text: 'SWEAT IS FAT CRYING' },
  { look: 'fountain', x: R(2640), y: Y }, { look: 'poster', x: R(2440), y: Y - 360, text: 'STAY LOW' },
  { look: 'window', x: R(2980), y: Y - 360 },{ look: 'poster', x: R(3250), y: Y - 340, text: 'LIFT HEAVY' },
  { look: 'bag', x: R(4020), y: Y }, { look: 'poster', x: R(4190), y: Y - 340, text: 'WIPE DOWN YOUR BENCH' },
  { look: 'mirror', x: R(4330), y: Y - 250 }, { look: 'window', x: R(4880), y: Y - 360 }, { look: 'bench', x: R(4680), y: Y },
];

/** Behind the lot: the dark of the room. */
export const drawGymBackdrop = (c: Ctx) => { c.fillStyle = '#0E0A08'; c.fillRect(0, 0, CANVAS_WIDTH, 600); };

const CHUNK = 256;
export const drawGymBack = (c: Ctx, state: GameState) => {
  const x1 = Math.max(LEFT, state.camera.x - 20), x2 = Math.min(RIGHT + 60, state.camera.x + CANVAS_WIDTH + 20);
  for (let cx = Math.floor(x1 / CHUNK) * CHUNK; cx < x2; cx += CHUNK) {
    const a = Math.max(LEFT, cx), b = Math.min(RIGHT + 60, cx + CHUNK);
    if (b <= a) continue;
    stamp(c, `m2gym-wall-${cx}`, cx - 2, 0, CHUNK + 4, Y, g => { g.save(); g.beginPath(); g.rect(cx - 2, -10, CHUNK + 4, Y + 20); g.clip(); drawWallStill(g, a, b); g.restore(); });
  }
  drawTubeLights(c, state, x1, x2);
  for (const p of PROPS) {
    const [a, b] = propSpan(p);
    if (!inView(state, a, b)) continue;
    if (p.look === 'bag' || p.look === 'poster') { drawProp(c, state, p); continue; }
    const flat = p.look === 'mirror' || p.look === 'window';
    stamp(c, `m2gym-prop-${p.look}-${p.x}-${p.y}`, a - 12, flat ? p.y - 10 : p.y - 196, b - a + 24, flat ? 186 : 204, g => drawProp(g, state, p));
  }
  // The wall shelves the little souvenirs sit on, and every souvenir
  for (const s of WALL_SHELVES) if (inView(state, s.x, s.x + s.w)) wallShelf(c, s.x, s.y, s.w);
  for (const s of SOUVENIR_SPOTS) if (inView(state, s.x - 60, s.x + 60)) { c.save(); c.translate(s.x, s.y); c.scale(0.8, 0.8); drawSouvenir(c, s.id, state.frame); c.restore(); }
  if (inView(state, R(400), R(560))) tv(c, R(470), 250, state.frame);
  if (inView(state, LEFT - 300, R(140))) frontDoor(c);
  if (inView(state, SQUAT_X - 100, SQUAT_X + 100)) drawProp(c, state, { look: 'squat', x: SQUAT_X, y: Y });
  if (inView(state, TRUCK_X - 40, TRUCK_X + 40)) handTruck(c, TRUCK_X);
  if (inView(state, RING.x1 - 60, RING.x2 + 60)) ringBack(c, state);
  if (inView(state, EXIT_X - 200, RIGHT + 60)) exitDoor(c, state);
};

/** The mid layer: the shelves and plyo boxes (stood on), the duct, the mezzanine and its rail, the ring's ropes in back. */
export const drawGymMid = (c: Ctx, state: GameState) => {
  for (const l of LEDGES) if (inView(state, l.x, l.x + l.w)) {
    if (l.look === 'step') drawLedge(c, { x: l.x, y: l.y, w: l.w, look: 'step' });
    else drawLedge(c, { x: l.x, y: l.y, w: l.w, look: 'rack' });
  }
  if (inView(state, DUCT.x1, DUCT.x2)) duct(c, state);
  if (inView(state, MEZZ.x1 - 40, MEZZ.x2 + 40)) mezzanine(c);
};

// ---------------------------------------------------------------------------------------------------------------

const wallShelf = (c: Ctx, x: number, y: number, w: number) => {
  for (const bx of [x + 8, x + w - 14]) { c.fillStyle = '#2A2420'; c.beginPath(); c.moveTo(bx, y + 6); c.lineTo(bx + 6, y + 6); c.lineTo(bx + 1, y + 24); c.lineTo(bx, y + 24); c.closePath(); c.fill(); }
  shadedTop(c, () => c.rect(x, y, w, 6), '#8A6A44', x, y, w, 6, 0.8);
  c.fillStyle = '#C8A070'; c.fillRect(x, y, w, 1.4);
  c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(x - 0.5, y - 0.5, w + 1, 7);
};

/** The TV up on its bracket: the news on it (him, GUANTANAMO, the anchor), flickering. */
const tv = (c: Ctx, x: number, y: number, f: number) => {
  steel(c, x - 3, y - 50, 6, 50, '#3F3F46');
  ink(c, () => c.roundRect(x - 44, y - 4, 88, 60, 5), '#1C1C22', 1);
  c.fillStyle = '#0A0A0E'; c.fillRect(x - 38, y + 2, 76, 46);
  // (the news on it: the cutscene's own picture, shrunk)
  newsPicture(c, x - 36, y + 4, 72, 42, f, false);
  if ((f >> 3) % 17 === 0) { c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x - 36, y + 4, 72, 42); }
  c.fillStyle = '#E11D48'; c.fillRect(x + 34, y + 50, 2, 2);
};

/** The door in from outside, at the far left (the one they came in through): steel, kicked in, the daylight round it. */
const frontDoor = (c: Ctx) => {
  // (the end wall: the room stops here)
  c.fillStyle = '#0B0807'; c.fillRect(LEFT - 400, 0, 400, 600);
  const x = FRONT_DOOR_X - 20, top = Y - 150;
  shaded(c, () => c.rect(x - 8, top - 8, 86, 158), '#27272A', x - 8, top - 8, 86, 158);
  bandedGradient(c, x, top, 70, 150, ['#FEF3C7', '#FDE68A', '#FCD34D'], 4);
  c.save(); c.translate(x, top); c.transform(0.45, 0.12, 0, 1, 0, 0);
  shaded(c, () => c.rect(0, 0, 70, 150), '#3F4F46', 0, 0, 70, 150);
  c.restore();
  ink(c, () => c.rect(x + 24, top - 24, 40, 12), '#1F2937', 0.8);
  signText(c, 'IN', x + 44, top - 15, 'bold 7px "Press Start 2P"', '#FDE68A');
  // (the light across the floor)
  for (let k = 0; k < 4; k++) { c.fillStyle = `rgba(254, 243, 199, ${(0.14 - k * 0.03).toFixed(3)})`; c.fillRect(x + 70, Y - 4 + k, 140 - k * 30, 4); }
};

/** The hand truck they wheeled the protein in on, left where they dropped it: four tubs stacked up it. */
const handTruck = (c: Ctx, x: number) => {
  floorShadow(c, x, 40);
  steel(c, x - 18, Y - 110, 4, 108, '#52525B'); steel(c, x - 18, Y - 4, 40, 4, '#52525B');
  for (let k = 0; k < 4; k++) {
    const y = Y - 4 - k * 26;
    shaded(c, () => c.roundRect(x - 14, y - 24, 30, 24, 3), '#18181C', x - 14, y - 24, 30, 24);
    ink(c, () => c.rect(x - 11, y - 18, 24, 10), '#B81C1C', 0.6);
    c.fillStyle = '#F8F0E0'; c.fillRect(x - 8, y - 15, 18, 1.4); c.fillRect(x - 6, y - 12, 14, 1.2);
  }
  ink(c, () => c.arc(x - 16, Y - 6, 7, 0, Math.PI * 2), '#18181B', 1);
  c.fillStyle = '#A1A1AA'; c.fillRect(x - 17, Y - 7, 2, 2);
};

/** The duct down off the ceiling to knee height: galvanized, banded, riveted, a grille in it; full height so it's
 *  plainly only gone under (a slide tackle). */
const duct = (c: Ctx, state: GameState) => {
  const { x1, x2, bottom } = DUCT, w = x2 - x1;
  stamp(c, `m2gym-duct-${x1}`, x1 - 4, CEIL_Y - 4, w + 8, bottom - CEIL_Y + 12, g => {
    bandedGradient(g, x1, CEIL_Y, w, bottom - CEIL_Y, ['#8A949C', '#7A848C', '#6C767E', '#5E686F', '#525B62'], 10);
    for (let x = x1; x < x2; x += 46) { g.fillStyle = '#3E464C'; g.fillRect(x, CEIL_Y, 3, bottom - CEIL_Y); g.fillStyle = '#B4BEC6'; g.fillRect(x + 3, CEIL_Y, 1, bottom - CEIL_Y); for (let y = CEIL_Y + 8; y < bottom; y += 16) { g.fillStyle = '#C8D0D6'; g.fillRect(x + 6, y, 2, 2); } }
    checker(g, x1, bottom - 40, w, 40, 'rgba(0,0,0,0.12)', 0);
    // (a grille, and the yellow-and-black edge along the bottom)
    ink(g, () => g.rect(x1 + w / 2 - 30, CEIL_Y + 120, 60, 40), '#3E464C', 1);
    g.fillStyle = '#1E2428'; for (let k = 0; k < 6; k++) g.fillRect(x1 + w / 2 - 26, CEIL_Y + 126 + k * 6, 52, 3);
    for (let x = x1; x < x2; x += 16) { g.fillStyle = '#FACC15'; g.fillRect(x, bottom - 8, 8, 8); g.fillStyle = '#111'; g.fillRect(x + 8, bottom - 8, 8, 8); }
    g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x1, CEIL_Y - 2, w, bottom - CEIL_Y + 2);
  });
  // (the dark under it: the gap he goes through)
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x1, bottom, w, 6);
  void state;
};

/** The mezzanine: its deck's edge and the rail along it, NO SPOTTERS on its front, the posts down to the floor. */
const mezzanine = (c: Ctx) => {
  const { x1, x2 } = MEZZ;
  // (the locker room's lockers built in under it, floor to deck: nobody's getting under there)
  stamp(c, `m2gym-lockers-${x1}`, x1 - 2, MEZZ_Y + 10, x2 - x1 + 4, Y - MEZZ_Y - 8, g => {
    const n = Math.floor((x2 - x1) / 30), lw = (x2 - x1) / n;
    for (let k = 0; k < n; k++) {
      const lx = x1 + k * lw, c0 = k % 3 === 1 ? '#3A5A7A' : '#33536F';
      shaded(g, () => g.rect(lx + 1, MEZZ_Y + 14, lw - 2, Y - MEZZ_Y - 16), c0, lx + 1, MEZZ_Y + 14, lw - 2, Y - MEZZ_Y - 16);
      g.fillStyle = dark(c0, 0.4); for (let v = 0; v < 4; v++) g.fillRect(lx + 6, MEZZ_Y + 26 + v * 4, lw - 12, 1.4);
      g.fillStyle = '#C8C8D0'; g.fillRect(lx + lw - 8, MEZZ_Y + 80, 3, 12);
      g.fillStyle = lite(c0, 0.3); g.fillRect(lx + 2, MEZZ_Y + 15, 1.4, Y - MEZZ_Y - 18);
      g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(lx + 0.5, MEZZ_Y + 13.5, lw - 1, Y - MEZZ_Y - 14);
    }
    // (one hanging open, a towel over its door)
    g.fillStyle = '#F4F4F5'; g.fillRect(x1 + lw * 2 + 4, MEZZ_Y + 40, 10, 30);
  });
  shadedTop(c, () => c.rect(x1, MEZZ_Y, x2 - x1, 14), '#52525B', x1, MEZZ_Y, x2 - x1, 14);
  c.fillStyle = '#D4D4D8'; c.fillRect(x1, MEZZ_Y, x2 - x1, 2);
  for (let x = x1 + 10; x < x2; x += 30) steel(c, x, MEZZ_Y - 40, 3, 40, '#A1A1AA');
  steel(c, x1, MEZZ_Y - 42, x2 - x1, 4, '#A1A1AA');
  shaded(c, () => c.rect(x1 + 30, MEZZ_Y + 22, 140, 20), '#FACC15', x1 + 30, MEZZ_Y + 22, 140, 20);
  signText(c, 'NO SPOTTERS', x1 + 100, MEZZ_Y + 36, 'bold 8px "Press Start 2P"', '#18181B', 'rgba(161, 98, 7, 0.5)');
};

/** Meathead 1's ring: the posts (rusting), the turnbuckles, the ropes sagging between them, the mat (gone yellow,
 *  duct tape over the splits), the apron (MEATHEAD'S GYM, a letter gone); its tube light over it. */
const ringBack = (c: Ctx, state: GameState) => {
  const { x1, x2, mat } = RING, W = x2 - x1, mid = (x1 + x2) / 2;
  const flick = Math.sin(state.frame * 0.7) > 0.97 ? 0.4 : 1;
  steppedGlow(c, mid, mat - 120, 360, '#ECFCCB', 0.06 * flick, 0.012 * flick, 6);
  // The apron and the mat (the step up he stands on)
  stamp(c, `m2gym-ring-${x1}`, x1 - 4, mat - 2, W + 8, Y - mat + 4, g => {
    bandedGradient(g, x1, mat, W, 10, ['#D4CCB4', '#C8C0A8', '#B4AC94'], 3);
    g.fillStyle = '#E2DCC6'; g.fillRect(x1, mat, W, 1.4); g.fillStyle = INK; g.fillRect(x1, mat - 0.5, W, 1);
    bandedGradient(g, x1, mat + 10, W, Y - mat - 10, ['#1B2540', '#243152', '#1F2A48', '#141B30'], 4);
    for (let x = x1; x < x2; x += 60) { g.fillStyle = '#141B30'; g.fillRect(x, mat + 10, 3, Y - mat); }
    g.font = 'bold 10px "Press Start 2P"';
    const word = "MEATHEAD'S GYM", gone = word.indexOf('Y');
    let lx = mid - g.measureText(word).width / 2;
    for (let i = 0; i < word.length; i++) { if (i !== gone) { g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillText(word[i], lx + 1, mat + 27); g.fillStyle = '#C8B060'; g.fillText(word[i], lx, mat + 26); } lx += g.measureText(word[i]).width; }
    for (const tx of [x1 + 150, x1 + 420]) { g.save(); g.translate(tx, mat + 5); for (const a of [0.5, -0.5]) { g.save(); g.rotate(a); ink(g, () => g.rect(-12, -2, 24, 4), '#A1A1AA', 0.6); g.restore(); } g.restore(); }
  });
  // The posts behind (the far ones) and the ropes along the back
  ringRopes(c, x1 + 24, x2 - 24, mat - 30, 0.6);
};
const ROPES = [{ dy: -120, c: '#B91C1C', sag: 8 }, { dy: -84, c: '#D6D3D1', sag: 12 }, { dy: -48, c: '#1E40AF', sag: 6 }];
const ringRopes = (c: Ctx, a: number, b: number, base: number, dim: number) => {
  for (const x of [a, b]) {
    shaded(c, () => c.rect(x - 6, base - 150, 12, 150), '#78716C', x - 6, base - 150, 12, 150);
    c.fillStyle = 'rgba(154, 52, 18, 0.6)'; c.fillRect(x - 4, base - 120, 5, 12); c.fillRect(x - 2, base - 60, 4, 9);
    for (const r of ROPES) shaded(c, () => c.roundRect(x - 10, base + r.dy - 7, 20, 16, 3), r.c, x - 10, base + r.dy - 7, 20, 16);
  }
  c.lineCap = 'round';
  for (const r of ROPES) {
    const curve = () => { c.beginPath(); c.moveTo(a, base + r.dy); c.quadraticCurveTo((a + b) / 2, base + r.dy + r.sag * 2, b, base + r.dy); c.stroke(); };
    c.globalAlpha = dim;
    c.strokeStyle = INK; c.lineWidth = 6; curve();
    c.strokeStyle = dark(r.c, 0.25); c.lineWidth = 4; curve();
    c.strokeStyle = lite(r.c, 0.4); c.lineWidth = 1; curve();
    c.globalAlpha = 1;
  }
  c.lineCap = 'butt';
};
/** The ring's near ropes, in front of everybody (only the bottom one: it doesn't hide the fight). */
export const drawRingFront = (c: Ctx, state: GameState) => {
  const { x1, x2, mat } = RING;
  if (!inView(state, x1, x2)) return;
  for (const x of [x1 + 6, x2 - 6]) { shaded(c, () => c.rect(x - 7, mat - 150, 14, 150), '#78716C', x - 7, mat - 150, 14, 150); for (const r of ROPES) shaded(c, () => c.roundRect(x - 11, mat + r.dy - 7, 22, 18, 3), r.c, x - 11, mat + r.dy - 7, 22, 18); }
  c.lineCap = 'round';
  const r = ROPES[2], curve = () => { c.beginPath(); c.moveTo(x1 + 6, mat + r.dy); c.quadraticCurveTo((x1 + x2) / 2, mat + r.dy + r.sag * 2, x2 - 6, mat + r.dy); c.stroke(); };
  c.strokeStyle = INK; c.lineWidth = 7; curve(); c.strokeStyle = dark(r.c, 0.25); c.lineWidth = 5; curve(); c.strokeStyle = r.c; c.lineWidth = 3; curve(); c.strokeStyle = lite(r.c, 0.45); c.lineWidth = 1; curve();
  c.lineCap = 'butt';
};

/** The way out: a steel door (shut and chained till the ring's done), EXIT lit over it, the arrow pointing on. */
let exitOpen = 0;
export const setExitOpen = (k: number) => { exitOpen = k; };
const exitDoor = (c: Ctx, state: GameState) => {
  const x = EXIT_X, top = Y - 160, w = 80;
  // (the end wall past it)
  c.fillStyle = '#0B0807'; c.fillRect(RIGHT, 0, 400, 600);
  shaded(c, () => c.rect(x - 8, top - 8, w + 16, 168), '#27272A', x - 8, top - 8, w + 16, 168);
  bandedGradient(c, x, top, w, 160, ['#FEF9C3', '#FEF3C7', '#FDE68A'], 3);
  const lw = w * (1 - exitOpen * 0.85);
  shaded(c, () => c.rect(x, top, lw, 160), '#52525B', x, top, lw, 160);
  shadedTop(c, () => c.rect(x + 1, top + 134, lw - 2, 24), '#A1A1AA', x + 1, top + 134, lw - 2, 24, 0.8);
  if (lw > 40) { shaded(c, () => c.rect(x + lw - 16, top + 80, 10, 6), '#D4D4D8', x + lw - 16, top + 80, 10, 6, 0.8); }
  if (exitOpen <= 0) {
    // (chained shut: the chain across it, the padlock)
    c.strokeStyle = '#9CA3AF'; c.lineWidth = 3;
    for (let i = 0; i <= 8; i++) { const u = i / 8; c.beginPath(); c.ellipse(x + u * w, top + 70 + Math.sin(u * Math.PI) * 14, 4, 2.5, (i % 2) * Math.PI / 2, 0, Math.PI * 2); c.stroke(); }
    shaded(c, () => c.roundRect(x + w / 2 - 7, top + 82, 14, 14, 2), '#CA8A04', x + w / 2 - 7, top + 82, 14, 14);
  }
  // The EXIT sign over it: lit red, the arrow pointing right (blinking once it's open)
  const on = exitOpen > 0 ? (state.frame >> 4) % 2 === 0 : false;
  shaded(c, () => c.rect(x - 4, top - 40, w + 8, 26), '#18181B', x - 4, top - 40, w + 8, 26);
  c.fillStyle = exitOpen > 0 ? '#EF4444' : '#7F1D1D'; c.font = 'bold 12px "Press Start 2P"'; c.textAlign = 'left';
  c.fillText('EXIT', x + 4, top - 21);
  c.fillStyle = on || exitOpen <= 0 ? (exitOpen > 0 ? '#FCA5A5' : '#7F1D1D') : '#EF4444';
  c.beginPath(); c.moveTo(x + 60, top - 34); c.lineTo(x + 78, top - 27); c.lineTo(x + 60, top - 20); c.closePath(); c.fill(); c.fillRect(x + 52, top - 30, 9, 6);
  if (exitOpen > 0) steppedGlow(c, x + w / 2, top - 27, 70, '#EF4444', 0.12, 0.02, 4);
};
