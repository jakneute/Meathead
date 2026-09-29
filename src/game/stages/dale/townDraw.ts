// Deadwood Gulch, drawn: the dirt street with its wagon ruts, the boardwalks,
// the false fronts (saloon, general store, barber, bank, the grand hotel, the
// livery, the assay office, the chapel and its bell tower), the porch roofs, the
// welcome arch, the curio shop with the fourth truck's cab in it, the photo
// cutouts and barrels and hay bales, the fake jail with the guy in it and the
// "sheriff" outside, Dale's pharmacy at the end. The ninja up the tower, his
// crosshair. Riggs on the warpath. The INCOMING meter.

import { drawSkipPrompt } from '../../platform/skip';
import type { GameState } from '../../core/state';
import type { GroundRun } from '../../core/terrain';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, BOSS_DOOR_X } from '../../../constants';
import { COURSE, Building, Awning } from './course';
import type { DaleRuntime } from './runtime';
import { Town, TownProp, CAB, ninjaSpot, incoming, jailWrecked, townStains, muzzle, laserEnd, NINJA_CUT, NINJA_DONE, JAIL_SKIP_AFTER } from './town';
import { drawDaleKind } from '../../render/enemies/dale';
import { drawPlayer } from '../../render/player/player';
import { saying, drawBubble } from './script';
import { visible, hash } from './draw';
import { wheelTurn } from '../../render/bosses/daleTruck';

type Ctx = CanvasRenderingContext2D;
const Y = GROUND_Y;

// ---------------------------------------------------------------------------
// Behind everything that moves
// ---------------------------------------------------------------------------

export const drawTownBack = (ctx: Ctx, state: GameState, rt: DaleRuntime) => {
  const t = COURSE.town;
  for (const r of state.groundRuns) if (r.surface === 'street' && visible(state, r.x1, r.x2)) drawStreet(ctx, state, r);
  // Where Riggs ran the tourists down: blood across the street, drag marks after it, the way he was going
  for (const sx of townStains(state)) {
    if (!visible(state, sx - 80, sx + 120)) continue;
    ctx.fillStyle = 'rgba(127, 29, 29, 0.9)'; ctx.beginPath(); ctx.ellipse(sx, Y + 3, 30 + hash(sx) * 16, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(153, 27, 27, 0.8)'; for (let k = 0; k < 6; k++) ctx.fillRect(sx + 10 + k * 14, Y + 1 + (k % 2), 10 - k, 2);
    for (let k = 0; k < 5; k++) { const bx = sx - 20 + hash(sx + k) * 70; ctx.beginPath(); ctx.arc(bx, Y + 2 - hash(sx * k) * 3, 2 + hash(sx + k * 3) * 3, 0, Math.PI * 2); ctx.fill(); }
  }
  if (visible(state, t.x1 - 100, t.x1 + 400)) drawCurioShop(ctx, t.x1, rt.town.shopHit);
  if (visible(state, t.arch - 200, t.arch + 200)) drawArch(ctx, t.arch);
  for (const b of COURSE.buildings) if (visible(state, b.x1 - 60, b.x2 + 60)) drawBuilding(ctx, state, b);
  for (const a of COURSE.awnings) if (visible(state, a.x, a.x + a.w)) drawAwning(ctx, state, a);
  // The hotel's balcony
  const bal = COURSE.ledges.find(l => l.look === 'balcony');
  if (bal && visible(state, bal.x, bal.x + bal.w)) {
    ctx.fillStyle = '#78350F'; ctx.fillRect(bal.x, bal.y, bal.w, 8);
    ctx.fillStyle = '#92400E'; for (let x = bal.x; x <= bal.x + bal.w; x += 16) ctx.fillRect(x, bal.y - 30, 3, 30);
    ctx.fillRect(bal.x, bal.y - 32, bal.w, 4);
  }
  if (visible(state, t.jail.x1 - 200, t.jail.x2 + 100)) drawJail(ctx, state, rt.town);
  if (visible(state, t.pharmacy - 100, BOSS_DOOR_X + 40)) drawPharmacy(ctx, state, t.pharmacy);
};

/** The street: packed dirt, wagon ruts, hoofprints; the ground under it. */
const drawStreet = (ctx: Ctx, state: GameState, r: GroundRun) => {
  const bottom = state.camera.y + CANVAS_HEIGHT + 60;
  ctx.fillStyle = '#A0703F'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, bottom - r.y1);
  ctx.fillStyle = '#C08A55'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 4);
  ctx.fillStyle = '#8A5A30';
  const x0 = Math.max(r.x1, state.camera.x - 40), x1 = Math.min(r.x2, state.camera.x + CANVAS_WIDTH + 40);
  ctx.fillRect(x0, r.y1 + 14, x1 - x0, 3); ctx.fillRect(x0, r.y1 + 30, x1 - x0, 3);
  for (let x = Math.floor(x0 / 26) * 26; x < x1; x += 26) { ctx.fillStyle = hash(x) > 0.5 ? '#7A4A24' : '#B07B45'; ctx.fillRect(x + hash(x + 1) * 10, r.y1 + 8 + hash(x + 2) * 40, 4, 2); }
};

/** A false front: the facade (its top edge is the roof you can walk on), its sign, windows, a door. */
const PAINT: Record<Building['look'], { wall: string; trim: string; sign: string; ink: string }> = {
  saloon: { wall: '#8B4513', trim: '#5A2A0A', sign: '#F5DEB3', ink: '#7F1D1D' },
  store: { wall: '#6B8E23', trim: '#3F5A12', sign: '#FFF8DC', ink: '#1E3A8A' },
  barber: { wall: '#B22222', trim: '#7A1010', sign: '#F8FAFC', ink: '#1E3A8A' },
  bank: { wall: '#A9A9A9', trim: '#4B5563', sign: '#1F2937', ink: '#FACC15' },
  hotel: { wall: '#4682B4', trim: '#274C6B', sign: '#FFF8DC', ink: '#7F1D1D' },
  livery: { wall: '#A0522D', trim: '#5A2A10', sign: '#F5DEB3', ink: '#1C1917' },
  assay: { wall: '#DAA520', trim: '#8A6408', sign: '#1C1917', ink: '#FDE68A' },
  church: { wall: '#F5F5F4', trim: '#A8A29E', sign: '#F5F5F4', ink: '#1C1917' },
};

