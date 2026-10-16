// The secret warehouse, drawn (the final pass: peak SNES, fake 3D, one eye for the scene: paint.ts). The backdrop
// (far.ts): the boulevard's sky and far off by the hour, base camp parked on the lot behind. In the world, back to front:
// the back wall (corrugated siding, its girts, the clerestory's dusty glass, the EXIT over its man door, the catwalk),
// standing, going over, then lying flat on the lot with the public stood on it in two rows (phones up; the crew laying
// into them once it's KILL THEM ALL); the frame still up on its columns (red oxide I-beams, riveted), the roof's
// underside and its edge (the girder, the deck), the hole the train came down through; the end wall, swinging out; the
// stage floor going back (black-painted deck, its joints running at the eye, spike tape), the pits cut through it (their
// walls dressed in green going down into the dark); the sets standing at the back of it (sets.ts); the floor coming
// toward us under the play plane, bent; then at the play plane the set pieces he stands on (lit along their lips: crash
// mats, rostrums, the rooftop set, the craft table, the cab, the pipe scaffold, the flats hung on chains), the wreck of
// the throne-train on the producer, Steve's fliers, and the main stage (its roll-up door, the bulldozer parked at the
// back, THE SCRIPT in its glass case on its plinth under its light, the ropes and the laser grid, the far wall).

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { realDisastersOn } from '../section';
import { drawPerson } from '../../adventure/temple/people';
import { bendFloor } from '../../intro/art/kit';
import {
  box, checker, mix, hash, poly, at, atDepth, still, stamp, bandedGradient, pixelBlob, lit, ramp6, board, plain, deco, bulbs, words,
  sideBack, topBack, timeOfDay, STEVE, BRASS, VELVET, type Look,
} from '../blvd/kit';
import { steveCard, paintStandee, velvetRopePaint } from '../blvd/props';
import { drawTrain, type CarAt } from '../coaster/art';
import { beam, MARBLE, CRIMSON } from '../coaster/paint';
import {
  X, Y, GY, x0, x1, BACK_Y, ROOF_Y, PIT_A, PIT_B, SOLIDS, LEDGES, STEVES, ARENA, ARENA_CAM, CASE_X, DOZER_X, FAR_WALL, LIGHTS,
  GROUND, type SolidWhat, type LedgeWhat,
} from './layout';
import { whOf } from './state';
import { WRECK_X, ROOF_HOLE, PROD_X, wallsDown, roofHoled, drawProducer } from './burst';
import { dozerX, caseDown, caseTip, wallOpen, endingOn, drawDozer } from './ending';
import { drawWarehouseFar } from './far';
import { drawSets } from './sets';
import {
  type Ctx, type View, INK, WALL_D, PROP_D, dUp, zOf, dOfZ, wview, floorQ, seenAt, pal, pipe, riser, truss, spike, sandbag, TAPE, back,
} from './paint';

export const drawWarehouseBackdrop = (c: Ctx, state: GameState) => {
  drawWarehouseFar(c, state);
  if (realDisastersOn(state)) { c.fillStyle = 'rgba(127, 29, 29, 0.25)'; c.fillRect(0, 0, 800, 600); }
  return true;
};

/** The building's height (the floor to the roof's underside), its back wall's distance back (z). */
const WALL_H = GY - ROOF_Y;
const ZW = zOf(WALL_D);
/** The world x span on screen at depth d. */
const spanAt = (v: View, d: number, pad = 60): [number, number] => [v.eye.x + (v.cam.x - pad - v.eye.x) / d, v.eye.x + (v.cam.x + CANVAS_WIDTH + pad - v.eye.x) / d];

// ---------------------------------------------------------------------------------------------------------------
// The back wall: standing, going over (away from us, about its foot), lying flat on the lot

/** A point on the back wall, `h` up it (x along it), when it's gone over by angle a. */
const wallPt = (v: View, x: number, h: number, a: number): [number, number] => at(v.eye, x, GY - h * Math.cos(a), dOfZ(ZW + h * Math.sin(a)));
/** A band of the wall from h0 to h1, x a..b. */
const wallBand = (c: Ctx, v: View, a: number, b: number, h0: number, h1: number, ang: number, col: string) =>
  poly(c, [wallPt(v, a, h0, ang), wallPt(v, b, h0, ang), wallPt(v, b, h1, ang), wallPt(v, a, h1, ang)], col);

const backWall = (c: Ctx, v: View, ang: number, f: number) => {
  const Sd = pal().siding, O = pal().oxide, dFar = dOfZ(ZW + WALL_H * Math.sin(ang));
  const [a, b] = spanAt(v, Math.min(WALL_D, dFar), 80);
  // (the siding, in bands up it: grimy at the foot, lit across the middle by the work lights, dark up under the roof)
  const bands: [number, number, string][] = [[0, 16, Sd[1]], [16, 60, Sd[2]], [60, 200, Sd[3]], [200, 380, Sd[4]], [380, 470, Sd[3]], [470, 560, Sd[2]], [560, WALL_H, Sd[1]]];
  for (const [h0, h1, col] of bands) wallBand(c, v, a, b, h0, h1, ang, col);
  // (the ribs: a lit edge and a shaded one every 14)
  c.lineWidth = 1;
  for (const [off, col] of [[0, Sd[5]], [4, Sd[1]]] as const) {
    c.strokeStyle = col; c.beginPath();
    for (let x = Math.floor(a / 14) * 14 + off; x < b; x += 14) { const [p, q] = wallPt(v, x, 18, ang), [r, s] = wallPt(v, x, WALL_H, ang); c.moveTo(p, q); c.lineTo(r, s); }
    c.stroke();
  }
  // (the girts across it: red oxide, lit along the top)
  for (const h of [150, 310, 470]) { wallBand(c, v, a, b, h - 5, h + 5, ang, O[2]); wallBand(c, v, a, b, h + 3, h + 5, ang, O[4]); }
  // (the clerestory: a strip of dusty glass up high, its mullions)
  wallBand(c, v, a, b, 500, 548, ang, INK);
  wallBand(c, v, a, b, 502, 546, ang, mix(Sd[4], '#9AB0C8', 0.35));
  wallBand(c, v, a, b, 530, 546, ang, mix(Sd[5], '#C8D8E8', 0.3));
  c.strokeStyle = INK; c.beginPath();
  for (let x = Math.floor(a / 60) * 60; x < b; x += 60) { const [p, q] = wallPt(v, x, 500, ang), [r, s] = wallPt(v, x, 548, ang); c.moveTo(p, q); c.lineTo(r, s); }
  c.stroke();
  // (the catwalk along it at 380: grating, its rail; dim, no lip: it's not his)
  wallBand(c, v, a, b, 372, 380, ang, INK); wallBand(c, v, a, b, 410, 412, ang, Sd[0]);
  c.strokeStyle = Sd[0]; c.beginPath();
  for (let x = Math.floor(a / 40) * 40; x < b; x += 40) { const [p, q] = wallPt(v, x, 380, ang), [r, s] = wallPt(v, x, 412, ang); c.moveTo(p, q); c.lineTo(r, s); }
  c.stroke();
  // (now and then a man door, its EXIT over it (lit), a fire extinguisher, a breaker panel)
  for (let x = Math.floor(a / 700) * 700 + 260; x < b; x += 700) {
    poly(c, [wallPt(v, x - 2, 0, ang), wallPt(v, x + 46, 0, ang), wallPt(v, x + 46, 100, ang), wallPt(v, x - 2, 100, ang)], INK);
    poly(c, [wallPt(v, x, 0, ang), wallPt(v, x + 44, 0, ang), wallPt(v, x + 44, 98, ang), wallPt(v, x, 98, ang)], Sd[2]);
    poly(c, [wallPt(v, x + 4, 112, ang), wallPt(v, x + 40, 112, ang), wallPt(v, x + 40, 128, ang), wallPt(v, x + 4, 128, ang)], INK);
    poly(c, [wallPt(v, x + 6, 114, ang), wallPt(v, x + 38, 114, ang), wallPt(v, x + 38, 126, ang), wallPt(v, x + 6, 126, ang)], ang < 0.2 && f % 120 < 116 ? '#EF4444' : '#7F1D1D');
    poly(c, [wallPt(v, x + 70, 30, ang), wallPt(v, x + 80, 30, ang), wallPt(v, x + 80, 56, ang), wallPt(v, x + 70, 56, ang)], '#B91C1C');
    poly(c, [wallPt(v, x + 110, 60, ang), wallPt(v, x + 150, 60, ang), wallPt(v, x + 150, 120, ang), wallPt(v, x + 110, 120, ang)], Sd[5]);
    poly(c, [wallPt(v, x + 112, 62, ang), wallPt(v, x + 148, 62, ang), wallPt(v, x + 148, 66, ang), wallPt(v, x + 112, 66, ang)], Sd[6]);
  }
  // (its top edge, and once it's down its torn foot along the floor)
  wallBand(c, v, a, b, WALL_H - 4, WALL_H, ang, Sd[0]);
};

