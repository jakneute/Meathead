// The secret warehouse, drawn (the crude first pass: readable boxes and the park's letters). Outside (the backdrop: the
// lot's sky by the hour, the HAPPYWOOD hill, the soundstages), then, world space: the public on the fallen back wall
// (phones up), the steel frame and the roof still up on their columns, the stage floor (the play plane's lit lip), the
// green-screen sets standing at the back of it (tracking markers, painted flats, banners hung off the trusses, signs on
// stands), the set pieces he stands on (lit lips: standable reads standable; the flats behind dimmed, no lips), the
// wrecked throne-train, the main stage (the stage door, the risers, the bulldozer parked at the back, the script on its
// plinth in its glass case under its light, the ropes and the laser grid, the far wall).

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { box, steveFlier } from '../section';
import { drawLotBackdrop } from '../lot/art';
import { inView, words, print, enamel, gate, ledgeLip, velvetRope, marquee } from '../blvd/paint';
import { drawPerson } from '../../adventure/temple/people';
import {
  X, Y, GY, x0, x1, BACK_Y, ROOF_Y, PIT_A, PIT_B, SOLIDS, LEDGES, STEVES, ARENA, CASE_X, DOZER_X, FAR_WALL, REFILL, LIGHTS,
} from './layout';
import { whOf } from './state';
import { WRECK_X, ROOF_HOLE, wallsDown } from './burst';
import { dozerX, caseDown, caseTip, wallOpen, endingOn, drawDozer } from './ending';

type Ctx = CanvasRenderingContext2D;

const GREEN = '#16A34A', GREEN_DK = '#15803D', MARK = '#BBF7D0';

export const drawWarehouseBackdrop = (c: Ctx, state: GameState) => drawLotBackdrop(c, state);

// ---------------------------------------------------------------------------------------------------------------
// Bits

/** A green screen (a flat, or the cyc): chroma green, its seams, the tracking markers. */
const greenScreen = (c: Ctx, a: number, b: number, h: number, feetY = BACK_Y) => {
  box(c, a - 2, feetY - h - 2, b - a + 4, h + 2, '#052E16');
  box(c, a, feetY - h, b - a, h, GREEN);
  for (let x = a + 140; x < b; x += 140) box(c, x, feetY - h, 1, h, GREEN_DK);
  // (the curve down into the floor: the cyc's sweep)
  box(c, a, feetY - 10, b - a, 10, GREEN_DK);
  for (let x = a + 40; x < b - 20; x += 90) for (let y = feetY - h + 40; y < feetY - 30; y += 90) { box(c, x - 6, y, 13, 2, MARK); box(c, x - 1, y - 5, 2, 12, MARK); }
};
/** A banner hung off the roof trusses on two cables: its words in the park's letters. */
const banner = (c: Ctx, x: number, y: number, w: number, h: number, top: string, bottom: string | null, col = '#7F1D1D', ink = '#FDE047') => {
  c.strokeStyle = '#27272A'; c.lineWidth = 2; c.beginPath();
  c.moveTo(x - w / 2 + 10, ROOF_Y + 30); c.lineTo(x - w / 2 + 10, y - h / 2); c.moveTo(x + w / 2 - 10, ROOF_Y + 30); c.lineTo(x + w / 2 - 10, y - h / 2); c.stroke();
  box(c, x - w / 2 - 2, y - h / 2 - 2, w + 4, h + 4, '#000'); box(c, x - w / 2, y - h / 2, w, h, col);
  box(c, x - w / 2, y - h / 2, w, 4, '#FDE047'); box(c, x - w / 2, y + h / 2 - 4, w, 4, '#FDE047');
  words(c, top, x, y - (bottom ? 4 : -6), gate(12, ink, col));
  if (bottom) words(c, bottom, x, y + 16, print(1, '#FEF3C7'));
};
/** A sign on a stand (a C-stand's arm, a sandbag on its foot): its words on a board. */
const standSign = (c: Ctx, x: number, feetY: number, lines: string[], board = '#18181B', ink = '#FACC15') => {
  const w = Math.max(...lines.map(l => l.length)) * 7 + 20, h = 14 + lines.length * 12, top = feetY - 110;
  box(c, x - 2, top + h, 4, 110 - h, '#71717A'); box(c, x - 16, feetY - 6, 32, 6, '#57534E'); box(c, x - 10, feetY - 12, 20, 6, '#A8A29E');
  box(c, x - w / 2 - 2, top - 2, w + 4, h + 4, '#000'); box(c, x - w / 2, top, w, h, board);
  lines.forEach((l, i) => words(c, l, x, top + 15 + i * 12, i === 0 ? enamel(8, ink) : print(1, '#E7E5E4')));
};
/** A movie camera on its tripod (scenery at the back). */
const camera = (c: Ctx, x: number, feetY: number) => {
  for (const s of [-1, 0, 1]) { c.strokeStyle = '#27272A'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, feetY - 70); c.lineTo(x + s * 22, feetY); c.stroke(); }
  box(c, x - 26, feetY - 100, 52, 30, '#000'); box(c, x - 24, feetY - 98, 48, 26, '#3F3F46');
  box(c, x + 24, feetY - 94, 16, 18, '#18181B'); c.fillStyle = '#000'; c.beginPath(); c.arc(x - 12, feetY - 112, 13, 0, Math.PI * 2); c.arc(x + 12, feetY - 112, 13, 0, Math.PI * 2); c.fill();
  box(c, x - 20, feetY - 92, 6, 4, '#EF4444');
};
/** A clapperboard on a stand: what's being shot. */
const slate = (c: Ctx, x: number, feetY: number) => {
  box(c, x - 2, feetY - 80, 4, 80, '#71717A');
  box(c, x - 34, feetY - 128, 68, 50, '#000'); box(c, x - 32, feetY - 126, 64, 46, '#27272A');
  for (let k = 0; k < 6; k++) box(c, x - 32 + k * 11, feetY - 136, 6, 8, k % 2 ? '#F8FAFC' : '#18181B');
  words(c, 'REVENGERS:', x, feetY - 116, print(1, '#F8FAFC'));
  words(c, "END-OF-THE-", x, feetY - 106, print(1, '#F8FAFC'));
  words(c, "WORLD'S-DAY", x, feetY - 96, print(1, '#F8FAFC'));
  words(c, 'SECRET SET', x, feetY - 85, print(1, '#FCA5A5'));
};
/** A painted city skyline on a flat (dim: scenery), fire painted on if `burning`; its bracing showing at its ends. */
const skyline = (c: Ctx, a: number, b: number, h: number, burning: boolean) => {
  for (const ex of [a - 16, b + 16]) { c.strokeStyle = '#A16207'; c.lineWidth = 5; c.beginPath(); c.moveTo(ex < a ? a + 6 : b - 6, BACK_Y - h + 30); c.lineTo(ex, BACK_Y - 4); c.stroke(); box(c, ex - 12, BACK_Y - 12, 24, 12, '#A8A29E'); }
  box(c, a - 2, BACK_Y - h - 2, b - a + 4, h + 2, '#000');
  box(c, a, BACK_Y - h, b - a, h, burning ? '#7C2D12' : '#1E3A8A');
  box(c, a, BACK_Y - h, b - a, h * 0.4, burning ? '#9A3412' : '#1D4ED8');
  for (let x = a + 10, k = 0; x < b - 30; x += 46, k++) {
    const bh = 90 + ((k * 53) % 5) * 40;
    box(c, x, BACK_Y - bh, 38, bh, burning ? '#292524' : '#1E293B');
    for (let y = BACK_Y - bh + 10; y < BACK_Y - 20; y += 18) for (let wx = x + 6; wx < x + 32; wx += 12) box(c, wx, y, 5, 7, (k + y) % 3 ? '#FDE68A' : '#334155');
    if (burning && k % 3 === 0) { c.fillStyle = '#F97316'; c.beginPath(); c.moveTo(x + 4, BACK_Y - bh); c.lineTo(x + 19, BACK_Y - bh - 34); c.lineTo(x + 34, BACK_Y - bh); c.fill(); }
  }
};
/** The wrecked throne-train: three golden toilets on wheels, on their sides, the track bits with them (feet at y:
 *  coming down through the roof, then on the floor). */
