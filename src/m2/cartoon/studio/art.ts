// LEARN THE MAGIC OF HOW CARTOONS ARE MADE, painted (crude-but-clean first pass). One long building cut away along
// its back: the path in front (carpet, a lit lip, little blue aisle lights along it), behind a velvet rope the rooms as
// dioramas going back to their back walls, every room's walls, floor and ceiling drawn to the one eye (the middle of the
// screen: straight walls, one shared eye, the far things smaller and nearer the middle; back to front, nothing deeper
// drawn over anything nearer), culled by where they land on screen. Each room's tableau: its back wall, then the
// people and things in it; the engine's lighting does the rest (each room dim till he walks in, then soft fills come
// up on it: lights in studioLights below, never a spotlight).
//
// On the path, bright and inked, everything he stands on lit along its top: the flat file, the drafting table, the
// rolling storyboard wall and the box of pencils; the drying rack's track and its cel; the light tables at the reject
// pile's ends and the STACKS OF DRAWINGS in it (the land's towers, sway.ts, in paper: reams and bundles, rubber bands,
// scene labels); the paint vat and the cels on their overhead track; the camera crane and its seat, the wall of film
// cans and the crate; the projection screen at the end (in front of him once he's in behind it: his shadow on it).
// The signs: the lobby's marquee hung off the ceiling on chains, a numbered placard on a brass stand at every room,
// the park's banner over the night shift. The PA's horns on the ceiling (buzzing while it's on).

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { signText, signW, type Look } from '../../signLetters';
import { stamp } from '../../../m1/game/render/stamp';
import { part, px, ball, flat, limb, dk, bodyOf, headShape, faceOn, hairTop, hairBack, glasses, whiskers, INK as SINK } from '../../spooky/costume';
import { box, mix, hash, toonLetters, INK, type Ctx } from '../kit';
import type { Tower } from '../sway';
import { GY } from '../geometry';
import { studioOf } from './state';
import { moverAt, paintAt } from './props';
import {
  ROOMS, CEIL, CEIL_H, D_BACK, D_PROPS, D_RAIL, REJECTS, VAT, GROUND, FLATFILE, STORYWALL, PENCILBOX, DRAFTING, SHELF,
  NEAR_DESK, FAR_DESK, FILMCANS, CRATE, MOVERS, TRACK_H, SCREEN, X, Y, type Room,
} from './layout';

// ---------------------------------------------------------------------------------------------------------------
// The eye

type P = { x: number; y: number };
const eyeOf = (state: GameState): P => ({ x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT / 2 });
const proj = (E: P, x: number, y: number, s: number): P => ({ x: E.x + (x - E.x) * s, y: E.y + (y - E.y) * s });
/** Draws `fn` (in world coordinates) pushed back to depth s about the eye. */
const atDepth = (c: Ctx, E: P, s: number, fn: () => void) => { c.save(); c.translate(E.x, E.y); c.scale(s, s); c.translate(-E.x, -E.y); fn(); c.restore(); };
/** Does world x0..x1 at depth s land on screen? */
const seen = (state: GameState, E: P, x0: number, x1: number, s: number, m = 40) => { const a = proj(E, x0, 0, s).x, b = proj(E, x1, 0, s).x; return b > state.camera.x - m && a < state.camera.x + CANVAS_WIDTH + m; };
const quad = (c: Ctx, pts: P[], fill: string) => { c.beginPath(); c.moveTo(pts[0].x, pts[0].y); for (const p of pts.slice(1)) c.lineTo(p.x, p.y); c.closePath(); c.fillStyle = fill; c.fill(); };

const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');
/** The park's letters (fat, bouncing); small dark print; a marker's scrawl. */
const park = (cell = 2, fill?: string[]) => toonLetters(cell, fill);
const PRINT = (col = '#2A1A0E'): Look => ({ sx: 1, sy: 1, fill: col });
const MARKER = (col: string, seed = 0): Look => ({ sx: 1, sy: 1, fill: col, wobble: 1, seed });

// ---------------------------------------------------------------------------------------------------------------
// The people in the tableaux (scenery: still, or barely moving)

const ASIAN_SKIN = ['#F3D2B3', '#EBC29C', '#E0B48A', '#D9A877', '#F0C8A2', '#E6BC94'];
const ASIAN_HAIR = ['#141414', '#1F1611', '#2B1D14', '#18120E'];
/** Someone sat at a desk to their right, from the hip on the seat at (0, 0): hunched over, the near hand out on the
 *  desk (`reach` px), the head bent (`nod` 0..1; 1 asleep on the desk). `drawing` a pencil in the hand. */
const sitter = (g: Ctx, seed: number, o: { shirt: string; pants?: string; reach?: number; nod?: number; asian?: boolean; drawing?: boolean; hand?: number; yawn?: boolean; cap?: string }) => {
  const B = bodyOf(seed, 'stand', 0);
  if (o.asian) { B.L.skin = ASIAN_SKIN[seed % ASIAN_SKIN.length]; B.L.hair = ASIAN_HAIR[(seed >> 2) % ASIAN_HAIR.length]; B.L.bald = false; if (B.L.face === 1 || B.L.face === 2) B.L.face = (seed % 2) ? 3 : 0; }
  const L = B.L, nod = o.nod ?? 0.3;
  g.save();
  // (the chair: a plain office chair)
  part(g, () => g.rect(-14, -2, 24, 5), '#3F3F46', -14, -2, 24, 5, 1);
  part(g, () => g.rect(-16, -34, 5, 34), '#3F3F46', -16, -34, 5, 34, 1);
  px(g, -2, 3, 3, 16, '#27272A'); px(g, -10, 18, 20, 3, '#27272A');
  // (legs: the thigh out along the seat, the shin down, a shoe)
  limb(g, 0, -2, 18, -2, B.legW, o.pants ?? '#334155'); limb(g, 18, -2, 20, 18, B.legW - 0.5, o.pants ?? '#334155');
  part(g, () => g.roundRect(18, 16, 10, 4, 1.5), '#1C1917', 18, 16, 10, 4, 1);
  // (the body hunched toward the desk)
  const lean = 6 + nod * 10;
  g.translate(0, -2); g.rotate(0.18 + nod * 0.35); g.translate(0, 2);
  part(g, () => { g.moveTo(-B.hipW / 2, 0); g.lineTo(-B.w / 2 + 2, -24); g.quadraticCurveTo(0, -28, B.w / 2, -24); g.lineTo(B.hipW / 2, 0); g.closePath(); }, o.shirt, -B.w / 2, -28, B.w, 28);
  const hb = { ...B, hx: 3 + lean * 0.3, hy: -34 + nod * 4 };
  hairBack(g, hb);
  headShape(g, hb, L.skin);
  faceOn(g, hb, { skin: L.skin, eyes: nod > 0.9 ? 'closed' : o.yawn ? 'closed' : 'tired', mouth: o.yawn ? 'o' : 'flat', look: 0.9 });
  glasses(g, hb); whiskers(g, hb); hairTop(g, hb);
  if (o.cap) { part(g, () => { g.moveTo(hb.hx - 9, hb.hy - 4); g.quadraticCurveTo(hb.hx, hb.hy - 15, hb.hx + 9, hb.hy - 4); g.closePath(); }, o.cap, hb.hx - 9, hb.hy - 15, 18, 11, 1); part(g, () => g.rect(hb.hx - 16, hb.hy - 6, 8, 3), o.cap, hb.hx - 16, hb.hy - 6, 8, 3, 1); }
  // (the near arm out on the desk, a pencil in the hand)
  const hx = 14 + (o.reach ?? 10) + (o.hand ?? 0), hy = -14 + nod * 6;
  limb(g, 4, -22, hx, hy, B.armW, o.shirt); ball(g, hx, hy, 3.4, L.skin, 1);
  if (o.drawing && nod < 0.9) { px(g, hx - 1, hy - 7, 1.5, 7, '#F2C230'); px(g, hx - 1, hy - 1, 1.5, 1.5, '#3F3F46'); }
  g.restore();
};
/** Someone seen behind a table (from the chest up over its edge, at (0, 0) the table's top), facing right-ish. */
const behind = (g: Ctx, seed: number, o: { shirt: string; cap?: string; asleep?: boolean; phone?: boolean; arms?: number; mouth?: 'grin' | 'flat' | 'o' | 'smirk' | 'talk' }) => {
  const B = bodyOf(seed, 'stand', 0), L = B.L;
  g.save();
  const hb = { ...B, hy: o.asleep ? -10 : -44 };
  if (o.asleep) { part(g, () => g.ellipse(-4, 2, 18, 5, 0, 0, Math.PI * 2), o.shirt, -22, -3, 36, 10, 1); }
  if (!o.asleep) part(g, () => { g.moveTo(-B.w / 2 - 2, -30); g.quadraticCurveTo(0, -36, B.w / 2 + 2, -30); g.lineTo(B.w / 2 + 4, 0); g.lineTo(-B.w / 2 - 4, 0); g.closePath(); }, o.shirt, -B.w / 2 - 4, -36, B.w + 8, 36);
  hairBack(g, hb); headShape(g, hb, L.skin);
  faceOn(g, hb, { skin: L.skin, eyes: o.asleep ? 'closed' : 'smug', mouth: o.asleep ? 'o' : o.mouth ?? 'grin' });
  glasses(g, hb); whiskers(g, hb); hairTop(g, hb);
  if (o.cap) { part(g, () => { g.moveTo(hb.hx - 9, hb.hy - 4); g.quadraticCurveTo(hb.hx, hb.hy - 15, hb.hx + 9, hb.hy - 4); g.closePath(); }, o.cap, hb.hx - 9, hb.hy - 15, 18, 11, 1); part(g, () => g.rect(hb.hx - 17, hb.hy - 6, 9, 3), o.cap, hb.hx - 17, hb.hy - 6, 9, 3, 1); }
  if (o.phone) { part(g, () => g.roundRect(hb.hx + 6, hb.hy - 4, 5, 16, 1), '#18181B', hb.hx + 6, hb.hy - 4, 5, 16, 1); px(g, hb.hx + 8, hb.hy - 12, 1, 8, '#18181B'); }
  g.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The rooms' shells (walls, floor, ceiling to the one eye) and their colors

interface Look3 { wall: string; floor: string; ceil: string; trim: string }
const SHELL: Record<string, Look3> = {
  lobby: { wall: '#3B1F5C', floor: '#0F5E63', ceil: '#2A1645', trim: '#F2C94C' },
  vision: { wall: '#5A3A22', floor: '#6B1F2A', ceil: '#2E1E14', trim: '#D4A84A' },
  writers: { wall: '#C9B98F', floor: '#6B6458', ceil: '#B8B3A6', trim: '#8C7F60' },
  storyboards: { wall: '#9C6B3E', floor: '#5B5249', ceil: '#B8B3A6', trim: '#6E4A2A' },
  voice: { wall: '#4B4F5C', floor: '#3A3D48', ceil: '#2E3038', trim: '#7C8496' },
  models: { wall: '#D8D4C8', floor: '#8C8578', ceil: '#C8C3B6', trim: '#9E978A' },
  overseas: { wall: '#7D927C', floor: '#6E7266', ceil: '#B9BBAE', trim: '#55654F' },
  inkpaint: { wall: '#AFC3CF', floor: '#79858C', ceil: '#C3CED4', trim: '#7F96A3' },
  camera: { wall: '#1C1C24', floor: '#26262E', ceil: '#141419', trim: '#3A3A46' },
  premiere: { wall: '#1E2A5A', floor: '#8E1B26', ceil: '#141B3A', trim: '#F2C94C' },
};

const shellBack = (c: Ctx, E: P, r: Room) => {
  const S = SHELL[r.id], a = X(r.a), b = X(r.b);
  // (the ceiling, going back: tiles in a grid)
  quad(c, [proj(E, a, CEIL, D_BACK), proj(E, b, CEIL, D_BACK), proj(E, b, CEIL, 1), proj(E, a, CEIL, 1)], S.ceil);
  c.strokeStyle = dk(S.ceil, 0.25); c.lineWidth = 1;
  for (const d of [0.84, 0.9, 0.96]) { const p0 = proj(E, a, CEIL, d), p1 = proj(E, b, CEIL, d); c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); }
  for (let x = r.a + 100; x < r.b; x += 100) { const p0 = proj(E, X(x), CEIL, D_BACK), p1 = proj(E, X(x), CEIL, 1); c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); }
  // (the floor in the room, going back to the rope)
  quad(c, [proj(E, a, GY, D_BACK), proj(E, b, GY, D_BACK), proj(E, b, GY, D_RAIL), proj(E, a, GY, D_RAIL)], S.floor);
  c.strokeStyle = dk(S.floor, 0.18);
  for (const d of [0.82, 0.86, 0.9]) { const p0 = proj(E, a, GY, d), p1 = proj(E, b, GY, d); c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); }
  // (the back wall: its color, a skirting board, a picture rail)
  atDepth(c, E, D_BACK, () => {
    box(c, a, CEIL, b - a, CEIL_H, S.wall);
    box(c, a, GY - 14, b - a, 14, dk(S.wall, 0.35)); box(c, a, GY - 15, b - a, 2, S.trim);
    box(c, a, CEIL + 40, b - a, 4, S.trim);
  });
};
/** A partition between two rooms at world x (from the back wall to `d1`), the face toward the eye in the color of the
 *  room it faces. */
const partition = (c: Ctx, E: P, x: number, d0: number, d1: number, faces: Room) => {
  const S = SHELL[faces.id];
  quad(c, [proj(E, x, CEIL, d0), proj(E, x, GY, d0), proj(E, x, GY, d1), proj(E, x, CEIL, d1)], dk(S.wall, 0.22));
  const t0 = proj(E, x, GY - 14, d0), t1 = proj(E, x, GY - 14, d1);
  c.strokeStyle = S.trim; c.lineWidth = 2; c.beginPath(); c.moveTo(t0.x, t0.y); c.lineTo(t1.x, t1.y); c.stroke();
};

// ---------------------------------------------------------------------------------------------------------------
// The tableaux: each room's back wall (still: stamped) and what's in it (the still bits stamped; what moves live)

const gilt = (g: Ctx, x: number, y: number, w: number, h: number, inner: string) => {
  part(g, () => g.rect(x - 7, y - 7, w + 14, h + 14), '#D4A84A', x - 7, y - 7, w + 14, h + 14, 1.4);
  box(g, x - 2, y - 2, w + 4, h + 4, '#7A5A1E'); box(g, x, y, w, h, inner);
};
const poster = (g: Ctx, x: number, y: number, w: number, h: number, bg: string) => { part(g, () => g.rect(x, y, w, h), bg, x, y, w, h, 1.4); };

