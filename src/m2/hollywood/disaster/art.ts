// Disaster: The Ride, drawn (the final pass: peak SNES, fake 3D on the boulevard's one eye; the kit: paint.ts). The
// backdrop: dark (it's indoors), or once the far wall's out the backlot's own far off by the hour (lot/far.ts: gone red
// with ash, the city burning). In the world, back to front: outside's far things (the funnel across the lot, the lot
// going back from the hole, a false front burning: theater.ts); the rooms' shells, their back walls, ceilings and
// floors going back (rooms.ts, theater.ts); the partitions between them going back; over the ceilings the building's
// guts in section; the floors toward us under the play plane, bent; the far wall (up, going over, or out flat); then
// each room's play plane: the lobby (rooms.ts), the pre-show, the theater (theater.ts). In front of him: the heater's
// real fire on the floor, the fan and the cow flying.
//
// Standable reads standable (lit lips on the queue's posts, the counter, the cases, the truss, the catwalks, the lean
// rails); the catwalks' handrails and the front-of-house truss dim (not ledges). The signs in the park's letters (the
// ride's show letters, the marquee's bulbs), on boards hung on chains or on stands.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { box, hash, bandedGradient, pixelBlob, checker } from '../blvd/kit';
import { drawLotFar } from '../lot/far';
import { realDisastersOn } from '../section';
import { X, Y, GY, LOBBY, PRESHOW, THEATER, FAR_WALL, SCREEN, FX, CAT_L, CAT_R, BOOTH, HORNS } from './layout';
import { dzOf, type Dz } from './state';
import { FX_LEN } from './show';
import { type Ctx, INK, dview, seenD, WALL_D, CARPET, INDIGO, BLACKS, FIRE } from './paint';
import {
  lobbyShell, lobbyPlenum, drawLobby, preshowShell, lobbyPartition, preshowPlenum, drawPreshow, floorFront, bendAll, paintCarpet,
  paintIndigoCarpet, BAND,
} from './rooms';
import { theaterShell, theaterPartition, theaterPlenum, drawTheater, drawOutsideFar, drawFarWall, paintAsphalt, fanHead, cowProp } from './theater';

/** The far wall's out (or going): outside shows through the hole. */
const isOpen = (state: GameState) => { const r = dzOf(state).real; return realDisastersOn(state) && (r.phase === 'done' || r.wall > 0); };

// ---------------------------------------------------------------------------------------------------------------
// Screen space

export const drawDisasterBackdrop = (c: Ctx, state: GameState) => {
  const sv = state.view, right = sv ? sv.x + sv.w : state.camera.x + CANVAS_WIDTH;
  if (isOpen(state) && right > X(FAR_WALL) - 300) { drawLotFar(c, state); return true; }
  c.fillStyle = '#060507'; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  return true;
};

// ---------------------------------------------------------------------------------------------------------------

/** The theater's black deck, flat (under the play plane): the sheets' joints, scuffs, glow tape at the aisle's edge. */
const paintDeck = (g: Ctx, x: number, w: number) => {
  const D = ['#060508', '#0C0A0E', '#16131A', '#1E1A22', '#28232C', '#332C38'];
  bandedGradient(g, x, GY, w, BAND, [D[4], D[3], D[3], D[2]], 6);
  box(g, x, GY, w, 2, D[5]); box(g, x, GY + 2, w, 1, D[3]);
  for (let k = Math.ceil(x / 96) * 96; k < x + w; k += 96) box(g, k, GY + 3, 1, BAND, D[1]);
  for (let y = GY + 44; y < GY + BAND; y += 48) box(g, x, y, w, 1, D[1]);
  for (let k = Math.ceil(x / 31) * 31; k < x + w; k += 31) { const h = hash(k * 0.23); if (h < 0.3) box(g, k, GY + 8 + Math.floor(hash(k * 3) * 200), 4 + Math.floor(h * 10), 1, D[5]); }
  // (the glow tape along the aisle, in dashes; the aisle's step lights)
  for (let k = Math.ceil(x / 24) * 24; k < x + w; k += 24) box(g, k, GY + 22, 12, 2, '#9AC85A');
  for (let k = Math.ceil(x / 120) * 120; k < x + w; k += 120) { box(g, k - 1, GY + 8, 8, 5, INK); box(g, k, GY + 9, 6, 3, '#F59E0B'); box(g, k, GY + 9, 6, 1, '#FDE68A'); }
};

