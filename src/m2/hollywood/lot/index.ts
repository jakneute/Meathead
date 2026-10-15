// THE LOT: section 4 of Hollywood Land (owner: the outdoors agent). Out of the warehouse (through the hole the bulldozer
// smashed in its far wall, past the dumpster full of dead Revengers) onto the studio backlot, where nothing's been
// filmed since 1987: another Hollywood-themed outdoor stretch. The script's pages blowing about, guests reading the
// spoilers; Revengers merch carts already selling the leak (REVENGERS: RESEMBLE). Facade streets one plank deep (New
// York Street under the fake rainstorm whose fake lightning is real, the western town and its water tower, the fake
// suburb with nothing behind it), the flash flood tank, exit through the gift shop. Its cast (kinds.ts): tour guides
// with megaphones, security in golf carts, extras in costume (centurions, cowboys). The stunt wires escalated: chains
// of them over the flood tank, moving rigs (shuttles) up the water tower and over the pits. Steve's standees every
// screen, the PA's plugs. At its end, the doors of DISASTER: THE RIDE.
//
// Laid out in layout.ts; drawn in art.ts (on the boulevard's paint.ts); the effects in effects.ts.
// Target: ~9000 px of play, ~1.8 min. Checkpoints 30-39. Outdoors: the time of day's light.
//
// Revisits differ: once the real disasters are on (disaster's lever: section.ts's realDisastersOn), the lot shows the
// weather (a red sky, ash coming down, puddles, the wind shoving him about).

import type { GameState } from '../../../m1/game/core/state';
import type { EnemyKind } from '../../../m1/types';
import { pickLine } from '../../../m1/game/platform/speech';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { CANVAS_WIDTH } from '../../../m1/constants';
import type { HollywoodSection, Said } from '../section';
import { layOwn, ledge, solid, endWalls, endExits, runExits, meatheadSays, speak, saidOver, realDisastersOn } from '../section';
import { SECTIONS, GY } from '../geometry';
import { X, Y, R, GROUND, SOLIDS, LEDGES, WIRES, ENEMIES, PICKUPS, CHECKPOINTS, TANK, FALL_TOWER, PIT1, PIT2, RAIN, TOWER, GIFT, RIDE_DOORS, SPEAKERS, READERS, DUMP } from './layout';
import './kinds';
import { byPants } from '../blvd/kinds';
import { outOf } from '../blvd/state';
import { updateShots, drawShots } from '../blvd/shots';
import { paSay, runThieves } from '../blvd';
import { flash, BACK_Y } from '../blvd/paint';
import { updateEffects, drawRainBack, drawRainFront, drawFloodBack, drawFloodFront } from './effects';
import { drawLotBackdrop, drawLotBack, lotLamps } from './art';
import { ARRIVE, DUMPSTER_AGAIN, GAG_LINES, FALL_SCREAM, LOT_VOICES, GOSSIP, GOSSIP_HIM, PA_LOT, PA_LEAK, PA_RAIN, PA_FLOOD, PA_STEVE_LOT, PA_DISASTER } from './lines';

const { x0, x1 } = SECTIONS.lot;
const pick = pickLine;

interface Lt { cast: number; gossip: Map<number, Said>; falling: boolean }
const LT = new WeakMap<object, Lt>();
const mine = (state: GameState) => LT.get(state.stage as object);

