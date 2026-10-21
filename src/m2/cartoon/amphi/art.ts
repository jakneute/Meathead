// STUPID DAD LIVE!, painted (the SNES pass). THE UBX AMPHITHEATER: a concrete bowl dug into the hill, aluminum
// bleachers stepping down it, a band shell over the stage at its foot, sad and faded. All of it to the one eye (the
// middle of the screen: studio/art.ts's way): the far off in far.ts (cached per hour); along the bowl's far rim the back
// of house (rim.ts: restrooms, port-a-johns, the delay towers, the FUNNEL CAKE trailer, the SUMMER '96 billboard, HONK's
// RV backstage) on the grass bank; the floors (the concourse's slabs, every bleacher row's aluminum planks and its
// concrete riser lettered A to L, the aisle's half steps with their yellow noses, the pit, the stage's deck) running
// back from the play plane to the bowl's far side; the light masts and the half-dead string lights between them; the
// band shell, the set and its furniture, the family and him (stage.ts, dad.ts, family.ts) each at their own depth; back
// to front, nothing deeper drawn over anything nearer, a floor above the eye never drawn (its underside), culled by
// where things land on screen.
//
// On the play plane, inked, everything he stands on lit along its top: the concourse, the aisle steps, the pit, the
// stage steps, the deck. The ticket booth (WINDOW CLOSED) and its turnstiles; THE MARQUEE on its two striped posts (the
// board sun-faded, the dad off the poster, LIVE! in bulbs, HONK AZORIA!, NO OUTSIDE BEER zip-tied under it, its bulbs
// chasing, some dead); the BEER GARDEN's stand (plywood, the green and white awning, the menu, the taps, the cups, the
// tip jar, the bored vendor, the neon BEER buzzing with a dead E); the high-top and its two regulars; the trash can of
// empties; the crowd (eight people for a few hundred seats); the empty front row (one chair RESERVED); the CAST ONLY
// rope on its brass stanchions; the guard.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { signText } from '../../signLetters';
import { stamp } from '../../../m1/game/render/stamp';
import { timeOfDay } from '../../timeOfDay';
import { bodyOf, torso, arm as cArm, headShape, faceOn, hairTop, hairBack, whiskers, glasses, limb as cLimb, shoe, pickOf, type Body } from '../../spooky/costume';
import { dadArt } from '../bigkid/art';
import {
  X, x1, TOP_Y, PIT_Y, STAGE_Y, AISLE, ROWS, ROW_W, ROW_RISE, STEPS, DECK_A, treadAt, D_FAR, D_SHELL, D_SET,
  MARQUEE, STAND, HIGHTOP, POLES, CROWD, SLEEPER, FRONT_ROW, RESERVED, GUARD_X, SHELL, SET, TV, MOM, GRAMPS, SIS,
  BOY_TRACK, ARENA, FRIDGE, type Fan,
} from './layout';
import { drawDad, drawCouch, can, DAD_K } from './dad';
import { drawSideWall, drawFridge, drawMallet } from './fightArt';
import { drawMom, drawGramps, drawSis, drawBoy } from './family';
import { drawGuard, type GuardPose } from './guard';
import type { StageLook } from './show';
import { drawRim, BANK_Y } from './rim';
import { drawShell, drawFlown, drawBanner, drawSetWall, drawSwingDoor, drawLaughHorn, drawTV, drawRug } from './stage';
import {
  box, mix, hash, checker, hour, dimmed, INK, NR, DR, r6, CONC, ALU, DECK, STEEL, BRASS, RED, NAVY, PURP, AWNG, GRASS,
  HEDGE, PLY, VELV, SHOWL, small, tiny, stencil, bulb, deadBulb, streaks, peel, rustRun, gum, crack, cupAt, deadCan,
  shadowAt, lattice, tube, type Ctx,
} from './mats';

// ---------------------------------------------------------------------------------------------------------------
// The eye

type P = { x: number; y: number };
const eyeOf = (state: GameState): P => ({ x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT / 2 });
const proj = (E: P, x: number, y: number, s: number): P => ({ x: E.x + (x - E.x) * s, y: E.y + (y - E.y) * s });
const atDepth = (c: Ctx, E: P, s: number, fn: () => void) => { c.save(); c.translate(E.x, E.y); c.scale(s, s); c.translate(-E.x, -E.y); fn(); c.restore(); };
const seen = (state: GameState, E: P, xa: number, xb: number, s: number, m = 60) => { const a = proj(E, xa, 0, s).x, b = proj(E, xb, 0, s).x; return b > state.camera.x - m && a < state.camera.x + CANVAS_WIDTH + m; };
const quad = (c: Ctx, pts: P[], fill: string | CanvasPattern) => { c.beginPath(); c.moveTo(pts[0].x, pts[0].y); for (const p of pts.slice(1)) c.lineTo(p.x, p.y); c.closePath(); c.fillStyle = fill; c.fill(); };
/** A floor's strip (world x a..b at y) from depth d0 back to d1 (only from above: a floor over the eye isn't seen). */
const floor = (c: Ctx, E: P, a: number, b: number, y: number, d0: number, d1: number, fill: string) => { if (E.y < y - 1) quad(c, [proj(E, a, y, d0), proj(E, b, y, d0), proj(E, b, y, d1), proj(E, a, y, d1)], fill); };
/** A floor in bands going back (lightest at the front), the seams between dithered. */
const floorBands = (c: Ctx, E: P, a: number, b: number, y: number, d0: number, d1: number, cols: string[]) => {
  if (E.y >= y - 1) return;
  const n = cols.length;
  for (let i = 0; i < n; i++) floor(c, E, a, b, y, d0 - ((d0 - d1) * i) / n, d0 - ((d0 - d1) * (i + 1)) / n, cols[i]);
};
/** A line on a floor along x (at depth d) or back (at world x). */
const along = (c: Ctx, E: P, a: number, b: number, y: number, d: number, col: string, w = 1) => { const p = proj(E, a, y, d), q = proj(E, b, y, d); c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke(); };
const back = (c: Ctx, E: P, x: number, y: number, d0: number, d1: number, col: string, w = 1) => { const p = proj(E, x, y, d0), q = proj(E, x, y, d1); c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke(); };
/** A wall face across depth at world x, from y0 up to y1 (a riser, the stage's front). */
const side = (c: Ctx, E: P, x: number, y0: number, y1: number, d0: number, d1: number, fill: string) => quad(c, [proj(E, x, y0, d0), proj(E, x, y1, d0), proj(E, x, y1, d1), proj(E, x, y0, d1)], fill);

const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');
const key = (k: string) => `ct-am-${k}-${timeOfDay().key}-${fontReady() ? 'f' : 'n'}`;
const lampsOn = () => timeOfDay().lamps > 0.3;

/** The aisle runs from the play plane back to here; the bleacher rows from here back to the far side. */
const D_AISLE = 0.94;
/** The light masts and the string lights between them stand here. */
const D_POLE = 0.72;

// ---------------------------------------------------------------------------------------------------------------
// The crowd: people sat on the bleachers facing the stage (right), the hip on the row at (0, 0), feet on the row below

