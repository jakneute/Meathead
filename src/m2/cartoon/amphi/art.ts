// STUPID DAD LIVE!, painted (the prototype pass: crude-but-clean, the people at full grade). THE UBX AMPHITHEATER: a
// concrete bowl dug into the hill, aluminum bleachers stepping down it, a band shell over the stage at its foot. All of
// it to the one eye (the middle of the screen: studio/art.ts's way): the floors (the concourse's paving, every bleacher
// row, the pit, the stage's deck) run back from the play plane to the bowl's far side, the grass bank behind them; the
// band shell, the set's wall, the furniture and the family each at their own depth; back to front, nothing deeper drawn
// over anything nearer, culled by where they land on screen.
//
// On the play plane, bright and inked, everything he stands on lit along its top: the concourse, the aisle steps, the
// pit, the stage steps, the deck. The marquee at the gate on its two posts (the show's lettering: slanted, banded, the
// LIVE! in bulbs); the BEER GARDEN's stand; the crowd (what there is of it: eight people for a few hundred seats, two
// asleep); the empty front row (one chair RESERVED); the CAST ONLY rope behind the guard. The stage: the shell's
// painted sunburst, the STUPID DAD LIVE! banner hung off it, the APPLAUSE sign; the set (the sitcom living room:
// mustard wallpaper, the wood paneling, the window onto a painted street, the family portrait with a black ribbon on
// it, the kitchen's swing door, the clock stopped at five), the rug, the Boy's floor track; the couch with STUPID DAD on
// it, the family round it, the TV on its cart (the game: the same tape every show).

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { signText, type Look } from '../../signLetters';
import { stamp } from '../../../m1/game/render/stamp';
import { timeOfDay } from '../../timeOfDay';
import { bodyOf, torso, arm as cArm, headShape, faceOn, hairTop, hairBack, whiskers, glasses, limb as cLimb, shoe, pickOf, type Body } from '../../spooky/costume';
import { box, hash, hour, dimmed, INK, toonSky, type Ctx } from '../kit';
import { dadArt } from '../bigkid/art';
import { MONUMENT_AT } from '../monument';
import {
  X, x1, TOP_Y, PIT_Y, STAGE_Y, AISLE, ROWS, ROW_W, ROW_RISE, STEPS, DECK_A, treadAt, D_FAR, D_SHELL, D_SET,
  MARQUEE, STAND, HIGHTOP, POLES, CROWD, SLEEPER, FRONT_ROW, RESERVED, GUARD_X, SHELL, SET, COUCH, TV, MOM, GRAMPS, SIS,
  KITCHEN, BOY_TRACK, type Fan,
} from './layout';
import { drawDad, drawCouch, can } from './dad';
import { drawMom, drawGramps, drawSis, drawBoy } from './family';
import { drawGuard, type GuardPose } from './guard';
import type { StageLook } from './show';

// ---------------------------------------------------------------------------------------------------------------
// The eye

type P = { x: number; y: number };
const eyeOf = (state: GameState): P => ({ x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT / 2 });
const proj = (E: P, x: number, y: number, s: number): P => ({ x: E.x + (x - E.x) * s, y: E.y + (y - E.y) * s });
const atDepth = (c: Ctx, E: P, s: number, fn: () => void) => { c.save(); c.translate(E.x, E.y); c.scale(s, s); c.translate(-E.x, -E.y); fn(); c.restore(); };
const seen = (state: GameState, E: P, xa: number, xb: number, s: number, m = 60) => { const a = proj(E, xa, 0, s).x, b = proj(E, xb, 0, s).x; return b > state.camera.x - m && a < state.camera.x + CANVAS_WIDTH + m; };
const quad = (c: Ctx, pts: P[], fill: string | CanvasPattern) => { c.beginPath(); c.moveTo(pts[0].x, pts[0].y); for (const p of pts.slice(1)) c.lineTo(p.x, p.y); c.closePath(); c.fillStyle = fill; c.fill(); };
/** A floor's strip (world x a..b at y) from depth d0 back to d1. */
const floor = (c: Ctx, E: P, a: number, b: number, y: number, d0: number, d1: number, fill: string) => quad(c, [proj(E, a, y, d0), proj(E, b, y, d0), proj(E, b, y, d1), proj(E, a, y, d1)], fill);
/** A wall face across depth at world x, from y0 up to y1 (a riser, the stage's front). */
const side = (c: Ctx, E: P, x: number, y0: number, y1: number, d0: number, d1: number, fill: string) => quad(c, [proj(E, x, y0, d0), proj(E, x, y1, d0), proj(E, x, y1, d1), proj(E, x, y0, d1)], fill);

const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');
const key = (k: string) => `ct-am-${k}-${timeOfDay().key}-${fontReady() ? 'f' : 'n'}`;
const LIP = '#FFFBEB';
/** The show's lettering (the posters', the gate's): slanted, banded yellow to orange, a purple drop shadow. */
const SHOW = (size = 2, T: (c: string) => string = c => c): Look => ({ sx: size, sy: size, bold: true, slant: 1, fill: [T('#FFFFFF'), T('#FDE047'), T('#F59E0B')], ink: T(INK), shadow: T('#3B0764'), drop: 2 });

// ---------------------------------------------------------------------------------------------------------------
// The sky

export const drawAmphiBackdrop = (c: Ctx, state: GameState) => toonSky(c, state, MONUMENT_AT.amphi, { hill: '#86C17A', near: '#5A9A5E' });

// ---------------------------------------------------------------------------------------------------------------
// The crowd: people sat on the bleachers facing the stage (right), the hip on the row at (0, 0), feet on the row below

