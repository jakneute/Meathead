// CHELSEA AND SOCKS' WACKY WHITE HOUSE ADVENTURES, part one: section 3 of Cartoon Land. The user's design
// (cartoon-spec.md, verbatim there): "you enter behind a screen and meathead is in a cartoonish version of the white
// house. suddenly a third hand eraser comes in and erases meathead's sprite, then a pen comes in and draws a socks the
// cat/meathead hybrid of meathead. he has the same moves, the special guns are the same, but the ray gun is replaced by
// spitting out a hairball... Chelsea Clinton tells you that her mom and dad are out of town for a UN summit and 'mean
// men' have invaded the white house, like a home alone thing. she just runs around and nags you like navi, telling you
// what to do while meathead tells her to 'shut up'. she can't be harmed. you progress through a large cartoonish white
// house facing various obstacles, as a cat. there are 5 minibosses..." (this half: ROSS PEROT, JERRY FALWELL). The
// user since: NO wall climbing; the same moves with his own cat frames; kills here are cartoon puffs, no blood (the
// projection hides the real stage); the pundits' real deaths are found on the way back later (job 4's).
//
// The pieces: THE TRANSFORMATION (transform.ts: the first time in); the cat form (Player.catForm: the engine's
// render/player/catBody.ts, the hairball in combat/weapons.ts; set every frame he's in here); cartoon kills
// (state.cartoonKills: core/cartoonKills.ts; the puffs, poof.ts); CHELSEA (chelsea.ts); the rooms (layout.ts, art.ts);
// the hazards (hazards.ts); the mean men (kinds.ts); the pundits (pundits.ts); the cat's death (catDeath.ts).
//
// Checkpoints 20-26. The ways: in from behind the studio's screen (DOORS.whitehouse1.start); back out the entrance
// hall's left end (DOORS.studio.end, in front of the screen: himself again out there); on at the garden's right end, the
// West Colonnade (DOORS.whitehouse2.start); back from part two, in the garden (DOORS.whitehouse1.end).