const SHIRTS = ['#2563EB', '#DC2626', '#16A34A', '#F59E0B', '#7C3AED', '#0F766E', '#BE185D', '#57534E', '#F4F4F5'];
const PANTS = ['#1E3A8A', '#3F3F46', '#57534E', '#1F2937', '#78350F', '#6B7280'];
const fan = (g: Ctx, seed: number, what: Fan, f: number) => {
  const B = bodyOf(seed, 'stand', 0, what === 'knit' ? true : undefined), L = B.L;
  const shirt = pickOf(seed, 2, SHIRTS), pants = pickOf(seed, 3, PANTS);
  const sway = what === 'leaner' || what === 'finger' ? Math.sin(f * 0.03 + seed) * 0.06 : 0;
  // (a stadium cushion under some; a cooler by one; their shadow on the plank)
  shadowAt(g, -8, 1, 34, 0.3);
  if (seed % 3 === 0) { box(g, -8, -4, 24, 5, INK); box(g, -7, -3, 22, 3, '#1E3A8A'); box(g, -7, -3, 22, 1, '#3B5BB8'); }
  if (what === 'beer') { box(g, -24, -12, 16, 12, INK); box(g, -23, -11, 14, 10, '#DC2626'); box(g, -23, -11, 14, 3, '#F4F1E8'); box(g, -23, -8, 14, 1, '#991B1B'); }
  // (the legs: the thighs along the row, the shins down onto the row below)
  cLimb(g, 0, -2, 15, -3, B.legW, pants); cLimb(g, 15, -3, 17, ROW_RISE - 3, B.legW - 0.5, pants);
  shoe(g, 15, ROW_RISE, 'sneaker', pickOf(seed, 5, ['#F5F5F4', '#1C1917', '#7C2D12']), L.skin, true);
  g.save(); g.rotate(what === 'slump' ? 0.55 : sway); g.translate(0, -B.hipY);
  torso(g, B, shirt);
  // (the head: tipped back asleep, down passed out; the face as they are)
  const hb: Body = { ...B };
  g.save();
  if (what === 'asleep') { g.translate(B.hx, B.shY); g.rotate(-0.5); g.translate(-B.hx, -B.shY); }
  if (what === 'slump') { g.translate(B.hx, B.shY); g.rotate(0.5); g.translate(-B.hx, -B.shY); }
  hairBack(g, hb); headShape(g, hb, L.skin);
  const shut = what === 'asleep' || what === 'slump';
  faceOn(g, hb, { skin: L.skin, eyes: shut ? 'closed' : what === 'knit' ? 'droopy' : 'tired', mouth: what === 'asleep' ? 'o' : what === 'leaner' || what === 'finger' ? 'o' : 'flat', look: 1 });
  glasses(g, hb); whiskers(g, hb); hairTop(g, hb);
  if (what === 'hat') {
    // (the beer-can hat off the STUPID DAD STORE's shelf: the band, two cans, the straws down to his mouth)
    box(g, B.hx - 11, B.hy - 14, 22, 7, INK); box(g, B.hx - 10, B.hy - 13, 20, 5, '#DC2626'); box(g, B.hx - 10, B.hy - 13, 20, 1, '#F87171'); box(g, B.hx - 10, B.hy - 9, 20, 1, '#991B1B');
    for (const s of [-1, 1]) { const cx = B.hx + s * 10; box(g, cx - 4, B.hy - 21, 8, 12, INK); box(g, cx - 3, B.hy - 20, 6, 10, '#C8102E'); box(g, cx - 3, B.hy - 20, 2, 10, '#F25A6E'); box(g, cx - 3, B.hy - 17, 6, 3, '#F4F1E8'); box(g, cx - 3, B.hy - 21, 6, 1, '#C9CDD4'); }
    g.strokeStyle = '#F5F5F4'; g.lineWidth = 1; g.beginPath(); g.moveTo(B.hx + 10, B.hy - 9); g.quadraticCurveTo(B.hx + 15, B.hy + 2, B.hx + 6, B.hy + 6); g.moveTo(B.hx - 10, B.hy - 9); g.quadraticCurveTo(B.hx - 4, B.hy + 4, B.hx + 4, B.hy + 6); g.stroke();
  }
  g.restore();
  // (the arms, and what they've got)
  const sleeve = { sleeve: shirt, hand: L.skin };
  const sip = (f + seed * 37) % 300 < 50;
  switch (what) {
    case 'finger': {
      cArm(g, B, -1, 6, B.hipY - 4, sleeve);
      const fy = B.shY - 20 + Math.sin(f * 0.05 + seed) * 3;
      cArm(g, B, 1, 12, fy, sleeve);
      // (the #1 foam finger, stepped)
      box(g, 7, fy - 23, 12, 22, INK); box(g, 8, fy - 22, 10, 20, '#FDE047'); box(g, 8, fy - 22, 3, 20, '#FEF08A'); box(g, 15, fy - 22, 3, 20, '#EAB308');
      box(g, 10, fy - 32, 6, 11, INK); box(g, 11, fy - 31, 4, 10, '#FDE047'); box(g, 11, fy - 31, 1, 10, '#FEF08A');
      signText(g, '#1', 13, fy - 9, tiny('#1E3A8A'));
      break;
    }
    case 'beer': case 'leaner': {
      cArm(g, B, -1, 6, B.hipY - 4, sleeve);
      const up = what === 'leaner' ? [16, B.shY - 16] : sip ? [B.hx + 6, B.hy + 6] : [12, B.hipY - 10];
      cArm(g, B, 1, up[0], up[1], sleeve);
      cupAt(g, up[0], up[1], true);
      break;
    }
    case 'popcorn': {
      box(g, 3, B.hipY - 17, 14, 14, INK); for (let k = 0; k < 4; k++) box(g, 4 + k * 3, B.hipY - 16, 3, 12, k % 2 ? '#FFFFFF' : '#DC2626');
      for (let k = 0; k < 6; k++) { box(g, 4 + k * 2, B.hipY - 20 - (k % 2) * 2, 3, 3, '#FEF3C7'); box(g, 4 + k * 2, B.hipY - 20 - (k % 2) * 2, 1, 1, '#FFFFFF'); }
      cArm(g, B, -1, 6, B.hipY - 8, sleeve);
      cArm(g, B, 1, sip ? B.hx + 6 : 10, sip ? B.hy + 6 : B.hipY - 14, sleeve);
      break;
    }
    case 'knit': {
      cArm(g, B, -1, 8, B.hipY - 8, sleeve); cArm(g, B, 1, 13, B.hipY - 10 + ((f >> 3) % 2), sleeve);
      g.strokeStyle = '#A8A29E'; g.lineWidth = 1; g.beginPath(); g.moveTo(4, B.hipY - 14); g.lineTo(16, B.hipY - 4); g.moveTo(16, B.hipY - 14); g.lineTo(6, B.hipY - 3); g.stroke();
      box(g, 5, B.hipY - 9, 10, 6, '#BE185D'); for (let k = 0; k < 4; k++) box(g, 5 + k * 2.5, B.hipY - 9 + (k % 2), 1, 5, '#E0548E');
      box(g, -12, -8, 10, 8, '#7C3AED'); box(g, -11, -7, 8, 2, '#A78BFA'); g.strokeStyle = '#BE185D'; g.beginPath(); g.moveTo(-6, -8); g.quadraticCurveTo(0, -18, 6, B.hipY - 6); g.stroke();
      break;
    }
    default: cArm(g, B, -1, 6, B.hipY - 4, sleeve); cArm(g, B, 1, 10, B.hipY - 4, sleeve);
  }
  g.restore();
  if (what === 'asleep') for (let k = 0; k < 3; k++) { const u = ((f * 0.5 + k * 30) % 90) / 90; g.globalAlpha = 1 - u; const zx = B.hx - 8 + u * 10, zy = B.hy - B.hipY - 16 - u * 24, s = 3 + k; box(g, zx, zy, s, 1, '#E5E7EB'); box(g, zx + s - 1, zy, 1, 1, '#E5E7EB'); box(g, zx, zy + s - 1, s, 1, '#E5E7EB'); for (let i = 0; i < s; i++) box(g, zx + s - 1 - i, zy + i, 1, 1, '#E5E7EB'); g.globalAlpha = 1; }
  if (what === 'slump') { box(g, 18, ROW_RISE - 2, 6, 2, '#E8A632'); box(g, 16, ROW_RISE - 3, 10, 1, '#F4D484'); deadCan(g, 26, ROW_RISE, seed); }
};

// ---------------------------------------------------------------------------------------------------------------
// The concourse: the ticket booth, the marquee, the BEER GARDEN, the high-top, the trash can

/** The ticket booth and its turnstiles (WINDOW CLOSED). */
const booth = (c: Ctx, x: number) => {
  stamp(c, key('booth'), x - 60, TOP_Y - 130, 160, 134, g => {
    const W = NR(r6('#3B5BB8')), Rd = NR(RED), S = NR(STEEL);
    box(g, x - 41, TOP_Y - 94, 82, 94, INK); box(g, x - 40, TOP_Y - 93, 80, 93, W[3]); box(g, x - 40, TOP_Y - 93, 5, 93, W[4]); box(g, x + 32, TOP_Y - 93, 8, 93, W[2]); checker(g, x + 30, TOP_Y - 93, 2, 93, W[2], 0, 1);
    for (let k = 0; k < 80; k += 10) box(g, x - 40 + k, TOP_Y - 30, 1, 30, W[1]);
    box(g, x - 48, TOP_Y - 104, 96, 12, INK); for (let k = 0; k < 94; k += 12) { box(g, x - 47 + k, TOP_Y - 103, 6, 10, Rd[3]); box(g, x - 41 + k, TOP_Y - 103, 6, 10, '#F4F1E8'); } box(g, x - 47, TOP_Y - 103, 94, 1, '#FFFFFF');
    box(g, x - 36, TOP_Y - 126, 72, 20, INK); box(g, x - 35, TOP_Y - 125, 70, 18, Rd[3]); box(g, x - 35, TOP_Y - 125, 70, 2, Rd[5]);
    signText(g, 'TICKETS', x, TOP_Y - 112, SHOWL(1));
    box(g, x - 28, TOP_Y - 82, 56, 40, INK); box(g, x - 27, TOP_Y - 81, 54, 38, '#2A3240'); box(g, x - 27, TOP_Y - 81, 54, 6, '#4A5A6A'); box(g, x - 25, TOP_Y - 79, 10, 2, 'rgba(255,255,255,0.4)');
    box(g, x - 22, TOP_Y - 66, 44, 16, '#F4F1E8'); signText(g, 'WINDOW', x, TOP_Y - 60, tiny('#B91C1C')); signText(g, 'CLOSED', x, TOP_Y - 53, tiny('#B91C1C'));
    box(g, x - 30, TOP_Y - 42, 60, 4, INK); box(g, x - 29, TOP_Y - 41, 58, 2, S[4]);
    streaks(g, x - 38, TOP_Y - 92, 70, 50, 5, W[2], 4);
    // (the turnstiles: steel posts, the three arms)
    for (const tx of [x + 54, x + 84]) {
      box(g, tx - 4, TOP_Y - 34, 8, 34, INK); box(g, tx - 3, TOP_Y - 33, 6, 33, S[3]); box(g, tx - 3, TOP_Y - 33, 2, 33, S[5]);
      box(g, tx - 6, TOP_Y - 38, 12, 6, INK); box(g, tx - 5, TOP_Y - 37, 10, 4, S[2]);
      for (const [dx, dy] of [[-12, -2], [8, -8], [6, 6]] as const) { g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(tx, TOP_Y - 34); g.lineTo(tx + dx, TOP_Y - 34 + dy); g.stroke(); g.strokeStyle = S[4]; g.lineWidth = 1; g.stroke(); }
    }
    shadowAt(g, x - 44, TOP_Y, 140, 0.3);
  });
};

