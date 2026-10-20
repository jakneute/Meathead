// LEARN THE MAGIC OF HOW CARTOONS ARE MADE (EST. 1994): section 2 of Cartoon Land. The user's design (cartoon-spec.md,
// verbatim there): "you walk through this building, fighting off enemies inside as lights come on as you progress
// showing animators working and glossing over the process as you advance. make it seem like the americans are the
// real visionaries and the Koreans who do the hard tedious work animating it are the 'suckers'. the voice then goes
// 'this process was used to make this season's hot new tv show: Chelsea Clinton and socks the cat's wacky white house
// adventures.'" (The satire's target is the narration's smugness: the animators are drawn tired, working, human.)
//
// A walk-through dark ride on foot (layout.ts: the rooms in order): each room dim till he's in it, then its lights
// come up (soft fills: art.ts's studioLights) and the narrator (pa.ts, lines.ts STORIES) tells him about it over the
// PA, one line at a time, never over anybody. The staff (kinds.ts) fight him through it; the platforming (props.ts):
// the storyboard wall, the drying rack's cel, the stacks of drawings over the reject pile (the land's towers,
// cartoon/sway.ts), the cels over the paint vat, the camera crane. At the end, THE SCREEN: in behind it, and on into
// the cartoon White House (whitehouse1; the transformation there is job 3's).
//
// The lights stay on (state.stageMemo: through a death, and after). Back later (been behind the screen): the house
// lights up, every room lit, the PA quiet, the staff gone home but the night security; the night shift still drawing.
//
// Checkpoints 10-15. The ways: in from the square's front door (DOORS.studio.start); back out of the lobby's front
// doors (its left end: DOORS.kiddie.end); on behind the screen (DOORS.whitehouse1.start); back from the White House,
// he's in front of the screen (DOORS.studio.end).

import { pickLine, isTalking } from '../../../m1/game/platform/speech';
import type { EnemyKind } from '../../../m1/types';
import { makeKindEnemy, mid } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import type { CartoonSection } from '../section';
import { layOwn, ledge, solid, meatheadSays, byPants, runExits, saidOver } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';
import { makeTowers, updateTowers, ridingTower } from '../sway';
import { HUD_CLEAR_X, CANVAS_WIDTH } from '../../../m1/constants';
import {
  GROUND, SOLIDS, LEDGES, STACKS, CAST, NIGHT_CAST, PICKUPS, CHECKPOINTS, ROOMS, LIGHT_IN, SCREEN, FRONT_DOOR, GAG_AT,
  STORY_AT, CEIL, X, Y,
} from './layout';
import { studioOf, saidOnce, litRooms, markLit, STUDIO_DONE_MEMO } from './state';
import { makeMovers, updateMovers, ridingMover, noteSafe, updatePits, updateThrows } from './props';
import { drawStudioBackdrop, drawStudioBack, drawStudioFront, studioLights } from './art';
import { paStory, paSaying } from './pa';
import { dotOf } from './kinds';
import { ARRIVE, REVISIT, GAGS } from './lines';

const { x0, x1 } = SECTIONS.studio;

/** A room's light coming on: a clunk, two flickers, then up soft over a second or so. */
const lightUp = (on: number) => (on < 0 ? 0 : on < 6 ? 0.55 : on < 11 ? 0.12 : on < 15 ? 0.6 : Math.min(1, 0.35 + (on - 15) / 55 * 0.65));