const SHIRTS = ['#2563EB', '#DC2626', '#16A34A', '#F59E0B', '#7C3AED', '#0F766E', '#BE185D', '#57534E', '#F4F4F5'];
const PANTS = ['#1E3A8A', '#3F3F46', '#57534E', '#1F2937', '#78350F', '#6B7280'];
const fan = (g: Ctx, seed: number, what: Fan, f: number) => {
  const B = bodyOf(seed, 'stand', 0, what === 'knit' ? true : undefined), L = B.L;
  const shirt = pickOf(seed, 2, SHIRTS), pants = pickOf(seed, 3, PANTS);
  const sway = what === 'leaner' || what === 'finger' ? Math.sin(f * 0.03 + seed) * 0.06 : 0;
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
    // (the beer-can hat off the STUPID DAD STORE's shelf: two cans, the straws to his mouth)
    box(g, B.hx - 10, B.hy - 13, 20, 6, '#DC2626'); box(g, B.hx - 10, B.hy - 13, 20, 2, '#F87171');
    for (const s of [-1, 1]) { box(g, B.hx + s * 10 - 3, B.hy - 18, 6, 10, '#C8102E'); box(g, B.hx + s * 10 - 3, B.hy - 15, 6, 2, '#F4F1E8'); }
    g.strokeStyle = '#F5F5F4'; g.lineWidth = 1; g.beginPath(); g.moveTo(B.hx + 10, B.hy - 9); g.quadraticCurveTo(B.hx + 14, B.hy + 2, B.hx + 6, B.hy + 6); g.stroke();
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
      box(g, 8, fy - 22, 10, 20, INK); box(g, 9, fy - 21, 8, 18, '#FDE047'); box(g, 11, fy - 30, 4, 10, INK); box(g, 12, fy - 29, 2, 9, '#FDE047');
      box(g, 10, fy - 14, 6, 1, '#1E3A8A'); box(g, 12, fy - 17, 1, 6, '#1E3A8A');
      break;
    }
    case 'beer': case 'leaner': {
      cArm(g, B, -1, 6, B.hipY - 4, sleeve);
      const up = what === 'leaner' ? [16, B.shY - 16] : sip ? [B.hx + 6, B.hy + 6] : [12, B.hipY - 10];
      cArm(g, B, 1, up[0], up[1], sleeve);
      box(g, up[0] - 3, up[1] - 9, 6, 9, '#F5F5F4'); box(g, up[0] - 2, up[1] - 6, 4, 5, '#F2B33D');
      break;
    }
    case 'popcorn': {
      box(g, 4, B.hipY - 16, 12, 12, INK); for (let k = 0; k < 3; k++) box(g, 5 + k * 4, B.hipY - 15, 2, 10, k % 2 ? '#FFFFFF' : '#DC2626');
      for (let k = 0; k < 5; k++) box(g, 5 + k * 2, B.hipY - 18 - (k % 2) * 2, 3, 3, '#FEF3C7');
      cArm(g, B, -1, 6, B.hipY - 8, sleeve);
      cArm(g, B, 1, sip ? B.hx + 6 : 10, sip ? B.hy + 6 : B.hipY - 14, sleeve);
      break;
    }
    case 'knit': {
      cArm(g, B, -1, 8, B.hipY - 8, sleeve); cArm(g, B, 1, 13, B.hipY - 10 + ((f >> 3) % 2), sleeve);
      g.strokeStyle = '#A8A29E'; g.lineWidth = 1; g.beginPath(); g.moveTo(4, B.hipY - 14); g.lineTo(16, B.hipY - 4); g.moveTo(16, B.hipY - 14); g.lineTo(6, B.hipY - 3); g.stroke();
      box(g, 6, B.hipY - 8, 8, 5, '#BE185D');
      break;
    }
    default: cArm(g, B, -1, 6, B.hipY - 4, sleeve); cArm(g, B, 1, 10, B.hipY - 4, sleeve);
  }
  g.restore();
  if (what === 'asleep') for (let k = 0; k < 3; k++) { const u = ((f * 0.5 + k * 30) % 90) / 90; g.globalAlpha = 1 - u; box(g, B.hx - 8 + u * 10, B.hy - B.hipY - 16 - u * 24, 3 + k, 3 + k, '#E5E7EB'); g.globalAlpha = 1; }
};

// ---------------------------------------------------------------------------------------------------------------
// The concourse: the marquee, the BEER GARDEN, the high-top, the trash can

/** The marquee at the gate: a big board on two striped steel posts. */
const marquee = (c: Ctx) => {
  const cx = X(MARQUEE), w = 340, h = 196, top = TOP_Y - 330;
  c.save(); c.translate(cx, 0);
  stamp(c, key('marquee'), -w / 2 - 20, top - 20, w + 40, TOP_Y - top + 24, g => {
    const T = (col: string) => hour(col, 0.12);
    for (const s of [-1, 1]) { g.fillStyle = INK; g.fillRect(s * (w / 2 - 40) - 9, top + h - 10, 18, TOP_Y - top - h + 10); g.fillStyle = T('#1E3A8A'); g.fillRect(s * (w / 2 - 40) - 7, top + h - 8, 14, TOP_Y - top - h + 8); for (let y = top + h + 6; y < TOP_Y; y += 26) { g.fillStyle = T('#FDE047'); g.fillRect(s * (w / 2 - 40) - 7, y, 14, 6); } g.fillStyle = INK; g.fillRect(s * (w / 2 - 40) - 14, TOP_Y - 6, 28, 6); }
    // (the board: purple, a sunburst behind him, the dad off the poster on the left, the bulbs round its edge)
    g.fillStyle = INK; g.fillRect(-w / 2 - 4, top - 4, w + 8, h + 8); g.fillStyle = T('#7C3AED'); g.fillRect(-w / 2, top, w, h);
    g.save(); g.beginPath(); g.rect(-w / 2, top, w, h); g.clip();
    g.fillStyle = T('#8B5CF6'); for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; g.beginPath(); g.moveTo(-w / 2 + 70, top + h - 30); g.lineTo(-w / 2 + 70 + Math.cos(a) * 300, top + h - 30 + Math.sin(a) * 300); g.lineTo(-w / 2 + 70 + Math.cos(a + 0.26) * 300, top + h - 30 + Math.sin(a + 0.26) * 300); g.closePath(); g.fill(); }
    dadArt(g, -w / 2 + 70, top + h - 4, 1.35, 0.1, '#7C3AED');
    g.restore();
    for (let k = 0; k < 34; k++) { const t = k / 34, bx = -w / 2 + t * w, on = k % 2 === 0; g.fillStyle = INK; g.fillRect(bx - 2, top - 3, 5, 5); g.fillStyle = on ? '#FEF3C7' : '#B45309'; g.fillRect(bx - 1, top - 2, 3, 3); g.fillStyle = INK; g.fillRect(bx - 2, top + h - 2, 5, 5); g.fillStyle = on ? '#B45309' : '#FEF3C7'; g.fillRect(bx - 1, top + h - 1, 3, 3); }
    signText(g, 'THE UBX AMPHITHEATER PRESENTS', 60, top + 20, { sx: 1, sy: 1, bold: true, fill: T('#FDE68A'), ink: T(INK) });
    signText(g, 'STUPID DAD', 60, top + 52, SHOW(2, T));
    signText(g, 'LIVE!', 60, top + 92, { sx: 3, sy: 3, bold: true, slant: 1, fill: T('#FB7185'), ink: T(INK), shadow: T('#3B0764'), drop: 2, bulbs: { lit: true, col: '#FEF3C7', dim: '#9A3412' } });
    signText(g, 'STARRING THE ORIGINAL', 60, top + 114, { sx: 1, sy: 1, fill: T('#FFFFFF'), ink: T(INK) });
    signText(g, 'STUPID DAD HIMSELF', 60, top + 126, { sx: 1, sy: 1, fill: T('#FFFFFF'), ink: T(INK) });
    signText(g, 'LYLE BRISCOE!', 60, top + 146, { sx: 1, sy: 2, bold: true, fill: [T('#FFFFFF'), T('#FDE047')], ink: T(INK) });
    g.fillStyle = T('#1E3A8A'); g.fillRect(-w / 2, top + h - 30, w, 26);
    signText(g, 'SHOWS AT 11, 1, 3, 5 AND 7', 0, top + h - 12, { sx: 1, sy: 1, bold: true, fill: T('#FDE047'), ink: T(INK) });
    // (a vinyl banner zip-tied on under it, later)
    g.fillStyle = INK; g.fillRect(-120, top + h + 10, 240, 24); g.fillStyle = T('#F4F4F5'); g.fillRect(-118, top + h + 12, 236, 20);
    for (const s of [-1, 1]) { g.fillStyle = INK; g.fillRect(s * 112 - 1, top + h + 4, 2, 10); }
    signText(g, 'NO OUTSIDE BEER', 0, top + h + 27, { sx: 1, sy: 2, bold: true, fill: T('#DC2626') });
  });
  c.restore();
};

