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

import type { GameState } from '../../core/state';
import { GROUND_Y } from '../../../constants';
import { drawKindCorpse } from '../../render/enemies';
import { drawChopperBike, drawLmgProp } from '../../render/enemies/oscar';
import { COURSE } from './course';
import type { Bunker, Worker } from './bunker';
import { roomIntact, veinBox } from './bunker';

type Ctx = CanvasRenderingContext2D;
const Y = GROUND_Y;

/** How far the front wall's faded (he's inside: 1). */
const insideness = (state: GameState) => {
  const B = COURSE.bunker, px = state.player.pos.x + state.player.width / 2;
  return px > B.x1 - 30 && px < B.x2 + 30 ? 1 : 0;
};

/** The back wall and everything on it (the room's inside). */
export const drawBunkerBack = (ctx: Ctx, state: GameState, b: Bunker) => {
  const B = COURSE.bunker;
  if (state.camera.x > B.x2 + 600 || state.camera.x + 800 < B.x1 - 100) return;
  const intact = roomIntact(b);
  const top = B.roof;
  // Paneling
  ctx.fillStyle = intact ? '#8A5A33' : '#2A1E17'; ctx.fillRect(B.x1, top, B.x2 - B.x1, Y - top);
  ctx.fillStyle = intact ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.3)'; for (let x = B.x1 + 22; x < B.x2; x += 44) ctx.fillRect(x, top, 2, Y - top);
  ctx.fillStyle = intact ? '#6B4226' : '#1C1917'; ctx.fillRect(B.x1, Y - 30, B.x2 - B.x1, 30); // wainscot
  if (!intact) {
    // Scorch up the walls, fires still going here and there
    for (let k = 0; k < 6; k++) {
      const x = B.x1 + 60 + k * 110, h = 30 + Math.sin(state.frame * 0.3 + k) * 10;
      ctx.fillStyle = 'rgba(249, 115, 22, 0.85)'; ctx.beginPath(); ctx.moveTo(x - 10, Y); ctx.quadraticCurveTo(x, Y - h, x + 10, Y); ctx.fill();
      ctx.fillStyle = 'rgba(253, 224, 71, 0.9)'; ctx.beginPath(); ctx.moveTo(x - 5, Y); ctx.quadraticCurveTo(x, Y - h * 0.6, x + 5, Y); ctx.fill();
    }
  }
  // The board
  const bx = B.x1 + 400, by = top + 30;
  ctx.fillStyle = intact ? '#F8FAFC' : '#57534E'; ctx.fillRect(bx, by, 150, 44);
  ctx.strokeStyle = '#1F2937'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, 150, 44);
  ctx.fillStyle = '#111827'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
  ctx.fillText('DAYS WITHOUT AN INCIDENT', bx + 75, by + 14);
  ctx.fillStyle = intact ? '#15803D' : '#DC2626'; ctx.font = 'bold 20px monospace'; ctx.fillText(intact ? '214' : '0', bx + 75, by + 38);
  ctx.textAlign = 'left';
  // A poster: KNOW YOUR RIGHTS
  ctx.fillStyle = intact ? '#1D4ED8' : '#292524'; ctx.fillRect(B.x1 + 70, top + 40, 60, 80);
  ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
  ctx.fillText('KNOW', B.x1 + 100, top + 64); ctx.fillText('YOUR', B.x1 + 100, top + 76); ctx.fillText('RIGHTS', B.x1 + 100, top + 88);
  ctx.fillText('LOCAL 69', B.x1 + 100, top + 108); ctx.textAlign = 'left';
  // A clock (break's over when it says)
  const cx = B.x1 + 620;
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(cx, top + 50, 16, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, top + 50); ctx.lineTo(cx, top + 38); ctx.moveTo(cx, top + 50); ctx.lineTo(cx + 8, top + 54); ctx.stroke();
  // The vending machine, the fridge, the counter (coffee maker, microwave)
  ctx.fillStyle = intact ? '#B91C1C' : '#3F3A36'; ctx.fillRect(B.x1 + 150, Y - 130, 60, 130);
  ctx.fillStyle = intact ? '#1F2937' : '#111'; ctx.fillRect(B.x1 + 158, Y - 118, 36, 70);
  if (intact) { ctx.fillStyle = '#FACC15'; for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) ctx.fillRect(B.x1 + 161 + c * 11, Y - 114 + r * 17, 8, 10); }
  ctx.fillStyle = intact ? '#E5E7EB' : '#44403C'; ctx.fillRect(B.x2 - 70, Y - 120, 50, 120);
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(B.x2 - 66, Y - 80, 3, 20);
  ctx.fillStyle = intact ? '#A16207' : '#292524'; ctx.fillRect(B.x1 + 560, Y - 64, 90, 8); ctx.fillRect(B.x1 + 564, Y - 56, 6, 56); ctx.fillRect(B.x1 + 640, Y - 56, 6, 56);
  ctx.fillStyle = intact ? '#D1D5DB' : '#44403C'; ctx.fillRect(B.x1 + 600, Y - 92, 44, 28); // microwave
  ctx.fillStyle = '#111827'; ctx.fillRect(B.x1 + 604, Y - 88, 28, 20);
  if (intact && Math.floor(state.frame / 30) % 2) { ctx.fillStyle = '#FDE047'; ctx.fillRect(B.x1 + 606, Y - 86, 24, 16); }
  ctx.fillStyle = intact ? '#111827' : '#292524'; ctx.fillRect(B.x1 + 568, Y - 86, 20, 22); // coffee maker
  // The gas line along the wall, down to the heater (the joint rusted, or blown out and hissing)
  const vb = veinBox(), vy = B.vein.y;
  // (down from the ceiling, along the wall at chest height, to the heater)
  ctx.fillStyle = intact ? '#CA8A04' : '#44403C';
  ctx.fillRect(B.vein.x + 60, top, 6, vy - top + 3);
  ctx.fillRect(B.vein.x - 40, vy - 3, 106, 6);
  ctx.fillRect(B.vein.x - 46, vy - 3, 6, Y - 20 - vy);
  if (intact) {
    ctx.fillStyle = '#FACC15'; ctx.font = 'bold 6px monospace'; ctx.fillText('GAS', B.vein.x + 30, vy - 6);
    // The heater at the bottom of it
    ctx.fillStyle = '#6B7280'; ctx.fillRect(B.vein.x - 58, Y - 30, 30, 30);
    ctx.fillStyle = '#F97316'; for (let k = 0; k < 2; k++) ctx.fillRect(B.vein.x - 54, Y - 24 + k * 10, 22, 3);
    // A note taped over the joint (it's been like that a while)
    // (sized to what's written on it, with a margin all round, the text centered in it)
    ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center';
    const noteW = Math.ceil(Math.max(ctx.measureText('LEAKY JOINT').width, ctx.measureText('FIX REQUESTED 1997').width)) + 10;
    ctx.fillStyle = '#FEF9C3'; ctx.fillRect(B.vein.x - noteW / 2, vy - 44, noteW, 25);
    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)'; ctx.fillRect(B.vein.x - 6, vy - 47, 12, 5); // the tape
    ctx.fillStyle = '#B91C1C'; ctx.fillText('LEAKY JOINT', B.vein.x, vy - 33); ctx.fillStyle = '#44403C'; ctx.fillText('FIX REQUESTED 1997', B.vein.x, vy - 24); ctx.textAlign = 'left';
    // The joint
    ctx.fillStyle = b.popped ? '#1C1917' : '#92400E'; ctx.fillRect(vb.x + 6, vb.y + 4, vb.w - 12, vb.h - 8);
    ctx.fillStyle = b.popped ? '#57534E' : '#B45309'; ctx.fillRect(vb.x + 4, vb.y + 2, 4, vb.h - 4); ctx.fillRect(vb.x + vb.w - 8, vb.y + 2, 4, vb.h - 4);
    if (!b.popped) { ctx.fillStyle = 'rgba(127, 29, 29, 0.6)'; ctx.fillRect(vb.x + 10, vb.y + 12, 6, 3); ctx.fillRect(vb.x + 18, vb.y + 6, 4, 4); } // rust
    else { ctx.strokeStyle = '#111827'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(vb.x + 12, vb.y + 4); ctx.lineTo(vb.x + 16, vb.y + 10); ctx.lineTo(vb.x + 13, vb.y + 16); ctx.stroke(); }
  }
};

