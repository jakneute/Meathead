// THE CASTLE: section 2 of Spooky Land, DRACULA'S OTHER CASTLE. In through the door at the top of the stairs (it
// shuts behind him on its own), and the PA greets him: "Dracula" (Donnie, the boss, in his control room, in a fake
// accent; never revealed here), a pretentious prick: survive the ordeals and you might be granted an audience. Then a
// ghost tour (Silent Hill 3's haunted manor, as a theme-park walkthrough): seven absurdly spacious rooms, and in each
// the PA's spooky but stupid story of what happened there (Meathead has his say back after each), each room with its
// own threat built into the story:
//   the foyer:    the grand stair and its balcony; one skeleton with a coffin-lid shield (the shield, on its own).
//   dining room:  the table, the whole length of it (up on it, or under the chandeliers); the chandeliers come down
//                 on whoever's under them (a creak, a shake, the shadow first; they crush the cast too); more shields.
//   the study:    shelves and a reading balcony over the spiked-helmet knights (tempting a dive kick: don't);
//                 the poltergeist bookcases throw volleys of books (they rattle first).
//   the kitchen:  the stoves (stand on them between flare-ups: they sputter first); the igors' roasting forks (no
//                 shoulder charging into those); the witch up on her cauldron, lobbing potions.
//   the bedroom:  the bed bounces him (up to the canopy); vampire brides burst out of the wardrobes and from
//                 under the bed (hiss, then flat out at him).
//   the nursery:  the toy train runs the length of the floor (jump it); bat suits swooping on their rigs; real
//                 bats out of the chimney.
//   the gallery:  a mummy (the tank) on his own; then everything at once. The empty frame at the end: RESERVED.
// Then the stairs down to the dungeon. Every type taught on its own before they're mixed.
//
// Indoors (no time of day): candlelight of its own. The PA's lines: full clean / shitty / naked pools (lines.ts).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { SpookySection } from '../section';
import { layOwn, endWalls, endExits, runExits, solid, ledge, getSpooky } from '../section';
import { updateLadders, drawLadders, onLadder, type LadderDef } from '../../moves/ladders';
import { GY } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { registerHurtLines } from '../../kinds';
import { registerDeathKind } from '../../../m1/game/player/deathAnim';
import { box } from '../section';
import { hazardVictims, hazardKill, hazardHit, setHazardZones, type Zone } from '../../hazardHit';
import { spookyState } from '../section';
import { spawnStaff, STAFF } from './staff';
import { paStory, paQuip, paBusy, pick, byPants, drawPaWords } from './pa';
import { drawCastleBack, drawBooks, drawStoveFire, drawBallPit, castleLighting } from './art';
import {
  x0, x1, ROOMS, roomAt, CEIL, LEDGES, STOVES, STOVE_TOP, BURNERS, stovePhase, FIRE_H, STOVE_CYCLE, STOVE_FIRE, BED, BOUNCE, CHANDELIERS, CHAND_Y, CHAND_W, CHAND_TELL,
  BOOKCASES, BOOK_EVERY, BOOK_TELL, TRAIN, WARDROBES, HORNS_WORLD, CAST, PICKUPS, BALLPIT, DY, dyAt, ceilOf, LADDER_DEFS, type Castle,
} from './layout';
import * as L from './lines';

/** The ladders: the library's, and between floors (layout.ts). */
const LADDERS: LadderDef[] = LADDER_DEFS;

registerHurtLines('spooky_chandelier', L.HURT_CHANDELIER, L.DEATH_CHANDELIER);
registerHurtLines('spooky_books', L.HURT_BOOKS, L.DEATH_BOOKS);
registerHurtLines('spooky_stove', L.HURT_STOVE, L.DEATH_STOVE);
registerHurtLines('spooky_train', L.HURT_TRAIN, L.DEATH_TRAIN);
registerDeathKind('spooky_chandelier', 'flattened');
registerDeathKind('spooky_stove', 'burnt');
registerDeathKind('spooky_train', 'roadkill');

