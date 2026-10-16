// CULTURES OF THE WORLD, drawn (the first pass: crude but readable). Outside: the theater's front set back off the
// promenade (columns, the marquee). The street doors through its side wall (the wall's outside face over the lobby
// while he's out on the promenade, gone as he goes in: no cut). THE LOBBY: wine-red walls, gold trim, chandeliers, the
// ticket booth and the concessions (set back: scenery), the posters, the house doors. THE HOUSE: dark, the box seats,
// the proscenium (gold pillars floor to arch: the stage's ends), the revolving stage's painted set for the showpiece
// that's up, the animatronics, the red curtain, the stage clock (a big LED countdown hung off the arch). BACKSTAGE:
// concrete, the fly ropes and sandbags, the EXIT to the helicopters.
//
// And in FRONT of it all, nearer than he is (moving faster than the world as the camera goes), THE CROWD in the seats in
// silhouette, the whole time: bobbing, cheering (arms up), booing (thumbs down), laughing, standing for the ovation,
// phones up (a lot more of them when he's naked).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import {
  type Ctx, viewIn, box, mix, poly, promenade, setBack, wall, hole, onScreen, LOOKS, dimmed, hour, ramp6, topBack, slab,
  board, hungBoard, INK, LIP, FACADE_D, hash, plain,
} from '../kit';
import { saidOver } from '../section';
import {
  x1, X, Y, GY, DOOR, DOOR_W, LOBBY_A, HOUSE_DOOR, HOUSE_DOOR_W, STEPS_A, SA, SB, WING_B, STEPS_B, STAGE_H, FY, ARCH_H, L, R, MID,
} from './layout';
import { theaterOf, showDone, showOn } from './show';
import { drawMember } from './robots';
import { himOf, POT_H } from './troupe';
import type { Theater } from './state';
import type { CultureId } from './lines';
import { CULTURE_NAME } from './lines';

const TOP = FY - ARCH_H;
const rx = (state: GameState) => himOf(state).x - X(0);

// ---------------------------------------------------------------------------------------------------------------
// Behind him