/** The furniture in the room, the union on their break (and after), the bikers out the far side. */
export const drawBunkerMid = (ctx: Ctx, state: GameState, b: Bunker) => {
  const B = COURSE.bunker;
  if (state.camera.x > B.x2 + 900 || state.camera.x + 800 < B.x1 - 400) return;
  const intact = roomIntact(b);
  // The couch, the card table (cards, chips, a coffee can of butts)
  ctx.fillStyle = intact ? '#4D7C0F' : '#292524'; ctx.fillRect(B.x1 + 40, Y - 44, 140, 32); ctx.fillRect(B.x1 + 36, Y - 64, 148, 22); ctx.fillRect(B.x1 + 36, Y - 12, 10, 12); ctx.fillRect(B.x1 + 174, Y - 12, 10, 12);
  ctx.fillStyle = intact ? '#57534E' : '#1C1917'; ctx.fillRect(B.x1 + 300, Y - 40, 90, 6); ctx.fillRect(B.x1 + 342, Y - 34, 6, 34);
  if (intact) { ctx.fillStyle = '#F8FAFC'; for (let k = 0; k < 4; k++) ctx.fillRect(B.x1 + 318 + k * 13, Y - 44, 9, 4); ctx.fillStyle = '#DC2626'; ctx.fillRect(B.x1 + 370, Y - 46, 6, 6); }
  for (const w of b.workers) drawWorker(ctx, state, w, B.x1);
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
  const sooty = w.state !== 'break';
  const skin = sooty ? '#1C1917' : ['#F2C9A0', '#8D5524', '#E0AC69', '#C68642', '#F5D0A9'][Math.abs(Math.round(w.x)) % 5];
  const vest = sooty ? '#292524' : '#F97316';
  const hat = sooty ? '#3F3A36' : w.look === 'foreman' ? '#F8FAFC' : '#FACC15';
  let x = w.x, y = Y;
  if (w.state === 'gone') { x = w.x - w.t * 1.8; if (x < x1 - 500) return; }
  ctx.save(); ctx.translate(x, y);
  if (w.state === 'knocked') {
    // Flat on the floor, smoking, hair on end
    ctx.fillStyle = '#1F2937'; ctx.fillRect(-26, -10, 22, 9);
    ctx.fillStyle = vest; ctx.fillRect(-4, -12, 24, 12);
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(26, -7, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#111827'; ctx.lineWidth = 1; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(30, -8 + k * 2); ctx.lineTo(38, -10 + k * 3); ctx.stroke(); }
    for (let k = 0; k < 2; k++) { const q = ((f + k * 20 + Math.abs(x)) % 40) / 40; ctx.fillStyle = `rgba(120, 113, 108, ${0.6 * (1 - q)})`; ctx.beginPath(); ctx.arc(8 + k * 10, -14 - q * 26, 4 + q * 6, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    return;
  }
  const sitting = w.state === 'break' && (w.look === 'cards' || w.look === 'cards2');
  const facing = w.state === 'gone' ? -1 : w.look === 'cards2' ? -1 : w.look === 'microwave' && w.state === 'break' ? 1 : w.look === 'couch' && w.state === 'break' ? 1 : -1;
  ctx.scale(facing, 1);
  if (w.look === 'couch' && w.state === 'break') {
    // Stretched out on the couch, hard hat over his face, snoring
    ctx.translate(0, -44);
    ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-60, -10, 50, 10);
    ctx.fillStyle = vest; ctx.fillRect(-12, -14, 34, 14);
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(30, -8, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = hat; ctx.beginPath(); ctx.arc(31, -10, 9, Math.PI * 1.1, Math.PI * 0.1); ctx.fill();
    ctx.fillStyle = '#111827'; ctx.font = 'bold 10px monospace'; const z = (f % 90) / 90; ctx.globalAlpha = 1 - z; ctx.fillText('Z', 34 + z * 10, -24 - z * 20); ctx.globalAlpha = 1;
    ctx.restore();
    return;
  }
  const walk = w.state === 'gone' ? Math.sin(f * 0.35) * 5 : 0;
  // Legs (bent at the knee, sat down, at the card table)
  ctx.fillStyle = '#1E3A8A';
  if (sitting) { ctx.fillRect(-10, -30, 20, 8); ctx.fillRect(4, -24, 7, 24); ctx.fillStyle = '#57534E'; ctx.fillRect(-14, -26, 22, 4); ctx.fillRect(-12, -22, 4, 22); }
  else { ctx.fillRect(-9 + walk, -28, 8, 22); ctx.fillRect(2 - walk, -28, 8, 22); ctx.fillStyle = '#44403C'; ctx.fillRect(-10 + walk, -6, 11, 6); ctx.fillRect(1 - walk, -6, 12, 6); }
  const by = sitting ? -30 : -28;
  // The body: the vest over a work shirt, the foreman's belly
  ctx.fillStyle = sooty ? '#292524' : '#1D4ED8'; ctx.fillRect(-12, by - 28, 24, 28);
  ctx.fillStyle = vest; ctx.fillRect(-12, by - 28, 7, 28); ctx.fillRect(5, by - 28, 7, 28);
  if (!sooty) { ctx.fillStyle = '#FDE047'; ctx.fillRect(-12, by - 14, 24, 3); }
  if (w.look === 'foreman') { ctx.fillStyle = sooty ? '#292524' : '#1D4ED8'; ctx.beginPath(); ctx.ellipse(4, by - 10, 14, 10, 0, 0, Math.PI * 2); ctx.fill(); }
  // Head, hard hat
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(2, by - 36, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = hat; ctx.beginPath(); ctx.arc(2, by - 39, 9, Math.PI, 0); ctx.fill(); ctx.fillRect(-9, by - 40, 22, 2);
  if (w.look === 'foreman' && !sooty) { ctx.strokeStyle = '#57534E'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-1, by - 32); ctx.lineTo(9, by - 32); ctx.stroke(); }
  if (w.state === 'furious') {
    // Red eyes in the soot, fists up and shaking, steam off the top
    ctx.fillStyle = '#EF4444'; ctx.fillRect(4, by - 38, 3, 2);
    const shake = Math.sin(f * 0.9) * 3;
    ctx.fillStyle = skin; ctx.fillRect(10, by - 42 + shake, 7, 7); ctx.fillRect(-16, by - 40 - shake, 7, 7);
    const q = (f % 30) / 30; ctx.fillStyle = `rgba(214, 211, 209, ${0.7 * (1 - q)})`; ctx.beginPath(); ctx.arc(2, by - 52 - q * 16, 3 + q * 5, 0, Math.PI * 2); ctx.fill();
  } else if (w.state === 'gone') {
    ctx.fillStyle = '#EF4444'; ctx.fillRect(4, by - 38, 3, 2);
  } else {
    ctx.fillStyle = '#111827'; ctx.fillRect(5, by - 38, 2, 2);
    // What they've got in their hands: cards, a mug, the microwave's door
    if (sitting) { ctx.fillStyle = skin; ctx.fillRect(10, by - 20, 8, 5); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(14, by - 26, 8, 10); ctx.fillStyle = '#DC2626'; ctx.fillRect(16, by - 23, 3, 3); }
    else if (w.look === 'foreman') { ctx.fillStyle = skin; ctx.fillRect(12, by - 22, 7, 5); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(16, by - 30, 9, 11); ctx.fillStyle = 'rgba(214, 211, 209, 0.6)'; ctx.beginPath(); ctx.arc(20, by - 36 - (f % 30) / 3, 3, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.fillStyle = skin; ctx.fillRect(10, by - 22, 9, 5); }
  }
  ctx.restore();
};

/** The shell: the roof, the front wall (faded away once he's in; blown to bits after), the gas thickening in the room, what's flying. */
export const drawBunkerFront = (ctx: Ctx, state: GameState, b: Bunker) => {
  const B = COURSE.bunker;
  if (state.camera.x > B.x2 + 800 || state.camera.x + 800 < B.x1 - 100) return;
  const intact = roomIntact(b);
  const top = B.roof;
  // The gas, a haze thickening in the room
  if (b.gas > 0 && intact) {
    for (let k = 0; k < 5; k++) {
      const yy = top + 20 + k * 40 + Math.sin(state.frame * 0.03 + k) * 8;
      const g = ctx.createLinearGradient(0, yy - 40, 0, yy + 40);
      g.addColorStop(0, 'rgba(217, 249, 157, 0)'); g.addColorStop(0.5, `rgba(190, 242, 100, ${0.45 * b.gas})`); g.addColorStop(1, 'rgba(217, 249, 157, 0)');
      ctx.fillStyle = g; ctx.fillRect(B.x1, yy - 40, B.x2 - B.x1, 80);
    }
  }
  if (intact) {
    // The roof, an air conditioner rattling on it
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(B.x1 - 16, top - 40, B.x2 - B.x1 + 32, 40);
    ctx.fillStyle = '#6B7280'; ctx.fillRect(B.x1 - 16, top - 6, B.x2 - B.x1 + 32, 6);
    ctx.fillStyle = '#D1D5DB'; ctx.fillRect(B.x1 + 480, top - 80 + (state.frame % 6 < 3 ? 1 : 0), 90, 40);
    ctx.fillStyle = '#6B7280'; for (let k = 0; k < 6; k++) ctx.fillRect(B.x1 + 490 + k * 13, top - 72, 6, 24);
    // The front wall: corrugated, the door, a window, the sign, the decal (faded to a ghost while he's in there)
    const a = insideness(state) ? 0.12 : 1;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(B.x1, top, B.x2 - B.x1, Y - top);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let x = B.x1 + 6; x < B.x2; x += 12) ctx.fillRect(x, top, 4, Y - top);
    ctx.fillStyle = '#57534E'; ctx.fillRect(B.x1 + 10, Y - 110, 60, 110); // the doorway (open)
    ctx.fillStyle = '#1C1917'; ctx.fillRect(B.x1 + 14, Y - 106, 52, 106);
    ctx.fillStyle = '#93C5FD'; ctx.fillRect(B.x1 + 200, top + 70, 120, 60); ctx.strokeStyle = '#57534E'; ctx.lineWidth = 4; ctx.strokeRect(B.x1 + 200, top + 70, 120, 60);
    ctx.fillStyle = '#1D4ED8'; ctx.fillRect(B.x1 + 60, top + 20, 190, 36);
    ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center'; ctx.fillText('BREAK ROOM', B.x1 + 155, top + 45);
    ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(B.x1 + 460, top + 110, 36, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1D4ED8'; ctx.font = 'bold 11px monospace'; ctx.fillText('UNION', B.x1 + 460, top + 104); ctx.fillText('LOCAL 69', B.x1 + 460, top + 120);
    ctx.fillStyle = '#B91C1C'; ctx.font = 'bold 9px monospace'; ctx.fillText('AUTHORIZED PERSONNEL ONLY', B.x1 + 540, Y - 60);
    ctx.textAlign = 'left';
    ctx.restore();
    // The far door (locked)
    ctx.fillStyle = '#57534E'; ctx.fillRect(B.x2 - 22, Y - 110, 22, 110);
    ctx.fillStyle = '#FACC15'; ctx.fillRect(B.x2 - 14, Y - 60, 6, 6);
  } else {
    // What's left: jagged stumps of wall, black
    ctx.fillStyle = '#292524';
    ctx.beginPath(); ctx.moveTo(B.x1, Y); ctx.lineTo(B.x1, top + 60); ctx.lineTo(B.x1 + 30, top + 110); ctx.lineTo(B.x1 + 50, top + 80); ctx.lineTo(B.x1 + 80, Y - 40); ctx.lineTo(B.x1 + 120, Y); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(B.x2, Y); ctx.lineTo(B.x2, top + 120); ctx.lineTo(B.x2 - 30, top + 160); ctx.lineTo(B.x2 - 60, Y - 30); ctx.lineTo(B.x2 - 90, Y); ctx.closePath(); ctx.fill();
    for (let k = 0; k < 4; k++) { const q = ((state.frame + k * 30) % 120) / 120; ctx.fillStyle = `rgba(41, 37, 36, ${0.5 * (1 - q)})`; ctx.beginPath(); ctx.arc(B.x1 + 150 + k * 140 + q * 20, top + 100 - q * 200, 20 + q * 40, 0, Math.PI * 2); ctx.fill(); }
  }
  for (const d of b.debris) {
    ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot);
    ctx.fillStyle = d.color; ctx.fillRect(-d.w / 2, -d.h / 2, d.w, d.h);
    ctx.restore();
  }
};