const drawBuilding = (ctx: Ctx, state: GameState, b: Building) => {
  const c = PAINT[b.look];
  const w = b.x2 - b.x1;
  // The wall, clapboard
  ctx.fillStyle = c.wall; ctx.fillRect(b.x1, b.top, w, Y - b.top);
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = b.top + 8; y < Y; y += 10) ctx.fillRect(b.x1, y, w, 2);
  // Cornice along the top (the roof line), corner boards
  ctx.fillStyle = c.trim; ctx.fillRect(b.x1 - 6, b.top - 4, w + 12, 12); ctx.fillRect(b.x1, b.top, 8, Y - b.top); ctx.fillRect(b.x2 - 8, b.top, 8, Y - b.top);
  for (let x = b.x1; x < b.x2; x += 20) ctx.fillRect(x, b.top + 8, 6, 5);
  if (b.look === 'church') { drawChapel(ctx, state, b); return; }
  // The sign
  const sy = b.top + 20;
  ctx.fillStyle = c.sign; ctx.fillRect(b.x1 + 20, sy, w - 40, 34);
  ctx.strokeStyle = c.trim; ctx.lineWidth = 3; ctx.strokeRect(b.x1 + 20, sy, w - 40, 34);
  ctx.fillStyle = c.ink; ctx.font = `bold ${w > 330 ? 13 : 10}px "Press Start 2P"`; ctx.textAlign = 'center';
  ctx.fillText(b.name, (b.x1 + b.x2) / 2, sy + 23, w - 50); ctx.textAlign = 'left';
  // Upstairs windows
  const wy = sy + 50;
  if (Y - 130 - wy > 40) for (let x = b.x1 + 40; x < b.x2 - 60; x += 90) {
    ctx.fillStyle = '#1E293B'; ctx.fillRect(x, wy, 34, 44);
    ctx.fillStyle = 'rgba(253, 230, 138, 0.35)'; ctx.fillRect(x + 2, wy + 2, 30, 40);
    ctx.fillStyle = c.trim; ctx.fillRect(x - 3, wy - 3, 40, 4); ctx.fillRect(x + 15, wy, 3, 44); ctx.fillRect(x, wy + 20, 34, 3);
  }
  // Downstairs: the door (saloon doors, for the saloon), a window, a bench
  const dx = b.x1 + w * 0.5 - 20;
  ctx.fillStyle = '#1C1917'; ctx.fillRect(dx, Y - 96, 40, 96);
  if (b.look === 'saloon') { ctx.fillStyle = '#A0522D'; const sw = Math.sin(state.frame * 0.05) * 3; ctx.fillRect(dx + 2, Y - 80 + sw, 17, 44); ctx.fillRect(dx + 21, Y - 80 - sw, 17, 44); }
  if (b.look === 'barber') { ctx.fillStyle = '#F8FAFC'; ctx.fillRect(dx - 30, Y - 90, 12, 60); ctx.fillStyle = '#DC2626'; for (let k = 0; k < 5; k++) ctx.fillRect(dx - 30, Y - 90 + ((k * 14 + state.frame) % 60), 12, 5); }
  if (b.look === 'bank') { ctx.fillStyle = '#FACC15'; ctx.font = 'bold 18px "Press Start 2P"'; ctx.fillText('$', dx + 12, Y - 110); }
  if (w > 220) { ctx.fillStyle = '#334155'; ctx.fillRect(b.x1 + 26, Y - 90, 60, 50); ctx.fillStyle = 'rgba(253,230,138,0.3)'; ctx.fillRect(b.x1 + 28, Y - 88, 56, 46); }
};

