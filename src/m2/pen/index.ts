// The staff room behind the STAFF ONLY door: a practice room, like Meathead's gym. A strip of back-of-house concrete
// with people (and a few animals) walking in from the far end to practice on, a few at a time, forever. Nobody in here
// fights back: they don't shoot, swing or bump him, they just run about (and away from him, when he comes at them);
// and he can't be hurt in here anyway (App.tsx). For now they're Meathead 1's; it'll fill up with the regular enemies met in the game. The door
// back to the hub is at the near end.

import type { StageLayout } from '../../m1/game/stages/index';
import type { GameState } from '../../m1/game/core/state';
import type { EnemyKind, Enemy } from '../../m1/types';
import { groundBlocks } from '../../m1/game/core/terrain';
import { makeKindEnemy } from '../../m1/game/enemies/kinds';
import { GROUND_Y, CANVAS_WIDTH } from '../../m1/constants';
import { createGrab, updateGrab, drawGrab, grabbing, type Grab } from '../moves/grab';
import { setUi, goTo } from '../store';
import { M2_ENEMY_KINDS } from '../roster';

export const PEN_STAGE = 'M2 Staff Pen';
const X0 = -40000, LEN = 2400;
/** The end walls: solid, drawn, and the camera stops at their outer faces. */
const WALL = 60;
const EXIT_X = X0 + 130;
/** Who walks in, in turn (the rat's there to show who can't be grabbed). */
const ROSTER: EnemyKind[] = M2_ENEMY_KINDS;
const AT_ONCE = 5, RESPAWN = 70;
const FLYERS = new Set<EnemyKind>(['pigeon', 'seagull', 'hawk', 'eagle', 'vulture', 'pelican', 'grackle']);

interface Pen { grab: Grab; next: number; cooldown: number; upWas: boolean }
const getPen = (state: GameState) => state.stage as Pen | null;

const send = (state: GameState, pen: Pen, x = X0 + LEN - 120 - Math.random() * 200) => {
  const kind = ROSTER[pen.next++ % ROSTER.length];
  // (a bird comes in flying, a way up: low enough to jump and grab)
  const flyer = FLYERS.has(kind);
  const e = makeKindEnemy(kind, x, flyer ? GROUND_Y - 70 - Math.random() * 60 : GROUND_Y);
  e.seen = true;
  // (practice from the first frame it's in: see practice)
  e.harmless = true; e.puppet = true; e.pauseTimer = 2;
  state.enemies.push(e);
};

/**
 * Where the next one comes in: on the screen he's looking at, at the far side of it from him (so they come to him, and
 * don't all pile up down the far end of the room); against a wall, the other side of the screen.
 */
const arrivalX = (state: GameState) => {
  const p = state.player, px = p.pos.x + p.width / 2;
  // (the screen round him, where the camera's settling: not where it's caught up to yet)
  const cam = Math.max(X0 - WALL, Math.min(X0 + LEN + WALL - CANVAS_WIDTH, px - CANVAS_WIDTH / 2));
  const left = cam + 70, right = cam + CANVAS_WIDTH - 110;
  const lo = X0 + 40, hi = X0 + LEN - 100;
  const far = px < cam + CANVAS_WIDTH / 2 ? right : left;
  const x = Math.max(lo, Math.min(hi, far + (Math.random() - 0.5) * 60));
  return Math.abs(x - px) > 220 ? x : Math.max(lo, Math.min(hi, far === right ? left : right));
};

