// THE SQUARE: section 1 of Space Land (owner: the outdoors agent). Walking in through a tacky, retro-futurist
// 'Futureland' street square (the future as imagined in 1962, still loading): chrome, fins, googie roofs, atomic
// starbursts, rocket-shaped trash cans, monorail pylons. Meathead goes through it like he owns it. Futureland's cast
// out to stop him (kinds.ts: robot dogs, space cadets, security on scooters, a cardboard robot, jetpackers) and its
// street gear (gear.ts: the people mover, the electric sidewalk, the thrust pads, the express monorail over the pit),
// each taught alone, then mixed (layout.ts). Over it all, ahead the whole way and bigger the closer he gets: the giant
// atom. At the end, its doors: in, to the atom section's start (back out of it: by the doors).
//
// The PA (Futureland's 1962 announcer, over the horn speakers) has its say as he goes: about him, clean, shat or naked.
//
// Target: ~10000 px of play, ~2 min. Checkpoints 0-9. Outdoors: the time of day's light (timeOfDay.ts).

import type { GameState } from '../../../m1/game/core/state';
import type { EnemyKind } from '../../../m1/types';
import { pickLine } from '../../../m1/game/platform/speech';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import type { SpaceSection } from '../section';
import { layOwn, ledge, solid, endWalls, runExits, meatheadSays, speak, saidOver } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';
import { X, Y, GROUND, SOLIDS, LEDGES, BELTS, PLATES, PADS, MONO, TRACK, TRACK_LEGS, ENEMIES, PICKUPS, CHECKPOINTS, PIT, WALL, DOORS_X, SPEAKERS } from './layout';
import { makeGear, updateGear, drawGearBack, drawGearFront, drawTrack, type Gear } from './gear';
import { updateShots, drawShots, drawBarks, byPants } from './kinds';
import { outOf } from './state';
import { drawSquareBackdrop, drawSquareBack, drawSpeakers, squareLamps } from './art';
import { ARRIVE, ATOM_SEEN, GAG_LINES, PAD_LAUNCHED, MONO_RIDE, FALL_SCREAM, PA_VOICE, PA_WELCOME, PA_MOVER, PA_SECURITY, PA_MONO, PA_ATOM } from './lines';

const { x0, x1 } = SECTIONS.square;
const pick = pickLine;

interface Sq { gear: Gear; cast: number }
// (the square's own bits, by the stage they were built for: the outdoors' shared state has Space Land's 'square' key)
const SQ = new WeakMap<object, Sq>();
const mine = (state: GameState) => SQ.get(state.stage as object)!;

/** The PA says something (in the queue: nothing over anything), its words by the nearest horn while they're said. */
export const paSay = (state: GameState, line: string, onDone?: () => void) => {
  const o = outOf(state);
  o.paAt = state.frame;
  o.paBusy = true;
  let done = false;
  speak(PA_VOICE, line, s => { o.pa = s; }, true, () => { if (done) return; done = true; o.paBusy = false; onDone?.(); });
};

