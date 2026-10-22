// THE STAIRS DOWN: from the arch at the end of the castle's gallery, a long stone stairway down into the dungeon, four
// flights and their landings, 1000 down, and darker all the way: the sconces fewer and further apart, then out, till
// it's black but for right round him (and what's down there with him: its eyes, the glow on it). On the way down: bats
// off the ceiling, a skeleton lurking on a landing, an igor at the bottom, eyes in the dark. The PA narrates it
// (ominous, and stupid); Meathead can't see shit. At the bottom, the dungeon's cells.
// Back up them later: the staff have been round and lit every sconce (and left a note).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GroundRun } from '../../../m1/game/core/terrain';
import type { Light } from '../../../m1/game/render/lighting';
import type { Controls } from '../../../m1/game/platform/input';
import type { SoundType } from '../../../m1/types';
import { meatheadSays, hands } from '../section';
import { INK, box, checker, plaque, rockFill, blockFill, stoneLedge, torch, STONE, IRON, mix, hazeBands, bandedGradient, stamp } from './paint';
import { setUi } from '../../store';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { signAt, candle, enamel, print, led } from '../letters';
import { hash } from '../../intro/art/kit';
import { SECTIONS, GY } from '../geometry';
import { spawnStaff } from '../castle/staff';
import { paStory, paBusy, byPants, pick } from '../castle/pa';
import * as L from './lines';

const S = SECTIONS.dungeon.x0;
/** Where the cells start (the foot of the stairs). */
export const CELLS = S + 1950;
export const STAIR_TOP = GY - 1000;
/** The stairway's line, his feet's: the top landing, then flight, landing, flight... down to the cells' floor. */
const PTS: [number, number][] = [
  // (from the section's own start: a run reaching back past it would be a solid block in the castle's way)
  [S, STAIR_TOP], [S + 200, STAIR_TOP], [S + 550, STAIR_TOP + 250], [S + 650, STAIR_TOP + 250], [S + 1000, STAIR_TOP + 500],
  [S + 1150, STAIR_TOP + 500], [S + 1500, STAIR_TOP + 750], [S + 1600, STAIR_TOP + 750], [CELLS, GY],
];
export const stairRuns = (): GroundRun[] => PTS.slice(1).map((b, i) => ({ x1: PTS[i][0], y1: PTS[i][1], x2: b[0], y2: b[1], surface: 'hard' }));
const floorAt = (x: number) => {
  for (let i = 1; i < PTS.length; i++) if (x <= PTS[i][0]) { const [ax, ay] = PTS[i - 1], [bx, by] = PTS[i]; return ay + (by - ay) * Math.max(0, Math.min(1, (x - ax) / (bx - ax))); }
  return GY;
};
/** The tunnel's height over the steps. */
const HEAD = 300;
/** The sconces down it (fewer and further apart as it goes); the first so many lit, the rest burnt out. */
const SCONCES = [S + 175, S + 280, S + 560, S + 900, S + 1320, S + 1760];
const LIT = 4;
/** Eyes in the dark (only on the way down, first time). */
const EYES: [number, number][] = [[S + 1220, STAIR_TOP + 360], [S + 1430, STAIR_TOP + 560], [S + 1700, STAIR_TOP + 700], [S + 1860, GY - 190]];

/** Been down them (the way back up's lit); kept across his deaths, fresh from the start of the land. */
let descended = false, told = 0, saidDark = 0;
export const resetStairs = (state: GameState) => { if (state.checkpoint < 10) { descended = false; told = 0; saidDark = 0; } };
export const initStairs = (state: GameState) => { if (state.checkpoint >= 21) { descended = true; told = 2; saidDark = 2; } };

export const buildStairs = (state: GameState) => {
  spawnStaff(state, 'bat', S + 720, STAIR_TOP + 120, 71); spawnStaff(state, 'bat', S + 1320, STAIR_TOP + 430, 72);
  // (the skeleton lurking on the second landing, the igor at the foot)
  spawnStaff(state, 'skeleton', S + 1080, STAIR_TOP + 500, 73);
  spawnStaff(state, 'igor', S + 1560, STAIR_TOP + 750, 74);
};