export const penLayout: StageLayout = {
  left: X0 - 600,
  startX: X0 + 140,
  verticalCamera: false,
  startsStanding: true,
  build: (state) => {
    const runs = [{ x1: X0 - 400, y1: GROUND_Y, x2: X0 + LEN + 400, y2: GROUND_Y, surface: 'concrete' }];
    state.groundRuns = runs;
    state.blocks.push(...groundBlocks(runs));
    state.blocks.push({ x: X0 - WALL, y: -3000, w: WALL, h: 3600, type: 'wall', hidden: true, tag: 'pen-l' }, { x: X0 + LEN, y: -3000, w: WALL, h: 3600, type: 'wall', hidden: true, tag: 'pen-r' });
    const pen: Pen = { grab: createGrab(state), next: 0, cooldown: 0, upWas: false };
    state.stage = pen;
    state.cameraMinX = X0 - WALL;
    state.cameraMaxX = X0 + LEN + WALL - CANVAS_WIDTH;
    // (already in here when he comes in: spread out down the room, the first few in view, the nearest a little way off from the door)
    for (let i = 0; i < AT_ONCE; i++) send(state, pen, X0 + 380 + i * 230);
  },
  update: (ctx, controls) => {
    const { state } = ctx;
    const pen = getPen(state);
    // (dev builds: the state on the window, for poking at it)
    if (import.meta.env.DEV) (window as unknown as { __m2: GameState }).__m2 = state;
    if (!pen) return controls;
    const out = updateGrab(ctx, pen.grab, controls);
    practice(state);
    // Nothing in here hurts him: not a bump, not anything (the invincibility cheat keeps his health; this keeps the
    // knock and the flinch off him too)
    state.player.noContactHurt = true;
    // Health doesn't drop off the dead here: the beatdown's how you get it back
    state.pickups = state.pickups.filter(p => !(p.id.startsWith('pickup-') && (p.type === 'small_health' || p.type === 'large_health')));
    // A few at a time, always
    const alive = state.enemies.filter(e => e.health > 0 && !e.isBlownAway).length + (pen.grab.held ? 1 : 0);
    if (alive < AT_ONCE && --pen.cooldown <= 0) { send(state, pen, arrivalX(state)); pen.cooldown = RESPAWN; }
    // The way back
    const p = state.player, cx = p.pos.x + p.width / 2;
    const near = p.isGrounded && Math.abs(cx - EXIT_X) < 60 && !grabbing(pen.grab);
    setUi({ nearExit: near, near: null, map: null });
    if (near && controls.up && !pen.upWas) goTo('hub');
    pen.upWas = !!controls.up;
    return out;
  },
  drawBackdrop: (ctx, state) => { drawPenBackdrop(ctx, state); return true; },
  drawBack: (ctx, state) => drawPenBack(ctx, state),
  drawFront: (ctx, state) => { const pen = getPen(state); if (pen) drawGrab(ctx, state, pen.grab); },
};

/**
 * Everybody in here's for practice: harmless to bump, never shooting or swinging, and moved by hand (their own AI held
 * off): wandering from spot to spot round about him (so there's always somebody near), stopping for a bit, and running off when he gets close (not so fast he can't catch
 * them). Anybody knocked about (thrown, punched, stunned) is left to that till they've come round.
 */
const WANDER = 1.3, FLEE = 2.4, SCARE = 150, EDGE = 60;
const wander = new WeakMap<Enemy, { to: number; rest: number }>();
const practice = (state: GameState) => {
  const p = state.player, px = p.pos.x + p.width / 2;
  // (anything one of them let fly before they came in here, gone)
  state.projectiles = state.projectiles.filter(pr => pr.owner !== 'enemy');
  for (const e of state.enemies) {
    if (e.health <= 0 || e.isBlownAway) continue;
    e.harmless = true; e.puppet = true; e.shootTimer = 0;
    // (nobody ends up out past the walls, however they got sent)
    e.pos.x = Math.max(X0, Math.min(X0 + LEN - e.width, e.pos.x));
    // (knocked about by him: left to it)
    // (their own way of moving, a charger's charge, doesn't count: only what's been done to them)
    if ((e.pauseTimer || 0) > 2 || Math.abs(e.vel.y) > 0.5) continue;
    e.pauseTimer = 2;
    let w = wander.get(e);
    if (!w) { w = { to: e.pos.x + e.width / 2, rest: 90 + Math.floor(Math.random() * 120) }; wander.set(e, w); }
    const ex = e.pos.x + e.width / 2, d = ex - px;
    let dir = 0, speed = WANDER;
    if (Math.abs(d) < SCARE) {
      // Running off from him (backed into a wall: past him the other way)
      dir = d >= 0 ? 1 : -1;
      if ((dir > 0 && ex > X0 + LEN - EDGE) || (dir < 0 && ex < X0 + EDGE)) dir = -dir;
      speed = FLEE; w.rest = 0; w.to = ex + dir * 120;
    } else if (w.rest > 0) w.rest--;
    else if (Math.abs(w.to - ex) < 8) { w.rest = 30 + Math.floor(Math.random() * 90); w.to = Math.max(X0 + EDGE, Math.min(X0 + LEN - EDGE, px + (Math.random() - 0.5) * 800)); }
    else dir = w.to > ex ? 1 : -1;
    if (!dir) { e.vel.x = 0; continue; }
    e.facing = dir as 1 | -1;
    e.pos.x = Math.max(X0 + 10, Math.min(X0 + LEN - e.width - 10, e.pos.x + dir * speed));
    // (a hair of speed, for which way they're going: not enough to slide them)
    e.vel.x = dir * 0.01;
  }
};