export { HORNS_WORLD };
const castleOf = (state: GameState) => spookyState<Castle>(state, 'castle', () => ({
  init: false, told: new Set(), chand: [], books: [], shelfT: BOOKCASES.map((_, i) => BOOK_EVERY - i * 50), stoveT: 0,
  train: { x: TRAIN.a + 200, dir: 1, bell: 0 }, wardrobe: WARDROBES.map(() => false), underBed: false, kills: 0, quipAt: -9999, doorShut: 0,
}));

/** The stories he's heard, kept across his deaths (no hearing the dining room's again every time he dies in the study);
 *  back to the start of the land (the town), they're all fresh. */
const heard = new Set<L.RoomId>();
/** ...the ones started but not all said yet: if he dies before they're done, they're told again next time. */
const telling = new Set<L.RoomId>();
const tell = (r: L.RoomId) => { heard.add(r); telling.add(r); return () => { telling.delete(r); }; };

/** His box, in the coordinates of the room he's in (its floor at GY: see layout.ts's DY). */
const pBox = (state: GameState) => {
  const p = state.player, low = p.isDucking || p.isSliding ? 28 : 0;
  return { x: p.pos.x, y: p.pos.y + low - dyAt(p.pos.x + p.width / 2), w: p.width, h: p.height - low };
};
const hits = (b: { x: number; y: number; w: number; h: number }, x: number, y: number, w: number, h: number) => x < b.x + b.w && x + w > b.x && y < b.y + b.h && y + h > b.y;
const canHurt = (state: GameState) => state.player.invincibilityTimer <= 0 && state.player.health > 0 && !state.player.inCutscene;
const isStaff = new Set<string>(Object.values(STAFF));
/** One of the cast's box, in the coordinates of the room it's in (as pBox). */
const eBox = (e: { pos: { x: number; y: number }; width: number; height: number }) => ({ x: e.pos.x, y: e.pos.y - dyAt(e.pos.x + e.width / 2), w: e.width, h: e.height });
/** A box in room coordinates, as a danger zone (world). */
const world = (x: number, y: number, w: number, h: number): Zone => { const d = dyAt(x + w / 2); return { x0: x, x1: x + w, y0: y + d, y1: y + h + d }; };

// ---------------------------------------------------------------------------------------------------------------
// The tour: the greeting, each room's story, the quips

const runTour = (state: GameState, cs: Castle) => {
  const p = state.player, cx = p.pos.x + p.width / 2;
  if (!heard.has('foyer') && cx > x0 + 240) {
    const fin = tell('foyer');
    cs.doorShut = 1; playSound('slam', 1, -6); shakeScreen(state, 6, 3);
    paStory(state, byPants(state, L.PA_GREET), pick(L.MH_GREET), fin);
  }
  const r = roomAt(cx);
  if (r && r.id !== 'foyer' && !heard.has(r.id) && cx > r.a + 180) {
    paStory(state, byPants(state, L.PA_STORY[r.id]), pick(L.MH_REPLY[r.id]), tell(r.id));
  }
  // (now and then, as he kills off the cast: a quip, if the PA's quiet)
  const liveNow = state.enemies.filter(e => isStaff.has(e.kind ?? '') && e.health > 0 && !e.isBlownAway && e.pos.x > x0 && e.pos.x < x1).length;
  const fighting = state.enemies.some(e => isStaff.has(e.kind ?? '') && e.health > 0 && !e.isBlownAway && Math.abs(e.pos.x - p.pos.x) < 500);
  if (cs.kills > liveNow && heard.has('foyer') && !fighting && state.frame - cs.quipAt > 1800 && !paBusy(state) && Math.random() < 0.5) {
    if (paQuip(state, pick(byPants(state, L.PA_KILL)))) cs.quipAt = state.frame;
  }
  cs.kills = liveNow;
};

// ---------------------------------------------------------------------------------------------------------------
// The set pieces