const paintLobby = (g: Ctx, r: Room) => {
  const a = X(r.a);
  // (a 90s wall: zigzags and squiggles over the purple)
  for (let x = a; x < X(r.b); x += 60) for (let y = CEIL + 70; y < GY - 120; y += 70) {
    const k = hash(x * 0.37 + y); g.strokeStyle = k > 0.5 ? '#14B8A6' : '#F2C94C'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(x + 10, y); g.lineTo(x + 20, y - 10); g.lineTo(x + 30, y); g.lineTo(x + 40, y - 10); g.stroke();
    px(g, x + 44 * k, y + 26, 6, 6, k > 0.3 ? '#EC4899' : '#60A5FA');
  }
  box(g, a, GY - 120, X(r.b) - a, 106, '#2A1645');
  // (the front doors, out to the square: daylight through the glass, push bars, EXIT over them)
  const dx = X(40);
  box(g, dx - 8, GY - 250, 196, 250, '#1A1028');
  for (const k of [0, 1]) { box(g, dx + k * 92, GY - 242, 86, 240, '#FFF4C8'); box(g, dx + k * 92, GY - 242, 86, 240, 'rgba(147,197,253,0.35)'); px(g, dx + k * 92 + 8, GY - 120, 70, 6, '#C0C4CC'); px(g, dx + k * 92 + 10, GY - 236, 18, 200, 'rgba(255,255,255,0.4)'); }
  box(g, dx + 30, GY - 290, 120, 30, '#7F1D1D'); signText(g, 'EXIT', dx + 90, GY - 268, park(2, ['#FFFFFF', '#FECACA', '#FCA5A5', '#F87171']));
  signText(g, 'SILLYVILLE SQUARE', dx + 90, GY - 300, PRINT('#FDE68A'));
  // (posters: the visionary; the hot new show, teased)
  poster(g, X(300), GY - 330, 110, 150, '#0F172A');
  ball(g, X(355), GY - 270, 26, '#F0C8A2', 1.4); part(g, () => g.rect(X(330), GY - 300, 50, 12), '#4A2E1A', X(330), GY - 300, 50, 12, 1);
  px(g, X(343), GY - 274, 8, 5, '#111'); px(g, X(358), GY - 274, 8, 5, '#111'); px(g, X(346), GY - 255, 18, 6, '#4A2E1A');
  signText(g, 'MEET DAVE', X(355), GY - 220, PRINT('#FDE047')); signText(g, 'A VISIONARY', X(355), GY - 205, PRINT('#FFFFFF'));
  poster(g, X(470), GY - 330, 110, 150, '#111827');
  ball(g, X(525), GY - 270, 24, '#1F2937', 1.2); px(g, X(512), GY - 300, 8, 10, '#1F2937'); px(g, X(532), GY - 300, 8, 10, '#1F2937');
  px(g, X(515), GY - 274, 5, 4, '#FDE047'); px(g, X(530), GY - 274, 5, 4, '#FDE047');
  signText(g, 'THIS FALL', X(525), GY - 220, PRINT('#F472B6')); signText(g, 'SOMETHING WACKY', X(525), GY - 205, PRINT('#FFFFFF'));
  poster(g, X(640), GY - 300, 100, 60, '#F8FAFC'); signText(g, 'NO FLASH', X(690), GY - 276, PRINT('#B91C1C')); signText(g, 'PHOTOGRAPHY', X(690), GY - 262, PRINT('#B91C1C'));
};
const paintLobbyProps = (g: Ctx) => {
  // (the ticket podium; the queue's stanchions and switchback ropes; a fake ficus)
  part(g, () => g.rect(X(230), GY - 110, 70, 110), '#5B3A1E', X(230), GY - 110, 70, 110, 1.4);
  part(g, () => g.rect(X(222), GY - 122, 86, 14), '#7A4F2A', X(222), GY - 122, 86, 14, 1.2);
  signText(g, 'TOURS', X(265), GY - 70, PRINT('#FDE68A'));
  for (let i = 0; i < 5; i++) {
    const x = X(330 + i * 95);
    part(g, () => g.rect(x - 3, GY - 70, 6, 70), '#D4A84A', x - 3, GY - 70, 6, 70, 1); ball(g, x, GY - 72, 5, '#E5C158', 1);
    if (i < 4) { g.strokeStyle = SINK; g.lineWidth = 5; g.beginPath(); g.moveTo(x, GY - 64); g.quadraticCurveTo(x + 47, GY - 40, x + 95, GY - 64); g.stroke(); g.strokeStyle = '#9F1239'; g.lineWidth = 3; g.stroke(); }
  }
  part(g, () => g.rect(X(750), GY - 40, 34, 40), '#A16207', X(750), GY - 40, 34, 40, 1.2);
  for (let i = 0; i < 9; i++) ball(g, X(767) + Math.cos(i * 1.3) * 22, GY - 70 - Math.sin(i * 1.7) * 26 - i * 3, 11, i % 2 ? '#16A34A' : '#22C55E', 1);
};

const paintVision = (g: Ctx, r: Room) => {
  const a = X(r.a);
  // (walnut paneling)
  for (let x = a + 20; x < X(r.b); x += 80) { box(g, x, CEIL + 60, 64, GY - CEIL - 100, '#634127'); box(g, x, CEIL + 60, 3, GY - CEIL - 100, '#4A2F1A'); box(g, x + 61, CEIL + 60, 3, GY - CEIL - 100, '#7A5232'); }
  // (THE PORTRAIT: Dave, in oils, arms crossed, smug; his brass plate)
  const px0 = X(980), py0 = CEIL + 80;
  gilt(g, px0, py0, 200, 250, '#2B2F4A');
  const B = { ...bodyOf(4, 'stand', 0) };
  part(g, () => { g.moveTo(px0 + 30, py0 + 250); g.quadraticCurveTo(px0 + 100, py0 + 120, px0 + 170, py0 + 250); g.closePath(); }, '#141414', px0 + 30, py0 + 120, 140, 130, 1.4);
  ball(g, px0 + 100, py0 + 105, 42, '#F0C8A2', 1.6);
  part(g, () => g.ellipse(px0 + 100, py0 + 70, 44, 18, 0, Math.PI, 0), '#5B4636', px0 + 56, py0 + 52, 88, 18, 1.4);
  // (the ponytail out behind, round glasses, the goatee, the smirk)
  part(g, () => g.ellipse(px0 + 56, py0 + 104, 9, 26, 0.3, 0, Math.PI * 2), '#5B4636', px0 + 47, py0 + 78, 18, 52, 1.2);
  for (const ex of [86, 114]) { g.strokeStyle = SINK; g.lineWidth = 3; g.beginPath(); g.arc(px0 + ex, py0 + 104, 9, 0, Math.PI * 2); g.stroke(); px(g, px0 + ex - 2, py0 + 102, 4, 4, '#1A1A1A'); }
  px(g, px0 + 95, py0 + 113, 10, 4, '#C4936A');
  part(g, () => { g.moveTo(px0 + 88, py0 + 126); g.quadraticCurveTo(px0 + 100, py0 + 150, px0 + 112, py0 + 126); g.closePath(); }, '#5B4636', px0 + 88, py0 + 126, 24, 24, 1);
  g.strokeStyle = SINK; g.lineWidth = 2; g.beginPath(); g.moveTo(px0 + 90, py0 + 122); g.quadraticCurveTo(px0 + 104, py0 + 128, px0 + 114, py0 + 118); g.stroke();
  limb(g, px0 + 50, py0 + 200, px0 + 150, py0 + 205, 22, '#1F1F1F'); limb(g, px0 + 150, py0 + 195, px0 + 50, py0 + 210, 20, '#262626');
  void B;
  part(g, () => g.rect(px0 + 40, py0 + 272, 120, 22), '#C9A24A', px0 + 40, py0 + 272, 120, 22, 1);
  signText(g, 'DAVE. VISIONARY.', px0 + 100, py0 + 287, PRINT('#3B2A10'));
  // (the trophy shelves: gold pencils on stands, plaques)
  for (let k = 0; k < 3; k++) {
    const sy = CEIL + 150 + k * 90;
    part(g, () => g.rect(X(1440), sy, 280, 10), '#7A5232', X(1440), sy, 280, 10, 1.2);
    for (let i = 0; i < 6; i++) {
      const tx = X(1460 + i * 45), kind = (i + k) % 3;
      if (kind === 2) { part(g, () => g.rect(tx - 12, sy - 34, 26, 34), '#3F2A14', tx - 12, sy - 34, 26, 34, 1); part(g, () => g.rect(tx - 8, sy - 30, 18, 14), '#D4A84A', tx - 8, sy - 30, 18, 14, 0.8); }
      else { part(g, () => g.rect(tx - 8, sy - 10, 16, 10), '#2A2A2A', tx - 8, sy - 10, 16, 10, 1); part(g, () => { g.moveTo(tx - 3, sy - 10); g.lineTo(tx + 3, sy - 10); g.lineTo(tx + 3, sy - 40); g.lineTo(tx, sy - 48); g.lineTo(tx - 3, sy - 40); g.closePath(); }, '#E5B53A', tx - 3, sy - 48, 6, 38, 1); }
    }
  }
  signText(g, 'GOLDEN DOODLE AWARDS', X(1580), CEIL + 120, PRINT('#E5C158'));
  // (a framed quote)
  gilt(g, X(1250), CEIL + 120, 140, 70, '#F5EFDF');
  signText(g, '"I SEE THINGS."', X(1320), CEIL + 152, PRINT('#3B2A10')); signText(g, '- DAVE', X(1340), CEIL + 172, PRINT('#3B2A10'));
};
/** The napkin on its plinth under glass; Dave's desk and his chair (him: live, he drinks). */
const paintVisionProps = (g: Ctx) => {
  const nx = X(1220);
  // (the plinth: white marble)
  part(g, () => g.rect(nx - 40, GY - 120, 80, 120), '#E7E5E4', nx - 40, GY - 120, 80, 120, 1.4);
  part(g, () => g.rect(nx - 48, GY - 130, 96, 12), '#F5F5F4', nx - 48, GY - 130, 96, 12, 1.2);
  // (the glass case, the napkin in a gilt frame: a stick cat in ballpoint, a coffee ring)
  gilt(g, nx - 26, GY - 192, 52, 50, '#FAFAF9');
  g.strokeStyle = '#1D4ED8'; g.lineWidth = 1.5;
  g.beginPath(); g.arc(nx, GY - 172, 7, 0, Math.PI * 2); g.moveTo(nx - 5, GY - 178); g.lineTo(nx - 7, GY - 184); g.lineTo(nx - 2, GY - 179); g.moveTo(nx + 5, GY - 178); g.lineTo(nx + 7, GY - 184); g.lineTo(nx + 2, GY - 179);
  g.moveTo(nx, GY - 165); g.lineTo(nx, GY - 152); g.moveTo(nx - 8, GY - 160); g.lineTo(nx + 8, GY - 160); g.moveTo(nx, GY - 152); g.lineTo(nx - 5, GY - 146); g.moveTo(nx, GY - 152); g.lineTo(nx + 5, GY - 146); g.stroke();
  g.strokeStyle = 'rgba(146,64,14,0.55)'; g.lineWidth = 2; g.beginPath(); g.arc(nx + 12, GY - 156, 9, 0.3, Math.PI * 1.8); g.stroke();
  g.fillStyle = 'rgba(191,219,254,0.28)'; g.fillRect(nx - 40, GY - 214, 80, 84); g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1.5; g.strokeRect(nx - 40, GY - 214, 80, 84);
  px(g, nx - 34, GY - 210, 6, 60, 'rgba(255,255,255,0.45)');
  part(g, () => g.rect(nx - 30, GY - 80, 60, 18), '#C9A24A', nx - 30, GY - 80, 60, 18, 1);
  signText(g, 'THE NAPKIN', nx, GY - 70, PRINT('#3B2A10')); signText(g, '1993', nx, GY - 62, PRINT('#3B2A10'));
  // (the velvet rope round it)
  for (const sx of [-70, 70]) { part(g, () => g.rect(nx + sx - 3, GY - 60, 6, 60), '#D4A84A', nx + sx - 3, GY - 60, 6, 60, 1); }
  g.strokeStyle = SINK; g.lineWidth = 5; g.beginPath(); g.moveTo(nx - 70, GY - 54); g.quadraticCurveTo(nx, GY - 26, nx + 70, GY - 54); g.stroke(); g.strokeStyle = '#9F1239'; g.lineWidth = 3; g.stroke();
  // (Dave's desk: big, glossy, nothing on it but a trophy and his feet)
  const dx = X(1400);
  part(g, () => g.rect(dx, GY - 76, 190, 14), '#3B2414', dx, GY - 76, 190, 14, 1.4);
  part(g, () => g.rect(dx + 10, GY - 62, 46, 62), '#2E1C10', dx + 10, GY - 62, 46, 62, 1.2);
  part(g, () => g.rect(dx + 136, GY - 62, 46, 62), '#2E1C10', dx + 136, GY - 62, 46, 62, 1.2);
  part(g, () => g.rect(dx + 150, GY - 96, 12, 20), '#E5B53A', dx + 150, GY - 96, 12, 20, 1);
  part(g, () => g.rect(dx + 70, GY - 82, 50, 6), '#F5F5F4', dx + 70, GY - 82, 50, 6, 0.8);
  // (his chair: a big leather one, tipped back)
  part(g, () => g.roundRect(dx - 70, GY - 150, 44, 90, 8), '#1C1917', dx - 70, GY - 150, 44, 90, 1.4);
  part(g, () => g.rect(dx - 66, GY - 66, 54, 14), '#1C1917', dx - 66, GY - 66, 54, 14, 1.2);
  px(g, dx - 44, GY - 52, 4, 40, '#3F3F46'); px(g, dx - 64, GY - 14, 44, 4, '#3F3F46');
};
/** Dave himself (the animatronic): tipped back in his chair, his feet up on the desk, the mug up to his mouth every
 *  few seconds on a jerky arm. */
