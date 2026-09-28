// The bikers' bar, drawn. From outside: a cinderblock roadhouse, choppers lined
// up in front, THE BROKEN SPOKE in red neon, a Budweiser sign in the window. The
// front wall fades away once he's in. Inside: dark paneling, neon, a mirror and
// the bottles behind the counter, stools, a pool table under its lamp, the band's
// little stage with its amps, the jukebox glowing in the corner, a booth, and the
// bathroom at the back (its wall's in the way till he goes in). The gas lines:
// yellow pipe, each to a rusted joint (hissing once it's open). The gas, a haze
// thickening. After: black, burning, blood up the walls and over what's left of
// the ceiling, a charred skeleton where each of them was, bits everywhere.

import type { GameState } from '../../core/state';
import { GROUND_Y } from '../../../constants';
import { drawKindCorpse } from '../../render/enemies';
import { drawChopperBike } from '../../render/enemies/oscar';
import { COURSE } from './course';
import type { Bar, BarBiker } from './bar';
import { barIntact, barVeinBox } from './bar';

type Ctx = CanvasRenderingContext2D;
const Y = GROUND_Y;

const near = (state: GameState) => { const B = COURSE.bar; return !(state.camera.x > B.x2 + 800 || state.camera.x + 1100 < B.x1 - 300); };
/** He's in the room (the front wall fades), and in the bathroom (its wall does too). */
const inside = (state: GameState) => { const B = COURSE.bar, px = state.player.pos.x + state.player.width / 2; return px > B.x1 - 30 && px < B.x2 + 30; };
const inBathroom = (state: GameState) => { const B = COURSE.bar.bathroom, px = state.player.pos.x + state.player.width / 2; return px > B.x1 - 10; };

const neon = (ctx: Ctx, text: string, x: number, y: number, color: string, size: number, f: number, flicker = false) => {
  const on = !flicker || f % 97 > 6;
  ctx.save();
  ctx.font = `bold ${size}px monospace`; ctx.textAlign = 'center';
  ctx.shadowColor = color; ctx.shadowBlur = on ? 14 : 0;
  ctx.fillStyle = on ? color : 'rgba(80,80,80,0.6)'; ctx.fillText(text, x, y);
  ctx.restore();
};

