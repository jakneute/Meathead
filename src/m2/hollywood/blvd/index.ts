// THE BLVD: section 1 of Hollywood Land (owner: the outdoors agent). Hollywood Blvd, or a cheap imitation of it: the
// Walk of Fame's stars in the pavement (for nobodies and things: THE GUY WHO SAID 'CUT' ONCE, a stunt dog's
// understudy, a blank YOUR NAME HERE $49.99), plywood facades with their bracing showing round the back, AS SEEN IN
// plaques on a bench, a trash can and a hydrant behind velvet ropes. Costumed impersonators (kinds.ts: a Marilyn, an
// Elvis, caped heroes, a drunk pirate captain, gold living statues; legally distinct, seeded people under the
// costumes) come at him for photos and money (PHOTOS $20, tip jars), and pick his pockets for ammo if he lets them;
// he answers with violence. Fairly standard platforming till it gets more interesting: the land's new mechanic, the
// STUNT WIRES (hollywood/wires.ts), taught safe, then over the sinkhole, then under fire (reel up or down out of the
// shields), then the swoop up onto the hotel's deck and down off it, then over the tram's street (reel up over the
// tram, charge the hustlers out of the way); the studio tour tram that stops for nobody. Stuntman Steve's fliers on every pole, his standees, the PA's
// plugs. At its end, THRONES OF THE STARS' queue plaza: on to the coaster.
//
// Laid out in layout.ts; drawn in art.ts (on paint.ts, shared with the lot); the tram's in tram.ts; what's thrown in
// shots.ts. Target: ~11500 px of play, ~2.3 min. Checkpoints 0-9. Outdoors: the time of day's light (timeOfDay.ts).

import type { GameState } from '../../../m1/game/core/state';
import type { EnemyKind } from '../../../m1/types';
import { pickLine } from '../../../m1/game/platform/speech';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { CANVAS_WIDTH } from '../../../m1/constants';
import type { HollywoodSection, Said } from '../section';
import { layOwn, ledge, solid, endWalls, endExits, runExits, meatheadSays, speak, saidOver } from '../section';
import { SECTIONS, GY } from '../geometry';
import { X, Y, GROUND, SOLIDS, LEDGES, WIRES, ENEMIES, PICKUPS, CHECKPOINTS, SINK, TRENCH, TRAM, LAMPS, MARQUEE_X, DECK } from './layout';
import { byPants } from './kinds';
import { outOf } from './state';
import { updateShots, drawShots } from './shots';
import { makeTram, updateTram, drawTram, drawGarageBacks, type Tram } from './tram';
import { drawBlvdBackdrop, drawBlvdBack, blvdLamps } from './art';
import { flash, BACK_Y } from './paint';
import { ARRIVE, GAG_LINES, FALL_SCREAM, GOT_IT_BACK, PA_VOICE, PA_WELCOME, PA_STEVE, PA_SECURITY, PA_COASTER, TRAM_VOICE, TRAM_CALL } from './lines';

const { x0, x1 } = SECTIONS.blvd;
const pick = pickLine;

interface Bv { tram: Tram; cast: number; driver: Said | null; falling: boolean }
const BV = new WeakMap<object, Bv>();
const mine = (state: GameState) => BV.get(state.stage as object);

/** The PA says something (in the queue: nothing over anything), its words by the nearest horn while they're said. */
export const paSay = (state: GameState, line: string, onDone?: () => void) => {
  const o = outOf(state);
  o.paAt = state.frame; o.paBusy = true;
  let done = false;
  speak(PA_VOICE, line, s => { o.pa = s; }, true, () => { if (done) return; done = true; o.paBusy = false; onDone?.(); });
};

/** The outdoors' everyday business (the boulevard's and the lot's): the thieves killed drop what they took back. */
export const runThieves = (state: GameState) => {
  const o = outOf(state);
  o.thieves = o.thieves.filter(e => {
    if (e.health > 0 && !e.isBlownAway) return true;
    const l = o.loot.get(e);
    if (l) {
      const type = l.n >= 12 ? 'large_ammo' : 'small_ammo';
      state.pickups.push({ id: `loot-${state.frame}-${Math.round(e.pos.x)}`, pos: { x: e.pos.x + e.width / 2 - 10, y: e.pos.y + e.height - 30 }, vel: { x: 0, y: -4 }, width: 20, height: 20, type, life: 900 });
      o.loot.delete(e);
      if (Math.random() < 0.4) meatheadSays(state, pick(GOT_IT_BACK), false);
    }
    return false;
  });
  o.flashes = o.flashes.filter(fl => state.frame - fl.at < 12);
};

