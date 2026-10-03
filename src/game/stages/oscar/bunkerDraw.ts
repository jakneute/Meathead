// The break room, drawn. From outside, a prefab on blocks: corrugated walls,
// BREAK ROOM over the door, the union's decal, an air conditioner rattling on
// the roof. Inside (the front wall fades away once he's in): wood paneling, a
// DAYS WITHOUT AN INCIDENT board, the vending machine, the fridge, the coffee
// maker, the microwave, a couch, a card table, and the gas line along the wall
// feeding the heater, a rusted joint in it. The gas, once it's out, a haze
// thickening in the room. After: no roof, no far wall, everything black, the
// board down to zero, fires. The union: napping, playing cards, the foreman with
// his coffee, somebody at the microwave; then flat on the floor, black with soot;
// then up and furious; then stomping off back to work. Out the far side, the
// bikers on their choppers.
//
// Everything in the 16-bit way: an ink line round each thing, its colour in steps (lit from the upper left), no
// smooth gradients.

import { bandedGradient, checker, pixelBlob, tilePattern } from '../../render/pixelArt';
import { drawPerson, type PersonSpec } from '../../render/npc/person';
import { INK, dark, lite, ink, shaded } from '../../render/npc/kit';
import { slab, column, pipe, letter } from '../barry/rooms';
import { gasHaze, paneling, gasPipe, gasJoint, stump, smoke, flyingBit, snore } from './kit';
import type { GameState } from '../../core/state';
import { GROUND_Y } from '../../../constants';
import { drawFire } from '../../render/fx/fire';
import { drawKindCorpse } from '../../render/enemies';
import { drawChopperBike, drawLmgProp } from '../../render/enemies/oscar';
import { COURSE } from './course';
import type { Bunker, Worker } from './bunker';
import { roomIntact, doorShut, veinBox, clockSeconds } from './bunker';

type Ctx = CanvasRenderingContext2D;
const Y = GROUND_Y;

/** How far the front wall's faded (he's inside: 1). */
const insideness = (state: GameState) => {
  const B = COURSE.bunker, px = state.player.pos.x + state.player.width / 2;
  return px > B.x1 - 30 && px < B.x2 + 30 ? 1 : 0;
};

/** Corrugated siding: a ridge every 12, lit down its left, shadowed down its right. */
const corrugated = (ctx: Ctx) => tilePattern(ctx, 'oscar-corrugated', 12, 8, g => {
  g.fillStyle = '#A8A29E'; g.fillRect(0, 0, 12, 8);
  g.fillStyle = '#C4BFBA'; g.fillRect(0, 0, 2, 8);
  g.fillStyle = '#8E8883'; g.fillRect(6, 0, 4, 8);
  g.fillStyle = '#6F6A66'; g.fillRect(9, 0, 1, 8);
});