/** The BEER GARDEN's stand: a hut with a striped awning, the menu board, the taps and the neon, the vendor behind it. */
const beerStand = (c: Ctx, f: number) => {
  const a = X(STAND.a), w = STAND.b - STAND.a, top = TOP_Y - 190;
  c.save(); c.translate(a, 0);
  stamp(c, key('stand'), -10, top - 70, w + 20, TOP_Y - top + 74, g => {
    const T = (col: string) => dimmed(col);
    g.fillStyle = T(INK); g.fillRect(0, top, w, TOP_Y - top); g.fillStyle = T('#7C2D12'); g.fillRect(3, top + 3, w - 6, TOP_Y - top - 3);
    for (let x = 12; x < w; x += 18) { g.fillStyle = T('#6B2510'); g.fillRect(x, top + 3, 2, TOP_Y - top - 3); }
    // (the sign up top, the awning)
    g.fillStyle = T(INK); g.fillRect(10, top - 66, w - 20, 48); g.fillStyle = T('#1E3A8A'); g.fillRect(13, top - 63, w - 26, 42);
    signText(g, 'BEER GARDEN', w / 2, top - 32, SHOW(2, T));
    for (let k = 0; k < 10; k++) { g.fillStyle = T(k % 2 ? '#FFFFFF' : '#16A34A'); g.beginPath(); g.moveTo(k * (w / 10), top); g.lineTo((k + 1) * (w / 10), top); g.lineTo((k + 1) * (w / 10) - 4, top + 26); g.lineTo(k * (w / 10) - 4, top + 26); g.closePath(); g.fill(); g.fillStyle = T(k % 2 ? '#FFFFFF' : '#16A34A'); g.beginPath(); g.arc((k + 0.5) * (w / 10) - 4, top + 26, w / 20, 0, Math.PI); g.fill(); }
    g.strokeStyle = T(INK); g.lineWidth = 2; g.strokeRect(0, top, w, 26);
    // (the window: dark inside, the menu board, the taps, the neon BEER)
    g.fillStyle = T('#1C1917'); g.fillRect(16, top + 40, w - 32, 82);
    g.fillStyle = T('#0F172A'); g.fillRect(w - 128, top + 46, 104, 66);
    const menu = (t: string, y: number, col = '#FFFFFF') => signText(g, t, w - 76, top + y, { sx: 1, sy: 1, fill: T(col) });
    menu('COLD BEER  12', 60, '#FDE047'); menu('LITE BEER  11', 72, '#FDE047'); menu('NACHOS  9', 84); menu('SODA  ASK', 96); menu('NO REFUNDS', 108, '#FCA5A5');
    for (let k = 0; k < 4; k++) { g.fillStyle = T('#D4D4D8'); g.fillRect(40 + k * 18, top + 92, 6, 20); g.fillStyle = T(['#DC2626', '#2563EB', '#F59E0B', '#16A34A'][k]); g.fillRect(38 + k * 18, top + 84, 10, 9); }
    // (the counter: plywood, a stack of plastic cups, a tip jar with a dollar in it)
    g.fillStyle = T(INK); g.fillRect(-6, top + 120, w + 12, 12); g.fillStyle = T('#B45309'); g.fillRect(-4, top + 122, w + 8, 8);
    g.fillStyle = T('#F4F4F5'); for (let k = 0; k < 5; k++) g.fillRect(20, top + 102 - k * 4, 12, 4);
    g.fillStyle = T('#BAE6FD'); g.fillRect(w - 40, top + 106, 14, 14); g.fillStyle = T('#16A34A'); g.fillRect(w - 38, top + 112, 10, 4);
    signText(g, 'TIPS', w - 33, top + 104, { sx: 1, sy: 1, fill: T('#FFFFFF') });
  });
  c.restore();
  // (the neon BEER in the window, buzzing; a bad letter)
  const nx = a + 112, ny = top + 66, flick = (f % 97) < 4 ? 0.3 : 1;
  c.globalAlpha = flick; signText(c, 'BEER', nx, ny, { sx: 2, sy: 2, fill: '#FF5A8A', glow: '#FF2A6A' }); c.globalAlpha = 1;
  // (the vendor: bored, chin on a fist, behind the counter)
  c.save(); c.translate(a + 140, top + 120);
  const B = bodyOf(19, 'stand', 0), hb = { ...B };
  c.save(); c.translate(0, -B.shY - 24);
  torso(c, B, dimmed('#16A34A'), B.shY, B.shY + 18);
  hairBack(c, hb); headShape(c, hb, dimmed(B.L.skin)); faceOn(c, hb, { skin: dimmed(B.L.skin), eyes: 'tired', mouth: 'flat', look: -0.4 }); whiskers(c, hb); hairTop(c, hb);
  box(c, B.hx - 9, B.hy - 13, 18, 4, dimmed('#16A34A'));
  cArm(c, B, 1, B.hx + 4, B.hy + 10, { sleeve: dimmed('#16A34A'), hand: dimmed(B.L.skin) });
  c.restore(); c.restore();
};

/** The high-top by the stand: two regulars stood at it with their beers, swaying. */
const highTop = (c: Ctx, f: number) => {
  const x = X(HIGHTOP);
  box(c, x - 4, TOP_Y - 44, 8, 44, INK); box(c, x - 3, TOP_Y - 44, 6, 44, hour('#A8A29E'));
  box(c, x - 16, TOP_Y - 2, 32, 3, INK);
  box(c, x - 22, TOP_Y - 48, 44, 6, INK); box(c, x - 21, TOP_Y - 47, 42, 4, hour('#D6D3D1'));
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
    box(c, 13, -55, 6, 9, '#F5F5F4'); box(c, 14, -52, 4, 5, '#F2B33D');
    c.restore();
  }
};