import type { GameState } from '../../../m1/game/core/state';
import type { EnemyKind } from '../../../m1/types';
import { GUN_COOLDOWN, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { pickLine } from '../../../m1/game/platform/speech';
import { makeKindEnemy, mid } from '../../../m1/game/enemies/kinds';
import { purgeCartoonGore } from '../../../m1/game/core/cartoonKills';
import type { CartoonSection } from '../section';
import { layOwn, ledge, solid, meatheadSays, byPants, runExits, saidOver } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';
import { makeTowers, updateTowers, drawTowers, ridingTower } from '../sway';
import { INK, type Ctx } from '../kit';
import { GROUND, SOLIDS, LEDGES, STAIRS, TOPIARY, CAST, PICKUPS, CHECKPOINTS, GAG_AT, ROOMS, roomAt, X, Y } from './layout';
import { whOf, saidOnce, CAT_MEMO, COLLAPSED_MEMO } from './state';
import { updateHazards, makeChandelier, layWax, ridingChandelier } from './hazards';
import { updateTransform, drawTransform, drawTransformHud, scribbleIn } from './transform';
import { updateChelsea, drawChelsea, drawChelseaSaid } from './chelsea';
import { updatePundits, buildArenas, drawPunditsWorld, drawPunditsSaid, drawPunditBar, fightCam, punditScene, punditSkipShown } from './pundits';
import { drawSkipPrompt } from '../../../m1/game/platform/skip';
import { updatePuffs, drawPuffs } from './poof';
import { drawPuffBit, toonPart } from './punditArt';
import { drawWhBackdrop, drawWhBack, drawWhFront } from './art';
import { GAGS } from './lines';
import { seedOf } from './kinds';
import type { Enemy, Block } from '../../../m1/types';
import type { Tower } from '../sway';
import { todLight } from '../../timeOfDay';
import { presetMemos, deadList, markDead, saidOnce as saidOnce2, DEAD1_MEMO } from '../whitehouse2/state';
import { drawStageBackdrop, drawStageShell, drawStageProps, drawSeats, drawFallenScreen, stageLights, realLight, type StagePlan } from '../whitehouse2/realStage';
import { drawPerotBody, drawFalwellBody, drawDeadActor } from '../whitehouse2/bodies';
import { STAGE_WH1, BODY_LINES } from '../whitehouse2/lines';
import { PIANO, CHAIRS, RISER, PODIUM, SIDEBOARD, BED, BENCH, TABLE, ARBOR, PEROT_ARENA, FALWELL_ARENA, BALCONY_EDGE, F2, floorAt } from './layout';
import './kinds';
import './catDeath';

const { x0, x1 } = SECTIONS.whitehouse1;

// ---------------------------------------------------------------------------------------------------------------
// The real stage (job 4's: once the screen's down in part two, COLLAPSED_MEMO, this half is the stage behind it: no
// cat, no cartoon, no Chelsea, no hazards (the vacuum, the wax, the chandelier, the bowling balls, the sprinklers, the
// roses were the projection's); everything he stands on is plywood (whitehouse2/realStage.ts); where Perot and Falwell
// were fought their actors lie dead (whitehouse2/bodies.ts), and the mean men's actors he killed where he killed them.
// The chair stack and the topiary tower were the show's; in their place, scaffold steps down off the deck's end into
// the garden's stretch (the way back up).

/** The steps down off the second floor's deck where the balcony was: [from, to, top height]. */
const STAGE_STEPS: [number, number, number][] = [0, 1, 2, 3, 4].map(i => [BALCONY_EDGE + i * 46, BALCONY_EDGE + (i + 1) * 46, F2 - (i + 1) * 50]);
const PLAN1: StagePlan = {
  a: x0 - 200, b: x1 + 200, floorAt: x => Y(floorAt(x - x0)),
  boxes: [
    [X(PIANO.a), X(PIANO.b), Y(PIANO.h), 'PIANO'], [X(PODIUM.a), X(PODIUM.b), Y(PODIUM.h), 'PODIUM'], [X(SIDEBOARD.a), X(SIDEBOARD.b), Y(SIDEBOARD.h), 'SIDEBRD'],
    [X(BED.a), X(BED.b), Y(BED.h), 'BED'], [X(BENCH.a), X(BENCH.b), Y(BENCH.h), ''],
    ...STAGE_STEPS.map(([a, b, h]) => [X(a), X(b), Y(h), ''] as [number, number, number, string]),
  ],
  planks: [[X(TABLE.a), X(TABLE.b), Y(TABLE.h)], [X(ARBOR.a), X(ARBOR.b), Y(ARBOR.h)], ...[PEROT_ARENA, FALWELL_ARENA].flatMap(A => A.ledges.map(([a, b, h]) => [X(a), X(b), Y(h)] as [number, number, number]))],
  stairs: { a: X(STAIRS.a), b: X(STAIRS.b), n: STAIRS.steps, top: Y(F2) },
  decks: [[X(STAIRS.b), X(BALCONY_EDGE), Y(F2)]],
  flats: [[X(1100), 'WH-02 CROSS'], [X(2200), 'WH-03 EAST'], [X(3700), 'WH-04 PRESS'], [X(5000), 'WH-05 DINING'], [X(6400), 'WH-06 STAIR'], [X(10300), 'WH-11 GARDEN']],
  marks: [[X(500), 'ENTRANCE'], [X(1600), 'CROSS HALL'], [X(2900), 'EAST RM'], [X(4300), 'PRESS RM'], [X(5700), 'DINING'], [X(11000), 'ROSE GDN']],
  cameras: [X(1000), X(5900), X(11900)],
};
/** The cast as built this stage, by its place in CAST (a kill marks the actor dead). */
const castOf = new WeakMap<object, Map<Enemy, number>>();
/** This stage's turned to the real stage (the cartoon's bits taken out). */
const realDone = new WeakSet<object>();
const seeds1 = new Map<number, number>();
const seed1 = (ix: number) => {
  let s = seeds1.get(ix);
  if (s === undefined) { const [kind, rx, h, v] = CAST[ix]; const e = makeKindEnemy(kind as EnemyKind, X(rx), Y(h)); e.variant = v ?? Math.abs(Math.round(rx)) % 7; s = seedOf(e); seeds1.set(ix, s); }
  return s;
};
/** Turn this stage's part one into the real stage (once: on a build after the screen's down, or the first frame back in
 *  here after it came down this stage): the hazards' blocks away, the cast gone, the steps down off the deck put in. */
const toRealStage = (state: GameState) => {
  const key = state.stage as object;
  if (realDone.has(key)) return;
  realDone.add(key);
  const s = whOf(state);
  const away = (b: Block | null) => { if (b) b.x = -1e7; };
  away(s.chand.b); s.chand.b = null;
  for (const t of s.towers as Tower[]) away(t.b);
  s.towers = [];
  for (const b of state.blocks) if (b.tag === `wh1-solid-${CHAIRS.a}` || b.tag === `wh1-solid-${RISER.a}`) away(b);
  state.groundOil = (state.groundOil ?? []).filter(o => !(o as { wax?: boolean }).wax);
  const cast = castOf.get(key);
  if (cast) state.enemies = state.enemies.filter(e => !cast.has(e) || e.health <= 0);
  s.balls = []; s.throws = []; s.scene = null;
  for (const [a, b, h] of STAGE_STEPS) solid(state, X(a), Y(h), b - a, h + 40, { hidden: true, tag: 'wh1-stage-step' });
};

/** Is the White House the show (the projection's up: he's the cat, kills are puffs)? Not once the projector's come
 *  down (job 4's COLLAPSED_MEMO). Part two (job 4's) uses the same. */
export const projectionUp = (state: GameState) => !state.stageMemo[COLLAPSED_MEMO];
/** He's the cat here (the projection's up and he's been drawn in). */
export const catActive = (state: GameState) => projectionUp(state) && !!state.stageMemo[CAT_MEMO];

/** The checkpoint he was built at (a later first frame from outside the White House is a way in from the studio). */
const builtAt = new WeakMap<object, { cp: number; seen: boolean; last: number }>();

export const whitehouse1: CartoonSection = {
  id: 'whitehouse1', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    // (a fresh start along: the world as a run that got there left it (job 4's: whitehouse2/state.ts))
    presetMemos(state);
    layOwn(state, GROUND.map(([a, b, ha, hb]) => ({ x1: X(a), y1: Y(ha), x2: X(b), y2: Y(hb), surface: 'wood', steps: a === STAIRS.a ? { n: STAIRS.steps } : undefined })));
    state.blocks.push({ x: x0 - 40, y: -6000, w: 40, h: 6000 + GY + 600, type: 'wall', hidden: true, tag: 'whitehouse1-start' });
    state.blocks.push({ x: x1, y: -6000, w: 40, h: 6000 + GY + 600, type: 'wall', hidden: true, tag: 'whitehouse1-end' });
    for (const [a, b, top] of SOLIDS) solid(state, X(a), Y(top), b - a, Math.min(GY + 40 - Y(top), top + 40), { hidden: true, tag: `wh1-solid-${a}` });
    for (const [a, b, h] of LEDGES) ledge(state, X(a), Y(h), b - a, { hidden: true });
    const s = whOf(state);
    s.towers = makeTowers(state, [TOPIARY]);
    makeChandelier(state);
    layWax(state);
    buildArenas(state);
    const cast = new Map<Enemy, number>();
    CAST.forEach(([kind, rx, h, v], ix) => {
      const e = makeKindEnemy(kind as EnemyKind, X(rx), Y(h));
      e.homeX ??= e.pos.x; e.homeY = e.pos.y; e.variant = v ?? Math.abs(Math.round(rx)) % 7; e.facing = -1;
      state.enemies.push(e); cast.set(e, ix);
    });
    castOf.set(state.stage as object, cast);
    // (the screen's down: the real stage)
    if (!projectionUp(state)) toRealStage(state);
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `wh1-${Math.round(rx)}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
    builtAt.set(state.stage as object, { cp: state.checkpoint, seen: false, last: 0 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, s = whOf(state);
    const up = projectionUp(state);
    if (!up) return updateReal(state, controls);
    // (a mean man's actor killed: his body lies there once the screen's down)
    for (const [e, ix] of castOf.get(state.stage as object) ?? []) if (e.health <= 0) markDead(state, DEAD1_MEMO, ix);
    // (the projection's up: no blood, no bodies, the puffs; he's the cat, once he's been drawn in)
    state.cartoonKills = up;
    if (!s.scene) p.catForm = catActive(state);
    // (in from the studio, been drawn in before: a quick scribble back into the cat)
    // (the first frame after a build from outside it, or back after being away: the studio)
    const b = builtAt.get(state.stage as object);
    if (b) {
      if (catActive(state) && ((!b.seen && b.cp < 20) || (b.last > 0 && state.frame - b.last > 2))) scribbleIn(state);
      b.seen = true; b.last = state.frame;
    }
    s.lastHp = p.health;
    updateTowers(ctx, s.towers);
    updateHazards(ctx);
    let out = up ? updateTransform(ctx, controls) : controls;
    out = updatePundits(ctx, out);
    if (up) updateChelsea(state);
    updatePuffs(state);
    purgeCartoonGore(state);
    // What he's got to say (once each a visit)
    const rx = p.pos.x + p.width / 2 - x0, alive = !p.inCutscene && p.health > 0;
    const once = (key: string, pool: string[]) => { if (alive && saidOnce(key)) meatheadSays(state, pickLine(pool), false); };
    if (p.catForm && p.currentWeapon === 'GUN' && p.shootCooldown === GUN_COOLDOWN) once('wh-hairball', byPants(state, GAGS.hairball));
    for (const [key, a, bb] of GAG_AT) if (rx > a && rx < bb) once(`wh-${key}`, byPants(state, GAGS[key as keyof typeof GAGS]));
    if (ridingChandelier(state)) once('wh-chandelier', byPants(state, GAGS.chandelier));
    void ridingTower;
    // The ways: back out the entrance hall's left end (to the studio, in front of the screen); on at the West
    // Colonnade (to part two)
    runExits(state, [{ x0, x1: x0 + 60, yTop: GY - 40, yBot: GY + 2, to: DOORS.studio.end }]);
    runExits(state, [{ x0: x1 - 60, x1, yTop: GY - 40, yBot: GY + 2, to: DOORS.whitehouse2.start }]);
    return out;
  },
  drawBackdrop: (c, state) => (projectionUp(state) ? drawWhBackdrop(c, state) : drawStageBackdrop(c, state)),
  drawBack: (c, state) => {
    if (!projectionUp(state)) { drawReal1(c, state); return; }
    drawWhBack(c, state);
    drawTowers(c, state, whOf(state).towers);
    drawPunditsWorld(c, state);
    if (projectionUp(state)) drawChelsea(c, state);
  },
  drawFront: (c, state) => {
    if (!projectionUp(state)) {
      // (the empty front row; the screen heaped over the stage's lip, all along)
      drawSeats(c, state, x0 - 200, x1 + 200);
      const seg = 880, v0 = state.camera.x - seg, v1 = state.camera.x + CANVAS_WIDTH + seg;
      for (let a = Math.floor(Math.max(x0 - 200, v0) / seg) * seg; a < Math.min(x1 + 200, v1); a += seg) drawFallenScreen(c, a + 20, a + seg - 20, GY + 6);
      return;
    }
    drawWhFront(c, state);
    drawThrows(c, state);
    drawPuffs(c, state, drawPuffBit);
    const s = whOf(state);
    for (const [e, b] of s.barks) if (e.health > 0) saidOver(c, b.text, mid(e).x, e.pos.y - 14, '#FDE68A', 220);
    drawPunditsSaid(c, state, saidOver);
    if (projectionUp(state)) drawChelseaSaid(c, state);
    drawTransform(c, state);
  },
  drawHud: (c, state) => {
    drawPunditBar(c, state);
    drawTransformHud(c, state);
    // (a pundit's entrance: the letterbox, SKIP >>)
    if (punditScene(state)) {
      c.fillStyle = '#05030A'; c.fillRect(0, 0, CANVAS_WIDTH, 36); c.fillRect(0, CANVAS_HEIGHT - 36, CANVAS_WIDTH, 36);
      if (punditSkipShown(state)) drawSkipPrompt(c, CANVAS_WIDTH);
    }
  },
  outdoors: (state) => (projectionUp(state) && roomAt(state.player.pos.x + state.player.width / 2 - x0).outdoors ? 1 : 0),
  // (the real stage's work lights once the screen's down; else, outdoors, the time of day's; indoors none)
  lighting: (state) => {
    if (!projectionUp(state)) return realLight(state, stageLights(state, x0 - 200, x1 + 200));
    return roomAt(state.player.pos.x + state.player.width / 2 - x0).outdoors ? todLight([], 1) : null;
  },
  cameraX: (state) => fightCam(state),
};

/** Part one, the screen down: no cat, no hazards, no Chelsea; his lines at what he left; the ways out. */
const updateReal = (state: GameState, controls: Parameters<NonNullable<CartoonSection['update']>>[1]) => {
  const p = state.player;
  toRealStage(state);
  state.cartoonKills = false; p.catForm = false;
  const alive = !p.inCutscene && p.health > 0, cx = p.pos.x + p.width / 2;
  const once = (key: string, pool: string[]) => { if (alive && saidOnce2(key)) meatheadSays(state, pickLine(pool), false); };
  const near = (x: number, r: number) => Math.abs(cx - x) < r && Math.abs(p.pos.y + p.height - Y(floorAt(x - x0))) < 160;
  once('wh1-real', byPants(state, STAGE_WH1));
  if (near(X((PODIUM.a + PODIUM.b) / 2), 200)) once('body-perot', byPants(state, BODY_LINES.perot));
  if (near(X((BED.a + BED.b) / 2), 220)) once('body-falwell', byPants(state, BODY_LINES.falwell));
  if ([...deadList(state, DEAD1_MEMO)].some(ix => near(X(CAST[ix][1]), 120))) once('body-staff', byPants(state, BODY_LINES.staff));
  runExits(state, [{ x0, x1: x0 + 60, yTop: GY - 40, yBot: GY + 2, to: DOORS.studio.end }]);
  runExits(state, [{ x0: x1 - 60, x1, yTop: GY - 40, yBot: GY + 2, to: DOORS.whitehouse2.start }]);
  return controls;
};
/** Part one's real stage (world, behind him): the shell, the plywood, Perot and Falwell's actors, the dead he left. */
const drawReal1 = (c: Ctx, state: GameState) => {
  drawStageShell(c, state, PLAN1);
  drawStageProps(c, state, PLAN1);
  if (onScreenX(state, X(PODIUM.a) - 200, X(PODIUM.b) + 200)) drawPerotBody(c, X(PODIUM.a), X(PODIUM.b), Y(PODIUM.h), GY);
  if (onScreenX(state, X(BED.a) - 200, X(BED.b) + 200)) drawFalwellBody(c, X(BED.a), X(BED.b), Y(BED.h), Y(F2));
  for (const ix of deadList(state, DEAD1_MEMO)) {
    const [kind, rx, h] = CAST[ix];
    if (!onScreenX(state, X(rx) - 160, X(rx) + 160)) continue;
    const fy = kind === 'm2:ct_blimp' ? Y(floorAt(rx)) : Y(h);
    drawDeadActor(c, kind, seed1(ix), X(rx), fy, ix % 2 === 1, state.frame);
  }
};
const onScreenX = (state: GameState, a: number, b: number) => b > state.camera.x - 60 && a < state.camera.x + CANVAS_WIDTH + 60;

// ---------------------------------------------------------------------------------------------------------------
// What the mean men throw, drawn

/** (part two draws the mean men's throws with this too) */
export const drawThrows = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const t of whOf(state).throws) {
    const ink = (path: () => void, fill: string, w = 2) => { c.beginPath(); path(); c.fillStyle = fill; c.fill(); c.strokeStyle = INK; c.lineWidth = w; c.stroke(); };
    if (t.kind === 'moneybag') {
      // (a burlap money bag in steps, its neck tied with gold cord, a fat green $)
      c.save(); c.translate(t.x, t.y); c.rotate(t.t * 0.15);
      toonPart(c, () => { c.moveTo(-8, 6); c.quadraticCurveTo(-10, -4, -3, -6); c.lineTo(3, -6); c.quadraticCurveTo(10, -4, 8, 6); c.closePath(); }, ['#E8D8B0', '#C8B48A', '#A08A60', '#7A6640'], -10, 10, 2);
      ink(() => c.rect(-3, -10, 6, 4), '#A16207', 1.5);
      c.fillStyle = '#F2C84A'; c.fillRect(-4, -7, 8, 1.5);
      c.fillStyle = '#15803D'; c.fillRect(-1, -3, 2, 8); c.fillRect(-3, -2, 6, 1.5); c.fillRect(-3, 0.5, 6, 1.5); c.fillRect(-3, 3, 6, 1.5); c.fillStyle = '#4ADE80'; c.fillRect(-1, -3, 1, 8);
      c.restore();
    } else if (t.kind === 'clipboard') {
      c.save(); c.translate(t.x, t.y); c.scale(1, 0.35 + Math.abs(Math.sin(t.t * 0.4)) * 0.65);
      toonPart(c, () => c.roundRect(-8, -10, 16, 20, 1.5), ['#D8A040', '#A16207', '#7A4A06', '#5A3404'], -8, 8, 2);
      c.fillStyle = '#F8FAFC'; c.fillRect(-6, -7, 12, 15); c.fillStyle = '#9CA3AF'; c.fillRect(-3, -12, 6, 4);
      for (let k = 0; k < 3; k++) { c.fillStyle = k % 2 ? '#DC2626' : '#16A34A'; c.fillRect(-5, -4 + k * 4, 2, 2); c.fillStyle = '#94A3B8'; c.fillRect(-2, -3.5 + k * 4, 6, 1); }
      c.restore();
    } else if (t.kind === 'stinkbomb') {
      // (a glass stink bomb: green in steps, a shine, a cork, a wisp)
      toonPart(c, () => c.arc(t.x, t.y, 5, 0, Math.PI * 2), ['#A3E635', '#65A30D', '#3F6212', '#28400A'], t.x - 5, t.x + 5, 2);
      c.fillStyle = '#FFFFFF'; c.fillRect(t.x - 3, t.y - 3, 2, 2);
      ink(() => c.rect(t.x - 2, t.y - 8, 4, 3), '#A16207', 1);
      c.strokeStyle = '#84CC16'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(t.x, t.y - 8); c.quadraticCurveTo(t.x + 3, t.y - 12, t.x, t.y - 16); c.stroke();
    } else if (t.kind === 'cloud') {
      const k = Math.min(1, t.t / 10), a = t.t > 90 ? Math.max(0, 1 - (t.t - 90) / 20) : 1;
      c.save(); c.globalAlpha = 0.75 * a;
      for (const [dx, dy, r] of [[-22, -16, 16], [0, -26, 20], [22, -14, 16], [-8, -8, 14], [12, -6, 14]] as [number, number, number][]) { c.fillStyle = '#365314'; c.beginPath(); c.arc(t.x + dx * k, t.y + dy * k, r * k + 2, 0, Math.PI * 2); c.fill(); }
      for (const [dx, dy, r] of [[-22, -16, 16], [0, -26, 20], [22, -14, 16], [-8, -8, 14], [12, -6, 14]] as [number, number, number][]) { c.fillStyle = t.t % 20 < 10 ? '#84CC16' : '#A3E635'; c.beginPath(); c.arc(t.x + dx * k + Math.sin(f * 0.1 + dx) * 2, t.y + dy * k, r * k, 0, Math.PI * 2); c.fill(); }
      // (stink lines)
      c.strokeStyle = '#3F6212'; c.lineWidth = 1.5; for (let i = 0; i < 3; i++) { const x = t.x - 14 + i * 14, y = t.y - 46 - ((f + i * 7) % 20); c.beginPath(); c.moveTo(x, y + 10); c.quadraticCurveTo(x + 4, y + 5, x, y); c.stroke(); }
      c.restore();
    } else if (t.kind === 'bills') {
      for (let i = 0; i < 4; i++) { c.fillStyle = INK; c.fillRect(t.x - 16 + i * 9, t.y - 3, 8, 4); c.fillStyle = '#86EFAC'; c.fillRect(t.x - 15 + i * 9, t.y - 2, 6, 2); }
    }
  }
};
export { ROOMS };
