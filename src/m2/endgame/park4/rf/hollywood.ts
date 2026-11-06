// STUNTMAN STEVE's refight (ENVY): Hollywood Land's own stunt stage and boss fight (hollywood/stunt) run whole at 999, in
// hell. The owner's: "for stuntman steve, the portal sends meathead flying into the hell colliseum steve now performs
// in. this enrages him. like on earth, his stunt show is mediocre, with uninterested demons watching."
//   - in through Ned's portal: flung in high over the stage, the land's own fall onto the crash mat and its intro again
//     (the PA, Meathead, the pan to Steve fuming, his posse), every line of it his refight's (park4/lines/hollywood.ts);
//     a respawn walks in from the checkpoint outside for the retry's entrance, as in the land;
//   - the crowd: demons, in the stands and at the barrier, bored stiff (slumped, chin on a hand, on their phones,
//     asleep), never cheering; the crowd's OOOH! and WOOO! are MEH. and YAWN. now (stunt/fight.ts crowd, gated);
//   - the hell's props along the set's foot, between the garage doors (the posse's tells stay clear), behind the stands;
//   - him stitched up the way he died: MISSED THE MAT (folded on his head: the neck seamed round where it was turned
//     back the right way, the crown of his skull stapled, his spine seamed) or STRUCK TO ASH (glued back together: ashy
//     gray patches, glue run down out of the seams, ash flaking off him).

import type { RefightDef } from '../defs';
import type { GameState } from '../../../../m1/game/core/state';
import { hollywoodLayout } from '../../../hollywood/index';
import { DOORS } from '../../../hollywood/geometry';
import { teleport } from '../../../hollywood/section';
import { ARENA_L, ARENA_R, DOORS_X, FLOOR_BACK_Y, GY } from '../../../hollywood/stunt/arena';
import { FLUNG_IN, LAND_FALL } from '../../../hollywood/stunt/state';
import type { Fight } from '../../../hollywood/stunt/fight';
import { STEVE_H } from '../../../hollywood/stunt/steve';
import { STUNT_HOOKS } from '../../../hollywood/stunt/art';
import * as S from '../../../hollywood/stunt/lines';
import { playSound } from '../../../../m1/game/platform/audio';
import { bossDeath } from '../../../store';
import { inRefight, refightOn } from '../hook';
import { drawHellProps } from '../hell';
import { refightId, refightStage } from '../where';
import * as L from '../lines/hollywood';
import { elbow, knee } from '../../../art/limb';

type Ctx = CanvasRenderingContext2D;
const on = () => inRefight('hollywood');
/** In through the portal (not a respawn): the fling's still to come. */
let flingDue = false;

// ---------------------------------------------------------------------------------------------------------------
// The demons in the stands (from the side, sat, facing the stage) and at the barrier (from behind): baked once each

const SKINS: [string, string, string, string][] = [
  ['#450A0A', '#7F1D1D', '#B91C1C', '#E04A3A'], ['#3B0764', '#6B21A8', '#9333EA', '#C084FC'],
  ['#1C2A12', '#3F5A1E', '#65803A', '#94B060'], ['#431407', '#7C2D12', '#C2410C', '#F07A3A'],
  ['#3A0A1A', '#7A1A3A', '#B0305A', '#E06A8A'],
];
const INK = '#14080A';
const cache = new Map<string, HTMLCanvasElement>();
const baked = (key: string, w: number, h: number, paint: (g: Ctx) => void) => {
  let cv = cache.get(key);
  if (!cv) { cv = document.createElement('canvas'); cv.width = w; cv.height = h; paint(cv.getContext('2d')!); cache.set(key, cv); }
  return cv;
};
const limbLine = (g: Ctx, pts: [number, number][], w: number, col: string) => {
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = INK; g.lineWidth = w + 2; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  g.strokeStyle = col; g.lineWidth = w; g.stroke();
};
const horn = (g: Ctx, x: number, y: number, dir: number, len: number) => {
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - 2.4, y + 1); g.quadraticCurveTo(x + dir * len * 0.2, y - len * 0.7, x + dir * len * 0.5, y - len - 1); g.quadraticCurveTo(x + dir * len * 0.3, y - len * 0.4, x + 2.4, y + 1); g.closePath(); g.fill();
  g.fillStyle = '#E7DCC8'; g.beginPath(); g.moveTo(x - 1.4, y); g.quadraticCurveTo(x + dir * len * 0.2, y - len * 0.65, x + dir * len * 0.45, y - len); g.quadraticCurveTo(x + dir * len * 0.25, y - len * 0.45, x + 1.4, y); g.closePath(); g.fill();
};