export const lot: HollywoodSection = {
  id: 'lot', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    layOwn(state, GROUND.map(([a, b]) => ({ x1: X(a), y1: GY, x2: X(b), y2: GY, surface: 'hard' as const })));
    for (const [rx, h, w] of SOLIDS) solid(state, X(rx), Y(h), w, h, { hidden: true, tag: 'lot' });
    for (const [rx, h, w] of LEDGES) ledge(state, X(rx), Y(h), w, { hidden: true, tag: 'lot' });
    // (the flood tank's floor: under the water)
    solid(state, X(TANK.a), GY + TANK.depth, TANK.b - TANK.a, 200, { hidden: true, tag: 'lot-tank' });
    // (the fall tower down in MAIN STREET COLLAPSE)
    solid(state, X(FALL_TOWER.a), GY + FALL_TOWER.drop, FALL_TOWER.w, 900, { hidden: true, tag: 'lot' });
    endWalls(state, 'lot');
    LT.set(state.stage as object, { cast: ENEMIES.length, gossip: new Map(), falling: false });
    outOf(state);
    ENEMIES.forEach(([kind, rx, h], i) => {
      const e = makeKindEnemy(kind as EnemyKind, X(rx), Y(h));
      e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y;
      e.variant = (i * 5 + rx) % 13;
      state.enemies.push(e);
    });
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `lot-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, o = outOf(state), lt = mine(state);
    if (!lt) return controls;
    const rx = R(p.pos.x + p.width / 2);
    updateShots(ctx);
    runThieves(state);
    const fx = updateEffects(ctx);
    const once = (k: string, go: () => void) => { if (!o.said[k]) { o.said[k] = true; go(); } };
    const busy = () => !!o.pa || o.paBusy || lt.gossip.size > 0;
    const says = (k: string, lines: string[]) => { if (!busy()) once(k, () => meatheadSays(state, pick(lines), true)); };
    if (!p.inCutscene && p.health > 0) {
      if (rx < 900 && state.frame > 60) {
        once('lot-pa', () => paSay(state, pick(byPants(state, PA_LOT)), () => says('lot-arrive', ARRIVE)));
        if (o.said['lot-far']) says('lot-dumpster-again', DUMPSTER_AGAIN);
      }
      if (rx > 2000) o.said['lot-far'] = true;
      if (rx > 780 && rx < 1250) says('lot-merch', GAG_LINES.merch);
      if (rx > 1150 && rx < 1500 && o.said['lot-pa']) once('lot-pa-leak', () => paSay(state, pick(PA_LEAK)));
      if (rx > 1380 && rx < 1600) says('lot-gate', GAG_LINES.gate);
      if (rx > RAIN.a - 100 && rx < RAIN.a + 200) { once('lot-pa-rain', () => paSay(state, PA_RAIN[0])); }
      if (rx > RAIN.a + 250 && rx < RAIN.b) { says('lot-ny', GAG_LINES.newyork); if (fx.pour) says('lot-rain', GAG_LINES.rain); }
      if (rx > TANK.a - 260 && rx < TANK.a) { once('lot-pa-flood', () => paSay(state, PA_FLOOD[0])); says('lot-flood', GAG_LINES.flood); }
      if (rx > 4750 && rx < 5100) says('lot-western', GAG_LINES.western);
      if (rx > TOWER.x - 300 && rx < TOWER.x) says('lot-tower', GAG_LINES.tower);
      if (rx > PIT1.a - 200 && rx < PIT1.a) says('lot-pit', GAG_LINES.pit);
      if (rx > 4500 && rx < 4800) once('lot-pa-steve-1', () => paSay(state, PA_STEVE_LOT[0]));
      if (rx > 6600 && rx < 6900) says('lot-suburb', GAG_LINES.suburb);
      if (rx > 6560 && rx < 6700) says('lot-steve', GAG_LINES.steve);
      if (rx > 7900 && rx < 8000) once('lot-pa-steve-2', () => paSay(state, PA_STEVE_LOT[1]));
      if (rx > GIFT.a + 40 && rx < GIFT.b) says('lot-gift', GAG_LINES.giftshop);
      if (rx > RIDE_DOORS - 250) { once('lot-pa-ride', () => paSay(state, pick(byPants(state, PA_DISASTER)))); says('lot-ride', GAG_LINES.disaster); }
      // (the guests reading the pages: one says something as he goes by (the spoilers, or about him))
      if (!busy()) READERS.forEach(([gx, seed], i) => {
        if (Math.abs(rx - gx) > 110 || o.said[`lot-gossip-${i}`] || Math.random() > 0.05) return;
        o.said[`lot-gossip-${i}`] = true;
        const voice = seed % 2 ? LOT_VOICES.gossipf : LOT_VOICES.gossip;
        speak(voice, pick(Math.random() < 0.6 ? GOSSIP : byPants(state, GOSSIP_HIM)), s => { if (s) lt.gossip.set(i, s); else lt.gossip.delete(i); }, false);
      });
    }
    // (the weather, once the real disasters are on: the wind shoving him about now and then)
    if (realDisastersOn(state) && p.isGrounded && !p.carried) { const g = Math.sin(state.frame * 0.013) * Math.sin(state.frame * 0.031); if (Math.abs(g) > 0.6) p.vel.x += g * 0.35; }
    // (over the edge into a pit: the scream, going away down; once a fall)
    const inPit = (rx > PIT1.a && rx < PIT1.b) || (rx > PIT2.a && rx < PIT2.b);
    if (p.isGrounded || p.carried) lt.falling = false;
    else if (!lt.falling && inPit && p.pos.y + p.height > GY + 30) { lt.falling = true; meatheadSays(state, pick(FALL_SCREAM), false); playSound('whoosh', 0.8, -8); }
    runExits(state, endExits('lot'));
    return controls;
  },
  drawBackdrop: (c, state) => drawLotBackdrop(c, state),
  drawBack: (c, state) => { drawLotBack(c, state); drawRainBack(c, state); drawFloodBack(c, state); },
  drawFront: (c, state) => {
    const o = outOf(state), lt = mine(state);
    drawFloodFront(c, state); drawRainFront(c, state);
    drawShots(c, state);
    for (const fl of o.flashes) flash(c, fl.x, fl.y, state.frame - fl.at);
    for (const e of state.enemies) { const s = o.barks.get(e); if (s && e.health > 0 && e.pos.x > x0 - 200 && e.pos.x < x1 + 200) saidOver(c, s.text, e.pos.x + e.width / 2, e.pos.y - 18, '#BFDBFE', 220); }
    if (lt) for (const [i, s] of lt.gossip) saidOver(c, s.text, X(READERS[i][0]), BACK_Y - 90, '#F5F5F4', 220);
    const s = o.pa;
    if (s && state.player.pos.x > x0 - 400 && state.player.pos.x < x1 + 400) {
      const cx = state.camera.x + CANVAS_WIDTH / 2;
      let best = SPEAKERS[0], bd = Infinity;
      for (const sx of SPEAKERS) { const d = Math.abs(X(sx) - cx); if (d < bd) { bd = d; best = sx; } }
      saidOver(c, s.text, bd < CANVAS_WIDTH ? X(best) + 20 : cx, BACK_Y - 236, '#FDE047', 300);
    }
    void DUMP;
  },
  outdoors: () => 1,
  lamps: () => lotLamps(),
  wires: () => WIRES,
};
