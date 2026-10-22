// The ticket plaza: the gate into Happy Land, the ticket booths (hers the only one open), the line's ropes, the turnstile.
// Peak SNES, grand and tacky: a candy-striped arch with chasing bulbs and the park's smiling star on top, a Victorian
// ticket kiosk under a striped roof, brass and velvet, pavers with a gold star let into them. The still parts are
// stamps (painted once); the bulbs, the flags, the star's face and the ticket lady are drawn live over them.

import type { GameState } from '../../../m1/game/core/state';
import { R, USA_END, FRONT_X, WINDOW_X, TURN_X, GATE_X, END_X, QUEUE_START } from '../geometry';
import { GROUND_Y, CANVAS_WIDTH } from '../../../m1/constants';
import {
  type Ctx, INK, RED, WHITE, BLUE, FLAG_RED, FLAG_WHITE, FLAG_BLUE, box, star, flag, bunting, sign, dim, slab, pole,
  ball, shinyStar, checker, steppedGlow, pixelBlob, stamp, mix, hash, snap, PIX, type Eye, sideFace, dark,
} from './kit';
import { getIntro } from '../index';
import { signAt, extruded, federal, gilt, print } from './letters';
import { timeOfDay, skyTint, farTint } from '../../timeOfDay';
import { type Far, type RangeLook, rampF, block, cylV, ball as orb, windowRow, poly as polyP, snap2, wave, jag, range, mist } from '../../space/farArt';
import { crown } from '../../adventure/farArt';

const G = GROUND_Y;
/** The gate's middle, the booth building's left end, her window's left edge, where she stands. */
const GX = R(GATE_X) + 40;
const BX = R(WINDOW_X) - 170;
const WIN = (i: number) => BX + 20 + i * 80;
const LADY_X = WIN(2) + 30;
/** The plaza's ends. */
const P0 = R(USA_END), P1 = R(END_X) + 400;

// (the ramps, darkest first)
const PINK = ['#6E1840', '#A8326A', '#DE5C96', '#F38DB9', '#FCC4DC'];
const CREAM = ['#8C6E4E', '#BFA07A', '#E8D2AA', '#F8EACB', '#FFF8E6'];
const GOLD = ['#5C3A06', '#9A6A0E', '#D4A017', '#F2CC4A', '#FFF0A0'];
const BRASS = ['#4A3208', '#7E5A14', '#B08A2A', '#D8B650', '#F4E08C'];
const CHROME = ['#3A4048', '#6B737E', '#A3ABB6', '#D3D9E0', '#F6F8FA'];
const VELVET = ['#3C0610', '#6A0C1E', '#9B1530', '#C42A48', '#E25670'];
const HEDGE = ['#123A1C', '#1E5A2A', '#2F7D3A', '#4CA04A', '#7CC466'];
const SKIN = ['#7A4A30', '#A86C48', '#D49A70', '#EBBD92', '#F8DCBA'];
const HAIR = ['#3A1006', '#64200C', '#8E3416', '#B44C24', '#D67442'];
const POLO = ['#5E0C0C', '#8E1616', '#C02424', '#DE4A3E', '#F27C66'];
const IRON = '#26323A';
const HAZE = '#BFDBFE';

const poly = (c: Ctx, pts: number[], col: string) => {
  c.fillStyle = col; c.beginPath(); c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.closePath(); c.fill();
};
const ellipse = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, a0 = 0, a1 = Math.PI * 2) => {
  c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, a0, a1); c.fill();
};
/** A chaser bulb: lit (a stepped glow round it), or dark in its socket. */
const bulb = (c: Ctx, x: number, y: number, on: boolean) => {
  x = snap(x); y = snap(y);
  if (on) {
    box(c, x - 4, y - 4, 8, 8, 'rgba(255, 236, 160, 0.28)');
    box(c, x - 3, y - 3, 6, 6, INK); box(c, x - 2, y - 2, 4, 4, '#FFF3B0'); box(c, x - 2, y - 2, 2, 2, '#FFFFFF');
  } else {
    box(c, x - 3, y - 3, 6, 6, INK); box(c, x - 2, y - 2, 4, 4, '#B8862A'); box(c, x - 2, y - 2, 2, 1, '#E8C870');
  }
};
/** Big letters standing out of the sign: an ink edge, a red extrusion down and right, a gold face lit across its top. */
const bigText = (c: Ctx, s: string, x: number, y: number, size: number, depth: number) =>
  extruded(c, s, x, y, size, depth, size >= 16 ? { sx: 3, sy: 3 } : { sx: 2, sy: 2 }, [FLAG_RED[0], FLAG_RED[1]], INK);

// ---------------------------------------------------------------------------------------------------------------
// The ticket plaza and the gate

export const plaza = (c: Ctx, state: GameState, f: number, eye?: Eye) => {
  const intro = getIntro(state);
  const cam = state.camera.x;
  const vis = (a: number, b: number) => b > cam - 60 && a < cam + CANVAS_WIDTH + 60;
  // Far off, through the gate and over the fence: the park itself, in the haze (going by slower than the plaza)
  parkGlimpse(c, cam);
  // The park's fence (left of the gate) and its wall (right of it)
  if (vis(P0, GX - 180)) stamp(c, 'plaza-fence', P0, G - 160, GX - 180 - P0 + 4, 160, fence);
  if (vis(GX + 180, P1)) stamp(c, 'plaza-wall', GX + 176, G - 320, P1 - GX - 176, 320, parkWall);
  // The ticket booth's sides, going back toward where he's looking (the street's eye): behind everything that stands
  // on the plaza's front (the lamps, the gate's towers), over the fence and the park
  if (eye && vis(BX - 160, BX + 420)) boothSides(c, eye);
  // Plaza dressing: lamps with flags and bunting, the eagle (a shrub), urns of flowers, the map
  for (const lx of LAMPS) if (vis(lx - 40, lx + 40)) { stamp(c, `plaza-lamp-${lx}`, lx - 28, G - 312, 56, 312, g => lamp(g, lx)); flag(c, lx + 1, G - 346, f + lx, 30, 18, G - 312); }
  if (vis(LAMPS[0], LAMPS[1])) stamp(c, 'plaza-bunting-0', LAMPS[0] - 4, G - 300, LAMPS[1] - LAMPS[0] + 8, 70, g => bunting(g, LAMPS[0], LAMPS[1], G - 292, 22));
  if (vis(LAMPS[2], LAMPS[3])) stamp(c, 'plaza-bunting-1', LAMPS[2] - 4, G - 300, LAMPS[3] - LAMPS[2] + 8, 70, g => bunting(g, LAMPS[2], LAMPS[3], G - 292, 12));
  if (vis(TOPIARY_X - 80, TOPIARY_X + 80)) stamp(c, 'plaza-topiary', TOPIARY_X - 80, G - 180, 160, 180, topiary);
  for (const ux of URNS) if (vis(ux - 30, ux + 30)) stamp(c, `plaza-urn-${ux}`, ux - 26, G - 70, 52, 70, g => urn(g, ux));
  if (vis(MAP_X - 10, MAP_X + 180)) stamp(c, 'plaza-map', MAP_X - 8, G - 220, 180, 220, mapBoard);
  // The gate: a great candy-striped arch, HAPPY LAND across it, the park's smiling star on top
  if (vis(GX - 200, GX + 200)) {
    stamp(c, 'plaza-gate', GX - 200, G - 440, 400, 440, gate);
    // (the bulbs chasing round the arch, in and out; round the sign's sides)
    const ph = Math.floor(f / 5);
    ARCH_BULBS.forEach(([x, y, i, outer]) => bulb(c, x, y, outer ? (i + ph) % 3 === 0 : (i - ph + 999) % 3 === 0));
    for (let i = 0; i < 5; i++) { const on = (i + ph) % 2 === 0; bulb(c, GX - 100, G - 392 + i * 12, on); bulb(c, GX + 100, G - 392 + i * 12, !on); }
    for (const x0 of [GX - 180, GX + 116]) flag(c, x0 + 32, G - 410, f + x0, 34, 22, G - 364);
    mascot(c, GX, G - 446, f);
  }
  // The ticket booths: three windows, two closed, hers open
  if (vis(BX - 20, BX + 280)) {
    stamp(c, 'plaza-booth', BX - 16, G - 300, 296, 300, booth);
    const ph = Math.floor(f / 6);
    MARQUEE_BULBS.forEach(([x, y], i) => bulb(c, x, y, (i + ph) % 4 < 2));
    flag(c, BX + 131, G - 334, f + 17, 26, 16, G - 299);
    ticketLady(c, LADY_X, G - 70, f, intro?.lady.ko ?? 0);
  }
  // The line: brass posts, red velvet rope, back from the window; its signs
  if (vis(R(QUEUE_START) - 80, R(FRONT_X) + 40)) {
    stamp(c, 'plaza-line', R(QUEUE_START) - 56, G - 56, R(FRONT_X) - R(QUEUE_START) + 100, 56, ropes);
    stamp(c, 'plaza-signs', R(QUEUE_START) - 70, G - 140, 420, 140, lineSigns);
  }
  // The turnstile: arms out (or swung round, once he's let in)
  const tx = R(TURN_X);
  if (vis(tx - 40, tx + 40)) turnstile(c, tx, f, !!intro?.admitted);
};

// ---------------------------------------------------------------------------------------------------------------
// Far off: the park in the haze

/** The park behind the gate (painted once for the hour into a canvas of its own, at the screen's scale: its haze lies
 *  over only what's painted), going by slower than the plaza. */
const PARK_W = 1660, PARK_H = 440;
const parkHeld = new Map<string, HTMLCanvasElement>();
const parkGlimpse = (c: Ctx, cam: number) => {
  const shift = Math.round((cam - (GX - 400)) * 0.45 / PIX) * PIX;
  if (GX - 900 + shift > cam + CANVAS_WIDTH || GX + 760 + shift < cam || typeof document === 'undefined') return;
  const a = Math.abs(c.getTransform().a) || 1, id = `${timeOfDay().key}@${a.toFixed(3)}`;
  let cv = parkHeld.get(id);
  if (!cv) {
    if (parkHeld.size > 6) parkHeld.clear();
    cv = document.createElement('canvas');
    cv.width = Math.ceil(PARK_W * a); cv.height = Math.ceil(PARK_H * a);
    const g = cv.getContext('2d')!;
    g.scale(a, a); g.imageSmoothingEnabled = false;
    park(g);
    parkHeld.set(id, cv);
  }
  c.save();
  c.beginPath(); c.rect(P0, 0, P1 - P0, G); c.clip();
  c.drawImage(cv, GX - 900 + shift, G - PARK_H, PARK_W, PARK_H);
  c.restore();
};
/**
 * The park in the haze (space/farArt.ts's far kit; the hour's light and haze on it; local coords, the ground at
 * PARK_H): a pale range at the back; wooded hills in front, one rising to a knoll; the castle up on the knoll (the
 * curtain wall in its stone's ramp, a gate, round towers in columns under stepped blue cones, gold finials and red
 * pennants: the same castle the temple roof sees); the coaster (its lattice of bents, the track dipping and looping,
 * a train topping a hill); the Ferris wheel on its A-frame; the drop tower with its ring and a beacon; their feet on a
 * lawn banded darker going down with a tree line along its back. Windows lit after dark, the wheel's bulbs on. Nothing
 * lit along a top.
 */