const runChandeliers = (ctx: FrameContext, cs: Castle, zones: Zone[]) => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2;
  for (const ch of cs.chand) {
    ch.t++;
    // (shaking loose or coming down: the cast keep out from under it)
    if (ch.state === 'tell' || ch.state === 'fall') zones.push(world(ch.x - CHAND_W / 2, ch.y, CHAND_W, GY - ch.y));
    if (ch.state === 'hang' && Math.abs(cx - ch.x) < 150 && p.pos.y - dyAt(cx) > CHAND_Y) { ch.state = 'tell'; ch.t = 0; playSound('crack', 0.6, -6); playSound('clink', 0.5, -4); }
    else if (ch.state === 'tell') {
      if (ch.t % 6 === 0) state.particles.push({ pos: { x: ch.x + (Math.random() - 0.5) * 40, y: CEIL + 40 }, vel: { x: 0, y: 2 }, life: 60, color: '#A8A29E', size: 3 });
      if (ch.t >= CHAND_TELL) { ch.state = 'fall'; ch.t = 0; ch.vy = 0; playSound('whoosh', 0.8, -8); }
    } else if (ch.state === 'fall') {
      ch.vy += 0.9; ch.y += ch.vy;
      // (it comes down on the table, or the floor)
      const floor = ch.x > LEDGES[3][0] && ch.x < LEDGES[3][0] + LEDGES[3][2] ? LEDGES[3][1] : GY;
      const bottom = ch.y + 34;
      if (canHurt(state) && hits(pBox(state), ch.x - CHAND_W / 2, ch.y, CHAND_W, 34)) hurtPlayer(ctx, 18, 'spooky_chandelier', { x: Math.sign(cx - ch.x || 1) * 5, y: -4 });
      // (and on whoever of the cast is under it: flat)
      for (const e of hazardVictims(state)) if (hits(eBox(e), ch.x - CHAND_W / 2, ch.y, CHAND_W, 34)) {
        hazardKill(ctx, e, ch.x, 'FLATTENED!', { fling: { x: Math.sign(e.pos.x - ch.x || 1) * 4, y: -3 }, sound: 'splat' });
      }
      if (bottom >= floor) {
        ch.y = floor; ch.state = 'down';
        playSound('glass', 1, -4); playSound('crash', 0.9, -6); shakeScreen(state, 10, 5);
        for (let i = 0; i < 18; i++) state.particles.push({ pos: { x: ch.x + (Math.random() - 0.5) * 60, y: floor - 10 }, vel: { x: (Math.random() - 0.5) * 8, y: -2 - Math.random() * 5 }, life: 40, color: i % 3 ? '#E0F2FE' : '#FACC15', size: 2 + Math.random() * 3, grav: 0.35 });
      }
    }
  }
};

const BOOK_COLS = ['#7F1D1D', '#1E3A8A', '#14532D', '#78350F', '#4C1D95'];
const runBooks = (ctx: FrameContext, cs: Castle) => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2 - dyAt(cx);
  BOOKCASES.forEach(([x, y], i) => {
    const near = Math.abs(cx - x) < 520 && Math.abs(cy - y) < 400 && canHurt(state);
    if (!near && cs.shelfT[i] > BOOK_TELL) return;
    cs.shelfT[i]--;
    if (cs.shelfT[i] === BOOK_TELL) playSound('crumble', 0.5, 6);
    if (cs.shelfT[i] <= 0) {
      cs.shelfT[i] = BOOK_EVERY;
      const dx = cx - x, dy = cy - (y - 60), len = Math.hypot(dx, dy) || 1;
      for (let k = 0; k < 3; k++) {
        const a = (k - 1) * 0.16, vx = (dx / len) * 7.5, vy = (dy / len) * 7.5;
        cs.books.push({ x, y: y - 60 - k * 22, vx: vx * Math.cos(a) - vy * Math.sin(a), vy: vx * Math.sin(a) + vy * Math.cos(a), rot: 0, t: 0, col: BOOK_COLS[(k + i) % BOOK_COLS.length] });
      }
      playSound('whoosh', 0.8, 6);
    }
  });
  cs.books = cs.books.filter(b => {
    b.t++; b.x += b.vx; b.y += b.vy; b.vy += 0.04; b.rot += 0.35 * Math.sign(b.vx || 1);
    if (canHurt(state) && hits(pBox(state), b.x - 9, b.y - 6, 18, 12)) { hurtPlayer(ctx, 8, 'spooky_books', { x: Math.sign(b.vx) * 4, y: -3 }); return false; }
    // (one of the cast in its way: the book's theirs)
    const e = hazardVictims(state).find(o => hits(eBox(o), b.x - 9, b.y - 6, 18, 12));
    if (e) { hazardHit(ctx, e, 12, b.x - b.vx * 4, 'BOOKED!', { knock: 4 }); playSound('thud', 0.6, 4); return false; }
    if (b.y > GY - 4 || b.t > 140) { for (let k = 0; k < 4; k++) state.particles.push({ pos: { x: b.x, y: Math.min(b.y, GY - 4) + DY.study }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 30, color: '#FEF3C7', size: 3, grav: 0.2 }); return false; }
    return true;
  });
};