export const drawTheaterBack = (c: Ctx, state: GameState) => {
  const v = viewIn(state), T = theaterOf(state), f = state.frame, done = showDone(state);
  // OUTSIDE: the promenade up to the doors, the theater's front set back off it
  promenade(c, v, X(0), X(DOOR) + 20);
  setBack(c, v, X(140), 640, FACADE_D, () => {
    wall(c, 0, 640, 430, '#7F1D1D', '#FCD34D');
    for (let k = 0; k < 6; k++) { box(c, 30 + k * 112, -360, 22, 360, dimmed('#F5F5F4')); box(c, 26 + k * 112, -366, 30, 8, dimmed('#FCD34D')); }
    for (let k = 0; k < 3; k++) hole(c, 120 + k * 150, -150, 90, 150, true);
    box(c, 0, -430, 640, 10, dimmed('#1E3A8A'));
  });
  if (onScreen(v, X(200), X(760))) board(c, X(460), GY - 300, done ? ['CULTURES OF THE WORLD', 'SHOW CANCELED', 'ALL OF IT'] : ['CULTURES OF THE WORLD', 'NOW SHOWING: EVERYBODY ELSE', 'COOL. BUT NOT AS COOL AS AMERICA.'], LOOKS.land(2), '#B91C1C');

  // INSIDE: the walls first (the lobby, the house, backstage), then the floors
  if (v.cam.x + CANVAS_WIDTH > X(DOOR)) {
    const top = v.cam.y - 60, a = Math.max(X(DOOR), v.cam.x - 20), b = Math.min(x1 + 200, v.cam.x + CANVAS_WIDTH + 20);
    if (b > a) {
      // (the lobby)
      seg(c, a, b, X(DOOR), X(HOUSE_DOOR), () => {
        box(c, X(DOOR), top, X(HOUSE_DOOR) - X(DOOR), GY - top, '#5B1A2A');
        box(c, X(DOOR), Y(300), X(HOUSE_DOOR) - X(DOOR), 300, '#6B2235');
        box(c, X(DOOR), Y(80), X(HOUSE_DOOR) - X(DOOR), 80, '#3F1220'); box(c, X(DOOR), Y(82), X(HOUSE_DOOR) - X(DOOR), 3, '#CA8A04');
        box(c, X(DOOR), Y(330), X(HOUSE_DOOR) - X(DOOR), 30, '#CA8A04'); box(c, X(DOOR), Y(300), X(HOUSE_DOOR) - X(DOOR), 2, '#713F12');
        box(c, X(DOOR), top, X(HOUSE_DOOR) - X(DOOR), Y(330) - top, '#2A0B14');
        for (let x = DOOR + 120; x < HOUSE_DOOR - 40; x += 220) { box(c, X(x) - 2, Y(330), 4, 40, '#713F12'); chandelier(c, X(x), Y(290), f); }
        for (let x = DOOR + 60; x < HOUSE_DOOR; x += 110) { box(c, X(x) - 3, Y(200), 6, 14, '#FCD34D'); box(c, X(x) - 6, Y(186), 12, 4, '#FDE68A'); }
      });
      // (the house: dark; the box seats on the wall; the proscenium's surround)
      seg(c, a, b, X(HOUSE_DOOR), X(WING_B), () => {
        box(c, X(HOUSE_DOOR), top, X(WING_B) - X(HOUSE_DOOR), GY - top, '#1F0B12');
        for (let x = HOUSE_DOOR + 20; x < WING_B; x += 40) box(c, X(x), top, 2, GY - top, '#2A0F18');
        for (const bxx of [HOUSE_DOOR + 40]) { box(c, X(bxx), Y(260), 130, 50, dimmed('#7F1D1D')); box(c, X(bxx), Y(262), 130, 4, dimmed('#CA8A04')); box(c, X(bxx), Y(380), 130, 50, dimmed('#7F1D1D')); box(c, X(bxx), Y(382), 130, 4, dimmed('#CA8A04')); }
      });
      // (backstage: concrete, the fly ropes, sandbags)
      seg(c, a, b, X(WING_B), x1 + 200, () => {
        box(c, X(WING_B), top, x1 + 200 - X(WING_B), GY - top, '#3F3F46');
        for (let x = WING_B; x < 3200; x += 60) box(c, X(x), top, 1, GY - top, '#52525B');
        box(c, X(WING_B), Y(420), x1 + 200 - X(WING_B), 6, '#71717A');
        for (let k = 0; k < 6; k++) { const x = X(2660 + k * 22); box(c, x, top, 2, GY - 200 - top - k * 14, '#A8A29E'); box(c, x - 5, GY - 200 - k * 14, 12, 16, '#78716C'); }
        box(c, X(2900), Y(180), 70, 180, '#1C1917'); box(c, X(2904), Y(176), 62, 176, '#57534E'); box(c, X(2956), Y(90), 4, 8, '#A8A29E');
      });
    }
  }
  if (onScreen(v, X(LOBBY_A), X(HOUSE_DOOR))) drawLobby(c, state);

  // The floors: the lobby's carpet, the aisle, the steps up, the stage, the steps down, backstage
  const R0 = ramp6(hour('#7F1D1D')), RS = ramp6(hour('#92400E')), RC = ramp6(hour('#57534E'));
  if (onScreen(v, X(DOOR), X(STEPS_A))) { topBack(c, v.eye, X(DOOR), X(STEPS_A), GY, 1, 0.9, R0, 3); box(c, X(DOOR), GY, X(STEPS_A) - X(DOOR), 400, '#2A0B14'); box(c, X(DOOR), GY, X(STEPS_A) - X(DOOR), 3, LIP[2]); }
  if (onScreen(v, X(STEPS_A), X(STEPS_B))) {
    topBack(c, v.eye, X(SA), X(WING_B), FY, 1, 0.84, RS, 4);
    // (the turntable's ring in the boards)
    c.strokeStyle = 'rgba(28, 16, 20, 0.6)'; c.lineWidth = 2; c.beginPath(); c.ellipse(MID, FY - 18, 330, 16, 0, Math.PI, Math.PI * 2); c.stroke();
    for (let x = SA + 40; x < WING_B; x += 40) { c.strokeStyle = 'rgba(28, 16, 20, 0.3)'; c.lineWidth = 1; c.beginPath(); c.moveTo(X(x), FY); c.lineTo(X(x) + (X(x) - v.eye.x) * -0.16, FY - 30); c.stroke(); }
    // (the apron's face: dark wood, the footlights along its lip)
    slab(c, X(SA), FY, X(WING_B) - X(SA), STAGE_H, RS, false);
    box(c, X(SA), FY, X(WING_B) - X(SA), 3, LIP[2]); box(c, X(SA), FY, X(WING_B) - X(SA), 1, LIP[3]);
    for (let x = SA + 30; x < SB; x += 50) { box(c, X(x) - 6, FY + 6, 12, 6, '#1C1917'); box(c, X(x) - 4, FY + 7, 8, 3, showOn(T) || T.phase === 'wait' ? '#FEF3C7' : '#78716C'); }
    box(c, X(SA), GY, X(STEPS_B) - X(SA), 400, '#1C0A10');
    // (the steps up from the aisle, and down to backstage: lit lips)
    for (let k = 0; k < 3; k++) {
      const h = (k + 1) * (STAGE_H / 3), xa = STEPS_A + k * ((SA - STEPS_A) / 3);
      slab(c, X(xa), GY - h, X(SA) - X(xa), h, R0, false); box(c, X(xa), GY - h, X(SA) - X(xa), 3, LIP[2]);
      const xb = WING_B + k * ((STEPS_B - WING_B) / 3);
      slab(c, X(xb), GY - (STAGE_H - k * (STAGE_H / 3)), (STEPS_B - WING_B) / 3, STAGE_H - k * (STAGE_H / 3), RC, false); box(c, X(xb), GY - (STAGE_H - k * (STAGE_H / 3)), (STEPS_B - WING_B) / 3, 3, LIP[2]);
    }
  }
  if (onScreen(v, X(STEPS_B), x1 + 200)) { topBack(c, v.eye, X(STEPS_B), x1 + 200, GY, 1, 0.9, RC, 3); box(c, X(STEPS_B), GY, x1 + 200 - X(STEPS_B), 400, '#18181B'); box(c, X(STEPS_B), GY, x1 + 200 - X(STEPS_B), 3, LIP[2]); }

  // The doorways (the street doors through the side wall, the house doors): their frames, behind him
  if (onScreen(v, X(DOOR) - 40, X(DOOR) + 80)) doorFrame(c, X(DOOR), DOOR_W, 200, '#7F1D1D');
  if (onScreen(v, X(HOUSE_DOOR) - 40, X(HOUSE_DOOR) + 80)) {
    doorFrame(c, X(HOUSE_DOOR), HOUSE_DOOR_W, 200, '#3F1220');
    hungBoard(c, X(HOUSE_DOOR) + 15, Y(300), Y(250), done ? ['THE HOUSE', 'SHOW OVER'] : ['THE HOUSE', 'SHOW IN PROGRESS'], LOOKS.land(1), '#1E3A8A');
  }
  if (onScreen(v, X(2800), x1 + 200)) hungBoard(c, X(2935), Y(330), Y(260), ['EXIT', 'HELICOPTER RIDES', 'ACROSS THE WORLD'], LOOKS.land(1), '#15803D');

  // THE STAGE: the set on the turntable, the troupe, the curtain, the arch, the clock
  if (onScreen(v, X(SA) - 60, X(SB) + 140)) drawStage(c, state, T);
};