const park = (c: Ctx) => {
  const tod = timeOfDay(), haze = skyTint(HAZE, 0.92, tod), tw = PARK_W, H = PARK_H;
  const T = (col: string) => mix(farTint(col, 1, tod), haze, 0.4);
  const F: Far = { T, night: tod.lamps, s: 1.4, glass: T(mix(skyTint('#7EA8EA', 0.5, tod), '#2A3A6A', 0.3)) };
  const LIT = '#FFE8A0';
  const look = (base: string, k: number): RangeLook => {
    const Th = (col: string) => mix(farTint(col, 1.2, tod), haze, k);
    return { body: Th(base), lit: Th(mix(base, '#E8F0F8', 0.26)), hi: Th(mix(base, '#FFFFFF', 0.4)), shade: Th(mix(base, '#18223A', 0.16)), deep: Th(mix(base, '#18223A', 0.3)) };
  };
  // The range at the back, misted
  const backY = (x: number) => snap2(232 + wave(x, tw, 2.1) * 28 + jag(x, tw, 8, 3) * 6);
  range(c, tw, backY, H, look('#8EA6C4', 0.5), 41, { gullies: 24, d: 14 });
  mist(c, tw, 200, H - 200, haze, 0, 0.55, 6);
  // The hills in front, woods up them; a knoll under the castle, flat on top
  const KX = 940, KY = 340;
  const knoll = (x: number) => { const d = Math.abs(x - KX); return d < 130 ? KY : KY + ((d - 130) / 90) ** 2 * 60; };
  const frontY = (x: number) => snap2(Math.min(356 + wave(x, tw, 4.4, 2) * 14, knoll(x)));
  const front = look('#6E9070', 0.3);
  range(c, tw, frontY, H, front, 47, { gullies: 16, d: 12, forest: [front.shade, front.body], forestY: x => frontY(x) + 16 + wave(x, tw, 1.3, 3) * 5 });
  mist(c, tw, 300, H - 300, haze, 0, 0.4, 5);
  // The castle on its knoll
  {
    const C = rampF(F, '#E6E2DC'), B = rampF(F, '#3B5CC4'), Rd = rampF(F, '#DC2626'), Gd = rampF(F, '#F2CC4A');
    const tower = (x: number, w: number, top: number) => {
      cylV(c, x, KY, top, w, w, C);
      box(c, snap2(x - w / 2) - 2, snap2(top) - 2, snap2(w) + 4, 4, C[1]);
      // (the cone: stepped across, lit at the left)
      const ch = w * 1.8, half = w / 2 + 4, n = 5;
      for (let i = 0; i < n; i++) { const a = -half + (2 * half * i) / n, b = -half + (2 * half * (i + 1)) / n; polyP(c, [[x + a, top - 2], [x + a * 0.06, top - 2 - ch], [x + b * 0.06, top - 2 - ch], [x + b, top - 2]], B[4 - i]); }
      box(c, snap2(x) - 1, snap2(top - ch - 12), 2, 10, Gd[2]);
      box(c, snap2(x) + 1, snap2(top - ch - 12), 8, 4, Rd[2]); box(c, snap2(x) + 1, snap2(top - ch - 8), 6, 2, Rd[0]);
      for (let y = top + 12; y < KY - 100; y += 22) box(c, snap2(x) - 2, snap2(y), 2, 6, hash(x + y) < F.night * 0.9 ? LIT : C[0]);
    };
    tower(KX - 110, 30, KY - 160); tower(KX + 110, 30, KY - 150); tower(KX - 50, 26, KY - 200); tower(KX + 52, 26, KY - 190);
    // (the curtain wall: crenels along it (not lit), the gate's arch, windows)
    block(c, KX - 120, KY - 90, 240, 90, C);
    for (let x = KX - 120; x < KX + 120; x += 16) box(c, x, KY - 98, 10, 8, x < KX + 60 ? C[2] : C[1]);
    box(c, KX - 14, KY - 40, 28, 40, C[0]); c.fillStyle = C[0]; c.beginPath(); c.ellipse(KX, KY - 40, 14, 10, 0, Math.PI, 0); c.fill();
    windowRow(c, F, KX - 108, KX - 24, KY - 64, C, 3, 14, 6, true); windowRow(c, F, KX + 24, KX + 108, KY - 64, C, 5, 14, 6, true);
    tower(KX, 40, KY - 250);
  }
  // The coaster: bents up to the track, X's between them stepped, the track dipping and looping, a train on a hill
  const FOOT = 408;
  {
    const W_ = rampF(F, '#F1EFEA'), Tr = rampF(F, '#E11D48');
    const trackY = (x: number) => H - 210 - 70 * Math.sin((x - 140) / 90) - 30 * Math.cos((x - 140) / 37);
    for (let x = 140; x < 700; x += 14) {
      const y = snap2(trackY(x));
      box(c, x, y, 2, FOOT - y, W_[2]); box(c, x + 2, y, 1, FOOT - y, W_[0]);
      if ((x / 14) % 2 < 1) { const y2 = snap2(trackY(x + 14)); for (let k = 0; k < 14; k += 2) box(c, x + k, snap2(Math.max(y, y2) + 10 + k * 2), 2, 2, W_[1]); }
    }
    const ly = snap2(trackY(480) - 50);
    cylV(c, 480, FOOT, ly + 50, 4, 4, W_);
    polyP(c, [[430, FOOT], [479, ly + 40], [481, ly + 40], [436, FOOT]], W_[3]); polyP(c, [[524, FOOT], [479, ly + 40], [481, ly + 40], [530, FOOT]], W_[1]);
    c.lineWidth = 4; c.strokeStyle = Tr[1]; c.beginPath(); c.arc(480, ly, 50, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 2; c.strokeStyle = Tr[3]; c.beginPath(); c.arc(480, ly, 49, Math.PI * 0.7, Math.PI * 1.4); c.stroke();
    for (let x = 140; x < 700; x += 2) { const y = snap2(trackY(x)); box(c, x, y - 2, 2, 2, Tr[2]); box(c, x, y, 2, 2, Tr[0]); }
    ['#2563EB', '#FACC15', '#22C55E', '#F97316'].forEach((col, i) => { const x = 570 + i * 10, y = snap2(trackY(x)), P = rampF(F, col); box(c, x, y - 8, 8, 6, P[2]); box(c, x, y - 8, 2, 6, P[3]); box(c, x + 6, y - 8, 2, 6, P[1]); });
  }
  // The Ferris wheel on its A-frame: the rim and spokes, the gondolas (lit at their left), bulbs after dark
  {
    const wx = 1370, wy = 190, wr = 96, S = rampF(F, '#F1EFEA');
    polyP(c, [[wx - 56, FOOT], [wx - 2, wy], [wx + 1, wy], [wx - 48, FOOT]], S[3]); polyP(c, [[wx + 48, FOOT], [wx - 1, wy], [wx + 2, wy], [wx + 56, FOOT]], S[1]);
    c.lineWidth = 1; c.strokeStyle = S[1];
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx + Math.cos(a) * wr, wy + Math.sin(a) * wr); c.stroke(); }
    c.lineWidth = 3; c.strokeStyle = S[1]; c.beginPath(); c.arc(wx, wy, wr, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 2; c.strokeStyle = S[0]; c.beginPath(); c.arc(wx, wy, wr - 8, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 2; c.strokeStyle = S[3]; c.beginPath(); c.arc(wx, wy, wr, Math.PI * 0.75, Math.PI * 1.4); c.stroke();
    orb(c, wx, wy, 6, S);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2, gx = snap2(wx + Math.cos(a) * wr), gy = snap2(wy + Math.sin(a) * wr), P = rampF(F, ['#DC2626', '#FACC15', '#2563EB', '#22C55E'][i % 4]);
      box(c, gx - 4, gy, 8, 8, P[2]); box(c, gx - 4, gy, 2, 8, P[3]); box(c, gx + 2, gy, 2, 8, P[1]); box(c, gx - 4, gy + 6, 8, 2, P[0]);
      if (F.night > 0.3) box(c, gx - 1, gy + 2, 2, 2, LIT);
    }
    if (F.night > 0.3) for (let i = 0; i < 32; i++) { const a = (i / 32) * Math.PI * 2 + 0.1; box(c, snap2(wx + Math.cos(a) * wr) - 1, snap2(wy + Math.sin(a) * wr) - 1, 2, 2, i % 2 ? LIT : '#FF9AD0'); }
  }
  // The drop tower: its mast in columns, the ring of seats, a beacon on top
  {
    const D = rampF(F, '#E5E7EB'), P = rampF(F, '#7C3AED');
    cylV(c, 1564, FOOT, 40, 12, 10, D);
    for (let y = 48; y < FOOT; y += 12) box(c, 1558, y, 12, 2, D[1]);
    block(c, 1548, 140, 32, 12, P);
    box(c, 1562, 32, 4, 4, F.night > 0.15 ? '#FF4A5A' : D[0]);
  }
  // Their feet on the lawn, a tree line along its back
  {
    const Lw = ['#2E5A32', '#3A6A3C', '#467A46', '#568A52'].map(T), TR = ['#24442A', '#335E34', '#477A3C', '#62964A'].map(T);
    box(c, 0, FOOT - 2, tw, H - FOOT + 2, Lw[3]);
    [Lw[2], Lw[1], Lw[0]].forEach((col, i) => { const y = FOOT + snap2(((i + 1) * (H - FOOT)) / 4); box(c, 0, y, tw, H - y, col); checker(c, 0, y - 2, tw, 2, col, i % 2); });
    for (let i = 0; i < tw / 20; i++) {
      if (hash(i * 1.37 + 9) < 0.2) continue;
      const r = 9 + hash(i * 3.1) * 7;
      crown(c, i * 20 + hash(i * 2.3) * 8, FOOT + 4 - r * 0.4, r, TR);
    }
    mist(c, tw, FOOT - 20, H - FOOT + 20, haze, 0.35, 0.6, 4);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The park's fence and wall

/** An iron fence with spear-tipped pickets, brick piers capped in stone, a clipped hedge behind (all a touch dimmed). */
const fence = (c: Ctx) => {
  const x0 = P0, x1 = GX - 176;
  // (the hedge: its bumpy top, leaf speckle, darker toward the ground)
  for (let x = x0; x < x1; x += 2) {
    const top = snap(G - 104 - 6 * Math.abs(Math.sin(x * 0.07)) - 3 * hash(Math.floor(x / 6)));
    box(c, x, top, 2, G - top, dim(HEDGE[2]));
    box(c, x, top, 2, 2, dim(HEDGE[4])); box(c, x, top + 2, 2, 4, dim(HEDGE[3]));
  }
  checker(c, x0, G - 92, x1 - x0, PIX, dim(HEDGE[3]));
  box(c, x0, G - 40, x1 - x0, 40, dim(HEDGE[1])); checker(c, x0, G - 42, x1 - x0, PIX, dim(HEDGE[1]), 1);
  for (let x = x0; x < x1; x += 6) for (let y = G - 90; y < G - 40; y += 6) {
    const h = hash(x * 3.1 + y * 7.7);
    if (h < 0.22) box(c, x + 2, y + 2, 2, 2, dim(HEDGE[4])); else if (h > 0.82) box(c, x, y, 2, 2, dim(HEDGE[0]));
  }
  // (the pickets, rails, spear tips)
  const iron = dim(IRON), ironLit = dim('#5A6A76'), tip = dim(GOLD[2]);
  for (let x = x0 + 4; x < x1; x += 10) {
    box(c, x, G - 112, 2, 112, iron); box(c, x, G - 112, 1, 112, ironLit);
    poly(c, [x - 2, G - 112, x + 4, G - 112, x + 1, G - 120], tip);
  }
  for (const y of [G - 100, G - 22]) { box(c, x0, y, x1 - x0, 4, iron); box(c, x0, y, x1 - x0, 1, ironLit); }
  // (the piers)
  for (let x = x0 + 30; x < x1 - 20; x += 170) {
    const bw = 26;
    box(c, x - 1, G - 132, bw + 2, 132, INK);
    for (let y = G - 130, row = 0; y < G; y += 6, row++) {
      for (let bx = x - (row % 2) * 6; bx < x + bw; bx += 12) {
        const l = Math.max(x, bx), r = Math.min(x + bw, bx + 11), t = hash(bx * 1.3 + y);
        box(c, l, y, r - l, 5, dim(t < 0.3 ? '#9A3A26' : t < 0.7 ? '#B04A30' : '#C45E3E'));
        box(c, l, y, r - l, 1, dim('#D8806A'));
      }
    }
    box(c, x, G - 130, 4, 130, 'rgba(255, 220, 200, 0.14)'); box(c, x + bw - 5, G - 130, 5, 130, 'rgba(26, 11, 6, 0.25)');
    slab(c, x - 4, G - 140, bw + 8, 10, dim('#C9BBA0'));
    ball(c, x + bw / 2, G - 148, 6, dim(GOLD[2]));
    shinyStar(c, x + bw / 2, G - 80, 6, dim('#E8E2D0'));
  }
};

/** The park's wall right of the gate: pink stucco, battlements, cream piers with gold stars, banners, a request. */
const parkWall = (c: Ctx) => {
  const x0 = GX + 176, x1 = P1, top = G - 290;
  const W = ['#7E4A66', '#A86488', '#C77FA4', '#D99BBA', '#E8B8D0'].map(dim);
  box(c, x0, top, x1 - x0, G - top, W[2]);
  box(c, x0, top, x1 - x0, 4, W[3]); checker(c, x0, top + 4, x1 - x0, PIX, W[3]);
  box(c, x0, G - 60, x1 - x0, 60, W[1]); checker(c, x0, G - 62, x1 - x0, PIX, W[1], 1);
  for (let x = x0; x < x1; x += 4) for (let y = top + 8; y < G - 20; y += 6) { const h = hash(x * 1.7 + y * 3.3); if (h < 0.1) box(c, x, y, 2, 2, W[3]); else if (h > 0.93) box(c, x, y, 2, 2, W[1]); }
  // (battlements along the top)
  for (let x = x0 + 6; x < x1; x += 40) { slab(c, x, top - 22, 24, 24, W[2], { edge: 4 }); }
  box(c, x0, top - 2, x1 - x0, 4, INK);
  // (the base course)
  slab(c, x0, G - 34, x1 - x0, 34, dim('#B8A890'), { edge: 4 });
  // (piers with stars, banners hung between)
  for (let x = x0 + 60, i = 0; x < x1 - 20; x += 120, i++) {
    slab(c, x, top + 4, 22, G - 34 - top - 4, dim(CREAM[3]), { edge: 4 });
    shinyStar(c, x + 11, top + 40, 8, dim(GOLD[3]));
    const bx = x + 46;
    if (bx + 30 < x1) {
      const cols = [FLAG_RED, FLAG_BLUE, FLAG_RED][i % 3];
      box(c, bx - 2, top + 20, 34, 4, dim(GOLD[1]));
      box(c, bx - 1, top + 24, 30, 120, INK);
      box(c, bx, top + 24, 28, 116, dim(cols[2])); box(c, bx, top + 24, 6, 116, dim(cols[3])); box(c, bx + 22, top + 24, 6, 116, dim(cols[1]));
      poly(c, [bx, top + 140, bx + 28, top + 140, bx + 14, top + 152], dim(cols[2]));
      box(c, bx + 4, top + 40, 20, 4, dim(FLAG_WHITE[3])); box(c, bx + 4, top + 110, 20, 4, dim(FLAG_WHITE[3]));
      shinyStar(c, bx + 14, top + 76, 9, dim(FLAG_WHITE[4]));
    }
  }
  sign(c, GX + 236, G - 252, 300, 16, dim('#FEF3C7'), 'PLEASE DO NOT CLIMB THE WALL. IT IS FOR LOOKING AT.', dim('#7F1D1D'), 5, dim(GOLD[1]));
};

// ---------------------------------------------------------------------------------------------------------------
// The gate

/** The top of the arch's band (its outer edge), at x. */
const arcY = (x: number) => { const t = (x - (GX - 118)) / 236; return G - 292 - 224 * t * (1 - t); };
/** Where the arch's bulbs sit: x, y, its number, outer row or inner. */
const ARCH_BULBS: [number, number, number, boolean][] = [];
for (let i = 0, x = GX - 112; x <= GX + 112; x += 16, i++) ARCH_BULBS.push([x, arcY(x) + 6, i, true]);
for (let i = 0, x = GX - 104; x <= GX + 104; x += 16, i++) ARCH_BULBS.push([x, arcY(x) + 53, i, false]);

const gate = (c: Ctx) => {
  // The sign over the arch: a gold-framed crest, navy inside, its top in three scallops (the middle one for the star)
  const crest = () => {
    c.beginPath(); c.moveTo(GX - 106, G - 320); c.lineTo(GX - 106, G - 396);
    c.quadraticCurveTo(GX - 80, G - 414, GX - 54, G - 398); c.quadraticCurveTo(GX, G - 440, GX + 54, G - 398);
    c.quadraticCurveTo(GX + 80, G - 414, GX + 106, G - 396); c.lineTo(GX + 106, G - 320); c.closePath();
  };
  c.fillStyle = INK; c.save(); c.translate(0, -2); crest(); c.fill(); c.restore();
  c.save(); c.translate(2, 0); crest(); c.fill(); c.restore(); c.save(); c.translate(-2, 0); crest(); c.fill(); c.restore();
  c.fillStyle = GOLD[1]; crest(); c.fill();
  c.save(); crest(); c.clip();
  c.fillStyle = GOLD[2]; c.save(); c.translate(1, 2); crest(); c.fill(); c.restore();
  c.strokeStyle = GOLD[3]; c.lineWidth = 3; c.save(); c.translate(1, 1); crest(); c.stroke(); c.restore();
  c.strokeStyle = GOLD[4]; c.lineWidth = 1; crest(); c.stroke();
  c.restore();
  // (the navy panel, banded, specked with white stars)
  const nx = GX - 96, ny = G - 398, nw = 192, nh = 78;
  box(c, nx - 2, ny - 2, nw + 4, nh + 4, INK);
  const bands = [FLAG_BLUE[3], FLAG_BLUE[2], FLAG_BLUE[2], FLAG_BLUE[1], FLAG_BLUE[1], FLAG_BLUE[0]];
  bands.forEach((col, i) => box(c, nx, ny + i * 13, nw, 14, col));
  for (let i = 1; i < bands.length; i++) checker(c, nx, ny + i * 13 - PIX, nw, PIX, bands[i], i % 2);
  for (let i = 0; i < 22; i++) { const sx = nx + 6 + hash(i * 3.7) * (nw - 12), sy = ny + 4 + hash(i * 9.1) * 30; box(c, sx, sy, 2, 2, i % 3 ? '#C7D6F5' : '#FFFFFF'); }
  // (the middle scallop gets a gold sunburst behind where the star stands)
  for (let i = 0; i < 9; i++) { const a = Math.PI + (i + 0.5) * Math.PI / 9; c.strokeStyle = i % 2 ? GOLD[3] : GOLD[2]; c.lineWidth = 3; c.beginPath(); c.moveTo(GX, G - 400); c.lineTo(GX + Math.cos(a) * 34, G - 400 + Math.sin(a) * 20); c.stroke(); }
  bigText(c, 'HAPPY LAND', GX, G - 360, 16, 4);
  // The arch: its band column by column (gold trim top and bottom, candy pink between, lit along its top)
  const layers: [number, number, string][] = [
    [0, 2, INK], [2, 4, GOLD[4]], [4, 6, GOLD[3]], [6, 9, GOLD[2]], [9, 10, GOLD[0]], [10, 16, PINK[3]], [16, 40, PINK[2]],
    [40, 48, PINK[1]], [48, 50, GOLD[0]], [50, 52, GOLD[3]], [52, 56, GOLD[2]], [56, 58, GOLD[1]], [58, 60, INK],
  ];
  for (let x = GX - 140; x < GX + 140; x += 2) {
    const y = snap(arcY(x + 1)), odd = (x / 2) & 1;
    for (const [d0, d1, col] of layers) box(c, x, y + d0, 2, d1 - d0, col);
    if (odd) box(c, x, y + 16, 2, 2, PINK[3]); else box(c, x, y + 38, 2, 2, PINK[1]);
    if (Math.round((x - GX) / 2) % 12 === 0) { box(c, x - 2, y + 26, 4, 4, PINK[4]); box(c, x, y + 28, 2, 2, '#FFFFFF'); }
  }
  // (NOW 40% HAPPIER, riding the band letter by letter)
  const motto = 'NOW 40% HAPPIER', lw = 6;
  for (let i = 0; i < motto.length; i++) { const x = GX - (motto.length * lw) / 2 + i * lw + lw / 2; signAt(c, motto[i], x, snap(arcY(x)) + 37, 6, federal(6, CREAM[4], PINK[0])); }
  // (scallops hung under the arch)
  for (let x = GX - 110; x <= GX + 110; x += 14) {
    const y = snap(arcY(x)) + 59;
    ellipse(c, x, y, 7, 8, INK, 0, Math.PI); ellipse(c, x, y, 6, 7, CREAM[2], 0, Math.PI);
    ellipse(c, x - 1, y, 4, 5, CREAM[3], 0, Math.PI); box(c, x - 1, y + 2, 2, 2, PINK[2]);
  }
  // The towers
  for (const x0 of [GX - 180, GX + 116]) tower(c, x0);
};

/** One of the gate's towers: a candy-striped column on a plinth, gold rings, a drum with lamps in its windows, an onion dome. */
const tower = (c: Ctx, x0: number) => {
  // (the plinth, with a pink panel and a star)
  slab(c, x0 - 6, G - 42, 76, 42, '#E2C27A');
  slab(c, x0 + 6, G - 34, 52, 24, PINK[2], { edge: 2 });
  shinyStar(c, x0 + 32, G - 22, 7, GOLD[3]);
  // (the shaft: stripes spiraling round it, shaded across)
  const sx = x0 + 6, sw = 52, top = G - 262, bot = G - 42;
  const order = [3, 4, 4, 3, 3, 2, 2, 2, 2, 1, 1, 1, 0];
  for (let i = 0; i < sw; i += 2) {
    const sh = order[Math.min(order.length - 1, Math.floor((i / sw) * order.length))];
    const off = Math.asin(((i + 1) / sw) * 2 - 1) * 12;
    for (let y = top; y < bot; y += 2) box(c, sx + i, y, 2, 2, ((Math.floor((y + off) / 12) & 1) ? PINK : CREAM)[sh]);
  }
  box(c, sx - 2, top, 2, bot - top, INK); box(c, sx + sw, top, 2, bot - top, INK);
  for (const y of [G - 52, G - 156]) { pole(c, x0 + 2, y, 60, 10, GOLD[2]); box(c, x0 + 1, y, 62, 1, INK); box(c, x0 + 1, y + 9, 62, 1, INK); }
  // (the capital, dentils under it)
  slab(c, x0 - 8, G - 276, 80, 16, '#E2C27A');
  for (let x = x0 - 4; x < x0 + 70; x += 6) box(c, x, G - 260, 3, 3, '#8A6A34');
  // (the drum: two arched windows, lit)
  slab(c, x0 + 4, G - 314, 56, 38, CREAM[3]);
  for (const wx of [x0 + 14, x0 + 38]) {
    box(c, wx - 1, G - 304, 14, 20, INK); ellipse(c, wx + 6, G - 304, 7, 6, INK, Math.PI, Math.PI * 2);
    box(c, wx, G - 304, 12, 19, '#FCD34D'); ellipse(c, wx + 6, G - 304, 6, 5, '#FCD34D', Math.PI, Math.PI * 2);
    box(c, wx, G - 304, 4, 19, '#FFF3B0'); box(c, wx + 9, G - 300, 3, 15, '#D49A1A');
    box(c, wx + 5, G - 308, 2, 23, INK);
  }
  // (the onion dome, a gold band at its foot, a ball on top)
  const dome = () => { c.beginPath(); c.moveTo(x0 + 2, G - 314); c.quadraticCurveTo(x0 - 10, G - 336, x0 + 32, G - 362); c.quadraticCurveTo(x0 + 74, G - 336, x0 + 62, G - 314); c.closePath(); };
  c.fillStyle = INK; c.save(); c.translate(0, -2); dome(); c.fill(); c.restore(); c.save(); c.translate(2, 0); dome(); c.fill(); c.restore(); c.save(); c.translate(-2, 0); dome(); c.fill(); c.restore();
  c.fillStyle = PINK[2]; dome(); c.fill();
  c.save(); dome(); c.clip();
  box(c, x0 - 10, G - 364, 24, 50, PINK[3]); checker(c, x0 + 14, G - 364, 4, 50, PINK[3]);
  box(c, x0 + 6, G - 352, 4, 30, PINK[4]);
  box(c, x0 + 46, G - 364, 30, 50, PINK[1]); checker(c, x0 + 42, G - 364, 4, 50, PINK[1], 1);
  for (let i = 0; i < 4; i++) { const yy = G - 318 - i * 10; box(c, x0 - 10, yy, 84, 1, PINK[0]); }
  c.restore();
  pole(c, x0, G - 318, 64, 6, GOLD[2]); box(c, x0 - 1, G - 319, 66, 1, INK);
  ball(c, x0 + 32, G - 366, 4, GOLD[2]);
};

/** The park's mascot: a big gold star with a face (a grin, rosy cheeks, a wink now and then), bobbing on the sign. */
const mascot = (c: Ctx, x: number, y: number, f: number) => {
  y += Math.sin(f * 0.05) > 0 ? 0 : 2;
  steppedGlow(c, x, y, 50, '#FFF3B0', 0.28, 0.04, 4);
  const r = 32;
  star(c, x + 2, y + 3, r + 3, INK); star(c, x, y, r + 3, INK);
  star(c, x, y, r, GOLD[1]);
  c.save(); c.beginPath(); c.rect(x - r - 2, y - r - 2, r * 1.1, r * 2.4); c.clip(); star(c, x, y, r, GOLD[2]); c.restore();
  c.save(); c.beginPath(); c.rect(x - r - 2, y - r - 2, r * 2.4, r * 0.95); c.clip(); star(c, x, y, r, GOLD[2]); c.restore();
  star(c, x - 3, y - 3, r * 0.62, GOLD[3]);
  star(c, x - 6, y - 7, r * 0.26, GOLD[4]);
  box(c, x - 2, y - r + 4, 2, 6, GOLD[4]);
  // (the face)
  const t = f % 260, blink = t < 6, wink = t > 130 && t < 150;
  for (const [ex, shut] of [[x - 9, blink], [x + 9, blink || wink]] as [number, boolean][]) {
    if (shut) { box(c, ex - 4, y - 3, 8, 2, INK); box(c, ex - 4, y - 5, 2, 2, INK); box(c, ex + 2, y - 5, 2, 2, INK); }
    else { ellipse(c, ex, y - 4, 3.5, 6, INK); box(c, ex - 2, y - 8, 2, 3, '#FFFFFF'); box(c, ex, y - 2, 1, 1, '#FFFFFF'); }
  }
  box(c, x - 18, y + 3, 6, 3, '#F08A7A'); box(c, x + 12, y + 3, 6, 3, '#F08A7A');
  ellipse(c, x, y + 4, 10, 9, INK, 0, Math.PI);
  ellipse(c, x, y + 4, 8, 7, '#7A1020', 0, Math.PI);
  box(c, x - 7, y + 4, 14, 2, '#FFFFFF');
  ellipse(c, x + 1, y + 9, 4, 2, '#F2789A');
};

// ---------------------------------------------------------------------------------------------------------------
// The ticket booths

/** The bulbs round the TICKETS board on the roof. */
const MARQUEE_BULBS: [number, number][] = [];
for (let x = BX + 72; x <= BX + 188; x += 12) MARQUEE_BULBS.push([x, G - 240]);
for (let y = G - 230; y <= G - 214; y += 10) MARQUEE_BULBS.push([BX + 190, y]);
for (let x = BX + 188; x >= BX + 72; x -= 12) MARQUEE_BULBS.push([x, G - 204]);
for (let y = G - 214; y >= G - 230; y -= 10) MARQUEE_BULBS.push([BX + 70, y]);

/** A brass fan grille across the top of a window. */
const grille = (c: Ctx, wx: number) => {
  c.strokeStyle = BRASS[3]; c.lineWidth = 1;
  for (let x = wx + 3; x < wx + 60; x += 6) { c.beginPath(); c.moveTo(wx + 30, G - 128); c.lineTo(x, G - 140); c.stroke(); }
  ellipse(c, wx + 30, G - 128, 7, 6, INK, Math.PI, Math.PI * 2); ellipse(c, wx + 30, G - 128, 6, 5, BRASS[2], Math.PI, Math.PI * 2); box(c, wx + 26, G - 132, 3, 2, BRASS[4]);
  box(c, wx, G - 130, 60, 3, INK); box(c, wx, G - 129, 60, 1, BRASS[3]);
};

const booth = (c: Ctx) => {
  const top = G - 196;
  // (the plinth; below the counters, navy beadboard, gold-railed, a star on each panel)
  slab(c, BX - 4, G - 10, 268, 10, '#6B6258', { edge: 2 });
  slab(c, BX, G - 68, 260, 58, FLAG_BLUE[2], { edge: 4 });
  for (let x = BX + 6; x < BX + 256; x += 8) { box(c, x, G - 62, 1, 50, FLAG_BLUE[0]); box(c, x + 1, G - 62, 1, 50, FLAG_BLUE[3]); }
  for (let i = 0; i < 3; i++) { slab(c, WIN(i) + 6, G - 56, 48, 34, FLAG_BLUE[1], { edge: 2 }); shinyStar(c, WIN(i) + 30, G - 39, 9, FLAG_WHITE[4]); }
  // (the walls round the windows: white clapboard, each board lit along its top)
  slab(c, BX, G - 146, 260, 80, '#ECE5D6', { edge: 2 });
  for (let y = G - 144; y < G - 68; y += 6) { box(c, BX + 2, y, 256, 1, '#FFFFFF'); box(c, BX + 2, y + 5, 256, 1, '#B9AE98'); }
  // (the windows)
  for (let i = 0; i < 3; i++) {
    const wx = WIN(i);
    slab(c, wx - 5, G - 146, 70, 78, '#B91C1C', { edge: 2 });
    box(c, wx - 2, G - 143, 64, 2, GOLD[3]);
    // (inside: the back of the booth, a shelf, the roll of tickets)
    box(c, wx, G - 140, 60, 70, '#3A2A3E');
    box(c, wx, G - 140, 60, 18, '#4A3650'); checker(c, wx, G - 122, 60, PIX, '#4A3650');
    box(c, wx, G - 96, 60, 26, '#2A1E2E'); checker(c, wx, G - 98, 60, PIX, '#2A1E2E', 1);
    box(c, wx, G - 112, 60, 3, '#6A4A2A'); box(c, wx, G - 112, 60, 1, '#8E6A40');
    box(c, wx + 6, G - 120, 8, 8, PINK[2]); box(c, wx + 6, G - 120, 3, 8, PINK[3]); box(c, wx + 9, G - 117, 2, 2, INK);
    if (i < 2) {
      // (a blind pulled down, and the sign hung on it)
      for (let y = G - 140; y < G - 94; y += 4) { box(c, wx, y, 60, 4, '#D8C9A8'); box(c, wx, y, 60, 1, '#EFE4C8'); box(c, wx, y + 3, 60, 1, '#A8987A'); }
      box(c, wx, G - 94, 60, 3, '#6A4A2A'); ball(c, wx + 30, G - 89, 2, BRASS[2]);
      c.strokeStyle = BRASS[2]; c.lineWidth = 1; c.beginPath(); c.moveTo(wx + 14, G - 138); c.lineTo(wx + 20, G - 120); c.moveTo(wx + 46, G - 138); c.lineTo(wx + 40, G - 120); c.stroke();
      sign(c, wx + 4, G - 120, 52, 14, '#FEF3C7', 'CLOSED', RED, 6, INK);
      grille(c, wx);
      // (the glass over it, a glint across)
      c.save(); c.beginPath(); c.rect(wx, G - 140, 60, 70); c.clip();
      poly(c, [wx + 34, G - 140, wx + 44, G - 140, wx + 10, G - 70, wx, G - 70], 'rgba(255, 255, 255, 0.12)');
      c.restore();
      counter(c, wx);
    } else {
      // (her booth: a poster on the back wall, a little fan, a mug)
      box(c, wx + 41, G - 138, 16, 20, INK); box(c, wx + 42, G - 137, 14, 18, '#FDE047');
      ellipse(c, wx + 49, G - 130, 4, 4, '#F59E0B'); box(c, wx + 47, G - 132, 1, 1, INK); box(c, wx + 51, G - 132, 1, 1, INK); box(c, wx + 46, G - 129, 6, 1, INK);
      for (let k = 0; k < 3; k++) box(c, wx + 44 + k * 4, G - 123, 3, 2, '#7F1D1D');
      box(c, wx + 46, G - 118, 7, 6, '#F1EFEA'); box(c, wx + 52, G - 116, 2, 3, '#F1EFEA');
    }
  }
  // (pilasters between the windows: fluted white, gold caps)
  for (const px of [BX + 1, BX + 83, BX + 163, BX + 245]) {
    pole(c, px, G - 146, 14, 78, '#F1EFEA');
    box(c, px + 4, G - 140, 1, 66, '#B9AE98'); box(c, px + 9, G - 140, 1, 66, '#B9AE98');
    slab(c, px - 2, G - 150, 18, 6, GOLD[2], { edge: 2 }); slab(c, px - 2, G - 72, 18, 4, GOLD[1], { edge: 2, ink: false });
  }
  // (the frieze: the prices over each window, the fine print under them)
  slab(c, BX, G - 192, 260, 46, FLAG_BLUE[1], { edge: 2 });
  const prices: [string, string][] = [['ONE DAY', '$189'], ['TWO DAYS', '$189*'], ['UNDER 2', '$189']];
  prices.forEach(([a, b], i) => {
    const wx = WIN(i);
    box(c, wx, G - 188, 60, 28, INK); box(c, wx + 1, G - 187, 58, 26, GOLD[2]); box(c, wx + 1, G - 187, 58, 1, GOLD[4]); box(c, wx + 1, G - 187, 1, 26, GOLD[3]);
    box(c, wx + 1, G - 162, 58, 1, GOLD[0]); box(c, wx + 58, G - 187, 1, 26, GOLD[1]);
    slab(c, wx + 3, G - 185, 54, 22, '#FEF3C7', { edge: 2, ink: false }); box(c, wx + 3, G - 185, 54, 1, INK);
    signAt(c, a, wx + 30, G - 176, 6, federal(6, '#7F1D1D'));
    signAt(c, b, wx + 31, G - 165, 8, federal(8, FLAG_BLUE[2], '#D8C8A0'));
  });
  for (const px of [BX + 90, BX + 170]) shinyStar(c, px, G - 174, 6, GOLD[3]);
  signAt(c, "*YOU'RE NOT GETTING THE SECOND DAY.", BX + 130, G - 149, 5, federal(5, '#FDE68A', INK));
  // (the cornice: gold, dentils)
  slab(c, BX - 6, top, 272, 6, GOLD[2], { edge: 2 });
  for (let x = BX - 2; x < BX + 264; x += 6) box(c, x, top + 6, 3, 2, GOLD[0]);
  // The roof: red and white stripes, lit high, shaded toward the eave and round its right side
  const rt = G - 244, rh = top - rt, n = 13;
  const shadeAt = (k: number) => (k < 0.12 ? 4 : k < 0.32 ? 3 : k < 0.74 ? 2 : 1);
  for (let y = rt; y < top; y += 2) {
    const k = (y - rt) / rh, xl = BX + 24 + (BX - 12 - (BX + 24)) * k, xr = BX + 236 + (BX + 272 - (BX + 236)) * k;
    const sh = shadeAt(k), shN = shadeAt((y + 2 - rt) / rh), edge = shN !== sh && ((y / 2) & 1) === 0;
    for (let s = 0; s < n; s++) {
      const a = Math.round(xl + ((xr - xl) * s) / n), b = Math.round(xl + ((xr - xl) * (s + 1)) / n);
      const rp = s % 2 ? FLAG_WHITE : FLAG_RED, side = s >= n - 3 ? 1 : 0;
      box(c, a, y, b - a, 2, rp[Math.max(0, sh - side)]);
      if (edge) checker(c, a, y, b - a, 2, rp[Math.max(0, shN - side)]);
    }
  }
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(BX + 24, rt); c.lineTo(BX + 236, rt); c.lineTo(BX + 272, top); c.lineTo(BX - 12, top); c.closePath(); c.stroke();
  pole(c, BX + 20, rt - 4, 220, 5, GOLD[2]); box(c, BX + 20, rt - 5, 220, 1, INK);
  ball(c, BX + 20, rt - 5, 4, GOLD[2]); ball(c, BX + 240, rt - 5, 4, GOLD[2]);
  // (the valance: a scallop under each stripe)
  for (let s = 0; s < n; s++) {
    const a = BX - 12 + (284 * s) / n, w = 284 / n, cx = a + w / 2, rp = s % 2 ? FLAG_WHITE : FLAG_RED;
    ellipse(c, cx, top, w / 2 + 1, 9, INK, 0, Math.PI); ellipse(c, cx, top, w / 2, 8, rp[1], 0, Math.PI); ellipse(c, cx - 1, top, w / 2 - 2, 5, rp[2], 0, Math.PI);
  }
  // (the TICKETS board up on the roof)
  slab(c, BX + 66, G - 244, 128, 44, FLAG_RED[1], { edge: 4 });
  box(c, BX + 78, G - 234, 104, 24, FLAG_RED[0]);
  bigText(c, 'TICKETS', BX + 130, G - 214, 12, 2);
  // (the cupola: louvers, a little navy dome, a ball on top)
  slab(c, BX + 108, G - 264, 44, 20, FLAG_WHITE[3], { edge: 2 });
  slab(c, BX + 114, G - 286, 32, 22, FLAG_WHITE[3], { edge: 2 });
  for (let y = G - 282; y < G - 266; y += 3) { box(c, BX + 118, y, 24, 2, FLAG_WHITE[1]); box(c, BX + 118, y, 24, 1, '#6E6A64'); }
  ellipse(c, BX + 130, G - 286, 19, 14, INK, Math.PI, Math.PI * 2);
  ellipse(c, BX + 130, G - 286, 17, 12, FLAG_BLUE[2], Math.PI, Math.PI * 2);
  ellipse(c, BX + 125, G - 288, 9, 8, FLAG_BLUE[3], Math.PI, Math.PI * 2); box(c, BX + 120, G - 294, 3, 3, FLAG_BLUE[4]);
  box(c, BX + 112, G - 287, 36, 2, GOLD[2]);
};

/** The booth's ends, whichever faces him (a live polygon apiece: the front's the stamp): the same bands as its front
 *  turned side on (the gold cornice, the navy frieze, the white clapboard with its boards running back, the navy
 *  beadboard, the plinth), standing on the plaza going back with it; darker in steps the further back. */
const BOOTH_DEPTH = 0.9;
const boothSides = (c: Ctx, eye: Eye) => {
  const top = G - 196;
  for (const [e, side] of [[BX, -1], [BX + 260, 1]] as const) sideFace(c, eye, e, side, top, G, BOOTH_DEPTH, '#ECE5D6', pt => {
    const band = (y0: number, y1: number, col: string) => {
      const a = pt(0, y0), b = pt(1, y0), d = pt(1, y1), e0 = pt(0, y1);
      c.fillStyle = col; c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.lineTo(...d); c.lineTo(...e0); c.closePath(); c.fill();
    };
    band(top, top + 6, GOLD[1]);
    band(top + 4, G - 146, dark(FLAG_BLUE[1], 0.2));
    band(G - 146, G - 68, '#B9AE98');
    band(G - 68, G - 10, FLAG_BLUE[0]);
    band(G - 10, G, '#4E463E');
    // (the clapboard's boards and the beadboard's gold rail, running back to the eye)
    c.strokeStyle = 'rgba(96, 84, 64, 0.55)'; c.lineWidth = 1; c.beginPath();
    for (let y = G - 140; y < G - 68; y += 6) { const a = pt(0, y), b = pt(1, y); c.moveTo(...a); c.lineTo(...b); }
    c.stroke();
    const ra = pt(0, G - 68), rb = pt(1, G - 68); c.strokeStyle = GOLD[1]; c.lineWidth = 2; c.beginPath(); c.moveTo(...ra); c.lineTo(...rb); c.stroke();
    // (darker in steps going back, over the bands)
    for (const [k0, k1, shade] of [[0.4, 0.7, 'rgba(10, 12, 30, 0.12)'], [0.7, 1, 'rgba(10, 12, 30, 0.24)']] as const) {
      const a = pt(k0, top), b = pt(k1, top), d = pt(k1, G), e0 = pt(k0, G);
      c.fillStyle = shade; c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.lineTo(...d); c.lineTo(...e0); c.closePath(); c.fill();
    }
  }, '#DCC9A2');
};

/** A window's counter: a slim brass ledge, dark (it's a ledge at the back, not a step), a slot for the money. */
const counter = (c: Ctx, wx: number) => {
  box(c, wx - 4, G - 72, 68, 4, INK);
  box(c, wx - 3, G - 72, 66, 1, dim(BRASS[3])); box(c, wx - 3, G - 71, 66, 2, dim(BRASS[1]));
  box(c, wx + 20, G - 71, 20, 2, INK);
};

/** Her window's glass, over her: the grille, the speaking hole, glints, the counter. */
const glass = (c: Ctx) => {
  const wx = WIN(2);
  grille(c, wx);
  c.save(); c.beginPath(); c.rect(wx, G - 140, 60, 70); c.clip();
  poly(c, [wx + 2, G - 126, wx + 14, G - 126, wx + 2, G - 102], 'rgba(255, 255, 255, 0.16)');
  poly(c, [wx + 50, G - 126, wx + 56, G - 126, wx + 36, G - 70, wx + 30, G - 70], 'rgba(255, 255, 255, 0.1)');
  box(c, wx + 2, G - 126, 1, 18, 'rgba(255, 255, 255, 0.35)');
  c.restore();
  // (the speaking hole: a little brass rose low on the glass)
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.arc(wx + 30, G - 80, 4, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = BRASS[2]; c.lineWidth = 1.5; c.beginPath(); c.arc(wx + 30, G - 80, 4, 0, Math.PI * 2); c.stroke();
  box(c, wx + 27, G - 84, 2, 1, BRASS[4]);
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(c, wx + 30 + dx, G - 80 + dy, 1, 1, 'rgba(26, 11, 6, 0.6)');
  counter(c, wx);
};

/**
 * The ticket lady in her window (HI! I'M DEB): auburn ponytail, a red-white-and-blue visor, a headset, a red polo with a
 * white collar and a name tag, a smile that's been on all day. Breathes, blinks, nods the line on, glances along it.
 * Knocked out (ko counting up from 1): reels, loses the visor onto the counter, slumps out of sight; after that just
 * an arm hung over the counter, and stars going round.
 */
const ticketLady = (c: Ctx, x: number, y: number, f: number, ko: number) => {
  const p = ko > 0 ? Math.min(1, (ko - 1) / 11) : 0;
  const reel = ko <= 0 ? 0 : ko <= 4 ? ko / 4 : Math.max(0, 1 - (ko - 4) / 4);
  if (ko <= 0 || ko < 14) {
    c.save();
    c.beginPath(); c.rect(x - 30, y - 70, 60, 70); c.clip();
    c.translate(x, y);
    if (ko > 0) { c.translate(Math.round(reel * 3 + p * 4), Math.round(p * p * 66)); c.rotate(-reel * 0.12 + p * 0.4); }
    ladyBody(c, f, ko, p, reel);
    c.restore();
  }
  glass(c);
  if (ko <= 0) return;
  // (the visor, knocked off, landing askew on the counter)
  if (ko >= 3) {
    const t = Math.min(1, (ko - 3) / 7);
    c.save(); c.translate(Math.round(x + 2 - t * 23), Math.round(y - 46 + t * t * 44)); c.rotate(-t * 0.3);
    visor(c, 0, 0); c.restore();
  }
  // (her arm, hung limp over the counter's edge)
  if (ko >= 10) {
    const tw = f % 97 < 3 ? 1 : 0;
    // (the sleeve's cuff behind the counter, the forearm across it, the hand hung down its front)
    box(c, x + 1, y - 8, 9, 8, INK); box(c, x + 2, y - 7, 7, 6, POLO[2]); box(c, x + 2, y - 7, 7, 1, POLO[3]); box(c, x + 2, y - 2, 7, 1, WHITE);
    box(c, x - 9, y - 7, 12, 7, INK); box(c, x - 8, y - 6, 10, 4, SKIN[2]); box(c, x - 8, y - 6, 10, 1, SKIN[3]); box(c, x - 8, y - 3, 10, 1, SKIN[1]);
    box(c, x - 10, y - 4, 9, 13 + tw, INK);
    box(c, x - 9, y - 3, 7, 11 + tw, SKIN[2]); box(c, x - 9, y - 3, 2, 11 + tw, SKIN[3]); box(c, x - 3, y - 3, 1, 11 + tw, SKIN[1]);
    box(c, x - 7, y + 4 + tw, 1, 4, SKIN[1]); box(c, x - 5, y + 4 + tw, 1, 4, SKIN[1]);
  }
  // (stars going round where her head went down)
  const sy = Math.min(y - 8, y - 50 + p * p * 66);
  for (let i = 0; i < 3; i++) {
    const a = f * 0.15 + i * 2.094, front = Math.sin(a) > 0;
    const sx = x + Math.cos(a) * 13, yy = sy + Math.sin(a) * 4, r = front ? 4 : 3;
    star(c, sx, yy, r + 1.5, INK); star(c, sx, yy, r, front ? '#FDE047' : '#D4A017'); if (front) box(c, sx - 1, yy - 2, 1, 1, '#FFFFFF');
  }
};

/** The visor, on its own (the brim's stripes curving under its navy band). */
const visor = (c: Ctx, x: number, y: number) => {
  ellipse(c, x, y + 2, 13, 4.5, INK, 0, Math.PI);
  box(c, x - 11, y - 2, 22, 5, INK);
  box(c, x - 10, y - 1, 20, 3, FLAG_BLUE[2]); box(c, x - 10, y - 1, 20, 1, FLAG_BLUE[3]);
  box(c, x - 4, y, 1, 1, '#FFFFFF'); box(c, x + 3, y, 1, 1, '#FFFFFF');
  ellipse(c, x, y + 2, 12, 3.5, FLAG_RED[2], 0, Math.PI);
  ellipse(c, x, y + 2, 10.5, 2.4, FLAG_WHITE[3], 0, Math.PI);
  ellipse(c, x, y + 2, 9, 1.2, FLAG_RED[3], 0, Math.PI);
};

/** Her, from the counter (0, 0) up. */
const ladyBody = (c: Ctx, f: number, ko: number, p: number, reel: number) => {
  const b = ko > 0 ? 0 : Math.sin(f * 0.045) > 0.35 ? -1 : 0;
  // (the torso: red polo, lit down her right, shaded down her left)
  box(c, -15, -27 + b, 30, 2, INK); box(c, -17, -25 + b, 34, 26, INK);
  box(c, -14, -26 + b, 28, 2, POLO[2]); box(c, -16, -24 + b, 32, 25, POLO[2]);
  box(c, -16, -24 + b, 5, 25, POLO[3]); checker(c, -11, -24 + b, 2, 25, POLO[3]);
  box(c, -14, -26 + b, 7, 1, POLO[4]); box(c, -16, -24 + b, 1, 8, POLO[4]);
  box(c, 11, -24 + b, 5, 25, POLO[1]); checker(c, 9, -24 + b, 2, 25, POLO[1], 1);
  box(c, -10, -18 + b, 1, 12, POLO[1]); box(c, 9, -18 + b, 1, 12, POLO[0]);
  box(c, -16, -12 + b, 6, 2, FLAG_WHITE[3]); box(c, 10, -12 + b, 6, 2, FLAG_WHITE[2]);
  // (forearms down to her hands, on the counter)
  box(c, -16, -10 + b, 6, 11, INK); box(c, -15, -10 + b, 4, 9, SKIN[2]); box(c, -15, -10 + b, 1, 9, SKIN[3]);
  box(c, 10, -10 + b, 6, 11, INK); box(c, 11, -10 + b, 4, 9, SKIN[1]);
  box(c, -14, -4, 8, 4, INK); box(c, -13, -3, 6, 3, SKIN[3]); box(c, -11, -3, 1, 2, SKIN[1]);
  box(c, 6, -4, 8, 4, INK); box(c, 7, -3, 6, 3, SKIN[2]); box(c, 10, -3, 1, 2, SKIN[1]);
  // (the neck, the white collar, the placket, the name tag: HI! I'M DEB)
  box(c, -3, -31 + b, 6, 6, SKIN[1]); box(c, -3, -31 + b, 2, 6, SKIN[2]);
  poly(c, [-8, -27 + b, 0, -25 + b, -1, -20 + b, -7, -22 + b], INK);
  poly(c, [-7, -26 + b, -1, -25 + b, -2, -21 + b, -6, -23 + b], FLAG_WHITE[4]);
  poly(c, [8, -27 + b, 0, -25 + b, 1, -20 + b, 7, -22 + b], INK);
  poly(c, [7, -26 + b, 1, -25 + b, 2, -21 + b, 6, -23 + b], FLAG_WHITE[2]);
  box(c, -1, -22 + b, 2, 9, FLAG_WHITE[3]); box(c, 0, -22 + b, 1, 9, FLAG_WHITE[1]);
  box(c, -1, -19 + b, 1, 1, '#8A8A8A'); box(c, -1, -16 + b, 1, 1, '#8A8A8A');
  box(c, 3, -20 + b, 11, 7, INK); box(c, 4, -19 + b, 9, 5, '#FFFFFF'); box(c, 4, -19 + b, 9, 1, RED);
  box(c, 5, -17 + b, 3, 1, BLUE); box(c, 9, -17 + b, 3, 1, BLUE); box(c, 5, -15 + b, 7, 1, '#6A6A6A');
  // The head (nodding the line on now and then; lolling, once she's hit)
  c.save();
  const hy = ko > 0 ? 0 : f % 220 < 8 ? 1 : 0;
  c.translate(0, b + hy);
  if (ko > 0) { c.translate(0, -31); c.rotate(-reel * 0.3 + p * 0.6); c.translate(0, 31); }
  const gaze = ko > 0 ? 0 : (() => { const t = f % 300; return t > 90 && t < 150 ? -1 : t > 200 && t < 240 ? 1 : 0; })();
  // (the ponytail, swinging behind, a blue scrunchie)
  const sw = Math.round(Math.sin(f * 0.05) * 1.5);
  ellipse(c, 12 + sw, -38, 5, 11, INK); ellipse(c, 12 + sw, -38, 4, 10, HAIR[1]);
  ellipse(c, 11 + sw, -40, 2, 7, HAIR[2]); box(c, 10 + sw, -45, 1, 4, HAIR[3]);
  box(c, 7, -49, 6, 5, INK); box(c, 8, -48, 4, 3, FLAG_BLUE[2]); box(c, 8, -48, 4, 1, FLAG_BLUE[3]);
  box(c, 8, -46, 3, 6, '#2A2A30'); // (the headset's far cup)
  // (the face: skin lit from the upper left)
  ellipse(c, 0, -42, 9.5, 10.5, INK);
  ellipse(c, 0, -42, 8.5, 9.5, SKIN[2]);
  c.save(); c.beginPath(); c.ellipse(0, -42, 8.5, 9.5, 0, 0, Math.PI * 2); c.clip();
  ellipse(c, -2, -44, 5.5, 6.5, SKIN[3]);
  box(c, 5, -52, 5, 22, SKIN[1]); checker(c, 3, -52, 2, 22, SKIN[1]);
  box(c, -6, -48, 2, 2, SKIN[4]);
  box(c, -5, -33, 10, 1, SKIN[1]);
  c.restore();
  box(c, 8, -43, 2, 4, SKIN[1]);
  // (hair down the sides, the crown above the visor)
  box(c, -10, -50, 3, 11, HAIR[2]); box(c, -10, -50, 1, 9, HAIR[3]); box(c, 7, -50, 3, 11, HAIR[1]);
  c.save(); c.beginPath(); c.rect(-13, -62, 26, 12); c.clip();
  ellipse(c, 0, -48, 11, 7.5, INK); ellipse(c, 0, -48, 10, 6.5, HAIR[2]);
  ellipse(c, -3, -51, 6, 3.5, HAIR[3]); box(c, -6, -54, 4, 1, HAIR[4]); box(c, 4, -55, 6, 5, HAIR[1]);
  c.restore();
  const visorOn = ko < 3;
  if (visorOn) {
    visor(c, 0, -50);
    box(c, -8, -45, 5, 2, HAIR[2]); box(c, -8, -45, 2, 1, HAIR[3]); // (her bangs, swept out from under it)
  } else { box(c, -10, -51, 20, 3, HAIR[2]); box(c, -10, -51, 20, 1, HAIR[3]); }
  // (brows, eyes, nose, cheeks, the smile)
  box(c, -6, -44, 4, 1, HAIR[1]); box(c, 2, -44, 4, 1, HAIR[1]);
  if (ko > 0) {
    for (const ex of [-6, 2]) for (const [dx, dy] of [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]]) box(c, ex + dx, -42 + dy, 1, 1, INK);
    box(c, -2, -37, 4, 3, INK); box(c, -1, -36, 2, 1, '#7A1020'); box(c, 1, -34, 2, 2, '#F2789A');
  } else {
    const blink = f % 173 < 5;
    for (const ex of [-6, 2]) {
      if (blink) { box(c, ex, -41, 4, 1, INK); continue; }
      box(c, ex, -41, 4, 2, '#FFFFFF'); box(c, ex, -42, 4, 1, INK);
      box(c, ex + 1 + gaze, -41, 2, 2, '#2B4C7E'); box(c, ex + 1 + gaze, -41, 1, 1, INK);
    }
    box(c, -7, -42, 1, 1, INK); box(c, 6, -42, 1, 1, INK);
    box(c, -4, -36, 8, 2, INK); box(c, -3, -36, 6, 1, '#FFFFFF');
    box(c, -5, -37, 1, 1, INK); box(c, 4, -37, 1, 1, INK); box(c, -3, -34, 6, 1, '#C25A55');
  }
  box(c, 0, -39, 1, 2, SKIN[1]);
  box(c, -7, -38, 2, 1, '#EE8A80'); box(c, 5, -38, 2, 1, '#E07870');
  // (the headset: the band over her head, the cup on her right ear, the mic at her mouth)
  c.strokeStyle = '#2A2A30'; c.lineWidth = 2; c.beginPath(); c.arc(0, -46, 11, Math.PI * 1.02, Math.PI * 1.98); c.stroke();
  c.strokeStyle = '#70707C'; c.lineWidth = 1; c.beginPath(); c.arc(0, -46, 11.5, Math.PI * 1.15, Math.PI * 1.45); c.stroke();
  box(c, -14, -47, 5, 8, INK); box(c, -13, -46, 3, 6, '#3A3A44'); box(c, -13, -46, 1, 6, '#6A6A78');
  c.strokeStyle = '#2A2A30'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-11, -40); c.quadraticCurveTo(-10, -35, -5, -35); c.stroke();
  box(c, -6, -36, 3, 2, '#18181B'); box(c, -6, -36, 1, 1, '#8A8A96');
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The line

const ropes = (c: Ctx) => {
  const posts: number[] = [];
  for (let x = R(QUEUE_START) - 40; x < R(FRONT_X) + 20; x += 120) posts.push(x);
  // (the ropes first, then the posts over their ends)
  for (let i = 0; i + 1 < posts.length; i++) {
    if (posts[i] >= R(FRONT_X) - 100) continue;
    const a = posts[i] + 6, b = posts[i + 1], m = (a + b) / 2, y = G - 36;
    const rope = (dy: number) => { c.beginPath(); c.moveTo(a, y + dy); c.quadraticCurveTo(m, y + 26 + dy, b, y + dy); c.stroke(); };
    c.strokeStyle = INK; c.lineWidth = 7; rope(0);
    c.strokeStyle = VELVET[1]; c.lineWidth = 5; rope(0);
    c.strokeStyle = VELVET[2]; c.lineWidth = 3; rope(-1);
    c.strokeStyle = VELVET[3]; c.lineWidth = 1; rope(-2);
    // (the twist in the velvet, a fleck of shine)
    for (let k = 0.1; k < 0.95; k += 0.08) {
      const t = k, xx = (1 - t) * (1 - t) * a + 2 * t * (1 - t) * m + t * t * b, yy = (1 - t) * (1 - t) * y + 2 * t * (1 - t) * (y + 26) + t * t * y;
      box(c, xx, yy + 1, 1, 1, VELVET[0]); if (k < 0.5) box(c, xx + 1, yy - 2, 1, 1, VELVET[4]);
    }
    for (const ex of [a, b - 4]) { box(c, ex - 1, y - 3, 6, 6, INK); box(c, ex, y - 2, 4, 4, GOLD[2]); box(c, ex, y - 2, 2, 1, GOLD[4]); }
  }
  for (const x of posts) {
    ellipse(c, x + 3, G - 3, 11, 4, INK); ellipse(c, x + 3, G - 3, 10, 3, BRASS[1]); ellipse(c, x + 1, G - 4, 7, 2, BRASS[3]); box(c, x - 4, G - 5, 3, 1, BRASS[4]);
    pole(c, x + 1, G - 42, 5, 38, GOLD[2]);
    box(c, x - 1, G - 18, 9, 3, INK); box(c, x, G - 18, 7, 2, GOLD[3]);
    ball(c, x + 3, G - 44, 4, GOLD[2]);
  }
};

const lineSigns = (c: Ctx) => {
  const stand = (x: number) => {
    pole(c, x - 2, G - 98, 4, 94, BRASS[2]);
    ellipse(c, x, G - 3, 10, 4, INK); ellipse(c, x, G - 3, 9, 3, BRASS[1]); ellipse(c, x - 2, G - 4, 6, 2, BRASS[3]);
  };
  const s1 = R(QUEUE_START) - 60, s2 = R(QUEUE_START) + 120;
  stand(s1 + 75); stand(s2 + 105);
  sign(c, s1, G - 120, 150, 20, '#FEF3C7', 'LINE STARTS HERE', BLUE, 6, GOLD[2]);
  sign(c, s2, G - 120, 210, 20, '#FEF3C7', 'WAIT TIME FROM HERE: YES', RED, 6, GOLD[2]);
  // (a gold star crest on each, a pointing hand on the first)
  shinyStar(c, s1 + 75, G - 128, 6, GOLD[3]); shinyStar(c, s2 + 105, G - 128, 6, GOLD[3]);
  poly(c, [s1 + 156, G - 116, s1 + 168, G - 110, s1 + 156, G - 104], INK);
  poly(c, [s1 + 157, G - 114, s1 + 165, G - 110, s1 + 157, G - 106], '#FEF3C7');
};

// ---------------------------------------------------------------------------------------------------------------
// The turnstile

const turnstile = (c: Ctx, tx: number, f: number, admitted: boolean) => {
  stamp(c, 'plaza-turnstile', tx - 6, G - 76, 34, 76, g => {
    slab(g, tx - 4, G - 6, 28, 6, '#57534E', { edge: 2 });
    slab(g, tx, G - 62, 20, 56, CHROME[2], { edge: 2 });
    box(g, tx + 3, G - 60, 2, 52, CHROME[4]); box(g, tx + 6, G - 60, 1, 52, CHROME[3]); box(g, tx + 15, G - 60, 2, 52, CHROME[1]);
    slab(g, tx - 2, G - 66, 24, 6, CHROME[1], { edge: 2 });
    box(g, tx + 4, G - 74, 12, 8, INK);
    box(g, tx + 6, G - 54, 8, 2, INK);
    box(g, tx + 5, G - 30, 10, 7, INK); box(g, tx + 6, G - 29, 8, 5, '#0B3B24');
    box(g, tx + 7, G - 28, 2, 3, '#4ADE80'); box(g, tx + 10, G - 28, 3, 1, '#4ADE80'); box(g, tx + 10, G - 26, 3, 1, '#4ADE80');
  });
  // (the light: red till he's let in, then green)
  const col = admitted ? '#22C55E' : '#EF4444';
  steppedGlow(c, tx + 10, G - 70, 10, col, 0.35, 0.05, 3);
  box(c, tx + 5, G - 73, 10, 6, admitted ? '#15803D' : '#991B1B'); box(c, tx + 5, G - 73, 6, 3, col); box(c, tx + 6, G - 72, 2, 1, '#FFFFFF');
  // (the arm: across the way, or swung down)
  if (!admitted) {
    box(c, tx - 28, G - 44, 40, 6, INK); box(c, tx - 27, G - 43, 38, 4, CHROME[2]); box(c, tx - 27, G - 43, 38, 1, CHROME[4]); box(c, tx - 27, G - 40, 38, 1, CHROME[1]);
    ball(c, tx - 28, G - 41, 3, '#EF4444');
  } else {
    box(c, tx + 7, G - 42, 6, 34, INK); box(c, tx + 8, G - 41, 4, 32, CHROME[2]); box(c, tx + 8, G - 41, 1, 32, CHROME[4]);
    ball(c, tx + 10, G - 8, 3, '#22C55E');
  }
  ball(c, tx + 10, G - 41, 4, CHROME[2]);
  void f;
};

// ---------------------------------------------------------------------------------------------------------------
// Plaza dressing

const LAMPS = [P0 + 40, R(QUEUE_START) + 150, GX + 214, P1 - 24];
const TOPIARY_X = P0 + 170;
const URNS = [P0 + 280, GX + 380];
const MAP_X = GX + 238;

/** A lamp post: iron, gold collars, a crossarm with two lanterns, a banner on a bracket. */
const lamp = (c: Ctx, x: number) => {
  slab(c, x - 9, G - 18, 18, 18, IRON, { edge: 2 });
  pole(c, x - 5, G - 40, 10, 22, IRON);
  pole(c, x - 3, G - 296, 6, 256, IRON);
  for (const y of [G - 44, G - 120, G - 230]) { pole(c, x - 5, y, 10, 4, GOLD[2]); box(c, x - 6, y, 12, 1, INK); }
  // (the crossarm, scrolls under it, the lanterns)
  box(c, x - 22, G - 284, 44, 4, INK); box(c, x - 21, G - 283, 42, 2, '#4A5A66');
  c.strokeStyle = INK; c.lineWidth = 2;
  for (const d of [-1, 1]) { c.beginPath(); c.arc(x + d * 9, G - 274, 6, d > 0 ? Math.PI : 0, d > 0 ? Math.PI * 1.5 : -Math.PI * 0.5, d < 0); c.stroke(); }
  for (const lx of [x - 19, x + 19]) {
    poly(c, [lx - 7, G - 284, lx + 7, G - 284, lx, G - 292], INK);
    box(c, lx - 6, G - 284, 12, 18, INK);
    box(c, lx - 5, G - 283, 10, 16, '#FCE7A8'); box(c, lx - 5, G - 283, 3, 16, '#FFF8DC'); box(c, lx + 3, G - 283, 2, 16, '#E0B860');
    box(c, lx - 1, G - 283, 1, 16, INK);
    box(c, lx - 7, G - 268, 14, 3, INK); ball(c, lx, G - 263, 2, GOLD[2]);
  }
  ball(c, x, G - 300, 4, GOLD[2]);
  // (the banner: navy, a gold star, red and white stripes)
  box(c, x + 3, G - 222, 18, 2, INK);
  box(c, x + 5, G - 220, 16, 52, INK);
  box(c, x + 6, G - 219, 14, 50, FLAG_BLUE[2]); box(c, x + 6, G - 219, 3, 50, FLAG_BLUE[3]);
  shinyStar(c, x + 13, G - 207, 5, GOLD[3]);
  for (let i = 0; i < 4; i++) box(c, x + 6, G - 196 + i * 6, 14, 3, i % 2 ? FLAG_WHITE[3] : FLAG_RED[2]);
  poly(c, [x + 6, G - 170, x + 20, G - 170, x + 13, G - 162], FLAG_BLUE[2]);
};

/** The eagle, clipped out of a hedge, wings up, in a stone planter (labeled, in case). */
const topiary = (c: Ctx) => {
  const x = TOPIARY_X;
  // (the planter)
  slab(c, x - 70, G - 40, 140, 40, '#CFC2A6');
  box(c, x - 66, G - 32, 132, 6, FLAG_RED[2]); box(c, x - 66, G - 26, 132, 4, FLAG_WHITE[3]); box(c, x - 66, G - 22, 132, 6, FLAG_BLUE[2]);
  slab(c, x - 74, G - 46, 148, 8, '#DED3BA', { edge: 2 });
  box(c, x - 6, G - 66, 12, 22, '#5A3A1E'); box(c, x - 6, G - 66, 4, 22, '#7A5230');
  // (the shrub, clipped into an eagle: wings raised, feathers stepped along their trailing edges, head turned, beak)
  const wing: number[] = [-8, -118, -26, -146, -50, -166, -68, -170, -62, -158, -70, -150, -58, -144, -64, -134, -50, -130, -54, -120, -38, -118, -38, -108, -16, -100];
  const shape = (ox: number, oy: number) => {
    c.beginPath();
    for (const d of [-1, 1]) { c.moveTo(x + ox + wing[0] * d, G + oy + wing[1]); for (let i = 2; i < wing.length; i += 2) c.lineTo(x + ox + wing[i] * d, G + oy + wing[i + 1]); c.closePath(); }
    c.ellipse(x + ox, G + oy - 100, 17, 28, 0, 0, Math.PI * 2);
    c.moveTo(x + ox + 12, G + oy - 136); c.ellipse(x + ox + 2, G + oy - 136, 11, 10, 0, 0, Math.PI * 2);
    c.moveTo(x + ox + 10, G + oy - 141); c.lineTo(x + ox + 24, G + oy - 136); c.lineTo(x + ox + 12, G + oy - 129); c.closePath();
    c.moveTo(x + ox - 12, G + oy - 78); c.lineTo(x + ox + 12, G + oy - 78); c.lineTo(x + ox + 16, G + oy - 64); c.lineTo(x + ox - 16, G + oy - 64); c.closePath();
  };
  c.fillStyle = INK; shape(2, 2); c.fill(); shape(-1, -1); c.fill(); shape(1, -1); c.fill(); shape(-1, 1); c.fill();
  c.fillStyle = HEDGE[1]; shape(0, 0); c.fill();
  c.save(); shape(0, 0); c.clip();
  // (leaf clumps, lighter toward the top left of each part, darker down and to the right)
  for (let py = G - 172; py < G - 60; py += 4) for (let px = x - 72; px < x + 72; px += 4) {
    const h = hash(px * 0.73 + py * 1.91), up = (G - 60 - py) / 112, lean = (x + 60 - px) / 240;
    const v = up * 0.55 + lean * 0.35 + (h - 0.5) * 0.5;
    const col = v > 0.72 ? HEDGE[4] : v > 0.52 ? HEDGE[3] : v > 0.32 ? HEDGE[2] : v > 0.12 ? HEDGE[1] : HEDGE[0];
    box(c, px + (h > 0.5 ? 1 : 0), py, 4, 4, col);
    if (h > 0.9) box(c, px, py, 2, 2, HEDGE[4]);
  }
  // (the feather lines on the wings, the body's breast lit)
  for (const d of [-1, 1]) for (let k = 0; k < 4; k++) { c.strokeStyle = HEDGE[0]; c.lineWidth = 1; c.beginPath(); c.moveTo(x + d * (16 + k * 10), G - 108 - k * 6); c.lineTo(x + d * (30 + k * 10), G - 140 - k * 7); c.stroke(); }
  pixelBlob(c, x - 4, G - 108, 8, 14, HEDGE[3]);
  c.restore();
  box(c, x + 4, G - 140, 3, 3, INK); box(c, x + 4, G - 140, 1, 1, '#E8F0D0');
  box(c, x + 2, G - 144, 7, 1, HEDGE[0]);
  sign(c, x - 45, G - 38, 90, 10, '#FEF3C7', 'EAGLE (A SHRUB)', '#14532D', 5, GOLD[2]);
};

/** An urn of red, white and blue petunias. */
const urn = (c: Ctx, x: number) => {
  slab(c, x - 12, G - 10, 24, 10, '#DED3BA', { edge: 2 });
  box(c, x - 5, G - 20, 10, 10, INK); box(c, x - 4, G - 20, 8, 10, '#E8E2D0'); box(c, x - 4, G - 20, 2, 10, '#FFFFFF');
  ellipse(c, x, G - 34, 19, 15, INK, 0, Math.PI);
  ellipse(c, x, G - 34, 18, 14, '#C9C1AE', 0, Math.PI);
  ellipse(c, x - 3, G - 34, 13, 11, '#E8E2D0', 0, Math.PI);
  ellipse(c, x - 6, G - 34, 5, 7, '#FFFFFF', 0, Math.PI);
  box(c, x - 18, G - 30, 36, 3, FLAG_BLUE[2]);
  slab(c, x - 21, G - 38, 42, 6, '#DED3BA', { edge: 2 });
  pixelBlob(c, x, G - 44, 20, 9, HEDGE[1]); pixelBlob(c, x - 4, G - 47, 14, 6, HEDGE[2]);
  for (let i = 0; i < 14; i++) {
    const fx = snap(x - 18 + hash(i * 3.3 + x) * 36), fy = snap(G - 56 + hash(i * 7.9 + x) * 14), rp = [FLAG_RED, FLAG_WHITE, FLAG_BLUE][i % 3];
    box(c, fx - 1, fy - 1, 6, 6, INK); box(c, fx, fy, 4, 4, rp[2]); box(c, fx, fy, 2, 2, rp[4]); box(c, fx + 1, fy + 1, 2, 2, '#FDE047');
  }
};

/** The park map: nine lands round the hub, paths between, and where you are. */
const mapBoard = (c: Ctx) => {
  const x = MAP_X, w = 164, top = G - 190, h = 110;
  for (const lx of [x + 16, x + w - 22]) pole(c, lx, top + h, 6, G - top - h, IRON);
  slab(c, x - 6, top - 6, w + 12, h + 12, '#7A4A22');
  box(c, x, top, w, h, '#EFE2B8');
  box(c, x, top, w, 6, '#FBF3D6'); checker(c, x, top + 6, w, PIX, '#FBF3D6');
  box(c, x, top + h - 6, w, 6, '#D8C894');
  const hx = x + w / 2, hy = top + 48;
  const lands = ['#F472B6', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#F87171', '#2DD4BF', '#FB923C', '#A3E635'];
  lands.forEach((col, i) => {
    const a = ((120 + i * 37.5) * Math.PI) / 180, lx = hx + Math.cos(a) * 58, ly = hy + Math.sin(a) * 30;
    c.strokeStyle = '#C8A870'; c.lineWidth = 2; c.beginPath(); c.moveTo(hx, hy); c.lineTo(lx, ly); c.stroke();
    ellipse(c, lx, ly, 13, 9, INK); ellipse(c, lx, ly, 12, 8, col); ellipse(c, lx - 3, ly - 2, 6, 4, mix(col, '#FFFFFF', 0.35));
  });
  ellipse(c, hx, hy, 13, 10, INK); ellipse(c, hx, hy, 12, 9, PINK[2]); shinyStar(c, hx, hy, 7, GOLD[3]);
  c.strokeStyle = '#C8A870'; c.lineWidth = 2; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx, top + h - 18); c.stroke();
  ball(c, hx, top + h - 18, 3, '#DC2626');
  signAt(c, 'YOU ARE HERE (BROKE)', hx, top + h - 4, 5, print(5, '#7F1D1D'));
  sign(c, x + 22, top - 22, w - 44, 12, FLAG_BLUE[2], 'HAPPY LAND MAP', '#FDE047', 6, GOLD[2], gilt(6, FLAG_BLUE[0]));
};

// ---------------------------------------------------------------------------------------------------------------
// The plaza's floor

/** What stands on the plaza (for the shadows painted into the pavers under them). */
const SHADOWS: [number, number][] = [
  [GX - 186, GX - 110], [GX + 110, GX + 186], [BX - 4, BX + 264], [TOPIARY_X - 74, TOPIARY_X + 74],
  ...URNS.map((u): [number, number] => [u - 14, u + 14]), ...LAMPS.map((l): [number, number] => [l - 10, l + 10]),
  [R(TURN_X) - 4, R(TURN_X) + 24],
];
const CHUNK = 340;

/** The plaza's pavers: a lit lip, three courses of pink and cream tiles (a gold star let in by the gate), a patriotic
 * curb stripe, cut stone under it. Painted in stamped chunks; only the ones on screen are put down. */
export const drawPlazaFloor = (c: Ctx) => {
  const m = c.getTransform();
  const sc = m.a || 1, left = -m.e / sc, right = left + c.canvas.width / sc;
  for (let x = P0, k = 0; x < P1; x += CHUNK, k++) {
    const w = Math.min(CHUNK, P1 - x);
    if (x + w < left - 4 || x > right + 4) continue;
    stamp(c, `plaza-floor-${k}`, x, G, w, 140, g => floorChunk(g, x, w));
  }
};

const floorChunk = (c: Ctx, x0: number, w: number) => {
  c.save(); c.beginPath(); c.rect(x0, G, w, 140); c.clip();
  const x1 = x0 + w;
  // (the paver courses: pink and cream, each tile lit at its top and left, shaded under, speckled, the odd gum spot)
  const PAVE = [['#8E5068', '#B86A88', '#D98AA8', '#ECAFC6', '#F8D4E2'], ['#8C7A5A', '#BCA680', '#DCC9A2', '#EEDFC0', '#FAF0DC']];
  const courses: [number, number][] = [[6, 10], [16, 12], [28, 16]];
  box(c, x0, G + 4, w, 42, '#7A6656');
  courses.forEach(([y0, h], ci) => {
    const tw = 30 + ci * 6, off = (ci % 2) * (tw / 2);
    for (let tx = Math.floor((x0 - off) / tw) * tw + off; tx < x1; tx += tw) {
      const idx = Math.round((tx - off) / tw), rp = PAVE[(idx + ci) & 1];
      const y = G + y0, ww = tw - 2, hh = h - 2;
      box(c, tx, y, ww, hh, rp[2]);
      box(c, tx, y, ww, 2, rp[3]); box(c, tx, y, 2, hh, rp[3]); box(c, tx, y, ww, 1, rp[4]);
      checker(c, tx + 2, y + 2, ww - 2, PIX, rp[3]);
      box(c, tx, y + hh - 2, ww, 2, rp[1]); box(c, tx + ww - 2, y, 2, hh, rp[1]);
      for (let s = 0; s < 4; s++) { const sx = tx + 2 + hash(tx * 1.7 + s * 13 + ci) * (ww - 4), sy = y + 2 + hash(tx * 2.9 + s * 7 + ci) * (hh - 4); box(c, snap(sx), snap(sy), 1, 1, rp[s % 2 ? 1 : 4]); }
      const hsh = hash(tx * 0.37 + ci * 11);
      if (hsh < 0.08) { box(c, tx + ww / 2, y + hh / 2 - 1, 3, 2, '#5A5050'); box(c, tx + ww / 2, y + hh / 2 - 1, 1, 1, '#8A8080'); }
      else if (hsh > 0.93) { c.fillStyle = rp[0]; for (let k = 0; k < 6; k++) c.fillRect(tx + 4 + k * 3, y + 2 + ((k * 5) % 3), 3, 1); }
    }
  });
  // (the star let into the paving by the gate, in a navy ring with little white stars)
  if (x0 < GX + 100 && x1 > GX - 100) {
    c.save(); c.translate(GX, G + 26); c.scale(1, 0.24);
    c.fillStyle = INK; c.beginPath(); c.arc(0, 0, 96, 0, Math.PI * 2); c.fill();
    c.fillStyle = FLAG_BLUE[2]; c.beginPath(); c.arc(0, 0, 92, 0, Math.PI * 2); c.fill();
    c.fillStyle = FLAG_BLUE[3]; c.beginPath(); c.arc(-4, -10, 80, Math.PI, Math.PI * 1.6); c.lineTo(-4, -10); c.fill();
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; star(c, Math.cos(a) * 84, Math.sin(a) * 84, 6, '#FFFFFF'); }
    star(c, 0, 0, 78, INK); star(c, 0, 0, 74, GOLD[1]);
    c.save(); c.beginPath(); c.rect(-80, -80, 76, 160); c.clip(); star(c, 0, 0, 74, GOLD[2]); c.restore();
    star(c, -4, -8, 44, GOLD[3]); star(c, -10, -20, 16, GOLD[4]);
    c.restore();
  }
  // (shadows under whatever stands on it)
  for (const [a, b] of SHADOWS) if (b > x0 && a < x1) { box(c, a, G + 4, b - a, 4, 'rgba(40, 16, 20, 0.32)'); checker(c, a - 2, G + 8, b - a + 4, PIX, 'rgba(40, 16, 20, 0.3)'); }
  // (the lit lip along the top: this is the floor)
  box(c, x0, G, w, 2, '#FFF6E0'); box(c, x0, G + 2, w, 2, '#F3DDB8'); box(c, x0, G + 4, w, 1, '#6A5040');
  // (the curb stripe: red, white, blue)
  box(c, x0, G + 44, w, 3, FLAG_RED[2]); box(c, x0, G + 44, w, 1, FLAG_RED[3]);
  box(c, x0, G + 47, w, 3, FLAG_WHITE[3]); box(c, x0, G + 50, w, 3, FLAG_BLUE[2]); box(c, x0, G + 53, w, 1, INK);
  // (cut stone under it, darkening down)
  const ST = ['#B8A890', '#A49478', '#8E7E66', '#786A56', '#625646', '#4C4238'];
  ST.forEach((col, i) => box(c, x0, G + 54 + i * 15, w, 16, col));
  for (let i = 1; i < ST.length; i++) checker(c, x0, G + 54 + i * 15 - PIX, w, PIX, ST[i], i % 2);
  for (let row = 0, y = G + 54; y < G + 140; y += 22, row++) {
    box(c, x0, y, w, 1, 'rgba(26, 11, 6, 0.45)'); box(c, x0, y + 1, w, 1, 'rgba(255, 240, 210, 0.18)');
    for (let sx = Math.floor(x0 / 60) * 60 + (row % 2) * 30; sx < x1; sx += 60) { box(c, sx, y, 1, 22, 'rgba(26, 11, 6, 0.4)'); box(c, sx + 1, y, 1, 22, 'rgba(255, 240, 210, 0.14)'); }
  }
  for (let sx = x0; sx < x1; sx += 4) for (let y = G + 58; y < G + 140; y += 5) { const h = hash(sx * 0.91 + y * 1.37); if (h < 0.06) box(c, sx, y, 1, 1, 'rgba(255, 240, 210, 0.3)'); else if (h > 0.95) box(c, sx, y, 2, 1, 'rgba(26, 11, 6, 0.35)'); }
  c.restore();
};
