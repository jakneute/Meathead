// DISASTER: THE RIDE: section 5 of Hollywood Land (owner: the disaster agent). A lame-ass ride: he stands in a room in
// front of a video screen while disasters play and the room shakes, cools, warms up to match. In through the backlot's
// doors: the queue (WAIT FROM HERE: 90 MINUTES; he shoves through the guests, over the rails), the pre-show (CHIP
// CHADWICK on the big TV, very excited, a tape), the theater: the big screen's cheesy stock footage, the narrator's
// deadpan loop ("HERE'S AN EARTHQUAKE." the room shakes, lightly; "HERE'S A VOLCANO." a space heater and a red gel;
// "HERE'S A TORNADO." a desk fan; "HERE'S A BLIZZARD." the AC up a bit; a squirt for the flood, the fog machine for the
// wildfire: show.ts), the guests underwhelmed or overreacting. The ride's staff (kinds.ts: ushers with stanchions,
// effects techs with fog cans, Twisty the tornado mascot) after the line cutter all the way. Up over the theater (road
// cases, the truss, the catwalks, the FLYING COW's stunt wire over the screen) to the control booth: another sleeping
// cast member (eye mask, earplugs), another lever: REAL DISASTERS (EXPERIMENTAL). Flipped (real.ts): the effects go
// real, the far wall goes, and out the hole it's the havoc (section.ts setRealDisasters: the lot's weather too).
//
// ~6000 px of play, ~1.3 min (the lobby ~25 s, the pre-show ~10 s, the theater's fight and climb ~45 s), plus REAL
// DISASTERS (~25 s, skippable). Checkpoints 40-43. Indoors.
//
// Revisits differ: the lever stays on REAL; the room's wrecked (the screen torn and burnt, the fan and the cow gone,
// frost and scorch, the heater still burning on the floor: jump it), the booth under the truss (BACK IN 5, his legs),
// the far wall out flat on the lot (the way on, and back in from the havoc: DOORS.disaster.end); the narrator still
// looping over it; one guest left, singed, clapping. The lobby cracked, the monitors static.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { EnemyKind } from '../../../m1/types';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { pickLine, isTalking } from '../../../m1/game/platform/speech';
import { playSound } from '../../../m1/game/platform/audio';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { lookOf } from '../../adventure/temple/people';
import { setUi } from '../../store';
import { setHazardZones, hazardVictims, hazardHit, boxHits } from '../../hazardHit';
import type { HollywoodSection } from '../section';
import { layOwn, ledge, solid, endWalls, endExits, runExits, meatheadSays, speak, saidOver, realDisastersOn, setRealDisasters } from '../section';
import { byPants } from '../blvd/kinds';
import { PA_VOICE } from '../blvd/lines';
import {
  x0, x1, X, Y, R, GY, GROUND, SOLIDS, LEDGES, WIRES, ENEMIES, THEATER_ENEMIES, PICKUPS, CHECKPOINTS, GUESTS, RAIL_H,
  LOBBY, PRESHOW, THEATER, FAR_WALL, SCREEN, FX, CAT_L, CAT_R, BOOTH, HORNS,
} from './layout';
import { dzOf, type Dz } from './state';
import './kinds';
import { updateShow, showNow, narrate, fresh } from './show';
import { startReal, updateReal, realOn, wreckAll, drawRealHud, WIDE } from './real';
import { drawDisasterBackdrop, drawDisasterBack, drawDisasterFront, disasterLights } from './art';
import * as L from './lines';

const pick = pickLine;

/** The park's PA (the horn): in turn, never a fixed line twice in 45 s. */
const paSay = (state: GameState, line: string, onDone?: () => void) => {
  if (!fresh(line)) { onDone?.(); return; }
  const o = dzOf(state);
  o.paAt = state.frame; o.paBusy = true;
  let done = false;
  speak(PA_VOICE, line, s => { o.pa = s; }, true, () => { if (done) return; done = true; o.paBusy = false; onDone?.(); });
};
/** Once a stage run (kept across his deaths). */
const once = (state: GameState, k: string) => { const key = `hwd-said-${k}`; if (state.stageMemo[key]) return false; state.stageMemo[key] = '1'; return true; };