/** A stretch of the inside, clipped to what's on screen. */
const seg = (c: Ctx, a: number, b: number, x0: number, x1_: number, draw: () => void) => {
  if (b <= x0 || a >= x1_) return;
  c.save(); c.beginPath(); c.rect(Math.max(a, x0), -1e5, Math.min(b, x1_) - Math.max(a, x0), 2e5); c.clip(); draw(); c.restore();
};
const chandelier = (c: Ctx, x: number, y: number, f: number) => {
  box(c, x - 26, y, 52, 6, '#CA8A04'); box(c, x - 16, y + 6, 32, 10, '#A16207');
  for (let k = 0; k < 5; k++) { box(c, x - 24 + k * 12, y - 6, 3, 6, '#FEF3C7'); box(c, x - 23 + k * 12, y + 14 + (k % 2) * 4, 2, 8 + ((f >> 4) + k) % 2, '#E0F2FE'); }
};
/** A doorway in the play plane: the jamb each side, the header over it (he walks through, in front of it). */
const doorFrame = (c: Ctx, x: number, w: number, h: number, col: string) => {
  const R = ramp6(hour(col));
  slab(c, x, GY - 520, w, 520 - h, R, false);
  box(c, x - 4, GY - h - 8, w + 8, 8, '#CA8A04');
  slab(c, x - 6, GY - h, 6, h, R, false); slab(c, x + w, GY - h, 6, h, R, false);
};

const drawLobby = (c: Ctx, state: GameState) => {
  const v = viewIn(state);
  // (the ticket booth, the concessions: set back, scenery)
  setBack(c, v, X(820), 150, 0.93, () => { wall(c, 0, 150, 150, '#B91C1C', '#FCD34D'); hole(c, 30, -120, 90, 50, true); box(c, -6, -40, 162, 40, dimmed('#7F1D1D')); });
  setBack(c, v, X(1000), 260, 0.93, () => { wall(c, 0, 260, 190, '#1E3A8A', '#DC2626'); box(c, 10, -90, 240, 90, dimmed('#F8FAFC')); for (let k = 0; k < 6; k++) box(c, 20 + k * 38, -120, 22, 26, dimmed(['#DC2626', '#FDE047', '#F8FAFC'][k % 3])); });
  if (onScreen(v, X(780), X(940))) board(c, X(895), GY - 196, ['TICKETS', 'FREE*', '*$189 PARK ADMISSION'], LOOKS.land(1), '#7F1D1D');
  if (onScreen(v, X(990), X(1280))) board(c, X(1130), GY - 238, ['CONCESSIONS: AMERICAN ONLY', 'FREEDOM FRIES $12', 'FREEDOM DOG $14', 'FREEDOM WATER $9'], LOOKS.land(1), '#1E3A8A');
  // (the posters on the wall, framed)
  const posters: [number, string[], string][] = [
    [1300, ['TONIGHT:', 'THE WHOLE WORLD'], '#7F1D1D'],
    [1390, ['8 COUNTRIES!', '0 PASSPORTS!'], '#1E3A8A'],
  ];
  for (const [x, l, bg] of posters) if (onScreen(v, X(x) - 60, X(x) + 60)) board(c, X(x), GY - 190, l, plain(1, 2, '#FDE68A', '#1C1917'), bg);
};

// ---------------------------------------------------------------------------------------------------------------
// The stage

