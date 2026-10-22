// THE QUEEN: section 8 of Space Land, the boss (owner: the haunted-house agent). Three parts, left to right (geo.ts):
//
//   THE HOLD      XENOSCARE's showpiece: THE QUEEN (LEGALLY DISTINCT, the signs insist: a cheap knockoff animatronic of
//                 a certain movie monster's queen) behind her glass. He kicks it in; the real aliens up in the control
//                 booth take her over; she smashes the floor and he goes through it (show.ts).
//   THE BASEMENT  the dark under the ride, deep under the hold (the floor gives under him and down he goes, all of it on
//                 screen); two levels of it; she stalks him through it, silent, one touch and he's dead; he hides in
//                 the lockers (basement.ts). At its east end a long flight of stairs up toward the park, the space
//                 disco's door at the top, and he kicks it in.
//   THE DISCO     GALACTIC GROOVE (extra wide: the camera follows him in it): a shutter slams down behind him; the
//                 extinguisher, the bonk, NOW ENTERING LESS FATAL MODE; then the boss (fight.ts). The big refill and the
//                 boss's checkpoint just OUTSIDE the door, on the landing (dead in the fight, he walks back in himself).
//
// Beaten: VICTORY, the walk-away (walkAway/spaceQueen.ts), the hub; Space Land's cleared. Revisits: the hold's stand
// empty and its hole still there (in it, down he goes); the basement empty of her; the disco's door in, her dead on the
// dance floor, the DJ booth's glass green.
//
// The ways: the left end, back into the haunted spaceship; the hole down (and the stairs up at the basement's left end).

import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import type { SpaceSection } from '../section';
import { layOwn, endWalls, endExits, runExits, spaceState, hands, box, teleport, solid } from '../section';
import { GY } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT, topBand } from '../../../m1/constants';
import { drawSkipPrompt, SKIP_AFTER } from '../../../m1/game/platform/skip';
import { goTo, markLandCleared, markBossDeath, noteBossKill, isLandCleared, setUi, keepForRevisits, keptForRevisits } from '../../store';
import { type Victory, startVictory, tickVictory, drawVictory, victoryDone } from '../../victory';
import { type WalkAway, playWalkAway, tickWalkAway, drawWalkAway } from '../../walkAway';
import { drawBars } from '../../spooky/control/cine';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { x0, x1, ARENA_L, ARENA_R, TRIGGER_X, QUEEN_X, HOLE, BASE_L, STAIRS_X, LAND_X, DOOR_X, DISCO_L, DISCO_R, DISCO_TRIGGER, DISCO_QX, DOOR_REFILL_X, DOOR_CP_X, BF, STAIRS_A, STAIRS_B, CEIL_B } from './geo';
import { updateLadders, drawLadders } from '../../moves/ladders';
import { markBossFight } from '../../bossQuiet';
import { drawRoomBack, drawGlass, drawQueen, roomLights, drawAfterFall } from './art';
import { type Show, makeShow, startShow, tickShow, showOn, showSkippable, drawShowQueen, drawShowSaid, drawShowFade, showHead, fell, collapsed, drawFallingSlabs, BASEMENT_CP } from './show';
import { type Hunter, makeHunter, buildHunter, forceDoorIn, tickHunter, atDoor, startKick, doorIn, doorKicking, drawHunter, drawHides, drawHunterFront, hunterLighting, hunterZoom, drawDiscoDoor, layBasement, LADDERS, GRAVEYARD_CP, TUNNEL_CP, TUNNEL_CP_X, DISCO_CP } from './basement';
import { type Fight, makeFight, startFight, updateFight, fightOver, endFight, queenDrops, introOn, drawQueenFight, drawQueenSaid, drawFightHud, discoLights, drawPool, poolLights, oilLights, tellLights, boothOps, introCamX, discoZoom, queenHoldTick, drawBurstFlash, drawIntroCloseup } from './fight';
import { drawBasement, drawDisco, discoLighting, discoGlow, drawShutter, drawDiscoShell } from './lowerArt';
import { type Piece, type Splat, packPieces, unpackPieces, drawPieces, drawSplats } from './burst';

