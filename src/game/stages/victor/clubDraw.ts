// Club Caldera, inside, drawn: the club floor (glass tiles over lava, lit from
// under and pulsing to the beat; obsidian walls veined with lava, a magma
// waterfall behind the dance floor, lava lamps as tall as pillars, the neon sign;
// the DJ booth, the bar, the speaker stacks, the VIP tables, the go-go cages) and
// its atrium (not rock: glossy black walls with neon run up them, a lava lamp the
// height of the whole thing, neon catwalks, chrome pyro cannons, disco rigs
// spinning fire; at its foot, the stairwell down to the front door he never
// used). The partygoers' screams over their heads, and the tally of the ones
// he's killed.

import type { GameState } from '../../core/state';
import type { Ledge } from './course';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../constants';
import { COURSE } from './course';
import { getVictor, regionOf } from './runtime';
import { tallyTitle } from './club';
import { sentenceShown } from '../../platform/speech';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const Y = GROUND_Y;
/** The beat (frames a beat: 120 to the minute). */
export const BEAT = 30;
const beatK = (f: number) => 1 - (f % BEAT) / BEAT;
const NEON = ['#F472B6', '#22D3EE', '#FB923C', '#A78BFA'];
const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 200 && x1 < state.camera.x + CANVAS_WIDTH + 200;

// ---------------------------------------------------------------------------
// Behind everything (screen space): the club's far wall, the waterfall, the lasers
// ---------------------------------------------------------------------------