const drawStage = (c: Ctx, state: GameState, T: Theater) => {
  const f = state.frame, done = showDone(state), a = X(SA) + 24, b = X(SB) - 24;
  // (the house dark behind the opening; the set for the showpiece on the turntable)
  box(c, a, TOP, b - a, FY - TOP, '#0F0A0E');
  if (T.curtain < 1) {
    if (T.set >= 0) drawSet(c, T.shows[T.set].id, a, b, f);
    else if (T.doneAtBuild) drawStruck(c, f);
    // (the troupe: the wrecks first, the living over them)
    if (T.set >= 0) {
      const sp = T.shows[T.set];
      for (const m of sp.members) if (m.dead) drawMember(c, m, f);
      for (const m of sp.members) if (!m.dead) drawMember(c, m, f);
    }
  }
  // (the curtain: red velvet in folds, a gold fringe)
  const bot = TOP + (FY - TOP) * T.curtain;
  if (T.curtain > 0.001) {
    for (let x = a; x < b; x += 16) { const k = ((x - a) / 16) % 2; box(c, x, TOP, 16, bot - TOP, k ? '#991B1B' : '#B91C1C'); box(c, x + (k ? 12 : 0), TOP, 4, bot - TOP, k ? '#7F1D1D' : '#DC2626'); }
    box(c, a, bot - 8, b - a, 8, '#CA8A04'); for (let x = a; x < b; x += 6) box(c, x, bot, 3, 4, '#A16207');
  }
  // (the valance: scallops under the arch)
  for (let x = a; x < b; x += 40) { c.fillStyle = '#7F1D1D'; c.beginPath(); c.ellipse(x + 20, TOP + 4, 22, 18, 0, 0, Math.PI); c.fill(); box(c, x + 18, TOP + 18, 4, 6, '#CA8A04'); }
  box(c, a, TOP - 4, b - a, 10, '#7F1D1D');
  // (the proscenium: gold pillars floor to arch, the arch band over the top)
  for (const px of [X(SA), X(SB) - 24]) { slab(c, px, TOP - 60, 24, FY - TOP + 60, ramp6(hour('#CA8A04')), false); box(c, px + 8, TOP - 40, 3, FY - TOP + 30, '#A16207'); }
  slab(c, X(SA), TOP - 70, X(SB) - X(SA), 64, ramp6(hour('#A16207')), false);
  box(c, X(SA), TOP - 70, X(SB) - X(SA), 4, '#FDE68A');
  // (the stage clock: hung off the arch, a big LED countdown; dark between showpieces)
  const cx = (X(SA) + X(SB)) / 2;
  box(c, cx - 1, TOP - 8, 2, 12, '#3F3F46');
  box(c, cx - 64, TOP + 4, 128, 38, INK); box(c, cx - 62, TOP + 6, 124, 34, '#0A0A0A');
  const lit = T.phase === 'play' || T.phase === 'rise' || T.phase === 'timeout';
  const secs = T.phase === 'timeout' ? 0 : Math.ceil(T.clock / 60), blink = T.phase === 'timeout' || (T.phase === 'play' && secs <= 5 && (f >> 4) % 2 === 0);
  sevenSeg(c, cx - 50, TOP + 10, `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`, lit && !blink ? (secs <= 5 ? '#F87171' : '#EF4444') : '#3F0D0D');
  // (the wing doors past the pillars: stage left shut once it's on; stage right shut till it's over)
  if (T.lockK > 0.01) { const h = (FY - TOP + 40) * T.lockK; slab(c, X(SA) - 30, FY - h, 30, h, ramp6(hour('#3F3F46')), false); }
  const open = done || T.phase === 'done';
  slab(c, X(SB), FY - 200, 26, 200, ramp6(hour(open ? '#14532D' : '#57534E')), false);
  if (!open) for (let k = 0; k < 4; k++) box(c, X(SB) + 4, FY - 180 + k * 44, 18, 3, '#27272A');
  if (state.camera.x + CANVAS_WIDTH > X(SB) - 10) hungBoard(c, X(SB) + 60, TOP - 6, FY - 230, open ? ['EXIT', 'THIS WAY'] : ['CAST ONLY'], LOOKS.land(1), open ? '#15803D' : '#7F1D1D');
  if (!open) slab(c, X(SB) + 26, FY - 200, 20, 200, ramp6(hour('#57534E')), false);
  void L; void R;
};

/** Seven-segment digits (the stage clock's LEDs). */
const SEG: Record<string, string> = { '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc', '5': 'afgcd', '6': 'afgedc', '7': 'abc', '8': 'abcdefg', '9': 'abfgcd' };
const sevenSeg = (c: Ctx, x: number, y: number, s: string, col: string) => {
  let cx = x;
  for (const ch of s) {
    if (ch === ':') { box(c, cx + 2, y + 6, 4, 4, col); box(c, cx + 2, y + 18, 4, 4, col); cx += 10; continue; }
    const on = SEG[ch] ?? '', w = 16, h = 26, t = 3;
    const segs: Record<string, [number, number, number, number]> = {
      a: [cx + t, y, w - 2 * t, t], b: [cx + w - t, y + t, t, h / 2 - t], c: [cx + w - t, y + h / 2, t, h / 2 - t],
      d: [cx + t, y + h - t, w - 2 * t, t], e: [cx, y + h / 2, t, h / 2 - t], f: [cx, y + t, t, h / 2 - t], g: [cx + t, y + h / 2 - 1, w - 2 * t, t],
    };
    for (const [k, r] of Object.entries(segs)) box(c, r[0], r[1], r[2], r[3], on.includes(k) ? col : '#1A0606');
    cx += w + 6;
  }
};