const runStoves = (ctx: FrameContext, cs: Castle, zones: Zone[]) => {
  const { state } = ctx;
  const p = state.player, cx = p.pos.x + p.width / 2;
  if (Math.abs(cx - STOVES[0][0]) < 1400) cs.stoveT++;
  STOVES.forEach(([x], i) => {
    const ph = stovePhase(cs.stoveT, i);
    const k = (cs.stoveT + i * 100) % STOVE_CYCLE;
    if (k === STOVE_CYCLE - STOVE_FIRE && Math.abs(cx - x) < 900) { playSound('ignite', 0.8, -4); playSound('flame', 0.4, -6); }
    // (the burners: the cast keep off them, flaring or not; up in the flames, cooked)
    for (const [bx, bw] of BURNERS) zones.push(world(x + bx, STOVE_TOP - FIRE_H, bw, FIRE_H));
    if (ph === 'fire') for (const e of hazardVictims(state)) {
      const burner = BURNERS.find(([bx, bw]) => hits(eBox(e), x + bx, STOVE_TOP - FIRE_H, bw, FIRE_H));
      if (burner) { hazardHit(ctx, e, 40, x + burner[0] + burner[1] / 2, 'SEARED!', { color: '#FDBA74' }); playSound('ignite', 0.6, -2); }
    }
    if (ph !== 'fire' || !canHurt(state)) return;
    for (const [bx, bw] of BURNERS) if (hits(pBox(state), x + bx, STOVE_TOP - FIRE_H, bw, FIRE_H)) { hurtPlayer(ctx, 12, 'spooky_stove', { x: cx < x + bx + bw / 2 ? -5 : 5, y: -7 }); return; }
  });
};

const runBed = (ctx: FrameContext, cs: Castle) => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height - DY.bedroom;
  if (p.isGrounded && cx > BED.x && cx < BED.x + BED.w && Math.abs(feet - BED.top) < 3 && p.health > 0) {
    p.vel.y = -BOUNCE; p.isGrounded = false; p.jumpHoldTimer = 0; p.jumpBufferTimer = 0; p.coyoteJumpTimer = 0;
    playSound('boing', 0.8, -2);
    // (somebody under it: she's out)
    if (!cs.underBed) { cs.underBed = true; const e = spawnStaff(state, 'bride', BED.x + BED.w + 40, GY + DY.bedroom, 7, -1); e.facing = cx < e.pos.x ? -1 : 1; e.aiState = 'hiss'; playSound('snort', 0.8, 10); }
  }
  // Out of the wardrobes as he comes near
  WARDROBES.forEach((x, i) => {
    if (cs.wardrobe[i] || cx < x - 250 || cx > x + 400) return;
    cs.wardrobe[i] = true;
    const e = spawnStaff(state, 'bride', x, GY + DY.bedroom, 3 + i * 5, cx < x ? -1 : 1);
    e.aiState = 'hiss';
    playSound('crack', 0.8, -2); playSound('snort', 0.8, 10);
  });
};