/** The inside of it: walls, neon, the counter's mirror and bottles, the stage, the jukebox, the gas lines. */
export const drawBarBack = (ctx: Ctx, state: GameState, b: Bar) => {
  if (!near(state)) return;
  const B = COURSE.bar, f = state.frame;
  const intact = barIntact(b);
  const top = B.ceil;
  ctx.fillStyle = intact ? '#3B2418' : '#1C1410'; ctx.fillRect(B.x1, top, B.x2 - B.x1, Y - top);
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; for (let x = B.x1 + 30; x < B.x2; x += 60) ctx.fillRect(x, top, 3, Y - top);
  ctx.fillStyle = intact ? '#2A1810' : '#140E0B'; ctx.fillRect(B.x1, Y - 40, B.x2 - B.x1, 40);
  if (intact) {
    neon(ctx, 'HELL ON WHEELS', B.x1 + 620, top + 50, '#F43F5E', 18, f, true);
    neon(ctx, 'COLD BEER', B.x1 + 960, top + 60, '#38BDF8', 14, f + 30);
    // A dartboard, a flag of the club, a mounted longhorn skull
    ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.arc(B.x1 + 1040, top + 110, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.arc(B.x1 + 1040, top + 110, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(B.x1 + 1040, top + 110, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111827'; ctx.fillRect(B.x1 + 400, top + 30, 110, 60);
    ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(B.x1 + 455, top + 58, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111827'; ctx.fillRect(B.x1 + 448, top + 54, 4, 4); ctx.fillRect(B.x1 + 458, top + 54, 4, 4);
    ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'; ctx.fillText('RIDE OR DIE', B.x1 + 455, top + 84); ctx.textAlign = 'left';
    // The mirror behind the counter, the bottles on their shelves
    ctx.fillStyle = 'rgba(148, 163, 184, 0.25)'; ctx.fillRect(B.x1 + 490, top + 90, 250, 90);
    for (let s = 0; s < 2; s++) { ctx.fillStyle = '#57534E'; ctx.fillRect(B.x1 + 490, top + 124 + s * 40, 250, 4); for (let k = 0; k < 16; k++) { ctx.fillStyle = ['#15803D', '#A16207', '#7F1D1D', '#F8FAFC'][(k + s) % 4]; ctx.fillRect(B.x1 + 496 + k * 15, top + 104 + s * 40, 6, 20); } }
  } else {
    // Blood up the walls and everywhere (on the walls: behind him)
    for (const g of b.gore) if (g.kind === 'splat') { ctx.fillStyle = g.r > 20 ? 'rgba(127, 29, 29, 0.85)' : 'rgba(185, 28, 28, 0.8)'; ctx.beginPath(); ctx.ellipse(g.x, g.y, g.r, g.r * 0.6, g.rot, 0, Math.PI * 2); ctx.fill(); }
    // Fire still going here and there along the floor
    for (let k = 0; k < 9; k++) { const x = B.x1 + 70 + k * 130, h = 30 + Math.sin(f * 0.3 + k) * 12; ctx.fillStyle = 'rgba(234, 88, 12, 0.85)'; ctx.beginPath(); ctx.moveTo(x - 12, Y); ctx.quadraticCurveTo(x, Y - h, x + 12, Y); ctx.fill(); ctx.fillStyle = 'rgba(253, 224, 71, 0.9)'; ctx.beginPath(); ctx.moveTo(x - 6, Y); ctx.quadraticCurveTo(x, Y - h * 0.6, x + 6, Y); ctx.fill(); }
  }
  // The gas lines: yellow pipe down the walls to each joint
  ctx.fillStyle = intact ? '#CA8A04' : '#3F3A36';
  for (let i = 0; i < 3; i++) {
    const v = B.veins[i];
    ctx.fillRect(v.x + 20, top, 6, v.y - top + 3);
    ctx.fillRect(v.x - 20, v.y - 3, 46, 6);
    if (!intact) continue;
    const vb = barVeinBox(i);
    ctx.fillStyle = b.open[i] ? '#1C1917' : '#92400E'; ctx.fillRect(vb.x + 6, vb.y + 3, vb.w - 12, vb.h - 6);
    ctx.fillStyle = b.open[i] ? '#57534E' : '#B45309'; ctx.fillRect(vb.x + 4, vb.y + 1, 4, vb.h - 2); ctx.fillRect(vb.x + vb.w - 8, vb.y + 1, 4, vb.h - 2);
    if (!b.open[i]) { ctx.fillStyle = 'rgba(127, 29, 29, 0.7)'; ctx.fillRect(vb.x + 11, vb.y + 9, 5, 3); }
    ctx.fillStyle = '#CA8A04';
  }
};

/** The furniture, and them: the band, the drinkers, the pool players, the bartender, the one passed out in the booth. After: what's left of them. */
export const drawBarMid = (ctx: Ctx, state: GameState, b: Bar) => {
  if (!near(state)) return;
  const B = COURSE.bar, f = state.frame;
  const intact = barIntact(b);
  // The stage and its amps, the jukebox, the counter and stools, the pool table and its lamp, the booth
  const S = B.stage;
  ctx.fillStyle = intact ? '#44291A' : '#1C1410'; ctx.fillRect(S.x, S.y, S.w, Y - S.y);
  ctx.fillStyle = intact ? '#5B3A24' : '#292524'; ctx.fillRect(S.x - 4, S.y, S.w + 8, 6);
  if (intact) { ctx.fillStyle = '#111827'; ctx.fillRect(S.x + 10, S.y - 44, 34, 44); ctx.fillRect(S.x + S.w - 44, S.y - 44, 34, 44); ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.arc(S.x + 27, S.y - 22, 10, 0, Math.PI * 2); ctx.arc(S.x + S.w - 27, S.y - 22, 10, 0, Math.PI * 2); ctx.fill(); }
  const J = B.x1 + 360;
  ctx.fillStyle = intact ? '#7C2D12' : '#1C1917'; ctx.beginPath(); ctx.roundRect(J, Y - 90, 50, 90, [22, 22, 2, 2]); ctx.fill();
  if (intact) { ctx.fillStyle = `hsl(${(f * 3) % 360}, 90%, 60%)`; ctx.fillRect(J + 8, Y - 70, 34, 26); ctx.fillStyle = '#FDE047'; ctx.fillRect(J + 10, Y - 36, 30, 4); }
  ctx.fillStyle = intact ? '#57341F' : '#1C1410'; ctx.fillRect(B.x1 + 480, Y - 56, 270, 12); ctx.fillStyle = intact ? '#3B2418' : '#140E0B'; ctx.fillRect(B.x1 + 486, Y - 44, 258, 44);
  if (intact) for (const sx of [B.x1 + 510, B.x1 + 580, B.x1 + 650]) { ctx.fillStyle = '#B91C1C'; ctx.fillRect(sx - 10, Y - 40, 20, 6); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(sx - 2, Y - 34, 4, 34); }
  ctx.fillStyle = intact ? '#166534' : '#1C1917'; ctx.fillRect(B.x1 + 860, Y - 46, 140, 12); ctx.fillStyle = intact ? '#44291A' : '#140E0B'; ctx.fillRect(B.x1 + 866, Y - 34, 8, 34); ctx.fillRect(B.x1 + 986, Y - 34, 8, 34);
  if (intact) { ctx.fillStyle = '#FDE68A'; ctx.beginPath(); ctx.moveTo(B.x1 + 900, Y - 150); ctx.lineTo(B.x1 + 960, Y - 150); ctx.lineTo(B.x1 + 970, Y - 136); ctx.lineTo(B.x1 + 890, Y - 136); ctx.fill(); ctx.fillStyle = 'rgba(253, 230, 138, 0.12)'; ctx.beginPath(); ctx.moveTo(B.x1 + 890, Y - 136); ctx.lineTo(B.x1 + 970, Y - 136); ctx.lineTo(B.x1 + 1010, Y - 46); ctx.lineTo(B.x1 + 850, Y - 46); ctx.fill(); }
  ctx.fillStyle = intact ? '#7F1D1D' : '#1C1917'; ctx.fillRect(B.x1 + 1060, Y - 70, 26, 70); ctx.fillRect(B.x1 + 1086, Y - 34, 60, 34);
  if (intact) for (const k of b.bikers) drawBarBiker(ctx, state, k);
  else for (const g of b.gore) if (g.kind !== 'splat') drawRemains(ctx, g);
  // Choppers lined up out front (the ones that aren't going anywhere again)
  // (on the bit of ground between the last pit and the door, not out over the pit)
  for (let k = 0; k < 2; k++) drawChopperBike(ctx, B.x1 - 110 + k * 64, Y, 0, 0, intact ? ['#111827', '#7F1D1D'][k] : '#1C1917');
};

/** One of them on his break. */
const drawBarBiker = (ctx: Ctx, state: GameState, k: BarBiker) => {
  const f = state.frame, B = COURSE.bar;
  const phase = Math.round(k.x) % 997;
  const at = (x: number, y: number, facing: 1 | -1) => drawKindCorpse(ctx, 'biker', x - 27, y - 72, 54, 72, facing, phase, state);
  switch (k.look) {
    case 'band': at(k.x, B.stage.y, 1); ctx.fillStyle = '#B91C1C'; ctx.fillRect(k.x + 6, B.stage.y - 40, 26, 10); ctx.fillStyle = '#111827'; ctx.fillRect(k.x + 30, B.stage.y - 38, 24, 3); break; // the guitar
    case 'dance': ctx.save(); ctx.translate(k.x, Y); ctx.rotate(Math.sin(f * 0.15) * 0.12); ctx.translate(-k.x, -Y); at(k.x, Y, -1); ctx.restore(); break;
    case 'counter': case 'counter2': at(k.x, Y - 8, 1); ctx.fillStyle = '#FDE68A'; ctx.fillRect(k.x + 14, Y - 70, 7, 10); break; // a beer
    case 'bartender': at(k.x, Y, -1); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(k.x - 16, Y - 48, 10, 4); break;
    case 'pool': case 'pool2': at(k.x, Y, k.look === 'pool' ? 1 : -1); ctx.strokeStyle = '#D6B98C'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(k.x, Y - 42); ctx.lineTo(k.x + (k.look === 'pool' ? 60 : -60), Y - 52 + Math.sin(f * 0.1) * 3); ctx.stroke(); break;
    case 'booth': ctx.save(); ctx.translate(k.x, Y - 36); ctx.rotate(-Math.PI / 2 + 0.2); drawKindCorpse(ctx, 'biker', -27, -72, 54, 72, 1, phase, state); ctx.restore();
      ctx.fillStyle = '#111827'; ctx.font = 'bold 10px monospace'; const z = (f % 90) / 90; ctx.globalAlpha = 1 - z; ctx.fillText('Z', k.x + 10 + z * 10, Y - 60 - z * 20); ctx.globalAlpha = 1; break;
  }
};

/** A charred skeleton where one of them was, a limb, a boot. */
const drawRemains = (ctx: Ctx, g: { x: number; y: number; rot: number; kind: string }) => {
  ctx.save(); ctx.translate(g.x, g.y);
  if (g.kind === 'bones') {
    ctx.scale(g.rot ? -1 : 1, 1);
    ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.ellipse(0, -2, 34, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#292524'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-26, -5); ctx.lineTo(14, -5); ctx.stroke(); // spine
    for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-6 + k * 6, -5); ctx.quadraticCurveTo(-4 + k * 6, -14, 0 + k * 6, -7); ctx.stroke(); } // ribs
    ctx.beginPath(); ctx.moveTo(-26, -5); ctx.lineTo(-38, -2); ctx.moveTo(-26, -5); ctx.lineTo(-36, -9); ctx.stroke(); // legs
    ctx.fillStyle = '#44403C'; ctx.beginPath(); ctx.arc(22, -8, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0C0A09'; ctx.fillRect(22, -10, 3, 3); ctx.fillRect(18, -10, 2, 3);
    ctx.fillStyle = '#B91C1C'; ctx.fillRect(18, -16, 10, 3); // the bandana, still on
  } else if (g.kind === 'limb') {
    ctx.rotate(g.rot); ctx.fillStyle = '#7C2D12'; ctx.fillRect(-12, -3, 24, 6); ctx.fillStyle = '#B91C1C'; ctx.fillRect(10, -4, 5, 8);
  } else {
    ctx.fillStyle = '#111827'; ctx.fillRect(-8, -8, 16, 8); ctx.fillRect(4, -14, 6, 8); ctx.fillStyle = '#B91C1C'; ctx.fillRect(4, -16, 6, 3);
  }
  ctx.restore();
};

/** The shell: the ceiling, the front wall (faded away once he's in), the bathroom's wall (till he's in there), the gas, the flying bits. */
export const drawBarFront = (ctx: Ctx, state: GameState, b: Bar) => {
  if (!near(state)) return;
  const B = COURSE.bar, f = state.frame;
  const intact = barIntact(b);
  const top = B.ceil;
  // The gas
  if (b.gas > 0 && intact) {
    for (let k = 0; k < 6; k++) {
      const yy = top + 20 + k * 42 + Math.sin(f * 0.03 + k) * 8;
      const g = ctx.createLinearGradient(0, yy - 40, 0, yy + 40);
      g.addColorStop(0, 'rgba(190, 242, 100, 0)'); g.addColorStop(0.5, `rgba(190, 242, 100, ${0.45 * b.gas})`); g.addColorStop(1, 'rgba(190, 242, 100, 0)');
      ctx.fillStyle = g; ctx.fillRect(B.x1, yy - 40, B.x2 - B.x1, 80);
    }
  }
  if (intact) {
    // The bathroom's wall, a door marked HOGS (you've got to go in to see what's in there)
    const R = B.bathroom;
    ctx.save(); ctx.globalAlpha = inBathroom(state) ? 0.15 : 1;
    ctx.fillStyle = '#44403C'; ctx.fillRect(R.x1, top, R.x2 - R.x1, Y - top);
    ctx.fillStyle = '#292524'; ctx.fillRect(R.x1 + 30, Y - 110, 60, 110);
    ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center'; ctx.fillText('HOGS', R.x1 + 60, Y - 90); ctx.textAlign = 'left';
    ctx.restore();
    // The ceiling
    ctx.fillStyle = '#292524'; ctx.fillRect(B.x1 - 20, top - 40, B.x2 - B.x1 + 40, 40);
    // The front: cinderblock, the door, a window with a beer sign in it, THE BROKEN SPOKE in neon over it
    ctx.save(); ctx.globalAlpha = inside(state) ? 0.1 : 1;
    ctx.fillStyle = '#78716C'; ctx.fillRect(B.x1, top, B.x2 - B.x1, Y - top);
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; for (let y = top + 16; y < Y; y += 16) ctx.fillRect(B.x1, y, B.x2 - B.x1, 2);
    ctx.fillStyle = '#1C1917'; ctx.fillRect(B.x1 + 12, Y - 120, 70, 120);
    ctx.fillStyle = '#0F172A'; ctx.fillRect(B.x1 + 300, top + 110, 200, 80);
    neon(ctx, 'BUD', B.x1 + 400, top + 158, '#EF4444', 20, f + 60);
    neon(ctx, 'THE BROKEN SPOKE', B.x1 + 700, top + 60, '#EF4444', 26, f, true);
    neon(ctx, 'BIKERS ONLY', B.x1 + 700, top + 90, '#FBBF24', 12, f + 20);
    ctx.restore();
  } else {
    // What's left of the front and the ceiling: stumps, black, dripping
    ctx.fillStyle = '#1C1917';
    ctx.beginPath(); ctx.moveTo(B.x1, Y); ctx.lineTo(B.x1, top + 50); ctx.lineTo(B.x1 + 40, top + 100); ctx.lineTo(B.x1 + 70, top + 70); ctx.lineTo(B.x1 + 110, Y); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(B.x2, Y); ctx.lineTo(B.x2, top + 90); ctx.lineTo(B.x2 - 50, top + 140); ctx.lineTo(B.x2 - 80, Y); ctx.closePath(); ctx.fill();
    for (let k = 0; k < 5; k++) { const q = ((f + k * 30) % 150) / 150; ctx.fillStyle = `rgba(28, 25, 23, ${0.5 * (1 - q)})`; ctx.beginPath(); ctx.arc(B.x1 + 150 + k * 230 + q * 20, top + 100 - q * 260, 24 + q * 50, 0, Math.PI * 2); ctx.fill(); }
  }
  for (const d of b.flying) { ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot); ctx.fillStyle = d.color; ctx.fillRect(-d.w / 2, -d.h / 2, d.w, d.h); ctx.restore(); }
  // (the back door, while it's locked)
  if (intact) { ctx.fillStyle = '#451A03'; ctx.fillRect(B.x2 - 22, Y - 110, 22, 110); ctx.fillStyle = '#FACC15'; ctx.fillRect(B.x2 - 14, Y - 60, 6, 6); }
};