/** The queue's guests: shoved aside as he goes through (outraged). */
const queueBits = (state: GameState, o: Dz) => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  o.guests.forEach(g => {
    if (g.shove > 0) g.shove--;
    if (g.mad > 0) g.mad--;
    const gx = X(g.rx);
    if (g.shove > 0 || Math.abs(cx - gx) > 20 || feet < GY - RAIL_H - 40 || (Math.abs(p.vel.x) < 0.5 && p.isGrounded)) return;
    g.shove = 30; g.dir = Math.sign(p.vel.x) || 1; g.mad = 240;
    playSound('thud', 0.4, 4);
    if (once(state, 'cut')) meatheadSays(state, pick(L.CUT_LINE), true);
    else if (Math.random() < 0.12) meatheadSays(state, pick(L.SHOVE), false);
    if (!o.guestSaid && !o.pa && state.frame - o.guestAt > 100) {
      o.guestAt = state.frame;
      speak(lookOf(g.seed).woman ? L.GUEST_VOICES.f : L.GUEST_VOICES.m, pick(byPants(state, L.QUEUE_OUTRAGE)), s => { o.guestSaid = s ? { x: gx, y: GY - 84, s } : null; }, false);
    }
  });
};

/** The pre-show's tape: Chip, line after line, round again (each line not again inside 45 s). */
const hostTape = (state: GameState, o: Dz) => {
  if (o.said.hostBusy || state.frame - o.hostAt < 140) return;
  const line = L.HOST_TAPE[o.hostI % L.HOST_TAPE.length];
  o.hostI++;
  if (!fresh(line)) { o.hostAt = state.frame; return; }
  o.said.hostBusy = true;
  speak(L.HOST, line, s => { o.host = s; }, true, () => { o.said.hostBusy = false; o.hostAt = state.frame; });
};

/** The heater, burning on the floor since: it hurts whoever's in it (him, and anybody knocked in). */
const burn = (ctx: FrameContext, o: Dz) => {
  const { state } = ctx, p = state.player;
  const z = { x0: X(FX.heater) - 50, x1: X(FX.heater) + 50, y0: GY - 46, y1: GY };
  if (Math.abs(p.pos.x - X(FX.heater)) > 1600) { setHazardZones(state, 'hwd-fire', []); return; }
  setHazardZones(state, 'hwd-fire', [z]);
  if (state.frame % 6 === 0) state.particles.push({ pos: { x: z.x0 + Math.random() * 100, y: GY - 30 }, vel: { x: (Math.random() - 0.5), y: -2 - Math.random() * 2 }, life: 30, color: Math.random() < 0.5 ? '#F97316' : '#FDE047', size: 3 });
  if (p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && p.pos.x < z.x1 && p.pos.x + p.width > z.x0 && p.pos.y + p.height > z.y0) {
    hurtPlayer(ctx, 8, 'm2:hwd_fire', { x: (p.pos.x + p.width / 2 < X(FX.heater) ? -1 : 1) * 7, y: -8 }, 20);
    playSound('ignite', 0.5, 4);
  }
  for (const e of hazardVictims(state)) if (boxHits(e, z.x0, z.y0, z.x1 - z.x0, z.y1 - z.y0) && state.frame - (o.burnt.get(e) ?? -99) > 30) { o.burnt.set(e, state.frame); hazardHit(ctx, e, 35, X(FX.heater), 'TOASTED!', { color: '#FDBA74' }); }
};

/** It's real (after the cutscene, or back here later): everything as it's left. */
const settle = (state: GameState, o: Dz) => {
  wreckAll(o); o.real.phase = 'done'; o.lever = 1;
  if (o.wall) { const i = state.blocks.indexOf(o.wall); if (i >= 0) state.blocks.splice(i, 1); o.wall = null; }
  // (the theater's staff, if he's starting further on (the cheat): already dead in it)
  state.enemies = state.enemies.filter(e => { if (!e.kind?.startsWith('m2:hwd_')) return true; const rx = R(e.pos.x + e.width / 2); return rx < THEATER.a || rx > THEATER.b; });
};