/** The end wall (the section's left end), standing, then going over outward (to the left) about its foot. */
const endWall = (c: Ctx, v: View, fall: number) => {
  const ang = fall * Math.PI / 2, xw = x0 - 2, Sd = pal().siding;
  if (v.eye.x <= xw) return;
  const P = (h: number, d: number): [number, number] => at(v.eye, xw - h * Math.sin(ang), GY - h * Math.cos(ang), d);
  const bands: [number, number, string][] = [[0, 60, Sd[2]], [60, 300, Sd[3]], [300, 500, Sd[2]], [500, WALL_H, Sd[1]]];
  for (const [h0, h1, col] of bands) poly(c, [P(h0, 1), P(h0, WALL_D), P(h1, WALL_D), P(h1, 1)], col);
  c.strokeStyle = Sd[1]; c.lineWidth = 1; c.beginPath();
  for (let k = 0; k <= 8; k++) { const d = 1 - ((1 - WALL_D) * k) / 8, [p, q] = P(0, d), [r, s] = P(WALL_H, d); c.moveTo(p, q); c.lineTo(r, s); }
  c.stroke();
  for (const h of [150, 310, 470]) poly(c, [P(h - 4, 1), P(h - 4, WALL_D), P(h + 4, WALL_D), P(h + 4, 1)], pal().oxide[2]);
  // (its near edge: the siding's cut end, inked)
  const [p, q] = P(0, 1), [r, s] = P(WALL_H, 1);
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(p, q); c.lineTo(r, s); c.stroke();
  c.strokeStyle = Sd[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(p + 1, q); c.lineTo(r + 1, s); c.stroke();
};

// ---------------------------------------------------------------------------------------------------------------
// Outside: the public on the fallen wall

/** The rows they stand in (depth back from the wall's foot). */
const ROWS = [{ z: 120, step: 58, salt: 0 }, { z: 300, step: 74, salt: 5 }] as const;
const crowdOne = (c: Ctx, seed: number, f: number, pose: 'photo' | 'cheer' | 'stand', mood: 'shocked' | 'happy', face: 1 | -1) => {
  // (stamped: a pose and a frame of it; cheering's arms go up and down in four)
  const ph = pose === 'cheer' ? (f >> 3) % 4 : 0;
  c.save(); c.scale(face * 0.92, 0.92);
  stamp(c, `hww-pub-${seed}-${pose}-${mood}-${ph}`, -34, -100, 72, 104, g => {
    drawPerson(g, { seed, outfit: 'guest', f: ph * 8, pose, mood, shorts: seed % 4 === 0 });
    if (pose === 'photo') { box(g, 13, -71, 10, 14, INK); box(g, 14, -70, 8, 12, '#1C1C22'); box(g, 15, -69, 6, 9, '#60A5FA'); box(g, 15, -69, 6, 2, '#BFDBFE'); }
  });
  c.restore();
};
const crowd = (c: Ctx, v: View, f: number, brawl: boolean) => {
  // (the back row first)
  for (let r = ROWS.length - 1; r >= 0; r--) {
    const R = ROWS[r], d = dOfZ(ZW + R.z), [a, b] = spanAt(v, d, 80);
    atDepth(c, v.eye, d, () => {
      for (let x = Math.floor(a / R.step) * R.step; x < b; x += R.step) {
        const n = Math.abs(Math.round(x / R.step)), seed = n * 37 + 11 + R.salt * 101, face: 1 | -1 = seed % 2 ? 1 : -1, px = x + (seed % 23);
        if (brawl && r === 0 && n % 3 === 1) {
          // (one of the crew in their blacks laying into a guest, the guest reeling)
          const hit = (f + seed) % 40 < 8;
          c.save(); c.translate(px - 6, GY); c.scale(0.92, 0.92);
          stamp(c, `hww-brawler-${seed}-${hit ? 1 : 0}`, -34, -100, 76, 104, g => drawPerson(g, { seed: seed + 5, outfit: 'stage', f: 0, pose: hit ? 'thrust' : 'stand', mood: 'angry' }));
          c.restore();
          c.save(); c.translate(px + 24 + (hit ? 5 : 0), GY); c.rotate(hit ? 0.25 : 0.08); c.scale(-0.92, 0.92);
          drawPerson(c, { seed, outfit: 'guest', f, pose: 'cheer', mood: 'scared' });
          c.restore();
          continue;
        }
        c.save(); c.translate(px, GY);
        crowdOne(c, seed, f, seed % 3 === 0 ? 'cheer' : 'photo', seed % 4 ? 'shocked' : 'happy', face);
        c.restore();
      }
    });
  }
};
/** The burst-in's KILL THEM ALL: the crew off the sets, running back over the floor and out at the public. */
const runners = (c: Ctx, v: View, state: GameState) => {
  const b = whOf(state).burst, f = state.frame;
  for (const r of b.runners) {
    const t = r.t - r.at;
    if (t < 0 || t > 70) continue;
    const k = t / 70, d = dOfZ(ZW * (0.7 + k * 0.3) + k * ROWS[0].z);
    atDepth(c, v.eye, d, () => {
      c.save(); c.translate(r.x + Math.sin(r.seed) * 20, GY); c.scale(0.92, 0.92);
      drawPerson(c, { seed: r.seed, outfit: 'stage', f, pose: 'walk', mood: 'angry' });
      c.restore();
    });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The frame and the roof

/** The roof's steel (on screen only when he's up high, or the burst-in looks up at it). */
const roof = (c: Ctx, v: View, state: GameState) => {
  const O = pal().oxide, S = pal().siding, eye = v.eye;
  const [a, b] = spanAt(v, WALL_D, 40);
  if (eye.y <= ROOF_Y) return;
  const holed = roofHoled(state), ha = X(ROOF_HOLE.a), hb = X(ROOF_HOLE.b);
  const showHole = holed && hb > a && ha < b;
  c.save();
  if (showHole) {
    // (the hole: through the roof's edge, and back across its underside a way)
    c.beginPath(); c.rect(a, ROOF_Y - 220, b - a, 420);
    c.moveTo(ha, ROOF_Y - 220);
    for (let x = ha + 10, k = 0; x < hb; x += 28, k++) c.lineTo(x, ROOF_Y - 70 + (k % 2 ? 10 : -6));
    c.lineTo(hb, ROOF_Y - 220); c.lineTo(hb + 6, ROOF_Y - 40); c.lineTo(hb - 8, ROOF_Y + 2);
    const [p1, q1] = at(eye, hb - 40, ROOF_Y, 0.92), [p2, q2] = at(eye, (ha + hb) / 2, ROOF_Y, 0.89), [p3, q3] = at(eye, ha + 30, ROOF_Y, 0.93);
    c.lineTo(p1, q1); c.lineTo(p2, q2); c.lineTo(p3, q3); c.lineTo(ha + 6, ROOF_Y + 4); c.lineTo(ha - 4, ROOF_Y - 50); c.closePath();
    c.clip('evenodd');
  }
  // (the underside going back: dark, the purlins across it, its insulation's foil showing between)
  const n = 4;
  for (let i = 0; i < n; i++) { const d0 = 1 - ((1 - WALL_D) * i) / n, d1 = 1 - ((1 - WALL_D) * (i + 1)) / n; poly(c, [at(eye, a, ROOF_Y, d0), at(eye, b, ROOF_Y, d0), at(eye, b, ROOF_Y, d1), at(eye, a, ROOF_Y, d1)], [S[2], S[1], S[1], S[0]][i]); }
  for (let k = 1; k < 8; k++) { const d = 1 - ((1 - WALL_D) * k) / 8, [p, q] = at(eye, a, ROOF_Y, d), [r] = at(eye, b, ROOF_Y, d); box(c, p, q, r - p, 2, O[1]); box(c, p, q, r - p, 1, O[3]); }
  // (the edge: the roof deck's corrugated end, the girder under it (a truss of red oxide angle))
  box(c, a, ROOF_Y - 80, b - a, 6, INK); box(c, a, ROOF_Y - 79, b - a, 2, S[4]);
  box(c, a, ROOF_Y - 74, b - a, 14, INK);
  for (let x = Math.floor(a / 12) * 12; x < b; x += 12) { box(c, x, ROOF_Y - 72, 6, 5, S[4]); box(c, x + 6, ROOF_Y - 68, 6, 5, S[3]); }
  box(c, a, ROOF_Y - 62, b - a, 4, '#C8B060'); checker(c, a, ROOF_Y - 62, b - a, 4, '#E8D488', 0, 2);
  truss(c, a, b, ROOF_Y - 56, 48, O, 24);
  c.restore();
  // (round the hole: the girder torn and bent down into it, insulation hanging, a cable or two)
  if (showHole) {
    c.lineCap = 'round';
    for (const [w, col] of [[6, INK], [4, O[3]], [1, O[5]]] as const) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(ha + 4, ROOF_Y - 10); c.lineTo(ha + 26, ROOF_Y + 34); c.moveTo(hb - 6, ROOF_Y - 12); c.lineTo(hb - 30, ROOF_Y + 44); c.stroke(); }
    c.lineCap = 'butt';
    for (let k = 0; k < 6; k++) { const ix = ha + 40 + k * ((hb - ha - 80) / 5); pixelBlob(c, ix, ROOF_Y + 4 + (k % 2) * 6, 7, 5, '#E8C060'); box(c, ix - 2, ROOF_Y + 6, 2, 10 + (k % 3) * 6, '#C8A040'); }
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath();
    c.moveTo(ha + 90, ROOF_Y); c.quadraticCurveTo(ha + 96, ROOF_Y + 50, ha + 86, ROOF_Y + 84); c.moveTo(hb - 70, ROOF_Y); c.lineTo(hb - 64, ROOF_Y + 60);
    c.stroke();
    box(c, ha + 84, ROOF_Y + 82, 6, 6, '#18181B'); box(c, hb - 66, ROOF_Y + 58, 4, 4, '#F59E0B');
  }
};
/** The columns at the back wall's line (red oxide I-beams, riveted, their knee braces up to the roof; base plates). */
const columns = (c: Ctx, v: View) => {
  const O = pal().oxide, [a, b] = spanAt(v, WALL_D, 60);
  atDepth(c, v.eye, WALL_D, () => {
    for (let x = Math.floor(a / 900) * 900 + 450; x < b + 40; x += 900) {
      box(c, x - 13, ROOF_Y, 26, WALL_H, INK);
      box(c, x - 12, ROOF_Y, 24, WALL_H, O[2]); box(c, x - 12, ROOF_Y, 5, WALL_H, O[4]); box(c, x - 7, ROOF_Y, 2, WALL_H, O[5]); box(c, x + 7, ROOF_Y, 5, WALL_H, O[1]);
      box(c, x - 3, ROOF_Y, 6, WALL_H, O[3]);
      for (let y = ROOF_Y + 20; y < GY - 10; y += 40) { box(c, x - 10, y, 2, 2, O[0]); box(c, x + 8, y, 2, 2, O[0]); box(c, x - 10, y, 1, 1, O[5]); }
      for (const s of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.moveTo(x, ROOF_Y + 90); c.lineTo(x + s * 90, ROOF_Y + 4); c.stroke(); c.strokeStyle = O[3]; c.lineWidth = 4; c.stroke(); }
      box(c, x - 22, GY - 10, 44, 10, INK); box(c, x - 21, GY - 9, 42, 9, pal().concrete[3]); box(c, x - 21, GY - 9, 42, 2, pal().concrete[5]);
      for (const bx of [x - 17, x + 14]) { box(c, bx, GY - 12, 3, 3, O[1]); box(c, bx, GY - 12, 1, 1, O[5]); }
    }
  });
};
/** The lighting grid hung under the roof (pipe battens going along, par cans and fresnels on them, their cables). */
const grid = (c: Ctx, v: View) => {
  if (v.eye.y < ROOF_Y + 60) return;
  for (const d of [WALL_D + 0.06, 0.93]) {
    const [a, b] = spanAt(v, d, 60), y = ROOF_Y + 70, S = pal().steel.map(cc => back(cc, d));
    atDepth(c, v.eye, d, () => {
      pipe(c, a, b, y, 4, S);
      for (let x = Math.floor(a / 300) * 300; x < b; x += 300) box(c, x, ROOF_Y, 2, 70, S[1]);
      for (let x = Math.floor(a / 110) * 110 + 30; x < b; x += 110) {
        const k = hash(x * 0.17 + d);
        box(c, x - 1, y + 4, 3, 6, S[2]);
        box(c, x - 7, y + 10, 14, 18, INK); box(c, x - 6, y + 11, 12, 16, k > 0.5 ? '#1A1A20' : '#2A2A32'); box(c, x - 6, y + 11, 3, 16, '#3E3E48');
        box(c, x - 7, y + 27, 14, 3, INK); box(c, x - 6, y + 27, 12, 2, k > 0.7 ? '#FFF6C8' : '#B8B090');
        c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 6, y + 14); c.quadraticCurveTo(x + 30, y + 40, x + 54, y + 6); c.stroke();
      }
    });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The floor

/** The pits' depth (world) and the floor runs between them. */
const PITS = [PIT_A, PIT_B].map(p => ({ a: X(p.a), b: X(p.b) }));
const FLOOR: [number, number][] = GROUND.map(([a, b]) => [X(a), X(b)]);

/** A pit going back across the floor: its back wall (dressed in green, going down into the dark), its side walls. */
const pitIn = (c: Ctx, v: View, a: number, b: number) => {
  const eye = v.eye, C = pal().chroma, deep = 520;
  // (the dark: all of it, from the floor's back edge down past the bottom of the screen)
  poly(c, [at(eye, a, GY, WALL_D), at(eye, b, GY, WALL_D), at(eye, b, GY + deep, WALL_D), at(eye, a, GY + deep, WALL_D)], '#03120A');
  // (the back wall: muslin down it, banded darker going down, tape crosses)
  const steps = [[0, 40, C[2]], [40, 110, C[1]], [110, 220, C[0]], [220, deep, '#020A05']] as const;
  for (const [h0, h1, col] of steps) poly(c, [at(eye, a, GY + h0, WALL_D), at(eye, b, GY + h0, WALL_D), at(eye, b, GY + h1, WALL_D), at(eye, a, GY + h1, WALL_D)], col);
  for (let x = a + 40; x < b - 30; x += 80) { const [p, q] = at(eye, x, GY + 60, WALL_D); box(c, p - 4, q, 9, 1, TAPE.pink); box(c, p, q - 4, 1, 9, TAPE.pink); }
  // (its side walls, the near one's lit lip of floor at the top)
  for (const [e, side] of [[a, 1], [b, -1]] as const) {
    if ((eye.x - e) * side <= 0) continue;
    for (const [h0, h1, col] of steps) poly(c, [at(eye, e, GY + h0, 1.25), at(eye, e, GY + h0, WALL_D), at(eye, e, GY + h1, WALL_D), at(eye, e, GY + h1, 1.25)], mix(col, '#000000', 0.25));
    c.strokeStyle = C[4]; c.lineWidth = 1; c.beginPath(); const [p, q] = at(eye, e, GY, 1.25), [r, s] = at(eye, e, GY, WALL_D); c.moveTo(p, q); c.lineTo(r, s); c.stroke();
  }
  // (the stage's steel under the deck along its back edge: a joist end)
  const [p, q] = at(eye, a, GY, WALL_D), [r] = at(eye, b, GY, WALL_D);
  box(c, p, q, r - p, 3, pal().oxide[2]); box(c, p, q, r - p, 1, pal().oxide[4]);
};
/** The stage floor from the play plane back to the wall, a run of it (a..b): the deck in bands (lit nearest), its
 *  sheets' joints running back at the eye, the cross joints, the scuffs and the spike tape. */
const floorRun = (c: Ctx, v: View, a: number, b: number) => {
  const eye = v.eye, D = pal().deck, bands = [D[4], D[3], D[3], D[2], D[2], D[1]];
  for (let i = 0; i < bands.length; i++) { const d0 = 1 - ((1 - WALL_D) * i) / bands.length, d1 = 1 - ((1 - WALL_D) * (i + 1)) / bands.length; floorQ(c, eye, a, b, d0, d1, bands[i]); }
  // (the sheets: joints back at the eye every 96; across every so far going back)
  c.strokeStyle = D[0]; c.lineWidth = 1; c.beginPath();
  for (let x = Math.ceil(a / 96) * 96; x < b; x += 96) { const [p, q] = at(eye, x, GY, 1), [r, s] = at(eye, x, GY, WALL_D); c.moveTo(p, q); c.lineTo(r, s); }
  c.stroke();
  for (let k = 1; k < 5; k++) { const d = 1 - ((1 - WALL_D) * k) / 5, [p, q] = at(eye, a, GY, d), [r] = at(eye, b, GY, d); box(c, p, q, r - p, 1, D[1]); }
  // (scuffs, and spike marks from the last setups)
  for (let x = Math.ceil(a / 37) * 37; x < b; x += 37) {
    const h = hash(x * 0.071), d = WALL_D + 0.02 + h * (1 - WALL_D - 0.04), [sx, sy] = at(eye, x, GY, d);
    if (h > 0.82) spike(c, sx, sy, [TAPE.pink, TAPE.yellow, TAPE.blue, TAPE.white][Math.floor(hash(x) * 4)], (Math.floor(h * 30) % 3) as 0 | 1 | 2, d);
    else if (h < 0.4) box(c, sx, sy, 3 + Math.floor(h * 8), 1, D[5]);
  }
  // (the wall's foot: the slab's edge along the back)
  const [p, q] = at(eye, a, GY, WALL_D), [r] = at(eye, b, GY, WALL_D);
  box(c, p, q - 2, r - p, 3, pal().concrete[2]); box(c, p, q - 2, r - p, 1, pal().concrete[4]);
};
/** The floor coming toward us under the play plane (painted flat, a chunk at a time, then bent to the eye). */
const BAND = 260, CHUNK = 512;
const paintFloorFront = (g: Ctx, x: number, w: number) => {
  const D = pal().deck;
  bandedGradient(g, x, GY, w, BAND, [D[4], D[3], D[3], D[2]], 6);
  // (the play plane's lip: the deck's edge, lit by the work lights)
  box(g, x, GY, w, 2, D[5]); box(g, x, GY + 2, w, 1, D[3]);
  for (let k = Math.ceil(x / 96) * 96; k < x + w; k += 96) box(g, k, GY + 3, 1, BAND, D[1]);
  for (let y = GY + 44; y < GY + BAND; y += 48) box(g, x, y, w, 1, D[1]);
  for (let k = Math.ceil(x / 29) * 29; k < x + w; k += 29) {
    const h = hash(k * 0.19);
    if (h > 0.86) spike(g, k, GY + 10 + Math.floor(hash(k) * 160), [TAPE.pink, TAPE.yellow, TAPE.glow, TAPE.white][Math.floor(h * 40) % 4], (Math.floor(h * 31) % 3) as 0 | 1 | 2, 1.4);
    else if (h < 0.35) box(g, k, GY + 8 + Math.floor(hash(k * 3) * 200), 4 + Math.floor(h * 10), 1, D[5]);
  }
  // (a cable run along it, taped down every so far)
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath();
  for (let k = x; k <= x + w; k += 16) { const y = GY + 120 + Math.sin(k * 0.011) * 16; if (k === x) g.moveTo(k, y); else g.lineTo(k, y); }
  g.stroke();
  g.strokeStyle = '#3A3A44'; g.lineWidth = 1; g.stroke();
  for (let k = Math.ceil(x / 140) * 140; k < x + w; k += 140) box(g, k - 6, GY + 116 + Math.sin(k * 0.011) * 16, 12, 8, '#4A4A52');
};
const paintPitFront = (g: Ctx, a: number, b: number) => {
  const C = pal().chroma;
  box(g, a, GY, b - a, BAND, '#020A05');
  box(g, a, GY, 14, BAND, C[1]); box(g, b - 14, GY, 14, BAND, C[1]);
  box(g, a + 14, GY, 2, BAND, C[0]); box(g, b - 16, GY, 2, BAND, C[0]);
  for (let y = GY + 20; y < GY + BAND; y += 60) { box(g, a + 3, y, 8, 2, TAPE.pink); box(g, b - 11, y, 8, 2, TAPE.pink); }
};
const floorFront = (c: Ctx, v: View) => {
  const tod = timeOfDay().key;
  for (const [a, b] of FLOOR) for (let x = a, i = 0; x < b; x += CHUNK, i++) {
    const w = Math.min(CHUNK, b - x);
    if (x + w < v.v0 || x > v.v1) continue;
    stamp(c, `hww-floor-${tod}-${a}-${i}`, x, GY - 2, w, BAND + 2, g => paintFloorFront(g, x, w));
  }
  for (const p of PITS) if (p.b > v.v0 && p.a < v.v1) stamp(c, `hww-pitfront-${tod}-${p.a}`, p.a, GY - 2, p.b - p.a, BAND + 2, g => paintPitFront(g, p.a, p.b));
  if (v.bot > GY + BAND) box(c, v.v0, GY + BAND - 1, v.v1 - v.v0, v.bot - GY - BAND + 1, pal().deck[2]);
  bendFloor(c, v.eye, GY, GY, GY + BAND, FLOOR[0][0], FLOOR[FLOOR.length - 1][1]);
  // (the pits' lips: the deck's edge, its steel, cut clean; the safety tape)
  for (const p of PITS) {
    if (p.b < v.v0 - 40 || p.a > v.v1 + 40) continue;
    for (const [ex, s] of [[p.a, 1], [p.b, -1]] as const) {
      box(c, Math.min(ex, ex - s * 10), GY - 1, 10, 7, INK); box(c, Math.min(ex, ex - s * 9), GY, 9, 5, pal().oxide[3]); box(c, Math.min(ex, ex - s * 9), GY, 9, 1, pal().oxide[5]);
      for (let k = 0; k < 3; k++) box(c, ex - s * (26 + k * 8) - 2, GY + 1, 4, 2, k % 2 ? INK : TAPE.yellow);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The set pieces he stands on (at the play plane: lit along their lips; their tops and sides going back)

const LIPS = () => pal().lip;
/** A lit lip along the top edge (standable reads standable). */
const lip = (c: Ctx, x: number, y: number, w: number) => {
  const L = LIPS();
  box(c, x - 1, y - 1, w + 2, 5, INK);
  box(c, x, y, w, 3, L[1]); box(c, x, y, w, 2, L[2]); box(c, x, y, w, 1, L[3]);
};
/** A box's top and sides going back (to d1), if he's looking at them. */
const boxBack = (c: Ctx, v: View, x: number, y: number, w: number, foot: number, d1: number, R: string[]) => {
  sideBack(c, v.eye, x, -1, y, foot, 1, d1, R, 2, false);
  sideBack(c, v.eye, x + w, 1, y, foot, 1, d1, R, 2, false);
  topBack(c, v.eye, x, x + w, y, 1, d1, R, 2);
};

const paintMat = (g: Ctx, w: number, h: number) => {
  const R = ramp6('#1E50C8');
  box(g, -1, -1, w + 2, h + 1, INK);
  box(g, 0, 0, w, h, R[3]); box(g, 0, 0, 3, h, R[4]); box(g, w - 4, 0, 4, h, R[2]); box(g, 0, h - 5, w, 5, R[2]); checker(g, 0, h - 7, w, 2, R[2], 0, 2);
  for (let k = 1; k < 4; k++) { box(g, (w * k) / 4 - 1, 3, 2, h - 5, R[1]); box(g, (w * k) / 4 + 1, 3, 1, h - 5, R[4]); }
  for (const hx of [10, w - 26]) { box(g, hx - 1, h / 2 - 3, 18, 6, INK); box(g, hx, h / 2 - 2, 16, 4, '#18181B'); box(g, hx, h / 2 - 2, 16, 1, '#3A3A44'); }
  words(g, 'CRASH MAT', w / 2, h - 9, plain(1, 1, '#DBEAFE'));
};
const paintRoofSet = (g: Ctx, w: number, h: number) => {
  // The rooftop set's front: a painted brick building, solid down to the floor (no way through: over it), its windows,
  // a door, the fire escape painted on (dim: painted on, not a ledge), the parapet up top (lit: that's the roof)
  const R = ramp6('#8E3A22'), M = ramp6('#C8B8A4');
  box(g, -2, -2, w + 4, h + 2, INK);
  box(g, 0, 0, w, h, R[3]);
  for (let by = 14, row = 0; by < h - 6; by += 8, row++) { box(g, 0, by, w, 1, R[1]); for (let bx = row % 2 ? 0 : 12; bx < w; bx += 24) box(g, bx, by - 7, 1, 7, R[1]); if (row % 3 === 0) for (let bx = 4; bx < w; bx += 24) box(g, bx, by - 6, 6, 2, R[4]); }
  box(g, 0, 0, 4, h, R[4]); box(g, w - 6, 0, 6, h, R[1]); checker(g, w - 10, 0, 4, h, R[1], 0, 2);
  for (let wy = 40; wy < h - 90; wy += 72) for (let wx = 30; wx < w - 50; wx += 74) {
    box(g, wx - 3, wy - 3, 40, 48, INK); box(g, wx - 2, wy - 2, 38, 46, M[3]); box(g, wx - 2, wy - 2, 38, 2, M[5]);
    box(g, wx + 1, wy + 1, 32, 40, '#1A2238'); box(g, wx + 1, wy + 1, 32, 10, '#3A4A6A'); box(g, wx + 16, wy + 1, 2, 40, M[2]); box(g, wx + 1, wy + 20, 32, 2, M[2]);
    box(g, wx - 4, wy + 42, 42, 5, INK); box(g, wx - 3, wy + 43, 40, 3, M[4]);
  }
  // (the painted fire escape, dim)
  g.strokeStyle = mix(R[1], INK, 0.3); g.lineWidth = 2; g.beginPath();
  for (let y = 110; y < h - 90; y += 72) { g.moveTo(w - 100, y); g.lineTo(w - 40, y); g.moveTo(w - 100, y); g.lineTo(w - 40, y + 60); }
  g.stroke();
  // (the door, its stoop)
  box(g, w / 2 - 30, h - 80, 60, 80, INK); box(g, w / 2 - 28, h - 78, 56, 78, '#3A2418'); box(g, w / 2 - 28, h - 78, 56, 3, '#5A3A28'); box(g, w / 2 + 16, h - 40, 4, 4, BRASS[4]);
  box(g, w / 2 - 36, h - 6, 72, 6, M[2]); box(g, w / 2 - 36, h - 6, 72, 1, M[4]);
  // (the cornice under the parapet)
  box(g, -6, 12, w + 12, 8, INK); box(g, -5, 13, w + 10, 6, M[3]); box(g, -5, 13, w + 10, 1, M[5]);
};
const paintTable = (g: Ctx, w: number, h: number) => {
  const S = pal().steel;
  for (const lx of [8, w - 14]) { box(g, lx - 1, 10, 8, h - 10, INK); box(g, lx, 10, 6, h - 10, S[3]); box(g, lx, 10, 2, h - 10, S[5]); }
  box(g, -1, -1, w + 2, 13, INK); box(g, 0, 0, w, 11, '#F0ECE2'); box(g, 0, 0, w, 2, '#FFFFFF');
  // (the cloth hanging off its front: red check)
  box(g, 2, 11, w - 4, 16, '#C8302A');
  for (let x = 2; x < w - 4; x += 8) for (let y = 11; y < 27; y += 8) box(g, x + ((y / 8) % 2 ? 4 : 0), y, 4, 4, '#F0ECE2');
  box(g, 2, 26, w - 4, 2, '#7A1A16'); box(g, 2, 27, w - 4, 1, INK);
};
const paintTableTop = (g: Ctx, w: number) => {
  // (the spread on top: donuts, a cake, a coffee urn: dressing, under his feet)
  for (let k = 0; k < 6; k++) { const dx = 16 + k * 20; g.fillStyle = INK; g.beginPath(); g.arc(dx, -5, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = ['#F48AB4', '#F2D27A', '#8A4A1A'][k % 3]; g.beginPath(); g.arc(dx, -6, 5.5, 0, Math.PI * 2); g.fill(); box(g, dx - 1, -7, 2, 2, '#3A1A0A'); box(g, dx - 4, -9, 2, 1, '#FFFFFF'); }
  const S = pal().steel;
  box(g, w - 35, -31, 24, 31, INK); box(g, w - 34, -30, 22, 30, S[3]); box(g, w - 34, -30, 6, 30, S[5]); box(g, w - 18, -30, 6, 30, S[1]); box(g, w - 31, -36, 16, 6, INK); box(g, w - 30, -35, 14, 4, S[4]);
};
const paintTaxi = (g: Ctx, w: number, h: number) => {
  const Y = ramp6('#F2C21A'), G = '#18181B';
  for (const wx of [24, w - 24]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, h - 8, 13, 0, Math.PI * 2); g.fill(); g.fillStyle = '#26262C'; g.beginPath(); g.arc(wx, h - 8, 11, 0, Math.PI * 2); g.fill(); g.fillStyle = '#9A9AA4'; g.beginPath(); g.arc(wx, h - 8, 5, 0, Math.PI * 2); g.fill(); box(g, wx - 2, h - 11, 2, 2, '#FFFFFF'); }
  // (the body: lower, then the cabin set in, the roof (lit: he stands on it), the windows, the checker band, TAXI)
  box(g, -2, 14, w + 4, h - 24, INK); box(g, 0, 16, w, h - 28, Y[3]); box(g, 0, 16, w, 2, Y[5]); box(g, 0, 16, 3, h - 28, Y[4]); box(g, w - 4, 16, 4, h - 28, Y[1]);
  box(g, 0, h - 16, w, 4, Y[1]);
  for (let x = 4; x < w - 4; x += 8) box(g, x, 30, 4, 4, G); for (let x = 8; x < w - 4; x += 8) box(g, x, 34, 4, 4, G);
  box(g, 22, -2, w - 46, 20, INK); box(g, 24, 0, w - 50, 18, Y[3]); box(g, 24, 0, w - 50, 2, Y[5]);
  box(g, 30, 3, 30, 12, '#1A2238'); box(g, 30, 3, 30, 3, '#5A7AA8'); box(g, 66, 3, 26, 12, '#1A2238'); box(g, 66, 3, 26, 3, '#5A7AA8');
  box(g, 2, 22, 8, 5, '#FFF4C8'); box(g, w - 8, 22, 6, 5, '#EF4444');
  words(g, 'TAXI', w / 2, 52, plain(1, 1, G));
  // (it's a prop: the far side's plywood shows, a 2x4 holding it up)
  box(g, w - 3, 20, 3, h - 34, pal().ply[2]);
};

const solidPiece = (c: Ctx, v: View, x: number, y: number, w: number, h: number, what: SolidWhat) => {
  const tod = timeOfDay().key;
  if (what === 'mat') {
    boxBack(c, v, x, y, w, GY, 0.95, ramp6('#1E50C8'));
    still(c, `hww-mat-${w}-${h}`, x, y, -2, -2, w + 4, h + 4, g => paintMat(g, w, h));
    lip(c, x, y, w);
  } else if (what === 'roof') {
    // (its tar roof going back; up on it, the water tank prop (set back, dim))
    topBack(c, v.eye, x, x + w, y, 1, 0.93, ramp6('#3A3438'), 3);
    atDepth(c, v.eye, 0.94, () => {
      const P = pal().plyD, S = pal().steelD;
      for (const lx of [x + 170, x + 234]) { box(c, lx - 1, y - 60, 8, 60, INK); box(c, lx, y - 60, 6, 60, S[2]); }
      box(c, x + 150, y - 170, 100, 112, INK); box(c, x + 151, y - 169, 98, 110, P[2]);
      for (let k = x + 154; k < x + 248; k += 8) box(c, k, y - 168, 2, 108, P[1]);
      for (const by of [y - 140, y - 100]) box(c, x + 151, by, 98, 4, S[1]);
      poly(c, [[x + 146, y - 169], [x + 200, y - 196], [x + 254, y - 169]], INK); poly(c, [[x + 149, y - 170], [x + 200, y - 193], [x + 200, y - 170]], P[3]); poly(c, [[x + 200, y - 193], [x + 251, y - 170], [x + 200, y - 170]], P[1]);
    });
    sideBack(c, v.eye, x + w, 1, y, GY, 1, 0.93, ramp6('#8E3A22').map(cc => mix(cc, INK, 0.2)), 2, false);
    sideBack(c, v.eye, x, -1, y, GY, 1, 0.93, ramp6('#8E3A22').map(cc => mix(cc, INK, 0.2)), 2, false);
    still(c, `hww-roofset-${tod}`, x, y, -8, -4, w + 16, h + 6, g => paintRoofSet(g, w, h));
    // (the parapet's top: lit, his)
    lip(c, x - 6, y, w + 12);
    // (round the back: a 2x4 jack and a sandbag, past its right end, set back and dim: not in his way)
    atDepth(c, v.eye, 0.95, () => {
      const P = pal().plyD;
      c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.moveTo(x + w - 4, y + 30); c.lineTo(x + w + 40, GY - 4); c.stroke();
      c.strokeStyle = P[3]; c.lineWidth = 5; c.stroke();
      sandbag(c, x + w + 40, GY, 26, pal().sand.map(cc => mix(cc, '#141018', 0.3)));
    });
  } else if (what === 'table') {
    boxBack(c, v, x, y, w, y + 12, 0.95, ramp6('#E8E4DA'));
    still(c, `hww-table-${w}-${h}`, x, y, -2, -40, w + 4, h + 42, g => { paintTableTop(g, w); paintTable(g, w, h); });
    lip(c, x, y, w);
  } else if (what === 'taxi') {
    topBack(c, v.eye, x + 24, x + w - 26, y, 1, 0.95, ramp6('#F2C21A'), 2);
    still(c, `hww-taxi-${w}-${h}`, x, y, -16, -4, w + 32, h + 8, g => paintTaxi(g, w, h));
    lip(c, x + 24, y, w - 50);
  }
};

const ledgePiece = (c: Ctx, v: View, x: number, y: number, w: number, what: LedgeWhat) => {
  const S = pal().steel, P = pal().ply, D = pal().deck;
  if (what === 'flat') {
    if (GY - y > 200) {
      // (New New York's toppled building flat: a painted tower gone over onto the scaffold, its top end resting up
      // here; its painted face going down behind to the rubble at its foot, dim: scenery)
      atDepth(c, v.eye, 0.96, () => {
        const R = ramp6('#5A4A5A').map(cc => mix(cc, '#141018', 0.3));
        poly(c, [[x - 90, GY], [x + 20, y + 14], [x + 70, y + 14], [x - 40, GY]], INK);
        poly(c, [[x - 87, GY - 1], [x + 21, y + 16], [x + 67, y + 16], [x - 41, GY - 1]], R[2]);
        for (let k = 1; k < 8; k++) { const t = k / 8, ax = x - 87 + (108 * t), ay = GY - (GY - y - 16) * t; for (let j = 0; j < 3; j++) box(c, ax + 8 + j * 12, ay - 6, 5, 6, hash(k * 3 + j) > 0.5 ? '#F2D27A' : R[0]); }
        poly(c, [[x - 87, GY - 1], [x + 21, y + 16], [x + 26, y + 16], [x - 82, GY - 1]], R[4]);
      });
    } else for (const cx of [x + 12, x + w - 12]) { box(c, cx - 2, ROOF_Y + 70, 4, y - ROOF_Y - 70, INK); for (let yy = ROOF_Y + 70; yy < y; yy += 6) box(c, cx - 1, yy + 1, 2, 4, (yy / 6) % 2 ? S[3] : S[4]); }
    topBack(c, v.eye, x, x + w, y, 1, 0.96, P, 2);
    box(c, x - 1, y - 1, w + 2, 22, INK); box(c, x, y, w, 20, P[3]); box(c, x, y, w, 3, P[4]);
    box(c, x + 4, y + 6, w - 8, 10, P[2]); for (let k = x + 20; k < x + w - 10; k += 40) box(c, k, y + 3, 4, 17, P[1]);
    box(c, x, y + 18, w, 2, mix('#2E8A44', INK, 0.2));
    lip(c, x, y, w);
    return;
  }
  if (what === 'truck') {
    // (the catering truck's fold-down counter: stainless, on its brackets)
    for (const bx of [x + 14, x + w - 22]) { c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(bx, y + 10); c.lineTo(bx + 8, y + 40); c.stroke(); c.strokeStyle = S[3]; c.lineWidth = 2; c.stroke(); }
    topBack(c, v.eye, x, x + w, y, 1, 0.96, S, 2);
    box(c, x - 1, y - 1, w + 2, 12, INK); box(c, x, y, w, 10, S[3]); box(c, x, y + 7, w, 3, S[1]);
    for (let k = x + 6; k < x + w - 6; k += 22) box(c, k, y + 3, 10, 1, S[5]);
    // (the napkin dispenser, the ketchup, the tip jar on it)
    box(c, x + 20, y - 14, 14, 14, INK); box(c, x + 21, y - 13, 12, 13, S[4]); box(c, x + 23, y - 16, 8, 3, '#F4F0E8');
    box(c, x + 42, y - 16, 6, 16, INK); box(c, x + 43, y - 15, 4, 15, '#C81E1E'); box(c, x + 43, y - 15, 1, 15, '#F87171');
    lip(c, x, y, w);
    return;
  }
  if (what === 'scaffold') {
    // (pipe scaffold: standards down to base plates, ledgers, the cross braces, the deck boards on top)
    for (const lx of [x + 6, x + w - 12]) { riser(c, lx, y + 10, GY - 4, 6, S); box(c, lx - 5, GY - 4, 16, 4, INK); box(c, lx - 4, GY - 3, 14, 3, S[2]); }
    for (let yy = y + 60; yy < GY - 20; yy += 70) pipe(c, x + 6, x + w - 6, yy, 3, S);
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 9, y + 12); c.lineTo(x + w - 9, GY - 6); c.moveTo(x + w - 9, y + 12); c.lineTo(x + 9, GY - 6); c.stroke();
    c.strokeStyle = S[3]; c.lineWidth = 2; c.stroke();
    topBack(c, v.eye, x, x + w, y, 1, 0.96, P, 2);
    box(c, x - 1, y - 1, w + 2, 13, INK);
    for (let k = 0; k < w; k += 30) { box(c, x + k, y, Math.min(29, w - k), 11, P[3]); box(c, x + k, y, 1, 11, P[5]); box(c, x + k + 28, y, 1, 11, P[1]); }
    box(c, x, y + 9, w, 2, P[1]);
    lip(c, x, y, w);
    return;
  }
  // A rostrum (a stage platform on its legs, black-painted, its edge taped in glow tape)
  for (const lx of [x + 6, x + w - 14]) { box(c, lx - 1, y + 14, 10, GY - y - 14, INK); box(c, lx, y + 14, 8, GY - y - 14, D[3]); box(c, lx, y + 14, 2, GY - y - 14, D[5]); }
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 12, y + 16); c.lineTo(x + w - 12, GY - 8); c.stroke();
  c.strokeStyle = D[4]; c.lineWidth = 2; c.stroke();
  topBack(c, v.eye, x, x + w, y, 1, 0.95, D, 2);
  box(c, x - 1, y - 1, w + 2, 17, INK); box(c, x, y, w, 15, D[3]); box(c, x, y, w, 2, D[5]); box(c, x, y + 12, w, 3, D[1]);
  box(c, x + 2, y + 6, w - 4, 1, TAPE.glow);
  lip(c, x, y, w);
};

// ---------------------------------------------------------------------------------------------------------------
// The wreck of the throne-train (the coaster's own cars, on their sides), down on the producer

/** Each car: its pivot (off the wreck's middle), how far over it's gone at the end, how far up its pivot sits. */
const WRECK: { dx: number; rot: number; lift: number }[] = [
  { dx: 96, rot: -1.5, lift: 36 }, { dx: 10, rot: 2.75, lift: 70 }, { dx: -70, rot: 1.35, lift: 42 },
];
export const drawWreck = (c: Ctx, x: number, y: number, tilt: number, f: number) => {
  const landed = y >= GY;
  // (the bits of track that came with it: a crimson spine snapped off, a gold rail curled)
  if (landed) {
    const Cr = CRIMSON, G = BRASS;
    c.lineCap = 'round';
    for (const [w, col] of [[13, INK], [10, Cr[2]], [2, Cr[4]]] as const) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x - 170, GY - 6); c.quadraticCurveTo(x - 120, GY - 40, x - 40, GY - 30); c.stroke(); }
    for (const [w, col] of [[6, INK], [4, G[3]], [1, G[5]]] as const) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x + 150, GY - 4); c.quadraticCurveTo(x + 200, GY - 60, x + 170, GY - 96); c.stroke(); }
    c.lineCap = 'butt';
    // (the roof that came down with it: a corrugated sheet, insulation)
    poly(c, [[x + 120, GY], [x + 210, GY - 30], [x + 220, GY - 22], [x + 130, GY + 4]], INK);
    poly(c, [[x + 122, GY - 2], [x + 208, GY - 30], [x + 216, GY - 24], [x + 130, GY + 2]], pal().siding[4]);
    pixelBlob(c, x - 150, GY - 8, 12, 6, '#E8C060');
  }
  WRECK.forEach((w, k) => {
    const rot = w.rot * tilt, car: CarAt = { x: x + w.dx * Math.max(0.4, tilt), y: y - w.lift * tilt - 4 - (landed ? 0 : k * 30), a: rot, roll: 0 };
    drawTrain(c, [car], 'back', f);
  });
  // (smoke off it, after)
  if (tilt >= 1 && landed) for (let k = 0; k < 3; k++) { const t = (f + k * 37) % 90, a = 1 - t / 90; if (a <= 0.1) continue; pixelBlob(c, x - 30 + k * 40 + Math.sin(t * 0.05 + k) * 8, GY - 80 - t * 0.9, 10 + t * 0.12, 7 + t * 0.08, mix('#78716C', '#A8A29E', k / 3)); }
};

