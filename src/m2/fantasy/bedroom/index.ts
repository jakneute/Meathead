// THE GREAT PIXIE'S CHAMBERS, AND PIPER THE PIXIE: section 7 of Fairy Land, the boss. The user's design
// (fantasy-spec.md, verbatim there): the broomstick's crash in through the window puts him outside her bedroom (naked:
// he's got a boner here). He kicks the door down; she's MORBIDLY OBESE; naked, his boner slowly goes flaccid at the
// sight of her; he insults how fat and ugly she is, which enrages her, and it's on. The fight (the user's): she leaps
// and crashes down (an earthquake, the ceiling coming down), wrecking the room more each time, tearing the park's
// plumbing loose (a heat pipe, liquid nitrogen, live wires in water: fire, cold, lightning; she rips bits off them
// and throws them: "FIRE BALL!"); her weakness the flintlock (holes: a let-go balloon), the deflated balloon death,
// and a standard death of ours (the cork). See fight.ts.
//
//   layout.ts  the hall, her door, her bedroom (extra wide), the furniture to stand on, the camera, the checkpoints
//   room.ts    the hall and her bedroom painted, the wreck by stages, the plumbing behind the walls
//   fight.ts   the intro, her, the slams, the mains, the throws, the holes, both deaths; their drawing and the HUD bits
//   lines.ts   every line, clean / shitty / naked, intro to death; the new hurts and their death screens
//   IcePanel   (App.tsx) the mash prompt while he's frozen (ui.iceMash): the real buttons
//
// In the hall (in off the glass, or back at cp 60): the boss-door refill (a big health, a big ammo), her door. Up to it
// the first time this visit: the intro. After that (a retry), it's down: walk in and she's waiting (cp 61, the fight's
// start, is set as it starts). Beaten: VICTORY, the walk-away with the SPELLBOOK (walkAway/piper.ts), the hub, Fairy
// Land cleared. Revisits (cleared): the hall, the door down, her room wrecked and empty (the hole in her roof, or the
// heap she crumbled into); the way back.
//
// The way back: the left end (to the broomsticks' end). No way on (the end of the land).

import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import { pickLine } from '../../../m1/game/platform/speech';
import { isNude } from '../../../m1/game/player/gut';
import { topBand, CANVAS_WIDTH } from '../../../m1/constants';
import type { FantasySection } from '../section';
import { layOwn, endWalls, endExits, runExits, fantasyState, hands, ledge, solid, landVisit, meatheadSays, byPants } from '../section';
import { DOORS } from '../geometry';
import { goTo, markLandCleared, noteBossKill, isLandCleared, setUi } from '../../store';
import { type Victory, startVictory, tickVictory, drawVictory, victoryDone } from '../../victory';
import { type WalkAway, playWalkAway, tickWalkAway, drawWalkAway } from '../../walkAway';
import { markBossFight } from '../../bossQuiet';
import { drawTodSky } from '../../timeOfDay';
import { x0, GY, DOOR_X, KICK_AT, REFILL_X, ARENA_L, ARENA_R, CEIL_Y, CAM_Y, LEDGES, CP_HALL, CP_FIGHT, MAX_STAGE, R } from './layout';
import { drawHall, drawChamber, drawEndWall } from './room';
import {
  type Fight, startFight, updateFight, fightOver, endFight, killedByWeakness, introSeen, markIntroSeen, drawFightBack, drawFightFront, drawFightHud,
  killCamTick, killCamZoom, rangeZoom, roomBits, keepErect, drawRemains,
} from './fight';
import { MH_HALL } from './lines';

/** How she died (for a revisit's look): `cork:<x>` or `balloon:<x>` in state.stageMemo. */
export const PIPER_END_MEMO = 'fa-piper-end';

interface Bedroom {
  fight: 'wait' | 'on' | 'won'; wonAt: number;
  f: Fight | null; walls: Block[];
  victory: Victory | null; walk: WalkAway | null;
}
const bedroomOf = (state: GameState) => fantasyState<Bedroom>(state, 'bedroom', () => ({ fight: 'wait', wonAt: 0, f: null, walls: [], victory: null, walk: null }));

/** His line in the hall: once a visit. */
let hallVisit = -1;

const leave = (state: GameState, weakness: boolean) => {
  const s = bedroomOf(state);
  markLandCleared('fantasy'); noteBossKill();
  s.walk = playWalkAway(state, { boss: 'piper', weakness, onDone: () => goTo('hub') });
};
const endOf = (state: GameState): { how: 'cork' | 'balloon'; x: number } | null => {
  const m = state.stageMemo[PIPER_END_MEMO];
  if (!m) return null;
  const [how, x] = m.split(':');
  return { how: how === 'balloon' ? 'balloon' : 'cork', x: +x || R(750) };
};

