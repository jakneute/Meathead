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
import { drawPuffBit } from './punditArt';
import { drawWhBackdrop, drawWhBack, drawWhFront } from './art';
import { GAGS } from './lines';
import './kinds';
import './catDeath';

const { x0, x1 } = SECTIONS.whitehouse1;

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
    layOwn(state, GROUND.map(([a, b, ha, hb]) => ({ x1: X(a), y1: Y(ha), x2: X(b), y2: Y(hb), surface: 'wood', steps: a === STAIRS.a ? { n: STAIRS.steps } : undefined })));
    state.blocks.push({ x: x0 - 40, y: -6000, w: 40, h: 6000 + GY + 600, type: 'wall', hidden: true, tag: 'whitehouse1-start' });
    state.blocks.push({ x: x1, y: -6000, w: 40, h: 6000 + GY + 600, type: 'wall', hidden: true, tag: 'whitehouse1-end' });
    for (const [a, b, top] of SOLIDS) solid(state, X(a), Y(top), b - a, Math.min(GY + 40 - Y(top), top + 40), { hidden: true });
    for (const [a, b, h] of LEDGES) ledge(state, X(a), Y(h), b - a, { hidden: true });
    const s = whOf(state);
    s.towers = makeTowers(state, [TOPIARY]);
    makeChandelier(state);
    layWax(state);
    buildArenas(state);
    for (const [kind, rx, h, v] of CAST) {
      const e = makeKindEnemy(kind as EnemyKind, X(rx), Y(h));
      e.homeX ??= e.pos.x; e.homeY = e.pos.y; e.variant = v ?? Math.abs(Math.round(rx)) % 7; e.facing = -1;
      state.enemies.push(e);
    }
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `wh1-${Math.round(rx)}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
    builtAt.set(state.stage as object, { cp: state.checkpoint, seen: false, last: 0 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, s = whOf(state);
    const up = projectionUp(state);
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
  drawBackdrop: (c, state) => drawWhBackdrop(c, state),
  drawBack: (c, state) => {
    drawWhBack(c, state);
    drawTowers(c, state, whOf(state).towers);
    drawPunditsWorld(c, state);
    if (projectionUp(state)) drawChelsea(c, state);
  },
  drawFront: (c, state) => {
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
  outdoors: (state) => (roomAt(state.player.pos.x + state.player.width / 2 - x0).outdoors ? 1 : 0),
  cameraX: (state) => fightCam(state),
};

// ---------------------------------------------------------------------------------------------------------------
// What the mean men throw, drawn

const drawThrows = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const t of whOf(state).throws) {
    const ink = (path: () => void, fill: string, w = 2) => { c.beginPath(); path(); c.fillStyle = fill; c.fill(); c.strokeStyle = INK; c.lineWidth = w; c.stroke(); };
    if (t.kind === 'moneybag') {
      c.save(); c.translate(t.x, t.y); c.rotate(t.t * 0.15);
      ink(() => { c.moveTo(-8, 6); c.quadraticCurveTo(-10, -4, -3, -6); c.lineTo(3, -6); c.quadraticCurveTo(10, -4, 8, 6); c.closePath(); }, '#C8B48A');
      ink(() => c.rect(-3, -10, 6, 4), '#A16207', 1.5);
      c.fillStyle = '#15803D'; c.font = '7px "Press Start 2P"'; c.fillText('$', -3.5, 5);
      c.restore();
    } else if (t.kind === 'clipboard') {
      c.save(); c.translate(t.x, t.y); c.scale(1, 0.35 + Math.abs(Math.sin(t.t * 0.4)) * 0.65);
      ink(() => c.roundRect(-8, -10, 16, 20, 1.5), '#A16207');
      c.fillStyle = '#F8FAFC'; c.fillRect(-6, -7, 12, 15);
      c.restore();
    } else if (t.kind === 'stinkbomb') {
      ink(() => c.arc(t.x, t.y, 5, 0, Math.PI * 2), '#65A30D');
      c.strokeStyle = '#84CC16'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(t.x, t.y - 5); c.quadraticCurveTo(t.x + 3, t.y - 10, t.x, t.y - 14); c.stroke();
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