// ---------------------------------------------------------------------------------------------------------------
// The main stage

/** The stage door (a roll-up: its steel frame, MAIN STAGE over it, the slats down behind him while they're at him). */
const stageDoor = (c: Ctx, v: View, doorK: number, f: number) => {
  const S = pal().steel, dx = X(ARENA.a) - 34, top = ROOF_Y + 120, Sd = pal().siding;
  if (!seenAt(v, dx - 40, dx + 60)) return;
  // (the frame: steel posts, the coil's housing up top)
  for (const px of [dx - 14, dx + 38]) { box(c, px - 1, top, 12, GY - top, INK); box(c, px, top, 10, GY - top, S[3]); box(c, px, top, 2, GY - top, S[5]); box(c, px + 8, top, 2, GY - top, S[1]); }
  box(c, dx - 18, top - 34, 70, 34, INK); box(c, dx - 17, top - 33, 68, 32, Sd[3]); box(c, dx - 17, top - 33, 68, 3, Sd[5]); for (let y = top - 28; y < top; y += 6) box(c, dx - 17, y, 68, 1, Sd[1]);
  still(c, 'hww-mainstage', dx + 17, top - 50, -60, -16, 120, 32, g => board(g, 0, 0, ['MAIN STAGE'], deco('#F2C24A', '#18181B', 2, 1), '#18181B', BRASS, 5));
  const bot = top + (GY - top) * doorK;
  if (doorK > 0.01) {
    box(c, dx - 4, top, 42, bot - top, INK);
    for (let y = top; y < bot - 10; y += 8) { box(c, dx - 3, y, 40, 7, S[3]); box(c, dx - 3, y, 40, 1, S[5]); box(c, dx - 3, y + 6, 40, 1, S[1]); }
    box(c, dx - 3, bot - 10, 40, 10, INK);
    for (let k = 0; k < 5; k++) poly(c, [[dx - 3 + k * 8, bot - 9], [dx + 1 + k * 8, bot - 9], [dx + 5 + k * 8, bot - 1], [dx + 1 + k * 8, bot - 1]], '#FACC15');
    // (its red light: locked)
    box(c, dx + 11, top - 46, 12, 8, INK); box(c, dx + 12, top - 45, 10, 6, f % 40 < 20 ? '#EF4444' : '#7F1D1D');
  }
};