/** A trash can by the gate, overflowing with cans and cups. */
const trash = (c: Ctx, x: number) => {
  box(c, x - 14, TOP_Y - 34, 28, 34, INK); box(c, x - 12, TOP_Y - 32, 24, 32, hour('#15803D'));
  box(c, x - 12, TOP_Y - 26, 24, 2, hour('#166534'));
  for (let k = 0; k < 6; k++) { const dx = -10 + k * 4, h2 = 4 + (k % 3) * 3; box(c, x + dx, TOP_Y - 34 - h2, 4, h2, k % 2 ? '#C8102E' : '#F5F5F4'); }
  box(c, x + 16, TOP_Y - 5, 8, 5, '#C8102E'); box(c, x - 26, TOP_Y - 3, 10, 3, '#F5F5F4');
};
/** A light pole: a tall steel mast, a bank of floodlights on top. */
const pole = (c: Ctx, x: number, footY: number) => {
  box(c, x - 3, footY - 420, 6, 420, dimmed(INK)); box(c, x - 2, footY - 420, 4, 420, dimmed('#9CA3AF'));
  box(c, x - 24, footY - 446, 48, 26, dimmed(INK));
  for (let k = 0; k < 4; k++) box(c, x - 22 + k * 11, footY - 444, 9, 9, timeOfDay().lamps > 0.3 ? '#FEF9C3' : dimmed('#E5E7EB'));
  for (let k = 0; k < 4; k++) box(c, x - 22 + k * 11, footY - 433, 9, 9, timeOfDay().lamps > 0.3 ? '#FEF3C7' : dimmed('#D1D5DB'));
};

// ---------------------------------------------------------------------------------------------------------------
// The pit: the front row (folding chairs, one RESERVED), litter; the CAST ONLY rope

const chair = (c: Ctx, x: number, y: number, reserved: boolean) => {
  box(c, x - 1, y - 30, 3, 30, INK); box(c, x + 12, y - 16, 3, 16, INK);
  box(c, x - 2, y - 18, 18, 4, INK); box(c, x - 1, y - 17, 16, 2, hour('#9CA3AF'));
  box(c, x - 3, y - 32, 5, 16, INK); box(c, x - 2, y - 31, 3, 14, hour('#9CA3AF'));
  if (reserved) { box(c, x - 8, y - 30, 14, 9, INK); box(c, x - 7, y - 29, 12, 7, '#F5F5F4'); box(c, x - 6, y - 26, 10, 1, '#DC2626'); }
};
const litter = (c: Ctx, state: GameState, E: P) => {
  for (let k = 0; k < 18; k++) {
    const rx = 1980 + hash(k * 3.7) * 600, d = 0.9 + hash(k * 1.3) * 0.09, x = X(rx);
    if (!seen(state, E, x - 10, x + 10, d)) continue;
    atDepth(c, E, d, () => {
      const t = Math.floor(hash(k * 5.1) * 4);
      if (t === 0) { c.save(); c.translate(x, PIT_Y - 3); c.rotate(1.5); box(c, -3, -5, 6, 10, '#C8102E'); box(c, -3, -2, 6, 2, '#F4F1E8'); c.restore(); }
      else if (t === 1) { box(c, x - 4, PIT_Y - 4, 9, 4, '#F5F5F4'); box(c, x - 3, PIT_Y - 3, 7, 2, '#E5E7EB'); }
      else if (t === 2) { for (let j = 0; j < 4; j++) box(c, x + j * 3, PIT_Y - 2 - (j % 2), 2, 2, '#FEF3C7'); }
      else { c.save(); c.translate(x, PIT_Y - 2); c.rotate(-0.3); box(c, -5, -2, 10, 3, '#9CA3AF'); c.restore(); }
    });
  }
};
/** The CAST ONLY rope across the foot of the stage steps: two brass stanchions (one at the front, one back across the
 *  steps), the velvet rope between them; unhooked (lying on the floor) once the guard's down. */
const stanchion = (c: Ctx, x: number) => { box(c, x - 3, PIT_Y - 40, 6, 40, INK); box(c, x - 2, PIT_Y - 40, 4, 40, '#D4A84A'); box(c, x - 7, PIT_Y - 4, 14, 4, INK); box(c, x - 4, PIT_Y - 44, 8, 6, INK); box(c, x - 3, PIT_Y - 43, 6, 4, '#F2C94C'); };
const rope = (c: Ctx, E: P, open: boolean) => {
  const x = X(STEPS.a - 4), dFar = 0.88;
  atDepth(c, E, dFar, () => stanchion(c, x));
  const p0 = proj(E, x, PIT_Y - 40, dFar), p1 = { x, y: PIT_Y - 40 };
  c.strokeStyle = '#7F1D1D'; c.lineWidth = 4; c.beginPath(); c.moveTo(p0.x, p0.y);
  if (open) c.quadraticCurveTo(p0.x + 4, PIT_Y - 6, p1.x - 18, PIT_Y - 2); else c.quadraticCurveTo((p0.x + p1.x) / 2, PIT_Y - 18, p1.x, p1.y);
  c.stroke(); c.strokeStyle = '#B91C1C'; c.lineWidth = 2; c.stroke();
  if (!open) { const mx = (p0.x + p1.x) / 2, my = (p0.y + p1.y) / 2 + 12; box(c, mx - 22, my - 2, 44, 14, INK); box(c, mx - 21, my - 1, 42, 12, '#F5F5F4'); signText(c, 'CAST ONLY', mx, my + 9, { sx: 1, sy: 1, bold: true, fill: '#B91C1C' }); }
  else { box(c, p1.x - 30, PIT_Y - 6, 44, 6, INK); box(c, p1.x - 29, PIT_Y - 5, 42, 4, '#F5F5F4'); }
  stanchion(c, x);
};

// ---------------------------------------------------------------------------------------------------------------
// The stage: the band shell, the banner, the set, the TV

const shell = (c: Ctx, f: number, applause: boolean) => {
  const cx = X(SHELL.b), cy = STAGE_Y, rx = SHELL.b - SHELL.a, ry = 400;
  stamp(c, key('shell'), cx - rx - 10, cy - ry - 10, rx + 20, ry + 14, g => {
    const bands = ['#F3E9D2', '#7DB7E8', '#F3E9D2', '#5B9BD5', '#F3E9D2', '#7DB7E8', '#E9DCBC'];
    for (let i = 0; i < bands.length; i++) {
      const k = 1 - i / bands.length;
      g.fillStyle = INK; g.beginPath(); g.ellipse(cx, cy, rx * k + 3, ry * k + 3, 0, Math.PI, Math.PI * 1.5); g.lineTo(cx, cy); g.closePath(); g.fill();
      g.fillStyle = hour(bands[i], 0.08); g.beginPath(); g.ellipse(cx, cy, rx * k, ry * k, 0, Math.PI, Math.PI * 1.5); g.lineTo(cx, cy); g.closePath(); g.fill();
    }
    // (the ribs: out from the bottom of the back)
    g.strokeStyle = hour('#C9B98F', 0.08); g.lineWidth = 3;
    for (let k = 1; k < 8; k++) { const a = Math.PI + (k / 8) * Math.PI * 0.5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry); g.stroke(); }
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, Math.PI, Math.PI * 1.5); g.stroke();
  });
  // (the lip's bulbs: chasing)
  for (let k = 0; k < 40; k++) { const a = Math.PI + (k / 40) * Math.PI * 0.5, bx = cx + Math.cos(a) * (rx - 6), by = cy + Math.sin(a) * (ry - 6), on = (k + Math.floor(f / 6)) % 3 === 0; box(c, bx - 2, by - 2, 5, 5, INK); box(c, bx - 1, by - 1, 3, 3, on ? '#FEF3C7' : '#B45309'); }
  // (the banner hung off it on chains: STUPID DAD LIVE!; the APPLAUSE sign under it)
  const bx = X((SET.a + SET.b) / 2), by = STAGE_Y - 300;
  for (const s of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(bx + s * 150, by - 70); c.lineTo(bx + s * 150, by); c.stroke(); }
  stamp(c, key('banner'), bx - 190, by - 8, 380, 84, g => {
    g.fillStyle = INK; g.fillRect(bx - 182, by, 364, 72); g.fillStyle = '#B91C1C'; g.fillRect(bx - 179, by + 3, 358, 66);
    g.fillStyle = '#7F1D1D'; g.fillRect(bx - 179, by + 60, 358, 9);
    signText(g, 'STUPID DAD', bx - 40, by + 44, SHOW(3));
    signText(g, 'LIVE!', bx + 120, by + 44, { sx: 3, sy: 3, bold: true, slant: 1, fill: ['#FFFFFF', '#FDE68A'], ink: INK, shadow: '#3B0764', drop: 2 });
  });
  const ay = STAGE_Y - 200;
  for (const s of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(bx + s * 40, by + 72); c.lineTo(bx + s * 40, ay); c.stroke(); }
  box(c, bx - 54, ay, 108, 26, INK); box(c, bx - 51, ay + 3, 102, 20, applause ? '#DC2626' : '#4A1010');
  signText(c, 'APPLAUSE', bx, ay + 18, applause ? { sx: 1, sy: 2, bold: true, fill: '#FFFFFF', glow: '#FF6060' } : { sx: 1, sy: 2, bold: true, fill: '#7A3030' });
};