export const drawWreck = (c: Ctx, x: number, y: number, tilt: number, f: number) => {
  for (let k = 0; k < 3; k++) {
    c.save(); c.translate(x - k * 78 + 78, y - 4 - (y < GY ? k * 30 : 0)); c.rotate(-tilt * (1.2 + k * 0.25));
    box(c, -34, -46, 68, 42, '#000'); box(c, -32, -44, 64, 38, '#CA8A04'); box(c, -32, -44, 64, 6, '#FDE047');
    box(c, -36, -70, 22, 30, '#000'); box(c, -34, -68, 18, 26, '#EAB308');
    box(c, -10, -52, 40, 10, '#F8FAFC');
    for (const wx of [-24, 22]) { c.fillStyle = '#18181B'; c.beginPath(); c.arc(wx, -2, 8, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
  if (tilt >= 1 && f % 50 < 30) { c.fillStyle = 'rgba(120, 113, 108, 0.4)'; c.beginPath(); c.ellipse(x - 40, GY - 70 - (f % 50), 14, 9, 0, 0, Math.PI * 2); c.fill(); }
};

/** The crowd outside, on the fallen back wall: guests by seed, phones up, staring in. Once the director's said KILL
 *  THEM ALL, every few of them a brawl: one of the crew (in their blacks) laying into a guest (the background's fight:
 *  the crew at the public who saw). */
const crowd = (c: Ctx, state: GameState, brawl: boolean) => {
  const cam = state.camera.x, f = state.frame;
  const feet = BACK_Y - 22;
  for (let x = Math.floor((cam - 60) / 58) * 58; x < cam + 860; x += 58) {
    const n = Math.abs((x / 58) | 0), seed = n * 37 + 11, face: 1 | -1 = seed % 2 ? 1 : -1;
    if (brawl && n % 3 === 1) {
      // (the crew member, punching; the guest reeling, arms up, knocked back and forth)
      const hit = (f + seed) % 40 < 8, gx = x + 18 + (hit ? 4 : 0);
      c.save(); c.translate(x - 6 + (seed % 9), feet); c.scale(0.56, 0.56);
      drawPerson(c, { seed: seed + 5, outfit: 'stage', f, pose: hit ? 'thrust' : 'stand', mood: 'shocked' });
      c.restore();
      c.save(); c.translate(gx, feet); c.rotate(hit ? 0.25 : 0.08); c.scale(-0.56, 0.56);
      drawPerson(c, { seed, outfit: 'guest', f, pose: 'cheer', mood: 'shocked' });
      c.restore();
      continue;
    }
    c.save(); c.translate(x + (seed % 23), feet); c.scale(face * 0.56, 0.56);
    drawPerson(c, { seed, outfit: 'guest', f, pose: seed % 3 === 0 ? 'cheer' : 'photo', mood: seed % 4 ? 'shocked' : 'happy' });
    if (seed % 3 !== 0) { box(c, 14, -70, 8, 12, '#18181B'); box(c, 15, -68, 6, 8, (f + seed) % 70 < 3 ? '#FFFFFF' : '#60A5FA'); }
    c.restore();
  }
};
/** The burst-in's KILL THEM ALL: the crew off the sets, running back over the stage floor and out at the public. */
const runners = (c: Ctx, state: GameState) => {
  const b = whOf(state).burst, f = state.frame;
  for (const r of b.runners) {
    const t = r.t - r.at;
    if (t < 0 || t > 70) continue;
    const k = t / 70, y = BACK_Y + 14 - k * 36, s = 0.68 - k * 0.12;
    c.save(); c.translate(r.x + Math.sin(r.seed) * 20, y); c.scale(s, s);
    drawPerson(c, { seed: r.seed, outfit: 'stage', f, pose: 'walk', mood: 'shocked' });
    c.restore();
  }
};

// ---------------------------------------------------------------------------------------------------------------

export const drawWarehouseBack = (c: Ctx, state: GameState) => {
  const f = state.frame, b = whOf(state).burst, cam = state.camera.x;
  const fall = b.on ? b.fall : wallsDown(state) ? 1 : 0;
  const a = Math.max(x0 - 800, cam - 200), z = Math.min(x1 + 300, cam + 1000);
  if (z <= a) return;
  // Outside, past the back wall: the lot's asphalt, the back wall lying flat on it, the crowd on it
  box(c, a, BACK_Y - 80, z - a, 80, '#57534E');
  if (fall > 0) {
    box(c, a, BACK_Y - 30 * fall, z - a, 24 * fall, '#71717A');
    for (let x = Math.floor(a / 16) * 16; x < z; x += 16) box(c, x, BACK_Y - 30 * fall, 2, 24 * fall, '#52525B');
    if (fall >= 1) { crowd(c, state, !b.on || b.runners.some(r => r.t - r.at > 60)); if (b.on) runners(c, state); }
  }
  // The back wall, standing (till it goes: it falls away from us, shorter as it goes over)
  if (fall < 1) {
    const top = BACK_Y - (BACK_Y - ROOF_Y) * Math.cos(fall * Math.PI / 2);
    box(c, a, top, z - a, BACK_Y - top, '#44403C');
    for (let x = Math.floor(a / 14) * 14; x < z; x += 14) box(c, x, top, 3, BACK_Y - top, '#3F3B37');
  }
  // The steel frame (it's still up): the roof's underside, its trusses, the columns. The hole the train came down
  // through (the burst-in on: once the roof's gone; for good after)
  const holed = b.on ? b.t >= 24 : wallsDown(state);
  const ha = X(ROOF_HOLE.a), hb = X(ROOF_HOLE.b);
  c.save();
  if (holed && inView(state, ha, hb)) {
    c.beginPath(); c.rect(a, ROOF_Y - 160, z - a, 170);
    c.moveTo(ha, ROOF_Y - 160); c.lineTo(ha + 20, ROOF_Y + 6); c.lineTo(ha + 70, ROOF_Y - 10); c.lineTo(ha + 120, ROOF_Y + 8); c.lineTo(ha + 170, ROOF_Y - 6);
    c.lineTo(hb - 50, ROOF_Y + 10); c.lineTo(hb - 10, ROOF_Y - 4); c.lineTo(hb, ROOF_Y - 160); c.closePath();
    c.clip('evenodd');
  }
  box(c, a, ROOF_Y - 140, z - a, 140, '#1C1917');
  box(c, a, ROOF_Y - 8, z - a, 8, '#292524');
  c.strokeStyle = '#3F3F46'; c.lineWidth = 2; c.beginPath();
  for (let x = Math.floor(a / 30) * 30, k = 0; x < z; x += 30, k++) { c.moveTo(x, ROOF_Y - 40); c.lineTo(x + 15, ROOF_Y - (k % 2 ? 4 : 40)); }
  c.stroke();
  box(c, a, ROOF_Y - 44, z - a, 4, '#3F3F46'); box(c, a, ROOF_Y - 4, z - a, 4, '#3F3F46');
  c.restore();
  // (the torn ends of the trusses, bent down into the hole; a cable or two hanging)
  if (holed && inView(state, ha, hb)) {
    c.strokeStyle = '#52525B'; c.lineWidth = 3; c.beginPath();
    c.moveTo(ha + 20, ROOF_Y - 4); c.lineTo(ha + 34, ROOF_Y + 30); c.moveTo(hb - 10, ROOF_Y - 6); c.lineTo(hb - 22, ROOF_Y + 36);
    c.stroke();
    c.strokeStyle = '#18181B'; c.lineWidth = 1; c.beginPath();
    c.moveTo(ha + 90, ROOF_Y); c.quadraticCurveTo(ha + 96, ROOF_Y + 40, ha + 88, ROOF_Y + 70); c.moveTo(hb - 70, ROOF_Y); c.lineTo(hb - 66, ROOF_Y + 50);
    c.stroke();
  }
  for (let x = Math.floor(a / 900) * 900 + 450; x < z; x += 900) { box(c, x - 9, ROOF_Y, 18, BACK_Y - ROOF_Y, '#27272A'); box(c, x - 9, ROOF_Y, 4, BACK_Y - ROOF_Y, '#3F3F46'); box(c, x - 14, BACK_Y - 8, 28, 8, '#18181B'); }
  // The stage floor (the back of it to the play plane's lit edge), the pits through it
  box(c, a, BACK_Y, z - a, GY - BACK_Y, '#57534E');
  const eye = cam + 400;
  c.strokeStyle = '#44403C'; c.lineWidth = 1; c.beginPath();
  for (let x = Math.floor(a / 100) * 100; x < z; x += 100) { c.moveTo(x, GY); c.lineTo(x + (eye - x) * 0.15, BACK_Y); }
  c.stroke();
  box(c, a, BACK_Y + 22, z - a, 1, '#44403C');
  box(c, a, GY, z - a, 400, '#292524'); box(c, a, GY, z - a, 4, '#D6D3D1');
  for (const P of [PIT_A, PIT_B]) if (inView(state, X(P.a), X(P.b))) pit(c, X(P.a), X(P.b));
  // The end wall the train came through: down, flat outward (falling, it swings out about its foot)
  endWall(c, fall);
  sets(c, state);
  // The set pieces he stands on
  for (const [rx, h, w, what] of SOLIDS) if (inView(state, X(rx), X(rx) + w)) solidPiece(c, X(rx), Y(h), w, h, what, state);
  for (const [rx, h, w, what] of LEDGES) if (inView(state, X(rx), X(rx) + w)) ledgePiece(c, X(rx), Y(h), w, h, what);
  // The wreck (where it stopped; tumbling in, in the burst-in)
  const wx = b.on ? b.tx : X(WRECK_X);
  if ((!b.on || b.t >= 24) && inView(state, wx - 200, wx + 140)) drawWreck(c, wx, b.on ? b.ty : GY, b.on ? b.tilt : 1, f);
  for (const [rx, h, kind] of STEVES) if (inView(state, X(rx) - 60, X(rx) + 60)) steveFlier(c, X(rx), kind === 'standee' ? Y(h) : Y(h), kind, rx);
  mainStage(c, state);
};

const pit = (c: Ctx, a: number, b: number) => {
  box(c, a, BACK_Y, b - a, 700, '#052E16');
  // (dressed in green down its sides; dark at the bottom of it, out of sight)
  box(c, a, GY, 12, 300, GREEN_DK); box(c, b - 12, GY, 12, 300, GREEN_DK);
  for (let y = GY + 20; y < GY + 300; y += 60) { box(c, a + 2, y, 8, 2, MARK); box(c, b - 10, y, 8, 2, MARK); }
  box(c, a, BACK_Y, b - a, 10, '#14532D');
  box(c, a - 4, GY - 2, 8, 6, '#A8A29E'); box(c, b - 4, GY - 2, 8, 6, '#A8A29E');
  for (let x = a + 30; x < b - 30; x += 40) box(c, x, GY + 360 + ((x * 7) % 30), 20, 3, '#000');
};

const endWall = (c: Ctx, fall: number) => {
  const h = GY - ROOF_Y, wx = x0 - 40;
  c.save(); c.translate(wx, GY); c.rotate(-fall * Math.PI / 2);
  box(c, 0, -h, 40, h, '#44403C');
  for (let y = -h; y < 0; y += 14) box(c, 0, y, 40, 3, '#3F3B37');
  // (the hole the train made)
  c.fillStyle = '#0C0A09'; c.beginPath(); c.moveTo(-1, -40); c.lineTo(14, -70); c.lineTo(8, -150); c.lineTo(22, -210); c.lineTo(-1, -250); c.lineTo(41, -250); c.lineTo(28, -190); c.lineTo(36, -110); c.lineTo(41, -40); c.closePath(); c.fill();
  c.restore();
};

const solidPiece = (c: Ctx, x: number, y: number, w: number, h: number, what: string, state: GameState) => {
  if (what === 'mat') {
    ledgeLip(c, x, y, w, '#1D4ED8', '#93C5FD', h);
    for (let k = 1; k < 4; k++) box(c, x + (w * k) / 4, y + 4, 2, h - 6, '#1E40AF');
    box(c, x + 10, y + h / 2 - 2, 12, 4, '#18181B'); box(c, x + w - 22, y + h / 2 - 2, 12, 4, '#18181B');
    words(c, 'CRASH MAT', x + w / 2, y + h - 10, print(1, '#DBEAFE'));
  } else if (what === 'roof') {
    // The rooftop set's front: a painted building, solid, full down to the floor (no way through: over it)
    box(c, x - 2, y - 2, w + 4, h + 2, '#000'); box(c, x, y, w, h, '#9A3412');
    for (let by = y + 12; by < GY - 20; by += 12) for (let bx = x + ((by / 12) % 2 ? 0 : 12); bx < x + w; bx += 24) box(c, bx, by, 22, 1, '#7C2D12');
    for (let wy = y + 40; wy < GY - 80; wy += 70) for (let wx = x + 30; wx < x + w - 40; wx += 70) { box(c, wx, wy, 34, 40, '#1E293B'); box(c, wx + 2, wy + 2, 30, 8, '#475569'); }
    box(c, x + w / 2 - 26, GY - 76, 52, 76, '#292524');
    ledgeLip(c, x - 6, y, w + 12, '#57534E', '#FDE68A', 12);
    // (round the back of it: it's a flat, the 2x4s and sandbags holding it up)
    c.strokeStyle = '#A16207'; c.lineWidth = 6; c.beginPath(); c.moveTo(x + w - 4, y + 30); c.lineTo(x + w + 40, GY - 4); c.stroke();
    box(c, x + w + 28, GY - 14, 26, 14, '#A8A29E');
    // (the water tank prop on the roof: scenery, set back)
    box(c, x + 150, y - 150, 90, 110, '#57534E'); box(c, x + 146, y - 158, 98, 10, '#44403C');
    for (const lx of [x + 158, x + 222]) box(c, lx, y - 40, 6, 40, '#3F3F46');
  } else if (what === 'table') {
    ledgeLip(c, x, y, w, '#F5F5F4', '#FFFFFF', 12);
    box(c, x + 8, y + 12, 6, h - 12, '#57534E'); box(c, x + w - 14, y + 12, 6, h - 12, '#57534E');
    box(c, x + 4, y + 12, w - 8, 14, '#DC2626');
    for (let k = 0; k < 6; k++) { c.fillStyle = ['#F9A8D4', '#FDE68A', '#A16207'][k % 3]; c.beginPath(); c.arc(x + 20 + k * 22, y - 4, 6, 0, Math.PI * 2); c.fill(); }
    box(c, x + w - 34, y - 30, 22, 30, '#A1A1AA'); box(c, x + w - 30, y - 36, 14, 6, '#71717A');
  } else if (what === 'taxi') {
    box(c, x - 2, y - 2, w + 4, h + 2, '#000'); box(c, x, y + 16, w, h - 26, '#FACC15'); box(c, x + 24, y, w - 50, 20, '#EAB308');
    box(c, x + 30, y + 4, 30, 12, '#7DD3FC'); box(c, x + 66, y + 4, 26, 12, '#7DD3FC');
    for (const wx of [x + 24, x + w - 24]) { c.fillStyle = '#18181B'; c.beginPath(); c.arc(wx, GY - 8, 12, 0, Math.PI * 2); c.fill(); }
    ledgeLip(c, x + 22, y, w - 46, '#EAB308', '#FEF08A', 6);
    words(c, 'TAXI', x + w / 2, y + 34, print(1, '#18181B'));
  }
  void state;
};

const ledgePiece = (c: Ctx, x: number, y: number, w: number, h: number, what: string) => {
  if (what === 'flat') {
    // (a set flat hung on chains: the chains up to the roof)
    for (const cx of [x + 12, x + w - 12]) { c.strokeStyle = '#52525B'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, y); c.lineTo(cx, ROOF_Y); c.stroke(); }
    box(c, x, y, w, 26, '#000'); box(c, x + 1, y + 1, w - 2, 24, '#78716C'); box(c, x + 6, y + 8, w - 12, 10, '#57534E');
    box(c, x, y, w, 3, '#FDE68A');
    return;
  }
  const body = what === 'truck' ? '#E7E5E4' : what === 'riser' ? '#27272A' : what === 'scaffold' ? '#52525B' : '#92400E';
  // (its legs down to the floor: rostrums on legs, scaffolding in pipes)
  if (what !== 'truck') {
    box(c, x + 6, y + 14, 6, GY - y - 14, what === 'scaffold' ? '#71717A' : '#57534E'); box(c, x + w - 12, y + 14, 6, GY - y - 14, what === 'scaffold' ? '#71717A' : '#57534E');
    if (what === 'scaffold') { c.strokeStyle = '#71717A'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 9, y + 14); c.lineTo(x + w - 9, GY); c.moveTo(x + w - 9, y + 14); c.lineTo(x + 9, GY); c.stroke(); }
  }
  ledgeLip(c, x, y, w, body);
  void h;
};

/** The sets, each where it stands (at the back of the floor), with their signs. */
const sets = (c: Ctx, state: GameState) => {
  const v = (a: number, b: number) => inView(state, X(a), X(b));
  // SET 1: the rooftop
  if (v(700, 2600)) {
    greenScreen(c, X(740), X(1500), 340);
    skyline(c, X(1560), X(2560), 380, false);
    banner(c, X(1120), BACK_Y - 380, 330, 60, 'REVENGERS: RESEMBLE', 'IN THEATERS NEVER (TAX PURPOSES)');
    camera(c, X(820), BACK_Y + 10);
    slate(c, X(1380), BACK_Y + 10);
    standSign(c, X(2380), BACK_Y + 10, ['QUIET ON SET', 'CLOSED SET. NO PUBLIC.']);
  }
  // SET 2: the abyss
  if (v(2600, 4600)) {
    greenScreen(c, X(2640), X(4420), 380);
    standSign(c, X(2760), BACK_Y + 10, ['THE ABYSS', 'PIT: 40 FT. DO NOT FALL IN.'], '#14532D', '#FDE047');
    banner(c, X(3520), BACK_Y - 400, 300, 56, 'HERO FALLS (STUNT)', 'HE IS NOT SUPPOSED TO DIE', '#14532D', '#F0FDF4');
  }
  // Video village and craft services
  if (v(4600, 6300)) {
    // (the monitors on their cart)
    box(c, X(4640), BACK_Y - 60, 150, 60, '#27272A');
    for (let k = 0; k < 3; k++) { box(c, X(4648) + k * 48, BACK_Y - 104, 44, 36, '#000'); box(c, X(4651) + k * 48, BACK_Y - 101, 38, 30, k === 1 ? GREEN : '#1E3A8A'); }
    standSign(c, X(4900), BACK_Y + 10, ['CRAFT SERVICES', 'CAST AND CREW ONLY'], '#7F1D1D', '#FDE68A');
    // (the catering truck behind its counter)
    box(c, X(5190), BACK_Y - 230, 280, 230, '#000'); box(c, X(5192), BACK_Y - 228, 276, 226, '#E7E5E4');
    box(c, X(5220), BACK_Y - 200, 210, 70, '#0C0A09'); box(c, X(5220), BACK_Y - 212, 210, 12, '#B91C1C');
    words(c, 'CATERING', X(5325), BACK_Y - 214, enamel(10, '#FEF3C7'));
    // (the director's chair; the call sheet board, Steve's headshot pinned to it)
    box(c, X(5640), BACK_Y - 70, 50, 8, '#78350F'); box(c, X(5640), BACK_Y - 110, 50, 30, '#18181B'); words(c, 'DIRECTOR', X(5665), BACK_Y - 92, print(1, '#F8FAFC'));
    box(c, X(5644), BACK_Y - 64, 4, 64, '#78350F'); box(c, X(5682), BACK_Y - 64, 4, 64, '#78350F');
    box(c, X(5500), BACK_Y - 190, 110, 90, '#000'); box(c, X(5502), BACK_Y - 188, 106, 86, '#A16207');
    box(c, X(5510), BACK_Y - 180, 40, 54, '#F8FAFC'); box(c, X(5560), BACK_Y - 178, 40, 50, '#FEF3C7');
    words(c, 'CALL SHEET', X(5530), BACK_Y - 168, print(1, '#18181B'));
    words(c, 'STEVE', X(5580), BACK_Y - 116, print(1, '#7F1D1D'));
    words(c, 'CALL ME', X(5580), BACK_Y - 106, print(1, '#7F1D1D'));
    box(c, X(5503), BACK_Y - 102, 4, 102, '#57534E'); box(c, X(5603), BACK_Y - 102, 4, 102, '#57534E');
  }
  // SET 3: the mothership
  if (v(6300, 8200)) {
    greenScreen(c, X(6340), X(8160), 400);
    for (const [pa, pb] of [[6420, 6980], [7620, 8100]]) {
      box(c, X(pa), BACK_Y - 300, X(pb) - X(pa), 300, '#000'); box(c, X(pa) + 2, BACK_Y - 298, X(pb) - X(pa) - 4, 296, '#52525B');
      for (let x = X(pa) + 20; x < X(pb) - 20; x += 60) { box(c, x, BACK_Y - 280, 40, 260, '#3F3F46'); box(c, x + 16, BACK_Y - 240, 8, 8, (state.frame + x) % 60 < 30 ? '#22D3EE' : '#0E7490'); }
    }
    standSign(c, X(7000), BACK_Y + 10, ['PYRO: HOT SET', 'REAL FIRE. FAKE SPACESHIP.'], '#7C2D12', '#FDE047');
    banner(c, X(7330), BACK_Y - 420, 360, 60, 'REVENGERS: RESEMBLE', 'PART 19 OF 40', '#1E3A8A', '#FDE047');
    // (the camera crane's dolly at its foot)
    box(c, X(6800), BACK_Y - 30, 90, 30, '#27272A'); box(c, X(6840), BACK_Y - 160, 10, 130, '#3F3F46');
  }
  // SET 4: the battle of New New York
  if (v(8200, 9600)) {
    skyline(c, X(8300), X(9520), 400, true);
    banner(c, X(8900), BACK_Y - 430, 380, 60, 'THE BATTLE OF NEW NEW YORK', 'THE 11TH TIME', '#7C2D12', '#FDE047');
    for (const rx of [8620, 9180, 9400]) { box(c, X(rx), BACK_Y - 30, 70, 30, '#57534E'); box(c, X(rx) + 10, BACK_Y - 46, 40, 18, '#78716C'); }
  }
  // The cast's holding area: the trailers' doors, the sign, the rope
  if (v(9450, 10000)) {
    for (const [rx, who] of [[9460, 'SUPERBMAN'], [9560, 'GROAT'], [9840, 'BATTMAN']] as const) {
      box(c, X(rx), BACK_Y - 130, 80, 130, '#000'); box(c, X(rx) + 2, BACK_Y - 128, 76, 128, '#E7E5E4');
      box(c, X(rx) + 18, BACK_Y - 110, 44, 110, '#78716C'); box(c, X(rx) + 8, BACK_Y - 124, 64, 12, '#FDE047');
      words(c, who, X(rx) + 40, BACK_Y - 115, print(1, '#18181B'));
      box(c, X(rx) + 32, BACK_Y - 104, 16, 16, '#FDE047');
    }
    standSign(c, X(REFILL + 70), BACK_Y + 10, ['PRINCIPAL CAST ONLY', 'BEYOND THIS POINT. NO EXCEPTIONS.'], '#7F1D1D', '#FDE68A');
  }
};

/** The main stage: its door, the cyc, the banner, the bulldozer at the back, the script, the far wall. */
const mainStage = (c: Ctx, state: GameState) => {
  const o = whOf(state), F = o.fight, f = state.frame;
  if (!inView(state, X(ARENA.a) - 200, x1 + 200)) return;
  const v = (a: number, b: number) => inView(state, X(a), X(b));
  if (v(ARENA.a - 50, ARENA.b + 50)) {
    greenScreen(c, X(ARENA.a + 30), X(ARENA.b - 8), 430);
    banner(c, X((ARENA.a + ARENA.b) / 2), BACK_Y - 470, 560, 70, "REVENGERS: END-OF-THE-WORLD'S-DAY", 'REVENGERS: RESEMBLE', '#18181B', '#FDE047');
  }
  // The stage door: its frame always; the door down behind him while they're at him
  if (v(9900, 10010)) {
    const dx = X(ARENA.a) - 34, top = ROOF_Y + 120;
    box(c, dx - 14, top - 30, 62, 30, '#27272A'); words(c, 'MAIN STAGE', dx + 17, top - 12, print(1, '#FDE047'));
    box(c, dx - 14, top, 10, GY - top, '#3F3F46'); box(c, dx + 38, top, 10, GY - top, '#3F3F46');
    const bot = top + (GY - top) * F.doorK;
    if (F.doorK > 0.01) {
      box(c, dx - 4, top, 42, bot - top, '#000'); box(c, dx - 3, top, 40, bot - top - 1, '#71717A');
      for (let y = top + 6; y < bot - 2; y += 8) box(c, dx - 3, y, 40, 2, '#52525B');
      box(c, dx - 3, bot - 8, 40, 8, '#FACC15');
    }
  }
  // The bulldozer, parked at the back (set back: it's not in his way), till it goes
  const dz = dozerX(state);
  if (dz !== null && !endingOn(state) && v(DOZER_X - 200, DOZER_X + 200)) {
    c.save(); c.translate(dz, BACK_Y + 22); c.scale(0.82, 0.82); c.translate(-dz, -GY);
    drawDozer(c, dz, f, false);
    c.restore();
    words(c, 'KEYS IN IT', dz - 30, BACK_Y - 140, print(1, '#FDE68A'));
  }
  // THE SCRIPT, the showpiece, at the back of the stage (scenery: nothing to stand on or bump into): its plinth, the
  // case on it under its light, the velvet ropes, the laser grid, its marquee. Knocked over (the ending): the case
  // tipping off the back of the plinth, the glass gone, empty
  if (v(CASE_X - 200, CASE_X + 200)) {
    const cx = X(CASE_X), foot = BACK_Y + 20, top = foot - 84, tip = caseTip(state), down = caseDown(state);
    c.fillStyle = 'rgba(254, 249, 195, 0.14)'; c.beginPath(); c.moveTo(cx - 20, ROOF_Y + 10); c.lineTo(cx + 20, ROOF_Y + 10); c.lineTo(cx + 100, foot + 12); c.lineTo(cx - 100, foot + 12); c.closePath(); c.fill();
    // (the ropes round it, the laser grid between their posts)
    if (!down) {
      velvetRope(c, cx - 110, cx + 110, foot + 10);
      for (let k = 0; k < 3; k++) { c.fillStyle = (f + k * 7) % 30 < 24 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(239, 68, 68, 0.25)'; c.fillRect(cx - 110, foot - 4 - k * 9, 220, 1); }
    } else for (let k = 0; k < 4; k++) box(c, cx - 110 + k * 72, foot + 4, 6, 6, '#CA8A04');
    // (the plinth: marble, DO NOT TOUCH; dimmed, set back: it's scenery, not a ledge)
    box(c, cx - 42, top, 84, foot - top, '#000'); box(c, cx - 40, top + 2, 80, foot - top - 2, '#8F8984');
    box(c, cx - 46, top - 6, 92, 10, '#000'); box(c, cx - 45, top - 5, 90, 8, '#A8A29E');
    box(c, cx - 36, top + 14, 72, 2, '#A8A29E');
    words(c, 'DO NOT TOUCH', cx, top + 44, print(1, '#57534E'));
    // (the case on it: glass, the script inside, its cover; tipping off the back right corner as it goes)
    c.save(); c.translate(cx + 34, top - 1); c.rotate(tip * 1.45);
    const gx = -68, gy = -78;
    box(c, gx, gy, 68, 78, `rgba(186, 230, 253, ${down ? 0.18 : 0.35})`); c.strokeStyle = '#E0F2FE'; c.lineWidth = 2; c.strokeRect(gx, gy, 68, 78);
    if (!down || tip < 0.6) {
      box(c, gx + 14, gy + 26, 40, 50, '#000'); box(c, gx + 16, gy + 28, 36, 46, '#7F1D1D');
      words(c, 'REVENGERS', gx + 34, gy + 40, print(1, '#FDE047'));
      words(c, 'EOTWD', gx + 34, gy + 50, print(1, '#FEF3C7'));
      words(c, 'DO NOT LEAK', gx + 34, gy + 66, print(1, '#FCA5A5'));
    }
    box(c, gx + 4, gy + 4, 6, 30, 'rgba(255, 255, 255, 0.5)');
    c.restore();
    if (down) for (let k = 0; k < 14; k++) box(c, cx - 70 + ((k * 43) % 200), foot + 2 - (k % 3) * 3, 5, 3, '#E0F2FE');
    words(c, 'THE SCRIPT', cx, top - 140, marquee(2, 2, down ? '#78716C' : '#FDE047', !down && f % 40 < 32));
  }
  // The pages all over the stage, after
  if (caseDown(state)) for (let rx = ARENA.a + 30; rx < ARENA.b - 10; rx += 37 + (rx % 23)) if (inView(state, X(rx), X(rx) + 12)) box(c, X(rx), GY - 4 - (rx % 3) * 2 - (rx % 5) * 9, 12, 4, '#F5F5F4');
  // The far wall: the one still up; then smashed open
  if (v(FAR_WALL - 100, FAR_WALL + 900)) {
    const wx = X(FAR_WALL), top = ROOF_Y;
    box(c, wx, top, x1 + 400 - wx, GY - top, '#44403C');
    for (let x = wx; x < x1 + 400; x += 14) box(c, x, top, 3, GY - top, '#3F3B37');
    box(c, wx, top, 6, GY - top, '#57534E');
    if (wallOpen(state)) {
      // (the hole: daylight through it, jagged; the siding torn outward with the rebar)
      // (right through it, out to the daylight: jagged round its edges)
      const far = x1 + 400;
      c.fillStyle = '#BAE6FD'; c.beginPath(); c.moveTo(wx - 2, GY); c.lineTo(wx + 6, GY - 90); c.lineTo(wx - 4, GY - 170); c.lineTo(wx + 10, GY - 236);
      for (let x = wx + 10, k = 0; x < far; x += 26, k++) c.lineTo(x, GY - 236 + (k % 2 ? 14 : 0));
      c.lineTo(far, GY); c.closePath(); c.fill();
      box(c, wx + 2, GY - 40, far - wx, 40, '#A8A29E');
      c.strokeStyle = '#7C2D12'; c.lineWidth = 2; c.beginPath();
      for (const y of [GY - 200, GY - 130, GY - 60]) { c.moveTo(wx + 2, y); c.quadraticCurveTo(wx + 20, y - 10, wx + 30, y + 12); }
      c.stroke();
      for (let k = 0; k < 10; k++) box(c, wx - 60 + k * 14, GY - 8 - (k % 3) * 4, 10, 8, k % 2 ? '#78716C' : '#A8A29E');
      words(c, 'THIS WAY OUT', wx - 60, GY - 260, print(1, '#FDE68A'));
    } else {
      words(c, 'FIRE EXIT (BRICKED UP)', wx - 90, GY - 300, print(1, '#E7E5E4'));
    }
  }
};

/** The studio lights and the signs, lit after dark (through the open walls). */
export const warehouseLamps = (): Light[] => [
  ...LIGHTS.map(([rx]) => ({ x: X(rx), y: ROOF_Y + 110, r: 260, a: 0.9, color: '#FEF9C3' })),
  { x: X(CASE_X), y: BACK_Y - 120, r: 260, a: 1, color: '#FEF08A' },
  { x: X(5325), y: BACK_Y - 214, r: 180, a: 0.7, color: '#FDE68A' },
  { x: X((ARENA.a + ARENA.b) / 2), y: BACK_Y - 470, r: 300, a: 0.7, color: '#FDE047' },
];
