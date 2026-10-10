// The castle, drawn (crude, the prototype pass: boxes and flat colors, readable). Each room its own wallpaper and its
// own things; the walls go way up (absurdly spacious); doorway arches between the rooms; every plaque on the wall; a lit
// top lip on everything he can stand on (the table, the shelves, the balconies, the canopy, the stoves), the rest of
// the furniture dimmed back. The still art is stamped (painted once).

import type { GameState } from '../../../m1/game/core/state';
import type { SceneLight, Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { stamp } from '../../../m1/game/render/stamp';
import { box, wallSign, groundBox, ledgeBox, doorway } from '../section';
import { GY } from '../geometry';
import { drawHorn, paSaying } from './pa';
import {
  x0, x1, ROOMS, CEIL, ceilOf, DY, dyAt, LEDGES, STOVES, STOVE_TOP, BURNERS, stovePhase, FIRE_H, STOVE_CYCLE, STOVE_FIRE, BED, CHAND_W, BOOKCASES, BOOK_EVERY, BOOK_TELL,
  TRAIN, WARDROBES, HORNS, BALLPIT, type Castle, type LedgeLook,
} from './layout';

type Ctx = CanvasRenderingContext2D;
const INK = '#120608';
const seen = (state: GameState, a: number, b: number) => b > state.camera.x - 100 && a < state.camera.x + CANVAS_WIDTH + 100;

/** A standable thing's look: its body and its lit lip. */
const LOOKS: Record<LedgeLook, [string, string]> = {
  stair: ['#4A2A1E', '#C08A5A'], balcony: ['#3E2418', '#D4A373'], table: ['#5A3420', '#E0A86A'], shelf: ['#3A2A16', '#C9A060'],
  canopy: ['#5A1030', '#F472B6'], toyshelf: ['#3E3E6A', '#A5B4FC'], cauldron: ['#57524C', '#C8C2BA'], frame: ['#8A6A14', '#FDE047'], rack: ['#3F3F46', '#D4D4D8'],
};

// ---------------------------------------------------------------------------------------------------------------
// The rooms

const drawRoomWalls = (c: Ctx, r: (typeof ROOMS)[number]) => {
  const CEIL = ceilOf(r.id);
  // (the wallpaper all the way up, a dado rail, the wainscot under it, the crown molding way up top)
  box(c, r.a, CEIL, r.b - r.a, GY - CEIL, r.wall);
  for (let x = r.a + 40; x < r.b; x += 80) box(c, x, CEIL + 40, 6, GY - CEIL - 200, r.trim);
  box(c, r.a, GY - 170, r.b - r.a, 170, '#1E0E0C');
  box(c, r.a, GY - 176, r.b - r.a, 8, r.trim);
  for (let x = r.a + 30; x < r.b - 60; x += 120) box(c, x, GY - 150, 90, 120, '#2A1612');
  box(c, r.a, CEIL, r.b - r.a, 30, r.trim);
  box(c, r.a, CEIL + 30, r.b - r.a, 8, INK);
  // (the sconces: a candle on a bracket, every so often; what lights the place)
  for (let x = r.a + 150; x < r.b; x += 420) { box(c, x - 8, GY - 250, 16, 4, '#57534E'); box(c, x - 2, GY - 250, 4, 14, '#57534E'); box(c, x - 3, GY - 270, 6, 20, '#F5F5F4'); }
};
/** A tall gothic window (way up: the scale of the place), moonlight through it, the curtains either side. Stamped. */
const gothicWindow = (c: Ctx, x: number, w: number, h: number) => stamp(c, `cWin:${w}:${h}`, x - 50, GY - 230 - h - w / 2 - 20, w + 100, h + w / 2 + 60, g => {
  const bot = GY - 230, top = bot - h;
  box(g, x - 10, top - w / 2 - 6, w + 20, h + w / 2 + 16, '#2A2224');
  // (the arch, in steps)
  for (let k = 0; k < 6; k++) { const inset = Math.round((w / 2) * (1 - Math.sqrt(1 - ((k + 1) / 6) ** 2))); box(g, x + inset, top - (k + 1) * (w / 12), w - inset * 2, w / 12 + 1, '#1E3A5F'); }
  box(g, x, top, w, h, '#1E3A5F');
  for (let k = 0; k < 5; k++) box(g, x + 6 + k * 10, top + 20 + k * 30, 8, 60, '#2F5A85');
  box(g, x + w / 2 - 3, top - w / 2, 6, h + w / 2, '#2A2224'); for (let y = top + 50; y < bot; y += 70) box(g, x, y, w, 5, '#2A2224');
  box(g, x - 4, bot, w + 8, 10, '#5A4A44');
  // (the curtains, heavy, tied back)
  for (const cx of [x - 34, x + w + 8]) { box(g, cx, top - w / 2 - 10, 26, h + w / 2 + 30, '#5A0E1A'); box(g, cx + 4, top - w / 2 - 10, 5, h + w / 2 + 30, '#7A1E2A'); box(g, cx - 2, bot - 120, 30, 8, '#C9A227'); }
  box(g, x - 44, top - w / 2 - 18, w + 88, 10, '#3A2A10');
});
/** A fireplace, big as a garage: the stone surround, the mantel, the opening (its fire drawn live). */
const fireplace = (c: Ctx, x: number, f: number) => {
  stamp(c, 'cFireplace', x - 130, GY - 260, 260, 260, g => {
    box(g, x - 120, GY - 230, 240, 230, '#5A524C'); for (let y = GY - 220; y < GY; y += 26) for (let bx = x - 116 + ((y / 26) % 2) * 20; bx < x + 110; bx += 40) box(g, bx, y, 36, 22, '#6A625C');
    box(g, x - 130, GY - 250, 260, 22, '#7A6A60'); box(g, x - 130, GY - 250, 260, 4, '#9A8A80');
    box(g, x - 80, GY - 170, 160, 170, '#0E0606');
    box(g, x - 50, GY - 14, 100, 8, '#3A2416'); box(g, x - 40, GY - 22, 80, 8, '#4A2A16');
  });
  for (let k = 0; k < 6; k++) { const h = 30 + Math.sin(f * 0.3 + k * 1.9) * 12 + (k % 2) * 14; box(c, x - 46 + k * 15, GY - 22 - h, 12, h, k % 2 ? '#F97316' : '#EA580C'); box(c, x - 43 + k * 15, GY - 22 - h * 0.5, 6, h * 0.5, '#FDE047'); }
};
/** A candelabra (three candles, lit), its foot at (x, y). */
const candelabra = (c: Ctx, x: number, y: number, f: number) => {
  box(c, x - 8, y - 4, 16, 4, '#A16207'); box(c, x - 2, y - 26, 4, 22, '#A16207'); box(c, x - 14, y - 28, 28, 4, '#A16207');
  for (const dx of [-12, 0, 12]) { box(c, x + dx - 2, y - 40, 4, 12, '#F5F5F4'); box(c, x + dx - 1, y - 47 - ((f + dx) % 7 < 3 ? 1 : 0), 3, 6, '#FDBA74'); }
};
/** A portrait's eyes, following him (live, over the stamped painting): two pupils turned his way. */
const eyesFollow = (c: Ctx, state: GameState, x: number, y: number) => {
  const p = state.player, dx = Math.sign(p.pos.x + p.width / 2 - x), dy = p.pos.y + 30 > y ? 1 : 0;
  box(c, x - 7, y - 1, 5, 4, '#F5F5F4'); box(c, x + 2, y - 1, 5, 4, '#F5F5F4');
  box(c, x - 6 + dx * 1.5 + 0.5, y + dy, 2, 2, INK); box(c, x + 3 + dx * 1.5 + 0.5, y + dy, 2, 2, INK);
};
/** Each room's windows (from its left end). */
const WINDOWS: Record<string, number[]> = { foyer: [560], dining: [600, 1260], study: [1100], kitchen: [700, 1200], bedroom: [380, 1000], nursery: [320, 1180], gallery: [1450] };

/** The arch between two rooms (dark through it, the pillars either side). */
const drawArch = (c: Ctx, x: number) => {
  box(c, x - 90, GY - 420, 180, 420, '#0A0406');
  box(c, x - 120, GY - 470, 40, 470, '#4A3A34'); box(c, x + 80, GY - 470, 40, 470, '#4A3A34');
  box(c, x - 120, GY - 470, 240, 50, '#5A4A44');
  box(c, x - 116, GY - 466, 8, 466, '#7A6A64'); box(c, x + 84, GY - 466, 8, 466, '#7A6A64');
};

/** A suit of armor on a plinth (scenery: dimmed back). */
const armor = (c: Ctx, x: number) => stamp(c, `cArmor`, x - 30, GY - 170, 60, 170, g => {
  box(g, x - 26, GY - 26, 52, 26, '#2A2422');
  box(g, x - 12, GY - 150, 24, 30, '#5A5E66'); box(g, x - 16, GY - 120, 32, 50, '#4E525A'); box(g, x - 12, GY - 70, 10, 44, '#4E525A'); box(g, x + 2, GY - 70, 10, 44, '#4E525A');
  box(g, x - 6, GY - 140, 16, 3, '#111111'); box(g, x + 18, GY - 168, 4, 142, '#6B5A40'); box(g, x + 12, GY - 168, 16, 18, '#7A7E86');
});
const portrait = (c: Ctx, x: number, y: number, w: number, h: number, i: number) => stamp(c, `cPortrait:${i % 6}:${w}`, x - 6, y - 6, w + 12, h + 12, g => {
  box(g, x - 6, y - 6, w + 12, h + 12, '#6B4E10'); box(g, x - 2, y - 2, w + 4, h + 4, '#3A2A08');
  box(g, x, y, w, h, ['#3A2E3A', '#2E3A34', '#3A3428', '#342A2E', '#2A303A', '#3A2A26'][i % 6]);
  // (a sitter: a head, the shoulders, and how they went)
  const cx = x + w / 2;
  box(g, cx - w * 0.3, y + h * 0.6, w * 0.6, h * 0.4, '#1E1A22');
  box(g, cx - 10, y + h * 0.3, 20, 24, '#C9A98A');
  box(g, cx - 6, y + h * 0.3 + 8, 4, 3, INK); box(g, cx + 3, y + h * 0.3 + 8, 4, 3, INK);
  if (i % 3 === 0) box(g, cx - 3, y + h * 0.3 + 16, 7, 7, '#7E22CE'); // (the grape)
  else box(g, cx - 4, y + h * 0.3 + 17, 8, 2, INK);
});
const bookcase = (c: Ctx, x: number, w: number, h: number, i: number) => stamp(c, `cBooks:${w}:${h}:${i % 3}`, x, GY - h, w, h, g => {
  box(g, x, GY - h, w, h, '#2A1A0E');
  const cols = ['#7F1D1D', '#1E3A8A', '#14532D', '#78350F', '#4C1D95', '#A16207'];
  for (let y = GY - h + 12; y < GY - 20; y += 44) {
    box(g, x + 4, y + 34, w - 8, 6, '#4A3018');
    for (let bx = x + 8, k = i; bx < x + w - 14; k++) { const bw = 6 + (k * 7) % 7, bh = 22 + (k * 5) % 10; box(g, bx, y + 34 - bh, bw, bh, cols[k % cols.length]); bx += bw + 1; }
  }
});

// ---------------------------------------------------------------------------------------------------------------
// The set pieces

const drawChandelier = (c: Ctx, x: number, y: number, lit: boolean, f: number, shake: number) => {
  const jx = shake ? Math.sin(f * 1.7) * shake : 0;
  box(c, x - 2 + jx * 0.3, CEIL + 30, 4, y - CEIL - 30, '#3F3A36');
  box(c, x - CHAND_W / 2 + jx, y, CHAND_W, 10, '#A16207'); box(c, x - CHAND_W / 2 + jx, y, CHAND_W, 3, '#FACC15');
  box(c, x - 30 + jx, y + 10, 60, 14, '#854D0E');
  for (let k = -2; k <= 2; k++) {
    const cx = x + k * 20 + jx;
    box(c, cx - 3, y - 18, 6, 18, '#F5F5F4');
    if (lit) box(c, cx - 2, y - 26 - ((f + k * 3) % 6 < 3 ? 1 : 0), 4, 7, '#FDBA74');
  }
  for (let k = -3; k <= 3; k++) box(c, x + k * 13 + jx - 1, y + 24, 3, 10 + (k & 1) * 6, '#E0F2FE');
};
const drawWreck = (c: Ctx, x: number, y: number) => {
  box(c, x - CHAND_W / 2 - 6, y - 10, CHAND_W + 12, 10, '#854D0E'); box(c, x - CHAND_W / 2, y - 14, 30, 6, '#A16207');
  for (let k = 0; k < 7; k++) box(c, x - 40 + k * 13, y - 4 - (k % 3) * 2, 4, 3, '#E0F2FE');
  box(c, x + 10, y - 20, 6, 10, '#F5F5F4');
};

const drawStove = (c: Ctx, x: number, w: number, i: number, t: number, f: number) => {
  const ph = stovePhase(t, i), hot = ph !== 'off';
  // (a big black iron range: the body, two oven doors with their windows (glowing when it's about to go), the knobs,
  // the handle rails, the feet)
  box(c, x - 2, STOVE_TOP - 2, w + 4, GY - STOVE_TOP + 2, INK);
  box(c, x, STOVE_TOP, w, GY - STOVE_TOP - 6, '#2E2E33');
  box(c, x + 6, STOVE_TOP + 8, w - 12, 6, '#52525B');
  for (let k = 0; k < 6; k++) box(c, x + 18 + k * ((w - 36) / 5) - 4, STOVE_TOP + 9, 8, 4, '#A1A1AA');
  for (const ox of [x + 12, x + w / 2 + 6]) {
    const ow = w / 2 - 18;
    box(c, ox, STOVE_TOP + 22, ow, GY - STOVE_TOP - 34, '#1C1C20'); box(c, ox, STOVE_TOP + 22, ow, 3, '#3F3F46');
    box(c, ox + 14, STOVE_TOP + 34, ow - 28, 18, hot ? (ph === 'fire' || (f >> 2) % 2 ? '#F97316' : '#7C2D12') : '#18181B');
    box(c, ox + 8, STOVE_TOP + 26, ow - 16, 3, '#D4D4D8');
  }
  for (const fx of [x + 6, x + w - 18]) box(c, fx, GY - 8, 12, 8, '#18181B');
  box(c, x, STOVE_TOP, w, 4, '#D4D4D8'); // (the lit lip: stand on it, between flare-ups)
  // (the burners: iron rings on the top, red-hot when they're going)
  for (const [bx, bw] of BURNERS) {
    box(c, x + bx - 2, STOVE_TOP - 6, bw + 4, 6, INK);
    box(c, x + bx, STOVE_TOP - 5, bw, 4, ph === 'off' ? '#52525B' : ph === 'tell' ? ((f >> 2) % 2 ? '#DC2626' : '#7F1D1D') : '#EF4444');
    for (let k = 1; k < 4; k++) box(c, x + bx + k * (bw / 4) - 1, STOVE_TOP - 6, 2, 6, INK);
    if (ph === 'tell' && (f >> 2) % 2) for (let k = 0; k < 3; k++) box(c, x + bx + 10 + k * 22, STOVE_TOP - 12 - ((f + k * 5) % 10), 6, 6, '#F97316');
  }
};
/** The burners' flames (over everything behind: drawn in front of him). */
export const drawStoveFire = (c: Ctx, state: GameState, cs: Castle) => {
  c.save(); c.translate(0, DY.kitchen);
  const f = state.frame;
  STOVES.forEach(([x], i) => {
    if (!seen(state, x, x + 300) || stovePhase(cs.stoveT, i) !== 'fire') return;
    const k = ((cs.stoveT + i * 100) % STOVE_CYCLE) - (STOVE_CYCLE - STOVE_FIRE);
    const h = FIRE_H * Math.min(1, k / 8) * (k > STOVE_FIRE - 10 ? (STOVE_FIRE - k) / 10 : 1);
    for (const [bx, bw] of BURNERS) {
      for (let j = 0; j < 5; j++) {
        const fh = h * (0.7 + 0.3 * Math.sin(f * 0.5 + j * 1.3)), fx = x + bx + j * (bw / 5);
        box(c, fx, STOVE_TOP - fh, bw / 5 + 1, fh, j % 2 ? '#F97316' : '#FB923C');
        box(c, fx + 2, STOVE_TOP - fh * 0.6, bw / 5 - 3, fh * 0.6, '#FDE047');
      }
    }
  });
  c.restore();
};

const drawBed = (c: Ctx) => {
  const { x, w, top } = BED;
  stamp(c, 'cBed', x - 10, GY - 380, w + 20, 380, g => {
    // (the posts, up to the canopy; the canopy itself is a ledge, drawn with the rest)
    for (const px of [x - 6, x + w - 6]) box(g, px, GY - 370, 12, 370, '#3A1A10');
    box(g, x, top + 20, w, GY - top - 20, '#3A1A10');
    box(g, x, top, w, 26, '#E2E8F0'); box(g, x, top, w, 4, '#FFFFFF');
    box(g, x + 10, top - 14, 90, 16, '#F8FAFC'); box(g, x + 10, top - 14, 90, 3, '#FFFFFF');
    box(g, x + 120, top + 4, w - 130, 22, '#9F1239');
    // (the curtains, hanging from the canopy, pulled back)
    box(g, x + 6, GY - 352, 22, 220, '#7F1D1D'); box(g, x + w - 28, GY - 352, 22, 220, '#7F1D1D');
  });
};
const drawWardrobe = (c: Ctx, x: number, open: boolean) => {
  box(c, x - 60, GY - 300, 120, 300, '#2A1408'); box(c, x - 54, GY - 290, 108, 284, '#3A2010');
  if (open) { box(c, x - 54, GY - 290, 54, 284, '#050203'); box(c, x - 110, GY - 290, 54, 284, '#4A2814'); }
  else { box(c, x - 2, GY - 290, 4, 284, '#1A0A04'); box(c, x - 12, GY - 160, 4, 14, '#C9A227'); box(c, x + 8, GY - 160, 4, 14, '#C9A227'); }
  box(c, x - 64, GY - 308, 128, 12, '#4A2814');
};
const drawTrain = (c: Ctx, x: number, dir: number, f: number) => {
  const y = GY - TRAIN.h;
  box(c, x, y + 6, TRAIN.w, TRAIN.h - 12, '#B91C1C'); box(c, x, y + 6, TRAIN.w, 3, '#FCA5A5');
  const front = dir > 0 ? x + TRAIN.w - 26 : x;
  box(c, front, y - 8, 26, TRAIN.h - 2, '#1E3A8A');
  box(c, dir > 0 ? x + 8 : x + TRAIN.w - 18, y - 6, 10, 12, '#27272A');
  if ((f >> 3) % 2) box(c, dir > 0 ? x + 6 : x + TRAIN.w - 20, y - 16 - (f % 8), 14, 8, 'rgba(229, 231, 235, 0.6)');
  for (const wx of [x + 12, x + TRAIN.w - 22]) box(c, wx, GY - 10, 12, 10, '#111827');
  box(c, dir > 0 ? x + TRAIN.w : x - 6, GY - 14, 6, 8, '#FACC15');
};

// ---------------------------------------------------------------------------------------------------------------
// The whole of it

/** The castle, a room at a time, each on its own floor: drawn in the room's own coordinates (its floor at GY), clipped
 *  to it, moved up or down to where it is. */
export const drawCastleBack = (c: Ctx, state: GameState, cs: Castle) => {
  for (const r of ROOMS) {
    if (!seen(state, r.a - 150, r.b + 150)) continue;
    c.save();
    c.beginPath(); c.rect(r.a, -100000, r.b - r.a, 200000); c.clip();
    c.translate(0, DY[r.id]);
    drawRoom(c, state, cs, r);
    c.restore();
  }
  // (the dining room's rotten floorboards at its far end, broken through: the way down to the kitchen)
  if (seen(state, ROOMS[1].b - 120, ROOMS[1].b + 20)) {
    const x = ROOMS[1].b;
    for (let k = 0; k < 5; k++) { c.save(); c.translate(x - 20 - k * 14, GY + 6 + k * 3); c.rotate(0.5 + k * 0.2); box(c, 0, 0, 40, 8, '#5A3420'); c.restore(); }
    wallSign(c, x - 120, GY - 120, 'SERVANTS ONLY: MIND THE FLOOR', '#3F3F46', '#E4E4E7');
  }
};
const drawRoom = (c: Ctx, state: GameState, cs: Castle, only: (typeof ROOMS)[number]) => {
  const f = state.frame;
  for (const r of [only]) {
    drawRoomWalls(c, r);
    // (the windows, way up: how big the place is)
    for (const wx of WINDOWS[r.id]) gothicWindow(c, r.a + wx, 70, 300);
    // Each room's own things
    switch (r.id) {
      case 'foyer':
        armor(c, r.a + 380); armor(c, r.a + 1300);
        portrait(c, r.a + 900, GY - 640, 160, 200, 0); eyesFollow(c, state, r.a + 980, GY - 640 + 68);
        break;
      case 'dining':
        for (let k = 0; k < 4; k++) portrait(c, r.a + 220 + k * 440, GY - 620, 110, 140, k + 1);
        fireplace(c, r.a + 1700, f);
        // (the chairs along the table, dimmed back: not to stand on)
        for (let k = 0; k < 9; k++) { const cx = r.a + 330 + k * 135; box(c, cx, GY - 130, 30, 6, '#3A2216'); box(c, cx + 24, GY - 190, 6, 130, '#3A2216'); }
        break;
      case 'study':
        // (three stories of shelves, floor to ceiling)
        bookcase(c, r.a + 40, 220, 1180, 0); bookcase(c, r.a + 700, 300, 1180, 1); bookcase(c, r.a + 1380, 260, 1180, 2);
        box(c, r.a + 980, GY - 90, 160, 8, '#3A2216'); box(c, r.a + 990, GY - 82, 10, 82, '#3A2216'); box(c, r.a + 1120, GY - 82, 10, 82, '#3A2216');
        box(c, r.a + 1020, GY - 104, 50, 14, '#FEF3C7'); // (the open tome)
        fireplace(c, r.a + 560, f);
        break;
      case 'kitchen':
        for (let k = 0; k < 6; k++) { const hx = r.a + 200 + k * 260; box(c, hx, CEIL + 38, 3, 300 + (k % 3) * 40, '#52525B'); box(c, hx - 14, CEIL + 338 + (k % 3) * 40, 30, 50, '#9A3412'); }
        // (the chopping block, the cleaver in it)
        box(c, r.a + 40, GY - 70, 90, 70, '#6B4423'); box(c, r.a + 40, GY - 70, 90, 6, '#8A5A30'); box(c, r.a + 76, GY - 96, 6, 28, '#A1A1AA'); box(c, r.a + 70, GY - 100, 20, 10, '#D4D4D8');
        break;
      case 'bedroom':
        portrait(c, r.a + 1300, GY - 680, 150, 190, 4); eyesFollow(c, state, r.a + 1375, GY - 680 + 65);
        fireplace(c, r.a + 1340, f);
        break;
      case 'nursery': {
        // (the rocking horse, the blocks, the crib: dimmed toys)
        box(c, r.a + 520, GY - 90, 120, 50, '#7C2D12'); box(c, r.a + 600, GY - 130, 40, 50, '#7C2D12'); box(c, r.a + 500, GY - 10, 160, 10, '#451A03');
        for (let k = 0; k < 5; k++) box(c, r.a + 980 + k * 34, GY - 30 - (k % 2) * 30, 30, 30, ['#B91C1C', '#1D4ED8', '#CA8A04', '#15803D', '#7E22CE'][k]);
        box(c, r.a + 1300, GY - 140, 160, 140, '#3A3A5A'); for (let k = 0; k < 7; k++) box(c, r.a + 1310 + k * 22, GY - 136, 4, 110, '#6A6A9A');
        wallSign(c, (BALLPIT.a + BALLPIT.b) / 2, GY - 150, 'BALL PIT: NO SHOES, NO ESCAPE', '#1E1B4B', '#F9A8D4');
        // (the chimney the bats come out of)
        box(c, r.a + 880, CEIL + 38, 120, 260, '#2A2020'); box(c, r.a + 900, CEIL + 280, 80, 30, '#0A0606');
        break;
      }
      case 'gallery':
        for (let k = 0; k < 6; k++) { portrait(c, r.a + 160 + k * 250, GY - 560 + (k % 2) * 40, 150, 200, k); eyesFollow(c, state, r.a + 235 + k * 250, GY - 560 + (k % 2) * 40 + 68); }
        // (the empty frame at the end: his)
        box(c, r.b - 330, GY - 600, 190, 250, '#6B4E10'); box(c, r.b - 320, GY - 590, 170, 230, '#140A0A');
        wallSign(c, r.b - 235, GY - 330, 'RESERVED', '#3A0A0A', '#FCA5A5');
        break;
    }
    if (r !== ROOMS[0]) drawArch(c, r.a);
    wallSign(c, r.a + 300, GY - 330, r.name, '#4A0E0E', '#FDE68A');
    for (let x = r.a + 150; x < r.b; x += 420) box(c, x - 2, GY - 279 - ((f + x) % 9 < 4 ? 1 : 0), 4, 8, '#FDBA74');
  }
  // The castle's front door (the way back out to the stairs), the stairs down to the dungeon at the far end
  if (seen(state, x0, x0 + 200)) doorway(c, x0 + 60, GY, 'EXIT', '#4A2814', cs.doorShut > 0 ? '#2A1408' : '#09090B');
  if (seen(state, x1 - 300, x1)) {
    // (the arch at the end of the gallery: stone steps going down into the dark)
    box(c, x1 - 190, GY - 230, 190, 230, '#3A3430'); box(c, x1 - 170, GY - 210, 170, 210, '#050303');
    for (let k = 0; k < 6; k++) box(c, x1 - 160 + k * 26, GY - 40 + k * 8, 160 - k * 26, 6, k < 3 ? '#3F3A36' : '#211D1A');
    wallSign(c, x1 - 95, GY - 260, 'TO THE DUNGEON', '#27272A', '#FCA5A5');
  }
  // What he can stand on
  for (const [x, y, w, look] of LEDGES) if (seen(state, x, x + w)) {
    const [fill, lip] = LOOKS[look];
    if (look === 'table') {
      // (turned legs, the tablecloth hanging down off it, scalloped; candelabras and place settings along it)
      for (const lx of [x + 20, x + w / 2 - 7, x + w - 34]) { box(c, lx, y + 16, 14, GY - y - 16, fill); box(c, lx - 3, y + 40, 20, 8, fill); }
      box(c, x - 4, y + 4, w + 8, 18, '#E7E2D6'); for (let k = x; k < x + w; k += 30) box(c, k + 6, y + 22, 18, 4, '#E7E2D6');
    }
    if (look === 'balcony') {
      // (its rail and balusters; columns holding it up, see-through between)
      box(c, x, y - 40, w, 5, '#7A4A28'); for (let bx = x + 10; bx < x + w - 10; bx += 24) box(c, bx, y - 36, 4, 36, '#5A3420');
      for (const px of [x + 8, x + w - 26]) { box(c, px, y + 16, 18, GY - y - 16, '#4A3A34'); box(c, px - 4, y + 16, 26, 10, '#5A4A44'); box(c, px - 4, GY - 12, 26, 12, '#5A4A44'); }
    }
    if (look === 'stair') { for (let bx = x + 8; bx < x + w - 4; bx += 22) box(c, bx, y + 16, 4, GY - y - 16, '#3A2216'); box(c, x - 6, y - 34, w + 12, 4, '#7A4A28'); box(c, x - 6, y - 34, 4, 34, '#7A4A28'); }
    if (look === 'shelf' || look === 'toyshelf') {
      // (on the wall, on iron brackets)
      for (const bx of [x + 16, x + w - 26]) { c.fillStyle = '#27272A'; c.beginPath(); c.moveTo(bx, y + 14); c.lineTo(bx + 10, y + 14); c.lineTo(bx + 4, y + 50); c.closePath(); c.fill(); }
    }
    if (look === 'rack') {
      // (a pot rack on chains from way up, the pots and pans hung under it)
      box(c, x + 10, CEIL + 38, 3, y - CEIL - 38, '#52525B'); box(c, x + w - 13, CEIL + 38, 3, y - CEIL - 38, '#52525B');
      for (let k = 0; k < 4; k++) { const px = x + 20 + k * ((w - 40) / 3); box(c, px, y + 14, 2, 14, '#3F3F46'); box(c, px - 12, y + 28, 24, 16, k % 2 ? '#9A3412' : '#71717A'); box(c, px + 10, y + 32, 10, 3, '#3F3F46'); }
    }
    if (look === 'frame') {
      // (a huge gilt frame on the wall, its top edge his to stand on; an ancestor in it, watching him)
      box(c, x, y + 10, w, 170, '#8A6A14'); box(c, x + 10, y + 20, w - 20, 150, '#2A2430');
      box(c, x + w / 2 - 14, y + 50, 28, 32, '#C9A98A'); box(c, x + w / 2 - 34, y + 90, 68, 80, '#1E1A22');
      eyesFollow(c, state, x + w / 2, y + 62);
    }
    if (look === 'cauldron') {
      // (the stone hearth (solid: up onto it), the cauldron on it, bubbling green)
      box(c, x - 2, y - 2, w + 4, GY - y + 2, INK); box(c, x, y, w, GY - y, '#57524C'); for (let yy = y + 14; yy < GY; yy += 22) box(c, x + 4, yy, w - 8, 3, '#45403B');
      box(c, x + 70, y - 70, 110, 64, '#18181B'); box(c, x + 60, y - 74, 130, 10, '#27272A');
      box(c, x + 70, y - 80, 110, 8, '#22C55E'); for (let k = 0; k < 4; k++) { const ph = (f + k * 13) % 30; if (ph < 18) box(c, x + 80 + k * 24, y - 84 - ph * 0.6, 8, 8, '#4ADE80'); }
    }
    ledgeBox(c, x, y, w, fill, lip);
    if (look === 'table') for (let k = x + 90; k < x + w - 40; k += 200) { candelabra(c, k, y, f); box(c, k + 60, y - 3, 26, 3, '#F5F5F4'); box(c, k + 66, y - 6, 14, 3, '#B45309'); }
  }
  // The set pieces
  if (seen(state, BED.x, BED.x + BED.w)) drawBed(c);
  WARDROBES.forEach((x, i) => { if (seen(state, x - 120, x + 120)) drawWardrobe(c, x, cs.wardrobe[i]); });
  STOVES.forEach(([x, w], i) => { if (seen(state, x, x + w)) drawStove(c, x, w, i, cs.stoveT, f); });
  BOOKCASES.forEach(([x, y], i) => {
    if (!seen(state, x - 100, x + 100)) return;
    const t = cs.shelfT[i], rattle = t > 0 && t < BOOK_TELL ? Math.sin(f * 2.3) * 2 : 0;
    box(c, x - 40 + rattle, y - 120, 80, 120 + (GY - y), '#2A1A0E');
    for (let k = 0; k < 3; k++) { box(c, x - 34, y - 110 + k * 40, 68, 4, '#4A3018'); for (let b = 0; b < 6; b++) box(c, x - 30 + b * 11 + rattle, y - 132 + k * 40, 8, 22, ['#7F1D1D', '#1E3A8A', '#14532D'][(b + k) % 3]); }
    void BOOK_EVERY;
  });
  for (const ch of cs.chand) if (seen(state, ch.x - 60, ch.x + 60)) {
    if (ch.state === 'down') drawWreck(c, ch.x, ch.y);
    else drawChandelier(c, ch.x, ch.y, true, f, ch.state === 'tell' ? 2 : 0);
    // (its shadow on the table under it, growing as it creaks: where not to be)
    if (ch.state === 'tell' || ch.state === 'hang') { const a = ch.state === 'tell' ? 0.45 : 0.18; c.fillStyle = `rgba(0, 0, 0, ${a})`; c.fillRect(ch.x - CHAND_W / 2, GY - 76, CHAND_W, 4); }
  }
  if (seen(state, cs.train.x - 40, cs.train.x + 120)) drawTrain(c, cs.train.x, cs.train.dir, f);
  // (the track it runs on)
  if (seen(state, TRAIN.a, TRAIN.b)) { box(c, TRAIN.a, GY - 3, TRAIN.b - TRAIN.a + TRAIN.w, 3, '#57534E'); for (let x = TRAIN.a; x < TRAIN.b + TRAIN.w; x += 24) box(c, x, GY - 4, 10, 4, '#3F2A1A'); }
  const talking = !!paSaying(state);
  for (const [hx, hy] of HORNS) if (seen(state, hx - 30, hx + 30)) drawHorn(c, hx, hy, talking, f);
  // The floor
  groundBox(c, only.a - 10, only.b + 10, GY, '#4A1418', '#B45353');
  box(c, only.a + 80, GY + 6, only.b - only.a - 160, 30, '#6B1A22');
};

/** The ball pit: a pit of plastic balls (in front of him: he's in up to his thighs), its padded rim, its sign. */
export const drawBallPit = (c: Ctx, state: GameState) => {
  const { a, b } = BALLPIT;
  if (!seen(state, a - 40, b + 40)) return;
  c.save(); c.translate(0, DY.nursery);
  const cols = ['#EF4444', '#3B82F6', '#FACC15', '#22C55E', '#A855F7', '#F97316'];
  box(c, a, GY + 8, b - a, 60, '#1E1B4B');
  for (let row = 0; row < 4; row++) for (let x = a + 4 + (row % 2) * 7; x < b - 6; x += 14) {
    const y = GY + 4 + row * 9 + Math.sin(state.frame * 0.05 + x) * 1;
    c.fillStyle = cols[(x * 7 + row * 3) % cols.length | 0]; c.beginPath(); c.arc(x, y, 6, 0, Math.PI * 2); c.fill();
  }
  box(c, a - 10, GY - 4, 12, 70, '#DB2777'); box(c, b - 2, GY - 4, 12, 70, '#DB2777');
  box(c, a - 10, GY - 4, 12, 3, '#F9A8D4'); box(c, b - 2, GY - 4, 12, 3, '#F9A8D4');
  c.restore();
};

/** The books in the air (over everything: they're coming at him). */
export const drawBooks = (c: Ctx, cs: Castle) => {
  for (const b of cs.books) {
    c.save(); c.translate(b.x, b.y + DY.study); c.rotate(b.rot);
    box(c, -9, -6, 18, 12, b.col); box(c, -9, -6, 18, 2, '#FEF3C7'); box(c, -9, -6, 3, 12, '#1A0A04');
    c.restore();
  }
};

/** Candlelight: the dark of the castle, the chandeliers and sconces glowing (near the screen only). */
export const castleLighting = (state: GameState, cs: Castle): SceneLight => {
  const lights: Light[] = [];
  const near = (x: number) => x > state.camera.x - 300 && x < state.camera.x + CANVAS_WIDTH + 300;
  for (const ch of cs.chand) if (near(ch.x) && ch.state !== 'down') lights.push({ x: ch.x, y: ch.y - 10 + dyAt(ch.x), r: 260, a: 0.8, color: 'rgba(253, 186, 116, 0.10)' });
  for (const r of ROOMS) for (let x = r.a + 150; x < r.b; x += 420) if (near(x)) lights.push({ x, y: GY - 260 + DY[r.id], r: 230, a: 0.6, color: 'rgba(253, 186, 116, 0.06)' });
  STOVES.forEach(([x, w], i) => { if (near(x) && stovePhase(cs.stoveT, i) === 'fire') lights.push({ x: x + w / 2, y: STOVE_TOP - 60 + dyAt(x), r: 260, a: 0.9, color: 'rgba(251, 146, 60, 0.18)' }); });
  return { dark: 0.42, shade: [26, 6, 14], lights };
};