/** Each showpiece's painted set: a cutout flat on the turntable, a banner with its name hung off the fly bar. */
const drawSet = (c: Ctx, id: CultureId, a: number, b: number, f: number) => {
  const w = b - a, mid = (a + b) / 2, sky = TOP + 30;
  const flat = (cols: string[]) => { const h = FY - sky; cols.forEach((col, k) => box(c, a, sky + (h * k) / cols.length, w, Math.ceil(h / cols.length), dimmed(col))); };
  const hills = (col: string, n: number, h: number, base = FY - 20) => { c.fillStyle = dimmed(col); for (let k = 0; k <= n; k++) { c.beginPath(); c.ellipse(a + (w * k) / n, base, w / n * 0.8, h, 0, Math.PI, Math.PI * 2); c.fill(); } };
  switch (id) {
    case 'spain':
      flat(['#F97316', '#FB923C', '#FDBA74']);
      hills('#7C2D12', 3, 60);
      for (let k = 0; k < 14; k++) box(c, a + k * (w / 14), FY - 70, w / 14 - 2, 70, dimmed(k % 2 ? '#B91C1C' : '#DC2626'));
      box(c, a, FY - 74, w, 6, dimmed('#FDE047'));
      for (let k = 0; k < 30; k++) box(c, a + 10 + k * (w / 30), FY - 130 + (k % 3) * 6, 8, 10, dimmed('#3F1220'));
      break;
    case 'ireland':
      flat(['#60A5FA', '#93C5FD', '#BFDBFE']);
      for (const [r, col] of [[200, '#EF4444'], [186, '#F97316'], [172, '#FDE047'], [158, '#22C55E'], [144, '#3B82F6'], [130, '#8B5CF6']] as const) { c.strokeStyle = dimmed(col); c.lineWidth = 14; c.beginPath(); c.arc(mid + 120, FY - 40, r, Math.PI, Math.PI * 2); c.stroke(); }
      hills('#15803D', 3, 90); hills('#166534', 4, 50, FY);
      box(c, a + 80, FY - 150, 50, 110, dimmed('#78716C')); for (let k = 0; k < 4; k++) box(c, a + 80 + k * 14, FY - 160, 8, 10, dimmed('#78716C'));
      break;
    case 'egypt':
      flat(['#FDE68A', '#FCD34D', '#FBBF24']);
      for (const [px, s] of [[a + 140, 1], [a + 300, 1.4], [b - 160, 0.9]] as const) poly(c, [[px - 110 * s, FY - 20], [px, FY - 20 - 140 * s], [px + 110 * s, FY - 20]], dimmed('#D6B370'));
      hills('#EAB308', 4, 30, FY);
      box(c, b - 60, FY - 120, 8, 100, dimmed('#78350F')); for (let k = 0; k < 5; k++) poly(c, [[b - 56, FY - 120], [b - 56 + (k - 2) * 22, FY - 130 + Math.abs(k - 2) * 10], [b - 56 + (k - 2) * 16, FY - 112]], dimmed('#15803D'));
      break;
    case 'russia':
      flat(['#1E3A8A', '#1E40AF', '#3B82F6']);
      for (const [px, h, col] of [[a + 120, 170, '#DC2626'], [a + 230, 220, '#16A34A'], [a + 330, 150, '#2563EB'], [b - 150, 190, '#EAB308']] as const) {
        box(c, px - 22, FY - h, 44, h, dimmed('#F5F5F4'));
        c.fillStyle = dimmed(col); c.beginPath(); c.ellipse(px, FY - h - 14, 30, 26, 0, 0, Math.PI * 2); c.fill();
        poly(c, [[px - 6, FY - h - 36], [px, FY - h - 60], [px + 6, FY - h - 36]], dimmed(col));
        for (let k = 0; k < 3; k++) box(c, px - 18 + k * 14, FY - h + 30, 8, 14, dimmed('#1E3A8A'));
      }
      for (let k = 0; k < 40; k++) box(c, a + hash(k * 3.1) * w, sky + ((hash(k * 7.7) * (FY - sky) + f * 0.6) % (FY - sky)), 2, 2, '#E0F2FE');
      break;
    case 'netherlands':
      flat(['#7DD3FC', '#BAE6FD', '#E0F2FE']);
      for (let k = 0; k < 7; k++) { const px = a + 30 + k * 60; box(c, px, FY - 150, 50, 130, dimmed(['#B45309', '#7C2D12', '#1E3A8A'][k % 3])); poly(c, [[px, FY - 150], [px + 25, FY - 180], [px + 50, FY - 150]], dimmed('#7C2D12')); box(c, px + 18, FY - 120, 14, 18, dimmed('#FEF3C7')); }
      for (let r = 0; r < 4; r++) for (let k = 0; k < 40; k++) box(c, a + k * (w / 40), FY - 18 - r * 6, 6, 5, dimmed(['#DC2626', '#FDE047', '#EC4899', '#F97316'][r]));
      break;
    case 'australia':
      flat(['#F97316', '#FB923C', '#FED7AA']);
      c.fillStyle = dimmed('#B45309'); c.beginPath(); c.ellipse(mid + 60, FY - 20, 230, 90, 0, Math.PI, Math.PI * 2); c.fill();
      box(c, mid - 170, FY - 20, 460, 20, dimmed('#9A3412'));
      c.fillStyle = dimmed('#FDE047'); c.beginPath(); c.arc(a + 90, sky + 70, 34, 0, Math.PI * 2); c.fill();
      box(c, b - 80, FY - 150, 10, 130, dimmed('#E7E5E4')); c.fillStyle = dimmed('#65A30D'); c.beginPath(); c.ellipse(b - 76, FY - 160, 50, 26, 0, 0, Math.PI * 2); c.fill();
      // (the boxing ring's ropes at the front: the kangaroo's)
      for (let k = 0; k < 3; k++) box(c, a + 20, FY - 40 - k * 18, w - 40, 2, dimmed('#F8FAFC'));
      break;
    case 'greece':
      flat(['#1D4ED8', '#3B82F6', '#93C5FD']);
      poly(c, [[mid - 220, FY - 200], [mid, FY - 250], [mid + 220, FY - 200]], dimmed('#F5F5F4'));
      for (let k = 0; k < 8; k++) { const px = mid - 200 + k * 57; if (k === 5) { box(c, px, FY - 90, 22, 70, dimmed('#E7E5E4')); continue; } box(c, px, FY - 196, 22, 176, dimmed('#F5F5F4')); for (let s = 0; s < 3; s++) box(c, px + 4 + s * 6, FY - 190, 2, 166, dimmed('#D6D3D1')); }
      box(c, mid - 230, FY - 24, 460, 8, dimmed('#E7E5E4'));
      break;
    case 'brazil':
      flat(['#0EA5E9', '#38BDF8', '#7DD3FC']);
      c.fillStyle = dimmed('#15803D'); c.beginPath(); c.ellipse(a + 150, FY - 20, 100, 200, 0, Math.PI, Math.PI * 2); c.fill();
      c.fillStyle = dimmed('#166534'); c.beginPath(); c.ellipse(a + 300, FY - 20, 70, 120, 0, Math.PI, Math.PI * 2); c.fill();
      for (let k = 0; k < 4; k++) { const sx = a + 40 + k * (w / 4); for (let j = 0; j < 10; j++) { const t = j / 9; box(c, sx + t * (w / 4), sky + 20 + Math.sin(t * Math.PI) * 30, 6, 8, dimmed(['#FDE047', '#16A34A', '#2563EB', '#DB2777'][j % 4])); } }
      break;
  }
  // (the flat's cut edge along the top: plywood)
  for (let x = a; x < b; x += 12) box(c, x, sky - 4 + ((x * 7) % 5), 12, 4, '#0F0A0E');
  hungBoard(c, mid, TOP + 4, sky + 26, [CULTURE_NAME[id]], LOOKS.land(2), '#1E3A8A');
};