interface Queen {
  init: boolean;
  fight: 'wait' | 'on' | 'won'; wonAt: number;
  show: Show | null; h: Hunter | null; f: Fight | null;
  glassBlock: Block | null; holdGate: Block | null; gate: Block | null;
  /** The hold's floor over the hole (till it gives). */
  holeBlock: Block | null;
  /** The disco's shutter behind him (0 up, 1 down), and which way it's going. */
  shutter: number; shutterTo: 0 | 1;
  /** The camera pulled back for her death and the booth's two running out (0..1): in as she goes, out for the walk-away. */
  deathCam: number;
  victory: Victory | null; walk: WalkAway | null;
  /** A revisit after her weakness death: her pieces where they landed (kept: the store), or null (her corpse). */
  wreck: { pieces: Piece[]; splats: Splat[] } | null | undefined;
}
/** The store's key for her pieces (a revisit after her weakness death). */
const WRECK_KEPT = 'space-queen-pieces';
const queenOf = (state: GameState) => spaceState<Queen>(state, 'queen', () => ({ init: false, fight: 'wait', wonAt: 0, show: null, h: null, f: null, glassBlock: null, holdGate: null, gate: null, holeBlock: null, shutter: 0, shutterTo: 0, deathCam: 0, victory: null, walk: null, wreck: undefined }));
const showOf = (state: GameState) => { const q = queenOf(state); return (q.show ??= makeShow(state)); };
const hunterOf = (state: GameState) => { const q = queenOf(state); return (q.h ??= makeHunter(state)); };
const fightOf = (state: GameState) => { const q = queenOf(state); return (q.f ??= makeFight(state)); };
const cxOf = (state: GameState) => state.player.pos.x + state.player.width / 2;
const feetOf = (state: GameState) => state.player.pos.y + state.player.height;
/** Down below (the basement, under the hold), or east of the hold (the stairs, the disco). */
const inLower = (state: GameState) => cxOf(state) > ARENA_R + 40 || feetOf(state) > GY + 40;
/** In the basement proper (the camera held on its whole height). */
const inBasement = (state: GameState) => feetOf(state) > GY + 40 && cxOf(state) < STAIRS_A + 40 && cxOf(state) > BASE_L - 300;