export const drawDisasterBack = (c: Ctx, state: GameState, o: Dz, beat: number, k: number, real: boolean) => {
  const v = dview(state), f = state.frame, open = isOpen(state);
  const L = seenD(v, X(-200), X(LOBBY.b) + 40, WALL_D), P = seenD(v, X(PRESHOW.a) - 40, X(PRESHOW.b) + 80, WALL_D), T = seenD(v, X(THEATER.a) - 40, X(FAR_WALL + 40), WALL_D);
  // Outside, far (through the hole, once it's open)
  if (open) drawOutsideFar(c, v, f);
  // The rooms' shells (their depth), the partitions going back, the guts over the ceilings
  if (L) lobbyShell(c, v, real);
  if (P) preshowShell(c, v);
  if (T) theaterShell(c, v, real);
  lobbyPartition(c, v);
  theaterPartition(c, v);
  if (L) lobbyPlenum(c, v);
  if (P) preshowPlenum(c, v);
  if (T) theaterPlenum(c, v, real, open);
  // The floors toward us (flat), then bent to the eye, before anything stands on them
  floorFront(c, v, 'lobby', X(-200), X(LOBBY.b), (g, x, w) => paintCarpet(g, x, w), CARPET[2]);
  floorFront(c, v, 'preshow', X(PRESHOW.a), X(PRESHOW.b), paintIndigoCarpet, INDIGO[2]);
  floorFront(c, v, 'theater', X(THEATER.a), X(FAR_WALL + 40), paintDeck, BLACKS[2]);
  if (open) floorFront(c, v, 'outside', X(FAR_WALL + 40), X(6600), paintAsphalt, '#1C1416');
  bendAll(c, v, X(-200), open ? X(6600) : X(FAR_WALL + 40));
  // The far wall (up, going, or out flat), then each room's play plane
  drawFarWall(c, v, o, real);
  if (seenD(v, X(-200), X(LOBBY.b) + 40)) drawLobby(c, v, state, o, real);
  if (seenD(v, X(PRESHOW.a) - 40, X(PRESHOW.b) + 80)) drawPreshow(c, v, state, o, real);
  if (seenD(v, X(THEATER.a) - 40, X(FAR_WALL + 40))) drawTheater(c, v, state, o, beat, k, real);
};

/** In front of him: the real fire on the floor (the heater's: stepped tongues, ember to white-hot, sparks, its smoke),
 *  the fan and the cow flying. */
