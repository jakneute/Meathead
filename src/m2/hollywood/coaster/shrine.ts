// The shrines (each stop's famous toilet, like a holy relic) and the control booth, peak SNES:
//   the toilets   porcelain in steps, inked: THE CHAIRMAN OF THE BOWEL (a crooner's pink, gold fittings; his fedora and
//                 his martini on the tank, a cigarette butt on the seat, a ring), THE GODFATHER'S CLOG (avocado, the
//                 plunger still stuck in it, an orange on the tank, a rose), THE ROCK GOD'S TOUR BUS TOILET (black,
//                 band stickers all over, a guitar pick; sealed in its hazmat case, glowing, something growing out)
//   the plinths   marble with gold moldings and a star (lit along the top: he can stand on it); stop 3's a hazard-
//                 striped steel base, biohazard signs, the case on it (glass in steps, steel corners, its lid lit)
//   the rest      velvet ropes on brass posts, the brass plaque on its stand, the theatre lights on their stands with
//                 their stepped beams, the name over each (deco letters on a board: hung, or on posts)
//   the booth     up on its stilts: corrugated steel, the big window (the sky in it by day, lit at night), the sleeper
//                 slumped at the desk behind it, the panel's lamps; the lever on its plate (RIDE MODE: NORMAL /
//                 EXPERIMENTAL), the lockout lamp, the handle at its throw (../lever.ts)

import type { GameState } from '../../../m1/game/core/state';
import { GY } from '../geometry';
import { drawPerson } from '../../adventure/temple/people';
import { type Ctx, type CView, INK, vis, pal, lattice, member, rivets, hazard, goldStar, beam, chains, PORCELAIN, CHROME, MARBLE, BIO } from './paint';
import { box, checker, mix, hash, poly, at, atDepth, still, stillAt, signW, STEEL, BRASS, ramp6, hour, lit, board, deco, plain, words, sideBack, topBack, glassOf, ball } from '../blvd/kit';
import { velvetRopePaint } from '../blvd/props';
import { X, Y, STOPS, BOOTH, BOOTH_LEVER, FUMES, LAUNCHED_MEMO, LEVER_MEMO, CLEARED_MEMO } from './layout';
import { throwAngle } from '../lever';
import type { Coaster } from './state';
import { throneState, caseLift, drawThroneMess } from './thrones';
import { WALL_D } from './set';

export const TITLES = ['THE CHAIRMAN OF THE BOWEL', "THE GODFATHER'S CLOG", "THE ROCK GOD'S TOUR BUS TOILET"];
const PLAQUES: [string, string][] = [['AS SAT ON BY', 'DINO SINATRELLI 1961'], ['AS CLOGGED BY', 'MARLOWE BRANDOE 1994'], ['NEVER FLUSHED', 'SINCE 1973']];
const BODY = ['#F4A6CC', '#9CAE3E', '#2A2830'];

// ---------------------------------------------------------------------------------------------------------------
// A toilet (feet at the origin: the bowl's foot from 0 to 12, the tank from -26 to -2, up to the lid at -74)