export const queen: SpaceSection = {
  id: 'queen', x0, x1,
  checkpoints: [
    { name: 'THE HOLD', cp: 70, x: x0 + 300, y: GY },
    { name: 'THE BASEMENT', cp: BASEMENT_CP, x: LAND_X + 80, y: BF },
    { name: 'THE ANIMATRONIC GRAVEYARD', cp: GRAVEYARD_CP, x: BASE_L + 2780, y: BF },
    { name: 'THE SERVICE TUNNEL', cp: TUNNEL_CP, x: TUNNEL_CP_X, y: BF },
    // (outside the disco's door, on the landing, the refill by it (the user's standing rule: dead in a boss fight, he's
    // back outside its door and walks in himself): his once the door's kicked in (basement.ts), nobody about)
    { name: 'GALACTIC GROOVE', cp: DISCO_CP, x: DOOR_CP_X, y: GY, clear: [600, 900], manual: true },
  ],
  build: (state) => {
    // The ground: the antechamber's (solid on down: the basement's west wall); the basement's floor, deep; the long
    // flight up out of it; the landing at the top and the disco. Over the basement, the hold's floor is a slab (it gives)
    layOwn(state, [
      { x1: x0 - 200, y1: GY, x2: BASE_L - 50, y2: GY, surface: 'metal' },
      { x1: BASE_L - 50, y1: BF, x2: STAIRS_A, y2: BF, surface: 'metal' },
      { x1: STAIRS_A, y1: BF, x2: STAIRS_B, y2: GY, surface: 'metal', steps: { n: 28 } },
      { x1: STAIRS_B, y1: GY, x2: x1 + 200, y2: GY, surface: 'metal' },
    ]);
    endWalls(state, 'queen');
    state.player.carried = false;
    const q = queenOf(state);
    const slab = { hidden: true, tag: 'queen-floor' } as Partial<Block>;
    solid(state, BASE_L - 50, GY, HOLE.a - (BASE_L - 50), CEIL_B - GY, slab);
    solid(state, HOLE.b, GY, ARENA_R + 40 - HOLE.b, CEIL_B - GY, slab);
    q.holeBlock = fell(state) ? null : solid(state, HOLE.a, GY, HOLE.b - HOLE.a, CEIL_B - GY, slab);
    // (the hold's far wall; the disco's far wall)
    state.blocks.push({ x: ARENA_R, y: -4000, w: 40, h: 4000 + GY, type: 'wall', hidden: true, tag: 'queen-far' } as Block);
    state.blocks.push({ x: DISCO_R, y: -4000, w: 40, h: 4000 + GY, type: 'wall', hidden: true, tag: 'queen-disco-r' } as Block);
    layBasement(state);
    q.shutter = 0; q.shutterTo = 0;
    // (her glass: a wall till it's kicked in)
    if (!isLandCleared('space') && !fell(state)) { q.glassBlock = { x: QUEEN_X - 158, y: -4000, w: 16, h: 4000 + GY, type: 'wall', hidden: true, tag: 'queen-glass' } as Block; state.blocks.push(q.glassBlock); }
    // (the disco's door, till it's kicked in)
    buildHunter(state, hunterOf(state));
    // Outside the disco's door, on the landing: the big health and the big ammo (the boss-door refill, every retry)
    state.pickups.push(
      { id: 'queen-health', pos: { x: DOOR_REFILL_X - 30, y: GY - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 },
      { id: 'queen-ammo', pos: { x: DOOR_REFILL_X + 10, y: GY - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 },
    );
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, q = queenOf(state), s = showOf(state), h = hunterOf(state), f = fightOf(state);
    const cx = cxOf(state);
    // (the basement's ladders: first, before anything else reads the controls)
    if (inLower(state) && !p.inCutscene) controls = updateLadders(ctx, LADDERS, controls);
    // (the camera pulled back for her death and the booth's two running out: in as she goes, held through the VICTORY,
    // back in for the walk-away)
    q.deathCam = (q.fight === 'on' && f.mode === 'dead') || (q.fight === 'won' && !q.walk) ? Math.min(1, q.deathCam + 1 / 50) : Math.max(0, q.deathCam - 1 / 40);
    // (the shutter, slamming down, or going back up)
    q.shutter = q.shutterTo ? Math.min(1, q.shutter + 0.08) : Math.max(0, q.shutter - 0.02);
    if (!q.init) {
      q.init = true;
      // (a fresh start at a checkpoint past the fall (it's set after the build): the floor's gone)
      if (fell(state) && s.step === 'wait') { s.step = 'done'; s.glass = false; }
      if (state.checkpoint >= DISCO_CP) forceDoorIn(state, h);
    }
    if (q.glassBlock && !s.glass) { state.blocks = state.blocks.filter(b => b !== q.glassBlock); q.glassBlock = null; }
    // (the floor's given: the slab over the hole's gone)
    if (q.holeBlock && collapsed(s)) { state.blocks = state.blocks.filter(b => b !== q.holeBlock); q.holeBlock = null; }
    // The hold: the cutscene (into the basement)
    { const out = tickShow(ctx, s); if (out) return out; }
    if (s.step === 'wait' && !isLandCleared('space') && cx > TRIGGER_X && cx < ARENA_R && p.isGrounded && p.health > 0) {
      q.holdGate = { x: ARENA_L - 30, y: -4000, w: 30, h: 4000 + GY, type: 'wall', hidden: true, tag: 'queen-hold-gate' } as Block;
      state.blocks.push(q.holdGate);
      startShow(state, s);
      return hands();
    }
    if (q.holdGate && s.step === 'done') { state.blocks = state.blocks.filter(b => b !== q.holdGate); q.holdGate = null; }
    // (the hole, after: no floor there, he just drops through it the way he went the first time; the stairs up out of
    // the basement at its west end)
    const below = feetOf(state) > GY + 40;
    if (below && cx < STAIRS_X + 30 && cx > BASE_L - 100) setUi({ upPrompt: 'UP THE STAIRS' });
    if (below && cx < STAIRS_X + 30 && cx > BASE_L - 100 && controls.up && p.isGrounded) { teleport(state, ARENA_L + 80, GY); return controls; }
    // The basement: her; the door
    if (inLower(state) && cx < DOOR_X + 60 || doorKicking(h)) {
      if (!doorIn(h) && !doorKicking(h) && atDoor(state, h)) startKick(state, h);
      const out = tickHunter(ctx, h, controls);
      // (the door down: his to walk in through himself; the disco's cutscene once he's in (below))
      if (out) return out;
    }
    // (her kids' drops while the fight's on; the park's otherwise)
    queenDrops(q.fight === 'on');
    // The disco
    if (q.fight === 'wait') {
      if (doorIn(h) && !isLandCleared('space') && cx > DISCO_TRIGGER && p.isGrounded && p.health > 0) beginDisco(state, q, f);
      runExits(state, endExits('queen').filter(e => e.x0 < x0 + 100));
      return controls;
    }
    if (q.fight === 'on') {
      markBossFight(state);
      let out = updateFight(ctx, f, controls);
      if (introOn(f)) p.inCutscene = true;
      const lo = DISCO_L, hi = DISCO_R - p.width;
      if (p.pos.x < lo) { p.pos.x = lo; if (p.vel.x < 0) p.vel.x = 0; }
      if (p.pos.x > hi) { p.pos.x = hi; if (p.vel.x > 0) p.vel.x = 0; }
      if (fightOver(f)) {
        q.fight = 'won'; q.wonAt = state.frame;
        endFight(state, f);
        if (q.gate) { state.blocks = state.blocks.filter(b => b !== q.gate); q.gate = null; }
        // (the shutter back up: the way back's open)
        q.shutterTo = 0; playSound('rumble', 0.6, -4);
        q.victory = startVictory();
        out = hands();
      }
      return out;
    }
    p.inCutscene = true;
    if (q.victory) {
      tickVictory(state, q.victory);
      if (victoryDone(q.victory) && state.frame - q.wonAt > 60) {
        q.victory = null;
        markBossDeath('space', f.byWeakness); markLandCleared('space'); noteBossKill();
        // (her pieces where they lie, for the revisits; a plain death's her corpse)
        keepForRevisits(WRECK_KEPT, f.blown ? packPieces(f.pieces, f.splats) : null);
        q.walk = playWalkAway(state, { boss: 'space-queen', weakness: f.byWeakness, onDone: () => goTo('hub') });
      }
    }
    if (q.walk) tickWalkAway(q.walk, controls);
    return hands();
  },
  cameraX: (state) => {
    const q = queenOf(state), s = showOf(state), f = fightOf(state);
    if (showOn(s)) return { min: ARENA_L, max: ARENA_L };
    if (inLower(state)) {
      if (q.fight === 'wait') return { min: BASE_L - 220, max: DISCO_R - CANVAS_WIDTH };
      // (the disco's cutscene: held on him, the booth and her; the fight: following him, inside the hall)
      const ic = introCamX(f);
      if (ic !== null) return { min: ic, max: ic };
      return { min: DISCO_L - 60, max: DISCO_R - CANVAS_WIDTH + 40 };
    }
    return { min: x0, max: ARENA_R - CANVAS_WIDTH };
  },
  // (the basement: its whole height on one screen, the camera held level on it; dropping into it, it follows him down)
  cameraRow: (state) => (inBasement(state) ? feetOf(state) - (GY - 6) : undefined),
  zoom: (state) => hunterZoom(state, hunterOf(state)) ?? discoZoom(state, fightOf(state), queenOf(state).deathCam),
  // (a mallet hit on her: a beat's hit-stop; her weakness death: slow motion on the burst)
  holdTick: (ctx) => (queenOf(ctx.state).fight === 'wait' ? false : queenHoldTick(fightOf(ctx.state))),
  drawBackdrop: (c) => { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#07040E'); return true; },
  lighting: (state) => {
    const cx = cxOf(state), s = showOf(state), f = fightOf(state);
    if (inLower(state)) {
      const dark = hunterLighting(state, hunterOf(state));
      if (dark && cx < DOOR_X + 10) return dark;
      const l = discoLighting(state, isLandCleared('space') ? 1 : discoLights(f));
      if (queenOf(state).fight === 'on') l.lights.push(...poolLights(f), ...oilLights(f), ...tellLights(f));
      return l;
    }
    const head = showHead(s);
    return { dark: 0.5, shade: [14, 6, 30], rim: 0.5, lights: [
      ...roomLights({ glass: s.glass, booth: s.step === 'done' ? 0 : s.booth, splat: false, operators: false, beam: s.beam, head }, QUEEN_X),
      { x: x0 + 260, y: GY - 300, r: 260, a: 0.5 },
      { x: state.player.pos.x + 20, y: state.player.pos.y + 30, r: 130, a: 0.4 },
    ] };
  },
  drawBack: (c, state) => {
    const s = showOf(state), f = fightOf(state), h = hunterOf(state), cleared = isLandCleared('space');
    // The hold
    drawRoomBack(c, state, { glass: s.glass, booth: s.step === 'done' ? 0 : s.booth, splat: false, operators: s.step !== 'done', beam: s.beam, head: showHead(s) });
    if (s.step === 'done') drawAfterFall(c, state, HOLE); else drawShowQueen(c, state, s);
    // The basement, the disco
    drawBasement(c, state, { fell: fell(state), landed: s.step === 'done' });
    drawFallingSlabs(c, state, s);
    drawLadders(c, state, LADDERS);
    drawHides(c, state, h);
    // (pulled right back for her weakness death: the building round the hall, not whatever's past it)
    if (queenOf(state).deathCam > 0) drawDiscoShell(c, state);
    drawDisco(c, state, { lights: cleared ? 1 : discoLights(f), ops: cleared ? null : boothOps(f), extinguisher: f.ext2 === 'wall' });
    drawDiscoDoor(c, state, h);
    // (the shutter down in the same doorway, behind him)
    drawShutter(c, state, queenOf(state).shutter);
    if (cleared && queenOf(state).fight === 'wait') {
      // (her weakness death: the pieces where they landed; otherwise her, dead on the dance floor)
      const q = queenOf(state), w = q.wreck === undefined ? (q.wreck = unpackPieces(keptForRevisits(WRECK_KEPT))) : q.wreck;
      if (w) { drawSplats(c, w.splats); drawPieces(c, w.pieces, state.frame); }
      else drawQueen(c, DISCO_QX, -1, { pose: 'dead', t: state.frame, ext: 0, alive: 0, beat: 1, free: true });
    }
    else if (queenOf(state).fight !== 'wait') drawQueenFight(c, state, f);
    drawHunter(c, state, h);
  },
  drawFront: (c, state) => {
    const s = showOf(state), f = fightOf(state), q = queenOf(state);
    // (the hot oil pool over everything on the floor: blood, gore, his feet in it)
    if (q.fight === 'on') drawPool(c, state, f);
    drawGlass(c, state, s.glass && !isLandCleared('space'));
    drawShowSaid(c, s);
    drawQueenSaid(c, f);
  },
  drawHud: (c, state) => {
    const q = queenOf(state), s = showOf(state), f = fightOf(state), h = hunterOf(state);
    // (the disco's light in the air, over the lit frame: the ball's rays, the cans' beams, the neon's bloom)
    if (inLower(state) && !inBasement(state) && (doorIn(h) || doorKicking(h))) {
      const z = queen.zoom?.(state) ?? null, cam = state.camera;
      c.save();
      if (z && z.scale !== 1) { c.translate(z.x + (z.shiftX ?? 0) - cam.x, z.y + (z.shiftY ?? 0) - cam.y); c.scale(z.scale, z.scale); c.translate(-z.x, -z.y); }
      else c.translate(-cam.x, -cam.y);
      discoGlow(c, state, isLandCleared('space') ? 1 : discoLights(f));
      c.restore();
    }
    drawHunterFront(c, state, h);
    if (showOn(s)) { drawBars(c, 1); if (showSkippable(s) && s.skipT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH); }
    drawShowFade(c, s);
    drawIntroCloseup(c, f, state.frame);
    if (introOn(f)) { drawBars(c, Math.min(1, f.skipT / 20)); if (f.skipT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH); }
    if (q.fight === 'on') drawFightHud(c, f, topBand(), !!state.player.inCutscene);
    if (q.fight !== 'wait') drawBurstFlash(c, f);
    if (q.victory) drawVictory(c, q.victory);
    if (q.walk) drawWalkAway(c, q.walk);
  },
};

/** Into the disco: the hall's door shut behind him (a gate), the cutscene (or, a retry, straight in). */
const beginDisco = (state: GameState, q: Queen, f: Fight) => {
  q.fight = 'on';
  q.gate = { x: DISCO_L - 30, y: -4000, w: 30, h: 4000 + GY, type: 'wall', hidden: true, tag: 'queen-disco-gate' } as Block;
  state.blocks.push(q.gate);
  // (the shutter down behind him: slammed (a clang, a shake, dust); a retry too: he's walked back in through the door)
  q.shutterTo = 1;
  playSound('slam', 1, -6); playSound('crash', 0.8, -8); shakeScreen(state, 10, 5);
  for (let i = 0; i < 18; i++) state.particles.push({ pos: { x: DISCO_L - 15 + (Math.random() - 0.5) * 60, y: GY - 4 - Math.random() * 20 }, vel: { x: (Math.random() - 0.3) * 4, y: -0.5 - Math.random() * 2 }, life: 60, color: i % 2 ? '#57534E' : '#A8A29E', size: 3 + Math.random() * 5, grav: 0.03 });
  startFight(state, f);
};
