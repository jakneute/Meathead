// The GRAND BALLROOM's doors, at the end of the chase. Donnie's through them first: they slam, a deadbolt goes, a lock
// clicks, and his muffled voice comes through them (the doors rattling as he talks). Meathead walks up and kicks them
// in (Meathead 1's boot): a short cutscene, skippable, no HUD; the doors burst in, splinters and dust, his line. Then
// he's in the ballroom (the fight). The doors stay down after (a retry walks straight in; revisits find them lying
// there). A checkpoint's just outside them (index.ts), the big refill beside it.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Block } from '../../../m1/types';
import { hands, speak, meatheadSays, saidOver } from '../section';
import { GY } from '../geometry';
import { CANVAS_WIDTH, KICK_POSE_FRAMES } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { shakeScreen } from '../../../m1/game/core/state';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { drawBars } from './cine';
import { INK, box, slab, pole, hazeBands, inked, plaque, eyeOf, CEIL } from './paint';
import { candle } from '../letters';
import { type Passage, passageBack, passageSide, passageFront, passageLintel } from './passage';
import { rockWall } from './shopArt';
import { drawBallDoors, type DoorLook } from './ballDoors';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;
const dressed = (state: GameState): L.Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

export interface Doors {
  /** Open (Donnie not through yet), locked (him behind them), kicking (the cutscene), down. */
  state: 'open' | 'locked' | 'kicking' | 'down';
  t: number; said: string | null; spoke: boolean; talkDone: boolean;
  /** Burst in (drawn down), the cutscene still finishing. */
  broken: boolean;
  block: Block | null; x: number;
}
/** Kicked in this time through (a retry from outside them finds them down). */
let kicked = false;
export const forgetDoors = () => { kicked = false; };
export const doorsKicked = () => kicked;

export const makeDoors = (x: number): Doors => ({ state: 'open', t: 0, said: null, spoke: false, talkDone: false, broken: false, block: null, x });

/** Standing open while Donnie runs for them: nothing across the way yet (the lock puts it there). */
export const buildDoors = (_state: GameState, d: Doors) => { d.block = null; };
/** Down already (a retry, a revisit). */
export const doorsDown = (state: GameState, d: Doors) => {
  d.state = 'down'; kicked = true;
  if (d.block) { state.blocks = state.blocks.filter(b => b !== d.block); d.block = null; }
};

/** Donnie's through them: they slam right behind him (shut across the way: a wall the width of the doorway; anybody
 *  in the doorway's shoved back out the shop side), the bolt, the lock, his voice through them. */
export const lockDoors = (state: GameState, d: Doors) => {
  if (d.state !== 'open') return;
  d.state = 'locked'; d.t = 0;
  d.block = { x: d.x - 70, y: GY - 180, w: 140, h: 180, type: 'wall', hidden: true, tag: 'ballroom-doors' } as Block;
  state.blocks.push(d.block);
  const p = state.player;
  if (p.pos.x + p.width > d.block.x && p.pos.x < d.block.x + d.block.w && p.pos.y + p.height > d.block.y) { p.pos.x = d.block.x - p.width - 1; if (p.vel.x > 0) p.vel.x = 0; }
};