/** The back wall and everything on it (the room's inside). */
export const drawBunkerBack = (ctx: Ctx, state: GameState, b: Bunker) => {
  const B = COURSE.bunker;
  if (state.camera.x > B.x2 + 600 || state.camera.x + 800 < B.x1 - 100) return;
  const intact = roomIntact(b);
  const top = B.roof, W = B.x2 - B.x1;
  // Paneling, the wainscot under its rail
  paneling(ctx, B.x1, top, W, Y - top, intact ? '#8A5A33' : '#2A1E17', 22);
  slab(ctx, B.x1, Y - 30, W, 30, intact ? '#6B4226' : '#1C1917'); // wainscot
  pipe(ctx, B.x1, Y - 33, W, 4, intact ? '#57341F' : '#141210');
  if (!intact) {
    // Scorch up the walls, fires still going here and there
    checker(ctx, B.x1, top, W, 60, 'rgba(0,0,0,0.45)');
    for (let k = 0; k < 6; k++) drawFire(ctx, B.x1 + 60 + k * 110, Y, 26, 34 + (k % 3) * 4, state.frame, { seed: k * 19, smoke: 0.3, glow: 0.7 });
  }
  // The board
  const bx = B.x1 + 400, by = top + 30;
  slab(ctx, bx - 3, by - 3, 156, 50, '#1F2937');
  slab(ctx, bx, by, 150, 44, intact ? '#F8FAFC' : '#57534E', 1);
  ctx.fillStyle = intact ? '#B91C1C' : '#3F3A36'; ctx.fillRect(bx + 1, by + 1, 148, 17);
  letter(ctx, 'DAYS WITHOUT AN INCIDENT', bx + 75, by + 13, 'bold 8px monospace', '#F8FAFC', '#450A0A');
  slab(ctx, bx + 52, by + 21, 46, 20, intact ? '#E7E5E4' : '#44403C', 1);
  letter(ctx, intact ? '214' : '0', bx + 75, by + 38, 'bold 20px monospace', intact ? '#15803D' : '#DC2626', intact ? '#BBF7D0' : '#450A0A');
  // A poster: KNOW YOUR RIGHTS
  slab(ctx, B.x1 + 70, top + 40, 60, 80, intact ? '#1D4ED8' : '#292524');
  ctx.fillStyle = intact ? '#FACC15' : '#3F3A36'; ctx.fillRect(B.x1 + 74, top + 96, 52, 3);
  for (const [t, ty] of [['KNOW', 64], ['YOUR', 76], ['RIGHTS', 88], ['LOCAL 69', 108]] as const) letter(ctx, t, B.x1 + 100, top + ty, 'bold 7px monospace', '#F8FAFC', INK);
  ctx.fillStyle = '#E7E5E4'; ctx.fillRect(B.x1 + 98, top + 38, 4, 4); // (its pin)
  // A clock (break's over when it says)
  const cx = B.x1 + 620;
  ink(ctx, () => ctx.arc(cx, top + 50, 16, 0, Math.PI * 2), '#374151', 1.5);
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(cx, top + 50, 13.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#E2E8F0'; ctx.beginPath(); ctx.arc(cx + 2, top + 52, 11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(cx - 1, top + 49, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6B7280'; ctx.fillRect(cx - 12, top + 40, 2, 2); ctx.fillRect(cx - 10, top + 38, 2, 2); // (a glint on the bezel)
  // (it keeps real time: the second hand ticks, the minute hand creeps round to three o'clock, and on round after that)
  const secs = clockSeconds(b, state.frame);
  const hand = (turns: number, len: number, width: number, color: string) => {
    const a = turns * Math.PI * 2;
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, top + 50); ctx.lineTo(cx + Math.sin(a) * len, top + 50 - Math.cos(a) * len); ctx.stroke();
  };
  ctx.fillStyle = '#111827'; for (let h = 0; h < 12; h++) { const a = (h / 12) * Math.PI * 2; ctx.fillRect(cx + Math.sin(a) * 11 - 1, top + 50 - Math.cos(a) * 11 - 1, 2, 2); }
  hand(((secs / 3600) % 12) / 12, 7, 2.5, '#111827');
  hand(((secs / 60) % 60) / 60, 10, 2, '#111827');
  hand((secs % 60) / 60, 11, 1, '#DC2626');
  ctx.fillStyle = INK; ctx.fillRect(cx - 1, top + 49, 2, 2);
  ctx.lineCap = 'butt';
  // The vending machine, the fridge, the counter (coffee maker, microwave)
  const vx = B.x1 + 150;
  slab(ctx, vx, Y - 130, 60, 130, intact ? '#B91C1C' : '#3F3A36');
  slab(ctx, vx + 8, Y - 118, 36, 70, intact ? '#1F2937' : '#111111', 1);
  if (intact) {
    for (let r = 0; r < 4; r++) {
      pipe(ctx, vx + 9, Y - 104 + r * 17, 34, 2, '#9CA3AF');
      for (let c = 0; c < 3; c++) { const sc = ['#FACC15', '#F97316', '#22C55E', '#3B82F6'][(r + c) % 4]; ink(ctx, () => ctx.rect(vx + 11 + c * 11, Y - 114 + r * 17, 8, 10), sc); ctx.fillStyle = lite(sc, 0.45); ctx.fillRect(vx + 12 + c * 11, Y - 113 + r * 17, 2, 8); }
    }
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(vx + 10, Y - 116, 3, 66);
    letter(ctx, 'SNACKS', vx + 30, Y - 122, 'bold 6px monospace', '#FEF9C3', '#450A0A');
    slab(ctx, vx + 48, Y - 110, 8, 22, '#57534E', 1); ctx.fillStyle = INK; ctx.fillRect(vx + 51, Y - 106, 2, 6);
    slab(ctx, vx + 10, Y - 38, 32, 12, '#111827', 1);
  }
  slab(ctx, B.x2 - 70, Y - 120, 50, 120, intact ? '#E5E7EB' : '#44403C');
  ctx.fillStyle = intact ? '#9CA3AF' : '#292524'; ctx.fillRect(B.x2 - 69, Y - 86, 48, 2);
  column(ctx, B.x2 - 66, Y - 80, 3, 20, '#9CA3AF');
  column(ctx, B.x2 - 66, Y - 110, 3, 16, '#9CA3AF');
  const counter = intact ? '#A16207' : '#292524';
  slab(ctx, B.x1 + 560, Y - 64, 90, 8, counter, 1); column(ctx, B.x1 + 564, Y - 56, 6, 56, counter); column(ctx, B.x1 + 640, Y - 56, 6, 56, counter);
  slab(ctx, B.x1 + 600, Y - 92, 44, 28, intact ? '#D1D5DB' : '#44403C'); // microwave
  ctx.fillStyle = '#111827'; ctx.fillRect(B.x1 + 604, Y - 88, 28, 20);
  if (intact && Math.floor(state.frame / 30) % 2) { ctx.fillStyle = '#FDE047'; ctx.fillRect(B.x1 + 606, Y - 86, 24, 16); ctx.fillStyle = '#FEF9C3'; ctx.fillRect(B.x1 + 606, Y - 86, 24, 4); ctx.fillStyle = '#CA8A04'; ctx.fillRect(B.x1 + 612, Y - 74, 12, 4); }
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(B.x1 + 603.5, Y - 88.5, 29, 21);
  ctx.fillStyle = '#6B7280'; for (let k = 0; k < 3; k++) ctx.fillRect(B.x1 + 636, Y - 86 + k * 6, 4, 3);
  slab(ctx, B.x1 + 568, Y - 86, 20, 22, intact ? '#111827' : '#292524', 1); // coffee maker
  if (intact) { ink(ctx, () => ctx.rect(B.x1 + 572, Y - 76, 12, 11), '#7C2D12'); ctx.fillStyle = '#C2410C'; ctx.fillRect(B.x1 + 573, Y - 75, 2, 9); ctx.fillStyle = '#EF4444'; ctx.fillRect(B.x1 + 571, Y - 83, 2, 2); }
  // The gas line along the wall, down to the heater (the joint rusted, or blown out and hissing)
  const vb = veinBox(), vy = B.vein.y;
  // (down from the ceiling, along the wall at chest height, to the heater)
  const gas = intact ? '#CA8A04' : '#44403C';
  gasPipe(ctx, B.vein.x + 60, top, 6, vy - top + 3, gas);
  gasPipe(ctx, B.vein.x - 40, vy - 3, 106, 6, gas);
  gasPipe(ctx, B.vein.x - 46, vy - 3, 6, Y - 20 - vy, gas);
  if (intact) {
    letter(ctx, 'GAS', B.vein.x + 39, vy - 6, 'bold 6px monospace', '#FACC15', INK);
    // The heater at the bottom of it
    slab(ctx, B.vein.x - 58, Y - 30, 30, 30, '#6B7280', 1);
    ctx.fillStyle = '#1C1917'; ctx.fillRect(B.vein.x - 55, Y - 26, 24, 20);
    for (let k = 0; k < 2; k++) { ctx.fillStyle = '#F97316'; ctx.fillRect(B.vein.x - 54, Y - 24 + k * 10, 22, 3); ctx.fillStyle = '#FDE047'; ctx.fillRect(B.vein.x - 50, Y - 23 + k * 10, 14, 1); }
    // A note taped over the joint (it's been like that a while)
    // (sized to what's written on it, with a margin all round, the text centered in it)
    ctx.font = 'bold 6px monospace';
    const noteW = Math.ceil(Math.max(ctx.measureText('LEAKY JOINT').width, ctx.measureText('FIX REQUESTED 1997').width)) + 10;
    slab(ctx, B.vein.x - noteW / 2, vy - 44, noteW, 25, '#FEF9C3', 1);
    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)'; ctx.fillRect(B.vein.x - 6, vy - 47, 12, 5); // the tape
    letter(ctx, 'LEAKY JOINT', B.vein.x, vy - 33, 'bold 6px monospace', '#B91C1C', '#FDE68A');
    letter(ctx, 'FIX REQUESTED 1997', B.vein.x, vy - 24, 'bold 6px monospace', '#44403C', '#FDE68A');
    // The joint
    gasJoint(ctx, vb.x, vb.y, vb.w, vb.h, 4, b.popped);
  }
};