const runTrain = (ctx: FrameContext, cs: Castle, zones: Zone[]) => {
  const { state } = ctx, tr = cs.train, p = state.player, cx = p.pos.x + p.width / 2;
  // (its track: nobody stands about on it)
  zones.push(world(TRAIN.a, GY - TRAIN.h, TRAIN.b + TRAIN.w - TRAIN.a, TRAIN.h));
  if (Math.abs(cx - (TRAIN.a + TRAIN.b) / 2) > 1400) return;
  tr.x += tr.dir * TRAIN.speed;
  if (tr.x > TRAIN.b) { tr.x = TRAIN.b; tr.dir = -1; playSound('ding', 0.4, 6); }
  if (tr.x < TRAIN.a) { tr.x = TRAIN.a; tr.dir = 1; playSound('ding', 0.4, 6); }
  if (++tr.bell % 50 === 0 && Math.abs(cx - tr.x) < 600) playSound('ding', 0.25, 12);
  if (canHurt(state) && hits(pBox(state), tr.x, GY - TRAIN.h, TRAIN.w, TRAIN.h)) hurtPlayer(ctx, 14, 'spooky_train', { x: tr.dir * 7, y: -6 });
  // (whoever's knocked onto the track: run down)
  for (const e of hazardVictims(state)) if (hits(eBox(e), tr.x, GY - TRAIN.h, TRAIN.w, TRAIN.h) && e.pos.y + e.height - dyAt(e.pos.x) > GY - TRAIN.h - 6) {
    if (hazardHit(ctx, e, 45, tr.x + TRAIN.w / 2 - tr.dir * 40, 'ROADKILL!', { knock: 10 })) playSound('ding', 0.5, 6);
  }
};