export const square: SpaceSection = {
  id: 'square', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    layOwn(state, GROUND.map(([a, b]) => ({ x1: X(a), y1: GY, x2: X(b), y2: GY, surface: 'hard' }) as never));
    for (const [rx, h, w] of SOLIDS) solid(state, X(rx), Y(h), w, h, { hidden: true, tag: 'square' });
    for (const [rx, h, w] of LEDGES) ledge(state, X(rx), Y(h), w, { hidden: true, tag: 'square' });
    // (the monorail's track: he walks it; the trains run on it)
    ledge(state, X(TRACK.a), Y(TRACK.h), TRACK.b - TRACK.a, { hidden: true, tag: 'square-track' });
    endWalls(state, 'square');
    const gear = makeGear(state, 'square', {
      belts: BELTS.map(([a, b, v]) => [X(a), X(b), GY, v]),
      plates: PLATES.map(([x, w, off]) => [X(x), w, GY, off]),
      pads: PADS.map(([x, w, h]) => [X(x), w, Y(h), 'step']),
      monos: [{ a: X(MONO.a), b: X(MONO.b), y: Y(TRACK.h), len: MONO.len, v: MONO.v, period: MONO.period, off: MONO.off }],
    });
    SQ.set(state.stage as object, { gear, cast: ENEMIES.length });
    outOf(state);
    ENEMIES.forEach(([kind, rx, h], i) => {
      const air = kind === 'm2:space_jetpack';
      const e = makeKindEnemy(kind as EnemyKind, X(rx), Y(h));
      e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y;
      e.variant = (i * 7 + rx) % 13;
      void air;
      state.enemies.push(e);
    });
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `square-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, o = outOf(state), sq = mine(state);
    const rx = p.pos.x + p.width / 2 - x0;
    const ev = updateGear(ctx, sq.gear);
    updateShots(ctx);
    const once = (k: string, go: () => void) => { if (!o.said[k]) { o.said[k] = true; go(); } };
    // (his say, not over the PA's: it waits till that's done)
    const says = (k: string, lines: string[]) => { if (!o.pa && !o.paBusy) once(k, () => meatheadSays(state, pick(lines), true)); };
    if (!p.inCutscene && p.health > 0) {
      if (state.checkpoint === 0 && rx < 700 && state.frame > 70) { once('pa-welcome', () => paSay(state, pick(byPants(state, PA_WELCOME)), () => says('arrive', ARRIVE))); }
      if (rx > 1300) says('atom', ATOM_SEEN);
      if (rx > 1720 && rx < 2400) { once('pa-mover', () => paSay(state, PA_MOVER[0])); says('mover', GAG_LINES.mover); }
      if (rx > 3700 && rx < 4300) says('zap', GAG_LINES.zap);
      if (rx > 4850 && rx < 5100) says('pad', GAG_LINES.pad);
      if (rx > WALL.x - 10 && rx < WALL.x + WALL.w + 10 && p.pos.y + p.height < Y(WALL.h) + 4) says('wall', GAG_LINES.wall);
      if (rx > 5880 && rx < 6300) { once('pa-mono', () => paSay(state, PA_MONO[0])); says('mono', GAG_LINES.mono); }
      if (rx > PIT.a - 200 && rx < PIT.a + 100 && p.pos.y + p.height > GY - 20) says('pit', GAG_LINES.pit);
      if (rx > 9300) { says('queue', GAG_LINES.queue); }
      if (rx > 9600) once('pa-atom', () => paSay(state, pick(byPants(state, PA_ATOM))));
      if (ev.padFired) says('launched', PAD_LAUNCHED);
      if (ev.onMono) says('monoride', MONO_RIDE);
      // (once he's done in a few of the cast: security's called)
      if (!o.said['pa-security']) {
        const left = state.enemies.filter(e => e.health > 0 && e.kind?.startsWith('m2:space_') && e.pos.x >= x0 && e.pos.x < x1).length;
        if (sq.cast - left >= 4 && state.frame - o.paAt > 300) once('pa-security', () => paSay(state, pick(byPants(state, PA_SECURITY))));
      }
    }
    // (over the edge into the pit: the scream, going away down; once a fall)
    if (p.isGrounded) o.said.falling = false;
    else if (!o.said.falling && rx > PIT.a && rx < PIT.b && p.pos.y + p.height > GY + 30) {
      o.said.falling = true; meatheadSays(state, pick(FALL_SCREAM), false); playSound('whoosh', 0.8, -8);
    }
    // In at the giant atom's doors (on to the atom's start)
    runExits(state, [{ x0: X(DOORS_X) - 30, x1: X(DOORS_X) + 30, yTop: GY - 40, yBot: GY + 2, to: DOORS.atom.start }]);
    return controls;
  },
  drawBackdrop: (c, state) => drawSquareBackdrop(c, state),
  drawBack: (c, state) => {
    const sq = mine(state);
    drawSquareBack(c, state, () => { if (sq) { drawTrack(c, state, sq.gear.monos[0], TRACK_LEGS.map(X), [[X(PIT.a), X(PIT.b)]]); drawGearBack(c, state, sq.gear); } });
    drawSpeakers(c, state, !!outOf(state).pa);
  },
  drawFront: (c, state) => {
    const sq = mine(state);
    if (sq) drawGearFront(c, state, sq.gear);
    drawShots(c, state);
    drawBarks(c, state, saidOver);
    // (the PA's words: by the horn nearest the middle of the screen)
    const s = outOf(state).pa;
    if (s && state.player.pos.x < x1 + 400) {
      const cx = state.camera.x + CANVAS_WIDTH / 2;
      let best = SPEAKERS[0], bd = Infinity;
      for (const sp of SPEAKERS) { const d = Math.abs(X(sp[0]) - cx); if (d < bd) { bd = d; best = sp; } }
      if (bd < CANVAS_WIDTH) saidOver(c, s.text, X(best[0]) + 24, Y(best[1]) - 22, '#FDE047', 300);
    }
    void CANVAS_HEIGHT;
  },
  outdoors: () => 1,
  lamps: () => squareLamps(),
};