/** The set's wall: the sitcom living room (mustard wallpaper, paneling, the window, the portrait, the clock, the
 *  kitchen's swing door: open while the Boy's going through it). */
const setWall = (c: Ctx, doorOpen: number, cleared: boolean) => {
  const a = X(SET.a), b = X(SET.b), top = STAGE_Y - 180;
  stamp(c, `ct-am-setwall-${cleared ? 1 : 0}-${fontReady() ? 'f' : 'n'}`, a - 12, top - 4, b - a + 24, STAGE_Y - top + 6, g => {
    // (the flat's plywood edges and its jacks at either end)
    for (const ex of [a - 8, b]) { g.fillStyle = INK; g.fillRect(ex, top, 8, STAGE_Y - top); g.fillStyle = '#C8A26A'; g.fillRect(ex + 1, top + 1, 6, STAGE_Y - top - 2); }
    g.fillStyle = INK; g.fillRect(a, top, b - a, STAGE_Y - top);
    g.fillStyle = '#D9B45A'; g.fillRect(a + 2, top + 2, b - a - 4, STAGE_Y - top - 50);
    g.fillStyle = '#B8923C'; for (let x = a + 12; x < b; x += 28) for (let y = top + 14; y < STAGE_Y - 56; y += 28) { g.beginPath(); g.moveTo(x, y - 6); g.lineTo(x + 5, y); g.lineTo(x, y + 6); g.lineTo(x - 5, y); g.closePath(); g.fill(); }
    // (the paneling, the chair rail, the baseboard)
    g.fillStyle = '#7A4A2A'; g.fillRect(a + 2, STAGE_Y - 50, b - a - 4, 48);
    g.fillStyle = '#5E361C'; for (let x = a + 20; x < b; x += 24) g.fillRect(x, STAGE_Y - 50, 2, 48);
    g.fillStyle = '#9A6A40'; g.fillRect(a + 2, STAGE_Y - 54, b - a - 4, 5); g.fillStyle = '#3E2410'; g.fillRect(a + 2, STAGE_Y - 8, b - a - 4, 6);
    // (the window: a painted street, a house over the road, a tree; orange curtains)
    const wx = X(2990), wy = top + 30;
    g.fillStyle = INK; g.fillRect(wx - 3, wy - 3, 126, 86); g.fillStyle = '#93C5FD'; g.fillRect(wx, wy, 120, 80);
    g.fillStyle = '#86EFAC'; g.fillRect(wx, wy + 56, 120, 24); g.fillStyle = '#F5F5F4'; g.fillRect(wx + 60, wy + 30, 40, 28); g.fillStyle = '#B91C1C'; g.beginPath(); g.moveTo(wx + 56, wy + 30); g.lineTo(wx + 80, wy + 14); g.lineTo(wx + 104, wy + 30); g.fill();
    g.fillStyle = '#166534'; g.beginPath(); g.arc(wx + 26, wy + 40, 16, 0, Math.PI * 2); g.fill(); g.fillStyle = '#78350F'; g.fillRect(wx + 24, wy + 50, 5, 14);
    g.fillStyle = '#F5F5F4'; g.fillRect(wx + 58, wy, 4, 80); g.fillRect(wx, wy + 38, 120, 4);
    g.fillStyle = '#EA580C'; g.fillRect(wx - 14, wy - 8, 22, 94); g.fillRect(wx + 112, wy - 8, 22, 94);
    g.fillStyle = '#C2410C'; for (let k = 0; k < 3; k++) { g.fillRect(wx - 10 + k * 6, wy - 8, 2, 94); g.fillRect(wx + 116 + k * 6, wy - 8, 2, 94); }
    g.fillStyle = INK; g.fillRect(wx - 18, wy - 12, 156, 5);
    // (the family portrait: the cast as the show drew them, gold frame, a black ribbon across its corner)
    const px0 = X(3226), py0 = top + 24;
    g.fillStyle = INK; g.fillRect(px0 - 4, py0 - 4, 92, 68); g.fillStyle = '#D4A84A'; g.fillRect(px0 - 2, py0 - 2, 88, 64); g.fillStyle = '#7DD3FC'; g.fillRect(px0 + 4, py0 + 4, 76, 52);
    g.save(); g.beginPath(); g.rect(px0 + 4, py0 + 4, 76, 52); g.clip(); dadArt(g, px0 + 46, py0 + 58, 0.5, 0.05, '#7DD3FC', false, true); g.restore();
    g.fillStyle = '#111111'; g.beginPath(); g.moveTo(px0 + 60, py0 - 2); g.lineTo(px0 + 86, py0 - 2); g.lineTo(px0 + 86, py0 + 24); g.closePath(); g.fill();
    g.fillStyle = '#2A2A2A'; g.beginPath(); g.moveTo(px0 + 66, py0 - 2); g.lineTo(px0 + 86, py0 + 18); g.lineTo(px0 + 86, py0 + 10); g.lineTo(px0 + 74, py0 - 2); g.closePath(); g.fill();
    // (the clock: stopped at five; the lamp's shade on a little table)
    const cx = X(3460), cy = top + 44;
    g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, 15, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FEF3C7'; g.beginPath(); g.arc(cx, cy, 13, 0, Math.PI * 2); g.fill();
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy - 10); g.moveTo(cx, cy); g.lineTo(cx + 5, cy + 4); g.stroke();
    signText(g, "IT'S FIVE O'CLOCK", cx, cy + 30, { sx: 1, sy: 1, fill: '#7A4A2A' });
    signText(g, 'SOMEWHERE', cx, cy + 40, { sx: 1, sy: 1, fill: '#7A4A2A' });
    // (the kitchen doorway: a dark gap, the swing door hung in it)
    const kx = X(KITCHEN.x);
    g.fillStyle = INK; g.fillRect(kx - 30, STAGE_Y - 124, 60, 124); g.fillStyle = '#2A1A10'; g.fillRect(kx - 27, STAGE_Y - 121, 54, 121);
    g.fillStyle = '#F5F5F4'; g.fillRect(kx - 30, STAGE_Y - 130, 60, 6);
  });
  // (the swing door: shut, or swung in as he goes through)
  const kx = X(KITCHEN.x), k = Math.max(0, Math.min(1, doorOpen));
  const dw = 52 * (1 - k * 0.85);
  box(c, kx - 26, STAGE_Y - 120, dw, 118, INK); box(c, kx - 24, STAGE_Y - 118, Math.max(1, dw - 4), 114, '#A16207');
  if (dw > 20) { c.fillStyle = INK; c.beginPath(); c.arc(kx - 26 + dw / 2, STAGE_Y - 86, 8 * (dw / 52), 0, Math.PI * 2); c.fill(); c.fillStyle = '#BAE6FD'; c.beginPath(); c.arc(kx - 26 + dw / 2, STAGE_Y - 86, 6 * (dw / 52), 0, Math.PI * 2); c.fill(); }
};