/** The furniture in the room, the union on their break (and after), the bikers out the far side. */
export const drawBunkerMid = (ctx: Ctx, state: GameState, b: Bunker) => {
  const B = COURSE.bunker;
  drawBikersOutBack(ctx, state, b);
  if (state.camera.x > B.x2 + 900 || state.camera.x + 800 < B.x1 - 400) return;
  const intact = roomIntact(b);
  // The couch (its back, the cushions, the arms, its feet), the card table (cards, chips, a coffee can of butts)
  const couch = intact ? '#4D7C0F' : '#292524';
  shaded(ctx, () => ctx.roundRect(B.x1 + 36, Y - 64, 148, 22, [6, 6, 0, 0]), couch, B.x1 + 36, Y - 64, 148, 22);
  slab(ctx, B.x1 + 40, Y - 44, 140, 32, couch);
  ctx.fillStyle = dark(couch, 0.3); ctx.fillRect(B.x1 + 86, Y - 44, 2, 14); ctx.fillRect(B.x1 + 133, Y - 44, 2, 14);
  ctx.fillStyle = lite(couch, 0.2); ctx.fillRect(B.x1 + 42, Y - 43, 136, 2);
  ctx.fillStyle = dark(couch, 0.2); ctx.fillRect(B.x1 + 42, Y - 30, 136, 2);
  slab(ctx, B.x1 + 36, Y - 12, 10, 12, intact ? '#44291A' : '#1C1917', 1); slab(ctx, B.x1 + 174, Y - 12, 10, 12, intact ? '#44291A' : '#1C1917', 1);
  const table = intact ? '#57534E' : '#1C1917';
  slab(ctx, B.x1 + 300, Y - 40, 90, 6, table, 1); column(ctx, B.x1 + 342, Y - 34, 6, 34, table); slab(ctx, B.x1 + 330, Y - 3, 30, 3, table, 1);
  if (intact) {
    for (let k = 0; k < 4; k++) { ink(ctx, () => ctx.rect(B.x1 + 318 + k * 13, Y - 44, 9, 4), '#F8FAFC'); ctx.fillStyle = k % 2 ? '#DC2626' : INK; ctx.fillRect(B.x1 + 321 + k * 13, Y - 43, 2, 2); }
    ink(ctx, () => ctx.rect(B.x1 + 370, Y - 46, 6, 6), '#DC2626'); ctx.fillStyle = '#F87171'; ctx.fillRect(B.x1 + 371, Y - 45, 2, 2);
  }
  for (const w of b.workers) drawWorker(ctx, state, w, B.x1);
};