/** Each frame; the cutscene's controls while it's on (else null). */
export const tickDoors = (ctx: FrameContext, d: Doors): Controls | null => {
  const { state } = ctx, p = state.player;
  if (d.state === 'locked') {
    d.t++;
    if (d.t === 1) { playSound('slam', 1, -2); shakeScreen(state, 5, 3); }
    if (d.t === 18) playSound('clang', 0.7, 4);
    if (d.t === 30) playSound('click', 0.9, 6);
    if (d.t === 38) playSound('click', 0.7, 10);
    if (d.t === 50 && !d.spoke) {
      d.spoke = true;
      speak('m2.donnie', pick(L.DONNIE_LOCKED[dressed(state)]), s => { d.said = s?.text ?? null; }, true, () => { d.talkDone = true; });
    }
    if (d.t > 600) d.talkDone = true;
    // (up to them, him done talking: the boot. Right up at them, walked there himself (the user's: no walking him to a
    // boss's door), so the kick's step-up is next to nothing)
    const px = p.pos.x + p.width / 2;
    if (d.talkDone && px > d.x - 70 - 50 && p.isGrounded && p.health > 0 && state.deathTimer <= 0) { d.state = 'kicking'; d.t = 0; }
    return null;
  }
  if (d.state === 'kicking') {
    d.t++;
    p.inCutscene = true; p.facing = 1; p.vel.x = 0;
    // (anybody about holds off: it's his moment)
    for (const e of state.enemies) if (Math.abs(e.pos.x - d.x) < 500) { e.pauseTimer = Math.max(e.pauseTimer ?? 0, 2); e.vel.x = 0; }
    if (d.t > SKIP_AFTER) offerSkip();
    if (d.t > SKIP_AFTER && takeSkip()) { silenceAll(); state.playerVulgarityTimer = 0; burst(state, d, true); end(state, d); return hands(); }
    // (stepped up to them)
    const want = d.x - 70 - 30 - p.width / 2;
    if (d.t < 8) p.pos.x += (want - p.pos.x) * 0.3;
    if ((p.kickPose || 0) > 0) p.kickPose!--;
    if (d.t === 10) { p.kickPose = KICK_POSE_FRAMES; playSound('whoosh', 0.7, -4); }
    if (d.t === 20) { burst(state, d, false); meatheadSays(state, pick(L.MEATHEAD_DOOR_KICK), true); }
    if (d.t >= 70) end(state, d);
    return hands();
  }
  return null;
};
const burst = (state: GameState, d: Doors, quiet: boolean) => {
  // (the way's open; the cutscene runs on till it's done: end() puts them down for good)
  kicked = true; d.broken = true;
  if (d.block) { state.blocks = state.blocks.filter(b => b !== d.block); d.block = null; }
  d.t = Math.max(d.t, 20);
  if (quiet) return;
  playSound('crash', 1, -4); playSound('crack', 1, -2); playSound('boom', 0.6, 2); shakeScreen(state, 14, 7);
  for (let i = 0; i < 30; i++) state.particles.push({ pos: { x: d.x - 60 + Math.random() * 30, y: GY - 20 - Math.random() * 150 }, vel: { x: 2 + Math.random() * 6, y: -2 - Math.random() * 4 }, life: 50, color: ['#581C87', '#6B21A8', '#A16207', '#FDE047'][i % 4], size: 3 + Math.random() * 5, grav: 0.35 });
  for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: d.x + (Math.random() - 0.5) * 120, y: GY - 10 }, vel: { x: (Math.random() - 0.3) * 2, y: -0.5 - Math.random() }, life: 60, color: 'rgba(200, 190, 180, 0.5)', size: 8 + Math.random() * 8, grav: -0.01 });
};
const end = (state: GameState, d: Doors) => {
  const p = state.player;
  p.inCutscene = false; p.kickPose = 0;
  d.state = 'down'; d.said = null;
};

/** The end of the shop: a thick wall of gilt and purple flock, the doorway a passage through it (passage.ts): over his
 *  head the lintel (an arch, GRAND BALLROOM); through it, its back wall (the shop's rock giving way to the ballroom's
 *  flock at the doors, a glimpse of a chandelier), the carpet giving way to the dance floor; the doors hung in their
 *  frame a step back in it; its near jambs sliding past in front of him. */
const FACADE = 110;
/** (the threshold's at the doors' frame: the shop's floor and wall up to it, the ballroom's through it) */
const passOf = (D: number): Passage => ({ A: D - FACADE, B: D + 300, H: GY - 204, top: CEIL - 300, dp: 0.935, near: 1.09, split: D - 64 });

const paintRear = (g: Ctx, D: number) => {
  const P = passOf(D);
  rockWall(g, P.A, P.split, P.H, GY, 3);
  box(g, P.A, P.H, P.split - P.A, GY - P.H, 'rgba(70, 6, 6, 0.18)');
  // (the ballroom, past the doors: its flock, a pilaster, a chandelier's crystals hung in the top of the opening, a fog
  // machine's red light down by the floor)
  box(g, P.split, P.H, P.B - P.split, GY - P.H, '#3B0764');
  for (let y = P.H + 10; y < GY - 100; y += 24) for (let x = P.split + 8 + ((y / 24) % 2) * 12; x < P.B; x += 24) { box(g, x, y, 4, 6, '#4C1D95'); box(g, x - 2, y + 2, 8, 2, '#4C1D95'); }
  box(g, P.split, GY - 100, P.B - P.split, 100, '#2E1065'); box(g, P.split, GY - 104, P.B - P.split, 4, '#6B4A14');
  pole(g, D + 120, P.H, 16, GY - P.H, '#A6780A');
  box(g, D + 40, P.H, 2, 30, '#CA8A04'); slab(g, D + 14, P.H + 30, 56, 8, '#A16207', { edge: 2 });
  for (let i = 0; i < 6; i++) box(g, D + 18 + i * 9, P.H + 38, 2, 8 + (i % 3) * 4, '#BAE6FD');
  box(g, D + 70, GY - 14, 18, 14, '#27272A'); box(g, D + 73, GY - 11, 5, 3, '#EF4444');
  hazeBands(g, P.split, P.H, P.B - P.split, 60, '#0A0310', 0.6, 0, 4);
  box(g, P.A, P.H, P.B - P.A, 6, 'rgba(0, 0, 0, 0.35)');
};