export const blvd: HollywoodSection = {
  id: 'blvd', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    layOwn(state, GROUND.map(([a, b]) => ({ x1: X(a), y1: GY, x2: X(b), y2: GY, surface: 'hard' as const })));
    for (const [rx, h, w] of SOLIDS) solid(state, X(rx), Y(h), w, h, { hidden: true, tag: 'blvd' });
    for (const [rx, h, w] of LEDGES) ledge(state, X(rx), Y(h), w, { hidden: true, tag: 'blvd' });
    endWalls(state, 'blvd');
    const tram = makeTram(state, { a: X(TRAM.a), b: X(TRAM.b), len: TRAM.len, h: TRAM.h, v: TRAM.v, period: TRAM.period }, 'blvd-tram');
    BV.set(state.stage as object, { tram, cast: ENEMIES.length, driver: null, falling: false });
    outOf(state);
    ENEMIES.forEach(([kind, rx, h], i) => {
      const e = makeKindEnemy(kind as EnemyKind, X(rx), Y(h));
      e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y;
      e.variant = (i * 7 + rx) % 13;
      state.enemies.push(e);
    });
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `blvd-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, o = outOf(state), bv = mine(state);
    if (!bv) return controls;
    const rx = p.pos.x + p.width / 2 - x0;
    updateShots(ctx);
    runThieves(state);
    const ev = updateTram(ctx, bv.tram, 'blvd-tram');
    // (the driver over the tram's speaker, as it comes out; not over the PA)
    if (ev.horn && !bv.driver && !o.pa && !o.paBusy) speak(TRAM_VOICE, pick(TRAM_CALL), s => { bv.driver = s; }, false);
    const once = (k: string, go: () => void) => { if (!o.said[k]) { o.said[k] = true; go(); } };
    // (his say, not over the PA's: it waits till that's done)
    const says = (k: string, lines: string[]) => { if (!o.pa && !o.paBusy && !bv.driver) once(k, () => meatheadSays(state, pick(lines), true)); };
    if (!p.inCutscene && p.health > 0) {
      if (state.checkpoint === 0 && rx < 700 && state.frame > 70) once('pa-welcome', () => paSay(state, pick(byPants(state, PA_WELCOME)), () => says('arrive', ARRIVE)));
      if (rx > 420 && rx < 900) says('stars', GAG_LINES.stars);
      if (rx > 960 && rx < 1300) says('plaque', GAG_LINES.plaque);
      if (rx > 2780 && rx < 3200) says('palace', GAG_LINES.palace);
      if (rx > 3300 && rx < 3500) says('steve', GAG_LINES.steve);
      if (rx > 3560) once('pa-steve-1', () => paSay(state, PA_STEVE[0]));
      if (rx > SINK.a - 260 && rx < SINK.a) says('sinkhole', GAG_LINES.sinkhole);
      if (rx > 7620) once('pa-steve-2', () => paSay(state, PA_STEVE[1]));
      if (rx > 7700 && rx < DECK.b && p.pos.y + p.height < GY - 100) says('scaffold', GAG_LINES.scaffold);
      if (ev.came && rx > TRAM.a - 400 && rx < TRAM.b + 200) says('tram', GAG_LINES.tram);
      if (rx > 10450) once('pa-steve-3', () => paSay(state, PA_STEVE[2]));
      if (rx > 10700) says('marquee', GAG_LINES.marquee);
      if (rx > 10900) once('pa-coaster', () => paSay(state, pick(byPants(state, PA_COASTER))));
      // (once he's done in a few of them: the PA's onto him)
      if (!o.said['pa-security']) {
        const left = state.enemies.filter(e => e.health > 0 && e.kind?.startsWith('m2:hw_') && e.pos.x >= x0 && e.pos.x < x1).length;
        if (bv.cast - left >= 5 && state.frame - o.paAt > 300) once('pa-security', () => paSay(state, pick(byPants(state, PA_SECURITY))));
      }
    }
    // (over the edge into the sinkhole or the trench: the scream, going away down; once a fall)
    const inHole = (rx > SINK.a && rx < SINK.b) || (rx > TRENCH.a && rx < TRENCH.b);
    if (p.isGrounded || p.carried) bv.falling = false;
    else if (!bv.falling && inHole && p.pos.y + p.height > GY + 30) { bv.falling = true; meatheadSays(state, pick(FALL_SCREAM), false); playSound('whoosh', 0.8, -8); }
    runExits(state, endExits('blvd'));
    return controls;
  },
  drawBackdrop: (c, state) => drawBlvdBackdrop(c, state),
  drawBack: (c, state) => {
    drawBlvdBack(c, state);
    const bv = mine(state);
    if (bv) drawGarageBacks(c, bv.tram);
  },
  drawFront: (c, state) => {
    const bv = mine(state), o = outOf(state);
    if (bv) drawTram(c, state, bv.tram);
    drawShots(c, state);
    for (const fl of o.flashes) flash(c, fl.x, fl.y, state.frame - fl.at);
    // (who's saying what: the hustlers over their heads)
    for (const e of state.enemies) { const s = o.barks.get(e); if (s && e.health > 0) saidOver(c, s.text, e.pos.x + e.width / 2, e.pos.y - 18, '#FBCFE8', 220); }
    if (!bv) return;
    const cx = state.camera.x + CANVAS_WIDTH / 2;
    if (bv.driver) saidOver(c, bv.driver.text, Math.max(X(TRAM.a), Math.min(X(TRAM.b), bv.tram.x + 60)), GY - TRAM.h - 24, '#FDE68A', 260);
    // (the PA's words: by the horn nearest the middle of the screen)
    const s = o.pa;
    if (s && state.player.pos.x < x1 + 400 && state.player.pos.x > x0 - 400) {
      let best = LAMPS[0][0], bd = Infinity;
      for (const [lx, horn] of LAMPS) { if (!horn) continue; const d = Math.abs(X(lx) - cx); if (d < bd) { bd = d; best = lx; } }
      if (bd < CANVAS_WIDTH) saidOver(c, s.text, X(best) + 24, BACK_Y - 200, '#FDE047', 300);
      else saidOver(c, s.text, cx, BACK_Y - 220, '#FDE047', 300);
    }
    void MARQUEE_X;
  },
  outdoors: () => 1,
  lamps: () => blvdLamps(),
  // (the stunt wires: taught here (layout.ts))
  wires: () => WIRES,
};