/** The script's showpiece: where it's drawn (its depth, and the world x that lands it right over CASE_X at the main
 *  stage's camera). */
const CASE_D = dUp(44);
const caseWX = () => { const ex = X(ARENA_CAM) + 400; return ex + (X(CASE_X) - ex) / CASE_D; };
/** The plinth (marble, gold moldings, its plaque): scenery, dimmed, its top in shade (not a ledge). Feet at 0. */
const paintPlinth = (g: Ctx) => {
  const M = MARBLE.map(cc => back(cc, 0.9)), G = BRASS.map(cc => back(cc, 0.9));
  box(g, -54, -12, 108, 12, INK); box(g, -53, -11, 106, 11, M[2]); box(g, -53, -11, 106, 2, M[3]); box(g, -53, -3, 106, 3, M[1]);
  box(g, -45, -96, 90, 86, INK); box(g, -44, -95, 88, 84, M[3]); box(g, -44, -95, 10, 84, M[4]); box(g, 32, -95, 12, 84, M[1]); checker(g, 28, -95, 4, 84, M[1], 0, 2);
  // (the veins)
  g.strokeStyle = M[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(-30, -90); g.quadraticCurveTo(-10, -60, -24, -30); g.moveTo(10, -88); g.quadraticCurveTo(20, -70, 6, -40); g.stroke();
  for (const y of [-96, -20]) { box(g, -48, y - 5, 96, 8, INK); box(g, -47, y - 4, 94, 6, G[3]); box(g, -47, y - 4, 94, 1, G[4]); box(g, -47, y + 1, 94, 1, G[1]); }
  box(g, -26, -66, 52, 22, INK); box(g, -25, -65, 50, 20, G[3]); box(g, -24, -64, 48, 18, G[2]);
  words(g, 'DO NOT', 0, -57, plain(1, 1, G[0])); words(g, 'TOUCH', 0, -48, plain(1, 1, G[0]));
};
/** The case on its plinth: glass in a brass frame, the script inside (red, bound with brads, its title); tipping off
 *  the back of the plinth as it goes over, empty after. */
const drawCase = (c: Ctx, tip: number, down: boolean) => {
  c.save(); c.translate(34, -97); c.rotate(tip * 1.45);
  const gx = -68, gy = -80, G = BRASS;
  if (!down || tip < 0.6) {
    box(c, gx + 13, gy + 25, 42, 53, INK); box(c, gx + 14, gy + 26, 40, 51, '#7A1414'); box(c, gx + 14, gy + 26, 40, 2, '#B4302A'); box(c, gx + 14, gy + 26, 3, 51, '#9A2020'); box(c, gx + 50, gy + 26, 4, 51, '#4A0A0A');
    for (const by of [gy + 32, gy + 70]) { box(c, gx + 17, by, 2, 2, G[4]); }
    words(c, 'REVENGERS', gx + 35, gy + 40, plain(1, 1, '#FDE047'));
    words(c, 'EOTWD', gx + 35, gy + 50, plain(1, 1, '#FEF3C7'));
    words(c, 'DO NOT LEAK', gx + 35, gy + 66, plain(1, 1, '#FCA5A5'));
    box(c, gx + 18, gy + 74, 34, 3, '#F4F0E8');
  }
  // (the glass: a pale tint, its frame, two glints; gone after: a corner of frame and a shard)
  if (!down) {
    c.fillStyle = 'rgba(186, 230, 253, 0.22)'; c.fillRect(gx, gy, 68, 80);
    box(c, gx + 6, gy + 4, 3, 40, 'rgba(255,255,255,0.55)'); box(c, gx + 12, gy + 4, 1, 26, 'rgba(255,255,255,0.4)');
    for (const [x, y, w, h] of [[gx - 1, gy - 1, 70, 3], [gx - 1, gy + 78, 70, 3], [gx - 1, gy - 1, 3, 82], [gx + 66, gy - 1, 3, 82]] as const) { box(c, x - 1, y - 1, w + 2, h + 2, INK); box(c, x, y, w, h, G[3]); }
    box(c, gx, gy - 1, 68, 1, G[5]);
  } else {
    box(c, gx - 1, gy + 78, 30, 3, G[2]); box(c, gx - 1, gy + 50, 3, 30, G[2]);
    poly(c, [[gx + 2, gy + 50], [gx + 16, gy + 30], [gx + 10, gy + 60]], 'rgba(224, 242, 254, 0.5)');
  }
  c.restore();
};
const showpiece = (c: Ctx, v: View, f: number, tip: number, down: boolean) => {
  const wx = caseWX();
  if (!seenAt(v, wx - 200, wx + 200, CASE_D)) return;
  atDepth(c, v.eye, CASE_D, () => {
    // (its light: banded, down from a par can on the grid onto it)
    beam(c, wx, ROOF_Y + 90, GY - 4, 110, '#FEF9C3', down ? 0.08 : 0.16);
    box(c, wx - 8, ROOF_Y + 74, 16, 18, INK); box(c, wx - 7, ROOF_Y + 75, 14, 16, '#26222A'); box(c, wx - 8, ROOF_Y + 90, 16, 4, '#FFF6C8');
    // (the marquee over it, hung on chains: THE SCRIPT in bulbs)
    for (const cx of [wx - 70, wx + 70]) for (let y = ROOF_Y + 70; y < GY - 260; y += 6) box(c, cx - 1, y, 3, 4, (y / 6) % 2 ? pal().steel[3] : pal().steel[4]);
    still(c, `hww-marquee-${down ? 1 : 0}`, wx, GY - 236, -96, -26, 192, 52, g => { box(g, -92, -22, 184, 44, INK); box(g, -91, -21, 182, 42, '#2A0A10'); box(g, -91, -21, 182, 2, BRASS[4]); box(g, -91, 19, 182, 2, BRASS[1]); });
    words(c, 'THE SCRIPT', wx, GY - 222, bulbs(2, 2, down ? '#78716C' : '#FDE047', !down && (f % 40 < 32 || lit())));
    // (the ropes round it, the laser grid between their posts; after: the posts knocked over)
    if (!down) {
      c.save(); c.translate(0, GY + 6); velvetRopePaint(c, wx - 120, wx + 120); c.restore();
      for (let k = 0; k < 3; k++) { c.fillStyle = (f + k * 7) % 30 < 24 ? 'rgba(239, 68, 68, 0.75)' : 'rgba(239, 68, 68, 0.25)'; c.fillRect(wx - 120, GY - 6 - k * 10, 240, 1); }
    } else for (let k = 0; k < 4; k++) { box(c, wx - 116 + k * 76, GY + 2, 32, 5, INK); box(c, wx - 115 + k * 76, GY + 3, 30, 3, BRASS[3]); }
    still(c, 'hww-plinth', wx, GY, -56, -100, 112, 102, paintPlinth);
    c.save(); c.translate(wx, GY); drawCase(c, tip, down); c.restore();
    if (down) for (let k = 0; k < 14; k++) box(c, wx - 80 + ((k * 43) % 220), GY + 2 - (k % 3) * 3, 5, 3, '#E0F2FE');
  });
};

/** The far wall: the one still up (FIRE EXIT, bricked up); smashed open by the bulldozer (daylight through it). */
const farWall = (c: Ctx, v: View, open: boolean) => {
  const wx = X(FAR_WALL), top = ROOF_Y - 220, end = x1 + 400, Sd = pal().siding, O = pal().oxide;
  if (!seenAt(v, wx - 200, end)) return;
  // (its inside face going back, if he's left of it)
  sideBack(c, v.eye, wx, -1, ROOF_Y, GY, 1, WALL_D, Sd, 3, false);
  // (its end: the siding, a column at its edge)
  box(c, wx, top, end - wx, GY - top, Sd[2]);
  for (let x = wx + 4; x < end; x += 14) { box(c, x, top, 1, GY - top, Sd[4]); box(c, x + 4, top, 1, GY - top, Sd[1]); }
  for (const h of [150, 310, 470]) { box(c, wx, GY - h - 5, end - wx, 10, O[2]); box(c, wx, GY - h - 5, end - wx, 2, O[4]); }
  box(c, wx - 1, top, 14, GY - top, INK); box(c, wx, top, 12, GY - top, O[3]); box(c, wx, top, 3, GY - top, O[5]);
  if (open) {
    // (the hole: daylight through it, jagged; the siding torn outward with the rebar; rubble at its foot)
    const lx = wx + 14;
    const hole = () => { c.beginPath(); c.moveTo(lx - 4, GY); c.lineTo(lx + 6, GY - 90); c.lineTo(lx - 2, GY - 170); c.lineTo(lx + 12, GY - 236); for (let x = lx + 12, k = 0; x < end; x += 26, k++) c.lineTo(x, GY - 236 + (k % 2 ? 14 : 0)); c.lineTo(end, GY); c.closePath(); };
    c.save(); hole(); c.clip();
    const tod = timeOfDay();
    bandedGradient(c, lx - 10, GY - 250, end - lx + 10, 180, [mix('#6C92C8', '#141832', tod.lamps * 0.8), mix('#C6BC9E', '#2A2840', tod.lamps * 0.8), mix('#DEBE8A', '#3A3048', tod.lamps * 0.8)], 6);
    box(c, lx - 10, GY - 70, end - lx + 10, 70, mix('#7A7270', '#1C1A22', tod.lamps * 0.7)); box(c, lx - 10, GY - 70, end - lx + 10, 2, mix('#9A928C', '#2A2830', tod.lamps * 0.7));
    box(c, lx + 90, GY - 120, 200, 70, INK); box(c, lx + 92, GY - 118, 196, 66, mix('#2E6A3E', '#0E1A12', tod.lamps * 0.6)); box(c, lx + 92, GY - 118, 196, 3, mix('#4E9A5E', '#1E2A22', tod.lamps * 0.6));
    c.restore();
    c.strokeStyle = INK; c.lineWidth = 3; hole(); c.stroke();
    c.strokeStyle = '#8A3A1A'; c.lineWidth = 2; c.beginPath();
    for (const y of [GY - 200, GY - 130, GY - 60]) { c.moveTo(lx, y); c.quadraticCurveTo(lx + 20, y - 10, lx + 34, y + 12); }
    c.stroke();
    for (const [y, w] of [[GY - 150, 40], [GY - 60, 30]] as const) { poly(c, [[lx, y], [lx + w, y - 16], [lx + w + 4, y + 8], [lx, y + 20]], INK); poly(c, [[lx + 1, y + 1], [lx + w - 1, y - 14], [lx + w + 2, y + 7], [lx + 1, y + 18]], Sd[4]); }
    for (let k = 0; k < 10; k++) { box(c, wx - 60 + k * 14, GY - 9 - (k % 3) * 4, 11, 9, INK); box(c, wx - 59 + k * 14, GY - 8 - (k % 3) * 4, 9, 7, k % 2 ? pal().concrete[3] : Sd[4]); box(c, wx - 59 + k * 14, GY - 8 - (k % 3) * 4, 9, 1, pal().concrete[5]); }
    still(c, 'hww-wayout', wx - 70, GY - 270, -60, -14, 120, 28, g => board(g, 0, 0, ['THIS WAY OUT'], plain(1, 1, '#FDE68A'), '#18181B', BRASS, 5));
  } else {
    // (the fire exit, bricked up: the doorway, the bricks in it, its EXIT still lit over it; the sign)
    const dx = wx + 40;
    box(c, dx - 2, GY - 112, 64, 112, INK);
    const B = ramp6('#8E3A22');
    box(c, dx, GY - 110, 60, 110, B[3]);
    for (let y = GY - 110, r = 0; y < GY; y += 8, r++) { box(c, dx, y, 60, 1, B[1]); for (let x = dx + (r % 2 ? 0 : 7); x < dx + 60; x += 14) box(c, x, y, 1, 8, B[1]); }
    box(c, dx + 6, GY - 132, 48, 16, INK); box(c, dx + 7, GY - 131, 46, 14, '#EF4444'); words(c, 'EXIT', dx + 30, GY - 120, plain(1, 1, '#FFF4F4'));
    still(c, 'hww-bricked', wx - 40, GY - 300, -100, -14, 200, 28, g => board(g, 0, 0, ['FIRE EXIT (BRICKED UP)'], plain(1, 1, '#E7E5E4'), '#3A1A1A', BRASS, 5));
  }
};

const mainStage = (c: Ctx, v: View, state: GameState) => {
  const o = whOf(state), F = o.fight, f = state.frame;
  if (!seenAt(v, X(ARENA.a) - 200, x1 + 200)) return;
  stageDoor(c, v, F.doorK, f);
  // (the bulldozer, parked at the back (set back: it's not in his way), till it goes)
  const dz = dozerX(state);
  if (dz !== null && !endingOn(state) && seenAt(v, X(DOZER_X) - 200, X(DOZER_X) + 200)) {
    c.save(); c.translate(dz, BACK_Y + 22); c.scale(0.82, 0.82); c.translate(-dz, -GY);
    drawDozer(c, dz, f, false);
    c.restore();
    still(c, 'hww-keys', dz - 30, BACK_Y - 142, -40, -12, 80, 24, g => board(g, 0, 0, ['KEYS IN IT'], plain(1, 1, '#18181B'), '#FDE68A', BRASS, 4));
  }
  showpiece(c, v, f, caseTip(state), caseDown(state));
  // (the pages all over the stage, after)
  if (caseDown(state)) for (let rx = ARENA.a + 30; rx < ARENA.b - 10; rx += 37 + (rx % 23)) if (seenAt(v, X(rx), X(rx) + 12)) { const y = GY - 4 - (rx % 3) * 2 - (rx % 5) * 9; box(c, X(rx) - 1, y - 1, 14, 6, INK); box(c, X(rx), y, 12, 4, '#F5F5F4'); box(c, X(rx) + 2, y + 1, 8, 1, '#A8A29E'); }
  farWall(c, v, wallOpen(state));
};

// ---------------------------------------------------------------------------------------------------------------

export const drawWarehouseBack = (c: Ctx, state: GameState) => {
  const v = wview(state), f = state.frame, b = whOf(state).burst;
  const fall = b.on ? b.fall : wallsDown(state) ? 1 : 0;
  if (v.v1 < x0 - 800 || v.v0 > x1 + 400) return;
  // Outside (the walls going, or down): the public on the fallen back wall
  if (fall >= 1) {
    backWall(c, v, Math.PI / 2, f);
    crowd(c, v, f, !b.on || b.runners.some(r => r.t - r.at > 60));
    if (b.on) runners(c, v, state);
  } else backWall(c, v, fall * fall * Math.PI / 2, f);
  // The frame and the roof, the lighting grid under it
  columns(c, v);
  grid(c, v);
  roof(c, v, state);
  // The floor going back, the pits cut through it, the end wall
  for (const p of PITS) if (seenAt(v, p.a - 60, p.b + 60, WALL_D)) pitIn(c, v, p.a, p.b);
  for (const [a, bb] of FLOOR) if (seenAt(v, a, bb, WALL_D)) floorRun(c, v, a, bb);
  if (seenAt(v, x0 - 700, x0 + 60, WALL_D)) endWall(c, v, fall);
  // The sets at the back of it
  drawSets(c, v, f);
  // The floor toward us, bent
  floorFront(c, v);
  // The set pieces he stands on
  for (const [rx, h, w, what] of SOLIDS) if (seenAt(v, X(rx) - 60, X(rx) + w + 60)) solidPiece(c, v, X(rx), Y(h), w, h, what);
  for (const [rx, h, w, what] of LEDGES) if (seenAt(v, X(rx) - 20, X(rx) + w + 20)) ledgePiece(c, v, X(rx), Y(h), w, what);
  // The wreck (where it stopped; tumbling in, in the burst-in), the producer under it
  const wx = b.on ? b.tx : X(WRECK_X);
  if (seenAt(v, X(PROD_X) - 160, X(PROD_X) + 160)) drawProducer(c, state);
  if ((!b.on || roofHoled(state)) && seenAt(v, wx - 260, wx + 260)) drawWreck(c, wx, b.on ? b.ty : GY, b.on ? b.tilt : 1, f);
  // Steve, foreshadowed (yellow): fliers taped up, posters, standees
  for (const [rx, h, kind] of STEVES) {
    if (!seenAt(v, X(rx) - 60, X(rx) + 60)) continue;
    if (kind === 'standee') { still(c, 'hww-standee', X(rx), Y(h), -52, -140, 104, 152, paintStandee); continue; }
    // (up high: taped on the rooftop set's water tank; otherwise set back on a stand of its own: a flier round a pipe on
    // its sandbag, a poster on an easel)
    atDepth(c, v.eye, h >= 300 ? 0.94 : 0.9, () => {
      if (h < 300) {
        const S = pal().steel;
        if (kind === 'poster') for (const s of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(X(rx) + s * 22, Y(h) + 70); c.lineTo(X(rx) + s * 34, GY); c.stroke(); c.strokeStyle = pal().ply[3]; c.lineWidth = 3; c.stroke(); }
        else { riser(c, X(rx) - 2, Y(h) + 20, GY - 6, 4, S); sandbag(c, X(rx), GY, 22); }
      }
      still(c, `hww-steve-${kind}-${rx % 3}`, X(rx), Y(h), -50, -66, 100, 132, g => steveCard(g, 0, 0, kind === 'poster' ? 1.4 : 0.9, rx, kind));
    });
  }
  mainStage(c, v, state);
};

/** The studio lights and the signs, lit after dark (through the open walls). */
export const warehouseLamps = (): Light[] => [
  ...LIGHTS.map(([rx]) => ({ x: X(rx), y: ROOF_Y + 110, r: 260, a: 0.9, color: '#FEF9C3' })),
  { x: X(CASE_X), y: BACK_Y - 120, r: 260, a: 1, color: '#FEF08A' },
  { x: X(5330), y: BACK_Y - 214, r: 180, a: 0.7, color: '#FDE68A' },
  { x: X((ARENA.a + ARENA.b) / 2), y: BACK_Y - 470, r: 300, a: 0.7, color: '#FDE047' },
];

void checker; void hash; void VELVET; void STEVE; void PROP_D; void x0; void riser;
export type { Look };