const drawDave = (c: Ctx, f: number) => {
  const dx = X(1400), sx = dx - 40, sy = GY - 66;
  // (legs up on the desk: the soles at us)
  limb(c, sx + 10, sy - 6, dx + 40, GY - 90, 9, '#1F2937'); limb(c, dx + 40, GY - 90, dx + 90, GY - 92, 8.5, '#1F2937');
  part(c, () => c.roundRect(dx + 88, GY - 104, 10, 16, 2), '#3B2414', dx + 88, GY - 104, 10, 16, 1);
  // (the body, tipped back: a black turtleneck)
  c.save(); c.translate(sx, sy); c.rotate(-0.35);
  part(c, () => { c.moveTo(-12, 0); c.lineTo(-12, -38); c.quadraticCurveTo(0, -44, 12, -38); c.lineTo(14, 0); c.closePath(); }, '#141414', -12, -44, 26, 44, 1.2);
  const B = bodyOf(4, 'stand', 0); B.L.skin = '#F0C8A2'; B.L.hair = '#5B4636'; B.L.bald = false;
  const hb = { ...B, hx: 2, hy: -52 };
  // (the ponytail)
  part(c, () => c.ellipse(-9, -46, 3.5, 10, 0.4, 0, Math.PI * 2), '#5B4636', -12, -56, 7, 20, 1);
  headShape(c, hb, B.L.skin);
  faceOn(c, hb, { skin: B.L.skin, eyes: 'smug', mouth: 'smirk' });
  for (const ex of [1, 7]) { c.strokeStyle = SINK; c.lineWidth = 1.4; c.beginPath(); c.arc(hb.hx + ex, hb.hy - 1, 3, 0, Math.PI * 2); c.stroke(); }
  part(c, () => c.ellipse(hb.hx + 4, hb.hy + 8, 4, 3, 0, 0, Math.PI * 2), '#5B4636', hb.hx, hb.hy + 5, 8, 6, 0.8);
  hairTop(c, hb, '#5B4636');
  // (the mug arm: down on his chest, then jerked up to his mouth (an animatronic: no easing), held, back down)
  const t = f % 260, up = t > 20 && t < 90;
  const hx = up ? hb.hx + 10 : 12, hy = up ? hb.hy + 4 : -24;
  limb(c, 6, -36, hx, hy, 6, '#141414'); ball(c, hx, hy, 3.5, B.L.skin, 1);
  part(c, () => c.rect(hx - 1, hy - 10, 11, 12), '#F8FAFC', hx - 1, hy - 10, 11, 12, 1);
  c.strokeStyle = SINK; c.lineWidth = 1.4; c.beginPath(); c.arc(hx + 11, hy - 4, 3, -1.2, 1.2); c.stroke();
  px(c, hx + 1, hy - 7, 7, 2, '#B91C1C');
  c.restore();
  // (the mug's words: up on its plaque by the desk, readable)
  void f;
};

const paintWriters = (g: Ctx, r: Room) => {
  const a = X(r.a);
  // (drop ceiling stains, a corkboard, the whiteboard of bits, the dartboard, the joke jar)
  for (let i = 0; i < 5; i++) px(g, a + 80 + i * 190, CEIL + 50 + (i % 2) * 6, 30, 12, 'rgba(120,90,40,0.25)');
  const wx = X(1880), wy = CEIL + 140;
  part(g, () => g.rect(wx - 8, wy - 8, 376, 216), '#9CA3AF', wx - 8, wy - 8, 376, 216, 1.4);
  box(g, wx, wy, 360, 200, '#F8FAFC');
  const scrawl: [string, number, number, string][] = [
    ['WACKY??', 20, 26, '#1D4ED8'], ['SOCKS = FUNNY?', 20, 52, '#111827'], ['CHELSEA BRACES JOKE', 20, 78, '#B91C1C'],
    ['CATCHPHRASE:', 20, 104, '#111827'], ['"MEOW-VAL OFFICE"', 30, 124, '#1D4ED8'], ['WACKY!!!', 210, 150, '#16A34A'],
    ['PIZZA?', 250, 30, '#B91C1C'], ['ELEVEN WRITERS', 200, 182, '#111827'],
  ];
  for (const [s, dx, dy, col] of scrawl) signText(g, s, wx + dx, wy + dy, MARKER(col, s.length), 'left');
  g.strokeStyle = '#B91C1C'; g.lineWidth = 2; g.beginPath(); g.moveTo(wx + 18, wy + 46); g.lineTo(wx + 140, wy + 46); g.stroke();
  g.beginPath(); g.ellipse(wx + 240, wy + 145, 56, 16, 0, 0, Math.PI * 2); g.stroke();
  px(g, wx + 10, wy + 200, 340, 6, '#9CA3AF'); for (let i = 0; i < 3; i++) px(g, wx + 30 + i * 14, wy + 196, 10, 4, ['#1D4ED8', '#B91C1C', '#111827'][i]);
  // (the corkboard: index cards)
  part(g, () => g.rect(X(2300), CEIL + 150, 220, 150), '#B07A46', X(2300), CEIL + 150, 220, 150, 1.4);
  for (let i = 0; i < 10; i++) { const cx = X(2312 + (i % 5) * 42), cy = CEIL + 162 + Math.floor(i / 5) * 66; box(g, cx, cy, 34, 48, i % 3 ? '#FEF9C3' : '#FFFFFF'); px(g, cx + 15, cy - 2, 4, 4, '#DC2626'); for (let l = 0; l < 4; l++) px(g, cx + 4, cy + 10 + l * 9, 24 - (l * 5) % 10, 2, '#64748B'); }
  // (the dartboard, darts nowhere near the middle)
  const bx = X(2640), by = CEIL + 200;
  ball(g, bx, by, 34, '#1C1917', 1.4); ball(g, bx, by, 26, '#F5F0E1', 1); ball(g, bx, by, 16, '#DC2626', 1); ball(g, bx, by, 6, '#16A34A', 1);
  for (const [ddx, ddy] of [[40, -30], [-46, 20], [30, 44]]) { px(g, bx + ddx, by + ddy, 10, 2, '#F2C230'); px(g, bx + ddx + 8, by + ddy - 2, 3, 6, '#DC2626'); }
  // (the joke jar on its shelf: one dollar in it)
  part(g, () => g.rect(X(2560), CEIL + 330, 160, 8), '#7A5232', X(2560), CEIL + 330, 160, 8, 1);
  g.fillStyle = 'rgba(191,219,254,0.5)'; g.fillRect(X(2600), CEIL + 296, 34, 34); g.strokeStyle = SINK; g.lineWidth = 1.5; g.strokeRect(X(2600), CEIL + 296, 34, 34);
  px(g, X(2606), CEIL + 318, 20, 9, '#4D7C0F');
  signText(g, 'JOKE JAR', X(2617), CEIL + 290, PRINT('#2A1A0E'));
};
const paintWritersProps = (g: Ctx) => {
  // (the long table and the writers behind it: caps on backward, flannel; one asleep; one on a brick phone)
  const ty = GY - 70;
  const who: [number, number, Parameters<typeof behind>[2]][] = [
    [2050, 11, { shirt: '#B91C1C', cap: '#1D4ED8', mouth: 'grin' }], [2160, 23, { shirt: '#14532D', asleep: true }],
    [2270, 7, { shirt: '#1E3A8A', cap: '#B91C1C', mouth: 'talk' }], [2380, 40, { shirt: '#7C2D12', phone: true, mouth: 'smirk' }],
    [2490, 15, { shirt: '#4B5563', cap: '#111827', mouth: 'grin' }],
  ];
  for (const [rx, seed, o] of who) { g.save(); g.translate(X(rx), ty); behind(g, seed * 13 + 2, o); g.restore(); }
  // (flannel: a check over the shirts)
  part(g, () => g.rect(X(1990), ty, 580, 14), '#8B6B4A', X(1990), ty, 580, 14, 1.4);
  px(g, X(2000), ty + 14, 8, GY - ty - 14, '#5B4636'); px(g, X(2552), ty + 14, 8, GY - ty - 14, '#5B4636');
  // (pizza boxes, a slice gone; soda cans; a sign)
  part(g, () => g.rect(X(2110), ty - 6, 70, 6), '#D6B98C', X(2110), ty - 6, 70, 6, 1);
  part(g, () => { g.moveTo(X(2116), ty - 7); g.lineTo(X(2172), ty - 7); g.lineTo(X(2160), ty - 16); g.lineTo(X(2128), ty - 16); g.closePath(); }, '#F59E0B', X(2116), ty - 16, 56, 9, 1);
  for (let i = 0; i < 4; i++) part(g, () => g.rect(X(2220 + i * 70), ty - 16, 8, 16), ['#DC2626', '#16A34A', '#2563EB', '#DC2626'][i], X(2220 + i * 70), ty - 16, 8, 16, 1);
  part(g, () => g.rect(X(2420), ty - 26, 90, 22), '#F8FAFC', X(2420), ty - 26, 90, 22, 1);
  signText(g, 'QUIET PLEASE', X(2465), ty - 12, PRINT('#B91C1C'));
};
/** The nerf ball (live), thrown up and caught by the writer on the end. */
const drawWritersLive = (c: Ctx, f: number) => {
  const t = (f % 70) / 70, x = X(2490) + 8, y = GY - 120 - Math.sin(t * Math.PI) * 60;
  ball(c, x, y, 5, '#F97316', 1);
};

const paintStoryboards = (g: Ctx, r: Room) => {
  const a = X(r.a);
  // (corkboard, wall to wall, pinned with panels: circles and lines, a cat, the White House, arrows)
  part(g, () => g.rect(a + 30, CEIL + 70, X(r.b) - a - 60, 330), '#B07A46', a + 30, CEIL + 70, X(r.b) - a - 60, 330, 1.4);
  for (let row = 0; row < 4; row++) for (let i = 0; i < 12; i++) {
    const cx = a + 50 + i * 78, cy = CEIL + 86 + row * 78, k = (row * 12 + i) % 6;
    if (cx > X(r.b) - 90) continue;
    box(g, cx, cy, 64, 46, '#FAFAF9'); px(g, cx + 30, cy - 3, 4, 4, ['#DC2626', '#2563EB', '#16A34A'][(i + row) % 3]);
    g.strokeStyle = '#334155'; g.lineWidth = 1.2; g.beginPath();
    if (k === 0) { g.arc(cx + 32, cy + 16, 6, 0, Math.PI * 2); g.moveTo(cx + 32, cy + 22); g.lineTo(cx + 32, cy + 34); g.moveTo(cx + 24, cy + 28); g.lineTo(cx + 40, cy + 28); g.moveTo(cx + 32, cy + 34); g.lineTo(cx + 26, cy + 42); g.moveTo(cx + 32, cy + 34); g.lineTo(cx + 38, cy + 42); }
    else if (k === 1) { g.arc(cx + 32, cy + 24, 11, 0, Math.PI * 2); g.moveTo(cx + 24, cy + 16); g.lineTo(cx + 22, cy + 6); g.lineTo(cx + 29, cy + 13); g.moveTo(cx + 40, cy + 16); g.lineTo(cx + 42, cy + 6); g.lineTo(cx + 35, cy + 13); }
    else if (k === 2) { g.moveTo(cx + 10, cy + 40); g.lineTo(cx + 54, cy + 40); g.moveTo(cx + 14, cy + 20); g.lineTo(cx + 32, cy + 10); g.lineTo(cx + 50, cy + 20); for (let p = 0; p < 4; p++) { g.moveTo(cx + 18 + p * 9, cy + 22); g.lineTo(cx + 18 + p * 9, cy + 40); } }
    else if (k === 3) { g.moveTo(cx + 10, cy + 23); g.lineTo(cx + 50, cy + 23); g.lineTo(cx + 42, cy + 15); g.moveTo(cx + 50, cy + 23); g.lineTo(cx + 42, cy + 31); }
    else if (k === 4) { g.rect(cx + 12, cy + 10, 40, 26); g.moveTo(cx + 12, cy + 10); g.lineTo(cx + 52, cy + 36); }
    else { g.arc(cx + 22, cy + 24, 6, 0, Math.PI * 2); g.arc(cx + 44, cy + 24, 6, 0, Math.PI * 2); }
    g.stroke();
    signText(g, ['SC 1', 'PAN', 'ZOOM', 'CUT', 'WACKY', 'SC 2'][k], cx + 32, cy + 56, PRINT('#2A1A0E'));
  }
};
const paintStoryboardsProps = (g: Ctx) => {
  // (a board artist at his drafting table: drawing stick figures, feet up, a coffee)
  g.save(); g.translate(X(3560), GY - 40); sitter(g, 61, { shirt: '#0E7490', drawing: true, reach: 12, nod: 0.1, cap: '#1C1917' }); g.restore();
  part(g, () => { g.moveTo(X(3590), GY - 56); g.lineTo(X(3660), GY - 76); g.lineTo(X(3662), GY - 70); g.lineTo(X(3592), GY - 50); g.closePath(); }, '#F5F0E1', X(3590), GY - 76, 72, 26, 1.2);
  px(g, X(3620), GY - 52, 4, 52, '#3F3F46');
  part(g, () => g.rect(X(3660), GY - 70, 8, 10), '#F8FAFC', X(3660), GY - 70, 8, 10, 1);
};