// ---------------------------------------------------------------------------
// Back of house: painted rough for now
// ---------------------------------------------------------------------------

const box = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

const drawPenBackdrop = (ctx: CanvasRenderingContext2D, state: GameState) => {
  // The block wall, in bands, a stripe of safety yellow along it, pipes up top
  const bands = ['#26262B', '#2C2C33', '#33333B', '#3A3A43', '#40404A'];
  bands.forEach((c, i) => box(ctx, 0, i * 110, CANVAS_WIDTH, 112, c));
  const sx = -(state.camera.x * 0.6) % 64;
  for (let y = 0; y < 520; y += 32) for (let x = sx - 64 + (y / 32 % 2) * 32; x < CANVAS_WIDTH; x += 64) box(ctx, x, y, 1, 31, '#1F1F24');
  for (let y = 0; y < 520; y += 32) box(ctx, 0, y, CANVAS_WIDTH, 1, '#1F1F24');
  box(ctx, 0, 420, CANVAS_WIDTH, 14, '#CA8A04'); for (let x = (-(state.camera.x * 0.6) % 28) - 28; x < CANVAS_WIDTH; x += 28) box(ctx, x, 420, 14, 14, '#18181B');
  const px = -(state.camera.x * 0.75) % 400;
  for (let k = -1; k < 3; k++) { box(ctx, px + k * 400, 40, 400, 10, '#52525B'); box(ctx, px + k * 400, 40, 400, 3, '#71717A'); box(ctx, px + k * 400 + 120, 30, 8, 30, '#3F3F46'); }
};