/** The marquee at the gate: a big board on two striped steel posts, its bulbs chasing round it (some dead). */
const MQ = { w: 344, h: 200, top: TOP_Y - 336 };
const marquee = (c: Ctx, f: number) => {
  const cx = X(MARQUEE), { w, h, top } = MQ;
  c.save(); c.translate(cx, 0);
  stamp(c, key('marquee2'), -w / 2 - 24, top - 24, w + 48, TOP_Y - top + 28, g => {
    const T = (col: string) => hour(col, 0.1), S = NR(STEEL), Pp = NR(PURP), Nv = NR(NAVY);
    // (the posts: steel, blue and yellow barber stripes peeling, rust at the feet, the base plates bolted down)
    for (const s of [-1, 1]) {
      const px = s * (w / 2 - 40);
      box(g, px - 10, top + h - 10, 20, TOP_Y - top - h + 10, INK); box(g, px - 9, top + h - 10, 18, TOP_Y - top - h + 10, Nv[3]);
      for (let y = top + h; y < TOP_Y - 8; y += 24) { g.fillStyle = T('#E8B424'); g.beginPath(); g.moveTo(px - 9, y); g.lineTo(px + 9, y - 8); g.lineTo(px + 9, y + 2); g.lineTo(px - 9, y + 10); g.closePath(); g.fill(); }
      box(g, px - 9, top + h - 10, 4, TOP_Y - top - h + 10, 'rgba(255,255,255,0.22)'); box(g, px + 4, top + h - 10, 5, TOP_Y - top - h + 10, 'rgba(10,6,30,0.28)');
      peel(g, px - 8, top + h + 40, 16, 80, s * 7 + 3, Nv[1], INK, Nv[5], 3);
      rustRun(g, px - 4, TOP_Y - 26, 18, NR(['#3A1606', '#5E260C', '#8A3A14', '#B4561E', '#D47C3E', '#F0AE7A']));
      box(g, px - 16, TOP_Y - 6, 32, 6, INK); box(g, px - 15, TOP_Y - 5, 30, 4, S[3]); box(g, px - 15, TOP_Y - 5, 30, 1, S[5]); box(g, px - 12, TOP_Y - 4, 2, 2, S[1]); box(g, px + 10, TOP_Y - 4, 2, 2, S[1]);
    }
    // (the board: a steel box, riveted; the face purple gone pale up top in the sun, a sunburst behind him)
    box(g, -w / 2 - 8, top - 8, w + 16, h + 16, INK); box(g, -w / 2 - 7, top - 7, w + 14, h + 14, S[2]); box(g, -w / 2 - 7, top - 7, w + 14, 2, S[4]); box(g, -w / 2 - 7, top + h + 5, w + 14, 2, S[0]);
    for (let k = 0; k < 18; k++) { box(g, -w / 2 - 5 + k * ((w + 10) / 17), top - 5, 2, 2, S[5]); box(g, -w / 2 - 5 + k * ((w + 10) / 17), top + h + 3, 2, 2, S[1]); }
    box(g, -w / 2, top, w, h, Pp[3]);
    g.save(); g.beginPath(); g.rect(-w / 2, top, w, h); g.clip();
    g.fillStyle = Pp[4]; for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; g.beginPath(); g.moveTo(-w / 2 + 70, top + h - 30); g.lineTo(-w / 2 + 70 + Math.cos(a) * 320, top + h - 30 + Math.sin(a) * 320); g.lineTo(-w / 2 + 70 + Math.cos(a + 0.22) * 320, top + h - 30 + Math.sin(a + 0.22) * 320); g.closePath(); g.fill(); }
    box(g, -w / 2, top, w, 30, mix(Pp[4], '#E8DCF0', 0.35)); checker(g, -w / 2, top + 30, w, 4, mix(Pp[4], '#E8DCF0', 0.35), 0, 1);
    dadArt(g, -w / 2 + 70, top + h - 4, 1.35, 0.12, '#7C3AED');
    streaks(g, -w / 2 + 4, top, w - 8, h * 0.7, 21, Pp[2], 8);
    g.restore();
    signText(g, 'THE UBX AMPHITHEATER PRESENTS', 60, top + 20, { sx: 1, sy: 1, bold: true, fill: T('#FDE68A'), ink: T(INK) });
    signText(g, 'STUPID DAD', 60, top + 52, SHOWL(2, T));
    signText(g, 'THE ORIGINAL VOICE OF', 60, top + 114, { sx: 1, sy: 1, fill: T('#FFFFFF'), ink: T(INK) });
    signText(g, 'STUPID DAD, IN THE FLESH', 60, top + 126, { sx: 1, sy: 1, fill: T('#FFFFFF'), ink: T(INK) });
    signText(g, 'HONK AZORIA!', 60, top + 146, { sx: 1, sy: 2, bold: true, fill: [T('#FFFFFF'), T('#FDE047')], dither: true, ink: T(INK), shadow: T('#3B0764'), drop: 1 });
    box(g, -w / 2, top + h - 30, w, 26, Nv[3]); box(g, -w / 2, top + h - 30, w, 2, Nv[5]); box(g, -w / 2, top + h - 6, w, 2, Nv[1]);
    signText(g, 'SHOWS AT 11, 1, 3, 5 AND 7', 0, top + h - 12, { sx: 1, sy: 1, bold: true, fill: T('#FDE047'), ink: T(INK) });
    // (the vinyl banner zip-tied on under it, a corner come loose and curling)
    g.fillStyle = INK; g.beginPath(); g.moveTo(-122, top + h + 10); g.lineTo(122, top + h + 10); g.lineTo(122, top + h + 30); g.lineTo(110, top + h + 38); g.lineTo(-122, top + h + 34); g.closePath(); g.fill();
    g.fillStyle = T('#F4F4F0'); g.beginPath(); g.moveTo(-120, top + h + 12); g.lineTo(120, top + h + 12); g.lineTo(120, top + h + 28); g.lineTo(109, top + h + 35); g.lineTo(-120, top + h + 32); g.closePath(); g.fill();
    box(g, -120, top + h + 12, 240, 2, T('#FFFFFF')); box(g, -120, top + h + 29, 228, 2, T('#D8D8D0')); g.fillStyle = T('#C8C8C0'); g.beginPath(); g.moveTo(120, top + h + 28); g.lineTo(109, top + h + 35); g.lineTo(112, top + h + 26); g.closePath(); g.fill();
    for (const s of [-1, 1]) { box(g, s * 114 - 1, top + h + 4, 2, 10, INK); box(g, s * 114 - 2, top + h + 10, 4, 3, T('#1A1A1A')); }
    signText(g, 'NO OUTSIDE BEER', 0, top + h + 28, { sx: 1, sy: 2, bold: true, fill: T('#DC2626') });
  });
  // (the bulbs round the board and LIVE! in bulbs: chasing, the dead ones dead)
  const n = 36;
  for (let k = 0; k < n; k++) {
    const bx = -w / 2 + (k / (n - 1)) * w, st = (k + Math.floor(f / 5)) % 2 === 0 ? 'on' : 'off';
    bulb(c, Math.round(bx), top - 2, 2, deadBulb(k, 1) ? 'dead' : st);
    bulb(c, Math.round(bx), top + h + 2, 2, deadBulb(k, 2) ? 'dead' : st === 'on' ? 'off' : 'on');
  }
  signText(c, 'LIVE!', 60, top + 92, { sx: 3, sy: 3, bold: true, slant: 1, fill: hour('#FB7185', 0.1), ink: INK, shadow: '#3B0764', drop: 2, bulbs: { lit: (f >> 4) % 4 !== 0, col: '#FEF3C7', dim: '#9A3412' } });
  c.restore();
};

/** The BEER GARDEN's stand: a plywood hut, the green and white awning, the menu, the taps, the cups, the tip jar, the
 *  vendor behind the counter; the neon BEER in the window, buzzing, one E dead. */