/** The rug and the Boy's track (on the deck). */
const rugAndTrack = (c: Ctx, E: P) => {
  const a = X(3060), b = X(3640);
  quad(c, [proj(E, a, STAGE_Y, 0.86), proj(E, b, STAGE_Y, 0.86), proj(E, b + 20, STAGE_Y, 0.99), proj(E, a - 20, STAGE_Y, 0.99)], '#8A4A20');
  quad(c, [proj(E, a + 12, STAGE_Y, 0.875), proj(E, b - 12, STAGE_Y, 0.875), proj(E, b + 6, STAGE_Y, 0.975), proj(E, a - 6, STAGE_Y, 0.975)], '#C2702E');
  quad(c, [proj(E, a + 30, STAGE_Y, 0.9), proj(E, b - 30, STAGE_Y, 0.9), proj(E, b - 16, STAGE_Y, 0.955), proj(E, a + 16, STAGE_Y, 0.955)], '#8A4A20');
  // (the track: a steel slot in the boards, dead straight, from the couch's end back to the kitchen door)
  const p0 = proj(E, X(BOY_TRACK.a.x), STAGE_Y, BOY_TRACK.a.d), p1 = proj(E, X(BOY_TRACK.b.x), STAGE_Y, BOY_TRACK.b.d);
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke();
  c.strokeStyle = '#9CA3AF'; c.lineWidth = 2; c.stroke();
};

/** The TV on its wheeled cart, turned toward the couch (three-quarters to us): the game (the same tape), rolling, off. */
const tv = (c: Ctx, x: number, f: number, mode: 'game' | 'roll' | 'off') => {
  const y = STAGE_Y;
  // (the cart)
  box(c, x - 40, y - 46, 80, 6, INK); box(c, x - 39, y - 45, 78, 4, '#9CA3AF');
  for (const s of [-1, 1]) { box(c, x + s * 34 - 2, y - 42, 4, 36, INK); c.fillStyle = INK; c.beginPath(); c.arc(x + s * 34, y - 4, 4, 0, Math.PI * 2); c.fill(); }
  box(c, x - 38, y - 18, 76, 4, INK);
  // (the set: a wood-grain box, turned, the screen on its near face, the rabbit ears)
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 44, y - 46); c.lineTo(x + 26, y - 46); c.lineTo(x + 46, y - 54); c.lineTo(x + 46, y - 112); c.lineTo(x - 24, y - 112); c.lineTo(x - 44, y - 104); c.closePath(); c.fill();
  c.fillStyle = '#7A4A2A'; c.beginPath(); c.moveTo(x + 26, y - 48); c.lineTo(x + 44, y - 55); c.lineTo(x + 44, y - 110); c.lineTo(x + 26, y - 103); c.closePath(); c.fill();
  c.fillStyle = '#5E361C'; c.beginPath(); c.moveTo(x - 42, y - 104); c.lineTo(x - 24, y - 110); c.lineTo(x + 44, y - 110); c.lineTo(x + 26, y - 103); c.closePath(); c.fill();
  box(c, x - 42, y - 102, 68, 54, '#9A6A40');
  const sx = x - 38, sy = y - 98, sw = 50, sh = 44;
  box(c, sx - 1, sy - 1, sw + 2, sh + 2, INK);
  if (mode === 'off') { box(c, sx, sy, sw, sh, '#1F2937'); box(c, sx + 4, sy + 4, 10, 4, 'rgba(255,255,255,0.15)'); }
  else {
    c.save(); c.beginPath(); c.rect(sx, sy, sw, sh); c.clip();
    box(c, sx, sy, sw, sh, '#2F8A3A');
    const scroll = (f * 0.6) % 16;
    for (let k = -1; k < 5; k++) box(c, sx + k * 16 - scroll, sy, 2, sh, '#E8F5E9');
    for (let k = 0; k < 8; k++) { const px = sx + ((k * 13 + f * (k % 2 ? 0.4 : 0.3)) % sw), py = sy + 10 + (k * 7) % 28; box(c, px, py, 2, 3, k % 2 ? '#DC2626' : '#FFFFFF'); }
    box(c, sx, sy + sh - 8, sw, 8, '#111827');
    signText(c, 'UBX', sx + 9, sy + sh - 1, { sx: 1, sy: 1, fill: '#FDE047' });
    signText(c, '14 10', sx + 34, sy + sh - 1, { sx: 1, sy: 1, fill: '#FFFFFF' });
    if (mode === 'roll') {
      const band = (f * 3) % (sh + 20) - 10;
      box(c, sx, sy + band, sw, 6, '#111111');
      for (let k = 0; k < 30; k++) box(c, sx + hash(k + f) * sw, sy + hash(k * 3 + f) * sh, 2, 1, hash(k * 7 + f) > 0.5 ? '#FFFFFF' : '#6B7280');
    }
    c.restore();
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(sx + 2, sy + 2, 14, 3);
  }
  box(c, x + 16, y - 92, 6, 6, INK); box(c, x + 17, y - 91, 4, 4, '#D4D4D8'); box(c, x + 16, y - 80, 6, 6, INK); box(c, x + 17, y - 79, 4, 4, '#D4D4D8');
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 4, y - 112); c.lineTo(x - 16, y - 146); c.moveTo(x + 8, y - 112); c.lineTo(x + 30, y - 142); c.stroke();
  c.strokeStyle = '#D4D4D8'; c.lineWidth = 1; c.stroke();
  c.fillStyle = '#F5F5F4'; c.beginPath(); c.arc(x - 6, y - 52, 3, 0, Math.PI * 2); c.fill();
};

// ---------------------------------------------------------------------------------------------------------------
// The ground: the floors back to the bowl's far side, and the near cut (lit along every top he stands on)