const drawPenBack = (ctx: CanvasRenderingContext2D, state: GameState) => {
  const f = state.frame;
  // The floor: sealed concrete, a painted walkway line
  box(ctx, X0 - 400, GROUND_Y, LEN + 800, 120, '#57534E'); box(ctx, X0 - 400, GROUND_Y, LEN + 800, 3, '#78716C');
  for (let x = X0; x < X0 + LEN; x += 90) box(ctx, x, GROUND_Y + 22, 50, 4, '#EAB308');
  // The door back out to the hub, with its sign
  box(ctx, EXIT_X - 34, GROUND_Y - 120, 68, 120, '#3F3F46'); box(ctx, EXIT_X - 30, GROUND_Y - 116, 60, 116, '#71717A');
  box(ctx, EXIT_X + 18, GROUND_Y - 62, 6, 4, '#E5E7EB');
  box(ctx, EXIT_X - 44, GROUND_Y - 152, 88, 24, '#14532D'); ctx.fillStyle = '#ECFCCB'; ctx.font = '8px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('TO THE HUB', EXIT_X, GROUND_Y - 136);
  // Back-of-house things: the board, crates, a rack of spare mascot heads, a punching bag (sign: NOT FOR GUESTS)
  box(ctx, X0 + 300, GROUND_Y - 260, 220, 120, '#F4F4F5'); box(ctx, X0 + 300, GROUND_Y - 260, 220, 6, '#A1A1AA');
  ctx.fillStyle = '#1E3A8A'; ctx.font = '8px "Press Start 2P"';
  ctx.fillText('DAYS WITHOUT', X0 + 410, GROUND_Y - 230); ctx.fillText('AN INCIDENT:', X0 + 410, GROUND_Y - 214);
  ctx.fillStyle = '#DC2626'; ctx.font = '24px "Press Start 2P"'; ctx.fillText('0', X0 + 410, GROUND_Y - 172);
  for (let i = 0; i < 3; i++) { box(ctx, X0 + 700 + i * 50, GROUND_Y - 44 - (i === 1 ? 44 : 0), 46, 44, '#92400E'); box(ctx, X0 + 702 + i * 50, GROUND_Y - 42 - (i === 1 ? 44 : 0), 42, 3, '#B45309'); }
  // (the mascot heads on their shelf: big grins, staring)
  box(ctx, X0 + 1100, GROUND_Y - 150, 260, 8, '#52525B');
  ['#F472B6', '#FACC15', '#60A5FA', '#4ADE80'].forEach((c, i) => {
    const hx = X0 + 1130 + i * 62, hy = GROUND_Y - 176;
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(hx, hy, 24, 0, Math.PI * 2); ctx.fill();
    box(ctx, hx - 10, hy - 6, 6, 8, '#111'); box(ctx, hx + 4, hy - 6, 6, 8, '#111');
    ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.arc(hx, hy + 6, 10, 0, Math.PI); ctx.fill();
  });
  ctx.fillStyle = '#F4F4F5'; ctx.font = '8px "Press Start 2P"'; ctx.fillText('SPARE HEADS', X0 + 1230, GROUND_Y - 116);
  const sway = Math.sin(f * 0.05) * 0.06;
  ctx.save(); ctx.translate(X0 + 1700, GROUND_Y - 260); ctx.rotate(sway);
  box(ctx, -1, 0, 2, 40, '#A1A1AA'); box(ctx, -22, 40, 44, 110, '#7F1D1D'); box(ctx, -22, 40, 8, 110, '#991B1B'); box(ctx, -22, 70, 44, 4, '#450A0A');
  ctx.restore();
  ctx.fillStyle = '#FDE047'; ctx.fillText('NOT FOR GUESTS', X0 + 1700, GROUND_Y - 80);
  box(ctx, X0 + 2000, GROUND_Y - 210, 200, 40, '#7F1D1D'); ctx.fillStyle = '#FEF2F2'; ctx.fillText('EMPLOYEES ONLY', X0 + 2100, GROUND_Y - 192); ctx.fillText('SMILE BEFORE YOU GO OUT', X0 + 2100, GROUND_Y - 178);
  ctx.textAlign = 'left';
  // The end walls, floor to ceiling: poured concrete in bands, lit along the face toward the room, a hazard stripe up
  // the edge, the form-tie holes in rows
  const top = state.camera.y - 20, h = GROUND_Y + 120 - top;
  for (const [wx, face] of [[X0 - WALL, 1], [X0 + LEN, -1]] as const) {
    const cols = face > 0 ? ['#3F3F46', '#46464E', '#52525B', '#5B5B64', '#6B6B74'] : ['#6B6B74', '#5B5B64', '#52525B', '#46464E', '#3F3F46'];
    cols.forEach((c, i) => box(ctx, wx + i * (WALL / cols.length), top, WALL / cols.length + 1, h, c));
    const edge = face > 0 ? wx + WALL - 10 : wx;
    box(ctx, face > 0 ? edge + 10 - 2 : edge, top, 2, h, face > 0 ? '#A1A1AA' : '#18181B');
    for (let y = Math.floor(top / 28) * 28; y < GROUND_Y + 120; y += 28) box(ctx, edge + (face > 0 ? -2 : 2), y, 8, 14, (y / 28) % 2 ? '#CA8A04' : '#18181B');
    for (let y = Math.floor(top / 96) * 96 + 40; y < GROUND_Y; y += 96) for (let k = 0; k < 2; k++) box(ctx, wx + 14 + k * 20 - (face > 0 ? 0 : 0), y, 4, 4, '#27272A');
    for (let y = Math.floor(top / 192) * 192; y < GROUND_Y; y += 192) box(ctx, wx, y, WALL, 2, '#2A2A30');
    // (where it meets the floor: a dark seam)
    box(ctx, wx, GROUND_Y, WALL, 4, '#27272A');
  }
};