export const castle: SpookySection = {
  id: 'castle', x0, x1,
  checkpoints: [
    { name: 'THE CASTLE FOYER', cp: 10, x: x0 + 200, y: GY },
    { name: 'THE KITCHEN', cp: 11, x: ROOMS[2].a + 120, y: GY + DY.kitchen },
    { name: 'THE LIBRARY', cp: 12, x: ROOMS[3].a + 60, y: GY + DY.study },
    { name: 'THE MASTER BEDROOM', cp: 13, x: ROOMS[4].a + 60, y: GY + DY.bedroom },
    { name: 'THE PORTRAIT GALLERY', cp: 14, x: ROOMS[6].a + 60, y: GY + DY.gallery },
  ],
  build: (state) => {
    // (back at the start of the land: the tour's all fresh)
    if (state.checkpoint < 10) heard.clear();
    // (cut short by his dying: told again)
    for (const r of telling) heard.delete(r);
    telling.clear();
    // The floors: the ground floor (the foyer, the dining room), a floor down (the kitchen, the library's foot), the
    // third floor (the bedroom), the attic (the nursery, the gallery: round the ball pit)
    const fy = (id: keyof typeof DY) => GY + DY[id];
    layOwn(state, [
      { x1: x0 - 200, y1: GY, x2: ROOMS[2].a, y2: GY, surface: 'wood' },
      { x1: ROOMS[2].a, y1: fy('kitchen'), x2: ROOMS[4].a, y2: fy('kitchen'), surface: 'wood' },
      { x1: ROOMS[4].a, y1: fy('bedroom'), x2: ROOMS[5].a, y2: fy('bedroom'), surface: 'wood' },
      { x1: ROOMS[5].a, y1: fy('nursery'), x2: BALLPIT.a, y2: fy('nursery'), surface: 'wood' },
      { x1: BALLPIT.b, y1: fy('nursery'), x2: x1 + 200, y2: fy('nursery'), surface: 'wood' },
    ]);
    solid(state, BALLPIT.a, fy('nursery') + BALLPIT.depth, BALLPIT.b - BALLPIT.a, 200, { hidden: true, tag: 'castle-ballpit' });
    endWalls(state, 'castle');
    // (each room's ceiling, way up)
    for (const r of ROOMS) solid(state, r.a, ceilOf(r.id) + DY[r.id] - 60, r.b - r.a, 60, { hidden: true, tag: 'castle-ceiling' });
    // (the witch's hearth is stone: solid; the rest jump-through)
    for (const [x, y, w, look] of LEDGES) { const d = dyAt(x); if (look === 'cauldron') solid(state, x, y + d, w, GY - y, { hidden: true, tag: 'castle-hearth' }); else ledge(state, x, y + d, w, { hidden: true, tag: 'castle-ledge' }); }
    for (const [x, w] of STOVES) solid(state, x, STOVE_TOP + DY.kitchen, w, GY - STOVE_TOP, { hidden: true, tag: 'castle-stove' });
    solid(state, BED.x, BED.top + DY.bedroom, BED.w, GY - BED.top, { hidden: true, tag: 'castle-bed' });
    CAST.forEach(([kind, x, y], i) => spawnStaff(state, kind, x, y + dyAt(x), i));
    for (const [x, y, type] of PICKUPS) state.pickups.push({ id: `castle-${x}`, pos: { x: x - 10, y: y + dyAt(x) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
    const cs = castleOf(state);
    cs.chand = CHANDELIERS.map(x => ({ x, y: CHAND_Y, vy: 0, state: 'hang', t: 0 }));
  },
  update: (ctx, controls0) => {
    const { state } = ctx;
    const cs = castleOf(state);
    const controls = updateLadders(ctx, LADDERS, controls0);
    if (!cs.init) {
      // (starting further in (the checkpoint's only known once the stage is built): the rooms behind him have had their say)
      cs.init = true;
      const from = state.checkpoint >= 20 ? Infinity : castle.checkpoints.find(c => c.cp === state.checkpoint)?.x ?? -Infinity;
      for (const r of ROOMS) if (r.b <= from) heard.add(r.id);
    }
    // (out the front door to the stairs; on through the arch at the end of the gallery, down the stairs to the dungeon)
    if (runExits(state, endExits('castle'))) return controls;
    runTour(state, cs);
    const zones: Zone[] = [];
    runChandeliers(ctx, cs, zones);
    runBooks(ctx, cs);
    runStoves(ctx, cs, zones);
    runBed(ctx, cs);
    runTrain(ctx, cs, zones);
    setHazardZones(state, 'castle', zones);
    // (wading the ball pit: slow going, the balls flying)
    { const p = state.player, cx = p.pos.x + p.width / 2; if (cx > BALLPIT.a && cx < BALLPIT.b && p.pos.y + p.height > GY + DY.nursery + 8) { p.vel.x *= 0.8; if (Math.abs(p.vel.x) > 0.5 && state.frame % 6 === 0) { state.particles.push({ pos: { x: cx, y: GY + DY.nursery }, vel: { x: (Math.random() - 0.5) * 4, y: -2 - Math.random() * 2 }, life: 30, color: ['#EF4444', '#3B82F6', '#FACC15', '#22C55E'][state.frame % 4], size: 5, grav: 0.3 }); playSound('clink', 0.2, 8); } } }
    return controls;
  },
  drawBackdrop: (c) => { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#140608'); return true; },
  drawBack: (c, state) => { drawCastleBack(c, state, castleOf(state)); drawLadders(c, state, LADDERS); },
  cameraRow: (state) => (onLadder(state) ? 470 : undefined),
  drawFront: (c, state) => {
    const cs = castleOf(state);
    drawStoveFire(c, state, cs);
    drawBallPit(c, state);
    drawBooks(c, cs);
    if (getSpooky(state)?.section === 'castle') drawPaWords(c, state, HORNS_WORLD);
  },
  lighting: (state) => castleLighting(state, castleOf(state)),
};