/** After the show (a revisit): the stage struck, the wrecks shoved in a pile upstage, in their fluid. */
const drawStruck = (c: Ctx, f: number) => {
  const cx = MID + 160;
  c.fillStyle = 'rgba(127, 29, 29, 0.85)'; c.beginPath(); c.ellipse(cx, FY - 2, 190, 8, 0, 0, Math.PI * 2); c.fill();
  const bits: [number, number, number, number, string][] = [
    [-150, -40, 90, 40, '#2B1B14'], [-60, -30, 60, 30, '#3F6212'], [0, -56, 70, 56, '#D6B370'], [60, -36, 50, 36, '#6B4423'], [100, -70, 40, 70, '#7C2D12'],
    [-120, -74, 40, 34, '#DC2626'], [-30, -88, 30, 30, '#CA8A04'], [30, -90, 26, 34, '#15803D'],
  ];
  for (const [x, y, w, h, col] of bits) { box(c, cx + x - 1, FY + y - 1, w + 2, h + 2, INK); box(c, cx + x, FY + y, w, h, mix(col, '#000000', 0.4)); }
  poly(c, [[cx - 10, FY - 92], [cx - 18, FY - 116], [cx - 2, FY - 100]], '#F5F5DC');
  c.strokeStyle = '#4B5563'; c.lineWidth = 3; c.beginPath(); c.arc(cx + 150, FY - 22, 22, 0, Math.PI * 2); c.stroke();
  if ((f >> 3) % 7 === 0) box(c, cx + 20 + ((f * 13) % 80), FY - 60 - ((f * 7) % 30), 3, 3, '#FDE047');
};

// ---------------------------------------------------------------------------------------------------------------
// In front of him