/** The bikers out back (across the yard from the room, now): drawn wherever the room is. */
const drawBikersOutBack = (ctx: Ctx, state: GameState, b: Bunker) => {
  const B = COURSE.bunker;
  if (state.camera.x > Math.max(...B.bikers) + 400 || state.camera.x + 800 < Math.min(...B.bikers) - 400) return;
  // The bikers, out the far side: Dirty Dan on his chopper, the machine gun across the bars, the rest stood round it
  // admiring it (and one of them about to lose the lot)
  const p = state.player;
  b.bikers.forEach((k, i) => {
    if (k.state === 'sitting') {
      drawKindCorpse(ctx, 'chopper', k.x - 38, Y - 66, 76, 66, 1, i * 97, state);
      if (i === 0) drawLmgProp(ctx, k.x + 14, Y - 60, 0.1);
    } else if (k.state === 'standing') {
      drawKindCorpse(ctx, 'biker', k.x - 27, Y - 72, 54, 72, (k.x < b.bikers[0].x ? 1 : -1) as 1 | -1, i * 97, state);
    } else {
      // Kicked off it: the bike stays put till he's on it
      if (i === 0 && !p.moto) { drawChopperBike(ctx, B.bikers[0], Y, 0, 0, '#7F1D1D'); drawLmgProp(ctx, B.bikers[0] + 14, Y - 60, 0.1); }
      ctx.save(); ctx.translate(k.x, k.y - 34); ctx.rotate(k.rot);
      drawKindCorpse(ctx, 'biker', -27, -38, 54, 72, 1, i * 97, state);
      ctx.restore();
    }
  });
};