const paintLintel = (g: Ctx, D: number) => {
  const P = passOf(D), L = P.A, R = P.B, top = P.top;
  box(g, L, top, R - L, P.H - top, '#3B0764');
  for (let y = top + 8; y < P.H - 10; y += 24) for (let x = L + 8 + ((y / 24) % 2) * 12; x < R; x += 24) { box(g, x, y, 4, 6, '#4C1D95'); box(g, x - 2, y + 2, 8, 2, '#4C1D95'); }
  slab(g, L, CEIL - 6, R - L, 10, '#CA8A04', { edge: 2 });
  hazeBands(g, L, CEIL, R - L, 120, '#0A0310', 0.6, 0, 5);
  // (the gilt header over the opening, its dentils; the arch over that, GRAND BALLROOM in it)
  slab(g, L, P.H - 14, R - L, 14, '#CA8A04', { edge: 2 });
  for (let x = L + 6; x < R; x += 10) box(g, x, P.H - 6, 5, 4, '#854D0E');
  inked(g, () => { g.moveTo(D - 96, P.H - 14); g.quadraticCurveTo(D, P.H - 80, D + 96, P.H - 14); g.lineTo(D + 86, P.H - 14); g.quadraticCurveTo(D, P.H - 66, D - 86, P.H - 14); g.closePath(); }, '#CA8A04', 2);
  plaque(g, D, P.H - 58, 'GRAND BALLROOM', '#3B0764', '#FDE047', 8, '#CA8A04', candle(8, '#3B0764', '#FDE047'));
  // (plastic bats either side of it, gold)
  for (const s of [-1, 1]) { const bx = D + s * 150, by = P.H - 50; inked(g, () => { g.moveTo(bx - 14, by); g.lineTo(bx - 6, by - 6); g.lineTo(bx, by - 2); g.lineTo(bx + 6, by - 6); g.lineTo(bx + 14, by); g.lineTo(bx + 6, by + 2); g.lineTo(bx, by + 6); g.lineTo(bx - 6, by + 2); g.closePath(); }, '#CA8A04', 2); }
};

/** World space, behind: the passage through the end wall, and the doors in it (open while Donnie runs for them;
 *  slammed shut behind him, rattling while he talks; kicked in, lying flat). */
export const drawDoors = (c: Ctx, d: Doors, state: GameState) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: 600 };
  const D = d.x, f = state.frame, P = passOf(D), eye = eyeOf(state);
  if (v.x + v.w < P.A - 200) return;
  passageSide(c, eye, P.A, -1, P, '#3B0764', false);
  passageBack(c, eye, P, 'doors-rear', g => paintRear(g, D), '#741A1A', '#4C1D95', '#2E1065');
  // (the doors in their gilt frame, a step back in the passage: open while Donnie runs for them, swung back against
  // the passage's wall; slammed shut behind him (swinging to over a few frames), rattling while he talks; kicked in)
  const look: DoorLook = d.state === 'down' || d.broken ? { kind: 'down' }
    : d.state === 'open' ? { kind: 'open' }
    : d.state === 'locked' && d.t < 6 ? { kind: 'shutting', k: Math.max(0, d.t) / 6 }
    : { kind: 'shut', shake: d.state === 'locked' && d.said ? (Math.floor(f / 3) % 2 ? 2 : -1) : 0 };
  drawBallDoors(c, eye, D, look);
  passageLintel(c, P, 'doors-lintel', g => paintLintel(g, D));
  box(c, P.A - 1, P.top, 2, P.H - P.top, INK);
};
/** World space, in front of everything: the passage's near jambs and lintel edge. */
export const drawDoorsTrim = (c: Ctx, d: Doors, state: GameState) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: 600 };
  if (v.x + v.w < d.x - FACADE - 300) return;
  passageFront(c, eyeOf(state), passOf(d.x), '#7A5A10');
};
/** World space, in front: his voice through the doors (muffled: gray, small). */
export const drawDoorsFront = (c: Ctx, d: Doors) => { if (d.said) saidOver(c, d.said, d.x, GY - 230, '#A1A1AA', 220); };
/** Screen space: the cutscene's framing. */
export const drawDoorsHud = (c: Ctx, d: Doors) => {
  if (d.state !== 'kicking') return;
  drawBars(c, Math.min(1, d.t / 12));
  if (d.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