export const drawTheaterFront = (c: Ctx, state: GameState) => {
  const T = theaterOf(state), cam = state.camera, f = state.frame, him = himOf(state);
  // (what's been thrown)
  for (const s of T.shots) {
    if (s.kind === 'coin') { const w = Math.max(1, Math.abs(Math.cos(s.spin)) * 6); box(c, s.x - w / 2 - 1, s.y - 4, w + 2, 8, INK); box(c, s.x - w / 2, s.y - 3, w, 6, '#FCD34D'); }
    else if (s.kind === 'clog') { c.save(); c.translate(s.x, s.y); c.rotate(s.spin); box(c, -9, -4, 18, 8, INK); box(c, -8, -3, 16, 6, '#D97706'); box(c, 2, -3, 6, 3, '#92400E'); c.restore(); }
    else { c.save(); c.translate(s.x, s.y); c.rotate(s.spin * 1.5); poly(c, [[-12, 4], [0, -3], [12, 4], [10, 7], [0, 2], [-10, 7]], '#92400E'); c.restore(); }
  }
  // (the sphinx's beam: red, glowing, down to the floor)
  if (T.beam) {
    const B = T.beam;
    c.save(); c.globalCompositeOperation = 'lighter';
    c.strokeStyle = 'rgba(248, 113, 113, 0.35)'; c.lineWidth = 12; c.beginPath(); c.moveTo(B.x0, B.y0); c.lineTo(B.x1, B.y1); c.stroke();
    c.strokeStyle = 'rgba(254, 226, 226, 0.95)'; c.lineWidth = 3; c.beginPath(); c.moveTo(B.x0, B.y0); c.lineTo(B.x1, B.y1); c.stroke();
    c.fillStyle = 'rgba(248, 113, 113, 0.5)'; c.beginPath(); c.ellipse(B.x1, B.y1 - 2, 22, 6, 0, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  // (the spotlight on him: the volunteer, the curtain call)
  if (T.spot > 0.01) {
    c.save(); c.globalCompositeOperation = 'lighter';
    c.fillStyle = `rgba(254, 243, 199, ${0.14 * T.spot})`;
    c.beginPath(); c.moveTo(him.x - 20, cam.y - 20); c.lineTo(him.x + 20, cam.y - 20); c.lineTo(him.x + 70, him.feet); c.lineTo(him.x - 70, him.feet); c.closePath(); c.fill();
    c.fillStyle = `rgba(254, 243, 199, ${0.25 * T.spot})`; c.beginPath(); c.ellipse(him.x, him.feet - 2, 70, 10, 0, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  for (const k of T.confetti) box(c, k.x, k.y, 3, 4 - ((k.t >> 2) % 2) * 2, k.col);
  // (the theater's side wall, its outside face over the lobby, while he's out on the promenade: gone as he goes in)
  const out = Math.max(0, Math.min(1, (DOOR + 40 - rx(state)) / 80));
  if (out > 0 && cam.x + CANVAS_WIDTH > X(DOOR)) {
    c.save(); c.globalAlpha = out;
    const R = ramp6(hour('#7F1D1D'));
    slab(c, X(DOOR), cam.y - 60, X(HOUSE_DOOR + 300) - X(DOOR), GY - cam.y + 60, R, false);
    for (let y = GY - 20; y > cam.y - 60; y -= 20) for (let x = X(DOOR) + ((y / 20) % 2) * 20; x < X(HOUSE_DOOR + 300); x += 40) box(c, x, y, 1, 20, R[1]);
    for (let y = GY; y > cam.y - 60; y -= 20) box(c, X(DOOR), y, X(HOUSE_DOOR + 300) - X(DOOR), 1, R[1]);
    box(c, X(DOOR), GY - 200, DOOR_W, 200, '#1C1014'); box(c, X(DOOR) - 4, GY - 208, DOOR_W + 8, 8, '#CA8A04');
    for (let k = 0; k < 3; k++) { box(c, X(DOOR + 160 + k * 200), GY - 300, 90, 120, '#1C1014'); box(c, X(DOOR + 162 + k * 200), GY - 298, 86, 116, mix('#FDE68A', '#7F1D1D', 0.5)); }
    c.restore();
  }
  // THE CROWD in the seats (nearer than him: in front of it all)
  drawCrowd(c, state, T);
  // Who's saying what: the narrator up top, somebody in the seats over them, the house chanting
  if (T.pa) saidOver(c, T.pa.text, cam.x + CANVAS_WIDTH / 2 + 130, cam.y + 132, '#FDE68A', 320);
  if (T.guest) saidOver(c, T.guest.s.text, T.guest.x, cam.y + CANVAS_HEIGHT - 104, '#F5F5F4', 240);
  if (T.chant) saidOver(c, T.chant.text, cam.x + CANVAS_WIDTH / 2, cam.y + CANVAS_HEIGHT - 74, '#FCA5A5', 300);
  void f;
};

/** The crowd: two rows of heads and shoulders, in silhouette against the stage's light, nearer than the stage (they
 *  slide past faster than the world: the back row a bit, the front row more). */
const drawCrowd = (c: Ctx, state: GameState, T: Theater) => {
  const cam = state.camera, cx = cam.x + CANVAS_WIDTH / 2, f = state.frame;
  const left = X(HOUSE_DOOR + HOUSE_DOOR_W + 6);
  if (cam.x + CANVAS_WIDTH < left - 200 || cam.x > X(WING_B) + 400) return;
  c.save();
  c.beginPath(); c.rect(left - cam.x > 0 ? left : cam.x, cam.y - 10, CANVAS_WIDTH + 20, CANVAS_HEIGHT + 20); c.clip();
  const empty = T.doneAtBuild, lit = showOn(T) && T.curtain < 0.9 ? 1 : 0.6;
  const rows = [{ k: 1.16, y: 520, sp: 30, r: 11, seat: '#3F0D17' }, { k: 1.38, y: 566, sp: 40, r: 15, seat: '#4C0F1C' }];
  rows.forEach((row, ri) => {
    const a = X(HOUSE_DOOR) - 200, b = X(WING_B) + 300;
    for (let i = 0, wx = a; wx < b; i++, wx += row.sp) {
      const sx = cx + (wx - cx) * row.k;
      if (sx < cam.x - 40 || sx > cam.x + CANVAS_WIDTH + 40) continue;
      const sy = cam.y + row.y, seed = hash(i * 3.7 + ri * 101);
      // (the seat backs)
      box(c, sx - row.sp / 2 + 2, sy + row.r * 0.6, row.sp - 4, 40, row.seat); box(c, sx - row.sp / 2 + 2, sy + row.r * 0.6, row.sp - 4, 2, '#7F1D1D');
      if (empty) {
        // (left behind: a popcorn tub, a phone)
        if (seed < 0.12) { box(c, sx - 4, sy + row.r * 0.6 - 8, 8, 8, '#DC2626'); box(c, sx - 4, sy + row.r * 0.6 - 10, 8, 3, '#FEF3C7'); }
        continue;
      }
      if (seed > 0.93) continue;
      person(c, sx, sy, row.r, seed, i + ri * 7, T, f, lit);
    }
  });
  c.restore();
};

const SIL = '#07060A';
const person = (c: Ctx, x: number, y: number, r: number, seed: number, i: number, T: Theater, f: number, lit: number) => {
  const m = T.mood, kid = seed < 0.18, rr = kid ? r * 0.8 : r;
  let bob = Math.sin(f * 0.05 + i) * 1.2, up = 0;
  if (m === 'cheer') bob = -Math.abs(Math.sin(f * 0.25 + i * 0.7)) * 6;
  else if (m === 'laugh') bob = ((f + i) >> 1) % 2 ? -2 : 1;
  else if (m === 'gasp') bob = -3;
  else if (m === 'ovation') { up = -20; bob = -Math.abs(Math.sin(f * 0.2 + i)) * 4; }
  const hy = y + bob + up + (kid ? 6 : 0);
  // (shoulders, the head; hair or a hat by seed)
  c.fillStyle = SIL; c.beginPath(); c.ellipse(x, hy + rr * 1.5, rr * 1.6, rr * 0.9, 0, Math.PI, Math.PI * 2); c.fill();
  box(c, x - rr * 1.6, hy + rr * 1.5, rr * 3.2, 60, SIL);
  c.beginPath(); c.arc(x, hy, rr, 0, Math.PI * 2); c.fill();
  if (seed > 0.7) { c.beginPath(); c.ellipse(x, hy + rr * 0.4, rr * 1.2, rr * 1.1, 0, Math.PI, Math.PI * 2); c.fill(); }
  else if (seed > 0.55) { box(c, x - rr * 1.2, hy - rr * 0.5, rr * 2.4, 3, SIL); box(c, x - rr * 0.8, hy - rr * 1.2, rr * 1.6, rr * 0.8, SIL); }
  // (the stage's light on the tops of them)
  const rim = mix('#3A2420', '#F59E0B', 0.25 * lit);
  c.strokeStyle = rim; c.lineWidth = 1.5; c.beginPath(); c.arc(x, hy, rr, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
  // (arms: up cheering, thumbs down booing, clapping on their feet)
  const arm = (x0: number, y0: number, x1: number, y1: number) => { c.strokeStyle = SIL; c.lineWidth = rr * 0.45; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
  if (m === 'cheer' && seed < 0.75) { arm(x - rr, hy + rr, x - rr * 1.6, hy - rr * 1.8); arm(x + rr, hy + rr, x + rr * 1.6, hy - rr * 1.8 + ((f + i) % 6)); }
  else if (m === 'boo' && seed < 0.6) { arm(x + rr, hy + rr * 1.2, x + rr * 1.8, hy + rr * 0.4); box(c, x + rr * 1.6, hy + rr * 0.4, 3, 6, SIL); }
  else if (m === 'ovation') { const k = ((f >> 2) + i) % 2 ? 2 : -2; arm(x - rr, hy + rr * 1.2, x + k, hy + rr * 0.2); arm(x + rr, hy + rr * 1.2, x - k, hy + rr * 0.2); }
  // (a phone held up, its screen lit)
  if (hash(seed * 91.3 + 2) < T.phones * 0.55) {
    const px = x + (seed > 0.5 ? rr : -rr) * 0.8, py = hy - rr * 2.2 + Math.sin(f * 0.03 + i) * 1.5;
    arm(x + (seed > 0.5 ? rr : -rr) * 0.6, hy + rr, px, py + 6);
    box(c, px - 4, py - 6, 8, 12, '#111827'); box(c, px - 3, py - 5, 6, 10, '#BFDBFE');
    if (((f + i * 13) % 97) === 0) { c.fillStyle = 'rgba(255, 255, 255, 0.6)'; c.beginPath(); c.arc(px, py, 10, 0, Math.PI * 2); c.fill(); }
  }
};

void POT_H; void Y; void LOBBY_A; void STEPS_A;