const paintToilet = (g: Ctx, i: number) => {
  const R = ramp6(hour(BODY[i])), C = (i === 0 ? BRASS : CHROME).map(c => hour(c));
  // (the pedestal and the bowl: one shape, lit up its left, shaded under the rim, ink round it)
  const bowl = () => { g.beginPath(); g.moveTo(-4, -26); g.lineTo(32, -26); g.quadraticCurveTo(31, -9, 16, -6); g.lineTo(13, 0); g.lineTo(-2, 0); g.lineTo(-1, -12); g.closePath(); };
  g.save(); bowl(); g.clip();
  box(g, -6, -28, 40, 30, R[3]); box(g, -6, -28, 9, 30, R[4]); box(g, -6, -28, 3, 14, R[5]);
  box(g, 20, -28, 14, 30, R[2]); checker(g, 17, -28, 3, 30, R[2], 0, 2); box(g, -6, -22, 40, 3, R[1]); box(g, 8, -6, 10, 8, R[1]);
  g.restore();
  bowl(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke();
  // (the bolt caps on the foot)
  box(g, -3, -4, 3, 3, R[4]); box(g, 11, -4, 3, 3, R[2]);
  // (the seat: a ring, its edge lit; the hinges)
  box(g, -7, -35, 42, 10, INK); box(g, -6, -34, 40, 8, R[3]); box(g, -6, -34, 40, 2, R[5]); box(g, -6, -28, 40, 2, R[2]); box(g, -6, -34, 3, 8, R[4]);
  box(g, -4, -36, 5, 3, C[3]); box(g, -4, -36, 2, 1, C[5]);
  // (the tank: stepped, its lid, the handle)
  box(g, -27, -71, 26, 42, INK); box(g, -26, -70, 24, 40, R[3]); box(g, -26, -70, 5, 40, R[4]); box(g, -26, -70, 1, 40, R[5]); box(g, -6, -70, 4, 40, R[2]);
  checker(g, -9, -70, 3, 40, R[2], 0, 2); box(g, -26, -34, 24, 4, R[1]);
  box(g, -29, -76, 30, 8, INK); box(g, -28, -75, 28, 6, R[4]); box(g, -28, -75, 28, 1, R[5]); box(g, -28, -70, 28, 1, R[2]);
  box(g, -25, -64, 7, 4, INK); box(g, -24, -63, 5, 2, C[4]); box(g, -24, -63, 2, 1, C[5]);
  if (i === 0) {
    // THE CHAIRMAN: his fedora on the lid (a band round it), his martini (an olive), a butt on the seat, the ring
    box(g, -29, -80, 18, 4, INK); box(g, -28, -79, 16, 2, hour('#2A2622')); box(g, -24, -88, 10, 9, INK); box(g, -23, -87, 8, 8, hour('#3A3430')); box(g, -23, -87, 3, 8, hour('#54504A')); box(g, -23, -82, 8, 2, hour('#7F1D1D'));
    const Gl = hour('#DCEAF0');
    g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.moveTo(-10, -92); g.lineTo(-4, -84); g.lineTo(2, -92); g.closePath(); g.stroke();
    g.fillStyle = Gl; g.beginPath(); g.moveTo(-9, -91); g.lineTo(-4, -85); g.lineTo(1, -91); g.closePath(); g.fill();
    box(g, -5, -84, 2, 7, INK); box(g, -8, -77, 8, 2, INK); box(g, -7, -90, 2, 2, '#FFFFFF');
    box(g, -6, -89, 3, 3, hour('#16A34A')); box(g, -5, -89, 1, 1, hour('#DC2626'));
    box(g, 16, -35, 7, 2, hour('#F5F5F4')); box(g, 22, -35, 2, 2, hour('#F97316'));
    box(g, 2, -32, 26, 1, hour('#8A6A3A'));
  } else if (i === 1) {
    // THE GODFATHER'S: the plunger stuck in it, an orange on the lid, a rose across the seat
    g.save(); g.translate(14, -30); g.rotate(0.32);
    box(g, -3, -46, 6, 44, INK); box(g, -2, -45, 4, 42, hour('#A16207')); box(g, -2, -45, 1, 42, hour('#D4A040'));
    g.fillStyle = INK; g.beginPath(); g.moveTo(-11, 2); g.quadraticCurveTo(0, -12, 11, 2); g.closePath(); g.fill();
    g.fillStyle = hour('#B91C1C'); g.beginPath(); g.moveTo(-9, 1); g.quadraticCurveTo(0, -10, 9, 1); g.closePath(); g.fill();
    box(g, -6, -4, 4, 2, hour('#E05050'));
    g.restore();
    ball(g, -14, -81, 5, hour('#F97316')); box(g, -14, -87, 2, 2, hour('#4D7C0F'));
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(-2, -36); g.lineTo(18, -38); g.stroke();
    g.strokeStyle = hour('#15803D'); g.lineWidth = 1.5; g.beginPath(); g.moveTo(-2, -36); g.lineTo(18, -38); g.stroke();
    ball(g, 21, -39, 3.5, hour('#B91C1C'));
  } else {
    // THE ROCK GOD'S: band stickers all over it, a guitar pick on the lid, a lightning bolt in white paint marker
    const st: [number, number, number, number, string][] = [[-24, -64, 8, 5, '#DC2626'], [-16, -50, 9, 6, '#FACC15'], [-22, -42, 6, 6, '#38BDF8'], [4, -22, 8, 5, '#F472B6'], [18, -18, 7, 6, '#F8FAFC'], [-12, -60, 6, 4, '#A3E635']];
    for (const [sx, sy, w, h, col] of st) { box(g, sx - 1, sy - 1, w + 2, h + 2, INK); box(g, sx, sy, w, h, hour(col)); box(g, sx, sy, w, 1, hour(mix(col, '#FFFFFF', 0.4))); }
    g.strokeStyle = hour('#F8FAFC'); g.lineWidth = 1.5; g.beginPath(); g.moveTo(-8, -66); g.lineTo(-14, -56); g.lineTo(-9, -56); g.lineTo(-15, -46); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.moveTo(-20, -79); g.lineTo(-12, -79); g.lineTo(-16, -72); g.closePath(); g.fill();
    g.fillStyle = hour('#9333EA'); g.beginPath(); g.moveTo(-19, -78.5); g.lineTo(-13, -78.5); g.lineTo(-16, -73.5); g.closePath(); g.fill();
  }
};
const toilet = (c: Ctx, i: number, x: number, y: number) => still(c, `hwc-toilet-${i}`, x, y, -34, -98, 76, 100, g => paintToilet(g, i));

// ---------------------------------------------------------------------------------------------------------------
// The plinths

/** A marble plinth (w × h): its front (moldings, veins, a star), painted once. */
const paintPlinth = (g: Ctx, w: number, h: number) => {
  const M = ramp6(hour(MARBLE[3])), G = BRASS.map(c => hour(c));
  box(g, -1, -1, w + 2, h + 1, INK);
  box(g, 0, 0, w, h, M[3]); box(g, 0, 0, 3, h, M[4]); box(g, w - 4, 0, 4, h, M[2]); checker(g, w - 7, 0, 3, h, M[2], 0, 2);
  // (the veins: thin, wandering, dithered)
  for (let k = 0; k < 5; k++) { let vx = 6 + hash(k * 3.3) * (w - 12); for (let y = 8; y < h - 10; y += 2) { vx += (hash(k * 9 + y) - 0.5) * 2.4; box(g, vx, y, 1, 2, (y >> 1) % 3 ? M[2] : M[1]); } }
  // (the moldings: gold along the top and the foot)
  box(g, 0, 2, w, 5, G[3]); box(g, 0, 2, w, 1, G[5]); box(g, 0, 6, w, 1, G[1]);
  box(g, 0, h - 9, w, 9, G[2]); box(g, 0, h - 9, w, 2, G[4]); box(g, 0, h - 2, w, 2, G[1]);
  // (the star in the middle, in a gold ring)
  g.fillStyle = INK; g.beginPath(); g.arc(w / 2, h / 2 - 2, 11, 0, Math.PI * 2); g.fill();
  g.fillStyle = G[2]; g.beginPath(); g.arc(w / 2, h / 2 - 2, 10, 0, Math.PI * 2); g.fill();
  g.fillStyle = M[4]; g.beginPath(); g.arc(w / 2, h / 2 - 2, 8, 0, Math.PI * 2); g.fill();
  goldStar(g, w / 2, h / 2 - 2, 6);
  // (its lit lip: he can stand on it)
  const L = pal().lip; box(g, 0, 0, w, 2, L[2]); box(g, 0, 0, w, 1, L[3]);
};
/** Stop 3's base: hazard-striped steel, bolted, its biohazard signs. */
const paintBase = (g: Ctx, w: number, h: number) => {
  const S = pal().steel;
  box(g, -1, -1, w + 2, h + 1, INK); box(g, 0, 0, w, h, S[2]); box(g, 0, 0, w, 2, S[4]); box(g, 0, 0, 2, h, S[3]); box(g, w - 3, 0, 3, h, S[1]);
  hazard(g, 0, h - 12, w, 10, 6);
  rivets(g, 4, w - 6, 5, 10, S);
  for (const bx of [22, w - 22]) {
    const Y2 = pal().hazard;
    g.fillStyle = INK; g.beginPath(); g.moveTo(bx, 7); g.lineTo(bx + 14, 31); g.lineTo(bx - 14, 31); g.closePath(); g.fill();
    g.fillStyle = Y2[3]; g.beginPath(); g.moveTo(bx, 10); g.lineTo(bx + 11, 29); g.lineTo(bx - 11, 29); g.closePath(); g.fill();
    g.fillStyle = Y2[5]; g.beginPath(); g.moveTo(bx, 10); g.lineTo(bx + 3, 15); g.lineTo(bx - 3, 15); g.closePath(); g.fill();
    // (the trefoil, crude: three dots round a ring)
    for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + (k * Math.PI * 2) / 3; box(g, bx + Math.cos(a) * 4 - 1.5, 22 + Math.sin(a) * 4 - 1.5, 3, 3, INK); }
    box(g, bx - 1, 21, 2, 2, INK);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The stands, the ropes, the plaque, the name

/** A theatre light on its stand (a tripod at the back, the can on its yoke), aimed at (tx, ty); its beam (live). */
const lightStand = (c: Ctx, v: CView, x: number, feetY: number, tx: number, ty: number, f: number, tod: boolean) => {
  const S = pal().steel, d = 0.985;
  atDepth(c, v.eye, d, () => {
    const top = feetY - 150;
    for (const dx of [-14, 14]) member(c, x, feetY - 34, x + dx, feetY, 2, S);
    member(c, x, top + 12, x, feetY - 30, 3, S);
    box(c, x - 3, feetY - 36, 6, 5, INK); box(c, x - 2, feetY - 35, 4, 3, S[3]);
    const a = Math.atan2(ty - top, tx - x);
    c.save(); c.translate(x, top); c.rotate(a - Math.PI / 2);
    box(c, -8, -10, 16, 20, INK); box(c, -7, -9, 14, 18, '#26222A'); box(c, -7, -9, 4, 18, '#46404E');
    box(c, -9, 8, 18, 5, INK); box(c, -8, 9, 16, 3, '#FFF6C8'); box(c, -6, 9, 5, 1, '#FFFFFF');
    c.restore();
  });
  const [lx, ly] = at(v.eye, x, feetY - 150, d);
  // (the beam: banded, stepped toward the toilet)
  const dx = tx - lx, dy = ty - ly, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
  for (let k = 0; k < 4; k++) {
    const t0 = k / 4, t1 = (k + 1) / 4, w0 = 7 + 44 * t0, w1 = 7 + 44 * t1;
    c.globalAlpha = (tod ? 0.2 : 0.12) * (1 - k * 0.15);
    c.fillStyle = '#FEF3C0';
    c.beginPath(); c.moveTo(lx + dx * t0 + nx * w0, ly + dy * t0 + ny * w0); c.lineTo(lx + dx * t1 + nx * w1, ly + dy * t1 + ny * w1); c.lineTo(lx + dx * t1 - nx * w1, ly + dy * t1 - ny * w1); c.lineTo(lx + dx * t0 - nx * w0, ly + dy * t0 - ny * w0); c.closePath(); c.fill();
  }
  c.globalAlpha = 1;
  void f;
};
/** The brass plaque on its stand (two lines). Feet at 0. */
const paintPlaque = (g: Ctx, a: string, b: string) => {
  const G = BRASS.map(c => hour(c));
  box(g, -3, -52, 6, 52, INK); box(g, -2, -52, 4, 52, G[2]); box(g, -2, -52, 1, 52, G[4]);
  box(g, -11, -5, 22, 5, INK); box(g, -10, -4, 20, 4, G[2]); box(g, -10, -4, 20, 1, G[4]);
  board(g, 0, -70, [a, b], plain(1, 1, '#3A2408'), G[3], G, 7);
};
/** The name over a shrine: deco letters on a board (crimson; stop 3's biohazard green). */
const paintTitle = (g: Ctx, i: number) => {
  const L = deco(i === 2 ? '#D9F99D' : '#F2C24A', i === 2 ? '#14532D' : '#4C0519', 2, 1);
  board(g, 0, 0, [TITLES[i]], L, i === 2 ? '#14532D' : '#5A0820', BRASS, 8);
};
const titleW = (i: number) => signW(TITLES[i], deco('#F2C24A', '#4C0519', 2, 1)) + 22;

/** Each shrine's name: hung from the catwalk over it (stop 1), or on its two posts (drawn before the catwalks). */
export const drawShrineTitle = (c: Ctx, v: CView, i: number) => {
  const s = STOPS[i], dy = Y(s.h), mx = X(s.shrine.x) + s.shrine.w / 2, ty = i === 0 ? dy - 186 : i === 1 ? dy - 160 : dy - 196, w = titleW(i);
  if (!vis(v, mx - w / 2 - 20, mx + w / 2 + 20, ty - 60, dy)) return;
  const S = pal().steel;
  if (i === 0) chains(c, [mx - w / 2 + 14, mx + w / 2 - 14], dy - 230, ty - 12);
  else for (const px of [mx - w / 2 + 16, mx + w / 2 - 16]) { box(c, px - 3, ty + 10, 6, dy - ty - 10, INK); box(c, px - 2, ty + 10, 4, dy - ty - 10, S[3]); box(c, px - 2, ty + 10, 1, dy - ty - 10, S[5]); box(c, px - 7, dy - 4, 14, 4, S[2]); }
  still(c, `hwc-title-${i}`, mx, ty, -w / 2 - 10, -18, w + 20, 36, g => paintTitle(g, i));
};

// ---------------------------------------------------------------------------------------------------------------
// The shrine

export const drawShrine = (c: Ctx, v: CView, state: GameState, i: number, co: Coaster) => {
  const s = STOPS[i], f = state.frame, dy = Y(s.h), sx = X(s.shrine.x), sw = s.shrine.w, top = dy - s.shrine.h, mx = sx + sw / 2;
  if (!vis(v, sx - 200, sx + sw + 200, dy - 260, dy)) return;
  const eye = v.eye, night = lit();
  const gone = throneState(state, i) === 'exploded', lift = caseLift(co);
  // (the lights on their stands, aimed at it)
  if (!gone) { lightStand(c, v, sx - 64, dy, mx - 8, top - 30, f, night); lightStand(c, v, sx + sw + 64, dy, mx + 8, top - 30, f + 20, night); }
  // (the velvet ropes either side, the plaque in front of the left one)
  still(c, `hwc-rope-${i}`, sx - 110, dy, -10, -46, 116, 48, g => velvetRopePaint(g, 0, 96));
  still(c, `hwc-rope-${i}`, sx + sw + 14, dy, -10, -46, 116, 48, g => velvetRopePaint(g, 0, 96));
  { const [a, b] = PLAQUES[i]; still(c, `hwc-plaque-${i}`, sx - 150, dy, -80, -100, 160, 102, g => paintPlaque(g, a, b)); }
  const M = ramp6(hour(MARBLE[3])), S = pal().steel;
  if (i < 2) {
    // The plinth: its top and its side going back, its front
    topBack(c, eye, sx, sx + sw, top, 1, 0.965, M);
    sideBack(c, eye, sx, -1, top, dy, 1, 0.965, M, 2);
    sideBack(c, eye, sx + sw, 1, top, dy, 1, 0.965, M, 2);
    still(c, `hwc-plinth-${sw}-${s.shrine.h}`, sx, top, -2, -2, sw + 4, s.shrine.h + 3, g => paintPlinth(g, sw, s.shrine.h));
    if (!gone) toilet(c, i, mx - 6, top);
    if (i === 1 && !gone) for (let k = 0; k < 7; k++) { const a = f * 0.13 + k * 0.9; box(c, mx + 8 + Math.cos(a * 1.3) * (18 + k * 3), top - 46 + Math.sin(a) * 14, 2, 2, INK); }
  } else {
    // THE ROCK GOD'S: the base; the case on it (rattling before it vents: index.ts's fumes); the toilet inside, glowing
    const cyc = co.fumeT % FUMES.every, tell = cyc >= FUMES.every - FUMES.vent - FUMES.tell && cyc < FUMES.every - FUMES.vent;
    const jx = tell && !gone ? (f % 4 < 2 ? -1 : 1) : 0, bt = top + 72;
    sideBack(c, eye, sx, -1, bt, dy, 1, 0.965, S, 2);
    sideBack(c, eye, sx + sw, 1, bt, dy, 1, 0.965, S, 2);
    still(c, `hwc-base-${sw}`, sx, bt, -2, -2, sw + 4, dy - bt + 3, g => paintBase(g, sw, dy - bt));
    if (!gone) {
      const B = BIO.map(cc => hour(cc)), ct = top - lift;
      // (the case's back pane and its sides going back: glass, tinted)
      c.fillStyle = 'rgba(20, 40, 12, 0.55)'; c.fillRect(sx + jx + 2, ct + 2, sw - 4, 70);
      topBack(c, eye, sx + jx, sx + sw + jx, ct, 1, 0.965, S, 2);
      // (the glow inside, pulsing in steps)
      const pulse = 0.5 + 0.5 * Math.sin(f * 0.1);
      for (let k = 0; k < 3; k++) { c.fillStyle = `rgba(190, 242, 100, ${(0.12 + 0.1 * pulse) * (1 - k * 0.3)})`; c.beginPath(); c.ellipse(mx + 8 + jx, bt - 26, 30 - k * 8, 26 - k * 7, 0, 0, Math.PI * 2); c.fill(); }
      toilet(c, 2, mx - 6 + jx, bt);
      // (something growing out of it: a stalk, its bulb)
      c.lineCap = 'round';
      const tipX = mx + 18 + jx + Math.sin(f * 0.05) * 6, tipY = bt - 64;
      c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(mx + 10 + jx, bt - 30); c.quadraticCurveTo(mx + 32 + Math.sin(f * 0.05) * 6, bt - 52, tipX, tipY); c.stroke();
      c.strokeStyle = B[2]; c.lineWidth = 3; c.stroke();
      c.strokeStyle = B[4]; c.lineWidth = 1; c.beginPath(); c.moveTo(mx + 9 + jx, bt - 31); c.quadraticCurveTo(mx + 31 + Math.sin(f * 0.05) * 6, bt - 53, tipX - 1, tipY - 1); c.stroke();
      c.lineCap = 'butt';
      ball(c, tipX, tipY, 4, B[3]);
      c.fillStyle = `rgba(190, 242, 100, ${0.45 + 0.25 * Math.sin(f * 0.1)})`; c.beginPath(); c.ellipse(mx + 8 + jx, bt - 26, 15, 4, 0, 0, Math.PI * 2); c.fill();
      // (the front pane: tinted in bands, two streaks of glare; the steel corners; the lid (lit: stand on it))
      for (let k = 0; k < 3; k++) { c.fillStyle = `rgba(132, 204, 22, ${0.1 + k * 0.05})`; c.fillRect(sx + jx, ct + k * 24, sw, 24); }
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(sx + jx + 12, ct + 6, 3, 58); c.fillRect(sx + jx + 20, ct + 6, 2, 38); c.fillRect(sx + jx + sw - 26, ct + 30, 2, 30);
      for (const px of [sx + jx, sx + sw - 7 + jx]) { box(c, px - 1, ct - 1, 9, 74, INK); box(c, px, ct, 7, 72, S[3]); box(c, px, ct, 2, 72, S[5]); box(c, px + 6, ct, 1, 72, S[1]); rivets(c, px + 3, px + 3, ct + 10, 1, S); }
      box(c, sx + jx - 2, ct - 2, sw + 4, 7, INK); box(c, sx + jx - 1, ct - 1, sw + 2, 5, S[2]); hazard(c, sx + jx - 1, ct + 2, sw + 2, 2, 4);
      box(c, sx + jx - 1, ct - 1, sw + 2, 2, pal().lip[2]); box(c, sx + jx - 1, ct - 1, sw + 2, 1, pal().lip[3]);
      box(c, sx - 2, bt - 2, sw + 4, 4, INK); box(c, sx - 1, bt - 1, sw + 2, 2, S[4]);
    } else {
      // (blown: the base's top bare, lit; the lid somewhere)
      box(c, sx - 1, bt - 1, sw + 2, 3, pal().lip[2]);
    }
  }
  drawThroneMess(c, state, i);
};

// ---------------------------------------------------------------------------------------------------------------
// The booth and the lever

export const drawBooth = (c: Ctx, v: CView, state: GameState, co: Coaster) => {
  const f = state.frame, by = Y(BOOTH.h), launched = !!state.stageMemo[LAUNCHED_MEMO], dy = Y(STOPS[2].h);
  if (!vis(v, X(BOOTH.a) - 40, X(BOOTH.b) + 40, by - 200, dy)) return;
  const S = pal().steel, eye = v.eye;
  // (the stilts down to the deck, braced)
  for (const rx of [BOOTH.a + 24, BOOTH.b - 30]) lattice(c, X(rx), by + 12, dy, 16, S, 40, 0, false);
  member(c, X(BOOTH.a + 24), dy - 20, X(BOOTH.a + 120), by + 14, 4, S);
  // The cab: its side and roof going back, its walls (corrugated), the window, the sleeper behind it
  const cx0 = X(BOOTH.cab), cw = X(BOOTH.b) - cx0 - 8, top = by - 130;
  const Wl = ramp6(hour('#A8A29E')), Rf = ramp6(hour('#7F1D1D'));
  sideBack(c, eye, cx0, -1, top, by, 1, 0.95, Wl, 2);
  sideBack(c, eye, cx0 + cw, 1, top, by, 1, 0.95, Wl, 2);
  topBack(c, eye, cx0 - 8, cx0 + cw + 8, top - 10, 1, 0.95, Rf, 2);
  box(c, cx0 - 1, top - 1, cw + 2, 131, INK);
  box(c, cx0, top, cw, 130, Wl[3]);
  for (let x = cx0 + 3; x < cx0 + cw; x += 6) { box(c, x, top, 2, 130, Wl[2]); box(c, x + 2, top, 1, 130, Wl[4]); }
  box(c, cx0, top, 3, 130, Wl[5]); box(c, cx0 + cw - 4, top, 4, 130, Wl[1]);
  checker(c, cx0, by - 14, cw, 4, Wl[1], 0, 2); box(c, cx0, by - 10, cw, 10, Wl[1]);
  // (the roof: an overhang, a gutter, lit along the top edge)
  box(c, cx0 - 10, top - 12, cw + 20, 14, INK); box(c, cx0 - 9, top - 11, cw + 18, 12, Rf[3]); box(c, cx0 - 9, top - 11, cw + 18, 2, Rf[4]); box(c, cx0 - 9, top - 3, cw + 18, 3, Rf[1]);
  // (the sign on its front: screwed on)
  still(c, 'hwc-ridecontrol', cx0 + cw / 2, top - 20, -60, -12, 120, 24, g => board(g, 0, 0, ['RIDE CONTROL'], plain(1, 1, '#FDE68A'), '#7F1D1D', BRASS, 5));
  // (the window: the inside (dim), the sleeper slumped at his desk, the panel, the glass over it all)
  const wx = cx0 + 14, ww = cw - 28, wy = by - 112, wh = 62;
  box(c, wx - 3, wy - 3, ww + 6, wh + 6, INK); box(c, wx - 2, wy - 2, ww + 4, wh + 4, S[3]); box(c, wx - 2, wy - 2, ww + 4, 1, S[5]);
  box(c, wx, wy, ww, wh, lit() ? '#4A3A20' : '#1E2430');
  box(c, wx, wy, ww, 10, lit() ? '#5A4828' : '#2A3240');
  if (!launched) {
    // (kept inside the window: his legs are under the desk, behind the wall)
    c.save(); c.beginPath(); c.rect(wx, wy, ww, wh); c.clip(); c.translate(cx0 + 70, by - 40); c.scale(0.9, 0.9);
    drawPerson(c, { seed: 4407, outfit: 'operator', f: 0, pose: 'sit', mood: 'bored', talking: !!co.sleeper });
    c.restore();
  } else {
    // (BACK IN 5, taped to the inside of the glass)
    box(c, cx0 + 50, by - 98, 70, 26, INK); box(c, cx0 + 51, by - 97, 68, 24, '#FEF3C7'); words(c, 'BACK IN 5', cx0 + 85, by - 81, plain(1, 1, '#18181B'));
  }
  // (the desk, the panel's lamps (live), a mug and a donut box)
  box(c, wx, by - 56, ww, 16, INK); box(c, wx + 1, by - 55, ww - 2, 14, '#2E2A30'); box(c, wx + 1, by - 55, ww - 2, 2, '#4A4450');
  for (let k = 0; k < 6; k++) { const on = (k + Math.floor(f / 20)) % 3 ? '#4ADE80' : '#EF4444'; box(c, wx + 10 + k * 20, by - 51, 6, 6, INK); box(c, wx + 11 + k * 20, by - 50, 4, 4, on); box(c, wx + 11 + k * 20, by - 50, 1, 1, '#FFFFFF'); }
  box(c, wx + ww - 26, by - 66, 8, 10, INK); box(c, wx + ww - 25, by - 65, 6, 8, '#F8FAFC'); box(c, wx + ww - 19, by - 63, 2, 4, '#F8FAFC');
  box(c, wx + 4, by - 62, 22, 6, INK); box(c, wx + 5, by - 61, 20, 4, '#F472B6');
  // (the glass: banded with the sky by day, two streaks of glare)
  const Gl = glassOf();
  c.globalAlpha = lit() ? 0.12 : 0.28;
  for (let k = 0; k < 4; k++) { c.fillStyle = Gl[2 + Math.min(3, k)]; c.fillRect(wx, wy + k * (wh / 4), ww, wh / 4); }
  c.globalAlpha = 1;
  c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.moveTo(wx + 20, wy + wh); c.lineTo(wx + 44, wy); c.lineTo(wx + 52, wy); c.lineTo(wx + 28, wy + wh); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(wx + 60, wy + wh); c.lineTo(wx + 78, wy); c.lineTo(wx + 82, wy); c.lineTo(wx + 64, wy + wh); c.closePath(); c.fill();
  if (!launched) for (let k = 0; k < 3; k++) { const t = ((f + k * 30) % 90) / 90; words(c, 'Z', cx0 + 86 + t * 20 + k * 4, by - 90 - t * 50, plain(1 + (k % 2), 1 + (k % 2), `rgba(255,255,255,${1 - t})`)); }
  // The balcony (one-way, up on the stilts: stand on it): its grating, its lip
  { const [ax, ay] = at(eye, X(BOOTH.a), by, 0.972), [bx] = at(eye, X(BOOTH.b), by, 0.972); if (eye.y < by) poly(c, [[X(BOOTH.a), by], [X(BOOTH.b), by], [bx, ay], [ax, ay]], S[1]); }
  still(c, `hwc-balcony`, X(BOOTH.a), by, -3, -3, BOOTH.b - BOOTH.a + 6, 18, g => {
    const w = BOOTH.b - BOOTH.a; box(g, -2, -1, w + 4, 14, INK); box(g, -1, 0, w + 2, 12, S[2]);
    for (let k = 2; k < w - 2; k += 5) box(g, k, 4, 3, 5, S[0]);
    box(g, -1, 10, w + 2, 2, S[1]); hazard(g, -1, 8, w + 2, 2, 4);
    const L = pal().lip; box(g, -1, -1, w + 2, 3, L[2]); box(g, -1, -1, w + 2, 1, L[3]);
  });
  // The lever: the plate up on its post (RIDE MODE, NORMAL to the left, EXPERIMENTAL to the right, the one it's on
  // lit), its lockout lamp (red while the stop's staff are alive), the base, the handle at its throw
  const lv = BOOTH_LEVER, lx = lv.x, flipped = !!state.stageMemo[LEVER_MEMO];
  const ang = throwAngle(lv, co.pull, flipped), exp = ang > 0;
  const L1 = plain(1, 1, '#18181B'), Ln = plain(1, 1, !exp ? '#15803D' : '#A8A29E'), Le = plain(1, 1, exp ? '#DC2626' : '#A8A29E');
  const pw = Math.max(signW('RIDE MODE', L1), signW('< NORMAL', Ln), signW('EXPERIMENTAL >', Le)) + 20, ptop = by - 152;
  box(c, lx - 3, ptop + 50, 6, by - ptop - 50, INK); box(c, lx - 2, ptop + 50, 4, by - ptop - 50, S[3]); box(c, lx - 2, ptop + 50, 1, by - ptop - 50, S[5]);
  box(c, lx - pw / 2 - 3, ptop - 3, pw + 6, 58, INK); box(c, lx - pw / 2 - 2, ptop - 2, pw + 4, 56, S[3]); box(c, lx - pw / 2 - 2, ptop - 2, pw + 4, 1, S[5]);
  const Pl = ramp6(hour('#E7E5E4'));
  box(c, lx - pw / 2, ptop, pw, 52, Pl[3]); box(c, lx - pw / 2, ptop, pw, 2, Pl[5]); box(c, lx - pw / 2, ptop + 49, pw, 3, Pl[2]);
  box(c, lx - pw / 2 + 4, ptop + 17, pw - 8, 1, Pl[1]);
  words(c, 'RIDE MODE', lx, ptop + 13, L1);
  words(c, '< NORMAL', lx - pw / 2 + 8, ptop + 30, Ln, 'left');
  words(c, 'EXPERIMENTAL >', lx + pw / 2 - 8, ptop + 45, Le, 'right');
  for (const [sx2, sy] of [[lx - pw / 2 + 2, ptop + 2], [lx + pw / 2 - 4, ptop + 2], [lx - pw / 2 + 2, ptop + 47], [lx + pw / 2 - 4, ptop + 47]]) box(c, sx2, sy, 2, 2, S[1]);
  const locked = !state.stageMemo[CLEARED_MEMO(2)];
  box(c, lx + pw / 2 - 14, ptop + 3, 10, 10, INK); box(c, lx + pw / 2 - 13, ptop + 4, 8, 8, locked ? (f % 40 < 20 ? '#EF4444' : '#7F1D1D') : '#4ADE80'); box(c, lx + pw / 2 - 12, ptop + 5, 2, 2, '#FFFFFF');
  // (the base: a stepped steel housing, its slot)
  box(c, lx - 18, by - 16, 36, 16, INK); box(c, lx - 17, by - 15, 34, 15, S[2]); box(c, lx - 17, by - 15, 34, 2, S[4]); box(c, lx - 17, by - 15, 2, 15, S[3]); box(c, lx + 13, by - 15, 4, 15, S[1]);
  box(c, lx - 10, by - 13, 20, 3, INK);
  hazard(c, lx - 17, by - 6, 34, 4, 4);
  c.save(); c.translate(lx, lv.y); c.rotate(ang);
  box(c, -4, -lv.len + 2, 8, lv.len - 2, INK); box(c, -3, -lv.len + 3, 6, lv.len - 4, S[3]); box(c, -3, -lv.len + 3, 2, lv.len - 4, S[5]); box(c, 2, -lv.len + 3, 1, lv.len - 4, S[1]);
  c.restore();
  const kx = lx + Math.sin(ang) * lv.len, ky = lv.y - Math.cos(ang) * lv.len;
  ball(c, kx, ky, 7, '#DC2626');
  void GY; void WALL_D; void beam; void STEEL; void PORCELAIN; void stillAt; void poly;
};