/** The chapel: white clapboard, a steeple with a bell in it (and the ninja up there, drawn with the rest that moves). */
const drawChapel = (ctx: Ctx, state: GameState, b: Building) => {
  const t = COURSE.town.tower;
  const tx = t.x - 110, tw = 220;
  // The belfry up off the roof
  ctx.fillStyle = '#F5F5F4'; ctx.fillRect(tx, t.top - 80, tw, b.top - (t.top - 80));
  ctx.fillStyle = '#1C1917'; ctx.fillRect(tx + 16, t.top - 70, tw - 32, 64);
  ctx.fillStyle = '#A16207'; ctx.beginPath(); ctx.arc(t.x, t.top - 48, 14, Math.PI, 0); ctx.fill(); ctx.fillRect(t.x - 16, t.top - 48, 32, 8);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(tx - 6, t.top - 4, tw + 12, 8);
  // His nest: sandbags along the rail, a spotting scope, a ghillie net hung up out of the sun
  for (let k = 0; k < 7; k++) { ctx.fillStyle = k % 2 ? '#A8916B' : '#BFA77F'; ctx.beginPath(); ctx.ellipse(tx + 14 + k * 16, t.top - 10, 10, 6, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#3F6212'; ctx.beginPath(); ctx.moveTo(tx + 16, t.top - 70); ctx.lineTo(tx + tw - 16, t.top - 70); ctx.lineTo(tx + tw - 30, t.top - 52); ctx.lineTo(tx + 30, t.top - 56); ctx.fill();
  ctx.fillStyle = '#27272A'; ctx.fillRect(tx + tw - 40, t.top - 22, 18, 6); ctx.fillRect(tx + tw - 34, t.top - 16, 3, 12);
  // The steeple, a cross
  ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.moveTo(tx - 8, t.top - 80); ctx.lineTo(t.x, t.top - 170); ctx.lineTo(tx + tw + 8, t.top - 80); ctx.fill();
  ctx.fillStyle = '#FACC15'; ctx.fillRect(t.x - 2, t.top - 200, 4, 32); ctx.fillRect(t.x - 10, t.top - 190, 20, 4);
  // Arched windows, the doors
  ctx.fillStyle = '#93C5FD'; for (const x of [b.x1 + 30, b.x2 - 60]) { ctx.beginPath(); ctx.roundRect(x, b.top + 60, 30, 60, [15, 15, 0, 0]); ctx.fill(); }
  ctx.fillStyle = '#78350F'; ctx.beginPath(); ctx.roundRect((b.x1 + b.x2) / 2 - 26, Y - 110, 52, 110, [26, 26, 0, 0]); ctx.fill();
  ctx.fillStyle = '#1C1917'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('WEDDINGS $49.99', (b.x1 + b.x2) / 2, b.top + 40); ctx.textAlign = 'left';
  void state;
};

/** A porch roof on posts, out over the boardwalk: striped canvas, springy. */
const drawAwning = (ctx: Ctx, state: GameState, a: Awning) => {
  // The boardwalk under it
  ctx.fillStyle = '#8B5A2B'; ctx.fillRect(a.x, Y - 8, a.w, 8);
  ctx.fillStyle = '#6B4423'; for (let x = a.x; x < a.x + a.w; x += 14) ctx.fillRect(x, Y - 8, 2, 8);
  // Posts
  ctx.fillStyle = '#5A3A1A'; ctx.fillRect(a.x + 4, a.y, 8, Y - a.y); ctx.fillRect(a.x + a.w - 12, a.y, 8, Y - a.y);
  // The roof: flexes when someone's just bounced off it
  const p = state.player;
  const bounced = p.vel.y < -10 && Math.abs(p.pos.y + p.height - a.y) < 60 && p.pos.x + p.width / 2 > a.x && p.pos.x + p.width / 2 < a.x + a.w;
  const sag = bounced ? 6 : 0;
  ctx.fillStyle = '#7C2D12'; ctx.fillRect(a.x - 4, a.y - 2 + sag, a.w + 8, 6);
  for (let x = a.x; x < a.x + a.w; x += 24) { ctx.fillStyle = ((x - a.x) / 24) % 2 ? '#F8FAFC' : '#DC2626'; ctx.fillRect(x, a.y + 4 + sag, 24, 16); }
  ctx.fillStyle = '#7C2D12'; for (let x = a.x; x < a.x + a.w; x += 12) { ctx.beginPath(); ctx.arc(x + 6, a.y + 20 + sag, 6, 0, Math.PI); ctx.fill(); }
  // Its shade
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(a.x, a.y + 26, a.w, Y - a.y - 34);
};

/** The welcome arch over the street. */
const drawArch = (ctx: Ctx, x: number) => {
  ctx.fillStyle = '#6B4423';
  ctx.fillRect(x - 150, Y - 290, 16, 290); ctx.fillRect(x + 134, Y - 290, 16, 290);
  ctx.fillStyle = '#8B5A2B'; ctx.fillRect(x - 170, Y - 300, 340, 70);
  ctx.strokeStyle = '#5A3A1A'; ctx.lineWidth = 4; ctx.strokeRect(x - 170, Y - 300, 340, 70);
  ctx.fillStyle = '#FEF3C7'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillText('DEADWOOD GULCH', x, Y - 272);
  ctx.font = '6px "Press Start 2P"'; ctx.fillText('AN AUTHENTIC 1880S FRONTIER TOWN', x, Y - 256); ctx.fillText('EST. 1994 - GIFT SHOP OPEN DAILY', x, Y - 244);
  ctx.textAlign = 'left';
  // A cow skull nailed up top
  ctx.fillStyle = '#F5F0E1'; ctx.beginPath(); ctx.ellipse(x, Y - 312, 10, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#F5F0E1'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 8, Y - 316); ctx.quadraticCurveTo(x - 22, Y - 318, x - 26, Y - 330); ctx.moveTo(x + 8, Y - 316); ctx.quadraticCurveTo(x + 22, Y - 318, x + 26, Y - 330); ctx.stroke();
};

/** The curio shop the truck ended up in (the hole's in the side of it). */
const drawCurioShop = (ctx: Ctx, x: number, hit: boolean) => {
  ctx.fillStyle = '#D2B48C'; ctx.fillRect(x, Y - 260, 280, 260);
  ctx.fillStyle = '#8B6B3D'; ctx.fillRect(x - 6, Y - 264, 292, 12);
  ctx.fillStyle = '#FEF3C7'; ctx.fillRect(x + 20, Y - 240, 240, 40); ctx.strokeStyle = '#7F1D1D'; ctx.lineWidth = 3; ctx.strokeRect(x + 20, Y - 240, 240, 40);
  ctx.fillStyle = '#7F1D1D'; ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('TUMBLEWEED CURIOS', x + 140, Y - 222); ctx.font = '6px "Press Start 2P"'; ctx.fillText('& GIFTS - T-SHIRTS - FUDGE', x + 140, Y - 208); ctx.textAlign = 'left';
  if (!hit) {
    // (before the cab comes through it: the shop window, the door, a rack of postcards out front)
    ctx.fillStyle = '#93C5FD'; ctx.fillRect(x + 30, Y - 170, 130, 90); ctx.strokeStyle = '#6B4423'; ctx.lineWidth = 4; ctx.strokeRect(x + 30, Y - 170, 130, 90);
    ctx.fillStyle = '#78350F'; ctx.fillRect(x + 190, Y - 130, 56, 130);
    ctx.fillStyle = '#F472B6'; ctx.fillRect(x + 50, Y - 110, 16, 20); ctx.fillStyle = '#22D3EE'; ctx.fillRect(x + 90, Y - 116, 20, 26);
    return;
  }
  // The hole in it, and the wreckage in the hole
  ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.moveTo(x + 60, Y); ctx.lineTo(x + 50, Y - 160); ctx.lineTo(x + 120, Y - 190); ctx.lineTo(x + 250, Y - 170); ctx.lineTo(x + 280, Y); ctx.fill();
  ctx.fillStyle = '#A0703F'; for (let i = 0; i < 8; i++) ctx.fillRect(x + 50 + i * 30, Y - 12 - (i % 3) * 8, 22, 10);
  ctx.fillStyle = '#F472B6'; ctx.fillRect(x + 90, Y - 30, 14, 12); ctx.fillStyle = '#22D3EE'; ctx.fillRect(x + 200, Y - 26, 18, 10); // souvenirs everywhere
};

/** The fake jail: stone, bars, JAIL; the guy locked in it, the "sheriff" out front. Or what's left. */
const drawJail = (ctx: Ctx, state: GameState, town: Town) => {
  const j = COURSE.town.jail;
  const w = j.x2 - j.x1;
  const f = state.frame;
  if (jailWrecked(state, town)) {
    // Blown open: rubble, the cab buried in it, burning
    ctx.fillStyle = '#57534E'; ctx.fillRect(j.x1, Y - 90, 40, 90); ctx.fillRect(j.x2 - 50, Y - 130, 50, 130);
    ctx.fillStyle = '#78716C'; for (let i = 0; i < 14; i++) ctx.fillRect(j.x1 + 20 + i * 22, Y - 16 - (i % 4) * 12, 26, 14);
    drawCab(ctx, j.x1 + 30 - CAB.w + 120, 1, f, true, 0.18);
    // What's left of the two of them, up the rubble and across the street
    ctx.fillStyle = 'rgba(127, 29, 29, 0.9)';
    ctx.beginPath(); ctx.ellipse(j.x1 + 170, Y - 2, 150, 7, 0, 0, Math.PI * 2); ctx.fill();
    for (let k = 0; k < 22; k++) { const sx = j.x1 + 20 + hash(k + 400) * 300, sy = Y - 20 - hash(k + 401) * 120, r = 3 + hash(k + 402) * 9; ctx.fillStyle = k % 3 ? 'rgba(153, 27, 27, 0.85)' : 'rgba(220, 38, 38, 0.8)'; ctx.beginPath(); ctx.ellipse(sx, sy, r, r * 0.7, hash(k) * 3, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(sx - 1, sy, 2, r * 2.5); }
    ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.ellipse(j.x1 + 250, Y - 6, 12, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(j.x1 + 244, Y - 13, 12, 7); // the souvenir hat
    for (let k = 0; k < 6; k++) { const fx = j.x1 + 30 + k * 50, h = 40 + Math.sin(f * 0.4 + k) * 16; ctx.fillStyle = k % 2 ? 'rgba(249,115,22,0.85)' : 'rgba(253,224,71,0.8)'; ctx.beginPath(); ctx.moveTo(fx - 16, Y - 20); ctx.quadraticCurveTo(fx, Y - 20 - h, fx + 16, Y - 20); ctx.fill(); }
    if (f % 4 === 0) state.particles.push({ pos: { x: j.x1 + 60 + Math.random() * 200, y: Y - 80 }, vel: { x: (Math.random() - 0.5), y: -1.5 }, life: 40, color: '#44403C', size: 8 + Math.random() * 8 });
    return;
  }
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(j.x1, Y - 230, w, 230);
  ctx.fillStyle = '#78716C'; for (let y = Y - 230; y < Y; y += 20) for (let x = j.x1 + ((y / 20) % 2) * 20; x < j.x2; x += 40) ctx.fillRect(x, y, 36, 16);
  ctx.fillStyle = '#44403C'; ctx.fillRect(j.x1 - 6, Y - 236, w + 12, 12);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(j.x1 + 60, Y - 212, 220, 36); ctx.fillStyle = '#FACC15'; ctx.font = 'bold 18px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('JAIL', j.x1 + 170, Y - 186);
  ctx.font = '6px "Press Start 2P"'; ctx.fillStyle = '#F8FAFC'; ctx.fillText('PHOTOS WITH THE SHERIFF $10', j.x1 + 170, Y - 156); ctx.textAlign = 'left';
  // The cell window, and the guy in it
  const cx = j.x1 + 110, cy = Y - 130;
  ctx.fillStyle = '#0C0A09'; ctx.fillRect(cx, cy, 120, 70);
  if (town.prisoner.alive) {
    const shake = Math.sin(f * (town.phase === 'jail' ? 1.3 : 0.6)) * (town.phase === 'jail' ? 5 : 2);
    ctx.fillStyle = '#F2C9A0'; ctx.beginPath(); ctx.arc(cx + 60 + shake, cy + 34, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111827'; ctx.fillRect(cx + 54 + shake, cy + 30, 3, 3); ctx.fillRect(cx + 63 + shake, cy + 30, 3, 3);
    ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.ellipse(cx + 60 + shake, cy + 42, 3, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F2C9A0'; ctx.fillRect(cx + 38, cy + 18 + shake, 8, 14); ctx.fillRect(cx + 74, cy + 18 - shake, 8, 14);
    ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.ellipse(cx + 60 + shake, cy + 20, 14, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(cx + 52 + shake, cy + 12, 16, 8); // the souvenir hat
  }
  ctx.fillStyle = '#374151'; for (let x = cx + 6; x < cx + 120; x += 14) ctx.fillRect(x, cy, 4, 70);
  ctx.fillRect(cx, cy, 120, 4); ctx.fillRect(cx, cy + 66, 120, 4);
  // The door, padlocked
  ctx.fillStyle = '#44403C'; ctx.fillRect(j.x2 - 70, Y - 110, 50, 110); ctx.fillStyle = '#FACC15'; ctx.fillRect(j.x2 - 36, Y - 60, 8, 10);
};

/** Dale's pharmacy: adobe, a green neon cross, the sign. Its door's his. */
const drawPharmacy = (ctx: Ctx, state: GameState, x: number) => {
  const f = state.frame;
  const w = BOSS_DOOR_X - x + 40;
  ctx.fillStyle = '#D6A77A'; ctx.fillRect(x, Y - 280, w, 280);
  ctx.fillStyle = '#B5703D'; ctx.fillRect(x - 6, Y - 286, w + 12, 16);
  ctx.fillStyle = '#8B5A2B'; for (let k = 0; k < 8; k++) ctx.fillRect(x + 20 + k * 52, Y - 270, 10, 8); // vigas
  ctx.fillStyle = '#1F2937'; ctx.fillRect(x + 30, Y - 250, w - 60, 46);
  const on = Math.floor(f / 40) % 6 !== 0;
  ctx.fillStyle = on ? '#4ADE80' : '#14532D'; ctx.font = 'bold 13px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillText("DALE'S PHARMACY", x + w / 2 - 10, Y - 222);
  ctx.font = '6px "Press Start 2P"'; ctx.fillStyle = '#F472B6'; ctx.fillText('WE FILL ANY PRESCRIPTION. NO QUESTIONS.', x + w / 2 - 10, Y - 210); ctx.textAlign = 'left';
  // The neon cross
  const cx = x + 60, cy = Y - 160;
  ctx.fillStyle = on ? '#22C55E' : '#14532D'; ctx.fillRect(cx - 8, cy - 24, 16, 48); ctx.fillRect(cx - 24, cy - 8, 48, 16);
  if (on) { ctx.fillStyle = 'rgba(74, 222, 128, 0.25)'; ctx.beginPath(); ctx.arc(cx, cy, 44, 0, Math.PI * 2); ctx.fill(); }
  drawOpenSign(ctx, x + 132, Y - 160, f);
};

/** The OPEN 24/7 marquee: a Vegas-style board, chasing bulbs round the edge, a neon pill, a starburst, the fine print. */
const drawOpenSign = (ctx: Ctx, x: number, y: number, f: number) => {
  const w = 190, h = 96;
  // The board, gold-framed
  const board = ctx.createLinearGradient(0, y, 0, y + h);
  board.addColorStop(0, '#4C1D95'); board.addColorStop(1, '#1E1B4B');
  ctx.fillStyle = '#B45309'; ctx.fillRect(x - 6, y - 6, w + 12, h + 12);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
  ctx.fillStyle = board; ctx.fillRect(x, y, w, h);
  // Bulbs chasing round it
  const bulbs: [number, number][] = [];
  for (let bx = x + 6; bx < x + w; bx += 12) { bulbs.push([bx, y - 1]); }
  for (let by = y + 11; by < y + h; by += 12) bulbs.push([x + w + 1, by]);
  for (let bx = x + w - 6; bx > x; bx -= 12) bulbs.push([bx, y + h + 1]);
  for (let by = y + h - 11; by > y; by -= 12) bulbs.push([x - 1, by]);
  bulbs.forEach(([bx, by], i) => {
    const lit = (i + Math.floor(f / 5)) % 3 === 0;
    ctx.fillStyle = lit ? '#FEF9C3' : '#92400E'; ctx.beginPath(); ctx.arc(bx, by, 2.6, 0, Math.PI * 2); ctx.fill();
    if (lit) { ctx.fillStyle = 'rgba(254, 240, 138, 0.35)'; ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill(); }
  });
  // The neon: OPEN (flickering, the N going now and then), 24/7 big underneath
  const buzz = Math.floor(f / 7) % 23 === 0;
  ctx.textAlign = 'center';
  ctx.font = 'bold 15px "Press Start 2P"';
  ctx.fillStyle = 'rgba(244, 114, 182, 0.35)'; ctx.fillText('OPEN', x + 70, y + 30);
  ctx.fillStyle = '#F9A8D4'; ctx.fillText(buzz ? 'OPE ' : 'OPEN', x + 69, y + 29);
  ctx.font = 'bold 22px "Press Start 2P"';
  ctx.fillStyle = 'rgba(34, 211, 238, 0.35)'; ctx.fillText('24/7', x + 72, y + 61);
  ctx.fillStyle = '#A5F3FC'; ctx.fillText('24/7', x + 70, y + 59);
  // A neon pill, tipped up, and a sparkle off it
  ctx.save(); ctx.translate(x + 158, y + 34); ctx.rotate(-0.5);
  ctx.fillStyle = '#F472B6'; ctx.beginPath(); ctx.roundRect(-16, -8, 16, 16, [8, 0, 0, 8]); ctx.fill();
  ctx.fillStyle = '#FDE047'; ctx.beginPath(); ctx.roundRect(0, -8, 16, 16, [0, 8, 8, 0]); ctx.fill();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(-16, -8, 32, 16, 8); ctx.stroke();
  ctx.restore();
  const tw = (Math.sin(f * 0.15) + 1) / 2;
  ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + tw * 0.6})`;
  ctx.beginPath(); ctx.moveTo(x + 172, y + 8 - tw * 4); ctx.lineTo(x + 174, y + 14); ctx.lineTo(x + 180 + tw * 4, y + 16); ctx.lineTo(x + 174, y + 18); ctx.lineTo(x + 172, y + 24 + tw * 4); ctx.lineTo(x + 170, y + 18); ctx.lineTo(x + 164 - tw * 4, y + 16); ctx.lineTo(x + 170, y + 14); ctx.fill();
  // The starburst, and the fine print
  ctx.save(); ctx.translate(x + 158, y + 70); ctx.rotate(Math.sin(f * 0.05) * 0.1);
  ctx.fillStyle = '#EF4444'; ctx.beginPath();
  for (let k = 0; k < 20; k++) { const r = k % 2 ? 13 : 21, a = (k * Math.PI) / 10; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  ctx.fill();
  ctx.fillStyle = '#FEF08A'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.fillText('NO', 0, -1); ctx.fillText('ID!', 0, 7);
  ctx.restore();
  ctx.fillStyle = '#C4B5FD'; ctx.font = '5px "Press Start 2P"'; ctx.fillText('*EXCEPT DURING RAIDS', x + 70, y + 82);
  ctx.textAlign = 'left';
};

// ---------------------------------------------------------------------------
// Over the terrain: the props, the ninja, the cab, the sheriff
// ---------------------------------------------------------------------------

export const drawTownMid = (ctx: Ctx, state: GameState, rt: DaleRuntime) => {
  const town = rt.town;
  const f = state.frame;
  for (const pr of town.props) if (visible(state, pr.x - 60, pr.x + 60)) drawProp(ctx, pr, f);
  drawNinja(ctx, state, town);
  const cab = town.cab;
  if (cab.state !== 'wrecked' && visible(state, cab.x - 40, cab.x + CAB.w + 40)) {
    const parked = cab.state === 'parked';
    ctx.save();
    if (cab.state === 'spin') { ctx.translate(cab.x + CAB.w / 2, 0); ctx.scale(Math.cos(cab.spin * Math.PI), 1); ctx.translate(-(cab.x + CAB.w / 2), 0); }
    // (Riggs slumped over the wheel from the highway till his second wind)
    const slumped = cab.state === 'arrive' || (parked && town.phase === 'street');
    drawCab(ctx, cab.x, cab.facing, f, false, parked ? 0.1 : 0, wheelTurn(cab.x * cab.facing, cabSpeed(cab) * cab.facing, 26, f), slumped, town.gore);
    ctx.restore();
    ctx.save();
    ctx.restore();
    if (parked && f % 5 === 0) state.particles.push({ pos: { x: cab.x + 20, y: Y - CAB.h + 40 }, vel: { x: 0.3, y: -1 }, life: 40, color: '#57534E', size: 8 });
  }
  // The tourists
  for (const e of town.tourists) {
    if (!visible(state, e.pos.x - 30, e.pos.x + 60)) continue;
    ctx.save(); ctx.translate(e.pos.x + e.width / 2, Y); ctx.scale(e.facing ?? 1, 1); drawDaleKind(ctx, e, f + (e.homeX ?? 0), state); ctx.restore();
  }
  if (town.arrive) drawArrival(ctx, state, town);
  // The "sheriff", till he's off
  const s = town.sheriff;
  if (visible(state, s.x - 40, s.x + 40) && s.x < COURSE.town.x2 - 200) drawSheriff(ctx, s.x, f, s.running);
};

/** Meathead coming in on top of the cab (hanging on for dear life), flung off it, face down on the street. */
const drawArrival = (ctx: Ctx, state: GameState, town: Town) => {
  const a = town.arrive!;
  const p = state.player;
  const riding = town.cab.state === 'arrive';
  const down = a.landedAt >= 0 && a.h <= 0 && a.vh === 0;
  const body = { ...p, pos: { x: -1e6, y: -1e6 }, hidden: false, isGrounded: riding, vel: { x: riding ? -2 : 3, y: riding ? 0 : 4 }, facing: -1 as const, isCharging: false, isSliding: false, isUppercutting: false, isDivekicking: false, isDucking: riding, invincibilityTimer: 0, hurtTimer: riding ? 0 : 30, pushbackTimer: riding ? 0 : 30 };
  ctx.save();
  const rot = down ? Math.PI / 2 : a.rot;
  ctx.translate(a.x + (riding ? Math.sin(state.frame * 0.9) * 2 : 0), Y - a.h - (down ? 14 : p.height / 2));
  ctx.rotate(rot);
  ctx.translate(-(body.pos.x + body.width / 2), -(body.pos.y + body.height / 2));
  drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
  ctx.restore();
  // (seeing stars, lying there)
  if (down) for (let k = 0; k < 3; k++) { const ang = state.frame * 0.12 + (k * Math.PI * 2) / 3; ctx.fillStyle = '#FDE047'; ctx.font = 'bold 10px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('*', a.x + 20 + Math.cos(ang) * 18, Y - 30 + Math.sin(ang) * 6); ctx.textAlign = 'left'; }
};

/** A bobtail tractor (Riggs's), facing `facing`, its back end at x; wrecked, or tilted a touch. */
/** How fast the cab's going, px a frame (+ right): backing out of the wall, creeping round, then flat out. */
const cabSpeed = (cab: Town['cab']) =>
  cab.state === 'reverse' ? 3.5 : cab.state === 'spin' || (cab.state === 'go' && cab.speed === 0) ? 1 : cab.state === 'parked' || cab.state === 'wrecked' ? 0 : cab.speed;

export const drawCab = (ctx: Ctx, x: number, facing: 1 | -1, f: number, wrecked: boolean, tilt: number, roll = 0, slumped = false, gore = 0) => {
  ctx.save();
  ctx.translate(x + CAB.w / 2, Y);
  ctx.scale(facing, 1);
  ctx.rotate(tilt * (wrecked ? -1 : 1));
  ctx.translate(-CAB.w / 2, 0);
  const h = CAB.h;
  if (wrecked) ctx.filter = 'brightness(0.35) sepia(0.6)';
  const body = ctx.createLinearGradient(0, -h, 0, 0);
  body.addColorStop(0, '#DC2626'); body.addColorStop(0.6, '#991B1B'); body.addColorStop(1, '#7F1D1D');
  // Sleeper and cab
  ctx.fillStyle = body; ctx.fillRect(0, -h, 130, h - 36);
  ctx.strokeStyle = '#450A0A'; ctx.lineWidth = 3; ctx.strokeRect(0, -h, 130, h - 36);
  ctx.fillStyle = '#FDE047'; ctx.fillRect(4, -h + 90, 122, 4);
  // Windshield (the driver: Riggs, bandaged and bloody and grinning)
  ctx.fillStyle = '#1E3A5F'; ctx.fillRect(84, -h + 16, 40, 44);
  if (!wrecked && slumped) {
    // Face down on the wheel, the hole in his head
    ctx.fillStyle = '#E0AC69'; ctx.beginPath(); ctx.arc(110, -h + 52, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1E3A8A'; ctx.fillRect(100, -h + 44, 20, 5); ctx.fillStyle = '#B91C1C'; ctx.fillRect(104, -h + 46, 6, 6);
    ctx.fillStyle = '#44403C'; ctx.fillRect(98, -h + 56, 24, 3); // the wheel
    ctx.fillStyle = 'rgba(185, 28, 28, 0.7)'; ctx.fillRect(86, -h + 20, 5, 18); ctx.fillRect(96, -h + 26, 3, 12); // on the glass
  } else if (!wrecked) {
    ctx.fillStyle = '#E0AC69'; ctx.beginPath(); ctx.arc(104, -h + 40, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(94, -h + 30, 20, 5); ctx.fillStyle = '#B91C1C'; ctx.fillRect(98, -h + 30, 6, 5); // the bandage, the blood
    ctx.fillStyle = '#1E3A8A'; ctx.fillRect(94, -h + 26, 20, 5);
    ctx.fillStyle = '#5B3413'; ctx.fillRect(100, -h + 44, 12, 3);
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(101, -h + 47, 8, 2); // the grin
  }
  // Stacks, smoke
  ctx.fillStyle = '#D1D5DB'; ctx.fillRect(70, -h - 50, 9, 50);
  if (!wrecked) for (let i = 0; i < 3; i++) { const t = ((f * 3 + i * 13) % 40) / 40; ctx.fillStyle = `rgba(30,30,30,${0.55 * (1 - t)})`; ctx.beginPath(); ctx.arc(74 - t * 40, -h - 56 - t * 30, 6 + t * 12, 0, Math.PI * 2); ctx.fill(); }
  // Hood, grille, bumper, a blazing headlight
  ctx.fillStyle = body; ctx.fillRect(130, -h + 70, CAB.w - 130, h - 106);
  ctx.strokeStyle = '#450A0A'; ctx.strokeRect(130, -h + 70, CAB.w - 130, h - 106);
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(CAB.w - 12, -h + 78, 12, 60);
  ctx.fillStyle = '#D1D5DB'; ctx.fillRect(CAB.w - 20, -46, 26, 12);
  if (!wrecked) { ctx.fillStyle = '#FEF08A'; ctx.fillRect(CAB.w - 6, -h + 74, 8, 10); const beam = ctx.createLinearGradient(CAB.w, 0, CAB.w + 160, 0); beam.addColorStop(0, 'rgba(255,244,180,0.5)'); beam.addColorStop(1, 'rgba(255,244,180,0)'); ctx.fillStyle = beam; ctx.beginPath(); ctx.moveTo(CAB.w, -h + 74); ctx.lineTo(CAB.w + 160, -h + 50); ctx.lineTo(CAB.w + 160, -h + 120); ctx.lineTo(CAB.w, -h + 84); ctx.fill(); }
  // No trailer on it: the frame rails out the back, the fifth wheel (the coupling plate) bare on top of them, mud flaps
  ctx.fillStyle = '#27272A'; ctx.fillRect(-78, -58, 80, 12);
  ctx.fillStyle = '#52525B'; ctx.fillRect(-66, -68, 58, 10);
  ctx.fillStyle = '#71717A'; ctx.beginPath(); ctx.moveTo(-66, -68); ctx.lineTo(-8, -68); ctx.lineTo(-14, -74); ctx.lineTo(-60, -74); ctx.fill();
  ctx.fillStyle = '#18181B'; ctx.fillRect(-72, -71, 18, 5); // the slot the kingpin goes in
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-20, -66, 6, 4);
  ctx.fillStyle = '#18181B'; ctx.fillRect(-82, -50, 8, 36);
  // What's left of the tourists, on the front of it
  if (gore > 0) {
    ctx.fillStyle = `rgba(153, 27, 27, ${0.5 + gore * 0.4})`;
    for (let k = 0; k < Math.ceil(gore * 12); k++) ctx.fillRect(CAB.w - 30 + ((k * 7) % 24), -h + 60 + ((k * 23) % 110), 5 + (k % 3) * 3, 6 + (k % 4) * 6);
    ctx.fillRect(CAB.w - 24, -40, 24, 8 * gore);
    if (gore > 0.3) { ctx.fillStyle = '#F8FAFC'; ctx.fillRect(CAB.w - 18, -h + 120, 10, 4); } // a sandal, stuck in the grille
    if (gore > 0.6) { ctx.fillStyle = '#D6B98C'; ctx.beginPath(); ctx.ellipse(CAB.w - 10, -h + 76, 12, 3, 0.3, 0, Math.PI * 2); ctx.fill(); } // a hat
  }
  // Wheels (the two drive axles under the fifth wheel, the steer axle up front)
  for (const wx of [-50, 6, CAB.w - 40]) {
    ctx.fillStyle = '#111111'; ctx.beginPath(); ctx.arc(wx, -26, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#9CA3AF'; ctx.beginPath(); ctx.arc(wx, -26, 12, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#4B5563'; ctx.lineWidth = 3; for (let k = 0; k < 5; k++) { const a = roll + k * 1.26; ctx.beginPath(); ctx.moveTo(wx, -26); ctx.lineTo(wx + Math.cos(a) * 11, -26 + Math.sin(a) * 11); ctx.stroke(); }
  }
  ctx.restore();
};

const drawProp = (ctx: Ctx, pr: TownProp, f: number) => {
  ctx.save();
  ctx.translate(pr.x, pr.y);
  if (pr.flying) ctx.rotate(pr.rot);
  switch (pr.look) {
    case 'barrel':
      ctx.fillStyle = '#8B5A2B'; ctx.beginPath(); ctx.ellipse(0, -24, 16, 24, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#374151'; ctx.fillRect(-16, -38, 32, 3); ctx.fillRect(-16, -12, 32, 3);
      break;
    case 'cutout':
      // A cardboard cowboy with a hole for your face
      ctx.fillStyle = '#6B4423'; ctx.fillRect(-4, -20, 8, 20);
      ctx.fillStyle = '#D6B98C'; ctx.fillRect(-26, -110, 52, 92);
      ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.ellipse(0, -118, 32, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-16, -134, 32, 16);
      ctx.fillStyle = '#0C0A09'; ctx.beginPath(); ctx.arc(0, -96, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(-10, -70, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7F1D1D'; ctx.font = '4px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('SHERIFF DAN', 0, -50); ctx.textAlign = 'left';
      break;
    case 'wagon':
      ctx.fillStyle = '#8B5A2B'; ctx.fillRect(-60, -44, 120, 24);
      ctx.fillStyle = '#F5F0E1'; ctx.beginPath(); ctx.moveTo(-56, -44); ctx.quadraticCurveTo(0, -110, 56, -44); ctx.fill();
      ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 2; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(k * 22, -44); ctx.quadraticCurveTo(k * 18, -86, k * 14, -94); ctx.stroke(); }
      for (const wx of [-40, 40]) { ctx.strokeStyle = '#5A3A1A'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(wx, -18, 18, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 2; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(wx, -18); ctx.lineTo(wx + Math.cos(k) * 18, -18 + Math.sin(k) * 18); ctx.stroke(); } }
      break;
    case 'hay':
      ctx.fillStyle = '#EAB308'; ctx.fillRect(-26, -34, 52, 34); ctx.fillStyle = '#CA8A04'; for (let k = 0; k < 5; k++) ctx.fillRect(-24 + k * 11, -34, 2, 34); ctx.fillStyle = '#A16207'; ctx.fillRect(-26, -22, 52, 3);
      break;
    case 'wanted':
      ctx.fillStyle = '#6B4423'; ctx.fillRect(-4, -90, 8, 90);
      ctx.fillStyle = '#FEF3C7'; ctx.fillRect(-30, -150, 60, 70);
      ctx.fillStyle = '#1C1917'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('WANTED', 0, -138);
      ctx.fillStyle = '#E0AC69'; ctx.beginPath(); ctx.arc(0, -118, 10, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#1C1917'; ctx.fillRect(-10, -124, 20, 4);
      ctx.font = '4px "Press Start 2P"'; ctx.fillText('MEATHEAD', 0, -98); ctx.fillText('$5 OBO', 0, -90); ctx.textAlign = 'left';
      break;
    case 'trough':
      ctx.fillStyle = '#6B4423'; ctx.fillRect(-40, -26, 80, 26); ctx.fillStyle = '#60A5FA'; ctx.fillRect(-36, -24, 72, 6);
      break;
  }
  ctx.restore();
  void f;
};

/** The ninja: in black up the tower with his rifle; standing to say his piece; kneeling; face down. */
const drawNinja = (ctx: Ctx, state: GameState, town: Town) => {
  const n = town.ninja;
  const s = ninjaSpot();
  if (!visible(state, s.x - 60, s.x + 60)) return;
  const f = state.frame;
  // (turned to Meathead when he got up there, and that's the way he stays, speech to seppuku to face down)
  ctx.save(); ctx.translate(s.x, s.y); ctx.scale(n.state === 'perch' ? -1 : n.face, 1);
  const black = '#111827', dark = '#1F2937';
  if (n.state === 'perch') {
    // Prone-ish, kneeling behind the rifle, sighting down the street
    ctx.fillStyle = black; ctx.fillRect(-12, -26, 24, 14); ctx.fillRect(-18, -12, 30, 12);
    ctx.beginPath(); ctx.arc(8, -32, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#E0AC69'; ctx.fillRect(10, -34, 6, 3);
    ctx.fillStyle = '#DC2626'; ctx.fillRect(-2, -38, 12, 3); ctx.fillRect(-8, -38 + Math.sin(f * 0.2) * 2, 8, 2); // headband, trailing
    ctx.fillStyle = '#3F3F46'; ctx.fillRect(4, -24, 50, 4); ctx.fillStyle = '#18181B'; ctx.fillRect(20, -28, 12, 4); ctx.fillRect(50, -26, 8, 8);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.8)'; ctx.fillRect(58, -23, 2, 2);
  } else {
    const kneel = n.state !== 'speech';
    const slump = n.state === 'dead' ? 1 : n.state === 'kneel' ? Math.min(1, Math.max(0, (n.t - NINJA_CUT - 10) / (NINJA_DONE - NINJA_CUT - 10))) : 0;
    ctx.rotate(slump * 1.2);
    if (!kneel) { ctx.fillStyle = dark; ctx.fillRect(-8, -30, 7, 30); ctx.fillRect(2, -30, 7, 30); }
    else { ctx.fillStyle = dark; ctx.fillRect(-12, -14, 26, 14); }
    const top = kneel ? -44 : -60;
    ctx.fillStyle = black; ctx.fillRect(-10, top, 20, 30);
    ctx.beginPath(); ctx.arc(0, top - 8, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#E0AC69'; ctx.fillRect(1, top - 11, 7, 3);
    ctx.fillStyle = '#DC2626'; ctx.fillRect(-9, top - 15, 18, 3);
    if (n.state === 'kneel' || n.state === 'dead') {
      // The short blade, and what it's done
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(4, top + 18, 14, 2); ctx.fillStyle = '#7F1D1D'; ctx.fillRect(2, top + 16, 5, 6);
      if (n.t > NINJA_CUT || n.state === 'dead') { ctx.fillStyle = '#991B1B'; ctx.beginPath(); ctx.ellipse(6, 0, 18 + Math.min(20, n.t * 0.2), 3, 0, 0, Math.PI * 2); ctx.fill(); }
    } else {
      // Bowing, hands together
      ctx.fillStyle = '#E0AC69'; ctx.fillRect(8, top + 10, 6, 6);
    }
    // His rifle, laid down
    ctx.fillStyle = '#3F3F46'; ctx.fillRect(-40, -3, 44, 3);
  }
  ctx.restore();
};

/** The "sheriff": a costume badge, a big hat, a mustache; running for it (arms up) once Riggs shows up. */
const drawSheriff = (ctx: Ctx, x: number, f: number, running: boolean) => {
  ctx.save(); ctx.translate(x, Y);
  const s = running ? Math.sin(f * 0.5) * 7 : 0;
  ctx.fillStyle = '#44403C'; ctx.fillRect(-8 + s, -28, 7, 28); ctx.fillRect(2 - s, -28, 7, 28);
  ctx.fillStyle = '#5B3417'; ctx.fillRect(-9 + s, -6, 9, 6); ctx.fillRect(1 - s, -6, 9, 6);
  ctx.fillStyle = '#F5F5F4'; ctx.fillRect(-11, -56, 22, 30); ctx.fillStyle = '#6B4423'; ctx.fillRect(-11, -56, 7, 30); ctx.fillRect(4, -56, 7, 30);
  ctx.fillStyle = '#FACC15'; ctx.beginPath(); for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k * 4 * Math.PI) / 5; ctx.lineTo(-7 + Math.cos(a) * 4, -46 + Math.sin(a) * 4); } ctx.fill();
  ctx.fillStyle = '#F2C9A0'; ctx.beginPath(); ctx.arc(1, -64, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3F2410'; ctx.fillRect(-2, -62, 10, 3);
  ctx.fillStyle = '#D6B98C'; ctx.beginPath(); ctx.ellipse(1, -70, 15, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-7, -79, 16, 9);
  ctx.fillStyle = '#F2C9A0';
  if (running) { ctx.fillRect(-12, -76 + s, 4, 18); ctx.fillRect(8, -76 - s, 4, 18); } else { ctx.fillRect(10, -52, 4, 14); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(12, -40, 6, 4); } // (the keys)
  ctx.restore();
};

// ---------------------------------------------------------------------------
// In front of everything: the crosshair, what people are saying
// ---------------------------------------------------------------------------

export const drawTownFront = (ctx: Ctx, state: GameState, rt: DaleRuntime) => {
  const town = rt.town;
  const f = state.frame;
  const sn = town.sniper;
  const spot = ninjaSpot();
  if (sn.on) {
    const lock = sn.state === 'lock';
    const k = lock ? sn.t / 46 : 0;
    // The laser from up the tower to the crosshair (all of it's the line of fire; the crosshair's where it stops),
    // blinking: slowly while it's looking for him, fast once it's locked
    const m = muzzle(), end = laserEnd(sn);
    const on = lock ? Math.floor(f / 3) % 2 === 0 : Math.floor(f / 12) % 3 !== 0;
    ctx.lineCap = 'round';
    ctx.strokeStyle = `rgba(239, 68, 68, ${on ? (lock ? 0.35 + k * 0.3 : 0.28) : 0.08})`; ctx.lineWidth = lock ? 10 : 7;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    ctx.strokeStyle = on ? (lock ? '#FECACA' : '#F87171') : 'rgba(248, 113, 113, 0.35)'; ctx.lineWidth = lock ? 3 : 2;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    ctx.lineCap = 'butt';
    // The crosshair
    const r = lock ? 34 + (1 - k) * 20 : 34;
    ctx.save(); ctx.translate(sn.x, sn.y);
    if (lock) ctx.rotate(k * Math.PI);
    ctx.strokeStyle = lock ? (f % 6 < 3 ? '#EF4444' : '#FCA5A5') : 'rgba(248, 250, 252, 0.85)'; ctx.lineWidth = lock ? 3 : 2;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r - 10, 0); ctx.lineTo(-8, 0); ctx.moveTo(8, 0); ctx.lineTo(r + 10, 0); ctx.moveTo(0, -r - 10); ctx.lineTo(0, -8); ctx.moveTo(0, 8); ctx.lineTo(0, r + 10); ctx.stroke();
    ctx.fillStyle = lock ? '#EF4444' : 'rgba(248,250,252,0.85)'; ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (lock && Math.floor(f / 5) % 2 === 0) { ctx.fillStyle = '#EF4444'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('LOCKED', sn.x, sn.y - r - 16); ctx.textAlign = 'left'; }
  }
  // The shot: a white flash across the screen, a fat tracer down from the tower with the air ripping open around it
  // in rings, a muzzle blast up there, a shock ring where it went in
  const ls = sn.lastShot;
  const since = ls ? f - ls.t : 999;
  if (ls && since < 22) {
    const m = muzzle();
    const fade = 1 - since / 22;
    if (since < 3) { ctx.fillStyle = `rgba(255, 255, 255, ${0.55 - since * 0.15})`; ctx.fillRect(state.camera.x, state.camera.y, CANVAS_WIDTH, CANVAS_HEIGHT); }
    ctx.lineCap = 'round';
    ctx.strokeStyle = `rgba(253, 186, 116, ${0.45 * fade})`; ctx.lineWidth = 18 * fade + 2;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(ls.x, ls.y); ctx.stroke();
    ctx.strokeStyle = `rgba(254, 240, 138, ${fade})`; ctx.lineWidth = 6 * fade + 1;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(ls.x, ls.y); ctx.stroke();
    ctx.strokeStyle = `rgba(255, 255, 255, ${fade})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(ls.x, ls.y); ctx.stroke();
    ctx.lineCap = 'butt';
    // The shock rings along its path
    const ang = Math.atan2(ls.y - m.y, ls.x - m.x);
    for (let i = 1; i <= 6; i++) {
      const u = i / 7, rx = m.x + (ls.x - m.x) * u, ry = m.y + (ls.y - m.y) * u;
      ctx.save(); ctx.translate(rx, ry); ctx.rotate(ang);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * fade})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, 0, 4 + since * 0.6, 8 + since * 2.4, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    // The muzzle blast
    if (since < 8) { ctx.fillStyle = `rgba(255, 247, 200, ${1 - since / 8})`; ctx.beginPath(); ctx.arc(m.x - 10, m.y, 26 - since * 2, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(m.x, m.y - 6); ctx.lineTo(m.x - 70 + since * 6, m.y); ctx.lineTo(m.x, m.y + 6); ctx.fill(); }
    // Where it went in
    if (!ls.covered) {
      ctx.strokeStyle = `rgba(254, 215, 170, ${fade})`; ctx.lineWidth = 4 * fade + 1;
      ctx.beginPath(); ctx.arc(ls.x, ls.y, 10 + since * 5, 0, Math.PI * 2); ctx.stroke();
      if (since < 5) { ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(ls.x, ls.y, 16 - since * 2, 0, Math.PI * 2); ctx.fill(); }
    }
  }
  // Bubbles
  const nt = saying(rt.talk, 'ninja'); if (nt) drawBubble(ctx, spot.x, spot.y - 80, nt, '#F1F5F9');
  const rt2 = saying(rt.talk, 'riggs'); if (rt2) drawBubble(ctx, town.cab.x + CAB.w / 2, Y - CAB.h - 70, rt2, '#FEF3C7');
  const pt = saying(rt.talk, 'prisoner'); if (pt) drawBubble(ctx, COURSE.town.jail.x1 + 170, Y - 250, pt, '#F8FAFC');
  const st = saying(rt.talk, 'sheriff'); if (st) drawBubble(ctx, town.sheriff.x, Y - 100, st, '#FEF9C3');
};

// ---------------------------------------------------------------------------
// Screen space: INCOMING
// ---------------------------------------------------------------------------

export const drawTownHud = (ctx: Ctx, state: GameState, rt: DaleRuntime) => {
  // The jail scene can be skipped
  const tw = rt.town;
  if (tw.phase === 'jail' && tw.crashedAt < 0 && tw.t > JAIL_SKIP_AFTER) drawSkipPrompt(ctx, CANVAS_WIDTH);
  const inc = incoming(state, rt.town);
  if (!inc) return;
  const f = state.frame;
  const W = CANVAS_WIDTH;
  ctx.save();
  // Flashing warnings down both sides
  if (Math.floor(f / 8) % 2 === 0) {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)'; ctx.fillRect(0, 0, 40, CANVAS_HEIGHT); ctx.fillRect(W - 40, 0, 40, CANVAS_HEIGHT);
    ctx.textAlign = 'center'; ctx.font = 'bold 26px "Press Start 2P"';
    ctx.fillStyle = '#000'; ctx.fillText('!! INCOMING !!', W / 2 + 3, 113); ctx.fillStyle = '#EF4444'; ctx.fillText('!! INCOMING !!', W / 2, 110);
  }
  // The meter: the cab closing on him, the zone where it's time to go up
  const L = 200, R = 600, y = 140;
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(L - 10, y - 10, R - L + 20, 36);
  ctx.fillStyle = '#374151'; ctx.fillRect(L, y, R - L, 16);
  ctx.fillStyle = 'rgba(34, 197, 94, 0.7)'; ctx.fillRect(L + (R - L) * inc.zone[0], y, (R - L) * (inc.zone[1] - inc.zone[0]), 16);
  ctx.fillStyle = '#EF4444'; ctx.fillRect(L, y, (R - L) * inc.k, 16);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(L + (R - L) * inc.k - 3, y - 6, 6, 28);
  if (inc.jump) {
    ctx.textAlign = 'center'; ctx.font = 'bold 22px "Press Start 2P"';
    ctx.fillStyle = '#000'; ctx.fillText('BOOST JUMP!', W / 2 + 3, y + 63); ctx.fillStyle = f % 6 < 3 ? '#22C55E' : '#BBF7D0'; ctx.fillText('BOOST JUMP!', W / 2, y + 60);
  }
  ctx.restore();
};