/** One of the union: on their break, knocked flat and black, up and furious, or stomping off. */
const drawWorker = (ctx: Ctx, state: GameState, w: Worker, x1: number) => {
  const f = state.frame;
  const sooty = w.state !== 'break' && w.state !== 'clocked';
  const skin = sooty ? '#1C1917' : ['#F2C9A0', '#8D5524', '#E0AC69', '#C68642', '#F5D0A9'][Math.abs(Math.round(w.x)) % 5];
  const vest = sooty ? '#292524' : '#F97316';
  const hat = sooty ? '#3F3A36' : w.look === 'foreman' ? '#F8FAFC' : '#FACC15';
  let x = w.x, y = Y;
  if (w.state === 'gone' || w.state === 'clocked') { x = w.x - w.t * 1.8; if (x < x1 - 500) return; }
  // Him: a work shirt under the hi-vis vest, jeans, boots, the hard hat (the foreman's white, and his belly, his
  // mustache, his coffee); black with soot once the room's gone up
  const foreman = w.look === 'foreman';
  const spec: PersonSpec = {
    skin, hair: { style: 'short', color: sooty ? '#0C0A09' : '#3F2A1D' }, top: { style: 'vest', color: sooty ? '#292524' : '#1D4ED8', accent: vest },
    legs: { color: sooty ? '#1C1917' : '#1E3A8A' }, shoes: '#44403C', hat: { style: 'hardhat', color: hat },
    face: foreman ? 'mustache' : undefined, faceHair: sooty ? '#0C0A09' : '#57534E', build: foreman ? 'fat' : undefined,
    extra: sooty ? undefined : c => { c.fillStyle = '#FDE047'; c.fillRect(-9, -38, 18, 2); },
  };
  if (w.state === 'knocked') {
    // Flat on the floor, smoking, hair on end
    ctx.save(); ctx.translate(x - 30, y); ctx.rotate(-Math.PI / 2); ctx.translate(-10, 30);
    drawPerson(ctx, 0, 0, spec, { arms: 'up', mouth: 'o', f });
    ctx.restore();
    for (let k = 0; k < 2; k++) { const q = ((f + k * 20 + Math.abs(x)) % 40) / 40; pixelBlob(ctx, x + 8 + k * 10, y - 14 - q * 26, 4 + q * 6, 4 + q * 5, `rgba(120, 113, 108, ${(0.6 * (1 - q)).toFixed(3)})`); }
    return;
  }
  const sitting = w.state === 'break' && (w.look === 'cards' || w.look === 'cards2');
  // (the two playing cards sit facing each other across their hand)
  const facing = w.state === 'gone' || w.state === 'clocked' ? -1 : w.look === 'cards2' ? -1 : w.look === 'cards' && w.state === 'break' ? 1 : w.look === 'microwave' && w.state === 'break' ? 1 : w.look === 'couch' && w.state === 'break' ? 1 : -1;
  if (w.look === 'couch' && w.state === 'break') {
    // Stretched out on the couch, hard hat over his face, snoring
    ctx.save(); ctx.translate(x, y - 44); ctx.scale(facing, 1); ctx.rotate(-Math.PI / 2); ctx.translate(-4, 36);
    drawPerson(ctx, 0, 0, { ...spec, hat: undefined }, { arms: 'cross', mouth: 'o', f });
    ctx.restore();
    ctx.save(); ctx.translate(x + facing * 30, y - 52); ctx.rotate(facing * 0.3);
    ink(ctx, () => ctx.arc(0, 0, 9, Math.PI, 0), hat);
    ctx.fillStyle = lite(hat, 0.5); ctx.fillRect(-5, -7, 3, 3);
    ink(ctx, () => ctx.rect(-11, -1, 22, 2.4), dark(hat, 0.15));
    ctx.restore();
    const z = (f % 90) / 90; snore(ctx, x + facing * 34 + z * 10, y - 68 - z * 20, 1 - z);
    return;
  }
  const walking = w.state === 'gone' || w.state === 'clocked';
  const furious = w.state === 'furious';
  // What they've got in their hands: cards, a mug, the microwave's door
  const cards = (c: Ctx, hx: number, hy: number) => { c.fillStyle = '#F8FAFC'; c.fillRect(hx, hy - 10, 8, 10); c.strokeStyle = '#1A0B06'; c.lineWidth = 0.6; c.strokeRect(hx, hy - 10, 8, 10); c.fillStyle = '#DC2626'; c.fillRect(hx + 2, hy - 7, 3, 3); };
  const mug = (c: Ctx, hx: number, hy: number) => { c.fillStyle = '#F8FAFC'; c.fillRect(hx - 2, hy - 10, 8, 10); c.strokeStyle = '#1A0B06'; c.lineWidth = 0.6; c.strokeRect(hx - 2, hy - 10, 8, 10); pixelBlob(c, hx + 2, hy - 15 - (f % 30) / 3, 3, 3, 'rgba(214, 211, 209, 0.6)'); };
  if (sitting) { slab(ctx, x - 14 * facing - 8, y - 26, 22, 4, '#57534E', 1); column(ctx, x - 12 * facing - 2, y - 22, 4, 22, '#57534E'); }
  drawPerson(ctx, x, y, spec, {
    arms: furious ? 'up' : sitting || foreman ? 'hold' : walking ? 'down' : 'hips', seated: sitting,
    walk: walking ? f * 0.35 : undefined, mouth: furious ? 'open' : walking ? 'frown' : w.state === 'break' ? 'talk' : 'flat', f,
    prop: !furious && !walking ? (sitting ? cards : foreman ? mug : undefined) : undefined,
  }, 1, facing);
  if (furious || w.state === 'gone') {
    // Red eyes in the soot, and steam off the top
    ctx.fillStyle = '#EF4444'; ctx.fillRect(x + facing * 2, y - 63, 3, 2); ctx.fillRect(x + facing * 7, y - 63, 3, 2);
    if (furious) { const q = (f % 30) / 30; pixelBlob(ctx, x + 2, y - 82 - q * 16, 3 + q * 5, 3 + q * 4, `rgba(214, 211, 209, ${(0.7 * (1 - q)).toFixed(3)})`); }
  }
};