/** A demon sat in the stands, bored (side on, facing +x here: the caller mirrors it). `kind`: 0 chin on a hand, 1 hands on
 *  his knees, slumped, 2 on his phone, 3 asleep (head down on his chest). Feet at (0, 0), the seat under his hips. */
export const paintDemonSat = (g: Ctx, seed: number) => {
  const R = SKINS[seed % SKINS.length], kind = Math.floor(seed / SKINS.length) % 4;
  const hip: [number, number] = [0, -9], foot: [number, number] = [11, 2];
  const sh: [number, number] = [kind === 3 ? 5 : 3, kind === 3 ? -30 : -33];
  const head: [number, number] = kind === 3 ? [9, -32] : [6, -41];
  // (his tail, down off the seat behind him, its spade)
  limbLine(g, [[-3, -8], [-9, -4], [-11, 3], [-8, 8]], 2, R[1]);
  g.fillStyle = INK; g.beginPath(); g.moveTo(-8, 6); g.lineTo(-4, 11); g.lineTo(-11, 11); g.closePath(); g.fill();
  g.fillStyle = R[1]; g.beginPath(); g.moveTo(-8, 7.4); g.lineTo(-5.4, 10.2); g.lineTo(-10, 10.2); g.closePath(); g.fill();
  // (the far leg, then the near: the knee forward off the seat's edge, the shin down)
  for (const [dx, col] of [[-2, R[0]], [0, R[1]]] as const) {
    const h: [number, number] = [hip[0] + dx, hip[1]], ft: [number, number] = [foot[0] + dx, foot[1]];
    const kn = knee(h[0], h[1], ft[0], ft[1], 10, 11, 1);
    limbLine(g, [h, kn, ft], 4.4, col);
    g.fillStyle = INK; g.fillRect(ft[0] - 1, ft[1] - 2, 6, 3);
  }
  // (the body: slouched, banded down its back)
  g.fillStyle = INK; g.beginPath(); g.moveTo(hip[0] - 6, hip[1] + 1); g.lineTo(sh[0] - 7, sh[1]); g.lineTo(sh[0] + 6, sh[1] - 1); g.lineTo(hip[0] + 6, hip[1] + 1); g.closePath(); g.fill();
  g.fillStyle = R[1]; g.beginPath(); g.moveTo(hip[0] - 5, hip[1]); g.lineTo(sh[0] - 6, sh[1] + 1); g.lineTo(sh[0] + 5, sh[1]); g.lineTo(hip[0] + 5, hip[1]); g.closePath(); g.fill();
  g.fillStyle = R[2]; g.beginPath(); g.moveTo(hip[0] + 1, hip[1]); g.lineTo(sh[0] + 1, sh[1] + 1); g.lineTo(sh[0] + 5, sh[1]); g.lineTo(hip[0] + 5, hip[1]); g.closePath(); g.fill();
  for (let y = hip[1] - 4; y > sh[1] + 2; y -= 4) { g.fillStyle = R[0]; g.fillRect(-5 + (hip[1] - y) * 0.1, y, 2, 2); }
  // (the far arm hangs behind; the near arm by kind)
  const hand: [number, number] = kind === 0 ? [head[0] + 3, head[1] + 7] : kind === 2 ? [12, -30] : kind === 3 ? [7, -12] : [10, -12];
  const el = elbow(sh[0], sh[1] + 2, hand[0], hand[1], 10, 10, 1);
  limbLine(g, [[sh[0] - 3, sh[1] + 2], elbow(sh[0] - 3, sh[1] + 2, 5, -13, 10, 10, 1), [5, -13]], 3.4, R[0]);
  // (the head: horns, a long chin, a bored eye, half-lidded)
  const [hx, hy] = head;
  horn(g, hx - 3, hy - 5, -1, 7); horn(g, hx + 3, hy - 6, 1, 6);
  g.fillStyle = INK; g.beginPath(); g.ellipse(hx, hy, 7.6, 7, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(hx, hy + 2); g.lineTo(hx + 9, hy + 6); g.lineTo(hx + 2, hy + 8); g.closePath(); g.fill();
  g.fillStyle = R[2]; g.beginPath(); g.ellipse(hx, hy, 6.4, 5.8, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(hx, hy + 2); g.lineTo(hx + 7.6, hy + 5.6); g.lineTo(hx + 2, hy + 6.8); g.closePath(); g.fill();
  g.fillStyle = R[3]; g.fillRect(hx - 4, hy - 5, 4, 2);
  g.fillStyle = R[0]; g.fillRect(hx - 6, hy + 1, 3, 3);
  if (kind === 3) { g.fillStyle = INK; g.fillRect(hx + 2, hy - 1, 4, 1); }
  else { g.fillStyle = '#FDE047'; g.fillRect(hx + 2, hy - 2, 3, 2); g.fillStyle = INK; g.fillRect(hx + 2, hy - 3, 4, 1); g.fillRect(hx + 4, hy - 2, 1, 2); }
  // (the near arm over it all: to his chin, his knee, his phone)
  limbLine(g, [[sh[0] + 1, sh[1] + 2], el, hand], 3.6, R[2]);
  g.fillStyle = INK; g.beginPath(); g.arc(hand[0], hand[1], 2.6, 0, Math.PI * 2); g.fill(); g.fillStyle = R[2]; g.beginPath(); g.arc(hand[0], hand[1], 1.8, 0, Math.PI * 2); g.fill();
  if (kind === 2) { g.fillStyle = INK; g.fillRect(hand[0] - 1, hand[1] - 9, 6, 9); g.fillStyle = '#86EFAC'; g.fillRect(hand[0], hand[1] - 8, 4, 6); }
};
/** A demon at the barrier, from behind (shoulders at (0, 0), his head over them): bare red back, the spine's knobs, the
 *  horns, slumped; some forced into one of Steve's yellow shirts. */
export const paintDemonBack = (g: Ctx, n: number) => {
  const R = SKINS[n % SKINS.length], w = 26 + (n * 7) % 12, shirt = n % 4 === 1, slump = 3 + (n % 3);
  const l = -w / 2;
  g.fillStyle = INK; g.fillRect(l - 1, slump + 2, w + 2, 64); g.fillRect(l + 2, slump - 1, w - 4, 4);
  const B = shirt ? ['#8A6A08', '#C8970E', '#EAB516', '#FAD43A'] : R;
  g.fillStyle = B[2]; g.fillRect(l, slump + 3, w, 62); g.fillRect(l + 3, slump, w - 6, 4);
  g.fillStyle = B[3]; g.fillRect(l, slump + 3, 4, 62);
  g.fillStyle = B[1]; g.fillRect(l + w - 6, slump + 3, 6, 62);
  if (shirt) { g.fillStyle = '#7A1A0A'; g.font = 'bold 7px monospace'; g.textAlign = 'center'; g.fillText('STEVE', 0, slump + 22); }
  else {
    // (the spine's knobs, the shoulder blades)
    for (let y = slump + 8; y < slump + 60; y += 7) { g.fillStyle = R[3]; g.fillRect(-1, y, 3, 3); g.fillStyle = R[0]; g.fillRect(-1, y + 3, 3, 1); }
    g.fillStyle = R[1]; g.fillRect(l + 5, slump + 14, 7, 2); g.fillRect(l + w - 12, slump + 14, 7, 2);
  }
  // (the head, from behind, sunk forward: bald and lumpy, the horns curling up off it)
  const hw = 17, hx = -hw / 2, hy = slump - 16 + (n % 2) * 2;
  horn(g, hx + 3, hy + 3, -1, 10); horn(g, hx + hw - 3, hy + 3, 1, 10);
  g.fillStyle = INK; g.fillRect(hx - 1, hy - 1, hw + 2, 19); g.fillStyle = R[2]; g.fillRect(hx, hy, hw, 17);
  g.fillStyle = R[3]; g.fillRect(hx + 2, hy + 1, 6, 3); g.fillStyle = R[1]; g.fillRect(hx + hw - 4, hy + 2, 4, 14);
  g.fillStyle = R[2]; g.fillRect(hx - 3, hy + 6, 3, 6); g.fillRect(hx + hw, hy + 6, 3, 6);
  // (one rests his head on a fist; one's arm hangs over the barrier rail)
  if (n % 5 === 3) { g.fillStyle = INK; g.fillRect(l + w - 2, hy + 6, 8, 34); g.fillStyle = R[2]; g.fillRect(l + w - 1, hy + 7, 6, 32); g.fillStyle = R[3]; g.fillRect(l + w - 1, hy + 7, 6, 5); }
};
const FAN_W = 80, FAN_H = 90;
const fanCanvas = (seed: number, s: -1 | 1) => baked(`rf-dmn-sat-${seed % 20}-${s}`, FAN_W, FAN_H, g => {
  g.translate(FAN_W / 2, FAN_H - 14); g.scale(-s * 1.55, 1.55); paintDemonSat(g, seed % 20);
});
const backCanvas = (n: number) => baked(`rf-dmn-back-${n % 15}`, 64, 110, g => { g.translate(32, 32); paintDemonBack(g, n % 15); });

// (wired into the stage's art: only ever does anything while this refight's on)
STUNT_HOOKS.fan = (c, x, y, seed, s) => {
  if (!on()) return false;
  c.drawImage(fanCanvas(seed, s), Math.round(x - FAN_W / 2), Math.round(y - FAN_H + 14));
  return true;
};
STUNT_HOOKS.back = (c, px, py, n) => {
  if (!on()) return false;
  c.drawImage(backCanvas(n), Math.round(px - 32), Math.round(py - 32));
  return true;
};
/** The garage doors' half widths, kept clear (the posse's tells: headlights, the door going up). */
const PORT = 125;
STUNT_HOOKS.stage = (c, state) => {
  if (!on()) return;
  c.save();
  c.beginPath();
  const edges = [ARENA_L + 40, ...DOORS_X.flatMap(d => [d - PORT, d + PORT]), ARENA_R - 40];
  for (let i = 0; i + 1 < edges.length; i += 2) if (edges[i + 1] > edges[i]) c.rect(edges[i], FLOOR_BACK_Y - 400, edges[i + 1] - edges[i], 402);
  c.clip();
  drawHellProps(c, state, 'ENVY', { l: ARENA_L, r: ARENA_R, floor: FLOOR_BACK_Y });
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Him

/** The stage's fight, as the land's section keeps it (read only; nothing's made if it isn't there). */
const fightOf = (state: GameState): Fight | null => ((state.stage as { s?: { stunt?: { f?: Fight | null } } } | null)?.s?.stunt?.f ?? null);
type FightLook = Fight & { mode: string; sx: number; facing: 1 | -1; act: string; tow: unknown };

/** Ash coming off him (struck to ash, glued back): a few flakes, falling. */
const ashFlakes = (c: Ctx, x: number, feet: number, fr: number) => {
  for (let k = 0; k < 6; k++) {
    const t = ((fr * 0.7 + k * 23) % 80) / 80, fx = x + ((k * 13) % 30) - 15 + Math.sin(t * 6 + k) * 4, fy = feet - STEVE_H * (0.85 - (k % 3) * 0.2) + t * 70;
    c.fillStyle = k % 2 ? '#57534E' : '#A8A29E'; c.fillRect(Math.round(fx), Math.round(fy), 2, 2);
  }
};
/** Glue run out of his seams (struck to ash, glued back), dried in yellow drips. */
const glue = (c: Ctx, x: number, feet: number, face: number) => {
  for (const [fx, fy, len] of [[-6, 0.24, 7], [8, 0.27, 5], [-2, 0.5, 9], [5, 0.62, 6], [-9, 0.78, 5]] as const) {
    const gx = x + fx * face, gy = feet - STEVE_H + STEVE_H * fy;
    c.fillStyle = '#7A5A10'; c.fillRect(Math.round(gx) - 1, Math.round(gy), 3, len + 1);
    c.fillStyle = '#FDE68A'; c.fillRect(Math.round(gx), Math.round(gy), 1, len); c.fillRect(Math.round(gx) - 1, Math.round(gy + len - 1), 3, 2);
  }
};

export const hollywoodRefight: RefightDef = {
  land: 'hollywood', id: refightId('hollywood'), stage: refightStage('hollywood'),
  boss: 'STUNTMAN STEVE', sin: 'ENVY',
  inner: hollywoodLayout, cp: 60,
  sign: { pic: 'star', word: 'STAR', color: '#EAB308' },
  looks: ['normal', 'weakness'],
  lookNow: () => bossDeath('hollywood') ?? 'normal',
  lookName: l => (l === 'weakness' ? 'STRUCK TO ASH (WEAKNESS)' : 'MISSED THE MAT'),
  swaps: () => [
    [S.PA_LANDING, L.RF_PA_LANDING], [S.MEATHEAD_LANDED, L.RF_MEATHEAD_LANDED], [S.STEVE_FUMING, L.RF_STEVE_FUMING], [S.STEVE_POSSE, L.RF_STEVE_POSSE],
    [S.STEVE_ENTRANCE, L.RF_STEVE_ENTRANCE], [S.STEVE_TAUNT, L.RF_STEVE_TAUNT], [S.STEVE_SEND, L.RF_STEVE_SEND], [S.STEVE_RAMP, L.RF_STEVE_RAMP],
    [S.STEVE_TOO_CLOSE, L.RF_STEVE_TOO_CLOSE], [S.STEVE_FLAIL, L.RF_STEVE_FLAIL], [S.STEVE_SLIP, L.RF_STEVE_SLIP], [S.STEVE_TOW, L.RF_STEVE_TOW],
    [S.STEVE_HURT, L.RF_STEVE_HURT], [S.STEVE_ZAPPED, L.RF_STEVE_ZAPPED], [S.STEVE_CAR_HIT, L.RF_STEVE_CAR_HIT], [S.STEVE_LOW, L.RF_STEVE_LOW],
    [S.STEVE_STUMBLE, L.RF_STEVE_STUMBLE], [S.STEVE_LAST_STUNT, L.RF_STEVE_LAST_STUNT], [S.STEVE_BACK, L.RF_STEVE_BACK],
    [S.STEVE_SLUMPED, L.RF_STEVE_SLUMPED], [S.STEVE_FRIED, L.RF_STEVE_FRIED], [S.PA_DEATH, L.RF_PA_DEATH], [S.PA_DEATH_FRIED, L.RF_PA_DEATH_FRIED],
    [S.MEATHEAD_WON, L.RF_MEATHEAD_WON], [S.MEATHEAD_WON_WEAK, L.RF_MEATHEAD_WON_WEAK],
  ],
  // (the props go along the set's foot from the stage's own hook (STUNT_HOOKS.stage): drawn after the land's whole back,
  // they'd be over Steve, his cars and the ramps, which the land draws in its back too)
  arena: () => null,
  bossAt: (state) => {
    const f = fightOf(state) as FightLook | null;
    if (!f || f.mode === 'dead' || f.tow || f.act === 'towed' || f.act === 'slide' || f.act === 'yank') return null;
    return { x: f.sx + 2.5 * f.facing, feet: GY, w: 40, h: STEVE_H, face: f.facing };
  },
  stitches: look => look === 'weakness'
    // (struck to ash, glued back: ashy patches where he crumbled, the seams between the pieces)
    ? { thread: '#3F3F46', patch: '#78716C', seams: [[0.3, 0.22, 0.75, 0.24], [0.15, 0.42, 0.85, 0.46], [0.25, 0.7, 0.7, 0.66]], patches: [[0.55, 0.05, 0.25, 0.1], [0.2, 0.3, 0.3, 0.12], [0.6, 0.52, 0.28, 0.14], [0.3, 0.8, 0.25, 0.12]], stain: { col: '#44403C', k: 0.25 } }
    // (missed the mat: folded on his head; the neck seamed round where they turned it back, the skull's crown stapled
    // where it hit, the spine seamed where it folded)
    : { thread: '#F5F5F4', patch: '#7F1D1D', seams: [[0.28, 0.215, 0.78, 0.225], [0.38, 0.03, 0.66, 0.05], [0.42, 0.3, 0.4, 0.62]], staples: [[0.3, 0.215], [0.76, 0.225], [0.52, 0.04], [0.41, 0.46]] },
  drawFront: (c, state) => {
    // (the look's own touches over the stitches: the glue and the ash for STRUCK TO ASH)
    if ((refightOn()?.look ?? hollywoodRefight.lookNow()) !== 'weakness') return;
    const at = hollywoodRefight.bossAt!(state);
    if (!at) return;
    glue(c, at.x, at.feet, at.face);
    ashFlakes(c, at.x, at.feet, state.frame);
  },
  build: (_state, fresh) => { flingDue = fresh; },
  update: (ctx) => {
    // (in through Ned's portal: flung in high over the stage's way in, tumbling; the land's own fall and intro take it
    // from there (stunt/fight.ts: the refight runs its intro again when he's flung in). Done on the first frame after
    // Ned's card, not in the build: the engine puts him at the build's checkpoint as the stage starts going)
    if (!flingDue) return;
    flingDue = false;
    const state = ctx.state, to = DOORS.stunt.start, p = state.player;
    teleport(state, to.x, to.y - LAND_FALL.h);
    p.freefall = { style: 'flail', t: 0, rot: 0, land: 0 }; p.carried = true; p.inCutscene = true;
    FLUNG_IN.on = true;
    state.camera.y = to.y - 550; state.cameraRestY = state.camera.y;
    playSound('whoosh', 1, -6);
  },
};