/** A bleacher row's top: level with the second of the aisle's two steps beside it (the first's the half step). */
const rowY = (k: number) => TOP_Y + (2 * k + 1) * (ROW_RISE / 2);
const rowA = (k: number) => AISLE.a + k * ROW_W;

const floors = (c: Ctx, state: GameState, E: P) => {
  const cam = state.camera.x;
  // (the bowl's far bank: grass up to the rim, a hedge along it; behind the concourse, the hedge)
  const bankTop = TOP_Y - 26;
  const l = Math.max(X(-200), cam - 200), r = Math.min(X(SHELL.a + 40), cam + CANVAS_WIDTH + 300);
  if (r > l) {
    c.beginPath();
    const p0 = proj(E, l, bankTop, D_FAR - 0.02); c.moveTo(p0.x, p0.y);
    const p1 = proj(E, r, bankTop, D_FAR - 0.02); c.lineTo(p1.x, p1.y);
    for (let x = r; x >= l; x -= 20) { const p = proj(E, x, treadAt(x - X(0)), D_FAR - 0.02); c.lineTo(p.x, p.y); }
    c.closePath(); c.fillStyle = dimmed('#5A9A4E'); c.fill();
    for (let x = Math.floor(l / 40) * 40; x < r; x += 40) { const p = proj(E, x, bankTop, D_FAR - 0.02); c.fillStyle = dimmed('#3F7A3A'); c.beginPath(); c.arc(p.x, p.y, 14, Math.PI, 0); c.fill(); }
  }
  // (the concourse's paving)
  if (seen(state, E, X(-200), X(AISLE.a), 1)) {
    floor(c, E, X(-200), X(AISLE.a), TOP_Y, D_FAR, 1, hour('#CFC8B8'));
    c.strokeStyle = hour('#B5AD9C'); c.lineWidth = 1;
    for (const d of [0.76, 0.84, 0.92]) { const a = proj(E, X(-200), TOP_Y, d), b = proj(E, X(AISLE.a), TOP_Y, d); c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
    for (let x = Math.floor((cam - 100) / 80) * 80; x < Math.min(X(AISLE.a), cam + 900); x += 80) { const a = proj(E, x, TOP_Y, D_FAR), b = proj(E, x, TOP_Y, 1); c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
  }
  // (the bleacher rows: aluminum planks over concrete, each row's riser down from the last (facing the stage))
  for (let k = 0; k < ROWS; k++) {
    const a = X(rowA(k)), b = a + ROW_W, y = rowY(k);
    if (!seen(state, E, a, b, 1) && !seen(state, E, a, b, D_FAR)) continue;
    if (E.x > a) side(c, E, a, k ? rowY(k - 1) : TOP_Y, y, D_FAR, 1, hour('#8A8478'));
    floor(c, E, a, b, y, D_FAR, 1, hour('#C3C9D1'));
    c.strokeStyle = hour('#9AA2AE'); c.lineWidth = 1;
    for (const d of [0.78, 0.86, 0.94]) { const p = proj(E, a, y, d), q = proj(E, b, y, d); c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke(); }
    const p = proj(E, a, y, D_FAR), q = proj(E, a, y, 1); c.strokeStyle = hour('#E5E9EE'); c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke();
    // (the row's number, stenciled on its riser)
    if (E.x > a) { const n = proj(E, a, y - ROW_RISE / 2, 0.9); box(c, n.x - 1, n.y - 3, 3, 6, hour('#F5F5F4')); }
  }
  // (the pit's floor, the last half step down onto it)
  if (seen(state, E, X(AISLE.b), X(STEPS.b), 1) || seen(state, E, X(AISLE.b), X(STEPS.b), D_FAR)) {
    if (E.x > X(AISLE.b)) side(c, E, X(AISLE.b), rowY(ROWS - 1), PIT_Y, D_FAR, 1, hour('#8A8478'));
    floor(c, E, X(AISLE.b), X(DECK_A), PIT_Y, D_FAR, 1, hour('#8E877A'));
  }
  // (the stage's front, facing the bowl, and its deck: boards, along)
  if (E.x < X(DECK_A)) { side(c, E, X(DECK_A), PIT_Y, STAGE_Y, D_SHELL, 1, '#5E361C'); for (let k = 0; k < 6; k++) { const d = D_SHELL + (k + 0.5) * ((1 - D_SHELL) / 6); const p = proj(E, X(DECK_A), PIT_Y, d), q = proj(E, X(DECK_A), STAGE_Y, d); c.strokeStyle = '#3E2410'; c.lineWidth = 1; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke(); } }
  if (seen(state, E, X(DECK_A), X(4200), 1) || seen(state, E, X(DECK_A), X(4200), D_SHELL)) {
    floor(c, E, X(DECK_A), X(4200), STAGE_Y, D_SHELL, 1, '#9A6A40');
    c.strokeStyle = '#7A4F2C'; c.lineWidth = 1;
    for (let k = 1; k < 10; k++) { const d = D_SHELL + (k / 10) * (1 - D_SHELL), p = proj(E, X(DECK_A), STAGE_Y, d), q = proj(E, X(4200), STAGE_Y, d); c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke(); }
    // (spike tape: where everybody stands)
    for (const [rx, d] of [[3010, 0.98], [3230, 0.97], [3340, 0.96]] as const) { const p = proj(E, X(rx), STAGE_Y, d); box(c, p.x - 6, p.y - 1, 12, 2, '#FDE047'); }
  }
};

/** The near cut: the ground's section along the play plane (concrete in the bowl, the stage's skirt), the steps, every
 *  top lit. */
const nearCut = (c: Ctx, state: GameState) => {
  const l = Math.max(X(-200), state.camera.x - 40), r = Math.min(x1 + 200, state.camera.x + CANVAS_WIDTH + 40);
  // (the section: the step profile, filled down)
  c.beginPath(); c.moveTo(l, state.camera.y + CANVAS_HEIGHT + 40);
  for (let x = l; x <= r; x += 2) c.lineTo(x, treadAt(x - X(0)));
  c.lineTo(r, state.camera.y + CANVAS_HEIGHT + 40); c.closePath();
  c.fillStyle = hour('#A69F90'); c.fill();
  // (the stage's skirt: red, white and blue bunting along its front, dark under)
  const da = X(STEPS.a);
  if (r > da) { box(c, Math.max(da, l), STAGE_Y + 2, r - Math.max(da, l), CANVAS_HEIGHT, '#3E2410'); for (let x = Math.max(X(DECK_A), Math.floor(l / 40) * 40); x < r; x += 40) { const col = ['#DC2626', '#F5F5F4', '#1D4ED8'][Math.floor((x - X(0)) / 40) % 3]; c.fillStyle = col; c.beginPath(); c.moveTo(x, STAGE_Y + 4); c.quadraticCurveTo(x + 20, STAGE_Y + 22, x + 40, STAGE_Y + 4); c.closePath(); c.fill(); } }
  // (every tread's lit top, its front edge dark)
  c.fillStyle = INK;
  let px = l, py = treadAt(l - X(0));
  for (let x = l + 2; x <= r + 2; x += 2) {
    const y = treadAt(x - X(0));
    if (y !== py || x > r) { box(c, px, py, x - px, 3, x - X(0) >= STEPS.a ? '#FDE68A' : LIP); box(c, px, py + 3, x - px, 1, INK); if (y !== py) box(c, x - 1, Math.min(y, py), 2, Math.abs(y - py) + 3, INK); px = x; py = y; }
  }
};

// ---------------------------------------------------------------------------------------------------------------

export interface AmphiLook { stage: StageLook; guard: { pose: GuardPose; t: number; ice: boolean }; cleared: boolean; doorOpen: number }

/** Behind him: all of it, back to front. */
export const drawAmphiBack = (c: Ctx, state: GameState, look: AmphiLook) => {
  const E = eyeOf(state), f = state.frame, cam = state.camera.x;
  floors(c, state, E);
  // (the light poles, deep: behind everybody)
  for (const px of POLES) { const x = X(px); if (seen(state, E, x - 30, x + 30, 0.72)) atDepth(c, E, 0.72, () => pole(c, x, treadAt(px))); }
  // (the stage's shell, the set's wall: the deepest things on the stage)
  if (seen(state, E, X(SHELL.a), X(SHELL.b), D_SHELL)) atDepth(c, E, D_SHELL, () => shell(c, f, look.stage.applause));
  if (seen(state, E, X(SET.a), X(SET.b), D_SET)) atDepth(c, E, D_SET, () => setWall(c, look.doorOpen, look.cleared));
  if (seen(state, E, X(3000), X(3700), 0.9)) rugAndTrack(c, E);
  // Everything else at its depth, far to near
  const items: { d: number; x: number; draw: () => void }[] = [];
  const S = look.stage;
  // (the concourse)
  items.push({ d: 0.84, x: X((STAND.a + STAND.b) / 2), draw: () => beerStand(c, f) });
  items.push({ d: 0.9, x: X(HIGHTOP), draw: () => highTop(c, f) });
  items.push({ d: 0.95, x: X(260), draw: () => trash(c, X(260)) });
  items.push({ d: 0.97, x: X(MARQUEE), draw: () => marquee(c) });
  // (the crowd: everybody while there's a show; once it's over, the one asleep)
  CROWD.forEach(([row, d, seed, what], i) => {
    if (!S.crowd && i !== SLEEPER) return;
    const hx = X(rowA(row) + ROW_W - 18);
    items.push({ d, x: hx, draw: () => { c.save(); c.translate(hx, rowY(row)); fan(c, seed, what, f); c.restore(); } });
  });
  // (the front row)
  FRONT_ROW.forEach(([rx, d], i) => items.push({ d, x: X(rx), draw: () => chair(c, X(rx), PIT_Y, i === RESERVED) }));
  // (the stage: the furniture, the family, him)
  const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
  const bu = S.boy.u, bx = lerp(X(BOY_TRACK.a.x), X(BOY_TRACK.b.x), bu), bd = lerp(BOY_TRACK.a.d, BOY_TRACK.b.d, bu);
  const boyGone = bu > 0.97;
  if (!boyGone) items.push({ d: bd, x: bx, draw: () => drawBoy(c, bx, STAGE_Y, S.boy, S.boy.arm, S.boy.beer) });
  items.push({ d: MOM.d, x: X(MOM.x), draw: () => drawMom(c, X(MOM.x), STAGE_Y, S.mom) });
  items.push({ d: COUCH.d, x: X(COUCH.x), draw: () => drawCouch(c, X(COUCH.x), STAGE_Y, f, { empty: !S.dad || S.dad.d > COUCH.d + 0.001 || S.dad.pose === 'gone' }) });
  items.push({ d: GRAMPS.d + 0.001, x: X(GRAMPS.x), draw: () => drawGramps(c, X(GRAMPS.x), STAGE_Y, S.gramps) });
  items.push({ d: TV.d, x: X(TV.x), draw: () => tv(c, X(TV.x), f, S.tv) });
  items.push({ d: SIS.d, x: X(SIS.x), draw: () => drawSis(c, X(SIS.x), STAGE_Y, S.sis) });
  if (S.dad) { const D = S.dad; items.push({ d: D.d + 0.0005, x: X(D.x), draw: () => drawDad(c, X(D.x), STAGE_Y, D.pose, f, { t: D.t, talking: D.talking, face: D.face, can: D.can, canFull: D.canFull, crushed: D.crushed, facing: D.facing }) }); }
  // (the empties: a pyramid of his cans by the couch; more once it's over)
  items.push({ d: 0.93, x: X(3190), draw: () => { const n = look.cleared ? 10 : 6; for (let k = 0; k < n; k++) { const row = k < 4 ? 0 : k < 7 ? 1 : k < 9 ? 2 : 3, col = k - [0, 4, 7, 9][row]; can(c, X(3172) + col * 7 + row * 3.5, STAGE_Y - 8 - row * 13, 0, 0, false); } } });
  items.sort((a, b) => a.d - b.d);
  for (const it of items) if (seen(state, E, it.x - 220, it.x + 220, it.d)) atDepth(c, E, it.d, it.draw);
  litter(c, state, E);
  if (X(STEPS.a) > cam - 200 && X(STEPS.a) < cam + CANVAS_WIDTH + 200) rope(c, E, look.guard.pose === 'down' || look.guard.pose === 'keel');
  nearCut(c, state);
  // (the guard, at the foot of the steps)
  const gx = X(GUARD_X);
  if (gx > cam - 200 && gx < cam + CANVAS_WIDTH + 200) drawGuard(c, gx, PIT_Y, look.guard.pose, f, look.guard.t, look.guard.ice);
};

/** After dark: the light poles' floods, the stand's neon, the stage's soft fills, the TV's glow (never spotlights). */
export const amphiLamps = (state: GameState): Light[] => {
  const out: Light[] = [], cam = state.camera.x, on = (x: number) => x > cam - 400 && x < cam + CANVAS_WIDTH + 400;
  const tod = timeOfDay();
  for (const px of POLES) { const x = X(px); if (on(x) && tod.lamps > 0.05) out.push({ x, y: treadAt(px) - 300, r: 320, a: 0.32, color: '#FEF3C7' }); }
  if (on(X(STAND.a + 112))) out.push({ x: X(STAND.a + 112), y: TOP_Y - 120, r: 120, a: 0.4, color: '#FF5A8A' });
  if (on(X(3300))) { out.push({ x: X(3000), y: STAGE_Y - 160, r: 300, a: 0.42, color: '#FFE8C0' }); out.push({ x: X(3500), y: STAGE_Y - 160, r: 300, a: 0.42, color: '#FFE8C0' }); out.push({ x: X(TV.x), y: STAGE_Y - 80, r: 90, a: 0.3, color: '#9AE6B4' }); }
  if (on(X(MARQUEE))) out.push({ x: X(MARQUEE), y: TOP_Y - 240, r: 200, a: 0.35, color: '#FDE68A' });
  return out;
};