/** The shell: the roof, the front wall (faded away once he's in; blown to bits after), the gas thickening in the room, what's flying. */
export const drawBunkerFront = (ctx: Ctx, state: GameState, b: Bunker) => {
  const B = COURSE.bunker;
  if (state.camera.x > B.x2 + 800 || state.camera.x + 800 < B.x1 - 100) return;
  const intact = roomIntact(b);
  const top = B.roof, W = B.x2 - B.x1;
  // The gas, a haze thickening in the room
  if (b.gas > 0 && intact) {
    for (let k = 0; k < 5; k++) gasHaze(ctx, B.x1, W, top + 20 + k * 40 + Math.sin(state.frame * 0.03 + k) * 8, 0.45 * b.gas);
  }
  if (intact) {
    // The roof (its corrugated edge, the drip rail), an air conditioner rattling on it
    slab(ctx, B.x1 - 16, top - 40, W + 32, 40, '#9CA3AF');
    ctx.fillStyle = '#B8BEC6'; for (let x = B.x1 - 12; x < B.x2 + 12; x += 10) ctx.fillRect(x, top - 38, 2, 30);
    pipe(ctx, B.x1 - 16, top - 6, W + 32, 6, '#6B7280');
    const ay = top - 80 + (state.frame % 6 < 3 ? 1 : 0);
    slab(ctx, B.x1 + 480, ay, 90, 40, '#D1D5DB');
    ctx.fillStyle = '#4B5563'; ctx.fillRect(B.x1 + 488, top - 73, 80, 26);
    for (let k = 0; k < 6; k++) { column(ctx, B.x1 + 490 + k * 13, top - 72, 6, 24, '#9CA3AF'); }
    slab(ctx, B.x1 + 476, top - 42, 98, 4, '#57534E', 1);
    // The front wall: corrugated, the door, a window, the sign, the decal (faded to a ghost while he's in there)
    const a = insideness(state) ? 0.12 : 1;
    ctx.save(); ctx.globalAlpha = a;
    ctx.save(); ctx.translate(B.x1, top); ctx.fillStyle = corrugated(ctx); ctx.fillRect(0, 0, W, Y - top); ctx.restore();
    ctx.fillStyle = '#78716C'; ctx.fillRect(B.x1, Y - 6, W, 6); checker(ctx, B.x1, Y - 14, W, 8, '#78716C');
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(B.x1 + 0.5, top + 0.5, W - 1, Y - top - 1);
    slab(ctx, B.x1 + 10, Y - 110, 60, 110, '#57534E'); // the doorway (open)
    ctx.fillStyle = '#1C1917'; ctx.fillRect(B.x1 + 14, Y - 106, 52, 106);
    ctx.fillStyle = '#0C0A09'; ctx.fillRect(B.x1 + 14, Y - 106, 52, 8);
    slab(ctx, B.x1 + 196, top + 66, 128, 68, '#57534E');
    bandedGradient(ctx, B.x1 + 200, top + 70, 120, 60, ['#BFDBFE', '#93C5FD', '#60A5FA'], 4);
    ctx.fillStyle = '#57534E'; ctx.fillRect(B.x1 + 258, top + 70, 4, 60);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; for (const gx of [B.x1 + 210, B.x1 + 270]) { ctx.beginPath(); ctx.moveTo(gx, top + 130); ctx.lineTo(gx + 24, top + 70); ctx.lineTo(gx + 32, top + 70); ctx.lineTo(gx + 8, top + 130); ctx.fill(); }
    slab(ctx, B.x1 + 60, top + 20, 190, 36, '#1D4ED8');
    letter(ctx, 'BREAK ROOM', B.x1 + 155, top + 45, 'bold 18px monospace', '#F8FAFC', '#1E3A8A');
    ink(ctx, () => ctx.arc(B.x1 + 460, top + 110, 36, 0, Math.PI * 2), '#F8FAFC', 1.5);
    ctx.strokeStyle = '#1D4ED8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(B.x1 + 460, top + 110, 31, 0, Math.PI * 2); ctx.stroke();
    letter(ctx, 'UNION', B.x1 + 460, top + 104, 'bold 11px monospace', '#1D4ED8', '#BFDBFE');
    letter(ctx, 'LOCAL 69', B.x1 + 460, top + 120, 'bold 11px monospace', '#1D4ED8', '#BFDBFE');
    letter(ctx, 'AUTHORIZED PERSONNEL ONLY', B.x1 + 540, Y - 60, 'bold 9px monospace', '#B91C1C', '#F8FAFC');
    ctx.restore();
    // The far door (locked; swung open once they've clocked out)
    if (doorShut(b)) {
      slab(ctx, B.x2 - 22, Y - 110, 22, 110, '#57534E');
      ink(ctx, () => ctx.rect(B.x2 - 14, Y - 60, 6, 6), '#FACC15');
    } else {
      ctx.fillStyle = '#1C1917'; ctx.fillRect(B.x2 - 22, Y - 110, 22, 110);
      column(ctx, B.x2, Y - 110, 6, 110, '#57534E');
    }
  } else {
    // What's left: jagged stumps of wall, black
    stump(ctx, () => { ctx.moveTo(B.x1, Y); ctx.lineTo(B.x1, top + 60); ctx.lineTo(B.x1 + 30, top + 110); ctx.lineTo(B.x1 + 50, top + 80); ctx.lineTo(B.x1 + 80, Y - 40); ctx.lineTo(B.x1 + 120, Y); ctx.closePath(); }, '#292524', B.x1, top + 60, 120, Y - top - 60);
    stump(ctx, () => { ctx.moveTo(B.x2, Y); ctx.lineTo(B.x2, top + 120); ctx.lineTo(B.x2 - 30, top + 160); ctx.lineTo(B.x2 - 60, Y - 30); ctx.lineTo(B.x2 - 90, Y); ctx.closePath(); }, '#292524', B.x2 - 90, top + 120, 90, Y - top - 120);
    for (let k = 0; k < 4; k++) { const q = ((state.frame + k * 30) % 120) / 120; smoke(ctx, B.x1 + 150 + k * 140 + q * 20, top + 100 - q * 200, 20 + q * 40, q, 0.5); }
  }
  for (const d of b.debris) {
    ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot);
    flyingBit(ctx, d.w, d.h, d.color);
    ctx.restore();
  }
};
