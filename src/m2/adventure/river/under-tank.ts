// The tank (final pass): SEA MONSTERS OF THE MESOZOIC, indoors. From the water: the tank's back wall (painted faux
// rock) with the big acrylic window let into it (its frame, its seams, the reflections sliding on it), and through the
// window the viewing gallery: a dark room (its ceiling's tiles running back, the carpet, the placards on its wall under
// their little lamps, the EXIT sign), the guests in it lit only by the tank's glow. Over the water: the exhibit hall's
// painted backdrop, the truss and its spotlights, the banner hung off it. The plesiosaur on its track, the track's
// pylons down to the gravel. Then the storm drain: the intake's pipe, the current through it, the burst grate.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { box, mix, rampOf, checker, stamp, hash, sign, pole, steppedGlow, hazeBands, INK } from '../../intro/art/kit';
import { signAt, plank, enamel, print, stone, stencil, led, dino } from '../letters';
import { drawGuestsDimmed } from '../queue/crowd';
import type { River } from './index';
import { WS, TANK, PIPE, GALLERY } from './course';
import { R, viewOf, onScreen, offX, offY, pX, pY, unX, causticFill, ray, type Ctx, type V } from './under';
import { shade } from './under-scenery';

const WIN = { x1: R(GALLERY.x1), x2: R(GALLERY.x2), top: GALLERY.glassTop, sill: 986 };
const T1 = R(TANK.x1), T2 = R(TANK.x2);
const FLOOR = GALLERY.floor;
/** The gallery's back wall's plane; its ceiling (world y, at the window's front: hidden behind the header). */
const S_ROOM = 0.72, ROOM_CEIL = 650;
const HALL_CEIL = 170;

// ---------------------------------------------------------------------------------------------------------------
// Behind the wobble: the tank's back wall (faux rock round the window), the pipe's insides

const ROCKW = ['#18304A', '#22405C', '#2E5270', '#3E6684', '#567E9A'];
const paintTankWall = (g: Ctx, i: number, a: number) => {
  box(g, a, WS, 400, 1040 - WS, ROCKW[2]);
  // (sculpted concrete made to look like rock: lumps, each lit on top and shaded under, the cracks between)
  for (let k = 0; k < 40; k++) {
    const rx = a + Math.floor(hash(i * 97 + k) * 400), ry = WS + Math.floor(hash(i * 53 + k * 7) * (1040 - WS)), rw = 30 + Math.floor(hash(k + i) * 50), rh = 16 + Math.floor(hash(k * 3 + i) * 20);
    box(g, rx, ry, rw, rh, ROCKW[k % 2 ? 1 : 3]); box(g, rx, ry, rw, 2, ROCKW[4]); box(g, rx, ry + rh - 2, rw, 2, ROCKW[0]);
  }
  checker(g, a, WS, 400, 6, '#5A7A50');
  box(g, a, WS, 400, 3, '#6A7A5A');
};

export const drawTankBack = (c: Ctx, state: GameState) => {
  const v = viewOf(state);
  if (onScreen(v, T1, T2)) {
    for (let k = Math.floor((Math.max(T1, v.l) - T1) / 400); T1 + k * 400 < Math.min(T2, v.r); k++) {
      const a = T1 + k * 400;
      stamp(c, `uw-tankwall-${k}`, a, WS, 400, 1040 - WS, g => paintTankWall(g, k, a));
    }
  }
  if (onScreen(v, R(PIPE.x1) - 60, R(PIPE.x2))) drawPipeInside(c, v);
};