const beerStand = (c: Ctx, f: number) => {
  const a = X(STAND.a), w = STAND.b - STAND.a, top = TOP_Y - 190;
  c.save(); c.translate(a, 0);
  stamp(c, key('stand2'), -16, top - 76, w + 32, TOP_Y - top + 80, g => {
    const P = DR(PLY), Aw = DR(AWNG), Nv = DR(NAVY), S = DR(STEEL), T = dimmed;
    // (the hut: plywood sheets, battens over the seams, streaks; the back counter dark inside)
    box(g, -1, top - 1, w + 2, TOP_Y - top + 1, INK); box(g, 0, top, w, TOP_Y - top, P[3]);
    for (let x = 0; x < w; x += 48) { box(g, x, top, 6, TOP_Y - top, P[4]); box(g, x + 5, top, 1, TOP_Y - top, P[1]); }
    box(g, w - 10, top, 10, TOP_Y - top, P[2]); checker(g, w - 12, top, 2, TOP_Y - top, P[2], 0, 1);
    streaks(g, 4, top + 30, w - 8, 120, 9, P[2], 7);
    // (the sign up top: navy, the show's lettering, a lamp on a gooseneck each end)
    box(g, 9, top - 67, w - 18, 50, INK); box(g, 10, top - 66, w - 20, 48, Nv[3]); box(g, 10, top - 66, w - 20, 3, Nv[5]); box(g, 10, top - 21, w - 20, 3, Nv[1]);
    signText(g, 'BEER GARDEN', w / 2, top - 34, SHOWL(2, T));
    for (const lx of [24, w - 24]) { g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(lx, top - 66); g.quadraticCurveTo(lx, top - 78, lx + (lx < w / 2 ? 10 : -10), top - 74); g.stroke(); box(g, lx + (lx < w / 2 ? 6 : -14), top - 76, 8, 5, S[2]); }
    // (the awning: green and white, scalloped, each stripe shaded round, its valance)
    const n = 12, sw = w / n;
    for (let k = 0; k < n; k++) {
      const x0 = k * sw, col = k % 2 ? T('#F4F1E8') : Aw[3], dk = k % 2 ? T('#C8C4B8') : Aw[1], lt = k % 2 ? T('#FFFFFF') : Aw[4];
      g.fillStyle = col; g.beginPath(); g.moveTo(x0, top); g.lineTo(x0 + sw, top); g.lineTo(x0 + sw - 4, top + 26); g.lineTo(x0 - 4, top + 26); g.closePath(); g.fill();
      box(g, x0, top, 2, 26, lt); box(g, x0 + sw - 4, top + 4, 3, 22, dk);
      g.fillStyle = col; g.beginPath(); g.arc(x0 + sw / 2 - 4, top + 26, sw / 2, 0, Math.PI); g.fill(); g.fillStyle = dk; g.beginPath(); g.arc(x0 + sw / 2 - 4, top + 26, sw / 2, Math.PI * 0.15, Math.PI * 0.85); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(x0 + sw / 2 - 4, top + 25, sw / 2 - 2, 0, Math.PI); g.fill();
    }
    g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(0, top, w, 26);
    // (the window: dark inside, the menu board, the taps, the coolers' glow)
    box(g, 16, top + 40, w - 32, 82, T('#14121A')); box(g, 16, top + 40, w - 32, 6, T('#2A2632'));
    box(g, 24, top + 48, 60, 30, T('#2A3A4A')); box(g, 24, top + 48, 60, 2, T('#5A7A8A')); for (let k = 0; k < 4; k++) { box(g, 28 + k * 14, top + 52, 10, 22, T(['#C8102E', '#E8B424', '#2A6AC8', '#C8102E'][k])); box(g, 28 + k * 14, top + 58, 10, 4, T('#F4F1E8')); }
    box(g, w - 130, top + 44, 108, 70, INK); box(g, w - 129, top + 45, 106, 68, T('#0F172A')); box(g, w - 129, top + 45, 106, 2, T('#2A3A5A'));
    const menu = (t: string, y: number, col = '#FFFFFF') => signText(g, t, w - 76, top + y, { sx: 1, sy: 1, fill: T(col) });
    menu('COLD BEER  12', 60, '#FDE047'); menu('LITE BEER  11', 72, '#FDE047'); menu('NACHOS  9', 84); menu('SODA  ASK', 96); menu('NO REFUNDS', 108, '#FCA5A5');
    box(g, w - 40, top + 50, 12, 6, T('#F4F1E8')); box(g, w - 40, top + 53, 12, 1, T('#B91C1C'));
    for (let k = 0; k < 4; k++) { const tx = 98 + k * 16; box(g, tx - 1, top + 82, 12, 10, INK); box(g, tx, top + 83, 10, 8, T(['#DC2626', '#2563EB', '#F59E0B', '#16A34A'][k])); box(g, tx, top + 83, 10, 2, T('#FFFFFF')); box(g, tx + 3, top + 92, 4, 18, S[4]); box(g, tx + 3, top + 92, 1, 18, S[5]); box(g, tx + 2, top + 108, 6, 3, S[2]); }
    // (the counter: plywood, a lip, a stack of cups, the tip jar with a dollar in it, a wet ring)
    box(g, -6, top + 120, w + 12, 12, INK); box(g, -5, top + 121, w + 10, 10, P[3]); box(g, -5, top + 121, w + 10, 2, P[5]); box(g, -5, top + 129, w + 10, 2, P[1]);
    box(g, 20, top + 98, 14, 22, INK); for (let k = 0; k < 6; k++) { box(g, 21, top + 99 + k * 3.5, 12, 3, T('#F4F4F5')); box(g, 21, top + 101 + k * 3.5, 12, 1, T('#C8CCD0')); }
    box(g, w - 42, top + 103, 18, 18, INK); box(g, w - 41, top + 104, 16, 16, T('#BAE6FD')); box(g, w - 41, top + 104, 3, 16, T('#E8F8FF')); box(g, w - 39, top + 113, 12, 5, T('#16A34A')); box(g, w - 39, top + 113, 12, 1, T('#4ADE80'));
    signText(g, 'TIPS', w - 33, top + 101, small(T('#FFFFFF'), INK));
    g.strokeStyle = T('#B88A4A'); g.lineWidth = 1; g.beginPath(); g.ellipse(60, top + 124, 6, 2, 0, 0, Math.PI * 2); g.stroke();
    // (under the counter: kegs, a hose, a mop bucket)
    for (let k = 0; k < 3; k++) { const kx = 40 + k * 34; box(g, kx - 1, TOP_Y - 34, 28, 34, INK); box(g, kx, TOP_Y - 33, 26, 33, S[3]); box(g, kx, TOP_Y - 33, 5, 33, S[5]); box(g, kx + 20, TOP_Y - 33, 6, 33, S[1]); box(g, kx, TOP_Y - 26, 26, 2, S[1]); box(g, kx, TOP_Y - 10, 26, 2, S[1]); }
    box(g, w - 60, TOP_Y - 20, 22, 20, INK); box(g, w - 59, TOP_Y - 19, 20, 19, T('#E8B424')); box(g, w - 59, TOP_Y - 19, 20, 3, T('#FDE68A'));
    shadowAt(g, -10, TOP_Y, w + 20, 0.3);
  });
  c.restore();
  // (the neon BEER in the window, buzzing; the second E dead)
  const nx = a + 64, ny = top + 66, flick = (f % 97) < 4 ? 0.3 : 1;
  c.globalAlpha = flick;
  signText(c, 'B', nx - 18, ny, { sx: 2, sy: 2, fill: '#FF5A8A', glow: '#FF2A6A' });
  signText(c, 'E', nx - 6, ny, { sx: 2, sy: 2, fill: '#FF5A8A', glow: '#FF2A6A' });
  c.globalAlpha = 1;
  signText(c, 'E', nx + 6, ny, { sx: 2, sy: 2, fill: '#5A2030' });
  c.globalAlpha = flick; signText(c, 'R', nx + 18, ny, { sx: 2, sy: 2, fill: '#FF5A8A', glow: '#FF2A6A' }); c.globalAlpha = 1;
  // (the vendor: bored, chin on a fist, behind the counter; a yawn now and then)
  c.save(); c.translate(a + 150, top + 120);
  const B = bodyOf(19, 'stand', 0), hb = { ...B };
  c.save(); c.translate(0, -B.shY - 24);
  torso(c, B, dimmed('#16A34A'), B.shY, B.shY + 18);
  const yawn = (f % 600) < 40;
  hairBack(c, hb); headShape(c, hb, dimmed(B.L.skin)); faceOn(c, hb, { skin: dimmed(B.L.skin), eyes: yawn ? 'closed' : 'tired', mouth: yawn ? 'o' : 'flat', look: -0.4 }); whiskers(c, hb); hairTop(c, hb);
  box(c, B.hx - 10, B.hy - 14, 20, 5, dimmed('#14532D')); box(c, B.hx - 10, B.hy - 14, 20, 1, dimmed('#4ADE80')); box(c, B.hx - 16, B.hy - 10, 8, 2, dimmed('#14532D'));
  cArm(c, B, 1, B.hx + 4, B.hy + 10, { sleeve: dimmed('#16A34A'), hand: dimmed(B.L.skin) });
  c.restore(); c.restore();
};

/** The high-top by the stand: two regulars stood at it with their beers, swaying; an ashtray, a pitcher. */
const highTop = (c: Ctx, f: number) => {
  const x = X(HIGHTOP), S = NR(STEEL);
  shadowAt(c, x - 30, TOP_Y, 60, 0.3);
  tube(c, x, TOP_Y - 46, TOP_Y - 2, 6, S);
  box(c, x - 17, TOP_Y - 3, 34, 3, INK); box(c, x - 16, TOP_Y - 3, 32, 2, S[3]);
  box(c, x - 24, TOP_Y - 50, 48, 7, INK); box(c, x - 23, TOP_Y - 49, 46, 5, S[3]); box(c, x - 23, TOP_Y - 49, 46, 1, S[5]); box(c, x - 23, TOP_Y - 45, 46, 1, S[1]);
  box(c, x - 6, TOP_Y - 62, 12, 13, INK); box(c, x - 5, TOP_Y - 61, 10, 12, '#E8EEF2'); box(c, x - 5, TOP_Y - 56, 10, 7, '#E8A632'); box(c, x - 5, TOP_Y - 56, 10, 1, '#FFF4D8'); box(c, x + 4, TOP_Y - 59, 3, 6, INK);
  box(c, x + 10, TOP_Y - 53, 8, 3, '#3A3A40'); box(c, x + 12, TOP_Y - 55, 4, 2, '#E8E4D8'); if ((f % 120) < 80) { c.globalAlpha = 0.5; box(c, x + 14, TOP_Y - 60 - ((f % 120) / 120) * 10, 2, 3, '#D8DCE8'); c.globalAlpha = 1; }
  for (const [dx, seed, woman] of [[-30, 41, false], [30, 52, true]] as const) {
    const B = bodyOf(seed, 'stand', Math.floor(f / 45) % 2, woman), L = B.L, sw = Math.sin(f * 0.025 + seed) * 0.05;
    c.save(); c.translate(x + dx, TOP_Y); if (dx > 0) c.scale(-1, 1); c.rotate(sw);
    const shirt = pickOf(seed, 2, SHIRTS);
    cLimb(c, -4, B.hipY, -4, -4, B.legW, pickOf(seed, 3, PANTS)); cLimb(c, 4, B.hipY, 5, -4, B.legW, pickOf(seed, 3, PANTS));
    shoe(c, -6, 0, 'shoe', '#1C1917', L.skin, false); shoe(c, 3, 0, 'shoe', '#1C1917', L.skin, true);
    torso(c, B, shirt);
    hairBack(c, B); headShape(c, B, L.skin); faceOn(c, B, { skin: L.skin, eyes: 'droopy', mouth: (f + seed * 9) % 400 < 30 ? 'o' : 'flat' }); whiskers(c, B); glasses(c, B); hairTop(c, B);
    cArm(c, B, -1, 2, B.hipY, { sleeve: shirt, hand: L.skin });
    cArm(c, B, 1, 16, -46, { sleeve: shirt, hand: L.skin });
    cupAt(c, 16, -46, true);
    c.restore();
  }
};