export const runStairs = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2;
  // (lit for the way back up once he's well into the dungeon, out of sight of them: the dark there never jumps)
  if (cx >= CELLS + 1200) descended = true;
  if (cx < S || cx > CELLS + 100) return;
  // The PA's narration (two lines: at the top, and halfway down)
  if (told === 0 && cx > S + 260) { told = 1; paStory(state, [byPants(state, L.PA_STAIRS)[0]]); }
  if (told === 1 && cx > S + 1100) { told = 2; paStory(state, [byPants(state, L.PA_STAIRS)[1]]); }
  // Meathead, in the dark (one at a time, when the PA's quiet)
  if (saidDark === 0 && cx > S + 1250 && !paBusy(state)) { saidDark = 1; meatheadSays(state, pick(L.MH_DARK)); }
  if (saidDark === 1 && cx > S + 1700 && !paBusy(state)) { saidDark = 2; meatheadSays(state, pick(L.MH_EYES)); }
};

/** How dark it is where he is (0 the top, 1 the bottom), going down the first time. */
const depth = (state: GameState) => { const p = state.player, cx = p.pos.x + p.width / 2; return Math.max(0, Math.min(1, (cx - S) / (CELLS - S))); };

/** The stairs' dark (as if he were at `at`, if given: the dungeon fades out of the foot of them). */
export const stairsLighting = (state: GameState, at?: number) => {
  const p = state.player, k = descended ? 0.2 : at !== undefined ? Math.max(0, Math.min(1, (at - S) / (CELLS - S))) : depth(state), lights: Light[] = [];
  SCONCES.forEach((x, i) => { if (descended || i < LIT) lights.push({ x, y: floorAt(x) - 170, r: 230, a: 0.85, color: 'rgba(249, 115, 22, 0.10)' }); });
  // (right round him: smaller the deeper he goes)
  lights.push({ x: p.pos.x + p.width / 2, y: p.pos.y + 30, r: 190 - 70 * k, a: 0.7 });
  // (whatever's down here with him glows a little: no hitting him out of the black)
  for (const e of state.enemies) if (e.health > 0 && e.pos.x > S - 100 && e.pos.x < CELLS + 100) lights.push({ x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2, r: 70, a: 0.55, color: 'rgba(248, 113, 113, 0.12)' });
  if (!descended) for (const [x, y] of EYES) lights.push({ x, y, r: 14, a: 0.9, color: 'rgba(250, 204, 21, 0.3)' });
  return { dark: 0.5 + 0.43 * k, shade: [10, 6, 6] as [number, number, number], lights };
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (the final pass: paint.ts). The dark itself is the lighting's (stairsLighting); every tread's nosing is lit
// so the way down still reads in it.

const seen = (state: GameState, a: number, b: number) => b > state.camera.x - 100 && a < state.camera.x + 900;
const tunnel = (c: CanvasRenderingContext2D) => {
  c.beginPath(); c.moveTo(PTS[0][0], PTS[0][1] - HEAD);
  for (const [x, y] of PTS) c.lineTo(x, y - HEAD);
  for (let i = PTS.length - 1; i >= 0; i--) c.lineTo(PTS[i][0], PTS[i][1]);
  c.closePath();
};
export const drawStairs = (c: CanvasRenderingContext2D, state: GameState) => {
  if (!seen(state, S, CELLS)) return;
  const f = state.frame, a = Math.max(S, state.camera.x - 40), b = Math.min(CELLS, state.camera.x + 900);
  const top = STAIR_TOP - HEAD - 200, bot = GY + 400;
  // The rock it's cut through
  c.fillStyle = rockFill(c); c.fillRect(a, top, b - a, bot - top);
  // The tunnel down it: dressed stone, darker toward its roof; its roof's edge in shadow
  c.save(); tunnel(c); c.clip();
  c.fillStyle = blockFill(c, 'stairs', '#322C27'); c.fillRect(a, top, b - a, bot - top);
  c.restore();
  c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(PTS[0][0], PTS[0][1] - HEAD); for (const [x, y] of PTS) c.lineTo(x, y - HEAD); c.stroke();
  c.strokeStyle = STONE[0]; c.lineWidth = 2; c.beginPath(); c.moveTo(PTS[0][0], PTS[0][1] - HEAD + 5); for (const [x, y] of PTS) c.lineTo(x, y - HEAD + 5); c.stroke();
  // The steps: each tread's nosing lit (somewhere to put his feet), its riser in shade; the landings flat, lit along
  // the top; worn hollows in the middle of each
  for (let i = 1; i < PTS.length; i++) {
    const [ax, ay] = PTS[i - 1], [bx, by] = PTS[i];
    if (!seen(state, ax, bx)) continue;
    if (ay === by) { stoneLedge(c, ax, ay, bx - ax, '#57504A'); box(c, ax, ay + 16, bx - ax, 44, STONE[0]); continue; }
    const n = Math.round((bx - ax) / 25), sw = (bx - ax) / n;
    for (let k = 0; k < n; k++) {
      const x = Math.round(ax + sw * k), y = Math.round(ay + (by - ay) * (k + 0.5) / n), w = Math.round(sw) + 1;
      box(c, x, y, w, 60, STONE[1]); box(c, x + w - 3, y, 3, 60, STONE[0]);
      box(c, x, y, w, 2, STONE[4]); box(c, x, y + 2, w, 2, STONE[3]); checker(c, x, y + 4, w, 2, STONE[2]);
      box(c, x + 6, y + 1, w - 12, 1, STONE[2]);
      // (the step's face under its nosing: shadowed in steps, chipped here and there, a crack now and then)
      box(c, x, y + 6, w, 4, STONE[0]); checker(c, x, y + 10, w, 2, STONE[0]);
      box(c, x + 2, y + 14, w - 6, 1, STONE[2]);
      const kk = hash(x * 0.37);
      if (kk < 0.3) { box(c, x + 4 + Math.floor(kk * 30), y + 4, 4, 2, STONE[0]); }
      if (kk > 0.8) { box(c, x + 10, y + 16, 2, 6, INK); box(c, x + 12, y + 20, 2, 6, INK); box(c, x + 14, y + 18, 1, 6, STONE[3]); }
    }
  }
  // (a skull on the second landing, for the look of it)
  { const x = S + 1110, y = STAIR_TOP + 500; if (seen(state, x - 20, x + 20)) { box(c, x - 1, y - 13, 16, 13, INK); box(c, x, y - 12, 14, 12, '#C8C2B4'); box(c, x, y - 12, 4, 12, '#E2DDD0'); box(c, x + 3, y - 8, 3, 3, INK); box(c, x + 8, y - 8, 3, 3, INK); box(c, x + 4, y - 3, 6, 2, INK); } }
  // The sconces: lit ones (torches), and the burnt-out ones (a wisp of smoke off them)
  SCONCES.forEach((x, i) => {
    if (!seen(state, x - 20, x + 20)) return;
    const y = floorAt(x) - 166;
    if (descended || i < LIT) torch(c, x, y, f);
    else {
      box(c, x - 6, y, 12, 6, INK); box(c, x - 5, y + 1, 10, 4, IRON[2]); box(c, x - 3, y + 2, 6, 24, INK); box(c, x - 2, y + 2, 4, 22, '#2A1A10');
      box(c, x - 3, y - 4, 6, 6, '#1C1917'); box(c, x - 2, y - 4, 2, 2, '#3A2A20');
      if ((f + i * 20) % 60 < 30) box(c, x - 1 + (((f + i * 20) >> 3) % 2), y - 12 - ((f + i * 20) % 30) * 0.4, 2, 4, '#4A4440');
    }
  });
  // Eyes in the dark (blinking)
  if (!descended) EYES.forEach(([x, y], i) => { if ((f + i * 53) % 170 < 160) { box(c, x - 6, y, 4, 3, '#FDE047'); box(c, x + 3, y, 4, 3, '#FDE047'); box(c, x - 5, y + 1, 1, 1, INK); box(c, x + 4, y + 1, 1, 1, INK); } });
  // (clear of the oak door at the top (below), under the tunnel's roof)
  plaque(c, S + 300, STAIR_TOP - 205, 'TO THE DUNGEON');
  if (descended) plaque(c, S + 420, STAIR_TOP - 60, 'SORRY ABOUT THE DARK. - MGMT', '#3F3F46', '#E4E4E7');
};

// ---------------------------------------------------------------------------------------------------------------
// The dungeon's two real doors, and how he goes through them (no walking off the end of a section into thin air):
//   the top door  the heavy oak door at the top of the stairs, in the wall at the end of the castle's portrait gallery.
//                 From the gallery it stands open (the stairs going down through the arch: walk on through); through
//                 it, he's at the top of the stairs with it swinging shut behind him, BOOM. Back up: walk up to it and
//                 press up, it grinds open, and he's back in the gallery by the arch.
//   the ride door the steel door at the dungeon's far end, under the EMERGENCY box: the ELEVATOR TO HELL's back way
//                 into its loading bay (the ride's sign on its brackets over it). Up at it: it clanks open (the bay's
//                 light through it) and he's in the bay, in front of the same door (its bay side), as it shuts behind
//                 him. The bay's side the same way back (the tower: tower/index.ts, tower/art.ts).
// One at a time: walk up to it (the up prompt), press up, it swings open, he's through; where he comes out, the door
// he came out of swings shut behind him. A fresh press each time (held up through one never takes him straight back).

type Ctx = CanvasRenderingContext2D;
export type DoorId = 'top' | 'exit' | 'bay';

/** Each door: how far open (0 shut, 1 open), and whether it's swinging shut (behind him, just through it). */
const D: Record<DoorId, { open: number; closing: boolean }> = { top: { open: 0, closing: false }, exit: { open: 0, closing: false }, bay: { open: 0, closing: false } };
let going: { id: DoorId; t: number } | null = null;
let lastUp = false, upEdge = false;
const OPEN_T = 16, THROUGH_T = 22, SHUT_T = 26;

/** All shut, nobody going through (a fresh build: a start, a respawn). */
export const resetDoors = () => { for (const d of Object.values(D)) { d.open = 0; d.closing = false; } going = null; };
export const doorOpen = (id: DoorId) => D[id].open;
/** Every frame, in whichever section he's in that has one of the doors: the press, the doors swinging shut. */
export const tickDoors = (state: GameState, controls: Controls) => {
  upEdge = !!controls.up && !lastUp; lastUp = !!controls.up;
  for (const d of Object.values(D)) {
    if (!d.closing) continue;
    d.open = Math.max(0, d.open - 1 / SHUT_T);
    if (d.open === 0) { d.closing = false; playSound('slam', 0.7, -6); shakeScreen(state, 3, 6); }
  }
};
/** Come out of a door: it's open behind him, swinging shut; him facing away from it. */
export const arrive = (state: GameState, id: DoorId, facing: 1 | -1) => { D[id].open = 1; D[id].closing = true; state.player.facing = facing; };

/** A door he can go through: at it, on its floor, the up prompt; up, and it opens and he's through (`go`). Returns his
 *  controls while it's his (opening, going through), else null. */
export const useDoor = (state: GameState, id: DoorId, x: number, feet: number, label: string, sound: SoundType, go: () => void): Controls | null => {
  const p = state.player, d = D[id];
  if (going) {
    if (going.id !== id) return null;
    going.t++;
    d.open = Math.min(1, going.t / OPEN_T); p.vel.x = 0;
    // (through: this side of it's shut behind him (he's on the other side now))
    if (going.t >= THROUGH_T) { going = null; d.open = 0; go(); }
    return hands();
  }
  const cx = p.pos.x + p.width / 2, ft = p.pos.y + p.height;
  if (p.health <= 0 || p.inCutscene || !p.isGrounded || d.closing || Math.abs(cx - x) > 34 || Math.abs(ft - feet) > 8) return null;
  setUi({ upPrompt: label });
  if (!upEdge) return null;
  going = { id, t: 0 };
  playSound(sound, 0.55, sound === 'grind' ? -12 : 4); p.vel.x = 0;
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** A leaf, hinged on its left edge at (hx, top), w x h, `open` of the way swung back (narrowing as it turns away;
 *  darker; its thickness showing on its free edge). Its face is a stamp, painted once at its own origin. */
const leaf = (c: Ctx, key: string, hx: number, top: number, w: number, h: number, open: number, paint: (g: Ctx) => void, edge: string) => {
  const lw = Math.max(3, Math.round(w * (1 - 0.8 * open)));
  c.save(); c.translate(hx, top); c.scale(lw / w, 1); stamp(c, key, 0, 0, w, h, paint); c.restore();
  if (open > 0) {
    box(c, hx, top, lw, h, `rgba(8, 4, 4, ${(0.5 * open).toFixed(2)})`);
    const th = Math.round(6 * Math.min(1, open * 3));
    if (th > 0) { box(c, hx + lw, top + 2, th, h - 4, INK); box(c, hx + lw, top + 3, Math.max(1, th - 2), h - 6, edge); }
  }
};

/** The oak door's face: vertical planks, three iron straps riveted across, a ring pull, a little barred grille. */
const paintOak = (w: number, h: number) => (g: Ctx) => {
  const OAK = ['#24160C', '#3A2414', '#4E321C', '#64422A', '#7A5636'];
  box(g, 0, 0, w, h, INK); box(g, 1, 1, w - 2, h - 2, OAK[2]);
  for (let x = 1; x < w - 1; x += 16) {
    const pw = Math.min(16, w - 1 - x), tone = hash(x * 0.71) < 0.5 ? OAK[2] : mix(OAK[2], OAK[1], 0.35);
    box(g, x, 1, pw, h - 2, tone);
    box(g, x, 1, 1, h - 2, OAK[3]); box(g, x + pw - 1, 1, 1, h - 2, OAK[0]);
    // (the grain: dithered streaks down it, a knot or two)
    for (let y = 4; y < h - 4; y += 9) if (hash(x * 3.1 + y * 0.7) < 0.45) checker(g, x + 3 + Math.floor(hash(y + x) * (pw - 7)), y, 2, 6, OAK[1]);
    if (hash(x * 1.9) > 0.55) { const ky = 20 + Math.floor(hash(x * 5.3) * (h - 60)); box(g, x + 5, ky, 5, 4, OAK[0]); box(g, x + 6, ky + 1, 3, 2, OAK[1]); }
  }
  // (worn dark along the foot, where it's kicked and dragged)
  hazeBands(g, 1, h - 26, w - 2, 25, '#120A04', 0, 0.55, 4);
  // the straps, riveted
  for (const sy of [Math.round(h * 0.14), Math.round(h * 0.5), Math.round(h * 0.84)]) {
    box(g, 0, sy - 1, w, 12, INK); box(g, 1, sy, w - 2, 10, IRON[2]); box(g, 1, sy, w - 2, 2, IRON[3]); box(g, 1, sy + 8, w - 2, 2, IRON[0]);
    checker(g, 1, sy + 2, w - 2, 2, IRON[1]);
    for (let x = 6; x < w - 4; x += 14) { box(g, x, sy + 3, 4, 4, INK); box(g, x, sy + 3, 3, 3, IRON[4]); box(g, x + 1, sy + 4, 1, 1, '#F4F4F8'); }
    // (rust run down off it)
    for (let x = 10; x < w - 6; x += 23) if (hash(x + sy) < 0.5) { box(g, x, sy + 10, 2, 6 + Math.floor(hash(x * sy) * 10), '#5A2A14'); }
  }
  // the grille: a dark hole, three bars
  { const gx = Math.round(w / 2) - 14, gy = Math.round(h * 0.24); box(g, gx - 2, gy - 2, 32, 24, INK); box(g, gx, gy, 28, 20, '#060404'); for (let k = 0; k < 3; k++) { box(g, gx + 4 + k * 9, gy, 3, 20, IRON[2]); box(g, gx + 4 + k * 9, gy, 1, 20, IRON[4]); } }
  // the ring pull on its plate, on the free side
  { const rx = w - 22, ry = Math.round(h * 0.6); box(g, rx - 7, ry - 9, 14, 18, INK); box(g, rx - 6, ry - 8, 12, 16, IRON[2]); box(g, rx - 6, ry - 8, 12, 2, IRON[4]);
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(rx, ry + 10, 8, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = IRON[3]; g.lineWidth = 2; g.beginPath(); g.arc(rx, ry + 10, 8, Math.PI * 0.9, Math.PI * 2.1); g.stroke(); }
};

/** The ride door's face (both sides alike): a steel fire door painted the ride's red, gilt pinstripe, a wired-glass
 *  window (`glass`: the light through it), a push bar across it. */
const paintSteel = (w: number, h: number, glass: string[]) => (g: Ctx) => {
  const RED = ['#2A0606', '#4A0C0A', '#6E1612', '#8E2418', '#B23A22'];
  box(g, 0, 0, w, h, INK); box(g, 1, 1, w - 2, h - 2, RED[2]);
  bandedGradient(g, 1, 1, w - 2, h - 2, [RED[3], RED[2], RED[2], RED[1]], 4);
  box(g, 1, 1, 2, h - 2, RED[4]); box(g, w - 3, 1, 2, h - 2, RED[0]);
  // (a gilt pinstripe panel on it: it's the ride's)
  for (const [x, y, ww, hh] of [[6, 6, w - 12, Math.round(h * 0.46)], [6, Math.round(h * 0.6), w - 12, Math.round(h * 0.4) - 8]] as const) {
    box(g, x, y, ww, 1, '#D4A84A'); box(g, x, y + hh - 1, ww, 1, '#8A6420'); box(g, x, y, 1, hh, '#D4A84A'); box(g, x + ww - 1, y, 1, hh, '#8A6420');
  }
  // the window, wired glass, lit from behind
  { const gx = Math.round(w / 2) - 11, gy = 14, gw = 22, gh = 30; box(g, gx - 2, gy - 2, gw + 4, gh + 4, INK); bandedGradient(g, gx, gy, gw, gh, glass, 3);
    for (let y = gy + 4; y < gy + gh; y += 6) for (let x = gx + 2; x < gx + gw; x += 6) box(g, x, y, 1, 1, mix(glass[0], INK, 0.5));
    box(g, gx, gy, 3, 8, mix(glass[glass.length - 1], '#FFFFFF', 0.5)); }
  // the push bar
  { const by = Math.round(h * 0.55); box(g, 4, by - 1, w - 8, 9, INK); box(g, 5, by, w - 10, 7, '#A8A8B2'); box(g, 5, by, w - 10, 2, '#E4E4EA'); box(g, 5, by + 5, w - 10, 2, '#5A5A62'); box(g, 4, by - 4, 6, 15, '#3A3A42'); box(g, w - 10, by - 4, 6, 15, '#3A3A42'); }
  // (scuffs at the foot: boots)
  for (let k = 0; k < 4; k++) box(g, 6 + Math.floor(hash(k * 7.7 + w) * (w - 20)), h - 12 + (k % 2) * 4, 8, 2, RED[0]);
  // (a sticker, peeling: ride stuff)
  box(g, w - 18, Math.round(h * 0.72), 10, 10, '#FDE68A'); box(g, w - 17, Math.round(h * 0.72) + 1, 8, 8, '#B91C1C'); box(g, w - 14, Math.round(h * 0.72) + 3, 2, 4, '#FDE68A');
};

/** A stone doorway (dressed jambs, a lintel with its keystone), feet at (x, feet), the opening w x h; what's through it
 *  (`beyond`, painted into the opening while the door's open); then the door itself. */
const stoneDoor = (c: Ctx, x: number, feet: number, w: number, h: number, beyond: (l: number, t: number) => void) => {
  const l = x - w / 2, t = feet - h, j = 16;
  // the opening (dark: the door's in it), and what's through it
  box(c, l, t, w, h, '#050303'); beyond(l, t);
  // the jambs: dressed blocks, each its own, lit left, shaded right
  for (const jx of [l - j, l + w]) {
    box(c, jx, t - 2, j, h + 2, INK);
    for (let y = t, k = 0; y < feet; y += 26, k++) {
      const hh = Math.min(25, feet - y), col = hash(jx * 0.13 + k) < 0.5 ? STONE[2] : mix(STONE[2], STONE[1], 0.4);
      box(c, jx + 1, y, j - 2, hh, col); box(c, jx + 1, y, j - 2, 2, STONE[3]); box(c, jx + 1, y, 2, hh, STONE[3]); box(c, jx + j - 3, y, 2, hh, STONE[0]);
    }
  }
  // the lintel and its keystone
  box(c, l - j - 4, t - 22, w + 2 * j + 8, 22, INK); box(c, l - j - 3, t - 21, w + 2 * j + 6, 20, STONE[2]);
  box(c, l - j - 3, t - 21, w + 2 * j + 6, 2, STONE[4]); box(c, l - j - 3, t - 3, w + 2 * j + 6, 2, STONE[0]);
  checker(c, l - j - 3, t - 19, w + 2 * j + 6, 2, STONE[3]);
  box(c, x - 11, t - 30, 22, 30, INK); box(c, x - 10, t - 29, 20, 28, STONE[3]); box(c, x - 10, t - 29, 20, 2, STONE[4]); box(c, x + 6, t - 29, 4, 28, STONE[1]);
  // (the threshold, worn)
  box(c, l - 4, feet - 4, w + 8, 4, STONE[3]); box(c, l - 4, feet - 4, w + 8, 1, STONE[4]);
};

/** The top door, at the top of the dungeon's stairs (its back wall): the gallery through it when it's open. */
export const TOP_W = 120, TOP_H = 220;
export const drawTopDoor = (c: Ctx, x: number, feet: number) => {
  const o = D.top.open;
  stoneDoor(c, x, feet, TOP_W, TOP_H, (l, t) => {
    if (o <= 0) return;
    // (the gallery: its velvet, its candlelight, its boards)
    bandedGradient(c, l, t, TOP_W, TOP_H, ['#3A0A12', '#5A1018', '#6A0E1E', '#7A2A20'], 5);
    for (let k = 0; k < 4; k++) box(c, l + 10 + k * 30, t, 2, TOP_H - 20, '#4A0A14');
    box(c, l, feet - 20, TOP_W, 20, '#4E3020'); box(c, l, feet - 20, TOP_W, 2, '#7A5236');
    hazeBands(c, l, t, TOP_W, 50, '#000000', 0.5, 0, 4);
  });
  leaf(c, 'dg-oak-top', x - TOP_W / 2, feet - TOP_H, TOP_W, TOP_H, o, paintOak(TOP_W, TOP_H), '#3A2414');
};
/** The same door from the gallery's side, standing open in the castle's arch (the opening's left jamb at `l`, its foot
 *  at `feet`): swung back into the stairwell. */
export const drawGalleryLeaf = (c: Ctx, l: number, feet: number) => {
  const h = 230, w = 140;
  leaf(c, 'dg-oak-gallery', l, feet - h, w, h, 1, paintOak(w, h), '#3A2414');
};

/** The ride door: the same opening on both sides of it (the dungeon's, the bay's). */
export const RIDE_W = 64, RIDE_H = 136;
/** The dungeon's side of it, in the stone at the dungeon's far end, the bay's light through it when it's open; over
 *  it, the EMERGENCY box and the ride's own sign, on its brackets. */
export const drawRideDoor = (c: Ctx, x: number, feet: number, f: number) => {
  const o = D.exit.open;
  stoneDoor(c, x, feet, RIDE_W, RIDE_H, (l, t) => {
    if (o <= 0) return;
    // (the bay: its red damask, its warm light, its checkered floor)
    bandedGradient(c, l, t, RIDE_W, RIDE_H, ['#3E0B0D', '#4A0E10', '#6A2A16', '#8A4A20'], 5);
    for (let x2 = l + 8; x2 < l + RIDE_W; x2 += 16) box(c, x2, t, 2, RIDE_H - 18, '#5C1418');
    for (let x2 = l; x2 < l + RIDE_W; x2 += 16) box(c, x2, feet - 16, 8, 16, (x2 - l) % 32 ? '#2C201C' : '#4A3A30');
  });
  leaf(c, 'dg-ride-dungeon', x - RIDE_W / 2, feet - RIDE_H, RIDE_W, RIDE_H, o, paintSteel(RIDE_W, RIDE_H, ['#7A4A18', '#C8862E', '#FDE68A']), '#4A0C0A');
  // the EMERGENCY box (a modern convenience), lit
  box(c, x - 40, feet - 194, 80, 18, INK); box(c, x - 39, feet - 193, 78, 16, '#0E3A1A'); box(c, x - 39, feet - 193, 78, 2, '#1E5A2A');
  signAt(c, 'EMERGENCY', x, feet - 182, 6, led(6, '#4ADE80', '#0E3A1A'));
  // the ride's sign, out on its iron brackets over the door: ELEVATOR TO HELL, RIDE ENTRANCE, its pointing hand
  stamp(c, 'dg-ride-sign', x - 96, feet - 290, 192, 92, g => {
    const sx = x, top = feet - 280;
    // (the brackets, scrolled iron, bolted into the stone)
    for (const bx of [sx - 70, sx + 62]) { box(g, bx, top - 8, 8, 14, INK); box(g, bx + 1, top - 7, 6, 12, IRON[2]); box(g, bx + 1, top - 7, 6, 2, IRON[4]); box(g, bx + 2, top - 4, 2, 2, IRON[4]); }
    box(g, sx - 84, top - 2, 168, 4, INK); box(g, sx - 83, top - 1, 166, 2, IRON[3]);
    for (const hx of [sx - 66, sx + 64]) { box(g, hx, top + 2, 2, 6, IRON[1]); }
    // (the board: gilt-edged ride red, a little marquee of bulbs along its top)
    box(g, sx - 88, top + 8, 176, 62, INK); box(g, sx - 86, top + 10, 172, 58, '#D4A84A'); box(g, sx - 84, top + 12, 168, 54, '#5A1010');
    bandedGradient(g, sx - 84, top + 12, 168, 54, ['#6E1414', '#5A1010', '#3A0808'], 4);
    box(g, sx - 86, top + 10, 172, 1, '#FDE68A'); box(g, sx - 86, top + 67, 172, 1, '#8A6420');
    signAt(g, 'ELEVATOR TO HELL', sx, top + 32, 10, { ...candle({ sx: 1, sy: 2 }, '#5A1010', '#FDE68A', false), shadow: '#2A0404' });
    signAt(g, 'RIDE ENTRANCE', sx - 8, top + 54, 6, enamel(6, '#FCA5A5', '#2A0404'));
    // (the hand pointing down at the door)
    const px = sx + 56, py = top + 50; box(g, px - 1, py - 5, 14, 10, INK); box(g, px, py - 4, 12, 8, '#F1EFEA'); box(g, px + 3, py + 4, 4, 6, INK); box(g, px + 4, py + 4, 2, 5, '#F1EFEA');
    // (grime: rust weeping from the bolts, soot along the top)
    hazeBands(g, sx - 84, top + 12, 168, 14, '#1A0606', 0.35, 0, 3);
    for (const rx of [sx - 80, sx + 78]) box(g, rx, top + 14, 2, 10, '#5A2A14');
  });
  // (the bulbs, chasing)
  for (let i = 0; i < 9; i++) { const on = ((f >> 4) + i) % 3 === 0; box(c, x - 78 + i * 19, feet - 272, 4, 3, on ? '#FDE047' : '#5A3A10'); }
  // (a printed notice taped beside the door)
  stamp(c, 'dg-ride-notice', x + RIDE_W / 2 + 20, feet - 120, 44, 54, g => {
    const nx = x + RIDE_W / 2 + 22, ny = feet - 118;
    box(g, nx, ny, 40, 50, INK); box(g, nx + 1, ny + 1, 38, 48, '#E8DFC8'); box(g, nx + 1, ny + 40, 38, 9, '#D2C6A8');
    signAt(g, 'NO', nx + 20, ny + 12, 6, print(6, '#7F1D1D'));
    signAt(g, 'LINE', nx + 20, ny + 22, 6, print(6, '#7F1D1D'));
    signAt(g, 'CUTTING', nx + 20, ny + 32, 6, print(6, '#7F1D1D'));
    box(g, nx + 12, ny - 2, 16, 4, 'rgba(230, 230, 200, 0.7)');
  });
};
/** The ride door from the bay's side (painted in the bay's doorway: tower/art.ts), at its opening's top-left (l, t):
 *  the dungeon's dark through it when it's open, its torchlight. */
export const paintBayRideDoor = (c: Ctx, l: number, t: number) => {
  const o = D.bay.open;
  if (o > 0) {
    bandedGradient(c, l, t, RIDE_W, RIDE_H, ['#0A0806', '#1A1410', '#2A1E14', '#3A2A18'], 5);
    for (let y = t + 10; y < t + RIDE_H; y += 22) box(c, l, y, RIDE_W, 1, STONE[0]);
    box(c, l, t + RIDE_H - 12, RIDE_W, 12, STONE[1]); box(c, l, t + RIDE_H - 12, RIDE_W, 1, STONE[3]);
  }
  leaf(c, 'dg-ride-bay', l, t, RIDE_W, RIDE_H, o, paintSteel(RIDE_W, RIDE_H, ['#0A0806', '#2A1A10', '#5A3A18']), '#4A0C0A');
};
