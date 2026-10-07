// The test pen: behind the STAFF ONLY door off the hub. A strip of back-of-house concrete with people (and a few
// animals) walking in from the far end to try the grabs on, a few at a time, forever. The door back to the hub is at
// the near end.

import type { StageLayout } from '../game/stages/index';
import type { GameState } from '../game/core/state';
import type { EnemyKind } from '../types';
import { groundBlocks } from '../game/core/terrain';
import { makeKindEnemy } from '../game/enemies/kinds';
import { GROUND_Y, CANVAS_WIDTH } from '../constants';
import { createGrab, updateGrab, drawGrab, grabbing, type Grab } from './grab';
import { setUi, goTo } from './store';

export const PEN_STAGE = 'M2 Staff Pen';
const X0 = -40000, LEN = 2400;
const EXIT_X = X0 + 130;
/** Who walks in, in turn (the rat's there to show who can't be grabbed). */
const ROSTER: EnemyKind[] = ['charger', 'shooter', 'pitbull', 'cop', 'goat', 'bouncer', 'techbro', 'wolverine', 'courier', 'rat', 'smokejumper', 'sicario'];
const AT_ONCE = 4, RESPAWN = 70;

interface Pen { grab: Grab; next: number; cooldown: number; upWas: boolean }
const getPen = (state: GameState) => state.stage as Pen | null;

const send = (state: GameState, pen: Pen) => {
  const kind = ROSTER[pen.next++ % ROSTER.length];
  const e = makeKindEnemy(kind, X0 + LEN - 120 - Math.random() * 200, GROUND_Y);
  e.seen = true;
  state.enemies.push(e);
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
    state.blocks.push({ x: X0 - 60, y: -3000, w: 60, h: 3600, type: 'wall', hidden: true, tag: 'pen-l' }, { x: X0 + LEN, y: -3000, w: 60, h: 3600, type: 'wall', hidden: true, tag: 'pen-r' });
    const pen: Pen = { grab: createGrab(state), next: 0, cooldown: 0, upWas: false };
    state.stage = pen;
    state.cameraMinX = X0 - 60;
    for (let i = 0; i < AT_ONCE; i++) { send(state, pen); state.enemies[state.enemies.length - 1].pos.x -= i * 260; }
  },
  update: (ctx, controls) => {
    const { state } = ctx;
    const pen = getPen(state);
    // (dev builds: the state on the window, for poking at it)
    if (import.meta.env.DEV) (window as unknown as { __m2: GameState }).__m2 = state;
    if (!pen) return controls;
    const out = updateGrab(ctx, pen.grab, controls);
    // Health doesn't drop off the dead here: the beatdown's how you get it back
    state.pickups = state.pickups.filter(p => !(p.id.startsWith('pickup-') && (p.type === 'small_health' || p.type === 'large_health')));
    // A few at a time, always
    const alive = state.enemies.filter(e => e.health > 0 && !e.isBlownAway).length + (pen.grab.held ? 1 : 0);
    if (alive < AT_ONCE && --pen.cooldown <= 0) { send(state, pen); pen.cooldown = RESPAWN; }
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
};