export const drawClubBackdrop = (ctx: Ctx, state: GameState) => {
  const f = state.frame, camX = state.camera.x;
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  g.addColorStop(0, '#0B0508'); g.addColorStop(0.6, '#1E0610'); g.addColorStop(1, '#3B0A0A');
  ctx.fillStyle = g; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // Far obsidian panels, veined with lava
  for (let i = 0; i < 9; i++) {
    const x = ((i * 150 - camX * 0.15) % 1350 + 1350) % 1350 - 150;
    ctx.fillStyle = i % 2 ? '#120609' : '#170810'; ctx.fillRect(x, 0, 140, CANVAS_HEIGHT);
    ctx.strokeStyle = `rgba(249, 115, 22, ${0.25 + 0.15 * Math.sin(f * 0.05 + i)})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + 20 + hash(i) * 60, 0);
    for (let y = 0; y < CANVAS_HEIGHT; y += 60) ctx.lineTo(x + 20 + hash(i * 7 + y) * 100, y);
    ctx.stroke();
  }
  // A magma waterfall down the back wall, pouring into a glowing pool (far off, parallax)
  const wx = ((600 - camX * 0.2) % 1600 + 1600) % 1600 - 200;
  const wg = ctx.createLinearGradient(wx, 0, wx + 90, 0);
  wg.addColorStop(0, '#7C2D12'); wg.addColorStop(0.5, '#FDBA74'); wg.addColorStop(1, '#7C2D12');
  ctx.fillStyle = wg; ctx.fillRect(wx, 0, 90, CANVAS_HEIGHT - 120);
  ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
  for (let k = 0; k < 6; k++) { const y = (f * 3 + k * 90) % (CANVAS_HEIGHT - 120); ctx.fillRect(wx + 10 + (k % 3) * 25, y, 8, 30); }
  ctx.fillStyle = 'rgba(249, 115, 22, 0.25)'; ctx.beginPath(); ctx.ellipse(wx + 45, CANVAS_HEIGHT - 120, 110, 20, 0, 0, Math.PI * 2); ctx.fill();
  // Lasers sweeping from the rig up top, colors changing on the beat
  const col = NEON[Math.floor(f / BEAT) % NEON.length];
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 2 + Math.sin(f * 0.02 + k * 1.6) * 0.8;
    ctx.save(); ctx.globalAlpha = 0.28; ctx.strokeStyle = col; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(200 + k * 140, 0); ctx.lineTo(200 + k * 140 + Math.cos(a) * 900, Math.sin(a) * 900); ctx.stroke(); ctx.restore();
  }
  // Embers and smoke drifting
  for (let i = 0; i < 26; i++) {
    const x = (hash(i) * CANVAS_WIDTH + Math.sin(f * 0.02 + i) * 20 - camX * 0.25 + 4000) % CANVAS_WIDTH;
    const y = CANVAS_HEIGHT - ((f * (0.4 + hash(i + 2)) + hash(i + 4) * CANVAS_HEIGHT) % CANVAS_HEIGHT);
    ctx.fillStyle = i % 3 ? '#F97316' : '#F472B6'; ctx.fillRect(x, y, 2, 2);
  }
};

// ---------------------------------------------------------------------------
// The world, behind what moves
// ---------------------------------------------------------------------------

export const drawClubBack = (ctx: Ctx, state: GameState) => {
  const F = COURSE.floor, A = COURSE.atrium, f = state.frame;
  if (visible(state, F.x1, F.x2)) {
    // The club's name up on the wall, in neon, buzzing
    for (let x = F.x1 + 300; x < F.x2 - 300; x += 1200) {
      if (!visible(state, x - 200, x + 200)) continue;
      const on = hash(Math.floor(f / 7) + x) > 0.04;
      ctx.save(); ctx.font = 'bold 26px "Press Start 2P"'; ctx.textAlign = 'center';
      ctx.shadowColor = '#FB923C'; ctx.shadowBlur = on ? 18 : 0; ctx.fillStyle = on ? '#FDBA74' : '#7C2D12';
      ctx.fillText('CLUB CALDERA', x, Y - 300); ctx.restore();
    }
    // Lava lamps as tall as pillars, blobs rising and sinking in them
    for (let x = F.x1 + 560; x < F.x2 - 100; x += 700) {
      if (!visible(state, x - 60, x + 60)) continue;
      ctx.fillStyle = '#1C1917'; ctx.fillRect(x - 26, Y - 40, 52, 40); ctx.fillRect(x - 20, Y - 330, 40, 20);
      const lg = ctx.createLinearGradient(x - 22, 0, x + 22, 0); lg.addColorStop(0, 'rgba(190, 18, 60, 0.7)'); lg.addColorStop(0.5, 'rgba(244, 63, 94, 0.85)'); lg.addColorStop(1, 'rgba(190, 18, 60, 0.7)');
      ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(x - 16, Y - 310); ctx.lineTo(x + 16, Y - 310); ctx.lineTo(x + 24, Y - 40); ctx.lineTo(x - 24, Y - 40); ctx.closePath(); ctx.fill();
      for (let k = 0; k < 4; k++) { const ph = ((f * 0.4 + k * 70 + x) % 260) / 260, by = Y - 50 - Math.sin(ph * Math.PI) * 240; ctx.fillStyle = '#FDE047'; ctx.beginPath(); ctx.ellipse(x + Math.sin(k + f * 0.01) * 6, by, 9 + k * 2, 12 + (k % 2) * 6, 0, 0, Math.PI * 2); ctx.fill(); }
    }
  }
  drawFloors(ctx, state);
  drawSolids(ctx, state);
  if (visible(state, A.x1 - 400, A.x2 + 100)) drawAtrium(ctx, state);
};

/** The dance floor (and every floor in here): glass tiles over lava, lit from under, pulsing to the beat. */
const drawFloors = (ctx: Ctx, state: GameState) => {
  const f = state.frame, bottom = state.camera.y + CANVAS_HEIGHT + 40, k = beatK(f);
  for (const r of state.groundRuns) {
    if (r.surface !== 'clubfloor' || !visible(state, r.x1, r.x2)) continue;
    const x1 = Math.max(r.x1, state.camera.x - 220), x2 = Math.min(r.x2, state.camera.x + CANVAS_WIDTH + 220);
    // The lava under the glass
    const g = ctx.createLinearGradient(0, Y, 0, Y + 90);
    g.addColorStop(0, '#FB923C'); g.addColorStop(0.4, '#B91C1C'); g.addColorStop(1, '#2A0505');
    ctx.fillStyle = g; ctx.fillRect(x1, Y, x2 - x1, bottom - Y);
    // The tiles over it: dark glass, some lit up on the beat in a moving pattern
    for (let x = Math.floor(x1 / 48) * 48; x < x2; x += 48) {
      const lit = (Math.floor(x / 48) + Math.floor(f / BEAT)) % 4 === 0;
      ctx.fillStyle = lit ? `rgba(253, 186, 116, ${0.35 + k * 0.35})` : 'rgba(20, 6, 6, 0.72)';
      ctx.fillRect(x + 1, Y, 46, 22);
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(x + 1, Y, 46, 2);
    }
    ctx.fillStyle = '#0C0A09'; ctx.fillRect(x1, Y + 22, x2 - x1, 6);
  }
};

/** The bar (obsidian, glowing bottles along the back of it, stools) and the speaker stacks. */
const drawSolids = (ctx: Ctx, state: GameState) => {
  const f = state.frame, k = beatK(f);
  for (const s of COURSE.solids) {
    if (!visible(state, s.x, s.x + s.w)) continue;
    if (s.look === 'bar') {
      // Shelves of bottles behind it, lit
      ctx.fillStyle = '#1C1917'; ctx.fillRect(s.x - 10, s.y - 150, s.w + 20, 110);
      for (let row = 0; row < 3; row++) for (let bx = s.x; bx < s.x + s.w; bx += 14) {
        ctx.fillStyle = NEON[(bx / 14 + row) % 4 | 0]; ctx.globalAlpha = 0.75; ctx.fillRect(bx + 2, s.y - 140 + row * 34, 6, 22); ctx.fillRect(bx + 3, s.y - 146 + row * 34, 4, 6); ctx.globalAlpha = 1;
      }
      // The counter: obsidian, a lit edge, a lava stripe down the front
      ctx.fillStyle = '#0F0A0A'; ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.fillStyle = '#44403C'; ctx.fillRect(s.x - 6, s.y, s.w + 12, 6);
      ctx.fillStyle = `rgba(249, 115, 22, ${0.6 + k * 0.4})`; ctx.fillRect(s.x, s.y + 20, s.w, 4);
      for (const sx of [s.x - 30, s.x + s.w + 10]) { ctx.fillStyle = '#292524'; ctx.fillRect(sx, s.y + 16, 22, 5); ctx.fillRect(sx + 9, s.y + 21, 4, s.h - 21); }
    } else {
      // Speakers stacked: cabinets, cones thumping on the beat
      for (let y = s.y; y < s.y + s.h; y += 30) {
        ctx.fillStyle = '#18181B'; ctx.fillRect(s.x, y, s.w, 29);
        const r = 10 + k * 2;
        for (const cx of [s.x + s.w * 0.3, s.x + s.w * 0.72]) { ctx.fillStyle = '#3F3F46'; ctx.beginPath(); ctx.arc(cx, y + 15, r, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#0A0A0A'; ctx.beginPath(); ctx.arc(cx, y + 15, r * 0.4, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.fillStyle = '#FB923C'; ctx.fillRect(s.x, s.y, s.w, 2);
    }
  }
};

/** The atrium: glossy black walls with neon run up them, a lava lamp the height of it, the staircase at its foot. */
const drawAtrium = (ctx: Ctx, state: GameState) => {
  const A = COURSE.atrium, f = state.frame;
  const top = Math.max(A.top - 520, state.camera.y - 20), bottom = Math.min(A.floor + 200, state.camera.y + CANVAS_HEIGHT + 20);
  const back = ctx.createLinearGradient(A.x1, 0, A.x2, 0);
  back.addColorStop(0, '#0B0710'); back.addColorStop(0.5, '#150B1E'); back.addColorStop(1, '#0B0710');
  ctx.fillStyle = back; ctx.fillRect(A.x1, top, A.x2 - A.x1, bottom - top);
  // The lava lamp, the height of the whole thing: a glass column, blobs rising in it
  const lx = A.x1 + (A.x2 - A.x1) / 2 - 30;
  const lamp = ctx.createLinearGradient(lx, 0, lx + 60, 0);
  lamp.addColorStop(0, 'rgba(124, 45, 18, 0.55)'); lamp.addColorStop(0.5, 'rgba(234, 88, 12, 0.6)'); lamp.addColorStop(1, 'rgba(124, 45, 18, 0.55)');
  ctx.fillStyle = lamp; ctx.fillRect(lx, top, 60, bottom - top);
  for (let y = Math.floor(top / 140) * 140; y < bottom; y += 140) {
    const by = y - ((f * 0.8) % 140);
    ctx.fillStyle = 'rgba(254, 215, 170, 0.8)'; ctx.beginPath(); ctx.ellipse(lx + 30 + Math.sin(y * 0.01 + f * 0.02) * 10, by, 16, 24, 0, 0, Math.PI * 2); ctx.fill();
  }
  // Neon strips up the back wall, cycling on the beat
  for (let i = 0; i < 4; i++) {
    const x = A.x1 + 60 + i * ((A.x2 - A.x1 - 120) / 3);
    if (Math.abs(x - lx - 30) < 60) continue;
    ctx.save(); ctx.strokeStyle = NEON[(i + Math.floor(f / BEAT)) % 4]; ctx.shadowColor = ctx.strokeStyle as string; ctx.shadowBlur = 10; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke(); ctx.restore();
  }
  // The side walls: glossy black, a neon edge
  for (const [x, edge] of [[A.x1 - 60, A.x1 - 2], [A.x2, A.x2 + 2]] as [number, number][]) {
    ctx.fillStyle = '#09070C'; ctx.fillRect(x, top, 60, bottom - top);
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(x + 8, top, 6, bottom - top);
    ctx.save(); ctx.strokeStyle = '#F472B6'; ctx.shadowColor = '#F472B6'; ctx.shadowBlur = 8; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(edge, top); ctx.lineTo(edge, bottom); ctx.stroke(); ctx.restore();
  }
  // The way in from the floor under the left wall stays open
  ctx.fillStyle = '#150B1E'; ctx.fillRect(A.x1 - 60, A.floor - 170, 60, 170);
  // At the foot of it: the stairwell down to the front door (the club floor's up here; the door's down at the foot of
  // the volcano). Cut away under the floor: the stairs going down, a handrail, the door at the bottom; a steel grate over
  // the top of them in the floor, and an EXIT sign on the wall pointing down. Just there to be seen: he can't take it
  const sx = A.x1 + 40, sw = 300, sy = A.floor;
  if (sy > state.camera.y - 300 && sy - 200 < state.camera.y + CANVAS_HEIGHT) {
    const bot = state.camera.y + CANVAS_HEIGHT + 40;
    // The stairwell: bare concrete, lit by a caged bulb
    ctx.fillStyle = '#110E15'; ctx.fillRect(sx, sy, sw, bot - sy);
    ctx.fillStyle = 'rgba(253, 230, 138, 0.10)'; ctx.beginPath(); ctx.arc(sx + 40, sy + 40, 70, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FDE68A'; ctx.fillRect(sx + 36, sy + 30, 8, 8);
    // The steps, down to the right
    const n = 11, rise = 22, run = 24;
    for (let k = 0; k < n; k++) {
      const x = sx + 10 + k * run, y = sy + 30 + k * rise;
      ctx.fillStyle = '#57505F'; ctx.fillRect(x, y, sw - 10 - k * run, bot - y);
      ctx.fillStyle = '#A59DB0'; ctx.fillRect(x, y, run, 4);
      ctx.fillStyle = '#3A3441'; ctx.fillRect(x, y + 4, 3, rise - 4);
    }
    // The handrail, following them down
    ctx.strokeStyle = '#D4D4D8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx + 10, sy - 6); ctx.lineTo(sx + 10 + n * run, sy - 6 + n * rise); ctx.stroke();
    ctx.fillStyle = '#A1A1AA'; for (let k = 0; k < n; k += 2) ctx.fillRect(sx + 20 + k * run, sy - 6 + k * rise, 2, 36);
    // The front door at the bottom
    const dx = sx + 10 + n * run - 30, dy = sy + 30 + n * rise;
    ctx.fillStyle = '#1C1917'; ctx.fillRect(dx, dy - 110, 60, 110);
    ctx.fillStyle = '#44403C'; ctx.fillRect(dx + 6, dy - 104, 48, 104);
    // The grate over the top of it (the floor he's standing on)
    ctx.fillStyle = 'rgba(12, 10, 9, 0.35)'; ctx.fillRect(sx, sy, sw, 22);
    ctx.fillStyle = '#71717A'; ctx.fillRect(sx, sy, sw, 3); ctx.fillRect(sx, sy + 19, sw, 3);
    for (let x = sx; x <= sx + sw; x += 12) ctx.fillRect(x, sy, 2, 22);
    // The EXIT sign on the wall over it, an arrow pointing down
    const ex = sx + sw / 2 - 40, ey = sy - 150;
    ctx.fillStyle = '#16A34A'; ctx.fillRect(ex, ey, 80, 22);
    ctx.fillStyle = '#F0FDF4'; ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'left'; ctx.fillText('EXIT', ex + 8, ey + 15);
    ctx.beginPath(); ctx.moveTo(ex + 58, ey + 5); ctx.lineTo(ex + 66, ey + 5); ctx.lineTo(ex + 66, ey + 11); ctx.lineTo(ex + 71, ey + 11); ctx.lineTo(ex + 62, ey + 19); ctx.lineTo(ex + 53, ey + 11); ctx.lineTo(ex + 58, ey + 11); ctx.closePath(); ctx.fill();
  }
  // The window at the top of the right wall: the VIP lounge, its party going on behind the glass
  const w = A.window;
  if (w.y > state.camera.y - 200 && w.y < state.camera.y + CANVAS_HEIGHT + 200) {
    const g = ctx.createLinearGradient(w.x - 20, w.y - 60, w.x - 20, w.y + 60);
    g.addColorStop(0, '#A855F7'); g.addColorStop(1, '#EC4899');
    ctx.fillStyle = g; ctx.fillRect(w.x - 10, w.y - 60, 60, 120);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    for (let i = 0; i < 2; i++) { const px = w.x + 5 + ((f * 0.4 + i * 30) % 40); ctx.fillRect(px, w.y - 20, 10, 60); ctx.beginPath(); ctx.arc(px + 5, w.y - 26, 6, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = '#CA8A04'; ctx.lineWidth = 4; ctx.strokeRect(w.x - 10, w.y - 60, 60, 120);
    ctx.fillStyle = '#FDE68A'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('VIP', w.x + 20, w.y - 68); ctx.textAlign = 'left';
  }
};

// ---------------------------------------------------------------------------
// Over the terrain: the club's ledges, and its pyro and disco rigs
// ---------------------------------------------------------------------------

/** A ledge of the club's (a neon catwalk, a go-go cage, the DJ booth): true if it was one of those (drawn here). */
export const drawClubLedge = (ctx: Ctx, l: Ledge, f: number) => {
  const k = beatK(f);
  if (l.look === 'neon') {
    const col = NEON[(Math.floor(l.x / 97) + Math.floor(f / BEAT)) % 4];
    // Brushed steel (bright against the black walls), a neon strip along the top, lit underneath
    ctx.fillStyle = '#A1A1AA'; ctx.fillRect(l.x, l.y, l.w, 10);
    ctx.fillStyle = '#D4D4D8'; ctx.fillRect(l.x, l.y + 3, l.w, 2);
    ctx.fillStyle = '#52525B'; ctx.fillRect(l.x, l.y + 8, l.w, 2);
    for (let x = l.x + 12; x < l.x + l.w - 6; x += 24) { ctx.fillStyle = '#3F3F46'; ctx.fillRect(x, l.y + 5, 2, 2); }
    ctx.save(); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 8 + k * 8; ctx.fillRect(l.x, l.y, l.w, 3); ctx.globalAlpha = 0.35 + k * 0.3; ctx.fillRect(l.x + 4, l.y + 10, l.w - 8, 2); ctx.restore();
    ctx.fillStyle = '#71717A'; ctx.fillRect(l.x + 10, l.y + 10, 4, 16); ctx.fillRect(l.x + l.w - 14, l.y + 10, 4, 16);
    return true;
  }
  if (l.look === 'cage') {
    // A go-go cage on a chain from the ceiling: its floor's the ledge
    ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(l.x + l.w / 2, l.y - 90); ctx.lineTo(l.x + l.w / 2, -3000); ctx.stroke();
    ctx.strokeStyle = '#D4AF37'; ctx.lineWidth = 2;
    for (let x = l.x; x <= l.x + l.w; x += l.w / 5) { ctx.beginPath(); ctx.moveTo(x, l.y); ctx.lineTo(l.x + l.w / 2 + (x - l.x - l.w / 2) * 0.6, l.y - 90); ctx.stroke(); }
    ctx.fillStyle = '#D4AF37'; ctx.fillRect(l.x - 2, l.y, l.w + 4, 7);
    ctx.save(); ctx.fillStyle = '#F472B6'; ctx.shadowColor = '#F472B6'; ctx.shadowBlur = 6 + k * 6; ctx.fillRect(l.x, l.y + 7, l.w, 2); ctx.restore();
    return true;
  }
  if (l.look === 'booth') {
    // The DJ booth: the decks on top (the platter spinning), a lit front
    ctx.fillStyle = '#18181B'; ctx.fillRect(l.x, l.y, l.w, Y - l.y);
    ctx.save(); ctx.fillStyle = '#FB923C'; ctx.shadowColor = '#FB923C'; ctx.shadowBlur = 10 + k * 10; ctx.font = 'bold 10px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('DJ MAGMA', l.x + l.w / 2, l.y + 40); ctx.restore();
    ctx.fillStyle = `rgba(249, 115, 22, ${0.4 + k * 0.5})`; ctx.fillRect(l.x, l.y + 52, l.w, 4);
    for (const dx of [30, l.w - 30]) { ctx.fillStyle = '#3F3F46'; ctx.beginPath(); ctx.ellipse(l.x + dx, l.y - 2, 18, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#FDE047'; ctx.fillRect(l.x + dx + Math.cos(f * 0.3) * 12, l.y - 3 + Math.sin(f * 0.3) * 3, 2, 2); }
    ctx.fillStyle = '#A1A1AA'; ctx.fillRect(l.x, l.y, l.w, 3);
    return true;
  }
  return false;
};

// ---------------------------------------------------------------------------
// In front: the screaming
// ---------------------------------------------------------------------------

export const drawClubFront = (ctx: Ctx, state: GameState) => {
  const rt = getVictor(state);
  const y = rt?.club.yell;
  if (!y) return;
  const e = state.enemies.find(q => q.id === y.id);
  if (!e || e.health <= 0) return;
  const text = sentenceShown(y.text);
  ctx.save(); ctx.font = 'bold 8px "Press Start 2P"';
  const w = Math.min(420, ctx.measureText(text).width + 14), cx = e.pos.x + e.width / 2, by = e.pos.y - 30;
  ctx.fillStyle = '#FFF1F2'; ctx.strokeStyle = '#BE123C'; ctx.lineWidth = 2;
  ctx.fillRect(cx - w / 2, by - 20, w, 18); ctx.strokeRect(cx - w / 2, by - 20, w, 18);
  ctx.beginPath(); ctx.moveTo(cx - 5, by - 2); ctx.lineTo(cx + 5, by - 2); ctx.lineTo(cx, by + 6); ctx.fill();
  ctx.fillStyle = '#881337'; ctx.textAlign = 'center'; ctx.fillText(text, cx, by - 7, w - 8);
  ctx.restore();
};

// ---------------------------------------------------------------------------
// The HUD: the tally
// ---------------------------------------------------------------------------

export const drawInnocentsTally = (ctx: Ctx, state: GameState) => {
  const rt = getVictor(state);
  if (!rt || rt.club.killed <= 0 || rt.club.tallyGone || regionOf(state.player.pos.x) !== 'club') return;
  const n = rt.club.killed, since = state.frame - rt.club.killedAt;
  const jolt = since < 12 ? (1 - since / 12) : 0;
  const cx = CANVAS_WIDTH / 2, y = 64;
  ctx.save();
  ctx.translate(cx, y); ctx.scale(1 + jolt * 0.25, 1 + jolt * 0.25); ctx.rotate(Math.sin(since * 0.8) * 0.05 * jolt);
  ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(-150, -26, 300, 58);
  ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 3; ctx.strokeRect(-150, -26, 300, 58);
  ctx.textAlign = 'center';
  ctx.font = 'bold 10px "Press Start 2P"'; ctx.fillStyle = '#FCA5A5'; ctx.fillText('INNOCENTS KILLED', 0, -8);
  ctx.font = 'bold 20px "Press Start 2P"'; ctx.fillStyle = jolt > 0 ? '#FFFFFF' : '#EF4444'; ctx.fillText(String(n), 0, 18);
  ctx.font = 'bold 7px "Press Start 2P"'; ctx.fillStyle = '#FDE047'; ctx.fillText(tallyTitle(n), 0, 30);
  ctx.restore();
};