/** The intake pipe from inside (its near half cut away): the far wall curving, the ring joints, the current. */
const drawPipeInside = (c: Ctx, v: V) => {
  const a = Math.max(T2, v.l - 4), b = Math.min(R(PIPE.x2), v.r + 4), top = PIPE.top, bot = 1000;
  const bands = ['#0A1A20', '#12262E', '#1A323A', '#223C44', '#1A323A', '#12262E', '#0A1A20'];
  const h = (bot - top) / bands.length;
  bands.forEach((col, k) => box(c, a, Math.round(top + k * h), b - a, Math.ceil(h) + 1, col));
  // (the joints: rings every so far, in perspective a little)
  for (let wx = Math.floor((a - R(0)) / 80) * 80; R(wx) < b; wx += 80) {
    const x = R(wx), bx = pX(v, 0.85, x);
    box(c, Math.round((x + bx) / 2), top, 2, bot - top, '#061014'); box(c, Math.round((x + bx) / 2) + 2, top + 10, 1, bot - top - 20, '#2E4A52');
  }
  // (the current: streaks pulling toward the end, faster further in)
  for (let k = 0; k < 26; k++) {
    const y = top + 8 + hash(k * 3.3) * (bot - top - 16), sp = 3 + hash(k) * 4;
    const x = R(PIPE.x1) + ((v.f * sp + hash(k * 7) * 2000) % (PIPE.x2 - PIPE.x1));
    if (x < a || x > b) continue;
    box(c, Math.round(x), Math.round(y), 10 + sp * 3, 1, 'rgba(190, 230, 240, 0.4)');
  }
  // (the end: the grate's been burst open, bars bent in; past it, a light: the way out)
  const ex = R(PIPE.x2 - 40);
  if (ex < b + 40) {
    box(c, ex, top, 40, bot - top, '#020608');
    steppedGlow(c, ex + 30, (top + bot) / 2, 30, mix('#FFF0C0', v.tod.sunGlow, 0.5), 0.25, 0.02, 4);
    box(c, ex - 4, top, 6, bot - top, '#3A3A34'); box(c, ex - 4, top, 2, bot - top, '#7A7A6A');
    for (let k = 0; k < 5; k++) {
      const by = top + 12 + k * 18, bend = k === 2 ? 26 : k === 3 ? 14 : 4;
      c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(ex, by); c.quadraticCurveTo(ex - bend, by + 6, ex - bend * 1.4, by + 2); c.stroke();
      c.strokeStyle = '#6A6A5E'; c.lineWidth = 3; c.beginPath(); c.moveTo(ex, by); c.quadraticCurveTo(ex - bend, by + 6, ex - bend * 1.4, by + 2); c.stroke();
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The gallery, through the glass

const WALL = ['#0A1428', '#101E38', '#16284A', '#1E345C', '#2A4470'];
const CHUNK = 300;

/** The gallery's back wall, a chunk: placards under their lamps, the EXIT, the gift shop's doorway, a bench, a fountain. */
const paintRoomWall = (g: Ctx, i: number, u0: number, top: number, bot: number) => {
  box(g, u0, top, CHUNK, bot - top, WALL[2]);
  checker(g, u0, top, CHUNK, 4, WALL[1]);
  // (the wainscot rail, the baseboard)
  box(g, u0, bot - 92, CHUNK, 4, WALL[3]); box(g, u0, bot - 88, CHUNK, 2, WALL[0]);
  box(g, u0, bot - 92, CHUNK, 92, WALL[1]);
  box(g, u0, bot - 10, CHUNK, 10, '#06080E');
  const kind = i % 6;
  const placard = (x: number, y: number, w: number, h: number, title: string, lines: string[]) => {
    // (its little brass lamp over it, the pool of light down it)
    box(g, x + w / 2 - 10, y - 14, 20, 4, '#8A7A3A'); box(g, x + w / 2 - 1, y - 18, 2, 6, '#5A4A1A');
    g.fillStyle = 'rgba(255, 230, 170, 0.08)'; g.beginPath(); g.moveTo(x + w / 2 - 10, y - 10); g.lineTo(x + w / 2 + 10, y - 10); g.lineTo(x + w + 10, y + h + 6); g.lineTo(x - 10, y + h + 6); g.fill();
    box(g, x - 3, y - 3, w + 6, h + 6, '#05070C'); box(g, x - 2, y - 2, w + 4, h + 4, '#3A3420');
    box(g, x, y, w, h, '#D8D0B8'); box(g, x, y, w, 10, '#2A4A6A');
    signAt(g, title, x + w / 2, y + 8, 5, print(5, '#F2E8C8'));
    lines.forEach((l, k) => signAt(g, l, x + w / 2, y + 20 + k * 9, 5, print(5, '#2A2418')));
  };
  if (kind === 0) {
    placard(u0 + 60, top + 120, 180, 70, 'PLESIOSAURUS', ['"NESSIE"', 'LATE CRETACEOUS', 'ANIMATRONIC, 1987']);
  } else if (kind === 1) {
    // (the EXIT: lit red, glowing on the wall round it)
    steppedGlow(g, u0 + 70, top + 70, 34, '#FF3020', 0.18, 0.02, 4);
    box(g, u0 + 44, top + 62, 52, 18, '#2A0A0A'); signAt(g, 'EXIT', u0 + 70, top + 75, 8, led(8, '#FF5040', '#2A0A0A'));
    // (the doorway under it, dark, a sliver of the corridor's light)
    box(g, u0 + 40, bot - 150, 60, 150, '#04060A'); box(g, u0 + 40, bot - 150, 60, 3, WALL[3]); box(g, u0 + 96, bot - 140, 4, 140, '#1A2030');
    placard(u0 + 150, top + 130, 120, 54, 'DID YOU KNOW?', ['PLESIOSAURS WERE', 'NOT DINOSAURS.', 'NEITHER IS THIS.']);
  } else if (kind === 2) {
    placard(u0 + 50, top + 120, 200, 40, 'PLEASE DO NOT', ['TAP ON THE GLASS']);
    // (the drinking fountain, taped up)
    box(g, u0 + 210, bot - 70, 40, 30, '#8A9098'); box(g, u0 + 210, bot - 70, 40, 3, '#C0C8D0'); box(g, u0 + 222, bot - 40, 16, 40, '#5A6068');
    box(g, u0 + 194, bot - 63, 72, 11, '#E8E0B0'); box(g, u0 + 192, bot - 62, 5, 3, '#D8D4C8'); box(g, u0 + 263, bot - 62, 5, 3, '#D8D4C8'); signAt(g, 'OUT OF ORDER', u0 + 230, bot - 55, 4, plank(4, '#2A2418', undefined, undefined, 9));
  } else if (kind === 3) {
    // (the gift shop's doorway, lit warm, an arrow over it)
    box(g, u0 + 100, bot - 160, 90, 160, '#3A2A10'); box(g, u0 + 104, bot - 156, 82, 156, '#6A4A18');
    for (let k = 0; k < 4; k++) box(g, u0 + 110 + k * 20, bot - 120, 12, 16, ['#E04040', '#40A0E0', '#E0C040', '#40C060'][k]);
    sign(g, u0 + 92, bot - 196, 106, 22, '#E8C030', 'GIFT SHOP', '#3A1A08', 7);
    placard(u0 + 220, top + 140, 70, 40, 'RESTROOMS', ['THIS WAY', '<--']);
  } else if (kind === 4) {
    placard(u0 + 40, top + 110, 220, 80, 'MOSASAURUS', ['ARRIVING SPRING 1995!', 'BIGGER! TOOTHIER!', 'PLEASE PARDON OUR DUST']);
  } else {
    // (a fire extinguisher's cabinet, a trash can)
    box(g, u0 + 60, top + 160, 34, 52, '#7A1010'); box(g, u0 + 64, top + 164, 26, 44, '#B83030'); box(g, u0 + 70, top + 170, 14, 32, '#E04040'); signAt(g, 'FIRE', u0 + 77, top + 156, 4, print(4, '#E0D0C0'));
    box(g, u0 + 200, bot - 46, 30, 46, '#2A3A2A'); box(g, u0 + 196, bot - 50, 38, 6, '#3A4A3A');
    placard(u0 + 130, top + 100, 110, 40, 'FEEDINGS', ['11AM  2PM  4PM']);
  }
  // (the exhibit's own title, painted along the top of the wall, every so far)
  if (i % 3 === 1) signAt(g, 'SEA MONSTERS OF THE MESOZOIC', u0 + CHUNK / 2, top + 40, 7, enamel({ sx: 1, sy: 2 }, '#5A86B8', '#06080E'));
};

/** The room through the window: its back wall, the ceiling running back, the carpet, the guests, the tank's light on it. */
const drawRoom = (c: Ctx, state: GameState, rv: River, v: V) => {
  c.save();
  c.beginPath(); c.rect(WIN.x1, WIN.top, WIN.x2 - WIN.x1, WIN.sill - WIN.top); c.clip();
  const s = S_ROOM, ox = offX(v, s), oy = offY(v, s);
  const top = Math.round(ROOM_CEIL * s), bot = Math.round(FLOOR * s);
  const a = unX(v, s, Math.max(WIN.x1, v.l)), b = unX(v, s, Math.min(WIN.x2, v.r));
  c.save(); c.translate(ox, oy);
  for (let i = Math.floor(a * s / CHUNK); i * CHUNK < b * s; i++) stamp(c, `uw-room-${i}`, i * CHUNK, top, CHUNK, bot - top, g => paintRoomWall(g, i, i * CHUNK, top, bot));
  c.restore();
  // (the ceiling: acoustic tiles running back to the wall, a recessed light now and then)
  const backC = pY(v, s, ROOM_CEIL);
  if (backC > WIN.top) {
    const span = backC - ROOM_CEIL;
    for (let k = 0; k < 3; k++) box(c, WIN.x1, Math.round(ROOM_CEIL + span * k / 3), WIN.x2 - WIN.x1, Math.ceil(span / 3) + 1, ['#1A2234', '#141C2C', '#0E1422'][k]);
    for (let wx = Math.floor((WIN.x1 - R(0)) / 60) * 60; R(wx) < WIN.x2 + 60; wx += 60) {
      const fx = R(wx), bx = pX(v, s, fx);
      for (let k = 0.05; k < 1; k += 0.12) box(c, Math.round(fx + (bx - fx) * k), Math.round(ROOM_CEIL + span * k), 2, 1, '#06080E');
      if (Math.round(wx / 60) % 4 === 0) { const lx = Math.round(fx + (bx - fx) * 0.6), ly = Math.round(ROOM_CEIL + span * 0.6); box(c, lx - 6, ly, 12, 2, '#C8B888'); }
    }
  }
  // (the carpet: the kind of pattern that hides anything, confetti on navy, its rows closing up into the distance)
  const backF = pY(v, s, FLOOR);
  if (backF < WIN.sill) {
    const span = FLOOR - backF;
    box(c, WIN.x1, Math.round(backF), WIN.x2 - WIN.x1, Math.ceil(span) + 1, '#141A3A');
    const conf = ['#2AA8A0', '#C83A8A', '#D8B030', '#3A58C8'];
    for (let k = 0.1; k < 1; k += 0.18) {
      const y = Math.round(backF + span * k * k);
      for (let wx = Math.floor((v.l - R(0)) / 24) * 24; R(wx) < v.r; wx += 24) {
        const fx = R(wx), bx = pX(v, s, fx), x = Math.round(bx + (fx - bx) * k * k + hash(wx + k * 100) * 8);
        box(c, x, y, 2 + Math.round(k * 2), 2, conf[(wx / 24 + Math.round(k * 10)) & 3]);
      }
    }
  }
  // (the room's ceiling where it meets the glass: a soffit, its recessed lights, their cones down the wall)
  box(c, WIN.x1, WIN.top, WIN.x2 - WIN.x1, 16, '#0C1220'); box(c, WIN.x1, WIN.top + 16, WIN.x2 - WIN.x1, 2, '#1E2A40');
  for (let x = WIN.x1 + 70; x < WIN.x2; x += 140) {
    box(c, x - 8, WIN.top + 13, 16, 3, '#E8D8A8');
    c.fillStyle = 'rgba(255, 228, 170, 0.06)'; c.beginPath(); c.moveTo(x - 8, WIN.top + 16); c.lineTo(x + 8, WIN.top + 16); c.lineTo(x + 40, WIN.top + 140); c.lineTo(x - 40, WIN.top + 140); c.fill();
  }
  // (the dark of the room, deepest up under the ceiling)
  hazeBands(c, WIN.x1, WIN.top, WIN.x2 - WIN.x1, 200, '#04060E', 0.55, 0.05, 5);
  // The guests, lit only by the tank: blue
  drawGuestsDimmed(c, rv.guests, v.f, 0.48, '16, 52, 110');
  // (the tank's light thrown into the room: the caustic net crawling over the wall and over them)
  c.beginPath(); c.rect(WIN.x1, WIN.top, WIN.x2 - WIN.x1, WIN.sill - WIN.top);
  causticFill(c, v, 0.1, '#80C0FF', ox, oy);
  c.restore();
};

/** The acrylic: the tint of the tank's water seen through it, the reflections on it, its panel seams, the frame. */
const drawGlass = (c: Ctx, rv: River, v: V) => {
  const w = WIN.x2 - WIN.x1, h = WIN.sill - WIN.top;
  c.fillStyle = 'rgba(90, 180, 230, 0.14)'; c.fillRect(WIN.x1, WIN.top, w, h);
  const st = rv.stain;
  if (st.red > 0.01) { c.fillStyle = `rgba(168, 10, 18, ${(st.red * 0.35).toFixed(3)})`; c.fillRect(WIN.x1, WIN.top, w, h); }
  if (st.brown > 0.01) { c.fillStyle = `rgba(104, 68, 22, ${(st.brown * 0.3).toFixed(3)})`; c.fillRect(WIN.x1, WIN.top, w, h); }
  // (the reflections: slanted bands, two widths, sliding the other way as he goes by)
  c.save(); c.beginPath(); c.rect(WIN.x1, WIN.top, w, h); c.clip();
  const slide = (v.cx * 0.25) % 380;
  for (let x = WIN.x1 - 400 - slide; x < WIN.x2 + 200; x += 380) {
    for (const [dx, bw, a] of [[0, 34, 0.07], [46, 10, 0.1], [140, 18, 0.05]] as [number, number, number][]) {
      c.fillStyle = `rgba(220, 240, 255, ${a})`; c.beginPath();
      c.moveTo(x + dx, WIN.sill); c.lineTo(x + dx + bw, WIN.sill); c.lineTo(x + dx + bw + h * 0.45, WIN.top); c.lineTo(x + dx + h * 0.45, WIN.top); c.closePath(); c.fill();
    }
  }
  c.restore();
  // (the seams between the panels: the silicone, a steel post behind)
  for (let x = WIN.x1 + 560; x < WIN.x2 - 40; x += 560) { box(c, x - 3, WIN.top, 6, h, '#0A1018'); box(c, x - 1, WIN.top, 2, h, '#3A4A5A'); }
  // (the frame: the header, the sill, the jambs: painted steel, bolted, the gasket black)
  const F = rampOf('#3A4A5C');
  box(c, WIN.x1 - 14, WIN.top - 14, w + 28, 14, F[2]); box(c, WIN.x1 - 14, WIN.top - 14, w + 28, 2, F[4]); box(c, WIN.x1 - 14, WIN.top - 2, w + 28, 2, INK);
  box(c, WIN.x1 - 14, WIN.sill, w + 28, 16, F[2]); box(c, WIN.x1 - 14, WIN.sill, w + 28, 2, F[3]); box(c, WIN.x1 - 14, WIN.sill + 14, w + 28, 2, F[0]);
  box(c, WIN.x1 - 14, WIN.top - 14, 14, h + 30, F[2]); box(c, WIN.x1 - 14, WIN.top - 14, 2, h + 30, F[4]); box(c, WIN.x1 - 2, WIN.top, 2, h, INK);
  box(c, WIN.x2, WIN.top - 14, 14, h + 30, F[1]); box(c, WIN.x2, WIN.top, 2, h, INK);
  for (let x = WIN.x1 - 8; x < WIN.x2 + 8; x += 40) { box(c, x, WIN.top - 9, 3, 3, F[4]); box(c, x, WIN.sill + 6, 3, 3, F[4]); }
  // (the maker's plate on the sill)
  box(c, WIN.x1 + 20, WIN.sill + 3, 132, 11, '#8A8058'); signAt(c, 'PANEL A  12 IN. ACRYLIC', WIN.x1 + 86, WIN.sill + 11, 4, stone(4, '#2A2418', '#B8AE80'));
};

/** Faux rock heaped along the foot of the window (low, rounded: nothing to stand on). */
const paintRockwork = (g: Ctx) => {
  for (let k = 0; k < 40; k++) {
    const x = WIN.x1 - 30 + k * ((WIN.x2 - WIN.x1 + 60) / 40) + hash(k) * 20, w = 50 + hash(k * 3) * 50, hgt = 14 + hash(k * 7) * 22;
    shade(g, gg => gg.ellipse(x, 1022, w / 2, hgt, 0, Math.PI, 0), rampOf(k % 2 ? '#3E5E78' : '#46667E'), false);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Over the water: the hall

const paintMural = (g: Ctx, i: number, a: number) => {
  // (the painted sky: a prehistoric sunset in bands, the brush's dither between)
  const sky = ['#3A2A5A', '#5A3A6A', '#8A4A6A', '#C06A5A', '#E8984A', '#F2C060'];
  const top = HALL_CEIL, hz = WS - 120, bh = (hz - top) / sky.length;
  sky.forEach((col, k) => { box(g, a, Math.round(top + k * bh), 400, Math.ceil(bh) + 1, col); if (k) checker(g, a, Math.round(top + k * bh) - 2, 400, 2, col); });
  // (the painted sea in bands, the sun's path on it; sea stacks, a painted plesiosaur's neck out of it, a pterosaur)
  const sea = ['#3A6A8A', '#2E5E7E', '#245270', '#1C4662'];
  sea.forEach((col, k) => { const y = hz + Math.round(k * (WS - hz) / 4); box(g, a, y, 400, Math.ceil((WS - hz) / 4) + 1, col); if (k) checker(g, a, y - 2, 400, 2, col); });
  for (let y = hz + 6; y < WS; y += 10) for (let x = a + ((y * 7) % 30); x < a + 400; x += 30 + ((x + y) % 17)) box(g, x, y, 10 + ((x * 3) % 8), 2, '#5A8AA6');
  for (let y = hz + 2; y < WS; y += 6) box(g, a + 186 - (y - hz) * 0.3, y, 28 + (y - hz) * 0.6, 2, '#E8A860');
  // (a sea stack, painted properly: a ragged silhouette, inked; a five-step ramp across it lit from the sun's side,
  //  dithered where the steps meet; strata ledges with their lit lips, cracks, a grass cap in clumps with tufts hung
  //  down the side; the surf broken round its foot, its reflection in the sea in broken bands)
  const STK = ['#24182A', '#3A2838', '#563A46', '#7A5050', '#A86A4E', '#E0985A'];
  const GRN = ['#1A3226', '#2A4E36', '#426E42', '#6E9248'];
  const stack = (x: number, w: number, h: number) => {
    x = Math.round(x);
    const sd = x * 7 + w, litR = x < a + 200;
    const edge = (y: number) => {
      const t = y / h, ch = Math.floor(y / 6);
      const ww = Math.round(w * (1 - t * 0.5) + (hash(sd + ch * 13) - 0.5) * 8), lean = Math.round(Math.sin(t * 3 + sd) * 3);
      const xl = x - (ww >> 1) + lean;
      return [xl, xl + ww] as [number, number];
    };
    for (let y = 0; y < h; y += 2) {
      const [xl, xr] = edge(y), ww = xr - xl, yy = hz - y - 2;
      for (let s = 0; s < 5; s++) {
        const u0 = xl + Math.round(ww * s / 5), u1 = xl + Math.round(ww * (s + 1) / 5);
        const li = litR ? s : 4 - s;
        box(g, u0, yy, u1 - u0, 2, STK[li]);
        // (dither the seam into the next step)
        if (s < 4 && ((y >> 1) & 1)) box(g, u1, yy, 2, 2, STK[li]);
      }
      // (the lit edge, the ink)
      box(g, litR ? xr - 3 : xl + 1, yy, 2, 2, STK[5]);
      box(g, xl, yy, 1, 2, INK); box(g, xr - 1, yy, 1, 2, INK);
      // (strata: a dark seam, the ledge's lit lip on top of it, broken)
      if ((y + (sd % 5) * 2) % 14 === 0 && y > 4 && y < h - 6) {
        const g0 = xl + 2 + Math.floor(hash(sd + y) * ww * 0.3), g1 = xr - 2 - Math.floor(hash(sd + y * 3) * ww * 0.25);
        box(g, g0, yy, g1 - g0, 1, STK[0]);
        const lx0 = litR ? (g0 + g1) >> 1 : g0, lx1 = litR ? g1 : (g0 + g1) >> 1;
        box(g, lx0, yy - 1, lx1 - lx0, 1, STK[4]);
      }
    }
    // (cracks down it, wandering)
    for (let k = 0; k < 3; k++) {
      let cy = Math.floor(hash(sd + k * 17) * h * 0.7) + 6;
      const [xl, xr] = edge(cy);
      let cx = xl + 4 + Math.floor(hash(sd + k * 29) * Math.max(1, xr - xl - 8));
      for (let n = 0; n < 8 && cy > 2; n++) { box(g, cx, hz - cy, 1, 3, STK[0]); box(g, cx + 1, hz - cy, 1, 3, litR ? STK[3] : STK[1]); cy -= 3; cx += hash(sd + k * 5 + n) < 0.5 ? -1 : 1; }
    }
    // (the cap: grass in clumps, lit on the sun's side; tufts hung down the side)
    const [txl, txr] = edge(h - 2);
    box(g, txl - 1, hz - h - 1, txr - txl + 2, 1, INK);
    for (let cx = txl - 2; cx < txr + 2; cx += 5) {
      const ch = 3 + Math.floor(hash(sd + cx) * 4);
      box(g, cx, hz - h - ch, 6, ch + 2, INK); box(g, cx + 1, hz - h - ch + 1, 4, ch + 1, GRN[1]);
      box(g, litR ? cx + 3 : cx + 1, hz - h - ch + 1, 2, 2, GRN[3]); box(g, cx + 1, hz - h + 1, 4, 1, GRN[0]);
    }
    for (let k = 0; k < 4; k++) {
      const side = k % 2, len = 4 + Math.floor(hash(sd + k * 41) * 10), [xl, xr] = edge(h - 4 - k * 3);
      const tx = side ? xr - 2 : xl;
      box(g, tx, hz - h + k * 3, 2, len, GRN[side === (litR ? 1 : 0) ? 2 : 1]); box(g, tx, hz - h + k * 3 + len, 2, 1, GRN[0]);
    }
    // (the surf round its foot, broken; the reflection in bands under it)
    const [bxl, bxr] = edge(0);
    for (let k = 0; k < 4; k++) {
      const ry = hz + 3 + k * 5, rw = Math.round((bxr - bxl) * (1 - k * 0.18));
      for (let px = 0; px < rw; px += 6) if (hash(sd + k * 19 + px) > 0.3) box(g, bxl + ((bxr - bxl - rw) >> 1) + px, ry, 4 + (px % 3), 2, k < 2 ? STK[1] : '#1C3448');
    }
    for (let px = bxl - 6; px < bxr + 6; px += 5) if (hash(sd + px * 3) > 0.35) box(g, px, hz - 1 + ((px >> 2) & 1), 3 + (px % 3), 2, '#F2D8B0');
  };
  if (i % 3 === 0) {
    stack(a + 120, 70, 110); stack(a + 190, 44, 70); stack(a + 300, 56, 50);
    // (a palm off the tall one's top, leaning)
    for (let y = 0; y < 40; y += 4) { const tx = a + 124 + Math.round(y * 0.08); box(g, tx - 1, hz - 114 - y - 4, 6, 4, INK); box(g, tx, hz - 114 - y - 4, 4, 3, '#4A3424'); box(g, tx + 2, hz - 114 - y - 4, 2, 3, '#8A6040'); box(g, tx, hz - 114 - y - 1, 4, 1, '#2A1C14'); }
    for (let pass = 0; pass < 2; pass++) for (let fr = 0; fr < 6; fr++) {
      const an = -Math.PI + (fr / 5) * Math.PI;
      for (let t = 0; t < 1; t += 0.12) {
        const fx = a + 127 + Math.cos(an) * 24 * t, fy = hz - 156 + Math.sin(an) * 12 * t + t * t * 12;
        if (!pass) box(g, fx - 1, fy - 1, 6, 5, INK);
        else { box(g, fx, fy, 4, 3, fr < 3 ? GRN[1] : GRN[2]); box(g, fx, fy, 4, 1, fr < 3 ? GRN[2] : GRN[3]); }
      }
    }
    box(g, a + 125, hz - 158, 6, 4, '#5A3A22'); box(g, a + 126, hz - 158, 2, 2, '#8A6040');
  }
  if (i % 3 === 1) {
    // (the plesiosaur: its neck in stepped segments up out of the sea, lit along its front, the little head, the eye)
    for (let k = 0; k < 14; k++) { const t = k / 13, x = a + 200 + t * 50 - Math.sin(t * 2.4) * 10, y = hz + 20 - t * 92; box(g, x - 6, y - 4, 12, 8, '#1A3A4A'); box(g, x + 2, y - 4, 4, 8, '#2E5A6A'); }
    box(g, a + 240, hz - 80, 30, 12, '#1A3A4A'); box(g, a + 240, hz - 80, 30, 3, '#2E5A6A'); box(g, a + 262, hz - 76, 3, 3, '#F0C060'); box(g, a + 252, hz - 70, 16, 1, '#0A1A22');
    for (let k = 0; k < 3; k++) box(g, a + 160 + k * 34, hz + 12 + k * 2, 22, 6, '#1A3A4A');
    stack(a + 360, 40, 40);
  }
  if (i % 3 === 2) {
    // (the pterosaur, wings out, banded; a far stack under it)
    stack(a + 80, 50, 60);
    g.fillStyle = '#2A1A2A'; g.beginPath(); g.moveTo(a + 100, top + 84); g.lineTo(a + 160, top + 64); g.lineTo(a + 220, top + 84); g.lineTo(a + 160, top + 74); g.fill();
    g.fillStyle = '#4A2A3A'; g.beginPath(); g.moveTo(a + 116, top + 80); g.lineTo(a + 160, top + 66); g.lineTo(a + 160, top + 71); g.fill();
    box(g, a + 156, top + 62, 8, 10, '#2A1A2A'); box(g, a + 160, top + 60, 16, 4, '#2A1A2A'); box(g, a + 148, top + 58, 10, 3, '#2A1A2A'); box(g, a + 162, top + 61, 2, 2, '#F0C060');
  }
  // (the backdrop's sheets: seams; the light from the rig falling off down it)
  box(g, a, top, 2, WS - top, '#1A1018'); box(g, a + 200, top, 2, WS - top, '#1A1018');
  // (the truss, up under the dark of the ceiling)
  box(g, a, top - 30, 400, 30, '#0A0C14');
  box(g, a, top - 26, 400, 6, '#4A4E58'); box(g, a, top - 6, 400, 6, '#4A4E58');
  for (let x = a; x < a + 400; x += 20) { g.strokeStyle = '#3A3E48'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, top - 20); g.lineTo(x + 20, top - 6); g.stroke(); }
};

export const drawTank = (c: Ctx, state: GameState, rv: River) => {
  const v = viewOf(state);
  if (!onScreen(v, T1 - 40, T2 + 40)) return;
  // Over the water: the hall's painted backdrop, the truss, the banner, the signs on the wall
  if (v.t < WS) {
    // (the hall's ceiling, dark, on up)
    if (v.t < HALL_CEIL - 30) box(c, Math.max(T1, v.l - 4), v.t - 4, Math.min(T2, v.r + 4) - Math.max(T1, v.l - 4), HALL_CEIL - 30 - v.t + 4, '#0A0C14');
    for (let k = Math.floor((Math.max(T1, v.l) - T1) / 400); T1 + k * 400 < Math.min(T2, v.r); k++) {
      const a = T1 + k * 400;
      stamp(c, `uw-mural-${k}`, a, HALL_CEIL - 30, 400, WS - HALL_CEIL + 30, g => paintMural(g, k, a));
    }
    // (the rig's spotlights, hung off the truss)
    for (let x = T1 + 240; x < T2; x += 480) {
      if (!onScreen(v, x - 60, x + 60)) continue;
      box(c, x - 1, HALL_CEIL, 2, 16, '#2A2E38');
      box(c, x - 9, HALL_CEIL + 14, 18, 14, INK); box(c, x - 8, HALL_CEIL + 15, 16, 12, '#4A4E58'); box(c, x - 6, HALL_CEIL + 26, 12, 3, '#FFF4D0');
    }
    // (the banner, hung from the truss on its cables)
    const bx = (T1 + T2) / 2 - 170;
    if (onScreen(v, bx, bx + 340)) {
      box(c, bx + 30, HALL_CEIL, 1, 50, '#8A8A8A'); box(c, bx + 310, HALL_CEIL, 1, 50, '#8A8A8A');
      sign(c, bx, HALL_CEIL + 50, 340, 34, '#1E3A8A', 'SEA MONSTERS OF THE MESOZOIC', '#FDE047', 10, '#C8A040', dino({ sx: 2, sy: 2 }, ['#FFF8C8', '#FDE047', '#F2B81E', '#C88A10'], '#0B1236', '#0B1236'));
    }
    if (onScreen(v, T1 + 100, T1 + 340)) {
      sign(c, T1 + 110, WS - 74, 220, 30, '#F0E8D8', '', INK, 6);
      signAt(c, 'NO SWIMMING IN THE EXHIBIT', T1 + 220, WS - 61, 6, enamel(6, '#B02020'));
      signAt(c, 'VIOLATORS WILL BE EATEN', T1 + 220, WS - 51, 5, print(5, '#2A2418'));
    }
    if (onScreen(v, T2 - 300, T2 - 60)) {
      sign(c, T2 - 290, WS - 74, 200, 30, '#F0E8D8', '', INK, 6);
      signAt(c, 'FEEDINGS 11AM 2PM 4PM', T2 - 190, WS - 61, 5, enamel(5, '#1E3A8A'));
      signAt(c, 'SWIMMERS COUNT', T2 - 190, WS - 51, 5, print(5, '#B02020'));
    }
  }
  // Under: the room through the window, the glass, the frame, the rocks along its foot
  if (onScreen(v, WIN.x1, WIN.x2)) {
    drawRoom(c, state, rv, v);
    drawGlass(c, rv, v);
    stamp(c, 'uw-rockwork', WIN.x1 - 60, 990, WIN.x2 - WIN.x1 + 120, 40, paintRockwork);
  }
  // The spotlights' beams down into the water
  c.save(); c.globalCompositeOperation = 'lighter';
  c.beginPath(); c.rect(T1, HALL_CEIL, T2 - T1, 1040 - HALL_CEIL); c.clip();
  for (let x = T1 + 240; x < T2; x += 480) if (onScreen(v, x - 200, x + 200)) ray(c, x, HALL_CEIL + 29, 14, 1020 - HALL_CEIL - 29, 0.04 * Math.sign(x - (T1 + T2) / 2), '#FFF0C8', 0.07);
  c.restore();
  drawPlesio(c, v);
};

// ---------------------------------------------------------------------------------------------------------------
// The plesiosaur, on its track

const TRACK_Y = WS + 230, TRACK_A = T1 + 200, TRACK_B = T2 - 200;
const PL = rampOf('#1A9A8A'), PLB = rampOf('#D8D0A0'), STEEL = rampOf('#6A7480');

const paintPlesioBody = (g: Ctx) => {
  const body = (gg: Ctx) => gg.ellipse(0, 0, 72, 26, 0, 0, Math.PI * 2);
  shade(g, gg => { gg.moveTo(-60, -6); gg.quadraticCurveTo(-110, 0, -126, 14); gg.lineTo(-60, 10); gg.closePath(); }, PL);
  shade(g, body, PL);
  shade(g, gg => gg.ellipse(6, 12, 52, 10, 0, 0, Math.PI * 2), PLB, false);
  // (its seams, the hatch on its back, the stencil)
  for (const sx of [-30, 10, 44]) for (let s = -24; s < 20; s += 2) box(g, sx + Math.round(s * 0.1), s, 1, 2, PL[0]);
  box(g, -12, -24, 26, 6, STEEL[1]); box(g, -12, -24, 26, 1, STEEL[3]); for (const bx of [-10, 10]) box(g, bx, -22, 2, 2, STEEL[4]);
  signAt(g, 'UNIT 1', -14, 4, 5, stencil(5, PL[0]));
};
const paintPlesioHead = (g: Ctx) => {
  shade(g, gg => { gg.moveTo(-6, -8); gg.quadraticCurveTo(10, -16, 30, -6); gg.lineTo(30, 4); gg.lineTo(-6, 6); gg.closePath(); }, PL);
  for (let k = 8; k < 30; k += 5) box(g, k, 0, 2, 4, '#F4F0E0');
  box(g, 10, -8, 4, 4, '#FDE047'); box(g, 11, -7, 2, 2, INK);
};

const drawPlesio = (c: Ctx, v: V) => {
  if (!onScreen(v, TRACK_A - 200, TRACK_B + 200)) return;
  const f = v.f;
  // (the track: an I-beam on pylons down to the gravel, the chain along it creeping)
  const S = STEEL;
  box(c, TRACK_A, TRACK_Y + 42, TRACK_B - TRACK_A, 6, '#16202C'); box(c, TRACK_A, TRACK_Y + 43, TRACK_B - TRACK_A, 4, '#26323E');
  const t = (Math.sin(f * 0.004) + 1) / 2, dir = Math.cos(f * 0.004) > 0 ? 1 : -1;
  for (let x = TRACK_A + ((f * dir * 0.6) % 8 + 8) % 8; x < TRACK_B; x += 8) box(c, x, TRACK_Y + 45, 4, 2, S[0]);
  for (let x = TRACK_A + 40; x < TRACK_B; x += 300) { pole(c, x - 3, TRACK_Y + 48, 6, 1020 - TRACK_Y - 48, '#34404C', false); box(c, x - 10, 1014, 20, 6, '#26323E'); }
  box(c, TRACK_A - 16, TRACK_Y + 34, 16, 22, S[1]); box(c, TRACK_B, TRACK_Y + 34, 16, 22, S[1]);
  // (the carriage, its motor, the post up into the beast; bubbles off the motor)
  const px = Math.round(TRACK_A + 100 + t * (TRACK_B - TRACK_A - 200)), py = TRACK_Y;
  box(c, px - 18, py + 30, 36, 14, INK); box(c, px - 17, py + 31, 34, 12, S[2]); box(c, px - 17, py + 31, 34, 2, S[4]);
  pole(c, px - 3, py + 16, 6, 16, S[3]);
  if (f % 12 === 0) void 0;
  for (let k = 0; k < 3; k++) { const bt = ((f * 0.8 + k * 20) % 60) / 60; box(c, px + 10 + Math.round(Math.sin(bt * 8) * 2), py + 28 - bt * 50, 2, 2, `rgba(224, 242, 254, ${(0.7 * (1 - bt)).toFixed(2)})`); }
  c.save(); c.translate(px, py); c.scale(dir, 1);
  // (the flippers, paddling, behind and in front of the body)
  const flip = (sx: number, front: boolean) => { c.save(); c.translate(sx, 16); c.rotate((front ? 0.5 : 0.3) + Math.sin(f * 0.05 + (front ? 0 : 1.6)) * 0.35); shade(c, g => g.ellipse(-14, 4, 26, 7, 0, 0, Math.PI * 2), PL); c.restore(); };
  flip(-36, false); flip(34, false);
  stamp(c, 'uw-plesio', -130, -30, 210, 60, paintPlesioBody);
  flip(-30, true); flip(40, true);
  // (the neck: segments, swaying, the head on the end)
  const neck: [number, number][] = [];
  for (let k = 0; k <= 12; k++) { const kk = k / 12; neck.push([60 + kk * 60 + Math.sin(f * 0.03 + kk * 2) * 6 * kk, -6 - kk * 96 + kk * kk * 12]); }
  const stroke = (wd: number, col: string, dx = 0, dy = 0) => { c.strokeStyle = col; c.lineWidth = wd; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); neck.forEach(([x, y], i) => (i ? c.lineTo(x + dx, y + dy) : c.moveTo(x + dx, y + dy))); c.stroke(); };
  stroke(15, INK); stroke(12, PL[1]); stroke(8, PL[2], -1, -1); stroke(3, PL[3], -3, -2);
  // (the neck's rubber sleeve, its rings)
  for (let k = 2; k < 12; k += 2) { const [x, y] = neck[k]; box(c, Math.round(x) - 5, Math.round(y), 10, 1, PL[0]); }
  const [nx, ny] = neck[12];
  c.save(); c.translate(Math.round(nx), Math.round(ny));
  stamp(c, 'uw-plesio-head', -10, -20, 44, 30, paintPlesioHead);
  c.restore();
  c.restore();
};

export { CANVAS_WIDTH, CANVAS_HEIGHT };