export const studio: CartoonSection = {
  id: 'studio', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    const s = studioOf(state);
    s.revisit = !!state.stageMemo[STUDIO_DONE_MEMO];
    layOwn(state, GROUND.map(([a, b]) => ({ x1: X(a), y1: GY, x2: X(b), y2: GY, surface: 'wood' })));
    // (the building's two ends: the lobby's front doors (walk into them: back out to the square) and past the screen)
    state.blocks.push({ x: x0 - 40, y: -6000, w: 40, h: 6000 + GY + 600, type: 'wall', hidden: true, tag: 'studio-start' });
    state.blocks.push({ x: x1, y: -6000, w: 40, h: 6000 + GY + 600, type: 'wall', hidden: true, tag: 'studio-end' });
    // (the ceiling: no jumping up out of the building)
    state.blocks.push({ x: x0 - 40, y: CEIL - 200, w: x1 - x0 + 80, h: 200, type: 'wall', hidden: true, tag: 'studio-ceiling' });
    for (const [a, b, top] of SOLIDS) solid(state, X(a), Y(top), b - a, GY + 40 - Y(top), { hidden: true });
    for (const [a, b, h] of LEDGES) ledge(state, X(a), Y(h), b - a, { hidden: true });
    s.towers = makeTowers(state, STACKS);
    s.movers = makeMovers(state);
    for (const [kind, rx, h, v] of s.revisit ? NIGHT_CAST : CAST) {
      const e = makeKindEnemy(kind as EnemyKind, X(rx), Y(h));
      e.homeX ??= e.pos.x; e.homeY = e.pos.y; e.variant = v ?? Math.abs(Math.round(rx)) % 7; e.facing = -1;
      state.enemies.push(e);
    }
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `studio-${Math.round(rx)}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
    // (the rooms already lit stay lit; back after the tour, the lot)
    const lit = litRooms(state);
    ROOMS.forEach((_, i) => { if (s.revisit || i === 0 || lit & (1 << i)) { s.light[i] = 1; s.on[i] = 999; } });
    const cp = CHECKPOINTS.find(c => c.cp === state.checkpoint) ?? CHECKPOINTS[0];
    s.safe = { x: cp.x, y: cp.y };
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, s = studioOf(state);
    updateTowers(ctx, s.towers);
    updateMovers(state, s.movers);
    noteSafe(state);
    updatePits(ctx);
    updateThrows(ctx);
    const rx = p.pos.x + p.width / 2 - x0, alive = !p.inCutscene && p.health > 0;
    // What he's got to say about it (once each a visit; it waits for a gap in the tape, or it's not said at all)
    const once = (key: string, pool: string[]) => { if (alive && !isTalking() && saidOnce(key)) meatheadSays(state, pickLine(pool), false); };
    if (rx < 700 && state.frame > 40) once('st-arrive', byPants(state, s.revisit ? REVISIT : ARRIVE));
    // The rooms' lights: on as he walks in (a clunk, a flicker, up soft), each room's story on the PA as it comes up
    ROOMS.forEach((r, i) => {
      if (s.on[i] < 0 && rx > r.a + (i === 0 ? 0 : LIGHT_IN) && rx < r.b) {
        s.on[i] = 0; markLit(state, i);
        if (i > 0) { playSound('click', 0.6, -6); playSound('thud', 0.35, 10); }
      }
      if (s.on[i] >= 0 && s.on[i] < 999) { s.on[i]++; s.light[i] = lightUp(s.on[i]); if (s.on[i] > 80) { s.on[i] = 999; s.light[i] = 1; } }
      // (the tour's tape: each room's story as he's in it, the first time this visit; not after the tour's done)
      if (!s.revisit && alive && rx > r.a + (i === 0 ? 260 : LIGHT_IN) && rx < r.b && state.frame > 60) paStory(state, r.id);
    });
    if (!s.revisit && alive) for (const [id, at] of STORY_AT) if (rx > at && rx < at + 500) paStory(state, id);
    for (const [key, at] of GAG_AT) if (rx > at && rx < at + 400) once(`st-${key}`, byPants(state, GAGS[key as keyof typeof GAGS]));
    // (on a stack as it first leans; on a cel, on the crane)
    const t = ridingTower(state, s.towers);
    if (t && Math.abs(t.ang) > 0.12) once('st-stack', byPants(state, GAGS.stack));
    const m = ridingMover(state, s.movers);
    if (m && (m.d.id === 'celA' || m.d.id === 'celB')) once('st-cels', byPants(state, GAGS.cels));
    if (m && m.d.id === 'crane') once('st-crane', byPants(state, GAGS.crane));
    // The ways out: the lobby's front doors (back to the square); in behind the screen (on to the White House)
    runExits(state, [{ x0: x0 - 10, x1: X(FRONT_DOOR), yTop: GY - 40, yBot: GY + 2, to: DOORS.kiddie.end }]);
    if (runExits(state, [{ x0: X(SCREEN.out), x1: x1, yTop: GY - 40, yBot: GY + 2, to: DOORS.whitehouse1.start }])) state.stageMemo[STUDIO_DONE_MEMO] = '1';
    return controls;
  },
  drawBackdrop: (c) => drawStudioBackdrop(c),
  drawBack: (c, state) => drawStudioBack(c, state, !!paSaying(state)),
  drawFront: (c, state) => drawStudioFront(c, state),
  drawHud: (c, state) => {
    // (over the lighting, in screen space: the exec's laser dots and their beams (they glow), the staff's barks, the PA)
    const s = studioOf(state), cx = state.camera.x, cy = state.camera.y;
    for (const e of state.enemies) {
      const d = dotOf(e);
      if (!d || e.health <= 0) continue;
      const blink = e.aiState === 'lock' && (state.frame >> 2) % 2 === 0;
      const hx = mid(e).x + (e.facing ?? 1) * 30 - cx, hy = e.pos.y + 26 - cy, dx = d.x - cx, dy = d.y - cy;
      c.strokeStyle = 'rgba(255,59,59,0.28)'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx, hy); c.lineTo(dx, dy); c.stroke();
      c.fillStyle = 'rgba(255,59,59,0.35)'; c.beginPath(); c.arc(dx, dy, blink ? 7 : 5, 0, Math.PI * 2); c.fill();
      c.fillStyle = blink ? '#FFFFFF' : '#FF3B3B'; c.beginPath(); c.arc(dx, dy, 2.5, 0, Math.PI * 2); c.fill();
    }
    for (const [e, b] of s.barks) if (e.health > 0) saidOver(c, b.text, mid(e).x - cx, e.pos.y - 14 - cy, '#FDE68A', 220);
    const pa = paSaying(state);
    if (pa) saidOver(c, pa.text, (HUD_CLEAR_X + 10 + CANVAS_WIDTH - 20) / 2, 140, '#BAE6FD', 300);
  },
  lighting: (state) => {
    const s = studioOf(state), p = state.player;
    // (dark in the building; each lit room's soft fills; the aisle lights; a soft glow about him off the path's lights)
    return { dark: s.revisit ? 0.32 : 0.64, shade: [10, 6, 22], rim: 0.5, lights: [...studioLights(state), { x: p.pos.x + p.width / 2, y: p.pos.y + 10, r: 150, a: 0.45 }] };
  },
  // (his feet low on screen on the floor; up on the catwalk-height things, lower so the ceiling stays at the top)
  cameraRow: (state) => Math.max(330, Math.min(500, state.player.pos.y + state.player.height - CEIL + 40)),
};