export const disaster: HollywoodSection = {
  id: 'disaster', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    const o = dzOf(state);
    layOwn(state, GROUND.map(([a, b]) => ({ x1: X(a), y1: GY, x2: X(b), y2: GY, surface: 'hard' as const })));
    for (const [rx, h, w] of SOLIDS) solid(state, X(rx), Y(h), w, h, { hidden: true, tag: 'disaster' });
    for (const [rx, h, w] of LEDGES) ledge(state, X(rx), Y(h), w, { hidden: true, tag: 'disaster' });
    endWalls(state, 'disaster');
    // (a fresh start further on (the checkpoint-skip cheat), or in from the havoc: it's real)
    if (state.checkpoint >= 43) setRealDisasters(state);
    const real = realDisastersOn(state);
    // (the far wall: up till it's real)
    if (!real) o.wall = solid(state, X(FAR_WALL), GY - 1400, 40, 1400, { hidden: true, tag: 'disaster-far' });
    o.guests = GUESTS.map(([rx, seed]) => ({ rx, seed, shove: 0, dir: 1, mad: 0 }));
    [...ENEMIES, ...(real ? [] : THEATER_ENEMIES)].forEach(([kind, rx, h], i) => {
      const e = makeKindEnemy(kind as EnemyKind, X(rx), Y(h));
      e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y;
      e.variant = (i * 11 + rx) % 19;
      state.enemies.push(e);
    });
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `disaster-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
    if (real) settle(state, o);
  },
  update: (ctx, controls) => {
    const { state } = ctx, o = dzOf(state), p = state.player;
    if (!controls.up) o.upLatch = false;
    const upIn = !!controls.up && !o.upLatch;
    if (upIn) o.upLatch = true;
    // (started further on by the cheat (set after the build): it's real)
    if (state.checkpoint >= 43 && o.real.phase === 'off') { setRealDisasters(state); settle(state, o); }
    const real = realDisastersOn(state);
    const cut = updateReal(ctx);
    o.lever += ((real ? 1 : 0) - o.lever) * 0.25;
    const rx = R(p.pos.x + p.width / 2), feet = p.pos.y + p.height;
    const inTheater = rx > THEATER.a && rx < THEATER.b;
    updateShow(ctx, inTheater && !realOn(state), real);
    if (cut) return cut;
    if (real && o.real.phase === 'done') burn(ctx, o); else setHazardZones(state, 'hwd-fire', []);
    // (the theater's doors, swinging as he goes through)
    o.doorT += ((Math.abs(rx - PRESHOW.b) < 90 ? 1 : 0) - o.doorT) * 0.2;
    if (p.health <= 0 || p.inCutscene) return controls;
    const busy = () => !!o.pa || o.paBusy || isTalking();
    // The lobby: the PA, him, Steve; the queue
    if (rx < LOBBY.b) {
      if (state.frame > 50 && !o.said.pa) { o.said.pa = true; paSay(state, real ? L.PA_REAL[0] : pick(byPants(state, L.PA_RIDE)), () => { if (!real && once(state, 'arrive')) meatheadSays(state, pick(L.ARRIVE), true); }); }
      if (rx > 650 && !o.said.paLeak && !busy()) { o.said.paLeak = true; paSay(state, pickLine(L.PA_LEAK_RIDE)); }
      if (rx > 1300 && !o.said.paSteve && !busy()) { o.said.paSteve = true; paSay(state, L.PA_STEVE[0]); }
      queueBits(state, o);
    }
    // The pre-show: Chip's tape (static once it's real); him on Chip
    if (rx > PRESHOW.a && rx < PRESHOW.b && !real) {
      hostTape(state, o);
      if (o.hostI >= 2 && !o.said.preshow && !o.host && !isTalking()) { o.said.preshow = true; if (once(state, 'preshow')) meatheadSays(state, pick(L.PRESHOW), true); }
    }
    // The theater: the narrator's welcome, him; the cow's wire; the booth
    if (inTheater) {
      if (!real && !o.said.theater) { o.said.theater = true; if (once(state, 'theater')) narrate(state, L.NARR_WELCOME[0], undefined, () => meatheadSays(state, pick(L.THEATER), true)); }
      if (real && o.said.out && !o.said.wreck && rx < THEATER.b - 200 && once(state, 'wreck')) { o.said.wreck = true; meatheadSays(state, pick(L.WRECK_AGAIN), true); }
      if (real && Math.abs(rx - 3010) < 120 && !o.said.singed && !busy()) { o.said.singed = true; speak(L.GUEST_VOICES.m, pick(L.SINGED), s => { o.guestSaid = s ? { x: X(3010), y: GY - 90, s } : null; }, false); }
      if (!real && rx > CAT_L.b - 200 && rx < CAT_L.b && feet <= Y(CAT_L.h) + 6 && once(state, 'cow')) meatheadSays(state, pick(L.COW), true);
      // (the sleeper mumbles, him about; he never wakes, not for this)
      if (!real && Math.abs(rx - BOOTH.cab) < 600 && feet < Y(CAT_R.h - 200) && !o.sleeper && state.frame - o.sleepAt > 420 && !isTalking()) {
        o.sleepAt = state.frame;
        speak(L.SLEEPER, pick(byPants(state, L.SLEEPER_MUMBLE)), s => { o.sleeper = s; }, false);
      }
      const onBalcony = rx > CAT_R.a && rx < CAT_R.b && Math.abs(feet - Y(CAT_R.h)) < 8 && p.isGrounded;
      if (!real && onBalcony && once(state, 'booth')) meatheadSays(state, pick(L.BOOTH), true);
      if (!real && onBalcony && Math.abs(rx - BOOTH.lever) < 44) {
        setUi({ upPrompt: 'PULL THE LEVER' });
        if (upIn) { startReal(ctx); return updateReal(ctx) ?? controls; }
      }
    }
    // Out through the hole
    if (real && rx > FAR_WALL + 60 && !o.said.out) { o.said.out = true; if (once(state, 'out')) meatheadSays(state, pick(L.OUT), true); }
    runExits(state, endExits('disaster'));
    return controls;
  },
  drawBackdrop: (c) => drawDisasterBackdrop(c),
  drawBack: (c, state) => {
    const o = dzOf(state), { beat, k } = showNow(o);
    drawDisasterBack(c, state, o, beat, k, realDisastersOn(state));
  },
  drawFront: (c, state) => {
    const o = dzOf(state), cam = state.camera.x, real = realDisastersOn(state);
    drawDisasterFront(c, state, o, real);
    if (realOn(state)) return;
    // Who's saying what: the staff over their heads, a guest, the sleeper, the narrator, Chip, the PA
    for (const e of state.enemies) { const s = o.barks.get(e); if (s && e.health > 0 && e.pos.x > x0 - 200 && e.pos.x < x1 + 200) saidOver(c, s.text, e.pos.x + e.width / 2, e.pos.y - 18, '#FECACA', 220); }
    if (o.guestSaid) saidOver(c, o.guestSaid.s.text, o.guestSaid.x, o.guestSaid.y, '#FBCFE8', 220);
    if (o.sleeper) saidOver(c, o.sleeper.text, X(BOOTH.cab + 150), Y(CAT_R.h) - 170, '#BAE6FD', 220);
    if (o.narr) saidOver(c, o.narr.text, X((SCREEN.a + SCREEN.b) / 2), Y(SCREEN.hi) - 24, '#FDE68A', 340);
    if (o.host) saidOver(c, o.host.text, X(PRESHOW.tv), Y(PRESHOW.ceil) + 40, '#FDBA74', 300);
    if (o.pa) {
      const cx = cam + CANVAS_WIDTH / 2;
      let best = HORNS[0], bd = Infinity;
      for (const h of HORNS) { const d = Math.abs(X(h) - cx); if (d < bd) { bd = d; best = h; } }
      saidOver(c, o.pa.text, bd < CANVAS_WIDTH ? X(best) : cx, Y(LOBBY.ceil) + 64, '#FDE047', 300);
    }
  },
  drawHud: (c, state) => drawRealHud(c, state),
  zoom: (state) => (realOn(state) && dzOf(state).real.all >= 10 ? { scale: WIDE.scale, x: WIDE.x, y: WIDE.y } : null),
  cameraX: (state) => {
    if (realOn(state)) return undefined;
    return { min: x0, max: realDisastersOn(state) ? x1 - CANVAS_WIDTH : X(FAR_WALL + 40) - CANVAS_WIDTH };
  },
  lighting: (state) => {
    const o = dzOf(state), { beat, k } = showNow(o), real = realDisastersOn(state);
    const rx = R(state.camera.x + CANVAS_WIDTH / 2);
    return { dark: rx < THEATER.a - 200 ? 0.22 : real ? 0.42 : 0.55, shade: [14, 8, 20], lights: disasterLights(o, beat, k, real) };
  },
  wires: () => WIRES,
};