const pmidX = (state: GameState) => state.player.pos.x + state.player.width / 2;

/** For the music (music/cues.ts): her fight as the score hears it (the intro's step, what she's at, how much of her
 *  666 is left); null outside it. */
export const piperMusic = (state: GameState) => {
  const s = bedroomOf(state), f = s.f;
  return s.fight === 'on' && f ? { mode: f.mode, intro: f.intro, act: f.act, hp: f.hp / 666 } : null;
};

export const bedroom: FantasySection = {
  id: 'bedroom', x0, x1: ARENA_R + 400,
  checkpoints: [
    { name: "OUTSIDE PIPER'S DOOR", cp: CP_HALL, x: DOORS.bedroom.start.x, y: GY },
    // (set as the fight starts; OUTSIDE her door, in the hall by the refill (the user's standing rule: dead in a boss
    // fight, he's back outside its door, it lying kicked in, and walks back in himself))
    { name: 'PIPER THE PIXIE', cp: CP_FIGHT, x: DOOR_X - 200, y: GY, clear: [400, 3000], manual: true },
  ],
  build: (state) => {
    const cleared = isLandCleared('fantasy');
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: ARENA_R + 600, y2: GY, surface: 'wood' }]);
    endWalls(state, 'bedroom', { right: false });
    // (her room's far wall: the end of the land; the wall over her door; her door, till it's kicked in; her ceiling)
    solid(state, ARENA_R, GY - 6000, 400, 6000, { hidden: true, tag: 'pp-end' });
    solid(state, DOOR_X - 40, GY - 6000, 80, 6000 - 232, { hidden: true, tag: 'pp-over-door' });
    if (!cleared && !introSeen()) solid(state, DOOR_X - 46, GY - 232, 92, 232, { hidden: true, tag: 'pp-door' });
    solid(state, ARENA_L - 40, CEIL_Y - 40, ARENA_R - ARENA_L + 80, 40, { hidden: true, tag: 'pp-ceiling' });
    // (the furniture to stand on: the canopy's down for good on a revisit)
    for (const [lx, w, h, what] of LEDGES) if (!(cleared && what === 'canopy')) ledge(state, R(lx), GY - h, w, { hidden: true, tag: `pp-${what}` });
    // (the boss-door refill: a big health, a big ammo, before her door)
    if (!cleared) {
      state.pickups.push({ id: 'fa-door-hp', pos: { x: REFILL_X[0], y: GY - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 });
      state.pickups.push({ id: 'fa-door-ammo', pos: { x: REFILL_X[1], y: GY - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 });
    }
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, s = bedroomOf(state);
    const cleared = isLandCleared('fantasy');
    if (s.fight === 'wait') {
      runExits(state, endExits('bedroom'));
      if (cleared) return controls;
      // (a fresh start at her checkpoint (the checkpoint-skip cheat: set after the build): the world as a run there left
      // it, her door kicked in and the intro seen; he walks in and she's waiting)
      if (state.checkpoint >= CP_FIGHT && !introSeen()) { markIntroSeen(); state.blocks = state.blocks.filter(b => b.tag !== 'pp-door'); }
      // (naked: up since the glass, till he sees her)
      keepErect(state, introSeen() ? 0 : 1);
      if (!introSeen() && !p.inCutscene && isNude(state) && state.frame % 40 === 0) state.particles.push({ pos: { x: pmidX(state) + (Math.random() - 0.5) * 16, y: p.pos.y - 6 }, vel: { x: (Math.random() - 0.5) * 0.6, y: -1.2 }, life: 40, color: Math.random() < 0.5 ? '#F472B6' : '#FB7185', size: 4 });
      // (his line in the hall, once a visit, once the glass is done with)
      if (!p.inCutscene && hallVisit !== landVisit() && !introSeen()) { hallVisit = landVisit(); meatheadSays(state, pickLine(byPants(state, MH_HALL))); }
      const me = pmidX(state);
      // (the first time: up to her door and it's the intro; after (or already through it): straight in)
      // (right up at it, walked there himself: the user's "the player has to physically walk up to the door")
      if (!introSeen() && me < DOOR_X && me >= KICK_AT - 8 && p.isGrounded && !p.inCutscene) { s.f = startFight(state, false); s.fight = 'on'; }
      else if (me > ARENA_L + 40 && p.health > 0) { s.f = startFight(state, true); s.fight = 'on'; }
      return controls;
    }
    if (s.fight === 'on' && s.f) {
      const f = s.f;
      markBossFight(state, 'piper');
      // (the door, in: no longer in the way)
      if (f.doorT !== null) { f.doorT++; state.blocks = state.blocks.filter(b => b.tag !== 'pp-door'); }
      const out = updateFight(ctx, f, controls);
      keepErect(state, f.erect);
      // (on: the roses across the doorway behind him, the room shut)
      if (f.mode !== 'intro' && !s.walls.length) {
        s.walls = [{ x: ARENA_L - 40, y: GY - 6000, w: 40, h: 6000, type: 'wall', hidden: true, tag: 'pp-roses' } as Block];
        state.blocks.push(...s.walls);
      }
      if (s.walls.length) {
        const lo = ARENA_L, hi = ARENA_R - p.width;
        if (p.pos.x < lo) { p.pos.x = lo; if (p.vel.x < 0) p.vel.x = 0; }
        if (p.pos.x > hi) { p.pos.x = hi; if (p.vel.x > 0) p.vel.x = 0; }
        if (p.pos.y < CEIL_Y) { p.pos.y = CEIL_Y; if (p.vel.y < 0) p.vel.y = 0; }
      }
      if (fightOver(f)) {
        s.fight = 'won'; s.wonAt = state.frame;
        const weak = killedByWeakness(f);
        state.stageMemo[PIPER_END_MEMO] = `${weak ? 'balloon' : 'cork'}:${Math.round(weak ? f.x : f.death?.x ?? f.x)}`;
        endFight(state, f);
        state.blocks = state.blocks.filter(b => !s.walls.includes(b)); s.walls = [];
        s.victory = startVictory();
      }
      return out;
    }
    if (s.fight === 'won') {
      p.inCutscene = true;
      setUi({ iceMash: null });
      if (s.victory) { tickVictory(state, s.victory); if (victoryDone(s.victory) && state.frame - s.wonAt > 60) { s.victory = null; leave(state, !!s.f && killedByWeakness(s.f)); } }
      if (s.walk) tickWalkAway(s.walk, controls);
      return hands();
    }
    return controls;
  },
  cameraX: (state) => {
    const s = bedroomOf(state);
    if (s.walls.length) return { min: ARENA_L, max: ARENA_R - CANVAS_WIDTH };
    // (in the hall with her door shut: nothing past it shows (her room's hidden till he's in it))
    if (s.fight === 'wait' && !introSeen() && !isLandCleared('fantasy')) return { min: x0, max: DOOR_X + 60 - CANVAS_WIDTH };
    return { min: x0, max: ARENA_R - CANVAS_WIDTH };
  },
  // (his feet wherever he is, the camera's top held at CAM_Y: the floor low, the ceiling up under the HUD's band)
  cameraRow: (state) => state.player.pos.y + state.player.height - CAM_Y,
  // (the sky by the hour: only seen round the spire's cone when the camera pulls out over the dollhouse cut)
  drawBackdrop: (c) => { drawTodSky(c, 0, 0, CANVAS_WIDTH, 600, ['#23307A', '#3A55B4', '#6E8EDC', '#A8C4F0', '#E8D4F0', '#F8C8D8'], { horizon: 600, moon: [620, 80], sun: [160, 90] }); return true; },
  drawBack: (c, state) => {
    const s = bedroomOf(state), f = s.f, cleared = isLandCleared('fantasy') && !f;
    const end = cleared ? endOf(state) : null;
    const bits = roomBits(f);
    const look = cleared
      ? { stage: MAX_STAGE, doorT: 999, barrier: false, chandelierDown: 0, roofHole: end?.how === 'cork' ? end.x : null, piperX: null }
      : { ...bits, doorT: f ? f.doorT : introSeen() ? 999 : null, barrier: s.walls.length > 0 };
    drawChamber(c, state, look);
    drawEndWall(c, state);
    drawHall(c, state, look);
    if (end) drawRemains(c, end.how, end.x, state.frame);
    if (f) drawFightBack(c, state, f);
  },
  drawFront: (c, state) => {
    const f = bedroomOf(state).f;
    if (f) drawFightFront(c, state, f);
  },
  drawHud: (c, state) => {
    const s = bedroomOf(state);
    if (s.f && s.fight === 'on') drawFightHud(c, state, s.f, topBand());
    if (s.victory) drawVictory(c, s.victory);
    if (s.walk) drawWalkAway(c, s.walk);
  },
  zoom: (state) => { const f = bedroomOf(state).f; return f ? killCamZoom(state, f) ?? rangeZoom(state, f) : null; },
  holdTick: (ctx) => { const f = bedroomOf(ctx.state).f; return f ? killCamTick(f) : false; },
};