/** A trash can, overflowing with cans and cups: a green steel drum, UBX stenciled, the liner over its lip. */
const trash = (c: Ctx, x: number) => {
  stamp(c, key('trash'), x - 34, TOP_Y - 52, 68, 56, g => {
    const G = NR(r6('#1E7A44'));
    shadowAt(g, x - 20, TOP_Y, 40, 0.35);
    box(g, x - 15, TOP_Y - 36, 30, 36, INK); box(g, x - 14, TOP_Y - 35, 28, 35, G[3]); box(g, x - 14, TOP_Y - 35, 5, 35, G[4]); box(g, x + 7, TOP_Y - 35, 7, 35, G[2]); checker(g, x + 5, TOP_Y - 35, 2, 35, G[2], 0, 1);
    for (const y of [TOP_Y - 28, TOP_Y - 10]) { box(g, x - 14, y, 28, 2, G[1]); box(g, x - 14, y - 1, 28, 1, G[5]); }
    signText(g, 'UBX', x - 1, TOP_Y - 15, stencil(G[5]));
    box(g, x - 16, TOP_Y - 38, 32, 4, '#1A1A1E'); box(g, x - 16, TOP_Y - 38, 32, 1, '#4A4A54');
    for (let k = 0; k < 7; k++) { const dx = -12 + k * 4, h2 = 4 + (k % 3) * 4; if (k % 2) { box(g, x + dx - 1, TOP_Y - 38 - h2 - 1, 6, h2 + 1, INK); box(g, x + dx, TOP_Y - 38 - h2, 4, h2, '#C8102E'); box(g, x + dx, TOP_Y - 36 - h2, 4, 2, '#F4F1E8'); } else cupAt(g, x + dx + 2, TOP_Y - 37, false); }
    deadCan(g, x + 22, TOP_Y, 3); box(g, x - 30, TOP_Y - 3, 10, 3, '#F5F5F4'); box(g, x - 30, TOP_Y - 3, 10, 1, '#FFFFFF');
  });
};
/** A light mast: lattice steel up to a bank of floodlights (two of them dead), a cage, the ladder. */
const pole = (c: Ctx, x: number, footY: number, cleared: boolean) => {
  const S = DR(STEEL), on = lampsOn() && !cleared;
  lattice(c, x, footY - 420, footY, 10, S);
  box(c, x - 30, footY - 452, 60, 32, INK); box(c, x - 29, footY - 451, 58, 30, S[2]); box(c, x - 29, footY - 451, 58, 1, S[4]);
  for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) {
    const lx = x - 26 + k * 13, ly = footY - 448 + r * 14, dead = (r * 4 + k) === 2 || (r * 4 + k) === 7;
    box(c, lx, ly, 11, 11, INK); box(c, lx + 1, ly + 1, 9, 9, dead ? dimmed('#3A3A40') : on ? '#FFF6D8' : dimmed('#D8DCE4')); if (!dead) box(c, lx + 1, ly + 1, 4, 4, on ? '#FFFFFF' : dimmed('#F4F4F8'));
  }
  box(c, x - 32, footY - 420, 64, 3, S[1]);
  for (let y = footY - 410; y < footY - 20; y += 8) box(c, x + 7, y, 4, 1, S[3]);
};
/** The half-dead string lights sagging between the masts (live: the dead stay dead, one flickers). */
const stringLights = (c: Ctx, E: P, state: GameState, f: number, cleared: boolean) => {
  const night = lampsOn() && !cleared;
  for (let i = 0; i + 1 < POLES.length; i++) {
    const ax = X(POLES[i]), bx = X(POLES[i + 1]);
    if (!seen(state, E, ax, bx, D_POLE)) continue;
    atDepth(c, E, D_POLE, () => {
      const ay = treadAt(POLES[i]) - 250, by = treadAt(POLES[i + 1]) - 250, sag = 60;
      const at = (t: number) => ({ x: ax + (bx - ax) * t, y: ay + (by - ay) * t + Math.sin(t * Math.PI) * sag });
      c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); for (let t = 0; t <= 1.001; t += 0.02) { const p = at(t); if (t === 0) c.moveTo(p.x, p.y); else c.lineTo(p.x, p.y); } c.stroke();
      const n = Math.floor((bx - ax) / 26);
      for (let k = 1; k < n; k++) {
        const p = at(k / n), id = i * 100 + k, dead = hash(id * 1.7) < 0.36, flick = id === 107 && (f % 23) < 9;
        box(c, p.x - 1, p.y, 3, 3, INK);
        const col = dead || flick ? '#3A3430' : night ? '#FFF2C0' : '#F4E8C8';
        box(c, p.x - 2, p.y + 3, 5, 6, INK); box(c, p.x - 1, p.y + 3, 3, 5, col); if (!dead && !flick) box(c, p.x - 1, p.y + 3, 1, 2, '#FFFFFF');
      }
    });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The pit: the front row (folding chairs, one RESERVED), litter; the CAST ONLY rope

const chair = (c: Ctx, x: number, y: number, reserved: boolean, n: number) => {
  const S = NR(STEEL);
  shadowAt(c, x - 6, y, 26, 0.3);
  box(c, x - 2, y - 32, 4, 32, INK); box(c, x - 1, y - 32, 2, 32, S[4]); box(c, x + 11, y - 17, 4, 17, INK); box(c, x + 12, y - 17, 2, 17, S[3]);
  box(c, x - 3, y - 19, 20, 6, INK); box(c, x - 2, y - 18, 18, 4, S[3]); box(c, x - 2, y - 18, 18, 1, S[5]); box(c, x - 2, y - 15, 18, 1, S[1]);
  box(c, x - 4, y - 34, 7, 18, INK); box(c, x - 3, y - 33, 5, 16, S[3]); box(c, x - 3, y - 33, 2, 16, S[5]);
  g2tag(c, x, y, n);
  if (reserved) { box(c, x - 10, y - 32, 18, 12, INK); box(c, x - 9, y - 31, 16, 10, '#F5F5F4'); box(c, x - 9, y - 31, 16, 2, '#FFFFFF'); box(c, x - 7, y - 26, 12, 1, '#DC2626'); box(c, x - 7, y - 24, 9, 1, '#DC2626'); box(c, x - 1, y - 36, 2, 5, '#9AA0A8'); }
};
const g2tag = (c: Ctx, x: number, y: number, n: number) => { box(c, x + 2, y - 15, 8, 4, '#F4F1E8'); box(c, x + 3 + (n % 3), y - 14, 1, 2, INK); };
const litter = (c: Ctx, state: GameState, E: P) => {
  for (let k = 0; k < 22; k++) {
    const rx = 1980 + hash(k * 3.7) * 600, d = 0.9 + hash(k * 1.3) * 0.09, x = X(rx);
    if (!seen(state, E, x - 10, x + 10, d)) continue;
    atDepth(c, E, d, () => {
      const t = Math.floor(hash(k * 5.1) * 5);
      if (t === 0) deadCan(c, x, PIT_Y, k);
      else if (t === 1) { c.save(); c.translate(x, PIT_Y - 3); c.rotate(1.5); cupAt(c, 0, 4, false); c.restore(); box(c, x - 6, PIT_Y - 1, 8, 1, 'rgba(230,166,50,0.6)'); }
      else if (t === 2) { for (let j = 0; j < 5; j++) { box(c, x + j * 3, PIT_Y - 2 - (j % 2), 3, 2, '#FEF3C7'); box(c, x + j * 3, PIT_Y - 2 - (j % 2), 1, 1, '#FFFFFF'); } }
      else if (t === 3) { box(c, x - 6, PIT_Y - 3, 12, 3, INK); box(c, x - 5, PIT_Y - 3, 10, 2, '#E8E4D0'); signText(c, 'SD', x, PIT_Y - 1, tiny('#7C3AED')); }
      else { box(c, x - 4, PIT_Y - 2, 8, 2, '#5A3A2A'); box(c, x - 3, PIT_Y - 2, 2, 1, '#8A6A4A'); }
    });
  }
};
/** The CAST ONLY rope across the foot of the stage steps: two brass stanchions (one at the front, one back across the
 *  steps), the velvet rope between them; unhooked (lying on the floor) once the guard's down. */
const stanchion = (c: Ctx, x: number) => {
  const Br = NR(BRASS);
  box(c, x - 3, PIT_Y - 42, 7, 42, INK); box(c, x - 2, PIT_Y - 42, 5, 42, Br[3]); box(c, x - 2, PIT_Y - 42, 2, 42, Br[5]); box(c, x + 2, PIT_Y - 42, 1, 42, Br[1]);
  box(c, x - 9, PIT_Y - 5, 19, 5, INK); box(c, x - 8, PIT_Y - 4, 17, 3, Br[3]); box(c, x - 8, PIT_Y - 4, 17, 1, Br[5]);
  box(c, x - 5, PIT_Y - 48, 11, 8, INK); box(c, x - 4, PIT_Y - 47, 9, 6, Br[3]); box(c, x - 4, PIT_Y - 47, 3, 3, Br[5]);
};
const rope = (c: Ctx, E: P, open: boolean) => {
  const x = X(STEPS.a - 4), dFar = 0.88, V = NR(VELV);
  atDepth(c, E, dFar, () => stanchion(c, x));
  const p0 = proj(E, x, PIT_Y - 40, dFar), p1 = { x, y: PIT_Y - 40 };
  const path = () => { c.beginPath(); c.moveTo(p0.x, p0.y); if (open) c.quadraticCurveTo(p0.x + 4, PIT_Y - 6, p1.x - 18, PIT_Y - 2); else c.quadraticCurveTo((p0.x + p1.x) / 2, PIT_Y - 18, p1.x, p1.y); };
  c.lineCap = 'round';
  path(); c.strokeStyle = INK; c.lineWidth = 6; c.stroke(); path(); c.strokeStyle = V[2]; c.lineWidth = 4; c.stroke();
  c.save(); c.translate(0, -1); path(); c.strokeStyle = V[4]; c.lineWidth = 1; c.stroke(); c.restore();
  if (!open) { const mx = (p0.x + p1.x) / 2, my = (p0.y + p1.y) / 2 + 12; box(c, mx - 1, my - 8, 2, 8, NR(BRASS)[3]); box(c, mx - 23, my - 2, 46, 15, INK); box(c, mx - 22, my - 1, 44, 13, '#F5F5F4'); box(c, mx - 22, my - 1, 44, 2, '#FFFFFF'); signText(c, 'CAST ONLY', mx, my + 9, small('#B91C1C')); }
  else { box(c, p1.x - 31, PIT_Y - 7, 46, 7, INK); box(c, p1.x - 30, PIT_Y - 6, 44, 5, '#F5F5F4'); signText(c, 'CAST ONLY', p1.x - 8, PIT_Y - 2, tiny('#B91C1C')); }
  stanchion(c, x);
};

// ---------------------------------------------------------------------------------------------------------------
// The ground: the bank, the floors back to the bowl's far side, and the near cut (lit along every top he stands on)

/** A bleacher row's top: level with the second of the aisle's two steps beside it (the first's the half step). */
const rowY = (k: number) => TOP_Y + (2 * k + 1) * (ROW_RISE / 2);
const rowA = (k: number) => AISLE.a + k * ROW_W;
const ROW_NAMES = 'ABCDEFGHIJKL';

const floors = (c: Ctx, state: GameState, E: P) => {
  const cam = state.camera.x, Cc = NR(CONC), Al = NR(ALU), Dk = NR(DECK), G = DR(GRASS), Hd = DR(HEDGE);
  // (the bowl's far bank: grass in steps up to the rim, the hedge along its top in humps, lit up top)
  const dB = D_FAR - 0.02;
  const l = Math.max(X(-260), cam - 260), r = Math.min(x1 + 260, cam + CANVAS_WIDTH + 300);
  if (r > l) {
    // (its foot meets the floors' far edge, so nothing of the far off shows between)
    const top = (x: number) => proj(E, x, BANK_Y, dB), foot = (x: number) => proj(E, x, Math.max(BANK_Y + 2, treadAt(x - X(0))), D_FAR + 0.002);
    const strip = (k0: number, k1: number, col: string) => {
      c.beginPath();
      for (let x = l; x <= r; x += 20) { const t = top(x), f2 = foot(x), y = t.y + (f2.y - t.y) * k0; if (x === l) c.moveTo(t.x, y); else c.lineTo(t.x, y); }
      for (let x = r; x >= l; x -= 20) { const t = top(x), f2 = foot(x); c.lineTo(t.x, t.y + (f2.y - t.y) * k1 + 1); }
      c.closePath(); c.fillStyle = col; c.fill();
    };
    strip(0, 0.18, G[3]); strip(0.16, 0.5, G[2]); strip(0.48, 1, G[1]);
    const p0 = top(l), p1 = top(r); checker(c, p0.x, p0.y + 2, p1.x - p0.x, 2, G[2], 0, 1);
    for (let x = Math.floor(l / 36) * 36; x < r; x += 36) {
      const p = top(x), rr = 11 + hash(x * 0.13) * 6;
      c.fillStyle = INK; c.beginPath(); c.arc(p.x, p.y, rr + 1.5, Math.PI, 0); c.fill();
      c.fillStyle = Hd[2]; c.beginPath(); c.arc(p.x, p.y, rr, Math.PI, 0); c.fill();
      c.fillStyle = Hd[3]; c.beginPath(); c.arc(p.x - 2, p.y - 1, rr * 0.7, Math.PI, 0); c.fill();
      box(c, p.x - rr * 0.5, p.y - rr * 0.75, 3, 2, Hd[5]);
    }
  }
  // (the concourse's paving: slabs in bands going back, the joints, gum, a stain, a drain)
  if (seen(state, E, X(-200), X(AISLE.a), 1)) {
    floorBands(c, E, X(-200), X(AISLE.a), TOP_Y, 1, D_FAR, [Cc[4], Cc[3], Cc[3], Cc[2]]);
    for (const d of [0.76, 0.82, 0.88, 0.94]) along(c, E, X(-200), X(AISLE.a), TOP_Y, d, Cc[1]);
    for (let x = Math.floor((cam - 120) / 80) * 80; x < Math.min(X(AISLE.a), cam + 900); x += 80) { back(c, E, x, TOP_Y, D_FAR, 1, Cc[1]); back(c, E, x + 2, TOP_Y, D_FAR, 1, Cc[5]); }
    if (E.y < TOP_Y) for (let k = 0; k < 40; k++) {
      const rx = -180 + hash(k * 2.3) * 1160, d = 0.72 + hash(k * 4.1) * 0.27, p = proj(E, X(rx), TOP_Y, d);
      if (p.x < cam - 10 || p.x > cam + CANVAS_WIDTH + 10) continue;
      if (k % 5 === 0) crack(c, p.x, p.y, 18, k, Cc[1]); else if (k % 7 === 0) { c.fillStyle = 'rgba(120,90,40,0.25)'; c.beginPath(); c.ellipse(p.x, p.y, 14 * d, 3 * d, 0, 0, Math.PI * 2); c.fill(); } else gum(c, p.x, p.y, '#3A3640');
    }
  }
  // (the bleacher rows: aluminum planks over the concrete, each row's riser down from the last (facing the stage),
  // lettered; the aisle's two half steps a row nearest, their noses painted yellow)
  for (let k = 0; k < ROWS; k++) {
    const a = X(rowA(k)), b = a + ROW_W, m = a + ROW_W / 2, y = rowY(k), yh = TOP_Y + k * ROW_RISE, yPrev = k ? rowY(k - 1) : TOP_Y;
    if (!seen(state, E, a, b, 1) && !seen(state, E, a, b, D_FAR)) continue;
    // (the aisle, nearest)
    if (E.x > a) side(c, E, a, yPrev, yh, D_AISLE, 1, Cc[1]);
    floorBands(c, E, a, m, yh, 1, D_AISLE, [Cc[4], Cc[3]]);
    if (E.x > m) side(c, E, m, yh, y, D_AISLE, 1, Cc[1]);
    floorBands(c, E, m, b, y, 1, D_AISLE, [Cc[4], Cc[3]]);
    if (E.y < yh) back(c, E, a + 1, yh, D_AISLE, 1, '#E8B424', 2);
    if (E.y < y) back(c, E, m + 1, y, D_AISLE, 1, '#E8B424', 2);
    // (the bleacher: the riser, lettered; the planks along the row, the gaps dark, the seat numbers' ticks)
    if (E.x > a) {
      side(c, E, a, yPrev, y, D_FAR, D_AISLE, Cc[2]);
      const q0 = proj(E, a, yPrev, D_FAR), q1 = proj(E, a, yPrev, D_AISLE); c.strokeStyle = Al[4]; c.lineWidth = 2; c.beginPath(); c.moveTo(q0.x, q0.y + 1); c.lineTo(q1.x, q1.y + 1); c.stroke();
      const n = proj(E, a, (yPrev + y) / 2 + 4, 0.88); signText(c, ROW_NAMES[k], n.x - 3, n.y, stencil(mix(Cc[4], '#FFFFFF', 0.2)));
    }
    if (E.y < y) {
      floorBands(c, E, a, b, y, D_AISLE, D_FAR, [Al[4], Al[3], Al[3], Al[2]]);
      for (const t of [0.34, 0.67]) back(c, E, a + ROW_W * t, y, D_FAR, D_AISLE, Al[1]);
      back(c, E, a + 2, y, D_FAR, D_AISLE, Al[5]); back(c, E, b - 1, y, D_FAR, D_AISLE, Al[1]);
      for (let d = 0.74; d < D_AISLE; d += 0.04) { const p = proj(E, b - 6, y, d); box(c, p.x, p.y - 1, 3 * d, 1, Al[1]); }
      // (what's been left on the planks: a cup, a can, a program)
      for (let j = 0; j < 2; j++) { const s = hash(k * 13 + j * 5.7); if (s < 0.5) continue; const d = 0.74 + hash(k * 3 + j) * 0.18, wx = a + 18 + hash(k + j * 9) * 40; atDepth(c, E, d, () => { if (s > 0.8) deadCan(c, wx, y, k + j); else cupAt(c, wx, y, s > 0.65); }); }
    }
  }
  // (the pit's floor, the last half step down onto it: stained concrete, a drain, beer gone sticky)
  if (seen(state, E, X(AISLE.b), X(STEPS.b), 1) || seen(state, E, X(AISLE.b), X(STEPS.b), D_FAR)) {
    if (E.x > X(AISLE.b)) side(c, E, X(AISLE.b), rowY(ROWS - 1), PIT_Y, D_FAR, 1, Cc[1]);
    floorBands(c, E, X(AISLE.b), X(DECK_A), PIT_Y, 1, D_FAR, [Cc[3], Cc[2], Cc[2], Cc[1]]);
    if (E.y < PIT_Y) {
      for (const d of [0.78, 0.86, 0.94]) along(c, E, X(AISLE.b), X(DECK_A), PIT_Y, d, Cc[1]);
      for (let x = X(AISLE.b) + 120; x < X(DECK_A); x += 120) back(c, E, x, PIT_Y, D_FAR, 1, Cc[1]);
      const dr = proj(E, X(2300), PIT_Y, 0.82); box(c, dr.x - 12, dr.y - 1, 24, 3, INK); for (let j = 0; j < 6; j++) box(c, dr.x - 11 + j * 4, dr.y, 2, 1, Cc[3]);
      for (let j = 0; j < 8; j++) { const p = proj(E, X(2000 + hash(j * 7.1) * 560), PIT_Y, 0.74 + hash(j * 2.9) * 0.24); c.fillStyle = 'rgba(150,100,30,0.28)'; c.beginPath(); c.ellipse(p.x, p.y, 16, 3, 0, 0, Math.PI * 2); c.fill(); gum(c, p.x + 20, p.y, '#2A2630'); }
    }
  }
  // (the stage steps: a plywood unit going back to its far side, each riser facing the bowl, each tread lit at its nose)
  { const n = STEPS.n, sw = (STEPS.b - STEPS.a) / n, rise = (PIT_Y - STAGE_Y) / n, Pl = NR(PLY), dS = 0.86;
    if (seen(state, E, X(STEPS.a), X(STEPS.b), 1)) for (let k = 0; k < n; k++) {
      const x0 = X(STEPS.a + k * sw), x2 = x0 + sw, y = PIT_Y - (k + 1) * rise;
      if (E.x < x0) side(c, E, x0, y + rise, y, dS, 1, Pl[2]);
      floorBands(c, E, x0, x2, y, 1, dS, [Pl[4], Pl[3], Pl[3]]);
      if (E.y < y) { back(c, E, x0 + 1, y, dS, 1, Pl[5]); back(c, E, x2 - 1, y, dS, 1, Pl[1]); }
    } }
  // (the stage's front facing the bowl: a lattice skirt gone gray; its deck: boards, scuffed, spike and gaffer tape)
  if (E.x < X(DECK_A)) {
    side(c, E, X(DECK_A), PIT_Y, STAGE_Y, D_FAR, 1, '#2A2024');
    c.strokeStyle = '#B8B0A4'; c.lineWidth = 1;
    for (let k = 0; k < 16; k++) { const d = D_FAR + (k + 0.5) * ((1 - D_FAR) / 16); const p = proj(E, X(DECK_A), PIT_Y, d), q = proj(E, X(DECK_A), STAGE_Y + 8, d); c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke(); }
    for (let k = 0; k < 16; k++) { const d0 = D_FAR + (k / 16) * (1 - D_FAR), d1 = D_FAR + ((k + 1) / 16) * (1 - D_FAR); const p = proj(E, X(DECK_A), PIT_Y - 4, d0), q = proj(E, X(DECK_A), STAGE_Y + 10, d1), r2 = proj(E, X(DECK_A), STAGE_Y + 10, d0), s2 = proj(E, X(DECK_A), PIT_Y - 4, d1); c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.moveTo(r2.x, r2.y); c.lineTo(s2.x, s2.y); c.stroke(); }
    const p0 = proj(E, X(DECK_A), STAGE_Y, D_FAR), p1 = proj(E, X(DECK_A), STAGE_Y, 1); c.strokeStyle = Dk[5]; c.lineWidth = 2; c.beginPath(); c.moveTo(p0.x, p0.y + 1); c.lineTo(p1.x, p1.y + 1); c.stroke();
  }
  if (seen(state, E, X(DECK_A), X(4200), 1) || seen(state, E, X(DECK_A), X(4200), D_FAR)) {
    floorBands(c, E, X(DECK_A), X(4200), STAGE_Y, 1, D_FAR, [Dk[4], Dk[3], Dk[3], Dk[2], Dk[2], Dk[1], Dk[0]]);
    if (E.y < STAGE_Y) {
      for (let k = 1; k < 14; k++) { const d = D_SHELL + (k / 14) * (1 - D_SHELL); along(c, E, X(DECK_A), X(4200), STAGE_Y, d, Dk[1]); }
      for (let k = 0; k < 14; k++) for (let j = 0; j < 4; j++) { const d = D_SHELL + ((k + 0.5) / 14) * (1 - D_SHELL), x = X(DECK_A + 60 + ((k * 137 + j * 331) % 1200)); const p = proj(E, x, STAGE_Y, d); box(c, p.x, p.y - 1, 1, 2, Dk[0]); }
      for (let k = 0; k < 10; k++) { const p = proj(E, X(DECK_A + 40 + hash(k * 4.3) * 1300), STAGE_Y, D_SHELL + hash(k * 2.1) * 0.24); box(c, p.x - 6, p.y - 1, 12, 1, Dk[5]); }
      // (spike tape: where everybody stands; a gaffer X)
      for (const [rx, d, col] of [[3010, 0.98, '#FDE047'], [3230, 0.97, '#FDE047'], [3340, 0.96, '#F472B6'], [3132, 0.97, '#60A5FA'], [3560, 0.95, '#4ADE80']] as const) { const p = proj(E, X(rx), STAGE_Y, d); box(c, p.x - 7, p.y - 1, 14, 2, col); box(c, p.x - 7, p.y - 1, 2, 2, mix(col, '#FFFFFF', 0.4)); }
      const gx = proj(E, X(2860), STAGE_Y, 0.9); c.strokeStyle = '#2A2A30'; c.lineWidth = 2; c.beginPath(); c.moveTo(gx.x - 6, gx.y - 2); c.lineTo(gx.x + 6, gx.y + 2); c.moveTo(gx.x + 6, gx.y - 2); c.lineTo(gx.x - 6, gx.y + 2); c.stroke();
    }
  }
};

/** Board-formed concrete for the near cut, as a tile anchored to the world (made once per ramp: the hour's): the form
 *  boards' grain in courses, lit under each seam, the aggregate's speckle, a cold joint down one edge, form-tie holes. */
const CONC_TILES = new Map<string, CanvasPattern>();
const concPattern = (c: Ctx, R: string[]) => {
  const key = R.join();
  let p = CONC_TILES.get(key);
  if (!p) {
    const cv = document.createElement('canvas'); cv.width = 160; cv.height = 90;
    const g = cv.getContext('2d')!;
    box(g, 0, 0, 160, 90, R[2]);
    for (let y = 0; y < 90; y += 15) { box(g, 0, y, 160, 1, R[1]); box(g, 0, y + 1, 160, 1, R[3]); for (let x = 0; x < 160; x += 3) if (hash(x * 1.3 + y) > 0.72) box(g, x, y + 4 + Math.floor(hash(x + y * 2) * 8), 2 + Math.floor(hash(x * 3 + y) * 5), 1, hash(x + y) > 0.5 ? R[1] : R[3]); }
    for (let k = 0; k < 260; k++) box(g, Math.floor(hash(k * 2.17) * 160), Math.floor(hash(k * 3.31) * 90), 1, 1, k % 3 ? R[1] : R[4]);
    box(g, 0, 0, 2, 90, R[1]); box(g, 2, 0, 1, 90, R[3]);
    for (const [tx, ty] of [[40, 22], [120, 22], [40, 67], [120, 67]]) { box(g, tx - 2, ty - 2, 5, 5, R[0]); box(g, tx - 1, ty - 1, 3, 3, R[1]); box(g, tx + 2, ty + 2, 2, 1, R[4]); }
    p = c.createPattern(cv, 'repeat')!;
    if (CONC_TILES.size > 24) CONC_TILES.clear();
    CONC_TILES.set(key, p);
  }
  return p;
};

/** The near cut: the ground's section along the play plane (poured concrete in the bowl, the stage's skirt), the steps,
 *  every top lit. */
const nearCut = (c: Ctx, state: GameState) => {
  const l = Math.max(X(-200), state.camera.x - 40), r = Math.min(x1 + 200, state.camera.x + CANVAS_WIDTH + 40), bot = state.camera.y + CANVAS_HEIGHT + 40;
  const Cc = NR(CONC), Wd = NR(DECK), P = NR(PLY);
  const da = X(STEPS.a);
  // (the section: the step profile, filled down; banded under every tread, the form-tie dots)
  c.beginPath(); c.moveTo(l, bot);
  for (let x = l; x <= r; x += 2) c.lineTo(x, treadAt(x - X(0)));
  c.lineTo(r, bot); c.closePath();
  c.fillStyle = concPattern(c, Cc); c.fill();
  c.save(); c.clip();
  let px = l, py = treadAt(l - X(0));
  const band = (x0: number, x2: number, y: number) => { const wood = x0 - X(0) >= STEPS.a; const R = wood ? P : Cc; box(c, x0, y + 4, x2 - x0, 8, R[3]); checker(c, x0, y + 12, x2 - x0, 2, R[3], 0, 1); box(c, x0, y + 14, x2 - x0, 14, R[2]); checker(c, x0, y + 28, x2 - x0, 2, R[2], 1, 1); };
  for (let x = l + 2; x <= r + 2; x += 2) { const y = treadAt(x - X(0)); if (y !== py || x > r) { band(px, x, py); px = x; py = y; } }
  // (rain streaks down from the treads' lips, a patch of moss at the foot of some, a tag sprayed on one panel)
  for (let x = Math.floor(l / 64) * 64; x < Math.min(r, da); x += 64) {
    const k = hash(x * 0.37), y0 = treadAt(x - X(0)) + 14, len = 30 + k * 90;
    if (k > 0.35) for (let y = 0; y < len; y += 3) box(c, x + 10 + Math.round(k * 30), y0 + y, 2 + (y < len * 0.4 ? 1 : 0), 3, 'rgba(40,34,30,' + (0.22 * (1 - y / len)).toFixed(3) + ')');
    if (k < 0.18) { const sy = y0 + 40; c.strokeStyle = 'rgba(200,60,120,0.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 8, sy + 8); c.quadraticCurveTo(x + 14, sy - 4, x + 20, sy + 6); c.quadraticCurveTo(x + 26, sy + 12, x + 34, sy); c.stroke(); }
  }
  c.restore();
  // (the stage's skirt: red, white and blue bunting along its front, the lattice under it)
  if (r > da) {
    const s0 = Math.max(da, l);
    box(c, s0, STAGE_Y + 2, r - s0, CANVAS_HEIGHT, '#2A1E22');
    for (let x = Math.floor(Math.max(X(DECK_A), l) / 14) * 14; x < r; x += 14) { c.strokeStyle = '#8A8478'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, STAGE_Y + 20); c.lineTo(x + 30, STAGE_Y + 60); c.moveTo(x + 30, STAGE_Y + 20); c.lineTo(x, STAGE_Y + 60); c.stroke(); }
    box(c, Math.max(X(DECK_A), l), STAGE_Y + 2, r - Math.max(X(DECK_A), l), 6, Wd[2]); box(c, Math.max(X(DECK_A), l), STAGE_Y + 8, r - Math.max(X(DECK_A), l), 1, INK);
    for (let x = Math.max(X(DECK_A), Math.floor(l / 40) * 40); x < r; x += 40) {
      const i = Math.floor((x - X(0)) / 40) % 3, col = ['#C83A3A', '#F4F1E8', '#2A4AC8'][i], dk = ['#8A1A1A', '#C8C0B0', '#1A2A8A'][i];
      c.fillStyle = INK; c.beginPath(); c.moveTo(x, STAGE_Y + 8); c.quadraticCurveTo(x + 20, STAGE_Y + 30, x + 40, STAGE_Y + 8); c.closePath(); c.fill();
      c.fillStyle = col; c.beginPath(); c.moveTo(x + 1, STAGE_Y + 9); c.quadraticCurveTo(x + 20, STAGE_Y + 28, x + 39, STAGE_Y + 9); c.closePath(); c.fill();
      c.fillStyle = dk; c.beginPath(); c.moveTo(x + 8, STAGE_Y + 14); c.quadraticCurveTo(x + 20, STAGE_Y + 25, x + 32, STAGE_Y + 14); c.lineTo(x + 30, STAGE_Y + 17); c.quadraticCurveTo(x + 20, STAGE_Y + 22, x + 10, STAGE_Y + 17); c.closePath(); c.fill();
      box(c, x - 2, STAGE_Y + 7, 4, 4, NR(BRASS)[4]);
    }
    // (the stage steps' stringer: raw plywood, screw heads)
    const sa = Math.max(da, l), sb = Math.min(X(DECK_A), r);
    if (sb > sa) for (let x = sa; x < sb; x += 2) { const y = treadAt(x - X(0)); box(c, x, y + 4, 2, STAGE_Y + 2 - y - 4 + 60, P[2]); if ((x - X(0)) % 32 === 0) box(c, x, y + 8, 2, 2, P[0]); }
  }
  // (every tread's lit top, its front edge dark; the aisle's noses yellow)
  let qx = l, qy = treadAt(l - X(0));
  for (let x = l + 2; x <= r + 2; x += 2) {
    const y = treadAt(x - X(0));
    if (y !== qy || x > r) {
      const rx = qx - X(0), wood = rx >= STEPS.a, aisle = rx >= AISLE.a && rx < AISLE.b;
      box(c, qx, qy, x - qx, 3, wood ? '#FDE68A' : '#FFFBEB'); box(c, qx, qy, x - qx, 1, '#FFFFFF'); box(c, qx, qy + 3, x - qx, 1, INK);
      if (aisle) box(c, qx, qy + 4, Math.min(10, x - qx), 3, '#E8B424');
      if (y !== qy) box(c, x - 1, Math.min(y, qy), 2, Math.abs(y - qy) + 3, INK);
      qx = x; qy = y;
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------

export interface AmphiLook {
  stage: StageLook; guard: { pose: GuardPose; t: number; ice: boolean }; cleared: boolean; doorOpen: number;
  /** The living room's left-hand wall flown in (0 up in the grid .. 1 down: the fight's on or coming). */
  flat?: number;
  /** The fight's on: everything of it on the stage (fight.ts fightItems), in place of the show's couch, family and him. */
  fight?: { d: number; x: number; draw: () => void }[] | null;
}

/** Behind him: all of it, back to front. */
export const drawAmphiBack = (c: Ctx, state: GameState, look: AmphiLook) => {
  const E = eyeOf(state), f = state.frame, cam = state.camera.x;
  drawRim(c, state, E);
  floors(c, state, E);
  // (the light masts and the string lights between them, deep: behind everybody)
  for (const px of POLES) { const x = X(px); if (seen(state, E, x - 34, x + 34, D_POLE)) atDepth(c, E, D_POLE, () => pole(c, x, treadAt(px), look.cleared)); }
  stringLights(c, E, state, f, look.cleared);
  // (the stage's shell, the speakers flown off it, the banner; the set's wall, its door, the laugh horn)
  if (seen(state, E, X(SHELL.a) - 30, X(SHELL.b) + 40, D_SHELL)) atDepth(c, E, D_SHELL, () => { drawShell(c, f); drawBanner(c, f, look.stage.applause); });
  for (const [sx, n, bar] of [[3130, 2, 262], [3800, 3, 330]] as const) if (seen(state, E, X(sx) - 30, X(sx) + 30, 0.76)) atDepth(c, E, 0.76, () => drawFlown(c, sx, n, bar));
  if (seen(state, E, X(SET.a) - 70, X(SET.b) + 70, D_SET)) atDepth(c, E, D_SET, () => { drawSetWall(c, look.cleared); drawSwingDoor(c, look.doorOpen); drawLaughHorn(c, f, look.stage.applause); });
  if (seen(state, E, X(3000), X(3700), 0.9) && E.y < STAGE_Y) drawRug(c, (x, d) => proj(E, x, STAGE_Y, d), BOY_TRACK);
  // (the living room's side walls: the right-hand one, and the left flown in for the fight)
  if (X(ARENA.b) > cam - 300 && X(ARENA.b) < cam + CANVAS_WIDTH + 300) drawSideWall(c, E, ARENA.b, SET.b, 1);
  if ((look.flat ?? 0) > 0 && X(ARENA.a) > cam - 300 && X(ARENA.a) < cam + CANVAS_WIDTH + 300) drawSideWall(c, E, ARENA.a - 8, SET.a, look.flat ?? 0);
  // Everything else at its depth, far to near
  const items: { d: number; x: number; draw: () => void }[] = [];
  const S = look.stage;
  // (the concourse)
  items.push({ d: 0.84, x: X((STAND.a + STAND.b) / 2), draw: () => beerStand(c, f) });
  items.push({ d: 0.88, x: X(90), draw: () => booth(c, X(90)) });
  items.push({ d: 0.9, x: X(HIGHTOP), draw: () => highTop(c, f) });
  items.push({ d: 0.95, x: X(260), draw: () => trash(c, X(260)) });
  items.push({ d: 0.97, x: X(MARQUEE), draw: () => marquee(c, f) });
  // (the crowd: everybody while there's a show; once it's over, the one asleep)
  CROWD.forEach(([row, d, seed, what], i) => {
    if (!S.crowd && i !== SLEEPER) return;
    const hx = X(rowA(row) + ROW_W - 18);
    items.push({ d, x: hx, draw: () => { c.save(); c.translate(hx, rowY(row)); fan(c, seed, what, f); c.restore(); } });
  });
  // (the front row)
  FRONT_ROW.forEach(([rx, d], i) => items.push({ d, x: X(rx), draw: () => chair(c, X(rx), PIT_Y, i === RESERVED, i) }));
  // (the stage: the furniture, the family, him)
  const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
  const bu = S.boy.u, bx = lerp(X(BOY_TRACK.a.x), X(BOY_TRACK.b.x), bu), bd = lerp(BOY_TRACK.a.d, BOY_TRACK.b.d, bu);
  const boyGone = bu > 0.97;
  items.push({ d: TV.d, x: X(TV.x), draw: () => drawTV(c, X(TV.x), f, S.tv) });
  if (look.fight) items.push(...look.fight);
  else {
    if (!boyGone) items.push({ d: bd, x: bx, draw: () => drawBoy(c, bx, STAGE_Y, S.boy, S.boy.arm, S.boy.beer) });
    items.push({ d: MOM.d, x: X(MOM.x), draw: () => drawMom(c, X(MOM.x), STAGE_Y, S.mom) });
    const C = S.couch;
    items.push({ d: C.d, x: X(C.x), draw: () => drawCouch(c, X(C.x), STAGE_Y, f, { empty: !S.dad || S.dad.d > C.d + 0.001 || S.dad.pose === 'gone' || S.dad.pose === 'drag' }) });
    // (the mallet he took off the PUNCHY & KICKY robot, leaning on the couch's arm: always by him)
    if (S.mallet) items.push({ d: C.d + 0.0002, x: X(C.x) - 82, draw: () => { c.save(); c.translate(X(C.x) - 82, STAGE_Y - 4); c.rotate(-0.3); c.scale(DAD_K, DAD_K); drawMallet(c); c.restore(); } });
    items.push({ d: GRAMPS.d + 0.001, x: X(GRAMPS.x), draw: () => drawGramps(c, X(GRAMPS.x), STAGE_Y, S.gramps) });
    items.push({ d: SIS.d, x: X(SIS.x), draw: () => drawSis(c, X(SIS.x), STAGE_Y, S.sis) });
    if (S.dad) { const D = S.dad; items.push({ d: D.d + 0.0005, x: X(D.x), draw: () => drawDad(c, X(D.x), STAGE_Y, D.pose, f, { t: D.t, talking: D.talking, face: D.face, can: D.can, canFull: D.canFull, crushed: D.crushed, facing: D.facing }) }); }
    // (the fridge, against the right-hand wall)
    items.push({ d: FRIDGE.d, x: X(FRIDGE.x), draw: () => drawFridge(c, X(FRIDGE.x), STAGE_Y, f) });
  }
  // (the empties: a pyramid of his cans by the couch; more once it's over)
  items.push({ d: 0.93, x: X(3190), draw: () => { const n = look.cleared ? 10 : 6; shadowAt(c, X(3166), STAGE_Y, 36, 0.3); for (let k = 0; k < n; k++) { const row = k < 4 ? 0 : k < 7 ? 1 : k < 9 ? 2 : 3, col = k - [0, 4, 7, 9][row]; can(c, X(3172) + col * 7 + row * 3.5, STAGE_Y - 8 - row * 13, 0, 0, false); } if (look.cleared) for (let k = 0; k < 3; k++) deadCan(c, X(3150 + k * 34), STAGE_Y, k + 40); } });
  items.sort((a, b) => a.d - b.d);
  for (const it of items) if (seen(state, E, it.x - 220, it.x + 220, it.d)) atDepth(c, E, it.d, it.draw);
  litter(c, state, E);
  if (X(STEPS.a) > cam - 200 && X(STEPS.a) < cam + CANVAS_WIDTH + 200) rope(c, E, look.guard.pose === 'down' || look.guard.pose === 'keel');
  nearCut(c, state);
  // (the guard, at the foot of the steps)
  const gx = X(GUARD_X);
  if (gx > cam - 200 && gx < cam + CANVAS_WIDTH + 200) drawGuard(c, gx, PIT_Y, look.guard.pose, f, look.guard.t, look.guard.ice);
};

/** After dark: the light masts' floods, the string lights, the stand's neon, the marquee, the stage's soft fills, the
 *  TV's glow (never spotlights). */
export const amphiLamps = (state: GameState): Light[] => {
  const out: Light[] = [], cam = state.camera.x, on = (x: number) => x > cam - 400 && x < cam + CANVAS_WIDTH + 400;
  const tod = timeOfDay();
  for (const px of POLES) { const x = X(px); if (on(x) && tod.lamps > 0.05) out.push({ x, y: treadAt(px) - 300, r: 320, a: 0.3, color: '#FEF3C7' }); }
  if (tod.lamps > 0.3) for (let i = 0; i + 1 < POLES.length; i++) { const x = X((POLES[i] + POLES[i + 1]) / 2); if (on(x)) out.push({ x, y: (treadAt(POLES[i]) + treadAt(POLES[i + 1])) / 2 - 200, r: 200, a: 0.2, color: '#FFE8B0' }); }
  if (on(X(STAND.a + 64))) out.push({ x: X(STAND.a + 64), y: TOP_Y - 120, r: 120, a: 0.38, color: '#FF5A8A' });
  if (on(X(3300))) { out.push({ x: X(3000), y: STAGE_Y - 160, r: 300, a: 0.4, color: '#FFE8C0' }); out.push({ x: X(3500), y: STAGE_Y - 160, r: 300, a: 0.4, color: '#FFE8C0' }); out.push({ x: X(TV.x), y: STAGE_Y - 80, r: 90, a: 0.3, color: '#9AE6B4' }); }
  if (on(X(MARQUEE))) out.push({ x: X(MARQUEE), y: TOP_Y - 240, r: 200, a: 0.35, color: '#FDE68A' });
  return out;
};