const paintVoice = (g: Ctx, r: Room) => {
  const a = X(r.a);
  // (egg-crate foam on every wall)
  for (let x = a + 10; x < X(r.b) - 10; x += 22) for (let y = CEIL + 60; y < GY - 30; y += 22) {
    box(g, x, y, 20, 20, (((x - a) / 22 + (y - CEIL) / 22) | 0) % 2 ? '#555A68' : '#464A57');
    px(g, x + 4, y + 4, 6, 6, '#5F6474');
  }
  // (gold records on the wall)
  for (let i = 0; i < 3; i++) { const gx = X(4480 + i * 100); gilt(g, gx, CEIL + 110, 70, 80, '#0F0F12'); ball(g, gx + 35, CEIL + 150, 26, '#E5B53A', 1); ball(g, gx + 35, CEIL + 150, 6, '#B91C1C', 0.8); }
};
const paintVoiceProps = (g: Ctx) => {
  // (THE BOOTH: a box with a big window; inside, the star at the mic in sunglasses, a gold chain, a leather jacket)
  const bx = X(3960), bw = 380, bt = GY - 300;
  part(g, () => g.rect(bx, bt, bw, 300), '#2E3038', bx, bt, bw, 300, 1.6);
  box(g, bx + 30, bt + 40, bw - 60, 170, '#0E1A24');
  // (the star)
  const sx = bx + 160, sy = bt + 210;
  const B = bodyOf(17, 'stand', 0); B.L.skin = '#D9A877'; B.L.hair = '#141414';
  part(g, () => { g.moveTo(sx - 20, sy); g.lineTo(sx - 18, sy - 60); g.quadraticCurveTo(sx, sy - 68, sx + 18, sy - 60); g.lineTo(sx + 20, sy); g.closePath(); }, '#1C1917', sx - 20, sy - 68, 40, 68, 1.4);
  const hb = { ...B, hx: sx + 2, hy: sy - 80 };
  // (big 90s hair)
  ball(g, sx, sy - 88, 18, '#141414', 1.2);
  headShape(g, hb, B.L.skin);
  faceOn(g, hb, { skin: B.L.skin, eyes: 'smug', mouth: 'o' });
  part(g, () => g.roundRect(hb.hx - 4, hb.hy - 4, 16, 5, 2), '#0B0B0B', hb.hx - 4, hb.hy - 4, 16, 5, 0.9);
  g.strokeStyle = '#E5B53A'; g.lineWidth = 2; g.beginPath(); g.arc(sx, sy - 62, 9, 0.3, Math.PI - 0.3); g.stroke();
  // (headphones; the mic on its stand, the pop filter; the script on its stand: MEOW. (TAKE 40))
  g.strokeStyle = SINK; g.lineWidth = 2.4; g.beginPath(); g.arc(hb.hx, hb.hy - 2, 11, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  part(g, () => g.roundRect(hb.hx - 12, hb.hy - 4, 5, 9, 2), '#27272A', hb.hx - 12, hb.hy - 4, 5, 9, 1);
  px(g, sx + 44, sy - 90, 3, 90, '#71717A'); part(g, () => g.roundRect(sx + 28, sy - 100, 10, 18, 4), '#3F3F46', sx + 28, sy - 100, 10, 18, 1);
  g.strokeStyle = '#A1A1AA'; g.lineWidth = 1; g.beginPath(); g.arc(sx + 22, sy - 92, 9, 0, Math.PI * 2); g.stroke();
  px(g, sx + 80, sy - 60, 3, 60, '#71717A'); part(g, () => g.rect(sx + 62, sy - 92, 42, 32), '#F8FAFC', sx + 62, sy - 92, 42, 32, 1);
  signText(g, 'MEOW.', sx + 83, sy - 78, PRINT('#111827')); signText(g, 'TAKE 40', sx + 83, sy - 66, PRINT('#B91C1C'));
  // (the glass over it, a glint)
  g.fillStyle = 'rgba(147,197,253,0.18)'; g.fillRect(bx + 30, bt + 40, bw - 60, 170);
  px(g, bx + 50, bt + 50, 10, 150, 'rgba(255,255,255,0.25)'); px(g, bx + 66, bt + 50, 4, 150, 'rgba(255,255,255,0.18)');
  part(g, () => g.rect(bx + 26, bt + 36, bw - 52, 6), '#1C1C24', bx + 26, bt + 36, bw - 52, 6, 1);
  // (the RECORDING box over the door)
  part(g, () => g.rect(bx + bw / 2 - 60, bt - 36, 120, 28), '#3F0A0A', bx + bw / 2 - 60, bt - 36, 120, 28, 1.4);
  signText(g, 'RECORDING', bx + bw / 2, bt - 15, park(1, ['#FFFFFF', '#FECACA', '#F87171', '#DC2626']));
  // (the engineer at the desk: faders, knobs; the director's chair for TALENT; craft services)
  const cx = X(4440);
  part(g, () => { g.moveTo(cx, GY - 60); g.lineTo(cx + 240, GY - 60); g.lineTo(cx + 230, GY - 90); g.lineTo(cx + 10, GY - 90); g.closePath(); }, '#3A3D48', cx, GY - 90, 240, 30, 1.4);
  part(g, () => g.rect(cx + 8, GY - 60, 224, 60), '#2B2D35', cx + 8, GY - 60, 224, 60, 1.2);
  for (let i = 0; i < 18; i++) { px(g, cx + 20 + i * 12, GY - 86, 2, 20, '#18181B'); px(g, cx + 18 + i * 12, GY - 80 + (i * 7) % 12, 6, 4, i % 4 ? '#D4D4D8' : '#DC2626'); }
  g.save(); g.translate(cx - 30, GY - 40); sitter(g, 88, { shirt: '#4B5563', reach: 20, nod: 0.25 }); g.restore();
  // (the director's chair)
  const dc = X(4720);
  part(g, () => g.rect(dc - 18, GY - 90, 40, 24), '#1C1917', dc - 18, GY - 90, 40, 24, 1.2);
  signText(g, 'TALENT', dc + 2, GY - 74, PRINT('#F8FAFC'));
  part(g, () => g.rect(dc - 18, GY - 56, 40, 6), '#1C1917', dc - 18, GY - 56, 40, 6, 1);
  limb(g, dc - 14, GY - 50, dc + 18, GY, 3, '#8B6B4A'); limb(g, dc + 18, GY - 50, dc - 14, GY, 3, '#8B6B4A');
};
/** The VU meters on the desk (live: bouncing to the meows). */
const drawVoiceLive = (c: Ctx, f: number) => {
  const cx = X(4440);
  for (let i = 0; i < 2; i++) {
    const mx = cx + 70 + i * 60, my = GY - 128;
    part(c, () => c.rect(mx, my, 44, 30), '#F5E6B8', mx, my, 44, 30, 1.2);
    const a = -2.4 + (0.5 + 0.5 * Math.sin(f * 0.21 + i * 1.7) * Math.sin(f * 0.07)) * 1.6;
    c.strokeStyle = SINK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(mx + 22, my + 28); c.lineTo(mx + 22 + Math.cos(a) * 20, my + 28 + Math.sin(a) * 20); c.stroke();
    px(c, mx + 30, my + 4, 10, 4, '#DC2626');
  }
  // (the RECORDING lamp's glow behind its letters, gently pulsing)
  const bx = X(3960) + 190, bt = GY - 336;
  c.fillStyle = `rgba(248,113,113,${0.15 + 0.08 * Math.sin(f * 0.08)})`; c.beginPath(); c.ellipse(bx, bt + 14, 80, 26, 0, 0, Math.PI * 2); c.fill();
};

/** A cartoon Socks (a tuxedo cat in a little bow tie): its feet at (x, y), `k` big, `view` 0 front, 1 side, 2 back. */
const socks = (g: Ctx, x: number, y: number, k: number, view = 0) => {
  g.save(); g.translate(x, y); g.scale(k, k);
  g.lineWidth = 3; g.lineJoin = 'round';
  // (body, the white bib, the paws)
  g.fillStyle = '#18181B'; g.strokeStyle = '#000'; g.beginPath(); g.ellipse(0, -22, 16, 22, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  if (view !== 2) { g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(view ? 6 : 0, -18, 8, 14, 0, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#FFFFFF'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 8, -2, 6, 3.5, 0, 0, Math.PI * 2); g.fill(); g.stroke(); }
  // (the head: big, round, two ears; the eyes, the white muzzle)
  g.fillStyle = '#18181B'; g.beginPath(); g.arc(view === 1 ? 4 : 0, -54, 16, 0, Math.PI * 2); g.fill(); g.stroke();
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 5, -66); g.lineTo(s * 14, -78); g.lineTo(s * 15, -60); g.closePath(); g.fill(); g.stroke(); }
  if (view !== 2) {
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(view ? 12 : 0, -48, 9, 6, 0, 0, Math.PI * 2); g.fill();
    for (const s of view ? [1] : [-1, 1]) { g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse((view ? 10 : 0) + s * 6, -58, 4, 5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#000'; g.beginPath(); g.arc((view ? 11 : 0) + s * 6, -57, 2, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#F472B6'; g.beginPath(); g.arc(view ? 18 : 0, -50, 2, 0, Math.PI * 2); g.fill();
    // (the bow tie)
    g.fillStyle = '#DC2626'; g.beginPath(); g.moveTo(-7, -42); g.lineTo(0, -38); g.lineTo(-7, -34); g.closePath(); g.moveTo(7, -42); g.lineTo(0, -38); g.lineTo(7, -34); g.closePath(); g.fill();
  }
  // (the tail: a curl)
  g.strokeStyle = '#000'; g.lineWidth = 6; g.beginPath(); g.moveTo(-14, -14); g.quadraticCurveTo(-30, -20, -26, -40); g.stroke();
  g.strokeStyle = '#18181B'; g.lineWidth = 3; g.stroke();
  g.restore();
};
/** A cartoon Chelsea (curly hair, braces, a big smile): her feet at (x, y), `k` big. */
const chelsea = (g: Ctx, x: number, y: number, k: number, wave = false) => {
  g.save(); g.translate(x, y); g.scale(k, k);
  g.lineWidth = 3; g.lineJoin = 'round'; g.strokeStyle = '#000';
  // (a dress, legs, shoes)
  for (const s of [-1, 1]) { g.fillStyle = '#F0C8A2'; g.fillRect(s * 6 - 2, -22, 5, 20); g.fillStyle = '#1E3A8A'; g.fillRect(s * 6 - 4, -4, 9, 4); }
  g.fillStyle = '#7C3AED'; g.beginPath(); g.moveTo(-14, -20); g.lineTo(14, -20); g.lineTo(8, -58); g.lineTo(-8, -58); g.closePath(); g.fill(); g.stroke();
  // (an arm waving)
  g.strokeStyle = '#000'; g.lineWidth = 5; g.beginPath(); g.moveTo(8, -52); g.lineTo(wave ? 22 : 14, wave ? -74 : -34); g.stroke(); g.strokeStyle = '#F0C8A2'; g.lineWidth = 3; g.stroke();
  // (the head, the curls, the braces grin)
  g.fillStyle = '#F0C8A2'; g.strokeStyle = '#000'; g.lineWidth = 3; g.beginPath(); g.arc(0, -72, 13, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = '#A0522D';
  for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI * 1.2 - 0.1; g.beginPath(); g.arc(Math.cos(a) * 14, -74 + Math.sin(a) * 12, 6, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#000'; g.beginPath(); g.arc(-4, -74, 1.8, 0, Math.PI * 2); g.arc(5, -74, 1.8, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FFFFFF'; g.fillRect(-6, -67, 12, 5); g.fillStyle = '#9CA3AF'; g.fillRect(-6, -65, 12, 1.4);
  g.restore();
};

const paintModels = (g: Ctx, r: Room) => {
  // (model sheets pinned up: Socks' turnaround, his faces, Chelsea's; DO NOT DEVIATE)
  const sheet = (x: number, w: number, title: string) => { part(g, () => g.rect(x, CEIL + 90, w, 230), '#FAFAF5', x, CEIL + 90, w, 230, 1.4); for (const tx of [x + 10, x + w - 16]) px(g, tx, CEIL + 86, 6, 6, '#DC2626'); signText(g, title, x + w / 2, CEIL + 112, PRINT('#1E3A8A')); px(g, x + 10, CEIL + 118, w - 20, 1, '#94A3B8'); };
  sheet(X(4860), 300, 'SOCKS - MODEL SHEET - DO NOT DEVIATE');
  for (let i = 0; i < 4; i++) socks(g, X(4900 + i * 72), CEIL + 290, 1.2, i === 3 ? 2 : i === 2 ? 1 : 0);
  signText(g, 'FRONT     3/4     SIDE     BACK', X(5010), CEIL + 310, PRINT('#64748B'));
  sheet(X(5190), 160, 'CHELSEA - TURNAROUND');
  chelsea(g, X(5230), CEIL + 300, 1.3); chelsea(g, X(5310), CEIL + 300, 1.3, true);
  sheet(X(5380), 190, 'SOCKS - WACKY FACES');
  for (let i = 0; i < 6; i++) { const fx = X(5410 + (i % 3) * 62), fy = CEIL + 170 + Math.floor(i / 3) * 76; ball(g, fx, fy, 18, '#18181B', 1.6); ball(g, fx + 2, fy + 6, 9, '#FFFFFF', 0); px(g, fx - 7, fy - 6, 4, 5, '#FFFFFF'); px(g, fx + 4, fy - 6, 4, 5, '#FFFFFF'); signText(g, ['WACKY', 'ZANY', 'MADCAP', 'WACKY', 'NUTTY', 'WACKY'][i], fx, fy + 34, PRINT('#64748B')); }
  // (APPROVED, stamped, on every one)
  for (const [sx, sy] of [[X(5100), CEIL + 260], [X(5320), CEIL + 150], [X(5500), CEIL + 300]]) {
    g.save(); g.translate(sx, sy); g.rotate(-0.25); g.strokeStyle = 'rgba(220,38,38,0.8)'; g.lineWidth = 2; g.strokeRect(-36, -11, 72, 18);
    signText(g, 'APPROVED', 0, 3, PRINT('rgba(220,38,38,0.85)')); g.restore();
  }
};
const paintModelsProps = (g: Ctx) => {
  // (the art director's table: a stack of sheets, a sweater over his shoulders (him live: the stamp))
  part(g, () => g.rect(X(5060), GY - 70, 160, 12), '#8B6B4A', X(5060), GY - 70, 160, 12, 1.4);
  px(g, X(5070), GY - 58, 6, 58, '#5B4636'); px(g, X(5204), GY - 58, 6, 58, '#5B4636');
  for (let i = 0; i < 6; i++) part(g, () => g.rect(X(5150) + i, GY - 76 - i * 3, 48, 3), '#FAFAF5', X(5150), GY - 76 - i * 3, 48, 3, 0.6);
  // (a Socks maquette on its stand)
  part(g, () => g.rect(X(5440), GY - 90, 40, 90), '#6B6458', X(5440), GY - 90, 40, 90, 1.2);
  socks(g, X(5460), GY - 92, 0.8, 1);
};
/** The art director (live): a pink sweater over his shoulders, the rubber stamp up and down. */
const drawModelsLive = (c: Ctx, f: number) => {
  const x = X(5120), feet = GY;
  const B = bodyOf(33, 'stand', 0); B.L.skin = '#F6DCC8'; B.L.hair = '#A16207'; B.L.bald = false;
  c.save(); c.translate(x, feet);
  limb(c, -4, -31, -5, -2, B.legW, '#C8B48A'); limb(c, 4, -31, 5, -2, B.legW, '#C8B48A');
  part(c, () => { c.moveTo(-11, -30); c.lineTo(-12, -55); c.quadraticCurveTo(0, -58, 12, -55); c.lineTo(11, -30); c.closePath(); }, '#F8FAFC', -12, -58, 24, 28, 1.2);
  // (the sweater over his shoulders, its arms knotted at the chest)
  part(c, () => { c.moveTo(-13, -56); c.quadraticCurveTo(0, -60, 13, -56); c.lineTo(13, -50); c.quadraticCurveTo(0, -54, -13, -50); c.closePath(); }, '#F9A8D4', -13, -60, 26, 10, 1);
  ball(c, 0, -48, 3.5, '#F9A8D4', 1);
  const hb = { ...B, hx: 2, hy: -66 };
  headShape(c, hb, B.L.skin); faceOn(c, hb, { skin: B.L.skin, eyes: 'smug', mouth: 'smirk' }); hairTop(c, hb);
  const t = f % 80, up = t < 50, sy = up ? -86 + Math.min(1, t / 20) * -6 : -72 + (t - 50) * 0.2;
  limb(c, 8, -52, 26, sy + 14, 6, '#F8FAFC'); ball(c, 26, sy + 14, 3.5, B.L.skin, 1);
  part(c, () => c.rect(20, sy, 14, 12), '#7A4F2A', 20, sy, 14, 12, 1); part(c, () => c.rect(18, sy + 12, 18, 5), '#B91C1C', 18, sy + 12, 18, 5, 1);
  c.restore();
  if (t === 50 || t === 51) { c.fillStyle = 'rgba(220,38,38,0.5)'; c.fillRect(x + 36, GY - 80, 20, 3); }
};

const paintOverseas = (g: Ctx, r: Room) => {
  const a = X(r.a), b = X(r.b);
  // (institutional: a green dado, a cream wall above, scuffs)
  box(g, a, CEIL + 44, b - a, 200, '#E8E2CC'); box(g, a, CEIL + 244, b - a, 4, '#55654F');
  for (let i = 0; i < 14; i++) px(g, a + 70 + i * 140, GY - 40 - (i % 3) * 12, 24, 3, 'rgba(40,40,30,0.3)');
  // (the clock: quarter to three)
  const cx = X(5820), cy = CEIL + 120;
  ball(g, cx, cy, 30, '#FAFAF5', 1.6);
  for (let i = 0; i < 12; i++) px(g, cx + Math.cos(i * Math.PI / 6) * 24 - 1, cy + Math.sin(i * Math.PI / 6) * 24 - 1, 2, 2, SINK);
  limb(g, cx, cy, cx + Math.cos(-Math.PI / 2 + Math.PI * 2 * (2.75 / 12)) * 14, cy + Math.sin(-Math.PI / 2 + Math.PI * 2 * (2.75 / 12)) * 14, 2.4, '#1A1A1A', false);
  limb(g, cx, cy, cx + Math.cos(-Math.PI / 2 + Math.PI * 2 * 0.75) * 22, cy + Math.sin(-Math.PI / 2 + Math.PI * 2 * 0.75) * 22, 1.6, '#1A1A1A', false);
  // (the calendar: every day crossed off, DEADLINE circled)
  const kx = X(6000), ky = CEIL + 80;
  part(g, () => g.rect(kx, ky, 110, 110), '#FAFAF5', kx, ky, 110, 110, 1.4); box(g, kx, ky, 110, 20, '#B91C1C');
  for (let d = 0; d < 28; d++) { const dx = kx + 6 + (d % 7) * 14.5, dy = ky + 28 + Math.floor(d / 7) * 19; g.strokeStyle = '#B91C1C'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(dx, dy); g.lineTo(dx + 10, dy + 12); g.moveTo(dx + 10, dy); g.lineTo(dx, dy + 12); g.stroke(); }
  g.strokeStyle = '#B91C1C'; g.lineWidth = 2; g.beginPath(); g.ellipse(kx + 96, ky + 92, 11, 9, 0, 0, Math.PI * 2); g.stroke();
  // (a window on the city at night: towers, lit windows, a few signs)
  for (const wx of [X(6420), X(6900), X(7300)]) {
    part(g, () => g.rect(wx, CEIL + 70, 200, 150), '#C9C4AE', wx, CEIL + 70, 200, 150, 1.4);
    box(g, wx + 8, CEIL + 78, 184, 134, '#0B1230');
    for (let i = 0; i < 9; i++) { const bx2 = wx + 10 + i * 20, bh = 40 + hash(wx + i) * 80; box(g, bx2, CEIL + 212 - bh, 18, bh, '#131B3E'); for (let j = 0; j < bh / 12 - 1; j++) if (hash(wx + i * 7 + j) > 0.45) px(g, bx2 + 4 + (j % 2) * 7, CEIL + 216 - bh + j * 12, 4, 4, '#FDE68A'); }
    px(g, wx + 98, CEIL + 78, 4, 134, '#C9C4AE'); px(g, wx + 8, CEIL + 144, 184, 4, '#C9C4AE');
  }
  // (the fax machine on its cart, spitting a long page from Dave)
  const fx = X(6700);
  part(g, () => g.rect(fx, GY - 140, 90, 70), '#6B6458', fx, GY - 140, 90, 70, 1.2);
  part(g, () => g.rect(fx + 10, GY - 166, 70, 28), '#D6D3C4', fx + 10, GY - 166, 70, 28, 1.2);
  part(g, () => { g.moveTo(fx + 22, GY - 168); g.lineTo(fx + 68, GY - 168); g.lineTo(fx + 74, GY - 290); g.quadraticCurveTo(fx + 100, GY - 300, fx + 112, GY - 270); g.lineTo(fx + 106, GY - 250); g.quadraticCurveTo(fx + 96, GY - 280, fx + 82, GY - 280); g.lineTo(fx + 76, GY - 168); g.closePath(); }, '#FAFAF5', fx + 22, GY - 300, 90, 132, 1);
  signText(g, 'NEED 9000', fx + 48, GY - 250, PRINT('#111827')); signText(g, 'MORE BY', fx + 48, GY - 238, PRINT('#111827')); signText(g, 'FRIDAY!!', fx + 48, GY - 226, PRINT('#111827')); signText(g, 'THX - DAVE', fx + 48, GY - 210, PRINT('#1D4ED8'));
  px(g, fx + 10, GY - 70, 4, 70, '#3F3F46'); px(g, fx + 76, GY - 70, 4, 70, '#3F3F46');
};
/** The light tables (stamped: the desk, its glow, what's on it) in rows going back, and the people at them (stamped
 *  by frame: drawing, flipping a page, one asleep, one yawning, one on a cot under a desk). */
const ROWS: { d: number; xs: number[] }[] = [
  { d: 0.80, xs: Array.from({ length: 12 }, (_, i) => 5680 + i * 160) },
  { d: 0.84, xs: Array.from({ length: 11 }, (_, i) => 5760 + i * 165) },
  { d: 0.88, xs: Array.from({ length: 10 }, (_, i) => 5700 + i * 180) },
];
const lightTable = (g: Ctx, x: number, k: number) => {
  // (legs, the tilted glowing top, a stack of paper, a lamp, a cup of noodles or a thermos)
  px(g, x + 4, GY - 66, 4, 66, '#3F3F46'); px(g, x + 74, GY - 66, 4, 66, '#3F3F46');
  part(g, () => { g.moveTo(x, GY - 66); g.lineTo(x + 84, GY - 66); g.lineTo(x + 80, GY - 90); g.lineTo(x + 4, GY - 80); g.closePath(); }, '#C9C4AE', x, GY - 90, 84, 24, 1.2);
  flat(g, () => { g.moveTo(x + 10, GY - 70); g.lineTo(x + 76, GY - 70); g.lineTo(x + 73, GY - 86); g.lineTo(x + 12, GY - 79); g.closePath(); }, '#FFF8DA', 0);
  part(g, () => g.rect(x + 50, GY - 96 - (k % 4) * 4, 26, 6 + (k % 4) * 4), '#FAFAF5', x + 50, GY - 96 - (k % 4) * 4, 26, 6 + (k % 4) * 4, 0.8);
  if (k % 3 === 0) { part(g, () => g.rect(x + 14, GY - 96, 12, 14), '#F8FAFC', x + 14, GY - 96, 12, 14, 0.9); px(g, x + 14, GY - 96, 12, 3, '#DC2626'); px(g, x + 18, GY - 104, 1, 8, '#D6A86A'); px(g, x + 21, GY - 104, 1, 8, '#D6A86A'); }
  else if (k % 3 === 1) part(g, () => g.roundRect(x + 14, GY - 104, 8, 20, 2), '#1E3A8A', x + 14, GY - 104, 8, 20, 0.9);
  if (k % 5 === 2) { px(g, x + 36, GY - 66, 30, 4, '#4B5563'); part(g, () => g.rect(x + 30, GY - 30, 50, 22), '#6B7F6A', x + 30, GY - 30, 50, 22, 1); }
};
const drawOverseasRows = (c: Ctx, state: GameState, E: P, f: number) => {
  for (const row of ROWS) atDepth(c, E, row.d, () => {
    for (let i = 0; i < row.xs.length; i++) {
      const x = X(row.xs[i]), k = i * 7 + Math.round(row.d * 100);
      if (!seen(state, E, x - 60, x + 100, row.d)) continue;
      stamp(c, `ct-st-desk-${k}`, x - 4, GY - 112, 96, 116, g => lightTable(g, x, k));
      // (the person at it: drawing (the pencil hand moving), flipping a page, asleep, yawning)
      const seed = 400 + k * 13, asleep = k % 9 === 4, yawn = k % 11 === 7 && (f % 300) < 60;
      const fr = asleep ? 0 : ((f + k * 17) >> 3) % 4;
      stamp(c, `ct-st-anim-${k}-${fr}-${yawn ? 1 : 0}`, x - 60, GY - 120, 110, 124, g => {
        g.save(); g.translate(x - 26, GY - 44);
        sitter(g, seed, { asian: true, shirt: ['#6B7280', '#4B5563', '#7C6A55', '#3F5160', '#5B6B5B', '#8B7E74'][k % 6], pants: '#374151', drawing: true, reach: 18, nod: asleep ? 1 : 0.4 + (k % 3) * 0.1, hand: [0, 2, 4, 2][fr], yawn });
        g.restore();
      });
      // (the cot under the next desk along: somebody asleep in their clothes)
      if (k % 5 === 2) stamp(c, `ct-st-cot-${k}`, x + 20, GY - 30, 70, 30, g => { ball(g, x + 40, GY - 34, 7, ASIAN_SKIN[k % 6], 1); px(g, x + 36, GY - 42, 10, 4, ASIAN_HAIR[k % 4]); part(g, () => g.roundRect(x + 46, GY - 40, 32, 10, 4), '#8B5CF6', x + 46, GY - 40, 32, 10, 1); });
    }
  });
};
/** The park's banner over the night shift (hung on two wires from the ceiling): OUR OVERSEAS PARTNERS, a grinning globe. */
const paintBanner = (g: Ctx) => {
  const x = X(6600), y = Y(380), w = 420, h = 76;
  for (const sx of [x - w / 2 + 30, x + w / 2 - 30]) { px(g, sx, CEIL, 2, y - CEIL, '#94A3B8'); }
  part(g, () => g.roundRect(x - w / 2, y, w, h, 10), '#0EA5E9', x - w / 2, y, w, h, 2);
  // (the globe, grinning, a thumbs up)
  ball(g, x - w / 2 + 44, y + h / 2, 26, '#3B82F6', 1.6);
  flat(g, () => { g.moveTo(x - w / 2 + 30, y + 24); g.quadraticCurveTo(x - w / 2 + 40, y + 16, x - w / 2 + 54, y + 26); g.lineTo(x - w / 2 + 48, y + 40); g.closePath(); }, '#22C55E', 1);
  px(g, x - w / 2 + 34, y + 30, 5, 6, '#FFFFFF'); px(g, x - w / 2 + 48, y + 30, 5, 6, '#FFFFFF');
  g.strokeStyle = SINK; g.lineWidth = 2; g.beginPath(); g.arc(x - w / 2 + 44, y + 42, 10, 0.2, Math.PI - 0.2); g.stroke();
  signText(g, 'OUR OVERSEAS', x + 24, y + 34, park(2));
  signText(g, 'PARTNERS!', x + 24, y + 62, park(2, ['#FFFFFF', '#FCE7F3', '#F9A8D4', '#EC4899']));
};

const paintInkpaint = (g: Ctx, r: Room) => {
  // (drying racks full of cels; shelves of paint jars in every color)
  for (const rx of [7640, 8240]) {
    const x = X(rx);
    part(g, () => g.rect(x, CEIL + 80, 300, 200), '#64748B', x, CEIL + 80, 300, 200, 1.4);
    for (let i = 0; i < 28; i++) { const cx = x + 8 + i * 10.4; px(g, cx, CEIL + 88, 7, 184, 'rgba(219,234,254,0.55)'); px(g, cx + 1, CEIL + 150 + (i % 5) * 10, 5, 30, ['#DC2626', '#18181B', '#FACC15', '#7C3AED', '#16A34A'][i % 5]); }
  }
  for (let s = 0; s < 3; s++) {
    const sy = CEIL + 120 + s * 70;
    part(g, () => g.rect(X(7960), sy, 260, 8), '#8B6B4A', X(7960), sy, 260, 8, 1);
    for (let j = 0; j < 13; j++) { const jx = X(7966 + j * 20); part(g, () => g.rect(jx, sy - 24, 14, 24), '#E5E7EB', jx, sy - 24, 14, 24, 0.8); px(g, jx + 1, sy - 16, 12, 15, ['#DC2626', '#F97316', '#FACC15', '#16A34A', '#2563EB', '#7C3AED', '#EC4899', '#18181B', '#A16207', '#FFFFFF', '#0EA5E9', '#84CC16', '#9CA3AF'][(j + s * 4) % 13]); px(g, jx + 2, sy - 22, 10, 3, '#4B5563'); }
  }
  void r;
};
const paintInkpaintProps = (g: Ctx) => {
  // (two long tables, painters at them painting the backs of cels laid flat)
  for (const [t0, n] of [[7680, 4], [8180, 4]] as [number, number][]) {
    for (let i = 0; i < n; i++) { const x = X(t0 + i * 95); g.save(); g.translate(x, GY - 44); sitter(g, 700 + t0 + i * 29, { asian: true, shirt: ['#E7E5E4', '#D6D3C4', '#CBD5E1'][i % 3], pants: '#475569', reach: 22, nod: 0.45, drawing: false }); g.restore(); }
    part(g, () => g.rect(X(t0 + 10), GY - 66, n * 95 + 20, 10), '#9CA3AF', X(t0 + 10), GY - 66, n * 95 + 20, 10, 1.2);
    px(g, X(t0 + 16), GY - 56, 6, 56, '#475569'); px(g, X(t0 + n * 95 + 20), GY - 56, 6, 56, '#475569');
    for (let i = 0; i < n; i++) { const cx = X(t0 + 40 + i * 95); px(g, cx, GY - 70, 40, 4, 'rgba(219,234,254,0.9)'); px(g, cx + 8, GY - 70, 14, 4, ['#DC2626', '#18181B', '#FACC15', '#7C3AED'][i % 4]); }
  }
};

const paintCamera = (g: Ctx, r: Room) => {
  // (film cans on shelves, exposure sheets pinned up)
  for (let s = 0; s < 4; s++) {
    const sy = CEIL + 110 + s * 80;
    part(g, () => g.rect(X(8620), sy, 200, 6), '#3A3A46', X(8620), sy, 200, 6, 1);
    for (let j = 0; j < 7; j++) { part(g, () => g.rect(X(8628 + j * 27), sy - 30, 22, 30), '#A1A1AA', X(8628 + j * 27), sy - 30, 22, 30, 0.9); px(g, X(8630 + j * 27), sy - 20, 18, 6, '#F8FAFC'); }
  }
  for (let i = 0; i < 3; i++) { part(g, () => g.rect(X(9040 + i * 50), CEIL + 120, 40, 120), '#FAFAF5', X(9040 + i * 50), CEIL + 120, 40, 120, 1); for (let l = 0; l < 12; l++) px(g, X(9044 + i * 50), CEIL + 130 + l * 9, 32, 1, '#94A3B8'); }
  void r;
};
const paintCameraProps = (g: Ctx) => {
  // (the rostrum camera: a tall column, the camera up top looking down at the table, the soft boxes either side)
  const cx = X(8960);
  part(g, () => g.rect(cx - 8, GY - 400, 16, 330), '#52525B', cx - 8, GY - 400, 16, 330, 1.4);
  part(g, () => g.rect(cx - 40, GY - 330, 80, 50), '#27272A', cx - 40, GY - 330, 80, 50, 1.4);
  part(g, () => g.rect(cx - 14, GY - 282, 28, 26), '#18181B', cx - 14, GY - 282, 28, 26, 1.2);
  ball(g, cx, GY - 254, 9, '#3F3F46', 1);
  for (const s of [-1, 1]) { part(g, () => g.rect(cx + s * 90 - 22, GY - 200, 44, 34), '#FDE68A', cx + s * 90 - 22, GY - 200, 44, 34, 1.2); px(g, cx + s * 90 - 2, GY - 166, 4, 96, '#3F3F46'); }
  part(g, () => g.rect(cx - 70, GY - 80, 140, 14), '#3F3F46', cx - 70, GY - 80, 140, 14, 1.2);
  px(g, cx - 40, GY - 84, 80, 4, 'rgba(219,234,254,0.9)'); px(g, cx - 64, GY - 66, 8, 66, '#27272A'); px(g, cx + 56, GY - 66, 8, 66, '#27272A');
  g.save(); g.translate(cx + 90, GY - 44); sitter(g, 913, { shirt: '#1F2937', reach: 4, nod: 0.2 }); g.restore();
};

const paintPremiere = (g: Ctx, r: Room) => {
  const a = X(r.a), b = X(r.b);
  // (the step-and-repeat: the studio's star and the show's cat head in a grid)
  for (let x = a + 30; x < b - 20; x += 90) for (let y = CEIL + 70; y < GY - 60; y += 70) {
    const k = ((x - a) / 90 + (y - CEIL) / 70) | 0;
    if (k % 2) { ball(g, x + 20, y + 20, 13, '#18181B', 1.2); flat(g, () => { g.moveTo(x + 10, y + 12); g.lineTo(x + 8, y); g.lineTo(x + 17, y + 8); g.closePath(); g.moveTo(x + 30, y + 12); g.lineTo(x + 32, y); g.lineTo(x + 23, y + 8); g.closePath(); }, '#18181B', 1); px(g, x + 14, y + 16, 4, 4, '#FFFFFF'); px(g, x + 22, y + 16, 4, 4, '#FFFFFF'); }
    else { flat(g, () => { for (let i = 0; i < 10; i++) { const ang = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 6 : 14; g.lineTo(x + 20 + Math.cos(ang) * rr, y + 20 + Math.sin(ang) * rr); } g.closePath(); }, '#F2C94C', 1); }
  }
};
/** The show's big promo board on its truss: CHELSEA CLINTON AND SOCKS THE CAT'S WACKY WHITE HOUSE ADVENTURES. */
const PROMO = { x: X(9330), y: GY - 440, w: 300, h: 290 };
const paintPromo = (g: Ctx) => {
  const x0 = PROMO.x, y0 = PROMO.y, w = PROMO.w, h = PROMO.h;
  // (the truss legs)
  for (const lx of [x0 + 30, x0 + w - 30]) { part(g, () => g.rect(lx - 6, y0 + h, 12, GY - y0 - h), '#9CA3AF', lx - 6, y0 + h, 12, GY - y0 - h, 1.2); for (let y = y0 + h; y < GY; y += 16) { g.strokeStyle = '#6B7280'; g.lineWidth = 1; g.beginPath(); g.moveTo(lx - 6, y); g.lineTo(lx + 6, y + 16); g.stroke(); } }
  part(g, () => g.rect(x0, y0, w, h), '#38BDF8', x0, y0, w, h, 2);
  // (a cartoon sky, the cartoon White House, Socks and Chelsea waving)
  box(g, x0 + 4, y0 + 4, w - 8, h - 8, '#7DD3FC');
  for (let i = 0; i < 3; i++) { const cx = x0 + 60 + i * 120; ball(g, cx, y0 + 40, 16, '#FFFFFF', 0); ball(g, cx + 16, y0 + 34, 20, '#FFFFFF', 0); ball(g, cx + 34, y0 + 42, 14, '#FFFFFF', 0); }
  box(g, x0 + 4, y0 + h - 60, w - 8, 56, '#4ADE80');
  const hx = x0 + w / 2;
  part(g, () => g.rect(hx - 90, y0 + 150, 180, 90), '#F8FAFC', hx - 90, y0 + 150, 180, 90, 1.6);
  part(g, () => { g.moveTo(hx - 44, y0 + 150); g.lineTo(hx, y0 + 124); g.lineTo(hx + 44, y0 + 150); g.closePath(); }, '#F8FAFC', hx - 44, y0 + 124, 88, 26, 1.4);
  for (let i = 0; i < 5; i++) px(g, hx - 38 + i * 18, y0 + 156, 6, 80, '#E2E8F0');
  for (let i = 0; i < 3; i++) { px(g, hx - 82 + i * 14, y0 + 170, 9, 14, '#93C5FD'); px(g, hx + 46 + i * 14, y0 + 170, 9, 14, '#93C5FD'); }
  px(g, hx - 2, y0 + 112, 3, 14, '#3F3F46'); flat(g, () => g.rect(hx + 1, y0 + 112, 16, 9), '#DC2626', 1);
  socks(g, x0 + 62, y0 + h - 16, 1.4, 0);
  chelsea(g, x0 + w - 62, y0 + h - 16, 1.4, true);
  // (the title in the park's letters)
  signText(g, 'CHELSEA CLINTON AND', hx, y0 + 34, park(1, ['#FFFFFF', '#FFFFFF', '#FEF3C7', '#FDE68A']));
  signText(g, "SOCKS THE CAT'S", hx, y0 + 52, park(1, ['#FFFFFF', '#FFFFFF', '#FEF3C7', '#FDE68A']));
  signText(g, 'WACKY', hx, y0 + 84, park(3, ['#FFFFFF', '#FDF2F8', '#F9A8D4', '#EC4899']));
  signText(g, 'WHITE HOUSE ADVENTURES!', hx, y0 + 108, park(1, ['#FFFFFF', '#FEF3C7', '#FDE047', '#F59E0B']));
  part(g, () => g.roundRect(hx - 90, y0 + h - 34, 180, 22, 6), '#DC2626', hx - 90, y0 + h - 34, 180, 22, 1.4);
  signText(g, 'SATURDAY MORNINGS!', hx, y0 + h - 18, PRINT('#FFFFFF'));
};
/** The promo board's marquee bulbs chasing round it, and the cardboard paparazzi's flashes (live). */
const drawPremiereLive = (c: Ctx, f: number) => {
  const x0 = PROMO.x, y0 = PROMO.y, w = PROMO.w, h = PROMO.h, n = 32;
  for (let i = 0; i < n; i++) {
    const u = i / n, per = (w + h) * 2, d = u * per;
    const p = d < w ? [x0 + d, y0] : d < w + h ? [x0 + w, y0 + d - w] : d < w * 2 + h ? [x0 + w - (d - w - h), y0 + h] : [x0, y0 + h - (d - w * 2 - h)];
    const on = (i + (f >> 3)) % 3 === 0;
    c.fillStyle = INK; c.beginPath(); c.arc(p[0], p[1], 4.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = on ? '#FFF7C2' : '#B45309'; c.beginPath(); c.arc(p[0], p[1], 3.2, 0, Math.PI * 2); c.fill();
  }
};
const paintPaparazzi = (g: Ctx) => {
  for (let i = 0; i < 5; i++) {
    const x = X(9360 + i * 64), lean = (i % 2) ? 0.06 : -0.04;
    g.save(); g.translate(x, GY); g.rotate(lean);
    // (a flat cardboard press man: a hat, a big camera up to his face)
    flat(g, () => { g.moveTo(-12, 0); g.lineTo(-14, -50); g.quadraticCurveTo(0, -58, 14, -50); g.lineTo(12, 0); g.closePath(); }, '#475569', 1.4);
    ball(g, 0, -66, 10, '#94A3B8', 1.2); flat(g, () => g.rect(-12, -80, 24, 6), '#334155', 1);
    flat(g, () => g.rect(4, -72, 16, 12), '#18181B', 1); flat(g, () => g.rect(10, -84, 10, 10), '#E5E7EB', 1);
    g.restore();
  }
};
const drawPaparazziLive = (c: Ctx, f: number) => {
  for (let i = 0; i < 5; i++) {
    if (((f + i * 37) % 97) > 5) continue;
    const x = X(9360 + i * 64) + 15, y = GY - 80;
    c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.arc(x, y, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.arc(x, y, 16, 0, Math.PI * 2); c.fill();
  }
};

const BACKS: Record<string, (g: Ctx, r: Room) => void> = {
  lobby: paintLobby, vision: paintVision, writers: paintWriters, storyboards: paintStoryboards, voice: paintVoice,
  models: paintModels, overseas: paintOverseas, inkpaint: paintInkpaint, camera: paintCamera, premiere: paintPremiere,
};
const PROPS: Record<string, ((g: Ctx) => void) | undefined> = {
  lobby: paintLobbyProps, vision: paintVisionProps, writers: paintWritersProps, storyboards: paintStoryboardsProps,
  voice: paintVoiceProps, models: paintModelsProps, inkpaint: paintInkpaintProps, camera: paintCameraProps,
};

// ---------------------------------------------------------------------------------------------------------------
// Signs: the room's numbered placard on its brass stand; the lobby's marquee

/** A film-frame placard on a brass stand (its foot at x on the path's back edge), the room's number and name. */
/** Where each room's placard stands (from its start): clear of what's on the path and what's behind it. */
const PLACARD_AT: Partial<Record<string, number>> = { camera: 460, premiere: 30 };
const placard = (c: Ctx, E: P, r: Room) => {
  if (!r.num) return;
  const x = X(r.a + (PLACARD_AT[r.id] ?? 150));
  atDepth(c, E, D_RAIL, () => {
    const title = `${r.num}. ${r.name}`, look = park(1), w = Math.max(120, signW(title, look) + 30);
    c.save(); c.translate(x, GY);
    stamp(c, `ct-st-placard-${r.id}-${fontReady() ? 'f' : 'n'}`, -w / 2 - 6, -200, w + 12, 204, g => {
      part(g, () => g.rect(-3, -150, 6, 150), '#D4A84A', -3, -150, 6, 150, 1.2);
      part(g, () => g.ellipse(0, -2, 18, 5, 0, 0, Math.PI * 2), '#B08A3A', -18, -7, 36, 10, 1.2);
      // (the board: a frame of film, sprocket holes top and bottom)
      part(g, () => g.roundRect(-w / 2, -196, w, 50, 4), '#18181B', -w / 2, -196, w, 50, 1.6);
      for (let k = -w / 2 + 8; k < w / 2 - 6; k += 12) { px(g, k, -192, 6, 5, '#E5E7EB'); px(g, k, -155, 6, 5, '#E5E7EB'); }
      box(g, -w / 2 + 6, -184, w - 12, 26, '#7C3AED');
      signText(g, title, 0, -167, look);
    });
    c.restore();
  });
};
const marquee = (c: Ctx, E: P) => {
  const x = X(470), y = Y(400);
  atDepth(c, E, D_RAIL, () => {
    for (const sx of [x - 150, x + 150]) for (let yy = CEIL; yy < y; yy += 8) { c.fillStyle = '#9CA3AF'; c.fillRect(sx - 2, yy, 4, 5); }
    c.save(); c.translate(x, y);
    stamp(c, `ct-st-marquee-${fontReady() ? 'f' : 'n'}`, -200, -6, 400, 110, g => {
      part(g, () => g.roundRect(-190, 0, 380, 100, 6), '#18181B', -190, 0, 380, 100, 2);
      for (let k = -182; k < 180; k += 16) { px(g, k, 5, 9, 7, '#E5E7EB'); px(g, k, 88, 9, 7, '#E5E7EB'); }
      box(g, -180, 16, 360, 68, '#4C1D95');
      signText(g, 'LEARN THE MAGIC OF', 0, 38, park(2));
      signText(g, 'HOW CARTOONS ARE MADE', 0, 60, park(2));
      signText(g, 'EST. 1994', 0, 78, park(1, ['#FFFFFF', '#FCE7F3', '#F9A8D4', '#EC4899']));
    });
    c.restore();
  });
};
/** A PA horn speaker hanging off the ceiling at x (sound arcs off it while the narrator's on). */
const horn = (c: Ctx, x: number, talking: boolean, f: number) => {
  box(c, x - 1, CEIL, 3, 30, '#52525B');
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 6, CEIL + 28); c.lineTo(x + 6, CEIL + 28); c.lineTo(x + 18, CEIL + 52); c.lineTo(x - 18, CEIL + 52); c.closePath(); c.fill();
  c.fillStyle = '#A1A1AA'; c.beginPath(); c.moveTo(x - 4, CEIL + 30); c.lineTo(x + 4, CEIL + 30); c.lineTo(x + 15, CEIL + 50); c.lineTo(x - 15, CEIL + 50); c.closePath(); c.fill();
  if (talking) { c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 1.5; for (let k = 0; k < 2; k++) { const r0 = 8 + k * 8 + (f % 12) * 0.6; c.beginPath(); c.arc(x, CEIL + 52, r0, 0.3, Math.PI - 0.3); c.stroke(); } }
};

// ---------------------------------------------------------------------------------------------------------------
// The play plane

const LIP = '#FFF7E0';
/** A solid thing he stands on (its top lit). */
const topLit = (c: Ctx, a: number, b: number, h: number) => { box(c, X(a), Y(h), b - a, 3, LIP); box(c, X(a) + 4, Y(h), (b - a) * 0.4, 1, '#FFFFFF'); };
const playProps = (c0: Ctx, state: GameState) => {
  const on = (a: number, b: number) => X(b) > state.camera.x - 80 && X(a) < state.camera.x + CANVAS_WIDTH + 80;
  const fr = fontReady() ? 'f' : 'n';
  // (the flat file: a steel cabinet of wide drawers)
  if (on(FLATFILE.a, PENCILBOX.b)) stamp(c0, `ct-st-pp-story-${fr}`, X(FLATFILE.a) - 10, Y(STORYWALL.h) - 6, PENCILBOX.b - FLATFILE.a + 20, STORYWALL.h + 10, c => {
    part(c, () => c.rect(X(FLATFILE.a), Y(FLATFILE.h), FLATFILE.b - FLATFILE.a, FLATFILE.h), '#64748B', X(FLATFILE.a), Y(FLATFILE.h), FLATFILE.b - FLATFILE.a, FLATFILE.h, 2);
    for (let i = 0; i < 5; i++) { px(c, X(FLATFILE.a) + 4, Y(FLATFILE.h) + 10 + i * 19, FLATFILE.b - FLATFILE.a - 8, 2, '#334155'); px(c, X(FLATFILE.a) + 40, Y(FLATFILE.h) + 16 + i * 19, 20, 4, '#CBD5E1'); }
    topLit(c, FLATFILE.a, FLATFILE.b, FLATFILE.h);
    // (the drafting table: a white top on a steel stand)
    part(c, () => c.rect(X(DRAFTING.a), Y(DRAFTING.h), DRAFTING.b - DRAFTING.a, 10), '#F5F0E1', X(DRAFTING.a), Y(DRAFTING.h), DRAFTING.b - DRAFTING.a, 10, 1.6);
    limb(c, X(DRAFTING.a) + 10, Y(DRAFTING.h) + 10, X(DRAFTING.b) - 14, GY, 4, '#475569'); limb(c, X(DRAFTING.b) - 10, Y(DRAFTING.h) + 10, X(DRAFTING.a) + 14, GY, 4, '#475569');
    topLit(c, DRAFTING.a, DRAFTING.b, DRAFTING.h);
    // (the rolling storyboard wall: cork panels in a frame on casters, too tall to jump, its top lit)
    const wa = X(STORYWALL.a), ww = STORYWALL.b - STORYWALL.a;
    part(c, () => c.rect(wa, Y(STORYWALL.h), ww, STORYWALL.h - 12), '#B07A46', wa, Y(STORYWALL.h), ww, STORYWALL.h - 12, 2);
    for (let i = 0; i < 6; i++) { box(c, wa + 8 + (i % 2) * 34, Y(STORYWALL.h) + 14 + Math.floor(i / 2) * 64, 28, 22, '#FAFAF9'); px(c, wa + 20 + (i % 2) * 34, Y(STORYWALL.h) + 12 + Math.floor(i / 2) * 64, 4, 4, '#DC2626'); }
    for (const cx of [wa + 12, wa + ww - 12]) ball(c, cx, GY - 6, 6, '#27272A', 1.2);
    part(c, () => c.rect(wa - 3, Y(STORYWALL.h), ww + 6, 10), '#6E4A2A', wa - 3, Y(STORYWALL.h), ww + 6, 10, 1.4);
    topLit(c, STORYWALL.a, STORYWALL.b, STORYWALL.h);
    // (the box of pencils)
    part(c, () => c.rect(X(PENCILBOX.a), Y(PENCILBOX.h), PENCILBOX.b - PENCILBOX.a, PENCILBOX.h), '#C8A06A', X(PENCILBOX.a), Y(PENCILBOX.h), PENCILBOX.b - PENCILBOX.a, PENCILBOX.h, 2);
    px(c, X(PENCILBOX.a), Y(PENCILBOX.h) + 10, PENCILBOX.b - PENCILBOX.a, 6, '#A47148');
    signText(c, 'PENCILS', X((PENCILBOX.a + PENCILBOX.b) / 2), Y(PENCILBOX.h) + 46, PRINT('#3B2A10'));
    signText(c, 'NO. 2', X((PENCILBOX.a + PENCILBOX.b) / 2), Y(PENCILBOX.h) + 60, PRINT('#3B2A10'));
    signText(c, 'X 10,000', X((PENCILBOX.a + PENCILBOX.b) / 2), Y(PENCILBOX.h) + 74, PRINT('#3B2A10'));
    topLit(c, PENCILBOX.a, PENCILBOX.b, PENCILBOX.h);
  });
  // (the shelf of maquettes on its brackets)
  if (on(SHELF.a, SHELF.b)) stamp(c0, 'ct-st-pp-shelf', X(SHELF.a) - 4, Y(SHELF.h) - 4, SHELF.b - SHELF.a + 12, SHELF.h + 6, c => {
    part(c, () => c.rect(X(SHELF.a), Y(SHELF.h), SHELF.b - SHELF.a, 12), '#8B6B4A', X(SHELF.a), Y(SHELF.h), SHELF.b - SHELF.a, 12, 1.6);
    for (const bx of [SHELF.a + 16, SHELF.b - 20]) { limb(c, X(bx), Y(SHELF.h) + 12, X(bx) + 4, Y(SHELF.h) + 50, 4, '#52525B'); }
    px(c, X(SHELF.b) - 6, Y(SHELF.h) + 12, 6, SHELF.h - 12, '#6B6458');
    topLit(c, SHELF.a, SHELF.b, SHELF.h);
  });
  // (the light tables at the pile's ends)
  for (const d of [NEAR_DESK, FAR_DESK]) if (on(d.a, d.b)) stamp(c0, `ct-st-pp-desk-${d.a}`, X(d.a) - 4, Y(d.h) - 4, d.b - d.a + 8, d.h + 50, c => {
    const top = Y(d.h);
    part(c, () => c.rect(X(d.a), top, d.b - d.a, 14), '#C9C4AE', X(d.a), top, d.b - d.a, 14, 1.8);
    box(c, X(d.a) + 6, top + 3, d.b - d.a - 12, 6, '#FFF8DA');
    for (const lx of [d.a + 8, d.b - 14]) part(c, () => c.rect(X(lx), top + 14, 6, GY - top + 40), '#52525B', X(lx), top + 14, 6, GY - top + 40, 1);
    topLit(c, d.a, d.b, d.h);
  });
  // (the wall of film cans: round silver cans stacked, labeled; the crate)
  if (on(FILMCANS.a - 160, CRATE.b)) stamp(c0, `ct-st-pp-cans-${fr}`, X(FILMCANS.a) - 8, Y(FILMCANS.h) - 6, CRATE.b - FILMCANS.a + 16, FILMCANS.h + 10, c => {
    const fa = X(FILMCANS.a), fw = FILMCANS.b - FILMCANS.a;
    for (let i = 0; i < 14; i++) {
      const y = GY - 20 - i * 20;
      part(c, () => c.roundRect(fa + (i % 2 ? 2 : -2), y, fw, 20, 6), i % 3 ? '#B4B8C0' : '#9CA3AF', fa - 2, y, fw + 4, 20, 1.4);
      px(c, fa + 30, y + 7, 40, 6, '#FAFAF5');
      signText(c, `EP ${(i % 13) + 1}`, fa + 50, y + 13, PRINT('#1F2937'));
    }
    topLit(c, FILMCANS.a, FILMCANS.b, FILMCANS.h);
    const ca = X(CRATE.a), cw = CRATE.b - CRATE.a;
    part(c, () => c.rect(ca, Y(CRATE.h), cw, CRATE.h), '#A47148', ca, Y(CRATE.h), cw, CRATE.h, 2);
    limb(c, ca + 6, Y(CRATE.h) + 6, ca + cw - 6, GY - 6, 4, '#7A4F2A', false); limb(c, ca + cw - 6, Y(CRATE.h) + 6, ca + 6, GY - 6, 4, '#7A4F2A', false);
    signText(c, 'FRAGILE', ca + cw / 2, Y(CRATE.h) + 30, PRINT('#7F1D1D'));
    topLit(c, CRATE.a, CRATE.b, CRATE.h);
  });
};

/** The reject pile (crumpled drawings heaped in a trough) and the paint vat (three runs of color, stirring), behind. */
const pitsBack = (c: Ctx, state: GameState) => {
  const f = state.frame;
  const [ra, rb] = REJECTS;
  if (X(rb) > state.camera.x - 40 && X(ra) < state.camera.x + CANVAS_WIDTH + 40) {
    box(c, X(ra), GY + 4, rb - ra, 400, '#BDB6A2');
    stamp(c, 'ct-st-rejects', X(ra) - 8, GY - 4, rb - ra + 16, 70, g => {
      for (let x = ra + 8; x < rb - 4; x += 16) for (let row = 0; row < 3; row++) {
        const k = hash(x * 3.1 + row), cx = X(x + (row % 2) * 8), cy = GY + 10 + row * 14 - k * 4;
        ball(g, cx, cy, 8 + k * 3, ['#FFFFFF', '#F5F0E1', '#ECE6D6'][(x / 16 + row) % 3 | 0], 1);
        if (k > 0.6) { g.strokeStyle = '#64748B'; g.lineWidth = 1; g.beginPath(); g.arc(cx - 1, cy - 1, 3, 0, 4); g.stroke(); }
      }
      // (the trough's ends)
      for (const ex of [X(ra) - 6, X(rb)]) part(g, () => g.rect(ex, GY - 2, 6, 60), '#52525B', ex, GY - 2, 6, 60, 1);
    });
  }
  const [va, vb] = VAT;
  if (X(vb) > state.camera.x - 40 && X(va) < state.camera.x + CANVAS_WIDTH + 40) {
    box(c, X(va), GY + 8, vb - va, 400, '#18181B');
    for (let x = va; x < vb; x += 4) {
      const col = paintAt(X(x)), y = GY + 10 + Math.sin(x * 0.05 + f * 0.04) * 2;
      box(c, X(x), y, 4, 60, col);
      if ((x + (f >> 2)) % 24 === 0) box(c, X(x), y + 2, 8, 2, mix(col, '#FFFFFF', 0.45));
    }
    for (const ex of [X(va) - 8, X(vb)]) part(c, () => c.rect(ex, GY - 8, 8, 70), '#9CA3AF', ex, GY - 8, 8, 70, 1.4);
  }
};
/** In front: the pile's near lip of crumpled balls (over his feet as he sinks), the vat's front rim. */
const pitsFront = (c: Ctx, state: GameState) => {
  const [ra, rb] = REJECTS;
  if (X(rb) > state.camera.x - 40 && X(ra) < state.camera.x + CANVAS_WIDTH + 40) {
    stamp(c, 'ct-st-rejects-lip', X(ra), GY + 4, rb - ra, 30, g => { for (let x = ra + 6; x < rb - 4; x += 13) { const k = hash(x * 1.7); ball(g, X(x), GY + 18 - k * 3, 7 + k * 2, ['#FFFFFF', '#F5F0E1', '#ECE6D6'][(x / 13 | 0) % 3], 1); } });
  }
  const [va, vb] = VAT;
  if (X(vb) > state.camera.x - 40 && X(va) < state.camera.x + CANVAS_WIDTH + 40) {
    part(c, () => c.rect(X(va) - 8, GY + 16, vb - va + 16, 12), '#9CA3AF', X(va) - 8, GY + 16, vb - va + 16, 12, 1.4);
    signText(c, 'CEL VINYL PAINT', X((va + vb) / 2), GY + 26, PRINT('#1F2937'));
  }
};

/** The stacks of drawings (the land's towers, in paper): reams and bundles along the bending spine, rubber bands and
 *  twine, a scene label here and there, a flat board on top (lit along its top: stand on it), rising out of the pile. */
const drawStacks = (c: Ctx, state: GameState, list: Tower[]) => {
  for (const t of list) {
    const d = t.d, top = { x: d.x + Math.sin(t.ang) * d.h, y: d.y - Math.cos(t.ang) * d.h }, half = (d.w ?? 96) / 2;
    if (Math.max(d.x, top.x) + half + 40 < state.camera.x || Math.min(d.x, top.x) - half - 40 > state.camera.x + CANVAS_WIDTH) continue;
    const n = Math.max(4, Math.round(d.h / 30));
    const at = (u: number) => ({ x: d.x + Math.sin(t.ang) * d.h * Math.pow(u, 1.6), y: d.y - d.h * u * (1 - (1 - Math.cos(t.ang)) * u), a: t.ang * Math.pow(u, 1.6) });
    for (let i = 0; i < n; i++) {
      const p0 = at(i / n), p1 = at((i + 1) / n), k = hash(d.x * 0.01 + i);
      const cx = (p0.x + p1.x) / 2, cy = (p0.y + p1.y) / 2, hh = Math.hypot(p1.x - p0.x, p1.y - p0.y) + 1.5;
      const ww = 58 + Math.round(k * 16) - i * 1.2;
      c.save(); c.translate(cx + (k - 0.5) * 6, cy); c.rotate((p0.a + p1.a) / 2 + (k - 0.5) * 0.08);
      const paper = ['#FFFFFF', '#F5F0E1', '#FDF6E3', '#EDE7D6'][i % 4];
      part(c, () => c.rect(-ww / 2, -hh / 2, ww, hh), paper, -ww / 2, -hh / 2, ww, hh, 1.6);
      for (let s = -hh / 2 + 3; s < hh / 2 - 1; s += 3) px(c, -ww / 2 + 2, s, ww - 4, 1, dk(paper, 0.12));
      // (a rubber band, or twine, round it; a label on some)
      if (i % 2) px(c, -ww / 2 + ww * 0.3, -hh / 2, 4, hh, '#B45309');
      else px(c, -ww / 2, -1, ww, 2, '#A16207');
      if (i % 3 === 1) { px(c, 4, -hh / 2 + 4, 22, 9, '#FEF08A'); signText(c, `SC ${(i * 7 + Math.round(d.x / 10)) % 40 + 1}`, 15, -hh / 2 + 12, PRINT('#1F2937')); }
      c.restore();
    }
    // (the board on top, tilting a little with the lean, its top lit)
    c.save(); c.translate(top.x, top.y); c.rotate(t.ang * 0.3);
    part(c, () => c.roundRect(-half, 0, half * 2, 12, 2), '#8B6B4A', -half, 0, half * 2, 12, 2);
    box(c, -half + 2, 0, half * 2 - 4, 2, LIP); box(c, -half + 6, 0, half - 4, 1, '#FFFFFF');
    c.restore();
    // (the tell: wobble lines off it, sheets fluttering loose off the top)
    if (Math.abs(t.vel) > 0.004) {
      c.strokeStyle = INK; c.lineWidth = 2; c.lineCap = 'round';
      const m = at(0.6), side = t.vel > 0 ? -1 : 1;
      for (let k = 0; k < 2; k++) { c.beginPath(); c.arc(m.x + side * (34 + k * 8), m.y, 8 + k * 6, side > 0 ? -0.6 : Math.PI - 0.6, side > 0 ? 0.6 : Math.PI + 0.6); c.stroke(); }
      if (state.frame % 9 === 0) state.particles.push({ pos: { x: top.x + (Math.random() - 0.5) * half * 2, y: top.y - 2 }, vel: { x: -side * 1.4, y: -0.6 }, life: 40, color: '#FFFFFF', size: 3 });
    }
  }
};

/** The movers: the overhead tracks, the cels on their trolleys (a painted Socks on each), the crane. */
const drawMovers = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const d of MOVERS) {
    const at = moverAt(d, f), half = d.w / 2;
    if (at.x + 200 < state.camera.x || at.x - 200 > state.camera.x + CANVAS_WIDTH) continue;
    if (d.id === 'crane') {
      // (the dolly on the floor, its column, the boom from its pivot out to the seat; a counterweight; the seat's deck)
      const bx = X(8615), py = Y(170);
      part(c, () => c.rect(bx - 30, GY - 22, 60, 18), '#3F3F46', bx - 30, GY - 22, 60, 18, 1.6);
      for (const wx of [bx - 20, bx + 20]) ball(c, wx, GY - 6, 7, '#18181B', 1.2);
      part(c, () => c.rect(bx - 6, py, 12, GY - 22 - py), '#52525B', bx - 6, py, 12, GY - 22 - py, 1.4);
      const ex = at.x - half + 6, ey = at.y + 6, ang = Math.atan2(ey - py, ex - bx);
      limb(c, bx - Math.cos(ang) * 50, py - Math.sin(ang) * 50, ex, ey, 7, '#71717A');
      part(c, () => c.rect(bx - Math.cos(ang) * 56 - 12, py - Math.sin(ang) * 56 - 10, 24, 20), '#27272A', bx - Math.cos(ang) * 56 - 12, py - Math.sin(ang) * 56 - 10, 24, 20, 1.2);
      ball(c, bx, py, 6, '#A1A1AA', 1.2);
      // (the seat's deck: steel, a rail at its back, the camera slung under its front)
      part(c, () => c.rect(at.x - half, at.y, d.w, 12), '#6B7280', at.x - half, at.y, d.w, 12, 1.8);
      if (at.y + 32 < GY) { part(c, () => c.rect(at.x + half - 30, at.y + 12, 28, 18), '#18181B', at.x + half - 30, at.y + 12, 28, 18, 1.2); ball(c, at.x + half - 4, at.y + 21, 6, '#3F3F46', 1); }
      box(c, at.x - half + 2, at.y, d.w - 4, 2, LIP);
      continue;
    }
    // (the track overhead: an I-beam hung off the ceiling; the trolley on it, two rods down to the cel's clamp bar)
    const ta = X(Math.min(d.xa, d.xb) - 70), tb = X(Math.max(d.xa, d.xb) + 70), ty = Y(TRACK_H);
    part(c, () => c.rect(ta, ty - 8, tb - ta, 10), '#52525B', ta, ty - 8, tb - ta, 10, 1.4);
    for (let x = ta + 30; x < tb; x += 160) box(c, x, CEIL, 3, ty - 8 - CEIL, '#3F3F46');
    part(c, () => c.rect(at.x - 24, ty - 12, 48, 14), '#27272A', at.x - 24, ty - 12, 48, 14, 1.2);
    for (const wx of [at.x - 14, at.x + 14]) ball(c, wx, ty - 10, 4, '#A1A1AA', 1);
    for (const rx2 of [at.x - half + 8, at.x + half - 8]) limb(c, at.x + (rx2 > at.x ? 12 : -12), ty, rx2, at.y, 2.2, '#A1A1AA');
    // (the cel: clear acetate hanging under the bar, a Socks painted on it; the bar he stands on)
    c.fillStyle = 'rgba(219,234,254,0.45)'; c.fillRect(at.x - half + 4, at.y + 10, d.w - 8, 70);
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 1.5; c.strokeRect(at.x - half + 4, at.y + 10, d.w - 8, 70);
    socks(c, at.x, at.y + 74, 0.62, d.id === 'celB' ? 1 : 0);
    for (let k = 0; k < 3; k++) px(c, at.x - half + 10 + k * 34, at.y + 76, 6, 3, '#18181B');
    part(c, () => c.rect(at.x - half, at.y, d.w, 10), '#9CA3AF', at.x - half, at.y, d.w, 10, 1.8);
    box(c, at.x - half + 2, at.y, d.w - 4, 2, LIP);
  }
};

/** THE SCREEN: a big white projection screen on its frame and legs, the show's title card thrown up on it; with him
 *  behind it, his shadow on it. */
const drawScreen = (c: Ctx, state: GameState, behindIt: boolean) => {
  const a = X(SCREEN.a), b = X(SCREEN.b), top = Y(SCREEN.h), bot = Y(70), f = state.frame;
  if (b < state.camera.x - 40 || a > state.camera.x + CANVAS_WIDTH + 40) return;
  for (const lx of [a + 10, b - 16]) part(c, () => c.rect(lx, bot, 6, GY - bot), '#27272A', lx, bot, 6, GY - bot, 1.2);
  for (const lx of [a + 13, b - 13]) { limb(c, lx, GY - 2, lx - 22, GY - 2, 4, '#27272A'); limb(c, lx, GY - 2, lx + 22, GY - 2, 4, '#27272A'); }
  part(c, () => c.rect(a - 6, top - 6, b - a + 12, bot - top + 12), '#18181B', a - 6, top - 6, b - a + 12, bot - top + 12, 2);
  box(c, a, top, b - a, bot - top, '#F1F5F9');
  // (the title card on it, a little washed out the way projections are, flickering)
  const w = b - a, h = bot - top, k = 0.88 + 0.06 * Math.sin(f * 0.9) * Math.sin(f * 0.13);
  c.save(); c.beginPath(); c.rect(a, top, w, h); c.clip(); c.globalAlpha = k;
  box(c, a, top, w, h, '#BAE6FD');
  box(c, a, bot - 60, w, 60, '#86EFAC');
  const hx = a + w / 2;
  box(c, hx - 70, bot - 120, 140, 70, '#FFFFFF'); box(c, hx - 30, bot - 140, 60, 20, '#FFFFFF');
  for (let i = 0; i < 5; i++) box(c, hx - 26 + i * 12, bot - 116, 4, 62, '#E2E8F0');
  socks(c, a + 46, bot - 14, 1.1, 0); chelsea(c, b - 46, bot - 14, 1.1, true);
  signText(c, 'CHELSEA AND SOCKS', hx, top + 30, park(1));
  signText(c, 'WACKY!', hx, top + 62, park(2, ['#FFFFFF', '#FDF2F8', '#F9A8D4', '#EC4899']));
  // (him, behind it: his shadow, soft at the edges)
  if (behindIt) {
    const p = state.player, sx = p.pos.x + p.width / 2;
    c.globalAlpha = 0.55; c.fillStyle = '#1E293B';
    c.beginPath(); c.ellipse(sx, p.pos.y + 14, 13, 14, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.roundRect(p.pos.x + 2, p.pos.y + 24, p.width - 4, p.height - 24, 8); c.fill();
  }
  c.restore();
  // (the dust in the beam's light, drifting across it)
  for (let i = 0; i < 6; i++) { const dx = ((i * 53 + f * 0.3) % w), dy = (i * 37 + f * 0.17) % h; c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(a + dx, top + dy, 1.5, 1.5); }
};

// ---------------------------------------------------------------------------------------------------------------
// Putting it together

export const drawStudioBackdrop = (c: Ctx) => { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#0B0814'); return true; };

export const drawStudioBack = (c: Ctx, state: GameState, talking: boolean) => {
  const E = eyeOf(state), f = state.frame, s = studioOf(state);
  const vis = ROOMS.filter(r => seen(state, E, X(r.a), X(r.b), D_BACK) || seen(state, E, X(r.a), X(r.b), 1));
  // (above the ceiling: the roof's dark)
  box(c, state.camera.x - 20, state.camera.y - 20, CANVAS_WIDTH + 40, CEIL - state.camera.y + 20, '#0B0814');
  // The rooms, back to front: shells; the back walls' tableaux; the partitions' far halves; the props; their near halves
  for (const r of vis) {
    shellBack(c, E, r);
    atDepth(c, E, D_BACK, () => stamp(c, `ct-st-back-${r.id}-${fontReady() ? 'f' : 'n'}`, X(r.a), CEIL, r.b - r.a, CEIL_H, g => BACKS[r.id](g, r)));
  }
  const walls = ROOMS.slice(1).map((r, i) => ({ x: X(r.a), left: ROOMS[i], right: r }));
  const facing = (w: typeof walls[number]) => (w.x < E.x ? w.right : w.left);
  for (const w of walls) if (seen(state, E, w.x - 4, w.x + 4, D_BACK) || seen(state, E, w.x - 4, w.x + 4, D_RAIL)) partition(c, E, w.x, D_BACK, D_PROPS, facing(w));
  // (the section's own end walls)
  partition(c, E, X(ROOMS[0].a), D_BACK, 1, ROOMS[0]);
  partition(c, E, X(ROOMS[ROOMS.length - 1].b), D_BACK, 1, ROOMS[ROOMS.length - 1]);
  if (vis.some(r => r.id === 'overseas')) drawOverseasRows(c, state, E, f);
  for (const r of vis) {
    const props = PROPS[r.id];
    atDepth(c, E, D_PROPS, () => {
      if (props) stamp(c, `ct-st-props-${r.id}-${fontReady() ? 'f' : 'n'}`, X(r.a), CEIL, r.b - r.a, CEIL_H, g => props(g));
      if (r.id === 'vision') drawDave(c, f);
      else if (r.id === 'writers') drawWritersLive(c, f);
      else if (r.id === 'voice') drawVoiceLive(c, f);
      else if (r.id === 'models') drawModelsLive(c, f);
      else if (r.id === 'premiere') { stamp(c, `ct-st-promo-${fontReady() ? 'f' : 'n'}`, PROMO.x - 10, PROMO.y - 20, PROMO.w + 20, GY - PROMO.y + 24, g => paintPromo(g)); drawPremiereLive(c, f); }
    });
  }
  // (the press, cardboard, behind the rope along the red carpet, flashing)
  if (vis.some(r => r.id === 'premiere')) atDepth(c, E, 0.91, () => { stamp(c, 'ct-st-papz', X(9330), GY - 100, 330, 104, g => paintPaparazzi(g)); drawPaparazziLive(c, f); });
  for (const w of walls) if (seen(state, E, w.x - 4, w.x + 4, D_PROPS) || seen(state, E, w.x - 4, w.x + 4, D_RAIL)) partition(c, E, w.x, D_PROPS, D_RAIL, facing(w));
  // The rope along the path's back edge (posts and a sagging velvet rope: dim, nothing to stand on)
  atDepth(c, E, D_RAIL, () => {
    for (let rx = 0; rx < 10000; rx += 140) {
      if (rx > 6100 && rx < 7200) continue;
      const x = X(rx);
      if (!seen(state, E, x - 10, x + 150, D_RAIL)) continue;
      box(c, x - 3, GY - 64, 6, 64, '#7A5A1E'); box(c, x - 2, GY - 64, 2, 64, '#D4A84A');
      c.fillStyle = '#D4A84A'; c.beginPath(); c.arc(x, GY - 66, 5, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#4C0519'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, GY - 58); c.quadraticCurveTo(x + 70, GY - 34, x + 140, GY - 58); c.stroke();
    }
  });
  for (const r of vis) placard(c, E, r);
  if (vis.some(r => r.id === 'lobby')) marquee(c, E);
  if (vis.some(r => r.id === 'overseas')) atDepth(c, E, D_RAIL, () => stamp(c, `ct-st-banner-${fontReady() ? 'f' : 'n'}`, X(6380), CEIL, 440, Y(300) - CEIL, g => paintBanner(g)));
  // The path: carpet, its lit lip, the aisle lights along it (the red carpet in the premiere room); the pits
  for (const [ga, gb] of GROUND) {
    const a = Math.max(X(ga), state.camera.x - 20), b = Math.min(X(gb), state.camera.x + CANVAS_WIDTH + 20);
    if (b <= a) continue;
    box(c, a, GY, b - a, 400, '#2A1F3D');
    box(c, a, GY, b - a, 4, LIP);
    const pa = Math.max(a, X(9200)); if (b > pa) { box(c, pa, GY + 4, b - pa, 26, '#B91C1C'); box(c, pa, GY + 4, b - pa, 2, '#FCA5A5'); }
    for (let x = Math.ceil((a - X(0)) / 160) * 160; X(x) < b; x += 160) { c.fillStyle = '#1E3A8A'; c.fillRect(X(x) - 3, GY + 7, 6, 3); c.fillStyle = '#93C5FD'; c.fillRect(X(x) - 2, GY + 7, 4, 2); }
  }
  pitsBack(c, state);
  playProps(c, state);
  drawStacks(c, state, s.towers);
  drawMovers(c, state);
  // (the screen behind him, unless he's in behind it)
  const p = state.player, cx = p.pos.x + p.width / 2;
  if (!(cx > X(SCREEN.a) + 6 && cx < X(SCREEN.b) + 40)) drawScreen(c, state, false);
  // The ceiling's front edge: the beams over each doorway, the PA horns
  for (const w of walls) if (w.x > state.camera.x - 60 && w.x < state.camera.x + CANVAS_WIDTH + 60) { part(c, () => c.rect(w.x - 24, CEIL, 48, 34), '#27272A', w.x - 24, CEIL, 48, 34, 1.4); }
  for (const r of vis) { const hx = X(r.a + 320); if (hx > state.camera.x - 40 && hx < state.camera.x + CANVAS_WIDTH + 40) horn(c, hx, talking && r === vis.find(q => X(q.a) <= p.pos.x && X(q.b) > p.pos.x), f); }
};

export const drawStudioFront = (c: Ctx, state: GameState) => {
  pitsFront(c, state);
  const p = state.player, cx = p.pos.x + p.width / 2;
  if (cx > X(SCREEN.a) + 6 && cx < X(SCREEN.b) + 40) drawScreen(c, state, true);
};

// ---------------------------------------------------------------------------------------------------------------
// The lights (soft fills: never a spotlight)

export const studioLights = (state: GameState): Light[] => {
  const s = studioOf(state), E = eyeOf(state), out: Light[] = [];
  ROOMS.forEach((r, i) => {
    const L = s.light[i];
    if (L < 0.02) return;
    if (!seen(state, E, X(r.a) - 400, X(r.b) + 400, 1)) return;
    const n = Math.max(2, Math.round((r.b - r.a) / 380));
    for (let k = 0; k < n; k++) {
      const x = X(r.a + (k + 0.5) * ((r.b - r.a) / n));
      const back = proj(E, x, GY - 260, D_PROPS);
      out.push({ x: back.x, y: back.y, r: 430, a: 0.9 * L, color: 'rgba(255,224,178,0.10)' });
      out.push({ x, y: GY - 110, r: 300, a: 0.6 * L });
    }
  });
  // (the aisle lights along the path, always on)
  for (let x = Math.floor((state.camera.x - X(0)) / 160) * 160; X(x) < state.camera.x + CANVAS_WIDTH + 80; x += 160) {
    if (x < 0 || x > 10000) continue;
    out.push({ x: X(x), y: GY + 6, r: 70, a: 0.5, color: 'rgba(96,165,250,0.12)' });
  }
  // (the night shift's light tables, glowing in the dark before the room's lights come up)
  const oi = ROOMS.findIndex(r => r.id === 'overseas');
  if (s.light[oi] < 1 && seen(state, E, X(5600), X(7600), 0.84)) for (const row of ROWS) for (const rx of row.xs) {
    const p = proj(E, X(rx) + 42, GY - 82, row.d);
    if (p.x > state.camera.x - 60 && p.x < state.camera.x + CANVAS_WIDTH + 60) out.push({ x: p.x, y: p.y, r: 46, a: 0.7 * (1 - s.light[oi]), color: 'rgba(255,244,200,0.10)' });
  }
  // (the screen, glowing; the promo board's bulbs; the RECORDING lamp)
  out.push({ x: X((SCREEN.a + SCREEN.b) / 2), y: Y(200), r: 280, a: 0.75, color: 'rgba(191,219,254,0.10)' });
  { const p = proj(E, PROMO.x + PROMO.w / 2, GY - 300, D_PROPS); out.push({ x: p.x, y: p.y, r: 260, a: 0.5, color: 'rgba(253,224,71,0.10)' }); }
  { const p = proj(E, X(4150), GY - 322, D_PROPS); out.push({ x: p.x, y: p.y, r: 70, a: 0.6, color: 'rgba(248,113,113,0.14)' }); }
  return out;
};