export const drawDisasterFront = (c: Ctx, state: GameState, o: Dz, real: boolean) => {
  const f = state.frame, r = o.real, v = dview(state);
  if (real && seenD(v, X(FX.heater) - 100, X(FX.heater) + 100)) {
    const hx = X(FX.heater);
    // (the scorched patch, the coals)
    box(c, hx - 58, GY - 4, 116, 4, INK); box(c, hx - 56, GY - 3, 112, 3, '#1C1210');
    for (let i = 0; i < 14; i++) box(c, hx - 52 + i * 8, GY - 3, 5, 2, (f + i * 5) % 16 < 8 ? FIRE[2] : FIRE[1]);
    for (let i = 0; i < 6; i++) {
      const fx = hx - 45 + i * 18, h = 34 + ((f * 3 + i * 17) % 26), sway = Math.sin(f * 0.25 + i * 1.7) * 4;
      for (const [kk, col] of [[1, FIRE[1]], [0.82, FIRE[2]], [0.62, FIRE[3]], [0.42, FIRE[5]], [0.2, FIRE[6]]] as const) {
        const w = 12 * kk + 2;
        c.fillStyle = col; c.beginPath(); c.moveTo(fx - w, GY - 2); c.quadraticCurveTo(fx + sway * kk, GY - (h + 10) * kk - 6, fx + w, GY - 2); c.closePath(); c.fill();
      }
    }
    for (let i = 0; i < 8; i++) { const t = ((f * 1.5 + i * 23) % 60) / 60; box(c, hx - 40 + hash(i * 3.7) * 80 + Math.sin(t * 6 + i) * 6, GY - 20 - t * 90, 2, 2, t < 0.5 ? FIRE[5] : FIRE[3]); }
    for (let i = 0; i < 3; i++) { const t = ((f * 0.5 + i * 40) % 120) / 120; pixelBlob(c, hx - 10 + i * 10 + t * 30, GY - 80 - t * 120, 10 + t * 26, 8 + t * 16, `rgba(30, 24, 22, ${(0.5 * (1 - t)).toFixed(2)})`); }
  }
  if (r.fan) { c.save(); c.translate(r.fan.x, r.fan.y); c.rotate(r.fan.rot); fanHead(c, f * 0.5); box(c, -3, 21, 6, 20, INK); box(c, -2, 21, 4, 19, '#7A828E'); c.restore(); }
  if (r.cow) { c.save(); c.translate(r.cow.x, r.cow.y); c.rotate(r.cow.rot); cowProp(c, false); c.restore(); }
  void checker; void Y;
};

/** A light's color, faint (the engine adds it over what it lights, and tints whoever's in it by it at 0.3 of how lit
 *  they are: a plain hex color there went over him at full strength, lighting him up white in the dark theater). */
const tint = (hex: string, a: number) => `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${a})`;

/** The light: a dark room lit by its screen (the red gel in the volcano, the fire and the red sky once it's real). */
export const disasterLights = (o: Dz, beat: number, k: number, real: boolean): Light[] => {
  const out: Light[] = [
    { x: X(300), y: Y(LOBBY.ceil) + 40, r: 360, a: 0.8, color: tint('#FDE68A', 0.14) },
    { x: X(1000), y: Y(LOBBY.ceil) + 40, r: 360, a: 0.8, color: tint('#FDE68A', 0.14) },
    { x: X(1650), y: Y(LOBBY.ceil) + 40, r: 320, a: 0.8, color: tint('#FDBA74', 0.14) },
    { x: X(PRESHOW.tv), y: Y(PRESHOW.ceil) + 140, r: 360, a: 0.85, color: tint(real ? '#E7E5E4' : '#FDBA74', 0.14) },
    // (the screen: the room's light, but it's a dim theater: soft on whoever's down in it)
    { x: X((SCREEN.a + SCREEN.b) / 2), y: Y((SCREEN.lo + SCREEN.hi) / 2), r: 720, a: 0.7, color: tint(real ? '#FCA5A5' : ['#E0F2FE', '#FCA5A5', '#CBD5E1', '#F8FAFC', '#93C5FD', '#FDBA74'][beat], 0.12) },
    { x: X(BOOTH.cab + 150), y: Y(CAT_R.h) - 80, r: 220, a: 0.7, color: tint('#7DD3FC', 0.12) },
    { x: X(CAT_L.a + 300), y: Y(CAT_L.h) - 60, r: 260, a: 0.5, color: tint('#FDE68A', 0.1) },
    // (the EXIT's green, faint)
    { x: X(THEATER.b - 90), y: GY - 150, r: 120, a: 0.5, color: tint('#4ADE80', real ? 0.04 : 0.08) },
  ];
  for (const rx of HORNS) void rx;
  if (!real && beat === 1 && k >= 0 && k < FX_LEN - 40) out.push({ x: X(FX.heater + 36), y: GY - 150, r: 420, a: 0.85, color: tint('#EF4444', 0.2) });
  if (real || o.real.fire > 0) out.push({ x: X(FX.heater), y: GY - 30, r: 360, a: 0.9, color: tint('#F97316', 0.18) });
  if (real) out.push({ x: X(FAR_WALL + 200), y: GY - 200, r: 700, a: 0.9, color: tint('#EA580C', 0.16) });
  return out;
};
